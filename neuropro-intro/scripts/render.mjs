// Frame-accurate render: headless Chromium draws each frame at exact time t, piped to ffmpeg (H.264 + AAC).
//
//   node scripts/render.mjs [--comp ep01]   → the composition's output file (config/compositions.json)
//   node scripts/render.mjs --out x.mp4 --from 2 --to 5   (render a section)

import { chromium } from 'playwright';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import ffmpeg from 'ffmpeg-static';
import { serve } from './serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const arg = (k, d) => { const i = process.argv.indexOf(`--${k}`); return i > 0 ? process.argv[i + 1] : d; };
const comp = arg('comp', 'intro');
const C = JSON.parse(fs.readFileSync(path.join(ROOT, 'config', 'compositions.json'), 'utf8'))[comp];
const sb = JSON.parse(fs.readFileSync(path.join(ROOT, C.storyboard), 'utf8'));
const fps = Number(arg('fps', sb.fps));
const from = Number(arg('from', 0)), to = Number(arg('to', sb.duration));
const out = path.resolve(ROOT, arg('out', C.output));
const audio = path.join(ROOT, C.audioDir, 'mix.wav');
fs.mkdirSync(path.dirname(out), { recursive: true });

const server = await serve();
const browser = await chromium.launch();
const WORKERS = Number(arg('workers', 4));
const url = `http://127.0.0.1:${server.address().port}/src/index.html?render&comp=${comp}`;
const pages = await Promise.all(Array.from({ length: WORKERS }, async () => {
  const ctx = await browser.newContext({ viewport: { width: sb.width, height: sb.height }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  page.on('pageerror', (e) => { console.error('[pageerror]', e.message); process.exit(1); });
  await page.goto(url);
  await page.waitForFunction(() => window.NP?.ready === true, null, { timeout: 30000 });
  return page;
}));

const hasAudio = fs.existsSync(audio);
const ff = spawn(ffmpeg, [
  '-y', '-loglevel', 'error',
  '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
  ...(hasAudio ? ['-ss', String(from), '-t', String(to - from), '-i', audio] : []),
  '-c:v', 'libx264', '-preset', 'slow', '-crf', String(arg('crf', 20)), '-pix_fmt', 'yuv420p', '-profile:v', 'high',
  '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709',
  ...(hasAudio ? ['-c:a', 'aac', '-b:a', '256k', '-shortest'] : []),
  '-movflags', '+faststart', out,
], { stdio: ['pipe', 'inherit', 'inherit'] });

// Workers render frames in parallel; the writer feeds ffmpeg strictly in order.
const frames = Math.round((to - from) * fps);
const done = new Map();
let next = 0, wake = null;
const t0 = Date.now();
await Promise.all([
  ...pages.map(async (page, w) => {
    for (let i = w; i < frames; i += WORKERS) {
      while (i - next > WORKERS * 3) await new Promise((r) => setTimeout(r, 5)); // bounded look-ahead
      await page.evaluate((x) => window.NP.renderFrame(x), from + i / fps);
      done.set(i, await page.screenshot({ type: 'jpeg', quality: 96 }));
      wake?.();
    }
  }),
  (async () => {
    while (next < frames) {
      if (!done.has(next)) { await new Promise((r) => (wake = r)); continue; }
      const buf = done.get(next); done.delete(next);
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if (next % 30 === 0) process.stdout.write(`\r  frame ${next + 1}/${frames}  (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
      next++;
    }
  })(),
]);
ff.stdin.end();
await new Promise((r) => ff.on('close', r));
await browser.close();
server.close();
console.log(`\n  → ${path.relative(ROOT, out)}  (${frames} frames @ ${fps}fps${hasAudio ? ', with audio' : ', no audio — run npm run audio'})`);
