'use strict';
/* sprites.js：全部像素角色与道具。
   主角是用户给的像素小怪（12×8 个方块），这里每个方块画成 2×2 个世界像素，
   好在不改变原有造型的前提下加表情和配饰。其余道具都是本片自己画的。 */

/* 字符画 → 画布。pal：字符 → 颜色；'.' 与空格透明 */
function sprite(rows, pal) {
  const w = Math.max(...rows.map(r => r.length)), h = rows.length, c = mk(w, h), g = c.getContext('2d');
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const col = pal[r[i]]; if (col) { g.fillStyle = col; g.fillRect(i, j, 1, 1); } } });
  return c;
}
const SPR = {};
function spr(name, rows, pal) { if (!SPR[name]) SPR[name] = sprite(rows, pal); return SPR[name]; }

/* ================= 主角：像素小怪 =================
   原图方块网格（12×8）：
     ..oooooooo..
     ..o#oooo#o..
     oooooooooooo
     oooooooooooo
     ..oooooooo..
     ..oooooooo..
     ..o.o..o.o..
     ..o.o..o.o..
   身体颜色取自原图 #CB7C5E，眼睛 #171312。 */
const CL_OX = 4, CL_OY = 10;          // 身体左上角在精灵画布里的偏移（留出帽子和手臂的位置）
const CL_W = 32, CL_H = 30;
const CLAWD_CACHE = {};
const TONES = {
  base: '#CB7C5E', blue: '#6E9BD6', green: '#68BC8A', purple: '#A88BD8', yellow: '#DDB04F', pink: '#E58BAA', gray: '#A3A9B4', teal: '#55B7B5',
};
function shadeOf(hex, k) { // k<1 变暗，k>1 变亮
  const n = parseInt(hex.slice(1), 16), r = n >> 16, g2 = (n >> 8) & 255, b = n & 255;
  const f = v => Math.max(0, Math.min(255, Math.round(k < 1 ? v * k : v + (255 - v) * (k - 1))));
  return '#' + [f(r), f(g2), f(b)].map(v => v.toString(16).padStart(2, '0')).join('');
}
/* o：{col, eyes, legs, arms, hat, glasses, scarf, brows, vest, blush} */
function clawd(o = {}) {
  const key = JSON.stringify(o);
  if (CLAWD_CACHE[key]) return CLAWD_CACHE[key];
  const c = mk(CL_W, CL_H), g = c.getContext('2d');
  const body = o.col || TONES.base, eye = C.eye;
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(CL_OX + x, CL_OY + y, w, h); };
  // 身体
  P(4, 0, 16, 12, body);
  // 手臂
  const arms = o.arms || 'n';
  const armY = a => a === 'up' ? 0 : a === 'dn' ? 6 : 4;
  const aL = arms === 'up' || arms === 'upL' ? 'up' : arms === 'dn' ? 'dn' : 'n';
  const aR = arms === 'up' || arms === 'upR' ? 'up' : arms === 'dn' ? 'dn' : 'n';
  // 举起的手臂画成 L 形（从身体侧面伸出再朝上），不改身体轮廓
  if (aL === 'up') { P(2, 4, 2, 2, body); P(0, -1, 2, 7, body); } else P(0, armY(aL), 4, 4, body);
  if (aR === 'up') { P(20, 4, 2, 2, body); P(22, -1, 2, 7, body); } else P(20, armY(aR), 4, 4, body);
  // 腿：legs=1 抬起左边一对，legs=2 抬起右边一对
  const legs = o.legs || 0;
  [[4, 1], [8, 2], [14, 1], [18, 2]].forEach(([x, grp]) => P(x, 12, 2, legs === grp ? 3 : 4, body));
  // 背心
  if (o.vest) { const v = '#A4E03C'; P(4, 6, 5, 6, v); P(15, 6, 5, 6, v); P(4, 9, 5, 1, '#F4F4F4'); P(15, 9, 5, 1, '#F4F4F4'); }
  // 红领巾
  if (o.scarf) {
    const r = '#E5322D', d = '#A81E1A';
    P(6, 8, 12, 1, r); P(8, 9, 8, 1, r); P(10, 10, 4, 1, r); P(11, 8, 2, 2, d); P(11, 11, 2, 1, r);
  }
  // 眼睛
  const ev = o.eyes || 'n';
  const E2 = (x, y, w, h, col = eye) => { P(x, y, w, h, col); P(x + 10, y, w, h, col); };
  if (ev === 'n') E2(6, 2, 2, 2);
  else if (ev === 'l') E2(5, 2, 2, 2);
  else if (ev === 'r') E2(7, 2, 2, 2);
  else if (ev === 'up') E2(6, 1, 2, 2);
  else if (ev === 'blink' || ev === 'shut') E2(6, 3, 2, 1);
  else if (ev === 'squint') { P(6, 1, 1, 1, eye); P(7, 2, 1, 1, eye); P(6, 3, 1, 1, eye); P(17, 1, 1, 1, eye); P(16, 2, 1, 1, eye); P(17, 3, 1, 1, eye); }
  else if (ev === 'happy') { E2(5, 3, 1, 1); E2(6, 2, 2, 1); E2(8, 3, 1, 1); }
  else if (ev === 'wide') E2(6, 1, 2, 3);
  else if (ev === 'star') { E2(6, 1, 2, 4, C.gold); E2(5, 2, 4, 2, C.gold); E2(6, 2, 2, 2, '#FFFFFF'); }
  // 腮红
  if (o.blush) { P(4, 5, 2, 1, '#F2A0A0'); P(18, 5, 2, 1, '#F2A0A0'); }
  // 老人的白眉毛
  if (o.brows) { P(5, 0, 4, 1, '#F4F4F4'); P(15, 0, 4, 1, '#F4F4F4'); }
  // 眼镜
  if (o.glasses) {
    const f = '#2B2547', lens = 'rgba(200,236,255,.55)';
    for (const x0 of [4, 14]) {
      P(x0, 1, 6, 1, f); P(x0, 4, 6, 1, f); P(x0, 1, 1, 4, f); P(x0 + 5, 1, 1, 4, f);
      g.fillStyle = lens; g.fillRect(CL_OX + x0 + 1, CL_OY + 2, 4, 2);
      P(x0 + 1, 2, 1, 1, '#FFFFFF');
    }
    P(10, 2, 4, 1, f); P(2, 2, 2, 1, f); P(20, 2, 2, 1, f);
  }
  // 帽子
  const hat = o.hat;
  if (hat === 'hard' || hat === 'boss') {
    const a = hat === 'hard' ? '#F2C230' : '#F2F2F2', b = hat === 'hard' ? '#C99A1A' : '#C3C8D3', hi = hat === 'hard' ? '#FFE27A' : '#FFFFFF';
    P(8, -4, 8, 1, a); P(6, -3, 12, 1, a); P(5, -2, 14, 1, a); P(2, -1, 20, 1, b);
    P(11, -4, 2, 3, b); P(8, -3, 2, 1, hi);
  } else if (hat === 'bone') {
    const ow = '#5E4630', w = '#FFF6E0';
    ['.##....##.', '#ww####ww#', '.#wwwwww#.', '#ww####ww#', '.##....##.'].forEach((r, j) => {
      for (let i = 0; i < r.length; i++) if (r[i] !== '.') P(7 + i, -5 + j, 1, 1, r[i] === '#' ? ow : w);
    });
    // 豹纹头带
    P(4, 0, 16, 1, '#E8A94A'); P(6, 0, 1, 1, '#6B3F1E'); P(11, 0, 1, 1, '#6B3F1E'); P(16, 0, 1, 1, '#6B3F1E');
  } else if (hat === 'fur') {
    const cap = '#6E4A33', hi = '#8C6046', fur = '#F4F4F4', fs2 = '#C9D3DE';
    P(8, -6, 8, 1, cap); P(6, -5, 12, 1, cap); P(5, -4, 14, 2, cap); P(8, -5, 3, 1, hi);
    for (let i = 0; i < 20; i++) { P(2 + i, -2, 1, 1, fur); P(2 + i, -1, 1, 1, i % 3 === 1 ? fs2 : fur); if (i % 2 === 0) P(2 + i, -3, 1, 1, fur); }
  } else if (hat === 'grad') {
    P(3, -3, 18, 1, '#2B2547'); P(7, -2, 10, 2, '#2B2547'); P(17, -2, 1, 3, C.gold);
  } else if (hat === 'cap') {          // 保安帽：藏青帽顶 + 金色帽徽 + 帽檐
    const nv = '#2C3E78', dk = '#1E2A55', hi = '#3F56A0';
    P(7, -5, 10, 1, nv); P(6, -4, 12, 2, nv); P(7, -5, 4, 1, hi); P(6, -2, 12, 1, dk);
    P(11, -4, 2, 2, C.gold); P(4, -1, 16, 1, '#141B38');
  } else if (hat === 'top') {          // 绅士礼帽
    const bk = '#22202A', hi = '#4A4658';
    P(8, -9, 8, 8, bk); P(9, -9, 1, 6, hi); P(8, -3, 8, 1, '#8E2A35'); P(5, -1, 14, 1, bk);
  } else if (hat === 'straw') {        // 草帽
    const st = '#E8C26A', dk = '#C9A04A', hi = '#F6DC98';
    P(8, -4, 8, 3, st); P(9, -4, 3, 1, hi); P(8, -2, 8, 1, '#B5482F'); P(2, -1, 20, 1, dk); P(3, -1, 18, 1, st);
    P(5, -1, 1, 1, dk); P(10, -1, 1, 1, dk); P(15, -1, 1, 1, dk); P(19, -1, 1, 1, dk);
  }
  // 红鼻子（过敏）和清鼻涕
  if (o.nose) { P(11, 4, 2, 2, '#F0605A'); P(11, 4, 1, 1, '#FF9C94'); }
  if (o.drip) { P(12, 6, 1, o.drip, '#9FD3FF'); }
  CLAWD_CACHE[key] = c;
  return c;
}
/* 画小怪：(x, y) 是身体左上角（世界坐标）；flip 时以身体中线翻转 */
function drawClawd(g, x, y, o = {}, flip = false) {
  const c = clawd(o);
  x = ri(x); y = ri(y);
  if (!flip) g.drawImage(c, x - CL_OX, y - CL_OY);
  else { g.save(); g.translate(x + 24, y - CL_OY); g.scale(-1, 1); g.drawImage(c, -CL_OX, 0); g.restore(); }
}
/* 走路时的腿相位 */
const walkLegs = (t, fps = 6) => [1, 0, 2, 0][Math.floor(t * fps) % 4];
/* 眨眼：每隔一阵眨一下 */
function blinkEyes(t, seed = 0, base = 'n') { const p = (t + seed * 1.7) % 3.1; return p < .12 ? 'blink' : base; }

/* 对话框头像：在 (cx, cy) 居中画放大的小怪 */
function portraitClawd(o, P = 6) {
  return (g, cx, cy, t) => {
    const c = clawd(Object.assign({}, o, { eyes: o.eyes || blinkEyes(t, 2) }));
    g.save(); g.imageSmoothingEnabled = false;
    const bob = Math.floor(t * 4) % 2;
    g.drawImage(c, Math.round(cx - (CL_OX + 12) * P), Math.round(cy - (CL_OY + 8) * P - bob * P + P * 2), CL_W * P, CL_H * P);
    g.restore();
  };
}

/* ================= 道具 ================= */
const PAL = {
  k: '#1B1730', w: '#FFFFFF', W: '#F2F2F2', g: '#9AA1AD', G: '#6B7180', y: '#FFD84A', Y: '#E8B92E', o: '#FF8A3D', O: '#D9662A',
  r: '#E5322D', R: '#A81E1A', b: '#5EC8FF', B: '#2F7FC1', n: '#8A5A35', N: '#5E3B22', t: '#C98B4A', T: '#E8C08A', c: '#F2E3C8',
  l: '#7DBB57', L: '#3E7D3A', m: '#5A9E45', s: '#C9D3DE', S: '#8FA3B8', p: '#F2A0A0', v: '#A88BD8', e: '#2B2547', a: '#6FD3FF',
};
const ANTELOPE = () => spr('antelope', [
  'k...........',
  '.k..........',
  '.tt.........',
  'ttT........t',
  '..tttttttttt',
  '..tccccctt..',
  '..k.k...k.k.',
  '..k.k...k.k.',
], PAL);
const CHICK = () => spr('chick', [
  '....yyyy....',
  '...yyyyyy...',
  '..yyyyykyy..',
  '..yyyyyyyoo.',
  '..yyyyyyyy..',
  '.yYyyyyyyy..',
  'yYYyyyyyyy..',
  'yYyyyyyyyy..',
  '.yyyyyyyy...',
  '..yyyyyy....',
  '...o..o.....',
  '..oo.oo.....',
], PAL);
const GOGGLE = () => spr('goggle', [
  '.kkkkkkkk.',
  'kwwwwwwwwk',
  'kwwwwwwwwk',
  '.kkkkkkkk.',
], { k: '#3B3363', w: 'rgba(235,245,255,.85)' });
const PHONE = () => spr('phone', [
  'kkkkkkkk',
  'kaaaaaak',
  'kawwaaak',
  'kaaaaaak',
  'kawwwaak',
  'kaaaaaak',
  'kawwaaak',
  'kaaaaaak',
  'kaaaaaak',
  'kkkkkkkk',
  'kkkggkkk',
  'kkkkkkkk',
], PAL);
const BOOKS = () => spr('books', [
  '..rrrrrrrrrr..',
  '..rwwwwwwwwR..',
  '.bbbbbbbbbbbb.',
  '.bwwwwwwwwwwB.',
  'yyyyyyyyyyyyyy',
  'ywwwwwwwwwwwwY',
  '.llllllllllll.',
  '.lwwwwwwwwwwL.',
], PAL);
const TABLET = () => spr('tablet', [
  'kkkkkkkkkkkk',
  'kaaaaaaaaaak',
  'kawwwaaayyak',
  'kaaaaaaayyak',
  'kawwwwaaaaak',
  'kaaaaaaaaaak',
  'kkkkkkkkkkkk',
], PAL);
const WHISTLE = () => spr('whistle', [
  '..sssss..',
  '.swwwwwss',
  'sswkkwwSs',
  '.sSSSSSs.',
  '..sSSs...',
], PAL);
const HAMMER_UP = () => spr('hammer_up', [
  '.gggg.',
  '.gGGg.',
  '..nn..',
  '..nn..',
  '..nn..',
  '..NN..',
], PAL);
const HAMMER_DN = () => spr('hammer_dn', [
  '....gg',
  'nnnNgG',
  'nnnNgG',
  '....gg',
], PAL);
const CONE = () => spr('cone', [
  '..oo..',
  '..ww..',
  '.oooo.',
  '.wwww.',
  '.oooo.',
  'oooooo',
  'OOOOOO',
], PAL);
const SYRINGE = () => spr('syringe', [
  '.......ggg.....',
  'k.ggggggggggg..',
  'kkgbbbbbbbbbgkk',
  'k.ggggggggggg..',
  '.......ggg.....',
], PAL);
const CLOCK = () => spr('clock', [
  '..kkkkk..',
  '.kwwwwwk.',
  'kwwwkwwwk',
  'kwwwkwwwk',
  'kwwwkkkwk',
  'kwwwwwwwk',
  'kwwwwwwwk',
  '.kwwwwwk.',
  '..kkkkk..',
], PAL);
const BUTTERFLY = [
  () => spr('bf0', ['v.v', 'vkv', 'v.v'], PAL),
  () => spr('bf1', ['...', 'vkv', '...'], PAL),
];
const STAR4 = () => spr('star4', ['..w..', '..w..', 'wwwww', '..w..', '..w..'], PAL);

/* 程序化道具 */
function drawAcacia(g, x, y, s = 1) { // (x,y) 为树根中心
  const tr = '#6B4A2E';
  prect(g, x - 1, y - 14 * s, 3, 14 * s, tr);
  pline(g, x, y - 10 * s, x - 7 * s, y - 17 * s, tr); pline(g, x + 1, y - 10 * s, x - 6 * s, y - 17 * s, tr);
  pline(g, x, y - 12 * s, x + 8 * s, y - 18 * s, tr); pline(g, x + 1, y - 12 * s, x + 9 * s, y - 18 * s, tr);
  pell(g, x, y - 19 * s, 17 * s, 3.2 * s, '#3E7D3A');
  pell(g, x - 5 * s, y - 21 * s, 10 * s, 2.4 * s, '#5A9E45');
  pell(g, x + 6 * s, y - 20.5 * s, 9 * s, 2.2 * s, '#5A9E45');
  pell(g, x - 2 * s, y - 22.5 * s, 7 * s, 1.2 * s, '#7DBB57');
}
function drawRoundTree(g, x, y, s = 1, pal = ['#2F6E35', '#3E8E41', '#5DB65A', '#7FD06E']) {
  prect(g, x - 2, y - 12 * s, 4, 12 * s, '#6B4A2E');
  pdisc(g, x, y - 20 * s, 11 * s, pal[0]);
  pdisc(g, x - 5 * s, y - 18 * s, 7 * s, pal[1]); pdisc(g, x + 5 * s, y - 19 * s, 7 * s, pal[1]);
  pdisc(g, x - 2 * s, y - 24 * s, 7 * s, pal[2]);
  pdisc(g, x - 4 * s, y - 26 * s, 3 * s, pal[3]);
}
function drawCloud(g, x, y, s = 1, col = '#FFFFFF', sh = '#DDEBFA') {
  pell(g, x, y + 2 * s, 14 * s, 3 * s, sh);
  pell(g, x, y, 14 * s, 3 * s, col); pdisc(g, x - 5 * s, y - 2 * s, 5 * s, col); pdisc(g, x + 4 * s, y - 3 * s, 6 * s, col);
}
function drawRock(g, x, y, w, h) { // (x,y) 底边中心
  pell(g, x, y - h / 2, w / 2, h / 2, '#8C7A6B');
  pell(g, x - w * .08, y - h * .62, w * .4, h * .34, '#A8968A');
  pell(g, x - w * .18, y - h * .78, w * .2, h * .14, '#C2B3A8');
  prect(g, x - w / 2 + 2, y - 1, w - 4, 1, '#5E5046');
}
/* 太阳吉祥物：(x,y) 中心 */
function drawSun(g, x, y, r, t = 0, o = {}) {
  const rays = 12, rot = o.spin ? t * .6 : 0;
  for (let i = 0; i < rays; i++) {
    const a = rot + i * TAU / rays, l = r + 4 + ((i % 2) ? 2 : 4) + Math.round(Math.sin(t * 6 + i) * .8);
    pline(g, x + Math.cos(a) * (r + 2), y + Math.sin(a) * (r + 2), x + Math.cos(a) * l, y + Math.sin(a) * l, '#FFC93C');
  }
  pdisc(g, x, y, r, '#FFC93C'); pdisc(g, x - 1, y - 1, r - 2, '#FFE066'); pdisc(g, x - r * .35, y - r * .35, Math.max(1, r * .25), '#FFF6B8');
  if (o.face !== false) {
    const ex = Math.max(2, Math.round(r * .35)), ey = Math.round(r * -.1);
    if (o.shades) { prect(g, x - ex - 2, y + ey - 1, 5, 3, C.ink); prect(g, x + ex - 2, y + ey - 1, 5, 3, C.ink); prect(g, x - ex + 3, y + ey - 1, 2 * ex - 5, 1, C.ink); }
    else { prect(g, x - ex, y + ey, 2, 2, '#7A4A10'); prect(g, x + ex - 1, y + ey, 2, 2, '#7A4A10'); }
    prect(g, x - 2, y + ey + 4, 5, 1, '#7A4A10'); pdot(g, x - 3, y + ey + 3, '#7A4A10'); pdot(g, x + 3, y + ey + 3, '#7A4A10');
    pdot(g, x - ex - 2, y + ey + 3, '#FF9A6B'); pdot(g, x + ex + 2, y + ey + 3, '#FF9A6B');
  }
}
/* 学校图标（广州那段用） */
function drawSchool(g, x, y, sunny = false) { // (x,y) 左下角，16×14
  prect(g, x, y - 10, 16, 10, '#F1E6D2'); prect(g, x, y - 11, 16, 1, '#C9B79C');
  for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) prect(g, x + 2 + i * 5, y - 9 + j * 4, 3, 2, sunny ? '#FFE9A8' : '#8FB6D9');
  prect(g, x + 7, y - 3, 2, 3, '#8A5A35');
  prect(g, x + 13, y - 18, 1, 8, '#6B7180'); prect(g, x + 14, y - 18, 3, 2, '#E5322D');
}
