// Shared humanoid rig for the NeuroPro cast.
//
// A character = skeleton dims + costume (markup functions) + palette.
// The rig owns the skeleton, face mechanics (eyes, blinks, brows, mouth, head turn) and IK,
// so every character in the series moves and emotes the same way. Adding a new cast member
// means writing a new costume file, not new animation code.
//
// Local coordinate system: origin on the ground between the feet, y up is negative.

import { h, tr, rot, sc, Rig, mouthPath } from '../engine/svg.js';
import { ik2 } from '../engine/anim.js';

/** Default pose; scenes override only what they animate. */
export const basePose = () => ({
  x: 0, y: 0, s: 1, flip: 1,
  lean: 0, breathe: 0, bob: 0, bodySquash: 0, bodyTurn: 0,
  headTilt: 0, headTurn: 0, nod: 0,
  eyeX: 0, eyeY: 0, blink: 0, squint: 0,
  expr: { browLift: 0, browFurrow: 0, browAsym: 0, mouthW: 1, smile: 0.25, open: 0 },
  handL: null, handR: null,          // IK targets [x, y] in local coords (null = relaxed)
  handAngL: null, handAngR: null,    // absolute hand angle (deg) or null to follow forearm
  handOpenL: 0, handOpenR: 0,        // 0 = relaxed hand, 1 = open palm
  footL: null, footR: null,          // [dx, lift] offsets from rest
});

export function buildCharacter(costume) {
  const { prefix: P, dims: D, pal } = costume;
  const id = (n) => `${P}${n}`;

  const eye = (side) => {
    const e = D.eyes, cx = side * e.dx, cy = e.y;
    const clip = id(`eyeClip${side < 0 ? 'L' : 'R'}`);
    const s = side < 0 ? 'L' : 'R';
    return h('g', { id: id(`eye${s}`) },
      h('clipPath', { id: clip }, h('ellipse', { cx, cy, rx: e.rx, ry: e.ry })),
      h('ellipse', { cx, cy, rx: e.rx, ry: e.ry, fill: '#FDFBF7' }),
      h('g', { 'clip-path': `url(#${clip})` },
        h('g', { id: id(`iris${s}`) },
          h('circle', { cx, cy: cy + 1, r: e.iris, fill: pal.iris }),
          h('circle', { cx, cy: cy + 1, r: e.iris * 0.52, fill: '#120a07' }),
          h('circle', { cx: cx + e.iris * 0.36, cy: cy - e.iris * 0.38, r: e.iris * 0.33, fill: '#fff' }),
          h('circle', { cx: cx - e.iris * 0.32, cy: cy + e.iris * 0.42, r: e.iris * 0.14, fill: '#fff', opacity: 0.8 }),
        ),
        // lower-lid "smile squint"
        h('ellipse', { id: id(`squint${s}`), cx, cy: cy + e.ry * 2.1, rx: e.rx * 1.6, ry: e.ry, fill: pal.skin }),
        // soft top shadow for depth
        h('ellipse', { cx, cy: cy - e.ry * 1.15, rx: e.rx * 1.3, ry: e.ry * 0.55, fill: pal.skinShade, opacity: 0.22 }),
      ),
      // lash line
      h('path', {
        d: `M${cx - e.rx * 1.05},${cy - 2} Q${cx},${cy - e.ry * 1.28} ${cx + e.rx * 1.05},${cy - 3}` +
           (e.lashWing ? ` M${cx + side * e.rx * 0.95},${cy - 4} l${side * 5},-4` : ''),
        fill: 'none', stroke: pal.lash || pal.hair, 'stroke-width': e.lash, 'stroke-linecap': 'round',
      }),
    );
  };

  const brow = (side) => {
    const b = D.brows, s = side < 0 ? 'L' : 'R';
    return h('g', { id: id(`brow${s}`) },
      h('path', {
        d: `M${-b.w * side},${2} Q0,${-b.arch} ${b.w * side},${3}`,
        fill: 'none', stroke: pal.brow || pal.hair, 'stroke-width': b.thick, 'stroke-linecap': 'round',
      }));
  };

  const m = D.mouth;
  const markup = h('g', { id: id('root') },
    // contact shadow
    h('ellipse', { id: id('shadow'), cx: 0, cy: 4, rx: D.shadowRx, ry: 18, fill: '#0B2545', opacity: 0.16, filter: 'url(#softBlur)' }),
    // legs (shoe is kept level, leg stretches/rotates toward it)
    ...[-1, 1].map((side) => {
      const s = side < 0 ? 'L' : 'R';
      return h('g', {},
        h('g', { id: id(`shoe${s}`) }, costume.shoe(side)),
        h('g', { id: id(`leg${s}`) }, costume.leg(side)),
      );
    }),
    h('g', { id: id('body') },
      h('g', { id: id('torso') }, costume.pelvis(), costume.torso()),
      // head
      h('g', { id: id('head') },
        costume.neck ? costume.neck() : '',
        h('g', { id: id('headBack') }, costume.headBack()),
        costume.face(),
        h('g', { id: id('features') },
          costume.blush ? costume.blush() : '',
          eye(-1), eye(1),
          costume.nose(),
          h('g', { transform: tr(m.x, m.y) },
            h('clipPath', { id: id('mouthClip') }, h('path', { id: id('mouthClipPath'), d: mouthPath(m.w, 0.2, 0) })),
            h('path', { id: id('mouth'), d: mouthPath(m.w, 0.2, 0), fill: pal.mouth || '#5A2522' }),
            h('g', { 'clip-path': `url(#${id('mouthClip')})` },
              h('rect', { id: id('teeth'), x: -m.w, y: -12, width: m.w * 2, height: 9, fill: '#FFFDF8' }),
              h('ellipse', { cx: 0, cy: 16, rx: m.w * 0.6, ry: 8, fill: '#C8575A', opacity: 0.85 }),
            ),
          ),
          h('g', { id: id('browL'+'Wrap') }, brow(-1)),
          h('g', { id: id('browR'+'Wrap') }, brow(1)),
          costume.featuresExtra ? costume.featuresExtra() : '',
        ),
        h('g', { id: id('hairFront') }, costume.hairFront()),
      ),
      // arms on top of torso
      ...[-1, 1].map((side) => {
        const s = side < 0 ? 'L' : 'R';
        return h('g', { id: id(`arm${s}`) },
          h('g', { id: id(`uarm${s}`) }, costume.upperArm(side),
            h('g', { id: id(`farm${s}`) }, costume.forearm(side),
              h('g', { id: id(`hand${s}`) },
                costume.handProp ? costume.handProp(side) : '',
                h('g', { id: id(`handRelax${s}`) }, costume.hand(side, false)),
                h('g', { id: id(`handOpen${s}`), opacity: 0 }, costume.hand(side, true)),
              ),
            ),
          ),
        );
      }),
    ),
  );

  return {
    costume, markup, D,
    /** Bind to the mounted DOM and return an apply(pose) function. */
    mount(rootEl) {
      const r = new Rig(rootEl, P);
      const restHand = (side) => [side * (D.shoulderX + 14), D.shoulderY + (D.upperArm + D.forearm) * 0.985];

      return (pose) => {
        const p = { ...basePose(), ...pose, expr: { ...basePose().expr, ...(pose.expr || {}) } };
        r.t('root', `${tr(p.x, p.y)} ${sc(p.s * p.flip, p.s)}`);
        r.o('shadow', 0.16 * (1 - Math.min(0.6, p.bob / 40)));

        // Legs: rotate + stretch each leg toward its (level) shoe.
        for (const side of [-1, 1]) {
          const s = side < 0 ? 'L' : 'R';
          const f = (side < 0 ? p.footL : p.footR) || [0, 0];
          const hipX = side * D.hipX, hipY = D.hipY - p.bob;
          const ax = side * D.hipX + side * D.stance + f[0], ay = -D.ankle - f[1];
          const dx = ax - hipX, dy = ay - hipY;
          const len = Math.hypot(dx, dy), ang = Math.atan2(-dx, dy) * 180 / Math.PI;
          r.t(`leg${s}`, `${tr(hipX, hipY)} ${rot(ang)} ${sc(1, len / D.legLen)}`);
          r.t(`shoe${s}`, tr(ax, ay));
        }

        // Body: bob, lean around hips, gentle breathing on torso.
        const hipC = D.hipY;
        r.t('body', `${tr(0, -p.bob)} ${rot(p.lean, 0, hipC)} translate(0 ${hipC}) ${sc(1 - p.bodyTurn * 0.06 + p.bodySquash * 0.04, 1 - p.bodySquash * 0.04)} translate(0 ${-hipC})`);
        const br = 1 + p.breathe * 0.012;
        r.t('torso', `translate(0 ${hipC}) ${sc(1 + p.breathe * 0.006, br)} translate(0 ${-hipC})`);

        // Head: tilt around neck, lift with breath, 2.5D turn by sliding layers at different rates.
        r.t('head', `${tr(0, (br - 1) * (D.neckY - hipC) + p.nod * 3)} ${rot(p.headTilt, 0, D.neckY)}`);
        r.t('features', tr(p.headTurn * D.turnPx, p.nod * 5));
        r.t('hairFront', tr(p.headTurn * D.turnPx * 0.35, 0));
        r.t('headBack', tr(-p.headTurn * D.turnPx * 0.4, 0));

        // Eyes
        const e = D.eyes;
        for (const side of [-1, 1]) {
          const s = side < 0 ? 'L' : 'R';
          const cx = side * e.dx, cy = e.y;
          r.t(`eye${s}`, `translate(${cx} ${cy}) ${sc(1, Math.max(0.06, 1 - p.blink * 0.94))} translate(${-cx} ${-cy})`);
          r.t(`iris${s}`, tr(p.eyeX * e.rx * 0.38, p.eyeY * e.ry * 0.3));
          r.t(`squint${s}`, tr(0, -p.squint * e.ry * 0.75));
        }

        // Brows: lift, concern (inner ends up), asymmetry.
        const x = p.expr, b = D.brows;
        for (const side of [-1, 1]) {
          const s = side < 0 ? 'L' : 'R';
          const lift = x.browLift * b.liftPx + side * -x.browAsym * b.liftPx * 0.45;
          const ang = side * x.browFurrow * 13 + side * -x.smile * 2;
          r.t(`brow${s}`, `${tr(side * e.dx, b.y - lift)} ${rot(ang)}`);
        }

        // Mouth
        const d = mouthPath(m.w * x.mouthW, x.smile, x.open);
        r.d('mouth', d);
        r.d('mouthClipPath', d);

        // Arms via 2-bone IK (elbows bend outward).
        for (const side of [-1, 1]) {
          const s = side < 0 ? 'L' : 'R';
          const target = (side < 0 ? p.handL : p.handR) || restHand(side);
          const shx = side * D.shoulderX, shy = D.shoulderY;
          // Pick the elbow solution that sits outward and low — reads natural from the front.
          const ka = ik2(shx, shy, target[0], target[1], D.upperArm, D.forearm, 1);
          const kb = ik2(shx, shy, target[0], target[1], D.upperArm, D.forearm, -1);
          const score = (q) => side * q.elbow[0] + 0.35 * q.elbow[1];
          const k = score(ka) >= score(kb) ? ka : kb;
          r.t(`arm${s}`, tr(shx, shy));
          r.t(`uarm${s}`, rot(k.upper));
          r.t(`farm${s}`, `${tr(0, D.upperArm)} ${rot(k.lower)}`);
          const abs = side < 0 ? p.handAngL : p.handAngR;
          const handRot = abs == null ? 0 : abs - k.upper - k.lower;
          r.t(`hand${s}`, `${tr(0, D.forearm)} ${rot(handRot)}`);
          const open = side < 0 ? p.handOpenL : p.handOpenR;
          r.o(`handRelax${s}`, 1 - open);
          r.o(`handOpen${s}`, open);
        }
      };
    },
  };
}

/** Blend a named expression preset pair into a pose.expr. */
export function expression(presets, a, b = a, k = 0) {
  const A = presets[a], B = presets[b];
  const out = {};
  for (const key of Object.keys(A)) if (!key.startsWith('_')) out[key] = A[key] + (B[key] - A[key]) * k;
  return out;
}
