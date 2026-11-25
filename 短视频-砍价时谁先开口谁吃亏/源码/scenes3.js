'use strict';
/* scenes3.js：要是对方先开口（摊主先喊"8000！"，锚扔下来；"你"别顺着他砍，先想想心里的价 5000，再报自己的）→
   攻略卡（做过功课就先开口；报个带零头的数；对方先开口，先想自己的目标价）→ 结尾（"你"抱着吉他摆摊："我先开口：4870！"；
   "评论区说说：你砍价都是谁先开口？"）→ 片尾。 */

function counter(g, t) {
  marketScene(g, t, { tag: '8000', tagCol: '#FFD0C8', seller: { eyes: 'squint', mouth: 'smile' }, you: t > CH('c1', 3) - .2 ? { eyes: 'happy', mouth: 'smile' } : { eyes: 'wide', mouth: 'o' } });
  const t0 = SS('counter');   // 摊主在旁白开口之前就喊出"8000！"，锚砸下来的声音放在这一幕的开场留白里
  sayBubble(g, t, t0 + .1, 760, 700, '8000！', 760, 940, { px: 56 });
  // 他的锚（8000）先砸下来
  const d1 = clamp((t - t0 - .2) / .5); if (t > t0 + .2) anchorIcon(g, 820, lerp(260, 380, E.in(d1)), 4, '他的：8000');
  // 别顺着他的数砍：一把剪刀划过他的价签（红叉）
  if (t > CH('c1', 1) - .2) { const u = clamp((t - CH('c1', 1) + .2) / .3); g.strokeStyle = '#FF4B3E'; g.lineWidth = 14; g.beginPath(); g.moveTo(530, 800); g.lineTo(530 + 160 * u, 800 + 110 * u); g.stroke(); }
  // 先想想你心里的价
  if (t > CH('c1', 2) - .25) {
    const p = pop(t, CH('c1', 2) - .25, .3);
    g.save(); g.translate(300, 700); g.scale(p, p);
    bubble(g, 0, 0, 210, 90, -40, 220); ptext(g, '心里的价：5000', 0, 14, 40, C.ink, { align: 'center' });
    g.restore();
  }
  // 再报你自己的：你的锚也扔下来
  if (t > CH('c1', 4) - .25) {
    const d2 = clamp((t - CH('c1', 4) + .25) / .5);
    anchorIcon(g, 140, lerp(260, 380, E.in(d2)), 4, '我的：5000');
    sayBubble(g, t, CH('c1', 4) - .2, 330, 900, '5000！', 290, 1000, { px: 56 });
  }
  source(g, '出处：Galinsky、Mussweiler，2001（想着自己的目标价，对方先报价的优势就没了）', 880, 1238);
}

/* ================= 攻略卡 ================= */
function guide(g, t) {
  marketScene(g, t, { tag: '？', you: { eyes: 'up' } });
  g.fillStyle = 'rgba(10,8,24,.5)'; g.fillRect(0, 0, W, H);
  const pp = E.out(clamp((t - S('g1') + .3) / .4));
  if (pp <= 0) return;
  g.save(); g.translate(0, (1 - pp) * 500); g.globalAlpha *= pp;
  pbox(g, 60, 280, 840, 760, { k: 6 });
  g.fillStyle = '#3E9E4F'; g.fillRect(72, 292, 816, 76);
  ptext(g, '★ 砍价、卖二手、谈工资 ★', 480, 348, 44, C.white, { align: 'center', sh: 1 });
  const rows = [
    [S('g2') - .2, '{做过功课}，就先开口', 470, S('g2') - .1, '先查清楚行情，心里有数'],
    [S('g3') - .2, '报个{带零头的数}', 680, S('g3') - .1, '例：4870，别报 5000'],
    [S('g4') - .2, '对方先开口：想{自己的目标价}', 890, S('g4') - .1, '别顺着他的数砍'],
  ];
  rows.forEach(([t0, s, y, t1, sub]) => {
    if (t < t0 - .1) { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(100, y - 34, 40, 40); g.fillStyle = C.ink; g.fillRect(106, y - 28, 28, 28); g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(164, y - 30, 480, 32); }
    const u = pop(t, t0 - .1, .35); if (u <= 0) return;
    withAlpha(g, clamp(u), () => {
      g.fillStyle = C.green; g.fillRect(100, y - 34, 40, 40); g.fillStyle = C.ink; g.fillRect(106, y - 28, 28, 28); if (t > t0 + .4) checkMark(g, 104, y - 32, 5, C.green);
      prich(g, s, 164, y, 44, C.white, C.gold);
    });
    if (t > t1) withAlpha(g, E.out(clamp((t - t1) / .4)), () => { g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(150, y + 26, 620, 70); ptext(g, sub, 170, y + 74, 32, '#CFC6E8'); });
  });
  ptext(g, '（按上面的研究推出来的建议）', 480, 1010, 26, '#9C93C0', { align: 'center' });
  g.restore();
}

/* ================= 结尾："你"抱着吉他摆摊，先开口 4870 ================= */
function endScene(g, t) {
  const b = pbuf('market', 216, 384); marketBG(b, t); blit(g, 'market', 5);
  stringLights(g, t, -20, 470, 1100, 450, 70, 12, 2);
  steam(g, t, 110, 1000);
  crowd(g, t, 1035, 5);
  // 这次"你"是摊主（桌子后面），买家在左边
  crabAt(g, 740, 1180, 15, youO(t, t > S('z1') ? { eyes: 'happy', mouth: 'smile' } : { eyes: 'squint', mouth: 'smile' }), true);
  g.fillStyle = '#8A5A35'; g.fillRect(560, 1080, 380, 30); g.fillStyle = '#A0703E'; g.fillRect(560, 1080, 380, 8); g.fillStyle = '#6E4A2E'; g.fillRect(560, 1110, 380, 160);
  g.fillStyle = '#3E9E4F'; g.fillRect(580, 1130, 340, 40); ptext(g, '二手吉他', 750, 1162, 32, '#FFFFFF', { align: 'center' });
  guitar(g, 500, 820, 5);
  priceTag(g, t, 600, 860, '4870', 40, { col: '#9FE3B8', rot: -.08 });
  crabAt(g, 240, 1250, 15, person(5, { eyes: 'wide', mouth: 'o' }));
  dialogBox(g, t, 'd3', PORTRAIT.youHappy);
  if (t > CH('z1', 1) - .2) {
    const p = pop(t, CH('z1', 1) - .2, .35);
    g.save(); g.translate(480, 470); g.scale(p, p);
    pbox(g, -380, -170, 760, 340, { k: 6, fill: '#FFFFFF', rim: '#F4E9D8' });
    ptext(g, '你砍价都是谁先开口？', 0, -80, 44, C.ink, { align: 'center' });
    pbox(g, -330, -10, 300, 120, { k: 5, fill: '#7DA64E', shadow: false }); ptext(g, '我先', -180, 70, 52, C.white, { align: 'center', ol: C.ink, olw: 5 });
    pbox(g, 30, -10, 300, 120, { k: 5, fill: '#4A8EF0', shadow: false }); ptext(g, '他先', 180, 70, 52, C.white, { align: 'center', ol: C.ink, olw: 5 });
    g.restore();
  }
  popTag(g, t, S('z1') - .1, 480, 250, '转给要谈工资的朋友', 32, { fill: C.gold });
}

/* ================= 片尾 ================= */
function endCard(g, t) {
  const b = pbuf('market', 216, 384); marketBG(b, t); blit(g, 'market', 5);
  g.fillStyle = 'rgba(10,8,24,.6)'; g.fillRect(0, 0, W, H);
  const p = E.out(clamp((t - SS('card') - .05) / .3));
  g.save(); g.globalAlpha *= p;
  pbox(g, 60, 470, 840, 560, { k: 6, fill: 'rgba(27,23,48,.92)' });
  ptext(g, '砍价时，谁先开口谁吃亏？', 480, 580, 44, C.white, { align: 'center', sh: 1 });
  prich(g, '做过功课，{先开口的占便宜}。', 480, 670, 40, C.white, C.gold, { align: 'center' });
  prich(g, '报个{带零头的数}，别报整的。', 480, 750, 36, '#CFC6E8', C.gold, { align: 'center' });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(130, 800, 700, 4);
  ptext(g, '甜菜  出品', 480, 880, 36, C.amber, { align: 'center' });
  ptext(g, '画面、字幕、音效：Claude 用代码生成 · 配音：CosyVoice 3 合成', 480, 940, 24, '#9C93C0', { align: 'center' });
  g.restore();
}
