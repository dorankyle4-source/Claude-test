// EPISODE 4 — "Why Does Everything Feel So Loud?" · stage / director.
// Same mascot, badge, palette and end card as Episodes 1–3; new coffee-shop set, sensory-filter scene and volume knob.
//   1 hook (café overload) · 2–3 inside the brain (filter.js) · 4 giant knob joke · 5 takeaway at a café table · 6 end card

import { loadConfig, loadFonts } from '../../engine/config.js';
import { h, tr } from '../../engine/svg.js';
import { sharedDefs } from '../../engine/defs.js';
import { createCamera } from '../../engine/camera.js';
import { prog, lerp, outBack, inOutCubic, outCubic } from '../../engine/anim.js';
import { createMascot } from '../../characters/mascot.js';
import { createBadge } from '../../props/badge.js';
import { createEndCard } from '../ep01/endcard.js';
import { buildTimeline, overload } from './timeline.js';
import { mascotPose, cameraAt, knobState, mascotX, mascotY, MX, MX2, BODY_OFF, STAND_Y, TABLE, KNOB } from './acting.js';
import { createCafe } from './cafe.js';
import { createFilterScene } from './filter.js';
import { createOverlays } from './overlays.js';
import { pointerTip } from './knob.js';

const NAVY = '#0B1829';

export async function createStage(svg, comp = 'ep04') {
  const cfg = await loadConfig(comp);
  await loadFonts();
  const { brand, characters, storyboard: sb } = cfg;
  const c = brand.colors, W = sb.width, H = sb.height;
  const T = buildTimeline(sb, cfg.timing);

  const camera = createCamera({ keys: [{ t: 0, cx: 960, cy: 540, zoom: 1 }] }, W, H);
  const cafe = createCafe(brand);
  const mascot = createMascot(characters.mascot.palette);
  const L = brand.logoLayout;
  const badge = createBadge(brand, [L.icon[2] - L.icon[0], L.icon[3] - L.icon[1]]);
  const filter = createFilterScene(cfg, T);
  const overlays = createOverlays(cfg, T);
  const endcard = createEndCard(cfg, T);

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = [
    sharedDefs(c), cafe.defs,
    h('defs', {},
      h('radialGradient', { id: 'vignetteN', cx: 0.5, cy: 0.5, r: 0.8 },
        h('stop', { offset: 0.6, 'stop-color': '#0B2545', 'stop-opacity': 0 }), h('stop', { offset: 1, 'stop-color': '#0B2545', 'stop-opacity': 1 })),
      h('pattern', { id: 'grainPat', width: 256, height: 256, patternUnits: 'userSpaceOnUse' }, h('image', { id: 'grainImg', width: 256, height: 256 }))),
    h('rect', { width: W, height: H, fill: '#EADBCB' }),
    h('g', { id: 'world' },
      h('g', { id: 'L-far' }, cafe.far),
      h('g', { id: 'L-mid' }, cafe.mid),
      h('g', { id: 'L-chars' },
        // café chair (seated takeaway only)
        h('g', { id: 'chair', opacity: 0, transform: tr(MX2, 890) },
          h('rect', { x: -250, y: -300, width: 500, height: 330, rx: 70, fill: c.coral, stroke: NAVY, 'stroke-width': 8 }),
          h('rect', { x: -210, y: -262, width: 420, height: 60, rx: 30, fill: '#FFFFFF', opacity: 0.25 })),
        h('g', { id: 'mascot' }, mascot.markup),
        h('g', { transform: tr(TABLE.x, TABLE.y) }, cafe.table)),
      h('g', { id: 'L-light' }, cafe.light)),
    h('rect', { width: W, height: H, fill: 'url(#vignetteN)', opacity: 0.14 }),
    h('g', { id: 'screen' }, overlays.markup, filter.markup, endcard.screen, h('g', { id: 'badge' }, badge.markup)),
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
  const applyCafe = cafe.mount(svg);
  const applyBadge = badge.mount(svg.querySelector('#badge'));
  filter.mount(svg);
  overlays.mount(svg);
  endcard.mount?.(svg);

  const $ = (id) => svg.querySelector(`#${id}`);
  const layers = { far: $('L-far'), mid: $('L-mid'), chars: $('L-chars'), light: $('L-light') };
  const DEPTH = { far: 0.62, mid: 0.86, chars: 1, light: 0.9 };
  const BADGE_FROM = [2150, -140], PARK = [1830, 92], PARK_S = 0.36;

  // badge in screen space: flies in → rides the knob's pointer while turning it down → parks top-right
  function badgeScreen(tt) {
    const cam = cameraAt(tt, T), z = cam.zoom;
    const ks = knobState(tt, T), [dx, dy] = pointerTip(ks.level);
    const [tx, ty] = camera.project(cam, KNOB.x + dx * KNOB.scale, KNOB.y + dy * KNOB.scale);
    const onS = 0.55 * z;
    const fly = prog(tt, T.badgeIn, T.badgeLand, (x) => 1 - Math.pow(1 - x, 3));
    const land = tt > T.badgeLand ? outBack(prog(tt, T.badgeLand - 0.05, T.badgeLand + 0.35), 3) : 0;
    const park = prog(tt, T.calm + 0.45, T.calm + 1.2, inOutCubic);
    let x = lerp(BADGE_FROM[0], tx, fly), y = lerp(BADGE_FROM[1], ty, fly) - Math.sin(fly * Math.PI) * 120;
    let scale = lerp(0.8, onS, fly) * (tt > T.badgeLand ? 0.9 + 0.1 * land : 1), r = (1 - fly) * -25;
    if (tt > T.turn && tt < T.calm + 0.45) r = -360 * prog(tt, T.turn, T.calm) * 0.5;       // spins as it turns the dial
    if (park > 0) {
      x = lerp(x, PARK[0], park); y = lerp(y, PARK[1], park) - Math.sin(park * Math.PI) * 60;
      scale = lerp(scale, PARK_S, park); r = lerp(r, 0, park);
    }
    y += Math.sin(tt * 1.7) * 5 * prog(tt, T.calm + 1.2, T.calm + 1.6);
    return { x, y, scale, rot: r };
  }

  function renderFrame(t) {
    const cam = cameraAt(t, T);
    const worldVisible = t < T.toInside + 1.1 || t > T.toCafe - 0.1;
    $('world').setAttribute('visibility', worldVisible ? 'visible' : 'hidden');
    const O = overload(t, T);
    if (worldVisible) {
      for (const [k, el] of Object.entries(layers)) el.setAttribute('transform', camera.layer(cam, DEPTH[k]));
      const sit = t >= T.wipe;
      applyMascot(mascotPose(t, T));
      applyCafe({ t, light: O.light, espresso: O.espresso, talk: O.talk, blender: O.blender, tableK: sit ? 1 : 0 });
      $('chair').setAttribute('opacity', sit ? 1 : 0);
    }

    const bs = badgeScreen(t);
    const state = { badgeScreen: bs };
    const ctx = { t, cfg, root: svg, cam, camera, state,
      mascotScreen: camera.project(cam, mascotX(t, T), mascotY(t, T) + BODY_OFF),
      irisTo: camera.project(cameraAt(T.toCafe + 0.8, T), MX, STAND_Y + BODY_OFF) };

    overlays.update(t, ctx);
    filter.update(t, ctx);
    endcard.update(t, ctx);
    const trail = [];
    if (t > T.badgeIn && t < T.badgeLand + 0.1) {
      for (let i = 1; i <= 4; i++) {
        const p = badgeScreen(t - i * 0.035);
        trail.push([p.x, p.y, 1 - prog(t, T.badgeLand - 0.1, T.badgeLand + 0.1)]);
      }
    }
    const over = endcard.badgeOverride(t, bs);
    const hideInside = t > T.toInside && t < T.toCafe ? 0 : 1;
    applyBadge({ t, discFade: 0, trail, ...bs, appear: prog(t, T.badgeIn, T.badgeIn + 0.1) * hideInside, ...(over || {}) });
    $('grain').setAttribute('transform', tr((t * 997) % 256 | 0, (t * 613) % 256 | 0));
  }

  return { cfg, T, renderFrame, duration: sb.duration, fps: sb.fps };
}
