// 看打起来是什么样：进对局后让电脑替玩家打（只在测试里），快进到玩家身边有架打的时候，停下来正常画几帧再截图。
// 用法：node test/battle.js 输出目录 [张数=4] [英雄=warrior] [phone|desktop]
const path = require('path'), fs = require('fs');
const { ROOT, launch, watchErrors } = require('./lib');
(async () => {
  const out = process.argv[2] || 'shots-battle';
  const N = +(process.argv[3] || 4), hero = process.argv[4] || 'warrior', mode = process.argv[5] || 'phone';
  fs.mkdirSync(out, { recursive: true });
  const touch = mode !== 'desktop';
  const vp = touch ? { width: 844, height: 390 } : { width: 1280, height: 720 };
  const { browser, ctx } = await launch({ viewport: vp, deviceScaleFactor: touch ? 3 : 1, hasTouch: touch, isMobile: touch });
  const page = await ctx.newPage();
  const errs = watchErrors(page);
  await page.goto('file://' + path.join(ROOT, '峡谷争锋.html'));
  await page.waitForSelector('#title:not([hidden])', { timeout: 60000 }).catch(e => { console.log(errs.join('\n')); throw e; });
  await page.evaluate(h => {
    G.perf.off = true; G.hero = h;
    const { blue, red } = rosters(h, 4242);
    prepGame(blue, red, 4242); hideAll(); G.scr = 'game'; G.paused = false;
    G.me.manual = false; applySkillRanks(G.me);   // 电脑替玩家打：技能按推荐顺序自动升
    window.ffwd = (maxT) => {        // 电脑替玩家打，直到身边有架打
      const W = G.W, me = G.me, t0 = W.t;
      while (W.t - t0 < maxT && W.winner < 0) {
        for (let i = 0; i < 30; i++) { aiUpdate(W, me, 1 / 60); step(W, 1 / 60); W.ev.length = 0; }
        if (me.dead) continue;
        const foes = W._heroes.filter(h => h.team !== me.team && !h.dead && dist(h, me) < 650).length;
        const pals = W._heroes.filter(h => h.team === me.team && !h.dead && dist(h, me) < 900).length;
        if (foes >= 1 && pals + foes >= 3) break;
      }
      R3.camX = me.x; R3.camY = me.y;
      return Math.round(W.t);
    };
    window.live = (secs) => {        // 正常跑（有特效），每帧也让电脑替玩家想
      const W = G.W, me = G.me;
      for (let i = 0; i < secs * 60; i++) { aiUpdate(W, me, 1 / 60); step(W, 1 / 60); handleEvents(W, me, false); if (i % 4 === 0) render3D(W, me, me, 4 / 60, null); }
    };
  }, hero);
  for (let k = 0; k < N; k++) {
    const t = await page.evaluate(() => ffwd(240));
    await page.evaluate(() => live(1.2));
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(out, `battle-${k + 1}.png`) });
    console.log('shot', k + 1, 'at', t, 's');
  }
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await browser.close();
})();
