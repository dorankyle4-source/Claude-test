// Timing, easing and procedural-motion helpers.
// Every animated value in the project is a pure function of time `t` (seconds),
// so any frame can be rendered independently and deterministically.

export const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
export const lerp = (a, b, k) => a + (b - a) * k;
export const invLerp = (a, b, v) => clamp((v - a) / (b - a));
/** Normalised progress of t through [a, b], optionally eased. */
export const prog = (t, a, b, ease = linear) => ease(invLerp(a, b, t));

export const linear = (k) => k;
export const inOutSine = (k) => 0.5 - 0.5 * Math.cos(Math.PI * k);
export const outSine = (k) => Math.sin((Math.PI * k) / 2);
export const inSine = (k) => 1 - Math.cos((Math.PI * k) / 2);
export const inOutCubic = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const outCubic = (k) => 1 - Math.pow(1 - k, 3);
export const inCubic = (k) => k * k * k;
export const outQuart = (k) => 1 - Math.pow(1 - k, 4);
export const outExpo = (k) => (k === 1 ? 1 : 1 - Math.pow(2, -10 * k));
export const inOutExpo = (k) =>
  k === 0 ? 0 : k === 1 ? 1 : k < 0.5 ? Math.pow(2, 20 * k - 10) / 2 : (2 - Math.pow(2, -20 * k + 10)) / 2;
export const outBack = (k, s = 1.70158) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2);
export const outElastic = (k) =>
  k === 0 ? 0 : k === 1 ? 1 : Math.pow(2, -10 * k) * Math.sin((k * 10 - 0.75) * ((2 * Math.PI) / 3)) + 1;

/** Damped spring response 0→1 (with overshoot) for "settle" moves. */
export const spring = (k, freq = 2.2, damp = 5.5) =>
  k <= 0 ? 0 : 1 - Math.exp(-damp * k) * Math.cos(freq * Math.PI * 2 * k);

/**
 * Keyframe interpolation.
 * keys: [[time, value, easeIntoThisKey?], ...] sorted by time. Values may be numbers or flat objects of numbers.
 */
export function keys(t, ks, defaultEase = inOutSine) {
  if (t <= ks[0][0]) return ks[0][1];
  for (let i = 1; i < ks.length; i++) {
    const [t1, v1, e] = ks[i];
    if (t <= t1) {
      const [t0, v0] = ks[i - 1];
      const k = (e || defaultEase)((t - t0) / (t1 - t0));
      return mix(v0, v1, k);
    }
  }
  return ks[ks.length - 1][1];
}

/** Blend two numbers or two flat objects of numbers. */
export function mix(a, b, k) {
  if (typeof a === 'number') return lerp(a, b, k);
  const out = {};
  for (const key in a) out[key] = typeof a[key] === 'number' ? lerp(a[key], b[key] ?? a[key], k) : a[key];
  return out;
}

// ---- Smooth value noise (deterministic) for organic idle motion ----
function hash(n) {
  const s = Math.sin(n * 127.1 + 311.7) * 43758.5453123;
  return s - Math.floor(s);
}
export function noise(t, seed = 0) {
  const i = Math.floor(t);
  const f = t - i;
  const u = f * f * (3 - 2 * f);
  return lerp(hash(i + seed * 57.3), hash(i + 1 + seed * 57.3), u) * 2 - 1;
}
/** Fractal noise: a couple of octaves, roughly in [-1, 1]. */
export const fnoise = (t, seed = 0) => noise(t, seed) * 0.65 + noise(t * 2.3, seed + 9.1) * 0.35;

/** Blink curve: 0 = open, 1 = closed. Fast close, slightly slower open. */
export function blink(t, at, dur = 0.16) {
  const k = (t - at) / dur;
  if (k < 0 || k > 1) return 0;
  return k < 0.4 ? outSine(k / 0.4) : 1 - inOutSine((k - 0.4) / 0.6);
}
export const blinks = (t, times, dur) => times.reduce((m, at) => Math.max(m, blink(t, at, dur)), 0);

/** A "pop" scale with squash & stretch: returns {sx, sy} over [at, at+dur]. */
export function popScale(t, at, dur = 0.45, amount = 0.18) {
  const k = invLerp(at, at + dur, t);
  if (k <= 0) return { sx: 0, sy: 0, k };
  const s = outBack(k, 2.2);
  const wob = Math.sin(k * Math.PI * 2.5) * (1 - k) * amount;
  return { sx: s * (1 + wob), sy: s * (1 - wob), k };
}

/**
 * Two-bone IK in the rig's angle convention: angle θ means the bone points along (-sin θ, cos θ),
 * i.e. θ = 0 hangs straight down and SVG rotate(θ) is applied to a bone drawn along +y.
 * bend = +1 / -1 chooses which side the elbow/knee goes.
 */
export function ik2(sx, sy, tx, ty, l1, l2, bend = 1) {
  let dx = tx - sx, dy = ty - sy;
  let d = Math.hypot(dx, dy);
  const maxD = (l1 + l2) * 0.9995;
  if (d > maxD) { dx *= maxD / d; dy *= maxD / d; d = maxD; }
  d = Math.max(d, Math.abs(l1 - l2) + 1e-3);
  const base = Math.atan2(-dx, dy);
  const cosA = clamp((l1 * l1 + d * d - l2 * l2) / (2 * l1 * d), -1, 1);
  const a = Math.acos(cosA) * bend;
  const upper = base + a;
  // Elbow position, then the forearm's absolute angle.
  const ex = sx - Math.sin(upper) * l1, ey = sy + Math.cos(upper) * l1;
  const lower = Math.atan2(-(tx - ex), ty - ey);
  const deg = 180 / Math.PI;
  return { upper: upper * deg, lower: (lower - upper) * deg, elbow: [ex, ey] };
}

export const deg2rad = (d) => (d * Math.PI) / 180;
