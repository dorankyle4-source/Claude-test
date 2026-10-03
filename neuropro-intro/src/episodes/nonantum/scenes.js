// The scenes of the Nonantum Capital Partners 2026 annual meeting update. Each returns { id, from, to, markup, update(t) }.
// Firm history and deals: public announcements. Portfolio performance and fund multiples: illustrative placeholders.
// Lifted Trucks spotlight: estimates from the Lifted Trucks Operating Dashboard.
import { h } from '../../engine/svg.js';
import { prog, outCubic, inOutCubic, inOutSine } from '../../engine/anim.js';
import { W, H, C, SERIF, SANS, txt, g, header, stroke, riseK, wordmark } from './kit.js';

const rect = (a) => h('rect', a);
const bg = (fill) => rect({ width: W, height: H, fill });
const HX = 160, EYE_Y = 186, HEAD_Y = 282;
const fmtInt = (v) => Math.round(v).toLocaleString('en-US');

function headerIn(K, id, t, at) {
  K.rise(`${id}-eye`, HX, EYE_Y, t, at, { dist: 24 });
  K.rise(`${id}-head`, HX - 3, HEAD_Y, t, at + 0.12);
}
const foot = (id, s, light) => g(id, txt(s, { size: 22, fill: light ? C.muteL : C.mute }));
const illus = (id, light) => g(id, rect({ x: -130, y: -26, width: 260, height: 52, rx: 26, fill: 'none', stroke: light ? C.goldDeep : C.gold, 'stroke-width': 2 }),
  txt('ILLUSTRATIVE', { y: 9, size: 22, weight: 700, fill: light ? C.goldDeep : C.gold, anchor: 'middle', ls: 3 }));
/** Fine gold rules that draw across a dark scene (brand texture). */
const rules = (id) => h('g', { id, opacity: 0.5 }, ...[0, 1, 2, 3, 4].map((i) =>
  stroke(`${id}${i}`, `M${1180 + i * 60},1080 C${1300 + i * 60},700 ${1500 + i * 40},420 ${1980},${300 - i * 50}`, C.gold, 1.5)));

// ------------------------------------------------------------------ 1 · OPEN
function open(K, T) {
  const markup = h('g', { id: 'sc-open' },
    bg(C.navy), rules('o-r'),
    wordmark('o-mark', false, 1),
    g('o-title', txt('2026 Annual Meeting', { size: 120, weight: 600, family: SERIF, anchor: 'middle' })),
    g('o-sub', txt('Year-to-date portfolio update', { size: 40, fill: C.mute, anchor: 'middle' })),
  );
  return {
    id: 'open', from: 0, to: T.firm, markup,
    update(t) {
      for (let i = 0; i < 5; i++) K.draw(`o-r${i}`, prog(t, 0.3 + i * 0.2, 3.5 + i * 0.2, inOutSine));
      K.rise('o-mark', 960, 330, t, 0.3, { d: 0.9, dist: 20 });
      K.rise('o-title', 960, 640, t, 1.0);
      K.rise('o-sub', 960, 720, t, T.ytd - 0.4);
    },
  };
}

// ------------------------------------------------------------------ 2 · THE FIRM (public facts)
const FUNDS = [['Fund I', '2018', 385], ['Fund II', '2022', 625]];
const STRAT = ['Founder- and family-owned', 'Corporate carve-outs', 'Complex situations'];
function firm(K, T) {
  const markup = h('g', { id: 'sc-firm' },
    bg(C.ivory),
    ...header('f', 'THE FIRM', 'Built for founders and complex situations', true),
    g('f-num', txt('$0.0B', { id: 'f-numT', size: 190, weight: 600, family: SERIF, fill: C.ink }), txt('committed across two funds', { y: 56, size: 32, fill: C.ink2 })),
    ...FUNDS.map(([n, y, v], i) => g(`f-fund${i}`,
      txt(`${n} · ${y}`, { size: 28, weight: 600, fill: C.ink }),
      rect({ x: 0, y: 18, width: 760, height: 30, rx: 15, fill: C.trackL }),
      rect({ id: `f-fb${i}`, x: 0, y: 18, width: 0, height: 30, rx: 15, fill: i ? C.ink : C.gold }),
      txt(`$${v}M+`, { x: 780, y: 42, size: 30, weight: 600, family: SERIF, fill: C.ink }))),
    ...STRAT.map((s, i) => g(`f-s${i}`, rect({ x: 0, y: 0, width: 640, height: 116, rx: 18, fill: C.cardL, stroke: C.lineL, 'stroke-width': 2 }),
      rect({ x: 0, y: 0, width: 8, height: 116, rx: 4, fill: C.gold }),
      txt(`0${i + 1}`, { x: 40, y: 72, size: 34, weight: 600, family: SERIF, fill: C.goldDeep }),
      txt(s, { x: 110, y: 70, size: 30, weight: 600, fill: C.ink }))),
    foot('f-foot', 'Founded 2018 · Boston, Massachusetts · Consumer, industrials and business services. Commitments include GP and affiliates.', true),
  );
  return {
    id: 'firm', from: T.firm, to: T.portfolio, markup,
    update(t) {
      headerIn(K, 'f', t, T.firm + 0.15);
      K.rise('f-num', 160, 560, t, T.billion - 0.4, { dist: 30 });
      K.text('f-numT', `$${(1.0 * prog(t, T.billion - 0.3, T.billion + 1.0, outCubic)).toFixed(1)}B`);
      FUNDS.forEach(([, , v], i) => {
        const at = T.billion + 0.6 + i * 0.5;
        K.rise(`f-fund${i}`, 160, 720 + i * 110, t, at, { dist: 16 });
        K.attr(`f-fb${i}`, 'width', (760 * v / 625 * prog(t, at + 0.1, at + 0.9, outCubic)).toFixed(1));
      });
      STRAT.forEach((_, i) => {
        const k = riseK(t, T.strat[i] - 0.25, 0.5);
        K.put(`f-s${i}`, 1120 + (1 - k) * 60, 380 + i * 150, k);
      });
      K.rise('f-foot', 160, 1010, t, T.firm + 1.0, { dist: 10 });
    },
  };
}

// ------------------------------------------------------------------ 3 · PORTFOLIO (public announcements)
const CO = [
  ['ProVest', 'Legal support services', 's', 2019], ['RoadOne', 'Intermodal logistics', 'i', 2019], ['Ross-Simons', 'Jewelry retail', 'c', 2020],
  ['Christianbook', 'Specialty e-commerce', 'c', 2021], ['Lifted Trucks', 'Custom truck dealer', 'c', 2021], ['Helix Traffic Solutions', 'Traffic management', 'i', 2021],
  ['Team Drive-Away', 'Vehicle logistics', 'i', null], ['LJP Waste Solutions', 'Waste and recycling', 'i', 2022], ['PNE', 'Industrial services', 'i', 2024],
  ['Momentum Environmental', 'Environmental services', 'i', 2024], ['MSI Express', 'Food & beverage co-packing', 'c', 2025], ['Flatiron Search Partners', 'Executive search', 's', 2026],
];
const SEC = { c: ['Consumer', C.consumer], i: ['Industrials', C.industrials], s: ['Business services', C.services] };
function portfolio(K, T) {
  const cw = 380, ch = 150, gx = 26.67, gy = 26;
  const markup = h('g', { id: 'sc-portfolio' },
    bg(C.navy),
    ...header('p', 'THE PORTFOLIO', 'Twelve platform investments'),
    ...CO.map(([n, d, s, y], i) => g(`p-c${i}`, h('g', { transform: `translate(${-cw / 2} ${-ch / 2})` },
      rect({ x: 0, y: 0, width: cw, height: ch, rx: 16, fill: C.card }),
      rect({ x: 0, y: 0, width: 8, height: ch, rx: 4, fill: SEC[s][1] }),
      txt(n, { x: 32, y: 56, size: n.length > 20 ? 26 : n.length > 16 ? 29 : 34, weight: 600, family: SERIF }),
      txt(d, { x: 32, y: 94, size: 21, fill: C.mute }),
      txt(SEC[s][0].toUpperCase(), { x: 32, y: 128, size: 18, weight: 700, fill: SEC[s][1], ls: 2 }),
      y ? txt(String(y), { x: cw - 24, y: 128, size: 20, weight: 600, fill: C.mute, anchor: 'end' }) : ''))),
    g('p-leg', ...Object.values(SEC).map(([l, c], i) => [h('circle', { cx: i * 260, cy: -8, r: 9, fill: c }), txt(l, { x: i * 260 + 20, y: 0, size: 24, fill: C.ivory })])),
    foot('p-foot', 'Platform investments since 2018, from public announcements; includes realized and partially realized investments.'),
  );
  const pos = (i) => [160 + cw / 2 + (i % 4) * (cw + gx), 400 + ch / 2 + Math.floor(i / 4) * (ch + gy)];
  return {
    id: 'portfolio', from: T.portfolio, to: T.activity, markup,
    update(t) {
      headerIn(K, 'p', t, T.portfolio + 0.15);
      const [sc, si, ss] = T.sectors, focus = t >= sc - 0.1 && t < ss + 1.0 ? (t < si - 0.1 ? 'c' : t < ss - 0.1 ? 'i' : 's') : null;
      CO.forEach(([, , s], i) => {
        const [x, y] = pos(i);
        K.pop(`p-c${i}`, x, y, t, T.twelve - 0.4 + i * 0.08, { d: 0.45, amount: 0.08, o: focus && focus !== s ? 0.3 : 1 });
      });
      K.rise('p-leg', 190, 960, t, sc - 0.3, { dist: 10 });
      K.rise('p-foot', 160, 1020, t, T.portfolio + 1.0, { dist: 10 });
    },
  };
}

// ------------------------------------------------------------------ 4 · 2026 ACTIVITY (public announcements)
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep'];
function activity(K, T) {
  const X0 = 220, X1 = 1700, mx = (m) => X0 + (X1 - X0) * m / 8, LY = 420;
  const ev = (id, kicker, title, sub) => g(id, rect({ x: 0, y: 0, width: 700, height: 300, rx: 22, fill: C.cardL, stroke: C.lineL, 'stroke-width': 2 }),
    rect({ x: 0, y: 0, width: 700, height: 8, rx: 4, fill: C.gold }),
    txt(kicker, { x: 44, y: 70, size: 22, weight: 700, fill: C.goldDeep, ls: 3 }),
    txt(title[0], { x: 44, y: 136, size: 44, weight: 600, family: SERIF, fill: C.ink }),
    txt(title[1], { x: 44, y: 188, size: 44, weight: 600, family: SERIF, fill: C.ink }),
    txt(sub, { x: 44, y: 252, size: 26, fill: C.ink2 }));
  const markup = h('g', { id: 'sc-activity' },
    bg(C.ivory),
    ...header('a', '2026 SO FAR', 'New partnerships, continued building', true),
    g('a-axis', h('line', { x1: X0, x2: X1, y1: LY, y2: LY, stroke: C.trackL, 'stroke-width': 6, 'stroke-linecap': 'round' }),
      ...MONTHS.map((m, i) => [h('circle', { cx: mx(i), cy: LY, r: 6, fill: C.lineL }), txt(m, { x: mx(i), y: LY + 44, size: 24, fill: C.muteL, anchor: 'middle' })])),
    stroke('a-prog', `M${X0},${LY} H${X1}`, C.gold, 6),
    g('a-d0', h('circle', { r: 16, fill: C.gold }), h('circle', { r: 6, fill: C.cardL })),
    g('a-d1', h('circle', { r: 16, fill: C.gold }), h('circle', { r: 6, fill: C.cardL })),
    stroke('a-l0', `M${mx(0)},${LY + 16} V560`, C.gold, 3), stroke('a-l1', `M${mx(7)},${LY + 16} V560`, C.gold, 3),
    ev('a-e0', 'JANUARY · NEW PLATFORM', ['Flatiron Search', 'Partners'], 'Executive search for consumer-focused businesses'),
    ev('a-e1', 'AUGUST · ADD-ON ACQUISITION', ['RoadOne acquires', 'Higgins Transport'], 'Port drayage and intermodal, Charleston, SC'),
  );
  return {
    id: 'activity', from: T.activity, to: T.perf, markup,
    update(t) {
      headerIn(K, 'a', t, T.activity + 0.15);
      K.rise('a-axis', 0, 0, t, T.activity + 0.4, { dist: 0 });
      K.draw('a-prog', prog(t, T.activity + 0.6, T.roadone + 0.5, inOutSine));
      K.pop('a-d0', mx(0), LY, t, T.flatiron - 0.3);
      K.pop('a-d1', mx(7), LY, t, T.roadone - 0.3);
      K.draw('a-l0', prog(t, T.flatiron - 0.2, T.flatiron + 0.2, outCubic));
      K.draw('a-l1', prog(t, T.roadone - 0.2, T.roadone + 0.2, outCubic));
      K.rise('a-e0', 160, 560, t, T.flatiron, { dist: 30 });
      K.rise('a-e1', 1060, 560, t, T.roadone, { dist: 30 });
    },
  };
}

// ------------------------------------------------------------------ 5 · PORTFOLIO PERFORMANCE (illustrative)
function perf(K, T) {
  const tile = (id, label, sub) => g(id, rect({ x: 0, y: 0, width: 512, height: 420, rx: 24, fill: C.card }),
    txt('', { id: `${id}-v`, x: 48, y: 200, size: 160, weight: 600, family: SERIF, fill: C.ivory }),
    txt(label, { x: 52, y: 278, size: 32, weight: 600, fill: C.ivory }),
    txt(sub, { x: 52, y: 326, size: 26, fill: C.mute }),
    rect({ id: `${id}-bar`, x: 52, y: 362, width: 0, height: 8, rx: 4, fill: C.gold }));
  const markup = h('g', { id: 'sc-perf' },
    bg(C.navy),
    ...header('q', 'PORTFOLIO PERFORMANCE · YEAR TO DATE', 'Growing, and growing more profitable'),
    illus('q-tag', false),
    tile('q-t0', 'Revenue growth', 'Aggregate, vs prior-year period'), tile('q-t1', 'EBITDA growth', 'Aggregate, vs prior-year period'), tile('q-t2', 'Add-on acquisitions', 'Closed across the portfolio'),
    foot('q-foot', 'Illustrative placeholders. Replace with portfolio reporting before use.'),
  );
  const V = [[14, (v) => `+${Math.round(v)}%`, T.rev], [17, (v) => `+${Math.round(v)}%`, T.ebitda], [9, (v) => String(Math.round(v)), T.addons]];
  return {
    id: 'perf', from: T.perf, to: T.score, markup,
    update(t) {
      headerIn(K, 'q', t, T.perf + 0.15);
      K.pop('q-tag', 1620, 196, t, T.perf + 0.5, { amount: 0.06 });
      V.forEach(([v, f, at], i) => {
        K.rise(`q-t${i}`, 160 + i * 544, 380, t, at - 0.5, { dist: 40 });
        const k = prog(t, at - 0.2, at + 0.8, outCubic);
        K.text(`q-t${i}-v`, f(v * k));
        K.attr(`q-t${i}-bar`, 'width', (408 * k).toFixed(1));
      });
      K.rise('q-foot', 160, 1010, t, T.perf + 1.0, { dist: 10 });
    },
  };
}

// ------------------------------------------------------------------ 5b · SEVEN-COMPANY SCORECARD (illustrative)
const SCORE = [
  ['Helix Traffic Solutions', 'Industrials', 186, 18, 16.1, '2', 'ahead', 'helix'],
  ['Momentum Environmental', 'Industrials', 98, 34, 15.2, '2', 'ahead', 'momentum'],
  ['Lifted Trucks', 'Consumer', 519, 40, 3.2, '0', 'budget', 'lifted'],
  ['RoadOne', 'Industrials', 412, 11, 12.4, '3', 'plan', null],
  ['PNE', 'Industrials', 142, 9, 13.8, '1', 'plan', null],
  ['MSI Express', 'Consumer', 221, 7, 10.6, '0', 'watch', 'msi'],
  ['Ross-Simons', 'Consumer', 268, 4, 9.8, '0', 'watch', 'ross'],
];
const STATUS = {
  ahead: ['Ahead of plan', C.services, C.ink, 'none'], plan: ['On plan', 'none', C.ink2, C.lineL],
  watch: ['Watch margins', C.gold, C.ink, 'none'], budget: ['Behind budget', 'none', C.goldDeep, C.gold],
};
function score(K, T) {
  const RX = 160, RY0 = 392, RH = 80, COLS = { rev: 700, gr: 790, mg: 1200, ad: 1330, st: 1380 };
  const head = (s, x, anchor) => txt(s, { x, y: 0, size: 19, weight: 700, fill: C.muteL, anchor, ls: 2 });
  const markup = h('g', { id: 'sc-score' },
    bg(C.ivory),
    ...header('k', 'PORTFOLIO SCORECARD · YEAR TO DATE', 'How seven of our companies are tracking', true),
    illus('k-tag', true),
    g('k-cols', head('COMPANY', 24, 'start'), head('REVENUE', COLS.rev, 'end'), head('GROWTH', COLS.gr, 'start'),
      head('EBITDA %', COLS.mg, 'end'), head('ADD-ONS', COLS.ad, 'end'), head('STATUS', COLS.st, 'start'),
      h('line', { x1: 0, x2: 1600, y1: 16, y2: 16, stroke: C.lineL, 'stroke-width': 2 })),
    ...SCORE.map(([n, sec, rev, gr, mg, ad, st], i) => {
      const [lab, fill, col, strokeC] = STATUS[st];
      return g(`k-r${i}`,
        rect({ id: `k-bg${i}`, x: 0, y: 0, width: 1600, height: RH - 8, rx: 12, fill: C.cardL, stroke: C.lineL, 'stroke-width': 1.5 }),
        rect({ x: 0, y: 0, width: 6, height: RH - 8, rx: 3, fill: sec === 'Consumer' ? C.consumer : C.industrials }),
        txt(n, { x: 24, y: 34, size: 28, weight: 600, family: SERIF, fill: C.ink }),
        txt(sec.toUpperCase(), { x: 24, y: 60, size: 16, weight: 700, fill: C.muteL, ls: 2 }),
        txt(`$${rev}M`, { x: COLS.rev, y: 46, size: 30, weight: 600, family: SERIF, fill: C.ink, anchor: 'end' }),
        rect({ x: COLS.gr, y: 26, width: 200, height: 18, rx: 9, fill: C.trackL }),
        rect({ id: `k-gb${i}`, x: COLS.gr, y: 26, width: 0, height: 18, rx: 9, fill: gr >= 15 ? C.services : C.slate }),
        txt(`+${gr}%`, { x: COLS.gr + 216, y: 44, size: 26, weight: 700, fill: C.ink }),
        txt(`${mg.toFixed(1)}%`, { x: COLS.mg, y: 46, size: 28, weight: 600, fill: C.ink, anchor: 'end' }),
        txt(ad, { x: COLS.ad, y: 46, size: 26, weight: 600, fill: C.ink, anchor: 'end' }),
        rect({ x: COLS.st, y: 16, width: 200, height: 40, rx: 20, fill, stroke: strokeC, 'stroke-width': 2 }),
        txt(lab, { x: COLS.st + 100, y: 43, size: 20, weight: 700, fill: col, anchor: 'middle' }));
    }),
    foot('k-foot', 'Illustrative figures: YTD revenue ($M), growth vs prior-year period, EBITDA margin, add-on acquisitions closed. Lifted Trucks from dashboard estimates.', true),
  );
  return {
    id: 'score', from: T.score, to: T.funds, markup,
    update(t) {
      headerIn(K, 'k', t, T.score + 0.15);
      K.pop('k-tag', 1620, 196, t, T.score + 0.5, { amount: 0.06 });
      K.rise('k-cols', RX, RY0 - 26, t, T.seven - 0.4, { dist: 10 });
      SCORE.forEach(([, , , gr, , , , key], i) => {
        const at = T.seven - 0.3 + i * 0.12;
        K.rise(`k-r${i}`, RX, RY0 + i * RH, t, at, { dist: 20 });
        K.attr(`k-gb${i}`, 'width', (200 * gr / 40 * prog(t, at + 0.2, at + 1.0, outCubic)).toFixed(1));
        const cue = key ? T.sc[key] : null;
        const hi = cue == null ? 0 : Math.max(0, Math.min(prog(t, cue - 0.15, cue + 0.2), 1 - prog(t, cue + 1.6, cue + 2.2)));
        K.attr(`k-bg${i}`, 'fill', hi > 0.01 ? `rgba(194,155,98,${(0.22 * hi).toFixed(3)})` : C.cardL);
        K.attr(`k-bg${i}`, 'stroke', hi > 0.5 ? C.gold : C.lineL);
      });
      K.rise('k-foot', 160, 1010, t, T.score + 1.0, { dist: 10 });
    },
  };
}

// ------------------------------------------------------------------ 6 · FUND PERFORMANCE (illustrative)
function funds(K, T) {
  const BW = 1100, MAXX = 3;
  const row = (id, name, sub, color) => g(id,
    txt(name, { size: 56, weight: 600, family: SERIF, fill: C.ink }), txt(sub, { y: 44, size: 26, fill: C.muteL }),
    rect({ x: 420, y: -50, width: BW, height: 76, rx: 12, fill: C.trackL }),
    ...[1, 2, 3].map((x) => [h('line', { x1: 420 + BW * x / MAXX, x2: 420 + BW * x / MAXX, y1: -62, y2: 38, stroke: C.lineL, 'stroke-width': 2 }),
      txt(`${x}.0x`, { x: 420 + BW * x / MAXX, y: 72, size: 20, fill: C.muteL, anchor: 'middle' })]),
    rect({ id: `${id}-b`, x: 420, y: -50, width: 0, height: 76, rx: 12, fill: color }),
    txt('0.0x', { id: `${id}-v`, x: 440, y: 2, size: 48, weight: 700, family: SERIF, fill: C.ink }));
  const markup = h('g', { id: 'sc-funds' },
    bg(C.ivory),
    ...header('m', 'FUND PERFORMANCE', 'Multiple of invested capital', true),
    illus('m-tag', true),
    row('m-f1', 'Fund I', '2018 vintage · $385M+', C.gold),
    row('m-f2', 'Fund II', '2022 vintage · $625M+', C.ink),
    foot('m-foot', 'Illustrative gross multiples. Replace with the fund reporting package before use.', true),
  );
  const F = [['m-f1', 2.1, T.f1, 520], ['m-f2', 1.4, T.f2, 760]];
  return {
    id: 'funds', from: T.funds, to: T.lifted, markup,
    update(t) {
      headerIn(K, 'm', t, T.funds + 0.15);
      K.pop('m-tag', 1620, 196, t, T.funds + 0.5, { amount: 0.06 });
      F.forEach(([id, v, at, y], i) => {
        K.rise(id, 160, y, t, i ? at - 0.9 : T.funds + 0.4, { dist: 24 });
        const k = prog(t, at - 0.2, at + 0.8, outCubic), w = BW * v / MAXX * k;
        K.attr(`${id}-b`, 'width', w.toFixed(1));
        K.attr(`${id}-v`, 'x', (420 + w + 20).toFixed(1));
        K.text(`${id}-v`, `${(v * k).toFixed(1)}x`);
      });
      K.rise('m-foot', 160, 1010, t, T.funds + 1.0, { dist: 10 });
    },
  };
}

// ------------------------------------------------------------------ 7 · SPOTLIGHT: LIFTED TRUCKS (dashboard estimates)
const LT_LOGO = '../assets/lifted/lifted-trucks-logo-transparent.png', LT_AR = 155 / 422, LT_PHOTO = '../assets/lifted/showroom.jpg';
function lifted(K, T) {
  const lw = 520, lh = lw * LT_AR;
  const stat = (id, sub) => g(id, txt('', { id: `${id}-v`, size: 120, weight: 700, family: 'Oswald, sans-serif', fill: '#F5F3EF', ls: 1 }),
    txt(sub, { y: 52, size: 28, fill: '#C9CDD2' }));
  const markup = h('g', { id: 'sc-lifted' },
    bg('#17191C'),
    h('image', { href: LT_PHOTO, x: 0, y: 0, width: W, height: H, preserveAspectRatio: 'xMidYMid slice' }),
    rect({ width: W, height: H, fill: '#17191C', opacity: 0.82 }),
    ...header('s', 'PORTFOLIO SPOTLIGHT', 'Lifted Trucks'),
    g('s-logo', h('image', { href: LT_LOGO, x: -lw / 2, y: -lh / 2, width: lw, height: lh })),
    stat('s-u', 'trucks sold, January to September'), stat('s-p', 'units vs last year'), stat('s-s', 'new stores opened in 2026'),
    rect({ id: 's-rule', x: 160, y: 470, width: 0, height: 6, rx: 3, fill: '#E8762C' }),
    foot('s-foot', 'Estimates from the Lifted Trucks Operating Dashboard. Shown for illustration.'),
  );
  const S = [['s-u', 6445, (v) => fmtInt(v), T.ltUnits, 160], ['s-p', 37, (v) => `+${Math.round(v)}%`, T.ltPct, 760], ['s-s', 5, (v) => String(Math.round(v)), T.ltStores, 1280]];
  return {
    id: 'lifted', from: T.lifted, to: T.focus, markup,
    update(t) {
      headerIn(K, 's', t, T.lifted + 0.15);
      K.pop('s-logo', 1500, 250, t, T.lt - 0.2, { d: 0.6, amount: 0.1 });
      K.attr('s-rule', 'width', (1600 * prog(t, T.lt, T.lt + 0.8, inOutCubic)).toFixed(1));
      S.forEach(([id, v, f, at, x]) => {
        K.rise(id, x, 700, t, at - 0.4, { dist: 30 });
        K.text(`${id}-v`, f(v * prog(t, at - 0.3, at + 0.9, outCubic)));
      });
      K.rise('s-foot', 160, 1010, t, T.lifted + 1.0, { dist: 10 });
    },
  };
}

// ------------------------------------------------------------------ 8 · PRIORITIES + END CARD
const PRI = [
  ['Add-on acquisitions', 'Keep building platforms through M&A'],
  ['Cash conversion', 'Turn this year’s growth into free cash flow'],
  ['Fund I realizations', 'Prepare mature companies for exit'],
];
function focus(K, T, cfg) {
  const ec = cfg.storyboard.endCard;
  const markup = h('g', { id: 'sc-focus' },
    bg(C.ivory),
    ...header('r', 'REST OF 2026', 'Where we are focused', true),
    ...PRI.map(([a, b], i) => g(`r-p${i}`, rect({ x: 0, y: 0, width: 1600, height: 150, rx: 20, fill: C.cardL, stroke: C.lineL, 'stroke-width': 2 }),
      txt(`0${i + 1}`, { x: 48, y: 98, size: 64, weight: 600, family: SERIF, fill: C.gold }),
      txt(a, { x: 190, y: 72, size: 44, weight: 600, family: SERIF, fill: C.ink }),
      txt(b, { x: 190, y: 116, size: 28, fill: C.ink2 }))),
  );
  const endMarkup = h('g', { id: 'sc-end' },
    bg(C.navy), rules('x-r'),
    g('x-thanks', txt(ec.thanks, { size: 96, weight: 600, family: SERIF, anchor: 'middle' })),
    stroke('x-rule', 'M860,500 H1060', C.gold, 4),
    wordmark('x-mark', false, 0.8),
    g('x-src', txt('Firm history and transactions: public announcements.', { size: 22, fill: C.mute }),
      txt('Portfolio performance and fund multiples: illustrative. Lifted Trucks: estimates.', { y: 32, size: 22, fill: C.mute })),
  );
  return [{
    id: 'focus', from: T.focus, to: T.end, markup,
    update(t) {
      headerIn(K, 'r', t, T.focus + 0.15);
      PRI.forEach((_, i) => {
        const k = riseK(t, T.pr[i] - 0.3, 0.5);
        K.put(`r-p${i}`, 160 + (1 - k) * 70, 390 + i * 180, k);
      });
    },
  }, {
    id: 'end', from: T.end, to: T.duration + 1, markup: endMarkup,
    update(t) {
      const e = T.end;
      for (let i = 0; i < 5; i++) K.draw(`x-r${i}`, prog(t, e + 0.2 + i * 0.2, e + 3.4 + i * 0.2, inOutSine));
      K.rise('x-thanks', 960, 430, t, Math.max(e + 0.3, T.thanks - 0.2));
      K.draw('x-rule', prog(t, e + 0.9, e + 1.4, outCubic));
      K.rise('x-mark', 960, 640, t, e + 1.2, { d: 0.9, dist: 16 });
      K.rise('x-src', 160, 990, t, e + 1.8, { dist: 10 });
    },
  }];
}

export function buildScenes(K, T, cfg) {
  return [open(K, T), firm(K, T), portfolio(K, T), activity(K, T), perf(K, T), score(K, T), funds(K, T), lifted(K, T), ...focus(K, T, cfg)];
}
