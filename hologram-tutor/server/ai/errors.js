// A provider-neutral error the rest of the app can show to the user.
// `code` is stable and machine-readable; `message` is plain English.

export class ProviderError extends Error {
  constructor(code, message, { retryable = false, cause } = {}) {
    super(message, { cause });
    this.name = 'ProviderError';
    this.code = code;
    this.retryable = retryable;
  }
}

export const ErrorCodes = Object.freeze({
  MISSING_API_KEY: 'missing_api_key',
  INVALID_API_KEY: 'invalid_api_key',
  RATE_LIMITED: 'rate_limited',
  PROVIDER_UNAVAILABLE: 'provider_unavailable',
  NETWORK: 'network',
  BAD_REQUEST: 'bad_request',
  REFUSED: 'refused',
  ABORTED: 'aborted',
  UNKNOWN: 'unknown',
});
