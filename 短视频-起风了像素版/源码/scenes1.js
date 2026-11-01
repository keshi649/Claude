'use strict';
/* scenes1.js —— 前奏、第一段主歌。 */

/* 前奏 16.6~19.8：片名吹散后摇下来——铁桥上的绿皮火车、河、稻田、远山 */
function sBridge(t, k) {
  const cam = k * 9;
  sky(t, [[0, 0x2d78d4], [.5, 0x5aa6ec], [.85, 0xa6d6f8], [1, 0xdcf0fc]]);
  sun(t, 412, 30, 8);
  cloud(t, 110 - cam * .05, 96, 170, 21, CLOUD_PAL.noon); cloud(t, 290 - cam * .05, 84, 130, 22, CLOUD_PAL.noon); cloud(t, 450 - cam * .05, 100, 120, 23, CLOUD_PAL.noon);
  cloudDrift(t, [[60, 46, 70, 11], [250, 30, 54, 12], [380, 60, 46, 13]], CLOUD_PAL.noon, 2.5);
  birds(t, 7, 40 + k * 20, 44, 14, 2);
  ridge(t, 116, 52, 0x8fb0d6, 3, .006, cam * .08, { edge: 0xd8e8f8, peak: x => 26 * Math.exp(-((((x % 520) - 330) / 60) ** 2)) });
  vgrad(0, 100, W, 24, [[0, 0xd8eaf8], [1, 0xc8e0f2]], 4, .18);
  ridge(t, 126, 34, 0x6f98b2, 4, .011, cam * .16, { edge: 0xa6c8dc });
  vgrad(0, 116, W, 20, [[0, 0xd8eaf8], [1, 0xc0dcec]], 4, .22);
  ridge(t, 136, 14, 0x6e9e86, 6, .02, cam * .24, { edge: 0x94bea0 });
  treeline(t, 144, 6, 0x5f9e62, 5, cam * .3, 6);
  village(t, 30 - cam * .32, 145, 6, 3); village(t, 300 - cam * .32, 146, 5, 4);
  rect(0, 145, W, 5, C(0x6aa65a)); rect(0, 149, W, 1, C(0x8a7a5a));
  river(t, 150, 206, [[0, 0x2d78d4], [.6, 0x6ab0ec], [1, 0xc8e4f8]], { glint: [412 - cam * .1, 5, 0xfff4d0], sparkle: 60 });
  const bx0 = -30 - cam * .55, deck = 150, trainX = 120 + k * 64 - cam * .55;
  withT(layer('refl'), () => { trussBridge(bx0, W + 60, deck, 22, 200, 'far'); greenTrain(t, trainX, deck, 8); trussBridge(bx0, W + 60, deck, 22, 200, 'near'); });
  const RL = _pool['refl' + W + 'x' + H];
  for (let y = 0; y < 50; y++) { const sy = deck + 3 - y, ty = deck + 6 + y; if (sy < 0 || ty >= 206) continue; const off = Math.round(Math.sin(ty * .8 + t * 3) * 1.2); for (let x = 0; x < W; x++) { const c = RL.d32[sy * W + x - off]; if (c >>> 24) dot(x, ty, darker(c, .35), .55); } }
  trussBridge(bx0, W + 60, deck, 22, 200, 'piers');
  trussBridge(bx0, W + 60, deck, 22, 200, 'far');
  greenTrain(t, trainX, deck, 8);
  trussBridge(bx0, W + 60, deck, 22, 200, 'near');
  rect(0, 206, W, 3, C(0x8a7a5a)); rect(0, 206, W, 1, C(0xb8a880));
  paddy(t, 209, 270);
  poly([[300 - cam * 1.4, 209], [318 - cam * 1.4, 209], [400 - cam * 1.4, 270], [356 - cam * 1.4, 270]], C(0xc8b088));
  const p1 = pole(64 - cam * 1.2, 262, 120, { w: 3 }), p2 = pole(332 - cam * .8, 214, 46, { w: 1 });
  for (let j = 0; j < 2; j++) { wire(p1[j][0], p1[j][1], p2[j][0], p2[j][1], 8, t); wire(p2[j][0], p2[j][1], W + 40, p2[j][1] + 6, 5, t); wire(-40, p1[j][1] - 14, p1[j][0], p1[j][1], 6, t); }
  for (let i = 0; i < 26; i++) flower(hash(i, 81) * W, 240 + hash(i, 82) * 30, pick([0xf4a0c0, 0xfff0f0, 0xf8d860, 0xb8a0f0], i), t, i);
  bigTree(t, 452 - cam * 1.5, 270, 1.15);
  grass(t, 252, 272, [0x3a7230, 0x5a9a3a, 0x9ccc5a], .5, 1.4, 8, cam * 1.4);
  for (let i = 0; i < 3; i++) dragonfly(t, 120 + i * 120, 196 + i * 8, i);
  windLeaves(t, 18, [0, 120, W, 260], 80, 3);
  windStreaks(t, 7, [0, 30, W, 140], 240, 5, .35);
  motes(t, 16, [0, 100, W, 260], 0xfff6d0, .5);
}

/* 前奏 19.8~23.0：车厢里，七年后的他靠窗坐着，低头看手里的东西；电线杆的影子一下一下扫过 */
function sTrainIn(t, k) {
  trainInterior(t, { wins: [[236, 40, 230, 132]], seats: [120], view: { speed: 1.2 } });
  // 他：半身，侧过来对着窗户，低着头
  const sweep = mod(t * 260 * 1.2 / 150, 1), lit = Math.max(0, Math.sin(sweep * Math.PI * 2)) * .3;
  vhead({ x: 150, y: 120, R: 34, yaw: .55, look: 'heA', t, expr: { eyes: 'half', mouth: 'n', blush: .2 }, gaze: [.4, 1], rim: [0xfff0c8, .5 + lit, 1, 0, 2] });
  motes(t, 30, [180, 30, W, 220], 0xfff4d8, .7, 21);
}
shot('bridge', 16.45, sBridge, { tr: { type: 'wind', dur: .6, pre: .3 } });
shot('trainIn', 19.81, sTrainIn, { tr: { type: 'fade', dur: .4 } });

/* 0:26.1 这一路上走走停停：小站，火车慢慢停下 */
function sStation(t, k) {
  const slow = 1 - E.out(seg(k, 0, 2.8));
  station(t, { x: 0, train: () => greenTrain(t, 520 - k * 30 * slow - (1 - slow) * 84, 146, 6) });
  stationSign(110, 186, '清溪', 'QINGXI');
  lampPost(250, 200, 70); lampPost(440, 200, 70);
  // 长椅上的猫、鸽子
  rect(300, 196, 50, 4, C(0x8a5a3a)); rect(302, 200, 3, 10, C(0x5a4a3a)); rect(343, 200, 3, 10, C(0x5a4a3a)); rect(300, 186, 50, 3, C(0x8a5a3a));
  { const cx = 320, cy = 195, tail = Math.sin(t * 2) * 2; rect(cx, cy - 5, 9, 5, C(0xe8a050)); disc(cx + 9, cy - 6, 3, C(0xe8a050)); pset(cx + 8, cy - 9, C(0xe8a050)); pset(cx + 11, cy - 9, C(0xe8a050)); pset(cx + 10, cy - 6, C(0x2a2030)); line(cx, cy - 3, cx - 4, cy - 7 + tail, C(0xe8a050)); }
  for (let i = 0; i < 5; i++) { const fly = seg(t, 27.4 + i * .1, 28.6 + i * .1), x = 170 + i * 14 + fly * 80, y = 214 - fly * 120 + Math.sin(t * 12 + i) * fly * 3; if (fly <= 0) { rect(x, y - 3, 5, 3, C(0x8a8a9a)); rect(x + 4, y - 5, 2, 2, C(0x6a6a7a)); } else birds(0, 1, x, y, 0, i + 30, 0x6a6a7a); }
  windLeaves(t, 10, [0, 100, W, 250], 50, 9);
  motes(t, 30, [0, 40, W, 200], 0xfff0d0, .6, 33);
}
/* 0:29.3 顺着少年漂流的痕迹：他背着包下车，沿站台走（镜头跟着他），火车开走 */
function sPlatform(t, k) {
  const cam = k * 26;
  station(t, { x: cam, train: () => greenTrain(t, 260 + E.in(seg(k, .6, 3.2)) * 500 - cam, 146, 6) });
  lampPost(Math.round(380 - cam * 1.2), 200, 70); lampPost(Math.round(620 - cam * 1.2), 200, 70);
  person({ look: 'heA', x: 210, y: 222, face: 1, pose: walkPose(k * 2.4, 1), t, wind: .3, hold: (hx, hy) => rect(hx - 2, hy - 2, 4, 3, C(0xece0bc)) });
  windLeaves(t, 12, [0, 100, W, 250], 60, 10);
}
/* 0:32.6 迈出车站的前一刻：出站口，里面暗，门外白亮；他的剪影往光里走 */
function sExit(t, k) {
  exitHall(t);
  const x = 130 + k * 34;
  person({ look: 'heA', x, y: 226, face: 1, pose: walkPose(k * 2, .9), t, tint: [0x1a1420, .82], rim: [0xfff4dc, .9, 1, 0] });
}
shot('station', 26.06, sStation, { tr: { type: 'flash', dur: .5, pre: .25 } });
shot('platform', 29.25, sPlatform, { tr: { type: 'whip', dur: .4, pre: .15 } });
shot('exit', 32.45, sExit, { tr: { type: 'fade', dur: .5 } });

/* 0:35.7 竟有些犹豫：低机位，鞋停在地上那道光的边上 */
function sShoes(t, k) {
  rect(0, 0, W, H, C(0x2a2632));
  vgrad(0, 120, W, 150, [[0, 0x3a3442], [1, 0x4a4252]], 6);
  // 地上的光：从右边门口斜着进来，边缘一格格
  const edge = 250;
  poly([[edge, 140], [W, 140], [W, H], [edge - 60, H]], C(0xfff2d8), .85, 's');
  for (let i = 0; i < 6; i++) poly([[edge + i * 4, 140], [edge + 4 + i * 4, 140], [edge - 56 + i * 4, H], [edge - 60 + i * 4, H]], C(0xfff2d8), .12 * (6 - i) / 6, 's');
  motes(t, 50, [edge - 40, 20, W, H], 0xfff4dc, .9, 41, 2);
  const step = E.out(seg(k, 0, .7));
  vshoe(140 + step * 60, 230, 26, '#3a3036', { pants: '#3a3c48' });
  vshoe(40 + step * 30, 236, 26, '#3a3036', { pants: '#3a3c48' });
  // 他的手指捏紧了一下纸飞机（画面右上角伸进来一角）
  if (k > 1.2) { const s = 1 - seg(k, 1.2, 1.6) * .1; paperPlane(330, 70, 16 * s, -.2, { old: true }); }
}
/* 0:38.9 不禁笑这近乡情怯：他呼一口气，笑自己，抬眼看门外 */
function sSmileSelf(t, k) {
  bokeh(() => exitHall(t, { door: [220, 20, 240, 220] }), 6, { dots: 30 });
  const sm = seg(k, 1.0, 1.6), look = seg(k, 1.8, 2.6);
  vhead({ x: 170, y: 110, R: 36, yaw: lerp(-.25, -.45, look), look: 'heA', t, expr: { eyes: sm > .5 ? 'smile' : 'half', mouth: sm > .3 ? 'smile' : 'n', blush: .3 }, gaze: [look, -.2], rim: [0xfff4dc, .8, 1, 0, 2] });
}
/* 0:42.1 仍无可避免：迈进光里 */
function sStepOut(t, k) {
  rect(0, 0, W, H, C(0xfffcf4));
  const a = 1 - seg(k, .3, 2.2);
  townWide(t, { tod: 'noon' }); rect(0, 0, W, H, C(0xffffff), a * .9);
  person({ look: 'heA', x: 140 + k * 20, y: 250, face: 1, view: 'back', t, tint: [0x2a2030, a * .6] });
}
/* 0:44.6 而长野的天：远景，灰瓦的小城、电线、燕子、河 */
function sTownWide(t, k) { townWide(t, { tod: 'noon', x: k * 10 }); windStreaks(t, 6, [0, 20, W, 120], 160, 41, .3); }
/* 0:46.3 依旧那么暖：老街，摇扇子的老人、狗，他走过 */
function sOldStreet(t, k) {
  const cam = k * 20;
  oldStreet(t, { x: cam, wind: .3 });
  // 老人坐在竹椅上摇扇子
  { const x = Math.round(150 - cam * 1.0); rect(x - 6, 214, 14, 3, C(0xc8a060)); rect(x - 5, 217, 2, 8, C(0xa88040)); rect(x + 5, 217, 2, 8, C(0xa88040)); person({ look: { hair: 'buzz', hc: HAIRS.grey, outfit: 'teacher' }, x, y: 228, sitY: 214, pose: POSE.sit, t, face: 1 }); const fa = Math.sin(t * 6) * .4; poly([[x + 6, 200], [x + 14 + fa * 4, 194], [x + 14 - fa * 2, 204]], C(0xe8d8a0)); }
  // 一条狗趴着摇尾巴
  { const x = Math.round(330 - cam), tail = Math.sin(t * 9) * 2; rect(x, 220, 14, 6, C(0xd8a868)); disc(x + 15, 220, 4, C(0xd8a868)); rect(x + 15, 214, 3, 4, C(0xb88848)); pset(x + 17, 219, C(0x2a2030)); line(x, 222, x - 5, 218 + tail, C(0xd8a868)); }
  person({ look: 'heA', x: 210, y: 236, face: 1, pose: walkPose(k * 2.4, 1), t, wind: .3, hold: (hx, hy) => paperPlane(hx + 4, hy - 1, 3, -.1, { old: true }) });
  for (let i = 0; i < 3; i++) person({ look: kid(i + 40, true), x: Math.round(mod(380 + i * 150 - cam * 1.4, W + 100) - 50), y: 240 + i * 4, face: -1, pose: walkPose(k * 2.1 + i, 1), t });
  windLeaves(t, 10, [0, 100, W, 260], 50, 12);
  motes(t, 20, [0, 60, W, 220], 0xfff0c8, .5, 43);
}
/* 0:47.6 风吹起了从前：一阵大风——门帘、晾的衣服、叶子都往右飞，纸飞机从他手里飞走 */
const GUST = 47.75;
function sGust(t, k) {
  const g = seg(t, GUST - .1, GUST + .5) * (1 - seg(t, GUST + 2.4, GUST + 3.2) * .6);
  oldStreet(t, { x: 40 + k * 6, wind: .4 + g * 2.5 });
  const fly = seg(t, GUST + .05, GUST + 2.4);
  person({ look: 'heA', x: 200, y: 236, face: 1, pose: fly > 0 ? lerpPose(POSE.stand, POSE.reach, E.out(seg(fly, 0, .3))) : walkPose(k * 2.4, 1), t, wind: g,
    hold: fly > 0 ? null : (hx, hy) => paperPlane(hx + 4, hy - 1, 3, -.1, { old: true }) });
  if (fly > 0) { const x = 206 + E.in(fly) * 340, y = 196 - Math.sin(fly * Math.PI) * 70 - fly * 30 + Math.sin(fly * 14) * 4; paperPlane(x, y, 5 + fly * 3, -.3 + Math.sin(fly * 9) * .3, { old: true }); }
  windLeaves(t, 30 + g * 60, [0, 40, W, 260], 80 + g * 260, 13);
  windStreaks(t, 10 + g * 24, [0, 30, W, 250], 260 + g * 400, 14, .3 + g * .4);
}
shot('shoes', 35.6, sShoes, { tr: { type: 'cut', dur: .1 } });
shot('smileself', 38.8, sSmileSelf, { tr: { type: 'fade', dur: .4 } });
shot('stepout', 42.0, sStepOut, { tr: { type: 'flash', dur: .5, pre: .25 } });
shot('townwide', 44.5, sTownWide, { tr: { type: 'fade', dur: .4 } });
shot('oldstreet', 46.15, sOldStreet, { tr: { type: 'whip', dur: .35, pre: .1 } });
shot('gust', 47.45, sGust, { tr: { type: 'wind', dur: .5, pre: .2 } });
