'use strict';
/* core.js —— 像素画布上的基础工具：数学、缓动、噪声、颜色、像素图元、抖动渐变、发光、精灵、像素字。
   整片都画在 480×270 上（成片里一个像素 = 4×4），出片时 ffmpeg 用最近邻放大到 1920×1080，所以画面里没有半个像素。
   每一帧只由时刻 t 决定（不攒状态），哪一帧都能单独画。 */
const W = 480, H = 270, FPS = 30;
const TAU = Math.PI * 2, PI = Math.PI;
const TM = window.TIMING, DUR = 315.4667, BEAT = TM.beat, BAR = TM.bar;
const bar = k => TM.bar0 + k * TM.bar;                 // 第 k 小节第一拍
const LY = TM.lines;
const ch = (li, ci) => LY[li].chars[ci][1];             // 第 li 句第 ci 个字开口的时刻
const lineEnd = li => LY[li].chars[LY[li].chars.length - 1][2];

const cv = document.getElementById('cv'); cv.width = W; cv.height = H;
const ctx = cv.getContext('2d', { willReadFrequently: true });

/* ---------------- 数学 ---------------- */
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const env = (t, a, b, c, d) => Math.min(seg(t, a, b), 1 - seg(t, c, d));
const mod = (a, n) => ((a % n) + n) % n;
const ri = Math.round, fl = Math.floor;
const E = {
  in2: u => u * u, in3: u => u * u * u, out: u => 1 - (1 - u) * (1 - u), out3: u => 1 - Math.pow(1 - u, 3),
  io: u => u < .5 ? 2 * u * u : 1 - 2 * (1 - u) * (1 - u), sine: u => .5 - .5 * Math.cos(PI * u),
  back: u => { const c = 1.7; return 1 + (c + 1) * Math.pow(u - 1, 3) + c * Math.pow(u - 1, 2); },
};
function hash(a, b = 0, c = 0) {
  let h = Math.imul(a | 0, 0x27d4eb2d) ^ Math.imul((b | 0) + 0x3c6ef372, 0x165667b1) ^ Math.imul((c | 0) + 0x5bd1e995, 0x9e3779b1);
  h = Math.imul(h ^ (h >>> 15), 0x85ebca6b); h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35); h ^= h >>> 16;
  return (h >>> 0) / 4294967296;
}
const hr = (i, s, a, b) => a + (b - a) * hash(i, s);     // 第 i 个东西的第 s 个随机数，落在 a~b
function noise1(x, s = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i, s), hash(i + 1, s), u); }
function noise2(x, y, s = 0) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j, ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  return lerp(lerp(hash(i, j, s), hash(i + 1, j, s), ux), lerp(hash(i, j + 1, s), hash(i + 1, j + 1, s), ux), uy);
}
const fbm = (x, y, s = 0) => noise2(x, y, s) * .55 + noise2(x * 2.1, y * 2.1, s + 7) * .3 + noise2(x * 4.3, y * 4.3, s + 13) * .15;
/* 小节、拍子上的冲击：拍点后 0~1 衰减（做闪光、镜头一顿） */
const beatHit = (t, k = 6) => Math.exp(-k * mod(t - TM.bar0, BEAT));

/* ---------------- 颜色 ---------------- */
const HEXC = {};
function rgb(h) { let c = HEXC[h]; if (c) return c; const n = parseInt(h.slice(1, 7), 16); return (HEXC[h] = [n >> 16 & 255, n >> 8 & 255, n & 255]); }
const hex = (r, g, b) => '#' + ((1 << 24) | (clamp(ri(r), 0, 255) << 16) | (clamp(ri(g), 0, 255) << 8) | clamp(ri(b), 0, 255)).toString(16).slice(1);
function mix(a, b, u) { const A = rgb(a), B = rgb(b); return hex(lerp(A[0], B[0], u), lerp(A[1], B[1], u), lerp(A[2], B[2], u)); }
const dk = (c, k) => mix(c, '#120A2E', k);                // 暗部往蓝紫偏（像素画的色相偏移）
const lt = (c, k) => mix(c, '#FFF6DA', k);                // 亮部往暖白偏
function rgba(c, a) { const A = rgb(c); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; }
function mixN(cols, u) { u = clamp(u) * (cols.length - 1); const i = Math.min(cols.length - 2, fl(u)); return mix(cols[i], cols[i + 1], u - i); }

/* ---------------- 画布 ---------------- */
function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; }
const CACHE = new Map();
function cached(key, w, h, draw) {
  let c = CACHE.get(key); if (c) return c;
  c = mk(w, h); const g = c.getContext('2d'); g.imageSmoothingEnabled = false; draw(g, c);
  if (CACHE.size > 6000) CACHE.delete(CACHE.keys().next().value);
  CACHE.set(key, c); return c;
}
const LAYER = {};
function layer(name, w = W, h = H, clear = true) {
  let c = LAYER[name]; if (!c || c.width !== w || c.height !== h) c = LAYER[name] = mk(w, h);
  const g = c.getContext('2d', { willReadFrequently: true });
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.imageSmoothingEnabled = false; g.filter = 'none';
  if (clear) g.clearRect(0, 0, w, h);
  return g;
}

/* ---------------- 像素图元（坐标都取整） ---------------- */
function R(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(ri(x), ri(y), ri(w), ri(h)); }
function P(g, x, y, c) { g.fillStyle = c; g.fillRect(ri(x), ri(y), 1, 1); }
function line(g, x0, y0, x1, y1, c) {
  x0 = ri(x0); y0 = ri(y0); x1 = ri(x1); y1 = ri(y1); g.fillStyle = c;
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy, n = 0;
  for (; n < 4000; n++) { g.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
function disc(g, cx, cy, r, c) {
  g.fillStyle = c; cx = ri(cx); cy = ri(cy); const n = fl(r);
  for (let dy = -n; dy <= n; dy++) { const hw = ri(Math.sqrt(Math.max(0, r * r - dy * dy))); g.fillRect(cx - hw, cy + dy, hw * 2 + 1, 1); }
}
function ell(g, cx, cy, rx, ry, c) {
  g.fillStyle = c; cx = ri(cx); cy = ri(cy); const n = fl(ry);
  for (let dy = -n; dy <= n; dy++) { const hw = ri(rx * Math.sqrt(Math.max(0, 1 - dy * dy / (ry * ry)))); g.fillRect(cx - hw, cy + dy, hw * 2 + 1, 1); }
}
function ring(g, cx, cy, r, c) {
  g.fillStyle = c; cx = ri(cx); cy = ri(cy); r = ri(r); let x = r, y = 0, e = 1 - r;
  while (x >= y) {
    [[x, y], [y, x], [-y, x], [-x, y], [-x, -y], [-y, -x], [y, -x], [x, -y]].forEach(([a, b]) => g.fillRect(cx + a, cy + b, 1, 1));
    y++; if (e < 0) e += 2 * y + 1; else { x--; e += 2 * (y - x) + 1; }
  }
}
function poly(g, pts, c) {                               // 扫描线填多边形（奇偶规则），边缘不发虚
  g.fillStyle = c; let y0 = 1e9, y1 = -1e9; pts.forEach(p => { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
  for (let y = Math.ceil(y0 - .5); y <= fl(y1 - .5); y++) {
    const yc = y + .5, xs = [];
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[j];
      if ((ay <= yc) !== (by <= yc)) xs.push(ax + (yc - ay) / (by - ay) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let k = 0; k + 1 < xs.length; k += 2) { const a = ri(xs[k]), b = ri(xs[k + 1]); if (b > a) g.fillRect(a, y, b - a, 1); }
  }
}
/* Bayer 4×4 抖动：按比例 a 铺一层颜色（图案固定在画布上，平移时不跟着走） */
const BAYER4 = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
const PAT = {};
function dpat(c, lv) {
  const k = c + ':' + lv; let p = PAT[k]; if (p) return p;
  const t = mk(4, 4), q = t.getContext('2d'); q.fillStyle = c;
  for (let i = 0; i < 16; i++) if (BAYER4[i] < lv) q.fillRect(i & 3, i >> 2, 1, 1);
  return (PAT[k] = ctx.createPattern(t, 'repeat'));
}
function dith(g, x, y, w, h, c, a) {
  const lv = ri(clamp(a) * 16); if (lv <= 0) return;
  if (lv >= 16) { R(g, x, y, w, h, c); return; }
  g.fillStyle = dpat(c, lv); g.fillRect(ri(x), ri(y), ri(w), ri(h));
}
/* 竖直渐变：stops = [[0,色],[.4,色],…]；z 抖动过渡带占每段的比例（1 = 全程抖动，小 = 一条条色带） */
function vgrad(g, x, y, w, h, stops, z = 1) {
  for (let j = 0; j < h; j++) {
    const u = (j + .5) / h; let k = 0; while (k < stops.length - 2 && u > stops[k + 1][0]) k++;
    const [u0, c0] = stops[k], [u1, c1] = stops[k + 1]; let f = clamp((u - u0) / (u1 - u0));
    if (z < 1) f = clamp((f - .5) / z + .5);
    R(g, x, y + j, w, 1, c0); if (f > 0) dith(g, x, y + j, w, 1, c1, f);
  }
}
/* 发光：一圈圈台阶状的光晕（像素画里的灯光），lighter 叠上去 */
function glowSpr(r, c, steps = 4, pow = 1.6) {
  r = Math.max(1, ri(r));
  return cached(`glow:${r}:${c}:${steps}:${pow}`, 2 * r + 1, 2 * r + 1, g => {
    const A = rgb(c);
    for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      const d = Math.sqrt(x * x + y * y) / r; if (d >= 1) continue;
      const v = Math.ceil(Math.pow(1 - d, pow) * steps) / steps;
      g.fillStyle = `rgba(${A[0]},${A[1]},${A[2]},${v.toFixed(3)})`; g.fillRect(x + r, y + r, 1, 1);
    }
  });
}
function glow(g, x, y, r, c, a = 1, steps = 4) {
  if (a <= 0 || r < 1) return;
  if (r > 14) steps = Math.max(steps, Math.min(10, ri(r / 4)));   // 大光晕台阶多一点，不像一个个圆盘
  const s = glowSpr(r, c, steps); g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = clamp(a);
  g.drawImage(s, ri(x) - ri(r), ri(y) - ri(r)); g.restore();
}
/* 柔光（不分台阶），做大片的光晕、光束底 */
function sglow(g, x, y, r, c, a = 1, op = 'lighter') {
  if (a <= 0 || r < 1) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, rgba(c, a)); gr.addColorStop(1, rgba(c, 0));
  g.save(); g.globalCompositeOperation = op; g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); g.restore();
}

/* ---------------- 精灵 ---------------- */
/* 字符画转精灵：rows 每行一个字符串，pal 字符 → 颜色（'.' 和没定义的是透明） */
function spr(rows, pal, key) {
  return cached('S:' + (key || rows.join('/') + JSON.stringify(pal)), rows.reduce((m, r) => Math.max(m, r.length), 0), rows.length, g => {
    rows.forEach((row, y) => { for (let x = 0; x < row.length; x++) { const c = pal[row[x]]; if (c) R(g, x, y, 1, 1, c); } });
  });
}
function blit(g, s, x, y, o = {}) {
  if (!s) return; const a = o.a ?? 1; if (a <= 0) return;
  g.save(); if (a < 1) g.globalAlpha *= a; if (o.op) g.globalCompositeOperation = o.op;
  if (o.flip) { g.translate(ri(x) + s.width * (o.k || 1), ri(y)); g.scale(-1, 1); g.drawImage(s, 0, 0, s.width * (o.k || 1), s.height * (o.k || 1)); }
  else g.drawImage(s, ri(x), ri(y), s.width * (o.k || 1), s.height * (o.k || 1));
  g.restore();
}
/* 精灵整个换成一种颜色（剪影、影子、倒影） */
function tint(s, c) {
  const key = 'T:' + c; s._t = s._t || {}; if (s._t[key]) return s._t[key];
  const t = mk(s.width, s.height), q = t.getContext('2d'); q.drawImage(s, 0, 0); q.globalCompositeOperation = 'source-in'; q.fillStyle = c; q.fillRect(0, 0, s.width, s.height);
  return (s._t[key] = t);
}
/* 描边：精灵外面一圈 1 像素（outline 色），返回新精灵（宽高各 +2） */
function outlined(s, c) {
  const key = 'O:' + c; s._t = s._t || {}; if (s._t[key]) return s._t[key];
  const t = mk(s.width + 2, s.height + 2), q = t.getContext('2d'), sil = tint(s, c);
  [[0, 1], [2, 1], [1, 0], [1, 2]].forEach(([dx, dy]) => q.drawImage(sil, dx, dy)); q.drawImage(s, 1, 1);
  return (s._t[key] = t);
}

/* ---------------- 像素字：缝合像素 12px（中文）+ 3×5 小字（数字、字母） ---------------- */
const FONT = '12px FusionPixel';
const GLY = {};
let GLYOFF = null;                                        // 字形在 12px 格子里的竖直偏移（用"国""了"量出来）
function glyphRaw(chr) {
  const c = mk(16, 24), q = c.getContext('2d'); q.font = FONT; q.textBaseline = 'alphabetic'; q.fillStyle = '#FFFFFF'; q.fillText(chr, 0, 16);
  return { d: q.getImageData(0, 0, 16, 24).data, w: Math.max(1, ri(q.measureText(chr).width)) };
}
function glyph(chr) {
  let gl = GLY[chr]; if (gl) return gl;
  if (GLYOFF === null) {
    let y0 = 99, y1 = -1;
    ['国', '了', '爱', '口', 'g', 'y', 'H'].forEach(ch2 => { const r = glyphRaw(ch2); for (let y = 0; y < 24; y++) for (let x = 0; x < 16; x++) if (r.d[(y * 16 + x) * 4 + 3] > 110) { y0 = Math.min(y0, y); y1 = Math.max(y1, y); } });
    GLYOFF = Math.max(0, y1 - 11);                         // 让最低的笔画落在第 12 行
  }
  const r = glyphRaw(chr), w = r.w, o = mk(w, 12), oq = o.getContext('2d'); oq.fillStyle = '#FFFFFF';
  const bits = [];
  for (let y = 0; y < 12; y++) for (let x = 0; x < w; x++) { const on = r.d[((y + GLYOFF) * 16 + x) * 4 + 3] > 110; if (on) oq.fillRect(x, y, 1, 1); bits.push(on ? 1 : 0); }
  return (GLY[chr] = { c: o, w, bits });
}
const textW = s => [...s].reduce((m, chr) => m + glyph(chr).w, 0);
/* o：align 'c' | 'r'，k 整数倍放大，ol 描边色，sh 影子色（往右下错 k），a 透明度，sp 字距 */
function txt(g, str, x, y, c, o = {}) {
  const k = o.k || 1, a = o.a ?? 1, sp = o.sp || 0; if (a <= 0) return;
  const chars = [...str], w = (textW(str) + sp * (chars.length - 1)) * k;
  let x0 = o.align === 'c' ? x - w / 2 : o.align === 'r' ? x - w : x; x0 = ri(x0); y = ri(y);
  g.save(); g.globalAlpha *= a;
  const pass = (col, dx, dy) => { let xx = x0; chars.forEach(chr => { const gl = glyph(chr); g.drawImage(tint(gl.c, col), xx + dx, y + dy, gl.w * k, 12 * k); xx += (gl.w + sp) * k; }); };
  if (o.sh) pass(o.sh, k, k);
  if (o.ol) [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([dx, dy]) => pass(o.ol, dx * k, dy * k));
  pass(c, 0, 0);
  g.restore(); return w;
}
/* Scale2x（EPX）把像素字放大一倍，斜边不长锯齿：做大标题 */
function epx(bits, w, h) {
  const o = new Array(w * h * 4).fill(0), at = (x, y) => (x < 0 || y < 0 || x >= w || y >= h) ? 0 : bits[y * w + x];
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const p = at(x, y), A = at(x, y - 1), B = at(x + 1, y), C = at(x - 1, y), D = at(x, y + 1);
    let e0 = p, e1 = p, e2 = p, e3 = p;
    if (C === A && C !== D && A !== B) e0 = A; if (A === B && A !== C && B !== D) e1 = B;
    if (D === C && D !== B && C !== A) e2 = C; if (B === D && B !== A && D !== C) e3 = D;
    const W2 = w * 2; o[(2 * y) * W2 + 2 * x] = e0; o[(2 * y) * W2 + 2 * x + 1] = e1; o[(2 * y + 1) * W2 + 2 * x] = e2; o[(2 * y + 1) * W2 + 2 * x + 1] = e3;
  }
  return o;
}
/* 大字：n 次 Scale2x（1 → 24px，2 → 48px），返回白色精灵 */
function bigGlyph(chr, n = 1) {
  return CACHE.get('BG:' + chr + n) || (() => {
    const gl = glyph(chr); let bits = gl.bits, w = gl.w, h = 12;
    for (let i = 0; i < n; i++) { bits = epx(bits, w, h); w *= 2; h *= 2; }
    const c = mk(w, h), q = c.getContext('2d'); q.fillStyle = '#FFFFFF';
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (bits[y * w + x]) q.fillRect(x, y, 1, 1);
    c._bits = bits; CACHE.set('BG:' + chr + n, c); return c;
  })();
}
/* 3×5 小字：数字和大写字母（招牌、日期戳、站牌） */
const TINY = {
  '0': '111101101101111', '1': '010110010010111', '2': '111001111100111', '3': '111001111001111', '4': '101101111001001',
  '5': '111100111001111', '6': '111100111101111', '7': '111001010010010', '8': '111101111101111', '9': '111101111001111',
  'A': '010101111101101', 'B': '110101110101110', 'C': '011100100100011', 'D': '110101101101110', 'E': '111100110100111',
  'F': '111100110100100', 'G': '011100101101011', 'H': '101101111101101', 'I': '111010010010111', 'J': '001001001101010',
  'K': '101101110101101', 'L': '100100100100111', 'M': '101111111101101', 'N': '110101101101101', 'O': '010101101101010',
  'P': '110101110100100', 'Q': '010101101110011', 'R': '110101110101101', 'S': '011100010001110', 'T': '111010010010010',
  'U': '101101101101111', 'V': '101101101101010', 'W': '101101111111101', 'X': '101101010101101', 'Y': '101101010010010',
  'Z': '111001010100111', ':': '000010000010000', '.': '000000000000010', "'": '010010000000000', '-': '000000111000000',
  '/': '001001010100100', '!': '010010010000010', '+': '000010111010000', '%': '101001010100101', ' ': '000000000000000',
  '♥': '000101111111010', '>': '100010001010100', '<': '001010100010001', '?': '111001010000010', '#': '101111101111101',
};
function tinyW(s) { return s.length * 4 - 1; }
function tiny(g, s, x, y, c, o = {}) {
  const k = o.k || 1; let x0 = o.align === 'c' ? x - tinyW(s) * k / 2 : o.align === 'r' ? x - tinyW(s) * k : x; x0 = ri(x0); y = ri(y);
  g.fillStyle = c;
  for (const chr of s.toUpperCase()) {
    const m = TINY[chr]; if (m) for (let i = 0; i < 15; i++) if (m[i] === '1') g.fillRect(x0 + (i % 3) * k, y + fl(i / 3) * k, k, k);
    x0 += 4 * k;
  }
}
function fontsReady(text) { return document.fonts.load(FONT, text).then(() => { [...new Set(text)].forEach(glyph); }); }
