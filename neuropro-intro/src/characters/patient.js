// JORDAN — the recurring athlete / patient.
// Silhouette hooks: curly high-top, coral track jacket, teal-accent sneakers, water bottle.

import { h } from '../engine/svg.js';
import { buildCharacter } from './rig.js';

export function createPatient(pal, prefix = 'jd-') {
  const dims = {
    hipY: -330, hipX: 36, stance: 14, ankle: 40, legLen: 306,
    shoulderX: 88, shoulderY: -540, upperArm: 146, forearm: 132,
    neckY: -592, turnPx: 10, shadowRx: 120,
    eyes: { dx: 25, y: -664, rx: 13.5, ry: 15.5, iris: 10, lash: 3.6, lashWing: false },
    brows: { y: -694, w: 14, arch: 6, thick: 7, liftPx: 8 },
    mouth: { x: 0, y: -613, w: 16 },
  };
  const P = prefix;

  // Curls around the top of the high-top.
  const curls = [];
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * (1.08 + i * 0.084);
    curls.push(h('circle', { cx: (Math.cos(a) * 55).toFixed(1), cy: (-752 + Math.sin(a) * 50).toFixed(1), r: i % 2 ? 15 : 17.5, fill: pal.hair }));
  }
  const curlTex = [];
  for (let i = 0; i < 14; i++) {
    const x = -44 + (i % 7) * 15 + (i > 6 ? 7 : 0), y = -778 + (i > 6 ? 26 : 0) + (i % 3) * 4;
    curlTex.push(h('path', { d: `M${x - 5},${y + 2} q5,-8 10,0`, fill: 'none', stroke: pal.hairHi, 'stroke-width': 3, 'stroke-linecap': 'round', opacity: 0.8 }));
  }

  const costume = {
    prefix: P, dims, pal,

    shoe: (side) => h('g', { transform: `translate(0 8) scale(${-side} 1)` },
      h('path', { d: 'M-36,28 L36,28 Q45,28 44,13 Q41,-7 18,-11 L-16,-11 Q-39,-7 -42,11 Q-44,28 -36,28Z', fill: pal.shoe }),
      h('path', { d: 'M-44,18 L45,18 L45,24 Q45,32 37,32 L-37,32 Q-44,32 -44,24Z', fill: pal.sole }),
      h('path', { d: 'M-41,7 Q0,-3 43,7 L44,14 Q0,4 -43,14Z', fill: pal.shoeAccent }),
      h('path', { d: 'M-9,-8 l6,6 m4,-7 l6,6', stroke: '#B8BFC9', 'stroke-width': 2.4, 'stroke-linecap': 'round' }),
    ),

    leg: (side) => h('g', {},
      h('path', { d: 'M-32,0 L32,0 C34,80 28,140 26,170 C24,220 22,262 21,296 L-21,296 C-22,262 -24,220 -26,170 C-28,140 -34,80 -32,0Z', fill: pal.pants }),
      h('path', { d: `M${side * 6},20 C${side * 18},90 ${side * 16},200 ${side * 12},292 L${side * 21},292 C${side * 23},220 ${side * 28},120 ${side * 32},10Z`, fill: pal.pantsShade, opacity: side > 0 ? 0.9 : 0.35 }),
      h('path', { d: 'M-14,168 q14,6 28,0', stroke: pal.pantsShade, 'stroke-width': 3, fill: 'none', 'stroke-linecap': 'round' }),
      h('rect', { x: -22, y: 286, width: 44, height: 20, rx: 8, fill: pal.pantsShade }),
    ),

    pelvis: () => h('path', { d: 'M-72,-338 L72,-338 L68,-276 Q0,-256 -68,-276Z', fill: pal.pants }),

    torso: () => h('g', {},
      // tee in the V
      h('path', { d: 'M-30,-578 L30,-578 L0,-526Z', fill: pal.tee }),
      // jacket body
      h('path', { d: 'M-58,-580 Q-102,-574 -110,-534 L-94,-334 Q-92,-312 -72,-310 L72,-310 Q92,-312 94,-334 L110,-534 Q102,-574 58,-580 L26,-578 L0,-528 L-26,-578Z', fill: pal.jacket }),
      // light from the window (left) → shade on the right
      h('path', { d: 'M56,-578 Q100,-572 108,-534 L94,-334 Q92,-314 74,-311 Q86,-460 56,-578Z', fill: pal.jacketShade, opacity: 0.85 }),
      h('path', { d: 'M-62,-576 Q-96,-568 -102,-540 Q-80,-560 -52,-566Z', fill: pal.jacketHi, opacity: 0.8 }),
      // hem band + pockets + zip
      h('path', { d: 'M-95,-344 L95,-344 L93,-320 Q91,-310 78,-310 L-78,-310 Q-91,-310 -93,-320Z', fill: pal.jacketShade }),
      h('path', { d: 'M-78,-408 L-54,-362 M78,-408 L54,-362', stroke: pal.jacketShade, 'stroke-width': 4.5, 'stroke-linecap': 'round' }),
      h('path', { d: 'M0,-528 L0,-314', stroke: '#fff', 'stroke-width': 3, opacity: 0.85 }),
      h('rect', { x: -4.5, y: -522, width: 9, height: 17, rx: 3, fill: '#fff' }),
      // stand-up collar, open
      h('path', { d: 'M-50,-574 L-34,-612 Q-24,-617 -14,-610 L0,-530 L-28,-578Z', fill: pal.jacketHi }),
      h('path', { d: 'M50,-574 L34,-612 Q24,-617 14,-610 L0,-530 L28,-578Z', fill: pal.jacket }),
    ),

    neck: () => h('g', {},
      h('path', { d: 'M-19,-612 L19,-612 L22,-566 L-22,-566Z', fill: pal.skin }),
      h('path', { d: 'M-19,-606 Q0,-590 19,-606 L20,-592 Q0,-578 -20,-592Z', fill: pal.skinShade, opacity: 0.7 }),
    ),

    headBack: () => h('g', {},
      ...[-1, 1].map((s) => h('g', {},
        h('ellipse', { cx: s * 57, cy: -656, rx: 11, ry: 17, fill: pal.skin }),
        h('ellipse', { cx: s * 58, cy: -655, rx: 5, ry: 9, fill: pal.skinShade, opacity: 0.8 }),
      )),
    ),

    face: () => h('g', {},
      h('path', { d: 'M-57,-690 C-59,-640 -52,-607 -26,-592 Q0,-580 26,-592 C52,-607 59,-640 57,-690 C55,-735 30,-746 0,-746 C-30,-746 -55,-735 -57,-690Z', fill: pal.skin }),
      h('path', { d: 'M40,-604 C53,-616 57,-645 57,-690 C58,-662 55,-628 44,-608Z', fill: pal.skinShade, opacity: 0.3 }),
    ),

    blush: () => h('g', { opacity: 0.28 },
      h('ellipse', { cx: -37, cy: -630, rx: 11, ry: 6, fill: pal.blush }),
      h('ellipse', { cx: 37, cy: -630, rx: 11, ry: 6, fill: pal.blush }),
    ),

    nose: () => h('path', { d: 'M-2,-652 Q-9,-634 -1,-630 Q6,-629 9,-634', fill: 'none', stroke: pal.skinShade, 'stroke-width': 3.6, 'stroke-linecap': 'round' }),

    hairFront: () => h('g', {},
      h('path', { d: 'M-60,-684 C-66,-728 -56,-768 -30,-788 C-10,-802 10,-802 30,-788 C56,-768 66,-728 60,-684 C56,-700 50,-710 38,-716 Q0,-722 -38,-716 C-50,-710 -56,-700 -60,-684Z', fill: pal.hair }),
      ...curls,
      ...curlTex,
      // tapered sides
      h('path', { d: 'M-60,-686 L-57,-662 Q-62,-676 -60,-686Z M60,-686 L57,-662 Q62,-676 60,-686Z', fill: pal.hair, opacity: 0.9 }),
    ),

    upperArm: (side) => h('g', {},
      h('path', { d: 'M-25,-6 Q-28,72 -22,146 L22,146 Q28,72 25,-6 Q0,-26 -25,-6Z', fill: pal.jacket }),
      h('path', { d: `M${side * 19},0 Q${side * 22},72 ${side * 17},146`, stroke: pal.stripe, 'stroke-width': 5, fill: 'none', opacity: 0.95 }),
      h('path', { d: `M${-side * 22},4 Q${-side * 25},72 ${-side * 20},146 L${-side * 12},146 Q${-side * 15},72 ${-side * 12},4Z`, fill: pal.jacketShade, opacity: 0.5 }),
    ),

    forearm: (side) => h('g', {},
      h('circle', { cx: 0, cy: 0, r: 22, fill: pal.jacket }),
      h('path', { d: 'M-22,0 L22,0 Q23,60 19,120 L-19,120 Q-23,60 -22,0Z', fill: pal.jacket }),
      h('path', { d: `M${side * 17},0 Q${side * 19},60 ${side * 15},118`, stroke: pal.stripe, 'stroke-width': 5, fill: 'none', opacity: 0.95 }),
      h('rect', { x: -18, y: 112, width: 36, height: 22, rx: 7, fill: pal.jacketShade }),
    ),

    hand: (side, open) => open
      ? h('g', {},
          h('ellipse', { cx: 0, cy: 18, rx: 17, ry: 19, fill: pal.skin, stroke: pal.skinShade, 'stroke-width': 2.5 }),
          ...[-10, -3.5, 3.5, 10].map((x, i) => h('rect', { x: x - 4, y: 24, width: 8, height: i === 0 || i === 3 ? 20 : 25, rx: 4, fill: pal.skin, stroke: pal.skinShade, 'stroke-width': 2 })),
          h('rect', { x: side * 14 - 4, y: 6, width: 8, height: 20, rx: 4, fill: pal.skin, transform: `rotate(${side * 40} ${side * 14} 8)` }),
        )
      : h('g', {},
          h('ellipse', { cx: 0, cy: 20, rx: 17, ry: 21, fill: pal.skin, stroke: pal.skinShade, 'stroke-width': 2.5 }),
          h('ellipse', { cx: -side * 12, cy: 12, rx: 7, ry: 12, fill: pal.skin, transform: `rotate(${side * 20} ${-side * 12} 12)` }),
          h('path', { d: 'M-8,30 q8,5 16,0', stroke: pal.skinShade, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round', opacity: 0.8 }),
        ),

    // Water bottle in the right hand.
    handProp: (side) => side > 0
      ? h('g', { id: `${P}bottle` },
          h('rect', { x: -15, y: -34, width: 30, height: 104, rx: 11, fill: pal.bottle, opacity: 0.92 }),
          h('rect', { x: -15, y: 34, width: 30, height: 36, rx: 11, fill: '#3FC7DD', opacity: 0.9 }),
          h('rect', { x: -9, y: -28, width: 5, height: 88, rx: 2.5, fill: '#fff', opacity: 0.55 }),
          h('rect', { x: -11, y: -48, width: 22, height: 16, rx: 5, fill: pal.bottleCap }),
        )
      : '',
  };
  return buildCharacter(costume);
}
