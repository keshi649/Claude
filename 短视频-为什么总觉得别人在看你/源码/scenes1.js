'use strict';
/* scenes1.js：共用的小工具；开头（食堂里奶茶洒了一身，满眼都是盯着你的眼睛 → 盖章"想多了" → 大头 T 恤实验 →
   猜一半、实际不到四分之一 → 线索：脑子里的聚光灯）；封面。
   开头照第一集的路子：先替观众说出最常见的想法，马上盖章推翻，再给证据、抛线索，前 20 秒切三次镜头（亮、暗交替）。
   关键的字都放在安全区里（x 60~900、y 200~1540），不让平台的按钮挡住。 */

/* ================= 共用 ================= */
function popTag(g, t, t0, x, y, s, px = 36, o = {}) {
  const p = pop(t, t0, .3) * (o.t1 ? clamp((o.t1 - t) / .2) : 1);
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p); ptag(g, 0, 0, s, px, o); g.restore();
}
function popText(g, t, t0, t1, s, x, y, px, col, o = {}) {
  const p = pop(t, t0, .3) * clamp((t1 - t) / .2);
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p); g.rotate(o.rot || 0);
  ptext(g, s, 0, px * .35, px, col, { align: 'center', ol: o.ol || C.ink, olw: o.olw || px / 12 * 1.5, sh: 1 });
  g.restore();
}
function put(g, name, sx, sy, sw, sh, dx, dy, k) { g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF[name], sx, sy, sw, sh, dx, dy, sw * k, sh * k); g.restore(); }
/* 研究出处：小号灰字 */
function source(g, s, x, y, o = {}) { ptext(g, s, x, y, o.px || 22, o.col || '#9C93C0', { align: o.align || 'right' }); }
/* 头像 */
const PORTRAIT = {
  you: portraitClawd({ scarf: true }),
  youShock: portraitClawd({ scarf: true, stain: true, eyes: 'wide', mouth: 'o', flush: true }),
  youSad: portraitClawd({ scarf: true, eyes: 'tired' }),
  youHappy: portraitClawd({ scarf: true, stain: true, eyes: 'happy', mouth: 'smile' }),
};
/* 观众网格里的小怪：lit 时抬头看（亮色、头上一个"！"），不然低头玩手机（灰） */
function gridCrab(g, cx, by, k, i, lit, t) {
  if (lit > 0) {
    const p = E.back(clamp(lit));
    g.save(); g.fillStyle = `rgba(255,211,78,${.45 * clamp(lit)})`; g.fillRect(cx - 15 * k, by - 20 * k, 30 * k, 21 * k); g.restore();
    crabAt(g, cx, by - Math.round((p - 1) * 2 * k), k, person(i, { eyes: 'up', hat: undefined, glasses: undefined }));
    if (lit > .6) ptext(g, '！', cx, by - 18 * k, 12 * k, C.red, { align: 'center' });
  } else crabAt(g, cx, by, k, { col: '#B9B3C9', eyes: 'dn', phone: true });
}
/* 0..n-1 打乱的顺序（固定种子），决定哪几个人抬头 */
function order(n, seed) { const r = R(seed), a = [...Array(n).keys()]; for (let i = n - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

/* ================= 开头 ================= */
function hook(g, t) {
  if (window.COVER) { coverArt(g, t); return; }
  if (t < S('h3') - .12) { hookCanteen(g, t); return; }
  if (t < S('h4') - .12) { hookShirt(g, t); return; }
  if (t < S('h5') - .12) { hookStats(g, t); return; }
  hookSpot(g, t);
}
function titleBlock(g, t, y0 = 250, sc = 1) {
  const tp = 1 + .012 * Math.sin(t * 4);
  g.save(); g.translate(480, y0); g.scale(tp * sc, tp * sc); g.rotate(-.02);
  ptext(g, '为什么你总觉得', 0, 24, 72, C.white, { align: 'center', ol: C.ink, olw: 7, sh: 1 });
  ptext(g, '别人在看你？', 0, 168, 120, C.amber, { align: 'center', ol: C.ink, olw: 10, sh: 1 });
  g.restore();
}
/* 想象中盯着你的眼睛：位置、出现的先后 */
const EYES = [[120, 1100, .45], [154, 948, .55], [249, 824, .65], [387, 752, .75], [573, 752, .85], [711, 824, .95], [806, 948, 1.05], [840, 1100, 1.15], [300, 560, 1.3], [660, 560, 1.4]];
function stareEyes(g, t, t0, gone, o = {}) {
  EYES.forEach(([x, y, d], i) => {
    const p = pop(t, t0 + d, .25); if (p <= 0) return;
    const sh = clamp((t - gone - i * .03) / .22), bob = Math.round(Math.sin(t * 3 + i) * 6);
    if (sh >= 1) return;
    const blink = ((t + i * .37) % 2.3) < .1 ? .85 : 0;
    g.save(); g.translate(x, y + bob); g.scale(p, p); bigEye(g, 0, 0, o.k || 12, clamp((480 - x) / 250, -1, 1), Math.max(sh, blink)); g.restore();
  });
}
/* 食堂（缓冲里的场景，P=10）：桌边的人在刷手机、干饭；"你"也可以画在缓冲里（结尾用） */
function canteenScene(b, t, o = {}) {
  canteen(b, t);
  // 左桌：刷手机；右桌：低头吃面
  drawClawd(b, 5, 92, person(1, { eyes: 'dn', phone: true }));
  drawClawd(b, 74, 92, person(3, { eyes: 'happy' }));
  canteenTable(b, 0, 104, 34); canteenTable(b, 70, 104, 38);
  drawBowl(b, 82, 101, t);
  if (o.you === false) return;
  const wx = o.youX ?? 36, wy = o.youY ?? 104;
  drawClawd(b, wx, wy, youO(t, o.youO || {}));
  if (o.tea) drawTea(b, wx + 22, wy - 1, 6, 9, .55, t, { tea: '#C99060' });
}
/* 奶茶杯（屏幕上按 k 倍画）：(x,y) 杯身左上；ang 转角 */
function teaAt(g, t, x, y, k, fill, ang = 0) {
  const tb = pbuf('teaBuf', 10, 16); drawTea(tb, 2, 5, 6, 9, fill, t, { tea: '#C99060' });
  g.save(); g.translate(Math.round(x + 5 * k), Math.round(y + 4 * k)); g.rotate(ang); put(g, 'teaBuf', 0, 0, 10, 16, -7 * k, -9 * k, k); g.restore();
}
/* 1. 食堂："你"端着奶茶，一绊，洒了一身；灯暗下来，满眼都是盯着你的眼睛 → 盖章"想多了"：其实大家都在忙自己的 */
function hookCanteen(g, t) {
  const b = pbuf('hc', 108, 192);
  canteenScene(b, t, { you: false });
  blit(g, 'hc', 10);
  // 想象：灯暗下来，一束光打在你身上
  const dark = win(t, .35, S('h2') + .25, .3, .3);
  if (dark > 0) {
    g.save(); g.globalAlpha = dark * .6; g.fillStyle = '#1A1030'; g.fillRect(0, 0, W, H); g.restore();
    spotCone(g, 480, -40, 480, 1252, 250, .22 * dark, { r0: 60 });
  }
  // "你"：前景，大一号
  const k = 14, splash = .02, cx = 480, by = 1252 + (t < splash + .12 ? -28 : 0);
  shadowAt(g, cx, 1252, k);
  crabAt(g, cx, by, k, youO(t, { stain: true, eyes: t < S('h2') ? 'wide' : 'n', mouth: t < S('h2') ? 'o' : undefined, flush: t < S('h2') + .3, arms: t < .3 ? 'upR' : 'n' }));
  // 飞出去的奶茶和溅起来的奶茶
  const u = clamp((t - splash) / .45);
  if (u < 1) teaAt(g, t, cx + 150 + u * 230, by - 250 - Math.sin(u * Math.PI) * 120 + u * 230, k, .1, u * 5);
  else teaAt(g, t, cx + 300, 1252 - 70, k, 0, Math.PI / 2);
  const r = R(7);
  for (let i = 0; i < 10; i++) {
    const a = -Math.PI * (.1 + r() * .8), sp = 140 + r() * 200, tt = clamp((t - splash) / .5);
    if (tt < 1) { g.fillStyle = i % 2 ? '#8A5634' : '#C99060'; g.fillRect(Math.round(cx + 90 + Math.cos(a) * sp * tt), Math.round(by - 140 + Math.sin(a) * sp * tt + 380 * tt * tt), k, k); }
  }
  stareEyes(g, t, 0, S('h2') + .2);
  titleBlock(g, t);
  dialogBox(g, t, 'd1', PORTRAIT.youShock, { extra: S('h3') - EN('d1') - .3 });
  // 盖章：想多了
  if (t > S('h2') - .05) {
    g.save(); g.translate(480, 800); g.rotate(-.1); g.fillStyle = `rgba(255,255,255,${.85 * clamp((t - S('h2')) / .2)})`; g.fillRect(-240, -90, 480, 180); g.restore();
  }
  stamp(g, 480, 800, '想多了', clamp((t - S('h2') + .05) / .25), { px: 108, rot: -.1 });
  // 其实大家都在忙自己的
  popTag(g, t, S('h2') + .35, 170, 885, '刷手机', 30, { fill: '#D7D3E0' });
  popTag(g, t, S('h2') + .5, 800, 885, '干饭中', 30, { fill: '#D7D3E0' });
}
/* 2. 实验：大学生穿上印着过气歌手大头照的 T 恤，走进一屋子同学中间（暗色） */
const SINGER = ['....hhhhhhhh....', '..hhhHhhhhHhhh..', '.hhhhhhhhhhhhhh.', 'hhhHhssssssshhhh', 'hhhhsssssssssshh', 'hhhsbbbssbbbsshh',
  'hhsssksssskssshh', '.hssssssssssssh.', '.hsssssnnsssssh.', '..hsrrrrrrrrsh..', '..hsrwwwwwwrsh..', '...ssrrrrrrss...', '....ssssssss....', '.....ssssss.....'];
const SINGER_PAL = { h: '#5A3A22', H: '#7A5234', s: '#F2C9A0', b: '#3A2414', k: '#1B1730', n: '#D9A780', r: '#D9443B', w: '#FFFFFF' };
function singerFace(g, cx, cy, k) {
  SINGER.forEach((r, j) => { for (let i = 0; i < 16; i++) { const c = SINGER_PAL[r[i]]; if (c) { g.fillStyle = c; g.fillRect(Math.round(cx + (i - 8) * k), Math.round(cy + (j - 7) * k), k, k); } } });
}
function hookShirt(g, t) {
  bgGrid(g, t, '#1C2238');
  popTag(g, t, S('h3') - .05, 480, 270, '真实实验', 44, { fill: C.gold });
  // 一屋子同学（低头做题），说到"走进一屋子同学中间"时围上来
  const sp = E.out(clamp((t - CH('h3', 2) + .25) / .4));
  const SEAT = [[180, 900, -1], [240, 1180, -1], [780, 900, 1], [720, 1180, 1], [480, 1230, 0]];
  if (sp > 0) SEAT.forEach(([x, y, s], i) => {
    const dx = s * (1 - sp) * 420, dy = s === 0 ? (1 - sp) * 300 : 0;
    const look = t > CH('h3', 2) + .4 + i * .2 && i % 3 === 1;               // 偶尔有人抬头瞄一眼
    shadowAt(g, x + dx, y + dy, 6);
    crabAt(g, x + dx, y + dy, 6, person(i + 2, { eyes: look ? (s > 0 ? 'l' : 'r') : 'dn', phone: !look && i % 2 === 0 }), false);
  });
  // 穿大头 T 恤的同学
  const nerv = t > CH('h3', 2) + .1;
  shadowAt(g, 480, 1000, 12);
  crabAt(g, 480, 1000, 12, { col: TONES.blue, shirt: true, eyes: nerv ? (Math.floor(t * 2) % 2 ? 'l' : 'r') : blinkEyes(t, 2), flush: nerv, sweat: nerv, legs: t < S('h3') + .6 ? walkLegs(t, 8) : 0 });
  // 放大镜：胸前的大头照
  const pm = pop(t, CH('h3', 1) - .2, .35);
  if (pm > 0) {
    g.save(); g.translate(760, 560); g.scale(pm, pm);
    magnifier(g, 0, 0, 130, gg => { gg.fillStyle = '#F4F4F4'; gg.fillRect(-140, -140, 280, 280); singerFace(gg, 0, 6, 12); gg.fillStyle = '#F28CB0'; gg.fillRect(-100, -80, 12, 12); gg.fillRect(88, 40, 12, 12); }, { ang: -.7 });
    g.restore();
    withAlpha(g, clamp(pm), () => pixArrow(g, 640, 680, 545, 880, 8, C.gold, clamp((t - CH('h3', 1) + .1) / .3)));
  }
  popTag(g, t, CH('h3', 1) - .1, 760, 735, '过气歌手大头照', 34, { fill: '#F28CB0' });
}
/* 3. 猜一半 vs 实际不到四分之一（亮色方格纸）：上下两块，每块 30 个小怪 */
const GUESS = order(30, 11).slice(0, 15), REAL = order(30, 5).slice(0, 7);
function crabGrid(g, t, y0, litSet, tLit, o = {}) {
  const k = 3;
  for (let i = 0; i < 30; i++) {
    const c = i % 6, r = Math.floor(i / 6), cx = 200 + c * 112, by = y0 + r * 64;
    const rank = litSet.indexOf(i), lit = rank < 0 ? 0 : clamp((t - tLit - rank * (o.dt || .04)) / .25);
    gridCrab(g, cx, by, k, i, lit, t);
  }
}
function hookStats(g, t) {
  bgPaper(g);
  // 上：穿的人猜
  const p1 = E.out(clamp((t - S('h4') + .1) / .3));
  if (p1 > 0) withAlpha(g, p1, () => {
    ptext(g, '穿的人猜：', 110, 340, 48, C.ink);
    crabGrid(g, t, 450, GUESS, CH('h4', 1) - .1);
  });
  popText(g, t, CH('h4', 1) - .1, 99, '一半', 760, 320, 96, C.amber, { olw: 6 });
  // 下：实际
  const p2 = E.out(clamp((t - CH('h4', 2) + .25) / .3));
  if (p2 > 0) withAlpha(g, p2, () => {
    ptext(g, '实际注意到：', 110, 830, 48, C.ink);
    crabGrid(g, t, 940, REAL, CH('h4', 3) - .1, { dt: .07 });
  });
  popText(g, t, CH('h4', 3) - .1, 99, '不到 1/4', 720, 810, 84, '#E5574F', { olw: 6 });
  source(g, 'Gilovich 等 2000（大头 T 恤实验）', 900, 1235, { col: '#8A80B0' });
}
/* 4. 线索：黑漆漆的舞台，"你"一脸问号；头顶降下一盏聚光灯，啪地打在你身上 */
function hookSpot(g, t) {
  g.fillStyle = '#0E0B1A'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.03)'; for (let y = 1160; y < H; y += 36) g.fillRect(0, y, W, 18);
  const on = clamp((t - CH('h5', 2) + .2) / .12), flick = on > 0 && on < 1 ? (Math.floor(t * 30) % 2) : 1;
  const ly = lerp(150, 470, E.out(clamp((t - CH('h5', 1) + .25) / .5)));
  if (on > 0) spotCone(g, 480, ly + 10, 480, 1160, 230, .34 * on * flick);
  spotLamp(g, 480, ly, 8, on * flick);
  shadowAt(g, 480, 1160, 10);
  crabAt(g, 480, 1160, 10, youO(t, { stain: true, eyes: on > 0 ? 'wide' : (Math.floor(t * 1.5) % 2 ? 'l' : 'r'), flush: on > 0, mouth: on > 0 ? 'o' : undefined }));
  // 问号
  [[290, 860, 0], [690, 820, .12], [480, 700, .24]].forEach(([x, y, d]) => {
    const p = pop(t, S('h5') - .1 + d, .3) * (1 - clamp((t - CH('h5', 2) + .2) / .2));
    if (p > 0) { g.save(); g.translate(x, y + Math.sin(t * 4 + d * 9) * 8); g.scale(p, p); ptext(g, '？', 0, 40, 120, C.gold, { align: 'center', ol: C.ink, olw: 8 }); g.restore(); }
  });
  popTag(g, t, CH('h5', 1) - .1, 480, 250, '你脑子里的……', 40, { fill: '#D7D3E0' });
  popTag(g, t, CH('h5', 2) + .25, 480, 330, '聚光灯效应', 48, { fill: C.gold });
}

/* 封面：大标题 + 食堂里洒了一身奶茶的"你" + 一圈盯着你的眼睛 + 红章 */
function coverArt(g, t) {
  const b = pbuf('cov', 108, 192);
  canteenScene(b, 0, { you: false });
  blit(g, 'cov', 10);
  g.save(); g.globalAlpha = .55; g.fillStyle = '#1A1030'; g.fillRect(0, 0, W, H); g.restore();
  spotCone(g, 480, -40, 480, 1252, 260, .3, { r0: 60 });
  shadowAt(g, 480, 1252, 14);
  crabAt(g, 480, 1252, 14, youO(0, { stain: true, eyes: 'wide', mouth: 'o', flush: true }));
  teaAt(g, 0, 780, 1182, 14, 0, Math.PI / 2);
  EYES.forEach(([x, y], i) => bigEye(g, x, y, 12, clamp((480 - x) / 250, -1, 1)));
  titleBlock(g, 0, 230, 1.08);
  g.save(); g.translate(480, 1420); g.rotate(-.08); g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(-300, -95, 600, 190); g.restore();
  stamp(g, 480, 1420, '想多了', 1, { px: 120, rot: -.08 });
}
