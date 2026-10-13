'use strict';
/* scenes3.js：社恐救急卡 → 结尾（回到食堂："你"一身奶茶渍也不慌了，周围每个人头顶都有自己的聚光灯）→ 片尾。 */

/* ================= 社恐救急卡 ================= */
function guide(g, t) {
  theater(g, t, { floor: 1180 });
  spotCone(g, 480, 960, 480, 1270, 150, .18, { r0: 40, k: 10 });
  shadowAt(g, 480, 1260, 8);
  crabAt(g, 480, 1260, 8, youO(t, { mouth: 'smile', eyes: blinkEyes(t, 1, 'happy') }));
  const pp = E.out(clamp((t - S('g1') + .3) / .4));
  if (pp > 0) {
    g.save(); g.translate(0, (1 - pp) * 500); g.globalAlpha *= pp;
    pbox(g, 60, 290, 840, 660, { k: 6 });
    g.fillStyle = '#3E9E4F'; g.fillRect(72, 302, 816, 72);
    ptext(g, '★ 社恐救急卡 ★', 480, 356, 48, C.white, { align: 'center', sh: 1 });
    ptext(g, '觉得“全场都在看我”时：', 110, 446, 32, '#CFC6E8');
    const rows = [
      [S('g2') - .2, '你以为的人数，{砍掉一半}', 560],
      [S('g3') - .2, '上台前默念：{紧张写不到脸上}', 700],
      [S('g4') - .2, '出糗了想想：你记得{别人的糗}吗？', 840],
    ];
    rows.forEach(([t0, s, y]) => {
      const u = pop(t, t0, .35); if (u <= 0) return;
      withAlpha(g, u, () => { g.fillStyle = C.green; g.fillRect(100, y - 32, 36, 36); g.fillStyle = C.ink; g.fillRect(106, y - 26, 24, 24); if (t > t0 + .4) checkMark(g, 104, y - 30, 4, C.green); prich(g, s, 160, y, 40, C.white, C.gold); });
    });
    source(g, '第 1、3 条是按实验推出来的', 880, 920, { px: 22 });
    g.restore();
  }
}

/* ================= 结尾 ================= */
function endScene(g, t) {
  const b = pbuf('en', 108, 192);
  canteenScene(b, t, { youO: { stain: true, eyes: t > S('z1') - .2 ? 'happy' : blinkEyes(t, 1), mouth: 'smile' }, tea: true });
  blit(g, 'en', 10);
  g.save(); g.fillStyle = 'rgba(20,14,40,.35)'; g.fillRect(0, 0, W, H); g.restore();
  // 每个人头顶都有自己的聚光灯
  const on = clamp((t - CH('z1', 1) + .3) / .15);
  [[170, 1040], [480, 1200], [820, 1040]].forEach(([x, y], i) => { const a = i === 1 ? .2 : .26 * on; if (a > 0) spotCone(g, x, 420, x, y, i === 1 ? 170 : 150, a, { r0: 20, k: 10 }); });
  const BUB = [[200, 760, '我吃相难看吗？'], [700, 640, '刚才没说错话吧？']];
  BUB.forEach(([x, y, s], i) => {
    const p = pop(t, CH('z1', 2) - .2 + i * .15, .3);
    if (p > 0) { g.save(); g.translate(x, y); g.scale(p, p); thoughtBubble(g, 0, 0, i ? 370 : 330, 104, s, (i ? 60 : -10), i ? 250 : 130, { px: 36 }); g.restore(); }
  });
  dialogBox(g, t, 'd3', PORTRAIT.youHappy);
  if (t > S('d3') + .1) {
    const p = pop(t, S('d3') + .1, .35);
    g.save(); g.translate(480, 360); g.scale(p, p);
    pbox(g, -360, -100, 720, 200, { k: 6 });
    ptext(g, '聚光灯效应：', -310, -24, 36, '#CFC6E8');
    ptext(g, '你没有自己以为的那么显眼', -310, 50, 44, C.gold);
    g.restore();
  }
}

/* ================= 片尾 ================= */
function endCard(g, t) {
  const b = pbuf('cd', 108, 192);
  canteenScene(b, t, { youO: { stain: true, eyes: 'happy', mouth: 'smile', arms: 'upL' }, tea: true });
  blit(g, 'cd', 10);
  g.fillStyle = 'rgba(10,8,24,.45)'; g.fillRect(0, 0, W, H);
  const p = E.out(clamp((t - SS('card') - .05) / .3));
  g.save(); g.globalAlpha *= p;
  pbox(g, 60, 520, 840, 420, { k: 6, fill: 'rgba(27,23,48,.92)' });
  ptext(g, '为什么你总觉得别人在看你？', 480, 640, 48, C.white, { align: 'center', sh: 1 });
  prich(g, '聚光灯，只开在{你自己心里}。', 480, 740, 40, C.white, C.gold, { align: 'center' });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(130, 790, 700, 4);
  ptext(g, '甜菜  出品', 480, 860, 36, C.amber, { align: 'center' });
  // 配音也是 AI 合成的，一并写明
  ptext(g, '画面、字幕、音效：Claude 用代码生成 · 配音：CosyVoice 3 合成', 480, 905, 24, '#9C93C0', { align: 'center' });
  g.restore();
}
