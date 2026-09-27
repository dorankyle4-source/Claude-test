// Review stills: one key frame per scene + the cast model sheet → output/stills/
import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { serve } from './serve.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'output', 'stills');
fs.mkdirSync(OUT, { recursive: true });
const KEYS = [[1.4, '01-establish'], [3.9, '02-symptoms'], [7.0, '03-neuropro'], [9.95, '04-title']];

const server = await serve();
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
await page.goto(`${base}/src/index.html?render`);
await page.waitForFunction(() => window.NP?.ready === true);
for (const [t, name] of KEYS) {
  await page.evaluate((x) => window.NP.renderFrame(x), t);
  await page.screenshot({ path: path.join(OUT, `${name}.png`) });
}
await page.goto(`${base}/src/model-sheet.html`);
await page.waitForFunction(() => window.NP?.ready === true);
await page.screenshot({ path: path.join(OUT, 'cast-model-sheet.png') });
await browser.close(); server.close();
console.log(`  → output/stills/ (${KEYS.length + 1} images)`);
