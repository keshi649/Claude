'use strict';
/* core.js —— 像素引擎。整片画在 480×270 的帧缓冲上，一格一格写像素（不经过浏览器的抗锯齿），出片时最近邻放大 4 倍。
   颜色是 u32（小端 ABGR，直接就是 ImageData 的字节）；写颜色用 C(0xRRGGBB)。
   所有画法只依赖时间 t：随机数一律用 hash()，不用 Math.random()。 */
const W = 480, H = 270, FPS = 30, TAU = Math.PI * 2;

/* ---------------- 数学 ---------------- */
const clamp = (v, a = 0, b = 1) => v < a ? a : v > b ? b : v;
const lerp = (a, b, t) => a + (b - a) * t;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const smooth = t => t * t * (3 - 2 * t);
const fract = x => x - Math.floor(x);
const E = {
  in: t => t * t, out: t => 1 - (1 - t) * (1 - t), io: t => t < .5 ? 2 * t * t : 1 - 2 * (1 - t) * (1 - t),
  in3: t => t * t * t, out3: t => 1 - (1 - t) ** 3, io3: t => t < .5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2,
  back: t => { const c = 1.7; return 1 + (c + 1) * (t - 1) ** 3 + c * (t - 1) ** 2; },
  sine: t => .5 - .5 * Math.cos(Math.PI * t),
};
function hash(a, b = 0, c = 0) {
  let h = (a * 374761393 + b * 668265263 + c * 1442695041) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177); h = Math.imul(h ^ (h >>> 16), 2246822519);
  return ((h ^ (h >>> 15)) >>> 0) / 4294967296;
}
const hr = (a, b, lo, hi, c = 0) => lo + (hi - lo) * hash(a, b, c);
function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i, seed) * 2 - 1, hash(i + 1, seed) * 2 - 1, u); }
function noise2(x, y, seed = 0) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(i, j, seed), b = hash(i + 1, j, seed), c = hash(i, j + 1, seed), d = hash(i + 1, j + 1, seed);
  return lerp(lerp(a, b, u), lerp(c, d, u), v) * 2 - 1;
}
const fbm = (x, y, seed = 0, oct = 3) => { let s = 0, a = .5, f = 1; for (let i = 0; i < oct; i++) { s += a * noise2(x * f, y * f, seed + i * 17); a *= .5; f *= 2; } return s; };
const mod = (a, n) => ((a % n) + n) % n;
const pick = (arr, i) => arr[mod(Math.floor(i), arr.length)];

/* ---------------- 颜色 ---------------- */
function C(hex, a = 255) { return ((a << 24) | ((hex & 255) << 16) | (hex & 0xff00) | ((hex >> 16) & 255)) >>> 0; }
const cr = c => c & 255, cg = c => (c >>> 8) & 255, cb = c => (c >>> 16) & 255, ca = c => c >>> 24;
const rgb = (r, g, b, a = 255) => (((a & 255) << 24) | ((clamp(Math.round(b), 0, 255)) << 16) | ((clamp(Math.round(g), 0, 255)) << 8) | clamp(Math.round(r), 0, 255)) >>> 0;
function mixc(c1, c2, t) { return rgb(lerp(cr(c1), cr(c2), t), lerp(cg(c1), cg(c2), t), lerp(cb(c1), cb(c2), t), Math.round(lerp(ca(c1), ca(c2), t))); }
const darker = (c, k) => mixc(c, C(0x1a1426), k);      // 暗部往深紫走，不往纯黑走
const lighter = (c, k) => mixc(c, C(0xfff6e0), k);     // 亮部往暖白走
const lum = c => (.299 * cr(c) + .587 * cg(c) + .114 * cb(c)) / 255;
/* 一串颜色按 t 取（不插值，像素画的色阶） */
const rampAt = (ramp, t) => ramp[clamp(Math.floor(t * ramp.length), 0, ramp.length - 1)];
/* 关键色之间插值：stops = [[t, 0xRRGGBB], ...] */
function gradAt(stops, t) {
  if (t <= stops[0][0]) return C(stops[0][1]);
  for (let i = 1; i < stops.length; i++) if (t <= stops[i][0]) { const [a, ca_] = stops[i - 1], [b, cb_] = stops[i]; return mixc(C(ca_), C(cb_), (t - a) / (b - a)); }
  return C(stops[stops.length - 1][1]);
}

/* ---------------- 画布（surface） ---------------- */
function surf(w, h) { const d8 = new Uint8ClampedArray(w * h * 4); return { w, h, d8, d32: new Uint32Array(d8.buffer) }; }
const SCR = surf(W, H);
let T = SCR;                                     // 当前画在哪块上
function withT(s, fn) { const o = T; T = s; try { return fn(); } finally { T = o; } }
function clear(c = 0) { T.d32.fill(c); }
const _pool = {};                                 // 按名字复用的离屏画布
function layer(name, w = W, h = H) { const k = name + w + 'x' + h; if (!_pool[k]) _pool[k] = surf(w, h); const s = _pool[k]; s.d32.fill(0); return s; }

/* ---------------- 画点 ---------------- */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
const bay = (x, y) => BAYER[((y & 3) << 2) | (x & 3)];
function pset(x, y, c) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= T.w || y >= T.h) return; T.d32[y * T.w + x] = c; }
function pget(x, y) { x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= T.w || y >= T.h) return 0; return T.d32[y * T.w + x]; }
/* a：0~1 的不透明度。dither = true 时不混色，按 Bayer 阈值要么画要么不画（像素画的半透明） */
function pblend(x, y, c, a = 1) {
  x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= T.w || y >= T.h || a <= 0) return;
  const i = y * T.w + x;
  if (a >= 1) { T.d32[i] = c; return; }
  const d = T.d8, j = i * 4, b = 1 - a;
  d[j] = d[j] * b + cr(c) * a; d[j + 1] = d[j + 1] * b + cg(c) * a; d[j + 2] = d[j + 2] * b + cb(c) * a; d[j + 3] = Math.max(d[j + 3], 255 * a);
}
/* 叠光：screen（只会变亮） */
function pscreen(x, y, c, a = 1) {
  x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= T.w || y >= T.h || a <= 0) return;
  const d = T.d8, j = (y * T.w + x) * 4;
  d[j] = 255 - (255 - d[j]) * (1 - cr(c) * a / 255); d[j + 1] = 255 - (255 - d[j + 1]) * (1 - cg(c) * a / 255); d[j + 2] = 255 - (255 - d[j + 2]) * (1 - cb(c) * a / 255);
}
function padd(x, y, c, a = 1) {
  x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= T.w || y >= T.h || a <= 0) return;
  const d = T.d8, j = (y * T.w + x) * 4; d[j] += cr(c) * a; d[j + 1] += cg(c) * a; d[j + 2] += cb(c) * a;
}
function pmul(x, y, c, a = 1) {
  x = Math.floor(x); y = Math.floor(y); if (x < 0 || y < 0 || x >= T.w || y >= T.h || a <= 0) return;
  const d = T.d8, j = (y * T.w + x) * 4;
  d[j] *= lerp(1, cr(c) / 255, a); d[j + 1] *= lerp(1, cg(c) / 255, a); d[j + 2] *= lerp(1, cb(c) / 255, a);
}
/* 统一的"画一格"：mode = 'n'（普通）| 's'（screen）| 'a'（add）| 'm'（multiply）| 'd'（抖动半透明） */
function dot(x, y, c, a = 1, mode = 'n') {
  if (mode === 'n') return pblend(x, y, c, a);
  if (mode === 's') return pscreen(x, y, c, a);
  if (mode === 'a') return padd(x, y, c, a);
  if (mode === 'm') return pmul(x, y, c, a);
  if (mode === 'd') { if (bay(Math.floor(x), Math.floor(y)) < a) pset(x, y, c); }
}
function rect(x, y, w, h, c, a = 1, mode = 'n') {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  const x0 = Math.max(0, x), y0 = Math.max(0, y), x1 = Math.min(T.w, x + w), y1 = Math.min(T.h, y + h);
  if (x1 <= x0 || y1 <= y0) return;
  if (a >= 1 && mode === 'n') { for (let yy = y0; yy < y1; yy++) T.d32.fill(c, yy * T.w + x0, yy * T.w + x1); return; }
  for (let yy = y0; yy < y1; yy++) for (let xx = x0; xx < x1; xx++) dot(xx, yy, c, a, mode);
}
function hspan(y, x0, x1, c, a = 1, mode = 'n') { x0 = Math.round(x0); x1 = Math.round(x1); if (x1 < x0) return; rect(x0, y, x1 - x0 + 1, 1, c, a, mode); }
/* 实心圆：像素画常用的形状（r 可以是小数；r ≤ 1 时就是一个点或一个小十字） */
function disc(cx, cy, r, c, a = 1, mode = 'n') {
  const rr = r * r + r * .6;
  const x0 = Math.floor(cx - r - 1), x1 = Math.ceil(cx + r + 1), y0 = Math.floor(cy - r - 1), y1 = Math.ceil(cy + r + 1);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const dx = x + .5 - cx, dy = y + .5 - cy; if (dx * dx + dy * dy <= rr) dot(x, y, c, a, mode); }
}
function ellipse(cx, cy, rx, ry, c, a = 1, mode = 'n') {
  if (rx <= 0 || ry <= 0) return;
  const x0 = Math.floor(cx - rx - 1), x1 = Math.ceil(cx + rx + 1), y0 = Math.floor(cy - ry - 1), y1 = Math.ceil(cy + ry + 1);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const dx = (x + .5 - cx) / (rx + .3), dy = (y + .5 - cy) / (ry + .3); if (dx * dx + dy * dy <= 1) dot(x, y, c, a, mode); }
}
/* 多边形（扫描线，偶奇规则，按像素中心取样） */
function poly(pts, c, a = 1, mode = 'n') {
  let y0 = Infinity, y1 = -Infinity;
  for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
  y0 = Math.max(0, Math.floor(y0)); y1 = Math.min(T.h - 1, Math.ceil(y1));
  const n = pts.length, xs = [];
  for (let y = y0; y <= y1; y++) {
    const sy = y + .5; xs.length = 0;
    for (let i = 0, j = n - 1; i < n; j = i++) {
      const [xi, yi] = pts[i], [xj, yj] = pts[j];
      if ((yi > sy) !== (yj > sy)) xs.push(xi + (sy - yi) / (yj - yi) * (xj - xi));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const xa = Math.ceil(xs[k] - .5), xb = Math.floor(xs[k + 1] - .5);
      if (xb >= xa) hspan(y, xa, xb, c, a, mode);
    }
  }
}
/* 直线（Bresenham，一格宽） */
function line(x0, y0, x1, y1, c, a = 1, mode = 'n') {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let e = dx + dy, guard = 0;
  for (;;) {
    dot(x0, y0, c, a, mode);
    if (x0 === x1 && y0 === y1 || ++guard > 4000) break;
    const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; }
  }
}
/* 粗线（两头圆）：到线段的距离 ≤ w/2 的格子。胳膊、腿、树枝都用它 */
function capsule(x0, y0, x1, y1, w, c, a = 1, mode = 'n') {
  const r = w / 2, bx0 = Math.floor(Math.min(x0, x1) - r - 1), bx1 = Math.ceil(Math.max(x0, x1) + r + 1);
  const by0 = Math.floor(Math.min(y0, y1) - r - 1), by1 = Math.ceil(Math.max(y0, y1) + r + 1);
  const vx = x1 - x0, vy = y1 - y0, L2 = vx * vx + vy * vy || 1e-9, rr = r * r + r * .25;
  for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
    const px = x + .5 - x0, py = y + .5 - y0, u = clamp((px * vx + py * vy) / L2), qx = px - u * vx, qy = py - u * vy;
    if (qx * qx + qy * qy <= rr) dot(x, y, c, a, mode);
  }
}
function ring(cx, cy, r, c, a = 1, mode = 'n') {
  const n = Math.max(12, Math.ceil(r * 7)); let px = null, py = null;
  for (let i = 0; i <= n; i++) { const x = Math.round(cx + Math.cos(i / n * TAU) * r), y = Math.round(cy + Math.sin(i / n * TAU) * r); if (x !== px || y !== py) dot(x, y, c, a, mode); px = x; py = y; }
}

/* 竖直渐变：stops 关键色；bands > 0 时量化成色阶，色阶交界用 Bayer 抖动（像素画的天空） */
function vgrad(x, y, w, h, stops, bands = 0, a = 1, mode = 'n') {
  x = Math.round(x); y = Math.round(y);
  for (let yy = Math.max(0, y); yy < Math.min(T.h, y + h); yy++) {
    const t = (yy - y + .5) / h;
    if (!bands) { const c = gradAt(stops, t); rect(x, yy, w, 1, c, a, mode); continue; }
    const q = t * bands, b0 = Math.floor(q), f = q - b0;
    const c0 = gradAt(stops, (b0 + .5) / bands), c1 = gradAt(stops, Math.min(1, (b0 + 1.5) / bands));
    for (let xx = Math.max(0, x); xx < Math.min(T.w, x + w); xx++) dot(xx, yy, bay(xx, yy) < f ? c1 : c0, a, mode);
  }
}
/* 竖直方向的径向渐变光（光晕、太阳周围），量化成 steps 级 */
function glowDisc(cx, cy, r, c, a = 1, steps = 6, mode = 's') {
  const x0 = Math.floor(cx - r), x1 = Math.ceil(cx + r), y0 = Math.floor(cy - r), y1 = Math.ceil(cy + r);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const d = Math.hypot(x + .5 - cx, y + .5 - cy) / r; if (d >= 1) continue;
    const v = Math.ceil((1 - d) ** 1.6 * steps) / steps;
    dot(x, y, c, a * v, mode);
  }
}

/* ---------------- 精灵：字符画 ---------------- */
/* rows：字符串数组，'.' 或 ' ' 透明，其余字母按 pal 取色。缓存成 {w,h,px:Uint32Array}（0 = 透明） */
const _sprCache = new Map();
function spr(rows, pal) {
  const key = rows.join('\n') + '|' + Object.entries(pal).map(([k, v]) => k + v).join();
  let s = _sprCache.get(key);
  if (s) return s;
  const h = rows.length, w = Math.max(...rows.map(r => r.length)), px = new Uint32Array(w * h);
  rows.forEach((r, y) => { for (let x = 0; x < r.length; x++) { const ch = r[x]; if (ch !== '.' && ch !== ' ' && pal[ch] !== undefined) px[y * w + x] = pal[ch]; } });
  s = { w, h, px }; _sprCache.set(key, s); return s;
}
/* 把精灵贴到当前画布：o.flip 水平翻转，o.alpha，o.mode，o.tint = [颜色, 程度]，o.scale 整数放大 */
function stamp(s, x, y, o = {}) {
  const k = o.scale || 1, a = o.alpha ?? 1, mode = o.mode || 'n';
  x = Math.round(x); y = Math.round(y);
  for (let j = 0; j < s.h; j++) for (let i = 0; i < s.w; i++) {
    let c = s.px[j * s.w + (o.flip ? s.w - 1 - i : i)]; if (!c) continue;
    if (o.tint) c = mixc(c, o.tint[0], o.tint[1]);
    if (k === 1) dot(x + i, y + j, c, a, mode); else rect(x + i * k, y + j * k, k, k, c, a, mode);
  }
}

/* ---------------- 离屏画布贴回 ---------------- */
/* src 贴到当前画布的 (dx, dy)：透明格跳过。o.alpha、o.mode、o.flip、o.scale（整数）、o.sx/sy/sw/sh 源区域 */
function blit(src, dx, dy, o = {}) {
  const a = o.alpha ?? 1, mode = o.mode || 'n', k = o.scale || 1;
  const sx = o.sx || 0, sy = o.sy || 0, sw = o.sw || src.w, sh = o.sh || src.h;
  dx = Math.round(dx); dy = Math.round(dy);
  if (k === 1 && mode === 'n' && a >= 1 && !o.flip) {
    for (let j = 0; j < sh; j++) {
      const ty = dy + j; if (ty < 0 || ty >= T.h) continue;
      const srow = (sy + j) * src.w + sx, trow = ty * T.w;
      for (let i = 0; i < sw; i++) {
        const tx = dx + i; if (tx < 0 || tx >= T.w) continue;
        const c = src.d32[srow + i]; if (c >>> 24 === 0) continue;
        if (c >>> 24 === 255) T.d32[trow + tx] = c; else pblend(tx, ty, c | 0xff000000, (c >>> 24) / 255);
      }
    }
    return;
  }
  for (let j = 0; j < sh; j++) for (let i = 0; i < sw; i++) {
    const c = src.d32[(sy + j) * src.w + sx + (o.flip ? sw - 1 - i : i)]; if (c >>> 24 === 0) continue;
    const al = a * (c >>> 24) / 255, cc = c | 0xff000000;
    if (k === 1) dot(dx + i, dy + j, cc, al, mode); else rect(dx + i * k, dy + j * k, k, k, cc, al, mode);
  }
}
/* 最近邻缩放贴图（推拉镜头）：src 的 (cx, cy) 对到屏幕 (tx, ty)，放大 z 倍 */
function blitZoom(src, cx, cy, z, tx = W / 2, ty = H / 2, o = {}) {
  const a = o.alpha ?? 1;
  for (let y = 0; y < T.h; y++) {
    const syy = Math.floor(cy + (y + .5 - ty) / z); if (syy < 0 || syy >= src.h) continue;
    for (let x = 0; x < T.w; x++) {
      const sxx = Math.floor(cx + (x + .5 - tx) / z); if (sxx < 0 || sxx >= src.w) continue;
      const c = src.d32[syy * src.w + sxx]; if (c >>> 24 === 0) continue;
      if (a >= 1 && c >>> 24 === 255) T.d32[y * T.w + x] = c; else pblend(x, y, c | 0xff000000, a * (c >>> 24) / 255);
    }
  }
}
/* 描边：透明格挨着不透明格就涂成 col（像素画的外轮廓）。col 是函数时，传入挨着的那格颜色 */
function outline(s, col, diag = false) {
  const { w, h, d32 } = s, add = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (d32[y * w + x] >>> 24) continue;
    let nb = 0;
    const tryN = (xx, yy) => { if (!nb && xx >= 0 && yy >= 0 && xx < w && yy < h && (d32[yy * w + xx] >>> 24) > 128) nb = d32[yy * w + xx]; };
    tryN(x - 1, y); tryN(x + 1, y); tryN(x, y - 1); tryN(x, y + 1);
    if (diag) { tryN(x - 1, y - 1); tryN(x + 1, y - 1); tryN(x - 1, y + 1); tryN(x + 1, y + 1); }
    if (nb) add.push(y * w + x, typeof col === 'function' ? col(nb) : col);
  }
  for (let i = 0; i < add.length; i += 2) d32[add[i]] = add[i + 1];
}
/* 侧光：不透明格在光来的方向上挨着透明格，就提亮（角色、楼边的轮廓光） */
function rimLight(s, dx, dy, c, a = .6, width = 1) {
  const { w, h, d32 } = s, hit = [];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    if (!(d32[y * w + x] >>> 24)) continue;
    for (let k = 1; k <= width; k++) {
      const xx = x + dx * k, yy = y + dy * k;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h || !(d32[yy * w + xx] >>> 24)) { hit.push(y * w + x); break; }
    }
  }
  const o = T; T = s; for (const i of hit) pscreen(i % w, Math.floor(i / w), c, a); T = o;
}
/* 整块上色：已有像素往 c 混 k（夜景压暗、回忆泛黄） */
function tintSurf(s, c, k) { const { d32 } = s; for (let i = 0; i < d32.length; i++) { const v = d32[i]; if (v >>> 24) d32[i] = (mixc(v, c, k) & 0xffffff) | (v & 0xff000000); } }

/* ---------------- 后期 ---------------- */
const _bl = { a: new Float32Array((W / 2) * (H / 2) * 3), b: new Float32Array((W / 2) * (H / 2) * 3) };
/* 泛光：亮过 thr 的部分缩一半、模糊、screen 叠回去。像素不糊，光是软的 */
function bloom(thr = .6, k = .6, rad = 3, tint = null) {
  const w2 = W / 2, h2 = H / 2, A = _bl.a, B = _bl.b, d = SCR.d8;
  for (let y = 0; y < h2; y++) for (let x = 0; x < w2; x++) {
    let r = 0, g = 0, b = 0;
    for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
      const p = ((y * 2 + j) * W + x * 2 + i) * 4, L = (.299 * d[p] + .587 * d[p + 1] + .114 * d[p + 2]) / 255;
      const m = Math.max(0, L - thr) / (1 - thr); r += d[p] * m; g += d[p + 1] * m; b += d[p + 2] * m;
    }
    const q = (y * w2 + x) * 3; A[q] = r / 4; A[q + 1] = g / 4; A[q + 2] = b / 4;
  }
  for (let pass = 0; pass < 3; pass++) { boxBlur(A, B, w2, h2, rad, true); boxBlur(B, A, w2, h2, rad, false); }
  const tr = tint ? cr(tint) / 255 : 1, tg = tint ? cg(tint) / 255 : 1, tb = tint ? cb(tint) / 255 : 1;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const q = ((y >> 1) * w2 + (x >> 1)) * 3, p = (y * W + x) * 4;
    const r = A[q] * k * tr, g = A[q + 1] * k * tg, b = A[q + 2] * k * tb;
    d[p] = 255 - (255 - d[p]) * (1 - r / 255); d[p + 1] = 255 - (255 - d[p + 1]) * (1 - g / 255); d[p + 2] = 255 - (255 - d[p + 2]) * (1 - b / 255);
  }
}
function boxBlur(src, dst, w, h, r, horiz) {
  const n = 2 * r + 1;
  if (horiz) for (let y = 0; y < h; y++) for (let ch = 0; ch < 3; ch++) {
    let s = 0; for (let i = -r; i <= r; i++) s += src[(y * w + clamp(i, 0, w - 1)) * 3 + ch];
    for (let x = 0; x < w; x++) { dst[(y * w + x) * 3 + ch] = s / n; s += src[(y * w + Math.min(w - 1, x + r + 1)) * 3 + ch] - src[(y * w + Math.max(0, x - r)) * 3 + ch]; }
  }
  else for (let x = 0; x < w; x++) for (let ch = 0; ch < 3; ch++) {
    let s = 0; for (let i = -r; i <= r; i++) s += src[(clamp(i, 0, h - 1) * w + x) * 3 + ch];
    for (let y = 0; y < h; y++) { dst[(y * w + x) * 3 + ch] = s / n; s += src[(Math.min(h - 1, y + r + 1) * w + x) * 3 + ch] - src[(Math.max(0, y - r) * w + x) * 3 + ch]; }
  }
}
const _vig = new Float32Array(W * H);
for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const dx = (x + .5) / W - .5, dy = ((y + .5) / H - .5) * .82; _vig[y * W + x] = Math.min(1, (dx * dx + dy * dy) * 2.2) ** 1.5; }
/* 暗角：四角压暗（往 col 混），量化成 16 级、级与级之间按 Bayer 抖动，看不出一圈圈的边 */
function vignette(k = .5, col = 0x0e0a1c) {
  const d = SCR.d8, r = (col >> 16) & 255, g = (col >> 8) & 255, b = col & 255;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = y * W + x, q = _vig[i] * k * 16, v = Math.floor(q + bay(x, y)) / 16; if (v <= 0) continue;
    const p = i * 4; d[p] += (r - d[p]) * v; d[p + 1] += (g - d[p + 1]) * v; d[p + 2] += (b - d[p + 2]) * v;
  }
}
/* 调色：亮度、对比、饱和、往某个颜色偏（暖黄的回忆、蓝色的夜） */
function grade(o) {
  const d = SCR.d8, con = o.con ?? 1, sat = o.sat ?? 1, bri = o.bri ?? 0, tk = o.tint ? o.tint[1] : 0;
  const tr = o.tint ? (o.tint[0] >> 16) & 255 : 0, tg = o.tint ? (o.tint[0] >> 8) & 255 : 0, tb = o.tint ? o.tint[0] & 255 : 0;
  for (let p = 0; p < d.length; p += 4) {
    let r = d[p], g = d[p + 1], b = d[p + 2];
    const L = .299 * r + .587 * g + .114 * b;
    r = L + (r - L) * sat; g = L + (g - L) * sat; b = L + (b - L) * sat;
    r = (r - 128) * con + 128 + bri; g = (g - 128) * con + 128 + bri; b = (b - 128) * con + 128 + bri;
    if (tk) { r += (tr - r) * tk; g += (tg - g) * tk; b += (tb - b) * tk; }
    d[p] = r; d[p + 1] = g; d[p + 2] = b;
  }
}

/* ---------------- 像素字 ---------------- */
/* 缝合像素字体（Fusion Pixel，SIL OFL）12px 和 8px。在小画布上按字号原大画出来，alpha > 110 算有笔画，缓存成点阵。
   字形在格子里有上下偏移：拿"国了鬓"这些字找最低、最高的笔画行，统一对齐到格子里。 */
const FONT = { 12: { fam: 'FP12', cell: 12 }, 8: { fam: 'FP8', cell: 8 } };
const _gc = document.createElement('canvas'); _gc.width = 40; _gc.height = 40;
const _gx = _gc.getContext('2d', { willReadFrequently: true });
const _glyphs = {};
function _rawGlyph(ch, size) {
  const f = FONT[size]; _gx.clearRect(0, 0, 40, 40); _gx.font = `${size}px ${f.fam}`; _gx.textBaseline = 'alphabetic'; _gx.fillStyle = '#fff';
  _gx.fillText(ch, 8, 24);
  const adv = Math.round(_gx.measureText(ch).width), im = _gx.getImageData(0, 0, 40, 40).data, on = [];
  for (let y = 0; y < 40; y++) for (let x = 0; x < 40; x++) if (im[(y * 40 + x) * 4 + 3] > 110) on.push([x - 8, y]);
  return { adv, on };
}
function _fontTop(size) {
  const f = FONT[size]; if (f.top !== undefined) return f.top;
  let lo = -1; for (const ch of '国了鬓高风') for (const [, y] of _rawGlyph(ch, size).on) lo = Math.max(lo, y);
  f.top = lo - (f.cell - 1); return f.top;          // 格子的第一行在画布上的 y
}
function glyph(ch, size = 12) {
  const k = size + ch; if (_glyphs[k]) return _glyphs[k];
  const top = _fontTop(size), { adv, on } = _rawGlyph(ch, size), cell = FONT[size].cell;
  const bits = new Uint8Array(adv * cell + cell * 4);
  const gw = Math.max(adv, 1), pts = [];
  for (const [x, y] of on) { const yy = y - top; if (x >= 0 && x < gw + 2 && yy >= 0 && yy < cell + 2) pts.push([x, yy]); }
  return (_glyphs[k] = { adv: gw, pts, cell });
}
function textWidth(str, size = 12, sp = 1) { let w = 0; for (const ch of str) w += glyph(ch, size).adv + sp; return Math.max(0, w - sp); }
/* 写字：x 是 align 的基准（'l' 左、'c' 中、'r' 右），y 是格子的顶。
   o.col 颜色（或 (i, ch) => 颜色）、o.alpha、o.scale 整数放大、o.sp 字距、o.out 描边色、o.sh 投影色（右下 1 格）、o.mode */
function text(str, x, y, o = {}) {
  const size = o.size || 12, k = o.scale || 1, sp = o.sp ?? 1, chars = [...str];
  const w = textWidth(str, size, sp) * k;
  let cx = Math.round(o.align === 'l' ? x : o.align === 'r' ? x - w : x - w / 2);
  y = Math.round(y);
  const out = [];
  chars.forEach((ch, i) => { out.push({ ch, i, x: cx }); cx += (glyph(ch, size).adv + sp) * k; });
  const draw = (dx, dy, colf, al) => {
    for (const g of out) {
      const gl = glyph(g.ch, size), c = typeof colf === 'function' ? colf(g.i, g.ch) : colf;
      const a = (typeof al === 'function' ? al(g.i, g.ch) : al); if (a <= 0 || c === null) continue;
      for (const [px, py] of gl.pts) rect(g.x + (px + dx) * k, y + (py + dy) * k, k, k, c, a, o.mode || 'n');
    }
  };
  const al = o.alpha ?? 1;
  if (o.sh) draw(1, 1, o.sh, al);
  if (o.out) for (const [ox, oy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) draw(ox, oy, o.out, al);
  draw(0, 0, o.col ?? C(0xffffff), al);
  return { w, x0: Math.round(o.align === 'l' ? x : o.align === 'r' ? x - w : x - w / 2), chars: out };
}

/* ---------------- 音乐 ---------------- */
const _dec = s => { const a = new Float32Array(s.length); for (let i = 0; i < s.length; i++) { const c = s.charCodeAt(i); a[i] = (c < 58 ? c - 48 : c < 91 ? c - 55 : c - 61) / 61; } return a; };
const VOC = _dec(VOC_S), ACC = _dec(ACC_S), BEATS = _dec(BEATS_S);
const envAt = (arr, t) => { const f = t * ENV_FPS, i = Math.floor(f); return lerp(arr[clamp(i, 0, arr.length - 1)] || 0, arr[clamp(i + 1, 0, arr.length - 1)] || 0, f - i); };
const vocal = t => envAt(VOC, t), accomp = t => envAt(ACC, t);
const beatIdx = t => Math.floor((t - BEAT0) / BEAT);
/* 节拍脉冲：每拍开头 1，往后衰减；按这一拍的力度加权 */
function pulse(t, dec = 5) { const b = beatIdx(t), ph = t - (BEAT0 + b * BEAT); return Math.exp(-ph * dec) * (BEATS[clamp(b, 0, BEATS.length - 1)] ?? .5); }
