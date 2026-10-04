'use strict';
/* 《原始人穿越奶茶店》—— 程序化短视频。frame(t) 按时间 t（秒）确定性地画出一帧。
   core.js：工具函数、时间轴、文字、气泡、字幕。 */
const W = 1080, H = 1920;
const TL = window.TIMELINE, DURATION = TL.duration;
const LN = {}; TL.lines.forEach(l => { LN[l.id] = l; });
const S = id => LN[id].v0;                 // 这句开口的时刻
const EN = id => LN[id].v1;                // 这句说完的时刻
const CK = (id, k) => LN[id].chunks[k][0]; // 第 k 段字幕开始的时刻
const MK = (id, k = 0) => LN[id].marks[k]; // 文本里 ^ 标记的时刻

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
function R(seed) { let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(a, b = 0, c = 0) { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
/* 衰减抖动 */
function shake(t, t0, amp, dur = .5, f = 31) { if (t < t0 || t > t0 + dur) return [0, 0]; const k = 1 - (t - t0) / dur; return [Math.sin((t - t0) * f * 6.3) * amp * k * k, Math.cos((t - t0) * f * 5.1) * amp * k * k]; }

const INK = '#2A2330', CREAM = '#FFF6E6', PINK = '#FF6F91', HOT = '#FF4D7A', MINT = '#9EDDC8', YEL = '#FFD43B', TEA = '#C98A55';
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function circ(g, x, y, r) { g.beginPath(); g.arc(x, y, Math.max(r, .01), 0, TAU); }
function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(rx, .01), Math.max(ry, .01), rot, 0, TAU); }
function poly(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }
function fs(g, fill, stroke, lw) { if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function star(g, x, y, r1, r2, n = 5, rot = -Math.PI / 2) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r = i % 2 ? r2 : r1; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); }
function heart(g, x, y, s) { g.beginPath(); g.moveTo(x, y + s * .35); g.bezierCurveTo(x - s * 1.1, y - s * .4, x - s * .45, y - s * 1.1, x, y - s * .45); g.bezierCurveTo(x + s * .45, y - s * 1.1, x + s * 1.1, y - s * .4, x, y + s * .35); g.closePath(); }
function withAlpha(g, a, fn) { if (a <= .001) return; g.save(); g.globalAlpha *= a; fn(); g.restore(); }
/* 先把一组东西画到离屏层，再整体半透明贴上（避免叠加处变深） */
function layer(g, alpha, fn) {
  if (alpha <= .001) return;
  if (alpha >= .999) { fn(g); return; }
  layerG.setTransform(1, 0, 0, 1, 0, 0); layerG.globalAlpha = 1; layerG.clearRect(0, 0, W, H);
  fn(layerG);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = alpha; g.drawImage(layerCv, 0, 0); g.restore();
}

/* ---------------- 字体与文字 ---------------- */
const FONTS = { black: 'NotoBlack', bold: 'NotoBold', fun: 'Smiley' };
function F(px, k = 'bold') { return `${px}px "${FONTS[k]}", "WenQuanYi Zen Hei", sans-serif`; }
function parseHL(s) {
  const out = []; let hl = false, buf = '';
  for (const ch of s) {
    if (ch === '{' || ch === '}') { if (buf) out.push([buf, hl]); buf = ''; hl = ch === '{'; }
    else buf += ch;
  }
  if (buf) out.push([buf, hl]);
  return out;
}
/* 单行描边文字，{…} 部分用高亮色。返回实际宽度 */
function rich(g, s, x, y, px, o = {}) {
  const parts = parseHL(s); g.font = F(px, o.font || 'black');
  const ws = parts.map(p => g.measureText(p[0]).width), tw = ws.reduce((a, b) => a + b, 0);
  const sc = Math.min(1, (o.maxW || 980) / tw);
  g.save(); g.translate(x, y); g.scale(sc, sc);
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  let cx = o.align === 'left' ? 0 : -tw / 2;
  const x0 = cx;
  if (o.stroke !== 0) {
    g.lineWidth = o.stroke || px * .24; g.strokeStyle = o.strokeCol || '#1D1822';
    if (o.shadow !== false) { g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowOffsetY = px * .07; }
    parts.forEach((p, i) => { g.strokeText(p[0], cx, 0); cx += ws[i]; });
    g.shadowColor = 'transparent';
  }
  cx = x0;
  parts.forEach((p, i) => { g.fillStyle = p[1] ? (o.hl || YEL) : (o.col || '#FFFFFF'); g.fillText(p[0], cx, 0); cx += ws[i]; });
  g.restore();
  return tw * sc;
}
/* 普通居中文字（无描边），支持多行 */
function text(g, s, x, y, px, col = INK, k = 'bold', lh = 1.3, align = 'center') {
  g.font = F(px, k); g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle';
  const ls = String(s).split('\n'), tot = (ls.length - 1) * px * lh;
  ls.forEach((l, i) => g.fillText(l, x, y - tot / 2 + i * px * lh));
}
function textW(g, s, px, k = 'bold') { g.font = F(px, k); return Math.max(...String(s).split('\n').map(l => g.measureText(l).width)); }

/* 对话气泡。p：弹出进度（0..1+），tail：尾巴指向的点 */
function bubble(g, x, y, s, px, p, tail, o = {}) {
  if (p <= .001) return;
  const w = textW(g, s, px, o.font || 'black') + px * 1.3, nl = String(s).split('\n').length, h = nl * px * 1.3 + px * .9;
  g.save(); g.translate(x, y); g.scale(p, p);
  g.lineJoin = 'round';
  const fill = o.fill || '#FFFFFF', lw = o.lw || 6;
  if (o.jag) { // 大喊用的爆炸形气泡
    g.beginPath(); const n = 18;
    for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * TAU, k = i % 2 ? 1 : 1.18; g.lineTo(Math.cos(a) * w * .62 * k, Math.sin(a) * h * .85 * k); }
    g.closePath(); fs(g, fill, INK, lw);
  } else {
    if (tail) {
      const tx = tail[0] - x, ty = tail[1] - y, bx = clamp(tx * .35, -w / 2 + 50, w / 2 - 50), by = ty > 0 ? h / 2 - 4 : -h / 2 + 4;
      g.beginPath(); g.moveTo(bx - 26, by); g.quadraticCurveTo(bx, by, tx / p, ty / p); g.quadraticCurveTo(bx + 4, by, bx + 26, by); g.closePath();
      fs(g, fill, INK, lw);
    }
    rr(g, -w / 2, -h / 2, w, h, Math.min(h / 2, 46)); fs(g, fill, INK, lw);
    if (tail) { // 盖住尾巴与气泡相接处的描边
      const tx = tail[0] - x, ty = tail[1] - y, bx = clamp(tx * .35, -w / 2 + 50, w / 2 - 50), by = ty > 0 ? h / 2 - 4 : -h / 2 + 4;
      g.fillStyle = fill; g.fillRect(bx - 22, by - 6, 44, 12);
    }
  }
  text(g, s, 0, 2, px, o.col || INK, o.font || 'black');
  g.restore();
}

/* 圆角标签卡片 */
function tag(g, x, y, s, px, o = {}) {
  const w = textW(g, s, px, o.font || 'black') + px * (o.padX || 1.0), nl = String(s).split('\n').length, h = nl * px * 1.28 + px * (o.padY || .62);
  g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); if (o.sc !== undefined) g.scale(o.sc, o.sc);
  if (o.shadow !== false) { g.fillStyle = 'rgba(0,0,0,.18)'; rr(g, -w / 2 + 5, -h / 2 + 8, w, h, o.r ?? h / 2); g.fill(); }
  rr(g, -w / 2, -h / 2, w, h, o.r ?? h / 2); fs(g, o.fill || '#FFFFFF', o.line === false ? null : INK, o.lw || 5);
  text(g, s, 0, 2, px, o.col || INK, o.font || 'black');
  g.restore();
  return [w, h];
}

/* 红色印章 */
function stamp(g, x, y, s, p, o = {}) {
  if (p <= 0) return;
  const sc = lerp(2.2, 1, E.out(clamp(p * 4))) * (o.sc || 1), a = clamp(p * 6);
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -.12); g.scale(sc, sc); g.globalAlpha *= a * .95;
  const px = o.px || 64, w = textW(g, s, px, 'black') + px * .9, h = px * 1.55;
  g.strokeStyle = o.col || '#E23B3B'; g.lineWidth = 9; rr(g, -w / 2, -h / 2, w, h, 16); g.stroke();
  g.lineWidth = 3; rr(g, -w / 2 + 12, -h / 2 + 12, w - 24, h - 24, 9); g.stroke();
  text(g, s, 0, 3, px, o.col || '#E23B3B', 'black');
  g.restore();
}

/* ---------------- 字幕（旁白） ---------------- */
const SUBS = [];
TL.lines.forEach((l, i) => {
  if (l.spk !== 'N') return;
  const nextStart = TL.lines[i + 1] ? TL.lines[i + 1].v0 : 1e9;
  l.chunks.forEach(([t0, s], k) => {
    const t1 = k + 1 < l.chunks.length ? l.chunks[k + 1][0] : Math.min(l.v1 + .35, nextStart - .03);
    SUBS.push([t0 - .04, t1, s]);
  });
});
const SUB_Y = 1395;
function drawSubs(g, t) {
  for (const [a, b, s] of SUBS) {
    if (t < a || t >= b) continue;
    const u = clamp((t - a) / .16), al = Math.min(clamp((t - a) / .06), clamp((b - t) / .06));
    g.save(); g.globalAlpha = al; g.translate(540, SUB_Y); g.scale(lerp(.86, 1, E.back(u)), lerp(.86, 1, E.back(u)));
    rich(g, s, 0, 0, 66, { maxW: 960, stroke: 15 });
    g.restore();
  }
}

/* ---------------- 纹理 ---------------- */
const grainCv = mk(W / 2, H / 2);
(() => {
  const g = grainCv.getContext('2d'), id = g.createImageData(W / 2, H / 2), d = id.data, r = R(11);
  for (let i = 0; i < d.length; i += 4) { const v = r() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  g.putImageData(id, 0, 0);
})();
/* 豹纹斑点（单位方块内的随机位置，按需平铺） */
const LEO = (() => { const r = R(17); return Array.from({ length: 26 }, () => [r() * 300 - 150, r() * 300 - 150, 7 + r() * 7, r() * TAU]); })();
function leopard(g, x0, y0, w, h, base = '#E8A94A', sc = 1) {
  g.fillStyle = base; g.fillRect(x0, y0, w, h);
  for (let ox = x0 - 150 * sc; ox < x0 + w + 150 * sc; ox += 300 * sc) for (let oy = y0 - 150 * sc; oy < y0 + h + 150 * sc; oy += 300 * sc) {
    for (const [sx, sy, r, a] of LEO) {
      const x = ox + 150 * sc + sx * sc, y = oy + 150 * sc + sy * sc;
      if (x < x0 - 30 || x > x0 + w + 30 || y < y0 - 30 || y > y0 + h + 30) continue;
      g.fillStyle = '#6B3F1E'; ell(g, x, y, r * sc, r * .8 * sc, a); g.fill();
      g.fillStyle = '#C9852F'; ell(g, x, y, r * .45 * sc, r * .35 * sc, a); g.fill();
    }
  }
}
