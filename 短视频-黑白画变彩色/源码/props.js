'use strict';
/* props.js：本片的画面——那张会"变色"的像素画（原图、负片、黑白三个版本，按像素算出来）、盯的那个点和进度圈、
   眼睛里管颜色的三个"工人"、色块和箭头。全部程序画的像素图。 */

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


/* ================= 那张画 ================= */
/* 原图（缓冲 108×192，P=10 铺满屏幕）：大块的纯色，残像才明显——蓝天、黄太阳、白云、绿草地、红屋顶的小房子、
   "你"举着红、黄、绿三个气球。天和草地的亮度故意拉开（变成黑白时还分得清）。盯的点在缓冲 (54, 90)，屏幕 (540, 900)。 */
const FIX = { x: 540, y: 900 };
function drawPicture(b) {
  prect(b, 0, 0, 108, 124, '#4FA6FF');                                   // 天
  pdisc(b, 84, 62, 11, '#FFD21F');                                        // 太阳（放在上方大字的下面）
  for (const [x, y] of [[22, 30], [44, 58]]) { pell(b, x, y, 12, 4, '#FFFFFF'); pdisc(b, x - 4, y - 3, 4, '#FFFFFF'); pdisc(b, x + 4, y - 4, 5, '#FFFFFF'); }
  for (let x = 0; x < 108; x++) { const h = 9 + Math.round(Math.sin(x * .06 + .5) * 5); prect(b, x, 124 - h, 1, h, '#4CC24F'); }   // 远处的山坡
  prect(b, 0, 124, 108, 68, '#1A9935');                                   // 草地
  // 房子：白墙、红屋顶、棕门、两扇窗
  prect(b, 68, 98, 30, 26, '#F2F2F2');
  for (let j = 0; j < 15; j++) prect(b, 64 + j, 98 - j, 38 - 2 * j, 1, '#F0302C');
  prect(b, 79, 110, 8, 14, '#8A4B22');
  prect(b, 71, 104, 6, 6, '#7FD3FF'); prect(b, 89, 104, 6, 6, '#7FD3FF');
  // "你"站在草地上，举着三个气球
  const cx = 26, cy = 142;
  for (const [bx, by, col] of [[18, 104, '#F0302C'], [30, 98, '#FFD21F'], [42, 106, '#21C24A']]) {
    pline(b, bx, by + 7, cx + 10, cy - 1, '#FFFFFF');
    pdisc(b, bx, by, 7, col); pdisc(b, bx - 2, by - 3, 2, shadeOf(col, 1.4)); prect(b, bx - 1, by + 7, 3, 1, shadeOf(col, .8));
  }
  drawClawd(b, cx - 12, cy, { scarf: true, eyes: 'happy', mouth: 'smile', arms: 'upR' });
  // 草地上几朵小花
  for (const [x, y, col] of [[56, 150, '#FFFFFF'], [62, 168, '#FFD21F'], [90, 160, '#FFFFFF'], [100, 176, '#FFD21F'], [8, 176, '#FFFFFF']]) { pdot(b, x, y, col); pdot(b, x - 1, y + 1, col); pdot(b, x + 1, y + 1, col); pdot(b, x, y + 2, col); }
}
/* 三个版本：原图、负片（盯着看的那张，红绿蓝都反过来）、黑白（每个像素按亮度换成灰） */
const PIC = {};
function pictures() {
  if (PIC.orig) return PIC;
  const make = () => { const c = mk(108, 192), g = c.getContext('2d'); g.imageSmoothingEnabled = false; return [c, g]; };
  const [co, go] = make(); drawPicture(go);
  const d = go.getImageData(0, 0, 108, 192).data;
  const [cn, gn] = make(), [cg, gg] = make();
  const dn = gn.createImageData(108, 192), dg = gg.createImageData(108, 192);
  for (let i = 0; i < d.length; i += 4) {
    const r = d[i], gr = d[i + 1], bl = d[i + 2], y = Math.round(.299 * r + .587 * gr + .114 * bl);
    dn.data[i] = 255 - r; dn.data[i + 1] = 255 - gr; dn.data[i + 2] = 255 - bl; dn.data[i + 3] = 255;
    dg.data[i] = dg.data[i + 1] = dg.data[i + 2] = y; dg.data[i + 3] = 255;
  }
  gn.putImageData(dn, 0, 0); gg.putImageData(dg, 0, 0);
  Object.assign(PIC, { orig: co, neg: cn, gray: cg });
  return PIC;
}
/* 把某个版本画到 (x, y)，每个缓冲像素 P 个屏幕像素 */
function drawPic(g, which, x = 0, y = 0, P = 10) { g.save(); g.imageSmoothingEnabled = false; g.drawImage(pictures()[which], Math.round(x), Math.round(y), 108 * P, 192 * P); g.restore(); }
/* 盯的那个点：白圈黑心；u 0..1 是外面的进度圈走了多少（null 不画） */
function fixMark(g, u = null) {
  const { x, y } = FIX;
  if (u !== null) {
    const n = 48;
    for (let i = 0; i < n; i++) {
      const a = -Math.PI / 2 + i / n * TAU, on = i / n < u;
      g.fillStyle = on ? 'rgba(255,255,255,.85)' : 'rgba(0,0,0,.25)';
      g.fillRect(Math.round(x + Math.cos(a) * 52 - 4), Math.round(y + Math.sin(a) * 52 - 4), 8, 8);
    }
  }
  pixOval(g, x, y, 18, 18, 6, C.ink); pixOval(g, x, y, 12, 12, 6, '#FFFFFF'); g.fillStyle = C.ink; g.fillRect(x - 6, y - 6, 12, 12);
}

/* ================= 眼睛里管颜色的工人 ================= */
/* 三种视锥细胞画成三个小怪：管红、管绿、管蓝。(x, by) 脚底中心；v 0..1 现在出多大力（头上的柱子）；tired 累不累 */
const CONES = [{ name: '管红', col: '#E8504A' }, { name: '管绿', col: '#45C25A' }, { name: '管蓝', col: '#4A8EF0' }];
function coneWorker(g, i, x, by, k, t, v, tired, o = {}) {
  const c = CONES[i], work = v > .15 && !tired && Math.floor(t * 6 + i) % 2;
  shadowAt(g, x, by, k);
  crabAt(g, x, by, k, { col: c.col, hat: 'hard', eyes: tired ? 'tired' : o.eyes || (v > .5 ? 'happy' : 'n'), arms: work ? 'up' : 'n', sweat: tired && v > .05, mouth: o.mouth });
  ptag(g, x, by + 50, c.name, 32, { fill: c.col, col: '#FFFFFF' });
  // 头上的柱子：出多大力
  const bw = 56, bh = 220, bx = x - bw / 2, top = by - 16 * k - 60 - bh;
  g.fillStyle = C.ink; g.fillRect(bx - 6, top - 6, bw + 12, bh + 12);
  g.fillStyle = '#2B2547'; g.fillRect(bx, top, bw, bh);
  const h = Math.round(bh * clamp(v) / 6) * 6;
  g.fillStyle = c.col; g.fillRect(bx, top + bh - h, bw, h);
  g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(bx, top + bh - h, 10, h);
}
/* 色块：(x, y) 中心，边长 s；label 写在下面 */
function swatch(g, x, y, s, col, label, o = {}) {
  g.fillStyle = C.ink; g.fillRect(Math.round(x - s / 2 - 6), Math.round(y - s / 2 - 6), s + 12, s + 12);
  g.fillStyle = col; g.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, s);
  g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(Math.round(x - s / 2), Math.round(y - s / 2), s, 6);
  if (label) ptext(g, label, x, y + s / 2 + 50, o.px || 36, o.col || C.white, { align: 'center' });
}
/* 一只大眼睛（像素）：(x, y) 中心；shut 0..1 闭上多少 */
function bigEye(g, x, y, k, shut = 0) {
  const rows = ['....######....', '..##wwwwww##..', '.#wwwwiiwwwww#.', '#wwwwiippiwwww#', '#wwwwiippiwwww#', '.#wwwwiiwwwww#.', '..##wwwwww##..', '....######....'];
  const pal = { '#': C.ink, w: '#FFFFFF', i: '#4A8EF0', p: C.ink };
  const h = rows.length, cut = Math.round(h / 2 * clamp(shut));
  rows.forEach((r, j) => { for (let i2 = 0; i2 < r.length; i2++) { let c = pal[r[i2]]; if (!c) continue; if (j < cut || j >= h - cut) c = j === cut - 1 || j === h - cut ? C.ink : '#F2C9A0'; g.fillStyle = c; g.fillRect(Math.round(x + (i2 - r.length / 2) * k), Math.round(y + (j - h / 2) * k), k, k); } });
}
