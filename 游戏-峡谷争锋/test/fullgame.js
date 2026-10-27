// 整局测试：只在测试里让电脑替玩家打，在页面里快进（每 5 秒游戏时间正常画几帧：特效、血条、播报都走一遍，看会不会报错），
// 直到结算画面出来；顺便看特效池、贴花池、场景里的物体数会不会越积越多。
// 用法：node test/fullgame.js 输出目录 [难度=1] [英雄=marksman]
const path = require('path'), fs = require('fs');
const { ROOT, launch, watchErrors } = require('./lib');
(async () => {
  const out = process.argv[2] || 'full';
  const diff = +(process.argv[3] || 1), hero = process.argv[4] || 'marksman';
  fs.mkdirSync(out, { recursive: true });
  const { browser, ctx } = await launch({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 1, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errs = watchErrors(page);
  await page.goto('file://' + path.join(ROOT, '峡谷争锋.html'));
  await page.waitForSelector('#title:not([hidden])', { timeout: 60000 });
  await page.evaluate(([d, h]) => { G.perf.off = true; G.diff = d; G.hero = h; document.querySelector('#bStart').click(); }, [diff, hero]);
  await page.waitForSelector('#select:not([hidden])');
  await page.evaluate(() => document.querySelector('#bGo').click());
  await page.waitForFunction(() => G.scr === 'game', null, { timeout: 30000 });
  let shot = 0;
  for (let k = 0; k < 500; k++) {
    const r = await page.evaluate(() => {
      const W = G.W, me = G.me;
      for (let i = 0; i < 5 * 60 && W.winner < 0; i++) {
        aiUpdate(W, me, 1 / 60); step(W, 1 / 60);
        if (i % 60 < 3) handleEvents(W, me, false); else W.ev.length = 0;   // 每秒有几帧走完整的事件（特效、播报）
        if (i % 30 === 0) { render3D(W, me, me, 0.5, null); drawHUD(W, me, 0.5, 'game'); }
      }
      return { t: Math.round(W.t), w: W.winner, kills: W.kills, towers: W.towersLost, lvl: me.lvl, kda: [me.kills, me.deaths, me.assists],
        fx: R3.fx.length, decals: R3.decals.length, objs: S3.scene.children.length, pa: R3.pa.n, projs: R3.projs.size, heroes: R3.heroes.size, mons: R3.monsters.size,
        geos: S3.r.info.memory.geometries, tex: S3.r.info.memory.textures };
    });
    if (k % 24 === 0 || r.w >= 0) { await page.waitForTimeout(300); await page.screenshot({ path: path.join(out, `g${String(shot++).padStart(2, '0')}.png`) }); console.log(JSON.stringify(r)); }
    if (r.w >= 0) break;
  }
  await page.waitForSelector('#result:not([hidden])', { timeout: 30000 });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(out, 'result.png') });
  console.log('result screen:', await page.evaluate(() => document.querySelector('.res').textContent));
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await browser.close();
})();
