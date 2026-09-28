// SCENE 4 (8–10s) — Brand reveal with the real NeuroPro logo.
// A light iris opens from the NeuroPro badge; the badge flies to where the head icon sits in the logo and
// sheds its disc (match-cut), the wordmark wipes on beside it, then the tagline. A teal light sweeps the logo.
// Logo files + layout: config/brand.json → logo (regenerate with scripts/split-logo.py).
import { h, tr, sc as scale } from '../engine/svg.js';
import { prog, outCubic, inOutCubic, inOutExpo, clamp, lerp } from '../engine/anim.js';
import { BADGE_ICON_H } from '../props/badge.js';

export function createScene04(cfg) {
  const B = cfg.brand, c = B.colors, bt = cfg.scene['04-title'].beats;
  const W = cfg.storyboard.width, H = cfg.storyboard.height;
  const L = B.logoLayout;
  const logoW = 1150, S = logoW / (L.wordmark[2] - L.icon[0]);
  const cx = 960, cy = 430;
  const ox = cx - ((L.icon[0] + L.wordmark[2]) / 2) * S;
  const oy = cy - ((Math.min(L.icon[1], L.wordmark[1]) + Math.max(L.icon[3], L.wordmark[3])) / 2) * S;
  const icon = { x: ox + L.icon[0] * S, y: oy + L.icon[1] * S, w: (L.icon[2] - L.icon[0]) * S, h: (L.icon[3] - L.icon[1]) * S };
  const word = { x: ox + L.wordmark[0] * S, y: oy + L.wordmark[1] * S, w: (L.wordmark[2] - L.wordmark[0]) * S, h: (L.wordmark[3] - L.wordmark[1]) * S };
  const ICON_TARGET = { x: icon.x + icon.w / 2, y: icon.y + icon.h / 2, scale: icon.h / BADGE_ICON_H };
  const tagY = oy + Math.max(L.icon[3], L.wordmark[3]) * S + 120;

  const screen = h('g', { id: 's4-root', opacity: 0 },
    h('defs', {},
      h('clipPath', { id: 's4-iris' }, h('circle', { id: 's4-irisC', cx: 960, cy: 540, r: 0 })),
      h('clipPath', { id: 's4-wipe' }, h('rect', { id: 's4-wipeR', x: word.x - 10, y: word.y - 20, width: 0, height: word.h + 40 })),
      h('filter', { id: 's4-white' }, h('feColorMatrix', { type: 'matrix', values: '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0' })),
      h('mask', { id: 's4-logoMask', maskUnits: 'userSpaceOnUse', x: 0, y: 0, width: W, height: H },
        h('image', { href: `../${B.logo.icon}`, x: icon.x, y: icon.y, width: icon.w, height: icon.h, filter: 'url(#s4-white)' }),
        h('image', { href: `../${B.logo.wordmark}`, x: word.x, y: word.y, width: word.w, height: word.h, filter: 'url(#s4-white)' })),
      h('linearGradient', { id: 's4-shineG', x1: 0, y1: 0, x2: 1, y2: 0 },
        h('stop', { offset: 0, 'stop-color': c.teal, 'stop-opacity': 0 }), h('stop', { offset: 0.5, 'stop-color': c.teal, 'stop-opacity': 0.95 }),
        h('stop', { offset: 1, 'stop-color': c.teal, 'stop-opacity': 0 })),
    ),
    h('g', { 'clip-path': 'url(#s4-iris)' },
      h('rect', { x: 0, y: 0, width: W, height: H, fill: c.paper }),
      h('g', { id: 's4-card' },
        h('circle', { id: 's4-blobA', cx: 260, cy: 880, r: 330, fill: '#FC9D7B', opacity: 0.16, filter: 'url(#blur14)' }),
        h('circle', { id: 's4-blobB', cx: 1680, cy: 200, r: 360, fill: c.teal, opacity: 0.12, filter: 'url(#blur14)' }),
        h('g', { 'clip-path': 'url(#s4-wipe)' },
          h('image', { id: 's4-word', href: `../${B.logo.wordmark}`, x: word.x, y: word.y, width: word.w, height: word.h })),
        h('image', { id: 's4-icon', href: `../${B.logo.icon}`, x: icon.x, y: icon.y, width: icon.w, height: icon.h, opacity: 0 }),
        h('g', { mask: 'url(#s4-logoMask)' }, h('rect', { id: 's4-shine', x: -400, y: word.y - 20, width: 360, height: word.h + 40, fill: 'url(#s4-shineG)', opacity: 0 })),
        h('rect', { id: 's4-div', x: 930, y: tagY - 62, width: 60, height: 5, rx: 2.5, fill: c.teal, opacity: 0 }),
        h('text', { id: 's4-tag', x: 960, y: tagY, 'text-anchor': 'middle', 'font-family': B.fonts.body, 'font-weight': 500, 'font-size': 42, fill: '#4A5363', opacity: 0 }, B.tagline),
      ),
    ),
  );

  return {
    screen,
    ICON_TARGET,
    /** Badge override for the match-cut (screen space). */
    badgeOverride(t, from) {
      const k = prog(t, bt.iris, bt.markLand, inOutExpo);
      if (k <= 0) return null;
      return {
        x: lerp(from.x, ICON_TARGET.x, k), y: lerp(from.y, ICON_TARGET.y, k) - Math.sin(k * Math.PI) * 50,
        scale: lerp(from.scale, ICON_TARGET.scale, k), rot: 0,
        discFade: prog(t, bt.markLand - 0.3, bt.markLand),
        appear: 1 - prog(t, bt.markLand + 0.02, bt.markLand + 0.12),
      };
    },
    update(t, ctx) {
      const $ = (id) => ctx.root.querySelector(`#${id}`), set = (id, a, v) => $(id).setAttribute(a, v);
      if (t < bt.iris - 0.05) { set('s4-root', 'opacity', 0); return; }
      set('s4-root', 'opacity', 1);
      const from = ctx.state.badgeScreen;
      const irisK = prog(t, bt.iris, bt.iris + 0.6, inOutCubic);
      set('s4-irisC', 'cx', from.x.toFixed(1)); set('s4-irisC', 'cy', from.y.toFixed(1));
      set('s4-irisC', 'r', (irisK * 2300).toFixed(1));

      set('s4-icon', 'opacity', prog(t, bt.markLand, bt.markLand + 0.08).toFixed(3));
      const wk = prog(t, bt.wordmark, bt.wordmark + 0.55, inOutCubic);
      set('s4-wipeR', 'width', ((word.w + 20) * wk).toFixed(1));
      set('s4-word', 'transform', tr((1 - wk) * -40, 0));
      const tk = prog(t, bt.tagline, bt.tagline + 0.45, outCubic);
      set('s4-tag', 'opacity', tk.toFixed(3));
      set('s4-tag', 'transform', tr(0, (1 - tk) * 18));
      const dk = prog(t, bt.tagline - 0.1, bt.tagline + 0.35, outCubic);
      set('s4-div', 'opacity', dk.toFixed(3));
      set('s4-div', 'width', (60 * dk).toFixed(1)); set('s4-div', 'x', (960 - 30 * dk).toFixed(1));
      const sk = prog(t, bt.logoPulse, bt.logoPulse + 0.75, inOutCubic);
      set('s4-shine', 'x', lerp(icon.x - 380, word.x + word.w + 40, sk).toFixed(1));
      set('s4-shine', 'opacity', sk > 0 && sk < 1 ? 1 : 0);
      const push = 1 + prog(t, bt.iris + 0.4, 10) * 0.025;
      set('s4-card', 'transform', `translate(960 540) ${scale(push)} translate(-960 -540)`);
      set('s4-blobA', 'cx', (260 + Math.sin(t * 0.8) * 30).toFixed(1));
      set('s4-blobB', 'cy', (200 + Math.cos(t * 0.7) * 30).toFixed(1));
    },
  };
}
