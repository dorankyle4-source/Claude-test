// SECTION 3 — "What happens inside?" A simplified network of brain cells passing light signals.
// Normal (smooth, teal) → sudden disruption (shockwave, flicker, broken links, energy drops) → gradual recovery.

import { h, tr, rot, sc } from '../../engine/svg.js';
import { prog, outCubic, inOutCubic, inOutSine, outBack, clamp, lerp, fnoise } from '../../engine/anim.js';

const NAVY = '#0B1829';
const CELLS = [[260, 470], [520, 300], [560, 700], [820, 500], [1060, 300], [1100, 740], [1340, 520], [1600, 340], [1640, 760], [860, 880], [300, 840], [1250, 150]];
const LINKS = [[0, 1], [0, 2], [1, 3], [2, 3], [3, 4], [3, 5], [4, 6], [5, 6], [6, 7], [6, 8], [2, 9], [9, 5], [0, 10], [10, 9], [4, 11], [11, 7], [1, 4]];
const BROKEN = [3, 6, 9, 12];   // links that visibly break during the disruption

function curve(a, b, i) {
  const [x1, y1] = CELLS[a], [x2, y2] = CELLS[b];
  const mx = (x1 + x2) / 2 + ((i % 2) ? 1 : -1) * (y2 - y1) * 0.18, my = (y1 + y2) / 2 + ((i % 2) ? -1 : 1) * (x2 - x1) * 0.18;
  return [x1, y1, mx, my, x2, y2];
}
const qpt = ([x1, y1, cx, cy, x2, y2], u) => [(1 - u) ** 2 * x1 + 2 * (1 - u) * u * cx + u * u * x2, (1 - u) ** 2 * y1 + 2 * (1 - u) * u * cy + u * u * y2];

function cell(i) {
  const branches = [];
  for (let k = 0; k < 6; k++) {
    const a = (k / 6) * Math.PI * 2 + i, L = 38 + ((i * 7 + k * 13) % 20);
    const x = Math.cos(a) * L, y = Math.sin(a) * L;
    branches.push(`M0,0 Q${(x * 0.5 + Math.sin(a) * 10).toFixed(1)},${(y * 0.5 - Math.cos(a) * 10).toFixed(1)} ${x.toFixed(1)},${y.toFixed(1)}`);
    branches.push(`M${(x * 0.7).toFixed(1)},${(y * 0.7).toFixed(1)} l${(Math.cos(a + 0.7) * 14).toFixed(1)},${(Math.sin(a + 0.7) * 14).toFixed(1)}`);
  }
  return h('g', { id: `nr-cell${i}` },
    h('path', { d: branches.join(' '), stroke: 'currentColor', 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none', opacity: 0.8 }),
    h('circle', { r: 26, fill: 'currentColor', opacity: 0.25 }),
    h('circle', { r: 17, fill: 'currentColor' }),
    h('circle', { r: 7, fill: '#FFFFFF', opacity: 0.85 }));
}

// opts (all optional; defaults = Episode 1 behaviour):
//   recover  – signals recover inside this section (Normal → Disruption → Recovery)
//   scan     – show the "Brain scan: no obvious damage" card (T.noDamage)
//   tracker  – show the Normal / Disruption / Recovery tracker
//   caption  – { text } big line at the bottom, shown from T.caption
//   T.drainAt – when the energy starts draining (default: just after the disruption)
export function createNeurons(cfg, T, opts = {}) {
  const O = { recover: true, scan: true, tracker: true, caption: null, ...opts };
  const c = cfg.brand.colors;
  const curves = LINKS.map(([a, b], i) => curve(a, b, i));
  const stages = ['Normal', 'Disruption', 'Recovery'];

  const markup = h('g', { id: 'nr-root', opacity: 0 },
    h('defs', {},
      h('radialGradient', { id: 'nr-bg', cx: 0.5, cy: 0.45, r: 0.8 },
        h('stop', { offset: 0, 'stop-color': '#17406E' }), h('stop', { offset: 1, 'stop-color': '#07182F' })),
      h('clipPath', { id: 'nr-iris' }, h('circle', { id: 'nr-irisC', r: 0 }))),
    h('g', { 'clip-path': 'url(#nr-iris)' },
      h('rect', { width: 1920, height: 1080, fill: 'url(#nr-bg)' }),
      h('g', { id: 'nr-net' },
        h('g', { id: 'nr-links', fill: 'none', 'stroke-width': 5, 'stroke-linecap': 'round' },
          ...curves.map(([x1, y1, cx, cy, x2, y2], i) => h('path', { id: `nr-l${i}`, d: `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, stroke: c.teal, opacity: 0.55, pathLength: 1 }))),
        h('g', { id: 'nr-cells', color: c.cyan }, ...CELLS.map(([x, y], i) => h('g', { id: `nr-cw${i}`, transform: tr(x, y) }, cell(i)))),
        h('g', { id: 'nr-sigs', filter: 'url(#glow)' }, ...curves.map((_, i) => h('circle', { id: `nr-s${i}`, r: 8, fill: '#FFFFFF' }))),
        h('g', { id: 'nr-sparks', stroke: c.amber, 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' },
          ...BROKEN.map((li, k) => { const [x, y] = qpt(curves[li], 0.5); return h('path', { id: `nr-k${k}`, d: `M${x - 12},${y - 12} L${x + 12},${y + 12} M${x + 12},${y - 12} L${x - 12},${y + 12}`, opacity: 0 }); })),
      ),
      h('circle', { id: 'nr-shock', cx: -100, cy: 540, r: 0, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 10, opacity: 0 }),
      // eyebrow
      h('text', { id: 'nr-eyebrow', x: 110, y: 120, 'font-family': 'Manrope', 'font-weight': 800, 'font-size': 30, fill: c.cyan, 'letter-spacing': 5 }, 'INSIDE THE BRAIN'),
      // scan card
      h('g', { id: 'nr-scan', transform: 'translate(110 160)', opacity: 0 },
        h('rect', { width: 470, height: 150, rx: 22, fill: '#FFFFFF', filter: 'url(#dropShadow)' }),
        h('g', { transform: 'translate(80 75)' },
          h('ellipse', { rx: 54, ry: 60, fill: '#2B3440' }),
          h('ellipse', { rx: 44, ry: 50, fill: '#8C98A8' }),
          h('path', { d: 'M0,-50 L0,50 M-30,-30 q10,10 0,20 M30,-30 q-10,10 0,20 M-34,10 q12,8 0,22 M34,10 q-12,8 0,22', stroke: '#5B6776', 'stroke-width': 4, fill: 'none' })),
        h('text', { x: 160, y: 66, 'font-family': 'Manrope', 'font-weight': 800, 'font-size': 32, fill: NAVY }, 'Brain scan'),
        h('text', { x: 160, y: 106, 'font-family': 'Inter', 'font-weight': 500, 'font-size': 26, fill: '#4A5363' }, 'No obvious damage'),
        h('circle', { cx: 430, cy: 40, r: 20, fill: c.teal }),
        h('path', { d: 'M420,40 l7,7 l13,-14', stroke: '#fff', 'stroke-width': 5, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })),
      // energy gauge
      h('g', { id: 'nr-energy', transform: 'translate(1480 90)', opacity: 0 },
        h('text', { x: 0, y: 0, 'font-family': 'Manrope', 'font-weight': 800, 'font-size': 28, fill: '#FFFFFF', 'letter-spacing': 4 }, 'ENERGY'),
        h('rect', { x: 0, y: 22, width: 300, height: 56, rx: 14, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 5 }),
        h('rect', { x: 302, y: 38, width: 12, height: 24, rx: 4, fill: '#FFFFFF' }),
        h('rect', { id: 'nr-eFill', x: 10, y: 32, width: 280, height: 36, rx: 8, fill: c.teal }),
        h('text', { id: 'nr-ePct', x: 300, y: 0, 'text-anchor': 'end', 'font-family': 'Manrope', 'font-weight': 800, 'font-size': 28, fill: '#FFFFFF' }, '100%')),
      // stage tracker
      O.caption ? h('text', { id: 'nr-cap', x: 960, y: 1000, 'text-anchor': 'middle', 'font-family': 'Manrope', 'font-weight': 800, 'font-size': 56, fill: '#FFFFFF', opacity: 0 }, O.caption.text) : '',
      h('g', { id: 'nr-track', transform: 'translate(960 985)', opacity: O.tracker ? 1 : 0 },
        h('rect', { x: -420, y: -34, width: 840, height: 68, rx: 34, fill: '#FFFFFF', opacity: 0.08 }),
        h('rect', { id: 'nr-tFill', x: -420, y: -34, width: 0, height: 68, rx: 34, fill: c.teal, opacity: 0.25 }),
        ...stages.map((s, i) => h('text', { id: `nr-t${i}`, x: -280 + i * 280, y: 11, 'text-anchor': 'middle', 'font-family': 'Manrope', 'font-weight': 800, 'font-size': 30, fill: '#FFFFFF', opacity: 0.4 }, s)),
        h('path', { d: 'M-170,0 l24,0 m-10,-10 l10,10 l-10,10 M110,0 l24,0 m-10,-10 l10,10 l-10,10', stroke: '#FFFFFF', 'stroke-width': 3.5, fill: 'none', opacity: 0.4, 'stroke-linecap': 'round' })),
    ),
  );

  return {
    markup,
    update(t, ctx) {
      const $ = (id) => ctx.root.querySelector(`#${id}`), set = (id, a, v) => $(id).setAttribute(a, v);
      const visible = t > T.toNeurons && t < T.toStudio + 1.0;
      const open = prog(t, T.toNeurons + 0.1, T.toNeurons + 0.8, inOutCubic);
      const close = prog(t, T.toStudio, T.toStudio + 0.75, inOutCubic);
      set('nr-root', 'opacity', visible ? (1 - prog(close, 0.55, 0.95)).toFixed(3) : 0);
      if (!visible) return;
      const [ix, iy] = close > 0 ? (ctx.irisTo ?? [960, 540]) : [960, 520];
      set('nr-irisC', 'cx', ix); set('nr-irisC', 'cy', iy);
      set('nr-irisC', 'r', (open * (1 - close) * 2300).toFixed(1));

      // state: 0 normal … 1 fully disrupted; recovery gradual
      const hitK = prog(t, T.disruption, T.disruption + 0.4);
      const rec = O.recover ? prog(t, T.recover, T.toStudio - 0.2, inOutSine) : 0;
      const dis = hitK * (1 - rec);
      const brk = prog(t, T.disrupt, T.disrupt + 0.5) * (O.recover ? 1 - prog(t, T.recover + 0.3, T.recover + 1.6) : 1);
      const push = 1 + prog(t, T.toNeurons, T.toStudio, (k) => k) * 0.06;
      const shake = Math.exp(-Math.max(0, t - T.disruption) * 3) * (t > T.disruption ? 14 : 0);
      set('nr-net', 'transform', `translate(960 540) ${sc(push)} translate(-960 -540) ${tr(fnoise(t * 30, 1) * shake, fnoise(t * 30, 2) * shake)}`);

      const cool = c.cyan, hot = '#B9A3FF';
      set('nr-cells', 'color', dis > 0.5 ? hot : cool);
      CELLS.forEach(([x, y], i) => {
        const j = dis * 10;
        const flick = dis > 0.2 && Math.sin(t * 23 + i * 5) > 0.6 ? 0.45 : 1;
        set(`nr-cw${i}`, 'transform', `${tr(x + fnoise(t * 3 + i, i) * j, y + fnoise(t * 3 + i, i + 9) * j)} ${sc(1 + 0.06 * Math.sin(t * 2 + i))}`);
        set(`nr-cw${i}`, 'opacity', flick);
      });
      curves.forEach((cv, i) => {
        const isB = BROKEN.includes(i);
        set(`nr-l${i}`, 'stroke', dis > 0.5 ? '#8C7FD1' : c.teal);
        set(`nr-l${i}`, 'stroke-dasharray', isB && brk > 0 ? `${(0.5 - brk * 0.12).toFixed(3)} ${(brk * 0.24).toFixed(3)} 1` : '1 0');
        // signals: steady flow → slow, erratic, stuck at breaks → speed back up
        const speed = lerp(0.9, 0.18, dis);
        let u = ((t * speed + i * 0.37) % 1);
        if (isB && brk > 0.3) u = Math.min(u, 0.38 + Math.sin(t * 8 + i) * 0.03);
        const [px, py] = qpt(cv, u);
        set(`nr-s${i}`, 'cx', (px + fnoise(t * 8, i) * dis * 8).toFixed(1));
        set(`nr-s${i}`, 'cy', (py + fnoise(t * 8, i + 3) * dis * 8).toFixed(1));
        const dim = dis > 0.3 && Math.sin(t * 17 + i * 3) > 0.3 ? 0.25 : 1;
        set(`nr-s${i}`, 'opacity', (Math.sin(u * Math.PI) * dim).toFixed(2));
        set(`nr-s${i}`, 'fill', dis > 0.5 ? '#FFD28A' : '#FFFFFF');
      });
      BROKEN.forEach((_, k) => set(`nr-k${k}`, 'opacity', (brk * (0.6 + 0.4 * Math.sin(t * 12 + k))).toFixed(2)));

      const sk = prog(t, T.disruption - 0.05, T.disruption + 0.9, outCubic);
      set('nr-shock', 'r', (sk * 2400).toFixed(1));
      set('nr-shock', 'opacity', (sk > 0 && sk < 1 ? (1 - sk) * 0.8 : 0).toFixed(3));
      set('nr-shock', 'stroke-width', (40 * (1 - sk) + 4).toFixed(1));

      set('nr-eyebrow', 'opacity', (prog(t, T.toNeurons + 0.6, T.toNeurons + 1.0)).toFixed(3));
      const sc1 = O.scan ? outBack(prog(t, T.noDamage, T.noDamage + 0.4), 1.6) : 0;
      set('nr-scan', 'opacity', O.scan ? (prog(t, T.noDamage, T.noDamage + 0.2) * (1 - prog(t, T.disruption - 0.3, T.disruption))).toFixed(3) : 0);
      set('nr-scan', 'transform', `translate(${110 - (1 - sc1) * 60} 160)`);

      // energy: full → drains after the hit → highlighted on "energy" → refills during recovery
      const d0 = T.drainAt ?? T.disruption + 0.3;
      const drain = prog(t, d0, d0 + 2.2, inOutCubic) * (O.recover ? 1 - prog(t, T.recover, T.toStudio - 0.2, inOutSine) : 1);
      const level = 1 - 0.68 * drain;
      set('nr-energy', 'opacity', prog(t, T.toNeurons + 0.9, T.toNeurons + 1.4).toFixed(3));
      const pulse = 1 + 0.12 * Math.max(0, Math.sin(clamp((t - T.energy) / 0.6) * Math.PI));
      set('nr-energy', 'transform', `translate(1480 90) translate(150 50) ${sc(pulse)} translate(-150 -50)`);
      set('nr-eFill', 'width', (280 * level).toFixed(1));
      set('nr-eFill', 'fill', level < 0.6 ? c.amber : c.teal);
      $('nr-ePct').textContent = `${Math.round(level * 100)}%`;

      if (O.caption) {
        const ck = prog(t, T.caption, T.caption + 0.5, outCubic) * (1 - prog(t, T.toStudio - 0.2, T.toStudio + 0.2));
        set('nr-cap', 'opacity', ck.toFixed(3));
        set('nr-cap', 'transform', tr(0, (1 - ck) * 20));
      }
      if (!O.tracker) return;
      const stage = t < T.disruption ? 0 : t < T.recover ? 1 : 2;
      for (let i = 0; i < 3; i++) set(`nr-t${i}`, 'opacity', i === stage ? 1 : 0.4);
      set('nr-t1', 'fill', stage === 1 ? '#FFD28A' : '#FFFFFF');
      const tf = stage === 0 ? prog(t, T.toNeurons + 0.5, T.disruption) * 0.33 : stage === 1 ? 0.33 + prog(t, T.disruption, T.recover) * 0.33 : 0.66 + prog(t, T.recover, T.toStudio - 0.3) * 0.34;
      set('nr-tFill', 'width', (840 * tf).toFixed(1));
    },
  };
}
