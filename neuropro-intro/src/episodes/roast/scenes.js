// The Roast of Nonantum Capital Partners. Each segment returns { id, from, to, markup, update(t) }.
// Affectionate jokes built only from public professional bios: titles, schools and prior firms.
import { h } from '../../engine/svg.js';
import { lerp, prog, outCubic, inOutCubic, inOutSine, outBack } from '../../engine/anim.js';
import { W, H, C, DISPLAY, BODY, txt, g, stroke, riseK, wrap, block, monogram, stampMark } from './kit.js';
import { PUNCH } from './timeline.js';

const rect = (a) => h('rect', a);
const RX = 1290;                       // centre of the joke stage (right of the roastee card)
const fmtInt = (v) => Math.round(v).toLocaleString('en-US');

// ---------------------------------------------------------------- captions (the narration as on-stage type)
function captions(K, T, ids, { x = 830, y = 250, anchor = 'start', setupMax = 38, punchMax = 26, setupSize = 44, punchSize = 70 } = {}) {
  const markup = ids.map((id) => {
    const text = T.caption[id], punch = PUNCH.includes(id);
    const long = punch && text.length > punchMax * 2.4;          // long punchlines drop a size so they stay in three lines
    const pSize = long ? Math.round(punchSize * 0.8) : punchSize;
    const lines = wrap(text, punch ? Math.round(punchMax * punchSize / pSize) : setupMax);
    return g(`cap-${id}`, block(lines, punch
      ? { size: pSize, weight: 700, family: DISPLAY, fill: C.goldHi, anchor, ls: 1, lh: 1.08 }
      : { size: setupSize, weight: 600, family: BODY, fill: C.cream, anchor, lh: 1.2 }));
  }).join('');
  const update = (t) => ids.forEach((id) => {
    const at = T.vo(id), end = T.capEnd[id], punch = PUNCH.includes(id);
    const kin = riseK(t, at - 0.08, punch ? 0.35 : 0.45), kout = prog(t, end - 0.25, end, inOutCubic);
    const s = punch ? lerp(0.92, 1, outBack(prog(t, at - 0.08, at + 0.3), 2.4)) : 1;
    K.put(`cap-${id}`, x, y + (1 - kin) * 24 - kout * 16, kin * (1 - kout), s, s);
  });
  return { markup, update };
}
/** Visible window helper: fades a gag in at a and out at b. */
const win = (t, a, b, d = 0.3) => Math.min(prog(t, a, a + d, outCubic), 1 - prog(t, b - d, b, inOutCubic));

// ---------------------------------------------------------------- roastee card
const ROASTEES = {
  jon: { name: 'Jon Biotti', initials: 'JB', title: ['Co-Founder, Managing Partner', '& Chief Investment Officer'], chips: ['Harvard, three times', 'Charlesbank, 1998 to 2018', 'Named the firm'] },
  david: { name: 'David Ganitsky', initials: 'DG', title: ['Co-Founder &', 'Managing Director'], chips: ['Harvard and Stanford', 'The Parthenon Group', 'Charlesbank'] },
  peter: { name: 'Peter Apostolides', initials: 'PA', title: ['Chief Financial Officer &', 'Chief Compliance Officer'], chips: ['Bain Capital alum', 'Two titles, one signature', 'Reconciles for fun'] },
  shawn: { name: 'Shawn Jordan', initials: 'SJ', title: ['Vice President,', 'Operations'], chips: ['MA in Philosophy', 'Office Manager to VP', 'Here since day one'] },
  kyle: { name: 'Kyle Guinivan', initials: 'KG', title: ['Principal'], chips: ['McKinsey and Citadel', 'Indiana and Wharton', 'Weekends: none'] },
};
function card(k) {
  const r = ROASTEES[k];
  return g(`${k}-card`,
    rect({ x: 0, y: 0, width: 640, height: 780, rx: 28, fill: C.card, stroke: C.line, 'stroke-width': 2 }),
    rect({ x: 0, y: 0, width: 640, height: 10, rx: 5, fill: C.gold }),
    txt("TONIGHT'S ROASTEE", { x: 320, y: 70, size: 24, weight: 700, fill: C.gold, anchor: 'middle', ls: 5 }),
    h('g', { transform: 'translate(320 250)' }, monogram(r.initials, 118)),
    txt(r.name.toUpperCase(), { x: 320, y: 480, size: r.name.length > 14 ? 54 : 64, weight: 700, family: DISPLAY, anchor: 'middle', ls: 2 }),
    ...r.title.map((l, i) => txt(l, { x: 320, y: 528 + i * 34, size: 26, fill: C.mute, anchor: 'middle' })),
    ...r.chips.map((c, i) => h('g', { transform: `translate(320 ${616 + i * 56})` },
      rect({ x: -250, y: -22, width: 500, height: 46, rx: 23, fill: 'none', stroke: C.goldDeep, 'stroke-width': 2 }),
      txt(c, { y: 9, size: 23, weight: 600, fill: C.cream, anchor: 'middle' }))));
}
const cardIn = (K, k, t, seg) => { const ki = riseK(t, seg.from + 0.25, 0.6); K.put(`${k}-card`, 110 + (1 - ki) * -120, 190, ki); };

// a sheet of paper prop centred on (0,0)
const paper = (w, hh, ...kids) => [rect({ x: -w / 2, y: -hh / 2, width: w, height: hh, rx: 14, fill: C.paper }), ...kids].join('');

// ---------------------------------------------------------------- INTRO
function marquee(id, scale = 1) {
  const bulbs = [];
  const W2 = 1300, H2 = 470;
  for (let i = 0; i <= 26; i++) { bulbs.push([-W2 / 2 + i * W2 / 26, -H2 / 2]); bulbs.push([-W2 / 2 + i * W2 / 26, H2 / 2]); }
  for (let i = 1; i < 9; i++) { bulbs.push([-W2 / 2, -H2 / 2 + i * H2 / 9]); bulbs.push([W2 / 2, -H2 / 2 + i * H2 / 9]); }
  return g(id, h('g', { transform: `scale(${scale})` },
    rect({ x: -W2 / 2, y: -H2 / 2, width: W2, height: H2, rx: 24, fill: C.card, stroke: C.gold, 'stroke-width': 6 }),
    ...bulbs.map(([x, y], i) => h('circle', { id: `${id}-b${i}`, cx: x, cy: y, r: 9, fill: C.goldHi })),
    txt('THE ROAST OF', { y: -110, size: 58, weight: 600, family: DISPLAY, anchor: 'middle', ls: 12 }),
    txt('NONANTUM', { y: 70, size: 200, weight: 700, family: DISPLAY, fill: C.gold, anchor: 'middle', ls: 14 }),
    txt('CAPITAL PARTNERS', { y: 150, size: 46, weight: 600, family: DISPLAY, anchor: 'middle', ls: 18 })));
}
const bulbsChase = (K, id, t, n = 70) => { for (let i = 0; i < n; i++) { try { K.attr(`${id}-b${i}`, 'opacity', ((Math.floor(t * 6) + i) % 3 === 0 ? 0.35 : 1).toFixed(2)); } catch { break; } } };
const BULBS = 2 * 27 + 2 * 8;

function intro(K, T) {
  const cap = captions(K, T, ['o1', 'o2'], { x: 960, y: 850, anchor: 'middle', setupMax: 60, punchMax: 48, punchSize: 64 });
  const markup = h('g', { id: 'sc-intro' }, marquee('i-mq'), cap.markup);
  return {
    id: 'intro', from: T.seg.intro.from, to: T.seg.intro.to, markup,
    update(t) {
      const k = outBack(prog(t, 0.2, 0.9), 1.8);
      K.put('i-mq', 960, 400, prog(t, 0.2, 0.5), k, k);
      bulbsChase(K, 'i-mq', t, BULBS);
      cap.update(t);
    },
  };
}

// ---------------------------------------------------------------- JON
function jon(K, T) {
  const seg = T.seg.jon, c = (id, cue) => T.vo(id, cue);
  const cap = captions(K, T, ['j1', 'j2', 'j3', 'j4', 'j5']);
  const dip = (i, lab) => g(`jn-d${i}`, paper(220, 150,
    h('circle', { cx: 70, cy: 40, r: 22, fill: C.velvet2 }), h('path', { d: 'M60,58 L52,92 L70,80 L88,92 L80,58', fill: C.velvet2 }),
    txt(lab, { x: -10, y: 4, size: 44, weight: 700, family: DISPLAY, fill: C.ink, anchor: 'middle' }),
    txt('HARVARD', { x: -10, y: 40, size: 18, weight: 700, fill: C.velvet, anchor: 'middle', ls: 4 })));
  const markup = h('g', { id: 'sc-jon' }, card('jon'), cap.markup,
    dip(0, 'A.B.'), dip(1, 'M.B.A.'), dip(2, 'M.P.A.'),
    g('jn-loyal', paper(660, 300,
      txt('HARVARD REWARDS', { y: -86, size: 48, weight: 700, family: DISPLAY, fill: C.velvet, anchor: 'middle', ls: 4 }),
      txt('Loyalty card · Jon B.', { y: -46, size: 22, fill: '#6B5B5B', anchor: 'middle' }),
      ...[0, 1, 2, 3].map((i) => h('circle', { cx: -195 + i * 130, cy: 30, r: 46, fill: 'none', stroke: '#B9A99A', 'stroke-width': 4, 'stroke-dasharray': '8 8' })),
      ...[0, 1, 2].map((i) => h('g', { id: `jn-p${i}`, opacity: 0, transform: `translate(${-195 + i * 130} 30)` }, h('circle', { r: 40, fill: C.velvet2 }), h('path', { d: 'M-16,0 L-5,12 L18,-14', fill: 'none', stroke: C.paper, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }))),
      txt('4th degree FREE', { x: 195, y: 108, size: 22, weight: 700, fill: C.velvet, anchor: 'middle' }))),
    g('jn-year', txt('1998', { id: 'jn-yearT', size: 210, weight: 700, family: DISPLAY, fill: C.gold, anchor: 'middle', ls: 4 }),
      txt('YEARS AT CHARLESBANK', { y: 64, size: 30, weight: 600, fill: C.mute, anchor: 'middle', ls: 6 })),
    g('jn-notice', h('g', { transform: 'rotate(-8)' }, stampMark('NOTICE PERIOD: 20 YEARS', C.red, 760))),
    ...[['NON-an-tum?', C.red, 'TAKE 1'], ['nuh-NAN-tum?', C.red, 'TAKE 2'], ['No-NAN-tum.', C.green, 'TAKE 3']].map(([s, col, tk], i) => g(`jn-t${i}`,
      rect({ x: -420, y: -52, width: 840, height: 96, rx: 14, fill: C.card, stroke: col, 'stroke-width': 3 }),
      txt(tk, { x: -380, y: 12, size: 26, weight: 700, fill: C.mute, ls: 3 }),
      txt(s, { x: -220, y: 18, size: 54, weight: 700, family: DISPLAY, fill: col }),
      txt(i < 2 ? 'CUT' : 'PRINT IT', { x: 380, y: 12, size: 26, weight: 700, fill: col, anchor: 'end', ls: 3 }))));
  return {
    id: 'jon', from: seg.from, to: seg.to, markup,
    update(t) {
      cardIn(K, 'jon', t, seg); cap.update(t);
      const d0 = c('j1', 'three degrees');
      for (let i = 0; i < 3; i++) K.pop(`jn-d${i}`, RX - 260 + i * 260, 700, t, d0 + i * 0.3, { o: 1 - prog(t, T.vo('j2') - 0.2, T.vo('j2') + 0.1) });
      const lw = win(t, T.vo('j2'), T.capEnd.j2);
      K.put('jn-loyal', RX, 720, lw, lerp(0.9, 1, lw));
      const rc = c('j2', 'returning customer');
      for (let i = 0; i < 3; i++) { const p = prog(t, rc - 0.6 + i * 0.25, rc - 0.45 + i * 0.25); K.attr(`jn-p${i}`, 'opacity', p.toFixed(2)); }
      const yw = win(t, T.vo('j3'), T.capEnd.j4);
      K.put('jn-year', RX, 680, yw);
      K.text('jn-yearT', String(Math.round(1998 + 20 * prog(t, c('j3', 'twenty years') - 0.1, c('j3', 'twenty years') + 1.0, inOutCubic))));
      const nk = prog(t, T.vo('j4') + 0.3, T.vo('j4') + 0.45);
      const ns = nk > 0 ? lerp(1.6, 1, outCubic(nk)) : 0;
      K.put('jn-notice', RX, 880, nk * (1 - prog(t, T.capEnd.j4 - 0.25, T.capEnd.j4)), ns, ns);
      const tk = [c('j5', 'village') + 0.9, c('j5', 'village') + 2.0, c('j5', 'three takes') - 0.6];
      for (let i = 0; i < 3; i++) { const k = riseK(t, tk[i], 0.35) * (1 - prog(t, T.capEnd.j5 - 0.25, T.capEnd.j5)); K.put(`jn-t${i}`, RX, 620 + i * 115, k); }
    },
  };
}

// ---------------------------------------------------------------- DAVID
function pennant(id, label, color, flip) {
  return g(id, h('g', { transform: flip ? 'scale(-1 1)' : '' },
    rect({ x: -8, y: -150, width: 12, height: 300, rx: 6, fill: '#8C7A62' }),
    h('path', { d: 'M4,-140 L330,-70 L4,0 Z', fill: color })),
  txt(label, { x: flip ? -150 : 150, y: -60, size: 40, weight: 700, family: DISPLAY, fill: C.paper, anchor: 'middle', ls: 4 }));
}
function parthenon() {
  const cols = Array.from({ length: 8 }, (_, i) => rect({ x: -300 + i * 80, y: -90, width: 40, height: 200, fill: C.paper }));
  const scaff = [];
  for (let x = -330; x <= 330; x += 110) scaff.push(h('line', { x1: x, y1: -190, x2: x, y2: 150, stroke: C.gold, 'stroke-width': 5 }));
  for (let y = -150; y <= 150; y += 75) scaff.push(h('line', { x1: -340, y1: y, x2: 340, y2: y, stroke: C.gold, 'stroke-width': 5 }));
  for (let x = -330; x < 330; x += 110) scaff.push(h('line', { x1: x, y1: 150, x2: x + 110, y2: -150, stroke: C.goldDeep, 'stroke-width': 3 }));
  return [
    h('g', { id: 'dv-temple' }, h('path', { d: 'M-340,-110 L0,-200 L340,-110 Z', fill: C.paper }), rect({ x: -340, y: -112, width: 680, height: 24, fill: C.paper }),
      ...cols, rect({ x: -350, y: 110, width: 700, height: 22, fill: C.paper }), rect({ x: -370, y: 132, width: 740, height: 22, fill: C.paper })),
    h('g', { id: 'dv-scaff', opacity: 0 }, ...scaff),
  ].join('');
}
function david(K, T) {
  const seg = T.seg.david, c = (id, cue) => T.vo(id, cue);
  const cap = captions(K, T, ['d1', 'd2', 'd3', 'd4']);
  const markup = h('g', { id: 'sc-david' }, card('david'), cap.markup,
    pennant('dv-h', 'HARVARD', '#A51C30', false), pennant('dv-s', 'STANFORD', '#8C1515', true),
    ...[['East Coast smugness', 'dv-e'], ['West Coast smugness', 'dv-w']].map(([s, id]) => g(id,
      rect({ x: 0, y: -30, width: 44, height: 44, rx: 8, fill: 'none', stroke: C.gold, 'stroke-width': 4 }),
      h('g', { transform: 'translate(22 -8)' }, h('path', { d: 'M-16,0 L-5,12 L18,-14', fill: 'none', stroke: C.goldHi, 'stroke-width': 7, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })),
      txt(s, { x: 64, y: 4, size: 36, weight: 600 }))),
    g('dv-par', parthenon()),
    g('dv-sign', rect({ x: -260, y: -48, width: 520, height: 96, rx: 10, fill: '#F2B33A' }),
      h('path', { d: 'M-260,-48 L-220,-48 L-260,-8 Z M260,48 L220,48 L260,8 Z', fill: C.ink }),
      txt('UNDER RENOVATION', { y: -6, size: 40, weight: 700, family: DISPLAY, fill: C.ink, anchor: 'middle', ls: 3 }),
      txt('SINCE 432 BC', { y: 32, size: 26, weight: 700, fill: C.ink, anchor: 'middle', ls: 4 })),
    g('dv-hold', h('g', { transform: 'rotate(-7)' }, stampMark('HOLD PERIOD: TBD', C.red, 620))));
  return {
    id: 'david', from: seg.from, to: seg.to, markup,
    update(t) {
      cardIn(K, 'david', t, seg); cap.update(t);
      const pw = 1 - prog(t, T.capEnd.d2 - 0.25, T.capEnd.d2);
      K.pop('dv-h', RX - 400, 690, t, c('d1', 'Harvard') - 0.15, { o: pw });
      K.pop('dv-s', RX + 400, 690, t, c('d1', 'Stanford') - 0.15, { o: pw });
      K.rise('dv-e', RX - 230, 830, t, T.vo('d2') + 1.4, { dist: 14, o: pw });
      K.rise('dv-w', RX - 230, 900, t, T.vo('d2') + 2.0, { dist: 14, o: pw });
      const tw = win(t, c('d3', 'Parthenon') - 0.2, T.capEnd.d4);
      K.put('dv-par', RX, 730, tw, lerp(0.92, 1, tw), lerp(0.92, 1, tw));
      K.attr('dv-scaff', 'opacity', prog(t, c('d3', 'under renovation') - 0.4, c('d3', 'under renovation') + 0.2).toFixed(2));
      const sk = prog(t, c('d3', 'under renovation'), c('d3', 'under renovation') + 0.5, outBack);
      K.put('dv-sign', RX, 560 + (1 - sk) * -60, Math.min(1, sk * 2) * tw, 1, 1, Math.sin(t * 2.2) * 2.5);
      const hk = prog(t, T.vo('d4') + 0.4, T.vo('d4') + 0.55), hs = hk > 0 ? lerp(1.6, 1, outCubic(hk)) : 0;
      K.put('dv-hold', RX, 800, hk * (1 - prog(t, T.capEnd.d4 - 0.25, T.capEnd.d4)), hs, hs);
    },
  };
}

// ---------------------------------------------------------------- PETER
function peter(K, T) {
  const seg = T.seg.peter, c = (id, cue) => T.vo(id, cue);
  const cap = captions(K, T, ['p1', 'p2', 'p3', 'p4']);
  const row = (y, a, b, id) => h('g', { id, opacity: id ? 0 : 1 }, txt(a, { x: -330, y, size: 26, fill: '#5A4A4A' }), txt(b, { x: 330, y, size: 26, weight: 700, fill: C.ink, anchor: 'end' }),
    h('line', { x1: -330, x2: 330, y1: y + 14, y2: y + 14, stroke: '#E2D8C8', 'stroke-width': 2 }));
  const LPS = [['LP account 1', '41,250,000.00'], ['LP account 2', '18,775,500.00'], ['LP account 3', '9,410,000.00'], ['GP commitment', '6,250,000.00']];
  const markup = h('g', { id: 'sc-peter' }, card('peter'), cap.markup,
    g('pt-card', paper(700, 330,
      txt('PETER APOSTOLIDES', { x: -300, y: -70, size: 48, weight: 700, family: DISPLAY, fill: C.ink, ls: 2 }),
      txt('Chief Financial Officer', { x: -300, y: -18, size: 30, fill: '#4A3A3A' }),
      h('g', { id: 'pt-cco', opacity: 0 }, txt('Chief Compliance Officer', { x: -300, y: 26, size: 30, fill: '#4A3A3A' })),
      txt('NONANTUM CAPITAL PARTNERS · BOSTON', { x: -300, y: 120, size: 18, weight: 700, fill: C.velvet, ls: 3 }))),
    g('pt-exp', paper(760, 460,
      txt('EXPENSE REPORT', { x: -330, y: -170, size: 44, weight: 700, family: DISPLAY, fill: C.ink, ls: 3 }),
      row(-110, 'Team dinner, Boston', '$412.00'), row(-56, 'Highlighters (assorted)', '$38.50'),
      row(10, 'Submitted by', 'P. Apostolides', 'pt-r0'), row(64, 'Reviewed by', 'P. Apostolides', 'pt-r1'), row(118, 'Approved by', 'P. Apostolides', 'pt-r2'),
      h('g', { id: 'pt-ok', opacity: 0, transform: 'translate(150 160) rotate(-10)' }, stampMark('APPROVED', C.green, 380)))),
    g('pt-sheet', paper(780, 420,
      txt('CAPITAL ACCOUNTS · FRI 11:47 PM', { x: -350, y: -160, size: 28, weight: 700, fill: C.ink, ls: 2 }),
      ...LPS.map(([a, b], i) => row(-100 + i * 50, a, b)),
      rect({ id: 'pt-varbg', x: -350, y: 112, width: 700, height: 64, rx: 10, fill: '#F6D7D3' }),
      txt('VARIANCE', { x: -326, y: 154, size: 28, weight: 700, fill: C.ink, ls: 3 }),
      txt('$0.01', { id: 'pt-var', x: 326, y: 154, size: 34, weight: 700, fill: C.red, anchor: 'end' }))),
    g('pt-again', rect({ x: -330, y: -70, width: 660, height: 140, rx: 20, fill: C.card, stroke: C.gold, 'stroke-width': 3 }),
      txt('Reconcile again?', { x: -290, y: 14, size: 44, weight: 600 }),
      h('g', { id: 'pt-yes' }, rect({ x: 110, y: -36, width: 180, height: 72, rx: 14, fill: C.gold }), txt('YES', { x: 200, y: 14, size: 38, weight: 700, family: DISPLAY, fill: C.ink, anchor: 'middle', ls: 3 })),
      h('path', { id: 'pt-cur', d: 'M0,0 L0,46 L12,34 L22,56 L30,52 L20,30 L36,30 Z', fill: C.paper, stroke: C.ink, 'stroke-width': 2 })));
  return {
    id: 'peter', from: seg.from, to: seg.to, markup,
    update(t) {
      cardIn(K, 'peter', t, seg); cap.update(t);
      const cw = win(t, T.vo('p1'), T.capEnd.p1);
      K.put('pt-card', RX, 720, cw, lerp(0.92, 1, cw), lerp(0.92, 1, cw), lerp(-4, -2, cw));
      K.attr('pt-cco', 'opacity', prog(t, c('p1', 'Chief Compliance') - 0.1, c('p1', 'Chief Compliance') + 0.3).toFixed(2));
      const ew = win(t, T.vo('p2'), T.capEnd.p2);
      K.put('pt-exp', RX, 770, ew);
      for (let i = 0; i < 3; i++) K.attr(`pt-r${i}`, 'opacity', prog(t, T.vo('p2') + 0.6 + i * 0.7, T.vo('p2') + 0.9 + i * 0.7).toFixed(2));
      const ok = prog(t, c('p2', 'approves his own') + 0.3, c('p2', 'approves his own') + 0.45);
      K.attr('pt-ok', 'opacity', ok.toFixed(2));
      K.attr('pt-ok', 'transform', `translate(150 160) rotate(-10) scale(${(ok > 0 ? lerp(1.6, 1, outCubic(ok)) : 0).toFixed(3)})`);
      const sw = win(t, T.vo('p3'), T.capEnd.p3);
      K.put('pt-sheet', RX, 720, sw);
      const done = t > c('p3', 'reconciling') + 1.4;
      K.text('pt-var', done ? '$0.00' : '$0.01');
      K.attr('pt-var', 'fill', done ? C.green : C.red);
      K.attr('pt-varbg', 'fill', done ? '#D6EEDD' : '#F6D7D3');
      const aw = win(t, T.vo('p4') - 0.1, T.capEnd.p4);
      K.put('pt-again', RX, 720, aw);
      const press = Math.sin(prog(t, T.vo('p4') + 0.35, T.vo('p4') + 0.6) * Math.PI);
      K.attr('pt-yes', 'transform', `translate(200 0) scale(${(1 - 0.12 * press).toFixed(3)}) translate(-200 0)`);
      const cm = prog(t, T.vo('p4') - 0.1, T.vo('p4') + 0.35, inOutCubic);
      K.attr('pt-cur', 'transform', `translate(${lerp(-60, 210, cm).toFixed(1)} ${lerp(140, 10, cm).toFixed(1)})`);
    },
  };
}

// ---------------------------------------------------------------- SHAWN
function shawn(K, T) {
  const seg = T.seg.shawn, c = (id, cue) => T.vo(id, cue);
  const cap = captions(K, T, ['s1', 's2', 's3', 's4']);
  const book = (y, w, col, label) => h('g', { transform: `translate(0 ${y})` }, rect({ x: -w / 2, y: -30, width: w, height: 60, rx: 6, fill: col }),
    rect({ x: -w / 2 + 14, y: -30, width: 6, height: 60, fill: C.gold }), rect({ x: w / 2 - 20, y: -30, width: 6, height: 60, fill: C.gold }),
    txt(label, { y: 10, size: 26, weight: 700, family: DISPLAY, fill: C.paper, anchor: 'middle', ls: 3 }));
  const rung = (id, label, y) => g(id, rect({ x: -170, y: -36, width: 340, height: 72, rx: 14, fill: C.card, stroke: C.gold, 'stroke-width': 3 }),
    txt(label, { y: 11, size: 28, weight: 600, anchor: 'middle' }));
  const markup = h('g', { id: 'sc-shawn' }, card('shawn'), cap.markup,
    g('sh-books', book(-70, 420, '#5B3A29', 'KANT'), book(0, 470, '#2E4057', 'HEGEL'), book(80, 700, C.velvet2, 'LIMITED PARTNERSHIP AGREEMENT')),
    g('sh-q', txt('WHY ARE WE HERE?', { size: 46, weight: 600, family: DISPLAY, fill: C.mute, anchor: 'middle', ls: 4 })),
    g('sh-a', txt('THE CARRY.', { size: 120, weight: 700, family: DISPLAY, fill: C.goldHi, anchor: 'middle', ls: 6 })),
    rung('sh-r0', 'Office Manager', 0), rung('sh-r1', 'Manager, Operations', 0), rung('sh-r2', 'VP, Operations', 0),
    stroke('sh-arrow', 'M0,0 C40,-80 40,-160 0,-240', C.gold, 6),
    g('sh-chart', rect({ x: 0, y: 0, width: 440, height: 360, rx: 16, fill: C.card, stroke: C.line, 'stroke-width': 2 }),
      txt('VALUE CREATION', { x: 28, y: 50, size: 26, weight: 700, fill: C.gold, ls: 3 }),
      h('line', { x1: 40, x2: 410, y1: 320, y2: 320, stroke: C.line, 'stroke-width': 3 }),
      stroke('sh-pf', 'M40,300 C150,290 260,276 410,262', C.mute, 5),
      stroke('sh-sj', 'M40,310 C200,300 300,240 360,110 S400,30 420,10', C.goldHi, 7),
      txt('Portfolio', { x: 300, y: 250, size: 22, fill: C.mute }), h('g', { id: 'sh-lbl', opacity: 0 }, txt('Shawn', { x: 250, y: 120, size: 30, weight: 700, fill: C.goldHi }))));
  return {
    id: 'shawn', from: seg.from, to: seg.to, markup,
    update(t) {
      cardIn(K, 'shawn', t, seg); cap.update(t);
      const bw = win(t, c('s1', 'philosophy') - 0.3, T.capEnd.s2);
      K.put('sh-books', RX, 620, bw);
      K.rise('sh-q', RX, 820, t, c('s2', "why we're all here") - 0.2, { dist: 14, o: 1 - prog(t, T.capEnd.s2 - 0.25, T.capEnd.s2) });
      const ak = prog(t, c('s2', 'Spoiler') + 0.55, c('s2', 'Spoiler') + 0.8);
      const as = ak > 0 ? outBack(ak, 2.2) : 0;
      K.put('sh-a', RX, 940, ak * (1 - prog(t, T.capEnd.s2 - 0.25, T.capEnd.s2)), as, as);
      const lw = win(t, T.vo('s3'), T.capEnd.s4);
      const R = [[c('s3', 'office manager') - 0.2, 880], [c('s3', 'office manager') + 0.6, 760], [c('s3', 'vice president') - 0.2, 640]];
      R.forEach(([at, y], i) => K.pop(`sh-r${i}`, RX - 260, y, t, at, { o: lw, amount: 0.1 }));
      K.put('sh-arrow', RX - 450, 880, lw); K.draw('sh-arrow', prog(t, c('s3', 'office manager'), c('s3', 'vice president'), inOutSine));
      const cw = win(t, T.vo('s4') - 0.2, T.capEnd.s4);
      K.put('sh-chart', RX + 30, 560, cw);
      K.draw('sh-pf', prog(t, T.vo('s4'), T.vo('s4') + 1.0, inOutSine));
      K.draw('sh-sj', prog(t, T.vo('s4') + 0.4, T.vo('s4') + 1.8, inOutSine));
      K.attr('sh-lbl', 'opacity', prog(t, T.vo('s4') + 1.6, T.vo('s4') + 1.9).toFixed(2));
    },
  };
}

// ---------------------------------------------------------------- KYLE
function kyle(K, T) {
  const seg = T.seg.kyle, c = (id, cue) => T.vo(id, cue);
  const cap = captions(K, T, ['k1', 'k2', 'k3', 'k4']);
  const JOBS = [['McKinsey & Company', 'McKinsey'], ['Citadel Securities', 'Citadel'], ['The Wharton School', 'Wharton']];
  const markup = h('g', { id: 'sc-kyle' }, card('kyle'), cap.markup,
    g('ky-cv', paper(760, 440,
      txt('KYLE GUINIVAN', { x: -330, y: -150, size: 48, weight: 700, family: DISPLAY, fill: C.ink, ls: 2 }),
      txt('Experience', { x: -330, y: -104, size: 22, weight: 700, fill: C.velvet, ls: 3 }),
      ...JOBS.map(([n], i) => h('g', { id: `ky-j${i}`, opacity: 0 }, txt(n, { x: -330, y: -40 + i * 90, size: 34, weight: 600, fill: C.ink }),
        h('g', { id: `ky-w${i}`, opacity: 0 }, rect({ x: 120, y: -74 + i * 90, width: 210, height: 48, rx: 8, fill: 'none', stroke: C.red, 'stroke-width': 3 }),
          txt('NO WEEKENDS', { x: 225, y: -42 + i * 90, size: 22, weight: 700, fill: C.red, anchor: 'middle', ls: 2 })))))),
    g('ky-watch', h('circle', { r: 120, fill: C.card, stroke: C.gold, 'stroke-width': 8 }), rect({ x: -18, y: -150, width: 36, height: 26, rx: 6, fill: C.gold }),
      h('line', { id: 'ky-hand', x1: 0, y1: 0, x2: 0, y2: -90, stroke: C.goldHi, 'stroke-width': 6, 'stroke-linecap': 'round' }),
      txt('0.003 s', { y: 60, size: 36, weight: 700, family: DISPLAY, anchor: 'middle' }), txt('CITADEL TRADE', { y: 190, size: 26, weight: 700, fill: C.mute, anchor: 'middle', ls: 3 })),
    g('ky-glass', h('path', { d: 'M-80,-120 L80,-120 L10,0 L80,120 L-80,120 L-10,0 Z', fill: 'none', stroke: C.gold, 'stroke-width': 8, 'stroke-linejoin': 'round' }),
      h('path', { id: 'ky-sand', d: 'M-60,105 L60,105 L5,40 L-5,40 Z', fill: C.goldHi }),
      txt('7 YEARS', { y: 60 + 120, size: 36, weight: 700, family: DISPLAY, anchor: 'middle' }), txt('A "FAST" EXIT', { y: 220, size: 26, weight: 700, fill: C.mute, anchor: 'middle', ls: 3 })),
    g('ky-mx', rect({ x: -380, y: -230, width: 760, height: 460, rx: 18, fill: C.card, stroke: C.line, 'stroke-width': 2 }),
      txt('LUNCH OPTIONS · TUESDAY', { x: -350, y: -186, size: 26, weight: 700, fill: C.gold, ls: 3 }),
      h('line', { x1: 0, x2: 0, y1: -150, y2: 200, stroke: C.mute, 'stroke-width': 3 }), h('line', { x1: -340, x2: 340, y1: 25, y2: 25, stroke: C.mute, 'stroke-width': 3 }),
      txt('SYNERGY', { x: 340, y: 64, size: 22, weight: 700, fill: C.mute, anchor: 'end', ls: 2 }), txt('PROTEIN', { x: 12, y: -130, size: 22, weight: 700, fill: C.mute, ls: 2 }),
      ...[['Salad', 160, -80], ['Burrito', -200, -90], ['Sweetgreen (again)', 150, 120], ['Skip it, IC at 1', -210, 130]].map(([n, x, y], i) => h('g', { id: `ky-m${i}`, opacity: 0, transform: `translate(${x} ${y})` },
        h('circle', { r: 14, fill: i === 2 ? C.goldHi : C.cream }), txt(n, { y: -24, size: 26, weight: 600, anchor: 'middle' })))));
  return {
    id: 'kyle', from: seg.from, to: seg.to, markup,
    update(t) {
      cardIn(K, 'kyle', t, seg); cap.update(t);
      const vw = win(t, T.vo('k1'), T.capEnd.k2);
      K.put('ky-cv', RX, 720, vw);
      ['McKinsey', 'Citadel', 'Wharton'].forEach((cue, i) => {
        K.attr(`ky-j${i}`, 'opacity', prog(t, c('k1', cue) - 0.15, c('k1', cue) + 0.15).toFixed(2));
        K.attr(`ky-w${i}`, 'opacity', prog(t, T.vo('k2') + 1.0 + i * 0.4, T.vo('k2') + 1.15 + i * 0.4).toFixed(2));
      });
      const sw = win(t, c('k3', 'milliseconds') - 0.3, T.capEnd.k3);
      K.put('ky-watch', RX - 230, 720, sw);
      K.attr('ky-hand', 'transform', `rotate(${(t * 900 % 360).toFixed(1)})`);
      K.put('ky-glass', RX + 230, 720, win(t, c('k3', 'seven years') - 0.4, T.capEnd.k3));
      const sand = prog(t, c('k3', 'seven years'), T.capEnd.k3);
      K.attr('ky-sand', 'd', `M-60,105 L60,105 L${lerp(5, 40, sand).toFixed(1)},${lerp(40, 70, sand).toFixed(1)} L${lerp(-5, -40, sand).toFixed(1)},${lerp(40, 70, sand).toFixed(1)} Z`);
      const mw = win(t, T.vo('k4') - 0.1, T.capEnd.k4);
      K.put('ky-mx', RX, 720, mw, lerp(0.94, 1, mw), lerp(0.94, 1, mw));
      for (let i = 0; i < 4; i++) K.attr(`ky-m${i}`, 'opacity', prog(t, T.vo('k4') + 1.0 + i * 0.35, T.vo('k4') + 1.2 + i * 0.35).toFixed(2));
    },
  };
}

// ---------------------------------------------------------------- CLOSE + END CARD
function close(K, T, cfg) {
  const seg = T.seg.close, c = (id, cue) => T.vo(id, cue);
  const cap = captions(K, T, ['c1', 'c2'], { x: 960, y: 880, anchor: 'middle', setupMax: 64, punchMax: 52, punchSize: 60 });
  const ks = Object.keys(ROASTEES);
  const markup = h('g', { id: 'sc-close' }, cap.markup,
    ...ks.map((k, i) => g(`cl-m${i}`, monogram(ROASTEES[k].initials, 92),
      txt(ROASTEES[k].name, { y: 150, size: 28, weight: 600, anchor: 'middle' }))),
    g('cl-love', txt('WE LOVE YOU GUYS', { size: 110, weight: 700, family: DISPLAY, fill: C.goldHi, anchor: 'middle', ls: 8 })));
  const ec = cfg.storyboard.endCard;
  const endMarkup = h('g', { id: 'sc-end' }, marquee('x-mq', 0.86),
    g('x-note', txt('All in good fun. Jokes are based on public bios only.', { size: 30, weight: 600, anchor: 'middle' }),
      txt('No partners were harmed in the making of this video.', { y: 46, size: 26, fill: C.mute, anchor: 'middle' })));
  return [{
    id: 'close', from: seg.from, to: seg.to, markup,
    update(t) {
      cap.update(t);
      ks.forEach((_, i) => K.pop(`cl-m${i}`, 360 + i * 300, 330, t, c('c1', 'Five brilliant') + i * 0.18, { d: 0.5, amount: 0.1 }));
      const lk = prog(t, c('c1', 'We love') - 0.1, c('c1', 'We love') + 0.35), ls = lk > 0 ? outBack(lk, 2) : 0;
      K.put('cl-love', 960, 690, lk, ls, ls);
    },
  }, {
    id: 'end', from: T.S.end, to: T.duration + 1, markup: endMarkup,
    update(t) {
      const e = T.S.end, k = outBack(prog(t, e + 0.2, e + 0.9), 1.8);
      K.put('x-mq', 960, 430, prog(t, e + 0.2, e + 0.5), k, k);
      bulbsChase(K, 'x-mq', t, BULBS);
      K.rise('x-note', 960, 850, t, e + 1.2, { dist: 14 });
    },
  }];
}

export function buildScenes(K, T, cfg) {
  return [intro(K, T), jon(K, T), david(K, T), peter(K, T), shawn(K, T), kyle(K, T), ...close(K, T, cfg)];
}
