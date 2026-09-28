// The volume knob — the episode's central metaphor. Used small inside the brain and giant in the coffee shop.
// level 0..1 → pointer sweeps 270°. NORMAL sits around 0.3, TOO MUCH at the top of the red zone.

import { h, rot, sc, tr } from '../../engine/svg.js';

const NAVY = '#0B1829';
const A0 = -225, SWEEP = 270;                     // degrees (0° = pointing right, SVG rotation)
const pt = (deg, r) => { const a = (deg * Math.PI) / 180; return [Math.cos(a) * r, Math.sin(a) * r]; };
const arc = (d0, d1, r) => { const [x0, y0] = pt(d0, r), [x1, y1] = pt(d1, r); return `M${x0.toFixed(1)},${y0.toFixed(1)} A${r},${r} 0 ${d1 - d0 > 180 ? 1 : 0} 1 ${x1.toFixed(1)},${y1.toFixed(1)}`; };

export function knobMarkup(id, brand, { labels = true } = {}) {
  const c = brand.colors;
  const ticks = Array.from({ length: 28 }, (_, i) => { const [x0, y0] = pt(i * (360 / 28), 100), [x1, y1] = pt(i * (360 / 28), 112); return `M${x0.toFixed(1)},${y0.toFixed(1)} L${x1.toFixed(1)},${y1.toFixed(1)}`; }).join(' ');
  return h('g', { id, opacity: 0 },
    h('path', { d: arc(A0, A0 + SWEEP * 0.62, 150), fill: 'none', stroke: c.teal, 'stroke-width': 22, 'stroke-linecap': 'round' }),
    h('path', { d: arc(A0 + SWEEP * 0.66, A0 + SWEEP * 0.8, 150), fill: 'none', stroke: c.amber, 'stroke-width': 22, 'stroke-linecap': 'round' }),
    h('path', { d: arc(A0 + SWEEP * 0.84, A0 + SWEEP, 150), fill: 'none', stroke: c.coral, 'stroke-width': 22, 'stroke-linecap': 'round' }),
    h('circle', { id: `${id}-glow`, r: 150, fill: c.coral, opacity: 0, filter: 'url(#blur14)' }),
    h('circle', { r: 118, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 10, filter: 'url(#dropShadow)' }),
    h('path', { d: ticks, stroke: '#C9D3DE', 'stroke-width': 6, 'stroke-linecap': 'round' }),
    h('circle', { r: 82, fill: '#F1F4F8', stroke: NAVY, 'stroke-width': 6 }),
    h('g', { id: `${id}-ptr` },
      h('rect', { x: 20, y: -11, width: 70, height: 22, rx: 11, fill: NAVY }),
      h('circle', { cx: 78, cy: 0, r: 8, fill: c.coral })),
    labels ? h('g', { 'font-family': 'Manrope', 'font-weight': 800, 'font-size': 30, 'letter-spacing': 2 },
      h('text', { x: pt(A0 + SWEEP * 0.3, 205)[0], y: pt(A0 + SWEEP * 0.3, 205)[1] + 8, 'text-anchor': 'end', fill: c.tealDeep }, 'NORMAL'),
      h('text', { x: pt(A0 + SWEEP * 0.95, 200)[0], y: pt(A0 + SWEEP * 0.95, 200)[1] + 60, 'text-anchor': 'middle', fill: c.coral }, 'TOO MUCH')) : '',
  );
}

/** Returns an apply({x, y, scale, level, appear, glow}) bound to the mounted knob. */
export function mountKnob(root, id) {
  const g = root.querySelector(`#${id}`), p = root.querySelector(`#${id}-ptr`), gl = root.querySelector(`#${id}-glow`);
  return (s) => {
    g.setAttribute('opacity', Math.max(0, Math.min(1, s.appear)).toFixed(3));
    g.setAttribute('transform', `${tr(s.x, s.y)} ${sc(s.scale)} ${rot(s.rot ?? 0)}`);
    p.setAttribute('transform', rot(A0 + SWEEP * s.level));
    gl.setAttribute('opacity', (s.glow ?? 0).toFixed(3));
  };
}

/** Pointer-tip offset (knob-local units) for a level — used to put the badge on the pointer while it turns the knob. */
export function pointerTip(level, r = 78) {
  const a = ((A0 + SWEEP * level) * Math.PI) / 180;
  return [Math.cos(a) * r, Math.sin(a) * r];
}
