'use strict';
/* scenes6.js —— 桥段（老槐树下的她、素描本）。 */

/* 3:33.6 她走进学校后院，老槐树开着一树白花 */
function sTreeGarden(t, k) {
  sky(t, SKY.sunset); sun(t, 400, 160, 14, 0xfff0c0, 0xffa060);
  cloudDrift(t, [[60, 40, 120, 511], [280, 30, 90, 512]], CLOUD_PAL.sunset, 1.2);
  skyline(t, 200, 0x8a6a88, 513, 0, { tall: 16 });
  rect(0, 200, W, 70, C(0x7a9a5a)); for (let i = 0; i < 12; i++) ellipse(40 + i * 40, 230 + (i % 3) * 10, 12, 3, C(0xb8b0a0));
  pagodaTree(t, 200, 214, 1, { petals: 30, wind: 30 });
  person({ look: 'sheA', x: 260 + seg(k, 0, 3) * 20, y: 238, face: -1, pose: walkPose(k * 1.6, seg(3 - k, 0, 1)), t, wind: .4, rim: [0xffc080, .8, 1, 0] });
  grass(t, 246, 272, [0x4a7a3a, 0x6a9a4a, 0xa0c870], .4, 1, 31);
}
/* 3:40.5 晚风吹起你鬓间的白发：老槐树下的她（特写），白色的槐花吹进鬓角 */
function sWhiteHair(t, k) {
  bokeh(() => { sky(t, SKY.sunset); sun(t, 400, 150, 14, 0xfff0c0, 0xffa060); pagodaTree(t, 160, 300, 1.4); }, 6, { dots: 40, tint: [0xffa080, .1] });
  const petals = (S, OX, OY, R) => {};
  vhead({ x: 270, y: 112, R: 42, yaw: -.35 + Math.sin(t * .4) * .03, look: 'sheA', t, wind: .6 + .3 * Math.sin(t * 1.2), expr: { eyes: 'open', mouth: 'n', blush: .3 }, gaze: [.3, -.1], rim: [0xffc080, .8, 1, 0, 2],
    front: U => { const { g } = U; const n = Math.floor(seg(k, .3, 3.5) * 9); for (let i = 0; i < n; i++) { const a = hash(i, 521), side = i % 2 ? 1 : -1, x = side * (.85 + hash(i, 522) * .25), y = -.2 + hash(i, 523) * .9; g.fillStyle = '#ffffff'; g.beginPath(); g.ellipse(x, y, .07, .05, a * 3, 0, TAU); g.fill(); g.fillStyle = '#f4f2dc'; g.beginPath(); g.ellipse(x + .04, y + .03, .05, .035, a * 3, 0, TAU); g.fill(); } } });
  windLeaves(t, 40, [0, 0, W, H], 50, 525, [[0xffffff, 0xeeeedc], [0xfffff4, 0xf4f2dc]]);
  motes(t, 30, [0, 0, W, H], 0xffe0b0, .7, 83, 2);
}
/* 3:44.6 抚平回忆留下的疤：树皮上她当年刻的纸飞机，长成了一道疤；她的手指抚过 */
function sScar(t, k) {
  rect(0, 0, W, H, C(0x5a4636));
  for (let x = 0; x < W; x++) { const v = Math.sin(x * .15 + Math.sin(x * .03) * 3); for (let y = 0; y < H; y += 1) { const n = Math.sin(y * .05 + x * .02) * .5 + v; if (n > .9) pset(x, y, C(0x7a6250)); else if (n < -1.1) pset(x, y, C(0x3e3026)); } }
  // 疤：一圈鼓起来的树皮，中间是刻的纸飞机
  ellipse(250, 130, 70, 50, C(0x3a2a20)); ellipse(250, 130, 64, 44, C(0x8a6a50)); ellipse(250, 132, 56, 36, C(0x6a5040));
  paperPlane(290, 120, 26, -.1, { old: true });
  rect(200, 100, 100, 60, C(0x5a4030), .45);
  text('2018', 250, 156, { col: C(0x3a2a20), sh: C(0x9a7a60) });
  for (let kk = 0; kk < 3; kk++) poly([[0, 40 + kk * 60], [W, kk * 60], [W, 30 + kk * 60], [0, 70 + kk * 60]], C(0xffb070), .1, 's');
  const u = E.io(seg(k, .3, 2.8)), hx = lerp(420, 280, u), hy = lerp(260, 150, u);
  capsule(W + 40, H + 30, hx + 14, hy + 16, 24, C(0x2a2030)); capsule(W + 40, H + 30, hx + 14, hy + 16, 22, C(0xefe2cc));
  disc(hx, hy, 12, C(0x2a2030)); disc(hx, hy, 11, C(0xf8d4bc));
  for (let j = 0; j < 4; j++) { const fx = hx - 9 + j * 5, fy = hy - 8 + Math.abs(j - 1.5) * 2; capsule(fx, fy, fx - 9 + j, fy - 11 + j * 1.4, 6, C(0x2a2030)); capsule(fx, fy, fx - 9 + j, fy - 11 + j * 1.4, 4.6, C(0xf8d4bc)); }
}
/* 3:47.8 你的眼中明暗交杂：眼睛的特写，倒映着晚霞和槐树 */
function sEyes(t, k) {
  rect(0, 0, W, H, C(0xf6d0b6));
  vhead({ x: 240, y: 40, R: 170, yaw: -.05, look: 'sheA', t, expr: { eyes: 'open', mouth: 'n', blush: .2 }, gaze: [.1, -.05], box: [-1.5, -.45, 1.5, 1.2] });
  // 一滴泪光
  if (k > 1.6) { const u = seg(k, 1.6, 2.6); disc(150, 150 + u * 40, 4, C(0xe8f4ff), .8); dot(149, 148 + u * 40, C(0xffffff)); }
  rect(0, 0, W, H, C(0xffa070), .1, 's');
}
/* 3:50.8 一笑生花：她笑了，一树花瓣炸开 */
function sBloomTree(t, k) {
  sky(t, SKY.sunset); sun(t, 400, 160, 14, 0xfff0c0, 0xffa060);
  cloudDrift(t, [[60, 40, 120, 531], [280, 30, 90, 532]], CLOUD_PAL.sunset, 1.2);
  rect(0, 200, W, 70, C(0x7a9a5a));
  pagodaTree(t, 200, 214, 1);
  person({ look: 'sheA', x: 250, y: 238, face: -1, view: 'three', pose: POSE.lookUp, t, wind: .5, expr: { eyes: 'happy', mouth: 'smile' }, rim: [0xffc080, .8, 1, 0] });
  const burst = seg(k, .2, 2.4);
  for (let i = 0; i < 200; i++) { const a = hash(i, 541) * TAU, sp = 40 + hash(i, 542) * 160, r = sp * E.out(burst), x = 200 + Math.cos(a) * r + Math.sin(t * 2 + i) * 4, y = 120 + Math.sin(a) * r * .7 + burst * burst * 60; if (burst > 0) leaf(x, y, i, t, 1, [[0xffffff, 0xeeeedc], [0xfff0f4, 0xf4dce0]]); }
  windLeaves(t, 30, [0, 0, W, H], 30, 543, [[0xffffff, 0xeeeedc]]);
}
/* 3:53.4 暮色遮住你蹒跚的步伐：（回忆）运动会她扭了脚，他扶着她走在黄昏的跑道上，影子拖得很长 */
function sLimp(t, k) {
  sky(t, SKY.dusk); sun(t, 80, 150, 14, 0xfff0c0, 0xffa060);
  cloudDrift(t, [[100, 50, 120, 551], [320, 40, 90, 552]], CLOUD_PAL.dusk, 1.2);
  rect(0, 150, W, 6, C(0x8a6a8a)); crowd(t, 120, 2, {});
  trackField(t, 156, { trackY: 10, trackH: 70, grass: 0x6a8a4a });
  const x = 200 + k * 16, limp = Math.abs(Math.sin(k * 2.6)) * 2;
  // 长长的影子
  for (const dx of [0, 14]) poly([[x + dx - 3, 236], [x + dx + 3, 236], [x + dx + 90, 252], [x + dx + 80, 254]], C(0x2a1a3a), .35);
  person({ look: 'she', x: x + 14, y: 236 + limp * .3, face: 1, pose: { ...walkPose(k * 1.3, .5), aF: [1.6, .6], lN: [.1, .6] }, t, expr: { eyes: 'closed', mouth: 'n' }, rim: [0xffb070, .8, -1, 0] });
  person({ look: 'he', x, y: 236, face: 1, pose: { ...walkPose(k * 1.3 + .5, .6), aN: [2.2, .8] }, t, rim: [0xffb070, .8, -1, 0] });
}
/* 3:57.4 走进床头藏起的画：她的旧卧室，拉开床头的抽屉，拿出素描本 */
function sDrawer(t, k) {
  bedroom(t, { drawer: E.out(seg(k, .6, 1.4)) });
  person({ look: 'sheA', x: 290, y: 236, face: -1, pose: lerpPose(POSE.stand, POSE.reach, E.io(seg(k, .2, .9)) * .6), t });
  if (k > 1.5) { const u = E.out(seg(k, 1.5, 2.6)); rect(270 - u * 10, 182 - u * 40, 22, 16, C(0x2a2430)); rect(271 - u * 10, 183 - u * 40, 20, 14, C(0x4a6a9a)); }
  motes(t, 40, [180, 20, W, H], 0xffc890, .8, 85, 2);
}
/* 4:00.6 画中的你低着头说话：素描本里画的是低着头说话的他 */
function sSketchBook(t, k) {
  rect(0, 0, W, H, C(0xc8a888)); for (let kk = 0; kk < 3; kk++) poly([[300 + kk * 40, 0], [330 + kk * 40, 0], [180 + kk * 60, H], [140 + kk * 60, H]], C(0xffc890), .15, 's');
  rect(96, 22, 290, 226, C(0x2a2430)); rect(98, 24, 286, 222, C(0xfaf6ea)); rect(98, 24, 8, 222, C(0xe8e0cc)); for (let i = 0; i < 12; i++) disc(102, 34 + i * 18, 2, C(0x6a6070));
  sketch(() => vhead({ x: 96, y: 86, R: 40, yaw: .35, look: 'he', t: 3, expr: { eyes: 'half', mouth: 'o', blush: 0 }, gaze: [.2, 1], tilt: .15 }), 140, 30, 200, 210, { reveal: seg(k, 0, 3.5) * 1.3 });
  text('2018.6', 350, 226, { size: 8, col: C(0x7a7a90) });
}
shot('treegarden', 213.55, sTreeGarden, { tr: { type: 'fade', dur: .8, pre: .4 }, post: { bloom: [.55, .75] } });
shot('whitehair', 220.35, sWhiteHair, { tr: { type: 'dither', dur: .6, pre: .3 }, post: { bloom: [.55, .8] } });
shot('scar', 224.45, sScar, { tr: { type: 'fade', dur: .5, pre: .2 }, post: { bloom: [.6, .7], vig: .5 } });
shot('eyes', 227.65, sEyes, { tr: { type: 'fade', dur: .5, pre: .2 }, post: { bloom: [.6, .6] } });
shot('bloomtree', 230.6, sBloomTree, { tr: { type: 'flash', dur: .5, pre: .25 }, post: { bloom: [.55, .8] } });
shot('limp', 233.25, sLimp, { tr: { type: 'burn', dur: .7, pre: .35 }, post: { grade: { sat: .7, tint: [0xd8a070, .22] }, vig: .55 } });
shot('drawer', 237.25, sDrawer, { tr: { type: 'fade', dur: .6, pre: .3 }, post: { bloom: [.6, .7] } });
shot('sketchbook', 240.45, sSketchBook, { tr: { type: 'iris', dur: .6, pre: .3 } });
