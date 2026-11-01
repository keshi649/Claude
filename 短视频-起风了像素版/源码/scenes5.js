'use strict';
/* scenes5.js —— 第二遍副歌 B（高考、毕业）、第二段间奏（两列火车、七年）。 */

/* 2:49.4 我曾难自拔于世界之大：考场——钟、黑板上"语文 9:00—11:30"，沙沙地写 */
function sExam(t, k) {
  classFront(t, { count: 0, clockT: .2 + k * .01, board: (x, y, w) => { text('语文  9:00 — 11:30', x + w / 2, y + 16, { col: C(0xf0f0e8), sp: 2 }); text('考试结束前 15 分钟停止答题', x + w / 2, y + 38, { size: 8, col: C(0xd8e8d8) }); },
    students: (r, i) => ({ look: r === HE_SEAT[0] && i === HE_SEAT[1] ? 'he' : r === SHE_SEAT[0] && i === SHE_SEAT[1] ? 'she' : kid(300 + r * 10 + i), arms: [.9, 1.4 + Math.sin(t * 9 + i * 2 + r) * .1, .7, 1.6] }) });
  rect(0, 0, W, H, C(0xfff0d0), .05, 's');
}
/* 2:53.4 也沉溺于其中梦话：铃响，冲出校门，家长捧着花等在外面 */
function sBell(t, k) {
  sky(t, SKY.noon); cloudDrift(t, [[60, 30, 120, 401], [300, 20, 90, 402]], CLOUD_PAL.noon, 2);
  teachBuilding(t, 60, 150, 360, 4);
  rect(0, 150, W, H - 150, C(0xd8ccb8));
  schoolGate(t, { gx: 240, gy: 216, banner: '高考考点' });
  const rush = seg(k, .2, 3.0);
  for (let i = 0; i < 14; i++) { const x0 = 240 + (hash(i, 403) - .5) * 120, dir = hash(i, 404) < .5 ? -1 : 1, x = x0 + dir * rush * (80 + hash(i, 405) * 200), y = 226 + hash(i, 406) * 30; person({ look: kid(600 + i), x, y, face: dir, pose: rush > 0 ? (hash(i, 407) < .4 ? POSE.wave : walkPose(t * 3 + i, 1, true)) : POSE.stand, t, expr: { eyes: 'happy', mouth: 'open' } }); }
  for (let i = 0; i < 8; i++) { const x = 30 + i * 60 + (i > 3 ? 40 : 0); if (x > 180 && x < 300) continue; person({ look: kid(700 + i, true), x, y: 240, face: x < 240 ? 1 : -1, pose: POSE.give, t, hold: (hx, hy) => { for (let j = 0; j < 4; j++) disc(hx + 1 + (j % 2) * 3, hy - 3 - Math.floor(j / 2) * 3, 1.8, C(pick([0xff7a8a, 0xffd25a, 0xff9ab8, 0xffffff], j))); } }); }
  if (k < .8) { const r = seg(k, 0, .8); for (let i = 0; i < 3; i++) ring(240, 60, 20 + r * 90 + i * 18, C(0xffffff), 1 - r); text('叮铃铃——', 240, 40, { scale: 2, col: C(0xffffff), out: C(0x2a3060), alpha: 1 - r * .5 }); }
  confetti(t, 40, [0, 0, W, H], 21, .7);
}
/* 2:56.6 不得真假不做挣扎：楼上撒下满天的试卷 */
function sPapers(t, k) {
  sky(t, [[0, 0x3a8ae0], [1, 0xc8e8fc]]); sun(t, 420, 30, 9);
  teachBuilding(t, 20, 280, 440, 7, { fh: 34 });
  for (let i = 0; i < 160; i++) { const x0 = hash(i, 411) * W, sp = 30 + hash(i, 412) * 50, y = mod(hash(i, 413) * 320 + t * sp, 320) - 40, x = x0 + Math.sin(t * 1.5 + i) * 14 + (y / 300) * 30; const fl = Math.sin(t * 4 + i); poly([[x - 4, y - 3 * fl], [x + 4, y - 3 * fl + 1], [x + 3, y + 3], [x - 3, y + 2]], C(fl > 0 ? 0xffffff : 0xe8ecf4)); if (hash(i, 414) < .4) hspan(Math.round(y), x - 2, x + 2, C(0xa8b4c8)); }
  for (let r = 0; r < 4; r++) for (let i = 0; i < 6; i++) { const x = 40 + i * 76, y = 280 - (r + 1) * 34 + 22; disc(x, y - 4, 3, C(0x2a2430)); if (Math.sin(t * 5 + i + r) > 0) line(x + 3, y, x + 6, y - 8, C(0xf6f8fc)); }
}
/* 2:59.5 不惧笑话：在校服上签名，她在他背上写字（他看不见） */
function sSign(t, k) {
  classroom(t, { tod: 'day', x: 60, wind: .4, floorY: 196 });
  for (let i = 0; i < 4; i++) person({ look: kid(720 + i), x: 40 + i * 50 + (i > 1 ? 280 : 0), y: 246, face: i % 2 ? -1 : 1, pose: i % 2 ? POSE.standHand : POSE.stand, t, expr: { mouth: 'open' } });
  person({ look: 'he', x: 222, y: 248, face: -1, view: 'back', t, arms: [.3, .1, .3, .1], expr: { eyes: 'happy' } });
  const writing = Math.sin(t * 6) * .15;
  person({ look: 'she', x: 252, y: 248, face: -1, pose: { ...POSE.standHand, aN: [1.4 + writing, .4] }, t, expr: { eyes: 'down', mouth: 'smile', blush: true }, hold: (hx, hy) => line(hx, hy, hx - 3, hy - 4, C(0x2a2a3a)) });
  // 他背上已经有好多签名：几道彩色的小字
  for (let i = 0; i < 6; i++) line(218 + (i % 3) * 3, 228 + Math.floor(i / 3) * 4, 220 + (i % 3) * 3, 228 + Math.floor(i / 3) * 4, C(pick([0x3a6ad8, 0xd83a32, 0x2a8a5a], i)));
}
/* 3:02.2 我曾将青春翻涌成她：毕业晚会，他在台上弹吉他；3:06.0 台下她的脸被灯照亮 */
function sStage(t, k) {
  rect(0, 0, W, H, C(0x120e1e));
  // 舞台：幕布、彩灯、追光
  for (let x = 0; x < W; x += 8) rect(x, 0, 6, 150, C(0x5a1a2a + (x % 16 ? 0x060000 : 0)));
  rect(0, 0, W, 16, C(0x3a0e1a)); for (let i = 0; i < 24; i++) { const x = i * 20 + 6, on = Math.sin(t * 4 + i) > 0; disc(x, 18, 2, C(on ? pick([0xffd040, 0xff6080, 0x60c0ff], i) : 0x4a3040)); if (on) glowDisc(x, 18, 8, C(0xffe0a0), .4, 3); }
  banner(150, 30, 180, '高三（2）班 毕业晚会', { t, h: 14 });
  rect(0, 150, W, 30, C(0x6a4a3a)); rect(0, 150, W, 2, C(0x9a7a5a));
  poly([[220, 0], [260, 0], [300, 160], [180, 160]], C(0xfff4d0), .18, 's');
  rect(220, 128, 22, 14, C(0x241a2a)); rect(221, 129, 20, 12, C(0x8a5a4a));
  const strum = Math.sin(t * 7.5) * .12;
  person({ look: 'he', x: 232, y: 162, sitY: 130, face: 1, pose: { ...POSE.guitar, aN: [.62 + strum, 1.3 - strum] }, t, rim: [0xfff4d0, .8, 0, -1], expr: { eyes: 'closed', mouth: 'smile' }, hold: (hx, hy, f) => guitar(hx - 6 * f, hy + 1, -.55, f) });
  for (let i = 0; i < 6; i++) { const ph = fract(t * .35 + i / 6); note(244 + Math.sin(ph * 8 + i) * 20, 120 - ph * 80, 0xfff0c8, Math.sin(ph * Math.PI)); }
  // 台下：一排排人头的剪影，几个举着手机的亮点
  for (let r = 0; r < 4; r++) for (let i = 0; i < 26; i++) { const x = i * 19 + (r % 2) * 9, y = 196 + r * 20; disc(x, y, 7, C(0x1e1830 + r * 0x040404)); rect(x - 8, y + 4, 16, 14, C(0x1e1830 + r * 0x040404)); if (hash(i, r, 421) < .08) { rect(x + 4, y - 10, 3, 5, C(0xd8f0ff)); glowDisc(x + 5, y - 8, 6, C(0xd8f0ff), .4, 3); } }
}
function sStageFace(t, k) {
  rect(0, 0, W, H, C(0x120e1e));
  bokeh(() => sStage(t, k), 8, { dots: 30, tint: [0x2a1a3a, .3] });
  const sweep = .5 + .5 * Math.sin(t * 1.3);
  vhead({ x: 240, y: 112, R: 40, yaw: -.08, look: 'she', t, expr: { eyes: 'open', mouth: 'smile', blush: .7 }, gaze: [0, -.5], rim: [0xfff0d0, .5 + sweep * .3, 0, -1, 2], tint: [0x3a2a5a, .25 - sweep * .1] });
  for (let i = 0; i < 20; i++) { const x = hash(i, 431) * W, y = hash(i, 432) * H, tw = Math.sin(t * 2 + i); if (tw > .5) glowDisc(x, y, 5 + hash(i, 433) * 6, C(pick([0xffd040, 0xff6080, 0x60c0ff], i)), (tw - .5) * .5, 3); }
}
/* 3:09.1 心之所动且就随缘去吧：夜里校门口，她挥手；他把纸飞机藏在背后，没拿出来 */
function sGoodbye(t, k) {
  sky(t, 'night'); stars(t, 120, [0, 0, W, 150]); moon(t, 400, 40, 12);
  teachBuilding(t, 60, 170, 360, 4, { night: true, lit: .3, wall: 0x4a4660, rail: 0x5a5672 });
  rect(0, 170, W, H - 170, C(0x3a3650));
  schoolGate(t, { gx: 240, gy: 222 });
  lampPost(120, 236, 80, { lit: 1 }); lampPost(370, 236, 80, { lit: 1 });
  const wave = Math.sin(t * 5) * .5;
  person({ look: 'she', x: 300, y: 244, face: -1, view: 'three', pose: { ...POSE.wave, aN: [2.6 + wave * .3, .5] }, t, expr: { eyes: 'happy', mouth: 'smile' }, wind: .3, rim: [0xffe0a0, .5, 1, 0] });
  person({ look: 'he', x: 190, y: 246, face: 1, pose: { ...POSE.stand, aN: [-.6, -.8], aF: [-.5, -.7] }, t, expr: { eyes: 'open', mouth: 'n' }, rim: [0xffe0a0, .5, -1, 0], hold: (hx, hy) => paperPlane(hx - 2, hy, 4, Math.PI - .2) });
  motes(t, 30, [0, 100, W, 260], 0xffe0a0, .7, 81);
}
/* 3:14.6 间奏：两列火车擦肩——他坐一列往东，她坐一列往西 */
function sTrains(t, k) {
  sky(t, SKY.sunset); sun(t, 240, 120, 14, 0xfff0c0, 0xffa060);
  cloudDrift(t, [[60, 50, 120, 441], [300, 30, 90, 442]], CLOUD_PAL.sunset, 1.5);
  ridge(t, 150, 30, 0x8a6a9a, 443, .01, k * 5, { edge: 0xe8a0a0 });
  paddy(t, 170, 270, { c0: 0x8aa04a, c1: 0x9ab05a, c2: 0xd8d07a, cd: 0x6a7a3a });
  rect(0, 176, W, 6, C(0x7a6a5a)); rect(0, 200, W, 6, C(0x7a6a5a));
  greenTrain(t, -60 + k * 140, 180, 6, { dir: 1, win: (i, j, wx, wy) => { if (i === 2 && j === 3) { disc(wx + 2, wy + 2, 2, C(0x2c2232)); } } });
  greenTrain(t, 560 - k * 140, 204, 6, { dir: -1, win: (i, j, wx, wy) => { if (i === 2 && j === 3) { disc(wx + 2, wy + 2, 2, C(0x3a2628)); pset(wx + 4, wy + 1, C(0xe8343e)); } } });
  windStreaks(t, 10, [0, 160, W, 240], 400, 451, .4, 0xffe0c0);
}
/* 3:20.8 间奏：四季流过学校，2018 翻到 2025 */
function sSeasons(t, k) {
  const yr = 2018 + Math.min(7, Math.floor(k / .9)), ph = fract(k / .9), season = Math.floor(k / .9 * 4) % 4;
  const skies = [SKY.morning, SKY.noon, SKY.sunset, SKY.grey], leaves = [[0x8ac86a, 0xb8e08a, 0xe8f4c8, 0xffd0e0], GREENS, [0xa8602a, 0xd8883a, 0xf0b04a, 0xf8d878], [0x6a7a7a, 0x8a9a98, 0xd8e4e8, 0xffffff]];
  sky(t, skies[season]);
  teachBuilding(t, 80, 200, 320, 4);
  for (let i = 0; i < 4; i++) drawCanopy(makeCanopy(460 + i + season * 10, 80, 56, leaves[season], { r: 6 }), 30 + i * 140, 214, t, 1.5);
  rect(0, 214, W, 56, C([0x8acb6a, 0x6aae4a, 0xc8a060, 0xeef2f6][season]));
  if (season === 3) snow(t, 150, [0, 0, W, H], 9);
  if (season === 2) windLeaves(t, 40, [0, 0, W, H], 40, 23, [[0xf0a040, 0xc8702a]]);
  if (season === 0) windLeaves(t, 30, [0, 0, W, H], 30, 25, [[0xffd8e8, 0xf0b8d0]]);
  text(String(yr), 240, 40, { scale: 3, col: C(0xffffff), out: C(0x2a2430), sp: 2 });
}
/* 3:27.2 间奏：七年后的她也回来了——走在河边的路上；3:33.6 走进学校后院 */
function sHerReturn(t, k) {
  riverPath(t, { x: k * 20, tod: 'sunset' });
  person({ look: 'sheA', x: 230, y: 240, face: 1, pose: walkPose(k * 1.8, .9), t, wind: .5, rim: [0xffc080, .8, 1, 0] });
  windLeaves(t, 12, [0, 120, W, 260], 40, 27, [[0xffffff, 0xe8f0e0]]);
}
shot('exam', 169.25, sExam, { tr: { type: 'flashB', dur: .5, pre: .25 } });
shot('bell', 173.25, sBell, { tr: { type: 'flash', dur: .4, pre: .2 } });
shot('papers', 176.45, sPapers, { tr: { type: 'whipV', dur: .4, pre: .15, dir: -1 } });
shot('sign', 179.4, sSign, { tr: { type: 'dither', dur: .5, pre: .25 } });
shot('stage', 182.05, sStage, { tr: { type: 'iris', dur: .5, pre: .25, cx: 232, cy: 120 }, post: { bloom: [.5, .9], vig: .5 } });
shot('stageface', 185.9, sStageFace, { tr: { type: 'fade', dur: .5, pre: .2 }, post: { bloom: [.5, .9], vig: .5 } });
shot('goodbye', 189.0, sGoodbye, { tr: { type: 'fade', dur: .6, pre: .3 }, post: { bloom: [.5, .8], vig: .5 } });
shot('trains', 194.7, sTrains, { tr: { type: 'fade', dur: .8, pre: .3 }, post: { bloom: [.55, .75] } });
shot('seasons', 200.8, sSeasons, { tr: { type: 'wind', dur: .6, pre: .3 } });
shot('herreturn', 207.2, sHerReturn, { tr: { type: 'burn', dur: .7, pre: .35 }, post: { bloom: [.55, .75] } });
