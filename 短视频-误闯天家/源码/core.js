'use strict';
/* 《误闯天家》MV —— 像素小怪误闯天家。frame(t) 只依赖时间 t：同一个 t 永远画出同一帧，可以并行渲染、单帧预览。
   core.js：节拍和逐字时间、工具函数、像素缓冲、像素图元、像素毛笔字。 */
const W = 1080, H = 1920;
const TM = window.TIMING, DUR = TM.duration;
const B = k => TM.beat.phase + k * TM.beat.period;      // 第 k 拍的时刻（约 129.2 BPM，一拍 0.464 秒）
const BEAT = TM.beat.period;
const beatOf = t => (t - TM.beat.phase) / BEAT;         // t 落在第几拍（带小数）
const LINES = TM.lines;
const CT = (li, ci) => LINES[li].chars[ci].t;           // 第 li 句第 ci 个字开唱的时刻
const LEND = li => LINES[li].end;                       // 第 li 句唱完

const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const layerCv = mk(), layerG = layerCv.getContext('2d');

/* ---------------- 工具 ---------------- */
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  io: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
  out: u => 1 - Math.pow(1 - u, 3),
  in: u => u * u * u,
  sine: u => -(Math.cos(Math.PI * u) - 1) / 2,
  back: u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
};
function win(t, a, b, fi = .3, fo = .3) { if (t < a || t > b) return 0; return Math.min(fi > 0 ? clamp((t - a) / fi) : 1, fo > 0 ? clamp((b - t) / fo) : 1); }
const pop = (t, a, d = .3) => t < a ? 0 : E.back(clamp((t - a) / d));
/* 卡点：t 之后最近一次落拍过去了多久（秒），用来做"一拍一顿"的机械动作 */
const sinceBeat = t => { const b = beatOf(t); return (b - Math.floor(b)) * BEAT; };
/* 落拍时弹一下：刚落拍时为 1，按 d 秒衰减到 0 */
const kick = (t, d = .16) => { const s = sinceBeat(t); return s < d ? 1 - s / d : 0; };
function R(seed) { let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(a, b = 0, c = 0) { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function shake(t, t0, amp, dur = .4, f = 31) { if (t < t0 || t > t0 + dur) return [0, 0]; const k = 1 - (t - t0) / dur; return [Math.round(Math.sin((t - t0) * f * 6.3) * amp * k * k), Math.round(Math.cos((t - t0) * f * 5.1) * amp * k * k)]; }
function withAlpha(g, a, fn) { if (a <= .001) return; g.save(); g.globalAlpha *= a; fn(); g.restore(); }
/* 先把一组东西画到离屏层，再整体半透明贴上（避免叠加处变深） */
function layer(g, alpha, fn) {
  if (alpha <= .001) return;
  if (alpha >= .999) { fn(g); return; }
  layerG.setTransform(1, 0, 0, 1, 0, 0); layerG.globalAlpha = 1; layerG.clearRect(0, 0, W, H);
  fn(layerG);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = alpha; g.drawImage(layerCv, 0, 0); g.restore();
}

/* ---------------- 调色板 ---------------- */
const C = {
  ink: '#1B1030', plum: '#2A1030', ivory: '#FFF4DF', gold: '#FFD34E', goldD: '#C9962A', goldL: '#FFF0A8',
  red: '#D9452B', redD: '#8E2A23', jade: '#7FD3B8', eye: '#171312', white: '#FFFFFF',
  clawd: '#CB7C5E',
};

/* ---------------- 像素缓冲：世界按"像素"画在小画布上，再最近邻放大 ---------------- */
const BUF = {};
function pbuf(name, w, h) {
  let b = BUF[name];
  if (!b || b.width !== w || b.height !== h) { b = BUF[name] = mk(w, h); }
  const g = b.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.imageSmoothingEnabled = false; g.clearRect(0, 0, w, h);
  return g;
}
/* 把像素缓冲贴到屏幕：每个世界像素放大成 P 个屏幕像素；(camX, camY) 是视野左上角（世界坐标，取整到世界像素） */
function blit(g, name, P, camX = 0, camY = 0) {
  const b = BUF[name]; g.save(); g.imageSmoothingEnabled = false;
  const sx = Math.round(camX), sy = Math.round(camY);
  const sw = Math.min(b.width - sx, Math.ceil(W / P) + 1), sh = Math.min(b.height - sy, Math.ceil(H / P) + 1);
  g.drawImage(b, sx, sy, sw, sh, 0, 0, sw * P, sh * P);
  g.restore();
}
const CACHE = {};
function cached(name, w, h, fn) { if (!CACHE[name]) { const c = mk(w, h), g = c.getContext('2d'); g.imageSmoothingEnabled = false; fn(g, c); CACHE[name] = c; } return CACHE[name]; }

/* 像素图元（坐标全部取整） */
const ri = Math.round;
function prect(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(ri(x), ri(y), ri(w), ri(h)); }
function pdot(g, x, y, c) { g.fillStyle = c; g.fillRect(ri(x), ri(y), 1, 1); }
function pdisc(g, cx, cy, r, c) {
  g.fillStyle = c; cx = ri(cx); cy = ri(cy); r = Math.max(0, Math.round(r));
  for (let dy = -r; dy <= r; dy++) { const dx = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy)) + .35); g.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1); }
}
function pell(g, cx, cy, rx, ry, c) {
  g.fillStyle = c; cx = ri(cx); cy = ri(cy); rx = Math.max(0, rx); ry = Math.max(1, ry);
  for (let dy = -Math.floor(ry); dy <= Math.floor(ry); dy++) { const dx = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))) + .35); g.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1); }
}
/* 椭圆环（光环、月晕） */
function pring(g, cx, cy, rx, ry, c, th = 1) {
  g.fillStyle = c;
  const n = Math.ceil((rx + ry) * 4);
  for (let i = 0; i < n; i++) { const a = i / n * TAU; for (let k = 0; k < th; k++) g.fillRect(ri(cx + Math.cos(a) * (rx - k)), ri(cy + Math.sin(a) * (ry - k * ry / rx)), 1, 1); }
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
/* 4×4 Bayer 抖动 */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function pdither(g, x, y, w, h, c, level) {
  if (level <= 0) return;
  if (level >= 1) { prect(g, x, y, w, h, c); return; }
  g.fillStyle = c; x = ri(x); y = ri(y);
  const th = level * 16;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (BAYER[((y + j) & 3) * 4 + ((x + i) & 3)] < th) g.fillRect(x + i, y + j, 1, 1);
}
/* 竖直分段渐变：stops = [[y, color], ...]，段与段之间用抖动过渡 */
function pbands(g, x, w, stops, dith = 4) {
  for (let i = 0; i < stops.length - 1; i++) {
    const [y0, c0] = stops[i], [y1, c1] = stops[i + 1];
    prect(g, x, y0, w, y1 - y0, c0);
    for (let k = 0; k < dith; k++) pdither(g, x, y1 - dith + k, w, 1, c1, (k + 1) / (dith + 1));
  }
}
/* 精灵贴图：整数坐标、可翻转、可按整数倍放大 */
function pspr(g, spr, x, y, flip = false, s = 1) {
  if (!spr) return;
  x = ri(x); y = ri(y);
  g.save(); g.imageSmoothingEnabled = false;
  if (flip) { g.translate(x + spr.width * s, y); g.scale(-1, 1); g.drawImage(spr, 0, 0, spr.width * s, spr.height * s); }
  else g.drawImage(spr, x, y, spr.width * s, spr.height * s);
  g.restore();
}
/* 颜色明暗：k<1 变暗，k>1 变亮 */
function shadeOf(hex, k) {
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g2 = (n >> 8) & 255, b = n & 255;
  const f = v => Math.max(0, Math.min(255, Math.round(k < 1 ? v * k : v + (255 - v) * (k - 1))));
  return '#' + [f(r), f(g2), f(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}
function mixHex(a, b, u) {
  const p = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];
  const A = p(a), Bc = p(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, Bc[i], u)).toString(16).padStart(2, '0')).join('');
}

/* ---------------- 像素毛笔字 ----------------
   马善政毛笔楷书在小画布上按 px 号字画出来、透明度二值化，外面描 1 像素的边（再往右下多一圈当投影），
   贴到屏幕时按 k 倍最近邻放大：毛笔的笔锋变成一格一格的像素。 */
const BRUSH = 'MSZ';
function brushGlyph(s, px, fill, ol = C.plum, shadow = 'rgba(20,6,30,.55)') {
  const key = [s, px, String(fill), ol, shadow].join('|');
  if (CACHE[key]) return CACHE[key];
  const pad = 3, w = Math.ceil(px * s.length * 1.06) + pad * 2, h = Math.ceil(px * 1.18) + pad * 2;
  const a = mk(w, h), ag = a.getContext('2d');
  ag.font = `${px}px "${BRUSH}"`; ag.textBaseline = 'top';
  if (Array.isArray(fill)) { const gr = ag.createLinearGradient(0, pad, 0, pad + px); fill.forEach(([u, c]) => gr.addColorStop(u, c)); ag.fillStyle = gr; }
  else ag.fillStyle = fill;
  ag.fillText(s, pad, pad + px * .06);
  const im = ag.getImageData(0, 0, w, h), d = im.data;
  const on = new Uint8Array(w * h);
  for (let i = 0; i < w * h; i++) { if (d[i * 4 + 3] > 100) { on[i] = 1; d[i * 4 + 3] = 255; } else d[i * 4 + 3] = 0; }
  ag.putImageData(im, 0, 0);
  const c = mk(w, h), g = c.getContext('2d');
  const dil = (col, ox, oy) => {
    g.fillStyle = col;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (on[y * w + x]) continue;
      let hit = false;
      for (let dy = -1; dy <= 1 && !hit; dy++) for (let dx = -1; dx <= 1; dx++) { const X = x + dx - ox, Y = y + dy - oy; if (X >= 0 && Y >= 0 && X < w && Y < h && on[Y * w + X]) { hit = true; break; } }
      if (hit) g.fillRect(x, y, 1, 1);
    }
  };
  if (shadow) dil(shadow, 1, 1);
  if (ol) dil(ol, 0, 0);
  g.drawImage(a, 0, 0);
  CACHE[key] = c;
  return c;
}
/* 在屏幕 (cx, cy) 居中画一个像素毛笔字串，k 倍放大，sc 额外缩放（盖章弹入用） */
function brushText(g, s, cx, cy, px, k, fill, o = {}) {
  const c = brushGlyph(s, px, fill, o.ol === undefined ? C.plum : o.ol, o.shadow === undefined ? 'rgba(20,6,30,.55)' : o.shadow);
  const sc = (o.sc || 1) * k;
  g.save(); g.imageSmoothingEnabled = false;
  if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  const w = c.width * sc, h = c.height * sc;
  g.drawImage(c, ri(cx - w / 2), ri(cy - h / 2), ri(w), ri(h));
  g.restore();
}
/* 小号说明文字（片头歌名、片尾署名），平滑字体 */
function plainText(g, s, x, y, px, col, o = {}) {
  g.save(); g.font = `${px}px "${o.font || 'MSZ'}", "WenQuanYi Zen Hei", sans-serif`; g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
  if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  if (o.ol) { g.lineJoin = 'round'; g.lineWidth = o.olw || px / 6; g.strokeStyle = o.ol; g.strokeText(s, x, y); }
  g.fillStyle = col; g.fillText(s, x, y);
  g.restore();
}
/* 按任意倍数放大贴图（推镜头用）：世界点 (wx, wy) 落在屏幕 (sx, sy)；P 可以带小数 */
function blitAt(g, name, P, wx, wy, sx = W / 2, sy = H / 2) {
  const b = BUF[name]; g.save(); g.imageSmoothingEnabled = false;
  g.drawImage(b, 0, 0, b.width, b.height, ri(sx - wx * P), ri(sy - wy * P), ri(b.width * P), ri(b.height * P));
  g.restore();
}
/* 半透明地画（光、晕）：大面积的光用透明度叠，不用抖动——放大十几倍以后抖动会变成一颗颗圆点 */
function palpha(g, a, fn) { if (a <= .001) return; g.save(); g.globalAlpha *= a; fn(); g.restore(); }
/* 一团光晕：几圈半透明的圆叠出来，越往外越淡 */
function pglow(g, cx, cy, r, col, a = .3, n = 4) {
  for (let i = n; i >= 1; i--) palpha(g, a / n * 1.4, () => pdisc(g, cx, cy, r * i / n, col));
}
/* 一束光：上窄下宽的梯形，逐行填，半透明 */
function pbeam(g, x0, y0, w0, x1, y1, w1, col, a = .2) {
  palpha(g, a, () => { for (let y = Math.round(y0); y <= y1; y++) { const u = (y - y0) / (y1 - y0 || 1); const x = lerp(x0, x1, u), w = lerp(w0, w1, u); prect(g, x - w / 2, y, w, 1, col); } });
}
