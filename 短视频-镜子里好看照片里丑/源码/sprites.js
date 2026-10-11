'use strict';
/* sprites.js：像素图的工具，以及本片自己画的角色——
   "你"：头发偏分（发旋在左）、右边脸上一颗痣、笑起来左边嘴角高一点、右边别着星星发卡；
   脸故意画得不对称，镜子里（左右翻转）和照片里（原版）一眼就能看出不一样。
   另外两个朋友是换了发型、发色和衣服的同款小人。
   约定：不翻转的画法就是"原版"（照片、别人眼里的你），flip = true 是"镜像版"（镜子里的你）。 */

/* 字符画 → 画布。pal：字符 → 颜色；'.' 与空格透明 */
function sprite(rows, pal) {
  const w = Math.max(...rows.map(r => r.length)), h = rows.length, c = mk(w, h), g = c.getContext('2d');
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const col = pal[r[i]]; if (col) { g.fillStyle = col; g.fillRect(i, j, 1, 1); } } });
  return c;
}
const SPR = {};
function spr(name, rows, pal) { if (!SPR[name]) SPR[name] = sprite(rows, pal); return SPR[name]; }
function shadeOf(hex, k) { // k<1 变暗，k>1 变亮
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g2 = (n >> 8) & 255, b = n & 255;
  const f = v => Math.max(0, Math.min(255, Math.round(k < 1 ? v * k : v + (255 - v) * (k - 1))));
  return '#' + [f(r), f(g2), f(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}
function mixHex(a, b, u) {
  const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
  const ch = s => [(s >> 16) & 255, (s >> 8) & 255, s & 255];
  const [r1, g1, b1] = ch(pa), [r2, g2, b2] = ch(pb);
  const f = (x, y) => Math.round(x + (y - x) * clamp(u)).toString(16).padStart(2, '0');
  return '#' + f(r1, r2) + f(g1, g2) + f(b1, b2);
}
const PAL = {
  k: '#1B1730', w: '#FFFFFF', W: '#F2F2F2', g: '#9AA1AD', G: '#6B7180', y: '#FFD84A', Y: '#E8B92E', o: '#FF8A3D',
  r: '#E5322D', R: '#A81E1A', b: '#5EC8FF', B: '#2F7FC1', n: '#8A5A35', N: '#5E3B22', s: '#C9D3DE', S: '#8FA3B8', p: '#F2A0A0',
};

/* ================= 角色的配色 ================= */
const SKIN = { base: '#F6CFA8', shade: '#E6AE86', light: '#FCE3C8', line: '#B9785A' };
const LOOKS = {
  you: { hair: '#3A2840', hairHi: '#5E4466', shirt: '#5EC8FF', clip: true, mole: true, part: 'left' },
  friendA: { hair: '#8A5230', hairHi: '#B07448', shirt: '#FF8A7A', clip: false, mole: false, part: 'mid', bob: true },
  friendB: { hair: '#2A3A5A', hairHi: '#4A6088', shirt: '#7DBB57', clip: false, mole: false, part: 'right', glasses: true },
};

/* ================= 大脸（特写用）：48×48 =================
   expr：'smile' 微笑、'happy' 眯眼笑、'flat' 抿嘴、'sad' 不开心、'shock' 吃惊、'frozen' 半眨眼半张嘴（定格的瞬间）、'blink' 闭眼 */
const FACE_CACHE = {};
function faceCanvas(o = {}) {
  const L = LOOKS[o.who || 'you'], expr = o.expr || 'smile';
  const key = (o.who || 'you') + '|' + expr + '|' + (o.blush ? 1 : 0);
  if (FACE_CACHE[key]) return FACE_CACHE[key];
  const c = mk(48, 48), g = c.getContext('2d');
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(x, y, w, h); };
  // 肩膀和脖子
  P(19, 41, 10, 5, SKIN.shade); P(9, 44, 30, 4, L.shirt); P(7, 46, 34, 2, L.shirt); P(20, 44, 8, 1, shadeOf(L.shirt, .8));
  // 后面的头发
  pell(g, 24, 24, 19, 19, L.hair);
  if (L.bob) pell(g, 24, 30, 20, 13, L.hair);
  // 脸
  pell(g, 24, 28, 16, 17, SKIN.base);
  for (let y = 30; y < 45; y++) { const hw = Math.round(16 * Math.sqrt(Math.max(0, 1 - ((y - 28) / 17) ** 2))); P(24 + hw - 1, y, 1, 1, SKIN.shade); }
  P(17, 45, 14, 1, SKIN.shade);
  // 前面的头发：偏分，发旋在左边；右边的刘海扫下来盖住一块额头
  const part = L.part === 'left' ? 18 : L.part === 'right' ? 30 : 24;
  for (let x = 6; x <= 42; x++) {
    let yb;
    if (x <= part) yb = 14 + Math.round((part - x) * .28);
    else yb = 13 + Math.round((x - part) * (L.part === 'mid' ? .28 : .42));
    yb = Math.min(yb, 24);
    const top = 6 + Math.round(Math.abs(x - 24) * Math.abs(x - 24) / 40);
    P(x, top, 1, yb - top, L.hair);
    if ((x + yb) % 5 === 0 && x > 8 && x < 40) P(x, yb, 1, 1, L.hair);     // 发梢
  }
  // 两侧鬓角
  P(6, 18, 4, 16, L.hair); P(38, 18, 4, 16, L.hair); P(7, 34, 2, 3, L.hair); P(39, 34, 2, 3, L.hair);
  // 发旋：一道露出头皮的缝
  P(part, 6, 1, 6, SKIN.light);
  // 高光
  for (let i = 0; i < 6; i++) P(part + 4 + i * 2, 9 + Math.round(i * .6), 2, 1, L.hairHi);
  for (let i = 0; i < 3; i++) P(part - 4 - i * 2, 9 + i, 2, 1, L.hairHi);
  // 星星发卡（右边）
  if (L.clip) {
    const cx = 35, cy = 15;
    P(cx, cy - 2, 1, 5, '#FFD34E'); P(cx - 2, cy, 5, 1, '#FFD34E'); P(cx - 1, cy - 1, 3, 3, '#FFD34E'); P(cx, cy, 1, 1, '#FFF3B0');
    P(cx - 1, cy + 2, 1, 1, '#C99A1A'); P(cx + 1, cy + 2, 1, 1, '#C99A1A');
  }
  // 眉毛
  const brow = shadeOf(L.hair, 1.05);
  if (expr === 'sad') { P(14, 24, 4, 1, brow); P(13, 23, 1, 1, brow); P(30, 24, 4, 1, brow); P(34, 23, 1, 1, brow); }
  else if (expr === 'shock') { P(14, 22, 4, 1, brow); P(30, 22, 4, 1, brow); }
  else { P(14, 24, 4, 1, brow); P(13, 25, 1, 1, brow); P(30, 24, 4, 1, brow); P(34, 25, 1, 1, brow); }
  // 眼睛
  const EYE = '#2B2030';
  const eyes = [16, 31];
  for (const ex of eyes) {
    if (expr === 'happy') { P(ex - 1, 29, 1, 1, EYE); P(ex, 28, 2, 1, EYE); P(ex + 2, 29, 1, 1, EYE); }
    else if (expr === 'blink') P(ex - 1, 29, 4, 1, EYE);
    else if (expr === 'shock') { P(ex - 1, 26, 4, 5, EYE); P(ex - 1, 26, 1, 1, '#FFFFFF'); P(ex, 27, 1, 1, '#FFFFFF'); }
    else {
      P(ex - 1, 27, 3, 4, EYE); P(ex - 1, 27, 1, 1, '#FFFFFF');
      if (expr === 'frozen' && ex === 31) { P(ex - 1, 27, 3, 2, SKIN.shade); P(ex - 1, 29, 3, 1, EYE); }   // 定格：一只眼正好眨到一半
    }
    if (L.glasses) { P(ex - 3, 25, 8, 1, '#2B2547'); P(ex - 3, 32, 8, 1, '#2B2547'); P(ex - 3, 25, 1, 8, '#2B2547'); P(ex + 4, 25, 1, 8, '#2B2547'); }
  }
  if (L.glasses) P(20, 27, 8, 1, '#2B2547');
  // 鼻子
  P(24, 32, 1, 3, SKIN.shade); P(22, 35, 1, 1, SKIN.shade); P(23, 35, 3, 1, SKIN.line); P(26, 35, 1, 1, SKIN.shade);
  // 嘴：笑起来左边嘴角高一点
  const M = '#A8434E';
  if (expr === 'smile' || expr === 'happy') {
    P(20, 38, 9, 1, M); P(19, 37, 1, 1, M); P(29, 38, 1, 1, M); P(21, 39, 7, 1, M);
    P(21, 38, 7, 1, '#FFFFFF'); P(22, 39, 5, 1, '#E86A78');
  } else if (expr === 'flat') { P(21, 38, 7, 1, M); P(20, 37, 1, 1, M); }
  else if (expr === 'sad') { P(21, 38, 7, 1, M); P(20, 39, 1, 1, M); P(28, 39, 1, 1, M); }
  else if (expr === 'shock') { P(23, 37, 3, 1, M); P(22, 38, 1, 2, M); P(26, 38, 1, 2, M); P(23, 40, 3, 1, M); P(23, 38, 3, 2, '#5A1E2A'); }
  else if (expr === 'frozen') { P(20, 37, 1, 1, M); P(21, 38, 6, 1, M); P(22, 39, 4, 1, '#5A1E2A'); P(27, 39, 2, 1, M); }
  else if (expr === 'blink') { P(20, 38, 9, 1, M); P(19, 37, 1, 1, M); }
  // 腮红和痣（痣在右脸）
  if (o.blush !== false) { P(11, 34, 3, 1, '#F4A0A0'); P(31, 34, 3, 1, '#F4A0A0'); }
  if (L.mole) { P(35, 36, 1, 1, '#5A3A30'); }
  FACE_CACHE[key] = c;
  return c;
}
/* 把大脸贴到屏幕上：(cx, cy) 为中心，k 为每个像素的大小；flip：镜像版 */
function drawFace(g, cx, cy, k, o = {}) {
  let c = faceCanvas(o);
  if (o.warp) c = warpFace(c, o.warp);
  g.save(); g.imageSmoothingEnabled = false;
  g.translate(Math.round(cx), Math.round(cy));
  if (o.flip) g.scale(-1, 1);
  if (o.squash !== undefined) g.scale(o.squash, 1);
  g.drawImage(c, -24 * k, -24 * k, 48 * k, 48 * k);
  g.restore();
}
/* 近距离自拍的变形：以鼻子为中心往外放大，a 是放大的程度（0..0.35） */
const WARP_BUF = mk(48, 48);
function warpFace(src, a) {
  const sg = src.getContext('2d'), d = sg.getImageData(0, 0, 48, 48).data;
  const wg = WARP_BUF.getContext('2d'), out = wg.createImageData(48, 48), od = out.data;
  const cx = 24, cy = 31, s2 = 15 * 15;
  for (let y = 0; y < 48; y++) for (let x = 0; x < 48; x++) {
    const dx = x + .5 - cx, dy = y + .5 - cy, f = 1 - a * Math.exp(-(dx * dx + dy * dy) / s2);
    const sx = Math.floor(cx + dx * f), sy = Math.floor(cy + dy * f);
    if (sx < 0 || sy < 0 || sx > 47 || sy > 47) continue;
    const i = (y * 48 + x) * 4, j = (sy * 48 + sx) * 4;
    od[i] = d[j]; od[i + 1] = d[j + 1]; od[i + 2] = d[j + 2]; od[i + 3] = d[j + 3];
  }
  wg.putImageData(out, 0, 0);
  return WARP_BUF;
}

/* ================= 小人（全身，场景里用）：约 20×32 =================
   (x, y) 为左上角（世界坐标）；o.who 换人；o.flip 镜像；o.expr；o.arms：'down' | 'phone'（举着手机看）| 'selfie'（伸直手臂自拍）| 'wave' | 'up' */
function drawChibi(g, x, y, t, o = {}) {
  const L = LOOKS[o.who || 'you'];
  x = ri(x); y = ri(y);
  g.save();
  if (o.flip) { g.translate(x * 2 + 20, 0); g.scale(-1, 1); }
  const P = (px, py, w, h, col) => { g.fillStyle = col; g.fillRect(x + px, y + py, w, h); };
  const bob = o.still ? 0 : (Math.floor(t * 3 + (o.seed || 0)) % 2);
  // 腿和鞋
  const pants = '#3B3363';
  P(6, 26, 3, 5, pants); P(11, 26, 3, 5, pants); P(5, 31, 4, 1, '#22202A'); P(11, 31, 4, 1, '#22202A');
  // 身体
  const sh = L.shirt;
  P(4, 18 + bob, 12, 9, sh); P(5, 17 + bob, 10, 1, sh); P(4, 26, 12, 1, shadeOf(sh, .8)); P(9, 18 + bob, 2, 2, SKIN.base);
  // 手臂
  const arms = o.arms || 'down';
  const A = (side, mode) => {
    const ax = side < 0 ? 2 : 16;
    if (mode === 'down') { P(ax, 19 + bob, 2, 6, sh); P(ax, 25 + bob, 2, 1, SKIN.base); }
    else if (mode === 'up') { P(ax, 12 + bob, 2, 7, sh); P(ax, 11 + bob, 2, 1, SKIN.base); }
    else if (mode === 'phone') { P(side < 0 ? 3 : 15, 17 + bob, 2, 3, sh); P(side < 0 ? 4 : 14, 15 + bob, 2, 2, SKIN.base); }
    else if (mode === 'selfie') { P(ax, 18 + bob, 2, 2, sh); P(side < 0 ? 0 : 18, 15 + bob, 2, 4, sh); P(side < 0 ? -1 : 19, 13 + bob, 2, 2, SKIN.base); }
  };
  const [aL, aR] = arms === 'phone' ? ['down', 'phone'] : arms === 'selfie' ? ['down', 'selfie'] : arms === 'wave' ? ['down', Math.floor(t * 4) % 2 ? 'up' : 'selfie'] : [arms, arms];
  A(-1, aL); A(1, aR);
  // 头
  const hy = bob;
  pell(g, x + 10, y + 9 + hy, 10, 10, L.hair);
  if (L.bob) pell(g, x + 10, y + 12 + hy, 10, 7, L.hair);
  pell(g, x + 10, y + 10 + hy, 8, 8, SKIN.base);
  // 刘海（偏分）
  const part = L.part === 'left' ? 7 : L.part === 'right' ? 13 : 10;
  for (let px = 1; px <= 19; px++) {
    const yb = px <= part ? 5 + Math.round((part - px) * .35) : 4 + Math.round((px - part) * (L.part === 'mid' ? .35 : .5));
    const top = 1 + Math.round(Math.abs(px - 10) * Math.abs(px - 10) / 25);
    P(px, top + hy, 1, Math.max(0, Math.min(yb, 9) - top), L.hair);
  }
  P(part, 1 + hy, 1, 3, SKIN.light);
  P(1, 7 + hy, 2, 8, L.hair); P(17, 7 + hy, 2, 8, L.hair);
  if (L.clip) { P(15, 4 + hy, 2, 2, '#FFD34E'); P(16, 3 + hy, 1, 1, '#FFD34E'); }
  // 五官
  const E = '#2B2030', ex = [7, 13], eyY = 10 + hy, expr = o.expr || 'smile';
  for (const e of ex) {
    if (expr === 'happy') { P(e - 1, eyY + 1, 1, 1, E); P(e, eyY, 1, 1, E); P(e + 1, eyY + 1, 1, 1, E); }
    else if (expr === 'blink') P(e - 1, eyY + 1, 3, 1, E);
    else if (expr === 'shock') P(e - 1, eyY - 1, 2, 3, E);
    else { P(e, eyY, 1, 2, E); }
  }
  const M = '#A8434E', my = 14 + hy;
  if (expr === 'smile' || expr === 'happy') { P(8, my, 4, 1, M); P(7, my - 1, 1, 1, M); }
  else if (expr === 'sad') { P(8, my, 4, 1, M); P(7, my + 1, 1, 1, M); P(12, my + 1, 1, 1, M); }
  else if (expr === 'shock') { P(9, my - 1, 2, 2, '#5A1E2A'); }
  else P(8, my, 4, 1, M);
  P(4, 13 + hy, 2, 1, '#F4A0A0'); P(14, 13 + hy, 2, 1, '#F4A0A0');
  if (L.mole) P(15, 15 + hy, 1, 1, '#5A3A30');
  g.restore();
}
/* 头像（对话框用）：大脸缩小贴进去 */
function portraitFace(o) {
  return (g, cx, cy, t) => drawFace(g, cx, cy + 6, 3.5, Object.assign({ expr: Math.floor((t + 1.3) % 3.1 * 8) === 0 ? 'blink' : (o.expr || 'smile') }, o));
}
