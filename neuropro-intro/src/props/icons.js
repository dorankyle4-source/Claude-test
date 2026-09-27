// Symptom icons: simple animated visual metaphors in soft badges.
// dizziness = spinning spiral · headache = throbbing bolt · fog = drifting cloud · concentration = wandering focus dot

import { h, tr, rot, sc } from '../engine/svg.js';
import { fnoise, clamp } from '../engine/anim.js';

function spiral(turns = 2.6, r = 24) {
  let d = '';
  for (let i = 0; i <= 90; i++) {
    const k = i / 90, a = k * turns * Math.PI * 2, rr = 2 + k * r;
    d += `${i ? 'L' : 'M'}${(Math.cos(a) * rr).toFixed(2)},${(Math.sin(a) * rr).toFixed(2)} `;
  }
  return d;
}

const GLYPHS = {
  dizziness: (c) => h('g', { id: 'g' },
    h('path', { d: spiral(), fill: 'none', stroke: c.violet, 'stroke-width': 5, 'stroke-linecap': 'round' })),
  headache: (c) => h('g', {},
    h('circle', { id: 'ring', r: 22, fill: 'none', stroke: c.amber, 'stroke-width': 3 }),
    h('path', { id: 'g', d: 'M4,-26 L-12,4 L0,4 L-6,26 L14,-6 L2,-6Z', fill: c.amber, 'stroke-linejoin': 'round' })),
  fog: (c) => h('g', {},
    h('g', { id: 'g' },
      h('path', { d: 'M-24,6 C-34,6 -34,-10 -22,-10 C-22,-24 -2,-28 4,-16 C10,-26 28,-20 26,-6 C36,-4 34,10 24,10 L-22,10Z', fill: '#9DB0C8' })),
    h('path', { id: 'f1', d: 'M-26,20 L20,20', stroke: '#B8C7D9', 'stroke-width': 4.5, 'stroke-linecap': 'round' }),
    h('path', { id: 'f2', d: 'M-14,29 L26,29', stroke: '#CDD8E5', 'stroke-width': 4.5, 'stroke-linecap': 'round' })),
  concentration: (c) => h('g', {},
    h('circle', { r: 24, fill: 'none', stroke: c.coral, 'stroke-width': 3.5, opacity: 0.9 }),
    h('circle', { r: 13, fill: 'none', stroke: c.coral, 'stroke-width': 3.5, opacity: 0.55 }),
    h('path', { d: 'M0,-31 L0,-25 M0,25 L0,31 M-31,0 L-25,0 M25,0 L31,0', stroke: c.coral, 'stroke-width': 3.5, 'stroke-linecap': 'round' }),
    h('circle', { id: 'g', r: 5.5, fill: c.navy })),
};

export function createIcons(brand, list, showLabels = true, prefix = 'ic-') {
  const c = brand.colors;
  const markup = h('g', { id: `${prefix}all` },
    ...list.map((ic) => h('g', { id: `${prefix}${ic.id}`, opacity: 0 },
      h('circle', { r: 50, fill: '#FFFFFF', filter: 'url(#dropShadow)' }),
      h('circle', { r: 50, fill: 'none', stroke: c.navy, 'stroke-width': 1.5, opacity: 0.08 }),
      // namespace the glyph's internal ids per icon
      GLYPHS[ic.id](c).replace(/id="(\w+)"/g, `id="${prefix}${ic.id}-$1"`),
      showLabels ? h('text', {
        y: 82, 'text-anchor': 'middle', 'font-family': 'Inter', 'font-weight': 600, 'font-size': 23,
        fill: c.ink, 'letter-spacing': 0.3, id: `${prefix}${ic.id}-label`,
      }, ic.label) : '',
    )),
  );

  return {
    markup,
    mount(root) {
      const $ = (n) => root.querySelector(`#${prefix}${n}`);
      const els = Object.fromEntries(list.map((ic) => [ic.id, {
        root: $(ic.id), g: $(`${ic.id}-g`), ring: $(`${ic.id}-ring`), f1: $(`${ic.id}-f1`), f2: $(`${ic.id}-f2`), label: $(`${ic.id}-label`),
      }]));
      /** states: { [id]: { x, y, sx, sy, opacity, labelOpacity } }, t */
      return (states, t) => {
        for (const ic of list) {
          const s = states[ic.id], e = els[ic.id];
          e.root.setAttribute('transform', `${tr(s.x, s.y)} ${sc(s.sx, s.sy)}`);
          e.root.setAttribute('opacity', clamp(s.opacity).toFixed(3));
          if (e.label) e.label.setAttribute('opacity', clamp(s.labelOpacity ?? s.opacity).toFixed(3));
          if (s.opacity <= 0) continue;
          if (ic.id === 'dizziness') e.g.setAttribute('transform', rot(t * 260));
          if (ic.id === 'headache') {
            const th = (t * 2.2) % 1;
            e.g.setAttribute('transform', sc(1 + Math.max(0, Math.sin(t * 13.8)) * 0.12));
            e.ring.setAttribute('transform', sc(1 + th * 0.8));
            e.ring.setAttribute('opacity', (1 - th).toFixed(3));
          }
          if (ic.id === 'fog') {
            e.g.setAttribute('transform', tr(Math.sin(t * 2.1) * 5, 0));
            e.f1.setAttribute('transform', tr(Math.sin(t * 2.6 + 1) * 6, 0));
            e.f2.setAttribute('transform', tr(Math.sin(t * 2.3 + 2.4) * 7, 0));
          }
          if (ic.id === 'concentration') e.g.setAttribute('transform', tr(fnoise(t * 1.6, 5) * 20, fnoise(t * 1.6, 9) * 20));
        }
      };
    },
  };
}
