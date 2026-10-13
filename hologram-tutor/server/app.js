// HTTP API + static file server. Built as a factory so tests can create an app
// with a mock provider and no network access.

import express from 'express';
import path from 'node:path';
import { ProviderError, ErrorCodes } from './ai/errors.js';
import { getCharacter } from './characters.js';
import { createConversationStore, publicView, runTurn, ConversationError, MAX_MESSAGE_CHARS } from './conversations.js';

export function createApp({ provider, store = createConversationStore(), publicDir, nodeModulesDir }) {
  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));

  app.get('/api/status', (req, res) => {
    const status = provider.status();
    const character = getCharacter();
    res.json({
      provider: provider.name,
      model: provider.model,
      ready: status.ready,
      ...(status.ready ? {} : { code: status.code, reason: status.reason }),
      character: { id: character.id, name: character.name, tagline: character.tagline },
      limits: { maxMessageChars: MAX_MESSAGE_CHARS },
    });
  });

  app.post('/api/conversations', (req, res) => {
    const conversation = store.create({ characterId: req.body?.characterId });
    res.status(201).json(publicView(conversation));
  });

  app.get('/api/conversations/:id', (req, res) => {
    const conversation = store.get(req.params.id);
    if (!conversation) return sendError(res, 404, 'not_found', 'Conversation not found.');
    res.json(publicView(conversation));
  });

  app.delete('/api/conversations/:id', (req, res) => {
    store.delete(req.params.id);
    res.status(204).end();
  });

  // Streams the answer as newline-delimited JSON events:
  //   {"type":"delta","text":"..."}      a piece of the answer
  //   {"type":"done","turn":{...}}       the finished (or interrupted) answer
  //   {"type":"error","code","message"}  something went wrong mid-stream
  app.post('/api/conversations/:id/messages', async (req, res) => {
    const conversation = store.get(req.params.id);
    if (!conversation) return sendError(res, 404, 'not_found', 'Conversation not found.');

    const status = provider.status();
    if (!status.ready) return sendError(res, 503, status.code, status.reason);

    // Stop generating (and paying for tokens) if the browser goes away or presses Stop.
    const controller = new AbortController();
    res.on('close', () => {
      if (!res.writableEnded) controller.abort();
    });

    let started = false;
    const write = (event) => {
      if (!started) {
        res.status(200).set({
          'Content-Type': 'application/x-ndjson; charset=utf-8',
          'Cache-Control': 'no-cache',
          'X-Content-Type-Options': 'nosniff',
        });
        started = true;
      }
      if (!res.writableEnded) res.write(`${JSON.stringify(event)}\n`);
    };

    try {
      const { turn, stopReason } = await runTurn({
        conversation,
        provider,
        text: req.body?.text,
        signal: controller.signal,
        onText: (text) => write({ type: 'delta', text }),
      });
      write({ type: 'done', stopReason, turn: { role: turn.role, text: turn.text, interrupted: !!turn.interrupted } });
      res.end();
    } catch (err) {
      const { status: httpStatus, code, message } = describeError(err);
      if (!(err instanceof ConversationError) && !(err instanceof ProviderError)) console.error(err);
      if (started) {
        write({ type: 'error', code, message });
        res.end();
      } else {
        sendError(res, httpStatus, code, message);
      }
    }
  });

  app.use('/api', (req, res) => sendError(res, 404, 'not_found', 'Unknown API route.'));

  if (nodeModulesDir) {
    // Expose only the specific browser libraries the front end needs.
    app.use('/vendor/marked', express.static(path.join(nodeModulesDir, 'marked', 'lib')));
    app.use('/vendor/three/build', express.static(path.join(nodeModulesDir, 'three', 'build')));
    app.use('/vendor/three/addons', express.static(path.join(nodeModulesDir, 'three', 'examples', 'jsm')));
  }
  if (publicDir) app.use(express.static(publicDir));

  return app;
}

function describeError(err) {
  if (err instanceof ConversationError) return { status: err.status, code: err.code, message: err.message };
  if (err instanceof ProviderError) {
    const status = {
      [ErrorCodes.MISSING_API_KEY]: 503,
      [ErrorCodes.INVALID_API_KEY]: 502,
      [ErrorCodes.RATE_LIMITED]: 429,
      [ErrorCodes.REFUSED]: 422,
    }[err.code] ?? 502;
    return { status, code: err.code, message: err.message };
  }
  return { status: 500, code: ErrorCodes.UNKNOWN, message: 'Something went wrong on the server.' };
}

function sendError(res, status, code, message) {
  res.status(status).json({ error: { code, message } });
}
