'use strict';
/* sprites.js：像素角色和道具。
   两个主角都是甜菜之前视频里的像素小怪（用户给的 12×8 方块图，每个方块画成 2×2 个像素）：
     ..oooooooo..
     ..o#oooo#o..
     oooooooooooo
     oooooooooooo
     ..oooooooo..
     ..oooooooo..
     ..o.o..o.o..
     ..o.o..o.o..
   "我"是原色 #CB7C5E；"你"是粉色，头上别一朵小白花。造型不改，只加表情、手臂姿势、眼泪这些。 */
const MON = { me: '#CB7C5E', you: '#E58BAA' };
const EYE = '#171312';
const MOX = 8, MOY = 10, MCW = 44, MCH = 30;     // 身体左上角在精灵画布里的位置（四周留出手臂、花、眼泪的地方）
const MON_CACHE = {};
/* o：{col, eyes, armL, armR, legs, back, flower, blush, tear, wetR, wetL, glint}
   eyes：n l r up dn shut happy wide sad
   armL/armR：n up hi dn reach wipe（wipe：抬起来擦眼睛） */
function monster(o = {}) {
  const key = JSON.stringify(o);
  if (MON_CACHE[key]) return MON_CACHE[key];
  const c = mk(MCW, MCH), g = c.getContext('2d');
  const body = o.back ? shade(o.col || MON.me, .86) : (o.col || MON.me);
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(MOX + x, MOY + y, w, h); };
  P(4, 0, 16, 12, body);                                     // 身体
  const legs = o.legs || 0;                                  // 1：抬左边一对，2：抬右边一对
  [[4, 1], [8, 2], [14, 1], [18, 2]].forEach(([x, grp]) => P(x, 12, 2, legs === grp ? 3 : 4, body));
  const arm = (side, pose, wet) => {
    const col = wet ? shade(body, .72) : body;
    const X = side < 0 ? 0 : 20;
    if (pose === 'up') P(X, 0, 4, 4, col);
    else if (pose === 'hi') { P(X, -5, 4, 4, col); P(side < 0 ? 2 : 20, -1, 2, 5, col); }
    else if (pose === 'dn') P(X, 8, 4, 3, col);
    else if (pose === 'reach') P(side < 0 ? -4 : 20, 4, 8, 4, col);
    else if (pose === 'wipe') {                               // 胳膊抬起来，小臂横着挡住这一边的眼睛
      P(X, 2, 4, 4, col);
      if (side > 0) P(14, 1, 7, 4, shade(col, .9)); else P(3, 1, 7, 4, shade(col, .9));
    } else P(X, 4, 4, 4, col);
    if (wet) { P(X + (side < 0 ? 1 : 2), pose === 'wipe' ? 3 : 5, 1, 1, '#9FD8FF'); }
  };
  arm(-1, o.armL || 'n', o.wetL); arm(1, o.armR || 'n', o.wetR);
  if (!o.back) {
    const ev = o.eyes || 'n';
    const E2 = (x, y, w, h, col = EYE) => { P(x, y, w, h, col); P(x + 10, y, w, h, col); };
    if (o.armR === 'wipe' && o.armL === 'wipe') { /* 两只眼睛都挡住了 */ }
    else {
      if (ev === 'n') E2(6, 2, 2, 2);
      else if (ev === 'l') E2(5, 2, 2, 2);
      else if (ev === 'r') E2(7, 2, 2, 2);
      else if (ev === 'up') E2(6, 1, 2, 2);
      else if (ev === 'dn') E2(6, 3, 2, 2);
      else if (ev === 'shut') E2(6, 3, 2, 1);
      else if (ev === 'wide') E2(6, 1, 2, 3);
      else if (ev === 'happy') { E2(5, 3, 1, 1); E2(6, 2, 2, 1); E2(8, 3, 1, 1); }
      else if (ev === 'sad') { P(6, 3, 2, 1, EYE); P(7, 2, 1, 1, EYE); P(16, 3, 2, 1, EYE); P(16, 2, 1, 1, EYE); }   // 外眼角往下耷拉
      if (o.glint && (ev === 'n' || ev === 'r' || ev === 'l' || ev === 'up' || ev === 'wide')) {
        const dx = ev === 'r' ? 1 : ev === 'l' ? -1 : 0, dy = ev === 'up' || ev === 'wide' ? -1 : 0;
        P(6 + dx, 2 + dy, 1, 1, '#FFFFFF'); P(16 + dx, 2 + dy, 1, 1, '#FFFFFF');
      }
      // 再用胳膊挡住被擦的那只眼睛
      if (o.armR === 'wipe') P(14, 1, 7, 4, shade(o.wetR ? shade(body, .72) : body, .9));
      if (o.armL === 'wipe') P(3, 1, 7, 4, shade(o.wetL ? shade(body, .72) : body, .9));
    }
    if (o.blush) { P(4, 5, 2, 1, '#F7A3A8'); P(18, 5, 2, 1, '#F7A3A8'); }
    if (o.tear) {                                             // 眼眶里含着泪（亮蓝的一条），tear=2 时已经满出来
      const tc = '#A8E0FF';
      if (o.armL !== 'wipe') { P(6, 4, 2, 1, tc); if (o.tear > 1) P(6, 5, 1, 1, tc); }
      if (o.armR !== 'wipe') { P(16, 4, 2, 1, tc); if (o.tear > 1) P(17, 5, 1, 1, tc); }
    }
  }
  if (o.flower) {                                             // 小白花，别在头顶右边
    const fx = o.back ? 6 : 17;
    P(fx - 1, -1, 1, 1, '#FFFFFF'); P(fx + 1, -1, 1, 1, '#FFFFFF'); P(fx, -2, 1, 1, '#FFFFFF'); P(fx, 0, 1, 1, '#FFFFFF'); P(fx, -1, 1, 1, '#FFD34E');
  }
  MON_CACHE[key] = c;
  return c;
}
/* 画小怪：(x, y) 是身体左上角（缓冲坐标），k 倍；tint 给颜色时整体相乘（夜里偏蓝） */
function drawMon(g, x, y, o = {}, k = 1, tint = null, flip = false) {
  const s = monster(o), sp = tint ? tinted(s, tint, JSON.stringify(o)) : s;
  pspr(g, sp, x - MOX * k, y - MOY * k, k, flip);
}
/* 转身：前面 → 背面。u 0..1，横向压扁再展开（像翻牌） */
function drawMonTurn(g, x, y, oF, oB, u, k = 1, tint = null) {
  const o = u < .5 ? oF : oB, s = monster(o), sp = tint ? tinted(s, tint, JSON.stringify(o)) : s;
  const sx = Math.max(.12, Math.abs(Math.cos(Math.PI * u)));
  const cx = x + 12 * k;                                      // 身体中线不动
  g.save(); g.imageSmoothingEnabled = false;
  g.drawImage(sp, ri(cx - (MOX + 12) * k * sx), ri(y - MOY * k), Math.max(1, ri(MCW * k * sx)), MCH * k);
  g.restore();
}
/* 小怪的每个像素（化成光点用）：[{x, y, col}]，坐标相对身体左上角 */
const MPIX = {};
function monPixels(o) {
  const key = JSON.stringify(o);
  if (MPIX[key]) return MPIX[key];
  const s = monster(o), d = s.getContext('2d').getImageData(0, 0, MCW, MCH).data, out = [];
  for (let y = 0; y < MCH; y++) for (let x = 0; x < MCW; x++) {
    const i = (y * MCW + x) * 4; if (d[i + 3] < 128) continue;
    out.push({ x: x - MOX, y: y - MOY, col: rgb2hex(d[i], d[i + 1], d[i + 2]) });
  }
  MPIX[key] = out; return out;
}
/* 小怪身上几个点（提线拴在哪），相对身体左上角 */
function monAnchor(o, which) {
  if (which === 'head') return [12, -1];
  const side = which === 'L' ? -1 : 1, pose = (side < 0 ? o.armL : o.armR) || 'n';
  const X = side < 0 ? 1 : 22;
  if (pose === 'up') return [X, 0];
  if (pose === 'hi') return [X, -5];
  if (pose === 'dn') return [X, 8];
  if (pose === 'reach') return [side < 0 ? -3 : 27, 4];
  return [X, 4];
}

/* ---------------- 道具 ---------------- */
function sprRows(name, rows, pal) {
  return cached('spr_' + name, Math.max(...rows.map(r => r.length)), rows.length, g => {
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const col = pal[r[i]]; if (col) { g.fillStyle = col; g.fillRect(i, j, 1, 1); } } });
  });
}
/* 行李箱（拉杆、两个轮子） */
const suitcase = () => sprRows('suitcase', [
  '...hh....',
  '...h.h...',
  '...h.h...',
  'bbbbbbbbb',
  'bSbbbbbSb',
  'bSbbbbbSb',
  'bSbbbbbSb',
  'bbbbbbbbb',
  '.w.....w.',
], { h: '#4A3C55', b: '#7A5A9E', S: '#B79AD8', w: '#1E1A26' });
/* 心：15×13；crack 0..1 裂开的程度，gold 0..1 裂缝被金色填上的程度 */
const HEART_ROWS = [
  '..####...####..',
  '.######.######.',
  '###############',
  '###############',
  '###############',
  '###############',
  '.#############.',
  '..###########..',
  '...#########...',
  '....#######....',
  '.....#####.....',
  '......###......',
  '.......#.......',
];
const CRACK = [[7, 1], [7, 2], [6, 3], [6, 4], [7, 5], [8, 6], [8, 7], [7, 8], [6, 9], [7, 10], [7, 11]];   // 裂缝从上到下
function heart(crack = 0, gold = 0, beat = 0) {
  const key = `heart|${crack.toFixed(2)}|${gold.toFixed(2)}|${beat}`;
  return cached(key, 15, 13, g => {
    const base = '#E8434F', dk = '#A8202E', hi = '#FF8A8F';
    HEART_ROWS.forEach((r, j) => { for (let i = 0; i < 15; i++) if (r[i] === '#') { g.fillStyle = base; g.fillRect(i, j, 1, 1); } });
    g.fillStyle = dk; g.fillRect(9, 10, 2, 1); g.fillRect(11, 8, 2, 1); g.fillRect(12, 7, 2, 1); g.fillRect(13, 5, 1, 2);
    g.fillStyle = hi; g.fillRect(3, 2, 2, 1); g.fillRect(2, 3, 1, 2); if (beat) g.fillRect(4, 3, 1, 1);
    const n = ri(CRACK.length * crack);
    for (let i = 0; i < n; i++) {
      const [x, y] = CRACK[i], gu = clamp(gold * CRACK.length - i);   // 金色从上往下流进裂缝
      g.fillStyle = gu > .5 ? (gu > .9 ? '#FFE27A' : '#F6B93B') : '#2A0A10';
      g.fillRect(x, y, 1, 1);
      if (i > 2 && i < n - 1 && i % 3 === 0) { g.fillRect(x + (i % 2 ? 1 : -1), y, 1, 1); }   // 裂缝分出去的小叉
    }
  });
}
/* 灯笼 5×7 */
const lantern = () => sprRows('lantern', ['.ggg.', 'rrrrr', 'rRrrr', 'rRrrr', 'rrrrr', '.ggg.', '..y..'], { g: '#E8B04A', r: '#E8323C', R: '#FF7A6A', y: '#FFD34E' });

/* 鲸鱼（座头鲸的样子）：约 132×56 像素，头在右边，大而钝圆；喉咙那里鼓出来、带一道道褶；长长的胸鳍；tail 0/1 尾巴上下两帧 */
const WH_TOP = [[8, 25], [22, 24], [30, 21], [40, 17], [52, 13], [66, 10], [80, 9], [94, 9], [106, 10], [116, 12], [124, 15], [129, 19], [131, 23]];
const WH_BOT = [[8, 27], [22, 28], [34, 30], [44, 33], [56, 37], [68, 40], [80, 42], [92, 43], [104, 42], [116, 39], [124, 35], [129, 31], [131, 27]];
function polyY(pts, x) {
  for (let i = 0; i < pts.length - 1; i++) { const [x0, y0] = pts[i], [x1, y1] = pts[i + 1]; if (x >= x0 && x <= x1) return lerp(y0, y1, (x - x0) / Math.max(1, x1 - x0)); }
  return null;
}
function whale(tail = 0) {
  return cached('whale' + tail, 136, 58, g => {
    const top = '#2F5FA6', mid = '#3E74C0', belly = '#D2E8F6', groove = '#9CC3E0', dk = '#1E3F76', hi = '#6E9DE0';
    const P = (x, y, c) => { g.fillStyle = c; g.fillRect(x, y, 1, 1); };
    // 尾鳍：V 字，两帧上下摆
    const up = tail ? -1 : 1;
    for (let i = 0; i < 10; i++) {
      const x = 9 - i;
      for (let k = 0; k < 3; k++) { P(x, ri(24 - i * (up > 0 ? 1.1 : .5)) + k - 1, k === 0 ? dk : top); P(x, ri(27 + i * (up > 0 ? .5 : 1.1)) + k - 1, k === 2 ? dk : top); }
    }
    // 背上的小驼峰
    for (let x = 44; x <= 54; x++) { const hgt = ri(3 - Math.abs(x - 49) * .55); for (let y = 0; y < hgt; y++) P(x, ri(polyY(WH_TOP, x)) - 1 - y, y === hgt - 1 ? dk : top); }
    // 身体：一列一列从上轮廓填到下轮廓，按高度分颜色
    for (let x = 8; x <= 131; x++) {
      const T = ri(polyY(WH_TOP, x)), B = ri(polyY(WH_BOT, x));
      for (let y = T; y <= B; y++) {
        const v = (y - T) / Math.max(1, B - T);
        let c = v < .5 ? top : v < .6 ? mid : (x > 40 ? belly : mid);
        if (x > 80 && v >= .6 && (y % 2 === 0)) c = groove;                      // 喉咙下面的褶
        if (y === T || y === B || x === 131) c = dk;
        P(x, y, c);
      }
      if (x % 10 === 0 && x > 24 && x < 120) P(x, T + 2, hi);                    // 背上的高光
    }
    // 嘴线、眼睛
    for (let x = 104; x <= 129; x++) P(x, ri(lerp(33, 30, (x - 104) / 25)), dk);
    P(108, 26, '#0E1A33'); P(109, 26, '#0E1A33'); P(108, 27, '#0E1A33'); P(109, 27, '#0E1A33'); P(108, 26, '#FFFFFF');
    // 长长的胸鳍：从肚子下面往后下方伸
    for (let i = 0; i < 26; i++) {
      const x = 88 - i, y = ri(38 + i * .55), wdt = i < 4 ? 3 : i > 22 ? 1 : 2;
      for (let k = 0; k < wdt + 1; k++) P(x, y + k, k === wdt ? dk : (i > 18 ? belly : mid));
    }
  });
}
