'use strict';
/* worlds.js：四座城市的布景（只画环境和 Clawd，不画歌词），烟火、雨、像素地球。
   每个 drawXxx(g, t, o) 都在 1920×1080 的"世界坐标"里作画，可以整屏画，也可以缩进分屏窗格。 */

/* ---------------- 通用布景 ---------------- */
function starField(g, n, seed, x0, x1, y0, y1, t, o = {}) {
  const r = R(seed);
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, r()), y = lerp(y0, y1, r()), s = r() < .12 ? 4 : r() < .5 ? 3 : 2, ph = r() * TAU, sp = 1.5 + r() * 3;
    const a = (o.a ?? .85) * (.35 + .65 * (.5 + .5 * Math.sin(t * sp + ph)));
    g.globalAlpha = a; g.fillStyle = o.col || '#FFFFFF'; g.fillRect(x, y, s, s);
    if (s === 4 && o.cross !== false) { g.globalAlpha = a * .5; g.fillRect(x - 3, y + 1, 10, 2); g.fillRect(x + 1, y - 3, 2, 10); }
  }
  g.globalAlpha = 1;
}
/* 像素台阶状的山脊 */
function ridge(g, seed, y, amp, col, step = 24, x0 = -300, x1 = W + 300, bottom = H + 400) {
  const r = R(seed); let h = 0;
  g.fillStyle = col; g.beginPath(); g.moveTo(x0, bottom);
  for (let x = x0; x <= x1 + step; x += step) {
    h += (r() - .5) * amp * .55; h *= .93;
    const yy = Math.round((y - Math.abs(Math.sin(x * .0023 + seed) * amp * .6) + h) / 6) * 6;
    g.lineTo(x, yy); g.lineTo(x + step, yy);
  }
  g.lineTo(x1 + step, bottom); g.closePath(); g.fill();
}
/* 一排楼：wins 为窗户颜色数组 */
function blocks(g, seed, x0, x1, base, hMin, hMax, col, wins, t, o = {}) {
  const r = R(seed); let x = x0;
  while (x < x1) {
    const w = Math.round((o.wMin || 50) + r() * ((o.wMax || 120) - (o.wMin || 50))), h = Math.round(hMin + r() * (hMax - hMin));
    g.fillStyle = col; g.fillRect(x, base - h, w, h + 2);
    if (wins) {
      const cw = o.cw || 8, chh = o.ch || 10, gx = o.gx || 16, gy = o.gy || 20;
      for (let yy = base - h + 14; yy < base - 10; yy += gy) for (let xx = x + 8; xx < x + w - 10; xx += gx) {
        const hv = hash(xx | 0, yy | 0, seed);
        if (hv > (o.p ?? .45)) continue;
        const fl = o.flicker ? (.7 + .3 * Math.sin(t * (2 + hv * 5) + hv * 40)) : 1;
        g.globalAlpha = (.45 + hv * .9) * fl; g.fillStyle = wins[Math.floor(hv * 97) % wins.length]; g.fillRect(xx, yy, cw, chh);
      }
      g.globalAlpha = 1;
    }
    x += w + Math.round(r() * (o.gap || 10));
  }
}

/* ---------------- 烟火 ---------------- */
function rocket(g, t, t0, t1, x0, y0, x1, y1, col) {
  if (t < t0 || t >= t1) return;
  const u = E.out(seg(t, t0, t1));
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 10; k++) {
    const uu = Math.max(0, u - k * .025), x = lerp(x0, x1, uu) + Math.sin(uu * 30 + k) * 2, y = lerp(y0, y1, uu);
    g.globalAlpha = (1 - k / 10) * .9; g.fillStyle = k ? col : '#FFFFFF'; const s = k ? 5 - k * .35 : 7; g.fillRect(x - s / 2, y - s / 2, s, s);
  }
  g.restore();
}
/* 普通烟花：球形炸开 */
function burst(g, t, t0, x, y, o = {}) {
  const life = o.life || 1.5, dt = t - t0; if (dt < 0 || dt > life) return;
  const n = o.n || 46, rad = o.rad || 210, col = o.col || '#FFD36B', seed = o.seed || 1;
  g.save(); g.globalCompositeOperation = 'lighter';
  if (dt < .12) { const a = 1 - dt / .12; const gr = g.createRadialGradient(x, y, 0, x, y, rad * .8); gr.addColorStop(0, `rgba(255,240,210,${.55 * a})`); gr.addColorStop(1, 'rgba(255,240,210,0)'); g.fillStyle = gr; g.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + hash(i, seed) * .25, v = rad * (.7 + .3 * hash(i, seed + 1));
    for (let k = 0; k < 3; k++) {
      const d = Math.max(0, dt - k * .035), q = 1 - Math.exp(-4.2 * d);
      const px = x + Math.cos(a) * v * q, py = y + Math.sin(a) * v * q + 60 * d * d;
      const al = Math.pow(1 - dt / life, 1.4) * (k ? .45 / k : 1) * (dt > life * .6 ? .6 + .4 * Math.sin(dt * 50 + i) : 1);
      g.globalAlpha = al; g.fillStyle = k ? col : (o.core || '#FFF6DE'); const s = k ? 5 : 6; g.fillRect(px - s / 2, py - s / 2, s, s);
    }
  }
  g.restore();
}
/* 烟花炸成一个字 */
function glyphFirework(g, t, t0, ch, x, y, px, col, o = {}) {
  const rise = o.rise ?? .44;
  if (t < t0 - rise) return;
  if (t < t0) { rocket(g, t, t0 - rise, t0, o.lx ?? x, o.ly ?? 980, x, y, col); return; }
  const pts = glyphPoints(ch, px, o.step || 9), dt = t - t0, hold = o.hold ?? .7;
  g.save(); g.globalCompositeOperation = 'lighter';
  if (dt < .16) { const a = 1 - dt / .16; const gr = g.createRadialGradient(x, y, 0, x, y, px); gr.addColorStop(0, `rgba(255,245,220,${.75 * a})`); gr.addColorStop(1, 'rgba(255,245,220,0)'); g.fillStyle = gr; g.fillRect(x - px, y - px, px * 2, px * 2); }
  for (let i = 0; i < pts.length; i++) {
    const [tx, ty] = pts[i], h1 = hash(i, 11), h2 = hash(i, 17), h3 = hash(i, 23);
    const form = E.out5(clamp(dt / (.3 + h1 * .14))), ov = 1 + .1 * Math.sin(clamp(dt / .45) * Math.PI);
    let qx = x + tx * form * ov, qy = y + ty * form * ov;
    const fall = Math.max(0, dt - hold);
    qy += fall * fall * (70 + h2 * 140); qx += fall * (h3 - .5) * 50;
    const a = clamp(1 - fall * 1.05) * (.72 + .28 * Math.sin(dt * 38 + i * 1.7));
    if (a <= .01) continue;
    g.globalAlpha = a * .38; g.fillStyle = col; g.fillRect(qx - 5.5, qy - 5.5, 11, 11);
    g.globalAlpha = a; g.fillStyle = o.core || '#FFF7E2'; g.fillRect(qx - 2.6, qy - 2.6, 5.2, 5.2);
  }
  g.restore();
}

/* ---------------- 台北：跨年夜，象山看 101 ---------------- */
const TPE_BURSTS = [
  [6.42, 1520, 330, '#FF6FA8', 170, 3], [6.95, 1180, 260, '#7FE3FF', 150, 4], [7.62, 1640, 210, '#FFD36B', 210, 5],
  [8.06, 1050, 380, '#B98CFF', 140, 6], [8.50, 1700, 420, '#FF6FA8', 160, 7],
  [9.70, 1470, 130, '#7FE3FF', 170, 8], [9.84, 1860, 520, '#FFD36B', 170, 9],
];
// 分屏时背景里持续放的烟花
for (let k = 0; k < 16; k++) TPE_BURSTS.push([13.3 + k * BEAT * 1.0 + (k % 3) * .07, 900 + hash(k, 2) * 900, 170 + hash(k, 3) * 260, ['#FF6FA8', '#7FE3FF', '#FFD36B', '#B98CFF'][k % 4], 140 + hash(k, 4) * 90, 20 + k]);
function taipei101(g, x, base, t, o = {}) {
  const segH = 58, n = 8, top = base - 150 - n * segH;
  const body = '#24305E', edge = '#4A5C9A';
  // 底座
  g.fillStyle = body; poly(g, [[x - 92, base], [x + 92, base], [x + 70, base - 150], [x - 70, base - 150]]); g.fill();
  g.fillStyle = edge; g.fillRect(x - 72, base - 150, 144, 6);
  // 八节
  for (let i = 0; i < n; i++) {
    const y1 = base - 150 - i * segH, y0 = y1 - segH;
    g.fillStyle = body; poly(g, [[x - 58, y1], [x + 58, y1], [x + 74, y0 + 6], [x - 74, y0 + 6]]); g.fill();
    g.fillStyle = edge; g.fillRect(x - 74, y0 + 4, 148, 5);
    // 每节的灯带
    const lit = .55 + .45 * Math.sin(t * 2 + i * .7);
    g.globalAlpha = lit; g.fillStyle = o.light || '#7DF0C8';
    for (let k = -2; k <= 2; k++) g.fillRect(x + k * 22 - 4, y0 + 22, 8, 16);
    g.globalAlpha = 1;
  }
  // 顶部与塔尖
  g.fillStyle = body; g.fillRect(x - 38, top - 40, 76, 40); g.fillRect(x - 24, top - 78, 48, 38);
  g.fillStyle = edge; g.fillRect(x - 6, top - 170, 12, 92);
  g.fillStyle = '#FF5A5A'; g.globalAlpha = .5 + .5 * Math.sin(t * 6); g.fillRect(x - 5, top - 176, 10, 10); g.globalAlpha = 1;
  return top;
}
/* 101 每一节向两侧喷火花（真实的台北跨年就是这样放） */
function towerSparks(g, t, t0, x, base, col) {
  const dt = t - t0; if (dt < 0 || dt > 1.1) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 8; i++) {
    const y = base - 150 - i * 58 - 30;
    for (const side of [-1, 1]) for (let k = 0; k < 7; k++) {
      const v = 120 + hash(i, k, side + 3) * 160, a = -.35 + hash(i, k, 9) * .7;
      const q = 1 - Math.exp(-4 * dt), px = x + side * (74 + Math.cos(a) * v * q), py = y + Math.sin(a) * v * q + 70 * dt * dt;
      g.globalAlpha = Math.pow(1 - dt / 1.1, 1.3); g.fillStyle = k % 2 ? col : '#FFF4D6'; g.fillRect(px - 2.5, py - 2.5, 5, 5);
    }
  }
  g.restore();
}
function drawTaipei(g, t, o = {}) {
  g.fillStyle = vgrad(g, -100, 860, [[0, '#060920'], [.5, '#121947'], [1, '#3A2B6C']]); g.fillRect(-400, -400, W + 800, H + 800);
  starField(g, 150, 21, -300, W + 300, -200, 640, t);
  // 烟花把天空映亮
  let glow = 0; for (const b of TPE_BURSTS) { const d = t - b[0]; if (d > 0 && d < .5) glow = Math.max(glow, (1 - d / .5) * .16); }
  for (const tt of [ct(0, 8), ct(0, 9)]) { const d = t - tt; if (d > 0 && d < .6) glow = Math.max(glow, (1 - d / .6) * .3); }
  if (glow > 0) { g.fillStyle = `rgba(255,190,150,${glow})`; g.fillRect(-400, -400, W + 800, H + 800); }
  ridge(g, 3, 690, 120, '#1A1F4E', 30);
  ridge(g, 4, 760, 70, '#141842', 24);
  blocks(g, 31, -200, W + 200, 830, 40, 170, '#0F1335', ['#FFD27A', '#FFE7B0', '#9FD8FF'], t, { p: .4, flicker: true });
  taipei101(g, 1350, 840, t);
  blocks(g, 32, 1080, 1600, 860, 30, 90, '#0B0E2A', ['#FFD27A'], t, { p: .3 });
  // 烟花：普通的、101 喷的、炸成字的
  for (const [t0, x, y, col, rad, seed] of TPE_BURSTS) {
    if (t > t0 - .5 && t < t0) rocket(g, t, t0 - .45, t0, x + (hash(seed) - .5) * 60, 900, x, y, col);
    burst(g, t, t0, x, y, { col, rad, seed });
  }
  towerSparks(g, t, ct(0, 9), 1350, 840, '#FFD36B');
  glyphFirework(g, t, ct(0, 8), '烟', 1075, 255, 270, '#FF7FB0', { lx: 1110, ly: 860, step: 9 });
  glyphFirework(g, t, ct(0, 9), '火', 1660, 265, 270, '#FFD36B', { lx: 1620, ly: 860, step: 9 });
  // 象山（前景）
  g.fillStyle = '#090B22';
  g.beginPath(); g.moveTo(-300, H + 300); g.lineTo(-300, 860);
  for (let x = -300; x <= 1120; x += 20) { const yy = 905 - Math.max(0, Math.cos((x - 520) / 520 * 1.4)) * 70 + Math.sin(x * .05) * 4; g.lineTo(x, Math.round(yy / 5) * 5); }
  g.lineTo(1120, H + 300); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(120,110,210,.45)'; g.lineWidth = 3; g.beginPath();
  for (let x = -300; x <= 1100; x += 20) { const yy = 905 - Math.max(0, Math.cos((x - 520) / 520 * 1.4)) * 70 + Math.sin(x * .05) * 4; x > -300 ? g.lineTo(x, Math.round(yy / 5) * 5) : g.moveTo(x, Math.round(yy / 5) * 5); }
  g.stroke();
  for (let i = 0; i < 14; i++) { const x = 100 + i * 70 + hash(i, 4) * 30, y = 905 - Math.max(0, Math.cos((x - 520) / 520 * 1.4)) * 70; g.fillStyle = '#0E1230'; g.fillRect(x, y - 14, 6, 14); g.fillRect(x + 8, y - 9, 6, 9); }
  // Clawd A：坐在山头看烟火
  const bp = beatPulse(t, 8);
  let ey = 'look', look = [1, 0];
  if (t > ct(0, 7)) { ey = 'up'; look = [.6, 0]; }
  if (t > ct(0, 8) && t < ct(0, 8) + .3 || t > ct(0, 9)) ey = 'star';
  const jump = t > ct(0, 3) && t < ct(0, 3) + .35 ? Math.sin(seg(t, ct(0, 3), ct(0, 3) + .35) * Math.PI) * 26 : 0;
  clawd(g, 560, 840, 12, { t, eyes: ey, look, sq: bp * .05, lift: jump, armR: t > ct(0, 9) ? .9 * (.5 + .5 * Math.sin(t * 16)) : 0, shadowCol: 'rgba(0,0,0,.4)', ...(o.clawd || {}) });
  if (o.marks !== false) marks(g, 560 + 30, 840 - 175, '!', t, ct(0, 8) + .02, { until: ct(0, 8) + .5 });
}

/* ---------------- 上海：外滩屋顶酒吧 ---------------- */
function pearlTower(g, x, base, t) {
  const col = '#3A2860', sp = '#FF4FA3';
  g.fillStyle = col;
  // 三根斜柱
  poly(g, [[x - 70, base], [x - 52, base], [x - 8, base - 170], [x - 20, base - 170]]); g.fill();
  poly(g, [[x + 70, base], [x + 52, base], [x + 8, base - 170], [x + 20, base - 170]]); g.fill();
  g.fillRect(x - 9, base - 400, 18, 400);
  g.fillRect(x - 22, base - 400, 9, 250); g.fillRect(x + 13, base - 400, 9, 250);
  const ball = (cy, r, c) => {
    const gr = g.createRadialGradient(x - r * .35, cy - r * .35, r * .1, x, cy, r);
    gr.addColorStop(0, '#FFC2E0'); gr.addColorStop(.45, c); gr.addColorStop(1, '#8A1D5C');
    g.fillStyle = gr; circ(g, x, cy, r); g.fill();
    g.fillStyle = 'rgba(255,255,255,.85)';
    for (let k = 0; k < 9; k++) { const a = k / 9 * TAU + t * .8; if (Math.cos(a) > -.2) g.fillRect(x + Math.sin(a) * r * .8 - 2, cy - 2, 4, 4); }
  };
  ball(base - 175, 58, sp);
  ball(base - 395, 44, sp);
  g.fillStyle = col; g.fillRect(x - 5, base - 470, 10, 30);
  ball(base - 478, 14, '#FF7DBE');
  g.fillStyle = '#C9B8FF'; g.fillRect(x - 3, base - 570, 6, 92);
}
function drawShanghai(g, t, o = {}) {
  g.fillStyle = vgrad(g, -100, 700, [[0, '#120726'], [.55, '#3A1250'], [1, '#86306E']]); g.fillRect(-400, -400, W + 800, H + 800);
  starField(g, 40, 41, -300, W + 300, -200, 360, t, { a: .5 });
  const B = 650;
  blocks(g, 51, -200, W + 200, B, 60, 200, '#24143F', ['#5FD4FF', '#FF7DC7', '#FFE7A0'], t, { p: .32, flicker: true });
  // 金茂（台阶状）
  g.fillStyle = '#2A2050'; let y = B, w = 70;
  for (let i = 0; i < 9; i++) { const h = 46 - i * 2; g.fillRect(1060 - w / 2, y - h, w, h); y -= h; w -= 6; }
  g.fillRect(1057, y - 60, 6, 60);
  // 环球金融中心（开瓶器）
  g.fillStyle = '#2C2F62'; poly(g, [[1120, B], [1220, B], [1208, 175], [1132, 175]]); g.fill();
  g.fillStyle = '#5A2A6E'; poly(g, [[1148, 230], [1192, 230], [1186, 196], [1154, 196]]); g.fill();
  // 上海中心（扭转）
  g.fillStyle = '#26315F'; g.beginPath(); g.moveTo(1250, B); g.lineTo(1365, B);
  g.quadraticCurveTo(1345, 380, 1326, 112); g.lineTo(1296, 104); g.quadraticCurveTo(1280, 380, 1250, B); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(95,212,255,.75)'; g.lineWidth = 4; g.beginPath(); g.moveTo(1266, B - 10); g.quadraticCurveTo(1320, 380, 1300, 120); g.stroke();
  pearlTower(g, 880, B, t);
  blocks(g, 52, -200, W + 200, B + 4, 20, 70, '#1B0F33', ['#FF7DC7', '#5FD4FF'], t, { p: .3, wMin: 40, wMax: 90 });
  // 黄浦江与倒影
  g.fillStyle = vgrad(g, B, 800, [[0, '#2A0E3C'], [1, '#12061E']]); g.fillRect(-400, B, W + 800, 400);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [x, col, w] of [[880, '#FF4FA3', 26], [1310, '#5FD4FF', 18], [1170, '#9C7BFF', 16], [1060, '#FFD27A', 14], [300, '#FF7DC7', 10], [560, '#5FD4FF', 12], [1750, '#FFE7A0', 10]]) {
    for (let k = 0; k < 9; k++) {
      const yy = B + 10 + k * 15, dx = Math.sin(t * 3 + k * 1.3 + x) * 8;
      g.globalAlpha = .32 * (1 - k / 10); g.fillStyle = col; g.fillRect(x - w / 2 + dx, yy, w, 6);
    }
  }
  g.restore();
  // 串灯
  for (let i = 0; i < 26; i++) {
    const x = -40 + i * 80, yy = 70 + Math.sin(i / 25 * Math.PI) * 60;
    g.fillStyle = 'rgba(255,220,150,.25)'; circ(g, x, yy, 12); g.fill();
    g.fillStyle = (i + Math.floor(t / BEAT)) % 3 ? '#FFE3A3' : '#FF9BD0'; g.fillRect(x - 4, yy - 4, 8, 8);
  }
  g.strokeStyle = 'rgba(0,0,0,.5)'; g.lineWidth = 2; g.beginPath();
  for (let i = 0; i < 26; i++) { const x = -40 + i * 80, yy = 66 + Math.sin(i / 25 * Math.PI) * 60; i ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke();
  // 霓虹招牌 Mojito：唱到 Mo / ji / to 时一段段点亮
  neonMojito(g, t, 1640, 330);
  // Clawd B（戴墨镜）坐在吧台后
  const sipT = ct(1, 7), sip = t > sipT && t < sipT + .9;
  const bp = beatPulse(t, 8);
  const ey = sip ? 'closed' : 'normal';
  clawd(g, 1290, 872, 15, { t, eyes: ey, shades: !sip, sq: bp * .05, armR: sip ? 1 : 0, blush: sip ? .9 : 0, shadow: false, ...(o.clawd || {}) });
  if (o.marks !== false) marks(g, 1290 + 40, 872 - 205, '♥', t, sipT + .25, { until: sipT + .9, col: '#FF7DC7', s: 1.1 });
  // 吧台
  g.fillStyle = '#3B2238'; g.fillRect(860, 846, 1200, 26);
  g.fillStyle = '#FF5FA2'; g.globalAlpha = .9; g.fillRect(860, 870, 1200, 4); g.globalAlpha = 1;
  g.fillStyle = vgrad(g, 874, 1080, [[0, '#2A1530'], [1, '#160A1A']]); g.fillRect(860, 874, 1200, 300);
  g.fillStyle = 'rgba(255,255,255,.04)'; for (let x = 880; x < 2000; x += 64) g.fillRect(x, 878, 4, 260);
  mojitoGlass(g, 1500, 846, t, sipT);
}
function neonMojito(g, t, x, y) {
  const parts = [['Mo', ct(1, 8)], ['ji', ct(1, 9)], ['to', ct(1, 10)]];
  g.save(); g.translate(x, y); g.rotate(-.07);
  g.font = F(128, 'script'); g.textAlign = 'left'; g.textBaseline = 'middle';
  const full = g.measureText('Mojito').width; let cx = -full / 2;
  // 招牌底板
  rr(g, -full / 2 - 46, -100, full + 92, 182, 26); g.fillStyle = 'rgba(20,6,30,.55)'; g.fill();
  g.strokeStyle = 'rgba(255,95,162,.35)'; g.lineWidth = 4; g.stroke();
  for (const [s, t0] of parts) {
    const w = g.measureText(s).width;
    const on = t > t0, fl = on ? (t - t0 < .18 ? (Math.floor((t - t0) * 40) % 2 ? .25 : 1) : .92 + .08 * Math.sin(t * 23)) : 0;
    g.lineWidth = 7; g.strokeStyle = 'rgba(60,240,176,.16)'; g.strokeText(s, cx, 0);
    if (fl > 0) {
      g.save(); g.globalAlpha = fl;
      g.shadowColor = '#3CF0B0'; g.shadowBlur = 38; g.strokeStyle = '#7DFFD0'; g.lineWidth = 8; g.strokeText(s, cx, 0);
      g.shadowBlur = 12; g.strokeStyle = '#E8FFF6'; g.lineWidth = 3; g.strokeText(s, cx, 0);
      g.restore();
    }
    cx += w;
  }
  // 小小的中文注音
  const a = clamp((t - ct(1, 10)) / .2);
  if (a > 0) { g.globalAlpha = a; g.font = F(32, 'bold'); g.fillStyle = '#FFB3D6'; g.textAlign = 'center'; g.fillText('莫 吉 托', 0, 94); }
  g.restore();
}
function mojitoGlass(g, x, base, t, sipT) {
  const w = 96, h = 176, top = base - h;
  const level = 1 - .4 * E.io(seg(t, sipT + .1, sipT + .8));
  g.save();
  // 杯中液体
  const ly = base - 10 - (h - 30) * level;
  g.fillStyle = 'rgba(190,255,214,.55)'; g.fillRect(x - w / 2 + 6, ly, w - 12, base - 10 - ly);
  // 冰块、薄荷、气泡
  for (let k = 0; k < 4; k++) { const yy = Math.max(ly + 8, base - 50 - k * 34); g.fillStyle = 'rgba(255,255,255,.45)'; g.fillRect(x - 30 + (k % 2) * 26, yy, 30, 26); }
  g.fillStyle = '#2FBF6A'; for (let k = 0; k < 5; k++) { const yy = base - 30 - k * 26; if (yy < ly) continue; g.fillRect(x - 20 + (k % 3) * 14, yy, 16, 10); g.fillRect(x - 14 + (k % 3) * 14, yy - 6, 8, 6); }
  for (let k = 0; k < 6; k++) { const ph = (t * .9 + k * .17) % 1, yy = lerp(base - 20, ly + 6, ph); if (yy > ly) { g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(x - 30 + hash(k) * 60, yy, 4, 4); } }
  // 杯壁
  g.strokeStyle = 'rgba(230,255,245,.8)'; g.lineWidth = 5; g.strokeRect(x - w / 2, top, w, h);
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x - w / 2 + 8, top + 10, 8, h - 20);
  // 青柠片与吸管
  g.fillStyle = '#9BE15D'; g.beginPath(); g.arc(x + w / 2 - 8, top + 4, 26, Math.PI * .95, Math.PI * 1.95); g.closePath(); g.fill();
  g.fillStyle = '#E7F7C8'; g.beginPath(); g.arc(x + w / 2 - 8, top + 4, 18, Math.PI * .95, Math.PI * 1.95); g.closePath(); g.fill();
  g.save(); g.translate(x - 10, top + 60); g.rotate(-.42);
  for (let k = 0; k < 9; k++) { g.fillStyle = k % 2 ? '#FFFFFF' : '#FF4FA3'; g.fillRect(-6, -k * 18, 12, 18); }
  g.restore();
  g.restore();
}

/* ---------------- 柏林：下大雨 ---------------- */
let rainSprite = null;
function rainGlyph() {
  if (rainSprite) return rainSprite;
  const c = mk(80, 80), g = c.getContext('2d');
  g.font = F(64, 'black'); g.fillStyle = '#A8D4FF'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('雨', 40, 42);
  return (rainSprite = c);
}
function fernsehturm(g, x, base, t) {
  const col = '#3B4A5C';
  g.fillStyle = col; poly(g, [[x - 60, base], [x + 60, base], [x + 22, base - 160], [x - 22, base - 160]]); g.fill();
  g.fillRect(x - 18, base - 470, 36, 320);
  const cy = base - 500;
  const gr = g.createRadialGradient(x - 22, cy - 24, 6, x, cy, 64);
  gr.addColorStop(0, '#DCE6F0'); gr.addColorStop(.6, '#8C9BAD'); gr.addColorStop(1, '#4E5B6B');
  g.fillStyle = gr; circ(g, x, cy, 64); g.fill();
  g.fillStyle = '#2A3442'; g.fillRect(x - 64, cy + 6, 128, 14);
  g.fillStyle = 'rgba(255,214,140,.85)'; for (let k = -5; k <= 5; k++) g.fillRect(x + k * 11 - 3, cy + 9, 6, 7);
  g.fillStyle = col; g.fillRect(x - 11, cy - 120, 22, 60);
  for (let k = 0; k < 7; k++) { g.fillStyle = k % 2 ? '#F2F2F2' : '#E8473B'; g.fillRect(x - 6, cy - 120 - (k + 1) * 22, 12, 22); }
  g.fillStyle = '#FF4A4A'; g.globalAlpha = .4 + .6 * (Math.sin(t * 5) > 0); g.fillRect(x - 6, cy - 290, 12, 12); g.globalAlpha = 1;
}
function umbrella(g, x, rimY, p, col, o = {}) {
  // x：伞柄那条竖线；rimY：伞沿。伞面是一个像素台阶的圆顶，分成六片
  g.save(); g.translate(x, rimY); g.rotate(o.rot || 0);
  const len = o.len || 6, Rd = o.r || 15, rows = 7, dark = o.dark || '#B8322A';
  g.fillStyle = '#2B2B2B'; g.fillRect(-.35 * p, -.5 * p, .7 * p, (len + .5) * p);
  g.fillRect(-.35 * p, len * p, 1.9 * p, .7 * p); g.fillRect(1.2 * p, (len - 1.1) * p, .7 * p, 1.8 * p);
  for (let i = 0; i < rows; i++) {
    const yy = -(rows - i) * 1.1 * p, f = (rows - i - .5) / rows, hw = Math.max(1.3, Rd * Math.sqrt(Math.max(0, 1 - f * f)));
    for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? dark : col; g.fillRect((-hw + k * hw / 3) * p, yy, hw / 3 * p + .6, 1.15 * p); }
  }
  for (let k = 0; k < 6; k++) { g.fillStyle = k % 2 ? dark : col; const x0 = -Rd + k * Rd / 3; g.fillRect((x0 + .5) * p, 0, (Rd / 3 - 1) * p, .7 * p); }
  g.fillStyle = 'rgba(255,255,255,.22)'; g.fillRect(-Rd * .55 * p, -6.4 * p, 2.2 * p, 1 * p);
  g.fillStyle = '#2B2B2B'; g.fillRect(-.4 * p, -(rows * 1.1 + 1.3) * p, .8 * p, 1.5 * p);
  g.restore();
}
function drawBerlin(g, t, o = {}) {
  const heavy = clamp((t - ct(4, 8)) / .4);   // "大雨" 之后雨更大
  g.fillStyle = vgrad(g, -100, 800, [[0, '#0E151F'], [.6, '#1D2938'], [1, '#33475C']]); g.fillRect(-400, -400, W + 800, H + 800);
  // 低低的云
  g.fillStyle = 'rgba(12,18,26,.65)';
  for (let i = 0; i < 9; i++) { const x = ((i * 290 + t * 18) % 2600) - 340, y = 60 + hash(i, 2) * 160; for (let k = 0; k < 5; k++) g.fillRect(x + k * 50 - hash(i, k) * 30, y - k % 2 * 24, 160 + hash(i, k + 3) * 120, 48); }
  ridge(g, 8, 760, 40, '#1C2633', 40);
  blocks(g, 61, -200, W + 200, 790, 120, 300, '#202B38', ['#F2DCA0', '#FFE9BA'], t, { p: .42, wMin: 140, wMax: 260, cw: 14, ch: 14, gx: 30, gy: 32 });
  fernsehturm(g, 1430, 800, t);
  blocks(g, 62, -200, W + 200, 820, 50, 160, '#161E28', ['#F2DCA0'], t, { p: .35, wMin: 120, wMax: 220, cw: 12, ch: 12, gx: 28, gy: 30 });
  // 湿漉漉的街
  g.fillStyle = vgrad(g, 820, 1080, [[0, '#1B232E'], [1, '#0B0F15']]); g.fillRect(-400, 820, W + 800, 700);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [x, col, w] of [[1430, '#FFB070', 30], [980, '#FFD38A', 40], [300, '#F2DCA0', 16], [1750, '#F2DCA0', 18]]) {
    for (let k = 0; k < 12; k++) { g.globalAlpha = .16 * (1 - k / 12); g.fillStyle = col; g.fillRect(x - w / 2 + Math.sin(t * 4 + k) * 4, 830 + k * 18, w, 10); }
  }
  g.restore();
  // 路灯
  g.fillStyle = '#1E2630'; g.fillRect(974, 520, 12, 310); g.fillRect(950, 512, 60, 16);
  const lg = g.createRadialGradient(980, 540, 4, 980, 540, 220); lg.addColorStop(0, 'rgba(255,214,140,.55)'); lg.addColorStop(1, 'rgba(255,214,140,0)');
  g.fillStyle = lg; g.fillRect(760, 320, 440, 440); g.fillStyle = '#FFE2A8'; g.fillRect(958, 528, 44, 10);
  // 雨："雨" 字落下来
  const spr = rainGlyph(), n = Math.round(70 + heavy * 120), sp = 1 + heavy * .6;
  for (let i = 0; i < n; i++) {
    const v = (560 + hash(i, 2) * 420) * sp, ph = hash(i, 3) * 1400, yy = ((t * v + ph) % 1400) - 200, x0 = hash(i, 1) * 2400 - 300;
    const s = 22 + hash(i, 4) * 30, xx = x0 - yy * .16;
    g.globalAlpha = .28 + hash(i, 5) * .4; g.drawImage(spr, xx - s / 2, yy - s / 2, s, s);
  }
  g.globalAlpha = 1;
  g.strokeStyle = 'rgba(170,205,240,.35)'; g.lineWidth = 2; g.beginPath();
  for (let i = 0; i < 160 + heavy * 140; i++) {
    const v = 1300 + hash(i, 7) * 500, yy = ((t * v + hash(i, 8) * 1400) % 1400) - 200, xx = hash(i, 9) * 2400 - 300 - yy * .16;
    g.moveTo(xx, yy); g.lineTo(xx - 6, yy + 34);
  }
  g.stroke();
  // 水花
  for (let i = 0; i < 26 + heavy * 30; i++) {
    const per = .5 + hash(i, 10) * .4, ph = ((t + hash(i, 11) * per) % per) / per, x = hash(i, 12) * 1960 - 20, y = 850 + hash(i, 13) * 210;
    g.strokeStyle = `rgba(190,220,250,${.45 * (1 - ph)})`; g.lineWidth = 2; ell(g, x, y, 4 + ph * 22, 1.5 + ph * 5); g.stroke();
  }
  // Clawd A 打着红伞走路
  const walk = t * 1.6;
  const bob = Math.abs(Math.sin(walk * Math.PI)) * 6;
  const ey = t > ct(4, 9) ? 'wide' : t > ct(4, 7) ? 'up' : 'normal';
  const cx0 = 1100, p = 11, hit = t > ct(4, 9) ? Math.sin((t - ct(4, 9)) * 30) * .07 * Math.exp(-(t - ct(4, 9)) * 4) : 0;
  clawd(g, cx0, 850 - bob * .3, p, { t, walk, eyes: ey, look: [0, 0], armR: 1, shadowCol: 'rgba(0,0,0,.45)' });
  umbrella(g, cx0 + 7 * p, 850 - 13 * p - bob, p, '#E8473B', { rot: -.1 + Math.sin(t * 3) * .03 + hit });
}

/* ---------------- 蒙古：草原与星空 ---------------- */
function yurt(g, x, base, t) {
  g.fillStyle = '#F1ECDF'; g.fillRect(x - 150, base - 104, 300, 104);
  g.fillStyle = '#B83A2E'; g.fillRect(x - 150, base - 104, 300, 16);
  g.fillStyle = '#F2C230'; for (let k = 0; k < 15; k++) g.fillRect(x - 145 + k * 20, base - 100, 8, 8);
  g.fillStyle = '#E6DFCF'; poly(g, [[x - 162, base - 100], [x + 162, base - 100], [x + 40, base - 182], [x - 40, base - 182]]); g.fill();
  g.strokeStyle = 'rgba(150,130,110,.5)'; g.lineWidth = 3; for (let k = -4; k <= 4; k++) { g.beginPath(); g.moveTo(x + k * 9, base - 182); g.lineTo(x + k * 38, base - 102); g.stroke(); }
  g.fillStyle = '#C9BFAE'; g.fillRect(x - 40, base - 190, 80, 10);
  // 门与暖光
  const lg = g.createRadialGradient(x, base - 40, 6, x, base - 40, 160); lg.addColorStop(0, 'rgba(255,190,110,.5)'); lg.addColorStop(1, 'rgba(255,190,110,0)');
  g.fillStyle = lg; g.fillRect(x - 160, base - 200, 320, 260);
  g.fillStyle = '#B83A2E'; g.fillRect(x - 30, base - 76, 60, 76);
  g.fillStyle = '#FFCB7A'; g.fillRect(x - 20, base - 66, 40, 66);
  // 烟
  for (let k = 0; k < 6; k++) { const ph = (t * .35 + k / 6) % 1; g.fillStyle = `rgba(220,220,235,${.3 * (1 - ph)})`; const s = 14 + ph * 30; g.fillRect(x + 20 + Math.sin(ph * 6 + k) * 16 - s / 2, base - 196 - ph * 170, s, s); }
}
function drawMongolia(g, t, o = {}) {
  const up = o.up || 0;   // 0..1：镜头抬向天空
  g.save(); g.translate(0, up * 1150);
  g.fillStyle = vgrad(g, -1200, 780, [[0, '#03040F'], [.45, '#0D1336'], [.75, '#2A2462'], [.9, '#7A4378'], [1, '#F0905E']]); g.fillRect(-400, -1300, W + 800, 2300);
  // 银河
  g.save(); g.translate(960, -250); g.rotate(-.42);
  const mw = g.createLinearGradient(0, -260, 0, 260); mw.addColorStop(0, 'rgba(150,140,255,0)'); mw.addColorStop(.5, 'rgba(190,180,255,.16)'); mw.addColorStop(1, 'rgba(150,140,255,0)');
  g.fillStyle = mw; g.fillRect(-1700, -260, 3400, 520);
  starField(g, 260, 77, -1700, 1700, -150, 150, t, { a: .6, cross: false });
  g.restore();
  starField(g, 260 + up * 200, 71, -300, W + 300, -1250, 640, t);
  // 远山与草原
  ridge(g, 12, 730, 50, '#2C2550', 40);
  ridge(g, 13, 765, 26, '#1F1B3C', 30);
  g.fillStyle = vgrad(g, 770, 1080, [[0, '#24402F'], [1, '#0F2117']]); g.fillRect(-400, 770, W + 800, 800);
  for (let i = 0; i < 80; i++) { const x = hash(i, 1) * 2000 - 40, y = 790 + hash(i, 2) * 280, s = 4 + hash(i, 3) * 6; g.fillStyle = hash(i, 4) > .5 ? '#2E5A3E' : '#1A3626'; g.fillRect(x, y - s * 2, s, s * 2); g.fillRect(x + s * 1.3, y - s * 1.4, s, s * 1.4); }
  yurt(g, 430, 845, t);
  // Clawd B 坐在草地上看天
  const ey = t > ct(5, 7) ? 'star' : 'up';
  clawd(g, 1220, 905, 12, { t, eyes: ey, look: [0, 0], scarf: '#6EC6FF', sq: beatPulse(t, 8) * .04, shadowCol: 'rgba(0,0,0,.4)' });
  g.restore();
}

/* ---------------- 像素地球 ---------------- */
const LAND = [
  [[-168, 66], [-162, 70], [-140, 70], [-125, 72], [-95, 75], [-80, 73], [-65, 62], [-55, 52], [-66, 45], [-70, 42], [-76, 35], [-81, 31], [-80, 25], [-83, 29], [-90, 30], [-97, 27], [-97, 22], [-105, 20], [-110, 23], [-115, 30], [-118, 34], [-124, 40], [-124, 48], [-130, 55], [-140, 60], [-152, 58], [-165, 60]],
  [[-105, 20], [-97, 18], [-92, 15], [-87, 13], [-83, 9], [-79, 8], [-77, 8], [-80, 10], [-84, 15], [-88, 17], [-90, 21], [-87, 21], [-91, 19], [-97, 22]],
  [[-80, 10], [-72, 12], [-62, 10], [-52, 5], [-50, 0], [-35, -6], [-39, -15], [-41, -22], [-48, -26], [-53, -34], [-58, -38], [-65, -42], [-68, -50], [-70, -55], [-75, -50], [-74, -40], [-71, -30], [-70, -18], [-76, -14], [-81, -5], [-80, 2], [-78, 8]],
  [[-73, 78], [-60, 82], [-30, 83], [-20, 75], [-22, 70], [-40, 65], [-50, 62], [-55, 68], [-60, 76]],
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 54], [8, 57], [12, 56], [10, 59], [5, 62], [12, 66], [18, 70], [28, 71], [40, 68], [45, 66], [60, 68], [60, 55], [50, 45], [40, 42], [30, 41], [26, 40], [22, 37], [20, 40], [16, 38], [12, 44], [8, 44], [3, 43], [-1, 37]],
  [[-6, 50], [1, 51], [2, 53], [-1, 55], [-2, 58], [-5, 58], [-6, 56], [-5, 54], [-4, 52]],
  [[-24, 64], [-13, 65], [-15, 66.5], [-22, 66.5]],
  [[-17, 21], [-16, 12], [-12, 7], [-8, 4], [0, 5], [9, 4], [10, -2], [12, -6], [13, -12], [12, -17], [15, -27], [18, -34], [25, -34], [32, -28], [35, -24], [40, -15], [40, -10], [39, -5], [44, 2], [51, 11], [43, 12], [38, 18], [33, 28], [30, 31], [20, 32], [10, 37], [0, 36], [-6, 35], [-10, 30], [-13, 27]],
  [[44, -16], [50, -15], [50, -25], [45, -25], [43, -20]],
  [[35, 28], [38, 22], [43, 13], [52, 16], [57, 22], [56, 26], [48, 30], [40, 32]],
  [[26, 40], [30, 41], [40, 42], [50, 45], [60, 55], [60, 68], [70, 73], [80, 73], [100, 78], [115, 73], [140, 72], [160, 70], [180, 66], [180, 62], [163, 60], [156, 51], [143, 50], [140, 45], [135, 43], [130, 42], [128, 39], [126, 35], [122, 37], [121, 31], [122, 28], [119, 25], [114, 22], [108, 21], [106, 17], [109, 12], [105, 9], [103, 11], [100, 13], [100, 6], [103, 1], [98, 8], [98, 15], [93, 20], [90, 22], [86, 20], [80, 15], [77, 8], [73, 19], [70, 22], [66, 25], [57, 26], [52, 28], [48, 30], [44, 37], [36, 37], [30, 40]],
  [[95, 5], [98, 4], [104, -2], [106, -6], [102, -5], [97, 0]],
  [[109, 1], [113, 4], [117, 7], [119, 1], [116, -4], [111, -3]],
  [[105, -6], [114, -7], [114, -8.5], [106, -7.5]],
  [[131, -1], [141, -3], [150, -10], [143, -9], [138, -8], [132, -4]],
  [[120, 18], [122, 18], [126, 8], [122, 7], [120, 12]],
  [[130, 31], [135, 34], [140, 35], [142, 40], [141, 45], [145, 44], [141, 41], [140, 38], [136, 36], [132, 34]],
  [[120.2, 22.5], [121.9, 25.1], [121.5, 25.3], [120.1, 23.5]],
  [[126, 35], [129, 35.5], [129.5, 38], [128, 39], [126, 38]],
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -26], [151, -34], [146, -39], [140, -38], [135, -35], [129, -32], [116, -35], [114, -26]],
  [[172, -34], [178, -38], [174, -41], [171, -44], [167, -46], [170, -41]],
  [[-180, -66], [180, -66], [180, -90], [-180, -90]],
];
let landMask = null;
function buildLand() {
  const c = mk(360, 180), g = c.getContext('2d');
  g.fillStyle = '#fff';
  for (const pg of LAND) { g.beginPath(); pg.forEach(([lon, lat], i) => { const x = lon + 180, y = 90 - lat; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.closePath(); g.fill(); }
  const d = g.getImageData(0, 0, 360, 180).data;
  landMask = new Uint8Array(360 * 180);
  for (let i = 0; i < 360 * 180; i++) landMask[i] = d[i * 4 + 3] > 100 ? 1 : 0;
}
function isLand(lon, lat) {
  const x = Math.floor((((lon + 180) % 360) + 360) % 360), y = Math.floor(clamp(90 - lat, 0, 179.9));
  return landMask[y * 360 + x];
}
/* 经纬度 → 屏幕坐标；不在可见半球时返回 null */
function globeXY(cx, cy, Rr, lon, lat, lon0, tilt) {
  const ph = lat * Math.PI / 180, d = (lon - lon0) * Math.PI / 180;
  const X = Math.cos(ph) * Math.sin(d), Y2 = Math.sin(ph), Z2 = Math.cos(ph) * Math.cos(d);
  const Y = Y2 * Math.cos(tilt) - Z2 * Math.sin(tilt), Z = Y2 * Math.sin(tilt) + Z2 * Math.cos(tilt);
  if (Z < 0) return null;
  return [cx + X * Rr, cy - Y * Rr, Z];
}
/* lit：0..1，陆地上亮起 Clawd 的比例 */
function drawGlobe(g, t, cx, cy, Rr, o = {}) {
  if (!landMask) buildLand();
  const lon0 = o.lon0 ?? 75, tilt = o.tilt ?? .56, cs = o.cell || Math.max(6, Math.round(Rr / 34)), lit = o.lit ?? 0;
  // 大气光晕
  const ag = g.createRadialGradient(cx, cy, Rr * .9, cx, cy, Rr * 1.22);
  ag.addColorStop(0, o.day ? 'rgba(90,140,255,.18)' : 'rgba(90,140,255,.35)'); ag.addColorStop(1, 'rgba(90,140,255,0)');
  g.fillStyle = ag; g.fillRect(cx - Rr * 1.3, cy - Rr * 1.3, Rr * 2.6, Rr * 2.6);
  const day = !!o.day;
  g.fillStyle = day ? '#2F6BE0' : '#0A1632'; circ(g, cx, cy, Rr); g.fill();
  const x0 = cx - Rr, y0 = cy - Rr;
  for (let yy = 0; yy < Rr * 2; yy += cs) for (let xx = 0; xx < Rr * 2; xx += cs) {
    const nx = (xx + cs / 2 - Rr) / Rr, ny = (yy + cs / 2 - Rr) / Rr, r2 = nx * nx + ny * ny;
    if (r2 > 1) continue;
    const nz = Math.sqrt(1 - r2), Y = -ny, Z = nz;
    const y2 = Y * Math.cos(tilt) + Z * Math.sin(tilt), z2 = -Y * Math.sin(tilt) + Z * Math.cos(tilt);
    const lat = Math.asin(clamp(y2, -1, 1)) * 180 / Math.PI, lon = lon0 + Math.atan2(nx, z2) * 180 / Math.PI;
    const shade = .35 + .65 * nz;
    if (isLand(lon, lat)) {
      g.fillStyle = day ? `rgba(${Math.round(70 * shade + 20)},${Math.round(190 * shade + 20)},${Math.round(100 * shade + 10)},1)` : `rgba(${Math.round(36 * shade)},${Math.round(56 * shade)},${Math.round(84 * shade)},1)`;
      g.fillRect(x0 + xx, y0 + yy, cs - 1, cs - 1);
      const hv = hash(Math.round(lon * 2), Math.round(lat * 2), 5);
      if (hv < lit && lat > -60) {
        const tw_ = .65 + .35 * Math.sin(t * (3 + hv * 9) + hv * 50);
        g.fillStyle = `rgba(255,150,100,${.9 * tw_ * shade})`;
        const s = cs * .62; g.fillRect(x0 + xx + (cs - s) / 2 - .5, y0 + yy + (cs - s) / 2 - .5, s, s);
      }
    } else {
      g.fillStyle = day ? `rgba(${Math.round(40 * shade + 10)},${Math.round(100 * shade + 20)},${Math.round(225 * shade + 20)},1)` : `rgba(${Math.round(14 * shade)},${Math.round(30 * shade)},${Math.round(64 * shade)},1)`;
      g.fillRect(x0 + xx, y0 + yy, cs - 1, cs - 1);
    }
  }
  // 亮起来的地方加一层辉光
  if (lit > 0) {
    g.save(); g.globalCompositeOperation = 'lighter';
    const gg = g.createRadialGradient(cx, cy, Rr * .2, cx, cy, Rr);
    gg.addColorStop(0, `rgba(255,140,90,${.12 * lit})`); gg.addColorStop(1, 'rgba(255,140,90,0)');
    g.fillStyle = gg; circ(g, cx, cy, Rr); g.fill();
    g.restore();
  }
}
