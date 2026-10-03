// ADP SBS Digital Sales — post-presentation recap · stage / director.
// Same engine as the NeuroPro series (pure function of time, frame-accurate render), styled like the ADP case deck.
//   1 open · 2 diagnosis (not demand, capacity) · 3 sizing the prize · 4 four priorities + one dashboard
//   5 economics · 6 first 90 days · 7 five decisions + thank-you end card

import { loadConfig, loadFonts } from '../../engine/config.js';
import { h, tr } from '../../engine/svg.js';
import { prog, lerp, inOutCubic } from '../../engine/anim.js';
import { buildTimeline } from './timeline.js';
import { W, H, C, makeKit } from './kit.js';
import { buildScenes } from './scenes.js';

export async function createStage(svg, comp = 'adp') {
  const cfg = await loadConfig(comp);
  await loadFonts();
  await Promise.all(['600 40px "Source Serif 4"', '500 40px "Source Serif 4"', 'italic 400 40px "Source Serif 4"',
    '400 40px "Public Sans"', '600 40px "Public Sans"', '700 40px "Public Sans"'].map((f) => document.fonts.load(f)));
  const sb = cfg.storyboard;
  const T = buildTimeline(sb, cfg.timing);
  const K = makeKit(svg);
  const scenes = buildScenes(K, T, cfg);

  svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
  svg.innerHTML = [
    h('defs', {}, h('pattern', { id: 'grainPat', width: 256, height: 256, patternUnits: 'userSpaceOnUse' }, h('image', { id: 'grainImg', width: 256, height: 256 }))),
    h('rect', { width: W, height: H, fill: C.navy }),
    ...scenes.map((s) => h('g', { id: `cam-${s.id}`, display: 'none' }, s.markup)),
    // scene wipe: ADP red leading edge, navy panel
    h('g', { id: 'wipe', visibility: 'hidden' },
      h('polygon', { points: '40,0 170,0 50,1080 -80,1080', fill: C.red }),
      h('polygon', { points: '150,0 2700,0 2580,1080 30,1080', fill: C.navy }),
      h('polygon', { points: '2690,0 2730,0 2610,1080 2570,1080', fill: C.pink })),
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
      cams[i].setAttribute('display', on ? 'inline' : 'none'); // display, not visibility: a child's own visibility='visible' would show through
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
