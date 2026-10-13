import { createAnthropicProvider } from './anthropic.js';
import { createMockProvider } from './mock.js';

export function createProvider(config) {
  if (config.provider === 'mock') return createMockProvider();
  return createAnthropicProvider(config.anthropic);
}

export { ProviderError, ErrorCodes } from './errors.js';
