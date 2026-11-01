'use strict';
/* MV《最美的伤口》—— 像素风横屏 MV（1920×1080，30fps）。frame(t) 只按时间 t（秒）画出一帧，可以并行渲染、单帧预览。
   core.js：时间轴、工具函数、像素缓冲、像素图元、像素字（1 位、不糊边）、雨、光晕。 */
const W = 1920, H = 1080, FPS = 30;
const TM = window.TIMING, DUR = TM.duration, BEAT = TM.beat, BARLEN = TM.bar;
const bar = k => TM.bar1 + (k - 1) * BARLEN;     // 第 k 小节的强拍（第 1 小节 = 人声开口）
const LY = TM.lines;                               // 9 句歌词，每个字的 t0（开口）
const ch = (li, ci) => LY[li].chars[ci].t0;        // 第 li 句第 ci 个字开口的时刻

const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/* ---------------- 工具 ---------------- */
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ri = Math.round;
const E = {
  io: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
  out: u => 1 - Math.pow(1 - u, 3),
  in: u => u * u * u,
  sine: u => -(Math.cos(Math.PI * u) - 1) / 2,
  back: u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
};
function R(seed) { let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(a, b = 0, c = 0) { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
/* 两个颜色按 u 混合（#rrggbb） */
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function rgb2hex(r, g, b) { return '#' + [r, g, b].map(v => clamp(ri(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, u) { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(lerp(A[0], B[0], u), lerp(A[1], B[1], u), lerp(A[2], B[2], u)); }
function shade(hex, k) { const [r, g, b] = hex2rgb(hex); return k < 1 ? rgb2hex(r * k, g * k, b * k) : rgb2hex(r + (255 - r) * (k - 1), g + (255 - g) * (k - 1), b + (255 - b) * (k - 1)); }
function rgba(hex, a) { const [r, g, b] = hex2rgb(hex); return `rgba(${r},${g},${b},${a})`; }

/* ---------------- 像素缓冲：世界按"像素"画在小画布上，再最近邻放大 P 倍 ---------------- */
const BUF = {};
function pbuf(name, w, h) {
  let b = BUF[name];
  if (!b || b.width !== w || b.height !== h) b = BUF[name] = mk(w, h);
  const g = b.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.imageSmoothingEnabled = false; g.filter = 'none'; g.clearRect(0, 0, w, h);
  return g;
}
/* 把缓冲贴到屏幕：每个缓冲像素放大成 P 个屏幕像素。camX/camY 是视野左上角（缓冲坐标，可以带小数：按屏幕像素平滑移动） */
function blit(g, name, P, camX = 0, camY = 0) {
  const b = BUF[name]; g.save(); g.imageSmoothingEnabled = false;
  g.drawImage(b, ri(-camX * P), ri(-camY * P), b.width * P, b.height * P);
  g.restore();
}
/* 静态的东西只画一次 */
const CACHE = {};
function cached(name, w, h, fn) { if (!CACHE[name]) { const c = mk(w, h), g = c.getContext('2d'); g.imageSmoothingEnabled = false; fn(g, c); CACHE[name] = c; } return CACHE[name]; }

/* ---------------- 像素图元（坐标取整，落在像素格上） ---------------- */
function prect(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(ri(x), ri(y), ri(w), ri(h)); }
function pdot(g, x, y, c) { g.fillStyle = c; g.fillRect(ri(x), ri(y), 1, 1); }
function pdisc(g, cx, cy, r, c) {
  g.fillStyle = c; cx = ri(cx); cy = ri(cy); r = Math.max(0, r);
  for (let dy = -Math.floor(r); dy <= Math.floor(r); dy++) { const dx = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy)) + .35); g.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1); }
}
function pell(g, cx, cy, rx, ry, c) {
  g.fillStyle = c; cx = ri(cx); cy = ri(cy); ry = Math.max(1, ry);
  for (let dy = -Math.floor(ry); dy <= Math.floor(ry); dy++) { const dx = Math.floor(rx * Math.sqrt(Math.max(0, 1 - dy * dy / (ry * ry))) + .35); g.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1); }
}
/* 空心椭圆（水波） */
function pring(g, cx, cy, rx, ry, c) {
  g.fillStyle = c; const n = Math.max(12, ri((rx + ry) * 3));
  let px = null, py = null;
  for (let i = 0; i <= n; i++) { const a = i / n * TAU, x = ri(cx + Math.cos(a) * rx), y = ri(cy + Math.sin(a) * ry); if (x !== px || y !== py) g.fillRect(x, y, 1, 1); px = x; py = y; }
}
function pline(g, x0, y0, x1, y1, c) {
  x0 = ri(x0); y0 = ri(y0); x1 = ri(x1); y1 = ri(y1); g.fillStyle = c;
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, i = 0;
  for (; ;) {
    g.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; }
    if (++i > 4000) break;
  }
}
/* 4×4 Bayer 抖动：level 0..1 */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function pdither(g, x, y, w, h, c, level) {
  if (level <= 0) return;
  g.fillStyle = c; x = ri(x); y = ri(y); w = ri(w); h = ri(h);
  if (level >= 1) { g.fillRect(x, y, w, h); return; }
  const th = level * 16;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (BAYER[((y + j) & 3) * 4 + ((x + i) & 3)] < th) g.fillRect(x + i, y + j, 1, 1);
}
/* 平滑的竖直渐变天空（再按 16 级色阶量化，保持像素感） */
function psky(g, w, h, stops) {
  for (let y = 0; y < h; y++) {
    const u = y / Math.max(1, h - 1);
    let i = 0; while (i < stops.length - 2 && u > stops[i + 1][0]) i++;
    const [u0, c0] = stops[i], [u1, c1] = stops[i + 1];
    const v = clamp((u - u0) / Math.max(1e-6, u1 - u0));
    const q = Math.floor(v * 8) / 8, fr = v * 8 - Math.floor(v * 8);
    const ca = mix(c0, c1, q), cb = mix(c0, c1, Math.min(1, q + 1 / 8));
    prect(g, 0, y, w, 1, ca);
    if (fr > .2) pdither(g, 0, y, w, 1, cb, fr);
  }
}
/* 柔和的光锥（不用抖动，免得一片网点）：从 (cx, y0) 宽 w0 到 y1 宽 w1，一行一行画，透明度按 1/24 量化成色阶 */
function pcone(g, cx, y0, y1, w0, w1, col, a0, a1) {
  const [r, gg, b] = hex2rgb(col);
  g.save(); g.globalCompositeOperation = 'screen';           // 按"光"叠上去：暗处变亮、带上灯的颜色，不会发灰
  for (let y = ri(y0); y < ri(y1); y++) {
    const u = (y - y0) / Math.max(1, y1 - y0), hw = lerp(w0, w1, u) / 2, a = Math.round(lerp(a0, a1, u) * 24) / 24;
    if (a <= 0) continue;
    g.fillStyle = `rgba(${r},${gg},${b},${a})`; g.fillRect(ri(cx - hw), y, ri(hw * 2), 1);
  }
  g.restore();
}
/* 精灵：整数坐标贴图，k 倍、可水平翻转 */
function pspr(g, spr, x, y, k = 1, flip = false) {
  if (!spr) return;
  x = ri(x); y = ri(y);
  if (!flip) { g.drawImage(spr, x, y, spr.width * k, spr.height * k); return; }
  g.save(); g.translate(x + spr.width * k, y); g.scale(-1, 1); g.drawImage(spr, 0, 0, spr.width * k, spr.height * k); g.restore();
}
/* 精灵按颜色相乘（夜里偏蓝、霓虹下偏紫），结果缓存 */
const TINT = new Map();
function tinted(spr, col, key) {
  if (!col) return spr;
  const k = key + '|' + col;
  if (TINT.has(k)) return TINT.get(k);
  const c = mk(spr.width, spr.height), g = c.getContext('2d');
  g.drawImage(spr, 0, 0); g.globalCompositeOperation = 'multiply'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height);
  g.globalCompositeOperation = 'destination-in'; g.drawImage(spr, 0, 0);
  TINT.set(k, c); return c;
}
/* ---------------- 光晕：亮的东西另画一层，低分辨率模糊后叠回去（screen） ---------------- */
/* glow(名字, w, h) 拿到一块和场景缓冲一样大的光层；画完调 glowBlit 叠到屏幕 */
function glowBuf(name, w, h) { return pbuf('glow_' + name, w, h); }
function glowBlit(g, name, P, camX = 0, camY = 0, amt = 1, rad = 3) {
  const b = BUF['glow_' + name]; if (!b) return;
  const t = pbuf('glowtmp_' + name, b.width, b.height);
  t.filter = `blur(${rad}px)`; t.drawImage(b, 0, 0); t.filter = 'none';
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = amt; g.imageSmoothingEnabled = true;
  g.drawImage(BUF['glowtmp_' + name], ri(-camX * P), ri(-camY * P), b.width * P, b.height * P);
  // 再叠一层更大更淡的
  t.clearRect(0, 0, b.width, b.height); t.filter = `blur(${rad * 3}px)`; t.drawImage(b, 0, 0); t.filter = 'none';
  g.globalAlpha = amt * .6;
  g.drawImage(BUF['glowtmp_' + name], ri(-camX * P), ri(-camY * P), b.width * P, b.height * P);
  g.restore();
}

/* ---------------- 雨：斜着落的像素雨丝 + 地上溅起的水花 ---------------- */
/* o: {n 数量, v 速度（像素/秒）, len 长度, slant 每下落 1 像素横移多少, col 颜色, ground 地面 y（溅水花）, seed} */
function rain(g, t, w, h, o = {}) {
  const n = o.n || 120, v = o.v || 260, len = o.len || 6, sl = o.slant ?? .25, col = o.col || 'rgba(150,175,235,.55)', seed = o.seed || 1;
  g.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const sp = v * (.8 + .4 * hash(i, seed, 1)), L = Math.max(2, ri(len * (.7 + .6 * hash(i, seed, 2))));
    const span = (o.ground ?? h) + L + 20;
    const y = ((t * sp + hash(i, seed, 3) * span) % span) - 10;          // 雨丝的头
    const x = hash(i, seed, 4) * (w + 60) - 30 + (y - h / 2) * sl;
    for (let k = 0; k < L; k++) { const yy = ri(y - k), xx = ri(x - k * sl); if (yy >= 0 && yy < (o.ground ?? h)) g.fillRect(xx, yy, 1, 1); }
  }
  if (o.ground != null) {   // 水花：每个雨点落地的那一下，在地面一带随机处溅开 2 帧
    const sc = o.splashCol || 'rgba(190,210,255,.6)'; g.fillStyle = sc;
    const m = o.splashes || 26;
    for (let i = 0; i < m; i++) {
      const per = .35 + .3 * hash(i, seed, 5), ph = hash(i, seed, 6) * per, k = Math.floor((t + ph) / per), u = ((t + ph) % per) / per;
      if (u > .22) continue;
      const x = ri(hash(i, k, seed) * w), y = ri(o.ground + (o.groundDepth || 0) * hash(i, k, seed + 7));
      const r = u < .11 ? 1 : 2;
      g.fillRect(x - r, y - 1, 1, 1); g.fillRect(x + r, y - 1, 1, 1); if (r === 1) g.fillRect(x, y - 2, 1, 1);
    }
  }
}

/* ---------------- 像素字：12px 像素字体先画到小画布，按 alpha 二值化（不糊边），再整数倍放大 ---------------- */
const GLYPH = new Map();
const FONT = '12px "Pix", "WenQuanYi Zen Hei", sans-serif';
const _mg = mk(8, 8).getContext('2d');
function textW12(s) { _mg.font = FONT; return Math.ceil(_mg.measureText(s).width); }
/* 返回一块 1 位的文字画布（高 16，基线固定），颜色 col；ol 给描边色时外圈加 1 像素描边 */
function glyphs(s, col, ol = null) {
  const key = s + '|' + col + '|' + ol;
  if (GLYPH.has(key)) return GLYPH.get(key);
  const w = textW12(s) + 4, h = 17;
  const c = mk(w, h), g = c.getContext('2d');
  g.font = FONT; g.textBaseline = 'top'; g.fillStyle = '#fff'; g.fillText(s, 2, 2);
  const id = g.getImageData(0, 0, w, h), d = id.data, on = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) on[i] = d[i * 4 + 3] > 110 ? 1 : 0;
  const out = g.createImageData(w, h), od = out.data;
  const [r, gg, b] = hex2rgb(col), O = ol ? hex2rgb(ol) : null;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = y * w + x;
    if (on[i]) { od[i * 4] = r; od[i * 4 + 1] = gg; od[i * 4 + 2] = b; od[i * 4 + 3] = 255; }
    else if (O) {
      let near = false;
      for (let dy = -1; dy <= 1 && !near; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < w && yy < h && on[yy * w + xx]) { near = true; break; } }
      if (near) { od[i * 4] = O[0]; od[i * 4 + 1] = O[1]; od[i * 4 + 2] = O[2]; od[i * 4 + 3] = 255; }
    }
  }
  g.clearRect(0, 0, w, h); g.putImageData(out, 0, 0);
  const res = { c, w, h, tw: w - 4 };
  GLYPH.set(key, res); return res;
}
/* 画像素字：(x, y) 是文字左上角（align='center' 时 x 是中线），k 倍放大；y 对应字形顶部 */
function ptext(g, s, x, y, k, col, o = {}) {
  const G = glyphs(s, col, o.ol || null);
  const tw = G.tw * k;
  let x0 = o.align === 'center' ? x - tw / 2 : o.align === 'right' ? x - tw : x;
  x0 = ri(x0 / k) * k; const y0 = ri(y / k) * k;
  g.save(); g.imageSmoothingEnabled = false; if (o.alpha != null) g.globalAlpha *= o.alpha;
  if (o.shadow) { const S = glyphs(s, o.shadow, o.ol ? o.shadow : null); g.drawImage(S.c, x0 - k, y0 - k, S.w * k, S.h * k); }   // 往右下错开 1 像素的影子
  g.drawImage(G.c, x0 - 2 * k, y0 - 2 * k, G.w * k, G.h * k);
  g.restore();
  return tw;
}

/* ---------------- 字体就绪 ---------------- */
async function fontsReady(sample) {
  await document.fonts.load(FONT, sample);
  await document.fonts.ready;
}
