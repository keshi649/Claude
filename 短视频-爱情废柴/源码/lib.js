'use strict';
/* pixlib.js —— 像素样张的底层：480×270 的小画布，出图时最近邻放大 4 倍；亮的东西另画一层光晕。 */
const PW = 480, PH = 270, fl = Math.floor;
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d', { willReadFrequently: true }); g.imageSmoothingEnabled = false; return g; }
function rng(seed) { let a = seed >>> 0; return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function h2(c) { const n = parseInt(c.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgb(a) { return '#' + a.map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, t) { const A = h2(a), B = h2(b); return rgb(A.map((v, i) => v + (B[i] - v) * t)); }
const lt = (c, t) => mix(c, '#ffffff', t), dk = (c, t) => mix(c, '#000000', t);
function R(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
const BAYER = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
const bay = (x, y) => (BAYER[y & 3][x & 3] + .5) / 16;
/* 按比例 p 抖动填充一块 */
function dith(g, x, y, w, h, c, p) { x = Math.round(x); y = Math.round(y); g.fillStyle = c; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (bay(x + i, y + j) < p) g.fillRect(x + i, y + j, 1, 1); }
/* 竖向分级渐变，交界处抖动 */
function vgrad(g, x, y, w, h, cols) {
  const n = cols.length - 1;
  for (let j = 0; j < h; j++) {
    const f = j / h * n, k = Math.min(n - 1, fl(f)), t = f - k;
    g.fillStyle = cols[k]; g.fillRect(x, y + j, w, 1); g.fillStyle = cols[k + 1];
    for (let i = 0; i < w; i++) if (bay(x + i, y + j) < t) g.fillRect(x + i, y + j, 1, 1);
  }
}
/* 用函数决定每个像素画不画：f(x,y) 返回 0~1 的浓度 */
function field(g, x0, y0, w, h, c, f) { g.fillStyle = c; for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const p = f(x0 + i, y0 + j); if (p > 0 && bay(x0 + i, y0 + j) < p) g.fillRect(x0 + i, y0 + j, 1, 1); } }
function disc(g, cx, cy, r, c, p = 1) { field(g, fl(cx - r), fl(cy - r), Math.ceil(2 * r + 1), Math.ceil(2 * r + 1), c, (x, y) => ((x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 <= r * r) ? p : 0); }
function ell(g, cx, cy, rx, ry, c, p = 1) { field(g, fl(cx - rx), fl(cy - ry), Math.ceil(2 * rx + 1), Math.ceil(2 * ry + 1), c, (x, y) => (((x + .5 - cx) / rx) ** 2 + ((y + .5 - cy) / ry) ** 2 <= 1) ? p : 0); }
/* 软边圆（中间浓、边上淡），画光斑用 */
function soft(g, cx, cy, r, c, p = 1) { field(g, fl(cx - r), fl(cy - r), Math.ceil(2 * r + 1), Math.ceil(2 * r + 1), c, (x, y) => { const d = Math.hypot(x + .5 - cx, y + .5 - cy) / r; return d >= 1 ? 0 : p * (1 - d * d); }); }
function line(g, x0, y0, x1, y1, c, th = 1) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1); g.fillStyle = c;
  const dx = Math.abs(x1 - x0), dy = Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx - dy;
  for (; ;) { g.fillRect(x0, y0, th, th); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 > -dy) { e -= dy; x0 += sx; } if (e2 < dx) { e += dx; y0 += sy; } }
}
/* 像素字：Fusion Pixel 12px，按 alpha 二值化再整数倍放大。o：s 倍数，align 'l'|'c'|'r'，ol 描边色，sh 阴影色 */
const _tc = {};
function tbits(s) {
  if (_tc[s]) return _tc[s];
  const t = mk(s.length * 14 + 8, 18); t.font = '12px FusionPixel'; t.textBaseline = 'top'; t.fillStyle = '#fff'; t.fillText(s, 2, 2);
  const w = Math.ceil(t.measureText(s).width) + 4, d = t.getImageData(0, 0, w, 18).data, pts = [];
  let y0 = 99, y1 = 0;
  for (let j = 0; j < 18; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 110) { pts.push([i - 2, j - 2]); y0 = Math.min(y0, j - 2); y1 = Math.max(y1, j - 2); }
  return _tc[s] = { w: w - 4, pts, y0, y1 };
}
function ptext(g, s, x, y, c, o = {}) {
  const sc = o.s || 1, b = tbits(s), x0 = Math.round(o.align === 'c' ? x - b.w * sc / 2 : o.align === 'r' ? x - b.w * sc : x);
  if (o.ol) { g.fillStyle = o.ol; b.pts.forEach(([i, j]) => g.fillRect(x0 + i * sc - 1, y + j * sc - 1, sc + 2, sc + 2)); }
  if (o.sh) { g.fillStyle = o.sh; b.pts.forEach(([i, j]) => g.fillRect(x0 + i * sc + sc, y + j * sc + sc, sc, sc)); }
  g.fillStyle = c; b.pts.forEach(([i, j]) => g.fillRect(x0 + i * sc, y + j * sc, sc, sc));
  return b.w * sc;
}
const ORANGE = '#D97757', INK = '#1A1216';
/* 把 src（一块小画布）绕中心转 ang 弧度、放大 sc 倍，最近邻贴到 dst 的 (cx,cy)，边不会糊 */
function rotBlit(dst, src, cx, cy, ang, sc = 1, alpha = 1) {
  const sw = src.canvas.width, sh = src.canvas.height, sd = src.getImageData(0, 0, sw, sh).data;
  const rad = Math.ceil(Math.hypot(sw, sh) * sc / 2) + 1, x0 = Math.round(cx - rad), y0 = Math.round(cy - rad), n = rad * 2;
  const co = Math.cos(-ang), si = Math.sin(-ang);
  for (let j = 0; j < n; j++) for (let i = 0; i < n; i++) {
    const dx = (x0 + i + .5 - cx) / sc, dy = (y0 + j + .5 - cy) / sc, u = fl(dx * co - dy * si + sw / 2), v = fl(dx * si + dy * co + sh / 2);
    if (u < 0 || v < 0 || u >= sw || v >= sh) continue; const k = (v * sw + u) * 4; if (sd[k + 3] < 128) continue;
    dst.globalAlpha = alpha; dst.fillStyle = `rgb(${sd[k]},${sd[k + 1]},${sd[k + 2]})`; dst.fillRect(x0 + i, y0 + j, 1, 1);
  }
  dst.globalAlpha = 1;
}
/* 雪：n 片，大小 sz，颜色 c，浓度 p；rect 限定范围 */
function snow(g, seed, n, sz, c, p = 1, rect = [0, 0, PW, PH], streak = 0) {
  const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = fl(rect[0] + r() * rect[2]), y = fl(rect[1] + r() * rect[3]);
    if (sz <= 1) { if (r() < p) R(g, x, y, 1, 1, c); if (streak && r() < .3) R(g, x - 1, y - 1, 1, 1, c); }
    else if (sz === 2) { R(g, x, y, 2, 1, c); R(g, x, y + 1, 1, 1, c); if (r() < .5) R(g, x + 1, y + 1, 1, 1, c); }
    else { soft(g, x, y, sz, c, p); }
  }
}
/* 出图：小画布放大 4 倍；光晕层模糊后 screen 叠回去；最后压一点暗角 */
/* 小灯泡串：两点之间一条下垂的线，隔几像素一个灯泡 */
const BULBS = ['#FF5A5A', '#FFD54A', '#5ADB7A', '#5AB8FF', '#FF8AD8'];
function lights(g, G, x0, y0, x1, y1, sag, step = 6, seed = 1, wire = '#1B2140') {
  const n = Math.max(2, Math.round(Math.hypot(x1 - x0, y1 - y0) / 1)); let last = -99, k = seed;
  for (let i = 0; i <= n; i++) {
    const t = i / n, x = Math.round(x0 + (x1 - x0) * t), y = Math.round(y0 + (y1 - y0) * t + sag * 4 * t * (1 - t));
    R(g, x, y, 1, 1, wire);
    if (x - last >= step) { last = x; const c = BULBS[k++ % BULBS.length]; R(g, x, y + 1, 1, 2, c); R(g, x, y + 1, 1, 1, lt(c, .5)); if (G) soft(G, x + .5, y + 2, 3.5, c, .9); }
  }
}
