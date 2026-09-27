// SCENE 2 (2–5s) — The symptom appears. Jordan wobbles; a friendly brain "insight panel" pops up,
// surrounded by simple symptom metaphors (dizziness, headache, brain fog, focus).
// Owns: panel entrance, thought-dots, icon entrances, the dizzy colour grade.
import { h } from '../engine/svg.js';
import { prog, popScale, outCubic, inOutSine, clamp } from '../engine/anim.js';

export const PANEL = { x: 1095, y: 330, scale: 0.78 };
export const ICON_POS = {
  dizziness:     [872, 212],
  headache:      [1318, 198],
  fog:           [1336, 452],
  concentration: [898, 478],
};
export const DOTS = [[808, 392, 7], [852, 372, 9.5], [902, 352, 12]];

export function createScene02(cfg) {
  const sc = cfg.scene['02-symptoms'], b = sc.beats, c = cfg.brand.colors;
  return {
    world: h('g', { id: 's2-dots' }, ...DOTS.map(([x, y, r], i) => h('circle', { id: `s2-dot${i}`, cx: x, cy: y, r, fill: c.navy, opacity: 0 }))),
    update(t, ctx) {
      const S = ctx.state;
      // --- panel ---
      const pop = popScale(t, b.brainPop, 0.55, 0.16);
      S.panel.appear = prog(t, b.panelIn, b.panelIn + 0.25);
      S.panel.sx = pop.k > 0 ? pop.sx : 0.4;
      S.panel.sy = pop.k > 0 ? pop.sy : 0.4;
      S.panel.arc = prog(t, b.panelIn + 0.1, b.panelIn + 1.0, outCubic) * 0.28;
      S.panel.scramble = prog(t, b.brainPop + 0.2, b.brainPop + 0.6);
      S.panel.y = PANEL.y + Math.sin(t * 1.6) * 4;

      // --- thought dots ---
      S.dots = DOTS.map((_, i) => popScale(t, b.thoughtDots + i * 0.08, 0.35, 0.2));

      // --- icons pop in, then float ---
      for (const ic of sc.icons) {
        const p = popScale(t, ic.at, 0.5, 0.2);
        const [x, y] = ICON_POS[ic.id];
        const f = Math.sin(t * 1.8 + x * 0.01) * 5;
        S.icons[ic.id] = { x, y: y + f, sx: p.sx, sy: p.sy, opacity: p.k > 0 ? 1 : 0, labelOpacity: prog(t, ic.at + 0.15, ic.at + 0.45) };
      }

      // --- dizzy grade (desaturate + soft background blur + violet vignette) ---
      const inK = prog(t, b.wobble, b.wobble + 0.5, inOutSine);
      S.grade.dizzy = inK;
      S.grade.flash = Math.max(0, 1 - Math.abs(t - b.wobble - 0.05) / 0.12) * 0.35;
    },
    apply(ctx) {
      const S = ctx.state;
      S.dots.forEach((p, i) => {
        const el = ctx.root.querySelector(`#s2-dot${i}`);
        const [x, y] = DOTS[i];
        el.setAttribute('transform', `translate(${x} ${y}) scale(${Math.max(0, p.sx).toFixed(3)} ${Math.max(0, p.sy).toFixed(3)}) translate(${-x} ${-y})`);
        el.setAttribute('opacity', ((p.k > 0 ? 0.3 + 0.5 * S.panel.order : 0) * (1 - S.dotsFade)).toFixed(3));
        el.setAttribute('fill', S.panel.order > 0.5 ? c.teal : c.navy);
      });
    },
  };
}
