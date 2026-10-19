'use strict';
/* props.js：本片的场景和道具——办公室和办公椅、草原上的营地（篝火、猴面包树）、传感器、肌肉工人（上班 / 下班）、
   肌肉出力表、血管里的"糖块车"和肌肉工厂、血糖曲线、汽车座椅和沙发、天平、一百万个小人，
   以及直接在屏幕上按整数倍画小怪的工具。全部程序画的像素图。 */

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
/* 哈扎人：今天还在打猎采集的人，按真实的人来画（深一点的肤色、头带），不画成"原始人" */
const hadzaO = (t, o = {}, seed = 2) => Object.assign({ col: '#B0694A', hat: 'band', eyes: blinkEyes(t, seed) }, o);
/* 系列里的卡通"原始人"：骨头发饰 */
const cavemanO = (t, o = {}) => Object.assign({ col: '#C98A5E', hat: 'bone', eyes: blinkEyes(t, 4) }, o);
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
function officeBG(b, t) {
  pbands(b, 0, 108, [[0, '#F6E9D8'], [104, '#EFDFCB'], [113, '#B98E62'], [192, '#A27A55']], 2);
  prect(b, 0, 112, 108, 1, '#8C6440');
  // 窗
  prect(b, 56, 44, 46, 44, '#6B5A4A'); pbands(b, 58, 42, [[46, '#8FD0F7'], [86, '#D6F1FF']], 2);
  for (let i = 0; i < 6; i++) {
    const bx = 58 + i * 7, bh = 12 + Math.round(hash(i, 5) * 20);
    prect(b, bx, 86 - bh, 6, bh, i % 2 ? '#9BB0C8' : '#AFC2D8');
    for (let wy = 88 - bh; wy < 84; wy += 3) { pdot(b, bx + 1, wy, '#E8F1F8'); pdot(b, bx + 4, wy, '#E8F1F8'); }
  }
  prect(b, 79, 44, 1, 44, '#6B5A4A'); prect(b, 56, 64, 46, 1, '#6B5A4A'); prect(b, 54, 88, 50, 2, '#8C7460');
  // 挂钟
  pdisc(b, 22, 54, 7, '#3A2A3A'); pdisc(b, 22, 54, 6, '#FFFFFF');
  const hh = (t * .6) % TAU; pline(b, 22, 54, 22 + Math.round(Math.sin(hh) * 4), 54 - Math.round(Math.cos(hh) * 4), '#3A2A3A'); pline(b, 22, 54, 22, 50, '#3A2A3A');
  // 绿植
  prect(b, 6, 101, 9, 12, '#C9733E'); prect(b, 6, 101, 9, 1, '#E8955A');
  for (let i = 0; i < 7; i++) pdisc(b, 6 + (i % 3) * 4, 92 + Math.floor(i / 3) * 4 - (i % 2), 3, i % 2 ? '#5A9E45' : '#7DBB57');
  // 地板缝
  for (let x = 4; x < 108; x += 13) prect(b, x, 113, 1, 79, 'rgba(0,0,0,.07)');
}
/* 草原上的营地（缓冲 108×192，P=10）：天、太阳、云、远山、猴面包树、草地（地平线 hy） */
function savannaBG(b, t, hy = 120, o = {}) {
  const dusk = o.dusk || 0;
  pbands(b, 0, 108, [[0, mixHex('#5BB0EA', '#F2A35E', dusk)], [Math.round(hy * .45), mixHex('#7CC4F2', '#F7C27A', dusk)], [hy - 6, mixHex('#BFE6FA', '#FFE2A8', dusk)], [hy, '#BFE6FA']], 3);
  // 太阳、云
  pdisc(b, 84, 26, 7, '#FFE27A'); pdisc(b, 84, 26, 5, '#FFF4C2');
  for (let i = 0; i < 3; i++) { const x = ((i * 47 + t * 2.2) % 150) - 30, y = 14 + i * 11; prect(b, x, y, 12, 2, '#FFFFFF'); prect(b, x + 3, y - 1, 6, 1, '#FFFFFF'); }
  // 远山
  for (let x = 0; x < 108; x++) { const h = 6 + Math.sin(x * .08 + 1) * 4 + Math.sin(x * .21) * 2; prect(b, x, hy - h, 1, h, '#A9C9B6'); }
  // 草地
  pbands(b, 0, 108, [[hy, '#C8B45A'], [hy + 18, '#B9A04A'], [192, '#B9A04A']], 3);
  const r = R(11);
  for (let i = 0; i < 180; i++) { const x = r() * 108, y = hy + 1 + r() * (192 - hy); pdot(b, x, y, r() < .5 ? '#A68E3E' : '#D6C46E'); }
  if (o.trees !== false) { drawBaobab(b, 14, hy + 2, 1); drawBaobab(b, 96, hy + 1, .8); }
}
function drawBaobab(g, x, y, s = 1) {
  const w = Math.round(9 * s), h = Math.round(24 * s);
  prect(g, x - w / 2, y - h, w, h, '#9C7A5A'); prect(g, x - w / 2, y - h, 2, h, '#B8977A');
  for (let i = 0; i < 6; i++) {
    const a = -Math.PI / 2 + (i - 2.5) * .45, L = 10 * s;
    pline(g, x, y - h, x + Math.cos(a) * L, y - h + Math.sin(a) * L * .7, '#8C6A4A');
    pdisc(g, x + Math.cos(a) * L, y - h + Math.sin(a) * L * .7 - 1, Math.round(3 * s), '#6FA84E');
  }
}
/* 篝火（缓冲坐标）：(x, y) 底边中心 */
function drawFire(g, x, y, t) {
  prect(g, x - 6, y - 2, 12, 2, '#6B4630'); pline(g, x - 6, y - 4, x + 5, y - 1, '#8C6440');
  for (let i = 0; i < 5; i++) { const h = 3 + Math.floor((Math.sin(t * 13 + i * 1.9) + 1) * 2.5); prect(g, x - 4 + i * 2, y - 2 - h, 2, h, i % 2 ? '#FF8A3D' : '#FFD84A'); }
}
/* 草棚（缓冲坐标）：(x, y) 底边中心 */
function drawHut(g, x, y, w = 22) {
  for (let j = 0; j < 12; j++) { const hw = Math.round(w / 2 * Math.sqrt(1 - ((12 - j) / 12) ** 2)); prect(g, x - hw, y - 12 + j, hw * 2, 1, j % 3 ? '#C9A866' : '#B08E50'); }
  prect(g, x - 3, y - 6, 6, 6, '#5E4426');
}

/* ================= 椅子、沙发、汽车座椅（屏幕坐标，k 和小怪同一个倍数） ================= */
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
/* 汽车座椅 + 方向盘：(cx, seatY) 坐垫顶面中心 */
function drawCarSeat(g, cx, seatY, k) {
  const col = '#4A4F63', hi = '#6B7186';
  g.fillStyle = C.ink; g.fillRect(cx - 12 * k, seatY - 22 * k, 20 * k, 22 * k); g.fillRect(cx - 12 * k, seatY - k, 26 * k, 5 * k);
  g.fillStyle = col; g.fillRect(cx - 11 * k, seatY - 21 * k, 18 * k, 20 * k); g.fillRect(cx - 11 * k, seatY, 24 * k, 3 * k);
  g.fillStyle = hi; g.fillRect(cx - 9 * k, seatY - 25 * k, 14 * k, 5 * k); g.fillStyle = C.ink; g.fillRect(cx - 9 * k, seatY - 26 * k, 14 * k, k);   // 头枕
  g.fillStyle = hi; g.fillRect(cx - 10 * k, seatY - 20 * k, 16 * k, k);
}
function drawWheel(g, x, y, k, t) {
  pixRing(g, x, y, 7 * k, 7 * k, 1.4, k, C.ink); pixRing(g, x, y, 6 * k, 6 * k, 1, k, '#3A3F52');
  g.fillStyle = '#3A3F52'; g.fillRect(x - 6 * k, y - k / 2, 12 * k, k); g.fillRect(x - k / 2, y, k, 6 * k);
}

/* ================= 传感器、肌肉 ================= */
/* 绑在大腿上的传感器：(x, y) 中心 */
function sensorPatch(g, x, y, k, t) {
  x = Math.round(x); y = Math.round(y);
  g.fillStyle = C.ink; g.fillRect(x - 4 * k, y - 3 * k, 8 * k, 6 * k);
  g.fillStyle = '#E8EEF5'; g.fillRect(x - 3 * k, y - 2 * k, 6 * k, 4 * k);
  g.fillStyle = '#9AA1AD'; g.fillRect(x - 3 * k, y + k, 6 * k, k);
  g.fillStyle = Math.floor(t * 2.5) % 2 ? '#5BE37D' : '#1E6B3A'; g.fillRect(x - k, y - k, 2 * k, k);
}
/* 肌肉工人：(x, y) 脚底中心。mode：'work' 戴安全帽抡锤子干活，'sleep' 戴睡帽趴着打呼，'idle' 站着，'wave' 招手 */
function muscleGuy(g, x, y, k, t, mode = 'work') {
  const rows = ['..rrrrrr..', '.rrrrrrrr.', 'rrRrrrrRrr', 'rrrRrrRrrr', 'rrrrrrrrrr', 'rrRrrrrRrr', '.rrRrrRrr.', '..rrrrrr..'];
  const pal = { r: '#E5574F', R: '#B83A3A' };
  const bob = mode === 'work' ? (Math.floor(t * 6) % 2) * k : 0, sleep = mode === 'sleep';
  const cx = Math.round(x), by = Math.round(y), top = by - 10 * k + bob;
  g.save();
  if (sleep) { g.translate(cx, by); g.rotate(.18); g.translate(-cx, -by); }
  // 腿
  g.fillStyle = '#B83A3A'; g.fillRect(cx - 3 * k, by - 2 * k, 2 * k, 2 * k); g.fillRect(cx + k, by - 2 * k, 2 * k, 2 * k);
  // 身体（一块肌肉，上面几道纹）
  pix(g, rows, pal, cx, top + 4 * k, k);
  g.fillStyle = '#FF9A8E'; g.fillRect(cx - 3 * k, top + k, 3 * k, k);
  // 脸
  if (sleep) { g.fillStyle = C.ink; g.fillRect(cx - 3 * k, top + 3 * k, 2 * k, k / 2 + 1); g.fillRect(cx + k, top + 3 * k, 2 * k, k / 2 + 1); }
  else { g.fillStyle = '#FFFFFF'; g.fillRect(cx - 3 * k, top + 2 * k, 2 * k, 2 * k); g.fillRect(cx + k, top + 2 * k, 2 * k, 2 * k); g.fillStyle = C.ink; g.fillRect(cx - 2 * k, top + 3 * k, k, k); g.fillRect(cx + 2 * k, top + 3 * k, k, k); }
  g.fillStyle = '#7A1E2A'; g.fillRect(cx - k, top + 5 * k, 2 * k, k);
  // 帽子：上班戴黄安全帽，下班戴睡帽
  if (sleep) { g.fillStyle = '#5B7FD6'; g.fillRect(cx - 4 * k, top - k, 8 * k, 2 * k); g.fillRect(cx, top - 3 * k, 5 * k, 2 * k); g.fillStyle = '#FFFFFF'; g.fillRect(cx - 4 * k, top, 8 * k, k); g.fillRect(cx + 5 * k, top - 4 * k, 2 * k, 2 * k); }
  else { g.fillStyle = '#F2C230'; g.fillRect(cx - 3 * k, top - 2 * k, 6 * k, 2 * k); g.fillRect(cx - 5 * k, top - k, 10 * k, k); g.fillStyle = '#FFE27A'; g.fillRect(cx - 2 * k, top - 2 * k, 2 * k, k); }
  // 手里的东西
  if (mode === 'work') {
    const sw = Math.floor(t * 6) % 2;
    g.fillStyle = '#8C6440'; g.fillRect(cx + 5 * k, top + (sw ? 1 : 3) * k, k, 5 * k);
    g.fillStyle = '#9AA1AD'; g.fillRect(cx + 4 * k, top + (sw ? 0 : 2) * k, 3 * k, 2 * k);
    g.fillStyle = '#9FD3FF'; g.fillRect(cx - 6 * k, top + k, k, 2 * k);               // 汗
  } else if (mode === 'wave') {
    const up = Math.floor(t * 4) % 2;
    g.fillStyle = '#E5574F'; g.fillRect(cx + 5 * k, top + (up ? 0 : 2) * k, 2 * k, 3 * k);
  }
  g.restore();
  if (sleep) {                                   // 呼噜：一串 Z 往上飘
    for (let i = 0; i < 3; i++) { const u = ((t * .7 + i / 3) % 1); withAlpha(g, 1 - u, () => ptext(g, 'Z', cx + 5 * k + u * 40, top - 2 * k - u * 70, Math.round((24 + i * 6) / 12) * 12, '#5B7FD6', { ol: '#FFFFFF', olw: 3 })); }
  }
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

/* ================= 血管和肌肉工厂 ================= */
/* 糖块：白色小方块，带一点阴影；(x, y) 中心 */
function sugarCube(g, x, y, k, o = {}) {
  x = Math.round(x); y = Math.round(y);
  g.fillStyle = C.ink; g.fillRect(x - 4 * k, y - 4 * k, 8 * k, 8 * k);
  g.fillStyle = '#FFFFFF'; g.fillRect(x - 3 * k, y - 3 * k, 6 * k, 6 * k);
  g.fillStyle = '#D9E2EE'; g.fillRect(x - 3 * k, y + k, 6 * k, 2 * k); g.fillRect(x + k, y - 3 * k, 2 * k, 6 * k);
  if (o.face) { g.fillStyle = C.ink; g.fillRect(x - 2 * k, y - k, k, k); g.fillRect(x, y - k, k, k); if (o.face === 'mad') { g.fillRect(x - 2 * k, y + k, 3 * k, k / 2 + 1); } }
}
/* 肌肉工厂：(x, by) 左下；open 0..1（卷帘门拉开多少）；t 动画 */
function musclePlant(g, x, by, k, t, open) {
  const w = 44 * k, h = 30 * k, y0 = by - h;
  g.save();
  // 烟囱和烟（开工时冒烟）
  g.fillStyle = C.ink; g.fillRect(x + w - 12 * k, y0 - 14 * k, 8 * k, 15 * k); g.fillStyle = '#B85A52'; g.fillRect(x + w - 11 * k, y0 - 13 * k, 6 * k, 14 * k);
  if (open > .5) for (let i = 0; i < 4; i++) { const u = (t * .6 + i / 4) % 1; withAlpha(g, (1 - u) * .8, () => pixOval(g, x + w - 8 * k + u * 30, y0 - 16 * k - u * 120, (3 + u * 5) * k, (2 + u * 3) * k, k, '#F4F4F4')); }
  // 房子
  g.fillStyle = C.ink; g.fillRect(x - k, y0 - k, w + 2 * k, h + k);
  g.fillStyle = '#F07A6E'; g.fillRect(x, y0, w, h);
  g.fillStyle = '#FF9A8E'; g.fillRect(x, y0, w, 2 * k);
  for (let i = 0; i < 4; i++) { g.fillStyle = '#D9564C'; g.fillRect(x + (4 + i * 10) * k, y0 + 4 * k, k, 8 * k); }   // 墙上的肌肉纹
  // 招牌
  g.fillStyle = C.ink; g.fillRect(x + 4 * k, y0 - 8 * k, w - 8 * k, 8 * k); g.fillStyle = '#FFE9A8'; g.fillRect(x + 5 * k, y0 - 7 * k, w - 10 * k, 6 * k);
  ptext(g, '肌肉工厂', x + w / 2, y0 - 3 * k + 12, 36, C.ink, { align: 'center' });
  // 大门：开着是黑的入口，关上是卷帘门 + "下班"牌子
  const gx = x + 4 * k, gw = 22 * k, gh = 16 * k, gy = by - gh;
  g.fillStyle = '#2A1E2E'; g.fillRect(gx, gy, gw, gh);
  const shut = Math.round((1 - open) * gh / k) * k;
  if (shut > 0) { g.fillStyle = '#9AA1AD'; g.fillRect(gx, gy, gw, shut); for (let yy = gy + k; yy < gy + shut; yy += 2 * k) { g.fillStyle = '#7A8190'; g.fillRect(gx, yy, gw, k / 2 + 1); } }
  if (open < .2) { g.save(); g.translate(gx + gw / 2, gy + gh / 2); g.rotate(-.06); ptag(g, 0, 0, '下班', 36, { fill: '#FFD34E' }); g.restore(); }
  // 窗户（开工时亮）
  g.fillStyle = open > .5 ? '#FFE27A' : '#5A5470'; g.fillRect(x + 30 * k, y0 + 14 * k, 9 * k, 6 * k);
  g.restore();
}
/* 血管做成的路：(x0, y) 左端、宽 len、高 h；里面跑着糖块；jam 0..1 越大越堵 */
function bloodRoad(g, x0, y, len, h, t, jam, k = 6) {
  g.save();
  g.fillStyle = C.ink; g.fillRect(x0, y - h / 2 - k, len, h + 2 * k);
  g.fillStyle = '#C8323A'; g.fillRect(x0, y - h / 2, len, h);
  g.fillStyle = '#E04A4F'; g.fillRect(x0, y - h / 2, len, k);
  g.fillStyle = 'rgba(255,255,255,.35)'; for (let x = x0 + ((-t * 120 * (1 - jam)) % 60 + 60) % 60; x < x0 + len; x += 60) g.fillRect(x, y - k / 2, 30, k / 2 + 2);   // 车道线
  // 红细胞
  for (let i = 0; i < 6; i++) { const xx = x0 + ((i * 97 + t * 90 * (1 - jam * .9)) % len); pixOval(g, xx, y + (i % 2 ? -h / 4 : h / 4), 14, 8, 4, '#FF8A8A'); }
  g.restore();
}

/* ================= 图表、天平、一百万人 ================= */
/* 饭后血糖曲线：(x, y) 左上；u 0..1 画到哪儿；两条：一直坐着（红）、每 20 分钟走 2 分钟（绿） */
function glucoseChart(g, x, y, w, h, u, u2) {
  g.save();
  pbox(g, x - 30, y - 30, w + 60, h + 110, { k: 6, fill: '#FFFFFF', rim: '#E8DCC8', shadow: true });
  g.fillStyle = C.ink; g.fillRect(x, y + h, w, 4); g.fillRect(x, y, 4, h);
  ptext(g, '血糖', x + 14, y + 30, 32, '#7A86A8');
  ptext(g, '喝下一份"饭" → 之后 3 小时', x + w, y + h + 50, 28, '#7A86A8', { align: 'right' });
  const curve = (amp, col, uu) => {
    const n = Math.floor(48 * uu);
    for (let i = 0; i < n; i++) {
      const s = i / 48, v = amp * Math.exp(-Math.pow((s - .32) / .2, 2)) + .08;
      g.fillStyle = col; g.fillRect(Math.round(x + 8 + s * (w - 16)), Math.round(y + h - 8 - v * (h - 30)), 14, 14);
    }
  };
  curve(.86, '#FF5A4F', u);
  if (u2 > 0) curve(.62, '#3E9E4F', u2);
  g.restore();
}
/* 天平：(x, y) 支点顶；tilt -1..1（正数右边低）；左右盘上各画一样东西 */
function balanceScale(g, x, y, k, tilt, drawL, drawR) {
  const a = tilt * .22, L = 300;
  g.save();
  g.fillStyle = C.ink; g.fillRect(x - 3 * k, y, 6 * k, 70 * k / 3); g.fillRect(x - 18 * k, y + 70 * k / 3, 36 * k, 3 * k);
  g.fillStyle = '#C9A04A'; g.fillRect(x - 2 * k, y, 4 * k, 70 * k / 3 - k);
  g.translate(x, y); g.rotate(a);
  g.fillStyle = C.ink; g.fillRect(-L - k, -2 * k, 2 * L + 2 * k, 4 * k); g.fillStyle = '#E8B92E'; g.fillRect(-L, -k, 2 * L, 2 * k);
  g.restore();
  for (const s of [-1, 1]) {
    const px = x + s * L * Math.cos(a), py = y + s * L * Math.sin(a);
    g.fillStyle = C.ink; g.fillRect(Math.round(px - k / 2), Math.round(py), k, 60);
    g.fillStyle = C.ink; g.fillRect(Math.round(px - 110), Math.round(py + 60), 220, 3 * k);
    g.fillStyle = '#E8B92E'; g.fillRect(Math.round(px - 106), Math.round(py + 60 + k / 2), 212, k);
    (s < 0 ? drawL : drawR)(g, Math.round(px), Math.round(py + 60));
  }
}
/* 一格一个的小人（统计图用）：(x, y) 中心 */
function tinyPerson(g, x, y, k, col) {
  x = Math.round(x); y = Math.round(y);
  g.fillStyle = col; g.fillRect(x - 2 * k, y - 4 * k, 4 * k, 3 * k); g.fillRect(x - 3 * k, y - k, 6 * k, 4 * k); g.fillRect(x - 2 * k, y + 3 * k, k, k); g.fillRect(x + k, y + 3 * k, k, k);
}
/* 跑鞋图标：(x, y) 中心 */
function shoeIcon(g, x, y, k) {
  pix(g, ['......kkk...', '.....kwwwk..', '....kwrrwk..', 'kkkkkwrrrwkk', 'kwwwwrrrrrwk', 'kwrrrrrrrrrk', 'kkkkkkkkkkkk', '.kgg.gg.ggk.'], { k: C.ink, w: '#FFFFFF', r: '#3E9EE8', g: '#9AA1AD' }, x, y, k);
}
/* 小椅子图标：(x, y) 中心 */
function chairIcon(g, x, y, k, col = '#3E4A6B') {
  pix(g, ['.kkkkkkk.', '.kcccccck', '.kcccccck', '.kcccccck', '.kcccccck', 'kkkkkkkkk', 'kcccccccck', 'kkkkkkkkk', '....kk...', '..kkkkkk.', '.k..kk..k'], { k: C.ink, c: col }, x, y, k);
}
/* 一碗饭：(x, y) 中心 */
function bowlIcon(g, x, y, k) {
  pix(g, ['...wwww...', '.wwwwwwww.', 'bbbbbbbbbb', 'kbBbbbbBbk', '.kbbbbbbk.', '..kkBBkk..'], { w: '#FFFFFF', b: '#5E9AD6', B: '#3E6FA8', k: C.ink }, x, y, k);
}
