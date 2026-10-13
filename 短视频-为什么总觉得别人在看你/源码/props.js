'use strict';
/* props.js：本片的场景和道具——食堂、剧场（红幕布、舞台、观众席）、聚光灯、讲台、大眼睛、放大镜、
   好感度血条、便利贴，以及直接在屏幕上按整数倍画小怪的工具。全部程序画的像素图。 */

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

/* 聚光灯的光柱：从灯口 (x0,y0) 打到地上 (x1,y1)，地上光斑半径 r1；按 k 像素一行画，像素风 */
function spotCone(g, x0, y0, x1, y1, r1, a = .3, o = {}) {
  if (a <= 0) return;
  const k = o.k || 12, r0 = o.r0 ?? 36, col = o.col || '255,238,170';
  g.save();
  for (let y = Math.round(y0 / k) * k; y < y1; y += k) {
    const u = (y - y0) / (y1 - y0), cx = lerp(x0, x1, u), hw = Math.round(lerp(r0, r1, u) / k) * k;
    g.fillStyle = `rgba(${col},${a * (.45 + .55 * u)})`;
    g.fillRect(Math.round(cx / k) * k - hw, y, hw * 2, k);
  }
  g.globalAlpha = Math.min(1, a * 2.2);
  pixOval(g, x1, y1, r1 * 1.05, r1 * .26, k, `rgba(${col},.55)`);
  pixOval(g, x1, y1, r1 * .7, r1 * .16, k, `rgba(255,255,235,.5)`);
  g.restore();
}
/* 聚光灯灯头：(x,y) 灯口中心，朝下；on 0..1 亮度 */
function spotLamp(g, x, y, k = 8, on = 1, ang = 0) {
  g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(ang);
  g.fillStyle = '#3B3363'; g.fillRect(-k, -12 * k, 2 * k, 5 * k);                      // 吊杆
  g.fillStyle = '#2B2547'; g.fillRect(-4 * k, -8 * k, 8 * k, 7 * k); g.fillRect(-5 * k, -2 * k, 10 * k, 2 * k);
  g.fillStyle = '#5A5180'; g.fillRect(-3 * k, -7 * k, 2 * k, 5 * k);                   // 高光
  g.fillStyle = '#8C84B0'; g.fillRect(-6 * k, -5 * k, k, 3 * k); g.fillRect(5 * k, -5 * k, k, 3 * k);   // 支架
  g.fillStyle = on > .05 ? `rgba(255,246,190,${.4 + .6 * on})` : '#6B6390'; g.fillRect(-4 * k, 0, 8 * k, k);
  g.restore();
}
/* 一只大眼睛（想象中盯着你的眼睛）：look -1..1 眼珠左右；sh 0..1 眯起来（消失） */
function bigEye(g, x, y, k, look = 0, sh = 0) {
  const rows = ['...#######...', '.##.......##.', '#...........#', '.##.......##.', '...#######...'];
  g.save(); g.translate(Math.round(x), Math.round(y)); g.scale(1, 1 - sh);
  g.fillStyle = '#FFFFFF';
  g.fillRect(-4 * k, -2 * k, 9 * k, 5 * k); g.fillRect(-6 * k, -k, 13 * k, 3 * k);
  g.fillStyle = C.ink; rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') g.fillRect((i - 6) * k, (j - 2) * k, k, k); });
  const px = Math.round(look * 2) * k;
  g.fillStyle = '#4A86E8'; g.fillRect(px - 2 * k, -k, 5 * k, 3 * k); g.fillRect(px - k, -2 * k, 3 * k, 5 * k);
  g.fillStyle = C.ink; g.fillRect(px - k, -k, 3 * k, 3 * k);
  g.fillStyle = '#FFFFFF'; g.fillRect(px - k, -k, k, k);
  g.restore();
}
/* 放大镜：(x,y) 镜片中心，r 半径；inside(g) 画镜片里放大的内容 */
function magnifier(g, x, y, r, inside, o = {}) {
  g.save();
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.arc(x + 10, y + 12, r, 0, TAU); g.fill();
  clipOval(g, x, y, r - 6, r - 6, () => { g.fillStyle = o.bg || '#EAF6FF'; g.fillRect(x - r, y - r, 2 * r, 2 * r); inside(g); g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x - r, y - r, r * .5, 2 * r); });
  pixRing(g, x, y, r + 6, r + 6, 2, 6, '#3B3363', '#5A5180');
  // 手柄
  const a = o.ang ?? .8, hx = x + Math.cos(a) * (r + 6), hy = y + Math.sin(a) * (r + 6);
  g.translate(hx, hy); g.rotate(a); g.fillStyle = '#6B4A2E'; g.fillRect(0, -12, r * .9, 24); g.fillStyle = '#8C6040'; g.fillRect(0, -12, r * .9, 6);
  g.restore();
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

/* ================= 奶茶、碗 ================= */
/* 奶茶杯：(x,y) 杯身左上；w×h 杯身大小；fill 0..1 还剩多少；sip 正在吸（吸管里有奶茶） */
function drawTea(g, x, y, w, h, fill, t, o = {}) {
  x = ri(x); y = ri(y);
  const ink = '#3A2A3A', tea = o.tea || '#D9A777', teaD = shadeOf(tea, .85), glass = 'rgba(235,245,255,.35)';
  // 吸管
  const sx = x + Math.round(w * .62);
  prect(g, sx - 1, y - Math.round(h * .38), 3, Math.round(h * .38) + 2, o.straw || '#F28CB0');
  prect(g, sx - 1, y - Math.round(h * .38), 1, Math.round(h * .38), shadeOf(o.straw || '#F28CB0', 1.2));
  if (o.sip) prect(g, sx, y - Math.round(h * .38) + 1, 1, Math.round(h * .38), tea);
  // 杯身：上宽下窄
  for (let j = 0; j < h; j++) {
    const ins = Math.round(j * .12 * w / h * 1.4), xa = x + ins, xb = x + w - ins;
    prect(g, xa, y + j, 1, 1, ink); prect(g, xb - 1, y + j, 1, 1, ink);
    const lvl = h - Math.round((h - 3) * clamp(fill));
    if (j >= lvl) { prect(g, xa + 1, y + j, xb - xa - 2, 1, j === lvl ? shadeOf(tea, 1.12) : tea); prect(g, xb - 3, y + j, 1, 1, teaD); }
    else { g.fillStyle = glass; g.fillRect(xa + 1, y + j, xb - xa - 2, 1); }
  }
  // 珍珠
  const pr = R(5);
  for (let i = 0; i < Math.round(w * 1.2); i++) { const px = x + 2 + Math.floor(pr() * (w - 4)), py = y + h - 2 - Math.floor(pr() * Math.min(5, h * .25)); pdot(g, px, py, '#3A2418'); }
  prect(g, x + Math.round(h * .12 * w / h * 1.4), y + h - 1, w - 2 * Math.round(h * .12 * w / h * 1.4), 1, ink);
  // 封口膜 + 小爱心
  prect(g, x - 1, y - 1, w + 2, 2, '#F2F2F2'); prect(g, x - 1, y - 2, w + 2, 1, ink);
  if (w >= 12) { const hx = x + Math.round(w * .3), hy = y + Math.round(h * .35); pdot(g, hx, hy, '#F28CB0'); pdot(g, hx + 2, hy, '#F28CB0'); prect(g, hx, hy + 1, 3, 1, '#F28CB0'); pdot(g, hx + 1, hy + 2, '#F28CB0'); }
  // 高光
  prect(g, x + 2, y + 2, 1, Math.round(h * .5), 'rgba(255,255,255,.7)');
}
/* 一碗面（缓冲坐标）：(x,y) 碗沿左端；冒热气 */
function drawBowl(g, x, y, t) {
  x = ri(x); y = ri(y);
  prect(g, x, y, 8, 1, '#F4F4F4'); prect(g, x + 1, y + 1, 6, 2, '#F4F4F4'); prect(g, x + 2, y + 3, 4, 1, '#D3D9E3');
  prect(g, x + 1, y, 6, 1, '#F2C230'); pdot(g, x + 2, y, '#E5574F');
  for (let i = 0; i < 2; i++) { const ph = (t * 1.5 + i * .5) % 1; g.save(); g.globalAlpha = .6 * Math.sin(ph * Math.PI); pdot(g, x + 2 + i * 3 + Math.round(Math.sin(t * 4 + i) * .6), y - 2 - Math.round(ph * 4), '#FFFFFF'); g.restore(); }
}

/* ================= 背景 ================= */
/* 食堂（缓冲 108×192，P=10）：暖色墙、窗、打饭窗口、地砖、两张桌子 */
function canteen(b, t, o = {}) {
  pbands(b, 0, 108, [[0, '#FFE6B8'], [60, '#FFDDA6'], [96, '#F7CF94'], [100, '#E8B97E']], 2);
  // 长窗
  prect(b, 4, 44, 100, 30, '#C98B5A'); pbands(b, 6, 96, [[46, '#9FDBFF'], [62, '#CFF0FF'], [72, '#CFF0FF']], 2);
  for (let i = 0; i < 4; i++) prect(b, 6 + i * 25, 46, 1, 26, '#C98B5A');
  drawCloudish(b, 22 + (t * 1.5) % 30, 52); drawCloudish(b, 74 - (t * 1.2) % 20, 58);
  // 打饭窗口
  prect(b, 0, 80, 108, 18, '#D99A62'); prect(b, 0, 80, 108, 2, '#F2C08A'); prect(b, 0, 97, 108, 1, '#A8703E');
  for (let i = 0; i < 6; i++) { const x = 6 + i * 17; prect(b, x, 83, 12, 5, '#F4F4F4'); prect(b, x + 2, 84, 8, 3, ['#E5574F', '#7DBB57', '#F2C230', '#C98B4A', '#E8A0A0', '#7FD3F0'][i]); }
  // 地砖
  for (let y = 100; y < 192; y += 6) for (let x = 0; x < 108; x += 6) prect(b, x, y, 6, 6, ((x + y) / 6) % 2 ? '#EAD3AE' : '#E0C49A');
  prect(b, 0, 100, 108, 1, '#C9A578');
}
function drawCloudish(b, x, y) { prect(b, x, y, 9, 2, '#FFFFFF'); prect(b, x + 2, y - 1, 5, 1, '#FFFFFF'); }
/* 食堂的桌子（缓冲坐标）：(x,y) 桌面左上 */
function canteenTable(b, x, y, w) {
  prect(b, x, y, w, 3, '#F2B880'); prect(b, x, y, w, 1, '#FFD7A8'); prect(b, x, y + 3, w, 6, '#C98B5A');
  prect(b, x + 2, y + 9, 2, 8, '#8C6440'); prect(b, x + w - 4, y + 9, 2, 8, '#8C6440');
}
/* 剧场：深色后墙、红幕布、顶上的帷幔、木地板（屏幕坐标） */
function theater(g, t, o = {}) {
  const fy = o.floor ?? 1180;
  g.fillStyle = o.wall || '#2A1830'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.03)'; for (let x = 0; x < W; x += 96) g.fillRect(x, 0, 48, fy);
  // 木地板
  g.fillStyle = '#8C5A34'; g.fillRect(0, fy, W, H - fy);
  g.fillStyle = '#A86E44'; for (let y = fy; y < H; y += 48) g.fillRect(0, y, W, 24);
  g.fillStyle = '#6B4226'; for (let i = 0; i < 12; i++) g.fillRect((i * 173 + (i % 2) * 60) % W, fy + (i % 4) * 48, 6, 24);
  g.fillStyle = '#5E3B22'; g.fillRect(0, fy, W, 12);
  // 两边的幕布（竖褶）
  const cw = o.cw ?? 150;
  for (const side of [0, 1]) for (let i = 0; i < cw; i += 30) {
    const x = side ? W - cw + i : i, sway = Math.round(Math.sin(t * 1.3 + i * .05) * 3);
    g.fillStyle = (i / 30) % 2 ? '#B3202A' : '#D8323A'; g.fillRect(x + sway, 0, 30, fy + 40);
    g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x + sway + 24, 0, 6, fy + 40);
  }
  // 顶上的帷幔 + 金穗
  g.fillStyle = '#C42A33'; g.fillRect(0, 0, W, 190);
  for (let x = 0; x < W; x += 120) { g.fillStyle = '#A11D27'; g.fillRect(x + 54, 0, 12, 190); pixOval(g, x + 60, 190, 60, 24, 12, '#C42A33'); }
  g.fillStyle = C.gold; for (let x = 0; x < W; x += 24) g.fillRect(x, 200 + (x / 24 % 2) * 6, 12, 12);
}
/* 观众席：几排深色座椅（屏幕坐标），y0 第一排椅背顶 */
function seats(g, y0, rows = 3, o = {}) {
  for (let r = 0; r < rows; r++) {
    const y = y0 + r * 220;
    for (let x = 40 + (r % 2) * 60; x < W; x += 180) { g.fillStyle = '#5A1E2A'; g.fillRect(x, y, 140, 90); g.fillStyle = '#7A2A38'; g.fillRect(x + 12, y + 12, 116, 60); g.fillStyle = '#3B1420'; g.fillRect(x, y + 90, 140, 24); }
  }
}
/* 讲台（屏幕坐标）：(x, by) 底边中心 */
function podium(g, x, by, k = 8, o = {}) {
  const w = 22 * k, h = 15 * k;
  g.fillStyle = C.ink; g.fillRect(x - w / 2 - k, by - h - k, w + 2 * k, h + k);
  g.fillStyle = o.col || '#A86E44'; g.fillRect(x - w / 2, by - h, w, h);
  g.fillStyle = '#C98B5A'; g.fillRect(x - w / 2, by - h, w, 2 * k);
  g.fillStyle = '#8C5A34'; g.fillRect(x - w / 2 + 2 * k, by - h + 4 * k, w - 4 * k, h - 6 * k);
  if (o.badge !== false) { g.fillStyle = C.gold; g.fillRect(x - 3 * k, by - h + 6 * k, 6 * k, 4 * k); g.fillStyle = '#E8B92E'; g.fillRect(x - 2 * k, by - h + 7 * k, 4 * k, 2 * k); }
  // 话筒
  g.fillStyle = '#3B3363'; g.fillRect(x + 4 * k, by - h - 6 * k, k, 6 * k); g.fillRect(x + 3 * k, by - h - 8 * k, 3 * k, 3 * k);
  g.fillStyle = '#9AA1AD'; g.fillRect(x + 3 * k, by - h - 8 * k, 3 * k, k);
}
/* 浅色方格纸背景 */
function bgPaper(g, c1 = '#FBF6EA', c2 = 'rgba(120,150,200,.12)') {
  g.fillStyle = c1; g.fillRect(0, 0, W, H);
  g.fillStyle = c2; for (let x = 0; x < W; x += 48) g.fillRect(x, 0, 2, H); for (let y = 0; y < H; y += 48) g.fillRect(0, y, W, 2);
}
/* 深色网格背景（会慢慢往下走） */
function bgGrid(g, t, c1 = '#1C2238', c2 = 'rgba(120,200,255,.08)') {
  g.fillStyle = c1; g.fillRect(0, 0, W, H);
  g.fillStyle = c2; for (let x = 0; x < W; x += 48) g.fillRect(x, 0, 2, H); for (let y = (t * 12) % 48; y < H; y += 48) g.fillRect(0, y, W, 2);
}
