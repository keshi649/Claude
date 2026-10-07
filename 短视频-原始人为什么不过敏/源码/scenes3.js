'use strict';
/* scenes3.js：花生（LEAP 试验）→ 进化错配 → 过敏攻略 → 结尾（见过世面的保安）→ 片尾。 */

/* ================= 花生 ================= */
function peanut(g, t) {
  if (t < S('p3') - .15) { nursery(g, t); return; }
  leapTrial(g, t);
}
/* 婴儿房：旧建议 + 花生过敏越来越多 */
function nursery(g, t) {
  const b = pbuf('nurs', 90, 160), fy = 104;
  pbands(b, 0, 90, [[0, '#F6E7B8'], [fy, '#F2DFA8']], 2);
  for (let y = 8; y < fy - 6; y += 12) for (let x = (y / 12) % 2 ? 2 : 8; x < 90; x += 12) { pdot(b, x, y, '#EBD38A'); pdot(b, x + 1, y + 1, '#EBD38A'); }
  prect(b, 0, fy - 4, 90, 4, '#D9B86A'); pbands(b, 0, 90, [[fy, '#C98B4A'], [160, '#A86C35']], 2);
  for (let x = 0; x < 90; x += 10) prect(b, x, fy, 1, 56, '#B97A3E');
  drawHighChair(b, 36, fy - 18);
  drawBaby(b, 37, fy - 26 + Math.floor(t * 3) % 2, { bib: '#9FD3FF', eyes: blinkEyes(t, 7) === 'blink' ? 'shut' : 'n' });
  drawJar(b, 62, fy - 20);
  blit(g, 'nurs', 12);
  // 旧建议的海报
  const pp = pop(t, CH('p1', 1) - .1, .35);
  if (pp > 0 && t < S('p2') + .2) {
    g.save(); g.translate(540, 520); g.scale(pp, pp); g.rotate(-.02);
    pbox(g, -400, -230, 800, 460, { k: 6, fill: '#FFFDF6', rim: '#C9B48E' });
    g.fillStyle = '#D9443B'; g.fillRect(-388, -218, 776, 72);
    ptext(g, '旧建议（1998~2000 年前后）', 0, -166, 36, C.white, { align: 'center' });
    ptext(g, '过敏风险高的宝宝：', -340, -62, 48, C.ink);
    prich(g, '花生之类，{晚点再吃}', -340, 14, 48, C.ink, '#D9443B');
    const pb = pbuf('pnut', 9, 12); drawPeanut(pb, 4, 6, { face: 'n' });
    g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF.pnut, 190, 54, 108, 144); g.restore();
    noSign(g, 244, 126, 92);
    ptext(g, '英国 1998 · 美国 2000', -340, 150, 30, '#6B6488');
    g.restore();
  }
  // 越来越多：美国儿童花生过敏
  const ca = win(t, S('p2') - .05, S('p3') - .15, .3, .15);
  if (ca > 0) withAlpha(g, ca, () => {
    pbox(g, 90, 300, 900, 600, { k: 6 });
    ptext(g, '美国儿童花生过敏', 540, 380, 48, C.white, { align: 'center' });
    const grow = clamp((t - S('p2')) / .8);
    [[300, 0.4, '1997 年', '0.4%'], [780, 1.4, '2008 年', '1.4%']].forEach(([x, v, yr, s], i) => {
      const h = Math.round(360 * v / 1.6 * (i ? grow : 1) / 6) * 6;
      g.fillStyle = '#3B3363'; g.fillRect(x - 90, 440, 180, 360); g.fillStyle = i ? C.red : C.amber; g.fillRect(x - 90, 800 - h, 180, h);
      ptext(g, s, x, 790 - h, 48, i ? C.red : C.amber, { align: 'center' }); ptext(g, yr, x, 850, 36, '#CFC6E8', { align: 'center' });
    });
    const p = pop(t, CH('p2', 1), .35);
    if (p > 0) { g.save(); g.translate(540, 560); g.scale(p, p); ptag(g, 0, 0, '× 3', 72, { fill: C.red, col: C.white }); g.restore(); }
  });
}
/* LEAP 试验：一半从小吃花生，一半一口不碰 */
function leapTrial(g, t) {
  menuBG(g, t, '#22304A');
  g.fillStyle = C.ink; for (let y = 380; y < 1270; y += 24) g.fillRect(534 + ((y / 24) % 2) * 6, y, 12, 24);
  // 标题
  const hp = pop(t, S('p3') - .1, .35);
  if (hp > 0) { g.save(); g.translate(540, 250); g.scale(hp, hp); pbox(g, -440, -100, 880, 200, { k: 6 }); ptext(g, 'LEAP 试验（2015）', 0, -18, 60, C.gold, { align: 'center' }); if (t > CH('p3', 1) - .1) ptext(g, '640 个高风险宝宝 · 4~11 个月大', 0, 52, 36, C.white, { align: 'center' }); g.restore(); }
  const res = t > S('p4') - .1;
  if (!res) {
    // 两组宝宝
    const b = pbuf('leap', 90, 80);
    prect(b, 0, 0, 90, 80, '#22304A');
    for (let i = 0; i < 6; i++) {
      const lx = 4 + (i % 3) * 13, ly = 14 + Math.floor(i / 3) * 30, bob = Math.floor(t * 4 + i) % 2;
      // 600 多个宝宝先一起出场，再分成两组：左边拿勺子吃花生酱，右边一口不碰
      const eat = t > CH('p3', 2) - .2, avoid = t > CH('p3', 3) - .2;
      drawBaby(b, lx, ly - bob, { bib: eat ? '#FFE27A' : '#F4F4F4', eyes: i === 4 && t > S('c5') - .2 ? 'happy' : (blinkEyes(t, i + 6) === 'blink' ? 'shut' : 'n') });
      if (eat) { prect(b, lx + 9, ly + 2 - bob, 4, 1, '#C9D3DE'); pdot(b, lx + 12, ly + 1 - bob, '#C98B4A'); }
      drawBaby(b, 49 + (i % 3) * 13, ly - bob, { bib: avoid ? '#C9D3DE' : '#F4F4F4', eyes: blinkEyes(t, i) === 'blink' ? 'shut' : 'n' });
    }
    if (t > CH('p3', 2) - .2) drawJar(b, 18, 72);
    if (t > CH('p3', 3) - .2) { const pb = pbuf('pnut', 9, 12); drawPeanut(pb, 4, 6); b.drawImage(BUF.pnut, 64, 62); }
    g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF.leap, 0, 0, 90, 80, 0, 420, 1080, 960); g.restore();
    if (t > CH('p3', 3) - .2) noSign(g, 64 * 12 + 54, 420 + 68 * 12, 84);
    popTag(g, t, CH('p3', 2) - .1, 270, 470, '从小吃花生', 48, { fill: C.gold });
    popTag(g, t, CH('p3', 3) - .1, 810, 470, '一口不碰', 48, { fill: '#C9D3DE' });
    if (t > CH('p3', 2)) ptext(g, '（花生酱，不是整粒）', 270, 1124, 30, '#CFC6E8', { align: 'center' });
    say(g, t, 'c5', (17 + 6) * 12, 420 + 44 * 12, { side: 40, px: 48 });
    return;
  }
  // 结果：5 岁时对花生过敏
  ptext(g, '到 5 岁：对花生过敏的比例', 540, 470, 48, C.white, { align: 'center' });
  [[270, 1, CH('p4', 2), '3%', C.green, '从小吃花生'], [810, 5, CH('p4', 1), '17%', C.red, '一口不碰']].forEach(([cx, nRed, t0, pct, col, lab]) => {
    for (let i = 0; i < 30; i++) {
      const x = cx - 200 + (i % 6) * 72, y = 560 + Math.floor(i / 6) * 76;
      const red = i >= 30 - nRed && t > t0;
      g.fillStyle = red ? C.red : '#4A5A7A'; g.fillRect(x - 4, y - 4, 56, 56);
      g.fillStyle = red ? '#FFD0C8' : '#8FA3C0'; g.fillRect(x + 8, y + 8, 32, 26); g.fillStyle = red ? C.red : '#4A5A7A'; g.fillRect(x + 14, y + 14, 6, 6); g.fillRect(x + 30, y + 14, 6, 6);
    }
    ptag(g, cx, 1000, lab, 36, { fill: col === C.green ? C.gold : '#C9D3DE' });
    const p = pop(t, t0, .35);
    if (p > 0) { g.save(); g.translate(cx, 1130); g.scale(p, p); ptext(g, pct, 0, 40, 132, col, { align: 'center', ol: C.ink, olw: 10, sh: 1 }); g.restore(); }
  });
  if (t > S('p5') - .1) {
    stamp(g, 810, 760, '没练成', clamp((t - CH('p5', 1)) / .25), { px: 84, rot: -.12 });
  }
}

/* ================= 进化错配 ================= */
function mismatch(g, t) {
  const b = pbuf('nose', NOSE_W, NOSE_H);
  b.drawImage(noseBG(), 0, 0);
  cilia(b, t, 20);
  drawBooth(b, 116, ROAD);
  drawSiren(b, 52, 72, t, true); drawSiren(b, 110, 72, t, true); drawSiren(b, 126, ROAD - 31, t, true);
  drawBarrier(b, 110, ROAD - 12, 26, -Math.PI);
  drawGuard(b, 56 + Math.round(Math.sin(t * 9) * 3), ROAD - 16, t, { eyes: 'wide', arms: 'up', legs: walkLegs(t, 10) });
  blit(g, 'nose', 8);
  g.fillStyle = 'rgba(10,8,24,.62)'; g.fillRect(0, 0, W, H);
  const cp = pop(t, S('m1') - .05, .4);
  if (cp > 0) { g.save(); g.translate(540, 300); g.scale(cp, cp); ptext(g, '进化错配', 0, 40, 144, C.amber, { align: 'center', ol: C.ink, olw: 10, sh: 1 }); g.restore(); }
  const mp = pop(t, S('m2') - .1, .35);
  if (mp > 0) {
    g.save(); g.translate(540, 780); g.scale(mp, mp);
    sysWindow(g, -480, -290, 960, 520, '⚠ 版本不兼容', { bar: '#D9443B' });
    const rows = [[S('m2') + .3, '训练计划', '泥土 + 动物 + 哥哥姐姐', '（老版本）', '#3B3363'], [S('m3'), '现在', '楼房 + 消毒水', '（陪练很少）', '#3B3363'], [CH('m3', 1), '状态', '保安见啥都报警', '', '#D9443B']];
    rows.forEach(([t0, a, v, s2, col], i) => {
      const u = clamp((t - t0 + .1) / .2); if (u <= 0) return;
      withAlpha(g, u, () => { ptext(g, a, -420, -130 + i * 130, 48, '#6B6488'); ptext(g, v, -170, -130 + i * 130, 48, col); if (s2) ptext(g, s2, -170, -82 + i * 130, 30, '#8A84A6'); });
    });
    g.restore();
  }
}

/* ================= 过敏攻略 ================= */
function guide(g, t) {
  const b = pbuf('clinic', 135, 240);
  const fy = 80;
  pbands(b, 0, 135, [[0, '#CFE9E4'], [fy - 8, '#BFDDD6'], [fy, '#BFDDD6']], 2);
  prect(b, 0, fy, 135, 4, '#9FC4BB'); pbands(b, 0, 135, [[fy + 4, '#E8E2D4'], [240, '#D8D0BE']], 2);
  for (let x = 0; x < 135; x += 16) prect(b, x, fy + 4, 1, 240 - fy, '#CFC6B2');
  // 墙上的视力表一样的"过敏原检测"板
  prect(b, 88, 14, 40, 38, '#4E5A6A'); prect(b, 90, 16, 36, 34, '#FFFDF6');
  for (let i = 0; i < 6; i++) { const cx = 96 + (i % 3) * 12, cy = 24 + Math.floor(i / 3) * 14; pdisc(b, cx, cy, 3, ['#FFD84A', '#E9D6B0', '#D8A866', '#F7F4EE', '#9AA1AD', '#F2A0C0'][i]); }
  // 椅子 + 病人 + 医生
  prect(b, 10, fy - 14, 30, 4, '#3E7FC1'); prect(b, 12, fy - 10, 3, 10, '#9AA1AD'); prect(b, 35, fy - 10, 3, 10, '#9AA1AD');
  drawSneezy(b, 14, fy - 30, t, { sneeze: sneezeVal(t, [S('d1') + .4]) });
  const teach = t > S('c6') - .3;
  drawDoctor(b, 58, fy - 16, t, { arms: teach ? 'upR' : (t > S('d2') && t < S('d3') ? 'upL' : 'n') });
  if (teach) { prect(b, 82, fy - 30, 14, 12, '#FFFDF6'); prect(b, 82, fy - 30, 14, 1, '#C9B48E'); drawPollen(b, 89, fy - 24, t, { r: 3, face: 'happy' }); }
  blit(g, 'clinic', 8);
  say(g, t, 'c6', 70 * 8, (fy - 18) * 8, { side: -60, px: 48 });
  if (teach) popTag(g, t, S('c6'), 89 * 8, (fy - 36) * 8, '良民 ✓', 30, { fill: C.green });
  // 攻略面板
  const pp = E.out(clamp((t - S('d1') - .3) / .4));
  if (pp > 0) {
    g.save(); g.translate(0, (1 - pp) * 500); g.globalAlpha *= pp;
    pbox(g, 40, 720, 1000, 548, { k: 6 });
    g.fillStyle = '#D9443B'; g.fillRect(52, 732, 976, 72);
    ptext(g, '★ 过敏攻略 ★', 540, 786, 48, C.white, { align: 'center', sh: 1 });
    const rows = [
      [CH('d1', 2), '不是{不讲卫生}：手照样要洗', '', 856],
      [CH('d2', 1), '辅食：鸡蛋、花生{不用刻意推迟}', '', 936],
      [CH('d2', 2), '', '花生给酱或泥，别给整粒（防噎）', 976],
      [S('d3'), '湿疹严重、已过敏的宝宝 → {先问医生}', '', 1050],
      [CH('d4', 1), '已经过敏 → 查清{过敏原}、规范用药', '', 1130],
      [CH('d4', 2), '有的人能做{脱敏治疗}：给保安补课', '', 1210],
    ];
    rows.forEach(([t0, a, s, y]) => {
      const u = pop(t, t0, .35); if (u <= 0) return;
      withAlpha(g, u, () => {
        if (a) { g.fillStyle = C.green; g.fillRect(76, y - 30, 34, 34); g.fillStyle = C.ink; g.fillRect(81, y - 25, 24, 24); prich(g, a, 130, y, 40, C.white, C.gold); }
        else ptext(g, s, 130, y, 30, '#CFC6E8');
      });
    });
    g.restore();
  }
}

/* ================= 结尾：见过世面的保安 ================= */
function endScene(g, t) {
  const b = pbuf('nose', NOSE_W, NOSE_H);
  b.drawImage(noseBG(), 0, 0);
  cilia(b, t, 20);
  drawBooth(b, 116, ROAD);
  drawSiren(b, 52, 72, t, false); drawSiren(b, 110, 72, t, false); drawSiren(b, 126, ROAD - 31, t, false);
  const lift = E.io(clamp((t - EN('c7') + .3) / .6));
  // 花粉：走来 → 停下 → 过杆
  const u1 = E.out(clamp((t - SS('end') - .2) / 1.4)), u2 = E.io(clamp((t - EN('c8') - .2) / 2.2));
  const px = lerp(-14, 34, u1) + u2 * 120, bob = Math.floor(t * 5) % 2;
  feetShadow(b, 56, ROAD);
  drawGuard(b, 56, ROAD - 16, t, { badge: 'calm', eyes: t > S('c7') ? 'happy' : undefined, arms: t > S('c7') && t < EN('c8') + .5 ? 'upR' : 'n' });
  drawBarrier(b, 110, ROAD - 12, 26, -Math.PI + lift * Math.PI / 2);
  drawPollen(b, px, ROAD - 12 - bob, t, { r: 7, face: 'happy' });
  if (t > S('c8') && t < S('c8') + 1.6) for (let i = 0; i < 3; i++) { const k = (t - S('c8')) * 10 + i * 4; const hx = px + 6 + i * 4, hy = ROAD - 24 - k % 12; prect(b, hx, hy, 1, 1, '#FF6F8F'); prect(b, hx + 2, hy, 1, 1, '#FF6F8F'); prect(b, hx, hy + 1, 3, 1, '#FF6F8F'); pdot(b, hx + 1, hy + 2, '#FF6F8F'); }
  feetShadow(b, 84, ROAD); drawGuard(b, 84, ROAD - 17, t, { seed: 2, badge: 'calm', eyes: 'happy' });
  blit(g, 'nose', 8);
  ptext(g, '鼻腔检查站', NX(80), NY(83), 60, '#FFF4DF', { align: 'center', sh: 1 });
  say(g, t, 'c7', NX(68), NY(ROAD - 18), { side: 80, px: 44 });
  say(g, t, 'c8', NX(Math.min(px, 60)), NY(ROAD - 22), { side: 40, px: 44 });
  popTag(g, t, SS('end') + .4, NX(68), NY(ROAD + 8), '淡定的老保安', 36, { fill: C.green });
  if (t > CH('e1', 2)) {
    popText(g, t, CH('e1', 2), 99, '见过世面', 540, 420, 120, C.gold);
    for (let i = 0; i < 10; i++) { const a = i * TAU / 10 + t, r = 300 + Math.sin(t * 3 + i) * 20; if (Math.floor(t * 6 + i) % 2) { g.fillStyle = C.gold; g.fillRect(540 + Math.cos(a) * r, 420 + Math.sin(a) * r * .4, 10, 10); } }
  }
}

/* ================= 片尾 ================= */
function endCard(g, t) {
  const b = pbuf('card', 108, 192);
  drawSavanna(b, t, 108, 192, 120, { sunX: 54, sunY: 40 });
  pollenAir(b, t, 30, 0, 108, 60, 150);
  const bob = i => Math.floor(t * 4 + i) % 2;
  drawCow(b, 2, 132 - bob(3), t);
  feetShadow(b, 32, 146); drawClawd(b, 32, 130 - bob(0), { hat: 'bone', eyes: 'happy', arms: 'upR' });
  feetShadow(b, 60, 146); drawGuard(b, 60, 130 - bob(1), t, { badge: 'calm', eyes: 'happy', arms: 'upL' });
  drawPollen(b, 94, 128 - bob(2) * 2, t, { r: 6, face: 'happy' });
  blit(g, 'card', 10);
  const gr = g.createRadialGradient(540, 400, 10, 540, 400, 700); gr.addColorStop(0, 'rgba(255,244,190,.6)'); gr.addColorStop(1, 'rgba(255,244,190,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, 1300);
  const p = E.out(clamp((t - SS('card') - .1) / .5));
  g.save(); g.globalAlpha *= p;
  pbox(g, 70, 560, 940, 420, { k: 6, fill: 'rgba(27,23,48,.9)' });
  ptext(g, '原始人为什么不过敏？', 540, 680, 60, C.white, { align: 'center', sh: 1 });
  prich(g, '他们的保安，{见过世面}。', 540, 790, 60, C.white, C.gold, { align: 'center' });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(140, 840, 800, 4);
  ptext(g, '甜菜  出品', 540, 910, 36, C.amber, { align: 'center' });
  ptext(g, '画面、字幕、声音：Claude 用代码生成', 540, 952, 24, '#9C93C0', { align: 'center' });
  g.restore();
}

/* 结尾那段的 HUD */
function hudLater3(g, t) {
  if (t > SS('end') + .2 && t < SE('end')) hud(g, [{ icon: (g, x, y) => iconShield(g, x, y), text: '鼻腔检查站 · 保安队' }, { right: true, text: '状态：淡定', col: C.green }], { alpha: win(t, SS('end') + .2, SE('end'), .3, .2) });
}
