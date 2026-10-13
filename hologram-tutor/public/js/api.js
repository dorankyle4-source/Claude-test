// Thin client for the local server API. The browser never talks to the AI
// provider directly, so no API key ever reaches this code.

export class ApiError extends Error {
  constructor(code, message, status) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

async function request(path, options = {}) {
  let res;
  try {
    res = await fetch(path, {
      ...options,
      headers: { 'Content-Type': 'application/json', ...options.headers },
    });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError('server_unreachable', "Can't reach the local server. Is `npm start` still running?", 0);
  }
  if (!res.ok) {
    const body = await res.json().catch(() => null);
    throw new ApiError(body?.error?.code ?? 'http_error', body?.error?.message ?? `Server error (${res.status})`, res.status);
  }
  return res;
}

export async function getStatus() {
  return (await request('/api/status')).json();
}

export async function createConversation() {
  return (await request('/api/conversations', { method: 'POST', body: '{}' })).json();
}

export async function getConversation(id) {
  return (await request(`/api/conversations/${encodeURIComponent(id)}`)).json();
}

// Sends a question and calls onDelta(text) as the answer streams in.
// Resolves with the final "done" event; throws ApiError on failure.
export async function sendMessage(id, text, { signal, onDelta } = {}) {
  const res = await request(`/api/conversations/${encodeURIComponent(id)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ text }),
    signal,
  });

  const reader = res.body.pipeThrough(new TextDecoderStream()).getReader();
  let buffer = '';
  let done = null;

  const handle = (line) => {
    if (!line.trim()) return;
    const event = JSON.parse(line);
    if (event.type === 'delta') onDelta?.(event.text);
    else if (event.type === 'done') done = event;
    else if (event.type === 'error') throw new ApiError(event.code, event.message, 200);
  };

  try {
    for (;;) {
      const { value, done: finished } = await reader.read();
      if (finished) break;
      buffer += value;
      let newline;
      while ((newline = buffer.indexOf('\n')) >= 0) {
        handle(buffer.slice(0, newline));
        buffer = buffer.slice(newline + 1);
      }
    }
    handle(buffer);
  } catch (err) {
    if (err instanceof ApiError || err.name === 'AbortError') throw err;
    throw new ApiError('stream_interrupted', 'The connection dropped while the answer was arriving. Try again.', 0);
  }

  if (!done) throw new ApiError('stream_interrupted', 'The answer was cut off. Try again.', 0);
  return done;
}
