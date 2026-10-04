'use strict';
/* 《你不特别》—— 程序化短视频。frame(t) 按时间 t（秒）确定性地画出一帧。 */
const W = 1080, H = 1920, DURATION = 160;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
const roomCv = mk(), tmpCv = mk(), sceneCv = mk(), spotCv = mk(), layerCv = mk();
const roomG = roomCv.getContext('2d'), tmpG = tmpCv.getContext('2d'), sceneG = sceneCv.getContext('2d'),
  spotG = spotCv.getContext('2d'), layerG = layerCv.getContext('2d');

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
  bounce: u => { const n = 7.5625, d = 2.75; if (u < 1 / d) return n * u * u; if (u < 2 / d) return n * (u -= 1.5 / d) * u + .75; if (u < 2.5 / d) return n * (u -= 2.25 / d) * u + .9375; return n * (u -= 2.625 / d) * u + .984375; },
};
function win(t, a, b, fi = .4, fo = .4) { if (t < a || t > b) return 0; return Math.min(fi > 0 ? clamp((t - a) / fi) : 1, fo > 0 ? clamp((b - t) / fo) : 1); }
function R(seed) { let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(a, b, c) { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
const INK = '#2A2833', BODY = '#FFF8EC', RED = '#B53A2E', PAPER = '#F1E7D3';
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function circ(g, x, y, r) { g.beginPath(); g.arc(x, y, Math.max(r, .01), 0, TAU); }
function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(rx, .01), Math.max(ry, .01), rot, 0, TAU); }
function F(px, b) { return `${px}px ${b ? 'WKB' : 'WK'}, "WenQuanYi Zen Hei", sans-serif`; }
function lines(g, str, x, y, px, lh = 1.42) {
  const ls = str.split('\n'), tot = (ls.length - 1) * px * lh;
  g.textAlign = 'center'; g.textBaseline = 'middle';
  ls.forEach((l, i) => g.fillText(l, x, y - tot / 2 + i * px * lh));
}
function textW(g, str, px, b) { g.font = F(px, b); return Math.max(...str.split('\n').map(l => g.measureText(l).width)); }
function withLayer(g, alpha, fn, force) {
  if (alpha <= 0.001) return;
  if (alpha >= 0.999 && !force) { fn(g); return; }
  layerG.setTransform(1, 0, 0, 1, 0, 0); layerG.globalAlpha = 1; layerG.clearRect(0, 0, W, H);
  fn(layerG);
  g.save(); g.globalAlpha = alpha; g.drawImage(layerCv, 0, 0); g.restore();
}

/* ---------------- 预生成纹理 ---------------- */
const paperCv = mk();
(() => {
  const g = paperCv.getContext('2d'); g.fillStyle = PAPER; g.fillRect(0, 0, W, H);
  const id = g.getImageData(0, 0, W, H), d = id.data, r = R(5);
  for (let i = 0; i < d.length; i += 4) { const n = (r() - .5) * 12; d[i] += n; d[i + 1] += n; d[i + 2] += n * .9; }
  g.putImageData(id, 0, 0);
  g.strokeStyle = 'rgba(120,90,50,.07)'; g.lineWidth = 1.3;
  for (let i = 0; i < 600; i++) {
    const x = r() * W, y = r() * H, a = r() * TAU, l = 10 + r() * 40;
    g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + Math.cos(a) * l / 2 + r() * 6, y + Math.sin(a) * l / 2 + r() * 6, x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  const gr = g.createRadialGradient(540, 960, 520, 540, 960, 1250);
  gr.addColorStop(0, 'rgba(130,90,40,0)'); gr.addColorStop(1, 'rgba(130,90,40,.20)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
})();
const grainCv = mk(W / 2, H / 2);
(() => {
  const g = grainCv.getContext('2d'), id = g.createImageData(W / 2, H / 2), d = id.data, r = R(11);
  for (let i = 0; i < d.length; i += 4) { const v = r() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  g.putImageData(id, 0, 0);
})();
const STARS = (() => { const r = R(3); return Array.from({ length: 260 }, () => [r() * W, r() * H, r() * 1.8 + .5, r() * TAU]); })();
const SPECKS = (() => { const r = R(21); return Array.from({ length: 70 }, () => [r() - .5, r() - .5, r() * 3 + 1]); })();

/* ---------------- 角色 ---------------- */
function drawGlasses(g, x, y, lw) {
  g.save(); g.translate(x, y);
  g.fillStyle = '#121216'; g.strokeStyle = INK; g.lineWidth = lw;
  rr(g, -51, -16, 45, 33, [8, 8, 15, 15]); g.fill();
  rr(g, 6, -16, 45, 33, [8, 8, 15, 15]); g.fill();
  g.beginPath(); g.moveTo(-7, -7); g.quadraticCurveTo(0, -12, 7, -7); g.stroke();
  g.beginPath(); g.moveTo(-51, -9); g.lineTo(-64, -13); g.moveTo(51, -9); g.lineTo(64, -13); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = Math.max(2, lw * .6);
  g.beginPath(); g.moveTo(-41, -5); g.lineTo(-31, -11); g.moveTo(15, -5); g.lineTo(25, -11); g.stroke();
  g.restore();
}
function drawArm(g, sx, sy, hx, hy, side, lw, o) {
  const mx = (sx + hx) / 2 + side * 28, my = (sy + hy) / 2 + 10;
  g.beginPath(); g.moveTo(sx, sy); g.quadraticCurveTo(mx, my, hx, hy);
  g.strokeStyle = INK; g.lineWidth = lw + 14; g.stroke();
  g.strokeStyle = o.sleeve || o.body || BODY; g.lineWidth = 14; g.stroke();
  g.fillStyle = o.body || BODY; g.strokeStyle = INK; g.lineWidth = lw; circ(g, hx, hy, 12); g.fill(); g.stroke();
}
function drawLegs(g, o, lw) {
  const t = o.t || 0, mode = o.legs || 'dangle';
  if (mode === 'none') return;
  g.strokeStyle = INK; g.lineWidth = lw;
  if (mode === 'lotus') { g.fillStyle = o.robe || BODY; ell(g, 0, 6, 116, 38); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-60, 10); g.quadraticCurveTo(0, 30, 60, 10); g.stroke(); return; }
  const L = [];
  if (mode === 'dangle') { const sw = Math.sin(t * 1.6 + (o.ph || 0)) * 6; L.push([-30, 0, -36 + sw, 110], [30, 0, 36 - sw * .7, 110]); }
  else if (mode === 'stand') L.push([-30, 0, -34, 100], [30, 0, 34, 100]);
  else if (mode === 'walk') { const p = o.walkPh || 0, a = Math.sin(p) * 26; L.push([-24, 0, -24 + a, 100 - Math.max(0, Math.cos(p)) * 8], [24, 0, 24 - a, 100 - Math.max(0, -Math.cos(p)) * 8]); }
  for (const [x0, y0, x1, y1] of L) {
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1);
    g.strokeStyle = INK; g.lineWidth = lw + 14; g.stroke();
    g.strokeStyle = o.pants || o.robe || o.body || BODY; g.lineWidth = 14; g.stroke();
    g.fillStyle = INK; ell(g, x1 + (x1 < 0 ? -9 : 9), y1 + 4, 21, 11); g.fill();
  }
}
function drawFace(g, o, lw) {
  const e = o.expr || 'neutral';
  g.fillStyle = INK; g.strokeStyle = INK; g.lineWidth = lw;
  if (!o.glasses) {
    const lx = o.lookX || 0, ly = o.lookY || 0;
    if (e === 'calm' || o.eyes === 'closed') {
      for (const sx of [-22, 22]) { g.beginPath(); g.arc(sx, -6, 10, .15 * Math.PI, .85 * Math.PI); g.stroke(); }
    } else if (e === 'happy') {
      for (const sx of [-22, 22]) { g.beginPath(); g.arc(sx + lx, 0, 10, 1.15 * Math.PI, 1.85 * Math.PI); g.stroke(); }
    } else {
      const blink = o.blink ? .15 : 1;
      for (const sx of [-22, 22]) { ell(g, sx + lx, -4 + ly, 6.5, 6.5 * blink); g.fill(); }
    }
    if (e === 'sad') { g.beginPath(); g.moveTo(-34, -22); g.lineTo(-13, -29); g.moveTo(34, -22); g.lineTo(13, -29); g.stroke(); }
  }
  g.beginPath();
  if (e === 'sad') { g.moveTo(-14, 31); g.quadraticCurveTo(0, 20, 14, 31); }
  else if (e === 'smile' || e === 'happy' || e === 'calm') { g.moveTo(-16, 22); g.quadraticCurveTo(0, 37, 16, 22); }
  else if (e === 'smug') { g.moveTo(-14, 27); g.quadraticCurveTo(6, 33, 19, 18); }
  else if (e === 'o') { ell(g, 0, 28, 7, 9); }
  else if (e === 'wry') { g.moveTo(-12, 27); g.quadraticCurveTo(2, 31, 14, 22); }
  else { g.moveTo(-9, 27); g.lineTo(9, 27); }
  g.stroke();
  if (o.blush) { g.fillStyle = `rgba(232,120,110,${.4 * o.blush})`; ell(g, -40, 15, 12, 7); g.fill(); ell(g, 40, 15, 12, 7); g.fill(); }
  if (e === 'smug' && o.glasses) { g.strokeStyle = INK; g.beginPath(); g.moveTo(12, -36); g.quadraticCurveTo(28, -47, 44, -38); g.stroke(); }
}
const ROBES = { cave: '#8B5A33', tang: '#A9BCCB', werther: '#3E5C8A', emo: '#3B3F52', marcus: '#F3EEE4', zhuang: '#CDBE95', buddha: '#D88A3D', sisyphus: '#C7A273' };
function costumeBody(g, o, top, lw) {
  const c = o.costume;
  g.strokeStyle = INK; g.lineWidth = lw;
  if (c === 'cave') {
    g.fillStyle = '#8B5A33';
    g.beginPath(); g.moveTo(-74, top + 70); g.lineTo(60, top + 28); g.lineTo(75, top + 60); g.lineTo(75, -8);
    for (let x = 75; x >= -75; x -= 25) { g.lineTo(x - 12, 8); g.lineTo(x - 25, -8); }
    g.closePath(); g.fill(); g.stroke();
    g.fillStyle = 'rgba(40,20,10,.35)'; for (const [x, y] of [[-30, -60], [20, -90], [40, -40], [-45, -25]]) { ell(g, x, y, 9, 6); g.fill(); }
  } else if (c === 'werther') {
    g.fillStyle = '#E6C15A'; rr(g, -30, top + 38, 60, -top - 52, 6); g.fill(); g.stroke();
    g.fillStyle = INK; for (let y = top + 60; y < -20; y += 26) { circ(g, 0, y, 4); g.fill(); }
    g.fillStyle = '#FBF8F1'; g.beginPath(); g.moveTo(-20, top + 20); g.lineTo(20, top + 20); g.lineTo(0, top + 62); g.closePath(); g.fill(); g.stroke();
  } else if (c === 'tang' || c === 'zhuang') {
    g.beginPath(); g.moveTo(-34, top + 22); g.lineTo(6, top + 82); g.moveTo(34, top + 22); g.lineTo(-4, top + 70); g.stroke();
    g.fillStyle = c === 'tang' ? '#6E5A7E' : '#8A7B55'; rr(g, -75, -62, 150, 16, 4); g.fill(); g.stroke();
  } else if (c === 'emo') {
    g.beginPath(); g.moveTo(-18, top + 30); g.lineTo(-22, top + 90); g.moveTo(18, top + 30); g.lineTo(22, top + 90); g.stroke();
    g.strokeStyle = '#FFFFFF'; g.lineWidth = lw * .6; g.beginPath(); g.moveTo(-60, top - 40); g.quadraticCurveTo(-40, top + 40, -10, top + 110); g.stroke();
  } else if (c === 'marcus') {
    g.save(); rr(g, -75, top, 150, -top + 6, [75, 75, 42, 42]); g.clip();
    g.strokeStyle = '#7B3F78'; g.lineWidth = 30; g.beginPath(); g.moveTo(-90, top + 10); g.lineTo(90, -20); g.stroke();
    g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-60 + i * 30, top + 90); g.quadraticCurveTo(-30 + i * 30, -40, -40 + i * 30, 0); g.stroke(); }
    g.restore(); g.strokeStyle = INK; g.lineWidth = lw; rr(g, -75, top, 150, -top + 6, [75, 75, 42, 42]); g.stroke();
  } else if (c === 'buddha') {
    g.save(); rr(g, -75, top, 150, -top + 6, [75, 75, 42, 42]); g.clip();
    g.fillStyle = BODY; g.beginPath(); g.moveTo(20, top - 10); g.lineTo(90, top - 10); g.lineTo(90, top + 80); g.quadraticCurveTo(50, top + 40, 20, top - 10); g.fill();
    g.strokeStyle = INK; g.lineWidth = lw; g.beginPath(); g.moveTo(20, top - 5); g.quadraticCurveTo(52, top + 42, 90, top + 82); g.stroke();
    g.strokeStyle = 'rgba(90,40,10,.3)'; g.lineWidth = 3; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(-50 + i * 22, top + 60 + i * 8); g.quadraticCurveTo(-10 + i * 20, -60, 20 + i * 15, -10); g.stroke(); }
    g.restore(); g.strokeStyle = INK; g.lineWidth = lw; rr(g, -75, top, 150, -top + 6, [75, 75, 42, 42]); g.stroke();
  } else if (c === 'sisyphus') {
    g.fillStyle = '#7A5634'; rr(g, -75, -70, 150, 14, 3); g.fill(); g.stroke();
  }
}
function costumeBack(g, o, hr, lw, t) {
  const c = o.costume;
  if (c === 'buddha') {
    const gr = g.createRadialGradient(0, 0, hr * .6, 0, 0, hr * 1.9);
    gr.addColorStop(0, 'rgba(240,190,90,.55)'); gr.addColorStop(1, 'rgba(240,190,90,0)');
    g.fillStyle = gr; circ(g, 0, 0, hr * 1.9); g.fill();
    g.strokeStyle = 'rgba(200,140,40,.8)'; g.lineWidth = lw; circ(g, 0, -4, hr * 1.55); g.stroke();
  } else if (c === 'werther') {
    g.fillStyle = '#8A5A35'; g.strokeStyle = INK; g.lineWidth = lw; ell(g, -58, 18, 16, 26); g.fill(); g.stroke(); ell(g, 58, 18, 16, 26); g.fill(); g.stroke();
  } else if (c === 'longhair') {
    g.fillStyle = '#3A2E2A'; g.strokeStyle = INK; g.lineWidth = lw; rr(g, -72, -40, 144, 120, 40); g.fill(); g.stroke();
  }
}
function costumeHead(g, o, hr, lw, t) {
  const c = o.costume; g.strokeStyle = INK; g.lineWidth = lw;
  if (c === 'cave') {
    g.fillStyle = '#3B2A1E'; g.beginPath();
    for (let i = 0; i <= 12; i++) { const a = Math.PI * (1.05 + .9 * i / 12), rad = i % 2 ? hr + 26 : hr - 2; g.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); }
    g.closePath(); g.fill(); g.stroke();
  } else if (c === 'tang') {
    g.fillStyle = '#1C1C22';
    g.beginPath(); g.arc(0, -10, hr + 2, Math.PI * 1.08, Math.PI * 1.92); g.closePath(); g.fill(); g.stroke();
    ell(g, 0, -hr - 8, 34, 26); g.fill(); g.stroke();
    g.lineWidth = lw * 1.6; g.beginPath(); g.moveTo(-40, -hr + 4); g.lineTo(-118, -hr - 6); g.moveTo(40, -hr + 4); g.lineTo(118, -hr - 6); g.stroke();
  } else if (c === 'werther') {
    g.fillStyle = '#8A5A35'; g.beginPath(); g.arc(0, -8, hr + 2, Math.PI * 1.05, Math.PI * 1.95); g.quadraticCurveTo(0, -hr + 20, -hr, -14); g.fill(); g.stroke();
  } else if (c === 'emo') {
    g.fillStyle = '#141418'; g.beginPath(); g.moveTo(66, -18); g.quadraticCurveTo(50, -80, -10, -70); g.quadraticCurveTo(-70, -60, -72, 0); g.quadraticCurveTo(-60, 30, -40, 20); g.quadraticCurveTo(-30, 0, -6, -16); g.quadraticCurveTo(30, -30, 66, -18); g.fill(); g.stroke();
    g.fillStyle = '#FFFFFF'; circ(g, -62, 16, 7); g.fill(); g.stroke();
  } else if (c === 'marcus') {
    g.fillStyle = '#5C4A3A'; g.beginPath();
    for (let i = 0; i <= 14; i++) { const a = Math.PI * (.12 + .76 * i / 14); const rad = hr + (i % 2 ? 10 : 2); g.lineTo(Math.cos(a) * rad, Math.sin(a) * rad + 4); }
    g.lineTo(Math.cos(Math.PI * .88) * (hr - 18), Math.sin(Math.PI * .88) * (hr - 18)); g.quadraticCurveTo(0, hr - 2, Math.cos(Math.PI * .12) * (hr - 18), Math.sin(Math.PI * .12) * (hr - 18));
    g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#5C4A3A'; for (let i = 0; i < 7; i++) { const a = Math.PI * (1.15 + .7 * i / 6); circ(g, Math.cos(a) * (hr - 6), Math.sin(a) * (hr - 6), 13); g.fill(); g.stroke(); }
    g.fillStyle = '#6E8B4E'; for (let i = 0; i < 9; i++) { const a = Math.PI * (1.05 + .9 * i / 8); ell(g, Math.cos(a) * (hr + 4), Math.sin(a) * (hr + 4), 14, 7, a + Math.PI / 2 + .5); g.fill(); g.stroke(); }
  } else if (c === 'zhuang') {
    g.fillStyle = '#2E2A26'; g.beginPath(); g.arc(0, -6, hr + 1, Math.PI * 1.1, Math.PI * 1.9); g.closePath(); g.fill(); g.stroke();
    circ(g, 0, -hr - 10, 18); g.fill(); g.stroke();
    g.lineWidth = lw * .7; g.beginPath(); g.moveTo(-6, 44); g.quadraticCurveTo(-10, 80, -2, 104); g.moveTo(4, 44); g.quadraticCurveTo(8, 76, 2, 100); g.stroke();
  } else if (c === 'buddha') {
    g.fillStyle = '#2E2A3A'; g.beginPath(); g.arc(0, -4, hr + 1, Math.PI * 1.07, Math.PI * 1.93); g.closePath(); g.fill(); g.stroke();
    ell(g, 0, -hr - 6, 26, 20); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.25)'; for (let i = 0; i < 9; i++) { const a = Math.PI * (1.15 + .7 * i / 8); circ(g, Math.cos(a) * (hr - 14), Math.sin(a) * (hr - 14) - 4, 3.5); g.fill(); }
    g.fillStyle = o.body || BODY; ell(g, -hr + 2, 18, 9, 24); g.fill(); g.stroke(); ell(g, hr - 2, 18, 9, 24); g.fill(); g.stroke();
    g.fillStyle = INK; circ(g, 0, -24, 3.5); g.fill();
  } else if (c === 'sisyphus') {
    g.fillStyle = '#4A3A2C'; for (let i = 0; i < 7; i++) { const a = Math.PI * (1.12 + .76 * i / 6); circ(g, Math.cos(a) * (hr - 4), Math.sin(a) * (hr - 4), 15); g.fill(); g.stroke(); }
    g.strokeStyle = '#A8452F'; g.lineWidth = 9; g.beginPath(); g.arc(0, 0, hr - 2, Math.PI * 1.12, Math.PI * 1.88); g.stroke();
    g.beginPath(); g.moveTo(-hr + 6, -28); g.quadraticCurveTo(-hr - 20, -20, -hr - 30, 0); g.stroke();
  } else if (c === 'bun') {
    g.fillStyle = '#3A2E2A'; g.beginPath(); g.arc(0, -4, hr + 1, Math.PI * 1.08, Math.PI * 1.92); g.closePath(); g.fill(); g.stroke(); circ(g, 0, -hr - 12, 20); g.fill(); g.stroke();
  } else if (c === 'cap') {
    g.fillStyle = '#C0563E'; g.beginPath(); g.arc(0, -6, hr + 2, Math.PI, TAU); g.closePath(); g.fill(); g.stroke(); rr(g, 10, -14, 80, 14, 7); g.fill(); g.stroke();
  } else if (c === 'longhair') {
    g.fillStyle = '#3A2E2A'; g.beginPath(); g.arc(0, -4, hr + 1, Math.PI * 1.02, Math.PI * 1.98); g.quadraticCurveTo(10, -50, -hr, -10); g.fill(); g.stroke();
  }
}
/* o: x,y,s,rot,t,expr,glasses,glassesAt,slump,headDX,headDY,headRot,arms{l,r},legs,costume,phone,cup,lw,blush,lookX */
function drawChar(g, o) {
  const s = o.s || 1, t = o.t || 0;
  g.save(); g.translate(o.x, o.y); if (o.rot) g.rotate(o.rot); g.scale(s, s);
  g.lineJoin = 'round'; g.lineCap = 'round';
  const lw = o.lw || 5, sl = o.slump || 0;
  const br = Math.sin(t * 2.0 + (o.ph || 0)) * 2.2;
  const top = -180 + 26 * sl + br * .4;
  const hx = (o.headDX || 0) + 6 * sl, hy = -246 + 36 * sl + br + (o.headDY || 0), hr = 64;
  const robe = ROBES[o.costume];
  const oo = Object.assign({}, o, { robe, sleeve: o.costume === 'cave' || o.costume === 'sisyphus' || o.costume === 'buddha' ? BODY : robe });
  drawLegs(g, oo, lw);
  g.strokeStyle = INK; g.lineWidth = lw; g.fillStyle = robe || o.body || BODY;
  rr(g, -75, top, 150, -top + 6, [75, 75, 42, 42]); g.fill(); g.stroke();
  costumeBody(g, oo, top, lw);
  if (o.phone) {
    g.save(); g.translate(0, -80); g.rotate(-.08);
    g.fillStyle = '#2D3140'; g.strokeStyle = INK; g.lineWidth = lw; rr(g, -25, -40, 50, 78, 10); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.25)'; circ(g, -10, -26, 5); g.fill(); g.restore();
  }
  if (o.flip) { g.save(); g.translate(30, -150); g.rotate(-.5); g.fillStyle = '#9AA4B5'; g.strokeStyle = INK; g.lineWidth = lw; rr(g, -18, -34, 36, 66, 8); g.fill(); g.stroke(); g.beginPath(); g.moveTo(-18, 0); g.lineTo(18, 0); g.stroke(); g.restore(); }
  const sh = top + 44, A = o.arms || {};
  const L = A.l || [-26, -64], Rr = A.r || [26, -64];
  if (o.quill) { g.strokeStyle = INK; g.lineWidth = lw * .8; g.beginPath(); g.moveTo(Rr[0], Rr[1]); g.lineTo(Rr[0] + 40, Rr[1] - 70); g.stroke(); g.fillStyle = '#F4F0E8'; ell(g, Rr[0] + 34, Rr[1] - 62, 8, 26, .55); g.fill(); g.stroke(); }
  drawArm(g, -58, sh, L[0], L[1], -1, lw, oo);
  drawArm(g, 58, sh, Rr[0], Rr[1], 1, lw, oo);
  if (o.cup) { const [cx, cy] = o.cup === 'r' ? Rr : L; g.fillStyle = '#E9E2D2'; g.strokeStyle = INK; g.lineWidth = lw; g.beginPath(); g.moveTo(cx - 20, cy - 34); g.lineTo(cx + 20, cy - 34); g.lineTo(cx + 12, cy - 8); g.lineTo(cx - 12, cy - 8); g.closePath(); g.fill(); g.stroke(); }
  g.save(); g.translate(hx, hy); g.rotate((o.headRot || 0) + .12 * sl);
  costumeBack(g, oo, hr, lw, t);
  g.fillStyle = o.body || BODY; g.strokeStyle = INK; g.lineWidth = lw; circ(g, 0, 0, hr); g.fill(); g.stroke();
  drawFace(g, o, lw);
  costumeHead(g, oo, hr, lw, t);
  if (o.glasses) drawGlasses(g, 0, -5, lw);
  if (o.glint) { // 镜片闪光
    g.save(); g.translate(-30, -12); g.rotate(t * 3); g.fillStyle = `rgba(255,255,255,${o.glint})`;
    g.beginPath(); for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, rad = i % 2 ? 6 : 30; g.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); } g.fill(); g.restore();
  }
  g.restore();
  if (o.glassesAt) { const q = o.glassesAt; g.save(); g.translate(q.x, q.y); g.rotate(q.r || 0); drawGlasses(g, 0, 0, lw); g.restore(); }
  g.restore();
}

/* ---------------- 气泡 / 标签 / 字幕 ---------------- */
function thought(g, x, y, text, px, ax, ay, a = 1, sc = 1, opt = {}) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(sc, sc);
  const w = textW(g, text, px) + px * 1.3, nl = text.split('\n').length, h = nl * px * 1.35 + px * .9;
  g.fillStyle = opt.fill || 'rgba(255,253,248,.97)'; g.strokeStyle = INK; g.lineWidth = opt.lw || 3.5;
  const dx = (ax - x) / sc, dy = (ay - y) / sc;
  if (ax !== undefined) for (let i = 1; i <= 2; i++) { const u = .45 + i * .2; circ(g, dx * u, h / 2 * (1 - u) + dy * u, (opt.dot || px * .22) * (1.15 - i * .3)); g.fill(); g.stroke(); }
  rr(g, -w / 2, -h / 2, w, h, h / 2); g.fill(); g.stroke();
  g.fillStyle = opt.color || INK; g.font = F(px); lines(g, text, 0, 2, px, 1.35);
  g.restore();
}
function drawTag(g, o) {
  if (o.alpha <= 0) return;
  g.save(); g.globalAlpha *= o.alpha;
  const lc = o.warm ? 'rgba(255,236,196,.95)' : 'rgba(220,230,248,.92)';
  g.strokeStyle = lc; g.fillStyle = lc; g.lineWidth = 4; g.lineCap = 'round'; g.setLineDash([1, 10]);
  const mx = (o.x + o.tx) / 2 + (o.bend || 40), my = (o.y + o.ty) / 2;
  g.beginPath(); g.moveTo(o.x, o.y); g.quadraticCurveTo(mx, my, o.tx, o.ty); g.stroke(); g.setLineDash([]);
  circ(g, o.tx, o.ty, 7); g.fill();
  g.translate(o.x, o.y); g.rotate(o.rot || 0); g.scale(o.sc ?? 1, (o.sc ?? 1) * (o.sy ?? 1));
  const px = 36, w = textW(g, o.text, px) + 46, nl = o.text.split('\n').length, h = nl * px * 1.32 + 28;
  g.fillStyle = o.warm ? '#FFF2D8' : '#D9E1EE'; g.strokeStyle = INK; g.lineWidth = 3.5;
  g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 14; g.shadowOffsetY = 4;
  rr(g, -w / 2, -h / 2, w, h, 12); g.fill(); g.shadowColor = 'transparent'; g.stroke();
  g.fillStyle = INK; g.font = F(px); lines(g, o.text, 0, 2, px, 1.32);
  g.restore();
}

/* 字幕：in=内心独白(白)  na=旁白(暖黄)  sm=小字旁白  np=纸上旁白(墨)  smp=纸上小字  big=大字 */
const CAPS = [
  [4.0, 6.6, 'in', '又是什么都没发生的一天。'],
  [6.6, 9.3, 'in', '我的人生，怎么这么无聊。'],
  [15.8, 17.5, 'in', '没人懂我。'],
  [17.6, 20.7, 'in', '我的难过，是独一无二的。'],
  [21.3, 23.7, 'na', '镜头拉远一点。'],
  [23.9, 27.3, 'na', '隔壁的窗户里，\n也戴着同一副眼镜。'],
  [27.5, 30.6, 'na', '此刻，每一扇亮着的窗户后面，'],
  [30.6, 33.8, 'na', '都可能坐着一个\n觉得自己很特别的人。'],
  [33.9, 36.3, 'na', '再把时间，拉长一点。'],
  [47.6, 49.8, 'na', '你的难过，不是限量版。'],
  [49.8, 51.6, 'na', '是经典款。'],
  [51.6, 53.8, 'na', '历朝历代，常年有货。'],
  [54.2, 56.4, 'in', '呵，我看透了。'],
  [56.4, 59.2, 'in', '大家都以为自己很特别——'],
  [59.2, 62.4, 'in', '只有我，清醒地看穿了这一点。'],
  [63.7, 65.0, 'na', '嗯。'],
  [65.0, 67.6, 'na', '这个念头，也是经典款。'],
  [67.6, 70.4, 'sm', '（包括此刻心想「说得对」的你。）'],
  [70.4, 72.8, 'sm', '（以及做这条视频的我。）'],
  [73.4, 75.7, 'in', '所以……我这么普通，'],
  [75.7, 78.5, 'in', '那一切还有什么意义？'],
  [79.7, 82.6, 'np', '很多聪明人，\n都发现过「你没那么特别」。'],
  [82.6, 85.6, 'np', '但没有一个人因此觉得，\n一切都没意义。'],
  [86.1, 89.0, 'np', '他在行军的帐篷里，\n给自己写笔记：'],
  [89.0, 91.0, 'np', '「从高处往下看——」'],
  [91.0, 94.4, 'np', '一百年前的人，也在结婚、\n生病、抱怨当下。'],
  [94.4, 96.8, 'np', '所以，别把自己看得太重。'],
  [97.3, 100.0, 'np', '《庄子》里有个人说：\n「今者吾丧我。」'],
  [100.0, 102.4, 'np', '——我，把「我」弄丢了。'],
  [102.4, 105.0, 'np', '那个总想证明自己的「我」。'],
  [105.0, 107.6, 'np', '丢了以后，他也没打算去找。'],
  [108.1, 111.0, 'np', '他看见：生、老、病、死，\n人人有份。'],
  [111.0, 113.4, 'np', '你的苦，不特别——'],
  [113.4, 116.0, 'np', '这恰恰说明，\n你不是一个人在苦。'],
  [116.0, 118.6, 'np', '于是他生出的，是慈悲。'],
  [119.1, 122.8, 'np', '西西弗斯被罚推石上山，\n石头永远会滚下来。'],
  [122.8, 126.2, 'np', '加缪说：向着山顶的奋斗本身，\n足以充实一颗人心。'],
  [126.2, 129.6, 'np', '我们必须想象，\n西西弗斯是幸福的。'],
  [129.8, 132.4, 'smp', '（石头上的「周一」，是我加的。）'],
  [133.0, 135.4, 'na', '回到这个房间。'],
];
function drawCaption(g, t, c) {
  const [a, b, st, text] = c; const al = win(t, a, b, .32, .32); if (!al) return;
  const rise = (1 - E.out(clamp((t - a) / .5))) * 16;
  g.save(); g.globalAlpha = al;
  let px = 60, col = '#FFFFFF', y = 1580, shadow = true;
  if (st === 'na') col = '#FFE3AA';
  if (st === 'sm') { px = 46; col = 'rgba(255,236,205,.92)'; }
  if (st === 'np') { col = INK; shadow = false; }
  if (st === 'smp') { px = 46; col = 'rgba(42,40,51,.72)'; shadow = false; }
  if (shadow) {
    const nl = text.split('\n').length;
    g.save(); g.translate(W / 2, y); g.scale(1, .2 + .1 * nl); const gr = g.createRadialGradient(0, 0, 0, 0, 0, 620);
    gr.addColorStop(0, 'rgba(0,0,0,.42)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); g.fillStyle = gr; g.fillRect(-620, -620, 1240, 1240); g.restore();
    g.shadowColor = 'rgba(0,0,0,.75)'; g.shadowBlur = 18; g.shadowOffsetY = 3;
  }
  g.fillStyle = col; g.font = F(px, st === 'np' || st === 'in');
  lines(g, text, W / 2, y + rise, px, 1.42);
  g.restore();
}
function bigText(g, text, y, a, px = 96, col = '#FFF4DE') {
  if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 26;
  g.fillStyle = col; g.font = F(px, 1); lines(g, text, W / 2, y, px, 1.4); g.restore();
}
function drawToast(g, t, a, b, text) {
  const p = win(t, a, b, .01, .45); if (!p) return;
  const y = lerp(-90, 190, E.back(clamp((t - a) / .45)));
  g.save(); g.globalAlpha = p;
  g.font = F(40); const w = g.measureText(text).width + 150;
  g.fillStyle = 'rgba(22,22,30,.86)'; g.shadowColor = 'rgba(0,0,0,.5)'; g.shadowBlur = 20;
  rr(g, W / 2 - w / 2, y - 44, w, 88, 44); g.fill(); g.shadowColor = 'transparent';
  g.save(); g.translate(W / 2 - w / 2 + 62, y); g.scale(.42, .42); drawGlasses(g, 0, 0, 6); g.restore();
  g.fillStyle = '#FFFFFF'; g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillText(text, W / 2 - w / 2 + 108, y + 2);
  g.restore();
}
function drawSeal(g, x, y, text, p) {
  if (p <= 0) return;
  const sc = lerp(1.7, 1, E.out(clamp(p * 3.2))), a = clamp(p * 5);
  g.save(); g.translate(x, y); g.rotate(-.07); g.scale(sc, sc); g.globalAlpha *= a * .93;
  const S = 168; g.fillStyle = RED; rr(g, -S / 2, -S / 2, S, S, 12); g.fill();
  g.strokeStyle = '#F4E6D2'; g.lineWidth = 5; rr(g, -S / 2 + 13, -S / 2 + 13, S - 26, S - 26, 6); g.stroke();
  g.fillStyle = '#F4E6D2'; g.font = F(56, 1); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text.slice(0, 2), 0, -30); g.fillText(text.slice(2, 4), 0, 34);
  g.fillStyle = 'rgba(241,231,211,.75)'; for (const [u, v, r] of SPECKS) { circ(g, u * S, v * S, r); g.fill(); }
  g.restore();
}

/* ---------------- 房间 ---------------- */
const ROOM_STARS = (() => { const r = R(7); return Array.from({ length: 22 }, () => [120 + r() * 390, 310 + r() * 230, r() * 1.6 + .7, r() * 6]); })();
function drawClock(g, cx, cy, r, t) {
  g.fillStyle = '#FBF6EC'; circ(g, cx, cy, r); g.fill(); g.strokeStyle = INK; g.lineWidth = 7; g.stroke();
  for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU, l = i % 3 ? 14 : 22; g.lineWidth = i % 3 ? 3 : 5;
    g.beginPath(); g.moveTo(cx + Math.sin(a) * (r - 10), cy - Math.cos(a) * (r - 10)); g.lineTo(cx + Math.sin(a) * (r - 10 - l), cy - Math.cos(a) * (r - 10 - l)); g.stroke();
  }
  const mins = 40 + t / 60, hrs = 11 + mins / 60;
  const hand = (a, l, w, c) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + Math.sin(a) * l, cy - Math.cos(a) * l); g.stroke(); };
  hand(hrs / 12 * TAU, r * .5, 8, INK); hand(mins / 60 * TAU, r * .74, 5, INK);
  hand((Math.floor(t) % 60) / 60 * TAU, r * .8, 2.5, '#C0442F');
  g.fillStyle = INK; circ(g, cx, cy, 6); g.fill();
}
function drawPlant(g, x, y, t, leaf) {
  const sw = Math.sin(t * .9) * .03;
  const L = [[-2.55, 58], [-2.15, 72], [-1.8, 80], [-1.32, 76], [-.98, 66], [-.66, 52]];
  for (const [a, l] of L) {
    g.save(); g.translate(x, y - 56); g.rotate(a + sw + Math.PI / 2);
    g.fillStyle = '#6E995B'; g.strokeStyle = INK; g.lineWidth = 3.5; ell(g, 0, -l / 2, 14, l / 2); g.fill(); g.stroke();
    g.lineWidth = 2; g.beginPath(); g.moveTo(0, -4); g.lineTo(0, -l + 10); g.stroke(); g.restore();
  }
  if (leaf > 0) {
    const l = 56 * E.back(leaf);
    g.save(); g.translate(x + 2, y - 60); g.rotate(-1.55 + Math.PI / 2 + sw);
    g.fillStyle = '#A5D27A'; g.strokeStyle = INK; g.lineWidth = 3.5; ell(g, 0, -l / 2, 11 * clamp(leaf * 1.5), l / 2); g.fill(); g.stroke(); g.restore();
  }
  g.fillStyle = '#C46A45'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.moveTo(x - 32, y - 56); g.lineTo(x + 32, y - 56); g.lineTo(x + 24, y); g.lineTo(x - 24, y); g.closePath(); g.fill(); g.stroke();
  rr(g, x - 37, y - 66, 74, 14, 4); g.fill(); g.stroke();
}
const OPP_WINS = [[140, 625, 1], [228, 625, 0], [338, 625, 1], [426, 625, 0], [140, 745, 0], [228, 745, 1], [338, 745, 1], [426, 745, 1]];
function drawWindow(g, s) {
  const t = s.t, x0 = 110, y0 = 300, x1 = 520, y1 = 860;
  g.save(); rr(g, x0, y0, x1 - x0, y1 - y0, 4); g.clip();
  let gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#141B33'); gr.addColorStop(1, '#2E3B5E');
  g.fillStyle = gr; g.fillRect(x0, y0, x1 - x0, y1 - y0);
  for (const [x, y, r, p] of ROOM_STARS) { g.fillStyle = `rgba(255,250,230,${.5 + .4 * Math.sin(t * 2 + p)})`; circ(g, x, y, r); g.fill(); }
  gr = g.createRadialGradient(445, 380, 20, 445, 380, 120); gr.addColorStop(0, 'rgba(255,240,200,.35)'); gr.addColorStop(1, 'rgba(255,240,200,0)');
  g.fillStyle = gr; g.fillRect(x0, y0, 410, 300);
  g.fillStyle = '#F4E7C3'; circ(g, 445, 380, 34); g.fill();
  g.fillStyle = '#222B47'; g.beginPath(); g.moveTo(x0, 560); g.lineTo(150, 560); g.lineTo(150, 520); g.lineTo(230, 520); g.lineTo(230, 545); g.lineTo(330, 545); g.lineTo(330, 500); g.lineTo(420, 500); g.lineTo(420, 540); g.lineTo(x1, 540); g.lineTo(x1, y1); g.lineTo(x0, y1); g.fill();
  g.fillStyle = '#171E33'; g.fillRect(118, 600, 400, 260);
  for (let i = 0; i < OPP_WINS.length; i++) {
    const [wx, wy, lit] = OPP_WINS[i];
    if (i === 5 || lit) {
      gr = g.createLinearGradient(0, wy, 0, wy + 84); gr.addColorStop(0, '#F6CF7E'); gr.addColorStop(1, '#E0A955');
      g.fillStyle = gr; g.fillRect(wx, wy, 64, 84);
    } else { g.fillStyle = '#26304A'; g.fillRect(wx, wy, 64, 84); }
    if (i === 5) { // 对面的邻居
      const wv = s.nWave || 0;
      if (wv > 0) { const gl = g.createRadialGradient(wx + 32, wy + 42, 10, wx + 32, wy + 42, 95); gl.addColorStop(0, `rgba(255,214,130,${.55 * wv * (.75 + .25 * Math.sin(t * 6))})`); gl.addColorStop(1, 'rgba(255,214,130,0)'); g.fillStyle = gl; g.fillRect(wx - 70, wy - 60, 204, 204); }
      g.save(); g.beginPath(); g.rect(wx, wy, 64, 84); g.clip();
      drawChar(g, { x: wx + 32, y: wy + 96, s: .17, t: t + 1, lw: 10, glasses: s.nGlasses ?? true, expr: wv > 0 ? 'happy' : 'sad', phone: !wv,
        arms: wv > 0 ? { l: [-26, -64], r: [lerp(26, 110 + Math.sin(t * 9) * 26, wv), lerp(-64, -330, wv)] } : undefined, legs: 'none' });
      g.restore();
    }
  }
  g.restore();
  g.strokeStyle = '#F4EBDC'; g.lineWidth = 20; rr(g, x0, y0, x1 - x0, y1 - y0, 4); g.stroke();
  g.lineWidth = 12; g.beginPath(); g.moveTo(315, y0); g.lineTo(315, y1); g.moveTo(x0, 576); g.lineTo(x1, 576); g.stroke();
  g.strokeStyle = 'rgba(90,70,50,.35)'; g.lineWidth = 2; rr(g, x0 - 10, y0 - 10, x1 - x0 + 20, y1 - y0 + 20, 6); g.stroke();
  g.fillStyle = '#F4EBDC'; rr(g, 86, 856, 458, 28, 5); g.fill(); g.strokeStyle = 'rgba(90,70,50,.35)'; g.stroke();
  g.fillStyle = 'rgba(60,40,20,.15)'; g.fillRect(96, 884, 438, 10);
  // 窗帘
  g.strokeStyle = '#6B4A35'; g.lineWidth = 8; g.beginPath(); g.moveTo(40, 280); g.lineTo(570, 280); g.stroke();
  g.fillStyle = '#6B4A35'; circ(g, 40, 280, 11); g.fill(); circ(g, 570, 280, 11); g.fill();
  g.fillStyle = '#B4634A'; g.strokeStyle = INK; g.lineWidth = 4;
  g.beginPath(); g.moveTo(52, 284); g.lineTo(158, 284); g.bezierCurveTo(150, 450, 122, 600, 126, 700); g.bezierCurveTo(130, 790, 166, 870, 174, 950); g.lineTo(50, 950); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(60,20,10,.35)'; g.lineWidth = 3;
  for (const x of [80, 108, 132]) { g.beginPath(); g.moveTo(x, 300); g.quadraticCurveTo(x - 6, 600, x - 2, 940); g.stroke(); }
  g.fillStyle = '#E2B160'; g.strokeStyle = INK; g.lineWidth = 3; rr(g, 52, 690, 80, 18, 6); g.fill(); g.stroke();
  drawPlant(g, 445, 858, t, s.leaf || 0);
}
function drawRoom(g, s) {
  const t = s.t;
  let gr = g.createLinearGradient(0, 0, 0, 1290); gr.addColorStop(0, '#E8D8BF'); gr.addColorStop(1, '#DAC5A6');
  g.fillStyle = gr; g.fillRect(0, 0, W, 1292);
  g.fillStyle = 'rgba(160,120,80,.10)';
  for (let y = 70, k = 0; y < 1260; y += 96, k++) for (let x = (k % 2) * 48 + 24; x < W; x += 96) { circ(g, x, y, 5); g.fill(); }
  gr = g.createRadialGradient(292, 990, 10, 292, 990, 470); gr.addColorStop(0, 'rgba(255,205,120,.55)'); gr.addColorStop(1, 'rgba(255,205,120,0)');
  g.fillStyle = gr; g.fillRect(0, 500, 800, 900);
  gr = g.createLinearGradient(0, 1292, 0, H); gr.addColorStop(0, '#C7A57A'); gr.addColorStop(1, '#A68256');
  g.fillStyle = gr; g.fillRect(0, 1292, W, H - 1292);
  g.strokeStyle = 'rgba(80,50,25,.16)'; g.lineWidth = 3;
  let y = 1336, step = 44; while (y < H) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); step *= 1.2; y += step; }
  g.fillStyle = '#F2E8D8'; g.fillRect(0, 1268, W, 26); g.fillStyle = 'rgba(60,40,20,.12)'; g.fillRect(0, 1294, W, 8);
  g.fillStyle = '#B5664C'; ell(g, 600, 1416, 360, 50); g.fill();
  g.strokeStyle = 'rgba(255,235,210,.45)'; g.lineWidth = 4; g.setLineDash([10, 12]); ell(g, 600, 1416, 322, 37); g.stroke(); g.setLineDash([]);
  drawWindow(g, s);
  drawClock(g, 860, 420, 74, t);
  // 小画框
  g.save(); g.translate(880, 690); g.rotate(.04);
  g.fillStyle = '#F7F1E6'; g.strokeStyle = INK; g.lineWidth = 5; rr(g, -70, -52, 140, 104, 4); g.fill(); g.stroke();
  g.fillStyle = '#9DB4C0'; g.fillRect(-56, -38, 112, 76); g.fillStyle = '#6C8A6E'; g.beginPath(); g.moveTo(-56, 38); g.lineTo(-20, -8); g.lineTo(6, 18); g.lineTo(28, -2); g.lineTo(56, 38); g.fill();
  g.fillStyle = '#F2D27A'; circ(g, 30, -20, 9); g.fill(); g.restore();
  // 床头柜 + 台灯 + 杯子
  g.fillStyle = 'rgba(40,25,10,.2)'; ell(g, 340, 1338, 115, 11); g.fill();
  g.fillStyle = '#A8744C'; g.strokeStyle = INK; g.lineWidth = 5; rr(g, 250, 1118, 180, 214, 6); g.fill(); g.stroke();
  g.fillStyle = '#B98457'; rr(g, 236, 1104, 208, 20, 6); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(250, 1224); g.lineTo(430, 1224); g.stroke();
  g.fillStyle = INK; circ(g, 340, 1172, 7); g.fill(); circ(g, 340, 1278, 7); g.fill();
  g.fillStyle = '#E9DCC6'; ell(g, 292, 1098, 36, 8); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(292, 1096); g.lineTo(292, 1012); g.stroke();
  gr = g.createRadialGradient(292, 1020, 5, 292, 1020, 90); gr.addColorStop(0, 'rgba(255,230,160,.9)'); gr.addColorStop(1, 'rgba(255,230,160,0)');
  g.fillStyle = gr; g.fillRect(200, 980, 190, 140);
  g.fillStyle = '#E7AE57'; g.beginPath(); g.moveTo(262, 948); g.lineTo(322, 948); g.lineTo(347, 1014); g.lineTo(237, 1014); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#6C9AB0'; rr(g, 378, 1054, 44, 50, [4, 4, 10, 10]); g.fill(); g.stroke();
  g.beginPath(); g.arc(424, 1078, 13, -Math.PI / 2, Math.PI / 2); g.stroke();
  // 床
  g.fillStyle = 'rgba(40,25,10,.2)'; ell(g, 780, 1334, 330, 12); g.fill();
  g.fillStyle = '#8E6241'; g.strokeStyle = INK; g.lineWidth = 5;
  rr(g, 470, 1252, 26, 78, 4); g.fill(); g.stroke(); rr(g, 1040, 1252, 26, 78, 4); g.fill(); g.stroke();
  rr(g, 456, 1206, 660, 52, 8); g.fill(); g.stroke();
  g.fillStyle = '#F4EFE6'; rr(g, 466, 1118, 640, 96, 16); g.fill(); g.stroke();
  g.fillStyle = '#FBF8F2'; rr(g, 905, 1064, 200, 64, 30); g.fill(); g.stroke();
  g.fillStyle = '#7F9CB6'; g.beginPath(); g.moveTo(700, 1112); g.quadraticCurveTo(850, 1100, 1110, 1108); g.lineTo(1110, 1262);
  for (let x = 1110; x > 700; x -= 68) g.quadraticCurveTo(x - 34, 1280, x - 68, 1256);
  g.quadraticCurveTo(690, 1180, 700, 1112); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(30,40,60,.3)'; g.lineWidth = 3; for (const x of [800, 900, 1000]) { g.beginPath(); g.moveTo(x, 1120); g.quadraticCurveTo(x - 14, 1190, x - 4, 1250); g.stroke(); }
  // 人物
  drawChar(g, Object.assign({ x: 640, y: 1150, s: .95, t, phone: true, legs: 'dangle' }, s.char));
}

/* ---------------- 城市 ---------------- */
const GROUND = 2350;
const OUR = { x0: 300, x1: 780, top: 560 };
const CITY = (() => {
  const r = R(42), B = [];
  let x = -3600; while (x < 4600) { const w = 220 + r() * 460; B.push({ x0: x, x1: x + w, top: 300 + r() * 1500, far: 1, seed: r() * 1e9 | 0 }); x += w + r() * 30; }
  const mids = [[-2500, -1760, 700], [-1700, -1010, 1150], [-960, -330, 420], [-290, 250, 880], [820, 1310, 1080], [1350, 1950, 320], [2000, 2700, 760], [2750, 3400, 1300]];
  for (const [a, b, tp] of mids) B.push({ x0: a, x1: b, top: tp, far: 0, seed: r() * 1e9 | 0 });
  return B;
})();
const WIN_COLS = ['#F5CB78', '#F1BC63', '#F7D893', '#A9C8EE', '#EFB25E'];
const FIG_STYLES = ['', 'bun', 'cap', 'longhair', '', 'bun'];
function winCenters(b) {
  const w = b.x1 - b.x0, n = Math.max(1, Math.floor((w - 40) / 90)), m = (w - (n * 54 + (n - 1) * 36)) / 2;
  const cols = []; for (let i = 0; i < n; i++) cols.push(b.x0 + m + 27 + i * 90);
  const rows = []; for (let y = b.top + 140; y < GROUND - 200; y += 150) rows.push(y);
  return { cols, rows };
}
function drawWin(g, cx, cy, lit, col, figure, s, o, i, j, seed) {
  const x = cx - 27, y = cy - 48;
  g.fillStyle = '#4A5370'; g.fillRect(x - 4, y - 4, 62, 104);
  if (!lit) { g.fillStyle = '#1E2538'; g.fillRect(x, y, 54, 96); g.fillStyle = 'rgba(255,255,255,.05)'; g.beginPath(); g.moveTo(x, y + 60); g.lineTo(x + 30, y); g.lineTo(x + 44, y); g.lineTo(x, y + 88); g.fill(); }
  else {
    const gr = g.createLinearGradient(0, y, 0, y + 96); gr.addColorStop(0, col); gr.addColorStop(1, '#D7954A');
    g.fillStyle = gr; g.fillRect(x, y, 54, 96);
    if (figure && s > .5) {
      g.save(); g.beginPath(); g.rect(x, y, 54, 96); g.clip();
      const h = hash(seed, i, j), wave = o.wave && h < .45 ? 1 : 0;
      drawChar(g, { x: cx + (h - .5) * 16, y: y + 100, s: .19, t: o.t + h * 9, ph: h * 6, lw: 9, glasses: o.glasses, expr: o.glasses ? (h < .5 ? 'sad' : 'neutral') : (wave ? 'happy' : 'smile'),
        costume: FIG_STYLES[(h * 60 | 0) % FIG_STYLES.length], phone: !wave && h > .3, legs: 'none',
        arms: wave ? { l: [-26, -64], r: [110 + Math.sin(o.t * 8 + h * 9) * 24, -330] } : undefined });
      if (h > .62) { g.fillStyle = '#B4634A'; g.fillRect(x + 40, y, 14, 96); }
      g.restore();
    }
  }
  g.fillStyle = '#5B6584'; g.fillRect(x - 6, y + 96, 66, 6);
}
function drawCity(g, cam, o) {
  const s = cam.s, gy = (GROUND - cam.y) * s + H / 2;
  let gr = g.createLinearGradient(0, Math.min(gy - 2600 * s, 0), 0, gy);
  gr.addColorStop(0, '#0B1022'); gr.addColorStop(.7, '#18213D'); gr.addColorStop(1, '#2B3658');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  for (const [x, y, r, p] of STARS) { const a = .35 + .35 * Math.sin(o.t * 1.5 + p); g.fillStyle = `rgba(255,250,235,${a})`; circ(g, x, y, r); g.fill(); }
  const mx = (1700 - cam.x) * s * .35 + W / 2, my = (-300 - cam.y) * s * .35 + H / 2;
  gr = g.createRadialGradient(mx, my, 0, mx, my, 220); gr.addColorStop(0, 'rgba(255,240,200,.25)'); gr.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = gr; g.fillRect(mx - 220, my - 220, 440, 440);
  g.fillStyle = '#F4E7C3'; circ(g, mx, my, 60); g.fill();
  g.save(); g.translate(W / 2, H / 2); g.scale(s, s); g.translate(-cam.x, -cam.y);
  const vx0 = cam.x - W / 2 / s, vx1 = cam.x + W / 2 / s, vy0 = cam.y - H / 2 / s, vy1 = cam.y + H / 2 / s;
  for (const pass of [1, 0]) for (const b of CITY) {
    if (b.far !== pass || b.x1 < vx0 || b.x0 > vx1) continue;
    if (pass === 1) {
      g.fillStyle = '#161D33'; g.fillRect(b.x0, b.top, b.x1 - b.x0, GROUND - b.top + 10);
      const r = R(b.seed); g.fillStyle = 'rgba(240,190,110,.55)';
      for (let y = b.top + 40; y < GROUND - 60; y += 70) for (let x = b.x0 + 24; x < b.x1 - 30; x += 52) if (r() < .32) g.fillRect(x, y, 22, 34);
      continue;
    }
    g.fillStyle = '#2C344D'; g.fillRect(b.x0, b.top, b.x1 - b.x0, GROUND - b.top + 10);
    g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(b.x0, b.top, 14, GROUND - b.top);
    const { cols, rows } = winCenters(b);
    for (let i = 0; i < cols.length; i++) for (let j = 0; j < rows.length; j++) {
      const cx = cols[i], cy = rows[j]; if (cx + 40 < vx0 || cx - 40 > vx1 || cy + 60 < vy0 || cy - 60 > vy1) continue;
      const h = hash(b.seed, i, j); const lit = h < .58;
      drawWin(g, cx, cy, lit, WIN_COLS[(h * 50 | 0) % WIN_COLS.length], h < .45, s, o, i, j, b.seed);
    }
  }
  // 我们这栋楼
  g.fillStyle = '#394159'; g.fillRect(OUR.x0, OUR.top, OUR.x1 - OUR.x0, GROUND - OUR.top + 10);
  g.fillStyle = '#4A5370'; g.fillRect(OUR.x0 - 14, OUR.top - 18, OUR.x1 - OUR.x0 + 28, 22);
  for (let i = 0; i < 5; i++) for (let k = 0; k < 10; k++) {
    const cx = 360 + i * 90, cy = 700 + k * 150;
    if (cx + 40 < vx0 || cx - 40 > vx1 || cy + 60 < vy0 || cy - 60 > vy1) continue;
    if (i === 2 && k === 2) {
      g.fillStyle = '#4A5370'; g.fillRect(cx - 31, cy - 52, 62, 104);
      g.drawImage(roomCv, cx - 27, cy - 48, 54, 96);
      g.fillStyle = '#5B6584'; g.fillRect(cx - 33, cy + 48, 66, 6);
      continue;
    }
    const h = hash(777, i, k), force = o.forceLit && o.forceLit.has(i + ',' + k);
    const lit = force || h < .7;
    drawWin(g, cx, cy, lit, WIN_COLS[(h * 50 | 0) % WIN_COLS.length], force || h < .62, s, o, i, k, 777);
  }
  g.fillStyle = '#121726'; g.fillRect(vx0 - 10, GROUND, vx1 - vx0 + 20, 3000);
  g.fillStyle = '#1C2234'; g.fillRect(vx0 - 10, GROUND, vx1 - vx0 + 20, 26);
  for (let x = Math.floor(vx0 / 400) * 400; x < vx1; x += 400) {
    g.fillStyle = '#2A3046'; g.fillRect(x, GROUND - 220, 8, 220);
    const gl = g.createRadialGradient(x + 4, GROUND - 220, 0, x + 4, GROUND - 220, 120); gl.addColorStop(0, 'rgba(255,214,140,.5)'); gl.addColorStop(1, 'rgba(255,214,140,0)');
    g.fillStyle = gl; g.fillRect(x - 120, GROUND - 340, 248, 240); g.fillStyle = '#FFE2A6'; circ(g, x + 4, GROUND - 222, 9); g.fill();
  }
  g.restore();
}
function w2s(cam, x, y) { return [(x - cam.x) * cam.s + W / 2, (y - cam.y) * cam.s + H / 2]; }
function cityBubble(g, cam, i, k, text, a, side = 1) {
  const [sx, sy] = w2s(cam, 360 + i * 90, 700 + k * 150 - 48);
  const px = 34;
  thought(g, sx + side * 30, sy - 70, text, px, sx, sy - 6, a, 1, { dot: 7 });
}

/* ---------------- 地球 ---------------- */
const EARTH = (() => {
  const r = R(99), pts = [];
  for (let i = 0; i < 52; i++) {
    const la = (r() * 1.5 - .62), lo = r() * TAU, sp = .04 + r() * .16, n = 18 + r() * 70 | 0;
    for (let k = 0; k < n; k++) pts.push([la + (r() + r() + r() - 1.5) * sp, lo + (r() + r() + r() - 1.5) * sp * 1.7, .35 + r() * .65]);
  }
  return pts;
})();
function drawEarth(g, t, rad) {
  g.fillStyle = '#05070E'; g.fillRect(0, 0, W, H);
  for (const [x, y, r, p] of STARS) { g.fillStyle = `rgba(255,250,235,${.4 + .3 * Math.sin(t * 1.3 + p)})`; circ(g, x, y, r * .9); g.fill(); }
  const cx = 540, cy = 930;
  let gr = g.createRadialGradient(cx, cy, rad * .9, cx, cy, rad * 1.18);
  gr.addColorStop(0, 'rgba(90,140,255,.45)'); gr.addColorStop(1, 'rgba(90,140,255,0)');
  g.fillStyle = gr; circ(g, cx, cy, rad * 1.18); g.fill();
  gr = g.createRadialGradient(cx + rad * .4, cy - rad * .3, rad * .1, cx, cy, rad);
  gr.addColorStop(0, '#1A2C55'); gr.addColorStop(1, '#070C1A');
  g.fillStyle = gr; circ(g, cx, cy, rad); g.fill();
  const rot = t * .06, tl = .38, ct = Math.cos(tl), st = Math.sin(tl);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [la, lo, br] of EARTH) {
    const l = lo + rot, x = Math.cos(la) * Math.sin(l), y = Math.sin(la), z = Math.cos(la) * Math.cos(l);
    const y2 = y * ct - z * st, z2 = y * st + z * ct; if (z2 <= 0) continue;
    const sz = (1.1 + br * 2.2) * rad / 400 * (.35 + .65 * z2);
    g.fillStyle = `rgba(255,200,120,${br * Math.pow(z2, .6) * .85})`; circ(g, cx + x * rad, cy - y2 * rad, sz); g.fill();
  }
  g.restore();
  g.save(); circ(g, cx, cy, rad); g.clip();
  gr = g.createLinearGradient(cx + rad * .55, 0, cx + rad, 0); gr.addColorStop(0, 'rgba(120,180,255,0)'); gr.addColorStop(1, 'rgba(150,200,255,.55)');
  g.fillStyle = gr; g.fillRect(cx, cy - rad, rad, rad * 2); g.restore();
}

/* ---------------- 时间胶片 ---------------- */
const ERAS = [
  { label: '约三万年前', sub: '某个山洞', text: '族里没一个人懂我。' },
  { label: '唐', sub: '李白，月下', text: '独酌无相亲……' },
  { label: '1774 年', sub: '少年维特', text: '我的烦恼，无人能懂。' },
  { label: '2008 年', sub: 'QQ 空间', text: '45°角仰望天空，\n明媚的忧伤。' },
  { label: '现在', sub: '你', text: '没人懂我。' },
];
function eraChar(i, t, x, y, s) {
  const base = { x, y, s, t, glasses: true, expr: 'sad', legs: 'dangle', ph: i };
  if (i === 0) return Object.assign(base, { costume: 'cave' });
  if (i === 1) return Object.assign(base, { costume: 'tang', cup: 'r', arms: { l: [-26, -64], r: [96, -250] }, headRot: -.12 });
  if (i === 2) return Object.assign(base, { costume: 'werther', quill: true, arms: { l: [-30, -70], r: [70, -86] }, headRot: .1 });
  if (i === 3) return Object.assign(base, { costume: 'emo', flip: true, headRot: -.42, arms: { l: [-26, -64], r: [44, -150] }, expr: 'neutral' });
  return Object.assign(base, { phone: true });
}
function vignette(g, i, t, post, dx) {
  g.save(); g.translate(dx, 0);
  const bg = ['#2A1F1E', '#18203C', '#2A2131', '#1D2334', '#1E2236'][i];
  g.fillStyle = bg; g.fillRect(0, 0, W, H);
  let gr;
  if (i === 0) {
    gr = g.createRadialGradient(330, 1180, 20, 330, 1180, 760); gr.addColorStop(0, 'rgba(255,150,70,.5)'); gr.addColorStop(1, 'rgba(255,150,70,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = '#140F10'; g.beginPath(); g.moveTo(0, 0); g.lineTo(W, 0); g.lineTo(W, 520); g.quadraticCurveTo(1000, 330, 880, 380); g.quadraticCurveTo(620, 260, 360, 380); g.quadraticCurveTo(160, 320, 0, 560); g.closePath(); g.fill();
    g.fillStyle = 'rgba(170,80,40,.55)';
    for (const [hx, hy, r] of [[760, 640, .9], [850, 720, .75], [180, 690, .8]]) { g.save(); g.translate(hx, hy); g.rotate(r - .8); ell(g, 0, 0, 26, 32); g.fill(); for (let k = 0; k < 5; k++) { g.save(); g.rotate(-.9 + k * .45); ell(g, 0, -42, 7, 18); g.fill(); g.restore(); } g.restore(); }
    g.strokeStyle = 'rgba(170,80,40,.55)'; g.lineWidth = 6; g.beginPath(); g.moveTo(420, 640); g.lineTo(520, 640); g.moveTo(440, 640); g.lineTo(430, 690); g.moveTo(500, 640); g.lineTo(510, 690); g.moveTo(520, 640); g.lineTo(545, 600); g.moveTo(545, 600); g.lineTo(535, 570); g.moveTo(545, 600); g.lineTo(565, 575); g.stroke();
    g.fillStyle = '#2E2321'; g.fillRect(0, 1290, W, H);
    g.fillStyle = '#4A3A33'; g.strokeStyle = INK; g.lineWidth = 5; ell(g, 650, 1290, 120, 46); g.fill(); g.stroke();
    g.fillStyle = '#5A3A26'; g.save(); g.translate(330, 1300); g.rotate(.25); rr(g, -80, -12, 160, 24, 10); g.fill(); g.stroke(); g.rotate(-.5); rr(g, -80, -12, 160, 24, 10); g.fill(); g.stroke(); g.restore();
    for (const [c, sc] of [['#E8682F', 1], ['#F4A63A', .7], ['#FFE08A', .4]]) {
      const f = Math.sin(t * 13) * .08 + Math.sin(t * 7.3) * .06;
      g.fillStyle = c; g.beginPath(); g.moveTo(330 - 70 * sc, 1290); g.quadraticCurveTo(330 - 80 * sc, 1170, 330 + f * 200 * sc, 1290 - 230 * sc * (1 + f)); g.quadraticCurveTo(330 + 80 * sc, 1170, 330 + 70 * sc, 1290); g.fill();
    }
    drawChar(g, eraChar(0, t, 650, 1250, 1));
  } else if (i === 1) {
    gr = g.createRadialGradient(770, 560, 100, 770, 560, 520); gr.addColorStop(0, 'rgba(255,236,190,.35)'); gr.addColorStop(1, 'rgba(255,236,190,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = '#F2E2B4'; circ(g, 770, 560, 160); g.fill();
    g.strokeStyle = '#2B2224'; g.lineWidth = 12; g.beginPath(); g.moveTo(-20, 300); g.quadraticCurveTo(200, 360, 360, 330); g.moveTo(180, 345); g.quadraticCurveTo(240, 430, 300, 470); g.stroke();
    g.fillStyle = '#E7A2B0'; const r = R(5); for (let k = 0; k < 22; k++) { const u = r(); const bx = lerp(0, 360, u) + (r() - .5) * 60, by = lerp(320, 340, u) + (r() - .5) * 80 + (u > .5 ? 40 * r() : 0); circ(g, bx, by, 9 + r() * 7); g.fill(); }
    g.fillStyle = '#212A47'; g.fillRect(0, 1290, W, H);
    g.fillStyle = 'rgba(0,0,0,.35)'; g.beginPath(); g.ellipse(330, 1300, 230, 26, 0, 0, TAU); g.fill();
    g.fillStyle = '#C9B48A'; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(300, 1290); g.quadraticCurveTo(270, 1200, 300, 1190); g.lineTo(306, 1170); g.lineTo(334, 1170); g.lineTo(340, 1190); g.quadraticCurveTo(370, 1200, 340, 1290); g.closePath(); g.fill(); g.stroke();
    g.fillStyle = '#4C4636'; g.strokeStyle = INK; ell(g, 520, 1290, 110, 40); g.fill(); g.stroke();
    drawChar(g, eraChar(1, t, 520, 1250, 1));
  } else if (i === 2) {
    gr = g.createRadialGradient(830, 1020, 10, 830, 1020, 600); gr.addColorStop(0, 'rgba(255,200,120,.45)'); gr.addColorStop(1, 'rgba(255,200,120,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = '#141A30'; rr(g, 120, 420, 300, 420, 6); g.fill(); g.strokeStyle = '#6A5446'; g.lineWidth = 16; g.stroke(); g.lineWidth = 8; g.beginPath(); g.moveTo(270, 420); g.lineTo(270, 840); g.moveTo(120, 630); g.lineTo(420, 630); g.stroke();
    g.fillStyle = '#F1E4C2'; circ(g, 350, 500, 26); g.fill();
    g.fillStyle = '#2B2026'; g.fillRect(0, 1290, W, H);
    g.fillStyle = '#7A5238'; g.strokeStyle = INK; g.lineWidth = 5; rr(g, 560, 1130, 440, 26, 4); g.fill(); g.stroke(); rr(g, 600, 1156, 20, 170, 4); g.fill(); g.stroke(); rr(g, 940, 1156, 20, 170, 4); g.fill(); g.stroke();
    g.fillStyle = '#F4EEDC'; g.save(); g.translate(720, 1118); g.rotate(-.06); rr(g, -60, -10, 120, 16, 2); g.fill(); g.stroke(); g.restore();
    g.fillStyle = '#EDE6D6'; rr(g, 836, 1040, 22, 90, 3); g.fill(); g.stroke();
    const f = Math.sin(t * 11) * 3; g.fillStyle = '#FFD27A'; g.beginPath(); g.moveTo(838, 1036); g.quadraticCurveTo(847 + f, 990, 856, 1036); g.fill();
    g.fillStyle = '#6B4A38'; rr(g, 470, 1180, 140, 18, 4); g.fill(); g.stroke(); rr(g, 480, 1196, 14, 130, 3); g.fill(); g.stroke(); rr(g, 590, 1196, 14, 130, 3); g.fill(); g.stroke();
    drawChar(g, eraChar(2, t, 540, 1175, 1));
  } else if (i === 3) {
    g.fillStyle = '#262C40'; g.fillRect(0, 1290, W, H);
    gr = g.createRadialGradient(830, 1000, 10, 830, 1000, 500); gr.addColorStop(0, 'rgba(140,190,255,.4)'); gr.addColorStop(1, 'rgba(140,190,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
    g.fillStyle = '#C9C2B2'; g.strokeStyle = INK; g.lineWidth = 5; rr(g, 700, 900, 260, 220, 14); g.fill(); g.stroke(); rr(g, 760, 1120, 140, 30, 6); g.fill(); g.stroke();
    g.fillStyle = '#8FC0F2'; rr(g, 724, 922, 212, 160, 10); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.75)'; g.font = F(26); g.textAlign = 'center'; g.fillText('心情：忧伤', 830, 1000);
    g.fillStyle = '#5C4A3A'; rr(g, 660, 1150, 340, 22, 4); g.fill(); g.stroke();
    g.save(); g.translate(240, 520); g.rotate(-.05); g.fillStyle = '#3A3550'; rr(g, -110, -150, 220, 300, 4); g.fill(); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.7)'; g.font = F(34); g.textAlign = 'center'; g.fillText('寂寞', 0, -40); g.fillText('是一种', 0, 10); g.fillText('态度', 0, 60); g.restore();
    g.fillStyle = '#4C4636'; g.strokeStyle = INK; rr(g, 380, 1240, 280, 50, 10); g.fill(); g.stroke();
    drawChar(g, eraChar(3, t, 520, 1250, 1));
  } else {
    drawRoom(roomG, { t, char: { glasses: true, expr: 'sad' } });
    g.save(); g.translate(97, 430); g.scale(.82, .82); g.drawImage(roomCv, 0, 0); g.restore();
    g.strokeStyle = 'rgba(255,240,215,.25)'; g.lineWidth = 3; g.strokeRect(97, 430, 886, 1574);
  }
  g.restore();
  post.push(() => {
    g.save(); g.translate(dx, 0);
    const e = ERAS[i];
    g.fillStyle = '#FFE3AA'; g.font = F(76, 1); g.textAlign = 'center'; g.textBaseline = 'middle';
    g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 16; g.fillText(e.label, 540, 300);
    g.font = F(40); g.fillStyle = 'rgba(255,240,215,.8)'; g.fillText(e.sub, 540, 380); g.shadowColor = 'transparent';
    if (i === 4) thought(g, 590, 990, e.text, 46, 622, 1110, 1, 1, { dot: 10 });
    else thought(g, i === 1 ? 470 : 600, 800, e.text, 46, i === 1 ? 520 : 640, 920, 1, 1, { dot: 10 });
    g.restore();
  });
}
function drawSprockets(g, off) {
  g.fillStyle = '#08080B'; g.fillRect(0, 0, W, 130); g.fillRect(0, H - 130, W, 130);
  g.fillStyle = '#2B2B33';
  for (let x = -((off % 110) + 110) % 110; x < W + 110; x += 110) { rr(g, x + 30, 38, 50, 54, 8); g.fill(); rr(g, x + 30, H - 92, 50, 54, 8); g.fill(); }
}

/* ---------------- 纸面场景 ---------------- */
function sageTitle(g, name, sub, a) {
  g.save(); g.globalAlpha *= a; g.fillStyle = INK; g.font = F(88, 1); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(name, 540, 230);
  g.font = F(38); g.fillStyle = 'rgba(42,40,51,.62)'; g.fillText(sub, 540, 315);
  g.strokeStyle = 'rgba(42,40,51,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(420, 360); g.lineTo(660, 360); g.stroke(); g.restore();
}
function scBooks(g, t, post) {
  g.drawImage(paperCv, 0, 0);
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(140, 1262); g.lineTo(940, 1262); g.stroke();
  const books = [['沉思录', '#7A2E2A', 690], ['庄子', '#2F5D50', 620], ['法句经', '#B5833F', 660], ['西西弗斯神话', '#2E4A6B', 720]];
  books.forEach(([title, col, hgt], k) => {
    const p = E.back(seg(t, 79.4 + k * .35, 79.9 + k * .35)); if (p <= 0) return;
    const x = 255 + k * 160, bw = 132, y = 1262 - hgt * p;
    g.save(); g.beginPath(); g.rect(0, 0, W, 1262); g.clip();
    g.fillStyle = col; g.strokeStyle = INK; g.lineWidth = 5; rr(g, x, y, bw, hgt, 8); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(241,231,211,.6)'; g.lineWidth = 4; for (const yy of [y + 40, y + 52, y + hgt - 52, y + hgt - 40]) { g.beginPath(); g.moveTo(x + 10, yy); g.lineTo(x + bw - 10, yy); g.stroke(); }
    g.fillStyle = '#F1E7D3'; g.font = F(title.length > 4 ? 48 : 56, 1); g.textAlign = 'center'; g.textBaseline = 'middle';
    const n = title.length, step = title.length > 4 ? 64 : 76, y0 = y + hgt / 2 - (n - 1) * step / 2;
    for (let c = 0; c < n; c++) g.fillText(title[c], x + bw / 2, y0 + c * step);
    g.restore();
  });
  g.fillStyle = 'rgba(42,40,51,.5)'; g.font = F(34); g.textAlign = 'center'; g.fillText('（都是很老的书）', 540, 1340);
}
/* 马可·奥勒留 */
const MAP = (() => {
  const r = R(31), people = [];
  for (let i = 0; i < 70; i++) people.push({ x: 120 + r() * 840, y: 470 + r() * 900, vx: (r() - .5) * 14, vy: (r() - .5) * 10, sym: r() < .3 ? ['heart', 'sick', 'angry', 'dots'][(r() * 4) | 0] : null, ph: r() * 10 });
  const houses = []; for (const [vx, vy, n] of [[250, 600, 9], [820, 690, 8], [300, 1260, 10], [760, 1240, 6]]) for (let k = 0; k < n; k++) houses.push([vx + (r() - .5) * 170, vy + (r() - .5) * 110, .8 + r() * .5]);
  const hills = Array.from({ length: 26 }, () => [100 + r() * 880, 450 + r() * 950, 26 + r() * 30]);
  return { people, houses, hills };
})();
function heart(g, x, y, s) { g.beginPath(); g.moveTo(x, y + s * .9); g.bezierCurveTo(x - s * 1.6, y - s * .2, x - s * .6, y - s * 1.3, x, y - s * .4); g.bezierCurveTo(x + s * .6, y - s * 1.3, x + s * 1.6, y - s * .2, x, y + s * .9); g.fill(); }
function drawMap(g, lt, z) {
  g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960);
  g.fillStyle = 'rgba(120,160,175,.35)'; g.beginPath(); g.moveTo(1080, 1050); g.quadraticCurveTo(880, 1100, 840, 1420); g.lineTo(1080, 1420); g.fill();
  g.strokeStyle = 'rgba(110,150,170,.55)'; g.lineWidth = 34; g.lineCap = 'round'; g.beginPath(); g.moveTo(60, 420); g.bezierCurveTo(400, 600, 300, 900, 620, 1000); g.quadraticCurveTo(820, 1060, 980, 1180); g.stroke();
  g.strokeStyle = 'rgba(42,40,51,.5)'; g.lineWidth = 4;
  for (const [x, y, s] of MAP.hills) { g.beginPath(); g.moveTo(x - s, y); g.quadraticCurveTo(x, y - s * 1.3, x + s, y); g.stroke(); }
  g.setLineDash([6, 10]); g.strokeStyle = 'rgba(42,40,51,.4)'; g.lineWidth = 3;
  g.beginPath(); g.moveTo(250, 600); g.quadraticCurveTo(420, 820, 540, 960); g.quadraticCurveTo(700, 820, 820, 690); g.moveTo(540, 960); g.quadraticCurveTo(400, 1100, 300, 1260); g.moveTo(540, 960); g.quadraticCurveTo(640, 1120, 760, 1240); g.stroke(); g.setLineDash([]);
  for (const [x, y, s] of MAP.houses) { g.fillStyle = '#E9DDC4'; g.strokeStyle = INK; g.lineWidth = 2.5; g.fillRect(x - 9 * s, y - 6 * s, 18 * s, 14 * s); g.strokeRect(x - 9 * s, y - 6 * s, 18 * s, 14 * s); g.fillStyle = '#B5654A'; g.beginPath(); g.moveTo(x - 12 * s, y - 6 * s); g.lineTo(x, y - 16 * s); g.lineTo(x + 12 * s, y - 6 * s); g.closePath(); g.fill(); g.stroke(); }
  for (const [x, y] of [[505, 945], [575, 940], [520, 990], [565, 995], [470, 985], [610, 980]]) { g.fillStyle = '#E7D6B5'; g.strokeStyle = INK; g.lineWidth = 2.5; g.beginPath(); g.moveTo(x - 14, y + 8); g.lineTo(x, y - 14); g.lineTo(x + 14, y + 8); g.closePath(); g.fill(); g.stroke(); }
  for (let k = 0; k < 3; k++) { const bx = 900 + k * 60 + Math.sin(lt * .6 + k) * 20, by = 1250 + k * 50; g.fillStyle = '#6B4A38'; g.beginPath(); g.moveTo(bx - 16, by); g.lineTo(bx + 16, by); g.lineTo(bx + 10, by + 8); g.lineTo(bx - 10, by + 8); g.fill(); g.fillStyle = '#F4EEDC'; g.strokeStyle = INK; g.lineWidth = 2; g.beginPath(); g.moveTo(bx, by - 2); g.lineTo(bx, by - 26); g.lineTo(bx + 14, by - 4); g.closePath(); g.fill(); g.stroke(); }
  for (const p of MAP.people) {
    const x = p.x + Math.sin(lt * .5 + p.ph) * p.vx * 3, y = p.y + Math.cos(lt * .4 + p.ph) * p.vy * 3;
    g.fillStyle = INK; circ(g, x, y - 12, 6); g.fill(); rr(g, x - 4, y - 6, 8, 15, 3); g.fill();
    if (p.sym && Math.sin(lt * 1.3 + p.ph) > -.2) {
      g.fillStyle = 'rgba(255,253,248,.95)'; g.strokeStyle = INK; g.lineWidth = 2.5; circ(g, x + 14, y - 34, 17); g.fill(); g.stroke();
      if (p.sym === 'heart') { g.fillStyle = '#C8483A'; heart(g, x + 14, y - 34, 7.5); }
      else { g.fillStyle = INK; g.font = F(21, 1); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(p.sym === 'sick' ? 'zZ' : p.sym === 'angry' ? '#!' : '…', x + 14, y - 33); }
    }
  }
  g.restore();
}
function drawTent(g, lt) {
  g.fillStyle = 'rgba(42,40,51,.08)'; ell(g, 540, 1340, 470, 30); g.fill();
  g.strokeStyle = INK; g.lineWidth = 7; g.beginPath(); g.moveTo(540, 470); g.lineTo(540, 400); g.stroke();
  g.fillStyle = '#B5392E'; g.beginPath(); g.moveTo(540, 400); g.quadraticCurveTo(580, 410 + Math.sin(lt * 4) * 8, 610, 400); g.lineTo(540, 440); g.closePath(); g.fill(); g.lineWidth = 3; g.stroke();
  g.fillStyle = '#E7D6B5'; g.lineWidth = 6; g.beginPath(); g.moveTo(540, 460); g.lineTo(980, 1330); g.lineTo(100, 1330); g.closePath(); g.fill(); g.stroke();
  g.fillStyle = '#4F3C30'; g.beginPath(); g.moveTo(540, 600); g.lineTo(820, 1330); g.lineTo(260, 1330); g.closePath(); g.fill();
  const gr = g.createRadialGradient(660, 1130, 10, 660, 1130, 330); gr.addColorStop(0, 'rgba(255,200,110,.8)'); gr.addColorStop(1, 'rgba(255,200,110,0)');
  g.save(); g.beginPath(); g.moveTo(540, 600); g.lineTo(820, 1330); g.lineTo(260, 1330); g.closePath(); g.clip(); g.fillStyle = gr; g.fillRect(200, 600, 700, 800);
  g.fillStyle = '#7A5238'; g.strokeStyle = INK; g.lineWidth = 5; rr(g, 560, 1150, 210, 22, 4); g.fill(); g.stroke(); rr(g, 600, 1172, 16, 160, 3); g.fill(); g.stroke(); rr(g, 720, 1172, 16, 160, 3); g.fill(); g.stroke();
  g.fillStyle = '#F2EAD6'; rr(g, 590, 1134, 90, 16, 2); g.fill(); g.stroke();
  g.fillStyle = '#B07A4E'; g.beginPath(); g.ellipse(720, 1140, 26, 10, 0, 0, TAU); g.fill(); g.stroke();
  const f = Math.sin(lt * 10) * 3; g.fillStyle = '#FFCF6E'; g.beginPath(); g.moveTo(732, 1134); g.quadraticCurveTo(742 + f, 1094, 746, 1134); g.fill();
  drawChar(g, { x: 470, y: 1240, s: .78, t: lt, costume: 'marcus', expr: 'neutral', lookX: 4, lookY: 3, legs: 'dangle', arms: { l: [-20, -70], r: [150, -110] }, quill: true });
  g.restore();
  g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(540, 600); g.lineTo(820, 1330); g.moveTo(540, 600); g.lineTo(260, 1330); g.stroke();
  g.fillStyle = '#D8C49C'; g.beginPath(); g.moveTo(540, 600); g.lineTo(260, 1330); g.lineTo(200, 1330); g.quadraticCurveTo(330, 1000, 540, 600); g.fill(); g.stroke();
  g.beginPath(); g.moveTo(540, 600); g.lineTo(820, 1330); g.lineTo(880, 1330); g.quadraticCurveTo(750, 1000, 540, 600); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(42,40,51,.5)'; g.lineWidth = 3; for (let x = 120; x < 980; x += 38) { g.beginPath(); g.moveTo(x, 1338); g.lineTo(x + 6, 1324); g.stroke(); }
}
function sMarcus(g, t, post) {
  const lt = t - 85.6;
  g.drawImage(paperCv, 0, 0);
  const zu = E.io(seg(lt, 2.9, 6.0));
  withLayer(g, seg(zu, .3, .7), gg => {
    drawMap(gg, lt, lerp(2.4, 1, zu));
    gg.save(); gg.globalCompositeOperation = 'destination-out';
    let gr = gg.createLinearGradient(0, 330, 0, 470); gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(1, 'rgba(0,0,0,0)'); gg.fillStyle = gr; gg.fillRect(0, 0, W, 470);
    gr = gg.createLinearGradient(0, 1380, 0, 1480); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,1)'); gg.fillStyle = gr; gg.fillRect(0, 1380, W, H - 1380);
    gg.restore();
  }, true);
  withLayer(g, 1 - seg(zu, .35, .75), gg => { gg.save(); gg.translate(540, 960); gg.scale(lerp(1, .05, zu), lerp(1, .05, zu)); gg.translate(-540, -960); drawTent(gg, lt); gg.restore(); });
  // 近处的云
  if (lt > 3.8) { const ca = seg(lt, 3.8, 4.8) * .6; g.fillStyle = `rgba(255,252,245,${ca})`; for (const [x0, y0, r] of [[60, 520, 80], [1000, 760, 95], [120, 1330, 90]]) { const x = x0 + (lt - 3) * 22 * (x0 > 500 ? -1 : 1); circ(g, x, y0, r); g.fill(); circ(g, x + r * .8, y0 + 20, r * .7); g.fill(); circ(g, x - r * .8, y0 + 26, r * .6); g.fill(); } }
  sageTitle(g, '马可·奥勒留', '罗马皇帝 · 斯多葛派', seg(lt, .1, .7));
  drawSeal(g, 935, 262, '卸下重量', seg(t, 95.0, 96.2));
}
function sZhuang(g, t, post) {
  const lt = t - 96.8;
  g.drawImage(paperCv, 0, 0);
  for (const [c, pts] of [['rgba(120,135,140,.25)', [[0, 1000], [160, 820], [330, 930], [520, 760], [720, 900], [900, 800], [1080, 920]]], ['rgba(100,115,115,.32)', [[0, 1080], [220, 930], [420, 1040], [640, 950], [860, 1050], [1080, 980]]]]) {
    g.fillStyle = c; g.beginPath(); g.moveTo(0, 1300); for (const [x, y] of pts) g.lineTo(x, y); g.lineTo(1080, 1300); g.fill();
  }
  g.fillStyle = '#DCD0A8'; g.strokeStyle = INK; g.lineWidth = 5; g.beginPath(); g.moveTo(0, 1250); g.quadraticCurveTo(540, 1190, 1080, 1240); g.lineTo(1080, 1440); g.lineTo(0, 1440); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(70,90,50,.6)'; g.lineWidth = 3; const r = R(8); for (let k = 0; k < 60; k++) { const x = r() * 1080, y = 1250 + r() * 170; g.beginPath(); g.moveTo(x, y); g.lineTo(x - 4, y - 14); g.moveTo(x, y); g.lineTo(x + 5, y - 12); g.stroke(); }
  g.strokeStyle = INK; g.fillStyle = '#6B5340'; g.lineWidth = 6;
  g.beginPath(); g.moveTo(170, 1236); g.bezierCurveTo(230, 1100, 140, 960, 230, 820); g.bezierCurveTo(260, 760, 300, 740, 320, 700); g.lineTo(360, 712); g.bezierCurveTo(330, 790, 300, 860, 320, 960); g.bezierCurveTo(330, 1080, 290, 1160, 330, 1236); g.closePath(); g.fill(); g.stroke();
  g.lineWidth = 9; g.beginPath(); g.moveTo(250, 800); g.quadraticCurveTo(160, 740, 90, 700); g.moveTo(320, 760); g.quadraticCurveTo(420, 700, 560, 690); g.stroke();
  const sw = Math.sin(lt * .8) * 6;
  for (const [x, y, rx, ry, c] of [[140, 620, 150, 110, 'rgba(85,105,75,.88)'], [320, 560, 200, 130, 'rgba(95,118,82,.9)'], [520, 620, 170, 110, 'rgba(85,105,75,.85)'], [250, 700, 160, 90, 'rgba(110,130,92,.85)'], [430, 700, 150, 80, 'rgba(100,122,86,.85)'], [640, 680, 110, 70, 'rgba(110,130,92,.8)']]) { g.fillStyle = c; ell(g, x + sw, y, rx, ry); g.fill(); }
  g.fillStyle = '#D9B66A'; g.strokeStyle = INK; g.lineWidth = 4; ell(g, 880, 1238, 62, 16); g.fill(); g.stroke(); ell(g, 880, 1226, 30, 16); g.fill(); g.stroke();
  const popped = lt > 3.8, content = seg(lt, 5.0, 6.0);
  drawChar(g, { x: 660, y: 1162, s: .8, rot: -Math.PI / 2, t: lt, costume: 'zhuang', expr: popped ? (content > .5 ? 'calm' : 'neutral') : 'neutral', legs: 'stand', arms: { l: [-40, -300], r: [40, -300] }, lookY: -6 });
  const bp = seg(lt, .5, 1.1), shrink = seg(lt, 3.5, 3.9);
  if (!popped && bp > 0) {
    const wob = 1 + Math.sin(lt * 6) * .03 + seg(lt, 1, 3.4) * .18;
    thought(g, 610, 900, '看看我！\n我很特别！', 50, 480, 1095, 1, E.back(bp) * wob * (1 - shrink), { dot: 12 });
  }
  if (popped) {
    const u = seg(lt, 3.8, 11), x = lerp(610, 1060, E.in(u)) + Math.sin(lt * 2.2) * 50, y = lerp(900, 380, u) + Math.sin(lt * 3.1) * 40;
    const sc = lerp(.4, 1.2, E.out(seg(lt, 3.8, 4.6))), fl = Math.abs(Math.sin(lt * 9));
    g.save(); g.translate(x, y); g.rotate(.3 + Math.sin(lt * 2) * .2); g.scale(sc, sc);
    g.fillStyle = '#E3A13A'; g.strokeStyle = INK; g.lineWidth = 3;
    for (const sd of [-1, 1]) { g.save(); g.scale(sd * (.25 + .75 * fl), 1); ell(g, 22, -12, 26, 20, -.4); g.fill(); g.stroke(); ell(g, 18, 16, 16, 13, .4); g.fill(); g.stroke(); g.restore(); }
    g.fillStyle = INK; ell(g, 0, 0, 4, 20); g.fill();
    g.beginPath(); g.moveTo(-2, -18); g.quadraticCurveTo(-8, -32, -14, -34); g.moveTo(2, -18); g.quadraticCurveTo(8, -32, 14, -34); g.stroke();
    g.restore();
    if (lt < 4.6) { const pa = 1 - seg(lt, 3.8, 4.6); g.strokeStyle = `rgba(42,40,51,${pa})`; g.lineWidth = 4; for (let k = 0; k < 8; k++) { const a = k / 8 * TAU, r0 = 40 + seg(lt, 3.8, 4.6) * 60; g.beginPath(); g.moveTo(610 + Math.cos(a) * r0, 900 + Math.sin(a) * r0); g.lineTo(610 + Math.cos(a) * (r0 + 22), 900 + Math.sin(a) * (r0 + 22)); g.stroke(); } }
  }
  sageTitle(g, '庄子', '战国 · 道家', seg(lt, .1, .7));
  drawSeal(g, 935, 262, '放下自我', seg(t, 106.0, 107.2));
}
const BPEOPLE = [[150, 760], [140, 1000], [190, 1240], [930, 760], [940, 1000], [890, 1240], [330, 1380], [540, 1410], [750, 1380], [290, 560], [790, 560]];
function sBuddha(g, t, post) {
  const lt = t - 107.6;
  g.drawImage(paperCv, 0, 0);
  g.strokeStyle = INK; g.fillStyle = '#7A5A42'; g.lineWidth = 6; g.beginPath(); g.moveTo(500, 1100); g.quadraticCurveTo(520, 900, 470, 760); g.lineTo(610, 760); g.quadraticCurveTo(560, 900, 580, 1100); g.closePath(); g.fill(); g.stroke();
  const r = R(4);
  for (let k = 0; k < 120; k++) {
    const a = r() * TAU, d = Math.sqrt(r()); const x = 540 + Math.cos(a) * 430 * d, y = 650 + Math.sin(a) * 210 * d;
    const s = 22 + r() * 14, rot = r() * TAU + Math.sin(lt * .7 + k) * .08;
    g.save(); g.translate(x, y); g.rotate(rot); g.fillStyle = ['rgba(98,128,84,.9)', 'rgba(120,150,96,.9)', 'rgba(84,110,74,.9)'][k % 3];
    g.beginPath(); g.moveTo(0, s); g.bezierCurveTo(-s * 1.1, s * .1, -s * .7, -s * .9, 0, -s * .5); g.bezierCurveTo(s * .7, -s * .9, s * 1.1, s * .1, 0, s); g.fill(); g.restore();
  }
  const conn = seg(lt, 5.4, 8.2), warm = seg(lt, 8.0, 10.0);
  const pa = seg(lt, 2.6, 3.6);
  if (conn > 0) {
    g.save(); g.strokeStyle = `rgba(214,150,40,${.75})`; g.lineWidth = 3.5; g.shadowColor = 'rgba(255,190,80,.8)'; g.shadowBlur = 10 + warm * 14;
    BPEOPLE.forEach(([x, y], k) => {
      const u = clamp(conn * 1.6 - k * .05); if (u <= 0) return;
      const sx = 540, sy = 1060, cx = (sx + x) / 2, cy = Math.min(sy, y) - 120;
      g.beginPath(); for (let i = 0; i <= 24 * u; i++) { const v = i / 24; const px = (1 - v) * (1 - v) * sx + 2 * (1 - v) * v * cx + v * v * x, py = (1 - v) * (1 - v) * sy + 2 * (1 - v) * v * cy + v * v * (y - 40); i ? g.lineTo(px, py) : g.moveTo(px, py); } g.stroke();
      const [nx, ny] = BPEOPLE[(k + 1) % BPEOPLE.length];
      if (u > .9 && k < BPEOPLE.length - 1) { g.globalAlpha = (u - .9) * 10 * .6; g.beginPath(); g.moveTo(x, y - 40); g.quadraticCurveTo((x + nx) / 2, (y + ny) / 2 - 60, nx, ny - 40); g.stroke(); g.globalAlpha = 1; }
    });
    g.restore();
  }
  BPEOPLE.forEach(([x, y], k) => {
    const a = clamp(pa * 1.5 - k * .04); if (a <= 0) return;
    g.save(); g.globalAlpha = a;
    if (warm > 0) { const gr = g.createRadialGradient(x, y - 40, 0, x, y - 40, 80); gr.addColorStop(0, `rgba(255,200,90,${.5 * warm})`); gr.addColorStop(1, 'rgba(255,200,90,0)'); g.fillStyle = gr; g.fillRect(x - 80, y - 120, 160, 160); }
    drawChar(g, { x, y, s: .26, t: lt + k, ph: k, lw: 8, expr: warm > .5 ? 'smile' : 'sad', legs: 'stand', costume: FIG_STYLES[k % FIG_STYLES.length] });
    const ca = 1 - warm; if (ca > 0) { g.fillStyle = `rgba(80,80,90,${.75 * ca})`; for (const [dx, dy, rr2] of [[-12, -112, 14], [6, -118, 17], [22, -110, 12]]) { circ(g, x + dx, y + dy, rr2); g.fill(); } g.strokeStyle = `rgba(80,80,90,${.7 * ca})`; g.lineWidth = 2.5; for (const dx of [-8, 4, 16]) { g.beginPath(); g.moveTo(x + dx, y - 96); g.lineTo(x + dx - 3, y - 84); g.stroke(); } }
    g.restore();
  });
  drawChar(g, { x: 540, y: 1185, s: 1.0, t: lt, costume: 'buddha', expr: 'calm', legs: 'lotus', arms: { l: [-18, -40], r: [18, -40] } });
  sageTitle(g, '佛陀', '古印度 · 佛教', seg(lt, .1, .7));
  drawSeal(g, 935, 262, '连接彼此', seg(t, 117.0, 118.2));
}
function slopeY(x) { return 1460 - 820 * Math.pow(clamp(x / 900, 0, 1), 1.15); }
function sCamus(g, t, post) {
  const lt = t - 118.6;
  g.drawImage(paperCv, 0, 0);
  let gr = g.createLinearGradient(0, 400, 0, 1400); gr.addColorStop(0, 'rgba(240,170,110,0)'); gr.addColorStop(1, 'rgba(240,170,110,.35)'); g.fillStyle = gr; g.fillRect(0, 400, W, 1000);
  g.fillStyle = '#E9925A'; circ(g, 220, 700, 92); g.fill();
  gr = g.createRadialGradient(220, 700, 60, 220, 700, 260); gr.addColorStop(0, 'rgba(240,150,90,.35)'); gr.addColorStop(1, 'rgba(240,150,90,0)'); g.fillStyle = gr; g.fillRect(0, 440, 480, 520);
  g.fillStyle = 'rgba(42,40,51,.08)'; g.beginPath(); g.moveTo(0, 1100); g.quadraticCurveTo(200, 1000, 400, 1080); g.lineTo(400, 1460); g.lineTo(0, 1460); g.fill();
  g.fillStyle = '#D8BE90'; g.strokeStyle = INK; g.lineWidth = 6; g.beginPath(); g.moveTo(-10, 1462);
  for (let x = 0; x <= 900; x += 20) g.lineTo(x, slopeY(x)); g.quadraticCurveTo(980, 600, 1090, 700); g.lineTo(1090, 1480); g.lineTo(-10, 1480); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = 'rgba(42,40,51,.35)'; g.lineWidth = 3; for (let x = 60; x < 860; x += 70) { const y = slopeY(x) + 30; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 20, y - 6); g.stroke(); }
  const BR = 104;
  const norm = x => { const d = (slopeY(x + 1) - slopeY(x - 1)) / 2, l = Math.hypot(1, d); return [d / l, -1 / l]; };
  let bx, roll = 0, pose = 'push';
  if (lt < 3.6) { const u = E.sine(seg(lt, 0, 3.6)); bx = lerp(430, 720, u) + Math.sin(lt * 9) * 3; roll = bx / BR; }
  else if (lt < 4.0) { bx = 720 + Math.sin(lt * 40) * 4; roll = 720 / BR; pose = 'strain'; }
  else { const u = seg(lt, 4.0, 5.6); bx = lerp(720, -300, E.in(u)); roll = 720 / BR - (720 - bx) / BR * 1.3; pose = lt < 6.2 ? 'shock' : lt < 7.0 ? 'shrug' : lt < 9.0 ? 'walk' : 'look'; }
  const pushX = x => { const [nx, ny] = norm(x); return x + nx * BR - BR - 104; };
  let sx = pose === 'push' || pose === 'strain' ? pushX(bx) : 560;
  if (pose === 'walk') sx = lerp(560, 330, seg(lt, 7.0, 9.0));
  if (pose === 'look') sx = 330;
  if (bx > -260) {
    const [nx, ny] = norm(bx), by = slopeY(bx);
    g.save(); g.translate(bx + nx * BR, by + ny * BR); g.rotate(roll);
    g.fillStyle = '#9C9384'; g.strokeStyle = INK; g.lineWidth = 6; circ(g, 0, 0, BR); g.fill(); g.stroke();
    g.strokeStyle = 'rgba(42,40,51,.35)'; g.lineWidth = 4; g.beginPath(); g.arc(-30, 40, 30, .3, 1.8); g.stroke(); g.beginPath(); g.arc(40, -40, 22, 2, 3.5); g.stroke();
    g.fillStyle = INK; g.font = F(56, 1); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('周一', 0, 4);
    g.restore();
  }
  const sy = slopeY(sx);
  const lean = pose === 'push' || pose === 'strain' ? .5 : 0;
  const ex = pose === 'shock' ? 'o' : pose === 'look' ? 'smile' : pose === 'shrug' ? 'wry' : 'neutral';
  let arms = { l: [110, -150], r: [130, -110] };
  if (pose === 'shock') arms = { l: [-90, -250], r: [90, -250] };
  if (pose === 'shrug') arms = { l: [-120, -130], r: [120, -130] };
  if (pose === 'walk' || pose === 'look') arms = { l: [-30, -60], r: [30, -60] };
  drawChar(g, { x: sx, y: sy - 96 * .8, s: .8, rot: lean, t: lt, costume: 'sisyphus', expr: ex, legs: pose === 'walk' ? 'walk' : 'stand', walkPh: lt * 9, arms, headDX: pose === 'look' ? -10 : 0, lookX: pose === 'look' ? -6 : 0, headRot: pose === 'look' ? -.12 : 0, blush: pose === 'look' ? seg(lt, 9.4, 10.4) : 0 });
  if (pose === 'look' && lt > 9.4) {
    for (let k = 0; k < 4; k++) { const u = ((lt - 9.4) * .45 + k * .25) % 1; const x = sx + 30 + u * 120 + Math.sin(u * 9 + k) * 18, y = sy - 330 - u * 260; g.fillStyle = `rgba(42,40,51,${Math.sin(u * Math.PI)})`; g.font = F(48 + k * 4, 1); g.textAlign = 'center'; g.fillText(k % 2 ? '♫' : '♪', x, y); }
  }
  sageTitle(g, '加缪', '二十世纪 · 《西西弗斯神话》', seg(lt, .1, .7));
  drawSeal(g, 935, 262, '回到眼前', seg(t, 128.8, 130.0));
}

/* ---------------- 各段房间状态 ---------------- */
function roomState(t) {
  const st = { t, char: {}, leaf: 0, nGlasses: true, nWave: 0 };
  const c = st.char;
  if (t < 53.8) {
    // A 段
    c.expr = t < 6.6 ? 'neutral' : 'sad';
    if (t < 1.8) { c.glasses = false; c.blink = (t % 3.1) < .12; }
    else if (t < 2.6) { const u = E.bounce(seg(t, 1.8, 2.6)); c.glassesAt = { x: 0, y: lerp(-1450, -251, u), r: lerp(.4, 0, u) }; }
    else c.glasses = true;
    if (t > 17.6 && t < 20.7) { const u = E.back(seg(t, 17.6, 18.1)); c.arms = { l: [-26, -64], r: [lerp(26, 52, u), lerp(-64, -296, u)] }; c.headRot = -.12 * u; c.headDY = -6 * u; c.phone = true; }
  } else if (t < 73.2) { c.glasses = true; c.expr = 'smug'; c.headRot = -.07; c.headDY = -4; c.glint = t > 59.4 && t < 60.3 ? Math.sin(seg(t, 59.4, 60.3) * Math.PI) : 0; }
  else if (t < 132.2) { c.glasses = true; c.expr = 'sad'; c.slump = E.out(seg(t, 73.3, 74.3)); }
  else {
    // F 段：摘眼镜
    c.expr = 'neutral';
    const hand0 = [26, -64];
    if (t < 134.4) c.glasses = true;
    else if (t < 134.9) { const u = E.io(seg(t, 134.4, 134.9)); c.glasses = true; c.arms = { l: [-26, -64], r: [lerp(26, 52, u), lerp(-64, -250, u)] }; }
    else if (t < 135.7) { const u = E.io(seg(t, 134.9, 135.7)); const gx = lerp(0, 150, u), gy = lerp(-251, -14, u) - Math.sin(u * Math.PI) * 60; c.glassesAt = { x: gx, y: gy, r: lerp(0, .15, u) }; c.arms = { l: [-26, -64], r: [gx + 46, gy + 4] }; }
    else { const u = E.io(seg(t, 135.7, 136.3)); c.glassesAt = { x: 150, y: -14, r: .15 }; c.arms = { l: [-26, -64], r: [lerp(196, 26, u), lerp(-10, -64, u)] }; c.blink = (t % 2.7) < .12 && t < 141; }
    if (t > 136.4) { c.expr = 'neutral'; c.lookX = -3; }
    if (t > 141.6) c.expr = 'wry';
    if (t > 143.4) { c.expr = 'happy'; c.blush = seg(t, 143.4, 144.2); }
    st.leaf = seg(t, 138.3, 139.3);
    st.nGlasses = t < 143.6;
    st.nWave = t > 143.7 ? E.out(seg(t, 143.7, 144.1)) * (1 - seg(t, 152, 153)) : 0;
    if (t > 144.2) {
      const u = E.back(seg(t, 144.2, 144.7)) * (1 - E.io(seg(t, 150.5, 151.5)));
      c.arms = { l: [lerp(-26, -128 + Math.sin(t * 8) * 22, u), lerp(-64, -330, u)], r: [26, -64] };
      c.headDX = -10 * u; c.lookX = -6;
    }
  }
  return st;
}
const TAGS = [
  { k: 'plant', x: 770, y: 610, tx: 452, ty: 782, a: '它好歹还在光合作用。', b: '它在慢慢长。', bend: -40 },
  { k: 'mug', x: 212, y: 1205, tx: 400, ty: 1076, a: '凉了。像我的人生。', b: '凉了，再倒一杯就是。', bend: 60 },
  { k: 'phone', x: 880, y: 1000, tx: 652, ty: 1072, a: '0 条新消息', b: '0 条新消息\n（这个确实没变）', bend: 30 },
  { k: 'window', x: 330, y: 200, tx: 260, ty: 664, a: '别人一定过得很精彩吧。', b: '对面那扇窗，也还亮着。', bend: -70 },
];
function roomOverlays(g, t, post) {
  // A 段标签
  TAGS.forEach((tg, i) => {
    const t0 = 9.4 + i * 1.2;
    if (t > t0 && t < 16.6) {
      const p = seg(t, t0, t0 + .35), out = 1 - seg(t, 16.1, 16.5);
      post.push(() => drawTag(g, { x: tg.x, y: tg.y, tx: tg.tx, ty: tg.ty, text: tg.a, alpha: p * out, sc: lerp(.6, 1, E.back(p)), rot: (i % 2 ? .03 : -.03), bend: tg.bend, warm: false }));
    }
    // F 段：同一件事，换个读法
    const t1 = 137.6 + i * 1.8;
    if (t > t1 && t < 147.3) {
      const p = seg(t, t1, t1 + .3), out = 1 - seg(t, 146.8, 147.2);
      const fl = seg(t, t1 + .75, t1 + 1.15), flipped = fl > .5;
      const sy = Math.abs(Math.cos(fl * Math.PI));
      post.push(() => drawTag(g, { x: tg.x, y: tg.y, tx: tg.tx, ty: tg.ty, text: flipped ? tg.b : tg.a, alpha: p * out, sc: lerp(.6, 1, E.back(p)), sy, rot: (i % 2 ? -.025 : .025), bend: tg.bend, warm: flipped }));
    }
  });
}
function drawSpot(g, a, t) {
  if (a <= 0) return;
  spotG.setTransform(1, 0, 0, 1, 0, 0); spotG.globalCompositeOperation = 'source-over'; spotG.filter = 'none';
  spotG.clearRect(0, 0, W, H); spotG.fillStyle = `rgba(4,5,10,${.74 * a})`; spotG.fillRect(0, 0, W, H);
  spotG.save(); spotG.globalCompositeOperation = 'destination-out'; spotG.filter = 'blur(26px)'; spotG.fillStyle = 'rgba(0,0,0,.92)';
  spotG.beginPath(); spotG.moveTo(575, -60); spotG.lineTo(705, -60); spotG.lineTo(890, 1290); spotG.lineTo(390, 1290); spotG.closePath(); spotG.fill();
  ell(spotG, 640, 1290, 260, 56); spotG.fill(); spotG.restore();
  g.drawImage(spotCv, 0, 0);
  const gr = g.createLinearGradient(0, 0, 0, 1300); gr.addColorStop(0, `rgba(255,244,214,${.30 * a})`); gr.addColorStop(1, `rgba(255,244,214,${.07 * a})`);
  g.fillStyle = gr; g.beginPath(); g.moveTo(575, -60); g.lineTo(705, -60); g.lineTo(890, 1290); g.lineTo(390, 1290); g.closePath(); g.fill();
  const r = R(17);
  for (let i = 0; i < 12; i++) {
    const x = 640 + (r() - .5) * 420, y = 820 + (r() - .5) * 420, ph = r() * TAU, sz = 10 + r() * 14;
    const tw = Math.max(0, Math.sin(t * 5 + ph)) * a;
    g.save(); g.translate(x, y); g.fillStyle = `rgba(255,240,190,${tw})`; g.beginPath();
    for (let k = 0; k < 8; k++) { const ang = k / 8 * TAU, rad = k % 2 ? sz * .25 : sz; g.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad); } g.fill(); g.restore();
  }
}

/* ---------------- 场景函数 ---------------- */
function scRoom(g, t, post) {
  const st = roomState(t);
  drawRoom(g, st);
  roomOverlays(g, t, post);
  if (t > 59.4 && t < 60.4) {
    const a = Math.sin(seg(t, 59.4, 60.4) * Math.PI);
    post.push(() => { g.save(); g.translate(611, 900); g.rotate(t * 2.5);
      const gr = g.createRadialGradient(0, 0, 0, 0, 0, 60); gr.addColorStop(0, `rgba(255,255,240,${.7 * a})`); gr.addColorStop(1, 'rgba(255,255,240,0)'); g.fillStyle = gr; g.fillRect(-60, -60, 120, 120);
      g.fillStyle = `rgba(255,255,255,${a})`; g.beginPath(); for (let k = 0; k < 8; k++) { const ang = k / 8 * TAU, rad = k % 2 ? 6 : 38 * a; g.lineTo(Math.cos(ang) * rad, Math.sin(ang) * rad); } g.fill(); g.restore(); });
  }
  if (t > 17.5 && t < 21.0) { const a = seg(t, 17.5, 17.8) * (1 - seg(t, 20.6, 20.75)); post.push(() => drawSpot(g, a, t)); }
}
function zoomCam(t) {
  if (t < 24.0) { const u = E.io(seg(t, 21.0, 24.0)); return { x: 540, y: 1000, s: Math.exp(lerp(Math.log(20), Math.log(2.0), u)) }; }
  if (t < 27.0) { const u = seg(t, 24.0, 27.0); return { x: 540, y: 1000, s: lerp(2.0, 1.5, E.sine(u)) }; }
  const u = E.io(seg(t, 27.0, 32.0)), s = Math.exp(lerp(Math.log(1.5), Math.log(.2), u));
  return { x: 540, y: lerp(1000, -100, u), s };
}
const ZBUB = [[1, 2, '没人懂我。', 22.0, -1], [3, 2, '好无聊……', 22.4, 1], [2, 1, '我好惨。', 22.9, 1], [2, 3, '人生好难。', 23.3, -1], [0, 1, '我的难过独一无二。', 24.0, 1], [4, 3, '为什么只有我这样。', 24.5, -1], [1, 4, '唉。', 25.0, 1], [3, 0, '没劲。', 25.4, -1], [0, 3, '谁来懂懂我。', 25.9, 1], [4, 1, '好累。', 26.3, -1]];
function scZoomOut(g, t, post) {
  drawRoom(roomG, roomState(t));
  const cam = zoomCam(t);
  drawCity(g, cam, { t, glasses: true });
  const fade = seg(cam.s, .55, .95);
  post.push(() => { for (const [i, k, txt, t0, sd] of ZBUB) { if (t < t0) continue; const a = seg(t, t0, t0 + .25) * clamp(fade); const sc = E.back(seg(t, t0, t0 + .3)); g.save(); const [sx, sy] = w2s(cam, 360 + i * 90, 700 + k * 150 - 48); thought(g, sx + sd * 40, sy - 60, txt, 34, sx, sy, a, sc, { dot: 7 }); g.restore(); } });
}
function scEarth(g, t, post) {
  const u = E.out(seg(t, 31.2, 35.0));
  drawEarth(g, t, lerp(1500, 400, u));
}
function scStrip(g, t, post) {
  const lt = t - 36.2;
  const i = clamp(Math.floor(lt / 2.2), 0, 4), within = lt - i * 2.2;
  const pan = i < 4 ? E.io(seg(within, 1.6, 2.2)) : 0;
  const camX = (i + pan) * 1080;
  for (let k = 0; k < 5; k++) { const dx = k * 1080 - camX; if (dx > -W && dx < W) vignette(g, k, t, post, dx); }
  post.push(() => drawSprockets(g, camX * .5));
}
function scLineup(g, t, post) {
  g.fillStyle = '#1C2238'; g.fillRect(0, 0, W, H);
  const gr = g.createRadialGradient(540, 980, 50, 540, 980, 700); gr.addColorStop(0, 'rgba(255,220,160,.18)'); gr.addColorStop(1, 'rgba(255,220,160,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = '#8E6241'; g.strokeStyle = INK; g.lineWidth = 5; rr(g, 40, 1150, 1000, 30, 6); g.fill(); g.stroke();
  const xs = [120, 330, 540, 750, 960];
  for (let k = 0; k < 5; k++) {
    const o = eraChar(k, t, xs[k], 1150, .6); o.legs = 'dangle';
    if (k === 1) o.arms = { l: [-26, -64], r: [96, -250] };
    drawChar(g, o);
    const lab = ['三万年前', '唐', '1774', '2008', '现在'][k];
    g.save(); g.translate(xs[k], 1230); g.rotate((k % 2 ? .04 : -.04) + Math.sin(t * 2 + k) * .03);
    g.strokeStyle = '#D9CBB0'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, -50); g.lineTo(0, -22); g.stroke();
    g.fillStyle = '#F5E9D2'; g.strokeStyle = INK; g.lineWidth = 3; rr(g, -70, -22, 140, 50, 8); g.fill(); g.stroke();
    g.fillStyle = INK; g.font = F(28); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(lab, 0, 3); g.restore();
  }
  const sp = seg(t, 49.9, 50.25);
  post.push(() => {
    g.save(); g.globalAlpha = .9 * clamp(sp * 3); g.translate(540, 700); g.rotate(-.1); const sc = lerp(1.8, 1, E.out(sp)); g.scale(sc, sc);
    g.strokeStyle = '#D9493A'; g.lineWidth = 9; rr(g, -230, -78, 460, 156, 14); g.stroke(); g.lineWidth = 3; rr(g, -214, -62, 428, 124, 8); g.stroke();
    g.fillStyle = '#D9493A'; g.font = F(92, 1); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('经典款', 0, 4); g.restore();
  });
}
function metaCam(t) {
  if (t < 63.2) { const u = E.out(seg(t, 62.4, 63.2)); return { x: 540, y: 1000, s: Math.exp(lerp(Math.log(20), Math.log(2.25), u)) }; }
  if (t < 72.6) return { x: 540, y: 1000, s: lerp(2.25, 2.05, seg(t, 63.2, 72.6)) };
  const u = E.in(seg(t, 72.6, 73.2)); return { x: 540, y: 1000, s: Math.exp(lerp(Math.log(2.05), Math.log(20), u)) };
}
const MBUB = [[0, 0], [2, 0], [4, 0], [1, 1], [3, 1], [0, 2], [2, 2], [4, 2], [1, 3], [3, 3], [0, 4], [2, 4], [4, 4]];
const MLIT = new Set(MBUB.map(([i, k]) => i + ',' + k));
function scMeta(g, t, post) {
  drawRoom(roomG, roomState(t));
  const cam = metaCam(t);
  drawCity(g, cam, { t, glasses: true, forceLit: MLIT });
  const fade = 1 - seg(t, 72.4, 72.7);
  post.push(() => {
    MBUB.forEach(([i, k], n) => {
      const t0 = 63.0 + ((n * 7) % 13) * .09; if (t < t0) return;
      const [sx, sy] = w2s(cam, 360 + i * 90, 700 + k * 150 - 48);
      thought(g, sx, sy - 58, '只有我看穿了。', 32, sx, sy, seg(t, t0, t0 + .15) * fade, E.back(seg(t, t0, t0 + .25)), { dot: 6 });
    });
  });
}
function endCam(t) {
  const u = E.io(seg(t, 147.2, 154.6));
  const s = Math.exp(lerp(Math.log(20), Math.log(.46), u)) * lerp(1, .8, E.sine(seg(t, 154.6, 160)));
  const v = E.io(seg(Math.log(s), Math.log(1.6), Math.log(.36)));
  return { x: 540, y: lerp(1000, 300, 1 - (1 - v)), s };
}
function scEnd(g, t, post) {
  drawRoom(roomG, roomState(t));
  const cam = endCam(t);
  drawCity(g, cam, { t, glasses: false, wave: true });
  const dk = seg(t, 149.4, 152.4) * .5;
  g.fillStyle = `rgba(8,10,22,${dk})`; g.fillRect(0, 0, W, H);
  post.push(() => {
    bigText(g, '你不特别。', 430, win(t, 150.4, 158.0, .7, .9), 104);
    bigText(g, '但你的此刻，是真的。', 580, win(t, 152.0, 158.0, .9, .9), 84);
    const ga = win(t, 154.8, 158.8, .8, .7);
    if (ga > 0) { g.save(); g.globalAlpha = ga; g.fillStyle = '#FFE3AA'; g.font = F(52); g.textAlign = 'center'; g.textBaseline = 'middle'; g.shadowColor = 'rgba(0,0,0,.8)'; g.shadowBlur = 16; g.fillText('晚安，普通人。', 540, 1540); g.restore(); }
  });
}
const SCENES = [
  [0, 21.0, scRoom], [21.0, 33.0, scZoomOut], [31.2, 36.6, scEarth], [35.9, 47.5, scStrip], [47.0, 54.0, scLineup],
  [53.8, 62.4, scRoom], [62.4, 73.2, scMeta], [73.2, 79.6, scRoom], [78.6, 86.0, scBooks],
  [85.5, 97.2, sMarcus], [96.7, 108.0, sZhuang], [107.5, 119.0, sBuddha], [118.5, 132.9, sCamus],
  [132.2, 147.2, scRoom], [147.2, 160.1, scEnd],
];
function filt(t) {
  if (t < 2.7) return 0; if (t < 3.9) return E.sine(seg(t, 2.7, 3.9));
  if (t < 31.2) return 1; if (t < 36.6) return lerp(1, .55, seg(t, 31.2, 33)); if (t < 47.5) return .55; if (t < 54) return lerp(.55, 1, seg(t, 53.6, 54));
  if (t < 78.6) return 1; if (t < 79.6) return 1 - seg(t, 78.6, 79.6);
  if (t < 132.2) return 0; if (t < 132.9) return seg(t, 132.2, 132.9);
  if (t < 135.7) return 1; if (t < 137.3) return 1 - E.sine(seg(t, 135.7, 137.3));
  return 0;
}
function postFilter(Fa) {
  if (Fa <= .001) return;
  tmpG.setTransform(1, 0, 0, 1, 0, 0); tmpG.globalAlpha = 1; tmpG.filter = 'none'; tmpG.clearRect(0, 0, W, H); tmpG.drawImage(cv, 0, 0);
  ctx.save(); ctx.filter = `saturate(${1 - .72 * Fa}) brightness(${1 - .36 * Fa})`; ctx.drawImage(tmpCv, 0, 0); ctx.restore();
  ctx.fillStyle = `rgba(26,38,78,${.24 * Fa})`; ctx.fillRect(0, 0, W, H);
  const gr = ctx.createRadialGradient(540, 900, 320, 540, 960, 1250); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(0,0,0,${.55 * Fa})`);
  ctx.fillStyle = gr; ctx.fillRect(0, 0, W, H);
}
function frame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  const act = SCENES.filter(([a, b]) => t >= a && t < b);
  const post = [];
  act.forEach(([a, b, fn], idx) => {
    if (idx === 0) { fn(ctx, t, post); return; }
    const prevEnd = act[idx - 1][1], alpha = clamp((t - a) / Math.max(.001, prevEnd - a));
    sceneG.setTransform(1, 0, 0, 1, 0, 0); sceneG.globalAlpha = 1; sceneG.filter = 'none'; sceneG.clearRect(0, 0, W, H);
    const sub = []; fn(sceneG, t, sub);
    sub.forEach(f => f());
    ctx.save(); ctx.globalAlpha = alpha; ctx.drawImage(sceneCv, 0, 0); ctx.restore();
    if (alpha > .5) post.length = 0;
  });
  postFilter(filt(t));
  for (const f of post) { ctx.save(); f(); ctx.restore(); }
  ctx.save(); for (const c of CAPS) drawCaption(ctx, t, c); ctx.restore();
  if (t > 2.7 && t < 5.4) drawToast(ctx, t, 2.75, 5.2, '深色滤镜 · 已开启');
  if (t > 135.7 && t < 138.4) drawToast(ctx, t, 135.75, 138.2, '深色滤镜 · 已关闭');
  if (t < .6) { ctx.fillStyle = `rgba(0,0,0,${1 - t / .6})`; ctx.fillRect(0, 0, W, H); }
  if (t > 158.4) { ctx.fillStyle = `rgba(0,0,0,${seg(t, 158.4, 159.8)})`; ctx.fillRect(0, 0, W, H); }
  const r = R(Math.floor(t * 30) + 1);
  ctx.save(); ctx.globalAlpha = .045; ctx.globalCompositeOperation = 'overlay';
  ctx.drawImage(grainCv, -r() * 60, -r() * 60, W + 120, H + 120); ctx.restore();
}
window.frame = frame;
window.DURATION = DURATION;
window.READY = false;
Promise.all([document.fonts.load('60px WK', '测'), document.fonts.load('60px WKB', '测')]).then(() => { window.READY = true; });
