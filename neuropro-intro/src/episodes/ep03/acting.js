// EPISODE 3 — mascot performance, camera, props and icons. Same rig/set/icons as Episodes 1–2.

import { keys, prog, blinks, fnoise, outCubic, inCubic, inOutSine, inOutCubic, outBack, clamp, lerp } from '../../engine/anim.js';
import { DESK } from './props.js';

const EXPR = {
  happy:      { smile: 0.7, open: 0.55, mouthW: 1, browLift: 0.1, browWorry: 0, browAsym: 0 },
  focused:    { smile: 0.15, open: 0.05, mouthW: 0.7, browLift: -0.1, browWorry: 0.2, browAsym: 0 },
  confused:   { smile: -0.1, open: 0.12, mouthW: 0.5, browLift: 0.6, browWorry: 0.3, browAsym: 0.9 },
  concerned:  { smile: -0.15, open: 0.12, mouthW: 0.7, browLift: 0.4, browWorry: 0.6, browAsym: 0.2 },
  wince:      { smile: -0.35, open: 0.1, mouthW: 0.8, browLift: 0.2, browWorry: 1, browAsym: 0.3 },
  frustrated: { smile: -0.45, open: 0.05, mouthW: 0.75, browLift: -0.2, browWorry: 0.2, browAsym: 0.4 },
  tired:      { smile: -0.2, open: 0.08, mouthW: 0.6, browLift: 0.1, browWorry: 0.5, browAsym: 0 },
  frozen:     { smile: -0.05, open: 0.3, mouthW: 0.35, browLift: 0.8, browWorry: 0.2, browAsym: 0 },
  unsure:     { smile: 0.05, open: 0.12, mouthW: 0.75, browLift: 0.45, browWorry: 0.4, browAsym: 0.4 },
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

export const MX = 760;                 // the Brain's x (all sections)
export const SEAT_Y = 1060, STAND_Y = 1000, BODY_OFF = -335;
export const seated = (t, T) => t < T.toStudio;
export const mascotY = (t, T) => (seated(t, T) ? SEAT_Y : STAND_Y);
export const ICON_LIST = [{ id: 'fog', label: 'Brain fog' }];

// ---------------------------------------------------------------- camera
export function cameraAt(t, T) {
  const k = keys(t, [
    [0, { cx: 880, cy: 620, zoom: 1.04 }],
    [T.fogIn, { cx: 860, cy: 600, zoom: 1.12 }],
    [T.fogStart + 0.8, { cx: 1010, cy: 580, zoom: 1.0 }],
    [T.feelStart, { cx: 1020, cy: 580, zoom: 1.02 }],
    [T.feelStart + 0.8, { cx: 1120, cy: 570, zoom: 1.0 }],
    [T.lazyStart, { cx: 1120, cy: 570, zoom: 1.0 }],
    [T.lazyStart + 0.8, { cx: 960, cy: 590, zoom: 1.04 }],
    [T.toNeurons - 0.2, { cx: 900, cy: 620, zoom: 1.1 }],
    [T.toNeurons + 0.9, { cx: MX, cy: SEAT_Y + BODY_OFF, zoom: 2.8 }, inCubic],
    [T.toStudio, { cx: 1000, cy: 560, zoom: 1.0 }, (x) => (x < 1 ? 0 : 1)],
    [T.freeze, { cx: 1000, cy: 560, zoom: 1.05 }],
    [T.relax, { cx: 1000, cy: 560, zoom: 1.0 }],
    [T.clean + 0.6, { cx: 960, cy: 560, zoom: 1.0 }],
    [T.iris, { cx: 960, cy: 550, zoom: 1.06 }],
  ]);
  return { ...k, roll: 0 };
}

// ---------------------------------------------------------------- mascot
export function mascotPose(t, T) {
  const idle = Math.sin((t / 1.7) * Math.PI * 2);
  const sit = seated(t, T);
  let bob = 0, squash = 1 + idle * 0.012, tilt = fnoise(t * 0.5, 1) * 1.2;
  const deskY = DESK.top - SEAT_Y + 10;                 // desk surface in local coords
  let handL = sit ? [-190, deskY] : null, handR = sit ? [190, deskY] : null;
  let gloveL = { fist: 1 }, gloveR = { fist: 1 }, handAngL, handAngR, bendL = 40, bendR = 40;
  let eyeX = 0.05, eyeY = 0, turn = 0, dizzy = 0, squint = 0, excite = 0, blinkExtra = 0, eyeScale = 1;

  const expr = exprTrack(t, [
    [0, 'focused'], [T.noIdea, 'confused'], [T.lookBack, 'unsure'], [T.fogIn, 'concerned'],
    [T.brainFog - 0.2, 'explain'], [T.tokens, 'unsure'],
    [T.reading, 'focused'], [T.memory, 'confused'], [T.talk, 'unsure'], [T.multitask, 'wince'], [T.cardsOut3, 'concerned'],
    [T.laptop, 'focused'], [T.lazyWord, 'frustrated'], [T.exhausted, 'tired'],
    [T.toStudio, 'happy'], [T.items[1], 'unsure'], [T.items[3], 'concerned'], [T.freeze, 'frozen'], [T.relax, 'relieved'],
    [T.clean, 'happy'], [T.one, 'explain'], [T.badgeIn, 'happy'], [T.thumbs, 'beaming'],
  ]);

  // ---------- 1 · reading the paper, three times ----------
  if (t < T.fogStart + 0.6) {
    handR = [300, -430]; bendR = 50;
    eyeX = 0.9; turn = 0.4; eyeY = 0.1;
    if (t > T.sameSentence && t < T.noIdea) {             // eyes sweep the same line again and again
      const u = ((t - T.sameSentence) / ((T.noIdea - T.sameSentence) / 3)) % 1;
      eyeX = lerp(0.55, 1, u < 0.85 ? u / 0.85 : 1 - (u - 0.85) / 0.15);
    }
    if (t > T.noIdea && t < T.lookBack) { eyeX = 0; turn = 0; tilt += Math.sin((t - T.noIdea) * 3) * 4; }
    if (t > T.fogIn) { dizzy = 0.2 * prog(t, T.fogIn, T.fogIn + 1); eyeY = -0.4; eyeX = 0.3; }
  }
  // ---------- 2 · points at the fog ----------
  if (t >= T.fogStart + 0.6 && t < T.feelStart) {
    const pt = outBack(prog(t, T.brainFog - 0.3, T.brainFog + 0.1), 1.8) * (1 - prog(t, T.tokens + 2.5, T.tokens + 3));
    handL = [lerp(-190, -300, pt), lerp(deskY, -590, pt)]; gloveL = { fist: 1 - clamp(pt), point: clamp(pt) }; handAngL = pt > 0.02 ? 145 : undefined; bendL = 40;
    eyeX = -0.6 * pt; eyeY = -0.8 * pt; turn = -0.3 * pt; dizzy = 0.2;
    if (t > T.tokens) { eyeX = Math.sin(t * 1.5) * 0.8; eyeY = -0.6; }
  }
  // ---------- 3 · four everyday struggles (cards on the right) ----------
  if (t >= T.feelStart && t < T.lazyStart) {
    eyeX = 1; turn = 0.45; eyeY = -0.2;
    if (t > T.reading && t < T.memory) { squint = 0.5; eyeY = -0.4; }
    if (t > T.memory && t < T.talk) { handL = [-215, -520 + Math.sin(t * 12) * 6]; gloveL = { open: 1 }; handAngL = -150; bendL = 70; eyeY = -0.9; eyeX = 0.2; }
    if (t > T.talk && t < T.multitask) { eyeX = Math.sin(t * 5) > 0 ? 1 : 0.4; eyeY = 0.2; }
    if (t > T.multitask) { tilt += Math.sin(t * 4) * 3; dizzy = 0.25; eyeY = 0.3; }
  }
  // ---------- 4 · typing while the battery drains → exhausted ----------
  if (t >= T.lazyStart && t < T.toStudio) {
    const typing = prog(t, T.laptop + 0.2, T.laptop + 0.6) * (1 - prog(t, T.exhausted - 0.2, T.exhausted + 0.4));
    const ty = (i) => Math.max(0, Math.sin(t * 16 + i * 2)) * 14 * typing;
    handL = [lerp(-190, 190, typing), deskY - ty(0)]; handR = [lerp(190, 370, typing), deskY - ty(1)];
    eyeX = 0.7 * typing; eyeY = 0.5 * typing; turn = 0.3 * typing;
    const ex = prog(t, T.exhausted - 0.2, T.exhausted + 0.8, inOutCubic);
    squash -= 0.07 * ex; tilt += 7 * ex; blinkExtra = 0.55 * ex; eyeY += 0.6 * ex; dizzy = 0.25 * ex;
    if (t > T.faster && t < T.exhausted) tilt += Math.sin(t * 9) * 1.2;
  }
  // ---------- 6 · busy morning → freeze → one task ----------
  if (t >= T.toStudio && t < T.clean) {
    const n = T.items.filter((a) => t >= a).length;
    eyeX = n ? 1 : 0.1; turn = n ? 0.4 : 0; eyeY = -0.3 * n / 6;
    const fr = prog(t, T.freeze, T.freeze + 0.2) * (1 - prog(t, T.simplify, T.simplify + 0.4));
    if (fr > 0) {
      eyeScale = 1 + 0.15 * fr; squash = 1 - 0.02 * fr; tilt = fnoise(t * 40, 3) * 1.2 * fr;
      eyeX = lerp(eyeX, 0, fr); turn = lerp(turn, 0, fr);
      handL = [-250, -260]; handR = [250, -260]; gloveL = gloveR = { open: fr };
    }
    const br = t - T.relax;
    if (br > 0 && br < 2.2) { squash += Math.sin((br / 2.2) * Math.PI) * 0.05; blinkExtra = br < 1.3 ? 0.85 * (1 - prog(br, 0.9, 1.3)) : 0; }
    if (t > T.relax + 1.3) { eyeX = 0.8; turn = 0.3; }
  }
  // ---------- 7 · takeaway ----------
  if (t >= T.clean) {
    squash += 0.02 * prog(t, T.clean, T.clean + 0.5);
    for (const at of [T.one, T.breaks, T.listen]) if (t > at && t < at + 0.7) { eyeX = 1; turn = 0.45; eyeY = -0.2; }
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

  const blink = Math.max(blinkExtra, blinks(t, [0.9, 6.7, 11.4, 14.9, 20.4, 24.8, 27.6, 31.2, 55.6, 58.4, 64.2, 68.8, 71.1, 74.6]));
  return {
    t, x: MX, y: mascotY(t, T), s: 1, bob, squash, tilt, turn, eyeX, eyeY, eyeScale, blink, squint, dizzy, excite,
    ...expr, handL, handR, gloveL, gloveR, handAngL, handAngR, bendL, bendR,
  };
}

// ---------------------------------------------------------------- props
export function propsState(t, T) {
  const body = [MX, SEAT_Y + BODY_OFF];
  // paper: held up beside the face, then put down when the fog arrives
  const down = prog(t, T.fogStart + 0.1, T.fogStart + 0.7, inOutCubic);
  const lift = outBack(prog(t, 0, 0.5), 1.4);
  const paper = {
    x: lerp(MX + 440, 640, down), y: lerp(560, DESK.top - 6, down) + (1 - lift) * 80, rot: lerp(-6, 0, down) + Math.sin(t * 1.3) * 1.2 * (1 - down),
    s: lerp(1, 0.25, down), op: prog(t, 0, 0.3) * (1 - prog(t, T.feelStart - 0.3, T.feelStart)),
  };
  const line = t < T.noIdea && t > T.sameSentence ? Math.floor(((t - T.sameSentence) / ((T.noIdea - T.sameSentence) / 3)) % 3) : 0;
  const fogAmt = prog(t, T.fogIn, T.fogIn + 1.0, outCubic) * (1 - prog(t, T.feelStart - 0.4, T.feelStart + 0.2))
    + 0.45 * prog(t, T.exhausted - 0.3, T.exhausted + 0.6) * (1 - prog(t, T.toNeurons - 0.3, T.toNeurons));
  return {
    t, desk: seated(t, T) ? 1 : 0, chairX: MX,
    paper, scanY: -40, scanOp: t > T.sameSentence && t < T.noIdea ? 1 : 0,
    laptop: prog(t, T.laptop, T.laptop + 0.35) * (1 - prog(t, T.toNeurons + 1.0, T.toNeurons + 1.1)),
    fog: { x: body[0] + 30, y: body[1] - 20, amt: fogAmt, swirl: t },
    line,
  };
}
