// MASCOT PERFORMANCE ("blocking") for the whole intro.
// Beat times come from config/storyboard.json, so re-timing a beat moves the acting with it.
// Pose vocabulary: see src/characters/mascot.js (mount → apply).

import { keys, prog, blinks, fnoise, outCubic, inOutSine, inOutCubic, outBack, clamp, lerp } from '../engine/anim.js';

export const PLACEMENT = { x: 820, y: 1000, s: 1.05 };

// Expression presets (mascot face). Blend with mixExpr.
const EXPR = {
  happy:    { smile: 0.7, open: 0.55, mouthW: 1, browLift: 0.1, browWorry: 0, browAsym: 0 },
  unsure:   { smile: 0.1, open: 0.12, mouthW: 0.75, browLift: 0.45, browWorry: 0.35, browAsym: 0.4 },
  dizzy:    { smile: -0.4, open: 0.18, mouthW: 0.7, browLift: 0.45, browWorry: 0.85, browAsym: 0.5 },
  curious:  { smile: 0.05, open: 0.4, mouthW: 0.5, browLift: 0.8, browWorry: 0.1, browAsym: -0.3 },
  relieved: { smile: 0.85, open: 0.75, mouthW: 1.05, browLift: 0.35, browWorry: 0, browAsym: 0 },
  beaming:  { smile: 0.95, open: 0.9, mouthW: 1.08, browLift: 0.4, browWorry: 0, browAsym: 0 },
};
const mixExpr = (a, b, k) => Object.fromEntries(Object.keys(EXPR[a]).map((n) => [n, lerp(EXPR[a][n], EXPR[b][n], clamp(k))]));

export function mascotPose(t, cfg) {
  const b1 = cfg.scene['01-establish'].beats, b2 = cfg.scene['02-symptoms'].beats, b3 = cfg.scene['03-neuropro'].beats;
  const P = PLACEMENT;

  // --- expression track ---
  let e;
  if (t < b2.wobble) e = mixExpr('happy', 'unsure', prog(t, b1.unsure, b1.unsure + 0.4, inOutSine));
  else if (t < b3.lookAtBadge) e = mixExpr('unsure', 'dizzy', prog(t, b2.wobble, b2.wobble + 0.3));
  else if (t < b3.relief) e = mixExpr('dizzy', 'curious', prog(t, b3.lookAtBadge, b3.lookAtBadge + 0.25));
  else if (t < b3.thumbsUp) e = mixExpr('curious', 'relieved', prog(t, b3.relief, b3.relief + 0.3));
  else e = mixExpr('relieved', 'beaming', prog(t, b3.thumbsUp, b3.thumbsUp + 0.3));

  // --- eyes / head turn ---
  const look = keys(t, [
    [0, { ex: 0.1, ey: 0, turn: 0 }],
    [b1.glanceWindow, { ex: 0.1, ey: 0, turn: 0 }],
    [b1.glanceWindow + 0.22, { ex: -1, ey: -0.2, turn: -0.45 }],
    [b1.glanceBack, { ex: -1, ey: -0.2, turn: -0.45 }],
    [b1.glanceBack + 0.3, { ex: 0.1, ey: 0.1, turn: 0 }],
    [b2.wobble + 0.25, { ex: 0.1, ey: 0.35, turn: -0.1 }],
    [b3.lookAtBadge, { ex: 0.1, ey: 0.35, turn: -0.1 }],
    [b3.lookAtBadge + 0.25, { ex: 1, ey: -0.3, turn: 0.55 }],
    [b3.lookToCamera, { ex: 1, ey: -0.3, turn: 0.55 }],
    [b3.lookToCamera + 0.3, { ex: 0.05, ey: 0, turn: 0.1 }],
  ]);
  const shakeK = (t - b2.headShake) / 0.6;
  const shake = shakeK > 0 && shakeK < 1 ? Math.sin(shakeK * Math.PI * 3) * (1 - shakeK) * 0.5 : 0;

  // --- body: idle bounce, dizzy wobble, hop ---
  const idle = Math.sin((t / 1.7) * Math.PI * 2);
  const dizzy = prog(t, b2.wobble, b2.wobble + 0.4) * (1 - prog(t, b3.scan, b3.scan + 0.8, inOutCubic));
  const order = prog(t, b3.scan + 0.05, b3.scan + 0.85, inOutCubic);
  const tilt = keys(t, [
    [0, 0], [b2.wobble, 0], [b2.wobble + 0.22, -6.5, outCubic], [b2.wobble + 0.6, 5], [b2.wobble + 1.05, -3], [b2.wobble + 1.7, 2], [b2.wobble + 2.5, -1],
    [b3.lookAtBadge + 0.3, 3], [b3.hop, 0], [b3.thumbsUp + 0.3, -2], [b3.lookToCamera + 0.4, 0],
  ]) + dizzy * Math.sin(t * 2.1) * 1.5 + shake * 4;

  // hop: anticipation squash → stretch in the air → land squash → settle
  const hk = t - b3.hop;
  let bob = 0, squash = 1 + idle * 0.012;
  if (hk > -0.15 && hk < 0.9) {
    if (hk < 0) squash = 1 - 0.1 * outCubic((hk + 0.15) / 0.15);            // crouch
    else if (hk < 0.4) { const k = hk / 0.4; bob = Math.sin(k * Math.PI) * 70; squash = 1 + 0.1 * Math.sin(k * Math.PI) - 0.1 * (1 - k) * (k < 0.15 ? 1 : 0); }
    else { const k = (hk - 0.4) / 0.5; squash = 1 - 0.09 * Math.exp(-k * 5) * Math.cos(k * 9); }  // land + settle
  }
  // wobble hit
  squash -= Math.max(0, Math.sin(clamp((t - b2.wobble) / 0.35) * Math.PI)) * 0.07;

  // --- hands ---
  const restL = [-262, -185], restR = [262, -185];
  const onHead = [-228, -430];
  const up = outBack(prog(t, b2.handToHead, b2.handToHead + 0.45), 1.5);
  const down = prog(t, b3.relief - 0.25, b3.relief + 0.2, inOutCubic);
  const hk2 = clamp(up) * (1 - down);
  const scratch = hk2 > 0.9 && t < b3.lookAtBadge ? Math.sin(t * 10) * 5 : 0;
  const handL = [lerp(restL[0], onHead[0], up * (1 - down)), lerp(restL[1], onHead[1] + scratch, up * (1 - down))];

  const th = outBack(prog(t, b3.thumbsUp, b3.thumbsUp + 0.35), 2);
  const thumbR = [308, -470];
  const handR = [lerp(restR[0], thumbR[0], th), lerp(restR[1], thumbR[1], th) + Math.sin(t * 3) * 3];
  const excite = prog(t, b3.thumbsUp + 0.05, b3.thumbsUp + 0.4, outCubic) * (1 - prog(t, 7.75, 7.95));

  return {
    t, x: P.x, y: P.y, s: P.s,
    bob, squash, tilt: tilt + fnoise(t * 0.5, 1) * 1.2,
    turn: look.turn + shake, eyeX: look.ex, eyeY: look.ey,
    blink: blinks(t, [b1.blink1, b2.doubleBlink, b2.doubleBlink + 0.2, b2.headShake + 0.5, b3.relief, b3.lookToCamera + 0.35]),
    squint: prog(t, b3.relief, b3.relief + 0.3) * 0.3,
    ...e,
    dizzy, order, netLevel: 1 - prog(t, b3.thumbsUp, b3.thumbsUp + 0.6) * 0.55, glow: 0.7 - prog(t, b3.thumbsUp, 7.6) * 0.35,
    handL, gloveL: { fist: 1 - hk2, open: hk2 }, bendL: lerp(40, 70, hk2), handAngL: hk2 > 0.03 ? lerp(10, -145, hk2) : undefined,
    handR, gloveR: { fist: 1 - clamp(th), thumb: clamp(th) }, handAngR: th > 0.02 ? lerp(-10, 0, clamp(th)) : undefined, bendR: lerp(40, 55, clamp(th)),
    excite,
  };
}
