// Writes an .srt caption file from the voiceover lines + measured durations.
//   node scripts/captions.mjs --comp ep01
// Lines are split into ≤ 42-character chunks (breaking at punctuation where possible); each chunk's time is
// proportional to its length within the measured line duration.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv;
const comp = argv.includes('--comp') ? argv[argv.indexOf('--comp') + 1] : 'ep01';
const C = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'compositions.json'), 'utf8'))[comp];
const sb = JSON.parse(fs.readFileSync(path.join(ROOT, C.storyboard), 'utf8'));
const timing = JSON.parse(fs.readFileSync(path.join(ROOT, C.voiceDir, 'timing.json'), 'utf8'));
const MAX = 42;

function chunks(text) {
  const words = text.replace(/—/g, '— ').split(' ').filter(Boolean), out = [];
  let cur = '';
  for (const w of words) {
    const next = cur ? `${cur} ${w}` : w;
    if (next.length > MAX && cur) { out.push(cur); cur = w; continue; }
    cur = next;
    if (/[,.?!:—]$/.test(w) && cur.length > MAX * 0.55) { out.push(cur); cur = ''; }
  }
  if (cur) out.push(cur);
  return out;
}
const stamp = (s) => {
  const ms = Math.round(s * 1000), h = Math.floor(ms / 3600000), m = Math.floor(ms / 60000) % 60, sec = Math.floor(ms / 1000) % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(sec).padStart(2, '0')},${String(ms % 1000).padStart(3, '0')}`;
};

let n = 0, srt = '';
for (const line of sb.voiceover) {
  const dur = timing[line.id]?.duration ?? 3, parts = chunks(line.text);
  const total = parts.reduce((a, p) => a + p.length, 0);
  let t = line.at;
  for (const p of parts) {
    const d = (dur * p.length) / total;
    srt += `${++n}\n${stamp(t)} --> ${stamp(t + d - 0.02)}\n${p}\n\n`;
    t += d;
  }
}
const out = path.join(ROOT, C.captions);
fs.writeFileSync(out, srt);
console.log(`  → ${path.relative(ROOT, out)} (${n} captions)`);
