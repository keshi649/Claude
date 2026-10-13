'use strict';
/* props.js：本片的道具和背景——镜子、手机、相片、相机、胶片、投票条、洗手间、摄影棚、房间……
   这些都直接画在全分辨率画布上，用 k 像素一格的方块拼，保持和像素角色一样的颗粒感。 */

/* ---------- 像素方块拼出来的形状（屏幕坐标） ---------- */
/* 椭圆环：中心 (cx, cy)，外半径 rx/ry，厚 th 格，每格 k 像素 */
function pixRing(g, cx, cy, rx, ry, th, k, col, col2) {
  const nx = Math.ceil(rx / k), ny = Math.ceil(ry / k);
  for (let j = -ny; j <= ny; j++) for (let i = -nx; i <= nx; i++) {
    const x = (i + .5) * k / rx, y = (j + .5) * k / ry, r = x * x + y * y;
    const xi = (i + .5) * k / (rx - th * k), yi = (j + .5) * k / (ry - th * k), ri2 = xi * xi + yi * yi;
    if (r <= 1 && ri2 > 1) { g.fillStyle = col2 && (i + j) % 4 === 0 ? col2 : col; g.fillRect(Math.round(cx + i * k), Math.round(cy + j * k), k, k); }
  }
}
/* 圆角矩形（切角用阶梯） */
function pixRect(g, x, y, w, h, k, col, cut = 2) {
  g.fillStyle = col;
  for (let s = 0; s < cut; s++) g.fillRect(x + (cut - s) * k, y + s * k, w - 2 * (cut - s) * k, k);
  g.fillRect(x, y + cut * k, w, h - 2 * cut * k);
  for (let s = 0; s < cut; s++) g.fillRect(x + (s + 1) * k, y + h - (cut - s) * k, w - 2 * (s + 1) * k, k);
}
/* 用椭圆裁剪，在里面画东西 */
function clipOval(g, cx, cy, rx, ry, fn) { g.save(); g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.clip(); fn(); g.restore(); }
function clipRect(g, x, y, w, h, fn) { g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip(); fn(); g.restore(); }

/* ---------- 镜子：金色椭圆框，里面是镜像版的脸 ---------- */
function drawMirror(g, cx, cy, rx, ry, t, o = {}) {
  g.fillStyle = 'rgba(0,0,0,.25)'; g.beginPath(); g.ellipse(cx + 14, cy + 16, rx, ry, 0, 0, TAU); g.fill();
  clipOval(g, cx, cy, rx - 12, ry - 12, () => {
    const gr = g.createLinearGradient(cx - rx, cy - ry, cx + rx, cy + ry);
    gr.addColorStop(0, '#D8F1FF'); gr.addColorStop(1, '#9CC9E8'); g.fillStyle = gr; g.fillRect(cx - rx, cy - ry, rx * 2, ry * 2);
    if (o.face !== false) drawFace(g, cx, cy + (o.dy ?? 30), o.k ?? 6, Object.assign({ flip: true }, o.faceOpt || {}));
    // 斜着的反光
    g.fillStyle = 'rgba(255,255,255,.28)';
    for (let i = 0; i < 3; i++) { const x0 = cx - rx + ((t * 120 + i * 90) % (rx * 3)); g.save(); g.translate(x0, cy - ry); g.rotate(.5); g.fillRect(0, 0, 18 - i * 5, ry * 3); g.restore(); }
  });
  pixRing(g, cx, cy, rx, ry, 3, 6, '#E8B84A', '#FFE08A');
  pixRing(g, cx, cy, rx - 18, ry - 18, 1, 6, '#B8862A');
  // 顶上的花饰
  g.fillStyle = '#E8B84A'; g.fillRect(cx - 18, cy - ry - 18, 36, 18); g.fillStyle = '#FFE08A'; g.fillRect(cx - 6, cy - ry - 24, 12, 12);
  if (o.sparkle) sparkles(g, cx, cy, rx, ry, t);
}
function sparkles(g, cx, cy, rx, ry, t) {
  for (let i = 0; i < 4; i++) {
    const ph = (t * 1.3 + i * .25) % 1, s = Math.sin(ph * Math.PI);
    const x = cx + Math.cos(i * 1.9 + 1) * rx * .8, y = cy + Math.sin(i * 2.3) * ry * .8, k = 6;
    g.fillStyle = `rgba(255,255,255,${s})`;
    g.fillRect(x - k / 2, y - 3 * k * s, k, 6 * k * s); g.fillRect(x - 3 * k * s, y - k / 2, 6 * k * s, k);
  }
}
/* ---------- 手机：竖着，屏幕里是原版的照片 ---------- */
function drawPhone(g, cx, cy, w, h, t, o = {}) {
  const x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 14, y + 16, w, h);
  pixRect(g, x, y, w, h, 6, '#22202A', 3);
  const sx = x + 18, sy = y + 36, sw = w - 36, sh = h - 72;
  clipRect(g, sx, sy, sw, sh, () => {
    g.fillStyle = o.bg || '#EDE3D6'; g.fillRect(sx, sy, sw, sh);
    if (o.draw) o.draw(sx, sy, sw, sh);
    else if (o.face !== false) drawFace(g, sx + sw / 2, sy + sh / 2 + 20, o.k ?? 6, o.faceOpt || {});
    if (o.dim) { g.fillStyle = `rgba(40,40,70,${o.dim})`; g.fillRect(sx, sy, sw, sh); }
  });
  g.fillStyle = '#3A3848'; g.fillRect(cx - 30, y + 14, 60, 8);
  if (o.shutter) { g.fillStyle = '#FFFFFF'; g.fillRect(cx - 18, y + h - 30, 36, 18); }
}
/* ---------- 相片：白边，里面一张脸；label 写在下面的白边上 ---------- */
function drawPrint(g, cx, cy, w, h, o = {}) {
  const x = Math.round(cx - w / 2), y = Math.round(cy - h / 2);
  g.save(); g.translate(cx, cy); g.rotate(o.rot || 0); g.translate(-cx, -cy);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(x + 12, y + 14, w, h);
  g.fillStyle = '#FFFDF6'; g.fillRect(x, y, w, h);
  const ix = x + 18, iy = y + 18, iw = w - 36, ih = h - 96;
  clipRect(g, ix, iy, iw, ih, () => {
    g.fillStyle = o.bg || '#B9D7EA'; g.fillRect(ix, iy, iw, ih);
    drawFace(g, ix + iw / 2, iy + ih / 2 + 24, o.k ?? 5, o.faceOpt || {});
  });
  if (o.label) ptext(g, o.label, cx, y + h - 30, 36, o.labelCol || C.ink, { align: 'center' });
  if (o.hot) { g.strokeStyle = o.hot; g.lineWidth = 10; g.strokeRect(x - 12, y - 12, w + 24, h + 24); }
  g.restore();
}
/* ---------- 相机（像素画） ---------- */
const CAMERA = () => spr('camera', [
  '....kkkk..........',
  '...kgggGk.........',
  'kkkkkkkkkkkkkkkkkk',
  'kGGGGGGGGGGGGGGyGk',
  'kGGGGGkkkkkGGGGGGk',
  'kGGGGkbbbBBkGGGGGk',
  'kGGGkbbwbbBBkGGGGk',
  'kGGGkbbbbbBBkGGGGk',
  'kGGGkBbbbbBBkGGGGk',
  'kGGGGkBBBBBkGGGGGk',
  'kGGGGGkkkkkGGGGGGk',
  'kkkkkkkkkkkkkkkkkk',
], Object.assign({}, PAL, { G: '#3A3848', g: '#5A586A', b: '#5EC8FF', B: '#2F7FC1' }));
/* 闪光：一圈放射状的白光，u 0..1 */
function flash(g, x, y, u, r = 260) {
  if (u <= 0 || u >= 1) return;
  const a = Math.sin(u * Math.PI);
  g.save(); g.globalAlpha *= a; g.fillStyle = '#FFFFFF';
  for (let i = 0; i < 8; i++) { g.save(); g.translate(x, y); g.rotate(i * TAU / 8); g.fillRect(-6, -r * a, 12, r * a * 2); g.restore(); }
  g.globalAlpha *= .6; g.fillRect(0, 0, W, H);
  g.restore();
}
/* ---------- 背景 ---------- */
function bgTiles(g, c1 = '#DCF2EE', c2 = '#C2E6DF', size = 60) {
  g.fillStyle = c1; g.fillRect(0, 0, W, H);
  g.fillStyle = c2; for (let x = 0; x < W; x += size) g.fillRect(x, 0, 6, H); for (let y = 0; y < H; y += size) g.fillRect(0, y, W, 6);
}
function bgGrid(g, t, c1 = '#1E2C3A', c2 = 'rgba(120,200,255,.08)') {
  g.fillStyle = c1; g.fillRect(0, 0, W, H);
  g.fillStyle = c2; for (let x = 0; x < W; x += 48) g.fillRect(x, 0, 2, H); for (let y = (t * 12) % 48; y < H; y += 48) g.fillRect(0, y, W, 2);
}
function bgStripes(g, c1, c2) {
  g.fillStyle = c1; g.fillRect(0, 0, W, H);
  g.fillStyle = c2; for (let x = -H; x < W; x += 90) { g.save(); g.translate(x, 0); g.rotate(.45); g.fillRect(0, 0, 36, H * 2); g.restore(); }
}
/* 摄影棚：灰色背景纸 + 两盏柔光灯 */
function bgStudio(g, t) {
  const gr = g.createRadialGradient(480, 760, 80, 480, 760, 900);
  gr.addColorStop(0, '#CFD4DC'); gr.addColorStop(1, '#7E8592'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.fillStyle = '#6E7480'; g.fillRect(0, 1180, W, H - 1180);
  for (const [x, flip] of [[120, 1], [860, -1]]) {
    g.fillStyle = '#2B2A35'; g.fillRect(x - 6, 640, 12, 560);
    g.save(); g.translate(x, 600); g.scale(flip, 1);
    g.fillStyle = '#F4F4F4'; g.beginPath(); g.moveTo(-70, -90); g.lineTo(70, -90); g.lineTo(40, 40); g.lineTo(-40, 40); g.closePath(); g.fill();
    g.fillStyle = '#FFFBE8'; g.fillRect(-56, -80, 112, 18);
    g.restore();
  }
}
/* 房间：墙、窗户、地板 */
function bgRoom(g, t, o = {}) {
  g.fillStyle = o.wall || '#F2E3D3'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(160,110,80,.08)'; for (let x = 0; x < W; x += 72) g.fillRect(x, 0, 36, 1180);
  g.fillStyle = '#C9A37A'; g.fillRect(0, 1180, W, H - 1180); g.fillStyle = '#B58E66'; for (let x = 0; x < W; x += 160) g.fillRect(x, 1180, 6, H - 1180);
  // 窗
  g.fillStyle = '#8C6A50'; g.fillRect(560, 240, 330, 300); g.fillStyle = '#9FD8FF'; g.fillRect(578, 258, 294, 264);
  g.fillStyle = '#FFFFFF'; g.fillRect(620, 300, 70, 20); g.fillRect(640, 290, 40, 10); g.fillRect(760, 380, 60, 16);
  g.fillStyle = '#8C6A50'; g.fillRect(720, 258, 12, 264); g.fillRect(578, 384, 294, 12);
}
/* ---------- 小图标（屏幕坐标，k 为像素大小） ---------- */
function iconMirror(g, x, y, k = 6) {
  g.fillStyle = '#E8B84A'; g.fillRect(x - 3 * k, y - 4 * k, 6 * k, 8 * k); g.fillRect(x - k, y + 4 * k, 2 * k, 4 * k);
  g.fillStyle = '#BFE6FF'; g.fillRect(x - 2 * k, y - 3 * k, 4 * k, 6 * k); g.fillStyle = '#FFFFFF'; g.fillRect(x - k, y - 2 * k, k, 2 * k);
}
function iconCamera(g, x, y, k = 6) {
  g.fillStyle = '#3A3848'; g.fillRect(x - 5 * k, y - 3 * k, 10 * k, 7 * k); g.fillRect(x - 2 * k, y - 4 * k, 4 * k, k);
  g.fillStyle = '#5EC8FF'; g.fillRect(x - 2 * k, y - 2 * k, 4 * k, 4 * k); g.fillStyle = '#FFFFFF'; g.fillRect(x - k, y - k, k, k);
}
function iconHeart(g, x, y, k = 6, col = '#FF6F8E') {
  g.fillStyle = col;
  ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'].forEach((r, j) => { for (let i = 0; i < 7; i++) if (r[i] === '#') g.fillRect(x + (i - 3.5) * k, y + (j - 3) * k, k, k); });
}
function iconPause(g, x, y, k = 6) { g.fillStyle = '#FFFFFF'; g.fillRect(x - 4 * k, y - 5 * k, 3 * k, 10 * k); g.fillRect(x + k, y - 5 * k, 3 * k, 10 * k); }
/* 像素箭头：从 (x0,y0) 指向 (x1,y1)，一格 k */
function pixArrow(g, x0, y0, x1, y1, k, col, u = 1) {
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), n = Math.floor(L * u / k);
  g.fillStyle = col;
  for (let i = 0; i < n; i++) if (i % 3 !== 2) g.fillRect(Math.round(x0 + dx * i * k / L - k / 2), Math.round(y0 + dy * i * k / L - k / 2), k, k);
  if (u >= 1) { const a = Math.atan2(dy, dx); for (const s of [-1, 1]) for (let i = 1; i <= 3; i++) g.fillRect(Math.round(x1 - Math.cos(a + s * .6) * i * k - k / 2), Math.round(y1 - Math.sin(a + s * .6) * i * k - k / 2), k, k); }
}
/* 像素圆圈（标出脸上的某个地方） */
function markCircle(g, x, y, r, col, u = 1) {
  const n = Math.floor(24 * u);
  g.fillStyle = col;
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i / 24 * TAU; g.fillRect(Math.round(x + Math.cos(a) * r - 4), Math.round(y + Math.sin(a) * r - 4), 8, 8); }
}
