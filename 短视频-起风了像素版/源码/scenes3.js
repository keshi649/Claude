'use strict';
/* scenes3.js —— 第一遍副歌 B：上课发呆、趴桌做梦、粉笔头、大笑、本子、折纸飞机、太阳雨、间奏。 */
const HE_SEAT = [1, 2], SHE_SEAT = [0, 2];                 // 他坐第二排第三个，她坐第一排第三个（他后面看得到她的马尾）
const classStudents = (o = {}) => (r, i) => {
  if (r === HE_SEAT[0] && i === HE_SEAT[1]) return o.he || { look: 'he' };
  if (r === SHE_SEAT[0] && i === SHE_SEAT[1]) return o.she || { look: 'she' };
  if (o.empty) return null;
  const lk = kid(300 + r * 10 + i); return { look: lk, arms: o.arms ? o.arms(r, i) : undefined, expr: o.expr };
};
/* 1:16.6 我曾难自拔于世界之大：上课盯着世界地图发呆，地图上一架小飞机画出航线 */
function sMap(t, k) {
  rect(0, 0, W, H, C(0xf2ecdc)); rect(0, 170, W, 100, C(0x7cb898)); rect(0, 170, W, 2, C(0x5e9a7c));
  worldMap(60, 30, 260, 130, t, { route: seg(k, 1.0, 3.6) });
  for (let kk = 0; kk < 3; kk++) poly([[W - 60 + kk * 20, 0], [W - 40 + kk * 20, 0], [W - 200 + kk * 30, H], [W - 240 + kk * 30, H]], C(0xfff2c8), .1, 's');
  desk(330, 252, { books: 6 }); chair(390, 252, -1);
  person({ look: 'he', x: 380, y: 262, sitY: 240, face: -1, pose: POSE.chin, t, expr: { eyes: 'open', mouth: 'n' } });
  motes(t, 30, [0, 20, W, 240], 0xfff4d0, .6, 51);
}
/* 1:20.6 也沉溺于其中梦话：趴在桌上睡着，梦里两个人骑车穿过云 */
function sDoze(t, k) {
  classroom(t, { tod: 'day', x: 0, wind: .5, floorY: 196 });
  desk(170, 236, { books: 4 }); chair(232, 236, -1);
  person({ look: 'he', x: 222, y: 246, sitY: 224, face: -1, pose: POSE.sleep, t, expr: { eyes: 'closed', mouth: 'n' } });
  desk(70, 236, { books: 5 }); person({ look: 'she', x: 122, y: 246, sitY: 224, face: -1, pose: POSE.write, t });
  // 梦的泡泡：三个小泡泡 + 一个大泡泡，里面两个人在云上骑车
  const a = E.out(seg(k, .3, 1.0));
  if (a > 0) {
    for (let i = 0; i < 3; i++) disc(238 + i * 10, 186 - i * 14, 2 + i * 1.5, C(0xffffff), a);
    const bx = 330, by = 90, rx = 110 * a, ry = 60 * a;
    ellipse(bx, by, rx + 2, ry + 2, C(0x8aa0c8), a); ellipse(bx, by, rx, ry, C(0xdcf0ff), a);
    withT(layer('dream', 216, 116), () => { sky(t, [[0, 0x8ac8f8], [1, 0xe0f4ff]], { h: 116 }); for (let i = 0; i < 4; i++) cloud(t, mod(i * 70 - t * 30, 290) - 40, 100 - (i % 2) * 20, 70, 300 + i, CLOUD_PAL.morning); person({ look: 'he', x: 80, y: 80, face: 1, pose: walkPose(t * 3, 1), t }); person({ look: 'she', x: 120, y: 82, face: 1, pose: walkPose(t * 3 + 1, 1), t, wind: .6 }); bike(t, 80, 82, 1); bike(t, 120, 84, 1); });
    const D = _pool['dream216x116']; for (let y = 0; y < D.h; y++) for (let x = 0; x < D.w; x++) { const dx = (x - D.w / 2) / (rx - 2), dy = (y - D.h / 2) / (ry - 2); if (dx * dx + dy * dy < 1) pset(bx - D.w / 2 + x, by - D.h / 2 + y, D.d32[y * D.w + x]); }
  }
  // Z 字一个个飘出来
  for (let i = 0; i < 3; i++) { const ph = fract(t * .6 + i / 3); text('z', 236 + ph * 20, 190 - ph * 30, { size: 8, col: C(0x6a7aa8), alpha: Math.sin(ph * Math.PI) }); }
}
/* 1:23.8 不得真假不做挣扎：老师回身扔粉笔头，慢动作，砸中 */
const BONK = 85.4;
function sChalk(t, k) {
  const throwP = seg(t, 84.4, 84.9), fly = seg(t, 84.85, BONK);
  classFront(t, { board: (x, y, w, h) => { text('f(x) = sin(ωx + φ)', x + 20, y + 10, { size: 8, col: C(0xf0f0e8), align: 'l' }); text('求 ω 的取值范围', x + 20, y + 26, { size: 8, col: C(0xf0f0e8), align: 'l' }); },
    teacher: (x, y) => person({ look: 'teacher', x, y: y + 4, face: -1, view: throwP > 0 ? 'side' : 'back', pose: throwP > 0 ? lerpPose(POSE.throw0, POSE.throw1, E.out(throwP)) : POSE.stand, t }),
    students: classStudents({ he: { look: 'he', expr: { eyes: 'closed' }, arms: [1.2, 1.2, 1.2, 1.2] } }) });
  if (fly > 0 && fly < 1) { const x = lerp(232, 200, fly), y = lerp(126, 170, fly) - Math.sin(fly * Math.PI) * 30; chalk(x, y, t); }
  if (t >= BONK && t < BONK + .6) { const u = (t - BONK) / .6; ring(204, 166, 4 + u * 10, C(0xffffff), 1 - u); text('！', 214, 140 - u * 6, { col: C(0xffffff), out: C(0x2a2430), alpha: 1 - u }); }
}
/* 1:26.8 不惧笑话：全班大笑，她捂着嘴笑 */
function sLaugh(t, k) {
  const bob = r => Math.round(Math.abs(Math.sin(t * 9 + r)) * 1.5);
  classFront(t, { board: (x, y) => text('f(x) = sin(ωx + φ)', x + 20, y + 10, { size: 8, col: C(0xf0f0e8), align: 'l' }),
    teacher: (x, y) => person({ look: 'teacher', x, y: y + 4, view: 'front', t, expr: { mouth: 'smile' }, arms: [.3, 1.6, .3, 1.6] }),
    students: (r, i) => {
      if (r === HE_SEAT[0] && i === HE_SEAT[1]) return { look: 'he', arms: [.12, .1, 2.8, .3] };       // 他挠头
      const lk = r === SHE_SEAT[0] && i === SHE_SEAT[1] ? 'she' : kid(300 + r * 10 + i);
      return { look: lk, arms: [.5 + bob(i + r) * .1, 2.2, .5, 2.2] };
    } });
  for (let i = 0; i < 6; i++) { const ph = fract(t * .7 + i / 6); text('哈', 40 + i * 76 + Math.sin(i * 3) * 10, 130 - ph * 30, { scale: 1, col: C(0xffffff), out: C(0x2a2430), alpha: Math.sin(ph * Math.PI) }); }
}

shot('map', 76.45, sMap, { tr: { type: 'mosaic', dur: .5, pre: .25 } });
shot('doze', 80.45, sDoze, { tr: { type: 'dither', dur: .5, pre: .25 } });
shot('chalk', 83.6, sChalk, { tr: { type: 'whip', dur: .4, pre: .15 } });
shot('laugh', 86.6, sLaugh, { tr: { type: 'flash', dur: .3, pre: .15 } });

/* 1:29.4 我曾将青春翻涌成她：他的本子，一页页翻过去，画满了她；最后切到她：也在本子上画什么，他一看就合上 */
function sNotebook(t, k) {
  rect(0, 0, W, H, C(0xc89a62)); for (let i = 0; i < 30; i++) { const y = hash(i, 211) * H; hspan(Math.round(y), 0, W, C(0xb88a52), .4); }
  for (let kk = 0; kk < 3; kk++) poly([[300 + kk * 40, 0], [330 + kk * 40, 0], [180 + kk * 60, H], [140 + kk * 60, H]], C(0xfff2c8), .12, 's');
  const flip = Math.min(3, Math.floor(k / 1.05)), fu = clamp((k - flip * 1.05) / 1.05, 0, 1.5);
  // 左页：数学笔记
  paper(60, 30, 176, 210, { writing: 22, margin: true });
  // 右页：画满了她
  const poses = [[-.6, 'smile'], [.9, 'open'], [-.2, 'laugh'], [.4, 'happy']];
  const draw = idx => sketch(() => vhead({ x: 80, y: 80, R: 30, yaw: poses[idx][0], look: 'she', t: idx, expr: { eyes: poses[idx][1] === 'laugh' ? 'smile' : poses[idx][1], mouth: poses[idx][1] === 'laugh' ? 'laugh' : 'smile', blush: 0 }, body: true }), 248, 40, 168, 190, { reveal: idx === flip ? seg(fu, 0, .7) : 1 });
  paper(244, 30, 176, 210, { lines: true });
  draw(flip);
  if (flip >= 1) text('今天她笑了三次', 330, 214, { size: 8, col: C(0x5a5a70) });
  // 翻页：一页从右往左翻过去（越翻越窄）
  if (fu > .82 && fu < 1 && flip < 3) { const u = (fu - .82) / .18, w = 176 * Math.cos(u * Math.PI); if (w > 0) rect(244, 30, w, 210, C(0xf4f0e2)); else rect(244 + w, 30, -w, 210, C(0xeae4d4)); }
  rect(236, 26, 8, 218, C(0x6a6070));
  text('第三排靠窗', 300, 34, { size: 8, col: C(0x7a7a90) });
}
/* 1:33.2 前半拍：她也在画什么——画的是他（看不到），他一回头她就合上 */
/* 1:36.4 心之所动且就随缘去吧：傍晚的空教室，写纸条、折成纸飞机、对准她的座位，最后塞进桌肚；桌上刻了 2018.6.7 */
function sFold(t, k) {
  // 俯视课桌
  rect(0, 0, W, H, C(0xb8865a)); for (let i = 0; i < 40; i++) hspan(Math.round(hash(i, 221) * H), 0, W, C(0xa87648), .5);
  for (let kk = 0; kk < 3; kk++) poly([[0, 40 + kk * 50], [W, 0 + kk * 50], [W, 30 + kk * 50], [0, 70 + kk * 50]], C(0xffb070), .1, 's');
  // 桌上刻的字
  const carve = seg(k, 3.2, 5.2);
  if (carve > 0) { const s = '2018.6.7'; text(s.slice(0, Math.ceil(s.length * carve)), 100, 200, { size: 12, col: C(0x6a4428), sh: C(0xd8a878), align: 'l' }); }
  // 纸：先是一张写满字的纸，然后折：两角折下来 → 再折 → 成一只纸飞机
  const f = seg(k, .6, 3.0), cx = 260, cy = 120;
  if (f < .25) { paper(cx - 60, cy - 80, 120, 160, { writing: 3, col: 0xfbf8ee }); if (f < .1) text('……', cx, cy - 60, { col: C(0x3a3a5a) }); }
  else if (f < .5) { const u = (f - .25) / .25; poly([[cx - 60, cy - 80 + 60 * u], [cx, cy - 80], [cx + 60, cy - 80 + 60 * u], [cx + 60, cy + 80], [cx - 60, cy + 80]], C(0xfbf8ee)); poly([[cx - 60, cy - 80 + 60 * u], [cx, cy - 80], [cx - 60 + 60 * u, cy - 80 + 60 * u]], C(0xe8e2d0)); poly([[cx + 60, cy - 80 + 60 * u], [cx, cy - 80], [cx + 60 - 60 * u, cy - 80 + 60 * u]], C(0xe8e2d0)); }
  else if (f < .8) { const u = (f - .5) / .3; poly([[cx - 60 + 40 * u, cy], [cx, cy - 80], [cx + 60 - 40 * u, cy], [cx + 60 - 40 * u, cy + 80], [cx - 60 + 40 * u, cy + 80]], C(0xfbf8ee)); line(cx, cy - 80, cx, cy + 80, C(0xc8c2b0)); }
  else paperPlane(cx + 40, cy - 30, 34, -Math.PI / 2 + .1, { old: false });
  // 手：两只从下面伸进来
  for (const sd of [-1, 1]) { const hx = cx + sd * (70 - f * 30), hy = 230 - f * 20; capsule(hx, H + 10, hx, hy, 22, C(0x2a2030)); capsule(hx, H + 10, hx, hy, 20, C(0xf6f8fc)); disc(hx, hy - 8, 12, C(0x2a2030)); disc(hx, hy - 8, 11, C(0xf4ccb0)); for (let j = 0; j < 4; j++) capsule(hx - 7 + j * 4.5, hy - 14, hx - 7 + j * 4.5, hy - 22 + Math.abs(j - 1.5), 4, C(0xf4ccb0)); }
}
/* 1:42.1 逆着光行走任风吹雨打：太阳雨，他把校服撑在两个人头顶跑 */
function sSunRain(t, k) {
  const cam = k * 40;
  sky(t, [[0, 0x6aa0d8], [.6, 0xb8d8f0], [1, 0xfff0d0]]); sun(t, 400, 50, 12, 0xfff8e0, 0xffe0a0, 1.2);
  cloudDrift(t, [[60, 40, 140, 231], [260, 60, 110, 232]], CLOUD_PAL.grey, 3);
  teachBuilding(t, 20 - cam * .3, 170, 300, 4);
  for (let i = 0; i < 4; i++) drawCanopy(makeCanopy(240 + i, 80, 56, GREENS, { r: 6 }), mod(i * 150 - cam * .6, W + 150) - 50, 186, t, 2, { ph: i });
  vgrad(0, 186, W, H - 186, [[0, 0xa8a8b0], [1, 0x8a8a98]], 5);
  // 水洼：倒映着天，雨点溅起一圈圈
  for (let i = 0; i < 5; i++) { const px = mod(i * 120 - cam * 1.2, W + 120) - 40, py = 214 + (i % 3) * 16; ellipse(px, py, 24, 4, C(0xd8e8f8), .8); for (let j = 0; j < 2; j++) { const ph = fract(t * 1.4 + i * .3 + j * .5); ring(px + (j - .5) * 14, py, 1 + ph * 5, C(0xffffff), (1 - ph) * .8); } }
  // 两个人：他撑着校服外套
  const x = 230, run = walkPose(t * 4, 1, true);
  person({ look: 'she', x: x + 12, y: 236, face: 1, pose: { ...run, aN: [1.6, 1.4], aF: [1.4, 1.2] }, t, wind: .6, expr: { eyes: 'happy', mouth: 'open' }, rim: [0xfff0c0, .7, -1, 0] });
  const he = person({ look: { ...LOOK.he }, x, y: 238, face: 1, pose: { ...walkPose(t * 4 + .5, 1, true), aN: [2.7, .3], aF: [2.6, .3] }, t, expr: { eyes: 'open', mouth: 'smile' }, rim: [0xfff0c0, .7, -1, 0] });
  // 校服外套撑在头顶
  const jx = x + 4, jy = 196 + Math.round(Math.sin(t * 8) * 1);
  poly([[jx - 18, jy + 2], [jx + 22, jy], [jx + 26, jy + 8], [jx - 20, jy + 10]], C(0x2a2430)); poly([[jx - 17, jy + 3], [jx + 21, jy + 1], [jx + 24, jy + 7], [jx - 18, jy + 9]], C(0x3266c4)); hspan(jy + 4, jx - 15, jx + 20, C(0xf6f8fc));
  // 雨：斜的细线，被太阳照亮
  for (let i = 0; i < 160; i++) { const sp = 400 + hash(i, 241) * 200, x0 = mod(hash(i, 242) * W * 1.4 + t * sp * .3, W + 60) - 30, y0 = mod(hash(i, 243) * H + t * sp, H + 40) - 20; line(x0, y0, x0 - 2, y0 + 7, C(0xffffff), .35 + hash(i, 244) * .35, 's'); }
  motes(t, 30, [0, 0, W, H], 0xfff6c8, .8, 53, 2);
}
/* 1:49.2 间奏：雨停了，学校上空一道彩虹 */
function sRainbow(t, k) {
  sky(t, [[0, 0x5a9ae0], [.6, 0xa8d4f4], [1, 0xe8f4fc]]); sun(t, 420, 40, 10);
  const cx = 250, cy = 230, R0 = 190 + k * 4;
  const cols = [0xe85a5a, 0xf0a04a, 0xf0e060, 0x7ad070, 0x5aa0e8, 0x8a6ad8];
  cols.forEach((c, i) => { for (let a = Math.PI; a < TAU; a += .003) { const r = R0 - i * 5; for (let w = 0; w < 5; w++) dot(cx + Math.cos(a) * (r - w), cy + Math.sin(a) * (r - w), C(c), .45); } });
  cloudDrift(t, [[40, 70, 120, 251], [300, 50, 90, 252]], CLOUD_PAL.noon, 2);
  teachBuilding(t, 60, 220, 360, 5, { sign: '' }); flag(t, 440, 220, 100);
  rect(0, 220, W, 50, C(0xa8a8b0)); for (let i = 0; i < 6; i++) ellipse(40 + i * 80, 236 + (i % 2) * 10, 22, 3, C(0xd0e4f8));
  for (let i = 0; i < 20; i++) { const x = hash(i, 253) * W, y = 60 + hash(i, 254) * 120, tw = Math.sin(t * 3 + i); if (tw > .7) dot(x, y, C(0xffffff), (tw - .7) * 3, 's'); }
  birds(t, 5, 60 + k * 30, 80, 14, 13);
}
/* 1:52.4 间奏：倒计时牌一天天往下翻 */
function sCountdown(t, k) {
  const n = Math.max(100, Math.round(300 - E.in(seg(k, .2, 6.0)) * 200));
  classFront(t, { count: n, board: (x, y) => text('高考加油！', x + 120, y + 26, { scale: 2, col: C(0xfff4e0), sp: 2 }), students: classStudents({ empty: true }) });
  // 窗外的光一天天变：亮暗交替
  rect(0, 0, W, H, C(0x2a2040), .25 * (.5 + .5 * Math.sin(k * 6)));
}
shot('notebook', 89.25, sNotebook, { tr: { type: 'diamonds', dur: .5, pre: .25 } });
shot('fold', 96.25, sFold, { tr: { type: 'fade', dur: .5, pre: .2 }, post: { bloom: [.62, .6], grade: { tint: [0xff9050, .08] } } });
shot('sunrain', 102.0, sSunRain, { tr: { type: 'flash', dur: .5, pre: .25 }, post: { bloom: [.55, .8] } });
shot('rainbow', 109.1, sRainbow, { tr: { type: 'dither', dur: .8, pre: .2 } });
shot('countdown', 112.3, sCountdown, { tr: { type: 'blinds', dur: .5, pre: .2 } });
