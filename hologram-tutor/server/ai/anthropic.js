// Claude provider: streams a reply through the official Anthropic SDK.
//
// Every provider implements the same shape:
//   status()                                   -> { ready, reason }
//   streamReply({ system, history, signal, onText }) -> { text, native, stopReason }
// `history` is the app's own message list; `native` is whatever the provider
// wants stored so the turn can be replayed verbatim next time.

import Anthropic from '@anthropic-ai/sdk';
import { ProviderError, ErrorCodes } from './errors.js';

const BETAS = [
  // Re-run a safety-declined request on Anthropic's recommended fallback model.
  'server-side-fallback-2026-07-01',
  // If replayed thinking blocks ever stop matching the history, drop them
  // instead of failing the whole request.
  'thinking-binding-controls-2026-08-01',
];

export function createAnthropicProvider({ apiKey, model, effort }, { client } = {}) {
  const sdk = client ?? (apiKey ? new Anthropic({ apiKey, maxRetries: 2 }) : null);

  return {
    name: 'anthropic',
    model,

    status() {
      if (!sdk) {
        return {
          ready: false,
          code: ErrorCodes.MISSING_API_KEY,
          reason: 'No ANTHROPIC_API_KEY is set. Add it to hologram-tutor/.env and restart the server.',
        };
      }
      return { ready: true };
    },

    async streamReply({ system, history, signal, onText }) {
      if (!sdk) throw new ProviderError(ErrorCodes.MISSING_API_KEY, this.status().reason);

      const stream = sdk.beta.messages.stream(
        {
          model,
          max_tokens: 64000,
          system,
          messages: toClaudeMessages(history, model),
          thinking: { type: 'adaptive', block_binding: { prefix_mismatch_behavior: 'drop_block' } },
          output_config: { effort },
          fallbacks: 'default',
          betas: BETAS,
        },
        { signal },
      );

      stream.on('text', (delta) => onText?.(delta));

      let message;
      try {
        message = await stream.finalMessage();
      } catch (err) {
        throw toProviderError(err, signal);
      }

      const text = message.content
        .filter((block) => block.type === 'text')
        .map((block) => block.text)
        .join('');

      if (message.stop_reason === 'refusal') {
        throw new ProviderError(
          ErrorCodes.REFUSED,
          "I can't help with that one. Try asking a different way or pick another topic.",
        );
      }

      return {
        text,
        // Store the full content (including thinking blocks) so later turns
        // can replay it unchanged, which keeps the prompt cache warm.
        native: { provider: 'anthropic', model: message.model, content: message.content },
        stopReason: message.stop_reason,
      };
    },
  };
}

// Convert the app's history into Claude messages. Assistant turns produced by
// this same model are replayed verbatim; anything else is sent as plain text.
export function toClaudeMessages(history, model) {
  return history.map((turn) => {
    if (
      turn.role === 'assistant' &&
      turn.native?.provider === 'anthropic' &&
      turn.native.model === model &&
      Array.isArray(turn.native.content)
    ) {
      return { role: 'assistant', content: turn.native.content };
    }
    return { role: turn.role, content: turn.text };
  });
}

export function toProviderError(err, signal) {
  if (signal?.aborted || err instanceof Anthropic.APIUserAbortError) {
    return new ProviderError(ErrorCodes.ABORTED, 'Stopped.', { cause: err });
  }
  if (err instanceof Anthropic.AuthenticationError || err instanceof Anthropic.PermissionDeniedError) {
    return new ProviderError(
      ErrorCodes.INVALID_API_KEY,
      'The Anthropic API rejected the API key. Check ANTHROPIC_API_KEY in .env and restart.',
      { cause: err },
    );
  }
  if (err instanceof Anthropic.RateLimitError) {
    return new ProviderError(ErrorCodes.RATE_LIMITED, 'Rate limited by the API. Wait a moment and try again.', {
      retryable: true,
      cause: err,
    });
  }
  if (err instanceof Anthropic.NotFoundError) {
    return new ProviderError(
      ErrorCodes.BAD_REQUEST,
      'The configured model was not found. Check ANTHROPIC_MODEL in .env.',
      { cause: err },
    );
  }
  if (err instanceof Anthropic.BadRequestError) {
    return new ProviderError(ErrorCodes.BAD_REQUEST, `The API rejected the request: ${err.message}`, { cause: err });
  }
  if (err instanceof Anthropic.InternalServerError || (err instanceof Anthropic.APIError && err.status >= 500)) {
    return new ProviderError(
      ErrorCodes.PROVIDER_UNAVAILABLE,
      'The AI service is temporarily unavailable. Try again in a moment.',
      { retryable: true, cause: err },
    );
  }
  if (err instanceof Anthropic.APIConnectionError) {
    return new ProviderError(ErrorCodes.NETWORK, "Couldn't reach the AI service. Check your internet connection.", {
      retryable: true,
      cause: err,
    });
  }
  return new ProviderError(ErrorCodes.UNKNOWN, `Unexpected error: ${err?.message ?? err}`, { cause: err });
}
