'use strict';
/* props.js：本片的场景和道具——客厅、教室、黑底聚光灯、实验室；打闹的"啪"、枕头、羽毛；
   大脑里管"音量"的小人和调音台（静音、音量全开、预告单）；按手指的实验台和力度表、一轮轮变高的柱子；
   挠手心的两台机器人、延迟旋钮和秒表；课桌和中间那条线。全部程序画的像素图。 */

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
/* "他"：跟你打闹的那一位（蓝色，头上翘着一撮毛） */
const himO = (t, o = {}) => Object.assign({ col: TONES.blue, cowlick: true, eyes: blinkEyes(t, 3) }, o);
/* 大脑里管"音量"的小人：粉色，戴耳机 */
const opO = (t, o = {}) => Object.assign({ col: '#E58BAA', headset: true, eyes: blinkEyes(t, 5) }, o);
/* 科学家：白大褂、眼镜 */
const sciO = (t, o = {}) => Object.assign({ col: TONES.purple, coat: true, glasses: true, eyes: blinkEyes(t, 6) }, o);
/* 实验里的两个志愿者 */
const volO = (i, t, o = {}) => Object.assign(i ? { col: TONES.yellow } : { col: TONES.green }, { eyes: blinkEyes(t, 7 + i) }, o);
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

/* ================= 椅子、沙发（屏幕坐标，k 和小怪同一个倍数） ================= */
/* 办公椅：(cx, seatY) 坐垫顶面中心；lean 0..1 往后靠；返回小怪坐上去时的脚底 y（腿从坐垫前沿垂下来） */
function drawOfficeChair(g, cx, seatY, k, o = {}) {
  const lean = o.lean || 0, dark = o.col || '#3E4A6B', mid = shadeOf(dark, 1.25), hi = shadeOf(dark, 1.5), metal = '#9AA1AD', metD = '#6B7180';
  cx = Math.round(cx); seatY = Math.round(seatY);
  g.save();
  // 椅背：往后靠时向右下歪一点
  const bw = 20 * k, bh = 19 * k, bx = cx - bw / 2 + Math.round(lean * 3) * k, by = seatY - bh - k;
  g.fillStyle = metD; g.fillRect(cx - k, seatY - 3 * k, 2 * k, 3 * k);
  g.save(); g.translate(cx, seatY - k); g.rotate(lean * .18); g.translate(-cx, -(seatY - k));
  g.fillStyle = C.ink; g.fillRect(bx - k, by - k, bw + 2 * k, bh + 2 * k);
  g.fillStyle = dark; g.fillRect(bx, by, bw, bh);
  g.fillStyle = mid; g.fillRect(bx + k, by + k, bw - 2 * k, bh - 3 * k);
  g.fillStyle = hi; g.fillRect(bx + 2 * k, by + k, bw - 4 * k, k);
  g.restore();
  // 坐垫
  const sw = 22 * k;
  g.fillStyle = C.ink; g.fillRect(cx - sw / 2 - k, seatY - k, sw + 2 * k, 4 * k);
  g.fillStyle = mid; g.fillRect(cx - sw / 2, seatY, sw, 2 * k); g.fillStyle = hi; g.fillRect(cx - sw / 2 + k, seatY, sw - 2 * k, k);
  // 扶手
  for (const s of [-1, 1]) { const ax = cx + s * (sw / 2 - k) - k; g.fillStyle = C.ink; g.fillRect(ax - k, seatY - 7 * k, 4 * k, k); g.fillRect(ax, seatY - 6 * k, 2 * k, 6 * k); g.fillStyle = metD; g.fillRect(ax + k * .5, seatY - 6 * k, k, 6 * k); }
  // 气杆、五爪脚、轮子
  g.fillStyle = metD; g.fillRect(cx - k, seatY + 3 * k, 2 * k, 6 * k); g.fillStyle = metal; g.fillRect(cx - k, seatY + 3 * k, k, 6 * k);
  const fy = seatY + 9 * k;
  g.fillStyle = C.ink; g.fillRect(cx - 12 * k, fy, 24 * k, 2 * k);
  g.fillStyle = metD; g.fillRect(cx - 11 * k, fy, 22 * k, k);
  for (const x of [-12, -1, 10]) { g.fillStyle = C.ink; g.fillRect(cx + x * k, fy + 2 * k, 2 * k, 2 * k); }
  g.restore();
  return seatY + 4 * k;
}

/* 沙发：(cx, by) 底边中心 */
function drawSofa(g, cx, by, k, col = '#C9574A') {
  const w = 34 * k, d = shadeOf(col, .75), hi = shadeOf(col, 1.2);
  const x0 = Math.round(cx - w / 2), y0 = Math.round(by - 16 * k);
  g.fillStyle = C.ink; g.fillRect(x0 - k, y0 - k, w + 2 * k, 15 * k);
  g.fillStyle = d; g.fillRect(x0, y0, w, 13 * k);                         // 靠背
  g.fillStyle = col; g.fillRect(x0 + 4 * k, y0 + 7 * k, w - 8 * k, 6 * k);  // 坐垫
  g.fillStyle = hi; g.fillRect(x0 + 4 * k, y0 + 7 * k, w - 8 * k, k);
  for (const x of [x0, x0 + w - 4 * k]) { g.fillStyle = col; g.fillRect(x, y0 + 3 * k, 4 * k, 10 * k); g.fillStyle = hi; g.fillRect(x, y0 + 3 * k, 4 * k, k); }
  g.fillStyle = '#5E3B22'; g.fillRect(x0 + 2 * k, y0 + 13 * k, 2 * k, 3 * k); g.fillRect(x0 + w - 4 * k, y0 + 13 * k, 2 * k, 3 * k);
}

/* 肌肉出力表：(x, y) 左上；v 0..1；横条 + 刻度 + 右边的字 */
function effortMeter(g, x, y, w, v, o = {}) {
  const h = o.h || 44, k = 6, col = v > .08 ? (o.col || C.green) : '#8A8496';
  g.save();
  g.fillStyle = C.ink; g.fillRect(x - k, y - k, w + 2 * k, h + 2 * k);
  g.fillStyle = '#3B3363'; g.fillRect(x, y, w, h);
  g.fillStyle = col; g.fillRect(x, y, Math.max(0, Math.round(w * clamp(v) / 6) * 6), h);
  g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x, y, Math.round(w * clamp(v) / 6) * 6, k);
  for (let i = 1; i < 10; i++) { g.fillStyle = 'rgba(0,0,0,.28)'; g.fillRect(x + Math.round(w * i / 10), y, 3, h); }
  g.restore();
}

/* ================= 背景（缓冲 108×192，P=10） ================= */
/* 客厅：暖色墙纸、傍晚的窗、挂画、落地灯、地毯；墙和地板的交界在 hy */
function livingBG(b, t, o = {}) {
  const hy = o.hy || 112;
  pbands(b, 0, 108, [[0, '#F4D4B4'], [hy - 6, '#EEC6A2'], [hy, '#A87250'], [192, '#93613F']], 2);
  for (let x = 4; x < 108; x += 9) prect(b, x, 0, 2, hy - 3, 'rgba(255,255,255,.16)');
  prect(b, 0, hy - 3, 108, 3, '#D9A57E'); prect(b, 0, hy - 3, 108, 1, '#E8BC98');
  // 窗：傍晚，远处的楼亮着灯
  prect(b, 6, 46, 34, 38, '#7A5236');
  pbands(b, 8, 30, [[48, '#4E4A86'], [60, '#C9708A'], [72, '#F2A065'], [82, '#F2A065']], 2);
  for (let i = 0; i < 5; i++) {
    const bx = 8 + i * 6, bh = 6 + Math.round(hash(i, 9) * 9);
    prect(b, bx, 82 - bh, 5, bh, '#3A3460');
    for (let wy = 83 - bh; wy < 81; wy += 3) if (hash(i, wy) > .4) pdot(b, bx + 2, wy, '#FFD98A');
  }
  prect(b, 22, 46, 2, 38, '#7A5236'); prect(b, 4, 84, 38, 2, '#8C6440');
  for (let j = 0; j < 40; j++) { const d = j % 4 === 0 ? 1 : 0; prect(b, 3 + d, 44 + j, 4, 1, '#D9534F'); prect(b, 39 - d, 44 + j, 4, 1, '#D9534F'); }
  prect(b, 2, 43, 42, 2, '#8C6440');
  // 挂画：小山和太阳
  prect(b, 60, 50, 22, 16, '#7A5236'); prect(b, 62, 52, 18, 12, '#BFE6FA'); pdisc(b, 76, 55, 2, '#FFE27A');
  for (let x = 62; x < 80; x++) { const hh = 3 + Math.round(Math.sin(x * .5) * 2); prect(b, x, 64 - hh, 1, hh, '#6FA84E'); }
  // 落地灯
  prect(b, 96, 70, 1, hy - 70, '#5E4630'); prect(b, 92, hy - 1, 9, 1, '#5E4630');
  for (let j = 0; j < 8; j++) prect(b, 93 - Math.floor(j / 3), 62 + j, 7 + Math.floor(j / 3) * 2, 1, j < 2 ? '#FFE9A8' : '#F7D27A');
  // 地毯、地板缝
  for (let y = hy + 4; y < 192; y += 9) prect(b, 0, y, 108, 1, 'rgba(0,0,0,.08)');
  pell(b, 54, hy + 12, 50, 9, '#C9574A'); pell(b, 54, hy + 12, 46, 7, '#E07A5F'); pell(b, 54, hy + 12, 32, 4, '#C9574A');
}
/* 教室：墙、绿墙裙、黑板、窗外的树；墙和地板的交界在 hy */
function classroomBG(b, t, o = {}) {
  const hy = o.hy || 112;
  pbands(b, 0, 108, [[0, '#F2EBD9'], [hy - 24, '#EDE4CF'], [hy, '#C9A27A'], [192, '#B48E66']], 2);
  prect(b, 0, hy - 24, 108, 24, '#86BBA0'); prect(b, 0, hy - 24, 108, 1, '#5E8F78');
  for (let y = hy + 5; y < 192; y += 10) prect(b, 0, y, 108, 1, 'rgba(0,0,0,.07)');
  // 黑板
  prect(b, 8, 40, 66, 34, '#7A5236'); prect(b, 10, 42, 62, 30, '#2F5D4A'); prect(b, 10, 72, 62, 2, '#B08E66');
  pdot(b, 20, 73, '#FFFFFF'); prect(b, 24, 73, 3, 1, '#F2C230');
  // 窗：外面一棵树
  prect(b, 82, 40, 22, 40, '#E8E0D0'); pbands(b, 84, 18, [[42, '#8FD0F7'], [78, '#CDEFFF']], 2);
  pdisc(b, 94, 60, 7, '#3E8E41'); pdisc(b, 90, 56, 5, '#5DB65A'); prect(b, 93, 66, 2, 12, '#6B4A2E');
  prect(b, 92, 40, 2, 40, '#E8E0D0'); prect(b, 82, 59, 22, 1, '#E8E0D0');
  // 挂钟
  pdisc(b, 41, 22, 5, '#3A2A3A'); pdisc(b, 41, 22, 4, '#FFFFFF'); pline(b, 41, 22, 41, 19, '#3A2A3A'); pline(b, 41, 22, 43, 23, '#3A2A3A');
}
/* 黑底聚光灯：(cx, by) 光斑中心 */
function stageBG(g, cx = 480, by = 1240) {
  g.fillStyle = '#0E0B1A'; g.fillRect(0, 0, W, H);
  g.save(); g.fillStyle = 'rgba(255,240,200,.10)';
  g.beginPath(); g.moveTo(cx - 80, 0); g.lineTo(cx + 80, 0); g.lineTo(cx + 330, by); g.lineTo(cx - 330, by); g.closePath(); g.fill(); g.restore();
  pixOval(g, cx, by, 340, 30, 6, 'rgba(255,240,200,.16)');
}

/* ================= 打闹 ================= */
/* 伸出去的手臂：从小怪身体侧面（手臂外缘）伸出 reach 个世界像素；flip 时往左伸。返回拳头中心 */
function reachArm(g, cx, by, k, reach, col, flip = false, ly = 4) {
  const top = Math.round(by - 16 * k + (ly + 1) * k), edge = flip ? Math.round(cx - 12 * k) : Math.round(cx + 12 * k);
  const len = Math.round(reach) * k, x0 = flip ? edge - len : edge;
  g.fillStyle = col; g.fillRect(x0, top, len, 2 * k);
  const fx = flip ? x0 - 2 * k : x0 + len - k;
  g.fillStyle = col; g.fillRect(fx, top - k, 3 * k, 4 * k);
  g.fillStyle = shadeOf(col, .8); g.fillRect(fx, top + 2 * k, 3 * k, k);
  return [fx + 1.5 * k, top + k];
}
/* 打中时的"啪"：(x, y) 中心，r 半径；像素格 k */
function burst(g, x, y, r, k, o = {}) {
  if (r <= 2) return;
  const n = o.n || 9, rot = o.rot || 0, pts = [];
  for (let i = 0; i < n * 2; i++) { const a = rot + i * Math.PI / n, rr = i % 2 ? r * .52 : r; pts.push([Math.cos(a) * rr, Math.sin(a) * rr]); }
  const inside = (px, py, s) => {
    let c = false;
    for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
      const xi = pts[i][0] * s, yi = pts[i][1] * s, xj = pts[j][0] * s, yj = pts[j][1] * s;
      if (((yi > py) !== (yj > py)) && (px < (xj - xi) * (py - yi) / (yj - yi) + xi)) c = !c;
    }
    return c;
  };
  const m = Math.ceil(r * 1.2 / k) + 1;
  for (const [s, col] of [[1.16, C.ink], [1, o.col2 || '#FF8A3D'], [.68, o.col || '#FFE27A'], [.3, '#FFFFFF']]) {
    g.fillStyle = col;
    for (let j = -m; j <= m; j++) for (let i = -m; i <= m; i++) if (inside((i + .5) * k, (j + .5) * k, s)) g.fillRect(Math.round(x + i * k), Math.round(y + j * k), k, k);
  }
  if (o.text) rich(g, o.text, x, y + 2, Math.round(r * .62), { col: o.textCol || '#D9443B', strokeCol: '#FFFFFF', stroke: Math.max(4, r * .1), shadow: false });
}
/* 枕头：(x, y) 中心，rot 旋转 */
function pillow(g, x, y, k, rot = 0, col = '#F4F4F4') {
  g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(rot);
  const w = 18 * k, h = 11 * k;
  g.fillStyle = C.ink; g.fillRect(-w / 2 - k, -h / 2 + k, w + 2 * k, h - 2 * k); g.fillRect(-w / 2 + k, -h / 2 - k, w - 2 * k, h + 2 * k);
  g.fillStyle = col; g.fillRect(-w / 2, -h / 2 + k, w, h - 2 * k); g.fillRect(-w / 2 + k, -h / 2, w - 2 * k, h);
  g.fillStyle = '#D3D9E3'; g.fillRect(-w / 2 + 2 * k, h / 2 - 2 * k, w - 4 * k, k);
  g.fillStyle = '#9FD3FF'; for (let i = 0; i < 3; i++) g.fillRect(-w / 2 + (4 + i * 5) * k, -k, 2 * k, 2 * k);
  g.restore();
}
/* 飘起来的羽毛：从 (x, y) 炸开，t0 开始 */
function feathers(g, x, y, t, t0, n = 10, k = 6) {
  const u = t - t0; if (u < 0 || u > 2.5) return;
  for (let i = 0; i < n; i++) {
    const a = hash(i, 3) * TAU, v = 160 + hash(i, 4) * 220;
    const px = x + Math.cos(a) * v * Math.min(u, .5) * 2 + Math.sin(u * 3 + i) * 20, py = y + Math.sin(a) * v * Math.min(u, .5) * 2 + u * 60;
    withAlpha(g, clamp((2.5 - u) / .6), () => { g.fillStyle = '#FFFFFF'; g.fillRect(Math.round(px), Math.round(py), 2 * k, k); g.fillStyle = '#D3D9E3'; g.fillRect(Math.round(px + 2 * k), Math.round(py + k), k, k); });
  }
}
/* 挠痒的波浪线：在 (x, y) 附近一闪一闪 */
function itchFX(g, x, y, t, k = 6, col = '#FF6F8E') {
  for (let i = 0; i < 3; i++) {
    const ph = Math.floor(t * 8 + i * 1.3) % 3; if (ph === 0) continue;
    const ox = x + (i - 1) * 9 * k, oy = y + ((i % 2) ? -4 : 3) * k;
    g.fillStyle = col; for (let j = 0; j < 5; j++) g.fillRect(Math.round(ox + j * k), Math.round(oy + ((j % 2) ? k : 0)), k, k);
  }
}
/* 笑出来的"哈"：从 (x, y) 往上冒 */
function hahaFX(g, x, y, t, t0, o = {}) {
  if (t < t0) return;
  const n = o.n || 4;
  for (let i = 0; i < n; i++) {
    const u = ((t - t0) * 1.4 + i / n) % 1, px = x + Math.sin(i * 2.1 + t * 3) * 60 + (i - n / 2) * 50, py = y - u * 220;
    withAlpha(g, Math.min(1, (1 - u) * 2, u * 6), () => ptext(g, '哈', px, py, 48 + (i % 2) * 12, o.col || '#FF5A4F', { align: 'center', ol: '#FFFFFF', olw: 5 }));
  }
}

/* ================= 大脑里管"音量"的小人 ================= */
/* 喇叭图标：mode 'mute'（打叉）、'on'（一道波）、'max'（三道波）；(x, y) 中心 */
function speakerIcon(g, x, y, k, mode = 'on', col = '#FFFFFF') {
  g.fillStyle = col;
  g.fillRect(Math.round(x - 5 * k), Math.round(y - 2 * k), 3 * k, 4 * k);
  for (let i = 0; i < 4; i++) g.fillRect(Math.round(x - 2 * k + i * k), Math.round(y - (2 + i) * k), k, (4 + 2 * i) * k);
  if (mode === 'mute') {
    g.fillStyle = '#FF5A4F';
    for (let i = 0; i < 5; i++) { g.fillRect(Math.round(x + 4 * k + i * k), Math.round(y - 2.5 * k + i * k), k, k); g.fillRect(Math.round(x + 8 * k - i * k), Math.round(y - 2.5 * k + i * k), k, k); }
    return;
  }
  const nw = mode === 'max' ? 3 : 1;
  for (let w = 0; w < nw; w++) { const r = 4 + w * 3; for (let j = -r + 1; j < r; j++) if (Math.abs(j) >= r - 2 || j === 0 || true) { const dx = Math.round(Math.sqrt(Math.max(0, r * r - j * j))); if (Math.abs(j) < r - .5) g.fillRect(Math.round(x + dx * k), Math.round(y + j * k), k, k); } }
}
/* 预告单：(x, y) 中心；mark 'ok' 打勾、'bad' 打叉 */
function predictCard(g, x, y, s, mark, o = {}) {
  const w = pw(g, s, o.px || 32) + 40 + (mark ? 50 : 0), h = 64;
  g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(o.rot ?? -.04);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-w / 2 + 8, -h / 2 + 8, w, h);
  g.fillStyle = C.ink; g.fillRect(-w / 2 - 4, -h / 2 - 4, w + 8, h + 8);
  g.fillStyle = '#FFF6D8'; g.fillRect(-w / 2, -h / 2, w, h);
  g.fillStyle = '#F2C230'; g.fillRect(-w / 2, -h / 2, w, 8);
  ptext(g, s, -w / 2 + 20, 14, o.px || 32, C.ink);
  if (mark === 'ok') checkMark(g, w / 2 - 50, -14, 5, '#3E9E4F');
  if (mark === 'bad') { g.fillStyle = '#FF5A4F'; for (let i = 0; i < 6; i++) { g.fillRect(w / 2 - 46 + i * 5, -16 + i * 5, 5, 5); g.fillRect(w / 2 - 21 - i * 5, -16 + i * 5, 5, 5); } }
  g.restore();
}
/* 大脑小剧场：(cx, cy) 中心、r 半径的圆窗，里面是管"音量"的小人和推子。
   o.vol 0..1 推子；o.label 推子上的字（"痒""力"）；o.mode 喇叭（mute / on / max）；o.push 小人伸手推推子；
   o.alarm 0..1 红灯闪；o.op 小人的样子；o.card 预告单（{s, mark}） */
function brainRoom(g, cx, cy, r, t, o = {}) {
  pixOval(g, cx, cy, r + 14, r + 14, 6, C.ink);
  pixOval(g, cx, cy, r + 8, r + 8, 6, o.rim || '#F2A0B8');
  pixOval(g, cx, cy, r, r, 6, o.alarm > 0 && Math.floor(t * 8) % 2 ? '#4A2238' : '#232A4E');
  clipOval(g, cx, cy, r - 3, r - 3, () => {
    g.fillStyle = 'rgba(120,200,255,.07)'; for (let x = cx - r; x < cx + r; x += 30) g.fillRect(Math.round(x), cy - r, 3, 2 * r);
    const k = Math.max(3, Math.round(r / 30)), dy = Math.round(cy + r * .32);
    // 小人坐在台子后面
    const ox = Math.round(cx - r * .36);
    crabAt(g, ox, dy + 7 * k, k, opO(t, o.op || {}));
    // 台子
    g.fillStyle = '#3B3363'; g.fillRect(cx - r, dy, 2 * r, r);
    g.fillStyle = '#5A4F96'; g.fillRect(cx - r, dy, 2 * r, k * 2);
    for (let i = 0; i < 6; i++) { g.fillStyle = ['#FF5A4F', '#FFD34E', '#5BE37D'][i % 3]; g.fillRect(Math.round(cx - r * .7 + i * 4 * k), dy + 4 * k, k * 2, k); }
    // 推子：竖槽、旁边一排灯
    const sx = Math.round(cx + r * .34), top = Math.round(cy - r * .5), bot = dy - 3 * k, v = clamp(o.vol ?? .5);
    g.fillStyle = '#141A33'; g.fillRect(sx - 5 * k, top - 3 * k, 18 * k, bot - top + 6 * k);
    g.fillStyle = '#0B0F22'; g.fillRect(sx - k, top, 2 * k, bot - top);
    const n = 8;
    for (let i = 0; i < n; i++) {
      const lit = (i + .5) / n <= v + .001, y = Math.round(bot - (i + 1) * (bot - top) / n + k);
      g.fillStyle = lit ? (i < 4 ? '#5BE37D' : i < 6 ? '#FFD34E' : '#FF5A4F') : '#2B2547';
      g.fillRect(sx + 5 * k, y, 5 * k, Math.max(k, Math.round((bot - top) / n) - k));
    }
    const ky = Math.round(lerp(bot, top, v));
    g.fillStyle = C.ink; g.fillRect(sx - 4 * k, ky - 2 * k, 8 * k, 4 * k);
    g.fillStyle = '#E8EEF5'; g.fillRect(sx - 3 * k, ky - k, 6 * k, 2 * k);
    if (o.push) reachArm(g, ox, dy + 7 * k, k, Math.max(1, (sx - 3 * k - (ox + 12 * k)) / k), opO(t).col, false, Math.round((ky - (dy + 7 * k - 16 * k)) / k) - 1);
    if (o.label) ptext(g, o.label, sx + 2 * k, top - 6 * k, 36, '#FFFFFF', { align: 'center', ol: C.ink, olw: 4 });
    speakerIcon(g, sx - 15 * k, top + 2 * k, Math.max(3, k - 1), o.mode || 'on', o.mode === 'mute' ? '#9AA1AD' : '#FFFFFF');
    if (o.alarm > 0 && Math.floor(t * 8) % 2) { g.fillStyle = '#FF5A4F'; g.fillRect(cx - 4 * k, cy - r + 4 * k, 8 * k, 4 * k); }
  });
  if (o.card) predictCard(g, cx - r * .38, cy - r * .42, o.card.s, o.card.mark, { px: 32 });
  if (o.title) { g.save(); g.translate(cx, cy - r - 10); ptag(g, 0, 0, o.title, 32, { fill: '#F2A0B8' }); g.restore(); }
}
/* 从角色头顶连到大脑圆窗的小圆点 */
function brainDots(g, x0, y0, x1, y1, k = 6) {
  for (let i = 1; i <= 3; i++) { const u = i / 4; pixOval(g, lerp(x0, x1, u), lerp(y0, y1, u), 6 + i * 4, 6 + i * 4, k, C.ink); pixOval(g, lerp(x0, x1, u), lerp(y0, y1, u), i * 4, i * 4, k, '#F2A0B8'); }
}

/* ================= 实验 ================= */
/* 力度表（圆盘 + 指针）：(x, y) 中心，r 半径，v 0..1 */
function dialGauge(g, x, y, r, v, o = {}) {
  pixOval(g, x, y, r + 8, r + 8, 6, C.ink); pixOval(g, x, y, r, r, 6, '#F4F4F4');
  const a0 = Math.PI * .8, a1 = Math.PI * 2.2;
  for (let i = 0; i <= 24; i++) {
    const u = i / 24, a = lerp(a0, a1, u), col = u < .5 ? '#5BE37D' : u < .78 ? '#FFD34E' : '#FF5A4F';
    for (let d = 0; d < 3; d++) { g.fillStyle = col; g.fillRect(Math.round(x + Math.cos(a) * (r - 14 - d * 5) - 3), Math.round(y + Math.sin(a) * (r - 14 - d * 5) - 3), 6, 6); }
  }
  const a = lerp(a0, a1, clamp(v));
  for (let d = 0; d < r - 26; d += 5) { g.fillStyle = C.ink; g.fillRect(Math.round(x + Math.cos(a) * d - 4), Math.round(y + Math.sin(a) * d - 4), 8, 8); }
  pixOval(g, x, y, 14, 14, 6, '#FF5A4F');
  if (o.label) ptext(g, o.label, x, y + r * .62, 28, C.ink, { align: 'center' });
}
/* 摇把手的机器人：(x, by) 底座中心；u -1..1 把手左右的位置 */
function handleBot(g, x, by, k, u) {
  g.fillStyle = C.ink; g.fillRect(x - 9 * k, by - 4 * k, 18 * k, 4 * k);
  g.fillStyle = '#6B7180'; g.fillRect(x - 8 * k, by - 3 * k, 16 * k, 3 * k); g.fillStyle = '#5EC8FF'; g.fillRect(x - 6 * k, by - 2 * k, 2 * k, k);
  g.fillStyle = '#9AA1AD'; g.fillRect(x - k, by - 15 * k, 2 * k, 11 * k);
  const hx = Math.round(x + u * 5 * k);
  g.fillStyle = '#9AA1AD'; g.fillRect(Math.min(x, hx) - k, by - 16 * k, Math.abs(hx - x) + 2 * k, 2 * k);
  g.fillStyle = C.ink; g.fillRect(hx - 2 * k, by - 22 * k, 4 * k, 7 * k);
  g.fillStyle = '#FF8A3D'; g.fillRect(hx - k, by - 21 * k, 2 * k, 5 * k);
  return [hx, by - 18 * k];
}
/* 挠手心的机器人：(x, by) 底座中心；u -1..1 海绵头左右的位置；海绵头伸到底座左边 reach 个世界像素 */
function tickleBot(g, x, by, k, u, reach = 16, tipY = null) {
  g.fillStyle = C.ink; g.fillRect(x - 9 * k, by - 4 * k, 18 * k, 4 * k);
  g.fillStyle = '#6B7180'; g.fillRect(x - 8 * k, by - 3 * k, 16 * k, 3 * k); g.fillStyle = '#FF5A4F'; g.fillRect(x + 4 * k, by - 2 * k, 2 * k, k);
  g.fillStyle = '#9AA1AD'; g.fillRect(x - k, by - 26 * k, 2 * k, 22 * k);
  const tx = Math.round(x - reach * k + u * 5 * k), ty = tipY ?? by - 12 * k;
  g.fillStyle = '#9AA1AD'; g.fillRect(tx, by - 27 * k, x - tx + k, 2 * k);
  g.fillStyle = '#9AA1AD'; g.fillRect(tx - k, by - 27 * k, 2 * k, ty - (by - 27 * k) - 2 * k);
  g.fillStyle = C.ink; g.fillRect(tx - 3 * k, ty - 3 * k, 6 * k, 4 * k);
  g.fillStyle = '#FFD84A'; g.fillRect(tx - 2 * k, ty - 2 * k, 4 * k, 2 * k); g.fillStyle = '#E8B92E'; g.fillRect(tx - 2 * k, ty - k, 4 * k, k);
  return [tx, ty];
}
/* 实验桌：(x0, y) 桌面左端，w 宽 */
function labTable(g, x0, y, w, k = 6) {
  g.fillStyle = C.ink; g.fillRect(x0 - k, y - k, w + 2 * k, 5 * k);
  g.fillStyle = '#E8EEF5'; g.fillRect(x0, y, w, 3 * k); g.fillStyle = '#C3CCD8'; g.fillRect(x0, y + 2 * k, w, k);
  g.fillStyle = '#6B7180'; g.fillRect(x0 + 2 * k, y + 4 * k, 2 * k, 30 * k); g.fillRect(x0 + w - 4 * k, y + 4 * k, 2 * k, 30 * k);
}
/* 延迟旋钮盒：(x, y) 中心；u 0..1 旋钮转了多少；s 屏幕上的读数 */
function delayBox(g, x, y, u, s) {
  pbox(g, x - 150, y - 90, 300, 180, { k: 6, fill: '#2B2547' });
  ptext(g, '延迟', x - 110, y - 30, 32, '#CFC6E8');
  g.fillStyle = '#0B0F22'; g.fillRect(x - 10, y - 66, 140, 56);
  ptext(g, s, x + 60, y - 24, 36, '#5BE37D', { align: 'center' });
  const kx = x - 60, ky = y + 34;
  pixOval(g, kx, ky, 36, 36, 6, C.ink); pixOval(g, kx, ky, 30, 30, 6, '#9AA1AD');
  const a = -Math.PI * .75 + u * Math.PI * 1.2;
  for (let d = 0; d < 26; d += 6) { g.fillStyle = '#FF5A4F'; g.fillRect(Math.round(kx + Math.cos(a) * d - 3), Math.round(ky + Math.sin(a) * d - 3), 6, 6); }
  for (let i = 0; i < 3; i++) { g.fillStyle = i <= u * 2.5 ? '#FFD34E' : '#4C4380'; g.fillRect(x + 10 + i * 40, y + 24, 28, 20); }
}
/* 秒表：(x, y) 中心 */
function stopwatch(g, x, y, k, t) {
  g.fillStyle = C.ink; g.fillRect(x - k, y - 11 * k, 2 * k, 2 * k); g.fillRect(x - 3 * k, y - 12 * k, 6 * k, k);
  pixOval(g, x, y, 9 * k, 9 * k, k, C.ink); pixOval(g, x, y, 8 * k, 8 * k, k, '#FFFFFF');
  const a = -Math.PI / 2 + t * TAU * .5;
  for (let d = 0; d < 6; d++) { g.fillStyle = '#FF5A4F'; g.fillRect(Math.round(x + Math.cos(a) * d * k - k / 2), Math.round(y + Math.sin(a) * d * k - k / 2), k, k); }
  g.fillStyle = C.ink; g.fillRect(x - k, y - k, 2 * k, 2 * k);
}

/* ================= 教室 ================= */
/* 两人一张的课桌：(cx, topY) 桌面中心；桌面中间一道粉笔线 */
function schoolDesk(g, cx, topY, k) {
  const w = 64 * k, x0 = Math.round(cx - w / 2);
  g.fillStyle = C.ink; g.fillRect(x0 - k, topY - k, w + 2 * k, 18 * k);
  g.fillStyle = '#E2B87A'; g.fillRect(x0, topY, w, 3 * k); g.fillStyle = '#F2CF96'; g.fillRect(x0, topY, w, k);
  g.fillStyle = '#C99A5A'; g.fillRect(x0, topY + 3 * k, w, 13 * k);
  g.fillStyle = '#B48548'; g.fillRect(x0 + 2 * k, topY + 5 * k, w / 2 - 4 * k, 9 * k); g.fillRect(cx + 2 * k, topY + 5 * k, w / 2 - 4 * k, 9 * k);
  // 粉笔线：桌面正中间
  g.fillStyle = '#FFFFFF'; g.fillRect(Math.round(cx - k / 2), topY - k, k, 4 * k);
  g.fillStyle = '#6B7180'; g.fillRect(x0 + 2 * k, topY + 16 * k, 2 * k, 12 * k); g.fillRect(x0 + w - 4 * k, topY + 16 * k, 2 * k, 12 * k);
}
