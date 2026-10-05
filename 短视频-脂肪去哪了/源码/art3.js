'use strict';
/* art3.js：第二关用到的画法 —— 小鼠、食盆、血管、大脑、神经元、警报灯、光纤 */

/* ================= 小鼠（侧面，朝右）================= */
/* fat：0 正常 → 1 很胖；state：idle / eat / weak / full；gray：褪成灰色（虚弱） */
function mouse(g, o) {
  const { x, y, s = 1, t = 0, fat = 0, dir = 1, state = 'idle', gray = 0, a = 1, blink = true } = o;
  g.save(); g.translate(x, y); g.scale(dir * s, s); if (a < 1) g.globalAlpha *= a;
  const bw = 80 + fat * 38, bh = 50 + fat * 36;
  const body = mix('#E6DACB', '#B9BCC6', gray), belly = mix('#FAF3E8', '#D8DBE3', gray), line = mix('#7B6B61', '#5B6070', gray), pink = mix('#F4A9B8', '#BCA6B2', gray);
  const eatB = state === 'eat' ? Math.abs(Math.sin(t * 16)) : 0;
  const weak = state === 'weak';
  // 尾巴
  g.strokeStyle = pink; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath();
  g.moveTo(-bw + 10, 10); g.bezierCurveTo(-bw - 36, 24 + Math.sin(t * 3) * 5, -bw - 62, -26, -bw - 104, -8 + Math.sin(t * 2) * 8); g.stroke();
  // 后腿、前腿
  for (const lx of [-bw * .45, bw * .55]) { ell(g, lx, bh - 4, 22, 13); fs(g, body, line, 3.5); ell(g, lx + 10, bh + 6, 15, 8); fs(g, pink, null); }
  // 身体
  ell(g, 0, 0, bw, bh); const gr = g.createRadialGradient(-bw * .25, -bh * .4, 8, 0, 0, bw * 1.1); gr.addColorStop(0, mix(body, '#FFFFFF', .35)); gr.addColorStop(1, body); fs(g, gr, line, 4.5);
  g.save(); g.globalAlpha *= .9; ell(g, 8, bh * .38, bw * .72, bh * .48); g.fillStyle = belly; g.fill(); g.restore();
  if (fat > .5) { g.strokeStyle = hexA(line, .35); g.lineWidth = 3; g.beginPath(); g.arc(-bw * .1, bh * .1, bh * .72, 1.0, 2.3); g.stroke(); }
  // 头
  const hx = bw - 8, hy = -bh * .12 + (state === 'eat' ? 20 : 0) + (weak ? 30 : 0);
  ell(g, hx, hy, 46, 39); fs(g, body, line, 4.5);
  ell(g, hx + 36, hy + 10, 27, 21); fs(g, belly, line, 3.5);
  circ(g, hx + 58, hy + 6, 8); fs(g, pink, line, 2.5);
  // 耳朵
  circ(g, hx - 16, hy - 36, 23); fs(g, body, line, 4); circ(g, hx - 16, hy - 36, 13); fs(g, pink, null);
  // 眼睛
  if (weak) { g.strokeStyle = '#3A2F2A'; g.lineWidth = 4.5; g.lineCap = 'round'; g.beginPath(); g.moveTo(hx + 8, hy - 14); g.lineTo(hx + 22, hy - 2); g.moveTo(hx + 22, hy - 14); g.lineTo(hx + 8, hy - 2); g.stroke(); }
  else if (blink && (t % 3.4) < .12) { g.strokeStyle = '#3A2F2A'; g.lineWidth = 4; g.beginPath(); g.moveTo(hx + 8, hy - 8); g.lineTo(hx + 22, hy - 8); g.stroke(); }
  else { circ(g, hx + 15, hy - 8, 7.5); g.fillStyle = '#2B2220'; g.fill(); circ(g, hx + 13, hy - 10.5, 2.6); g.fillStyle = '#FFFFFF'; g.fill(); }
  // 腮红、胡须
  g.fillStyle = 'rgba(255,120,140,.35)'; ell(g, hx + 26, hy + 14, 9, 6); g.fill();
  g.strokeStyle = hexA(line, .8); g.lineWidth = 2.2; g.beginPath(); for (const dy of [-3, 6, 15]) { g.moveTo(hx + 52, hy + 8 + dy * .3); g.lineTo(hx + 86, hy + dy - 4 + Math.sin(t * 5) * 1.5); } g.stroke();
  if (state === 'eat') { for (let i = 0; i < 3; i++) { const u = (t * 3 + i / 3) % 1; circ(g, hx + 60 + u * 22, hy + 30 + u * 20, 4 * (1 - u)); g.fillStyle = hexA('#D8B27A', 1 - u); g.fill(); } }
  g.restore();
}
function foodBowl(g, x, y, s, level = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const n = Math.round(26 * clamp(level)), r = R(5);
  g.fillStyle = '#C79B5E'; for (let i = 0; i < n; i++) { const px = (r() - .5) * 96, py = -8 - r() * 22 * (1 - Math.abs(px) / 70); circ(g, px, py, 8); g.fillStyle = i % 2 ? '#C79B5E' : '#B88A4C'; g.fill(); }
  g.beginPath(); g.moveTo(-70, -6); g.lineTo(70, -6); g.bezierCurveTo(66, 30, 34, 40, 0, 40); g.bezierCurveTo(-34, 40, -66, 30, -70, -6); g.closePath(); fs(g, '#7BA0D6', '#3F5E94', 4);
  g.restore();
}
/* 一条透明的血管/管道：从 A 到 B 的弧线，里面流着红细胞或信号粒子。返回曲线函数 */
function bloodTube(g, t, A, B, o = {}) {
  const { lift = 150, p = 1, red = true, sig = 0, sigDir = 1, w = 36 } = o;
  const cx = (A[0] + B[0]) / 2, cy = Math.min(A[1], B[1]) - lift;
  const P = u => [(1 - u) * (1 - u) * A[0] + 2 * (1 - u) * u * cx + u * u * B[0], (1 - u) * (1 - u) * A[1] + 2 * (1 - u) * u * cy + u * u * B[1]];
  const N = 40; const path = () => { g.beginPath(); for (let i = 0; i <= N * p; i++) { const q = P(i / N); i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1]); } };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  path(); g.strokeStyle = 'rgba(200,228,255,.45)'; g.lineWidth = w + 10; g.stroke();
  path(); g.strokeStyle = red ? 'rgba(200,50,70,.85)' : 'rgba(60,140,255,.5)'; g.lineWidth = w; g.stroke();
  path(); g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 6; g.save(); g.translate(0, -w * .25); g.stroke(); g.restore();
  if (red) for (let i = 0; i < 14; i++) { const u = ((t * .22 * sigDir + i / 14) % 1 + 1) % 1; if (u > p) continue; const q = P(u); ell(g, q[0], q[1], 7, 4.5, Math.atan2(1, 0) * 0); g.fillStyle = 'rgba(255,120,130,.9)'; g.fill(); }
  // 信号粒子（青色小六边形，写着“别吃了”的那种信号）
  for (let i = 0; i < sig; i++) { const u = ((t * .16 * sigDir + i / sig) % 1 + 1) % 1; if (u > p) continue; const q = P(u); g.save(); g.translate(q[0], q[1]); g.rotate(t * 2 + i); glow(g, 0, 0, 36, C.cyan, .8); poly(g, [0, 1, 2, 3, 4, 5].map(k => [Math.cos(k * Math.PI / 3) * 11, Math.sin(k * Math.PI / 3) * 11])); fs(g, '#BFF4FF', C.cyan, 2.5); g.restore(); }
  g.restore();
  return P;
}

/* ================= 大脑（侧面剖视，朝左）================= */
function brain(g, x, y, s, t, o = {}) {
  const { hl = 0, hypo = true } = o;
  g.save(); g.translate(x, y); g.scale(s, s);
  // 脑干、小脑
  rr(g, 22, 70, 38, 96, 16); fs(g, '#D68AA0', '#8E4A62', 5);
  ell(g, 108, 92, 66, 42, .12); fs(g, '#C97A93', '#8E4A62', 5);
  g.strokeStyle = 'rgba(100,40,60,.4)'; g.lineWidth = 3; for (let i = 0; i < 4; i++) { g.beginPath(); g.ellipse(108, 92, 54 - i * 12, 32 - i * 7, .12, Math.PI * 1.1, Math.PI * 1.9); g.stroke(); }
  // 大脑
  g.beginPath(); g.moveTo(-176, 12); g.bezierCurveTo(-190, -64, -128, -138, -28, -152); g.bezierCurveTo(70, -164, 164, -120, 176, -30);
  g.bezierCurveTo(184, 30, 146, 70, 76, 74); g.bezierCurveTo(36, 78, -10, 70, -56, 76); g.bezierCurveTo(-122, 82, -168, 66, -176, 12); g.closePath();
  const gr = g.createRadialGradient(-40, -60, 20, 0, 0, 200); gr.addColorStop(0, '#FFC3D3'); gr.addColorStop(1, '#F08BA8'); fs(g, gr, '#B24A6E', 5.5);
  g.strokeStyle = 'rgba(150,50,85,.55)'; g.lineWidth = 4.5; g.lineCap = 'round';
  const ln = [[[-130, -40], [-100, -92], [-60, -70], [-30, -112]], [[-110, 20], [-70, -20], [-30, 10], [10, -30]], [[20, -118], [60, -80], [110, -96], [140, -50]], [[40, -20], [90, -40], [120, 0], [150, -10]], [[-140, -10], [-150, -50]], [[-10, 40], [40, 20], [80, 40]]];
  ln.forEach(pts => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length - 1; i++) { const mx = (pts[i][0] + pts[i + 1][0]) / 2, my = (pts[i][1] + pts[i + 1][1]) / 2; g.quadraticCurveTo(pts[i][0], pts[i][1], mx, my); } const L = pts[pts.length - 1]; g.lineTo(L[0], L[1]); g.stroke(); });
  if (hypo) {
    glow(g, -16, 52, 70, C.cyan, .5 + hl * .5);
    ell(g, -16, 52, 22, 15); fs(g, mix('#7ADFF5', '#FFFFFF', hl * .5), '#1FA5C8', 3.5);
  }
  g.restore();
}
/* 神经元：胞体 + 树突 + 向下的轴突。act：0 安静（暗）→ 1 兴奋（亮）；inhib：被压制的程度 */
function neuron(g, x, y, s, o = {}) {
  const { t = 0, act = 0, seed = 1, col = C.pink, a = 1 } = o;
  const r = R(seed * 17 + 3);
  g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha *= a;
  if (act > .02) glow(g, 0, 0, 110, col, .55 * act);
  const dim = mix('#6C7EA0', col, act);
  g.lineCap = 'round'; g.lineJoin = 'round';
  const n = 6;
  for (let i = 0; i < n; i++) {
    const an = -Math.PI * .95 + (i / (n - 1)) * Math.PI * .9 + (r() - .5) * .2, L = 52 + r() * 30;
    const x1 = Math.cos(an) * L, y1 = Math.sin(an) * L;
    g.strokeStyle = hexA(dim, .85); g.lineWidth = 6; g.beginPath(); g.moveTo(Math.cos(an) * 20, Math.sin(an) * 20); g.lineTo(x1, y1); g.stroke();
    for (const da of [-.5, .5]) { g.lineWidth = 4; g.beginPath(); g.moveTo(x1, y1); g.lineTo(x1 + Math.cos(an + da) * 26, y1 + Math.sin(an + da) * 26); g.stroke(); }
  }
  // 轴突
  g.strokeStyle = hexA(dim, .85); g.lineWidth = 6; g.beginPath(); g.moveTo(0, 22); g.lineTo(0, 100); g.stroke();
  circ(g, 0, 104, 9); g.fillStyle = hexA(dim, .95); g.fill();
  if (act > .3) { for (let i = 0; i < 2; i++) { const u = ((t * 1.6 + i * .5) % 1); circ(g, 0, 22 + u * 78, 5); g.fillStyle = hexA('#FFFFFF', act * (1 - u * .5)); g.fill(); } }
  // 胞体
  circ(g, 0, 0, 26); const gr = g.createRadialGradient(-8, -9, 3, 0, 0, 28); gr.addColorStop(0, mix(dim, '#FFFFFF', .45)); gr.addColorStop(1, dim); fs(g, gr, mix('#2B3B66', '#8E1E4C', act), 3.5);
  circ(g, 3, 2, 9); g.fillStyle = hexA(mix('#2B3B66', '#8E1E4C', act), .6); g.fill();
  g.restore();
}
/* 警报灯：act 0 暗 → 1 闪 */
function siren(g, x, y, s, t, act = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  if (act > 0) { const f = .55 + .45 * Math.sin(t * 12); glow(g, 0, -34, 160, C.red, .6 * act * f); for (let i = 0; i < 8; i++) { const an = i / 8 * TAU + t * 2; g.strokeStyle = hexA('#FFB0B0', .6 * act * f); g.lineWidth = 5; g.beginPath(); g.moveTo(Math.cos(an) * 62, -34 + Math.sin(an) * 62); g.lineTo(Math.cos(an) * 86, -34 + Math.sin(an) * 86); g.stroke(); } }
  rr(g, -48, 0, 96, 22, 8); fs(g, '#4D5B7A', '#2B3552', 4);
  g.beginPath(); g.moveTo(-38, 0); g.lineTo(-38, -26); g.bezierCurveTo(-38, -80, 38, -80, 38, -26); g.lineTo(38, 0); g.closePath();
  const gr = g.createLinearGradient(0, -70, 0, 0); gr.addColorStop(0, mix('#6B2530', '#FF8A8A', act)); gr.addColorStop(1, mix('#4A1A24', '#E5303C', act)); fs(g, gr, '#2B1018', 4);
  g.globalAlpha *= .5; ell(g, -14, -42, 8, 18, .3); g.fillStyle = '#FFFFFF'; g.fill();
  g.restore();
}
/* 光纤：从上方接到头上，亮时发蓝光。from/to 为两端；on 为 0..1 */
function fiber(g, t, from, to, on) {
  g.save(); g.lineCap = 'round';
  g.strokeStyle = '#33405E'; g.lineWidth = 14; g.beginPath(); g.moveTo(from[0], from[1]); g.bezierCurveTo(from[0], (from[1] + to[1]) / 2, to[0] - 40, to[1] - 80, to[0], to[1]); g.stroke();
  g.strokeStyle = mix('#5B6B90', '#8FD0FF', on); g.lineWidth = 6; g.stroke();
  if (on > 0) { glow(g, to[0], to[1] - 10, 100, '#46A8FF', .45 * on); beam(g, to[0], to[1], Math.PI / 2, 80, 12, 56, '#7FC4FF', .45 * on); }
  g.restore();
}
/* 圆柱形有机玻璃箱的正面，小鼠在里面 */
function labBox(g, x, y, w, h) {
  rr(g, x, y, w, h, 28); fs(g, 'rgba(160,210,255,.06)', 'rgba(170,215,255,.55)', 4);
  g.save(); g.globalAlpha *= .35; g.beginPath(); g.moveTo(x + 26, y + 20); g.lineTo(x + 26, y + h * .55); g.strokeStyle = '#FFFFFF'; g.lineWidth = 6; g.lineCap = 'round'; g.stroke(); g.restore();
  g.fillStyle = 'rgba(190,150,100,.28)'; rr(g, x + 6, y + h - 40, w - 12, 34, 16); g.fill();
}
