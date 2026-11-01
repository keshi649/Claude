'use strict';
/* props.js：本片的场景和道具——糖果店、剖开的脑袋（鼻子的前门和后门、舌头、嗅觉区）、大舌头、五种味道的徽章、
   草莓 / 咖啡 / 巧克力、颜料盒和 400 色的调色板、杯子和香气、香料罐、门、大鼻子，
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
/* "你"：红领巾、有个小鼻子、会眨眼 */
const youO = (t, o = {}) => Object.assign({ scarf: true, snout: true, eyes: blinkEyes(t, 1) }, o);
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

/* ================= 像素小图：字符画按 k 倍画到屏幕上，(x, y) 是中心 ================= */
function pix(g, rows, pal, x, y, k, o = {}) {
  const h = rows.length, w = Math.max(...rows.map(r => r.length));
  const x0 = Math.round(x - w * k / 2), y0 = Math.round(y - h * k / 2);
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) { g.fillStyle = c; g.fillRect(x0 + (o.flip ? w - 1 - i : i) * k, y0 + j * k, k, k); } } });
}
const ICON = {
  candy: [['ee...pppp...ee', 'eee.pPPppp.eee', '.eeepPpppppee.', '.eeepppppppee.', 'eee.pppppp.eee', 'ee...pppp...ee'],
    { p: '#FF5C7A', P: '#FFFFFF', e: '#FFA3B5' }],
  straw: [['..gGg..', '.gGgGg.', 'rrrrrrr', 'ryrrryr', 'rrryrrr', '.ryrry.', '..rrr..', '...r...'],
    { g: '#3E9E4F', G: '#6BCB7A', r: '#E5322D', y: '#FFE27A' }],
  coffee: [['.s..s....', '..s..s...', 'wwwwwww..', 'wbbbbbwww', 'wbbbbbw.w', 'wbbbbbwww', 'wbbbbbw..', '.wwwww...'],
    { w: '#F4F4F4', b: '#6B3F1E', s: '#C9D3DE' }],
  choco: [['ssddddd', 'sdccdcc', 'ddccdcc', 'ddddddd', 'ddccdcc', 'ddccdcc', 'ddddddd'],
    { d: '#5A3420', c: '#8A5634', s: '#D3D9E3' }],
  brain: [['..pppppp..', '.pPpPPpPp.', 'pPppPppPpp', 'ppPppPPppp', 'pPpPppPpPp', '.ppPppppp.', '...pppp...'],
    { p: '#F2A0B8', P: '#D9748F' }],
  salt: [['.ggg.', 'gwwwg', 'gwwwg', 'wwwww', 'wwwww', 'wwwww', 'wwwww'], { g: '#9AA1AD', w: '#F4F4F4' }],
};
function icon(g, name, x, y, k, o = {}) { const [rows, pal] = ICON[name]; pix(g, rows, pal, x, y, k, o); }

/* 大鼻子（正面）：(x, y) 鼻头中心 */
function drawNose(g, x, y, k, o = {}) {
  const skin = o.skin || '#F2C9A0', ol = '#7A4A3A', sh = '#E0A882';
  g.fillStyle = ol; g.fillRect(Math.round(x - 3 * k), Math.round(y - 10 * k), 6 * k, 10 * k);
  pixOval(g, x, y + k, 7 * k, 4.6 * k, k, ol);
  g.fillStyle = skin; g.fillRect(Math.round(x - 2 * k), Math.round(y - 10 * k), 4 * k, 10 * k);
  pixOval(g, x, y + k, 6 * k, 3.6 * k, k, skin);
  g.fillStyle = sh; g.fillRect(Math.round(x + k), Math.round(y - 9 * k), k, 9 * k);
  g.fillStyle = '#FFE3C8'; g.fillRect(Math.round(x - k), Math.round(y - 9 * k), k, 4 * k);
  g.fillStyle = '#5A2E2A'; g.fillRect(Math.round(x - 4 * k), Math.round(y + 2 * k), 2 * k, k); g.fillRect(Math.round(x + 2 * k), Math.round(y + 2 * k), 2 * k, k);
  if (o.sniff) for (let i = 0; i < 3; i++) {               // 吸气：鼻孔前面几道往里收的线
    const u = (o.sniff + i / 3) % 1, d = (1 - u) * 6 * k;
    g.fillStyle = `rgba(255,255,255,${.8 * Math.sin(u * Math.PI)})`;
    g.fillRect(Math.round(x - 5 * k - d), Math.round(y + 3 * k + d * .6), 2 * k, k); g.fillRect(Math.round(x + 3 * k + d), Math.round(y + 3 * k + d * .6), 2 * k, k);
  }
}
/* 大舌头（有一张小脸）：(x, y) 舌面中心。上面平、下面圆的 U 形，中间一道沟，像伸出来的舌头 */
function drawTongue(g, x, y, k, o = {}) {
  const c = o.col || '#FF8FA3', ol = '#B84A63', w = 12 * k, top = y - 9 * k, mid = y, tip = 11 * k;
  if (o.lips !== false) {                                     // 嘴：舌头从嘴里伸出来
    pixOval(g, x, top - k, w + 5 * k, 4 * k, k, '#B83A3A');
    pixOval(g, x, top - k, w + 3 * k, 2.6 * k, k, '#4A1424');
    g.fillStyle = '#FFFFFF'; for (const s of [-1, 1]) g.fillRect(Math.round(x + s * 6 * k - k), Math.round(top - 3 * k), 2 * k, k);
  }
  g.fillStyle = ol; g.fillRect(Math.round(x - w - k), Math.round(top - k), Math.round(2 * w + 2 * k), Math.round(mid - top + k));
  pixOval(g, x, mid, w + k, tip + k, k, ol);
  g.fillStyle = c; g.fillRect(Math.round(x - w), Math.round(top), Math.round(2 * w), Math.round(mid - top));
  pixOval(g, x, mid, w, tip, k, c);
  g.fillStyle = shadeOf(c, 1.12); g.fillRect(Math.round(x - w + 2 * k), Math.round(top + k), Math.round(w - 3 * k), Math.round(5 * k));
  g.fillStyle = shadeOf(c, .82); g.fillRect(Math.round(x - k / 2), Math.round(top + k), k, Math.round(13 * k));   // 中间的沟
  const r = R(31);
  for (let i = 0; i < 24; i++) { const px = x + (r() - .5) * 1.7 * w, py = top + k + r() * 16 * k; if (Math.abs(px - x) > 2 * k && ((py - mid) / tip) ** 2 + ((px - x) / w) ** 2 < .8) { g.fillStyle = shadeOf(c, 1.22); g.fillRect(Math.round(px), Math.round(py), k, k); } }
  if (o.face !== false) {                                     // 小脸
    const ey = y - 2 * k, look = o.look || 0;
    for (const s of [-1, 1]) { g.fillStyle = '#FFFFFF'; g.fillRect(Math.round(x + s * 6 * k - k), Math.round(ey - k), 3 * k, 3 * k); g.fillStyle = C.ink; g.fillRect(Math.round(x + s * 6 * k + look * k), Math.round(ey), k, 2 * k); }
    g.fillStyle = C.ink;
    if (o.mood === 'confused') { g.fillRect(Math.round(x - 2 * k), Math.round(y + 4 * k), k, k); g.fillRect(Math.round(x - k), Math.round(y + 5 * k), 2 * k, k); g.fillRect(Math.round(x + k), Math.round(y + 4 * k), k, k); }
    else if (o.mood === 'proud') { g.fillRect(Math.round(x - 3 * k), Math.round(y + 4 * k), k, k); g.fillRect(Math.round(x - 2 * k), Math.round(y + 5 * k), 4 * k, k); g.fillRect(Math.round(x + 2 * k), Math.round(y + 4 * k), k, k); }
    else g.fillRect(Math.round(x - k), Math.round(y + 4 * k), 2 * k, k);
  }
}
/* 五种基本味的徽章 */
const TASTES = [['酸', '#E8C02E'], ['甜', '#FF6F8E'], ['苦', '#4E8A3A'], ['咸', '#5E9AD6'], ['鲜', '#E0882E']];
function tasteBadge(g, x, y, r, ch, col, o = {}) {
  pixOval(g, x, y, r + 6, r + 6, 6, C.ink);
  pixOval(g, x, y, r, r, 6, o.dim ? '#8A8496' : col);
  pixOval(g, x - r * .25, y - r * .3, r * .45, r * .3, 6, 'rgba(255,255,255,.25)');
  rich(g, ch, x, y + r * .06, Math.round(r * 1.25), { col: C.white, stroke: Math.max(6, r * .22), shadow: false });   // 笔画多的字（酸、鲜）用平滑字体才看得清
}
/* 一扇像素门：(x, y) 中心；open 0..1 开了多少 */
function drawDoor(g, x, y, k, open = 0, o = {}) {
  const rows = ['oooooooo', 'obbbbbbo', 'obddddbo', 'obddddbo', 'obddddbo', 'obbbbbbo', 'obddddbo', 'obddddyo', 'obddddbo', 'obddddbo', 'obbbbbbo', 'oooooooo'];
  const pal = { o: '#3A2418', b: o.frame || '#A86E44', d: o.panel || '#C98B5A', y: C.gold };
  if (open > 0) {                                             // 门里透出光
    g.fillStyle = '#3A2418'; g.fillRect(Math.round(x - 4 * k), Math.round(y - 6 * k), 8 * k, 12 * k);
    g.fillStyle = o.glow || '#FFE9A8'; g.fillRect(Math.round(x - 3 * k), Math.round(y - 5 * k), 6 * k, 10 * k);
    const w = Math.max(1, Math.round(8 * (1 - open)));
    pix(g, rows.map(r => r.slice(0, w)), pal, x - 4 * k + w * k / 2, y, k);
  } else pix(g, rows, pal, x, y, k);
}
/* 颜料盒：五格颜色 */
function paintBox(g, x, y, cell, n = 5, shown = n) {
  pbox(g, x - 18, y - 18, n * (cell + 12) + 24, cell + 36, { k: 6, fill: '#F4E9D8', rim: '#C98B5A', edge: C.ink, shadow: true });
  TASTES.slice(0, n).forEach(([, col], i) => { g.fillStyle = C.ink; g.fillRect(x + i * (cell + 12) - 4, y - 4, cell + 8, cell + 8); g.fillStyle = i < shown ? col : '#E6DAC4'; g.fillRect(x + i * (cell + 12), y, cell, cell); });
}
/* 400 色的调色板：20×20 格，shown 个格子已经亮起来 */
function palette400(g, x, y, cell, shown) {
  g.fillStyle = C.ink; g.fillRect(x - 10, y - 10, 20 * cell + 20, 20 * cell + 20);
  const order = PAL_ORDER;
  for (let n = 0; n < Math.min(400, shown); n++) {
    const i = order[n], c = i % 20, r = Math.floor(i / 20);
    g.fillStyle = `hsl(${(c * 18 + r * 7) % 360}, ${55 + (r % 4) * 10}%, ${38 + (c + r) % 5 * 9}%)`;
    g.fillRect(x + c * cell, y + r * cell, cell - 2, cell - 2);
  }
}
const PAL_ORDER = (() => { const r = R(400), a = [...Array(400).keys()]; for (let i = 399; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; })();
/* 玻璃杯：(x, by) 杯底中心 */
function drawGlass(g, x, by, w, h, col, o = {}) {
  x = Math.round(x); by = Math.round(by);
  g.fillStyle = C.ink; g.fillRect(x - w / 2 - 6, by - h, 6, h); g.fillRect(x + w / 2, by - h, 6, h); g.fillRect(x - w / 2 - 6, by, w + 12, 6);
  g.fillStyle = 'rgba(220,240,255,.55)'; g.fillRect(x - w / 2, by - h, w, h);
  g.fillStyle = col; g.fillRect(x - w / 2, by - h * .75, w, h * .75);
  g.fillStyle = 'rgba(255,255,255,.55)'; g.fillRect(x - w / 2 + 8, by - h + 8, 8, h - 20);
  if (o.label) ptext(g, o.label, x, by + 50, 32, o.labelCol || C.ink, { align: 'center' });
}
/* 一缕香气：三条往上飘的波浪线；col 颜色，t 时间 */
function aroma(g, x, y, t, col, k = 8, o = {}) {
  for (let i = 0; i < 3; i++) for (let j = 0; j < 9; j++) {
    const ph = (t * 1.2 + i * .33) % 1, yy = y - j * k * 1.5 - ph * k * 6, xx = x + (i - 1) * k * 4 + Math.round(Math.sin(j * .8 + t * 4 + i) * k * 1.2);
    g.fillStyle = col; g.globalAlpha = (o.alpha ?? 1) * clamp(1 - j / 9) * .9; g.fillRect(Math.round(xx), Math.round(yy), k, k);
  }
  g.globalAlpha = 1;
}
/* 香料罐：(x, by) 罐底中心 */
function drawJar(g, x, by, k, label, col, o = {}) {
  x = Math.round(x); by = Math.round(by);
  g.fillStyle = C.ink; g.fillRect(x - 6 * k, by - 12 * k, 12 * k, 12 * k);
  g.fillStyle = 'rgba(230,245,255,.9)'; g.fillRect(x - 5 * k, by - 11 * k, 10 * k, 10 * k);
  g.fillStyle = col; g.fillRect(x - 5 * k, by - 7 * k, 10 * k, 6 * k);
  g.fillStyle = '#C0563E'; g.fillRect(x - 6 * k, by - 15 * k, 12 * k, 3 * k);
  g.fillStyle = '#FFF4DF'; g.fillRect(x - 4 * k, by - 9 * k, 8 * k, 4 * k);
  ptext(g, label, x, by - 6 * k, Math.max(24, Math.round(3.4 * k / 6) * 6), C.ink, { align: 'center' });
}

/* ================= 糖果店（缓冲 108×192，P=10） ================= */
function candyShop(b, t) {
  pbands(b, 0, 108, [[0, '#FFE0EA'], [70, '#FFD2E0'], [104, '#FFC4D6'], [108, '#FFC4D6']], 2);
  for (let x = 0; x < 108; x += 12) prect(b, x, 0, 6, 104, 'rgba(255,255,255,.25)');    // 竖条纹墙纸
  // 两层货架，摆满糖罐
  for (const sy of [62, 84]) {
    prect(b, 2, sy, 104, 2, '#C98B5A'); prect(b, 2, sy + 2, 104, 1, '#8C5A34');
    for (let i = 0; i < 8; i++) {
      const jx = 5 + i * 13, cols = [['#FF5C7A', '#FFD34E', '#7FD3F0'], ['#6BCB7A', '#FF8A3D', '#C08BD8'], ['#FF6F8E', '#FFFFFF', '#5EC8FF']][(i + sy) % 3];
      prect(b, jx, sy - 13, 9, 13, '#9FC3D6'); prect(b, jx + 1, sy - 12, 7, 12, '#EAF6FF');
      for (let d = 0; d < 9; d++) pdot(b, jx + 1 + (d * 3) % 7, sy - 2 - Math.floor(d / 3) * 2, cols[d % 3]);
      prect(b, jx - 1, sy - 15, 11, 2, ['#E5574F', '#3E9E4F', '#5E9AD6'][(i + sy) % 3]);
    }
  }
  // 柜台和地砖
  prect(b, 0, 104, 108, 4, '#F28CB0'); prect(b, 0, 104, 108, 1, '#FFC2D6'); prect(b, 0, 108, 108, 14, '#E06F96');
  for (let y = 122; y < 192; y += 6) for (let x = 0; x < 108; x += 6) prect(b, x, y, 6, 6, ((x + y) / 6) % 2 ? '#FFF1F5' : '#FFDDE8');
}

/* ================= 剖开的脑袋（缓冲 108×192，P=10）：脸朝左 =================
   鼻孔（前门）在左边，鼻腔往里走到后头，再往下拐进嗓子眼；嘴在下面，嘴的深处也通到嗓子眼——
   这个从嘴里往上通进鼻腔的口子，就是"后门"。鼻腔顶上一小片黄色的是嗅觉区。 */
const HEAD = {                                            // 屏幕坐标（世界坐标 × 10）
  nostril: [170, 745], patch: [400, 625], back: [665, 700], mouth: [430, 905], tongue: [430, 925], brain: [600, 440], throat: [665, 1000],
  FRONT: [[20, 800], [120, 770], [175, 745], [215, 700], [300, 675], [400, 640]],
  BACK: [[430, 905], [560, 902], [640, 890], [668, 830], [668, 730], [630, 680], [520, 668], [410, 645]],
};
function headParts(b, grow, col) {
  const G = grow;
  pell(b, 58, 60, 33 + G, 31 + G, col);                                     // 后脑勺
  prect(b, 23 - G, 46 - G, 40 + 2 * G, 52 + 2 * G, col);                    // 脸
  pell(b, 46, 98, 25 + G, 13 + G, col);                                      // 下巴
  prect(b, 52 - G, 100, 28 + 2 * G, 92, col);                                // 脖子
  for (let j = 0; j <= 26; j++) {                                            // 鼻子：往左凸出来
    const y = 50 + j, left = j <= 20 ? 23 - Math.round(j * .48) : 13 + Math.round((j - 20) * 1.6);
    prect(b, left - G, y, 24 - left + G, 1, col);
  }
  prect(b, 13 - G, 70 - G, 4, 6 + 2 * G, col);
}
function drawHead(b, o = {}) {
  const dark = o.dark, skin = dark ? '#2A2347' : '#F2C9A0', ol = dark ? '#6B5FB0' : '#7A4A3A';
  headParts(b, 1, ol); headParts(b, 0, skin);
  if (dark) return;
  const lin = '#C4546B', inn = '#7A2238';
  // 鼻腔：鼻孔 → 往里 → 后头拐下去（嗓子眼）
  for (let i = 0; i < 8; i++) prect(b, 16 + i, 73 - i, 3, 3, inn);
  prect(b, 22, 64, 45, 7, lin); prect(b, 23, 65, 44, 5, inn);
  prect(b, 63, 64, 8, 80, lin); prect(b, 64, 65, 6, 79, inn);
  for (const x of [30, 40, 50]) prect(b, x, 69, 6, 1, lin);                 // 鼻甲
  // 嘴：嘴唇、牙、口腔，深处通到嗓子眼
  pell(b, 43, 90, 21, 6, lin); pell(b, 43, 90, 20, 5, inn); prect(b, 56, 86, 9, 9, inn);
  prect(b, 20, 84, 4, 2, '#E06F7A'); prect(b, 20, 94, 4, 2, '#E06F7A'); prect(b, 23, 86, 3, 2, '#FFFFFF'); prect(b, 23, 92, 3, 2, '#FFFFFF');
  pell(b, 42, 93, 17, 3, '#FF8FA3'); prect(b, 28, 92, 26, 1, '#FFB0C0');     // 舌头
  prect(b, 61, 79, 2, 6, '#E06F7A');                                         // 小舌头
  // 嗅觉区（黄）和连到大脑的线
  prect(b, 32, 62, 16, 2, o.patchOn ? '#FFF27A' : '#F2D14B'); for (let x = 33; x < 48; x += 3) pdot(b, x, 64, '#F2D14B');
  prect(b, 39, 55, 2, 7, '#F2D14B');
  // 大脑、眼睛、耳朵
  pell(b, 60, 44, 22, 11, '#F2A0B8'); for (let i = 0; i < 6; i++) pline(b, 44 + i * 6, 38 + (i % 2) * 3, 48 + i * 6, 47 - (i % 2) * 3, '#D9748F');
  prect(b, 33, 51, 3, 3, C.ink); pdot(b, 33, 51, '#FFFFFF');
  pell(b, 82, 64, 4, 7, '#E0A882');
}
/* 沿折线走：u 0..1 → 屏幕坐标 */
function along(path, u) {
  const L = []; let tot = 0;
  for (let i = 1; i < path.length; i++) { const d = Math.hypot(path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]); L.push(d); tot += d; }
  let s = clamp(u) * tot;
  for (let i = 0; i < L.length; i++) { if (s <= L[i]) { const v = s / L[i]; return [lerp(path[i][0], path[i + 1][0], v), lerp(path[i][1], path[i + 1][1], v)]; } s -= L[i]; }
  return path[path.length - 1];
}
/* 一串香气小方块沿路走：从 t0 开始，dur 秒走一趟，n 个 */
function aromaFlow(g, t, t0, path, col, o = {}) {
  if (t < t0) return;
  const n = o.n || 10, dur = o.dur || 1.6, k = o.k || 12;
  for (let i = 0; i < n; i++) {
    const u = ((t - t0) / dur - i / n);
    if (u < 0 || (!o.loop && u > 1)) continue;
    const [x, y] = along(path, o.loop ? u % 1 : u), wob = Math.sin((t + i) * 7) * 4;
    g.fillStyle = col; g.fillRect(Math.round(x - k / 2 + wob), Math.round(y - k / 2), k, k);
    g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(Math.round(x - k / 2 + wob), Math.round(y - k / 2), k / 2, k / 2);
  }
}
