'use strict';
/* 《红豆》MV（像素版）—— 横屏 1920×1080，30fps。frame(t) 只按时间 t（秒，= 歌曲时间）画出一帧，可以并行渲染、单帧预览。
   core.js：时间（节拍、歌词）、工具函数、像素缓冲、像素图元、像素字（1 位、不糊边）、光晕、雨、雪。
   每个镜头把世界按"像素"画在一块小画布上（160×90 ~ 480×270），再最近邻放大 12 ~ 4 倍铺满屏幕：景别越近，像素越大。 */
const W = 1920, H = 1080, FPS = 30;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/* 镜头表：a = 开始时刻（秒）。draw(g, s, k)：s 歌曲时间，k = s - a。各个 scenesN.js 往 SCENES_DEF 里加，main.js 排序 */
const SCENES = [], SCENES_DEF = [];
function scene(id, a, draw, o = {}) { SCENES.push({ id, a, draw, ...o }); }

/* ---------------- 时间：歌词（lyrics.js）和节拍（timing.js） ---------------- */
const Lt = k => LYRICS[k].chars[0][1];                                         // 第 k 句（从 0 数）第一个字开口
const Lc = (k, i) => LYRICS[k].chars[Math.min(i, LYRICS[k].chars.length - 1)][1];   // 第 k 句第 i 个字开口
const Le = k => LYRICS[k].chars[LYRICS[k].chars.length - 1][2];                // 第 k 句最后一个字唱完
const CUT = k => Lt(k) - .3;                                                   // 镜头一般在这句开口前 0.3 秒切进来
const beatIdx = s => (s - BEAT0) / BEAT;
const AL = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const dec = s => Float32Array.from(s, ch => AL.indexOf(ch) / 61);
const VOC = dec(VOC_S), ACC = dec(ACC_S);
function envAt(arr, s) { const f = s * ENV_FPS; const i = Math.floor(f); if (i < 0 || i >= arr.length - 1) return 0; return arr[i] + (arr[i + 1] - arr[i]) * (f - i); }
const voc = s => envAt(VOC, s), acc = s => envAt(ACC, s);

/* ---------------- 工具 ---------------- */
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ri = Math.round;
const E = {
  io: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
  io2: u => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2,
  out: u => 1 - Math.pow(1 - u, 3),
  out2: u => 1 - (1 - u) * (1 - u),
  in: u => u * u * u,
  in2: u => u * u,
  sine: u => -(Math.cos(Math.PI * u) - 1) / 2,
  back: u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
};
function R(seed) { let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(a, b = 0, c = 0) { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i, seed) * 2 - 1, hash(i + 1, seed) * 2 - 1, u); }
/* 颜色（#rrggbb） */
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function rgb2hex(r, g, b) { return '#' + [r, g, b].map(v => clamp(ri(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, u) { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(lerp(A[0], B[0], u), lerp(A[1], B[1], u), lerp(A[2], B[2], u)); }
function shade(hex, k) { const [r, g, b] = hex2rgb(hex); return k < 1 ? rgb2hex(r * k, g * k, b * k) : rgb2hex(r + (255 - r) * (k - 1), g + (255 - g) * (k - 1), b + (255 - b) * (k - 1)); }
function rgba(hex, a) { const [r, g, b] = hex2rgb(hex); return `rgba(${r},${g},${b},${a})`; }
/* 多段取色：stops = [[位置, 颜色], ...] */
function ramp(stops, u) {
  u = clamp(u);
  for (let i = 1; i < stops.length; i++) if (u <= stops[i][0]) return mix(stops[i - 1][1], stops[i][1], (u - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0] || 1));
  return stops[stops.length - 1][1];
}
/* 一串点按 3 秒一个"新东西"的节奏轮流出现：k 镜头内时间 */
const step = (k, period) => Math.floor(k / period);

/* ---------------- 像素缓冲 ---------------- */
const BUF = {};
function pbuf(name, w, h) {
  let b = BUF[name];
  if (!b || b.width !== w || b.height !== h) b = BUF[name] = mk(w, h);
  const g = b.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.imageSmoothingEnabled = false; g.filter = 'none'; g.clearRect(0, 0, w, h);
  return g;
}
/* 把缓冲贴到屏幕：每个缓冲像素放大成 P 个屏幕像素；camX/camY 是视野左上角（缓冲坐标，可带小数） */
function blit(g, name, P, camX = 0, camY = 0) {
  const b = BUF[name]; g.save(); g.imageSmoothingEnabled = false;
  g.drawImage(b, ri(-camX * P), ri(-camY * P), b.width * P, b.height * P);
  g.restore();
}
/* 镜头推拉：把缓冲按 zoom 倍、以 (cx, cy)（缓冲坐标）为中心贴满屏幕；P 是 zoom=1 时的倍数。只按整屏幕像素取整，像素块会跟着变大 */
function blitZoom(g, name, P, zoom, cx, cy) {
  const b = BUF[name], s = P * zoom;
  g.save(); g.imageSmoothingEnabled = false;
  g.drawImage(b, ri(W / 2 - cx * s), ri(H / 2 - cy * s), ri(b.width * s), ri(b.height * s));
  g.restore();
}
const CACHE = {};
function cached(name, w, h, fn) { if (!CACHE[name]) { const c = mk(w, h), g = c.getContext('2d'); g.imageSmoothingEnabled = false; fn(g, c); CACHE[name] = c; } return CACHE[name]; }

/* ---------------- 像素图元 ---------------- */
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
    if (++i > 6000) break;
  }
}
/* 过几个点的折线（红线、风筝线），每段用 pline */
function ppath(g, pts, c) { for (let i = 1; i < pts.length; i++) pline(g, pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], c); }
/* 二次贝塞尔折成像素线（下垂的线） */
function pcurve(g, x0, y0, cx, cy, x1, y1, c, n = 24) {
  let px = x0, py = y0;
  for (let i = 1; i <= n; i++) { const u = i / n, x = (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * cx + u * u * x1, y = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * cy + u * u * y1; pline(g, px, py, x, y, c); px = x; py = y; }
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function pdither(g, x, y, w, h, c, level) {
  if (level <= 0) return;
  g.fillStyle = c; x = ri(x); y = ri(y); w = ri(w); h = ri(h);
  if (level >= 1) { g.fillRect(x, y, w, h); return; }
  const th = level * 16;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (BAYER[((y + j) & 3) * 4 + ((x + i) & 3)] < th) g.fillRect(x + i, y + j, 1, 1);
}
/* 竖直渐变的天空：按 8 级色阶量化，交界处用抖动过渡（像素感） */
function psky(g, w, h, stops, y0 = 0) {
  for (let y = 0; y < h; y++) {
    const u = y / Math.max(1, h - 1);
    let i = 0; while (i < stops.length - 2 && u > stops[i + 1][0]) i++;
    const [u0, c0] = stops[i], [u1, c1] = stops[i + 1];
    const v = clamp((u - u0) / Math.max(1e-6, u1 - u0));
    const q = Math.floor(v * 8) / 8, fr = v * 8 - Math.floor(v * 8);
    const ca = mix(c0, c1, q), cb = mix(c0, c1, Math.min(1, q + 1 / 8));
    prect(g, 0, y0 + y, w, 1, ca);
    if (fr > .2) pdither(g, 0, y0 + y, w, 1, cb, fr);
  }
}
/* 柔和的光锥（按行量化透明度，用 screen 叠） */
function pcone(g, cx, y0, y1, w0, w1, col, a0, a1) {
  const [r, gg, b] = hex2rgb(col);
  g.save(); g.globalCompositeOperation = 'screen';
  for (let y = ri(y0); y < ri(y1); y++) {
    const u = (y - y0) / Math.max(1, y1 - y0), hw = lerp(w0, w1, u) / 2, a = Math.round(lerp(a0, a1, u) * 24) / 24;
    if (a <= 0) continue;
    g.fillStyle = `rgba(${r},${gg},${b},${a})`; g.fillRect(ri(cx - hw), y, ri(hw * 2), 1);
  }
  g.restore();
}
/* 斜的光柱（窗户照进来的光）：平行四边形，一行一行画 */
function pbeam(g, x0, x1, y0, y1, slant, col, a) {
  const [r, gg, b] = hex2rgb(col);
  g.save(); g.globalCompositeOperation = 'screen';
  for (let y = ri(y0); y < ri(y1); y++) { const u = (y - y0) / Math.max(1, y1 - y0), aa = Math.round(a * (1 - u * .6) * 24) / 24; g.fillStyle = `rgba(${r},${gg},${b},${aa})`; const off = (y - y0) * slant; g.fillRect(ri(x0 + off), y, ri(x1 - x0), 1); }
  g.restore();
}
function pspr(g, spr, x, y, k = 1, flip = false) {
  if (!spr) return;
  x = ri(x); y = ri(y);
  if (!flip) { g.drawImage(spr, x, y, spr.width * k, spr.height * k); return; }
  g.save(); g.translate(x + spr.width * k, y); g.scale(-1, 1); g.drawImage(spr, 0, 0, spr.width * k, spr.height * k); g.restore();
}
/* 精灵按颜色相乘（夜里偏蓝、黄昏偏橙），结果缓存 */
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
/* 整个精灵填成一个颜色（剪影） */
function silhouette(spr, col, key) {
  const k = 'sil|' + key + '|' + col;
  if (TINT.has(k)) return TINT.get(k);
  const c = mk(spr.width, spr.height), g = c.getContext('2d');
  g.drawImage(spr, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height);
  TINT.set(k, c); return c;
}

/* ---------------- 光晕：亮的东西另画一层，模糊后 screen 叠回去 ---------------- */
function glowBuf(name, w, h) { return pbuf('glow_' + name, w, h); }
function glowBlit(g, name, P, camX = 0, camY = 0, amt = 1, rad = 3) {
  const b = BUF['glow_' + name]; if (!b) return;
  const t = pbuf('glowtmp_' + name, b.width, b.height);
  t.filter = `blur(${rad}px)`; t.drawImage(b, 0, 0); t.filter = 'none';
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = amt; g.imageSmoothingEnabled = true;
  g.drawImage(BUF['glowtmp_' + name], ri(-camX * P), ri(-camY * P), b.width * P, b.height * P);
  t.clearRect(0, 0, b.width, b.height); t.filter = `blur(${rad * 3}px)`; t.drawImage(b, 0, 0); t.filter = 'none';
  g.globalAlpha = amt * .6;
  g.drawImage(BUF['glowtmp_' + name], ri(-camX * P), ri(-camY * P), b.width * P, b.height * P);
  g.restore();
}
/* 推拉镜头时的光晕（和 blitZoom 对齐） */
function glowBlitZoom(g, name, P, zoom, cx, cy, amt = 1, rad = 3) {
  const b = BUF['glow_' + name]; if (!b) return;
  const t = pbuf('glowtmp_' + name, b.width, b.height), s = P * zoom;
  t.filter = `blur(${rad}px)`; t.drawImage(b, 0, 0); t.filter = 'none';
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = amt; g.imageSmoothingEnabled = true;
  g.drawImage(BUF['glowtmp_' + name], ri(W / 2 - cx * s), ri(H / 2 - cy * s), ri(b.width * s), ri(b.height * s));
  g.restore();
}

/* ---------------- 天气：雨、雪（开花的雪） ---------------- */
function rain(g, t, w, h, o = {}) {
  const n = o.n || 120, v = o.v || 260, len = o.len || 6, sl = o.slant ?? .25, col = o.col || 'rgba(150,175,235,.55)', seed = o.seed || 1;
  g.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const sp = v * (.8 + .4 * hash(i, seed, 1)), L = Math.max(2, ri(len * (.7 + .6 * hash(i, seed, 2))));
    const span = (o.ground ?? h) + L + 20;
    const y = ((t * sp + hash(i, seed, 3) * span) % span) - 10;
    const x = hash(i, seed, 4) * (w + 60) - 30 + (y - h / 2) * sl;
    for (let k = 0; k < L; k++) { const yy = ri(y - k), xx = ri(x - k * sl); if (yy >= 0 && yy < (o.ground ?? h)) g.fillRect(xx, yy, 1, 1); }
  }
}
/* 雪：一片一片往下飘；bloom 0..1 时落到一定高度"开花"（十字 + 四角的小花瓣，中间一点粉） */
function psnow(g, t, w, h, o = {}) {
  const n = o.n || 60, seed = o.seed || 7, v = o.v || 14, col = o.col || '#F4F7FF';
  for (let i = 0; i < n; i++) {
    const sp = v * (.6 + .8 * hash(i, seed, 1)), big = hash(i, seed, 2) < (o.bigRate ?? .25);
    const y = ((t * sp + hash(i, seed, 3) * (h + 20)) % (h + 20)) - 10;
    const x = ((hash(i, seed, 4) * (w + 20) + Math.sin(t * .8 + i) * 4 + (o.drift || 0) * t) % (w + 20) + w + 20) % (w + 20) - 10;
    const bl = o.bloom ? clamp((y / h - .2 - hash(i, seed, 5) * .3) * 3) * o.bloom : 0;
    if (big && bl > .5) {   // 开成一朵小花
      const X = ri(x), Y = ri(y);
      pdot(g, X, Y - 1, col); pdot(g, X - 1, Y, col); pdot(g, X + 1, Y, col); pdot(g, X, Y + 1, col);
      pdot(g, X - 1, Y - 1, rgba('#FFFFFF', .6)); pdot(g, X + 1, Y - 1, rgba('#FFFFFF', .6)); pdot(g, X - 1, Y + 1, rgba('#FFFFFF', .6)); pdot(g, X + 1, Y + 1, rgba('#FFFFFF', .6));
      pdot(g, X, Y, '#FFB6C8');
    } else if (big) { prect(g, x, y, 2, 2, col); }
    else pdot(g, x, y, rgba(col, .85));
  }
}
/* 一片片飘落的东西（花瓣、落叶、红豆）：fn(g, x, y, i) 自己画 */
function drift(t, w, h, o, fn) {
  const n = o.n || 20, seed = o.seed || 3, v = o.v || 12, vx = o.vx || 0;
  for (let i = 0; i < n; i++) {
    const sp = v * (.6 + .8 * hash(i, seed, 1));
    const y = ((t * sp + hash(i, seed, 3) * (h + 20)) % (h + 20)) - 10;
    const x = ((hash(i, seed, 4) * (w + 40) + Math.sin(t * 1.3 + i) * 5 + vx * t * (.6 + .6 * hash(i, seed, 6))) % (w + 40) + w + 40) % (w + 40) - 20;
    fn(ri(x), ri(y), i);
  }
}
/* 星星：固定的点，几颗亮的会闪 */
function pstars(g, t, w, h, seed = 5, n = 120, a = 1) {
  const r = R(seed);
  for (let i = 0; i < n; i++) {
    const x = ri(r() * w), y = ri(r() * h), b = r(), tw = .5 + .5 * Math.sin(t * (1 + b * 2) + i);
    if (b > .93) { const c = rgba('#FFF6E0', a * (.6 + .4 * tw)); pdot(g, x, y, c); pdot(g, x - 1, y, rgba('#FFF6E0', a * .4 * tw)); pdot(g, x + 1, y, rgba('#FFF6E0', a * .4 * tw)); pdot(g, x, y - 1, rgba('#FFF6E0', a * .4 * tw)); pdot(g, x, y + 1, rgba('#FFF6E0', a * .4 * tw)); }
    else pdot(g, x, y, rgba(b > .6 ? '#DDE6FF' : '#9FA8D8', a * (.35 + .5 * b) * (.7 + .3 * tw)));
  }
}
/* 月亮：像素圆 + 几个坑 */
function pmoon(g, gl, x, y, r, phase = 0) {
  pdisc(g, x, y, r, '#FFF4D6');
  pdot(g, x - ri(r * .3), y - ri(r * .2), '#E8DCB8'); pdisc(g, x + ri(r * .3), y + ri(r * .25), Math.max(1, r * .18), '#EADFC0');
  if (phase) pdisc(g, x + ri(r * phase), y - 1, r, '#0B1030');
  if (gl) pdisc(gl, x, y, r + 2, 'rgba(255,240,200,.8)');
}
/* 一块像素云：几个圆叠成的团，底部压平 */
function pcloud(g, x, y, w, col, shadowCol) {
  const n = Math.max(3, ri(w / 8));
  for (let i = 0; i < n; i++) { const u = (i + .5) / n, r = (w / n) * (1.1 + Math.sin(u * Math.PI) * .9); pdisc(g, x + u * w, y - Math.sin(u * Math.PI) * w * .12, r, shadowCol || col); }
  for (let i = 0; i < n; i++) { const u = (i + .5) / n, r = (w / n) * (1.1 + Math.sin(u * Math.PI) * .9) - 1; pdisc(g, x + u * w, y - Math.sin(u * Math.PI) * w * .12 - 1, r, col); }
}

/* ---------------- 像素字：12px 像素字体先画到小画布，按 alpha 二值化（不糊边），再整数倍放大 ---------------- */
const GLYPH = new Map();
const FONT = '12px "Pix"';
const _mg = mk(8, 8).getContext('2d');
function textW12(s) { _mg.font = FONT; return Math.ceil(_mg.measureText(s).width); }
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
/* (x, y) 文字左上角（align='center' 时 x 是中线），k 倍放大 */
function ptext(g, s, x, y, k, col, o = {}) {
  const G = glyphs(s, col, o.ol || null);
  const tw = G.tw * k;
  let x0 = o.align === 'center' ? x - tw / 2 : o.align === 'right' ? x - tw : x;
  x0 = ri(x0 / k) * k; const y0 = ri(y / k) * k;
  g.save(); g.imageSmoothingEnabled = false; if (o.alpha != null) g.globalAlpha *= o.alpha;
  if (o.shadow) { const S = glyphs(s, o.shadow, o.ol ? o.shadow : null); g.drawImage(S.c, x0 - k, y0 - k, S.w * k, S.h * k); }
  g.drawImage(G.c, x0 - 2 * k, y0 - 2 * k, G.w * k, G.h * k);
  g.restore();
  return tw;
}
async function fontsReady(sample) { await document.fonts.load(FONT, sample); await document.fonts.ready; }
