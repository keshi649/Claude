const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2000, height: 1960 }, deviceScaleFactor: 1 });
  await p.goto('http://localhost:8765/sheet.html');
  await p.waitForFunction(() => window.__ready === true, null, { timeout: 60000 });
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  await p.screenshot({ path: 'out/sheet.png' });
  await b.close(); console.log('ok sheet');
})();
