// The scenes of the Lifted Trucks theoretical 2026 YTD video. Each returns { id, from, to, markup, update(t) }.
// Numbers are the estimates in the Lifted Trucks Operating Dashboard (Jan to Sep 2026), not actual results.
import { h } from '../../engine/svg.js';
import { lerp, prog, outCubic, inOutCubic, inOutSine } from '../../engine/anim.js';
import { W, H, C, DISPLAY, BODY, LOGO, LOGO_AR, PHOTO, txt, g, header, stroke, riseK } from './kit.js';

const rect = (a) => h('rect', a);
const bg = (fill) => rect({ width: W, height: H, fill });
const HX = 160, EYE_Y = 186, HEAD_Y = 284;
const fmtInt = (v) => Math.round(v).toLocaleString('en-US');

function headerIn(K, id, t, at) {
  K.rise(`${id}-eye`, HX, EYE_Y, t, at, { dist: 24 });
  K.rise(`${id}-head`, HX - 3, HEAD_Y, t, at + 0.12);
}
const foot = (id, s, light) => g(id, txt(s, { size: 22, fill: light ? C.muteL : C.mute }));
const chip = (id, s, fill, color, w) => g(id, rect({ x: -w / 2, y: -34, width: w, height: 68, rx: 34, fill }),
  txt(s, { y: 11, size: 30, weight: 700, fill: color, anchor: 'middle' }));
/** Full-bleed showroom photo with a charcoal grade (open + end card). */
const photo = (id, op) => [
  h('g', { id }, h('image', { href: PHOTO, x: 0, y: 0, width: W, height: H, preserveAspectRatio: 'xMidYMid slice' })),
  rect({ width: W, height: H, fill: C.bg, opacity: op }),
  h('defs', {}, h('linearGradient', { id: `${id}-v`, x1: 0, y1: 0, x2: 0, y2: 1 },
    h('stop', { offset: 0, 'stop-color': C.bg, 'stop-opacity': 0.2 }), h('stop', { offset: 1, 'stop-color': C.bg, 'stop-opacity': 0.9 }))),
  rect({ width: W, height: H, fill: `url(#${id}-v)` }),
];

// ------------------------------------------------------------------ 1 · OPEN
function open(K, T) {
  const lw = 660, lh = lw * LOGO_AR;
  const markup = h('g', { id: 'sc-open' },
    bg(C.bg), ...photo('o-photo', 0.62),
    rect({ id: 'o-stripe', x: 0, y: 0, width: 24, height: 0, fill: C.orange }),
    g('o-logo', h('image', { href: LOGO, x: -lw / 2, y: -lh / 2, width: lw, height: lh })),
    g('o-title', txt('2026 YEAR TO DATE', { size: 140, weight: 700, family: DISPLAY, anchor: 'middle', ls: 2 })),
    stroke('o-rule', 'M860,700 H1060', C.orange, 8),
    g('o-sub', txt('January through September · theoretical results', { size: 40, weight: 500, fill: C.chrome, anchor: 'middle' })),
  );
  return {
    id: 'open', from: 0, to: T.units, markup,
    update(t) {
      const z = 1 + 0.06 * prog(t, 0, T.units);
      K.attr('o-photo', 'transform', `translate(960 540) scale(${z.toFixed(4)}) translate(-960 -540)`);
      K.attr('o-stripe', 'height', (H * prog(t, 0.05, 0.7, outCubic)).toFixed(1));
      K.pop('o-logo', 960, 330, t, 0.3, { d: 0.6, amount: 0.12 });
      K.rise('o-title', 960, 640, t, 0.8);
      K.draw('o-rule', prog(t, 1.3, 1.9, outCubic));
      K.rise('o-sub', 960, 790, t, T.january - 0.25);
    },
  };
}

// ------------------------------------------------------------------ 2 · UNITS
const UNITS = [572, 652, 749, 729, 744, 711, 747, 764, 777];
const MO = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
function units(K, T) {
  const X0 = 230, X1 = 1240, BASE = 900, TOP = 420, MAX = 900, bw = 86, gap = (X1 - X0 - 9 * bw) / 8;
  const y = (v) => BASE - (BASE - TOP) * v / MAX, bx = (i) => X0 + i * (bw + gap);
  const markup = h('g', { id: 'sc-units' },
    bg(C.bg),
    ...header('u', 'RETAIL UNITS PER MONTH', 'Trucks sold, January to September'),
    g('u-grid', ...[300, 600, 900].map((v) => [h('line', { x1: X0 - 10, x2: X1, y1: y(v), y2: y(v), stroke: C.line, 'stroke-width': 2 }),
      txt(String(v), { x: X0 - 24, y: y(v) + 8, size: 22, fill: C.mute, anchor: 'end' })]),
      h('line', { x1: X0 - 10, x2: X1, y1: BASE, y2: BASE, stroke: C.steel, 'stroke-width': 3 }),
      ...MO.map((m, i) => txt(m, { x: bx(i) + bw / 2, y: BASE + 40, size: 24, fill: C.chrome, anchor: 'middle' }))),
    ...UNITS.map((v, i) => rect({ id: `u-b${i}`, x: bx(i), y: BASE, width: bw, height: 0, rx: 6, fill: i === 8 ? C.orange : C.steel })),
    ...UNITS.map((v, i) => g(`u-l${i}`, txt(String(v), { size: i === 8 ? 34 : 24, weight: 600, family: DISPLAY, fill: i === 8 ? C.white : C.mute, anchor: 'middle' }))),
    g('u-rec', rect({ x: -150, y: -32, width: 300, height: 64, rx: 32, fill: C.orange }), txt('BIGGEST MONTH YET', { y: 11, size: 28, weight: 600, family: DISPLAY, fill: C.ink, anchor: 'middle', ls: 1 })),
    g('u-panel', rect({ x: 0, y: 0, width: 440, height: 520, rx: 24, fill: C.card })),
    g('u-num', txt('0', { id: 'u-numT', size: 150, weight: 700, family: DISPLAY, ls: 1 }), txt('trucks sold this year', { y: 52, size: 30, fill: C.chrome })),
    chip('u-pct', '+37% vs last year', C.orange, C.ink, 340),
    g('u-bud', txt('7% under budget', { size: 26, fill: C.mute })),
    foot('u-foot', 'Estimated figures from the Lifted Trucks Operating Dashboard.'),
  );
  const at = (i) => 5.9 + i * 0.5;
  return {
    id: 'units', from: T.units, to: T.footprint, markup,
    update(t) {
      headerIn(K, 'u', t, T.units + 0.15);
      K.rise('u-grid', 0, 0, t, T.units + 0.35, { dist: 0 });
      UNITS.forEach((v, i) => {
        const k = prog(t, at(i), at(i) + 0.6, outCubic), hh = (BASE - y(v)) * k;
        K.attr(`u-b${i}`, 'y', (BASE - hh).toFixed(1)); K.attr(`u-b${i}`, 'height', hh.toFixed(1));
        K.rise(`u-l${i}`, bx(i) + bw / 2, y(v) - 16, t, i === 8 ? T.september : at(i) + 0.45, { dist: 10 });
      });
      K.pop('u-rec', bx(8) + bw / 2 - 120, y(777) - 92, t, T.record - 0.1);
      K.rise('u-panel', 1320, 380, t, T.units + 0.4, { dist: 40 });
      K.rise('u-num', 1370, 560, t, T.sold - 0.3, { dist: 20 });
      K.text('u-numT', fmtInt(6445 * prog(t, T.sold - 0.2, T.sold + 1.4, outCubic)));
      K.pop('u-pct', 1540, 720, t, T.pct - 0.1);
      K.rise('u-bud', 1370, 820, t, T.pct + 0.8, { dist: 10 });
      K.rise('u-foot', 160, 1010, t, T.units + 1.0, { dist: 10 });
    },
  };
}

// ------------------------------------------------------------------ 3 · FOOTPRINT
const OPENED = [['Austin', 'Feb'], ['Oklahoma City', 'Mar'], ['Baytown', 'May'], ['San Antonio', 'Jul'], ['Denver', 'Sep']];
function footprint(K, T) {
  const markup = h('g', { id: 'sc-footprint' },
    bg(C.paper),
    ...header('f', 'FOOTPRINT', '18 dealerships, 6 Lift Shops', true),
    g('f-card', rect({ x: 0, y: 0, width: 720, height: 580, rx: 24, fill: C.cardL, stroke: C.lineL, 'stroke-width': 2 }),
      txt('OPENED IN 2026', { x: 48, y: 72, size: 26, weight: 700, fill: C.orangeDeep, ls: 2 })),
    ...OPENED.map(([n, m], i) => g(`f-o${i}`,
      h('circle', { cx: 0, cy: -14, r: 12, fill: C.orange }),
      txt(n.toUpperCase(), { x: 34, y: 0, size: 44, weight: 600, family: DISPLAY, fill: C.ink, ls: 1 }),
      txt(m, { x: 610, y: 0, size: 30, fill: C.muteL, anchor: 'end' }))),
    g('f-num', txt('13', { id: 'f-numT', size: 240, weight: 700, family: DISPLAY, fill: C.ink }), txt('dealerships', { y: 56, size: 36, fill: C.ink2 })),
    g('f-reg', txt('YTD TRUCKS SOLD BY REGION', { size: 24, weight: 700, fill: C.muteL, ls: 2 }),
      txt('Texas & Oklahoma', { y: 54, size: 28, weight: 600, fill: C.ink }), rect({ id: 'f-b0', x: 0, y: 72, width: 0, height: 44, rx: 8, fill: C.orange }),
      txt('3,623', { id: 'f-v0', x: 0, y: 106, size: 30, weight: 600, family: DISPLAY, fill: C.ink }),
      txt('Arizona', { y: 170, size: 28, weight: 600, fill: C.ink }), rect({ id: 'f-b1', x: 0, y: 188, width: 0, height: 44, rx: 8, fill: C.steel }),
      txt('2,225', { id: 'f-v1', x: 0, y: 222, size: 30, weight: 600, family: DISPLAY, fill: C.ink })),
  );
  return {
    id: 'footprint', from: T.footprint, to: T.revenue, markup,
    update(t) {
      headerIn(K, 'f', t, T.footprint + 0.15);
      K.rise('f-card', 160, 340, t, T.footprint + 0.5, { dist: 40 });
      OPENED.forEach((_, i) => {
        const k = riseK(t, T.five + i * 0.35, 0.45);
        K.put(`f-o${i}`, 210 + (1 - k) * -40, 500 + i * 88, k);
      });
      K.rise('f-num', 990, 560, t, T.footprint + 0.6, { dist: 30 });
      K.text('f-numT', String(Math.round(13 + 5 * prog(t, T.five, T.eighteen + 0.2, inOutCubic))));
      K.rise('f-reg', 1000, 680, t, T.texas - 0.3, { dist: 20 });
      const MAXW = 560;
      [[3623, 0], [2225, 1]].forEach(([v, i]) => {
        const w = MAXW * v / 3623 * prog(t, T.texas + i * 0.25, T.texas + 0.8 + i * 0.25, outCubic);
        K.attr(`f-b${i}`, 'width', w.toFixed(1));
        K.attr(`f-v${i}`, 'x', (w + 18).toFixed(1));
      });
    },
  };
}

// ------------------------------------------------------------------ 4 · REVENUE + GROSS
function revenue(K, T) {
  const tile = (id, label, sub) => g(id, rect({ x: 0, y: 0, width: 512, height: 250, rx: 24, fill: C.card }),
    txt('', { id: `${id}-v`, x: 40, y: 128, size: 104, weight: 700, family: DISPLAY, ls: 1 }),
    txt(label, { x: 44, y: 178, size: 28, fill: C.chrome }), sub ? txt(sub, { x: 44, y: 218, size: 24, fill: C.mute }) : '');
  const SEG = [['Front end', 3700, C.steel], ['F&I', 2750, C.orange], ['Lift Shop, service & wholesale', 4250, C.chrome]];
  const markup = h('g', { id: 'sc-revenue' },
    bg(C.bg),
    ...header('r', 'REVENUE AND GROSS', 'Bigger, and still earning on every truck'),
    tile('r-t0', 'revenue, January to September'), tile('r-t1', 'gross profit'), tile('r-t2', 'total gross per truck'),
    chip('r-pct', '+40% vs last year', C.orange, C.ink, 320),
    g('r-mix', txt('WHERE THE GROSS ON EACH TRUCK COMES FROM', { size: 24, weight: 700, fill: C.mute, ls: 2 }),
      ...SEG.map(([n, v, c], i) => rect({ id: `r-s${i}`, x: 0, y: 30, width: 0, height: 80, fill: c })),
      ...SEG.map(([n, v], i) => g(`r-sl${i}`, txt(`~$${v.toLocaleString('en-US')}`, { size: 36, weight: 600, family: DISPLAY }), txt(n, { y: 36, size: 24, fill: C.chrome })))),
    foot('r-foot', 'Estimated figures. Per-truck gross split is approximate.'),
  );
  const segW = SEG.map(([, v]) => 1600 * v / 10700);
  return {
    id: 'revenue', from: T.revenue, to: T.ebitda, markup,
    update(t) {
      headerIn(K, 'r', t, T.revenue + 0.15);
      K.rise('r-t0', 160, 360, t, T.rev - 0.4, { dist: 40 });
      K.rise('r-t1', 704, 360, t, T.rev + 0.3, { dist: 40 });
      K.rise('r-t2', 1248, 360, t, T.gpu - 0.4, { dist: 40 });
      K.text('r-t0-v', `$${(518.9 * prog(t, T.rev - 0.3, T.rev + 1.0, outCubic)).toFixed(1)}M`);
      K.text('r-t1-v', `$${(69.0 * prog(t, T.rev + 0.4, T.rev + 1.4, outCubic)).toFixed(1)}M`);
      K.text('r-t2-v', `$${fmtInt(10700 * prog(t, T.gpu - 0.3, T.gpu + 1.0, outCubic))}`);
      K.pop('r-pct', 416, 660, t, T.revPct - 0.1);
      K.rise('r-mix', 160, 750, t, T.gpu + 0.2, { dist: 20 });
      let x = 0;
      segW.forEach((w, i) => {
        const k = prog(t, T.gpu + 0.4 + i * 0.35, T.gpu + 0.9 + i * 0.35, outCubic);
        K.attr(`r-s${i}`, 'x', x.toFixed(1)); K.attr(`r-s${i}`, 'width', Math.max(0, w * k - 4).toFixed(1));
        const kk = riseK(t, T.gpu + 0.7 + i * 0.35);
        K.put(`r-sl${i}`, x, 166 + (1 - kk) * 10, kk);
        x += w;
      });
      K.rise('r-foot', 160, 1010, t, T.revenue + 1.0, { dist: 10 });
    },
  };
}

// ------------------------------------------------------------------ 5 · EBITDA
const QE = [4.6, 5.9, 6.2];
function ebitda(K, T) {
  const BASE = 880, MAXH = 440, hOf = (v) => MAXH * v / 7, bx = (i) => 1060 + i * 230, bw = 160;
  const markup = h('g', { id: 'sc-ebitda' },
    bg(C.paper),
    ...header('e', 'ADJ. EBITDA', 'Growing every quarter', true),
    g('e-num', txt('$0.0M', { id: 'e-numT', size: 180, weight: 700, family: DISPLAY, fill: C.ink, ls: 1 }), txt('Adj. EBITDA, January to September', { y: 60, size: 30, fill: C.ink2 })),
    chip('e-pct', '+36% vs last year', C.orange, C.ink, 330),
    g('e-note', txt('3.2% of revenue · budget $19.9M', { size: 28, fill: C.muteL })),
    g('e-axis', h('line', { x1: 1020, x2: 1760, y1: BASE, y2: BASE, stroke: C.lineL, 'stroke-width': 3 }),
      ...['Q1', 'Q2', 'Q3'].map((q, i) => txt(q, { x: bx(i) + bw / 2, y: BASE + 42, size: 28, weight: 600, family: DISPLAY, fill: C.ink2, anchor: 'middle' }))),
    ...QE.map((v, i) => rect({ id: `e-b${i}`, x: bx(i), y: BASE, width: bw, height: 0, rx: 8, fill: i === 2 ? C.orange : C.steel })),
    ...QE.map((v, i) => g(`e-l${i}`, txt(`$${v}M`, { size: 40, weight: 600, family: DISPLAY, fill: C.ink, anchor: 'middle' }))),
    stroke('e-trend', `M${bx(0) + bw / 2},${BASE - hOf(4.6) - 120} L${bx(1) + bw / 2},${BASE - hOf(5.9) - 120} L${bx(2) + bw / 2},${BASE - hOf(6.2) - 120}`, C.orangeDeep, 5, { 'stroke-dasharray': '1 1' }),
  );
  return {
    id: 'ebitda', from: T.ebitda, to: T.leads, markup,
    update(t) {
      headerIn(K, 'e', t, T.ebitda + 0.15);
      K.rise('e-num', 160, 560, t, T.eb - 0.4, { dist: 30 });
      K.text('e-numT', `$${(16.7 * prog(t, T.eb - 0.3, T.eb + 1.0, outCubic)).toFixed(1)}M`);
      K.pop('e-pct', 325, 700, t, T.ebPct - 0.1);
      K.rise('e-note', 160, 800, t, T.ebPct + 0.6, { dist: 10 });
      K.rise('e-axis', 0, 0, t, T.ebitda + 0.4, { dist: 0 });
      QE.forEach((v, i) => {
        const at = T.ebitda + 0.6 + i * 0.4, hh = hOf(v) * prog(t, at, at + 0.6, outCubic);
        K.attr(`e-b${i}`, 'y', (BASE - hh).toFixed(1)); K.attr(`e-b${i}`, 'height', hh.toFixed(1));
        K.rise(`e-l${i}`, bx(i) + bw / 2, BASE - hOf(v) - 20, t, at + 0.4, { dist: 10 });
      });
      K.draw('e-trend', prog(t, T.quarters - 0.4, T.quarters + 0.5, inOutSine));
    },
  };
}

// ------------------------------------------------------------------ 6 · LEADS
const FUNNEL = [['Leads', 42622], ['Appointments', 17046], ['Showed up', 11937], ['Sold', 6445]];
function leads(K, T) {
  const MAXW = 1240;
  const markup = h('g', { id: 'sc-leads' },
    bg(C.bg),
    ...header('l', 'LEADS AND DEMAND', 'Demand is strong'),
    ...FUNNEL.map(([n], i) => g(`l-r${i}`,
      txt(n.toUpperCase(), { x: 0, y: 46, size: 30, weight: 600, family: DISPLAY, fill: C.chrome, ls: 1 }),
      rect({ id: `l-b${i}`, x: 260, y: 0, width: 0, height: 70, rx: 8, fill: i === 0 ? C.orange : i === 3 ? C.white : C.steel }),
      txt('0', { id: `l-v${i}`, x: 280, y: 50, size: 40, weight: 700, family: DISPLAY, fill: C.white }))),
    chip('l-pct', '+44% vs last year', C.orange, C.ink, 330),
    g('l-close', txt('About 15% of leads become a sale', { size: 28, fill: C.mute })),
  );
  return {
    id: 'leads', from: T.leads, to: T.watch, markup,
    update(t) {
      headerIn(K, 'l', t, T.leads + 0.15);
      FUNNEL.forEach(([, v], i) => {
        const at = i === 0 ? T.leads + 0.5 : T.leadN + 0.1 + (i - 1) * 0.3;
        K.rise(`l-r${i}`, 160, 390 + i * 120, t, at, { dist: 20 });
        const k = i === 0 ? prog(t, T.leads + 0.6, T.leadN + 0.4, inOutCubic) : prog(t, at, at + 0.5, outCubic);
        const w = MAXW * v / 42622 * k;
        K.attr(`l-b${i}`, 'width', w.toFixed(1));
        K.attr(`l-v${i}`, 'x', (260 + w + 20).toFixed(1));
        K.text(`l-v${i}`, fmtInt(v * k));
      });
      K.pop('l-pct', 1590, 284 - 24, t, T.leadPct - 0.1);
      K.rise('l-close', 160, 900, t, T.leadN + 1.0, { dist: 10 });
    },
  };
}

// ------------------------------------------------------------------ 7 · WATCH LIST
const WATCH = [
  { amt: '~31/mo', title: '2026 class is ramping slow', sub: 'Baytown, San Antonio and Oklahoma City vs a 40+ unit plan' },
  { amt: '52 days', title: 'Days supply, against a 45-day goal', sub: 'Aged units over 90 days run 14 to 17% at the newest stores' },
  { amt: '13 days', title: 'Texas recon time', sub: 'vs about 9 in Arizona and a 7-day goal' },
];
function watch(K, T) {
  const markup = h('g', { id: 'sc-watch' },
    bg(C.bg2),
    ...header('w', 'THREE THINGS TO WATCH', 'Where the upside is'),
    ...WATCH.map((a, i) => g(`w-r${i}`,
      rect({ x: 0, y: 0, width: 1600, height: 160, rx: 20, fill: C.card }),
      rect({ x: 0, y: 0, width: 12, height: 160, rx: 6, fill: C.orange }),
      txt(a.amt, { x: 56, y: 104, size: 76, weight: 700, family: DISPLAY, fill: C.orange, ls: 1 }),
      txt(a.title.toUpperCase(), { x: 430, y: 72, size: 40, weight: 600, family: DISPLAY, fill: C.white, ls: 1 }),
      txt(a.sub, { x: 430, y: 120, size: 28, fill: C.chrome }))),
  );
  return {
    id: 'watch', from: T.watch, to: T.outlook, markup,
    update(t) {
      headerIn(K, 'w', t, T.watch + 0.15);
      WATCH.forEach((_, i) => {
        const k = riseK(t, T.w[i] - 0.35, 0.5);
        K.put(`w-r${i}`, 160 + (1 - k) * 80, 380 + i * 190, k);
      });
    },
  };
}

// ------------------------------------------------------------------ 8 · OUTLOOK + END CARD
const PLAN = [['10,400', 'retail trucks', '+18%'], ['$840M', 'revenue', '+19%'], ['$32M', 'Adj. EBITDA', '3.8% of revenue'], ['1 to 2', 'new openings', 'gated, second half']];
function outlook(K, T, cfg) {
  const ec = cfg.storyboard.endCard;
  const markup = h('g', { id: 'sc-outlook' },
    bg(C.paper),
    ...header('p', 'FY2027 FRAMEWORK', 'Next year’s plan', true),
    ...PLAN.map(([v, l, s], i) => g(`p-t${i}`, h('g', { transform: 'translate(-190 -180)' },
      rect({ x: 0, y: 0, width: 380, height: 360, rx: 24, fill: i === 2 ? C.ink : C.cardL, stroke: i === 2 ? 'none' : C.lineL, 'stroke-width': 2 }),
      txt(v, { x: 36, y: 150, size: 96, weight: 700, family: DISPLAY, fill: i === 2 ? C.orange : C.ink, ls: 1 }),
      txt(l, { x: 40, y: 210, size: 32, weight: 600, fill: i === 2 ? C.white : C.ink }),
      txt(s, { x: 40, y: 256, size: 26, fill: i === 2 ? C.chrome : C.muteL })))),
    foot('p-foot', 'Proposed framework from the Q3 2026 board review, built on estimated FY2026 figures.', true),
  );
  const lw = 900, lh = lw * LOGO_AR;
  const endMarkup = h('g', { id: 'sc-end' },
    bg(C.bg), ...photo('x-photo', 0.72),
    rect({ x: 0, y: 0, width: 24, height: H, fill: C.orange }),
    g('x-logo', h('image', { href: LOGO, x: -lw / 2, y: -lh / 2, width: lw, height: lh })),
    stroke('x-rule', 'M860,650 H1060', C.orange, 8),
    g('x-tag', txt(ec.tagline.toUpperCase(), { size: 56, weight: 600, family: DISPLAY, fill: C.white, anchor: 'middle', ls: 3 })),
    g('x-src', txt(ec.source, { size: 22, fill: C.chrome, anchor: 'middle' })),
  );
  const at = [T.plan - 0.2, T.plan + 0.5, T.planEb - 0.2, T.planEb + 0.6];
  return [{
    id: 'outlook', from: T.outlook, to: T.end, markup,
    update(t) {
      headerIn(K, 'p', t, T.outlook + 0.15);
      PLAN.forEach((_, i) => K.pop(`p-t${i}`, 350 + i * 406.67, 580, t, at[i], { d: 0.5, amount: 0.1 }));
      K.rise('p-foot', 160, 1010, t, T.outlook + 0.8, { dist: 10 });
    },
  }, {
    id: 'end', from: T.end, to: T.duration + 1, markup: endMarkup,
    update(t) {
      const e = T.end, z = 1.04 - 0.04 * prog(t, e, T.duration);
      K.attr('x-photo', 'transform', `translate(960 540) scale(${z.toFixed(4)}) translate(-960 -540)`);
      K.pop('x-logo', 960, 440, t, e + 0.2, { d: 0.6, amount: 0.1 });
      K.draw('x-rule', prog(t, e + 0.9, e + 1.4, outCubic));
      K.rise('x-tag', 960, 760, t, e + 1.1);
      K.rise('x-src', 960, 1010, t, e + 1.6, { dist: 10 });
    },
  }];
}

export function buildScenes(K, T, cfg) {
  return [open(K, T), units(K, T), footprint(K, T), revenue(K, T), ebitda(K, T), leads(K, T), watch(K, T), ...outlook(K, T, cfg)];
}
