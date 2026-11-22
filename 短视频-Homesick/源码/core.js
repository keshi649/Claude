'use strict';
/* core.js：《Homesick》像素 MV 的底层。
   整片画在 640×360 的帧缓冲上，出片时最近邻放大 3 倍成 1920×1080，像素网格全片统一。
   所有形状都由这里的扫描线光栅化直接写进帧缓冲（不用画布的抗锯齿），边缘是干净的像素。
   frame(t) 只依赖时间 t：随机数一律用固定种子的 hash，不用 Math.random()。 */

const W = 640, H = 360;

/* ---------------- 数学、随机、缓动 ---------------- */
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const sat = v => v < 0 ? 0 : v > 1 ? 1 : v;
const lerp = (a, b, t) => a + (b - a) * t;
const inv = (a, b, v) => sat((v - a) / (b - a));
const sstep = (a, b, v) => { const t = inv(a, b, v); return t * t * (3 - 2 * t); };
const eIn = t => t * t, eOut = t => 1 - (1 - t) * (1 - t);
const eIO = t => t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t);
const eOut3 = t => 1 - Math.pow(1 - t, 3), eIn3 = t => t * t * t;
const eBack = t => { const c = 1.7; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const TAU = Math.PI * 2;
function hash(n) {
  n = (n ^ 61) ^ (n >>> 16); n = (n + (n << 3)) | 0; n ^= n >>> 4;
  n = Math.imul(n, 0x27d4eb2d); n ^= n >>> 15; return (n >>> 0) / 4294967296;
}
const h2 = (a, b) => hash(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663));
const h3 = (a, b, c) => hash(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663) ^ Math.imul(c | 0, 83492791));
/* 平滑噪声（一维），用来做抖动、摇晃、闪烁 */
function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return lerp(h2(i, seed), h2(i + 1, seed), u) * 2 - 1;
}

/* ---------------- 节拍（成片时间） ---------------- */
// 原曲剪掉开头空白后：第一个强拍在 1.24 秒，130 BPM，4 拍一小节
const T0 = 1.24, BEAT = 60 / 129.995, BAR = BEAT * 4;
const bt = n => T0 + n * BAR;          // 第 n 小节开始
const bb = n => T0 + n * BEAT;         // 第 n 拍
/* 距离最近一拍过去了多久（0~BEAT），给画面打拍子用 */
const sinceBeat = t => { const k = Math.floor((t - T0) / BEAT); return t - (T0 + k * BEAT); };
const beatPulse = (t, k = 6) => Math.exp(-k * sinceBeat(t) / BEAT * 4);

/* ---------------- 颜色 ---------------- */
// 颜色一律用 0xRRGGBB 整数
const cR = c => (c >> 16) & 255, cG = c => (c >> 8) & 255, cB = c => c & 255;
const c8 = v => v < 0 ? 0 : v > 255 ? 255 : Math.round(v);
const rgb = (r, g, b) => (c8(r) << 16) | (c8(g) << 8) | c8(b);
const hx = s => parseInt(s.replace('#', ''), 16);
function mix(a, b, t) {
  return rgb(lerp(cR(a), cR(b), t), lerp(cG(a), cG(b), t), lerp(cB(a), cB(b), t));
}
const mulc = (c, k) => rgb(cR(c) * k, cG(c) * k, cB(c) * k);
const mulc3 = (c, r, g, b) => rgb(cR(c) * r, cG(c) * g, cB(c) * b);
const addc = (a, b, k = 1) => rgb(cR(a) + cR(b) * k, cG(a) + cG(b) * k, cB(a) + cB(b) * k);
const lumc = c => (cR(c) * .299 + cG(c) * .587 + cB(c) * .114) / 255;
function hsl2c(h, s, l) {
  h = ((h % 360) + 360) % 360 / 360;
  const f = n => { const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l); return l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
  return rgb(f(0) * 255, f(8) * 255, f(4) * 255);
}
function c2hsl(c) {
  const r = cR(c) / 255, g = cG(c) / 255, b = cB(c) / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
  if (mx === mn) return [0, 0, l];
  const d = mx - mn, s = l > .5 ? d / (2 - mx - mn) : d / (mx + mn);
  let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [h * 60, s, l];
}
/* 像素画的色阶：暗部往冷色偏、亮部往暖色偏。返回 [描边, 暗2, 暗, 本色, 亮, 高光] */
function ramp(base, o = {}) {
  const [h, s, l] = c2hsl(base);
  const cool = o.cool ?? 18, warm = o.warm ?? 10;
  const towards = (target, dh) => { let d = ((target - h + 540) % 360) - 180; return h + Math.sign(d) * Math.min(Math.abs(d), dh); };
  const hc = towards(240, cool), hw = towards(55, warm);
  return [
    hsl2c(towards(250, cool * 1.6), Math.min(1, s * .9 + .1), l * .32),
    hsl2c(hc, Math.min(1, s * 1.02), l * .58),
    hsl2c(towards(240, cool * .6), s, l * .78),
    base,
    hsl2c(hw, s * .95, Math.min(.97, l + (1 - l) * .28)),
    hsl2c(towards(55, warm * 1.5), s * .8, Math.min(.98, l + (1 - l) * .55)),
  ];
}

/* ---------------- 帧缓冲 ---------------- */
const newBuf = () => { const b = new Uint8ClampedArray(W * H * 4); for (let i = 3; i < b.length; i += 4) b[i] = 255; return b; };
let B = newBuf();                    // 当前画的目标
const MAIN = B;
function target(buf) { const o = B; B = buf; return o; }
function clear(c = 0) {
  const r = cR(c), g = cG(c), b = cB(c);
  for (let i = 0; i < B.length; i += 4) { B[i] = r; B[i + 1] = g; B[i + 2] = b; B[i + 3] = 255; }
}
function copyBuf(dst, src) { dst.set(src); }

/* 混合模式：0 覆盖（a 是不透明度），1 加亮，2 正片叠底，3 滤色 */
function span(x0, x1, y, c, a = 1, mode = 0) {
  if (y < 0 || y >= H) return;
  if (x0 < 0) x0 = 0; if (x1 > W - 1) x1 = W - 1; if (x1 < x0) return;
  const r = (c >> 16) & 255, g = (c >> 8) & 255, b = c & 255;
  let i = (y * W + x0) << 2; const e = (y * W + x1) << 2;
  if (mode === 0) {
    if (a >= 1) { for (; i <= e; i += 4) { B[i] = r; B[i + 1] = g; B[i + 2] = b; } }
    else if (a > 0) { for (; i <= e; i += 4) { B[i] += (r - B[i]) * a; B[i + 1] += (g - B[i + 1]) * a; B[i + 2] += (b - B[i + 2]) * a; } }
  } else if (mode === 1) {
    for (; i <= e; i += 4) { B[i] += r * a; B[i + 1] += g * a; B[i + 2] += b * a; }
  } else if (mode === 2) {
    const ra = lerp(255, r, a) / 255, ga = lerp(255, g, a) / 255, ba = lerp(255, b, a) / 255;
    for (; i <= e; i += 4) { B[i] *= ra; B[i + 1] *= ga; B[i + 2] *= ba; }
  } else if (mode === 3) {
    for (; i <= e; i += 4) {
      B[i] += (255 - B[i]) * r / 255 * a; B[i + 1] += (255 - B[i + 1]) * g / 255 * a; B[i + 2] += (255 - B[i + 2]) * b / 255 * a;
    }
  }
}
function px(x, y, c, a = 1, mode = 0) { x = Math.floor(x); y = Math.floor(y); if (x >= 0 && x < W) span(x, x, y, c, a, mode); }
function rect(x, y, w, h, c, a = 1, mode = 0) {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  for (let j = Math.max(0, y); j < Math.min(H, y + h); j++) span(x, x + w - 1, j, c, a, mode);
}
function getpx(x, y) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= W || y >= H) return 0; const i = (y * W + x) << 2; return (B[i] << 16) | (B[i + 1] << 8) | B[i + 2]; }

/* ---------------- 光栅化 ---------------- */
// 多边形：pts 是 [x0,y0,x1,y1,...]，按像素中心取样，奇偶规则；fn(x0,x1,y) 画一段
const _xs = [];
function rasterPoly(pts, fn, clipY0 = 0, clipY1 = H - 1) {
  const n = pts.length >> 1; if (n < 3) return;
  let mn = Infinity, mx = -Infinity;
  for (let i = 1; i < pts.length; i += 2) { if (pts[i] < mn) mn = pts[i]; if (pts[i] > mx) mx = pts[i]; }
  const y0 = Math.max(clipY0, Math.ceil(mn - .5)), y1 = Math.min(clipY1, Math.floor(mx - .5));
  for (let y = y0; y <= y1; y++) {
    const sy = y + .5; _xs.length = 0;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const yi = pts[2 * i + 1], yj = pts[2 * j + 1];
      if ((yi > sy) !== (yj > sy)) { const xi = pts[2 * i], xj = pts[2 * j]; _xs.push(xi + (sy - yi) / (yj - yi) * (xj - xi)); }
    }
    _xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < _xs.length; k += 2) {
      const xa = Math.ceil(_xs[k] - .5), xb = Math.floor(_xs[k + 1] - .5);
      if (xb >= xa) fn(xa, xb, y);
    }
  }
}
function poly(pts, c, a = 1, mode = 0) { rasterPoly(pts, (x0, x1, y) => span(x0, x1, y, c, a, mode)); }
function rasterEll(cx, cy, rx, ry, fn) {
  if (rx <= 0 || ry <= 0) return;
  const y0 = Math.max(0, Math.ceil(cy - ry - .5)), y1 = Math.min(H - 1, Math.floor(cy + ry - .5));
  for (let y = y0; y <= y1; y++) {
    const dy = (y + .5 - cy) / ry, q = 1 - dy * dy; if (q < 0) continue;
    const hw = rx * Math.sqrt(q), xa = Math.ceil(cx - hw - .5), xb = Math.floor(cx + hw - .5);
    if (xb >= xa) fn(xa, xb, y);
  }
}
function ell(cx, cy, rx, ry, c, a = 1, mode = 0) { rasterEll(cx, cy, rx, ry, (x0, x1, y) => span(x0, x1, y, c, a, mode)); }
const circ = (cx, cy, r, c, a = 1, mode = 0) => ell(cx, cy, r, r, c, a, mode);
/* 线：Bresenham，w>1 时画成胶囊 */
function line(x0, y0, x1, y1, c, a = 1, mode = 0) {
  x0 = Math.floor(x0); y0 = Math.floor(y0); x1 = Math.floor(x1); y1 = Math.floor(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (let k = 0; k < 4000; k++) {
    px(x0, y0, c, a, mode);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
/* 两端不同粗细的胶囊（四肢、光束） */
function capsulePts(x0, y0, r0, x1, y1, r1, seg = 8) {
  const a = Math.atan2(y1 - y0, x1 - x0), out = [];
  for (let k = 0; k <= seg; k++) { const t = a + Math.PI / 2 + Math.PI * k / seg; out.push(x1 + Math.cos(t) * r1, y1 + Math.sin(t) * r1); }
  for (let k = 0; k <= seg; k++) { const t = a - Math.PI / 2 + Math.PI * k / seg; out.push(x0 + Math.cos(t) * r0, y0 + Math.sin(t) * r0); }
  // 两段方向反了：调成顺序
  return out;
}
function capsule(x0, y0, r0, x1, y1, r1, c, a = 1, mode = 0) { poly(capsulePts(x0, y0, r0, x1, y1, r1), c, a, mode); }

/* 路径：m/l/q/c 拼成多边形顶点 */
class Path {
  constructor() { this.p = []; this.x = 0; this.y = 0; }
  m(x, y) { this.p.push(x, y); this.x = x; this.y = y; return this; }
  l(x, y) { return this.m(x, y); }
  q(cx, cy, x, y, n = 8) {
    const x0 = this.x, y0 = this.y;
    for (let k = 1; k <= n; k++) { const t = k / n, u = 1 - t; this.p.push(u * u * x0 + 2 * u * t * cx + t * t * x, u * u * y0 + 2 * u * t * cy + t * t * y); }
    this.x = x; this.y = y; return this;
  }
  c(c1x, c1y, c2x, c2y, x, y, n = 10) {
    const x0 = this.x, y0 = this.y;
    for (let k = 1; k <= n; k++) {
      const t = k / n, u = 1 - t;
      this.p.push(u * u * u * x0 + 3 * u * u * t * c1x + 3 * u * t * t * c2x + t * t * t * x, u * u * u * y0 + 3 * u * u * t * c1y + 3 * u * t * t * c2y + t * t * t * y);
    }
    this.x = x; this.y = y; return this;
  }
  pts() { return this.p; }
}
const path = (x, y) => new Path().m(x, y);
/* 顶点变换：平移、缩放、旋转、镜像 */
function xf(pts, ox, oy, s = 1, rot = 0, flip = 1, sy = s) {
  const c = Math.cos(rot), si = Math.sin(rot), out = new Array(pts.length);
  for (let i = 0; i < pts.length; i += 2) {
    const x = pts[i] * s * flip, y = pts[i + 1] * sy;
    out[i] = ox + x * c - y * si; out[i + 1] = oy + x * si + y * c;
  }
  return out;
}

/* ---------------- 抖动和渐变 ---------------- */
const BAYER8 = (() => {
  const m = [[0, 32, 8, 40, 2, 34, 10, 42], [48, 16, 56, 24, 50, 18, 58, 26], [12, 44, 4, 36, 14, 46, 6, 38], [60, 28, 52, 20, 62, 30, 54, 22],
    [3, 35, 11, 43, 1, 33, 9, 41], [51, 19, 59, 27, 49, 17, 57, 25], [15, 47, 7, 39, 13, 45, 5, 37], [63, 31, 55, 23, 61, 29, 53, 21]];
  return m.map(r => r.map(v => (v + .5) / 64));
})();
const bayer = (x, y) => BAYER8[y & 7][x & 7];
/* 竖直渐变：stops = [[位置0~1, 颜色], ...]，levels 是色阶数（相邻色阶之间用 Bayer 抖动） */
function vgrad(x, y, w, h, stops, levels = 10, a = 1) {
  x = Math.round(x); y = Math.round(y);
  for (let j = 0; j < h; j++) {
    const yy = y + j; if (yy < 0 || yy >= H) continue;
    const t = h > 1 ? j / (h - 1) : 0;
    let k = 0; while (k < stops.length - 2 && t > stops[k + 1][0]) k++;
    const [p0, c0] = stops[k], [p1, c1] = stops[Math.min(k + 1, stops.length - 1)];
    const u = p1 > p0 ? sat((t - p0) / (p1 - p0)) : 0;
    const q = u * levels, lo = Math.floor(q), fr = q - lo;
    const ca = mix(c0, c1, lo / levels), cb = mix(c0, c1, Math.min(levels, lo + 1) / levels);
    for (let i = Math.max(0, x); i < Math.min(W, x + w); i++) px(i, yy, fr > bayer(i, yy) ? cb : ca, a);
  }
}
/* 抖动透明：按 Bayer 阈值决定这一格画不画（像素风的半透明） */
function dpx(x, y, c, a) { if (a > bayer(Math.floor(x), Math.floor(y))) px(x, y, c); }
function drect(x, y, w, h, c, a) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) dpx(x + i, y + j, c, a); }
/* 量化透明度：叠光、雾用 1/8 一级，避免过渡太顺滑不像像素画 */
const qa = a => Math.round(sat(a) * 8) / 8;

/* ---------------- 光晕 ---------------- */
// 半分辨率的光缓冲，画灯、霓虹、烛火时往里加光，最后模糊后加回画面
const GW = W >> 1, GH = H >> 1;
const GL = new Float32Array(GW * GH * 3), GT = new Float32Array(GW * GH * 3);
function glowClear() { GL.fill(0); }
function glow(x, y, r, c, k = 1) {
  // 在 (x,y) 加一个半径 r（全分辨率像素）的光斑
  const gx = x / 2, gy = y / 2, gr = Math.max(.6, r / 2);
  const R = cR(c) / 255 * k, G = cG(c) / 255 * k, Bc = cB(c) / 255 * k;
  for (let j = Math.max(0, Math.floor(gy - gr * 2)); j <= Math.min(GH - 1, Math.ceil(gy + gr * 2)); j++)
    for (let i = Math.max(0, Math.floor(gx - gr * 2)); i <= Math.min(GW - 1, Math.ceil(gx + gr * 2)); i++) {
      const d2 = ((i + .5 - gx) ** 2 + (j + .5 - gy) ** 2) / (gr * gr), f = Math.exp(-d2 * 1.6);
      if (f < .01) continue;
      const o = (j * GW + i) * 3; GL[o] += R * f; GL[o + 1] += G * f; GL[o + 2] += Bc * f;
    }
}
function glowRect(x, y, w, h, c, k = 1) {
  const R = cR(c) / 255 * k, G = cG(c) / 255 * k, Bc = cB(c) / 255 * k;
  for (let j = Math.max(0, Math.floor(y / 2)); j < Math.min(GH, Math.ceil((y + h) / 2)); j++)
    for (let i = Math.max(0, Math.floor(x / 2)); i < Math.min(GW, Math.ceil((x + w) / 2)); i++) {
      const o = (j * GW + i) * 3; GL[o] += R; GL[o + 1] += G; GL[o + 2] += Bc;
    }
}
function boxBlur(src, dst, w, h, r) {
  // 横、竖各一遍（3 通道）
  const n = 2 * r + 1;
  for (let j = 0; j < h; j++) for (let ch = 0; ch < 3; ch++) {
    let s = 0;
    for (let i = -r; i <= r; i++) s += src[(j * w + clamp(i, 0, w - 1)) * 3 + ch];
    for (let i = 0; i < w; i++) {
      dst[(j * w + i) * 3 + ch] = s / n;
      s += src[(j * w + Math.min(w - 1, i + r + 1)) * 3 + ch] - src[(j * w + Math.max(0, i - r)) * 3 + ch];
    }
  }
  for (let i = 0; i < w; i++) for (let ch = 0; ch < 3; ch++) {
    let s = 0;
    for (let j = -r; j <= r; j++) s += dst[(clamp(j, 0, h - 1) * w + i) * 3 + ch];
    for (let j = 0; j < h; j++) {
      src[(j * w + i) * 3 + ch] = s / n;
      s += dst[(Math.min(h - 1, j + r + 1) * w + i) * 3 + ch] - dst[(Math.max(0, j - r) * w + i) * 3 + ch];
    }
  }
}
/* 收尾：自动泛光（亮于阈值的像素）+ 手加的光，模糊后按滤色加回 */
function bloom(o = {}) {
  const th = o.th ?? .72, k = o.k ?? .55, r = o.r ?? 3, auto = o.auto ?? 1;
  if (auto > 0) {
    for (let j = 0; j < GH; j++) for (let i = 0; i < GW; i++) {
      let sr = 0, sg = 0, sb = 0;
      for (let dy = 0; dy < 2; dy++) for (let dx = 0; dx < 2; dx++) {
        const q = ((j * 2 + dy) * W + i * 2 + dx) << 2, r_ = B[q] / 255, g_ = B[q + 1] / 255, b_ = B[q + 2] / 255;
        const l = r_ * .3 + g_ * .59 + b_ * .11;
        if (l > th) { const f = (l - th) / (1 - th); sr += r_ * f; sg += g_ * f; sb += b_ * f; }
      }
      const g = (j * GW + i) * 3; GL[g] += sr / 4 * auto; GL[g + 1] += sg / 4 * auto; GL[g + 2] += sb / 4 * auto;
    }
  }
  boxBlur(GL, GT, GW, GH, r); boxBlur(GL, GT, GW, GH, r);
  for (let y = 0; y < H; y++) {
    const gy = Math.min(GH - 1, y >> 1);
    for (let x = 0; x < W; x++) {
      const g = (gy * GW + (x >> 1)) * 3, q = (y * W + x) << 2;
      const lr = GL[g] * k, lg = GL[g + 1] * k, lb = GL[g + 2] * k;
      if (lr + lg + lb < .004) continue;
      B[q] += (255 - B[q]) * Math.min(1, lr); B[q + 1] += (255 - B[q + 1]) * Math.min(1, lg); B[q + 2] += (255 - B[q + 2]) * Math.min(1, lb);
    }
  }
}
/* 调色：乘、加、对比、饱和度、暗角 */
function grade(o = {}) {
  const mr = o.mul?.[0] ?? 1, mg = o.mul?.[1] ?? 1, mb = o.mul?.[2] ?? 1;
  const ar = o.add?.[0] ?? 0, ag = o.add?.[1] ?? 0, ab = o.add?.[2] ?? 0;
  const con = o.con ?? 1, sa = o.sat ?? 1, vig = o.vig ?? 0, lift = o.lift ?? 0;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const q = (y * W + x) << 2;
    let r = B[q] * mr + ar, g = B[q + 1] * mg + ag, b = B[q + 2] * mb + ab;
    if (sa !== 1) { const l = r * .3 + g * .59 + b * .11; r = l + (r - l) * sa; g = l + (g - l) * sa; b = l + (b - l) * sa; }
    if (con !== 1) { r = 128 + (r - 128) * con; g = 128 + (g - 128) * con; b = 128 + (b - 128) * con; }
    if (lift) { r += (1 - r / 255) * lift * (o.liftc?.[0] ?? 1); g += (1 - g / 255) * lift * (o.liftc?.[1] ?? 1); b += (1 - b / 255) * lift * (o.liftc?.[2] ?? 1); }
    if (vig) { const dx = (x - W / 2) / (W / 2), dy = (y - H / 2) / (H / 2), d = Math.max(0, dx * dx * .8 + dy * dy - .25); const f = 1 - vig * d * .9; r *= f; g *= f; b *= f; }
    B[q] = r; B[q + 1] = g; B[q + 2] = b;
  }
}

/* ---------------- 像素字 ---------------- */
// 字形用画布 fillText 画一次，按 alpha>110 二值化成点阵，缓存起来
const FONTS = { fp: '12px FP', gm: '11px GM', gmb: '11px GMB' };
const _gc = document.createElement('canvas'); _gc.width = 48; _gc.height = 32;
const _gx = _gc.getContext('2d', { willReadFrequently: true });
const GLYPHS = {};
function glyph(ch, font = 'fp') {
  const key = font + ch; if (GLYPHS[key]) return GLYPHS[key];
  _gx.clearRect(0, 0, 48, 32); _gx.font = FONTS[font]; _gx.fillStyle = '#fff'; _gx.textBaseline = 'alphabetic';
  _gx.fillText(ch, 4, 20);
  const adv = Math.round(_gx.measureText(ch).width);
  const d = _gx.getImageData(0, 0, 48, 32).data, bits = [];
  for (let y = 0; y < 32; y++) for (let x = 0; x < 48; x++) if (d[(y * 48 + x) * 4 + 3] > 110) bits.push(x - 4, y - 20);
  return GLYPHS[key] = { adv, bits };
}
const textW = (s, font = 'fp', sp = 0) => { let w = 0; for (const ch of s) w += glyph(ch, font).adv + sp; return w - sp; };
/* 画一行字：(x,y) 是左端、基线；o: col, a, out(描边色), oa, sh(投影色), sx(放大倍数), font, sp(字距), each(i,ch)→{dy,col,a} */
function text(s, x, y, o = {}) {
  const font = o.font || 'fp', sx = o.sx || 1, sp = o.sp || 0;
  let cx = Math.round(x), i = 0;
  const chars = [...s];
  for (const ch of chars) {
    const g = glyph(ch, font), e = o.each ? o.each(i, ch) || {} : {};
    const col = e.col ?? o.col ?? 0xffffff, a = e.a ?? o.a ?? 1, dy = e.dy || 0, oy = Math.round(y + dy);
    if (a > 0) {
      const bits = g.bits;
      if (o.out !== undefined) {
        const oc = e.out ?? o.out, oa = (o.oa ?? 1) * Math.min(1, a * 1.2);
        for (let k = 0; k < bits.length; k += 2) {
          const bx = cx + bits[k] * sx, by = oy + bits[k + 1] * sx;
          rect(bx - 1, by - 1, sx + 2, sx + 2, oc, oa);
        }
      }
      if (o.sh !== undefined) for (let k = 0; k < bits.length; k += 2) rect(cx + bits[k] * sx + sx, oy + bits[k + 1] * sx + sx, sx, sx, o.sh, (o.sha ?? .6) * a);
      for (let k = 0; k < bits.length; k += 2) rect(cx + bits[k] * sx, oy + bits[k + 1] * sx, sx, sx, col, a);
    }
    cx += (g.adv + sp) * sx; i++;
  }
  return cx;
}
const textC = (s, x, y, o = {}) => text(s, x - textW(s, o.font, o.sp) * (o.sx || 1) / 2, y, o);
