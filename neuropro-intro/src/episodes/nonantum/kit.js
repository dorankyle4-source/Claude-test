// Nonantum look: navy, ivory and muted gold with a serif display face — a restrained private-equity register.
// The wordmark is a typographic stand-in (the firm's logo file was not reachable from this environment).
import { h } from '../../engine/svg.js';
export { makeKit, stroke, riseK, g } from '../adp/kit.js';
import { g } from '../adp/kit.js';

export const W = 1920, H = 1080;
export const C = {
  navy: '#13223A', navy2: '#1A2D4A', card: '#213656', line: '#33476A',
  ivory: '#F6F3EC', ivory2: '#EDE7DB', cardL: '#FFFFFF', lineL: '#E0D9CC', trackL: '#E6E0D4',
  gold: '#C29B62', goldDeep: '#8A6630', slate: '#5B6B82', mute: '#A9B3C2', muteL: '#6B7280', ink: '#13223A', ink2: '#3F4A5C',
  consumer: '#C29B62', industrials: '#6E8FB8', services: '#86A890',
};
export const SERIF = "'Source Serif 4', Georgia, serif";
export const SANS = "'Public Sans', Arial, sans-serif";

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function txt(str, { x = 0, y = 0, size = 28, weight = 400, fill = C.ivory, family = SANS, anchor = 'start', ls = 0, id, italic } = {}) {
  return h('text', { id, x, y, 'font-family': family, 'font-size': size, 'font-weight': weight, fill, 'text-anchor': anchor, 'letter-spacing': ls || undefined, 'font-style': italic ? 'italic' : undefined }, esc(str));
}
export const header = (id, eyebrow, title, light) => [
  g(`${id}-eye`, txt(eyebrow, { size: 24, weight: 700, fill: light ? C.goldDeep : C.gold, ls: 4 })),
  g(`${id}-head`, txt(title, { size: 68, weight: 600, family: SERIF, fill: light ? C.ink : C.ivory })),
];
/** Typographic wordmark, centred on (0,0). */
export const wordmark = (id, light, scale = 1) => g(id, h('g', { transform: `scale(${scale})` },
  txt('NONANTUM', { y: 0, size: 84, weight: 600, family: SERIF, fill: light ? C.ink : C.ivory, anchor: 'middle', ls: 22 }),
  h('line', { x1: -300, x2: -40, y1: 46, y2: 46, stroke: C.gold, 'stroke-width': 2 }),
  h('line', { x1: 40, x2: 300, y1: 46, y2: 46, stroke: C.gold, 'stroke-width': 2 }),
  h('circle', { cx: 0, cy: 46, r: 5, fill: C.gold }),
  txt('CAPITAL PARTNERS', { y: 100, size: 26, weight: 600, fill: C.gold, anchor: 'middle', ls: 12 })));
