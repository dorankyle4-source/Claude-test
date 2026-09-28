// Screen-space graphics for Episode 3 — same card / label / type language as Episodes 1–2.

import { h, tr, rot, sc } from '../../engine/svg.js';
import { prog, outCubic, inCubic, outBack, inOutCubic, clamp, lerp, fnoise } from '../../engine/anim.js';

const NAVY = '#0B1829';
const CARD = { w: 380, hgt: 300 };
const CARDS = [[1230, 330], [1650, 330], [1230, 705], [1650, 705]];

function scramble(str, t, amt) {
  if (amt <= 0) return str;
  const a = str.split('');
  const n = Math.floor(amt * a.length * 0.6);
  for (let i = 0; i < n; i++) {
    const j = Math.floor((Math.abs(Math.sin(Math.floor(t * 5) * 13.1 + i * 7.7)) * 1e4) % a.length);
    const k = Math.floor((Math.abs(Math.sin(Math.floor(t * 5) * 3.7 + i * 1.3)) * 1e4) % a.length);
    if (a[j] !== ' ' && a[k] !== ' ') [a[j], a[k]] = [a[k], a[j]];
  }
  return a.join('');
}

export function createOverlays(cfg, T) {
  const c = cfg.brand.colors, F = cfg.brand.fonts;
  const txt = (x, y, s, size, fill = NAVY, weight = 800, anchor = 'start', extra = {}) =>
    h('text', { x, y, 'text-anchor': anchor, 'font-family': weight >= 700 ? F.display : F.body, 'font-weight': weight, 'font-size': size, fill, ...extra }, s);
  const eyebrow = (id, s) => h('text', { id, x: 110, y: 120, 'font-family': F.display, 'font-weight': 800, 'font-size': 30, fill: c.tealDeep, 'letter-spacing': 5, opacity: 0 }, s);
  const cardShell = (i, title, inner) => h('g', { id: `vc${i}`, opacity: 0 },
    h('rect', { x: -CARD.w / 2, y: -CARD.hgt / 2, width: CARD.w, height: CARD.hgt, rx: 28, fill: '#FFFFFF', filter: 'url(#dropShadow)' }),
    inner, txt(0, CARD.hgt / 2 - 30, title, 30, NAVY, 800, 'middle'));

  const TOKENS = ['A', 'b', '7', '?', 'abc', '123', 'x²', '…', 'Z'];
  const TOWER = [
    ['Notification', h('g', {}, h('rect', { x: -20, y: -34, width: 40, height: 68, rx: 9, fill: NAVY }), h('rect', { x: -15, y: -27, width: 30, height: 50, rx: 4, fill: c.cyan }), h('circle', { cx: 20, cy: -32, r: 11, fill: c.coral }))],
    ['Coffee', h('g', {}, h('path', { d: 'M-24,-24 L24,-24 L18,28 Q17,34 10,34 L-10,34 Q-17,34 -18,28Z', fill: c.coral, stroke: NAVY, 'stroke-width': 5, 'stroke-linejoin': 'round' }), h('path', { d: 'M22,-12 q18,4 0,24', fill: 'none', stroke: NAVY, 'stroke-width': 5 }), h('path', { d: 'M-8,-34 q-6,-8 0,-14 M6,-34 q-6,-8 0,-14', fill: 'none', stroke: '#B9C9D9', 'stroke-width': 4, 'stroke-linecap': 'round' }))],
    ['Email', h('g', {}, h('rect', { x: -32, y: -22, width: 64, height: 44, rx: 6, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 5 }), h('path', { d: 'M-32,-20 L0,6 L32,-20', fill: 'none', stroke: NAVY, 'stroke-width': 5, 'stroke-linejoin': 'round' }))],
    ['Conversation', h('g', {}, h('path', { d: 'M-30,-24 L30,-24 Q36,-24 36,-18 L36,8 Q36,14 30,14 L-6,14 L-18,28 L-16,14 L-30,14 Q-36,14 -36,8 L-36,-18 Q-36,-24 -30,-24Z', fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 5, 'stroke-linejoin': 'round' }), h('path', { d: 'M-20,-8 h40 M-20,2 h26', stroke: c.teal, 'stroke-width': 5, 'stroke-linecap': 'round' }))],
    ['Keys', h('g', {}, h('circle', { cx: -16, cy: 0, r: 16, fill: 'none', stroke: c.amber, 'stroke-width': 8 }), h('path', { d: 'M0,0 L34,0 M22,0 L22,12 M30,0 L30,10', stroke: c.amber, 'stroke-width': 8, 'stroke-linecap': 'round' }))],
    ['Leave the house', h('g', {}, h('rect', { x: -22, y: -34, width: 44, height: 68, rx: 4, fill: c.violet, stroke: NAVY, 'stroke-width': 5 }), h('circle', { cx: 12, cy: 2, r: 4, fill: '#FFFFFF' }))],
  ];

  const markup = h('g', { id: 'ov3' },
    eyebrow('ov-e3', 'WHAT IT FEELS LIKE'), eyebrow('ov-e4', 'IT’S NOT LAZINESS'), eyebrow('ov-e6', 'THE EVERYDAY EFFECT'), eyebrow('ov-e7', 'WHAT HELPS'),
    // BRAIN FOG label
    h('g', { id: 'bf', opacity: 0 },
      h('path', { d: 'M-300,70 C-360,70 -370,-10 -310,-24 C-320,-100 -220,-126 -170,-84 C-140,-150 -30,-160 10,-100 C50,-150 170,-140 190,-74 C260,-100 340,-40 300,24 C350,40 340,110 270,110 L-280,110 C-330,110 -340,70 -300,70Z', fill: '#E4E6F3', stroke: NAVY, 'stroke-width': 8, 'stroke-linejoin': 'round' }),
      txt(0, 50, 'BRAIN FOG', 92, NAVY, 800, 'middle', { 'letter-spacing': 3 })),
    h('g', { id: 'tok', 'font-family': F.display, 'font-weight': 800, 'font-size': 54, fill: c.ink }, ...TOKENS.map((s, i) => h('text', { id: `tk${i}`, 'text-anchor': 'middle', opacity: 0 }, s))),
    // four vignettes
    h('defs', {}, h('filter', { id: 'vc-blur', x: '-20%', y: '-40%', width: '140%', height: '180%' }, h('feGaussianBlur', { id: 'vc-blurStd', stdDeviation: 0 }))),
    cardShell(0, 'Reading', h('g', {},
      h('rect', { x: -130, y: -110, width: 260, height: 160, rx: 10, fill: '#F3F6F9' }),
      h('g', { id: 'vc-lines', filter: 'url(#vc-blur)' }, ...[0, 1, 2, 3, 4].map((i) => h('rect', { x: -110, y: -92 + i * 28, width: [210, 180, 200, 150, 190][i], height: 12, rx: 6, fill: '#7F8FA3' }))))),
    cardShell(1, 'Remembering', h('g', {},
      h('path', { id: 'vc-bub', d: 'M-90,20 C-130,20 -130,-40 -90,-44 C-94,-96 -20,-110 0,-74 C30,-110 110,-96 96,-40 C136,-36 130,20 90,20Z', fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 6 }),
      h('circle', { cx: -40, cy: 46, r: 12, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 5 }), h('circle', { cx: -62, cy: 72, r: 7, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 4 }),
      h('g', { id: 'vc-key', transform: 'translate(0 -36)' }, h('circle', { cx: -22, cy: 0, r: 16, fill: 'none', stroke: c.amber, 'stroke-width': 8 }), h('path', { d: 'M-6,0 L30,0 M18,0 L18,12 M26,0 L26,10', stroke: c.amber, 'stroke-width': 8, 'stroke-linecap': 'round' })),
      txt(0, -18, '?', 64, c.violet, 800, 'middle', { id: 'vc-q', opacity: 0 }))),
    cardShell(2, 'Conversations', h('g', {},
      h('g', { transform: 'translate(-40 -70)' }, h('rect', { x: -110, y: -30, width: 220, height: 60, rx: 30, fill: '#E4F5F2', stroke: NAVY, 'stroke-width': 5 }), txt(0, 10, 'Meet at 3?', 28, NAVY, 700, 'middle', { id: 'vc-s1' })),
      h('g', { transform: 'translate(40 10)' }, h('rect', { x: -110, y: -30, width: 220, height: 60, rx: 30, fill: '#FDEDE7', stroke: NAVY, 'stroke-width': 5 }), txt(0, 10, 'Sure, where?', 28, NAVY, 700, 'middle', { id: 'vc-s2' })))),
    cardShell(3, 'Multitasking', h('g', {}, ...[0, 1, 2, 3, 4].map((i) => h('g', { id: `vc-m${i}` },
      h('rect', { x: -56, y: -20, width: 112, height: 40, rx: 12, fill: [c.teal, c.coral, c.violet, c.amber, c.sky][i], stroke: NAVY, 'stroke-width': 5 }))))),
    // battery above the head + message
    h('g', { id: 'bat', opacity: 0 },
      txt(0, -92, 'BRAIN ENERGY', 26, NAVY, 800, 'middle', { 'letter-spacing': 4 }),
      h('rect', { x: -170, y: -70, width: 340, height: 140, rx: 26, fill: '#FFFFFF', stroke: NAVY, 'stroke-width': 10 }),
      h('rect', { x: 170, y: -26, width: 24, height: 52, rx: 8, fill: NAVY }),
      h('rect', { id: 'bat-fill', x: -154, y: -54, width: 308, height: 108, rx: 16, fill: c.teal }),
      txt(0, 16, '100%', 44, NAVY, 800, 'middle', { id: 'bat-pct' })),
    h('g', { id: 'harder', opacity: 0 }, txt(0, 0, 'Your brain is', 64, NAVY, 800, 'start'), txt(0, 76, 'working harder.', 64, c.coral, 800, 'start')),
    // morning tower
    h('g', { id: 'tw' }, ...TOWER.map(([label, icon], i) => h('g', { id: `tw${i}`, opacity: 0 },
      h('rect', { x: -170, y: -50, width: 340, height: 100, rx: 24, fill: '#FFFFFF', filter: 'url(#dropShadow)' }),
      h('g', { transform: 'translate(-110 0)' }, icon), txt(-50, 12, label, 32, NAVY, 700)))),
    h('g', { id: 'one', opacity: 0 }, txt(0, 0, 'One thing at a time', 40, NAVY, 800, 'middle')),
    // takeaway cards
    ...[['tk-a', 'ONE TASK', 'Focus on one thing at a time', h('g', {}, h('circle', { r: 50, fill: c.teal }), txt(0, 22, '1', 62, '#FFFFFF', 800, 'middle'))],
      ['tk-b', 'TAKE BREAKS', 'Rest before you run on empty', h('g', {}, h('circle', { r: 50, fill: c.amber }), h('rect', { x: -18, y: -24, width: 12, height: 48, rx: 5, fill: '#fff' }), h('rect', { x: 6, y: -24, width: 12, height: 48, rx: 5, fill: '#fff' }))],
      ['tk-c', 'LISTEN TO YOUR SYMPTOMS', 'Ease off when they flare up', h('g', {}, h('circle', { r: 50, fill: c.violet }), h('path', { d: 'M-20,0 L-8,0 L-2,-16 L6,16 L12,0 L22,0', fill: 'none', stroke: '#fff', 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }))]].map(([id, t1, t2, icon]) =>
      h('g', { id, opacity: 0 },
        h('rect', { x: 0, y: -70, width: 740, height: 140, rx: 30, fill: '#FFFFFF', filter: 'url(#dropShadow)' }),
        h('g', { transform: 'translate(80 0)' }, icon),
        txt(160, -4, t1, 38), txt(160, 38, t2, 26, '#4A5363', 500))),
  );

  return {
    markup,
    update(t, ctx) {
      const $ = (id) => ctx.root.querySelector(`#${id}`), set = (id, a, v) => $(id).setAttribute(a, v);
      const [mx, my] = ctx.mascotScreen, [hx, hy] = ctx.headScreen;
      const eb = (id, a, b) => set(id, 'opacity', (prog(t, a, a + 0.4) * (1 - prog(t, b - 0.3, b))).toFixed(3));
      eb('ov-e3', T.feelStart + 0.6, T.lazyStart); eb('ov-e4', T.lazyStart + 0.4, T.toNeurons); eb('ov-e6', T.toStudio + 0.6, T.clean); eb('ov-e7', T.clean + 0.4, T.badgeIn);

      // BRAIN FOG + tokens drifting into the fog and slowing down
      const bk = outBack(prog(t, T.brainFog, T.brainFog + 0.35), 2), bOut = prog(t, T.feelStart - 0.4, T.feelStart, inCubic);
      set('bf', 'opacity', (prog(t, T.brainFog, T.brainFog + 0.12) * (1 - bOut)).toFixed(3));
      set('bf', 'transform', `translate(1450 330) ${sc(lerp(1.6, 1, bk) * (1 - bOut * 0.2))} ${rot(-3)}`);
      for (let i = 0; i < 9; i++) {
        const st = T.tokens + i * 0.32, u = t - st;
        if (u < 0 || t > T.feelStart) { set(`tk${i}`, 'opacity', 0); continue; }
        const travel = 1 - Math.exp(-u * 1.6);                  // decelerates as it enters the fog
        const sx = 1300 + (i % 3) * 60, sy = 560 + (i % 4) * 70;
        const ang = u * 1.2 + i;
        const x = lerp(sx, hx + Math.cos(ang) * 150, travel), y = lerp(sy, hy + Math.sin(ang) * 90, travel);
        set(`tk${i}`, 'x', x.toFixed(1)); set(`tk${i}`, 'y', y.toFixed(1));
        set(`tk${i}`, 'opacity', (Math.min(1, u * 3) * (1 - travel * 0.75) * (1 - bOut)).toFixed(3));
        set(`tk${i}`, 'transform', `rotate(${(Math.sin(u * 2 + i) * 20).toFixed(1)} ${x.toFixed(1)} ${y.toFixed(1)})`);
      }

      // four vignettes
      const ats = [T.reading, T.memory, T.talk, T.multitask], out3 = prog(t, T.cardsOut3, T.cardsOut3 + 0.4, inCubic);
      CARDS.forEach(([x, y], i) => {
        const k = outBack(prog(t, ats[i] - 0.1, ats[i] + 0.3), 1.6);
        set(`vc${i}`, 'opacity', (prog(t, ats[i] - 0.1, ats[i] + 0.05) * (1 - out3)).toFixed(3));
        set(`vc${i}`, 'transform', `translate(${x + out3 * 400} ${y}) ${sc(0.85 + 0.15 * k)}`);
      });
      set('vc-blurStd', 'stdDeviation', (prog(t, T.reading + 0.3, T.reading + 1.4) * 5).toFixed(2));
      set('vc-lines', 'transform', tr(Math.sin(t * 3) * 3 * prog(t, T.reading + 0.3, T.reading + 1), 0));
      const forget = prog(t, T.memory + 0.5, T.memory + 1.2);
      set('vc-key', 'opacity', (1 - forget).toFixed(3));
      set('vc-key', 'transform', `translate(0 ${-36 - forget * 20}) ${sc(1 - forget * 0.5)}`);
      set('vc-bub', 'stroke-dasharray', forget > 0.5 ? '10 10' : 'none');
      set('vc-q', 'opacity', prog(t, T.memory + 1.0, T.memory + 1.3).toFixed(3));
      const jum = prog(t, T.talk + 0.3, T.talk + 1.2);
      $('vc-s1').textContent = scramble('Meet at 3?', t, jum);
      $('vc-s2').textContent = scramble('Sure, where?', t + 0.37, jum);
      for (let i = 0; i < 5; i++) {
        const at = T.multitask + i * 0.22, k = prog(t, at, at + 0.3, outCubic);
        const wob = prog(t, T.multitask + 1.1, T.multitask + 1.5) * Math.sin(t * 6 + i) * 6;
        set(`vc-m${i}`, 'opacity', k > 0 ? 1 : 0);
        set(`vc-m${i}`, 'transform', `translate(${((i % 2 ? 14 : -14) + wob).toFixed(1)} ${(lerp(-200, 46 - i * 38, k)).toFixed(1)}) rotate(${((i % 2 ? 6 : -5) + wob).toFixed(1)})`);
      }

      // battery + message
      const lvl = keys3(t, T);
      const bIn = outBack(prog(t, T.battery, T.battery + 0.4), 1.6), bOut2 = prog(t, T.toNeurons - 0.4, T.toNeurons, inCubic);
      set('bat', 'opacity', (prog(t, T.battery, T.battery + 0.15) * (1 - bOut2)).toFixed(3));
      set('bat', 'transform', `translate(${mx} ${my - 400}) ${sc(bIn)}`);
      set('bat-fill', 'width', (308 * lvl).toFixed(1));
      set('bat-fill', 'fill', lvl > 0.55 ? c.teal : lvl > 0.25 ? c.amber : c.coral);
      $('bat-pct').textContent = `${Math.round(lvl * 100)}%`;
      const hk = prog(t, T.harder, T.harder + 0.5, outCubic);
      set('harder', 'opacity', (hk * (1 - bOut2)).toFixed(3));
      set('harder', 'transform', tr(1300 + (1 - hk) * 40, 700));

      // morning tower: stacks up, sways, freezes, then collapses to one task
      const n = T.items.filter((a) => t >= a).length;
      const simp = prog(t, T.simplify, T.simplify + 0.8, inOutCubic);
      const [bx, by] = ctx.towerBase;
      const frz = prog(t, T.freeze, T.freeze + 0.3) * (1 - simp);
      const sway = (Math.sin(t * 2.4) * n * 0.9 + fnoise(t * 25, 4) * 2.5 * frz) * (1 - simp);
      T.items.forEach((at, i) => {
        const k = outBack(prog(t, at, at + 0.35), 1.4);
        const baseY = by - 60 - i * 108, drop = lerp(-500, 0, k);
        let x = bx + Math.sin((baseY - by) * 0.004) * sway * 18, y = baseY + drop, op = prog(t, at, at + 0.1), r = sway * (0.6 + i * 0.25);
        if (i === 1) { x = lerp(x, bx, simp); y = lerp(y, by - 60, simp); r = lerp(r, 0, simp); }       // coffee stays
        else { x += simp * (i % 2 ? 900 : -900); y -= simp * 300; op *= 1 - simp; }
        const endOut = prog(t, T.clean - 0.4, T.clean, inCubic);
        set(`tw${i}`, 'opacity', (op * (1 - endOut)).toFixed(3));
        set(`tw${i}`, 'transform', `translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${r.toFixed(2)})`);
      });
      const oneK = prog(t, T.relax, T.relax + 0.5, outCubic) * (1 - prog(t, T.clean - 0.4, T.clean, inCubic));
      set('one', 'opacity', oneK.toFixed(3));
      set('one', 'transform', tr(bx, by + 30 + (1 - oneK) * 14));

      // takeaway cards
      for (const [id, at, y] of [['tk-a', T.one, 330], ['tk-b', T.breaks, 510], ['tk-c', T.listen, 690]]) {
        const k = outBack(prog(t, at, at + 0.4), 1.5), out = prog(t, T.cardsOut, T.cardsOut + 0.35, inCubic);
        set(id, 'opacity', (prog(t, at, at + 0.15) * (1 - out)).toFixed(3));
        set(id, 'transform', `translate(${(1080 + (1 - k) * 80 + out * 200).toFixed(1)} ${y})`);
      }
    },
  };
}

// battery level over section 4: slow drain while working, faster when pushing, near-empty when exhausted
function keys3(t, T) {
  if (t < T.battery) return 1;
  if (t < T.faster) return lerp(1, 0.62, (t - T.battery) / (T.faster - T.battery));
  if (t < T.exhausted) return lerp(0.62, 0.12, inOutCubic((t - T.faster) / (T.exhausted - T.faster)));
  return 0.12 - 0.04 * clamp((t - T.exhausted) / 2);
}
