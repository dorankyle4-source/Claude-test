// 9:16 version for YouTube Shorts, Instagram Reels and TikTok.
//   node scripts/vertical.mjs --comp ep04      (needs the 16:9 render + the .srt from `captions`)
// Layout (1080×1920): branded top band (logo, episode number, title) · the 16:9 episode at full width ·
// large burned-in captions below it (phones often play muted) · education-only line at the bottom.
// The band and caption cards are drawn in Chromium with the brand fonts, then composited with ffmpeg.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import ffmpeg from 'ffmpeg-static';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const argv = process.argv;
const comp = argv.includes('--comp') ? argv[argv.indexOf('--comp') + 1] : 'ep04';
const C = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'compositions.json'), 'utf8'))[comp];
const sb = JSON.parse(fs.readFileSync(path.join(ROOT, C.storyboard), 'utf8'));
const brand = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'brand.json'), 'utf8'));
const c = brand.colors;
const W = 1080, H = 1920, VW = 1080, VH = 608, VY = 660, CAP_Y = 1300, CAP_H = 360;

// ---- captions from the .srt
const srt = fs.readFileSync(path.join(ROOT, C.captions), 'utf8').trim().split(/\r?\n\r?\n/);
const secs = (s) => { const [hh, mm, rest] = s.split(':'); const [ss, ms] = rest.split(','); return +hh * 3600 + +mm * 60 + +ss + +ms / 1000; };
const caps = srt.map((b) => { const l = b.split(/\r?\n/); const [a, z] = l[1].split(' --> '); return { from: secs(a), to: secs(z), text: l.slice(2).join(' ') }; });

// ---- draw the band + caption cards
const font = (f) => `data:font/woff2;base64,${fs.readFileSync(path.join(ROOT, 'node_modules', f)).toString('base64')}`;
const logo = `data:image/png;base64,${fs.readFileSync(path.join(ROOT, brand.logo.full)).toString('base64')}`;
const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
const [epLabel, epTitle] = sb.endCard.episode.split(' · ');
const css = `
@font-face { font-family: Manrope; font-weight: 800; src: url(${font('@fontsource/manrope/files/manrope-latin-800-normal.woff2')}); }
@font-face { font-family: Manrope; font-weight: 700; src: url(${font('@fontsource/manrope/files/manrope-latin-700-normal.woff2')}); }
@font-face { font-family: Inter; font-weight: 400; src: url(${font('@fontsource/inter/files/inter-latin-400-normal.woff2')}); }
html, body { margin: 0; background: transparent; }
.bg { position: relative; width: ${W}px; height: ${H}px; background: ${c.paper}; overflow: hidden; font-family: Manrope; }
.blob { position: absolute; border-radius: 50%; filter: blur(60px); }
.logo { position: absolute; left: 50%; top: 120px; width: 620px; transform: translateX(-50%); }
.ep { position: absolute; top: 360px; width: 100%; text-align: center; font-weight: 800; font-size: 34px; letter-spacing: 6px; color: ${c.tealDeep}; }
.title { position: absolute; top: 420px; left: 60px; right: 60px; text-align: center; font-weight: 800; font-size: 72px; line-height: 1.08; color: ${c.ink}; }
.frame { position: absolute; left: 0; top: ${VY - 10}px; width: ${W}px; height: ${VH + 20}px; background: ${c.navy}; }
.disc { position: absolute; bottom: 70px; width: 100%; text-align: center; font-family: Inter; font-size: 26px; color: #6B7482; }
.cap { width: ${W}px; height: ${CAP_H}px; display: flex; align-items: center; justify-content: center; }
.cap span { max-width: 940px; padding: 26px 40px; border-radius: 36px; background: #FFFFFF; box-shadow: 0 10px 30px rgba(11,37,69,.14);
  font-family: Manrope; font-weight: 800; font-size: 60px; line-height: 1.2; color: ${c.ink}; text-align: center; }
`;
const bgHtml = `<div class="bg">
  <div class="blob" style="left:-160px;top:1420px;width:620px;height:620px;background:#FC9D7B;opacity:.22"></div>
  <div class="blob" style="right:-200px;top:-160px;width:680px;height:680px;background:${c.teal};opacity:.16"></div>
  <img class="logo" src="${logo}">
  <div class="ep">${esc(epLabel.toUpperCase())}</div>
  <div class="title">${esc(epTitle)}</div>
  <div class="frame"></div>
  <div class="disc">${esc(sb.endCard.disclaimer)}</div>
</div>`;

const tmp = path.join(ROOT, 'output', `.vertical-${comp}`);
fs.mkdirSync(tmp, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: W, height: H } });
await page.setContent(`<style>${css}</style>${bgHtml}`);
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: path.join(tmp, 'bg.png') });
for (const [i, cap] of caps.entries()) {
  await page.setContent(`<style>${css}</style><div class="cap"><span>${esc(cap.text)}</span></div>`);
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: path.join(tmp, `cap${i}.png`), omitBackground: true, clip: { x: 0, y: 0, width: W, height: CAP_H } });
}
await browser.close();

// ---- composite
const src = path.join(ROOT, C.output), out = path.join(ROOT, C.vertical), dur = sb.duration;
const inputs = ['-loop', '1', '-t', `${dur}`, '-i', path.join(tmp, 'bg.png'), '-i', src];
caps.forEach((_, i) => inputs.push('-loop', '1', '-t', `${dur}`, '-i', path.join(tmp, `cap${i}.png`)));
let fg = `[1:v]scale=${VW}:${VH}:flags=lanczos[vid];[0:v][vid]overlay=0:${VY}[b0]`;
caps.forEach((cap, i) => {
  const a = cap.from.toFixed(3), z = cap.to.toFixed(3);
  fg += `;[${i + 2}:v]fade=t=in:st=${a}:d=0.12:alpha=1[c${i}];[b${i}][c${i}]overlay=0:${CAP_Y}:enable='between(t,${a},${z})'[b${i + 1}]`;
});
fg += `;[b${caps.length}]format=yuv420p[v]`;
const args = ['-y', '-loglevel', 'error', ...inputs, '-filter_complex', fg, '-map', '[v]', '-map', '1:a', '-r', `${sb.fps}`,
  '-c:v', 'libx264', '-preset', 'medium', '-crf', '20', '-c:a', 'copy', '-movflags', '+faststart', '-t', `${dur}`, out];
const r = spawnSync(ffmpeg, args, { stdio: 'inherit' });
fs.rmSync(tmp, { recursive: true, force: true });
if (r.status !== 0) process.exit(r.status ?? 1);
console.log(`done → ${path.relative(ROOT, out)}  (${W}×${H}, ${caps.length} captions)`);
