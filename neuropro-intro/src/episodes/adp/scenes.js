// The seven scenes of the ADP recap. Each returns { id, from, to, markup, update(t) }.
// Content mirrors the ADP SBS Digital Sales case deck and the SBS Digital Command Center.
import { h } from '../../engine/svg.js';
import { lerp, prog, outCubic, inOutCubic, inOutSine, keys } from '../../engine/anim.js';
import { W, H, C, SERIF, SANS, txt, g, header, figure, stroke, riseK } from './kit.js';

const rect = (a) => h('rect', a);
const bg = (fill) => rect({ width: W, height: H, fill });
const HX = 160, EYE_Y = 190, HEAD_Y = 282;       // slide header position, as in the deck
const curveD = 'M700,1000 C1060,980 1290,840 1500,610 S1800,250 1990,170';

function headerIn(K, id, t, at, ex = {}) {
  K.rise(`${id}-eye`, HX, EYE_Y, t, at, { dist: 24, ...ex });
  K.rise(`${id}-head`, HX - 4, HEAD_Y, t, at + 0.12, ex);
}

// ------------------------------------------------------------------ 1 · OPEN
function open(K, T) {
  const markup = h('g', { id: 'sc-open' },
    bg(C.navy),
    stroke('o-curve', curveD, C.navy2, 90),
    stroke('o-curve2', curveD, C.red, 6),
    rect({ id: 'o-stripe', x: 0, y: 0, width: 24, height: 0, fill: C.red }),
    g('o-eye', txt('ADP SMALL BUSINESS SERVICES | DIGITAL SALES', { size: 26, weight: 600, fill: C.pink, ls: 4 })),
    g('o-t1', txt('Re-accelerating', { size: 124, weight: 600, family: SERIF, fill: C.paper })),
    g('o-t2', txt('SBS Digital Sales', { size: 124, weight: 600, family: SERIF, fill: C.paper })),
    g('o-sub', txt('Recap and next steps', { size: 48, fill: C.light })),
    h('g', { transform: 'translate(164 812)' },
      stroke('o-arrow', 'M0,0 H380', C.red, 8),
      g('o-head', h('path', { d: 'M-24,-20 L2,0 L-24,20', fill: 'none', stroke: C.red, 'stroke-width': 8, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }))),
    g('o-foot', txt("From today's leadership discussion", { size: 26, fill: C.dim })),
  );
  return {
    id: 'open', from: 0, to: T.diag, markup,
    update(t) {
      K.attr('o-stripe', 'height', (H * prog(t, 0.05, 0.7, outCubic)).toFixed(1));
      K.draw('o-curve', prog(t, 0.5, 4.5, inOutSine));
      K.draw('o-curve2', prog(t, 0.7, 4.7, inOutSine));
      K.rise('o-eye', 160, 360, t, 0.3, { dist: 24 });
      K.rise('o-t1', 152, 506, t, 0.55);
      K.rise('o-t2', 152, 640, t, 0.8);
      K.rise('o-sub', 160, 740, t, T.recap - 0.15);
      K.draw('o-arrow', prog(t, T.forward - 0.1, T.forward + 0.45, outCubic));
      K.pop('o-head', 380, 0, t, T.forward + 0.3, { d: 0.4 });
      K.rise('o-foot', 160, 1000, t, 1.2, { dist: 12 });
    },
  };
}

// ------------------------------------------------------------------ 2 · DIAGNOSIS
function diagnosis(K, T) {
  const card = (id, dark, label, title, caption) => g(id,
    rect({ x: -300, y: -170, width: 600, height: 340, rx: 26, fill: dark ? C.navy : C.card, stroke: dark ? 'none' : C.line, 'stroke-width': 2 }),
    txt(label, { y: -78, size: 24, weight: 700, fill: dark ? C.pink : C.red, ls: 3, anchor: 'middle' }),
    txt(title, { y: 14, size: 66, weight: 600, family: SERIF, fill: dark ? C.paper : C.navy, anchor: 'middle' }),
    txt(caption, { y: 84, size: 28, fill: dark ? C.light : C.muted, anchor: 'middle' }),
    dark ? '' : stroke('d-strike', 'M-250,4 L250,-14', C.red, 10));
  const panel = (id, w) => g(id, rect({ x: 0, y: 0, width: w, height: 560, rx: 26, fill: C.card, stroke: C.line, 'stroke-width': 2 }));
  const sellers = Array.from({ length: 8 }, (_, i) => figure(`d-f${i}`, i >= 5 ? C.grey : C.navy));
  const markup = h('g', { id: 'sc-diag' },
    bg(C.cream),
    ...header('dA', 'THE BIG TAKEAWAY', "What's really holding growth back"),
    card('d-cardL', false, 'NOT A', 'Demand problem', 'Buyers are still out there'),
    card('d-cardR', true, "IT'S A", 'Capacity problem', 'Ramped sellers × time selling'),
    ...header('dB', 'WHY CAPACITY IS SHRINKING', 'Two things drain it, and they compound'),
    panel('d-pL', 780), panel('d-pR', 780),
    g('d-tL', txt('Reps leave before they ramp', { size: 36, weight: 600 })),
    g('d-door', rect({ x: -38, y: -136, width: 76, height: 136, rx: 6, fill: C.cream2, stroke: C.track, 'stroke-width': 3 }),
      h('circle', { cx: 22, cy: -66, r: 5, fill: C.grey })),
    ...sellers,
    g('d-rampLbl', txt('Time to ramp', { size: 24, weight: 600, fill: C.muted })),
    g('d-rampTrack', rect({ x: 0, y: 0, width: 560, height: 18, rx: 9, fill: C.track }), rect({ id: 'd-rampFill', x: 0, y: 0, width: 0, height: 18, rx: 9, fill: C.navy })),
    g('d-reset', txt('Ramp resets with every exit', { size: 26, weight: 700, fill: C.red })),
    g('d-tR', txt('Too little time selling', { size: 36, weight: 600 })),
    g('d-dayLbl', txt("A rep's day", { size: 24, weight: 600, fill: C.muted })),
    g('d-bar', rect({ id: 'd-sell', x: 0, y: 0, width: 0, height: 64, rx: 12, fill: C.red }), rect({ id: 'd-admin', x: 0, y: 0, width: 0, height: 64, rx: 12, fill: C.light })),
    g('d-sellLbl', txt('Selling', { size: 26, weight: 700, fill: C.red })),
    g('d-adminLbl', txt('CRM, quoting, paperwork', { size: 26, fill: C.ink2 })),
    g('d-goal', h('line', { x1: 0, y1: -14, x2: 0, y2: 94, stroke: C.navy, 'stroke-width': 4, 'stroke-dasharray': '10 8' }),
      txt('Goal: 50%+', { y: -28, size: 26, weight: 700, anchor: 'middle' })),
    g('d-crowd', txt('Admin work crowds out the selling day', { size: 30, family: SERIF, italic: true, fill: C.ink2 })),
  );
  const BAR = { x: 1020, y: 600, w: 700 };
  return {
    id: 'diag', from: T.diag, to: T.prize, markup,
    update(t) {
      // A · not demand, capacity
      const exK = prog(t, T.diagB - 0.3, T.diagB + 0.15, inOutCubic), ex = { o: 1 - exK, oy: -70 * exK };
      headerIn(K, 'dA', t, T.diag + 0.15, ex);
      K.pop('d-cardL', 640, 610, t, T.demand - 1.1, ex);
      const dim = prog(t, T.demand + 0.9, T.demand + 1.3);
      K.el('d-cardL').setAttribute('opacity', (+K.el('d-cardL').getAttribute('opacity') * (1 - 0.5 * dim)).toFixed(3));
      K.draw('d-strike', prog(t, T.demand + 0.4, T.demand + 0.8, outCubic));
      // the capacity card stamps down
      const st = prog(t, T.capacity - 0.08, T.capacity + 0.18, outCubic);
      const sS = st > 0 ? lerp(1.5, 1, st) + 0.04 * Math.sin(prog(t, T.capacity + 0.18, T.capacity + 0.6) * Math.PI) : 0;
      K.put('d-cardR', 1290, 610 + ex.oy, st * ex.o, sS, sS, (1 - st) * -6);

      // B · two drains
      const b0 = T.diagB;
      headerIn(K, 'dB', t, b0 + 0.05);
      K.rise('d-pL', 160, 360, t, b0 + 0.1, { dist: 60 });
      K.rise('d-pR', 980, 360, t, T.stay - 0.45, { dist: 60 });
      K.rise('d-tL', 200, 444, t, b0 + 0.3);
      K.rise('d-door', 880, 712, t, b0 + 0.5, { dist: 20 });
      for (let i = 0; i < 8; i++) {
        const x0 = 236 + i * 72, id = `d-f${i}`;
        if (i < 5) { K.pop(id, x0, 712, t, b0 + 0.35 + i * 0.05, { d: 0.45 }); continue; }
        // the last three walk out of the door
        const at = T.leave + (i - 5) * 0.4, wk = prog(t, at, at + 1.1, inOutSine);
        const x = lerp(x0, 880, wk), bob = wk > 0 && wk < 1 ? -Math.abs(Math.sin((t - at) * 9)) * 9 : 0;
        const p = prog(t, b0 + 0.35 + i * 0.05, b0 + 0.8 + i * 0.05, outCubic);
        K.put(id, x, 712 + bob, p * (1 - prog(wk, 0.8, 1)), p, p, wk > 0 && wk < 1 ? Math.sin((t - at) * 9) * 3 : 0);
      }
      K.rise('d-rampLbl', 236, 790, t, b0 + 0.6, { dist: 16 });
      K.rise('d-rampTrack', 236, 808, t, b0 + 0.6, { dist: 16 });
      const ramp = keys(t, [[T.leave - 0.3, 0], [T.ramp + 0.35, 0.72, inOutSine], [T.ramp + 0.5, 0.08, outCubic], [T.ramp + 3.5, 0.4, inOutSine]]);
      K.attr('d-rampFill', 'width', (560 * ramp).toFixed(1));
      K.attr('d-rampFill', 'fill', t > T.ramp + 0.35 && t < T.ramp + 1.1 ? C.red : C.navy);
      K.pop('d-reset', 236, 878, t, T.ramp + 0.45, { d: 0.45, amount: 0.1 });

      K.rise('d-tR', 1020, 444, t, T.stay - 0.1);
      K.rise('d-dayLbl', BAR.x, 548, t, T.stay);
      K.rise('d-bar', BAR.x, BAR.y, t, T.stay, { dist: 0 });
      const sk = prog(t, T.stay + 0.1, T.stay + 0.6, outCubic), ak = prog(t, T.stay + 0.45, T.stay + 1.0, outCubic);
      const sellW = BAR.w * 0.34;
      const pulse = 1 + 0.12 * Math.sin(prog(t, T.tooLittle, T.tooLittle + 0.5) * Math.PI);
      K.attr('d-sell', 'width', (sellW * sk).toFixed(1));
      K.attr('d-sell', 'height', (64 * pulse).toFixed(1));
      K.attr('d-sell', 'y', (32 - 32 * pulse).toFixed(1));
      K.attr('d-admin', 'x', (sellW + 8).toFixed(1));
      K.attr('d-admin', 'width', ((BAR.w - sellW - 8) * ak).toFixed(1));
      K.rise('d-sellLbl', BAR.x, 712, t, T.stay + 0.4, { dist: 14 });
      K.rise('d-adminLbl', BAR.x + sellW + 8, 712, t, T.stay + 0.75, { dist: 14 });
      K.pop('d-goal', BAR.x + BAR.w * 0.5, BAR.y - 6, t, T.tooLittle + 0.15, { d: 0.45, amount: 0.08 });
      K.rise('d-crowd', BAR.x, 822, t, T.tooLittle + 0.6);
    },
  };
}

// ------------------------------------------------------------------ 3 · THE PRIZE
function prize(K, T) {
  const small = Array.from({ length: 12 }, (_, i) => figure(`z-f${i}`, i % 3 === 2 ? C.pink : C.paper));
  const markup = h('g', { id: 'sc-prize' },
    bg(C.cream2),
    ...header('z', 'SIZING THE PRIZE', 'Cut attrition, and capacity comes back'),
    g('z-lbl', txt('First-year attrition', { size: 34, weight: 600 })),
    g('z-pctG', txt('48%', { id: 'z-pct', size: 140, weight: 600, family: SERIF })),
    g('z-barG', rect({ x: 0, y: 0, width: 760, height: 56, rx: 12, fill: C.track }),
      rect({ id: 'z-cut', x: 0, y: 0, width: 0, height: 56, rx: 12, fill: C.pink }),
      rect({ id: 'z-bar', x: 0, y: 0, width: 0, height: 56, rx: 12, fill: C.navy })),
    g('z-pill', rect({ x: -96, y: -36, width: 192, height: 72, rx: 36, fill: C.red }), txt('−10 pts', { y: 12, size: 34, weight: 700, fill: C.paper, anchor: 'middle' })),
    g('z-total', txt('Total attrition: 35% to 25%', { size: 30, fill: C.ink2 })),
    g('z-cost', txt('Plus ~$3.5M a year in avoided replacement cost', { size: 30, weight: 600 })),
    g('z-card', rect({ x: 0, y: 0, width: 720, height: 560, rx: 26, fill: C.navy })),
    g('z-numG', txt('~0', { id: 'z-num', size: 200, weight: 600, family: SERIF, fill: C.paper })),
    g('z-sub', txt('sellers of capacity back', { size: 36, fill: C.paper })),
    ...small,
    g('z-tag', rect({ x: -170, y: -34, width: 340, height: 68, rx: 34, fill: C.red }), txt('No new headcount', { y: 11, size: 30, weight: 700, fill: C.paper, anchor: 'middle' })),
  );
  return {
    id: 'prize', from: T.prize, to: T.plan, markup,
    update(t) {
      headerIn(K, 'z', t, T.prize + 0.15);
      K.rise('z-lbl', 160, 458, t, T.prize + 0.5);
      K.rise('z-pctG', 152, 610, t, T.prize + 0.6);
      K.rise('z-barG', 160, 660, t, T.prize + 0.7, { dist: 20 });
      const k = prog(t, T.tenPts + 0.1, T.tenPts + 0.95, inOutCubic);
      const pct = Math.round(lerp(48, 38, k));
      K.text('z-pct', `${pct}%`);
      const full = 760 * 48 / 50, now = 760 * pct / 50;
      K.attr('z-bar', 'width', Math.max(0, full * prog(t, T.prize + 0.7, T.prize + 1.5, outCubic) - (full - now)).toFixed(1));
      K.attr('z-cut', 'width', (k > 0 ? full : 0).toFixed(1));
      K.attr('z-cut', 'opacity', (1 - prog(t, T.tenPts + 1.6, T.tenPts + 2.4)).toFixed(3));
      K.pop('z-pill', 610, 560, t, T.tenPts + 0.9);
      K.rise('z-total', 160, 784, t, T.tenPts + 1.3, { dist: 16 });
      K.rise('z-cost', 160, 852, t, T.noHire + 0.35, { dist: 16 });

      K.rise('z-card', 1040, 360, t, T.twelve - 0.7, { dist: 60 });
      const n = Math.round(12 * prog(t, T.twelve - 0.05, T.twelve + 0.85, outCubic));
      K.text('z-num', `~${n}`);
      K.rise('z-numG', 1096, 590, t, T.twelve - 0.3, { dist: 20 });
      K.rise('z-sub', 1100, 656, t, T.twelve + 0.2, { dist: 16 });
      for (let i = 0; i < 12; i++) {
        const x = 1130 + (i % 6) * 76, y = i < 6 ? 776 : 870;
        K.pop(`z-f${i}`, x, y, t, T.twelve + i * 0.075, { d: 0.4 });
      }
      K.pop('z-tag', 1400, 972, t, T.noHire + 0.1);
    },
  };
}

// ------------------------------------------------------------------ 4 · THE PLAN + ONE DASHBOARD
const ICONS = {
  users: [h('circle', { cx: -8, cy: -10, r: 9 }), h('path', { d: 'M-24,16 Q-24,2 -8,2 Q8,2 8,16' }), h('circle', { cx: 12, cy: -6, r: 7 }), h('path', { d: 'M8,4 Q12,3 14,3 Q26,3 26,16' })],
  clock: [h('circle', { cx: 0, cy: 0, r: 20 }), h('path', { d: 'M0,-11 V0 L9,6' })],
  bolt: [h('path', { d: 'M4,-22 L-12,3 H1 L-4,22 L12,-3 H-1 Z' })],
  star: [h('path', { d: Array.from({ length: 10 }, (_, i) => { const r = i % 2 ? 9 : 21, a = -Math.PI / 2 + i * Math.PI / 5; return `${i ? 'L' : 'M'}${(r * Math.cos(a)).toFixed(1)},${(r * Math.sin(a)).toFixed(1)}`; }).join('') + 'Z' })],
};
const PRIORITIES = [
  { icon: 'users', title: ['Keep the sellers', 'we hire'], desc: ['Ramp, mentors, comp', 'and a career path'], lever: 'Lever: capacity' },
  { icon: 'clock', title: ['Give reps their', 'time back'], desc: ['AI takes admin', "off the rep's desk"], lever: 'Lever: productivity' },
  { icon: 'bolt', title: ['Route the right', 'buyer, fast'], desc: ['Score on fit and intent,', 'first touch under 5 min'], lever: 'Lever: win rate' },
  { icon: 'star', title: ['Compete', 'on ease'], desc: ['Simple to buy, then win', 'on compliance and service'], lever: 'Lever: win rate' },
];
const GOALS = [
  { name: 'Bookings growth', value: '+6%', d: 'M0,70 C60,68 90,62 130,48 S220,14 262,6' },
  { name: 'First-year attrition', value: '−10 pts', d: 'M0,8 C60,10 100,22 140,40 S220,66 262,72' },
  { name: 'Bookings / ramped rep', value: '+15%', d: 'M0,66 C50,64 80,58 120,44 S210,22 262,12' },
  { name: 'Selling time', value: '50%+', d: 'M0,72 C70,70 110,52 150,36 S230,16 262,10' },
];
function plan(K, T) {
  const card = (p, i) => g(`p-c${i}`,
    rect({ x: -190, y: -190, width: 380, height: 380, rx: 24, fill: C.card, stroke: C.line, 'stroke-width': 2 }),
    h('circle', { cx: -122, cy: -112, r: 40, fill: C.blush }),
    h('g', { transform: 'translate(-122 -112)', fill: 'none', stroke: C.red, 'stroke-width': 4, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, ...ICONS[p.icon]),
    txt(`0${i + 1}`, { x: 150, y: -102, size: 24, weight: 700, fill: C.muted, anchor: 'end' }),
    txt(p.title[0], { x: -152, y: -18, size: 34, weight: 600 }), txt(p.title[1], { x: -152, y: 24, size: 34, weight: 600 }),
    txt(p.desc[0], { x: -152, y: 78, size: 24, fill: C.ink2 }), txt(p.desc[1], { x: -152, y: 110, size: 24, fill: C.ink2 }),
    txt(p.lever, { x: -152, y: 160, size: 24, weight: 700, fill: C.red }));
  const tile = (gl, i) => g(`p-t${i}`,
    rect({ x: 0, y: 0, width: 310, height: 270, rx: 16, fill: C.cream }),
    txt(gl.name, { x: 24, y: 44, size: 22, weight: 600, fill: C.muted }),
    txt(gl.value, { x: 24, y: 118, size: 58, weight: 600, family: SERIF }),
    h('g', { transform: 'translate(24 150)' }, stroke(`p-s${i}`, gl.d, C.red, 5)),
    txt('Goal by month 12', { x: 24, y: 252, size: 20, fill: C.muted }));
  const tabs = ['Executive', 'Directors', 'Task owners'];
  const markup = h('g', { id: 'sc-plan' },
    bg(C.cream),
    h('defs', {}, h('filter', { id: 'winShadow', x: '-10%', y: '-10%', width: '120%', height: '130%' },
      h('feDropShadow', { dx: 0, dy: 18, stdDeviation: 22, 'flood-color': C.navy, 'flood-opacity': 0.16 }))),
    ...header('p', 'THE PLAN', 'Four priorities, one operating model'),
    ...PRIORITIES.map(card),
    g('p-found', rect({ x: 0, y: 0, width: 1600, height: 100, rx: 20, fill: C.navy }),
      txt('FOUNDATION', { x: 36, y: 60, size: 24, weight: 700, fill: C.pink, ls: 2 }),
      txt('One operating model across all four sites: one playbook, one set of KPIs, one cadence', { x: 236, y: 60, size: 28, fill: C.paper })),
    // the SBS Digital Command Center, in miniature
    g('p-dash',
      rect({ x: -700, y: -300, width: 1400, height: 600, rx: 22, fill: C.card, stroke: C.line, 'stroke-width': 2, filter: 'url(#winShadow)' }),
      rect({ x: -700, y: -300, width: 1400, height: 72, rx: 22, fill: C.navy }), rect({ x: -700, y: -256, width: 1400, height: 28, fill: C.navy }),
      h('circle', { cx: -656, cy: -264, r: 8, fill: C.red }), h('circle', { cx: -628, cy: -264, r: 8, fill: C.pink }), h('circle', { cx: -600, cy: -264, r: 8, fill: C.grey }),
      txt('SBS Digital Command Center', { x: -566, y: -255, size: 26, weight: 600, fill: C.paper }),
      txt('One set of numbers, three views', { x: 660, y: -255, size: 22, fill: C.dim, anchor: 'end' }),
      ...tabs.map((s, i) => h('g', { transform: `translate(${-650 + i * 230} -200)` },
        rect({ id: `p-tab${i}`, x: 0, y: 0, width: 210, height: 52, rx: 10, fill: C.card, stroke: C.line, 'stroke-width': 2 }),
        txt(s, { x: 105, y: 34, size: 24, weight: 600, anchor: 'middle' }))),
      rect({ id: 'p-tabLine', x: -650, y: -152, width: 210, height: 4, rx: 2, fill: C.red }),
      txt('12-MONTH GOALS', { x: -650, y: -96, size: 20, weight: 700, fill: C.muted, ls: 2 }),
      ...GOALS.map(tile)),
    ...['A', 'B', 'C', 'D'].map((s, i) => [
      stroke(`p-wire${i}`, `M${480 + i * 320},776 V842`, C.navy, 4, { 'stroke-linecap': 'butt' }),
      g(`p-site${i}`, rect({ x: -100, y: -32, width: 200, height: 64, rx: 32, fill: C.navy }), txt(`Site ${s}`, { y: 10, size: 28, weight: 600, fill: C.paper, anchor: 'middle' })),
    ]),
  );
  return {
    id: 'plan', from: T.plan, to: T.econ, markup,
    update(t) {
      const exK = prog(t, T.dash - 0.35, T.dash + 0.1, inOutCubic), ex = { o: 1 - exK, oy: -90 * exK };
      headerIn(K, 'p', t, T.plan + 0.15, ex);
      PRIORITIES.forEach((_, i) => K.pop(`p-c${i}`, 350 + i * 406.67, 540, t, T.p[i] - 0.12, { ...ex, d: 0.55 }));
      K.rise('p-found', 160, 772, t, T.model - 0.1, { ...ex, dist: 50 });

      const dk = riseK(t, T.dash - 0.05, 0.7);
      K.put('p-dash', 960, 476 + (1 - dk) * 120, dk, lerp(0.94, 1, dk));
      const tab = t < T.dash + 0.9 ? 0 : Math.min(2, Math.floor((t - T.dash - 0.9) / 0.55));
      for (let i = 0; i < 3; i++) K.attr(`p-tab${i}`, 'fill', i === tab ? C.cream2 : C.card);
      K.attr('p-tabLine', 'x', (-650 + tab * 230).toFixed(0));
      GOALS.forEach((_, i) => {
        K.rise(`p-t${i}`, -650 + i * 330, -70, t, T.dash + 0.35 + i * 0.1, { dist: 30 });
        K.draw(`p-s${i}`, prog(t, T.dash + 0.6 + i * 0.1, T.dash + 1.5 + i * 0.1, inOutSine));
      });
      for (let i = 0; i < 4; i++) {
        K.draw(`p-wire${i}`, prog(t, T.same - 0.35 + i * 0.08, T.same + 0.05 + i * 0.08, outCubic));
        K.pop(`p-site${i}`, 480 + i * 320, 878, t, T.same - 0.15 + i * 0.1, { d: 0.45 });
      }
    },
  };
}

// ------------------------------------------------------------------ 5 · ECONOMICS
const CH = { x0: 300, x1: 1700, y0: 930, y1: 640, vmax: 6.5 };
const cx = (m) => CH.x0 + (CH.x1 - CH.x0) * m / 12, cy = (v) => CH.y0 - (CH.y0 - CH.y1) * v / CH.vmax;
const invest = (m) => 3.1 * (1 - Math.pow(1 - m / 12, 2));
const value = (m) => 6.0 * Math.pow(m / 12, 1.37);
const path = (f) => Array.from({ length: 49 }, (_, i) => `${i ? 'L' : 'M'}${cx(i / 4).toFixed(1)},${cy(f(i / 4)).toFixed(1)}`).join('');
const PAYBACK = (() => { let m = 0.1; while (value(m) < invest(m) && m < 12) m += 0.01; return m; })();
function economics(K, T) {
  const col = (id, x) => g(id, txt('', { id: `${id}-v`, x, y: 460, size: 84, weight: 600, family: SERIF, fill: id === 'e-c2' ? C.pink : C.paper }),
    txt(['invested over 12 months', 'new year-one bookings', 'payback on cumulative value'][+id.slice(-1)], { x, y: 512, size: 26, fill: C.light }));
  const grid = [0, 2, 4, 6].map((v) => [
    h('line', { x1: CH.x0, x2: CH.x1, y1: cy(v), y2: cy(v), stroke: v ? C.line : C.track, 'stroke-width': v ? 2 : 3 }),
    txt(v ? `$${v}M` : '$0', { x: CH.x0 - 18, y: cy(v) + 8, size: 22, fill: C.muted, anchor: 'end' })]);
  const markup = h('g', { id: 'sc-econ' },
    bg(C.cream),
    ...header('e', 'THE ECONOMICS', 'The plan pays back inside year one'),
    g('e-band', rect({ x: 0, y: 0, width: 1600, height: 220, rx: 22, fill: C.navy }),
      h('line', { x1: 533, x2: 533, y1: 36, y2: 184, stroke: '#3A4458', 'stroke-width': 2 }), h('line', { x1: 1066, x2: 1066, y1: 36, y2: 184, stroke: '#3A4458', 'stroke-width': 2 })),
    col('e-c0', 210), col('e-c1', 743), col('e-c2', 1276),
    g('e-chart', ...grid, ...[0, 3, 6, 9, 12].map((m) => txt(`M${m}`, { x: cx(m), y: CH.y0 + 40, size: 22, fill: C.muted, anchor: 'middle' })),
      h('line', { x1: 330, x2: 380, y1: 676, y2: 676, stroke: C.grey, 'stroke-width': 5, 'stroke-dasharray': '10 8' }), txt('Cumulative investment', { x: 394, y: 684, size: 22, fill: C.ink2 }),
      h('line', { x1: 330, x2: 380, y1: 714, y2: 714, stroke: C.red, 'stroke-width': 6 }), txt('Cumulative value', { x: 394, y: 722, size: 22, fill: C.ink2 })),
    h('clipPath', { id: 'e-invCP' }, rect({ id: 'e-invClip', x: CH.x0 - 10, y: 0, width: 0, height: H })),
    h('path', { d: path(invest), fill: 'none', stroke: C.grey, 'stroke-width': 5, 'stroke-dasharray': '14 10', 'clip-path': 'url(#e-invCP)' }),
    stroke('e-val', path(value), C.red, 7),
    g('e-pay', h('line', { x1: 0, y1: CH.y1 - 10, x2: 0, y2: CH.y0, stroke: C.red, 'stroke-width': 3, 'stroke-dasharray': '8 8' }),
      txt('Payback · month 6', { x: 16, y: CH.y1 + 20, size: 26, weight: 700, fill: C.red })),
    g('e-dot', h('circle', { r: 14, fill: C.red }), h('circle', { r: 6, fill: C.paper })),
    g('e-note', txt('Illustrative 300-seller org. Value = new bookings plus avoided replacement cost.', { size: 22, fill: C.muted })),
  );
  const money = (v, plus) => `${plus ? '+' : ''}$${v.toFixed(1)}M`;
  return {
    id: 'econ', from: T.econ, to: T.next, markup,
    update(t) {
      headerIn(K, 'e', t, T.econ + 0.15);
      K.rise('e-band', 160, 336, t, T.econ + 0.35, { dist: 40 });
      K.rise('e-c0', 0, 0, t, T.inv - 0.15, { dist: 24 });
      K.rise('e-c1', 0, 0, t, T.book - 0.15, { dist: 24 });
      K.rise('e-c2', 0, 0, t, T.payback - 0.1, { dist: 24 });
      K.text('e-c0-v', money(3.1 * prog(t, T.inv - 0.1, T.inv + 0.8, outCubic)));
      K.text('e-c1-v', money(3.7 * prog(t, T.book - 0.1, T.book + 0.8, outCubic), true));
      K.text('e-c2-v', `Month ${Math.max(1, Math.round(6 * prog(t, T.payback - 0.1, T.payback + 0.6, outCubic)))}`);
      K.rise('e-chart', 0, 0, t, T.econ + 0.6, { dist: 20 });
      K.attr('e-invClip', 'width', ((CH.x1 - CH.x0 + 20) * prog(t, T.inv, T.inv + 1.8, inOutSine)).toFixed(1));
      const vk = prog(t, T.book, T.book + 2.6, inOutSine);
      K.draw('e-val', vk);
      K.pop('e-pay', cx(PAYBACK), 0, t, T.payback, { d: 0.45, amount: 0.06 });
      K.pop('e-dot', cx(PAYBACK), cy(value(PAYBACK)), t, T.payback + 0.05);
      K.rise('e-note', 160, 1012, t, T.econ + 1.0, { dist: 10 });
    },
  };
}

// ------------------------------------------------------------------ 6 · FIRST 90 DAYS
const PHASES = [
  { label: 'DAYS 1–30', title: 'Listen and baseline', b: ['Lock KPIs and the baseline', 'Attrition and time studies'], done: 'Done when: baseline dashboard live' },
  { label: 'DAYS 31–60', title: 'Prioritize and pilot', b: ['Ramp academy at one site', 'AI copilot with two teams'], done: 'Done when: pilots running, measured' },
  { label: 'DAYS 61–90', title: 'Scale and commit', b: ['Roll out what worked', 'Set 12-month targets with Finance'], done: 'Done when: 12-month plan signed off' },
];
const NX = [380, 960, 1540], LX0 = 300, LX1 = 1620, LY = 470;
function next(K, T) {
  const markup = h('g', { id: 'sc-next' },
    bg(C.cream),
    ...header('n', 'HOW WE MOVE FORWARD', 'The first 90 days'),
    g('n-trackG', h('line', { x1: LX0, x2: LX1, y1: LY, y2: LY, stroke: C.track, 'stroke-width': 10, 'stroke-linecap': 'round' })),
    stroke('n-prog', `M${LX0},${LY} H${LX1}`, C.red, 10),
    ...PHASES.map((p, i) => [
      g(`n-lbl${i}`, txt(p.label, { y: 0, size: 26, weight: 700, fill: C.red, ls: 2, anchor: 'middle' })),
      g(`n-node${i}`, h('circle', { id: `n-ring${i}`, r: 28, fill: C.cream, stroke: C.navy, 'stroke-width': 6 }),
        txt(String(i + 1), { id: `n-num${i}`, y: 10, size: 28, weight: 700, anchor: 'middle' })),
      g(`n-card${i}`, rect({ x: -275, y: 0, width: 550, height: 272, rx: 22, fill: C.card, stroke: C.line, 'stroke-width': 2 }),
        txt(p.title, { y: 66, size: 44, weight: 600, family: SERIF, anchor: 'middle' }),
        txt(p.b[0], { y: 124, size: 26, fill: C.ink2, anchor: 'middle' }), txt(p.b[1], { y: 162, size: 26, fill: C.ink2, anchor: 'middle' }),
        h('line', { x1: -220, x2: 220, y1: 196, y2: 196, stroke: C.line, 'stroke-width': 2 }),
        txt(p.done, { y: 238, size: 24, weight: 700, fill: C.red, anchor: 'middle' })),
    ]),
    g('n-dot', h('circle', { r: 22, fill: C.red, opacity: 0.25 }), h('circle', { r: 11, fill: C.red })),
  );
  const f = NX.map((x) => (x - LX0) / (LX1 - LX0));
  return {
    id: 'next', from: T.next, to: T.close, markup,
    update(t) {
      headerIn(K, 'n', t, T.next + 0.15);
      K.rise('n-trackG', 0, 0, t, T.next + 0.3, { dist: 0 });
      const pk = keys(t, [[T.next + 0.5, 0], [T.d[0], f[0], inOutCubic], [T.d[1] - 0.55, f[0]], [T.d[1], f[1], inOutCubic], [T.d[2] - 0.5, f[1]], [T.d[2], f[2], inOutCubic], [T.d[2] + 1.6, 1, inOutSine]]);
      K.draw('n-prog', pk);
      K.put('n-dot', lerp(LX0, LX1, pk), LY, prog(t, T.next + 0.5, T.next + 0.8));
      PHASES.forEach((_, i) => {
        const at = T.d[i];
        K.pop(`n-node${i}`, NX[i], LY, t, T.next + 0.4 + i * 0.12, { d: 0.45 });
        const lit = t >= at - 0.05;
        K.attr(`n-ring${i}`, 'fill', lit ? C.red : C.cream);
        K.attr(`n-ring${i}`, 'stroke', lit ? C.red : C.navy);
        K.attr(`n-num${i}`, 'fill', lit ? C.paper : C.navy);
        if (lit) { const b = 1 + 0.18 * Math.sin(prog(t, at - 0.05, at + 0.35) * Math.PI); K.put(`n-node${i}`, NX[i], LY, 1, b, b); }
        K.rise(`n-lbl${i}`, NX[i], LY - 58, t, T.next + 0.5 + i * 0.12, { dist: 16 });
        K.rise(`n-card${i}`, NX[i], 528, t, at - 0.15, { dist: 50 });
      });
    },
  };
}

// ------------------------------------------------------------------ 7 · DECISIONS + END CARD
const DECISIONS = [
  'How much to invest in seller pay and career paths',
  'Which site pilots first, and who sponsors it',
  'How far pricing transparency can go',
  'What AI can send to clients without human review',
  'Whether to add sellers or raise productivity first',
];
function close(K, T, cfg) {
  const ec = cfg.storyboard.endCard;
  const markup = h('g', { id: 'sc-close' },
    bg(C.navy),
    ...header('c', 'FOR THE LEADERSHIP TEAM', 'Five decisions will shape year one', true),
    ...DECISIONS.map((d, i) => g(`c-r${i}`,
      h('circle', { cx: 30, cy: -12, r: 30, fill: C.red }), txt(String(i + 1), { x: 30, y: -1, size: 30, weight: 700, fill: C.paper, anchor: 'middle' }),
      txt(d, { x: 92, y: 0, size: 36, fill: C.paper }))),
    g('c-input', rect({ x: 0, y: -40, width: 560, height: 80, rx: 40, fill: C.pink }),
      txt("We'd value your input on each", { x: 280, y: 11, size: 30, weight: 700, fill: C.navy, anchor: 'middle' })),
  );
  const endMarkup = h('g', { id: 'sc-end' },
    bg(C.navy),
    h('g', { transform: 'translate(420 40)' }, stroke('x-curve', curveD, C.navy2, 90), stroke('x-curve2', curveD, C.red, 6)),
    rect({ x: 0, y: 0, width: 24, height: H, fill: C.red }),
    g('x-thanks', txt(ec.thanks, { size: 156, weight: 600, family: SERIF, fill: C.paper })),
    stroke('x-rule', 'M160,560 H400', C.red, 6),
    g('x-title', txt(ec.title, { size: 46, fill: C.light })),
    g('x-from', txt(ec.from, { size: 40, weight: 700, fill: C.paper })),
    g('x-role', txt(ec.role, { size: 28, fill: C.dim })),
    g('x-note', txt("Recap of today's discussion. Figures are illustrative estimates from the case.", { size: 22, fill: C.dim })),
  );
  return [{
    id: 'close', from: T.close, to: T.end, markup,
    update(t) {
      headerIn(K, 'c', t, T.close + 0.15);
      DECISIONS.forEach((_, i) => {
        const k = riseK(t, T.close + 0.4 + i * 0.18, 0.55);
        K.put(`c-r${i}`, 160 + (1 - k) * -60, 420 + i * 100, k);
      });
      K.pop('c-input', 160, 960, t, T.input, { amount: 0.1 });
    },
  }, {
    id: 'end', from: T.end, to: T.duration + 1, markup: endMarkup,
    update(t) {
      const e = T.end;
      K.draw('x-curve', prog(t, e + 0.2, e + 3.5, inOutSine));
      K.draw('x-curve2', prog(t, e + 0.35, e + 3.7, inOutSine));
      K.rise('x-thanks', 150, 500, t, Math.max(e + 0.15, T.thanks - 0.1));
      K.draw('x-rule', prog(t, e + 0.55, e + 1.0, outCubic));
      K.rise('x-title', 160, 646, t, e + 0.7);
      K.rise('x-from', 160, 780, t, e + 1.0, { dist: 20 });
      K.rise('x-role', 160, 826, t, e + 1.1, { dist: 20 });
      K.rise('x-note', 160, 1004, t, e + 1.5, { dist: 10 });
    },
  }];
}

export function buildScenes(K, T, cfg) {
  return [open(K, T), diagnosis(K, T), prize(K, T), plan(K, T), economics(K, T), next(K, T), ...close(K, T, cfg)];
}
