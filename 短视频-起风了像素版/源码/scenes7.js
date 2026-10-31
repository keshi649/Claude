'use strict';
/* scenes7.js —— 最后的副歌（同学聚会）、"啊——"、尾奏。 */

/* 聚会的布景：黄昏的操场，小灯串，横幅 */
function reunionBg(t, o = {}) {
  sky(t, SKY.dusk); sun(t, 420, 170, 13, 0xfff0c0, 0xffa060);
  cloudDrift(t, [[60, 50, 120, 601], [260, 30, 100, 602]], CLOUD_PAL.dusk, 1.2);
  teachBuilding(t, 20 - (o.x || 0) * .3, 170, 440, 4, { night: true, lit: .4, wall: 0xc8a8b0, rail: 0xb898a0 });
  rect(0, 170, W, H - 170, C(0x8a6a6a)); trackField(t, 176, { trackY: 4, trackH: 30, grass: 0x6a7a5a, x: o.x || 0 });
  for (let i = 0; i < 40; i++) { const x = i * 13 - mod((o.x || 0) * .5, 13), y = 26 + Math.sin(i * .35) * 10; disc(x, y, 1.6, C(pick([0xffe08a, 0xffb8c8, 0x9ae0ff], i))); glowDisc(x, y, 6, C(0xffe6b0), .4, 3); if (i) line(x - 13, 26 + Math.sin((i - 1) * .35) * 10, x, y, C(0x3a2a3a)); }
  if (o.banner !== false) banner(110 - (o.x || 0) * .3, 40, 260, '高三（2）班 毕业七年 回家看看', { t, h: 14 });
}
const ADULTS = [0, 1, 2, 3, 4, 5, 6, 7, 8].map(i => kid(800 + i, true));
/* 4:06.2 我仍感叹于世界之大：同学聚会，大家三三两两聊着天，他走进来，四下找 */
function sReunion(t, k) {
  reunionBg(t, { x: k * 10 });
  ADULTS.forEach((lk, i) => person({ look: lk, x: 30 + i * 52 + (i > 4 ? 40 : 0) - k * 6, y: 236 + (i % 2) * 8, face: i % 2 ? -1 : 1, pose: i % 3 ? POSE.stand : POSE.wave, t, expr: { mouth: Math.sin(t * 6 + i) > 0 ? 'open' : 'smile' }, rim: [0xffb070, .5, 1, 0] }));
  person({ look: 'heA', x: 120 + k * 30, y: 248, face: 1, pose: walkPose(k * 2, .9), t, rim: [0xffb070, .6, 1, 0] });
}
/* 4:09.9 也沉醉于儿时情话：大家笑成一团，身后淡淡地叠着十七岁的他们（坐在课桌前） */
function sJokes(t, k) {
  reunionBg(t, { banner: false });
  const G = layer('ghost'); withT(G, () => { for (let i = 0; i < 5; i++) { desk(30 + i * 96, 230, { books: 3 }); person({ look: kid(300 + i), x: 80 + i * 96, y: 240, sitY: 218, face: -1, pose: POSE.sitDesk, t, expr: { eyes: 'happy', mouth: 'open' }, shadow: false }); } });
  blit(G, 0, 0, { alpha: .32 });
  [2, 3, 5, 6].forEach((j, i) => person({ look: ADULTS[j], x: 160 + i * 50, y: 248, face: i === 0 ? 1 : -1, pose: i === 0 ? (Math.sin(t * 3) > 0 ? POSE.throw1 : POSE.stand) : POSE.stand, t, expr: { eyes: 'happy', mouth: 'open' }, rim: [0xffb070, .5, 1, 0] }));
  person({ look: 'heA', x: 400, y: 250, face: -1, pose: POSE.stand, t, expr: { eyes: 'happy', mouth: 'open' }, rim: [0xffb070, .6, 1, 0] });
  for (let i = 0; i < 4; i++) { const ph = fract(t * .8 + i / 4); text('哈哈', 140 + i * 80, 170 - ph * 40, { col: C(0xffffff), out: C(0x3a2a40), alpha: Math.sin(Math.PI * ph) }); }
}
/* 4:13.2 不剩真假不做挣扎：她来了，大家起哄"哦——"，把他往前推 */
function sPush(t, k) {
  reunionBg(t, { banner: false });
  const push = E.io(seg(k, .8, 2.2));
  [1, 4, 7, 8].forEach((j, i) => person({ look: ADULTS[j], x: 120 + i * 30 + push * 50, y: 248, face: 1, pose: push > 0 && push < 1 ? POSE.give : POSE.wave, t, expr: { mouth: 'open' }, rim: [0xffb070, .5, 1, 0] }));
  person({ look: 'heA', x: 250 + push * 70, y: 250, face: 1, pose: push > 0 && push < 1 ? walkPose(t * 2, .3) : POSE.stand, t, expr: { eyes: 'wide', mouth: 'o' }, rim: [0xffb070, .6, 1, 0] });
  person({ look: 'sheA', x: 420 - E.out(seg(k, 0, 1)) * 60, y: 248, face: -1, pose: k < 1 ? walkPose(t * 1.8, .9) : POSE.stand, t, wind: .3, expr: { mouth: 'smile' }, rim: [0xffb070, .6, -1, 0] });
  const a = seg(k, .8, 1.2) * (1 - seg(k, 2.6, 3.1)); if (a > 0) text('哦——', 150, 150, { scale: 2, col: C(0xffffff), out: C(0x3a2a40), alpha: a });
}
/* 4:16.4 无谓笑话：两个人面对面，都不好意思地笑（两张大头像） */
function sFace(t, k) {
  bokeh(() => reunionBg(t, { banner: true }), 6, { dots: 40 });
  vhead({ x: 150, y: 116, R: 34, yaw: .55, look: 'heA', t, expr: { eyes: 'smile', mouth: 'smile', blush: .8 }, rim: [0xffb070, .7, 1, 0, 2] });
  vhead({ x: 340, y: 120, R: 33, yaw: -.55, look: 'sheA', t, wind: .3, expr: { eyes: 'smile', mouth: 'smile', blush: .9 }, rim: [0xffb070, .7, -1, 0, 2] });
}
/* 4:19.0 我终将青春还给了她：他把发黄的纸飞机和红发绳一起递给她 */
function sGive(t, k) {
  bokeh(() => reunionBg(t, { banner: false }), 6, { dots: 30 });
  const u = E.io(seg(k, .2, 1.4));
  // 他的手（右下）托着纸飞机和红发绳，递过去；她的手（左上）接
  const hx = lerp(380, 300, u), hy = lerp(230, 170, u);
  capsule(W + 40, H + 40, hx + 20, hy + 20, 34, C(0x2a2030)); capsule(W + 40, H + 40, hx + 20, hy + 20, 32, C(0xf4f6fa));
  ellipse(hx, hy, 22, 14, C(0x2a2030)); ellipse(hx, hy, 21, 13, C(0xf2cdb0)); for (let j = 0; j < 4; j++) capsule(hx - 18 + j * 2, hy - 8 + j * 5, hx - 26 + j * 2, hy - 6 + j * 5, 7, C(0xf2cdb0));
  paperPlane(hx + 6, hy - 12, 26, -.3, { old: true });
  hairTie(hx - 8, hy - 2, t);
  const take = E.out(seg(k, 1.8, 3.0));
  if (take > 0) { const sx = lerp(60, 240, take), sy = lerp(60, 150, take); capsule(-40, -40, sx - 16, sy - 16, 28, C(0x2a2030)); capsule(-40, -40, sx - 16, sy - 16, 26, C(0xefe2cc)); disc(sx, sy, 13, C(0x2a2030)); disc(sx, sy, 12, C(0xf8d4bc)); }
  motes(t, 30, [0, 0, W, H], 0xffd8a0, .8, 87, 2);
}
/* 4:22.8 连同指尖弹出的盛夏：她拆开纸飞机——一张卷子，背面写着"我喜欢你 2018.6.7" */
function sUnfold(t, k) {
  rect(0, 0, W, H, C(0x3a2a3a)); bokeh(() => reunionBg(t, { banner: false }), 8, { tint: [0x2a1a3a, .4] });
  const u = E.io(seg(k, .1, 1.4));
  const w = lerp(60, 200, u), h = lerp(40, 240, u), x = 240 - w / 2, y = 135 - h / 2;
  paper(x, y, w, h, { col: 0xf4ecd4, lines: u > .5 });
  for (let i = 1; i < 4; i++) line(x + w * i / 4, y, x + w * i / 4, y + h, C(0xd8cca8), u);
  line(x, y + h / 2, x + w, y + h / 2, C(0xd8cca8), u);
  if (u > .7) { const a = seg(k, 1.4, 2.2); text('我喜欢你', 240, 110, { scale: 2, col: C(0x3a3448), alpha: a, sp: 3 }); text('2018.6.7', 280, 160, { size: 8, col: C(0x6a6478), alpha: a }); }
  // 两只手捏着纸的两边
  for (const sd of [-1, 1]) { const hx = 240 + sd * (w / 2 + 2), hy = 150; ellipse(hx, hy, 9, 13, C(0x2a2030)); ellipse(hx, hy, 8, 12, C(0xf8d4bc)); capsule(hx + sd * 6, hy, hx + sd * 60, H + 20, 20, C(0x2a2030)); capsule(hx + sd * 6, hy, hx + sd * 60, H + 20, 18, C(0xefe2cc)); }
}
/* 4:26.2 心之所动就随风去了：风把纸吹上了天，两个人仰头看 */
function sFlyAway(t, k) {
  reunionBg(t, { banner: false });
  const u = seg(k, .2, 5);
  const px = 240 + u * 160 + Math.sin(u * 12) * 20, py = 200 - u * 220;
  poly([[px - 8, py - 6], [px + 8, py - 5 + Math.sin(t * 6) * 3], [px + 7, py + 6], [px - 7, py + 5]], C(0xf4ecd4));
  person({ look: 'heA', x: 220, y: 248, face: 1, view: 'three', pose: POSE.lookUp, t, rim: [0xffb070, .6, 1, 0] });
  person({ look: 'sheA', x: 250, y: 248, face: -1, view: 'three', pose: POSE.lookUp, t, wind: .6, rim: [0xffb070, .6, -1, 0] });
  windLeaves(t, 30, [0, 0, W, H], 120, 611, [[0xffffff, 0xeeeedc]]);
  windStreaks(t, 10, [0, 0, W, 200], 260, 612, .35, 0xffe0c0);
}
/* 4:31.7 以爱之名你还愿意吗：她翻开素描本——画的下面也写着"我喜欢你 2018.6" */
function sReveal(t, k) {
  rect(0, 0, W, H, C(0x3a2a3a)); bokeh(() => reunionBg(t, { banner: false }), 8, { tint: [0x2a1a3a, .4] });
  rect(96, 22, 290, 226, C(0x2a2430)); rect(98, 24, 286, 222, C(0xfaf6ea)); rect(98, 24, 8, 222, C(0xe8e0cc));
  sketch(() => vhead({ x: 96, y: 76, R: 36, yaw: .35, look: 'he', t: 3, expr: { eyes: 'half', mouth: 'o', blush: 0 }, gaze: [.2, 1], tilt: .15 }), 140, 26, 200, 170);
  const thumb = E.io(seg(k, 1.0, 2.2));
  text('我喜欢你', 240, 200, { scale: 2, col: C(0x4a4658), sp: 3 }); text('2018.6', 350, 226, { size: 8, col: C(0x7a7a90) });
  // 她的拇指挪开，露出底下那行字
  const tx = lerp(240, 330, thumb), ty = lerp(208, 236, thumb); ellipse(tx, ty, 26, 16, C(0x2a2030)); ellipse(tx, ty, 25, 15, C(0xf8d4bc)); ellipse(tx - 6, ty - 4, 10, 6, C(0xfde6d4));
  capsule(tx + 20, ty + 10, tx + 120, H + 40, 40, C(0x2a2030)); capsule(tx + 20, ty + 10, tx + 120, H + 40, 38, C(0xefe2cc));
}
/* 4:39.0 "啊——"：纸在风里折回一只纸飞机，飞过黄昏的小城 */
function sPaperFly(t, k) {
  const cam = k * 30;
  sky(t, SKY.sunset); sun(t, 380, 150, 14, 0xfff0c0, 0xffa060);
  cloudDrift(t, [[60, 40, 140, 621], [260, 30, 110, 622], [420, 60, 120, 623]], CLOUD_PAL.sunset, 2);
  ridge(t, 150, 30, 0x8a6a9a, 624, .008, cam * .1, { edge: 0xe8a0a0 });
  skyline(t, 186, 0x6a4a78, 625, cam * .5, { lit: .4 });
  river(t, 186, 206, SKY.sunset, { glint: [380, 10, 0xffd8a0] });
  skyline(t, 270, 0x3a2848, 626, cam * 1.2, { lit: .5, tall: 50 });
  const fold = seg(k, 0, 1.2);
  const px = 140 + k * 30 + Math.sin(t * 1.5) * 20, py = 110 + Math.sin(t * 2) * 14;
  if (fold < 1) { const w = 16 * (1 - fold) + 4; poly([[px - w, py - w * .7], [px + w, py - w * .6], [px + w * .8, py + w * .7], [px - w * .8, py + w * .6]], C(0xf4ecd4)); }
  else paperPlane(px, py, 9, -.15 + Math.sin(t * 2) * .1, { old: true });
  for (let i = 0; i < 16; i++) dot(px - 10 - i * 3, py + Math.sin(t * 2 - i * .3) * 2, C(0xffe0b0), .5 * (1 - i / 16), 's');
  birds(t, 6, 40 + k * 20, 60, 16, 627, 0x3a2440);
  windStreaks(t, 8, [0, 40, W, 200], 220, 628, .3, 0xffe0c0);
}
/* 4:45.4 七年后的合影：3、2、1，这回两个人互相看着 */
const SHUTTER2 = 288.6;
function groupPhoto2025(t, turn) {
  reunionBg(t, { banner: false });
  banner(120, 40, 240, '高三（2）班 毕业七年 2025', { t: 0, h: 14 });
  const rows = [[160, 10], [190, 11]];
  rows.forEach(([y, n], r) => { for (let i = 0; i < n; i++) { const x = 240 + (i - (n - 1) / 2) * 40, isHe = r === 1 && i === 6, isShe = r === 1 && i === 5; const lk = isHe ? 'heA' : isShe ? LOOK.sheA2 : kid(800 + r * 20 + i, true); person({ look: lk, x, y: y + 40, view: (isHe || isShe) && turn > .5 ? 'side' : 'front', face: isHe ? -1 : 1, t: 0, shadow: false, expr: { eyes: (isHe || isShe) && turn > .5 ? 'happy' : 'open', mouth: 'smile' } }); } });
}
function sPhoto2025(t, k) {
  const turn = E.out(seg(t, SHUTTER2 - .3, SHUTTER2));
  groupPhoto2025(t, turn); photoCount(t, SHUTTER2);
  if (t > SHUTTER2 && t < SHUTTER2 + .3) rect(0, 0, W, H, C(0xffffff), 1 - (t - SHUTTER2) / .3);
}
/* 4:50.3 两张合影并排：2018 年她偷偷看他，2025 年两个人互相看着 */
function sTwoPhotos(t, k) {
  rect(0, 0, W, H, C(0x3a3430)); for (let kk = 0; kk < 3; kk++) poly([[0, kk * 70], [W, kk * 70 + 60], [W, kk * 70 + 90], [0, kk * 70 + 30]], C(0xffc890), .06, 's');
  const a = E.out(seg(k, 0, .8)), b = E.out(seg(k, .6, 1.4));
  const shot_ = (fn, x, y, al) => photoFrame(x, y, 192, 108, (w, h) => { const S = layer('gp2'); withT(S, () => fn()); for (let yy = 0; yy < h; yy++) for (let xx = 0; xx < w; xx++) pset(xx, yy, S.d32[Math.floor(yy * H / h) * W + Math.floor(xx * W / w)]); }, { pad: 6, bottom: 14, sepia: al });
  shot_(() => groupPhoto(SHUTTER, 1), Math.round(lerp(-200, 30, a)), 70, .25);
  shot_(() => groupPhoto2025(SHUTTER2, 1), Math.round(lerp(W + 40, 258, b)), 80, 0);
  text('2018', Math.round(lerp(-200, 30, a)) + 96, 188, { size: 8, col: C(0x6a6478) }); text('2025', Math.round(lerp(W + 40, 258, b)) + 96, 198, { size: 8, col: C(0x6a6478) });
}
/* 4:55.0 月亮下，两个人并肩走出校门 */
function sWalkOut(t, k) {
  oldStreet(t, { x: k * 14, tod: 'night', wind: .2 });
  lampPost(140 - k * 14, 236, 80, { lit: 1 }); lampPost(420 - k * 14, 236, 80, { lit: 1 });
  person({ look: LOOK.sheA2, x: 220, y: 248, face: 1, pose: walkPose(k * 1.8, .9), t, wind: .3, rim: [0xffe0a0, .4, -1, 0] });
  person({ look: 'heA', x: 200, y: 250, face: 1, pose: walkPose(k * 1.8 + .5, .9), t, rim: [0xffe0a0, .4, -1, 0] });
  const fade = seg(k, 8.2, 9.6); if (fade > 0) rect(0, 0, W, H, C(0x080612), fade);
}
/* 5:04.6 夜里的天台：十七岁的他们发着淡淡的光坐在女儿墙上，七年后的他们站在后面看着；少年把纸飞机扔向月亮 */
const LAUNCH = 309.4;
function sFinale(t, k) {
  sky(t, 'night'); stars(t, 200, [0, 0, W, 180]); moon(t, 360, 70, 18);
  cloudDrift(t, [[60, 120, 140, 631], [300, 140, 120, 632]], CLOUD_PAL.night, .8);
  skyline(t, 214, 0x1a1830, 633, 0, { lit: .35 });
  rooftop(t, { floorY: 236, dusk: 0, door: false, tank: false, puddles: false });
  rect(0, 0, W, H, C(0x1a1840), .35);
  // 十七岁的他们：坐在女儿墙上，半透明发光
  const G = layer('ghost2'); withT(G, () => { person({ look: 'he', x: 290, y: 232, sitY: 214, face: 1, pose: t > LAUNCH - .5 && t < LAUNCH + .4 ? lerpPose(POSE.throw0, POSE.throw1, seg(t, LAUNCH - .5, LAUNCH)) : POSE.sit, t, shadow: false }); person({ look: 'she', x: 312, y: 232, sitY: 214, face: 1, pose: POSE.sit, t, shadow: false, wind: .3 }); });
  tintSurf(G, C(0xa8c8ff), .3); blit(G, 0, 0, { alpha: .75 }); rimLight(G, 0, -1, C(0xd8e8ff), .6);
  for (let i = 0; i < 20; i++) { const x = 280 + hash(i, 641) * 50, y = 190 + hash(i, 642) * 40; if (Math.sin(t * 3 + i) > .6) pset(x, y, C(0xd8e8ff)); }
  // 七年后的他们：站在后面
  person({ look: 'heA', x: 150, y: 256, face: 1, view: 'back', t, tint: [0x1a1830, .4] });
  person({ look: LOOK.sheA2, x: 174, y: 256, face: 1, view: 'back', t, tint: [0x1a1830, .4], wind: .3 });
  // 纸飞机飞向月亮
  const u = seg(t, LAUNCH, LAUNCH + 3.4); if (u > 0) { const x = lerp(300, 360, E.out(u)), y = lerp(200, 74, E.out(u)) - Math.sin(u * Math.PI) * 20; paperPlane(x, y, Math.max(1, 5 - u * 4), -.9 + u * .4, { glow: true }); glowDisc(x - 4, y, 8, C(0xffffff), .4 * (1 - u), 3); }
  // 片名再出来一次
  const ta = seg(t, 311.2, 312.6) * (1 - seg(t, 315.6, 316.6)); if (ta > 0) text('起风了', 140, 70, { scale: 3, col: C(0xffffff), out: C(0x1a1840), alpha: ta, sp: 2 });
}
/* 5:16.6 尾声：月亮、星空，纸飞机划过月亮；片尾字（main.js 里画） */
function sEnd(t, k) {
  sky(t, 'night'); stars(t, 260, [0, 0, W, 250]); moon(t, 240, 100, 22);
  cloudDrift(t, [[40, 160, 160, 651], [300, 180, 140, 652]], CLOUD_PAL.night, .6);
  const u = seg(k, .2, 4.5); paperPlane(lerp(60, 420, u), 100 + Math.sin(u * 4) * 20 - u * 30, 4, -.12, {});
  for (let i = 0; i < 20; i++) dot(lerp(60, 420, u) - 6 - i * 3, 100 + Math.sin(u * 4) * 20 - u * 30 + i * .3, C(0xffffff), .5 * (1 - i / 20), 's');
  const fade = seg(t, DUR - 1.2, DUR); if (fade > 0) rect(0, 0, W, H, C(0x080612), fade * .8);
}
shot('reunion', 246.0, sReunion, { tr: { type: 'fade', dur: .8, pre: .4 }, post: { bloom: [.5, .8] } });
shot('jokes', 249.8, sJokes, { tr: { type: 'whip', dur: .35, pre: .15 }, post: { bloom: [.5, .8] } });
shot('push', 253.0, sPush, { tr: { type: 'whip', dur: .35, pre: .15, dir: 1 }, post: { bloom: [.5, .8] } });
shot('face', 256.3, sFace, { tr: { type: 'fade', dur: .4, pre: .2 }, post: { bloom: [.5, .8] } });
shot('give', 258.9, sGive, { tr: { type: 'fade', dur: .4, pre: .2 }, post: { bloom: [.5, .8] } });
shot('unfold', 262.65, sUnfold, { tr: { type: 'iris', dur: .5, pre: .25 }, post: { bloom: [.5, .8] } });
shot('flyaway', 266.05, sFlyAway, { tr: { type: 'wind', dur: .5, pre: .25 }, post: { bloom: [.5, .8] } });
shot('reveal', 271.55, sReveal, { tr: { type: 'fade', dur: .6, pre: .3 }, post: { bloom: [.5, .8] } });
shot('paperfly', 279.0, sPaperFly, { tr: { type: 'burn', dur: .7, pre: .35 }, post: { bloom: [.5, .8] } });
shot('photo2025', 285.3, sPhoto2025, { tr: { type: 'mosaic', dur: .5, pre: .25 }, post: { bloom: [.5, .8] } });
shot('twophotos', 290.2, sTwoPhotos, { tr: { type: 'fade', dur: .5, pre: .25 } });
shot('walkout', 294.9, sWalkOut, { tr: { type: 'fade', dur: .8, pre: .4 }, post: { bloom: [.5, .8], vig: .5 } });
shot('finale', 304.5, sFinale, { tr: { type: 'fade', dur: 1.0, pre: .5 }, post: { bloom: [.45, .9], vig: .5 } });
shot('end', 316.5, sEnd, { tr: { type: 'fade', dur: 1.0, pre: .5 }, post: { bloom: [.45, .9], vig: .5 } });
