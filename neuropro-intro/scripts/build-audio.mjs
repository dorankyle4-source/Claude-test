// Builds the soundtrack: procedural music bed + SFX + voiceover → audio/generated/{music,sfx,mix}.wav
// Everything is synthesised here (no samples, no licensing questions); tweak the SCORE / SFX sections freely.
//
//   node scripts/build-audio.mjs [--comp ep01]

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const cfgJ = (f) => JSON.parse(fs.readFileSync(path.join(ROOT, 'config', f), 'utf8'));
const argv = process.argv;
const COMP = argv.includes('--comp') ? argv[argv.indexOf('--comp') + 1] : 'intro';
const CI = cfgJ('compositions.json')[COMP];
const SB = JSON.parse(fs.readFileSync(path.join(ROOT, CI.storyboard), 'utf8'));
const AU = cfgJ('audio.json');
const SR = AU.sampleRate || 48000;
const DUR = SB.duration + 0.0;
const N = Math.round(DUR * SR);
const OUT = path.join(ROOT, CI.audioDir);
const VOICE_DIR = path.join(ROOT, CI.voiceDir);
// Episodes place SFX + music moods from their timeline module (shared with the renderer).
let EP = null;
if (CI.timeline) {
  const tl = await import(path.join(ROOT, CI.timeline));
  const timingPath = path.join(VOICE_DIR, 'timing.json');
  const timing = fs.existsSync(timingPath) ? JSON.parse(fs.readFileSync(timingPath, 'utf8')) : {};
  const T = tl.buildTimeline(SB, timing);
  EP = { T, sfx: tl.sfxList(T), music: tl.musicSections(T) };
}
fs.mkdirSync(OUT, { recursive: true });

// ---------------------------------------------------------------- utils
const stereo = () => [new Float32Array(N), new Float32Array(N)];
const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
let seed = 22222;
const rand = () => ((seed = (seed * 16807) % 2147483647) / 2147483647) * 2 - 1;
const smooth = (k) => { k = clamp(k, 0, 1); return k * k * (3 - 2 * k); };

function add(buf, i, l, r) { if (i >= 0 && i < N) { buf[0][i] += l; buf[1][i] += r; } }
function panLR(p) { const a = (p + 1) * Math.PI / 4; return [Math.cos(a), Math.sin(a)]; }

/** ADSR-ish envelope value at time x (seconds since note start). */
function env(x, a, d, s, len, r) {
  if (x < 0) return 0;
  if (x < a) return x / a;
  if (x < a + d) return 1 - (1 - s) * ((x - a) / d);
  if (x < len) return s;
  const k = (x - len) / r;
  return k < 1 ? s * Math.pow(1 - k, 2) : 0;
}

/** One-pole lowpass state helper. */
const lp = () => { let z = 0; return (x, a) => (z += a * (x - z)); };
const coef = (fc) => 1 - Math.exp((-2 * Math.PI * fc) / SR);

/** Biquad bandpass (for whooshes). */
function biquadBP() {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  return (x, fc, q) => {
    const w = (2 * Math.PI * fc) / SR, al = Math.sin(w) / (2 * q), cw = Math.cos(w);
    const b0 = al, b2 = -al, a0 = 1 + al, a1 = -2 * cw, a2 = 1 - al;
    const y = (b0 * x + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x; y2 = y1; y1 = y;
    return y;
  };
}

/** Freeverb-style stereo reverb (returns wet only). */
function reverb(buf, { room = 0.84, damp = 0.35, wet = 0.3, pre = 0.02 } = {}) {
  const combT = [1116, 1188, 1277, 1356, 1422, 1491, 1557, 1617];
  const apT = [556, 441, 341, 225];
  const scale = SR / 44100;
  const out = stereo();
  for (let ch = 0; ch < 2; ch++) {
    const spread = ch ? 23 : 0;
    const combs = combT.map((t) => ({ b: new Float32Array(Math.round((t + spread) * scale)), i: 0, f: 0 }));
    const aps = apT.map((t) => ({ b: new Float32Array(Math.round((t + spread) * scale)), i: 0 }));
    const preN = Math.round(pre * SR);
    const src = buf[ch];
    for (let n = 0; n < N; n++) {
      const x = (n - preN >= 0 ? (src[n - preN] + buf[1 - ch][n - preN]) * 0.5 : 0) * 0.015;
      let y = 0;
      for (const c of combs) {
        const o = c.b[c.i];
        c.f = o * (1 - damp) + c.f * damp;
        c.b[c.i] = x + c.f * room;
        c.i = (c.i + 1) % c.b.length;
        y += o;
      }
      for (const a of aps) {
        const o = a.b[a.i];
        a.b[a.i] = y + o * 0.5;
        a.i = (a.i + 1) % a.b.length;
        y = o - y;
      }
      out[ch][n] = y * wet;
    }
  }
  return out;
}

/** Stereo ping-pong delay (wet only). */
function pingpong(buf, time, fb, wet) {
  const d = Math.round(time * SR), out = stereo();
  const L = new Float32Array(N), R = new Float32Array(N);
  for (let n = 0; n < N; n++) {
    const dl = n >= d ? R[n - d] : 0, dr = n >= d ? L[n - d] : 0;
    L[n] = buf[0][n] + dl * fb;
    R[n] = buf[1][n] * 0.2 + dr * fb;
    out[0][n] = dl * wet; out[1][n] = dr * wet;
  }
  return out;
}

const mixInto = (dst, src, g = 1) => { for (let c = 0; c < 2; c++) for (let n = 0; n < N; n++) dst[c][n] += src[c][n] * g; };

// ---------------------------------------------------------------- SCORE
// 96 BPM, four 2.5s bars. Curious → introspective (symptoms) → lift (NeuroPro) → resolve (title).
const BPM = AU.music?.bpm || 96, BEAT = 60 / BPM, BAR = BEAT * 4;
const CHORDS = [
  { t: 0,          notes: [53, 57, 60, 64, 67], root: 41 },   // Fmaj9   — curious, warm
  { t: BAR,        notes: [50, 53, 57, 60, 64], root: 38 },   // Dm9     — introspective
  { t: BAR * 2,    notes: [46, 50, 53, 57, 60], root: 34 },   // Bbmaj9  — lift
  { t: BAR * 2.5,  notes: [48, 52, 55, 57, 62], root: 36 },   // C6/9    — lift
  { t: BAR * 3,    notes: [53, 57, 60, 64, 67, 72], root: 41 }, // Fadd9 — resolve
];
const chordAt = (t) => [...CHORDS].reverse().find((c) => t >= c.t - 1e-6);
const symptom = (t) => smooth((t - 2.0) / 0.5) * (1 - smooth((t - 5.2) / 0.8)); // 0..1 in the dizzy section

function buildMusic() {
  const pad = stereo(), pluck = stereo(), low = stereo(), drums = stereo(), fx = stereo();

  // Pad: detuned saws, gentle lowpass that closes (and wobbles) during symptoms, opens for NeuroPro.
  CHORDS.forEach((ch, ci) => {
    const start = ch.t, end = ci + 1 < CHORDS.length ? CHORDS[ci + 1].t : DUR;
    ch.notes.forEach((m, ni) => {
      const f0 = mtof(m + (ni === 0 ? 0 : 12));
      const f = [f0 * 0.997, f0, f0 * 1.004];
      const ph = [Math.random(), Math.random(), Math.random()].map((x) => x * 0 + ni * 0.13);
      const [pl, pr] = panLR((ni / (ch.notes.length - 1)) * 1.2 - 0.6);
      const filt = lp();
      const s0 = Math.floor(start * SR), s1 = Math.min(N, Math.floor((end + 0.9) * SR));
      for (let n = s0; n < s1; n++) {
        const t = n / SR, x = t - start;
        const e = env(x, 0.35, 0.4, 0.8, end - start, 0.9);
        if (e <= 0) continue;
        const wob = 1 + symptom(t) * 0.006 * Math.sin(2 * Math.PI * 4.7 * t + ni);
        let v = 0;
        for (let k = 0; k < 3; k++) { ph[k] = (ph[k] + (f[k] * wob) / SR) % 1; v += ph[k] * 2 - 1; }
        const cutoff = 700 + 1600 * smooth((t - 4.9) / 1.4) - 350 * symptom(t) + 400 * smooth((t - 8.3) / 0.4);
        v = filt(v / 3, coef(cutoff));
        add(pad, n, v * e * pl * 0.11, v * e * pr * 0.11);
      }
    });
  });

  // Pluck arpeggio (8ths), sparse at first, fuller after NeuroPro enters.
  const step = BEAT / 2;
  const pattern = [0, 2, 4, 1, 3, 4, 2, 1];
  for (let i = 0; i * step < 8.4; i++) {
    const t0 = i * step;
    if (t0 < 0.3) continue;
    const sparse = t0 < 5.0 && i % 2 === 1;
    if (sparse) continue;
    const ch = chordAt(t0);
    const m = ch.notes[pattern[i % 8] % ch.notes.length] + 12;
    const f = mtof(m), dur = 0.5;
    const vel = (t0 < 5 ? 0.55 : 0.85) * (1 - symptom(t0) * 0.35) * (i % 4 === 0 ? 1 : 0.8);
    const [pl, pr] = panLR(Math.sin(i * 1.7) * 0.5);
    const s0 = Math.floor(t0 * SR), s1 = Math.min(N, s0 + Math.floor(dur * SR));
    for (let n = s0; n < s1; n++) {
      const x = (n - s0) / SR;
      const e = Math.exp(-x * 9) * Math.min(1, x / 0.004);
      const mod = Math.sin(2 * Math.PI * f * 2 * x) * 1.2 * Math.exp(-x * 14);
      const v = Math.sin(2 * Math.PI * f * x + mod) * e * vel * 0.12;
      add(pluck, n, v * pl, v * pr);
    }
  }

  // Sub bass enters with NeuroPro.
  CHORDS.forEach((ch, ci) => {
    if (ch.t < BAR * 2 - 0.01) return;
    const start = ch.t, end = ci + 1 < CHORDS.length ? CHORDS[ci + 1].t : DUR;
    const f = mtof(ch.root + 12);
    for (let n = Math.floor(start * SR); n < Math.min(N, Math.floor((end + 0.6) * SR)); n++) {
      const x = n / SR - start;
      const e = env(x, 0.05, 0.3, 0.7, end - start, 0.6) * (ci === CHORDS.length - 1 ? Math.exp(-x * 0.6) : 1);
      const v = (Math.sin(2 * Math.PI * f * x) + 0.25 * Math.sin(4 * Math.PI * f * x)) * e * 0.16;
      add(low, n, v, v);
    }
  });

  // Soft, modern percussion from 5.0 → 8.0 (kick + snap + shaker).
  for (let b = 0; b < 16; b++) {
    const t0 = 5.0 + b * BEAT / 2;
    if (t0 >= 7.9) break;
    const isBeat = b % 2 === 0;
    if (isBeat && (b / 2) % 2 === 0) { // kick on 1 & 3
      const s0 = Math.floor(t0 * SR);
      let ph = 0;
      for (let n = s0; n < Math.min(N, s0 + SR * 0.35); n++) {
        const x = (n - s0) / SR;
        const f = 45 + 80 * Math.exp(-x * 28);
        ph += f / SR;
        const v = Math.sin(2 * Math.PI * ph) * Math.exp(-x * 9) * 0.34;
        add(drums, n, v, v);
      }
    }
    if (isBeat && (b / 2) % 2 === 1) { // finger snap on 2 & 4
      const s0 = Math.floor(t0 * SR), bp = biquadBP();
      for (let n = s0; n < Math.min(N, s0 + SR * 0.18); n++) {
        const x = (n - s0) / SR;
        const v = bp(rand(), 1900, 1.4) * Math.exp(-x * 30) * 0.5;
        add(drums, n, v * 0.9, v);
      }
    }
    // shaker 8ths
    const s0 = Math.floor(t0 * SR), bp = biquadBP();
    for (let n = s0; n < Math.min(N, s0 + SR * 0.08); n++) {
      const x = (n - s0) / SR;
      const v = bp(rand(), 7000, 0.9) * Math.exp(-x * 60) * (isBeat ? 0.08 : 0.12);
      add(drums, n, v * 0.7, v);
    }
  }

  // Risers into NeuroPro (4.4→5.0) and into the title (7.35→7.9).
  for (const [a, b] of [[4.35, 5.0], [7.3, 7.9]]) {
    const bp = biquadBP();
    for (let n = Math.floor(a * SR); n < Math.floor((b + 0.06) * SR); n++) {
      const k = (n / SR - a) / (b - a);
      const tail = 1 - smooth((n / SR - b + 0.04) / 0.08);
      const v = bp(rand(), 600 + 5000 * k * k, 2.5) * Math.pow(clamp(k, 0, 1), 2) * 0.22 * tail;
      add(fx, n, v, v);
    }
  }

  const bus = stereo();
  mixInto(bus, pad, 1); mixInto(bus, pluck, 1); mixInto(bus, low, 1); mixInto(bus, drums, 0.9); mixInto(bus, fx, 1);
  mixInto(bus, pingpong(pluck, BEAT * 0.75, 0.38, 0.45), 1);
  mixInto(bus, reverb(bus, { room: 0.86, damp: 0.4, wet: 0.55 }), 1);
  return bus;
}


// ---------------------------------------------------------------- EPISODE SCORE
// Same palette as the intro (96 BPM, Fmaj9 → Dm9 → Bbmaj9 → C6/9 loop) with a mood per section.
const MOODS = {
  //         pad cutoff, pluck density (0/0.25/0.5/1), kick, snap, shaker, wobble, level
  bright:  { cut: 1900, pluck: 1,    kick: 0, snap: 0, shaker: 1, wob: 0,   lvl: 1 },
  hush:    { cut: 520,  pluck: 0,    kick: 0, snap: 0, shaker: 0, wob: 0.3, lvl: 0.7 },
  explain: { cut: 1200, pluck: 0.5,  kick: 1, snap: 0, shaker: 1, wob: 0,   lvl: 0.85 },
  tension: { cut: 460,  pluck: 0.25, kick: 0.5, snap: 0, shaker: 0, wob: 1, lvl: 0.85 },
  rise:    { cut: 1500, pluck: 1,    kick: 1, snap: 0, shaker: 1, wob: 0,   lvl: 0.9 },
  playful: { cut: 2000, pluck: 1,    kick: 1, snap: 1, shaker: 1, wob: 0,   lvl: 0.95 },
  tick:    { cut: 1100, pluck: 0.5,  kick: 0, snap: 0, shaker: 1, wob: 0,   lvl: 0.8 },
  warm:    { cut: 2300, pluck: 1,    kick: 1, snap: 1, shaker: 1, wob: 0,   lvl: 1 },
  resolve: { cut: 2600, pluck: 0,    kick: 0, snap: 0, shaker: 0, wob: 0,   lvl: 1 },
  overload:{ cut: 2400, pluck: 1,    kick: 1, snap: 1, shaker: 1, wob: 0.6, lvl: 1 },
  calm:    { cut: 900,  pluck: 0.25, kick: 0, snap: 0, shaker: 0, wob: 0,   lvl: 0.75 },
};
function buildEpisodeMusic(sections) {
  const LOOP = [[53, 57, 60, 64, 67, 41], [50, 53, 57, 60, 64, 38], [46, 50, 53, 57, 60, 34], [48, 52, 55, 57, 62, 36]];
  const resolveAt = sections.find((s) => s.mood === 'resolve')?.from ?? DUR;
  const chordAtT = (t) => (t >= resolveAt ? [53, 57, 60, 64, 67, 41] : LOOP[Math.floor(t / BAR) % 4]);
  // smoothed mood parameters
  const raw = (t) => MOODS[(sections.find((s) => t >= s.from && t < s.to) || sections[sections.length - 1]).mood];
  const P = (t, key) => { let a = 0, n = 0; for (let d = -0.4; d <= 0.4; d += 0.1) { a += raw(Math.max(0, t + d))[key]; n++; } return a / n; };
  const cache = {}; const PC = (t, key) => { const i = Math.round(t * 20); return (cache[key + i] ??= P(i / 20, key)); };

  const pad = stereo(), pluck = stereo(), low = stereo(), drums = stereo();
  // chord segments: one per bar until the resolve, then one long final chord
  const segs = [];
  for (let t0 = 0; t0 < resolveAt - 1e-6; t0 += BAR) segs.push([t0, Math.min(t0 + BAR, resolveAt)]);
  segs.push([resolveAt, DUR]);
  for (const [a, b] of segs) {
    const notes = chordAtT(a + 0.01);
    notes.slice(0, 5).forEach((m, ni) => {
      const f0 = mtof(m + (ni === 0 ? 0 : 12)), f = [f0 * 0.997, f0, f0 * 1.004], ph = [ni * 0.13, ni * 0.29, ni * 0.41];
      const [pl, pr] = panLR((ni / 4) * 1.2 - 0.6), filt = lp();
      for (let n = Math.floor(a * SR); n < Math.min(N, Math.floor((b + 0.8) * SR)); n++) {
        const t = n / SR, e = env(t - a, 0.4, 0.4, 0.8, b - a, 0.8);
        if (e <= 0) continue;
        const wob = 1 + PC(t, 'wob') * 0.007 * Math.sin(2 * Math.PI * 4.7 * t + ni);
        let v = 0;
        for (let k = 0; k < 3; k++) { ph[k] = (ph[k] + (f[k] * wob) / SR) % 1; v += ph[k] * 2 - 1; }
        v = filt(v / 3, coef(PC(t, 'cut')));
        const g = e * 0.1 * PC(t, 'lvl');
        add(pad, n, v * g * pl, v * g * pr);
      }
    });
    // sub bass
    const fb = mtof(chordAtT(a + 0.01)[5] + 12);
    for (let n = Math.floor(a * SR); n < Math.min(N, Math.floor((b + 0.5) * SR)); n++) {
      const x = n / SR - a, t = n / SR;
      const e = env(x, 0.05, 0.3, 0.7, b - a, 0.5) * (a >= resolveAt ? Math.exp(-x * 0.5) : 1) * Math.min(1, PC(t, 'kick') + 0.3);
      const v = (Math.sin(2 * Math.PI * fb * x) + 0.35 * Math.sin(4 * Math.PI * fb * x)) * e * 0.07;
      add(low, n, v, v);
    }
  }
  // plucks on an 8th grid, thinned by density
  const step = BEAT / 2, pattern = [0, 2, 4, 1, 3, 4, 2, 1];
  for (let i = 1; i * step < DUR - 0.5; i++) {
    const t0 = i * step, d = PC(t0, 'pluck');
    const keep = d >= 0.99 || (d >= 0.45 && i % 2 === 0) || (d >= 0.2 && i % 8 === 0);
    if (!keep || t0 >= resolveAt) continue;
    const notes = chordAtT(t0), m = notes[pattern[i % 8] % 5] + 12, f = mtof(m);
    const vel = 0.8 * PC(t0, 'lvl') * (i % 4 === 0 ? 1 : 0.8);
    const [pl, pr] = panLR(Math.sin(i * 1.7) * 0.5), s0 = Math.floor(t0 * SR);
    for (let n = s0; n < Math.min(N, s0 + Math.floor(0.5 * SR)); n++) {
      const x = (n - s0) / SR, e = Math.exp(-x * 9) * Math.min(1, x / 0.004);
      const v = Math.sin(2 * Math.PI * f * x + Math.sin(2 * Math.PI * f * 2 * x) * 1.2 * Math.exp(-x * 14)) * e * vel * 0.11;
      add(pluck, n, v * pl, v * pr);
    }
  }
  // drums
  for (let i = 0; i * (BEAT / 2) < resolveAt; i++) {
    const t0 = i * BEAT / 2, onBeat = i % 2 === 0, beatN = Math.floor(i / 2) % 4, s0 = Math.floor(t0 * SR);
    if (onBeat && (beatN === 0 || beatN === 2) && PC(t0, 'kick') > 0.4 && !(PC(t0, 'kick') < 0.9 && beatN === 2)) {
      let ph = 0;
      for (let n = s0; n < Math.min(N, s0 + SR * 0.35); n++) {
        const x = (n - s0) / SR; ph += (45 + 80 * Math.exp(-x * 28)) / SR;
        const v = Math.sin(2 * Math.PI * ph) * Math.exp(-x * 11) * 0.2 * PC(t0, 'kick');
        add(drums, n, v, v);
      }
    }
    if (onBeat && (beatN === 1 || beatN === 3) && PC(t0, 'snap') > 0.4) {
      const bp = biquadBP();
      for (let n = s0; n < Math.min(N, s0 + SR * 0.18); n++) { const x = (n - s0) / SR, v = bp(rand(), 1900, 1.4) * Math.exp(-x * 30) * 0.45 * PC(t0, 'snap'); add(drums, n, v * 0.9, v); }
    }
    if (PC(t0, 'shaker') > 0.4) {
      const bp = biquadBP();
      for (let n = s0; n < Math.min(N, s0 + SR * 0.08); n++) { const x = (n - s0) / SR, v = bp(rand(), 7000, 0.9) * Math.exp(-x * 60) * (onBeat ? 0.06 : 0.09) * PC(t0, 'shaker'); add(drums, n, v * 0.7, v); }
    }
  }
  const bus = stereo();
  mixInto(bus, pad); mixInto(bus, pluck); mixInto(bus, low); mixInto(bus, drums, 0.9);
  mixInto(bus, pingpong(pluck, BEAT * 0.75, 0.35, 0.4), 1);
  mixInto(bus, reverb(bus, { room: 0.86, damp: 0.4, wet: 0.5 }), 1);
  // fade the tail
  for (let n = Math.floor((DUR - 1.2) * SR); n < N; n++) { const k = 1 - smooth((n / SR - (DUR - 1.2)) / 1.2); bus[0][n] *= k; bus[1][n] *= k; }
  return bus;
}

// ---------------------------------------------------------------- SFX
const SFX = {

  // phone vibrating
  buzz(buf, t0, g) {
    for (let r = 0; r < 2; r++) {
      const s0 = Math.floor((t0 + r * 0.35) * SR);
      for (let n = s0; n < Math.min(N, s0 + SR * 0.25); n++) {
        const x = (n - s0) / SR;
        const v = Math.sign(Math.sin(2 * Math.PI * 150 * x)) * 0.35 * (0.6 + 0.4 * Math.sin(2 * Math.PI * 23 * x)) * Math.sin(Math.PI * x / 0.25) * g;
        add(buf, n, v, v);
      }
    }
  },
  // notification ding
  ding(buf, t0, g) {
    const s0 = Math.floor(t0 * SR);
    [[1568, 0], [2093, 0.09]].forEach(([f, dt]) => {
      const st = s0 + Math.floor(dt * SR);
      for (let n = st; n < Math.min(N, st + SR * 0.6); n++) { const x = (n - st) / SR, v = Math.sin(2 * Math.PI * f * x) * Math.exp(-x * 7) * Math.min(1, x / 0.003) * g * 0.5; add(buf, n, v * 0.8, v); }
    });
  },
  // murmur of overlapping voices (formant-filtered noise bursts)
  chatter(buf, t0, g) {
    for (let k = 0; k < 9; k++) {
      const st = t0 + k * 0.16 + (k % 3) * 0.05, s0 = Math.floor(st * SR), dur = 0.22 + (k % 4) * 0.05;
      const bp1 = biquadBP(), bp2 = biquadBP(), f1 = 500 + (k * 137) % 400, f2 = 1400 + (k * 211) % 700;
      const [l, r] = panLR(((k % 5) - 2) * 0.3);
      for (let n = s0; n < Math.min(N, s0 + SR * dur); n++) {
        const x = (n - s0) / SR, e = Math.sin(Math.PI * x / dur) ** 2, nz = rand();
        const v = (bp1(nz, f1 * (1 + 0.1 * Math.sin(x * 30)), 6) + bp2(nz, f2, 7) * 0.6) * e * g * 1.6;
        add(buf, n, v * l, v * r);
      }
    }
  },

  // soft footstep
  step(buf, t0, g) {
    const s0 = Math.floor(t0 * SR), bp = biquadBP();
    for (let n = s0; n < Math.min(N, s0 + SR * 0.09); n++) { const x = (n - s0) / SR; const v = (bp(rand(), 900, 1.2) * 0.6 + Math.sin(2 * Math.PI * 110 * x) * 0.5) * Math.exp(-x * 45) * g; add(buf, n, v, v); }
  },
  // low bump / jolt
  thud(buf, t0, g) {
    const s0 = Math.floor(t0 * SR), bp = biquadBP(); let ph = 0;
    for (let n = s0; n < Math.min(N, s0 + SR * 0.5); n++) {
      const x = (n - s0) / SR; ph += (55 + 90 * Math.exp(-x * 20)) / SR;
      const v = (Math.sin(2 * Math.PI * ph) * Math.exp(-x * 8) + bp(rand(), 400, 1) * Math.exp(-x * 40) * 0.8) * g;
      add(buf, n, v, v);
    }
  },
  // cartoon impact (bump / blow)
  impact(buf, t0, g) {
    const s0 = Math.floor(t0 * SR), bp = biquadBP(); let ph = 0;
    for (let n = s0; n < Math.min(N, s0 + SR * 0.3); n++) {
      const x = (n - s0) / SR; ph += (160 * Math.exp(-x * 10) + 70) / SR;
      const v = (Math.sin(2 * Math.PI * ph) * 0.8 + bp(rand(), 2200, 0.8) * Math.exp(-x * 60)) * Math.exp(-x * 14) * g;
      add(buf, n, v, v);
    }
  },
  // liquid "slosh" of the brain moving in fluid
  slosh(buf, t0, g) {
    const s0 = Math.floor(t0 * SR), dur = 0.6, bp = biquadBP();
    for (let n = s0; n < Math.min(N, s0 + SR * dur); n++) {
      const x = (n - s0) / SR, k = x / dur;
      const v = bp(rand(), 300 + 500 * Math.sin(k * Math.PI) + 150 * Math.sin(x * 40), 3) * Math.sin(Math.PI * k) ** 2 * g * 1.6;
      const [l, r] = panLR(Math.sin(k * Math.PI * 2) * 0.6);
      add(buf, n, v * l, v * r);
    }
  },
  // digital glitch / disruption
  glitch(buf, t0, g) {
    const s0 = Math.floor(t0 * SR), dur = 0.7;
    let hold = 0, val = 0;
    for (let n = s0; n < Math.min(N, s0 + SR * dur); n++) {
      const x = (n - s0) / SR;
      if (hold-- <= 0) { hold = Math.floor(SR / (200 + 1800 * Math.abs(rand()))); val = rand(); }
      const gate = Math.sin(x * 60) > -0.2 ? 1 : 0.2;
      const v = (val * 0.5 + Math.sin(2 * Math.PI * 90 * x) * 0.4) * gate * Math.exp(-x * 3.5) * g;
      add(buf, n, v, v * 0.8);
    }
  },
  // energy draining (falling tone)
  powerdown(buf, t0, g) {
    const s0 = Math.floor(t0 * SR), dur = 1.6; let ph = 0;
    for (let n = s0; n < Math.min(N, s0 + SR * dur); n++) {
      const x = (n - s0) / SR, k = x / dur; ph += (420 * Math.pow(0.25, k)) / SR;
      const v = (Math.sin(2 * Math.PI * ph) + 0.3 * Math.sin(6 * Math.PI * ph)) * Math.min(1, x / 0.05) * (1 - k) * g * 0.5;
      add(buf, n, v, v);
    }
  },
  // energy returning (rising shimmer)
  powerup(buf, t0, g) {
    const s0 = Math.floor(t0 * SR), dur = 2.2;
    for (let n = s0; n < Math.min(N, s0 + SR * dur); n++) {
      const x = (n - s0) / SR, k = x / dur, f = 220 * Math.pow(3, k);
      let v = 0; [1, 1.5, 2].forEach((m, i) => { v += Math.sin(2 * Math.PI * f * m * x) / (i + 1.5); });
      v *= smooth(k / 0.3) * (1 - smooth((k - 0.75) / 0.25)) * g * 0.35;
      add(buf, n, v, v);
    }
  },
  // pop-back-up boing
  boing(buf, t0, g) {
    const s0 = Math.floor(t0 * SR); let ph = 0;
    for (let n = s0; n < Math.min(N, s0 + SR * 0.6); n++) {
      const x = (n - s0) / SR; ph += (220 + 180 * Math.sin(x * 38) * Math.exp(-x * 5) + 160 * x) / SR;
      const v = Math.sin(2 * Math.PI * ph) * Math.exp(-x * 5) * Math.min(1, x / 0.01) * g * 0.7;
      add(buf, n, v, v);
    }
  },
  // big stamp: thump + slap
  // ba-dum-tss: two snare hits and a crash, for punchlines
  rimshot(buf, t0, g) {
    const hit = (t, a) => {
      const s0 = Math.floor(t * SR), bp = biquadBP();
      for (let n = s0; n < Math.min(N, s0 + SR * 0.2); n++) {
        const x = (n - s0) / SR, v = (bp(rand(), 1900, 0.7) * Math.exp(-x * 28) + Math.sin(2 * Math.PI * 185 * x) * Math.exp(-x * 45) * 0.7) * a * g;
        add(buf, n, v, v);
      }
    };
    hit(t0, 0.8); hit(t0 + 0.14, 0.9);
    const s0 = Math.floor((t0 + 0.3) * SR); let prev = 0, lp = 0;
    for (let n = s0; n < Math.min(N, s0 + SR * 1.6); n++) {
      const x = (n - s0) / SR, r = rand(), hp = r - prev; prev = r; lp += 0.5 * (hp - lp);
      const v = lp * Math.exp(-x * 3.2) * 0.75 * g;
      add(buf, n, v * 0.8, v);
    }
  },
  stamp(buf, t0, g) {
    SFX.thud(buf, t0, g * 0.9);
    const s0 = Math.floor(t0 * SR), bp = biquadBP();
    for (let n = s0; n < Math.min(N, s0 + SR * 0.25); n++) { const x = (n - s0) / SR, v = bp(rand(), 1500, 0.7) * Math.exp(-x * 25) * g * 1.2; add(buf, n, v, v); }
  },
  // clock ticking that speeds up
  clock(buf, t0, g) {
    let t = t0, gap = 0.5;
    for (let i = 0; i < 26 && t < t0 + 4.2; i++) {
      const s0 = Math.floor(t * SR), f = i % 2 ? 2400 : 1800;
      for (let n = s0; n < Math.min(N, s0 + SR * 0.03); n++) { const x = (n - s0) / SR, v = Math.sin(2 * Math.PI * f * x) * Math.exp(-x * 180) * g * 0.8; add(buf, n, v, v); }
      t += gap; gap = Math.max(0.08, gap * 0.82);
    }
  },
  // calendar page flips
  flip(buf, t0, g) {
    for (let i = 0; i < 3; i++) {
      const s0 = Math.floor((t0 + 0.25 + i * 0.4) * SR), bp = biquadBP();
      for (let n = s0; n < Math.min(N, s0 + SR * 0.16); n++) { const x = (n - s0) / SR, v = bp(rand(), 3000 + 2000 * x * 6, 1.1) * Math.sin(Math.PI * x / 0.16) * g * 0.8; add(buf, n, v * 0.8, v); }
    }
  },
  // disorienting "wom": low tone bending down with vibrato
  wobble(buf, t0, g) {
    const s0 = Math.floor(t0 * SR); let ph = 0;
    for (let n = s0; n < Math.min(N, s0 + SR * 0.9); n++) {
      const x = (n - s0) / SR;
      const f = 180 * Math.pow(0.55, x / 0.9) * (1 + 0.04 * Math.sin(2 * Math.PI * 6 * x));
      ph += f / SR;
      const e = Math.min(1, x / 0.03) * Math.exp(-x * 3.2);
      const v = (Math.sin(2 * Math.PI * ph) + 0.3 * Math.sin(4 * Math.PI * ph * 1.01)) * e * g;
      const [l, r] = panLR(Math.sin(x * 9) * 0.5);
      add(buf, n, v * l, v * r);
    }
  },
  // soft bubble pop
  pop(buf, t0, g) {
    const s0 = Math.floor(t0 * SR); let ph = 0;
    for (let n = s0; n < Math.min(N, s0 + SR * 0.15); n++) {
      const x = (n - s0) / SR;
      ph += (320 + 900 * Math.min(1, x / 0.05)) / SR;
      const v = Math.sin(2 * Math.PI * ph) * Math.exp(-x * 30) * g;
      add(buf, n, v, v);
    }
  },
  // UI blip, pitch rises with each call
  tick: (() => { let k = 0; return (buf, t0, g) => {
    const f = [880, 988, 1175, 1319][k++ % 4], s0 = Math.floor(t0 * SR);
    for (let n = s0; n < Math.min(N, s0 + SR * 0.12); n++) {
      const x = (n - s0) / SR;
      const v = (Math.sin(2 * Math.PI * f * x) + 0.3 * Math.sin(2 * Math.PI * f * 2 * x)) * Math.exp(-x * 38) * Math.min(1, x / 0.002) * g;
      const [l, r] = panLR([-0.4, 0.45, 0.5, -0.35][(k - 1) % 4]);
      add(buf, n, v * l, v * r);
    }
  }; })(),
  // airy whoosh with a pan sweep
  whoosh(buf, t0, g) {
    const dur = 0.7, s0 = Math.floor((t0 - 0.15) * SR), bpL = biquadBP(), bpR = biquadBP();
    for (let n = s0; n < Math.min(N, s0 + SR * dur); n++) {
      const x = (n - s0) / SR, k = x / dur;
      const e = Math.sin(Math.PI * Math.pow(k, 0.8)) ** 2;
      const fc = 300 + 2600 * Math.sin(Math.PI * k);
      const nz = rand();
      const [pl, pr] = panLR(0.8 - 1.6 * k);
      add(buf, n, bpL(nz, fc, 0.9) * e * g * 1.3 * pl, bpR(nz, fc * 1.05, 0.9) * e * g * 1.3 * pr);
    }
  },
  // "brain activation": rising harmonic shimmer + bloom
  activation(buf, t0, g) {
    const s0 = Math.floor(t0 * SR), dur = 1.4;
    const partials = [1, 1.5, 2, 3, 4, 5];
    for (let n = s0; n < Math.min(N, s0 + SR * dur); n++) {
      const x = (n - s0) / SR, k = x / dur;
      const e = Math.min(1, x / 0.25) * Math.pow(1 - k, 1.5);
      const base = mtof(65) * (1 + 0.5 * smooth(x / 0.5));
      let v = 0;
      partials.forEach((p, i) => { v += Math.sin(2 * Math.PI * base * p * x + i) * (1 / (i + 1.5)) * (0.6 + 0.4 * Math.sin(2 * Math.PI * (7 + i) * x)); });
      const [l, r] = panLR(Math.sin(x * 4) * 0.4);
      add(buf, n, v * e * g * 0.35 * l, v * e * g * 0.35 * r);
    }
  },
  // gentle logo chime: FM bells on F and C + soft low bloom
  logo(buf, t0, g) {
    const s0 = Math.floor(t0 * SR);
    [[mtof(77), 0], [mtof(84), 0.07], [mtof(89), 0.16]].forEach(([f, dt], j) => {
      const st = s0 + Math.floor(dt * SR);
      for (let n = st; n < Math.min(N, st + SR * 2.0); n++) {
        const x = (n - st) / SR;
        const e = Math.exp(-x * 2.4) * Math.min(1, x / 0.003);
        const v = Math.sin(2 * Math.PI * f * x + 1.6 * Math.exp(-x * 4) * Math.sin(2 * Math.PI * f * 3.5 * x)) * e * g * 0.28;
        const [l, r] = panLR([-0.3, 0.3, 0][j]);
        add(buf, n, v * l, v * r);
      }
    });
    for (let n = s0; n < Math.min(N, s0 + SR * 1.6); n++) {
      const x = (n - s0) / SR;
      const v = Math.sin(2 * Math.PI * mtof(41) * x) * Math.exp(-x * 2.6) * Math.min(1, x / 0.03) * g * 0.16;
      add(buf, n, v, v);
    }
  },
  // ---- Episode 4: coffee shop (each takes s.dur and stops with a fast release → the "sudden calm")
  // café ambience: low room murmur + occasional cup clinks
  cafe(buf, t0, g, s) {
    const dur = s?.dur ?? 4, s0 = Math.floor(t0 * SR), bp = biquadBP(), bp2 = biquadBP();
    for (let n = s0; n < Math.min(N, s0 + SR * dur); n++) {
      const x = (n - s0) / SR, env = Math.min(1, x / 0.4) * Math.min(1, (dur - x) / 0.25);
      const nz = rand(), v = (bp(nz, 420 + 60 * Math.sin(x * 2.3), 1.5) * 0.9 + bp2(nz, 1300, 3) * 0.35) * env * g * (0.8 + 0.2 * Math.sin(x * 3.1));
      add(buf, n, v * 0.9, v);
    }
    for (let k = 0; k < dur / 0.9; k++) {                                   // clinks
      const st = s0 + Math.floor((0.3 + k * 0.9 + (k % 3) * 0.23) * SR), f = [2800, 3300, 2500][k % 3], [l, r] = panLR(((k % 5) - 2) * 0.35);
      if ((st - s0) / SR > dur - 0.2) break;
      for (let n = st; n < Math.min(N, st + SR * 0.25); n++) { const x = (n - st) / SR, v = (Math.sin(2 * Math.PI * f * x) + 0.5 * Math.sin(2 * Math.PI * f * 2.7 * x)) * Math.exp(-x * 26) * g * 0.22; add(buf, n, v * l, v * r); }
    }
  },
  // fluorescent-light hum (mains buzz with harmonics)
  hum(buf, t0, g, s) {
    const dur = s?.dur ?? 3, s0 = Math.floor(t0 * SR);
    for (let n = s0; n < Math.min(N, s0 + SR * dur); n++) {
      const x = (n - s0) / SR, env = Math.min(1, x / 0.3) * Math.min(1, (dur - x) / 0.06);
      let v = 0; for (let hN = 1; hN <= 6; hN++) v += Math.sin(2 * Math.PI * 120 * hN * x) / hN;
      v = Math.tanh(v * 1.5) * env * g * 0.18 * (1 + 0.15 * Math.sin(x * 9));
      add(buf, n, v, v);
    }
  },
  // espresso steam wand: loud high hiss with gurgle
  espresso(buf, t0, g, s) {
    const dur = s?.dur ?? 3, s0 = Math.floor(t0 * SR), bp = biquadBP(), bp2 = biquadBP();
    for (let n = s0; n < Math.min(N, s0 + SR * dur); n++) {
      const x = (n - s0) / SR, env = Math.min(1, x / 0.15) * Math.min(1, (dur - x) / 0.06);
      const nz = rand(), gur = 0.5 + 0.5 * Math.sin(2 * Math.PI * (7 + 3 * Math.sin(x)) * x);
      const v = (bp(nz, 5200, 0.7) * 0.8 + bp2(nz, 900, 4) * 0.5 * gur) * env * g;
      add(buf, n, v * 1.0, v * 0.7);
    }
  },
  // blender: motor whine with a rough, rising pitch
  blender(buf, t0, g, s) {
    const dur = s?.dur ?? 3, s0 = Math.floor(t0 * SR), bp = biquadBP(); let ph = 0;
    for (let n = s0; n < Math.min(N, s0 + SR * dur); n++) {
      const x = (n - s0) / SR, env = Math.min(1, x / 0.2) * Math.min(1, (dur - x) / 0.06);
      ph += (180 + 90 * Math.min(1, x / 0.6) + 12 * Math.sin(x * 11)) / SR;
      const saw = 2 * (ph % 1) - 1, v = (Math.tanh(saw * 3) * 0.35 + bp(rand(), 2400, 1.2) * 0.5) * env * g * 0.7;
      add(buf, n, v * 0.7, v);
    }
  },
  // a big dial being turned down: ratchet clicks
  knob(buf, t0, g) {
    for (let k = 0; k < 8; k++) {
      const st = Math.floor((t0 + k * 0.085) * SR), bp = biquadBP(), f = 2600 - k * 90;
      for (let n = st; n < Math.min(N, st + SR * 0.05); n++) { const x = (n - st) / SR, v = (bp(rand(), f, 3) * 1.2 + Math.sin(2 * Math.PI * 900 * x) * 0.4) * Math.exp(-x * 120) * g; add(buf, n, v, v); }
    }
  },
};

function buildSfx() {
  const bus = stereo();
  for (const s of (EP ? EP.sfx : SB.sfx)) SFX[s.id](bus, s.at, s.gain * (AU.sfxGain ?? 1), s);
  mixInto(bus, reverb(bus, { room: 0.78, damp: 0.5, wet: 0.35 }), 1);
  return bus;
}

// ---------------------------------------------------------------- VOICE
function readWav(file) {
  const b = fs.readFileSync(file);
  let p = 12, fmt, data;
  while (p < b.length) {
    const id = b.toString('ascii', p, p + 4), size = b.readUInt32LE(p + 4);
    if (id === 'fmt ') fmt = { ch: b.readUInt16LE(p + 10), sr: b.readUInt32LE(p + 12), bits: b.readUInt16LE(p + 22) };
    if (id === 'data') data = b.subarray(p + 8, p + 8 + size);
    p += 8 + size + (size & 1);
  }
  const n = data.length / (fmt.bits / 8) / fmt.ch, out = new Float32Array(n);
  for (let i = 0; i < n; i++) out[i] = data.readInt16LE(i * fmt.ch * 2) / 32768;
  return { sr: fmt.sr, x: out };
}

function buildVoice() {
  const bus = stereo(), spans = [];
  for (const line of SB.voiceover) {
    const f = path.join(VOICE_DIR, `${line.id}.wav`);
    if (!fs.existsSync(f)) { console.warn(`  (missing ${line.id}.wav — run npm run voiceover)`); continue; }
    const { sr, x } = readWav(f);
    const ratio = sr / SR, len = Math.floor(x.length / ratio), s0 = Math.floor(line.at * SR);
    // resample (cubic), gentle high-pass + presence via a subtle exciter
    let hp = 0, prev = 0;
    for (let i = 0; i < len; i++) {
      const pos = i * ratio, k = Math.floor(pos), fr = pos - k;
      const y0 = x[k - 1] ?? 0, y1 = x[k] ?? 0, y2 = x[k + 1] ?? 0, y3 = x[k + 2] ?? 0;
      let v = y1 + 0.5 * fr * (y2 - y0 + fr * (2 * y0 - 5 * y1 + 4 * y2 - y3 + fr * (3 * (y1 - y2) + y3 - y0)));
      hp = 0.995 * (hp + v - prev); prev = v; v = hp;
      v = Math.tanh(v * 1.6) / 1.35; // soft compression
      add(bus, s0 + i, v * (AU.voiceGain ?? 1), v * (AU.voiceGain ?? 1));
    }
    spans.push([line.at, line.at + len / SR]);
  }
  mixInto(bus, reverb(bus, { room: 0.5, damp: 0.6, wet: 0.08, pre: 0.01 }), 1);
  return { bus, spans };
}

// ---------------------------------------------------------------- WAV out
function writeWav(file, buf, gain = 1) {
  const data = Buffer.alloc(N * 4);
  for (let n = 0; n < N; n++) for (let c = 0; c < 2; c++) data.writeInt16LE(Math.round(clamp(buf[c][n] * gain, -1, 1) * 32767), (n * 2 + c) * 2);
  const h = Buffer.alloc(44);
  h.write('RIFF', 0); h.writeUInt32LE(36 + data.length, 4); h.write('WAVE', 8); h.write('fmt ', 12);
  h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22); h.writeUInt32LE(SR, 24);
  h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34); h.write('data', 36); h.writeUInt32LE(data.length, 40);
  fs.writeFileSync(file, Buffer.concat([h, data]));
}
const peak = (buf) => { let p = 0; for (const ch of buf) for (const v of ch) p = Math.max(p, Math.abs(v)); return p; };

// ---------------------------------------------------------------- MIX
console.log('building music…');  const music = EP ? buildEpisodeMusic(EP.music) : buildMusic();
console.log('building sfx…');    const sfx = buildSfx();
console.log('placing voice…');   const { bus: voice, spans } = buildVoice();

// normalise stems individually, then mix with ducking under the voice
const norm = (b, target) => { const p = peak(b) || 1; for (const ch of b) for (let n = 0; n < N; n++) ch[n] *= target / p; };
norm(music, 0.5); norm(sfx, 0.55); if (peak(voice) > 0) norm(voice, 0.85);

const duck = AU.music?.duckUnderVoice ?? 0.5;
const mix = stereo();
const fadeIn = 0.25, fadeOut = 0.35;
for (let n = 0; n < N; n++) {
  const t = n / SR;
  let d = 0;
  for (const [a, b] of spans) d = Math.max(d, smooth((t - a + 0.15) / 0.2) * (1 - smooth((t - b) / 0.35)));
  const mg = (AU.music?.gain ?? 0.5) * 2 * (1 - d * (1 - duck));
  const master = (AU.masterGain ?? 0.9) * smooth(t / fadeIn) * (1 - smooth((t - (DUR - fadeOut)) / fadeOut) * 0.85);
  for (let c = 0; c < 2; c++) mix[c][n] = (music[c][n] * mg + sfx[c][n] * (AU.sfxGain ?? 1) + voice[c][n]) * master;
}
// episodes: lift towards ~-16 LUFS with a soft knee limiter (the intro keeps its original mix)
if (EP) {
  const drive = AU.episodeDrive ?? 1.3;
  for (const ch of mix) for (let n = 0; n < N; n++) { const v = ch[n] * drive, a = Math.abs(v); ch[n] = a < 0.8 ? v : Math.sign(v) * (0.8 + 0.18 * Math.tanh((a - 0.8) / 0.18)); }
}
// gentle bus limiter
const p = peak(mix);
const lim = p > 0.95 ? 0.95 / p : 1;

writeWav(path.join(OUT, 'music.wav'), music);
writeWav(path.join(OUT, 'sfx.wav'), sfx);
writeWav(path.join(OUT, 'voice.wav'), voice);
writeWav(path.join(OUT, 'mix.wav'), mix, lim);
console.log(`done → ${path.relative(ROOT, OUT)}/mix.wav  (peak ${(p * lim).toFixed(2)}, VO spans ${spans.map(([a, b]) => `${a.toFixed(2)}–${b.toFixed(2)}s`).join(', ')})`);
