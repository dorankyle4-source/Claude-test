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
  const extra = h('g', { id: 'ec-extra', opacity: 0 },
    h('text', { id: 'ec-ep', x: 960, y: 880, 'text-anchor': 'middle', 'font-family': F.display, 'font-weight': 700, 'font-size': 30, fill: c.tealDeep, 'letter-spacing': 3 }, ec.episode.toUpperCase()),
    h('text', { id: 'ec-disc', x: 960, y: 1030, 'text-anchor': 'middle', 'font-family': F.body, 'font-weight': 400, 'font-size': 22, fill: '#6B7482' }, ec.disclaimer));
  return {
    ...card,
    screen: card.screen + extra,
    update(t, ctx) {
      card.update(t, ctx);
      const k = prog(t, T.episode, T.episode + 0.5, outCubic);
      const el = ctx.root.querySelector('#ec-extra');
      el.setAttribute('opacity', k.toFixed(3));
      el.setAttribute('transform', `translate(0 ${((1 - k) * 14).toFixed(1)})`);
    },
  };
}
