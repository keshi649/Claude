'use strict';
/* 《才二十三》MV —— frame(T) 只依赖时间，逐帧确定地画出画面。
   core.js：工具、配色、字体、纹理（纸纹、网点、光芒）、音乐包络读取、常用道具。 */
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/* ---------------- 工具 ---------------- */
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  io: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
  out: u => 1 - Math.pow(1 - u, 3),
  out5: u => 1 - Math.pow(1 - u, 5),
  in: u => u * u * u,
  sine: u => -(Math.cos(Math.PI * u) - 1) / 2,
  back: u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
  elastic: u => u === 0 || u === 1 ? u : Math.pow(2, -10 * u) * Math.sin((u * 10 - .75) * TAU / 3) + 1,
  bounce: u => { const n = 7.5625, d = 2.75; if (u < 1 / d) return n * u * u; if (u < 2 / d) return n * (u -= 1.5 / d) * u + .75; if (u < 2.5 / d) return n * (u -= 2.25 / d) * u + .9375; return n * (u -= 2.625 / d) * u + .984375; },
};
function win(t, a, b, fi = .2, fo = .2) { if (t < a || t > b) return 0; return Math.min(fi > 0 ? clamp((t - a) / fi) : 1, fo > 0 ? clamp((b - t) / fo) : 1); }
function R(seed) { let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(a, b = 0, c = 0) { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i, seed) * 2 - 1, hash(i + 1, seed) * 2 - 1, u); }
function shake(t, t0, amp, dur = .4, f = 23) { if (t < t0 || t > t0 + dur) return [0, 0]; const k = 1 - (t - t0) / dur; return [Math.sin((t - t0) * f * 6.3) * amp * k * k, Math.cos((t - t0) * f * 5.1) * amp * k * k]; }

function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function circ(g, x, y, r) { g.beginPath(); g.arc(x, y, Math.max(r, .01), 0, TAU); }
function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(rx, .01), Math.max(ry, .01), rot, 0, TAU); }
function poly(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }
function fs(g, fill, stroke, lw) { if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function line(g, x0, y0, x1, y1, col, lw, cap = 'round') { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = cap; g.stroke(); }
function withAlpha(g, a, fn) { if (a <= .001) return; g.save(); g.globalAlpha *= a; fn(); g.restore(); }
function vgrad(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }
function rgrad(g, x, y, r0, r1, stops) { const gr = g.createRadialGradient(x, y, r0, x, y, r1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }
function mixc(a, b, u) {
  const p = c => [parseInt(c.slice(1, 3), 16), parseInt(c.slice(3, 5), 16), parseInt(c.slice(5, 7), 16)];
  const A = p(a), B = p(b);
  return '#' + A.map((v, i) => Math.round(lerp(v, B[i], u)).toString(16).padStart(2, '0')).join('');
}

/* ---------------- 配色（复古印刷感） ---------------- */
const C = {
  cream: '#F6EEDF', paper: '#EFE4CF', paperD: '#E2D3B6',
  pink: '#F3BCB8', pinkL: '#F9D9D3', rose: '#E8737A', red: '#D7263D', redD: '#A51C30',
  teal: '#2E9488', tealL: '#7CC6B8', tealD: '#1E6A62',
  navy: '#1F2A4D', night: '#2A3366', nightD: '#171D3A', purple: '#6B4E9B',
  mustard: '#F2B134', orange: '#F08A3C', yel: '#FFD45C',
  sky: '#9ED4E8', skyL: '#CFEAF3', grass: '#74C26E', grassD: '#4F9A57',
  brown: '#7A4B2A', brownL: '#A8714A', ink: '#33262A', grey: '#9A97A0', greyD: '#6F6C78', white: '#FFFDF7',
};
const INK = C.ink;

/* ---------------- 字体 ---------------- */
const FONT = {
  brush: '"MaShan"', cute: '"KuaiLe"', pop: '"QingKe"', sans: '"NotoSansB"', serif: '"NotoSerifBlack"', en: '"Fredoka"',
};
function F(px, k = 'sans') { return `${px}px ${FONT[k]}, sans-serif`; }

/* 文字：o = { k, col, align, base, shadow(颜色), sx, sy(阴影偏移), ext(挤出厚度), extCol, stroke, lw, rot, sc, alpha, ls(字距) } */
function text(g, s, x, y, px, o = {}) {
  g.save();
  g.translate(x, y);
  if (o.rot) g.rotate(o.rot);
  if (o.sc != null) g.scale(o.sc, o.sc);
  if (o.alpha != null) g.globalAlpha *= o.alpha;
  g.font = F(px, o.k || 'sans');
  g.textAlign = o.align || 'center';
  g.textBaseline = o.base || 'middle';
  if (o.ls) g.letterSpacing = o.ls + 'px';
  if (o.ext) {
    g.fillStyle = o.extCol || INK;
    const n = Math.max(2, Math.round(o.ext / 1.5));
    for (let i = n; i >= 1; i--) { const d = o.ext * i / n; g.fillText(s, d * .55, d); }
  } else if (o.shadow) { g.fillStyle = o.shadow; g.fillText(s, o.sx ?? px * .04, o.sy ?? px * .06); }
  if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = o.lw || px * .12; g.lineJoin = 'round'; g.strokeText(s, 0, 0); }
  g.fillStyle = o.col || INK;
  g.fillText(s, 0, 0);
  g.restore();
}
/* 竖排文字（每个字一格），从 (x, y) 往下 */
function vtext(g, s, x, y, px, o = {}, reveal = 99) {
  [...s].forEach((ch, i) => { if (i < reveal) text(g, ch, x, y + i * px * (o.lh || 1.12), px, o); });
}
/* 弹出式字：t0 之后 dur 秒内从小到大回弹 */
function popText(g, t, t0, s, x, y, px, o = {}) {
  if (t < t0) return;
  const u = clamp((t - t0) / (o.dur || .28));
  const sc = (o.from ?? .2) + (1 - (o.from ?? .2)) * E.back(u);
  text(g, s, x, y + (o.dy || 0) * (1 - E.out(u)), px, { ...o, sc: sc * (o.sc || 1), alpha: clamp((t - t0) / .06) * (o.alpha ?? 1) });
}

/* ---------------- 音乐 ---------------- */
const AL = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const dec = s => Float32Array.from(s, ch => AL.indexOf(ch) / 61);
const VOC = dec(VOC_S), ACC = dec(ACC_S), BEATS = dec(BEATS_S);
function envAt(arr, s) { const f = s * ENV_FPS; const i = Math.floor(f); if (i < 0 || i >= arr.length - 1) return 0; return lerp(arr[i], arr[i + 1], f - i); }
const voc = s => envAt(VOC, s), acc = s => envAt(ACC, s);
const beatIdx = s => (s - BEAT0) / BEAT;
const beatStr = k => BEATS[k] || 0;
/* 拍点脉冲：每拍开头 1 → 指数衰减；乘上这一拍的力度 */
function pulse(s, decay = 7, every = 1, phase = 0) {
  const b = (beatIdx(s) - phase) / every; if (b < 0) return 0;
  const k = Math.floor(b), f = (b - k) * every * BEAT;
  return Math.exp(-f * decay) * (.35 + .65 * beatStr(k * every + phase));
}
/* 0..1 的拍内相位 */
const bphase = (s, every = 1) => { const b = beatIdx(s) / every; return b - Math.floor(b); };
/* 每两拍一次的点头（全曲律动的基本单位） */
const bob = s => Math.abs(Math.sin(Math.PI * beatIdx(s) / 2));

/* ---------------- 纹理 ---------------- */
const TEX = {};
function buildTextures() {
  // 纸纹：低频斑驳 + 高频颗粒
  const n = mk(960, 540), g = n.getContext('2d'), im = g.createImageData(960, 540), r = R(7);
  for (let i = 0; i < im.data.length; i += 4) {
    const v = 128 + (r() - .5) * 70;
    im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = 255;
  }
  g.putImageData(im, 0, 0);
  const blot = mk(960, 540), bg = blot.getContext('2d');
  bg.fillStyle = '#808080'; bg.fillRect(0, 0, 960, 540);
  for (let i = 0; i < 160; i++) { const x = r() * 960, y = r() * 540, rad = 20 + r() * 90; bg.fillStyle = rgrad(bg, x, y, 0, rad, [[0, r() < .5 ? 'rgba(0,0,0,.10)' : 'rgba(255,255,255,.10)'], [1, 'rgba(128,128,128,0)']]); bg.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  g.globalAlpha = .9; g.drawImage(blot, 0, 0);
  TEX.grain = n;
  // 网点
  const d = mk(12, 12), dg = d.getContext('2d');
  dg.fillStyle = '#000'; circ(dg, 6, 6, 2.3); dg.fill();
  TEX.dots = ctx.createPattern(d, 'repeat');
  const d2 = mk(10, 10), dg2 = d2.getContext('2d');
  dg2.fillStyle = '#fff'; circ(dg2, 5, 5, 1.6); dg2.fill();
  TEX.dotsW = ctx.createPattern(d2, 'repeat');
  // 暗角
  const v = mk(W, H), vg = v.getContext('2d');
  vg.fillStyle = rgrad(vg, W / 2, H / 2, H * .45, H * 1.05, [[0, 'rgba(40,20,20,0)'], [1, 'rgba(40,20,20,.38)']]);
  vg.fillRect(0, 0, W, H);
  TEX.vig = v;
}
/* 在当前路径/整屏上叠一层网点 */
function dots(g, a = .08, white = false, x = 0, y = 0, w = W, h = H) {
  g.save(); g.globalAlpha *= a; g.fillStyle = white ? TEX.dotsW : TEX.dots; g.fillRect(x, y, w, h); g.restore();
}
/* 光芒背景（复古放射条纹） */
function sunburst(g, cx, cy, n, c1, c2, rot = 0, r = 2400) {
  g.fillStyle = c1; g.fillRect(0, 0, W, H);
  g.fillStyle = c2;
  for (let i = 0; i < n; i++) {
    const a0 = rot + i * TAU / n, a1 = a0 + TAU / n / 2;
    g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.cos(a0) * r, cy + Math.sin(a0) * r); g.lineTo(cx + Math.cos(a1) * r, cy + Math.sin(a1) * r); g.closePath(); g.fill();
  }
}
/* 底部纸条（场景字幕：时间 + 一句旁白，原创，非歌词） */
function caption(g, s, s0, s1, stamp, msg) {
  const a = win(s, s0, s1, .35, .35);
  if (a <= 0) return;
  const u = E.back(clamp((s - s0) / .45));
  g.save();
  g.globalAlpha *= a;
  g.translate(W / 2, 1012 + (1 - u) * 40);
  g.rotate(-.006);
  g.font = F(34, 'sans');
  const w1 = g.measureText(stamp).width, w2 = g.measureText(msg).width, w = w1 + w2 + 90;
  g.fillStyle = 'rgba(60,30,30,.18)'; g.fillRect(-w / 2 + 6, -30 + 8, w, 60);
  g.fillStyle = C.cream; g.fillRect(-w / 2, -30, w, 60);
  dots(g, .05, false, -w / 2, -30, w, 60);
  g.fillStyle = C.red; g.textAlign = 'left'; g.textBaseline = 'middle';
  g.fillText(stamp, -w / 2 + 30, 2);
  g.fillStyle = INK; g.fillText(msg, -w / 2 + 30 + w1 + 30, 2);
  g.restore();
}
/* 红色方印 */
function seal(g, x, y, sz, chars, rot = 0, col = C.red) {
  g.save(); g.translate(x, y); g.rotate(rot);
  rr(g, -sz / 2, -sz / 2, sz, sz, sz * .1); fs(g, col);
  g.strokeStyle = C.cream; g.lineWidth = sz * .045; rr(g, -sz * .4, -sz * .4, sz * .8, sz * .8, sz * .05); g.stroke();
  const n = chars.length;
  if (n === 1) text(g, chars, 0, 2, sz * .6, { k: 'brush', col: C.cream });
  else if (n === 2) { text(g, chars[0], 0, -sz * .19, sz * .36, { k: 'brush', col: C.cream }); text(g, chars[1], 0, sz * .2, sz * .36, { k: 'brush', col: C.cream }); }
  else { const q = [...chars]; [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dx, dy], i) => q[i] && text(g, q[i], -dx * sz * .18, dy * sz * .18, sz * .32, { k: 'brush', col: C.cream })); }
  g.restore();
}

/* ---------------- 常用道具 ---------------- */
function cloud(g, x, y, s, col = C.white) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = 'rgba(0,0,0,.06)';
  [[-50, 12, 34], [0, 0, 46], [48, 12, 32], [10, 20, 36]].forEach(([a, b, r]) => { circ(g, a + 6, b + 8, r); g.fill(); });
  g.fillStyle = col;
  [[-50, 12, 34], [0, 0, 46], [48, 12, 32], [10, 20, 36]].forEach(([a, b, r]) => { circ(g, a, b, r); g.fill(); });
  g.fillRect(-60, 20, 120, 26);
  g.restore();
}
function star(g, x, y, r, col, n = 5, inner = .45, rot = -Math.PI / 2) {
  g.beginPath();
  for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr_ = i % 2 ? r * inner : r; g.lineTo(x + Math.cos(a) * rr_, y + Math.sin(a) * rr_); }
  g.closePath(); g.fillStyle = col; g.fill();
}
function sparkle(g, x, y, r, col) {
  g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r);
  g.fillStyle = col; g.fill();
}
function heart(g, x, y, s, col) {
  g.save(); g.translate(x, y); g.scale(s / 20, s / 20);
  g.beginPath(); g.moveTo(0, 6); g.bezierCurveTo(-14, -4, -10, -18, 0, -10); g.bezierCurveTo(10, -18, 14, -4, 0, 6);
  g.fillStyle = col; g.fill(); g.restore();
}
/* 夜空星星（确定性） */
function starfield(g, s, n, seed, y1 = H, tw = 1) {
  const r = R(seed);
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = r() * y1, sz = 1 + r() * 2.6, ph = r() * TAU;
    const a = .45 + .55 * Math.max(0, Math.sin(s * (1.3 + r() * 2) + ph)) * tw;
    g.fillStyle = `rgba(255,248,220,${a})`;
    if (sz > 3.1) sparkle(g, x, y, sz * 2.4, `rgba(255,240,200,${a})`); else { circ(g, x, y, sz); g.fill(); }
  }
}
/* 城市天际线（一排方块楼 + 窗户），lit(i,j) 决定窗灯 */
function skyline(g, s, seed, y0, hmin, hmax, col, winCol, lit = () => true, x0 = -20, x1 = W + 20) {
  const r = R(seed); let x = x0, bi = 0;
  while (x < x1) {
    const w = 90 + r() * 110, h = hmin + r() * (hmax - hmin);
    g.fillStyle = col; g.fillRect(x, y0 - h, w - 6, h + 400);
    if (r() < .35) { g.fillRect(x + w * .3, y0 - h - 26, w * .3, 26); }
    const cols = Math.floor((w - 26) / 30), rows = Math.floor((h - 30) / 42);
    for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
      if (lit(bi, i, j)) { g.fillStyle = winCol; g.fillRect(x + 14 + i * 30, y0 - h + 22 + j * 42, 16, 22); }
    }
    x += w; bi++;
  }
}
/* 墙上的钟 */
function clock(g, x, y, r, hh, mm, ring = C.red, face = C.cream) {
  circ(g, x + 6, y + 8, r); fs(g, 'rgba(0,0,0,.15)');
  circ(g, x, y, r); fs(g, ring, INK, 4);
  circ(g, x, y, r * .82); fs(g, face, INK, 3);
  for (let i = 0; i < 12; i++) { const a = i * TAU / 12; line(g, x + Math.cos(a) * r * .66, y + Math.sin(a) * r * .66, x + Math.cos(a) * r * .74, y + Math.sin(a) * r * .74, INK, i % 3 ? 3 : 6); }
  const ah = (hh % 12 + mm / 60) / 12 * TAU - Math.PI / 2, am = mm / 60 * TAU - Math.PI / 2;
  line(g, x, y, x + Math.cos(ah) * r * .42, y + Math.sin(ah) * r * .42, INK, 8);
  line(g, x, y, x + Math.cos(am) * r * .64, y + Math.sin(am) * r * .64, INK, 5);
  circ(g, x, y, 7); fs(g, C.red);
}
/* 拟声字（漫画风：彩色字 + 深色描边 + 挤出） */
function sfx(g, s, x, y, px, col, t, t0, rot = -.08, dur = .9) {
  if (t < t0 || t > t0 + dur) return;
  const u = (t - t0) / dur, sc = E.back(clamp(u / .18)) * (1 - .1 * u);
  text(g, s, x, y, px, { k: 'cute', col, stroke: INK, lw: px * .16, rot: rot + Math.sin(t * 30) * .02, sc, alpha: clamp((1 - u) / .2) });
}
