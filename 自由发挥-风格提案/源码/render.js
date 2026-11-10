// 用法: node render.js 名字 [名字…]   把 名字.html 渲染成 out/名字.png (1080x1920)
const { chromium } = require('playwright');
(async () => {
  const names = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  for (const n of names) {
    const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
    page.on('console', m => console.log(`[${n}]`, m.text()));
    page.on('pageerror', e => console.log(`[${n}] ERROR`, e.message));
    await page.goto(`http://localhost:8765/${n}.html`);
    await page.waitForFunction(() => window.__ready === true, null, { timeout: 180000 });
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(400);
    await page.screenshot({ path: `out/${n}.png` });
    console.log('ok', n);
    await page.close();
  }
  await browser.close();
})();
