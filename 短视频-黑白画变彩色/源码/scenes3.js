'use strict';
/* scenes3.js：没看到彩色？（亮度调到最高、盯住点别眨眼、从头再看一遍）→ 评论区扣 1 → 片尾。 */

function guide(g, t) {
  drawPic(g, 'neg');
  g.fillStyle = 'rgba(10,8,24,.62)'; g.fillRect(0, 0, W, H);
  const pp = E.out(clamp((t - S('g1') + .3) / .4));
  if (pp > 0) {
    g.save(); g.translate(0, (1 - pp) * 500); g.globalAlpha *= pp;
    pbox(g, 60, 300, 840, 470, { k: 6 });
    g.fillStyle = '#3E9E4F'; g.fillRect(72, 312, 816, 72);
    ptext(g, '★ 没看到彩色？★', 480, 366, 48, C.white, { align: 'center', sh: 1 });
    const rows = [
      [CH('g1', 1) - .2, '手机亮度{调到最高}', 480],
      [CH('g1', 1) + .25, '盯住中间的点，{别眨眼}', 580],
      [CH('g1', 2) - .2, '{从头再看一遍}', 680],
    ];
    rows.forEach(([t0, s, y]) => {
      const u = pop(t, t0 - .1, .35); if (u <= 0) return;
      withAlpha(g, u, () => { g.fillStyle = C.green; g.fillRect(100, y - 32, 36, 36); g.fillStyle = C.ink; g.fillRect(106, y - 26, 24, 24); if (t > t0 + .4) checkMark(g, 104, y - 30, 4, C.green); prich(g, s, 160, y, 44, C.white, C.gold); });
    });
    g.restore();
  }
  // 评论区扣 1
  if (t > S('z1') - .2) {
    const p = pop(t, S('z1') - .2, .4);
    g.save(); g.translate(480, 1020); g.scale(p, p);
    pbox(g, -300, -110, 600, 200, { k: 6, fill: '#FFFFFF', rim: '#F4E9D8' });
    for (let i = 0; i < 4; i++) { g.fillStyle = C.ink; g.fillRect(-200 + i * 6, 90 + i * 12, 40 - i * 12, 12); }
    ptext(g, '看到彩色的', -60, -20, 40, C.ink, { align: 'center' });
    ptext(g, '扣', -60, 50, 48, C.ink, { align: 'center' });
    ptext(g, '1', 170, 46, 144, '#FF5A4F', { align: 'center', ol: C.ink, olw: 12 });
    g.restore();
  }
}

/* ================= 片尾 ================= */
function endCard(g, t) {
  drawPic(g, 'gray');
  g.fillStyle = 'rgba(10,8,24,.55)'; g.fillRect(0, 0, W, H);
  const p = E.out(clamp((t - SS('card') - .05) / .3));
  g.save(); g.globalAlpha *= p;
  pbox(g, 60, 520, 840, 460, { k: 6, fill: 'rgba(27,23,48,.92)' });
  ptag(g, 480, 590, '眼睛的 bug ①', 32, { fill: C.gold });
  ptext(g, '盯住中间的点 20 秒', 480, 690, 48, C.white, { align: 'center', sh: 1 });
  prich(g, '这张画，{一直是黑白的}。', 480, 780, 40, C.white, C.gold, { align: 'center' });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(130, 830, 700, 4);
  ptext(g, '甜菜  出品', 480, 900, 36, C.amber, { align: 'center' });
  ptext(g, '画面、字幕、音效：Claude 用代码生成 · 配音：CosyVoice 3 合成', 480, 945, 24, '#9C93C0', { align: 'center' });
  g.restore();
}
