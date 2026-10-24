'use strict';
/* world2.js —— 站台和火车、夜里的屋顶、火车窗外、溪边（黄昏 / 日出）、山坡草地、公园（四季）、院子和红豆树、四处风景。 */

/* ---------------- 站台 ----------------
   o.time: 'grey'（分别的下午，阴天）/ 'dawn'（重逢的早晨）；火车在站台后面，车厢顶在 y=330，车门地板在 y=800 */
function station(g, s, o = {}) {
  const dawn = o.time === 'dawn';
  skyGrad(g, dawn ? [[0, '#F2B48E'], [.5, '#F9D4A6'], [1, '#FFF0D2']] : [[0, '#8C98AC'], [.6, '#B9C2CE'], [1, '#D9DCE0']]);
  if (dawn) { glow(g, 1550, 420, 700, '#FFE0A0', .7); g.fillStyle = '#FFF6DE'; circ(g, 1550, 420, 60); g.fill(); }
  // 远处的城市剪影
  const rs = R(15);
  g.fillStyle = dawn ? '#D9A88E' : '#9AA3B2';
  for (let x = -100; x < W + 100;) { const bw = 60 + rs() * 120, bh = 80 + rs() * 200; g.fillRect(x, 560 - bh, bw, bh + 300); x += bw + 10; }
  if (o.after_bg) o.after_bg(g);
}
/* 站台前景（火车画完以后再画，盖住车轮） */
function platform(g, s, o = {}) {
  const dawn = o.time === 'dawn';
  g.fillStyle = dawn ? '#C9B4A2' : '#A9A6A4'; g.fillRect(-200, 800, W + 400, 300);
  g.fillStyle = dawn ? '#E9D27A' : '#D8C060'; g.fillRect(-200, 812, W + 400, 14);
  g.fillStyle = rgba('#000000', .08); for (let x = -200; x < W + 200; x += 120) g.fillRect(x, 826, 3, 260);
  g.fillStyle = shade(dawn ? '#C9B4A2' : '#A9A6A4', .82); g.fillRect(-200, 800, W + 400, 10);
  // 顶棚和柱子
  g.fillStyle = dawn ? '#5E4A48' : '#4A4E58'; g.fillRect(-200, 0, W + 400, 90); g.fillStyle = shade(dawn ? '#5E4A48' : '#4A4E58', 1.2); g.fillRect(-200, 90, W + 400, 14);
  for (const px of o.pillars || [160, 1760]) { g.fillStyle = dawn ? '#6A5450' : '#555A64'; g.fillRect(px - 14, 100, 28, 720); g.fillStyle = rgba('#FFFFFF', .12); g.fillRect(px - 10, 100, 6, 720); }
  // 站名牌
  if (o.sign !== false) {
    const sx = o.signX ?? 1500; g.fillStyle = '#F2EEE6'; g.fillRect(sx - 120, 150, 240, 64); g.fillStyle = '#3E6E74'; g.fillRect(sx - 120, 150, 240, 10);
    text(g, '南 站', sx, 188, 32, { k: 'serifB', col: '#333', ls: 8 });
  }
  // 钟
  if (o.clock !== false) {
    const cx = o.clockX ?? 420, cy = 190;
    g.strokeStyle = '#333'; g.lineWidth = 4; g.beginPath(); g.moveTo(cx, 104); g.lineTo(cx, cy - 46); g.stroke();
    g.fillStyle = '#F6F2EA'; circ(g, cx, cy, 46); g.fill(); g.lineWidth = 6; g.strokeStyle = '#3A3A3A'; g.stroke();
    const hh = (o.clockT ?? s) / 30, mm = (o.clockT ?? s) / 2.5;
    line(g, cx, cy, cx + Math.sin(hh) * 24, cy - Math.cos(hh) * 24, '#333', 5); line(g, cx, cy, cx + Math.sin(mm) * 36, cy - Math.cos(mm) * 36, '#333', 3);
  }
}
/* 一节车厢：x0 左端，len 长度；doorX 车门中心（相对 x0），door 车门关了多少（0 开 ~ 1 关） */
function trainCar(g, x0, len, o = {}) {
  const y0 = 330, y1 = 800, body = o.col || '#E9E2D2', band = o.band || '#3E6E74';
  g.fillStyle = '#2A2A30'; g.fillRect(x0 + 20, y1 - 10, len - 40, 40);
  g.fillStyle = body; rr(g, x0, y0, len, y1 - y0, 30); g.fill();
  g.fillStyle = band; g.fillRect(x0, y0 + 300, len, 70); g.fillStyle = shade(band, 1.25); g.fillRect(x0, y0 + 292, len, 8);
  g.fillStyle = shade(body, .9); g.fillRect(x0, y0, len, 22);
  const dx = o.doorX ?? len / 2, dw = 150;
  // 窗户
  for (let wx = x0 + 60; wx < x0 + len - 140; wx += 210) {
    if (Math.abs(wx + 70 - (x0 + dx)) < 170) continue;
    g.fillStyle = o.night ? '#FFD9A0' : '#5D7488'; rr(g, wx, y0 + 70, 150, 170, 14); g.fill();
    g.fillStyle = rgba('#FFFFFF', .2); poly(g, [[wx + 20, y0 + 240], [wx + 80, y0 + 70], [wx + 110, y0 + 70], [wx + 50, y0 + 240]]); g.fill();
  }
  // 车门
  const d = clamp(o.door ?? 0), cx = x0 + dx;
  g.fillStyle = o.inside || '#3A3440'; g.fillRect(cx - dw / 2, y0 + 50, dw, y1 - y0 - 50);
  if (o.inFn) { g.save(); g.beginPath(); g.rect(cx - dw / 2, y0 + 50, dw, y1 - y0 - 50); g.clip(); o.inFn(g, cx, y1); g.restore(); }
  for (const side of [-1, 1]) {
    const px = cx + side * dw / 2 - side * (dw / 2) * d;
    const w0 = dw / 2;
    const xL = side < 0 ? px - w0 : px;
    g.fillStyle = shade(body, .95); g.fillRect(xL, y0 + 50, w0, y1 - y0 - 50);
    g.fillStyle = rgba('#5D7488', .7); rr(g, xL + 14, y0 + 80, w0 - 28, 170, 10); g.fill();
    g.fillStyle = band; g.fillRect(xL, y0 + 300, w0, 70);
  }
  g.strokeStyle = shade(body, .7); g.lineWidth = 4; g.strokeRect(cx - dw / 2, y0 + 50, dw, y1 - y0 - 50);
}

/* ---------------- 夜里的屋顶 ----------------  pan：镜头往右移了多少 */
function rooftops(g, s, o = {}) {
  const pan = o.pan || 0;
  skyGrad(g, [[0, '#0A0F2A'], [.6, '#1C2452'], [1, '#3A3A6A']]);
  stars(g, s, pan * .05, 0, .8, .8);
  moon(g, 1500 - pan * .1, 200, 70, { halo: '#9FB2FF', haloA: .4 });
  const layer = (seed, yb, par, col, winA) => {
    const rs = R(seed); let x = -400 - (pan * par) % 4000;
    g.fillStyle = col;
    while (x < W + 400) {
      const bw = 140 + rs() * 160, bh = 60 + rs() * 120, roof = rs();
      const top = yb - bh;
      g.fillStyle = col; g.fillRect(x, top, bw, H);
      if (roof < .5) poly(g, [[x - 10, top], [x + bw / 2, top - 60 - rs() * 30], [x + bw + 10, top]]); else g.fillRect(x - 6, top - 10, bw + 12, 12);
      g.fill();
      if (rs() < .5) { g.fillRect(x + bw * .7, top - 70, 18, 60); }
      if (rs() < .3) { g.strokeStyle = col; g.lineWidth = 3; g.beginPath(); g.moveTo(x + bw * .3, top - 40); g.lineTo(x + bw * .3, top - 110); g.moveTo(x + bw * .3 - 20, top - 95); g.lineTo(x + bw * .3 + 20, top - 95); g.stroke(); }
      for (let i = 0; i < 3; i++) if (rs() < winA) { const wx = x + 20 + rs() * (bw - 50), wy = top + 30 + rs() * 80; g.fillStyle = '#FFC66E'; g.fillRect(wx, wy, 18, 22); glow(g, wx + 9, wy + 11, 40, '#FFB050', .4); g.fillStyle = col; }
      x += bw + 6;
    }
  };
  layer(31, 760, .3, '#232A50', .3);
  layer(32, 900, .6, '#1A1F3E', .4);
  layer(33, 1060, 1, '#11152C', .5);
}

/* ---------------- 火车窗外（夜） ----------------  窗外的景往左跑 */
function trainView(g, s, x, y, w, h, o = {}) {
  g.save(); g.beginPath(); rr(g, x, y, w, h, 30); g.clip();
  g.fillStyle = vgrad(g, y, y + h, [[0, '#0E1434'], [.6, '#26305E'], [1, '#3E3E6E']]); g.fillRect(x, y, w, h);
  stars(g, s, s * 10, 0, .7, .6);
  moon(g, x + w * .7, y + h * .22, 40, { halo: '#9FB2FF', haloA: .3 });
  const sp = o.speed ?? 1;
  // 远山
  g.fillStyle = '#1E2650'; g.beginPath(); g.moveTo(x, y + h);
  for (let xx = 0; xx <= w + 20; xx += 20) g.lineTo(x + xx, y + h * .55 - (noise1((xx + s * 30 * sp) / 300, 4) * .5 + .5) * h * .25);
  g.lineTo(x + w, y + h); g.fill();
  // 湖面和月亮倒影
  g.fillStyle = '#2C3668'; g.fillRect(x, y + h * .62, w, h * .2);
  for (let i = 0; i < 6; i++) { g.fillStyle = `rgba(255,240,200,${.4 - i * .05})`; g.fillRect(x + w * .7 - 30 + Math.sin(s * 2 + i) * 6, y + h * .64 + i * 12, 60 - i * 6, 3); }
  // 远处一串小镇的灯
  for (let i = 0; i < 30; i++) { const lx = x + (((i * 97 - s * 120 * sp) % (w + 400)) + w + 400) % (w + 400) - 200, ly = y + h * .6 - hash(i, 2) * 14; glow(g, lx, ly, 14, '#FFC070', .7); }
  // 近处的树、电线杆（飞快地往左跑）
  g.fillStyle = '#0C1026';
  for (let i = 0; i < 8; i++) { const tx = x + (((i * 330 - s * 900 * sp) % (w + 600)) + w + 600) % (w + 600) - 300; g.beginPath(); g.moveTo(tx, y + h); g.lineTo(tx + 70, y + h * .62); g.lineTo(tx + 140, y + h); g.fill(); }
  for (let i = 0; i < 4; i++) { const px = x + (((i * 520 - s * 1400 * sp) % (w + 600)) + w + 600) % (w + 600) - 300; g.fillRect(px, y, 14, h); }
  g.restore();
}

/* ---------------- 溪边 ----------------
   o.time: 'sunrise' | 'sunset' | 'gold'；溪水从远处的地平线弯弯曲曲流到左下角；右边一块大石头（坐人），一棵树 */
const STREAM = { rockX: 1240, rockY: 800 };
function streamCurve(t) {   // t 0（远）→ 1（近）：溪的中线和宽度
  const x = lerp(1060, 300, t) + Math.sin(t * 5.2) * 160 * t, y = lerp(560, 1150, Math.pow(t, 1.35)), w = lerp(8, 520, Math.pow(t, 1.6));
  return [x, y, w];
}
function streamLand(g, s, o = {}) {
  const tm = o.time || 'sunset';
  const SK = {
    sunset: [[0, '#5A5A92'], [.45, '#D88A86'], [.75, '#F6B98A'], [1, '#FFE2B0']],
    sunrise: [[0, '#8FB2D8'], [.5, '#F2C6B2'], [.8, '#FBDDB8'], [1, '#FFF2D6']],
    gold: [[0, '#E9A27C'], [.5, '#F6C894'], [1, '#FFE8C0']],
  }[tm];
  skyGrad(g, SK, -200, 620);
  const sunX = o.sunX ?? 760, sunY = o.sunY ?? 520;
  glow(g, sunX, sunY, 800, '#FFD9A0', .7); g.fillStyle = '#FFF2D8'; circ(g, sunX, sunY, 56); g.fill();
  cloud(g, 4, 400, 200, 620, tm === 'sunrise' ? CLOUD.dawn : CLOUD.dusk, .5); cloud(g, 9, 1450, 150, 700, tm === 'sunrise' ? CLOUD.dawn : CLOUD.dusk, .45, true);
  // 远山
  const hillC = tm === 'sunrise' ? ['#B9A6B8', '#9C9AAE'] : ['#A87E92', '#86687E'];
  g.fillStyle = hillC[0]; g.beginPath(); g.moveTo(-200, 700); for (let x = -200; x <= W + 200; x += 30) g.lineTo(x, 560 - (noise1(x / 380, 2) * .5 + .5) * 120); g.lineTo(W + 200, 700); g.fill();
  g.fillStyle = hillC[1]; g.beginPath(); g.moveTo(-200, 700); for (let x = -200; x <= W + 200; x += 30) g.lineTo(x, 600 - (noise1(x / 260, 5) * .5 + .5) * 70); g.lineTo(W + 200, 700); g.fill();
  // 草地
  const gr = tm === 'sunrise' ? [[0, '#9DB88A'], [1, '#6E9468']] : [[0, '#A69A6E'], [1, '#6E7A4E']];
  g.fillStyle = vgrad(g, 580, H, gr); g.fillRect(-200, 580, W + 400, H);
  // 溪
  const pts = []; for (let i = 0; i <= 40; i++) pts.push(streamCurve(i / 40));
  const bankPath = (ext) => { g.beginPath(); pts.forEach(([x, y, w], i) => i ? g.lineTo(x - w / 2 - ext * (.3 + y / 1100), y) : g.moveTo(x - w / 2 - ext * .3, y)); for (let i = pts.length - 1; i >= 0; i--) g.lineTo(pts[i][0] + pts[i][2] / 2 + ext * (.3 + pts[i][1] / 1100), pts[i][1]); g.closePath(); };
  g.fillStyle = tm === 'sunrise' ? '#5E7A58' : '#5A4E3A'; bankPath(14); g.fill();
  g.fillStyle = tm === 'sunrise' ? '#BFD8EA' : '#8E7EB8';
  bankPath(0); g.fill();
  // 水面的反光（天空的颜色）+ 波光
  g.save(); g.clip();
  g.fillStyle = vgrad(g, 560, H, [[0, rgba('#FFF0D0', .95)], [.35, rgba(tm === 'sunrise' ? '#CFE2F0' : '#F6B0A0', .55)], [1, rgba(tm === 'sunrise' ? '#7A9CC8' : '#5A5296', .5)]]); g.fillRect(-200, 540, W + 400, H);
  // 水里太阳的倒影：沿着溪往近处的一串碎金
  for (let i = 0; i < 70; i++) {
    const t = hash(i, 41) * .85, [x, y, w] = streamCurve(t), a = Math.max(0, Math.sin(s * (3 + hash(i, 42) * 4) + i * 1.3));
    g.fillStyle = `rgba(255,236,190,${a * .9})`; g.fillRect(x - w * .25 + hash(i, 43) * w * .5, y, 4 + t * 26, 2 + t * 3);
  }
  // 横的波纹
  g.strokeStyle = rgba('#FFFFFF', .5); g.lineWidth = 2.5;
  for (let i = 0; i < 28; i++) { const t = (i + .5) / 28, [x, y, w] = streamCurve(t), off = Math.sin(s * 1.5 + i * 2) * w * .1; g.beginPath(); g.moveTo(x - w * .3 + off, y); g.lineTo(x + w * .1 + off, y); g.stroke(); }
  for (let i = 0; i < 90; i++) {
    const t = hash(i, 4), [x, y, w] = streamCurve(t), xx = x + (hash(i, 5) - .5) * w * .8 + ((s * 30 * (.5 + t)) % 60) - 30;
    const a = .7 * Math.max(0, Math.sin(s * (2 + hash(i, 6) * 3) + i));
    g.fillStyle = `rgba(255,248,225,${a})`; g.fillRect(xx, y, 6 + t * 30, 2 + t * 2);
  }
  g.restore();
  // 岸边的草和小花
  for (let i = 0; i < 70; i++) {
    const t = hash(i, 11), [x, y, w] = streamCurve(t), side = hash(i, 12) < .5 ? -1 : 1, bx = x + side * (w / 2 + 4 + hash(i, 13) * 20 * (.3 + t));
    g.strokeStyle = tm === 'sunrise' ? '#5E8456' : '#5E6A3E'; g.lineWidth = 1 + t * 2;
    g.beginPath(); for (let j = 0; j < 3; j++) { g.moveTo(bx + j * 5 * t, y); g.quadraticCurveTo(bx + j * 5 * t + 4, y - 14 * (.3 + t), bx + j * 5 * t + 8 + Math.sin(s + i) * 3, y - 26 * (.3 + t)); } g.stroke();
    if (hash(i, 14) < .3) { g.fillStyle = ['#FFFFFF', '#FFD6E0', '#FFE38A'][i % 3]; circ(g, bx + 6, y - 26 * (.3 + t), 2 + t * 4); g.fill(); }
  }
  // 树（右边）
  if (o.tree !== false) {
    const tx = o.treeX ?? 1560, ty = 760;
    g.fillStyle = '#5A4234'; poly(g, [[tx - 22, ty], [tx - 10, ty - 260], [tx + 12, ty - 260], [tx + 24, ty]]); g.fill();
    const lc = tm === 'sunrise' ? ['#6E9468', '#86AA74', '#A2C08A'] : ['#6E6A44', '#8E8450', '#B4A060'];
    for (let i = 0; i < 26; i++) { const a = hash(i, 21) * TAU, r = 60 + hash(i, 22) * 150; g.fillStyle = lc[i % 3]; circ(g, tx + Math.cos(a) * r * 1.3 + Math.sin(s * .8 + i) * 3, ty - 330 + Math.sin(a) * r * .7, 70 + hash(i, 23) * 40); g.fill(); }
  }
  // 石头
  if (o.rock !== false) {
    const rx = STREAM.rockX, ry = STREAM.rockY;
    g.fillStyle = tm === 'sunrise' ? '#8E8A90' : '#6A5A58'; g.beginPath(); g.moveTo(rx - 210, ry + 70); g.quadraticCurveTo(rx - 200, ry - 20, rx - 90, ry - 40); g.quadraticCurveTo(rx + 60, ry - 60, rx + 190, ry - 10); g.quadraticCurveTo(rx + 240, ry + 40, rx + 220, ry + 70); g.closePath(); g.fill();
    g.fillStyle = rgba('#FFE6C0', .35); g.beginPath(); g.moveTo(rx - 180, ry - 10); g.quadraticCurveTo(rx - 60, ry - 50, rx + 160, ry - 18); g.quadraticCurveTo(rx, ry - 30, rx - 180, ry - 10); g.fill();
  }
}

/* ---------------- 山坡草地（放风筝） ---------------- */
function meadow(g, s, o = {}) {
  const tilt = o.tilt || 0;   // 镜头往上摇（0..1）
  g.save(); g.translate(0, tilt * 700);
  skyGrad(g, [[0, '#6FA6D6'], [.6, '#A9CDE8'], [1, '#E6F0EE']], -900, 700);
  glow(g, 1600, 120 - tilt * 300, 500, '#FFF6D8', .6);
  for (let i = 0; i < 6; i++) cloud(g, i, ((i * 420 + s * 25) % (W + 800)) - 400, 120 + (i % 3) * 90 - (i > 3 ? 500 : 0), 520 + (i % 2) * 200, CLOUD.day, .9, i % 2 === 1);
  // 远山、山坡
  g.fillStyle = '#9CC0A6'; g.beginPath(); g.moveTo(-100, 900); for (let x = -100; x <= W + 100; x += 30) g.lineTo(x, 640 - (noise1(x / 400, 3) * .5 + .5) * 100); g.lineTo(W + 100, 900); g.fill();
  g.fillStyle = vgrad(g, 660, H, [[0, '#8DBB6E'], [1, '#6E9E54']]); g.beginPath(); g.moveTo(-100, H + 100);
  for (let x = -100; x <= W + 100; x += 20) g.lineTo(x, 820 - Math.sin((x - 300) / 700) * 120); g.lineTo(W + 100, H + 100); g.fill();
  // 风吹的草
  for (let i = 0; i < 220; i++) {
    const x = hash(i, 1) * (W + 200) - 100, y0 = 820 - Math.sin((x - 300) / 700) * 120 + hash(i, 2) * 280;
    const bend = Math.sin(s * 2.4 + x * .01) * 8 + 10;
    g.strokeStyle = ['#5E8E44', '#7AAA58', '#A2C878'][i % 3]; g.lineWidth = 2.5;
    g.beginPath(); g.moveTo(x, y0); g.quadraticCurveTo(x + bend * .5, y0 - 16, x + bend, y0 - 30); g.stroke();
    if (i % 9 === 0) { g.fillStyle = ['#FFFFFF', '#FFE38A', '#F6C0D0'][i % 3]; circ(g, x + bend, y0 - 30, 4); g.fill(); }
  }
  g.restore();
}
const meadowY = x => 820 - Math.sin((x - 300) / 700) * 120;

/* ---------------- 公园长椅（四季）：u 0..1 一年（春 → 夏 → 秋 → 冬） ---------------- */
function park(g, s, yr) {
  const season = ((yr % 1) + 1) % 1;
  const sky = ramp([[0, '#BFDCEC'], [.25, '#8EC4E8'], [.5, '#E8C8A0'], [.75, '#B8C2D0'], [1, '#BFDCEC']], season);
  const ground = ramp([[0, '#9CC48A'], [.25, '#7AAE5E'], [.5, '#C2A066'], [.75, '#E6ECF2'], [1, '#9CC48A']], season);
  skyGrad(g, [[0, shade(sky, .9)], [1, shade(sky, 1.1)]], -100, 800);
  g.fillStyle = vgrad(g, 760, H, [[0, ground], [1, shade(ground, .85)]]); g.fillRect(-100, 760, W + 200, H);
  g.fillStyle = shade(ground, .9); g.fillRect(-100, 900, W + 200, 40);   // 小路
  // 树：叶子的颜色和多少跟着季节变
  const leaf = ramp([[0, '#F7A9C0'], [.12, '#F7B6C8'], [.22, '#8CC070'], [.45, '#6EA058'], [.55, '#E0A048'], [.68, '#C66A3A'], [.76, '#9E8A7A'], [1, '#F7A9C0']], season);
  const amount = season < .62 ? 1 : season < .78 ? 1 - (season - .62) / .16 : season < .92 ? 0 : (season - .92) / .08;
  for (const [tx, sc] of [[520, 1.2], [1500, 1.05]]) {
    g.fillStyle = '#5A4436'; poly(g, [[tx - 26 * sc, 790], [tx - 12 * sc, 420], [tx + 12 * sc, 420], [tx + 26 * sc, 790]]); g.fill();
    g.strokeStyle = '#5A4436'; g.lineWidth = 12 * sc; g.lineCap = 'round'; g.beginPath(); g.moveTo(tx, 520); g.lineTo(tx - 110 * sc, 380); g.moveTo(tx, 480); g.lineTo(tx + 120 * sc, 360); g.moveTo(tx, 430); g.lineTo(tx - 20, 300); g.stroke();
    for (let i = 0; i < 40; i++) { if (hash(i, 31) > amount) continue; const a = hash(i, 32) * TAU, r = hash(i, 33) * 200 * sc; g.fillStyle = shade(leaf, .85 + hash(i, 34) * .3); circ(g, tx + Math.cos(a) * r * 1.2, 360 + Math.sin(a) * r * .55, (40 + hash(i, 35) * 30) * sc); g.fill(); }
    if (season > .74 && season < .92) { g.fillStyle = '#FFFFFF'; for (let i = 0; i < 6; i++) { ell(g, tx + (hash(i, 7) - .5) * 300 * sc, 380 + hash(i, 8) * 60, 50 * sc, 10); g.fill(); } }
  }
  // 落叶 / 花瓣 / 雪
  const fallCol = season < .2 ? '#F8D2DE' : season < .45 ? null : season < .72 ? leaf : '#FFFFFF';
  if (fallCol) for (const p of floaters(s, 81, 40, [-50, -50, W + 50, 900], { vy: -60, vx: 30, amp: 40 })) { g.fillStyle = fallCol; g.save(); g.translate(p.x, p.y); g.rotate(p.ph + s); ell(g, 0, 0, 6 + p.sz * 5, 3 + p.sz * 2); g.fill(); g.restore(); }
  // 路灯
  streetLamp(g, 1140, 900, 1.1, season > .7 ? .6 : 0);
}

/* ---------------- 院子和红豆树（时间流逝） ----------------
   grow 0..1 树长多大；season 0..1；night 0..1；snow 地上的雪；houseLit 窗户亮不亮 */
const YARD = { treeX: 1180, groundY: 840, houseX: 520 };
function yard(g, s, o = {}) {
  const night = clamp(o.night || 0), season = (((o.season ?? .3) % 1) + 1) % 1, grow = clamp(o.grow ?? 1);
  const daySky = ramp([[0, '#BFDCEC'], [.25, '#8EC4E8'], [.5, '#EEC7A0'], [.75, '#C2CAD6'], [1, '#BFDCEC']], season);
  skyGrad(g, [[0, mixc(shade(daySky, .88), '#0B1030', night)], [1, mixc(shade(daySky, 1.08), '#2E2E5E', night)]], -200, 880);
  if (night > .2) stars(g, s, 0, 0, night, night);
  if (night > .3) moon(g, 1650, 160, 46, { a: night });
  else glow(g, 1600, 180, 400, '#FFF6D8', .6 * (1 - night));
  const snowy = season > .76 && season < .95;
  const ground = mixc(ramp([[0, '#9CC48A'], [.25, '#7AAE5E'], [.5, '#B89C66'], [.75, '#DDE4EC'], [.95, '#DDE4EC'], [1, '#9CC48A']], season), '#1E2240', night * .7);
  g.fillStyle = mixc('#8EA8A0', '#20264A', night); g.beginPath(); g.moveTo(-100, 900); for (let x = -100; x <= W + 100; x += 30) g.lineTo(x, 700 - (noise1(x / 400, 9) * .5 + .5) * 90); g.lineTo(W + 100, 900); g.fill();
  g.fillStyle = ground; g.fillRect(-100, 760, W + 200, H);
  // 房子
  const hx = YARD.houseX, hy = YARD.groundY;
  const wall = mixc('#E6D2BC', '#3A3550', night * .75);
  g.fillStyle = wall; g.fillRect(hx - 250, hy - 300, 500, 300);
  g.fillStyle = mixc('#9C5A48', '#3A2638', night * .7); poly(g, [[hx - 290, hy - 296], [hx, hy - 470], [hx + 290, hy - 296]]); g.fill();
  if (snowy || o.snow) { g.fillStyle = mixc('#F4F7FB', '#C8D2E8', night); poly(g, [[hx - 296, hy - 292], [hx, hy - 476], [hx + 296, hy - 292], [hx, hy - 440]]); g.fill(); }
  g.fillStyle = mixc('#7A5440', '#2A2030', night * .6); g.fillRect(hx + 120, hy - 380, 40, 70);
  const lit = o.houseLit ?? night;
  for (const [wx, wy] of [[hx - 170, hy - 230], [hx + 50, hy - 230]]) {
    g.fillStyle = mixc('#9FB8C8', '#FFC870', lit); g.fillRect(wx, wy, 110, 100); g.fillStyle = wall; g.fillRect(wx + 52, wy, 6, 100); g.fillRect(wx, wy + 46, 110, 6);
    if (lit > .1) glow(g, wx + 55, wy + 50, 160, '#FFB050', .5 * lit);
  }
  g.fillStyle = mixc('#8A6248', '#2E2230', night * .6); g.fillRect(hx - 40, hy - 150, 80, 150);
  // 栅栏
  g.fillStyle = mixc('#F2ECE2', '#4A4660', night * .7);
  for (let x = -60; x < W + 60; x += 46) if (x < hx - 300 || x > hx + 300) { g.fillRect(x, hy - 70, 16, 80); poly(g, [[x, hy - 70], [x + 8, hy - 84], [x + 16, hy - 70]]); g.fill(); }
  g.fillRect(-60, hy - 52, W + 120, 10);
  // 红豆树
  redBeanTree(g, s, YARD.treeX, hy + 10, grow, season, night, o);
  if (snowy || o.snow) { g.fillStyle = mixc('#F4F7FB', '#C8D2E8', night); g.fillRect(-100, hy + 4, W + 200, H); }
}
/* 红豆树：羽状的小叶子，结红豆荚；grow 0（刚冒芽）→ 1（大树） */
function redBeanTree(g, s, x, y, grow, season = .3, night = 0, o = {}) {
  if (grow <= 0) return;
  const hgt = lerp(40, 520, Math.pow(grow, .8)), trunkW = lerp(4, 46, grow);
  const bark = mixc('#5A4234', '#2A2030', night * .6);
  g.fillStyle = bark; poly(g, [[x - trunkW, y], [x - trunkW * .4, y - hgt * .62], [x + trunkW * .4, y - hgt * .62], [x + trunkW, y]]); g.fill();
  const branches = grow < .15 ? [] : [[-.6, .5], [.7, .55], [-.25, .72], [.35, .78], [0, .85]];
  g.strokeStyle = bark; g.lineCap = 'round';
  const tips = [];
  for (const [dx, hy] of branches) { const bx = x + dx * hgt * .55, by = y - hgt * (hy + .1); g.lineWidth = trunkW * .45; g.beginPath(); g.moveTo(x, y - hgt * hy * .8); g.quadraticCurveTo(x + dx * hgt * .2, y - hgt * hy, bx, by); g.stroke(); tips.push([bx, by]); }
  if (grow < .15) tips.push([x, y - hgt]);
  const autumn = season > .5 && season < .76, winter = season >= .76 && season < .95;
  const leafCol = mixc(ramp([[0, '#9CC870'], [.3, '#6E9E50'], [.55, '#C8A048'], [.7, '#B86A3A'], [1, '#9CC870']], season), '#22283E', night * .7);
  const amount = winter ? 0 : autumn ? .75 : 1;
  const crown = lerp(30, 330, grow);
  // 先画成团的叶子（深 → 浅），再在上面撒一层羽状的小叶子
  for (const [layer, k0] of [[0, .78], [1, .95], [2, 1.12]]) {
    for (let i = 0; i < 26; i++) {
      if (hash(i, 51 + layer) > amount) continue;
      const tp = tips[i % tips.length], a = hash(i, 52 + layer) * TAU, r = hash(i, 53 + layer) * crown * .5;
      const lx = tp[0] + Math.cos(a) * r * 1.25 + Math.sin(s * 1.1 + i) * 2 * grow, ly = tp[1] + Math.sin(a) * r * .5 - layer * crown * .05;
      g.fillStyle = shade(leafCol, k0); circ(g, lx, ly, crown * (.22 - layer * .03) * (.7 + hash(i, 55) * .5)); g.fill();
    }
  }
  g.strokeStyle = shade(leafCol, 1.25); g.lineWidth = Math.max(1, grow * 2.5); g.lineCap = 'round';
  for (let i = 0; i < 60 * amount; i++) {
    const tp = tips[i % tips.length], a = hash(i, 57) * TAU, r = hash(i, 58) * crown * .55;
    const lx = tp[0] + Math.cos(a) * r * 1.2, ly = tp[1] + Math.sin(a) * r * .45, L = 10 + grow * 16, ang = hash(i, 59) * TAU;
    g.beginPath(); for (let j = -2; j <= 2; j++) { const px = lx + Math.cos(ang) * j * L * .3, py = ly + Math.sin(ang) * j * L * .3; g.moveTo(px, py); g.lineTo(px + Math.cos(ang + 1.2) * L * .25, py + Math.sin(ang + 1.2) * L * .25); g.moveTo(px, py); g.lineTo(px + Math.cos(ang - 1.2) * L * .25, py + Math.sin(ang - 1.2) * L * .25); } g.stroke();
  }
  if (winter) { g.fillStyle = mixc('#F4F7FB', '#C8D2E8', night); for (const tp of tips) { ell(g, tp[0], tp[1] - 4, 26 * grow + 6, 9 * grow + 3); g.fill(); } ell(g, x, y - hgt * .62, trunkW * .8, 8); g.fill(); }
  // 红豆荚（夏末秋天）
  if (grow > .6 && (o.pods ?? (season > .4 && season < .8))) {
    for (let i = 0; i < 26; i++) {
      const tp = tips[i % tips.length], a = hash(i, 61) * TAU, r = hash(i, 62) * crown * .45;
      const px = tp[0] + Math.cos(a) * r, py = tp[1] + Math.sin(a) * r * .5 + 20;
      g.fillStyle = mixc('#A0603A', '#3A2030', night * .5); ell(g, px, py, 7, 20, hash(i, 63)); g.fill();
      bean(g, px + 6, py + 10, 6, hash(i, 64) * 6);
    }
  }
}

/* ---------------- 四处风景（"等到风景都看透"） ---------------- */
function vista(g, s, kind, k) {
  if (kind === 'sea') {         // 黄昏海边的灯塔
    skyGrad(g, [[0, '#4A5A92'], [.5, '#D9909A'], [1, '#FFD4A0']], -100, 620);
    glow(g, 1300, 600, 700, '#FFD9A0', .7); g.fillStyle = '#FFF0D0'; circ(g, 1300, 610, 60); g.fill();
    g.fillStyle = vgrad(g, 620, H, [[0, '#B87A8A'], [1, '#3E3E6E']]); g.fillRect(-100, 620, W + 200, H);
    for (let i = 0; i < 40; i++) { g.fillStyle = `rgba(255,230,200,${.5 * Math.max(0, Math.sin(s * 3 + i))})`; g.fillRect(1300 - 200 + hash(i, 1) * 400, 640 + hash(i, 2) * 300, 30 + hash(i, 3) * 40, 3); }
    g.fillStyle = '#2E2A44'; g.beginPath(); g.moveTo(200, H); g.quadraticCurveTo(320, 700, 700, 760); g.lineTo(820, H); g.fill();
    g.fillStyle = '#F2ECE2'; poly(g, [[420, 720], [440, 380], [500, 380], [520, 720]]); g.fill(); g.fillStyle = RED; g.fillRect(432, 520, 80, 40); g.fillRect(426, 620, 92, 40);
    g.fillStyle = '#3A3A4A'; g.fillRect(430, 340, 80, 44); glow(g, 470, 362, 120, '#FFF0B0', .9);
    g.save(); g.globalCompositeOperation = 'screen'; g.translate(470, 362); g.rotate(s * 1.5); g.fillStyle = 'rgba(255,240,180,.25)'; poly(g, [[0, 0], [900, -60], [900, 60]]); g.fill(); g.restore();
  } else if (kind === 'snowpeak') {   // 雪山日出
    skyGrad(g, [[0, '#3E5A92'], [.6, '#E9A8A0'], [1, '#FFE0B0']], -100, 700);
    glow(g, 960, 520, 600, '#FFE0A8', .7);
    for (const [cx, w, h, c] of [[500, 700, 420, '#7A7AA8'], [1300, 900, 520, '#6A6A9A'], [960, 600, 360, '#8A86B0']]) {
      g.fillStyle = c; poly(g, [[cx - w / 2, 860], [cx, 860 - h], [cx + w / 2, 860]]); g.fill();
      g.fillStyle = '#FFF2EC'; poly(g, [[cx - w * .16, 860 - h * .68], [cx, 860 - h], [cx + w * .16, 860 - h * .68], [cx + w * .05, 860 - h * .74], [cx - w * .04, 860 - h * .66]]); g.fill();
      g.fillStyle = rgba('#FFB090', .35); poly(g, [[cx, 860 - h], [cx + w / 2, 860], [cx + w * .1, 860]]); g.fill();
    }
    g.fillStyle = '#E8ECF4'; g.fillRect(-100, 850, W + 200, H);
  } else if (kind === 'flowers') {    // 花田
    skyGrad(g, [[0, '#E89A88'], [.6, '#F6C89A'], [1, '#FFE6C0']], -100, 640);
    glow(g, 1400, 560, 600, '#FFE0A0', .6);
    g.fillStyle = '#B88AB0'; g.fillRect(-100, 620, W + 200, H);
    for (let r = 0; r < 14; r++) { const y = 640 + Math.pow(r / 13, 1.8) * 460; for (let i = 0; i < 40; i++) { const x = (i / 39) * (W + 200) - 100 + (r % 2) * 20 + Math.sin(s * 2 + i + r) * 3; g.fillStyle = ['#9A6AB0', '#B888C8', '#D4A8DC'][(i + r) % 3]; ell(g, x, y, 10 + r * 3, 4 + r * 1.5); g.fill(); } }
  } else if (kind === 'aurora') {     // 极光
    skyGrad(g, [[0, '#050A20'], [1, '#14284A']]);
    stars(g, s, 0, 0, 1, 1);
    g.save(); g.globalCompositeOperation = 'screen';
    for (let b = 0; b < 3; b++) for (let x = -100; x < W + 100; x += 8) {
      const y = 260 + b * 70 + Math.sin(x / 260 + s * .8 + b) * 60 + Math.sin(x / 90 + s * 1.3) * 14;
      const a = .5 * (.5 + .5 * Math.sin(x / 140 + s + b * 2));
      g.fillStyle = lgrad(g, 0, y - 200, 0, y + 20, [[0, 'rgba(120,80,220,0)'], [.7, `rgba(80,240,170,${a * .5})`], [1, `rgba(150,255,200,${a})`]]);
      g.fillRect(x, y - 220, 9, 240);
    }
    g.restore();
    g.fillStyle = '#0E1A30'; g.beginPath(); g.moveTo(-100, H); for (let x = -100; x <= W + 100; x += 30) g.lineTo(x, 860 - (noise1(x / 300, 8) * .5 + .5) * 80); g.lineTo(W + 100, H); g.fill();
  }
}
