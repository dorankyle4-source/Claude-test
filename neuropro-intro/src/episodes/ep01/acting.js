// EPISODE 1 — mascot performance, world camera and symptom icons (studio sections: 1, 4, 5, 6, 7).
// All times come from the timeline (T), which follows the measured narration.

import { keys, prog, blinks, fnoise, outCubic, inCubic, inOutSine, inOutCubic, outBack, spring, popScale, clamp, lerp } from '../../engine/anim.js';

const EXPR = {
  happy:     { smile: 0.7, open: 0.55, mouthW: 1, browLift: 0.1, browWorry: 0, browAsym: 0 },
  surprised: { smile: 0, open: 0.75, mouthW: 0.45, browLift: 1, browWorry: 0.1, browAsym: 0 },
  curious:   { smile: 0.1, open: 0.35, mouthW: 0.55, browLift: 0.7, browWorry: 0.1, browAsym: -0.35 },
  concerned: { smile: -0.15, open: 0.12, mouthW: 0.7, browLift: 0.4, browWorry: 0.6, browAsym: 0.2 },
  wince:     { smile: -0.35, open: 0.1, mouthW: 0.8, browLift: 0.2, browWorry: 1, browAsym: 0.3 },
  confused:  { smile: -0.1, open: 0.12, mouthW: 0.5, browLift: 0.6, browWorry: 0.3, browAsym: 0.9 },
  explain:   { smile: 0.6, open: 0.5, mouthW: 0.95, browLift: 0.5, browWorry: 0, browAsym: -0.2 },
  unsure:    { smile: 0.05, open: 0.12, mouthW: 0.75, browLift: 0.45, browWorry: 0.4, browAsym: 0.4 },
  beaming:   { smile: 0.95, open: 0.9, mouthW: 1.08, browLift: 0.4, browWorry: 0, browAsym: 0 },
};
/** Expression track: [[time, name], ...] crossfading over `fade` seconds. */
function exprTrack(t, track, fade = 0.3) {
  let cur = EXPR[track[0][1]];
  for (let i = 1; i < track.length; i++) {
    const [at, name] = track[i];
    if (t < at) break;
    const k = clamp((t - at) / fade);
    const nxt = EXPR[name];
    cur = Object.fromEntries(Object.keys(nxt).map((n) => [n, lerp(cur[n], nxt[n], inOutSine(k))]));
  }
  return cur;
}

export const MASCOT_Y = 1000, MASCOT_S = 1.0;
export const HOME_X = 700;                         // mascot position from section 4 on
export const WALK = { from: 330, to: 860 };        // hook walk
export const BODY_CY = MASCOT_Y - 335 * MASCOT_S;  // body centre (world)

export const ICON_ARC = {
  headache: [188, 627], dizziness: [274, 459], fatigue: [440, 336], fog: [700, 280],
  concentration: [960, 336], memory: [1126, 459], lightNoise: [1212, 627],
};
export const ICON_LIST = [
  { id: 'headache', label: 'Headache' }, { id: 'dizziness', label: 'Dizziness' }, { id: 'fatigue', label: 'Fatigue' },
  { id: 'fog', label: 'Brain fog' }, { id: 'concentration', label: 'Concentration' }, { id: 'memory', label: 'Memory' },
  { id: 'lightNoise', label: 'Light & noise' },
];

// ---------------------------------------------------------------- camera
export function cameraAt(t, T) {
  const k = keys(t, [
    [0, { cx: 640, cy: 590, zoom: 1.0 }],
    [T.walkEnd, { cx: 860, cy: 590, zoom: 1.04 }],
    [T.toAnatomy - 0.3, { cx: 860, cy: 560, zoom: 1.12 }],
    [T.toAnatomy, { cx: 860, cy: 610, zoom: 1.16 }],
    [T.toAnatomy + 0.9, { cx: 860, cy: BODY_CY, zoom: 2.8 }, inCubic],
    [T.toStudio, { cx: 700, cy: 560, zoom: 1.0 }, (x) => (x < 1 ? 0 : 1)],
    [T.koClear - 0.2, { cx: 715, cy: 560, zoom: 1.03 }],
    [T.fall, { cx: 930, cy: 560, zoom: 1.0 }],
    [T.timeEnd, { cx: 950, cy: 560, zoom: 1.03 }],
    [T.takeaway + 0.6, { cx: 910, cy: 560, zoom: 1.0 }],
    [T.iris, { cx: 890, cy: 550, zoom: 1.08 }],
  ]);
  let sx = 0, sy = 0;
  for (const [at, amp] of [[T.jolt, 16], [T.fall + 0.35, 10], [T.stamp, 16]]) {
    const u = t - at;
    if (u > 0 && u < 0.6) { const e = amp * Math.exp(-u * 8); sx += fnoise(t * 40, at) * e; sy += fnoise(t * 40, at + 5) * e; }
  }
  return { cx: k.cx + sx, cy: k.cy + sy, zoom: k.zoom, roll: 0 };
}

// ---------------------------------------------------------------- mascot
export function mascotPose(t, T) {
  const s = T.symptoms;
  const idle = Math.sin((t / 1.7) * Math.PI * 2);
  let x = HOME_X, bob = 0, squash = 1 + idle * 0.012, tilt = fnoise(t * 0.5, 1) * 1.2;
  let footL = [0, 0], footR = [0, 0];
  let handL = null, handR = null, gloveL = { fist: 1 }, gloveR = { fist: 1 }, handAngL, handAngR, bendL = 40, bendR = 40;
  let eyeX = 0.05, eyeY = 0, turn = 0, eyeScale = 1, dizzy = 0, squint = 0, excite = 0, fall = 0, blinkExtra = 0;

  // ---------- 1 · hook: walk in, jolt, surprise ----------
  if (t < T.toStudio) {
    const wk = clamp(t / T.walkEnd);
    const eased = wk < 0.85 ? wk / 0.85 * 0.9 : 0.9 + outCubic((wk - 0.85) / 0.15) * 0.1;
    x = lerp(WALK.from, WALK.to, eased);
    const walking = 1 - prog(t, T.walkEnd - 0.25, T.walkEnd);
    const ph = ((x - WALK.from) / 150) * Math.PI;
    footL = [-Math.sin(ph) * 26 * walking, Math.max(0, Math.cos(ph)) * 30 * walking];
    footR = [Math.sin(ph) * 26 * walking, Math.max(0, -Math.cos(ph)) * 30 * walking];
    bob = Math.abs(Math.sin(ph)) * 14 * walking;
    tilt += 3 * walking;
    handL = [-262 + Math.sin(ph) * 30 * walking, -185 - Math.abs(Math.sin(ph)) * 10 * walking];
    handR = [262 - Math.sin(ph) * 30 * walking, -185 - Math.abs(Math.cos(ph)) * 10 * walking];
    eyeX = 0.5 * walking + 0.05; turn = 0.35 * walking;

    // jolt: squash, jerk, little hop, hands up
    const j = t - T.jolt;
    if (j > 0) {
      squash -= Math.max(0, Math.sin(clamp(j / 0.25) * Math.PI)) * 0.14;
      tilt += Math.exp(-j * 4) * Math.sin(j * 16) * 9;
      bob += Math.max(0, Math.sin(clamp((j - 0.12) / 0.35) * Math.PI)) * 30;
      const up = outBack(prog(t, T.jolt + 0.05, T.jolt + 0.35), 2) * (1 - prog(t, T.jolt + 2.2, T.jolt + 2.8));
      handL = [lerp(-262, -300, up), lerp(-185, -330, up)]; handR = [lerp(262, 300, up), lerp(-185, -330, up)];
      gloveL = gloveR = { fist: 1 - up, open: up };
      eyeScale = 1 + 0.2 * prog(t, T.jolt, T.jolt + 0.15) * (1 - prog(t, T.jolt + 1.6, T.jolt + 2.2));
      eyeX = lerp(eyeX, 0, prog(t, T.jolt, T.jolt + 0.3));
      turn = lerp(turn, 0, prog(t, T.jolt, T.jolt + 0.3));
      const lookUp = prog(t, T.hookTextIn + 0.6, T.hookTextIn + 1.1);
      eyeY = -0.8 * lookUp * (1 - prog(t, T.toAnatomy - 0.8, T.toAnatomy - 0.4));
    }
  }
  const hookExpr = exprTrack(t, [[0, 'happy'], [T.jolt, 'surprised'], [T.jolt + 1.8, 'curious']], 0.15);

  // ---------- 4 · symptoms: subtle reactions per symptom ----------
  let expr = hookExpr;
  if (t >= T.toStudio) {
    const order = ['headache', 'dizziness', 'fatigue', 'fog', 'concentration', 'memory', 'lightNoise'];
    let cur = null;
    for (const id of order) if (t >= s[id]) cur = id;
    const since = cur ? t - s[cur] : 0;
    expr = exprTrack(t, [[T.toStudio, 'curious'], [s.headache, 'wince'], [s.dizziness, 'concerned'], [s.fatigue, 'concerned'],
      [s.concentration, 'unsure'], [s.memory, 'confused'], [s.lightNoise, 'wince'], [T.symptomsEnd - 1.2, 'concerned'],
      [T.fall, 'surprised'], [T.popUp + 0.3, 'confused'], [T.stamp + 0.3, 'explain'], [T.inFact + 1.5, 'happy'],
      [T.feelFine, 'happy'], [T.hours + 0.3, 'unsure'], [T.days + 0.3, 'concerned'], [T.payAttention + 0.3, 'curious'],
      [T.takeaway, 'happy'], [T.stop, 'explain'], [T.brainInjury2, 'curious'], [T.yourBrain, 'beaming']]);
    const inSym = t < T.symptomsEnd;
    if (inSym && cur === 'headache') { handL = [-205, -470]; gloveL = { open: 1 }; handAngL = -140; bendL = 70; squint = 0.4; }
    if (inSym && cur === 'dizziness') { tilt += Math.sin(since * 5) * 5; dizzy = 0.5; }
    if (inSym && cur === 'fatigue') { blinkExtra = 0.5; squash -= 0.05; tilt += 2; }
    if (inSym && cur === 'fog') { dizzy = 0.3; squint = 0.3; blinkExtra = Math.max(0, Math.sin(since * 6)) * 0.4; }
    if (inSym && cur === 'concentration') { eyeX = Math.sign(Math.sin(since * 7)) * 0.9; }
    if (inSym && cur === 'memory') { handL = [-215, -520 + Math.sin(since * 12) * 6]; gloveL = { open: 1 }; handAngL = -150; bendL = 70; eyeY = -0.9; eyeX = -0.4; }
    if (inSym && cur === 'lightNoise') { handR = [120, -470]; gloveR = { open: 1 }; handAngR = 150; bendR = -30; squint = 0.6; turn = -0.3; eyeX = -0.3; }

    // ---------- 5 · knocked over, pops back up, points at the message ----------
    const fk = prog(t, T.fall, T.fall + 0.35, inCubic);
    const up = t > T.popUp ? spring(clamp((t - T.popUp) / 0.9), 1.4, 5) : 0;
    fall = -88 * fk * (1 - up) + (t > T.fall + 0.35 && t < T.popUp ? Math.sin((t - T.fall - 0.35) * 30) * Math.exp(-(t - T.fall - 0.35) * 10) * 4 : 0);
    if (t > T.fall && t < T.popUp + 0.6) { eyeScale = 1.15; handL = [-300, -330]; handR = [300, -330]; gloveL = gloveR = { open: 1 }; }
    if (t > T.popUp && t < T.popUp + 0.6) { bob += Math.sin(clamp((t - T.popUp) / 0.5) * Math.PI) * 40; }
    if (t > T.popUp + 0.3 && t < T.stamp) { eyeX = Math.sin(t * 4) * 0.8; tilt += Math.sin(t * 2) * 3; }
    if (t > T.stamp && t < T.stamp + 0.3) squash -= Math.sin(clamp((t - T.stamp) / 0.3) * Math.PI) * 0.1;
    const pt = outBack(prog(t, T.point, T.point + 0.35), 1.8) * (1 - prog(t, T.inFact + 1.2, T.inFact + 1.6));
    if (pt > 0.01) { handR = [lerp(262, 345, pt), lerp(-185, -420, pt)]; gloveR = { fist: 1 - clamp(pt), point: clamp(pt) }; handAngR = -95; bendR = 30; eyeX = 1; turn = 0.45; eyeY = -0.3; }
    if (t > T.inFact && t < T.koEnd) { eyeX = lerp(eyeX, 0.1, prog(t, T.inFact + 1.2, T.inFact + 1.6)); turn = lerp(turn, 0.05, prog(t, T.inFact + 1.2, T.inFact + 1.6)); }

    // ---------- 6 · feels fine → symptoms creep in → pay attention ----------
    if (t > T.koEnd && t < T.timeEnd) {
      if (t > T.rightAway - 0.2) { eyeX = 1; turn = 0.4; eyeY = -0.2; }                       // looks at the clock
      if (t > T.hours + 0.3) { dizzy = 0.2 * prog(t, T.hours + 0.3, T.days + 1) + 0.15 * prog(t, T.days, T.days + 1); }
      if (t > T.days + 0.5 && t < T.payAttention) { eyeX = 0; turn = 0; eyeY = 0.2; handL = [-205, -470]; gloveL = { open: 1 }; handAngL = -140; bendL = 70; }
      if (t > T.payAttention) { eyeX = 1; turn = 0.4; dizzy *= 1 - prog(t, T.payAttention + 2, T.timeEnd); }
    }

    // ---------- 7 · takeaway: stop, get evaluated, "I'm your brain", thumbs up ----------
    if (t > T.takeaway) {
      squash += 0.02 * prog(t, T.takeaway, T.takeaway + 0.5);
      const st = outBack(prog(t, T.stop, T.stop + 0.35), 1.8) * (1 - prog(t, T.evaluate - 0.1, T.evaluate + 0.2));
      if (st > 0.01) { handR = [lerp(262, 320, st), lerp(-185, -470, st)]; gloveR = { open: 1 }; handAngR = 180; bendR = 30; eyeX = 0; turn = 0; }
      const ev = outBack(prog(t, T.evaluate, T.evaluate + 0.35), 1.8) * (1 - prog(t, T.chipsOut, T.chipsOut + 0.3));
      if (ev > 0.01) { handR = [lerp(262, 345, ev), lerp(-185, -380, ev)]; gloveR = { fist: 1 - clamp(ev), point: clamp(ev) }; handAngR = -95; bendR = 30; eyeX = 1; turn = 0.4; }
      if (t > T.badgeIn && t < T.yourBrain) { eyeX = 1; turn = 0.45; eyeY = -0.4; }
      const tada = outBack(prog(t, T.yourBrain, T.yourBrain + 0.4), 1.6) * (1 - prog(t, T.learn - 0.1, T.learn + 0.15));
      if (tada > 0.01) { handL = [lerp(-262, -330, tada), lerp(-185, -400, tada)]; handR = [lerp(262, 330, tada), lerp(-185, -400, tada)]; gloveL = gloveR = { open: clamp(tada) }; eyeX = 0; turn = 0; }
      const th = outBack(prog(t, T.learn, T.learn + 0.35), 2);
      if (th > 0.01) { handR = [lerp(262, 308, th), lerp(-185, -470, th)]; gloveR = { fist: 1 - clamp(th), thumb: clamp(th) }; handAngR = lerp(-10, 0, clamp(th)); bendR = 50; excite = prog(t, T.learn + 0.05, T.learn + 0.4); eyeX = 0; turn = 0.05; }
      const hk = t - (T.learn - 0.15);
      if (hk > -0.15 && hk < 0.9) {
        if (hk < 0) squash -= 0.1 * outCubic((hk + 0.15) / 0.15);
        else if (hk < 0.4) { const k = hk / 0.4; bob += Math.sin(k * Math.PI) * 60; squash += 0.08 * Math.sin(k * Math.PI); }
        else squash -= 0.08 * Math.exp(-(hk - 0.4) * 10) * Math.cos((hk - 0.4) * 18);
      }
    }
  }

  const blink = Math.max(blinkExtra, blinks(t, [0.9, 3.4, 5.2, 34.2, 38.8, 41.9, 45.9, 49.6, 53.2, 57.2, 59.4, 63.2, 66.1, 70.3, 73.6, 77.2, 80.2]));
  return {
    t, x, y: MASCOT_Y, s: MASCOT_S, bob, squash, tilt, fall, fallPivot: [-120, 0],
    footL, footR, turn, eyeX, eyeY, eyeScale, blink, squint, dizzy, excite,
    ...expr,
    handL, handR, gloveL, gloveR, handAngL, handAngR, bendL, bendR,
  };
}

// ---------------------------------------------------------------- icons
export function iconStates(t, T) {
  const out = {};
  const s = T.symptoms;
  for (const ic of ICON_LIST) {
    let st = { x: 0, y: 0, sx: 0, sy: 0, opacity: 0 };
    // section 4: arc around the brain, one per narrated symptom
    if (t >= s[ic.id] && t < T.fall) {
      const p = popScale(t, s[ic.id], 0.45, 0.2);
      const [x, y] = ICON_ARC[ic.id];
      const gone = prog(t, T.koClear + (ICON_LIST.indexOf(ic) * 0.04), T.koClear + 0.3 + ICON_LIST.indexOf(ic) * 0.04, inCubic);
      st = { x, y: y + Math.sin(t * 1.8 + x * 0.01) * 5 - gone * 60, sx: p.sx * (1 - gone), sy: p.sy * (1 - gone), opacity: p.k > 0 ? 1 - gone : 0, labelOpacity: prog(t, s[ic.id] + 0.15, s[ic.id] + 0.4) * (1 - gone) };
    }
    out[ic.id] = st;
  }
  // section 6: symptoms creep in hours/days later, smaller and softer
  const creep = [['headache', T.hours + 0.45, [470, 420]], ['fog', T.days + 0.35, [930, 395]], ['fatigue', T.days + 1.2, [960, 590]]];
  for (const [id, at, [x, y]] of creep) {
    if (t < at || t > T.timeEnd + 0.4) continue;
    const k = prog(t, at, at + 0.8, outCubic), gone = prog(t, T.timeEnd - 0.2, T.timeEnd + 0.3);
    out[id] = { x, y: y + Math.sin(t * 1.6 + x) * 5, sx: 0.78 * k * (1 - gone * 0.5), sy: 0.78 * k * (1 - gone * 0.5), opacity: k * 0.9 * (1 - gone), labelOpacity: k * 0.9 * (1 - gone) };
  }
  return out;
}
