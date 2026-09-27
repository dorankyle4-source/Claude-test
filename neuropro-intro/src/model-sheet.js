// Character model sheet: the recurring cast in key expressions/poses.
import { loadConfig, loadFonts } from './engine/config.js';
import { h } from './engine/svg.js';
import { sharedDefs } from './engine/defs.js';
import { createPatient } from './characters/patient.js';
import { createClinician } from './characters/clinician.js';
import { expression } from './characters/rig.js';

const cfg = await loadConfig();
await loadFonts();
const { brand, characters: C } = cfg;
const c = brand.colors;
const X = C.expressions;

const shots = [
  { who: 'jd', label: 'Neutral', pose: { expr: expression(X, 'content'), eyeX: 0.1 } },
  { who: 'jd', label: 'Something’s off', pose: { expr: expression(X, 'confused'), headTilt: -6, eyeX: 0.5, eyeY: -0.6, lean: 2, handL: [-62, -690], handOpenL: 0.5 } },
  { who: 'jd', label: 'Relieved', pose: { expr: expression(X, 'relieved'), squint: 0.35, headTilt: 3, eyeX: 0.7 } },
  { who: 'dr', label: 'Warm', pose: { expr: expression(X, 'warm'), squint: 0.3, headTilt: -3, handR: [30, -410], handAngR: 0 } },
  { who: 'dr', label: 'Explaining', pose: { expr: expression(X, 'explain'), headTurn: -0.5, eyeX: -0.8, eyeY: -0.4, handL: [-282, -642], handOpenL: 1, handAngL: 118, handR: [30, -410], handAngR: 0 } },
];

const svg = document.getElementById('sheet');
let html = sharedDefs(c);
html += h('rect', { width: 1920, height: 1080, fill: c.cream });
html += h('text', { x: 80, y: 96, 'font-family': 'Manrope', 'font-weight': 800, 'font-size': 44, fill: c.navy, 'letter-spacing': 2 }, 'NEUROPRO SERIES — CAST MODEL SHEET');
html += h('text', { x: 80, y: 140, 'font-family': 'Inter', 'font-weight': 500, 'font-size': 24, fill: '#5B6B82' }, `${C.patient.name} · ${C.patient.role}     |     ${C.clinician.name} · ${C.clinician.role}`);
const rigs = shots.map((s, i) => {
  const ch = s.who === 'jd' ? createPatient(C.patient.palette, `m${i}-`) : createClinician(C.clinician.palette, brand, `m${i}-`);
  const x = [210, 555, 900, 1245, 1710][i];
  html += h('ellipse', { cx: x, cy: 1000, rx: 150, ry: 20, fill: c.navy, opacity: 0.06 });
  html += h('g', { id: `slot${i}` }, ch.markup);
  html += h('text', { x, y: 1050, 'text-anchor': 'middle', 'font-family': 'Manrope', 'font-weight': 700, 'font-size': 26, fill: c.ink }, s.label);
  return { ch, s, x };
});
svg.innerHTML = html;
for (const { ch, s, x } of rigs) {
  const apply = ch.mount(svg.querySelector(`#slot${rigs.findIndex((r) => r.ch === ch)}`));
  apply({ x, y: 1000, s: 1.0, ...s.pose });
}
window.NP = { ready: true, renderFrame() {} };
