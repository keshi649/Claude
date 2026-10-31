'use strict';
/* scenes4.js —— 第二段主歌（七年后回到教室，钟倒着转）、第二遍副歌。 */

/* 1:58.9 短短的路走走停停：七年后，他走上教学楼的楼梯 */
function sStairs(t, k) { stairs(t); const u = seg(k, 0, 3.1); person({ look: 'heA', x: 60 + u * 150, y: 250 - u * 90, face: 1, pose: walkPose(k * 2.2, 1), t, rim: [0xfff0d0, .5, 1, 0] }); }
/* 2:02.0 也有了几分的距离：空教室，桌椅摞着，灰在光里飘；他站在门口 */
function sEmptyRoom(t, k) {
  classroom(t, { tod: 'empty', x: 30 + k * 4, wind: .2, fan: true });
  for (let i = 0; i < 5; i++) stackedDesks(30 + i * 90, 236, 2 + (i % 2));
  person({ look: 'heA', x: 440, y: 250, face: -1, pose: POSE.stand, t, tint: [0x3a3040, .25] });
  motes(t, 90, [0, 20, W, 230], 0xfff6dc, .9, 63, 2);
}
/* 2:05.4 不知抚摸的是故事 / 还是段心情：他的手摸到桌上的刻痕 */
function sCarving(t, k) {
  rect(0, 0, W, H, C(0xb08050)); for (let i = 0; i < 50; i++) hspan(Math.round(hash(i, 261) * H), 0, W, C(0x9a6c42), .5);
  for (let i = 0; i < 400; i++) pset(hash(i, 262) * W, hash(i, 263) * H, C(0xe8d8c0), .25);          // 积的灰
  // 刻痕：深色的笔画 + 亮边
  const cx = 230, cy = 120;
  text('2018.6.7', cx, cy - 6, { scale: 2, col: C(0x4a2c18), sh: C(0xd8a878) });
  paperPlane(cx + 120, cy + 40, 20, -.25, { old: true });
  rect(cx + 60, cy + 30, 70, 30, C(0x4a2c18), .15);
  for (let kk = 0; kk < 3; kk++) poly([[0, 60 + kk * 50], [W, kk * 50], [W, 30 + kk * 50], [0, 90 + kk * 50]], C(0xfff0c8), .12 + .05 * Math.sin(t + kk), 's');
  // 手：从右下伸进来，手指慢慢抚过字
  const u = E.io(seg(k, .4, 4.5)), hx = lerp(420, 250, u), hy = lerp(240, 150, u);
  capsule(W + 40, H + 30, hx + 14, hy + 16, 30, C(0x2a2030)); capsule(W + 40, H + 30, hx + 14, hy + 16, 28, C(0xf4f6fa));
  disc(hx, hy, 15, C(0x2a2030)); disc(hx, hy, 14, C(0xf2cdb0)); disc(hx + 4, hy + 4, 9, C(0xdea488), .5);
  for (let j = 0; j < 4; j++) { const fx = hx - 12 + j * 6, fy = hy - 10 + Math.abs(j - 1.5) * 2; capsule(fx, fy, fx - 10 + j, fy - 12 + j * 1.5, 7, C(0x2a2030)); capsule(fx, fy, fx - 10 + j, fy - 12 + j * 1.5, 5.4, C(0xf2cdb0)); }
  capsule(hx + 10, hy, hx + 18, hy - 12, 7, C(0x2a2030)); capsule(hx + 10, hy, hx + 18, hy - 12, 5.4, C(0xf2cdb0));
  motes(t, 60, [0, 0, W, H], 0xfff6dc, .8, 65, 2);
}
/* 2:11.7 也许期待的不过是：墙上的钟；2:14.9 与时间为敌：钟倒着转，灰往回飞，桌椅一排排落回原处 */
const REWIND = 134.85;
function sClock(t, k) {
  rect(0, 0, W, H, C(0xe8e0d0)); vgrad(0, 0, W, H, [[0, 0xd8d0c0], [1, 0xeee6d8]], 6);
  const back = seg(t, REWIND, REWIND + 2.2), spin = E.in(back) * 40;
  bigClock(240, 128, 92, 3.15 + (t - 131.6) * .002 - spin, { sec: (t % 60) / 60 - spin * 3 });
  for (let kk = 0; kk < 3; kk++) poly([[0, 20 + kk * 40], [120, 20 + kk * 40], [W, 160 + kk * 40], [W - 120, 160 + kk * 40]], C(0xfff0c8), .1, 's');
  // 倒转时：灰往上飞、横着一道道的拉丝
  if (back > 0) { for (let i = 0; i < 120; i++) { const x = hash(i, 271) * W, y = mod(hash(i, 272) * H - t * 300 * back, H); dot(x, y, C(0xfff6dc), .8 * back, 's'); dot(x, y + 1, C(0xfff6dc), .4 * back, 's'); } for (let r = 0; r < 6; r++) { const y = mod(r * 47 + t * 400, H); rect(0, y, W, 1, C(0xffffff), .3 * back, 's'); } }
  motes(t, 40, [0, 0, W, H], 0xfff6dc, .7, 67, 2);
}
/* 倒带：空教室一下一下闪回到满屋的早读课 */
function sRewindRoom(t, k) {
  const u = seg(k, 0, 2.4);
  const full = bay(Math.floor(k * 30) % 4, Math.floor(k * 30 / 4) % 4) < u * u;
  if (full) classFront(t, { tod: 'morning', count: 263, students: (r, i) => ({ look: r === SHE_SEAT[0] && i === SHE_SEAT[1] ? 'she' : kid(300 + r * 10 + i) }) });
  else { classroom(t, { tod: 'empty', x: 30, wind: .2 }); for (let i = 0; i < 5; i++) stackedDesks(30 + i * 90, 236 - (1 - u) * 0, 2); }
  for (let r = 0; r < 8; r++) { const y = mod(r * 37 + t * 600, H); rect(0, y, W, 2, C(0xffffff), .25, 's'); }
  rect(0, 0, W, H, C(0xffe0b0), .15 * (1 - u), 's');
}
/* 2:17.3 再次看到你 / 微凉晨光里：早读课，教室又满了；晨光、飘着的灰 */
function sMorning(t, k) {
  classFront(t, { tod: 'morning', count: 263, board: (x, y) => text('早读', x + 120, y + 26, { scale: 2, col: C(0xfff4e0), sp: 4 }),
    students: (r, i) => ({ look: r === SHE_SEAT[0] && i === SHE_SEAT[1] ? 'she' : r === HE_SEAT[0] && i === HE_SEAT[1] ? 'he' : kid(300 + r * 10 + i), arms: [.5, 2.1 + Math.sin(t * 2 + i + r) * .05, .5, 2.1] }) });
  for (let kk = 0; kk < 5; kk++) poly([[0, 20 + kk * 24], [30, 26 + kk * 24], [360, H], [300, H]], C(0xffe6b0), .06, 's');
  motes(t, 80, [0, 0, W, H], 0xffeac0, .8, 69, 2);
}
/* 2:20.5 笑得很甜蜜：她在晨光里回头笑，手里拿着语文书 */
function sSmile2(t, k) {
  bokeh(() => classFront(t, { tod: 'morning', count: 263, students: (r, i) => ({ look: kid(300 + r * 10 + i) }) }), 6, { dots: 40, tint: [0xffd0a0, .15] });
  const u = E.out(seg(k, 0, .7)), sm = seg(k, .6, 1.0);
  vhead({ x: 250, y: 104, R: 42, yaw: lerp(.9, -.12, u), tilt: .04, look: 'she', t, wind: .2, expr: { eyes: sm > .5 ? 'smile' : 'open', mouth: sm > .4 ? 'laugh' : 'smile', blush: .5 + sm * .4 }, gaze: [-.2, 0], rim: [0xffe0b0, .8, -1, 0, 2],
    front: U => { const { g, LW } = U; g.fillStyle = '#4a7ac8'; g.strokeStyle = '#2a1622'; g.lineWidth = LW * 2; g.beginPath(); g.rect(.5, 1.6, 1.5, 2.0); g.stroke(); g.fill(); g.fillStyle = '#fbf8ee'; g.fillRect(.55, 1.65, .1, 1.9); g.fillStyle = '#ffffff'; g.font = '0.42px FP12'; g.fillText('语文', .8, 2.4); } });
  motes(t, 40, [0, 0, W, H], 0xffeac0, .8, 71, 2);
}
shot('stairs', 118.75, sStairs, { tr: { type: 'fade', dur: 1.0, pre: .5 }, post: { grade: { sat: .85 } } });
shot('emptyroom', 121.9, sEmptyRoom, { tr: { type: 'dither', dur: .6, pre: .3 }, post: { grade: { sat: .8 } } });
shot('carving', 125.2, sCarving, { tr: { type: 'fade', dur: .5, pre: .25 }, post: { grade: { sat: .85 } } });
shot('clock', 131.6, sClock, { tr: { type: 'fade', dur: .5, pre: .25 } });
shot('rewind', 135.6, sRewindRoom, { tr: { type: 'flash', dur: .3, pre: .15 } });
shot('morning', 137.2, sMorning, { tr: { type: 'flash', dur: .5, pre: .25 }, post: { bloom: [.6, .7], grade: { tint: [0xffc890, .06] } } });
shot('smile2', 140.4, sSmile2, { tr: { type: 'iris', dur: .5, pre: .2, cx: 250, cy: 110 }, post: { bloom: [.6, .7] } });

/* 2:22.9 从前初识这世间：夕阳下沿河骑车 */
function sBikes(t, k) {
  const cam = k * 40;
  riverPath(t, { x: cam });
  for (const [who, dx, dy] of [['he', 0, 0], ['she', 34, 4]]) { const x = 190 + dx + Math.sin(t * .8 + dx) * 4, y = 236 + dy; bike(t, x, y, 1, { col: who === 'she' ? 0xe86a8a : 0x3a7ad8 }); person({ look: who, x: x - 1, y: y - 3, sitY: y - 15, face: 1, pose: { ...POSE.sit, lN: [1.1 + Math.sin(t * 8 + dx) * .4, 1.3], lF: [1.1 - Math.sin(t * 8 + dx) * .4, 1.3], aN: [1.3, .3], aF: [1.2, .3], tilt: .15 }, t, wind: .7, rim: [0xffc080, .8, 1, 0], shadow: false }); }
  windLeaves(t, 14, [0, 120, W, 260], 60, 21, [[0xf8c070, 0xc88040]]);
  motes(t, 30, [0, 60, W, 250], 0xffd8a0, .7, 73);
}
/* 2:26.0 万般流连：看台上一人一只耳机 */
function sEarphones(t, k) {
  sky(t, SKY.sunset); sun(t, 420, 140, 12, 0xfff0c0, 0xffa060);
  cloudDrift(t, [[60, 50, 110, 291], [260, 30, 90, 292]], CLOUD_PAL.sunset, 1.5);
  trackField(t, 150, { trackY: 4, trackH: 40, grass: 0x6a9a4a });
  for (let r = 0; r < 4; r++) { rect(0, 196 + r * 18, W, 18, C(0x9a9aa6 - r * 0x060606)); rect(0, 196 + r * 18, W, 2, C(0xb8b8c4)); }
  person({ look: 'he', x: 220, y: 230, sitY: 214, face: 1, pose: POSE.sit, t, rim: [0xffc080, .7, 1, 0], shadow: false });
  person({ look: 'she', x: 244, y: 230, sitY: 214, face: -1, view: 'three', pose: POSE.sit, t, rim: [0xffc080, .7, 1, 0], shadow: false, expr: { eyes: 'closed', mouth: 'smile' } });
  wire(222, 194, 240, 194, 6, t, 0xf0f0f0, 1); line(231, 200, 231, 214, C(0xf0f0f0));
  for (let i = 0; i < 5; i++) { const ph = fract(t * .3 + i / 5); note(232 + Math.sin(ph * 6 + i) * 14, 186 - ph * 70, 0xfff0c8, Math.sin(ph * Math.PI)); }
  motes(t, 30, [0, 60, W, 250], 0xffd8a0, .7, 75);
}
/* 2:27.7 看着天边似在眼前：晚自习间隙趴在栏杆上看月亮，一颗流星 */
function sMoonRail(t, k) {
  sky(t, 'night'); stars(t, 160, [0, 0, W, 170]); moon(t, 360, 60, 16);
  const ms = seg(k, 1.0, 1.6); if (ms > 0 && ms < 1) for (let i = 0; i < 20; i++) dot(80 + ms * 200 - i * 3, 30 + ms * 60 - i * .9, C(0xffffff), (1 - i / 20) * (1 - ms * .5), 's');
  cloudDrift(t, [[100, 120, 120, 301], [340, 140, 100, 302]], CLOUD_PAL.night, 1);
  skyline(t, 200, 0x1e1a34, 303, 0, { lit: .3 });
  teachBuilding(t, -20, 270, 520, 2, { night: true, lit: .7, wall: 0x4a4660, rail: 0x5a5672 });
  rect(0, 214, W, 4, C(0x6a6680)); for (let x = 0; x < W; x += 12) rect(x, 218, 2, 20, C(0x5a5672));
  person({ look: 'he', x: 220, y: 262, face: -1, view: 'back', t, arms: [1.0, 1.6, 1.0, 1.6], tint: [0x2a2848, .35] });
  person({ look: 'she', x: 244, y: 262, face: -1, view: 'back', t, arms: [1.0, 1.6, ms > .5 ? 2.4 : 1.0, ms > .5 ? .5 : 1.6], tint: [0x2a2848, .35], wind: .2 });
}
/* 2:30.6 也甘愿赴汤蹈火去走它一遍：百日誓师——操场上全年级举着拳头，彩带满天 */
function sPledge(t, k) {
  sky(t, SKY.noon); cloudDrift(t, [[80, 30, 120, 311], [320, 20, 90, 312]], CLOUD_PAL.noon, 2);
  teachBuilding(t, 40, 110, 400, 3);
  banner(90, 22, 300, '百日誓师 决战高考', { t, wave: .6, h: 18 });
  rect(0, 110, W, H - 110, C(0x6aae4a));
  for (let r = 0; r < 7; r++) for (let i = 0; i < 26; i++) { const x = 8 + i * 18 + (r % 2) * 9, y = 140 + r * 18, lk = kid(400 + r * 30 + i), up = Math.sin(t * 6 + r) > 0; rect(x - 4, y, 9, 8, C(0xf6f8fc)); rect(x - 4, y, 9, 2, C(0x3266c4)); disc(x, y - 3, 3.4, C(lk.skin || PAL.skin)); disc(x, y - 4.5, 3.4, C(lk.hc[0])); rect(x - 3, y - 3, 7, 2, C(lk.skin || PAL.skin)); if (up) { line(x + 4, y, x + 6, y - 8, C(0xf6f8fc)); disc(x + 6, y - 9, 1.4, C(lk.skin || PAL.skin)); } }
  confetti(t, 120, [0, 0, W, H], 13);
}
/* 2:33.6 夜里两扇亮着的窗：他和她各在自己家里写作业 */
function sTwoWindows(t, k) {
  sky(t, 'night'); stars(t, 120, [0, 0, W, 150]); moon(t, 240, 40, 12);
  nightWindow(t, 80, 110, 'he'); nightWindow(t, 360, 120, 'she');
  rect(200, 140, 80, 130, C(0x2a2640)); for (let i = 0; i < 6; i++) rect(210 + (i % 2) * 30, 150 + Math.floor(i / 2) * 30, 16, 16, C(hash(i, 321) < .3 ? 0xffd890 : 0x3a3450));
  wire(-10, 90, W + 10, 96, 20, t, 0x14121e);
}
/* 2:35.8 如今走过这世间：初雪——两个人在校园里接雪花 */
function sSnow(t, k) {
  sky(t, SKY.grey); teachBuilding(t, 40, 170, 400, 4, { wall: 0xe8e8ee });
  for (let x = 40; x < 440; x += 2) pset(x, 170 - 4 * 26 - 7, C(0xffffff));
  rect(0, 170, W, H - 170, C(0xeef2f6)); for (let i = 0; i < 40; i++) pset(hash(i, 331) * W, 172 + hash(i, 332) * 98, C(0xd8e0ea));
  for (let i = 0; i < 4; i++) { const S = makeCanopy(340 + i, 70, 46, [0x6a7a7a, 0x8a9a98, 0xd8e4e8, 0xffffff], { r: 6 }); drawCanopy(S, 30 + i * 140, 180, t, .6, { glint: false }); }
  person({ look: 'he', x: 220, y: 236, face: 1, view: 'three', pose: POSE.lookUp, t, expr: { eyes: 'open', mouth: 'smile' } });
  person({ look: 'she', x: 248, y: 236, face: -1, view: 'front', t, arms: [.3, 2.4, .3, 2.4], expr: { eyes: 'happy', mouth: 'open' }, wind: .2 });
  snow(t, 220, [0, 0, W, H], 7);
}
/* 2:38.8 万般流连：元旦晚会——气球、黑板上"元旦快乐" */
function sParty(t, k) {
  classFront(t, { count: 157, board: (x, y, w, h) => { text('元旦快乐！', x + w / 2, y + 22, { scale: 2, col: C(0xffe070), sp: 2 }); text('2018', x + w - 30, y + h - 16, { col: C(0xf0a0c0) }); },
    students: (r, i) => ({ look: r === SHE_SEAT[0] && i === SHE_SEAT[1] ? 'she' : r === HE_SEAT[0] && i === HE_SEAT[1] ? 'he' : kid(300 + r * 10 + i), arms: Math.sin(t * 5 + i + r) > 0 ? [2.6, .3, .2, .1] : [.2, .1, 2.6, .3] }) });
  for (let i = 0; i < 14; i++) balloon(t, 20 + i * 34, 34 + (i % 3) * 6, pick([0xf04a5a, 0xf0c040, 0x4ab0f0, 0x6ad07a, 0xf08ad0], i), i);
  for (let i = 0; i < 20; i++) { const x = i * 24; line(x, 6, x + 12, 12, C(pick([0xf04a5a, 0xf0c040, 0x4ab0f0], i))); line(x + 12, 12, x + 24, 6, C(pick([0x6ad07a, 0xf08ad0, 0xf0c040], i))); }
  confetti(t, 60, [0, 0, W, H], 17, .8);
}
/* 2:40.5 翻过岁月不同侧脸：日历一页页翻到六月 */
function sCalendar(t, k) {
  rect(0, 0, W, H, C(0xe8e0d0)); for (let kk = 0; kk < 3; kk++) poly([[0, kk * 60], [W, kk * 60 + 80], [W, kk * 60 + 110], [0, kk * 60 + 30]], C(0xfff0c8), .08, 's');
  const m = Math.min(6, 1 + Math.floor(k / .5)), fu = fract(k / .5);
  const page = (mm, x, y, lift = 0) => {
    rect(x + 3, y + 3, 150, 180, C(0x000000), .2); rect(x, y - lift, 150, 180, C(0xfbfaf6)); rect(x, y - lift, 150, 40, C(0xd83a32));
    text(mm + '月', x + 75, y + 6 - lift, { scale: 2, col: C(0xffffff) }); text('2018', x + 128, y + 4 - lift, { size: 8, col: C(0xffd8d0) });
    for (let d = 1; d <= 30; d++) { const c = (d - 1) % 7, r = Math.floor((d - 1) / 7); text(String(d), x + 14 + c * 20, y + 52 + r * 24 - lift, { size: 8, col: C(c === 6 || c === 5 ? 0xd83a32 : 0x3a3448) }); }
    if (mm === 6) { ring(x + 14 + 1 * 20 + 3, y + 52 + 4 + 24 - lift, 8, C(0xd83a32)); ring(x + 14 + 1 * 20 + 3, y + 52 + 4 + 24 - lift, 9, C(0xd83a32)); }
  };
  page(m, 165, 50);
  if (m < 6 && fu > .5) { const u = (fu - .5) / .5; page(m, 165, 50, u * 200); }
  rect(160, 44, 160, 6, C(0x5a5a6a));
}
/* 2:43.6 措不及防闯入你的笑颜：拍毕业照，相机倒数 3、2、1，她偏过头看他；定格成一张照片 */
const SHUTTER = 166.25;
function groupPhoto(t, turn, w = W, h = H) {
  sky(t, SKY.noon); teachBuilding(t, 0, 140, W, 4, { sign: '' });
  banner(120, 18, 240, '高三（2）班 毕业留念 2018.6', { t: 0, h: 14 });
  rect(0, 140, W, 130, C(0xd8ccb8));
  const rows = [[150, 11], [178, 12], [208, 11]];
  rows.forEach(([y, n], r) => { for (let i = 0; i < n; i++) { const x = 240 + (i - (n - 1) / 2) * 38, isHe = r === 2 && i === 6, isShe = r === 2 && i === 5; const lk = isHe ? 'he' : isShe ? 'she' : kid(500 + r * 20 + i); person({ look: lk, x, y: y + 40, view: isShe && turn > .5 ? 'three' : 'front', face: 1, t: 0, shadow: false, expr: { eyes: isShe && turn > .5 ? 'happy' : 'open', mouth: isShe && turn > .5 ? 'smile' : (hash(i, r) < .5 ? 'smile' : 'n') } }); } });
}
function sPhoto(t, k) {
  const turn = E.out(seg(t, SHUTTER - .3, SHUTTER)), frozen = t > SHUTTER + .15;
  if (!frozen) { groupPhoto(t, turn); photoCount(t, SHUTTER); }
  else {
    const d = E.out(seg(t, SHUTTER + .15, SHUTTER + 1.2));
    rect(0, 0, W, H, C(0x3a3430));
    const w = Math.round(lerp(W, 330, d)), h = Math.round(lerp(H, 186, d));
    photoFrame(Math.round(W / 2 - w / 2), Math.round(H / 2 - h / 2 - 8 * d), w, h, (ww, hh) => { withT(T, () => { const S = layer('gp'); withT(S, () => groupPhoto(SHUTTER, 1)); for (let y = 0; y < hh; y++) for (let x = 0; x < ww; x++) pset(x, y, S.d32[Math.floor(y * H / hh) * W + Math.floor(x * W / ww)]); }); }, { pad: Math.round(6 * d), bottom: Math.round(14 * d), sepia: .15 * d });
    if (d > .6) { const u = seg(t, SHUTTER + 1.0, SHUTTER + 1.8); ring(W / 2 + 4, H / 2 + 46, 10, C(0xe83a3a), u); }
  }
  if (t > SHUTTER && t < SHUTTER + .3) rect(0, 0, W, H, C(0xffffff), 1 - (t - SHUTTER) / .3);
}
/* 拍照前的倒数 3、2、1：相机自拍倒计时那样，圆圈里一个数字 */
function photoCount(t, at) {
  const cd = Math.ceil(at - t); if (cd < 1 || cd > 3) return;
  const ph = 1 - (at - t) % 1, pop = ph < .2 ? 1.3 - ph * 1.5 : 1;
  disc(50, 50, 22 * pop, C(0x1a2040), .55); ring(50, 50, 18 * pop, C(0xffffff), .35);
  for (let a = 0; a < (1 - ph) * TAU; a += .05) dot(50 + Math.sin(a) * 18 * pop, 50 - Math.cos(a) * 18 * pop, C(0xffffff));
  text(String(cd), 50, 42, { scale: 2, col: C(0xffffff) });
}
shot('bikes', 142.75, sBikes, { tr: { type: 'burn', dur: .6, pre: .3 }, post: { bloom: [.55, .75] } });
shot('earphones', 145.9, sEarphones, { tr: { type: 'fade', dur: .4, pre: .2 }, post: { bloom: [.55, .7] } });
shot('moonrail', 147.6, sMoonRail, { tr: { type: 'flashB', dur: .5, pre: .25 }, post: { bloom: [.5, .8], vig: .5 } });
shot('pledge', 150.45, sPledge, { tr: { type: 'flash', dur: .4, pre: .2 } });
shot('twowindows', 153.5, sTwoWindows, { tr: { type: 'iris', dur: .6, pre: .3 }, post: { bloom: [.5, .8], vig: .5 } });
shot('snow', 155.65, sSnow, { tr: { type: 'dither', dur: .6, pre: .3 } });
shot('party', 158.7, sParty, { tr: { type: 'whip', dur: .35, pre: .15 } });
shot('calendar', 160.45, sCalendar, { tr: { type: 'steps', dur: .45, pre: .2 } });
shot('photo', 163.5, sPhoto, { tr: { type: 'mosaic', dur: .5, pre: .25 } });
