// Stylised brain inside a holographic "insight" panel.
// state.order: 0 = scrambled (post-concussion, lavender, jittery) → 1 = organised (NeuroPro teal, glowing network).
// Deliberately friendly and non-anatomical: a soft silhouette with a few smooth folds, no gore, no realism.

import { h, tr, rot, sc } from '../engine/svg.js';
import { fnoise, clamp } from '../engine/anim.js';

export const BRAIN_OUTLINE =
  'M-135,10 C-150,-40 -120,-95 -70,-105 C-40,-130 10,-128 35,-110 C70,-120 120,-95 130,-55 ' +
  'C150,-20 145,25 120,45 C110,70 80,80 55,72 C60,95 40,112 15,108 C-5,106 -12,95 -10,82 ' +
  'C-30,90 -60,88 -80,70 C-110,68 -135,45 -135,10Z';

const SULCI = [
  'M8,-116 C-2,-80 20,-50 4,-12',
  'M-96,38 C-60,18 -20,24 26,8',
  'M-104,-36 C-84,-58 -62,-28 -40,-54',
  'M50,-82 C70,-60 92,-82 108,-50',
  'M40,-22 C60,-6 82,-26 104,4',
  'M-62,-82 C-42,-70 -30,-96 -10,-86',
  'M-72,2 C-52,-14 -30,14 -12,-6',
  'M60,34 C76,24 92,36 108,24',
  'M18,90 C28,96 40,92 48,84',
];

const NODES = [[-100, 0], [-70, -60], [-30, -90], [20, -95], [70, -80], [110, -40], [105, 20], [60, 50],
  [10, 40], [-40, 50], [-80, 40], [-40, -20], [20, -30], [60, -10], [-10, 5]];
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 0],
  [11, 1], [11, 0], [11, 14], [12, 2], [12, 3], [12, 13], [13, 4], [13, 6], [14, 8], [14, 12], [11, 9], [13, 7]];

export function createBrainPanel(brand, prefix = 'bp-') {
  const c = brand.colors;
  const P = prefix;
  const id = (n) => P + n;

  const ticks = [];
  for (let i = 0; i < 60; i++) {
    const a = (i / 60) * Math.PI * 2, r0 = i % 5 ? 162 : 156, r1 = 170;
    ticks.push(`M${(Math.cos(a) * r0).toFixed(1)},${(Math.sin(a) * r0).toFixed(1)} L${(Math.cos(a) * r1).toFixed(1)},${(Math.sin(a) * r1).toFixed(1)}`);
  }

  const markup = h('g', { id: id('root'), opacity: 0 },
    h('defs', {},
      h('linearGradient', { id: id('gDis'), x1: 0, y1: 0, x2: 1, y2: 1 },
        h('stop', { offset: 0, 'stop-color': '#CFC5F2' }), h('stop', { offset: 1, 'stop-color': '#8E81C9' })),
      h('linearGradient', { id: id('gOrg'), x1: 0, y1: 0, x2: 1, y2: 1 },
        h('stop', { offset: 0, 'stop-color': '#47E6D2' }), h('stop', { offset: 1, 'stop-color': '#3A8DFF' })),
      h('radialGradient', { id: id('glass'), cx: 0.4, cy: 0.35, r: 0.7 },
        h('stop', { offset: 0, 'stop-color': '#FFFFFF', 'stop-opacity': 0.85 }),
        h('stop', { offset: 1, 'stop-color': '#E4F3FA', 'stop-opacity': 0.55 })),
      h('clipPath', { id: id('clip') }, h('path', { d: BRAIN_OUTLINE })),
    ),
    // HUD disc
    h('g', { id: id('hud') },
      h('circle', { r: 176, fill: `url(#${id('glass')})`, filter: 'url(#dropShadow)' }),
      h('circle', { id: id('hudTint'), r: 176, fill: c.teal, opacity: 0 }),
      h('g', { id: id('ticks') }, h('path', { d: ticks.join(' '), stroke: c.navy, 'stroke-width': 2, opacity: 0.25 })),
      h('circle', { id: id('ring'), r: 176, fill: 'none', stroke: c.navy, 'stroke-width': 2.5, opacity: 0.18 }),
      h('circle', { id: id('arc'), r: 188, fill: 'none', stroke: c.teal, 'stroke-width': 5, 'stroke-linecap': 'round',
        'stroke-dasharray': '0 1200', transform: 'rotate(-90)' }),
    ),
    h('circle', { id: id('pulse'), r: 180, fill: 'none', stroke: c.cyan, 'stroke-width': 6, opacity: 0 }),
    h('g', { id: id('brain') },
      h('path', { id: id('glow'), d: BRAIN_OUTLINE, fill: c.cyan, filter: 'url(#blur14)', opacity: 0 }),
      h('path', { d: 'M-12,80 C-10,110 -4,130 8,138 C16,132 18,110 14,92Z', fill: '#7F73BC', id: id('stemDis') }),
      h('path', { d: 'M-12,80 C-10,110 -4,130 8,138 C16,132 18,110 14,92Z', fill: '#2EA7E8', id: id('stemOrg'), opacity: 0 }),
      h('path', { id: id('bodyDis'), d: BRAIN_OUTLINE, fill: `url(#${id('gDis')})` }),
      h('path', { id: id('bodyOrg'), d: BRAIN_OUTLINE, fill: `url(#${id('gOrg')})`, opacity: 0 }),
      h('g', { 'clip-path': `url(#${id('clip')})` },
        h('ellipse', { cx: -40, cy: -70, rx: 110, ry: 50, fill: '#fff', opacity: 0.22 }),
        h('path', { d: 'M-150,60 C-60,110 60,110 160,40 L160,140 L-150,140Z', fill: '#1B2B44', opacity: 0.12 }),
      ),
      h('g', { id: id('sulci'), fill: 'none', stroke: '#FFFFFF', 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0.55 },
        ...SULCI.map((d, i) => h('path', { id: id(`s${i}`), d }))),
      // scrambled signals
      h('g', { id: id('tangle'), fill: 'none', stroke: '#6D5FB5', 'stroke-width': 4, 'stroke-linecap': 'round', opacity: 0 },
        h('path', { id: id('t0'), d: 'M-90,-20 C-60,-70 -20,30 10,-40 C30,-90 60,10 90,-30' }),
        h('path', { id: id('t1'), d: 'M-70,30 C-40,-10 -10,60 30,10 C60,-20 80,40 100,0' }),
        h('path', { id: id('t2'), d: 'M-40,-80 C-10,-40 20,-100 50,-60' }),
      ),
      h('g', { id: id('sparks'), fill: 'none', stroke: c.amber, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' },
        h('path', { id: id('k0'), d: 'M-150,-60 l14,8 l-6,10 l16,6' }),
        h('path', { id: id('k1'), d: 'M140,-80 l-12,10 l8,8 l-14,10' }),
        h('path', { id: id('k2'), d: 'M130,70 l-14,-4 l4,12 l-14,-2' }),
      ),
      // organised network
      h('g', { id: id('net'), opacity: 0 },
        h('g', { stroke: '#FFFFFF', 'stroke-width': 2.5, opacity: 0.55 },
          ...EDGES.map(([a, b]) => h('line', { x1: NODES[a][0], y1: NODES[a][1], x2: NODES[b][0], y2: NODES[b][1] }))),
        h('g', { fill: '#FFFFFF' }, ...NODES.map(([x, y], i) => h('circle', { id: id(`n${i}`), cx: x, cy: y, r: 5 }))),
        h('g', { fill: '#FFFFFF', filter: 'url(#glow)' }, ...EDGES.map((_, i) => h('circle', { id: id(`p${i}`), r: 4.5, opacity: 0 }))),
      ),
    ),
  );

  return {
    markup,
    mount(root) {
      const cache = {};
      const $ = (n) => (cache[n] ||= root.querySelector(`#${P}${n}`));
      const set = (n, a, v) => $(n).setAttribute(a, v);

      /** state: { t, x, y, scale, sx, sy, appear, order, pulse, arc } */
      return (s) => {
        set('root', 'transform', `${tr(s.x, s.y)} ${sc(s.scale * (s.sx ?? 1), s.scale * (s.sy ?? 1))}`);
        set('root', 'opacity', clamp(s.appear).toFixed(3));
        const t = s.t, o = clamp(s.order), dis = 1 - o;

        set('ticks', 'transform', rot(t * 12));
        set('arc', 'stroke-dasharray', `${(clamp(s.arc ?? 0) * 1181).toFixed(1)} 1200`);
        set('hudTint', 'opacity', (o * 0.08).toFixed(3));

        // brain wobble when scrambled
        const wob = dis * (fnoise(t * 2.2, 1) * 4.5);
        const jx = dis * fnoise(t * 3.1, 2) * 3, jy = dis * fnoise(t * 2.7, 3) * 3;
        const breathe = 1 + Math.sin(t * 2.4) * 0.012 + o * Math.sin(t * 3.2) * 0.01;
        set('brain', 'transform', `${tr(jx, jy)} ${rot(wob)} ${sc(0.8 * breathe)}`);

        set('bodyDis', 'opacity', dis.toFixed(3));
        set('stemDis', 'opacity', dis.toFixed(3));
        set('bodyOrg', 'opacity', o.toFixed(3));
        set('stemOrg', 'opacity', o.toFixed(3));
        set('glow', 'opacity', (o * (0.5 + 0.12 * Math.sin(t * 4))).toFixed(3));

        for (let i = 0; i < SULCI.length; i++) {
          const a = dis * fnoise(t * 4 + i * 3.3, i) * 5, b = dis * fnoise(t * 3.6 + i * 1.7, i + 20) * 5;
          set(`s${i}`, 'transform', tr(a, b));
        }
        set('sulci', 'opacity', (0.55 - o * 0.25).toFixed(3));

        const tangle = dis * clamp(s.scramble ?? 1);
        set('tangle', 'opacity', (tangle * 0.55).toFixed(3));
        for (let i = 0; i < 3; i++) set(`t${i}`, 'transform', `${tr(fnoise(t * 5 + i, 7 + i) * 6, fnoise(t * 5 + i, 11 + i) * 6)}`);
        for (let i = 0; i < 3; i++) {
          const f = Math.sin(t * 17 + i * 2.1) > 0.35 ? 1 : 0;
          set(`k${i}`, 'opacity', (tangle * f).toFixed(2));
        }

        set('net', 'opacity', o.toFixed(3));
        if (o > 0.01) {
          for (let i = 0; i < EDGES.length; i++) {
            const [a, b] = EDGES[i];
            const ph = (t * 1.3 + i * 0.37) % 1;
            const [x1, y1] = NODES[a], [x2, y2] = NODES[b];
            set(`p${i}`, 'cx', (x1 + (x2 - x1) * ph).toFixed(1));
            set(`p${i}`, 'cy', (y1 + (y2 - y1) * ph).toFixed(1));
            set(`p${i}`, 'opacity', (Math.sin(ph * Math.PI) * o).toFixed(2));
          }
          for (let i = 0; i < NODES.length; i++) set(`n${i}`, 'r', (4 + 2.5 * Math.max(0, Math.sin(t * 5 + i * 1.3)) * o).toFixed(2));
        }

        const pk = s.pulse ?? 0;
        set('pulse', 'r', (170 + pk * 140).toFixed(1));
        set('pulse', 'opacity', (pk > 0 && pk < 1 ? (1 - pk) * 0.9 : 0).toFixed(3));
        set('pulse', 'stroke-width', (10 - pk * 8).toFixed(2));
      };
    },
  };
}
