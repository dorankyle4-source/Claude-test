// Coffee-shop set for Episode 4, in the series style (flat shapes, navy outlines on props, NeuroPro palette).
// Parallax layers: far (wall, window, menu, pendant lamps) · mid (counter, machines, customers) · table (café table for the Brain).
// update(t, s) takes the overload level (0 calm → 1 overwhelming) and the per-source intensities.

import { h, tr, rot, sc } from '../../engine/svg.js';
import { clamp, fnoise } from '../../engine/anim.js';

const NAVY = '#0B1829';
export const PENDANTS = [[520, 0], [960, 0], [1400, 0]];
export const ESPRESSO = [1380, 640];
export const BLENDER = [1760, 640];
export const PEOPLE = [[420, 700], [590, 700], [1560, 660]];

export function createCafe(brand) {
  const c = brand.colors;
  const tiles = [];
  for (let r = 0; r < 5; r++) for (let k = 0; k < 16; k++) tiles.push(h('rect', { x: 1060 + k * 72 + (r % 2 ? 36 : 0), y: 400 + r * 48, width: 68, height: 44, rx: 6, fill: '#E4F1EE' }));

  const defs = h('defs', {},
    h('linearGradient', { id: 'cf-wall', x1: 0, y1: 0, x2: 0, y2: 1 }, h('stop', { offset: 0, 'stop-color': '#F4EADF' }), h('stop', { offset: 1, 'stop-color': '#EADBCB' })),
    h('linearGradient', { id: 'cf-floor', x1: 0, y1: 0, x2: 0, y2: 1 }, h('stop', { offset: 0, 'stop-color': '#CFAE8B' }), h('stop', { offset: 1, 'stop-color': '#B8946F' })),
    h('radialGradient', { id: 'cf-glow' }, h('stop', { offset: 0, 'stop-color': '#FFF3C4', 'stop-opacity': 1 }), h('stop', { offset: 1, 'stop-color': '#FFF3C4', 'stop-opacity': 0 })),
    h('clipPath', { id: 'cf-win' }, h('rect', { x: 120, y: 150, width: 560, height: 470, rx: 24 })),
    h('filter', { id: 'cf-soft', x: '-20%', y: '-20%', width: '140%', height: '140%' }, h('feGaussianBlur', { stdDeviation: 2.5 })),
  );

  const person = (i, [x, y], col) => h('g', { id: `cf-person${i}`, transform: tr(x, y), filter: 'url(#cf-soft)', opacity: 0.9 },
    h('path', { d: 'M-60,120 C-60,40 -40,0 0,0 C40,0 60,40 60,120Z', fill: col }),
    h('circle', { cx: 0, cy: -40, r: 38, fill: col }),
    h('path', { d: 'M-40,-50 C-38,-86 38,-86 40,-50 C20,-64 -20,-64 -40,-50Z', fill: NAVY, opacity: 0.35 }));

  const far = h('g', {},
    h('rect', { x: -400, y: -300, width: 2800, height: 1110, fill: 'url(#cf-wall)' }),
    ...tiles,
    // window with a street outside
    h('g', { 'clip-path': 'url(#cf-win)' },
      h('rect', { x: 120, y: 150, width: 560, height: 470, fill: '#BFE3F5' }),
      h('path', { d: 'M120,470 L180,470 L180,380 L260,380 L260,430 L330,430 L330,350 L420,350 L420,450 L520,450 L520,400 L600,400 L600,470 L680,470 L680,620 L120,620Z', fill: '#D3E4F0' }),
      h('rect', { x: 120, y: 540, width: 560, height: 80, fill: '#C9D3DC' }),
      ...[[200, 520], [470, 510]].map(([x, y]) => h('g', {}, h('rect', { x: x - 4, y, width: 8, height: 40, fill: '#6E9A7F' }), h('circle', { cx: x, cy: y - 10, r: 30, fill: '#8FCBA9' })))),
    h('rect', { x: 120, y: 150, width: 560, height: 470, rx: 24, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 18 }),
    h('path', { d: 'M400,150 L400,620', stroke: '#FFFFFF', 'stroke-width': 12 }),
    h('path', { d: 'M150,170 L650,170', stroke: c.coral, 'stroke-width': 26, opacity: 0.85 }),
    // menu board
    h('g', { transform: 'translate(1500 150)' },
      h('rect', { x: 0, y: 0, width: 420, height: 220, rx: 16, fill: '#1E2F45', stroke: NAVY, 'stroke-width': 8 }),
      h('text', { x: 210, y: 58, 'text-anchor': 'middle', 'font-family': 'Manrope', 'font-weight': 800, 'font-size': 36, fill: '#FFFFFF', 'letter-spacing': 4 }, 'COFFEE'),
      ...[0, 1, 2].map((i) => h('g', {}, h('rect', { x: 40, y: 92 + i * 38, width: 220, height: 10, rx: 5, fill: '#8FA7C4' }), h('rect', { x: 320, y: 92 + i * 38, width: 60, height: 10, rx: 5, fill: c.teal })))),
    // floor
    h('rect', { x: -400, y: 800, width: 2800, height: 400, fill: 'url(#cf-floor)' }),
    ...[0, 1, 2, 3].map((i) => h('path', { d: `M-400,${840 + i * i * 34} L2400,${840 + i * i * 34}`, stroke: '#A98460', 'stroke-width': 2, opacity: 0.3 })),
    // pendant lamps (cords + shades); glow is on the light layer
    ...PENDANTS.map(([x], i) => h('g', { id: `cf-lamp${i}` },
      h('path', { d: `M${x},-300 L${x},90`, stroke: NAVY, 'stroke-width': 4 }),
      h('path', { d: `M${x - 70},150 Q${x - 60},90 ${x},90 Q${x + 60},90 ${x + 70},150Z`, fill: i === 1 ? c.teal : c.navy, stroke: NAVY, 'stroke-width': 6 }),
      h('circle', { id: `cf-bulb${i}`, cx: x, cy: 152, r: 18, fill: '#FFE9A8', stroke: NAVY, 'stroke-width': 4 }))),
  );

  const mid = h('g', {},
    person(0, PEOPLE[0], '#9FB3C8'), person(1, PEOPLE[1], '#C9A9D8'),
    // small table for the two customers
    h('rect', { x: 380, y: 760, width: 250, height: 20, rx: 8, fill: '#F2E4CF', stroke: NAVY, 'stroke-width': 5 }),
    h('rect', { x: 495, y: 780, width: 20, height: 90, fill: NAVY }),
    person(2, PEOPLE[2], '#F2B38A'),
    // counter
    h('rect', { x: 1060, y: 640, width: 1300, height: 34, rx: 10, fill: '#F2E4CF', stroke: NAVY, 'stroke-width': 7 }),
    h('rect', { x: 1080, y: 674, width: 1260, height: 170, fill: c.teal, stroke: NAVY, 'stroke-width': 7 }),
    ...[0, 1, 2, 3, 4, 5].map((i) => h('rect', { x: 1110 + i * 205, y: 700, width: 170, height: 118, rx: 10, fill: '#FFFFFF', opacity: 0.18 })),
    // espresso machine
    h('g', { id: 'cf-esp' },
      h('rect', { x: -110, y: -190, width: 220, height: 190, rx: 18, fill: '#DDE4EC', stroke: NAVY, 'stroke-width': 7 }),
      h('rect', { x: -110, y: -190, width: 220, height: 44, rx: 18, fill: c.coral, stroke: NAVY, 'stroke-width': 7 }),
      h('circle', { cx: -50, cy: -110, r: 20, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 5 }),
      h('path', { d: 'M-50,-110 L-40,-122', stroke: c.coral, 'stroke-width': 4, 'stroke-linecap': 'round' }),
      h('rect', { x: 10, y: -80, width: 70, height: 16, rx: 6, fill: NAVY }),
      h('rect', { x: 30, y: -64, width: 28, height: 26, rx: 4, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 4 }),
      h('path', { d: 'M100,-120 C130,-110 130,-70 118,-50', fill: 'none', stroke: NAVY, 'stroke-width': 6, 'stroke-linecap': 'round' })),
    // blender
    h('g', { id: 'cf-bl' },
      h('rect', { x: -60, y: -60, width: 120, height: 60, rx: 12, fill: NAVY }),
      h('circle', { cx: 0, cy: -30, r: 10, fill: c.amber }),
      h('path', { d: 'M-50,-60 L-62,-230 L62,-230 L50,-60Z', fill: '#E8F6FB', stroke: NAVY, 'stroke-width': 6, opacity: 0.95 }),
      h('path', { id: 'cf-blJuice', d: 'M-54,-120 Q0,-100 54,-120 L50,-62 L-50,-62Z', fill: '#FC9D7B' }),
      h('rect', { x: -70, y: -250, width: 140, height: 24, rx: 8, fill: NAVY })),
    // cups
    ...[0, 1, 2].map((i) => h('path', { d: `M${1180 + i * 40},640 l6,-44 h28 l6,44Z`, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 4 })),
  );

  const table = h('g', { id: 'cf-table', opacity: 0 },
    h('rect', { x: -60, y: 0, width: 26, height: 190, fill: NAVY, transform: 'translate(47 0)' }),
    h('ellipse', { cx: 0, cy: 190, rx: 110, ry: 16, fill: NAVY }),
    h('rect', { x: -280, y: -22, width: 560, height: 30, rx: 14, fill: '#F2E4CF', stroke: NAVY, 'stroke-width': 8 }),
    h('g', { transform: 'translate(150 -22)' },
      h('path', { d: 'M-34,0 L-28,-70 L28,-70 L34,0Z', fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 6, 'stroke-linejoin': 'round' }),
      h('rect', { x: -30, y: -48, width: 60, height: 18, fill: c.teal }),
      h('path', { id: 'cf-steam', d: 'M-8,-82 q-8,-14 0,-26 M10,-82 q-8,-14 0,-26', fill: 'none', stroke: '#B9C9D9', 'stroke-width': 5, 'stroke-linecap': 'round' })));

  const light = h('g', { style: 'mix-blend-mode:screen' },
    ...PENDANTS.map(([x], i) => h('circle', { id: `cf-glow${i}`, cx: x, cy: 160, r: 160, fill: 'url(#cf-glow)', opacity: 0.45 })),
    h('g', { id: 'cf-rays', opacity: 0 }, ...PENDANTS.map(([x]) => h('path', {
      d: Array.from({ length: 12 }, (_, k) => { const a = (k / 12) * Math.PI * 2; return `M${(x + Math.cos(a) * 60).toFixed(0)},${(160 + Math.sin(a) * 60).toFixed(0)} L${(x + Math.cos(a) * 260).toFixed(0)},${(160 + Math.sin(a) * 260).toFixed(0)}`; }).join(' '),
      stroke: '#FFF3C4', 'stroke-width': 16, 'stroke-linecap': 'round' }))),
  );

  return {
    defs, far, mid, table, light,
    mount(root) {
      const $ = (id) => root.querySelector(`#${id}`);
      const E = Object.fromEntries(['cf-esp', 'cf-bl', 'cf-blJuice', 'cf-rays', 'cf-table', 'cf-steam', 'cf-person0', 'cf-person1', 'cf-person2',
        'cf-glow0', 'cf-glow1', 'cf-glow2', 'cf-bulb0', 'cf-bulb1', 'cf-bulb2'].map((n) => [n, $(n)]));
      /** s: { t, light, espresso, talk, blender, tableK } — each 0..1 */
      return (s) => {
        const t = s.t;
        for (let i = 0; i < 3; i++) {
          E[`cf-glow${i}`].setAttribute('r', (160 + s.light * 380 + Math.sin(t * 23 + i) * 30 * s.light).toFixed(1));
          E[`cf-glow${i}`].setAttribute('opacity', (0.45 + 0.5 * s.light).toFixed(3));
          E[`cf-bulb${i}`].setAttribute('r', (18 + 10 * s.light).toFixed(1));
        }
        E['cf-rays'].setAttribute('opacity', (s.light * (0.55 + 0.45 * Math.abs(Math.sin(t * 17)))).toFixed(3));
        const ej = s.espresso * 7, bj = s.blender * 10;
        E['cf-esp'].setAttribute('transform', `${tr(ESPRESSO[0] + fnoise(t * 40, 1) * ej, ESPRESSO[1] + fnoise(t * 40, 2) * ej)}`);
        E['cf-bl'].setAttribute('transform', `${tr(BLENDER[0] + fnoise(t * 50, 3) * bj, BLENDER[1])} ${rot(fnoise(t * 45, 4) * 6 * s.blender)}`);
        E['cf-blJuice'].setAttribute('transform', `translate(0 ${(-s.blender * 60 - Math.abs(Math.sin(t * 30)) * 30 * s.blender).toFixed(1)}) scale(1 ${(1 + s.blender * 1.2).toFixed(3)})`);
        PEOPLE.forEach((p, i) => E[`cf-person${i}`].setAttribute('transform', `${tr(p[0], p[1] - Math.abs(Math.sin(t * (4 + i) + i)) * 8 * s.talk)} ${rot(Math.sin(t * 3 + i) * 3 * s.talk)}`));
        E['cf-table'].setAttribute('opacity', s.tableK > 0 ? 1 : 0);
        E['cf-steam'].setAttribute('transform', tr(0, -((t * 12) % 12)));
        E['cf-steam'].setAttribute('opacity', (0.5 + 0.5 * Math.sin(t * 2)).toFixed(2));
      };
    },
  };
}
