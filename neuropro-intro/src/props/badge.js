// NeuroPro badge: the real logo icon (head + network) in a white disc with a teal ring.
// It flies in, scans the brain, and later becomes the icon of the full logo on the title card.
import { h, tr, rot, sc } from '../engine/svg.js';
import { clamp } from '../engine/anim.js';

export const BADGE_R = 92;
export const BADGE_ICON_H = 118; // icon height inside the disc (px, badge scale 1)

export function createBadge(brand, iconSize, prefix = 'bg-') {
  const c = brand.colors, P = prefix, id = (n) => P + n;
  const iw = (iconSize[0] / iconSize[1]) * BADGE_ICON_H;
  const markup = h('g', { id: id('root'), opacity: 0 },
    h('g', { id: id('trail') }, ...[0, 1, 2, 3].map((i) => h('circle', { id: id(`t${i}`), r: BADGE_R * (0.8 - i * 0.14), fill: c.teal, opacity: 0 }))),
    h('g', { id: id('disc') },
      h('circle', { id: id('halo'), r: BADGE_R + 26, fill: c.teal, filter: 'url(#blur14)', opacity: 0.35 }),
      h('circle', { id: id('bgc'), r: BADGE_R, fill: '#FFFFFF', filter: 'url(#dropShadow)' }),
      h('circle', { id: id('ring'), r: BADGE_R, fill: 'none', stroke: c.teal, 'stroke-width': 7 }),
      h('circle', { id: id('arc'), r: BADGE_R + 16, fill: 'none', stroke: c.teal, 'stroke-width': 4, 'stroke-dasharray': '60 40 20 40', 'stroke-linecap': 'round', opacity: 0.8 }),
    ),
    h('image', { id: id('icon'), href: `../${brand.logo.icon}`, x: -iw / 2, y: -BADGE_ICON_H / 2, width: iw, height: BADGE_ICON_H }),
  );
  return {
    markup,
    mount(root) {
      const $ = (n) => root.querySelector(`#${P}${n}`);
      const els = Object.fromEntries(['root', 'disc', 'arc', 'halo', 'bgc', 'ring', 'icon', 't0', 't1', 't2', 't3'].map((n) => [n, $(n)]));
      /** s: { t, x, y, scale, rot, appear, discFade (0 = full disc, 1 = icon only), trail: [[x,y],...] } */
      return (s) => {
        els.root.setAttribute('opacity', clamp(s.appear).toFixed(3));
        els.root.setAttribute('transform', tr(0, 0));
        const g = `${tr(s.x, s.y)} ${rot(s.rot ?? 0)} ${sc(s.scale)}`;
        els.disc.setAttribute('transform', g);
        els.icon.setAttribute('transform', g);
        els.arc.setAttribute('transform', rot((s.t ?? 0) * 60));
        const df = clamp(s.discFade ?? 0);
        for (const n of ['bgc', 'ring', 'arc']) els[n].setAttribute('opacity', (1 - df).toFixed(3));
        els.halo.setAttribute('opacity', ((1 - df) * (0.3 + 0.1 * Math.sin((s.t ?? 0) * 5))).toFixed(3));
        const trail = s.trail || [];
        for (let i = 0; i < 4; i++) {
          const e = els[`t${i}`], p = trail[i];
          if (!p) { e.setAttribute('opacity', 0); continue; }
          e.setAttribute('cx', p[0].toFixed(1)); e.setAttribute('cy', p[1].toFixed(1));
          e.setAttribute('opacity', (p[2] * (0.28 - i * 0.06)).toFixed(3));
          e.setAttribute('transform', '');
          e.setAttribute('r', (BADGE_R * s.scale * (0.8 - i * 0.14)).toFixed(1));
        }
      };
    },
  };
}
