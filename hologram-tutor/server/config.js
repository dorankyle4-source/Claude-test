// Reads settings from environment variables (and a local .env file if present).
// Secrets live only on the server; nothing here is ever sent to the browser.

import { existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const PROJECT_ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const EFFORT_LEVELS = ['low', 'medium', 'high', 'xhigh', 'max'];

export function loadDotEnv(file = path.join(PROJECT_ROOT, '.env')) {
  // Built into Node >= 20.12; values already set in the real environment win.
  if (existsSync(file)) process.loadEnvFile(file);
}

export function loadConfig(env = process.env) {
  const provider = (env.AI_PROVIDER || 'anthropic').trim().toLowerCase();
  const effort = (env.ANTHROPIC_EFFORT || 'medium').trim().toLowerCase();
  const port = Number.parseInt(env.PORT || '3000', 10);

  if (!['anthropic', 'mock'].includes(provider)) {
    throw new Error(`AI_PROVIDER must be "anthropic" or "mock" (got "${provider}")`);
  }
  if (!EFFORT_LEVELS.includes(effort)) {
    throw new Error(`ANTHROPIC_EFFORT must be one of ${EFFORT_LEVELS.join(', ')} (got "${effort}")`);
  }
  if (!Number.isInteger(port) || port <= 0 || port > 65535) {
    throw new Error(`PORT must be a valid port number (got "${env.PORT}")`);
  }

  return {
    provider,
    port,
    // Bind to localhost only: this is a personal app, not a public server.
    host: env.HOST || '127.0.0.1',
    anthropic: {
      apiKey: env.ANTHROPIC_API_KEY?.trim() || null,
      model: env.ANTHROPIC_MODEL?.trim() || 'claude-opus-5-5',
      effort,
    },
    publicDir: path.join(PROJECT_ROOT, 'public'),
    nodeModulesDir: path.join(PROJECT_ROOT, 'node_modules'),
  };
}
