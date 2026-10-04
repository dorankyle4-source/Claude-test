// Roast-night look: black and velvet red, gold marquee, cream type. Oswald for the punchlines, Public Sans for set-ups.
import { h } from '../../engine/svg.js';
export { makeKit, stroke, riseK, g } from '../adp/kit.js';
import { g } from '../adp/kit.js';

export const W = 1920, H = 1080;
export const C = {
  black: '#0D0506', stage: '#1A0709', velvet: '#5E0D14', velvet2: '#7E1420', card: '#23090C', line: '#4A1A1F',
  gold: '#E2B25A', goldHi: '#F6D58A', goldDeep: '#A87A2C', cream: '#F7EDE0', mute: '#C9B8A6', red: '#E0322F', green: '#3FA36B', paper: '#FBF6EC', ink: '#1D1213',
};
export const DISPLAY = 'Oswald, sans-serif';
export const BODY = "'Public Sans', sans-serif";
export const SERIF = "'Source Serif 4', Georgia, serif";

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function txt(str, { x = 0, y = 0, size = 28, weight = 500, fill = C.cream, family = BODY, anchor = 'start', ls = 0, id, opacity } = {}) {
  return h('text', { id, x, y, 'font-family': family, 'font-size': size, 'font-weight': weight, fill, 'text-anchor': anchor, 'letter-spacing': ls || undefined, opacity }, esc(str));
}

/** Greedy word wrap by character budget. */
export function wrap(text, max) {
  const out = []; let cur = '';
  for (const w of text.split(' ')) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > max && cur) { out.push(cur); cur = w; } else cur = next;
  }
  if (cur) out.push(cur);
  return out;
}
/** Multi-line text block, first baseline at y. */
export function block(lines, { x = 0, y = 0, size, lh = 1.12, ...rest }) {
  return lines.map((l, i) => txt(l, { x, y: y + i * size * lh, size, ...rest })).join('');
}

/** Gold monogram medallion centred on (0,0). */
export const monogram = (initials, r = 118) => [
  h('circle', { r: r + 14, fill: 'none', stroke: C.goldDeep, 'stroke-width': 3, 'stroke-dasharray': '2 10', 'stroke-linecap': 'round' }),
  h('circle', { r, fill: C.velvet, stroke: C.gold, 'stroke-width': 8 }),
  txt(initials, { y: r * 0.33, size: r * 0.95, weight: 700, family: DISPLAY, fill: C.cream, anchor: 'middle', ls: 2 }),
].join('');

/** A rubber stamp, centred on (0,0). */
export const stampMark = (label, color, w = 520) => h('g', {},
  h('rect', { x: -w / 2, y: -58, width: w, height: 116, rx: 10, fill: 'none', stroke: color, 'stroke-width': 8 }),
  h('rect', { x: -w / 2 + 12, y: -46, width: w - 24, height: 92, rx: 6, fill: 'none', stroke: color, 'stroke-width': 2 }),
  txt(label, { y: 22, size: 60, weight: 700, family: DISPLAY, fill: color, anchor: 'middle', ls: 3 }));
