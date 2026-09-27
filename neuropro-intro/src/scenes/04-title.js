// SCENE 4 (8–10s) — Brand reveal. An iris opens from the (now organised) brain, which flies to centre
// and resolves into the NeuroPro mark; wordmark, descriptor and tagline follow.
// If brand.logoImage is set, that artwork replaces the temporary mark + wordmark.
import { h, tr, sc as scale } from '../engine/svg.js';
import { prog, outCubic, inOutCubic, inOutExpo, outBack, clamp, lerp, fnoise } from '../engine/anim.js';
import { measureRun, placeRun } from '../engine/text.js';
import { BRAIN_OUTLINE } from '../props/brain.js';
import { PANEL } from './02-symptoms.js';
import { MARK_BRAIN, MARK_PULSE } from '../props/logo.js';


const MARK = { x: 960, y: 336, s: 1.3 };

export function createScene04(cfg) {
  const B = cfg.brand, c = B.colors, bt = cfg.scene['04-title'].beats;
  const W = cfg.storyboard.width, H = cfg.storyboard.height;
  const word = [...B.wordmark.primary, ...B.wordmark.accent];
  const nPrimary = B.wordmark.primary.length;
  const wordStyle = { 'font-family': B.fonts.display, 'font-weight': 800, 'font-size': 128, 'letter-spacing': 0 };
  const subStyle = { 'font-family': B.fonts.display, 'font-weight': 600, 'font-size': 31, fill: '#86E8DB' };
  const tagStyle = { 'font-family': B.fonts.body, 'font-weight': 500, 'font-size': 33, fill: '#D6E2F0' };
  let letters = 0, run = null;

  const stars = [];
  for (let i = 0; i < 40; i++) stars.push(h('circle', { id: `s4-st${i}`, r: 1.4 + (i % 3), fill: i % 4 ? '#9FC3E8' : c.cyan }));

  const screen = h('g', { id: 's4-root', opacity: 0 },
    h('defs', {},
      h('radialGradient', { id: 's4-bg', cx: 0.5, cy: 0.42, r: 0.75 },
        h('stop', { offset: 0, 'stop-color': '#16406F' }), h('stop', { offset: 0.55, 'stop-color': c.navy }), h('stop', { offset: 1, 'stop-color': c.navyDeep })),
      h('linearGradient', { id: 's4-brain', x1: 0, y1: 0, x2: 1, y2: 1 },
        h('stop', { offset: 0, 'stop-color': '#47E6D2' }), h('stop', { offset: 1, 'stop-color': '#3A8DFF' })),
      h('clipPath', { id: 's4-iris' }, h('circle', { id: 's4-irisC', cx: 960, cy: 540, r: 0 })),
    ),
    h('g', { 'clip-path': 'url(#s4-iris)' },
      h('rect', { x: 0, y: 0, width: W, height: H, fill: 'url(#s4-bg)' }),
      h('g', { id: 's4-card' },
        h('g', { id: 's4-stars', opacity: 0.7 }, ...stars),
        h('g', { id: 's4-rings', transform: tr(MARK.x, MARK.y) },
          ...[170, 250, 340].map((r, i) => h('circle', { id: `s4-rg${i}`, r, fill: 'none', stroke: c.teal, 'stroke-width': 1.5, opacity: 0 }))),
        B.logoImage
          ? h('image', { id: 's4-logoImg', href: `../${B.logoImage}`, x: 560, y: 220, width: 800, height: 420, preserveAspectRatio: 'xMidYMid meet', opacity: 0 })
          : h('g', {},
              h('g', { id: 's4-wordmark', transform: 'translate(960 590)' }),
              h('g', { id: 's4-sub', transform: 'translate(960 652)' },
                h('text', { id: 's4-subT', 'text-anchor': 'middle', ...subStyle, 'letter-spacing': 9 }, B.subtitle.toUpperCase()))),
        h('path', { id: 's4-div', d: 'M900,700 L1020,700', stroke: c.teal, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0 }),
        h('text', { id: 's4-tag', x: 960, y: 766, 'text-anchor': 'middle', ...tagStyle, opacity: 0 }, B.tagline),
      ),
    ),
    // the flying brain → mark (drawn above the iris so the match-cut reads)
    h('g', { id: 's4-fly' },
      h('path', { id: 's4-flyGlow', d: BRAIN_OUTLINE, fill: c.cyan, filter: 'url(#blur14)', opacity: 0 }),
      h('path', { id: 's4-flyBody', d: BRAIN_OUTLINE, fill: 'url(#s4-brain)' })),
    B.logoImage ? '' : h('g', { id: 's4-mark', transform: `${tr(MARK.x, MARK.y)} ${scale(MARK.s)}` },
      h('circle', { id: 's4-ringGlow', r: 92, fill: 'none', stroke: c.teal, 'stroke-width': 10, filter: 'url(#blur14)', opacity: 0 }),
      h('circle', { id: 's4-ring', r: 92, fill: 'none', stroke: c.teal, 'stroke-width': 5, pathLength: 1, 'stroke-dasharray': '0 1', transform: 'rotate(-90)', 'stroke-linecap': 'round' }),
      h('path', { id: 's4-mBrain', d: MARK_BRAIN, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 5.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '0 1' }),
      h('path', { id: 's4-mPulse', d: MARK_PULSE, fill: 'none', stroke: c.cyan, 'stroke-width': 5.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '0 1' }),
      h('path', { id: 's4-mSpark', d: MARK_PULSE, fill: 'none', stroke: '#FFFFFF', 'stroke-width': 7, 'stroke-linecap': 'round', pathLength: 1, 'stroke-dasharray': '0.1 1.2', filter: 'url(#glow)', opacity: 0 }),
      h('circle', { id: 's4-glint', r: 5, fill: '#FFFFFF', filter: 'url(#glow)', opacity: 0 }),
    ),
  );

  return {
    screen,
    mount(svg) {
      if (B.logoImage) return;
      run = measureRun(svg, word, wordStyle, 7);
      const g = svg.querySelector('#s4-wordmark');
      const inner = document.createElementNS('http://www.w3.org/2000/svg', 'g');
      inner.setAttribute('transform', tr(-run.width / 2, 0));
      g.appendChild(inner);
      placeRun(inner, run, wordStyle, 's4-l');
      run.items.forEach((_, i) => inner.querySelector(`#s4-l${i} text`).setAttribute('fill', i < nPrimary ? '#FFFFFF' : c.teal));
      letters = word.length;
    },
    update(t, ctx) {
      const root = ctx.root, $ = (id) => root.querySelector(`#${id}`), set = (id, a, v) => $(id).setAttribute(a, v);
      const t0 = bt.iris;
      if (t < t0 - 0.05) { set('s4-root', 'opacity', 0); return; }
      set('s4-root', 'opacity', 1);

      // iris from the brain's current screen position
      const cam = ctx.cam;
      const [px, py] = ctx.camera.project(cam, PANEL.x, ctx.state.panel.y);
      const irisK = prog(t, t0, t0 + 0.6, inOutCubic);
      set('s4-irisC', 'cx', px.toFixed(1)); set('s4-irisC', 'cy', py.toFixed(1));
      set('s4-irisC', 'r', (irisK * 2300).toFixed(1));
      ctx.state.dotsFade = irisK;

      // flying brain: from panel (screen) → mark centre, shrinking into the mark
      const flyK = prog(t, t0, bt.markLand, inOutExpo);
      const startS = PANEL.scale * 0.8 * cam.zoom;
      const endS = MARK.s * 0.42;
      const fx = lerp(px, MARK.x, flyK), fy = lerp(py, MARK.y, flyK) - Math.sin(flyK * Math.PI) * 40;
      const fs = lerp(startS, endS, flyK);
      const fade = prog(t, bt.markLand - 0.2, bt.markLand + 0.25);
      set('s4-fly', 'transform', `${tr(fx, fy)} ${scale(fs)}`);
      set('s4-fly', 'opacity', (1 - fade).toFixed(3));
      set('s4-flyGlow', 'opacity', (0.6 * (1 - fade)).toFixed(3));

      // card slow push
      const push = 1 + prog(t, t0 + 0.4, 10, (k) => k) * 0.03;
      set('s4-card', 'transform', `translate(960 540) ${scale(push)} translate(-960 -540)`);
      for (let i = 0; i < 40; i++) {
        const u = (i * 0.618) % 1, v = (i * 0.414 + 0.1) % 1;
        const el = $(`s4-st${i}`);
        el.setAttribute('cx', (u * W + fnoise(t * 0.2, i) * 30).toFixed(1));
        el.setAttribute('cy', (v * H - t * 8 + fnoise(t * 0.2, i + 50) * 30).toFixed(1));
        el.setAttribute('opacity', (0.25 + 0.5 * Math.abs(Math.sin(t * 0.9 + i))).toFixed(2));
      }
      [0, 1, 2].forEach((i) => {
        const k = prog(t, bt.markLand - 0.1 + i * 0.12, bt.markLand + 1.2 + i * 0.12, outCubic);
        set(`s4-rg${i}`, 'opacity', (k > 0 ? (1 - k) * 0.35 + 0.05 : 0).toFixed(3));
        set(`s4-rg${i}`, 'transform', scale(0.7 + k * 0.3));
      });

      if (B.logoImage) {
        set('s4-logoImg', 'opacity', prog(t, bt.markLand - 0.2, bt.markLand + 0.3).toFixed(3));
      } else {
        // mark
        const ring = prog(t, bt.markLand - 0.3, bt.markLand + 0.35, outCubic);
        set('s4-ring', 'stroke-dasharray', `${ring.toFixed(4)} 1`);
        set('s4-ringGlow', 'opacity', (ring * 0.45).toFixed(3));
        const mb = prog(t, bt.markLand - 0.25, bt.markLand + 0.35, inOutCubic);
        set('s4-mBrain', 'stroke-dasharray', `${mb.toFixed(4)} 1`);
        const mp = prog(t, bt.markLand + 0.05, bt.markLand + 0.5, inOutCubic);
        set('s4-mPulse', 'stroke-dasharray', `${mp.toFixed(4)} 1`);
        const bounce = outBack(prog(t, bt.markLand - 0.2, bt.markLand + 0.3), 2.2);
        const breathe = 1 + Math.sin(Math.max(0, t - bt.logoPulse) * 3) * 0.012;
        set('s4-mark', 'transform', `${tr(MARK.x, MARK.y)} ${scale(MARK.s * (0.85 + 0.15 * bounce) * breathe)}`);
        // logo pulse: a light runs along the outcome line, glint orbits the ring
        const lp = (t - bt.logoPulse) / 0.9;
        set('s4-mSpark', 'opacity', lp > 0 && lp < 1 ? Math.sin(lp * Math.PI).toFixed(3) : 0);
        set('s4-mSpark', 'stroke-dashoffset', (0.1 - lp * 1.2).toFixed(4));
        const ga = -Math.PI / 2 + Math.max(0, t - bt.logoPulse) * 2.4;
        set('s4-glint', 'cx', (Math.cos(ga) * 92).toFixed(2)); set('s4-glint', 'cy', (Math.sin(ga) * 92).toFixed(2));
        set('s4-glint', 'opacity', (prog(t, bt.logoPulse, bt.logoPulse + 0.3) * 0.9).toFixed(3));

        // wordmark letters rise in
        for (let i = 0; i < letters; i++) {
          const k = prog(t, bt.wordmark + i * 0.045, bt.wordmark + i * 0.045 + 0.5, outCubic);
          set(`s4-l${i}`, 'transform', tr(0, (1 - k) * 48));
          set(`s4-l${i}`, 'opacity', k.toFixed(3));
        }
        const sk = prog(t, bt.subtitle, bt.subtitle + 0.5, outCubic);
        set('s4-subT', 'letter-spacing', (9 + (1 - sk) * 10).toFixed(2));
        set('s4-sub', 'opacity', sk.toFixed(3));
      }
      const dk = prog(t, bt.subtitle + 0.15, bt.subtitle + 0.6, outCubic);
      set('s4-div', 'd', `M${960 - 60 * dk},708 L${960 + 60 * dk},708`);
      set('s4-div', 'opacity', dk > 0 ? 1 : 0);
      const tk = prog(t, bt.tagline, bt.tagline + 0.5, outCubic);
      set('s4-tag', 'opacity', tk.toFixed(3));
      set('s4-tag', 'transform', tr(0, (1 - tk) * 16));
    },
  };
}
