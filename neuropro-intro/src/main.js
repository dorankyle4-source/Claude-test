// NeuroPro intro — stage / director.
// Builds the layered SVG, then renders any time t deterministically via window.NP.renderFrame(t).
// Used both by the live preview (index.html) and the frame-accurate renderer (scripts/render.mjs).

import { loadConfig, loadFonts } from './engine/config.js';
import { h, tr } from './engine/svg.js';
import { sharedDefs } from './engine/defs.js';
import { createCamera } from './engine/camera.js';
import { prog, clamp } from './engine/anim.js';
import { createStudio } from './backgrounds/studio.js';
import { createMascot } from './characters/mascot.js';
import { createBadge } from './props/badge.js';
import { createIcons } from './props/icons.js';
import { mascotPose } from './scenes/acting.js';
import { createScene01 } from './scenes/01-establish.js';
import { createScene02 } from './scenes/02-symptoms.js';
import { createScene03 } from './scenes/03-neuropro.js';
import { createScene04 } from './scenes/04-title.js';

export async function createStage(svg) {
  const cfg = await loadConfig();
  await loadFonts();
  const { brand, characters, storyboard: sb } = cfg;
  const c = brand.colors;
  const W = sb.width, H = sb.height;

  const camera = createCamera(sb.camera, W, H);
  const studio = createStudio(brand);
  const mascot = createMascot(characters.mascot.palette);
  const L = brand.logoLayout;
  const badge = createBadge(brand, [L.icon[2] - L.icon[0], L.icon[3] - L.icon[1]]);
  const icons = createIcons(brand, cfg.scene['02-symptoms'].icons, sb.iconLabels);
  const scenes = [createScene01(cfg), createScene02(cfg), createScene03(cfg), createScene04(cfg)];

  // Captions (optional, from storyboard.captions)
  const vo = sb.voiceover;

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = [
    sharedDefs(c),
    studio.defs,
    h('defs', {},
      h('filter', { id: 'bgBlur', x: '-5%', y: '-5%', width: '110%', height: '110%' }, h('feGaussianBlur', { id: 'bgBlurStd', stdDeviation: 0 })),
      h('filter', { id: 'grade', 'color-interpolation-filters': 'sRGB' }, h('feColorMatrix', { id: 'gradeM', type: 'saturate', values: 1 })),
      h('radialGradient', { id: 'vignette', cx: 0.5, cy: 0.5, r: 0.75 },
        h('stop', { offset: 0.55, 'stop-color': '#3D2F7A', 'stop-opacity': 0 }), h('stop', { offset: 1, 'stop-color': '#3D2F7A', 'stop-opacity': 1 })),
      h('radialGradient', { id: 'vignetteN', cx: 0.5, cy: 0.5, r: 0.8 },
        h('stop', { offset: 0.6, 'stop-color': '#0B2545', 'stop-opacity': 0 }), h('stop', { offset: 1, 'stop-color': '#0B2545', 'stop-opacity': 1 })),
      h('pattern', { id: 'grainPat', width: 256, height: 256, patternUnits: 'userSpaceOnUse' }, h('image', { id: 'grainImg', width: 256, height: 256 })),
    ),
    h('rect', { width: W, height: H, fill: '#E9EEF2' }),
    h('g', { id: 'world' },
      h('g', { id: 'L-far', filter: 'url(#bgBlur)' }, studio.far),
      h('g', { id: 'L-mid' }, studio.mid),
      h('g', { id: 'L-chars' },
        scenes.map((s) => s.world || ''),
        h('g', { id: 'mascot' }, mascot.markup),
        icons.markup,
      ),
      h('g', { id: 'L-light' }, studio.light),
      h('g', { id: 'L-fg' }, studio.fg),
    ),
    h('rect', { id: 'vigN', width: W, height: H, fill: 'url(#vignetteN)', opacity: 0.16, 'pointer-events': 'none' }),
    h('rect', { id: 'vigDizzy', width: W, height: H, fill: 'url(#vignette)', opacity: 0 }),
    h('rect', { id: 'flash', width: W, height: H, fill: '#FFFFFF', opacity: 0 }),
    h('g', { id: 'screen' }, scenes.map((s) => s.screen || ''), h('g', { id: 'badge' }, badge.markup)),
    sb.captions ? h('g', { id: 'captions' },
      h('rect', { id: 'capBg', x: 0, y: 952, width: 0, height: 64, rx: 32, fill: c.navy, opacity: 0 }),
      h('text', { id: 'capT', x: W / 2, y: 994, 'text-anchor': 'middle', 'font-family': brand.fonts.body, 'font-weight': 500, 'font-size': 32, fill: '#fff' })) : '',
    h('rect', { id: 'grain', width: W, height: H, fill: 'url(#grainPat)', opacity: 0.05, style: 'mix-blend-mode:overlay', 'pointer-events': 'none' }),
  ].join('');

  // Film grain texture (generated once, deterministic).
  {
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const g = cv.getContext('2d'), img = g.createImageData(256, 256);
    let seed = 1234567;
    for (let i = 0; i < img.data.length; i += 4) {
      seed = (seed * 16807) % 2147483647;
      const v = (seed / 2147483647) * 255;
      img.data[i] = img.data[i + 1] = img.data[i + 2] = v; img.data[i + 3] = 255;
    }
    g.putImageData(img, 0, 0);
    svg.querySelector('#grainImg').setAttribute('href', cv.toDataURL());
  }

  const applyMascot = mascot.mount(svg.querySelector('#mascot'));
  const applyBadge = badge.mount(svg.querySelector('#badge'));
  const applyIcons = icons.mount(svg);
  for (const s of scenes) s.mount?.(svg);

  const $ = (id) => svg.querySelector(`#${id}`);
  const layers = { far: $('L-far'), mid: $('L-mid'), chars: $('L-chars'), light: $('L-light'), fg: $('L-fg') };
  const DEPTH = { far: 0.62, mid: 0.86, chars: 1, light: 0.9, fg: 1.3 };

  function renderFrame(t) {
    const cam = camera.at(t);
    for (const [k, el] of Object.entries(layers)) el.setAttribute('transform', camera.layer(cam, DEPTH[k]));

    // Shared per-frame state that scenes write into, then props read from.
    const icState = {};
    for (const ic of cfg.scene['02-symptoms'].icons) icState[ic.id] = { x: 0, y: 0, sx: 0, sy: 0, opacity: 0 };
    const state = {
      icons: icState, sparkK: 0, beam: 0, scanK: 0, ringK: 0,
      badge: { x: 0, y: 0, scale: 1, appear: 0, t },
      grade: { dizzy: 0, flash: 0 },
    };
    const ctx = { t, cfg, root: svg, cam, camera, state };
    // scenes 1–3 run first; the badge is then projected to screen space for the title match-cut
    for (const s of scenes.slice(0, 3)) s.update?.(t, ctx);
    const bw = state.badge;
    const [bx, by] = camera.project(cam, bw.x, bw.y);
    state.badgeScreen = { ...bw, x: bx, y: by, scale: bw.scale * cam.zoom };
    scenes[3].update(t, ctx);
    const trail = [];
    const b3 = cfg.scene['03-neuropro'].beats;
    if (t > b3.badgeEnter && t < b3.badgeLand + 0.1) {
      for (let i = 1; i <= 4; i++) {
        const tt = t - i * 0.035, pw = scenes[2].badgeAt(tt), c2 = camera.at(tt);
        const [px, py] = camera.project(c2, pw.x, pw.y);
        trail.push([px, py, 1 - prog(t, b3.badgeLand - 0.1, b3.badgeLand + 0.1)]);
      }
    }
    const over = scenes[3].badgeOverride(t, state.badgeScreen);
    applyBadge({ t, discFade: 0, trail, ...state.badgeScreen, ...(over || {}) });

    studio.update(t, svg);
    applyMascot(mascotPose(t, cfg));
    applyIcons(state.icons, t);
    for (const s of scenes) s.apply?.(ctx);

    // Grade: the world loses colour and focus while dizzy; NeuroPro brings it back.
    const d = state.grade.dizzy;
    $('bgBlurStd').setAttribute('stdDeviation', (d * 3.2).toFixed(2));
    if (d > 0.001) { $('world').setAttribute('filter', 'url(#grade)'); $('gradeM').setAttribute('values', (1 - d * 0.3).toFixed(3)); }
    else $('world').removeAttribute('filter');
    $('vigDizzy').setAttribute('opacity', (d * 0.32).toFixed(3));
    $('flash').setAttribute('opacity', state.grade.flash.toFixed(3));
    $('grain').setAttribute('transform', tr((t * 997) % 256 | 0, (t * 613) % 256 | 0));

    if (sb.captions) {
      const line = [...vo].reverse().find((l) => t >= l.at && t < (l.end ?? l.at + 3.0));
      const k = line ? clamp(Math.min(prog(t, line.at, line.at + 0.2), 1 - prog(t, (line.end ?? line.at + 3.0) - 0.2, line.end ?? line.at + 3.0))) : 0;
      $('capT').textContent = line ? line.text : '';
      const w = line ? $('capT').getComputedTextLength() + 64 : 0;
      $('capBg').setAttribute('x', ((W - w) / 2).toFixed(1)); $('capBg').setAttribute('width', w.toFixed(1));
      $('capBg').setAttribute('opacity', (k * 0.78).toFixed(3)); $('capT').setAttribute('opacity', k.toFixed(3));
    }
  }

  return { cfg, renderFrame, duration: sb.duration, fps: sb.fps };
}
