// The recurring "NeuroPro studio" set: a bright, modern clinic lounge with a big window.
// Split into parallax layers (far / mid / foreground / light) so the camera move has real depth.
// Everything is drawn in world space (1920×1080 frame, with bleed for camera moves).

import { h, tr, rot } from '../engine/svg.js';
import { fnoise } from '../engine/anim.js';
import { MARK_BRAIN, MARK_PULSE } from '../props/logo.js';

export function createStudio(brand) {
  const c = brand.colors;

  const defs = h('defs', {},
    h('linearGradient', { id: 'wallGrad', x1: 0, y1: 0, x2: 0, y2: 1 },
      h('stop', { offset: 0, 'stop-color': '#E2ECF3' }), h('stop', { offset: 0.75, 'stop-color': '#F3ECE3' })),
    h('linearGradient', { id: 'floorGrad', x1: 0, y1: 0, x2: 0, y2: 1 },
      h('stop', { offset: 0, 'stop-color': '#D8C3A7' }), h('stop', { offset: 1, 'stop-color': '#C5A887' })),
    h('linearGradient', { id: 'skyGrad', x1: 0, y1: 0, x2: 0, y2: 1 },
      h('stop', { offset: 0, 'stop-color': '#8CCBF0' }), h('stop', { offset: 0.7, 'stop-color': '#CFEAF7' }), h('stop', { offset: 1, 'stop-color': '#F4E9D8' })),
    h('radialGradient', { id: 'sunGlow' },
      h('stop', { offset: 0, 'stop-color': '#FFF6DE', 'stop-opacity': 1 }), h('stop', { offset: 1, 'stop-color': '#FFF6DE', 'stop-opacity': 0 })),
    h('linearGradient', { id: 'shaftGrad', x1: 0, y1: 0, x2: 1, y2: 1 },
      h('stop', { offset: 0, 'stop-color': '#FFF4D8', 'stop-opacity': 0.55 }), h('stop', { offset: 1, 'stop-color': '#FFF4D8', 'stop-opacity': 0 })),
    h('radialGradient', { id: 'rugGrad', cx: 0.5, cy: 0.45, r: 0.6 },
      h('stop', { offset: 0, 'stop-color': '#BFE3DD' }), h('stop', { offset: 1, 'stop-color': '#A5D5CD' })),
    h('radialGradient', { id: 'wallSpot', cx: 0.5, cy: 0.5, r: 0.5 },
      h('stop', { offset: 0, 'stop-color': '#FFFFFF', 'stop-opacity': 0.75 }), h('stop', { offset: 1, 'stop-color': '#FFFFFF', 'stop-opacity': 0 })),
    h('linearGradient', { id: 'slatShade', x1: 0, y1: 0, x2: 1, y2: 0 },
      h('stop', { offset: 0, 'stop-color': '#FFFFFF', 'stop-opacity': 0.35 }), h('stop', { offset: 1, 'stop-color': '#0B2545', 'stop-opacity': 0.08 })),
    h('filter', { id: 'shaftBlur', x: '-20%', y: '-20%', width: '140%', height: '140%' }, h('feGaussianBlur', { stdDeviation: 40 })),
    h('clipPath', { id: 'windowClip' }, h('rect', { x: 130, y: 120, width: 560, height: 610, rx: 26 })),
  );

  const leaf = (x, y, len, ang, col, w = 0.42) =>
    h('path', { d: `M0,0 C${len * w},${-len * 0.25} ${len * 0.8},${-len * 0.12} ${len},0 C${len * 0.8},${len * 0.12} ${len * w},${len * 0.25} 0,0Z`, fill: col, transform: `${tr(x, y)} ${rot(ang)}` });

  // ---------- FAR: wall, window, outside world, wall decor ----------
  const far = h('g', {},
    h('rect', { x: -400, y: -300, width: 2800, height: 1110, fill: 'url(#wallGrad)' }),
    // soft light pool on wall behind the action
    h('ellipse', { cx: 1000, cy: 430, rx: 620, ry: 380, fill: 'url(#wallSpot)' }),
    // oak slat accent wall (right)
    h('rect', { x: 1262, y: -300, width: 1200, height: 1090, fill: '#EADCC6' }),
    h('path', { d: Array.from({ length: 46 }, (_, i) => `M${1262 + 13 + i * 26},-300 L${1262 + 13 + i * 26},790`).join(' '), stroke: '#D9C6AA', 'stroke-width': 6 }),
    h('rect', { x: 1262, y: -300, width: 1200, height: 1090, fill: 'url(#slatShade)' }),
    h('rect', { x: 1256, y: -300, width: 8, height: 1090, fill: '#0B2545', opacity: 0.06 }),
    // window: outside world
    h('g', { 'clip-path': 'url(#windowClip)' },
      h('rect', { x: 120, y: 110, width: 580, height: 630, fill: 'url(#skyGrad)' }),
      h('circle', { cx: 250, cy: 230, r: 230, fill: 'url(#sunGlow)' }),
      h('g', { id: 'clouds' },
        ...[[220, 250, 1], [520, 190, 0.8], [420, 330, 0.6], [760, 280, 0.9]].map(([x, y, s]) =>
          h('g', { transform: `${tr(x, y)} scale(${s})`, opacity: 0.9 },
            h('ellipse', { cx: 0, cy: 0, rx: 70, ry: 22, fill: '#fff' }),
            h('ellipse', { cx: -25, cy: -14, rx: 34, ry: 24, fill: '#fff' }),
            h('ellipse', { cx: 20, cy: -20, rx: 40, ry: 30, fill: '#fff' }))),
      ),
      // distant city + trees + a training field — a nod to the athlete world
      h('path', { d: 'M120,560 L170,560 L170,500 L205,500 L205,530 L250,530 L250,470 L280,470 L280,540 L330,540 L330,510 L380,510 L380,560 L470,560 L470,490 L500,490 L500,452 L530,452 L530,560 L600,560 L600,520 L650,520 L650,560 L700,560 L700,740 L120,740Z', fill: '#C4D9EA' }),
      h('path', { d: 'M120,600 C220,560 330,590 420,575 C520,560 620,585 700,570 L700,740 L120,740Z', fill: '#A9D6BE' }),
      h('path', { d: 'M120,640 C260,615 420,630 700,612 L700,740 L120,740Z', fill: '#8FCBA9' }),
      h('path', { d: 'M180,690 L640,690 M410,650 L410,740', stroke: '#fff', 'stroke-width': 3, opacity: 0.55 }),
      h('path', { d: 'M232,655 L232,618 L282,618 L282,655', stroke: '#fff', 'stroke-width': 4, fill: 'none', opacity: 0.7 }),
      ...[[160, 606], [600, 596], [660, 604]].map(([x, y]) => h('g', {},
        h('rect', { x: x - 3, y, width: 6, height: 24, fill: '#6E9A7F' }),
        h('circle', { cx: x, cy: y - 6, r: 20, fill: '#79B893' }))),
    ),
    // window frame
    h('rect', { x: 130, y: 120, width: 560, height: 610, rx: 26, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 20 }),
    h('path', { d: 'M410,120 L410,730 M130,330 L690,330', stroke: '#FFFFFF', 'stroke-width': 12 }),
    h('rect', { x: 110, y: 728, width: 600, height: 22, rx: 8, fill: '#FFFFFF' }),
    h('rect', { x: 110, y: 746, width: 600, height: 10, rx: 5, fill: '#0B2545', opacity: 0.06 }),
    // wall art — the NeuroPro mark as a framed print
    h('g', { transform: 'translate(1560 190)' },
      h('rect', { x: 0, y: 0, width: 230, height: 290, rx: 10, fill: '#FFFFFF' }),
      h('rect', { x: 16, y: 16, width: 198, height: 258, rx: 4, fill: '#0F2B4C' }),
      h('g', { transform: 'translate(115 122) scale(0.62)' },
        h('circle', { r: 92, fill: 'none', stroke: c.teal, 'stroke-width': 5 }),
        h('path', { d: MARK_BRAIN, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 5.5, 'stroke-linejoin': 'round' }),
        h('path', { d: MARK_PULSE, fill: 'none', stroke: c.cyan, 'stroke-width': 5.5, 'stroke-linejoin': 'round', 'stroke-linecap': 'round' })),
      h('rect', { x: 62, y: 222, width: 106, height: 7, rx: 3.5, fill: c.teal, opacity: 0.8 }),
      h('rect', { x: 80, y: 238, width: 70, height: 5, rx: 2.5, fill: '#8FA7C4', opacity: 0.6 }),
    ),
    // floating shelf
    h('g', { transform: 'translate(1520 600)' },
      h('rect', { x: 0, y: 0, width: 330, height: 16, rx: 5, fill: '#FFFFFF' }),
      h('rect', { x: 0, y: 14, width: 330, height: 8, rx: 4, fill: '#0B2545', opacity: 0.07 }),
      h('rect', { x: 26, y: -86, width: 22, height: 86, rx: 3, fill: '#1B3A63' }),
      h('rect', { x: 50, y: -74, width: 18, height: 74, rx: 3, fill: c.teal }),
      h('rect', { x: 70, y: -92, width: 24, height: 92, rx: 3, fill: '#F2C37A' }),
      h('rect', { x: 100, y: -60, width: 18, height: 60, rx: 3, fill: '#FF8C6E', transform: 'rotate(-14 118 0)' }),
      // a ball — sports nod
      h('circle', { cx: 212, cy: -34, r: 34, fill: '#FFFFFF' }),
      h('path', { d: 'M180,-44 Q212,-20 244,-44 M186,-14 Q212,-40 238,-14', stroke: c.coral, 'stroke-width': 3.5, fill: 'none', opacity: 0.8 }),
      h('path', { d: 'M284,0 L280,-40 L310,-40 L306,0Z', fill: '#E7DCCD' }),
      h('g', { id: 'shelfPlant' }, leaf(295, -40, 38, -120, '#5DAE86'), leaf(295, -40, 44, -70, '#4F9E78'), leaf(295, -40, 34, -30, '#6CBF95')),
    ),
    // baseboard + floor
    h('rect', { x: -400, y: 790, width: 2800, height: 400, fill: 'url(#floorGrad)' }),
    h('rect', { x: -400, y: 782, width: 2800, height: 16, fill: '#FFFFFF' }),
    h('rect', { x: -400, y: 797, width: 2800, height: 10, fill: '#0B2545', opacity: 0.06 }),
  );

  // ---------- MID: floor details, rug, big plant ----------
  const plantLeaves = [];
  const leafCols = ['#3F9470', '#4FA67E', '#5DB68B', '#3A8666'];
  for (let i = 0; i < 11; i++) {
    const ang = -165 + i * 15 + (i % 2 ? 6 : -4);
    plantLeaves.push(h('g', { id: `leaf${i}`, class: 'sway' }, leaf(0, 0, 150 + (i % 3) * 36, ang, leafCols[i % 4], 0.38)));
  }
  const mid = h('g', {},
    ...[0, 1, 2, 3].map((i) => h('path', { d: `M-400,${838 + i * i * 34} L2400,${838 + i * i * 34}`, stroke: '#B8997A', 'stroke-width': 2, opacity: 0.25 })),
    h('ellipse', { cx: 1040, cy: 1030, rx: 700, ry: 92, fill: 'url(#rugGrad)' }),
    h('ellipse', { cx: 1040, cy: 1030, rx: 650, ry: 74, fill: 'none', stroke: '#fff', 'stroke-width': 3, opacity: 0.45 }),
    // tall plant by the window
    h('g', { transform: 'translate(330 850)' },
      h('ellipse', { cx: 0, cy: 118, rx: 96, ry: 14, fill: '#0B2545', opacity: 0.12, filter: 'url(#softBlur)' }),
      h('g', { id: 'bigPlant', transform: 'translate(0 -10)' }, ...plantLeaves),
      h('path', { d: 'M-70,-10 L70,-10 L56,116 Q54,124 44,124 L-44,124 Q-54,124 -56,116Z', fill: '#FFFFFF' }),
      h('path', { d: 'M40,-10 L70,-10 L56,116 Q54,124 44,124 L30,124Z', fill: '#E6EDF3' }),
      h('rect', { x: -74, y: -18, width: 148, height: 16, rx: 6, fill: '#F2F5F8' }),
    ),
  );

  // ---------- FOREGROUND: out-of-focus leaves for depth ----------
  const fg = h('g', { filter: 'url(#blur14)', opacity: 0.95 },
    h('g', { id: 'fgLeaves', transform: 'translate(-60 1130)' },
      leaf(0, 0, 330, -58, '#2F7A5B', 0.35), leaf(20, 0, 280, -32, '#3A8B69', 0.35), leaf(-10, 0, 300, -80, '#276B4F', 0.35)),
    h('g', { id: 'fgLeavesR', transform: 'translate(2010 1150)' },
      leaf(0, 0, 260, -140, '#2F7A5B', 0.35), leaf(0, 0, 220, -115, '#3A8B69', 0.35)),
  );

  // ---------- LIGHT: sun shafts + dust motes ----------
  const motes = [];
  for (let i = 0; i < 26; i++) motes.push(h('circle', { id: `mote${i}`, r: 1.6 + (i % 4) * 0.9, fill: '#FFF8E6' }));
  const light = h('g', { style: 'mix-blend-mode:screen' },
    h('g', { id: 'shafts', filter: 'url(#shaftBlur)' },
      h('path', { d: 'M150,130 L420,130 L1320,1080 L760,1080Z', fill: 'url(#shaftGrad)', opacity: 0.4 }),
      h('path', { d: 'M430,130 L690,130 L1680,1080 L1360,1080Z', fill: 'url(#shaftGrad)', opacity: 0.28 }),
    ),
    h('g', { id: 'motes' }, ...motes),
  );

  return {
    defs, far, mid, fg, light,
    update(t, root) {
      const $ = (id) => root.querySelector(`#${id}`);
      $('clouds').setAttribute('transform', tr(-t * 7, 0));
      for (let i = 0; i < 11; i++) {
        const sway = fnoise(t * 0.45 + i * 0.37, i) * 2.6 + Math.sin(t * 1.1 + i) * 0.8;
        $(`leaf${i}`).setAttribute('transform', rot(sway));
      }
      $('shelfPlant').setAttribute('transform', rot(Math.sin(t * 0.9) * 1.2, 295, -40));
      $('fgLeaves').setAttribute('transform', `${tr(-60, 1130)} ${rot(Math.sin(t * 0.6) * 1.5)}`);
      $('fgLeavesR').setAttribute('transform', `${tr(2010, 1150)} ${rot(Math.sin(t * 0.5 + 1) * 1.5)}`);
      $('shafts').setAttribute('opacity', (0.85 + fnoise(t * 0.6, 3) * 0.15).toFixed(3));
      for (let i = 0; i < 26; i++) {
        const u = (i * 0.137) % 1, v = (i * 0.291) % 1;
        const x = 300 + u * 1100 + Math.sin(t * 0.35 + i) * 30 + t * 6;
        const y = 180 + v * 820 - t * (6 + (i % 5) * 2) + fnoise(t * 0.4, i) * 20;
        const m = $(`mote${i}`);
        m.setAttribute('cx', x.toFixed(1));
        m.setAttribute('cy', y.toFixed(1));
        m.setAttribute('opacity', (0.35 + 0.35 * Math.sin(t * 1.3 + i * 1.7)).toFixed(2));
      }
    },
  };
}
