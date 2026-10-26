// 整局测试：玩家托管，在页面里快进（每快进 5 秒画几帧，顺便测画面函数在各种局面下会不会报错），直到结算画面出来。
// 用法：node test/fullgame.js 输出目录 [难度=1]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const out = process.argv[2] || 'full';
  const diff = +(process.argv[3] || 1);
  fs.mkdirSync(out, { recursive: true });
  const html = fs.readFileSync(path.join(__dirname, '..', '小怪峡谷.html'), 'utf8');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message + ' ' + (e.stack || '').split('\n').slice(1, 3).join(' | ')));
  await page.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>');
  await page.waitForSelector('#title:not([hidden])', { timeout: 30000 });
  await page.evaluate(d => { G.diff = d; document.querySelector('#bStart').click(); }, diff);
  await page.waitForSelector('#select:not([hidden])');
  await page.evaluate(() => { document.querySelector('.card[data-h="marksman"]').click(); document.querySelector('#bGo').click(); });
  await page.waitForFunction(() => typeof G !== 'undefined' && G.scr === 'game', null, { timeout: 15000 });
  await page.evaluate(() => { G.W.auto = true; });
  let shot = 0;
  const t0 = Date.now();
  for (let k = 0; k < 400; k++) {
    const r = await page.evaluate(() => {
      for (let i = 0; i < 5 * 60 && G.W.winner < 0; i++) { step(G.W, 1 / 60); handleEvents(G.W, G.me, false); }
      return { t: G.W.t, w: G.W.winner, kills: G.W.kills, towers: G.W.towersLost, lvl: G.me.lvl, kda: [G.me.kills, G.me.deaths, G.me.assists], ann: HUD.ann.map(a => a.text) };
    });
    await page.waitForTimeout(120);
    if (k % 24 === 0) { await page.screenshot({ path: path.join(out, `g${String(shot++).padStart(2, '0')}.png`) }); console.log(JSON.stringify(r)); }
    if (r.w >= 0) { console.log('END', JSON.stringify(r)); break; }
  }
  await page.waitForFunction(() => G.scr === 'result', null, { timeout: 10000 }).catch(() => errs.push('result screen did not show'));
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, 'result.png') });
  // 再来一局 → 选英雄画面
  await page.evaluate(() => document.querySelector('#rAgain').click());
  await page.waitForSelector('#select:not([hidden])', { timeout: 5000 }).catch(() => errs.push('again did not open select'));
  console.log('wall', Date.now() - t0, 'ms');
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await browser.close();
})();
