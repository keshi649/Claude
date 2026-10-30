'use strict';
/* shots2.js —— 副歌一：现在。雨夜的城市（摇下来的大全景、路口、对街的他、伞海、她的特写、夜车、房间、那张撕开的照片）。 */

/* ---------------- 雨夜城市（摇镜用的高画面：世界坐标 0（天空）~ CITY_H（街面）） ---------------- */
const CITY_H = 600;
const NIGHT_SKY = [[0, '#06071A'], [.25, '#0E0F33'], [.5, '#22185A'], [.7, '#3E2068'], [.85, '#6A2A72'], [1, '#8E3672']];
function cityParts() {
  return {
    far: makeCity('far2', { seed: 11, w: 520, h: 260, base: 260, hmin: 50, hmax: 150, wmin: 12, wmax: 30, gap: 1, col: '#2A2058', col2: '#33266A', ws: 1, lit: .38, fog: '#7A3A8A', fogA: .5 }),
    mid: makeCity('mid2', { seed: 23, w: 560, h: 320, base: 320, hmin: 80, hmax: 230, wmin: 20, wmax: 44, gap: 3, col: '#1A1438', col2: '#241A4A', ws: 2, lit: .42, rim: ['#FF4FA0', '#3FF0FF'], signs: ['24H', 'BAR', 'HOTEL', 'KTV', 'CAFE', 'BOOK', '书店', '影院'], signP: .5, fog: '#5A2A78', fogA: .28, tallAt: 180 }),
    L: facade('L1', 124, 520, { seed: 5, col: '#181230', side: 'l', rimCol: '#FF4FA0', shop: true }),
    Rt: facade('R1', 124, 480, { seed: 9, col: '#151030', side: 'r', rimCol: '#3FF0FF', shop: true }),
  };
}
/* 远处的电视塔（城市的地标）：细高，中间一个圆盘，顶上闪红灯 */
function tvTower(g, x, y, t, a = 1) {
  x = ri(x); y = ri(y);
  const c = '#3A2A6A', c2 = '#4E3A82';
  R(g, x - 3, y + 40, 6, 200, c); R(g, x - 3, y + 40, 1, 200, c2); R(g, x - 1, y - 30, 2, 70, c);
  ell(g, x, y + 40, 14, 6, c); ell(g, x, y + 38, 12, 4, c2); for (let k = -10; k <= 10; k += 4) R(g, x + k, y + 40, 2, 1, '#FFD27A');
  ell(g, x, y + 90, 8, 4, c); for (let k = -6; k <= 6; k += 4) R(g, x + k, y + 90, 1, 1, '#9FD8FF');
  const on = mod(t, 1.2) < .5; R(g, x, y - 31, 1, 1, on ? '#FF3040' : '#601020'); if (on) glow(g, x, y - 31, 5, '#FF3040', .7 * a, 2);
  glow(g, x, y + 40, 26, '#FFB060', .14 * a, 3);
}
function cityNight(g, t, camY, o = {}) {
  const P = cityParts(), camX = o.camX || 0;
  const sy = -camY * .3;                                         // 天空
  g.drawImage(skyC('night2', W, 300, NIGHT_SKY, .55), 0, ri(sy));
  stars(g, t, { seed: 4, n: 60, h: 110, y: sy, a: .5, big: .03 });
  const sp = mod(t, 4), blinkA = sp < .2 || (sp > .4 && sp < .6) ? 1 : .4;   // 那颗会眨两下的星（伏笔）
  R(g, 352, sy + 30, 1, 1, '#FFFFFF'); glow(g, 352, sy + 30, 6, '#BFE4FF', .5 * blinkA, 3); if (blinkA > .9) { R(g, 350, sy + 30, 5, 1, '#FFFFFF'); R(g, 352, sy + 28, 1, 5, '#FFFFFF'); }
  const px = mod(t * 9, W + 60) - 30; R(g, px, sy + 64, 1, 1, mod(t, 1) < .5 ? '#FF4040' : '#FFFFFF');            // 夜航的飞机
  for (let i = 0; i < 6; i++) blit(g, cloudSpr(60 + i, 160, 42, ['#26184A', '#36225E', '#56327A', '#7E4892']), mod(i * 110 - t * 5, W + 170) - 165, sy + 36 + (i % 3) * 20 + (i > 2 ? 30 : 0), { a: .9 });
  // 远楼 + 电视塔
  const fy = 330 - 260 - camY * .55;
  tvTower(g, 300 - camX * .3, fy + 80, t);
  drawCity(g, P.far, -20 - camX * .3, fy, t);
  sglow(g, 240, fy + 250, 300, '#FF5AA0', .12);
  // 中楼 + 大屏
  const my = 420 - 320 - camY * .75;
  drawCity(g, P.mid, -40 - camX * .5, my, t);
  billboard(g, 196 - camX * .5, my + 60, t);
  // 高架轻轨
  const ry = 404 - camY * .85;
  railTrack(g, ry, t);
  lightRail(g, W + 40 - mod(t - (o.trainT ?? 0), 9) * 150, ry, t, { cars: 4 });
  // 近处两栋楼，中间挂一串小灯
  const ny = -camY;
  drawFacade(g, P.L, -camX - 10, ny + 80, t);
  drawFacade(g, P.Rt, W - 114 - camX, ny + 120, t);
  neonV(g, 96 - camX, ny + 170, '旅馆', '#FF4FA0', neonOn(t, 1));
  neonV(g, 96 - camX, ny + 250, '拉面', '#FF6A3D', neonOn(t, 2));
  neonV(g, W - 124 - camX, ny + 210, '药房', '#5CFF9D', neonOn(t, 3));
  neonV(g, W - 124 - camX, ny + 280, '咖啡', '#3FF0FF', neonOn(t, 4));
  stringLights(g, 110 - camX, ny + 300, W - 112 - camX, ny + 330, 26, t);
  stringLights(g, 110 - camX, ny + 420, W - 112 - camX, ny + 440, 18, t + 3);
  street(g, t, 512 - camY, o);
}
/* 高架轻轨：x 车头位置，y 轨道面 */
function lightRail(g, x, y, t, o = {}) {
  const cars = o.cars || 4, cw = 70;
  for (let k = 0; k < cars; k++) {
    const cx = ri(x + k * (cw + 2)), cy = ri(y - 18);
    if (cx > W + 10 || cx + cw < -10) continue;
    R(g, cx, cy, cw, 16, '#C8CCE0'); R(g, cx, cy, cw, 2, '#E8ECF8'); R(g, cx, cy + 12, cw, 4, '#8088A8'); R(g, cx, cy + 10, cw, 1, '#3FF0FF');
    for (let wx = cx + 4; wx < cx + cw - 6; wx += 8) {
      R(g, wx, cy + 4, 6, 5, '#FFE6A8');
      const p = hash(wx - ri(x) + k * 31, 7); if (p < .45) R(g, wx + 2, cy + 6, 2, 3, '#2A1E3A'); else if (p > .9) R(g, wx + 1, cy + 5, 1, 4, '#2A1E3A');
    }
    glow(g, cx + cw / 2, cy + 8, 40, '#FFD890', .14, 3);
  }
  const hx = ri(x) - 3; R(g, hx, y - 16, 4, 12, '#E8ECF8'); glow(g, hx - 2, y - 9, 14, '#FFFFFF', .7, 3);
}
function railTrack(g, y, t) {
  y = ri(y); R(g, 0, y, W, 4, '#2A2440'); R(g, 0, y, W, 1, '#4A4068'); R(g, 0, y + 4, W, 2, '#120E20');
  for (let x = 30; x < W; x += 90) { R(g, x, y + 6, 7, 120, '#1A1530'); R(g, x, y + 6, 1, 120, '#2E2850'); }
}
/* 楼顶的大屏：轮播"今夜 流星雨"（伏笔）和"栀子花香水"广告 */
function billboard(g, x, y, t) {
  x = ri(x); y = ri(y);
  R(g, x - 2, y - 2, 68, 40, '#0A0812'); R(g, x + 8, y + 38, 2, 12, '#2A2440'); R(g, x + 54, y + 38, 2, 12, '#2A2440');
  const k = fl(t / 3) % 2;
  if (k === 0) {
    vgrad(g, x, y, 64, 36, [[0, '#0A0A30'], [1, '#2A1A60']], 1);
    stars(g, t, { seed: 91, n: 18, x, y, w: 64, h: 36, a: .9, big: 0 });
    const u = mod(t, 3) / 3; meteor(g, t, fl(t / 3) * 3 + .2, x + 50, y + 4, -30, 16, { len: 10, dur: .8 });
    txt(g, '今夜', x + 4, y + 4, '#FFFFFF'); txt(g, '流星雨', x + 4, y + 20, '#FFE27A');
  } else {
    vgrad(g, x, y, 64, 36, [[0, '#F8F2E0'], [1, '#E6F2D8']], 1);
    gardenia(g, x + 48, y + 18, 9, { rot: t * .3 });
    txt(g, '栀子', x + 4, y + 4, '#2A4A2A'); tiny(g, 'NO.17', x + 4, y + 22, '#6A8A5A');
  }
  glow(g, x + 32, y + 18, 50, k ? '#FFF6D0' : '#6A60FF', .22, 3);
}
/* 街道：店面、路灯、车、人行道、湿地面的倒影；y 是店面招牌那一行 */
function street(g, t, y, o = {}) {
  y = ri(y); if (y > H + 10) return;
  const shopsY = y, walkY = y + 52, roadY = y + 62;
  // 店面：便利店（亮）、拉面馆（暖帘）、花店
  R(g, 0, shopsY, W, 52, '#140F24');
  shop(g, 20, shopsY + 8, 120, 44, '便利店', '#3FF0FF', '#E8FFFF', t);
  shop(g, 160, shopsY + 8, 100, 44, '拉面', '#FF6A3D', '#FFD8A0', t, { noren: true });
  shop(g, 280, shopsY + 8, 90, 44, '花店', '#FF4FA0', '#FFE0F0', t, { flowers: true });
  shop(g, 390, shopsY + 8, 100, 44, '照相馆', '#FFE14F', '#FFF6D0', t);
  // 人行道和马路
  R(g, 0, walkY, W, 10, '#2A2440'); R(g, 0, walkY, W, 1, '#4A4068');
  vgrad(g, 0, roadY, W, H - roadY + 40, [[0, '#1A1830'], [1, '#100E20']], 1);
  for (let x = mod(-t * 0, 40); x < W; x += 40) R(g, x, roadY + 40, 20, 2, '#5A5470');
  // 路灯
  [60, 300].forEach(lx => { R(g, lx, walkY - 70, 2, 70, '#2E2A40'); R(g, lx - 8, walkY - 72, 12, 3, '#3A3450'); R(g, lx - 6, walkY - 69, 8, 1, '#FFE6A8'); poly2(g, lx - 2, walkY - 68, 40, 70, '#FFD890', .13); glow(g, lx - 2, walkY - 68, 10, '#FFE6A8', .7, 3); });
  // 车：左右开过去，车灯拉出光
  if (!o.noCars) for (let i = 0; i < 3; i++) { const dir = i % 2 ? 1 : -1; car(g, dir > 0 ? mod(i * 190 + t * (90 + i * 20), W + 160) - 80 : W + 80 - mod(i * 190 + t * (90 + i * 20), W + 160), roadY + 18 + (i % 2) * 18, dir, ['#C8304A', '#3A6AC8', '#E8E8F0'][i], t); }
  // 倒影
  if (y + 62 < H) reflect(g, roadY, Math.min(80, H - roadY), t, { k: .45, tint: '#301848', tk: .3, amp: 2, broken: true });
}
function poly2(g, x, y, w, h, c, a) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = a; poly(g, [[x - 2, y], [x + 2, y], [x + w / 2, y + h], [x - w / 2, y + h]], c); g.restore(); }
function shop(g, x, y, w, h, name, nc, ic, t, o = {}) {
  R(g, x, y, w, h, '#1E1832');
  R(g, x + 4, y + 14, w - 8, h - 14, mix(ic, '#1E1832', .25));         // 亮着的玻璃门窗
  for (let k = 0; k < 4; k++) R(g, x + 8 + k * (w - 16) / 4, y + 18, (w - 16) / 4 - 3, 3, dk(ic, .3));
  for (let k = 0; k < 5; k++) R(g, x + 6 + k * (w - 12) / 5, y + 24, 2, h - 26, rgba('#FFFFFF', .25));
  if (o.noren) for (let k = 0; k < 5; k++) { R(g, x + 6 + k * (w - 12) / 5, y + 14, (w - 12) / 5 - 2, 10, '#2A3A7A'); R(g, x + 6 + k * (w - 12) / 5, y + 14, (w - 12) / 5 - 2, 1, '#4A5AAA'); }
  if (o.flowers) for (let k = 0; k < 9; k++) { const fx = x + 8 + k * 9, fy = y + h - 6; disc(g, fx, fy, 3, k % 3 ? '#FF7FB0' : '#FFFFFF'); R(g, fx, fy + 3, 1, 3, '#3E9A4E'); }
  R(g, x, y, w, 12, '#0E0A1A'); const on = neonOn(t, x);
  txt(g, name, x + w / 2, y, on ? lt(nc, .35) : dk(nc, .5), { align: 'c' });
  if (on) glow(g, x + w / 2, y + 6, w * .3, nc, .3, 3);
  sglow(g, x + w / 2, y + h - 10, w * .55, ic, .1);
}
function car(g, x, y, dir, col, t) {
  x = ri(x); y = ri(y);
  R(g, x, y - 8, 34, 8, col); R(g, x + 6, y - 14, 20, 6, dk(col, .2)); R(g, x + 8, y - 13, 7, 4, '#9AB8E8'); R(g, x + 17, y - 13, 7, 4, '#9AB8E8');
  R(g, x, y - 8, 34, 1, lt(col, .3)); R(g, x + 4, y, 6, 2, '#0A0A10'); R(g, x + 24, y, 6, 2, '#0A0A10');
  const fx = dir > 0 ? x + 34 : x - 1, bx = dir > 0 ? x - 1 : x + 34;
  R(g, fx, y - 6, 1, 2, '#FFFFFF'); glow(g, fx + dir * 6, y - 5, 10, '#FFF6D0', .45, 3);
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .18; poly(g, [[fx, y - 7], [fx, y - 3], [fx + dir * 60, y + 2], [fx + dir * 60, y - 12]], '#FFF2C0'); g.restore();
  R(g, bx, y - 6, 1, 2, '#FF2030'); glow(g, bx, y - 5, 6, '#FF2030', .5, 2);
}

/* ---------------- C1-1 摇下来：天空 → 楼群 → 街上撑透明伞的她 ---------------- */
function shCityCrane(g, t, u, s) {
  const camY = lerp(0, 350, E.io(seg(u, .1, 2.5)));
  cityNight(g, t, camY, { trainT: s.t - .2 });
  const fy = 512 - camY + 58;                               // 人行道上脚底那一行
  if (fy < H + 40) {
    for (let i = 0; i < 8; i++) {                           // 路人
      const dir = i % 2 ? 1 : -1, x = mod(i * 67 + t * 16 * dir, W + 40) - 20, wk = walk(t + i, 4);
      if (Math.abs(x - 250) < 20) continue;
      monAt(g, x, fy - 1 + wk.bob - (i % 3), 2, { col: CROWD[i % CROWD.length], legs: wk.legs, eyes: dir > 0 ? 'r' : 'l', ol: '#0E0A1E' });
      umbrella(g, x, fy - 34 - (i % 3), 12, { col: UMB[i % UMB.length], stick: 10 });
    }
    const hx = 250;                                          // 她：透明伞、干栀子花发夹
    monAt(g, hx, fy + 2, 3, { col: CL.her, clip: 'dry', arms: 'holdR', rim: ['#FF4FA0', 'l'], ol: '#0E0A1E', eyes: blinkAt(t, 3) ? 'blink' : 'up' });
    umbrella(g, hx + 14, fy - 50, 22, { stick: 24 });
  }
  rain(g, t, { n: 160, sp: 380, len: 6, sl: .18, col: 'rgba(170,190,255,.35)', seed: 3 });
  rain(g, t, { n: 60, sp: 520, len: 12, sl: .22, col: 'rgba(210,225,255,.55)', seed: 4 });
  if (fy < H + 40) splashes(g, t, { n: 40, y0: Math.max(fy - 4, 0), y1: Math.min(H, fy + 50) });
}

/* ---------------- 路口用的零件 ---------------- */
/* 红绿灯里的小人就是一只小怪（绿的时候走路） */
function pedSignal(g, x, y, green, t) {
  R(g, x, y, 2, 60, '#2A2640'); R(g, x - 6, y - 22, 14, 22, '#14121E'); R(g, x - 6, y - 22, 14, 1, '#3A3650');
  const c = green ? '#4CFF8A' : '#FF3A4A', wk = green ? (fl(t * 4) % 2 ? 1 : 2) : 0;
  blit(g, tint(smon12(wk), c), x - 5, y - 18); glow(g, x + 1, y - 13, 10, c, .45, 3);
}
function smon12(legs) {                                        // 1:1 的 12×8 小怪（红绿灯、远景）
  return cached('sm12:' + legs, 12, 8, g => {
    R(g, 2, 0, 8, 6, '#FFF'); R(g, 0, 2, 2, 2, '#FFF'); R(g, 10, 2, 2, 2, '#FFF');
    [[2, 1], [4, 2], [7, 1], [9, 2]].forEach(([x, grp]) => R(g, x, 6, 1, legs === grp ? 1 : 2, '#FFF'));
    g.clearRect(3, 1, 1, 1); g.clearRect(8, 1, 1, 1);
  });
}
/* 17 路公交：车身广告是栀子花（伏笔） */
function bus(g, x, y, t, o = {}) {
  x = ri(x); y = ri(y); const w = 200, h = 56;
  R(g, x, y - h, w, h, '#2E7A6A'); R(g, x, y - h, w, 3, '#4AA08E'); R(g, x, y - 8, w, 8, '#1E4A42');
  for (let k = 0; k < 8; k++) { const wx = x + 30 + k * 20; R(g, wx, y - h + 8, 16, 18, '#FFE6A8'); if (hash(k, 3) < .5) R(g, wx + 5, y - h + 15, 4, 11, '#2A2030'); R(g, wx, y - h + 8, 16, 2, '#FFF6D8'); }
  R(g, x + 4, y - h + 8, 20, 30, '#9FD8FF'); R(g, x + 6, y - h + 10, 16, 8, '#102030'); tiny(g, '17', x + 9, y - h + 11, '#FFB040');
  R(g, x + 40, y - 30, 120, 20, '#F4F0E0'); gardenia(g, x + 56, y - 20, 7); txt(g, '栀子花开', x + 70, y - 27, '#2E5A3A');
  R(g, x + 20, y - 4, 16, 6, '#0A0A10'); R(g, x + 160, y - 4, 16, 6, '#0A0A10');
  glow(g, x + 2, y - 14, 14, '#FFFFFF', .6, 3); glow(g, x + 100, y - h + 18, 90, '#FFD890', .12, 3);
}
/* 斑马线（横着的白条，雨里反光） */
function zebra(g, y, h, t) { for (let x = 0; x < W; x += 26) { R(g, x, y, 14, h, '#B8BCD0'); R(g, x, y, 14, 1, '#E8ECF8'); dith(g, x, y + 2, 14, h - 2, '#6A6A88', .3); } }

/* ---------------- C1-2 路口等灯：身后车流，绿灯一亮大家都走了，她还站着 ---------------- */
function shCrosswalk(g, t, u, s) {
  cityNight(g, t, 452, { noCars: true });                   // 对街：店面在 y 60~112
  const roadY = 122;
  vgrad(g, 0, roadY, W, 58, [[0, '#1E1A36'], [1, '#14122A']], 1);
  for (let x = 0; x < W; x += 30) { R(g, x + 6, roadY + 6, 16, 46, '#4A4A66'); R(g, x + 6, roadY + 6, 16, 1, '#8A8CA8'); dith(g, x + 6, roadY + 8, 16, 44, '#6A6A88', .3); }   // 斑马线（湿的，不太亮）
  const green = u > .95;
  if (u < 1.15) { car(g, lerp(-60, 520, seg(u, -.1, .9)), roadY + 30, 1, '#C8304A', t); car(g, lerp(540, -80, seg(u, .15, 1.15)), roadY + 46, -1, '#E8E8F0', t); }
  reflect(g, roadY, 56, t, { k: .42, tint: '#2A1848', tk: .3, amp: 1.5, broken: true });
  pedSignal(g, 60, 108, green, t); pedSignal(g, 420, 108, green, t);
  // 近处人行道
  R(g, 0, 178, W, 3, '#4A4068'); vgrad(g, 0, 181, W, H - 181, [[0, '#2A2444'], [1, '#1A1630']], 1);
  for (let x = 0; x < W; x += 24) R(g, x, 181, 1, H, '#221E3A');
  [[60, 196, '#FF4FA0'], [170, 214, '#FFD27A'], [330, 200, '#3FF0FF'], [420, 222, '#FF6A3D']].forEach(([px, py, c], i) => {   // 人行道上的水洼
    g.save(); g.globalAlpha = .3; ell(g, px, py, 26, 4, c); g.restore(); ell2(g, px, py, 26, 4, rgba(c, .5));
    const ru = mod(t * 1.4 + i * .3, 1); ell2(g, px + (i * 7 % 13) - 6, py, ru * 10, ru * 2, rgba('#FFFFFF', .7 * (1 - ru)));
  });
  // 等灯的人：绿灯后往对街走（往上）
  const go = Math.max(0, u - 1.0);
  for (let i = 0; i < 9; i++) {
    const x = 30 + i * 52 + (i % 2) * 8, row = i % 3, sc = 3, by = 200 + row * 10;
    if (Math.abs(x - 240) < 40) continue;
    const y = by - Math.min(go * (34 + i * 3), 120), wk = walk(t + i * .3, go > 0 ? 4 : 0, sc), back = go > 0;
    monAt(g, x, y + (go > 0 ? wk.bob : 0), sc, { col: CROWD[(i + 3) % CROWD.length], legs: go > 0 ? wk.legs : 0, eyes: back ? 'back' : (blinkAt(t, i) ? 'blink' : 'up'), ol: '#0E0A1E' });
    umbrella(g, x, y - 8 * sc - 20, 6 * sc + 3, { col: UMB[(i + 2) % UMB.length], stick: 8 * sc + 2 });
  }
  // 她：中间，透明伞，没走
  const hx = 240, hy = 224;
  monAt(g, hx, hy, 4, { col: CL.her, clip: 'dry', arms: 'holdR', rim: ['#3FF0FF', 'r'], ol: '#0E0A1E', eyes: blinkAt(t, 2) ? 'blink' : (u > 1.6 ? 'dn' : 'up'), legs: 0 });
  umbrella(g, hx + 18, hy - 78, 30, { stick: 36 });
  rain(g, t, { n: 140, sp: 400, len: 7, sl: .2, col: 'rgba(170,190,255,.35)', seed: 13 });
  rain(g, t, { n: 46, sp: 560, len: 14, sl: .24, col: 'rgba(220,230,255,.5)', seed: 14 });
  splashes(g, t, { n: 46, y0: 180, y1: 232 });
  R(g, 448, 0, 8, H, '#0A0814'); R(g, 448, 0, 1, H, rgba('#3FF0FF', .5)); R(g, 440, 150, 24, 30, '#0A0814'); R(g, 443, 154, 18, 10, '#FFE14F'); tiny(g, 'BUS', 446, 157, '#3A2A10');   // 前景的站牌
}

/* ---------------- C1-3 对街撑黄伞的他（翘毛）：转身走进人群，17 路公交开过去，人就不见了 ---------------- */
function shHimAcross(g, t, u, s) {
  cityNight(g, t, 436, { noCars: true });                   // 对街人行道在 y≈134
  const fy = 136;
  const turn = u > 1.0, gone = u > 2.05, wx = 300 + Math.max(0, u - 1.2) * 34;
  for (let i = 0; i < 8; i++) {                                // 对街的人群
    const dir = i % 2 ? 1 : -1, x = mod(i * 63 + t * 14 * dir, W + 40) - 20, wk = walk(t + i, 4);
    if (Math.abs(x - wx) < 20 && !gone) continue;
    monAt(g, x, fy - 2 + (i % 2), 2, { col: CROWD[i % CROWD.length], legs: wk.legs, eyes: dir > 0 ? 'r' : 'l', ol: '#0E0A1E' });
    umbrella(g, x, fy - 36 + (i % 2), 12, { col: UMB[[1, 3, 4, 6, 7, 8, 9, 0][i]], stick: 10 });
  }
  if (!gone) {
    const wk = walk(t, u > 1.2 ? 4 : 0, 3);
    monAt(g, wx, fy + (u > 1.2 ? wk.bob : 0), 3, { col: CL.him, cowlick: true, eyes: turn ? 'back' : (blinkAt(t, 8) ? 'blink' : 'l'), legs: u > 1.2 ? wk.legs : 0, ol: '#0E0A1E', rim: ['#FFE14F', 'l'] });
    umbrella(g, wx - 2, fy - 48, 19, { col: '#F2C94C', stick: 16 });
  }
  for (let i = 0; i < 2; i++) car(g, i ? W + 80 - mod(t * 120 + 200, W + 160) : mod(t * 100, W + 160) - 80, 176 + i * 16, i ? -1 : 1, ['#3A6AC8', '#C8304A'][i], t);
  const bx = lerp(-260, 520, seg(u, 1.55, 2.6));              // 17 路公交
  if (u > 1.5 && u < 2.65) bus(g, bx, 196, t);
  // 近处人行道 + 她的背影（左下）+ 伞柄和伞边
  R(g, 0, 214, W, 2, '#4A4068'); vgrad(g, 0, 216, W, H - 216, [[0, '#2A2444'], [1, '#1A1630']], 1);
  monFX(g, 92, 280, 6, { col: CL.her, eyes: 'back', clip: 'dry', arms: 'holdR', rim: ['#FF4FA0', 'l'], k: .8, ol: '#0A0818' }, { t, drops: 5 });
  R(g, 134, 60, 2, 170, '#C8D0E0'); R(g, 134, 60, 1, 170, '#F0F4FF');
  for (let x = -40; x < 300; x++) { const y = 54 - Math.pow((x - 130) / 170, 2) * 60; if (y > -2) P(g, x, y, rgba('#EAF6FF', .55)); }
  for (let i = 0; i < 20; i++) { const x = hash(i, 5) * 300 - 30, y0 = 54 - Math.pow((x - 130) / 170, 2) * 60, y = y0 + 1 + mod(t * 3 + i, 4); if (y > 0) { R(g, x, y, 2, 2, rgba('#FFFFFF', .8)); R(g, x, y + 2, 1, 1, rgba('#A8D8FF', .6)); } }
  rain(g, t, { n: 150, sp: 420, len: 8, sl: .2, col: 'rgba(190,205,255,.4)', seed: 23 });
  rain(g, t, { n: 26, sp: 600, len: 18, sl: .25, col: 'rgba(230,238,255,.55)', seed: 24 });
  splashes(g, t, { n: 30, y0: 216, y1: 270 });
}

/* ---------------- 伞的俯视 ---------------- */
function umbTop(g, x, y, r, col, o = {}) {
  x = ri(x); y = ri(y);
  const clear = !col;
  if (clear) {
    if (o.under) o.under(g, x, y);
    g.save(); g.globalAlpha = .4; disc(g, x, y, r, '#CFE8FF'); g.restore(); ring(g, x, y, r, rgba('#FFFFFF', .7));
  } else {
    disc(g, x + 2, y + 3, r, rgba('#05040C', .45));                          // 影子
    disc(g, x, y, r, dk(col, .18));
    for (let k = 0; k < 8; k++) {                                            // 八片伞面，一片亮一片暗
      if (k % 2) continue; const a0 = k / 8 * TAU + (o.rot || 0), a1 = (k + 1) / 8 * TAU + (o.rot || 0);
      poly(g, [[x, y], [x + Math.cos(a0) * r, y + Math.sin(a0) * r], [x + Math.cos((a0 + a1) / 2) * r * 1.02, y + Math.sin((a0 + a1) / 2) * r * 1.02], [x + Math.cos(a1) * r, y + Math.sin(a1) * r]], col);
    }
    ring(g, x, y, r, dk(col, .35)); disc(g, x - r * .3, y - r * .35, Math.max(1, r * .22), rgba('#FFFFFF', .22));
  }
  for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + (o.rot || 0); line(g, x, y, x + Math.cos(a) * r, y + Math.sin(a) * r, rgba(clear ? '#FFFFFF' : dk(col || '#888888', .4), .5)); }
  R(g, x - 1, y - 1, 2, 2, '#2A2A38');
}
/* ---------------- C1-4 俯拍伞海：黄伞往上走，挤进人群，没了；她的透明伞停在中间 ---------------- */
function shUmbrellaSea(g, t, u, s) {
  vgrad(g, 0, 0, W, H, [[0, '#1A1830'], [1, '#141226']], 1);
  zebra2(g, t);
  for (let i = 0; i < 14; i++) {                               // 地上的水洼：倒映着霓虹，雨点打出圈
    const x = hash(i, 81) * W, y = hash(i, 82) * H, r = 8 + hash(i, 83) * 14, c = NEONC[i % NEONC.length];
    g.save(); g.globalAlpha = .28; ell(g, x, y, r, r * .55, c); g.restore();
    const ru = mod(t * 1.3 + i * .37, 1); ring2e(g, x, y, ru * r * .8, rgba('#E0F0FF', .6 * (1 - ru)));
  }
  const drift = u * 6;
  for (let i = 0; i < 46; i++) {                               // 人群：两股往上、往下的伞
    const lane = i % 2, sp = (14 + hash(i, 91) * 10) * (lane ? 1 : -1), r = 13 + fl(hash(i, 92) * 6);
    const x = hash(i, 93) * (W + 40) - 20 + Math.sin(t + i) * 2, y = mod(hash(i, 94) * (H + 80) + t * sp, H + 80) - 40 - drift;
    if (Math.hypot(x - 240, y - 128) < 34) continue;
    umbTop(g, x, y, r, UMB[[0, 1, 3, 4, 6, 7, 8, 9][i % 8]], { rot: i * .3 });
  }
  // 黄伞：从中间往上，慢慢被别的伞盖住
  const yy = lerp(150, -30, E.in2(seg(u, .2, 2.6))), yx = 250 + Math.sin(u * 2) * 10;
  if (u < 2.7) umbTop(g, yx, yy, 16, '#F2C94C', { rot: .2 });
  for (let i = 0; i < 6; i++) { const x = yx + (i - 2.5) * 22, y = yy - 30 - i * 6 + Math.sin(t + i) * 3; if (u > 1.2) umbTop(g, x, y + lerp(60, 0, seg(u, 1.2, 2.2)), 15, UMB[[0, 1, 3, 4, 6, 7][i]], { rot: i }); }
  // 她：透明伞，看得见底下的小怪（俯视就是个橙色方块）
  glow(g, 240, 128, 40, '#FFFFFF', .18, 4);
  umbTop(g, 240, 128, 30, null, { under: (q, x, y) => { R(q, x - 8, y - 6, 16, 12, CL.her); R(q, x - 8, y - 6, 16, 2, lt(CL.her, .3)); R(q, x - 10, y - 4, 2, 4, CL.her); R(q, x + 8, y - 4, 2, 4, CL.her); gardenia(q, x - 5, y - 6, 3, { dry: true }); } });
  rain(g, t, { n: 120, sp: 160, len: 2, sl: 0, col: 'rgba(200,215,255,.4)', seed: 31 });
}
function zebra2(g, t) { for (let y = 20; y < H; y += 30) { R(g, 0, y, W, 14, '#3A3A54'); dith(g, 0, y, W, 14, '#6A6A88', .5); } }
function ring2e(g, x, y, r, c) { if (r < 1) return; ell2(g, x, y, r, r * .5, c); }
function ell2(g, cx, cy, rx, ry, c) { g.fillStyle = c; for (let a = 0; a < TAU; a += 1 / Math.max(4, rx)) g.fillRect(ri(cx + Math.cos(a) * rx), ri(cy + Math.sin(a) * ry), 1, 1); }

/* ---------------- C1-5 她的特写：透明伞下，霓虹打在身上，眼泪 ---------------- */
function shHerRainClose(g, t, u, s) {
  vgrad(g, 0, 0, W, H, [[0, '#100C2C'], [.55, '#26144A'], [1, '#3A1A48']], 1);
  bokeh(g, t, { n: 18, seed: 41, rmin: 8, rmax: 24, a: .22, cols: ['#FF4FA0', '#3FF0FF', '#FFD27A', '#B66CFF'], vx: 3, h: 200 });
  for (let i = 0; i < 4; i++) { const x = 40 + i * 120, c = NEONC[i]; g.save(); g.globalAlpha = .18; R(g, x, 30 + i * 9, 8, 60, c); g.restore(); glow(g, x + 4, 60 + i * 9, 30, c, .12, 4); }  // 焦外的竖招牌
  rain(g, t, { n: 90, sp: 300, len: 6, sl: .15, col: 'rgba(170,190,255,.28)', seed: 51 });
  // 透明伞：从上往下看是伞的内面，伞骨散开，伞面雨珠往下滚
  const ux = 262, uy = -70;
  g.save(); g.globalAlpha = .26; ell(g, ux, uy + 70, 250, 80, '#CFE8FF'); g.restore();
  for (let k = -4; k <= 4; k++) line(g, ux, uy, ux + k * 62, uy + 150 - Math.abs(k) * 8, rgba('#FFFFFF', .32));
  ell2(g, ux, uy + 70, 250, 80, rgba('#EAF6FF', .5));
  for (let i = 0; i < 46; i++) {
    const x = hash(i, 7) * W, y0 = hash(i, 8) * 140, y = y0 + mod(t * (1 + hash(i, 9) * 3) + i, 10);
    if ((x - ux) ** 2 / 62500 + (y - uy - 70) ** 2 / 6400 > 1) continue;
    R(g, x, y, 2, 2, rgba('#FFFFFF', .75)); R(g, x + 1, y + 2, 1, 1, rgba('#9FD8FF', .8));
  }
  R(g, ux, uy + 150, 2, 200, '#C8D0E0');                      // 伞柄
  // 她（一格 8 像素），抬着眼，眼泪下来
  const tear = seg(u, .7, 1.9);
  monFX(g, 220, 226, 8, { col: CL.her, clip: 'dry', arms: 'holdR', rim: ['#FF4FA0', 'l'], eyes: u < .6 && blinkAt(t, 5) ? 'blink' : 'up', refl: ['#FF4FA0', '#3FF0FF'], tear, k: .95, ol: '#0A0818' },
    { t, drops: 7, sweep: ['#3FF0FF', mod(t * .45, 1.4), 18, .28] });
  for (let i = 0; i < 5; i++) {                              // 镜头前的大雨珠（焦外）
    const x = [30, 420, 80, 380, 450][i], y = [40, 30, 200, 190, 120][i], r = [14, 18, 10, 12, 8][i];
    g.save(); g.globalAlpha = .16; disc(g, x, y, r, '#BFE0FF'); g.restore(); ring(g, x, y, r, rgba('#FFFFFF', .35)); R(g, x - r * .4, y - r * .5, 3, 2, rgba('#FFFFFF', .6));
  }
  sglow(g, 30, 150, 150, '#FF4FA0', .16); sglow(g, 460, 110, 150, '#3FF0FF', .12);
  rain(g, t, { n: 22, sp: 620, len: 22, sl: .2, col: 'rgba(230,238,255,.45)', seed: 52 });
}

/* ---------------- C1-6 夜车：窗外灯一道道掠过，窗上雨痕斜着走；车窗倒影里是十七岁的她（伏笔）；屏幕"下一站：仲夏" ---------------- */
function ledText(g, s, x, y, w, t, c = '#FF5A3A') {           // 车厢里的红色 LED 走字
  R(g, x, y, w, 14, '#140608');
  const q = layer('led', w, 12); q.fillStyle = '#000'; const tw = textW(s) + 30, off = mod(t * 26, tw);
  txt(q, s, w - off, 0, c); txt(q, s, w - off + tw, 0, c);
  g.drawImage(LAYER.led, x, y + 1);
  for (let yy = y + 1; yy < y + 13; yy += 2) R(g, x, yy, w, 1, 'rgba(20,6,8,.35)');
  glow(g, x + w / 2, y + 7, w * .45, c, .14, 4);
}
function shTrainRide(g, t, u, s) {
  // 窗外：中景的楼飞快往左（拖影），近处的灯柱更快
  vgrad(g, 0, 0, W, H, [[0, '#0C0A22'], [.5, '#2A1A4E'], [1, '#4A2058']], 1);
  const CP = cityParts(), off = mod(t * 120, 560);
  drawCity(g, CP.far, -mod(t * 40, 520), -30, t); drawCity(g, CP.far, -mod(t * 40, 520) + 520, -30, t);
  g.save(); for (let k = 3; k >= 0; k--) { g.globalAlpha = k ? .22 : 1; drawCity(g, CP.mid, -off + k * 6, -130, t); drawCity(g, CP.mid, -off + 560 + k * 6, -130, t); } g.restore();
  for (let i = 0; i < 7; i++) { const x = mod(i * 97 - t * 300, W + 100) - 50; R(g, x, 46, 4, 110, '#0A0814'); glow(g, x + 2, 60, 20, '#FFB060', .55, 5); }
  for (let i = 0; i < 6; i++) { const x = mod(i * 151 - t * 500, W + 300) - 150; g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .35; R(g, x, 80 + i * 11, 90 + i * 10, 1, NEONC[i]); g.restore(); }
  // 车厢：上面行李架、广告，下面座位；窗框
  const winY = 46, winH = 104;
  vgrad(g, 0, 0, W, winY, [[0, '#9AA0B8'], [1, '#6A7090']], 1); R(g, 0, winY - 6, W, 6, '#5A6080'); R(g, 0, 2, W, 2, '#E8F0FF'); glow(g, 240, 3, 120, '#C8E0FF', .12, 6);
  ledText(g, '下一站：仲夏　Next: Midsummer　', 150, 10, 180, t);
  R(g, 20, 8, 110, 30, '#F4F0E0'); gardenia(g, 38, 23, 8); txt(g, '栀子花香', 52, 10, '#2E5A3A'); tiny(g, 'NO.17', 56, 26, '#6A8A5A');
  R(g, 350, 8, 110, 30, '#2A2A5A'); txt(g, '今夜流星雨', 358, 10, '#FFE27A'); stars(g, t, { seed: 5, n: 10, x: 352, y: 24, w: 100, h: 12, big: 0 }); meteor(g, t, fl(t / 2) * 2 + .3, 440, 25, -30, 8, { len: 8, dur: .6 });
  for (let x = 0; x < W; x += 160) { R(g, x, winY, 10, winH, '#5A6080'); R(g, x + 1, winY, 2, winH, '#8A90A8'); }
  R(g, 0, winY + winH, W, 10, '#5A6080'); R(g, 0, winY + winH, W, 1, '#9AA0B8');
  // 窗上的雨痕：斜着往后走
  for (let i = 0; i < 40; i++) {
    const per = 1 + hash(i, 3) * 2, k = fl((t + hash(i, 4) * per) / per), v = mod(t + hash(i, 4) * per, per) / per;
    const x0 = hash(i + k * 77, 5) * W, y0 = winY + hash(i + k * 77, 6) * winH * .6, x = x0 - v * 60, y = y0 + v * 30;
    if (y > winY + winH - 2) continue;
    R(g, x, y, 2, 2, rgba('#E8F4FF', .75)); for (let j = 1; j < 8; j++) P(g, x + j * 2, y - j, rgba('#C8E0FF', .3 - j * .03));
  }
  // 车窗倒影：十七岁的她（蓝裙、新鲜的栀子花），淡淡的
  g.save(); g.globalAlpha = .22 + .08 * Math.sin(t * 2); monAt(g, 200, 150, 5, { col: CL.her, skirt: true, clip: 'fresh', eyes: 'r' }); g.restore();
  // 座位和地板
  vgrad(g, 0, winY + winH + 10, W, H, [[0, '#3A3E58'], [1, '#16182A']], 1);
  R(g, 0, 176, W, 30, '#2A4478'); R(g, 0, 176, W, 2, '#4A64A0'); for (let x = 0; x < W; x += 60) R(g, x, 176, 2, 30, '#1E3460');
  // 车厢里的人：睡着点头的、看手机的
  monAt(g, 70, 200 + (Math.sin(t * 1.6) > .7 ? 1 : 0), 4, { col: '#8E7FB8', eyes: 'shut', legs: 'tuck', ol: '#1A1A2A' });
  tiny(g, 'Z', 92, 150 - ri(mod(t, 2) * 3), '#C8D0FF');
  monAt(g, 400, 200, 4, { col: '#7FA88E', eyes: 'dn', legs: 'tuck', arms: 'holdR', ol: '#1A1A2A' });
  R(g, 420, 166, 6, 9, '#202030'); R(g, 421, 167, 4, 7, '#9FD8FF'); glow(g, 423, 170, 10, '#9FD8FF', .4, 3);
  // 她：靠窗坐，一只耳机挂着（伏笔：以前两个人一人一只）
  const tear = seg(u, 2.5, 4.2);
  monAt(g, 240, 200, 5, { col: CL.her, clip: 'dry', eyes: blinkAt(t, 4) ? 'blink' : 'l', legs: 'tuck', tear: tear * .8, ol: '#1A1A2A', rim: ['#FFC060', 'l'] });
  R(g, 260, 162, 2, 2, '#FFFFFF'); line(g, 262, 164, 268, 186, '#E8E8F0'); R(g, 266, 186, 3, 3, '#FFFFFF');
  // 吊环一排，跟着车晃
  for (let x = 30; x < W; x += 52) { const sw = ri(Math.sin(t * 2.4 + x * .02) * 2); line(g, x, 40, x + sw, 58, '#8A90A8'); ring(g, x + sw, 62, 4, '#E8ECF4'); }
  // 掠过车厢的灯光（一道一道从右往左扫）
  const sw = mod(t * 1.4, 1);
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .1; poly(g, [[W - sw * 900, 40], [W - sw * 900 + 70, 40], [W - sw * 900 + 30, H], [W - sw * 900 - 40, H]], '#FFC070'); g.restore();
}

/* ---------------- C1-7 她的房间：窗外雨夜和远处的轻轨，桌上干栀子花、撕了一半的照片、纸鹤；窗台上睡着的猫 ---------------- */
function roomBase(g, t, o = {}) {
  const night = o.night !== false, wallC = night ? '#2A2448' : '#E8D8C0';
  R(g, 0, 0, W, H, wallC);
  for (let x = 0; x < W; x += 12) R(g, x, 0, 1, 196, night ? '#2E2850' : '#E0D0B6');                // 墙纸竖纹
  for (let y = 10; y < 196; y += 24) for (let x = (y / 24 % 2) * 6; x < W; x += 12) P(g, x + 3, y, night ? '#3A3460' : '#D6C4A8');
  // 窗：外面是城市
  const wx = 150, wy = 26, ww = 200, wh = 120;
  const q = layer('win', ww, wh);
  if (night) {
    q.drawImage(skyC('night2', W, 300, NIGHT_SKY, .55), -100, -40);
    const CP = cityParts(); drawCity(q, CP.far, -80, -80, t); drawCity(q, CP.mid, -160, -150, t);
    railTrack(q, 92, t); lightRail(q, ww + 40 - mod(t - 2, 7) * 100, 92, t, { cars: 3 });
    rain(q, t, { n: 50, sp: 300, len: 5, sl: .15, col: 'rgba(190,205,255,.4)', w: ww, h: wh, seed: 71 });
  } else o.view && o.view(q, t, ww, wh);
  g.drawImage(LAYER.win, wx, wy);
  if (night) for (let i = 0; i < 24; i++) {                  // 玻璃上的雨珠
    const per = 2 + hash(i, 3) * 3, k = fl((t + hash(i, 4) * per) / per), v = mod(t + hash(i, 4) * per, per) / per;
    const x = wx + hash(i + k * 31, 5) * ww, y = wy + hash(i + k * 31, 6) * wh * .5 + v * v * wh * .6;
    if (y < wy + wh - 2) { R(g, x, y, 2, 2, rgba('#E8F4FF', .7)); R(g, x, y - 3, 1, 3, rgba('#C8E0FF', .3)); }
  }
  R(g, wx - 6, wy - 6, ww + 12, 6, '#5A4636'); R(g, wx - 6, wy + wh, ww + 12, 8, '#6A5444'); R(g, wx - 6, wy + wh, ww + 12, 2, '#8A7058');
  R(g, wx - 6, wy - 6, 6, wh + 14, '#5A4636'); R(g, wx + ww, wy - 6, 6, wh + 14, '#5A4636'); R(g, wx + ww / 2 - 2, wy, 4, wh, '#5A4636');
  // 窗帘
  for (let k = 0; k < 2; k++) { const cx = k ? wx + ww + 4 : wx - 34, sw = ri(Math.sin(t * .8 + k) * 1.5); for (let j = 0; j < 30; j++) R(g, cx + j + (j > 20 ? sw : 0), wy - 10, 1, wh + 40 - (j % 5 === 0 ? 2 : 0), j % 6 < 3 ? '#7A4A6A' : '#6A3E5E'); }
  // 窗框上的小灯串
  for (let i = 0; i < 18; i++) { const x = wx - 8 + i * 12, y = wy - 10 + Math.sin(i / 17 * PI) * 6, on = Math.sin(t * 2 + i * 1.1) > -.5, c = ['#FFD27A', '#FF9AB8', '#9FE0FF'][i % 3]; R(g, x, y, 2, 2, on ? c : dk(c, .5)); if (on) glow(g, x + 1, y + 1, 5, c, .45, 2); }
  // 书架（左）
  R(g, 20, 40, 100, 150, '#4A3628'); for (let sy2 = 0; sy2 < 4; sy2++) {
    const y = 48 + sy2 * 36; R(g, 24, y + 30, 92, 3, '#6A4E38');
    let x = 26; for (let b = 0; x < 110; b++) { const bw = 3 + fl(hash(b, sy2) * 4), bh = 18 + fl(hash(b, sy2 + 9) * 10), c = ['#C85A5A', '#5A8AC8', '#E8C860', '#6AA87A', '#A87AC8', '#E8E0D0'][fl(hash(b, sy2 + 3) * 6)]; R(g, x, y + 30 - bh, bw, bh, c); R(g, x, y + 30 - bh, 1, bh, lt(c, .3)); x += bw + (hash(b, sy2 + 5) > .8 ? 4 : 0); }
  }
  disc(g, 104, 36, 7, '#3E9A4E'); R(g, 100, 40, 8, 6, '#A0603A');                   // 书架顶上的小盆栽
  // 墙上：挂历（7 月，17 号画了圈）、钟、海报
  R(g, 380, 36, 44, 52, '#F4F0E8'); R(g, 380, 36, 44, 10, '#D84A4A'); tiny(g, 'JUL', 393, 39, '#FFFFFF');
  for (let d = 0; d < 28; d++) R(g, 384 + (d % 7) * 5 + 1, 50 + fl(d / 7) * 8, 3, 3, '#B8B4C0');
  ring(g, 384 + 2 * 5 + 2, 50 + 2 * 8 + 1, 4, '#E84A5A'); tiny(g, '17', 384 + 2 * 5, 50 + 2 * 8 - 1, '#E84A5A');
  disc(g, 400, 112, 10, '#F4F0E8'); ring(g, 400, 112, 10, '#5A4636'); const ha = t * .1, ma = t * 1.2; line(g, 400, 112, 400 + Math.cos(ha) * 5, 112 + Math.sin(ha) * 5, '#2A2030'); line(g, 400, 112, 400 + Math.cos(ma) * 8, 112 + Math.sin(ma) * 8, '#2A2030');
  // 桌子 + 台灯
  R(g, 0, 196, W, 74, night ? '#3A2A40' : '#B89878');                                // 地板
  R(g, 130, 150, 260, 8, '#8A6A50'); R(g, 130, 150, 260, 2, '#A88868'); R(g, 140, 158, 6, 60, '#6A4E3A'); R(g, 374, 158, 6, 60, '#6A4E3A');
  R(g, 340, 112, 4, 38, '#3A3A48'); poly(g, [[326, 112], [358, 112], [350, 98], [334, 98]], '#E8C060'); R(g, 334, 148, 18, 3, '#3A3A48');
  if (night) { g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .16; poly(g, [[328, 112], [356, 112], [400, 150], [270, 150]], '#FFD890'); g.restore(); glow(g, 342, 120, 60, '#FFC870', .25, 6); }
  // 桌上：玻璃瓶里的干栀子花、照片、纸鹤、杯子冒热气
  R(g, 160, 128, 12, 22, rgba('#CFE8FF', .35)); R(g, 160, 128, 1, 22, rgba('#FFFFFF', .6)); R(g, 165, 116, 1, 14, '#6A7A4A');
  gardenia(g, 166, 114, 6, { dry: true, rot: .5 });
  photoProp(g, 230, 140, t, { half: 'her' });
  paperCrane(g, 300, 140);
  R(g, 196, 136, 10, 14, '#E8E0D8'); R(g, 206, 140, 3, 6, '#E8E0D8');
  for (let k = 0; k < 3; k++) { const y = 132 - mod(t * 8 + k * 4, 14), x = 200 + k * 2 + ri(Math.sin(t * 3 + k + y * .3) * 1.5); P(g, x, y, rgba('#FFFFFF', .4 * (1 - (132 - y) / 14))); }
  // 窗台上的猫（睡）
  cat(g, 300, wy + wh - 8, 'sleep', t);
  if (night) { g.save(); g.globalCompositeOperation = 'lighter'; const sw = mod(t * .35, 1); g.globalAlpha = .08 * Math.sin(sw * PI); poly(g, [[sw * 600 - 100, 0], [sw * 600 - 40, 0], [sw * 600 + 60, 196], [sw * 600 - 20, 196]], '#9FB8FF'); g.restore(); }   // 车灯扫过天花板
}
/* 桌上的照片：half 'her'（撕掉了他那一半）| 'him' | 'both' */
function photoProp(g, x, y, t, o = {}) {
  const w = o.w || 34, h = o.h || 26;
  R(g, x, y - h, w, h, '#F4F0E8'); R(g, x + 2, y - h + 2, w - 4, h - 7, '#8AC8E8');
  R(g, x + 2, y - 9, w - 4, 4, '#6AB06A');
  disc(g, x + w * .7, y - h + 8, 5, '#3E8A4E'); P(g, x + w * .7, y - h + 6, '#FFFFFF');
  R(g, x + 6, y - 14, 8, 6, CL.her); R(g, x + 6, y - 14, 8, 1, lt(CL.her, .3)); R(g, x + 6, y - 11, 8, 2, SKIRT[1]);
  if (o.half === 'her') for (let yy = y - h; yy < y; yy++) { const e = x + w - 9 + ri(Math.sin(yy * 1.7) * 2); R(g, e, yy, x + w - e + 1, 1, o.bg || '#8A6A50'); P(g, e - 1, yy, '#FFFFFF'); }
  else { R(g, x + w - 14, y - 14, 8, 6, CL.him); P(g, x + w - 9, y - 15, CL.him); }
}
function paperCrane(g, x, y) { poly(g, [[x, y], [x + 8, y - 6], [x + 16, y], [x + 8, y - 2]], '#F4F0F8'); poly(g, [[x + 8, y - 6], [x + 12, y - 12], [x + 10, y - 3]], '#E0DCEC'); P(g, x + 16, y - 1, '#F4F0F8'); P(g, x + 17, y - 2, '#F4F0F8'); }
function shRoomNight(g, t, u, s) {
  roomBase(g, t);
  // 她：进来，坐到桌前，拿起照片
  const sit = u > 1.4, x = sit ? 236 : lerp(470, 240, E.io(seg(u, 0, 1.4)));
  const wk = walk(t, sit ? 0 : 4, 5);
  monAt(g, x, sit ? 196 : 200 + wk.bob, 5, { col: CL.her, clip: 'dry', eyes: sit ? 'dn' : 'l', legs: sit ? 'tuck' : wk.legs, arms: sit && u > 2.2 ? 'reachL' : 'n', ol: '#1A1428', rim: ['#FFC870', 'r'] });
  R(g, 380, 150, 26, 4, '#2A2030');                         // 钥匙放桌上
  glow(g, 342, 130, 120, '#FFB060', .1, 6);
}
/* ---------------- C1-8 照片特写：只剩她的那一半；照片里的花瓣动起来，飘出来，白光 → 回忆 ---------------- */
function shPhotoInsert(g, t, u, s) {
  R(g, 0, 0, W, H, '#5A3E30');
  for (let y = 0; y < H; y += 6) R(g, 0, y, W, 1, '#664838');                  // 木纹桌面
  for (let i = 0; i < 30; i++) R(g, hash(i, 1) * W, hash(i, 2) * H, 20 + hash(i, 3) * 40, 1, '#6E5040');
  glow(g, 300, 60, 200, '#FFB060', .18, 8);
  // 照片：大
  const px = 120, py = 30, pw = 240, ph = 190;
  R(g, px + 6, py + 6, pw, ph, 'rgba(20,10,10,.4)'); R(g, px, py, pw, ph, '#F4F0E8');
  const q = layer('photo', pw - 20, ph - 44);
  photoScene(q, t, pw - 20, ph - 44, Math.max(0, u - 1.5));
  g.drawImage(LAYER.photo, px + 10, py + 10);
  tiny(g, "'09 7 17", px + 100, py + ph - 52, '#FF8A2A'); glow(g, px + 116, py + ph - 50, 14, '#FF8A2A', .45, 2);   // 胶片日期戳
  for (let yy = py - 2; yy < py + ph + 2; yy++) { const e = px + pw - 70 + ri(Math.sin(yy * .9) * 3 + Math.sin(yy * .23) * 4); R(g, e, yy, px + pw - e + 8, 1, '#5A3E30'); P(g, e - 1, yy, '#FFFFFF'); P(g, e - 2, yy, '#E8E4D8'); }  // 撕开的毛边
  // 她的手指（两块橙色）捏着照片
  R(g, px - 30, py + 128, 40, 20, CL.her); R(g, px - 30, py + 128, 40, 3, lt(CL.her, .3)); R(g, px - 30, py + 145, 40, 3, dk(CL.her, .25));   // 她的一节"手"捏着照片
  // 花瓣从照片里飘出来，越来越多，最后白光
  const k = seg(u, 1.6, 3.2);
  if (k > 0) { petals(g, t, { n: fl(60 * k), x: 0, y: 0, w: W, h: H, sp: 30, wind: -16, seed: 9, big: true }); glow(g, px + 80, py + 90, 60 + 200 * k, '#FFF6D8', .5 * k, 8); }
}
/* 照片里的画面：栀子花树下的她（十七岁），t2 > 0 以后花瓣开始落 */
function photoScene(q, t, w, h, t2) {
  vgrad(q, 0, 0, w, h, [[0, '#7EC8F0'], [1, '#CFEAF8']], 1);
  blit(q, cloudSpr(3, 90, 26, ['#CFE0F0', '#E8F2FA', '#FFFFFF', '#FFFFFF']), 20 + ri(t2 * 3), 10);
  R(q, 0, h - 30, w, 30, '#6AB06A'); grass(q, 0, w, h - 30, t, { h: 4 });
  tree(q, 70, h - 28, { s: .8, flowers: 6, seed: 4 }, t2 > 0 ? t : 0);
  monAt(q, 110, h - 12, 4, { col: CL.her, skirt: true, clip: 'fresh', eyes: 'happy', blush: .6 });
  if (t2 > 0) petals(q, t, { n: 16, w, h, sp: 18, wind: 6, seed: 4 });
}
