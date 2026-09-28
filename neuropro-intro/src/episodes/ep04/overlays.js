// Screen-space graphics for Episode 4 — same card / label / type language as Episodes 1–3.
// Section 1 + 4: glare, vignette, sound words, overlapping chatter, the phone banner, the hook question, the giant knob.
// Section 5: the scene wipe and two takeaway cards.

import { h, tr, rot, sc } from '../../engine/svg.js';
import { prog, outCubic, inCubic, outBack, inOutCubic, clamp, lerp, fnoise } from '../../engine/anim.js';
import { overload } from './timeline.js';
import { knobMarkup, mountKnob } from './knob.js';
import { knobState, KNOB, MX, STAND_Y, BODY_OFF } from './acting.js';
import { ESPRESSO, BLENDER } from './cafe.js';

const NAVY = '#0B1829';
// chatter bubbles (world coords, near the customers and the counter)
const BUBBLES = [
  ['…and then she said', 330, 470, -4], ['HA HA HA!', 640, 420, 5], ['Did you hear?', 250, 600, 3], ['Oat or dairy?', 1120, 500, -3],
  ['No way!', 560, 560, -6], ['…so anyway', 1650, 530, 4], ['ORDER 42!', 1270, 585, 2], ['Mm-hmm', 440, 350, -2],
];

export function createOverlays(cfg, T) {
  const c = cfg.brand.colors, F = cfg.brand.fonts;
  const txt = (x, y, s, size, fill = NAVY, weight = 800, anchor = 'start', extra = {}) =>
    h('text', { x, y, 'text-anchor': anchor, 'font-family': weight >= 700 ? F.display : F.body, 'font-weight': weight, 'font-size': size, fill, ...extra }, s);
  const bubbleW = (s) => 60 + s.length * 17;
  const soundWord = (id, s, col) => h('g', { id, opacity: 0 },
    txt(0, 0, s, 74, '#FFFFFF', 800, 'middle', { stroke: NAVY, 'stroke-width': 16, 'stroke-linejoin': 'round', 'paint-order': 'stroke', 'letter-spacing': 2 }),
    txt(0, 0, s, 74, col, 800, 'middle', { 'letter-spacing': 2 }));
  const bell = h('g', {},
    h('path', { d: 'M-18,10 C-18,-6 -16,-22 0,-22 C16,-22 18,-6 18,10 L24,16 L-24,16Z', fill: c.amber, stroke: NAVY, 'stroke-width': 4, 'stroke-linejoin': 'round' }),
    h('circle', { cx: 0, cy: 22, r: 6, fill: NAVY }));

  const markup = h('g', { id: 'ov4' },
    h('defs', {},
      h('radialGradient', { id: 'ov-vigG', cx: 0.5, cy: 0.5, r: 0.75 },
        h('stop', { offset: 0.45, 'stop-color': '#3A0F18', 'stop-opacity': 0 }), h('stop', { offset: 1, 'stop-color': '#3A0F18', 'stop-opacity': 1 }))),
    // glare + pulsing vignette (the world gets too bright, then presses in)
    h('rect', { id: 'ov-bright', width: 1920, height: 1080, fill: '#FFF6D8', opacity: 0, style: 'mix-blend-mode:screen' }),
    h('rect', { id: 'ov-vig', width: 1920, height: 1080, fill: 'url(#ov-vigG)', opacity: 0 }),
    // sound words
    soundWord('sw-esp', 'HSSSSS!', c.sky), soundWord('sw-bl', 'WHRRRRR!', c.coral), soundWord('sw-clk', 'CLINK!', c.amber),
    // overlapping chatter
    h('g', { id: 'bbl' }, ...BUBBLES.map(([s], i) => h('g', { id: `bb${i}`, opacity: 0 },
      h('rect', { x: -bubbleW(s) / 2, y: -38, width: bubbleW(s), height: 76, rx: 38, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 5 }),
      h('path', { d: `M${-bubbleW(s) / 2 + 40},34 L${-bubbleW(s) / 2 + 30},66 L${-bubbleW(s) / 2 + 70},36Z`, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 5, 'stroke-linejoin': 'round' }),
      h('rect', { x: -bubbleW(s) / 2 + 30, y: 28, width: 46, height: 10, fill: '#FFFFFF' }),
      txt(0, 11, s, 30, NAVY, 800, 'middle')))),
    // phone notification banner
    h('g', { id: 'ph', opacity: 0 },
      h('rect', { x: -330, y: -70, width: 660, height: 140, rx: 34, fill: '#FFFFFF', filter: 'url(#dropShadow)' }),
      h('rect', { x: -300, y: -40, width: 80, height: 80, rx: 20, fill: c.coral }),
      h('g', { transform: 'translate(-260 -2)' }, h('g', { transform: 'scale(1.2)' }, bell)),
      txt(-196, -12, 'DING! DING! DING!', 32, NAVY), txt(-196, 30, '12 new notifications', 28, '#4A5363', 500),
      h('circle', { id: 'ph-dot', cx: 300, cy: -52, r: 26, fill: c.coral }), txt(300, -42, '12', 26, '#FFFFFF', 800, 'middle')),
    // the hook question
    h('g', { id: 'hk', opacity: 0 },
      h('rect', { x: -760, y: -78, width: 1520, height: 156, rx: 78, fill: '#FFFFFF', filter: 'url(#dropShadow)' }),
      h('text', { x: 0, y: 26, 'text-anchor': 'middle', 'font-family': F.display, 'font-weight': 800, 'font-size': 70, fill: NAVY },
        'Why does ', h('tspan', { id: 'hk-every', fill: c.coral }, 'EVERYTHING'), ' feel so intense?')),
    // the giant volume knob above the head
    knobMarkup('gk', cfg.brand, { labels: true }),
    h('g', { id: 'ahh', opacity: 0 },
      h('rect', { x: -95, y: -42, width: 190, height: 84, rx: 42, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 5 }),
      txt(0, 14, 'ahh…', 40, c.tealDeep, 800, 'middle')),
    // takeaway
    h('text', { id: 'ov-e5', x: 1080, y: 250, 'font-family': F.display, 'font-weight': 800, 'font-size': 30, fill: c.tealDeep, 'letter-spacing': 5, opacity: 0 }, 'GOOD TO KNOW'),
    h('g', { id: 'ta1', opacity: 0 },
      h('rect', { x: 0, y: -90, width: 800, height: 180, rx: 32, fill: '#FFFFFF', filter: 'url(#dropShadow)' }),
      h('g', { transform: 'translate(78 -30)' }, h('circle', { r: 34, fill: c.amber }),
        h('path', { d: Array.from({ length: 8 }, (_, k) => { const a = (k / 8) * Math.PI * 2; return `M${(Math.cos(a) * 16).toFixed(1)},${(Math.sin(a) * 16).toFixed(1)} L${(Math.cos(a) * 24).toFixed(1)},${(Math.sin(a) * 24).toFixed(1)}`; }).join(' '), stroke: '#FFFFFF', 'stroke-width': 5, 'stroke-linecap': 'round' }),
        h('circle', { r: 9, fill: '#FFFFFF' })),
      h('g', { transform: 'translate(78 38)' }, h('circle', { r: 34, fill: c.sky }),
        h('path', { d: 'M-14,-6 L-6,-6 L4,-15 L4,15 L-6,6 L-14,6Z', fill: '#FFFFFF' }), h('path', { d: 'M10,-8 q7,8 0,16', fill: 'none', stroke: '#FFFFFF', 'stroke-width': 4, 'stroke-linecap': 'round' })),
      txt(150, -18, 'Light &amp; sound sensitivity', 40),
      h('text', { x: 150, y: 36, 'font-family': F.body, 'font-weight': 500, 'font-size': 32, fill: '#4A5363' }, 'can be a ', h('tspan', { 'font-family': F.display, 'font-weight': 800, fill: c.coral }, 'real'), ' concussion symptom'),
      h('rect', { id: 'ta1-ul', x: 300, y: 48, width: 62, height: 7, rx: 3.5, fill: c.coral, opacity: 0 })),
    h('g', { id: 'ta2', opacity: 0 },
      h('rect', { x: 0, y: -90, width: 800, height: 180, rx: 32, fill: '#FFFFFF', filter: 'url(#dropShadow)' }),
      h('g', { transform: 'translate(78 0)' }, h('circle', { r: 48, fill: c.teal }),
        h('path', { d: 'M-14,10 C-30,-4 -24,-30 0,-32 C24,-30 30,-4 14,10 L12,20 L-12,20Z', fill: '#FFFFFF' }), h('rect', { x: -10, y: 24, width: 20, height: 8, rx: 3, fill: '#FFFFFF' })),
      txt(150, -18, 'Understanding what’s happening', 38),
      txt(150, 36, 'is an important part of recovery', 32, '#4A5363', 500)),
    // section wipe (teal band with a slanted edge)
    h('g', { id: 'wp' },
      h('path', { d: 'M160,0 L2360,0 L2200,1080 L0,1080Z', fill: c.teal }),
      h('path', { d: 'M40,0 L200,0 L40,1080 L-120,1080Z', fill: c.cyan, opacity: 0.8 })),
  );

  return {
    markup,
    mount(svg) { this.knob = mountKnob(svg, 'gk'); },
    update(t, ctx) {
      const $ = (id) => ctx.root.querySelector(`#${id}`), set = (id, a, v) => $(id).setAttribute(a, v);
      const P = (x, y) => ctx.camera.project(ctx.cam, x, y), z = ctx.cam.zoom;
      const O = overload(t, T);
      const inWorld = t < T.toInside + 0.4 || t > T.toCafe + 0.3;
      const vis = (v) => (inWorld ? v : 0);

      // glare + vignette
      set('ov-bright', 'opacity', vis(O.light * (0.16 + 0.1 * Math.max(0, Math.sin(t * 17)))).toFixed(3));
      set('ov-vig', 'opacity', vis(O.all * (0.35 + 0.2 * Math.sin(t * 7))).toFixed(3));

      // sound words (jitter while their source is on)
      const word = (id, lvl, wx, wy, r0) => {
        const [x, y] = P(wx, wy), k = outBack(clamp(lvl * 1.4), 2.2);
        set(id, 'opacity', vis(clamp(lvl * 3)).toFixed(3));
        set(id, 'transform', `translate(${(x + fnoise(t * 25, r0) * 6 * lvl).toFixed(1)} ${(y + fnoise(t * 25, r0 + 3) * 6 * lvl).toFixed(1)}) ${rot(r0 + Math.sin(t * 20) * 2 * lvl)} ${sc(z * (0.5 + 0.5 * k))}`);
      };
      const knobScene = t > T.toCafe;                   // leave room for the giant knob's TOO MUCH label
      word('sw-esp', O.espresso, ESPRESSO[0] + (knobScene ? 100 : -130), ESPRESSO[1] - (knobScene ? 200 : 210), -8);
      word('sw-bl', O.blender, BLENDER[0] - 180, BLENDER[1] - (knobScene ? 350 : 310), 7);
      word('sw-clk', Math.max(0, O.talk - 0.2) * 1.25, 240, 290, -5);

      // chatter: more and more overlapping bubbles
      BUBBLES.forEach(([, bx, by, r], i) => {
        const at = t < T.toInside + 1 ? T.talk + i * 0.26 : T.toCafe + 0.15 + i * 0.14;
        const on = prog(t, at, at + 0.2) * (t < T.toInside + 1 ? 1 : 1 - prog(t, T.calm, T.calm + 0.2));
        const pop = outBack(prog(t, at, at + 0.3), 2.4);
        const [x, y] = P(bx, by + Math.sin(t * 5 + i) * 6);
        set(`bb${i}`, 'opacity', vis(on).toFixed(3));
        set(`bb${i}`, 'transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) ${rot(r + Math.sin(t * 6 + i) * 2)} ${sc(z * (0.6 + 0.4 * pop) * (1 - 0.3 * prog(t, T.calm, T.calm + 0.2)))}`);
      });

      // phone banner drops in from the top
      const phK = t < T.toInside + 1 ? outBack(prog(t, T.phone, T.phone + 0.35), 1.6) : outBack(prog(t, T.toCafe + 0.5, T.toCafe + 0.85), 1.6) * (1 - prog(t, T.calm, T.calm + 0.2, inCubic));
      const phOn = t < T.toInside + 1 ? prog(t, T.phone, T.phone + 0.1) : prog(t, T.toCafe + 0.5, T.toCafe + 0.6) * (1 - prog(t, T.calm, T.calm + 0.2));
      set('ph', 'opacity', vis(phOn).toFixed(3));
      set('ph', 'transform', `translate(${1480 + fnoise(t * 30, 9) * 5 * phOn} ${lerp(-120, 120, phK)}) ${rot(Math.sin(t * 30) * 1.5 * phOn)}`);
      set('ph-dot', 'r', (26 + 4 * Math.max(0, Math.sin(t * 12))).toFixed(1));

      // hook question
      const hk = outBack(prog(t, T.textIn, T.textIn + 0.45), 1.6), hkOut = prog(t, T.textOut - 0.25, T.textOut, inCubic);
      set('hk', 'opacity', (prog(t, T.textIn, T.textIn + 0.12) * (1 - hkOut)).toFixed(3));
      set('hk', 'transform', `translate(960 ${(955 + (1 - hk) * 40).toFixed(1)}) ${sc(0.9 + 0.1 * hk)}`);
      set('hk-every', 'dy', (Math.sin(t * 24) * 3).toFixed(1));

      // giant knob over the head
      const ks = knobState(t, T), [kx, ky] = P(KNOB.x, KNOB.y);
      this.knob({ x: kx, y: ky, scale: KNOB.scale * z * (0.4 + 0.6 * clamp(ks.appear)) * (ks.appear > 1 ? ks.appear : 1), appear: t > T.toCafe ? clamp(ks.appear * 3) : 0, level: ks.level, glow: ks.glow, rot: ks.rot });
      const ah = outBack(prog(t, T.calm + 0.35, T.calm + 0.7), 2) * (1 - prog(t, T.smile - 0.2, T.smile + 0.1));
      const [ax, ay] = P(MX + 330, STAND_Y + BODY_OFF - 170);
      set('ahh', 'opacity', clamp(ah * 2).toFixed(3));
      set('ahh', 'transform', `translate(${ax.toFixed(1)} ${ay.toFixed(1)}) ${sc(z * (0.6 + 0.4 * ah))}`);

      // takeaway
      set('ov-e5', 'opacity', (prog(t, T.vo('l4') - 0.1, T.vo('l4') + 0.3) * (1 - prog(t, T.iris - 0.5, T.iris - 0.2))).toFixed(3));
      for (const [id, at, y] of [['ta1', T.vo('l4') + 0.2, 380], ['ta2', T.vo('l5') + 0.1, 610]]) {
        const k = outBack(prog(t, at, at + 0.45), 1.5), out = prog(t, T.iris - 0.5, T.iris - 0.15, inCubic);
        set(id, 'opacity', (prog(t, at, at + 0.15) * (1 - out)).toFixed(3));
        set(id, 'transform', `translate(${(1080 + (1 - k) * 80 + out * 200).toFixed(1)} ${y})`);
      }
      const ul = prog(t, T.real, T.real + 0.35, outCubic);
      set('ta1-ul', 'opacity', ul.toFixed(3)); set('ta1-ul', 'width', (62 * ul).toFixed(1));

      // wipe
      const wk = prog(t, T.wipe - 0.4, T.wipe + 0.4, inOutCubic);
      set('wp', 'visibility', wk > 0 && wk < 1 ? 'visible' : 'hidden');
      set('wp', 'transform', tr(lerp(1960, -2400, wk), 0));
    },
  };
}
