// 用 Playwright 打开成品网页，模拟手机横屏 / 电脑，按流程点进对局，截几张图，打印页面报错和帧率。
// 用法：node test/shots.js 输出目录 [phone|desktop|portrait] [对局里快进几秒=20]
const path = require('path'), fs = require('fs');
const { ROOT, launch, watchErrors } = require('./lib');
(async () => {
  const out = process.argv[2] || 'shots';
  const mode = process.argv[3] || 'phone';
  const secs = +(process.argv[4] || 20);
  fs.mkdirSync(out, { recursive: true });
  const vp = mode === 'portrait' ? { width: 390, height: 844 } : mode === 'desktop' ? { width: 1280, height: 720 } : { width: 844, height: 390 };
  const touch = mode !== 'desktop';
  const { browser, ctx } = await launch({ viewport: vp, deviceScaleFactor: touch ? 3 : 1, hasTouch: touch, isMobile: touch });
  const page = await ctx.newPage();
  const errs = watchErrors(page);
  const t0 = Date.now();
  await page.goto('file://' + path.join(ROOT, '峡谷争锋.html'));
  if (mode === 'portrait') {
    await page.waitForTimeout(6000);
    await page.screenshot({ path: path.join(out, 'portrait.png') });
    console.log(errs.length ? errs.join('\n') : 'no errors');
    await browser.close(); return;
  }
  await page.waitForSelector('#title:not([hidden])', { timeout: 60000 }).catch(e => { console.log(errs.join('\n')); throw e; });
  console.log('title shown after', Date.now() - t0, 'ms');
  await page.evaluate(() => { G.perf.off = true; });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(out, '1-title.png') });
  const tap = async sel => { const el = await page.$(sel); const b = await el.boundingBox(); if (touch) await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); else await page.mouse.click(b.x + b.width / 2, b.y + b.height / 2); };
  await tap('#bStart');
  await page.waitForSelector('#select:not([hidden])');
  await page.waitForTimeout(700);
  await page.screenshot({ path: path.join(out, '2-select.png') });
  await tap('.card[data-h="mage"]');
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(out, '2b-select-mage.png') });
  await tap('.card[data-h="warrior"]');
  await tap('#bGo');
  await page.waitForSelector('#vs:not([hidden])');
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, '3-vs.png') });
  await page.waitForFunction(() => typeof G !== 'undefined' && G.scr === 'game', null, { timeout: 30000 });
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(out, '4-game-start.png') });
  await page.evaluate(s => { for (let i = 0; i < s * 60; i++) { step(G.W, 1 / 60); handleEvents(G.W, G.me, true); } }, secs);
  await page.waitForTimeout(800);
  await page.screenshot({ path: path.join(out, '5-game-later.png') });
  const fps = await page.evaluate(() => new Promise(res => { let n = 0; const t0 = performance.now(); const f = () => { n++; if (performance.now() - t0 < 3000) requestAnimationFrame(f); else res(n / 3); }; requestAnimationFrame(f); }));
  const info = await page.evaluate(() => ({ t: Math.round(G.W.t), me: [Math.round(G.me.x), Math.round(G.me.y), G.me.lvl], calls: S3.r.info.render.calls, tris: S3.r.info.render.triangles, dpr: G.dprGL }));
  console.log(JSON.stringify(info), 'fps', fps.toFixed(1));
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await browser.close();
})();
