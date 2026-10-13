// Offline stand-in for a real AI provider. Used by the tests, and handy for
// trying the interface without an API key (AI_PROVIDER=mock).

import { ProviderError, ErrorCodes } from './errors.js';

export function createMockProvider({ reply, delayMs = 15 } = {}) {
  const makeReply =
    reply ??
    ((history) => {
      const last = history.at(-1)?.text ?? '';
      return (
        `This is the offline mock tutor. You said: "${last}". ` +
        'Set AI_PROVIDER=anthropic and add an API key to talk to the real model.'
      );
    });

  return {
    name: 'mock',
    model: 'mock',

    status() {
      return { ready: true };
    },

    async streamReply({ history, signal, onText }) {
      const full = makeReply(history);
      const words = full.split(/(?<=\s)/);
      let text = '';
      for (const word of words) {
        if (signal?.aborted) throw new ProviderError(ErrorCodes.ABORTED, 'Stopped.');
        if (delayMs) await new Promise((r) => setTimeout(r, delayMs));
        text += word;
        onText?.(word);
      }
      return { text, native: null, stopReason: 'end_turn' };
    },
  };
}
