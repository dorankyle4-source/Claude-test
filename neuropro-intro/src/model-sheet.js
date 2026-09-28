// Mascot model sheet: the NeuroPro Brain in its key expressions/poses.
import { loadConfig, loadFonts } from './engine/config.js';
import { h } from './engine/svg.js';
import { sharedDefs } from './engine/defs.js';
import { createMascot } from './characters/mascot.js';

const cfg = await loadConfig();
await loadFonts();
const { brand, characters: C } = cfg;
const c = brand.colors;
const M = C.mascot;

const shots = [
  { label: 'Happy', pose: { smile: 0.8, open: 0.55, eyeX: 0.2 } },
  { label: 'Something’s off', pose: { dizzy: 0.8, smile: -0.4, open: 0.15, mouthW: 0.7, browWorry: 0.8, browLift: 0.4, browAsym: 0.5, tilt: -6, eyeY: 0.3, handL: [-228, -430], gloveL: { open: 1 }, bendL: 70, handAngL: -145 } },
  { label: 'Organised', pose: { order: 1, netLevel: 0.6, glow: 0.6, smile: 0.7, open: 0.4, squint: 0.3 } },
  { label: 'Thumbs up', pose: { smile: 0.95, open: 0.7, excite: 1, handR: [305, -470], gloveR: { thumb: 1 }, handAngR: 0, bendR: 50, handL: [-200, -190], browLift: 0.3 } },
];

const svg = document.getElementById('sheet');
let html = sharedDefs(c);
html += h('rect', { width: 1920, height: 1080, fill: '#F7F4EE' });
html += h('text', { x: 80, y: 96, 'font-family': 'Manrope', 'font-weight': 800, 'font-size': 44, fill: '#2F2F2F', 'letter-spacing': 2 }, 'NEUROPRO SERIES — MASCOT MODEL SHEET');
html += h('text', { x: 80, y: 140, 'font-family': 'Inter', 'font-weight': 500, 'font-size': 24, fill: '#5B6B82' }, `${M.name} · ${M.role}`);
const xs = [300, 760, 1200, 1590];
shots.forEach((s, i) => {
  html += h('g', { id: `slot${i}` }, createMascot(M.palette, `m${i}-`).markup);
  html += h('text', { x: xs[i], y: 1050, 'text-anchor': 'middle', 'font-family': 'Manrope', 'font-weight': 700, 'font-size': 26, fill: '#2F2F2F' }, s.label);
});
svg.innerHTML = html;
shots.forEach((s, i) => {
  const apply = createMascot(M.palette, `m${i}-`).mount(svg.querySelector(`#slot${i}`));
  apply({ t: 1.3, x: xs[i], y: 985, s: 0.8, ...s.pose });
});
window.NP = { ready: true, renderFrame() {} };
