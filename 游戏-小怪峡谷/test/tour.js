// 看图：托管快进到某个时间，然后把镜头挪到几处地方各截一张（野怪、龙坑、兵线、基地）。
// 用法：node test/tour.js 输出目录 [快进秒数=360]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const out = process.argv[2] || 'tour';
  const secs = +(process.argv[3] || 360);
  fs.mkdirSync(out, { recursive: true });
  const html = fs.readFileSync(path.join(__dirname, '..', '小怪峡谷.html'), 'utf8');
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push(e.message));
  await page.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>');
  await page.waitForSelector('#title:not([hidden])', { timeout: 30000 });
  await page.evaluate(() => document.querySelector('#bStart').click());
  await page.evaluate(() => { document.querySelector('.card[data-h="assassin"]').click(); document.querySelector('#bGo').click(); });
  await page.waitForFunction(() => typeof G !== 'undefined' && G.scr === 'game', null, { timeout: 15000 });
  await page.evaluate(s => { G.W.auto = true; for (let i = 0; i < s * 60; i++) { step(G.W, 1 / 60); handleEvents(G.W, G.me, true); } HUD.ann.length = 0; }, secs);
  const spots = await page.evaluate(() => {
    const out = [];
    for (const c of G.W.camps) out.push([c.type + (c.side < 0 ? '' : c.side), c.x, c.y]);
    // 打得最激烈的地方：双方英雄都在附近
    let best = null, bn = 0;
    for (const h of G.W._heroes) { if (h.dead) continue; let n = 0; for (const e of G.W._heroes) if (!e.dead && Math.hypot(e.x - h.x, e.y - h.y) < 900) n++; if (n > bn) { bn = n; best = h; } }
    if (best) out.unshift(['fight', best.x, best.y]);
    out.push(['blueBase', 900, 4100], ['redBase', 4100, 900], ['midCenter', 2500, 2500]);
    return out;
  });
  const want = ['fight', 'blue0', 'red0', 'wolf0', 'bird0', 'golem0', 'drake', 'lord', 'blueBase', 'redBase', 'midCenter'];
  for (const [name, x, y] of spots) {
    if (!want.includes(name)) continue;
    await page.evaluate(([x, y]) => { R.peek = [x, y]; }, [x, y]);
    await page.waitForTimeout(250);
    await page.screenshot({ path: path.join(out, name + '.png') });
  }
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await browser.close();
})();
