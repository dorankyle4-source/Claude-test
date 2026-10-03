// NeuroPro 2026 year-to-date performance · stage / director.
// Same engine and motion style as the ADP recap, in NeuroPro's palette, type and logo.
//   1 open · 2 visits · 3 patients and mix · 4 revenue and margin · 5 per visit · 6 cash
//   7 act now · 8 clinical team · 9 Q4 outlook · end card

import { loadConfig, loadFonts } from '../../engine/config.js';
import { h, tr } from '../../engine/svg.js';
import { prog, lerp, inOutCubic } from '../../engine/anim.js';
import { buildTimeline } from './timeline.js';
import { W, H, C, makeKit } from './kit.js';
import { buildScenes } from './scenes.js';

export async function createStage(svg, comp = 'ytd') {
  const cfg = await loadConfig(comp);
  await loadFonts();
  const sb = cfg.storyboard;
  const T = buildTimeline(sb, cfg.timing);
  const K = makeKit(svg);
  const scenes = buildScenes(K, T, cfg);

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = [
    h('defs', {}, h('pattern', { id: 'grainPat', width: 256, height: 256, patternUnits: 'userSpaceOnUse' }, h('image', { id: 'grainImg', width: 256, height: 256 }))),
    h('rect', { width: W, height: H, fill: C.navy }),
    ...scenes.map((s) => h('g', { id: `cam-${s.id}`, visibility: 'hidden' }, s.markup)),
    // scene wipe: teal leading edge, navy panel
    h('g', { id: 'wipe', visibility: 'hidden' },
      h('polygon', { points: '40,0 170,0 50,1080 -80,1080', fill: C.teal }),
      h('polygon', { points: '150,0 2700,0 2580,1080 30,1080', fill: C.navy }),
      h('polygon', { points: '2690,0 2730,0 2610,1080 2570,1080', fill: C.coral })),
    h('rect', { id: 'grain', width: W, height: H, fill: 'url(#grainPat)', opacity: 0.04, style: 'mix-blend-mode:overlay', 'pointer-events': 'none' }),
  ].join('');

  { // film grain texture (same as the NeuroPro episodes)
    const cv = document.createElement('canvas'); cv.width = cv.height = 256;
    const g = cv.getContext('2d'), img = g.createImageData(256, 256);
    let seed = 1234567;
    for (let i = 0; i < img.data.length; i += 4) { seed = (seed * 16807) % 2147483647; img.data[i] = img.data[i + 1] = img.data[i + 2] = (seed / 2147483647) * 255; img.data[i + 3] = 255; }
    g.putImageData(img, 0, 0);
    svg.querySelector('#grainImg').setAttribute('href', cv.toDataURL());
  }

  const cams = scenes.map((s) => svg.querySelector(`#cam-${s.id}`));
  const wipe = svg.querySelector('#wipe');

  function renderFrame(t) {
    scenes.forEach((s, i) => {
      const on = t >= s.from && t < s.to;
      cams[i].setAttribute('visibility', on ? 'visible' : 'hidden');
      if (!on) return;
      // slow push-in per scene keeps static layouts alive
      const z = 1 + 0.028 * prog(t, s.from, s.to);
      cams[i].setAttribute('transform', `translate(${W / 2} ${H / 2}) scale(${z.toFixed(5)}) translate(${-W / 2} ${-H / 2})`);
      s.update(t);
    });
    const b = T.wipes.find((w) => Math.abs(t - w) < 0.4);
    if (b != null) {
      const k = prog(t, b - 0.4, b + 0.4, inOutCubic);
      wipe.setAttribute('visibility', 'visible');
      wipe.setAttribute('transform', tr(lerp(1980, -2800, k), 0));
    } else wipe.setAttribute('visibility', 'hidden');
    svg.querySelector('#grain').setAttribute('transform', tr((t * 997) % 256 | 0, (t * 613) % 256 | 0));
  }

  return { cfg, T, renderFrame, duration: sb.duration, fps: sb.fps };
}
