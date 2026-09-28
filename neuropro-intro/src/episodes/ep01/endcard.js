// End card: reuses the intro's logo reveal (badge → logo icon, wordmark wipe) and adds the
// "Concussion & Brain Health" line, the episode title and a short education-only disclaimer.
import { h } from '../../engine/svg.js';
import { prog, outCubic } from '../../engine/anim.js';
import { createScene04 } from '../../scenes/04-title.js';

export function createEndCard(cfg, T) {
  const ec = cfg.storyboard.endCard, c = cfg.brand.colors, F = cfg.brand.fonts;
  const card = createScene04({
    brand: { ...cfg.brand, tagline: ec.subtitle },
    storyboard: cfg.storyboard,
    scene: { '04-title': { beats: { iris: T.iris, markLand: T.markLand, wordmark: T.wordmark, tagline: T.subtitle, logoPulse: T.subtitle + 0.4 } } },
  });
  const quote = ec.quote ? h('text', { id: 'ec-quote', x: 960, y: 790, 'text-anchor': 'middle', 'font-family': F.display, 'font-weight': 800, 'font-size': 50, fill: c.coral, opacity: 0 }, ec.quote) : '';
  const extra = h('g', { id: 'ec-extra', opacity: 0 },
    h('text', { id: 'ec-ep', x: 960, y: ec.quote ? 910 : 880, 'text-anchor': 'middle', 'font-family': F.display, 'font-weight': 700, 'font-size': 30, fill: c.tealDeep, 'letter-spacing': 3 }, ec.episode.toUpperCase()),
    h('text', { id: 'ec-disc', x: 960, y: 1030, 'text-anchor': 'middle', 'font-family': F.body, 'font-weight': 400, 'font-size': 22, fill: '#6B7482' }, ec.disclaimer));
  return {
    ...card,
    screen: card.screen + quote + extra,
    update(t, ctx) {
      card.update(t, ctx);
      if (ec.quote) {
        const q = prog(t, T.quote, T.quote + 0.5, outCubic), el = ctx.root.querySelector('#ec-quote');
        el.setAttribute('opacity', q.toFixed(3));
        el.setAttribute('transform', `translate(960 790) scale(${(0.92 + 0.08 * q).toFixed(3)}) translate(-960 -790)`);
      }
      const k = prog(t, T.episode, T.episode + 0.5, outCubic);
      const el = ctx.root.querySelector('#ec-extra');
      el.setAttribute('opacity', k.toFixed(3));
      el.setAttribute('transform', `translate(0 ${((1 - k) * 14).toFixed(1)})`);
    },
  };
}
