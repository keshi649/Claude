'use strict';
/* scenes1.js：共用的小工具；开头（糖果店："草莓味是舌头尝出来的？" → 盖章"是鼻子" → 捏住鼻子吃草莓糖，只尝得出甜 →
   一松手，草莓味冒出来 → 线索：鼻子有两扇门）；封面。
   开头照第一集的路子：先替观众说出最常见的想法，马上盖章推翻，再给证据、抛线索，前 20 秒切 4 次镜头（亮、暗交替）。
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
  ptext(g, s, 0, px * .35, px, col, { align: 'center', ol: o.ol || C.ink, olw: o.olw || 6, sh: 1 });
  g.restore();
}
function put(g, name, sx, sy, sw, sh, dx, dy, k) { g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF[name], sx, sy, sw, sh, dx, dy, sw * k, sh * k); g.restore(); }
/* 研究出处：小号灰字 */
function source(g, s, x, y, o = {}) { ptext(g, s, x, y, o.px || 22, o.col || '#8A80B0', { align: o.align || 'right' }); }
/* 放射光芒（亮底上用） */
function rays(g, x, y, t, col, n = 14) {
  g.save(); g.translate(x, y); g.rotate(t * .4); g.fillStyle = col;
  for (let i = 0; i < n; i++) { g.rotate(TAU / n); g.beginPath(); g.moveTo(0, 0); g.lineTo(-90, -1400); g.lineTo(90, -1400); g.closePath(); g.fill(); }
  g.restore();
}
/* 头像 */
const PORTRAIT = {
  you: portraitClawd({ scarf: true, snout: true }),
  youTongue: portraitClawd({ scarf: true, snout: true, mouth: 'tongue', eyes: 'happy' }),
  youShock: portraitClawd({ scarf: true, snout: true, eyes: 'wide', mouth: 'o' }),
  youHappy: portraitClawd({ scarf: true, snout: true, eyes: 'happy', mouth: 'smile' }),
};

/* ================= 开头 ================= */
function hook(g, t) {
  if (window.COVER) { coverArt(g, t); return; }
  if (t < S('h3') - .12) { hookShop(g, t); return; }
  if (t < S('h4') - .12) { hookClip(g, t); return; }
  if (t < S('h5') - .12) { hookRelease(g, t); return; }
  hookDoors(g, t);
}
function titleBlock(g, t, y0 = 250, sc = 1) {
  const tp = 1 + .012 * Math.sin(t * 4);
  g.save(); g.translate(480, y0); g.scale(tp * sc, tp * sc); g.rotate(-.02);
  ptext(g, '味道是舌头尝的，', 0, 24, 72, C.white, { align: 'center', ol: C.ink, olw: 7, sh: 1 });
  ptext(g, '还是鼻子闻的？', 0, 160, 108, C.amber, { align: 'center', ol: C.ink, olw: 9, sh: 1 });
  g.restore();
}
/* 1. 糖果店："你"把一颗草莓糖丢进嘴里；说"当然是舌头"时吐舌头；盖章"是鼻子" */
function hookShop(g, t) {
  const b = pbuf('hs', 108, 192);
  candyShop(b, t);
  blit(g, 'hs', 10);
  const k = 14, cx = 480, by = 1252, tT = CH('h1', 1) - .6, tossed = t > tT;
  const tongue = t > S('d1') + .1 && t < S('h2') + .1;
  const chew = tossed && !tongue && t < S('h2') && Math.floor(t * 6) % 2 === 0;
  shadowAt(g, cx, by, k);
  crabAt(g, cx, by, k, youO(t, {
    arms: tossed ? 'n' : 'upR',
    eyes: t > S('h2') ? 'wide' : (tongue ? 'happy' : (tossed ? 'squint' : 'r')),
    mouth: t > S('h2') ? 'o' : (tongue ? 'tongue' : (chew ? 'chew' : 'smile')),
  }));
  // 草莓糖：先举在手上，再抛进嘴里
  if (!tossed) { const [hx, hy] = crabPt(cx, by, k, 23, -2); icon(g, 'candy', hx, hy - 30 - Math.round(Math.sin(t * 5) * 6), 8); }
  else if (t < tT + .3) { const u = (t - tT) / .3, [hx, hy] = crabPt(cx, by, k, 23, -2), [mx, my] = crabPt(cx, by, k, 12, 6); icon(g, 'candy', lerp(hx, mx, u), lerp(hy - 30, my, u) - Math.sin(u * Math.PI) * 160, 8); }
  titleBlock(g, t);
  // "草莓味？"
  const pq = pop(t, S('h1') + .25, .3) * clamp((S('h2') - t) / .2);
  if (pq > 0) { g.save(); g.translate(250, 760); g.scale(pq, pq); icon(g, 'straw', 0, 0, 12); ptext(g, '？', 90, 30, 96, C.red, { align: 'center', ol: C.ink, olw: 6 }); g.restore(); }
  // 说到舌头：箭头指着舌头
  if (tongue) { const [mx, my] = crabPt(cx, by, k, 12, 9); withAlpha(g, clamp((t - S('d1') - .1) / .2), () => pixArrow(g, mx + 230, my + 20, mx + 60, my + 10, 10, C.gold, clamp((t - S('d1') - .1) / .3))); }
  dialogBox(g, t, 'd1', PORTRAIT.youTongue, { extra: S('h3') - EN('d1') - .3 });
  // 盖章：是鼻子；旁边弹出一个大鼻子
  if (t > S('h2') - .05) { g.save(); g.translate(480, 790); g.rotate(-.1); g.fillStyle = `rgba(255,255,255,${.85 * clamp((t - S('h2')) / .2)})`; g.fillRect(-250, -90, 500, 180); g.restore(); }
  stamp(g, 480, 790, '是鼻子', clamp((t - S('h2') + .05) / .25), { px: 108, rot: -.1 });
  const pn = pop(t, S('h2') + .2, .3);
  if (pn > 0) { g.save(); g.translate(800, 560); g.scale(pn, pn); drawNose(g, 0, 0, 10, { sniff: t * 1.5 }); g.restore(); }
}
/* 2. 捏住鼻子吃草莓糖：舌头报告——甜 ✓，草莓味 ？？？（暗色） */
function hookClip(g, t) {
  bgGrid(g, t, '#1C2238');
  popTag(g, t, S('h3') - .05, 480, 270, '试试看', 44, { fill: C.gold });
  const k = 12, cx = 480, by = 1150;
  const chewing = t > CH('h3', 1) - .1;
  shadowAt(g, cx, by, k);
  crabAt(g, cx, by, k, youO(t, { clip: true, eyes: 'squint', mouth: chewing && Math.floor(t * 6) % 2 === 0 ? 'chew' : 'o' }));
  popTag(g, t, S('h3') + .1, 700, 880, '捏住鼻子', 36, { fill: '#FF8A7A' });
  // 草莓糖飞进嘴里
  if (t > CH('h3', 1) - .55 && t < CH('h3', 1) - .1) {
    const u = clamp((t - CH('h3', 1) + .55) / .45), [mx, my] = crabPt(cx, by, k, 12, 6);
    icon(g, 'candy', lerp(180, mx, u), lerp(1000, my, u) - Math.sin(u * Math.PI) * 200, 8);
  }
  // 舌头的报告
  const pr = E.out(clamp((t - CH('h3', 2) + .3) / .3));
  if (pr > 0) {
    g.save(); g.globalAlpha *= pr; g.translate(0, (1 - pr) * -40);
    pbox(g, 150, 380, 660, 330, { k: 6 });
    ptext(g, '舌头的报告：', 200, 460, 40, '#CFC6E8');
    const r1 = pop(t, CH('h3', 2) - .15, .3), r2 = pop(t, CH('h3', 3) - .15, .3);
    if (r1 > 0) { tasteBadge(g, 250, 560, 40, '甜', TASTES[1][1]); ptext(g, '尝到了', 320, 578, 48, C.white); checkMark(g, 520, 540, 7, C.green); }
    if (r2 > 0) { g.save(); g.globalAlpha *= clamp(r2); icon(g, 'straw', 250, 650, 7); ptext(g, '草莓味：？？？', 320, 668, 48, '#9C93C0'); g.restore(); }
    g.restore();
  }
}
/* 3. 一松手：鼻夹飞走，草莓味冒出来（亮粉色） */
function hookRelease(g, t) {
  g.fillStyle = '#FFB3C6'; g.fillRect(0, 0, W, H);
  rays(g, 480, 1000, t, 'rgba(255,255,255,.35)');
  const k = 12, cx = 480, by = 1200, t0 = S('h4') - .1;
  shadowAt(g, cx, by, k);
  crabAt(g, cx, by, k, youO(t, { eyes: 'star', mouth: 'smile' }));
  // 鼻夹翻着跟头飞走
  const u = clamp((t - t0) / .7);
  if (u < 1) { const [nx, ny] = crabPt(cx, by, k, 12, 3); g.save(); g.translate(nx - u * 380, ny - Math.sin(u * Math.PI) * 420 + u * 200); g.rotate(u * 9); crabClip(g, 0, 0, k); g.restore(); }
  // 草莓从脸上炸开
  const ub = clamp((t - CH('h4', 1) + .25) / .8), [fx, fy] = crabPt(cx, by, k, 12, 4);
  if (ub > 0) for (let i = 0; i < 12; i++) {
    const a = i / 12 * TAU + .3, d = E.out(ub) * (260 + (i % 3) * 70);
    g.save(); g.globalAlpha *= 1 - ub * .4; icon(g, 'straw', fx + Math.cos(a) * d, fy - 60 + Math.sin(a) * d * .8, 8); g.restore();
  }
  popText(g, t, CH('h4', 1) - .1, 99, '草莓味！', 480, 470, 120, '#E5322D');
}
/* 鼻夹（单独画，飞走用） */
function crabClip(g, x, y, k) {
  const rows = ['d..d', 'r..r', 'rddr', 'wwww', 'rddr', 'r..r'];
  pix(g, rows, { r: '#E5322D', d: '#A81E1A', w: '#F4F4F4' }, x, y, k);
}
/* 4. 线索：黑底上一颗剪影脑袋，前门亮着，后门打着问号 */
function hookDoors(g, t) {
  g.fillStyle = '#140F24'; g.fillRect(0, 0, W, H);
  const b = pbuf('hd', 108, 192);
  b.fillStyle = '#140F24'; b.fillRect(0, 0, 108, 192);
  drawHead(b, { dark: true });
  blit(g, 'hd', 10);
  const pf = pop(t, S('h5') + .1, .35);
  if (pf > 0) {
    g.save(); g.translate(HEAD.nostril[0], HEAD.nostril[1] - 10); g.scale(pf, pf); drawDoor(g, 0, 0, 8, .7); g.restore();
    popTag(g, t, S('h5') + .3, 170, 560, '前门', 40, { fill: '#FFE9A8' });
  }
  const pb = pop(t, CH('h5', 1) - .15, .35);
  if (pb > 0) {
    g.save(); g.translate(HEAD.back[0], HEAD.back[1]); g.scale(pb, pb); drawDoor(g, 0, 0, 8, 0, { frame: '#5A5180', panel: '#3B3363' }); g.restore();
    const q = 1 + .1 * Math.sin(t * 6);
    g.save(); g.translate(HEAD.back[0] + 110, HEAD.back[1] - 90); g.scale(q * pb, q * pb); ptext(g, '？', 0, 40, 132, C.gold, { align: 'center', ol: C.ink, olw: 8 }); g.restore();
    popTag(g, t, CH('h5', 1), 700, 520, '后门？', 40, { fill: '#D7D3E0' });
  }
}

/* 封面：糖果店里夹着鼻夹吃糖的"你" + 大标题 + 红章 */
function coverArt(g, t) {
  const b = pbuf('cov', 108, 192);
  candyShop(b, 0);
  blit(g, 'cov', 10);
  const k = 14, cx = 480, by = 1252;
  shadowAt(g, cx, by, k);
  crabAt(g, cx, by, k, youO(0, { clip: true, eyes: 'squint', mouth: 'chew', arms: 'upR' }));
  const [hx, hy] = crabPt(cx, by, k, 23, -2); icon(g, 'candy', hx, hy - 30, 8);
  icon(g, 'straw', 220, 760, 12); ptext(g, '？', 320, 790, 120, C.red, { align: 'center', ol: C.ink, olw: 8 });
  drawNose(g, 790, 600, 10);
  titleBlock(g, 0, 230, 1.08);
  g.save(); g.translate(480, 1420); g.rotate(-.08); g.fillStyle = 'rgba(255,255,255,.9)'; g.fillRect(-300, -95, 600, 190); g.restore();
  stamp(g, 480, 1420, '是鼻子', 1, { px: 120, rot: -.08 });
}
