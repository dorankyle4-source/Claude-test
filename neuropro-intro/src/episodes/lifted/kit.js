// Lifted Trucks look: charcoal, chrome and orange from the logo and showroom; Oswald + Public Sans as in their board deck.
import { h } from '../../engine/svg.js';
export { makeKit, stroke, riseK, g } from '../adp/kit.js';
import { g } from '../adp/kit.js';

export const W = 1920, H = 1080;
export const C = {
  bg: '#17191C', bg2: '#1E2125', card: '#262A30', line: '#353B43', track: '#30353C',
  paper: '#F5F3EF', cardL: '#FFFFFF', lineL: '#DDD8CF', trackL: '#E4DFD6',
  orange: '#E8762C', orangeDeep: '#B9530F', chrome: '#C9CDD2', steel: '#66727F',
  white: '#F5F3EF', mute: '#A3AAB3', muteL: '#6B7079', ink: '#17191C', ink2: '#454B54',
};
export const DISPLAY = 'Oswald, sans-serif';
export const BODY = "'Public Sans', sans-serif";
export const LOGO = '../assets/lifted/lifted-trucks-logo-transparent.png', LOGO_AR = 155 / 422;
export const PHOTO = '../assets/lifted/showroom.jpg', PHOTO_AR = 858 / 1922;

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
export function txt(str, { x = 0, y = 0, size = 28, weight = 500, fill = C.white, family = BODY, anchor = 'start', ls = 0, id } = {}) {
  return h('text', { id, x, y, 'font-family': family, 'font-size': size, 'font-weight': weight, fill, 'text-anchor': anchor, 'letter-spacing': ls || undefined }, esc(str));
}
export const header = (id, eyebrow, title, light) => [
  g(`${id}-eye`, txt(eyebrow, { size: 26, weight: 700, fill: light ? C.orangeDeep : C.orange, ls: 3 })),
  g(`${id}-head`, txt(title.toUpperCase(), { size: 76, weight: 600, family: DISPLAY, fill: light ? C.ink : C.white, ls: 1 })),
];
