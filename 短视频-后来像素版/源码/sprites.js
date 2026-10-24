'use strict';
/* sprites.js：像素角色和道具。
   主角都是甜菜之前视频里的像素小怪（用户给的 12×8 方块图）：
     ..oooooooo..
     ..o#oooo#o..
     oooooooooooo
     oooooooooooo
     ..oooooooo..
     ..oooooooo..
     ..o.o..o.o..
     ..o.o..o.o..
   大号每个方块画成 2×2 像素（身体加手臂 24 宽、16 高），小号 1×1（12×8，人群和小孩用）。造型不改，只加：
   她：原色 #CB7C5E。十七岁穿蓝色百褶裙；长大以后不穿裙子，冬天出门戴一顶酒红色毛线帽（带绒球）。
   他：青绿色，头顶一撮呆毛。长大以后冬天戴深灰毛线帽，呆毛从帽顶钻出来。
   （试过围巾：小怪的身子就是脸，横在下半截的一道看着像一张大嘴，不用。） */
const COL = { her: '#CB7C5E', him: '#55B2A2' };
const EYE = '#171312';
const SKIRT = { base: '#3A5BA8', lt: '#6286D2', dk: '#24407E' };
const HAT = { her: '#9C3D54', him: '#4A5060' };
const MOX = 12, MOY = 12, MCW = 48, MCH = 36;     // 身体左上角在精灵画布里的位置（四周留出手臂、呆毛、围巾尾巴的地方）
const MON_CACHE = {};
/* o：{col, eyes, armL, armR, legs, back, skirt, cowlick, beanie(帽子颜色), blush, tear, glint, lean}
   eyes：n l r up dn shut happy wide sad
   armL/armR：n up hi dn reach hold wave
   legs：0 站，1 / 2 走路两帧，'sit' 坐（腿收短），'jump' 跳（腿收起） */
function mon(o = {}) {
  const key = JSON.stringify(o);
  if (MON_CACHE[key]) return MON_CACHE[key];
  const c = mk(MCW, MCH), g = c.getContext('2d');
  const base = o.col || COL.her;
  const body = o.back ? shade(base, .86) : base;
  const lean = o.lean || 0;
  // 上半身（y < 6）往 lean 那边错开 1 像素：凑近、歪头
  const P = (x, y, w, h, col) => {
    g.fillStyle = col;
    if (!lean) { g.fillRect(MOX + x, MOY + y, w, h); return; }
    for (let yy = y; yy < y + h; yy++) g.fillRect(MOX + x + (yy < 6 ? lean : 0), MOY + yy, w, 1);
  };
  P(4, 0, 16, 12, body);                                       // 身体
  const legs = o.legs || 0;
  const legH = legs === 'sit' ? 2 : legs === 'jump' ? 2 : 4;
  [[4, 1], [8, 2], [14, 1], [18, 2]].forEach(([x, grp]) => P(x, 12, 2, legs === grp ? 3 : legH, body));
  const arm = (side, pose) => {
    const X = side < 0 ? 0 : 20;
    if (pose === 'up') P(X, 0, 4, 4, body);
    else if (pose === 'hi') { P(X, -5, 4, 4, body); P(side < 0 ? 2 : 20, -1, 2, 5, body); }
    else if (pose === 'dn') P(X, 8, 4, 3, body);
    else if (pose === 'reach') P(side < 0 ? -4 : 20, 4, 8, 4, body);
    else if (pose === 'hold') { P(side < 0 ? 1 : 19, 5, 4, 3, body); P(side < 0 ? 3 : 18, 7, 3, 3, body); }   // 胳膊往前弯，捧着胸前的东西
    else if (pose === 'wave') { P(X, -3, 4, 4, body); P(side < 0 ? 1 : 21, 1, 2, 4, body); }
    else P(X, 4, 4, 4, body);
  };
  arm(-1, o.armL || 'n'); arm(1, o.armR || 'n');
  if (o.skirt) {                                                 // 蓝色百褶裙：腰在 y 8，下摆往外张，褶子一深一浅
    const S = (x, y, w, h, col) => P(x, y, w, h, col);
    S(4, 8, 16, 2, SKIRT.base); S(3, 10, 18, 2, SKIRT.base); S(2, 12, 20, 1, SKIRT.base);
    for (let x = 5; x <= 19; x += 3) { S(x, 9, 1, 3, SKIRT.lt); S(x - 1 < 3 ? 3 : x - 1, 12, 1, 1, SKIRT.dk); }
    S(2, 12, 1, 1, SKIRT.dk); S(21, 12, 1, 1, SKIRT.dk);
    S(4, 8, 16, 1, SKIRT.dk);                                     // 腰头
  }
  const cowl = () => {                                           // 呆毛：头顶偏右一撮，弯回来；戴帽子时从帽顶钻出来
    const cl = shade(base, .82), dy = o.beanie ? -4 : 0;
    P(13, -1 + dy, 2, 1, body); P(14, -2 + dy, 1, 1, body); P(15, -3 + dy, 2, 1, cl); P(17, -2 + dy, 1, 1, cl);
  };
  if (o.cowlick && !o.beanie) cowl();
  if (o.beanie) {                                                // 毛线帽：帽檐一圈罗纹，顶上绒球（他的呆毛从帽顶钻出来）
    const c = o.beanie, d = shade(c, .78), l = shade(c, 1.22);
    P(8, -4, 8, 1, c); P(6, -3, 12, 1, c); P(5, -2, 14, 1, c); P(6, -3, 3, 1, l); P(5, -2, 2, 1, l);
    P(4, -1, 16, 2, d); for (let x = 5; x < 20; x += 2) P(x, -1, 1, 2, c);
    if (!o.cowlick) { P(10, -7, 4, 3, '#F2E8EC'); P(10, -7, 1, 1, '#FFFFFF'); P(13, -5, 1, 1, '#D8CCD4'); }
    else cowl();
  }
  if (!o.back) {
    const ev = o.eyes || 'n';
    const E2 = (x, y, w, h, col = EYE) => { P(x, y, w, h, col); P(x + 10, y, w, h, col); };
    if (ev === 'n') E2(6, 2, 2, 2);
    else if (ev === 'l') E2(5, 2, 2, 2);
    else if (ev === 'r') E2(7, 2, 2, 2);
    else if (ev === 'up') E2(6, 1, 2, 2);
    else if (ev === 'dn') E2(6, 3, 2, 2);
    else if (ev === 'shut') E2(6, 3, 2, 1);
    else if (ev === 'wide') E2(6, 1, 2, 3);
    else if (ev === 'happy') { E2(5, 3, 1, 1); E2(6, 2, 2, 1); E2(8, 3, 1, 1); }
    else if (ev === 'sad') { P(6, 3, 2, 1, EYE); P(7, 2, 1, 1, EYE); P(16, 3, 2, 1, EYE); P(16, 2, 1, 1, EYE); }
    else if (ev === 'dnl') E2(5, 3, 2, 2);
    else if (ev === 'dnr') E2(7, 3, 2, 2);
    if (o.glint && 'n l r up wide dn dnl dnr'.split(' ').includes(ev)) {
      const dx = { l: -1, r: 1, dnl: -1, dnr: 1 }[ev] || 0, dy = ev === 'up' || ev === 'wide' ? -1 : ev.startsWith('dn') ? 1 : 0;
      P(6 + dx, 2 + dy, 1, 1, '#FFFFFF'); P(16 + dx, 2 + dy, 1, 1, '#FFFFFF');
    }
    if (o.blush) { P(4, 5, 2, 1, '#F79AA8'); P(18, 5, 2, 1, '#F79AA8'); }
    if (o.tear) {                                                // 眼眶里含着泪（亮蓝的一条），tear=2 已经满出来
      const tc = '#A8E0FF', dy = ev === 'dn' ? 1 : 0;
      P(6, 4 + dy, 2, 1, tc); P(16, 4 + dy, 2, 1, tc);
      if (o.tear > 1) { P(6, 5 + dy, 1, 2, tc); P(17, 5 + dy, 1, 2, tc); }
    }
  }
  MON_CACHE[key] = c;
  return c;
}
/* 画小怪：(x, y) 是身体左上角（缓冲坐标）；tint 给颜色时整体相乘（夜里偏蓝）；alpha 半透明 */
function drawMon(g, x, y, o = {}, tint = null, alpha = 1) {
  const s = mon(o), sp = tint ? tinted(s, tint, JSON.stringify(o)) : s;
  if (alpha < 1) { g.save(); g.globalAlpha *= alpha; pspr(g, sp, x - MOX, y - MOY); g.restore(); }
  else pspr(g, sp, x - MOX, y - MOY);
}
/* 按中线、脚底定位：cx 身体中线，fy 脚底那一行 */
function monAt(g, cx, fy, o = {}, tint = null, alpha = 1) { drawMon(g, ri(cx - 12), ri(fy - 16), o, tint, alpha); }
/* 剪影 / 发光的轮廓（鬼影、星座） */
function monSil(g, cx, fy, o, col, alpha = 1) {
  const s = silhouette(mon(o), col, JSON.stringify(o));
  g.save(); g.globalAlpha *= alpha; pspr(g, s, ri(cx - 12) - MOX, ri(fy - 16) - MOY); g.restore();
}
/* 小怪的每个像素（碎成像素、化成光点用）：[{x, y, col}]，坐标相对身体左上角 */
const MPIX = {};
function monPixels(o) {
  const key = JSON.stringify(o);
  if (MPIX[key]) return MPIX[key];
  const s = mon(o), d = s.getContext('2d').getImageData(0, 0, MCW, MCH).data, out = [];
  for (let y = 0; y < MCH; y++) for (let x = 0; x < MCW; x++) {
    const i = (y * MCW + x) * 4; if (d[i + 3] < 128) continue;
    out.push({ x: x - MOX, y: y - MOY, col: rgb2hex(d[i], d[i + 1], d[i + 2]) });
  }
  MPIX[key] = out; return out;
}
/* 走路：按时间换腿、身子轻轻一颠；返回 {legs, bob} */
function walkCycle(t, rate = 4) { const k = Math.floor(t * rate) % 4; return { legs: [0, 1, 0, 2][k], bob: k % 2 ? -1 : 0 }; }
/* 眨眼：每 3~5 秒眨一次，0.12 秒 */
function blinking(t, seed = 1) { const per = 3 + 2 * hash(seed, 9), u = mod(t + hash(seed, 3) * per, per); return u < .12; }

/* ---------------- 小号小怪：12×8，一格一像素（人群、小孩、远景） ---------------- */
const SMON_CACHE = {};
/* o：{col, eyes(n l r shut back), skirt, cowlick, beanie, legs(0/1/2), arms(n/up), bag} */
function smon(o = {}) {
  const key = JSON.stringify(o);
  if (SMON_CACHE[key]) return SMON_CACHE[key];
  const c = mk(16, 13), g = c.getContext('2d');
  const base = o.col || COL.her, back = o.eyes === 'back', body = back ? shade(base, .86) : base;
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(2 + x, 3 + y, w, h); };
  P(2, 0, 8, 6, body);
  if (o.arms === 'up') { P(0, 0, 2, 2, body); P(10, 0, 2, 2, body); } else { P(0, 2, 2, 2, body); P(10, 2, 2, 2, body); }
  const legs = o.legs || 0;
  [[2, 1], [4, 2], [7, 1], [9, 2]].forEach(([x, grp]) => P(x, 6, 1, legs === grp ? 1 : 2, body));
  if (o.skirt) { P(2, 4, 8, 1, SKIRT.base); P(1, 5, 10, 1, SKIRT.base); P(3, 5, 1, 1, SKIRT.lt); P(6, 5, 1, 1, SKIRT.lt); P(9, 5, 1, 1, SKIRT.lt); }
  if (o.cowlick) { const dy = o.beanie ? -2 : 0; P(7, -1 + dy, 1, 1, body); P(8, -2 + dy, 1, 1, shade(base, .82)); }
  if (o.beanie) { P(3, -2, 6, 1, o.beanie); P(2, -1, 8, 1, o.beanie); P(2, 0, 8, 1, shade(o.beanie, .78)); if (!o.cowlick) P(5, -3, 2, 1, '#F2E8EC'); }
  if (o.bag) { P(9, 1, 2, 4, o.bag); }
  if (!back) {
    const ev = o.eyes || 'n', dx = ev === 'l' ? -1 : ev === 'r' ? 1 : 0;
    if (ev === 'shut') { P(3, 1, 1, 1, shade(base, .6)); P(8, 1, 1, 1, shade(base, .6)); }
    else { P(3 + dx, 1, 1, 1, EYE); P(8 + dx, 1, 1, 1, EYE); }
  }
  SMON_CACHE[key] = c; return c;
}
/* 小号按中线、脚底定位 */
function smonAt(g, cx, fy, o = {}, tint = null, alpha = 1) {
  const s = smon(o), sp = tint ? tinted(s, tint, 's' + JSON.stringify(o)) : s;
  g.save(); g.globalAlpha *= alpha; pspr(g, sp, ri(cx - 6) - 2, ri(fy - 8) - 3); g.restore();
}
/* 人群的配色：灰蓝、灰紫、灰褐……（主角的颜色不在里面） */
const CROWD = ['#8B93AD', '#9C8F88', '#7D8C9B', '#A49AB3', '#8F9F92', '#A3A3A3', '#B0928E', '#7E8AA8', '#9A9078', '#8A7F9E'];
const KIDS = ['#E8A34E', '#7FB8E6', '#E88FA8', '#9BCB6A', '#C9A0E0', '#F0C75A', '#8FD0C0', '#E07A6A'];

/* ---------------- 道具 ---------------- */
function sprRows(name, rows, pal) {
  return cached('spr_' + name, Math.max(...rows.map(r => r.length)), rows.length, g => {
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const col = pal[r[i]]; if (col) { g.fillStyle = col; g.fillRect(i, j, 1, 1); } } });
  });
}
/* 双棒冰棍：两根连在一起，掰开成两半（half：0 整根，1 左半，2 右半） */
function popsicle(half = 0, bite = 0) {
  const rows = [
    '.oooo.oooo.',
    'oOooo.oOooo',
    'oOooo.oOooo',
    'oOooo.oOooo',
    'ooooo.ooooo',
    'ooooo-ooooo',
    'ooooo.ooooo',
    'ooooo.ooooo',
    '..s.....s..',
    '..s.....s..',
    '..s.....s..',
  ];
  const r2 = rows.map(r => half === 1 ? r.slice(0, 5) : half === 2 ? r.slice(6) : r.replace('-', 'o'));
  if (bite) for (let j = 0; j < Math.min(3, bite); j++) r2[j] = '.'.repeat(Math.min(r2[j].length, 2 + j)) + r2[j].slice(2 + j);
  return sprRows('pop' + half + '_' + bite, r2, { o: '#F4A64A', O: '#FFD08A', s: '#E8D2A6', '-': '#F4A64A' });
}
/* 栀子花：小的 5×5（远景）、中的 9×9、大的 15×15（特写） */
function gardenia(size = 1) {
  if (size === 0) return sprRows('gd0', ['.w.', 'wyw', '.w.'], { w: '#FFFFFF', y: '#F2D45C' });
  if (size === 1) return sprRows('gd1', [
    '..w.w..',
    '.wwwww.',
    'wwcycww',
    '.wyyyw.',
    'wwcycww',
    '.wwwww.',
    '..w.w..',
  ], { w: '#FFFFFF', c: '#EDE8D2', y: '#F2D45C' });
  if (size === 2) return sprRows('gd2', [
    '....ww....',
    '..wwwwww..',
    '.wwccwwcw.',
    'wwcwwwwccw',
    'wcwwyywwcw',
    'wwwyyyywww',
    'wcwwyywwcw',
    '.wccwwwcw.',
    '..wwwwww..',
    '....ww....',
  ], { w: '#FFFFFF', c: '#E4E0CC', y: '#F0D050' });
  return sprRows('gd3', [
    '......www......',
    '....wwwwwww....',
    '...wwwccwwww...',
    '..wwwcwwcwwww..',
    '.wwwcwwwwcwwww.',
    '.wwccwwwwwccww.',
    'wwcwwwyyywwwcww',
    'wcwwwyyYyywwwcw',
    'wwcwwwyyywwwcww',
    '.wwccwwwwwccww.',
    '.wwwwcwwwcwwww.',
    '..wwwwcwcwwww..',
    '...wwwwwwwww...',
    '....wwwwwww....',
    '......www......',
  ], { w: '#FFFFFF', c: '#E2DDC6', y: '#EFC946', Y: '#FFF2A0' });
}
/* 一片花瓣（2×3 或 3×2，按转动换形状） */
function petal(g, x, y, phase, col = '#FFFFFF') {
  const k = mod(Math.floor(phase), 4);
  g.fillStyle = col;
  if (k === 0) { g.fillRect(ri(x), ri(y), 2, 1); g.fillRect(ri(x) + 1, ri(y) + 1, 2, 1); }
  else if (k === 1) { g.fillRect(ri(x), ri(y), 1, 2); g.fillRect(ri(x) + 1, ri(y) + 1, 1, 1); }
  else if (k === 2) { g.fillRect(ri(x), ri(y), 3, 1); }
  else { g.fillRect(ri(x), ri(y), 1, 1); g.fillRect(ri(x) + 1, ri(y), 1, 2); }
}
/* 心（实心 7×6），可以裂成两半 */
const HEART7 = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
function heart7(col = '#FF5A7A', hl = '#FFB0C0') { return sprRows('h7' + col, HEART7.map((r, j) => j === 1 ? r.replace(/^.#/, '.H') : r), { '#': col, H: hl }); }
/* 大一点的心 11×10 */
const HEART11 = ['..###.###..', '.#########.', '###########', '###########', '###########', '.#########.', '..#######..', '...#####...', '....###....', '.....#.....'];
function heart11(col = '#FF5A7A', hl = '#FFC0CC') {
  return cached('h11' + col, 11, 10, g => {
    HEART11.forEach((r, j) => { for (let i = 0; i < 11; i++) if (r[i] === '#') { g.fillStyle = col; g.fillRect(i, j, 1, 1); } });
    g.fillStyle = hl; g.fillRect(2, 2, 2, 1); g.fillRect(2, 3, 1, 1);
  });
}

/* ---------------- 掌机 ----------------
   横着拿的老掌机（左边十字键、右边 A B 键）。设计单位 70×34，液晶 32×18（16:9：镜头推进去正好铺满横屏画面）。
   (x, y) 左上角，u 每个设计单位多少缓冲像素（整数）。o：{body 机身色, screen 液晶里要画的画布, on 0..1 亮度, led 电源灯 0/1, glare 屏幕反光, pressA}
   返回液晶在缓冲里的位置 {x, y, w, h}。 */
const HH = { w: 70, h: 34, lcd: [19, 5, 32, 18] };
function handheld(g, x, y, u, o = {}) {
  const body = o.body || '#E6DEC8', dk = shade(body, .78), lt = shade(body, 1.22);
  const R_ = (a, b, w, h, c) => prect(g, x + a * u, y + b * u, w * u, h * u, c);
  const PT = pts => pts.map(([a, b]) => [x + a * u, y + b * u]);
  // 机身：两头圆，上边平一点
  const outline = [[6, 0], [64, 0], [68, 2], [70, 7], [70, 25], [68, 30], [63, 34], [7, 34], [2, 30], [0, 25], [0, 7], [2, 2]];
  ppoly(g, PT(outline.map(([a, b]) => [a, b + .6])), dk);
  ppoly(g, PT(outline), body);
  R_(6, 0, 58, 1, lt); R_(1, 6, 1, 20, lt);
  R_(4, 0, 11, 1, dk); R_(55, 0, 11, 1, dk);                                     // 肩键
  R_(68, 7, 1, 18, dk); R_(8, 33, 54, 1, dk);
  // 屏框
  R_(17, 3, 36, 23, '#4E5263'); R_(17, 3, 36, 1, '#5E6378'); R_(17, 25, 36, 1, '#3E4252');
  // 电源灯
  R_(14, 6, 1, 1, o.led ? '#FF4A4A' : '#5A2A2A');
  // 液晶
  const [lx, ly, lw, lh] = HH.lcd, LX = x + lx * u, LY_ = y + ly * u, LW = lw * u, LH = lh * u;
  const on = o.on ?? 0;
  prect(g, LX, LY_, LW, LH, '#2A3130');
  if (o.screen && on > 0) {
    g.save(); g.globalAlpha *= on; g.imageSmoothingEnabled = false;
    g.beginPath(); g.rect(LX, LY_, LW, LH); g.clip();
    g.drawImage(o.screen, LX, LY_, LW, LH);
    g.restore();
  }
  if (o.glare) { g.save(); g.globalAlpha *= o.glare; for (let i = 0; i < 4 * u; i++) prect(g, LX + LW - 6 * u + i, LY_ + i, 2, 1, 'rgba(255,255,255,.3)'); g.restore(); }
  // 屏框下面的一行小字条
  R_(30, 27, 10, 1, dk);
  // 十字键
  R_(5, 15, 8, 3, '#2C2E36'); R_(7, 13, 3, 8, '#2C2E36'); R_(8, 16, 1, 1, '#45474F');
  // A、B 键（圆一点：3×3 去掉四个角）
  const btn = (bx, by, pressed) => {
    const c = pressed ? '#8A2A48' : '#B23A5E';
    R_(bx + 1, by, 2, 4, c); R_(bx, by + 1, 4, 2, c); R_(bx + 1, by + 1, 1, 1, shade(c, 1.25));
  };
  btn(61, 11, o.pressA); btn(56, 16, o.pressB);
  // 开始、选择
  R_(5, 26, 3, 1, '#7A7466'); R_(10, 26, 3, 1, '#7A7466');
  // 喇叭孔
  for (let i = 0; i < 4; i++) for (let j = 0; j < 3; j++) R_(57 + i * 2 + (j % 2), 24 + j * 2, 1, 1, dk);
  return { x: LX, y: LY_, w: LW, h: LH };
}
/* 小号掌机（远景、捧在手里）：12×7；screenCol 屏幕颜色（亮起来时） */
function miniHandheld(g, x, y, body = '#E6DEC8', screenCol = null) {
  x = ri(x); y = ri(y);
  prect(g, x + 1, y, 10, 7, body); prect(g, x, y + 1, 12, 5, body);
  prect(g, x + 3, y + 1, 6, 4, '#4E5263'); prect(g, x + 4, y + 2, 4, 2, screenCol || '#2A3130');
  prect(g, x + 1, y + 3, 1, 1, '#2C2E36'); prect(g, x + 10, y + 2, 1, 1, '#B23A5E'); prect(g, x + 10, y + 4, 1, 1, '#B23A5E');
  prect(g, x + 1, y + 6, 10, 1, shade(body, .78));
}
/* 捧在怀里的掌机：10×6（比小怪的身子窄，露出两边的手） */
function heldHandheld(g, cx, y, body = '#E6DEC8', screenCol = null) {
  const x = ri(cx - 5); y = ri(y);
  prect(g, x + 1, y, 8, 6, body); prect(g, x, y + 1, 10, 4, body);
  prect(g, x + 3, y + 1, 4, 3, '#4E5263'); prect(g, x + 3, y + 1, 4, 3, screenCol || '#2A3130');
  prect(g, x + 1, y + 2, 1, 1, '#2C2E36'); prect(g, x + 8, y + 2, 1, 1, '#B23A5E');
  prect(g, x + 1, y + 5, 8, 1, shade(body, .78));
}
/* 连接线：从 (x0,y0) 到 (x1,y1)，中间下垂 sag；snapped 0..1 断开（两头各缩回去） */
function linkCable(g, x0, y0, x1, y1, sag, col = '#8A7FB4', cut = -1) {
  const n = Math.max(8, ri(Math.hypot(x1 - x0, y1 - y0)));
  let px = null, py = null;
  for (let i = 0; i <= n; i++) {
    const u = i / n; if (cut >= 0 && Math.abs(u - .5) < cut / 2) continue;
    const x = lerp(x0, x1, u), y = lerp(y0, y1, u) + sag * 4 * u * (1 - u);
    if (ri(x) !== px || ri(y) !== py) pdot(g, x, y, col);
    px = ri(x); py = ri(y);
  }
}
