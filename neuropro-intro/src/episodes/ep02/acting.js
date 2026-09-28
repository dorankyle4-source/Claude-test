// EPISODE 2 — mascot performance, studio camera and symptom icons.
// Same rig, set and icon system as Episode 1 (src/characters/mascot.js, src/backgrounds/studio.js, src/props/icons.js).

import { keys, prog, blinks, fnoise, outCubic, inCubic, inOutSine, inOutCubic, outBack, popScale, clamp, lerp } from '../../engine/anim.js';

const EXPR = {
  happy:      { smile: 0.7, open: 0.55, mouthW: 1, browLift: 0.1, browWorry: 0, browAsym: 0 },
  confident:  { smile: 0.8, open: 0.35, mouthW: 1.05, browLift: 0.3, browWorry: 0, browAsym: -0.2 },
  confused:   { smile: -0.1, open: 0.12, mouthW: 0.5, browLift: 0.6, browWorry: 0.3, browAsym: 0.9 },
  concerned:  { smile: -0.15, open: 0.12, mouthW: 0.7, browLift: 0.4, browWorry: 0.6, browAsym: 0.2 },
  wince:      { smile: -0.35, open: 0.1, mouthW: 0.8, browLift: 0.2, browWorry: 1, browAsym: 0.3 },
  frustrated: { smile: -0.45, open: 0.05, mouthW: 0.75, browLift: -0.2, browWorry: 0.2, browAsym: 0.4 },
  unsure:     { smile: 0.05, open: 0.12, mouthW: 0.75, browLift: 0.45, browWorry: 0.4, browAsym: 0.4 },
  curious:    { smile: 0.1, open: 0.35, mouthW: 0.55, browLift: 0.7, browWorry: 0.1, browAsym: -0.35 },
  relieved:   { smile: 0.85, open: 0.75, mouthW: 1.05, browLift: 0.35, browWorry: 0, browAsym: 0 },
  explain:    { smile: 0.6, open: 0.5, mouthW: 0.95, browLift: 0.5, browWorry: 0, browAsym: -0.2 },
  beaming:    { smile: 0.95, open: 0.9, mouthW: 1.08, browLift: 0.4, browWorry: 0, browAsym: 0 },
};
function exprTrack(t, track, fade = 0.3) {
  let cur = EXPR[track[0][1]];
  for (let i = 1; i < track.length; i++) {
    const [at, name] = track[i];
    if (t < at) break;
    const k = inOutSine(clamp((t - at) / fade)), nxt = EXPR[name];
    cur = Object.fromEntries(Object.keys(nxt).map((n) => [n, lerp(cur[n], nxt[n], k)]));
  }
  return cur;
}

export const MASCOT_Y = 1000, MASCOT_S = 1.0;
export const BODY_OFF = -335;                       // body centre relative to the feet
export const WALK1 = { from: 330, to: 860 };        // opening walk
export const WALK2 = { from: 700, to: 1150 };       // "good day / bad day" stroll
export const HOME_X = 700;                          // sections 1–4
export const HOME2_X = 1150;                        // sections 6–7 (where the stroll ends)

export const ICON_ARC = {
  headache: [188, 627], concentration: [274, 459], memory: [440, 336], dizziness: [700, 280], fatigue: [960, 336], fog: [1126, 459],
};
export const ICON_LIST = [
  { id: 'headache', label: 'Headache' }, { id: 'concentration', label: 'Concentration' }, { id: 'memory', label: 'Memory' },
  { id: 'dizziness', label: 'Dizziness' }, { id: 'fatigue', label: 'Fatigue' }, { id: 'fog', label: 'Brain fog' },
];

/** Mascot x position over the whole episode. */
export function mascotX(t, T) {
  if (t < T.split) {
    const wk = clamp(t / T.walkEnd);
    return lerp(WALK1.from, WALK1.to, wk < 0.85 ? (wk / 0.85) * 0.9 : 0.9 + outCubic((wk - 0.85) / 0.15) * 0.1);
  }
  if (t < T.toStudio) return WALK1.to;
  if (t < T.walkStart) return HOME_X;
  if (t < T.flucEnd) return lerp(WALK2.from, WALK2.to, prog(t, T.walkStart, T.flucEnd - 0.3));
  return HOME2_X;
}

// "good day / bad day" meter: 1 = good, 0 = bad
export function dayMeter(t, T) {
  return keys(t, [[T.meterIn, 0.55], [T.good1, 1, inOutCubic], [T.bad1, 0.05, inOutCubic], [T.good2, 1, inOutCubic], [T.bad2, 0.05, inOutCubic], [T.flucEnd, 0.6, inOutCubic]]);
}

// ---------------------------------------------------------------- camera
export function cameraAt(t, T) {
  let k = keys(t, [
    [0, { cx: 640, cy: 590, zoom: 1.0 }],
    [T.walkEnd, { cx: 860, cy: 590, zoom: 1.04 }],
    [T.split - 0.3, { cx: 860, cy: 570, zoom: 1.1 }],
    [T.split + 0.8, { cx: 1300, cy: 560, zoom: 1.0 }, inOutCubic],
    [T.toNeurons - 0.2, { cx: 1300, cy: 545, zoom: 1.06 }],
    [T.toNeurons + 0.9, { cx: 860, cy: 1000 + BODY_OFF, zoom: 2.8 }, inCubic],
    [T.toStudio, { cx: 700, cy: 560, zoom: 1.0 }, (x) => (x < 1 ? 0 : 1)],
    [T.feelEnd, { cx: 715, cy: 560, zoom: 1.03 }],
  ]);
  if (t >= T.feelEnd - 0.4 && t < T.ovStart + 0.8) {           // follow the stroll
    const follow = { cx: mascotX(t, T) + 250, cy: 560, zoom: 1.0 };
    const a = prog(t, T.feelEnd - 0.4, T.walkStart + 0.4, inOutSine), b = prog(t, T.ovStart - 0.2, T.ovStart + 0.8, inOutSine);
    const ov = { cx: 1150, cy: 560, zoom: 1.0 };
    k = { cx: lerp(lerp(k.cx, follow.cx, a), ov.cx, b), cy: 560, zoom: lerp(lerp(k.zoom, 1, a), 1, b) };
  } else if (t >= T.ovStart + 0.8) {
    k = keys(t, [
      [T.ovStart + 0.8, { cx: 1150, cy: 560, zoom: 1.0 }],
      [T.peak, { cx: 1150, cy: 560, zoom: 1.07 }],
      [T.calm + 0.8, { cx: 1150, cy: 560, zoom: 1.0 }],
      [T.clean, { cx: 1150, cy: 560, zoom: 1.0 }],
      [T.clean + 0.8, { cx: 1000, cy: 560, zoom: 1.0 }],
      [T.iris, { cx: 1010, cy: 550, zoom: 1.08 }],
    ]);
  }
  let sx = 0, sy = 0;
  const over = prog(t, T.lights, T.peak) * (1 - prog(t, T.calm - 0.3, T.calm + 0.2));
  sx += fnoise(t * 30, 1) * 5 * over; sy += fnoise(t * 30, 2) * 5 * over;
  return { cx: k.cx + sx, cy: k.cy + sy, zoom: k.zoom, roll: 0 };
}

// ---------------------------------------------------------------- mascot
export function mascotPose(t, T) {
  const s = T.symptoms;
  const x = mascotX(t, T);
  const idle = Math.sin((t / 1.7) * Math.PI * 2);
  let bob = 0, squash = 1 + idle * 0.012, tilt = fnoise(t * 0.5, 1) * 1.2;
  let footL = [0, 0], footR = [0, 0];
  let handL = null, handR = null, gloveL = { fist: 1 }, gloveR = { fist: 1 }, handAngL, handAngR, bendL = 40, bendR = 40;
  let eyeX = 0.05, eyeY = 0, turn = 0, dizzy = 0, squint = 0, excite = 0, blinkExtra = 0, order = 0, netLevel = 1;

  const walkCycle = (walking, stride, dist) => {
    const ph = (dist / stride) * Math.PI;
    footL = [-Math.sin(ph) * 26 * walking, Math.max(0, Math.cos(ph)) * 30 * walking];
    footR = [Math.sin(ph) * 26 * walking, Math.max(0, -Math.cos(ph)) * 30 * walking];
    bob += Math.abs(Math.sin(ph)) * 14 * walking;
    tilt += 3 * walking;
    handL = [-262 + Math.sin(ph) * 30 * walking, -185 - Math.abs(Math.sin(ph)) * 10 * walking];
    handR = [262 - Math.sin(ph) * 30 * walking, -185 - Math.abs(Math.cos(ph)) * 10 * walking];
    return ph;
  };

  const expr = exprTrack(t, [
    [0, 'happy'], [T.bubbleIn, 'confident'], [T.andThen, 'confused'], [T.terrible, 'wince'],
    [T.split, 'confident'], [T.toStudio, 'curious'],
    [s.headache, 'wince'], [s.concentration, 'unsure'], [s.memory, 'confused'], [s.dizziness, 'concerned'], [s.fatigue, 'concerned'], [s.fog, 'unsure'],
    [T.feelClear, 'happy'], [T.good1 - 0.3, 'happy'], [T.bad1 - 0.2, 'frustrated'], [T.good2 - 0.3, 'happy'], [T.bad2 - 0.2, 'frustrated'],
    [T.ovStart + 0.5, 'curious'], [T.laptop, 'unsure'], [T.lights, 'concerned'], [T.peak - 0.2, 'wince'], [T.calm + 0.4, 'relieved'],
    [T.note, 'explain'], [T.clean, 'confident'], [T.rest, 'explain'], [T.badgeIn, 'curious'], [T.thumbs, 'beaming'],
  ]);

  // ---------- 1 · walk in, "I thought I was fine…", then it hits ----------
  if (t < T.split) {
    const walking = 1 - prog(t, T.walkEnd - 0.25, T.walkEnd);
    walkCycle(walking, 150, x - WALK1.from);
    eyeX = 0.5 * walking + 0.05; turn = 0.35 * walking;
    if (t > T.andThen) { eyeX = Math.sin(t * 3) * 0.6; tilt += Math.sin(t * 2.2) * 3; }
    if (t > T.terrible) { handL = [-205, -470]; gloveL = { open: 1 }; handAngL = -140; bendL = 70; squint = 0.35; dizzy = 0.35 * prog(t, T.terrible, T.terrible + 0.4); }
  }
  // ---------- 2 · looks totally fine on the outside ----------
  if (t >= T.split && t < T.toStudio) {
    const hk = outBack(prog(t, T.split + 0.2, T.split + 0.6), 1.6);
    handL = [lerp(-262, -250, hk), lerp(-185, -250, hk)]; handR = [lerp(262, 250, hk), lerp(-185, -250, hk)];
    bendL = bendR = lerp(40, 90, hk);
    squash += 0.03 * hk; eyeX = -0.1; turn = -0.1;
    if (t > T.outsideCue) { eyeX = 0.9; turn = 0.3; }   // glances at the "inside" panel
  }
  // ---------- 4 · reacts to each symptom ----------
  if (t >= T.toStudio && t < T.feelEnd) {
    let cur = null; const since = (id) => t - s[id];
    for (const id of Object.keys(s)) if (t >= s[id]) cur = id;
    if (cur === 'headache') { handL = [-205, -470]; gloveL = { open: 1 }; handAngL = -140; bendL = 70; squint = 0.4; }
    if (cur === 'concentration') eyeX = Math.sign(Math.sin(since(cur) * 7)) * 0.9;
    if (cur === 'memory') { handL = [-215, -520 + Math.sin(since(cur) * 12) * 6]; gloveL = { open: 1 }; handAngL = -150; bendL = 70; eyeY = -0.9; eyeX = -0.4; }
    if (cur === 'dizziness') { tilt += Math.sin(since(cur) * 5) * 5; dizzy = 0.5; }
    if (cur === 'fatigue') { blinkExtra = 0.5; squash -= 0.05; tilt += 2; }
    if (cur === 'fog') { dizzy = 0.3; squint = 0.3; }
  }
  // ---------- 5 · good day / bad day stroll ----------
  if (t >= T.walkStart - 0.1 && t < T.flucEnd) {
    const m = dayMeter(t, T);
    const walking = prog(t, T.walkStart, T.walkStart + 0.4) * (1 - prog(t, T.flucEnd - 0.5, T.flucEnd - 0.2));
    walkCycle(walking * lerp(0.7, 1, m), 120, x - WALK2.from);
    eyeX = 0.5 * walking; turn = 0.3 * walking;
    const bad = 1 - m;
    squash -= 0.05 * bad; tilt += bad * 3; dizzy = 0.35 * bad;
    if (bad > 0.6) { eyeY = 0.3; eyeX = 0.2; handL = [-240, -175 + Math.sin(t * 14) * 4]; handR = [240, -175 + Math.sin(t * 14 + 1) * 4]; }
    if (m > 0.8) bob += Math.max(0, Math.sin(t * 6)) * 6;
  }
  // ---------- 6 · overload → hands over ears → calm ----------
  if (t >= T.ovStart && t < T.clean) {
    const over = prog(t, T.laptop, T.peak);
    const ears = outBack(prog(t, T.peak - 0.1, T.peak + 0.3), 1.5) * (1 - prog(t, T.calm, T.calm + 0.5, inOutCubic));
    eyeX = Math.sin(t * (2 + over * 6)) * 0.8 * over * (1 - ears); turn = eyeX * 0.3;
    tilt += Math.sin(t * 4) * 2 * over * (1 - ears);
    dizzy = 0.5 * over * (1 - prog(t, T.calm, T.calm + 1.2));
    if (ears > 0.01) {
      handL = [lerp(-262, -250, ears), lerp(-185, -380, ears)]; handR = [lerp(262, 250, ears), lerp(-185, -380, ears)];
      gloveL = gloveR = { open: clamp(ears) }; handAngL = 190; handAngR = 170; bendL = bendR = 60;
      blinkExtra = 0.85 * ears; squash -= 0.05 * ears;
    }
    // calm: a deep breath
    const br = t - T.calm;
    if (br > 0 && br < 2.2) { squash += Math.sin((br / 2.2) * Math.PI) * 0.05; blinkExtra = Math.max(blinkExtra, br < 1.4 ? 0.85 * (1 - prog(br, 1.0, 1.4)) : 0); }
    if (t > T.note) { eyeX = 0.7; turn = 0.3; }
  }
  // ---------- 7 · takeaway ----------
  if (t >= T.clean) {
    squash += 0.02 * prog(t, T.clean, T.clean + 0.5);
    for (const [at, y] of [[T.rest, -560], [T.recover, -440], [T.evaluate, -320]]) {
      if (t > at && t < at + 0.7) { eyeX = -1; turn = -0.45; eyeY = -0.2; }
    }
    if (t > T.badgeIn && t < T.thumbs) { eyeX = 1; turn = 0.45; eyeY = -0.4; }
    const th = outBack(prog(t, T.thumbs, T.thumbs + 0.35), 2);
    if (th > 0.01) { handR = [lerp(262, 308, th), lerp(-185, -470, th)]; gloveR = { fist: 1 - clamp(th), thumb: clamp(th) }; handAngR = lerp(-10, 0, clamp(th)); bendR = 50; excite = prog(t, T.thumbs + 0.05, T.thumbs + 0.4); eyeX = 0; turn = 0.05; }
    const hk = t - (T.thumbs - 0.15);
    if (hk > -0.15 && hk < 0.9) {
      if (hk < 0) squash -= 0.1 * outCubic((hk + 0.15) / 0.15);
      else if (hk < 0.4) { const k = hk / 0.4; bob += Math.sin(k * Math.PI) * 60; squash += 0.08 * Math.sin(k * Math.PI); }
      else squash -= 0.08 * Math.exp(-(hk - 0.4) * 10) * Math.cos((hk - 0.4) * 18);
    }
  }

  const blink = Math.max(blinkExtra, blinks(t, [1.4, 5.1, 12.2, 15.6, 31.8, 35.6, 41.4, 45.1, 49.2, 52.6, 60.4, 63.8, 68.9, 71.4, 74.2]));
  return {
    t, x, y: MASCOT_Y, s: MASCOT_S, bob, squash, tilt, footL, footR, turn, eyeX, eyeY, blink, squint, dizzy, excite, order, netLevel,
    ...expr, handL, handR, gloveL, gloveR, handAngL, handAngR, bendL, bendR,
  };
}

// ---------------------------------------------------------------- icons
export function iconStates(t, T) {
  const out = {};
  for (const ic of ICON_LIST) out[ic.id] = { x: 0, y: 0, sx: 0, sy: 0, opacity: 0 };
  // section 1: it hits "later" — headache + dizziness pop by the head
  for (const [id, dt, pos] of [['headache', 0, [640, 380]], ['dizziness', 0.25, [1080, 360]]]) {
    const at = T.terrible + dt;
    if (t < at || t > T.split + 0.3) continue;
    const p = popScale(t, at, 0.45, 0.2), gone = prog(t, T.split - 0.2, T.split + 0.2);
    out[id] = { x: pos[0], y: pos[1] + Math.sin(t * 2 + dt) * 5, sx: 0.8 * p.sx * (1 - gone), sy: 0.8 * p.sy * (1 - gone), opacity: 1 - gone, labelOpacity: 0 };
  }
  // section 4: the arc, synced to the narration
  for (const ic of ICON_LIST) {
    const at = T.symptoms[ic.id];
    if (t < at || t > T.feelEnd + 0.3) continue;
    const i = ICON_LIST.indexOf(ic);
    const p = popScale(t, at, 0.45, 0.2), [x, y] = ICON_ARC[ic.id];
    const gone = prog(t, T.feelClear + i * 0.04, T.feelClear + 0.3 + i * 0.04, inCubic);
    out[ic.id] = { x, y: y + Math.sin(t * 1.8 + x * 0.01) * 5 - gone * 60, sx: p.sx * (1 - gone), sy: p.sy * (1 - gone), opacity: p.k > 0 ? 1 - gone : 0, labelOpacity: prog(t, at + 0.15, at + 0.4) * (1 - gone) };
  }
  return out;
}
