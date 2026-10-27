// 测触屏：用 CDP 发多指触摸（Playwright 的 touchscreen.tap 只能单指）。点“+”学技能、摇杆按住的同时第二根手指按普攻、补刀键、推塔键、
// 点敌人锁定 / 点空地取消、点敌方头像锁定、拖技能瞄准（技能轮盘）、拖到“取消施法”、闪现、回城、恢复、按小地图、暂停、商店、推荐装备。
// 每一步检查对局状态对不对。
// 用法：node test/touch.js [输出目录]
const path = require('path'), fs = require('fs');
const { ROOT, launch, watchErrors } = require('./lib');
(async () => {
  const out = process.argv[2] || 'shots-touch';
  fs.mkdirSync(out, { recursive: true });
  const { browser, ctx } = await launch({ viewport: { width: 844, height: 390 }, deviceScaleFactor: 2, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errs = watchErrors(page);
  await page.goto('file://' + path.join(ROOT, '峡谷争锋.html'));
  await page.waitForSelector('#title:not([hidden])', { timeout: 60000 });
  await page.evaluate(() => { G.perf.off = true; G.freeze = true; });
  const tapSel = async sel => { const b = await (await page.$(sel)).boundingBox(); await page.touchscreen.tap(b.x + b.width / 2, b.y + b.height / 2); };
  await tapSel('#bStart'); await page.waitForSelector('#select:not([hidden])');
  await tapSel('.card[data-h="warrior"]'); await tapSel('#bGo');
  await page.waitForFunction(() => G.scr === 'game', null, { timeout: 30000 });
  await page.evaluate(() => { for (let i = 0; i < 60 * 40; i++) { step(G.W, 1 / 60); G.W.ev.length = 0; } });   // 跑到第 40 秒（兵出来了）
  const cdp = await ctx.newCDPSession(page);
  // 触摸移动的 pointermove 跟着画面帧走（软件渲染一帧要几百毫秒），发完等一下再看状态
  const T = async (type, pts) => { await cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y, id]) => ({ x, y, id, radiusX: 4, radiusY: 4, force: 1 })) }); if (type === 'touchMove') await page.waitForTimeout(450); };
  const run = s => page.evaluate(s => { for (let i = 0; i < s * 60; i++) { playerCmd(G.W, G.me); step(G.W, 1 / 60); G.W.ev.length = 0; } }, s);
  const st = () => page.evaluate(() => ({ x: Math.round(G.me.x), y: Math.round(G.me.y), cd0: +G.me.sk[0].cd.toFixed(2), flash: Math.round(G.me.flashCd), heal: Math.round(G.me.healCd), recall: G.me.recall, scr: G.scr,
    joy: !!INP.joy, atk: INP.atk != null, mode: INP.atkMode, cmdMode: G.me.cmd.atkMode, aim: INP.aim ? { s: INP.aim.s, cancel: INP.aim.cancel, moved: INP.aim.moved, fx: Math.round(INP.aim.fx), fy: Math.round(INP.aim.fy) } : null,
    peek: R3.peek, items: G.me.items.slice(), gold: Math.round(G.me.gold), rank: G.me.sk.map(k => k.rank), pts: G.me.skillPts, lock: INP.lock }));
  const Lt = await page.evaluate(() => HUD.L);
  const res = [];
  const ok = (name, cond, info) => { res.push([name, !!cond]); console.log((cond ? 'OK  ' : 'FAIL') + ' ' + name + (info ? '  ' + JSON.stringify(info) : '')); };
  // 0. 点技能 1 左上角的“+”：学会技能 1
  let s00 = await st();
  ok('开局：技能都没学、有 1 个技能点', s00.rank.join() === '0,0,0' && s00.pts === 1, s00);
  await T('touchStart', [[Lt.up[0].x, Lt.up[0].y, 20]]); await T('touchEnd', []);
  s00 = await st();
  ok('点“+”：技能 1 升到 1 级', s00.rank[0] === 1 && s00.pts === 0, { rank: s00.rank, pts: s00.pts });
  // 1. 摇杆往右上推 2 秒
  let s0 = await st();
  await T('touchStart', [[Lt.joy.x, Lt.joy.y, 1]]);
  await T('touchMove', [[Lt.joy.x + 40, Lt.joy.y - 40, 1]]);
  await run(2);
  let s1 = await st();
  ok('摇杆：往右上走', s1.x - s0.x > 150 && s0.y - s1.y > 150 && s1.joy, { from: [s0.x, s0.y], to: [s1.x, s1.y] });
  await page.screenshot({ path: path.join(out, 't1-joystick.png') });
  // 2. 摇杆按着，第二根手指按普攻
  await T('touchStart', [[Lt.joy.x + 40, Lt.joy.y - 40, 1], [Lt.atk.x, Lt.atk.y, 2]]);
  s1 = await st();
  ok('两指：摇杆 + 普攻同时按住', s1.joy && s1.atk, s1);
  await T('touchEnd', [[Lt.joy.x + 40, Lt.joy.y - 40, 1]]);
  s1 = await st();
  ok('松开摇杆，普攻还按着', !s1.joy && s1.atk, s1);
  await T('touchEnd', []);
  s1 = await st();
  ok('全松开', !s1.joy && !s1.atk, s1);
  await T('touchStart', [[Lt.lasthit.x, Lt.lasthit.y, 21]]); await run(0.05);
  s1 = await st();
  ok('按住补刀键：只打小兵野怪', s1.atk && s1.mode === 'minion' && s1.cmdMode === 'minion', { mode: s1.mode, cmd: s1.cmdMode });
  await T('touchEnd', []);
  await T('touchStart', [[Lt.tower.x, Lt.tower.y, 22]]); await run(0.05);
  s1 = await st();
  ok('按住推塔键：只打塔', s1.atk && s1.mode === 'tower' && s1.cmdMode === 'tower', { mode: s1.mode, cmd: s1.cmdMode });
  await T('touchEnd', []);
  // 点敌人锁定、点空地取消、点头像锁定：把一个敌方英雄挪到玩家右边
  const foe = await page.evaluate(() => { const e = G.W._heroes.find(h => h.team === 1); e.x = G.me.x + 260; e.y = G.me.y - 60; e.vx = e.vy = 0; e.cmd = {}; e.ai.next = 99; delete e._px; R3.alpha = 1;
    render3D(G.W, G.me, G.me, 0.02, null); const o = [0, 0, 0]; worldToScreen(e.x, groundH(e.x, e.y) + unitTop(e) * 0.5, e.y, o); return { id: e.id, sx: o[0], sy: o[1] }; });
  await T('touchStart', [[foe.sx, foe.sy, 23]]); await T('touchEnd', []);
  s1 = await st();
  ok('点屏幕上的敌方英雄：锁定', s1.lock === foe.id, { lock: s1.lock, foe: foe.id });
  await page.waitForTimeout(500);
  await page.screenshot({ path: path.join(out, 't0-lock.png') });
  const empty = await page.evaluate(() => [HUD.w * 0.6, HUD.h * 0.3]);   // 右上方一块空地（不在按钮上、离敌人远）
  await T('touchStart', [[empty[0], empty[1], 24]]); await T('touchEnd', []);
  s1 = await st();
  ok('点空地：取消锁定', !s1.lock, { lock: s1.lock });
  await page.waitForTimeout(500);
  const foes = await page.evaluate(() => HUD.foes.map(e => e.id));
  ok('敌方英雄靠近：技能上方出现头像', foes.includes(foe.id), foes);
  const fi = foes.indexOf(foe.id);
  await T('touchStart', [[Lt.foes[fi].x, Lt.foes[fi].y, 25]]); await T('touchEnd', []);
  s1 = await st();
  ok('点敌方头像：锁定', s1.lock === foe.id, { lock: s1.lock });
  await page.evaluate(() => { const e = G.W._heroes.find(h => h.team === 1); const p = spawnPoint(1, e.slot); e.x = p[0]; e.y = p[1]; delete e._px; INP.lock = 0; });
  // 3. 拖技能 1 瞄准，松手放出去
  const sk = Lt.s[0];
  await T('touchStart', [[sk.x, sk.y, 3]]);
  await T('touchMove', [[sk.x - 30, sk.y - 30, 3]]);
  await T('touchMove', [[sk.x - 60, sk.y - 40, 3]]);
  s1 = await st();
  const dec = await page.evaluate(() => R3.aimG && Object.values(R3.aimG).filter(Boolean).length);
  ok('拖技能：进入瞄准（技能轮盘跟着手指）、地上有指示', s1.aim && s1.aim.moved && s1.aim.fx < -40 && dec > 0, { aim: s1.aim, decals: dec });
  await page.waitForTimeout(400);
  await page.screenshot({ path: path.join(out, 't2-aim.png') });
  await T('touchEnd', []);
  await run(0.1);
  s1 = await st();
  ok('松手：技能放出去（进冷却）', s1.cd0 > 0, s1);
  // 4. 拖到“取消施法”
  await page.evaluate(() => { G.me.sk[0].cd = 0; });
  await T('touchStart', [[sk.x, sk.y, 4]]);
  await T('touchMove', [[sk.x - 20, sk.y - 40, 4]]);
  await T('touchMove', [[Lt.cancel.x, Lt.cancel.y, 4]]);
  s1 = await st();
  ok('拖到取消施法上：标成取消', s1.aim && s1.aim.cancel, s1.aim);
  await page.screenshot({ path: path.join(out, 't3-cancel.png') });
  await T('touchEnd', []);
  await run(0.1);
  s1 = await st();
  ok('松手：没放（不进冷却）', s1.cd0 === 0, s1);
  // 5. 点一下技能：自动放
  await T('touchStart', [[sk.x, sk.y, 5]]); await T('touchEnd', []);
  await run(0.1);
  s1 = await st();
  ok('点一下技能：自动放', s1.cd0 > 0, s1);
  // 6. 闪现：往左拖
  s0 = await st();
  await T('touchStart', [[Lt.flash.x, Lt.flash.y, 6]]);
  await T('touchMove', [[Lt.flash.x - 50, Lt.flash.y, 6]]);
  await T('touchEnd', []);
  await run(0.1);
  s1 = await st();
  ok('闪现：往左闪', s1.flash > 0 && s0.x - s1.x > 200, { from: [s0.x, s0.y], to: [s1.x, s1.y], cd: s1.flash });
  // 7. 恢复、回城
  await T('touchStart', [[Lt.heal.x, Lt.heal.y, 7]]); await T('touchEnd', []);
  await run(0.1);
  s1 = await st();
  ok('恢复：进冷却', s1.heal > 0, s1);
  await T('touchStart', [[Lt.recall.x, Lt.recall.y, 8]]); await T('touchEnd', []);
  await run(0.2);
  s1 = await st();
  ok('回城：开始读条', s1.recall > 0, s1);
  await run(5.5);
  s1 = await st();
  ok('回城：回到泉水', Math.hypot(s1.x - 170, s1.y - 4830) < 400, s1);
  // 8. 小地图：按住看别处，松手回来
  await T('touchStart', [[Lt.mini.x + Lt.mini.s * 0.8, Lt.mini.y + Lt.mini.s * 0.2, 9]]);
  s1 = await st();
  ok('按小地图：镜头去右上', s1.peek && s1.peek[0] > 3500 && s1.peek[1] < 1500, s1.peek);
  await page.waitForTimeout(600);
  await page.screenshot({ path: path.join(out, 't4-minimap.png') });
  await T('touchEnd', []);
  s1 = await st();
  ok('松开小地图：镜头回来', !s1.peek, s1.peek);
  // 9. 推荐装备、商店、暂停
  await page.evaluate(() => { G.me.gold = 2000; });
  s0 = await st();
  await T('touchStart', [[Lt.buy.x, Lt.buy.y, 10]]); await T('touchEnd', []);
  s1 = await st();
  ok('推荐装备：点一下就买', s1.items.length > s0.items.length && s1.gold < s0.gold, { before: s0.items, after: s1.items });
  await T('touchStart', [[Lt.shop.x, Lt.shop.y, 11]]); await T('touchEnd', []);
  s1 = await st();
  ok('商店键：打开商店', s1.scr === 'shop', s1.scr);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, 't5-shop.png') });
  await tapSel('#sClose');
  s1 = await st();
  ok('商店：关闭', s1.scr === 'game', s1.scr);
  await T('touchStart', [[Lt.pause.x, Lt.pause.y, 12]]); await T('touchEnd', []);
  s1 = await st();
  ok('暂停键：打开暂停', s1.scr === 'pause', s1.scr);
  await page.waitForTimeout(300);
  await page.screenshot({ path: path.join(out, 't6-pause.png') });
  await tapSel('#pResume');
  s1 = await st();
  ok('继续', s1.scr === 'game', s1.scr);
  const bad = res.filter(r => !r[1]).length;
  console.log(`\n${res.length - bad}/${res.length} 通过`);
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await browser.close();
  process.exit(bad ? 1 : 0);
})();
