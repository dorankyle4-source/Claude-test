// Wires the UI together: conversation, streaming answers, speech and character.

import * as api from './api.js';
import { createSpeaker } from './speech.js';
import { createCharacter } from './character.js';
import { renderMarkdown, renderPlain } from './render.js';

const $ = (id) => document.getElementById(id);
const els = {
  log: $('log'),
  form: $('composer'),
  input: $('input'),
  send: $('send'),
  stop: $('stop'),
  banner: $('banner'),
  newConversation: $('new-conversation'),
  speechToggle: $('speech-toggle'),
  voiceSelect: $('voice-select'),
  modelLabel: $('model-label'),
  characterName: $('character-name'),
  characterState: $('character-state'),
};

const STATE_LABELS = { idle: 'Ready', thinking: 'Thinking…', speaking: 'Speaking', error: 'Problem' };
const CONVERSATION_KEY = 'conversation.id';

const speaker = createSpeaker();
const character = await createCharacter($('character'));

let conversationId = null;
let ready = false;
let inFlight = null; // AbortController for the current answer
let errorUntil = 0;

// ---- character / status -------------------------------------------------

function updateCharacterState() {
  let state = 'idle';
  if (Date.now() < errorUntil) state = 'error';
  else if (speaker.speaking) state = 'speaking';
  else if (inFlight) state = 'thinking';
  character.setState(state);
  els.characterState.dataset.state = state;
  els.characterState.textContent = STATE_LABELS[state];
  const busy = !!inFlight || speaker.speaking;
  els.stop.hidden = !busy;
  els.send.hidden = busy;
  els.send.disabled = !ready;
}

function flashError() {
  errorUntil = Date.now() + 2500;
  updateCharacterState();
  setTimeout(updateCharacterState, 2600);
}

speaker.onStateChange(updateCharacterState);
speaker.onWord(() => character.mouthPulse());

function showBanner(html) {
  els.banner.innerHTML = html;
  els.banner.hidden = !html;
}

// ---- message log --------------------------------------------------------

function clearLog() {
  els.log.innerHTML = '';
}

function showEmptyState(name) {
  if (els.log.children.length) return;
  const li = document.createElement('li');
  li.className = 'empty';
  li.textContent = `Ask ${name} a question to get started.`;
  els.log.append(li);
}

function addMessage(role, text, { pending = false, error = false, interrupted = false } = {}) {
  els.log.querySelector('.empty')?.remove();
  const li = document.createElement('li');
  li.className = `msg ${role}${pending ? ' pending' : ''}${error ? ' error' : ''}`;

  const meta = document.createElement('div');
  meta.className = 'meta';
  meta.textContent = role === 'user' ? 'You' : error ? 'Error' : els.characterName.textContent;
  const body = document.createElement('div');
  body.className = 'body';
  li.append(meta, body);
  els.log.append(li);

  const view = {
    li,
    text,
    setText(next) {
      view.text = next;
      body.innerHTML = role === 'assistant' && !error ? renderMarkdown(next) : renderPlain(next);
      els.log.scrollTop = els.log.scrollHeight;
    },
    finish({ interrupted: wasInterrupted = false } = {}) {
      li.classList.remove('pending');
      if (wasInterrupted) {
        const tag = document.createElement('span');
        tag.textContent = '· interrupted';
        meta.append(tag);
      }
      if (role === 'assistant' && !error && speaker.supported) {
        const replay = document.createElement('button');
        replay.type = 'button';
        replay.textContent = '🔊 Replay';
        replay.title = 'Read this answer aloud';
        replay.addEventListener('click', () => {
          if (!speaker.enabled) {
            speaker.enabled = true;
            els.speechToggle.checked = true;
          }
          speaker.speakText(view.text);
        });
        meta.append(replay);
      }
    },
  };
  view.setText(text);
  if (!pending) view.finish({ interrupted });
  return view;
}

// ---- conversation -------------------------------------------------------

async function startNewConversation() {
  stopEverything();
  const conversation = await api.createConversation();
  conversationId = conversation.id;
  try {
    localStorage.setItem(CONVERSATION_KEY, conversationId);
  } catch {
    /* ignore */
  }
  clearLog();
  showEmptyState(els.characterName.textContent);
}

async function restoreConversation() {
  let saved = null;
  try {
    saved = localStorage.getItem(CONVERSATION_KEY);
  } catch {
    /* ignore */
  }
  if (saved) {
    try {
      const conversation = await api.getConversation(saved);
      conversationId = conversation.id;
      clearLog();
      for (const turn of conversation.turns) addMessage(turn.role, turn.text, { interrupted: turn.interrupted });
      showEmptyState(els.characterName.textContent);
      return;
    } catch (err) {
      if (err.status !== 404) throw err;
      // Server restarted (Phase 1 keeps history in memory) — start fresh.
    }
  }
  await startNewConversation();
}

async function ask(text) {
  if (!text.trim() || inFlight || !conversationId) return;
  speaker.stop();
  addMessage('user', text);
  const answer = addMessage('assistant', '', { pending: true });

  inFlight = new AbortController();
  updateCharacterState();
  speaker.begin();
  let received = '';

  try {
    const done = await api.sendMessage(conversationId, text, {
      signal: inFlight.signal,
      onDelta: (delta) => {
        received += delta;
        answer.setText(received);
        speaker.push(delta);
      },
    });
    answer.setText(done.turn.text);
    answer.finish({ interrupted: done.turn.interrupted });
    speaker.end();
  } catch (err) {
    speaker.stop();
    if (err.name === 'AbortError') {
      // The server records the partial answer; mirror that here.
      answer.setText(received ? `${received.trim()} …` : '(interrupted before answering)');
      answer.finish({ interrupted: true });
    } else {
      answer.li.remove();
      addMessage('assistant', err.message || 'Something went wrong.', { error: true });
      flashError();
      if (err.code === 'missing_api_key' || err.code === 'invalid_api_key') await refreshStatus();
      // The question wasn't answered: put it back so it can be retried.
      if (!els.input.value) els.input.value = text;
    }
  } finally {
    inFlight = null;
    updateCharacterState();
  }
}

function stopEverything() {
  inFlight?.abort();
  speaker.stop();
  updateCharacterState();
}

// ---- status & settings --------------------------------------------------

async function refreshStatus() {
  try {
    const status = await api.getStatus();
    ready = status.ready;
    els.modelLabel.textContent = `${status.provider} · ${status.model}`;
    els.characterName.textContent = status.character.name;
    els.input.maxLength = status.limits.maxMessageChars;
    if (status.ready) {
      showBanner(status.provider === 'mock' ? 'Running the <strong>offline mock</strong> tutor (AI_PROVIDER=mock).' : '');
    } else {
      showBanner(
        `<strong>AI not configured.</strong> ${renderPlain(status.reason)}<br>` +
          'See the README section “Get an Anthropic API key”. The key goes in <code>.env</code>, never in this page.',
      );
    }
  } catch (err) {
    ready = false;
    showBanner(renderPlain(err.message));
  }
  updateCharacterState();
}

function populateVoices() {
  const voices = speaker.voices().filter((v) => /^en/i.test(v.lang));
  const current = speaker.voiceName;
  els.voiceSelect.innerHTML = '';
  for (const voice of voices) {
    const option = document.createElement('option');
    option.value = voice.name;
    option.textContent = `${voice.name} (${voice.lang})`;
    option.selected = voice.name === current;
    els.voiceSelect.append(option);
  }
  els.voiceSelect.hidden = !speaker.supported || voices.length === 0;
}

function setupSpeechControls() {
  els.speechToggle.checked = speaker.enabled;
  els.speechToggle.disabled = !speaker.supported;
  if (!speaker.supported) els.speechToggle.parentElement.title = 'This browser has no speech synthesis';
  els.speechToggle.addEventListener('change', () => {
    speaker.enabled = els.speechToggle.checked;
  });
  els.voiceSelect.addEventListener('change', () => speaker.setVoice(els.voiceSelect.value));
  speaker.onVoicesChanged(populateVoices);
  populateVoices();
}

// ---- events -------------------------------------------------------------

els.form.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = els.input.value;
  if (!text.trim() || !ready) return;
  els.input.value = '';
  ask(text);
});

els.input.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) {
    e.preventDefault();
    els.form.requestSubmit();
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') stopEverything();
});

els.stop.addEventListener('click', stopEverything);
els.newConversation.addEventListener('click', () => startNewConversation().catch((err) => showBanner(renderPlain(err.message))));

// ---- boot ---------------------------------------------------------------

setupSpeechControls();
await refreshStatus();
try {
  await restoreConversation();
} catch (err) {
  showBanner(renderPlain(err.message));
}
els.input.focus();
