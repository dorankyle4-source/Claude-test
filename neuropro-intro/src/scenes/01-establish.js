// SCENE 1 (0–2s) — Establishing shot. Jordan in the NeuroPro studio; camera pushes in.
// Owns: the on-screen line "Something feels different…".
import { h, tr } from '../engine/svg.js';
import { prog, outCubic, inCubic, clamp } from '../engine/anim.js';
import { measureRun, placeRun } from '../engine/text.js';

export function createScene01(cfg) {
  const sc = cfg.scene['01-establish'], b = sc.beats, c = cfg.brand.colors;
  const words = sc.onScreenText.split(' ');
  const style = { 'font-family': cfg.brand.fonts.display, 'font-weight': 700, 'font-size': 58, fill: c.navy, 'letter-spacing': -0.5 };
  const X = 1165, Y = 905;
  let n = 0;

  return {
    screen: h('g', { id: 's1-text', transform: tr(X, Y) },
      h('rect', { id: 's1-bar', x: 0, y: -96, width: 64, height: 7, rx: 3.5, fill: c.teal }),
      h('g', { id: 's1-words' })),
    mount(svg) {
      const run = measureRun(svg, words, style, 16);
      placeRun(svg.querySelector('#s1-words'), run, style, 's1-w');
      n = words.length;
    },
    update(t, ctx) {
      const $ = (id) => ctx.root.querySelector(`#${id}`);
      const out = prog(t, b.textOut - 0.3, b.textOut, inCubic);
      for (let i = 0; i < n; i++) {
        const k = prog(t, b.textIn + i * 0.14, b.textIn + i * 0.14 + 0.55, outCubic);
        const el = $(`s1-w${i}`);
        el.setAttribute('transform', tr(0, (1 - k) * 34 - out * 20));
        el.setAttribute('opacity', (k * (1 - out)).toFixed(3));
      }
      const bar = prog(t, b.textIn - 0.1, b.textIn + 0.4, outCubic);
      $('s1-bar').setAttribute('width', (64 * bar * (1 - out)).toFixed(1));
      $('s1-text').setAttribute('opacity', clamp(1 - out).toFixed(3));
    },
  };
}
