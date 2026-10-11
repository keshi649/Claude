'use strict';
/* scenes1.js：共用的小工具；开头（原始人一口白牙、"你"抱着奶茶 → 考古学家数过的牙 → 线索：奶茶的喝法）。
   开头照第一集的路子：先替观众说出最常见的答案，马上盖章推翻，再拿证据、抛线索，前 20 秒切三次镜头。
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
function menuBG(g, t, tint = '#1E1A3A') {
  g.fillStyle = tint; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.04)';
  for (let x = 0; x < W; x += 60) g.fillRect(x, 0, 2, H);
  for (let y = (t * 20) % 60; y < H; y += 60) g.fillRect(0, y, W, 2);
}
function feetShadow(g, x, y, w = 20) { g.save(); g.globalAlpha = .22; prect(g, x + 12 - w / 2, y, w, 1, '#000'); prect(g, x + 12 - w / 2 + 2, y + 1, w - 4, 1, '#000'); g.restore(); }
/* 把一块像素缓冲按整数倍贴到屏幕的某个位置 */
function put(g, name, sx, sy, sw, sh, dx, dy, k) { g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF[name], sx, sy, sw, sh, dx, dy, sw * k, sh * k); g.restore(); }
/* 研究出处：小号灰字 */
function source(g, s, x, y, o = {}) { ptext(g, s, x, y, o.px || 22, o.col || '#9C93C0', { align: o.align || 'right' }); }
/* 像素对勾 */
function checkMark(g, x, y, k = 6, col = C.green) { g.fillStyle = col; [[0, 2], [1, 3], [2, 4], [3, 3], [4, 2], [5, 1], [6, 0]].forEach(([i, j]) => g.fillRect(x + i * k, y + j * k, k, k)); }
/* 像素叉 */
function crossMark(g, x, y, k = 6, col = C.red) { g.fillStyle = col; for (let i = 0; i < 6; i++) { g.fillRect(x + i * k, y + i * k, k, k); g.fillRect(x + (5 - i) * k, y + i * k, k, k); } }
/* 头像 */
const PORTRAIT = {
  you: portraitClawd({ scarf: true }),
  cave: portraitClawd({ hat: 'bone' }),
  bug: portraitClawd({ col: '#8FD14F', eyes: 'angry', spots: true }),
  worker: portraitClawd({ col: '#7FD3F0', hat: 'hard' }),
  workerMad: portraitClawd({ col: '#7FD3F0', hat: 'hard', eyes: 'angry' }),
};
/* 小图标：一颗牙（屏幕坐标，k 为像素大小）；bad：蛀了 */
function toothIcon(g, x, y, k, bad = 0) {
  const rows = ['.wwwwww.', 'wwwwwwww', 'wwwwwwww', 'wwwwwwww', '.wwwwww.', '.ww..ww.', '.ww..ww.', '.w....w.'];
  const full = bad >= .99;
  if (full) { g.fillStyle = 'rgba(255,90,79,.5)'; g.fillRect(x - 3, y - 3, 8 * k + 6, 8 * k + 6); }
  rows.forEach((r, j) => { for (let i = 0; i < 8; i++) if (r[i] === 'w') { g.fillStyle = full ? (j > 4 ? '#6B4A30' : '#9C7450') : (j > 4 ? '#E6DCC8' : '#FBF7EE'); g.fillRect(x + i * k, y + j * k, k, k); } });
  if (full) { g.fillStyle = '#24121A'; g.fillRect(x + 2 * k, y + k, 4 * k, 3 * k); }
  else if (bad > 0) { g.fillStyle = '#3B1E28'; g.fillRect(x + 3 * k, y + 2 * k, 2 * k, k); }
}

/* ================= 开头 ================= */
function hook(g, t) {
  if (window.COVER) { coverArt(g, t); return; }
  if (t < S('h3') - .12) { hookDuo(g, t); return; }
  if (t < S('h5') - .12) { hookGrid(g, t); return; }
  hookClue(g, t);
}
/* 1. 左边石器时代的草原：原始人一口白牙；右边奶茶店："你"抱着奶茶，一笑露出一颗黑牙 */
function hookDuo(g, t) {
  const b = pbuf('hd', 108, 192), hy = 92;
  // 左半：草原
  pbands(b, 0, 54, [[0, '#4FA9E8'], [50, '#7CC6F4'], [hy, '#B5E2FA']], 3);
  drawCloud(b, 18, 62, .6);
  drawHills(b, 54, hy, '#A9CFC0', 2, 5);
  drawGround(b, 54, 192, hy, '#9BCB6A', '#7DB257', 7);
  drawAcacia(b, 44, hy + 2, .55);
  // 右半：奶茶店（粉墙 + 菜单牌）
  pbands(b, 54, 54, [[0, '#F7C6D0'], [hy, '#F2B3C2'], [hy + 1, '#C98B6A'], [192, '#B07A58']], 2);
  prect(b, 60, 56, 34, 26, '#5A3A4A'); prect(b, 62, 58, 30, 22, '#FFF4DF');
  for (let i = 0; i < 4; i++) { prect(b, 64, 61 + i * 5, 14, 2, '#C98B6A'); prect(b, 83, 61 + i * 5, 6, 2, '#E5322D'); }
  // 中间锯齿分界线
  for (let y = 0; y < 192; y++) prect(b, 53 + ((y >> 2) % 2), y, 2, 1, '#FFFFFF');
  // 原始人：咧嘴笑，一口白牙；旁边闪光
  feetShadow(b, 14, hy + 22);
  drawCaveman(b, 14, hy + 6, t, { grin: 'white', eyes: Math.floor(t * 1.3) % 3 === 0 ? 'happy' : blinkEyes(t, 4) });
  if (Math.floor(t * 5) % 4 < 2) { const sx = 34, sy = hy + 7; pdot(b, sx, sy - 2, '#FFFFFF'); pdot(b, sx, sy + 2, '#FFFFFF'); pdot(b, sx - 2, sy, '#FFFFFF'); pdot(b, sx + 2, sy, '#FFFFFF'); pdot(b, sx, sy, '#FFF3B0'); }
  // 你：抱着奶茶，吸一口，笑一下露出蛀牙
  const sipping = (t % 1.6) < .9 && t < S('d1');
  feetShadow(b, 66, hy + 22);
  drawYou(b, 66, hy + 6, t, { grin: sipping ? 'sip' : 'cavity', arms: 'upL', eyes: sipping ? 'happy' : blinkEyes(t, 1) });
  drawTea(b, 58, hy, 10, 14, .8 - .1 * (t / 3), t, { sip: sipping });
  blit(g, 'hd', 10);
  const tp = 1 + .015 * Math.sin(t * 4);
  g.save(); g.translate(500, 330); g.scale(tp, tp); g.rotate(-.02);
  ptext(g, '原始人为什么', 0, -50, 96, C.white, { align: 'center', ol: C.ink, olw: 9, sh: 1 });
  ptext(g, '不蛀牙？', 0, 130, 168, C.amber, { align: 'center', ol: C.ink, olw: 12, sh: 1 });
  g.restore();
  popTag(g, t, .5, 250, 870, '原始人：一口白牙', 32, { fill: C.amber, t1: S('d1') });
  popTag(g, t, .9, 740, 870, '你：补过好几颗', 32, { fill: '#9FD3FF', t1: S('d1') });
  dialogBox(g, t, 'd1', PORTRAIT.you, { extra: S('h3') - EN('d1') - .3 });
  stamp(g, 690, 1468, '只对一半', clamp((t - S('h2') + .05) / .25), { px: 72, rot: -.12 });
}
/* 2. 考古学家数过的牙：原始人 100 颗里蛀不到 2 颗；种地以后约 10 颗 */
function hookGrid(g, t) {
  menuBG(g, t, '#1E2448');
  popTag(g, t, S('h3') + .05, 480, 270, '考古记录 · 古人的牙', 44, { fill: C.amber });
  const grid = (x0, y0, nBad, t0, label, col) => {
    const pa = E.out(clamp((t - t0 + .1) / .3)); if (pa <= 0) return;
    withAlpha(g, pa, () => {
      pbox(g, x0 - 24, y0 - 120, 388, 480, { k: 6 });
      ptext(g, label, x0 + 170, y0 - 64, 40, col, { align: 'center' });
      ptext(g, '每 100 颗牙', x0 + 170, y0 - 22, 26, '#CFC6E8', { align: 'center' });
      const shown = Math.min(100, Math.floor(clamp((t - t0 - .2) / .8) * 100));
      for (let i = 0; i < shown; i++) {
        const x = x0 + (i % 10) * 34, y = y0 + Math.floor(i / 10) * 34;
        const k = BAD_ORDER.indexOf(i), bad = k >= 0 ? clamp(nBad(t) - k) : 0;   // 小数部分画成半颗（一个小黑点）
        toothIcon(g, x, y, 3.5, bad);
      }
    });
  };
  // 左：原始人（狩猎采集）
  const nL = tt => tt > CH('h3', 3) - .05 ? (tt > CH('h3', 3) + .35 ? 1.3 : 1) : 0;
  grid(100, 470, nL, S('h3') + .2, '原始人', C.gold);
  // 右：种地以后
  const nR = tt => Math.floor(clamp((tt - CH('h4', 1) - .1) / .9) * 10.4);
  if (t > S('h4') - .2) grid(560, 470, nR, S('h4') - .1, '种地以后', '#FF8A3D');
  // 读数
  if (t > CH('h3', 3) - .05) {
    const p = pop(t, CH('h3', 3), .35);
    g.save(); g.translate(270, 1000); g.scale(p, p);
    ptext(g, '不到 2 颗', 0, 0, 56, C.gold, { align: 'center', ol: C.ink, olw: 6, sh: 1 });
    g.restore();
  }
  if (t > CH('h4', 1) + .2) {
    const p = pop(t, CH('h4', 1) + .2, .35);
    g.save(); g.translate(730, 1000); g.scale(p, p);
    ptext(g, '约 10 颗', 0, 0, 56, '#FF8A3D', { align: 'center', ol: C.ink, olw: 6, sh: 1 });
    g.restore();
  }
  source(g, 'Turner 1979 · 汇总 64 组古人牙齿', 880, 1110);
}
/* 100 颗牙里依次变黑的顺序（固定的乱序） */
const BAD_ORDER = [37, 72, 14, 88, 51, 26, 63, 5, 94, 45, 79, 31];
/* 3. 线索：一杯奶茶，旁边一个大问号——答案藏在"喝法"里 */
function hookClue(g, t) {
  g.fillStyle = '#F6D9C8'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(201,139,106,.12)'; for (let x = -H; x < W; x += 80) { g.save(); g.translate(x, 0); g.rotate(.5); g.fillRect(0, 0, 30, H * 2); g.restore(); }
  const b = pbuf('hcl', 40, 50); b.clearRect(0, 0, 40, 50);
  drawTea(b, 10, 14, 20, 30, .85, t, { sip: Math.floor(t * 2) % 2 === 0 });
  const k = 14, bob = Math.round(Math.sin(t * 3) * 6);
  put(g, 'hcl', 0, 0, 40, 50, 500 - 20 * k, 330 + bob, k);
  // 问号和时钟
  const pq = pop(t, CH('h5', 1) - .05, .35);
  if (pq > 0) { g.save(); g.translate(790, 520); g.scale(pq, pq); g.rotate(.15); ptext(g, '？', 0, 40, 168, C.red, { align: 'center', ol: C.ink, olw: 10, sh: 1 }); g.restore(); }
  const pc = pop(t, CH('h5', 2) - .05, .35);
  if (pc > 0) {
    g.save(); g.translate(200, 560); g.scale(pc, pc);
    g.fillStyle = C.ink; g.beginPath(); g.arc(0, 0, 74, 0, TAU); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(0, 0, 62, 0, TAU); g.fill();
    g.fillStyle = C.ink; g.save(); g.rotate(t * 2.4); g.fillRect(-4, -50, 8, 50); g.restore(); g.save(); g.rotate(t * .2); g.fillRect(-5, -34, 10, 34); g.restore();
    g.restore();
  }
  popText(g, t, CH('h5', 2) + .15, 99, '喝法？', 500, 1130, 132, C.amber);
  popTag(g, t, S('h5') + .1, 500, 250, '另一半答案', 40, { fill: C.amber });
}

/* 封面：大标题 + 一口白牙的原始人 + 抱着奶茶露出蛀牙的"你" */
function coverArt(g, t) {
  const b = pbuf('cov', 90, 160), hy = 104;
  pbands(b, 0, 45, [[0, '#4FA9E8'], [40, '#7CC6F4'], [hy, '#B5E2FA']], 3);
  drawHills(b, 45, hy, '#A9CFC0', 2, 4); drawGround(b, 45, 160, hy, '#9BCB6A', '#7DB257', 7);
  pbands(b, 45, 45, [[0, '#F7C6D0'], [hy, '#F2B3C2'], [hy + 1, '#C98B6A'], [160, '#B07A58']], 2);
  for (let y = 0; y < 160; y++) prect(b, 44 + ((y >> 2) % 2), y, 2, 1, '#FFFFFF');
  feetShadow(b, 8, hy + 26); drawCaveman(b, 8, hy + 10, 0, { grin: 'white', eyes: 'happy' });
  for (const [dx, dy] of [[0, -2], [0, 2], [-2, 0], [2, 0]]) pdot(b, 28 + dx, hy + 11 + dy, '#FFFFFF');
  feetShadow(b, 58, hy + 26); drawYou(b, 58, hy + 10, 0, { grin: 'cavity', arms: 'upL', eyes: 'n' });
  drawTea(b, 50, hy + 4, 10, 14, .6, 0, {});
  blit(g, 'cov', 12);
  g.save(); g.translate(520, 420); g.rotate(-.03);
  ptext(g, '原始人为什么', 0, -60, 120, C.white, { align: 'center', ol: C.ink, olw: 11, sh: 1 });
  ptext(g, '不蛀牙？', 0, 190, 200, C.amber, { align: 'center', ol: C.ink, olw: 15, sh: 1 });
  g.restore();
  // 章底下垫一块白，缩成小图也看得清
  g.save(); g.translate(540, 900); g.rotate(-.1); g.fillStyle = 'rgba(255,255,255,.86)'; g.fillRect(-330, -80, 660, 160); g.restore();
  stamp(g, 540, 900, '慢慢喝更伤牙', 1, { px: 84, rot: -.1 });
}
