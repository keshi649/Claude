'use strict';
/* props.js：本片的场景和道具——夜里的酒店房间（床头柜上的电子钟、小黄鸭、窗外的城）、睡眠实验室和脑电波形、
   大脑（左右两半）和站岗的小人、夜里的池塘和正面的绿头鸭、芦苇里的狐狸、祖先过夜的山洞和篝火、论文、行李箱、考卷、耳塞。
   全部程序画的像素图。背景缓冲 216×384（每个像素 5 个屏幕像素），小怪按 k=10 画，和背景的像素对齐。 */

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

/* ================= 本片的场景 =================
   背景都画在 216×384 的缓冲上（一个缓冲像素 = 5 个屏幕像素）；小怪按 k=10 画（一格 = 2 个缓冲像素），网格对得上。 */

/* ---------- 酒店房间 ---------- */
/* light：0 夜里，1 早上（结尾：第二晚睡好了）。窗外的城、月亮；窗帘被空调风吹得轻轻摆；空调指示灯一闪一闪、出风；
   挂画（池塘里的鸭子：伏笔）；右边的房门（门缝透出走廊的光，有人走过时一道影子）；床头软包；床头柜和台灯；
   夜里每隔几秒有车灯扫过天花板。床、枕头、被子、小怪在屏幕上另画（roomFront） */
function roomBG(b, t, light = 0) {
  const m = (a, c) => mixHex(a, c, light);
  b.fillStyle = m('#29244E', '#EBDCC8'); b.fillRect(0, 0, 216, 300);
  b.fillStyle = m('#2E2957', '#F2E5D4'); for (let x = 2; x < 216; x += 12) b.fillRect(x, 0, 5, 290);
  b.fillStyle = m('#221E42', '#D8C2A8'); b.fillRect(0, 288, 216, 12);
  b.fillStyle = m('#3B2F4D', '#A8775A'); b.fillRect(0, 300, 216, 84);
  b.fillStyle = m('#47395C', '#BA8766');
  for (let y = 304; y < 384; y += 8) for (let x = ((y >> 3) & 1) * 6; x < 216; x += 12) b.fillRect(x, y, 2, 2);
  // 车灯扫过天花板（夜里）
  if (light < .5) {
    const ph = (t % 6.5) / 1.6;
    if (ph < 1) { const x0 = -70 + ph * 330; for (let y = 0; y < 44; y++) { b.fillStyle = `rgba(255,228,170,${.16 * (1 - y / 44)})`; b.fillRect(Math.round(x0 + y * .7), y, 46, 1); } }
  }
  // 窗：x 22..102, y 86..166
  const wx = 22, wy = 86, ww = 80, wh = 80;
  for (let y = 0; y < wh; y++) { b.fillStyle = m(mixHex('#0B1130', '#26326E', y / wh), mixHex('#86BDEB', '#E2F1FF', y / wh)); b.fillRect(wx, wy + y, ww, 1); }
  if (light < .5) {
    for (let i = 0; i < 14; i++) { if (Math.sin(t * (1.3 + hash(i, 2) * 2) + i) > -.2) { b.fillStyle = '#E8E4FF'; b.fillRect(wx + 2 + Math.round(hash(i, 3) * 74), wy + 2 + Math.round(hash(i, 4) * 30), 1, 1); } }
    pdisc(b, wx + 60, wy + 15, 7, '#FFF2C4'); pdisc(b, wx + 63, wy + 13, 6, '#0F1636');
  } else { pdisc(b, wx + 62, wy + 16, 8, '#FFF6D8'); }
  for (let i = 0; i < 10; i++) {
    const bx = wx - 2 + i * 9, bh = 20 + Math.round(hash(i, 4) * 30), by = wy + wh - bh;
    b.fillStyle = m(i % 2 ? '#141A3C' : '#1A2148', i % 2 ? '#9FB2CC' : '#B4C4D8'); b.fillRect(bx, by, 8, bh);
    for (let yy = by + 3; yy < wy + wh - 2; yy += 4) for (let xx = bx + 1; xx < bx + 7; xx += 3) {
      if (hash(i, yy, xx + Math.floor(t * .4 + hash(xx, yy) * 9)) > (light < .5 ? .55 : .85)) { b.fillStyle = light < .5 ? '#FFD98A' : '#F4F8FF'; b.fillRect(xx, yy, 2, 2); }
    }
  }
  b.fillStyle = m('#15122E', '#FFFFFF'); b.fillRect(wx - 3, wy - 3, ww + 6, 3); b.fillRect(wx - 3, wy + wh, ww + 6, 4); b.fillRect(wx - 3, wy, 3, wh); b.fillRect(wx + ww, wy, 3, wh);
  b.fillRect(wx + ww / 2 - 1, wy, 2, wh); b.fillRect(wx, wy + 38, ww, 2);
  // 窗帘：底下随风轻轻摆
  [[12, 20], [92, 20]].forEach(([cx, cw], s) => {
    for (let y = 78; y < 178; y++) {
      const off = Math.round(Math.sin(t * 1.2 + y * .03 + s) * 2 * (y - 78) / 100);
      b.fillStyle = m('#6B2F4E', '#C98A9A'); b.fillRect(cx + off, y, cw, 1);
      b.fillStyle = m('#7E3C5E', '#DDA2B0'); for (let x = 2; x < cw; x += 6) b.fillRect(cx + off + x, y, 2, 1);
    }
  });
  b.fillStyle = m('#8E7A5A', '#C9B08A'); b.fillRect(8, 76, 128, 3);
  // 空调：x 136..200, y 24..44
  b.fillStyle = m('#C9CCD8', '#F4F5F8'); b.fillRect(136, 24, 64, 20); b.fillStyle = m('#9EA3B4', '#D3D6E0'); b.fillRect(136, 40, 64, 4);
  b.fillStyle = m('#7E8396', '#B9BDCA'); for (let x = 140; x < 196; x += 4) b.fillRect(x, 41, 2, 2);
  b.fillStyle = Math.sin(t * 3) > 0 ? '#5BE37D' : '#2E6B3C'; b.fillRect(191, 28, 3, 2);
  for (let i = 0; i < 3; i++) for (let j = 0; j < 6; j++) {
    const y = 48 + ((t * 14 + j * 6 + i * 3) % 34), x = 146 + i * 18 + Math.round(Math.sin(y * .3 + i) * 2);
    b.fillStyle = `rgba(170,200,255,${.4 * (1 - (y - 48) / 34)})`; b.fillRect(x, Math.round(y), 3, 1);
  }
  // 挂画：池塘里的三只鸭子（伏笔）
  b.fillStyle = '#8A6A3A'; b.fillRect(126, 96, 52, 32); b.fillStyle = m('#24405E', '#7FB6E0'); b.fillRect(129, 99, 46, 26);
  b.fillStyle = m('#35603F', '#5DB65A'); b.fillRect(129, 117, 46, 8);
  b.fillStyle = m('#2E4A6A', '#A8D4F0'); b.fillRect(132, 113, 40, 3);
  [[137, 112], [148, 112], [159, 112]].forEach(([x, y]) => { b.fillStyle = '#2E7D4F'; b.fillRect(x + 1, y - 4, 3, 3); b.fillStyle = '#F2B53A'; b.fillRect(x + 2, y - 2, 1, 1); b.fillStyle = '#8A5A3A'; b.fillRect(x, y - 1, 5, 3); });
  // 房门：x 180..212（右边，大半在平台按钮底下，只是布景）
  b.fillStyle = m('#5A3A2A', '#9A6A4A'); b.fillRect(180, 118, 32, 172); b.fillStyle = m('#4A2E20', '#865A3E'); b.fillRect(184, 124, 24, 66); b.fillRect(184, 198, 24, 86);
  b.fillStyle = '#E8C26A'; b.fillRect(183, 196, 4, 3);
  b.fillStyle = '#D9443B'; b.fillRect(187, 178, 10, 14); b.fillStyle = '#FFFFFF'; b.fillRect(189, 182, 6, 1); b.fillRect(189, 185, 6, 1);
  if (light < .5) {
    b.fillStyle = '#FFE9A8'; b.fillRect(180, 288, 32, 2);
    const ph = (t % 7) / 7;
    if (ph > .5 && ph < .8) { const fx = 176 + (ph - .5) / .3 * 44; b.fillStyle = '#3A2A20'; b.fillRect(Math.round(fx), 288, 5, 2); b.fillRect(Math.round(fx) + 9, 288, 5, 2); }
  }
  // 床头软包：x 40..172, y 172..212
  b.fillStyle = m('#46293A', '#8E5E46'); b.fillRect(40, 170, 132, 42); b.fillStyle = m('#563548', '#A06C52'); b.fillRect(44, 174, 124, 34);
  b.fillStyle = m('#4E2F42', '#96644C'); for (let x = 50; x < 168; x += 12) b.fillRect(x, 176, 2, 30);
  for (let x = 50; x < 168; x += 12) { b.fillStyle = m('#6E4A5E', '#B88468'); b.fillRect(x - 1, 190, 4, 1); }
  // 床头柜和台灯：x 6..38
  b.fillStyle = m('#5E3E2E', '#8E6046'); b.fillRect(6, 214, 32, 50); b.fillStyle = m('#70503C', '#A27256'); b.fillRect(5, 211, 34, 4);
  b.fillStyle = m('#4A2E20', '#764E36'); b.fillRect(9, 222, 26, 14); b.fillRect(9, 240, 26, 14); b.fillStyle = '#C9A06A'; b.fillRect(20, 228, 4, 2); b.fillRect(20, 246, 4, 2);
  b.fillStyle = m('#3A3048', '#F4E2C0'); b.fillRect(26, 190, 11, 8); b.fillStyle = m('#6E6480', '#C9B8A0'); b.fillRect(30, 198, 3, 13);
}
/* 枕头（小怪身后）和被子（小怪身前），屏幕坐标；床头柜上的电子钟、床上的手机 */
function roomPillow(g, light = 0) {
  g.fillStyle = mixHex('#D8D6E6', '#FFFFFF', light); g.fillRect(270, 975, 420, 110); g.fillRect(255, 990, 450, 80);
  g.fillStyle = mixHex('#B9B6CC', '#E6E2EE', light); g.fillRect(270, 1070, 420, 15); g.fillRect(470, 990, 20, 70);
}
function roomBlanket(g, t, light = 0, y0 = 1120, o = {}) {
  const bl = mixHex('#3E5AA0', '#5E86D6', light), bl2 = mixHex('#4E6BB0', '#79A0E8', light), wh = mixHex('#D8D6E6', '#FFFFFF', light);
  const bump = o.bump || 0;
  g.fillStyle = bl; g.fillRect(200, y0 + 30, 660, 1920 - y0);
  g.fillStyle = bl2; for (let y = y0 + 60; y < 1920; y += 60) for (let x = 230 + (((y - y0) / 60) % 2) * 30; x < 850; x += 60) g.fillRect(x, y, 10, 10);
  g.fillStyle = bl; g.fillRect(240 + bump, y0 + 10, 580, 30);
  g.fillStyle = wh; g.fillRect(200, y0, 660, 36); g.fillStyle = mixHex('#B9B6CC', '#E6E2EE', light); g.fillRect(200, y0 + 30, 660, 6);
  g.fillStyle = mixHex('#2E4886', '#4E72C0', light); g.fillRect(200, y0 + 36, 10, 1920 - y0); g.fillRect(850, y0 + 36, 10, 1920 - y0);
}
function bedClock(g, t, s = '02:13') {
  g.fillStyle = '#141018'; g.fillRect(46, 1012, 108, 46); g.fillStyle = '#2A2230'; g.fillRect(46, 1052, 108, 6);
  const on = Math.floor(t * 2) % 2 === 0;
  ptext(g, on ? s : s.replace(':', ' '), 100, 1049, 36, '#FF5A4F', { align: 'center' });
  glow(g, 100, 1035, 70, 'rgba(255,90,80,.25)');
}
function bedPhone(g, t, x = 700, y = 1150, lit = 0) {
  g.fillStyle = '#1B1730'; g.fillRect(x, y, 90, 48); g.fillStyle = lit > 0 ? `rgba(143,211,255,${lit})` : '#2B2547'; g.fillRect(x + 6, y + 6, 78, 36);
  if (lit > 0) { glow(g, x + 45, y + 24, 120, `rgba(143,211,255,${.35 * lit})`); g.fillStyle = `rgba(255,255,255,${lit})`; g.fillRect(x + 14, y + 14, 40, 6); g.fillRect(x + 14, y + 26, 56, 4); }
}

/* ---------- 鸭子（正面，绿头鸭）：eyes 'oo' 两只都睁、'cc' 都闭、'oc' 左睁右闭、'co' 左闭右睁 ---------- */
const DUCK_ROWS = [
  '......gggg......', '....gggggggg....', '...gHgggggggg...', '..gggggggggggg..', '..gggggggggggg..', '..gggyyyyyyggg..',
  '...gyyyyyyyyg...', '....yyyyyyyy....', '.....YyyyyY.....', '....wwwwwwww....', '...cccccccccc...', '..cccccccccccc..',
  '.sccccccccccccs.', 'sssccccccccccsss', 'ssssssccccssssss', '.ssssssssssssss.', '..ssssssssssss..',
];
const DUCK_PAL = { g: '#2E7D4F', H: '#4FB07A', y: '#F2B53A', Y: '#C98A1A', w: '#F4F4F4', c: '#7A4A2E', s: '#B8B0A6' };
const RDUCK_PAL = { g: '#FFD84A', H: '#FFF2A0', y: '#FF9A2E', Y: '#E0701A', w: '#FFD84A', c: '#FFD84A', s: '#F2C230' };
function duckAt(g, cx, by, k, eyes = 'oo', o = {}) {
  const pal = o.rubber ? RDUCK_PAL : DUCK_PAL, x0 = Math.round(cx - 8 * k), y0 = Math.round(by - 17 * k) + (o.droop ? k : 0);
  DUCK_ROWS.forEach((r, j) => { for (let i = 0; i < 16; i++) { const c = pal[r[i]]; if (c) { g.fillStyle = c; g.fillRect(x0 + i * k, (j >= 9 ? Math.round(by - 17 * k) : y0) + j * k, k, k); } } });
  const eye = (ex, open) => {
    if (open) { g.fillStyle = '#141414'; g.fillRect(x0 + ex * k, y0 + 3 * k, k, 2 * k); g.fillStyle = '#FFFFFF'; g.fillRect(x0 + ex * k, y0 + 3 * k, Math.max(1, Math.round(k / 3)), Math.max(1, Math.round(k / 3))); }
    else { g.fillStyle = o.rubber ? '#8A5A10' : '#173F28'; g.fillRect(x0 + (ex - 1) * k, y0 + 4 * k, 3 * k, k); }
  };
  eye(4, eyes[0] === 'o'); eye(11, eyes[1] === 'o');
}

/* ---------- 大脑（从上往下看，左右两半）和站岗的小人 ---------- */
/* state: 'watch' 左脑醒着、小人拿手电筒站岗；'off' 小人戴睡帽躺下（撤岗）；'both' 两边都睡着、没有小人；'flash' 左脑被怪声吓得一亮 */
function brainIcon(g, t, x, y, k, o = {}) {
  const L = o.left || 'asleep', Rt = o.right || 'asleep';
  const half = (cx, side, st) => {
    const col = st === 'awake' ? '#FF9DB5' : st === 'flash' ? '#FF5A6E' : '#C77F9E';
    pixOval(g, cx, y, 7 * k, 10 * k, k, mixHex(col, '#000000', .25));
    pixOval(g, cx, y, 6 * k, 9 * k, k, col);
    g.fillStyle = mixHex(col, '#5A1E3A', .45);
    for (let i = 0; i < 7; i++) { const yy = y + (i - 3) * 2.4 * k, xx = cx + (hash(i, side) - .5) * 6 * k; g.fillRect(Math.round(xx / k) * k, Math.round(yy / k) * k, 3 * k, k); g.fillRect(Math.round(xx / k) * k + (side ? -k : 3 * k), Math.round(yy / k) * k + k, k, k); }
    if (st === 'asleep') withAlpha(g, .42, () => pixOval(g, cx, y, 6 * k, 9 * k, k, '#3E4FAE'));
    if (st === 'awake' || st === 'flash') glow(g, cx, y, 12 * k, st === 'flash' ? 'rgba(255,80,90,.55)' : 'rgba(255,190,200,.35)');
  };
  half(x - 6.5 * k, 0, L); half(x + 6.5 * k, 1, Rt);
  g.fillStyle = '#5A1E3A'; g.fillRect(Math.round(x - k / 2), Math.round(y - 9 * k), k, 18 * k);
  if (o.labels !== false) { ptext(g, '左', x - 6.5 * k, y + 13.5 * k, Math.max(28, 4 * k), C.white, { align: 'center', ol: C.ink, olw: 4 }); ptext(g, '右', x + 6.5 * k, y + 13.5 * k, Math.max(28, 4 * k), C.white, { align: 'center', ol: C.ink, olw: 4 }); }
}
/* 站岗的小人（保安帽、手电筒）：(cx, by) 脚底；beam 手电筒光的角度（弧度，0 朝右），off=true 时戴睡帽躺下睡 */
function sentryAt(g, t, cx, by, k, o = {}) {
  if (o.off) {
    crabAt(g, cx, by, k, { col: TONES.blue, hat: 'night', eyes: 'shut' });
    const z = (t * 1.2) % 1; ptext(g, 'z', cx + 10 * k + z * 6 * k, by - 18 * k - z * 10 * k, 4 * k + 6, `rgba(255,255,255,${1 - z})`, { ol: C.ink, olw: 3 });
    return;
  }
  const ang = o.beam ?? (Math.PI + Math.sin(t * 1.6) * .6);
  const [hx, hy] = crabPt(cx, by, k, o.flip ? 0 : 23, 6, false);
  if (o.light !== false) {
    g.save(); g.globalCompositeOperation = 'lighter';
    const L = o.len || 26 * k;
    for (let i = 0; i < 6; i++) { const a = ang + (i - 2.5) * .07; g.fillStyle = 'rgba(255,240,170,.13)'; g.beginPath(); g.moveTo(hx, hy); g.lineTo(hx + Math.cos(a - .06) * L, hy + Math.sin(a - .06) * L); g.lineTo(hx + Math.cos(a + .06) * L, hy + Math.sin(a + .06) * L); g.closePath(); g.fill(); }
    g.restore();
  }
  crabAt(g, cx, by, k, { col: TONES.blue, hat: 'cap', eyes: o.eyes || 'wide', arms: o.salute ? 'upL' : 'n' });
  g.fillStyle = '#2B2547'; g.fillRect(hx - k, hy - k, 3 * k, 2 * k); g.fillStyle = '#FFE27A'; g.fillRect(hx + (Math.cos(ang) > 0 ? 2 * k : -k), hy - k, k, 2 * k);
}
/* 想法泡泡里的大脑：r 泡泡半径；(tx, ty) 小尾巴指向的地方（头顶） */
function brainBubble(g, t, x, y, r, o = {}) {
  const p = o.p ?? 1; if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p); g.translate(-x, -y);
  if (o.tx != null) [[.75, 16], [.45, 11], [.2, 7]].forEach(([u, rr]) => { pixOval(g, lerp(o.tx, x, u * .7 + .1), lerp(o.ty, y, u * .7 + .1), rr + 4, rr + 4, 4, C.ink); pixOval(g, lerp(o.tx, x, u * .7 + .1), lerp(o.ty, y, u * .7 + .1), rr, rr, 4, '#FFFFFF'); });
  pixOval(g, x, y, r + 8, r * .82 + 8, 4, C.ink); pixOval(g, x, y, r, r * .82, 4, mixHex('#FFFFFF', '#1E2450', o.dark ? .85 : 0));
  const k = Math.max(3, Math.round(r / 22));
  brainIcon(g, t, x, y - r * .08, k, { left: o.left, right: o.right, labels: o.labels });
  if (o.sentry) sentryAt(g, t, x - 6.5 * k, y - r * .08 - 4 * k, Math.max(2, Math.round(k * .6)), { off: o.sentry === 'off', salute: o.sentry === 'salute', beam: o.beam, len: r * 1.1 });
  if (o.right === 'asleep' && o.zzz !== false) { const z = (t * .9) % 1; ptext(g, 'z', x + r * .45 + z * 20, y - r * .25 - z * 40, 36, `rgba(94,200,255,${1 - z})`, { ol: C.ink, olw: 4 }); }
  g.restore();
}

/* ---------- 睡眠实验室（夜里）：设备架上的指示灯、墙上的喇叭、角落的摄像头、床；小怪戴着脑电帽，被子盖到下巴 ---------- */
function labBG(b, t, o = {}) {
  b.fillStyle = '#16222F'; b.fillRect(0, 0, 216, 384);
  b.fillStyle = '#1B2836'; for (let y = 0; y < 300; y += 16) for (let x = (y / 16 % 2) * 8; x < 216; x += 16) b.fillRect(x, y, 15, 15);
  b.fillStyle = '#101820'; b.fillRect(0, 296, 216, 88); b.fillStyle = '#18222C'; for (let x = 0; x < 216; x += 18) b.fillRect(x, 300, 1, 84);
  // 设备架：x 6..46, y 110..292
  b.fillStyle = '#0B1118'; b.fillRect(6, 110, 40, 182); b.fillStyle = '#23303E'; for (let y = 116; y < 288; y += 20) b.fillRect(9, y, 34, 16);
  for (let y = 116; y < 288; y += 20) for (let i = 0; i < 4; i++) { const on = hash(i, y, Math.floor(t * (2 + i))) > .45; b.fillStyle = on ? ['#5BE37D', '#FFB547', '#5EC8FF', '#FF5A4F'][i] : '#1A222C'; b.fillRect(12 + i * 6, y + 6, 3, 2); }
  b.fillStyle = '#0E161E'; b.fillRect(34, 118, 8, 8);
  // 小屏幕（波形）
  b.fillStyle = '#081016'; b.fillRect(52, 96, 52, 34); b.fillStyle = '#0F2A2A'; b.fillRect(54, 98, 48, 30);
  for (let x = 0; x < 48; x++) { const y1 = 106 + Math.round(Math.sin((x + t * 30) * .5) * 2), y2 = 120 + Math.round(Math.sin((x + t * 18) * .18) * 5); b.fillStyle = '#5BE37D'; b.fillRect(54 + x, y1, 1, 1); b.fillStyle = '#5EC8FF'; b.fillRect(54 + x, y2, 1, 1); }
  b.fillStyle = '#2B3846'; b.fillRect(76, 130, 3, 40);
  // 墙上的喇叭：x 150..170, y 104..124
  b.fillStyle = '#0B1118'; b.fillRect(150, 104, 22, 22); b.fillStyle = '#2B3846'; pdisc(b, 161, 115, 7, '#2B3846'); pdisc(b, 161, 115, 3, '#0B1118');
  // 角落的摄像头
  b.fillStyle = '#C9CED8'; b.fillRect(186, 30, 18, 10); b.fillStyle = '#0B1118'; b.fillRect(182, 33, 5, 4); b.fillStyle = Math.floor(t * 1.5) % 2 ? '#FF5A4F' : '#5A2020'; b.fillRect(200, 32, 2, 2);
  b.fillStyle = '#8A93A6'; b.fillRect(194, 22, 2, 8);
  // 床头
  b.fillStyle = '#3A4A5E'; b.fillRect(56, 176, 112, 30); b.fillStyle = '#4A5C72'; b.fillRect(60, 180, 104, 22);
  // 门牌："睡眠实验室"的小牌子（字在屏幕上写）
  b.fillStyle = '#E8ECF2'; b.fillRect(120, 60, 60, 14);
}
/* 实验室里的床：枕头、小怪（戴脑电帽，被子盖到下巴）、被子；导线连到左边的设备架。eyes：'shut' 睡着、'wide' 被吵醒 */
function labBed(g, t, o = {}) {
  g.fillStyle = '#C9D3E0'; g.fillRect(290, 1010, 380, 90);
  const cx = 480, by = 1290, k = 15;
  crabAt(g, cx, by, k, youO(t, { eyes: o.eyes || 'shut', mouth: o.mouth }));
  // 脑电帽：一圈小圆点，导线
  const pts = [[6, -1], [10, -2], [14, -2], [18, -1], [8, 0], [16, 0]];
  pts.forEach(([lx, ly]) => { const [x, y] = crabPt(cx, by, k, lx, ly); g.fillStyle = '#E8ECF2'; g.fillRect(x, y, 20, 15); g.fillStyle = '#5EC8FF'; g.fillRect(x + 5, y + 4, 10, 8); });
  g.strokeStyle = '#8A93A6'; g.lineWidth = 5;
  pts.forEach(([lx, ly], i) => { const [x, y] = crabPt(cx, by, k, lx, ly); g.beginPath(); g.moveTo(x + 10, y); g.quadraticCurveTo(x - 60 - i * 10, y - 120 - i * 14, 230, 700 + i * 22); g.stroke(); });
  // 被子
  g.fillStyle = '#6E86A8'; g.fillRect(230, 1140, 500, 780); g.fillStyle = '#E8ECF2'; g.fillRect(230, 1130, 500, 34); g.fillStyle = '#5A7090'; for (let y = 1200; y < 1920; y += 50) g.fillRect(260, y, 440, 6);
  g.fillStyle = '#4E6280'; g.fillRect(230, 1164, 10, 756); g.fillRect(720, 1164, 10, 756);
}
/* 脑电波形：(x, y) 左端中线，w 宽；amp 振幅（像素）、f 每秒几个波、burst 叠加的一下（0..1） */
function eegTrace(g, t, x, y, w, amp, f, col, o = {}) {
  const k = 4;
  for (let i = 0; i < w; i += k) {
    const tt = t - (w - i) / 260;
    let v = Math.sin(tt * f * TAU) * amp + Math.sin(tt * f * 3.7 * TAU + 1) * amp * .25 + (hash(Math.floor(tt * 60), 7) - .5) * amp * .3;
    if (o.burst) { const d = tt - o.burst; if (d > 0 && d < .5) v += Math.sin(d * 40) * o.burstAmp * (1 - d / .5); }
    g.fillStyle = col; g.fillRect(Math.round(x + i), Math.round(y + v), k, k);
  }
}

/* ---------- 夜里的池塘：月亮、星、远处的树林、水里的月影和涟漪、睡莲叶、前景摆动的芦苇（萤火虫在屏幕上画） ---------- */
function pondBG(b, t) {
  for (let y = 0; y < 150; y++) { b.fillStyle = mixHex('#080C22', '#1E2C5C', y / 150); b.fillRect(0, y, 216, 1); }
  pdisc(b, 46, 44, 13, '#FFF4C8'); pdisc(b, 42, 40, 3, '#F2E2A8'); pdisc(b, 52, 48, 2, '#F2E2A8');
  b.fillStyle = '#0D1626'; for (let x = 0; x < 216; x += 2) { const h = 10 + Math.round(Math.sin(x * .13) * 4 + Math.sin(x * .41) * 3 + hash(x, 5) * 3); b.fillRect(x, 150 - h, 2, h + 22); }
  for (let y = 168; y < 384; y++) { b.fillStyle = mixHex('#15284C', '#0A1428', (y - 168) / 216); b.fillRect(0, y, 216, 1); }
  for (let y = 172; y < 384; y += 3) { const w = 10 - (y - 172) / 40 + Math.sin(t * 2 + y * .7) * 3, x = 46 + Math.sin(t * 1.5 + y * .3) * 2; if (hash(y, Math.floor(t * 4)) > .2) { b.fillStyle = `rgba(255,244,200,${.5 - (y - 172) / 500})`; b.fillRect(Math.round(x - w / 2), y, Math.max(1, Math.round(w)), 1); } }
  for (let i = 0; i < 16; i++) { const y = 176 + Math.round(hash(i, 1) * 200), x = Math.round((hash(i, 2) * 260 + t * (4 + hash(i, 3) * 6)) % 240) - 12; b.fillStyle = 'rgba(160,190,240,.25)'; b.fillRect(x, y, 6 + Math.round(hash(i, 4) * 6), 1); }
  [[150, 250], [30, 300], [176, 330], [98, 352]].forEach(([x, y], i) => { b.fillStyle = '#1F4A32'; b.fillRect(x, y, 14, 5); b.fillRect(x + 2, y - 1, 10, 7); b.fillStyle = '#0A1428'; b.fillRect(x + 6, y, 3, 2); if (i === 1) { b.fillStyle = '#F4B8D0'; b.fillRect(x + 4, y - 3, 4, 3); } });
  // 木头：x 26..176, y 198..208（屏幕 y 990~1040）
  b.fillStyle = '#4A3424'; b.fillRect(26, 198, 150, 10); b.fillStyle = '#5E4430'; b.fillRect(26, 198, 150, 3); b.fillStyle = '#3A281C'; for (let x = 32; x < 174; x += 9) b.fillRect(x, 202, 4, 1);
  pdisc(b, 26, 203, 5, '#5E4430'); pdisc(b, 26, 203, 3, '#8A6A48'); pdisc(b, 26, 203, 1, '#5E4430');
  b.fillStyle = 'rgba(255,244,200,.12)'; b.fillRect(28, 209, 146, 2);
}
/* 前景的芦苇（屏幕坐标，随风摆），side 'L' / 'R' */
function reeds(g, t, side) {
  for (let i = 0; i < 9; i++) {
    const bx = side === 'L' ? 10 + i * 22 : 1070 - i * 22, h = 380 + hash(i, side === 'L' ? 1 : 2) * 260, top = 1280 - h;
    for (let y = 0; y < h; y += 10) { const sway = Math.sin(t * 1.1 + i + y * .004) * (h - y) / h * -18; g.fillStyle = i % 2 ? '#20381F' : '#2B4A2A'; g.fillRect(Math.round((bx + sway * (1 - y / h)) / 5) * 5, Math.round((top + y) / 5) * 5, 10, 10); }
    if (i % 3 === 0) { const sway = Math.sin(t * 1.1 + i) * -18; g.fillStyle = '#6B4A2E'; g.fillRect(Math.round((bx + sway) / 5) * 5 - 5, Math.round((top - 50) / 5) * 5, 20, 50); }
  }
}
/* 芦苇里一闪一闪的狐狸眼睛 */
function foxEyes(g, t, x, y) {
  if ((t % 3.2) < .15) return;
  g.fillStyle = '#7A3A1A'; g.fillRect(x - 40, y - 50, 20, 25); g.fillRect(x + 20, y - 50, 20, 25);
  g.fillStyle = '#FFD34E'; g.fillRect(x - 30, y, 15, 10); g.fillRect(x + 15, y, 15, 10); glow(g, x, y, 60, 'rgba(255,211,78,.35)');
}
/* 萤火虫（屏幕坐标） */
function fireflies(g, t, n, x0, y0, w, h, seed = 3) {
  for (let i = 0; i < n; i++) {
    const x = x0 + hash(i, seed) * w + Math.sin(t * .7 + i) * 30, y = y0 + hash(i, seed, 1) * h + Math.cos(t * .9 + i * 2) * 20;
    if (Math.sin(t * 2.5 + i * 1.7) > -.1) { g.fillStyle = '#F7F08A'; g.fillRect(Math.round(x / 5) * 5, Math.round(y / 5) * 5, 5, 5); glow(g, x, y, 22, 'rgba(247,240,138,.5)'); }
  }
}

/* ---------- 山洞（祖先在野外过夜）：岩壁框住洞口，洞外是夜空、灌木和狼的眼睛；地上一堆篝火（火苗在屏幕上画） ---------- */
function caveBG(b, t) {
  for (let y = 0; y < 240; y++) { b.fillStyle = mixHex('#070A1C', '#1A2450', y / 240); b.fillRect(0, y, 216, 1); }
  for (let i = 0; i < 40; i++) { if (Math.sin(t * (1 + hash(i, 1) * 2) + i) > 0) { b.fillStyle = '#E8E4FF'; b.fillRect(Math.round(hash(i, 2) * 216), Math.round(hash(i, 3) * 160), 1, 1); } }
  b.fillStyle = '#0E1A1A'; for (let x = 0; x < 216; x += 3) { const h = 18 + Math.round(Math.sin(x * .2) * 6 + hash(x, 8) * 6); b.fillRect(x, 230 - h, 3, h + 20); }
  b.fillStyle = '#1A140F'; b.fillRect(0, 240, 216, 144);
  // 岩壁（洞口是一个拱）
  for (let y = 0; y < 384; y++) {
    const u = y / 384, half = y < 60 ? 0 : 92 * Math.sqrt(Math.max(0, 1 - Math.pow((300 - y) / 240, 2)));
    const l = Math.round(108 - half - 6 - hash(y, 1) * 4), r = Math.round(108 + half + 6 + hash(y, 2) * 4);
    b.fillStyle = '#2E2420'; b.fillRect(0, y, Math.max(0, l), 1); b.fillRect(r, y, 216 - r, 1);
    b.fillStyle = '#3E3028'; if (y % 7 < 2) { b.fillRect(Math.max(0, l - 10), y, 6, 1); b.fillRect(r + 4, y, 6, 1); }
  }
  b.fillStyle = '#2A201A'; b.fillRect(0, 300, 216, 84); b.fillStyle = '#342820'; for (let x = 0; x < 216; x += 14) b.fillRect(x + (x % 28 ? 4 : 0), 306, 6, 2);
}
function campfire(g, t, x, y) {
  g.fillStyle = '#5A3A22'; g.fillRect(x - 70, y + 10, 140, 18); g.fillStyle = '#3A2414'; g.fillRect(x - 50, y + 2, 100, 14);
  for (let i = 0; i < 7; i++) {
    const ph = (t * 2.2 + i * .37) % 1, h = 70 + hash(i, 1) * 60, w = 20 + hash(i, 2) * 20, fx = x + (i - 3) * 14 + Math.sin(t * 7 + i) * 4;
    g.fillStyle = ['#FF5A2E', '#FF8A3D', '#FFD34E'][i % 3];
    const hh = h * (1 - ph * .5); g.fillRect(Math.round((fx - w / 2) / 5) * 5, Math.round((y - hh) / 5) * 5, Math.round(w / 5) * 5, Math.round(hh / 5) * 5);
  }
  for (let i = 0; i < 8; i++) { const ph = (t * .9 + i * .13) % 1; g.fillStyle = `rgba(255,200,90,${1 - ph})`; g.fillRect(Math.round((x + (hash(i, 4) - .5) * 80 + Math.sin(t * 3 + i) * 10) / 5) * 5, Math.round((y - 80 - ph * 200) / 5) * 5, 5, 5); }
  glow(g, x, y - 40, 420, 'rgba(255,140,60,.35)');
}
function wolfEyes(g, t, x, y, seed = 0) { if (((t + seed) % 4) < .2) return; g.fillStyle = '#FFE27A'; g.fillRect(x - 20, y, 12, 8); g.fillRect(x + 8, y, 12, 8); glow(g, x, y + 4, 40, 'rgba(255,226,122,.35)'); }

/* ---------- 图标：论文、行李箱、考卷、耳塞、月亮 ---------- */
function paperIcon(g, x, y, k = 5, col = '#FFFFFF') {
  g.fillStyle = C.ink; g.fillRect(x - k, y - k, 10 * k, 13 * k); g.fillStyle = col; g.fillRect(x, y, 8 * k, 11 * k);
  g.fillStyle = '#9AA6C0'; for (let i = 0; i < 4; i++) g.fillRect(x + k, y + (2 + i * 2) * k, (i === 3 ? 4 : 6) * k, k);
}
function suitcaseIcon(g, x, y, k = 6, col = '#E5322D') {
  g.fillStyle = C.ink; g.fillRect(x - k, y - k, 18 * k, 14 * k); g.fillStyle = col; g.fillRect(x, y, 16 * k, 12 * k);
  g.fillStyle = mixHex(col, '#000000', .3); g.fillRect(x, y + 5 * k, 16 * k, k); g.fillRect(x + 4 * k, y, k, 12 * k); g.fillRect(x + 11 * k, y, k, 12 * k);
  g.fillStyle = C.ink; g.fillRect(x + 5 * k, y - 4 * k, 6 * k, k); g.fillRect(x + 5 * k, y - 4 * k, k, 4 * k); g.fillRect(x + 10 * k, y - 4 * k, k, 4 * k);
}
function examIcon(g, x, y, k = 6) {
  paperIcon(g, x, y, k, '#FFF4DF');
  g.fillStyle = '#FF5A4F'; g.fillRect(x + 5 * k, y + 7 * k, 2 * k, 2 * k);
  g.fillStyle = '#F2B53A'; for (let i = 0; i < 6; i++) g.fillRect(x + (6 + i) * k, y + (10 - i) * k, k, k); g.fillStyle = '#FF9DB5'; g.fillRect(x + 12 * k, y + 4 * k, k, k);
}
function earplugIcon(g, x, y, k = 6) {
  [[0, 0], [7 * k, k]].forEach(([dx, dy]) => { g.fillStyle = C.ink; g.fillRect(x + dx - k, y + dy - k, 6 * k, 8 * k); g.fillStyle = '#FFB547'; g.fillRect(x + dx, y + dy, 4 * k, 6 * k); g.fillStyle = '#FFD98A'; g.fillRect(x + dx, y + dy, 2 * k, 2 * k); });
  g.fillStyle = '#5EC8FF'; g.fillRect(x + 2 * k, y + 6 * k, 7 * k, k);
}
function moonIcon(g, x, y, k = 5, bg = '#1E2450') { pixOval(g, x, y, 5 * k, 5 * k, k, '#FFE9A8'); pixOval(g, x + 2 * k, y - 2 * k, 4 * k, 4 * k, k, bg); }
