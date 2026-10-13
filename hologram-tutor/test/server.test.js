import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createApp } from '../server/app.js';
import { createMockProvider } from '../server/ai/mock.js';
import { createAnthropicProvider } from '../server/ai/anthropic.js';
import { loadConfig } from '../server/config.js';

async function listen(app) {
  return new Promise((resolve) => {
    const server = app.listen(0, '127.0.0.1', () => resolve(server));
  });
}

let server;
let base;

before(async () => {
  const config = loadConfig({});
  const app = createApp({
    provider: createMockProvider({ reply: () => 'Hello from the mock. Second sentence.', delayMs: 0 }),
    publicDir: config.publicDir,
    nodeModulesDir: config.nodeModulesDir,
  });
  server = await listen(app);
  base = `http://127.0.0.1:${server.address().port}`;
});

after(() => server.close());

const post = (path, body) =>
  fetch(base + path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) });

test('status reports provider, readiness and character', async () => {
  const status = await (await fetch(`${base}/api/status`)).json();
  assert.equal(status.provider, 'mock');
  assert.equal(status.ready, true);
  assert.equal(status.character.name, 'Vector');
});

test('a full conversation round-trip streams NDJSON and stores history', async () => {
  const conversation = await (await post('/api/conversations', {})).json();
  const res = await post(`/api/conversations/${conversation.id}/messages`, { text: 'Hi' });
  assert.equal(res.status, 200);
  assert.match(res.headers.get('content-type'), /ndjson/);
  const events = (await res.text()).trim().split('\n').map((l) => JSON.parse(l));
  const deltas = events.filter((e) => e.type === 'delta').map((e) => e.text).join('');
  assert.equal(deltas, 'Hello from the mock. Second sentence.');
  assert.equal(events.at(-1).type, 'done');

  const stored = await (await fetch(`${base}/api/conversations/${conversation.id}`)).json();
  assert.deepEqual(stored.turns.map((t) => t.role), ['user', 'assistant']);
});

test('empty question gets a 400 with a readable message', async () => {
  const conversation = await (await post('/api/conversations', {})).json();
  const res = await post(`/api/conversations/${conversation.id}/messages`, { text: '' });
  assert.equal(res.status, 400);
  assert.equal((await res.json()).error.code, 'empty_message');
});

test('unknown conversation is a 404', async () => {
  const res = await post('/api/conversations/nope/messages', { text: 'hi' });
  assert.equal(res.status, 404);
});

test('serves the web page and the vendored browser libraries', async () => {
  const page = await fetch(base + '/');
  assert.equal(page.status, 200);
  assert.match(await page.text(), /Hologram Tutor/);
  const marked = await fetch(base + '/vendor/marked/marked.esm.js');
  assert.equal(marked.status, 200);
  for (const lib of ['/vendor/three/build/three.module.js', '/vendor/three/addons/postprocessing/UnrealBloomPass.js']) {
    assert.equal((await fetch(base + lib)).status, 200, lib);
  }
  const secret = await fetch(base + '/vendor/marked/../../@anthropic-ai/sdk/package.json');
  assert.notEqual(secret.status, 200);
});

test('missing API key: status explains it and chat returns 503, never a crash', async () => {
  const app = createApp({ provider: createAnthropicProvider({ apiKey: null, model: 'claude-opus-5-5', effort: 'medium' }) });
  const s = await listen(app);
  const url = `http://127.0.0.1:${s.address().port}`;
  try {
    const status = await (await fetch(`${url}/api/status`)).json();
    assert.equal(status.ready, false);
    assert.equal(status.code, 'missing_api_key');
    const conv = await (await fetch(`${url}/api/conversations`, { method: 'POST' })).json();
    const res = await fetch(`${url}/api/conversations/${conv.id}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: 'hi' }),
    });
    assert.equal(res.status, 503);
    assert.equal((await res.json()).error.code, 'missing_api_key');
  } finally {
    s.close();
  }
});
