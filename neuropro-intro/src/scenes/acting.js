// CHARACTER PERFORMANCE ("blocking") for the whole intro.
// Beat times come from config/storyboard.json, so re-timing a beat moves the acting with it.
// Poses use the shared rig vocabulary (see src/characters/rig.js → basePose).

import { keys, prog, blinks, fnoise, outCubic, inOutSine, inOutCubic, outBack, spring, clamp, lerp } from '../engine/anim.js';
import { expression } from '../characters/rig.js';

export const PLACEMENT = {
  jordan: { x: 720, y: 1010, s: 0.86 },
  rivera: { x: 1440, y: 1012, s: 0.86, enterFromX: 2260 },
};

export function jordanPose(t, cfg) {
  const X = cfg.characters.expressions;
  const b1 = cfg.scene['01-establish'].beats, b2 = cfg.scene['02-symptoms'].beats, b3 = cfg.scene['03-neuropro'].beats;
  const P = PLACEMENT.jordan;

  // --- Expression track ---
  let expr;
  if (t < b2.wobble) expr = expression(X, 'content');
  else if (t < b3.jordanTurns) expr = expression(X, 'content', 'confused', prog(t, b2.wobble, b2.wobble + 0.35, inOutSine));
  else if (t < b3.jordanRelief) expr = expression(X, 'confused', 'worried', prog(t, b3.jordanTurns, b3.jordanTurns + 0.3) * 0.4);
  else expr = expression(X, 'worried', 'relieved', prog(t, b3.jordanRelief, b3.jordanRelief + 0.4, inOutSine));
  // quick "huh?" brow pop when the clinician arrives
  expr.browLift += Math.max(0, Math.sin(clamp((t - b3.jordanTurns) / 0.5) * Math.PI)) * 0.35;

  // --- Eyes + head direction ---
  const look = keys(t, [
    [0, { ex: 0.15, ey: 0, turn: 0.05 }],
    [b1.glanceWindow, { ex: 0.15, ey: 0, turn: 0.05 }],
    [b1.glanceWindow + 0.25, { ex: -0.85, ey: -0.1, turn: -0.3 }],
    [b1.glanceBack, { ex: -0.85, ey: -0.1, turn: -0.3 }],
    [b1.glanceBack + 0.3, { ex: 0.2, ey: 0.05, turn: 0 }],
    [b2.wobble + 0.2, { ex: 0.25, ey: 0.3, turn: -0.1 }],
    [b2.lookAtBrain, { ex: 0.1, ey: 0.2, turn: -0.05 }],
    [b2.lookAtBrain + 0.3, { ex: 0.85, ey: -0.75, turn: 0.35 }],
    [b3.jordanTurns, { ex: 0.85, ey: -0.75, turn: 0.35 }],
    [b3.jordanTurns + 0.3, { ex: 1, ey: -0.1, turn: 0.6 }],
    [b3.lookToBrain, { ex: 1, ey: -0.1, turn: 0.6 }],
    [b3.lookToBrain + 0.35, { ex: 0.8, ey: -0.65, turn: 0.4 }],
  ]);
  // unfocused drift while dizzy
  const dizzy = prog(t, b2.wobble, b2.wobble + 0.3) * (1 - prog(t, b3.jordanTurns - 0.2, b3.jordanTurns + 0.2));
  const shake = t > b2.headShake && t < b2.headShake + 0.6 ? Math.sin((t - b2.headShake) / 0.6 * Math.PI * 3) * (1 - (t - b2.headShake) / 0.6) * 0.28 : 0;

  // --- Body sway (the "wobble") ---
  const sway = keys(t, [
    [0, 0], [b2.wobble, 0], [b2.wobble + 0.22, -3.2, outCubic], [b2.wobble + 0.6, 2.6], [b2.wobble + 1.05, -1.2], [b2.wobble + 1.6, 0.8], [b2.wobble + 2.4, 0],
  ]);
  const tilt = keys(t, [[0, 0], [b2.wobble, 0], [b2.wobble + 0.3, -7, outCubic], [b2.lookAtBrain + 0.3, -4], [b3.jordanTurns + 0.3, 2], [b3.jordanRelief + 0.3, 4], [b3.lookToBrain + 0.3, 1]]);
  const squash = Math.max(0, Math.sin(clamp((t - b2.wobble) / 0.35) * Math.PI)) * 0.8;

  // --- Nod ---
  const nodK = clamp((t - b3.nod) / 0.55);
  const nod = nodK > 0 && nodK < 1 ? Math.sin(nodK * Math.PI * 2) * (1 - nodK * 0.3) * 1.2 : 0;

  // --- Left hand to the side of the head, then back down ---
  const rest = [-102, -254];
  const head = [-64, -688];
  const up = outBack(prog(t, b2.handToHead, b2.handToHead + 0.5), 1.4);
  const down = prog(t, b3.jordanRelief - 0.6, b3.jordanRelief + 0.1, inOutCubic);
  const k = clamp(up) * (1 - down);
  const scratch = k > 0.9 ? Math.sin(t * 9) * 3 * (t < b3.jordanTurns ? 1 : 0) : 0;
  const handL = [lerp(rest[0], head[0], up * (1 - down)), lerp(rest[1], head[1] + scratch, up * (1 - down))];

  return {
    x: P.x, y: P.y, s: P.s,
    breathe: 0.5 + 0.5 * Math.sin((t / 3.1) * Math.PI * 2),
    lean: sway + fnoise(t * 0.4, 2) * 0.6,
    bodySquash: squash,
    headTilt: tilt + fnoise(t * 0.5, 1) * 1.4,
    headTurn: look.turn + shake,
    nod,
    eyeX: look.ex + dizzy * Math.sin(t * 5.1) * 0.25,
    eyeY: look.ey + dizzy * Math.cos(t * 4.3) * 0.15,
    blink: blinks(t, [b1.blink1, b2.doubleBlink, b2.doubleBlink + 0.2, b2.headShake + 0.5, b3.jordanRelief + 0.05, 8.4]),
    squint: prog(t, b3.jordanRelief, b3.jordanRelief + 0.4) * 0.4,
    expr,
    handL,
    handOpenL: k * 0.6,
    handR: [110 + Math.sin(t * 0.9) * 2, -256 + Math.sin(t * 1.3) * 2],
  };
}

export function riveraPose(t, cfg) {
  const X = cfg.characters.expressions;
  const b3 = cfg.scene['03-neuropro'].beats;
  const P = PLACEMENT.rivera;

  // --- Walk in from screen right, settle with a little overshoot ---
  const walkK = prog(t, b3.clinicianEnter, b3.clinicianSettle - 0.15, (k) => 1 - Math.pow(1 - k, 2.4));
  const settle = spring(clamp((t - (b3.clinicianSettle - 0.15)) / 0.9), 1.6, 6);
  const x = lerp(P.enterFromX, P.x, walkK) + (walkK >= 1 ? (1 - settle) * -8 : 0);
  const dist = (P.enterFromX - x) / P.s;
  const stride = 190;
  const ph = (dist / stride) * Math.PI;
  const walking = 1 - prog(t, b3.clinicianSettle - 0.35, b3.clinicianSettle + 0.05);
  const footL = [-Math.sin(ph) * 30 * walking, Math.max(0, Math.cos(ph)) * 26 * walking];
  const footR = [Math.sin(ph) * 30 * walking, Math.max(0, -Math.cos(ph)) * 26 * walking];
  const bob = Math.abs(Math.sin(ph)) * 9 * walking;

  // --- Gesture toward the brain ---
  const g = prog(t, b3.gesture, b3.gesture + 0.55);
  const gk = outBack(g, 1.5);
  const rest = [-94, -244];
  const point = [-282, -642];
  const beat = Math.sin(clamp((t - (b3.nod)) / 0.5) * Math.PI) * 10;
  const handL = [lerp(rest[0], point[0], gk), lerp(rest[1], point[1] - beat, gk)];

  const look = keys(t, [
    [0, { ex: -0.9, ey: 0, turn: -0.55 }],
    [b3.gesture, { ex: -0.9, ey: 0, turn: -0.55 }],
    [b3.gesture + 0.3, { ex: -0.85, ey: -0.6, turn: -0.45 }],
    [b3.lookToBrain, { ex: -0.85, ey: -0.6, turn: -0.45 }],
    [b3.lookToBrain + 0.3, { ex: -1, ey: -0.05, turn: -0.5 }],
  ]);

  let expr = expression(X, 'warm', 'explain', prog(t, b3.gesture, b3.gesture + 0.4));
  if (t > b3.lookToBrain) expr = expression(X, 'explain', 'warm', prog(t, b3.lookToBrain, b3.lookToBrain + 0.4));

  return {
    x, y: P.y, s: P.s,
    breathe: 0.5 + 0.5 * Math.sin((t / 2.8) * Math.PI * 2 + 1),
    bob,
    lean: -3.5 * walking + (1 - settle) * 2 * (walkK >= 1 ? 1 : 0) + fnoise(t * 0.4, 6) * 0.5,
    bodyTurn: 0.55 * walking,
    headTilt: keys(t, [[0, -2], [b3.gesture, -2], [b3.gesture + 0.4, -5], [b3.lookToBrain + 0.3, -3]]) + fnoise(t * 0.5, 8) * 1.2,
    headTurn: look.turn,
    eyeX: look.ex, eyeY: look.ey,
    blink: blinks(t, [b3.clinicianSettle + 0.1, b3.lookToBrain + 0.15]),
    squint: 0.28,
    expr,
    footL, footR,
    handL, handOpenL: prog(t, b3.gesture + 0.05, b3.gesture + 0.35), handAngL: g > 0 ? lerp(8, 118, gk) : null,
    handR: [28, -402 + bob * 0.3], handAngR: 0,
  };
}
