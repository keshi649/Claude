'use strict';
/* scenes3.js：广州实验 → 攻略 → 结尾（出门晒晒，工头吹哨）→ 片尾。 */

/* 在全分辨率上画一个小怪（UI 用）：(x,y) 为身体左上角，P 为放大倍数 */
function uiClawd(g, x, y, P, o = {}, flip = false) {
  const c = clawd(o); g.save(); g.imageSmoothingEnabled = false;
  if (flip) { g.translate(Math.round(x) + 24 * P, Math.round(y - CL_OY * P)); g.scale(-1, 1); g.drawImage(c, -CL_OX * P, 0, CL_W * P, CL_H * P); }
  else g.drawImage(c, Math.round(x - CL_OX * P), Math.round(y - CL_OY * P), CL_W * P, CL_H * P);
  g.restore();
}
/* 深色"菜单"背景：网格 + 渐变 */
function menuBG(g, t, tint = '#1E1A3A') {
  g.fillStyle = tint; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.04)';
  for (let x = 0; x < W; x += 60) g.fillRect(x, 0, 2, H);
  for (let y = (t * 20) % 60; y < H; y += 60) g.fillRect(0, y, W, 2);
}

/* ================= 广州实验 ================= */
function gzScene(g, t) {
  // (a) 窗边：真的管用吗？
  if (t < S('g2') - .1) {
    const b = pbuf('win', 108, 192);
    pbands(b, 0, 108, [[0, '#DDE8D5'], [192, '#D0DEC6']], 2);
    prect(b, 14, 22, 80, 84, '#8A6B4A');
    pbands(b, 17, 74, [[25, '#6CBDF2'], [70, '#A6DDF8'], [103, '#CFEFFA']], 2);
    drawSun(b, 70, 46, 9, t, { spin: true });
    drawRoundTree(b, 34, 103, .9);
    prect(b, 54, 25, 3, 78, '#8A6B4A'); prect(b, 17, 62, 74, 3, '#8A6B4A');
    prect(b, 10, 104, 88, 6, '#C9B79C'); prect(b, 10, 110, 88, 2, '#A8967B');
    drawClawd(b, 42, 113, { scarf: true, glasses: true, eyes: 'up' });
    pbands(b, 0, 108, [[128, '#C89A68'], [192, '#AE8050']], 2);
    blit(g, 'win', 10);
    const gr = g.createRadialGradient(700, 460, 10, 700, 460, 520); gr.addColorStop(0, 'rgba(255,244,190,.45)'); gr.addColorStop(1, 'rgba(255,244,190,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, 1200);
    const qp = pop(t, CK('g1', 1), .35);
    if (qp > 0) { g.save(); g.translate(760, 1000); g.scale(qp, qp); ptext(g, '？', 0, 0, 144, C.white, { align: 'center', ol: C.ink, olw: 10 }); g.restore(); }
    return;
  }
  menuBG(g, t);
  // 标题 + 地图钉
  const tp = pop(t, S('g2') - .05, .35);
  g.save(); g.translate(540, 250); g.scale(tp, tp);
  iconPin(g, -300, -14); ptext(g, '广州 · 2010—2013', -260, 0, 60, C.white, { sh: 1 });
  g.restore();
  withAlpha(g, win(t, S('g2') + .4, 99, .3, 0), () => ptext(g, '随机对照实验 · 一年级小学生', 540, 330, 36, '#9C93C0', { align: 'center' }));
  // 12 所学校 → 分两组
  const split = E.io(seg(t, CK('g2', 2) - .1, CK('g2', 2) + .6));
  const late = t > T.years3 - .2;
  if (!late) {
    for (let i = 0; i < 12; i++) {
      const p = pop(t, CK('g2', 1) + i * .05, .3); if (p <= 0) continue;
      const grp = i % 2, row = Math.floor(i / 6), col = i % 6;
      const x0 = 120 + col * 150, y0 = 520 + row * 220;
      const x1 = (grp ? 600 : 90) + (Math.floor(i / 2) % 3) * 140, y1 = 520 + Math.floor(i / 6) * 220;
      const x = lerp(x0, x1, split), y = lerp(y0, y1, split);
      const sunny = grp === 1 && split > .5;
      const c = mk(20, 22), cg = c.getContext('2d'); drawSchool(cg, 2, 21, sunny);
      g.save(); g.translate(x + 60, y + 60); g.scale(p, p); g.imageSmoothingEnabled = false; g.drawImage(c, -60, -66, 120, 132); g.restore();
      if (sunny) { const sc = mk(22, 22), sg = sc.getContext('2d'); drawSun(sg, 11, 11, 5, t, { face: false }); g.save(); g.imageSmoothingEnabled = false; g.drawImage(sc, x + 76, y - 24, 66, 66); g.restore(); }
    }
    withAlpha(g, clamp(split * 2 - 1), () => {
      ptag(g, 290, 1010, '照常上课', 48, { fill: '#C9D3DE' });
      ptag(g, 800, 1010, '每天多一节户外课', 48, { fill: C.gold });
    });
    const fp = pop(t, T.forty, .4);
    if (fp > 0) { g.save(); g.translate(800, 1120); g.scale(fp, fp); ptag(g, 0, 0, '+40 分钟', 60, { fill: C.green }); g.restore(); }
    return;
  }
  // 三年后：VS 两组孩子，戴眼镜的越来越多
  const gp = pop(t, T.years3 - .2, .3);
  const yr = Math.min(3, 1 + Math.floor(seg(t, T.years3, T.r395 - .2) * 3));
  withAlpha(g, gp, () => {
    ptag(g, 270, 470, '照常上课', 48, { fill: '#C9D3DE' });
    ptag(g, 810, 470, '+40 分钟户外', 48, { fill: C.gold });
    ptext(g, `第 ${yr} 年`, 540, 400, 48, C.white, { align: 'center', ol: C.ink, olw: 4 });
  });
  vsBadge(g, 540, 780, .6 * gp);
  const gridA = [1, 4, 6, 9, 12, 14, 17, 19], gridB = [2, 7, 10, 13, 16, 18];   // 8/20 与 6/20
  const drawGrid = (x0, on, endT) => {
    for (let i = 0; i < 20; i++) {
      const col = i % 4, row = Math.floor(i / 4), k = on.indexOf(i);
      const has = k >= 0 && t > lerp(T.years3 + .2, endT - .3, (k + 1) / on.length);
      uiClawd(g, x0 + col * 108, 560 + row * 96, 4, { col: Object.values(TONES)[i % 8], glasses: has, eyes: blinkEyes(t, i) });
    }
  };
  withAlpha(g, gp, () => { drawGrid(60, gridA, T.r395); drawGrid(600, gridB, T.r304); });
  const pa = pop(t, T.r395, .4), pb = pop(t, T.r304, .4);
  if (pa > 0) { g.save(); g.translate(270, 1110); g.scale(pa, pa); ptext(g, '39.5%', 0, 0, 108, C.red, { align: 'center', ol: C.ink, olw: 8 }); g.restore(); }
  if (pb > 0) { g.save(); g.translate(810, 1110); g.scale(pb, pb); ptext(g, '30.4%', 0, 0, 108, C.green, { align: 'center', ol: C.ink, olw: 8 }); g.restore(); }
  withAlpha(g, win(t, T.r395 - .2, 99, .2, 0), () => ptext(g, '三年新增近视', 540, 1180, 36, '#CFC6E8', { align: 'center' }));
  const op = pop(t, T.only40, .4);
  if (op > 0) {
    g.fillStyle = `rgba(10,8,24,${.5 * op})`; g.fillRect(0, 0, W, H);
    g.save(); g.translate(540, 760); g.scale(op, op);
    pbox(g, -420, -190, 840, 380, { k: 6 });
    ptext(g, '每天 +40 分钟', 0, -40, 96, C.gold, { align: 'center', sh: 1 });
    ptext(g, '新增近视，相对少了约 23%', 0, 70, 48, C.white, { align: 'center' });
    g.restore();
  }
}

/* ================= 攻略 ================= */
const PG_HY = 64, PG_FEET = 74;   // 地平线、小怪脚底（世界像素）
function playgroundBG() {
  return cached('pgBG', 135, 240, g => {
    pbands(g, 0, 135, [[0, '#5FB2EC'], [30, '#86C9F4'], [56, '#B5E0FA'], [PG_HY, '#B5E0FA']], 3);
    for (let x = 0; x < 135; x += 12) { const hh = 8 + Math.floor(hash(x, 7) * 16); prect(g, x, PG_HY - hh, 11, hh, '#B4CFE2'); }
    pbands(g, 0, 135, [[PG_HY, '#7FC46A'], [PG_HY + 6, '#6DB55A'], [PG_HY + 14, '#5EA64E'], [240, '#5EA64E']], 2);
    prect(g, 0, PG_FEET + 4, 135, 162, '#C96A4A'); prect(g, 0, PG_FEET + 4, 135, 1, '#E8E2D4');
    for (let x = 4; x < 135; x += 30) prect(g, x, PG_FEET + 14, 16, 1, '#E8E2D4');
    for (let y = PG_FEET + 30; y < 240; y += 18) prect(g, 0, y, 135, 1, '#B85C3E');
  });
}
function guideScene(g, t) {
  const b = pbuf('pg', 135, 240);
  b.drawImage(playgroundBG(), 0, 0);
  const cloudy = t > S('a2') + .9 && t < T.kid;
  drawSun(b, 106, 20, 9, t, { spin: true });
  if (cloudy) { const u = E.out(seg(t, S('a2') + .9, S('a2') + 1.6)); drawCloud(b, lerp(150, 104, u), 22, 1.2, '#F4F6F8', '#C9D3DE'); drawCloud(b, lerp(-30, 60, u), 30, 1, '#F4F6F8', '#C9D3DE'); }
  drawRoundTree(b, 26, PG_FEET + 2, 1.25);
  const inShade = t > T.shade - .3 && t < T.kid;
  b.save(); b.globalAlpha = .28; pell(b, 26, PG_FEET + 3, 26, 4, '#1B3A20'); b.restore();
  const kx = inShade ? lerp(78, 30, E.io(seg(t, T.shade - .3, T.shade + .5))) : lerp(-26, 78, E.out(seg(t, T.guide, T.guide + 1.2)));
  const walking = (t < T.guide + 1.2) || (t > T.shade - .3 && t < T.shade + .5);
  feetShadow(b, kx, PG_FEET);
  drawClawd(b, kx, PG_FEET - 16, { scarf: true, glasses: true, eyes: t > T.twoH ? 'happy' : blinkEyes(t, 3), legs: walking ? walkLegs(t, 8) : 0, arms: t > T.twoH && t < T.twoH + 1.2 ? 'up' : 'n' }, kx > 60 && inShade);
  blit(g, 'pg', 8);
  // 读数：此刻的光照
  const lux = cloudy ? (inShade ? 6000 : 12000) : (inShade ? 6000 : 60000);
  pbox(g, 600, 600, 420, 120, { k: 6 });
  iconSun(g, 650, 660, cloudy ? '#C9D3DE' : C.gold);
  ptext(g, `LUX ${fmt(lux)}`, 690, 668, 48, C.gold);
  ptext(g, '教室：300', 690, 704, 24, '#9FD3FF');
  // 攻略面板
  const pp = E.out(clamp((t - T.guide - .2) / .4));
  g.save(); g.translate(0, (1 - pp) * 500); g.globalAlpha *= pp;
  pbox(g, 60, 760, 960, 470, { k: 6 });
  g.fillStyle = '#D9443B'; g.fillRect(72, 772, 936, 72);
  ptext(g, '★ 护眼攻略 ★', 540, 826, 48, C.white, { align: 'center', sh: 1 });
  const rows = [
    [CK('a1', 1), '白天在户外 {≥ 2 小时}', '每周累计 ≥ 14 小时'],
    [CK('a2', 1), '{阴天}、{树荫下}都算', '不用非得运动，待在户外就行'],
    [CK('a3', 0), '{越小越要紧}', '眼轴长过头，缩不回去'],
  ];
  rows.forEach(([t0, a, s], i) => {
    const u = pop(t, t0, .35); if (u <= 0) return;
    const y = 920 + i * 112;
    g.save(); g.translate(120, y); g.scale(u, u);
    g.fillStyle = C.green; g.fillRect(-24, -30, 40, 40); g.fillStyle = C.ink; g.fillRect(-18, -24, 28, 28);
    g.fillStyle = C.green; for (let j = 0; j < 4; j++) g.fillRect(-14 + j * 4, -12 + j * 4, 4, 4); for (let j = 0; j < 5; j++) g.fillRect(-2 + j * 4, -4 - j * 4 + 8, 4, 4);
    g.restore();
    withAlpha(g, u, () => { prich(g, a, 170, y, 48, C.white, C.gold); ptext(g, s, 170, y + 44, 30, '#CFC6E8'); });
  });
  g.restore();
  // Ctrl+Z 无效
  const zp = pop(t, T.noUndo, .35);
  if (zp > 0) {
    g.save(); g.translate(800, 330); g.scale(zp, zp); g.rotate(.06);
    pbox(g, -150, -70, 300, 140, { k: 6, fill: '#ECE7F5', rim: C.ink });
    ptext(g, 'Ctrl+Z', 0, 18, 60, C.ink, { align: 'center' });
    g.strokeStyle = C.red; g.lineWidth = 14; g.beginPath(); g.moveTo(-120, -50); g.lineTo(120, 50); g.stroke();
    g.restore();
    withAlpha(g, zp, () => ptag(g, 800, 440, '撤销不了', 36, { fill: C.red, col: C.white }));
  }
}

/* ================= 结尾 ================= */
function finale(g, t) {
  // (a) 教室里弹窗
  if (t < T.door) {
    const b = pbuf('cls', CLS_W, CLS_H);
    drawClassFront(b, t, { hero: { glasses: true, eyes: 'n' } });
    blit(g, 'cls', 8, 0, 60);
    g.fillStyle = 'rgba(30,14,10,.55)'; g.fillRect(0, 0, W, H);
    const p = pop(t, S('d5'), .3);
    if (p > 0) {
      g.save(); g.translate(540, 640); g.scale(p, p);
      sysWindow(g, -450, -260, 900, 520, '⚠ 警告', { bar: '#D9443B' });
      const l = LN.d5, n = Math.floor(clamp((t - l.v0 - .05) / (l.typed - l.v0 - .05)) * [...l.text].length);
      ptext(g, [...l.text].slice(0, n).join(''), -400, -110, 48, C.ink);
      withAlpha(g, clamp((t - l.typed) / .2), () => {
        ptext(g, '工头：睡着了　施工队：加班中…', -400, -30, 36, '#6B6488');
        const pressed = t > T.click && t < T.click + .25 ? 1 : 0;
        pbutton(g, -400, 80, 360, 110, '继续待着', { fill: '#D7D2E2' });
        pbutton(g, 40, 80, 360, 110, '出门晒晒', { fill: C.gold, pressed, hot: t > T.click - .5 ? C.red : null });
      });
      g.restore();
      // 光标
      const u = E.io(seg(t, l.typed + .05, T.click - .05));
      cursorHand(g, lerp(980, 760, u), lerp(1500, 740, u), t > T.click && t < T.click + .25 ? 1 : 0);
    }
    if (t > T.click + .2) { g.fillStyle = `rgba(255,255,255,${seg(t, T.click + .2, T.door)})`; g.fillRect(0, 0, W, H); }
    return;
  }
  // (c) 工地：太阳照进来，工头醒了，吹哨
  if (t > S('z3') - .2) {
    const b = pbuf('site', SITE_W, SITE_H);
    const fm = t > T.blow - .05 ? 'blow' : (t > S('z3') + .5 ? 'stand' : 'sleep');
    drawSite(b, t, { L: 24.5, light: 1, lamp: 'sun', crew: t > T.blow + .2 ? 'cheer' : 'work', foreman: fm, retinaGlow: true, dopa: clamp((t - S('z3') - .3) / 1) });
    blit(g, 'site', 6);
    siteLabels(g, t, { L: 24.5 }, 6);
    const sp = pop(t, T.sunWord, .4);
    if (sp > 0) { g.save(); g.translate(22 * 6, 42 * 6); g.scale(1 + .15 * Math.sin(clamp((t - T.sunWord) / .5) * Math.PI), 1 + .15 * Math.sin(clamp((t - T.sunWord) / .5) * Math.PI)); g.restore();
      g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(132, 252, 10, 132, 252, 360); gr.addColorStop(0, `rgba(255,236,150,${.6 * sp})`); gr.addColorStop(1, 'rgba(255,236,150,0)'); g.fillStyle = gr; g.fillRect(0, 0, 700, 700); g.restore(); }
    const wp = pop(t, T.blow, .3);
    if (wp > 0) {
      g.save(); g.translate(330, 1020); g.scale(wp, wp); g.rotate(-.08); ptext(g, '哔——！', 0, 0, 96, C.white, { align: 'center', ol: C.ink, olw: 8 }); g.restore();
      const cp = pop(t, T.blow + .35, .35);
      if (cp > 0) { g.save(); g.translate(Math.min(940, eyeBack(24.5) * 6 + 120), 780); g.scale(cp, cp); ptag(g, 0, 0, '收工！', 60, { fill: '#F2C230' }); g.restore(); }
      for (let i = 0; i < 24; i++) { const u = clamp((t - T.blow - .2) / 1.4); if (u <= 0) break; g.fillStyle = ['#FFD34E', '#FF5A4F', '#5BE37D', '#5EC8FF'][i % 4]; g.fillRect(780 + Math.cos(i * 2.4) * u * (200 + i * 8) - 6, 700 + Math.sin(i * 2.4) * u * 160 + u * u * 300 - 6, 12, 12); }
    }
    return;
  }
  // (b) 操场：走进太阳里
  const b = pbuf('pg', 135, 240);
  b.drawImage(playgroundBG(), 0, 0);
  drawSun(b, 106, 20, 9, t, { spin: true });
  drawRoundTree(b, 40, PG_FEET + 2, 1.25);
  prect(b, 0, 22, 14, PG_FEET - 18, '#E9E0CF'); prect(b, 2, 40, 10, PG_FEET - 36, '#8A5A35'); prect(b, 0, 20, 16, 3, '#C9B79C');
  const kx = lerp(-4, 66, E.out(seg(t, T.door, T.door + 1.6)));
  feetShadow(b, kx, PG_FEET);
  drawClawd(b, kx, PG_FEET - 16, { scarf: true, glasses: true, eyes: t > T.door + 1.6 ? 'happy' : 'squint', legs: t < T.door + 1.6 ? walkLegs(t, 8) : 0, arms: t > S('z1') + .4 && t < S('z2') ? 'up' : 'n' });
  blit(g, 'pg', 8);
  g.fillStyle = `rgba(255,255,255,${1 - seg(t, T.door, T.door + .5)})`; g.fillRect(0, 0, W, H);
  const gr = g.createRadialGradient(848, 160, 10, 848, 160, 700); gr.addColorStop(0, 'rgba(255,244,190,.5)'); gr.addColorStop(1, 'rgba(255,244,190,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, 1300);
  // 小窗：眼里的工地，工头被光叫醒
  const ia = win(t, S('z2') - .1, S('z3') + .1, .25, .15);
  if (ia > 0) withAlpha(g, ia, () => {
    const sb = pbuf('site2', SITE_W, SITE_H);
    drawSite(sb, t, { L: 24.5, light: 1, lamp: 'sun', crew: 'work', foreman: t > S('z2') + 1.2 ? 'stand' : 'sleep', retinaGlow: true });
    pbox(g, 520, 700, 500, 470, { k: 6, fill: '#000' });
    g.save(); g.imageSmoothingEnabled = false; g.beginPath(); g.rect(538, 718, 464, 434); g.clip();
    g.drawImage(BUF.site2, 0, 50, 180, 168, 538, 718, 464, 434); g.restore();
    ptag(g, 770, 700, '你眼里的工地', 30, { fill: C.amber });
  });
}

/* ================= 片尾 ================= */
function endCard(g, t) {
  const b = pbuf('end', 108, 192);
  drawSavanna(b, t, 108, 192, 120, { sunX: 54, sunY: 40 });
  const chars = [[8, { hat: 'bone', eyes: 'happy', arms: 'upL' }], [32, { scarf: true, glasses: true, eyes: 'happy', arms: 'up' }], [56, { hat: 'hard', eyes: 'happy', arms: 'upR' }], [80, { hat: 'boss', vest: true, eyes: 'happy' }]];
  chars.forEach(([x, o], i) => { const bob = Math.floor(t * 4 + i) % 2; feetShadow(b, x, 146); drawClawd(b, x, 130 - bob, o); });
  blit(g, 'end', 10);
  const gr = g.createRadialGradient(540, 400, 10, 540, 400, 700); gr.addColorStop(0, 'rgba(255,244,190,.6)'); gr.addColorStop(1, 'rgba(255,244,190,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, 1300);
  const p = E.out(clamp((t - T.card - .1) / .5));
  g.save(); g.globalAlpha *= p;
  pbox(g, 70, 600, 940, 560, { k: 6, fill: 'rgba(27,23,48,.9)' });
  ptext(g, '原始人为什么不近视？', 540, 720, 60, C.white, { align: 'center', sh: 1 });
  ptext(g, '因为他们一直待在太阳底下。', 540, 820, 48, C.gold, { align: 'center', sh: 1 });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(140, 870, 800, 4);
  ptext(g, '今天，出门晒晒眼睛吧', 540, 960, 48, C.white, { align: 'center' });
  ptext(g, '甜菜  出品', 540, 1060, 36, C.amber, { align: 'center' });
  ptext(g, '画面、配乐、配音：Claude 用代码生成', 540, 1110, 24, '#9C93C0', { align: 'center' });
  g.restore();
}

/* ================= 第三部分的 HUD 与叠加层 ================= */
function hudLater3(g, t) {
  if (t > S('g2') - .1 && t < T.guide) hud(g, [{ icon: (g, x, y) => iconPin(g, x, y), text: '广州实验' }, { right: true, text: '12 所小学 · 3 年', col: C.gold }], { alpha: win(t, S('g2') - .1, T.guide, .3, .2) });
  if (t > T.door && t < S('z3') - .2) {
    const lux = Math.round(lerp(300, 32000, E.in(seg(t, T.door + .2, S('z2')))) / 100) * 100;
    hud(g, [{ icon: (g, x, y) => iconSun(g, x, y), text: '操场 · 上午' }, { right: true, text: `LUX ${fmt(lux)}`, col: C.gold, flash: win(t, S('z2') - .3, S('z2') + .3, .1, .2) }], { alpha: win(t, T.door + .1, S('z3') - .2, .3, .1) });
  }
  if (t > S('z3') - .2 && t < T.card) hud(g, [{ icon: (g, x, y) => iconHat(g, x, y), text: '眼球工地' }, { right: true, text: 'LUX 32,000', col: C.gold }], { alpha: win(t, S('z3') - .2, T.card, .2, .2) });
}
function overlays3(g, t) {
  // 水印
  if (t < T.card) withAlpha(g, .55, () => ptext(g, '甜菜', W - 36, 50, 24, C.white, { align: 'right', ol: 'rgba(0,0,0,.45)' }));
}
