// SECTION 2 — "What is a concussion?" Simplified, non-gory anatomy: head profile, skull, protective fluid,
// and the NeuroPro Brain inside. Bumps, blows, jolts and a hit to the body move the head; the brain lags,
// presses gently against the skull, rebounds, then settles back into place.

import { h, tr, rot, sc } from '../../engine/svg.js';
import { prog, outCubic, inOutCubic, outBack, clamp, lerp, fnoise } from '../../engine/anim.js';
import { MASCOT_OUTLINE, FOLDS } from '../../characters/mascot.js';

const HEAD = 'M-250,-40 C-270,-200 -150,-320 20,-320 C180,-320 280,-210 285,-60 C288,-20 300,10 320,40 L335,85 C338,100 325,108 305,110 ' +
  'C310,130 305,150 295,160 C300,175 295,195 280,205 C250,240 200,250 170,245 L160,330 C230,350 330,370 380,430 L400,640 L-360,640 L-340,430 ' +
  'C-300,360 -170,345 -110,330 C-120,250 -170,190 -210,130 C-245,80 -250,20 -250,-40Z';
const CRANIUM = 'M-215,-40 C-230,-180 -130,-285 20,-285 C165,-285 250,-190 250,-60 C250,20 230,70 190,95 C120,130 -100,135 -170,90 C-205,60 -215,20 -215,-40Z';
const BRAIN_C = [15, -80], BRAIN_S = 0.7;   // brain centre + scale inside the cranium
const NAVY = '#0B1829';

function chip(id, text, color) {
  return h('g', { id, opacity: 0 },
    h('rect', { class: 'chip-bg', x: 0, y: -34, width: 20 + text.length * 26, height: 68, rx: 34, fill: '#FFFFFF', filter: 'url(#dropShadow)' }),
    h('circle', { cx: 34, cy: 0, r: 11, fill: color }),
    h('text', { class: 'chip-t', x: 58, y: 12, 'font-family': 'Manrope', 'font-weight': 800, 'font-size': 32, fill: NAVY, 'letter-spacing': 1.5 }, text));
}

export function createAnatomy(cfg, T) {
  const c = cfg.brand.colors;
  const HX = 820, HY = 560, HS = 1.12;   // head placement on screen

  const markup = h('g', { id: 'an-root', opacity: 0 },
    h('defs', {},
      h('linearGradient', { id: 'an-bg', x1: 0, y1: 0, x2: 0, y2: 1 },
        h('stop', { offset: 0, 'stop-color': '#EAF4FA' }), h('stop', { offset: 1, 'stop-color': '#DCEAF3' })),
      h('clipPath', { id: 'an-iris' }, h('circle', { id: 'an-irisC', r: 0 })),
      h('clipPath', { id: 'an-cran' }, h('path', { d: CRANIUM })),
      h('clipPath', { id: 'an-bclip' }, h('path', { d: MASCOT_OUTLINE })),
      h('radialGradient', { id: 'an-fluid', cx: 0.5, cy: 0.45, r: 0.6 },
        h('stop', { offset: 0, 'stop-color': '#E3F4FB' }), h('stop', { offset: 1, 'stop-color': '#BFE3F3' })),
    ),
    h('g', { 'clip-path': 'url(#an-iris)' },
      h('rect', { width: 1920, height: 1080, fill: 'url(#an-bg)' }),
      h('g', { opacity: 0.5 }, ...Array.from({ length: 12 }, (_, i) => h('path', { d: `M0,${90 * i} L1920,${90 * i}`, stroke: '#CFE0EC', 'stroke-width': 1.5 }))),
      h('g', { id: 'an-cam' },
        // ball for the "bump"
        h('g', { id: 'an-ball', opacity: 0 },
          h('circle', { r: 48, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 7 }),
          h('path', { d: 'M-34,-18 Q0,10 34,-18 M-30,26 Q0,0 30,26', stroke: c.coral, 'stroke-width': 6, fill: 'none' })),
        h('g', { id: 'an-head' },
          h('path', { d: HEAD, fill: '#F3D9C6', stroke: NAVY, 'stroke-width': 8, 'stroke-linejoin': 'round' }),
          h('path', { d: 'M170,245 L160,330 C230,350 330,370 380,430 L400,640 L-360,640 L-340,430 C-300,360 -170,345 -110,330 L-100,300 Z', fill: c.navy, opacity: 0.9 }),
          h('path', { d: 'M-40,300 C0,320 90,320 150,300', stroke: '#E4C3AC', 'stroke-width': 6, fill: 'none', 'stroke-linecap': 'round' }),
          h('ellipse', { cx: 240, cy: 0, rx: 10, ry: 13, fill: NAVY }),
          // skull + fluid
          h('path', { d: CRANIUM, fill: 'url(#an-fluid)', stroke: '#F4EEE3', 'stroke-width': 26 }),
          h('path', { d: CRANIUM, fill: 'none', stroke: '#D9CCB6', 'stroke-width': 4, transform: 'scale(1.06) translate(0 3)', opacity: 0.8 }),
          h('g', { 'clip-path': 'url(#an-cran)' },
            h('g', { id: 'an-ripples', fill: 'none', stroke: '#9FD4EA', 'stroke-width': 3, opacity: 0 },
              h('path', { d: 'M-200,-40 q20,-12 40,0 t40,0', transform: 'translate(0 -60)' }),
              h('path', { d: 'M150,-60 q20,-12 40,0 t40,0' }), h('path', { d: 'M-60,80 q20,-12 40,0 t40,0' })),
            h('g', { id: 'an-ghosts' }, ...[0, 1].map((i) => h('path', { id: `an-ghost${i}`, d: MASCOT_OUTLINE, fill: '#FC9D7B', opacity: 0 }))),
            h('g', { id: 'an-brain' },
              h('path', { d: MASCOT_OUTLINE, fill: '#FC9D7B', stroke: NAVY, 'stroke-width': 10 }),
              h('g', { 'clip-path': 'url(#an-bclip)' },
                h('ellipse', { cx: -70, cy: -110, rx: 150, ry: 70, fill: '#FFC2A8', opacity: 0.45 }),
                h('g', { fill: 'none', stroke: '#DC6446', 'stroke-width': 10, 'stroke-linecap': 'round' }, ...FOLDS.map((d) => h('path', { d })))),
              h('g', { id: 'an-eyes' },
                h('ellipse', { id: 'an-eyeL', cx: 40, cy: -30, rx: 20, ry: 28, fill: NAVY }),
                h('ellipse', { id: 'an-eyeR', cx: 140, cy: -30, rx: 20, ry: 28, fill: NAVY }),
                h('circle', { cx: 47, cy: -42, r: 7, fill: '#fff' }), h('circle', { cx: 147, cy: -42, r: 7, fill: '#fff' })),
            ),
          ),
        ),
        h('g', { id: 'an-burst', opacity: 0 },
          ...Array.from({ length: 8 }, (_, i) => h('path', { d: `M0,-30 L0,-62`, transform: `rotate(${i * 45})`, stroke: c.amber, 'stroke-width': 9, 'stroke-linecap': 'round' })),
          h('circle', { r: 20, fill: c.amber, opacity: 0.6 })),
        h('g', { id: 'an-lines', stroke: c.teal, 'stroke-width': 7, 'stroke-linecap': 'round', opacity: 0 },
          h('path', { d: 'M-330,-120 L-420,-120 M-340,-60 L-460,-60 M-330,0 L-420,0' }),
          h('path', { d: 'M420,-120 L480,-120 M430,-60 L520,-60 M420,0 L480,0' })),
        // labels (head coordinates)
        h('g', { transform: 'translate(820 560) scale(1.12)' }, ...[['sk', 'Skull', -150, -250, -290, -165], ['fl', 'Protective fluid', 232, -110, 420, -235], ['br', 'Brain', -120, -40, -360, 110]].map(([k, text, px, py, lx, ly]) =>
          h('g', { id: `an-lab-${k}`, opacity: 0 },
            h('path', { d: `M${px},${py} L${lx + (lx < px ? 12 : -12)},${ly - 12}`, stroke: NAVY, 'stroke-width': 3, 'stroke-dasharray': '6 6' }),
            h('circle', { cx: px, cy: py, r: 7, fill: NAVY }),
            h('text', { x: lx, y: ly, 'text-anchor': lx < px ? 'end' : 'start', 'font-family': 'Manrope', 'font-weight': 700, 'font-size': 34, fill: NAVY }, text)))),
      ),
      // screen-space overlays
      h('text', { id: 'an-eyebrow', x: 110, y: 120, 'font-family': 'Manrope', 'font-weight': 800, 'font-size': 30, fill: c.tealDeep, 'letter-spacing': 5, opacity: 0 }, 'WHAT IS A CONCUSSION?'),
      h('g', { id: 'an-def', opacity: 0 },
        h('text', { x: 110, y: 190, 'font-family': 'Manrope', 'font-weight': 800, 'font-size': 58, fill: NAVY }, 'A type of brain injury')),
      h('g', { transform: 'translate(1420 330)' },
        h('g', { id: 'an-c0', transform: 'translate(0 0)' }, chip('an-chip0', 'BUMP', c.coral)),
        h('g', { id: 'an-c1', transform: 'translate(0 100)' }, chip('an-chip1', 'BLOW', c.amber)),
        h('g', { id: 'an-c2', transform: 'translate(0 200)' }, chip('an-chip2', 'JOLT', c.violet)),
        h('g', { id: 'an-c3', transform: 'translate(0 300)' }, chip('an-chip3', 'HIT TO THE BODY', c.teal))),
    ),
  );

  // Impulses: [time, direction x, direction y, head amplitude, kind]
  const IMP = [
    [T.bump, 1, 0, 34, 'bump'], [T.blow, -1, 0.1, 38, 'blow'], [T.jolt2, 0, 1, 26, 'jolt'],
    [T.bodyHit + 0.15, -1, 0, 30, 'body'], [T.rapid, 1, 0, 42, 'rapid'], [T.rapid + 0.5, -1, 0, 36, 'rapid'],
  ];
  const headResp = (u) => (u <= 0 ? 0 : Math.sin(Math.min(u / 0.12, 1) * Math.PI / 2) * Math.exp(-u * 4.5));
  const brainResp = (u) => (u <= 0 ? 0 : -Math.exp(-u * 3.2) * Math.sin(u * Math.PI * 2 * 1.5 + 0.2) * 1.15);

  return {
    markup,
    mount(svg) {
      // size each chip's pill to its real (loaded-font) text width, with even padding on both sides
      for (let i = 0; i < 4; i++) {
        const g = svg.querySelector(`#an-chip${i}`);
        const w = g.querySelector('.chip-t').getComputedTextLength();
        g.querySelector('.chip-bg').setAttribute('width', (58 + w + 30).toFixed(1));
      }
    },
    update(t, ctx) {
      const $ = (id) => ctx.root.querySelector(`#${id}`), set = (id, a, v) => $(id).setAttribute(a, v);
      const open = prog(t, T.toAnatomy + 0.35, T.toAnatomy + 1.0, inOutCubic);
      const visible = t > T.toAnatomy + 0.3 && t < T.toNeurons + 1.0;
      set('an-root', 'opacity', visible ? 1 : 0);
      if (!visible) return;
      const [ix, iy] = ctx.irisFrom ?? [960, 540];
      set('an-irisC', 'cx', ix); set('an-irisC', 'cy', iy);
      set('an-irisC', 'r', (open * 2300).toFixed(1));

      // camera: zoom out to show the shoulders for the body hit, then zoom into the brain for the next section
      const zoomOut = prog(t, T.bodyHit - 0.6, T.bodyHit - 0.1, inOutCubic) * (1 - prog(t, T.rapid - 0.5, T.rapid, inOutCubic));
      const into = prog(t, T.toNeurons - 0.1, T.toNeurons + 0.8, (k) => k * k * k);
      const bx = HX + BRAIN_C[0] * HS, by = HY + BRAIN_C[1] * HS;
      const z = lerp(1, 0.78, zoomOut) * lerp(1, 4, into);
      const fx = lerp(lerp(960, 900, zoomOut), bx, into), fy = lerp(lerp(540, 470, zoomOut), by, into);
      const settleIn = 1 + (1 - outCubic(prog(t, T.toAnatomy + 0.3, T.toAnatomy + 1.6))) * 0.12;
      set('an-cam', 'transform', `translate(960 540) ${sc(z * settleIn)} translate(${-fx} ${-fy})`);

      // head + brain motion
      let hx = 0, hy = 0, hr = 0, rx = 0, ry = 0, hit = 0;
      for (const [at, dx, dy, amp, kind] of IMP) {
        const u = t - at;
        const H = headResp(u) * amp, Bm = brainResp(u) * 44;
        if (kind === 'body') { hr += headResp(u) * -9 + headResp(u - 0.25) * 6; } else { hx += dx * H; hy += dy * H; }
        rx += (kind === 'body' ? -1 : dx) * Bm; ry += dy * Bm;
        if (u > 0 && u < 0.4) hit = Math.max(hit, 1 - u / 0.4);
      }
      // gentle settle wobble, then rest
      const lenB = Math.hypot(rx, ry), maxB = 46;
      if (lenB > maxB) { rx *= maxB / lenB; ry *= maxB / lenB; }
      set('an-head', 'transform', `translate(${HX + hx} ${HY + hy}) ${sc(HS)} ${rot(hr, 0, 330)}`);
      const squashX = 1 - Math.min(0.12, Math.abs(rx) / maxB * 0.12), squashY = 1 - Math.min(0.1, Math.abs(ry) / maxB * 0.1);
      const bT = `translate(${BRAIN_C[0] + rx} ${BRAIN_C[1] + ry}) ${sc(BRAIN_S * squashX * (1 + (1 - squashY) * 0.5), BRAIN_S * squashY * (1 + (1 - squashX) * 0.5))}`;
      set('an-brain', 'transform', bT);
      const rapidK = prog(t, T.rapid, T.rapid + 0.2) * (1 - prog(t, T.rapid + 1.1, T.rapid + 1.5));
      for (let i = 0; i < 2; i++) {
        set(`an-ghost${i}`, 'transform', `translate(${BRAIN_C[0] + rx * (0.55 - i * 0.25)} ${BRAIN_C[1] + ry * 0.5}) ${sc(BRAIN_S)}`);
        set(`an-ghost${i}`, 'opacity', (rapidK * (0.3 - i * 0.12) * Math.min(1, lenB / 20)).toFixed(3));
      }
      set('an-ripples', 'opacity', (Math.min(1, lenB / 25) * 0.8).toFixed(3));
      set('an-ripples', 'transform', tr(Math.sin(t * 6) * 6, 0));
      // eyes squeeze on impact, blink once settled
      const settleBlink = Math.max(0, 1 - Math.abs(t - T.settle - 0.3) / 0.08);
      const lid = Math.max(0.12, 1 - hit * 0.85 - settleBlink * 0.9);
      set('an-eyes', 'transform', `translate(0 -30) ${sc(1, lid)} translate(0 30)`);

      // ball for the bump: flies in from the back of the head, rebounds out
      const bu = t - (T.bump - 0.4);
      if (bu > 0 && bu < 1.2) {
        const into2 = Math.min(1, bu / 0.4), back = Math.max(0, bu - 0.4);
        const x0 = -420, xHit = -300 + hx;
        const bxw = bu < 0.4 ? lerp(x0 - 300, xHit, into2 * into2) : xHit - back * 700;
        const byw = -60 - (bu < 0.4 ? 0 : back * 200 - back * back * 400);
        set('an-ball', 'transform', `translate(${HX + bxw * HS} ${HY + byw * HS}) ${rot(bu * 400)} ${sc(HS * (bu > 0.38 && bu < 0.46 ? 0.85 : 1), HS)}`);
        set('an-ball', 'opacity', Math.min(1, bu / 0.1) * (1 - prog(t, T.bump + 0.5, T.bump + 0.8)));
      } else set('an-ball', 'opacity', 0);

      // impact bursts (blow on the front of the head, hit on the shoulder)
      let burst = null;
      for (const [at, px, py] of [[T.blow, 330, -30], [T.jolt2, 20, -330], [T.bodyHit + 0.15, 360, 470]]) {
        const u = t - at;
        if (u > -0.02 && u < 0.35) burst = [px, py, u / 0.35];
      }
      if (burst) {
        const [px, py, k] = burst;
        set('an-burst', 'transform', `translate(${HX + (px + hx / HS) * HS} ${HY + (py + hy / HS) * HS}) ${sc(0.6 + k * 0.8)}`);
        set('an-burst', 'opacity', (1 - k).toFixed(3));
      } else set('an-burst', 'opacity', 0);
      set('an-lines', 'transform', `translate(${HX} ${HY}) ${sc(HS)}`);
      set('an-lines', 'opacity', (rapidK * 0.8).toFixed(3));

      // labels (skull / fluid / brain) then chips per narrated cause
      for (const [k, i] of [['sk', 0], ['fl', 1], ['br', 2]]) {
        const a = prog(t, T.anatomyLabels + i * 0.35, T.anatomyLabels + i * 0.35 + 0.4) * (1 - prog(t, T.bump - 0.8, T.bump - 0.4));
        set(`an-lab-${k}`, 'opacity', a.toFixed(3));
      }
      set('an-eyebrow', 'opacity', (prog(t, T.toAnatomy + 0.8, T.toAnatomy + 1.3) * (1 - prog(t, T.toNeurons - 0.3, T.toNeurons))).toFixed(3));
      const dk = prog(t, T.brainInjury, T.brainInjury + 0.45, outCubic);
      set('an-def', 'opacity', (dk * (1 - prog(t, T.toNeurons - 0.3, T.toNeurons))).toFixed(3));
      set('an-def', 'transform', tr(0, (1 - dk) * 20));
      [T.bump, T.blow, T.jolt2, T.bodyHit].forEach((at, i) => {
        const k = outBack(prog(t, at, at + 0.35), 2);
        set(`an-chip${i}`, 'opacity', (prog(t, at, at + 0.15) * (1 - prog(t, T.toNeurons - 0.3, T.toNeurons))).toFixed(3));
        set(`an-chip${i}`, 'transform', `translate(${(1 - k) * 60} 0) ${sc(0.9 + 0.1 * k)}`);
      });
    },
  };
}
