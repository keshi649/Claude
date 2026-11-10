// 用法：node render.js [编号…]   不带编号就全部重画
// 把 NN-*.html 渲染成 ../NN-*.jpg（1080×1920）；00 是总览，要在其余几张画完之后再画
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

(async () => {
  const want = process.argv.slice(2);
  const files = fs.readdirSync(__dirname)
    .filter(f => /^\d\d-.*\.html$/.test(f))
    .filter(f => !want.length || want.some(w => f.startsWith(w)));
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error') console.log('  [页面报错]', m.text()); });
  page.on('pageerror', e => console.log('  [页面异常]', e.message));
  for (const f of files) {
    await page.goto('file://' + path.join(__dirname, f));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(600);
    await page.evaluate(() => document.fonts.ready);
    const out = path.join(__dirname, '..', f.replace(/\.html$/, '.jpg'));
    const h = f.startsWith('00') ? 1640 : 1920;   // 总览下面留白，裁掉
    await page.screenshot({ path: out, type: 'jpeg', quality: 93, clip: { x: 0, y: 0, width: 1080, height: h } });
    console.log('画好了', path.basename(out));
  }
  await browser.close();
})();
