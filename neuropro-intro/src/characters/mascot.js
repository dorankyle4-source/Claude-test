// THE NEUROPRO BRAIN — recurring mascot / host of the series.
// Rebuilt as an animatable vector rig from the reference art (assets/reference/brain-mascot-reference.png):
// coral lobes with salmon folds, bold navy outline, big oval eyes, rubber-hose arms, white gloves + sneakers.
//
// Local coords: origin on the ground between the feet; the brain body is centred at (0, BODY_Y).
// state.dizzy (0..1) = post-concussion look; state.order (0..1) = NeuroPro "organised" glow.

import { h, tr, rot, sc } from '../engine/svg.js';
import { fnoise, clamp, lerp } from '../engine/anim.js';

const BODY_Y = -335, RX = 235, RY = 190, HIP_Y = -160;

/** Lumpy "cloud" silhouette: arcs bulging outward between points on an ellipse. */
function lobeOutline(n = 17) {
  const pts = [];
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (i / n) * Math.PI * 2;
    const wob = 1 + 0.03 * Math.sin(i * 2.7);
    const flatBottom = Math.sin(a) > 0.55 ? 0.97 : 1;
    pts.push([Math.cos(a) * RX * wob, Math.sin(a) * RY * wob * flatBottom]);
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 1; i <= n; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i % n];
    const r = Math.hypot(x1 - x0, y1 - y0) * (0.56 + 0.06 * Math.sin(i * 1.9));
    d += ` A${r.toFixed(1)},${r.toFixed(1)} 0 0 1 ${x1.toFixed(1)},${y1.toFixed(1)}`;
  }
  return d + 'Z';
}
export const MASCOT_OUTLINE = lobeOutline();

export const FOLDS = [
  'M-200,-60 C-185,-95 -150,-80 -140,-110 C-130,-140 -95,-130 -90,-155',
  'M-215,10 C-190,-5 -175,25 -150,5 C-130,-12 -120,15 -100,0',
  'M-195,70 C-170,55 -160,90 -130,75 C-110,65 -95,95 -70,80',
  'M-150,125 C-125,112 -110,142 -85,127 C-65,114 -50,142 -25,132',
  'M-125,-40 C-105,-60 -85,-30 -65,-50 C-50,-65 -38,-45 -28,-68',
  'M-160,-140 C-130,-146 -118,-172 -86,-166',
  'M-62,-160 C-42,-140 -22,-170 3,-150',
  'M-4,-186 C-10,-150 10,-132 -4,-106',
  'M32,-172 C57,-152 77,-177 102,-157',
  'M122,-140 C142,-120 167,-135 182,-110',
  'M200,-58 C214,-34 198,-10 216,14',
  'M196,58 C210,80 190,100 204,124',
  'M-104,40 C-84,25 -64,55 -44,35 C-34,25 -24,45 -18,30',
  'M-64,-102 C-44,-112 -38,-86 -18,-96',
  'M104,150 C124,140 139,160 159,145',
  'M-44,166 C-24,151 -4,173 16,161',
  'M-178,-100 c-10,-18 8,-30 20,-18',
  'M-60,112 c10,-16 30,-6 24,10 c-5,12 -20,10 -22,0',
  'M-140,35 c14,-10 26,6 16,16',
  'M60,-110 c14,-12 32,2 22,16',
  'M150,-60 c16,-6 22,12 10,20',
  'M-10,-40 c10,-14 28,-4 20,10',
  'M-210,110 C-190,100 -180,122 -160,112',
  'M40,120 c12,-10 28,2 18,14',
];

// Neural network overlay (echoes the NeuroPro logo icon).
const NODES = [[-170, -40], [-120, -120], [-40, -150], [60, -150], [150, -110], [195, -20], [170, 90], [80, 145],
  [-20, 150], [-110, 120], [-185, 60], [-90, 0], [-30, -70], [-60, 70]];
const EDGES = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10], [10, 0],
  [11, 0], [11, 12], [12, 2], [12, 1], [11, 13], [13, 9], [13, 8], [11, 10], [12, 3]];

const NAVY = '#0B1829';

function glove(kind, side) {
  const g = { fill: '#FFFDF8', stroke: NAVY, 'stroke-width': 6, 'stroke-linejoin': 'round' };
  const cuff = h('rect', { x: -17, y: -34, width: 34, height: 16, rx: 7, ...g });
  if (kind === 'fist') return h('g', {}, cuff,
    h('circle', { cx: 0, cy: 0, r: 27, ...g }),
    h('path', { d: 'M-14,-6 q7,6 0,13 M-2,-9 q7,7 0,15 M10,-8 q7,6 0,13', fill: 'none', stroke: NAVY, 'stroke-width': 4, 'stroke-linecap': 'round' }),
    h('ellipse', { cx: -side * 22, cy: -8, rx: 10, ry: 14, ...g, transform: `rotate(${side * 25} ${-side * 22} -8)` }));
  if (kind === 'point') return h('g', {}, cuff,
    h('circle', { cx: 0, cy: 0, r: 26, ...g }),
    h('rect', { x: -7, y: 8, width: 15, height: 44, rx: 7.5, ...g }),
    h('circle', { cx: 0, cy: 6, r: 20, fill: '#FFFDF8' }),
    h('path', { d: 'M-16,-4 q8,6 0,12 M-6,-8 q7,6 0,12', fill: 'none', stroke: NAVY, 'stroke-width': 4, 'stroke-linecap': 'round' }));
  if (kind === 'thumb') return h('g', {}, cuff,
    h('rect', { x: -26, y: -20, width: 52, height: 46, rx: 18, ...g }),
    h('path', { d: 'M-26,-4 h34 M-26,10 h32', stroke: NAVY, 'stroke-width': 4, 'stroke-linecap': 'round' }),
    h('rect', { x: side > 0 ? 6 : -24, y: -62, width: 18, height: 50, rx: 9, ...g }));
  // open palm
  return h('g', {}, cuff,
    h('ellipse', { cx: 0, cy: 0, rx: 26, ry: 24, ...g }),
    ...[-16, -5, 6, 16].map((x, i) => h('rect', { x: x - 6, y: 8, width: 12, height: i === 0 || i === 3 ? 26 : 32, rx: 6, ...g })),
    h('ellipse', { cx: -side * 24, cy: -6, rx: 9, ry: 15, ...g, transform: `rotate(${-side * 40} ${-side * 24} -6)` }),
    h('ellipse', { cx: 0, cy: 4, rx: 23, ry: 16, fill: '#FFFDF8' }));
}

function shoe(side) {
  // toe points outward (side = -1 left, +1 right)
  const s = { fill: '#FFFDF8', stroke: NAVY, 'stroke-width': 6, 'stroke-linejoin': 'round' };
  return h('g', { transform: `scale(${side * 1.25} 1.25)` },
    h('path', { d: 'M-34,-26 C-38,-6 -40,8 -34,14 L66,14 C84,14 86,-6 70,-12 C52,-18 34,-20 22,-34 C8,-44 -22,-42 -34,-26Z', ...s }),
    h('path', { d: 'M-38,4 L82,4', stroke: NAVY, 'stroke-width': 5 }),
    h('path', { d: 'M-36,8 L80,8 C80,12 76,14 66,14 L-34,14Z', fill: '#DADADA' }),
    h('path', { d: 'M4,-30 l10,10 M16,-36 l10,10 M28,-30 l8,8', stroke: NAVY, 'stroke-width': 4, 'stroke-linecap': 'round' }),
  );
}

export function createMascot(pal = {}, prefix = 'mb-') {
  const P = prefix, id = (n) => P + n;
  const c = { fill: '#FC9D7B', fold: '#DC6446', hi: '#FFC2A8', dizzy: '#9C8FD8', teal: '#1FC8B4', cyan: '#63E2F5', excite: '#E8704E', ...pal };

  const excite = [[-250, -535, -140], [-292, -450, -165], [-195, -603, -115], [252, -547, -40], [296, -460, -15], [198, -611, -65]];

  const markup = h('g', { id: id('root') },
    h('defs', {},
      h('clipPath', { id: id('clip') }, h('path', { d: MASCOT_OUTLINE })),
      h('radialGradient', { id: id('shade'), cx: 0.35, cy: 0.3, r: 0.8 },
        h('stop', { offset: 0.55, 'stop-color': '#000', 'stop-opacity': 0 }), h('stop', { offset: 1, 'stop-color': '#7A2A18', 'stop-opacity': 0.22 })),
    ),
    h('ellipse', { id: id('shadow'), cx: 0, cy: 6, rx: 200, ry: 26, fill: '#0B2545', opacity: 0.14, filter: 'url(#softBlur)' }),
    h('path', { id: id('legL'), fill: 'none', stroke: NAVY, 'stroke-width': 17, 'stroke-linecap': 'round' }),
    h('path', { id: id('legR'), fill: 'none', stroke: NAVY, 'stroke-width': 17, 'stroke-linecap': 'round' }),
    h('g', { id: id('shoeL') }, shoe(-1)),
    h('g', { id: id('shoeR') }, shoe(1)),
    h('g', { id: id('body') },
      h('g', { transform: tr(0, BODY_Y) },
        h('path', { id: id('glow'), d: MASCOT_OUTLINE, fill: 'none', stroke: c.cyan, 'stroke-width': 26, filter: 'url(#blur14)', opacity: 0 }),
        h('path', { d: MASCOT_OUTLINE, fill: c.fill, stroke: NAVY, 'stroke-width': 10, 'stroke-linejoin': 'round' }),
        h('g', { 'clip-path': `url(#${id('clip')})` },
          h('ellipse', { cx: -70, cy: -110, rx: 150, ry: 70, fill: c.hi, opacity: 0.45 }),
          h('g', { id: id('folds'), fill: 'none', stroke: c.fold, 'stroke-width': 10, 'stroke-linecap': 'round' },
            ...FOLDS.map((d, i) => h('path', { id: id(`f${i}`), d }))),
          h('rect', { x: -RX - 20, y: -RY - 20, width: RX * 2 + 40, height: RY * 2 + 40, fill: `url(#${id('shade')})` }),
          h('path', { id: id('tint'), d: MASCOT_OUTLINE, fill: c.dizzy, opacity: 0 }),
          h('g', { id: id('net'), opacity: 0 },
            h('g', { stroke: c.teal, 'stroke-width': 3.5, opacity: 0.85 },
              ...EDGES.map(([a, b]) => h('line', { x1: NODES[a][0], y1: NODES[a][1], x2: NODES[b][0], y2: NODES[b][1] }))),
            h('g', { fill: '#FFFFFF', stroke: c.teal, 'stroke-width': 3 }, ...NODES.map(([x, y], i) => h('circle', { id: id(`n${i}`), cx: x, cy: y, r: 7 }))),
            h('g', { fill: '#FFFFFF', filter: 'url(#glow)' }, ...EDGES.map((_, i) => h('circle', { id: id(`p${i}`), r: 5, opacity: 0 }))),
          ),
        ),
        // face (slightly right of centre, like the reference)
        h('g', { id: id('face') },
          ...[['L', 20], ['R', 132]].map(([s, x]) => h('g', {},
            h('g', { id: id(`eye${s}`) },
              h('ellipse', { cx: x, cy: -34, rx: 21, ry: 31, fill: NAVY }),
              h('circle', { cx: x + 7, cy: -47, r: 8, fill: '#fff' }),
              h('circle', { cx: x - 6, cy: -20, r: 3.2, fill: '#fff', opacity: 0.8 })),
            h('path', { id: id(`brow${s}`), d: `M${x - 24},${-96} Q${x},${-114} ${x + 24},${-98}`, fill: 'none', stroke: NAVY, 'stroke-width': 9, 'stroke-linecap': 'round' }))),
          h('g', { transform: 'translate(74 52)' },
            h('clipPath', { id: id('mclip') }, h('path', { id: id('mclipP') })),
            h('path', { id: id('mouth'), fill: '#2A0F14', stroke: NAVY, 'stroke-width': 6, 'stroke-linejoin': 'round' }),
            h('g', { 'clip-path': `url(#${id('mclip')})` }, h('ellipse', { id: id('tongue'), cx: 8, cy: 40, rx: 28, ry: 18, fill: '#E57368' }))),
        ),
      ),
      // arms (rubber hose) + gloves
      ...['L', 'R'].map((s) => h('g', {},
        h('path', { id: id(`arm${s}`), fill: 'none', stroke: NAVY, 'stroke-width': 16, 'stroke-linecap': 'round' }),
        h('g', { id: id(`hand${s}`) },
          ...['fist', 'thumb', 'open', 'point'].map((k) => h('g', { id: id(`h${s}${k}`), opacity: k === 'fist' ? 1 : 0 }, h('g', { transform: 'scale(1.4)' }, glove(k, s === 'L' ? -1 : 1))))))),
      // excitement lines
      h('g', { id: id('excite'), stroke: c.excite, 'stroke-width': 9, 'stroke-linecap': 'round', opacity: 0 },
        ...excite.map(([x, y, a], i) => h('path', { id: id(`x${i}`), d: 'M0,0 L38,0', transform: `${tr(x, y)} ${rot(a)}` }))),
    ),
  );

  return {
    markup,
    mount(root) {
      const cache = {};
      const $ = (n) => (cache[n] ||= root.querySelector(`#${P}${n}`));
      const set = (n, a, v) => $(n).setAttribute(a, v);
      const SH = { L: [-205, BODY_Y + 30], R: [210, BODY_Y + 22] };

      return (p) => {
        const t = p.t ?? 0;
        // fall: rotate the whole character about a ground pivot (e.g. a heel) — used for "knocked over"
        const fall = p.fall ?? 0, pv = p.fallPivot ?? [-90, 0];
        set('root', 'transform', `${tr(p.x ?? 0, p.y ?? 0)} ${sc(p.s ?? 1)} ${rot(fall, pv[0], pv[1])}`);
        const bob = p.bob ?? 0, sq = p.squash ?? 1; // sq > 1 = stretched tall
        set('shadow', 'rx', (200 * (1 - Math.min(0.35, bob / 200))).toFixed(1));
        set('shadow', 'opacity', (0.14 * (1 - Math.min(0.5, bob / 160))).toFixed(3));

        // body: bob, tilt around the hips, squash & stretch (volume-preserving)
        const sx = 1 / Math.sqrt(sq), sy = sq;
        set('body', 'transform', `translate(0 ${(-bob).toFixed(2)}) ${rot(p.tilt ?? 0, 0, HIP_Y)} translate(0 ${HIP_Y}) ${sc(sx, sy)} translate(0 ${-HIP_Y})`);

        // legs: hose from hips (which follow the body) to the shoes
        // feet: shared lift, plus per-foot [dx, lift] for walk cycles
        for (const [s, side] of [['L', -1], ['R', 1]]) {
          const f = (s === 'L' ? p.footL : p.footR) || [0, 0];
          const lift = (p.footLift ?? 0) + f[1];
          const hx = side * 62 * sx, hy = HIP_Y - bob;
          const ax = side * 72 + f[0], ay = -34 - lift;
          const bend = side * (4 + Math.max(0, 110 - (ay - hy)) * 0.25);
          set(`leg${s}`, 'd', `M${hx.toFixed(1)},${hy.toFixed(1)} Q${((hx + ax) / 2 + bend).toFixed(1)},${((hy + ay) / 2).toFixed(1)} ${ax},${ay.toFixed(1)}`);
          set(`shoe${s}`, 'transform', tr(ax + side * 10, -18 - lift));
        }

        // face: 2.5D turn, eyes, blink, brows, mouth
        const turn = p.turn ?? 0;
        set('face', 'transform', tr(turn * 16, (p.faceY ?? 0)));
        const blink = p.blink ?? 0;
        for (const [s, x] of [['L', 20], ['R', 132]]) {
          const dz = (p.dizzy ?? 0) * (s === 'L' ? 1 : -1);
          const ex = (p.eyeX ?? 0) * 9 + dz * Math.sin(t * 5) * 4, ey = (p.eyeY ?? 0) * 7 + dz * Math.cos(t * 4) * 3;
          const lid = Math.max(0.08, 1 - blink * 0.92) * (1 - (p.squint ?? 0) * 0.35);
          const es = p.eyeScale ?? 1;
          set(`eye${s}`, 'transform', `translate(${(x + ex).toFixed(2)} ${(-34 + ey).toFixed(2)}) ${sc(es, lid * es)} translate(${-x} 34)`);
          const lift = (p.browLift ?? 0) * 12 + (s === 'L' ? 1 : -1) * (p.browAsym ?? 0) * 7;
          const ang = (s === 'L' ? -1 : 1) * (p.browWorry ?? 0) * 14;
          set(`brow${s}`, 'transform', `translate(${ex * 0.5} ${-lift}) ${rot(ang, x, -96)}`);
        }
        const smile = p.smile ?? 0.6, open = p.open ?? 0.5, w = 50 * (p.mouthW ?? 1);
        const cy = -smile * 10, top = cy + smile * 3 - open * 5, bot = 8 + open * 58 + Math.max(0, smile) * 18;
        const md = `M${-w},${cy.toFixed(1)} Q0,${top.toFixed(1)} ${w},${cy.toFixed(1)} Q0,${bot.toFixed(1)} ${-w},${cy.toFixed(1)}Z`;
        set('mouth', 'd', md); set('mclipP', 'd', md);
        set('tongue', 'cy', (bot * 0.62).toFixed(1));

        // state: dizzy tint + wobbling folds, organised network + glow
        const dz = clamp(p.dizzy ?? 0), o = clamp(p.order ?? 0);
        set('tint', 'opacity', (dz * 0.17).toFixed(3));
        for (let i = 0; i < FOLDS.length; i++) {
          const a = dz * fnoise(t * 4 + i * 3.3, i) * 6, b = dz * fnoise(t * 3.6 + i * 1.7, i + 20) * 6;
          set(`f${i}`, 'transform', tr(a, b));
        }
        const netVis = o * (p.netLevel ?? 1);
        set('net', 'opacity', netVis.toFixed(3));
        set('glow', 'opacity', (o * (p.glow ?? 0.5) * (0.8 + 0.2 * Math.sin(t * 4))).toFixed(3));
        if (netVis > 0.01) {
          for (let i = 0; i < EDGES.length; i++) {
            const [a, b] = EDGES[i], ph = (t * 1.3 + i * 0.37) % 1;
            set(`p${i}`, 'cx', lerp(NODES[a][0], NODES[b][0], ph).toFixed(1));
            set(`p${i}`, 'cy', lerp(NODES[a][1], NODES[b][1], ph).toFixed(1));
            set(`p${i}`, 'opacity', Math.sin(ph * Math.PI).toFixed(2));
          }
        }

        // arms + gloves
        for (const [s, side] of [['L', -1], ['R', 1]]) {
          const [shx, shy] = SH[s];
          const hand = (s === 'L' ? p.handL : p.handR) || [side * 262, BODY_Y + 150];
          const [hx, hy] = hand;
          const mx = (shx + hx) / 2, my = (shy + hy) / 2;
          const dx = hx - shx, dy = hy - shy, len = Math.hypot(dx, dy) || 1;
          const bend = (s === 'L' ? p.bendL : p.bendR) ?? 40;
          const cx = mx + (-dy / len) * bend * -side, cyy = my + (dx / len) * bend * -side;
          set(`arm${s}`, 'd', `M${shx},${shy} Q${cx.toFixed(1)},${cyy.toFixed(1)} ${hx.toFixed(1)},${hy.toFixed(1)}`);
          const endAng = Math.atan2(hy - cyy, hx - cx) * 180 / Math.PI - 90;
          const ang = (s === 'L' ? p.handAngL : p.handAngR) ?? endAng;
          set(`hand${s}`, 'transform', `${tr(hx, hy)} ${rot(ang)}`);
          const pose = (s === 'L' ? p.gloveL : p.gloveR) || { fist: 1 };
          for (const k of ['fist', 'thumb', 'open', 'point']) set(`h${s}${k}`, 'opacity', clamp(pose[k] ?? 0).toFixed(3));
        }

        // excitement lines
        const ex = clamp(p.excite ?? 0);
        set('excite', 'opacity', ex > 0 ? 1 : 0);
        for (let i = 0; i < 6; i++) {
          const k = clamp(ex * 1.6 - i * 0.1);
          set(`x${i}`, 'stroke-dasharray', `${(38 * k).toFixed(1)} 60`);
          set(`x${i}`, 'opacity', (k * (0.75 + 0.25 * Math.sin(t * 9 + i))).toFixed(2));
        }
      };
    },
  };
}

export const MASCOT_BODY = { y: BODY_Y, rx: RX, ry: RY };
