// Shared look + per-frame helpers for the ADP recap. Palette and type match the ADP case deck.
import { h } from '../../engine/svg.js';
import { clamp, prog, outCubic, popScale } from '../../engine/anim.js';

export const W = 1920, H = 1080;
export const C = {
  cream: '#F6F4EF', cream2: '#EDE9E0', card: '#FDFCFA', line: '#E2DED5', track: '#DDD7CB',
  navy: '#1B2230', navy2: '#2A3346', red: '#B01E26', pink: '#E8A09A', blush: '#F4DCDB',
  grey: '#8A93A3', ink2: '#414A5A', muted: '#6B7280', light: '#C9CED8', dim: '#9AA3B2', paper: '#F3F1EC',
};
export const SERIF = "'Source Serif 4', Georgia, serif";
export const SANS = "'Public Sans', Arial, sans-serif";

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** <text> with deck typography. */
export function txt(str, { x = 0, y = 0, size = 28, weight = 400, fill = C.navy, family = SANS, anchor = 'start', ls = 0, id, italic } = {}) {
  return h('text', {
    id, x, y, 'font-family': family, 'font-size': size, 'font-weight': weight, fill, 'text-anchor': anchor,
    'letter-spacing': ls || undefined, 'font-style': italic ? 'italic' : undefined,
  }, esc(str));
}
export const g = (id, ...kids) => h('g', { id, opacity: 0 }, ...kids);

/** Eyebrow + serif heading, the deck's slide header. */
export const header = (id, eyebrow, title, dark) => [
  g(`${id}-eye`, txt(eyebrow, { size: 26, weight: 700, fill: dark ? C.pink : C.red, ls: 3 })),
  g(`${id}-head`, txt(title, { size: 66, weight: 600, family: SERIF, fill: dark ? C.paper : C.navy })),
];

/** A seller: head + shoulders, feet at (0,0). */
export const figure = (id, fill) => h('g', { id, opacity: 0 },
  h('circle', { cx: 0, cy: -62, r: 17, fill }),
  h('path', { d: 'M-27,0 L-27,-16 Q-27,-40 0,-40 Q27,-40 27,-16 L27,0 Z', fill }));

/** A stroke that draws on with stroke-dashoffset (pathLength = 1). */
export const stroke = (id, d, s, w, extra = {}) =>
  h('path', { id, d, fill: 'none', stroke: s, 'stroke-width': w, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '1 1', 'stroke-dashoffset': 1, ...extra });

export const riseK = (t, at, d = 0.6) => outCubic(prog(t, at, at + d));

export function makeKit(svg) {
  const cache = new Map();
  const el = (id) => {
    let e = cache.get(id);
    if (!e) {
      e = svg.querySelector(`#${id}`);
      if (!e) throw new Error(`missing #${id}`);
      cache.set(id, e);
    }
    return e;
  };
  const attr = (id, k, v) => el(id).setAttribute(k, v);
  const put = (id, x, y, o = 1, sx = 1, sy = sx, r = 0) => {
    const e = el(id), op = clamp(o);
    e.setAttribute('transform', `translate(${x.toFixed(2)} ${y.toFixed(2)})${r ? ` rotate(${r.toFixed(2)})` : ''} scale(${sx.toFixed(4)} ${sy.toFixed(4)})`);
    e.setAttribute('opacity', op.toFixed(3));
    e.setAttribute('visibility', op > 0.002 ? 'visible' : 'hidden');
  };
  /** Fade + rise into place. `o` multiplies opacity, `oy` adds an offset (used for exits). */
  const rise = (id, x, y, t, at, { d = 0.6, dist = 40, o = 1, oy = 0 } = {}) => {
    const k = riseK(t, at, d);
    put(id, x, y + (1 - k) * dist + oy, k * o);
  };
  /** Squash-and-stretch pop about the element's origin. */
  const pop = (id, x, y, t, at, { d = 0.5, amount = 0.18, o = 1, oy = 0 } = {}) => {
    const p = popScale(t, at, d, amount);
    put(id, x, y + oy, (p.k > 0 ? Math.min(1, p.k * 4) : 0) * o, Math.max(0, p.sx), Math.max(0, p.sy));
  };
  /** Draw a stroke() path to k ∈ [0,1]. */
  const draw = (id, k) => {
    attr(id, 'stroke-dashoffset', (1 - clamp(k)).toFixed(4));
    attr(id, 'visibility', k > 0.002 ? 'visible' : 'hidden');
  };
  const text = (id, s) => { const e = el(id); if (e.textContent !== s) e.textContent = s; };
  return { el, attr, put, rise, pop, draw, text };
}
