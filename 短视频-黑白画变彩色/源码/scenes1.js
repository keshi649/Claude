'use strict';
/* scenes1.js：共用的小工具；盯点（负片的像素画 + 中间一个点 + 一圈慢慢走满的进度，20 秒里画面一动不动）→
   换成黑白画（点和上方的字都不动，免得眼睛跟着跑，残像就没了）→ "其实一直是黑白的"，取色给你看；封面。
   这一支开头不走"提问—常见答案—盖章"，第一秒就让人参与：盯住中间的点。盯点的 20 秒里不切镜头、不出字幕，是故意的。 */

/* ================= 共用 ================= */
function popTag(g, t, t0, x, y, s, px = 36, o = {}) {
  const p = pop(t, t0, .3) * (o.t1 ? clamp((o.t1 - t) / .2) : 1);
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p); ptag(g, 0, 0, s, px, o); g.restore();
}
function popText(g, t, t0, t1, s, x, y, px, col, o = {}) {
  const p = pop(t, t0, .3) * clamp((t1 - t) / .2);
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p);
  ptext(g, s, 0, px * .35, px, col, { align: 'center', ol: o.ol || C.ink, olw: o.olw || 6, sh: 1 });
  g.restore();
}
/* 研究出处：小号灰字 */
function source(g, s, x, y, o = {}) { ptext(g, s, x, y, o.px || 22, o.col || '#8A80B0', { align: o.align || 'right' }); }
const PORTRAIT = {
  youShock: portraitClawd({ scarf: true, eyes: 'wide', mouth: 'o' }),
  youHappy: portraitClawd({ scarf: true, eyes: 'happy', mouth: 'smile' }),
};
/* 上方的大字：两行，下面垫一条半透明的暗带。不动、不缩放（盯点的时候画面上什么都不能动） */
function topText(g, l1, l2, o = {}) {
  g.fillStyle = 'rgba(10,8,24,.45)'; g.fillRect(0, 210, W, 250);
  ptext(g, l1, 480, 300, 72, C.white, { align: 'center', ol: C.ink, olw: 6 });
  ptext(g, l2, 480, 420, 96, o.col || C.amber, { align: 'center', ol: C.ink, olw: 8 });
}

/* ================= 盯点 + 变黑白 ================= */
function illusion(g, t) {
  if (window.COVER) { coverArt(g, t); return; }
  const tSw = SS('reveal');                     // 换成黑白画的那一刻
  const gray = t >= tSw;
  drawPic(g, gray ? 'gray' : 'neg');
  const tFix = S('b3') - .1;                     // 说"其实……"之前，点和上方的字都不动
  if (t < tFix) {
    topText(g, '盯住中间的点 20 秒', '看见不存在的颜色');      // 第一帧就给出看下去的理由；"别眨眼"在旁白里说
    fixMark(g, clamp((t - S('s1')) / (tSw - S('s1'))));
    return;
  }
  // "其实一直是黑白的"：取色给你看——天、草、屋顶都是灰的
  topText(g, '这张画', '一直是黑白的', { col: '#D3D0DE' });
  const picks = [[200, 700, '天'], [560, 1200, '草'], [810, 844, '屋顶']];   // 取色笔的笔尖在 (x, y+76)
  picks.forEach(([x, y, s], i) => {
    const p = pop(t, CH('b3', 1) - .2 + i * .25, .3); if (p <= 0) return;
    g.save(); g.translate(x, y); g.scale(p, p);
    g.fillStyle = C.ink; g.fillRect(-6, -6, 12, 70); g.fillRect(-12, 58, 24, 18);           // 取色笔
    pbox(g, -130, -140, 260, 128, { k: 4, fill: 'rgba(27,23,48,.94)' });
    const sm = pictures().gray.getContext('2d').getImageData(Math.floor(x / 10), Math.floor((y + 70) / 10), 1, 1).data;
    g.fillStyle = C.ink; g.fillRect(-116, -126, 100, 100);
    g.fillStyle = `rgb(${sm[0]},${sm[1]},${sm[2]})`; g.fillRect(-110, -120, 88, 88);
    ptext(g, s + '：', 50, -90, 36, '#CFC6E8', { align: 'center' });
    ptext(g, '灰', 50, -36, 48, C.white, { align: 'center' });
    g.restore();
  });
  // 眨一下眼
  if (t > CH('b4', 0) - .2 && t < SE('reveal') + .3) {
    const u = (t - CH('b4', 0) + .2) % 1.2, shut = u < .15 ? u / .15 : u < .3 ? (.3 - u) / .15 : 0;
    const p = pop(t, CH('b4', 0) - .2, .3);
    g.save(); g.translate(480, 700); g.scale(p, p);
    pbox(g, -150, -90, 300, 180, { k: 6, fill: 'rgba(255,255,255,.94)', rim: '#F4E9D8' });
    bigEye(g, 0, 0, 14, shut);
    g.restore();
  }
  dialogBox(g, t, 'd1', PORTRAIT.youShock);
}

/* 封面：负片 + 中间的点 + 大字 */
function coverArt(g, t) {
  drawPic(g, 'neg');
  g.fillStyle = 'rgba(10,8,24,.5)'; g.fillRect(0, 250, W, 330);
  ptext(g, '盯住中间的点 20 秒', 480, 360, 72, C.white, { align: 'center', ol: C.ink, olw: 6 });
  ptext(g, '黑白画会变彩色', 480, 500, 96, C.amber, { align: 'center', ol: C.ink, olw: 8 });
  fixMark(g, .75);
}
