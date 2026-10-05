'use strict';
/* art2.js：第一关用到的画法 —— 胶片效果、核试验场景、DNA、叶子与饭碗、碳-14 小球、折线图 */

/* ---- 碳-14 的小标：14 小一点抬高，再接 C ---- */
function isoLabel(g, x, y, px, col = '#FFFFFF') {
  g.save(); g.textBaseline = 'middle'; g.fillStyle = col;
  g.font = F(px * .62, 'black'); const w1 = g.measureText('14').width; g.font = F(px, 'black'); const w2 = g.measureText('C').width;
  const x0 = x - (w1 + w2) / 2;
  g.font = F(px * .62, 'black'); g.textAlign = 'left'; g.fillText('14', x0, y - px * .26);
  g.font = F(px, 'black'); g.fillText('C', x0 + w1, y + 1); g.restore();
}
function c14Dot(g, x, y, s, t, a = 1) {
  if (a <= .001) return;
  glow(g, x, y, 80 * s, C.orange, .7 * a);
  g.save(); g.globalAlpha *= a; circ(g, x, y, 24 * s);
  const gr = g.createRadialGradient(x - 7 * s, y - 8 * s, 2, x, y, 26 * s); gr.addColorStop(0, '#FFE3B0'); gr.addColorStop(.5, C.orange); gr.addColorStop(1, '#D9500E');
  fs(g, gr, '#FFD2A0', 2.5 * s); isoLabel(g, x, y, 22 * s, '#3A1400'); g.restore();
}

/* ---- 胶片质感：划痕、灰尘、闪烁、暗角、颗粒。作用在 (x,y,w,h) 的窗口里 ---- */
function filmFX(g, t, x, y, w, h) {
  const k = Math.floor(t * 24), r = R(k * 7 + 3);
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = `rgba(255,248,230,${.03 + r() * .06})`; g.fillRect(x, y, w, h);              // 闪烁
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 1.6;
  for (let i = 0; i < 3; i++) { if (r() < .55) continue; const sx = x + r() * w; g.beginPath(); g.moveTo(sx, y + r() * h * .3); g.lineTo(sx + (r() - .5) * 6, y + h * (.6 + r() * .4)); g.stroke(); }
  for (let i = 0; i < 16; i++) { g.fillStyle = r() < .5 ? 'rgba(10,6,0,.55)' : 'rgba(255,255,255,.45)'; const sz = 1 + r() * 3.5; g.fillRect(x + r() * w, y + r() * h, sz, sz); }
  g.globalAlpha = .16; g.globalCompositeOperation = 'overlay'; g.drawImage(GRAINS, x - r() * 40, y - r() * 40, w + 80, h + 80);
  g.restore();
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  const gr = g.createRadialGradient(x + w / 2, y + h / 2, h * .35, x + w / 2, y + h / 2, w * .62); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.62)');
  g.fillStyle = gr; g.fillRect(x, y, w, h); g.restore();
}
/* 胶片边框：黑底 + 两排片孔 */
function filmFrame(g, t, x, y, w, h, scroll = 0) {
  const pad = 46;
  rr(g, x - pad, y - pad, w + pad * 2, h + pad * 2, 14); g.fillStyle = '#0B0A09'; g.fill();
  g.fillStyle = '#2A2724';
  for (let i = -1; i < (w + pad * 2) / 40 + 1; i++) {
    const hx = x - pad + ((i * 40 + scroll) % ((w + pad * 2) + 40) + (w + pad * 2) + 40) % ((w + pad * 2) + 40) - 20;
    if (hx < x - pad + 6 || hx > x + w + pad - 26) continue;
    rr(g, hx, y - pad + 12, 20, 22, 4); g.fill(); rr(g, hx, y + h + pad - 34, 20, 22, 4); g.fill();
  }
}

/* ---- 核试验场景（卡通化、剪影式）。本地坐标 0..w × 0..h，k∈[0,1] 为这一次试验的进度 ---- */
function testSite(g, t, w, h, k, o = {}) {
  const gy = h * .76, cx = o.cx ?? w * .5, sc = o.sc ?? 1;
  const sky = g.createLinearGradient(0, 0, 0, gy); sky.addColorStop(0, '#6B7B8E'); sky.addColorStop(1, '#D8CDB6'); g.fillStyle = sky; g.fillRect(0, 0, w, h);
  // 远山
  g.fillStyle = '#7C8493'; g.beginPath(); g.moveTo(0, gy); for (let i = 0; i <= 12; i++) g.lineTo(w * i / 12, gy - 20 - 44 * Math.abs(Math.sin(i * 1.7 + 1))); g.lineTo(w, gy); g.closePath(); g.fill();
  g.fillStyle = '#5C6370'; g.beginPath(); g.moveTo(0, gy); for (let i = 0; i <= 9; i++) g.lineTo(w * i / 9, gy - 8 - 22 * Math.abs(Math.sin(i * 2.3))); g.lineTo(w, gy); g.closePath(); g.fill();
  // 地面
  const gg = g.createLinearGradient(0, gy, 0, h); gg.addColorStop(0, '#B09A78'); gg.addColorStop(1, '#6F5E46'); g.fillStyle = gg; g.fillRect(0, gy, w, h - gy);
  // 试验塔
  const tw = 18 * sc, th = h * .2 * sc;
  if (k < .12) {
    g.strokeStyle = '#3A3A3A'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - tw, gy); g.lineTo(cx - tw * .35, gy - th); g.moveTo(cx + tw, gy); g.lineTo(cx + tw * .35, gy - th);
    for (let i = 1; i < 6; i++) { const yy = gy - th * i / 6, ww = lerp(tw, tw * .35, i / 6); g.moveTo(cx - ww, yy); g.lineTo(cx + ww, yy); } g.stroke();
    if (Math.floor(t * 3) % 2) { circ(g, cx, gy - th - 8, 5); g.fillStyle = '#FF4040'; g.fill(); }
  }
  // 火球与蘑菇云
  if (k > .12) {
    const u = clamp((k - .12) / .88), eu = E.out(u);
    const R0 = h * .1 * sc;
    // 冲击波
    const sw = E.out(clamp((k - .12) / .5)); if (sw < 1) { g.strokeStyle = `rgba(255,255,255,${.5 * (1 - sw)})`; g.lineWidth = 5; ell(g, cx, gy + 4, w * .5 * sw, 22 * sw); g.stroke(); }
    // 烟柱
    const stemH = h * .46 * sc * eu, stemW = lerp(R0 * .85, R0 * .5, eu);
    const gr = g.createLinearGradient(0, gy, 0, gy - stemH); gr.addColorStop(0, '#6A5B4A'); gr.addColorStop(1, '#C9B79C');
    g.fillStyle = gr; g.beginPath(); g.moveTo(cx - stemW * 1.1, gy); g.quadraticCurveTo(cx - stemW * .45, gy - stemH * .5, cx - stemW * .6, gy - stemH); g.lineTo(cx + stemW * .6, gy - stemH); g.quadraticCurveTo(cx + stemW * .45, gy - stemH * .5, cx + stemW * 1.1, gy); g.closePath(); g.fill();
    // 伞盖：一圈圆球
    const capY = gy - stemH, capR = R0 * (.8 + eu * 1.1);
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * TAU + t * .4, rx = Math.cos(a) * capR * 1.05, ry = Math.sin(a) * capR * .62;
      circ(g, cx + rx, capY + ry, capR * (.5 + .1 * Math.sin(i * 2.1 + t)));
      const cg = g.createRadialGradient(cx + rx - 6, capY + ry - 8, 2, cx + rx, capY + ry, capR * .6); cg.addColorStop(0, '#FFF2D0'); cg.addColorStop(.6, '#E2B77A'); cg.addColorStop(1, '#8A6A45'); g.fillStyle = cg; g.fill();
    }
    circ(g, cx, capY, capR * .8); const cg2 = g.createRadialGradient(cx - capR * .2, capY - capR * .2, 2, cx, capY, capR * .85); cg2.addColorStop(0, '#FFF9E8'); cg2.addColorStop(.5, '#F0C98A'); cg2.addColorStop(1, '#B07C45'); g.fillStyle = cg2; g.fill();
    // 初始火球
    if (u < .3) { const fu = u / .3; glow(g, cx, gy - R0 * fu, R0 * (1.2 + fu * 2), '#FFE9A0', .95 * (1 - fu)); }
  }
  // 起爆闪光
  if (k > .1 && k < .26) { g.fillStyle = `rgba(255,255,245,${.95 * (1 - (k - .1) / .16)})`; g.fillRect(0, 0, w, h); }
}

/* ---- DNA 双螺旋（水平放置）。tagAt∈[0,1]：碳-14 小球贴在哪里；ph：相位 ---- */
function dnaHelix(g, cx, cy, len, o = {}) {
  const { amp = 46, turns = 3.2, ph = 0, a = 1, c1 = C.cyan, c2 = C.pink, tagAt, t = 0, lw = 8, tagS = 1 } = o;
  g.save(); g.globalAlpha *= a;
  const N = 90, xs = [], p1 = [], p2 = [];
  for (let i = 0; i <= N; i++) { const u = i / N, x = cx - len / 2 + u * len, th = u * turns * TAU + ph; xs.push(x); p1.push([x, cy + Math.sin(th) * amp, Math.cos(th)]); p2.push([x, cy - Math.sin(th) * amp, -Math.cos(th)]); }
  // 横档
  for (let i = 2; i <= N; i += 4) { const A = p1[i], B = p2[i]; g.strokeStyle = hexA('#FFFFFF', .28); g.lineWidth = 3.5; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke(); }
  // 两条链：深度大的画在上面
  const draw = (pts, col, front) => {
    for (let i = 0; i < N; i++) {
      const A = pts[i], B = pts[i + 1], d = (A[2] + B[2]) / 2; if ((d > 0) !== front) continue;
      g.strokeStyle = hexA(col, .55 + .45 * d); g.lineWidth = lw * (.75 + .35 * d); g.lineCap = 'round'; g.beginPath(); g.moveTo(A[0], A[1]); g.lineTo(B[0], B[1]); g.stroke();
    }
  };
  draw(p1, c1, false); draw(p2, c2, false); draw(p1, c1, true); draw(p2, c2, true);
  g.restore();
  if (tagAt !== undefined) { const i = Math.round(clamp(tagAt) * N), P = p1[i]; c14Dot(g, P[0], P[1] - 36 * tagS, .85 * tagS, t, a); }
}

/* ---- 叶子、饭碗、云（装着碳-14）---- */
function iconLeaf(g, x, y, s = 1, rot = -.5) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.beginPath(); g.moveTo(0, -78); g.bezierCurveTo(54, -40, 54, 40, 0, 80); g.bezierCurveTo(-54, 40, -54, -40, 0, -78); g.closePath();
  const gr = g.createLinearGradient(-40, -60, 40, 70); gr.addColorStop(0, '#7BE495'); gr.addColorStop(1, '#2FA85C'); fs(g, gr, '#1D7A41', 4);
  g.strokeStyle = '#1D7A41'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -70); g.lineTo(0, 92); g.stroke();
  g.lineWidth = 3; for (let i = -2; i <= 2; i++) { if (!i) continue; const yy = i * 22; g.beginPath(); g.moveTo(0, yy); g.lineTo(32 * Math.sign(i) * -1 * -1, yy - 18); g.moveTo(0, yy); g.lineTo(-32, yy - 18); g.stroke(); }
  g.restore();
}
function iconBowl(g, x, y, s = 1, t = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  // 米饭堆
  g.beginPath(); g.moveTo(-70, -6); g.bezierCurveTo(-60, -66, 60, -66, 70, -6); g.closePath(); fs(g, '#FFFDF3', '#D8D2C0', 3);
  g.fillStyle = '#E9E3D0'; for (const [rx, ry] of [[-30, -34], [8, -48], [34, -24], [-8, -18], [-46, -12]]) { ell(g, rx, ry, 7, 3.6, .5); g.fill(); }
  // 碗
  g.beginPath(); g.moveTo(-88, -8); g.lineTo(88, -8); g.bezierCurveTo(84, 52, 40, 76, 0, 76); g.bezierCurveTo(-40, 76, -84, 52, -88, -8); g.closePath();
  const gr = g.createLinearGradient(0, -8, 0, 76); gr.addColorStop(0, '#F2F6FF'); gr.addColorStop(1, '#9DB4DD'); fs(g, gr, '#5C78B0', 4);
  g.strokeStyle = '#5C78B0'; g.lineWidth = 4; g.beginPath(); g.moveTo(-26, 80); g.lineTo(26, 80); g.stroke();
  // 热气
  g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 4; g.lineCap = 'round';
  for (const dx of [-26, 0, 26]) { g.beginPath(); for (let i = 0; i <= 10; i++) { const u = i / 10, xx = dx + Math.sin(u * 6 + t * 3 + dx) * 6, yy = -62 - u * 40; i ? g.lineTo(xx, yy) : g.moveTo(xx, yy); } g.stroke(); }
  g.restore();
}
function iconCloud(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.arc(-40, 6, 34, Math.PI * .5, Math.PI * 1.5); g.arc(-6, -26, 40, Math.PI, Math.PI * 1.95); g.arc(42, -4, 32, Math.PI * 1.5, Math.PI * .5); g.closePath();
  const gr = g.createLinearGradient(0, -60, 0, 40); gr.addColorStop(0, '#F4F8FF'); gr.addColorStop(1, '#B9CBE8'); fs(g, gr, '#7F98C4', 3.5);
  g.restore();
}
/* 正在分裂的细胞：哑铃形，里面有核 */
function iconDividing(g, x, y, s = 1, p = .5) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const d = 36 + p * 40, r = 62 - p * 6, nr = r * (1 - p * .72);
  const circles = [[-d, r], [d, r]]; for (let i = 1; i < 6; i++) circles.push([lerp(-d, d, i / 6), lerp(nr, nr, 1) + (r - nr) * Math.pow(Math.abs(i / 6 - .5) * 2, 2) * .9]);
  g.fillStyle = '#E0A21C'; for (const [cx, cr] of circles) { circ(g, cx, 0, cr + 4.5); g.fill(); }
  for (const [cx, cr] of circles) { circ(g, cx, 0, cr); const gr = g.createRadialGradient(cx - cr * .3, -cr * .35, 3, cx, 0, cr); gr.addColorStop(0, '#FFF9DE'); gr.addColorStop(1, '#FFD45A'); g.fillStyle = gr; g.fill(); }
  for (const sg of [-1, 1]) { circ(g, sg * d, 0, 20); fs(g, '#8D74E6', '#4D3A99', 3); }
  g.restore();
}

/* ---- 大气碳-14 曲线（示意）。year∈[1950,2010]，值：1 = 核试验前 ---- */
function bombCurve(y) {
  if (y <= 1955) return 1;
  if (y <= 1963) { const u = (y - 1955) / 8; return 1 + .95 * (u * u * (3 - 2 * u) * .6 + u * u * u * u * .4); }
  return 1 + .95 * Math.exp(-(y - 1963) / 16);
}
/* 折线图框架 + 曲线（画到 p：0..1 对应 1950..2010）。返回 {px(year), py(val)} 方便外面标注 */
function bombChart(g, x, y, w, h, p, o = {}) {
  const y0 = 1950, y1 = 2010, v0 = .9, v1 = 2.05;
  const px = yr => x + (yr - y0) / (y1 - y0) * w, py = v => y + h - (v - v0) / (v1 - v0) * h;
  g.save();
  rr(g, x - 70, y - 70, w + 110, h + 140, 22); fs(g, 'rgba(8,18,34,.78)', hexA(C.white, .18), 2);
  // 网格与刻度
  g.strokeStyle = 'rgba(160,190,235,.16)'; g.lineWidth = 1.5; g.fillStyle = C.mute;
  for (let yr = 1950; yr <= 2010; yr += 10) { g.beginPath(); g.moveTo(px(yr), y); g.lineTo(px(yr), y + h); g.stroke(); text(g, String(yr), px(yr), y + h + 30, 24, C.mute, 'bold'); }
  for (const v of [1, 1.5, 2]) { g.beginPath(); g.moveTo(x, py(v)); g.lineTo(x + w, py(v)); g.stroke(); }
  text(g, '核试验前', x + 4, py(1) + 24, 22, C.mute, 'bold', 1.3, 'left');
  text(g, '×2', x - 38, py(2), 26, C.mute, 'black');
  // 曲线
  const yEnd = lerp(y0, y1, clamp(p)); const pts = [];
  for (let yr = y0; yr <= yEnd + .001; yr += .5) pts.push([px(Math.min(yr, yEnd)), py(bombCurve(Math.min(yr, yEnd)))]);
  if (pts.length > 1) {
    g.beginPath(); pts.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); g.lineTo(pts[pts.length - 1][0], py(v0)); g.lineTo(pts[0][0], py(v0)); g.closePath();
    const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, hexA(C.orange, .55)); gr.addColorStop(1, hexA(C.orange, .04)); g.fillStyle = gr; g.fill();
    g.beginPath(); pts.forEach(([a, b], i) => i ? g.lineTo(a, b) : g.moveTo(a, b)); g.strokeStyle = C.orange; g.lineWidth = 6; g.lineJoin = 'round'; g.stroke();
    const e = pts[pts.length - 1]; circ(g, e[0], e[1], 9); fs(g, '#FFE3B0', C.orange, 3);
  }
  g.restore();
  return { px, py, y0, y1, v0, v1 };
}
