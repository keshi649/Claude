'use strict';
/* 方向 7：霓虹灯牌。整支 MV 发生在一条下雪的深夜小街上，所有东西都是霓虹灯管弯出来的。
   他和她是隔壁两块灯牌：他是一块橙黄色的，"营业中"，接触不良，老是一闪一闪；她是粉紫色的。
   亮着的时候在一起；她那块灯牌被拆走以后，墙上只剩几颗螺丝和一圈没被晒褪色的印子。歌词也是霓虹管弯的字。 */
NEED += '营业中打烊了爱情废柴周杰伦甜菜过条街最好又给我下起雪没有你的冬天曲终人散你也走散招租牌照可乐冰店拉面通宵酒馆';
const NW = 1920, NH = 1080;
function nc(w = NW, h = NH) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c.getContext('2d'); }
/* 一根霓虹管：path 是一段画路径的函数（在 ctx 上 beginPath 以后调用）；col 灯色；on 0~1 亮度；w 管粗 */
function tube(L, path, col, on = 1, w = 9, o = {}) {
  const { g, G } = L;
  // 灯管本身（关着的时候是暗暗的玻璃管）
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = 'rgba(10,10,20,.55)'; g.lineWidth = w + 6; g.translate(4, 6); g.beginPath(); path(g); g.stroke(); g.translate(-4, -6);
  g.strokeStyle = mix(dk(col, .55), '#3A3448', .5); g.lineWidth = w + 2; g.beginPath(); path(g); g.stroke();
  if (on > 0) { g.strokeStyle = mix(dk(col, .5), col, on); g.lineWidth = w; g.beginPath(); path(g); g.stroke(); g.strokeStyle = mix(dk(col, .3), lt(col, .7), on); g.lineWidth = w * .45; g.beginPath(); path(g); g.stroke(); g.strokeStyle = `rgba(255,255,255,${.85 * on})`; g.lineWidth = w * .18; g.beginPath(); path(g); g.stroke(); }
  else { g.strokeStyle = 'rgba(255,255,255,.18)'; g.lineWidth = w * .25; g.translate(-w * .15, -w * .15); g.beginPath(); path(g); g.stroke(); }
  g.restore();
  if (on > 0) { G.save(); G.lineCap = 'round'; G.lineJoin = 'round'; G.strokeStyle = col; G.globalAlpha = on; G.lineWidth = w * (o.gw || 3.2); G.beginPath(); path(G); G.stroke(); G.restore(); }
}
/* 支架：灯管后面的小透明夹子 */
function clips(L, pts) { const { g } = L; pts.forEach(([x, y]) => { g.fillStyle = 'rgba(200,210,230,.35)'; g.fillRect(x - 4, y - 7, 8, 14); g.fillStyle = 'rgba(40,40,50,.8)'; g.beginPath(); g.arc(x, y + 9, 3, 0, 7); g.fill(); }); }
/* 灯管字：用很细的黑体（思源黑体 200）填充，一笔就是一根管；白芯、彩色边、彩色光 */
function neonText(L, s, x, y, size, col, on = 1, o = {}) {
  const font = o.font || `200 ${size}px "Noto Sans SC"`, { g, G } = L;
  const T = (c, fn) => { c.save(); c.font = font; c.textAlign = o.align || 'center'; c.textBaseline = 'middle'; c.translate(x, y); if (o.rot) c.rotate(o.rot); fn(c); c.restore(); };
  const sw = size * .026;
  T(g, c => { c.fillStyle = 'rgba(8,6,14,.6)'; c.fillText(s, size * .03, size * .05); });
  T(g, c => { c.lineJoin = 'round'; c.strokeStyle = on > 0 ? mix(dk(col, .4), col, on) : mix(dk(col, .6), '#3A3448', .5); c.lineWidth = sw * 2.2; c.strokeText(s, 0, 0); c.fillStyle = on > 0 ? mix(dk(col, .3), lt(col, .75), on) : 'rgba(120,110,140,.55)'; c.fillText(s, 0, 0); });
  if (on > 0) { T(G, c => { c.globalAlpha = on * (o.ga ?? .75); c.lineJoin = 'round'; c.strokeStyle = col; c.lineWidth = sw * (o.gw ?? 5); c.strokeText(s, 0, 0); c.fillStyle = col; c.fillText(s, 0, 0); }); }
}
function neonCompose(main, L, o = {}) {
  main.drawImage(L.g.canvas, 0, 0);
  main.save(); main.globalCompositeOperation = 'lighter';
  const k = o.k ?? 1; main.filter = 'blur(5px)'; main.globalAlpha = .7 * k; main.drawImage(L.G.canvas, 0, 0);
  main.filter = 'blur(22px)'; main.globalAlpha = .6 * k; main.drawImage(L.G.canvas, 0, 0);
  main.filter = 'blur(70px)'; main.globalAlpha = .45 * k; main.drawImage(L.G.canvas, 0, 0);
  main.restore();
}
function brickWall(g, x0, y0, w, h, o = {}) {
  const base = o.base || '#2A2030', bw = o.bw || 64, bh = o.bh || 26;
  g.fillStyle = dk(base, .35); g.fillRect(x0, y0, w, h);
  const r = rng(o.seed || 3);
  for (let row = 0; row * bh < h; row++) for (let col = -1; col * bw < w + bw; col++) { const x = x0 + col * bw + (row % 2) * bw / 2, y = y0 + row * bh; const c = mix(base, r() < .5 ? '#3A2A3A' : '#24202E', r() * .6); g.fillStyle = c; g.fillRect(x + 2, y + 2, bw - 4, bh - 4); g.fillStyle = 'rgba(255,255,255,.04)'; g.fillRect(x + 2, y + 2, bw - 4, 3); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x + 2, y + bh - 6, bw - 4, 4); }
  for (let i = 0; i < w * h / 900; i++) { g.fillStyle = r() < .5 ? 'rgba(0,0,0,.18)' : 'rgba(255,255,255,.04)'; g.fillRect(x0 + r() * w, y0 + r() * h, 2 + r() * 4, 2 + r() * 3); }
}
/* 墙上的光：灯牌把颜色投在砖墙上（加在暗的砖墙上，用 soft 一点的 screen） */
function wallWash(g, x, y, rx, ry, col, a = .5) { g.save(); g.globalCompositeOperation = 'screen'; const gr = g.createRadialGradient(x, y, 0, x, y, rx); gr.addColorStop(0, rgba7(col, a)); gr.addColorStop(1, rgba7(col, 0)); g.setTransform(1, 0, 0, ry / rx, 0, y - y * ry / rx); g.fillStyle = gr; g.fillRect(x - rx, y - rx, 2 * rx, 2 * rx); g.restore(); }
function rgba7(c, a) { const A = h2(c); return `rgba(${A[0]},${A[1]},${A[2]},${a})`; }
function rain7(g, seed, n, o = {}) { const r = rng(seed); g.save(); for (let i = 0; i < n; i++) { const x = r() * NW, y = r() * NH, s = (o.s || 2) + r() * (o.sv || 3); g.globalAlpha = .3 + r() * .6; g.fillStyle = o.col || '#EAF0FF'; g.beginPath(); g.arc(x, y, s, 0, 7); g.fill(); } g.restore(); }
function wetGround(g, y0, L, o = {}) {
  // 地面：湿的、积了一点雪的石板路，倒映灯牌
  const gr = g.createLinearGradient(0, y0, 0, NH); gr.addColorStop(0, '#16121E'); gr.addColorStop(1, '#0A0810'); g.fillStyle = gr; g.fillRect(0, y0, NW, NH - y0);
  const refl = nc(); refl.save(); refl.translate(0, y0 * 2 + (o.off || 0)); refl.scale(1, -1); refl.drawImage(L.g.canvas, 0, 0); refl.globalCompositeOperation = 'lighter'; refl.filter = 'blur(10px)'; refl.drawImage(L.G.canvas, 0, 0); refl.restore();
  g.save(); g.beginPath(); g.rect(0, y0, NW, NH - y0); g.clip(); g.filter = 'blur(5px)'; g.globalAlpha = .55; for (let k = 0; k < 6; k++) g.drawImage(refl.canvas, (k % 2 ? 1 : -1) * k * 1.2, k * 3); g.restore();
  const m = g.createLinearGradient(0, y0, 0, NH); m.addColorStop(0, 'rgba(10,8,16,0)'); m.addColorStop(1, 'rgba(10,8,16,.7)'); g.fillStyle = m; g.fillRect(0, y0, NW, NH - y0);
  const r = rng(6); g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 2; for (let x = -200; x < NW + 200; x += 150) { g.beginPath(); g.moveTo(x, y0); g.lineTo(x + (x - NW / 2) * .9, NH); g.stroke(); } for (let k = 1; k < 7; k++) { const y = y0 + (NH - y0) * (k * k) / 49; g.beginPath(); g.moveTo(0, y); g.lineTo(NW, y); g.stroke(); }
  for (let i = 0; i < 260; i++) { const x = r() * NW, y = y0 + 6 + Math.pow(r(), 1.6) * (NH - y0), s = 2 + r() * 10 * ((y - y0) / (NH - y0)); g.fillStyle = `rgba(230,236,255,${.25 + r() * .45})`; g.beginPath(); g.ellipse(x, y, s * 1.6, s * .5, 0, 0, 7); g.fill(); }
}
/* ---------- 他：灯管弯出来的人（营业中） ---------- */
function neonGuy(L, x, fy, H, col, on, o = {}) {
  const u = H / 28, hy = fy - 20 * u, hr = 6.8 * u, w = o.w || Math.max(4, u * .62), gw = o.gw || 2;
  const T = (p, c2 = col, a = on, ww = w) => tube(L, p, c2, a, ww, { gw });
  T(c => { c.ellipse(x, hy, hr, hr * .95, 0, 0, 7); });
  // 刘海：沿着额头一排小波浪，头顶一撮呆毛
  T(c => { c.moveTo(x - hr * .92, hy - hr * .2); for (let i = 0; i < 5; i++) { const x0 = x - hr * .92 + i * hr * .37, x1 = x0 + hr * .37; c.quadraticCurveTo((x0 + x1) / 2, hy - hr * (i % 2 ? .62 : .28), x1, hy - hr * .32); } });
  T(c => { c.moveTo(x + hr * .05, hy - hr * .95); c.bezierCurveTo(x - hr * .25, hy - hr * 1.5, x + hr * .55, hy - hr * 1.7, x + hr * .5, hy - hr * 1.3); });
  if (o.eyes === 'shut') T(c => { [-1, 1].forEach(sd => { c.moveTo(x + sd * hr * .42 - hr * .14, hy + hr * .12); c.quadraticCurveTo(x + sd * hr * .42, hy + hr * .26, x + sd * hr * .42 + hr * .14, hy + hr * .12); }); }, col, on, w * .85);
  else T(c => { [-1, 1].forEach(sd => { c.moveTo(x + sd * hr * .42, hy + hr * .04); c.lineTo(x + sd * hr * .42, hy + hr * .24); }); }, col, on, w * 1.1);
  T(c => { [-1, 1].forEach(sd => { c.moveTo(x + sd * hr * .72 - hr * .09, hy + hr * .5); c.lineTo(x + sd * hr * .72 + hr * .09, hy + hr * .5); }); }, '#FF7AA8', on * .9, w * .8);
  T(c => { if (o.mouth === 'o') c.ellipse(x, hy + hr * .56, hr * .09, hr * .12, 0, 0, 7); else if (o.mouth === 'smile') c.arc(x, hy + hr * .4, hr * .17, .2 * Math.PI, .8 * Math.PI); else if (o.mouth === 'frown') c.arc(x, hy + hr * .72, hr * .15, 1.2 * Math.PI, 1.8 * Math.PI); else { c.moveTo(x - hr * .12, hy + hr * .58); c.lineTo(x + hr * .12, hy + hr * .58); } }, col, on, w * .85);
  // 围巾（红管）
  T(c => { c.moveTo(x - hr * .8, hy + hr * 1.1); c.quadraticCurveTo(x, hy + hr * 1.32, x + hr * .8, hy + hr * 1.1); c.moveTo(x + hr * .4, hy + hr * 1.22); c.lineTo(x + hr * (o.wind ? 1.5 : .5), hy + hr * (o.wind ? 1.4 : 2.1)); }, '#FF3A4A', on, w);
  // 大衣
  T(c => { c.moveTo(x - hr * .75, hy + hr * 1.18); c.lineTo(x - hr * 1.0, fy - 5 * u); c.lineTo(x + hr * 1.0, fy - 5 * u); c.lineTo(x + hr * .75, hy + hr * 1.18); });
  T(c => { [hy + hr * 1.7, hy + hr * 2.15].forEach(by => { c.moveTo(x + hr * .18, by); c.arc(x + hr * .12, by, hr * .06, 0, 7); }); }, col, on, w * .8);
  const arm = o.arms || 'down';
  T(c => { if (arm === 'up') { c.moveTo(x - hr * .8, hy + hr * 1.4); c.lineTo(x - hr * 1.55, hy - hr * .1); c.moveTo(x + hr * .8, hy + hr * 1.4); c.lineTo(x + hr * 1.55, hy - hr * .1); } else { c.moveTo(x - hr * .8, hy + hr * 1.4); c.lineTo(x - hr * 1.2, fy - 7 * u); c.moveTo(x + hr * .8, hy + hr * 1.4); c.lineTo(x + hr * 1.2, fy - 7 * u); } c.moveTo(x - hr * .42, fy - 5 * u); c.lineTo(x - hr * .45, fy); c.lineTo(x - hr * .8, fy); c.moveTo(x + hr * .42, fy - 5 * u); c.lineTo(x + hr * .45, fy); c.lineTo(x + hr * .8, fy); });
}
function neonGirl(L, x, fy, H, col, on, o = {}) {
  const u = H / 28, hy = fy - 20 * u, hr = 6.8 * u, w = o.w || Math.max(4, u * .62), gw = o.gw || 2, WH = '#F0ECFF';
  const T = (p, c2 = col, a = on, ww = w) => tube(L, p, c2, a, ww, { gw });
  // 脸只画下半圈（上半圈被帽子盖住），两边垂下来的短发
  T(c => { c.ellipse(x, hy, hr, hr * .95, 0, Math.PI * 1.02, Math.PI * 1.98, true); });
  T(c => { [-1, 1].forEach(sd => { c.moveTo(x + sd * hr * .98, hy - hr * .15); c.quadraticCurveTo(x + sd * hr * 1.22, hy + hr * .5, x + sd * hr * 1.05, hy + hr * .95); }); }, '#FFB07A', on, w);
  // 毛线帽：帽檐一道、帽身一个半圆、绒球
  T(c => { c.moveTo(x - hr * 1.12, hy - hr * .18); c.quadraticCurveTo(x, hy - hr * .42, x + hr * 1.12, hy - hr * .18); c.moveTo(x - hr * .98, hy - hr * .3); c.bezierCurveTo(x - hr * 1.0, hy - hr * 1.55, x + hr * 1.0, hy - hr * 1.55, x + hr * .98, hy - hr * .3); }, WH, on, w);
  T(c => { c.arc(x, hy - hr * 1.48, hr * .26, 0, 7); }, '#FF7AA8', on, w);
  if (o.eyes === 'happy') T(c => { [-1, 1].forEach(sd => { c.moveTo(x + sd * hr * .42 - hr * .14, hy + hr * .24); c.quadraticCurveTo(x + sd * hr * .42, hy + hr * .06, x + sd * hr * .42 + hr * .14, hy + hr * .24); }); }, col, on, w * .85);
  else T(c => { [-1, 1].forEach(sd => { c.moveTo(x + sd * hr * .42, hy + hr * .06); c.lineTo(x + sd * hr * .42, hy + hr * .26); }); }, col, on, w * 1.1);
  T(c => { [-1, 1].forEach(sd => { c.moveTo(x + sd * hr * .72 - hr * .09, hy + hr * .52); c.lineTo(x + sd * hr * .72 + hr * .09, hy + hr * .52); }); }, '#FF7AA8', on * .9, w * .8);
  T(c => { c.arc(x, hy + hr * .42, hr * .16, .2 * Math.PI, .8 * Math.PI); }, col, on, w * .85);
  T(c => { c.moveTo(x - hr * .75, hy + hr * 1.12); c.lineTo(x - hr * 1.3, fy - 5 * u); c.lineTo(x + hr * 1.3, fy - 5 * u); c.lineTo(x + hr * .75, hy + hr * 1.12); });
  const hand = o.arms === 'wave' ? [[x - hr * 1.15, fy - 7 * u], [x + hr * 1.6, hy + hr * .1]] : [[x - hr * 1.15, fy - 7 * u], [x + hr * 1.15, fy - 7 * u]];
  T(c => { c.moveTo(x - hr * .78, hy + hr * 1.38); c.lineTo(hand[0][0], hand[0][1]); c.moveTo(x + hr * .78, hy + hr * 1.38); c.lineTo(hand[1][0], hand[1][1]); c.moveTo(x - hr * .42, fy - 5 * u); c.lineTo(x - hr * .42, fy); c.moveTo(x + hr * .42, fy - 5 * u); c.lineTo(x + hr * .42, fy); });
  T(c => { hand.forEach(([hx, hy2]) => { c.moveTo(hx + hr * .2, hy2); c.arc(hx, hy2, hr * .2, 0, 7); }); }, '#FF3A4A', on, w);
}
/* 灯牌的底板（金属框 + 螺丝） */
function signBoard(g, x, y, w, h, o = {}) { g.save(); g.fillStyle = 'rgba(0,0,0,.45)'; g.filter = 'blur(12px)'; g.fillRect(x + 10, y + 16, w, h); g.restore(); g.fillStyle = o.fill || 'rgba(18,16,26,.88)'; g.beginPath(); g.roundRect(x, y, w, h, 14); g.fill(); g.strokeStyle = '#4A4458'; g.lineWidth = 6; g.stroke(); g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 2; g.strokeRect(x + 8, y + 8, w - 16, h - 16); [[x + 18, y + 18], [x + w - 18, y + 18], [x + 18, y + h - 18], [x + w - 18, y + h - 18]].forEach(([sx, sy]) => { g.fillStyle = '#8A8698'; g.beginPath(); g.arc(sx, sy, 6, 0, 7); g.fill(); g.strokeStyle = '#3A3648'; g.lineWidth = 2; g.beginPath(); g.moveTo(sx - 4, sy); g.lineTo(sx + 4, sy); g.stroke(); }); if (o.wire) { g.strokeStyle = '#141018'; g.lineWidth = 5; g.beginPath(); g.moveTo(x + w * .8, y + h); g.bezierCurveTo(x + w * .82, y + h + 80, x + w + 40, y + h + 40, x + w + 60, y + h + 200); g.stroke(); } }
function lyric7(L, s, y = 990, col = '#FFD9A8') { neonText(L, s, NW / 2, y, 72, col, 1, { ga: .55 }); }
function mark7(L) { neonText(L, '甜菜', 1840, 64, 44, '#FF8AC8', 1, { ga: .5 }); }

/* ============ 7a：开头。一条下雪的深夜小街，灯牌一块块亮起来，片名是一块大灯牌 ============ */
FRAMES['7a'] = async (main) => {
  main.fillStyle = '#0C0A14'; main.fillRect(0, 0, NW, NH);
  const L = { g: nc(), G: nc() }, g = L.g;
  brickWall(g, 0, 0, NW, 760, { base: '#2A2232', seed: 4 });
  // 远处的窗、空调、管子
  [[90, 130], [1560, 120]].forEach(([x, y]) => { g.fillStyle = '#100E16'; g.fillRect(x, y, 230, 150); g.fillStyle = 'rgba(255,190,120,.18)'; g.fillRect(x + 10, y + 10, 100, 130); g.fillStyle = '#0A0810'; g.fillRect(x + 118, y + 10, 100, 130); g.fillStyle = '#3A3448'; g.fillRect(x - 10, y + 150, 250, 12); });
  g.fillStyle = '#3A3644'; g.fillRect(1520, 330, 140, 90); g.fillStyle = '#26222E'; for (let i = 0; i < 8; i++) g.fillRect(1530 + i * 16, 340, 8, 70); g.strokeStyle = '#18141E'; g.lineWidth = 10; g.beginPath(); g.moveTo(40, 0); g.lineTo(40, 760); g.moveTo(1880, 0); g.lineTo(1880, 520); g.lineTo(1700, 520); g.stroke();
  // 大灯牌：爱情废柴
  signBoard(g, 520, 150, 880, 330, { wire: 1 });
  neonText(L, '爱情', 755, 318, 210, '#FFC85A', 1, { ga: .6 });
  neonText(L, '废', 1060, 318, 210, '#FF4A6A', 1, { ga: .7 });
  neonText(L, '柴', 1255, 318, 210, '#FF4A6A', .1);
  tube(L, c => { c.moveTo(560, 438); c.lineTo(1360, 438); }, '#7AE0FF', 1, 6);
  tube(L, c => { c.moveTo(560, 192); c.lineTo(1360, 192); }, '#7AE0FF', 1, 6);
  neonText(L, '周杰伦', 960, 515, 44, '#7AE0FF', 1, { ga: .55 });
  // 左边：他（营业中），右边：她
  signBoard(g, 120, 340, 300, 360); neonGuy(L, 270, 672, 190, '#FFB04A', 1, { eyes: 'n', mouth: 'smile' });
  neonText(L, '营业中', 270, 390, 46, '#7AFF9A', 1, { ga: .55 });
  signBoard(g, 1500, 340, 300, 360); neonGirl(L, 1650, 672, 190, '#FF8AD8', 1, { eyes: 'happy' });
  tube(L, c => { const x = 1650, y = 392; c.moveTo(x, y + 20); c.bezierCurveTo(x - 28, y, x - 18, y - 20, x, y - 7); c.bezierCurveTo(x + 18, y - 20, x + 28, y, x, y + 20); }, '#FF4A6A', 1, 5, { gw: 2 });
  // 小店招
  [[60, 726, '拉面', '#FF6A3A'], [1720, 726, '通宵', '#7AE0FF']].forEach(([x, y, s, c]) => { signBoard(g, x - 10, y - 44, 160, 88); neonText(L, s, x + 70, y, 54, c, 1, { ga: .6 }); });
  // 小灯串
  for (let i = 0; i < 28; i++) { const t = i / 27, x = 470 + t * 980, y = 560 + Math.sin(t * Math.PI) * 50; tube(L, c => { c.arc(x, y, 5, 0, 7); }, BULBS[i % 5], 1, 5, { gw: 2.4 }); }
  tube(L, c => { c.moveTo(470, 560); c.quadraticCurveTo(960, 660, 1450, 560); }, '#3A3444', 0, 2);
  wallWash(g, 960, 320, 700, 380, '#FF6A6A', .32); wallWash(g, 270, 520, 300, 300, '#FFB04A', .3); wallWash(g, 1650, 520, 300, 300, '#FF8AD8', .3);
  wetGround(g, 760, L);
  neonCompose(main, L);
  rain7(main, 3, 200); main.save(); main.filter = 'blur(6px)'; rain7(main, 8, 18, { s: 10, sv: 14 }); main.restore();
  const v = main.createRadialGradient(NW / 2, NH / 2, NH * .35, NW / 2, NH / 2, NH * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.6)'); main.fillStyle = v; main.fillRect(0, 0, NW, NH);
  const L2 = { g: nc(), G: nc() }; mark7(L2); neonCompose(main, L2);
};

/* ============ 7b：主歌"没有你的冬天"。她那块灯牌被拆走了，墙上只剩印子和螺丝；他一个人亮着，一闪一闪 ============ */
FRAMES['7b'] = async (main) => {
  main.fillStyle = '#0C0A14'; main.fillRect(0, 0, NW, NH);
  const L = { g: nc(), G: nc() }, g = L.g;
  brickWall(g, 0, 0, NW, 800, { base: '#262030', seed: 9, bw: 80, bh: 32 });
  // 他的灯牌（大）
  signBoard(g, 260, 170, 520, 560, { wire: 1 });
  neonGuy(L, 520, 690, 360, '#FFB04A', .85, { eyes: 'n', mouth: 'flat', w: 7, gw: 1.6 });
  neonText(L, '营业', 470, 232, 74, '#7AFF9A', 1, { ga: .55 }); neonText(L, '中', 600, 232, 74, '#7AFF9A', .15);
  // "中"字坏了一半（一闪一闪）
  // 她的位置：没晒褪色的一圈印子 + 四颗螺丝 + 剪断的线 + 一张"招租"
  g.save(); g.fillStyle = 'rgba(70,58,82,.65)'; g.beginPath(); g.roundRect(1160, 170, 520, 560, 14); g.fill(); g.restore();
  g.save(); g.strokeStyle = 'rgba(150,130,170,.25)'; g.lineWidth = 3; g.setLineDash([12, 10]); g.beginPath(); g.roundRect(1160, 170, 520, 560, 14); g.stroke(); g.restore();
  [[1178, 188], [1662, 188], [1178, 712], [1662, 712], [1420, 188]].forEach(([sx, sy]) => { g.fillStyle = '#7A7688'; g.beginPath(); g.arc(sx, sy, 7, 0, 7); g.fill(); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(sx - 1, sy + 7, 3, 16); });
  g.strokeStyle = '#141018'; g.lineWidth = 6; g.beginPath(); g.moveTo(1560, 730); g.bezierCurveTo(1570, 790, 1600, 800, 1610, 860); g.stroke(); g.fillStyle = '#C8A040'; g.fillRect(1604, 856, 12, 10); g.fillRect(1604, 870, 12, 6);
  // 招租的纸
  g.save(); g.translate(1420, 470); g.rotate(.06); g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(-116, -66, 240, 150); g.fillStyle = '#E8E0CC'; g.fillRect(-120, -74, 240, 150); g.fillStyle = '#B8202C'; g.font = '700 70px "Noto Serif SC"'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('招 租', 0, -10); g.fillStyle = '#3A3040'; g.font = '700 22px "Noto Serif SC"'; g.fillText('灯牌位 · 有意请联系', 0, 50); g.fillStyle = 'rgba(200,200,220,.7)'; g.fillRect(-20, -82, 40, 14); g.restore();
  // 她留下的一颗粉色的小心（掉在地上，还有一点点亮）
  // 右边远一点：一台亮着的自动贩卖机、一只蹲在下面的猫
  g.fillStyle = '#1A2A4A'; g.fillRect(1760, 360, 170, 440); g.fillStyle = '#C8E8FF'; g.fillRect(1774, 380, 142, 230); for (let r = 0; r < 4; r++) for (let k = 0; k < 4; k++) { g.fillStyle = ['#E0423A', '#5AB8FF', '#FFD54A', '#5ADB7A'][(r + k) % 4]; g.fillRect(1784 + k * 34, 392 + r * 54, 22, 40); }
  L.G.fillStyle = '#9AD0FF'; L.G.globalAlpha = .5; L.G.fillRect(1774, 380, 142, 230); L.G.globalAlpha = 1;
  g.fillStyle = '#0E0C14'; g.beginPath(); g.ellipse(1700, 790, 34, 22, 0, 0, 7); g.fill(); g.beginPath(); g.arc(1722, 760, 18, 0, 7); g.fill(); g.beginPath(); g.moveTo(1710, 748); g.lineTo(1714, 728); g.lineTo(1722, 744); g.moveTo(1726, 744); g.lineTo(1734, 728); g.lineTo(1738, 750); g.fill(); g.strokeStyle = '#0E0C14'; g.lineWidth = 7; g.beginPath(); g.moveTo(1668, 796); g.quadraticCurveTo(1630, 790, 1640, 760); g.stroke(); [1716, 1730].forEach(ex => { g.fillStyle = '#FFE066'; g.fillRect(ex - 2, 756, 5, 4); });
  wallWash(g, 520, 450, 460, 460, '#FFB04A', .3); wallWash(g, 1845, 500, 260, 340, '#9AD0FF', .25);
  wetGround(g, 800, L, { off: 0 });
  tube(L, c => { const x = 1500, y = 900; c.moveTo(x, y + 16); c.bezierCurveTo(x - 22, y, x - 14, y - 16, x, y - 6); c.bezierCurveTo(x + 14, y - 16, x + 22, y, x, y + 16); }, '#FF4A6A', .35, 5);
  neonCompose(main, L);
  rain7(main, 13, 240); main.save(); main.filter = 'blur(6px)'; rain7(main, 18, 16, { s: 10, sv: 14 }); main.restore();
  const v = main.createRadialGradient(NW / 2, NH / 2, NH * .35, NW / 2, NH / 2, NH * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.62)'); main.fillStyle = v; main.fillRect(0, 0, NW, NH);
  const L2 = { g: nc(), G: nc() }; lyric7(L2, '没有你的冬天'); mark7(L2); neonCompose(main, L2);
};

/* ============ 7c：副歌"我承认我是爱情里的废柴"。他灯牌的"营业中"灭了，"打烊了"亮起来；他自己的管子一截截坏掉，只剩眼泪那一点还亮 ============ */
FRAMES['7c'] = async (main) => {
  main.fillStyle = '#0A0812'; main.fillRect(0, 0, NW, NH);
  const L = { g: nc(), G: nc() }, g = L.g;
  brickWall(g, 0, 0, NW, 820, { base: '#201A2A', seed: 21, bw: 96, bh: 38 });
  signBoard(g, 520, 90, 880, 700, { wire: 1 });
  // 大特写：他的灯管坏了好几截
  const x = 960, fy = 760, H = 560, u = H / 28, hy = fy - 21 * u, hr = 6.6 * u, w = 11;
  const flick = [1, .15, 1, .05, .8, 1, .1];
  tube(L, c => { c.ellipse(x, hy, hr, hr * .95, 0, 0, Math.PI * 1.15); }, '#FFB04A', flick[0], w);
  tube(L, c => { c.ellipse(x, hy, hr, hr * .95, 0, Math.PI * 1.15, Math.PI * 1.6); }, '#FFB04A', flick[1], w);
  tube(L, c => { c.ellipse(x, hy, hr, hr * .95, 0, Math.PI * 1.6, Math.PI * 2); }, '#FFB04A', flick[2], w);
  tube(L, c => { c.moveTo(x - hr * .7, hy - hr * .55); c.quadraticCurveTo(x - hr * .2, hy - hr * .2, x + hr * .1, hy - hr * .55); c.quadraticCurveTo(x + hr * .4, hy - hr * .2, x + hr * .75, hy - hr * .5); }, '#FFB04A', flick[3], w);
  tube(L, c => { c.moveTo(x + hr * .05, hy - hr * .95); c.quadraticCurveTo(x - hr * .1, hy - hr * 1.5, x + hr * .5, hy - hr * 1.55); }, '#FFB04A', flick[4], w);
  tube(L, c => { [-1, 1].forEach(sd => { c.moveTo(x + sd * hr * .45 - hr * .17, hy + hr * .1); c.quadraticCurveTo(x + sd * hr * .45, hy + hr * .26, x + sd * hr * .45 + hr * .17, hy + hr * .1); }); }, '#FFB04A', 1, w * .7);
  tube(L, c => { c.arc(x, hy + hr * .78, hr * .2, 1.2 * Math.PI, 1.8 * Math.PI); }, '#FFB04A', 1, w * .7);
  // 眼泪：两滴蓝色的小管，最亮
  [-1, 1].forEach(sd => tube(L, c => { const tx = x + sd * hr * .48, ty = hy + hr * .42; c.moveTo(tx, ty); c.quadraticCurveTo(tx + sd * 10, ty + 30, tx, ty + 44); c.quadraticCurveTo(tx - sd * 10, ty + 30, tx, ty); }, '#7AE0FF', 1, 7));
  tube(L, c => { c.moveTo(x - hr * .9, hy + hr * 1.12); c.quadraticCurveTo(x, hy + hr * 1.35, x + hr * .9, hy + hr * 1.12); c.moveTo(x + hr * .45, hy + hr * 1.25); c.lineTo(x + hr * .55, hy + hr * 2.1); }, '#FF3A4A', .9, w);
  // 身子的管子全灭了：只剩暗暗的玻璃管；胳膊伸向右边一颗也灭了的心
  tube(L, c => { c.moveTo(x - hr * .85, hy + hr * 1.2); c.lineTo(x - hr * 1.1, fy - 2 * u); c.lineTo(x + hr * 1.1, fy - 2 * u); c.lineTo(x + hr * .85, hy + hr * 1.2); c.moveTo(x + hr * .85, hy + hr * 1.5); c.lineTo(x + hr * 1.75, hy + hr * 1.2); c.moveTo(x - hr * .85, hy + hr * 1.5); c.lineTo(x - hr * 1.3, fy - 4 * u); }, '#FFB04A', 0, w);
  tube(L, c => { const cx = 1260, cy = 470; c.moveTo(cx, cy + 70); c.bezierCurveTo(cx - 95, cy, cx - 60, cy - 72, cx, cy - 28); c.bezierCurveTo(cx + 60, cy - 72, cx + 95, cy, cx, cy + 70); }, '#FF4A6A', 0, 10);
  tube(L, c => { const cx = 1260, cy = 470; c.moveTo(cx - 52, cy - 52); c.bezierCurveTo(cx - 82, cy - 30, cx - 70, cy + 10, cx - 40, cy + 34); }, '#FF4A6A', .55, 10, { gw: 2 });
  // 掉下来的火花
  const r = rng(4); for (let i = 0; i < 24; i++) { const sx = x - hr * .9 + r() * 30, sy = hy - hr * .6 + r() * 60 + i * 9; L.g.fillStyle = `rgba(255,${200 + r() * 55},120,${.5 + r() * .5})`; L.g.fillRect(sx - 40 + r() * 40, sy, 3, 3); L.G.fillStyle = '#FFB04A'; L.G.fillRect(sx - 40 + r() * 40, sy, 4, 4); }
  // 灯牌顶上：营业中 → 打烊了
  neonText(L, '营业中', 720, 160, 72, '#7AFF9A', 0);
  neonText(L, '打烊了', 1210, 160, 72, '#FF4A6A', 1, { ga: .6 });
  wallWash(g, 960, 420, 600, 600, '#FF8A3A', .22); wallWash(g, 1250, 160, 300, 180, '#FF4A6A', .3);
  wetGround(g, 820, L);
  neonCompose(main, L);
  rain7(main, 23, 260); main.save(); main.filter = 'blur(7px)'; rain7(main, 28, 20, { s: 12, sv: 14 }); main.restore();
  const v = main.createRadialGradient(NW / 2, NH / 2, NH * .3, NW / 2, NH / 2, NH * 1.05); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(0,0,0,.66)'); main.fillStyle = v; main.fillRect(0, 0, NW, NH);
  const L2 = { g: nc(), G: nc() }; neonText(L2, '我承认我是 爱情里的', NW / 2 - 100, 992, 70, '#FFD9A8', 1, { ga: .5 }); neonText(L2, '废柴', NW / 2 + 360, 988, 96, '#FF4A6A', 1, { ga: .65 }); mark7(L2); neonCompose(main, L2);
};
