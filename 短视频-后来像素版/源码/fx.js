'use strict';
/* fx.js —— 后期（调色、泛光、暗角、色差）和转场。都在 480×270 的像素上算。 */

/* ---------------- 后期 ----------------
   look：{exp 曝光, con 对比, sat 饱和, lift [r,g,b] 暗部加色, gain [r,g,b] 亮部乘色, vig 暗角, bloom [阈值, 强度], ca 色差像素} */
const LOOKS = {
  neon: { exp: 1.04, con: 1.08, sat: 1.12, lift: [.02, .0, .07], gain: [1, .97, 1.04], vig: .55, bloom: [.55, .85] },
  room: { exp: 1.0, con: 1.05, sat: 1.05, lift: [.03, .01, .06], gain: [1.04, .98, .94], vig: .6, bloom: [.6, .7] },
  summer: { exp: .98, con: 1.06, sat: 1.12, lift: [.02, .02, .0], gain: [1.03, 1.0, .94], vig: .38, bloom: [.86, .35] },
  dream: { exp: .98, con: 1.0, sat: 1.08, lift: [.04, .02, .05], gain: [1.03, .99, .98], vig: .42, bloom: [.8, .45] },
  starry: { exp: 1.0, con: 1.06, sat: 1.1, lift: [.01, .0, .05], gain: [1, 1, 1.03], vig: .5, bloom: [.6, .7] },
  sunset: { exp: 1.0, con: 1.06, sat: 1.12, lift: [.03, .01, .04], gain: [1.05, .98, .92], vig: .45, bloom: [.75, .5] },
  storm: { exp: .96, con: 1.12, sat: .6, lift: [.0, .02, .05], gain: [.95, 1, 1.05], vig: .65, bloom: [.7, .5] },
  night: { exp: 1.0, con: 1.06, sat: 1.0, lift: [.01, .01, .06], gain: [.98, 1, 1.05], vig: .55, bloom: [.55, .8] },
  festival: { exp: 1.04, con: 1.07, sat: 1.15, lift: [.03, .0, .05], gain: [1.04, .98, .96], vig: .5, bloom: [.5, .9] },
  dawn: { exp: 1.0, con: 1.04, sat: 1.08, lift: [.03, .02, .04], gain: [1.05, 1.0, .95], vig: .38, bloom: [.8, .45] },
  moon: { exp: .98, con: 1.08, sat: 1.1, lift: [.01, .0, .05], gain: [1, 1, 1.03], vig: .55, bloom: [.86, .45] },
  store: { exp: .94, con: 1.06, sat: 1.12, lift: [.0, .02, .05], gain: [.95, 1.0, 1.04], vig: .55, bloom: [.92, .25] },
  shatter: { exp: .95, con: 1.06, sat: 1.05, lift: [.01, .01, .05], gain: [1, 1, 1.03], vig: .5, bloom: [.84, .45] },
  station: { exp: .97, con: 1.06, sat: 1.05, lift: [.01, .01, .06], gain: [.98, 1, 1.04], vig: .55, bloom: [.84, .45] },
  space: { exp: 1.0, con: 1.08, sat: 1.1, lift: [.0, .0, .03], gain: [1, 1, 1], vig: .45, bloom: [.7, .6] },
  flat: { exp: 1, con: 1, sat: 1, lift: [0, 0, 0], gain: [1, 1, 1], vig: 0, bloom: [1, 0] },
};
const BW = 120, BH = 68;                                   // 泛光在 1/4 分辨率上算
const BL = new Float32Array(BW * BH * 3), BT = new Float32Array(BW * BH * 3);
let VIGMAP = null;
function vigMap() {
  if (VIGMAP) return VIGMAP; VIGMAP = new Float32Array(W * H);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x + .5 - W / 2) / (W / 2), dy = (y + .5 - H / 2) / (H / 2), d = Math.sqrt(dx * dx * .85 + dy * dy * 1.1);
    VIGMAP[y * W + x] = clamp((d - .55) / .75);
  }
  return VIGMAP;
}
function boxBlur(a, w, h, r) {                              // 三个通道一起的横竖盒子模糊
  const tmp = BT;
  for (let y = 0; y < h; y++) for (let c = 0; c < 3; c++) {
    let s = 0; for (let x = -r; x <= r; x++) s += a[(y * w + clamp(x, 0, w - 1)) * 3 + c];
    for (let x = 0; x < w; x++) { tmp[(y * w + x) * 3 + c] = s / (2 * r + 1); s += a[(y * w + Math.min(w - 1, x + r + 1)) * 3 + c] - a[(y * w + Math.max(0, x - r)) * 3 + c]; }
  }
  for (let x = 0; x < w; x++) for (let c = 0; c < 3; c++) {
    let s = 0; for (let y = -r; y <= r; y++) s += tmp[(clamp(y, 0, h - 1) * w + x) * 3 + c];
    for (let y = 0; y < h; y++) { a[(y * w + x) * 3 + c] = s / (2 * r + 1); s += tmp[(Math.min(h - 1, y + r + 1) * w + x) * 3 + c] - tmp[(Math.max(0, y - r) * w + x) * 3 + c]; }
  }
}
const LUT = [new Uint8ClampedArray(256), new Uint8ClampedArray(256), new Uint8ClampedArray(256)];
function post(g, L, extra = {}) {
  L = Object.assign({}, LOOKS.flat, L, extra);
  const img = g.getImageData(0, 0, W, H), a = img.data;
  for (let c = 0; c < 3; c++) for (let v = 0; v < 256; v++) {
    let x = v / 255 * L.exp; x = (x - .5) * L.con + .5; x = x * L.gain[c] + L.lift[c] * (1 - x);
    LUT[c][v] = x * 255;
  }
  // 泛光源：每 4×4 像素取平均，亮过阈值的部分留下
  const [th, bs] = L.bloom; let doBloom = bs > 0 && th < 1;
  if (doBloom) {
    BL.fill(0);
    for (let y = 0; y < H; y++) { const by = Math.min(BH - 1, y >> 2); for (let x = 0; x < W; x++) { const i = (y * W + x) * 4, j = (by * BW + (x >> 2)) * 3; BL[j] += a[i]; BL[j + 1] += a[i + 1]; BL[j + 2] += a[i + 2]; } }
    for (let j = 0; j < BW * BH; j++) {
      const r = BL[j * 3] / 16, gg = BL[j * 3 + 1] / 16, b = BL[j * 3 + 2] / 16, l = (r * .3 + gg * .55 + b * .15) / 255;
      const k = clamp((l - th) / (1 - th + .001)); BL[j * 3] = r * k; BL[j * 3 + 1] = gg * k; BL[j * 3 + 2] = b * k;
    }
    boxBlur(BL, BW, BH, 2); boxBlur(BL, BW, BH, 3);
  }
  const src = L.ca ? new Uint8ClampedArray(a) : null, ca = ri(L.ca || 0);
  const V = vigMap(), vig = L.vig, sat = L.sat, vc = L.vigCol ? rgb(L.vigCol) : [6, 4, 18];
  for (let y = 0; y < H; y++) {
    const fy = Math.min(BH - 1.001, Math.max(0, (y - 1.5) / 4)), y0 = fl(fy), wy = fy - y0;
    for (let x = 0; x < W; x++) {
      const i = (y * W + x) * 4;
      let r, gg, b;
      if (src) { const xr = Math.min(W - 1, x + ca), xb = Math.max(0, x - ca); r = src[(y * W + xr) * 4]; gg = src[i + 1]; b = src[(y * W + xb) * 4 + 2]; }
      else { r = a[i]; gg = a[i + 1]; b = a[i + 2]; }
      r = LUT[0][r]; gg = LUT[1][gg]; b = LUT[2][b];
      if (sat !== 1) { const l = r * .3 + gg * .55 + b * .15; r = l + (r - l) * sat; gg = l + (gg - l) * sat; b = l + (b - l) * sat; }
      if (doBloom) {
        const fx = Math.min(BW - 1.001, Math.max(0, (x - 1.5) / 4)), x0 = fl(fx), wx = fx - x0;
        const j00 = (y0 * BW + x0) * 3, j10 = j00 + 3, j01 = j00 + BW * 3, j11 = j01 + 3;
        const w00 = (1 - wx) * (1 - wy), w10 = wx * (1 - wy), w01 = (1 - wx) * wy, w11 = wx * wy;
        r += bs * (BL[j00] * w00 + BL[j10] * w10 + BL[j01] * w01 + BL[j11] * w11);
        gg += bs * (BL[j00 + 1] * w00 + BL[j10 + 1] * w10 + BL[j01 + 1] * w01 + BL[j11 + 1] * w11);
        b += bs * (BL[j00 + 2] * w00 + BL[j10 + 2] * w10 + BL[j01 + 2] * w01 + BL[j11 + 2] * w11);
      }
      if (vig > 0) { const v = V[y * W + x] * vig; r = r * (1 - v) + vc[0] * v; gg = gg * (1 - v) + vc[1] * v; b = b * (1 - v) + vc[2] * v; }
      a[i] = r; a[i + 1] = gg; a[i + 2] = b; a[i + 3] = 255;
    }
  }
  g.putImageData(img, 0, 0);
}

/* ---------------- 故障：一条条横向错开 + 红蓝分离 + 色块 ---------------- */
function glitch(g, src, amt, seed) {
  g.drawImage(src, 0, 0);
  if (amt <= 0) return;
  const n = 4 + fl(amt * 14);
  for (let i = 0; i < n; i++) {
    const y = fl(hash(seed, i) * H), h = 2 + fl(hash(seed, i + 50) * 16 * amt), dx = ri((hash(seed, i + 99) - .5) * 60 * amt);
    g.drawImage(src, 0, y, W, h, dx, y, W, h);
  }
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .35 * amt;
  g.drawImage(tint(src, '#FF0040'), ri(3 * amt + 1), 0); g.drawImage(tint(src, '#00E0FF'), -ri(3 * amt + 1), 0); g.restore();
  for (let i = 0; i < 6 * amt; i++) {
    const x = fl(hash(seed, i + 300) * W), y = fl(hash(seed, i + 400) * H);
    R(g, x, y, 4 + fl(hash(seed, i + 500) * 30), 1 + fl(hash(seed, i + 600) * 4), ['#FF2A6D', '#05D9E8', '#FFFFFF', '#D1F7FF'][i % 4]);
  }
}
function mosaic(g, src, blk) {
  const sw = Math.ceil(W / blk), sh = Math.ceil(H / blk), q = layer('mos', sw, sh);
  q.imageSmoothingEnabled = true; q.drawImage(src, 0, 0, sw, sh);
  g.imageSmoothingEnabled = false; g.drawImage(LAYER.mos, 0, 0, sw, sh, 0, 0, sw * blk, sh * blk);
}

/* ---------------- 转场：A 上一个镜头，B 这一个，u 0~1 ---------------- */
let DM = null;
function ditherMaskCanvas(level, cell) {                  // 像素溶解：每 cell 像素一格，按 Bayer 阈值一格格换
  const cw = Math.ceil(W / cell), chh = Math.ceil(H / cell), q = layer('dm' + cell, cw, chh);
  q.fillStyle = '#FFF';
  for (let y = 0; y < chh; y++) for (let x = 0; x < cw; x++) if (BAYER4[(y & 3) * 4 + (x & 3)] < level) q.fillRect(x, y, 1, 1);
  return LAYER['dm' + cell];
}
function maskBlend(g, A, B, drawMask) {                    // B 只在蒙版里出现
  g.drawImage(A, 0, 0);
  const q = layer('mb'); drawMask(q); q.globalCompositeOperation = 'source-in'; q.drawImage(B, 0, 0); q.globalCompositeOperation = 'source-over';
  g.drawImage(LAYER.mb, 0, 0);
}
const TRANS = {
  cut: (g, A, B) => g.drawImage(B, 0, 0),
  fade: (g, A, B, u) => { g.drawImage(A, 0, 0); g.globalAlpha = E.sine(u); g.drawImage(B, 0, 0); g.globalAlpha = 1; },
  white: (g, A, B, u) => {                                // 闪白
    g.drawImage(u < .35 ? A : B, 0, 0);
    const k = u < .35 ? E.in2(u / .35) : 1 - E.out(seg(u, .35, 1)); g.fillStyle = `rgba(255,250,240,${k})`; g.fillRect(0, 0, W, H);
  },
  black: (g, A, B, u) => { g.drawImage(u < .5 ? A : B, 0, 0); g.fillStyle = `rgba(4,3,12,${1 - Math.abs(u * 2 - 1)})`; g.fillRect(0, 0, W, H); },
  dissolve: (g, A, B, u) => {
    const lv = fl(u * 17); if (lv <= 0) { g.drawImage(A, 0, 0); return; }
    maskBlend(g, A, B, q => { q.imageSmoothingEnabled = false; const m = ditherMaskCanvas(lv, 3); q.drawImage(m, 0, 0, m.width * 3, m.height * 3); });
  },
  pixel: (g, A, B, u) => { const blk = ri(Math.pow(2, 1 + 4 * (1 - Math.abs(u * 2 - 1)))); mosaic(g, u < .5 ? A : B, Math.max(1, blk)); },
  glitch: (g, A, B, u) => glitch(g, u < .5 ? A : B, Math.sin(u * PI), 700 + fl(u * 12)),
  iris: (g, A, B, u) => {                                 // 圆形开合：先收到黑，再从中间张开
    const src = u < .5 ? A : B, k = u < .5 ? 1 - E.in2(u * 2) : E.out((u - .5) * 2), r = k * 290;
    R(g, 0, 0, W, H, '#05040C'); if (r < 1) return;
    g.save(); g.beginPath(); for (let y = -fl(r); y <= r; y++) { const hw = fl(Math.sqrt(Math.max(0, r * r - y * y))); g.rect(240 - hw, 135 + y, hw * 2, 1); } g.clip(); g.drawImage(src, 0, 0); g.restore();
  },
  ripple: (g, A, B, u) => {                               // 一滴水落下：圆圈从中间荡开，圈里是新画面
    const r = E.in2(u) * 300;
    maskBlend(g, A, B, q => disc(q, 240, 135, r, '#FFF'));
    if (r > 2 && u < .95) { ring(g, 240, 135, r, rgba('#FFFFFF', .8)); ring(g, 240, 135, r + 2, rgba('#BFE6FF', .5)); }
  },
  wipe: (g, A, B, u) => {                                 // 斜着的像素台阶擦过去
    const p = E.io(u) * (W + H + 40) - 20;
    maskBlend(g, A, B, q => { q.fillStyle = '#FFF'; for (let y = 0; y < H; y += 6) { const x = p - y * .6 - (fl(y / 6) % 2) * 4; if (x > 0) q.fillRect(0, y, ri(x), 6); } });
    for (let y = 0; y < H; y += 6) { const x = p - y * .6 - (fl(y / 6) % 2) * 4; R(g, x, y, 3, 6, '#FFFFFF'); R(g, x - 3, y, 3, 6, rgba('#FFE9A8', .7)); }
  },
  push: (g, A, B, u) => {                                 // 甩镜头：A 往左甩走，B 从右边进来，中间带拖影
    const e = E.io(u), x = -ri(e * W);
    g.drawImage(A, x, 0); g.drawImage(B, x + W, 0);
    g.save(); g.globalAlpha = .35 * Math.sin(u * PI); for (let k = 1; k <= 3; k++) { g.drawImage(A, x + k * 8, 0); g.drawImage(B, x + W + k * 8, 0); } g.restore();
  },
  shatter: (g, A, B, u) => {                              // 碎成方块往下掉，露出下面的新画面
    g.drawImage(B, 0, 0);
    const cs = 30;
    for (let by = 0; by < H / cs; by++) for (let bx = 0; bx < W / cs; bx++) {
      const i = by * 16 + bx, d = hash(i, 5) * .45 + (1 - by / 9) * .15, v = seg(u, d, d + .55);
      if (v >= 1) continue;
      const dy = E.in2(v) * 300, dx = (hash(i, 6) - .5) * 60 * v;
      g.drawImage(A, bx * cs, by * cs, cs, cs, ri(bx * cs + dx), ri(by * cs + dy), cs, cs);
      if (v > 0) { R(g, bx * cs + dx, by * cs + dy, cs, 1, rgba('#FFFFFF', .5)); }
    }
  },
  bars: (g, A, B, u) => {                                 // 横条一条条翻过去（百叶窗）
    maskBlend(g, A, B, q => { q.fillStyle = '#FFF'; for (let k = 0; k < 15; k++) { const v = seg(u, k * .03, k * .03 + .55), h = ri(v * 18); if (h > 0) q.fillRect(0, k * 18, W, h); } });
  },
  burn: (g, A, B, u) => {                                 // 胶片烧过去：右上角起一团橙光，烧亮了换画面
    g.drawImage(u < .5 ? A : B, 0, 0);
    const k = Math.sin(u * PI);
    sglow(g, 460, 20, 80 + 500 * k, '#FF7A30', .9 * k); sglow(g, 420, 60, 40 + 300 * k, '#FFE0A0', .9 * k);
  },
  rewind: (g, A, B, u) => {                               // 倒带：横向的跟踪线、画面上下滚
    const src = u < .5 ? A : B, k = Math.sin(u * PI), off = ri(k * 40 * Math.sin(u * 30));
    g.drawImage(src, 0, off); g.drawImage(src, 0, off - H); g.drawImage(src, 0, off + H);
    for (let i = 0; i < 5; i++) { const y = mod(fl(u * 900 + i * 61), H); R(g, 0, y, W, 2 + i % 3, rgba('#FFFFFF', .35 * k)); }
    glitchLines(g, k, fl(u * 40));
  },
};
function glitchLines(g, k, seed) {
  for (let i = 0; i < 10 * k; i++) { const y = fl(hash(seed, i) * H), x = fl(hash(seed, i + 9) * W); R(g, x, y, 10 + fl(hash(seed, i + 3) * 80), 1, rgba(i % 2 ? '#FF3A7A' : '#3AE8FF', .7)); }
}
