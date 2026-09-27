// Tiny SVG string builder + a per-frame "setter" that caches element lookups.

export const NS = 'http://www.w3.org/2000/svg';

const attrs = (a = {}) =>
  Object.entries(a)
    .filter(([, v]) => v !== undefined && v !== null && v !== false)
    .map(([k, v]) => `${k}="${String(v).replace(/"/g, '&quot;')}"`)
    .join(' ');

/** h('g', {id:'x'}, child1, child2...) → markup string */
export function h(tag, a, ...children) {
  const inner = children.flat(Infinity).filter(Boolean).join('');
  return `<${tag} ${attrs(a)}>${inner}</${tag}>`;
}

/** Transform string helpers. */
export const tr = (x, y) => `translate(${x.toFixed(2)} ${y.toFixed(2)})`;
export const rot = (d, x = 0, y = 0) => `rotate(${d.toFixed(3)} ${x.toFixed(2)} ${y.toFixed(2)})`;
export const sc = (sx, sy = sx) => `scale(${sx.toFixed(4)} ${sy.toFixed(4)})`;

/**
 * Binds to a mounted root and provides fast attribute setters by element id.
 * Ids are namespaced with a prefix so multiple rigs can coexist.
 */
export class Rig {
  constructor(root, prefix) {
    this.root = root;
    this.prefix = prefix;
    this.cache = new Map();
  }
  el(id) {
    let e = this.cache.get(id);
    if (!e) {
      e = this.root.querySelector(`#${this.prefix}${id}`);
      if (!e) throw new Error(`Rig element not found: ${this.prefix}${id}`);
      this.cache.set(id, e);
    }
    return e;
  }
  set(id, name, value) {
    this.el(id).setAttribute(name, value);
    return this;
  }
  t(id, value) { return this.set(id, 'transform', value); }
  o(id, value) { return this.set(id, 'opacity', Math.max(0, Math.min(1, value)).toFixed(3)); }
  d(id, value) { return this.set(id, 'd', value); }
}

/** Mouth shape from expression params (local coords centred on the mouth). */
export function mouthPath(w, smile, open) {
  const cy = -smile * 5;                    // corners lift with smile
  const top = -open * 3 + smile * 2.5;      // upper lip control
  const bot = open * 22 + Math.max(0, smile) * 11 + 2; // lower lip control
  return `M${-w},${cy.toFixed(2)} Q0,${top.toFixed(2)} ${w},${cy.toFixed(2)} Q0,${bot.toFixed(2)} ${-w},${cy.toFixed(2)}Z`;
}
