'use strict';
/* shots1.js：雨夜的城市（第一遍副歌）。 */

/* 雨夜路口：他一个人站在斑马线中间，没打伞；头顶一盏路灯，光里的雨丝是亮的 */
function shotRainCross(t, lt, o = {}) {
  const camx = (o.camx ?? 0) + lt * 2;
  skyNight(0, 214, { top: hx('#05060E'), mid: hx('#101328'), low: hx('#2A2040'), glow: hx('#6A3A5A') });
  stars(0, 90, t, 30, 4);
  for (let k = 0; k < 3; k++) fogBand(40 + k * 34, 26, hx('#2A2442'), .35);
  // 远处的高楼：雾里、窗少；一座电视塔
  rect(470 - camx * .1, 40, 3, 140, hx('#2A2442')); ell(471 - camx * .1, 70, 6, 3, hx('#2A2442')); px(471 - camx * .1, 38, hx('#FF4A4A'), Math.sin(t * 2) > 0 ? 1 : .3); glow(471 - camx * .1, 38, 6, hx('#FF3030'), Math.sin(t * 2) > 0 ? .9 : .2);
  skyline(176, { seed: 3, off: camx * .15, minH: 70, maxH: 160, fog: .65, fogc: hx('#2E2646'), winFrac: .16, t, maxW: 50, ww: 1, wh: 2, gx: 3, gy: 4 });
  fogBand(140, 50, hx('#6A3A60'), .28);
  skyline(196, { seed: 8, off: camx * .3, minH: 50, maxH: 120, body: hx('#0E1020'), edge: hx('#261F3A'), fog: .2, fogc: hx('#2A2442'), winFrac: .3, t, glowWin: true, ww: 2, wh: 3, gx: 5, gy: 6, maxW: 64 });
  // 临街的店
  const sx = Math.round(-camx * .5);
  const row = [[-20, 70, 'bar'], [50, 84, 'cafe'], [134, 60, 'closed'], [194, 92, 'store'], [286, 64, 'flower'], [350, 80, 'closed'], [430, 88, 'cafe'], [518, 62, 'bar'], [580, 90, 'store']];
  for (const [x, w, k] of row) shopFront(x + sx, w, 214, k, t, { h: 30 });
  vSign(40 + sx, 120, '노래방', hx('#C88CFF'), t);
  vSign(176 + sx, 128, '咖啡', hx('#FF7AA8'), t, { flicker: 1, seed: 3 });
  vSign(420 + sx, 118, '치킨', hx('#FFB04A'), t);
  neon('24H', 210 + sx, 172, hx('#7AE0FF'), t, { box: 1, flicker: 1, seed: 4 });
  neon('便利店', 230 + sx, 172, hx('#7CFFB0'), t, { box: 1 });
  neon('BAR', 530 + sx, 168, hx('#FF6A4A'), t, { box: 1, flicker: 1, seed: 9 });
  // 对面人行道上打伞的人
  const umbC = [hx('#1E2230'), hx('#9C2B3A'), hx('#E8D5A8'), hx('#2E5A8A'), hx('#1E2230'), hx('#D8A436'), hx('#3A3A44')];
  for (let i = 0; i < 10; i++) {
    const dir = i % 2 ? 1 : -1, sp = 12 + h2(i, 3) * 10;
    const x = ((h2(i, 4) * (W + 80) + dir * lt * sp) % (W + 80) + W + 80) % (W + 80) - 40;
    walker(x, 218, 32 + h2(i, 5) * 6, umbC[i % umbC.length], lt * .9 + h2(i, 6), dir, { rim: hx('#B07AA8'), clear: i === 5 });
  }
  // 路面
  vgrad(0, 218, W, H - 218, [[0, hx('#111422')], [1, hx('#07080F')]], 8);
  rect(0, 216, W, 3, hx('#2A2A38'));                       // 路沿
  const cx1 = ((lt * 160) % 1000) - 220, cx2 = W + 220 - ((lt * 130 + 500) % 1000);
  car(cx2, 238, -1, hx('#5A2430'), t, { L: 66 });
  car(cx1, 250, 1, hx('#283450'), t, { L: 72 });
  reflect(218, 219, H, t, { k: .6, tint: [.9, .85, 1], wob: 2, streak: 8, fall: .45 });
  beamReflect(cx1 + 36, 252, 80, hx('#FFF0C8'), .35); beamReflect(cx2 - 33, 240, 60, hx('#FFF0C8'), .3);
  // 斑马线：淡、窄，往远处收
  for (let k = -5; k <= 5; k++) { const xt = 320 + k * 30, xb = 320 + k * 64; poly([xt - 7, 262, xt + 7, 262, xb + 15, H, xb - 15, H], hx('#B9C0D0'), .13); }
  // 他头顶的路灯：杆在右边，灯头伸到他头顶
  const lx = 352, ly = 70;
  // 吊在电线上的灯：电线从画面上方横过去，被风吹得轻轻晃
  const sway = Math.sin(t * 1.3) * 1.5;
  for (let x = 0; x < W; x++) { const yy = 34 + Math.pow((x - 340) / 340, 2) * -14 + 14 + (x > 200 && x < 500 ? sway * Math.sin((x - 200) / 300 * Math.PI) : 0); px(x, yy, hx('#0A0B12')); }
  line(lx + sway, 48, lx + sway, 60, hx('#0A0B12'));
  poly([lx - 7 + sway, 66, lx + 7 + sway, 66, lx + 4 + sway, 60, lx - 4 + sway, 60], hx('#1A1C26'));
  rect(lx - 4 + sway, 66, 8, 1, hx('#FFE6B8'));
  cone(lx + sway, 67, 8, 170, 268, hx('#FFD9A0'), .34);
  glow(lx, 66, 26, hx('#FFC880'), 1.4);
  ell(lx - 10, 334, 70, 10, hx('#FFD9A0'), .18, 3);           // 地上的一圈光
  puddle(300, 338, 52, 6, t, hx('#FFE2B0'), { a: .2, n: 6 });
  // 他
  lbegin();
  figFront({ who: 'he', keep: 1, x: 322, y: 338, h: 168, d: -1, t, exp: { eyes: 'down' }, gaze: [-.2, 1] });
  lresolve({ lx: .3, ly: -.95, sd: 2, amb: [.74, .66, .74], add: [14, 8, 4], rim: { c: hx('#FFD9A0'), x: 0, y: -1, k: .55, w: 1 }, rim2: { c: hx('#6AD8FF'), x: -1, y: 0, k: .4 } });
  lreflect(339, .32, [.7, .65, .8], t);
  // 雨：路灯光锥里的雨丝是暖色、亮的
  const lit = (x, y) => { if (y < 66 || y > 334) return 0; const k = (y - 66) / 268, half = lerp(4, 85, k); const d = Math.abs(x - lx) / half; return d < 1 ? (1 - d) * (1 - k * .5) : 0; };
  rain(t, { n: 460, ang: .14, c: hx('#9FB0D6'), a: .5, splash: 1, gy: H, splashH: 130, splashN: 60, lit, litc: hx('#FFE6C0') });
  bokeh(36, 320, 18, hx('#FF5A8A'), .5); bokeh(610, 290, 24, hx('#5AC8FF'), .4); bokeh(580, 352, 12, hx('#FFD27A'), .5);
  lensDrops(t, 6);
  bloom({ th: .6, k: .75, r: 3 });
  grade({ con: 1.1, sat: 1.12, vig: .7, lift: 4, liftc: [.6, .6, 1.3] });
}

/* 生日那晚：她一个人坐在餐桌前，蛋糕的蜡烛在烧，钟快走到十二点 */
function shotTable(t, lt, o = {}) {
  // 墙
  vgrad(0, 0, W, 260, [[0, hx('#1A1216')], [.6, hx('#2E2024')], [1, hx('#3A2A28')]], 10);
  rect(0, 214, W, 2, hx('#4A3632'));                          // 墙裙线
  // 窗（左）：窗外下雨的城市、纱帘
  windowCity(30, 34, 200, 170, t, { seed: 21, drops: 26 });
  rect(28, 32, 204, 3, hx('#2A1E1E')); rect(28, 203, 204, 4, hx('#3A2A26')); rect(28, 32, 3, 175, hx('#2A1E1E')); rect(229, 32, 3, 175, hx('#2A1E1E')); rect(129, 32, 2, 175, hx('#2A1E1E'));
  for (let k = 0; k < 7; k++) { const sw = Math.sin(t * .6 + k) * 2; poly([232 + k * 6, 30, 238 + k * 6, 30, 240 + k * 6 + sw, 214, 234 + k * 6 + sw, 214], hx('#E8DCCB'), .1); }
  for (let k = 0; k < 5; k++) { const sw = Math.sin(t * .6 + k + 3) * 2; poly([2 + k * 6, 30, 8 + k * 6, 30, 10 + k * 6 + sw, 214, 4 + k * 6 + sw, 214], hx('#E8DCCB'), .1); }
  // 右边：书架、植物、唱片机、挂钟
  rect(470, 70, 150, 4, hx('#4A3428')); rect(470, 130, 150, 4, hx('#4A3428'));
  for (let k = 0; k < 12; k++) rect(476 + k * 7, 52 + (k % 3), 5, 18 - (k % 3), [hx('#6A3A3A'), hx('#3A4A5A'), hx('#8A7A5A'), hx('#2A3A2A')][k % 4]);
  for (let k = 0; k < 6; k++) { const lx = 570 + k * 5, sw = Math.sin(t * .7 + k) * 1.5; poly([lx, 70, lx + 2, 70, lx + 6 + sw, 44 + k * 2, lx + 3 + sw, 46 + k * 2], hx('#3A6A44')); }
  rect(566, 64, 24, 6, hx('#B8865A'));
  rect(490, 112, 60, 18, hx('#2A2024')); rect(494, 114, 32, 14, hx('#141014')); circ(510, 121, 6, hx('#0A080A')); circ(510, 121, 1, hx('#C8304A'));   // 唱片机
  rect(556, 104, 22, 26, hx('#3A2E2A')); circ(567, 113, 6, hx('#1A1416')); circ(567, 124, 3, hx('#1A1416'));               // 音箱
  dust(552, 98, 30, 34, t, 8, hx('#D8C8B0'), .35, 5);
  wallClock(420, 70, 15, t, { h: 11 + 52 / 60, m: 52, sec: Math.floor(t * 1) % 60 });
  // 合照：两个人的剪影、海边
  rect(398, 118, 44, 34, hx('#C8B8A0')); rect(401, 121, 38, 28, hx('#E8A878')); rect(401, 135, 38, 14, hx('#4A7AA8'));
  for (const [hx_, c] of [[414, hx('#2A1A1A')], [426, hx('#3A2420')]]) { circ(hx_, 130, 3, c); rect(hx_ - 3, 133, 6, 9, c); }
  rect(401, 121, 38, 28, hx('#FFE0C0'), .12);
  // 日历：今天这格画了一颗心
  rect(462, 150, 40, 44, hx('#BDB4A8')); rect(462, 150, 40, 8, hx('#7A2030'));
  text('10', 466, 157, { col: 0xffffff });
  for (let k = 0; k < 20; k++) { const cx = 465 + (k % 5) * 7, cy = 162 + Math.floor(k / 5) * 7; rect(cx, cy, 4, 4, hx('#968C80')); }
  const hc = [479 + 7, 162 + 14]; poly([hc[0] - 3, hc[1], hc[0] + 3, hc[1], hc[0], hc[1] + 4], hx('#D8304A')); circ(hc[0] - 1.5, hc[1], 1.6, hx('#D8304A')); circ(hc[0] + 1.5, hc[1], 1.6, hx('#D8304A'));
  // 吊灯
  pendant(320, 74, t, { spread: 170, len: 150, a: .05 });
  // 她：坐在桌后，看着蛋糕
  const sx = 300, sy = 150;
  const light = { lx: .4, ly: .9, sd: 2, amb: [.8, .64, .62], add: [22, 10, 2], rim: { c: hx('#FFB868'), x: 0, y: 1, k: .3 }, rim2: { c: hx('#8AA8FF'), x: -1, y: 0, k: .25 } };
  lbegin();
  bustShe({ keep: 1, x: sx, y: sy, s: 60, d: 1, t, exp: { eyes: 'down', brows: 'sad', blush: .5 }, gaze: [.6, 1], fit: 'dress' });
  lresolve(light);
  eyeShine(HF({ x: sx, y: sy, s: 60, d: 1 }), { eyes: 'down' }, { gaze: [.6, 1] }, 'she');
  // 桌子：木桌面、亚麻桌旗
  poly([0, 262, W, 262, W, H, 0, H], hx('#3A2418'));
  vgrad(0, 262, W, 14, [[0, hx('#6A4430')], [1, hx('#4A2E20')]], 6);
  for (let k = 0; k < 8; k++) line(0, 280 + k * 10, W, 278 + k * 10.5, hx('#2E1C12'), .5);
  poly([200, 262, 440, 262, 470, H, 170, H], hx('#BFB29C'), .75);
  // 小臂搭在桌面上，手交叠
  lbegin();
  // 手肘在桌沿、小臂朝中间斜着搭过来，两只手叠在一起
  lpart(); lcap(sx - 50, sy + 116, 7.5, sx - 10, sy + 136, 6, M.skin);
  lpart(); lcap(sx + 48, sy + 116, 7.5, sx + 8, sy + 138, 6, M.skin);
  lpart(); lell(sx - 1, sy + 139, 9, 5, M.skin); lpolyOn([sx - 7, sy + 137, sx + 7, sy + 137, sx + 7, sy + 138, sx - 7, sy + 138], 0, 2, M.skin);
  lpx(sx + 3, sy + 136, M.watch, 4);
  lresolve(light);
  // 桌上：蛋糕（中间）、两只杯子（她的有酒，对面的是空的）、盖着保鲜膜的菜、一小瓶花、扣着的手机
  cake(322, 300, t, { w: 46, n: 5, lit: 1, melt: o.melt ?? .4 });
  wineGlass(250, 296, t, { fill: .6 }); wineGlass(408, 292, t, { fill: 0 });
  for (const [px_, py_, c] of [[150, 300, hx('#C86A3A')], [490, 298, hx('#6A9A4A')], [110, 330, hx('#D8A040')]]) {
    ell(px_, py_, 22, 6, hx('#EDE6DC')); ell(px_, py_ - 1, 15, 4, c); ell(px_, py_ - 3, 16, 4, hx('#FFFFFF'), .18); line(px_ - 12, py_ - 5, px_ + 6, py_ - 6, 0xffffff, .5);
  }
  rect(546, 268, 10, 22, hx('#A8C8D8'), .5); for (let k = 0; k < 4; k++) { const sw = Math.sin(t * .5 + k) * .8; circ(548 + k * 2 + sw, 264 - k * 3, 3, [hx('#F2E6F0'), hx('#FFFFFF'), hx('#F4C8D0'), hx('#FFFFFF')][k]); }
  rect(70, 290, 18, 30, hx('#141418')); rect(71, 291, 16, 28, hx('#1E1E26'));
  glow(322, 270, 40, hx('#FFB050'), .35);
  bloom({ th: .74, k: .6, r: 3 });
  grade({ con: 1.08, sat: 1.06, vig: .75, lift: 3, liftc: [1.2, .8, .7] });
}

/* 雨里他的特写：背景是虚掉的霓虹，雨水顺着头发往下滴 */
function shotRainClose(t, lt, o = {}) {
  vgrad(0, 0, W, H, [[0, hx('#06070F')], [.6, hx('#121530')], [1, hx('#1E1630')]], 12);
  // 焦外的霓虹和车灯：大大小小的光斑，慢慢漂
  const cols = [hx('#FF5A8A'), hx('#5AC8FF'), hx('#FFC86A'), hx('#B07AFF'), hx('#7CFFB0')];
  for (let i = 0; i < 34; i++) {
    const r = 6 + h2(i, 61) * 22, x = (h2(i, 62) * (W + 100) - lt * (3 + h2(i, 63) * 6)) % (W + 100) - 50, y = 40 + h2(i, 64) * 260;
    bokeh(x < -50 ? x + W + 100 : x, y, r, cols[i % 5], .35 + .25 * Math.sin(t * .8 + i));
  }
  rain(t, { n: 200, ang: .12, c: hx('#8090B8'), a: .35 });
  // 他
  const f = { x: 400, y: 150, s: 128, d: -1 };
  lbegin();
  bustHe({ keep: 1, ...f, t, exp: { eyes: 'down' }, gaze: [-.3, 1], fit: 'coat', light: -1 });
  lresolve({ lx: .8, ly: -.6, sd: 3, amb: [.74, .66, .78], add: [8, 4, 8], rim: { c: hx('#FF6AA8'), x: 1, y: 0, k: .45, w: 1 }, rim2: { c: hx('#6AD8FF'), x: -1, y: -1, k: .25 } });
  eyeShine(HF(f), { eyes: 'down' }, { gaze: [-.3, 1] }, 'he');
  // 发梢滴水、脸上的雨珠
  const F = HF(f);
  for (let i = 0; i < 6; i++) {
    const [tx, ty] = F(-.3 + i * .13, -.08 + (i % 2) * .05), ph = (t * .8 + h2(i, 71)) % 1;
    if (ph < .7) { circ(tx, ty + ph * 40, 1.4, hx('#CFE2FF'), .8 * (1 - ph)); px(tx - .5, ty + ph * 40 - 1, 0xffffff, .7 * (1 - ph)); }
  }
  for (let i = 0; i < 7; i++) { const [rx, ry] = F(-.25 + h2(i, 81) * .55, .05 + h2(i, 82) * .4); px(rx, ry, hx('#E8F2FF'), .7); px(rx + 1, ry + 1, hx('#9AB0D8'), .5); }
  // 前景的大雨丝
  rain(t + 3, { n: 60, ang: .12, c: hx('#C8D6F2'), a: .5, seed: 15 });
  bloom({ th: .6, k: .75, r: 4 });
  grade({ con: 1.1, sat: 1.1, vig: .8, lift: 3, liftc: [.6, .6, 1.3] });
}

/* 人物设定图 */
function shotSheet(t) {
  vgrad(0, 0, W, H, [[0, hx('#2B2433')], [.7, hx('#4A3A48')], [1, hx('#3A2E38')]], 12);
  rect(0, 318, W, 42, hx('#241E28'));
  for (let i = 0; i < 18; i++) bokeh(h2(i, 3) * W, 40 + h2(i, 4) * 200, 6 + h2(i, 5) * 12, [hx('#FFC86A'), hx('#FF8AA8'), hx('#8AB8FF')][i % 3], .18);
  const L = { lx: -.6, ly: -.8, sd: 2, amb: [1, .96, .94], rim: { c: hx('#FFE0C0'), x: 1, y: 0, k: .3 } };
  lbegin(); figFront({ who: 'he', keep: 1, x: 96, y: 318, h: 214, d: 1, t, exp: {}, gaze: [.4, 0] }); lresolve(L);
  lbegin(); figFront({ who: 'she', keep: 1, x: 362, y: 318, h: 200, d: -1, t, fit: 'dress', exp: {}, gaze: [-.3, 0] }); lresolve({ ...L, lx: .6, rim: { c: hx('#FFE0C0'), x: -1, y: 0, k: .3 } });
  lbegin(); figFront({ who: 'she', keep: 1, x: 586, y: 318, h: 200, d: -1, t, fit: 'trench', exp: { mouth: 'smile' }, gaze: [-.3, 0] }); lresolve({ ...L, lx: .6, rim: { c: hx('#FFE0C0'), x: -1, y: 0, k: .3 } });
  const f1 = { x: 222, y: 118, s: 96, d: 1 }, f2 = { x: 478, y: 118, s: 96, d: -1 };
  bustHe({ ...f1, t, exp: {}, gaze: [.4, 0], fit: 'coat', light: 1 });
  bustShe({ ...f2, t, exp: { mouth: 'smile' }, gaze: [-.2, 0], fit: 'dress', light: 1 });
  text('他：驼色长大衣 · 黑高领 · 银表', 12, 350, { col: hx('#F2E6D6'), out: hx('#141018') });
  text('她：酒红吊带裙 / 米色风衣 · 珍珠', 400, 350, { col: hx('#F2E6D6'), out: hx('#141018') });
  bloom({ th: .8, k: .4, r: 3 });
  grade({ con: 1.04, sat: 1.05, vig: .5 });
}
