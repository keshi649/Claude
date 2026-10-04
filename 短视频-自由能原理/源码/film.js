'use strict';
/* 《大脑只做一件事》—— 自由能原理短视频。frame(t) 按时间 t（秒）确定性地画出一帧。 */
const W = 1080, H = 1920, DURATION = 186;
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
function win(t, a, b, fi = .35, fo = .35) { if (t < a || t > b) return 0; return Math.min(fi > 0 ? clamp((t - a) / fi) : 1, fo > 0 ? clamp((b - t) / fo) : 1); }
function R(seed) { let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(a, b, c) { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function circ(g, x, y, r) { g.beginPath(); g.arc(x, y, Math.max(r, .01), 0, TAU); }
function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(rx, .01), Math.max(ry, .01), rot, 0, TAU); }
function bez(p0, p1, p2, p3, u) { const v = 1 - u; return [v * v * v * p0[0] + 3 * v * v * u * p1[0] + 3 * v * u * u * p2[0] + u * u * u * p3[0], v * v * v * p0[1] + 3 * v * v * u * p1[1] + 3 * v * u * u * p2[1] + u * u * u * p3[1]]; }
function bezPath(g, P) { g.beginPath(); g.moveTo(P[0][0], P[0][1]); g.bezierCurveTo(P[1][0], P[1][1], P[2][0], P[2][1], P[3][0], P[3][1]); }
function smoothPath(g, pts) {
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]);
  for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; g.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); }
  const l = pts[pts.length - 1]; g.lineTo(l[0], l[1]);
}

/* ---------------- 颜色与文字 ---------------- */
const C = { cyan: '#55E6EC', amber: '#FFC457', red: '#FF4D5E', green: '#5DF2A2', white: '#F3F6FC', dim: '#8C97AF', brain: '#F2A9D9', dark: '#0A0E18' };
const COL = { r: C.red, c: C.cyan, a: C.amber, g: C.green, d: C.dim, w: C.white };
function hexRGB(h) { const n = parseInt(h.slice(1), 16); return [n >> 16, (n >> 8) & 255, n & 255]; }
function rgba(h, a) { const [r, g, b] = hexRGB(h); return `rgba(${r},${g},${b},${a})`; }
function mixHex(a, b, u) { const A = hexRGB(a), B = hexRGB(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(u))).toString(16).padStart(2, '0')).join(''); }
function F(px, w = 'm') { const fam = w === 's' ? 'SMI, SHSH' : w === 'h' ? 'SHSH' : 'SHS'; return `${px}px ${fam}, "WenQuanYi Zen Hei", sans-serif`; }
function glow(g, col, blur) { g.shadowColor = col; g.shadowBlur = blur; }
function noGlow(g) { g.shadowBlur = 0; g.shadowColor = 'transparent'; }
function T(g, s, x, y, px, w = 'm', col = C.white, o = {}) {
  g.font = F(px, w); g.fillStyle = col; g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
  if (o.ls) g.letterSpacing = o.ls + 'px';
  if (o.glow) glow(g, o.glow, o.blur || 30);
  g.fillText(s, x, y);
  if (o.ls) g.letterSpacing = '0px';
  if (o.glow) noGlow(g);
}
function parseRich(s) {
  const out = [], re = /\{([rcagdw])\|([^}]*)\}/g; let i = 0, m;
  while ((m = re.exec(s))) { if (m.index > i) out.push([null, s.slice(i, m.index)]); out.push([m[1], m[2]]); i = re.lastIndex; }
  if (i < s.length) out.push([null, s.slice(i)]);
  return out;
}
function richLine(g, s, x, y, px, w, base) {
  g.font = F(px, w); g.textAlign = 'left'; g.textBaseline = 'middle';
  const segs = parseRich(s), tw = segs.reduce((a, [, t]) => a + g.measureText(t).width, 0);
  let cx = x - tw / 2;
  for (const [k, t] of segs) { g.fillStyle = k ? COL[k] : base; g.fillText(t, cx, y); cx += g.measureText(t).width; }
}
function rich(g, s, x, y, px, w = 'm', base = C.white, lh = 1.45) {
  const ls = s.split('\n'), tot = (ls.length - 1) * px * lh;
  ls.forEach((l, i) => richLine(g, l, x, y - tot / 2 + i * px * lh, px, w, base));
}
function bigText(g, s, x, y, px, a = 1, o = {}) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a;
  const p = o.pop ? E.back(clamp(o.pop)) : 1;
  g.translate(x, y + (o.rise || 0)); if (p !== 1) g.scale(lerp(.6, 1, p), lerp(.6, 1, p));
  glow(g, o.shadow || 'rgba(0,0,0,.75)', o.blur || 26);
  rich(g, s, 0, 0, px, o.w || 's', o.col || C.white, o.lh || 1.3);
  g.restore();
}
function pill(g, s, x, y, px, col, a = 1, sc = 1) {
  if (a <= 0 || sc <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(sc, sc);
  g.font = F(px, 'h'); const w = g.measureText(s).width + px * 1.3, h = px * 1.75;
  g.fillStyle = rgba(col, .16); g.strokeStyle = col; g.lineWidth = 3.5; glow(g, col, 18);
  rr(g, -w / 2, -h / 2, w, h, h / 2); g.fill(); g.stroke(); noGlow(g);
  g.fillStyle = col; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(s, 0, 2);
  g.restore();
}
function bubble(g, s, x, y, px, col, a = 1, o = {}) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); const sc = o.sc ?? 1; g.scale(sc, sc);
  g.font = F(px, 'h');
  const ls = s.split('\n'), w = Math.max(...ls.map(l => g.measureText(l.replace(/\{[rcagdw]\||\}/g, '')).width)) + px * 1.4 + (o.extraW || 0), h = ls.length * px * 1.4 + px * .9;
  g.fillStyle = 'rgba(8,12,22,.92)'; g.strokeStyle = col; g.lineWidth = 4; glow(g, rgba(col, .6), 22);
  if (o.tail) { g.beginPath(); g.moveTo(-18, h / 2 - 4); g.lineTo(o.tail[0], o.tail[1]); g.lineTo(18, h / 2 - 4); g.closePath(); g.fill(); g.stroke(); }
  rr(g, -w / 2, -h / 2, w, h, 26); g.fill(); g.stroke(); noGlow(g);
  if (o.tail) { g.fillStyle = 'rgba(8,12,22,1)'; g.fillRect(-16, h / 2 - 8, 32, 6); }
  rich(g, s, (o.extraW || 0) / 2, 2, px, 'h', col, 1.4);
  g.restore();
}
function check(g, x, y, s, col, p = 1) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = 11; g.lineCap = 'round'; g.lineJoin = 'round'; glow(g, col, 20);
  g.beginPath(); const u = clamp(p); g.moveTo(-28, 2);
  if (u < .35) g.lineTo(lerp(-28, -8, u / .35), lerp(2, 22, u / .35)); else { g.lineTo(-8, 22); g.lineTo(lerp(-8, 30, (u - .35) / .65), lerp(22, -22, (u - .35) / .65)); }
  g.stroke(); g.restore();
}
function cross(g, x, y, s, col) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = 11; g.lineCap = 'round'; glow(g, col, 20);
  g.beginPath(); g.moveTo(-22, -22); g.lineTo(22, 22); g.moveTo(22, -22); g.lineTo(-22, 22); g.stroke(); g.restore();
}
function arrowHead(g, x, y, ang, size, col) {
  g.save(); g.translate(x, y); g.rotate(ang); g.fillStyle = col;
  g.beginPath(); g.moveTo(size, 0); g.lineTo(-size * .7, -size * .75); g.lineTo(-size * .35, 0); g.lineTo(-size * .7, size * .75); g.closePath(); g.fill(); g.restore();
}
function withLayer(g, alpha, fn) {
  if (alpha <= 0.001) return;
  if (alpha >= 0.999) { g.save(); fn(g); g.restore(); return; }
  layerG.setTransform(1, 0, 0, 1, 0, 0); layerG.globalAlpha = 1; layerG.globalCompositeOperation = 'source-over'; layerG.clearRect(0, 0, W, H);
  layerG.save(); fn(layerG); layerG.restore();
  g.save(); g.globalAlpha = alpha; g.drawImage(layerCv, 0, 0); g.restore();
}

/* ---------------- 背景纹理 ---------------- */
const bgCv = mk();
(() => {
  const g = bgCv.getContext('2d');
  const gr = g.createRadialGradient(540, 820, 40, 540, 820, 1300);
  gr.addColorStop(0, '#131C33'); gr.addColorStop(.5, '#0A1020'); gr.addColorStop(1, '#03040A');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(150,180,230,.075)';
  for (let y = 30; y < H; y += 60) for (let x = 30; x < W; x += 60) { circ(g, x, y, 1.7); g.fill(); }
})();
const vigCv = mk();
(() => {
  const g = vigCv.getContext('2d');
  const gr = g.createRadialGradient(540, 860, 520, 540, 860, 1250);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.55)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
})();
const GRAINS = [0, 1, 2, 3].map(k => {
  const c = mk(W / 2, H / 2), g = c.getContext('2d'), id = g.createImageData(W / 2, H / 2), d = id.data, r = R(100 + k);
  for (let i = 0; i < d.length; i += 4) { const v = r() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  g.putImageData(id, 0, 0); return c;
});

/* ---------------- 大脑 ---------------- */
const BRAIN_SEGS = [
  [[-178, 30], [-215, -40], [-170, -125], [-90, -145]],
  [[-90, -145], [-30, -172], [60, -165], [110, -130]],
  [[110, -130], [175, -95], [205, -20], [185, 40]],
  [[185, 40], [175, 75], [140, 92], [105, 88]],
  [[105, 88], [80, 86], [60, 70], [40, 74]],
  [[40, 74], [10, 80], [-10, 108], [-60, 100]],
  [[-60, 100], [-110, 96], [-160, 80], [-178, 30]],
];
const BRAIN_OUTLINE = (() => {
  const raw = [], segOf = [];
  BRAIN_SEGS.forEach((sg, si) => { for (let k = 0; k < 40; k++) { raw.push(bez(sg[0], sg[1], sg[2], sg[3], k / 40)); segOf.push(si); } });
  const n = raw.length, out = []; let s = 0;
  for (let i = 0; i < n; i++) {
    const p = raw[i], a = raw[(i - 1 + n) % n], b = raw[(i + 1) % n];
    if (i) s += Math.hypot(p[0] - raw[i - 1][0], p[1] - raw[i - 1][1]);
    let nx = b[1] - a[1], ny = -(b[0] - a[0]); const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    if (nx * p[0] + ny * (p[1] + 20) < 0) { nx = -nx; ny = -ny; }
    const amt = segOf[i] === 4 || segOf[i] === 5 ? .25 : 1;
    const bump = 9 * amt * Math.abs(Math.sin(s / 50 * Math.PI));
    out.push([p[0] + nx * bump, p[1] + ny * bump]);
  }
  return out;
})();
function brainPath(g) { g.beginPath(); BRAIN_OUTLINE.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }
function catmull(pts, nPer = 10) {
  const out = [];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)];
    for (let k = 0; k < nPer; k++) {
      const u = k / nPer, u2 = u * u, u3 = u2 * u;
      out.push([0, 1].map(j => .5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u2 + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u3)));
    }
  }
  out.push(pts[pts.length - 1]);
  return out;
}
function wiggle(pts, A, lam) {
  const out = []; let s = 0;
  for (let i = 0; i < pts.length; i++) {
    if (i) s += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
    let nx = -(b[1] - a[1]), ny = b[0] - a[0]; const l = Math.hypot(nx, ny) || 1; nx /= l; ny /= l;
    const w = A * Math.sin(s / lam * TAU) * Math.min(1, s / 18);
    out.push([pts[i][0] + nx * w, pts[i][1] + ny * w]);
  }
  return out;
}
const BRAIN_WORMS = [
  [[[-95, 55], [-50, 38], [0, 28], [50, 14], [85, -6]], 3, 1],
  [[[30, -160], [16, -120], [24, -80], [6, -40], [-4, 14]], 6, .9],
  [[[-20, -150], [-34, -110], [-26, -70], [-44, -28], [-50, 10]], 6, .75],
  [[[78, -146], [62, -108], [70, -70], [52, -30], [50, 4]], 6, .75],
  [[[-160, -80], [-120, -98], [-80, -110], [-50, -128]], 6, .7],
  [[[-172, 0], [-140, -24], [-100, -40], [-70, -60]], 6, .7],
  [[[80, -60], [115, -72], [150, -62], [176, -40]], 6, .7],
  [[[-60, 84], [-10, 66], [50, 52], [110, 44], [160, 52]], 5, .75],
  [[[120, -122], [146, -96], [160, -70]], 5, .6],
  [[[100, -20], [140, -12], [176, 10]], 5, .6],
  [[[-150, 40], [-122, 30], [-98, 14]], 4, .6],
  [[[-130, -60], [-100, -72], [-82, -90]], 4, .55],
].map(([p, a, w]) => Object.assign(wiggle(catmull(p, 12), a, 26), { w }));
function wormPoint(w, u) { const f = clamp(u) * (w.length - 1), i = Math.min(Math.floor(f), w.length - 2), v = f - i; return [lerp(w[i][0], w[i + 1][0], v), lerp(w[i][1], w[i + 1][1], v)]; }
/* o: alpha, glow(0..1), col, fire(火花数), fireCol, t */
function drawBrain(g, x, y, s, o = {}) {
  if (s <= 0) return;
  const col = o.col || C.brain, t = o.t || 0, lw = o.lw || 5.5;
  g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha *= (o.alpha ?? 1);
  g.lineJoin = 'round'; g.lineCap = 'round';
  // 脑干
  g.beginPath(); g.moveTo(48, 78); g.quadraticCurveTo(56, 135, 60, 182); g.lineTo(94, 180); g.quadraticCurveTo(90, 130, 100, 84);
  g.fillStyle = C.dark; g.fill(); g.fillStyle = rgba(col, .12); g.fill(); g.strokeStyle = col; g.lineWidth = lw; g.stroke();
  // 小脑
  g.save(); ell(g, 128, 98, 64, 38, -.12); g.fillStyle = C.dark; g.fill(); g.fillStyle = rgba(col, .15); g.fill(); g.stroke(); g.clip();
  g.lineWidth = lw * .55; g.strokeStyle = rgba(col, .6);
  for (let k = -3; k <= 3; k++) { g.beginPath(); g.moveTo(60, 98 + k * 11); g.quadraticCurveTo(128, 96 + k * 11, 196, 90 + k * 11); g.stroke(); }
  g.restore();
  // 大脑
  brainPath(g); g.fillStyle = C.dark; g.fill(); g.fillStyle = rgba(col, .14 + .12 * (o.glow || 0)); g.fill();
  if (o.glow) glow(g, col, 46 * o.glow);
  g.strokeStyle = col; g.lineWidth = lw; g.stroke(); noGlow(g);
  g.save(); brainPath(g); g.clip();
  for (const w of BRAIN_WORMS) { g.strokeStyle = rgba(col, .45 + .5 * w.w); g.lineWidth = lw * (.45 + .5 * w.w); smoothPath(g, w); g.stroke(); }
  if (o.fire) {
    const fc = o.fireCol || '#FFFFFF';
    for (let i = 0; i < o.fire; i++) {
      const cyc = t * .9 + i * .618, k = Math.floor(cyc), u = cyc - k;
      const w = BRAIN_WORMS[Math.floor(hash(i, k, 3) * BRAIN_WORMS.length)];
      const [px, py] = wormPoint(w, u);
      const a = Math.sin(u * Math.PI);
      g.fillStyle = rgba(fc, .9 * a); glow(g, fc, 18); circ(g, px, py, 5.5); g.fill(); noGlow(g);
    }
  }
  g.restore();
  g.restore();
}

/* ---------------- 图标与角色 ---------------- */
function eyeIcon(g, x, y, s, col) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = 5; g.lineJoin = 'round';
  g.fillStyle = C.dark; g.beginPath(); g.moveTo(-52, 0); g.quadraticCurveTo(0, -44, 52, 0); g.quadraticCurveTo(0, 44, -52, 0); g.closePath(); g.fill(); g.stroke();
  circ(g, 0, 0, 17); g.stroke(); g.fillStyle = col; circ(g, 0, 0, 7.5); g.fill();
  g.restore();
}
function earIcon(g, x, y, s, col) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = 5; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-18, 40); g.bezierCurveTo(-32, 10, -36, -42, 4, -48); g.bezierCurveTo(42, -50, 46, -6, 22, 12); g.bezierCurveTo(8, 24, 10, 42, -6, 48); g.stroke();
  g.beginPath(); g.moveTo(-8, 2); g.bezierCurveTo(-10, -24, 18, -28, 20, -8); g.stroke();
  g.restore();
}
function handIcon(g, x, y, s, col) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = 5; g.lineJoin = 'round'; g.lineCap = 'round'; g.fillStyle = C.dark;
  for (let i = 0; i < 4; i++) { rr(g, -31 + i * 16, -54 + Math.abs(i - 1.5) * 7, 14, 50, 7); g.fill(); g.stroke(); }
  rr(g, -32, -16, 64, 58, 18); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(31, 22); g.quadraticCurveTo(54, 8, 52, -14); g.stroke();
  g.restore();
}
function cupIcon(g, x, y, s, col, o = {}) { // (x,y) 为杯底中心
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = o.lw || 6; g.lineJoin = 'round'; g.lineCap = 'round';
  if (o.dash) g.setLineDash(o.dash);
  if (o.glow) glow(g, col, o.glow);
  g.beginPath(); g.moveTo(-50, -120); g.lineTo(50, -120); g.lineTo(40, 0); g.lineTo(-40, 0); g.closePath();
  if (o.fill) { g.fillStyle = o.fill; g.fill(); }
  g.stroke();
  g.beginPath(); g.moveTo(47, -96); g.bezierCurveTo(96, -96, 90, -30, 42, -32); g.stroke();
  if (o.steam) { g.lineWidth = 4; for (const sx of [-18, 12]) { g.beginPath(); g.moveTo(sx, -138); g.bezierCurveTo(sx - 14, -160, sx + 14, -176, sx, -198); g.stroke(); } }
  g.restore();
}
function catIcon(g, x, y, s, col, o = {}) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = o.lw || 6; g.lineJoin = 'round'; g.lineCap = 'round';
  if (o.glow) glow(g, col, o.glow);
  g.beginPath(); g.moveTo(-52, -10); g.lineTo(-46, -68); g.lineTo(-18, -42); g.quadraticCurveTo(0, -48, 18, -42); g.lineTo(46, -68); g.lineTo(52, -10);
  g.bezierCurveTo(56, 42, -56, 42, -52, -10); g.closePath();
  g.fillStyle = o.fill || C.dark; g.fill(); g.stroke(); noGlow(g);
  g.fillStyle = col; ell(g, -20, -6, 5.5, 9); g.fill(); ell(g, 20, -6, 5.5, 9); g.fill();
  g.beginPath(); g.moveTo(-6, 10); g.lineTo(6, 10); g.lineTo(0, 17); g.closePath(); g.fill();
  g.lineWidth = 3; for (const sg of [-1, 1]) { g.beginPath(); g.moveTo(sg * 24, 15); g.lineTo(sg * 68, 9); g.moveTo(sg * 24, 22); g.lineTo(sg * 66, 27); g.stroke(); }
  g.restore();
}
function cellIcon(g, x, y, s, col, t) {
  g.save(); g.translate(x, y); g.scale(s, s); g.strokeStyle = col; g.lineWidth = 5; glow(g, col, 16);
  g.beginPath();
  for (let i = 0; i <= 48; i++) { const a = i / 48 * TAU, r = 58 + 4 * Math.sin(a * 5 + t * 2); g.lineTo(Math.cos(a) * r, Math.sin(a) * r); }
  g.closePath(); g.fillStyle = rgba(col, .12); g.fill(); g.stroke(); noGlow(g);
  g.fillStyle = rgba(col, .5); circ(g, 8, -6, 18); g.fill(); g.stroke();
  for (let i = 0; i < 6; i++) { const a = i * 1.1 + t * .5; g.fillStyle = rgba(col, .6); circ(g, Math.cos(a) * 36, Math.sin(a) * 30 + 8, 4); g.fill(); }
  g.restore();
}
function drawFish(g, x, y, s, rot, o = {}) {
  const t = o.t || 0, wag = Math.sin(t * (o.wagF || 9)) * (o.wagA ?? .35);
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s * (o.flip ? -1 : 1), s);
  g.lineJoin = 'round'; g.lineCap = 'round'; g.lineWidth = 5; g.strokeStyle = '#3A1C0A';
  g.save(); g.translate(-64, 0); g.rotate(wag);
  g.fillStyle = '#FF8A3D'; g.beginPath(); g.moveTo(8, 0); g.lineTo(-44, -36); g.quadraticCurveTo(-30, 0, -44, 36); g.closePath(); g.fill(); g.stroke(); g.restore();
  g.fillStyle = '#FF8A3D'; g.beginPath(); g.moveTo(-26, -38); g.quadraticCurveTo(-4, -76, 24, -40); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#FFA650'; ell(g, 0, 0, 76, 45); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(255,244,228,.75)'; g.lineWidth = 8; g.beginPath(); g.moveTo(-16, -38); g.quadraticCurveTo(-28, 0, -16, 38); g.stroke();
  g.strokeStyle = '#3A1C0A'; g.lineWidth = 4; g.beginPath(); g.arc(4, 2, 26, -.75, .75); g.stroke();
  g.lineWidth = 5;
  if (o.dead) { g.beginPath(); g.moveTo(33, -20); g.lineTo(49, -4); g.moveTo(49, -20); g.lineTo(33, -4); g.stroke(); }
  else { g.fillStyle = '#FFFFFF'; circ(g, 41, -11, 13); g.fill(); g.stroke(); g.fillStyle = '#16161E'; circ(g, 44 + (o.look || 0), -11, 6.5); g.fill(); }
  g.beginPath(); if (o.gasp) { ell(g, 70, 10, 6, 3 + 6 * o.gasp); } else { g.moveTo(60, 14); g.quadraticCurveTo(66, 19, 72, 12); } g.stroke();
  g.restore();
}
/* 线描小人。o: x,y(脚底), s, pose: sit|stand|walk, t, col, look, expr, walkPh */
function drawPerson(g, o) {
  g.save(); g.translate(o.x, o.y); g.scale(o.s || 1, o.s || 1);
  const col = o.col || C.white, fill = o.fill || '#161D30';
  g.lineJoin = 'round'; g.lineCap = 'round'; g.strokeStyle = col; g.lineWidth = 6; g.fillStyle = fill;
  let hx, hy;
  if (o.pose === 'sit') {
    rr(g, -70, -200, 104, 170, [52, 52, 24, 24]); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(-30, -36); g.quadraticCurveTo(50, -170, 96, -74); g.quadraticCurveTo(116, -20, 70, 0); g.lineTo(-40, 0); g.closePath(); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(84, 0); g.lineTo(122, 0); g.stroke();
    g.beginPath(); g.moveTo(-26, -150); g.quadraticCurveTo(30, -96, 86, -100); g.stroke();
    fill && (g.fillStyle = fill); circ(g, 88, -100, 12); g.fill(); g.stroke();
    hx = -12 + (o.headDX || 0); hy = -250;
  } else {
    const ph = o.walkPh || 0, sw = o.pose === 'walk' ? Math.sin(ph) * 24 : 0;
    g.beginPath(); g.moveTo(-18, -86); g.lineTo(-18 + sw, 0); g.moveTo(18, -86); g.lineTo(18 - sw, 0); g.stroke();
    rr(g, -48, -232, 96, 156, [48, 48, 26, 26]); g.fill(); g.stroke();
    const aw = o.pose === 'walk' ? Math.sin(ph) * 20 : 0;
    if (o.armUp) { g.beginPath(); g.moveTo(40, -196); g.lineTo(78, -270); g.stroke(); }
    else { g.beginPath(); g.moveTo(40, -196); g.lineTo(54 - aw, -110); g.stroke(); }
    g.beginPath(); g.moveTo(-40, -196); g.lineTo(-54 + aw, -110); g.stroke();
    hx = (o.headDX || 0); hy = -288;
  }
  g.fillStyle = fill; circ(g, hx, hy, 50); g.fill(); g.stroke();
  const lx = o.look || 0, e = o.expr || 'neutral';
  g.fillStyle = col;
  if (e === 'sleep') { g.lineWidth = 4; for (const sx of [-18, 18]) { g.beginPath(); g.arc(hx + sx + lx, hy - 2, 8, .15 * Math.PI, .85 * Math.PI); g.stroke(); } }
  else { for (const sx of [-18, 18]) { circ(g, hx + sx + lx, hy - 4, e === 'wow' ? 7 : 5.5); g.fill(); } }
  g.lineWidth = 4; g.beginPath();
  if (e === 'sad') { g.moveTo(hx - 12 + lx, hy + 24); g.quadraticCurveTo(hx + lx, hy + 14, hx + 12 + lx, hy + 24); }
  else if (e === 'wow') { ell(g, hx + lx, hy + 20, 7, 9); }
  else if (e === 'smile') { g.moveTo(hx - 14 + lx, hy + 14); g.quadraticCurveTo(hx + lx, hy + 28, hx + 14 + lx, hy + 14); }
  else { g.moveTo(hx - 9 + lx, hy + 20); g.lineTo(hx + 9 + lx, hy + 20); }
  g.stroke();
  g.restore();
}

/* ---------------- 字幕 ---------------- */
const CAPS = [
  [6.0, 7.9, '刚才那一下「咯噔」，'],
  [7.9, 9.5, '科学家给它起了个名字：'],
  [10.5, 12.7, '而你的大脑，这辈子只忙一件事——'],
  [12.7, 14.15, '{c|把意外降到最低}。'],
  [18.3, 21.2, '你的大脑，被关在一个漆黑的盒子里。'],
  [21.2, 24.2, '它从没亲眼见过光，也没亲耳听过声音。'],
  [24.2, 27.2, '它收到的，只有一串串{a|电信号}。'],
  [27.2, 29.5, '所以，它只能——{c|猜}。'],
  [29.8, 32.6, '它不停地往下发送「{c|预测}」，'],
  [32.6, 35.4, '再拿{a|感官信号}来对答案。'],
  [35.6, 38.3, '对上了：{g|安静}，几乎什么都不用上报。'],
  [38.4, 41.1, '对不上：{r|报警}！这就是「预测误差」。'],
  [49.0, 51.8, '发现了吗？好几处字的顺序是乱的。'],
  [51.8, 54.0, '可你照样读得很顺——'],
  [54.0, 56.5, '因为大脑先{c|猜}出了意思，再让你「看见」它。'],
  [62.2, 65.6, '对一条鱼来说，水里的一切都在意料之中。'],
  [65.8, 68.6, '到了岸上——处处是{r|意外}。'],
  [68.8, 71.2, '然后……就没有然后了。'],
  [71.5, 74.8, '你也一样：体温、血糖、血压、酸碱度……'],
  [74.9, 78.7, '活着，就是把自己守在\n一小撮「{g|不意外}」的状态里。'],
  [79.0, 81.8, '而宇宙的默认方向，是——{r|散掉}。'],
  [81.9, 85.0, '生命，就是一团{c|拒绝散掉}的秩序。'],
  [85.3, 88.3, '但「意外」有个麻烦：没法直接算。'],
  [88.3, 91.3, '要算它，得先知道世界的{a|全部真相}。'],
  [91.3, 93.6, '弗里斯顿找了一个替身——'],
  [93.6, 95.6, '「{c|自由能}」。'],
  [95.6, 98.6, '它永远盖在「意外」的头顶上。'],
  [98.6, 101.6, '把盖子往下压，意外也只能跟着往下。'],
  [101.6, 104.4, '而这个盖子，大脑自己就算得出来——'],
  [104.4, 107.5, '大致就是：你的预测，{r|错了多少}。'],
  [110.6, 113.2, '第一条：{c|改变你的猜测}。'],
  [113.2, 116.6, '草丛里有条「蛇」——走近一看，是根绳子。'],
  [116.7, 120.2, '猜测一更新，误差就没了。\n这就是{c|感知}和{c|学习}。'],
  [120.5, 123.6, '第二条：{a|改变世界}，让它符合你的猜测。'],
  [123.6, 126.8, '大脑先预测：「我的手，已经握住了杯子。」'],
  [126.8, 129.8, '为了消掉这份误差——手，就动了。'],
  [129.9, 133.5, '在弗里斯顿看来，每个动作，\n都是一个{c|自我实现的预言}。'],
  [135.5, 139.4, '如果只想避开意外，那躲进黑屋子\n一动不动，岂不完美？'],
  [139.4, 142.0, '这就是著名的「{a|黑屋子难题}」。'],
  [142.0, 146.0, '可真待上三天：你会饿、会渴、会慌——\n意外只会越来越多。'],
  [146.0, 150.0, '大脑要压低的，不只是此刻的意外，\n还有{c|未来}所有的意外。'],
  [150.0, 153.2, '所以它会主动去探索：\n现在吃一点小意外，'],
  [153.2, 155.6, '换来将来少很多大意外。'],
  [155.6, 157.6, '——这，就是{a|好奇心}。'],
  [157.9, 159.5, '最后，再盯一次这个球。'],
  [162.4, 165.0, '这次，没那么「咯噔」了吧？'],
  [165.0, 168.4, '因为就在刚才，你的大脑{c|更新了模型}。'],
  [168.5, 171.5, '从一个细胞，到此刻的你——'],
  [171.5, 174.6, '所有活着的东西，都在做同一件事：'],
  [174.6, 178.0, '{c|猜}，{r|被纠正}，再猜得{g|好一点}。'],
];
const CAP_Y = 1440;
function drawCaption(g, t, c) {
  const [a, b, text] = c; const al = win(t, a, b, .22, .22); if (!al) return;
  const rise = (1 - E.out(clamp((t - a) / .4))) * 14, nl = text.split('\n').length;
  g.save(); g.globalAlpha = al;
  g.save(); g.translate(W / 2, CAP_Y); g.scale(1, .17 + .09 * nl);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, 640); gr.addColorStop(0, 'rgba(0,0,0,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(-640, -640, 1280, 1280); g.restore();
  glow(g, 'rgba(0,0,0,.85)', 14);
  g.font = F(56, 'm');
  const maxW = Math.max(...text.split('\n').map(l => g.measureText(l.replace(/\{[rcagdw]\||\}/g, '')).width));
  rich(g, text, W / 2, CAP_Y + rise, maxW > 940 ? Math.floor(56 * 940 / maxW) : 56, 'm', C.white, 1.45);
  g.restore();
}

/* ================= 场景 ================= */

/* ---- 弹跳的球（开场与结尾回扣共用）---- */
const BALL = (() => {
  const b = { floor: 1250, r: 72, hmax: 520, P: .45, T0: .30, c: .06, freezeH: 150 };
  const uf = (1 + Math.sqrt(1 - b.freezeH / b.hmax)) / 2;
  b.TF = b.T0 + 3 * b.P + b.c + (b.P - b.c) * uf;   // 定格时刻（本应在 T0+4P 落地）
  return b;
})();
const REPLAY0 = 159.6;          // 结尾回扣：球从这一刻开始下落
const HOOK_UNFREEZE = 2.55;     // 开场「视频没卡」出现
const REPLAY_UNFREEZE = 162.25;
function ballState(lt) {
  const B = BALL; lt = Math.min(Math.max(lt, 0), B.TF);
  const fl = B.P - B.c; let h, sq = 0;
  if (lt < B.T0) { const u = (lt - (B.T0 - fl)) / fl; h = B.hmax * 4 * u * (1 - u); }
  else {
    const k = Math.floor((lt - B.T0) / B.P), d = lt - B.T0 - k * B.P;
    if (d < B.c) { h = 0; sq = Math.sin(d / B.c * Math.PI); } else { const u = (d - B.c) / fl; h = B.hmax * 4 * u * (1 - u); }
  }
  const sy = 1 - .24 * sq, sx = 1 + .2 * sq;
  return { y: B.floor - B.r * sy - h, sx, sy, h };
}
function drawBall(g, x, y, r, sx = 1, sy = 1) {
  g.save(); g.translate(x, y); g.scale(sx, sy);
  const gr = g.createRadialGradient(-r * .35, -r * .4, r * .1, 0, 0, r);
  gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(.6, '#E6EBF5'); gr.addColorStop(1, '#A9B4CA');
  glow(g, 'rgba(210,230,255,.6)', 55); g.fillStyle = gr; circ(g, 0, 0, r); g.fill();
  g.restore();
}
function ghostBall(g, x, y, r, sx, sy, col = C.cyan) {
  g.save(); g.translate(x, y); g.scale(sx, sy);
  g.fillStyle = rgba(col, .1); circ(g, 0, 0, r); g.fill();
  g.setLineDash([14, 10]); g.strokeStyle = col; g.lineWidth = 5; glow(g, col, 20); circ(g, 0, 0, r); g.stroke();
  g.restore();
}
function drawBallStage(g, lt) {
  const B = BALL, s = ballState(lt), L = Math.min(lt, B.TF);
  const fg = g.createLinearGradient(140, 0, 940, 0);
  fg.addColorStop(0, 'rgba(190,210,245,0)'); fg.addColorStop(.5, 'rgba(190,210,245,.6)'); fg.addColorStop(1, 'rgba(190,210,245,0)');
  g.fillStyle = fg; g.fillRect(140, B.floor - 1.5, 800, 3);
  for (let k = 0; k < 4; k++) {
    const age = L - (B.T0 + k * B.P); if (age < 0 || age > .7) continue;
    const rx = 90 + age * 520; g.strokeStyle = `rgba(200,225,255,${.5 * (1 - age / .7)})`; g.lineWidth = 3; ell(g, 540, B.floor, rx, rx * .12); g.stroke();
  }
  const hn = s.h / B.hmax;
  g.fillStyle = `rgba(0,0,0,${.6 - .4 * hn})`; ell(g, 540, B.floor + 4, 78 * (1 - .45 * hn), 13 * (1 - .45 * hn)); g.fill();
  const rg = g.createRadialGradient(540, B.floor, 0, 540, B.floor, 200);
  rg.addColorStop(0, `rgba(200,225,255,${.16 * (1 - hn)})`); rg.addColorStop(1, 'rgba(200,225,255,0)');
  g.fillStyle = rg; g.fillRect(340, B.floor - 40, 400, 80);
  drawBall(g, 540, s.y, B.r, s.sx, s.sy);
  return s;
}
function predictionMarks(g, s, a, match) {
  // 预测（青色虚线球） vs 实际（白球）
  if (a <= 0) return;
  const B = BALL;
  g.save(); g.globalAlpha *= a;
  if (match) {
    ghostBall(g, 540, s.y, B.r + 10, 1, 1);
    T(g, '预测', 330, s.y - 30, 44, 'h', C.cyan); T(g, '实际', 330, s.y + 30, 44, 'h', C.white);
    g.strokeStyle = rgba(C.dim, .7); g.lineWidth = 3; g.setLineDash([6, 8]); g.beginPath(); g.moveTo(400, s.y); g.lineTo(450, s.y); g.stroke(); g.setLineDash([]);
    check(g, 720, s.y, 1.1, C.green, clamp(a * 1.4));
  } else {
    const gy = B.floor - B.r * .78;
    ghostBall(g, 540, gy, B.r, 1.2, .78);
    T(g, '大脑的预测', 300, gy + 6, 42, 'h', C.cyan);
    T(g, '实际', 340, s.y, 42, 'h', C.white);
    const x = 680, y0 = s.y, y1 = gy, pulse = .75 + .25 * Math.sin(a * 0 + performanceSafe() * 8);
    g.strokeStyle = C.red; g.fillStyle = C.red; g.lineWidth = 5; glow(g, C.red, 18 * pulse);
    g.beginPath(); g.moveTo(x, y0 + 14); g.lineTo(x, y1 - 14); g.stroke();
    arrowHead(g, x, y0 + 4, -Math.PI / 2, 16, C.red); arrowHead(g, x, y1 - 4, Math.PI / 2, 16, C.red);
    g.strokeStyle = rgba(C.red, .6); g.lineWidth = 3; g.beginPath(); g.moveTo(x - 20, y0); g.lineTo(x + 20, y0); g.moveTo(x - 20, y1); g.lineTo(x + 20, y1); g.stroke();
    noGlow(g); T(g, '误差', x + 74, (y0 + y1) / 2, 46, 'h', C.red, { glow: C.red, blur: 20 * pulse });
  }
  g.restore();
}
let CUR_T = 0;
function performanceSafe() { return CUR_T; }

let SURPRISE = null;
function surpriseImgs() {
  if (SURPRISE) return SURPRISE;
  const mkWord = (col, glowCol) => {
    const c = mk(1080, 420), g = c.getContext('2d');
    g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = F(280, 's');
    if (glowCol) { glow(g, glowCol, 60); g.fillStyle = col; g.fillText('意外', 540, 214); noGlow(g); }
    g.fillStyle = col; g.fillText('意外', 540, 214);
    return c;
  };
  SURPRISE = { red: mkWord(C.red, C.red), cyan: mkWord(C.cyan, null), core: mkWord('#FFD3D8', null) };
  return SURPRISE;
}
function drawGlitchWord(g, x, y, amt, seed, imgs) {
  const img = imgs.red, n = 14, hh = img.height / n;
  if (amt > 0) {
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha *= .55 * amt;
    g.drawImage(imgs.cyan, x - img.width / 2 - 18 * amt, y - img.height / 2 + 4 * amt); g.restore();
  }
  for (let i = 0; i < n; i++) {
    const off = amt > 0 ? (hash(seed, i, 7) - .5) * 160 * amt * (hash(seed, i, 9) > .55 ? 1 : .15) : 0;
    g.drawImage(img, 0, i * hh, img.width, hh, x - img.width / 2 + off, y - img.height / 2 + i * hh, img.width, hh);
  }
  g.save(); g.globalAlpha *= .35; g.drawImage(imgs.core, x - img.width / 2, y - img.height / 2); g.restore();
}

function sceneHook(g, t) {
  const B = BALL, stageA = 1 - seg(t, 9.0, 9.5);
  const sh = t > HOOK_UNFREEZE ? 16 * Math.exp(-(t - HOOK_UNFREEZE) / .07) : 0;
  let s = ballState(t);
  if (stageA > 0) {
    g.save(); g.globalAlpha *= stageA;
    s = drawBallStage(g, t);
    predictionMarks(g, s, clamp((t - 4.3) / .45), false);
    g.restore();
  }
  // 顶部文字
  g.save();
  if (sh > .3) { const f = Math.floor(t * 60); g.translate((hash(f, 1, 3) - .5) * sh, (hash(f, 2, 5) - .5) * sh); }
  if (t < HOOK_UNFREEZE) {
    glow(g, 'rgba(0,0,0,.6)', 20);
    T(g, '盯住这个球。', 540, 430, 128, 's', C.white);
    const tf = Math.min(t, B.TF);
    g.globalAlpha *= clamp((tf - .7) / .25); T(g, '别  眨  眼', 540, 545, 46, 'm', C.dim, { ls: 4 });
  } else {
    const a = 1 - seg(t, 5.7, 6.1);
    const p = E.out(clamp((t - HOOK_UNFREEZE) / .2));
    g.save(); g.globalAlpha *= a; g.translate(540, 430); g.scale(lerp(1.45, 1, p), lerp(1.45, 1, p));
    T(g, '视频没卡。', 0, 0, 150, 's', C.white, { glow: 'rgba(0,0,0,.8)', blur: 26 });
    g.restore();
    const a3 = clamp((t - 3.25) / .3) * a;
    if (a3 > 0) {
      g.save(); g.globalAlpha *= a3; glow(g, 'rgba(0,0,0,.8)', 18);
      const jitter = t < 3.75 ? (hash(Math.floor(t * 30), 4, 4) - .5) * 14 * (1 - (t - 3.25) / .5) : 0;
      rich(g, '是你的大脑，刚刚{r|猜错了}。', 540 + jitter, 590 + (1 - E.out(clamp((t - 3.25) / .4))) * 20, 66, 'h');
      g.restore();
    }
  }
  g.restore();
  // 「意外」
  if (t > 9.35) {
    const lt = t - 9.35, imgs = surpriseImgs();
    const pop = E.out(clamp(lt / .25));
    let amt = lt < .55 ? 1 - lt / .55 : 0;
    const blip = (lt % 1.7) > 1.55 ? .5 : 0; amt = Math.max(amt, blip);
    g.save(); g.globalAlpha *= clamp(lt / .08);
    g.translate(540, 800); g.scale(lerp(1.25, 1, pop), lerp(1.25, 1, pop)); g.translate(-540, -800);
    drawGlitchWord(g, 540, 800, amt, Math.floor(t * 30), imgs);
    g.restore();
    const a2 = clamp((lt - .5) / .4);
    T(g, 'S U R P R I S E', 540, 1010, 40, 'h', rgba(C.red, .75 * a2), { ls: 6 });
    g.save(); g.globalAlpha *= clamp((lt - 1.0) / .4); T(g, '（信息论里叫「惊奇度」）', 540, 1080, 36, 'm', C.dim); g.restore();
  }
}

/* ---- 标题 ---- */
function sceneTitle(g, t) {
  const lt = t - 14.2;
  drawBrain(g, 540, 700, 1.25 * E.back(clamp(lt / .7)), { t, glow: .75 + .25 * Math.sin(t * 3), fire: 12, alpha: clamp(lt / .25) });
  g.save(); g.globalAlpha *= clamp((lt - .5) / .4); T(g, '一个野心很大的大脑理论', 540, 395, 46, 'm', C.amber, { ls: 4 }); g.restore();
  const wp = E.io(clamp((lt - .35) / .7));
  g.save(); g.beginPath(); g.rect(0, 880, W * wp, 390); g.clip();
  T(g, '自由能原理', 540, 1072, 178, 's', C.white, { glow: rgba(C.cyan, .8), blur: 44 });
  g.restore();
  g.save(); g.globalAlpha *= clamp((lt - 1.0) / .5);
  T(g, 'THE FREE-ENERGY PRINCIPLE', 540, 1205, 36, 'h', C.dim, { ls: 8 });
  T(g, '卡尔·弗里斯顿 · Karl Friston', 540, 1268, 40, 'm', rgba(C.white, .85));
  g.restore();
}

/* ---- 黑盒子里的大脑 → 预测 / 误差 示意图 ---- */
const BOX = { x: 540, y: 820, s: 600 };
const DIAG = {
  brain: [540, 470], eye: [540, 1235], comp: [540, 880],
  pred: [[455, 575], [360, 650], [372, 840], [478, 880]],
  sig: [[575, 1185], [700, 1110], [712, 930], [602, 880]],
};
function flowDots(g, P, t, speed, col, n, a = 1) {
  for (let i = 0; i < n; i++) {
    const u = ((t * speed + i / n) % 1 + 1) % 1, [x, y] = bez(P[0], P[1], P[2], P[3], u);
    g.fillStyle = rgba(col, a * Math.sin(u * Math.PI)); circ(g, x, y, 6); g.fill();
  }
}
function sceneBox(g, t) {
  const morph = E.io(seg(t, 29.4, 30.6));
  const sig = seg(t, 24.2, 25.2), guess = win(t, 27.2, 30.0, .5, .5);
  // ---- A：盒子 ----
  if (morph < 1) {
    g.save(); g.globalAlpha *= 1 - morph;
    const { x, y, s } = BOX;
    g.fillStyle = '#020307'; rr(g, x - s / 2, y - s / 2, s, s, 44); g.fill();
    const ig = g.createRadialGradient(x, y, 40, x, y, s * .72); ig.addColorStop(0, 'rgba(40,55,95,.22)'); ig.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = ig; g.fill();
    g.strokeStyle = '#2E3A5C'; g.lineWidth = 7; rr(g, x - s / 2, y - s / 2, s, s, 44); g.stroke();
    // 光与声：被墙挡住
    const blk = win(t, 21.0, 24.6, .5, .5);
    if (blk > 0) {
      g.save(); g.globalAlpha *= blk;
      for (let i = 0; i < 5; i++) {
        const yy = 600 + i * 95, u = ((t * .9 + i * .23) % 1);
        g.strokeStyle = rgba(C.amber, .7 * (1 - u)); g.lineWidth = 5; g.beginPath(); g.moveTo(40 + u * 150, yy - 40 + u * 30); g.lineTo(80 + u * 150, yy - 30 + u * 30); g.stroke();
      }
      for (let i = 0; i < 3; i++) {
        const u = ((t * .8 + i / 3) % 1), r = 30 + u * 150;
        g.strokeStyle = rgba(C.white, .55 * (1 - u)); g.lineWidth = 4; g.beginPath(); g.arc(1080 + 40, 820, r + 60, Math.PI * .8, Math.PI * 1.2); g.stroke();
      }
      T(g, '光', 110, 520, 44, 'h', C.amber); T(g, '声音', 975, 520, 44, 'h', C.white);
      g.restore();
    }
    // 感官与导线
    const ic = clamp((t - 23.8) / .5);
    if (ic > 0) {
      g.save(); g.globalAlpha *= ic;
      g.strokeStyle = rgba(C.amber, .45); g.lineWidth = 4;
      g.beginPath(); g.moveTo(170, 820); g.lineTo(380, 820); g.moveTo(910, 820); g.lineTo(720, 820); g.moveTo(540, 1200); g.lineTo(540, 990); g.stroke();
      earIcon(g, 960, 820, .9, C.amber); handIcon(g, 540, 1262, .85, C.amber);
      g.restore();
      // 电脉冲
      const routes = [[[170, 820], [400, 820]], [[910, 820], [700, 820]], [[540, 1210], [540, 1000]]];
      routes.forEach((rt, ri) => {
        for (let k = 0; k < 40; k++) {
          const t0 = 24.2 + k * .16 + hash(ri, k, 1) * .1;
          if (hash(ri, k, 2) < .35) continue;
          const u = (t - t0) / .7; if (u < 0 || u > 1) continue;
          const px = lerp(rt[0][0], rt[1][0], u), py = lerp(rt[0][1], rt[1][1], u);
          g.fillStyle = rgba(C.amber, ic * Math.sin(u * Math.PI)); glow(g, C.amber, 16);
          if (ri < 2) rr(g, px - 3, py - 16, 6, 32, 3); else rr(g, px - 16, py - 3, 32, 6, 3);
          g.fill(); noGlow(g);
        }
      });
    }
    // 猜测的投影
    if (guess > 0) {
      g.save(); g.globalAlpha *= guess;
      const bg = g.createLinearGradient(0, 700, 0, 360); bg.addColorStop(0, rgba(C.cyan, .25)); bg.addColorStop(1, rgba(C.cyan, 0));
      g.fillStyle = bg; g.beginPath(); g.moveTo(500, 700); g.lineTo(580, 700); g.lineTo(680, 330); g.lineTo(400, 330); g.closePath(); g.fill();
      cupIcon(g, 540, 438, .8, C.cyan, { dash: [12, 9], glow: 20 });
      T(g, '?', 650, 330, 64, 's', C.cyan, { glow: C.cyan, blur: 20 });
      g.restore();
    }
    g.restore();
  }
  // 眼睛（从左侧移到底部）
  const eyeA = clamp((t - 23.8) / .5);
  if (eyeA > 0) {
    const ex = lerp(110, DIAG.eye[0], morph), ey = lerp(820, DIAG.eye[1], morph);
    g.save(); g.globalAlpha *= eyeA; eyeIcon(g, ex, ey, lerp(.95, 1.05, morph), C.amber); g.restore();
  }
  // 大脑
  const bx = lerp(BOX.x, DIAG.brain[0], morph), by = lerp(BOX.y + 10, DIAG.brain[1], morph), bs = lerp(.95, .62, morph);
  // ---- B：示意图 ----
  let errFlash = 0;
  if (morph > 0) {
    g.save(); g.globalAlpha *= morph;
    const [cx, cy] = DIAG.comp;
    // 路径
    g.lineWidth = 5; g.lineCap = 'round';
    bezPath(g, DIAG.pred); g.strokeStyle = rgba(C.cyan, .35); g.stroke();
    bezPath(g, DIAG.sig); g.strokeStyle = rgba(C.amber, .35); g.stroke();
    flowDots(g, DIAG.pred, t, .45, C.cyan, 6, .9);
    flowDots(g, DIAG.sig, t, .45, C.amber, 6, .9);
    arrowHead(g, 470, 878, .15, 16, C.cyan); arrowHead(g, 610, 878, Math.PI - .15, 16, C.amber);
    T(g, '预测', 262, 700, 50, 'h', C.cyan); T(g, '↓', 262, 762, 46, 'h', C.cyan);
    T(g, '感官信号', 840, 1040, 46, 'h', C.amber); T(g, '↑', 840, 1100, 46, 'h', C.amber);
    // 两次「对答案」
    const trials = [[34.8, 'cup', true], [37.6, 'cat', false]];
    let state = null, sAge = 0;
    for (const [t0, kind, ok] of trials) {
      const u = (t - t0) / 1.0;
      if (u >= 0 && u < 1) {
        const pu = E.io(u), [px, py] = bez(...DIAG.pred, pu), [sx, sy] = bez(...DIAG.sig, pu);
        const fa = 1 - seg(u, .85, 1);
        g.save(); g.globalAlpha *= fa;
        cupIcon(g, px, py + 30, .42, C.cyan, { dash: [10, 7], glow: 14, fill: 'rgba(8,12,22,.85)' });
        if (kind === 'cup') cupIcon(g, sx, sy + 30, .42, C.amber, { glow: 14, fill: 'rgba(8,12,22,.85)' });
        else catIcon(g, sx, sy, .5, C.amber, { glow: 14 });
        g.restore();
      }
      if (u >= 1) { state = ok; sAge = t - t0 - 1; }
    }
    // 比较器
    const okA = state === true ? win(sAge, 0, 2.5, .15, .4) : 0, errA = state === false ? clamp(sAge / .15) : 0;
    errFlash = errA * (.6 + .4 * Math.sin(t * 12));
    g.fillStyle = 'rgba(8,12,22,.95)'; circ(g, cx, cy, 62); g.fill();
    g.strokeStyle = errA > 0 ? C.red : okA > 0 ? C.green : rgba(C.white, .55); g.lineWidth = 6;
    glow(g, errA > 0 ? C.red : okA > 0 ? C.green : 'transparent', 30); g.stroke(); noGlow(g);
    if (okA > 0) { check(g, cx, cy, 1, C.green, clamp(sAge / .3)); for (let k = 0; k < 2; k++) { const ra = (sAge * 1.2 + k * .5) % 1; g.strokeStyle = rgba(C.green, .5 * (1 - ra) * okA); g.lineWidth = 4; circ(g, cx, cy, 62 + ra * 90); g.stroke(); } }
    else if (errA > 0) cross(g, cx, cy, 1, C.red);
    else T(g, '?', cx, cy + 2, 60, 's', rgba(C.white, .7));
    T(g, '对答案', cx, cy + 98, 36, 'm', C.dim);
    // 误差上报
    g.strokeStyle = rgba(C.red, .18 + .7 * errA); g.lineWidth = 6; g.setLineDash([2, 14]);
    g.beginPath(); g.moveTo(cx, cy - 66); g.lineTo(cx, 590); g.stroke(); g.setLineDash([]);
    if (errA > 0) {
      for (let k = 0; k < 5; k++) { const u = ((sAge * 1.6 + k / 5) % 1); g.fillStyle = rgba(C.red, errA * Math.sin(u * Math.PI)); glow(g, C.red, 18); rr(g, cx - 9, lerp(cy - 70, 600, u) - 18, 18, 36, 9); g.fill(); noGlow(g); }
      arrowHead(g, cx, 598, -Math.PI / 2, 22, C.red);
      T(g, '误差！', cx + 110, 690, 52, 'h', C.red, { glow: C.red, blur: 22 });
    }
    T(g, '感官', DIAG.eye[0] + 120, DIAG.eye[1], 40, 'm', C.amber);
    g.restore();
  }
  drawBrain(g, bx, by, bs, { t, alpha: .45 + .55 * Math.max(sig, morph), glow: .2 + .5 * sig + .3 * guess + errFlash, fire: Math.round(8 * Math.max(sig, morph)),
    col: errFlash > 0 ? mixHex(C.brain, C.red, errFlash) : mixHex(C.brain, C.cyan, guess * .5) });
}

/* ---- 乱序汉字 ---- */
const SCR = [
  { s: '研表究明，汉字的序顺', p: [0, 2, 1, 3, 4, 5, 6, 7, 9, 8] },
  { s: '并不定一能影阅响读。', p: [0, 1, 3, 2, 4, 5, 7, 6, 8, 9] },
  { s: '比如当你看完这句话后，', p: null },
  { s: '才发这现里的字全是乱的。', p: [0, 1, 3, 2, 4, 5, 6, 7, 8, 9, 10, 11] },
];
function sceneText(g, t) {
  const cardA = clamp((t - 42.3) / .35) * (1 - seg(t, 56.2, 56.6));
  g.save(); g.globalAlpha *= win(t, 41.3, 49.0, .3, .3); T(g, '不信？读读这句话：', 540, 500, 56, 'h', C.amber); g.restore();
  if (cardA > 0) {
    g.save(); g.globalAlpha *= cardA;
    g.fillStyle = 'rgba(255,255,255,.035)'; g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = 3;
    rr(g, 70, 600, 940, 540, 30); g.fill(); g.stroke();
    const px = 68, cw = 74, swapU = E.io(seg(t, 50.2, 51.3)), red = seg(t, 49.0, 49.3);
    SCR.forEach((L, li) => {
      const chars = [...L.s], n = chars.length, x0 = 540 - (n - 1) * cw / 2, y = 870 + (li - 1.5) * 118;
      chars.forEach((ch, i) => {
        const tgt = L.p ? L.p[i] : i, moved = tgt !== i;
        const x = lerp(x0 + i * cw, x0 + tgt * cw, moved ? swapU : 0);
        const yy = y + (moved ? (tgt > i ? -1 : 1) * 46 * Math.sin(swapU * Math.PI) : 0);
        let col = C.white;
        if (moved) col = swapU > .5 ? C.cyan : mixHex(C.white, C.red, red);
        if (moved && red > 0 && swapU < .5) { g.fillStyle = rgba(C.red, .8 * red); g.fillRect(x - cw / 2 + 6, y + 40, cw - 12, 5); }
        T(g, ch, x, yy, px, 'm', col, moved && swapU > .5 ? { glow: rgba(C.cyan, .7), blur: 14 } : {});
      });
    });
    g.restore();
  }
  bigText(g, '所谓「看见」，\n其实是大脑在{c|猜}。', 540, 860, 104, win(t, 56.6, 59.3, .35, .3), { pop: (t - 56.6) / .45 });
}

/* ---- 鱼 ---- */
function sceneFish(g, t) {
  bigText(g, '可大脑为什么\n这么怕{r|意外}？', 540, 840, 112, win(t, 59.1, 62.0, .3, .3), { pop: (t - 59.1) / .4 });
  const A = win(t, 61.9, 71.6, .4, .4); if (A <= 0) return;
  g.save(); g.globalAlpha *= A; g.translate(0, -70);
  // 水
  const SURF = 990;
  g.beginPath(); g.moveTo(0, 1380);
  for (let x = 0; x <= 660; x += 10) g.lineTo(x, SURF + 8 * Math.sin(x * .02 + t * 2.2) + 4 * Math.sin(x * .05 - t * 3));
  g.lineTo(660, 1380); g.closePath();
  const wg = g.createLinearGradient(0, SURF, 0, 1380); wg.addColorStop(0, 'rgba(80,200,235,.28)'); wg.addColorStop(1, 'rgba(30,80,140,.12)');
  g.fillStyle = wg; g.fill();
  g.beginPath(); for (let x = 0; x <= 660; x += 10) { const y = SURF + 8 * Math.sin(x * .02 + t * 2.2) + 4 * Math.sin(x * .05 - t * 3); x ? g.lineTo(x, y) : g.moveTo(x, y); }
  g.strokeStyle = rgba(C.cyan, .7); g.lineWidth = 4; glow(g, C.cyan, 14); g.stroke(); noGlow(g);
  for (let i = 0; i < 14; i++) { const u = ((t * .25 + hash(i, 1, 1)) % 1), bxp = 40 + hash(i, 2, 2) * 520 + Math.sin(t * 2 + i) * 8; g.strokeStyle = rgba(C.cyan, .45 * Math.sin(u * Math.PI)); g.lineWidth = 3; circ(g, bxp, lerp(1360, SURF + 20, u), 4 + hash(i, 3, 3) * 7); g.stroke(); }
  // 岸
  g.beginPath(); g.moveTo(540, 1380); g.bezierCurveTo(600, 1200, 640, 1040, 720, 1002); g.lineTo(1080, 1002); g.lineTo(1080, 1380); g.closePath();
  g.fillStyle = '#2A2219'; g.fill(); g.strokeStyle = '#9A7E55'; g.lineWidth = 5; g.stroke();
  for (let i = 0; i < 26; i++) { g.fillStyle = 'rgba(160,130,90,.35)'; ell(g, 700 + hash(i, 5, 1) * 370, 1030 + hash(i, 6, 1) * 320, 6 + hash(i, 7, 1) * 8, 4 + hash(i, 8, 1) * 4); g.fill(); }
  // 底部渐隐
  const fade = g.createLinearGradient(0, 1250, 0, 1385); fade.addColorStop(0, 'rgba(5,7,13,0)'); fade.addColorStop(1, 'rgba(5,7,13,1)');
  g.fillStyle = fade; g.fillRect(0, 1250, W, 140);
  // 鱼
  const LEAP = 65.6, LAND = 66.4, STILL = 68.6;
  if (t < LEAP) {
    const x = 300 + 150 * Math.sin((t - LEAP) * 1.2 + 1.2), dx = Math.cos((t - LEAP) * 1.2 + 1.2);
    const y = 1170 + 35 * Math.sin((t - 62) * 2.1);
    drawFish(g, x, y, .95, Math.cos((t - 62) * 2.1) * .12 * Math.sign(dx), { t, flip: dx < 0 });
    const tags = [['水温 ✓', 62.6], ['氧气 ✓', 63.4], ['水压 ✓', 64.2]];
    tags.forEach(([s, t0], i) => { const u = t - t0; if (u < 0) return; const a = Math.min(clamp(u / .3), 1 - seg(t, 65.0, 65.5)); g.save(); g.globalAlpha *= a; T(g, s, 120 + i * 190, 1290 - u * 22, 38, 'h', C.cyan); g.restore(); });
  } else if (t < LAND) {
    const u = (t - LEAP) / (LAND - LEAP), y0 = 1170 + 35 * Math.sin((LEAP - 62) * 2.1);
    const x = lerp(440, 860, u), y = lerp(y0, 962, u) - 360 * 4 * u * (1 - u);
    const vy = (962 - y0) - 360 * 4 * (1 - 2 * u);
    drawFish(g, x, y, .95, Math.atan2(vy, 420), { t, wagF: 16 });
  } else {
    const lt = t - LAND, still = t >= STILL;
    let hop = 0, rot = 0;
    if (!still) { const k = Math.floor(lt / .5), u = (lt % .5) / .3; if (u < 1) hop = Math.sin(u * Math.PI) * 46; rot = (k % 2 ? 1 : -1) * .35 * Math.sin(Math.min(u, 1) * Math.PI); }
    drawFish(g, 860, 962 - hop, .95, rot, { t, wagF: still ? 0 : 22, wagA: still ? 0 : .5, gasp: still ? 0 : .5 + .5 * Math.sin(t * 14), dead: still });
    if (!still) for (let k = 0; k < 3; k++) { const u = ((lt * 1.4 + k / 3) % 1); g.fillStyle = rgba(C.cyan, .8 * (1 - u)); ell(g, 930 + k * 18, 880 + u * 50, 6, 10); g.fill(); }
    const tags = [['缺氧！', 690, 820, 66.6], ['太干！', 900, 735, 67.0], ['好热！', 705, 655, 67.4], ['危险！', 900, 890, 67.8]];
    for (const [s, x, y, t0] of tags) { const u = t - t0; if (u < 0) continue; pill(g, s, x, y + Math.sin(t * 6 + x) * 4, 40, C.red, 1 - seg(t, STILL + .2, STILL + .7), E.back(clamp(u / .3))); }
    if (still) { g.save(); g.globalAlpha *= clamp((t - STILL - .5) / .4); T(g, '…', 900, 870, 60, 'h', C.dim); g.restore(); }
  }
  // 溅起的水花
  for (const [t0, x0, y0, n] of [[LEAP, 440, SURF, 14], [LAND, 860, 1000, 10]]) {
    const u = t - t0; if (u < 0 || u > .7) continue;
    for (let i = 0; i < n; i++) { const a = -Math.PI * (.15 + .7 * hash(i, n, 3)), v = 300 + hash(i, n, 4) * 400; const px = x0 + Math.cos(a) * v * u, py = y0 + Math.sin(a) * v * u + 900 * u * u; g.fillStyle = rgba(t0 === LEAP ? C.cyan : '#C9A878', 1 - u / .7); circ(g, px, py, 6); g.fill(); }
  }
  g.restore();
}

/* ---- 活着 = 守在小范围里；熵与细胞 ---- */
const GAUGES = [
  { x: 300, y: 690, name: '体温', val: '≈ 37 °C', kick: 75.3 },
  { x: 780, y: 690, name: '血糖', val: '≈ 5 mmol/L', kick: 76.5 },
  { x: 300, y: 1070, name: '血压', val: '≈ 120/80', kick: 75.9 },
  { x: 780, y: 1070, name: '血液 pH', val: '≈ 7.4', kick: 77.1 },
];
const PARTS = (() => {
  const r = R(77), a = [];
  for (let i = 0; i < 400; i++) {
    const gx = (i % 20) - 9.5, gy = Math.floor(i / 20) - 9.5, ang = r() * TAU, sp = .35 + r() * .9;
    a.push({ hx: 540 + gx * 17, hy: 820 + gy * 17, vx: Math.cos(ang) * sp, vy: Math.sin(ang) * sp, ph: r() * TAU, life: r() < .34 });
  }
  const life = a.filter(p => p.life), rings = [[0, 1], [42, 8], [84, 16], [126, 24], [168, 32], [205, 999]];
  let k = 0;
  for (const [rad, cnt] of rings) { const m = Math.min(cnt, life.length - k); for (let j = 0; j < m; j++, k++) { life[k].tr = rad * .92; life[k].ta = j / m * TAU; life[k].dir = rad % 84 ? 1 : -1; } if (k >= life.length) break; }
  return a;
})();
function sceneLife(g, t) {
  // 仪表盘
  const gA = win(t, 71.3, 79.0, .4, .4);
  if (gA > 0) {
    g.save(); g.globalAlpha *= gA;
    GAUGES.forEach((q, i) => {
      const pop = E.back(clamp((t - 71.4 - i * .15) / .4));
      const a0 = Math.PI * .85, a1 = Math.PI * 2.15, am = Math.PI * 1.5, r = 140, band = .2;
      let nd = .06 * Math.sin(t * 2.6 + i * 2) + .03 * Math.sin(t * 5.3 + i);
      const kt = t - q.kick; if (kt > 0) nd += 1.15 * Math.exp(-kt / .55) * Math.sin(kt * 7);
      const out = Math.abs(nd) > band;
      g.save(); g.translate(q.x, q.y); g.scale(pop, pop);
      g.lineCap = 'round';
      g.strokeStyle = 'rgba(140,155,190,.28)'; g.lineWidth = 16; g.beginPath(); g.arc(0, 0, r, a0, a1); g.stroke();
      g.strokeStyle = rgba(C.red, .35); g.lineWidth = 16; g.beginPath(); g.arc(0, 0, r, a0, a0 + .3); g.stroke(); g.beginPath(); g.arc(0, 0, r, a1 - .3, a1); g.stroke();
      g.strokeStyle = out ? C.red : C.green; glow(g, out ? C.red : C.green, 22); g.beginPath(); g.arc(0, 0, r, am - band, am + band); g.stroke(); noGlow(g);
      g.strokeStyle = 'rgba(200,210,235,.5)'; g.lineWidth = 3;
      for (let k = 0; k <= 12; k++) { const a = lerp(a0, a1, k / 12); g.beginPath(); g.moveTo(Math.cos(a) * (r - 24), Math.sin(a) * (r - 24)); g.lineTo(Math.cos(a) * (r - (k % 3 ? 34 : 44)), Math.sin(a) * (r - (k % 3 ? 34 : 44))); g.stroke(); }
      const an = am + nd; g.strokeStyle = C.white; g.lineWidth = 7; glow(g, 'rgba(255,255,255,.5)', 12);
      g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(an) * (r - 30), Math.sin(an) * (r - 30)); g.stroke(); noGlow(g);
      g.fillStyle = C.white; circ(g, 0, 0, 12); g.fill();
      T(g, q.name, 0, 62, 44, 'h', C.white); T(g, q.val, 0, 114, 32, 'm', C.dim);
      g.restore();
    });
    g.restore();
  }
  // 粒子：散开 / 细胞
  const pA = win(t, 78.7, 85.4, .35, .4);
  if (pA > 0) {
    g.save(); g.globalAlpha *= pA;
    const TE = 79.5, TL = 81.9, d = Math.max(0, t - TE), cu = E.io(seg(t, TL, TL + 1.7));
    g.save(); g.globalAlpha *= win(t, 79.2, 81.9, .3, .3); T(g, '冰会化 · 热会散 · 沙堡会塌', 540, 470, 42, 'm', C.dim, { ls: 2 }); g.restore();
    const spread = 160 * Math.sqrt(d) + 50 * d;
    for (const p of PARTS) {
      let x = p.hx + p.vx * spread + Math.sin(t * 2 + p.ph) * 5 * Math.min(1, d), y = p.hy + p.vy * spread + Math.cos(t * 1.7 + p.ph) * 5 * Math.min(1, d);
      let col = C.amber, rad = 5;
      if (p.life && cu > 0) {
        const ang = p.ta + t * .25 * p.dir, tx = 540 + Math.cos(ang) * p.tr, ty = 820 + Math.sin(ang) * p.tr;
        x = lerp(x, tx, cu); y = lerp(y, ty, cu); col = mixHex(C.amber, C.cyan, cu); rad = 5 + cu;
      }
      const fadeOut = p.life ? 1 : clamp(1 - (Math.hypot(x - 540, y - 820) - 500) / 300);
      if (fadeOut <= 0) continue;
      g.fillStyle = rgba(col, .85 * fadeOut); circ(g, x, y, rad); g.fill();
    }
    if (cu > 0) {
      g.save(); g.globalAlpha *= cu;
      g.beginPath();
      for (let i = 0; i <= 72; i++) { const a = i / 72 * TAU, r = 225 + 7 * Math.sin(a * 5 + t * 2) + 4 * Math.sin(a * 3 - t * 1.3); g.lineTo(540 + Math.cos(a) * r, 820 + Math.sin(a) * r); }
      g.closePath(); g.fillStyle = rgba(C.cyan, .06); g.fill(); g.strokeStyle = C.cyan; g.lineWidth = 6; glow(g, C.cyan, 26); g.stroke(); noGlow(g);
      g.restore();
      g.save(); g.globalAlpha *= clamp((t - 82.6) / .5);
      T(g, '边界：把「里面」和「外面」隔开', 540, 1110, 38, 'h', C.cyan);
      T(g, '（弗里斯顿管它叫「马尔可夫毯」）', 540, 1166, 32, 'm', C.dim);
      g.restore();
    }
    g.restore();
  }
}

/* ---- 自由能：压在「意外」头上的盖子 ---- */
function sceneLid(g, t) {
  const X0 = 400, X1 = 680, TOP = 560, BOT = 1270, LS0 = 830, LID_H = 38;
  // 盖子位置
  let lf = -60;
  if (t >= 93.6) lf = lerp(-60, 700, E.out(clamp((t - 93.6) / .28)));
  if (t >= 98.8) lf = lerp(700, LS0, E.io(seg(t, 98.8, 99.7)));
  if (t >= 99.9) lf = lerp(LS0, 1010, E.io(seg(t, 99.9, 101.3)));
  const ls = Math.max(LS0, lf);
  const fog = 1 - seg(t, 95.6, 96.5);
  // 管子
  g.save();
  g.fillStyle = 'rgba(255,255,255,.03)'; rr(g, X0, TOP, X1 - X0, BOT - TOP, [0, 0, 46, 46]); g.fill();
  g.save(); rr(g, X0, TOP, X1 - X0, BOT - TOP, [0, 0, 46, 46]); g.clip();
  const lg = g.createLinearGradient(0, ls, 0, BOT); lg.addColorStop(0, rgba(C.red, .9)); lg.addColorStop(1, rgba('#8A1424', .9));
  g.globalAlpha *= lerp(1, .22, fog);
  g.fillStyle = lg; g.fillRect(X0, ls, X1 - X0, BOT - ls);
  g.beginPath(); for (let x = X0; x <= X1; x += 8) { const y = ls + 5 * Math.sin(x * .05 + t * 3); x === X0 ? g.moveTo(x, y) : g.lineTo(x, y); }
  g.strokeStyle = '#FF9AA5'; g.lineWidth = 4; glow(g, C.red, 24); g.stroke(); noGlow(g);
  for (let i = 0; i < 10; i++) { const u = ((t * .35 + hash(i, 4, 4)) % 1), yb = lerp(BOT - 20, ls + 20, u); if (yb < ls + 10) continue; g.strokeStyle = 'rgba(255,200,205,.4)'; g.lineWidth = 2.5; circ(g, X0 + 30 + hash(i, 5, 5) * (X1 - X0 - 60), yb, 4 + hash(i, 6, 6) * 6); g.stroke(); }
  g.restore();
  // 雾与问号
  if (fog > 0) {
    g.save(); g.globalAlpha *= fog * clamp((t - 85.0) / .4);
    for (let i = 0; i < 9; i++) {
      const fx = lerp(X0 + 30, X1 - 30, hash(i, 1, 9)) + Math.sin(t * .7 + i) * 30, fy = lerp(700, 1200, hash(i, 2, 9)) + Math.cos(t * .5 + i) * 30;
      const fg = g.createRadialGradient(fx, fy, 0, fx, fy, 150); fg.addColorStop(0, 'rgba(150,160,185,.28)'); fg.addColorStop(1, 'rgba(150,160,185,0)');
      g.fillStyle = fg; g.fillRect(fx - 150, fy - 150, 300, 300);
    }
    for (let i = 0; i < 6; i++) { const u = ((t * .3 + i / 6) % 1); g.save(); g.globalAlpha *= Math.sin(u * Math.PI) * .8; T(g, '?', X0 + 50 + hash(i, 3, 9) * 180, lerp(1200, 700, u), 56 + hash(i, 4, 9) * 30, 's', C.white); g.restore(); }
    g.restore();
  }
  g.strokeStyle = 'rgba(210,225,250,.5)'; g.lineWidth = 5; rr(g, X0, TOP, X1 - X0, BOT - TOP, [0, 0, 46, 46]); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = 8; g.beginPath(); g.moveTo(X0 + 26, TOP + 30); g.lineTo(X0 + 26, BOT - 70); g.stroke();
  // 「意外」标签
  const la = clamp((t - 85.3) / .4);
  g.save(); g.globalAlpha *= la;
  T(g, '意外', 250, ls, 64, 's', C.red, { glow: C.red, blur: 22 });
  g.globalAlpha *= fog; T(g, '= ?', 250, ls + 64, 44, 'h', C.dim);
  g.restore();
  // 锁
  const lockA = win(t, 88.3, 93.8, .3, .3);
  if (lockA > 0) {
    g.save(); g.globalAlpha *= lockA; g.translate(540, 1000);
    g.strokeStyle = C.amber; g.lineWidth = 10; glow(g, C.amber, 22);
    g.beginPath(); g.arc(0, -40, 42, Math.PI, 0); g.lineTo(42, -6); g.moveTo(-42, -6); g.lineTo(-42, -40); g.stroke();
    g.fillStyle = 'rgba(10,12,20,.95)'; rr(g, -66, -10, 132, 104, 18); g.fill(); g.stroke(); noGlow(g);
    g.fillStyle = C.amber; circ(g, 0, 30, 12); g.fill(); g.fillRect(-5, 30, 10, 30);
    g.restore();
    g.save(); g.globalAlpha *= win(t, 88.6, 93.8, .3, .3); T(g, '世界的全部真相', 540, 1150, 40, 'h', C.amber); g.restore();
  }
  // 差距标注
  const gap = ls - lf;
  const gapA = Math.min(win(t, 96.0, 99.8, .4, .3), clamp((gap - 30) / 60));
  if (gapA > 0) {
    g.save(); g.globalAlpha *= gapA;
    const xm = 540, y0 = lf + 8, y1 = ls - 8;
    g.strokeStyle = C.dim; g.fillStyle = C.dim; g.lineWidth = 3;
    g.beginPath(); g.moveTo(xm - 90, y0 + 6); g.lineTo(xm - 90, y1 - 6); g.stroke();
    arrowHead(g, xm - 90, y0 + 2, -Math.PI / 2, 10, C.dim); arrowHead(g, xm - 90, y1 - 2, Math.PI / 2, 10, C.dim);
    T(g, '差距 ≥ 0', xm + 20, (y0 + y1) / 2, 34, 'h', C.white);
    g.restore();
  }
  // 盖子
  if (lf > -40) {
    const slam = t - 93.6, flash = slam > 0 ? Math.exp(-slam / .25) : 0;
    g.save();
    g.fillStyle = rgba(C.cyan, .25 + .4 * flash); g.strokeStyle = C.cyan; g.lineWidth = 6; glow(g, C.cyan, 30 + 40 * flash);
    rr(g, X0 - 22, lf - LID_H, X1 - X0 + 44, LID_H, 12); g.fill(); g.stroke(); noGlow(g);
    g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(X0 - 6, lf - LID_H + 8, X1 - X0 + 12, 4);
    // 往下压的箭头
    const push = win(t, 98.7, 101.4, .2, .3);
    if (push > 0) for (let k = 0; k < 3; k++) { const u = ((t * 1.6 + k / 3) % 1); g.save(); g.globalAlpha *= push * Math.sin(u * Math.PI); g.strokeStyle = C.cyan; g.lineWidth = 8; g.lineCap = 'round'; const yy = lf - LID_H - 140 + u * 90; g.beginPath(); g.moveTo(500, yy); g.lineTo(540, yy + 32); g.lineTo(580, yy); g.stroke(); g.restore(); }
    g.restore();
    const lx = 860, ly = lf - LID_H / 2;
    T(g, '自由能', lx, ly - 4, 64, 's', C.cyan, { glow: C.cyan, blur: 22 });
    g.save(); g.globalAlpha *= clamp((t - 104.5) / .4);
    T(g, '≈ 预测误差', lx, ly + 58, 38, 'h', C.cyan); T(g, '的总和', lx, ly + 102, 38, 'h', C.cyan);
    g.restore();
  }
  // 给数学党
  g.save(); g.globalAlpha *= win(t, 96.2, 107.6, .5, .35) * .9;
  T(g, '给数学党：F = −ln p(o) + KL[ q(s) ‖ p(s|o) ]  ≥  −ln p(o)', 540, 1335, 32, 'm', C.dim);
  g.restore();
  g.restore();
}

/* ---- 两条路：改猜测（绳子与蛇）---- */
function ropePt(u) { const x = lerp(230, 840, u); return [x, 1100 + 42 * Math.sin(u * 2.3 * Math.PI)]; }
function scenePaths(g, t) {
  // 岔路
  const fA = win(t, 107.7, 110.5, .3, .35);
  if (fA > 0) {
    g.save(); g.globalAlpha *= fA;
    bigText(g, '降低误差，只有两条路', 540, 560, 92, 1, { pop: (t - 107.7) / .4 });
    const cards = [[300, C.cyan, '改猜测', '让脑子里的模型\n去符合世界', 108.3], [780, C.amber, '改世界', '让世界\n去符合你的预测', 108.8]];
    for (const [x, col, title, sub, t0] of cards) {
      const p = E.back(clamp((t - t0) / .4)); if (p <= 0) continue;
      g.save(); g.translate(x, 930); g.scale(p, p);
      g.fillStyle = 'rgba(8,12,22,.9)'; g.strokeStyle = col; g.lineWidth = 5; glow(g, rgba(col, .6), 26);
      rr(g, -200, -190, 400, 380, 30); g.fill(); g.stroke(); noGlow(g);
      if (col === C.cyan) drawBrain(g, 0, -95, .33, { t, glow: .5 }); else handIcon(g, 0, -95, 1.1, col);
      T(g, title, 0, 32, 74, 's', col, { glow: col, blur: 16 });
      rich(g, sub, 0, 124, 32, 'm', C.dim, 1.4);
      g.restore();
    }
    g.restore();
  }
  // 绳子 / 蛇
  const rA = win(t, 110.3, 120.4, .4, .4);
  if (rA <= 0) return;
  g.save(); g.globalAlpha *= rA;
  const light = E.io(seg(t, 113.6, 114.4));
  // 草
  for (let i = 0; i < 70; i++) {
    const x = 120 + i * 12.5 + hash(i, 1, 2) * 8, h = 60 + hash(i, 2, 2) * 90, sw = Math.sin(t * 1.4 + i * .7) * 10;
    g.strokeStyle = i % 3 ? '#2F6B45' : '#4E9A63'; g.lineWidth = 5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, 1250); g.quadraticCurveTo(x + sw * .3, 1250 - h * .5, x + sw, 1250 - h); g.stroke();
  }
  // 绳子
  const pts = []; for (let k = 0; k <= 60; k++) pts.push(ropePt(k / 60));
  g.lineCap = 'round'; g.lineJoin = 'round';
  smoothPath(g, pts); g.strokeStyle = '#3A2614'; g.lineWidth = 30; g.stroke();
  smoothPath(g, pts); g.strokeStyle = '#B08550'; g.lineWidth = 22; g.stroke();
  g.strokeStyle = '#6E4E28'; g.lineWidth = 3;
  for (let k = 1; k < 60; k += 2) { const [x, y] = pts[k], [x2, y2] = pts[k + 1], a = Math.atan2(y2 - y, x2 - x) + 1.0; g.beginPath(); g.moveTo(x - Math.cos(a) * 10, y - Math.sin(a) * 10); g.lineTo(x + Math.cos(a) * 10, y + Math.sin(a) * 10); g.stroke(); }
  const [ex, ey] = ropePt(1); g.strokeStyle = '#B08550'; g.lineWidth = 4;
  for (let k = 0; k < 7; k++) { const a = -.6 + k * .2; g.beginPath(); g.moveTo(ex, ey); g.lineTo(ex + Math.cos(a) * (26 + hash(k, 1, 1) * 18), ey + Math.sin(a) * (26 + hash(k, 2, 1) * 18)); g.stroke(); }
  // 前景草
  for (let i = 0; i < 40; i++) {
    const x = 130 + i * 21 + hash(i, 4, 2) * 10, h = 40 + hash(i, 5, 2) * 60, sw = Math.sin(t * 1.2 + i) * 8;
    g.strokeStyle = '#3C7E52'; g.lineWidth = 6; g.beginPath(); g.moveTo(x, 1262); g.quadraticCurveTo(x + sw * .3, 1262 - h * .5, x + sw, 1262 - h); g.stroke();
  }
  // 黑暗遮罩
  const r0 = lerp(140, 900, light), dk = lerp(.9, .15, light);
  const mg = g.createRadialGradient(540, 1110, r0 * .3, 540, 1110, r0 + 220);
  mg.addColorStop(0, `rgba(3,4,8,${dk * .35})`); mg.addColorStop(1, `rgba(3,4,8,${dk})`);
  g.fillStyle = mg; g.fillRect(0, 0, W, H);
  // 大脑的预测（青色叠加）
  const snakeA = 1 - seg(t, 114.9, 115.5), ropeA = seg(t, 115.2, 115.9);
  if (snakeA > 0 && t > 110.8) {
    g.save(); g.globalAlpha *= snakeA * clamp((t - 110.8) / .5);
    g.strokeStyle = C.cyan; g.fillStyle = C.cyan; g.lineWidth = 4; glow(g, C.cyan, 18);
    for (let k = 4; k < 58; k += 4) { const [x, y] = pts[k], [x2, y2] = pts[k + 1], a = Math.atan2(y2 - y, x2 - x); g.save(); g.translate(x, y); g.rotate(a); g.beginPath(); g.moveTo(-8, -12); g.lineTo(4, 0); g.lineTo(-8, 12); g.stroke(); g.restore(); }
    g.save(); g.translate(ex + 14, ey + 4); g.rotate(.15);
    g.setLineDash([10, 7]); g.beginPath(); g.moveTo(-26, -24); g.quadraticCurveTo(30, -38, 62, 0); g.quadraticCurveTo(30, 38, -26, 24); g.closePath(); g.fillStyle = rgba(C.cyan, .15); g.fill(); g.stroke(); g.setLineDash([]);
    g.fillStyle = C.cyan; circ(g, 24, -12, 6); g.fill(); circ(g, 24, 12, 6); g.fill();
    const fl = Math.max(0, Math.sin(t * 9)) * 30; g.beginPath(); g.moveTo(62, 0); g.lineTo(80 + fl, 0); g.lineTo(92 + fl, -10); g.moveTo(80 + fl, 0); g.lineTo(92 + fl, 10); g.stroke();
    g.restore(); noGlow(g);
    g.restore();
  }
  // 误差闪烁
  const errA = win(t, 114.1, 115.2, .1, .3);
  if (errA > 0) { g.save(); g.globalAlpha *= errA * (.6 + .4 * Math.sin(t * 25)); g.strokeStyle = C.red; g.lineWidth = 7; glow(g, C.red, 30); circ(g, ex + 30, ey, 90); g.stroke(); noGlow(g); T(g, '对不上！', ex + 10, ey - 140, 48, 'h', C.red, { glow: C.red, blur: 20 }); g.restore(); }
  if (ropeA > 0) {
    g.save(); g.globalAlpha *= ropeA; g.setLineDash([12, 9]);
    const off = pts.map(([x, y]) => [x, y - 26]); smoothPath(g, off); g.strokeStyle = C.cyan; g.lineWidth = 4; glow(g, C.cyan, 16); g.stroke();
    const off2 = pts.map(([x, y]) => [x, y + 26]); smoothPath(g, off2); g.stroke(); g.setLineDash([]); noGlow(g);
    g.restore();
  }
  // 思考泡泡
  const b1 = win(t, 111.0, 115.1, .3, .2), b2 = clamp((t - 115.3) / .3);
  drawBrain(g, 250, 600, .36, { t, glow: .4 + .4 * b1 * Math.abs(Math.sin(t * 6)), col: b1 > 0 && t > 114.1 ? mixHex(C.brain, C.red, errA) : C.brain });
  bubble(g, '是蛇？！', 600, 590, 64, C.cyan, b1, { sc: E.back(clamp((t - 111.0) / .35)) });
  if (b2 > 0) { bubble(g, '哦，是绳子。', 600, 590, 60, C.cyan, b2, { sc: E.back(clamp((t - 115.3) / .35)), extraW: 70 }); check(g, 392, 590, .8, C.green, clamp((t - 115.6) / .3) * b2); }
  g.restore();
}

/* ---- 改世界：手和杯子 ---- */
function drawArm(g, sx, sy, hx, hy, o) {
  const ex = (sx + hx) / 2 + 40, ey = (sy + hy) / 2 + 70;
  g.lineCap = 'round'; g.lineJoin = 'round';
  const pathArm = () => { g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(ex, ey, hx - 30, hy + 8); };
  if (o.ghost) {
    pathArm(); g.strokeStyle = rgba(C.cyan, .16); g.lineWidth = 62; g.stroke();
    pathArm(); g.strokeStyle = C.cyan; g.lineWidth = 4; g.setLineDash([14, 10]); glow(g, C.cyan, 16); g.stroke(); g.setLineDash([]);
    g.fillStyle = rgba(C.cyan, .18); g.setLineDash([12, 8]); rr(g, hx - 44, hy - 38, 86, 76, 32); g.fill(); g.stroke();
    ell(g, hx + 10, hy - 42, 16, 26, -.6); g.fill(); g.stroke(); g.setLineDash([]); noGlow(g);
  } else {
    pathArm(); g.strokeStyle = '#3B2A22'; g.lineWidth = 66; g.stroke();
    pathArm(); g.strokeStyle = '#E2C5AA'; g.lineWidth = 58; g.stroke();
    g.fillStyle = '#E2C5AA'; g.strokeStyle = '#3B2A22'; g.lineWidth = 5;
    rr(g, hx - 44, hy - 38, 86, 76, 32); g.fill(); g.stroke();
    ell(g, hx + 10, hy - 42, 16, 26, -.6); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(59,42,34,.6)'; g.lineWidth = 3; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(hx + 22, hy - 16 + k * 18); g.lineTo(hx + 40, hy - 16 + k * 18); g.stroke(); }
  }
}
function sceneHand(g, t) {
  const A = win(t, 120.2, 133.9, .4, .4); if (A <= 0) return;
  g.save(); g.globalAlpha *= A;
  const TABLE = 1090, SH = [-70, 1330], H0 = [380, 1052], H1 = [688, 1022];
  // 桌子
  g.fillStyle = 'rgba(160,175,210,.06)'; g.fillRect(90, TABLE, 900, 200);
  g.strokeStyle = 'rgba(200,215,245,.55)'; g.lineWidth = 5; g.beginPath(); g.moveTo(90, TABLE); g.lineTo(990, TABLE); g.stroke();
  const move = E.io(seg(t, 126.9, 128.6)), lift = E.io(seg(t, 128.9, 129.8)) * 70;
  const hx = lerp(H0[0], H1[0], move), hy = lerp(H0[1], H1[1], move) - lift;
  // 杯子（实际）
  cupIcon(g, 760, TABLE - lift, 1, C.amber, { fill: 'rgba(20,16,10,.9)', glow: 10, steam: true });
  // 预测的手
  const gA = clamp((t - 123.7) / .5) * (1 - seg(t, 128.6, 129.2));
  if (gA > 0) { g.save(); g.globalAlpha *= gA; drawArm(g, SH[0], SH[1], H1[0], H1[1], { ghost: true }); g.restore(); }
  drawArm(g, SH[0], SH[1], hx, hy, {});
  // 误差连线
  const eA = gA * (1 - seg(move, .85, 1));
  if (eA > 0 && Math.hypot(H1[0] - hx, H1[1] - hy) > 20) {
    g.save(); g.globalAlpha *= eA;
    g.strokeStyle = C.red; g.lineWidth = 5; g.setLineDash([10, 10]); g.lineDashOffset = -t * 60; glow(g, C.red, 16);
    g.beginPath(); g.moveTo(hx + 20, hy - 60); g.lineTo(H1[0] - 10, H1[1] - 60); g.stroke(); g.setLineDash([]);
    arrowHead(g, H1[0] - 6, H1[1] - 60, Math.atan2(H1[1] - hy, H1[0] - hx), 16, C.red); noGlow(g);
    T(g, '误差', (hx + H1[0]) / 2, (hy + H1[1]) / 2 - 110, 48, 'h', C.red, { glow: C.red, blur: 18 });
    g.restore();
  }
  // 合上的瞬间
  const mA = win(t, 128.55, 129.5, .05, .5);
  if (mA > 0) { const u = (t - 128.55) / .9; g.strokeStyle = rgba(C.green, mA); g.lineWidth = 6; glow(g, C.green, 24); circ(g, H1[0], H1[1] - lift, 60 + u * 110); g.stroke(); noGlow(g); check(g, H1[0], H1[1] - 170 - lift, .9, C.green, clamp((t - 128.6) / .3) * mA); }
  // 大脑与预测
  drawBrain(g, 250, 600, .36, { t, glow: .4 + .3 * gA });
  bubble(g, '预测：手握着杯子', 640, 590, 50, C.cyan, clamp((t - 123.7) / .3) * (1 - seg(t, 129.6, 130.0)), { sc: E.back(clamp((t - 123.7) / .35)) });
  g.save(); g.globalAlpha *= clamp((t - 130.1) / .4);
  T(g, '主动推断 · Active Inference', 540, 455, 46, 'h', C.cyan, { glow: rgba(C.cyan, .7), blur: 18 });
  g.restore();
  g.restore();
}

/* ---- 黑屋子难题 ---- */
function sceneRoom(g, t) {
  bigText(g, '等等——', 540, 820, 150, win(t, 133.7, 135.5, .2, .3), { pop: (t - 133.7) / .3, col: C.amber });
  const A = win(t, 135.3, 157.9, .4, .4); if (A <= 0) return;
  g.save(); g.globalAlpha *= A;
  const RX0 = 170, RX1 = 910, RY0 = 560, RY1 = 1250, DX0 = 650, DX1 = 790, DY0 = 960;
  const open = E.io(seg(t, 150.0, 150.9));
  g.fillStyle = '#020307'; rr(g, RX0, RY0, RX1 - RX0, RY1 - RY0, 20); g.fill();
  // 门缝里的光
  const leak = seg(t, 146.4, 148.5) * (1 - open);
  if (leak > 0) { g.fillStyle = rgba(C.amber, .7 * leak); glow(g, C.amber, 30); g.fillRect(DX0 + 6, RY1 - 7, DX1 - DX0 - 12, 5); noGlow(g); }
  // 门与光
  if (open > 0) {
    const lg = g.createLinearGradient(0, DY0, 0, RY1 + 120); lg.addColorStop(0, rgba('#FFE2A8', .95 * open)); lg.addColorStop(1, rgba('#FFC457', .8 * open));
    g.fillStyle = lg; g.fillRect(DX0, DY0, DX1 - DX0, RY1 - DY0);
    const sp = g.createLinearGradient(0, RY1 - 20, 0, RY1 + 160); sp.addColorStop(0, rgba('#FFD68A', .45 * open)); sp.addColorStop(1, 'rgba(255,214,138,0)');
    g.fillStyle = sp; g.beginPath(); g.moveTo(DX0, RY1); g.lineTo(DX1, RY1); g.lineTo(DX1 + 220, RY1 + 160); g.lineTo(DX0 - 260, RY1 + 160); g.closePath(); g.fill();
    const rg = g.createRadialGradient((DX0 + DX1) / 2, 1100, 20, (DX0 + DX1) / 2, 1100, 560); rg.addColorStop(0, rgba('#FFC457', .22 * open)); rg.addColorStop(1, 'rgba(255,196,87,0)');
    g.fillStyle = rg; g.fillRect(RX0, RY0, RX1 - RX0, RY1 - RY0);
    for (let i = 0; i < 18; i++) { const u = ((t * .2 + hash(i, 1, 4)) % 1); g.fillStyle = rgba('#FFE7B0', .7 * Math.sin(u * Math.PI) * open); circ(g, DX0 - 40 + hash(i, 2, 4) * 260, lerp(RY1, DY0 - 60, u), 2.5); g.fill(); }
  }
  g.strokeStyle = rgba(C.dim, .7); g.lineWidth = 5; g.beginPath(); g.moveTo(DX0, RY1); g.lineTo(DX0, DY0); g.lineTo(DX1, DY0); g.lineTo(DX1, RY1); g.stroke();
  // 门板：向外打开（宽度变窄）
  const dw = (DX1 - DX0) * (1 - open * .82);
  g.fillStyle = '#121828'; g.strokeStyle = rgba(C.dim, .8); g.lineWidth = 4;
  g.beginPath(); g.moveTo(DX0, DY0); g.lineTo(DX0 + dw, DY0 - 14 * open); g.lineTo(DX0 + dw, RY1 + 14 * open); g.lineTo(DX0, RY1); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = rgba(C.dim, .9); circ(g, DX0 + dw - 20 * (1 - open * .7), 1110, 6); g.fill();
  g.strokeStyle = rgba(C.dim, .55); g.lineWidth = 5; rr(g, RX0, RY0, RX1 - RX0, RY1 - RY0, 20); g.stroke();
  // 人
  const stand = t >= 151.0, walkU = E.sine(seg(t, 151.2, 153.8));
  const px = stand ? lerp(360, 700, walkU) : 360;
  const lit = open;
  const pcol = mixHex('#59637A', C.white, Math.max(seg(t, 141.8, 142.4) * .6, lit));
  if (!stand) drawPerson(g, { x: px, y: RY1, s: .95, pose: 'sit', col: pcol, expr: t < 141.9 ? 'sleep' : t < 146.2 ? 'sad' : 'neutral', look: t > 146.2 ? 6 : 0, headDX: t > 146.2 ? 8 : 0 });
  else drawPerson(g, { x: px, y: RY1, s: .95, pose: walkU > 0 && walkU < 1 ? 'walk' : 'stand', walkPh: t * 9, col: pcol, fill: mixHex('#161D30', '#2A2418', lit), expr: t > 155.6 ? 'wow' : 'smile', look: 6, armUp: t > 155.8 });
  // zZ
  if (t < 141.9) for (let k = 0; k < 3; k++) { const u = ((t * .5 + k / 3) % 1); g.save(); g.globalAlpha *= Math.sin(u * Math.PI) * .8; T(g, k % 2 ? 'z' : 'Z', 400 + u * 80, 950 - u * 120, 34 + k * 8, 's', C.dim); g.restore(); }
  // 第 3 天
  g.save(); g.globalAlpha *= win(t, 141.8, 150.2, .3, .4);
  T(g, '第 3 天', 290, 620, 46, 'h', C.amber);
  const tags = [['饿', 300, 860, 142.4], ['渴', 470, 800, 143.0], ['慌', 380, 730, 143.6], ['闷', 530, 900, 144.2]];
  for (const [s, x, y, t0] of tags) { const u = t - t0; if (u < 0) continue; pill(g, s, x, y + Math.sin(t * 5 + x) * 4, 42, C.red, 1, E.back(clamp(u / .3))); }
  for (const t0 of [142.6, 144.6]) { const u = t - t0; if (u < 0 || u > 1) continue; g.save(); g.globalAlpha *= Math.sin(u * Math.PI); T(g, '咕～', 470, 1130 - u * 30, 40, 's', C.white); g.restore(); }
  g.restore();
  // 意外计量条
  const lvl = seg(t, 142.0, 146.0) * .85 * (1 - .7 * E.io(seg(t, 150.5, 155.0)));
  g.save(); g.globalAlpha *= win(t, 141.9, 157.9, .4, .4);
  g.strokeStyle = rgba(C.white, .4); g.lineWidth = 4; rr(g, 950, 600, 56, 600, 28); g.stroke();
  const fh = 590 * lvl; g.fillStyle = C.red; glow(g, C.red, 20); rr(g, 955, 1195 - fh, 46, fh, 23); g.fill(); noGlow(g);
  T(g, '意外', 978, 560, 36, 'h', C.red);
  g.restore();
  // 问号 / 感叹号
  if (t > 146.4 && t < 151.0) { g.save(); g.globalAlpha *= clamp((t - 146.4) / .3); T(g, '?', 380, 940 + Math.sin(t * 4) * 6, 70, 's', C.cyan, { glow: C.cyan, blur: 16 }); g.restore(); }
  if (t > 155.6) {
    g.save(); g.globalAlpha *= clamp((t - 155.6) / .2);
    T(g, '!', px, 900 + Math.sin(t * 6) * 5, 90, 's', C.amber, { glow: C.amber, blur: 24 });
    for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + t * .8, r = 150 + 20 * Math.sin(t * 4 + k); g.fillStyle = rgba('#FFE7B0', .8); circ(g, (DX0 + DX1) / 2 + Math.cos(a) * r, 1080 + Math.sin(a) * r * .8, 4); g.fill(); }
    g.restore();
  }
  T(g, '黑屋子难题', 540, 470, 44, 'h', rgba(C.amber, .9 * win(t, 139.4, 157.8, .4, .4)), { ls: 6 });
  g.restore();
}

/* ---- 结尾：再看一次球 → 循环 ---- */
function sceneReplay(g, t) {
  const lt = t - REPLAY0, B = BALL;
  const stA = win(t, 157.7, 168.9, .4, .45);
  if (stA > 0) {
    g.save(); g.globalAlpha *= stA;
    const s = drawBallStage(g, lt);
    g.save(); g.globalAlpha *= clamp((t - 159.0) / .3) * (1 - seg(t, 162.2, 162.5));
    T(g, '盯住这个球。', 540, 430, 128, 's', C.white, { glow: 'rgba(0,0,0,.6)', blur: 20 });
    g.restore();
    predictionMarks(g, s, clamp((t - 165.1) / .4), true);
    g.restore();
  }
  // 从细胞到你
  const iA = win(t, 168.4, 174.9, .3, .35);
  if (iA > 0) {
    g.save(); g.globalAlpha *= iA;
    const xs = [190, 420, 650, 880], ts = [168.6, 169.2, 169.8, 170.4];
    xs.forEach((x, i) => {
      const p = E.back(clamp((t - ts[i]) / .35)); if (p <= 0) return;
      g.save(); g.translate(x, 840); g.scale(p, p);
      if (i === 0) cellIcon(g, 0, 0, 1, C.cyan, t);
      else if (i === 1) drawFish(g, 0, 0, .8, 0, { t });
      else if (i === 2) catIcon(g, 0, 0, 1, C.amber);
      else drawPerson(g, { x: 0, y: 150, s: .62, pose: 'stand', col: C.white, expr: 'smile' });
      g.restore();
      if (t > 171.5) { for (let k = 0; k < 2; k++) { const u = ((t - 171.5) * .9 + k * .5) % 1; g.strokeStyle = rgba(C.cyan, .6 * (1 - u)); g.lineWidth = 4; circ(g, x, 840, 80 + u * 70); g.stroke(); } }
    });
    if (t > 168.6) for (let i = 0; i < 3; i++) { const a = clamp((t - ts[i + 1] - .1) / .3); T(g, '→', (xs[i] + xs[i + 1]) / 2, 840, 44, 'h', rgba(C.dim, a)); }
    g.restore();
  }
  // 循环
  const lA = win(t, 174.5, 178.4, .35, .4);
  if (lA > 0) {
    g.save(); g.globalAlpha *= lA;
    const cx = 540, cy = 840, R0 = 240;
    const nodes = [[-Math.PI / 2, '猜', C.cyan, 174.6], [Math.PI / 6, '被纠正', C.red, 175.5], [Math.PI * 5 / 6, '猜得更好', C.green, 176.4]];
    g.lineWidth = 6; g.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      const a0 = nodes[i][0] + .42, a1 = nodes[(i + 1) % 3][0] - .42 + (i === 2 ? TAU : 0);
      const p = clamp((t - nodes[(i + 1) % 3][3] + .5) / .5);
      if (i === 2) { const q = clamp((t - 177.0) / .5); if (q <= 0) continue; g.strokeStyle = rgba(C.white, .5); g.beginPath(); g.arc(cx, cy, R0, a0, lerp(a0, a1, q)); g.stroke(); if (q >= 1) arrowHead(g, cx + Math.cos(a1) * R0, cy + Math.sin(a1) * R0, a1 + Math.PI / 2, 16, rgba(C.white, .7)); continue; }
      if (p <= 0) continue;
      g.strokeStyle = rgba(C.white, .5); g.beginPath(); g.arc(cx, cy, R0, a0, lerp(a0, a1, p)); g.stroke();
      if (p >= 1) arrowHead(g, cx + Math.cos(a1) * R0, cy + Math.sin(a1) * R0, a1 + Math.PI / 2, 16, rgba(C.white, .7));
    }
    for (const [a, s, col, t0] of nodes) {
      const p = E.back(clamp((t - t0) / .35)); if (p <= 0) continue;
      const x = cx + Math.cos(a) * R0, y = cy + Math.sin(a) * R0;
      g.save(); g.translate(x, y); g.scale(p, p);
      g.fillStyle = 'rgba(8,12,22,.95)'; g.strokeStyle = col; g.lineWidth = 6; glow(g, col, 26); circ(g, 0, 0, 88); g.fill(); g.stroke(); noGlow(g);
      T(g, s, 0, 2, s.length > 2 ? 40 : s.length > 1 ? 46 : 72, 's', col);
      g.restore();
    }
    if (t > 177.0) { const a = -Math.PI / 2 + (t - 177.0) * 2.4; g.fillStyle = C.white; glow(g, C.white, 20); circ(g, cx + Math.cos(a) * R0, cy + Math.sin(a) * R0, 9); g.fill(); noGlow(g); }
    drawBrain(g, cx, cy + 6, .3, { t, glow: .6, fire: 4 });
    g.restore();
  }
}

/* ---- 片尾 ---- */
function sceneEnd(g, t) {
  const lt = t - 178.1;
  drawBrain(g, 540, 690, 1.05 * (1 + .015 * Math.sin(t * 2)), { t, glow: .55 + .2 * Math.sin(t * 2), fire: 14, fireCol: C.cyan, alpha: clamp(lt / .6) });
  bigText(g, '你看见的世界，\n是大脑最好的一次{c|猜测}。', 540, 1070, 84, clamp((lt - .5) / .6), { rise: (1 - E.out(clamp((lt - .5) / .8))) * 24 });
  g.save(); g.globalAlpha *= clamp((lt - 2.0) / .8) * .85;
  T(g, '参考：K. Friston, The free-energy principle: a unified brain theory?', 540, 1400, 27, 'm', C.dim);
  T(g, 'Nature Reviews Neuroscience 11, 127–138 (2010)', 540, 1440, 27, 'm', C.dim);
  T(g, '注：自由能原理影响很大，也很有争议——它是一个理论框架，而非已被证实的定律。', 540, 1500, 27, 'm', C.dim);
  g.restore();
}

/* ================= 时间线 ================= */
const SCENES = [
  [0, 14.25, sceneHook, 0, .3],
  [14.05, 18.2, sceneTitle, .2, .35],
  [18.0, 41.25, sceneBox, .35, .35],
  [41.05, 59.4, sceneText, .3, .3],
  [59.0, 71.7, sceneFish, .2, .3],
  [71.2, 85.5, sceneLife, .3, .3],
  [85.0, 107.8, sceneLid, .4, .35],
  [107.6, 120.5, scenePaths, .2, .35],
  [120.1, 134.0, sceneHand, .3, .35],
  [133.6, 158.0, sceneRoom, .2, .4],
  [157.6, 178.5, sceneReplay, .35, .4],
  [178.0, DURATION, sceneEnd, .4, 1.2],
];
function grainTime(t) {
  if (t >= BALL.TF && t < HOOK_UNFREEZE) return BALL.TF;
  const rf = REPLAY0 + BALL.TF;
  if (t >= rf && t < REPLAY_UNFREEZE) return rf;
  return t;
}
function frame(t) {
  CUR_T = t;
  const g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.drawImage(bgCv, 0, 0);
  for (const [a, b, fn, fi, fo] of SCENES) {
    const al = win(t, a, b, fi, fo);
    if (al > 0) withLayer(g, al, gg => fn(gg, t));
  }
  g.drawImage(vigCv, 0, 0);
  for (const c of CAPS) drawCaption(g, t, c);
  const tg = grainTime(t), gi = Math.floor(tg * 24);
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = .045;
  g.drawImage(GRAINS[gi % 4], -(gi * 37 % 60), -(gi * 53 % 60), W + 60, H + 60); g.restore();
  if (t > DURATION - 1.0) { g.fillStyle = `rgba(0,0,0,${seg(t, DURATION - 1.0, DURATION - .05)})`; g.fillRect(0, 0, W, H); }
}

/* 封面 */
function cover() {
  const g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  g.drawImage(bgCv, 0, 0);
  const gr = g.createRadialGradient(540, 1180, 60, 540, 1180, 700); gr.addColorStop(0, 'rgba(242,169,217,.16)'); gr.addColorStop(1, 'rgba(242,169,217,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  T(g, 'THE FREE-ENERGY PRINCIPLE', 540, 300, 34, 'h', C.amber, { ls: 8 });
  T(g, '你的大脑', 540, 470, 150, 's', C.white, { glow: 'rgba(0,0,0,.8)', blur: 30 });
  T(g, '只做一件事', 540, 670, 196, 's', C.cyan, { glow: C.cyan, blur: 50 });
  drawBrain(g, 540, 1180, 1.55, { t: 3.3, glow: 1, fire: 16 });
  pill(g, '自由能原理 · 3 分钟讲清', 540, 1560, 50, C.amber, 1, 1);
  g.drawImage(vigCv, 0, 0);
}

Promise.all(['SHS', 'SHSH', 'SMI'].map(f => document.fonts.load(`60px ${f}`, '大脑意外'))).then(() => {
  window.frame = frame;
  window.cover = cover;
  window.DURATION = DURATION;
  frame(0);
  window.READY = true;
});
