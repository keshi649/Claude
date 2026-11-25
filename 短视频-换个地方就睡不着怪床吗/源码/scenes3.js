'use strict';
/* scenes3.js：在新地方这样住（攻略卡：提前两天住进去、第一晚没睡好别慌、带副耳塞）→ 结尾（第二晚睡好了的早上，
   泡泡里的小人戴着睡帽睡着了，小黄鸭两只眼都闭上了；"原来不是我矫情！"→"是你的左脑太尽责。评论区说说，你在哪儿睡得最差？"）→ 片尾。 */

function guide(g, t) {
  roomScene(g, t, { you: { eyes: 'up' } });
  g.fillStyle = 'rgba(10,8,24,.45)'; g.fillRect(0, 0, W, H);
  const pp = E.out(clamp((t - S('g1') + .3) / .4));
  if (pp <= 0) return;
  g.save(); g.translate(0, (1 - pp) * 500); g.globalAlpha *= pp;
  pbox(g, 60, 260, 840, 820, { k: 6 });
  g.fillStyle = '#3E9E4F'; g.fillRect(72, 272, 816, 76);
  ptext(g, '★ 去外地考试、面试 ★', 480, 328, 48, C.white, { align: 'center', sh: 1 });
  const rows = [
    [S('g2') - .2, '提前{两天}住进去', 450, CH('g2', 1) - .2, '例：周日考试，周五就入住', 'suit'],
    [S('g3') - .2, '第一晚没睡好：{别慌}', 680, CH('g3', 2) - .2, '第二晚就好多了', 'moon'],
    [S('g4') - .2, '带副{耳塞}', 880, S('g4') - .1, '让站岗的少听见点动静', 'plug'],
  ];
  rows.forEach(([t0, s, y, t1, sub, ic]) => {
    // 卡片一出来就先摆好三个空格子，念到哪一条就填哪一条（卡片不会空着）
    if (t < t0 - .1) { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(100, y - 34, 40, 40); g.fillStyle = C.ink; g.fillRect(106, y - 28, 28, 28); g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(164, y - 30, 420, 32); }
    const u = pop(t, t0 - .1, .35); if (u <= 0) return;
    withAlpha(g, clamp(u), () => {
      g.fillStyle = C.green; g.fillRect(100, y - 34, 40, 40); g.fillStyle = C.ink; g.fillRect(106, y - 28, 28, 28); if (t > t0 + .4) checkMark(g, 104, y - 32, 5, C.green);
      prich(g, s, 164, y, 44, C.white, C.gold);
      if (ic === 'suit') suitcaseIcon(g, 760, y - 70, 5, '#3E9E4F');
      if (ic === 'moon') moonIcon(g, 800, y - 20, 6, '#1B1730');
      if (ic === 'plug') earplugIcon(g, 760, y - 40, 6);
    });
    if (t > t1) withAlpha(g, E.out(clamp((t - t1) / .4)), () => { g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(150, y + 26, 620, 70); ptext(g, sub, 170, y + 74, 32, '#CFC6E8'); });
  });
  ptext(g, '（按上面的研究推出来的建议）', 480, 1040, 26, '#9C93C0', { align: 'center' });
  g.restore();
}

/* ================= 结尾 ================= */
function endScene(g, t) {
  roomScene(g, t, { light: 1, duckEyes: 'cc', you: { eyes: t > S('z1') ? 'happy' : 'wide', mouth: t > S('z1') ? 'smile' : 'o', arms: 'up' } });
  brainBubble(g, t, 730, 780, 150, { p: pop(t, SS('end') + .1, .3), left: 'asleep', right: 'asleep', sentry: 'off', tx: 600, ty: 960, zzz: false });
  popTag(g, t, SS('end') + .2, 730, 600, '第二晚：撤岗了', 36, { fill: '#B8F0C8' });
  popTag(g, t, SS('end') + .4, 245, 760, '小黄鸭也睡了', 28, { fill: C.gold });
  dialogBox(g, t, 'd4', PORTRAIT.youHappy);
  // 评论区：你在哪儿睡得最差？
  if (t > CH('z1', 2) - .2) {
    const p = pop(t, CH('z1', 2) - .2, .35);
    g.save(); g.translate(480, 470); g.scale(p, p);
    pbox(g, -380, -190, 760, 380, { k: 6, fill: '#FFFFFF', rim: '#F4E9D8' });
    ptext(g, '你在哪儿睡得最差？', 0, -110, 44, C.ink, { align: 'center' });
    [['酒店', -180, -20, '#7DA64E'], ['宿舍', 180, -20, '#4A8EF0'], ['亲戚家', -180, 110, '#E58BAA'], ['火车上', 180, 110, '#DDB04F']].forEach(([s, x, y, col]) => {
      pbox(g, x - 160, y - 50, 320, 100, { k: 5, fill: col, shadow: false }); ptext(g, s, x, y + 20, 48, C.white, { align: 'center', ol: C.ink, olw: 5 });
    });
    g.restore();
  }
  popTag(g, t, CH('z1', 0) - .1, 480, 230 + 0, '转给要去外地考试的朋友', 32, { fill: C.gold });
}

/* ================= 片尾 ================= */
function endCard(g, t) {
  roomScene(g, t, { light: 1, duckEyes: 'cc', you: { eyes: 'happy', mouth: 'smile', arms: 'upR' } });
  g.fillStyle = 'rgba(10,8,24,.55)'; g.fillRect(0, 0, W, H);
  const p = E.out(clamp((t - SS('card') - .05) / .3));
  g.save(); g.globalAlpha *= p;
  pbox(g, 60, 470, 840, 560, { k: 6, fill: 'rgba(27,23,48,.92)' });
  ptext(g, '换个地方就睡不着，怪床吗？', 480, 580, 44, C.white, { align: 'center', sh: 1 });
  prich(g, '不怪床：是{左脑在站岗}。', 480, 670, 40, C.white, C.gold, { align: 'center' });
  prich(g, '去外地考试，{提前两天}住进去。', 480, 750, 36, '#CFC6E8', C.gold, { align: 'center' });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(130, 800, 700, 4);
  ptext(g, '甜菜  出品', 480, 880, 36, C.amber, { align: 'center' });
  ptext(g, '画面、字幕、音效：Claude 用代码生成 · 配音：CosyVoice 3 合成', 480, 940, 24, '#9C93C0', { align: 'center' });
  g.restore();
}
