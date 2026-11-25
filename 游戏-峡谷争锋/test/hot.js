// 热更新：假一个 window.claude.hot（页面重新发布时宿主会用它把旧页面的状态交给新页面）。
// 第一页打到第 120 秒左右，拿 snapshot；第二页用它启动，应该直接回到这一局（暂停画面），点“继续”再跑 30 秒不报错。
// 用法：node test/hot.js [输出目录]
const path = require('path'), fs = require('fs');
const { ROOT, launch, watchErrors } = require('./lib');
(async () => {
  const out = process.argv[2] || 'shots-hot';
  fs.mkdirSync(out, { recursive: true });
  const url = 'file://' + path.join(ROOT, '峡谷争锋.html');
  const fake = data => { window.claude = { hot: { snapshot(fn) { window.__snap = fn; }, ready(cb) { cb(data); }, data } }; };
  const { browser, ctx } = await launch({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const p1 = await ctx.newPage();
  const e1 = watchErrors(p1);
  await p1.addInitScript(fake, {});
  await p1.goto(url);
  await p1.waitForSelector('#title:not([hidden])', { timeout: 60000 });
  await p1.evaluate(() => { G.perf.off = true; document.querySelector('#bStart').click(); });
  await p1.waitForSelector('#select:not([hidden])');
  await p1.evaluate(() => { document.querySelector('.card[data-h="mage"]').click(); document.querySelector('#bGo').click(); });
  await p1.waitForFunction(() => G.scr === 'game', null, { timeout: 30000 });
  const snap = await p1.evaluate(() => {
    G.me.manual = false; applySkillRanks(G.me);
    for (let i = 0; i < 120 * 60; i++) { aiUpdate(G.W, G.me, 1 / 60); step(G.W, 1 / 60); G.W.ev.length = 0; }
    const d = window.__snap();
    return { d, t: G.W.t, lvl: G.me.lvl, kills: G.W.kills.slice(), size: d.save ? d.save.length : 0 };
  });
  console.log('第一页：', JSON.stringify({ t: Math.round(snap.t), lvl: snap.lvl, kills: snap.kills, snapshotKB: Math.round(snap.size / 1024) }));
  const p2 = await ctx.newPage();
  const e2 = watchErrors(p2);
  await p2.addInitScript(fake, snap.d);
  await p2.goto(url);
  await p2.waitForSelector('#pause:not([hidden])', { timeout: 60000 });
  const s2 = await p2.evaluate(() => ({ scr: G.scr, t: G.W.t, lvl: G.me.lvl, hid: G.me.hid, kills: G.W.kills.slice() }));
  console.log('第二页：', JSON.stringify(s2));
  await p2.screenshot({ path: path.join(out, 'hot-pause.png') });
  await p2.evaluate(() => document.querySelector('#pResume').click());
  await p2.evaluate(() => { G.perf.off = true; for (let i = 0; i < 30 * 60; i++) { aiUpdate(G.W, G.me, 1 / 60); step(G.W, 1 / 60); handleEvents(G.W, G.me, i % 60 < 2); if (i % 60 === 0) render3D(G.W, G.me, G.me, 1, null); } });
  await p2.waitForTimeout(800);
  await p2.screenshot({ path: path.join(out, 'hot-resumed.png') });
  const s3 = await p2.evaluate(() => ({ scr: G.scr, t: Math.round(G.W.t) }));
  const ok = s2.scr === 'pause' && Math.abs(s2.t - snap.t) < 0.5 && s2.hid === 'mage' && s3.t > s2.t + 25;
  console.log('接上了：', ok, JSON.stringify(s3));
  const errs = e1.concat(e2);
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await browser.close();
  process.exit(ok && !errs.length ? 0 : 1);
})();
