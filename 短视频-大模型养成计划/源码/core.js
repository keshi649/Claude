/* 《大模型养成计划》画面核心：时间轴、缓动、像素画工具、精灵缓存、文字、HUD、字幕、对话框。
   画面分两层：
     - 低分辨率层 LO（270×480），所有像素画都画在这里，最后放大 4 倍贴到主画布，像素才是方的；
     - 高分辨率层（1080×1920 主画布），画文字、UI 面板、字幕。
   所有函数只依赖时间 t，同一个 t 永远画出同一张图。 */
const W = 1080, H = 1920, S = 4, LW = W / S, LH = H / S;
const CANVAS = document.getElementById('c');
const MAIN = CANVAS.getContext('2d');
const LO = document.createElement('canvas'); LO.width = LW; LO.height = LH;
const LC = LO.getContext('2d');
LC.imageSmoothingEnabled = false; MAIN.imageSmoothingEnabled = false;
let p = LC;      // 当前像素画布
let g = MAIN;    // 当前高清画布
const SCENES = {};   // 由 scenes*.js 填入：name -> { lo(t, lt), hi(t, lt), cam(t, lt) }

const TL = window.TIMELINE;
const LINE = {}; TL.lines.forEach(l => { LINE[l.id] = l; });
const SCN = {}; TL.scenes.forEach(s => { SCN[s.name] = s; });
const CUE = {}; TL.cues.forEach(c => { CUE[c.name] = c.t; });
const T = id => LINE[id].t0;
const TE = id => LINE[id].t1;

// ---------------- 数学与缓动 ----------------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  out: u => 1 - (1 - u) ** 3,
  in: u => u * u * u,
  inOut: u => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2),
  sine: u => -(Math.cos(Math.PI * u) - 1) / 2,
  back: u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * (u - 1) ** 3 + c1 * (u - 1) ** 2; },
  elastic: u => (u === 0 || u === 1) ? u : 2 ** (-10 * u) * Math.sin((u * 10 - 0.75) * (2 * Math.PI) / 3) + 1,
};
const vis = (t, a, b, d = 0.25) => E.sine(seg(t, a, a + d)) * (1 - E.sine(seg(t, b, b + d)));
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
const step = (t, fps) => Math.floor(t * fps) / fps;        // 像素动画用的低帧率时间
const pop = (t, a, d = 0.3) => E.back(seg(t, a, a + d));      // 弹出缩放

// ---------------- 调色板 ----------------
const PAL = {
  ink: '#140f26', night: '#1b1530', night2: '#2a2147', night3: '#3d3166', night4: '#5a4a8a',
  cream: '#f6e8c8', cream2: '#e2cfa4', white: '#ffffff', paper: '#fbf5e6',
  wood: '#5a3524', wood2: '#7a4a30', wood3: '#9b6440', wood0: '#3a2118',
  teal: '#3fe0c8', teal2: '#22a896', pink: '#ff7aa8', pink2: '#d9487a',
  orange: '#ffb53b', orange2: '#e07b22', red: '#ef4655', red2: '#a82634',
  green: '#5fe36a', green2: '#2e9e4f', dgreen: '#39ff88', blue: '#4f7cff', blue2: '#2f4fc0',
  yellow: '#ffe066', gray: '#8b86a6', gray2: '#5d5878', sky: '#7fd0ff',
};

// ---------------- 像素画工具（画在 p 上，坐标是低分辨率像素） ----------------
function R(x, y, w, h, c) { if (c) p.fillStyle = c; p.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); }
function P(x, y, c) { R(x, y, 1, 1, c); }
function ell(cx, cy, rx, ry, c) {
  p.fillStyle = c;
  const y0 = Math.ceil(cy - ry), y1 = Math.floor(cy + ry);
  for (let y = y0; y <= y1; y++) {
    const dy = (y + 0.5 - cy) / (ry + 0.5);
    if (Math.abs(dy) > 1) continue;
    const hw = (rx + 0.5) * Math.sqrt(1 - dy * dy);
    const a = Math.round(cx - hw), b = Math.round(cx + hw);
    if (b > a) p.fillRect(a, y, b - a, 1);
  }
}
const circ = (cx, cy, r, c) => ell(cx, cy, r, r, c);
function rrect(x, y, w, h, r, c) {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  p.fillStyle = c;
  for (let i = 0; i < h; i++) {
    let inset = 0;
    if (i < r) inset = r - Math.round(Math.sqrt(r * r - (r - i - 0.5) ** 2));
    else if (i >= h - r) inset = r - Math.round(Math.sqrt(r * r - (i - (h - r) + 0.5) ** 2));
    p.fillRect(x + inset, y + i, w - inset * 2, 1);
  }
}
function line(x0, y0, x1, y1, c) {
  x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
  p.fillStyle = c;
  const dx = Math.abs(x1 - x0), sx = x0 < x1 ? 1 : -1, dy = -Math.abs(y1 - y0), sy = y0 < y1 ? 1 : -1;
  let err = dx + dy;
  for (let n = 0; n < 2000; n++) {
    p.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err;
    if (e2 >= dy) { err += dy; x0 += sx; }
    if (e2 <= dx) { err += dx; y0 += sy; }
  }
}
function poly(pts, c) {     // 扫描线填充多边形
  p.fillStyle = c;
  let y0 = Infinity, y1 = -Infinity;
  pts.forEach(([, y]) => { y0 = Math.min(y0, y); y1 = Math.max(y1, y); });
  for (let y = Math.floor(y0); y <= Math.ceil(y1); y++) {
    const yc = y + 0.5, xs = [];
    for (let i = 0; i < pts.length; i++) {
      const [ax, ay] = pts[i], [bx, by] = pts[(i + 1) % pts.length];
      if ((ay <= yc && by > yc) || (by <= yc && ay > yc)) xs.push(ax + (yc - ay) / (by - ay) * (bx - ax));
    }
    xs.sort((a, b) => a - b);
    for (let i = 0; i + 1 < xs.length; i += 2) {
      const a = Math.round(xs[i]), b = Math.round(xs[i + 1]);
      if (b > a) p.fillRect(a, y, b - a, 1);
    }
  }
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
/* 竖直方向抖动渐变：从 c1 过渡到 c2（像素风的渐变） */
function vgrad(x, y, w, h, c1, c2) {
  R(x, y, w, h, c1);
  p.fillStyle = c2;
  for (let j = 0; j < h; j++) {
    const u = j / Math.max(1, h - 1);
    for (let i = 0; i < w; i++) {
      if (BAYER[((y + j) & 3) * 4 + ((x + i) & 3)] / 16 < u) p.fillRect(x + i, y + j, 1, 1);
    }
  }
}
function dither(x, y, w, h, c, level) {   // level 0..1：按 Bayer 矩阵稀疏点
  p.fillStyle = c;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
    if (BAYER[((y + j) & 3) * 4 + ((x + i) & 3)] / 16 < level) p.fillRect(x + i, y + j, 1, 1);
  }
}
function stars(t, seed, n, y0, y1, c = '#fff') {
  for (let i = 0; i < n; i++) {
    const x = Math.floor(hash(seed + i) * LW), y = Math.floor(lerp(y0, y1, hash(seed + i * 7.3)));
    const tw = Math.sin(t * (1 + hash(i) * 3) + i) > 0.6;
    P(x, y, tw ? c : PAL.night4);
  }
}

// ---------------- 精灵缓存 ----------------
const SPR = {};
/* 画一个精灵到独立小画布，自动加 1 像素描边；同一个 key 只画一次 */
function sprite(key, w, h, draw, outline = PAL.ink) {
  if (SPR[key]) return SPR[key];
  const c = document.createElement('canvas'); c.width = w + 2; c.height = h + 2;
  const cx = c.getContext('2d'); cx.imageSmoothingEnabled = false;
  const old = p; p = cx; p.save(); p.translate(1, 1); draw(); p.restore(); p = old;
  let out = c;
  if (outline) {
    const s = document.createElement('canvas'); s.width = c.width; s.height = c.height;
    const sx = s.getContext('2d'); sx.drawImage(c, 0, 0); sx.globalCompositeOperation = 'source-in';
    sx.fillStyle = outline; sx.fillRect(0, 0, s.width, s.height);
    out = document.createElement('canvas'); out.width = c.width; out.height = c.height;
    const ox = out.getContext('2d');
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dx, dy]) => ox.drawImage(s, dx, dy));
    ox.drawImage(c, 0, 0);
  }
  SPR[key] = out;
  return out;
}
/* 把精灵画到当前像素画布；ax, ay 是锚点（0..1），flip 水平翻转 */
function put(img, x, y, o = {}) {
  const ax = o.ax === undefined ? 0.5 : o.ax, ay = o.ay === undefined ? 1 : o.ay;
  const sc = o.scale || 1;
  p.save();
  if (o.alpha !== undefined) p.globalAlpha *= o.alpha;
  const dx = Math.round(x - img.width * sc * ax), dy = Math.round(y - img.height * sc * ay);
  if (o.flip) { p.translate(dx + img.width * sc, dy); p.scale(-1, 1); p.drawImage(img, 0, 0, img.width * sc, img.height * sc); }
  else p.drawImage(img, dx, dy, img.width * sc, img.height * sc);
  p.restore();
}
/* 精灵整体染色（调试模式的绿色线框用） */
const TINT = {};
function tinted(img, key, color) {
  const k = key + '|' + color;
  if (TINT[k]) return TINT[k];
  const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
  const x = c.getContext('2d'); x.drawImage(img, 0, 0); x.globalCompositeOperation = 'source-in';
  x.fillStyle = color; x.fillRect(0, 0, c.width, c.height);
  TINT[k] = c; return c;
}
/* 只留轮廓的线框版本 */
function wire(img, key, color) {
  const k = 'wire|' + key + '|' + color;
  if (TINT[k]) return TINT[k];
  const w = img.width, h = img.height;
  const src = img.getContext ? img.getContext('2d') : null;
  const tmp = document.createElement('canvas'); tmp.width = w; tmp.height = h;
  const tx = tmp.getContext('2d'); tx.drawImage(img, 0, 0);
  const d = tx.getImageData(0, 0, w, h).data;
  const out = document.createElement('canvas'); out.width = w; out.height = h;
  const ox = out.getContext('2d'); const od = ox.createImageData(w, h);
  const hex = color.replace('#', ''); const cr = parseInt(hex.slice(0, 2), 16), cg = parseInt(hex.slice(2, 4), 16), cb = parseInt(hex.slice(4, 6), 16);
  const lum = i => d[i] * 0.3 + d[i + 1] * 0.59 + d[i + 2] * 0.11;
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const i = (y * w + x) * 4;
    if (d[i + 3] < 128) continue;
    const L = lum(i);
    let edge = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
      const xx = x + dx, yy = y + dy;
      if (xx < 0 || yy < 0 || xx >= w || yy >= h) { edge = true; break; }
      const j = (yy * w + xx) * 4;
      if (d[j + 3] < 128 || Math.abs(lum(j) - L) > 40) { edge = true; break; }
    }
    if (edge) { od.data[i] = cr; od.data[i + 1] = cg; od.data[i + 2] = cb; od.data[i + 3] = 255; }
    else { od.data[i] = cr * 0.12; od.data[i + 1] = cg * 0.18; od.data[i + 2] = cb * 0.12; od.data[i + 3] = 200; }
  }
  ox.putImageData(od, 0, 0);
  TINT[k] = out; return out;
}

// ---------------- 文字（高清层） ----------------
const FONTS = {
  pix: s => `${s}px Pix`,          // 像素字体：12 的倍数最清楚
  blk: s => `${s}px NBlack`,       // 思源黑体 Black：字幕、大标题
  bold: s => `${s}px NBold`,
};
function textW(s, f, size) { g.font = FONTS[f](size); return g.measureText(s).width; }
/* o: f, size, color, align, base, alpha, stroke, sw（描边宽）, shadow（像素投影偏移）, shadowColor */
function text(s, x, y, o = {}) {
  const a = o.alpha === undefined ? 1 : o.alpha;
  if (a <= 0.003) return;
  g.save();
  g.globalAlpha *= a;
  g.font = FONTS[o.f || 'pix'](o.size || 36);
  g.textAlign = o.align || 'left';
  g.textBaseline = o.base || 'alphabetic';
  if (o.shadow) { g.fillStyle = o.shadowColor || PAL.ink; g.fillText(s, x + o.shadow, y + o.shadow); }
  if (o.stroke) {
    g.lineJoin = 'round'; g.lineWidth = o.sw || 8; g.strokeStyle = o.stroke; g.strokeText(s, x, y);
  }
  g.fillStyle = o.color || PAL.cream;
  g.fillText(s, x, y);
  g.restore();
}
/* 富文本：{…} 高亮 */
function rich(s) {
  const out = []; let hi = false;
  for (const ch of s) {
    if (ch === '{') { hi = true; continue; }
    if (ch === '}') { hi = false; continue; }
    out.push({ ch, hi });
  }
  return out;
}
/* 按宽度折行（中文逐字、英文单词不拆） */
function wrapRich(chars, f, size, maxW) {
  g.font = FONTS[f](size);
  const lines = [[]]; let w = 0;
  const tokens = [];
  for (let i = 0; i < chars.length;) {
    if (/[A-Za-z0-9.]/.test(chars[i].ch)) {
      let j = i; while (j < chars.length && /[A-Za-z0-9.]/.test(chars[j].ch)) j++;
      tokens.push(chars.slice(i, j)); i = j;
    } else { tokens.push([chars[i]]); i++; }
  }
  for (const tk of tokens) {
    const tw = g.measureText(tk.map(c => c.ch).join('')).width;
    const punct = tk.length === 1 && /[，。！？、：；…）》”]/.test(tk[0].ch);
    if (w + tw > maxW && lines[lines.length - 1].length && !punct) { lines.push([]); w = 0; }
    if (!(lines[lines.length - 1].length === 0 && tk[0].ch === ' ')) { lines[lines.length - 1].push(...tk); w += tw; }
  }
  return lines;
}
/* 折成行数最少、各行长度尽量相等 */
function wrapBalanced(chars, f, size, maxW) {
  let rows = wrapRich(chars, f, size, maxW);
  if (rows.length < 2) return rows;
  g.font = FONTS[f](size);
  const total = g.measureText(chars.map(c => c.ch).join('')).width;
  if (rows.length === 2) {     // 两行时优先在标点后断开
    let best = null;
    chars.forEach((c, i) => {
      if (!/[，。：；？！、]/.test(c.ch) || i === chars.length - 1) return;
      const w1 = g.measureText(chars.slice(0, i + 1).map(c => c.ch).join('')).width;
      if (w1 > maxW || total - w1 > maxW) return;
      const d = Math.abs(w1 - total / 2);
      if (d < total * 0.3 && (!best || d < best.d)) best = { i, d };
    });
    if (best) return [chars.slice(0, best.i + 1), chars.slice(best.i + 1)];
  }
  for (let w = total / rows.length; w <= maxW; w += size * 0.5) {
    const r = wrapRich(chars, f, size, w);
    if (r.length === rows.length) return r;
  }
  return rows;
}
function drawRichLine(chars, x, y, o) {
  g.font = FONTS[o.f](o.size);
  const s = chars.map(c => c.ch).join('');
  let w = g.measureText(s).width;
  let cx = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  // 先整体描边，再逐段填色
  if (o.stroke) {
    g.save(); g.lineJoin = 'round'; g.lineWidth = o.sw; g.strokeStyle = o.stroke; g.textAlign = 'left';
    g.strokeText(s, cx, y); g.restore();
  }
  g.textAlign = 'left';
  for (const c of chars) {
    g.fillStyle = c.hi ? o.hi : o.color;
    g.fillText(c.ch, cx, y);
    cx += g.measureText(c.ch).width;
  }
}

// ---------------- 高清 UI 面板（4 像素对齐，配合像素风） ----------------
function panel(x, y, w, h, o = {}) {
  x = Math.round(x / 4) * 4; y = Math.round(y / 4) * 4; w = Math.round(w / 4) * 4; h = Math.round(h / 4) * 4;
  g.save();
  if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  const b = o.border || PAL.cream, bg = o.bg || '#211a40';
  g.fillStyle = PAL.ink; g.fillRect(x - 4, y + 4, w + 8, h + 4);                 // 投影
  g.fillStyle = PAL.ink; g.fillRect(x - 4, y - 4, w + 8, h + 8);                 // 外框黑边
  g.fillStyle = b; g.fillRect(x, y, w, h);
  g.fillStyle = bg; g.fillRect(x + 8, y + 8, w - 16, h - 16);
  if (o.inner !== false) { g.fillStyle = 'rgba(255,255,255,0.06)'; g.fillRect(x + 8, y + 8, w - 16, 8); }
  // 四角缺口，像素按钮的感觉
  g.fillStyle = PAL.ink;
  [[x - 4, y - 4], [x + w, y - 4], [x - 4, y + h], [x + w, y + h]].forEach(([a, c]) => g.fillRect(a, c, 4, 4));
  g.restore();
}
function tag(s, x, y, o = {}) {      // 小标签：彩底 + 白字
  const size = o.size || 36;
  g.font = FONTS.pix(size);
  const w = g.measureText(s).width + size * 0.9, h = size * 1.5;
  const ax = o.align === 'center' ? x - w / 2 : o.align === 'right' ? x - w : x;
  g.save();
  if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  g.fillStyle = PAL.ink; g.fillRect(ax - 4, y - 4, w + 8, h + 8);
  g.fillStyle = o.bg || PAL.red; g.fillRect(ax, y, w, h);
  g.fillStyle = 'rgba(255,255,255,0.18)'; g.fillRect(ax, y, w, 4);
  g.restore();
  text(s, ax + w / 2, y + h * 0.5 + size * 0.36, { size, align: 'center', color: o.color || PAL.white, alpha: o.alpha });
  return w;
}

// ---------------- 字幕（旁白） ----------------
const SUB = { y: 1500, size: 62, maxW: 940 };
function drawSubs(t) {
  const ls = TL.lines.filter(l => l.spk === 'N' && t >= l.t0 - 0.08 && t < l.t1 + 0.3);
  if (!ls.length) return;
  const l = ls[ls.length - 1];
  const a = seg(t, l.t0 - 0.08, l.t0 + 0.06) * (1 - seg(t, l.t1 + 0.15, l.t1 + 0.3));
  const k = 0.9 + 0.1 * E.back(seg(t, l.t0 - 0.08, l.t0 + 0.16));
  const rows = wrapBalanced(rich(l.text), 'blk', SUB.size, SUB.maxW);
  g.save();
  g.globalAlpha = a;
  g.translate(W / 2, SUB.y); g.scale(k, k);
  const lh = SUB.size * 1.32, y0 = -(rows.length - 1) * lh / 2;
  rows.forEach((r, i) => drawRichLine(r, 0, y0 + i * lh + SUB.size * 0.36, {
    f: 'blk', size: SUB.size, align: 'center', color: '#ffffff', hi: '#ffc53d', stroke: '#1a1030', sw: 14,
  }));
  g.restore();
}

// ---------------- 打字机 ----------------
function typed(s, t, t0, t1) {
  const chars = [...s];
  const n = Math.floor(chars.length * seg(t, t0, t0 + Math.max(0.3, (t1 - t0) * 0.85)) + 0.0001);
  return chars.slice(0, n).join('');
}
/* 某个说话人此刻是否在说话（用来让嘴巴开合） */
function talking(spk, t) {
  const l = TL.lines.find(l => l.spk === spk && l.voice && t >= l.t0 && t < l.t1);
  if (!l) return false;
  return Math.sin((t - l.t0) * 26) > -0.2;
}

// ---------------- 对话框（游戏式：头像 + 名牌 + 打字） ----------------
/* who: 'U' | 'M'；id: 台词编号；y: 框的顶边 */
function dialog(id, t, o = {}) {
  const l = LINE[id];
  const a = (o.alpha === undefined ? 1 : o.alpha) * seg(t, l.t0 - 0.15, l.t0);
  if (a <= 0) return;
  const y = o.y || 1110, x = 48, w = W - 96, h = o.h || 200;
  const isM = l.spk === 'M';
  const name = isM ? '小模' : '你';
  const nameBg = isM ? PAL.teal2 : PAL.orange2;
  g.save(); g.globalAlpha *= a;
  // 头像框
  const px = isM ? x : x + w - 176, py = y - 168;
  panel(px, py, 176, 176, { bg: isM ? '#2b4f6e' : '#5a3a2a' });
  g.restore();
  g.save(); g.globalAlpha *= a;
  const portrait = isM ? xiaomoPortrait(talking('M', t) ? 'talk' : (o.expr || 'normal')) : youPortrait(talking('U', t));
  g.imageSmoothingEnabled = false;
  g.drawImage(portrait, px + 16, py + 16, 144, 144);
  panel(x, y, w, h, {});
  tag(name, isM ? x + 196 : x + w - 196, y - 52, { bg: nameBg, align: isM ? 'left' : 'right', size: 36 });
  const s = o.full ? l.text : typed(l.text, t, l.t0, l.t1);
  const rows = wrapRich(rich(s), 'pix', 48, w - 72);
  rows.forEach((r, i) => drawRichLine(r, x + 36, y + 76 + i * 64, { f: 'pix', size: 48, color: PAL.cream, hi: PAL.orange }));
  if (seg(t, l.t1, l.t1 + 0.1) > 0 && Math.floor(t * 3) % 2 === 0) {
    g.fillStyle = PAL.cream; g.beginPath();
    g.moveTo(x + w - 52, y + h - 40); g.lineTo(x + w - 28, y + h - 40); g.lineTo(x + w - 40, y + h - 28); g.fill();
  }
  g.restore();
}

// ---------------- HUD（顶栏 + 属性面板） ----------------
const HUD = { show: 0, day: '', clock: '', token: '', title: '大模型养成计划', debug: false };
function drawHUD(t) {
  if (HUD.show <= 0.01) return;
  g.save(); g.globalAlpha *= HUD.show;
  const y = 120;
  g.fillStyle = HUD.debug ? 'rgba(0,30,10,0.85)' : 'rgba(20,15,38,0.88)';
  g.fillRect(0, y, W, 72);
  g.fillStyle = HUD.debug ? PAL.dgreen : PAL.night4; g.fillRect(0, y + 72, W, 4);
  // 左：游戏名 + 天数
  if (HUD.debug) {
    g.fillStyle = PAL.red; g.fillRect(28, y + 24, 24, 24);
    text('DEBUG', 66, y + 50, { size: 36, color: PAL.dgreen });
    text(HUD.title, 210, y + 50, { size: 36, color: PAL.dgreen });
  } else {
    g.fillStyle = PAL.teal; g.fillRect(28, y + 22, 8, 28); g.fillRect(36, y + 18, 8, 8); g.fillRect(44, y + 22, 8, 28);
    text(HUD.title, 68, y + 50, { size: 36, color: PAL.cream });
    text(HUD.day, 400, y + 50, { size: 36, color: PAL.sky });
    text(HUD.clock, 560, y + 50, { size: 36, color: PAL.gray });
  }
  // 右：TOKEN
  const cx = 700;
  g.fillStyle = PAL.orange; g.fillRect(cx, y + 24, 24, 24); g.fillStyle = PAL.yellow; g.fillRect(cx + 4, y + 28, 12, 8);
  text('TOKEN', cx + 36, y + 50, { size: 36, color: HUD.debug ? PAL.dgreen : PAL.cream });
  text(HUD.token, W - 28, y + 50, { size: 36, color: HUD.debug ? PAL.dgreen : PAL.yellow, align: 'right' });
  g.restore();
}
/* 属性面板：stats = [[名字, 值0..100, 颜色], ...]，pops = [[行号, '+50', t0]] */
function statPanel(t, stats, o = {}) {
  const a = o.alpha === undefined ? 1 : o.alpha;
  if (a <= 0.01) return;
  const x = o.x || 40, y = o.y || 220, w = 330, rowH = 52;
  g.save(); g.globalAlpha *= a;
  panel(x, y, w, 32 + stats.length * rowH, { bg: 'rgba(33,26,64,0.92)' });
  stats.forEach(([name, v, col], i) => {
    const yy = y + 28 + i * rowH;
    text(name, x + 24, yy + 30, { size: 36, color: PAL.cream });
    const bx = x + 120, bw = 176;
    g.fillStyle = PAL.ink; g.fillRect(bx, yy + 8, bw, 28);
    g.fillStyle = '#3a3360'; g.fillRect(bx + 4, yy + 12, bw - 8, 20);
    const fw = Math.round((bw - 8) * clamp(v / 100) / 4) * 4;
    g.fillStyle = col; g.fillRect(bx + 4, yy + 12, fw, 20);
    g.fillStyle = 'rgba(255,255,255,0.35)'; g.fillRect(bx + 4, yy + 12, fw, 4);
  });
  (o.pops || []).forEach(([i, s, t0, col]) => {
    const u = seg(t, t0, t0 + 1.4);
    if (u <= 0 || u >= 1) return;
    text(s, x + w + 16, y + 28 + i * rowH + 34 - u * 30, { size: 48, color: col || PAL.yellow, alpha: 1 - seg(u, 0.6, 1), shadow: 4 });
  });
  g.restore();
}

// ---------------- 红色印章 ----------------
function stamp(s, x, y, t, t0, o = {}) {
  if (t < t0) return;
  const u = seg(t, t0, t0 + 0.22);
  const k = lerp(2.4, 1, E.out(u));
  const size = o.size || 96;
  g.save();
  g.translate(x, y); g.rotate((o.rot === undefined ? -8 : o.rot) * Math.PI / 180); g.scale(k, k);
  g.globalAlpha *= u * (o.alpha === undefined ? 1 : o.alpha);
  g.font = FONTS.blk(size);
  const lines = s.split('\n');
  const tw = Math.max(...lines.map(l => g.measureText(l).width)) + size * 0.7;
  const th = size * 1.25 * lines.length + size * 0.35;
  g.strokeStyle = o.color || PAL.red; g.lineWidth = size * 0.1;
  g.strokeRect(-tw / 2, -th / 2, tw, th);
  g.lineWidth = size * 0.04; g.strokeRect(-tw / 2 + size * 0.12, -th / 2 + size * 0.12, tw - size * 0.24, th - size * 0.24);
  g.fillStyle = o.color || PAL.red; g.textAlign = 'center'; g.textBaseline = 'middle';
  lines.forEach((l, i) => g.fillText(l, 0, (i - (lines.length - 1) / 2) * size * 1.25 + size * 0.04));
  g.restore();
}

// ---------------- 大标题卡（「第一课 · 预训练」） ----------------
function lessonCard(t, t0, t1, big, small, col = PAL.teal) {
  const a = vis(t, t0, t1, 0.2);
  if (a <= 0) return;
  const u = E.back(seg(t, t0, t0 + 0.35));
  g.save();
  g.globalAlpha *= a;
  const y = 330;
  g.translate(W / 2, y); g.scale(1, u);
  g.fillStyle = PAL.ink; g.fillRect(-W / 2, -84, W, 168);
  g.fillStyle = col; g.fillRect(-W / 2, -76, W, 152);
  g.fillStyle = 'rgba(0,0,0,0.18)';
  for (let i = -W / 2; i < W / 2; i += 32) g.fillRect(i + ((t * 60) % 32), -76, 12, 152);
  text(small, 0, -18, { size: 36, align: 'center', color: PAL.ink });
  text(big, 0, 52, { f: 'blk', size: 72, align: 'center', color: '#fff', stroke: PAL.ink, sw: 10 });
  g.restore();
}

// ---------------- 杂项 ----------------
function watermark(t, a) {
  if (a <= 0) return;
  text('甜菜', W - 40, H - 56, { size: 36, color: PAL.cream, align: 'right', alpha: 0.55 * a });
}
function scanlines(alpha = 0.08) {
  g.save(); g.fillStyle = `rgba(0,0,0,${alpha})`;
  for (let y = 0; y < H; y += 8) g.fillRect(0, y, W, 4);
  g.restore();
}
function vignette() {
  const gr = g.createRadialGradient(W / 2, H * 0.45, H * 0.35, W / 2, H * 0.45, H * 0.8);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,0.45)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
