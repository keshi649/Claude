// 触屏操作测试：用 CDP 发多指触摸事件，检查摇杆能走、按住普攻、拖技能能放、点闪现 / 回城有用。
// 用法：node test/touch.js [phone|portrait]
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const mode = process.argv[2] || 'phone';
  const html = fs.readFileSync(path.join(__dirname, '..', '小怪峡谷.html'), 'utf8');
  const browser = await chromium.launch();
  const vp = mode === 'portrait' ? { width: 390, height: 780 } : { width: 844, height: 390 };
  const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 3, hasTouch: true, isMobile: true });
  const page = await ctx.newPage();
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await page.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>');
  await page.waitForSelector('#title:not([hidden])', { timeout: 30000 });
  await page.evaluate(() => { document.querySelector('#bStart').click(); });
  await page.waitForSelector('#select:not([hidden])');
  await page.evaluate(() => { document.querySelector('.card[data-h="warrior"]').click(); document.querySelector('#bGo').click(); });
  await page.waitForFunction(() => typeof G !== 'undefined' && G.scr === 'game', null, { timeout: 15000 });
  // 先托管跑 40 秒，到兵线上
  await page.evaluate(() => { G.W.auto = true; for (let i = 0; i < 40 * 60; i++) { step(G.W, 1 / 60); handleEvents(G.W, G.me, true); } G.W.auto = false; G.me.cmd = {}; });
  const cdp = await ctx.newCDPSession(page);
  // 缓冲坐标 → 视口坐标（竖屏时还要转回去）
  const toView = async (bx, by) => page.evaluate(([bx, by]) => {
    const cx = (bx * R.k + R.ox) / R.dpr, cy = (by * R.k + R.oy) / R.dpr;
    const r = document.querySelector('#app').getBoundingClientRect();
    return G.rot ? [r.left + r.width - cy, r.top + cx] : [r.left + cx, r.top + cy];
  }, [bx, by]);
  const L = await page.evaluate(() => hudLayout());
  const touch = (type, pts) => cdp.send('Input.dispatchTouchEvent', { type, touchPoints: pts.map(([x, y, id]) => ({ x, y, id, radiusX: 4, radiusY: 4, force: 1 })) });
  const frames = n => page.evaluate(n => new Promise(r => { let k = 0; const f = () => (++k >= n ? r() : requestAnimationFrame(f)); requestAnimationFrame(f); }), n);
  const st = () => page.evaluate(() => ({ x: G.me.x, y: G.me.y, cd: G.me.sk.map(s => +s.cd.toFixed(2)), rank: G.me.sk.map(s => s.rank), flash: G.me.flashCd, recall: G.me.recall, atkAuto: !!G.me.cmd.atkAuto, mv: G.me.cmd.mv, dead: G.me.dead, lvl: G.me.lvl, atkT: G.me.atkT, t: G.W.t }));
  let s0 = await st();
  console.log('start', JSON.stringify(s0));
  // 1 摇杆往右上推
  const j0 = await toView(L.joy.x, L.joy.y);
  const j1 = await toView(L.joy.x + 22, L.joy.y - 22);
  await touch('touchStart', [[j0[0], j0[1], 1]]);
  for (let i = 1; i <= 5; i++) await touch('touchMove', [[j0[0] + (j1[0] - j0[0]) * i / 5, j0[1] + (j1[1] - j0[1]) * i / 5, 1]]);
  await frames(40);
  let s1 = await st();
  console.log('joystick: moved', Math.round(s1.x - s0.x), Math.round(s1.y - s0.y), 'mv', JSON.stringify(s1.mv));
  // 2 摇杆按着的同时，另一只手指按住普攻
  const a = await toView(L.atk.x, L.atk.y);
  await touch('touchStart', [[j1[0], j1[1], 1], [a[0], a[1], 2]]);
  await frames(10);
  let s2 = await st();
  console.log('attack held (2 fingers):', s2.atkAuto, 'mv still', JSON.stringify(s2.mv));
  await touch('touchEnd', [[j1[0], j1[1], 1]]);
  await frames(30);
  await touch('touchEnd', []);
  await frames(5);
  let s3 = await st();
  console.log('released:', s3.atkAuto, JSON.stringify(s3.mv));
  // 3 拖技能 1（旋风斩是对自己放的，拖不拖都放）→ 冷却开始
  const b1 = await toView(L.s[0].x, L.s[0].y);
  const b1m = await toView(L.s[0].x - 20, L.s[0].y - 10);
  await touch('touchStart', [[b1[0], b1[1], 3]]);
  for (let i = 1; i <= 4; i++) await touch('touchMove', [[b1[0] + (b1m[0] - b1[0]) * i / 4, b1[1] + (b1m[1] - b1[1]) * i / 4, 3]]);
  await frames(3);
  const aiming = await page.evaluate(() => !!INP.aim && INP.aim.moved);
  await touch('touchEnd', []);
  await frames(5);
  let s4 = await st();
  console.log('skill1 aiming seen', aiming, 'cd after release', s4.cd[0]);
  // 4 技能拖到“取消”上松手：不放（升到 2 级才有技能 2，这里先把等级加上去）
  await page.evaluate(() => { addXp(G.W, G.me, 2000); G.me.sk.forEach(s => s.cd = 0); });
  const b2 = await toView(L.s[1].x, L.s[1].y), cc = await toView(L.cancel.x, L.cancel.y);
  await touch('touchStart', [[b2[0], b2[1], 4]]);
  for (let i = 1; i <= 6; i++) await touch('touchMove', [[b2[0] + (cc[0] - b2[0]) * i / 6, b2[1] + (cc[1] - b2[1]) * i / 6, 4]]);
  await frames(3);
  const cancelOn = await page.evaluate(() => INP.aim && INP.aim.cancel);
  await touch('touchEnd', []);
  await frames(5);
  let s5 = await st();
  console.log('cancel highlighted', cancelOn, 'skill2 cd after cancel (should be 0)', s5.cd[1]);
  // 5 点一下技能 2（跃击）：自动找目标或朝前放
  await touch('touchStart', [[b2[0], b2[1], 5]]);
  await frames(2);
  await touch('touchEnd', []);
  await frames(40);
  let s6 = await st();
  console.log('skill2 tap cast cd', s6.cd[1], 'moved', Math.round(s6.x - s5.x), Math.round(s6.y - s5.y));
  // 6 闪现（点一下，朝面向）
  const f = await toView(L.flash.x, L.flash.y);
  await touch('touchStart', [[f[0], f[1], 6]]);
  await frames(2);
  await touch('touchEnd', []);
  await frames(5);
  let s7 = await st();
  console.log('flash cd', Math.round(s7.flash), 'jump', Math.round(Math.hypot(s7.x - s6.x, s7.y - s6.y)));
  // 7 回城
  const rc = await toView(L.recall.x, L.recall.y);
  await touch('touchStart', [[rc[0], rc[1], 7]]);
  await frames(2);
  await touch('touchEnd', []);
  await frames(10);
  let s8 = await st();
  console.log('recall started', s8.recall > 0);
  // 8 点小地图：镜头跳过去，松手回来
  const mm = await toView(L.mini.x + L.mini.s - 6, L.mini.y + 6);
  await touch('touchStart', [[mm[0], mm[1], 8]]);
  await frames(3);
  const peek = await page.evaluate(() => R.peek && R.peek.map(Math.round));
  await page.screenshot({ path: process.env.SHOT || '/tmp/touch_peek.png' });
  await touch('touchEnd', []);
  await frames(3);
  const peek2 = await page.evaluate(() => R.peek);
  console.log('minimap peek', JSON.stringify(peek), 'after release', peek2);
  // 9 暂停按钮
  const pz = await toView(L.pause.x, L.pause.y);
  await touch('touchStart', [[pz[0], pz[1], 9]]);
  await touch('touchEnd', []);
  await frames(3);
  console.log('paused', await page.evaluate(() => G.paused && G.scr));
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await browser.close();
})();
