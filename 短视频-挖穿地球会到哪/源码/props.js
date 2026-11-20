'use strict';
/* props.js：本片的场景和道具——黄昏的院子（挖洞）、星空和地球的剖面、机场的翻牌子出发屏、黑夜里的深洞、
   钻井和一把大尺子、发烫的地层和温度计、往下掉的隧道、阿根廷夜里的草原和奶牛、来回掉的示意图。全部程序画的像素图。
   背景缓冲 216×384（每个像素 5 个屏幕像素），小怪按 k=10 画，和背景的像素对齐。 */

/* ================= 小怪：直接按整数倍画到屏幕上 ================= */
/* (cx, by)：身体中线、脚底（屏幕坐标）；k：一个世界像素占几个屏幕像素 */
function crabAt(g, cx, by, k, o = {}, flip = false) {
  const c = clawd(o), x = Math.round(cx - 12 * k), y = Math.round(by - 16 * k);
  g.save(); g.imageSmoothingEnabled = false;
  if (!flip) g.drawImage(c, x - CL_OX * k, y - CL_OY * k, CL_W * k, CL_H * k);
  else { g.translate(x + 24 * k, y - CL_OY * k); g.scale(-1, 1); g.drawImage(c, -CL_OX * k, 0, CL_W * k, CL_H * k); }
  g.restore();
}
/* 小怪身上某个世界像素（相对身体左上角）在屏幕上的位置 */
function crabPt(cx, by, k, lx, ly, flip = false) { return [Math.round(cx - 12 * k) + (flip ? 24 - lx : lx) * k, Math.round(by - 16 * k) + ly * k]; }
/* "你"：红领巾、会眨眼 */
const youO = (t, o = {}) => Object.assign({ scarf: true, eyes: blinkEyes(t, 1) }, o);
/* 其他人：换颜色、换帽子 */
const PEOPLE = [
  { col: TONES.blue, hat: 'cap' }, { col: TONES.green }, { col: TONES.purple, glasses: true }, { col: TONES.yellow, hat: 'straw' },
  { col: TONES.pink }, { col: TONES.teal, hat: 'band' }, { col: TONES.gray, glasses: true }, { col: '#8FB8E8' },
];
const person = (i, o = {}) => Object.assign({}, PEOPLE[i % PEOPLE.length], o);
/* 脚下的影子 */
function shadowAt(g, cx, by, k, w = 20) { g.save(); g.fillStyle = 'rgba(0,0,0,.22)'; g.fillRect(Math.round(cx - w / 2 * k), by, Math.round(w * k), k); g.fillRect(Math.round(cx - (w / 2 - 2) * k), by + k, Math.round((w - 4) * k), k); g.restore(); }

/* ================= 画面元素 ================= */
function clipRect(g, x, y, w, h, fn) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); }
function clipOval(g, cx, cy, rx, ry, fn) { g.save(); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.clip(); fn(); g.restore(); }
/* 颜色插值 */
function mixHex(a, b, u) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = s => [(s >> 16) & 255, (s >> 8) & 255, s & 255];
  const [r1, g1, b1] = ch(pa), [r2, g2, b2] = ch(pb);
  const f = (x, y) => Math.round(x + (y - x) * clamp(u)).toString(16).padStart(2, '0');
  return '#' + f(r1, r2) + f(g1, g2) + f(b1, b2);
}
/* 像素椭圆环 */
function pixRing(g, cx, cy, rx, ry, th, k, col, col2) {
  const nx = Math.ceil(rx / k), ny = Math.ceil(ry / k);
  for (let j = -ny; j <= ny; j++) for (let i = -nx; i <= nx; i++) {
    const x = (i + .5) * k / rx, y = (j + .5) * k / ry, r = x * x + y * y;
    const xi = (i + .5) * k / (rx - th * k), yi = (j + .5) * k / (ry - th * k), ri2 = xi * xi + yi * yi;
    if (r <= 1 && ri2 > 1) { g.fillStyle = col2 && (i + j) % 4 === 0 ? col2 : col; g.fillRect(Math.round(cx + i * k), Math.round(cy + j * k), k, k); }
  }
}
/* 像素实心椭圆（屏幕坐标，k 像素一格） */
function pixOval(g, cx, cy, rx, ry, k, col) {
  g.fillStyle = col;
  for (let j = -Math.ceil(ry / k); j <= Math.ceil(ry / k); j++) {
    const y = (j + .5) * k / ry; if (Math.abs(y) > 1) continue;
    const hw = Math.round(rx * Math.sqrt(1 - y * y) / k) * k;
    g.fillRect(Math.round(cx - hw), Math.round(cy + j * k), hw * 2, k);
  }
}
function pixArrow(g, x0, y0, x1, y1, k, col, u = 1) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), n = Math.floor(L * u / k);
  g.fillStyle = col;
  for (let i = 0; i < n; i++) if (i % 3 !== 2) g.fillRect(Math.round(x0 + dx * i * k / L - k / 2), Math.round(y0 + dy * i * k / L - k / 2), k, k);
  if (u >= 1) { const a = Math.atan2(dy, dx); for (const s of [-1, 1]) for (let i = 1; i <= 3; i++) g.fillRect(Math.round(x1 - Math.cos(a + s * .6) * i * k - k / 2), Math.round(y1 - Math.sin(a + s * .6) * i * k - k / 2), k, k); }
}

/* 像素对勾 / 叉 */
function checkMark(g, x, y, k = 6, col = C.green) { g.fillStyle = col; [[0, 2], [1, 3], [2, 4], [3, 3], [4, 2], [5, 1], [6, 0]].forEach(([i, j]) => g.fillRect(x + i * k, y + j * k, k, k)); }
/* 便利贴：(x,y) 中心；lines 一两行字 */
function stickyNote(g, x, y, w, h, lines, o = {}) {
  g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(o.rot || 0);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-w / 2 + 10, -h / 2 + 10, w, h);
  g.fillStyle = o.fill || '#FFE27A'; g.fillRect(-w / 2, -h / 2, w, h);
  g.fillStyle = o.band || 'rgba(0,0,0,.08)'; g.fillRect(-w / 2, -h / 2, w, 18);
  const px = o.px || 40;
  lines.forEach((s, i) => prich(g, s, 0, (i - (lines.length - 1) / 2) * px * 1.3 + px * .42, px, C.ink, o.hl || '#C0392B', { align: 'center' }));
  g.restore();
}
/* 好感度血条：(x,y) 左上；v 0..1 剩多少；lost 0..1 刚掉的那一截（红色闪） */
function hpBar(g, x, y, w, v, o = {}) {
  const h = o.h || 48, k = 6;
  g.save();
  g.fillStyle = C.ink; g.fillRect(x - k, y - k, w + 2 * k, h + 2 * k);
  g.fillStyle = '#3B3363'; g.fillRect(x, y, w, h);
  const vv = clamp(v), lost = clamp(o.lost || 0);
  if (lost > vv) { g.fillStyle = '#FF5A4F'; g.fillRect(x, y, Math.round(w * lost / 6) * 6, h); }
  g.fillStyle = o.col || C.green; g.fillRect(x, y, Math.round(w * vv / 6) * 6, h);
  g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x, y, Math.round(w * vv / 6) * 6, k);
  for (let i = 1; i < 10; i++) { g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(x + Math.round(w * i / 10), y, 3, h); }
  g.restore();
}
/* 竖的柱子（打分）：(x, by) 底边中心 */
function scoreBar(g, x, by, w, hgt, col) {
  g.fillStyle = C.ink; g.fillRect(Math.round(x - w / 2 - 6), Math.round(by - hgt - 6), w + 12, Math.round(hgt + 6));
  g.fillStyle = col; g.fillRect(Math.round(x - w / 2), Math.round(by - hgt), w, Math.round(hgt));
  g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(Math.round(x - w / 2), Math.round(by - hgt), 12, Math.round(hgt));
}
/* 星星（"主角"徽章） */
function pixStar(g, x, y, k, col = C.gold, col2 = '#FFF2A8') {
  const rows = ['....#....', '...###...', '#########', '.#######.', '..#####..', '.###.###.', '.##...##.'];
  rows.forEach((r, j) => { for (let i = 0; i < 9; i++) if (r[i] === '#') { g.fillStyle = (j < 3 && i < 5) ? col2 : col; g.fillRect(Math.round(x + (i - 4.5) * k), Math.round(y + (j - 3.5) * k), k, k); } });
}
/* 像素爱心 */
function iconHeart(g, x, y, k = 6, col = '#FF6F8E') {
  g.fillStyle = col;
  ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'].forEach((r, j) => { for (let i = 0; i < 7; i++) if (r[i] === '#') g.fillRect(Math.round(x + (i - 3.5) * k), Math.round(y + (j - 3) * k), k, k); });
}
/* 灯泡（获得情报的图标） */
function bulbIcon(g, x, y, k, on = 1) {
  const rows = ['..#####..', '.#yyyyy#.', '#yyywyyy#', '#yyyyyyy#', '#yyyyyyy#', '.#yyyyy#.', '..#yyy#..', '..#sss#..', '..#sss#..', '...###...'];
  const pal = { '#': C.ink, y: on ? '#FFE066' : '#C9C2A8', w: '#FFFFFF', s: '#9AA1AD' };
  rows.forEach((r, j) => { for (let i = 0; i < 9; i++) if (pal[r[i]]) { g.fillStyle = pal[r[i]]; g.fillRect(Math.round(x + (i - 4.5) * k), Math.round(y + (j - 5) * k), k, k); } });
  if (on) for (let i = 0; i < 8; i++) { const a = i * TAU / 8; g.fillStyle = '#FFE066'; g.fillRect(Math.round(x + Math.cos(a) * 9 * k - k), Math.round(y - k + Math.sin(a) * 9 * k - k), 2 * k, 2 * k); }
}
/* 想法气泡（云朵形）：(x,y) 中心，尾巴的小圆点朝 (tx,ty) */
function thoughtBubble(g, x, y, w, h, s, tx, ty, o = {}) {
  const px = o.px || 36;
  g.save();
  const bub = (cx, cy, rx, ry) => { pixOval(g, cx, cy, rx + 6, ry + 6, 6, C.ink); pixOval(g, cx, cy, rx, ry, 6, o.fill || '#FFFFFF'); };
  for (let i = 1; i <= 2; i++) { const u = i / 3; bub(lerp(tx, x, u * .7), lerp(ty, y + h / 2, u * .7), 6 + i * 6, 6 + i * 5); }
  bub(x, y, w / 2, h / 2);
  prich(g, s, x, y + px * .38, px, C.ink, o.hl || '#C0392B', { align: 'center' });
  g.restore();
}

/* ================= 背景 ================= */
/* 浅色方格纸 */
function bgPaper(g, c1 = '#FBF6EA', c2 = 'rgba(120,150,200,.12)') {
  g.fillStyle = c1; g.fillRect(0, 0, W, H);
  g.fillStyle = c2; for (let x = 0; x < W; x += 48) g.fillRect(x, 0, 2, H); for (let y = 0; y < H; y += 48) g.fillRect(0, y, W, 2);
}
/* 深色网格（会慢慢往下走） */
function bgGrid(g, t, c1 = '#1C2238', c2 = 'rgba(120,200,255,.08)') {
  g.fillStyle = c1; g.fillRect(0, 0, W, H);
  g.fillStyle = c2; for (let x = 0; x < W; x += 48) g.fillRect(x, 0, 2, H); for (let y = (t * 12) % 48; y < H; y += 48) g.fillRect(0, y, W, 2);
}
/* 字符画按 k 倍画到屏幕上，(x, y) 是中心 */
function pix(g, rows, pal, x, y, k, o = {}) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  const x0 = Math.round(x - w * k / 2), y0 = Math.round(y - h * k / 2);
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) { g.fillStyle = c; g.fillRect(x0 + (o.flip ? w - 1 - i : i) * k, y0 + j * k, k, k); } } });
}

/* 办公室（缓冲 108×192，P=10）：墙、右边一扇窗（窗外是楼）、挂钟、绿植、木地板（地平线 y=113） */


/* ================= 通用的光、星 ================= */
/* 柔光：(x, y) 中心、r 半径的径向渐变（屏幕坐标） */
function glow(g, x, y, r, col, a = 1) {
  g.save(); g.globalAlpha *= a; g.globalCompositeOperation = 'lighter';
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, col); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); g.restore();
}
/* 星：按种子撒在 (x0,y0,w,h) 里，一闪一闪；k 像素大小 */
function starField(g, t, n, x0, y0, w, h, k = 5, seed = 1) {
  for (let i = 0; i < n; i++) {
    const x = x0 + hash(i, seed) * w, y = y0 + hash(i, seed, 7) * h, tw = .5 + .5 * Math.sin(t * (1.5 + hash(i, 3) * 3) + i);
    const big = hash(i, seed, 9) > .9;
    g.fillStyle = `rgba(255,${230 + Math.round(hash(i, 5) * 25)},${200 + Math.round(hash(i, 6) * 55)},${.35 + .65 * tw})`;
    g.fillRect(Math.round(x / k) * k, Math.round(y / k) * k, k, k);
    if (big && tw > .7) { g.fillRect(Math.round(x / k) * k - k, Math.round(y / k) * k, 3 * k, k); g.fillRect(Math.round(x / k) * k, Math.round(y / k) * k - k, k, 3 * k); }
  }
}

/* ================= 院子 ================= */
/* 院子（缓冲 216×384）：渐变天、两层云、飞鸟、远处的城（亮窗）、树、篱笆、晾衣绳、草地。night 0..1 从黄昏到夜里 */
const YARD_HY = 236;          // 草地的顶（缓冲坐标），屏幕 y = 1180
function yardBG(b, t, night = 0) {
  const hy = YARD_HY, m = (a, c) => mixHex(a, c, night);
  pbands(b, 0, 216, [[0, m('#5B4FA8', '#0F1433')], [70, m('#A8629E', '#1A2050')], [130, m('#F0866A', '#2A2A62')], [180, m('#FFB46E', '#3A3470')], [hy, m('#FFD79E', '#4A3F7A')]], 3);
  // 星（天黑了才有）
  if (night > .3) for (let i = 0; i < 70; i++) { const tw = .5 + .5 * Math.sin(t * 2 + i * 1.7); if (hash(i, 2) * 180 < hy - 60) pdot(b, hash(i, 1) * 216, hash(i, 2) * 180, `rgba(255,250,220,${(night - .3) * 1.4 * (.4 + .6 * tw)})`); }
  // 太阳 / 月亮
  if (night < .6) { pdisc(b, 160, 168 + night * 60, 14, m('#FFE7A8', '#FFE7A8')); pdisc(b, 160, 168 + night * 60, 11, '#FFF4D2'); }
  else { pdisc(b, 168, 44, 9, '#F4F1E0'); pdisc(b, 171, 41, 8, m('#5B4FA8', '#0F1433')); }
  // 云：两层，远的慢、近的快
  for (let i = 0; i < 5; i++) {
    const sp = i < 3 ? 2 : 4.5, x = ((i * 61 + t * sp) % 290) - 40, y = 30 + (i * 37) % 110, w = i < 3 ? 18 : 26;
    const c1 = m(i < 3 ? '#F7B79A' : '#FFD2B0', '#3A3F78'), c2 = m('#FFE6CF', '#4D5290');
    pell(b, x, y, w, 4, c1); pell(b, x - 5, y - 3, w * .5, 4, c2); pell(b, x + 7, y - 2, w * .45, 3, c2);
  }
  // 飞鸟：一群 V 字从右往左飞
  for (let i = 0; i < 5; i++) {
    const x = 230 - ((t * 14 + i * 9) % 300), y = 96 + i * 5 + Math.sin(t * 2 + i) * 2, up = Math.floor(t * 6 + i) % 2;
    const c = m('#5A3A4A', '#0B0E22');
    pdot(b, x, y, c); pdot(b, x - 1, y - (up ? 1 : 0), c); pdot(b, x + 1, y - (up ? 1 : 0), c); pdot(b, x - 2, y - (up ? 2 : 0), c); pdot(b, x + 2, y - (up ? 2 : 0), c);
  }
  // 远处的城：楼的剪影，亮窗一闪一闪，一座电视塔
  for (let i = 0; i < 18; i++) {
    const bx = i * 12 + Math.round(hash(i, 4) * 4), bh = 22 + Math.round(hash(i, 8) * 34), bw = 9 + Math.round(hash(i, 6) * 4);
    prect(b, bx, hy - 14 - bh, bw, bh + 14, m(i % 2 ? '#7A4F7E' : '#6A4574', i % 2 ? '#1E2048' : '#1A1B40'));
    for (let wy = hy - 12 - bh; wy < hy - 16; wy += 4) for (let wx = bx + 2; wx < bx + bw - 1; wx += 3) {
      const on = hash(wx, wy, 3) > (night > .5 ? .35 : .7) && Math.sin(t * .7 + hash(wx, wy) * 40) > -.8;
      if (on) pdot(b, wx, wy, night > .5 ? '#FFD98A' : '#FFE3B0');
    }
  }
  prect(b, 120, hy - 96, 2, 82, m('#6A4574', '#1A1B40')); pell(b, 121, hy - 70, 5, 3, m('#6A4574', '#1A1B40')); if (Math.floor(t * 2) % 2) pdot(b, 121, hy - 98, '#FF5A4F');
  // 树（左边）：树干 + 几团叶子，跟着风摆
  const sw = Math.sin(t * 1.3) * 1.5;
  prect(b, 20, hy - 60, 6, 64, m('#6B4630', '#2A1E2A'));
  for (const [dx, dy, r, c] of [[0, -70, 22, '#3E7D3A'], [-12, -60, 15, '#4C9A44'], [12, -62, 16, '#4C9A44'], [-4, -82, 13, '#5DB65A']]) pdisc(b, 23 + dx + sw * (dy < -70 ? 1.4 : 1), hy + dy, r, m(c, '#1D3A2A'));
  // 篱笆
  for (let x = 0; x < 216; x += 9) { prect(b, x, hy - 22, 6, 24, m('#C98A5E', '#3A2E40')); prect(b, x + 1, hy - 24, 4, 2, m('#C98A5E', '#3A2E40')); }
  prect(b, 0, hy - 17, 216, 2, m('#A8704A', '#2E2436')); prect(b, 0, hy - 8, 216, 2, m('#A8704A', '#2E2436'));
  // 晾衣绳：两根杆子之间，衣服随风摆
  prect(b, 150, hy - 70, 2, 70, m('#8A6A50', '#2E2436')); prect(b, 206, hy - 70, 2, 70, m('#8A6A50', '#2E2436'));
  pline(b, 151, hy - 68, 207, hy - 66, m('#EDE2D0', '#5A5070'));
  [[158, '#E5322D', 10], [172, '#5EC8FF', 8], [186, '#FFD34E', 11], [198, '#F4F4F4', 7]].forEach(([x, c, h], i) => {
    const sway = Math.round(Math.sin(t * 2.2 + i) * 1.2);
    prect(b, x + sway, hy - 66, 9, h, m(c, '#3E3A62')); prect(b, x + sway, hy - 66, 9, 1, m(shadeOf(c, .8), '#2E2A52'));
  });
  // 草地：两层颜色 + 一根根随风摆的草
  pbands(b, 0, 216, [[hy, m('#6DBB4A', '#24402E')], [hy + 30, m('#5AA640', '#1E3628')], [384, m('#4C9236', '#18301F')]], 3);
  for (let i = 0; i < 140; i++) {
    const x = hash(i, 11) * 216, y = hy + 2 + hash(i, 12) * 140, s = Math.round(Math.sin(t * 2 + x * .1) * 1);
    pdot(b, x + s, y - 1, m('#8ED46A', '#2F5A3C')); pdot(b, x, y, m('#4C9236', '#18301F'));
  }
  // 小花
  for (let i = 0; i < 16; i++) { const x = hash(i, 21) * 216, y = hy + 8 + hash(i, 22) * 120; pdot(b, x, y, m(['#FFFFFF', '#FFD34E', '#FF8FB0'][i % 3], '#5A5A80')); }
}
/* 院子里的洞：(x, y) 洞口中心（屏幕），w 宽；depth 0..1 挖了多深（洞口变大、里面更黑） */
function yardHole(g, x, y, w, depth, t) {
  const h = Math.round(w * .32);
  pixOval(g, x, y + 6, w / 2 + 16, h / 2 + 10, 5, '#5A3A22');          // 翻出来的土
  pixOval(g, x, y, w / 2 + 6, h / 2 + 5, 5, '#3A2414');
  pixOval(g, x, y, w / 2, h / 2, 5, mixHex('#2A1A10', '#05030A', depth));
  if (depth > .6) glow(g, x, y + 4, w * .45, `rgba(255,90,40,${.25 * (depth - .6) / .4 * (.7 + .3 * Math.sin(t * 5))})`);
  // 土堆
  for (let i = 0; i < 9; i++) pixOval(g, x - w / 2 - 40 + (i % 3) * 22, y - 10 - Math.floor(i / 3) * 14, 22 - Math.floor(i / 3) * 4, 10, 5, ['#6B4630', '#7A5236', '#5A3A22'][i % 3]);
}
/* 铲子：把手在 (x, y)，ang 往下指的角度 */
function shovel(g, x, y, ang, k = 5) {
  g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(ang);
  g.fillStyle = '#8A5A35'; g.fillRect(-k, -4 * k, 2 * k, 22 * k);
  g.fillStyle = '#5E3B22'; g.fillRect(-3 * k, -5 * k, 6 * k, 2 * k);
  g.fillStyle = '#9AA1AD'; g.fillRect(-4 * k, 18 * k, 8 * k, 7 * k); g.fillRect(-3 * k, 25 * k, 6 * k, 2 * k);
  g.fillStyle = '#C9CED8'; g.fillRect(-4 * k, 18 * k, 2 * k, 7 * k);
  g.restore();
}
/* 飞起来的土：从 (x, y) 抛出去，t0 开始 */
function dirtBurst(g, x, y, t, t0, n = 10, k = 5) {
  const u = t - t0; if (u < 0 || u > 1.1) return;
  for (let i = 0; i < n; i++) {
    const vx = (hash(i, t0 * 7) - .3) * 420, vy = -300 - hash(i, t0 * 9) * 260;
    const px = x + vx * u, py = y + vy * u + 900 * u * u;
    g.fillStyle = ['#6B4630', '#8A5A35', '#5A3A22'][i % 3]; g.fillRect(Math.round(px / k) * k, Math.round(py / k) * k, 2 * k, 2 * k);
  }
}

/* ================= 太空和地球的剖面 ================= */
function spaceBG(g, t, o = {}) {
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#070818'); gr.addColorStop(.6, '#0E1030'); gr.addColorStop(1, '#1A1240');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  glow(g, 260, 520, 520, 'rgba(90,60,160,.35)'); glow(g, 820, 1300, 600, 'rgba(40,90,160,.28)');     // 星云
  starField(g, t, 160, 0, 0, W, H, 5, 3); starField(g, t * 1.3, 60, 0, 0, W, H, 5, 9);
  if (o.sun !== false) { glow(g, 1040, 170, 420, 'rgba(255,200,120,.55)'); pixOval(g, 1040, 170, 70, 70, 5, '#FFE9A8'); }
  // 一颗流星
  const u = (t * .25) % 1; if (u < .12) { const x = 900 - u * 5000, y = 300 + u * 2400; for (let i = 0; i < 10; i++) { g.fillStyle = `rgba(255,255,255,${1 - i / 10})`; g.fillRect(Math.round(x + i * 20), Math.round(y - i * 10), 10, 5); } }
}
/* 地球剖面：(cx, cy) 中心、R 半径；地壳、地幔（慢慢翻滚的点）、外核、内核（发白光）；o.equator 画赤道 */
const LAYERS = [[1, '#5A8A3E'], [.985, '#8A5A35'], [.97, '#D9532F'], [.55, '#F28C28'], [.19, '#FFE07A']];
function earthCut(g, cx, cy, R, t, o = {}) {
  glow(g, cx, cy, R * 1.35, 'rgba(110,170,255,.25)');
  pixOval(g, cx, cy, R + 10, R + 10, 5, '#2B6CC4');                 // 海和大气的一圈
  pixOval(g, cx, cy, R, R, 5, '#3E7D3A');
  pixOval(g, cx, cy, R * .985, R * .985, 5, '#8A5A35');
  pixOval(g, cx, cy, R * .97, R * .97, 5, '#C7442A');
  // 地幔里慢慢翻滚的亮点
  for (let i = 0; i < 70; i++) {
    const a = hash(i, 1) * TAU + t * .15 * (i % 2 ? 1 : -1), r = R * (.58 + hash(i, 2) * .37);
    g.fillStyle = `rgba(255,${120 + Math.round(hash(i, 3) * 80)},60,${.35 + .3 * Math.sin(t * 2 + i)})`;
    g.fillRect(Math.round((cx + Math.cos(a) * r) / 5) * 5, Math.round((cy + Math.sin(a) * r) / 5) * 5, 5, 5);
  }
  pixOval(g, cx, cy, R * .55, R * .55, 5, '#F28C28');
  for (let i = 0; i < 36; i++) { const a = hash(i, 4) * TAU - t * .4, r = R * (.22 + hash(i, 5) * .3); g.fillStyle = 'rgba(255,230,120,.5)'; g.fillRect(Math.round((cx + Math.cos(a) * r) / 5) * 5, Math.round((cy + Math.sin(a) * r) / 5) * 5, 5, 5); }
  pixOval(g, cx, cy, R * .19, R * .19, 5, '#FFE07A');
  glow(g, cx, cy, R * .3, 'rgba(255,250,220,.65)');
  if (o.equator) {
    for (let x = cx - R - 30; x < cx + R + 30; x += 20) { g.fillStyle = 'rgba(255,255,255,.8)'; g.fillRect(x, cy - 2, 12, 5); }
  }
}
/* 穿过地心的一条线：从角度 a（0 在正上方，顺时针）的地表穿到对面；u 0..1 画了多少 */
function throughLine(g, cx, cy, R, a, u, col = '#FFFFFF') {
  const x0 = cx + Math.sin(a) * R, y0 = cy - Math.cos(a) * R, x1 = cx - Math.sin(a) * R, y1 = cy + Math.cos(a) * R;
  const n = Math.floor(clamp(u) * 60);
  for (let i = 0; i < n; i++) { if (i % 3 === 2) continue; const v = i / 60; g.fillStyle = col; g.fillRect(Math.round(lerp(x0, x1, v) / 5) * 5 - 5, Math.round(lerp(y0, y1, v) / 5) * 5 - 5, 10, 10); }
  if (u > 0) { glow(g, x0, y0, 60, 'rgba(255,255,255,.5)'); }
  if (u >= 1) glow(g, x1, y1, 80, 'rgba(255,255,255,.6)');
  return [x0, y0, x1, y1];
}
/* 地名的牌子：(x, y) 尖，牌子在上方 */
function placeTag(g, x, y, s, col = C.gold, o = {}) {
  g.fillStyle = C.ink; g.fillRect(Math.round(x) - 3, Math.round(y) - 46, 6, 46);
  ptag(g, x, y - 66, s, o.px || 36, { fill: col });
}

/* ================= 机场的翻牌子出发屏 ================= */
/* 机场大厅（亮）：白墙、大窗（外面飞机起降）、吊灯、反光的地面 */
function airportBG(g, t) {
  g.fillStyle = '#EEF2F7'; g.fillRect(0, 0, W, H);
  // 大窗
  const wy = 230, wh = 560;
  g.fillStyle = '#9BC9F0'; g.fillRect(0, wy, W, wh);
  const sky = g.createLinearGradient(0, wy, 0, wy + wh); sky.addColorStop(0, '#7FB6EA'); sky.addColorStop(1, '#D8ECFA'); g.fillStyle = sky; g.fillRect(0, wy, W, wh);
  for (let i = 0; i < 4; i++) { const x = ((i * 300 + t * 30) % 1400) - 200; pixOval(g, x, wy + 90 + i * 60, 70, 14, 5, 'rgba(255,255,255,.85)'); }
  // 飞机：从左下往右上起飞
  const u = (t * .12) % 1, px = -200 + u * 1500, py = wy + wh - 60 - u * 420;
  plane(g, px, py, 5, -.3);
  // 跑道和远处的塔台
  g.fillStyle = '#8A93A8'; g.fillRect(0, wy + wh - 40, W, 40); for (let x = (t * 200) % 120 - 120; x < W; x += 120) { g.fillStyle = '#FFFFFF'; g.fillRect(Math.round(x), wy + wh - 22, 60, 6); }
  g.fillStyle = '#6B7590'; g.fillRect(860, wy + wh - 200, 30, 160); g.fillRect(840, wy + wh - 230, 70, 40); g.fillStyle = '#BFE6FA'; g.fillRect(846, wy + wh - 224, 58, 20);
  // 窗框
  g.fillStyle = '#B8C2D0'; for (let x = 0; x <= W; x += 270) g.fillRect(x - 6, wy, 12, wh); g.fillRect(0, wy - 10, W, 14); g.fillRect(0, wy + wh, W, 14);
  // 吊灯
  for (let x = 90; x < W; x += 220) { g.fillStyle = '#C9CED8'; g.fillRect(x, 0, 6, 120); g.fillStyle = '#FFF4D2'; g.fillRect(x - 30, 120, 66, 14); glow(g, x + 3, 135, 120, 'rgba(255,240,200,.35)'); }
  // 地面：反光的地砖
  const fy = 1180; g.fillStyle = '#D9DFE8'; g.fillRect(0, fy, W, H - fy);
  for (let x = 0; x < W; x += 120) { g.fillStyle = 'rgba(0,0,0,.05)'; g.fillRect(x, fy, 4, H - fy); }
}
function plane(g, x, y, k, rot = 0) {
  g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(rot);
  const rows = ['......ww......', '.....wwww.....', 'kwwwwwwwwwwwwr', 'wwwwwwwwwwwwww', '.....wwww.....', '......ww......'];
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = { w: '#F4F6FA', k: '#5EC8FF', r: '#E5322D' }[r[i]]; if (c) { g.fillStyle = c; g.fillRect((i - 7) * k * 2, (j - 3) * k * 2, k * 2, k * 2); } } });
  g.fillStyle = '#5EC8FF'; for (let i = 0; i < 4; i++) g.fillRect((-4 + i * 2) * k * 2, -k * 2, k, k);
  g.restore();
}
/* 翻牌子：一格一个字；到了 t0 以后先乱翻几下，再停在对的字上 */
const FLAP_CH = '东南西北中上下京广成都阿根廷太平洋海美国印度巴黎';
function flapText(g, x, y, s, t, t0, o = {}) {
  const cw = o.cw || 66, ch = o.ch || 84, chars = [...s];
  chars.forEach((c, i) => {
    const ts = t0 + i * .06, settle = ts + .45;
    let show = ' ';
    if (t >= settle) show = c; else if (t >= ts) show = FLAP_CH[Math.floor((t * 30 + i * 7) % FLAP_CH.length)];
    const fx = x + i * (cw + 6);
    g.fillStyle = '#14161E'; g.fillRect(fx, y, cw, ch);
    g.fillStyle = '#1E2230'; g.fillRect(fx, y, cw, ch / 2 - 2);
    if (show !== ' ') ptext(g, show, fx + cw / 2, y + ch / 2 + 18, 48, t >= settle ? (o.col || '#FFD34E') : '#C9CED8', { align: 'center' });
    g.fillStyle = '#05060A'; g.fillRect(fx, y + ch / 2 - 2, cw, 4);
    // 翻的那一下：上半片往下扣
    if (t >= ts && t < settle && Math.floor(t * 30) % 2) { g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(fx, y, cw, ch / 2); }
  });
  return x + chars.length * (cw + 6);
}

/* ================= 黑夜里的深洞 ================= */
/* 从上往下看一个深洞：一圈圈往下，最底下是红光；四周是夜里的草地 */
function deepHole(g, t, cx = 480, cy = 820, R = 330) {
  g.fillStyle = '#0B0F1E'; g.fillRect(0, 0, W, H);
  starField(g, t, 60, 0, 0, W, 260, 5, 13);
  // 草地（俯视）
  g.fillStyle = '#18301F'; g.fillRect(0, 300, W, 1100);
  for (let i = 0; i < 200; i++) { const x = hash(i, 31) * W, y = 300 + hash(i, 32) * 1100, s = Math.round(Math.sin(t * 2 + i) * 1) * 5; g.fillStyle = '#2F5A3C'; g.fillRect(Math.round(x / 5) * 5 + s, Math.round(y / 5) * 5, 5, 10); }
  // 一圈圈往下的洞壁
  const rings = 14;
  for (let i = 0; i < rings; i++) {
    const u = i / rings, r = R * (1 - u * .9), dy = u * 120;
    const col = mixHex(mixHex('#3A2414', '#7A2A14', u), '#FF5A2A', Math.pow(u, 3));
    pixOval(g, cx, cy + dy, r, r * .85, 5, col);
  }
  glow(g, cx, cy + 110, 160, `rgba(255,100,40,${.5 + .2 * Math.sin(t * 3)})`);
  // 往上冒的热气、往下掉的小石子
  for (let i = 0; i < 18; i++) { const u = (t * .5 + hash(i, 41)) % 1, a = hash(i, 42) * TAU, r = R * .5 * (1 - u); g.fillStyle = `rgba(255,170,90,${.5 * (1 - u)})`; g.fillRect(Math.round((cx + Math.cos(a) * r) / 5) * 5, Math.round((cy + 100 - u * 260) / 5) * 5, 5, 5); }
  for (let i = 0; i < 6; i++) { const u = (t * .7 + hash(i, 51)) % 1, a = hash(i, 52) * TAU, r = R * (1 - u * .9) * .9; g.fillStyle = '#6B4630'; g.fillRect(Math.round((cx + Math.cos(a) * r) / 5) * 5, Math.round((cy + u * 120 + Math.sin(a) * r * .85) / 5) * 5, 10, 10); }
}

/* ================= 钻井、大尺子 ================= */
function drillRig(g, x, y, k, t) {   // (x, y) 井口
  g.fillStyle = '#5A6378';
  for (let j = 0; j < 30; j++) { const w = Math.round(lerp(14, 3, j / 30)); g.fillRect(x - w * k, y - j * k * 2, k, k * 2); g.fillRect(x + (w - 1) * k, y - j * k * 2, k, k * 2); if (j % 5 === 0) g.fillRect(x - w * k, y - j * k * 2, w * 2 * k, k); }
  g.fillStyle = '#FF5A4F'; if (Math.floor(t * 2) % 2) g.fillRect(x - k, y - 62 * k, 2 * k, 2 * k);
  g.fillStyle = '#8A93A8'; g.fillRect(x - 18 * k, y, 36 * k, 3 * k);
}

/* ================= 往下掉 ================= */
/* 隧道（屏幕铺满）：两边的洞壁按深度换颜色（地壳 → 地幔 → 外核 → 内核），石纹一直往上走；d 0..1 从地表到地心 */
function tunnelBG(g, t, d, speed) {
  const cols = d < .02 ? ['#6B4630', '#5A3A22'] : d < .45 ? ['#C7442A', '#A8341F'] : d < .81 ? ['#F28C28', '#D9701C'] : ['#FFE07A', '#FFF1B8'];
  g.fillStyle = '#0A0612'; g.fillRect(0, 0, W, H);
  const wallW = 230, off = (t * speed) % 120;
  for (const side of [0, 1]) {
    const x0 = side ? W - wallW : 0;
    g.fillStyle = cols[0]; g.fillRect(x0, 0, wallW, H);
    for (let y = -120 + off; y < H; y += 120) for (let i = 0; i < 5; i++) { g.fillStyle = cols[1]; g.fillRect(x0 + ((i * 47 + Math.round(y)) % (wallW - 30)), Math.round(y + i * 22), 30 + (i % 3) * 10, 10); }
    g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(side ? x0 : x0 + wallW - 30, 0, 30, H);
  }
  glow(g, W / 2, H / 2, 600, d > .8 ? 'rgba(255,240,180,.35)' : 'rgba(255,120,60,.18)');
  // 速度线
  const n = Math.round(clamp(speed / 2000) * 30);
  for (let i = 0; i < n; i++) { const x = 250 + hash(i, 61) * 580, y = ((hash(i, 62) * H - t * speed * 1.5) % H + H) % H; g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(Math.round(x / 5) * 5, Math.round(y), 5, 60 + speed / 30); }
}

/* ================= 阿根廷清晨的草原 ================= */
/* 院子里是黄昏（北京傍晚六点），阿根廷晚 11 个小时，正是清晨：天从深蓝到粉到橙，太阳刚出来，星星还剩几颗 */
function pampasBG(b, t) {
  const hy = 250;
  pbands(b, 0, 216, [[0, '#1E2A5E'], [80, '#4A4A8A'], [150, '#C8709A'], [210, '#FFA070'], [hy, '#FFD49A']], 3);
  for (let i = 0; i < 30; i++) { const tw = .5 + .5 * Math.sin(t * 2 + i * 1.3); if (hash(i, 72) * 220 < 90) pdot(b, hash(i, 71) * 216, hash(i, 72) * 220, `rgba(255,250,220,${.2 + .5 * tw})`); }
  pdisc(b, 150, hy - 4, 14, '#FFE7A8'); pdisc(b, 150, hy - 4, 11, '#FFF6D8');            // 刚冒头的太阳
  for (let i = 0; i < 4; i++) { const x = ((i * 70 + t * 3) % 280) - 40, y = 120 + i * 22; pell(b, x, y, 20, 3, '#F7B0A0'); pell(b, x + 6, y - 2, 9, 2, '#FFD2C0'); }
  for (let i = 0; i < 4; i++) { const x = 230 - ((t * 12 + i * 11) % 300), y = 140 + i * 6, up = Math.floor(t * 6 + i) % 2; pdot(b, x, y, '#5A3A4A'); pdot(b, x - 1, y - up, '#5A3A4A'); pdot(b, x + 1, y - up, '#5A3A4A'); }
  for (let x = 0; x < 216; x++) { const h = 8 + Math.round(Math.sin(x * .05) * 5 + Math.sin(x * .13) * 2); prect(b, x, hy - h, 1, h, '#7A6A9A'); }   // 远山
  pbands(b, 0, 216, [[hy, '#7DA64E'], [hy + 40, '#6A9442'], [384, '#5A8238']], 3);
  for (let i = 0; i < 160; i++) { const x = hash(i, 81) * 216, y = hy + 2 + hash(i, 82) * 130, s = Math.round(Math.sin(t * 2 + x * .1)); pdot(b, x + s, y - 1, '#A8D46A'); }
  for (let i = 0; i < 14; i++) { const x = hash(i, 21) * 216, y = hy + 8 + hash(i, 22) * 110; pdot(b, x, y, ['#FFFFFF', '#FFD34E', '#FF8FB0'][i % 3]); }
  // 远处一座小屋，炊烟
  prect(b, 176, hy - 18, 22, 14, '#C9A27A'); for (let j = 0; j < 8; j++) prect(b, 174 + j, hy - 18 - j, 26 - 2 * j, 1, '#A8573A'); prect(b, 182, hy - 13, 4, 4, '#FFD98A');
  for (let i = 0; i < 6; i++) { const u = (t * .3 + i / 6) % 1; pdot(b, 192 + Math.sin(u * 6 + i) * 2, hy - 28 - u * 40, `rgba(240,240,250,${.6 * (1 - u)})`); }
}
