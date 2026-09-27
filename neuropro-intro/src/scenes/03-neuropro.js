// SCENE 3 (5–8s) — NeuroPro enters. Dr. Rivera walks in; the symptoms are gathered up and the brain
// becomes brighter and organised; colour returns to the world.
// Owns: icon absorb, brain organise + activation pulse, spark burst, grade recovery.
import { h, tr } from '../engine/svg.js';
import { prog, inCubic, inOutCubic, outCubic, clamp, lerp } from '../engine/anim.js';
import { PANEL } from './02-symptoms.js';

const SPARKS = 14;

export function createScene03(cfg) {
  const sc = cfg.scene['03-neuropro'], b = sc.beats, c = cfg.brand.colors;
  const icons = cfg.scene['02-symptoms'].icons;
  return {
    world: h('g', { id: 's3-sparks' }, ...Array.from({ length: SPARKS }, (_, i) =>
      h('circle', { id: `s3-sp${i}`, r: 5, fill: i % 2 ? c.cyan : '#FFFFFF', opacity: 0 }))),
    update(t, ctx) {
      const S = ctx.state;
      // icons fly into the brain
      icons.forEach((ic, i) => {
        const k = prog(t, b.iconsAbsorb + i * 0.06, b.iconsAbsorb + i * 0.06 + 0.45, inCubic);
        if (k <= 0) return;
        const s = S.icons[ic.id];
        s.x = lerp(s.x, PANEL.x, k);
        s.y = lerp(s.y, S.panel.y, k);
        s.sx *= 1 - k * 0.8; s.sy *= 1 - k * 0.8;
        s.opacity *= 1 - prog(t, b.iconsAbsorb + i * 0.06 + 0.3, b.iconsAbsorb + i * 0.06 + 0.45);
        s.labelOpacity = (s.labelOpacity ?? 1) * (1 - clamp(k * 3));
      });
      S.panel.order = prog(t, b.organize, b.organize + 0.85, inOutCubic);
      S.panel.pulse = prog(t, b.activationPulse, b.activationPulse + 0.8, outCubic);
      S.panel.arc = lerp(S.panel.arc, 1, prog(t, b.organize, b.organize + 1.0, inOutCubic));
      S.dotsFade = 0;
      S.grade.dizzy *= 1 - prog(t, b.organize, b.organize + 0.8, inOutCubic);
      S.sparkK = prog(t, b.activationPulse - 0.1, b.activationPulse + 0.6);
    },
    apply(ctx) {
      const S = ctx.state, k = S.sparkK;
      for (let i = 0; i < SPARKS; i++) {
        const el = ctx.root.querySelector(`#s3-sp${i}`);
        if (k <= 0 || k >= 1) { el.setAttribute('opacity', 0); continue; }
        const a = (i / SPARKS) * Math.PI * 2 + i * 0.3, d = 90 + outCubic(k) * (120 + (i % 3) * 30);
        el.setAttribute('cx', (PANEL.x + Math.cos(a) * d).toFixed(1));
        el.setAttribute('cy', (S.panel.y + Math.sin(a) * d).toFixed(1));
        el.setAttribute('r', (5 * (1 - k) + 1).toFixed(2));
        el.setAttribute('opacity', (1 - k).toFixed(3));
      }
    },
  };
}
