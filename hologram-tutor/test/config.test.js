import { test } from 'node:test';
import assert from 'node:assert/strict';
import { loadConfig } from '../server/config.js';

test('defaults are sensible and local-only', () => {
  const config = loadConfig({});
  assert.equal(config.provider, 'anthropic');
  assert.equal(config.host, '127.0.0.1');
  assert.equal(config.port, 3000);
  assert.equal(config.anthropic.model, 'claude-opus-5-5');
  assert.equal(config.anthropic.apiKey, null);
});

test('rejects invalid settings with a clear message', () => {
  assert.throws(() => loadConfig({ AI_PROVIDER: 'other' }), /AI_PROVIDER/);
  assert.throws(() => loadConfig({ ANTHROPIC_EFFORT: 'turbo' }), /ANTHROPIC_EFFORT/);
  assert.throws(() => loadConfig({ PORT: 'abc' }), /PORT/);
});

test('blank API key counts as missing', () => {
  assert.equal(loadConfig({ ANTHROPIC_API_KEY: '   ' }).anthropic.apiKey, null);
});
