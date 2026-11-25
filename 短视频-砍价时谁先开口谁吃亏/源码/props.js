'use strict';
/* props.js：本片的场景和道具——夜市的旧货摊（彩灯、遮阳棚、挂着的旧货、来回走的人、烤串摊的烟）、木吉他、会说话的价签、
   傍晚的海（锚和小船的比喻）、二手交易 App 的商品页、晚上的家；想法泡泡、挂钟。全部程序画的像素图。
   背景缓冲 216×384（每个像素 5 个屏幕像素），小怪按 k=10 或 15 画，和背景的像素对齐。 */

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

/* ================= 本片的场景 ================= */

/* 挂钟（屏幕坐标）：min 从 0 点起的分钟数 */
function wallClock(g, x, y, r, min) {
  pixOval(g, x, y, r + 8, r + 8, 4, C.ink); pixOval(g, x, y, r, r, 4, '#FFFFFF');
  for (let i = 0; i < 12; i++) { const a = i * TAU / 12; g.fillStyle = C.ink; g.fillRect(Math.round(x + Math.cos(a) * r * .8) - 3, Math.round(y + Math.sin(a) * r * .8) - 3, 6, 6); }
  const hA = ((min / 60) % 12) / 12 * TAU - Math.PI / 2, mA = (min % 60) / 60 * TAU - Math.PI / 2;
  g.strokeStyle = C.ink; g.lineCap = 'square'; g.lineWidth = 8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(hA) * r * .5, y + Math.sin(hA) * r * .5); g.stroke();
  g.strokeStyle = '#E5322D'; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(mA) * r * .75, y + Math.sin(mA) * r * .75); g.stroke();
}

/* 想法泡泡（白），尾巴指向 (tx, ty) */
function bubble(g, x, y, rx, ry, tx, ty, o = {}) {
  if (tx != null) [[.72, 18], [.45, 12], [.2, 8]].forEach(([u, r]) => { const bx = lerp(tx, x, u * .7 + .1), by = lerp(ty, y, u * .7 + .1); pixOval(g, bx, by, r + 4, r + 4, 4, C.ink); pixOval(g, bx, by, r, r, 4, '#FFFFFF'); });
  pixOval(g, x, y, rx + 8, ry + 8, 4, C.ink); pixOval(g, x, y, rx, ry, 4, o.fill || '#FFFFFF');
}

/* ---------- 晚上的家（结尾）：暖灯、窗外夜景、餐桌 ---------- */
function homeBG(b, t) {
  b.fillStyle = '#F2D9B8'; b.fillRect(0, 0, 216, 250); b.fillStyle = '#E8CCA8'; for (let x = 0; x < 216; x += 10) b.fillRect(x, 0, 4, 250);
  // 窗：夜景
  for (let y = 0; y < 90; y++) { b.fillStyle = mixHex('#1A2148', '#3A3A7A', y / 90); b.fillRect(130, 50 + y, 70, 1); }
  pdisc(b, 182, 64, 5, '#FFF2C4');
  for (let i = 0; i < 7; i++) { const bx = 130 + i * 10, bh = 20 + Math.round(hash(i, 6) * 30); b.fillStyle = '#141A3C'; b.fillRect(bx, 140 - bh, 9, bh); for (let y = 140 - bh + 3; y < 138; y += 5) if (hash(i, y, Math.floor(t * .5)) > .5) { b.fillStyle = '#FFD98A'; b.fillRect(bx + 3, y, 2, 2); } }
  b.fillStyle = '#FFFFFF'; b.fillRect(127, 47, 76, 3); b.fillRect(127, 140, 76, 4); b.fillRect(127, 50, 3, 90); b.fillRect(200, 50, 3, 90); b.fillRect(164, 50, 2, 90);
  // 吊灯
  b.fillStyle = '#5A3A22'; b.fillRect(72, 0, 2, 40); b.fillStyle = '#E8A94A'; b.fillRect(62, 40, 22, 10); b.fillStyle = '#FFF2C4'; b.fillRect(66, 50, 14, 3);
  // 墙上的挂画、地板
  b.fillStyle = '#8A6A3A'; b.fillRect(20, 70, 40, 30); b.fillStyle = '#9FD27A'; b.fillRect(23, 73, 34, 24); pdisc(b, 40, 84, 5, '#FFE27A');
  b.fillStyle = '#B07E4A'; b.fillRect(0, 250, 216, 134); b.fillStyle = '#9A6A3A'; for (let y = 256; y < 384; y += 14) b.fillRect(0, y, 216, 1);
}

/* ---------- 夜市的旧货摊（缓冲 216×384）：夜空和星、远处亮窗的楼、两侧条纹遮阳棚、挂着的旧货、远处的烤串摊、石板路 ---------- */
function marketBG(b, t) {
  for (let y = 0; y < 210; y++) { b.fillStyle = mixHex('#0E1236', '#4A2E62', y / 210); b.fillRect(0, y, 216, 1); }
  for (let i = 0; i < 30; i++) { if (Math.sin(t * (1 + hash(i, 1) * 2) + i) > 0) { b.fillStyle = '#E8E4FF'; b.fillRect(Math.round(hash(i, 2) * 216), Math.round(hash(i, 3) * 90), 1, 1); } }
  for (let i = 0; i < 14; i++) {
    const bx = i * 16 - 4, bh = 40 + Math.round(hash(i, 4) * 50), by = 200 - bh;
    b.fillStyle = i % 2 ? '#1A1F4A' : '#232A58'; b.fillRect(bx, by, 15, bh);
    for (let y = by + 4; y < 196; y += 6) for (let x = bx + 2; x < bx + 13; x += 4) if (hash(i, y, x + Math.floor(t * .3 + hash(x, y) * 7)) > .55) { b.fillStyle = '#FFD98A'; b.fillRect(x, y, 2, 2); }
  }
  // 远处的人行道、摊位后墙
  b.fillStyle = '#2A2440'; b.fillRect(0, 200, 216, 20);
  // 左右两个摊位的遮阳棚（红白条）和挂着的旧货
  [[0, 66], [150, 216]].forEach(([x0, x1], s) => {
    for (let x = x0; x < x1; x += 6) { b.fillStyle = ((x - x0) / 6) % 2 ? '#F4F4F4' : (s ? '#3E7DC9' : '#E5322D'); b.fillRect(x, 150, 6, 14); }
    b.fillStyle = '#5A3A2A'; b.fillRect(x0 + 2, 164, 3, 60); b.fillRect(x1 - 5, 164, 3, 60);
    b.fillStyle = '#3A2E40'; b.fillRect(x0, 164, x1 - x0, 56);
  });
  // 左摊：旧收音机、书；右摊：灯笼、风筝、旧玩具
  b.fillStyle = '#C98A4A'; b.fillRect(8, 178, 22, 14); b.fillStyle = '#2B2547'; b.fillRect(11, 181, 8, 8); b.fillStyle = '#E8C26A'; b.fillRect(22, 181, 5, 3);
  ['#5EC8FF', '#FF9DB5', '#9FE3B8', '#FFE27A'].forEach((c, i) => { b.fillStyle = c; b.fillRect(36 + i * 6, 180, 5, 16); });
  const sw = Math.round(Math.sin(t * 1.5) * 1);
  b.fillStyle = '#E5322D'; b.fillRect(160 + sw, 168, 10, 12); b.fillStyle = '#FFD34E'; b.fillRect(162 + sw, 166, 6, 2); b.fillRect(164 + sw, 180, 2, 4);
  b.fillStyle = '#E5322D'; b.fillRect(190 - sw, 170, 10, 12); b.fillStyle = '#FFD34E'; b.fillRect(192 - sw, 168, 6, 2);
  b.fillStyle = '#9FD27A'; for (let i = 0; i < 6; i++) b.fillRect(176 + i, 186 + i, 6 - i, 1);
  // 石板路
  b.fillStyle = '#3B3448'; b.fillRect(0, 220, 216, 164);
  for (let y = 222; y < 384; y += 10) for (let x = ((y / 10) % 2) * 9; x < 216; x += 18) { b.fillStyle = '#463E56'; b.fillRect(x, y, 16, 8); }
}
/* 一串彩灯（屏幕坐标）：从 (x0,y0) 垂到 (x1,y1)，灯泡一闪一闪 */
function stringLights(g, t, x0, y0, x1, y1, sag, n, seed = 0) {
  g.fillStyle = '#2B2547';
  for (let i = 0; i <= 60; i++) { const u = i / 60, x = lerp(x0, x1, u), y = lerp(y0, y1, u) + Math.sin(u * Math.PI) * sag; g.fillRect(Math.round(x), Math.round(y), 5, 5); }
  for (let i = 0; i < n; i++) {
    const u = (i + .5) / n, x = lerp(x0, x1, u), y = lerp(y0, y1, u) + Math.sin(u * Math.PI) * sag + 12;
    const col = ['#FFD34E', '#FF7A8A', '#5EC8FF', '#9FE3B8'][(i + seed) % 4], on = Math.sin(t * 2.2 + i * 1.3 + seed) > -.4;
    g.fillStyle = on ? col : '#5A5070'; g.fillRect(Math.round(x) - 5, Math.round(y) - 5, 12, 14);
    if (on) glow(g, x, y, 34, col === '#FFD34E' ? 'rgba(255,211,78,.45)' : col === '#FF7A8A' ? 'rgba(255,122,138,.4)' : col === '#5EC8FF' ? 'rgba(94,200,255,.4)' : 'rgba(159,227,184,.4)');
  }
}
/* 远处来回走的人（屏幕坐标），被摊位挡住下半身 */
function crowd(g, t, y, n = 5) {
  for (let i = 0; i < n; i++) {
    const dir = i % 2 ? 1 : -1, sp = 50 + hash(i, 2) * 40, x = ((t * sp * dir + hash(i, 3) * 1300) % 1300 + 1300) % 1300 - 110;
    crabAt(g, x, y + (i % 3) * 8, 5, person(i + 2, { legs: walkLegs(t + i, 8) }), dir < 0);
  }
}
/* 冒烟（烤串摊） */
function steam(g, t, x, y) { for (let i = 0; i < 6; i++) { const ph = (t * .5 + i / 6) % 1; g.fillStyle = `rgba(240,240,250,${.35 * (1 - ph)})`; const r = 10 + ph * 26; g.fillRect(Math.round((x + Math.sin(t + i) * 14 - r / 2) / 5) * 5, Math.round((y - ph * 220) / 5) * 5, Math.round(r / 5) * 5, Math.round(r / 5) * 5); } }
/* 竖着的木吉他（屏幕坐标，(x, y) 头的顶端中线；k 一格几个像素） */
function guitar(g, x, y, k = 5) {
  g.fillStyle = '#5A3A22'; g.fillRect(x - 4 * k, y, 8 * k, 12 * k);
  g.fillStyle = '#E8E8F0'; for (let i = 0; i < 3; i++) { g.fillRect(x - 6 * k, y + (2 + i * 3) * k, 2 * k, 2 * k); g.fillRect(x + 4 * k, y + (2 + i * 3) * k, 2 * k, 2 * k); }
  g.fillStyle = '#7A4A2E'; g.fillRect(x - 2 * k, y + 12 * k, 4 * k, 30 * k);
  g.fillStyle = '#C9B8A0'; for (let i = 0; i < 8; i++) g.fillRect(x - 2 * k, y + (14 + i * 3.5) * k, 4 * k, Math.max(1, k / 3));
  const by = y + 42 * k;
  pixOval(g, x, by + 9 * k, 10 * k, 10 * k, k, '#2B1A12'); pixOval(g, x, by + 26 * k, 13 * k, 12 * k, k, '#2B1A12');
  pixOval(g, x, by + 9 * k, 9 * k, 9 * k, k, '#D9883A'); pixOval(g, x, by + 26 * k, 12 * k, 11 * k, k, '#D9883A');
  pixOval(g, x, by + 14 * k, 4 * k, 4 * k, k, '#2B1A12');
  g.fillStyle = '#5A3A22'; g.fillRect(x - 5 * k, by + 28 * k, 10 * k, 2 * k);
  g.fillStyle = 'rgba(240,240,250,.8)'; for (let i = -1; i <= 1; i++) g.fillRect(x + i * k - 1, y + 2 * k, 2, (42 + 28) * k - 2 * k);
}
/* 价签（屏幕坐标，中心）：s 文字；o.face 'sweat' 冒汗 / 'smart' 戴眼镜拿计算器；o.col 底色 */
function priceTag(g, t, x, y, s, px = 60, o = {}) {
  const w = Math.max(220, pw(g, s, px) + 80), h = px * 2.6;
  g.save(); g.translate(x, y); g.rotate(o.rot || 0);
  g.fillStyle = C.ink; g.fillRect(-w / 2 - 6, -h / 2 - 6, w + 12, h + 12); g.beginPath(); g.moveTo(-w / 2 - 6, -h / 2 - 6); g.lineTo(-w / 2 - 50, 0); g.lineTo(-w / 2 - 6, h / 2 + 6); g.fill();
  g.fillStyle = o.col || '#FFE27A'; g.fillRect(-w / 2, -h / 2, w, h); g.beginPath(); g.moveTo(-w / 2, -h / 2); g.lineTo(-w / 2 - 40, 0); g.lineTo(-w / 2, h / 2); g.fill();
  pixOval(g, -w / 2 - 14, 0, 10, 10, 5, C.ink);
  ptext(g, s, 10, -h / 2 + px * 1.05, px, C.ink, { align: 'center' });
  if (o.face) {
    const fy = h / 2 - px * .55;
    g.fillStyle = C.ink;
    if (o.face === 'sweat') { g.fillRect(-30, fy - 12, 12, 6); g.fillRect(18, fy - 12, 12, 6); g.fillRect(-14, fy + 6, 28, 6); g.fillStyle = '#9FD3FF'; g.fillRect(w / 2 - 30, -h / 2 + 10 + ((t * 40) % 30), 10, 16); }
    else { g.fillRect(-36, fy - 18, 24, 18); g.fillRect(12, fy - 18, 24, 18); g.fillRect(-12, fy - 12, 24, 5); g.fillStyle = '#FFFFFF'; g.fillRect(-32, fy - 14, 16, 10); g.fillRect(16, fy - 14, 16, 10); g.fillStyle = C.ink; g.fillRect(-26, fy - 12, 6, 6); g.fillRect(22, fy - 12, 6, 6); g.fillRect(-10, fy + 8, 20, 5); }
  }
  g.restore();
}
/* 傍晚的海（锚的比喻，缓冲 216×384）：晚霞、太阳、远山、海浪 */
function seaBG(b, t) {
  for (let y = 0; y < 170; y++) { b.fillStyle = mixHex('#3A2E6E', '#FF9A6A', y / 170); b.fillRect(0, y, 216, 1); }
  pdisc(b, 160, 150, 16, '#FFE2A0');
  b.fillStyle = '#5A3E6E'; for (let x = 0; x < 216; x += 2) { const h = 8 + Math.round(Math.sin(x * .05) * 6 + Math.sin(x * .17) * 2); b.fillRect(x, 170 - h, 2, h); }
  for (let y = 170; y < 384; y++) { b.fillStyle = mixHex('#2E5A9E', '#123060', (y - 170) / 214); b.fillRect(0, y, 216, 1); }
  for (let i = 0; i < 26; i++) { const y = 174 + Math.round(hash(i, 1) * 200), x = Math.round((hash(i, 2) * 260 + t * (6 + hash(i, 3) * 8)) % 240) - 12; b.fillStyle = 'rgba(200,230,255,.35)'; b.fillRect(x, y, 8 + Math.round(hash(i, 4) * 8), 1); }
  for (let y = 172; y < 200; y += 3) { const w = 14 - (y - 172) / 3; b.fillStyle = `rgba(255,226,160,${.5 - (y - 172) / 70})`; b.fillRect(Math.round(160 - w / 2 + Math.sin(t * 2 + y) * 2), y, Math.max(1, Math.round(w)), 1); }
}
/* 锚（屏幕坐标，中心在环上）：s 锚上的数 */
function anchorIcon(g, x, y, k = 6, s = '') {
  const ink = C.ink, col = '#8E9BAE';
  pixOval(g, x, y, 4 * k, 4 * k, k, ink); pixOval(g, x, y, 2.5 * k, 2.5 * k, k, '#123060');
  g.fillStyle = ink; g.fillRect(x - k, y + 3 * k, 2 * k, 18 * k); g.fillRect(x - 6 * k, y + 7 * k, 12 * k, 2 * k);
  g.fillStyle = col; g.fillRect(x - k / 2, y + 3 * k, k, 17 * k);
  for (let i = 0; i < 6; i++) { g.fillStyle = ink; g.fillRect(x - (2 + i) * k, y + (20 - i * .6) * k - i * k, 2 * k, 2 * k); g.fillRect(x + i * k, y + (20 - i * .6) * k - i * k, 2 * k, 2 * k); }
  g.fillStyle = ink; g.fillRect(x - 9 * k, y + 12 * k, 3 * k, 3 * k); g.fillRect(x + 6 * k, y + 12 * k, 3 * k, 3 * k);
  if (s) ptag(g, x, y + 30 * k, s, 40, { fill: C.gold });
}
/* 小船（屏幕坐标）：帆上写着字 */
function boat(g, t, x, y, s = '成交价') {
  const bob = Math.round(Math.sin(t * 2.4) * 2) * 5;
  g.save(); g.translate(Math.round(x), Math.round(y) + bob);
  g.fillStyle = C.ink; g.fillRect(-90, 0, 180, 40); g.fillStyle = '#C98A4A'; g.fillRect(-84, 4, 168, 30); g.fillStyle = '#8A5A35'; g.fillRect(-60, 34, 120, 10);
  g.fillStyle = '#5A3A22'; g.fillRect(-4, -140, 8, 140);
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.moveTo(4, -136); g.lineTo(84, -20); g.lineTo(4, -20); g.closePath(); g.fill(); g.strokeStyle = C.ink; g.lineWidth = 5; g.stroke();
  ptext(g, s, 40, -48, 28, C.ink, { align: 'center' });
  g.restore();
}
/* 二手交易 App 的商品页（屏幕坐标，(x, y) 左上，w 宽）：吉他 + 价格 + 下面的聊天 */
function appListing(g, t, x, y, w, price, chats = []) {
  const h = w * 1.55;
  g.fillStyle = C.ink; g.fillRect(x - 10, y - 10, w + 20, h + 20); g.fillStyle = '#F6F4F0'; g.fillRect(x, y, w, h);
  g.fillStyle = '#FFD34E'; g.fillRect(x, y, w, 60); ptext(g, '二手', x + 24, y + 42, 32, C.ink);
  g.fillStyle = '#E8E2D8'; g.fillRect(x + 20, y + 80, w - 40, 260);
  guitar(g, x + w / 2, y + 96, 3);
  ptext(g, '木吉他 · 九成新', x + 24, y + 392, 30, C.ink);
  ptext(g, '¥' + price, x + 24, y + 452, 52, '#E5322D');
  chats.forEach(([s, a], i) => { if (a <= 0) return; withAlpha(g, clamp(a), () => { const cy = y + 500 + i * 84; g.fillStyle = '#FFFFFF'; g.fillRect(x + 24, cy, w - 120, 64); g.fillStyle = '#C9D3DE'; g.fillRect(x + 24, cy + 60, w - 120, 4); ptext(g, s, x + 44, cy + 44, 30, C.ink); }); });
}
