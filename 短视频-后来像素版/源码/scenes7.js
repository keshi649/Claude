'use strict';
/* scenes7.js：副歌：天亮了（242.75~269.20）+ 结尾（269.20~282.07）+ 尾奏（282.07~315.49）
   shSunrise      "后来"：上一个镜头剩下的亮点，变成城市上空升起的太阳
   shSchoolDawn   "我总算学会了如何去爱"：清早，她回到母校门口，那丛栀子还在，开着花；她笑了
   shOldBench     "可惜你早已远去"：那张长椅还在，漆掉了一些；她坐在一边，旁边空着
   shNewGeneration "消失在人海"：上学的学生一群群走过去，里面有一对：蓝裙子的女孩和带呆毛的男孩，说说笑笑
   shSmileTear    "后来"：她笑着，眼里有泪
   shTearSun      "终于在眼泪中明白"：一滴泪在晨光里一闪，落在掌机上，屏幕自己亮了：那年夏夜的存档
   shLeaveIt      "有些人一旦错过就不再"：她坐在长椅上，看着亮着的掌机，笑了；天越来越亮
   shBatteryDie   "永远不会再重来"：电量的红灯一闪一闪，画面一格格暗下去，电源灯灭了
   shBoyLoves     "有一个男孩爱着那个女孩"：那年夏夜，她抬头看星星，他转过头看着她；一颗心升起来，飞上天变成一颗星
   shRiseSky      尾奏：镜头升上去，银河、流星，那颗星和两个小怪的星座连在一起
   shWalkOn       尾奏：早晨，她走在开满栀子的路上，回头看了一眼，笑着往前走
   shEnd          尾奏：星空，片名"后来"由星星拼出来，片尾字，淡到黑 */

/* ================= shSunrise：亮点变成太阳（242.75 ~ 244.75） ================= */
const DAWN_SKY = [[0, '#2A2A66'], [.35, '#6A4A8A'], [.62, '#E8807A'], [.85, '#FFB880'], [1, '#FFE0A8']];
function dawnCity(b, gl, t, w, h, sunY, o = {}) {
  psky(b, w, h, DAWN_SKY);
  b.save(); b.globalAlpha = .6; starfield(b, t, w, h * .3, { n: 20, seed: 271, tw: .5 }); b.restore();
  pdisc(b, w / 2, sunY, 9, '#FFF2C8'); pdisc(gl, w / 2, sunY, 16, rgba('#FFE0A0', .9)); pglow(b, w / 2, sunY, 40, '#FFB070', .5);
  for (let i = 0; i < 4; i++) { const cx = mod(40 + i * 90 + t * 3, w + 80) - 40, cy = 40 + i * 9; pell(b, cx, cy, 26, 3, '#F4A8A0'); pell(b, cx + 6, cy - 1, 14, 2, '#FFD0B8'); }
  pspr(b, skyline(w, 80, 272, '#4A3058', 60, .06, { wins: ['#FFD27A'] }), 0, h - 80 - 14);
  pspr(b, skyline(w, 70, 273, '#2E2040', 46, .1, { wins: ['#FFD27A', '#FFE8B0'] }), 0, h - 70);
  // 飞过的鸟
  for (let i = 0; i < 5; i++) { const x = mod(60 + i * 18 + t * 14, w + 40) - 20, y = 50 + Math.sin(i * 2) * 8 + Math.sin(t * 3 + i) * 1.5, f = Math.floor(t * 6 + i) % 2; pdot(b, x, y, '#3A2A48'); pdot(b, x - 1, y - f, '#3A2A48'); pdot(b, x + 1, y - f, '#3A2A48'); }
}
function shSunrise(g, t, s) {
  const w = 320, h = 180, b = pbuf('dawn1', w, h), gl = glowBuf('dawn1', w, h);
  const sunY = lerp(118, 96, E.out(seg(t, s.t, s.e)));
  dawnCity(b, gl, t, w, h, sunY);
  blit(g, 'dawn1', 6); glowBlit(g, 'dawn1', 6, 0, 0, 1, 3);
  // 从黑里打开：一个圆从太阳那儿张开
  const r = E.in2(seg(t, s.t, s.t + .9)) * 1300;
  if (r < 1300) { const sx = W / 2, sy = sunY * 6; g.save(); g.fillStyle = '#05060F'; g.beginPath(); g.rect(0, 0, W, H); g.arc(sx, sy, Math.max(4, r), 0, TAU, true); g.fill('evenodd'); g.restore(); }
}

/* ================= 母校门口（现在，清早）：240×135 ================= */
function schoolGate(b, gl, t, o = {}) {
  const w = 260, h = 150;
  psky(b, w, 80, [[0, '#7A9AD8'], [.5, '#F0B8A8'], [1, '#FFE0B8']]);
  pixelCloud(b, mod(50 + t * 1.5, 300) - 30, 18, 1, '#FFE8E0', '#F4C8C0');
  schoolBuilding(b, 70, 78, 150, 3, { wall: '#EAD8C4', win: '#9AB8D8' });
  // 围墙、大门、门柱上的牌子
  prect(b, 0, 70, w, 12, '#C8B8A8'); for (let x = 0; x < w; x += 10) prect(b, x, 66, 6, 4, '#B8A898');
  prect(b, 96, 50, 10, 34, '#B8A898'); prect(b, 150, 50, 10, 34, '#B8A898'); prect(b, 94, 48, 14, 3, '#A89888'); prect(b, 148, 48, 14, 3, '#A89888');
  prect(b, 98, 58, 6, 14, '#F4ECE0'); ptext(b, '中', 101, 58, 1, '#5A4A3A', { align: 'center' });
  prect(b, 106, 76, 44, 6, '#D8D0C0');                                    // 门口的地
  grassField(b, t, 0, 82, w, h - 82, 7, { col: '#7ABE6A', dk: '#5E9E52', lt: '#9CD27E' });
  prect(b, 0, 98, w, 14, '#E8DCC8'); prect(b, 0, 98, w, 1, '#F4ECDC');   // 门前的路
  // 那丛栀子：比当年大了很多，开满了花
  gardeniaBush(b, t, 164, 98, 72, 30, { seed: 39, flowers: 34 });
  b.save(); b.globalCompositeOperation = 'multiply'; b.fillStyle = '#FFE8D8'; b.fillRect(0, 60, w, h - 60); b.restore();   // 清早偏暖
  // 长长的影子往右拖
  b.save(); b.globalAlpha = .15; for (let i = 0; i < 4; i++) prect(b, 100 + i * 50, 104, 30, 2, '#3A2A2A'); b.restore();
  driftPetals(b, gl, t, 12, 120, 40, 120, 70, 17, { v: 8, drift: -4 });
}
function shSchoolDawn(g, t, s) {
  const w = 260, h = 150, b = pbuf('gate', w, h), gl = glowBuf('gate', w, h);
  schoolGate(b, gl, t);
  const arrive = E.out(seg(t, s.t, ch(47, 2))), wc = walkCycle(t, 4), walking = arrive < 1;
  const ey = walking ? 'r' : t < ch(47, 6) ? 'up' : 'happy';
  monAt(b, lerp(60, 146, arrive), 106 + (walking ? wc.bob : 0), { col: COL.her, eyes: ey, legs: walking ? wc.legs : 0, glint: ey !== 'happy' });
  const z = 1.25 + .1 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'gate', 8, 150, 76, z, W / 2, H / 2 - 20); glowBlitZoom(g, 'gate', 8, 150, 76, z, W / 2, H / 2 - 20, .6, 3);
}
/* ================= shOldBench：旧长椅（249.55 ~ 252.35） ================= */
function shOldBench(g, t, s) {
  const b = pbuf('sg', SG.w, SG.h), gl = glowBuf('sg', SG.w, SG.h);
  const fy = sitFy();
  schoolGarden(b, gl, t, 0, (b, gl) => {
    // 漆掉了的地方
    for (let i = 0; i < 8; i++) prect(b, SG.benchX + 2 + hash(i, 281) * 36, SG.gy - 15 + ri(hash(i, 282) * 8), 2, 1, '#C8B09A');
    monAt(b, SG.herX, fy, { col: COL.her, legs: 'sit', eyes: t < ch(48, 2) ? 'dn' : 'r', glint: true });
    // 旁边空着的位置：一片花瓣落下来，停在座位上
    const pu = seg(t, ch(48, 3), ch(48, 6) + .2);
    if (pu < 1) petal(b, SG.himX - 2 + Math.sin(pu * 8) * 4, SG_SEAT - 26 + pu * 26, t * 4);
    else { pdot(b, SG.himX - 2, SG_SEAT, '#FFFFFF'); pdot(b, SG.himX - 1, SG_SEAT, '#F0EEE4'); }
  }, { dawn: true });
  const z = 2.1 + .15 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'sg', 8, 108, fy - 10, z, W / 2, H / 2 - 20); glowBlitZoom(g, 'sg', 8, 108, fy - 10, z, W / 2, H / 2 - 20, .6, 3);
}
/* ================= shNewGeneration：新的学生（252.35 ~ 255.55） ================= */
function shNewGeneration(g, t, s) {
  const w = 260, h = 150, b = pbuf('gate', w, h), gl = glowBuf('gate', w, h);
  schoolGate(b, gl, t);
  // 她站在左边看
  monAt(b, 44, 108, { col: COL.her, eyes: t > ch(49, 3) ? 'happy' : 'r', glint: t <= ch(49, 3) });
  // 学生：一个个从右往左走过去（走到门口拐进去）
  const studs = [];
  for (let i = 0; i < 12; i++) {
    const st = s.t - 1.2 + i * .4, x = 262 - (t - st) * 44, y = 106 + (i % 3) * 3;
    if (x < 70 || x > 280) continue;
    studs.push({ x, y, o: { col: KIDS[i % KIDS.length], eyes: 'l', legs: walkCycle(t + i * .3, 5).legs, skirt: i % 2 === 0 } });
  }
  // 那一对：蓝裙子的女孩（粉色）和带呆毛的男孩（黄色），边走边说笑
  const px = 240 - (t - (s.t + .1)) * 46;          // 那一对：3 秒里从右边走到她面前
  if (px > 40 && px < 280) {
    const wc = walkCycle(t, 4);
    studs.push({ x: px, y: 110, o: { col: '#E88FA8', skirt: true, eyes: 'r', legs: wc.legs }, pair: 1 });
    studs.push({ x: px + 22, y: 110, o: { col: '#F0C75A', cowlick: true, eyes: 'l', legs: walkCycle(t + .2, 4).legs }, pair: 2 });
  }
  studs.sort((a, c) => a.y - c.y).forEach(p => monAt(b, p.x, p.y + (p.o.legs ? -1 : 0), p.o));
  if (px > 40 && px < 280) { const ba = .6 + .4 * Math.sin(t * 6); speechBubble(b, px + 11, 92, NOTE(), ba, 1); }
  const z = 1.3;
  blitZoom(g, 'gate', 8, 120, 80, z, W / 2, H / 2 - 20); glowBlitZoom(g, 'gate', 8, 120, 80, z, W / 2, H / 2 - 20, .6, 3);
}
/* ================= shSmileTear：笑着流泪（255.55 ~ 257.55） ================= */
function shSmileTear(g, t, s) {
  const w = 120, h = 68, b = pbuf('smile', w, h), gl = glowBuf('smile', w, h);
  psky(b, w, h, [[0, '#9AB0E0'], [.6, '#F4C0B0'], [1, '#FFE0C0']]);
  for (let i = 0; i < 12; i++) { const x = hash(i, 291) * w, y = 30 + hash(i, 292) * 38; b.globalAlpha = .5; pdisc(b, x, y, 2 + hash(i, 293) * 3, i % 3 ? '#FFFFFF' : '#7ABE6A'); }
  b.globalAlpha = 1;
  monAt(b, 60, 54, { col: COL.her, eyes: 'happy', tear: 2, blush: true });
  // 晨光从左边照过来：身上左边一道亮边
  prect(gl, 48, 38, 2, 12, 'rgba(255,230,180,.8)');
  driftPetals(b, gl, t, 8, 0, 0, 120, 68, 23, { v: 9 });
  const z = 1.25 + .04 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'smile', 16, 60, 40, z, W / 2, H / 2); glowBlitZoom(g, 'smile', 16, 60, 40, z, W / 2, H / 2, .8, 2);
}
/* ================= shTearSun：泪落在掌机上，屏幕亮了（257.55 ~ 262.40） ================= */
function shTearSun(g, t, s) {
  const land = ch(51, 4), on = seg(t, land + .15, land + .6);
  drawTitleWorld(t, {});
  const scr = pbuf('tsScr', 192, 108);
  if (on > 0) { scr.drawImage(BUF.tworld, 0, 0); if (Math.floor(t * 3) % 2 === 0) battery(scr, 168, 4, 1, .15, t); }
  const R2 = insertHH(g, t, on > 0 ? BUF.tsScr : null, { zoom: 1.7, halo: '#7A5A70', led: on > 0, glowAmt: .5 * on });
  if (on > 0 && on < 1) { g.save(); g.globalAlpha = 1 - on; g.fillStyle = '#2A3130'; g.fillRect(R2.x, R2.y, R2.w, R2.h); g.restore(); }
  // 泪：在晨光里一闪，慢慢落下来
  const dx = R2.x + R2.w * .55, dy1 = R2.y + R2.h * .45;
  if (t < land) {
    const u = E.in2(seg(t, s.t + .3, land)), y = lerp(-140, dy1, u);
    drawDrop(g, dx, y, 26, 34);
    const sp = .5 + .5 * Math.sin(t * 10);
    g.fillStyle = `rgba(255,248,220,${.8 * sp})`; g.fillRect(dx - 70, y - 60, 140, 8); g.fillRect(dx - 4, y - 130, 8, 140);   // 一闪的光
  } else {
    const u = seg(t, land, land + .5);
    if (u < 1) { g.save(); g.strokeStyle = `rgba(220,245,255,${.7 * (1 - u)})`; g.lineWidth = 10; g.beginPath(); g.arc(dx, dy1, 30 + u * 260, 0, TAU); g.stroke(); g.restore(); }
  }
}
/* ================= shLeaveIt：长椅上，看着亮着的掌机（262.40 ~ 269.20） ================= */
function shLeaveIt(g, t, s) {
  const b = pbuf('sg', SG.w, SG.h), gl = glowBuf('sg', SG.w, SG.h);
  const fy = sitFy();
  schoolGarden(b, gl, t, 0, (b, gl) => {
    const ey = t < 264.3 ? 'dn' : t < 266.6 ? 'shut' : 'happy';
    monAt(b, SG.herX, fy, { col: COL.her, legs: 'sit', armL: 'hold', armR: 'hold', eyes: ey, glint: ey === 'dn' });
    heldHandheld(b, SG.herX, fy - 7, '#E6DEC8', '#BFF8EC'); prect(gl, SG.herX - 2, fy - 6, 4, 3, '#BFF8EC');
    pdot(b, SG.himX - 2, SG_SEAT, '#FFFFFF');
  }, { dawn: true });
  const z = lerp(2.2, 1.35, E.io(seg(t, s.t, s.e)));
  blitZoom(g, 'sg', 8, lerp(104, 118, E.io(seg(t, s.t, s.e))), lerp(fy - 10, 74, E.io(seg(t, s.t, s.e))), z, W / 2, H / 2 - 20); glowBlitZoom(g, 'sg', 8, 110, fy - 10, z, W / 2, H / 2 - 20, .6, 3);
}

/* ================= shBatteryDie：没电了（269.20 ~ 275.20） ================= */
function shBatteryDie(g, t, s) {
  const dim0 = ch(53, 3), dis0 = ch(53, 6), off = 274.6;
  drawTitleWorld(t, {});
  const scr = pbuf('bdScr', 192, 108);
  const dimK = 1 - .45 * seg(t, dim0, dis0);
  scr.drawImage(BUF.tworld, 0, 0);
  if (dimK < 1) { scr.fillStyle = `rgba(20,26,24,${1 - dimK})`; scr.fillRect(0, 0, 192, 108); }
  if (t < dis0 + 1.4 && Math.floor(t * 3) % 2 === 0) battery(scr, 168, 4, 1, .1, t);
  // 一格格暗掉（Bayer 抖动，2×2 的格子）
  const dv = seg(t, dis0, dis0 + 1.3), lv = Math.floor(dv * 17);
  if (lv > 0) { scr.fillStyle = '#2A3130'; for (let y = 0; y < 108; y += 2) for (let x = 0; x < 192; x += 2) if (BAYER[((y >> 1) & 3) * 4 + ((x >> 1) & 3)] < lv) scr.fillRect(x, y, 2, 2); }
  const ledOn = t < off && (t < dis0 || Math.floor(t * 4) % 2 === 0);
  const z = 1.75 + .1 * E.sine(seg(t, s.t, s.e));
  const flick = t > dim0 && t < dis0 && hash(Math.floor(t * 15), 5) < .15 ? .6 : 1;
  insertHH(g, t, BUF.bdScr, { zoom: z, halo: '#5A4A60', led: ledOn, glowAmt: .45 * flick * (1 - dv), after: (b, gl, L) => {
    // 熄了以后：暗的屏幕上映出她的影子
    if (dv >= 1) { const a = seg(t, dis0 + 1.3, s.e) * .25; b.save(); b.globalAlpha = a; pdisc(b, L.x + 96, L.y + 70, 26, shade(COL.her, .6)); b.restore(); }
  } });
}

/* ================= shBoyLoves：有一个男孩爱着那个女孩（275.20 ~ 282.07） ================= */
function shBoyLoves(g, t, s) {
  const w = 192, h = 130, b = pbuf('hillF', w, h), gl = glowBuf('hillF', w, h);
  hillFront(b, gl, t);
  const look = ch(54, 3), love = ch(54, 5), girl = ch(54, 9);
  monAt(b, 86, 86, { col: COL.her, skirt: true, legs: 'sit', eyes: 'up', glint: true }, NIGHT_TINT);
  monAt(b, 108, 86, { col: COL.him, cowlick: true, legs: 'sit', eyes: t < look ? 'up' : 'l', glint: true, blush: t > love }, NIGHT_TINT);
  pspr(b, tinted(gardenia(1), NIGHT_TINT, 'gdN'), 92, 75);
  // 心：从他头顶冒出来，慢慢升上天，变成一颗星
  if (t >= love) {
    const u = seg(t, love, girl), v = seg(t, girl, girl + 1.6);
    const hx = 108 + Math.sin(u * 6) * 2 + v * 14, hy = 66 - u * 14 - E.in2(v) * 46;
    if (v < 1) {
      const sp = v > .6 ? heart7('#FF7A9A') : heart11('#FF6A8A'), sc = 1 - v * .5;
      b.globalAlpha = 1 - v * .3; pspr(b, sp, ri(hx - sp.width / 2), ri(hy - sp.height / 2)); b.globalAlpha = 1;
      pdisc(gl, hx, hy, 7 * sc, rgba('#FF9AB0', .8));
    }
    if (v > .85) { const k = clamp((v - .85) / .15), tw = .7 + .3 * Math.sin(t * 6), sx = 122, sy = 6; b.globalAlpha = k * tw; pdot(b, sx, sy, '#FFFFFF'); [[-1, 0], [1, 0], [0, -1], [0, 1], [-2, 0], [2, 0], [0, -2], [0, 2]].forEach(([dx, dy], i) => pdot(b, sx + dx, sy + dy, i < 4 ? '#FFD8E4' : '#FF9AB0')); gl.globalAlpha = k; prect(gl, sx - 3, sy - 3, 7, 7, '#FFB8C8'); b.globalAlpha = 1; gl.globalAlpha = 1; }
  }
  fireflies(b, gl, t, 24, 0, 40, 192, 104, 19);
  const z = 1.1 + .25 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'hillF', 10, 98, lerp(66, 58, seg(t, girl, s.e)), z, W / 2, H / 2 - 30); glowBlitZoom(g, 'hillF', 10, 98, 62, z, W / 2, H / 2 - 30, .95, 3);
}

/* ================= shRiseSky：升上银河（282.07 ~ 291.68） ================= */
function shRiseSky(g, t, s) {
  const w = 192, h = 108 + 140, b = pbuf('rise', w, h), gl = glowBuf('rise', w, h);
  psky(b, w, 140, [[0, '#03051A'], [1, '#070B2A']]);
  pspr(b, milkyWay(w, 200, 301, 0, 190, 192, 10, 22, '#7A6AD0'), 0, 0);
  starfield(b, t, w, 200, { n: 260, seed: 302, tw: .55, big: .07 });
  b.save(); b.translate(0, 140); hillFront(b, gl, t); b.restore();
  monAt(b, 86, 226, { col: COL.her, skirt: true, legs: 'sit', eyes: 'up' }, NIGHT_TINT);
  monAt(b, 108, 226, { col: COL.him, cowlick: true, legs: 'sit', eyes: 'l' }, NIGHT_TINT);
  // 那颗心变的星（一直亮着），和两个小怪的星座
  const sx = 122, sy = 146;
  pdot(b, sx, sy, '#FFFFFF'); pdot(gl, sx, sy, '#FFB8C8'); prect(gl, sx - 2, sy - 2, 5, 5, 'rgba(255,184,200,.8)');
  const draw = seg(t, 285.3, 288.4), glow = seg(t, 288.0, 289.0);
  [[monConstellation(58, 40, 2.6), '#FFB49A'], [monConstellation(100, 42, 2.6), '#9AF0DC']].forEach(([pts, col]) => {
    const n = pts.length - 1, m = draw * n;
    for (let i = 0; i < n && i < m; i++) { const u = clamp(m - i), [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; b.globalAlpha = .5 + .5 * glow; pline(b, x0, y0, lerp(x0, x1, u), lerp(y0, y1, u), col); gl.globalAlpha = .6 * glow; pline(gl, x0, y0, lerp(x0, x1, u), lerp(y0, y1, u), col); }
    b.globalAlpha = 1; gl.globalAlpha = 1;
    pts.forEach(([x, y], i) => { if (i / n <= draw + .01) { pdot(b, x, y, '#FFFFFF'); gl.globalAlpha = .8; prect(gl, x - 1, y - 1, 3, 3, '#FFFFFF'); gl.globalAlpha = 1; } });
  });
  if (draw > .95) { b.globalAlpha = glow; pline(b, 58 + 12 * 2.6, 40 + 3 * 2.6, 100, 42 + 3 * 2.6, '#FFE8B0'); b.globalAlpha = 1; }
  // 流星
  meteor(b, 170, 20, -90, 30, seg(t, 284.2, 285.0), 16, '#CFE0FF');
  meteor(b, 150, 60, -120, 40, seg(t, bar(90), bar(90) + .9), 22, '#FFE6A8'); meteor(gl, 150, 60, -120, 40, seg(t, bar(90), bar(90) + .9), 22, '#FFFFFF');
  meteor(b, 60, 10, 80, 26, seg(t, 290.2, 290.9), 14, '#FFD6EC');
  // 萤火虫一路往上飘
  for (let i = 0; i < 40; i++) { const u = mod((t - s.t) * .08 + hash(i, 303), 1), x = hash(i, 304) * w + Math.sin(t + i) * 4, y = 240 - u * 220; const a = (.5 + .5 * Math.sin(t * 4 + i)) * (1 - u); b.globalAlpha = a; pdot(b, x, y, '#E8FF8A'); gl.globalAlpha = a; prect(gl, x - 1, y - 1, 3, 3, '#E8FF8A'); }
  b.globalAlpha = 1; gl.globalAlpha = 1;
  const camY = lerp(140, 0, E.io(seg(t, s.t, 288.4)));
  blit(g, 'rise', 10, 0, camY); glowBlit(g, 'rise', 10, 0, camY, 1, 3);
}

/* ================= shWalkOn：早晨的路（291.68 ~ 301.29） ================= */
function shWalkOn(g, t, s) {
  const w = 240, h = 135, b = pbuf('walk', w, h), gl = glowBuf('walk', w, h);
  psky(b, w, 80, [[0, '#6AAEE8'], [.6, '#A8D8F4'], [1, '#E8F4F0']]);
  const stop = t > 297.0 && t < 298.6, walkK = t < 297.0 ? 1 : t < 298.6 ? 0 : 1;
  // 走路时背景往左移（停下的那一会儿不动）
  const pos = t < 297 ? (t - s.t) * 18 : (297 - s.t) * 18 + Math.max(0, t - 298.6) * 18;
  pixelCloud(b, mod(60 - pos * .1, 300) - 30, 16, 1.2); pixelCloud(b, mod(200 - pos * .1, 300) - 30, 26, .9);
  b.save(); b.translate(-ri(mod(pos * .3, 240)), 0);
  for (let k = 0; k < 2; k++) { pspr(b, skyline(240, 60, 311, '#B8C8D8', 40, 0), k * 240, 40); }
  b.restore();
  grassField(b, t, 0, 92, w, h - 92, 9);
  prect(b, 0, 104, w, 14, '#E8DCC0'); prect(b, 0, 104, w, 1, '#F4ECD8');
  // 路边的树和栀子花丛（视差 1）
  b.save(); b.translate(-ri(mod(pos, 120)), 0);
  for (let k = 0; k < 4; k++) {
    const x = k * 120;
    prect(b, x + 20, 58, 5, 40, '#7A5A3E'); pdisc(b, x + 22, 52, 20, '#3E8A4C'); pdisc(b, x + 14, 58, 12, '#4E9E52'); pdisc(b, x + 32, 56, 13, '#5AAE5E');
    gardeniaBush(b, t, x + 60, 104, 44, 12, { seed: 41 + k % 2, flowers: 10 });
  }
  b.restore();
  driftPetals(b, gl, t, 14, 0, 30, 240, 90, 29, { v: 9, drift: -14 });
  // 她：往右走；停下回头看一眼，笑，再往前走，走出画面
  const wc = walkCycle(t, 4), out = seg(t, 299.4, s.e);
  const hx = 110 + E.in2(out) * 160;
  const ey = stop ? (t < 297.5 ? 'l' : 'happy') : 'r';
  monAt(b, hx, 106 + (walkK ? wc.bob : 0), { col: COL.her, eyes: ey, legs: walkK ? wc.legs : 0 });
  for (let i = 0; i < 4; i++) { const x = mod(30 + i * 60 + t * 20, 280) - 20, y = 30 + Math.sin(i * 3 + t) * 6, f = Math.floor(t * 6 + i) % 2; pdot(b, x, y, '#4A4A5A'); pdot(b, x - 1, y - f, '#4A4A5A'); pdot(b, x + 1, y - f, '#4A4A5A'); }
  blit(g, 'walk', 8); glowBlit(g, 'walk', 8, 0, 0, .5, 3);
}

/* ================= shEnd：片尾（301.29 ~ 315.49） ================= */
const END_TITLE = (() => {
  const gb = glyphBits('后来'), S = 3, x0 = 96 - gb.w * S / 2, y0 = 12, pts = [];
  gb.pts.forEach(p => { for (let dy = 0; dy < S; dy++) for (let dx = 0; dx < S; dx++) pts.push({ x: x0 + p.x * S + dx, y: y0 + p.y * S + dy }); });
  return pts;
})();
function shEnd(g, t, s) {
  const w = 192, h = 108, b = pbuf('end', w, h), gl = glowBuf('end', w, h);
  psky(b, w, h, [[0, '#03051A'], [.6, '#0B1238'], [1, '#1A1D52']]);
  pspr(b, milkyWay(w, h, 321, 0, 100, 192, 10, 20, '#6A5AC0'), 0, 0);
  starfield(b, t, w, h, { n: 140, seed: 322, tw: .5 });
  // 片名：星星从四面飞过来拼成"后来"
  END_TITLE.forEach((p, i) => {
    const st = 301.6 + hash(i, 323) * .9, arr = st + .8;
    const sx = hash(i, 324) * w, sy = hash(i, 325) * h;
    let x, y, col = '#FFF6DC';
    if (t < st) { x = sx; y = sy; col = '#C8D0F0'; }
    else if (t < arr) { const u = E.io((t - st) / .8); x = lerp(sx, p.x, u); y = lerp(sy, p.y, u); col = mix('#C8D0F0', '#FFF6DC', u); }
    else { x = p.x; y = p.y; if (hash(i, Math.floor(t * 5)) < .04) col = '#FFFFFF'; }
    b.globalAlpha = t < st ? .5 : 1; pdot(b, x, y, col); gl.globalAlpha = t < arr ? .6 : .4; pdot(gl, x, y, '#FFE8B0');
  });
  b.globalAlpha = 1; gl.globalAlpha = 1;
  // 底下一条小山坡和那棵树的剪影
  hillShape(b, w, h, [[0, 100], [70, 94], [130, 96], [192, 102]], '#0A1426', '#14203A');
  gardeniaTree(b, gl, t, 150, 96, 12, { night: true, flowers: 16, seed: 23 });
  blit(g, 'end', 10); glowBlit(g, 'end', 10, 0, 0, .9, 3);
  const fade = seg(t, 313.6, 315.3);
  if (fade > 0) { g.fillStyle = `rgba(0,0,0,${fade})`; g.fillRect(0, 0, W, H); }
}
