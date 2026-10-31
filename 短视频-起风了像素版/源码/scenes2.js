'use strict';
/* scenes2.js —— 第一遍副歌：校门、校园、天台、运动会、走廊、窗户里的脸、她回头。 */

/* 0:50.1 从前初识这世间：他追着纸飞机冲进校门，一道光，变回十七岁；横幅"欢迎新同学" */
const GATE_FLASH = 51.25;
function sGate(t, k) {
  const young = t >= GATE_FLASH;
  sky(t, young ? SKY.morning : SKY.noon);
  cloudDrift(t, [[60, 40, 110, 141], [300, 30, 90, 142], [420, 60, 80, 143]], CLOUD_PAL.noon, 2);
  teachBuilding(t, 120, 150, 240, 4, { sign: young ? '' : '' });
  flag(t, 400, 150, 70);
  drawCanopy(makeCanopy(151, 90, 60, GREENS, { r: 6 }), 50, 160, t, 1.5);
  drawCanopy(makeCanopy(152, 90, 60, GREENS, { r: 6 }), 440, 162, t, 1.5, { ph: 2 });
  rect(0, 160, W, H - 160, C(0xd8ccb8)); rect(0, 160, W, 2, C(0xb8ac98));
  schoolGate(t, { gx: 240, gy: 214, banner: young ? '欢迎新同学' : null });
  if (young) for (let i = 0; i < 5; i++) person({ look: kid(i + 60), x: Math.round(300 + i * 30 - k * 10), y: 226 + (i % 2) * 6, face: -1, pose: walkPose(k * 2 + i, 1), t });
  const run = seg(k, 0, 2.2), hx = 60 + run * 230;
  person({ look: young ? 'he' : 'heA', x: hx, y: 236, face: 1, pose: walkPose(k * 3.4, 1, true), t, wind: .5 });
  const px = 120 + seg(k, 0, 2.6) * 300, py = 170 - Math.sin(seg(k, 0, 2.6) * Math.PI) * 30;
  paperPlane(px, py, young ? 4 : 4, -.1, { old: !young });
  if (Math.abs(t - GATE_FLASH) < .5) { const a = 1 - Math.abs(t - GATE_FLASH) / .5; glowDisc(240, 160, 260 * a + 40, C(0xffffff), a, 6); rect(0, 0, W, H, C(0xffffff), a * a * .9); }
  windLeaves(t, 18, [0, 60, W, 250], 70, 15);
}
/* 0:53.2 万般流连：校园——教学楼、红旗、篮球场、纸飞机滑过 */
function sCampus(t, k) {
  const cam = k * 16;
  sky(t, SKY.morning); sun(t, 420, 30, 8);
  cloudDrift(t, [[60, 34, 130, 151], [280, 24, 90, 152]], CLOUD_PAL.morning, 2);
  teachBuilding(t, 40 - cam * .5, 160, 330, 5);
  flag(t, 410 - cam * .5, 160, 90);
  for (let i = 0; i < 4; i++) drawCanopy(makeCanopy(160 + i, 70, 50, GREENS, { r: 5 }), mod(i * 140 - cam * .8, W + 140) - 40, 176, t, 1.5, { ph: i });
  rect(0, 172, W, H - 172, C(0xc86a52)); for (let x = mod(-cam, 120); x < W; x += 120) { rect(x, 172, 2, 98, C(0xf0e8e0)); }
  rect(0, 172, W, 2, C(0xf0e8e0));
  // 篮球架和打球的人
  { const bx = Math.round(330 - cam * 1.1); rect(bx, 120, 3, 80, C(0x5a5a6a)); rect(bx - 12, 116, 18, 12, C(0xf4f4f8)); rect(bx - 6, 128, 8, 2, C(0xe86a2a)); }
  for (let i = 0; i < 4; i++) person({ look: kid(70 + i), x: Math.round(250 + i * 30 - cam * 1.1 + Math.sin(t * 2 + i) * 10), y: 220 + (i % 2) * 8, face: i % 2 ? 1 : -1, pose: walkPose(t * 3 + i, .8, true), t });
  { const bp = fract(t * .8), bx = 290 + bp * 40 - cam * 1.1, by = 200 - Math.sin(bp * Math.PI) * 50; disc(bx, by, 2.4, C(0xe8702a)); }
  paperPlane(60 + k * 160, 90 + Math.sin(t * 2) * 8, 5, .05);
  birds(t, 5, 100 + k * 30, 40, 12, 9);
  windLeaves(t, 14, [0, 60, W, 250], 50, 16);
}
/* 0:54.9 看着天边似在眼前：天台，云近得像伸手就能摸到 */
function sRoofSky(t, k) {
  sky(t, [[0, 0x2f7fd8], [.6, 0x6ab4f0], [1, 0xb8e0fc]]); sun(t, 90, 40, 10);
  cloud(t, 330, 150, 260, 171, CLOUD_PAL.noon); cloud(t, 100, 130, 160, 172, CLOUD_PAL.noon); cloudDrift(t, [[200, 50, 90, 173], [420, 70, 60, 174]], CLOUD_PAL.noon, 3);
  rooftop(t, { floorY: 234, dusk: 0, door: false, tank: false, puddles: false });
  const reach = E.io(seg(k, .5, 1.6));
  person({ look: 'he', x: 250, y: 252, face: 1, view: 'back', t, arms: [.12, .1, lerp(.12, 2.9, reach), lerp(.1, .2, reach)], wind: .4 });
  birds(t, 6, 60 + k * 30, 70, 20, 11);
  windStreaks(t, 8, [0, 40, W, 200], 200, 17, .35);
}
/* 0:57.8 也甘愿赴汤蹈火去走它一遍：运动会一千米——看台上喊加油，他跑在最前面 */
function sRace(t, k) {
  const cam = k * 60;
  sky(t, SKY.noon); cloudDrift(t, [[80, 20, 100, 181], [300, 14, 70, 182]], CLOUD_PAL.noon, 2);
  rect(0, 40, W, 100, C(0x9a9aa6)); for (let r = 0; r < 7; r++) rect(0, 46 + r * 14, W, 2, C(0x8a8a96));
  crowd(t, 52, 6, { x: cam, cheer: true });
  banner(Math.round(60 - cam * .6), 34, 150, '高二（2）班 加油！', { t, wave: .6 });
  banner(Math.round(360 - cam * .6), 34, 110, '更快 更高 更强', { t, wave: .6, col: 0x3a6ad8 });
  rect(0, 138, W, 6, C(0xf0f0f0));
  trackField(t, 144, { x: cam, trackY: 6, trackH: 70 });
  const runners = [[0, 'he'], [-26, kid(81)], [-40, kid(82)], [-60, kid(83)]];
  runners.forEach(([dx, lk], i) => person({ look: lk, x: Math.round(240 + dx + Math.sin(t * 1.3 + i) * 4), y: 170 + i * 14, face: 1, pose: walkPose(t * 4.2 + i * .5, 1, true), t, wind: .4 }));
  // 看台上的她：站起来喊
  const sx = Math.round(330 - cam * .6 + 600) % 600;
  windLeaves(t, 10, [0, 100, W, 260], 120, 18);
}
/* 1:02.9 如今走过这世间：走廊，一格格窗光，同学打闹 */
function sCorridor(t, k) {
  const cam = k * 22;
  corridor(t, { x: cam });
  for (let i = 0; i < 3; i++) person({ look: kid(90 + i), x: Math.round(mod(120 + i * 140 - cam * 1.2, W + 80) - 40), y: 232, face: i % 2 ? 1 : -1, pose: i === 1 ? POSE.wave : POSE.stand, t, expr: { mouth: 'open' } });
  person({ look: 'he', x: 220, y: 236, face: 1, pose: walkPose(k * 2.4, 1), t });
  motes(t, 30, [0, 60, W, 230], 0xfff4d0, .6, 45);
}
/* 1:05.9 万般流连：纸飞机沿着走廊的窗户滑过去（镜头跟着纸飞机） */
function sPlaneCorridor(t, k) {
  const cam = k * 90;
  corridor(t, { x: cam, rail: true });
  paperPlane(220 + Math.sin(t * 2) * 10, 110 + Math.sin(t * 3) * 6, 9, -.05 + Math.sin(t * 3) * .05);
  windStreaks(t, 8, [0, 60, W, 200], 300, 19, .4);
}
/* 1:07.7 翻过岁月不同侧脸：窗户里一张张同学的侧脸 */
function sFaces(t, k) {
  const cam = k * 50;
  rect(0, 0, W, H, C(0xeee8dc)); rect(0, 200, W, 70, C(0x7cb898));
  const pitch = 120;
  for (let i = -1; i < 5; i++) {
    const x = Math.round(i * pitch - mod(cam, pitch)), id = Math.floor((i * pitch + cam) / pitch);
    rect(x + 10, 30, 100, 150, C(0x2a2430)); rect(x + 12, 32, 96, 146, C(0xa8d0ec));
    withT(layer('facewin', 96, 146), () => { clear(C(0xbfe0f4)); vgrad(0, 0, 96, 146, [[0, 0xd8eef8], [1, 0xa8d0ec]], 6); vhead({ x: 50, y: 64, R: 22, yaw: (id % 2 ? .9 : -.9) + Math.sin(t + id) * .1, look: vpKid(id + 200), t, expr: { eyes: hash(id, 3) < .3 ? 'smile' : 'open', mouth: hash(id, 4) < .5 ? 'smile' : 'n' } }); });
    blit(_pool['facewin96x146'], x + 12, 32);
    rect(x + 12, 32, 96, 146, C(0xffffff), .12, 's'); line(x + 30, 32, x + 70, 178, C(0xffffff), .25, 's');
  }
}
/* 1:10.8 措不及防闯入你的笑颜：纸飞机撞上她的马尾，她回过头（特写），笑了 */
const TURN_AT = 72.3, SMILE_AT = 74.0;
function sTurn(t, k) {
  bokeh(() => { classroom(t, { tod: 'day', x: 10, wind: 1, floorY: 210 }); for (let i = 0; i < 4; i++) desk(260 + i * 60, 238, { books: 5 }); }, 5, { dots: 50, tint: [0x5a4a60, .18] });
  for (let kk = 0; kk < 4; kk++) { const a = .07 + .03 * Math.sin(t * .9 + kk); poly([[20 + kk * 46, 0], [52 + kk * 46, 0], [190 + kk * 60, H], [150 + kk * 60, H]], C(0xfff2c8), a, 's'); }
  const u = E.io3(seg(t, TURN_AT, TURN_AT + 1.1)), yaw = lerp(Math.PI - .05, -.18, u);
  const sm = seg(t, SMILE_AT, SMILE_AT + .4);
  const bump = t > TURN_AT - .5 && t < TURN_AT ? Math.sin((t - TURN_AT + .5) / .5 * Math.PI) * 2 : 0;
  vhead({ x: 318, y: 108 + bump, R: 40 + u * 3, yaw, tilt: -.05 * u, look: 'she', t, wind: .25 + .2 * Math.sin(t * 1.3),
    expr: { eyes: sm > .5 ? 'smile' : (t < SMILE_AT && Math.abs(t - (SMILE_AT - .5)) < .06 ? 'closed' : 'open'), mouth: sm > .4 ? 'laugh' : sm > .1 ? 'smile' : 'n', blush: .45 + sm * .5 },
    gaze: [-.3 * u, 0], rim: [0xfff0c8, .7, -1, 0, 2] });
  const pk = t - (TURN_AT - 1.3);
  if (pk > 0 && pk < 4) {
    let px, py, ang;
    if (pk < 1.3) { px = lerp(-30, 258, pk / 1.3); py = lerp(50, 86, pk / 1.3) + Math.sin(pk * 5) * 2; ang = .12; }
    else { const q = pk - 1.3; px = 258 - q * 60; py = 86 + q * q * 50 + q * 14; ang = -1.0 - q * 2.2; }
    paperPlane(px, py, 12, ang, { old: false });
  }
  windLeaves(t, 10, [0, 0, W, 200], 40, 5, [[0xfff8f0, 0xe8e0d8], [0xffe8f0, 0xf0c8d8]]);
  motes(t, 30, [0, 0, W, H], 0xfff6d8, .8, 11, 2);
}

/* 1:33.2 也曾指尖弹出盛夏：黄昏的天台弹吉他（样张那一镜，先放在这里） */
const TIE_AT = 94.6;
function sRoofGuitar(t, k) {
  sky(t, 'dusk');
  sun(t, 360, 150, 13, 0xfff0c0, 0xffa060, 1);
  cloudDrift(t, [[40, 70, 120, 51], [220, 50, 90, 52], [400, 84, 110, 53], [300, 116, 70, 54]], CLOUD_PAL.dusk, 1.5);
  birds(t, 5, 60 + k * 8, 60, 10, 4, 0x3a2440);
  ridge(t, 172, 22, 0x6a4a7a, 9, .012, 0, { edge: 0xc87a8a });
  skyline(t, 186, 0x4a3458, 5, k * 2, { lit: .25, win: 0xffc878 });
  river(t, 186, 192, SKY.dusk, { glint: [360, 8, 0xffd090], sparkle: 10 });
  rooftop(t, { floorY: 222, dusk: 1 });
  rect(300, 202, 22, 14, C(0x241a2a)); rect(301, 203, 20, 12, C(0x8a5a4a)); rect(301, 203, 20, 2, C(0xb07a5a));
  const strum = Math.sin(t * 7.5) * .12;
  person({ look: 'he', x: 312, y: 236, sitY: 204, face: 1, pose: { ...POSE.guitar, aN: [.62 + strum, 1.3 - strum] }, t, rim: [0xffb070, .7, 1, 0], expr: { eyes: 'closed', mouth: 'smile' },
    hold: (hx, hy, f, J) => guitar(hx - 6 * f, hy + 1, -.55, f) });
  for (let i = 0; i < 6; i++) { const ph = fract(t * .35 + i / 6), x = 330 + ph * 40 + Math.sin(ph * 8 + i) * 6, y = 196 - ph * 90; note(x, y, 0xfff0c8, Math.sin(ph * Math.PI)); }
  const peek = smooth(seg(t, 93.0, 93.8));
  person({ look: LOOK.she, x: 50 + peek * 6, y: 222, face: 1, view: 'three', pose: POSE.standHand, t, expr: { eyes: 'open', mouth: 'n', blush: true }, wind: .8 });
  rect(20 + 40, 222 - 60, 4, 60, C(0x7a8a9a));
  const tu = seg(t, TIE_AT, TIE_AT + 1.6);
  if (tu > 0) { const x = lerp(58, 300, E.out(tu)), y = lerp(178, 232, tu * tu) - Math.sin(tu * Math.PI) * 30; hairTie(x, y, t); }
  windLeaves(t, 16, [0, 100, W, 240], 70, 6, [[0xf8c070, 0xc88040], [0xf0a080, 0xc06a50]]);
  windStreaks(t, 6, [0, 40, W, 160], 220, 9, .3, 0xffe0c0);
  motes(t, 24, [0, 60, W, 230], 0xffd8a0, .7, 13);
}

shot('gate', 49.85, sGate, { tr: { type: 'wind', dur: .5, pre: .25 } });
shot('campus', 53.05, sCampus, { tr: { type: 'iris', dur: .5, pre: .25 } });
shot('roofsky', 54.8, sRoofSky, { tr: { type: 'whipV', dur: .4, pre: .15, dir: 1 } });
shot('race', 57.7, sRace, { tr: { type: 'flash', dur: .4, pre: .2 } });
shot('corridor', 62.8, sCorridor, { tr: { type: 'whip', dur: .4, pre: .15 } });
shot('planecorr', 65.75, sPlaneCorridor, { tr: { type: 'fade', dur: .3 } });
shot('faces', 67.6, sFaces, { tr: { type: 'blinds', dur: .45, pre: .2 } });
shot('turn', 70.65, sTurn, { tr: { type: 'iris', dur: .5, pre: .2, cx: 300, cy: 110 } });
shot('roof', 93.05, sRoofGuitar, { tr: { type: 'burn', dur: .6, pre: .3 }, post: { bloom: [.6, .7], vig: .45 } });
