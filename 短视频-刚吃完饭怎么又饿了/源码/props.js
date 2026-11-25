'use strict';
/* props.js：本片的场景和道具——中午的办公桌（外卖、奶茶、显示器、手机、饱腹度）、明亮的餐厅（失忆的人吃午饭）、
   心理学实验室的两张桌子、大脑里的账本和记账的小人、馋虫、下午的零食、晚上的家；食物小图标。全部程序画的像素图。
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

/* ================= 本片的场景 =================
   背景都画在 216×384 的缓冲上（一个缓冲像素 = 5 个屏幕像素）；小怪按 k=10 或 15 画，网格对得上。 */

/* ---------- 食物小图标（屏幕坐标，(x, y) 是中心，k 像素一格） ---------- */
const FOOD = {
  rice: [['..wwwwww..', '.wwwwwwww.', 'bbbbbbbbbb', '.bBbbbbBb.', '..bbbbbb..'], { w: '#FFFFFF', b: '#5EC8FF', B: '#2F7FC1' }],
  veg: [['..g..gg...', '.gGg.gGg..', 'gGGgggGgg.', '.gggGggg..', '..gg.gg...'], { g: '#5DB65A', G: '#3E8E41' }],
  leg: [['....ooo...', '...oOOoo..', '..oOOOoo..', '..ooOoo...', '.ww.oo....', 'ww........'], { o: '#D9883A', O: '#B5632A', w: '#FFF4DF' }],
  egg: [['..wwww..', '.wwwwww.', 'wwwyywww', 'wwyyyyww', '.wwyyww.', '..wwww..'], { w: '#FFFFFF', y: '#FFC93C' }],
  cookie: [['..cccc..', '.cCccCc.', 'ccccCccc', 'cCccccCc', '.ccCcccc', '..cccc..'], { c: '#E0A85A', C: '#7A4A2E' }],
  chips: [['.rrrrrr.', 'rryyyyrr', 'ryyYyyyr', 'ryYyyYyr', 'ryyyyyyr', 'rrrrrrrr'], { r: '#E5322D', y: '#FFD84A', Y: '#E8A930' }],
  grape: [['...g....', '.pp.pp..', 'pPppPpp.', '.ppPppp.', '..pppp..', '...pp...'], { g: '#5DB65A', p: '#A88BD8', P: '#7A5AAE' }],
  sand: [['wwwwwwwww.', 'wgggggggw.', 'wrrrrrrrw.', 'wyyyyyyyw.', 'wwwwwwwww.'], { w: '#F2DDB0', g: '#5DB65A', r: '#E5322D', y: '#FFD84A' }],
};
function food(g, name, x, y, k = 6, o = {}) { const [rows, pal] = FOOD[name]; withAlpha(g, o.a ?? 1, () => pix(g, rows, pal, x, y, k)); }

/* ---------- 办公室（午饭时间 / 下午）：吊灯、窗外的城和太阳、百叶窗、挂钟（屏幕上画）、隔板后探头的同事、绿植、便利贴 ---------- */
function officeBG(b, t, o = {}) {
  const pm = o.pm || 0, m = (a, c) => mixHex(a, c, pm);
  b.fillStyle = m('#C9D6E3', '#E8D2B8'); b.fillRect(0, 0, 216, 252);
  b.fillStyle = m('#BCCAD8', '#DCC4A8'); for (let x = 0; x < 216; x += 36) b.fillRect(x, 16, 1, 236);
  b.fillStyle = '#EEF2F6'; b.fillRect(0, 0, 216, 14);
  [[16, 60], [86, 128], [156, 198]].forEach(([a, c]) => { b.fillStyle = '#FFFFFF'; b.fillRect(a, 10, c - a, 4); b.fillStyle = 'rgba(255,255,240,.35)'; b.fillRect(a - 4, 14, c - a + 8, 3); });
  // 窗：x 146..210, y 48..150
  const wx = 146, wy = 48, ww = 64, wh = 102;
  for (let y = 0; y < wh; y++) { b.fillStyle = m(mixHex('#7FC1F0', '#CFE9FA', y / wh), mixHex('#F4B478', '#FBE0B8', y / wh)); b.fillRect(wx, wy + y, ww, 1); }
  pdisc(b, wx + 48, wy + 16 + pm * 30, 8, m('#FFF6C8', '#FFD08A'));
  for (let i = 0; i < 2; i++) { const cx = wx + ((t * 3 + i * 40) % (ww + 30)) - 15; b.fillStyle = 'rgba(255,255,255,.85)'; b.fillRect(Math.round(cx), wy + 22 + i * 18, 14, 3); b.fillRect(Math.round(cx) + 3, wy + 20 + i * 18, 8, 2); }
  for (let i = 0; i < 8; i++) { const bx = wx + i * 8, bh = 26 + Math.round(hash(i, 3) * 34); b.fillStyle = m(i % 2 ? '#9FB4CC' : '#B7C8DA', i % 2 ? '#C9A68A' : '#D8B898'); b.fillRect(bx, wy + wh - bh, 7, bh); b.fillStyle = m('#E6F0FA', '#FFE6C0'); for (let y = wy + wh - bh + 3; y < wy + wh - 2; y += 5) b.fillRect(bx + 2, y, 2, 2); }
  b.fillStyle = 'rgba(240,244,248,.8)'; for (let y = wy; y < wy + 40; y += 4) b.fillRect(wx, y, ww, 2);    // 拉上一半的百叶窗
  b.fillStyle = '#FFFFFF'; b.fillRect(wx - 3, wy - 3, ww + 6, 3); b.fillRect(wx - 3, wy + wh, ww + 6, 4); b.fillRect(wx - 3, wy, 3, wh); b.fillRect(wx + ww, wy, 3, wh);
  // 便利贴墙：x 18..70, y 112..156
  b.fillStyle = '#E8ECF2'; b.fillRect(16, 110, 56, 48);
  [[20, 114, '#FFE27A'], [36, 116, '#FF9DB5'], [52, 113, '#9FE3B8'], [24, 134, '#9FD3FF'], [42, 136, '#FFE27A'], [57, 133, '#FFB547']].forEach(([x, y, c], i) => {
    const sw = Math.round(Math.sin(t * 2 + i) * .6); b.fillStyle = c; b.fillRect(x, y + sw, 12, 12); b.fillStyle = 'rgba(0,0,0,.25)'; b.fillRect(x + 2, y + 4 + sw, 8, 1); b.fillRect(x + 2, y + 7 + sw, 6, 1);
  });
  // 绿植：x 4..26
  b.fillStyle = '#B5632A'; b.fillRect(8, 186, 14, 16); b.fillStyle = '#8A4A20'; b.fillRect(8, 186, 14, 2);
  for (let i = 0; i < 7; i++) { const a = -1.2 + i * .4 + Math.sin(t * 1.5 + i) * .08, L = 18 + (i % 3) * 5; for (let s = 0; s < L; s += 2) { b.fillStyle = i % 2 ? '#3E8E41' : '#5DB65A'; b.fillRect(Math.round(15 + Math.cos(a - Math.PI / 2) * s * .9), Math.round(186 + Math.sin(a - Math.PI / 2) * s), 3, 2); } }
  // 隔板：y 172..252
  b.fillStyle = m('#7E8CA0', '#A08878'); b.fillRect(0, 172, 216, 80); b.fillStyle = m('#8E9BAE', '#B09888'); for (let x = 0; x < 216; x += 4) for (let y = 176; y < 250; y += 4) if ((x + y) % 8 === 0) b.fillRect(x, y, 1, 1);
  b.fillStyle = m('#5E6A7C', '#806858'); b.fillRect(0, 170, 216, 3); b.fillRect(72, 170, 2, 82); b.fillRect(144, 170, 2, 82);
  // 地毯
  b.fillStyle = m('#6E7C8E', '#8A7A6E'); b.fillRect(0, 252, 216, 132); b.fillStyle = m('#7A889A', '#968678'); for (let y = 256; y < 384; y += 6) for (let x = ((y / 6) % 2) * 3; x < 216; x += 6) b.fillRect(x, y, 1, 1);
}
/* 挂钟（屏幕坐标）：min 从 0 点起的分钟数 */
function wallClock(g, x, y, r, min) {
  pixOval(g, x, y, r + 8, r + 8, 4, C.ink); pixOval(g, x, y, r, r, 4, '#FFFFFF');
  for (let i = 0; i < 12; i++) { const a = i * TAU / 12; g.fillStyle = C.ink; g.fillRect(Math.round(x + Math.cos(a) * r * .8) - 3, Math.round(y + Math.sin(a) * r * .8) - 3, 6, 6); }
  const hA = ((min / 60) % 12) / 12 * TAU - Math.PI / 2, mA = (min % 60) / 60 * TAU - Math.PI / 2;
  g.strokeStyle = C.ink; g.lineCap = 'square'; g.lineWidth = 8; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(hA) * r * .5, y + Math.sin(hA) * r * .5); g.stroke();
  g.strokeStyle = '#E5322D'; g.lineWidth = 6; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(mA) * r * .75, y + Math.sin(mA) * r * .75); g.stroke();
}
/* 隔板后面探头的同事（屏幕坐标），偶尔冒出来 */
function peekers(g, t) {
  [[140, 0], [820, 1.7]].forEach(([x, s], i) => {
    const ph = ((t + s) % 6) / 6, up = ph < .5 ? E.out(clamp(ph / .1)) * clamp((.5 - ph) / .1) : 0;
    if (up <= 0) return;
    g.save(); g.beginPath(); g.rect(x - 140, 600, 280, 260); g.clip();
    crabAt(g, x, 860 + 70 - Math.round(up * 70), 6, person(i + 1, { eyes: i ? 'l' : 'r' }), i === 1);
    g.restore();
  });
}
/* 办公桌（前景）：桌面、抽屉；显示器（左）、键盘；外卖盒（右）、奶茶 */
function officeDesk(g, t, o = {}) {
  // 显示器
  g.fillStyle = '#2B2547'; g.fillRect(110, 880, 240, 170); g.fillStyle = o.monitor || '#3E9E4F'; g.fillRect(122, 892, 216, 136);
  if (o.cards) { for (let i = 0; i < 5; i++) { g.fillStyle = '#FFFFFF'; g.fillRect(132 + i * 40, 906 + (i % 2) * 6, 30, 42); g.fillStyle = i % 2 ? '#E5322D' : C.ink; g.fillRect(138 + i * 40, 914 + (i % 2) * 6, 8, 8); } for (let i = 0; i < 3; i++) { g.fillStyle = '#FFFFFF'; g.fillRect(150 + i * 50, 966 + Math.round(Math.sin(t * 3 + i) * 4), 30, 42); } }
  g.fillStyle = '#5A6378'; g.fillRect(214, 1050, 32, 70); g.fillRect(180, 1110, 100, 12);
  // 桌面
  g.fillStyle = '#C8955E'; g.fillRect(40, 1150, 900, 44); g.fillStyle = '#DDAA72'; g.fillRect(40, 1150, 900, 8); g.fillStyle = '#A0703E'; g.fillRect(40, 1194, 900, 16);
  g.fillStyle = '#B07E4A'; g.fillRect(60, 1210, 200, 400); g.fillRect(720, 1210, 200, 400); g.fillStyle = '#8E6036'; g.fillRect(140, 1250, 40, 8); g.fillRect(800, 1250, 40, 8);
  // 键盘
  g.fillStyle = '#E8ECF2'; g.fillRect(120, 1130, 220, 22); g.fillStyle = '#B9C0CC'; for (let x = 126; x < 334; x += 14) g.fillRect(x, 1134, 10, 6);
  // 外卖盒：o.box 0 满 → 1 空
  const bx = 690, by = 1060, empty = o.box ?? 1;
  g.fillStyle = '#FFFFFF'; g.fillRect(bx, by, 170, 90); g.fillStyle = '#E5322D'; g.fillRect(bx, by + 30, 170, 14); ptext(g, '外卖', bx + 85, by + 76, 28, '#E5322D', { align: 'center' });
  g.fillStyle = '#F4F4F4'; g.fillRect(bx - 10, by - 60, 190, 14);
  if (empty < 1) { food(g, 'rice', bx + 50, by - 6, 5, { a: 1 - empty }); food(g, 'leg', bx + 125, by - 10, 5, { a: 1 - empty }); }
  g.fillStyle = '#C9A06A'; g.fillRect(bx + 20, by - 40, 150, 5); g.fillRect(bx + 26, by - 30, 150, 5);
  // 奶茶
  const mx = 875, my = 1010;
  g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(mx, my, 56, 140); g.fillStyle = '#C9A27A'; g.fillRect(mx + 4, my + 30, 48, 106); g.fillStyle = '#3A2414'; for (let i = 0; i < 6; i++) g.fillRect(mx + 8 + (i % 3) * 14, my + 112 + Math.floor(i / 3) * 10, 8, 8);
  g.fillStyle = '#FF9DB5'; g.fillRect(mx + 30, my - 50, 8, 70);
}
/* 拿在手里的手机（屏幕坐标，(x, y) 左上）：亮屏，屏幕里的东西一直往上滑 */
function phoneHeld(g, t, x, y, s = 1) {
  const w = 110 * s, h = 180 * s;
  g.fillStyle = C.ink; g.fillRect(x, y, w, h); g.fillStyle = '#8FD3FF'; g.fillRect(x + 8 * s, y + 14 * s, w - 16 * s, h - 28 * s);
  g.save(); g.beginPath(); g.rect(x + 8 * s, y + 14 * s, w - 16 * s, h - 28 * s); g.clip();
  const off = (t * 120 * s) % (60 * s);
  for (let i = -1; i < 5; i++) { const yy = y + 18 * s + i * 60 * s - off; g.fillStyle = ['#FF9DB5', '#FFE27A', '#9FE3B8', '#C9B8FF'][((i + Math.floor(t * 2)) % 4 + 4) % 4]; g.fillRect(x + 14 * s, yy, w - 28 * s, 34 * s); g.fillStyle = '#FFFFFF'; g.fillRect(x + 14 * s, yy + 38 * s, (w - 40 * s), 6 * s); }
  g.restore();
  glow(g, x + w / 2, y + h / 2, 220 * s, 'rgba(143,211,255,.35)');
}
/* 饱腹度（游戏血条）：v 0..1 */
function hungerBar(g, x, y, w, v) {
  ptext(g, '饱腹度', x, y - 12, 28, C.white, { ol: C.ink, olw: 4 });
  g.fillStyle = C.ink; g.fillRect(x - 6, y - 6, w + 12, 42); g.fillStyle = '#3A3550'; g.fillRect(x, y, w, 30);
  const col = v > .5 ? '#5BE37D' : v > .25 ? C.gold : '#FF5A4F';
  g.fillStyle = col; g.fillRect(x, y, Math.round(w * clamp(v) / 6) * 6, 30); g.fillStyle = 'rgba(255,255,255,.35)'; g.fillRect(x, y, Math.round(w * clamp(v) / 6) * 6, 6);
}

/* ---------- 馋虫：绿色的小虫，大嘴；size 0..1 大小，angry 张大嘴 ---------- */
function chanchong(g, t, x, y, k, o = {}) {
  const n = 6, wig = o.sleep ? 0 : t * 6;
  for (let i = n - 1; i >= 0; i--) {
    const cx = x - i * 3.2 * k, cy = y + Math.round(Math.sin(wig + i * .9) * k * 1.2);
    pixOval(g, cx, cy, 3 * k, 3 * k, k, i === 0 ? '#7FD06E' : (i % 2 ? '#5DB65A' : '#6FC060'));
    if (i > 0) { g.fillStyle = '#3E8E41'; g.fillRect(Math.round(cx - k), Math.round(cy + 2 * k), 2 * k, k); }
  }
  const hx = x, hy = y + Math.round(Math.sin(wig) * k * 1.2);
  if (o.sleep) { g.fillStyle = C.ink; g.fillRect(hx - 2 * k, hy - k, 2 * k, k); g.fillRect(hx + k, hy - k, 2 * k, k); }
  else { g.fillStyle = C.ink; g.fillRect(hx - 2 * k, hy - 2 * k, k, 2 * k); g.fillRect(hx + k, hy - 2 * k, k, 2 * k); g.fillStyle = '#FFFFFF'; g.fillRect(hx - 2 * k, hy - 2 * k, Math.max(1, k / 2), Math.max(1, k / 2)); g.fillRect(hx + k, hy - 2 * k, Math.max(1, k / 2), Math.max(1, k / 2)); }
  const mo = o.sleep ? 0 : (o.angry ? 2 : (Math.sin(t * 8) > 0 ? 1 : 0));
  g.fillStyle = '#5A1E2A'; g.fillRect(hx - k, hy + k, 3 * k, (1 + mo) * k); if (mo) { g.fillStyle = '#FF7A8A'; g.fillRect(hx, hy + (1 + mo) * k, k, k); }
  g.fillStyle = '#3E8E41'; g.fillRect(hx - 2 * k, hy - 4 * k, k, 2 * k); g.fillRect(hx + 2 * k, hy - 4 * k, k, 2 * k); g.fillStyle = '#FFD34E'; g.fillRect(hx - 2 * k, hy - 5 * k, k, k); g.fillRect(hx + 2 * k, hy - 5 * k, k, k);
  if (o.sleep) { const z = (t * .8) % 1; ptext(g, 'z', hx + 4 * k + z * 20, hy - 6 * k - z * 40, 32, `rgba(255,255,255,${1 - z})`, { ol: C.ink, olw: 4 }); }
}

/* ---------- 大脑里的账本：粉色的脑袋轮廓里一本打开的账本，记账的小人（绿色遮光帽檐）；
   o.rows 已经记下的几行（字符串数组），o.blank 午饭那一行是空的（光标一闪），o.distract 小人在看手机 ---------- */
function ledger(g, t, x, y, s, o = {}) {
  const w = 360 * s, h = 230 * s;
  g.fillStyle = C.ink; g.fillRect(x - w / 2 - 8 * s, y - h / 2 - 8 * s, w + 16 * s, h + 16 * s);
  g.fillStyle = '#FFF8E8'; g.fillRect(x - w / 2, y - h / 2, w, h); g.fillStyle = '#E8DCC0'; g.fillRect(x - 3 * s, y - h / 2, 6 * s, h);
  g.fillStyle = '#E5322D'; g.fillRect(x - w / 2, y - h / 2, w, 6 * s);
  const px = Math.round(28 * s);
  ptext(g, '账本', x - w / 4, y - h / 2 + 46 * s, px, '#8A5A35', { align: 'center' });
  (o.rows || []).forEach((r, i) => prich(g, r, x - w / 2 + 18 * s, y - h / 2 + (92 + i * 44) * s, px, C.ink, '#3E9E4F'));
  const ry = y - h / 2 + 92 * s;
  ptext(g, o.lunchLabel || '午饭：', x + 14 * s, ry, px, C.ink);
  if (o.blank) { g.fillStyle = '#B9B0A0'; g.fillRect(x + 14 * s + 3 * px, ry + 6 * s, 100 * s, 4 * s); if (Math.floor(t * 2.5) % 2) { g.fillStyle = C.ink; g.fillRect(x + 14 * s + 3 * px + 4 * s, ry - px + 8 * s, 4 * s, px - 4 * s); } }
  else if (o.lunch) o.lunch.forEach((f, i) => { if (o.reveal == null || i < o.reveal) food(g, f, x + 14 * s + (3.6 + i * 1.5) * px, ry - px * .35, Math.max(2, Math.round(3 * s))); });
  if (o.stampTxt) { const p = clamp(o.stampP ?? 1); if (p > 0) stamp(g, x + w / 4, y + h / 4, o.stampTxt, p, { px: Math.round(40 * s), rot: -.12, col: '#3E9E4F' }); }
  // 记账的小人
  const cx = x + w / 2 - 40 * s, cby = y + h / 2 + 40 * s, kk = Math.max(2, Math.round(4 * s));
  crabAt(g, cx, cby, kk, { col: TONES.purple, hat: 'visor', glasses: true, eyes: o.distract ? 'dn' : 'l', arms: o.distract ? 'n' : 'upL', phone: !!o.distract });
  if (o.distract) glow(g, cx, cby - 8 * kk, 60 * s, 'rgba(143,211,255,.5)');
}
/* 想法泡泡（白），尾巴指向 (tx, ty) */
function bubble(g, x, y, rx, ry, tx, ty, o = {}) {
  if (tx != null) [[.72, 18], [.45, 12], [.2, 8]].forEach(([u, r]) => { const bx = lerp(tx, x, u * .7 + .1), by = lerp(ty, y, u * .7 + .1); pixOval(g, bx, by, r + 4, r + 4, 4, C.ink); pixOval(g, bx, by, r, r, 4, '#FFFFFF'); });
  pixOval(g, x, y, rx + 8, ry + 8, 4, C.ink); pixOval(g, x, y, rx, ry, 4, o.fill || '#FFFFFF');
}

/* ---------- 明亮的餐厅（失忆的人吃午饭）：白墙、大窗、窗帘、挂钟、长桌 ---------- */
function clinicBG(b, t) {
  b.fillStyle = '#EEF2F6'; b.fillRect(0, 0, 216, 260); b.fillStyle = '#E2E8EE'; for (let y = 20; y < 260; y += 24) b.fillRect(0, y, 216, 1);
  b.fillStyle = '#D8DEE6'; b.fillRect(0, 236, 216, 24);
  // 大窗：x 20..110, y 50..150
  for (let y = 0; y < 100; y++) { b.fillStyle = mixHex('#9FD3F5', '#E2F3FF', y / 100); b.fillRect(20, 50 + y, 90, 1); }
  b.fillStyle = '#9FD27A'; for (let x = 20; x < 110; x += 3) { const h = 10 + Math.round(Math.sin(x * .3) * 4 + hash(x, 2) * 4); b.fillRect(x, 150 - h, 3, h); }
  for (let i = 0; i < 2; i++) { const cx = 20 + ((t * 4 + i * 50) % 110) - 10; b.fillStyle = '#FFFFFF'; b.fillRect(Math.round(cx), 62 + i * 16, 16, 3); }
  b.fillStyle = '#FFFFFF'; b.fillRect(17, 47, 96, 3); b.fillRect(17, 150, 96, 4); b.fillRect(17, 50, 3, 100); b.fillRect(110, 50, 3, 100); b.fillRect(64, 50, 2, 100);
  [[10, 18], [110, 18]].forEach(([cx, cw], s) => { for (let y = 42; y < 162; y++) { const off = Math.round(Math.sin(t * 1.1 + y * .03 + s) * 2 * (y - 42) / 120); b.fillStyle = '#9FB8E8'; b.fillRect(cx + off, y, cw, 1); b.fillStyle = '#B8CCF0'; for (let x = 2; x < cw; x += 6) b.fillRect(cx + off + x, y, 2, 1); } });
  // 墙上的画、门
  b.fillStyle = '#C9A06A'; b.fillRect(140, 70, 40, 30); b.fillStyle = '#FFE9A8'; b.fillRect(143, 73, 34, 24); pdisc(b, 160, 85, 6, '#FF9A6A');
  b.fillStyle = '#B8C2CE'; b.fillRect(186, 110, 26, 150); b.fillStyle = '#9AA6B4'; b.fillRect(190, 116, 18, 60); b.fillRect(190, 184, 18, 70); b.fillStyle = '#E8C26A'; b.fillRect(189, 180, 3, 3);
  // 地板
  b.fillStyle = '#D9CDB8'; b.fillRect(0, 260, 216, 124); b.fillStyle = '#CDBFA8'; for (let y = 264; y < 384; y += 10) b.fillRect(0, y, 216, 1); for (let x = 0; x < 216; x += 30) b.fillRect(x, 260, 1, 124);
}
/* 餐盘（屏幕坐标，中心）：eaten 0 满 → 1 吃光 */
function tray(g, x, y, s = 1, eaten = 0) {
  g.fillStyle = '#5A6378'; g.fillRect(x - 130 * s, y - 50 * s, 260 * s, 100 * s); g.fillStyle = '#C9D3E0'; g.fillRect(x - 122 * s, y - 42 * s, 244 * s, 84 * s);
  pixOval(g, x - 70 * s, y, 42 * s, 30 * s, 4, '#FFFFFF'); pixOval(g, x + 10 * s, y, 34 * s, 26 * s, 4, '#FFFFFF'); pixOval(g, x + 80 * s, y, 30 * s, 24 * s, 4, '#FFFFFF');
  const a = 1 - clamp(eaten);
  if (a > 0) { food(g, 'rice', x - 70 * s, y - 4 * s, Math.max(2, Math.round(5 * s)), { a }); food(g, 'veg', x + 10 * s, y - 2 * s, Math.max(2, Math.round(4 * s)), { a }); food(g, 'leg', x + 80 * s, y - 2 * s, Math.max(2, Math.round(4 * s)), { a }); }
}

/* ---------- 心理学实验室（亮）：两张桌子，中间一道隔板；墙上"实验进行中"的灯 ---------- */
function labRoomBG(b, t) {
  b.fillStyle = '#E4EAF0'; b.fillRect(0, 0, 216, 250); b.fillStyle = '#D6DEE8'; for (let x = 0; x < 216; x += 18) b.fillRect(x, 0, 1, 250);
  b.fillStyle = '#C9D3DE'; b.fillRect(0, 236, 216, 14);
  b.fillStyle = '#8E9BAE'; b.fillRect(105, 120, 6, 130); b.fillStyle = '#A8B4C4'; b.fillRect(105, 118, 6, 3);
  b.fillStyle = '#2B2547'; b.fillRect(86, 30, 44, 14); b.fillStyle = Math.floor(t * 1.5) % 2 ? '#FF5A4F' : '#8A2A2A'; b.fillRect(90, 34, 6, 6);
  b.fillStyle = '#C9D3DE'; b.fillRect(0, 250, 216, 134); b.fillStyle = '#BCC6D2'; for (let y = 254; y < 384; y += 12) for (let x = ((y / 12) % 2) * 12; x < 216; x += 24) b.fillRect(x, y, 12, 12);
  // 时钟
  b.fillStyle = '#FFFFFF'; pdisc(b, 170, 60, 12, '#2B2547'); pdisc(b, 170, 60, 10, '#FFFFFF');
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
