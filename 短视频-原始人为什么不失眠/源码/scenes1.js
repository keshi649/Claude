'use strict';
/* scenes1.js：共用的小工具；开头（篝火边睡着的原始人 → 戴手环的三个部落 → 查无此词 → 温度计）；身体里的睡眠开关。
   开头照第一集的路子：先替观众说出最常见的答案，马上盖章推翻，再拿证据、抛线索，前 20 秒切三次镜头。
   关键的字都放在安全区里（x 60~900、y 200~1540），不让平台的按钮挡住。 */

/* ================= 共用 ================= */
function popTag(g, t, t0, x, y, s, px = 36, o = {}) {
  const p = pop(t, t0, .3) * (o.t1 ? clamp((o.t1 - t) / .2) : 1);
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p); ptag(g, 0, 0, s, px, o); g.restore();
}
function popText(g, t, t0, t1, s, x, y, px, col, o = {}) {
  const p = pop(t, t0, .3) * clamp((t1 - t) / .2);
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p); g.rotate(o.rot || 0);
  ptext(g, s, 0, px * .35, px, col, { align: 'center', ol: o.ol || C.ink, olw: o.olw || px / 12 * 1.5, sh: 1 });
  g.restore();
}
function menuBG(g, t, tint = '#1E1A3A') {
  g.fillStyle = tint; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.04)';
  for (let x = 0; x < W; x += 60) g.fillRect(x, 0, 2, H);
  for (let y = (t * 20) % 60; y < H; y += 60) g.fillRect(0, y, W, 2);
}
function feetShadow(g, x, y, w = 20) { g.save(); g.globalAlpha = .22; prect(g, x + 12 - w / 2, y, w, 1, '#000'); prect(g, x + 12 - w / 2 + 2, y + 1, w - 4, 1, '#000'); g.restore(); }
/* 把一块像素缓冲按整数倍贴到屏幕的某个位置 */
function put(g, name, sx, sy, sw, sh, dx, dy, k) { g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF[name], sx, sy, sw, sh, dx, dy, sw * k, sh * k); g.restore(); }
/* 研究出处：小号灰字 */
function source(g, s, x, y, o = {}) { ptext(g, s, x, y, o.px || 22, o.col || '#9C93C0', { align: o.align || 'right' }); }
/* 像素对勾 */
function checkMark(g, x, y, k = 6, col = C.green) { g.fillStyle = col; [[0, 2], [1, 3], [2, 4], [3, 3], [4, 2], [5, 1], [6, 0]].forEach(([i, j]) => g.fillRect(x + i * k, y + j * k, k, k)); }
/* 头像 */
const PORTRAIT = {
  you: portraitClawd({ scarf: true, hat: 'night' }),
  elder: portraitClawd({ hat: 'band', brows: true }),
  cave: portraitClawd({ hat: 'bone' }),
  sw: (g, cx, cy, t) => {          // 睡眠开关
    const b = pbuf('swp', 32, 42); b.clearRect(0, 0, 32, 42);
    drawSwitch(b, 1, 1, t, 0, { face: 'angry' });
    put(g, 'swp', 0, 0, 32, 42, Math.round(cx - 64), Math.round(cy - 84), 4);
  },
};

/* 夜里的野外：天、月亮、远山、地面（缓冲 108×192） */
function nightField(b, t, hy, phase, o = {}) {
  drawNightSky(b, 108, hy, phase, t, o);
  if (o.moon !== false) { const c = skyAt(phase); drawMoon(b, o.mx ?? 92, o.my ?? 22, 6, c[0]); }
  drawHills(b, 108, hy, mixHex('#141634', skyAt(phase)[3], .25), 1, 6);
  drawGround(b, 108, 192, hy, o.g1 || '#3A2E2A', o.g2 || '#2A211E');
}

/* 白天的村子（缓冲 108×192）：蓝天、草原、金合欢、草棚 */
function dayField(b, t, hy) {
  pbands(b, 0, 108, [[0, '#4FA9E8'], [Math.round(hy * .35), '#6CBDF2'], [Math.round(hy * .7), '#8FD0F7'], [hy - 4, '#B5E2FA'], [hy, '#B5E2FA']], 3);
  for (let i = 0; i < 2; i++) drawCloud(b, ((i * 61 + t * 2) % 140) - 20, 20 + i * 18, .6 + i * .2);
  drawSun(b, 86, 18, 7, t);
  drawHills(b, 108, hy, '#A9CFC0', 2, 5);
  drawGround(b, 108, 192, hy, '#E3C46A', '#CDA650', 7);
  drawAcacia(b, 10, hy + 3, .5); drawAcacia(b, 100, hy + 2, .4);
}

/* ================= 开头 ================= */
function hook(g, t) {
  if (window.COVER) { coverArt(g, t); return; }
  if (t < S('h3') - .12) { hookNight(g, t); return; }
  if (t < S('h4') - .12) { hookBand(g, t); return; }
  if (t < CH('h4', 2) - .12) { hookNoWord(g, t); return; }
  if (t < S('h5') - .12) { hookDict(g, t); return; }
  hookClue(g, t);
}
/* 1. 篝火边：原始人睡得正香；"你"拿着手机进来，说出最常见的答案，盖章推翻 */
function hookNight(g, t) {
  const b = pbuf('hn', 108, 192), hy = 100;
  nightField(b, t, hy, 1.5);
  fireGlow(b, 44, hy + 18, 26, .9); drawFire(b, 44, hy + 20, t);
  drawCaveman(b, 8, hy + 10, t, { eyes: 'shut' }); drawZzz(b, 30, hy + 2, t);
  const yin = E.back(clamp((t - S('d1') + .3) / .4));
  if (yin > 0) {
    const yx = Math.round(lerp(120, 70, yin));
    feetShadow(b, yx, hy + 30);
    phoneGlow(b, yx - 5, hy + 11, 12, .9);
    drawYou(b, yx, hy + 14, t, { night: true, eyes: 'wide', arms: 'upL' }); pspr(b, PHONE(), yx - 9, hy + 6);
  }
  blit(g, 'hn', 10);
  const tp = 1 + .015 * Math.sin(t * 4);
  g.save(); g.translate(540, 320); g.scale(tp, tp); g.rotate(-.02);
  ptext(g, '原始人为什么', 0, -50, 96, C.white, { align: 'center', ol: C.ink, olw: 9, sh: 1 });
  ptext(g, '不失眠？', 0, 130, 168, C.amber, { align: 'center', ol: C.ink, olw: 12, sh: 1 });
  g.restore();
  popTag(g, t, .5, 300, 1020, '原始人：睡得正香', 36, { fill: C.amber, t1: S('d1') });
  if (yin > 0) popTag(g, t, S('d1') + .1, 820, 1030, '你', 36, { fill: '#9FD3FF' });
  dialogBox(g, t, 'd1', PORTRAIT.you, { extra: S('h3') - EN('d1') - .3 });
  stamp(g, 690, 1468, '全错', clamp((t - S('h2') + .05) / .25), { px: 72, rot: -.12 });
}
/* 2. 三个部落戴上手环：天黑 3 个多小时才睡，一晚只睡 6 个多小时 */
function hookBand(g, t) {
  // 研究报告的纸面：和前后两个夜景一眼就分得开
  g.fillStyle = '#F4E9D8'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(140,100,64,.12)'; for (let x = 0; x < W; x += 40) g.fillRect(x, 0, 2, H); for (let y = 0; y < H; y += 40) g.fillRect(0, y, W, 2);
  const b = pbuf('hb', 108, 30); b.clearRect(0, 0, 108, 30);
  [[8, 0], [38, 1], [68, 2]].forEach(([x, i]) => { prect(b, x - 3, 26, 30, 2, '#C9A86A'); drawTribe(b, x, 10, t, { eyes: 'shut', band: true, seed: i }); drawZzz(b, x + 22, 6 - (i % 2) * 2, t + i * .3, '#6B6488'); });
  put(g, 'hb', 0, 0, 108, 30, 0, 960, 10);
  popTag(g, t, S('h3') + .05, 540, 260, '非洲 · 南美 · 三个部落', 44, { fill: C.amber });
  popTag(g, t, CH('h3', 1), 540, 350, '睡觉时戴着手环，记下每一晚', 32, { fill: '#E8C08A' });
  const pp = E.out(clamp((t - CH('h3', 2) + .15) / .3));
  if (pp <= 0) return;
  g.save(); g.globalAlpha *= pp; g.translate(0, (1 - pp) * 60);
  pbox(g, 100, 430, 800, 490, { k: 6 });
  // 第一行：天黑后多久睡着
  ptext(g, '天黑以后，多久才睡着', 140, 500, 32, '#CFC6E8');
  const u = E.io(clamp((t - CH('h3', 2) - .1) / 1.2));
  // 日落 → 月亮的进度条
  g.fillStyle = '#3B3363'; g.fillRect(200, 560, 560, 16);
  g.fillStyle = C.amber; g.fillRect(200, 560, Math.round(560 * u / 8) * 8, 16);
  g.fillStyle = '#FF8A3D'; g.fillRect(150, 548, 40, 20); g.fillRect(158, 540, 24, 8); g.fillStyle = '#E07A5A'; g.fillRect(146, 568, 48, 6);
  g.fillStyle = '#FFF3C4'; g.fillRect(790, 540, 30, 36); g.fillStyle = '#2B2547'; g.fillRect(804, 540, 20, 26);
  ptext(g, '日落', 170, 620, 26, '#E8C08A', { align: 'center' }); ptext(g, '睡着', 805, 620, 26, '#FFF3C4', { align: 'center' });
  if (u > .3) ptext(g, '3 个多小时', 480, 640, 52, C.gold, { align: 'center', sh: 1 });
  // 第二行：一晚睡多久
  if (t > CH('h3', 3) - .1) {
    ptext(g, '一晚睡多久', 140, 730, 32, '#CFC6E8');
    const v = E.out(clamp((t - CH('h3', 3)) / .8));
    // 想象中的 10 小时：虚线框 + 划掉
    g.fillStyle = 'rgba(255,255,255,.25)';
    for (let x = 140; x < 860; x += 24) { g.fillRect(x, 760, 12, 4); g.fillRect(x, 826, 12, 4); }
    ptext(g, '以为：10 小时', 860, 810, 26, 'rgba(255,255,255,.5)', { align: 'right' });
    g.fillStyle = C.red; g.fillRect(620, 790, 250, 6);
    g.fillStyle = C.gold; g.fillRect(140, 764, Math.round(450 * v / 6) * 6, 64);
    if (v > .5) ptext(g, '5.7~7.1 小时', 160, 810, 40, C.ink);
  }
  source(g, 'Yetish 等，Current Biology 2015', 880, 900);
  g.restore();
}
/* 3. 几乎不失眠；有两个部落的话里，连"失眠"这个词都没有 */
function hookNoWord(g, t) {
  const b = pbuf('nw', 108, 192), hy = 100;
  dayField(b, t, hy);
  drawHut(b, 18, hy + 4, 1.2, '#8C6A4A'); drawHut(b, 86, hy + 3, 1.1, '#7A5A3E');
  drawTribe(b, 4, hy + 14, t, { seed: 4 });
  drawTribe(b, 76, hy + 14, t, { seed: 5, arms: Math.floor(t * 2) % 2 ? 'upR' : 'n' });
  drawTribe(b, 40, hy + 12, t, { elder: true, seed: 6 });
  blit(g, 'nw', 10);
  // 50 个人里大约 1 个
  const pa = E.out(clamp((t - S('h4') - .05) / .3));
  if (pa > 0) {
    g.save(); g.globalAlpha *= pa;
    pbox(g, 100, 240, 800, 360, { k: 6 });
    ptext(g, '说自己常失眠的', 140, 310, 32, '#CFC6E8');
    const hi = t > CH('h4', 1) - .1;
    for (let i = 0; i < 50; i++) {
      const x = 140 + (i % 10) * 46, y = 345 + Math.floor(i / 10) * 44, bad = i === 37 && hi;
      g.fillStyle = bad ? C.red : '#5E6BA8'; g.fillRect(x, y, 34, 30);
      g.fillStyle = bad ? '#FFFFFF' : '#C9D3DE';
      if (bad) { g.fillRect(x + 7, y + 8, 6, 8); g.fillRect(x + 21, y + 8, 6, 8); } else { g.fillRect(x + 6, y + 13, 8, 3); g.fillRect(x + 20, y + 13, 8, 3); }
    }
    if (hi) {
      const p = pop(t, CH('h4', 1), .35);
      g.save(); g.translate(760, 440); g.scale(p, p);
      ptext(g, '约 2%', 0, 0, 72, C.gold, { align: 'center', ol: C.ink, olw: 6, sh: 1 });
      ptext(g, '50 人里约 1 个', 0, 60, 28, C.white, { align: 'center' });
      g.restore();
    }
    source(g, 'Yetish 等，Current Biology 2015', 880, 585);
    g.restore();
  }
}
/* 3b. 特写：桌上摊开的"部落话词典"，查不到"失眠"（单独一个镜头，开头前 20 秒多切一次） */
function hookDict(g, t) {
  // 木桌面
  g.fillStyle = '#7A4E2E'; g.fillRect(0, 0, W, H);
  for (let y = 0; y < H; y += 90) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(0, y, W, 6); g.fillStyle = 'rgba(255,220,170,.06)'; g.fillRect(0, y + 6, W, 30); }
  const pd = E.out(clamp((t - CH('h4', 2) + .12) / .3));
  g.save(); g.globalAlpha *= pd; g.translate(0, (1 - pd) * 60);
  // 摊开的书
  pbox(g, 110, 330, 790, 820, { k: 8, fill: '#FFF4DF', edge: '#3A2414', rim: '#C9A86A' });
  g.fillStyle = 'rgba(140,100,64,.25)'; g.fillRect(500, 350, 10, 780);
  g.fillStyle = '#8C6440'; g.fillRect(134, 354, 742, 96);
  ptext(g, '部落话 · 词典', 505, 418, 48, C.white, { align: 'center' });
  [['太阳', 0], ['打猎', .25], ['睡觉', .5]].forEach(([w, d], i) => {
    if (t < CH('h4', 2) + d) return;
    ptext(g, w, 200, 560 + i * 120, 64, C.ink); checkMark(g, 420, 520 + i * 120, 8);
  });
  if (t > CH('h4', 2) + .8) { ptext(g, '失眠', 200, 920, 64, C.ink); ptext(g, '？', 420, 920, 64, C.red); }
  source(g, 'Yetish 等，Current Biology 2015', 880, 1110);
  g.restore();
  stamp(g, 640, 900, '查无此词', clamp((t - CH('h4', 3) - .2) / .25), { px: 72, rot: -.12 });
  dialogBox(g, t, 'd2', PORTRAIT.elder, { extra: S('h5') - EN('d2') - .3 });
}
/* 4. 线索：夜里的一根温度计，水银一路往下掉 */
function hookClue(g, t) {
  const b = pbuf('hc', 108, 192), hy = 150;
  nightField(b, t, hy, 2.1, { mx: 20, my: 20 });
  drawBreeze(b, 108, 40, 100, t, .8);
  const u = clamp((t - S('h5') + .1) / (EN('h6') - S('h5')));
  b.save(); b.globalAlpha = .35; pdisc(b, 54, 80, 26, '#9FD3FF'); b.restore();
  drawThermo(b, 54, 34, 84, lerp(.85, .3, E.io(u)), { glass: '#F2FAFF' });
  blit(g, 'hc', 10);
  if (u > .1) { const a = clamp((u - .1) * 4); withAlpha(g, a, () => { ptext(g, '气温', 700, 760, 40, '#BFE6FF'); g.fillStyle = '#BFE6FF'; for (let i = 0; i < 6; i++) g.fillRect(724, 790 + i * 14, 12, 10); for (let i = 0; i < 4; i++) g.fillRect(706 + i * 8, 874 + i * 8, 48 - i * 16, 8); }); }
  popText(g, t, S('h6') - .05, 99, '温度计', 540, 300, 150, C.amber);
}

/* 封面：大标题 + 篝火边睡着的原始人 + 拿着手机睡不着的"你" */
function coverArt(g, t) {
  const b = pbuf('cov', 90, 160), hy = 96;
  drawNightSky(b, 90, hy, 1.5, 3.3);
  drawMoon(b, 76, 14, 6, skyAt(1.5)[0]);
  drawHills(b, 90, hy, '#1A1B3E', 1, 5); drawGround(b, 90, 160, hy, '#3A2E2A', '#2A211E');
  fireGlow(b, 34, hy + 24, 24, .9); drawFire(b, 34, hy + 26, 1.3);
  drawCaveman(b, 2, hy + 18, 0, { eyes: 'shut' }); drawZzz(b, 22, hy + 10, 1.4);
  phoneGlow(b, 51, hy + 29, 14, .9);
  drawYou(b, 56, hy + 32, 0, { night: true, eyes: 'tired', arms: 'upL' }); pspr(b, PHONE(), 47, hy + 24);
  blit(g, 'cov', 12);
  g.save(); g.translate(540, 450); g.rotate(-.03);
  ptext(g, '原始人为什么', 0, -60, 120, C.white, { align: 'center', ol: C.ink, olw: 11, sh: 1 });
  ptext(g, '不失眠？', 0, 190, 200, C.amber, { align: 'center', ol: C.ink, olw: 15, sh: 1 });
  g.restore();
  stamp(g, 740, 930, '睡得比你少', 1, { px: 56, rot: -.12 });
}

/* ================= 身体里的睡眠开关 ================= */
function body(g, t) {
  if (t < S('s2') - .15) { statsChina(g, t); return; }
  switchRoom(g, t);
}
/* 在中国：大约每 7 个人就有 1 个失眠 */
function statsChina(g, t) {
  menuBG(g, t, '#1E2448');
  ptext(g, '在中国', 540, 330, 72, C.white, { align: 'center', sh: 1 });
  source(g, 'Cao 等，PLoS ONE 2017 · 汇总 17 项调查、11.6 万人', 540, 400, { px: 26, align: 'center' });
  const hi = t > CH('s1', 3) - .1;
  for (let i = 0; i < 7; i++) {
    const bad = i === 4 && hi, name = 'bd' + (bad ? 1 : 0);
    const c = pbuf(name, 30, 30); c.clearRect(0, 0, 30, 30);
    drawBed(c, 2, 24, 26, { wood: '#8C6440' });
    drawClawd(c, 3, 12, { eyes: bad ? 'tired' : 'shut', hat: 'night' });
    blanket(c, 0, 24, 30, bad ? '#C9737A' : '#6E9BD6');
    const x = 64 + i * 118, y = 560;
    if (bad) { g.fillStyle = 'rgba(255,90,79,.35)'; g.fillRect(x - 6, y - 10, 132, 140); }
    put(g, name, 0, 0, 30, 30, x, y, 4);
    if (!bad && Math.floor(t * 2 + i) % 3 === 0) ptext(g, 'z', x + 96, y + 20, 30, '#CFC6E8');
  }
  if (hi) {
    const p = pop(t, CH('s1', 3), .35);
    g.save(); g.translate(480, 900); g.scale(p, p);
    ptext(g, '每 7 个人就有 1 个', 0, -10, 64, C.white, { align: 'center', sh: 1 });
    ptext(g, '约 15%', 0, 100, 96, C.red, { align: 'center', ol: C.ink, olw: 7, sh: 1 });
    g.restore();
  }
  popTag(g, t, CH('s1', 4), 480, 1120, '年轻一些的人群：约 20%', 36, { fill: C.amber });
}
/* 睡眠开关：左边开关，右边体温计；下面是"你"，散热口在手和脚 */
function switchRoom(g, t) {
  menuBG(g, t, '#1B2040');
  popTag(g, t, S('s2') + .05, 480, 260, '你身上的睡眠开关', 40, { fill: '#9FD3FF' });
  // 体温：s4 里一路往下掉，掉过关机线，开关就扳到"睡"
  const cool = E.io(clamp((t - CH('s4', 1)) / (CH('s4', 3) - CH('s4', 1) + .2)));
  const level = lerp(.8, .3, cool), off = cool > .85;
  const b = pbuf('sw', 108, 60); b.clearRect(0, 0, 108, 60);
  drawSwitch(b, 10, 8, t, off ? clamp((cool - .85) / .15) : 0, { face: t > S('d3') && t < EN('d3') + .3 ? 'angry' : 'n' });
  drawThermo(b, 74, 6, 40, level, { line: .45 });
  put(g, 'sw', 0, 0, 108, 60, 0, 300, 10);
  ptext(g, '醒', 420, 548, 36, C.gold); ptext(g, '睡', 420, 738, 36, '#9FD3FF');
  ptext(g, '体温', 745, 342, 32, '#FFB0A8', { align: 'center' });
  if (t > CH('s2', 2) - .1) withAlpha(g, clamp((t - CH('s2', 2) + .1) / .3), () => ptext(g, '关机线', 655, 592, 28, '#9FD3FF', { align: 'right' }));
  // 下面的"你"：散热口在手和脚
  const yb = pbuf('swy', 90, 36); yb.clearRect(0, 0, 90, 36);
  const vent = t > CH('s3', 3) - .1 ? (t > S('s4') ? 1 : .5) : 0;
  drawYou(yb, 33, 12, t, { night: true, eyes: off ? 'shut' : blinkEyes(t, 1) });
  drawVents(yb, 33, 12, t, vent, { len: 1.1 });
  put(g, 'swy', 0, 0, 90, 36, 0, 900, 12);
  if (t > CH('s3', 3) - .1) {
    popTag(g, t, CH('s3', 3), 290, 1060, '散热口', 30, { fill: C.amber });
    popTag(g, t, CH('s3', 3) + .15, 790, 1060, '散热口', 30, { fill: C.amber });
    popTag(g, t, CH('s3', 3) + .3, 790, 1230, '散热口', 30, { fill: C.amber });
  }
  if (off) { const k = Math.floor(t * 2.2) % 3; for (let i = 0; i <= k; i++) ptext(g, 'Z', 700 + i * 40, 1000 - i * 40, 36 + i * 8, '#CFC6E8'); }
  if (t > S('s4') - .1) source(g, '手脚的血管张得越开，入睡越快 · Kräuchi 等，Nature 1999', 890, 888, { px: 22 });
  dialogBox(g, t, 'd3', PORTRAIT.sw, { pfill: '#1E1A3A' });
}
