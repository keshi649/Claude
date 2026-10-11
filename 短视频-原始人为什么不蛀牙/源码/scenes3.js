'use strict';
/* scenes3.js：进化错配 → 护牙攻略 → 结尾（"你"一口气喝完奶茶，再喝口清水，口水修理工开工）→ 片尾。 */

/* ================= 进化错配 ================= */
function mismatch(g, t) {
  const b = pbuf('mis', MW, MH);
  mouthBG(b, t);
  drawMolar(b, i => (DIS2.includes(i) ? .1 : 1), { cavity: 1 });
  BUGS.forEach(([x, i]) => drawBug(b, x, bugY(x), t, { arms: Math.floor(t * 6 + i) % 2 ? 'up' : 'n', eyes: 'happy' }, i === 1));
  blit(g, 'mis', MP);
  g.fillStyle = 'rgba(10,8,24,.62)'; g.fillRect(0, 0, W, H);
  const cp = pop(t, S('x1') - .05, .4);
  if (cp > 0) { g.save(); g.translate(480, 300); g.scale(cp, cp); ptext(g, '进化错配', 0, 40, 144, C.amber, { align: 'center', ol: C.ink, olw: 10, sh: 1 }); g.restore(); }
  const mp = pop(t, CH('x1', 1) - .1, .35);
  if (mp > 0) {
    g.save(); g.translate(490, 760); g.scale(mp, mp);
    sysWindow(g, -410, -250, 820, 480, '⚠ 节奏对不上', { bar: '#D9443B' });
    const rows = [
      [CH('x1', 1) + .2, '口水', '按原始人的节奏', '一天来一两回甜的，补得过来', '#3B3363'],
      [CH('x1', 3), '你的嘴', '隔一会儿就来一回', '奶茶、零食、饮料……', '#3B3363'],
      [CH('x1', 4) + .3, '结果', '补不过来', '拆得比补得快 → 蛀牙', '#D9443B'],
    ];
    rows.forEach(([t0, a, v, s2, col], i) => {
      const u = clamp((t - t0) / .2); if (u <= 0) return;
      withAlpha(g, u, () => { ptext(g, a, -360, -110 + i * 130, 44, '#6B6488'); ptext(g, v, -170, -110 + i * 130, 48, col); ptext(g, s2, -170, -62 + i * 130, 30, '#8A84A6'); });
    });
    g.restore();
  }
}

/* ================= 护牙攻略 ================= */
function guide(g, t) {
  const b = pbuf('gd', 108, 192);
  bathroom(b, t);
  const brushing = t > S('g4') - .1 && t < EN('g4') + 1.2;
  drawYou(b, 42, 118, t, { arms: brushing || t < S('g2') ? 'upR' : 'n', grin: brushing ? 'white' : null, eyes: brushing ? 'happy' : blinkEyes(t, 1) });
  if (brushing) drawBrush(b, 48 + (Math.floor(t * 10) % 2), 124, -.1);
  else drawWater(b, 64, 112, 6, 9, .8);
  blit(g, 'gd', 10);
  const pp = E.out(clamp((t - S('g1') + .4) / .4));
  if (pp > 0) {
    g.save(); g.translate(0, (1 - pp) * 500); g.globalAlpha *= pp;
    pbox(g, 60, 420, 840, 720, { k: 6 });
    g.fillStyle = '#3E9E4F'; g.fillRect(72, 432, 816, 72);
    ptext(g, '★ 护牙攻略 ★', 480, 486, 48, C.white, { align: 'center', sh: 1 });
    // 跟着旁白：最要紧的是…… → 不只是少吃糖 → 少吃几回
    if (t > CH('g1', 0) + .3) {
      const line = t < CH('g1', 1) - .05 ? '最要紧的是……' : t < CH('g1', 2) - .05 ? '最要紧的：不只是少吃糖' : '最要紧的：{少吃几回}';
      prich(g, line, 480, 580, 44, C.white, C.gold, { align: 'center' });
    }
    g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(110, 616, 740, 4);
    const rows = [
      [CH('g2', 0) - .2, '甜的{集中吃}，别一下午抿', 700],
      [S('g3') - .2, '吃完喝几口{清水}', 810],
      [S('g4') - .2, '早晚用{含氟牙膏}刷牙', 920],
      [S('g5') - .2, '牙疼、有洞 → {看牙医}', 1030],
    ];
    rows.forEach(([t0, s, y]) => {
      const u = pop(t, t0, .35); if (u <= 0) return;
      withAlpha(g, u, () => { g.fillStyle = C.green; g.fillRect(100, y - 32, 36, 36); g.fillStyle = C.ink; g.fillRect(106, y - 26, 24, 24); if (t > t0 + .4) checkMark(g, 104, y - 30, 4, C.green); prich(g, s, 160, y, 42, C.white, C.gold); });
    });
    source(g, '出处：NHS 苏格兰 Childsmile 护牙指南（少吃几回最要紧）', 880, 1112, { px: 22 });
    g.restore();
  }
}

/* ================= 结尾：一口气喝完，再来口清水 ================= */
function endScene(g, t) {
  const b = pbuf('endb', 108, 192);
  office(b, t);
  const tD = S('d7'), drink = clamp((t - tD + .2) / 1.0), water = clamp((t - tD - 1.0) / .8);
  const sipping = drink > 0 && drink < 1, gulp = water > 0 && water < 1;
  drawYou(b, 22, 104, t, { arms: 'upL', grin: sipping || gulp ? 'sip' : (t > S('z1') ? 'white' : null), eyes: sipping || gulp ? 'shut' : 'happy' });
  if (drink < 1) drawTea(b, 14, 98, 10, 14, .6 * (1 - drink), t, { sip: sipping });
  else { drawTea(b, 40, 106, 10, 14, 0, t, {}); drawWater(b, 14, 104, 7, 9, 1 - .7 * water); }
  blit(g, 'endb', 10);
  // 右上角的小窗：牙上的修理工开工了
  const pw = E.out(clamp((t - tD - 1.4) / .4));
  if (pw > 0) withAlpha(g, pw, () => {
    const mb = pbuf('endm', 60, 40); mb.clearRect(0, 0, 60, 40);
    mb.fillStyle = '#3A1420'; mb.fillRect(0, 0, 60, 40);
    for (let x = 4; x < 56; x++) { const u = (x - 4) / 52, y = 20 - Math.round(3 * (.5 - .5 * Math.cos(u * 4 * Math.PI))); prect(mb, x, y, 1, 22, '#F3E6C6'); prect(mb, x, y, 1, 2, '#FBF7EE'); }
    prect(mb, 0, 34, 60, 6, '#D9637A');
    drawWorker(mb, 18 + Math.round(Math.sin(t * 2) * 3), 2, t, { arms: Math.floor(t * 6) % 2 ? 'dn' : 'up', eyes: 'happy' }, true);
    pbox(g, 560, 560, 340, 260, { k: 6 });
    put(g, 'endm', 0, 0, 60, 40, 580, 580, 5);
    if (Math.floor(t * 4) % 2) { g.fillStyle = '#FFFFFF'; g.fillRect(820, 640, 8, 24); g.fillRect(812, 648, 24, 8); }
  });
  dialogBox(g, t, 'd7', PORTRAIT.you);
  if (t > CH('z1', 1)) {
    const p = pop(t, CH('z1', 1), .35);
    g.save(); g.translate(480, 360); g.scale(p, p);
    pbox(g, -330, -90, 660, 180, { k: 6 });
    ptext(g, '口水修理工的规矩：', -280, -20, 36, '#CFC6E8');
    ptext(g, '酸退了，才补牙', -280, 46, 48, C.gold);
    g.restore();
  }
}

/* ================= 片尾 ================= */
function endCard(g, t) {
  const b = pbuf('card', 108, 192);
  office(b, t);
  drawYou(b, 22, 104, t, { grin: 'white', eyes: 'happy' });
  drawWater(b, 40, 108, 7, 9, .3);
  blit(g, 'card', 10);
  g.fillStyle = 'rgba(10,8,24,.35)'; g.fillRect(0, 0, W, H);
  const p = E.out(clamp((t - SS('card') - .05) / .3));
  g.save(); g.globalAlpha *= p;
  pbox(g, 60, 520, 840, 420, { k: 6, fill: 'rgba(27,23,48,.92)' });
  ptext(g, '原始人为什么不蛀牙？', 480, 640, 56, C.white, { align: 'center', sh: 1 });
  prich(g, '一杯奶茶，{别抿一下午}。', 480, 740, 46, C.white, C.gold, { align: 'center' });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(130, 790, 700, 4);
  ptext(g, '甜菜  出品', 480, 860, 36, C.amber, { align: 'center' });
  // 配音也是 AI 合成的，一并写明
  ptext(g, '画面、字幕、音效：Claude 用代码生成 · 配音：CosyVoice 3 合成', 480, 905, 24, '#9C93C0', { align: 'center' });
  g.restore();
}
