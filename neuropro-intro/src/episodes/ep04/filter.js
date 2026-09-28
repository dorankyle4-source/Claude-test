// SECTIONS 2–3 — inside the brain. Sensory "packets" (light, sound, movement, conversation) stream toward the brain.
// A sensory filter lets IMPORTANT things through and turns BACKGROUND NOISE down. After a concussion the filter can
// be overwhelmed for a while: packets arrive faster and bigger, most get through, and the volume knob jumps to TOO MUCH.

import { h, tr, rot, sc } from '../../engine/svg.js';
import { prog, outCubic, inCubic, outBack, inOutCubic, clamp, lerp, fnoise } from '../../engine/anim.js';
import { MASCOT_OUTLINE, FOLDS } from '../../characters/mascot.js';
import { knobMarkup, mountKnob } from './knob.js';

const NAVY = '#0B1829';
const FX = 900;                        // filter x
const BRAIN = [1440, 560];
const POOL = 32;
const LANES = [300, 420, 540, 660, 780];

function icon(type, c) {
  if (type === 'light') return h('g', {}, h('circle', { r: 14, fill: c.amber }),
    h('path', { d: Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * Math.PI * 2; return `M${(Math.cos(a) * 20).toFixed(1)},${(Math.sin(a) * 20).toFixed(1)} L${(Math.cos(a) * 28).toFixed(1)},${(Math.sin(a) * 28).toFixed(1)}`; }).join(' '), stroke: c.amber, 'stroke-width': 5, 'stroke-linecap': 'round' }));
  if (type === 'sound') return h('g', {}, h('path', { d: 'M-22,-8 L-12,-8 L2,-20 L2,20 L-12,8 L-22,8Z', fill: c.sky, stroke: NAVY, 'stroke-width': 3, 'stroke-linejoin': 'round' }),
    h('path', { d: 'M10,-10 q8,10 0,20 M17,-17 q14,17 0,34', fill: 'none', stroke: c.sky, 'stroke-width': 4.5, 'stroke-linecap': 'round' }));
  if (type === 'move') return h('path', { d: 'M-24,-8 L10,-8 L10,-18 L26,0 L10,18 L10,8 L-24,8Z', fill: c.violet, stroke: NAVY, 'stroke-width': 3, 'stroke-linejoin': 'round' });
  return h('g', {}, h('path', { d: 'M-24,-18 L24,-18 Q30,-18 30,-12 L30,6 Q30,12 24,12 L-4,12 L-14,24 L-12,12 L-24,12 Q-30,12 -30,6 L-30,-12 Q-30,-18 -24,-18Z', fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 3.5, 'stroke-linejoin': 'round' }),
    h('path', { d: 'M-18,-6 h36 M-18,2 h22', stroke: c.teal, 'stroke-width': 4, 'stroke-linecap': 'round' }));
}

export function createFilterScene(cfg, T) {
  const c = cfg.brand.colors, F = cfg.brand.fonts;
  const TYPES = ['light', 'sound', 'move', 'talk'];

  // deterministic spawn schedule: calm flow, then a flood after the concussion cue
  const spawns = [];
  let ts = T.toInside + 0.2, i = 0;
  while (ts < T.toCafe + 0.3) {
    const flood = prog(ts, T.filterCue - 0.3, T.intense, (k) => k);
    const overloaded = ts > T.filterCue - 0.3;
    spawns.push({ ts, lane: LANES[(i * 3 + (i >> 2)) % 5] + ((i * 37) % 30) - 15, type: TYPES[(i * 7 + (i >> 1)) % 4], important: !overloaded && i % 4 === 1, overloaded, i });
    ts += lerp(0.42, 0.11, flood);
    i++;
  }
  const bySlot = Array.from({ length: POOL }, () => []);
  spawns.forEach((s) => bySlot[s.i % POOL].push(s));

  const slats = Array.from({ length: 11 }, (_, k) => h('rect', { id: `fl-sl${k}`, x: -26, y: -250 + k * 46, width: 52, height: 10, rx: 5, fill: '#FFFFFF', opacity: 0.8 }));

  const markup = h('g', { id: 'fs-root', opacity: 0 },
    h('defs', {},
      h('radialGradient', { id: 'fs-bg', cx: 0.55, cy: 0.5, r: 0.85 }, h('stop', { offset: 0, 'stop-color': '#17406E' }), h('stop', { offset: 1, 'stop-color': '#07182F' })),
      h('clipPath', { id: 'fs-iris' }, h('circle', { id: 'fs-irisC', r: 0 })),
      h('clipPath', { id: 'fs-bclip' }, h('path', { d: MASCOT_OUTLINE }))),
    h('g', { 'clip-path': 'url(#fs-iris)' },
      h('rect', { width: 1920, height: 1080, fill: 'url(#fs-bg)' }),
      h('rect', { id: 'fs-flash', width: 1920, height: 1080, fill: '#FFF3C4', opacity: 0 }),
      h('g', { id: 'fs-cam' },
        // tray where turned-down noise settles
        h('rect', { x: 150, y: 900, width: 760, height: 16, rx: 8, fill: '#FFFFFF', opacity: 0.1 }),
        // brain (same drawing as the mascot, face only)
        h('g', { id: 'fs-brain', transform: `${tr(BRAIN[0], BRAIN[1])} ${sc(0.9)}` },
          h('path', { id: 'fs-bglow', d: MASCOT_OUTLINE, fill: 'none', stroke: c.cyan, 'stroke-width': 30, filter: 'url(#blur14)', opacity: 0.4 }),
          h('path', { d: MASCOT_OUTLINE, fill: '#FC9D7B', stroke: NAVY, 'stroke-width': 10 }),
          h('g', { 'clip-path': 'url(#fs-bclip)' },
            h('ellipse', { cx: -70, cy: -110, rx: 150, ry: 70, fill: '#FFC2A8', opacity: 0.45 }),
            h('g', { fill: 'none', stroke: '#DC6446', 'stroke-width': 10, 'stroke-linecap': 'round' }, ...FOLDS.map((d) => h('path', { d })))),
          h('g', { id: 'fs-eyes' },
            h('ellipse', { cx: 20, cy: -34, rx: 21, ry: 31, fill: NAVY }), h('ellipse', { cx: 132, cy: -34, rx: 21, ry: 31, fill: NAVY }),
            h('circle', { cx: 27, cy: -47, r: 8, fill: '#fff' }), h('circle', { cx: 139, cy: -47, r: 8, fill: '#fff' })),
          h('path', { id: 'fs-mouth', fill: '#2A0F14', stroke: NAVY, 'stroke-width': 6, 'stroke-linejoin': 'round' })),
        // the filter
        h('g', { id: 'fs-filter', transform: tr(FX, 560) },
          h('rect', { id: 'fs-fglow', x: -60, y: -300, width: 120, height: 600, rx: 40, fill: c.teal, opacity: 0.25, filter: 'url(#blur14)' }),
          h('rect', { x: -44, y: -280, width: 88, height: 560, rx: 30, fill: c.teal, opacity: 0.18, stroke: c.teal, 'stroke-width': 8 }),
          h('g', { id: 'fs-slats' }, ...slats)),
        h('text', { x: FX, y: 900, 'text-anchor': 'middle', 'font-family': F.display, 'font-weight': 800, 'font-size': 30, fill: c.cyan, 'letter-spacing': 5 }, 'SENSORY FILTER'),
        // packets
        h('g', { id: 'fs-packets' }, ...Array.from({ length: POOL }, (_, k) => h('g', { id: `fs-p${k}`, opacity: 0 },
          h('circle', { id: `fs-ring${k}`, r: 52, fill: 'none', stroke: c.teal, 'stroke-width': 7, opacity: 0 }),
          h('circle', { r: 42, fill: '#FFFFFF' }),
          h('g', { id: `fs-ic${k}` }, ...TYPES.map((ty) => h('g', { id: `fs-ic${k}-${ty}`, opacity: 0 }, icon(ty, c))))))),
        knobMarkup('fs-knob', cfg.brand, { labels: true }),
      ),
      // labels
      h('text', { id: 'fs-eyebrow', x: 110, y: 120, 'font-family': F.display, 'font-weight': 800, 'font-size': 30, fill: c.cyan, 'letter-spacing': 5 }, 'INSIDE THE BRAIN'),
      h('text', { id: 'fs-eyebrow2', x: 110, y: 120, 'font-family': F.display, 'font-weight': 800, 'font-size': 30, fill: '#FFD28A', 'letter-spacing': 5, opacity: 0 }, 'AFTER A CONCUSSION'),
      ...[['fs-c1', 'IMPORTANT', 'LET THROUGH', c.teal, 1030, 190], ['fs-c2', 'BACKGROUND NOISE', 'TURN DOWN', '#8FA7C4', 110, 980]].map(([id, a, bb, col, x, y]) =>
        h('g', { id, opacity: 0, transform: tr(x, y) },
          h('rect', { x: 0, y: -40, width: 60 + (a.length + bb.length) * 21 + 70, height: 80, rx: 40, fill: '#FFFFFF' }),
          h('circle', { cx: 40, cy: 0, r: 12, fill: col }),
          h('text', { x: 66, y: 11, 'font-family': F.display, 'font-weight': 800, 'font-size': 32, fill: NAVY }, `${a}  →  ${bb}`))),
      ...[['LIGHT', 'BRIGHT', c.amber], ['SOUND', 'LOUD', c.sky], ['MOVEMENT', 'DISTRACTING', c.violet], ['CONVERSATIONS', 'OVERLAPPING', c.coral]].map(([a, bb, col], k) =>
        h('g', { id: `fs-t${k}`, opacity: 0, transform: tr(110, 200 + k * 76) },
          h('rect', { x: 0, y: -30, width: 530, height: 60, rx: 30, fill: '#FFFFFF', opacity: 0.95 }),
          h('circle', { cx: 32, cy: 0, r: 10, fill: col }),
          h('text', { x: 54, y: 10, 'font-family': F.display, 'font-weight': 800, 'font-size': 27, fill: NAVY }, `${a}  →  ${bb}`))),
      h('g', { id: 'fs-some', opacity: 0 },
        h('rect', { x: 560, y: 945, width: 800, height: 76, rx: 38, fill: '#FFFFFF' }),
        h('text', { x: 960, y: 995, 'text-anchor': 'middle', 'font-family': F.display, 'font-weight': 800, 'font-size': 34, fill: NAVY }, 'For some people, for a while.')),
    ),
  );

  return {
    markup,
    mount(svg) {
      this.knob = mountKnob(svg, 'fs-knob');
    },
    update(t, ctx) {
      const $ = (id) => ctx.root.querySelector(`#${id}`), set = (id, a, v) => $(id).setAttribute(a, v);
      const visible = t > T.toInside && t < T.toCafe + 0.9;
      set('fs-root', 'opacity', visible ? (1 - prog(prog(t, T.toCafe, T.toCafe + 0.75), 0.55, 0.95)).toFixed(3) : 0);
      if (!visible) return;
      const open = prog(t, T.toInside + 0.1, T.toInside + 0.8, inOutCubic), close = prog(t, T.toCafe, T.toCafe + 0.75, inOutCubic);
      const [ix, iy] = close > 0 ? ctx.irisTo : [960, 540];
      set('fs-irisC', 'cx', ix); set('fs-irisC', 'cy', iy); set('fs-irisC', 'r', (open * (1 - close) * 2300).toFixed(1));

      const ov = prog(t, T.filterCue - 0.2, T.intense, inOutCubic);         // how overwhelmed the filter is
      const shake = ov * (6 + 8 * prog(t, T.intense - 0.5, T.intense));
      set('fs-cam', 'transform', `translate(960 540) ${sc(1 + prog(t, T.toInside, T.toCafe, (k) => k) * 0.05)} translate(-960 -540) ${tr(fnoise(t * 30, 1) * shake, fnoise(t * 30, 2) * shake)}`);
      set('fs-flash', 'opacity', (ov * 0.12 * Math.max(0, Math.sin(t * 13))).toFixed(3));

      // filter: calm glow → flickering, slats bending / dropping out
      set('fs-fglow', 'opacity', (0.25 + 0.2 * Math.sin(t * 3) * (1 - ov) + ov * 0.4 * Math.max(0, Math.sin(t * 21))).toFixed(3));
      set('fs-fglow', 'fill', ov > 0.5 ? c.coral : c.teal);
      for (let k = 0; k < 11; k++) {
        const gone = ov > 0.3 && (k * 5 + Math.floor(t * 6)) % 4 === 0 ? 0.1 : 0.8;
        set(`fl-sl${k}`, 'opacity', lerp(0.8, gone, ov).toFixed(2));
        set(`fl-sl${k}`, 'transform', `${tr(fnoise(t * 8, k) * ov * 10, 0)} ${rot(fnoise(t * 5, k + 20) * ov * 18, 0, -245 + k * 46)}`);
      }

      // brain reacts: calm glow, then squinting under the flood
      const blink = Math.max(0, 1 - Math.abs(t - (T.toInside + 3.4)) / 0.08);
      const squeeze = ov * (0.55 + 0.2 * Math.sin(t * 9));
      set('fs-eyes', 'transform', `translate(0 -34) ${sc(1, Math.max(0.1, 1 - blink * 0.9 - squeeze))} translate(0 34)`);
      const sm = lerp(0.6, -0.4, ov), op = lerp(0.35, 0.15, ov), w = 50;
      const cy = -sm * 10, bot = 8 + op * 58 + Math.max(0, sm) * 18;
      set('fs-mouth', 'd', `M${74 - w},${52 + cy} Q74,${52 + cy + sm * 3 - op * 5} ${74 + w},${52 + cy} Q74,${52 + bot} ${74 - w},${52 + cy}Z`);
      set('fs-brain', 'transform', `${tr(BRAIN[0] + fnoise(t * 20, 7) * ov * 8, BRAIN[1])} ${sc(0.9 + 0.015 * Math.sin(t * 2.4))}`);
      set('fs-bglow', 'stroke', ov > 0.5 ? c.coral : c.cyan);
      set('fs-bglow', 'opacity', (0.35 + ov * 0.4 * Math.max(0, Math.sin(t * 17))).toFixed(3));

      // packets
      for (let k = 0; k < POOL; k++) {
        const list = bySlot[k];
        let s = null;
        for (const cand of list) if (cand.ts <= t) s = cand; else break;
        const el = `fs-p${k}`;
        if (!s) { set(el, 'opacity', 0); continue; }
        const a = t - s.ts, v = s.overloaded ? 820 : 540, tf = (FX + 60) / v;
        let x, y = s.lane, scl = s.overloaded ? 1.25 + 0.12 * Math.sin(t * 10 + k) : 1, o = Math.min(1, a * 4);
        const pass = s.important || s.overloaded;
        if (a < tf) { x = -60 + v * a; y += s.overloaded ? fnoise(t * 6, k) * 18 : 0; }
        else if (pass) {
          const u = clamp((a - tf) / (s.overloaded ? 0.55 : 0.8));
          x = lerp(FX, BRAIN[0] - 60, inCubic(u)); y = lerp(s.lane, BRAIN[1] - 40, inOutCubic(u));
          scl *= 1 - 0.7 * u; o *= 1 - prog(u, 0.75, 1);
          if (u >= 1) o = 0;
        } else {
          const u = clamp((a - tf) / 1.3);
          x = FX - 40 - 260 * outCubic(u); y = lerp(s.lane, 880, outCubic(u));
          scl = 1 - 0.55 * u; o = lerp(1, 0.3, u) * (1 - prog(u, 0.8, 1));
          if (u >= 1) o = 0;
        }
        set(el, 'opacity', o.toFixed(3));
        set(el, 'transform', `${tr(x, y)} ${sc(scl)}`);
        set(`fs-ring${k}`, 'opacity', s.important && a >= tf * 0.7 ? 1 : s.overloaded ? 0.6 : 0);
        set(`fs-ring${k}`, 'stroke', s.overloaded ? c.coral : c.teal);
        for (const ty of TYPES) set(`fs-ic${k}-${ty}`, 'opacity', ty === s.type ? 1 : 0);
      }

      // knob: NORMAL → jumps to TOO MUCH
      const jump = t > T.tooMuch ? 1 - Math.exp(-(t - T.tooMuch) * 7) * Math.cos((t - T.tooMuch) * 18) : 0;
      this.knob({ x: FX, y: 172, scale: 0.55, appear: prog(t, T.toInside + 0.9, T.toInside + 1.3), level: lerp(0.3, 0.98, jump) + fnoise(t * 12, 3) * 0.03 * ov, glow: jump * (0.4 + 0.3 * Math.sin(t * 12)) });

      // labels
      set('fs-eyebrow', 'opacity', (prog(t, T.toInside + 0.6, T.toInside + 1) * (1 - prog(t, T.concStart, T.concStart + 0.3))).toFixed(3));
      set('fs-eyebrow2', 'opacity', prog(t, T.concStart + 0.1, T.concStart + 0.5).toFixed(3));
      for (const [id, at] of [['fs-c1', T.letThrough], ['fs-c2', T.turnDown]]) {
        const kk = outBack(prog(t, at, at + 0.4), 1.6), out = prog(t, T.concStart - 0.3, T.concStart + 0.1);
        set(id, 'opacity', (prog(t, at, at + 0.15) * (1 - out)).toFixed(3));
        const [bx, by] = id === 'fs-c1' ? [1030, 190] : [110, 980];
        set(id, 'transform', `translate(${bx} ${by}) ${sc(0.9 + 0.1 * kk)}`);
      }
      [T.light, T.sound, T.otherSensory, T.otherSensory + 0.5].forEach((at, k) => {
        const kk = outBack(prog(t, at, at + 0.35), 1.8);
        set(`fs-t${k}`, 'opacity', prog(t, at, at + 0.12).toFixed(3));
        set(`fs-t${k}`, 'transform', `translate(${110 + (1 - kk) * -60} ${200 + k * 76}) ${sc(0.92 + 0.08 * kk)}`);
      });
      const so = prog(t, T.forAWhile, T.forAWhile + 0.4, outCubic);
      set('fs-some', 'opacity', so.toFixed(3));
      set('fs-some', 'transform', tr(0, (1 - so) * 16));
    },
  };
}
