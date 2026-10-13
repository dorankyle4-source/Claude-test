// Text-to-speech using the browser's built-in voices (free, works offline on macOS).
// Speaks sentence by sentence as the answer streams in, to keep latency low.
//
// The rest of the app only uses this interface, so a cloud voice (with real audio
// we can analyse for lip sync) can replace it later:
//   begin(), push(textDelta), end(), stop(), speakText(text)
//   enabled, voices(), setVoice(name)
//   onStateChange(fn(speaking)), onWord(fn())

import { takeSentences, toSpeakable } from './spoken-text.js';

const PREFERRED_VOICES = [/premium/i, /enhanced/i, /^daniel/i, /^samantha/i, /google uk english male/i, /^alex$/i];

export function createSpeaker({ storage = safeStorage() } = {}) {
  const synth = globalThis.speechSynthesis;
  const supported = !!synth && typeof SpeechSynthesisUtterance !== 'undefined';
  const stateListeners = new Set();
  const wordListeners = new Set();

  let enabled = supported && storage.get('speech.enabled') !== 'false';
  let voiceName = storage.get('speech.voice');
  let buffer = '';
  let queued = 0;
  let generation = 0; // bumps on stop() so stale callbacks are ignored
  const live = new Set(); // keep references: Chrome can garbage-collect queued utterances

  function emitState() {
    const speaking = queued > 0;
    for (const fn of stateListeners) fn(speaking);
  }

  function pickVoice() {
    const all = voices();
    if (voiceName) {
      const chosen = all.find((v) => v.name === voiceName);
      if (chosen) return chosen;
    }
    const english = all.filter((v) => /^en(-|_|$)/i.test(v.lang));
    for (const pattern of PREFERRED_VOICES) {
      const match = english.find((v) => pattern.test(v.name));
      if (match) return match;
    }
    return english.find((v) => v.default) ?? english[0] ?? all[0] ?? null;
  }

  function enqueue(markdownChunk) {
    if (!enabled) return;
    const text = toSpeakable(markdownChunk);
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = pickVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 1.02;

    const myGeneration = generation;
    const finish = () => {
      live.delete(utterance);
      if (myGeneration !== generation) return;
      queued = Math.max(0, queued - 1);
      emitState();
    };
    utterance.onend = finish;
    utterance.onerror = finish;
    utterance.onboundary = (e) => {
      if (myGeneration === generation && e.name !== 'sentence') for (const fn of wordListeners) fn();
    };

    live.add(utterance);
    queued += 1;
    emitState();
    synth.speak(utterance);
  }

  function voices() {
    return supported ? synth.getVoices() : [];
  }

  return {
    supported,

    get enabled() {
      return enabled;
    },
    set enabled(value) {
      enabled = supported && !!value;
      storage.set('speech.enabled', String(enabled));
      if (!enabled) this.stop();
    },

    voices,
    get voiceName() {
      return pickVoice()?.name ?? null;
    },
    setVoice(name) {
      voiceName = name;
      storage.set('speech.voice', name);
    },
    onVoicesChanged(fn) {
      if (supported) synth.addEventListener('voiceschanged', fn);
    },

    begin() {
      this.stop();
      buffer = '';
    },
    push(delta) {
      buffer += delta;
      const { chunks, rest } = takeSentences(buffer);
      buffer = rest;
      chunks.forEach(enqueue);
    },
    end() {
      const { chunks } = takeSentences(buffer, { final: true });
      buffer = '';
      chunks.forEach(enqueue);
    },
    speakText(text) {
      this.begin();
      this.push(text);
      this.end();
    },
    stop() {
      generation += 1;
      buffer = '';
      queued = 0;
      live.clear();
      if (supported) synth.cancel();
      emitState();
    },

    get speaking() {
      return queued > 0;
    },
    onStateChange(fn) {
      stateListeners.add(fn);
    },
    onWord(fn) {
      wordListeners.add(fn);
    },
  };
}

function safeStorage() {
  return {
    get(key) {
      try {
        return localStorage.getItem(key);
      } catch {
        return null;
      }
    },
    set(key, value) {
      try {
        localStorage.setItem(key, value);
      } catch {
        /* storage unavailable: settings just won't persist */
      }
    },
  };
}
