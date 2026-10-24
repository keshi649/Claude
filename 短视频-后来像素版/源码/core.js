'use strict';
/* MV《后来》像素版 —— 横屏 1920×1080，30fps。frame(t) 只按时间 t（秒）画出一帧，可以并行渲染、单帧预览。
   core.js：时间轴、工具函数、像素缓冲、像素图元、像素字（1 位、不糊边）、光晕、星空、雨雪、全屏层和后期。 */
const W = 1920, H = 1080, FPS = 30;
const TM = window.TIMING, DUR = TM.duration, BEAT = TM.beat, BARLEN = TM.bar;
const bar = k => TM.bar0 + k * BARLEN;                 // 第 k 小节的第 1 拍（第 0 小节从 0.113 秒开始，人声 12.24 秒开口）
const LY = TM.lines;                                    // 55 句歌词：text，chars [字, 开口, 结束]
const ch = (li, ci) => LY[li].chars[ci < 0 ? LY[li].chars.length + ci : ci][1];   // 第 li 句第 ci 个字开口的时刻（负数从后往前数）
const chE = (li, ci) => LY[li].chars[ci < 0 ? LY[li].chars.length + ci : ci][2];  // 那个字唱完
const L0 = li => LY[li].chars[0][1];
const L1 = li => LY[li].chars[LY[li].chars.length - 1][2];

const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/* ---------------- 工具 ---------------- */
const TAU = Math.PI * 2, PI = Math.PI;
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const ri = Math.round;
/* 先升后降：a→b 从 0 升到 1，c→d 从 1 降到 0 */
const env = (t, a, b, c, d) => Math.min(seg(t, a, b), 1 - seg(t, c, d));
const E = {
  io: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
  out: u => 1 - Math.pow(1 - u, 3),
  out2: u => 1 - (1 - u) * (1 - u),
  in: u => u * u * u,
  in2: u => u * u,
  sine: u => -(Math.cos(Math.PI * u) - 1) / 2,
  back: u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
};
function R(seed) { let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(a, b = 0, c = 0) { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const mod = (k, n) => ((k % n) + n) % n;
/* 颜色（#rrggbb） */
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function rgb2hex(r, g, b) { return '#' + [r, g, b].map(v => clamp(ri(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, u) { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(lerp(A[0], B[0], u), lerp(A[1], B[1], u), lerp(A[2], B[2], u)); }
function shade(hex, k) { const [r, g, b] = hex2rgb(hex); return k < 1 ? rgb2hex(r * k, g * k, b * k) : rgb2hex(r + (255 - r) * (k - 1), g + (255 - g) * (k - 1), b + (255 - b) * (k - 1)); }
function rgba(hex, a) { const [r, g, b] = hex2rgb(hex); return `rgba(${r},${g},${b},${a})`; }
/* 按一串色标取色：stops [[u, '#hex'], ...] */
function ramp(stops, u) {
  if (u <= stops[0][0]) return stops[0][1];
  for (let i = 0; i < stops.length - 1; i++) { const [a, ca] = stops[i], [b, cb] = stops[i + 1]; if (u <= b) return mix(ca, cb, (u - a) / Math.max(1e-6, b - a)); }
  return stops[stops.length - 1][1];
}

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
function blit(g, name, P, camX = 0, camY = 0, alpha = 1) {
  const b = BUF[name]; g.save(); g.imageSmoothingEnabled = false; g.globalAlpha *= alpha;
  g.drawImage(b, ri(-camX * P), ri(-camY * P), b.width * P, b.height * P);
  g.restore();
}
/* 缓冲按任意比例贴（推镜头）：以缓冲里的 (fx, fy) 为中心放大 s 倍、放到屏幕 (sx, sy) */
function blitZoom(g, name, P, fx, fy, s, sx = W / 2, sy = H / 2, alpha = 1) {
  const b = BUF[name], k = P * s; g.save(); g.imageSmoothingEnabled = false; g.globalAlpha *= alpha;
  g.drawImage(b, sx - fx * k, sy - fy * k, b.width * k, b.height * k);
  g.restore();
}
/* 静态的东西只画一次 */
const CACHE = {};
function cached(name, w, h, fn) { if (!CACHE[name]) { const c = mk(w, h), g = c.getContext('2d'); g.imageSmoothingEnabled = false; fn(g, c); CACHE[name] = c; } return CACHE[name]; }
/* 全屏的离屏层（转场、后期用） */
const LAYER = {};
function layer(name, w = W, h = H) {
  let c = LAYER[name];
  if (!c || c.width !== w || c.height !== h) c = LAYER[name] = mk(w, h);
  const g = c.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.imageSmoothingEnabled = false; g.clearRect(0, 0, w, h); return g;
}

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
/* 空心椭圆 */
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
/* 多边形（扫描线填充，整像素） */
function ppoly(g, pts, c) {
  g.fillStyle = c;
  let y0 = Infinity, y1 = -Infinity; pts.forEach(p => { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); });
  for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
    const xs = [], yc = y + .5;
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + (yc - ay) / (by - ay) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) { const a = ri(xs[i]), b = ri(xs[i + 1]); if (b > a) g.fillRect(a, y, b - a, 1); }
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
/* 平滑的竖直渐变天空（按 8 级色阶量化，交界处抖一行，保持像素感） */
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
/* 柔和的光锥（不用抖动）：从 (cx, y0) 宽 w0 到 y1 宽 w1，一行一行画，透明度按 1/24 量化，screen 叠上去 */
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
/* 圆形的柔光斑（按圈量化透明度），screen 叠 */
function pglow(g, cx, cy, r, col, a) {
  const [rr, gg, bb] = hex2rgb(col);
  g.save(); g.globalCompositeOperation = 'screen';
  for (let k = 4; k >= 1; k--) { g.fillStyle = `rgba(${rr},${gg},${bb},${(a * (1 - (k - 1) / 4) * .45).toFixed(3)})`; pdisc(g, cx, cy, r * k / 4, g.fillStyle); }
  g.restore();
}
/* 精灵：整数坐标贴图，k 倍、可水平翻转 */
function pspr(g, spr, x, y, k = 1, flip = false) {
  if (!spr) return;
  x = ri(x); y = ri(y);
  if (!flip) { g.drawImage(spr, x, y, spr.width * k, spr.height * k); return; }
  g.save(); g.translate(x + spr.width * k, y); g.scale(-1, 1); g.drawImage(spr, 0, 0, spr.width * k, spr.height * k); g.restore();
}
/* 精灵按颜色相乘（夜里偏蓝），结果缓存 */
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
/* 精灵整块换成一个颜色（剪影、半透明的鬼影用） */
const SIL = new Map();
function silhouette(spr, col, key) {
  const k = key + '|sil|' + col;
  if (SIL.has(k)) return SIL.get(k);
  const c = mk(spr.width, spr.height), g = c.getContext('2d');
  g.drawImage(spr, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height);
  SIL.set(k, c); return c;
}

/* ---------------- 光晕：亮的东西另画一层，模糊后叠回去（screen） ---------------- */
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
function glowBlitZoom(g, name, P, fx, fy, s, sx = W / 2, sy = H / 2, amt = 1, rad = 3) {
  const b = BUF['glow_' + name]; if (!b) return;
  const t = pbuf('glowtmp_' + name, b.width, b.height), k = P * s;
  t.filter = `blur(${rad}px)`; t.drawImage(b, 0, 0); t.filter = 'none';
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = amt; g.imageSmoothingEnabled = true;
  g.drawImage(BUF['glowtmp_' + name], sx - fx * k, sy - fy * k, b.width * k, b.height * k);
  t.clearRect(0, 0, b.width, b.height); t.filter = `blur(${rad * 3}px)`; t.drawImage(b, 0, 0); t.filter = 'none';
  g.globalAlpha = amt * .6; g.drawImage(BUF['glowtmp_' + name], sx - fx * k, sy - fy * k, b.width * k, b.height * k);
  g.restore();
}

/* ---------------- 星空：固定的星星（按种子），一闪一闪；piano 每个起音点亮一批 ---------------- */
/* o: {n 数量, seed, tw 闪烁强度, cols 颜色表, big 大星（十字）比例, y1 只画到这一行} */
function starfield(g, t, w, h, o = {}) {
  const n = o.n || 160, seed = o.seed || 7, cols = o.cols || ['#FFFFFF', '#CFE0FF', '#FFE9C2', '#FFD0E4'];
  const y1 = o.y1 ?? h, tw = o.tw ?? .5, big = o.big ?? .06;
  for (let i = 0; i < n; i++) {
    const x = ri(hash(i, seed, 1) * w), y = ri(hash(i, seed, 2) * y1);
    const ph = hash(i, seed, 3) * TAU, sp = 1.2 + 2.5 * hash(i, seed, 4);
    let a = 1 - tw * (.5 + .5 * Math.sin(t * sp + ph));
    if (o.appear) a *= o.appear(i, x, y);
    if (a <= .05) continue;
    const c = cols[i % cols.length];
    g.globalAlpha = clamp(a);
    if (hash(i, seed, 5) < big) {            // 大星：十字
      pdot(g, x, y, '#FFFFFF'); pdot(g, x - 1, y, c); pdot(g, x + 1, y, c); pdot(g, x, y - 1, c); pdot(g, x, y + 1, c);
      if (a > .8) { g.globalAlpha = (a - .8) * 3; pdot(g, x - 2, y, c); pdot(g, x + 2, y, c); pdot(g, x, y - 2, c); pdot(g, x, y + 2, c); }
    } else pdot(g, x, y, c);
  }
  g.globalAlpha = 1;
}
/* 流星：从 (x0,y0) 往 (dx,dy) 方向划过，u 0..1 */
function meteor(g, x0, y0, dx, dy, u, len = 14, col = '#FFFFFF') {
  if (u <= 0 || u >= 1) return;
  const hx = x0 + dx * u, hy = y0 + dy * u, L = Math.hypot(dx, dy);
  for (let k = 0; k < len; k++) {
    const a = (1 - k / len) * Math.sin(u * PI);
    g.globalAlpha = clamp(a); pdot(g, hx - dx / L * k, hy - dy / L * k, k < 2 ? '#FFFFFF' : col);
  }
  g.globalAlpha = 1;
}
/* 银河：一条斜着的淡淡光带 + 密一些的小星（缓存） */
function milkyWay(w, h, seed, x0, y0, x1, y1, width, col = '#8C7BD6') {
  return cached(`milky|${w}|${h}|${seed}|${x0}|${y0}|${x1}|${y1}|${width}`, w, h, g => {
    const r = R(seed), dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
    for (let i = 0; i < 2600; i++) {
      const u = r(), v = (r() + r() + r() - 1.5) / 1.5;
      const x = ri(x0 + dx * u + nx * v * width), y = ri(y0 + dy * u + ny * v * width);
      const a = (1 - Math.abs(v)) * .5;
      g.fillStyle = r() < .15 ? `rgba(255,255,255,${a})` : rgba(r() < .5 ? col : '#C9B8FF', a * .7);
      g.fillRect(x, y, 1, 1);
    }
  });
}
/* 萤火虫：在 (x0..x1, y0..y1) 范围里飘，亮暗呼吸；画到场景和光层 */
function fireflies(b, gl, t, n, x0, y0, x1, y1, seed = 3, col = '#E8FF8A') {
  for (let i = 0; i < n; i++) {
    const px = x0 + (x1 - x0) * hash(i, seed, 1), py = y0 + (y1 - y0) * hash(i, seed, 2);
    const x = px + Math.sin(t * (.5 + hash(i, seed, 3)) + i) * 6, y = py + Math.cos(t * (.4 + hash(i, seed, 4)) + i * 2) * 4 - (t * 1.5 * hash(i, seed, 6)) % 8;
    const a = .5 + .5 * Math.sin(t * (1.5 + hash(i, seed, 5) * 2) + i * 3);
    if (a < .2) continue;
    b.globalAlpha = a; pdot(b, x, y, col); b.globalAlpha = 1;
    if (gl) { gl.globalAlpha = a; prect(gl, x - 1, y - 1, 3, 3, col); gl.globalAlpha = 1; }
  }
}

/* ---------------- 雨、雪 ---------------- */
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
  if (o.ground != null) {
    g.fillStyle = o.splashCol || 'rgba(190,210,255,.6)';
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
function snow(g, t, w, h, o = {}) {
  const n = o.n || 80, v = o.v || 14, seed = o.seed || 5, col = o.col || '#FFFFFF';
  for (let i = 0; i < n; i++) {
    const sp = v * (.6 + .8 * hash(i, seed, 1)), span = h + 10;
    const y = ((t * sp + hash(i, seed, 2) * span) % span) - 5;
    const x = mod(hash(i, seed, 3) * w + Math.sin(t * .8 + i) * 3 + (o.drift || 0) * t, w);
    g.globalAlpha = .55 + .45 * hash(i, seed, 4);
    if (hash(i, seed, 5) < .25) prect(g, x, y, 2, 2, col); else pdot(g, x, y, col);
  }
  g.globalAlpha = 1;
}

/* ---------------- 像素字：12px 像素字体先画到小画布，按 alpha 二值化（不糊边），再整数倍放大 ---------------- */
const GLYPH = new Map();
const FONT = '12px "Pix"';
const _mg = mk(8, 8).getContext('2d');
function textW12(s) { _mg.font = FONT; return Math.ceil(_mg.measureText(s).width); }
/* 返回一块 1 位的文字画布（高 17），颜色 col；ol 给描边色时外圈加 1 像素描边 */
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
  const res = { c, w, h, tw: w - 4, on, ow: w };
  GLYPH.set(key, res); return res;
}
/* 画像素字：(x, y) 是文字左上角（align='center' 时 x 是中线），k 倍放大 */
function ptext(g, s, x, y, k, col, o = {}) {
  const G = glyphs(s, col, o.ol || null);
  const tw = G.tw * k;
  let x0 = o.align === 'center' ? x - tw / 2 : o.align === 'right' ? x - tw : x;
  if (o.snap !== false) { x0 = ri(x0 / k) * k; y = ri(y / k) * k; }
  g.save(); g.imageSmoothingEnabled = false; if (o.alpha != null) g.globalAlpha *= o.alpha;
  if (o.shadow) { const S = glyphs(s, o.shadow, o.ol ? o.shadow : null); g.drawImage(S.c, x0 - k, y - k, S.w * k, S.h * k); }
  g.drawImage(G.c, x0 - 2 * k, y - 2 * k, G.w * k, G.h * k);
  g.restore();
  return tw;
}
/* 一串字的 1 位点阵（片名由粒子拼出来用）：返回 [{x, y}]，坐标是字形像素（左上角 0,0），和宽高 */
function glyphBits(s) {
  const G = glyphs(s, '#FFFFFF'), pts = [];
  for (let y = 0; y < G.h; y++) for (let x = 0; x < G.ow; x++) if (G.on[y * G.ow + x]) pts.push({ x: x - 2, y: y - 2 });
  return { pts, w: G.tw, h: 13 };
}

/* ---------------- 后期 ---------------- */
const VIG = {};
function vignette(g, a) {
  if (a <= 0) return;
  if (!VIG.c) {
    const c = mk(), q = c.getContext('2d'), gr = q.createRadialGradient(W / 2, H / 2, 480, W / 2, H / 2, 1200);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); q.fillStyle = gr; q.fillRect(0, 0, W, H); VIG.c = c;
  }
  g.save(); g.globalAlpha = a; g.drawImage(VIG.c, 0, 0); g.restore();
}
/* 液晶屏的格子：每 p 个屏幕像素一道细暗线（随缓冲一起移动：ox/oy 是格子的偏移） */
function lcdGrid(g, p, a, ox = 0, oy = 0, x0 = 0, y0 = 0, w = W, h = H) {
  if (a <= 0 || p < 4) return;
  g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
  g.fillStyle = `rgba(0,0,0,${a})`;
  const lw = Math.max(1, ri(p / 7));
  for (let x = x0 + mod(ox, p) - p; x < x0 + w; x += p) g.fillRect(ri(x), y0, lw, h);
  for (let y = y0 + mod(oy, p) - p; y < y0 + h; y += p) g.fillRect(x0, ri(y), w, lw);
  g.restore();
}
/* 画面打碎成马赛克：src 缩到每 block 像素一格再放大 */
function mosaic(g, src, block, alpha = 1) {
  const w = Math.max(1, Math.ceil(W / block)), h = Math.max(1, Math.ceil(H / block)), q = layer('mosaicTmp', w, h);
  q.imageSmoothingEnabled = true; q.drawImage(src, 0, 0, w, h);
  g.save(); g.imageSmoothingEnabled = false; g.globalAlpha = alpha; g.drawImage(LAYER.mosaicTmp, 0, 0, w * block, h * block); g.restore();
}
/* 故障：横条错开 + 红蓝分离（amt 0..1） */
function glitch(g, src, amt, seed) {
  if (amt <= 0) { g.drawImage(src, 0, 0); return; }
  const r = R(seed), q = layer('glitchTmp');
  q.drawImage(src, 0, 0);
  g.save();
  g.drawImage(LAYER.glitchTmp, 0, 0);
  // 红蓝错位
  g.globalCompositeOperation = 'screen'; g.globalAlpha = .55 * amt;
  const off = ri(18 * amt);
  g.filter = 'none';
  const rq = layer('glitchR'); rq.drawImage(LAYER.glitchTmp, 0, 0); rq.globalCompositeOperation = 'multiply'; rq.fillStyle = '#FF2040'; rq.fillRect(0, 0, W, H);
  g.drawImage(LAYER.glitchR, off, 0);
  const bq = layer('glitchB'); bq.drawImage(LAYER.glitchTmp, 0, 0); bq.globalCompositeOperation = 'multiply'; bq.fillStyle = '#2050FF'; bq.fillRect(0, 0, W, H);
  g.drawImage(LAYER.glitchB, -off, 0);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  // 横条
  const n = ri(3 + 9 * amt);
  for (let i = 0; i < n; i++) {
    const y = ri(r() * H / 8) * 8, h = ri(8 + r() * 90 * amt), dx = ri((r() - .5) * 160 * amt);
    g.drawImage(LAYER.glitchTmp, 0, y, W, h, dx, y, W, h);
  }
  g.restore();
}

/* ---------------- 字体就绪 ---------------- */
async function fontsReady(sample) {
  await document.fonts.load(FONT, sample);
  await document.fonts.ready;
}
