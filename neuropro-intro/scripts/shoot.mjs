// Dev helper: screenshot a page (optionally at time t) → PNG.  node scripts/shoot.mjs <url-path> <out.png> [t]
import { chromium } from 'playwright';
import { serve } from './serve.mjs';
const [, , urlPath, out, t] = process.argv;
const server = await serve();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
page.on('console', (m) => console.log('[page]', m.text()));
page.on('pageerror', (e) => console.log('[pageerror]', e.message));
await page.goto(`http://127.0.0.1:${server.address().port}${urlPath}`);
await page.waitForFunction(() => window.NP?.ready === true, null, { timeout: 15000 });
for (const tt of (t ?? '0').split(',')) {
  await page.evaluate((x) => window.NP.renderFrame(x), Number(tt));
  const o = (t ?? '').includes(',') ? out.replace('.png', `-${tt}.png`) : out;
  await page.screenshot({ path: o });
}
await browser.close(); server.close();
