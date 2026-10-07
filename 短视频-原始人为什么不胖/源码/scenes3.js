'use strict';
/* scenes3.js：进化错配 → 不胖攻略 → 结尾（篝火边）→ 片尾。 */

/* ================= 进化错配 ================= */
function mismatch(g, t) {
  const b = pbuf('mod', 108, 192), fy = 120;
  pbands(b, 0, 108, [[0, '#F2F2F2'], [fy, '#E4E8EE']], 2);
  prect(b, 0, fy, 108, 72, '#C9D0DA');
  drawShelf(b, 2, 70, 104, 3); drawShelf(b, 2, 116, 104, 2);
  blit(g, 'mod', 10);
  g.fillStyle = 'rgba(10,8,24,.62)'; g.fillRect(0, 0, W, H);
  const cp = pop(t, S('x1') - .05, .4);
  if (cp > 0) { g.save(); g.translate(540, 300); g.scale(cp, cp); ptext(g, '进化错配', 0, 40, 144, C.amber, { align: 'center', ol: C.ink, olw: 10, sh: 1 }); g.restore(); }
  const mp = pop(t, CH('x1', 1) - .1, .35);
  if (mp > 0) {
    g.save(); g.translate(540, 760); g.scale(mp, mp);
    sysWindow(g, -480, -270, 960, 480, '⚠ 版本不兼容', { bar: '#D9443B' });
    const rows = [[CH('x1', 1) + .2, '采购规则', '见到吃的，先吃再说', '（饥荒版）', '#3B3363'], [CH('x1', 2), '现在', '超市 24 小时 · 外卖 30 分钟', '', '#3B3363'], [CH('x1', 3) + .3, '状态', '脂肪仓库：爆仓', '', '#D9443B']];
    rows.forEach(([t0, a, v, s2, col], i) => {
      const u = clamp((t - t0) / .2); if (u <= 0) return;
      withAlpha(g, u, () => { ptext(g, a, -420, -120 + i * 130, 44, '#6B6488'); ptext(g, v, -200, -120 + i * 130, 44, col); if (s2) ptext(g, s2, -200, -74 + i * 130, 30, '#8A84A6'); });
    });
    g.restore();
  }
  // 外卖小哥一闪而过
  if (t > CH('x1', 3) - .2) {
    const u = (t - CH('x1', 3) + .2) / 1.3, x = lerp(-40, 120, u);
    const sb = pbuf('scoot', 36, 26); prect(sb, 0, 0, 36, 26, 'rgba(0,0,0,0)');
    prect(sb, 4, 16, 26, 4, '#FFD84A'); pdisc(sb, 8, 21, 3, '#2A2630'); pdisc(sb, 27, 21, 3, '#2A2630'); prect(sb, 24, 8, 3, 9, '#596070');
    drawClawd(sb, 6, 2, { hat: 'hard', eyes: 'happy', arms: 'upR' }); prect(sb, 0, 6, 8, 8, '#FFD84A'); prect(sb, 1, 7, 6, 6, '#F2C230');
    put(g, 'scoot', 0, 0, 36, 26, Math.round(x * 10), 1060, 8);
  }
}

/* ================= 不胖攻略 ================= */
function guide(g, t) {
  const b = pbuf('kit', 108, 192), fy = 58;
  pbands(b, 0, 108, [[0, '#F6E7B8'], [fy, '#F2DFA8']], 2);
  for (let x = 0; x < 108; x += 8) for (let y = 0; y < fy - 2; y += 8) prect(b, x, y, 7, 7, (x + y) % 16 ? '#FFF6D6' : '#FBEFC4');
  prect(b, 0, fy, 108, 134, '#C98B4A'); for (let x = 0; x < 108; x += 10) prect(b, x, fy, 1, 134, '#B97A3E');
  // 桌子 + 一盘看得出原样的饭菜
  prect(b, 30, fy - 8, 50, 3, '#8C6440'); prect(b, 33, fy - 5, 2, 5, '#6B4630'); prect(b, 75, fy - 5, 2, 5, '#6B4630');
  pell(b, 55, fy - 10, 13, 3, '#F4F4F4'); pspr(b, FOOD.rice(), 43, fy - 17); pspr(b, FOOD.greens(), 52, fy - 16); pspr(b, FOOD.egg(), 60, fy - 15); pspr(b, FOOD.meat(), 64, fy - 18);
  drawYou(b, 8, fy - 16, t, { eyes: t > S('g1') + .4 ? 'happy' : undefined, arms: 'upR' });
  blit(g, 'kit', 10);
  const pp = E.out(clamp((t - S('g1') - .2) / .4));
  if (pp > 0) {
    g.save(); g.translate(0, (1 - pp) * 500); g.globalAlpha *= pp;
    pbox(g, 40, 640, 1000, 620, { k: 6 });
    g.fillStyle = '#3E9E4F'; g.fillRect(52, 652, 976, 72);
    ptext(g, '★ 不胖攻略 ★', 540, 706, 48, C.white, { align: 'center', sh: 1 });
    const rows = [
      [CH('g1', 1), '多吃{看得出原样}的食物', 790],
      [CH('g2', 2), '配料表一长串、厨房里没有的 → {少买}', 970],
      [S('g3'), '含糖饮料 → 换成{白水或茶}', 1050],
      [S('g4'), '运动照样做：管心脏、血糖、心情', 1130],
      [CH('g4', 2), '减肥，{主要靠吃}', 1210],
    ];
    rows.forEach(([t0, s, y]) => {
      const u = pop(t, t0, .35); if (u <= 0) return;
      withAlpha(g, u, () => { g.fillStyle = C.green; g.fillRect(76, y - 30, 34, 34); g.fillStyle = C.ink; g.fillRect(81, y - 25, 24, 24); prich(g, s, 130, y, 40, C.white, C.gold); });
    });
    // 一排看得出原样的食物
    WHOLE.forEach((k, i) => {
      const u = pop(t, CH('g2', 0) + i * .45, .3); if (u <= 0) return;
      const fb = pbuf('wg' + k, 12, 10); pspr(fb, FOOD[k](), 1, 1);
      g.save(); g.translate(170 + i * 150, 870); g.scale(u, u); put(g, 'wg' + k, 0, 0, 12, 10, -54, -45, 9); g.restore();
    });
    g.restore();
  }
}

/* ================= 结尾：篝火边 ================= */
function endScene(g, t) {
  const b = pbuf('endb', 108, 192), hy = 100;
  const dusk = clamp((t - S('z2')) / 2);
  pbands(b, 0, 108, [[0, '#3B2A5E'], [40, '#7A3F6E'], [70, '#E07A5A'], [hy - 6, '#F2A65A'], [hy, '#F2A65A']], 3);
  pdisc(b, 80, hy - 8, 10, '#FFD27A'); pdisc(b, 80, hy - 8, 8, '#FFE6A0');
  for (let x = 0; x < 108; x++) { const h1 = 5 + Math.sin(x * .08) * 3; prect(b, x, hy - h1, 1, h1, '#6B3F5E'); }
  pbands(b, 0, 108, [[hy, '#8C5A3A'], [hy + 30, '#6B4630'], [192, '#5E3E28']], 3);
  for (let i = 0; i < 20; i++) pdot(b, hash(i, 2) * 108, hash(i, 3) * 40, '#FFF3C4');
  drawFire(b, 54, hy + 16, t);
  pspr(b, FOOD.root(), 50, hy + 6);
  drawClawd(b, 22, hy, { hat: 'bone', eyes: 'happy', arms: 'upR' });
  drawYou(b, 62, hy, t, { eyes: t > S('z1') ? 'happy' : undefined, arms: t < EN('d5') ? 'upL' : 'n' });
  blit(g, 'endb', 10);
  if (dusk > 0) { g.fillStyle = `rgba(20,10,40,${dusk * .25})`; g.fillRect(0, 0, W, H); }
  dialogBox(g, t, 'd5', PORTRAIT.you);
  if (t > CH('z2', 1)) {
    const p = pop(t, CH('z2', 1), .35);
    g.save(); g.translate(540, 520); g.scale(p, p);
    pbox(g, -330, -90, 660, 180, { k: 6 });
    ptext(g, '身体的规矩：', -280, -20, 36, '#CFC6E8');
    ptext(g, '能囤就囤，以防饥荒', -280, 46, 48, C.gold);
    g.restore();
  }
}

/* ================= 片尾 ================= */
function endCard(g, t) {
  const b = pbuf('card', 108, 192);
  drawSavanna(b, t, 108, 192, 120, { sunX: 54, sunY: 40 });
  const bob = i => Math.floor(t * 4 + i) % 2;
  feetShadow(b, 8, 146); drawClawd(b, 8, 130 - bob(0), { hat: 'bone', eyes: 'happy', arms: 'upR' });
  feetShadow(b, 42, 146); drawYou(b, 42, 130 - bob(1), t, { eyes: 'happy', arms: 'upL' });
  pspr(b, FOOD.root(), 70, 136); pspr(b, FOOD.apple(), 82, 137); pspr(b, FOOD.egg(), 92, 139);
  blit(g, 'card', 10);
  const gr = g.createRadialGradient(540, 400, 10, 540, 400, 700); gr.addColorStop(0, 'rgba(255,244,190,.6)'); gr.addColorStop(1, 'rgba(255,244,190,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, 1300);
  const p = E.out(clamp((t - SS('card') - .1) / .5));
  g.save(); g.globalAlpha *= p;
  pbox(g, 70, 560, 940, 420, { k: 6, fill: 'rgba(27,23,48,.9)' });
  ptext(g, '原始人为什么不胖？', 540, 680, 60, C.white, { align: 'center', sh: 1 });
  prich(g, '他们吃的东西，{看得出原样}。', 540, 790, 60, C.white, C.gold, { align: 'center' });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(140, 840, 800, 4);
  ptext(g, '甜菜  出品', 540, 910, 36, C.amber, { align: 'center' });
  ptext(g, '画面、字幕、音效：Claude 用代码生成', 540, 952, 24, '#9C93C0', { align: 'center' });
  g.restore();
}
