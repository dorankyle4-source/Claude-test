// The scenes of the NeuroPro 2026 YTD video. Each returns { id, from, to, markup, update(t) }.
// Every number comes from the NeuroPro Clinic Dashboard (TherapyNotes pulled Sep 30, monthly close through August).
import { h } from '../../engine/svg.js';
import { lerp, prog, outCubic, inOutCubic, inOutSine } from '../../engine/anim.js';
import { W, H, C, DISPLAY, BODY, txt, g, header, stroke, riseK } from './kit.js';

const rect = (a) => h('rect', a);
const bg = (fill) => rect({ width: W, height: H, fill });
const HX = 160, EYE_Y = 190, HEAD_Y = 284;
const LOGO = '../assets/brand/neuropro-logo.png', LOGO_AR = 188 / 768;
const fmtInt = (v) => Math.round(v).toLocaleString('en-US');

function headerIn(K, id, t, at, ex = {}) {
  K.rise(`${id}-eye`, HX, EYE_Y, t, at, { dist: 24, ...ex });
  K.rise(`${id}-head`, HX - 3, HEAD_Y, t, at + 0.12, ex);
}
const foot = (id, s, dark) => g(id, txt(s, { size: 22, fill: dark ? C.light : C.muted }));

/** Brand decoration: a small neural network of dots and links, like the NeuroPro logo icon. */
function neural(id, seed, x0, y0, w, h0, n, color, op) {
  let s = seed; const r = () => ((s = (s * 16807) % 2147483647) / 2147483647);
  const pts = Array.from({ length: n }, () => [x0 + r() * w, y0 + r() * h0]);
  const links = [];
  pts.forEach((p, i) => pts.forEach((q, j) => { if (j > i && Math.hypot(p[0] - q[0], p[1] - q[1]) < 170) links.push(h('line', { x1: p[0], y1: p[1], x2: q[0], y2: q[1] })); }));
  return h('g', { id, opacity: 0 },
    h('g', { stroke: color, 'stroke-width': 2, opacity: op * 0.7 }, ...links),
    h('g', { fill: color, opacity: op }, ...pts.map(([x, y], i) => h('circle', { cx: x, cy: y, r: 5 + (i % 3) * 2 }))));
}
const donut = (id, r, w, color, track) => h('g', { transform: 'rotate(-90)' },
  h('circle', { r, fill: 'none', stroke: track, 'stroke-width': w }),
  h('circle', { id, r, fill: 'none', stroke: color, 'stroke-width': w, 'stroke-linecap': 'round', pathLength: 100, 'stroke-dasharray': '0 100' }));
const setDonut = (K, id, pct) => K.attr(id, 'stroke-dasharray', `${Math.max(0.01, pct).toFixed(2)} 100`);

// ------------------------------------------------------------------ 1 · OPEN
function open(K, T) {
  const lw = 640, lh = lw * LOGO_AR;
  const markup = h('g', { id: 'sc-open' },
    bg(C.paper),
    neural('o-netL', 11, 40, 640, 420, 400, 11, C.teal, 0.35),
    neural('o-netR', 29, 1480, 80, 400, 420, 11, C.teal, 0.35),
    g('o-logo', h('image', { href: LOGO, x: -lw / 2, y: -lh / 2, width: lw, height: lh })),
    g('o-title', txt('2026 Year to Date', { size: 132, weight: 800, family: DISPLAY, anchor: 'middle', ls: -2 })),
    stroke('o-rule', 'M860,668 H1060', C.teal, 8),
    g('o-sub', txt('January through September', { size: 46, weight: 500, fill: C.tealDeep, anchor: 'middle' })),
  );
  return {
    id: 'open', from: 0, to: T.visits, markup,
    update(t) {
      K.rise('o-netL', 0, 0, t, 0.2, { d: 1.2, dist: 30 });
      K.rise('o-netR', 0, 0, t, 0.35, { d: 1.2, dist: -30 });
      K.pop('o-logo', 960, 300, t, 0.3, { d: 0.6, amount: 0.08 });
      K.rise('o-title', 960, 590, t, 0.75);
      K.draw('o-rule', prog(t, 1.3, 1.9, outCubic));
      K.rise('o-sub', 960, 750, t, T.january - 0.25);
    },
  };
}

// ------------------------------------------------------------------ 2 · VISITS
const VIS = [340, 340, 379, 433, 446, 491, 521, 535, 605];
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
function visits(K, T) {
  const X0 = 230, X1 = 1720, BASE = 900, TOP = 400, MAX = 650, bw = 118, gap = (X1 - X0 - 9 * bw) / 8;
  const y = (v) => BASE - (BASE - TOP) * v / MAX;
  const bx = (i) => X0 + i * (bw + gap);
  const markup = h('g', { id: 'sc-visits' },
    bg(C.paper),
    ...header('v', 'VISITS PER MONTH · ALL CLINICS', 'Visits keep climbing'),
    g('v-pct', txt('+0%', { id: 'v-pctT', size: 128, weight: 800, family: DISPLAY, fill: C.tealDeep, anchor: 'end', ls: -2 })),
    g('v-pctL', txt('since January', { size: 30, fill: C.ink2, anchor: 'end' })),
    g('v-grid', ...[200, 400, 600].map((v) => [h('line', { x1: X0 - 10, x2: X1, y1: y(v), y2: y(v), stroke: C.line, 'stroke-width': 2 }),
      txt(String(v), { x: X0 - 24, y: y(v) + 8, size: 22, fill: C.muted, anchor: 'end' })]),
      h('line', { x1: X0 - 10, x2: X1, y1: BASE, y2: BASE, stroke: C.track, 'stroke-width': 3 }),
      ...MO.map((m, i) => txt(m, { x: bx(i) + bw / 2, y: BASE + 40, size: 26, fill: C.ink2, anchor: 'middle' }))),
    ...VIS.map((v, i) => rect({ id: `v-b${i}`, x: bx(i), y: BASE, width: bw, height: 0, rx: 10, fill: i === 8 ? C.teal : C.bar })),
    ...VIS.map((v, i) => g(`v-l${i}`, txt(String(v), { size: i === 0 || i === 8 ? 40 : 26, weight: i === 0 || i === 8 ? 800 : 600, family: DISPLAY, fill: i === 0 || i === 8 ? C.navy : C.muted, anchor: 'middle' }))),
    g('v-busy', rect({ x: -150, y: -34, width: 300, height: 68, rx: 34, fill: C.navy }), txt('Busiest month yet', { y: 10, size: 28, weight: 700, family: DISPLAY, fill: C.white, anchor: 'middle' })),
    foot('v-foot', 'Includes NeuTrauma and TBI Associates. January and partner September volume are held at February and August until those months close.'),
  );
  const at = (i) => 6.5 + i * 0.55;
  return {
    id: 'visits', from: T.visits, to: T.patients, markup,
    update(t) {
      headerIn(K, 'v', t, T.visits + 0.15);
      K.rise('v-grid', 0, 0, t, T.visits + 0.4, { dist: 0 });
      VIS.forEach((v, i) => {
        const k = prog(t, at(i), at(i) + 0.7, outCubic), hh = (BASE - y(v)) * k;
        K.attr(`v-b${i}`, 'y', (BASE - hh).toFixed(1));
        K.attr(`v-b${i}`, 'height', hh.toFixed(1));
        K.rise(`v-l${i}`, bx(i) + bw / 2, y(v) - 18, t, i === 0 ? Math.max(at(0) + 0.5, T.jan - 0.1) : at(i) + 0.5, { dist: 12 });
      });
      K.rise('v-pct', 1760, 300, t, T.pct - 0.3, { dist: 20 });
      K.rise('v-pctL', 1760, 346, t, T.pct, { dist: 12 });
      K.text('v-pctT', `+${Math.round(78 * prog(t, T.pct - 0.2, T.sep + 0.4, inOutCubic))}%`);
      K.pop('v-busy', bx(8) - 140, y(605) - 34, t, T.busiest - 0.1);
      K.rise('v-foot', 160, 1010, t, T.visits + 1.2, { dist: 10 });
    },
  };
}

// ------------------------------------------------------------------ 3 · PATIENTS AND MIX
function patients(K, T) {
  const dots = Array.from({ length: 40 }, (_, i) => h('circle', { id: `p-d${i}`, cx: 0, cy: 0, r: 13, fill: i % 4 === 3 ? C.teal : C.white, opacity: 0 }));
  const markup = h('g', { id: 'sc-patients' },
    bg(C.cream),
    ...header('p', 'PATIENTS AND SERVICE MIX', 'A broader practice, not just more visits'),
    g('p-big', rect({ x: 0, y: 0, width: 640, height: 560, rx: 28, fill: C.navy }),
      txt('~0', { id: 'p-num', x: 56, y: 210, size: 160, weight: 800, family: DISPLAY, fill: C.white, ls: -3 }),
      txt('unique patients served this year', { x: 60, y: 272, size: 32, fill: C.light })),
    ...dots,
    g('p-ther', rect({ x: 0, y: 0, width: 920, height: 260, rx: 28, fill: C.card, stroke: C.line, 'stroke-width': 2 }),
      h('g', { transform: 'translate(150 130)' }, donut('p-donut', 78, 30, C.teal, C.tealSoft)),
      txt('THERAPY', { x: 290, y: 78, size: 24, weight: 800, family: DISPLAY, fill: C.tealDeep, ls: 2 }),
      txt('48% of September visits', { x: 290, y: 146, size: 52, weight: 800, family: DISPLAY, ls: -1 }),
      txt('Up 89% since January', { x: 290, y: 200, size: 30, fill: C.ink2 })),
    g('p-test', rect({ x: 0, y: 0, width: 920, height: 260, rx: 28, fill: C.card, stroke: C.line, 'stroke-width': 2 }),
      txt('TESTING', { x: 290, y: 78, size: 24, weight: 800, family: DISPLAY, fill: C.tealDeep, ls: 2 }),
      txt('More than doubled', { x: 290, y: 146, size: 52, weight: 800, family: DISPLAY, ls: -1 }),
      txt('From about 35 a month to 80+ in August', { x: 290, y: 200, size: 30, fill: C.ink2 }),
      rect({ x: 60, y: 212, width: 70, height: 0, id: 'p-tb0', rx: 8, fill: C.bar }), rect({ x: 150, y: 212, width: 70, height: 0, id: 'p-tb1', rx: 8, fill: C.teal }),
      txt('Before', { x: 95, y: 244, size: 20, fill: C.muted, anchor: 'middle' }), txt('Aug +', { x: 185, y: 244, size: 20, fill: C.muted, anchor: 'middle' })),
    foot('p-foot', 'Unique partner-clinic patients are estimated from monthly counts.'),
  );
  return {
    id: 'patients', from: T.patients, to: T.revenue, markup,
    update(t) {
      headerIn(K, 'p', t, T.patients + 0.15);
      K.rise('p-big', 160, 360, t, T.patients + 0.35, { dist: 50 });
      K.text('p-num', `~${fmtInt(1010 * prog(t, T.pts - 0.1, T.pts + 1.2, outCubic))}`);
      for (let i = 0; i < 40; i++) {
        const k = prog(t, T.pts + i * 0.03, T.pts + 0.3 + i * 0.03, outCubic);
        K.attr(`p-d${i}`, 'cx', (226 + (i % 10) * 56).toFixed(0));
        K.attr(`p-d${i}`, 'cy', (730 + Math.floor(i / 10) * 44 + (1 - k) * 16).toFixed(1));
        K.attr(`p-d${i}`, 'opacity', k.toFixed(3));
      }
      K.rise('p-ther', 840, 360, t, T.therapy - 0.3, { dist: 40 });
      setDonut(K, 'p-donut', 48 * prog(t, T.therapy, T.therapy + 1.0, outCubic));
      K.rise('p-test', 840, 660, t, T.testing - 0.3, { dist: 40 });
      const b0 = 44 * prog(t, T.testing, T.testing + 0.4, outCubic), b1 = 100 * prog(t, T.testing + 0.4, T.testing + 1.1, outCubic);
      K.attr('p-tb0', 'y', (212 - b0).toFixed(1)); K.attr('p-tb0', 'height', b0.toFixed(1));
      K.attr('p-tb1', 'y', (212 - b1).toFixed(1)); K.attr('p-tb1', 'height', b1.toFixed(1));
      K.rise('p-foot', 160, 1010, t, T.patients + 1.0, { dist: 10 });
    },
  };
}

// ------------------------------------------------------------------ 4 · REVENUE AND MARGIN
const REV = [93, 106, 131, 134, 188, 169, 193], EXP = [64, 66, 69, 77, 82, 80, 83];
const CM = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];
function revenue(K, T) {
  const X0 = 230, X1 = 1060, BASE = 900, TOP = 400, MAX = 210, bw = 84, gap = (X1 - X0 - 7 * bw) / 6;
  const y = (v) => BASE - (BASE - TOP) * v / MAX, bx = (i) => X0 + i * (bw + gap);
  const expD = EXP.map((v, i) => `${i ? 'L' : 'M'}${bx(i) + bw / 2},${y(v)}`).join('');
  const markup = h('g', { id: 'sc-revenue' },
    bg(C.paper),
    ...header('r', 'REVENUE AND MARGIN · MONTHLY CLOSE', 'Booked revenue, February to August'),
    g('r-grid', ...[50, 100, 150, 200].map((v) => [h('line', { x1: X0 - 10, x2: X1, y1: y(v), y2: y(v), stroke: C.line, 'stroke-width': 2 }),
      txt(`$${v}K`, { x: X0 - 22, y: y(v) + 8, size: 22, fill: C.muted, anchor: 'end' })]),
      h('line', { x1: X0 - 10, x2: X1, y1: BASE, y2: BASE, stroke: C.track, 'stroke-width': 3 }),
      ...CM.map((m, i) => txt(m, { x: bx(i) + bw / 2, y: BASE + 40, size: 24, fill: C.ink2, anchor: 'middle' })),
      rect({ x: X0, y: 352, width: 22, height: 22, rx: 4, fill: C.bar }), txt('Revenue', { x: X0 + 32, y: 371, size: 22, fill: C.ink2 }),
      h('line', { x1: X0 + 150, x2: X0 + 190, y1: 363, y2: 363, stroke: C.coral, 'stroke-width': 6, 'stroke-linecap': 'round' }), txt('Expenses', { x: X0 + 200, y: 371, size: 22, fill: C.ink2 })),
    ...REV.map((v, i) => rect({ id: `r-b${i}`, x: bx(i), y: BASE, width: bw, height: 0, rx: 8, fill: i === 6 ? C.teal : C.bar })),
    stroke('r-exp', expD, C.coral, 6),
    g('r-panel', rect({ x: 0, y: 0, width: 600, height: 560, rx: 28, fill: C.card, stroke: C.line, 'stroke-width': 2 })),
    g('r-rev', txt('$0.00M', { id: 'r-revT', size: 104, weight: 800, family: DISPLAY, ls: -2 }), txt('booked, February to August', { y: 52, size: 28, fill: C.ink2 })),
    g('r-kept', txt('0¢', { id: 'r-keptT', size: 104, weight: 800, family: DISPLAY, fill: C.tealDeep, ls: -2 }), txt('kept of every dollar', { y: 52, size: 28, fill: C.ink2 })),
    g('r-bar', rect({ x: 0, y: 0, width: 520, height: 34, rx: 17, fill: C.track }), rect({ id: 'r-barF', x: 0, y: 0, width: 0, height: 34, rx: 17, fill: C.teal }),
      txt('Profit', { x: 0, y: 72, size: 22, fill: C.tealDeep, weight: 600 }), txt('Costs', { x: 520, y: 72, size: 22, fill: C.muted, anchor: 'end' })),
    g('r-aug', rect({ x: -140, y: -32, width: 280, height: 64, rx: 32, fill: C.navy }), txt('August: 57¢', { y: 10, size: 28, weight: 700, family: DISPLAY, fill: C.white, anchor: 'middle' })),
    foot('r-foot', 'Monthly close, February to August. July and August closes are drafts.'),
  );
  return {
    id: 'revenue', from: T.revenue, to: T.unit, markup,
    update(t) {
      headerIn(K, 'r', t, T.revenue + 0.15);
      K.rise('r-grid', 0, 0, t, T.revenue + 0.35, { dist: 0 });
      REV.forEach((v, i) => {
        const k = prog(t, T.revenue + 0.6 + i * 0.28, T.revenue + 1.3 + i * 0.28, outCubic), hh = (BASE - y(v)) * k;
        K.attr(`r-b${i}`, 'y', (BASE - hh).toFixed(1)); K.attr(`r-b${i}`, 'height', hh.toFixed(1));
      });
      K.draw('r-exp', prog(t, T.kept - 1.2, T.kept + 0.6, inOutSine));
      K.rise('r-panel', 1160, 360, t, T.revenue + 0.5, { dist: 40 });
      K.rise('r-rev', 1210, 480, t, T.rev - 0.3, { dist: 20 });
      K.text('r-revT', `$${(1.01 * prog(t, T.rev - 0.2, T.rev + 1.0, outCubic)).toFixed(2)}M`);
      K.rise('r-kept', 1210, 680, t, T.kept - 0.3, { dist: 20 });
      const augK = prog(t, T.aug - 0.1, T.aug + 0.6, inOutCubic);
      const kept = 49 * prog(t, T.kept - 0.2, T.kept + 0.8, outCubic);
      K.text('r-keptT', `${Math.round(kept)}¢`);
      K.rise('r-bar', 1210, 770, t, T.kept, { dist: 12 });
      K.attr('r-barF', 'width', (520 * (kept + 8 * augK) / 100).toFixed(1));
      K.pop('r-aug', 1600, 650, t, T.aug - 0.15);
      K.rise('r-foot', 160, 1010, t, T.revenue + 1.0, { dist: 10 });
    },
  };
}

// ------------------------------------------------------------------ 5 · PER VISIT
function unit(K, T) {
  const BX = 600, BW = 1060, MAX = 360, bw = (v) => BW * v / MAX;
  const row = (id, label, color, yy) => [
    g(`${id}-lbl`, txt(label, { size: 36, weight: 700, family: DISPLAY })),
    g(`${id}-bar`, rect({ id: `${id}-f`, x: 0, y: 0, width: 0, height: 96, rx: 16, fill: color })),
    g(`${id}-val`, txt('$0', { id: `${id}-v`, size: 64, weight: 800, family: DISPLAY, ls: -1 })),
    g(`${id}-feb`, h('line', { x1: 0, y1: -14, x2: 0, y2: 110, stroke: C.navy, 'stroke-width': 3, 'stroke-dasharray': '8 7' })),
  ];
  const markup = h('g', { id: 'sc-unit' },
    bg(C.cream),
    ...header('u', 'PER VISIT · FEBRUARY TO AUGUST', 'Growth is reaching the bottom line'),
    ...row('u-r', 'Revenue per visit', C.teal, 470),
    ...row('u-c', 'Cost per visit', C.coral, 680),
    g('u-febL', txt('Dashed line = February', { size: 22, fill: C.muted })),
    g('u-gap', rect({ x: 0, y: -40, width: 560, height: 80, rx: 40, fill: C.navy }),
      txt('$185 kept per visit in August', { x: 280, y: 11, size: 30, weight: 700, family: DISPLAY, fill: C.white, anchor: 'middle' })),
  );
  return {
    id: 'unit', from: T.unit, to: T.cash, markup,
    update(t) {
      headerIn(K, 'u', t, T.unit + 0.1);
      const R = [['u-r', 470, 226, 324, T.perVisit], ['u-c', 680, 155, 139, T.cost]];
      R.forEach(([id, yy, feb, aug, cue], i) => {
        const start = T.unit + 0.4 + i * 0.2;
        K.rise(`${id}-lbl`, 160, yy + 62, t, start, { dist: 16 });
        K.rise(`${id}-bar`, BX, yy, t, start, { dist: 0 });
        const k1 = prog(t, start + 0.1, start + 0.8, outCubic), k2 = prog(t, cue - 0.1, cue + 0.7, inOutCubic);
        const v = feb * k1 + (aug - feb) * k2;
        K.attr(`${id}-f`, 'width', bw(v).toFixed(1));
        K.text(`${id}-v`, `$${Math.round(v)}`);
        K.put(`${id}-val`, BX + bw(v) + 24, yy + 72, k1);
        K.rise(`${id}-feb`, BX + bw(feb), yy, t, cue - 0.2, { dist: 0 });
      });
      K.rise('u-febL', BX, 850, t, T.perVisit, { dist: 10 });
      K.pop('u-gap', BX, 930, t, T.cost + 0.7, { amount: 0.1 });
    },
  };
}

// ------------------------------------------------------------------ 6 · CASH
const CASH = [
  { v: 759, label: 'collected', color: C.teal },
  { v: 149, label: 'in liens', color: C.coral },
  { v: 43, label: 'unpaid invoices', color: C.amber },
  { v: 62, label: 'timing', color: C.grey },
];
function cash(K, T) {
  const X0 = 160, BW = 1600, TOT = 1013;
  let acc = 0; const segX = CASH.map((c) => { const x = acc; acc += c.v; return x; });
  const markup = h('g', { id: 'sc-cash' },
    bg(C.paper),
    ...header('c', 'EARNED VS COLLECTED · FEBRUARY TO AUGUST', "One in four dollars earned isn't cash yet"),
    g('c-booked', txt('$1.01M booked in the monthly close', { size: 32, weight: 700, family: DISPLAY })),
    g('c-track', rect({ x: 0, y: 0, width: BW, height: 120, rx: 18, fill: C.track })),
    ...CASH.map((c, i) => rect({ id: `c-s${i}`, x: X0 + BW * segX[i] / TOT, y: 470, width: 0, height: 120, fill: c.color })),
    ...CASH.map((c, i) => g(`c-l${i}`, rect({ x: 0, y: 0, width: 360, height: 6, rx: 3, fill: c.color }),
      txt(`$${c.v}K`, { y: 78, size: 64, weight: 800, family: DISPLAY, ls: -1 }), txt(c.label, { y: 122, size: 28, fill: C.ink2 }))),
    g('c-tie', txt('On a cash basis, the monthly close and TherapyNotes tie.', { size: 28, fill: C.ink2 })),
  );
  const segAt = [T.collected - 0.1, T.liens - 0.1, T.liens + 0.5, T.liens + 1.3];
  return {
    id: 'cash', from: T.cash, to: T.act, markup,
    update(t) {
      headerIn(K, 'c', t, T.cash + 0.1);
      K.rise('c-booked', X0, 440, t, T.cash + 0.4, { dist: 14 });
      K.rise('c-track', X0, 470, t, T.cash + 0.4, { dist: 0 });
      CASH.forEach((c, i) => {
        const k = prog(t, segAt[i], segAt[i] + 0.7, outCubic);
        K.attr(`c-s${i}`, 'width', (BW * c.v / TOT * k).toFixed(1));
        K.rise(`c-l${i}`, X0 + i * 413, 680, t, segAt[i] + 0.2, { dist: 24 });
      });
      K.rise('c-tie', X0, 940, t, T.liens + 1.8, { dist: 12 });
    },
  };
}

// ------------------------------------------------------------------ 7 · ACT NOW
const ACTS = [
  { amt: '$117K', title: 'Submit the personal injury backlog', sub: '22% of PI charges have never gone out' },
  { amt: '$260K', title: 'Name a lien collections owner', sub: 'Liens booked grew from $7.9K in April to $63.5K in August' },
  { amt: '$150K', title: 'Work the rejected insurance claims', sub: '159 claims, 98 of them more than 90 days old' },
];
function act(K, T) {
  const markup = h('g', { id: 'sc-act' },
    bg(C.navy),
    neural('a-net', 51, 1480, 60, 420, 300, 9, C.teal, 0.18),
    ...header('a', 'NEEDS ACTION NOW', 'Three moves to turn work into cash', true),
    ...ACTS.map((a, i) => g(`a-r${i}`,
      rect({ x: 0, y: 0, width: 1600, height: 150, rx: 22, fill: C.navy2 }),
      rect({ x: 0, y: 0, width: 12, height: 150, rx: 6, fill: C.coral }),
      txt(a.amt, { x: 56, y: 98, size: 72, weight: 800, family: DISPLAY, fill: C.white, ls: -1 }),
      txt(a.title, { x: 380, y: 68, size: 38, weight: 700, family: DISPLAY, fill: C.white }),
      txt(a.sub, { x: 380, y: 114, size: 28, fill: C.light }))),
  );
  return {
    id: 'act', from: T.act, to: T.team, markup,
    update(t) {
      K.rise('a-net', 0, 0, t, T.act + 0.2, { d: 1.2 });
      headerIn(K, 'a', t, T.act + 0.1);
      ACTS.forEach((_, i) => {
        const k = riseK(t, T.a[i] - 0.25, 0.5);
        K.put(`a-r${i}`, 160 + (1 - k) * 80, 400 + i * 180, k);
      });
    },
  };
}

// ------------------------------------------------------------------ 8 · TEAM
function team(K, T) {
  const BASE = 880, MAXH = 380, hOf = (v) => MAXH * v / 230;
  const markup = h('g', { id: 'sc-team' },
    bg(C.paper),
    ...header('t', 'CLINICAL TEAM', 'The bench is growing'),
    g('t-left', rect({ x: 0, y: 0, width: 780, height: 580, rx: 28, fill: C.card, stroke: C.line, 'stroke-width': 2 }),
      txt('Counselor visits per month', { x: 48, y: 76, size: 32, weight: 700, family: DISPLAY }),
      h('line', { x1: 48, x2: 732, y1: BASE - 340, y2: BASE - 340, stroke: C.track, 'stroke-width': 3 }),
      txt('January', { x: 240, y: BASE - 340 + 44, size: 26, fill: C.ink2, anchor: 'middle' }), txt('September', { x: 540, y: BASE - 340 + 44, size: 26, fill: C.ink2, anchor: 'middle' })),
    rect({ id: 't-b0', x: 320, y: BASE, width: 160, height: 0, rx: 12, fill: C.bar }),
    rect({ id: 't-b1', x: 620, y: BASE, width: 160, height: 0, rx: 12, fill: C.teal }),
    g('t-v0', txt('92', { size: 48, weight: 800, family: DISPLAY, anchor: 'middle' })),
    g('t-v1', txt('213', { size: 48, weight: 800, family: DISPLAY, anchor: 'middle' })),
    g('t-pill', rect({ x: -150, y: -32, width: 300, height: 64, rx: 32, fill: C.navy }), txt('More than doubled', { y: 10, size: 28, weight: 700, family: DISPLAY, fill: C.white, anchor: 'middle' })),
    g('t-right', rect({ x: 0, y: 0, width: 780, height: 580, rx: 28, fill: C.card, stroke: C.line, 'stroke-width': 2 }),
      txt("Dr. Doran's share of visits", { x: 48, y: 76, size: 32, weight: 700, family: DISPLAY }),
      h('g', { transform: 'translate(210 330)' }, donut('t-donut', 124, 40, C.teal, C.tealSoft)),
      txt('0%', { id: 't-pct', x: 210, y: 350, size: 76, weight: 800, family: DISPLAY, anchor: 'middle', ls: -2 }),
      txt('April', { id: 't-when', x: 210, y: 392, size: 26, fill: C.muted, anchor: 'middle' }),
      txt('57% in April', { x: 390, y: 290, size: 32, weight: 700, family: DISPLAY, fill: C.muted }),
      txt('39% in September', { id: 't-sep', x: 390, y: 344, size: 32, weight: 700, family: DISPLAY, fill: C.tealDeep, opacity: 0 }),
      txt('Key-person risk is easing', { id: 't-risk', x: 390, y: 410, size: 26, fill: C.ink2, opacity: 0 }),
      txt('as counselors ramp', { id: 't-risk2', x: 390, y: 444, size: 26, fill: C.ink2, opacity: 0 })),
  );
  return {
    id: 'team', from: T.team, to: T.outlook, markup,
    update(t) {
      headerIn(K, 't', t, T.team + 0.1);
      K.rise('t-left', 160, 340, t, T.team + 0.4, { dist: 40 });
      [[92, T.counselor - 0.3, 'b0', 'v0', 400], [213, T.counselor + 0.3, 'b1', 'v1', 700]].forEach(([v, at, b, l, cx]) => {
        const hh = hOf(v) * prog(t, at, at + 0.8, outCubic);
        K.attr(`t-${b}`, 'x', cx - 80);
        K.attr(`t-${b}`, 'y', (BASE - hh).toFixed(1));
        K.attr(`t-${b}`, 'height', hh.toFixed(1));
        K.rise(`t-${l}`, cx, BASE - hh - 18, t, at + 0.6, { dist: 10 });
      });
      K.pop('t-pill', 400, 560, t, T.counselor + 1.4);
      K.rise('t-right', 980, 340, t, T.doran - 0.5, { dist: 40 });
      const show = prog(t, T.doran - 0.2, T.doran + 0.6, outCubic), down = prog(t, T.down - 0.4, T.down + 0.5, inOutCubic);
      const pct = (57 - 18 * down) * show;
      setDonut(K, 't-donut', pct);
      K.text('t-pct', `${Math.round(pct)}%`);
      K.text('t-when', down > 0.5 ? 'September' : 'April');
      K.attr('t-sep', 'opacity', down.toFixed(3));
      K.attr('t-risk', 'opacity', prog(t, T.down + 0.4, T.down + 0.9).toFixed(3));
      K.attr('t-risk2', 'opacity', prog(t, T.down + 0.5, T.down + 1.0).toFixed(3));
    },
  };
}

// ------------------------------------------------------------------ 9 · OUTLOOK + END CARD
function outlook(K, T, cfg) {
  const ec = cfg.storyboard.endCard;
  const cal = (m, ox) => {
    const cells = [];
    for (let i = 0; i < 35; i++) cells.push(rect({ id: `q-${m}${i}`, x: ox + (i % 7) * 50, y: 520 + Math.floor(i / 7) * 50, width: 38, height: 38, rx: 8, fill: C.track }));
    return [txt(['October', 'November', 'December'][m], { x: ox, y: 494, size: 26, weight: 700, family: DISPLAY, fill: C.ink2 }), ...cells];
  };
  const markup = h('g', { id: 'sc-outlook' },
    bg(C.cream),
    ...header('q', 'LOOKING AHEAD', 'Q4 is already filling up'),
    g('q-num', txt('0', { id: 'q-numT', size: 230, weight: 800, family: DISPLAY, ls: -6 }),
      txt('visits already scheduled', { y: 70, size: 36, fill: C.ink2 }), txt('for October to December', { y: 116, size: 36, fill: C.ink2 })),
    g('q-cal', ...cal(0, 0), ...cal(1, 360), ...cal(2, 720)),
    g('q-pill', rect({ x: 0, y: -40, width: 520, height: 80, rx: 40, fill: C.teal }),
      txt('Set up for a strong finish', { x: 260, y: 11, size: 32, weight: 800, family: DISPLAY, fill: C.navy, anchor: 'middle' })),
  );
  const lw = 900, lh = lw * LOGO_AR;
  const endMarkup = h('g', { id: 'sc-end' },
    bg(C.paper),
    neural('x-netL', 11, 40, 640, 420, 400, 11, C.teal, 0.35),
    neural('x-netR', 29, 1480, 80, 400, 420, 11, C.teal, 0.35),
    h('clipPath', { id: 'x-clip' }, rect({ id: 'x-clipR', x: -lw / 2, y: -lh, width: 0, height: lh * 2 })),
    g('x-logo', h('image', { href: LOGO, x: -lw / 2, y: -lh / 2, width: lw, height: lh, 'clip-path': 'url(#x-clip)' })),
    stroke('x-rule', 'M860,610 H1060', C.teal, 8),
    g('x-tag', txt(ec.tagline, { size: 44, weight: 500, fill: C.ink2, anchor: 'middle' })),
    g('x-src', txt(ec.source, { size: 22, fill: C.muted, anchor: 'middle' })),
  );
  // deterministic fill order for the calendar squares (decorative, not a monthly split)
  let s = 7; const order = Array.from({ length: 105 }, (_, i) => [i, (s = (s * 16807) % 2147483647)]).sort((a, b) => a[1] - b[1]).map((p) => p[0]);
  const fillAt = new Array(105); order.forEach((cell, rank) => { fillAt[cell] = rank; });
  return [{
    id: 'outlook', from: T.outlook, to: T.end, markup,
    update(t) {
      headerIn(K, 'q', t, T.outlook + 0.1);
      K.rise('q-num', 160, 640, t, T.q4 - 0.3, { dist: 30 });
      K.text('q-numT', fmtInt(999 * prog(t, T.q4 - 0.2, T.q4 + 1.0, outCubic)));
      K.rise('q-cal', 700, 0, t, T.outlook + 0.4, { dist: 30 });
      const n = Math.round(88 * prog(t, T.q4 - 0.1, T.q4 + 2.4, inOutSine));
      for (let i = 0; i < 105; i++) K.attr(`q-${Math.floor(i / 35)}${i % 35}`, 'fill', fillAt[i] < n ? (fillAt[i] % 5 === 0 ? C.tealDeep : C.teal) : C.track);
      K.pop('q-pill', 160, 900, t, T.finish - 0.1, { amount: 0.1 });
    },
  }, {
    id: 'end', from: T.end, to: T.duration + 1, markup: endMarkup,
    update(t) {
      const e = T.end;
      K.rise('x-netL', 0, 0, t, e + 0.2, { d: 1.2, dist: 30 });
      K.rise('x-netR', 0, 0, t, e + 0.3, { d: 1.2, dist: -30 });
      K.put('x-logo', 960, 450, prog(t, e + 0.1, e + 0.3));
      K.attr('x-clipR', 'width', (lw * prog(t, e + 0.2, e + 1.2, inOutCubic)).toFixed(1));
      K.draw('x-rule', prog(t, e + 1.1, e + 1.6, outCubic));
      K.rise('x-tag', 960, 700, t, e + 1.4);
      K.rise('x-src', 960, 1010, t, e + 1.9, { dist: 10 });
    },
  }];
}

export function buildScenes(K, T, cfg) {
  return [open(K, T), visits(K, T), patients(K, T), revenue(K, T), unit(K, T), cash(K, T), act(K, T), team(K, T), ...outlook(K, T, cfg)];
}
