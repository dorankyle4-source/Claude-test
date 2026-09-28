// EPISODE 1 — "What Is a Concussion?" · stage / director.
// Studio world (parallax camera + mascot + symptom icons) with full-screen "explainer" views that iris in on top:
// anatomy (section 2) and neurons (section 3). Overlays, end card and the NeuroPro badge sit in screen space.

import { loadConfig, loadFonts } from '../../engine/config.js';
import { h, tr } from '../../engine/svg.js';
import { sharedDefs } from '../../engine/defs.js';
import { createCamera } from '../../engine/camera.js';
import { prog, lerp, outBack } from '../../engine/anim.js';
import { createStudio } from '../../backgrounds/studio.js';
import { createMascot } from '../../characters/mascot.js';
import { createIcons } from '../../props/icons.js';
import { createBadge } from '../../props/badge.js';
import { buildTimeline } from './timeline.js';
import { mascotPose, cameraAt, iconStates, ICON_LIST, HOME_X, BODY_CY } from './acting.js';
import { createAnatomy } from './anatomy.js';
import { createNeurons } from './neurons.js';
import { createOverlays } from './overlays.js';
import { createEndCard } from './endcard.js';

export async function createStage(svg, comp = 'ep01') {
  const cfg = await loadConfig(comp);
  await loadFonts();
  const { brand, characters, storyboard: sb } = cfg;
  const c = brand.colors, W = sb.width, H = sb.height;
  const T = buildTimeline(sb, cfg.timing);

  const camera = createCamera({ keys: [{ t: 0, cx: 960, cy: 540, zoom: 1 }] }, W, H); // projection helpers only
  const studio = createStudio(brand);
  const mascot = createMascot(characters.mascot.palette);
  const icons = createIcons(brand, ICON_LIST, true);
  const L = brand.logoLayout;
  const badge = createBadge(brand, [L.icon[2] - L.icon[0], L.icon[3] - L.icon[1]]);
  const anatomy = createAnatomy(cfg, T);
  const neurons = createNeurons(cfg, T);
  const overlays = createOverlays(cfg, T);
  const endcard = createEndCard(cfg, T);

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = [
    sharedDefs(c), studio.defs,
    h('defs', {},
      h('radialGradient', { id: 'vignetteN', cx: 0.5, cy: 0.5, r: 0.8 },
        h('stop', { offset: 0.6, 'stop-color': '#0B2545', 'stop-opacity': 0 }), h('stop', { offset: 1, 'stop-color': '#0B2545', 'stop-opacity': 1 })),
      h('pattern', { id: 'grainPat', width: 256, height: 256, patternUnits: 'userSpaceOnUse' }, h('image', { id: 'grainImg', width: 256, height: 256 }))),
    h('rect', { width: W, height: H, fill: '#E9EEF2' }),
    h('g', { id: 'world' },
      h('g', { id: 'L-far' }, studio.far),
      h('g', { id: 'L-mid' }, studio.mid),
      h('g', { id: 'L-chars' }, h('g', { id: 'mascot' }, mascot.markup), icons.markup),
      h('g', { id: 'L-light' }, studio.light),
      h('g', { id: 'L-fg' }, studio.fg)),
    h('rect', { width: W, height: H, fill: 'url(#vignetteN)', opacity: 0.14 }),
    h('g', { id: 'screen' }, overlays.markup, anatomy.markup, neurons.markup, endcard.screen, h('g', { id: 'badge' }, badge.markup)),
    h('rect', { id: 'grain', width: W, height: H, fill: 'url(#grainPat)', opacity: 0.045, style: 'mix-blend-mode:overlay', 'pointer-events': 'none' }),
  ].join('');

  { // film grain texture
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const g = cv.getContext('2d'), img = g.createImageData(256, 256);
    let seed = 1234567;
    for (let i = 0; i < img.data.length; i += 4) { seed = (seed * 16807) % 2147483647; img.data[i] = img.data[i + 1] = img.data[i + 2] = (seed / 2147483647) * 255; img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0);
    svg.querySelector('#grainImg').setAttribute('href', cv.toDataURL());
  }

  const applyMascot = mascot.mount(svg.querySelector('#mascot'));
  const applyIcons = icons.mount(svg);
  const applyBadge = badge.mount(svg.querySelector('#badge'));
  overlays.mount(svg);
  endcard.mount?.(svg);

  const $ = (id) => svg.querySelector(`#${id}`);
  const layers = { far: $('L-far'), mid: $('L-mid'), chars: $('L-chars'), light: $('L-light'), fg: $('L-fg') };
  const DEPTH = { far: 0.62, mid: 0.86, chars: 1, light: 0.9, fg: 1.3 };
  const BADGE_FROM = [2250, 280], BADGE_AT = [1190, 430];

  function renderFrame(t) {
    const cam = cameraAt(t, T);
    const worldVisible = t < T.toAnatomy + 1.1 || t > T.toStudio - 0.1;
    $('world').setAttribute('visibility', worldVisible ? 'visible' : 'hidden');
    if (worldVisible) {
      for (const [k, el] of Object.entries(layers)) el.setAttribute('transform', camera.layer(cam, DEPTH[k]));
      studio.update(t, svg);
      applyMascot(mascotPose(t, T));
      applyIcons(iconStates(t, T), t);
    }

    // badge (takeaway): flies in, hovers beside the brain; projected to screen for the end-card match-cut
    const bk = prog(t, T.badgeIn, T.badgeLand, (x) => 1 - Math.pow(1 - x, 3));
    const land = t > T.badgeLand ? outBack(prog(t, T.badgeLand - 0.05, T.badgeLand + 0.35), 3) : 0;
    const bw = {
      x: lerp(BADGE_FROM[0], BADGE_AT[0], bk),
      y: lerp(BADGE_FROM[1], BADGE_AT[1], bk) - Math.sin(bk * Math.PI) * 90 + Math.sin(t * 1.7) * 6 * prog(t, T.badgeLand, T.badgeLand + 0.4),
      scale: 0.95 * (0.6 + 0.4 * bk) * (t > T.badgeLand ? 0.9 + 0.1 * land : 1), rot: (1 - bk) * -25,
    };
    const [bx, by] = camera.project(cam, bw.x, bw.y);
    const state = { badgeScreen: { ...bw, x: bx, y: by, scale: bw.scale * cam.zoom } };
    const ctx = { t, cfg, root: svg, cam, camera, state,
      irisFrom: camera.project(cam, 860, BODY_CY),
      irisTo: camera.project(cameraAt(T.toStudio + 0.8, T), HOME_X, BODY_CY) };

    overlays.update(t, ctx);
    anatomy.update(t, ctx);
    neurons.update(t, ctx);
    endcard.update(t, ctx);
    const trail = [];
    if (t > T.badgeIn && t < T.badgeLand + 0.1) {
      for (let i = 1; i <= 4; i++) {
        const tt = t - i * 0.035, kk = prog(tt, T.badgeIn, T.badgeLand, (x) => 1 - Math.pow(1 - x, 3));
        const [px, py] = camera.project(cameraAt(tt, T), lerp(BADGE_FROM[0], BADGE_AT[0], kk), lerp(BADGE_FROM[1], BADGE_AT[1], kk) - Math.sin(kk * Math.PI) * 90);
        trail.push([px, py, 1 - prog(t, T.badgeLand - 0.1, T.badgeLand + 0.1)]);
      }
    }
    const over = endcard.badgeOverride(t, state.badgeScreen);
    applyBadge({ t, discFade: 0, trail, ...state.badgeScreen, appear: prog(t, T.badgeIn, T.badgeIn + 0.1), ...(over || {}) });
    $('grain').setAttribute('transform', tr((t * 997) % 256 | 0, (t * 613) % 256 | 0));
  }

  return { cfg, T, renderFrame, duration: sb.duration, fps: sb.fps };
}
