'use strict';
/* world.js：外景。夏天的天（积云、太阳、光芒、燕子），远山、田、河、铁桥、绿皮火车、小站、小城的老街、校门、教学楼、操场、河边的路。
   每个函数都是 fn(g, s, o)：s 是歌曲时间，o 里是镜头位置（x 平移）、一天里的什么时候（tod）、过去 / 现在（now）等。 */

/* ---------------- 天 ---------------- */
const SKYS = {
  noon: [[0, '#2A78D6'], [.5, '#6FB2F0'], [.85, '#B9DDF8'], [1, '#E2F1FB']],
  morning: [[0, '#5F9BDB'], [.55, '#A8CDEE'], [.85, '#E2E8EC'], [1, '#F6E9D8']],
  golden: [[0, '#477FCB'], [.45, '#9DBFE3'], [.75, '#F2D8B0'], [1, '#FFC88A']],
  sunset: [[0, '#38479A'], [.35, '#9A70A8'], [.65, '#EE8E78'], [.85, '#FFB574'], [1, '#FFD9A0']],
  dusk: [[0, '#16204E'], [.45, '#4A4486'], [.75, '#B66E8E'], [1, '#EE9A7C']],
  night: [[0, '#060C28'], [.55, '#132056'], [1, '#2E3470']],
  present: [[0, '#4F8ED6'], [.5, '#97C0E8'], [.82, '#E6DCCB'], [1, '#F6D9B0']],
  rain: [[0, '#7A8CA6'], [.6, '#AEB8C6'], [1, '#D7D8D6']],
};
const CLOUDP = {
  noon: ['#FFFFFF', '#EEF4FA', '#B8C9DE', '#FFFFFF'],
  morning: ['#FFFDF8', '#E8EDF4', '#B9C3D6', '#FFFFFF'],
  golden: ['#FFF4E0', '#F2DCC0', '#B6A8B8', '#FFF8E8'],
  sunset: ['#FFD9B0', '#F0A090', '#8C6A94', '#FFE8C8'],
  dusk: ['#E8A8A8', '#9A78A0', '#4A3E70', '#FFC8B0'],
  night: ['#5C6A9E', '#323C70', '#1E2450', '#7C8AC0'],
  present: ['#FFF8EC', '#EDE6DC', '#B8BCC8', '#FFFFFF'],
  rain: ['#C9CED6', '#9AA2AE', '#717A88', '#DDE1E7'],
};
/* 一座积云：好几张云的贴图叠成一座塔，底下宽、上面窄。x, y 是云底中间 */
function cumulus(g, x, y, w, pal, a = 1, seed = 1) {
  const n = 6, rs = R(seed * 97 + 3);
  for (let i = n - 1; i >= 0; i--) {
    const v = i / (n - 1);
    const cw = w * (1 - v * .55) * (.85 + rs() * .3), cy = y - v * w * .62 - rs() * w * .05;
    const cx = x + (rs() - .5) * w * .25 * v;
    cloud(g, Math.floor(rs() * 12), cx, cy, cw, pal, a, rs() < .5);
  }
}
function sun(g, x, y, r, col = '#FFF6DA', a = 1) {
  glow(g, x, y, r * 9, col, .45 * a);
  glow(g, x, y, r * 3.2, '#FFFFFF', .7 * a);
  withAlpha(g, a, () => { circ(g, x, y, r); g.fillStyle = '#FFFEF6'; g.fill(); });
}
/* 镜头光晕：从太阳往画面中心方向排几个光圈 */
function flare(g, sx, sy, a = 1, col = '#FFE8C0') {
  if (a <= .01) return;
  const dx = W / 2 - sx, dy = H / 2 - sy;
  [[.35, 60, .18], [.6, 26, .3], [.85, 90, .1], [1.25, 40, .2], [1.6, 140, .08]].forEach(([k, r, al]) => glow(g, sx + dx * k, sy + dy * k, r, col, al * a));
  g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .12 * a;
  g.strokeStyle = col; g.lineWidth = 2; g.beginPath(); g.moveTo(sx - 600, sy); g.lineTo(sx + 600, sy); g.stroke(); g.restore();
}
/* 太阳光从上往下斜着照下来的光柱 */
function godRays(g, x, y, ang, n, len, col = '#FFF2D0', a = .25, s = 0) {
  if (a <= .01) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const off = (hash(i, 31) - .5) * 1.1, w = 40 + hash(i, 32) * 120, aa = a * (.4 + .6 * hash(i, 33)) * (.7 + .3 * Math.sin(s * .7 + i));
    const a1 = ang + off * .45;
    const x1 = x + Math.cos(a1) * len, y1 = y + Math.sin(a1) * len;
    g.fillStyle = lgrad(g, x, y, x1, y1, [[0, rgba(col, aa)], [1, rgba(col, 0)]]);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x1 - Math.sin(a1) * w, y1 + Math.cos(a1) * w); g.lineTo(x1 + Math.sin(a1) * w, y1 - Math.cos(a1) * w); g.closePath(); g.fill();
  }
  g.restore();
}
/* 天：o.tod 一天里的什么时候，o.x 镜头横移（云比镜头慢），o.sun [x,y,r]，o.clouds 积云的数量，o.cy 云底的高度 */
function summerSky(g, s, o = {}) {
  const tod = o.tod || 'noon';
  skyGrad(g, SKYS[tod], o.y0 ?? 0, o.y1 ?? H);
  if (tod === 'night' || tod === 'dusk') stars(g, s, (o.x || 0) * .05, 0, tod === 'night' ? 1 : .35);
  if (o.sun) sun(g, o.sun[0], o.sun[1], o.sun[2], tod === 'sunset' || tod === 'golden' ? '#FFD8A0' : '#FFF6DA', o.sunA ?? 1);
  const pal = CLOUDP[tod], cx = (o.x || 0) * .15 + s * (o.drift ?? 6);
  const n = o.clouds ?? 4, cy = o.cy ?? 640;
  for (let i = 0; i < n; i++) {
    const w = (o.cw ?? 760) * (.7 + hash(i, 11, o.seed || 0) * .6);
    const span = W + 1600;
    const x = ((hash(i, 12, o.seed || 0) * span - cx) % span + span) % span - 800;
    cumulus(g, x, cy - hash(i, 13, o.seed || 0) * 160, w, pal, o.cloudA ?? 1, i + (o.seed || 0) * 10);
  }
  // 薄薄的高云
  if (o.wisps !== false) for (let i = 0; i < 5; i++) {
    const x = ((hash(i, 14) * (W + 1200) - cx * 1.4) % (W + 1200) + W + 1200) % (W + 1200) - 600;
    cloud(g, (i * 5 + 2) % 12, x, 120 + hash(i, 15) * 200, 900, pal, .35 * (o.cloudA ?? 1));
  }
}
/* 燕子：几只小黑影，翅膀一扇一扇 */
function swallows(g, s, n, box, a = 1, seed = 5) {
  const [x0, y0, x1, y1] = box;
  for (let i = 0; i < n; i++) {
    const ph = hash(i, seed) * 10, sp = 120 + hash(i, seed + 1) * 160;
    const x = x0 + ((hash(i, seed + 2) * (x1 - x0) + s * sp) % (x1 - x0));
    const y = y0 + hash(i, seed + 3) * (y1 - y0) + Math.sin(s * 1.3 + ph) * 30;
    const f = Math.sin(s * 14 + ph) * .6;
    g.save(); g.translate(x, y); g.globalAlpha *= a; g.strokeStyle = '#1E2230'; g.lineWidth = 3; g.lineCap = 'round';
    g.beginPath(); g.moveTo(-18, -8 * f); g.quadraticCurveTo(-8, -4, 0, 0); g.quadraticCurveTo(8, -4, 18, -8 * f); g.stroke(); g.restore();
  }
}

/* ---------------- 远山、田、树 ---------------- */
function ridge(g, x, y, amp, col, seed, freq = .0016, oct = 4, top = 0) {
  g.beginPath(); g.moveTo(-10, H + 10);
  for (let px = -10; px <= W + 10; px += 12) {
    const n = fbm((px + x) * freq, seed * 3.1, oct, seed);
    g.lineTo(px, y - n * amp - top);
  }
  g.lineTo(W + 10, H + 10); g.closePath(); g.fillStyle = col; g.fill();
}
/* 一棵阔叶树（香樟、梧桐）：几团叶子 + 亮面 */
function tree(g, x, y, r, o = {}) {
  const col = o.col || '#3E8C4A', lite = o.lite || '#7CC067', dark = o.dark || '#2A6438', sw = o.sway || 0;
  line(g, x, y, x + sw * .2, y - r * 1.2, o.trunk || '#6A4A36', r * .16);
  const blobs = [[0, -1.45, 1], [-.62, -1.2, .72], [.62, -1.18, .74], [-.3, -1.85, .68], [.35, -1.9, .62], [0, -1.05, .7]];
  for (const [bx, by, br] of blobs) { circ(g, x + bx * r + sw * (1.6 + by) * -.3, y + by * r, br * r); g.fillStyle = dark; g.fill(); }
  for (const [bx, by, br] of blobs) { circ(g, x + bx * r + sw * (1.6 + by) * -.3 - r * .08, y + by * r - r * .08, br * r * .82); g.fillStyle = col; g.fill(); }
  for (const [bx, by, br] of blobs.slice(0, 5)) { circ(g, x + bx * r + sw * (1.6 + by) * -.3 - r * .2, y + by * r - r * .22, br * r * .42); g.fillStyle = rgba(lite, .7); g.fill(); }
}
/* 一排远处的树（剪影） */
function treeLine(g, x, y, h, col, seed, sp = 70) {
  g.fillStyle = col;
  const off = ((x % sp) + sp) % sp;
  for (let px = -sp - off; px < W + sp; px += sp) {
    const k = Math.floor((px + x) / sp);
    const r = h * (.5 + hash(k, seed) * .5);
    circ(g, px, y - r * .6, r * .7); g.fill(); circ(g, px + sp * .4, y - r * .4, r * .55); g.fill();
  }
  g.fillRect(-10, y - h * .2, W + 20, h * .2 + 2);
}
/* 稻田：一条一条的田垄，近大远小 */
function paddies(g, x, y0, y1, o = {}) {
  const c1 = o.c1 || '#8CCB62', c2 = o.c2 || '#6DB24E';
  g.fillStyle = vgrad(g, y0, y1, [[0, mixc(c1, '#B9D8A8', .5)], [1, c1]]); g.fillRect(0, y0, W, y1 - y0);
  for (let i = 0; i < 14; i++) {
    const v = i / 14, yy = y0 + (y1 - y0) * v * v;
    g.strokeStyle = rgba(c2, .25 + v * .4); g.lineWidth = 1 + v * 4;
    g.beginPath(); g.moveTo(0, yy); g.lineTo(W, yy); g.stroke();
  }
  // 田埂
  g.strokeStyle = 'rgba(160,140,90,.5)'; g.lineWidth = 3;
  const sp = 520;
  for (let k = -1; k < 6; k++) { const xx = ((k * sp - x * 1.0) % (W + sp) + W + sp) % (W + sp) - 200; g.beginPath(); g.moveTo(xx, y0); g.lineTo(xx - 300, y1); g.stroke(); }
}
/* 电线杆和电线（离镜头近，跑得快） */
function poles(g, x, y, h, sp, o = {}) {
  const off = ((x % sp) + sp) % sp, col = o.col || '#3A3632';
  const tops = [];
  for (let px = -sp - off; px < W + sp; px += sp) {
    rr(g, px - 7, y - h, 14, h, 4); g.fillStyle = col; g.fill();
    rr(g, px - 46, y - h + 26, 92, 8, 3); g.fill();
    tops.push(px);
  }
  g.strokeStyle = rgba(col, .8); g.lineWidth = 2;
  for (const dy of [26, 40]) for (const dx of [-40, 40]) {
    g.beginPath();
    for (let i = 0; i + 1 < tops.length; i++) { const a = tops[i] + dx, b = tops[i + 1] + dx; g.moveTo(a, y - h + dy); g.quadraticCurveTo((a + b) / 2, y - h + dy + 36, b, y - h + dy); }
    g.stroke();
  }
}
/* 草：一丛一丛被风吹弯 */
function grass(g, s, y, n, o = {}) {
  const col = o.col || '#5FA84A', lite = o.lite || '#9AD46E', h = o.h || 60, x0 = o.x || 0, wind = o.wind ?? 1;
  g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const xx = ((hash(i, 21) * (W + 200) - x0) % (W + 200) + W + 200) % (W + 200) - 100;
    const hh = h * (.6 + hash(i, 22) * .7), bend = (Math.sin(s * 2.2 + xx * .01) * .5 + .7) * wind * 26;
    g.strokeStyle = hash(i, 23) < .5 ? col : lite; g.lineWidth = 3 + hash(i, 24) * 3;
    g.beginPath(); g.moveTo(xx, y + 6); g.quadraticCurveTo(xx + bend * .3, y - hh * .6, xx + bend, y - hh); g.stroke();
  }
}

/* ---------------- 河、铁桥、绿皮火车 ---------------- */
function river(g, s, y0, y1, o = {}) {
  const top = o.top || '#7FB8E0', bot = o.bot || '#4C88BE';
  g.fillStyle = vgrad(g, y0, y1, [[0, top], [1, bot]]); g.fillRect(0, y0, W, y1 - y0);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 60; i++) {
    const yy = y0 + hash(i, 41) * (y1 - y0), w = 30 + hash(i, 42) * 120;
    const xx = ((hash(i, 43) * (W + 200) + s * (20 + hash(i, 44) * 30)) % (W + 200)) - 100;
    g.fillStyle = `rgba(255,255,255,${.12 + .2 * (.5 + .5 * Math.sin(s * 3 + i))})`; g.fillRect(xx, yy, w, 2);
  }
  g.restore();
}
/* 绿皮火车：o.cars 节数，x 车头的位置（往右开），y 车轮底 */
function greenTrain(g, s, x, y, k = 1, o = {}) {
  const cars = o.cars || 7, cw = 520 * k, ch = 150 * k, gap = 14 * k;
  for (let i = 0; i < cars; i++) {
    const cx = x - (i + 1) * (cw + gap);
    if (cx > W + 20 || cx + cw < -20) continue;
    rr(g, cx, y - ch - 22 * k, cw, ch, 14 * k); g.fillStyle = '#2E6A4A'; g.fill();
    rr(g, cx, y - ch - 22 * k, cw, 26 * k, 12 * k); g.fillStyle = '#3B7C58'; g.fill();          // 车顶
    g.fillStyle = '#F2D36A'; g.fillRect(cx, y - 48 * k, cw, 8 * k);                            // 黄色腰线
    for (let j = 0; j < 9; j++) {
      const wx = cx + 24 * k + j * 54 * k;
      rr(g, wx, y - ch + 18 * k, 40 * k, 44 * k, 4 * k); g.fillStyle = o.lit ? '#FFE6A8' : '#BFD9E6'; g.fill();
      g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(wx + 4 * k, y - ch + 22 * k, 10 * k, 36 * k);
    }
    g.fillStyle = '#1E2A26'; g.fillRect(cx + 10 * k, y - 22 * k, cw - 20 * k, 10 * k);
    for (const wx of [60, 120, cw / k - 120, cw / k - 60]) { circ(g, cx + wx * k, y - 8 * k, 14 * k); g.fillStyle = '#26282C'; g.fill(); }
  }
  // 车头
  rr(g, x - 20 * k, y - ch - 22 * k, 200 * k, ch, [14 * k, 60 * k, 14 * k, 14 * k]); g.fillStyle = '#2E6A4A'; g.fill();
  g.fillStyle = '#F2D36A'; g.fillRect(x - 20 * k, y - 48 * k, 190 * k, 8 * k);
  rr(g, x + 70 * k, y - ch + 10 * k, 80 * k, 50 * k, 6 * k); g.fillStyle = '#BFD9E6'; g.fill();
  circ(g, x + 168 * k, y - 70 * k, 9 * k); g.fillStyle = '#FFF4C8'; g.fill(); glow(g, x + 168 * k, y - 70 * k, 40 * k, '#FFF0C0', .5);
}
/* 铁桁架桥：横跨画面，桥面在 y */
function trussBridge(g, x, y, o = {}) {
  const col = o.col || '#7A3E36', sp = 220, off = ((x % sp) + sp) % sp;
  g.fillStyle = shade(col, .8); g.fillRect(-10, y, W + 20, 16);
  g.strokeStyle = col; g.lineWidth = 9; g.lineJoin = 'round';
  g.beginPath();
  for (let px = -sp - off; px < W + sp; px += sp) { g.moveTo(px, y); g.lineTo(px + sp / 2, y - 150); g.lineTo(px + sp, y); g.moveTo(px + sp / 2, y - 150); g.lineTo(px + sp * 1.5, y - 150); }
  g.moveTo(-10, y - 150); g.lineTo(W + 10, y - 150);
  g.stroke();
  // 桥墩
  for (let px = -sp - off; px < W + sp; px += sp * 3) { g.fillStyle = '#A89C8E'; g.fillRect(px - 26, y + 16, 52, 300); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(px + 8, y + 16, 18, 300); }
}

/* ---------------- 小城：老街、站台、校门 ---------------- */
/* 一栋两三层的老房子：白墙、灰瓦或平顶，楼下是店，招牌是字 */
function shopHouse(g, x, y, w, h, o = {}) {
  const wall = o.wall || '#EDE3D2', trim = o.trim || '#C9B9A2';
  g.fillStyle = wall; g.fillRect(x, y - h, w, h);
  g.fillStyle = 'rgba(0,0,0,.06)'; g.fillRect(x + w - 16, y - h, 16, h);
  // 屋顶
  if (o.roof) { g.fillStyle = o.roof; g.beginPath(); g.moveTo(x - 18, y - h); g.lineTo(x + w + 18, y - h); g.lineTo(x + w - 10, y - h - 46); g.lineTo(x + 10, y - h - 46); g.closePath(); g.fill(); }
  else { g.fillStyle = trim; g.fillRect(x - 6, y - h - 12, w + 12, 14); }
  // 楼上的窗
  const floors = Math.max(1, Math.floor((h - 150) / 120));
  for (let f = 0; f < floors; f++) for (let i = 0; i < Math.floor(w / 110); i++) {
    const wx = x + 30 + i * 110, wy = y - h + 40 + f * 120;
    g.fillStyle = o.night ? (hash(i, f, w) < .5 ? '#FFD890' : '#3A3E5A') : '#9DB8CC'; g.fillRect(wx, wy, 60, 66);
    g.fillStyle = trim; g.fillRect(wx - 4, wy + 66, 68, 6);
    if (!o.night) { g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(wx + 6, wy + 6, 12, 54); }
  }
  // 店面
  const sh = 130;
  g.fillStyle = o.shop || '#6B5848'; g.fillRect(x + 12, y - sh, w - 24, sh);
  g.fillStyle = o.night ? 'rgba(255,214,140,.85)' : 'rgba(255,240,210,.35)'; g.fillRect(x + 22, y - sh + 10, w - 44, sh - 10);
  if (o.sign) {
    rr(g, x + 10, y - sh - 54, w - 20, 48, 4); g.fillStyle = o.signBg || '#C8382E'; g.fill();
    text(g, o.sign, x + w / 2, y - sh - 30, 30, { k: 'sans', col: o.signCol || '#FFF4D8', ls: 4 });
  }
  if (o.awning) { g.fillStyle = o.awning; g.beginPath(); g.moveTo(x + 6, y - sh); g.lineTo(x + w - 6, y - sh); g.lineTo(x + w + 10, y - sh + 34); g.lineTo(x - 10, y - sh + 34); g.closePath(); g.fill(); for (let i = 0; i < w; i += 40) { g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x + i, y - sh + 2, 20, 30); } }
}
const STREET = [
  { w: 360, h: 330, sign: '小卖部', signBg: '#C8382E', awning: '#E8705A', roof: '#7A706E' },
  { w: 300, h: 420, sign: '新华书店', signBg: '#2E5E9E', wall: '#F2EAD8' },
  { w: 330, h: 300, sign: '修车铺', signBg: '#4A6A3A', roof: '#6E6662' },
  { w: 280, h: 380, sign: '理发', signBg: '#D9902E', wall: '#E8DCC6' },
  { w: 360, h: 340, sign: '文具店', signBg: '#8E3E7A', awning: '#7FA8D8' },
  { w: 300, h: 300, sign: '早餐', signBg: '#B8402E', roof: '#7A706E' },
];
/* 老街：一排店铺，前面是人行道和马路；x 镜头横移 */
function oldStreet(g, s, x, o = {}) {
  const yb = o.y || 780;
  let total = 0; STREET.forEach(b => total += b.w + 30);
  let px = -((x % total) + total) % total - total;
  while (px < W + 400) {
    for (const b of STREET) { if (px > -b.w - 60 && px < W + 60) shopHouse(g, px, yb, b.w, b.h, { ...b, night: o.night }); px += b.w + 30; }
  }
  // 梧桐树（前排）
  for (let i = -1; i < 6; i++) { const tx = ((i * 520 - x * 1.15) % (W + 520) + W + 520) % (W + 520) - 260; tree(g, tx, yb + 20, 120, { col: '#4E9A50', lite: '#9ED47A', dark: '#33703E', sway: Math.sin(s * 1.6 + i) * 6 * (o.wind || 1) }); }
  // 人行道、马路
  g.fillStyle = o.night ? '#5A5868' : '#CFC6B6'; g.fillRect(0, yb, W, 60);
  g.fillStyle = 'rgba(0,0,0,.08)'; for (let i = 0; i < 30; i++) g.fillRect(((i * 120 - x) % W + W) % W, yb, 2, 60);
  g.fillStyle = o.night ? '#3A3A48' : '#8E8C88'; g.fillRect(0, yb + 60, W, H - yb - 60);
  g.fillStyle = 'rgba(255,255,255,.5)'; for (let i = -1; i < 12; i++) g.fillRect(((i * 220 - x * 1.3) % (W + 220) + W + 220) % (W + 220) - 110, yb + 170, 110, 8);
}
/* 站台：站牌、雨棚的柱子、黄线 */
function platform(g, s, x, o = {}) {
  const y = o.y || 820;
  // 雨棚
  g.fillStyle = '#E9E2D6'; g.fillRect(0, 0, W, 90); g.fillStyle = '#CFC4B2'; g.fillRect(0, 90, W, 14);
  const sp = 460, off = ((x % sp) + sp) % sp;
  for (let px = -off; px < W + sp; px += sp) { g.fillStyle = '#5E7E9A'; g.fillRect(px - 10, 100, 20, y - 100); g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(px + 4, 100, 6, y - 100); }
  // 站台面
  g.fillStyle = vgrad(g, y, H, [[0, '#D8D0C2'], [1, '#B8AE9E']]); g.fillRect(0, y, W, H - y);
  g.fillStyle = '#F2C64A'; g.fillRect(0, y + 24, W, 14);
  // 站牌
  if (o.sign !== false) {
    const sx = (o.signX ?? 1240) - x * .0;
    rr(g, sx - 300, 250, 600, 190, 10); g.fillStyle = '#FFFFFF'; g.fill(); g.strokeStyle = '#2E5E9E'; g.lineWidth = 6; g.stroke();
    text(g, '清溪', sx, 315, 92, { k: 'sans', col: '#1E3E7A', ls: 30 });
    text(g, 'QINGXI', sx, 392, 36, { k: 'sans', col: '#2E5E9E', ls: 10 });
    g.fillStyle = '#2E5E9E'; g.fillRect(sx - 300, 412, 600, 28);
    text(g, '◀ 江城', sx - 200, 427, 22, { k: 'sans', col: '#fff' }); text(g, '白沙 ▶', sx + 200, 427, 22, { k: 'sans', col: '#fff' });
    g.fillStyle = '#5E7E9A'; g.fillRect(sx - 240, 440, 14, y - 440); g.fillRect(sx + 226, 440, 14, y - 440);
  }
}
/* 校门：两根门柱、校名、电动伸缩门、门卫室；o.banner 横幅；o.now 七年后（旧一点） */
function schoolGate(g, s, o = {}) {
  const y = o.y || 860, cx = o.cx ?? 960;
  // 院墙
  g.fillStyle = o.now ? '#E6DCCB' : '#F2EBDD'; g.fillRect(0, y - 190, W, 190);
  g.fillStyle = '#C24A3A'; g.fillRect(0, y - 200, W, 14);
  for (let i = 0; i < 24; i++) { g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(i * 90, y - 186, 4, 186); }
  // 门柱
  for (const dx of [-380, 380]) { rr(g, cx + dx - 70, y - 420, 140, 420, 6); g.fillStyle = '#E8E0D2'; g.fill(); g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(cx + dx + 30, y - 420, 40, 420); g.fillStyle = '#B8A890'; g.fillRect(cx + dx - 80, y - 440, 160, 30); }
  // 校名
  rr(g, cx - 330, y - 520, 660, 110, 8); g.fillStyle = '#8E2E26'; g.fill();
  text(g, '清溪第一中学', cx, y - 466, 64, { k: 'serifX', col: '#F6D78A', ls: 10 });
  // 横幅
  if (o.banner) { g.fillStyle = '#D83A2E'; g.fillRect(cx - 360, y - 400, 720, 70); text(g, o.banner, cx, y - 365, 40, { k: 'sans', col: '#FFF0C8', ls: 8 }); }
  // 伸缩门（半开）
  const open = o.open ?? .6;
  g.strokeStyle = '#9AA2AE'; g.lineWidth = 4;
  for (let i = 0; i < 10; i++) { const gx = cx - 300 + i * 26 * (1 - open * .7); g.beginPath(); g.moveTo(gx, y - 110); g.lineTo(gx + 26, y - 10); g.moveTo(gx + 26, y - 110); g.lineTo(gx, y - 10); g.stroke(); }
  // 地面
  g.fillStyle = vgrad(g, y, H, [[0, '#CFC6B6'], [1, '#B4AA9A']]); g.fillRect(0, y, W, H - y);
}
/* 教学楼的正面：几层楼的外走廊（栏杆）、窗户、门；o.now 七年后、o.night 晚自习亮灯、o.papers 往下扔的试卷 */
function teachBuilding(g, s, x0, y0, w, floors, o = {}) {
  const fh = o.fh || 150;
  g.fillStyle = o.wall || '#EFE6D6'; g.fillRect(x0, y0 - floors * fh - 40 * fh / 150, w, floors * fh + 40 * fh / 150);
  g.fillStyle = '#C24A3A'; g.fillRect(x0, y0 - floors * fh - 50 * fh / 150, w, 16 * fh / 150);
  for (let f = 0; f < floors; f++) {
    const fy = y0 - (f + 1) * fh;
    // 走廊里面的墙和窗
    g.fillStyle = '#D9CDB8'; g.fillRect(x0, fy + 10, w, fh - 40);
    const q = fh / 150;
    for (let i = 0; i * 140 * q + 60 * q < w; i++) {
      const wx = x0 + 40 * q + i * 140 * q;
      const lit = o.night && hash(i, f, 7) < .85;
      g.fillStyle = lit ? '#FFE9B0' : '#8FB0C8'; g.fillRect(wx, fy + 28 * q, 90 * q, 70 * q);
      if (lit) glow(g, wx + 45 * q, fy + 63 * q, 80 * q, '#FFE0A0', .25);
    }
    // 栏杆
    g.fillStyle = '#F6F0E4'; g.fillRect(x0, fy + fh - 34 * q, w, 34 * q);
    g.fillStyle = 'rgba(0,0,0,.08)'; g.fillRect(x0, fy + fh - 6 * q, w, 6 * q);
  }
  g.fillStyle = '#D6CCBA'; g.fillRect(x0, y0 - 20 * fh / 150, w, 20 * fh / 150);
}
/* 操场：红色跑道、白线、绿草坪；x 镜头横移 */
function track(g, s, x, y, o = {}) {
  g.fillStyle = '#5FAE58'; g.fillRect(0, y - 80, W, 80);
  for (let i = 0; i < 20; i++) { g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(((i * 200 - x) % (W + 200) + W + 200) % (W + 200) - 100, y - 80, 100, 80); }
  g.fillStyle = vgrad(g, y, H, [[0, '#C8553E'], [1, '#A84432']]); g.fillRect(0, y, W, H - y);
  g.strokeStyle = 'rgba(255,255,255,.85)'; g.lineWidth = 4;
  for (let i = 0; i < 6; i++) { const yy = y + 20 + i * (H - y) / 6 * (1 + i * .12) * .8; g.beginPath(); g.moveTo(0, yy); g.lineTo(W, yy); g.stroke(); }
}
/* 看台上的人群（剪影 + 衣服颜色），会跟着欢呼跳 */
function crowd(g, s, y, n, k = 1, o = {}) {
  for (let i = 0; i < n; i++) {
    const xx = ((hash(i, 61) * (W + 100) - (o.x || 0)) % (W + 100) + W + 100) % (W + 100) - 50, yy = y + hash(i, 62) * 40 * k;
    const jump = (o.cheer || 0) * Math.max(0, Math.sin(s * 9 + i)) * 10 * k;
    const col = o.cols ? o.cols[i % o.cols.length] : (hash(i, 63) < .6 ? '#3E69B1' : '#F4F6FA');
    g.fillStyle = col; rr(g, xx - 16 * k, yy - 40 * k - jump, 32 * k, 46 * k, 10 * k); g.fill();
    circ(g, xx, yy - 54 * k - jump, 14 * k); g.fillStyle = KID_HAIR[i % KID_HAIR.length]; g.fill();
    if (o.cheer && hash(i, 64) < .5) { g.strokeStyle = col; g.lineWidth = 8 * k; g.lineCap = 'round'; g.beginPath(); g.moveTo(xx + 12 * k, yy - 34 * k - jump); g.lineTo(xx + 22 * k, yy - 70 * k - jump - Math.sin(s * 9 + i) * 6); g.stroke(); }
  }
}
/* 河边的路：夕阳、垂柳、河面的倒影 */
function riverRoad(g, s, x, o = {}) {
  summerSky(g, s, { tod: o.tod || 'sunset', x, sun: o.sun || [1500, 600, 60], clouds: 3, cy: 560, cw: 620 });
  ridge(g, x * .1, 640, 90, '#8C6A94', 3, .002, 3);
  river(g, s, 660, 820, { top: '#F2A88A', bot: '#B07898' });
  glow(g, 1500, 700, 260, '#FFD8A0', .4);
  // 柳树
  for (let i = -1; i < 5; i++) {
    const tx = ((i * 560 - x * 1.1) % (W + 560) + W + 560) % (W + 560) - 280;
    line(g, tx, 860, tx + 10, 520, '#4A3A34', 16);
    for (let j = 0; j < 16; j++) {
      const a = (j / 16 - .5) * 2.2, len = 180 + hash(j, i) * 140, sw = Math.sin(s * 1.5 + j * .7 + i) * 18;
      g.strokeStyle = rgba(j % 3 ? '#5E8A46' : '#88B05C', .9); g.lineWidth = 4;
      g.beginPath(); g.moveTo(tx + 10 + Math.sin(a) * 60, 520 + Math.cos(a) * 10); g.quadraticCurveTo(tx + 10 + Math.sin(a) * 140 + sw * .5, 560, tx + 10 + Math.sin(a) * 120 + sw, 520 + len); g.stroke();
    }
  }
  g.fillStyle = vgrad(g, 840, H, [[0, '#B58A78'], [1, '#8E6A62']]); g.fillRect(0, 840, W, H - 840);
  g.fillStyle = 'rgba(255,220,180,.25)'; g.fillRect(0, 840, W, 6);
}
