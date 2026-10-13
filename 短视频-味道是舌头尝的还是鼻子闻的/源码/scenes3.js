'use strict';
/* scenes3.js：香气能骗过舌头（同样的糖水闻着草莓香更甜，同样淡的盐水闻着酱油香更咸 → 少糖少盐，多放香）→
   吃得更香的小办法 → 结尾（"你"在食堂吃面，鼻子戴上皇冠）→ 片尾。 */

/* ================= 香气能骗过舌头 ================= */
function trick(g, t) {
  bgPaper(g, '#FFF6E8', 'rgba(200,140,80,.10)');
  popTag(g, t, SS('trick') + .1, 480, 250, '香气能骗过舌头', 44, { fill: C.gold });
  if (t < S('n3') - .2) { trickIntro(g, t); return; }
  if (t < S('n4') - .15) { trickCups(g, t); return; }
  trickJars(g, t);
}
/* 舌头被一团草莓香围着，鼻子在旁边吸气；盖章"骗" */
function trickIntro(g, t) {
  drawNose(g, 230, 700, 9, { sniff: t * 1.5 });
  drawTongue(g, 600, 760, 9, { mood: 'proud', look: -1 });
  for (let i = 0; i < 5; i++) { const a = t * 1.6 + i * TAU / 5; aroma(g, 600 + Math.cos(a) * 200, 820 + Math.sin(a) * 90, t + i, '#FF6F8E', 7, { alpha: .8 }); }
  if (t > CH('n2', 1) - .2) stamp(g, 600, 470, '骗', clamp((t - CH('n2', 1) + .2) / .25), { px: 96, rot: -.12 });
}
/* 两排杯子：糖水 / 盐水，左边没加香，右边加了草莓香 / 酱油香；下面的甜度、咸度条 */
function trickCups(g, t) {
  const rows = [
    { y: 600, head: '同样的糖水', t0: CH('n3', 1) - .2, tA: CH('n3', 2) - .2, liquid: '#C9E7FA', col: '#FF6F8E', add: '加草莓香', bar: '甜', barCol: '#FF6F8E', v: [.45, .78] },
    { y: 1040, head: '同样淡的盐水', t0: CH('n3', 3) - .2, tA: CH('n3', 4) - .2, liquid: '#C9E7FA', col: '#8A5634', add: '加酱油香', bar: '咸', barCol: '#5E9AD6', v: [.35, .66] },
  ];
  rows.forEach((r, i) => {
    const pg = E.out(clamp((t - (i ? r.t0 : S('n3') - .2)) / .3)), p = E.out(clamp((t - r.t0) / .3));
    if (pg <= 0) return;
    g.save(); g.globalAlpha *= pg; g.translate(0, (1 - pg) * 40);
    drawGlass(g, 300, r.y, 150, 170, r.liquid);
    drawGlass(g, 660, r.y, 150, 170, r.liquid);
    g.restore();
    if (p <= 0) return;
    g.save(); g.globalAlpha *= p; g.translate(0, (1 - p) * 40);
    ptext(g, r.head, 110, r.y - 222, 44, C.ink);
    ptext(g, '没加香', 300, r.y + 84, 36, '#7A86A8', { align: 'center' });
    ptext(g, r.add, 660, r.y + 84, 36, r.col, { align: 'center' });
    if (t > r.tA) aroma(g, 660, r.y - 180, t, r.col, 9);
    const u = E.out(clamp((t - r.tA) / .7));
    hpBar(g, 210, r.y + 112, 180, r.v[0] * clamp((t - r.t0) / .5), { h: 34, col: r.barCol });
    hpBar(g, 570, r.y + 112, 180, lerp(r.v[0], r.v[1], u) * clamp((t - r.t0) / .5), { h: 34, col: r.barCol });
    tasteBadge(g, 150, r.y + 129, 30, r.bar, r.barCol);
    if (u > .6) ptext(g, '更' + r.bar, 830, r.y + 142, 40, r.barCol, { align: 'center', ol: C.white, olw: 3 });
    g.restore();
  });
  source(g, 'Djordjevic 等 2004', 880, 1215);
}
/* 少糖少盐，多放香：三罐香料冒着香气 */
function trickJars(g, t) {
  const t0 = S('n4') - .15;
  popTag(g, t, t0, 480, 400, '少放糖、少放盐', 44, { fill: '#FFFFFF' });
  [['香草', 260, '#5A3420', '#C9A06A'], ['肉桂', 480, '#B5651D', '#E8A04A'], ['葱姜蒜', 700, '#7DBB57', '#B8E08A']].forEach(([s, x, col, aro], i) => {
    const p = pop(t, t0 + .2 + i * .15, .3);
    if (p <= 0) return;
    g.save(); g.translate(x, 920); g.scale(p, p); drawJar(g, 0, 0, 13, s, col); g.restore();
    if (t > CH('n4', 1) - .2) aroma(g, x, 680, t + i, aro, 9);
  });
  popText(g, t, CH('n4', 1) - .1, 99, '多放点香', 480, 1080, 84, C.amber);
  source(g, '推出来的：实验是在糖水、盐水里做的', 880, 1215);
}

/* ================= 吃得更香的小办法 ================= */
function eatingRoom(b, t, o = {}) {
  canteen(b, t);
  drawClawd(b, 5, 92, person(1, { eyes: 'happy', snout: true }));
  drawClawd(b, 74, 92, person(3, { eyes: 'happy', snout: true }));
  canteenTable(b, 0, 104, 34); canteenTable(b, 70, 104, 38);
  drawBowl(b, 16, 101, t); drawBowl(b, 84, 101, t);
  drawClawd(b, 42, 100, youO(t, Object.assign({ mouth: Math.floor(t * 5) % 2 ? 'chew' : 'smile', eyes: 'happy' }, o.you || {})));
  canteenTable(b, 30, 112, 48);
  drawBowl(b, 50, 109, t);
}
function guide(g, t) {
  const b = pbuf('gd', 108, 192);
  eatingRoom(b, t);
  blit(g, 'gd', 10);
  g.fillStyle = 'rgba(20,14,40,.3)'; g.fillRect(0, 0, W, H);
  const pp = E.out(clamp((t - S('g1') + .3) / .4));
  if (pp > 0) {
    g.save(); g.translate(0, (1 - pp) * 500); g.globalAlpha *= pp;
    pbox(g, 60, 290, 840, 660, { k: 6 });
    g.fillStyle = '#3E9E4F'; g.fillRect(72, 302, 816, 72);
    ptext(g, '★ 吃得更香 ★', 480, 356, 48, C.white, { align: 'center', sh: 1 });
    ptext(g, '舌头只管五味，香味靠鼻子：', 110, 446, 32, '#CFC6E8');
    const rows = [
      [S('g2') - .2, '{慢慢嚼}，让香气走后门', 560],
      [S('g3') - .2, '少糖少盐，用{香料}来补', 700],
      [S('g4') - .2, '感冒没味，{别猛加盐}', 840],
    ];
    rows.forEach(([t0, s, y]) => {
      const u = pop(t, t0, .35); if (u <= 0) return;
      withAlpha(g, u, () => { g.fillStyle = C.green; g.fillRect(100, y - 32, 36, 36); g.fillStyle = C.ink; g.fillRect(106, y - 26, 24, 24); if (t > t0 + .4) checkMark(g, 104, y - 30, 4, C.green); prich(g, s, 160, y, 40, C.white, C.gold); });
    });
    source(g, '第 1、3 条是按原理推出来的', 880, 920, { px: 22, col: '#9C93C0' });
    g.restore();
  }
}

/* ================= 结尾 ================= */
function endScene(g, t) {
  const b = pbuf('en', 108, 192);
  eatingRoom(b, t, { you: { eyes: t > S('z1') - .2 ? 'happy' : 'n' } });
  blit(g, 'en', 10);
  dialogBox(g, t, 'd3', PORTRAIT.youHappy);
  if (t > S('d3') + .1) {
    const p = pop(t, S('d3') + .1, .35);
    g.save(); g.translate(480, 380); g.scale(p, p);
    pbox(g, -380, -130, 760, 260, { k: 6 });
    drawTongue(g, -300, -46, 3, { face: false, lips: false });
    ptext(g, '舌头：酸甜苦咸鲜', -230, -30, 44, C.white);
    drawNose(g, -300, 60, 3);
    prich(g, '鼻子：剩下的{千百种}', -230, 76, 44, C.white, C.gold);
    g.restore();
  }
  // 鼻子戴上皇冠
  const pc = pop(t, CH('z1', 2) - .2, .35);
  if (pc > 0) { g.save(); g.translate(780, 760); g.scale(pc, pc); drawNose(g, 0, 0, 8, { sniff: t * 1.5 }); pixStar(g, 0, -120, 9); g.restore(); }
}

/* ================= 片尾 ================= */
function endCard(g, t) {
  const b = pbuf('cd', 108, 192);
  eatingRoom(b, t, { you: { eyes: 'happy', arms: 'upL' } });
  blit(g, 'cd', 10);
  g.fillStyle = 'rgba(10,8,24,.45)'; g.fillRect(0, 0, W, H);
  const p = E.out(clamp((t - SS('card') - .05) / .3));
  g.save(); g.globalAlpha *= p;
  pbox(g, 60, 520, 840, 420, { k: 6, fill: 'rgba(27,23,48,.92)' });
  ptext(g, '味道是舌头尝的，还是鼻子闻的？', 480, 640, 48, C.white, { align: 'center', sh: 1 });
  prich(g, '舌头管五味，{鼻子管百味}。', 480, 740, 40, C.white, C.gold, { align: 'center' });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(130, 790, 700, 4);
  ptext(g, '甜菜  出品', 480, 860, 36, C.amber, { align: 'center' });
  // 配音也是 AI 合成的，一并写明
  ptext(g, '画面、字幕、音效：Claude 用代码生成 · 配音：CosyVoice 3 合成', 480, 905, 24, '#9C93C0', { align: 'center' });
  g.restore();
}
