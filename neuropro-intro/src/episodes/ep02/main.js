// EPISODE 2 — "Why Do I Still Feel Bad After a Concussion?" · stage / director.
// Same studio, mascot, icons, neuron view, badge and end card as Episode 1 — only the story changes.

import { loadConfig, loadFonts } from '../../engine/config.js';
import { h, tr } from '../../engine/svg.js';
import { sharedDefs } from '../../engine/defs.js';
import { createCamera } from '../../engine/camera.js';
import { prog, lerp, outBack } from '../../engine/anim.js';
import { createStudio } from '../../backgrounds/studio.js';
import { createMascot } from '../../characters/mascot.js';
import { createIcons } from '../../props/icons.js';
import { createBadge } from '../../props/badge.js';
import { createNeurons } from '../ep01/neurons.js';
import { createEndCard } from '../ep01/endcard.js';
import { buildTimeline } from './timeline.js';
import { mascotPose, mascotX, cameraAt, iconStates, ICON_LIST, BODY_OFF, WALK1, HOME_X, MASCOT_Y } from './acting.js';
import { createOverlays } from './overlays.js';

export async function createStage(svg, comp = 'ep02') {
  const cfg = await loadConfig(comp);
  await loadFonts();
  const { brand, characters, storyboard: sb } = cfg;
  const c = brand.colors, W = sb.width, H = sb.height;
  const T = buildTimeline(sb, cfg.timing);

  const camera = createCamera({ keys: [{ t: 0, cx: 960, cy: 540, zoom: 1 }] }, W, H);
  const studio = createStudio(brand);
  const mascot = createMascot(characters.mascot.palette);
  const icons = createIcons(brand, ICON_LIST, true);
  const L = brand.logoLayout;
  const badge = createBadge(brand, [L.icon[2] - L.icon[0], L.icon[3] - L.icon[1]]);
  const neurons = createNeurons(cfg, T, { recover: false, scan: false, tracker: false, caption: { text: 'The brain is working differently.' } });
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
      // the clean NeuroPro backdrop for the takeaway (same paper + soft blobs as the end card)
      h('g', { id: 'clean', opacity: 0 },
        h('rect', { width: W, height: H, fill: c.paper }),
        h('circle', { cx: 260, cy: 900, r: 330, fill: '#FC9D7B', opacity: 0.16, filter: 'url(#blur14)' }),
        h('circle', { cx: 1680, cy: 200, r: 360, fill: c.teal, opacity: 0.12, filter: 'url(#blur14)' }),
        h('ellipse', { id: 'clean-floor', cx: 1110, cy: 1000, rx: 420, ry: 50, fill: c.teal, opacity: 0.12 })),
      h('g', { id: 'L-chars' }, h('g', { id: 'mascot' }, mascot.markup), icons.markup),
      h('g', { id: 'L-light' }, studio.light),
      h('g', { id: 'L-fg' }, studio.fg)),
    h('rect', { width: W, height: H, fill: 'url(#vignetteN)', opacity: 0.14 }),
    h('g', { id: 'screen' }, overlays.markup, neurons.markup, endcard.screen, h('g', { id: 'badge' }, badge.markup)),
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
  endcard.mount?.(svg);

  const $ = (id) => svg.querySelector(`#${id}`);
  const layers = { far: $('L-far'), mid: $('L-mid'), chars: $('L-chars'), light: $('L-light'), fg: $('L-fg') };
  const DEPTH = { far: 0.62, mid: 0.86, chars: 1, light: 0.9, fg: 1.3 };
  const BADGE_FROM = [2350, 260], BADGE_AT = [1640, 360];
  const bodyY = MASCOT_Y + BODY_OFF;

  function badgeWorld(tt) {
    const bk = prog(tt, T.badgeIn, T.badgeLand, (x) => 1 - Math.pow(1 - x, 3));
    const land = tt > T.badgeLand ? outBack(prog(tt, T.badgeLand - 0.05, T.badgeLand + 0.35), 3) : 0;
    return {
      x: lerp(BADGE_FROM[0], BADGE_AT[0], bk),
      y: lerp(BADGE_FROM[1], BADGE_AT[1], bk) - Math.sin(bk * Math.PI) * 90 + Math.sin(tt * 1.7) * 6 * prog(tt, T.badgeLand, T.badgeLand + 0.4),
      scale: 0.95 * (0.6 + 0.4 * bk) * (tt > T.badgeLand ? 0.9 + 0.1 * land : 1), rot: (1 - bk) * -25,
    };
  }

  function renderFrame(t) {
    const cam = cameraAt(t, T);
    const worldVisible = t < T.toNeurons + 1.1 || t > T.toStudio - 0.1;
    $('world').setAttribute('visibility', worldVisible ? 'visible' : 'hidden');
    if (worldVisible) {
      for (const [k, el] of Object.entries(layers)) el.setAttribute('transform', camera.layer(cam, DEPTH[k]));
      studio.update(t, svg);
      applyMascot(mascotPose(t, T));
      applyIcons(iconStates(t, T), t);
      const cl = prog(t, T.clean, T.clean + 0.8);
      $('clean').setAttribute('opacity', cl.toFixed(3));
      $('L-light').setAttribute('opacity', (1 - cl).toFixed(3));
      $('L-fg').setAttribute('opacity', (1 - cl).toFixed(3));
      $('clean-floor').setAttribute('cx', (960 + (mascotX(t, T) - cam.cx) * cam.zoom).toFixed(1));
    }

    const bw = badgeWorld(t);
    const [bx, by] = camera.project(cam, bw.x, bw.y);
    const state = { badgeScreen: { ...bw, x: bx, y: by, scale: bw.scale * cam.zoom } };
    const ctx = { t, cfg, root: svg, cam, camera, state,
      mascotScreen: camera.project(cam, mascotX(t, T), bodyY),
      irisTo: camera.project(cameraAt(T.toStudio + 0.8, T), HOME_X, bodyY) };

    overlays.update(t, ctx);
    neurons.update(t, ctx);
    endcard.update(t, ctx);
    const trail = [];
    if (t > T.badgeIn && t < T.badgeLand + 0.1) {
      for (let i = 1; i <= 4; i++) {
        const tt = t - i * 0.035, p = badgeWorld(tt);
        const [px, py] = camera.project(cameraAt(tt, T), p.x, p.y);
        trail.push([px, py, 1 - prog(t, T.badgeLand - 0.1, T.badgeLand + 0.1)]);
      }
    }
    const over = endcard.badgeOverride(t, state.badgeScreen);
    applyBadge({ t, discFade: 0, trail, ...state.badgeScreen, appear: prog(t, T.badgeIn, T.badgeIn + 0.1), ...(over || {}) });
    $('grain').setAttribute('transform', tr((t * 997) % 256 | 0, (t * 613) % 256 | 0));
  }

  return { cfg, T, renderFrame, duration: sb.duration, fps: sb.fps };
}
