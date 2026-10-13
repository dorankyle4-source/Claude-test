import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createConversationStore, runTurn, publicView, ConversationError } from '../server/conversations.js';
import { createMockProvider } from '../server/ai/mock.js';
import { ProviderError, ErrorCodes } from '../server/ai/errors.js';

const fast = (reply) => createMockProvider({ reply, delayMs: 0 });

test('a turn records the question and the answer and streams deltas', async () => {
  const store = createConversationStore();
  const conversation = store.create();
  const deltas = [];
  const { turn } = await runTurn({
    conversation,
    provider: fast(() => 'Two plus two is four.'),
    text: '  What is 2+2?  ',
    onText: (d) => deltas.push(d),
  });
  assert.equal(turn.text, 'Two plus two is four.');
  assert.equal(deltas.join(''), 'Two plus two is four.');
  assert.deepEqual(
    conversation.turns.map((t) => [t.role, t.text]),
    [
      ['user', 'What is 2+2?'],
      ['assistant', 'Two plus two is four.'],
    ],
  );
  assert.equal(conversation.busy, false);
});

test('the provider sees the whole history and the frozen system prompt', async () => {
  const store = createConversationStore();
  const conversation = store.create();
  let seen;
  const provider = {
    name: 'spy',
    status: () => ({ ready: true }),
    async streamReply(args) {
      seen = args;
      return { text: 'ok', native: null, stopReason: 'end_turn' };
    },
  };
  await runTurn({ conversation, provider, text: 'first' });
  await runTurn({ conversation, provider, text: 'second' });
  assert.equal(seen.system, conversation.system);
  assert.match(seen.system, /Vector/);
  assert.deepEqual(seen.history.map((t) => t.text), ['first', 'ok', 'second']);
});

test('rejects empty and over-long messages without touching history', async () => {
  const conversation = createConversationStore().create();
  await assert.rejects(runTurn({ conversation, provider: fast(), text: '   ' }), ConversationError);
  await assert.rejects(runTurn({ conversation, provider: fast(), text: 'x'.repeat(8001) }), /limited/);
  assert.equal(conversation.turns.length, 0);
});

test('rejects a second question while one is being answered', async () => {
  const conversation = createConversationStore().create();
  const first = runTurn({ conversation, provider: createMockProvider({ delayMs: 5 }), text: 'one' });
  await assert.rejects(runTurn({ conversation, provider: fast(), text: 'two' }), (err) => err.code === 'busy');
  await first;
});

test('stopping mid-answer keeps the partial answer, marked as interrupted', async () => {
  const conversation = createConversationStore().create();
  const controller = new AbortController();
  const provider = createMockProvider({ reply: () => 'one two three four five six', delayMs: 5 });
  const result = runTurn({
    conversation,
    provider,
    text: 'count',
    signal: controller.signal,
    onText: (d) => d.startsWith('two') && controller.abort(),
  });
  const { turn, stopReason } = await result;
  assert.equal(stopReason, 'interrupted');
  assert.equal(turn.interrupted, true);
  assert.equal(turn.text, 'one two …');
  assert.equal(conversation.turns.length, 2);
});

test('a failed answer removes the unanswered question so it can be retried', async () => {
  const conversation = createConversationStore().create();
  const provider = {
    name: 'broken',
    status: () => ({ ready: true }),
    async streamReply() {
      throw new ProviderError(ErrorCodes.NETWORK, 'offline');
    },
  };
  await assert.rejects(runTurn({ conversation, provider, text: 'hello' }), /offline/);
  assert.equal(conversation.turns.length, 0);
  assert.equal(conversation.busy, false);
});

test('publicView never exposes provider-native content', async () => {
  const conversation = createConversationStore().create();
  conversation.turns.push({ role: 'assistant', text: 'hi', native: { secret: true }, createdAt: 'now' });
  const view = publicView(conversation);
  assert.equal(JSON.stringify(view).includes('secret'), false);
  assert.equal(JSON.stringify(view).includes('Vector, an original'), false);
});
