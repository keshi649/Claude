'use strict';
/* scenes0.js —— 前奏 0~19.8 秒：云里的纸飞机 → 14 个闪回（跟着钢琴的音）→ 旋风 → 片名。 */

/* 云海（开头、片名的底）：大朵积云一层层往后飘，镜头跟着纸飞机往右 */
function cloudSea(t, cam, o = {}) {
  sky(t, [[0, 0x2a74d0], [.55, 0x5aa6ec], [.9, 0xa8d8f8], [1, 0xd8f0fc]]);
  sun(t, 400, 46, 10, 0xfff8e0, 0xffe6a0, 1.2);
  const layers = [[.15, 170, 160, 0, 700, CLOUD_PAL.noon], [.35, 120, 120, 10, 720, CLOUD_PAL.noon], [.7, 210, 200, 20, 740, CLOUD_PAL.noon]];
  for (const [par, y, w, sd, seed, pal] of layers) for (let i = -1; i < 4; i++) { const x = mod(i * 220 + hash(i, seed) * 80 - cam * par, W + 240) - 120; cloud(t, x, y + hash(i, seed, 1) * 30, w * (.7 + hash(i, seed, 2) * .5), seed + i, pal); }
  windStreaks(t, 14, [0, 20, W, 250], 360, 701, .4);
  windLeaves(t, 20, [0, 0, W, H], 140, 702);
}
/* 0:00 第一帧：发黄的纸飞机在云里滑翔，机翼上写着 2018.6.7；0.6 秒第一个音时穿过一朵云 */
function sOpening(t, k) {
  const cam = t * 160;
  cloudSea(t, cam);
  const x = 200 + Math.sin(t * 1.3) * 10, y = 128 + Math.sin(t * 2.1) * 6, ang = -.06 + Math.sin(t * 2.1) * .05;
  paperPlane(x + 60, y, 34, ang, { old: true, text: true });
  // 0.6 秒：一朵云从前面掠过（穿云）
  const q = seg(t, .35, .95); if (q > 0 && q < 1) cloud(t, lerp(W + 160, -160, q), 200, 360, 709, CLOUD_PAL.noon, { alpha: .95 });
  motes(t, 30, [0, 0, W, H], 0xfff6dc, .7, 703, 2);
}
/* 闪回的统一处理：像被太阳晒旧的照片——偏暖、褪色，四周泛白，一点灰尘划痕，角上一行年份 */
function memoryLook(t, year, o = {}) {
  const d = T.d8;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const p = (y * W + x) * 4, e = Math.max(Math.abs(x / W - .5) * 2, Math.abs(y / H - .5) * 2), edge = Math.max(0, e - .62) / .38;
    let r = d[p], g = d[p + 1], b = d[p + 2];
    const L = .3 * r + .59 * g + .11 * b;
    r = lerp(r, L * 1.08 + 18, .3); g = lerp(g, L * .98 + 8, .3); b = lerp(b, L * .82, .3);
    const w = Math.floor((edge * edge) * 6 + bay(x, y)) / 6;
    d[p] = lerp(r, 255, w); d[p + 1] = lerp(g, 248, w); d[p + 2] = lerp(b, 236, w);
  }
  for (let i = 0; i < 14; i++) { const x = hash(i, Math.floor(t * 12), 711) * W, y = hash(i, Math.floor(t * 12), 712) * H; dot(x, y, C(0xffffff), .6); }
  if (hash(Math.floor(t * 12), 713) < .3) { const x = hash(Math.floor(t * 12), 714) * W; for (let y = 0; y < H; y += 2) dot(x, y, C(0xffffff), .2); }
  poly([[W, 0], [W, H], [W - 60, H], [W - 20, 0]], C(0xff9a40), .12, 's');
  text(year, 12, H - 22, { size: 8, col: C(0xff9a50), sh: C(0x5a2a10), align: 'l', alpha: .9 });
}
/* 一个闪回：借后面镜头 id 在 at 秒的画面（随着时间慢慢往前走一点） */
const FLASH = [
  [1.60, 'turn', 71.75, '2016', 'iris', { cx: 250, cy: 100 }],
  [2.21, 'chalk', 84.95, '2017', 'whip', {}],
  [3.01, 'bikes', 144.6, '2017', 'wind', {}],
  [3.80, 'sunrain', 104.2, '2017', 'flash', {}],
  [4.79, 'roof', 94.2, '2017', 'blinds', {}],
  [5.39, 'countdown', 116.5, '2018', 'mosaic', {}],
  [6.20, 'papers', 178.2, '2018', 'whipV', { dir: 1 }],
  [6.99, 'trains', 197.5, '2018', 'steps', {}],
  [8.02, 'treegarden', 216.5, '2025', 'burn', {}],
  [8.60, 'sign', 181.2, '2018', 'dither', {}],
  [9.40, 'stage', 184.6, '2018', 'flashB', {}],
  [10.21, '@tie', 0, '2017', 'diamonds', {}],
  [10.62, 'finale', 310.2, '????', 'iris', { cx: 360, cy: 70 }],
  [11.20, 'photo', 166.1, '2018', 'cut', {}],
];
/* 风里飞走的红发绳（前奏专用的特写） */
function sTieSky(t, k) {
  sky(t, SKY.dusk); cloudDrift(t, [[60, 80, 160, 721], [300, 60, 120, 722]], CLOUD_PAL.dusk, 3);
  const x = 200 + k * 60 + Math.sin(t * 3) * 10, y = 130 + Math.sin(t * 2.3) * 12, s = 5;
  for (let a = 0; a < TAU; a += .05) { capsule(x + Math.cos(a) * 10, y + Math.sin(a) * 6, x + Math.cos(a + .05) * 10, y + Math.sin(a + .05) * 6, 4, C(0xe8343e)); }
  for (let i = 0; i < 2; i++) { const sw = Math.sin(t * 8 + i) * 6; capsule(x + 6, y + 4, x + 24 + sw, y + 18 + i * 6, 3, C(0xd82a34)); }
  windStreaks(t, 12, [0, 40, W, 230], 300, 723, .4, 0xffe0c0);
}
FLASH.forEach(([at, id, tt, year, tr, extra], i) => {
  const next = FLASH[i + 1] ? FLASH[i + 1][0] : 11.61;
  shot('fb' + i, at, (t, k) => {
    if (id === '@tie') sTieSky(t, k); else peek(id, tt + k * .6);
    memoryLook(t, year);
  }, { tr: { type: tr, dur: Math.min(.4, (next - at) * .5), pre: Math.min(.12, (next - at) * .2), ...extra }, post: { bloom: [.62, .55], vig: .3 } });
});

/* 11.6 闪回缩成小照片卷进旋风 → 12.6 贝斯进来时炸开 → 13.41 拼成片名"起风了" → 16.6 片名被风吹散 */
const TITLE_AT = 13.41, BURST = 12.61;
const _titlePts = [];
function titlePoints() {
  if (_titlePts.length) return _titlePts;
  const k = 5, chars = [...'起风了'], sp = 3, w = chars.reduce((s, ch) => s + glyph(ch, 12).adv * k + sp * k, -sp * k);
  let x0 = Math.round(W / 2 - w / 2);
  for (const ch of chars) { const g = glyph(ch, 12); for (const [px, py] of g.pts) for (let j = 0; j < k; j++) for (let i = 0; i < k; i++) _titlePts.push([x0 + px * k + i, 62 + py * k + j, _titlePts.length]); x0 += (g.adv + sp) * k; }
  return _titlePts;
}
function sTitle(t, k) {
  const cam = t * 160;
  cloudSea(t, cam);
  const pts = titlePoints();
  if (t < BURST) {
    // 旋风：小照片一张张卷进来，越转越快
    const u = seg(t, 11.61, BURST), n = 12;
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + u * u * 9 + t * 2, r = lerp(180, 20, E.in(u)) * (1 + .15 * Math.sin(i)), x = 240 + Math.cos(a) * r, y = 120 + Math.sin(a) * r * .55;
      const id = FLASH[i % FLASH.length];
      rect(x - 13, y - 8, 26, 17, C(0xf8f6ee)); const c = pick([0xe8b070, 0x6aa0d8, 0xd8604a, 0x5a9a5a, 0x8a6ad8, 0xf0c060], i); rect(x - 11, y - 6, 22, 12, C(c)); rect(x - 11, y - 6, 22, 5, lighter(C(c), .3));
    }
    windLeaves(t, 80, [0, 0, W, H], 200 + u * 300, 731);
    for (let i = 0; i < 40; i++) { const a = hash(i, 732) * TAU + t * (3 + u * 6), r = 30 + hash(i, 733) * 160 * (1 - u * .5); dot(240 + Math.cos(a) * r, 120 + Math.sin(a) * r * .55, C(0xffffff), .7, 's'); }
  } else {
    // 炸开的像素飞到片名的位置
    const u = E.out3(seg(t, BURST, TITLE_AT));
    for (const [tx, ty, i] of pts) {
      const a = hash(i, 741) * TAU, r0 = 10 + hash(i, 742) * 220, sx = 240 + Math.cos(a) * r0, sy = 120 + Math.sin(a) * r0 * .6;
      const sw = Math.sin(u * Math.PI) * 30 * (hash(i, 743) - .5);
      let x = lerp(sx, tx, u) + sw, y = lerp(sy, ty, u);
      const blow = seg(t, 16.3 + (tx / W) * .5, 17.2 + (tx / W) * .5);           // 16.6 被风吹散，从左往右
      if (blow > 0) { x += E.in(blow) * (200 + hash(i, 744) * 300); y += Math.sin(blow * 6 + i) * 20 * blow - blow * 40; }
      const settled = u >= 1 && blow <= 0;
      pset(x, y, settled ? (ty - 62 < 18 ? C(0xffffff) : C(0xf4f8ff)) : C(pick([0xffffff, 0xfff0c0, 0xd8f0ff], i)));
      if (blow > 0 && hash(i, 745) < .08) leaf(x, y, i, t, 1);
    }
    if (u >= 1) {
      // 描边和投影（片名停住以后）
      const a = 1 - seg(t, 16.3, 16.8);
      if (a > 0) { text('起风了', 240, 62, { scale: 5, col: C(0xffffff), sp: 3, alpha: 0 }); }
      const sub = seg(t, 14.0, 14.8) * (1 - seg(t, 16.2, 16.6));
      if (sub > 0) text('买辣椒也用券', 240, 140, { col: C(0xffffff), out: C(0x1c3a6a), sp: 4, alpha: sub });
    }
    if (t >= TITLE_AT && t < TITLE_AT + .5) { const q = (t - TITLE_AT) / .5; ring(240, 92, 40 + q * 260, C(0xffffff), (1 - q) * .8, 's'); rect(0, 0, W, H, C(0xffffff), (1 - q) * .5, 's'); }
  }
}
/* 片名的描边：画完像素以后，给片名的像素加一圈深蓝和投影 */
function titleOutline(t) {
  if (t < TITLE_AT || t > 16.9) return;
  const pts = titlePoints(), set = new Set(pts.map(([x, y]) => y * W + x));
  for (const [x, y] of pts) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [2, 2]]) { const k = (y + dy) * W + x + dx; if (!set.has(k)) { const blow = seg(t, 16.3 + (x / W) * .5, 17.2 + (x / W) * .5); if (blow <= 0) pset(x + dx, y + dy, dx === 2 ? C(0x0e2a5a) : C(0x1c3a6a)); } }
}
shot('opening', 0, sOpening, { post: { bloom: [.62, .6], vig: .3 } });
shot('title', 11.61, (t, k) => { sTitle(t, k); titleOutline(t); }, { tr: { type: 'fade', dur: .3, pre: .1 }, post: { bloom: [.66, .6], vig: .3 } });
