// Episode 3 world props, drawn in the series style (navy outlines, NeuroPro palette):
// desk + chair (so the Brain can sit), the "What did I just read?" paper, a laptop, and the brain-fog cloud.

import { h, tr, rot, sc } from '../../engine/svg.js';
import { clamp, fnoise } from '../../engine/anim.js';

const NAVY = '#0B1829';
export const DESK = { x0: 470, x1: 1150, top: 830 };

export function createProps(brand) {
  const c = brand.colors;
  const line = (w, y, col = '#B9C9D9') => h('rect', { x: -110, y, width: w, height: 12, rx: 6, fill: col });

  // fog puffs around the head (angles on an ellipse, mostly the upper part)
  const puffs = [];
  const NP = 14;
  for (let i = 0; i < NP; i++) {
    const r = 70 + ((i * 37) % 30);
    puffs.push(h('g', { id: `fog-p${i}` },
      h('circle', { r, fill: '#D3D7EA' }),
      h('circle', { cx: -r * 0.25, cy: -r * 0.3, r: r * 0.55, fill: '#ECEEF7' })));
  }

  const back = h('g', { id: 'pr-back' },
    // chair back (behind the Brain)
    h('g', { id: 'pr-chair' },
      h('rect', { x: -250, y: -300, width: 500, height: 330, rx: 70, fill: c.teal, stroke: NAVY, 'stroke-width': 8 }),
      h('rect', { x: -210, y: -262, width: 420, height: 60, rx: 30, fill: '#FFFFFF', opacity: 0.25 })));

  const front = h('g', { id: 'pr-front' },
    // desk (hides the legs, so the Brain reads as seated)
    h('g', { id: 'pr-desk' },
      h('rect', { x: DESK.x0 - 10, y: DESK.top + 26, width: DESK.x1 - DESK.x0 + 20, height: 320, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 8 }),
      h('rect', { x: DESK.x0 + 30, y: DESK.top + 60, width: DESK.x1 - DESK.x0 - 60, height: 110, rx: 12, fill: 'none', stroke: '#D5DDE6', 'stroke-width': 5 }),
      h('circle', { cx: (DESK.x0 + DESK.x1) / 2, cy: DESK.top + 115, r: 9, fill: NAVY }),
      h('rect', { x: DESK.x0 - 40, y: DESK.top, width: DESK.x1 - DESK.x0 + 80, height: 34, rx: 12, fill: '#F2E4CF', stroke: NAVY, 'stroke-width': 8 }),
      // a mug + pencil cup for life
      h('g', { transform: `translate(${DESK.x0 + 40} ${DESK.top})` },
        h('rect', { x: -24, y: -62, width: 48, height: 62, rx: 10, fill: c.coral, stroke: NAVY, 'stroke-width': 6 }),
        h('path', { d: 'M24,-48 q22,4 0,28', fill: 'none', stroke: NAVY, 'stroke-width': 6 }))),
    // laptop (back of the lid faces us)
    h('g', { id: 'pr-laptop', opacity: 0 },
      h('path', { d: 'M-120,0 L120,0 L108,-150 Q106,-162 94,-162 L-94,-162 Q-106,-162 -108,-150Z', fill: '#C9D3DE', stroke: NAVY, 'stroke-width': 7, 'stroke-linejoin': 'round' }),
      h('circle', { cx: 0, cy: -82, r: 16, fill: '#FFFFFF', opacity: 0.8 }),
      h('rect', { x: -140, y: -6, width: 280, height: 14, rx: 7, fill: '#AEB9C6', stroke: NAVY, 'stroke-width': 6 })),
    // paper held up in the hook
    h('g', { id: 'pr-paper', opacity: 0 },
      h('rect', { x: -140, y: -180, width: 280, height: 360, rx: 14, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 7 }),
      h('text', { x: 0, y: -118, 'text-anchor': 'middle', 'font-family': 'Manrope', 'font-weight': 800, 'font-size': 30, fill: NAVY }, 'What did I'),
      h('text', { x: 0, y: -80, 'text-anchor': 'middle', 'font-family': 'Manrope', 'font-weight': 800, 'font-size': 30, fill: NAVY }, 'just read?'),
      h('g', { id: 'pr-lines' }, line(220, -40), line(190, -10), line(210, 20), line(160, 50), line(200, 80), line(120, 110)),
      h('rect', { id: 'pr-scan', x: -118, y: -46, width: 236, height: 24, rx: 8, fill: c.amber, opacity: 0 })),
    // brain fog cloud
    h('g', { id: 'pr-fog', opacity: 0 },
      h('ellipse', { id: 'fog-ring', rx: 320, ry: 240, fill: 'none', stroke: '#D3D7EA', 'stroke-width': 110, opacity: 0.8, filter: 'url(#blur14)' }),
      h('g', { filter: 'url(#blur3)', opacity: 0.92 }, ...puffs)),
  );

  return {
    back, front,
    mount(root) {
      const $ = (id) => root.querySelector(`#${id}`);
      const E = Object.fromEntries(['pr-back', 'pr-front', 'pr-desk', 'pr-chair', 'pr-laptop', 'pr-paper', 'pr-scan', 'pr-fog', 'fog-ring'].map((n) => [n, $(n)]));
      const P = puffs.map((_, i) => $(`fog-p${i}`));
      /** s: { t, desk (0/1), chairX, paper:{x,y,rot,op}, scanY, scanOp, laptop, fog:{x,y,amt,swirl} } */
      return (s) => {
        E['pr-desk'].setAttribute('opacity', s.desk);
        E['pr-chair'].setAttribute('opacity', s.desk);
        E['pr-chair'].setAttribute('transform', tr(s.chairX, 890));
        E['pr-laptop'].setAttribute('opacity', clamp(s.laptop));
        E['pr-laptop'].setAttribute('transform', `translate(1060 ${DESK.top}) ${sc(0.8 + 0.2 * clamp(s.laptop))}`);
        const p = s.paper;
        E['pr-paper'].setAttribute('opacity', clamp(p.op));
        E['pr-paper'].setAttribute('transform', `translate(${p.x} ${p.y}) ${rot(p.rot)} ${sc(p.s ?? 1)}`);
        E['pr-scan'].setAttribute('y', (s.scanY - 6).toFixed(1));
        E['pr-scan'].setAttribute('opacity', clamp(s.scanOp) * 0.35);
        const f = s.fog;
        E['pr-fog'].setAttribute('opacity', clamp(f.amt).toFixed(3));
        E['fog-ring'].setAttribute('transform', `translate(${f.x} ${f.y}) scale(${(0.7 + 0.3 * clamp(f.amt)).toFixed(3)})`);
        P.forEach((el, i) => {
          const a = (i / P.length) * Math.PI * 2 + f.swirl * 0.12 + Math.sin(s.t * 0.7 + i) * 0.04;
          const rx = 320 + fnoise(s.t * 0.5, i) * 18, ry = 240 + fnoise(s.t * 0.5, i + 9) * 14;
          const k = clamp(f.amt * 1.4 - (i % 5) * 0.08);
          el.setAttribute('transform', `translate(${(f.x + Math.cos(a) * rx).toFixed(1)} ${(f.y + Math.sin(a) * ry).toFixed(1)}) ${sc(0.4 + 0.6 * k)}`);
        });
      };
    },
  };
}
