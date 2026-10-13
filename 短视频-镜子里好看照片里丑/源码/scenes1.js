'use strict';
/* scenes1.js：共用的小工具；开头（镜子里笑、照片里愁 → 盖章"反了" → 镜像版和原版并排 → 线索：每天都做的一件事）；封面。
   开头照第一集的路子：先替观众说出最常见的想法，马上盖章推翻，再给证据、抛线索，前 20 秒切三次镜头。
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
function source(g, s, x, y, o = {}) { ptext(g, s, x, y, o.px || 22, o.col || '#9C93C0', { align: o.align || 'right' }); }
function checkMark(g, x, y, k = 6, col = C.green) { g.fillStyle = col; [[0, 2], [1, 3], [2, 4], [3, 3], [4, 2], [5, 1], [6, 0]].forEach(([i, j]) => g.fillRect(x + i * k, y + j * k, k, k)); }
/* 脸上某个像素（原版坐标）在屏幕上的位置 */
function facePt(cx, cy, k, fx, fy, flip) { return [cx + (flip ? -1 : 1) * (fx + .5 - 24) * k, cy + (fy + .5 - 24) * k]; }
const FEAT = { part: [18, 8], clip: [35, 15], mole: [35, 36], mouth: [19, 37] };
/* 头像 */
const PORTRAIT = {
  you: portraitFace({}),
  youSad: portraitFace({ expr: 'flat' }),
  friend: portraitFace({ who: 'friendA', expr: 'happy' }),
};
/* 小人：画在一块缓冲上再放大贴出来 */
function chibiAt(g, t, name, x, y, k, o = {}) {
  const b = pbuf(name, 24, 34); b.clearRect(0, 0, 24, 34);
  drawChibi(b, 2, 1, t, o);
  put(g, name, 0, 0, 24, 34, Math.round(x - 12 * k), Math.round(y - 34 * k), k);
}

/* ================= 开头 ================= */
function hook(g, t) {
  if (window.COVER) { coverArt(g, t); return; }
  if (t < S('h3') - .12) { hookPair(g, t); return; }
  if (t < S('h4') - .12) { hookFlip(g, t); return; }
  hookClue(g, t);
}
function titleBlock(g, t, y0 = 230, sc = 1) {
  const tp = 1 + .012 * Math.sin(t * 4);
  g.save(); g.translate(480, y0); g.scale(tp * sc, tp * sc); g.rotate(-.02);
  ptext(g, '为什么', 0, 20, 60, C.white, { align: 'center', ol: C.ink, olw: 7, sh: 1 });
  ptext(g, '镜子里的你好看，', 0, 120, 84, C.white, { align: 'center', ol: C.ink, olw: 8, sh: 1 });
  ptext(g, '照片里的你丑？', 0, 250, 120, C.amber, { align: 'center', ol: C.ink, olw: 10, sh: 1 });
  g.restore();
}
/* 1. 左边镜子里的你在笑，右边手机照片里的你一脸愁；"你"说：镜子里才是真的我 → 盖章"反了" */
function hookPair(g, t) {
  bgTiles(g);
  titleBlock(g, t);
  drawMirror(g, 270, 790, 170, 210, t, { k: 6, dy: 34, faceOpt: { expr: Math.floor(t * 1.6) % 4 === 3 ? 'blink' : 'happy' }, sparkle: true });
  drawPhone(g, 690, 790, 300, 430, t, { k: 5, faceOpt: { expr: 'flat' }, dim: .12 });
  popTag(g, t, .35, 270, 1050, '镜子里：真好看', 32, { fill: '#9FE3C4' });
  popTag(g, t, .7, 690, 1050, '照片里：这是谁？', 32, { fill: '#D7D3E0' });
  chibiAt(g, t, 'hpY', 480, 1255, 5, { arms: 'phone', expr: t > S('h2') ? 'shock' : 'smile' });
  dialogBox(g, t, 'd1', PORTRAIT.you, { extra: S('h3') - EN('d1') - .3 });
  stamp(g, 690, 1468, '反了', clamp((t - S('h2') + .05) / .25), { px: 84, rot: -.12 });
}
/* 2. 镜像版和原版并排：发卡、痣都换了边 */
function hookFlip(g, t) {
  bgGrid(g, t, '#1C2238');
  const k = 7, L = [270, 760], Rr = [690, 760];
  const pl = pop(t, S('h3'), .35), pr = pop(t, CH('h3', 2) - .3, .35);
  // 左：镜子里（镜像版）
  if (pl > 0) {
    g.save(); g.translate(L[0], L[1]); g.scale(pl, pl); g.translate(-L[0], -L[1]);
    pixRing(g, L[0], L[1], 200, 220, 2, 6, '#E8B84A', '#FFE08A');
    const sq = t < CH('h3', 1) + .1 ? 1 : Math.cos(clamp((t - CH('h3', 1) - .1) / .6) * TAU);   // 说到"左右反过来"时翻一下
    drawFace(g, L[0], L[1], k, { flip: true, expr: 'happy', squash: Math.abs(sq) < .08 ? .08 : sq });
    g.restore();
  }
  popTag(g, t, S('h3') + .1, L[0], 470, '镜子里 · 镜像版', 32, { fill: '#9FE3C4' });
  // 右：照片（原版）
  if (pr > 0) {
    g.save(); g.translate(Rr[0], Rr[1]); g.scale(pr, pr); g.translate(-Rr[0], -Rr[1]);
    g.fillStyle = '#FFFDF6'; g.fillRect(Rr[0] - 200, Rr[1] - 220, 400, 470);
    g.fillStyle = '#B9D7EA'; g.fillRect(Rr[0] - 182, Rr[1] - 202, 364, 380);
    clipRect(g, Rr[0] - 182, Rr[1] - 202, 364, 380, () => drawFace(g, Rr[0], Rr[1] + 10, k, { expr: 'smile' }));
    g.restore();
  }
  popTag(g, t, CH('h3', 2) - .25, Rr[0], 470, '照片里 · 原版', 32, { fill: '#D7D3E0' });
  // ⇄
  if (pr > .9) withAlpha(g, clamp((t - CH('h3', 2) - .2) / .3), () => { ptext(g, '⇄', 480, 790, 72, C.gold, { align: 'center', ol: C.ink, olw: 6 }); });
  // 圈出发卡和痣：换了边
  if (t > CH('h3', 2) + .3) {
    const u = clamp((t - CH('h3', 2) - .3) / .5);
    for (const [c, flip, fy] of [[L, true, 10], [Rr, false, 10]]) {
      const [x1, y1] = facePt(c[0], c[1] + (flip ? 0 : fy), k, ...FEAT.clip, flip), [x2, y2] = facePt(c[0], c[1] + (flip ? 0 : fy), k, ...FEAT.mole, flip);
      markCircle(g, x1, y1, 34, C.gold, u); markCircle(g, x2, y2, 30, '#FF6F8E', u);
    }
  }
  // 别人眼里：几双眼睛看着原版
  if (t > CH('h3', 3) - .3) {
    const p = pop(t, CH('h3', 3) - .25, .35);
    g.save(); g.translate(Rr[0], 1110); g.scale(p, p);
    for (let i = -1; i <= 1; i++) iconEye(g, i * 80, 0);
    ptext(g, '别人每天看到的', 0, 70, 32, C.white, { align: 'center' });
    g.restore();
  }
}
/* 3. 线索：镜像版凭什么更好看？答案藏在每天都做的一件事里（日历上每天一面小镜子） */
function hookClue(g, t) {
  bgStripes(g, '#FBE3D4', 'rgba(232,150,120,.14)');
  popText(g, t, S('h4') + .05, 99, '凭什么镜像版更好看？', 480, 330, 64, C.amber);
  // 日历：七天，每天一面镜子
  const p = E.out(clamp((t - S('h4') - .4) / .35));
  if (p > 0) {
    g.save(); g.globalAlpha *= p; g.translate(0, (1 - p) * 60);
    pbox(g, 120, 480, 720, 560, { k: 6, fill: '#FFFDF6', rim: '#E8C08A', edge: C.ink });
    g.fillStyle = '#E5574F'; g.fillRect(132, 492, 696, 96);
    ptext(g, '每 天', 480, 560, 56, C.white, { align: 'center' });
    ['一', '二', '三', '四', '五', '六', '日'].forEach((d, i) => {
      const x = 180 + (i % 4) * 170, y = 680 + Math.floor(i / 4) * 200;
      ptext(g, '周' + d, x + 24, y - 30, 30, '#8A6A5A', { align: 'center' });
      if (t > CH('h4', 3) + i * .12) iconMirror(g, x + 24, y + 50, 8);
    });
    g.restore();
  }
  const pq = pop(t, CH('h4', 3) + .9, .35);
  if (pq > 0) { g.save(); g.translate(800, 1000); g.scale(pq, pq); g.rotate(.15); ptext(g, '？', 0, 40, 168, C.red, { align: 'center', ol: C.ink, olw: 10, sh: 1 }); g.restore(); }
}

/* 封面：大标题 + 镜子（笑）和手机照片（愁）+ 红章 */
function coverArt(g, t) {
  bgTiles(g);
  titleBlock(g, 0, 210, 1.08);
  drawMirror(g, 270, 860, 180, 220, 0.4, { k: 6, dy: 34, faceOpt: { expr: 'happy' }, sparkle: true });
  drawPhone(g, 700, 860, 300, 440, 0, { k: 5, faceOpt: { expr: 'flat' }, dim: .12 });
  g.save(); g.translate(480, 1260); g.rotate(-.08); g.fillStyle = 'rgba(255,255,255,.88)'; g.fillRect(-360, -80, 720, 160); g.restore();
  stamp(g, 480, 1260, '镜子里的你是反的', 1, { px: 72, rot: -.08 });
  chibiAt(g, 0, 'cvY', 480, 1760, 11, { arms: 'phone', expr: 'shock', still: true });
  chibiAt(g, 0, 'cvA', 190, 1720, 7, { who: 'friendA', arms: 'wave', expr: 'happy', still: true });
  chibiAt(g, 0, 'cvB', 780, 1720, 7, { who: 'friendB', expr: 'happy', still: true });
}
