// Conversation state and the logic for one question/answer turn.
// Phase 1 keeps conversations in memory; Phase 5 swaps this store for SQLite.

import { randomUUID } from 'node:crypto';
import { ProviderError, ErrorCodes } from './ai/errors.js';
import { getCharacter } from './characters.js';

export const MAX_MESSAGE_CHARS = 8000;

export class ConversationError extends Error {
  constructor(code, message, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export function createConversationStore() {
  const conversations = new Map();

  return {
    create({ characterId } = {}) {
      const character = getCharacter(characterId);
      const conversation = {
        id: randomUUID(),
        characterId: character.id,
        // Frozen at creation: changing the system prompt mid-conversation
        // would invalidate the prompt cache and replayed thinking.
        system: character.systemPrompt,
        createdAt: new Date().toISOString(),
        turns: [],
        busy: false,
      };
      conversations.set(conversation.id, conversation);
      return conversation;
    },

    get(id) {
      return conversations.get(id) ?? null;
    },

    delete(id) {
      return conversations.delete(id);
    },
  };
}

// What the browser is allowed to see: no provider-native blocks.
export function publicView(conversation) {
  return {
    id: conversation.id,
    characterId: conversation.characterId,
    createdAt: conversation.createdAt,
    busy: conversation.busy,
    turns: conversation.turns.map(({ role, text, createdAt, interrupted }) => ({
      role,
      text,
      createdAt,
      ...(interrupted ? { interrupted: true } : {}),
    })),
  };
}

export function validateUserText(text) {
  if (typeof text !== 'string' || !text.trim()) {
    throw new ConversationError('empty_message', 'Type a question first.');
  }
  if (text.length > MAX_MESSAGE_CHARS) {
    throw new ConversationError('message_too_long', `Messages are limited to ${MAX_MESSAGE_CHARS} characters.`);
  }
  return text.trim();
}

// Runs one turn: records the question, streams the answer through `onText`,
// and records the answer. Always leaves the history alternating user/assistant.
export async function runTurn({ conversation, provider, text, signal, onText }) {
  const userText = validateUserText(text);
  if (conversation.busy) {
    throw new ConversationError('busy', 'Still answering the previous question. Stop it or wait.', 409);
  }

  conversation.busy = true;
  const userTurn = { role: 'user', text: userText, createdAt: now() };
  conversation.turns.push(userTurn);
  let partial = '';

  try {
    const result = await provider.streamReply({
      system: conversation.system,
      history: [...conversation.turns],
      signal,
      onText: (delta) => {
        partial += delta;
        onText?.(delta);
      },
    });
    const assistantTurn = { role: 'assistant', text: result.text, native: result.native, createdAt: now() };
    conversation.turns.push(assistantTurn);
    return { turn: assistantTurn, stopReason: result.stopReason };
  } catch (err) {
    if (err instanceof ProviderError && err.code === ErrorCodes.ABORTED) {
      // Keep what was said so far so the tutor knows it was cut off.
      const assistantTurn = {
        role: 'assistant',
        text: partial.trim() ? `${partial.trim()} …` : '(interrupted before answering)',
        native: null,
        interrupted: true,
        createdAt: now(),
      };
      conversation.turns.push(assistantTurn);
      return { turn: assistantTurn, stopReason: 'interrupted' };
    }
    // The question never got an answer: remove it so the learner can retry.
    if (conversation.turns.at(-1) === userTurn) conversation.turns.pop();
    throw err;
  } finally {
    conversation.busy = false;
  }
}

function now() {
  return new Date().toISOString();
}
