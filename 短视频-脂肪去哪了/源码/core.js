'use strict';
/* 《你减掉的脂肪，去哪了？》—— 程序化横屏科普视频（1920×1080）。frame(t) 按时间 t（秒）确定性地画出一帧。
   core.js：工具函数、配色、时间轴、文字、证据卡、路线条、字幕。 */
const W = 1920, H = 1080;
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
  out2: u => 1 - Math.pow(1 - u, 2),
  in: u => u * u * u,
  in2: u => u * u,
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
/* 平滑的一维噪声，用来做漂浮 */
function wob(t, seed = 0, f = 1) { return Math.sin(t * f * 1.7 + seed * 12.9) * .5 + Math.sin(t * f * 2.9 + seed * 7.3) * .3 + Math.sin(t * f * 0.7 + seed * 3.1) * .2; }

/* ---------------- 配色 ---------------- */
const C = {
  bg0: '#070F1C', bg1: '#0D1B30', bg2: '#15294A', bg3: '#1E3A63',
  ink: '#0A1120', paper: '#F3EAD7', paperD: '#DCCFB2', pInk: '#2A2230',
  fat: '#FFC93C', fat2: '#FFB300', fatD: '#D98A00', fatL: '#FFE9A0',
  cyan: '#46D3F2', cyanD: '#1FA5C8', blue: '#3C8DFF', blueD: '#2A62C9',
  pink: '#FF5C8A', red: '#F2454B', green: '#3EDC97', purple: '#A58BFF', orange: '#FF8A3D',
  white: '#F5F8FF', mute: '#8FA6C4', dim: '#5B7396',
};
function hexA(hex, a) { // '#RRGGBB' + alpha → rgba()
  const n = parseInt(hex.slice(1), 16); return `rgba(${n >> 16 & 255},${n >> 8 & 255},${n & 255},${a})`;
}
function mix(h1, h2, u) {
  const a = parseInt(h1.slice(1), 16), b = parseInt(h2.slice(1), 16);
  const r = Math.round(lerp(a >> 16 & 255, b >> 16 & 255, u)), g = Math.round(lerp(a >> 8 & 255, b >> 8 & 255, u)), bl = Math.round(lerp(a & 255, b & 255, u));
  return `#${(r << 16 | g << 8 | bl).toString(16).padStart(6, '0')}`;
}

/* ---------------- 绘图小工具 ---------------- */
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function circ(g, x, y, r) { g.beginPath(); g.arc(x, y, Math.max(r, .01), 0, TAU); }
function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(rx, .01), Math.max(ry, .01), rot, 0, TAU); }
function poly(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }
function fs(g, fill, stroke, lw) { if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function star(g, x, y, r1, r2, n = 5, rot = -Math.PI / 2) { g.beginPath(); for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, r = i % 2 ? r2 : r1; g.lineTo(x + Math.cos(a) * r, y + Math.sin(a) * r); } g.closePath(); }
function withAlpha(g, a, fn) { if (a <= .001) return; g.save(); g.globalAlpha *= a; fn(); g.restore(); }
/* 先把一组东西画到离屏层，再整体半透明贴上（避免叠加处变深） */
function layer(g, alpha, fn) {
  if (alpha <= .001) return;
  if (alpha >= .999) { fn(g); return; }
  layerG.setTransform(1, 0, 0, 1, 0, 0); layerG.globalAlpha = 1; layerG.clearRect(0, 0, W, H);
  fn(layerG);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = alpha; g.drawImage(layerCv, 0, 0); g.restore();
}
/* 柔光：径向渐变的光斑（叠加模式） */
function glow(g, x, y, r, col, a = 1, add = true) {
  if (a <= .001 || r <= 0) return;
  g.save(); if (add) g.globalCompositeOperation = 'lighter';
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, hexA(col, a)); gr.addColorStop(.4, hexA(col, a * .38)); gr.addColorStop(1, hexA(col, 0));
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2); g.restore();
}
/* 光束（锥形） */
function beam(g, x, y, ang, len, w0, w1, col, a) {
  if (a <= .001) return;
  g.save(); g.translate(x, y); g.rotate(ang); g.globalCompositeOperation = 'lighter';
  const gr = g.createLinearGradient(0, 0, len, 0); gr.addColorStop(0, hexA(col, a)); gr.addColorStop(1, hexA(col, 0));
  g.fillStyle = gr; g.beginPath(); g.moveTo(0, -w0 / 2); g.lineTo(len, -w1 / 2); g.lineTo(len, w1 / 2); g.lineTo(0, w0 / 2); g.closePath(); g.fill(); g.restore();
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
/* 单行文字，{…} 部分用高亮色。o.stroke 为描边宽度。返回实际宽度 */
function rich(g, s, x, y, px, o = {}) {
  const parts = parseHL(s); g.font = F(px, o.font || 'black');
  const ws = parts.map(p => g.measureText(p[0]).width), tw = ws.reduce((a, b) => a + b, 0);
  const sc = Math.min(1, (o.maxW || 1500) / tw);
  g.save(); g.translate(x, y); g.scale(sc, sc);
  g.textAlign = 'left'; g.textBaseline = 'middle'; g.lineJoin = 'round';
  let cx = o.align === 'left' ? 0 : o.align === 'right' ? -tw : -tw / 2;
  const x0 = cx;
  if (o.stroke) {
    g.lineWidth = o.stroke; g.strokeStyle = o.strokeCol || 'rgba(5,10,20,.92)';
    parts.forEach((p, i) => { g.strokeText(p[0], cx, 0); cx += ws[i]; });
  }
  cx = x0;
  parts.forEach((p, i) => { g.fillStyle = p[1] ? (o.hl || C.fat) : (o.col || '#FFFFFF'); g.fillText(p[0], cx, 0); cx += ws[i]; });
  g.restore();
  return tw * sc;
}
/* 普通文字，支持多行 */
function text(g, s, x, y, px, col = C.white, k = 'bold', lh = 1.3, align = 'center') {
  g.font = F(px, k); g.fillStyle = col; g.textAlign = align; g.textBaseline = 'middle';
  const ls = String(s).split('\n'), tot = (ls.length - 1) * px * lh;
  ls.forEach((l, i) => g.fillText(l, x, y - tot / 2 + i * px * lh));
}
function textW(g, s, px, k = 'bold') { g.font = F(px, k); return Math.max(...String(s).split('\n').map(l => g.measureText(l).width)); }
/* 按宽度折行（中文逐字） */
function wrap(g, s, maxW, px, k = 'bold') {
  g.font = F(px, k); const out = []; let cur = '';
  for (const ch of String(s)) {
    if (ch === '\n') { out.push(cur); cur = ''; continue; }
    if (g.measureText(cur + ch).width > maxW && cur) { out.push(cur); cur = ch; } else cur += ch;
  }
  if (cur) out.push(cur);
  return out;
}
/* 带描边的大标题字（得意黑），p 为弹出进度 */
function title(g, s, x, y, px, p = 1, o = {}) {
  if (p <= .001) return;
  g.save(); g.translate(x, y); g.scale(p, p);
  rich(g, s, 0, 0, px, { font: 'fun', stroke: px * .16, ...o });
  g.restore();
}
/* 圆角标签 */
function tag(g, x, y, s, px, o = {}) {
  const w = textW(g, s, px, o.font || 'bold') + px * (o.padX || 1.1), nl = String(s).split('\n').length, h = nl * px * 1.25 + px * (o.padY || .6);
  g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot); if (o.sc !== undefined) g.scale(o.sc, o.sc);
  rr(g, -w / 2, -h / 2, w, h, o.r ?? h / 2); fs(g, o.fill || 'rgba(10,18,32,.8)', o.line === false ? null : (o.lineCol || hexA(C.white, .25)), o.lw || 2);
  text(g, s, 0, 2, px, o.col || C.white, o.font || 'bold');
  g.restore();
  return [w, h];
}
/* 红色印章（框 + 字），p：盖下的进度 */
function stamp(g, x, y, s, p, o = {}) {
  if (p <= 0) return;
  const sc = lerp(2.4, 1, E.out(clamp(p * 4))) * (o.sc || 1), a = clamp(p * 6);
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -.1); g.scale(sc, sc); g.globalAlpha *= a * .96;
  const px = o.px || 56, w = textW(g, s, px, 'black') + px * .9, h = px * 1.5, col = o.col || C.red;
  g.strokeStyle = col; g.lineWidth = 8; rr(g, -w / 2, -h / 2, w, h, 14); g.stroke();
  g.lineWidth = 2.5; rr(g, -w / 2 + 11, -h / 2 + 11, w - 22, h - 22, 8); g.stroke();
  text(g, s, 0, 3, px, col, 'black');
  g.restore();
}

/* ---------------- 背景与氛围 ---------------- */
const GRAINS = mk(960, 540);
(() => {
  const g = GRAINS.getContext('2d'), id = g.createImageData(960, 540), d = id.data, r = R(11);
  for (let i = 0; i < d.length; i += 4) { const v = r() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  g.putImageData(id, 0, 0);
})();
/* 深色渐变底 + 淡淡的六边形网格 + 暗角 */
function bgDark(g, t, o = {}) {
  const c0 = o.c0 || C.bg2, c1 = o.c1 || C.bg0;
  const gr = g.createRadialGradient(W * (o.cx ?? .5), H * (o.cy ?? .42), 80, W * .5, H * .5, W * .75);
  gr.addColorStop(0, c0); gr.addColorStop(1, c1);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  if (o.grid !== false) {
    g.save(); g.globalAlpha = o.gridA ?? .07; g.strokeStyle = o.gridCol || '#9FC4FF'; g.lineWidth = 1.5;
    const s = 64, dx = (t * (o.drift ?? 6)) % (s * 3), dy = 0;
    for (let row = -1; row < H / (s * .866) + 1; row++) for (let col = -1; col < W / (s * 1.5) + 2; col++) {
      const x = col * s * 1.5 - dx + 0, y = row * s * 1.732 + (col % 2 ? s * .866 : 0) + dy;
      g.beginPath(); for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; g.lineTo(x + Math.cos(a) * s * .5, y + Math.sin(a) * s * .5); } g.closePath(); g.stroke();
    }
    g.restore();
  }
}
function vignette(g, a = .55) {
  const gr = g.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, W * .72);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${a})`);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}
/* 漂浮的微粒（背景氛围） */
function motes(g, t, n = 40, col = '#BFE3FF', a = .35, seed = 3, sp = 1) {
  const r = R(seed);
  g.save(); g.fillStyle = col;
  for (let i = 0; i < n; i++) {
    const x0 = r() * W, y0 = r() * H, rad = 1.5 + r() * 3.5, ph = r() * TAU, v = (8 + r() * 22) * sp;
    const x = (x0 + Math.sin(t * .3 + ph) * 40 + W) % W, y = ((y0 - t * v) % H + H) % H;
    g.globalAlpha = a * (.4 + .6 * Math.sin(t * .8 + ph) ** 2); circ(g, x, y, rad); g.fill();
  }
  g.restore();
}

/* ---------------- 证据卡（论文档案）---------------- */
/* spec: {tag:'BMJ · 2014', n:'n = 150', title:'…', lines:['…','…'], foot:'…'}；p：弹出进度 */
function card(g, x, y, w, spec, p, o = {}) {
  if (p <= .001) return 0;
  const px = o.px || 26, lh = px * 1.42, pad = 26;
  g.save(); g.font = F(px, 'bold');
  const tl = wrap(g, spec.title || '', w - pad * 2, px + 4, 'black');
  const body = []; (spec.lines || []).forEach(l => wrap(g, l, w - pad * 2, px, 'bold').forEach(s => body.push(s)));
  const hTitle = tl.length * (px + 4) * 1.3;
  const h = 62 + hTitle + body.length * lh + (spec.foot ? px * 1.5 : 0) + pad * 1.15;
  g.translate(x, y); g.rotate((o.rot ?? -.012) * (1 + (1 - p) * 3)); g.scale(lerp(.9, 1, p), lerp(.9, 1, p));
  g.globalAlpha *= clamp(p * 2.5);
  // 投影
  rr(g, -w / 2 + 6, -h / 2 + 12, w, h, 18); g.fillStyle = 'rgba(0,0,0,.35)'; g.fill();
  // 纸
  rr(g, -w / 2, -h / 2, w, h, 18); const gr = g.createLinearGradient(0, -h / 2, 0, h / 2); gr.addColorStop(0, '#F7EFDD'); gr.addColorStop(1, C.paperD);
  g.fillStyle = gr; g.fill();
  // 顶部“胶带”
  g.save(); g.translate(0, -h / 2); g.rotate(.015); rr(g, -62, -14, 124, 30, 5); g.fillStyle = 'rgba(255,210,90,.75)'; g.fill(); g.restore();
  // 标签行
  let ty = -h / 2 + 50;
  g.font = F(px - 3, 'black'); const tw = g.measureText(spec.tag || '').width + 28;
  rr(g, -w / 2 + pad, ty - 17, tw, 34, 17); g.fillStyle = C.pInk; g.fill();
  g.fillStyle = C.paper; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(spec.tag || '', -w / 2 + pad + 14, ty + 1);
  if (spec.n) { g.fillStyle = '#9A5B1A'; g.textAlign = 'right'; g.font = F(px - 3, 'black'); g.fillText(spec.n, w / 2 - pad, ty + 1); }
  ty += 30;
  // 标题
  g.fillStyle = C.pInk; g.textAlign = 'left'; g.font = F(px + 4, 'black');
  tl.forEach((s, i) => g.fillText(s, -w / 2 + pad, ty + 18 + i * (px + 4) * 1.3));
  ty += hTitle + 8;
  // 正文
  g.font = F(px, 'bold');
  body.forEach((s, i) => {
    const parts = parseHL(s); let cx = -w / 2 + pad;
    parts.forEach(([txt, hl]) => { g.fillStyle = hl ? '#B3410B' : '#3B3340'; g.fillText(txt, cx, ty + 14 + i * lh); cx += g.measureText(txt).width; });
  });
  if (spec.foot) { g.font = F(px - 5, 'bold'); g.fillStyle = '#8A7C68'; g.fillText(spec.foot, -w / 2 + pad, h / 2 - pad * .8); }
  g.restore();
  return h;
}
/* 带出入场动画的证据卡：从右侧滑入 */
function evid(g, t, a, b, x, y, w, spec, o = {}) {
  if (t < a - .05 || t > b + .5) return;
  const pin = pop(t, a, .45), pout = 1 - E.in(seg(t, b, b + .35));
  const p = Math.min(pin, pout); if (p <= .001) return;
  const slide = (1 - E.out(seg(t, a, a + .5))) * 160;
  g.save(); g.translate(slide + (1 - pout) * 200, 0); card(g, x, y, w, spec, p, o); g.restore();
}

/* ---------------- 时间轴相关：字幕、路线条 ---------------- */
const SUBS = [];
TL.lines.forEach((l, i) => {
  if (l.spk !== 'N') return;
  const nextStart = TL.lines[i + 1] ? TL.lines[i + 1].v0 : 1e9;
  l.chunks.forEach(([t0, s], k) => {
    if (!s) return;
    const last = k + 1 >= l.chunks.length;
    const t1 = last ? Math.min(l.v1 + .4, nextStart - .03) : l.chunks[k + 1][0] - .04;   // 下一段一出现，这一段立刻让位
    SUBS.push([t0 - .04, t1, s, last]);
  });
});
const SUB_Y = 972;
function drawSubs(g, t, dim = 1) {
  for (const [a, b, s, last] of SUBS) {
    if (t < a || t >= b) continue;
    const u = clamp((t - a) / .16), al = Math.min(clamp((t - a) / .07), last ? clamp((b - t) / .12) : 1) * dim;
    g.save(); g.globalAlpha = al; g.translate(W / 2, SUB_Y + (1 - E.out(u)) * 10);
    rich(g, s, 0, 0, 58, { maxW: 1640, stroke: 13, hl: C.fat });
    g.restore();
  }
}
/* 底部压暗，保证字幕可读 */
function subShade(g, a = .5) {
  const gr = g.createLinearGradient(0, H - 230, 0, H); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(2,6,14,${a})`);
  g.fillStyle = gr; g.fillRect(0, H - 230, W, 230);
}
