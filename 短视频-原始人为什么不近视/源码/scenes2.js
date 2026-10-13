'use strict';
/* scenes2.js：草原（手册是在这里写的）→ 多巴胺吹哨 → 小鸡实验 → 教室 → 夜班工地 → 黑板糊了 → 进化错配。 */

/* ================= 光照尺：对数刻度，1 ~ 100 000 lux ================= */
const LUX_X0 = 110, LUX_X1 = 970;
const luxX = v => LUX_X0 + Math.log10(Math.max(1, v)) / 5 * (LUX_X1 - LUX_X0);
/* marks: [{v, v2, label, col, t0}]；v2 给出时画成一段区间 */
function luxRuler(g, t, y, a, marks, o = {}) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a;
  pbox(g, 50, y - 150, 980, 330, { k: 6, fill: 'rgba(20,16,40,.9)' });
  ptext(g, o.title || '光照强度（勒克斯，对数刻度）', 90, y - 92, 36, '#CFC6E8');
  // 色带
  const n = 43, bw = (LUX_X1 - LUX_X0) / n;
  for (let i = 0; i < n; i++) {
    const u = i / (n - 1), r = Math.round(lerp(40, 255, Math.min(1, u * 1.3))), gg = Math.round(lerp(36, 226, u)), b = Math.round(lerp(90, 90, u) * (1 - u) + 70 * u);
    g.fillStyle = `rgb(${r},${gg},${b})`; g.fillRect(Math.round(LUX_X0 + i * bw), y - 24, Math.ceil(bw), 48);
  }
  g.fillStyle = C.ink; g.fillRect(LUX_X0 - 6, y - 30, LUX_X1 - LUX_X0 + 12, 6); g.fillRect(LUX_X0 - 6, y + 24, LUX_X1 - LUX_X0 + 12, 6);
  g.fillRect(LUX_X0 - 6, y - 30, 6, 60); g.fillRect(LUX_X1, y - 30, 6, 60);
  [['1', 1], ['10', 10], ['100', 100], ['1千', 1e3], ['1万', 1e4], ['10万', 1e5]].forEach(([s, v]) => {
    const x = luxX(v); g.fillStyle = '#FFFFFF'; g.fillRect(Math.round(x) - 2, y + 30, 4, 14);
    ptext(g, s, x, y + 84, 24, '#CFC6E8', { align: 'center' });
  });
  marks.forEach((m, i) => {
    const p = pop(t, m.t0, .35); if (p <= 0) return;
    const x = luxX(m.v), x2 = m.v2 ? luxX(m.v2) : x, col = m.col || C.amber, up = m.up ?? (i % 2 === 0);
    g.save(); g.globalAlpha *= clamp(p * 2);
    if (m.v2) { g.fillStyle = col; g.fillRect(Math.round(x), y - 40, Math.round(x2 - x), 10); }
    const cx = (x + x2) / 2, ly = up ? y - 52 : y + 50;
    // 三角指针
    g.fillStyle = col;
    for (let j = 0; j < 4; j++) g.fillRect(Math.round(cx) - (4 - j) * 4, up ? y - 44 - j * 4 - 8 : y + 30 + j * 4, (4 - j) * 8, 4);
    g.translate(cx, up ? y - 60 : y + 120); g.scale(p, p);
    ptext(g, m.label, 0, 0, 36, col, { align: 'center', ol: C.ink, olw: 4 });
    g.restore();
  });
  g.restore();
}

/* ================= 草原：孩子们整天在户外 ================= */
const SV_W = 135, SV_H = 240, SV_HY = 100;
function savannaScene(g, t) {
  const b = pbuf('sv', SV_W, SV_H);
  drawSavanna(b, t, SV_W, SV_H, SV_HY, { sunX: 112, sunY: 34 });
  drawRock(b, 104, 132, 30, 10);
  // 四个原始人小怪
  const kids = [
    { col: TONES.base, path: u => [12 + (Math.sin(u * .9) * .5 + .5) * 70, 116], fps: 8 },
    { col: TONES.blue, path: u => [70 + Math.sin(u * 1.3) * 26, 128 + Math.round(Math.cos(u * 2.6) * 3)], fps: 8 },
    { col: TONES.green, path: () => [16, 136], jump: true },
    { col: TONES.yellow, path: () => [93, 106], look: true },
  ];
  kids.forEach((k, i) => {
    const [x, y] = k.path(t), [x2] = k.path(t + .05), flip = x2 < x;
    let yy = y, arms = 'n', eyes = blinkEyes(t, i), legs = k.fps ? walkLegs(t + i, k.fps) : 0;
    if (k.jump) { const ph = (t * 1.6) % 1; yy = y - Math.round(Math.sin(ph * Math.PI) * 9); arms = ph < .5 ? 'up' : 'n'; eyes = 'happy'; legs = 0; }
    if (k.look) { arms = 'upR'; eyes = 'r'; legs = 0; }
    feetShadow(b, x, y + 16);
    drawClawd(b, x, yy, { col: k.col, hat: 'bone', arms, eyes, legs }, flip);
  });
  // 蝴蝶
  const bx = 70 + Math.sin(t * 1.3 + .6) * 30, by = 112 + Math.sin(t * 3.1) * 6;
  pspr(b, BUTTERFLY[Math.floor(t * 10) % 2](), bx, by);
  blit(g, 'sv', 8);
  // 太阳的光
  const gr = g.createRadialGradient(896, 272, 10, 896, 272, 700);
  gr.addColorStop(0, 'rgba(255,244,190,.55)'); gr.addColorStop(1, 'rgba(255,244,190,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, 1300);
  // 光照尺
  luxRuler(g, t, 470, win(t, T.lux - .45, T.siteS + .2, .25, .2), [
    { v: 3e4, v2: 1e5, label: '晴天户外', col: C.gold, t0: T.lux - .1, up: true },
  ]);
}

/* ================= 工地：强光下工头吹哨 ================= */
function savannaSite(g, t) {
  const b = pbuf('site', SITE_W, SITE_H);
  const L = lerp(22.4, FOCUS_MM, E.out(seg(t, T.siteS + .2, T.whistle)));
  const crew = t < T.whistle ? 'work' : 'stop';
  drawSite(b, t, {
    L, light: 1, lamp: 'sun', crew, focusStar: t > T.whistle, retinaGlow: t > T.dopa - .2,
    dopa: clamp((t - T.dopa + .15) / .6), foreman: t > T.whistle - .05 && t < T.whistle + 1.3 ? 'blow' : 'stand',
  });
  blit(g, 'site', 6);
  siteLabels(g, t, { L }, 6);
  // 强光照进来：一道光柱
  g.save(); g.globalCompositeOperation = 'lighter';
  const gr = g.createLinearGradient(0, 0, 700, 0); gr.addColorStop(0, 'rgba(255,230,140,.35)'); gr.addColorStop(1, 'rgba(255,230,140,0)');
  g.fillStyle = gr; g.fillRect(0, (EYE_CY - 16) * 6, 700, 32 * 6); g.restore();
  // 多巴胺标签
  const dp = pop(t, T.dopa - .05, .4);
  if (dp > 0 && t < T.whistle + 2) { g.save(); g.translate(retX(L) * 6 - 150, (EYE_CY - 34) * 6); g.scale(dp, dp); ptag(g, 0, 0, '多巴胺', 48, { fill: '#B6FF6B' }); g.restore(); }
  // 工头名牌
  const fp = pop(t, S('s4') - .1, .35);
  if (fp > 0) { g.save(); g.translate(170, 148 * 6); g.scale(fp, fp); ptag(g, 0, 0, '工头 · 多巴胺', 30, { fill: '#F2F2F2' }); g.restore(); }
  // 哔——！
  const wp = pop(t, T.whistle, .3), wa = win(t, T.whistle, T.whistle + 1.4, 0, .3);
  if (wp > 0 && wa > 0) withAlpha(g, wa, () => {
    g.save(); g.translate(330, 1020); g.scale(wp, wp); g.rotate(-.08);
    ptext(g, '哔——！', 0, 0, 96, C.white, { align: 'center', ol: C.ink, olw: 8 });
    g.restore();
    for (let i = 0; i < 3; i++) { const u = ((t - T.whistle) * 1.5 + i / 3) % 1; g.fillStyle = `rgba(255,255,255,${1 - u})`; g.fillRect(150 + u * 120, 1080 - i * 30 - u * 20, 24, 8); }
  });
  const sp = pop(t, T.whistle + .25, .35);
  if (sp > 0) { g.save(); g.translate(eyeBack(L) * 6 + 150, 760); g.scale(sp, sp); ptag(g, 0, 0, '慢点长！', 48, { fill: C.red, col: C.white }); g.restore(); }
}

/* ================= 手册：只有一条 ================= */
function ruleScene(g, t) {
  // 背景：草原，压暗
  const b = pbuf('sv', SV_W, SV_H);
  drawSavanna(b, t, SV_W, SV_H, SV_HY, { sunX: 112, sunY: 34 });
  blit(g, 'sv', 8);
  g.fillStyle = 'rgba(20,16,40,.45)'; g.fillRect(0, 0, W, H);
  const p = E.out(clamp((t - T.rule) / .45));
  g.save(); g.translate(540, 740 + (1 - p) * 300); g.rotate(-.02 * (1 - p));
  const k = 12, w = 72 * k, h = 66 * k;
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-w / 2 + 24, -h / 2 + 24, w, h);
  g.fillStyle = '#5E5046'; g.fillRect(-w / 2, -h / 2, w, h);
  g.fillStyle = '#8C7A6B'; g.fillRect(-w / 2 + k, -h / 2 + k, w - 2 * k, h - 2 * k);
  g.fillStyle = '#A8968A'; g.fillRect(-w / 2 + k, -h / 2 + k, w - 2 * k, 3 * k);
  for (let i = 0; i < 14; i++) { g.fillStyle = i % 2 ? '#7E6D60' : '#9A887B'; g.fillRect(-w / 2 + (4 + hash(i) * 62) * k, -h / 2 + (8 + hash(i, 1) * 54) * k, (2 + hash(i, 2) * 4) * k, k); }
  ptext(g, '眼球施工手册', 0, -h / 2 + 150, 72, '#FFF4DF', { align: 'center', sh: 1 });
  ptext(g, '旧石器版', 0, -h / 2 + 214, 36, '#E8D9C2', { align: 'center' });
  ptext(g, '第 1 条', -w / 2 + 70, -h / 2 + 320, 48, C.gold);
  // 三个图标：太阳 → 哨子 → 停工
  const ic = [[-250, '光够亮'], [0, '吹哨'], [250, '停工']];
  ic.forEach(([x, s], i) => {
    const u = pop(t, T.rule + .5 + i * .45, .35); if (u <= 0) return;
    g.save(); g.translate(x, 60); g.scale(u, u);
    pbox(g, -100, -100, 200, 200, { k: 6, fill: '#F4E9D8', rim: '#5E5046', shadow: false });
    if (i === 0) { const c = mk(30, 30), cg = c.getContext('2d'); drawSun(cg, 15, 15, 7, t, { face: true }); g.imageSmoothingEnabled = false; g.drawImage(c, -75, -75, 150, 150); }
    if (i === 1) { g.imageSmoothingEnabled = false; g.drawImage(WHISTLE(), -68, -38, 136, 76); }
    if (i === 2) { g.fillStyle = '#E5322D'; g.beginPath(); g.arc(0, 0, 66, 0, TAU); g.fill(); g.fillStyle = '#FFFFFF'; g.fillRect(-44, -12, 88, 24); }
    g.restore();
    ptext(g, s, x, 230, 48, '#FFF4DF', { align: 'center', sh: 1 });
    if (i < 2) { g.fillStyle = '#FFF4DF'; const ax = x + 125; g.fillRect(ax - 6, 54, 18, 12); g.fillRect(ax + 12, 48, 6, 24); g.fillRect(ax + 18, 54, 6, 12); }
  });
  const ep = pop(t, T.ruleStamp + .15, .4);
  if (ep > 0) ptext(g, '（全书完）', 0, h / 2 - 50, 36, '#E8D9C2', { align: 'center' });
  g.restore();
  if (t > T.ruleStamp - .02) stamp(g, 790, 1175, '就这一条', clamp((t - T.ruleStamp) / .5), { px: 48, rot: .1 });
}

/* ================= 小鸡实验（P=12，小鸡大一些） ================= */
function labBG() {
  return cached('labBG', 90, 160, g => {
    pbands(g, 0, 90, [[0, '#E6ECF0'], [86, '#DCE4EA'], [88, '#DCE4EA']], 2);
    for (let x = 0; x < 90; x += 8) prect(g, x, 0, 1, 88, '#CED8DF');
    for (let y = 0; y < 88; y += 8) prect(g, 0, y, 90, 1, '#CED8DF');
    prect(g, 0, 88, 90, 3, '#F4F7F9'); prect(g, 0, 91, 90, 2, '#9AA6B2'); prect(g, 0, 93, 90, 67, '#B8C3CD');
    for (let x = 4; x < 90; x += 22) { prect(g, x, 98, 18, 14, '#A6B2BD'); prect(g, x + 7, 104, 4, 1, '#7E8A96'); }
  });
}
function labScene(g, t) {
  const b = pbuf('lab', 90, 160);
  b.drawImage(labBG(), 0, 0);
  // 两盏灯
  prect(b, 21, 0, 1, 30, '#555B6B'); prect(b, 16, 30, 11, 4, '#7E8494'); prect(b, 18, 34, 7, 1, '#FFE9A8');
  prect(b, 67, 0, 2, 26, '#555B6B'); prect(b, 58, 26, 20, 6, '#3B3F4E'); prect(b, 60, 32, 16, 2, '#FFFFFF');
  // 小鸡
  const goggle = t > T.goggles;
  for (const [x, i] of [[15, 0], [62, 1]]) {
    const hop = Math.floor(t * 3 + i) % 6 === 0 ? 1 : 0;
    b.save(); b.globalAlpha = .2; prect(b, x, 88, 12, 1, '#000'); b.restore();
    pspr(b, CHICK(), x, 76 - hop);
    if (goggle) pspr(b, GOGGLE(), x + 1, 77 - hop);
  }
  if (t > T.block - .6 && t < T.fail + .4) { const u = E.io(seg(t, T.block - .6, T.block)); pspr(b, SYRINGE(), lerp(92, 72, u), 78); }
  blit(g, 'lab', 12);
  // 灯光
  g.save(); g.globalCompositeOperation = 'lighter';
  const l1 = g.createRadialGradient(258, 420, 10, 258, 420, 520); l1.addColorStop(0, 'rgba(255,220,150,.3)'); l1.addColorStop(1, 'rgba(255,220,150,0)');
  g.fillStyle = l1; g.fillRect(0, 0, 540, 1300);
  const l2 = g.createRadialGradient(816, 400, 10, 816, 400, 700); l2.addColorStop(0, 'rgba(255,255,235,.8)'); l2.addColorStop(1, 'rgba(255,255,235,0)');
  g.fillStyle = l2; g.fillRect(540, 0, 540, 1300);
  g.restore();
  g.fillStyle = 'rgba(20,16,40,.38)'; g.fillRect(0, 0, 540, 1300);
  g.fillStyle = C.ink; for (let y = 0; y < 1270; y += 24) g.fillRect(534 + ((y / 24) % 2) * 6, y, 12, 24);
  vsBadge(g, 540, 760, .7);
  ptag(g, 270, 220, '普通灯光 500 LUX', 36, { fill: '#C9D3DE' });
  ptag(g, 810, 220, '强光 15,000 LUX', 36, { fill: C.gold });
  withAlpha(g, win(t, T.goggles, 99, .2, 0), () => ptext(g, '都戴上模糊眼罩', 540, 300, 36, C.white, { align: 'center', ol: C.ink, olw: 4 }));
  // 近视程度条
  const grow = seg(t, CK('c1', 1) - .3, T.slow);
  const left = .9 * E.out(grow), right = lerp(.32 * E.out(grow), .88, E.io(seg(t, T.block + .3, T.fail)));
  const bar = (x, v, col) => { pbox(g, x, 580, 400, 76, { k: 4, fill: 'rgba(20,16,40,.9)', shadow: false }); g.fillStyle = col; g.fillRect(x + 16, 596, Math.round((400 - 32) * v / 4) * 4, 44); };
  withAlpha(g, win(t, CK('c1', 1) - .4, 99, .25, 0), () => {
    ptext(g, '近视程度（示意）', 540, 556, 36, C.white, { align: 'center', ol: C.ink, olw: 4 });
    bar(70, left, C.red); bar(610, right, t > T.block + .3 ? C.red : C.green);
  });
  const okp = pop(t, T.slow, .35);
  if (okp > 0 && t < T.block) { g.save(); g.translate(810, 712); g.scale(okp, okp); ptext(g, '长得慢多了', 0, 0, 48, C.green, { align: 'center', ol: C.ink, olw: 5 }); g.restore(); }
  const bp = pop(t, T.block, .35);
  if (bp > 0) { g.save(); g.translate(810, 1160); g.scale(bp, bp); ptag(g, 0, 0, '阻断多巴胺', 36, { fill: '#B6FF6B' }); g.restore(); }
  if (t > T.fail - .02) stamp(g, 810, 420, '不灵了', clamp((t - T.fail) / .5), { px: 72, rot: -.1 });
}

/* ================= 教室：今天 ================= */
/* 现代学校外景 */
function schoolBG() {
  return cached('schoolBG', 135, 240, g => {
    pbands(g, 0, 135, [[0, '#5FB2EC'], [60, '#86C9F4'], [110, '#B5E0FA'], [120, '#B5E0FA']], 3);
    for (let x = 0; x < 135; x += 11) { const hh = 22 + Math.floor(hash(x, 5) * 36); prect(g, x, 120 - hh, 10, hh, '#A9C3D8'); for (let k = 3; k < hh - 3; k += 5) for (let j = 0; j < 2; j++) if (hash(x, k, j) < .6) prect(g, x + 2 + j * 4, 120 - hh + k, 2, 2, '#D5E6F2'); }
    // 教学楼
    prect(g, 14, 58, 106, 64, '#F1E6D2'); prect(g, 14, 56, 106, 3, '#C9B79C');
    for (let r = 0; r < 4; r++) for (let c = 0; c < 8; c++) { prect(g, 20 + c * 12, 64 + r * 14, 8, 8, '#8FB6D9'); prect(g, 20 + c * 12, 64 + r * 14, 8, 1, '#6F96B9'); }
    prect(g, 58, 106, 18, 16, '#8A5A35'); prect(g, 66, 106, 1, 16, '#6B4428');
    prect(g, 62, 44, 1, 14, '#6B7180'); prect(g, 63, 44, 7, 4, '#E5322D');
    pbands(g, 0, 135, [[122, '#9ACB6E'], [140, '#B9B2A6'], [240, '#A8A196']], 2);
    for (let x = 0; x < 135; x += 6) prect(g, x, 141, 3, 1, '#C9C2B6');
  });
}
function classScene(g, t) {
  // (a) 外景：孩子们走进学校
  if (t < T.indoor) {
    const b = pbuf('school', 135, 240);
    b.drawImage(schoolBG(), 0, 0);
    drawSun(b, 112, 22, 8, t, { spin: true });
    for (let i = 0; i < 4; i++) {
      const x = -30 + ((t - T.ff) * 14 + i * 22) % 100, tone = ['blue', 'base', 'green', 'pink'][i];
      if (x > 58) continue;
      feetShadow(b, x, 140);
      drawClawd(b, x, 124, { col: TONES[tone], scarf: true, legs: walkLegs(t + i * .3, 8), eyes: 'r' });
    }
    blit(g, 'school', 8);
    ptag(g, 540, 420, '今天 · 早上 07:50', 48, { fill: C.paper });
    return;
  }
  // (c) 剖面：天花板挡住太阳
  if (t >= T.roof && t < T.autoexp) {
    const b = pbuf('roof', 135, 240);
    b.drawImage(schoolBG(), 0, 0);
    const sx = 68, sy = 18;
    drawSun(b, sx, sy, 9, t, { spin: true });
    for (let i = -5; i <= 5; i++) {
      const x1 = 22 + (i + 5) * 9.5, hitRoof = Math.abs(i) < 6;
      const len = clamp((t - T.roof) / .5);
      pline(b, sx + i * 2, sy + 10, lerp(sx + i * 2, x1, len), lerp(sy + 10, 56, len), '#FFE066', 0);
    }
    // 屋顶高亮
    const fl = Math.floor(t * 4) % 2;
    prect(b, 14, 54, 106, 4, fl ? '#FFB547' : '#FF8A3D');
    blit(g, 'roof', 8);
    ptext(g, '天花板', 540, 640, 96, C.amber, { align: 'center', ol: C.ink, olw: 8 });
    g.fillStyle = C.amber; for (let j = 0; j < 5; j++) g.fillRect(540 - (j + 1) * 8, 500 + j * 8, (j + 1) * 16, 8); g.fillRect(528, 540, 24, 30);
    ptag(g, 540, 1110, '教室里：灯光', 36, { fill: '#C9D3DE' });
    return;
  }
  // (b)(d) 教室内景
  const b = pbuf('cls', CLS_W, CLS_H);
  drawClassFront(b, t, { hero: { eyes: t > T.autoexp && t < T.autoOn ? 'squint' : blinkEyes(t, 7) } });
  pspr(b, CLOCK(), 63, 78);
  blit(g, 'cls', 8, 0, 60);
  // 灯光
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const lx of [36, 98]) { const gr = g.createRadialGradient(lx * 8, 0, 10, lx * 8, 0, 520); gr.addColorStop(0, 'rgba(255,253,230,.35)'); gr.addColorStop(1, 'rgba(255,253,230,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, 900); }
  g.restore();
  if (t < T.roof) {
    // 时钟飞转：室内时间进度
    const u = seg(t, T.indoor + .2, T.roof - .2), hh = 8 + u * 9;
    pbox(g, 140, 230, 800, 110, { k: 6 });
    ptext(g, `在室内：08:00 → ${String(Math.floor(hh)).padStart(2, '0')}:${String(Math.floor((hh % 1) * 60)).padStart(2, '0')}`, 190, 302, 48, C.white);
    return;
  }
  // 曝光：先暗，自动调亮；再关掉自动曝光
  let expo = 1;
  if (t < T.autoOn) expo = lerp(.18, 1, E.io(seg(t, T.autoexp + .5, T.autoOn)));
  if (t > T.realDark) expo = lerp(1, .2, E.io(seg(t, T.realDark, T.realDark + .7)));
  if (expo < 1) {
    g.fillStyle = `rgba(30,14,10,${(1 - expo) * .92})`; g.fillRect(0, 0, W, H);
    if (t > T.realDark) { g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = `rgba(255,170,110,${(1 - expo) * .6})`; g.fillRect(0, 0, W, H); g.restore(); }
  }
  // 曝光读数
  const autoA = win(t, T.autoexp + .4, T.realDark + .2, .2, .2);
  if (autoA) withAlpha(g, autoA, () => {
    pbox(g, 620, 190, 400, 150, { k: 6 });
    ptext(g, '眼睛：自动调亮', 650, 252, 36, C.white);
    ptext(g, t > T.autoOn ? '亮度 ×100' : `亮度 ×${Math.max(1, Math.round(100 * seg(t, T.autoexp + .5, T.autoOn)))}`, 650, 310, 48, C.gold);
  });
  const offA = win(t, T.realDark, T.siteK + .4, .1, .2);
  if (offA) withAlpha(g, offA, () => {
    pbox(g, 560, 190, 460, 110, { k: 6, fill: 'rgba(10,30,16,.92)', rim: C.dbg });
    ptext(g, 'DEBUG 自动调亮：关', 590, 262, 36, C.dbg);
  });
  luxRuler(g, t, 560, win(t, T.dusk - .3, T.siteK + .3, .25, .2), [
    { v: 3e4, v2: 1e5, label: '晴天户外', col: C.gold, t0: T.dusk - .2, up: true },
    { v: 400, label: '日落', col: '#FF9A6B', t0: T.dusk, up: true },
    { v: 300, v2: 500, label: '教室', col: '#9FD3FF', t0: T.dusk + .35, up: false },
  ]);
}

/* ================= 夜班：哨子不响，施工队一直干 ================= */
const nightL = t => lerp(FOCUS_MM, 24.5, E.io(seg(t, T.keep + .2, T.front)));
function nightSite(g, t) {
  const b = pbuf('site', SITE_W, SITE_H);
  const L = nightL(t);
  drawSite(b, t, { L, light: .2, lamp: 'bulb', crew: t < T.keep ? 'idle' : 'work', foreman: 'sleep', ghost: false, ghostWall: t > T.keep + .4 });
  blit(g, 'site', 6);
  g.fillStyle = 'rgba(16,10,40,.25)'; g.fillRect(0, 0, W, H);
  siteLabels(g, t, { L, focusTag: win(t, T.front - .4, T.board, .2, .2), retTag: win(t, T.front - .4, T.board, .2, .2) }, 6);
  // Zzz
  for (let i = 0; i < 3; i++) { const u = ((t * .6 + i / 3) % 1); withAlpha(g, 1 - u, () => ptext(g, 'Z', 130 + u * 70 + i * 10, 1000 - u * 160, 36 + i * 12, C.white, { ol: C.ink, olw: 4 })); }
  ptag(g, 190, 150 * 6, '工头 · 多巴胺（睡着了）', 24, { fill: '#C9D3DE' });
  dialogBox(g, t, 'd3', portraitClawd({ hat: 'hard', eyes: 'wide' }), { tagFill: '#F2C230' });
  const kp = pop(t, T.keep + .5, .35);
  if (kp > 0 && t < T.front) { g.save(); g.translate(eyeBack(L) * 6 + 140, 820); g.scale(kp, kp); ptag(g, 0, 0, '那就接着干', 36, { fill: '#F2C230' }); g.restore(); }
  const fr = pop(t, T.front, .35);
  if (fr > 0) { g.save(); g.translate(540, 300); g.scale(fr, fr); ptag(g, 0, 0, '焦点跑到视网膜前面了', 48, { fill: C.red, col: C.white }); g.restore(); }
  // 正好的长度 vs 多长出来的一截
  const ga = win(t, T.keep + .5, T.board, .3, .2);
  if (ga > 0) withAlpha(g, ga, () => {
    const x0 = eyeBack(FOCUS_MM) * 6, x1 = eyeBack(L) * 6, y = (EYE_CY - EYE_RY - 4) * 6;
    ptext(g, '正好的长度', x0 - 10, y - 20, 24, '#FFE066', { align: 'right', ol: C.ink, olw: 3 });
    if (x1 - x0 > 12) {
      const yb = (EYE_CY + EYE_RY + 16) * 6 + 30;
      g.fillStyle = C.red; g.fillRect(x0, yb, x1 - x0, 8); g.fillRect(x0, yb - 20, 8, 28); g.fillRect(x1 - 8, yb - 20, 8, 28);
      ptext(g, `多长了 ${(L - FOCUS_MM).toFixed(1)} 毫米`, (x0 + x1) / 2, yb + 54, 36, C.red, { align: 'center', ol: C.ink, olw: 4 });
      ptext(g, '（放大示意）', (x0 + x1) / 2, yb + 96, 24, '#CFC6E8', { align: 'center', ol: C.ink, olw: 3 });
    }
  });
  const dp = pop(t, S('k7') + .1, .35);
  if (dp > 0 && t < T.board) { g.save(); g.translate(740, 420); g.scale(dp, dp); ptag(g, 0, 0, '每多长 1 毫米 ≈ 近视 300 度', 30, { fill: C.paper }); g.restore(); }
}

/* ================= 黑板糊了 → 书本屏幕 → 进化错配 ================= */
function boardBG() {
  return cached('boardBG', 135, 240, g => {
    pbands(g, 0, 135, [[0, '#DDE8D5'], [120, '#D0DEC6'], [130, '#D0DEC6']], 2);
    prect(g, 6, 20, 123, 66, '#7A5232'); prect(g, 9, 23, 117, 60, '#2F5D46');
    prect(g, 9, 80, 117, 3, '#25503B'); prect(g, 20, 83, 30, 2, '#E8E2D4');
    pbands(g, 0, 135, [[130, '#C89A68'], [240, '#AE8050']], 2);
  });
}
/* 黑板上的粉笔字（全分辨率，糊的时候整体模糊） */
function boardChalk(g, blur) {
  tmpG.setTransform(1, 0, 0, 1, 0, 0); tmpG.clearRect(0, 0, W, H);
  ptext(tmpG, '第 3 课 · 光从哪里来', 120, 280, 60, '#F4F1E6');
  ptext(tmpG, '太阳 ≈ 100 000 lx', 120, 380, 48, '#FFE9A8');
  ptext(tmpG, '灯泡 ≈ 300 lx', 120, 460, 48, '#BFE8FF');
  ptext(tmpG, '作业：P.42  第 1～6 题', 120, 580, 48, '#F4F1E6');
  tmpG.strokeStyle = '#FFE9A8'; tmpG.lineWidth = 8; tmpG.beginPath(); tmpG.arc(870, 400, 56, 0, TAU); tmpG.stroke();
  for (let i = 0; i < 8; i++) { const a = i * TAU / 8; tmpG.fillStyle = '#FFE9A8'; tmpG.fillRect(870 + Math.cos(a) * 86 - 6, 400 + Math.sin(a) * 86 - 6, 12, 12); }
  g.save(); if (blur > .2) g.filter = `blur(${blur}px)`; g.drawImage(tmpCv, 0, 0); g.restore();
}
function boardScene(g, t) {
  const b = pbuf('board', 135, 240);
  b.drawImage(boardBG(), 0, 0);
  // 前排同学的后脑勺（没有眼睛的小怪）
  for (const [x, tone] of [[2, 'blue'], [40, 'green'], [96, 'purple']]) drawClawd(b, x, 104, { col: TONES[tone], eyes: 'none' });
  prect(b, 0, 124, 135, 5, '#D9A56B'); prect(b, 0, 129, 135, 2, '#A87545'); prect(b, 0, 131, 135, 20, '#B8875A');
  blit(g, 'board', 8);
  const blur = lerp(0, 16, E.io(seg(t, T.blur - .3, T.blur + .3)));
  boardChalk(g, blur);
  if (blur > 1) {
    const qa = win(t, T.blur + .1, T.near, .2, .2);
    withAlpha(g, qa, () => { for (let i = 0; i < 3; i++) ptext(g, '?', 800 + i * 70, 800 - Math.abs(Math.sin(t * 5 + i)) * 30, 96, C.white, { ol: C.ink, olw: 8 }); });
  }
  // 书本和屏幕从天而降，落在桌上（全分辨率，放大画）
  const items = [[BOOKS, 90, 0, 10], [PHONE, 380, .35, 10], [TABLET, 560, .7, 10], [BOOKS, 800, 1.0, 10]];
  items.forEach(([f, x, d, k]) => {
    const u = clamp((t - T.near - .3 - d) / .4); if (u <= 0) return;
    const sp = f(), y = lerp(500, 992 - sp.height * k, E.bounce(u));
    g.save(); g.imageSmoothingEnabled = false; g.drawImage(sp, x, Math.round(y), sp.width * k, sp.height * k); g.restore();
  });
  dialogBox(g, t, 'd4', portraitClawd({ scarf: true, eyes: 'squint' }));
  // 近距离用眼：风险 +1
  const rp = pop(t, CK('k9', 1), .35);
  if (rp > 0 && t < T.mismatch) { g.save(); g.translate(540, 1110); g.scale(rp, rp); ptag(g, 0, 0, '一直盯着近处：风险 +1', 48, { fill: C.red, col: C.white }); g.restore(); }
  // 获得道具：近视眼镜
  itemGet(g, t, T.glasses, T.mismatch + .25, (g2, x, y) => {
    const c = clawd({ scarf: true, glasses: true, eyes: 'n' }); g2.imageSmoothingEnabled = false;
    g2.drawImage(c, x - 16 * 9, y - 22 * 9 + 40, CL_W * 9, CL_H * 9);
  }, '近视眼镜 -3.00D', '（这个道具，没人想要）', { y: 640 });
  // 进化错配：版本不兼容
  const mp = pop(t, T.mismatch + .1, .35), ma = win(t, T.mismatch, T.gz + .3, .05, .2);
  if (mp > 0 && ma > 0) withAlpha(g, ma, () => {
    g.fillStyle = 'rgba(10,8,24,.55)'; g.fillRect(0, 0, W, H);
    g.save(); g.translate(540, 700); g.scale(mp, mp);
    sysWindow(g, -470, -300, 940, 560, '⚠ 版本不兼容', { bar: '#D9443B' });
    const rows = [['施工手册', '旧石器版（几十万年前）', '#3B3363'], ['运行环境', '室内版（今天）', '#3B3363'], ['状态', '光照不够 → 不停工', '#D9443B']];
    rows.forEach(([a, v, col], i) => {
      const u = clamp((t - T.mismatch - .45 - i * .35) / .2); if (u <= 0) return;
      withAlpha(g, u, () => { ptext(g, a, -410, -130 + i * 100, 48, '#6B6488'); ptext(g, v, -160, -130 + i * 100, 48, col); });
    });
    g.restore();
    const cp = pop(t, T.mmWord, .4);
    if (cp > 0) { g.save(); g.translate(540, 300); g.scale(cp, cp); ptext(g, '进化错配', 0, 40, 144, C.amber, { align: 'center', ol: C.ink, olw: 10, sh: 1 }); g.restore(); }
  });
}

/* ================= 第二部分的 HUD 与叠加层 ================= */
function hudLater2(g, t) {
  if (t > T.sav && t < T.siteS + .1) {
    const lux = lerp(0, 60000, E.out(seg(t, T.lux - .5, T.lux + .1)));
    const items = [{ icon: (g, x, y) => iconSun(g, x, y), text: '草原 · 几十万年前' }];
    if (t > T.lux - .5) items.push({ right: true, text: `LUX ${fmt(lux)}`, col: C.gold, flash: win(t, T.lux, T.lux + .5, .05, .3) });
    hud(g, items, { alpha: win(t, T.sav, T.siteS + .1, .3, .2) });
  }
  if (t > T.siteS && t < T.rule + .1) {
    const L = lerp(22.4, FOCUS_MM, E.out(seg(t, T.siteS + .2, T.whistle)));
    hud(g, [{ icon: (g, x, y) => iconHat(g, x, y), text: '眼球工地 · 草原' }, { right: true, text: 'LUX 60,000', col: C.gold }, { right: true, text: `眼轴 ${L.toFixed(1)}mm` }], { alpha: win(t, T.siteS, T.rule + .1, .3, .2) });
  }
  if (t > T.indoor && t < T.roof) hud(g, [{ icon: (g, x, y) => iconBulb(g, x, y), text: '教室 · 周一' }, { right: true, text: 'LUX 300', col: '#9FD3FF' }], { alpha: win(t, T.indoor, T.roof, .3, .1) });
  if (t > T.autoexp && t < T.siteK + .1) hud(g, [{ icon: (g, x, y) => iconBulb(g, x, y), text: '教室 · 周一' }, { right: true, text: 'LUX 300', col: '#9FD3FF' }], { alpha: win(t, T.autoexp, T.siteK + .1, .2, .2) });
  if (t > T.siteK && t < T.board + .1) {
    const L = nightL(t), d = reserveOf(L);
    hud(g, [{ icon: (g, x, y) => iconHat(g, x, y), text: '眼球工地 · 夜班' }, { right: true, text: 'LUX 300', col: '#9FD3FF' },
      { right: true, text: `远视储备 ${d >= 0 ? '+' : ''}${d.toFixed(2)}D`, col: d < -.05 ? C.red : C.white, flash: win(t, T.front - .3, T.front + .4, .1, .3) }], { alpha: win(t, T.siteK, T.board + .1, .3, .2) });
  }
}
function overlays2(g, t) {
  vcr(g, t, T.rew - .05, T.sav + .35, 'rew', '倒带', '几十万年前');
  vcr(g, t, T.ff - .05, T.today + .55, 'ff', '快进', '今天');
}
