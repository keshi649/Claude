'use strict';
/* MV《后来》—— 竖屏 1080×1920、30fps 的插画风 MV。frame(t) 只按时间 t（秒）画出一帧，可以并行渲染、单帧预览。
   core.js：时间轴、工具函数、图元（平滑路径、胶囊、渐变）、后期（柔光、颗粒、暗角、漏光、色差、录像带倒带）。 */
const W = 1080, H = 1920, FPS = 30;
const TM = window.TIMING, DUR = TM.duration, BEAT = TM.beat, BAR = TM.bar;
const bar = n => TM.bar0 + n * BAR;                // 第 n 小节第 1 拍（第 0 小节 = 前奏开头）
const LY = TM.lines;                               // 55 句歌词
const ch = (li, ci = 0) => LY[li].chars[ci < 0 ? LY[li].chars.length + ci : ci][1];   // 第 li 句第 ci 个字开口的时刻

const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/* ---------------- 工具 ---------------- */
const TAU = Math.PI * 2, PI = Math.PI;
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const smooth = u => u * u * (3 - 2 * u);
const E = {
  io: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
  out: u => 1 - Math.pow(1 - u, 3),
  out2: u => 1 - (1 - u) * (1 - u),
  in: u => u * u * u,
  in2: u => u * u,
  sine: u => -(Math.cos(PI * u) - 1) / 2,
  back: u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
  expo: u => u >= 1 ? 1 : 1 - Math.pow(2, -10 * u),
};
/* 两头为 0、中间为 1 的包络：a 起、b 满、c 开始落、d 落完 */
const env = (t, a, b, c, d) => t < a || t > d ? 0 : t < b ? seg(t, a, b) : t > c ? 1 - seg(t, c, d) : 1;
function R(seed) { let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(a, b = 0, c = 0) { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
/* 一维、二维的值噪声（0~1，平滑） */
function noise1(x, s = 0) { const i = Math.floor(x), f = x - i; return lerp(hash(i, s), hash(i + 1, s), smooth(f)); }
function noise2(x, y, s = 0) {
  const i = Math.floor(x), j = Math.floor(y), u = smooth(x - i), v = smooth(y - j);
  return lerp(lerp(hash(i, j, s), hash(i + 1, j, s), u), lerp(hash(i, j + 1, s), hash(i + 1, j + 1, s), u), v);
}
const wob = (t, f, s = 0) => noise1(t * f, s) * 2 - 1;            // 慢慢晃的 −1~1
const ri = Math.round;
const mod = (k, n) => ((k % n) + n) % n;

/* 颜色 */
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function rgb2hex(r, g, b) { return '#' + [r, g, b].map(v => clamp(ri(v), 0, 255).toString(16).padStart(2, '0')).join(''); }
function mix(a, b, u) { const A = hex2rgb(a), B = hex2rgb(b); return rgb2hex(lerp(A[0], B[0], u), lerp(A[1], B[1], u), lerp(A[2], B[2], u)); }
function shade(hex, k) { const [r, g, b] = hex2rgb(hex); return k < 1 ? rgb2hex(r * k, g * k, b * k) : rgb2hex(r + (255 - r) * (k - 1), g + (255 - g) * (k - 1), b + (255 - b) * (k - 1)); }
function rgba(hex, a) { const [r, g, b] = hex2rgb(hex); return `rgba(${r},${g},${b},${a})`; }

/* ---------------- 画布 ---------------- */
const LAYER = {};
/* 取一块命名的离屏画布（清空、复位），返回它的 2D 上下文 */
function layer(name, w = W, h = H) {
  let c = LAYER[name];
  if (!c || c.width !== w || c.height !== h) c = LAYER[name] = mk(w, h);
  const g = c.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.shadowBlur = 0; g.shadowColor = 'transparent'; g.imageSmoothingEnabled = true;
  g.clearRect(0, 0, w, h);
  return g;
}
const CACHE = {};
/* 不随时间变的东西只画一次 */
function cached(name, w, h, fn) { if (!CACHE[name]) { const c = mk(w, h), g = c.getContext('2d'); fn(g, c); CACHE[name] = c; } return CACHE[name]; }

/* ---------------- 图元 ---------------- */
function fillStyle(g, c) { g.fillStyle = c; }
function rect(g, x, y, w, h, c) { if (c) g.fillStyle = c; g.fillRect(x, y, w, h); }
function circ(g, x, y, r, c) { g.beginPath(); g.arc(x, y, Math.max(0, r), 0, TAU); if (c) g.fillStyle = c; g.fill(); }
function ell(g, x, y, rx, ry, rot = 0, c) { g.beginPath(); g.ellipse(x, y, Math.max(0, rx), Math.max(0, ry), rot, 0, TAU); if (c) g.fillStyle = c; g.fill(); }
function lg(g, x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); for (const [o, c] of stops) gr.addColorStop(clamp(o), c); return gr; }
function rg(g, x, y, r0, r1, stops, x1 = x, y1 = y) { const gr = g.createRadialGradient(x, y, Math.max(0, r0), x1, y1, Math.max(.01, r1)); for (const [o, c] of stops) gr.addColorStop(clamp(o), c); return gr; }
/* 一团柔光：中心 c，半径 r */
function glow(g, x, y, r, c, a = 1) {
  if (r <= 0 || a <= 0) return;
  g.fillStyle = rg(g, x, y, 0, r, [[0, rgba(c, a)], [.35, rgba(c, a * .45)], [1, rgba(c, 0)]]);
  g.fillRect(x - r, y - r, r * 2, r * 2);
}
/* 折线 / 平滑曲线（Catmull-Rom 转贝塞尔）。pts = [[x,y],...] */
function poly(g, pts, close = true) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); if (close) g.closePath(); }
function spline(g, pts, close = true, tension = .5, move = true) {
  const n = pts.length; if (n < 2) return;
  const P = i => close ? pts[mod(i, n)] : pts[clamp(i, 0, n - 1)];
  if (move) { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); }
  const last = close ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2), k = tension / 3;
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k, p1[1] + (p2[1] - p0[1]) * k, p2[0] - (p3[0] - p1[0]) * k, p2[1] - (p3[1] - p1[1]) * k, p2[0], p2[1]);
  }
  if (close) g.closePath();
}
/* 两头粗细不同的胶囊（四肢）：从 (x0,y0) 半径 r0 到 (x1,y1) 半径 r1 */
function capsule(g, x0, y0, r0, x1, y1, r1, c) {
  const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy) || 1e-3, a = Math.atan2(dy, dx);
  const s = clamp((r0 - r1) / d, -.99, .99), b = Math.acos(s);
  g.beginPath();
  g.arc(x0, y0, r0, a + b, a - b + TAU);
  g.arc(x1, y1, r1, a - b, a + b);
  g.closePath();
  if (c) { g.fillStyle = c; g.fill(); }
}
/* 按中心、角度画一张图 */
function drawRot(g, img, x, y, w, h, rot = 0, alpha = 1) {
  if (alpha <= 0) return;
  g.save(); g.globalAlpha *= alpha; g.translate(x, y); if (rot) g.rotate(rot); g.drawImage(img, -w / 2, -h / 2, w, h); g.restore();
}
function withAlpha(g, a, fn) { if (a <= 0) return; g.save(); g.globalAlpha *= a; fn(); g.restore(); }
function clipRect(g, x, y, w, h, fn) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); }

/* 文字 */
const FONT = { serif: '"Serif"', brush: '"Brush"', hand: '"Hand"', kai: '"Kai"', sans: 'sans-serif' };
function text(g, s, x, y, size, c, o = {}) {
  g.save();
  g.font = `${o.weight || 500} ${size}px ${FONT[o.font || 'serif']}`;
  g.textAlign = o.align || 'center'; g.textBaseline = o.base || 'middle';
  if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  if (o.ls) g.letterSpacing = `${o.ls}px`;
  if (o.shadow) { g.shadowColor = o.shadow; g.shadowBlur = o.blur || size * .3; }
  if (o.stroke) { g.lineWidth = o.lw || size * .08; g.strokeStyle = o.stroke; g.lineJoin = 'round'; g.strokeText(s, x, y); }
  g.fillStyle = c; g.fillText(s, x, y);
  g.restore();
}

/* ---------------- 后期 ---------------- */
/* 柔光：亮的地方往外晕。缩到 1/4 → 提对比压掉暗部 → 模糊 → screen 叠回来 */
function bloom(g, src, amt = .6, blur = 18, cut = 1.6) {
  if (amt <= 0) return;
  const s = layer('bloom', W / 4, H / 4);
  s.filter = `brightness(${1 / cut}) contrast(${cut * 1.6}) blur(${blur / 4}px)`;
  s.drawImage(src, 0, 0, W / 4, H / 4);
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = amt; g.drawImage(LAYER.bloom, 0, 0, W, H); g.restore();
}
/* 暗角 */
function vignette(g, a = .45, r0 = .45) {
  if (a <= 0) return;
  g.fillStyle = rg(g, W / 2, H * .46, H * r0 * .5, H * .78, [[0, 'rgba(0,0,0,0)'], [1, `rgba(0,0,0,${a})`]]);
  g.fillRect(0, 0, W, H);
}
/* 颗粒：一张固定不动的噪声图（每帧都变会让成片大很多） */
function grain(g, a = .07) {
  const n = cached('grain', 540, 960, (q) => {
    const im = q.createImageData(540, 960), d = im.data, r = R(77);
    for (let i = 0; i < d.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 90; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
    q.putImageData(im, 0, 0);
  });
  g.save(); g.globalCompositeOperation = 'overlay'; g.globalAlpha = a; g.drawImage(n, 0, 0, W, H); g.restore();
}
/* 调色：整体叠一层颜色。mode：soft-light / multiply / screen / color / overlay */
function tint(g, c, a, mode = 'soft-light') { if (a <= 0) return; g.save(); g.globalCompositeOperation = mode; g.globalAlpha = a; g.fillStyle = c; g.fillRect(0, 0, W, H); g.restore(); }
/* 漏光：画面边上暖色的光斑慢慢游 */
function leak(g, t, a = .5, hue = 0, seed = 1) {
  if (a <= 0) return;
  g.save(); g.globalCompositeOperation = 'screen';
  const cols = ['#FF7A2E', '#FFB04A', '#FF4E6A', '#FFD27A'];
  for (let i = 0; i < 3; i++) {
    const x = W * (i === 1 ? 1.05 : -.05) + wob(t, .12, seed * 9 + i) * 260, y = H * (.2 + .3 * i) + wob(t, .09, seed * 7 + i) * 380;
    const r = 520 + 240 * noise1(t * .2, seed + i);
    g.globalAlpha = a * (.55 + .45 * noise1(t * .35, seed * 3 + i));
    g.fillStyle = rg(g, x, y, 0, r, [[0, rgba(cols[(i + hue) % 4], .9)], [.4, rgba(cols[(i + hue + 1) % 4], .35)], [1, rgba(cols[(i + hue) % 4], 0)]]);
    g.fillRect(x - r, y - r, r * 2, r * 2);
  }
  g.restore();
}
/* 色差：红、蓝两路往两边错开 px 像素（src 是整幅画） */
function chroma(g, src, px) {
  if (Math.abs(px) < .5) { g.drawImage(src, 0, 0); return; }
  const parts = [['#FF0000', -px], ['#00FF00', 0], ['#0000FF', px]];
  const acc = layer('chromaAcc');
  acc.fillStyle = '#000'; acc.fillRect(0, 0, W, H);
  for (const [c, dx] of parts) {
    const q = layer('chromaOne');
    q.drawImage(src, dx, 0); q.globalCompositeOperation = 'multiply'; q.fillStyle = c; q.fillRect(0, 0, W, H);
    acc.globalCompositeOperation = 'lighter'; acc.drawImage(LAYER.chromaOne, 0, 0);
  }
  g.drawImage(LAYER.chromaAcc, 0, 0);
}
/* 录像带倒带：横向错位的条带、扫描线、雪花噪声带、色差。u 0~1 是强度 */
function vhs(g, src, t, u, seed = 3) {
  const q = layer('vhs');
  q.drawImage(src, 0, 0);
  const strips = 26, sh = H / strips;
  const o = layer('vhs2');
  for (let i = 0; i < strips; i++) {
    const n = noise1(t * 9 + i * .37, seed) - .5, k = hash(i, Math.floor(t * 12), seed);
    const dx = (n * 60 + (k > .86 ? (k - .86) * 900 : 0)) * u;
    o.drawImage(LAYER.vhs, 0, i * sh, W, sh, dx, i * sh, W, sh);
  }
  // 往下滚的跟踪噪声带
  for (let b = 0; b < 2; b++) {
    const y = mod(t * (900 + b * 500) + b * 700, H + 300) - 150, hh = 40 + 50 * b;
    o.globalAlpha = .55 * u; o.fillStyle = lg(o, 0, y, 0, y + hh, [[0, 'rgba(255,255,255,0)'], [.5, 'rgba(230,230,255,.8)'], [1, 'rgba(255,255,255,0)']]);
    o.fillRect(0, y, W, hh);
    o.globalAlpha = .9 * u;
    for (let k = 0; k < 40; k++) { const r = hash(k, Math.floor(t * 30), b); o.fillStyle = r > .5 ? '#fff' : '#99a'; o.fillRect(hash(k, 9, Math.floor(t * 30)) * W, y + r * hh, 30 + r * 120, 2); }
    o.globalAlpha = 1;
  }
  chroma(g, LAYER.vhs2, 7 * u);
  // 扫描线
  g.save(); g.globalAlpha = .18 * u; g.fillStyle = '#000';
  for (let y = 0; y < H; y += 6) g.fillRect(0, y, W, 2);
  g.restore();
  tint(g, '#3050A0', .18 * u, 'soft-light');
}

/* 七段数码管（老相机的日期戳）。s 只含数字、空格和 '，h 是字高 */
function segDigits(g, s, x, y, h, c, a = 1) {
  const SEG = { 0: 'abcdef', 1: 'bc', 2: 'abged', 3: 'abgcd', 4: 'fgbc', 5: 'afgcd', 6: 'afgedc', 7: 'abc', 8: 'abcdefg', 9: 'abcdfg' };
  const w = h * .52, t = h * .12, gap = h * .2;
  g.save(); g.globalAlpha *= a; g.fillStyle = c; g.shadowColor = c; g.shadowBlur = h * .35;
  let cx = x;
  for (const d of s) {
    if (d === ' ') { cx += w * .7; continue; }
    if (d === "'") { g.fillRect(cx, y, t * .9, h * .22); cx += t * 2.2; continue; }
    const on = SEG[d] || '', sk = -h * .1;     // 往右斜一点
    const P = (px, py) => [cx + px + sk * (py / h - .5), y + py];
    const bar = (x0, y0, x1, y1) => { const a = P(x0, y0), b = P(x1, y1); g.beginPath(); g.lineWidth = t; g.lineCap = 'round'; g.strokeStyle = c; g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke(); };
    const m = t * .7;
    if (on.includes('a')) bar(m, 0, w - m, 0);
    if (on.includes('b')) bar(w, m, w, h / 2 - m);
    if (on.includes('c')) bar(w, h / 2 + m, w, h - m);
    if (on.includes('d')) bar(m, h, w - m, h);
    if (on.includes('e')) bar(0, h / 2 + m, 0, h - m);
    if (on.includes('f')) bar(0, m, 0, h / 2 - m);
    if (on.includes('g')) bar(m, h / 2, w - m, h / 2);
    cx += w + gap;
  }
  g.restore();
}

/* 字体加载完再开始画 */
function fontsReady(sample) {
  const fams = [['Serif', 500], ['Serif', 700], ['Brush', 400], ['Hand', 400], ['Kai', 400]];
  return Promise.all(fams.map(([f, w]) => document.fonts.load(`${w} 48px "${f}"`, sample))).then(() => document.fonts.ready);
}
