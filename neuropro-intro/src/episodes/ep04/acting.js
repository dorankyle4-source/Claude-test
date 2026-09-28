// EPISODE 4 — mascot performance and camera. Same rig as Episodes 1–3 (src/characters/mascot.js).
// 1 walks into the café → freezes → hands over ears · 4 overwhelmed under the knob → relief → knowing smile ·
// 5 seated comfortably at a café table for the takeaway.

import { keys, prog, blinks, fnoise, outCubic, inCubic, inOutSine, inOutCubic, outBack, clamp, lerp } from '../../engine/anim.js';
import { overload } from './timeline.js';

const EXPR = {
  happy:     { smile: 0.7, open: 0.55, mouthW: 1, browLift: 0.1, browWorry: 0, browAsym: 0 },
  curious:   { smile: 0.1, open: 0.35, mouthW: 0.55, browLift: 0.7, browWorry: 0.1, browAsym: -0.35 },
  frozen:    { smile: -0.05, open: 0.3, mouthW: 0.35, browLift: 0.8, browWorry: 0.2, browAsym: 0 },
  wince:     { smile: -0.35, open: 0.1, mouthW: 0.8, browLift: 0.2, browWorry: 1, browAsym: 0.3 },
  concerned: { smile: -0.15, open: 0.12, mouthW: 0.7, browLift: 0.4, browWorry: 0.6, browAsym: 0.2 },
  hopeful:   { smile: 0.2, open: 0.3, mouthW: 0.7, browLift: 0.6, browWorry: 0.3, browAsym: 0 },
  relieved:  { smile: 0.85, open: 0.75, mouthW: 1.05, browLift: 0.35, browWorry: 0, browAsym: 0 },
  knowing:   { smile: 0.8, open: 0.15, mouthW: 0.95, browLift: 0.35, browWorry: 0, browAsym: -0.7 },
  explain:   { smile: 0.6, open: 0.5, mouthW: 0.95, browLift: 0.5, browWorry: 0, browAsym: -0.2 },
  calm:      { smile: 0.55, open: 0.2, mouthW: 0.9, browLift: 0.15, browWorry: 0, browAsym: 0 },
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

export const MX = 820;                                 // standing spot (hook + knob scene)
export const MX2 = 620;                                // seated spot (takeaway)
export const WALK = { from: -180, to: MX };
export const STAND_Y = 1000, SEAT_Y = 1060, BODY_OFF = -335;
export const TABLE = { x: MX2 + 120, y: 852 };         // café-table wrapper; its surface is at y - 22
export const KNOB = { x: MX + 20, y: 225, scale: 1.1 };     // giant knob above the head (world coords)

export const seated = (t, T) => t >= T.wipe;
export const mascotX = (t, T) => {
  if (seated(t, T)) return MX2;
  if (t >= T.toInside) return MX;
  const wk = clamp(t / T.walkEnd);
  return lerp(WALK.from, WALK.to, wk < 0.85 ? (wk / 0.85) * 0.9 : 0.9 + outCubic((wk - 0.85) / 0.15) * 0.1);
};
export const mascotY = (t, T) => (seated(t, T) ? SEAT_Y : STAND_Y);

// ---------------------------------------------------------------- camera
export function cameraAt(t, T) {
  const k = keys(t, [
    [0, { cx: 760, cy: 560, zoom: 1.0 }],
    [T.walkEnd, { cx: 900, cy: 560, zoom: 1.0 }],
    [T.textIn, { cx: 920, cy: 555, zoom: 1.06 }],
    [T.toInside - 0.5, { cx: 900, cy: 580, zoom: 1.1 }],
    [T.toInside + 0.5, { cx: MX, cy: STAND_Y + BODY_OFF, zoom: 2.8 }, inCubic],
    [T.toCafe, { cx: 900, cy: 520, zoom: 1.0 }, (x) => (x < 1 ? 0 : 1)],
    [T.knobIn, { cx: 900, cy: 500, zoom: 0.97 }],
    [T.calm, { cx: 900, cy: 505, zoom: 0.98 }],
    [T.smile + 0.4, { cx: 880, cy: 540, zoom: 1.04 }],
    [T.wipe, { cx: 960, cy: 540, zoom: 1.0 }, (x) => (x < 1 ? 0 : 1)],
    [T.iris, { cx: 960, cy: 545, zoom: 1.05 }],
  ]);
  const ov = overload(t, T).all;
  return { cx: k.cx + fnoise(t * 30, 1) * 7 * ov, cy: k.cy + fnoise(t * 30, 2) * 6 * ov, zoom: k.zoom, roll: fnoise(t * 9, 3) * 0.8 * ov };
}

// ---------------------------------------------------------------- mascot
export function mascotPose(t, T) {
  const x = mascotX(t, T), sit = seated(t, T);
  const idle = Math.sin((t / 1.7) * Math.PI * 2);
  let bob = 0, squash = 1 + idle * 0.012, tilt = fnoise(t * 0.5, 1) * 1.2;
  let footL = [0, 0], footR = [0, 0];
  const deskY = TABLE.y - 22 - SEAT_Y + 10;
  let handL = sit ? [-190, deskY] : null, handR = sit ? [190, deskY] : null;
  let gloveL = { fist: 1 }, gloveR = { fist: 1 }, handAngL, handAngR, bendL = 40, bendR = 40;
  let eyeX = 0.05, eyeY = 0, turn = 0, dizzy = 0, squint = 0, excite = 0, blinkExtra = 0, eyeScale = 1;

  const expr = exprTrack(t, [
    [0, 'happy'], [T.lights, 'curious'], [T.freeze, 'frozen'], [T.ears, 'wince'],
    [T.toCafe, 'wince'], [T.badgeIn + 0.2, 'hopeful'], [T.turn, 'concerned'], [T.calm + 0.1, 'relieved'], [T.smile, 'knowing'],
    [T.wipe, 'calm'], [T.real, 'explain'], [T.important - 0.2, 'calm'], [T.important + 1.2, 'happy'],
  ]);

  // hands over the ears (shared by the hook and the knob scene)
  const earsPose = (k) => {
    handL = [lerp(-262, -250, k), lerp(-185, -380, k)]; handR = [lerp(262, 250, k), lerp(-185, -380, k)];
    gloveL = gloveR = { open: clamp(k) }; handAngL = 190; handAngR = 170; bendL = bendR = 60;
  };

  // ---------- 1 · walks into the café → it all gets too much ----------
  if (t < T.toInside + 1) {
    const walking = 1 - prog(t, T.walkEnd - 0.25, T.walkEnd);
    const ph = ((x - WALK.from) / 150) * Math.PI;
    footL = [-Math.sin(ph) * 26 * walking, Math.max(0, Math.cos(ph)) * 30 * walking];
    footR = [Math.sin(ph) * 26 * walking, Math.max(0, -Math.cos(ph)) * 30 * walking];
    bob += Math.abs(Math.sin(ph)) * 14 * walking; tilt += 3 * walking;
    handL = [-262 + Math.sin(ph) * 30 * walking, -185 - Math.abs(Math.sin(ph)) * 10 * walking];
    handR = [262 - Math.sin(ph) * 30 * walking, -185 - Math.abs(Math.cos(ph)) * 10 * walking];
    eyeX = 0.5 * walking + 0.05; turn = 0.35 * walking;
    if (t > T.lights && t < T.freeze) { eyeY = -0.7; eyeX = -0.2; }                        // looks up at the lamps
    const fr = prog(t, T.freeze, T.freeze + 0.15) * (1 - prog(t, T.ears, T.ears + 0.2));  // freezes, eyes wide
    if (fr > 0) { eyeScale = 1 + 0.18 * fr; eyeX = lerp(eyeX, Math.sin(t * 9) > 0 ? 0.8 : -0.8, fr); squash -= 0.03 * fr; }
    const ears = outBack(prog(t, T.ears - 0.1, T.ears + 0.25), 1.5);
    if (ears > 0.01) {
      earsPose(ears);
      squint = 0.5 * ears; blinkExtra = 0.4 * ears; squash -= 0.05 * ears;
      tilt += fnoise(t * 14, 5) * 4 * ears; dizzy = 0.3 * prog(t, T.phone, T.phone + 0.6);
      eyeX = Math.sin(t * 7) * 0.4;
    }
  }
  // ---------- 4 · the giant knob: overwhelmed → the badge turns it down → relief ----------
  if (t >= T.toCafe - 0.2 && t < T.wipe) {
    const ears = 1 - prog(t, T.calm, T.calm + 0.45, inOutCubic);
    earsPose(ears);
    squint = 0.5 * ears; squash -= 0.05 * ears; blinkExtra = 0.35 * ears * (t < T.badgeIn ? 1 : 0);
    tilt += fnoise(t * 14, 5) * 4 * ears * (t < T.badgeIn ? 1 : 0.4);
    dizzy = 0.3 * ears;
    if (t > T.badgeIn && t < T.calm) { eyeY = -1; eyeX = t < T.badgeLand ? lerp(0.9, 0.2, prog(t, T.badgeIn, T.badgeLand)) : 0.15; turn = 0.1; }
    const br = t - T.calm;                                                               // a big breath out
    if (br > 0 && br < 1.8) { squash += Math.sin((br / 1.8) * Math.PI) * 0.06; blinkExtra = Math.max(blinkExtra, br > 0.2 && br < 1.1 ? 0.85 * (1 - prog(br, 0.8, 1.1)) : 0); }
    if (t > T.smile - 0.3) { eyeX = 0; eyeY = 0; turn = 0; }                             // knowing look to camera
    const nod = t - T.smile;
    if (nod > 0 && nod < 0.7) { bob -= Math.sin((nod / 0.7) * Math.PI) * 18; tilt -= Math.sin((nod / 0.7) * Math.PI) * 5; }
  }
  // ---------- 5 · seated comfortably, café calm ----------
  if (sit) {
    squash += 0.015 * Math.sin(t * 1.2);
    handR = [205, deskY - 6]; gloveR = { open: 0.4 };                                   // resting beside the cup
    eyeX = 0.1;
    if (t > T.real - 0.8 && t < T.real + 1.5) { eyeX = 1; turn = 0.45; eyeY = -0.3; }
    if (t > T.important - 0.4 && t < T.important + 1.2) { eyeX = 1; turn = 0.45; eyeY = 0.1; }
    if (t > T.important + 1.2) { eyeX = 0; turn = 0; }
  }

  const blink = Math.max(blinkExtra, blinks(t, [0.9, 5.2, 28.6, 32.9, 36.9, 40.5, 42.1]));
  return {
    t, x, y: mascotY(t, T), s: 1, bob, squash, tilt, footL, footR, turn, eyeX, eyeY, eyeScale, blink, squint, dizzy, excite,
    ...expr, handL, handR, gloveL, gloveR, handAngL, handAngR, bendL, bendR,
  };
}

// ---------------------------------------------------------------- giant knob (section 4)
/** appear 0..1, level (0.3 NORMAL … 0.98 TOO MUCH), glow and shake. The badge turns it down in clicks. */
export function knobState(t, T) {
  const appear = outBack(prog(t, T.knobIn, T.knobIn + 0.45), 1.8) * (1 - prog(t, T.wipe - 0.5, T.wipe - 0.2, inCubic));
  const turnK = prog(t, T.turn, T.calm);
  const clicks = 8, stepped = (Math.floor(turnK * clicks) + outCubic(clamp((turnK * clicks) % 1 * 2.5))) / clicks;
  const strain = 1 - prog(t, T.turn, T.calm);
  const level = lerp(0.98, 0.3, Math.min(1, stepped)) + fnoise(t * 14, 6) * 0.015 * strain;
  const glow = strain * (0.45 + 0.35 * Math.sin(t * 12)) * prog(t, T.knobIn, T.knobIn + 0.3);
  const rot = fnoise(t * 22, 7) * 4 * strain * (t < T.badgeLand ? 1 : 0.35);
  return { appear, level, glow, rot };
}
