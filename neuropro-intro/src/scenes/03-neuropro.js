// SCENE 3 (5–8s) — NeuroPro enters. The NeuroPro badge (the real logo icon) flies in, collects the
// symptoms and scans the brain, which lights up with an organised network; colour returns, thumbs up.
// Owns: badge flight, symptom absorb, scan beam, activation ring + sparks, grade recovery.
import { h } from '../engine/svg.js';
import { prog, inCubic, inOutCubic, outCubic, outBack, clamp, lerp } from '../engine/anim.js';
import { PLACEMENT } from './acting.js';

export const BADGE_WORLD = { x: 1310, y: 470, scale: 0.95, fromX: 2250, fromY: 280 };
const BODY = { x: PLACEMENT.x, y: PLACEMENT.y - 335 * PLACEMENT.s, rx: 235 * PLACEMENT.s, ry: 190 * PLACEMENT.s };
export { BODY };
const SPARKS = 16;

/** Badge position in world space at time t (before the title transition). */
export function badgeWorld(t, b) {
  const k = prog(t, b.badgeEnter, b.badgeLand, (x) => 1 - Math.pow(1 - x, 3));
  const x = lerp(BADGE_WORLD.fromX, BADGE_WORLD.x, k);
  const y = lerp(BADGE_WORLD.fromY, BADGE_WORLD.y, k) - Math.sin(k * Math.PI) * 90 + Math.sin(t * 1.7) * 6 * prog(t, b.badgeLand, b.badgeLand + 0.4);
  const land = t > b.badgeLand ? outBack(prog(t, b.badgeLand - 0.05, b.badgeLand + 0.35), 3) : 0;
  const scale = BADGE_WORLD.scale * (0.6 + 0.4 * k) * (t > b.badgeLand ? 0.9 + 0.1 * land : 1);
  return { x, y, scale, rot: (1 - k) * -25, appear: prog(t, b.badgeEnter, b.badgeEnter + 0.1) };
}

export function createScene03(cfg) {
  const sc = cfg.scene['03-neuropro'], b = sc.beats, c = cfg.brand.colors;
  const icons = cfg.scene['02-symptoms'].icons;
  return {
    badgeAt: (tt) => badgeWorld(tt, b),
    world: h('g', { id: 's3-fx' },
      h('defs', {},
        h('linearGradient', { id: 's3-beamG', x1: 1, y1: 0, x2: 0, y2: 0 },
          h('stop', { offset: 0, 'stop-color': c.cyan, 'stop-opacity': 0.55 }), h('stop', { offset: 1, 'stop-color': c.teal, 'stop-opacity': 0.04 }))),
      h('path', { id: 's3-beam', fill: 'url(#s3-beamG)', opacity: 0 }),
      h('path', { id: 's3-scan', stroke: c.cyan, 'stroke-width': 6, 'stroke-linecap': 'round', filter: 'url(#glow)', opacity: 0 }),
      h('ellipse', { id: 's3-ring', cx: BODY.x, cy: BODY.y, fill: 'none', stroke: c.teal, 'stroke-width': 8, opacity: 0 }),
      ...Array.from({ length: SPARKS }, (_, i) => h('circle', { id: `s3-sp${i}`, r: 6, fill: i % 2 ? c.cyan : c.teal, opacity: 0 })),
    ),
    update(t, ctx) {
      const S = ctx.state;
      S.badge = { ...badgeWorld(t, b), t };
      // symptoms fly into the badge
      icons.forEach((ic, i) => {
        const s0 = b.iconsAbsorb + i * 0.07;
        const k = prog(t, s0, s0 + 0.45, inCubic);
        if (k <= 0) return;
        const s = S.icons[ic.id];
        s.x = lerp(s.x, S.badge.x, k); s.y = lerp(s.y, S.badge.y, k);
        s.sx *= 1 - k * 0.85; s.sy *= 1 - k * 0.85;
        s.opacity *= 1 - prog(t, s0 + 0.3, s0 + 0.45);
        s.labelOpacity = (s.labelOpacity ?? 1) * (1 - clamp(k * 3));
      });
      S.grade.dizzy *= 1 - prog(t, b.scan, b.scan + 0.8, inOutCubic);
      S.beam = prog(t, b.scan - 0.05, b.scan + 0.2) * (1 - prog(t, b.scan + 0.55, b.scan + 0.9));
      S.scanK = prog(t, b.scan, b.scan + 0.55, inOutCubic);
      S.ringK = prog(t, b.activationPulse, b.activationPulse + 0.7, outCubic);
      S.sparkK = prog(t, b.activationPulse - 0.05, b.activationPulse + 0.6);
    },
    apply(ctx) {
      const S = ctx.state, $ = (id) => ctx.root.querySelector(`#${id}`);
      const bx = S.badge.x, by = S.badge.y;
      $('s3-beam').setAttribute('d', `M${bx - 60},${by - 40} L${BODY.x - BODY.rx - 30},${BODY.y - BODY.ry - 40} L${BODY.x - BODY.rx - 30},${BODY.y + BODY.ry + 40} L${bx - 60},${by + 40}Z`);
      $('s3-beam').setAttribute('opacity', (S.beam * 0.9).toFixed(3));
      const sx = lerp(BODY.x + BODY.rx + 10, BODY.x - BODY.rx - 10, S.scanK);
      const half = Math.sqrt(Math.max(0, 1 - ((sx - BODY.x) / (BODY.rx + 12)) ** 2)) * (BODY.ry + 12);
      $('s3-scan').setAttribute('d', `M${sx.toFixed(1)},${(BODY.y - half).toFixed(1)} L${sx.toFixed(1)},${(BODY.y + half).toFixed(1)}`);
      $('s3-scan').setAttribute('opacity', (S.beam * (S.scanK < 1 ? 1 : 0)).toFixed(3));
      const r = S.ringK;
      $('s3-ring').setAttribute('rx', (BODY.rx * (1 + r * 0.55)).toFixed(1));
      $('s3-ring').setAttribute('ry', (BODY.ry * (1 + r * 0.55)).toFixed(1));
      $('s3-ring').setAttribute('opacity', (r > 0 && r < 1 ? (1 - r) * 0.9 : 0).toFixed(3));
      $('s3-ring').setAttribute('stroke-width', (12 - r * 9).toFixed(2));
      const k = S.sparkK;
      for (let i = 0; i < SPARKS; i++) {
        const el = $(`s3-sp${i}`);
        if (k <= 0 || k >= 1) { el.setAttribute('opacity', 0); continue; }
        const a = (i / SPARKS) * Math.PI * 2 + i * 0.3, d = 1 + outCubic(k) * (0.35 + (i % 3) * 0.1);
        el.setAttribute('cx', (BODY.x + Math.cos(a) * BODY.rx * d).toFixed(1));
        el.setAttribute('cy', (BODY.y + Math.sin(a) * BODY.ry * d).toFixed(1));
        el.setAttribute('r', (6 * (1 - k) + 1.5).toFixed(2));
        el.setAttribute('opacity', (1 - k).toFixed(3));
      }
    },
  };
}
