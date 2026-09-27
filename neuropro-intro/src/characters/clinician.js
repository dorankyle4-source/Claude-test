// DR. RIVERA — the recurring NeuroPro clinician.
// Deliberately not a "white coat" doctor: navy quarter-zip with the NeuroPro mark, sleeves pushed up,
// round glasses, top bun, lanyard badge and a tablet. Warm, sharp, easy to talk to.

import { h } from '../engine/svg.js';
import { buildCharacter } from './rig.js';

export function createClinician(pal, brand, prefix = 'dr-') {
  const dims = {
    hipY: -318, hipX: 32, stance: 12, ankle: 36, legLen: 292,
    shoulderX: 80, shoulderY: -522, upperArm: 138, forearm: 126,
    neckY: -574, turnPx: 9, shadowRx: 108,
    eyes: { dx: 23, y: -642, rx: 12, ry: 14, iris: 9, lash: 3.4, lashWing: true },
    brows: { y: -672, w: 13, arch: 7, thick: 5, liftPx: 8 },
    mouth: { x: 0, y: -594, w: 14 },
  };
  const P = prefix;
  const c = brand.colors;

  const costume = {
    prefix: P, dims, pal: { ...pal, mouth: '#6B2B2B', brow: pal.hair },

    shoe: (side) => h('g', { transform: `translate(0 6) scale(${-side} 1)` },
      h('path', { d: 'M-33,26 L33,26 Q41,26 40,12 Q37,-7 16,-10 L-14,-10 Q-36,-7 -38,10 Q-40,26 -33,26Z', fill: pal.shoe }),
      h('path', { d: 'M-40,18 L41,18 L41,23 Q41,30 34,30 L-34,30 Q-40,30 -40,23Z', fill: pal.sole }),
      h('path', { d: 'M-6,-6 l5,5 m4,-6 l5,5', stroke: '#51627C', 'stroke-width': 2.2, 'stroke-linecap': 'round' }),
    ),

    leg: (side) => h('g', {},
      h('path', { d: 'M-30,0 L30,0 C31,80 27,150 25,180 C24,230 23,262 23,292 L-23,292 C-23,262 -24,230 -25,180 C-27,150 -31,80 -30,0Z', fill: pal.pants }),
      h('path', { d: `M${side * 8},16 C${side * 16},100 ${side * 17},200 ${side * 15},290 L${side * 23},290 C${side * 24},220 ${side * 27},120 ${side * 30},8Z`, fill: pal.pantsShade, opacity: side > 0 ? 0.9 : 0.3 }),
      h('path', { d: 'M-23,284 L23,284 L23,292 L-23,292Z', fill: pal.pantsShade }),
    ),

    pelvis: () => h('path', { d: 'M-66,-326 L66,-326 L63,-266 Q0,-248 -63,-266Z', fill: pal.pants }),

    torso: () => h('g', {},
      h('path', { d: 'M-52,-560 Q-94,-556 -100,-518 L-88,-332 Q-86,-304 -64,-302 L64,-302 Q86,-304 88,-332 L100,-518 Q94,-556 52,-560Z', fill: pal.top }),
      h('path', { d: 'M50,-558 Q92,-554 98,-518 L88,-332 Q86,-306 68,-303 Q80,-440 50,-558Z', fill: pal.topShade, opacity: 0.9 }),
      h('path', { d: 'M-56,-556 Q-88,-550 -94,-524 Q-74,-542 -48,-548Z', fill: pal.topHi, opacity: 0.9 }),
      // mock-neck collar + quarter zip
      h('path', { d: 'M-30,-560 Q-32,-582 -24,-590 L24,-590 Q32,-582 30,-560 Q0,-548 -30,-560Z', fill: pal.topHi }),
      h('path', { d: 'M0,-588 L0,-486', stroke: pal.zip, 'stroke-width': 3.5, 'stroke-linecap': 'round' }),
      h('rect', { x: -4, y: -500, width: 8, height: 16, rx: 3, fill: pal.zip }),
      // NeuroPro chest mark
      h('g', { transform: 'translate(52 -482)' },
        h('circle', { r: 11, fill: 'none', stroke: c.teal, 'stroke-width': 2.5 }),
        h('path', { d: 'M-6,2 C-6,-6 -1,-7 0,-3 C1,-7 6,-6 6,2', fill: 'none', stroke: c.teal, 'stroke-width': 2.2, 'stroke-linecap': 'round' }),
      ),
      // lanyard + badge
      h('path', { d: 'M-20,-556 L-14,-432 M20,-556 L2,-432', stroke: pal.lanyard, 'stroke-width': 4, 'stroke-linecap': 'round', fill: 'none' }),
      h('g', { transform: 'translate(-6 -430) rotate(-4)' },
        h('rect', { x: -18, y: 0, width: 36, height: 48, rx: 5, fill: pal.badge }),
        h('rect', { x: -18, y: 0, width: 36, height: 11, rx: 5, fill: c.teal }),
        h('rect', { x: -11, y: 16, width: 12, height: 14, rx: 3, fill: '#C9D6E6' }),
        h('rect', { x: 4, y: 18, width: 9, height: 3, rx: 1.5, fill: '#9AA9BD' }),
        h('rect', { x: 4, y: 24, width: 7, height: 3, rx: 1.5, fill: '#9AA9BD' }),
        h('rect', { x: -11, y: 36, width: 22, height: 3, rx: 1.5, fill: '#C9D6E6' }),
      ),
      h('path', { d: 'M-88,-332 L88,-332 L88,-318 Q86,-303 64,-302 L-64,-302 Q-86,-303 -88,-318Z', fill: pal.topShade }),
    ),

    neck: () => h('g', {},
      h('path', { d: 'M-17,-596 L17,-596 L19,-560 L-19,-560Z', fill: pal.skin }),
      h('path', { d: 'M-17,-590 Q0,-576 17,-590 L18,-578 Q0,-566 -18,-578Z', fill: pal.skinShade, opacity: 0.6 }),
    ),

    headBack: () => h('g', {},
      // bun sits behind the head
      h('circle', { cx: 10, cy: -738, r: 34, fill: pal.hair }),
      h('path', { d: 'M-12,-752 q20,-16 42,-4', stroke: pal.hairHi, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }),
      h('ellipse', { cx: 8, cy: -706, rx: 26, ry: 8, fill: c.teal }),
      ...[-1, 1].map((s) => h('g', {},
        h('ellipse', { cx: s * 53, cy: -634, rx: 10, ry: 15, fill: pal.skin }),
        h('ellipse', { cx: s * 54, cy: -633, rx: 4.5, ry: 8, fill: pal.skinShade, opacity: 0.8 }),
        h('circle', { cx: s * 53, cy: -618, r: 3.2, fill: c.cyan }),
      )),
    ),

    face: () => h('g', {},
      h('path', { d: 'M-52,-668 C-54,-624 -46,-590 -22,-576 Q0,-566 22,-576 C46,-590 54,-624 52,-668 C50,-712 28,-722 0,-722 C-28,-722 -50,-712 -52,-668Z', fill: pal.skin }),
      h('path', { d: 'M36,-588 C48,-600 52,-626 52,-668 C53,-642 50,-612 40,-592Z', fill: pal.skinShade, opacity: 0.3 }),
    ),

    blush: () => h('g', { opacity: 0.3 },
      h('ellipse', { cx: -34, cy: -610, rx: 10, ry: 5.5, fill: pal.blush }),
      h('ellipse', { cx: 34, cy: -610, rx: 10, ry: 5.5, fill: pal.blush }),
    ),

    nose: () => h('path', { d: 'M-1,-630 Q-7,-614 0,-611 Q5,-610 8,-614', fill: 'none', stroke: pal.skinShade, 'stroke-width': 3.2, 'stroke-linecap': 'round' }),

    featuresExtra: () => h('g', { fill: 'none', stroke: pal.glasses, 'stroke-width': 3.2 },
      h('rect', { x: -41, y: -660, width: 36, height: 32, rx: 14 }),
      h('rect', { x: 5, y: -660, width: 36, height: 32, rx: 14 }),
      h('path', { d: 'M-5,-646 Q0,-651 5,-646 M-41,-648 L-51,-652 M41,-648 L51,-652', 'stroke-linecap': 'round' }),
      h('path', { d: 'M-35,-654 l7,-3 M11,-654 l7,-3', stroke: '#fff', 'stroke-width': 2.4, opacity: 0.7, 'stroke-linecap': 'round' }),
    ),

    hairFront: () => h('g', {},
      // cap of hair pulled back, with a side-swept fringe
      h('path', { d: 'M-55,-652 C-62,-700 -40,-734 0,-736 C40,-734 60,-702 55,-652 C52,-676 44,-692 30,-700 C10,-708 -8,-706 -22,-700 C-38,-692 -50,-676 -55,-652Z', fill: pal.hair }),
      h('path', { d: 'M-22,-734 C-50,-722 -58,-690 -54,-652 C-46,-672 -36,-690 -14,-700 C10,-712 34,-708 50,-690 C40,-716 14,-738 -22,-734Z', fill: pal.hair }),
      h('path', { d: 'M-30,-724 C-6,-730 22,-726 38,-712', stroke: pal.hairHi, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }),
      h('path', { d: 'M-50,-660 q-4,16 2,30', stroke: pal.hair, 'stroke-width': 4, fill: 'none', 'stroke-linecap': 'round' }),
    ),

    upperArm: (side) => h('g', {},
      h('path', { d: 'M-24,-6 Q-26,70 -21,130 L21,130 Q26,70 24,-6 Q0,-26 -24,-6Z', fill: pal.top }),
      h('path', { d: `M${-side * 21},4 Q${-side * 24},70 ${-side * 19},128 L${-side * 11},128 Q${-side * 14},70 ${-side * 11},4Z`, fill: pal.topShade, opacity: 0.6 }),
      // pushed-up sleeve bunch
      h('rect', { x: -25, y: 118, width: 50, height: 26, rx: 12, fill: pal.topHi }),
      h('path', { d: 'M-18,126 q18,6 36,0 M-18,134 q18,6 36,0', stroke: pal.topShade, 'stroke-width': 2.2, fill: 'none', 'stroke-linecap': 'round' }),
    ),

    forearm: (side) => h('g', {},
      h('path', { d: 'M-17,6 L17,6 Q17,60 14,124 L-14,124 Q-17,60 -17,6Z', fill: pal.skin }),
      h('path', { d: `M${side * 10},10 Q${side * 13},60 ${side * 11},122 L${side * 14},122 Q${side * 17},60 ${side * 17},10Z`, fill: pal.skinShade, opacity: 0.45 }),
      h('rect', { x: -22, y: -6, width: 44, height: 22, rx: 10, fill: pal.topHi }),
      // smartwatch on the gesturing (left) arm
      side < 0 ? h('g', {},
        h('rect', { x: -16, y: 100, width: 32, height: 12, rx: 4, fill: c.teal }),
        h('rect', { x: -11, y: 97, width: 22, height: 18, rx: 5, fill: '#16233A' }),
        h('rect', { x: -8, y: 100, width: 16, height: 12, rx: 3, fill: c.cyan, opacity: 0.9 }),
      ) : '',
    ),

    hand: (side, open) => open
      ? h('g', {},
          h('ellipse', { cx: 0, cy: 16, rx: 15, ry: 17, fill: pal.skin, stroke: pal.skinShade, 'stroke-width': 2.4 }),
          ...[-9, -3, 3, 9].map((x, i) => h('rect', { x: x - 3.6, y: 20, width: 7.2, height: i === 0 || i === 3 ? 18 : 23, rx: 3.6, fill: pal.skin, stroke: pal.skinShade, 'stroke-width': 2 })),
          h('rect', { x: side * 13 - 3.6, y: 4, width: 7.2, height: 18, rx: 3.6, fill: pal.skin, transform: `rotate(${side * 42} ${side * 13} 6)` }),
        )
      : h('g', {},
          h('ellipse', { cx: 0, cy: 18, rx: 15, ry: 19, fill: pal.skin, stroke: pal.skinShade, 'stroke-width': 2.4 }),
          h('ellipse', { cx: -side * 11, cy: 10, rx: 6, ry: 11, fill: pal.skin, transform: `rotate(${side * 20} ${-side * 11} 10)` }),
        ),

    // Tablet held in the right hand (kept upright via handAngR).
    handProp: (side) => side > 0
      ? h('g', { transform: 'translate(-40 -8) rotate(-8)' },
          h('rect', { x: -52, y: -60, width: 100, height: 132, rx: 12, fill: pal.tablet }),
          h('rect', { x: -45, y: -53, width: 86, height: 118, rx: 7, fill: '#0F2A4A' }),
          h('circle', { cx: -2, cy: -14, r: 30, fill: pal.tabletScreen, opacity: 0.12 }),
          h('path', { d: 'M-26,-8 C-30,-26 -16,-38 -2,-32 C10,-40 28,-30 24,-12 C30,-2 20,10 8,6 C2,14 -12,12 -14,4 C-26,6 -32,-2 -26,-8Z', fill: 'none', stroke: pal.tabletScreen, 'stroke-width': 3, 'stroke-linejoin': 'round' }),
          h('path', { d: 'M-2,-32 C-8,-20 4,-12 -2,2 M-18,-14 q8,-6 14,2 M8,-20 q8,4 12,-2', fill: 'none', stroke: pal.tabletScreen, 'stroke-width': 2.4, 'stroke-linecap': 'round', opacity: 0.8 }),
          h('path', { d: 'M-34,34 L-10,34 M-34,44 L14,44 M-34,54 L0,54', stroke: pal.tabletScreen, 'stroke-width': 3.5, 'stroke-linecap': 'round', opacity: 0.6 }),
        )
      : '',
  };
  return buildCharacter(costume);
}
