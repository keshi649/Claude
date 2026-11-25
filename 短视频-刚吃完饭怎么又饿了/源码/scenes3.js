'use strict';
/* scenes3.js：反过来也灵（下午想吃零食前，先花 5 分钟回想午饭：泡泡里午饭一样样冒出来，馋虫变小 → "中午……吃了啥来着？"）→
   攻略卡（吃饭时放下手机；想吃零食前先回想上一顿）→ 结尾（晚上在家吃饭，手机扣在桌上，账本记得清清楚楚，馋虫睡着了；
   "原来我不是馋，是没记住！"→"评论区说说：你吃饭离得开手机吗？"）→ 片尾。 */

function recall(g, t) {
  const t0 = SS('recall');
  const thinking = t < S('d3') - .1;
  deskScene(g, t, { pm: 1, clock: 15 * 60 + 5, phone: !thinking, chips: false, you: thinking ? { eyes: 'shut', mouth: 'flat' } : { eyes: 'up', mouth: 'o', sweat: true } });
  popTag(g, t, t0 + .1, 480, 470, '下午三点，想吃零食', 40, { fill: C.gold });
  // 零食摆在桌上：薯片、饼干
  food(g, 'chips', 700, 1110, 7); food(g, 'cookie', 800, 1120, 6);
  // 计时 5 分钟
  if (t > CH('r1', 2) - .2) {
    const u = clamp((t - CH('r1', 2) + .2) / 2.2), sec = Math.round(300 * (1 - u));
    pbox(g, 90, 560, 200, 90, { k: 5, fill: '#16222F' });
    ptext(g, `${Math.floor(sec / 60)}:${String(sec % 60).padStart(2, '0')}`, 190, 622, 48, C.gold, { align: 'center' });
  }
  // 回想：泡泡里午饭一样样冒出来
  if (thinking && t > CH('r1', 3) - .3) {
    const p = pop(t, CH('r1', 3) - .3, .3);
    g.save(); g.translate(640, 760); g.scale(p, p);
    bubble(g, 0, 0, 230, 110, -60, 220);
    ptext(g, '中午吃了……', 0, -40, 36, C.ink, { align: 'center' });
    ['rice', 'veg', 'leg'].forEach((f, i) => { if (t > CH('r1', 3) + i * .35) food(g, f, -120 + i * 120, 40, 6); });
    g.restore();
  }
  // 馋虫：念到"少吃一些"时变小
  const shrink = E.io(clamp((t - CH('r1', 4) + .2) / .6));
  g.save(); g.translate(250, 880); chanchong(g, t, 0, 0, Math.round(lerp(10, 5, shrink)), { angry: shrink < .5, sleep: shrink >= 1 }); g.restore();
  if (t > CH('r1', 4) - .2) popTag(g, t, CH('r1', 4) - .2, 250, 760, '馋劲小了', 36, { fill: '#B8F0C8' });
  // "中午……吃了啥来着？"：泡泡里只有问号
  if (!thinking) {
    const p = pop(t, S('d3') - .05, .3);
    g.save(); g.translate(640, 760); g.scale(p, p); bubble(g, 0, 0, 200, 100, -60, 220);
    ptext(g, '？？？', 0, 24, 72, '#9AA6C0', { align: 'center' }); g.restore();
  }
  dialogBox(g, t, 'd3', PORTRAIT.youThink);
  source(g, '出处：Higgs，2002，Appetite（女大学生，先想 5 分钟午饭再尝饼干）', 880, 1238);
}

/* ================= 攻略卡 ================= */
function guide(g, t) {
  deskScene(g, t, { pm: 1, clock: 15 * 60 + 10, phone: false, you: { eyes: 'up' } });
  g.fillStyle = 'rgba(10,8,24,.5)'; g.fillRect(0, 0, W, H);
  const pp = E.out(clamp((t - S('g1') + .3) / .4));
  if (pp <= 0) return;
  g.save(); g.translate(0, (1 - pp) * 500); g.globalAlpha *= pp;
  pbox(g, 60, 300, 840, 680, { k: 6 });
  g.fillStyle = '#3E9E4F'; g.fillRect(72, 312, 816, 76);
  ptext(g, '★ 吃完不那么快饿 ★', 480, 368, 48, C.white, { align: 'center', sh: 1 });
  const rows = [
    [S('g2') - .2, '吃饭时，{放下手机}', 500, CH('g2', 2) - .2, '刷剧、打游戏都算', 'phone'],
    [S('g3') - .2, '想吃零食前，{回想上一顿}', 720, S('g3') - .1, '吃了什么，什么味道', 'think'],   // 小字跟着这一行出来：整张卡完整地停 ≥ 3 秒
  ];
  rows.forEach(([t0, s, y, t1, sub, ic]) => {
    if (t < t0 - .1) { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(100, y - 34, 40, 40); g.fillStyle = C.ink; g.fillRect(106, y - 28, 28, 28); g.fillStyle = 'rgba(255,255,255,.1)'; g.fillRect(164, y - 30, 480, 32); }
    const u = pop(t, t0 - .1, .35); if (u <= 0) return;
    withAlpha(g, clamp(u), () => {
      g.fillStyle = C.green; g.fillRect(100, y - 34, 40, 40); g.fillStyle = C.ink; g.fillRect(106, y - 28, 28, 28); if (t > t0 + .4) checkMark(g, 104, y - 32, 5, C.green);
      prich(g, s, 164, y, 44, C.white, C.gold);
      if (ic === 'phone') { g.fillStyle = C.ink; g.fillRect(780, y + 40, 90, 40); g.fillStyle = '#5A6378'; g.fillRect(786, y + 46, 78, 28); ptext(g, '扣着', 825, y + 112, 24, '#CFC6E8', { align: 'center' }); }
      if (ic === 'think') { bubble(g, 820, y + 70, 60, 40, null, null); food(g, 'rice', 820, y + 70, 3); }
    });
    if (t > t1) withAlpha(g, E.out(clamp((t - t1) / .4)), () => { g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(150, y + 26, 560, 70); ptext(g, sub, 170, y + 74, 32, '#CFC6E8'); });
  });
  ptext(g, '（按上面的研究推出来的建议）', 480, 940, 26, '#9C93C0', { align: 'center' });
  g.restore();
}

/* ================= 结尾：晚上在家吃饭，手机扣在桌上 ================= */
function endScene(g, t) {
  const b = pbuf('home', 216, 384); homeBG(b, t); blit(g, 'home', 5);
  glow(g, 370, 260, 520, 'rgba(255,210,140,.35)');
  const cx = 480, by = 1240, k = 15;
  crabAt(g, cx, by, k, youO(t, { eyes: t > S('z1') ? 'happy' : 'wide', mouth: Math.floor(t * 4) % 2 ? 'chew' : 'smile' }));
  g.fillStyle = '#E8A94A'; g.fillRect(40, 1150, 900, 50); g.fillStyle = '#F2C27A'; g.fillRect(40, 1150, 900, 8); g.fillStyle = '#B07E4A'; g.fillRect(40, 1200, 900, 400);
  tray(g, 420, 1110, .75, clamp((t - SS('end')) / 6));
  g.fillStyle = C.ink; g.fillRect(700, 1120, 120, 40); g.fillStyle = '#5A6378'; g.fillRect(706, 1126, 108, 28);
  popTag(g, t, SS('end') + .3, 760, 1060, '手机扣着', 28, { fill: '#FFE9A8' });
  bubble(g, 700, 760, 190, 130, 590, 980);
  ledger(g, t, 700, 755, .7, { rows: ['早饭 ✓'], lunchLabel: '晚饭：', lunch: ['rice', 'veg', 'leg'], stampTxt: '吃过了', stampP: 1 });
  g.save(); g.translate(230, 900); chanchong(g, t, 0, 0, 6, { sleep: true }); g.restore();
  dialogBox(g, t, 'd4', PORTRAIT.youHappy);
  if (t > CH('z1', 1) - .2) {
    const p = pop(t, CH('z1', 1) - .2, .35);
    g.save(); g.translate(480, 480); g.scale(p, p);
    pbox(g, -380, -170, 760, 340, { k: 6, fill: '#FFFFFF', rim: '#F4E9D8' });
    ptext(g, '你吃饭离得开手机吗？', 0, -80, 44, C.ink, { align: 'center' });
    pbox(g, -330, -10, 300, 120, { k: 5, fill: '#7DA64E', shadow: false }); ptext(g, '离得开', -180, 70, 52, C.white, { align: 'center', ol: C.ink, olw: 5 });
    pbox(g, 30, -10, 300, 120, { k: 5, fill: '#E5322D', shadow: false }); ptext(g, '离不开', 180, 70, 52, C.white, { align: 'center', ol: C.ink, olw: 5 });
    g.restore();
  }
  popTag(g, t, S('z1') - .1, 480, 250, '转给吃饭离不开手机的朋友', 32, { fill: C.gold });
}

/* ================= 片尾 ================= */
function endCard(g, t) {
  const b = pbuf('home', 216, 384); homeBG(b, t); blit(g, 'home', 5);
  g.fillStyle = 'rgba(10,8,24,.6)'; g.fillRect(0, 0, W, H);
  const p = E.out(clamp((t - SS('card') - .05) / .3));
  g.save(); g.globalAlpha *= p;
  pbox(g, 60, 470, 840, 560, { k: 6, fill: 'rgba(27,23,48,.92)' });
  ptext(g, '刚吃完饭，怎么又饿了？', 480, 580, 44, C.white, { align: 'center', sh: 1 });
  prich(g, '不是没吃饱：是{大脑没记住}。', 480, 670, 40, C.white, C.gold, { align: 'center' });
  prich(g, '吃饭{放下手机}，馋了先{回想上一顿}。', 480, 750, 34, '#CFC6E8', C.gold, { align: 'center' });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(130, 800, 700, 4);
  ptext(g, '甜菜  出品', 480, 880, 36, C.amber, { align: 'center' });
  ptext(g, '画面、字幕、音效：Claude 用代码生成 · 配音：CosyVoice 3 合成', 480, 940, 24, '#9C93C0', { align: 'center' });
  g.restore();
}
