'use strict';
/* 方向 9：像素风，正常比例的人物（不是 Q 版）。
   人物按"零件"画：每个零件是一块纯色（路径光栅化成像素，不留半透明边），右边自动压一道暗面、左上一道亮边；
   零件和零件之间自动描一条深色线（前面的零件描），整个人外面描一圈深色边；五官一个像素一个像素点。 */
NEED += '人物设定他她约会日常身高帅气美丽长款大衣高领毛衣围巾羽绒服卫衣贝雷帽毛线帽腰带格子裙短靴切尔西靴过膝靴';

/* ---------- 像素零件引擎 ---------- */
const _rt = {};
function rtmp(w, h) { const k = w + 'x' + h; if (!_rt[k]) { const c = document.createElement('canvas'); c.width = w; c.height = h; _rt[k] = c.getContext('2d', { willReadFrequently: true }); } const g = _rt[k]; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h); g.globalAlpha = 1; g.fillStyle = '#fff'; g.strokeStyle = '#fff'; g.lineCap = 'round'; g.lineJoin = 'round'; return g; }
function SP(w, h) { return { w, h, d: new Uint8ClampedArray(w * h * 4), id: new Int16Array(w * h).fill(-1), n: 0, line: [], ld: [] }; }
function rast(S, fn) { const t = rtmp(S.w, S.h); fn(t); const a = t.getImageData(0, 0, S.w, S.h).data, m = new Uint8Array(S.w * S.h); for (let i = 0; i < m.length; i++) m[i] = a[i * 4 + 3] >= 128 ? 1 : 0; return m; }
function setPx(S, i, col) { const C = typeof col === 'string' ? h2(col) : col; S.d[i * 4] = C[0]; S.d[i * 4 + 1] = C[1]; S.d[i * 4 + 2] = C[2]; S.d[i * 4 + 3] = 255; }
/* o：clip 只画在这块蒙版里；pid 沿用父零件的编号（画阴影时用）；line false 不描内线；rim 右侧暗面宽度；hl 左上亮边；sh/li 暗面、亮面颜色；under 只画在空的地方 */
function part(S, fn, col, o = {}) {
  let m = rast(S, fn); const W = S.w, H = S.h;
  if (o.clip) for (let i = 0; i < m.length; i++) m[i] &= o.clip[i];
  if (o.under) for (let i = 0; i < m.length; i++) if (S.id[i] >= 0) m[i] = 0;
  const pid = o.pid ?? S.n++; if (o.pid == null) { S.line[pid] = o.line !== false; S.ld[pid] = o.ld ?? .42; }
  const C = h2(col), SH = h2(o.sh || dk(col, .2)), LI = h2(o.li || lt(col, .16)), rim = o.rim ?? 2, IN = (x, y) => x >= 0 && y >= 0 && x < W && y < H && m[y * W + x];
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (!m[i]) continue; let c = C;
    if (o.shade !== false) { if (rim > 0 && (!IN(x + rim, y) || (o.rimY && !IN(x, y + o.rimY)))) c = SH; else if (o.hl !== false && (!IN(x - 1, y) || !IN(x, y - 1))) c = LI; }
    setPx(S, i, c); if (o.keepId !== true) S.id[i] = pid; }
  m.pid = pid; return m;
}
/* 在某块蒙版里直接点像素（不改编号） */
function dot(S, x, y, col, m) { x = Math.round(x); y = Math.round(y); if (x < 0 || y < 0 || x >= S.w || y >= S.h) return; const i = y * S.w + x; if (m && !m[i]) return; setPx(S, i, col); }
function dots(S, list, col, m) { list.forEach(([x, y]) => dot(S, x, y, col, m)); }
/* 收尾：零件之间描内线、外面描一圈边，转成画布 */
function finishSP(S, o = {}) {
  const W = S.w, H = S.h, d = S.d, out = new Uint8ClampedArray(d);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x, a = S.id[i]; if (a < 0 || !S.line[a]) continue; let hit = false;
    for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; const b = S.id[Y * W + X]; if (b >= 0 && b < a) { hit = true; break; } }
    if (hit) { const k = S.ld[a]; out[i * 4] = d[i * 4] * (1 - k) + 26 * k; out[i * 4 + 1] = d[i * 4 + 1] * (1 - k) + 16 * k; out[i * 4 + 2] = d[i * 4 + 2] * (1 - k) + 30 * k; } }
  if (o.outline !== false) { const OC = h2(o.oc || '#1A1222'); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; if (S.id[i] >= 0) continue; let n = -1; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; if (S.id[Y * W + X] >= 0) { n = Y * W + X; break; } } if (n >= 0) { out[i * 4] = d[n * 4] * .3 + OC[0] * .7; out[i * 4 + 1] = d[n * 4 + 1] * .3 + OC[1] * .7; out[i * 4 + 2] = d[n * 4 + 2] * .3 + OC[2] * .7; out[i * 4 + 3] = 255; } } }
  const c = mk(W, H), id = c.createImageData(W, H); id.data.set(out); c.putImageData(id, 0, 0); return c.canvas;
}
/* 像素模板：每个字符一种颜色，'.' 不画；mirror 左右翻转（画另一只眼） */
function tpl(S, x, y, rows, pal, m, mirror) { rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const ch = r[mirror ? r.length - 1 - i : i]; if (ch !== '.' && pal[ch]) dot(S, x + i, y + j, pal[ch], m); } }); }
/* 路径小工具 */
const pth = pts => c => { c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.closePath(); c.fill(); };
const limb = (pts, w) => c => { c.lineWidth = w; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); };
const elp = (x, y, rx, ry, a = 0) => c => { c.beginPath(); c.ellipse(x, y, rx, ry, a, 0, 7); c.fill(); };
/* 一段两头粗细不同的肢体（梯形 + 两头圆） */
const taper = (x0, y0, w0, x1, y1, w1) => c => { const a = Math.atan2(y1 - y0, x1 - x0), nx = -Math.sin(a), ny = Math.cos(a); c.beginPath(); c.moveTo(x0 + nx * w0 / 2, y0 + ny * w0 / 2); c.lineTo(x1 + nx * w1 / 2, y1 + ny * w1 / 2); c.lineTo(x1 - nx * w1 / 2, y1 - ny * w1 / 2); c.lineTo(x0 - nx * w0 / 2, y0 - ny * w0 / 2); c.closePath(); c.fill(); c.beginPath(); c.arc(x0, y0, w0 / 2, 0, 7); c.fill(); c.beginPath(); c.arc(x1, y1, w1 / 2, 0, 7); c.fill(); };

/* ---------- 配色 ---------- */
const SKIN = { b: '#F4D4C0', s: '#DCA894', l: '#FBE6D8', d: '#C08878' };

/* ---------- 他的头（头顶到下巴约 30 像素） ---------- */
function maleHead(S, cx, y0, o = {}) {
  const HAIR = o.hair || '#2A2236', HS = '#17121F', HL = '#43395A', Y = y0 + 2;
  if (o.only !== 'front') part(S, c => { c.beginPath(); c.moveTo(cx - 10.6, Y + 19); c.bezierCurveTo(cx - 12.6, Y + 6, cx - 9, Y - 6, cx, Y - 6.4); c.bezierCurveTo(cx + 9, Y - 6, cx + 12.6, Y + 6, cx + 10.8, Y + 19); c.closePath(); c.fill(); }, HAIR, { rim: 2, sh: HS, li: HL });
  if (o.only === 'back') return;
  const neck = part(S, pth([[cx - 4.2, Y + 22], [cx + 4.2, Y + 22], [cx + 4.4, Y + 36], [cx - 4.4, Y + 36]]), SKIN.b, { rim: 2, sh: SKIN.s, line: false });
  part(S, pth([[cx - 4.2, Y + 22], [cx + 4.2, Y + 22], [cx + 4.2, Y + 28], [cx, Y + 30.4], [cx - 4.2, Y + 28]]), SKIN.s, { clip: neck, pid: neck.pid, shade: false });
  [[-1], [1]].forEach(([sd]) => part(S, elp(cx + sd * 9.4, Y + 16.4, 1.8, 3), SKIN.b, { rim: sd > 0 ? 1 : 0, sh: SKIN.s }));
  const face = part(S, c => { c.beginPath(); c.moveTo(cx - 9.2, Y + 10); c.bezierCurveTo(cx - 9.8, Y + 15, cx - 9.4, Y + 19, cx - 8.2, Y + 21.5); c.lineTo(cx - 6.2, Y + 24.8); c.lineTo(cx - 2.6, Y + 27.8); c.quadraticCurveTo(cx, Y + 28.8, cx + 2.6, Y + 27.8); c.lineTo(cx + 6.2, Y + 24.8); c.lineTo(cx + 8.2, Y + 21.5); c.bezierCurveTo(cx + 9.4, Y + 19, cx + 9.8, Y + 15, cx + 9.2, Y + 10); c.bezierCurveTo(cx + 8.6, Y + 1, cx - 8.6, Y + 1, cx - 9.2, Y + 10); c.fill(); }, SKIN.b, { rim: 2, sh: SKIN.s, li: SKIN.l });
  const E = '#18121C', BR = HAIR, f = (x, y, c2) => dot(S, x, y, c2, face);
  [-1, 1].forEach(sd => { const X = v => cx + sd * v, e = o.eyes || 'n';
    // 眉：粗、直、眉峰在外三分之一
    [[8, 12], [7, 11], [6, 11], [5, 11], [4, 11], [3, 12]].forEach(([v, yy]) => f(X(v), Y + yy, BR)); f(X(6), Y + 12, '#4A3A44'); f(X(5), Y + 12, '#C8968A');
    if (e === 'shut') { [[7, 16], [6, 16], [5, 16], [4, 16], [3, 15]].forEach(([v, yy]) => f(X(v), Y + yy, E)); return; }
    if (e === 'smile') { [[7, 15], [6, 14], [5, 14], [4, 14], [3, 15]].forEach(([v, yy]) => f(X(v), Y + yy, E)); return; }
    // 眼：6×3 模板，外眼角上挑、眼珠深色带高光
    tpl(S, sd < 0 ? cx - 8 : cx + 3, Y + 14, ['KKKKKK', '.KDHD.', '..DD..'], { K: E, W: '#F2EAE6', D: '#221C34', H: '#D8D4F4', i: '#3E3A60' }, face, sd > 0);
    f(X(7), Y + 16, SKIN.s);
  });
  [[1, 17], [1, 18], [1, 19]].forEach(([v, yy]) => f(cx + v, Y + yy, SKIN.s)); f(cx, Y + 20, SKIN.l); f(cx - 1, Y + 21, SKIN.s); f(cx + 1, Y + 21, SKIN.d); f(cx, Y + 21, SKIN.s);
  const m = o.mouth || 'n';
  if (m === 'smile') { [[-2, 24], [-1, 25], [0, 25], [1, 25], [2, 24]].forEach(([v, yy]) => f(cx + v, Y + yy, '#A8605E')); }
  else if (m === 'sad') { [[-2, 25], [-1, 24], [0, 24], [1, 24], [2, 25]].forEach(([v, yy]) => f(cx + v, Y + yy, '#A8605E')); }
  else { [[-2, 24], [-1, 24], [0, 24], [1, 24]].forEach(([v, yy]) => f(cx + v, Y + yy, '#B06A66')); f(cx, Y + 25, SKIN.l); f(cx - 1, Y + 25, '#E8B8A6'); }
  if (o.tear) [-1, 1].forEach(sd => { f(cx + sd * 6, Y + 17, '#9AD8F8'); f(cx + sd * 6, Y + 18, '#9AD8F8'); f(cx + sd * 6, Y + 19, '#C8ECFF'); });
  // 发型：左边分缝，前面一撮往上翘起再往右扫下来，右边一缕垂到眉尾（露出左边额头）
  part(S, c => { c.beginPath(); c.moveTo(cx - 10.4, Y + 16); c.lineTo(cx - 11, Y + 6); c.bezierCurveTo(cx - 11, Y - 1, cx - 8, Y - 5.4, cx - 2, Y - 6.6); c.bezierCurveTo(cx + 5, Y - 7.4, cx + 11, Y - 3.6, cx + 11.8, Y + 3); c.lineTo(cx + 11.4, Y + 12); c.lineTo(cx + 10.6, Y + 17.4); c.lineTo(cx + 9.4, Y + 12.4); c.lineTo(cx + 7.4, Y + 9.6); c.lineTo(cx + 6.2, Y + 14.4); c.lineTo(cx + 3.8, Y + 8.8); c.lineTo(cx + 1.6, Y + 11.4); c.lineTo(cx - .4, Y + 6.8); c.lineTo(cx - 2.8, Y + 8.2); c.lineTo(cx - 4.4, Y + 3.2); c.quadraticCurveTo(cx - 7, Y + 4, cx - 8.6, Y + 9.4); c.closePath(); c.fill(); }, HAIR, { rim: 2, sh: HS, li: HL, ld: .55 });
  // 发丝的明暗：顺着往右下扫的方向
  dots(S, [[cx - 8, Y - 2], [cx - 7, Y - 3], [cx - 6, Y - 4], [cx - 5, Y - 4], [cx - 4, Y - 5], [cx - 3, Y - 5], [cx + 1, Y - 5], [cx + 2, Y - 4], [cx + 3, Y - 3], [cx + 4, Y - 2], [cx + 5, Y - 1], [cx + 6, Y], [cx + 7, Y + 1], [cx - 2, Y - 1], [cx - 1, Y], [cx, Y + 1], [cx + 1, Y + 2], [cx + 2, Y + 3]], '#5E5480');
  dots(S, [[cx - 6, Y + 1], [cx - 5, Y + 2], [cx + 4, Y + 5], [cx + 5, Y + 6], [cx + 6, Y + 7], [cx + 8, Y + 4], [cx + 9, Y + 6], [cx + 9, Y + 8], [cx - 9, Y + 4], [cx - 9, Y + 8]], HS);
  dots(S, [[cx - 7, Y + 6], [cx - 6, Y + 7]], '#E8C0AC');
  return face;
}
/* ---------- 他：约会（驼色收身大衣、黑色高领、红围巾、深灰西裤、黑色切尔西靴） ---------- */
function maleDate(S, cx, B) {
  const COAT = '#A87448', CS = '#7C5030', CL = '#C89262', TN = '#24232C', PANT = '#3A3C4A', PS = '#2A2C38', BOOT = '#1E1C22', SC = '#C42838', SCS = '#8E1828', SCL = '#E04A58';
  maleHead(S, cx, B - 2, { only: 'back' });
  part(S, pth([[cx - 11, B + 100], [cx - 1.2, B + 100], [cx - 2.4, B + 188], [cx - 8.6, B + 188]]), PANT, { rim: 2, sh: PS });
  part(S, pth([[cx + 1.2, B + 100], [cx + 11, B + 100], [cx + 12.6, B + 188], [cx + 6.2, B + 188]]), PANT, { rim: 2, sh: PS });
  dots(S, Array.from({ length: 50 }, (_, i) => [cx - 6 + i * .02, B + 136 + i]), '#4A4C5C'); dots(S, Array.from({ length: 50 }, (_, i) => [cx + 7.5 + i * .04, B + 136 + i]), '#4A4C5C');
  part(S, c => { c.beginPath(); c.moveTo(cx - 9, B + 186); c.lineTo(cx - 2, B + 186); c.lineTo(cx - 1.4, B + 196); c.lineTo(cx - 10.4, B + 196); c.quadraticCurveTo(cx - 13, B + 195, cx - 12.4, B + 192); c.quadraticCurveTo(cx - 11.4, B + 189.6, cx - 9, B + 189); c.closePath(); c.fill(); }, BOOT, { rim: 1, li: '#3E3A46' });
  part(S, c => { c.beginPath(); c.moveTo(cx + 6.4, B + 186); c.lineTo(cx + 12.6, B + 186); c.lineTo(cx + 13.4, B + 189); c.quadraticCurveTo(cx + 15.6, B + 190, cx + 15.8, B + 193); c.quadraticCurveTo(cx + 15.6, B + 196, cx + 13, B + 196); c.lineTo(cx + 6.2, B + 196); c.closePath(); c.fill(); }, BOOT, { rim: 1, li: '#3E3A46' });
  part(S, pth([[cx - 9.6, B + 36], [cx + 9.6, B + 36], [cx + 10.6, B + 104], [cx - 10.6, B + 104]]), TN, { rim: 2, li: '#34323E' });
  for (let k = 0; k < 7; k++) dots(S, [[cx - 3, B + 44 + k * 9], [cx + 1, B + 47 + k * 9]], '#30303A');
  // 大衣两片前襟
  const L = part(S, pth([[cx - 7, B + 32], [cx - 15, B + 35], [cx - 23.4, B + 39.4], [cx - 24.6, B + 46], [cx - 21, B + 80], [cx - 21.8, B + 108], [cx - 22.8, B + 134], [cx - 6.4, B + 135], [cx - 5.8, B + 108], [cx - 5.4, B + 82], [cx - 7.4, B + 56], [cx - 10, B + 40]]), COAT, { rim: 2, sh: CS, li: CL });
  const RR = part(S, pth([[cx + 7, B + 32], [cx + 15, B + 35], [cx + 23.4, B + 39.4], [cx + 24.6, B + 46], [cx + 21, B + 80], [cx + 21.8, B + 108], [cx + 22.8, B + 134], [cx + 6.2, B + 135], [cx + 5.6, B + 108], [cx + 5.2, B + 82], [cx + 7.4, B + 56], [cx + 10, B + 40]]), COAT, { rim: 3, sh: CS, li: CL });
  part(S, pth([[cx + 5, B + 54], [cx + 8.4, B + 54], [cx + 8.6, B + 134], [cx + 6.4, B + 134]]), CS, { clip: RR, pid: RR.pid, shade: false });
  part(S, pth([[cx - 9, B + 84], [cx - 9.6, B + 134], [cx - 7.6, B + 134]]), CL, { clip: L, pid: L.pid, shade: false });
  // 翻领（带缺口）
  part(S, pth([[cx - 7, B + 32], [cx - 13.6, B + 37], [cx - 12.6, B + 41.6], [cx - 15.4, B + 42.8], [cx - 10, B + 64], [cx - 5.6, B + 80], [cx - 7.4, B + 56]]), CL, { rim: 1, sh: COAT, li: '#DDAA78', ld: .6 });
  part(S, pth([[cx + 7, B + 32], [cx + 13.6, B + 37], [cx + 12.6, B + 41.6], [cx + 15.4, B + 42.8], [cx + 10, B + 64], [cx + 5.6, B + 80], [cx + 7.4, B + 56]]), COAT, { rim: 1, sh: CS, li: CL, ld: .6 });
  [[-1], [1]].forEach(([sd]) => part(S, pth([[cx + sd * 21.4, B + 101], [cx + sd * 12, B + 100.4], [cx + sd * 12, B + 104.4], [cx + sd * 21.6, B + 105]]), COAT, { rim: 1, sh: CS, ld: .55 }));
  dots(S, [[cx - 6, B + 86], [cx - 6, B + 112]], '#4A2E1C', L);
  // 袖子：手插进大衣口袋
  [[-1], [1]].forEach(([sd]) => part(S, c => { taper(cx + sd * 22.4, B + 43, 9.6, cx + sd * 24.6, B + 74, 8.2)(c); taper(cx + sd * 24.6, B + 74, 8.2, cx + sd * 18.6, B + 101, 7.6)(c); }, COAT, { rim: 2, sh: CS, li: CL }));
  
  // 红围巾
  part(S, pth([[cx - 8.6, B + 27.6], [cx + 8.6, B + 27.6], [cx + 10.8, B + 35.6], [cx + 4, B + 39.6], [cx - 4, B + 39.6], [cx - 10.8, B + 35.6]]), SC, { rim: 2, sh: SCS, li: SCL });
  part(S, pth([[cx + 1.2, B + 35], [cx + 6.6, B + 35], [cx + 7.6, B + 62], [cx + 2.4, B + 62]]), SC, { rim: 2, sh: SCS, li: SCL });
  part(S, pth([[cx - 6.8, B + 35], [cx - 1, B + 35], [cx - 1.8, B + 84], [cx - 7.8, B + 84]]), SC, { rim: 2, sh: SCS, li: SCL });
  for (let k = 0; k < 4; k++) { dot(S, cx - 7 + k * 1.6, B + 85, SCS); dot(S, cx + 2.6 + k * 1.4, B + 63, SCS); }
  for (let k = 0; k < 5; k++) dots(S, [[cx - 5, B + 41 + k * 9], [cx - 3, B + 45 + k * 9]], '#A41C2E');
  maleHead(S, cx, B - 2, { only: 'front' });
}

/* ---------- 她的头（贝雷帽、长卷发、一缕搭在胸前） ---------- */
function femaleHead(S, cx, Y, o = {}) {
  const HAIR = o.hair || '#5A3428', HS = '#3A2018', HL = '#8A5A44', E = '#1E1218';
  // 后面的长发（到背中间，发尾是卷的）
  if (o.only !== 'front') part(S, c => { c.beginPath(); c.moveTo(cx - 9.6, Y + 4); c.bezierCurveTo(cx - 13, Y + 14, cx - 12, Y + 30, cx - 15.6, Y + 46); c.bezierCurveTo(cx - 18, Y + 58, cx - 13, Y + 66, cx - 16, Y + 74); c.lineTo(cx - 10, Y + 72); c.lineTo(cx - 7, Y + 76); c.lineTo(cx + 7, Y + 76); c.lineTo(cx + 11, Y + 72); c.lineTo(cx + 16.4, Y + 74); c.bezierCurveTo(cx + 13.6, Y + 66, cx + 18.4, Y + 58, cx + 16, Y + 46); c.bezierCurveTo(cx + 12.6, Y + 30, cx + 13.4, Y + 14, cx + 10, Y + 4); c.bezierCurveTo(cx + 7, Y - 3.6, cx - 7, Y - 3.6, cx - 9.6, Y + 4); c.fill(); }, HAIR, { rim: 2, sh: HS, li: HL });
  if (o.only === 'back') return;
  const neck = part(S, pth([[cx - 3.2, Y + 22], [cx + 3.2, Y + 22], [cx + 3.4, Y + 34], [cx - 3.4, Y + 34]]), SKIN.b, { rim: 1, sh: SKIN.s, line: false });
  part(S, pth([[cx - 3.2, Y + 22], [cx + 3.2, Y + 22], [cx + 3.2, Y + 27], [cx, Y + 29], [cx - 3.2, Y + 27]]), SKIN.s, { clip: neck, pid: neck.pid, shade: false });
  const face = part(S, c => { c.beginPath(); c.moveTo(cx - 8.6, Y + 10); c.bezierCurveTo(cx - 9, Y + 15, cx - 8.4, Y + 19, cx - 6.6, Y + 21.8); c.bezierCurveTo(cx - 4.8, Y + 24.4, cx - 2.6, Y + 26, cx, Y + 26.4); c.bezierCurveTo(cx + 2.6, Y + 26, cx + 4.8, Y + 24.4, cx + 6.6, Y + 21.8); c.bezierCurveTo(cx + 8.4, Y + 19, cx + 9, Y + 15, cx + 8.6, Y + 10); c.bezierCurveTo(cx + 8, Y + 1.6, cx - 8, Y + 1.6, cx - 8.6, Y + 10); c.fill(); }, SKIN.b, { rim: 1, sh: SKIN.s, li: SKIN.l });
  const f = (x, y, c2) => dot(S, x, y, c2, face);
  [-1, 1].forEach(sd => { const X = v => cx + sd * v, e = o.eyes || 'n';
    [[7, 11], [6, 10], [5, 10], [4, 10], [3, 10], [2, 11]].forEach(([v, yy]) => f(X(v), Y + yy, '#7A4C3C'));
    if (e === 'smile') { [[7, 15], [6, 14], [5, 14], [4, 14], [3, 15]].forEach(([v, yy]) => f(X(v), Y + yy, E)); f(X(8), Y + 14, E); return; }
    if (e === 'shut') { [[7, 15], [6, 16], [5, 16], [4, 16], [3, 15]].forEach(([v, yy]) => f(X(v), Y + yy, E)); f(X(8), Y + 15, E); return; }
    // 眼：7×5 的模板（外眼角在外侧、睫毛往外翘），眼珠 3 格宽
    const EYE = ['KK.....', '.KKKKK.', '.KDHDW.', '..DIIW.', '...ii..'];
    tpl(S, sd < 0 ? cx - 8 : cx + 2, Y + 12, EYE, { K: E, W: '#F4ECEA', D: '#2E1820', H: '#FFFFFF', I: '#6A3A34', i: '#A87060' }, face, sd > 0);
    f(X(6), Y + 18, '#F4AAA6'); f(X(7), Y + 18, '#F6BAB4');
  });
  f(cx + 1, Y + 18, SKIN.s); f(cx, Y + 19, SKIN.s);
  const m = o.mouth || 'n';
  if (m === 'smile') { [[-2, 21], [-1, 22], [0, 22], [1, 22], [2, 21]].forEach(([v, yy]) => f(cx + v, Y + yy, '#C84458')); f(cx, Y + 23, '#E88A90'); }
  else if (m === 'sad') { [[-1, 22], [0, 21], [1, 22]].forEach(([v, yy]) => f(cx + v, Y + yy, '#C84458')); }
  else { [[-1, 21], [0, 21], [1, 21]].forEach(([v, yy]) => f(cx + v, Y + yy, '#C84458')); f(cx - 1, Y + 22, '#E2707C'); f(cx, Y + 22, '#EC8A92'); }
  if (o.tear) [-1, 1].forEach(sd => { f(cx + sd * 6, Y + 17, '#9AD8F8'); f(cx + sd * 6, Y + 18, '#9AD8F8'); f(cx + sd * 6, Y + 19, '#C8ECFF'); });
  // 刘海：八字刘海，从中间偏左分开
  part(S, c => { c.beginPath(); c.moveTo(cx - 1.6, Y - 1.4); c.bezierCurveTo(cx - 5, Y + 1, cx - 7.6, Y + 6, cx - 8.4, Y + 14); c.lineTo(cx - 9.8, Y + 15); c.bezierCurveTo(cx - 10.4, Y + 6, cx - 7, Y - 2.6, cx - 1.6, Y - 2.6); c.closePath(); c.fill(); c.beginPath(); c.moveTo(cx - 1.6, Y - 1.4); c.bezierCurveTo(cx + 3, Y + 1, cx + 7.4, Y + 6, cx + 8.6, Y + 14.6); c.lineTo(cx + 10.2, Y + 15); c.bezierCurveTo(cx + 10.6, Y + 6, cx + 6, Y - 2.6, cx - 1.6, Y - 2.6); c.closePath(); c.fill(); }, HAIR, { rim: 1, sh: HS, li: HL, ld: .5 });
  // 搭在右肩前面的一缕卷发
  part(S, c => { c.beginPath(); c.moveTo(cx + 8.4, Y + 12); c.bezierCurveTo(cx + 11, Y + 24, cx + 9, Y + 34, cx + 12.6, Y + 44); c.bezierCurveTo(cx + 15.6, Y + 52, cx + 11, Y + 58, cx + 13.6, Y + 64); c.lineTo(cx + 10, Y + 62); c.bezierCurveTo(cx + 9, Y + 56, cx + 12, Y + 50, cx + 9.4, Y + 44); c.bezierCurveTo(cx + 6.4, Y + 34, cx + 9, Y + 24, cx + 7.4, Y + 14); c.closePath(); c.fill(); }, HAIR, { rim: 1, sh: HS, li: HL, ld: .5 });
  dots(S, [[cx - 5, Y + 1], [cx - 6, Y + 3], [cx - 7, Y + 5], [cx + 3, Y + 1], [cx + 5, Y + 3], [cx + 6, Y + 5], [cx + 10, Y + 30], [cx + 11, Y + 40], [cx + 13, Y + 50]], HL);
  if (o.hat === 'beanie') { part(S, c => { c.beginPath(); c.moveTo(cx - 10.4, Y + 6); c.bezierCurveTo(cx - 11.6, Y - 7, cx + 11.6, Y - 7, cx + 10.4, Y + 6); c.closePath(); c.fill(); }, '#F4F2EE', { rim: 2, sh: '#CCC6C2', li: '#FFFFFF' });
    part(S, c => { c.beginPath(); c.roundRect(cx - 11, Y + 3, 22, 5, 2.4); c.fill(); }, '#ECE8E4', { rim: 2, sh: '#C8C2BE', li: '#FFFFFF', ld: .35 });
    for (let k = -4; k <= 4; k++) { dot(S, cx + k * 2.2, Y + 4, '#D2CCC8'); dot(S, cx + k * 2.2, Y + 6, '#D2CCC8'); }
    for (let k = -3; k <= 3; k++) dots(S, [[cx + k * 2.6, Y - 3], [cx + k * 2.6, Y], [cx + k * 2.6, Y + 1]], '#DCD6D2');
    part(S, elp(cx, Y - 6.4, 3.6, 3.4), '#F59AB0', { rim: 1, sh: '#D06A88', li: '#FFC8D6' }); return face; }
  // 白色贝雷帽，歪戴
  // 白色贝雷帽，歪戴
  if (o.hat !== false) { part(S, c => { c.save(); c.translate(cx + 2.6, Y + 1.6); c.rotate(-.14); c.beginPath(); c.ellipse(0, 0, 12, 4.6, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(-.6, -2.2, 10.4, 4.6, 0, 0, 7); c.fill(); c.restore(); c.fillRect(cx + 1.4, Y - 7.4, 1.6, 2.6); }, '#F2EEE8', { rim: 2, sh: '#C8C2BC', li: '#FFFFFF' });
    dots(S, [[cx - 6, Y + 3], [cx - 3, Y + 3], [cx, Y + 3], [cx + 3, Y + 2], [cx + 6, Y + 2], [cx + 9, Y + 1]], '#D8D2CC'); }
  return face;
}
/* ---------- 她：约会（淡紫色收腰大衣、白毛领、红手套、红色小包、黑丝袜、过膝长靴） ---------- */
function femaleDate(S, cx, Y) {
  const CO = '#B2A0E0', CS = '#8A78C0', CLc = '#CEC2F2', TI = '#2E2834', TS = '#1E1A24', TL = '#5A4C64', BT = '#1A1620', BL = '#4A4458', GL = '#C42838';
  femaleHead(S, cx, Y, { only: 'back' });
  // 腿：左腿（画面左）站直吃重；右腿从前面交叉过来
  part(S, c => { taper(cx - 6.6, Y + 102, 9, cx - 6, Y + 138, 6.4)(c); taper(cx - 6, Y + 138, 6.4, cx - 5.4, Y + 168, 4)(c); }, TI, { rim: 2, sh: TS, li: TL });
  part(S, c => { taper(cx - 6, Y + 140, 7, cx - 5.4, Y + 170, 5)(c); c.beginPath(); c.moveTo(cx - 7.6, Y + 167); c.lineTo(cx - 3, Y + 167); c.lineTo(cx - 2.6, Y + 175); c.lineTo(cx - 10.4, Y + 175.6); c.quadraticCurveTo(cx - 11.6, Y + 173.4, cx - 7.6, Y + 170.6); c.fill(); c.fillRect(cx - 4.2, Y + 173, 2, 3.6); }, BT, { rim: 1, sh: '#100E14', li: BL });
  part(S, c => { taper(cx + 6.2, Y + 102, 9, cx + 1.8, Y + 138, 6.4)(c); taper(cx + 1.8, Y + 138, 6.4, cx - .6, Y + 168, 4)(c); }, TI, { rim: 2, sh: TS, li: TL });
  part(S, c => { taper(cx + 1.6, Y + 140, 7, cx - .4, Y + 170, 5)(c); c.beginPath(); c.moveTo(cx - 2.6, Y + 167); c.lineTo(cx + 1.8, Y + 167); c.lineTo(cx + 2.4, Y + 175); c.lineTo(cx - 5.2, Y + 175.6); c.quadraticCurveTo(cx - 6.4, Y + 173.4, cx - 2.6, Y + 170.6); c.fill(); c.fillRect(cx + .4, Y + 173, 2, 3.6); }, BT, { rim: 1, sh: '#100E14', li: BL });
  dots(S, [[cx - 8, Y + 112], [cx - 8, Y + 118], [cx - 7, Y + 124], [cx + 4, Y + 114], [cx + 3, Y + 122], [cx + 2, Y + 128]], TL);
  // 大衣：收腰、下摆散开
  const C = part(S, pth([[cx - 5, Y + 30], [cx - 11, Y + 33.6], [cx - 15.4, Y + 37], [cx - 16, Y + 42], [cx - 14.4, Y + 52], [cx - 10.2, Y + 63], [cx - 10.8, Y + 68], [cx - 14.6, Y + 80], [cx - 18.4, Y + 112], [cx + 18.4, Y + 112], [cx + 14.6, Y + 80], [cx + 10.8, Y + 68], [cx + 10.2, Y + 63], [cx + 14.4, Y + 52], [cx + 16, Y + 42], [cx + 15.4, Y + 37], [cx + 11, Y + 33.6], [cx + 5, Y + 30]]), CO, { rim: 2, sh: CS, li: CLc });
  // 右边压过来的门襟、褶
  part(S, pth([[cx + 1, Y + 66], [cx + 18.4, Y + 112], [cx + 3.4, Y + 112]]), CO, { rim: 2, sh: CS, li: CLc, ld: .5 });
  dots(S, Array.from({ length: 24 }, (_, i) => [cx - 9 - i * .2, Y + 86 + i]), CS); dots(S, Array.from({ length: 22 }, (_, i) => [cx + 12 + i * .18, Y + 88 + i]), CS);
  // 腰带和蝴蝶结
  part(S, pth([[cx - 10.6, Y + 62], [cx + 10.6, Y + 62], [cx + 10.8, Y + 66], [cx - 10.8, Y + 66]]), '#9886CE', { rim: 1, sh: '#76649E', ld: .55 });
  part(S, c => { c.beginPath(); c.ellipse(cx + 2, Y + 63.6, 3.2, 2, -.3, 0, 7); c.fill(); c.beginPath(); c.ellipse(cx + 6.4, Y + 63.6, 3.2, 2, .3, 0, 7); c.fill(); c.fillRect(cx + 3.4, Y + 64.6, 1.6, 8); c.fillRect(cx + 5.6, Y + 64.6, 1.6, 6); }, '#9886CE', { rim: 1, sh: '#76649E', ld: .55 });
  // 双排扣
  [[-4, 46], [4, 46], [-4, 54], [4, 54], [-1, 76], [6, 76]].forEach(([dx, dy]) => { dot(S, cx + dx, Y + dy, '#E8C060'); dot(S, cx + dx + 1, Y + dy + 1, '#9A7A30'); });
  // 白毛领
  part(S, c => { c.beginPath(); c.moveTo(cx - 9.6, Y + 29.6); c.quadraticCurveTo(cx, Y + 27.2, cx + 9.6, Y + 29.6); c.quadraticCurveTo(cx + 12, Y + 34, cx + 8, Y + 38); c.lineTo(cx + 1.6, Y + 47); c.lineTo(cx - 1.6, Y + 47); c.lineTo(cx - 8, Y + 38); c.quadraticCurveTo(cx - 12, Y + 34, cx - 9.6, Y + 29.6); c.fill(); }, '#F4F0EC', { rim: 2, sh: '#D2CCC8', li: '#FFFFFF' });
  dots(S, [[cx - 10, Y + 32], [cx - 9, Y + 36], [cx - 6, Y + 39], [cx + 10, Y + 32], [cx + 9, Y + 36], [cx + 6, Y + 40], [cx - 3, Y + 44], [cx + 2, Y + 45]], '#FFFFFF');
  dots(S, [[cx - 7, Y + 33], [cx - 4, Y + 37], [cx + 7, Y + 34], [cx + 4, Y + 38]], '#DCD6D0');
  // 胳膊：左手拎红色小包，右手自然垂下
  part(S, c => { taper(cx - 15, Y + 40, 7.2, cx - 17.6, Y + 64, 6.2)(c); taper(cx - 17.6, Y + 64, 6.2, cx - 15.6, Y + 84, 5.4)(c); }, CO, { rim: 2, sh: CS, li: CLc });
  part(S, c => { taper(cx + 15, Y + 40, 7.2, cx + 17.8, Y + 64, 6.2)(c); taper(cx + 17.8, Y + 64, 6.2, cx + 16, Y + 86, 5.4)(c); }, CO, { rim: 2, sh: CS, li: CLc });
  part(S, c => { c.lineWidth = 1.4; c.beginPath(); c.moveTo(cx - 19, Y + 92); c.quadraticCurveTo(cx - 15.4, Y + 82, cx - 12, Y + 92); c.stroke(); }, '#8E1828', { shade: false, line: false });
  part(S, c => { c.beginPath(); c.roundRect(cx - 21.4, Y + 91, 12, 9, 2); c.fill(); }, '#C42838', { rim: 2, sh: '#8E1828', li: '#E04A58' });
  dot(S, cx - 15, Y + 94, '#E8C060');
  part(S, elp(cx - 15.4, Y + 87, 2.8, 3.2), GL, { rim: 1, sh: '#8E1828', li: '#E04A58' });
  part(S, elp(cx + 15.8, Y + 89, 2.8, 3.4), GL, { rim: 1, sh: '#8E1828', li: '#E04A58' });
  femaleHead(S, cx, Y, { only: 'front' });
}

/* ---------- 他：日常（黑色短款羽绒服、灰色连帽卫衣、黑色修身牛仔裤、白色球鞋） ---------- */
function maleCasual(S, cx, B) {
  const PF = '#26252E', PFS = '#16151C', PFL = '#464556', HD = '#8C8C9A', JE = '#2C2E3E', JS = '#1E202C', SN = '#EEEEF2';
  maleHead(S, cx, B - 2, { only: 'back' });
  part(S, pth([[cx - 10.6, B + 100], [cx - 1.2, B + 100], [cx - 2.6, B + 184], [cx - 8.4, B + 184]]), JE, { rim: 2, sh: JS });
  part(S, pth([[cx + 1.2, B + 100], [cx + 10.6, B + 100], [cx + 12, B + 184], [cx + 6.2, B + 184]]), JE, { rim: 2, sh: JS });
  dots(S, [[cx - 7, B + 142], [cx - 6, B + 143], [cx - 5, B + 143], [cx + 6, B + 144], [cx + 7, B + 145], [cx + 8, B + 145], [cx - 6, B + 176], [cx - 5, B + 177], [cx + 8, B + 177], [cx + 9, B + 178]], '#3E4256');
  // 白球鞋
  [[-1, cx - 5.4], [1, cx + 9]].forEach(([sd, fx]) => { part(S, c => { c.beginPath(); c.moveTo(fx - 4.4, B + 183); c.lineTo(fx + 3.4, B + 183); c.lineTo(fx + 4 + (sd > 0 ? 3.6 : 0), B + 192); c.lineTo(fx - 5 - (sd < 0 ? 3.6 : 0), B + 192); c.closePath(); c.fill(); }, SN, { rim: 1, sh: '#C8C8D2' }); part(S, pth([[fx - 5.2 - (sd < 0 ? 3.6 : 0), B + 192], [fx + 4.2 + (sd > 0 ? 3.6 : 0), B + 192], [fx + 4.2 + (sd > 0 ? 3.6 : 0), B + 196], [fx - 5.2 - (sd < 0 ? 3.6 : 0), B + 196]]), '#D8D8E0', { rim: 0, line: true }); dots(S, [[fx - 3, B + 190], [fx - 2, B + 189], [fx - 1, B + 189], [fx, B + 188], [fx + 1, B + 188]], '#9A9AA8'); });
  // 卫衣的帽子（从领口后面翻出来）
  part(S, c => { c.beginPath(); c.moveTo(cx - 12.6, B + 30); c.quadraticCurveTo(cx, B + 22.4, cx + 12.6, B + 30); c.lineTo(cx + 11, B + 40); c.lineTo(cx - 11, B + 40); c.closePath(); c.fill(); }, HD, { rim: 2, sh: '#6A6A78', li: '#A8A8B6' });
  // 羽绒服：一格一格鼓起来
  const J = part(S, c => { c.beginPath(); c.moveTo(cx - 9, B + 32); c.lineTo(cx - 16, B + 35); c.quadraticCurveTo(cx - 25, B + 37, cx - 25, B + 46); c.lineTo(cx - 22.6, B + 100); c.lineTo(cx - 21.4, B + 106); c.lineTo(cx + 21.4, B + 106); c.lineTo(cx + 22.6, B + 100); c.lineTo(cx + 25, B + 46); c.quadraticCurveTo(cx + 25, B + 37, cx + 16, B + 35); c.lineTo(cx + 9, B + 32); c.closePath(); c.fill(); }, PF, { rim: 3, sh: PFS, li: PFL });
  for (let k = 0; k < 7; k++) { const yy = B + 48 + k * 8.4; part(S, pth([[cx - 24, yy], [cx + 24, yy], [cx + 24, yy + 1], [cx - 24, yy + 1]]), PFS, { clip: J, pid: J.pid, shade: false }); part(S, pth([[cx - 22, yy - 3.4], [cx + 14, yy - 3.4], [cx + 14, yy - 2.4], [cx - 22, yy - 2.4]]), '#34333E', { clip: J, pid: J.pid, shade: false }); }
  part(S, pth([[cx - 21.6, B + 101], [cx + 21.6, B + 101], [cx + 21.4, B + 106], [cx - 21.4, B + 106]]), '#1E1D24', { rim: 1, ld: .45 });
  // 立领、拉链
  part(S, pth([[cx - 9.6, B + 27], [cx + 9.6, B + 27], [cx + 10.6, B + 38], [cx - 10.6, B + 38]]), PF, { rim: 2, sh: PFS, li: PFL, ld: .5 });
  dots(S, Array.from({ length: 36 }, (_, i) => [cx + (i % 2 ? 0 : 1), B + 28 + i * 2]), '#9A9AA8'); dots(S, [[cx, B + 30], [cx, B + 31], [cx + 1, B + 31]], '#D8D8E4');
  // 袖子：一格一格，手插口袋
  [[-1], [1]].forEach(([sd]) => { const A = part(S, c => { taper(cx + sd * 22, B + 42, 11.4, cx + sd * 25, B + 72, 10.4)(c); taper(cx + sd * 25, B + 72, 10.4, cx + sd * 19, B + 97, 9.4)(c); }, '#2E2D38', { rim: 2, sh: PFS, li: '#55546A', ld: .75 }); for (let k = 0; k < 6; k++) part(S, pth([[cx + sd * 15, B + 52 + k * 8], [cx + sd * 32, B + 52 + k * 8], [cx + sd * 32, B + 53 + k * 8], [cx + sd * 15, B + 53 + k * 8]]), PFS, { clip: A, pid: A.pid, shade: false }); });
  [[-1], [1]].forEach(([sd]) => part(S, pth([[cx + sd * 20.6, B + 84], [cx + sd * 15.6, B + 82], [cx + sd * 14.6, B + 98], [cx + sd * 19.6, B + 99]]), '#1E1D24', { rim: 0, ld: .5 }));
  maleHead(S, cx, B - 2, { only: 'front' });
}
/* ---------- 她：日常（白色毛线帽、白色短款羽绒服、红格子百褶裙、黑丝袜、白色毛毛短靴、红手套） ---------- */
function femaleCasual(S, cx, Y) {
  const WP = '#F2F0F4', WPS = '#C8C4D2', WPL = '#FFFFFF', TI = '#2E2834', TS = '#1E1A24', TL = '#5A4C64', SK = '#C42838';
  femaleHead(S, cx, Y, { only: 'back' });
  // 腿（同一个站姿），白色毛毛短靴
  part(S, c => { taper(cx - 6.6, Y + 84, 9, cx - 6, Y + 138, 6.4)(c); taper(cx - 6, Y + 138, 6.4, cx - 5.4, Y + 168, 4)(c); }, TI, { rim: 2, sh: TS, li: TL });
  part(S, c => { taper(cx + 6.2, Y + 84, 9, cx + 1.8, Y + 138, 6.4)(c); taper(cx + 1.8, Y + 138, 6.4, cx - .6, Y + 168, 4)(c); }, TI, { rim: 2, sh: TS, li: TL });
  dots(S, [[cx - 8, Y + 98], [cx - 8, Y + 106], [cx - 7, Y + 114], [cx - 7, Y + 124], [cx + 4, Y + 100], [cx + 3, Y + 110], [cx + 2, Y + 120], [cx + 1, Y + 130], [cx - 6, Y + 150], [cx, Y + 150]], TL);
  [[cx - 5.6, 0], [cx - .6, 1]].forEach(([fx]) => part(S, c => { c.beginPath(); c.moveTo(fx - 4, Y + 160); c.lineTo(fx + 4, Y + 160); c.lineTo(fx + 3.6, Y + 175.6); c.lineTo(fx - 6.6, Y + 175.6); c.quadraticCurveTo(fx - 7.6, Y + 171, fx - 4.6, Y + 168); c.closePath(); c.fill(); }, '#EAE4DC', { rim: 1, sh: '#C2B8AC', li: '#FFFFFF' }));
  dots(S, [[cx - 9, Y + 161], [cx - 7, Y + 160], [cx - 4, Y + 161], [cx - 2, Y + 160], [cx + 1, Y + 161], [cx + 3, Y + 160]], '#FFFFFF');
  // 红格子百褶裙：高腰，A 字
  const SKm = part(S, pth([[cx - 10.4, Y + 62], [cx + 10.4, Y + 62], [cx + 17.4, Y + 88], [cx - 17.4, Y + 88]]), SK, { rim: 2, sh: '#94182A', li: '#E04A58' });
  for (let k = -3; k <= 3; k++) part(S, pth([[cx + k * 3.2 - .5, Y + 63], [cx + k * 3.2 + .5, Y + 63], [cx + k * 5 + .5, Y + 88], [cx + k * 5 - .5, Y + 88]]), '#94182A', { clip: SKm, pid: SKm.pid, shade: false });
  [[70, '#1E4A34'], [80, '#1E4A34'], [75, '#F2E2C8']].forEach(([yy, col]) => part(S, pth([[cx - 20, Y + yy], [cx + 20, Y + yy], [cx + 20, Y + yy + 1], [cx - 20, Y + yy + 1]]), col, { clip: SKm, pid: SKm.pid, shade: false }));
  for (let k = -2; k <= 2; k++) part(S, pth([[cx + k * 6.4 - .5, Y + 62], [cx + k * 6.4 + .5, Y + 62], [cx + k * 8.8 + .5, Y + 88], [cx + k * 8.8 - .5, Y + 88]]), '#1E4A34', { clip: SKm, pid: SKm.pid, shade: false });
  // 白色短款羽绒服：到腰，鼓鼓的
  const J = part(S, c => { c.beginPath(); c.moveTo(cx - 6, Y + 30); c.lineTo(cx - 12, Y + 33); c.quadraticCurveTo(cx - 18.4, Y + 35, cx - 18, Y + 44); c.lineTo(cx - 15.6, Y + 60); c.quadraticCurveTo(cx - 15.4, Y + 66, cx - 11, Y + 66); c.lineTo(cx + 11, Y + 66); c.quadraticCurveTo(cx + 15.4, Y + 66, cx + 15.6, Y + 60); c.lineTo(cx + 18, Y + 44); c.quadraticCurveTo(cx + 18.4, Y + 35, cx + 12, Y + 33); c.lineTo(cx + 6, Y + 30); c.closePath(); c.fill(); }, WP, { rim: 2, sh: WPS, li: WPL });
  for (let k = 0; k < 3; k++) part(S, pth([[cx - 18, Y + 45 + k * 7.4], [cx + 18, Y + 45 + k * 7.4], [cx + 18, Y + 46 + k * 7.4], [cx - 18, Y + 46 + k * 7.4]]), WPS, { clip: J, pid: J.pid, shade: false });
  part(S, pth([[cx - 7.6, Y + 27.6], [cx + 7.6, Y + 27.6], [cx + 8.6, Y + 36], [cx - 8.6, Y + 36]]), WP, { rim: 1, sh: WPS, li: WPL, ld: .4 });
  dots(S, Array.from({ length: 18 }, (_, i) => [cx, Y + 30 + i * 2]), '#B8B4C4');
  // 胳膊：一只手插兜，一只手拎着小包
  part(S, c => { taper(cx - 15, Y + 40, 9, cx - 18.6, Y + 60, 8.4)(c); taper(cx - 18.6, Y + 60, 8.4, cx - 16, Y + 78, 7.4)(c); }, WP, { rim: 2, sh: WPS, li: WPL });
  part(S, c => { taper(cx + 15, Y + 40, 9, cx + 18.6, Y + 60, 8.4)(c); taper(cx + 18.6, Y + 60, 8.4, cx + 15.4, Y + 80, 7.4)(c); }, WP, { rim: 2, sh: WPS, li: WPL });
  part(S, elp(cx - 15.6, Y + 81, 3, 3.4), '#C42838', { rim: 1, sh: '#8E1828', li: '#E04A58' });
  part(S, elp(cx + 15.2, Y + 83, 3, 3.4), '#C42838', { rim: 1, sh: '#8E1828', li: '#E04A58' });
  part(S, c => { c.lineWidth = 1.2; c.beginPath(); c.moveTo(cx + 13, Y + 82); c.lineTo(cx + 16, Y + 96); c.stroke(); }, '#8A6A4A', { shade: false, line: false });
  part(S, c => { c.beginPath(); c.roundRect(cx + 11.4, Y + 94, 10, 8, 3); c.fill(); }, '#F2E2C8', { rim: 2, sh: '#C8B494' });
  femaleHead(S, cx, Y, { only: 'front', hat: 'beanie' });
}

/* ============ 9a：人物设定（他、她 × 约会、日常） ============ */
function sheetBG(g) {
  vgrad(g, 0, 0, PW, PH, ['#161A34', '#20244A', '#2C2C56']);
  const r = rng(4); for (let i = 0; i < 70; i++) { const x = fl(r() * PW), y = fl(r() * 230); R(g, x, y, 1, 1, r() < .3 ? '#8A90C8' : '#4A5088'); }
  for (let x = 0; x < PW; x += 8) for (let y = 0; y < 240; y += 8) if (((x + y) / 8) % 2 === 0) R(g, x, y, 1, 1, '#262A52');
  R(g, 0, 240, PW, 30, '#1A1C36'); R(g, 0, 240, PW, 1, '#4A4E80');
  // 身高刻度
  for (let k = 0; k <= 10; k++) { const y = 240 - k * 20; R(g, 6, y, k % 5 ? 3 : 6, 1, '#4A4E80'); } R(g, 6, 40, 1, 200, '#3A3E70');
}
FRAMES['9a'] = async (main) => {
  const g = mk(PW, PH); sheetBG(g);
  ptext(g, '人物设定', 18, 8, '#FFE9C8', { s: 1 }); ptext(g, '周杰伦《爱情废柴》', 70, 8, '#8A90C8');
  const put = (fn, x, y) => { const S = SP(80, 216); fn(S); g.drawImage(finishSP(S), x, y); };
  put(S => maleDate(S, 40, 10), 30, 34); put(S => maleCasual(S, 40, 10), 120, 34);
  put(S => femaleDate(S, 40, 29), 250, 34); put(S => femaleCasual(S, 40, 29), 340, 34);
  ptext(g, '甜菜', PW - 8, 8, '#FFFFFF', { align: 'r' });
  compose(main, g, null, { vig: .2 });
  const lab = (x, t1, t2, t3) => { main.save(); main.textAlign = 'center'; main.font = '32px "ZCOOL XiaoWei", sans-serif'; main.fillStyle = '#FFE9C8'; main.fillText(t1, x * 4, 996); main.font = '200 22px "Noto Sans SC", sans-serif'; main.fillStyle = '#B8BEE8'; main.fillText(t2, x * 4, 1030); main.fillText(t3, x * 4, 1058); main.restore(); };
  lab(70, '他 · 约会', '驼色大衣 · 黑高领', '红围巾 · 切尔西靴'); lab(160, '他 · 日常', '黑羽绒服 · 灰卫衣', '修身牛仔裤 · 白球鞋');
  lab(290, '她 · 约会', '收腰大衣 · 白毛领', '贝雷帽 · 过膝长靴'); lab(380, '她 · 日常', '白羽绒服 · 红格子裙', '毛线帽 · 毛毛短靴');
};

/* ============ 脸部特写（同样的造型放大 k 倍；五官用大模板重新点） ============ */
const TK = (cx, Y, k, fn) => c => { c.translate(cx, Y); c.scale(k, k); fn(c); };
const EYE_M = [ // 他的左眼（外眼角在左），14×8
  '...KKKKKK.....',
  'KKKKKKKKKKKK..',
  '.KKDDDDDDKKKK.',
  '..WDDHHDDDWWKp',
  '..WDDHDDDDWWW.',
  '...WIIIIIW....',
  '....lIIIl.....',
  '.....lll......'];
const BROW_M = ['....bBBBBBBB...', 'bBBBBBBBBBBBBB.', '.......BBBBBBBB'];
const EYE_F = [ // 她的左眼，15×10
  'K..............',
  '.KK.KKKKKK.....',
  '..KKKKKKKKKKK..',
  '..KKDDDDDDDKKK.',
  '..WDDHHDDDDWWKp',
  '.WDDDHDDDDDDW..',
  '.WIDDDDDDDDIW..',
  '..WIIIIIIIIW...',
  '..llIIIIIll....',
  '..l..lll.......'];
const BROW_F = ['.....bbbbbb....', '..bBBBBBBBBBb..', '.bB..........b.'];
function maleBust(S, cx, Y, k, o = {}) {
  const HAIR = '#2A2236', HS = '#17121F', HL = '#43395A', COAT = '#A87448', CS = '#7C5030', CL = '#C89262', TN = '#24232C', SC = '#C42838';
  // 后脑勺
  part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(-10.6, 19); c.bezierCurveTo(-12.6, 6, -9, -6, 0, -6.4); c.bezierCurveTo(9, -6, 12.6, 6, 10.8, 19); c.closePath(); c.fill(); }), HAIR, { rim: 4, sh: HS, li: HL });
  // 肩膀：大衣、黑高领、红围巾
  part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(-7, 32); c.lineTo(-15, 35); c.lineTo(-23.4, 39.4); c.lineTo(-27, 80); c.lineTo(27, 80); c.lineTo(23.4, 39.4); c.lineTo(15, 35); c.lineTo(7, 32); c.closePath(); c.fill(); }), COAT, { rim: 5, sh: CS, li: CL });
  part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(-9.6, 34); c.lineTo(9.6, 34); c.lineTo(10.6, 80); c.lineTo(-10.6, 80); c.closePath(); c.fill(); }), TN, { rim: 3, li: '#34323E' });
  part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(-7, 32); c.lineTo(-13.6, 37); c.lineTo(-12.6, 41.6); c.lineTo(-15.4, 42.8); c.lineTo(-10, 64); c.lineTo(-6, 80); c.lineTo(-7.4, 56); c.closePath(); c.fill(); }), CL, { rim: 2, sh: COAT, li: '#DDAA78', ld: .6 });
  part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(7, 32); c.lineTo(13.6, 37); c.lineTo(12.6, 41.6); c.lineTo(15.4, 42.8); c.lineTo(10, 64); c.lineTo(6, 80); c.lineTo(7.4, 56); c.closePath(); c.fill(); }), COAT, { rim: 2, sh: CS, li: CL, ld: .6 });
  const neck = part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(-4.2, 22); c.lineTo(4.2, 22); c.lineTo(4.4, 34); c.lineTo(-4.4, 34); c.closePath(); c.fill(); }), SKIN.b, { rim: 4, sh: SKIN.s, line: false });
  part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(-4.2, 22); c.lineTo(4.2, 22); c.lineTo(4.2, 28); c.lineTo(0, 30.6); c.lineTo(-4.2, 28); c.closePath(); c.fill(); }), SKIN.s, { clip: neck, pid: neck.pid, shade: false });
  const scf = part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(-8.6, 27.6); c.lineTo(8.6, 27.6); c.lineTo(10.8, 35.6); c.lineTo(4, 39.6); c.lineTo(-4, 39.6); c.lineTo(-10.8, 35.6); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-6.8, 35); c.lineTo(-1, 35); c.lineTo(-1.8, 80); c.lineTo(-7.8, 80); c.closePath(); c.fill(); }), SC, { rim: 4, sh: '#8E1828', li: '#E04A58' });
  for (let i = 0; i < 40; i++) for (let j = 0; j < 30; j++) if ((i + j * 3) % 6 === 0) dot(S, cx - 30 + i * 1.5, Y + 28 * k + j * 3, '#A41C2E', scf);
  // 耳朵、脸
  [-1, 1].forEach(sd => part(S, TK(cx, Y, k, elp(sd * 9.4, 16.4, 1.8, 3)), SKIN.b, { rim: sd > 0 ? 3 : 0, sh: SKIN.s }));
  const face = part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(-9.2, 10); c.bezierCurveTo(-9.8, 15, -9.4, 19, -8.2, 21.5); c.lineTo(-6.2, 24.8); c.lineTo(-2.6, 27.8); c.quadraticCurveTo(0, 28.8, 2.6, 27.8); c.lineTo(6.2, 24.8); c.lineTo(8.2, 21.5); c.bezierCurveTo(9.4, 19, 9.8, 15, 9.2, 10); c.bezierCurveTo(8.6, 1, -8.6, 1, -9.2, 10); c.fill(); }), SKIN.b, { rim: 4, sh: SKIN.s, li: SKIN.l });
  // 颧骨下、下颌的影
  part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(8.6, 15); c.bezierCurveTo(7, 19, 6.4, 22, 4, 25.6); c.lineTo(6.2, 24.8); c.lineTo(8.2, 21.5); c.closePath(); c.fill(); }), SKIN.s, { clip: face, pid: face.pid, shade: false });
  const ey = Y + 14 * k, E = o.eyes || 'n';
  [-1, 1].forEach(sd => { const ex = sd < 0 ? cx - 8.4 * k : cx + 8.4 * k - 14;
    tpl(S, Math.round(sd < 0 ? cx - 8.6 * k : cx + 8.6 * k - 15), Math.round(Y + 10.4 * k), BROW_M, { B: '#241C2C', b: '#4A3E52' }, face, sd > 0);
    if (E === 'smile') tpl(S, Math.round(ex), Math.round(ey + 2), ['..KKKKKKKK....', '.KK......KKK..', 'K..........KK.'], { K: '#16101A' }, face, sd > 0);
    else tpl(S, Math.round(ex), Math.round(ey), EYE_M, { K: '#16101A', D: '#231E33', I: '#4A4568', H: '#E8E6F8', W: '#EFE8E4', l: '#D2A090', p: '#E4A49C' }, face, sd > 0);
  });
  // 鼻子：鼻梁在暗的一侧一条影，鼻底一道
  for (let j = 0; j < 12; j++) dot(S, cx + 3, ey + 4 + j, SKIN.s, face);
  dots(S, [[cx - 3, ey + 16], [cx - 2, ey + 17], [cx - 1, ey + 17], [cx, ey + 17], [cx + 1, ey + 17], [cx + 2, ey + 17], [cx + 3, ey + 16], [cx + 4, ey + 15]], SKIN.s, face);
  dots(S, [[cx - 2, ey + 16], [cx + 2, ey + 16]], SKIN.d, face); dots(S, [[cx, ey + 14], [cx - 1, ey + 14]], SKIN.l, face);
  // 嘴
  const my = Math.round(Y + 23.6 * k);
  if (o.mouth === 'smirk') tpl(S, cx - 6, my, ['M..........', '.MMMMMMMMM.', '..LLLLLLL.M', '...sssss...'], { M: '#9A5452', L: '#D49088', s: SKIN.s }, face);
  else tpl(S, cx - 5, my, ['.MMMMMMMM.', 'M.LLLLLL.M', '..LLhLLL..', '...ssss...'], { M: '#9A5452', L: '#D49088', h: '#EEC0B0', s: SKIN.s }, face);
  dots(S, [[cx - 1, my + 6], [cx, my + 6], [cx + 1, my + 6]], SKIN.s, face);
  // 头发：同一个造型放大，再加几层发丝
  part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(-10.4, 16); c.lineTo(-11, 6); c.bezierCurveTo(-11, -1, -8, -5.4, -2, -6.6); c.bezierCurveTo(5, -7.4, 11, -3.6, 11.8, 3); c.lineTo(11.4, 12); c.lineTo(10.6, 17.4); c.lineTo(9.4, 12.4); c.lineTo(7.4, 9.6); c.lineTo(6.2, 14.4); c.lineTo(3.8, 8.8); c.lineTo(1.6, 11.4); c.lineTo(-.4, 6.8); c.lineTo(-2.8, 8.2); c.lineTo(-4.4, 3.2); c.quadraticCurveTo(-7, 4, -8.6, 9.4); c.closePath(); c.fill(); }), HAIR, { rim: 4, sh: HS, li: HL, ld: .6 });
  const hs = (pts, col, w = 1.2) => part(S, TK(cx, Y, k, c => { c.lineWidth = w; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); }), col, { shade: false, line: false, keepId: true });
  hs([[-7.6, -2.6], [-3, -5.2], [3, -5.4], [8, -2.6]], '#5E5480', .9); hs([[-5, 0], [0, -1.6], [5, 1.4], [8.8, 6.4]], '#4E4670', .7);
  hs([[-1.4, 2], [2.4, 5], [5, 10]], HS, .5); hs([[3, 1], [6.6, 5], [8.4, 9.6]], HS, .5); hs([[-6, 2], [-7.6, 6]], HS, .5); hs([[-3, -3.6], [1, -3.8], [6, -1.6]], '#7A70A0', .4);
  return face;
}
function femaleBust(S, cx, Y, k, o = {}) {
  const HAIR = '#5A3428', HS = '#3A2018', HL = '#8A5A44', CO = '#B2A0E0', CS = '#8A78C0';
  part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(-9.6, 4); c.bezierCurveTo(-13, 14, -12, 30, -15.6, 46); c.bezierCurveTo(-17, 56, -13, 64, -16, 72); c.lineTo(16.4, 72); c.bezierCurveTo(13.6, 64, 18, 56, 16, 46); c.bezierCurveTo(12.6, 30, 13.4, 14, 10, 4); c.bezierCurveTo(7, -3.6, -7, -3.6, -9.6, 4); c.fill(); }), HAIR, { rim: 4, sh: HS, li: HL });
  part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(-5, 30); c.lineTo(-11, 33.6); c.lineTo(-15.4, 37); c.lineTo(-16, 42); c.lineTo(-14.4, 52); c.lineTo(-10.2, 63); c.lineTo(-12, 80); c.lineTo(12, 80); c.lineTo(10.2, 63); c.lineTo(14.4, 52); c.lineTo(16, 42); c.lineTo(15.4, 37); c.lineTo(11, 33.6); c.lineTo(5, 30); c.closePath(); c.fill(); }), CO, { rim: 5, sh: CS, li: '#CEC2F2' });
  const neck = part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(-3.2, 22); c.lineTo(3.2, 22); c.lineTo(3.4, 32); c.lineTo(-3.4, 32); c.closePath(); c.fill(); }), SKIN.b, { rim: 3, sh: SKIN.s, line: false });
  part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(-3.2, 22); c.lineTo(3.2, 22); c.lineTo(3.2, 27); c.lineTo(0, 29); c.lineTo(-3.2, 27); c.closePath(); c.fill(); }), SKIN.s, { clip: neck, pid: neck.pid, shade: false });
  part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(-9.6, 29.6); c.quadraticCurveTo(0, 27.2, 9.6, 29.6); c.quadraticCurveTo(12, 34, 8, 38); c.lineTo(1.6, 47); c.lineTo(-1.6, 47); c.lineTo(-8, 38); c.quadraticCurveTo(-12, 34, -9.6, 29.6); c.fill(); }), '#F4F0EC', { rim: 4, sh: '#D2CCC8', li: '#FFFFFF' });
  const rr = rng(3); for (let i = 0; i < 60; i++) { const a = rr() * 6.28, d = 9 + rr() * 2; dot(S, cx + Math.cos(a) * d * k * .95, Y + 33 * k + Math.sin(a) * 4 * k, rr() < .5 ? '#FFFFFF' : '#D8D2CC'); }
  const face = part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(-8.6, 10); c.bezierCurveTo(-9, 15, -8.4, 19, -6.6, 21.8); c.bezierCurveTo(-4.8, 24.4, -2.6, 26, 0, 26.4); c.bezierCurveTo(2.6, 26, 4.8, 24.4, 6.6, 21.8); c.bezierCurveTo(8.4, 19, 9, 15, 8.6, 10); c.bezierCurveTo(8, 1.6, -8, 1.6, -8.6, 10); c.fill(); }), SKIN.b, { rim: 3, sh: SKIN.s, li: SKIN.l });
  const ey = Math.round(Y + 12.2 * k), E = o.eyes || 'n';
  [-1, 1].forEach(sd => { const ex = Math.round(sd < 0 ? cx - 8.2 * k : cx + 8.2 * k - 15);
    tpl(S, Math.round(sd < 0 ? cx - 8 * k : cx + 8 * k - 15), Math.round(Y + 9 * k), BROW_F, { B: '#6A3E30', b: '#9A6A56' }, face, sd > 0);
    tpl(S, ex + 2, ey - 3, ['...ccccccc...'], { c: SKIN.s }, face, sd > 0);
    if (E === 'smile') tpl(S, ex, ey + 3, ['K.....KKKKK....', '.KKKKK....KKK..', '...........KK..'], { K: '#1E1218' }, face, sd > 0);
    else tpl(S, ex, ey, EYE_F, { K: '#1E1218', D: '#3A1E22', I: '#8A5040', H: '#FFFFFF', W: '#F4ECEA', l: '#C89488', p: '#EAA4A0' }, face, sd > 0);
    // 腮红（点状）
    for (let j = 0; j < 3; j++) for (let i = 0; i < 6; i++) if ((i + j) % 2 === 0) dot(S, Math.round(cx + sd * 6.4 * k) - 3 + i, ey + 11 + j, '#F2A4A2', face);
  });
  for (let j = 0; j < 6; j++) dot(S, cx + 2, ey + 6 + j, SKIN.s, face);
  dots(S, [[cx - 1, ey + 13], [cx, ey + 13], [cx + 1, ey + 13], [cx + 2, ey + 12]], SKIN.s, face); dot(S, cx, ey + 11, SKIN.l, face);
  const my = Math.round(Y + 21 * k);
  if (o.mouth === 'smile') tpl(S, cx - 5, my, ['.RR...RR.', 'RRRRRRRRR', '.DLLLLLD.', '..LLhLL..'], { R: '#C84458', D: '#9A2A3A', L: '#E8707C', h: '#F8B0B4' }, face);
  else tpl(S, cx - 4, my, ['.RR.RR.', 'RRRRRRR', 'DDDDDDD', '.LLhLL.', '..LLL..'], { R: '#C84458', D: '#9A2A3A', L: '#E2707C', h: '#F8B0B4' }, face);
  // 刘海、搭在前面的一缕
  part(S, TK(cx, Y, k, c => { c.beginPath(); c.moveTo(-1.6, -1.4); c.bezierCurveTo(-5, 1, -7.6, 6, -8.4, 14); c.lineTo(-9.8, 15); c.bezierCurveTo(-10.4, 6, -7, -2.6, -1.6, -2.6); c.closePath(); c.fill(); c.beginPath(); c.moveTo(-1.6, -1.4); c.bezierCurveTo(3, 1, 7.4, 6, 8.6, 14.6); c.lineTo(10.2, 15); c.bezierCurveTo(10.6, 6, 6, -2.6, -1.6, -2.6); c.closePath(); c.fill(); c.beginPath(); c.moveTo(8.4, 12); c.bezierCurveTo(11, 24, 9, 34, 12.6, 44); c.bezierCurveTo(15.6, 52, 11, 58, 13.6, 64); c.lineTo(10, 62); c.bezierCurveTo(9, 56, 12, 50, 9.4, 44); c.bezierCurveTo(6.4, 34, 9, 24, 7.4, 14); c.closePath(); c.fill(); }), HAIR, { rim: 3, sh: HS, li: HL, ld: .55 });
  const hs = (pts, col, w = .5) => part(S, TK(cx, Y, k, c => { c.lineWidth = w; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1])); c.stroke(); }), col, { shade: false, line: false, keepId: true });
  hs([[-2.4, -1], [-6, 3], [-8, 10]], HL, .6); hs([[0, -1], [4.6, 2.6], [7.6, 9]], HL, .6); hs([[8.6, 16], [9.6, 26], [10.4, 34], [12, 42]], HL, .6); hs([[-11, 14], [-11.6, 26], [-13.4, 40]], HL, .6); hs([[-4, 0], [-7, 6]], HS, .4); hs([[3, 1], [6.4, 7]], HS, .4);
  // 耳钉
  dot(S, Math.round(cx - 9 * k), Math.round(Y + 19 * k), '#F0D070'); dot(S, Math.round(cx - 9 * k), Math.round(Y + 19 * k) + 1, '#A88A30');
  // 贝雷帽
  part(S, TK(cx, Y, k, c => { c.save(); c.translate(2.6, 1.6); c.rotate(-.14); c.beginPath(); c.ellipse(0, 0, 12, 4.6, 0, 0, 7); c.fill(); c.beginPath(); c.ellipse(-.6, -2.2, 10.4, 4.6, 0, 0, 7); c.fill(); c.restore(); c.fillRect(1.4, -7.4, 1.6, 2.6); }), '#F2EEE8', { rim: 4, sh: '#C8C2BC', li: '#FFFFFF' });
  for (let i = 0; i < 24; i++) { const t = i / 23; dot(S, Math.round(cx + (-8 + t * 20) * k), Math.round(Y + (3.2 - t * 1.8) * k + (i % 2)), '#D8D2CC'); }
  return face;
}
/* ============ 9b：脸部特写 ============ */
FRAMES['9b'] = async (main) => {
  const g = mk(PW, PH); sheetBG(g);
  [[16, '他'], [252, '她']].forEach(([x, t]) => { R(g, x, 24, 212, 214, '#1C1F40'); R(g, x, 24, 212, 1, '#4A4E80'); R(g, x, 237, 212, 1, '#4A4E80'); R(g, x, 24, 1, 214, '#4A4E80'); R(g, x + 211, 24, 1, 214, '#4A4E80'); });
  const M = SP(210, 212); maleBust(M, 105, 52, 2.7, { mouth: 'smirk' }); g.drawImage(finishSP(M, { outline: false }), 17, 25);
  const F = SP(210, 212); femaleBust(F, 105, 60, 2.7, { mouth: 'smile' }); g.drawImage(finishSP(F, { outline: false }), 253, 25);
  ptext(g, '脸部特写', 18, 8, '#FFE9C8'); ptext(g, '甜菜', PW - 8, 8, '#FFFFFF', { align: 'r' });
  compose(main, g, null, { vig: .2 });
};

/* ============ 9c：两人同框（雪夜，咖啡店的橱窗前） ============ */
FRAMES['9c'] = async (main) => {
  const g = mk(PW, PH), G = mk(PW, PH), GY = 236;
  vgrad(g, 0, 0, PW, GY, ['#0C1030', '#161C46', '#222656']);
  // 咖啡店的墙和大橱窗
  R(g, 0, 20, PW, GY - 20, '#2E2238'); for (let y = 24; y < GY; y += 6) for (let x = ((y / 6) % 2) * 9; x < PW; x += 18) R(g, x, y, 17, 5, '#36283F');
  const win = (x, y, w, h) => { R(g, x - 4, y - 4, w + 8, h + 8, '#1A1018'); vgrad(g, x, y, w, h, ['#FFD88A', '#F0A858', '#C8783A']); R(G, x, y, w, h, '#9A6020');
    const r = rng(x); for (let i = 0; i < 14; i++) { const bx = x + r() * w, by = y + r() * h, rr = 4 + r() * 9; soft(g, bx, by, rr, ['#FFF4D0', '#FFB060', '#FF8A6A'][i % 3], .5); }
    for (let i = 0; i < 4; i++) { const px = x + 12 + i * (w - 24) / 3; mini(g, Math.round(px), y + h - 6, { sil: '#7A3A20' }); }
    R(g, x, y + h * .55, w, 2, '#1A1018'); for (let k = 1; k < 3; k++) R(g, x + Math.round(w * k / 3), y, 2, h, '#1A1018');
    field(g, x, y, w, h, '#E8F0FF', (px, py) => { const d = Math.min(px - x, py - y, x + w - px, y + h - py); return d < 8 ? .45 * (1 - d / 8) : 0; }); };
  win(18, 70, 150, 120); win(314, 70, 150, 120);
  // 门、花环
  R(g, 196, 60, 88, 176, '#1A1018'); R(g, 200, 64, 80, 172, '#5A2A30'); R(g, 208, 74, 64, 70, '#FFC870'); R(G, 208, 74, 64, 70, '#8A5A20'); R(g, 239, 74, 2, 70, '#5A2A30');
  disc(g, 240, 104, 18, '#2E6E4A'); disc(g, 240, 104, 11, '#5A2A30'); disc(g, 240, 104, 10, '#FFC870'); for (let i = 0; i < 12; i++) { const a = i / 12 * 6.283; R(g, 240 + Math.cos(a) * 15, 104 + Math.sin(a) * 15, 2, 2, BULBS[i % 5]); soft(G, 240 + Math.cos(a) * 15, 104 + Math.sin(a) * 15, 4, BULBS[i % 5], .8); } R(g, 236, 118, 8, 4, '#C42838');
  // 招牌、灯串
  R(g, 150, 30, 180, 22, '#1A1018'); R(g, 152, 32, 176, 18, '#3A2A1E'); ptext(g, '咖啡 · 圣诞夜', 240, 35, '#FFE29A', { align: 'c' }); ptext(G, '咖啡 · 圣诞夜', 240, 35, '#8A6020', { align: 'c' });
  lights(g, G, -4, 58, 196, 64, 12, 7, 2, '#120A14'); lights(g, G, 284, 64, 484, 58, 12, 7, 4, '#120A14');
  // 路灯
  R(g, 452, 40, 4, 196, '#141018'); R(g, 444, 30, 20, 12, '#141018'); R(g, 447, 32, 14, 9, '#FFE9A8'); soft(G, 454, 36, 30, '#FFC060', 1); soft(G, 454, 36, 10, '#FFFFFF', 1);
  field(g, 380, 42, 150, 196, '#FFE0A0', (x, y) => { const t = (y - 42) / 194, d = Math.abs(x - 454) / (6 + t * 60); return d > 1 ? 0 : .16 * (1 - d) * (1 - t * .3); });
  // 地面、积雪
  vgrad(g, 0, GY, PW, PH - GY, ['#9AA8D8', '#C8D2EE', '#E8EEFA']); for (let x = 0; x < PW; x++) R(g, x, GY - 2 + Math.round(Math.sin(x / 9) * 1), 1, 3, '#E8EEFA');
  field(g, 0, GY, PW, 34, '#FFD9A0', (x, y) => { const inW = (x > 14 && x < 172) || (x > 310 && x < 468) || (x > 200 && x < 280); return inW ? .35 * (1 - (y - GY) / 34) : 0; });
  // 两个人
  const M = SP(80, 216); maleDate(M, 40, 10); const F = SP(80, 216); femaleDate(F, 40, 29);
  ell(g, 200, 262, 26, 3, '#7A88B8', .6); ell(g, 266, 262, 22, 3, '#7A88B8', .6);
  g.drawImage(finishSP(M), 160, 54); g.drawImage(finishSP(F), 226, 56);
  // 雪
  snow(g, 3, 160, 1, '#FFFFFF', 1, [0, 0, PW, 240]); snow(g, 4, 50, 2, '#FFFFFF', 1, [0, 0, PW, 250]);
  ptext(g, '甜菜', PW - 8, 8, '#FFFFFF', { align: 'r', ol: '#0A0E24' });
  compose(main, g, G, { vig: .45, g1: .7, g2: .5 });
};
