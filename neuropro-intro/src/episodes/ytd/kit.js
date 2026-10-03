// NeuroPro look for the YTD video: brand palette and type, plus the ADP recap's per-frame helpers.
import { h } from '../../engine/svg.js';
export { makeKit, stroke, riseK, g } from '../adp/kit.js';
import { g } from '../adp/kit.js';

export const W = 1920, H = 1080;
export const C = {
  paper: '#F8F6F1', cream: '#F2EDE4', card: '#FFFFFF', line: '#E6E1D8', track: '#E5DFD4',
  navy: '#0B2545', navyDeep: '#061A33', navy2: '#16365F', bar: '#2C4F7E',
  teal: '#1FC8B4', tealDeep: '#0B8F84', tealSoft: '#D6F3EE',
  coral: '#FF6B4A', coralSoft: '#FFE4DC', amber: '#F5A524', grey: '#9AA6B5',
  ink2: '#44546B', muted: '#6B7889', light: '#C3CFDD', white: '#FFFFFF',
};
export const DISPLAY = 'Manrope, sans-serif';
export const BODY = 'Inter, sans-serif';

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function txt(str, { x = 0, y = 0, size = 28, weight = 500, fill = C.navy, family = BODY, anchor = 'start', ls = 0, id } = {}) {
  return h('text', { id, x, y, 'font-family': family, 'font-size': size, 'font-weight': weight, fill, 'text-anchor': anchor, 'letter-spacing': ls || undefined }, esc(str));
}
export const header = (id, eyebrow, title, dark) => [
  g(`${id}-eye`, txt(eyebrow, { size: 26, weight: 800, family: DISPLAY, fill: dark ? C.coral : C.tealDeep, ls: 3 })),
  g(`${id}-head`, txt(title, { size: 68, weight: 800, family: DISPLAY, fill: dark ? C.white : C.navy, ls: -1 })),
];
