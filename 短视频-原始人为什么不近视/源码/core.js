'use strict';
/* 《原始人为什么不近视？》—— 程序化像素风短视频。frame(t) 按时间 t（秒）确定性地画出一帧。
   core.js：工具函数、时间轴、像素缓冲、像素字、游戏界面组件、字幕。 */
const W = 1080, H = 1920;
const TL = window.TIMELINE, DURATION = TL.duration;
const LN = {}; TL.lines.forEach(l => { LN[l.id] = l; });
const S = id => LN[id].v0;                 // 这句开口的时刻（对话框：弹出的时刻）
const EN = id => LN[id].v1;                // 这句说完的时刻（对话框：消失的时刻）
const CK = (id, k) => LN[id].chunks[k][0]; // 第 k 段字幕开始的时刻
const MK = (id, k = 0) => LN[id].marks[k]; // 文本里 ^ 标记的时刻
const TY = id => LN[id].typed;             // 对话框文字打完的时刻

const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const sceneCv = mk(), layerCv = mk(), tmpCv = mk();
const sceneG = sceneCv.getContext('2d'), layerG = layerCv.getContext('2d'), tmpG = tmpCv.getContext('2d');

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
  el: u => u === 0 ? 0 : u === 1 ? 1 : Math.pow(2, -10 * u) * Math.sin((u * 10 - .75) * (TAU / 3)) + 1,
  bounce: u => { const n = 7.5625, d = 2.75; if (u < 1 / d) return n * u * u; if (u < 2 / d) return n * (u -= 1.5 / d) * u + .75; if (u < 2.5 / d) return n * (u -= 2.25 / d) * u + .9375; return n * (u -= 2.625 / d) * u + .984375; },
};
/* 在 [a,b] 内为 1，前后各用 fi / fo 秒淡入淡出 */
function win(t, a, b, fi = .3, fo = .3) { if (t < a || t > b) return 0; return Math.min(fi > 0 ? clamp((t - a) / fi) : 1, fo > 0 ? clamp((b - t) / fo) : 1); }
/* 弹出：0→1，带回弹 */
const pop = (t, a, d = .35) => t < a ? 0 : E.back(clamp((t - a) / d));
/* 阶梯化：像素动画按 fps 步进，显得更"游戏" */
const step = (t, fps = 8) => Math.floor(t * fps) / fps;
function R(seed) { let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(a, b = 0, c = 0) { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function shake(t, t0, amp, dur = .5, f = 31) { if (t < t0 || t > t0 + dur) return [0, 0]; const k = 1 - (t - t0) / dur; return [Math.round(Math.sin((t - t0) * f * 6.3) * amp * k * k), Math.round(Math.cos((t - t0) * f * 5.1) * amp * k * k)]; }
function withAlpha(g, a, fn) { if (a <= .001) return; g.save(); g.globalAlpha *= a; fn(); g.restore(); }
/* 先把一组东西画到离屏层，再整体半透明贴上（避免叠加处变深） */
function layer(g, alpha, fn) {
  if (alpha <= .001) return;
  if (alpha >= .999) { fn(g); return; }
  layerG.setTransform(1, 0, 0, 1, 0, 0); layerG.globalAlpha = 1; layerG.clearRect(0, 0, W, H);
  fn(layerG);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = alpha; g.drawImage(layerCv, 0, 0); g.restore();
}
/* 数字加千分位 */
const fmt = n => Math.round(n).toLocaleString('en-US');

/* ---------------- 调色板 ---------------- */
const C = {
  ink: '#1B1730', ink2: '#2B2547', cream: '#FFF4DF', paper: '#F4E9D8', amber: '#FFB547', gold: '#FFD34E',
  red: '#FF5A4F', green: '#5BE37D', blue: '#5EC8FF', dbg: '#57F287', dbgDim: 'rgba(87,242,135,.35)',
  clawd: '#CB7C5E', eye: '#171312', white: '#FFFFFF',
};

/* ---------------- 像素缓冲：世界按"像素"画在小画布上，再最近邻放大 ---------------- */
const BUF = {};
/* 取一块 w×h 的像素缓冲（按名字复用），清空后返回 2D 上下文 */
function pbuf(name, w, h) {
  let b = BUF[name];
  if (!b || b.width !== w || b.height !== h) { b = BUF[name] = mk(w, h); }
  const g = b.getContext('2d'); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.imageSmoothingEnabled = false; g.clearRect(0, 0, w, h);
  return g;
}
/* 把像素缓冲贴到屏幕：每个世界像素放大成 P 个屏幕像素；cam 为视野左上角（世界坐标，可带小数） */
function blit(g, name, P, camX = 0, camY = 0, dx = 0, dy = 0) {
  const b = BUF[name]; g.save(); g.imageSmoothingEnabled = false;
  const sx = Math.floor(camX), sy = Math.floor(camY), fx = (camX - sx) * P, fy = (camY - sy) * P;
  const sw = Math.min(b.width - sx, Math.ceil(W / P) + 2), sh = Math.min(b.height - sy, Math.ceil(H / P) + 2);
  g.drawImage(b, sx, sy, sw, sh, dx - fx, dy - fy, sw * P, sh * P);
  g.restore();
}
/* 静态背景缓存：同名只画一次 */
const CACHE = {};
function cached(name, w, h, fn) { if (!CACHE[name]) { const c = mk(w, h), g = c.getContext('2d'); g.imageSmoothingEnabled = false; fn(g, c); CACHE[name] = c; } return CACHE[name]; }

/* 像素图元（坐标全部取整，保证落在像素格上） */
const ri = Math.round;
function prect(g, x, y, w, h, c) { g.fillStyle = c; g.fillRect(ri(x), ri(y), ri(w), ri(h)); }
function pdot(g, x, y, c) { g.fillStyle = c; g.fillRect(ri(x), ri(y), 1, 1); }
function pdisc(g, cx, cy, r, c) {
  g.fillStyle = c; cx = ri(cx); cy = ri(cy);
  for (let dy = -r; dy <= r; dy++) { const dx = Math.floor(Math.sqrt(Math.max(0, r * r - dy * dy)) + .35); g.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1); }
}
function pell(g, cx, cy, rx, ry, c) {
  g.fillStyle = c; cx = ri(cx); cy = ri(cy); rx = Math.max(0, rx); ry = Math.max(1, ry);
  for (let dy = -Math.floor(ry); dy <= Math.floor(ry); dy++) { const dx = Math.floor(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry))) + .35); g.fillRect(cx - dx, cy + dy, dx * 2 + 1, 1); }
}
function pline(g, x0, y0, x1, y1, c, dash = 0, phase = 0) {
  x0 = ri(x0); y0 = ri(y0); x1 = ri(x1); y1 = ri(y1); g.fillStyle = c;
  const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
  let err = dx + dy, i = 0;
  for (; ;) {
    if (!dash || ((i + phase) % (dash * 2)) < dash) g.fillRect(x0, y0, 1, 1);
    if (x0 === x1 && y0 === y1) break;
    const e2 = 2 * err; if (e2 >= dy) { err += dy; x0 += sx; } if (e2 <= dx) { err += dx; y0 += sy; }
    i++; if (i > 4000) break;
  }
}
/* 4×4 Bayer 抖动填充：level 0..1 */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
function pdither(g, x, y, w, h, c, level) {
  g.fillStyle = c; x = ri(x); y = ri(y);
  const th = level * 16;
  for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) if (BAYER[((y + j) & 3) * 4 + ((x + i) & 3)] < th) g.fillRect(x + i, y + j, 1, 1);
}
/* 竖直分段渐变：stops = [[y, color], ...]，段与段之间用抖动过渡 */
function pbands(g, x, w, stops, dith = 3) {
  for (let i = 0; i < stops.length - 1; i++) {
    const [y0, c0] = stops[i], [y1] = stops[i + 1], c1 = stops[i + 1][1];
    prect(g, x, y0, w, y1 - y0, c0);
    for (let k = 0; k < dith; k++) pdither(g, x, y1 - dith + k, w, 1, c1, (k + 1) / (dith + 1));
  }
}
/* 精灵：整数坐标贴图，可水平翻转 */
function pspr(g, spr, x, y, flip = false) {
  if (!spr) return;
  x = ri(x); y = ri(y);
  if (!flip) { g.drawImage(spr, x, y); return; }
  g.save(); g.translate(x + spr.width, y); g.scale(-1, 1); g.drawImage(spr, 0, 0); g.restore();
}

/* ---------------- 字体 ---------------- */
const FONTS = { pix: 'Pix', fun: 'Smiley' };
function F(px, k = 'pix') { return `${px}px "${FONTS[k]}", "WenQuanYi Zen Hei", sans-serif`; }
/* 像素字：字号用 12 的整数倍才清晰。o.sh 阴影（像素倍数），o.ol 描边色 */
function ptext(g, s, x, y, px, col = C.white, o = {}) {
  g.save(); g.font = F(px, 'pix'); g.textAlign = o.align || 'left'; g.textBaseline = o.base || 'alphabetic';
  const k = px / 12; x = Math.round(x / k) * k; y = Math.round(y / k) * k;
  if (o.ol) {
    g.fillStyle = o.ol; const d = o.olw || k;
    for (const [ax, ay] of [[-d, 0], [d, 0], [0, -d], [0, d], [-d, -d], [d, -d], [-d, d], [d, d]]) g.fillText(s, x + ax, y + ay);
  }
  if (o.sh) { g.fillStyle = o.shc || 'rgba(0,0,0,.45)'; g.fillText(s, x + o.sh * k, y + o.sh * k); }
  g.fillStyle = col; g.fillText(s, x, y);
  g.restore();
}
function pw(g, s, px) { g.save(); g.font = F(px, 'pix'); const w = g.measureText(s).width; g.restore(); return w; }
/* 带 {高亮} 的像素字 */
function prich(g, s, x, y, px, col, hl, o = {}) {
  const parts = parseHL(s); g.save(); g.font = F(px, 'pix');
  const ws = parts.map(p => g.measureText(p[0]).width), tw = ws.reduce((a, b) => a + b, 0);
  g.restore();
  let cx = o.align === 'center' ? x - tw / 2 : o.align === 'right' ? x - tw : x;
  parts.forEach((p, i) => { ptext(g, p[0], cx, y, px, p[1] ? hl : col, o); cx += ws[i]; });
  return tw;
}
function parseHL(s) {
  const out = []; let hl = false, buf = '';
  for (const ch of s) {
    if (ch === '{' || ch === '}') { if (buf) out.push([buf, hl]); buf = ''; hl = ch === '{'; }
    else buf += ch;
  }
  if (buf) out.push([buf, hl]);
  return out;
}
/* 平滑大字（得意黑），描边 + {高亮} */
function rich(g, s, x, y, px, o = {}) {
  const parts = parseHL(s); g.font = F(px, o.font || 'fun');
  const ws = parts.map(p => g.measureText(p[0]).width), tw = ws.reduce((a, b) => a + b, 0);
  const sc = Math.min(1, (o.maxW || 980) / tw);
  g.save(); g.translate(x, y); g.scale(sc, sc);
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  let cx = o.align === 'left' ? 0 : -tw / 2;
  const x0 = cx;
  if (o.stroke !== 0) {
    g.lineWidth = o.stroke || px * .26; g.strokeStyle = o.strokeCol || C.ink;
    if (o.shadow !== false) { g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowOffsetY = px * .08; }
    parts.forEach((p, i) => { g.strokeText(p[0], cx, 0); cx += ws[i]; });
    g.shadowColor = 'transparent';
  }
  cx = x0;
  parts.forEach((p, i) => { g.fillStyle = p[1] ? (o.hl || C.amber) : (o.col || C.white); g.fillText(p[0], cx, 0); cx += ws[i]; });
  g.restore();
  return tw * sc;
}

/* ---------------- 游戏界面组件（全分辨率，像素风边框） ---------------- */
/* 像素风方框：k 为边框"像素"尺寸；切角 */
function pbox(g, x, y, w, h, o = {}) {
  const k = o.k || 6; x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h);
  g.save();
  if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  if (o.shadow !== false) { g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x + k * 2, y + k * 2, w, h); }
  const edge = o.edge || C.ink, rim = o.rim || C.paper, fill = o.fill || 'rgba(27,23,48,.92)';
  g.fillStyle = edge; g.fillRect(x + k, y, w - 2 * k, h); g.fillRect(x, y + k, w, h - 2 * k);
  g.fillStyle = rim; g.fillRect(x + k * 2, y + k, w - 4 * k, h - 2 * k); g.fillRect(x + k, y + k * 2, w - 2 * k, h - 4 * k);
  g.fillStyle = fill; g.fillRect(x + k * 2, y + k * 2, w - 4 * k, h - 4 * k);
  if (o.hi !== false) { g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x + k * 2, y + k * 2, w - 4 * k, k); }
  g.restore();
}
/* 小标签（名字牌） */
function ptag(g, x, y, s, px, o = {}) {
  const w = pw(g, s, px) + px * .9, h = px * 1.5, k = o.k || 4;
  const x0 = o.align === 'left' ? x : x - w / 2;
  g.save(); g.fillStyle = o.edge || C.ink; g.fillRect(x0 - k, y - h / 2, w + 2 * k, h); g.fillRect(x0, y - h / 2 - k, w, h + 2 * k);
  g.fillStyle = o.fill || C.amber; g.fillRect(x0, y - h / 2, w, h); g.restore();
  ptext(g, s, x0 + w / 2, y + px * .42, px, o.col || C.ink, { align: 'center' });
  return w;
}

/* 对话框：line 为时间轴里的 D 行；portrait(g, x, y, s) 画头像 */
function dialogBox(g, t, id, portrait, o = {}) {
  const l = LN[id]; if (!l) return;
  const a0 = l.v0, a1 = l.v1 + (o.extra || 0);
  if (t < a0 - .02 || t > a1 + .25) return;
  const p = Math.min(E.out(clamp((t - a0) / .16)), clamp((a1 + .25 - t) / .2));
  const x = o.x ?? 60, y = o.y ?? 1235, w = o.w ?? 960, h = o.h ?? 250;
  g.save(); g.globalAlpha *= clamp(p * 1.4);
  g.translate(x + w / 2, y + h / 2); g.scale(1, lerp(.2, 1, p)); g.translate(-x - w / 2, -y - h / 2);
  pbox(g, x, y, w, h, { k: 6 });
  const hasP = !!portrait, tx = hasP ? x + 238 : x + 48;
  if (hasP) {
    pbox(g, x + 30, y + 34, 176, 176, { k: 4, fill: o.pfill || '#3B3363', shadow: false });
    portrait(g, x + 30 + 88, y + 34 + 88, t);
  }
  ptag(g, tx, y + 4, l.who, 36, { align: 'left', fill: o.tagFill || C.amber });
  const n = Math.floor(clamp((t - a0 - .08) / Math.max(.05, l.typed - a0 - .08)) * [...l.text].length);
  const shown = [...l.text].slice(0, n).join('');
  const lines = wrapPix(g, shown, 48, x + w - tx - 40);
  lines.forEach((s, i) => ptext(g, s, tx, y + 104 + i * 66, 48, C.white, { sh: 1 }));
  if (t > l.typed && Math.floor(t * 3) % 2 === 0) { // ▼ 提示
    g.fillStyle = C.amber; const bx = x + w - 66, by = y + h - 56;
    g.fillRect(bx, by, 24, 6); g.fillRect(bx + 6, by + 6, 12, 6); g.fillRect(bx + 9, by + 12, 6, 4);
  }
  g.restore();
}
function wrapPix(g, s, px, maxW) {
  const out = []; let cur = '';
  for (const ch of s) { if (pw(g, cur + ch, px) > maxW) { out.push(cur); cur = ch; } else cur += ch; }
  if (cur) out.push(cur); return out;
}

/* 顶部 HUD 条：items = [{icon, text, col}]，像素字 */
function hud(g, items, o = {}) {
  const y = o.y ?? 66, h = 84;
  g.save(); if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  g.fillStyle = 'rgba(16,13,32,.82)'; g.fillRect(0, y, W, h);
  g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(0, y, W, 4);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(0, y + h, W, 6);
  let x = 30;
  items.forEach((it, i) => {
    if (it.right) return;
    if (it.icon) { it.icon(g, x + 18, y + h / 2); x += 46; }
    ptext(g, it.text, x, y + 56, 36, it.col || C.white);
    x += pw(g, it.text, 36) + 34;
  });
  // 右侧条目从右往左排
  let xr = W - 30;
  items.filter(it => it.right).reverse().forEach(it => {
    const tw = pw(g, it.text, 36);
    xr -= tw; ptext(g, it.text, xr, y + 56, 36, it.col || C.white);
    if (it.flash) { g.fillStyle = `rgba(255,255,255,${it.flash * .5})`; g.fillRect(xr - 6, y + 12, tw + 12, h - 24); }
    if (it.icon) { xr -= 46; it.icon(g, xr + 18, y + h / 2); }
    xr -= 34;
  });
  g.restore();
}
/* HUD 小图标（像素画，k=3） */
function iconSun(g, x, y, col = C.gold) {
  const k = 4; g.fillStyle = col;
  g.fillRect(x - 2 * k, y - 2 * k, 4 * k, 4 * k); g.fillRect(x - 3 * k, y - k, 6 * k, 2 * k); g.fillRect(x - k, y - 3 * k, 2 * k, 6 * k);
  for (const [a, b] of [[-5, -5], [4, -5], [-5, 4], [4, 4], [-1, -6], [-1, 5], [-6, -1], [5, -1]]) g.fillRect(x + a * k, y + b * k, k, k);
}
function iconBulb(g, x, y) {
  const k = 4; g.fillStyle = '#FFF2A8';
  g.fillRect(x - 2 * k, y - 4 * k, 4 * k, k); g.fillRect(x - 3 * k, y - 3 * k, 6 * k, 3 * k); g.fillRect(x - 2 * k, y, 4 * k, k);
  g.fillStyle = '#9AA1AD'; g.fillRect(x - 2 * k, y + k, 4 * k, 2 * k); g.fillStyle = '#6B7180'; g.fillRect(x - k, y + 3 * k, 2 * k, k);
}
function iconEye(g, x, y) {
  const k = 4; g.fillStyle = C.white;
  g.fillRect(x - 4 * k, y - k, 8 * k, 2 * k); g.fillRect(x - 3 * k, y - 2 * k, 6 * k, 4 * k); g.fillRect(x - k, y - 3 * k, 2 * k, 6 * k);
  g.fillStyle = '#4A86E8'; g.fillRect(x - 2 * k, y - 2 * k, 4 * k, 4 * k); g.fillStyle = C.ink; g.fillRect(x - k, y - k, 2 * k, 2 * k);
}
function iconPin(g, x, y, col = C.red) {
  const k = 4; g.fillStyle = col; g.fillRect(x - 2 * k, y - 4 * k, 4 * k, 5 * k); g.fillRect(x - 3 * k, y - 3 * k, 6 * k, 3 * k); g.fillRect(x - k, y + k, 2 * k, 2 * k);
  g.fillStyle = C.white; g.fillRect(x - k, y - 3 * k, 2 * k, 2 * k);
}
function iconHat(g, x, y, col = C.gold) {
  const k = 4; g.fillStyle = col; g.fillRect(x - 3 * k, y - 3 * k, 6 * k, 3 * k); g.fillRect(x - 2 * k, y - 4 * k, 4 * k, k); g.fillRect(x - 5 * k, y, 10 * k, 2 * k);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x - k, y - 4 * k, 2 * k, 4 * k);
}

/* 获得道具弹窗 */
function itemGet(g, t, t0, t1, drawIcon, title, sub, o = {}) {
  const a = win(t, t0, t1, .05, .25); if (!a) return;
  const p = pop(t, t0, .4), cx = o.x ?? 540, cy = o.y ?? 700, w = o.w ?? 640, h = o.h ?? 470;
  g.save(); g.globalAlpha *= a; g.translate(cx, cy); g.scale(p, p);
  // 放射光
  g.save(); g.rotate(t * .8); g.fillStyle = 'rgba(255,211,78,.16)';
  for (let i = 0; i < 12; i++) { g.rotate(TAU / 12); g.beginPath(); g.moveTo(0, 0); g.lineTo(-60, -520); g.lineTo(60, -520); g.closePath(); g.fill(); }
  g.restore();
  pbox(g, -w / 2, -h / 2, w, h, { k: 6 });
  g.fillStyle = o.band || '#D9443B'; g.fillRect(-w / 2 + 12, -h / 2 + 12, w - 24, 72);
  ptext(g, o.head || '获得道具', 0, -h / 2 + 66, 48, C.white, { align: 'center', sh: 1 });
  drawIcon(g, 0, -10, t);
  ptext(g, title, 0, h / 2 - 98, 48, C.gold, { align: 'center', sh: 1 });
  if (sub) ptext(g, sub, 0, h / 2 - 42, 36, '#CFC6E8', { align: 'center' });
  g.restore();
}

/* 概念卡：大标题 + 英文 + 说明 */
function conceptCard(g, t, t0, t1, title, en, lines, o = {}) {
  const a = win(t, t0, t1, .08, .3); if (!a) return;
  const p = E.out(clamp((t - t0) / .35)), cx = o.x ?? 540, cy = o.y ?? (o.top ?? 330);
  const w = o.w ?? 900, h = o.h ?? (230 + lines.length * 62);
  g.save(); g.globalAlpha *= a; g.translate(cx, cy + (1 - p) * -60);
  pbox(g, -w / 2, 0, w, h, { k: 6, fill: o.fill || 'rgba(27,23,48,.94)' });
  ptext(g, title, -w / 2 + 50, 118, 72, o.col || C.gold, { sh: 1 });
  ptext(g, en, -w / 2 + 54 + pw(g, title, 72) + 26, 112, 24, '#9C93C0');
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(-w / 2 + 50, 148, w - 100, 4);
  lines.forEach((s, i) => { const u = clamp((t - t0 - .3 - i * .25) / .2); if (u > 0) withAlpha(g, u, () => prich(g, s, -w / 2 + 50, 212 + i * 62, 36, C.white, C.amber)); });
  g.restore();
}

/* 录像带界面：mode = 'rew' | 'ff' | 'play' | 'pause' */
function vcr(g, t, t0, t1, mode, label, stamp, o = {}) {
  const a = win(t, t0, t1, .06, .2); if (!a) return;
  g.save(); g.globalAlpha *= a;
  if (mode === 'rew' || mode === 'ff') {
    g.fillStyle = 'rgba(40,20,70,.28)'; g.fillRect(0, 0, W, H);
    const k = Math.floor(t * 30);
    for (let i = 0; i < 7; i++) { const y = hash(i, k) * H; g.fillStyle = `rgba(255,255,255,${.12 + hash(i, k, 3) * .25})`; g.fillRect(0, y, W, 4 + hash(i, k + 1) * 26); }
    g.fillStyle = 'rgba(0,0,0,.16)'; for (let y = 0; y < H; y += 8) g.fillRect(0, y, W, 3);
  }
  const x = 60, y = o.y ?? 250;
  // 图标：像素三角形，dir>0 朝右
  const k = 6;
  const tri = (x0, dir) => { for (let j = 0; j < 8; j++) { const hh = (8 - j) * k; g.fillRect(dir > 0 ? x0 + j * k : x0 + (7 - j) * k, y - hh, k, hh * 2); } };
  g.fillStyle = C.white;
  if (mode === 'rew') { tri(x, -1); tri(x + 50, -1); }
  if (mode === 'ff') { tri(x, 1); tri(x + 50, 1); }
  if (mode === 'play') { tri(x, 1); }
  if (mode === 'pause') { g.fillRect(x, y - 24, 14, 48); g.fillRect(x + 26, y - 24, 14, 48); }
  ptext(g, label, x + (mode === 'play' || mode === 'pause' ? 70 : 120), y + 26, 72, C.white, { sh: 1, ol: 'rgba(0,0,0,.55)' });
  if (stamp) ptext(g, stamp, W - 60, y + 22, 36, C.white, { align: 'right', sh: 1, ol: 'rgba(0,0,0,.55)' });
  g.restore();
}

/* VS 徽章 */
function vsBadge(g, x, y, s = 1, t = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const k = 8;
  g.fillStyle = C.ink; g.beginPath(); g.moveTo(0, -12 * k); g.lineTo(13 * k, 0); g.lineTo(0, 12 * k); g.lineTo(-13 * k, 0); g.closePath(); g.fill();
  g.fillStyle = '#E8443A'; g.beginPath(); g.moveTo(0, -10 * k); g.lineTo(11 * k, 0); g.lineTo(0, 10 * k); g.lineTo(-11 * k, 0); g.closePath(); g.fill();
  g.fillStyle = '#FF8A3D'; g.beginPath(); g.moveTo(0, -10 * k); g.lineTo(11 * k, 0); g.lineTo(-11 * k, 0); g.closePath(); g.fill();
  ptext(g, 'VS', 0, 30, 96, C.white, { align: 'center', ol: C.ink, olw: 8 });
  g.restore();
}

/* 系统对话框（像素版窗口） */
function sysWindow(g, x, y, w, h, title, o = {}) {
  g.save();
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(x + 14, y + 14, w, h);
  g.fillStyle = C.ink; g.fillRect(x - 6, y - 6, w + 12, h + 12);
  g.fillStyle = '#ECE7F5'; g.fillRect(x, y, w, h);
  g.fillStyle = o.bar || '#D9443B'; g.fillRect(x, y, w, 72);
  ptext(g, title, x + 28, y + 50, 36, C.white);
  // × 按钮
  g.fillStyle = C.white; const bx = x + w - 54, by = y + 22;
  for (let i = 0; i < 7; i++) { g.fillRect(bx + i * 4, by + i * 4, 4, 4); g.fillRect(bx + 24 - i * 4, by + i * 4, 4, 4); }
  g.restore();
}
function pbutton(g, x, y, w, h, s, o = {}) {
  const pressed = o.pressed || 0;
  g.save();
  g.fillStyle = C.ink; g.fillRect(x - 4, y - 4 + pressed * 4, w + 8, h + 8);
  g.fillStyle = o.fill || '#FFFFFF'; g.fillRect(x, y + pressed * 4, w, h);
  if (!pressed) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x, y + h - 6, w, 6); }
  if (o.hot) { g.strokeStyle = o.hot; g.lineWidth = 6; g.strokeRect(x - 12, y - 12 + pressed * 4, w + 24, h + 24); }
  ptext(g, s, x + w / 2, y + h / 2 + 18 + pressed * 4, 48, o.col || C.ink, { align: 'center' });
  g.restore();
}

/* 盖章（像素字） */
function stamp(g, x, y, s, p, o = {}) {
  if (p <= 0) return;
  const sc = lerp(2.4, 1, E.out(clamp(p * 4))) * (o.sc || 1), a = clamp(p * 6);
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -.1); g.scale(sc, sc); g.globalAlpha *= a * .96;
  const px = o.px || 72, w = pw(g, s, px) + px * .9, h = px * 1.6, col = o.col || '#FF4B3E';
  g.fillStyle = col; g.fillRect(-w / 2, -h / 2, w, 8); g.fillRect(-w / 2, h / 2 - 8, w, 8); g.fillRect(-w / 2, -h / 2, 8, h); g.fillRect(w / 2 - 8, -h / 2, 8, h);
  g.fillRect(-w / 2 + 16, -h / 2 + 16, w - 32, 4); g.fillRect(-w / 2 + 16, h / 2 - 20, w - 32, 4);
  ptext(g, s, 0, px * .4, px, col, { align: 'center' });
  g.restore();
}

/* 像素光标（手形） */
function cursorHand(g, x, y, press = 0) {
  const k = 6, rows = ['..##......', '.#..#.....', '.#..#.....', '.#..###...', '.#..#..##.', '##..#..#.#', '#.......#.', '#........#', '.#.......#', '..#.....#.', '...#####..'];
  g.save(); g.translate(x, y + press * 6);
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') { g.fillStyle = C.ink; g.fillRect(i * k, j * k, k, k); } });
  // 填白
  const fill = ['..........', '..##......', '..##......', '..##......', '..##.##...', '..#######.', '.########.', '.#########', '..#######.', '...#####..', '..........'];
  fill.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#' && rows[j][i] !== '#') { g.fillStyle = C.white; g.fillRect(i * k, j * k, k, k); } });
  g.restore();
}

/* ---------------- 字幕（旁白） ---------------- */
const SUBS = [];
TL.lines.forEach((l, i) => {
  if (l.spk !== 'N') return;
  const nextStart = TL.lines[i + 1] ? TL.lines[i + 1].v0 : 1e9;
  l.chunks.forEach(([t0, s], k) => {
    if (s === '-') return;
    const t1 = k + 1 < l.chunks.length ? l.chunks[k + 1][0] : Math.min(l.v1 + .35, nextStart - .03);
    SUBS.push([t0 - .04, t1, s]);
  });
});
let SUB_Y = 1385;
function drawSubs(g, t) {
  for (const [a, b, s] of SUBS) {
    if (t < a || t >= b) continue;
    const u = clamp((t - a) / .14), al = Math.min(clamp((t - a) / .05), clamp((b - t) / .05));
    g.save(); g.globalAlpha = al; g.translate(540, SUB_Y); const sc = lerp(.88, 1, E.back(u)); g.scale(sc, sc);
    rich(g, s, 0, 0, 70, { maxW: 980, stroke: 16 });
    g.restore();
  }
}
