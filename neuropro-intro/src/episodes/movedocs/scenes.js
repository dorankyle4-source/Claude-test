// The scenes of the NeuroPro Playbook partner training for MoveDocs. Each returns { id, from, to, markup, update(t) }.
// Content comes from NeuroPro_Attorney_Playbook_2026.pdf (Attorney Sales Kit, 2026 edition), trimmed per Kyle:
// no ADHD/autism testing, no case study, no kids message, no medical & rehab tile.
import { h } from '../../engine/svg.js';
import { lerp, prog, outCubic, inOutCubic } from '../../engine/anim.js';
import { W, H, C, DISPLAY, BODY, txt, g, header, stroke, riseK } from './kit.js';

const rect = (a) => h('rect', a);
const bg = (fill) => rect({ width: W, height: H, fill });
const HX = 160, EYE_Y = 190, HEAD_Y = 284;
const LOGO = '../assets/brand/neuropro-logo.png', LOGO_AR = 188 / 768;
const HEADSHOT = '../assets/brand/doran-headshot.png';
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
const check = (x, y, color) => h('g', { transform: `translate(${x} ${y})` },
  h('circle', { r: 15, fill: color }),
  h('path', { d: 'M-7,0 L-2,5 L7,-5', fill: 'none', stroke: C.white, 'stroke-width': 3.5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }));
const ring = (x, y, color) => h('circle', { cx: x, cy: y, r: 11, fill: 'none', stroke: color, 'stroke-width': 3.5 });

// ------------------------------------------------------------------ 1 · OPEN
function open(K, T) {
  const lw = 560, lh = lw * LOGO_AR;
  const markup = h('g', { id: 'sc-open' },
    bg(C.navy),
    neural('o-netL', 11, 40, 640, 420, 400, 11, C.teal, 0.3),
    neural('o-netR', 29, 1480, 80, 400, 420, 11, C.teal, 0.3),
    g('o-logo', rect({ x: -lw / 2 - 40, y: -lh / 2 - 26, width: lw + 80, height: lh + 52, rx: 26, fill: C.paper }),
      h('image', { href: LOGO, x: -lw / 2, y: -lh / 2, width: lw, height: lh })),
    g('o-eye', txt('ATTORNEY SALES KIT · 2026 EDITION', { size: 28, weight: 800, family: DISPLAY, fill: C.teal, anchor: 'middle', ls: 4 })),
    g('o-title', txt('The NeuroPro Playbook', { size: 132, weight: 800, family: DISPLAY, fill: C.white, anchor: 'middle', ls: -2 })),
    stroke('o-rule', 'M860,712 H1060', C.teal, 8),
    g('o-sub', txt('Partner training for the MoveDocs team', { size: 48, weight: 500, fill: C.light, anchor: 'middle' })),
  );
  return {
    id: 'open', from: 0, to: T.who, markup,
    update(t) {
      K.rise('o-netL', 0, 0, t, 0.2, { d: 1.2, dist: 30 });
      K.rise('o-netR', 0, 0, t, 0.35, { d: 1.2, dist: -30 });
      K.pop('o-logo', 960, 280, t, 0.3, { d: 0.6, amount: 0.08 });
      K.rise('o-eye', 960, 470, t, 0.7, { dist: 20 });
      K.rise('o-title', 960, 620, t, 0.85);
      K.draw('o-rule', prog(t, 1.4, 2.0, outCubic));
      K.rise('o-sub', 960, 800, t, T.partners - 0.6);
    },
  };
}

// ------------------------------------------------------------------ 2 · WHO WE ARE
const SVC = ['Concussion care', 'Neuropsychological testing', 'Mental health care'];
const STATS = [
  { v: 150000, f: (v) => `${fmtInt(v)}+`, label: 'head injuries seen', sub: 'by our team' },
  { v: 46, f: (v) => `${Math.round(v)}`, label: 'states licensed', sub: 'for telehealth, incl. PSYPACT' },
  { v: 10, f: (v) => (v < 9.99 ? `${Math.round(v * 0.7)}` : '7–10'), label: 'days to first visit', sub: 'typical, from referral', unit: '' },
  { v: 1, f: () => 'Trial-ready', label: 'deposition and trial', sub: 'experienced clinicians' },
];
function who(K, T) {
  const markup = h('g', { id: 'sc-who' },
    bg(C.navy),
    neural('w-net', 51, 1440, 60, 440, 300, 9, C.teal, 0.18),
    ...header('w', 'WHO WE ARE', 'A national concussion clinic', true),
    g('w-lede', txt('Built for injured clients and the attorneys who represent them.', { size: 34, fill: C.light })),
    ...SVC.map((s, i) => g(`w-s${i}`, rect({ x: 0, y: -38, width: [420, 560, 450][i], height: 76, rx: 38, fill: C.navy2, stroke: C.teal, 'stroke-width': 3 }),
      txt(s, { x: [420, 560, 450][i] / 2, y: 12, size: 32, weight: 700, family: DISPLAY, fill: C.white, anchor: 'middle' }))),
    ...STATS.map((s, i) => g(`w-t${i}`, rect({ x: 0, y: 0, width: 392, height: 270, rx: 24, fill: C.navy2 }),
      rect({ x: 0, y: 0, width: 392, height: 8, rx: 4, fill: C.teal }),
      txt(s.f(0), { id: `w-tv${i}`, x: 36, y: 128, size: i === 3 ? 64 : 76, weight: 800, family: DISPLAY, fill: i === 3 ? C.teal : C.white, ls: -2 }),
      txt(s.label, { x: 38, y: 186, size: 30, weight: 700, family: DISPLAY, fill: C.white }),
      txt(s.sub, { x: 38, y: 226, size: 24, fill: C.light }))),
  );
  const sx = [160, 610, 1200];
  return {
    id: 'who', from: T.who, to: T.founding, markup,
    update(t) {
      K.rise('w-net', 0, 0, t, T.who + 0.2, { d: 1.2 });
      headerIn(K, 'w', t, T.who + 0.15);
      K.rise('w-lede', HX, 352, t, T.who + 0.5, { dist: 14 });
      SVC.forEach((_, i) => K.pop(`w-s${i}`, sx[i], 470, t, T.svc[i] - 0.1, { amount: 0.1 }));
      STATS.forEach((s, i) => {
        K.rise(`w-t${i}`, 160 + i * 410, 620, t, T.stat[i] - 0.35, { dist: 40 });
        if (i < 3) K.text(`w-tv${i}`, s.f(s.v * prog(t, T.stat[i] - 0.2, T.stat[i] + 1.0, outCubic)));
      });
    },
  };
}

// ------------------------------------------------------------------ 3 · FOUNDING
const BIO = ['20-year U.S. Navy career', 'Naval Academy concussion specialist', 'Johns Hopkins faculty', "Helped pass Maryland's concussion law"];
function founding(K, T) {
  const dots = Array.from({ length: 30 }, (_, i) => h('circle', { id: `f-d${i}`, cx: 0, cy: 0, r: 17, fill: i === 0 ? C.coral : C.teal, opacity: 0 }));
  const markup = h('g', { id: 'sc-founding' },
    bg(C.paper),
    ...header('f', 'OUR FOUNDING', 'Veteran-founded. Built by a clinician.'),
    g('f-photo', h('circle', { r: 150, fill: C.tealSoft }),
      h('image', { href: HEADSHOT, x: -136, y: -136, width: 272, height: 272 }),
      h('circle', { r: 140, fill: 'none', stroke: C.teal, 'stroke-width': 8 })),
    g('f-name', txt('Dr. Anthony Doran, Psy.D.', { size: 36, weight: 800, family: DISPLAY, anchor: 'middle' }),
      txt('Clinical neuropsychologist', { y: 44, size: 26, fill: C.ink2, anchor: 'middle' }),
      txt('Founder & CEO', { y: 80, size: 26, fill: C.ink2, anchor: 'middle' })),
    g('f-years', rect({ x: -130, y: -36, width: 260, height: 72, rx: 36, fill: C.navy }),
      txt('15+ years', { y: 12, size: 34, weight: 800, family: DISPLAY, fill: C.white, anchor: 'middle' })),
    h('line', { id: 'f-spine', x1: 620, y1: 420, x2: 620, y2: 420, stroke: C.track, 'stroke-width': 4 }),
    ...BIO.map((b, i) => g(`f-b${i}`, h('circle', { r: 13, fill: C.teal }), txt(b, { x: 34, y: 11, size: 29, weight: 600, family: DISPLAY }))),
    g('f-card', rect({ x: 0, y: 0, width: 520, height: 600, rx: 28, fill: C.navy }),
      txt('FROM ONE DOCTOR…', { id: 'f-cap', x: 44, y: 70, size: 24, weight: 800, family: DISPLAY, fill: C.teal, ls: 3 }),
      txt('1', { id: 'f-num', x: 44, y: 520, size: 120, weight: 800, family: DISPLAY, fill: C.white, ls: -3 }),
      txt('clinician', { id: 'f-unit', x: 44, y: 566, size: 28, fill: C.light })),
    ...dots,
  );
  const CX = 1240, CY = 380; // card spans 1240–1760
  const dotXY = (i) => [CX + 70 + (i % 6) * 76, CY + 150 + Math.floor(i / 6) * 50];
  return {
    id: 'founding', from: T.founding, to: T.role, markup,
    update(t) {
      headerIn(K, 'f', t, T.founding + 0.15);
      K.pop('f-photo', 360, 560, t, T.founding + 0.4, { amount: 0.08 });
      K.rise('f-name', 360, 770, t, T.founding + 0.7, { dist: 16 });
      K.pop('f-years', 360, 920, t, T.years - 0.1);
      const sp = prog(t, T.bio[0] - 0.3, T.bio[3] + 0.3, inOutCubic);
      K.attr('f-spine', 'y2', lerp(420, 420 + 3 * 130, sp).toFixed(1));
      BIO.forEach((_, i) => K.rise(`f-b${i}`, 620, 420 + i * 130, t, T.bio[i] - 0.2, { dist: 0, oy: 0 }));
      K.rise('f-card', CX, CY, t, T.oneDoc - 0.6, { dist: 40 });
      const grow = prog(t, T.thirty - 0.1, T.thirty + 1.0, outCubic);
      const n = Math.max(1, Math.round(1 + 29 * grow));
      for (let i = 0; i < 30; i++) {
        const [x, y] = dotXY(i);
        const k = i === 0 ? riseK(t, T.oneDoc - 0.1, 0.4) : prog(t, T.thirty - 0.1 + i * 0.035, T.thirty + 0.15 + i * 0.035, outCubic);
        K.attr(`f-d${i}`, 'cx', x); K.attr(`f-d${i}`, 'cy', (y + (1 - k) * 14).toFixed(1));
        K.attr(`f-d${i}`, 'opacity', k.toFixed(3));
      }
      K.text('f-num', grow > 0.98 ? '~30' : String(n));
      K.text('f-unit', grow > 0 ? 'clinicians nationwide' : 'clinician');
      K.text('f-cap', grow > 0 ? 'TO A NATIONAL TEAM' : 'FROM ONE DOCTOR…');
    },
  };
}

// ------------------------------------------------------------------ 4 · YOUR ROLE
const TRIG = [
  { t: 'Concussion & head injury', items: ['Hit their head or was jolted', 'Headaches, dizziness, balance', 'Memory or "foggy" thinking', 'Normal CT or MRI, still not right'] },
  { t: 'Mental health', items: ['Anxiety or fear of driving', 'Depression or low mood', 'PTSD, nightmares, flashbacks', 'Poor sleep or mood changes'] },
  { t: 'Testing & evaluations', items: ['Cognitive or psych concerns', 'Trouble returning to work', 'Adult or pediatric clients', 'Independent Medical Evaluation'] },
];
function role(K, T) {
  const CW = 510;
  const markup = h('g', { id: 'sc-role' },
    bg(C.cream),
    ...header('r', 'YOUR ROLE', 'Recognize it. Don’t diagnose it.'),
    ...TRIG.map((c, i) => g(`r-c${i}`, rect({ x: 0, y: 0, width: CW, height: 410, rx: 24, fill: C.card, stroke: C.line, 'stroke-width': 2 }),
      rect({ x: 0, y: 0, width: CW, height: 8, rx: 4, fill: C.teal }),
      txt(c.t, { x: 36, y: 74, size: 34, weight: 800, family: DISPLAY }),
      ...c.items.map((it, j) => [ring(50, 140 + j * 70, C.tealDeep), txt(it, { x: 78, y: 150 + j * 70, size: 27, fill: C.ink2 })]))),
    g('r-pill', rect({ x: 0, y: -46, width: 1600, height: 92, rx: 46, fill: C.navy }),
      txt('Not sure which service fits? Send the referral. Our clinicians decide.', { x: 800, y: 12, size: 34, weight: 700, family: DISPLAY, fill: C.white, anchor: 'middle' })),
  );
  return {
    id: 'role', from: T.role, to: T.network, markup,
    update(t) {
      headerIn(K, 'r', t, T.role + 0.15);
      TRIG.forEach((_, i) => K.rise(`r-c${i}`, 160 + i * (CW + 35), 370, t, T.trig[i] - 0.3, { dist: 50 }));
      K.pop('r-pill', 160, 900, t, T.sendRef - 0.1, { amount: 0.05 });
    },
  };
}

// ------------------------------------------------------------------ 5 · ONE NETWORK
const PATH = [
  { t: 'Concussion evaluation', s: ['Mild TBI, post-concussion', 'symptoms'] },
  { t: 'Neuropsych testing', s: ['Objective cognitive and', 'psychological testing'] },
  { t: 'Mental health treatment', s: ['Therapy and counseling,', 'incl. EMDR for trauma'] },
  { t: 'Medico-legal support', s: ['Reports, IMEs, deposition', 'and trial'] },
];
const TILES = [
  { n: '15+', t: 'Neuropsychology & psychology', s: 'Doctoral clinicians, many hospital and VA trained' },
  { n: '10', t: 'Therapy & counseling', s: 'Anxiety, depression, trauma (EMDR) and more' },
  { n: '1 team', t: 'Care coordination', s: 'Intake, scheduling and follow-up, start to finish' },
];
function network(K, T) {
  const PX = (i) => 300 + i * 440, PY = 470;
  const markup = h('g', { id: 'sc-network' },
    bg(C.paper),
    ...header('n', 'ONE REFERRAL · ONE NETWORK', 'One coordinated clinical network'),
    stroke('n-line', `M${PX(0)},${PY} H${PX(3)}`, C.teal, 6),
    ...PATH.map((p, i) => g(`n-p${i}`, h('circle', { r: 52, fill: i === 3 ? C.navy : C.white, stroke: i === 3 ? C.navy : C.teal, 'stroke-width': 6 }),
      txt(String(i + 1), { y: 16, size: 46, weight: 800, family: DISPLAY, fill: i === 3 ? C.white : C.tealDeep, anchor: 'middle' }),
      txt(p.t, { y: 112, size: 32, weight: 800, family: DISPLAY, anchor: 'middle' }),
      ...p.s.map((s, j) => txt(s, { y: 152 + j * 34, size: 25, fill: C.ink2, anchor: 'middle' })))),
    ...TILES.map((c, i) => g(`n-t${i}`, rect({ x: 0, y: 0, width: 520, height: 200, rx: 22, fill: C.tealSoft }),
      rect({ x: 0, y: 0, width: 520, height: 8, rx: 4, fill: C.tealDeep }),
      txt(c.n, { x: 34, y: 86, size: 60, weight: 800, family: DISPLAY, ls: -1 }),
      txt(c.t, { x: 34, y: 134, size: 28, weight: 700, family: DISPLAY }),
      txt(c.s, { x: 34, y: 172, size: 21, fill: C.ink2 }))),
  );
  return {
    id: 'network', from: T.network, to: T.scan, markup,
    update(t) {
      headerIn(K, 'n', t, T.network + 0.15);
      K.draw('n-line', prog(t, T.path[0] - 0.2, T.path[3], inOutCubic));
      PATH.forEach((_, i) => K.pop(`n-p${i}`, PX(i), PY, t, T.path[i] - 0.15, { amount: 0.12 }));
      TILES.forEach((_, i) => K.rise(`n-t${i}`, 160 + i * 540, 760, t, T.oneTeam - 0.4 + i * 0.2, { dist: 40 }));
    },
  };
}

// ------------------------------------------------------------------ 6 · NORMAL SCAN
function scan(K, T) {
  const card = (id, dark, eyebrow, title, items) => g(id,
    rect({ x: 0, y: 0, width: 780, height: 380, rx: 26, fill: dark ? C.tealDeep : C.card, stroke: dark ? 'none' : C.line, 'stroke-width': 2 }),
    txt(eyebrow, { x: 44, y: 70, size: 24, weight: 800, family: DISPLAY, fill: dark ? C.tealSoft : C.muted, ls: 3 }),
    txt(title, { x: 44, y: 132, size: 46, weight: 800, family: DISPLAY, fill: dark ? C.white : C.navy, ls: -1 }),
    ...items.map((it, j) => [check(60, 200 + j * 50, dark ? C.teal : C.grey), txt(it, { x: 92, y: 210 + j * 50, size: 29, fill: dark ? C.white : C.ink2 })]));
  const markup = h('g', { id: 'sc-scan' },
    bg(C.cream),
    ...header('s', 'THE CLEAN-SCAN OBJECTION', 'Normal scan. Not a normal brain.'),
    g('s-most', rect({ x: 0, y: 0, width: 1600, height: 150, rx: 26, fill: C.navy }),
      txt('Most', { x: 50, y: 108, size: 110, weight: 800, family: DISPLAY, fill: C.teal, ls: -3 }),
      txt('concussions and mild brain injuries don’t show up on CT or MRI.', { x: 360, y: 70, size: 34, weight: 700, family: DISPLAY, fill: C.white }),
      txt('A clean scan rules out visible damage. It doesn’t rule out a brain injury.', { x: 360, y: 114, size: 27, fill: C.light })),
    card('s-neuro', false, 'LOCAL NEUROLOGIST', 'Looks at structure', ['Neurological exam', 'CT, MRI and EEG', 'Medication for headaches, seizures']),
    card('s-np', true, 'NEUROPRO NEUROPSYCHOLOGIST', 'Measures how it works', ['Hours of memory and focus tests', 'Mood, personality and behavior', 'Proof of full effort (no faking)']),
  );
  return {
    id: 'scan', from: T.scan, to: T.dti, markup,
    update(t) {
      headerIn(K, 's', t, T.scan + 0.15);
      K.rise('s-most', 160, 350, t, T.most - 0.3, { dist: 30 });
      K.rise('s-neuro', 160, 560, t, T.neuro - 0.3, { dist: 40 });
      K.rise('s-np', 980, 560, t, T.measures - 0.3, { dist: 40 });
    },
  };
}

// ------------------------------------------------------------------ 7 · DTI
const SCAN_FIRST = ['Order a DTI', 'It’s discoverable', 'Scan comes back normal', 'Defense: “No damage.”'];
const NP_FIRST = ['NeuroPro evaluation', 'Deficits measured and validated', 'Written report and treatment plan', 'Damages documented. Imaging only if it helps.'];
function dti(K, T) {
  const col = (id, label, items, tint, accent) => [
    g(`${id}-bg`, rect({ x: 0, y: 0, width: 780, height: 620, rx: 26, fill: tint }),
      txt(label, { x: 40, y: 64, size: 26, weight: 800, family: DISPLAY, fill: accent, ls: 3 })),
    ...items.map((it, j) => g(`${id}-${j}`,
      rect({ x: 0, y: 0, width: 700, height: 92, rx: 16, fill: j === 3 ? accent : C.card, stroke: j === 3 ? 'none' : C.line, 'stroke-width': 2 }),
      txt(it, { x: 30, y: 58, size: j === 3 ? 27 : 30, weight: j === 3 ? 800 : 600, family: DISPLAY, fill: j === 3 ? C.white : C.navy }),
      j < 3 ? h('path', { d: 'M350,104 v18 m-9,-9 l9,9 l9,-9', fill: 'none', stroke: C.muted, 'stroke-width': 3, 'stroke-linecap': 'round' }) : '')),
  ];
  const markup = h('g', { id: 'sc-dti' },
    bg(C.paper),
    ...header('d', 'DTI SCANS', 'A normal DTI can sink a case.'),
    ...col('dl', 'SCAN FIRST', SCAN_FIRST, C.coralSoft, C.coral),
    ...col('dr', 'NEUROPRO FIRST', NP_FIRST, C.tealSoft, C.tealDeep),
  );
  const L = [T.dti + 0.6, T.disc - 0.2, T.normal - 0.1, T.normal + 0.7];
  const R = [T.lead - 0.1, T.lead + 0.5, T.lead + 1.0, T.helps - 0.2];
  return {
    id: 'dti', from: T.dti, to: T.faq, markup,
    update(t) {
      headerIn(K, 'd', t, T.dti + 0.15);
      K.rise('dl-bg', 160, 350, t, T.dti + 0.4, { dist: 30 });
      K.rise('dr-bg', 980, 350, t, T.lead - 0.5, { dist: 30 });
      for (let j = 0; j < 4; j++) {
        K.rise(`dl-${j}`, 200, 440 + j * 124, t, L[j], { dist: 20 });
        K.rise(`dr-${j}`, 1020, 440 + j * 124, t, R[j], { dist: 20 });
      }
    },
  };
}

// ------------------------------------------------------------------ 8 · FAQ
const FAQ = [
  { q: '“The accident was a while ago.”', a: 'Not too late. We evaluate months or years after injury.' },
  { q: '“Defense says my client is faking.”', a: 'Built-in effort checks show the client gave full effort.' },
  { q: '“Who pays? How fast?”', a: 'PI cases on a lien through MoveDocs. First visit in 7–10 days.' },
];
function faq(K, T) {
  const markup = h('g', { id: 'sc-faq' },
    bg(C.navy),
    neural('q-net', 77, 1460, 40, 420, 260, 8, C.teal, 0.16),
    ...header('q', 'WHAT YOU’LL HEAR', 'Quick answers to the usual questions', true),
    ...FAQ.map((f, i) => [
      g(`q-q${i}`, rect({ x: 0, y: 0, width: 640, height: 150, rx: 22, fill: C.navy2 }),
        txt('THE ATTORNEY SAYS', { x: 36, y: 50, size: 20, weight: 800, family: DISPLAY, fill: C.light, ls: 3 }),
        txt(f.q, { x: 36, y: 106, size: 32, weight: 700, family: DISPLAY, fill: C.white })),
      g(`q-a${i}`, rect({ x: 0, y: 0, width: 920, height: 150, rx: 22, fill: C.teal }),
        txt('YOU SAY', { x: 36, y: 50, size: 20, weight: 800, family: DISPLAY, fill: C.navy, ls: 3 }),
        txt(f.a, { x: 36, y: 106, size: 28, weight: 700, family: DISPLAY, fill: C.navy })),
      g(`q-x${i}`, h('path', { d: 'M0,0 h22 m-10,-10 l10,10 l-10,10', fill: 'none', stroke: C.teal, 'stroke-width': 5, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' })),
    ]),
  );
  return {
    id: 'faq', from: T.faq, to: T.refer, markup,
    update(t) {
      K.rise('q-net', 0, 0, t, T.faq + 0.2, { d: 1.2 });
      headerIn(K, 'q', t, T.faq + 0.15);
      FAQ.forEach((_, i) => {
        const y = 370 + i * 190;
        K.rise(`q-q${i}`, 160, y, t, T.q[i] - 0.35, { dist: 30 });
        K.rise(`q-x${i}`, 812, y + 75, t, T.a[i] - 0.3, { dist: 0 });
        const k = riseK(t, T.a[i] - 0.15, 0.5);
        K.put(`q-a${i}`, 840 + (1 - k) * 60, y, k);
      });
    },
  };
}

// ------------------------------------------------------------------ 9 · REFER
const STEPS = [
  { t: 'Spot the need', s: 'A head injury, a testing need, or anything affecting mental health.' },
  { t: 'Send the referral', s: 'Through MoveDocs, or straight to NeuroPro with basic case details.' },
  { t: 'We take it from there', s: 'Scheduling, the right evaluation, and updates to the attorney.' },
];
function wrap(s, n) { const out = []; let line = ''; for (const w of s.split(' ')) { if ((line + ' ' + w).trim().length > n) { out.push(line); line = w; } else line = (line + ' ' + w).trim(); } out.push(line); return out; }
function refer(K, T) {
  const markup = h('g', { id: 'sc-refer' },
    bg(C.navy),
    neural('f2-net', 91, 1460, 40, 420, 260, 8, C.teal, 0.16),
    ...header('e', 'REFER A CLIENT', 'Sending a client is simple', true),
    ...STEPS.map((s, i) => g(`e-s${i}`, rect({ x: 0, y: 0, width: 510, height: 250, rx: 22, fill: C.navy2 }),
      rect({ x: 0, y: 0, width: 510, height: 8, rx: 4, fill: C.teal }),
      h('circle', { cx: 60, cy: 76, r: 30, fill: C.teal }),
      txt(String(i + 1), { x: 60, y: 89, size: 34, weight: 800, family: DISPLAY, fill: C.navy, anchor: 'middle' }),
      txt(s.t, { x: 110, y: 88, size: 34, weight: 800, family: DISPLAY, fill: C.white }),
      ...wrap(s.s, 36).map((l, j) => txt(l, { x: 36, y: 160 + j * 36, size: 26, fill: C.light })))),
    g('e-think', txt('When a client has a head injury or anything', { size: 34, fill: C.light }),
      txt('affecting their mental health,', { y: 46, size: 34, fill: C.light }),
      txt('think NeuroPro.', { y: 136, size: 72, weight: 800, family: DISPLAY, fill: C.teal, ls: -1 })),
    g('e-card', rect({ x: 0, y: 0, width: 640, height: 196, rx: 22, fill: C.paper }),
      txt('neuroprocares.com/contact-us', { x: 36, y: 56, size: 28, weight: 800, family: DISPLAY, fill: C.tealDeep }),
      txt('Kyle Doran · Head of Business Development', { x: 36, y: 102, size: 25, weight: 600, fill: C.navy }),
      txt('443-962-7716', { x: 36, y: 142, size: 25, fill: C.ink2 }),
      txt('kyle@neuroprocares.com', { x: 36, y: 178, size: 25, fill: C.ink2 })),
  );
  return {
    id: 'refer', from: T.refer, to: T.end, markup,
    update(t) {
      K.rise('f2-net', 0, 0, t, T.refer + 0.2, { d: 1.2 });
      headerIn(K, 'e', t, T.refer + 0.15);
      STEPS.forEach((_, i) => K.rise(`e-s${i}`, 160 + i * 545, 360, t, T.steps[i] - 0.3, { dist: 40 }));
      K.rise('e-think', 160, 720, t, T.think - 2.6, { dist: 20 });
      K.rise('e-card', 1120, 700, t, T.steps[2] + 0.8, { dist: 30 });
    },
  };
}

// ------------------------------------------------------------------ END CARD
function end(K, T, cfg) {
  const ec = cfg.storyboard.endCard;
  const lw = 900, lh = lw * LOGO_AR;
  const markup = h('g', { id: 'sc-end' },
    bg(C.paper),
    neural('x-netL', 11, 40, 640, 420, 400, 11, C.teal, 0.35),
    neural('x-netR', 29, 1480, 80, 400, 420, 11, C.teal, 0.35),
    h('clipPath', { id: 'x-clip' }, rect({ id: 'x-clipR', x: -lw / 2, y: -lh, width: 0, height: lh * 2 })),
    g('x-logo', h('image', { href: LOGO, x: -lw / 2, y: -lh / 2, width: lw, height: lh, 'clip-path': 'url(#x-clip)' })),
    stroke('x-rule', 'M860,620 H1060', C.teal, 8),
    g('x-tag', txt(ec.tagline, { size: 54, weight: 700, family: DISPLAY, fill: C.navy, anchor: 'middle', ls: -0.5 })),
  );
  return {
    id: 'end', from: T.end, to: T.duration + 1, markup,
    update(t) {
      const e = T.end;
      K.rise('x-netL', 0, 0, t, e + 0.2, { d: 1.2, dist: 30 });
      K.rise('x-netR', 0, 0, t, e + 0.3, { d: 1.2, dist: -30 });
      K.put('x-logo', 960, 450, prog(t, e + 0.1, e + 0.3));
      K.attr('x-clipR', 'width', (lw * prog(t, e + 0.2, e + 1.2, inOutCubic)).toFixed(1));
      K.draw('x-rule', prog(t, e + 1.0, e + 1.5, outCubic));
      K.rise('x-tag', 960, 730, t, Math.min(e + 1.3, T.thanks - 0.2));
    },
  };
}

export function buildScenes(K, T, cfg) {
  return [open(K, T), who(K, T), founding(K, T), role(K, T), network(K, T), scan(K, T), dti(K, T), faq(K, T), refer(K, T), end(K, T, cfg)];
}
