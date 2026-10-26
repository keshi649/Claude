// 用 Playwright 打开成品网页，模拟手机（横屏 / 竖屏）或电脑，按流程点进对局，截几张图，打印页面报错。
// 用法：node test/shots.js 输出目录 [phone|portrait|desktop] [对局里多跑几秒=20] [--auto]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const out = process.argv[2] || 'shots';
  const mode = process.argv[3] || 'phone';
  const secs = +(process.argv[4] || 20);
  const auto = process.argv.includes('--auto');
  fs.mkdirSync(out, { recursive: true });
  const html = fs.readFileSync(path.join(__dirname, '..', '小怪峡谷.html'), 'utf8');
  const browser = await chromium.launch();
  const vp = mode === 'portrait' ? { width: 390, height: 780 } : mode === 'desktop' ? { width: 1280, height: 720 } : { width: 844, height: 390 };
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: mode === 'desktop' ? 1 : 3, hasTouch: mode !== 'desktop', isMobile: mode !== 'desktop' });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 4).join('\n')));
  page.on('console', m => { if ((m.type() === 'error' || m.type() === 'warning') && !m.text().includes('willReadFrequently')) errs.push(m.type() + ' ' + m.text()); });
  const t0 = Date.now();
  await page.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>');
  await page.waitForSelector('#title:not([hidden])', { timeout: 30000 });
  console.log('title shown after', Date.now() - t0, 'ms');
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(out, '1-title.png') });
  const tap = async sel => { const el = await page.$(sel); const b = await el.boundingBox(); if (mode === 'desktop') await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); else await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); };
  await tap('#bStart');
  await page.waitForSelector('#select:not([hidden])');
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, '2-select.png') });
  await tap('.card[data-h="mage"]');
  await page.waitForTimeout(200);
  await page.screenshot({ path: path.join(out, '2b-select-mage.png') });
  await tap('.card[data-h="warrior"]');
  await tap('#bGo');
  await page.waitForSelector('#vs:not([hidden])');
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(out, '3-vs.png') });
  await page.waitForFunction(() => typeof G !== 'undefined' && G.scr === 'game', null, { timeout: 15000 });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: path.join(out, '4-game-start.png') });
  if (auto) await page.evaluate(() => { G.W.auto = true; });
  // 快进：直接在页面里多跑几步模拟（画面照常）
  await page.evaluate(s => { for (let i = 0; i < s * 60; i++) { step(G.W, 1 / 60); handleEvents(G.W, G.me, true); } }, secs);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(out, '5-game-later.png') });
  const info = await page.evaluate(() => ({ t: G.W.t, k: R.k, bw: R.bw, bh: R.bh, me: [G.me.x, G.me.y, G.me.lvl, G.me.hp], fps: 0 }));
  console.log(JSON.stringify(info));
  // 测帧率：正常跑 3 秒
  const fps = await page.evaluate(() => new Promise(res => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else res(n / 3); }; requestAnimationFrame(f); }));
  console.log('fps', fps.toFixed(1));
  await page.screenshot({ path: path.join(out, '6-game-after-fps.png') });
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await browser.close();
})();
