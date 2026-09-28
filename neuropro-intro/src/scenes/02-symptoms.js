// SCENE 2 (2–5s) — The symptom appears. The brain wobbles, clutches its head, loses colour and focus,
// and simple symptom metaphors pop up around it (dizziness, headache, brain fog, focus).
// Owns: icon entrances and the dizzy colour grade. (Mascot acting lives in acting.js.)
import { prog, popScale, inOutSine } from '../engine/anim.js';

export const ICON_POS = {
  dizziness:     [505, 420],
  headache:      [1140, 410],
  fog:           [1175, 705],
  concentration: [470, 760],
};

export function createScene02(cfg) {
  const sc = cfg.scene['02-symptoms'], b = sc.beats;
  return {
    update(t, ctx) {
      const S = ctx.state;
      for (const ic of sc.icons) {
        const p = popScale(t, ic.at, 0.5, 0.2);
        const [x, y] = ICON_POS[ic.id];
        const f = Math.sin(t * 1.8 + x * 0.01) * 6;
        S.icons[ic.id] = { x, y: y + f, sx: p.sx, sy: p.sy, opacity: p.k > 0 ? 1 : 0, labelOpacity: prog(t, ic.at + 0.15, ic.at + 0.45) };
      }
      S.grade.dizzy = prog(t, b.wobble, b.wobble + 0.5, inOutSine);
      S.grade.flash = Math.max(0, 1 - Math.abs(t - b.wobble - 0.05) / 0.12) * 0.3;
    },
  };
}
