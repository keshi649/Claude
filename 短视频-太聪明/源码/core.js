'use strict';
/* 《太聪明》Claude 版 MV —— frame(T) 只依赖时间 T，逐帧确定地画出画面。
   core.js：画布、工具、像素绘制、像素字、合成（视差、景深、光柱、泛光、颗粒、暗角、遮幅）。

   画面是 320×150 的像素画，每个像素放大 6 倍，正好是 1920×900；上下各 90 像素黑边（2.13:1 遮幅）。
   场景只在低分辨率画布上画，摄像机的小数部分在放大时补上，所以平移是顺滑的，像素依然是方的。 */
const W = 1920, H = 1080, LB = 90;
const VW = 1920, VH = 900;
const PX = 6, AW = 320, AH = 150, PAD = 4;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/* ---------------- 工具 ---------------- */
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const fl = Math.floor, rd = Math.round;
const E = {
  io: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
  out: u => 1 - Math.pow(1 - u, 3),
  in: u => u * u * u,
  sine: u => -(Math.cos(Math.PI * u) - 1) / 2,
  back: u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
};
/* [a,b] 内为 1，前后各用 fi / fo 秒淡入淡出 */
function win(t, a, b, fi = .3, fo = .3) { if (t < a || t > b) return 0; return Math.min(fi > 0 ? clamp((t - a) / fi) : 1, fo > 0 ? clamp((b - t) / fo) : 1); }
function hash(a, b = 0, c = 0) { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function R(seed) { let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
/* 平滑噪声（1 维） */
function n1(x, seed = 0) { const i = fl(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i, seed), hash(i + 1, seed), u); }
/* 关键帧插值：keys = [[t, v], ...]，v 可以是数或数组 */
function kf(t, keys, ease = E.io) {
  if (t <= keys[0][0]) return keys[0][1];
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const [t0, v0] = keys[i - 1], [t1, v1] = keys[i], u = ease((t - t0) / (t1 - t0));
      return Array.isArray(v0) ? v0.map((a, k) => lerp(a, v1[k], u)) : lerp(v0, v1, u);
    }
  }
  return keys[keys.length - 1][1];
}

/* 颜色 */
function hex2rgb(h) { const n = parseInt(h.slice(1), 16); return [n >> 16 & 255, n >> 8 & 255, n & 255]; }
function rgb2hex([r, g, b]) { return '#' + ((1 << 24) | (clamp(rd(r), 0, 255) << 16) | (clamp(rd(g), 0, 255) << 8) | clamp(rd(b), 0, 255)).toString(16).slice(1); }
const _mixC = new Map();
function mix(a, b, u) {
  u = clamp(u); if (u <= 0) return a; if (u >= 1) return b;
  const k = a + b + (rd(u * 64)); let v = _mixC.get(k);
  if (!v) { const A = hex2rgb(a), B = hex2rgb(b), q = rd(u * 64) / 64; v = rgb2hex(A.map((x, i) => lerp(x, B[i], q))); _mixC.set(k, v); }
  return v;
}
function rgba(h, a) { const [r, g, b] = hex2rgb(h); return `rgba(${r},${g},${b},${a})`; }

/* ---------------- 包络 / 节拍 ---------------- */
const AL = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const dec = s => Float32Array.from(s, ch => AL.indexOf(ch) / 61);
const VOC = dec(VOC_S), ACC = dec(ACC_S);
function envAt(arr, t) { const x = t * ENV_FPS, i = fl(x); if (i < 0) return 0; if (i >= arr.length - 1) return arr[arr.length - 1] || 0; return lerp(arr[i], arr[i + 1], x - i); }
const voc = t => envAt(VOC, t), acc = t => envAt(ACC, t);
/* 第几拍（四分音符）、拍内相位 */
const beatF = t => (t - BEAT0) / BEAT;
/* 每拍一次的轻微起伏（0..1，拍点处为 1） */
function bob(t, ph = 0) { const b = beatF(t) + ph; return .5 + .5 * Math.cos((b - fl(b)) * TAU); }
/* 拍点脉冲：每拍开头 1 → 衰减 */
function pulse(t, decay = 5, every = 1) { const b = beatF(t) / every; if (b < 0) return 0; return Math.exp(-(b - fl(b)) * BEAT * every * decay); }

/* ---------------- 像素绘制（都在低分辨率画布上，整数坐标） ---------------- */
function rect(g, x, y, w, h, c) {
  const x0 = rd(x), y0 = rd(y), x1 = rd(x + w), y1 = rd(y + h);
  if (x1 <= x0 || y1 <= y0) return;
  g.fillStyle = c; g.fillRect(x0, y0, x1 - x0, y1 - y0);
}
const px = (g, x, y, c) => rect(g, x, y, 1, 1, c);
/* 圆角矩形（像素风：只切掉角上的像素） */
function rrect(g, x, y, w, h, r, c) {
  x = rd(x); y = rd(y); w = rd(w); h = rd(h);
  for (let j = 0; j < h; j++) {
    let cut = 0;
    if (j < r) cut = r - fl(Math.sqrt(r * r - (r - j - .5) * (r - j - .5)));
    else if (j >= h - r) { const jj = h - 1 - j; cut = r - fl(Math.sqrt(r * r - (r - jj - .5) * (r - jj - .5))); }
    rect(g, x + cut, y + j, w - 2 * cut, 1, c);
  }
}
/* 像素圆盘 */
function disc(g, cx, cy, r, c) {
  for (let j = -r; j <= r; j++) { const w = fl(Math.sqrt(r * r - j * j) + .5); rect(g, cx - w, cy + j, 2 * w + 1, 1, c); }
}
/* 像素直线（Bresenham） */
function line(g, x0, y0, x1, y1, c) {
  x0 = rd(x0); y0 = rd(y0); x1 = rd(x1); y1 = rd(y1);
  g.fillStyle = c;
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let e = dx + dy, n = 0;
  while (n++ < 2000) { g.fillRect(x0, y0, 1, 1); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
}
/* 棋盘格抖动填充（两色） */
function dith(g, x, y, w, h, c, ph = 0) {
  g.fillStyle = c;
  for (let j = 0; j < h; j++) for (let i = (j + ph) & 1; i < w; i += 2) g.fillRect(x + i, y + j, 1, 1);
}
/* 竖直渐变（分段色带，像素画常用） */
function bands(g, x, y, w, h, cols) {
  const n = cols.length;
  for (let i = 0; i < n; i++) { const y0 = y + fl(h * i / n), y1 = y + fl(h * (i + 1) / n); rect(g, x, y0, w, y1 - y0, cols[i]); }
  // 色带交界处两行棋盘格过渡
  for (let i = 1; i < n; i++) { const yy = y + fl(h * i / n); dith(g, rd(x), yy - 2, rd(w), 1, cols[i], 1); dith(g, rd(x), yy - 1, rd(w), 1, cols[i]); dith(g, rd(x), yy, rd(w), 1, cols[i - 1], 1); dith(g, rd(x), yy + 1, rd(w), 1, cols[i - 1]); }
}

/* ASCII 精灵：rows 是字符串数组，pal 把字符映射到颜色；'.' 透明。结果缓存成小画布 */
const _spr = new Map();
function sprite(rows, pal, key) {
  const k = key || rows.join('|') + JSON.stringify(pal);
  let c = _spr.get(k); if (c) return c;
  const w = Math.max(...rows.map(r => r.length)), h = rows.length;
  c = mk(w, h); const g = c.getContext('2d');
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const col = pal[r[i]]; if (col) { g.fillStyle = col; g.fillRect(i, j, 1, 1); } } });
  _spr.set(k, c); return c;
}
function blit(g, img, x, y, flip = false, a = 1) {
  if (a <= 0) return;
  g.save(); if (a < 1) g.globalAlpha *= a;
  if (flip) { g.translate(rd(x) + img.width, rd(y)); g.scale(-1, 1); g.drawImage(img, 0, 0); }
  else g.drawImage(img, rd(x), rd(y));
  g.restore();
}

/* ---------------- 像素字 ----------------
   缝合像素字体 12px / 10px。先画到小画布上再二值化，保证每个笔画都是整像素。 */
const _gl = new Map();
const FONT = { 12: 'FP12', 10: 'FP10' };
function glyph(ch, size = 12, col = '#ffffff') {
  const k = ch + size + col; let c = _gl.get(k); if (c) return c;
  const base = size >= 12 ? 12 : 10, sc = Math.max(1, rd(size / base));
  const tmp = mk(base * 2, base * 2), g = tmp.getContext('2d');
  // 用字母基线：12px 字的像素在基线上 10 行、下 2 行；10px 是上 8 下 2
  g.font = `${base}px ${FONT[base]}`; g.textBaseline = 'alphabetic'; g.fillStyle = '#fff';
  const w = Math.max(1, rd(g.measureText(ch).width));
  g.fillText(ch, 0, base - 2);
  const d = g.getImageData(0, 0, w, base).data;
  c = mk(w * sc, base * sc); const o = c.getContext('2d'); o.fillStyle = col;
  for (let j = 0; j < base; j++) for (let i = 0; i < w; i++) if (d[(j * w + i) * 4 + 3] > 110) o.fillRect(i * sc, j * sc, sc, sc);
  c.adv = w * sc; _gl.set(k, c); return c;
}
function textW(s, size = 12, gap = 0) { let w = 0; for (const ch of s) w += glyph(ch, size).adv + gap; return w - gap; }
/* 画一行像素字。o：size、gap（字距）、align（l/c/r）、vert（竖排）、
   times（每个字出现的时刻，配合 t 做逐字出现）、t、pop（出现动画秒数）、shadow（投影色）、alpha */
function ptext(g, s, x, y, col, o = {}) {
  const size = o.size || 12, gap = o.gap ?? 0, chars = [...s];
  const vert = !!o.vert, step = size + (o.lgap ?? 1);
  let cx = rd(x), cy = rd(y);
  if (!vert) { const w = textW(s, size, gap); if (o.align === 'c') cx = rd(x - w / 2); else if (o.align === 'r') cx = rd(x - w); }
  else if (o.align === 'c') cy = rd(y - (chars.length * step) / 2);
  chars.forEach((ch, i) => {
    const gl = glyph(ch, size, col);
    let a = o.alpha ?? 1, dy = 0;
    if (o.times) {
      const t0 = o.times[i]; if (t0 === undefined || o.t < t0) a = 0;
      else { const u = clamp((o.t - t0) / (o.pop ?? .12)); a *= u; dy = u < 1 ? -1 : 0; }
    }
    if (o.n !== undefined && i >= o.n) a = 0;
    if (a > 0) {
      const X = vert ? cx + rd((size - gl.adv) / 2) : cx, Y = cy + dy;
      if (o.shadow) blit(g, glyph(ch, size, o.shadow), X + (o.sdx ?? 1), Y + (o.sdy ?? 1), false, a);
      blit(g, gl, X, Y, false, a);
    }
    if (vert) cy += step; else cx += gl.adv + gap;
  });
}
/* 歌词第 li 句的逐字时刻 */
const L = i => LYR[i];

/* ---------------- 合成 ----------------
   view：1920×900 的成片画面区域。场景用 layer() 一层层往上画。 */
const view = mk(VW, VH), vg = view.getContext('2d');
const lo = mk(AW + PAD * 2, AH + PAD * 2), lg = lo.getContext('2d');
const mid = mk((AW + PAD * 2) * 2, (AH + PAD * 2) * 2), mg = mid.getContext('2d');
lg.imageSmoothingEnabled = false;
/* cam：{x, y} 视口左上角的世界坐标（像素画单位，可带小数）。
   draw(g) 用世界坐标画；par 是视差系数（远景 < 1）。
   o.blur（景深模糊，像素画单位）、o.alpha、o.blend、o.cam（单独的摄像机）、o.shake */
/* cam.k：这个镜头的像素放大倍数（1 → 一个像素 6 屏幕像素；1.5 → 9）。原片每个场景的像素大小也不一样 */
const psz = cam => PX * (cam.k || 1);
function layer(draw, cam, o = {}) {
  const ps = psz(cam), lw = Math.min(lo.width, Math.ceil(VW / ps) + PAD * 2), lh = Math.min(lo.height, Math.ceil(VH / ps) + PAD * 2);
  const par = o.par ?? 1, cx = cam.x * par + (o.dx || 0), cy = cam.y * (o.pary ?? par) + (o.dy || 0);
  const ix = fl(cx), iy = fl(cy), fx = cx - ix, fy = cy - iy;
  lg.setTransform(1, 0, 0, 1, 0, 0);
  lg.clearRect(0, 0, lo.width, lo.height);
  lg.setTransform(1, 0, 0, 1, PAD - ix, PAD - iy);
  draw(lg);
  lg.setTransform(1, 0, 0, 1, 0, 0);
  vg.save();
  if (o.alpha !== undefined) vg.globalAlpha = o.alpha;
  if (o.blend) vg.globalCompositeOperation = o.blend;
  const X = -(PAD + fx) * ps, Y = -(PAD + fy) * ps;
  if (o.blur > 0) {
    mg.setTransform(1, 0, 0, 1, 0, 0); mg.clearRect(0, 0, mid.width, mid.height);
    mg.filter = `blur(${(o.blur * 2).toFixed(2)}px)`; mg.imageSmoothingEnabled = true;
    mg.drawImage(lo, 0, 0, lw, lh, 0, 0, lw * 2, lh * 2); mg.filter = 'none';
    vg.imageSmoothingEnabled = true; vg.imageSmoothingQuality = 'high';
    vg.drawImage(mid, 0, 0, lw * 2, lh * 2, X, Y, lw * ps, lh * ps);
  } else {
    vg.imageSmoothingEnabled = false;
    vg.drawImage(lo, 0, 0, lw, lh, X, Y, lw * ps, lh * ps);
  }
  vg.restore();
}

/* 整个画面的缩放（推拉镜头），以 (ax, ay)（0–1）为锚点；用平滑插值，避免像素闪烁 */
const tmpV = mk(VW, VH), tvg = tmpV.getContext('2d');
function zoomView(z, ax = .5, ay = .5, rot = 0) {
  if (Math.abs(z - 1) < 1e-4 && !rot) return;
  tvg.clearRect(0, 0, VW, VH); tvg.drawImage(view, 0, 0);
  vg.save(); vg.fillStyle = '#000'; vg.fillRect(0, 0, VW, VH);
  vg.imageSmoothingEnabled = true; vg.imageSmoothingQuality = 'high';
  vg.translate(ax * VW, ay * VH); if (rot) vg.rotate(rot); vg.scale(z, z); vg.translate(-ax * VW, -ay * VH);
  vg.drawImage(tmpV, 0, 0); vg.restore();
}

/* 光柱：从画面上方斜着照下来的柔光（screen 叠加）。beams：[{x, w, a, col}]，x/w 是成片像素；ang 为倾斜 */
const sh = mk(480, 225), shg = sh.getContext('2d');
function shafts(beams, ang = .55, soft = 10) {
  shg.setTransform(1, 0, 0, 1, 0, 0); shg.clearRect(0, 0, 480, 225);
  shg.filter = `blur(${soft}px)`;
  for (const b of beams) {
    if (b.a <= 0) continue;
    const x = b.x / 4, w = b.w / 4, dx = Math.tan(ang) * 225;
    const gr = shg.createLinearGradient(0, 0, 0, 225);
    gr.addColorStop(0, rgba(b.col || '#fff2d6', b.a)); gr.addColorStop(b.fade ?? 1, rgba(b.col || '#fff2d6', b.a * (b.end ?? .25)));
    if ((b.fade ?? 1) < 1) gr.addColorStop(1, rgba(b.col || '#fff2d6', 0));
    shg.fillStyle = gr; shg.beginPath();
    shg.moveTo(x, -10); shg.lineTo(x + w, -10); shg.lineTo(x + w + dx, 235); shg.lineTo(x + dx, 235); shg.closePath(); shg.fill();
  }
  shg.filter = 'none';
  vg.save(); vg.globalCompositeOperation = 'screen'; vg.imageSmoothingEnabled = true; vg.drawImage(sh, 0, 0, VW, VH); vg.restore();
}
/* 泛光：缩小、提亮、模糊，再 screen 回去 */
const bl = mk(240, 112), blg = bl.getContext('2d');
function bloom(k = .35, bright = 1.15, rad = 6) {
  if (k <= 0) return;
  blg.clearRect(0, 0, 240, 112);
  blg.filter = `brightness(${bright}) contrast(1.6) blur(${rad}px)`;
  blg.drawImage(view, 0, 0, 240, 112); blg.filter = 'none';
  vg.save(); vg.globalCompositeOperation = 'screen'; vg.globalAlpha = k; vg.imageSmoothingEnabled = true; vg.drawImage(bl, 0, 0, VW, VH); vg.restore();
}
/* 软光点（灯、霓虹的光晕），成片坐标 */
function glow(x, y, r, col, a = .5) {
  if (a <= 0) return;
  const gr = vg.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, rgba(col, a)); gr.addColorStop(.4, rgba(col, a * .35)); gr.addColorStop(1, rgba(col, 0));
  vg.save(); vg.globalCompositeOperation = 'screen'; vg.fillStyle = gr; vg.fillRect(x - r, y - r, 2 * r, 2 * r); vg.restore();
}
/* 色调：整体叠一层颜色 */
function grade(col, a, mode = 'soft-light') { if (a <= 0) return; vg.save(); vg.globalCompositeOperation = mode; vg.globalAlpha = a; vg.fillStyle = col; vg.fillRect(0, 0, VW, VH); vg.restore(); }
function vignette(a = .45, inner = .45) {
  const gr = vg.createRadialGradient(VW / 2, VH / 2, VH * inner, VW / 2, VH / 2, VW * .62);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(8,6,14,${a})`);
  vg.fillStyle = gr; vg.fillRect(0, 0, VW, VH);
}
/* 胶片颗粒：预先算好 6 张噪点，每秒换 12 次 */
const GR = [];
(function () {
  for (let k = 0; k < 6; k++) {
    const c = mk(640, 300), g = c.getContext('2d'), id = g.createImageData(640, 300), r = R(77 + k);
    for (let i = 0; i < id.data.length; i += 4) { const v = 128 + (r() + r() + r() - 1.5) * 90; id.data[i] = id.data[i + 1] = id.data[i + 2] = v; id.data[i + 3] = 255; }
    g.putImageData(id, 0, 0); GR.push(c);
  }
})();
function grain(T, a = .06) {
  const c = GR[fl(T * 12) % GR.length];
  vg.save(); vg.globalCompositeOperation = 'overlay'; vg.globalAlpha = a; vg.imageSmoothingEnabled = true; vg.drawImage(c, 0, 0, VW, VH); vg.restore();
}
/* 浮尘：慢慢飘的小光点（成片坐标），dir 是整体漂移方向 */
function dust(t, n, seed, o = {}) {
  const r = R(seed), col = o.col || '#fff4dc', a0 = o.a ?? .5, x0 = o.x0 ?? 0, x1 = o.x1 ?? VW, y0 = o.y0 ?? 0, y1 = o.y1 ?? VH;
  vg.save(); vg.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const bx = r(), by = r(), sp = .3 + r() * .7, sz = 2 + r() * (o.big ?? 5), ph = r() * 100;
    const x = x0 + ((bx * (x1 - x0) + t * (o.vx ?? 14) * sp + Math.sin(t * .5 + ph) * 30) % (x1 - x0) + (x1 - x0)) % (x1 - x0);
    const y = y0 + ((by * (y1 - y0) + t * (o.vy ?? -8) * sp + Math.cos(t * .4 + ph) * 20) % (y1 - y0) + (y1 - y0)) % (y1 - y0);
    const tw = .5 + .5 * Math.sin(t * (1 + r() * 2) + ph);
    const a = a0 * tw;
    if (a < .02) continue;
    const gr = vg.createRadialGradient(x, y, 0, x, y, sz * 2);
    gr.addColorStop(0, rgba(col, a)); gr.addColorStop(.35, rgba(col, a * .5)); gr.addColorStop(1, rgba(col, 0));
    vg.fillStyle = gr; vg.fillRect(x - sz * 2, y - sz * 2, sz * 4, sz * 4);
  }
  vg.restore();
}
/* LED 点阵：把成片上一块区域盖上一层"灯珠"网格（灯珠之间是暗缝） */
const ledPat = (() => { const c = mk(PX, PX), g = c.getContext('2d'); g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, PX, PX); g.clearRect(1, 1, PX - 2, PX - 2); g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(1, 1, 1, 1); g.fillRect(PX - 2, 1, 1, 1); g.fillRect(1, PX - 2, 1, 1); g.fillRect(PX - 2, PX - 2, 1, 1); return c; })();
function ledGrid(cam, x, y, w, h) {
  const ps = psz(cam), X = (x - cam.x) * ps, Y = (y - cam.y) * ps;
  vg.save(); vg.beginPath(); vg.rect(X, Y, w * ps, h * ps); vg.clip();
  vg.fillStyle = vg.createPattern(ledPat, 'repeat');
  vg.translate(X, Y); vg.scale(ps / PX, ps / PX); vg.fillRect(0, 0, w * PX, h * PX); vg.restore();
}
/* 世界坐标 → 成片坐标 */
const sx = (cam, x) => (x - cam.x) * psz(cam), sy = (cam, y) => (y - cam.y) * psz(cam);
