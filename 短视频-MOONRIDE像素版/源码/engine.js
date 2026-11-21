// 《MOONRIDE》像素版：像素引擎。整片画在 480×270 一套像素网格上，出片时最近邻放大 4 倍到 1920×1080。
// 只用 Node 自己的类型数组，不用浏览器：所有图形按像素中心取样、不抗锯齿，像素边永远是硬的。
'use strict';
const W = 480, H = 270, FPS = 30;
const SONG = 193.376;                      // 原曲长度（秒），成片和歌一样长
const BPM = 129, PH = 0.08, SPB = 60 / BPM; // 节拍网格：129 BPM，第一拍 0.08 秒

// ---------- 缓冲 ----------
function mkbuf(w, h, alpha) { return { w, h, d: new Float32Array(w * h * 3), a: alpha ? new Float32Array(w * h) : null }; }
let F = mkbuf(W, H, false);   // 主画面
let GL = mkbuf(W, H, false);  // 发光层（模糊后加回主画面）
let T = F;                    // 当前画在哪
let OX = 0, OY = 0;           // 整体平移（抖动、摇镜头）
let CX0 = 0, CY0 = 0, CX1 = W, CY1 = H; // 裁剪框
let BM = 0;                   // 0 普通 1 相加 2 滤色 3 正片叠底
let DA = false;               // 透明度用 Bayer 抖动代替混合
let MASK = null;              // 只画在 MASK=1 的地方（主画面大小）
function target(b) { T = b || F; CX0 = 0; CY0 = 0; CX1 = T.w; CY1 = T.h; }
function clip(x0, y0, x1, y1) { CX0 = Math.max(0, x0 | 0); CY0 = Math.max(0, y0 | 0); CX1 = Math.min(T.w, Math.ceil(x1)); CY1 = Math.min(T.h, Math.ceil(y1)); }
function noclip() { CX0 = 0; CY0 = 0; CX1 = T.w; CY1 = T.h; }
function blend(m) { BM = { n: 0, add: 1, screen: 2, mul: 3 }[m || 'n']; }
function resetState() { OX = 0; OY = 0; BM = 0; DA = false; MASK = null; target(F); }

// ---------- 颜色 ----------
const CC = new Map();
function C(c) {
  if (typeof c !== 'string') return c;
  let v = CC.get(c); if (v) return v;
  const s = c.replace('#', '');
  v = [parseInt(s.slice(0, 2), 16), parseInt(s.slice(2, 4), 16), parseInt(s.slice(4, 6), 16)];
  CC.set(c, v); return v;
}
function mixc(a, b, t) { a = C(a); b = C(b); return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]; }
function shade(c, k) { c = C(c); return [c[0] * k, c[1] * k, c[2] * k]; }
function lit(c, k) { c = C(c); return [c[0] + (255 - c[0]) * k, c[1] + (255 - c[1]) * k, c[2] + (255 - c[2]) * k]; }
function hsl(h, s, l) { // 0~1
  const f = n => { const k = (n + h * 12) % 12, a = s * Math.min(l, 1 - l); return 255 * (l - a * Math.max(-1, Math.min(k - 3, 9 - k, 1))); };
  return [f(0), f(8), f(4)];
}

// ---------- 数学 ----------
const clamp = (x, a, b) => x < a ? a : x > b ? b : x;
const lerp = (a, b, t) => a + (b - a) * t;
const sat = x => clamp(x, 0, 1);
const smooth = t => { t = sat(t); return t * t * (3 - 2 * t); };
const easeOut = t => { t = sat(t); return 1 - (1 - t) * (1 - t) * (1 - t); };
const easeIn = t => { t = sat(t); return t * t * t; };
const easeIO = t => { t = sat(t); return t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const ramp = (t, a, b) => sat((t - a) / (b - a));
function hash(n) { n = (n | 0) * 374761393 + 668265263; n = (n ^ (n >>> 13)) * 1274126177; n = n ^ (n >>> 16); return (n >>> 0) / 4294967296; }
function h2(x, y, s) { return hash((x | 0) * 73856093 ^ (y | 0) * 19349663 ^ ((s | 0) * 83492791)); }
function rng(seed) { let s = (seed * 9301 + 49297) % 233280 || 1; return () => { s = (s * 16807) % 2147483647; return (s - 1) / 2147483646; }; }
function vnoise(x, s) { const i = Math.floor(x), f = x - i; const u = f * f * (3 - 2 * f); return lerp(hash(i * 31 + s * 7919), hash((i + 1) * 31 + s * 7919), u); }
function vnoise2(x, y, s) {
  const ix = Math.floor(x), iy = Math.floor(y), fx = x - ix, fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = h2(ix, iy, s), b = h2(ix + 1, iy, s), c = h2(ix, iy + 1, s), d = h2(ix + 1, iy + 1, s);
  return lerp(lerp(a, b, ux), lerp(c, d, ux), uy);
}
const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
const bay = (x, y) => BAY[(y & 3) * 4 + (x & 3)];

// 节拍
const beatN = t => (t - PH) / SPB;
function pulse(t, decay, every) { // 每拍（或每 every 拍）一下，指数衰减
  const e = every || 1, b = beatN(t) / e; if (b < 0) return 0;
  return Math.exp(-(b - Math.floor(b)) * e * SPB / (decay || .12));
}

// ---------- 最底层：写一个像素 / 一段 ----------
function pp(x, y, c, a) { // x,y 已经是整数、已经加过平移
  if (x < CX0 || y < CY0 || x >= CX1 || y >= CY1) return;
  if (a === undefined) a = 1; if (a <= 0) return;
  if (DA) { if (a < bay(x, y)) return; a = 1; }
  const T_ = T, i = y * T_.w + x;
  if (MASK && T_ === F && !MASK[i]) return;
  const d = T_.d, k = i * 3;
  if (BM === 0) {
    if (a >= 1) { d[k] = c[0]; d[k + 1] = c[1]; d[k + 2] = c[2]; }
    else { d[k] += (c[0] - d[k]) * a; d[k + 1] += (c[1] - d[k + 1]) * a; d[k + 2] += (c[2] - d[k + 2]) * a; }
    if (T_.a) T_.a[i] = T_.a[i] + (1 - T_.a[i]) * Math.min(1, a);
  } else if (BM === 1) { d[k] += c[0] * a; d[k + 1] += c[1] * a; d[k + 2] += c[2] * a; if (T_.a) T_.a[i] = Math.max(T_.a[i], Math.min(1, a)); }
  else if (BM === 2) { for (let j = 0; j < 3; j++) { const v = Math.min(255, d[k + j]); d[k + j] = v + (c[j] * a) * (1 - v / 255); } }
  else { for (let j = 0; j < 3; j++) d[k + j] *= 1 - a + a * c[j] / 255; }
}
function span(y, x0, x1, c, a) { // [x0, x1) 已加平移
  if (y < CY0 || y >= CY1) return;
  x0 = Math.max(x0, CX0); x1 = Math.min(x1, CX1);
  for (let x = x0; x < x1; x++) pp(x, y, c, a);
}

// ---------- 图形（坐标是浮点，按像素中心取样） ----------
function px(x, y, c, a) { pp(Math.floor(x) + OX, Math.floor(y) + OY, C(c), a); }
function rect(x, y, w, h, c, a) {
  c = C(c); const x0 = Math.round(x) + OX, y0 = Math.round(y) + OY, x1 = Math.round(x + w) + OX, y1 = Math.round(y + h) + OY;
  for (let yy = Math.max(y0, CY0); yy < Math.min(y1, CY1); yy++) span(yy, x0, x1, c, a);
}
function fill(c, a) { const o = [OX, OY]; OX = 0; OY = 0; rect(0, 0, T.w, T.h, c, a); OX = o[0]; OY = o[1]; }
function ell(cx, cy, rx, ry, c, a) {
  c = C(c); if (rx <= 0 || ry <= 0) return;
  const y0 = Math.floor(cy - ry), y1 = Math.ceil(cy + ry);
  for (let y = y0; y <= y1; y++) {
    const dy = (y + .5 - cy) / ry; if (dy * dy > 1) continue;
    const dx = rx * Math.sqrt(1 - dy * dy);
    const xa = Math.ceil(cx - dx - .5), xb = Math.floor(cx + dx - .5);
    if (xb >= xa) span(y + OY, xa + OX, xb + 1 + OX, c, a);
  }
}
const circ = (cx, cy, r, c, a) => ell(cx, cy, r, r, c, a);
function ring(cx, cy, r, w, c, a) { // 圆环
  c = C(c); const R = r + w / 2, r0 = Math.max(0, r - w / 2);
  for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++) for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
    const d = Math.hypot(x + .5 - cx, y + .5 - cy); if (d <= R && d >= r0) pp(x + OX, y + OY, c, a);
  }
}
function poly(pts, c, a) { // pts: [x0,y0,x1,y1,...]
  c = C(c); const n = pts.length / 2; if (n < 3) return;
  let ymin = 1e9, ymax = -1e9;
  for (let i = 0; i < n; i++) { ymin = Math.min(ymin, pts[i * 2 + 1]); ymax = Math.max(ymax, pts[i * 2 + 1]); }
  const xs = [];
  for (let y = Math.floor(ymin); y <= Math.ceil(ymax); y++) {
    const sy = y + .5; xs.length = 0;
    for (let i = 0; i < n; i++) {
      const j = (i + 1) % n, x0 = pts[i * 2], y0 = pts[i * 2 + 1], x1 = pts[j * 2], y1 = pts[j * 2 + 1];
      if ((y0 <= sy && y1 > sy) || (y1 <= sy && y0 > sy)) xs.push(x0 + (sy - y0) / (y1 - y0) * (x1 - x0));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = Math.ceil(xs[k] - .5), xb = Math.floor(xs[k + 1] - .5);
      if (xb >= xa) span(y + OY, xa + OX, xb + 1 + OX, c, a);
    }
  }
}
function tri(x0, y0, x1, y1, x2, y2, c, a) { poly([x0, y0, x1, y1, x2, y2], c, a); }
function line(x0, y0, x1, y1, c, a, w) { // 线宽 w 时按方块盖
  c = C(c); x0 = Math.floor(x0); y0 = Math.floor(y0); x1 = Math.floor(x1); y1 = Math.floor(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let e = dx + dy; const ww = w || 1, h0 = Math.floor((ww - 1) / 2);
  const seen = ww > 1 ? new Set() : null;
  for (;;) {
    if (ww === 1) pp(x0 + OX, y0 + OY, c, a);
    else for (let yy = 0; yy < ww; yy++) for (let xx = 0; xx < ww; xx++) {
      const kx = x0 - h0 + xx, ky = y0 - h0 + yy, key = kx * 4096 + ky;
      if (!seen.has(key)) { seen.add(key); pp(kx + OX, ky + OY, c, a); }
    }
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; }
  }
}
function thick(x0, y0, x1, y1, r, c, a) { // 两头圆的粗线（胳膊、腿、绳子）
  c = C(c); const minx = Math.floor(Math.min(x0, x1) - r), maxx = Math.ceil(Math.max(x0, x1) + r);
  const miny = Math.floor(Math.min(y0, y1) - r), maxy = Math.ceil(Math.max(y0, y1) + r);
  const vx = x1 - x0, vy = y1 - y0, L2 = vx * vx + vy * vy || 1e-9;
  for (let y = miny; y <= maxy; y++) for (let x = minx; x <= maxx; x++) {
    const px_ = x + .5 - x0, py_ = y + .5 - y0; const tt = clamp((px_ * vx + py_ * vy) / L2, 0, 1);
    const ex = px_ - vx * tt, ey = py_ - vy * tt; if (ex * ex + ey * ey <= r * r) pp(x + OX, y + OY, c, a);
  }
}
function heart(cx, cy, s, c, a, rot) { // s = 半宽；心尖朝下
  c = C(c); const R = s * 1.25, cr = Math.cos(rot || 0), sr = Math.sin(rot || 0);
  for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++) for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
    let u = (x + .5 - cx) / s, v = (y + .5 - cy) / s;
    if (rot) { const uu = u * cr + v * sr, vv = -u * sr + v * cr; u = uu; v = vv; }
    v = -v * 1.08 + .2;
    const q = u * u + v * v - 1; if (q * q * q - u * u * v * v * v <= 0) pp(x + OX, y + OY, c, a);
  }
}
function inHeart(u, v) { v = -v * 1.08 + .2; const q = u * u + v * v - 1; return q * q * q - u * u * v * v * v <= 0; }

// 竖直渐变（量化成几级色阶，交界处用 Bayer 抖动）
function vgrad(x, y, w, h, stops, levels) {
  levels = levels || 10;
  const x0 = Math.round(x) + OX, y0 = Math.round(y) + OY, x1 = Math.round(x + w) + OX, y1 = Math.round(y + h) + OY;
  const cols = stops.map(s => C(s[1]));
  const colAt = tt => {
    for (let i = 0; i < stops.length - 1; i++) if (tt <= stops[i + 1][0]) {
      const k = (tt - stops[i][0]) / (stops[i + 1][0] - stops[i][0] || 1); return mixc(cols[i], cols[i + 1], sat(k));
    }
    return cols[cols.length - 1];
  };
  const pal = []; for (let i = 0; i <= levels; i++) pal.push(colAt(i / levels));
  for (let yy = Math.max(y0, CY0); yy < Math.min(y1, CY1); yy++) {
    const tt = (yy - y0 + .5) / (y1 - y0), q = tt * levels, qi = Math.floor(q), fr = q - qi;
    for (let xx = Math.max(x0, CX0); xx < Math.min(x1, CX1); xx++) {
      pp(xx, yy, pal[Math.min(levels, fr > bay(xx, yy) ? qi + 1 : qi)]);
    }
  }
}
// 任意方向的渐变填满一个形状：f(x,y) 返回 0~1 或 -1（不画）
function shapeGrad(x0, y0, x1, y1, f, stops, levels, a) {
  levels = levels || 8; const cols = stops.map(s => C(s[1]));
  const colAt = tt => { for (let i = 0; i < stops.length - 1; i++) if (tt <= stops[i + 1][0]) return mixc(cols[i], cols[i + 1], sat((tt - stops[i][0]) / (stops[i + 1][0] - stops[i][0] || 1))); return cols[cols.length - 1]; };
  const pal = []; for (let i = 0; i <= levels; i++) pal.push(colAt(i / levels));
  for (let y = Math.floor(y0); y < Math.ceil(y1); y++) for (let x = Math.floor(x0); x < Math.ceil(x1); x++) {
    const v = f(x + .5, y + .5); if (v < 0) continue;
    const q = sat(v) * levels, qi = Math.floor(q), fr = q - qi;
    pp(x + OX, y + OY, pal[Math.min(levels, fr > bay(x + OX, y + OY) ? qi + 1 : qi)], a);
  }
}
// 台阶状的光晕：一圈一圈，透明度分级
function halo(cx, cy, r, c, a, steps, ry) {
  steps = steps || 5; const k = (ry || r) / r;
  for (let i = steps; i >= 1; i--) ell(cx, cy, r * i / steps, r * k * i / steps, c, a / steps);
}
// 软的光（加在发光层上，最后模糊）
function glow(cx, cy, r, c, a) { const t0 = T; T = GL; const b = BM; BM = 1; ell(cx, cy, r, r, c, a === undefined ? 1 : a); BM = b; T = t0; }
function glowRect(x, y, w, h, c, a) { const t0 = T; T = GL; const b = BM; BM = 1; rect(x, y, w, h, c, a === undefined ? 1 : a); BM = b; T = t0; }
function onGlow(fn) { const t0 = T, b = BM, c0 = [CX0, CY0, CX1, CY1]; T = GL; BM = 1; fn(); T = t0; BM = b; [CX0, CY0, CX1, CY1] = c0; }
// 平滑的径向光（直接相加在当前画面，不量化）
function radial(cx, cy, r, c, a, ry) {
  c = C(c); ry = ry || r; const b = BM; BM = 1;
  for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) for (let x = Math.floor(cx - r); x <= Math.ceil(cx + r); x++) {
    const dx = (x + .5 - cx) / r, dy = (y + .5 - cy) / ry, d = dx * dx + dy * dy; if (d >= 1) continue;
    const k = (1 - d) * (1 - d) * a; pp(x + OX, y + OY, c, k);
  }
  BM = b;
}

// ---------- 模糊和泛光 ----------
function boxBlur(src, w, h, r, tmp) {
  const d = src, o = tmp;
  for (let y = 0; y < h; y++) for (let c = 0; c < 3; c++) {
    let acc = 0; const row = y * w;
    for (let x = -r; x <= r; x++) acc += d[(row + clamp(x, 0, w - 1)) * 3 + c];
    for (let x = 0; x < w; x++) { o[(row + x) * 3 + c] = acc / (2 * r + 1); acc += d[(row + clamp(x + r + 1, 0, w - 1)) * 3 + c] - d[(row + clamp(x - r, 0, w - 1)) * 3 + c]; }
  }
  for (let x = 0; x < w; x++) for (let c = 0; c < 3; c++) {
    let acc = 0;
    for (let y = -r; y <= r; y++) acc += o[(clamp(y, 0, h - 1) * w + x) * 3 + c];
    for (let y = 0; y < h; y++) { d[(y * w + x) * 3 + c] = acc / (2 * r + 1); acc += o[(clamp(y + r + 1, 0, h - 1) * w + x) * 3 + c] - o[(clamp(y - r, 0, h - 1) * w + x) * 3 + c]; }
  }
}
const HW = W / 2, HH = H / 2;
const BL1 = new Float32Array(HW * HH * 3), BL2 = new Float32Array(HW * HH * 3);
// 发光层 + 主画面里高于阈值的亮部，模糊后加回去
function bloom(strength, radius, thresh) {
  strength = strength === undefined ? 1 : strength; radius = radius || 3; thresh = thresh === undefined ? 1.1 : thresh;
  const f = F.d, g = GL.d;
  for (let y = 0; y < HH; y++) for (let x = 0; x < HW; x++) {
    const o = (y * HW + x) * 3;
    for (let c = 0; c < 3; c++) {
      let s = 0;
      for (let k = 0; k < 4; k++) {
        const i = ((y * 2 + (k >> 1)) * W + x * 2 + (k & 1)) * 3 + c;
        const lum = f[i] / 255; s += g[i] + (lum > thresh ? (lum - thresh) * 255 * 2 : 0);
      }
      BL1[o + c] = s / 4;
    }
  }
  boxBlur(BL1, HW, HH, radius, BL2); boxBlur(BL1, HW, HH, radius, BL2);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 3;
    const fx = clamp((x - .5) / 2, 0, HW - 1.001), fy = clamp((y - .5) / 2, 0, HH - 1.001);
    const x0 = Math.floor(fx), y0 = Math.floor(fy), ax = fx - x0, ay = fy - y0;
    for (let c = 0; c < 3; c++) {
      const v = (BL1[(y0 * HW + x0) * 3 + c] * (1 - ax) + BL1[(y0 * HW + x0 + 1) * 3 + c] * ax) * (1 - ay) +
        (BL1[((y0 + 1) * HW + x0) * 3 + c] * (1 - ax) + BL1[((y0 + 1) * HW + x0 + 1) * 3 + c] * ax) * ay;
      f[i + c] += (v + g[i + c] * .35) * strength;
    }
  }
}

// ---------- 调色 ----------
function grade(fn) { const d = F.d; for (let i = 0; i < W * H; i++) { const k = i * 3; const o = fn(d[k], d[k + 1], d[k + 2], i % W, (i / W) | 0); d[k] = o[0]; d[k + 1] = o[1]; d[k + 2] = o[2]; } }
function tint(c, a, mode) { c = C(c); const b = BM; blend(mode || 'n'); const o = [OX, OY]; OX = 0; OY = 0; rect(0, 0, W, H, c, a); OX = o[0]; OY = o[1]; BM = b; }
function vignette(a, c) { // 四角压暗，量化成几级
  c = C(c || '#000000'); const steps = 14;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x + .5 - W / 2) / (W / 2), dy = (y + .5 - H / 2) / (H / 2);
    let v = sat((dx * dx * .8 + dy * dy * 1.1 - .55) / .9); if (v <= 0) continue;
    v = Math.floor(v * steps + bay(x, y)) / steps; if (v > 0) { const t0 = T; T = F; const b = BM; BM = 0; pp(x, y, c, v * a); BM = b; T = t0; }
  }
}
function flash(c, a) { // 闪白 / 闪黑：亮度分 8 级跳
  a = Math.round(sat(a) * 8) / 8; if (a <= 0) return; tint(c, a);
}

// ---------- 字 ----------
let GLY = globalThis.__glyphs || null;
function glyph(ch) { const g = GLY[ch] || GLY['?']; return g; }
function textW(s, sp) { let w = 0; for (const ch of s) w += glyph(ch).adv + (sp || 0); return w - (sp || 0); }
// 12px 像素字：opt = {sc:整数倍, al:'l'|'c'|'r', ol:描边色, sh:投影色, sp:字距, a}
function text(s, x, y, c, opt) {
  opt = opt || {}; const sc = opt.sc || 1, sp = opt.sp || 0; c = C(c);
  const w = textW(s, sp) * sc; let x0 = Math.round(opt.al === 'c' ? x - w / 2 : opt.al === 'r' ? x - w : x); const y0 = Math.round(y);
  const drawAt = (dx, dy, col) => {
    let cx = x0;
    for (const ch of s) {
      const g = glyph(ch);
      for (let r = 4; r < 16; r++) { const row = g.rows[r]; for (let k = 0; k < row.length; k++) if (row[k] === '1') rect(cx + k * sc + dx, y0 + (r - 4) * sc + dy, sc, sc, col, opt.a); }
      cx += (g.adv + sp) * sc;
    }
  };
  if (opt.sh) drawAt(sc, sc, opt.sh);
  if (opt.ol) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) drawAt(dx * (opt.olw || 1), dy * (opt.olw || 1), opt.ol);
  drawAt(0, 0, c);
  return w;
}

// ---------- 精灵（字符串画的小图） ----------
// rows: ['..aab', ...]，pal: {a:'#fff', b:[r,g,b]}；'.' 和空格透明
function spr(rows, pal, x, y, opt) {
  opt = opt || {}; const sc = opt.sc || 1, fl = opt.flip;
  const h = rows.length, w = rows[0].length;
  for (let r = 0; r < h; r++) for (let k = 0; k < w; k++) {
    const ch = rows[r][fl ? w - 1 - k : k]; if (ch === '.' || ch === ' ') continue;
    const col = pal[ch]; if (!col) continue;
    rect(x + k * sc, y + r * sc, sc, sc, col, opt.a);
  }
}

// ---------- 离屏小画布（画人物、道具后描边再贴回去） ----------
const POOL = [];
function layer(w, h) {
  for (const b of POOL) if (!b.busy && b.w === w && b.h === h) { b.busy = true; b.d.fill(0); b.a.fill(0); return b; }
  const b = mkbuf(w, h, true); b.busy = true; POOL.push(b); return b;
}
function free(b) { b.busy = false; }
// 在离屏层上画：fn 里的坐标是层内坐标
function onLayer(b, fn) {
  const s = [T, OX, OY, CX0, CY0, CX1, CY1, BM, DA, MASK];
  T = b; OX = 0; OY = 0; CX0 = 0; CY0 = 0; CX1 = b.w; CY1 = b.h; BM = 0; DA = false; MASK = null;
  fn();
  [T, OX, OY, CX0, CY0, CX1, CY1, BM, DA, MASK] = s;
}
// 描边：透明且挨着不透明的像素，涂成 col（或相邻颜色压暗）
function outline(b, col, k, diag) {
  const w = b.w, h = b.h, a = b.a, d = b.d; const add = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (a[i] > .5) continue;
    let n = -1;
    const nb = diag ? [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]] : [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [dx, dy] of nb) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; if (a[yy * w + xx] > .5) { n = yy * w + xx; break; } }
    if (n >= 0) add.push(i, n);
  }
  for (let j = 0; j < add.length; j += 2) {
    const i = add[j], n = add[j + 1];
    if (col) { const c = C(col); d[i * 3] = c[0]; d[i * 3 + 1] = c[1]; d[i * 3 + 2] = c[2]; }
    else { d[i * 3] = d[n * 3] * (k || .35); d[i * 3 + 1] = d[n * 3 + 1] * (k || .35); d[i * 3 + 2] = d[n * 3 + 2] * (k || .35); }
    a[i] = 1;
  }
}
// 贴回去：opt = {flip, a, tint:[色, 量], mul:色, dither}
function comp(b, x, y, opt) {
  opt = opt || {}; const tc = opt.tint ? C(opt.tint[0]) : null, tk = opt.tint ? opt.tint[1] : 0;
  const mc = opt.mul ? C(opt.mul) : null;
  const x0 = Math.round(x), y0 = Math.round(y);
  for (let yy = 0; yy < b.h; yy++) for (let xx = 0; xx < b.w; xx++) {
    const sx = opt.flip ? b.w - 1 - xx : xx, i = yy * b.w + sx; const al = b.a[i]; if (al <= .01) continue;
    let r = b.d[i * 3], g = b.d[i * 3 + 1], bl = b.d[i * 3 + 2];
    if (mc) { r *= mc[0] / 255; g *= mc[1] / 255; bl *= mc[2] / 255; }
    if (tc) { r += (tc[0] - r) * tk; g += (tc[1] - g) * tk; bl += (tc[2] - bl) * tk; }
    const aa = al * (opt.a === undefined ? 1 : opt.a);
    const ox = x0 + xx + OX, oy = y0 + yy + OY;
    if (opt.dither) { if (aa < bay(ox, oy)) continue; pp(ox, oy, [r, g, bl], 1); }
    else pp(ox, oy, [r, g, bl], aa);
    // 挡住后面的光：画在前面的人、道具，把发光层里它身后的光清掉（不然路灯、窗光会透过脸）
    if (T === F && aa > .5 && ox >= CX0 && oy >= CY0 && ox < CX1 && oy < CY1 && (!MASK || MASK[oy * W + ox])) { const k = (oy * W + ox) * 3; GL.d[k] = 0; GL.d[k + 1] = 0; GL.d[k + 2] = 0; }
  }
}
// 按轮廓给层加一侧的亮边（逆光）
function rimLight(b, col, dx, dy, k) {
  const c = C(col), w = b.w, h = b.h, a = b.a, d = b.d; const hits = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x; if (a[i] < .5) continue;
    const xx = x + dx, yy = y + dy;
    if (xx < 0 || yy < 0 || xx >= w || yy >= h || a[yy * w + xx] < .5) hits.push(i);
  }
  for (const i of hits) { d[i * 3] += (c[0] - d[i * 3]) * k; d[i * 3 + 1] += (c[1] - d[i * 3 + 1]) * k; d[i * 3 + 2] += (c[2] - d[i * 3 + 2]) * k; }
}
// 整层染色（场景的环境光）
function layerTint(b, col, k, mode) {
  const c = C(col), n = b.w * b.h, d = b.d;
  for (let i = 0; i < n; i++) {
    if (b.a[i] <= 0) continue;
    for (let j = 0; j < 3; j++) d[i * 3 + j] = mode === 'mul' ? d[i * 3 + j] * (1 - k + k * c[j] / 255) : d[i * 3 + j] + (c[j] - d[i * 3 + j]) * k;
  }
}

// ---------- 输出 ----------
function toRGB(out) {
  const d = F.d;
  for (let i = 0; i < W * H * 3; i++) { const v = d[i]; out[i] = v < 0 ? 0 : v > 255 ? 255 : v; }
  return out;
}
function snapshot() { return Float32Array.from(F.d); }
