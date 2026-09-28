// Screen-space graphics for Episode 2. Same visual language as Episode 1: white rounded cards with soft
// shadows, navy text (Manrope), teal / coral / amber accents, teal uppercase section labels.

import { h, tr, rot, sc } from '../../engine/svg.js';
import { prog, outCubic, inCubic, outBack, inOutCubic, clamp, lerp, fnoise } from '../../engine/anim.js';
import { dayMeter } from './acting.js';

const NAVY = '#0B1829';

// mini brain-cell network for the "inside" half of the split screen (same look as the Episode 1 neuron view)
const MINI = [[140, 170], [330, 110], [520, 190], [690, 120], [230, 360], [440, 330], [640, 380], [150, 560], [360, 540], [580, 580], [720, 520]];
const MLINK = [[0, 1], [1, 2], [2, 3], [0, 4], [1, 5], [2, 5], [3, 6], [4, 5], [5, 6], [4, 7], [5, 8], [6, 9], [7, 8], [8, 9], [9, 10], [6, 10]];
const SLOW = [2, 5, 8, 12];

function card(id, w, hgt, inner, extra = {}) {
  return h('g', { id, opacity: 0, ...extra }, h('rect', { x: -w / 2, y: -hgt / 2, width: w, height: hgt, rx: 30, fill: '#FFFFFF', filter: 'url(#dropShadow)' }), inner);
}

export function createOverlays(cfg, T) {
  const c = cfg.brand.colors, F = cfg.brand.fonts;
  const eyebrow = (id, text) => h('text', { id, x: 110, y: 120, 'font-family': F.display, 'font-weight': 800, 'font-size': 30, fill: c.tealDeep, 'letter-spacing': 5, opacity: 0 }, text);
  const title = (x, y, text, size = 44, fill = NAVY, anchor = 'start') => h('text', { x, y, 'text-anchor': anchor, 'font-family': F.display, 'font-weight': 800, 'font-size': size, fill }, text);

  // activity props that crowd in around the brain (positions relative to the brain's screen centre)
  const ACT = [
    ['phone', -420, -250, h('g', {},
      h('rect', { x: -40, y: -70, width: 80, height: 140, rx: 16, fill: NAVY }),
      h('rect', { x: -32, y: -58, width: 64, height: 110, rx: 8, fill: c.cyan }),
      h('circle', { id: 'act-phone-badge', cx: 38, cy: -66, r: 18, fill: c.coral }),
      h('text', { x: 38, y: -59, 'text-anchor': 'middle', 'font-family': F.display, 'font-weight': 800, 'font-size': 20, fill: '#fff' }, '9'))],
    ['laptop', -470, 60, h('g', {},
      h('rect', { x: -90, y: -70, width: 180, height: 116, rx: 12, fill: NAVY }),
      h('rect', { x: -78, y: -58, width: 156, height: 92, rx: 6, fill: '#EAF4FA' }),
      ...[0, 1, 2].map((i) => h('rect', { x: -64, y: -44 + i * 26, width: 128 - i * 30, height: 12, rx: 6, fill: i === 0 ? c.teal : '#B9C9D9' })),
      h('path', { d: 'M-112,46 L112,46 L100,62 L-100,62Z', fill: '#B9C9D9', stroke: NAVY, 'stroke-width': 5, 'stroke-linejoin': 'round' }))],
    ['exercise', 430, 70, h('g', { transform: 'rotate(-20)' },
      h('rect', { x: -70, y: -8, width: 140, height: 16, rx: 8, fill: NAVY }),
      ...[-1, 1].map((sd) => h('g', {}, h('rect', { x: sd * 70 - 16, y: -42, width: 32, height: 84, rx: 10, fill: c.coral, stroke: NAVY, 'stroke-width': 5 }))))],
    ['lights', 400, -290, h('g', {},
      h('circle', { id: 'act-glow', r: 90, fill: '#FFE9A8', opacity: 0.6, filter: 'url(#blur14)' }),
      h('path', { d: 'M-34,10 C-50,-10 -44,-58 0,-60 C44,-58 50,-10 34,10 C26,20 24,28 22,38 L-22,38 C-24,28 -26,20 -34,10Z', fill: '#FFD45C', stroke: NAVY, 'stroke-width': 6, 'stroke-linejoin': 'round' }),
      h('rect', { x: -20, y: 40, width: 40, height: 22, rx: 6, fill: '#B9C9D9', stroke: NAVY, 'stroke-width': 5 }),
      h('path', { id: 'act-rays', d: [0, 40, 80, 120, 160, 200, 240, 280, 320].map((a) => { const r = ((a - 90) * Math.PI) / 180; return `M${(Math.cos(r) * 78).toFixed(1)},${(Math.sin(r) * 78 - 14).toFixed(1)} L${(Math.cos(r) * 104).toFixed(1)},${(Math.sin(r) * 104 - 14).toFixed(1)}`; }).join(' '), stroke: c.amber, 'stroke-width': 8, 'stroke-linecap': 'round' }))],
    ['talk', 20, -470, h('g', {},
      ...[[-150, 0, 'blah blah'], [150, -30, 'and then…'], [0, -90, '?!']].map(([x, y, txt], i) => h('g', { id: `act-talk${i}`, transform: tr(x, y) },
        h('rect', { x: -110, y: -40, width: 220, height: 80, rx: 40, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 5 }),
        h('path', { d: 'M-20,38 L-34,62 L4,40', fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 5, 'stroke-linejoin': 'round' }),
        h('text', { y: 12, 'text-anchor': 'middle', 'font-family': F.display, 'font-weight': 700, 'font-size': 32, fill: NAVY }, txt))))],
  ];

  const miniLinks = MLINK.map(([a, b], i) => {
    const [x1, y1] = MINI[a], [x2, y2] = MINI[b], mx = (x1 + x2) / 2 + (i % 2 ? 18 : -18), my = (y1 + y2) / 2 + (i % 2 ? -14 : 14);
    return [x1, y1, mx, my, x2, y2];
  });
  const qpt = ([x1, y1, cx, cy, x2, y2], u) => [(1 - u) ** 2 * x1 + 2 * (1 - u) * u * cx + u * u * x2, (1 - u) ** 2 * y1 + 2 * (1 - u) * u * cy + u * u * y2];

  // recovery graph: trends upward with ups and downs
  const GP = [[0, 150], [60, 118], [110, 140], [170, 92], [220, 124], [280, 70], [330, 100], [390, 52], [440, 70], [500, 30]];
  const graphD = 'M' + GP.map((p) => p.join(',')).join(' L');

  const markup = h('g', { id: 'ov2' },
    h('rect', { id: 'ov-bright', width: 1920, height: 1080, fill: '#FFF8E1', opacity: 0 }),
    // 1 · bubble
    h('g', { id: 'ov-fine', opacity: 0 },
      h('path', { d: 'M-250,-70 Q-250,-110 -210,-110 L210,-110 Q250,-110 250,-70 L250,10 Q250,50 210,50 L-60,50 L-120,100 L-100,50 L-210,50 Q-250,50 -250,10Z', fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 7, 'stroke-linejoin': 'round' }),
      h('text', { y: -14, 'text-anchor': 'middle', 'font-family': F.display, 'font-weight': 800, 'font-size': 46, fill: NAVY }, 'I thought I was fine…')),
    eyebrow('ov-e2', 'YOU CAN LOOK FINE'), eyebrow('ov-e4', 'WHY YOU FEEL IT'), eyebrow('ov-e5', 'SYMPTOMS CAN FLUCTUATE'),
    eyebrow('ov-e6', 'WHY THIS MATTERS'), eyebrow('ov-e7', 'WHAT TO DO'),
    // 2 · split: OUTSIDE (the studio) | INSIDE (a slower network)
    h('g', { id: 'sp-out', opacity: 0, transform: 'translate(110 200)' },
      h('rect', { x: 0, y: -40, width: 230, height: 70, rx: 35, fill: '#FFFFFF', filter: 'url(#dropShadow)' }),
      h('circle', { cx: 36, cy: -5, r: 11, fill: c.teal }),
      title(60, 7, 'OUTSIDE', 32)),
    h('path', { id: 'sp-link', fill: 'none', stroke: NAVY, 'stroke-width': 4, 'stroke-dasharray': '8 10', 'stroke-linecap': 'round', opacity: 0 }),
    h('g', { id: 'sp-in', opacity: 0 },
      h('defs', {},
        h('radialGradient', { id: 'sp-bg', cx: 0.5, cy: 0.45, r: 0.8 }, h('stop', { offset: 0, 'stop-color': '#17406E' }), h('stop', { offset: 1, 'stop-color': '#07182F' })),
        h('clipPath', { id: 'sp-clip' }, h('rect', { x: 0, y: 0, width: 840, height: 720, rx: 40 }))),
      h('g', { transform: 'translate(1010 190)' },
        h('rect', { x: 0, y: 0, width: 840, height: 720, rx: 40, fill: 'url(#sp-bg)', filter: 'url(#dropShadow)' }),
        h('g', { 'clip-path': 'url(#sp-clip)', transform: 'translate(0 40)' },
          h('g', { fill: 'none', 'stroke-width': 5, 'stroke-linecap': 'round' }, ...miniLinks.map(([x1, y1, cx, cy, x2, y2], i) =>
            h('path', { id: `sp-l${i}`, d: `M${x1},${y1} Q${cx},${cy} ${x2},${y2}`, stroke: SLOW.includes(i) ? '#8C7FD1' : c.teal, opacity: 0.6, 'stroke-dasharray': SLOW.includes(i) ? '10 14' : 'none' }))),
          h('g', { color: c.cyan }, ...MINI.map(([x, y], i) => h('g', { transform: tr(x, y) },
            h('circle', { r: 22, fill: 'currentColor', opacity: 0.22 }), h('circle', { r: 14, fill: i % 4 === 1 ? '#B9A3FF' : 'currentColor' }), h('circle', { r: 5.5, fill: '#fff', opacity: 0.85 })))),
          h('g', { filter: 'url(#glow)' }, ...miniLinks.map((_, i) => h('circle', { id: `sp-s${i}`, r: 7, fill: '#FFFFFF' })))),
        h('g', { transform: 'translate(40 -30)' },
          h('rect', { x: 0, y: -40, width: 210, height: 70, rx: 35, fill: '#FFFFFF', filter: 'url(#dropShadow)' }),
          h('circle', { cx: 36, cy: -5, r: 11, fill: c.violet }),
          title(60, 7, 'INSIDE', 32)),
        h('text', { id: 'sp-note', x: 420, y: 680, 'text-anchor': 'middle', 'font-family': F.body, 'font-weight': 500, 'font-size': 32, fill: '#FFFFFF', opacity: 0 }, 'Signals moving less efficiently'))),
    // 5 · good day / bad day meter (follows the brain) + recovery graph
    h('g', { id: 'mt', opacity: 0 },
      h('defs', {}, h('linearGradient', { id: 'mt-g', x1: 0, y1: 0, x2: 1, y2: 0 },
        h('stop', { offset: 0, 'stop-color': c.coral }), h('stop', { offset: 0.5, 'stop-color': c.amber }), h('stop', { offset: 1, 'stop-color': c.teal }))),
      h('rect', { x: -230, y: -18, width: 460, height: 36, rx: 18, fill: 'url(#mt-g)', stroke: NAVY, 'stroke-width': 6 }),
      h('text', { x: -230, y: 58, 'font-family': F.display, 'font-weight': 800, 'font-size': 22, fill: NAVY, 'letter-spacing': 2 }, 'BAD DAY'),
      h('text', { x: 230, y: 58, 'text-anchor': 'end', 'font-family': F.display, 'font-weight': 800, 'font-size': 22, fill: NAVY, 'letter-spacing': 2 }, 'GOOD DAY'),
      h('g', { id: 'mt-n' },
        h('circle', { r: 30, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 7 }),
        h('path', { id: 'mt-face', fill: 'none', stroke: NAVY, 'stroke-width': 5, 'stroke-linecap': 'round' }),
        h('circle', { cx: -9, cy: -6, r: 4, fill: NAVY }), h('circle', { cx: 9, cy: -6, r: 4, fill: NAVY })),
      h('g', { id: 'mt-tag' },
        h('rect', { id: 'mt-tagBg', x: -100, y: -122, width: 200, height: 58, rx: 29, fill: c.teal }),
        h('text', { id: 'mt-tagT', y: -83, 'text-anchor': 'middle', 'font-family': F.display, 'font-weight': 800, 'font-size': 28, fill: '#FFFFFF', 'letter-spacing': 2 }, 'GOOD DAY'))),
    card('gr', 640, 330, h('g', {},
      title(-280, -100, 'Recovery isn’t always linear.', 34),
      h('g', { transform: 'translate(-250 -60)' },
        h('path', { d: 'M0,0 L0,170 L520,170', fill: 'none', stroke: '#B9C9D9', 'stroke-width': 4 }),
        h('path', { id: 'gr-line', d: graphD, fill: 'none', stroke: c.teal, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round', pathLength: 1, 'stroke-dasharray': '0 1' }),
        h('circle', { id: 'gr-dot', r: 11, fill: c.coral, stroke: '#fff', 'stroke-width': 4 }),
        h('text', { x: 0, y: 200, 'font-family': F.body, 'font-weight': 500, 'font-size': 22, fill: '#6B7482' }, 'Days / weeks →'))), { transform: 'translate(1420 330)' }),
    // 6 · activities + reassurance
    h('g', { id: 'act' }, ...ACT.map(([id, , , g]) => h('g', { id: `act-${id}`, opacity: 0 }, h('circle', { r: 110, fill: '#FFFFFF', opacity: 0.9, filter: 'url(#dropShadow)' }), g))),
    ...[['rs1', 'Not necessarily new damage', 'A flare-up can mean your brain needs care', h('g', {},
        h('path', { d: 'M0,-54 L44,-36 L44,4 C44,34 22,50 0,58 C-22,50 -44,34 -44,4 L-44,-36Z', fill: c.teal }),
        h('path', { d: 'M-18,2 l12,12 l26,-28', stroke: '#fff', 'stroke-width': 9, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }))],
      ['rs2', 'More time + the right plan', 'A recovery strategy that fits you', h('g', {},
        h('path', { d: 'M-34,-54 L34,-54 L34,-44 C34,-20 8,-10 8,0 C8,10 34,20 34,44 L34,54 L-34,54 L-34,44 C-34,20 -8,10 -8,0 C-8,-10 -34,-20 -34,-44Z', fill: 'none', stroke: NAVY, 'stroke-width': 7, 'stroke-linejoin': 'round' }),
        h('path', { id: 'rs-sand', d: 'M-22,46 L22,46 L0,24Z', fill: c.amber }))]].map(([id, t1, t2, icon]) =>
      h('g', { id, opacity: 0 },
        h('rect', { x: 0, y: -70, width: 680, height: 140, rx: 30, fill: '#FFFFFF', filter: 'url(#dropShadow)' }),
        h('g', { transform: 'translate(80 0)' }, icon),
        title(150, -6, t1, 35), h('text', { x: 150, y: 34, 'font-family': F.body, 'font-weight': 500, 'font-size': 25, fill: '#4A5363' }, t2))),
    // 7 · REST / RECOVER / GET EVALUATED
    ...[['tk1', 'REST', 'Give your brain a break', h('g', {},
        h('path', { d: 'M18,-50 C-16,-46 -38,-20 -38,8 C-38,38 -12,56 16,56 C38,56 52,44 58,30 C18,40 -8,10 4,-22 C8,-34 12,-44 18,-50Z', fill: c.violet }),
        h('text', { x: 30, y: -18, 'font-family': F.display, 'font-weight': 800, 'font-size': 30, fill: NAVY }, 'z'))],
      ['tk2', 'RECOVER', 'The right strategy, step by step', h('g', {},
        h('rect', { x: -50, y: -30, width: 88, height: 60, rx: 12, fill: 'none', stroke: NAVY, 'stroke-width': 7 }),
        h('rect', { x: 40, y: -12, width: 12, height: 24, rx: 4, fill: NAVY }),
        h('rect', { id: 'tk-charge', x: -40, y: -20, width: 68, height: 40, rx: 6, fill: c.teal }),
        h('path', { d: 'M-2,-26 L-18,4 L-4,4 L-10,28 L12,-6 L-2,-6Z', fill: '#fff', stroke: NAVY, 'stroke-width': 3, 'stroke-linejoin': 'round' }))],
      ['tk3', 'GET EVALUATED', 'Find out what your brain needs', h('g', {},
        h('rect', { x: -44, y: -54, width: 88, height: 108, rx: 12, fill: c.teal }),
        h('rect', { x: -22, y: -64, width: 44, height: 22, rx: 8, fill: NAVY }),
        h('path', { d: 'M-22,4 l14,14 l30,-32', stroke: '#FFFFFF', 'stroke-width': 10, fill: 'none', 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }))]].map(([id, t1, t2, icon]) =>
      h('g', { id, opacity: 0 },
        h('rect', { x: 0, y: -70, width: 640, height: 140, rx: 30, fill: '#FFFFFF', filter: 'url(#dropShadow)' }),
        h('g', { transform: 'translate(80 0)' }, icon),
        title(160, -4, t1, 44), h('text', { x: 160, y: 38, 'font-family': F.body, 'font-weight': 500, 'font-size': 26, fill: '#4A5363' }, t2))),
  );

  return {
    markup,
    update(t, ctx) {
      const $ = (id) => ctx.root.querySelector(`#${id}`), set = (id, a, v) => $(id).setAttribute(a, v);
      const [mx, my] = ctx.mascotScreen;   // brain body centre on screen

      // bubble
      const fine = outBack(prog(t, T.bubbleIn, T.bubbleIn + 0.35), 2), fineOut = prog(t, T.bubbleOut - 0.25, T.bubbleOut);
      set('ov-fine', 'opacity', (prog(t, T.bubbleIn, T.bubbleIn + 0.1) * (1 - fineOut)).toFixed(3));
      set('ov-fine', 'transform', `translate(${mx + 300} ${my - 330}) ${sc(fine * (1 - fineOut * 0.3))}`);

      // eyebrows
      const eb = (id, a, b) => set(id, 'opacity', (prog(t, a, a + 0.4) * (1 - prog(t, b - 0.3, b))).toFixed(3));
      eb('ov-e2', T.split + 0.6, T.toNeurons); eb('ov-e4', T.toStudio + 0.6, T.feelClear + 0.2); eb('ov-e5', T.walkStart + 0.2, T.flucEnd);
      eb('ov-e6', T.ovStart + 0.3, T.clean); eb('ov-e7', T.clean + 0.4, T.badgeIn);

      // split
      const sp = outCubic(prog(t, T.split + 0.3, T.split + 0.9)), spOut = prog(t, T.toNeurons - 0.4, T.toNeurons, inCubic);
      const vis = sp * (1 - spOut);
      set('sp-in', 'opacity', vis.toFixed(3));
      set('sp-in', 'transform', tr((1 - sp) * 500, 0));
      set('sp-out', 'opacity', (prog(t, T.split + 0.5, T.split + 0.9) * (1 - spOut)).toFixed(3));
      const lk = prog(t, T.outsideCue - 0.2, T.outsideCue + 0.4, outCubic);
      set('sp-link', 'opacity', (lk * (1 - spOut)).toFixed(3));
      const lx0 = mx + 160, ly0 = my - 120, lx1 = lerp(lx0, 1010, lk), ly1 = lerp(ly0, 480, lk);
      set('sp-link', 'd', `M${lx0.toFixed(1)},${ly0.toFixed(1)} Q${((lx0 + lx1) / 2).toFixed(1)},${(ly0 - 120).toFixed(1)} ${lx1.toFixed(1)},${ly1.toFixed(1)}`);
      set('sp-note', 'opacity', prog(t, T.outsideCue, T.outsideCue + 0.5).toFixed(3));
      if (vis > 0) miniLinks.forEach((cv, i) => {
        const slow = SLOW.includes(i);
        let u = ((t * (slow ? 0.18 : 0.55) + i * 0.37) % 1);
        if (slow && i % 2 === 0) u = Math.min(u, 0.45 + Math.sin(t * 6 + i) * 0.03);
        const [px, py] = qpt(cv, u);
        set(`sp-s${i}`, 'cx', (px + (slow ? fnoise(t * 6, i) * 5 : 0)).toFixed(1)); set(`sp-s${i}`, 'cy', py.toFixed(1));
        set(`sp-s${i}`, 'opacity', (Math.sin(u * Math.PI) * (slow ? 0.55 : 1)).toFixed(2));
        set(`sp-s${i}`, 'fill', slow ? '#FFD28A' : '#FFFFFF');
      });

      // meter over the brain + graph card
      const m = dayMeter(t, T);
      const mIn = outBack(prog(t, T.meterIn, T.meterIn + 0.4), 1.6), mOut = prog(t, T.flucEnd - 0.5, T.flucEnd - 0.1, inCubic);
      set('mt', 'opacity', (prog(t, T.meterIn, T.meterIn + 0.15) * (1 - mOut)).toFixed(3));
      set('mt', 'transform', `translate(${mx.toFixed(1)} ${(my - 360).toFixed(1)}) ${sc(mIn)}`);
      set('mt-n', 'transform', tr(lerp(-200, 200, m), 0));
      const sm = lerp(-8, 8, m);
      set('mt-face', 'd', `M-11,${(10 - sm * 0.2).toFixed(1)} Q0,${(10 + sm).toFixed(1)} 11,${(10 - sm * 0.2).toFixed(1)}`);
      set('mt-tag', 'transform', tr(lerp(-200, 200, m), 0));
      set('mt-tagBg', 'fill', m > 0.5 ? c.teal : c.coral);
      $('mt-tagT').textContent = m > 0.5 ? 'GOOD DAY' : 'BAD DAY';
      const gk = outBack(prog(t, T.linear, T.linear + 0.4), 1.5), gOut = prog(t, T.flucEnd - 0.4, T.flucEnd, inCubic);
      set('gr', 'opacity', (prog(t, T.linear, T.linear + 0.15) * (1 - gOut)).toFixed(3));
      set('gr', 'transform', `translate(1420 330) ${sc(0.9 + 0.1 * gk)}`);
      const draw = prog(t, T.linear + 0.3, T.flucEnd - 1.0);
      set('gr-line', 'stroke-dasharray', `${draw.toFixed(4)} 1`);
      const seg = Math.min(GP.length - 2, Math.floor(draw * (GP.length - 1))), f = draw * (GP.length - 1) - seg;
      set('gr-dot', 'cx', lerp(GP[seg][0], GP[seg + 1][0], f).toFixed(1)); set('gr-dot', 'cy', lerp(GP[seg][1], GP[seg + 1][1], f).toFixed(1));

      // overload
      const ats = { phone: T.phone, laptop: T.laptop, exercise: T.exercise, lights: T.lights, talk: T.talk };
      const over = prog(t, T.laptop, T.peak), calm = prog(t, T.calm - 0.2, T.calm + 0.9, inOutCubic);
      ACT.forEach(([id, dx, dy], i) => {
        const k = outBack(prog(t, ats[id], ats[id] + 0.35), 2);
        const jit = over * (1 - calm) * 10;
        const drift = calm * 140;
        const ax = mx + dx + fnoise(t * 9, i) * jit + Math.sign(dx || 1) * drift, ay = my + dy + fnoise(t * 9, i + 5) * jit - drift * 0.6;
        set(`act-${id}`, 'opacity', (prog(t, ats[id], ats[id] + 0.12) * (1 - calm)).toFixed(3));
        set(`act-${id}`, 'transform', `translate(${ax.toFixed(1)} ${ay.toFixed(1)}) ${rot(Math.sin(t * (3 + over * 8) + i) * (3 + over * 8))} ${sc(k * (1 - calm * 0.5) * (1 + over * 0.08))}`);
      });
      set('act-phone-badge', 'transform', sc(1 + Math.max(0, Math.sin(t * 12)) * 0.25));
      set('act-rays', 'opacity', (0.6 + 0.4 * Math.sin(t * 20)).toFixed(2));
      set('act-glow', 'opacity', (0.5 + over * 0.4).toFixed(2));
      for (let i = 0; i < 3; i++) set(`act-talk${i}`, 'opacity', (prog(t, T.talk + i * 0.25, T.talk + i * 0.25 + 0.2)).toFixed(2));
      const flick = t > T.lights && t < T.calm ? 0.06 * Math.max(0, Math.sin(t * 17)) : 0;
      set('ov-bright', 'opacity', ((over * 0.32 + flick) * (1 - calm)).toFixed(3));

      for (const [id, at] of [['rs1', T.note], ['rs2', T.moreTime]]) {
        const k = outBack(prog(t, at, at + 0.4), 1.5), out = prog(t, T.clean - 0.4, T.clean, inCubic);
        set(id, 'opacity', (prog(t, at, at + 0.15) * (1 - out)).toFixed(3));
        set(id, 'transform', `translate(${(1200 + (1 - k) * 80).toFixed(1)} ${id === 'rs1' ? 420 : 600})`);
      }
      set('rs-sand', 'transform', `translate(0 ${(-Math.min(1, prog(t, T.moreTime, T.moreTime + 2)) * 10).toFixed(1)})`);

      // takeaway cards (left side; the brain stands on the right)
      for (const [id, at, y] of [['tk1', T.rest, 330], ['tk2', T.recover, 510], ['tk3', T.evaluate, 690]]) {
        const k = outBack(prog(t, at, at + 0.4), 1.5), out = prog(t, T.badgeIn - 0.3, T.badgeIn + 0.1, inCubic);
        set(id, 'opacity', (prog(t, at, at + 0.15) * (1 - out)).toFixed(3));
        set(id, 'transform', `translate(${(110 - (1 - k) * 80 - out * 200).toFixed(1)} ${y})`);
      }
      set('tk-charge', 'width', (68 * (0.3 + 0.7 * ((t * 0.8) % 1))).toFixed(1));
    },
  };
}
