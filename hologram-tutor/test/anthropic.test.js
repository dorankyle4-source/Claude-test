import { test } from 'node:test';
import assert from 'node:assert/strict';
import Anthropic from '@anthropic-ai/sdk';
import { createAnthropicProvider, toClaudeMessages, toProviderError } from '../server/ai/anthropic.js';
import { ErrorCodes } from '../server/ai/errors.js';

const MODEL = 'claude-opus-5-5';

function fakeClient(message, { capture = {}, deltas = [] } = {}) {
  return {
    beta: {
      messages: {
        stream(params, options) {
          capture.params = params;
          capture.options = options;
          const listeners = {};
          return {
            on(event, fn) {
              listeners[event] = fn;
              return this;
            },
            async finalMessage() {
              for (const d of deltas) listeners.text?.(d);
              if (message instanceof Error) throw message;
              return message;
            },
          };
        },
      },
    },
  };
}

test('reports missing API key without throwing at startup', () => {
  const provider = createAnthropicProvider({ apiKey: null, model: MODEL, effort: 'medium' });
  const status = provider.status();
  assert.equal(status.ready, false);
  assert.equal(status.code, ErrorCodes.MISSING_API_KEY);
});

test('streamReply sends the expected request and returns text + native content', async () => {
  const capture = {};
  const content = [
    { type: 'thinking', thinking: '', signature: 'sig' },
    { type: 'text', text: 'Hello there.' },
  ];
  const client = fakeClient({ model: MODEL, content, stop_reason: 'end_turn' }, { capture, deltas: ['Hello ', 'there.'] });
  const provider = createAnthropicProvider({ apiKey: 'unused', model: MODEL, effort: 'low' }, { client });
  const deltas = [];
  const result = await provider.streamReply({
    system: 'SYS',
    history: [{ role: 'user', text: 'Hi' }],
    onText: (d) => deltas.push(d),
  });

  assert.equal(result.text, 'Hello there.');
  assert.deepEqual(deltas, ['Hello ', 'there.']);
  assert.deepEqual(result.native, { provider: 'anthropic', model: MODEL, content });
  assert.equal(capture.params.model, MODEL);
  assert.equal(capture.params.system, 'SYS');
  assert.deepEqual(capture.params.messages, [{ role: 'user', content: 'Hi' }]);
  assert.equal(capture.params.thinking.type, 'adaptive');
  assert.deepEqual(capture.params.output_config, { effort: 'low' });
  assert.equal(capture.params.fallbacks, 'default');
  assert.ok(capture.params.betas.includes('server-side-fallback-2026-07-01'));
});

test('a refusal becomes a friendly REFUSED error', async () => {
  const client = fakeClient({ model: MODEL, content: [], stop_reason: 'refusal' });
  const provider = createAnthropicProvider({ apiKey: 'x', model: MODEL, effort: 'medium' }, { client });
  await assert.rejects(provider.streamReply({ system: '', history: [] }), (err) => err.code === ErrorCodes.REFUSED);
});

test('toClaudeMessages replays same-model assistant turns verbatim and falls back to text otherwise', () => {
  const blocks = [{ type: 'text', text: 'native' }];
  const history = [
    { role: 'user', text: 'q1' },
    { role: 'assistant', text: 'a1', native: { provider: 'anthropic', model: MODEL, content: blocks } },
    { role: 'user', text: 'q2' },
    { role: 'assistant', text: 'a2', native: { provider: 'anthropic', model: 'other-model', content: blocks } },
    { role: 'user', text: 'q3' },
    { role: 'assistant', text: 'partial …', native: null, interrupted: true },
    { role: 'user', text: 'q4' },
  ];
  assert.deepEqual(toClaudeMessages(history, MODEL), [
    { role: 'user', content: 'q1' },
    { role: 'assistant', content: blocks },
    { role: 'user', content: 'q2' },
    { role: 'assistant', content: 'a2' },
    { role: 'user', content: 'q3' },
    { role: 'assistant', content: 'partial …' },
    { role: 'user', content: 'q4' },
  ]);
});

test('SDK errors map to stable, user-friendly codes', () => {
  const headers = new Headers();
  const cases = [
    [new Anthropic.AuthenticationError(401, {}, 'bad key', headers), ErrorCodes.INVALID_API_KEY],
    [new Anthropic.RateLimitError(429, {}, 'slow down', headers), ErrorCodes.RATE_LIMITED],
    [new Anthropic.InternalServerError(529, {}, 'overloaded', headers), ErrorCodes.PROVIDER_UNAVAILABLE],
    [new Anthropic.BadRequestError(400, {}, 'nope', headers), ErrorCodes.BAD_REQUEST],
    [new Anthropic.APIConnectionError({ message: 'down' }), ErrorCodes.NETWORK],
    [new Anthropic.APIUserAbortError(), ErrorCodes.ABORTED],
    [new Error('weird'), ErrorCodes.UNKNOWN],
  ];
  for (const [err, code] of cases) assert.equal(toProviderError(err).code, code, err.constructor.name);
});

test('an abort signal always maps to ABORTED', () => {
  const controller = new AbortController();
  controller.abort();
  assert.equal(toProviderError(new Error('anything'), controller.signal).code, ErrorCodes.ABORTED);
});
