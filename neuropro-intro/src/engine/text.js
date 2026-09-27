// Measures text with the real (loaded) font so words/letters can be animated independently.
import { NS } from './svg.js';

/** Returns [{ str, x, w }] for each piece, laid out as one run starting at x=0. */
export function measureRun(svg, pieces, attrs, gap = 0) {
  const t = document.createElementNS(NS, 'text');
  for (const [k, v] of Object.entries(attrs)) t.setAttribute(k, v);
  svg.appendChild(t);
  let x = 0;
  const out = pieces.map((str) => {
    t.textContent = str;
    const w = t.getComputedTextLength();
    const r = { str, x, w };
    x += w + gap;
    return r;
  });
  t.remove();
  return { items: out, width: x - gap };
}

/** Build <text> nodes for each measured piece inside a parent <g>. */
export function placeRun(parent, run, attrs, idPrefix) {
  run.items.forEach((it, i) => {
    const g = document.createElementNS(NS, 'g');
    g.setAttribute('id', `${idPrefix}${i}`);
    const t = document.createElementNS(NS, 'text');
    for (const [k, v] of Object.entries(attrs)) t.setAttribute(k, v);
    t.setAttribute('x', it.x.toFixed(2));
    t.textContent = it.str;
    g.appendChild(t);
    parent.appendChild(g);
  });
}
