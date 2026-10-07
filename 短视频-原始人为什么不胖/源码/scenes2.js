'use strict';
/* scenes2.js：采购部的老规矩（几十万年前）→ 工厂设计的食物（如今）→ 美国国立卫生研究院的实验。 */

/* 饱腹度 / 热量 两个读数（HUD 右边用的小条） */
function meterBar(g, x, y, w, v, col, label) {
  ptext(g, label, x, y + 30, 30, C.white);
  const bx = x + pw(g, label, 30) + 16;
  g.fillStyle = '#3B3363'; g.fillRect(bx, y + 4, w, 32);
  g.fillStyle = col; g.fillRect(bx, y + 4, Math.round(w * clamp(v) / 6) * 6, 32);
  if (v > 1) { g.fillStyle = C.red; g.fillRect(bx + w, y, 12, 40); }
}

/* ================= 几十万年前：采购部 ================= */
function ancient(g, t) {
  const b = pbuf('anc', 108, 192), hy = 92;
  drawSavanna(b, t, 108, 192, hy, { sunX: 88, sunY: 40 });
  // 远处的果树
  const bush = [80, hy + 10];
  for (let i = 0; i < 9; i++) pdisc(b, bush[0] + (i % 3) * 4 - 4, bush[1] - 4 - Math.floor(i / 3) * 3, 3, i % 2 ? '#4E8E3A' : '#6FAE4E');
  const found = t > CH('a1', 3) - .2;
  if (!found || t < CH('a1', 3) + 1) for (let i = 0; i < 5; i++) pdot(b, bush[0] - 5 + i * 2, bush[1] - 7 + (i % 2) * 3, '#7A3FA8');
  // 采购部：没吃的时候四处找，看见果树就冲过去
  const seek = Math.sin(t * 1.2) * 14;
  const x = found ? lerp(40 + seek, 60, E.out(clamp((t - CH('a1', 3) + .2) / .7))) : 40 + seek;
  const basket = found ? ['berry', 'berry', 'root', 'honey'].slice(0, 1 + Math.floor(clamp((t - CH('a1', 3) - .4) / 1.2) * 4)) : [];
  feetShadow(b, x, hy + 26); drawBuyer(b, x, hy + 10, t, { legs: found && t < CH('a1', 3) + .5 ? walkLegs(t, 12) : walkLegs(t, 4), basket, eyes: found ? 'star' : 'l' });
  // 刹车：要嚼、带渣；甜的不油，油的不甜
  blit(g, 'anc', 10);
  const ha = win(t, SS('ancient') + .2, SE('ancient'), .3, .2);
  hud(g, [{ text: '采购部 · 几十万年前' }], { alpha: ha });
  const full = t < S('a2') ? .15 + .2 * clamp((t - CH('a1', 3)) / 2) : .35 + .2 * clamp((t - S('a3')) / 1);
  withAlpha(g, ha, () => { meterBar(g, 560, 88, 300, full, full >= .54 ? C.gold : C.green, '饱腹度'); g.fillStyle = C.white; g.fillRect(560 + 106 + 150, 82, 4, 50); });
  popTag(g, t, S('a1') + .1, 540, 270, '采购部：管你吃什么、吃多少', 36, { fill: C.amber });
  if (t > CH('a1', 2) && t < CH('a1', 3)) popText(g, t, CH('a1', 2) + .1, CH('a1', 3) + .1, '今天有没有吃的？看运气', 540, 420, 36, C.white);
  dialogBox(g, t, 'd3', PORTRAIT.buyer);
  // 野外的食物自带刹车
  const pp = win(t, S('a2') - .1, S('a3') - .05, .3, .25);
  if (pp > 0) withAlpha(g, pp, () => {
    pbox(g, 60, 380, 960, 520, { k: 6 });
    ptext(g, '野外的食物，自带刹车', 540, 450, 48, C.gold, { align: 'center' });
    const row = (t0, y, food, s, s2, col) => {
      const u = pop(t, t0, .3); if (u <= 0) return;
      g.save(); g.translate(150, y); g.scale(u, u);
      const fb = pbuf('fd' + food, 12, 10); pspr(fb, FOOD[food](), 1, 1); put(g, 'fd' + food, 0, 0, 12, 10, -60, -50, 9);
      ptext(g, s, 90, 0, 40, C.white); if (s2) ptext(g, s2, 90, 44, 30, col || '#CFC6E8');
      g.restore();
    };
    row(CH('a2', 2), 560, 'root', '要使劲嚼，带着渣', '嚼得慢，饱得快', '#CFC6E8');
    row(MK('a2', 0), 690, 'berry', '果子：甜，但不油', '', '');
    row(MK('a2', 1), 820, 'meat', '肉：油，但不甜', '', '');
  });
  // 饱腹警报响了
  if (t > S('a3') - .05) {
    const ring = t > CH('a3', 1) - .1;
    const bb = pbuf('bellA', 40, 34); drawBell(bb, 20, 24, t, { ring }); put(g, 'bellA', 0, 0, 40, 34, 340, 360, 10);
    popTag(g, t, S('a3'), 540, 330, '饱腹警报', 36, { fill: C.gold });
    if (ring) popText(g, t, CH('a3', 1), 99, '饱了！', 540, 800, 120, C.gold, { ol: '#D9443B' });
  }
}

/* ================= 如今：工厂设计的食物 ================= */
function modern(g, t) {
  if (t >= S('m4') - .1) { upfLabel(g, t); return; }
  const b = pbuf('mod', 108, 192), fy = 120;
  pbands(b, 0, 108, [[0, '#F2F2F2'], [fy, '#E4E8EE']], 2);
  prect(b, 0, fy, 108, 72, '#C9D0DA'); for (let x = 0; x < 108; x += 12) prect(b, x, fy, 1, 72, '#B8C1CB');
  drawShelf(b, 2, 70, 104, 3);
  // 传送带：零食一个接一个送到嘴边
  drawConveyor(b, 0, 100, 72, t);
  const speed = 26;
  for (let i = 0; i < 8; i++) { const fx = ((t * speed + i * 14) % 84) - 10; if (fx < 64) pspr(b, FOOD[UPF[i % UPF.length]](), fx, 91); }
  // 吃东西的"你"
  const chew = Math.floor(t * 8) % 2;
  feetShadow(b, 76, 104); drawYou(b, 76, 88, t, { arms: chew ? 'upL' : 'n', eyes: t > S('m3') ? 'happy' : undefined });
  // 地上打瞌睡的饱腹警报
  const bb = pbuf('bellM', 30, 30); drawBell(bb, 15, 22, t, { sleep: t < S('d4') + .6, ring: t > S('d4') + .6 });
  b.drawImage(BUF.bellM, 14, 98);
  blit(g, 'mod', 10);
  const ha = win(t, SS('modern') + .2, S('m4') - .1, .3, .1), over = t > CH('m3', 2);
  hud(g, [{ text: '如今' }], { alpha: ha });
  const kcal = clamp((t - S('m1')) / (CH('m3', 2) - S('m1'))) * 1.15;
  withAlpha(g, ha, () => { meterBar(g, 220, 88, 400, Math.min(kcal, 1), over ? C.red : C.amber, '热量'); if (over) ptext(g, '超了！', 760, 118, 36, C.red); });
  popTag(g, t, CH('m1', 1) + .2, 540, 260, '工厂设计出来的', 48, { fill: '#C9D3DE' });
  popTag(g, t, CH('m1', 2), 300, 380, '又软又香', 36, { fill: C.amber });
  popTag(g, t, CH('m1', 2) + .6, 780, 380, '又甜又油', 36, { fill: C.amber });
  popTag(g, t, CH('m1', 3), 540, 470, '几口就下肚', 36, { fill: C.amber });
  // 大脑最爱又甜又油
  const ba = win(t, S('m2') - .1, S('m3') - .05, .25, .2);
  if (ba > 0) withAlpha(g, ba, () => {
    pbox(g, 60, 300, 960, 560, { k: 6 });
    ptext(g, '大脑给的"奖励"', 540, 370, 48, C.white, { align: 'center' });
    const rows = [['apple', '甜的', 2, '#9FD3FF'], ['meat', '油的', 2, '#9FD3FF'], ['cake', '又甜又油', 5, C.red]];
    rows.forEach(([food, s, n, col], i) => {
      const y = 470 + i * 120, u = clamp((t - S('m2') - .2 - i * .35) / .25); if (u <= 0) return;
      const fb = pbuf('br' + food, 12, 10); pspr(fb, FOOD[food](), 1, 1); put(g, 'br' + food, 0, 0, 12, 10, 100, y - 50, 8);
      ptext(g, s, 220, y + 10, 40, C.white);
      for (let k = 0; k < n * u; k++) { g.fillStyle = col; g.fillRect(470 + k * 90, y - 30, 70, 56); }
    });
    popTag(g, t, CH('m2', 2), 540, 830, '野外：很少见', 36, { fill: C.green });
  });
  if (t > CH('m3', 1) && t < S('d4')) { popText(g, t, CH('m3', 1), S('d4'), 'Zzz…', 300, 960, 48, C.white); popTag(g, t, CH('m3', 1) + .2, 290, 1060, '饱腹警报', 30, { fill: C.gold }); }
  dialogBox(g, t, 'd4', PORTRAIT.bell, { pfill: '#E9E3F2' });
}
/* 配料表一长串：超加工食品 */
function upfLabel(g, t) {
  menuBG(g, t, '#3A2A33');
  const p = pop(t, S('m4') - .05, .35);
  g.save(); g.translate(540, 560); g.scale(p, p);
  pbox(g, -470, -300, 940, 600, { k: 6, fill: '#FFFDF6', rim: '#C9B48E' });
  ptext(g, '配料表', -420, -210, 60, '#B8231F');
  const ing = ['小麦粉、白砂糖、植物油、', '起酥油、果葡糖浆、麦芽糊精、', '食品添加剂（乳化剂、膨松剂、', '增稠剂、色素、甜味剂……）、', '食用香精、食用盐……'];
  ing.forEach((s, i) => ptext(g, s, -420, -110 + i * 66, 44, C.ink));
  g.restore();
  // 一串零食
  for (let i = 0; i < 6; i++) { const fb = pbuf('ul' + i, 12, 10); pspr(fb, FOOD[UPF[i]](), 1, 1); put(g, 'ul' + i, 0, 0, 12, 10, 70 + i * 160, 960 + (i % 2) * 30, 9); }
  stamp(g, 540, 1180, '超加工食品', clamp((t - CH('m4', 2)) / .25), { px: 84, rot: -.08 });
}

/* ================= 实验：美国国立卫生研究院（2019） ================= */
function lab(g, t) {
  menuBG(g, t, '#203040');
  popTag(g, t, S('l1') + .05, 540, 210, '美国国立卫生研究院 · 2019 年', 36, { fill: '#C9D3DE' });
  // 20 个志愿者住进实验室
  const vin = clamp((t - S('l1') - .2) / 1.4);
  if (t < S('l2') - .1) {
    for (let i = 0; i < 20; i++) {
      const u = clamp(vin * 20 - i); if (u <= 0) continue;
      const c = pbuf('vol' + (i % 3), 32, 30); drawClawd(c, 4, 12, { eyes: blinkEyes(t, i), col: [TONES.base, TONES.blue, TONES.green][i % 3] });
      put(g, 'vol' + (i % 3), 0, 0, 32, 30, 70 + (i % 10) * 96, 300 + Math.floor(i / 10) * 100 + (1 - E.out(u)) * 60, 3);
    }
    if (t > CH('l1', 1)) ptext(g, '20 个人，在实验室住 4 周', 540, 560, 40, C.white, { align: 'center' });
    // 两种饭菜
    [[CH('l1', 2), 270, 'upf', '第 1~2 周：超加工'], [CH('l1', 3), 810, 'whole', '第 3~4 周：看得出原样']].forEach(([t0, x, kind, s]) => {
      const u = pop(t, t0, .35); if (u <= 0) return;
      g.save(); g.translate(x, 860); g.scale(u, u);
      const tb = pbuf('tray' + kind, 36, 20); drawTray(tb, 1, 1, kind); put(g, 'tray' + kind, 0, 0, 36, 20, -216, -150, 12);
      ptag(g, 0, 140, s, 36, { fill: kind === 'upf' ? C.amber : C.green });
      g.restore();
    });
    if (t > CH('l1', 3) + .4) ptext(g, '（两组顺序随机，一半人反过来）', 540, 1090, 30, '#CFC6E8', { align: 'center' });
    if (t > CH('l1', 4)) { popTag(g, t, CH('l1', 4), 540, 1180, '端上来的热量、糖、油、纤维都一样 · 想吃多少吃多少', 30, { fill: '#9FD3FF' }); }
    return;
  }
  // 结果
  ptext(g, '结果', 540, 330, 72, C.white, { align: 'center', sh: 1 });
  const cols = [[270, '吃超加工的两周', C.red, '+0.9 公斤', CH('l2', 2)], [810, '吃原样饭菜的两周', C.green, '−0.9 公斤', CH('l3', 1)]];
  cols.forEach(([x, s, col, kg, tk], i) => {
    const u = clamp((t - (i ? S('l3') : S('l2')) + .1) / .3); if (u <= 0) return;
    withAlpha(g, u, () => {
      ptag(g, x, 450, s, 36, { fill: i ? C.green : C.amber });
      const sb = pbuf('sc' + i, 30, 24); drawScale(sb, 2, 14); drawClawd(sb, 3, 2, { eyes: i ? 'happy' : 'wide' });
      put(g, 'sc' + i, 0, 0, 30, 24, x - 150, 560, 10);
      const kp = pop(t, tk, .35);
      if (kp > 0) { g.save(); g.translate(x, 880); g.scale(kp, kp); ptext(g, kg, 0, 30, 84, col, { align: 'center', ol: C.ink, olw: 8, sh: 1 }); g.restore(); }
    });
  });
  const kp = pop(t, CH('l2', 1) + .3, .35);
  if (kp > 0) { g.save(); g.translate(540, 1090); g.scale(kp, kp); pbox(g, -420, -70, 840, 140, { k: 6 }); prich(g, '超加工那两周：每天多吃 {500 大卡}', 0, 16, 40, C.white, C.red, { align: 'center' }); g.restore(); }
}
