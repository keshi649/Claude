'use strict';
/* scenes3.js：进化错配 → 好睡攻略 → 结尾（篝火边，凉风一来，两个人都睡着了）→ 片尾。 */

/* ================= 进化错配 ================= */
function mismatch(g, t) {
  const b = pbuf('mis', 108, 192);
  bedroom(b, t, { wall: 1, rad: true, radGlow: .8, ac: 1, acOn: true });
  drawBed(b, 44, 126, 52); drawYou(b, 50, 112, t, { night: true, eyes: 'tired' }); blanket(b, 44, 126, 52, '#6E9BD6');
  blit(g, 'mis', 10);
  g.fillStyle = 'rgba(10,8,24,.62)'; g.fillRect(0, 0, W, H);
  const cp = pop(t, S('x1') - .05, .4);
  if (cp > 0) { g.save(); g.translate(480, 300); g.scale(cp, cp); ptext(g, '进化错配', 0, 40, 144, C.amber, { align: 'center', ol: C.ink, olw: 10, sh: 1 }); g.restore(); }
  const mp = pop(t, CH('x1', 1) - .1, .35);
  if (mp > 0) {
    g.save(); g.translate(500, 760); g.scale(mp, mp);
    sysWindow(g, -400, -250, 800, 480, '⚠ 版本不兼容', { bar: '#D9443B' });
    const rows = [[CH('x1', 1) + .2, '开关', '等夜里降温', '（野外版）', '#3B3363'], [CH('x1', 3), '卧室', '暖气、空调', '一整夜一个温度', '#3B3363'], [CH('x1', 4) + .2, '状态', '等不到信号', '迟迟不关机', '#D9443B']];
    rows.forEach(([t0, a, v, s2, col], i) => {
      const u = clamp((t - t0) / .2); if (u <= 0) return;
      withAlpha(g, u, () => { ptext(g, a, -350, -110 + i * 130, 44, '#6B6488'); ptext(g, v, -180, -110 + i * 130, 48, col); ptext(g, s2, -180, -62 + i * 130, 30, '#8A84A6'); });
    });
    g.restore();
  }
}

/* ================= 好睡攻略 ================= */
function guide(g, t) {
  const b = pbuf('gd', 108, 192);
  bedroom(b, t, { cool: .9 });
  const sleep = t > S('g4');
  drawBed(b, 44, 126, 52); drawYou(b, 50, 112, t, { night: true, eyes: sleep ? 'shut' : 'happy' }); blanket(b, 44, 126, 52, '#9FD3FF', 6);
  if (sleep) drawZzz(b, 74, 98, t, '#E8E4FF');
  blit(g, 'gd', 10);
  const pp = E.out(clamp((t - S('g1') - .2) / .4));
  if (pp > 0) {
    g.save(); g.translate(0, (1 - pp) * 500); g.globalAlpha *= pp;
    pbox(g, 60, 500, 840, 600, { k: 6 });
    g.fillStyle = '#3E9E4F'; g.fillRect(72, 512, 816, 72);
    ptext(g, '★ 好睡攻略 ★', 480, 566, 48, C.white, { align: 'center', sh: 1 });
    const rows = [
      [CH('g2', 0), '睡前 1~2 小时，洗个{热水澡}', 680],
      [CH('g2', 2), '水温 40℃ 出头，{十分钟}就够', 790],
      [S('g3'), '卧室{凉一点}，被子别太厚', 900],
      [S('g4'), '长期睡不好 → {看医生}', 1010],
    ];
    rows.forEach(([t0, s, y]) => {
      const u = pop(t, t0, .35); if (u <= 0) return;
      withAlpha(g, u, () => { g.fillStyle = C.green; g.fillRect(100, y - 32, 36, 36); g.fillStyle = C.ink; g.fillRect(106, y - 26, 24, 24); if (t > t0 + .4) checkMark(g, 104, y - 30, 4, C.green); prich(g, s, 160, y, 42, C.white, C.gold); });
    });
    g.restore();
  }
}

/* ================= 结尾：篝火边 ================= */
function endScene(g, t) {
  const b = pbuf('endb', 108, 192), hy = 100;
  const breeze = clamp((t - CH('z2', 2) + .3) / .8);
  nightField(b, t, hy, 1.7, { mx: 86, my: 20 });
  drawBreeze(b, 108, 30, 90, t, breeze);
  fireGlow(b, 54, hy + 20, 24, .9 - .4 * breeze); drawFire(b, 54, hy + 22, t, 1 - .7 * breeze);
  const asleep = breeze > .6;
  drawCaveman(b, 14, hy + 8, t, { eyes: 'shut' }); drawZzz(b, 34, hy, t, '#E8E4FF');
  drawYou(b, 66, hy + 8, t, { night: true, eyes: asleep ? 'shut' : (t > S('z1') ? 'happy' : 'tired'), arms: t < EN('d6') ? 'upL' : 'n' });
  if (asleep) drawZzz(b, 86, hy, t + .5, '#E8E4FF');
  blit(g, 'endb', 10);
  dialogBox(g, t, 'd6', PORTRAIT.you);
  if (t > CH('z2', 1)) {
    const p = pop(t, CH('z2', 1), .35);
    g.save(); g.translate(480, 520); g.scale(p, p);
    pbox(g, -330, -90, 660, 180, { k: 6 });
    ptext(g, '睡眠开关的规矩：', -280, -20, 36, '#CFC6E8');
    ptext(g, '降了温，才关机', -280, 46, 48, C.gold);
    g.restore();
  }
}

/* ================= 片尾 ================= */
function endCard(g, t) {
  const b = pbuf('card', 108, 192), hy = 120;
  nightField(b, t, hy, 1.6, { mx: 84, my: 24 });
  fireGlow(b, 54, hy + 26, 26, .9); drawFire(b, 54, hy + 28, t);
  drawCaveman(b, 16, hy + 14, t, { eyes: 'shut' }); drawYou(b, 66, hy + 14, t, { night: true, eyes: 'shut' });
  drawZzz(b, 36, hy + 6, t, '#E8E4FF'); drawZzz(b, 86, hy + 6, t + .5, '#E8E4FF');
  blit(g, 'card', 10);
  const p = E.out(clamp((t - SS('card') - .05) / .3));
  g.save(); g.globalAlpha *= p;
  pbox(g, 100, 520, 860, 420, { k: 6, fill: 'rgba(27,23,48,.92)' });
  ptext(g, '原始人为什么不失眠？', 520, 640, 56, C.white, { align: 'center', sh: 1 });
  prich(g, '每天夜里，大自然都替他们{降温}。', 520, 740, 46, C.white, C.gold, { align: 'center' });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(170, 790, 700, 4);
  ptext(g, '甜菜  出品', 520, 860, 36, C.amber, { align: 'center' });
  ptext(g, '画面、字幕、音效：Claude 用代码生成', 520, 905, 24, '#9C93C0', { align: 'center' });
  g.restore();
}
