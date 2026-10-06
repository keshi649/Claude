'use strict';
/* chars.js：Clawd（Claude 的像素形象）和"你"（短发女孩），以及路人。 */

/* ---------------- Clawd ----------------
   12×8 格：身体 (2,0)-(10,6)，两只手 (0,2)-(2,4) / (10,2)-(12,4)，
   四条腿在第 2/4/7/9 列、第 6–8 行，眼睛在 (3,1) 和 (8,1)。颜色取自给的图：#CB7C5E，眼睛 #131514。
   (x, y) 是脚底中心，u 是一格的像素数（默认 2）。
   o：eyes（n 正常 | blink | happy | closed | wide | sad | heart | dot | squint | x）、look（眼睛左右 -1/0/1）、
      armL / armR（举手，格数 0–2）、walk（走路相位）、hop（离地高度，像素）、sq（压扁 0–1）、
      blush、sweat、heart（胸口的心，0–1 发光）、col（换色）、shade（受光方向 -1 左 / 1 右）、alpha */
const CLAWD = '#CB7C5E', CLAWD_D = '#A9614A', CLAWD_L = '#E2977A', EYE = '#131514';
function clawd(g, x, y, o = {}) {
  const u = o.u || 2, col = o.col || CLAWD;
  const lift = rd(o.hop || 0);
  const sq = o.sq || 0;                       // 压扁：身体矮一格、宽一点
  const bx = rd(x - 6 * u), by = rd(y - 8 * u - lift + (sq > .5 ? u : 0));
  g.save(); if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  // 影子
  if (o.shadow !== false && !o.noShadow) { g.fillStyle = 'rgba(10,8,20,.28)'; g.fillRect(bx + u, rd(y), 10 * u, Math.max(1, u >> 1)); }
  const C = (cx, cy, w, h, c) => rect(g, bx + cx * u, by + cy * u, w * u, h * u, c);
  // 腿
  const legs = [2, 4, 7, 9];
  legs.forEach((c, i) => {
    let l = 0;
    if (o.walk !== undefined) l = Math.max(0, Math.sin(o.walk * TAU + (i % 2) * Math.PI)) > .3 ? 1 : 0;
    if (o.legsUp) l = 1;
    rect(g, bx + c * u, by + 6 * u - (sq > .5 ? u : 0), u, 2 * u - l * Math.max(1, u >> 1) + (sq > .5 ? u : 0), col);
  });
  // 身体
  if (sq > .5) { C(1.5, 1, 9, 5, col); }
  else C(2, 0, 8, 6, col);
  // 手
  const aL = o.armL || 0, aR = o.armR || 0;
  C(0, 2 - aL, 2, 2, col); C(10, 2 - aR, 2, 2, col);
  // 受光的一侧亮一点、底边暗一点（很克制，保持原图的平涂感）
  if (o.shade) {
    const lit = o.shadeCol || CLAWD_L;
    if (o.shade > 0) rect(g, bx + 10 * u - 1, by, 1, 6 * u, lit); else rect(g, bx + 2 * u, by, 1, 6 * u, lit);
  }
  if (o.dark) rect(g, bx + 2 * u, by + 6 * u - 1, 8 * u, 1, o.dark === true ? CLAWD_D : o.dark);
  // 胸口的心（X 光、透光时露出来）
  if (o.heart) {
    const hc = mix('#E8506E', '#FF9DB4', o.heart), cx0 = bx + 6 * u - 3, cy0 = by + 3 * u - 1;
    const HP = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
    HP.forEach((r, j) => { for (let i = 0; i < 7; i++) if (r[i] === '#') px(g, cx0 + i - 1 + (u > 2 ? 0 : 1), cy0 + j - 1, hc); });
  }
  // 眼睛
  eyesC(g, bx, by, u, o);
  if (o.blush) { const a = g.globalAlpha; g.globalAlpha = a * o.blush; rect(g, bx + 2 * u + 1, by + 3 * u - 1, u, Math.max(1, u >> 1), '#F09AA0'); rect(g, bx + 9 * u - 1, by + 3 * u - 1, u, Math.max(1, u >> 1), '#F09AA0'); g.globalAlpha = a; }
  if (o.sweat) { const s = o.sweat; rect(g, bx + 10 * u + 1, by - 1 + rd(s * 2), 1, 2, '#9FD3F5'); px(g, bx + 10 * u + 1, by - 2 + rd(s * 2), '#D9F0FF'); }
  g.restore();
}
function eyesC(g, bx, by, u, o) {
  const k = o.eyes || 'n', lk = rd(o.look || 0) * Math.max(1, u >> 1), t = o.t ?? 0;
  let kind = k;
  if (k === 'n' && o.blinkOK !== false) { const ph = (t + (o.ph || 0)) % 3.7; if (ph < .12) kind = 'blink'; }
  const ex = [bx + 3 * u + lk, bx + 8 * u + lk], ey = by + u + (o.lookY || 0);
  const P = (x, y, w = 1, h = 1, c = EYE) => rect(g, x, y, w, h, c);
  for (let s = 0; s < 2; s++) {
    const x = ex[s], y = ey;
    switch (kind) {
      case 'n': P(x, y, u, u); break;
      case 'dot': P(x + (u > 1 ? (u >> 1) - 1 + 1 : 0), y + (u >> 1), Math.max(1, u >> 1), Math.max(1, u >> 1)); break;
      case 'blink': P(x, y + u - 1, u, 1); break;
      case 'closed': P(x - 1, y + u - 1, u + 2, 1); break;
      case 'wide': P(x, y - 1, u, u + 2); if (u >= 2) P(x, y - 1, 1, 1, '#F4EFE6'); break;
      case 'happy': if (u >= 2) { P(x, y, u, 1); P(x - 1, y + 1, 1, 1); P(x + u, y + 1, 1, 1); } else P(x, y, 1, 1); break;
      case 'sad': if (u >= 2) { if (s === 0) { P(x, y + 1, u, u - 1); P(x + u - 1, y, 1, 1); } else { P(x, y + 1, u, u - 1); P(x, y, 1, 1); } } else P(x, y, 1, 1); break;
      case 'squint': if (u >= 2) { if (s === 0) { P(x - 1, y - 1); P(x, y); P(x + 1, y + 1); P(x, y + 2); P(x - 1, y + 3); } else { P(x + u, y - 1); P(x + u - 1, y); P(x + u - 2, y + 1); P(x + u - 1, y + 2); P(x + u, y + 3); } } else P(x, y, 1, 1); break;
      case 'x': if (u >= 2) { P(x - 1, y - 1); P(x + u, y - 1); P(x, y); P(x + u - 1, y); P(x, y + u - 1); P(x + u - 1, y + u - 1); P(x - 1, y + u); P(x + u, y + u); } break;
      case 'heart': { const hc = '#FF4F86'; P(x - 1, y - 1, 1, 1, hc); P(x + 1, y - 1, 1, 1, hc); P(x - 1, y, 3, 1, hc); P(x, y + 1, 1, 1, hc); break; }
      case 'up': P(x, y - 1, u, u); break;
    }
  }
}
/* 头顶符号：? ! … ♥ 汗，用像素字或小图 */
function mark(g, x, y, kind, t, t0, t1 = 1e9, col = '#FFF6E0') {
  if (t < t0 || t > t1) return;
  const u = clamp((t - t0) / .15), a = clamp((t1 - t) / .15);
  const dy = rd((1 - E.back(u)) * 4);
  g.save(); g.globalAlpha *= a;
  if (kind === '♥') { const H = ['.#.#.', '#####', '#####', '.###.', '..#..']; H.forEach((r, j) => { for (let i = 0; i < 5; i++) if (r[i] === '#') px(g, x - 2 + i, y - 4 + j + dy, '#FF5C8A'); }); }
  else if (kind === '…') { for (let i = 0; i < 3; i++) if (t - t0 > i * .18) px(g, x - 3 + i * 3, y + dy, col); }
  else ptext(g, kind, x, y - 11 + dy, col, { size: 12, align: 'c', shadow: 'rgba(0,0,0,.35)' });
  g.restore();
}

/* ---------------- 你（短发女孩） ----------------
   3/4 侧面，默认朝右；(x, y) 是脚底中心。身高 34 像素。
   pose：stand | walk | sit | type | chin | sleep | reach | hold | look（抬头）| crouch
   o：flip（朝左）、walk（走路相位）、t（眨眼用）、eyes（n | closed | happy | wide）、arm（手臂抬起 0–1）、
      mouth（0–1 张嘴）、bag（挎包）、umbrella、pal（换装） */
const GIRL = {
  K: '#2B2433', k: '#4A3E5E', S: '#F5CFB0', s: '#DFA78A', E: '#2A2230', r: '#EE9C98',
  Y: '#E6A33E', y: '#BE7E25', W: '#F4F0E8', N: '#34446B', n: '#26324F', F: '#F1ECE4', f: '#A39B92', B: '#E9DEC2', b: '#C9B78F',
};
const HEAD_R = [
  '....KKKKKK....',
  '..KKKKKKKKKK..',
  '.KKKKKKKKKKKK.',
  '.KKkkKKKKKKKKK',
  'KKkkKKKKKKKKKK',
  'KKKKKKKKKKKKKK',
  'KKKKKKSSKKKSKK',
  'KKKKKSSSSSSSSK',
  'KKKKSSSSSSSSSK',
  'KKKKSSSSSSSSSK',
  'KKKKSSSSSSSSSK',
  'KKKKSSSSSSSSK.',
  '.KKKKsSSSSSS..',
  '..KKK.sSSs....',
];
/* 眼睛、腮红在头上的位置（朝右）：近眼 x=6，远眼 x=11 */
function girlFace(g, hx, hy, o) {
  const t = o.t ?? 0, k = o.eyes || 'n';
  let kind = k; if (k === 'n') { const ph = (t + (o.ph || 0)) % 4.1; if (ph < .12) kind = 'closed'; }
  const P = (x, y, w, h, c) => rect(g, hx + x, hy + y, w, h, c);
  const ex = [6, 10];
  for (const x of ex) {
    if (kind === 'n') P(x, 8, 1, 2, GIRL.E);
    else if (kind === 'closed') P(x, 9, 1, 1, GIRL.E), P(x - 1 + (x === 6 ? 0 : 1), 9, 1, 1, GIRL.E);
    else if (kind === 'happy') { P(x, 8, 1, 1, GIRL.E); P(x - 1, 9, 1, 1, GIRL.E); P(x + 1, 9, 1, 1, GIRL.E); }
    else if (kind === 'wide') P(x, 7, 1, 3, GIRL.E);
    else if (kind === 'up') P(x, 7, 1, 2, GIRL.E);
  }
  P(5, 10, 1, 1, GIRL.r); P(11, 10, 1, 1, GIRL.r);
  if (o.mouth > .3) P(9, 11, 1, 1, '#B8565A');
}
function girl(g, x, y, pose = 'stand', o = {}) {
  const t = o.t ?? 0, pal = Object.assign({}, GIRL, o.pal || {});
  g.save();
  if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  const fx = rd(x), fy = rd(y);
  if (o.flip) { g.translate(fx * 2 + 1, 0); g.scale(-1, 1); }
  const P = (X, Y, w, h, c) => rect(g, fx + X, fy + Y, w, h, c);
  // 走路：腿和手的相位，身体起伏
  const wp = o.walk ?? 0, st = Math.sin(wp * TAU), bobY = pose === 'walk' ? (Math.abs(Math.cos(wp * TAU)) > .7 ? -1 : 0) : 0;
  const sit = pose === 'sit' || pose === 'type' || pose === 'chin' || pose === 'sleep';
  // 影子
  if (o.shadow !== false && !sit) { g.fillStyle = 'rgba(10,8,20,.25)'; g.fillRect(fx - 7, fy, 14, 1); }
  let headX = -7, headY = -34 + bobY, bodyY = -21 + bobY;
  if (sit) { headY = -27; bodyY = -14; }
  if (pose === 'crouch') { headY = -25; bodyY = -13; }
  if (pose === 'sleep') { headY = -27; headX = 1; }
  // 腿
  if (pose === 'walk') {
    const a = rd(st * 3), b = -a;
    P(-3 + a, -9, 3, 7, pal.n); P(-3 + a, -2, 4, 2, pal.F); P(-3 + a, -1, 4, 1, pal.f);
    P(0 + b, -9, 3, 7, pal.N); P(0 + b, -2, 4, 2, pal.F); P(0 + b, -1, 4, 1, pal.f);
  } else if (sit) {
    // 坐着：大腿朝右平伸，小腿垂下
    P(-3, -9, 9, 4, pal.N); P(3, -6, 3, 5, pal.N); P(3, -2, 4, 2, pal.F); P(3, -1, 4, 1, pal.f);
  } else if (pose === 'crouch') {
    P(-4, -8, 8, 4, pal.N); P(1, -5, 3, 4, pal.N); P(-4, -5, 3, 4, pal.n); P(1, -2, 4, 2, pal.F); P(-4, -2, 4, 2, pal.F);
  } else {
    P(-3, -9, 3, 7, pal.n); P(0, -9, 3, 7, pal.N); P(-3, -2, 3, 2, pal.F); P(0, -2, 4, 2, pal.F); P(-3, -1, 3, 1, pal.f); P(0, -1, 4, 1, pal.f);
  }
  // 身体（毛衣 + 白领子）
  const by = fy + bodyY;
  const torso = (sx0) => {
    rect(g, fx - 4 + sx0, by, 9, 12, pal.Y); rect(g, fx - 4 + sx0, by, 1, 12, pal.y);
    rect(g, fx - 4 + sx0, by + 11, 9, 1, pal.y);
    rect(g, fx - 1 + sx0, by, 3, 1, pal.W); rect(g, fx + sx0, by + 1, 1, 1, pal.W);
  };
  if (pose === 'sleep') {
    // 趴在桌上：背往前弓，两只胳膊叠在桌面上，头枕在胳膊上
    rect(g, fx - 5, by + 1, 10, 11, pal.Y); rect(g, fx - 5, by + 1, 1, 11, pal.y);
    rect(g, fx - 4, by - 2, 10, 4, pal.Y); rect(g, fx - 3, by - 4, 9, 3, pal.Y); rect(g, fx - 3, by - 4, 9, 1, mix(pal.Y, '#ffffff', .25));
    rect(g, fx + 3, by - 5, 16, 4, pal.Y); rect(g, fx + 3, by - 2, 16, 1, pal.y); rect(g, fx + 18, by - 5, 2, 4, pal.S);
  } else torso(0);
  // 挎包（后侧）
  if (o.bag) { rect(g, fx - 6, by + 5, 5, 6, pal.B); rect(g, fx - 6, by + 10, 5, 1, pal.b); line(g, fx - 4, by + 5, fx + 1, by, pal.b); }
  // 头
  const hx = fx + headX, hy = fy + headY;
  blit(g, sprite(HEAD_R, pal, 'girlhead' + (o.palKey || '')), hx, hy);
  if (pose !== 'sleep') girlFace(g, hx, hy, Object.assign({ t }, o));
  else { rect(g, hx + 6, hy + 9, 2, 1, pal.E); rect(g, hx + 10, hy + 9, 2, 1, pal.E); P(headX + 5, headY + 10, 1, 1, pal.r); P(headX + 11, headY + 10, 1, 1, pal.r); }
  // 前面的手臂
  const arm = o.arm || 0;
  if (pose === 'walk') {
    const a = rd(st * 2);
    rect(g, fx - 1 - a, by + 2, 3, 7, pal.Y); rect(g, fx - 1 - a, by + 9, 3, 2, pal.S);
  } else if (pose === 'type') {
    const k = (fl(t * 8) % 2);
    rect(g, fx, by + 3, 3, 4, pal.Y); rect(g, fx + 2, by + 5, 6, 3, pal.Y); rect(g, fx + 8, by + 5 + k, 2, 2, pal.S);
  } else if (pose === 'chin') {
    rect(g, fx + 1, by + 2, 3, 7, pal.Y); rect(g, fx + 3, by - 2, 3, 5, pal.Y); rect(g, fx + 4, by - 4, 3, 3, pal.S);
  } else if (pose === 'reach' || arm > 0) {
    const up = rd(arm * 10);
    rect(g, fx, by + 2 - up, 3, 7, pal.Y); rect(g, fx + 1, by - up - 1, 3, 3, pal.S);
    if (arm > .5) rect(g, fx + 3, by + 3 - up, 3, 3, pal.Y);
  } else if (pose === 'hold') {
    rect(g, fx, by + 2, 3, 5, pal.Y); rect(g, fx + 2, by + 5, 5, 3, pal.Y); rect(g, fx + 7, by + 5, 2, 3, pal.S);
  } else if (pose !== 'sleep') {
    rect(g, fx - 1, by + 2, 3, 8, pal.Y); rect(g, fx - 1, by + 10, 3, 2, pal.S);
  }
  // 任意角度的前臂：armA 弧度（0 水平向前，-PI/2 向上），armLen 长度
  if (o.armA !== undefined) {
    const ax = fx + 1, ay = by + 3, len = o.armLen ?? 10, ex = ax + Math.cos(o.armA) * len, ey = ay + Math.sin(o.armA) * len;
    for (let k = -1; k <= 1; k++) line(g, ax + (Math.abs(Math.sin(o.armA)) > .5 ? k : 0), ay + (Math.abs(Math.sin(o.armA)) > .5 ? 0 : k), ex, ey, k ? pal.Y : pal.y);
    rect(g, ex - 1, ey - 1, 3, 3, pal.S);
  }
  g.restore();
}
