'use strict';
/* scenes1.js：开头（草原标题 → 北极回放 → 教室天花板）和眼球工地。 */

/* ---------------- 关键时刻（与 audio.py 的 T 一致） ---------------- */
const T = {
  d1: S('d1'), half: MK('h2'),
  arctic: S('h3') - .42, noPhone: CK('h3', 1), pct3: MK('h4', 0), pct50: MK('h4', 1),
  ceil: S('h5') - .38, ceilWord: S('h6'), dive: EN('h6') + .12,
  site: S('e1') - .55, behind: MK('e2'), crew: S('e3'), grow0: CK('e3', 1), onRet: MK('e3'),
  replay: S('e4') - .1, reserve: MK('e4'), useUp: S('e5'), stopSign: S('e5') + .9, d2: S('d2'), manual: S('e6'),
  rew: EN('e6') + .12, sav: S('s1') - .5, lux: MK('s2'), dopa: MK('s3'), siteS: S('s3') - .25, whistle: MK('s4'), rule: S('s5') - .2, ruleStamp: MK('s5'),
  lab: S('c1') - .55, goggles: S('c1') + .35, slow: MK('c1'), block: MK('c2', 0), fail: MK('c2', 1),
  ff: EN('c2') + .15, today: S('k1') - .4, indoor: S('k2') - .15, roof: S('k3') - .2, autoexp: S('k4') - .15, autoOn: MK('k4'), dusk: MK('k5'), realDark: S('k5'),
  siteK: S('d3') - .3, keep: S('k6'), front: MK('k7'), board: S('k8') - .2, blur: MK('k8'), d4: S('d4'), near: S('k9'), glasses: EN('k9') - 1.25, mismatch: S('k10') - .2, mmWord: MK('k10'),
  gz: S('g1') - .5, gzExp: S('g2'), forty: MK('g2'), years3: S('g3'), r395: MK('g3', 0), r304: MK('g3', 1), only40: S('g4'),
  guide: S('a1') - .5, twoH: MK('a1'), shade: MK('a2', 0), brighter: MK('a2', 1), kid: S('a3'), noUndo: MK('a3'),
  fin: S('d5') - .45, click: TY('d5') + .5, door: TY('d5') + .85, out: EN('d5') + .2, z1: S('z1'), sunWord: MK('z3'), blow: EN('z3') + .15, card: EN('z3') + 1.75,
};

/* ================= 草原（开头 + 第二幕共用） ================= */
/* 草原背景：w×h 世界像素，hy 为地平线 */
function savannaBG(w, h, hy) {
  return cached(`savBG${w}x${h}`, w, h, g => {
    pbands(g, 0, w, [[0, '#4FA9E8'], [Math.round(hy * .3), '#6CBDF2'], [Math.round(hy * .62), '#8FD0F7'], [Math.round(hy * .85), '#B5E2FA'], [hy - 4, '#D6F0FB'], [hy, '#D6F0FB']], 3);
    for (let x = 0; x < w; x++) {
      const h1 = 6 + Math.sin(x * .07) * 3 + Math.sin(x * .19 + 1) * 1.5, h2 = 3 + Math.sin(x * .11 + 2) * 2;
      prect(g, x, hy - h1, 1, h1, '#A9CFC0'); prect(g, x, hy + 1 - h2, 1, h2, '#8DBFA8');
    }
    pbands(g, 0, w, [[hy, '#E3C46A'], [hy + 18, '#D9B65C'], [hy + 42, '#CDA650'], [hy + 70, '#BF9746'], [h, '#BF9746']], 3);
    const r = R(5);
    for (let i = 0; i < w * 1.3; i++) { const x = r() * w, y = hy + 2 + r() * (h - hy); const c = r() < .5 ? '#B08A3A' : '#EBD283'; pdot(g, x, y, c); if (r() < .4) pdot(g, x, y - 1, c); }
    for (let i = 0; i < w * .25; i++) { const x = r() * w, y = hy + 10 + r() * (h - hy - 10); pline(g, x, y, x - 1, y - 3, '#9C7A30'); pline(g, x + 1, y, x + 2, y - 3, '#9C7A30'); pdot(g, x, y - 4, '#E8D08A'); }
    drawAcacia(g, Math.round(w * .13), hy + 5, .55);
    drawAcacia(g, Math.round(w * .84), hy + 3, .75);
    drawAcacia(g, Math.round(w * .55), hy + 1, .35);
  });
}
function drawSavanna(g, t, w, h, hy, o = {}) {
  g.drawImage(savannaBG(w, h, hy), 0, 0);
  for (let i = 0; i < 3; i++) { const x = ((i * 53 + t * (2 + i)) % (w + 40)) - 20; drawCloud(g, x, hy * .35 + i * hy * .18, .6 + i * .15); }
  if (o.sun !== false) drawSun(g, o.sunX ?? w * .85, o.sunY ?? 16, 9, t, { spin: true });
}
/* 脚下的影子 */
function feetShadow(g, x, y, w = 20) { g.save(); g.globalAlpha = .22; prect(g, x + 12 - w / 2, y, w, 1, '#000'); prect(g, x + 12 - w / 2 + 2, y + 1, w - 4, 1, '#000'); g.restore(); }

/* 开头：原始人站在石头上远眺 */
function hookSavanna(g, t) {
  const w = 108, h = 192, hy = 96, b = pbuf('hsav', w, h);
  drawSavanna(b, t, w, h, hy, { sunX: 96, sunY: 13 });
  // 远处的羚羊（清清楚楚）
  const ax = 92 - t * 2.2, ay = hy - 2 + (Math.floor(t * 8) % 2);
  pspr(b, ANTELOPE(), ax, ay);
  drawRock(b, 30, 122, 40, 15);
  // 原始人小怪：手搭凉棚
  drawClawd(b, 18, 92, { hat: 'bone', arms: 'upR', eyes: t % 2.6 < .1 ? 'blink' : 'r' });
  // 视线虚线
  const sa = win(t, .5, T.arctic, .3, .1);
  if (sa) { b.globalAlpha = sa; pline(b, 36, 95, ax, ay + 2, '#FFFFFF', 2, Math.floor(t * 10)); b.globalAlpha = 1; }
  // "你"：现代小怪从右边跳进来
  const kp = clamp((t - T.d1 + .1) / .35);
  if (kp > 0) {
    const ky = lerp(196, 104, E.back(kp));
    feetShadow(b, 74, 120);
    drawClawd(b, 74, ky, { scarf: true, arms: t > T.d1 + .3 && t < T.half ? 'upL' : 'n', eyes: t > T.half ? 'wide' : 'happy' }, true);
  }
  blit(g, 'hsav', 10);
  // 太阳光晕
  const gr = g.createRadialGradient(960, 130, 10, 960, 130, 520);
  gr.addColorStop(0, 'rgba(255,240,180,.5)'); gr.addColorStop(1, 'rgba(255,240,180,0)');
  g.fillStyle = gr; g.fillRect(0, 0, W, 900);
  // 大标题
  const tp = 1 + .02 * Math.sin(t * 4.5);
  g.save(); g.translate(540, 420); g.scale(tp, tp); g.rotate(-.03);
  ptext(g, '原始人为什么', 0, -96, 108, C.white, { align: 'center', ol: C.ink, olw: 9, sh: 1 });
  ptext(g, '不近视？', 0, 108, 192, C.amber, { align: 'center', ol: C.ink, olw: 12, sh: 1 });
  g.restore();
  withAlpha(g, win(t, .6, T.d1 + .2, .2, .2), () => ptag(g, 700, 870, '远处的羚羊：看得清', 36, { fill: C.green }));
  // 对话框（一直留到盖章之后）
  dialogBox(g, t, 'd1', portraitClawd({ scarf: true, eyes: 'happy' }), { extra: T.half + .75 - EN('d1') });
  if (t > T.half - .02) stamp(g, 800, 1385, '只对一半', clamp((t - T.half) / .5), { px: 60, rot: -.12 });
}

/* ================= 北极回放 ================= */
const ARC_W = 154, ARC_H = 274, ARC_HY = 82;
function arcticBG() {
  return cached('arcBG', ARC_W, ARC_H, g => {
    const hy = ARC_HY;
    pbands(g, 0, ARC_W, [[0, '#8EC5EC'], [30, '#A9D4F2'], [58, '#C8E5F8'], [hy - 4, '#E2F2FB'], [hy, '#E2F2FB']], 3);
    for (let x = 0; x < ARC_W; x++) {
      const h1 = 10 + Math.abs(Math.sin(x * .05)) * 9 + Math.sin(x * .17) * 2;
      prect(g, x, hy - h1, 1, h1, '#D3E6F3'); prect(g, x, hy - h1, 1, 1, '#F4FAFE');
      const h2 = 4 + Math.abs(Math.sin(x * .09 + 1)) * 5; prect(g, x, hy - h2, 1, h2, '#BBD6EA');
    }
    pbands(g, 0, ARC_W, [[hy, '#F6FBFE'], [hy + 40, '#EEF6FB'], [hy + 100, '#E4EFF7'], [hy + 160, '#D9E8F2'], [ARC_H, '#D9E8F2']], 3);
    const r = R(9);
    for (let i = 0; i < 110; i++) pdot(g, r() * ARC_W, hy + 2 + r() * (ARC_H - hy), r() < .5 ? '#FFFFFF' : '#C9DCEA');
    // 冰屋：雪砖 + 黑洞洞的门
    for (const [x, y] of [[20, hy + 6], [46, hy + 4]]) {
      pell(g, x, y - 6, 12, 9, '#9FB8CC'); pell(g, x, y - 6, 11, 8, '#FDFEFF');
      for (const yy of [-12, -8, -4]) prect(g, x - 10, y - 6 + yy + 5, 21, 1, '#C3D5E4');
      for (let k = 0; k < 6; k++) pdot(g, x - 9 + k * 4 + (k % 2), y - 9 + (k % 3) * 4, '#C3D5E4');
      pell(g, x + 8, y - 2, 4, 4, '#9FB8CC'); prect(g, x + 4, y - 2, 9, 4, '#FDFEFF'); pell(g, x + 9, y - 1, 2, 3, '#33415A'); prect(g, x + 7, y - 1, 5, 3, '#33415A');
      prect(g, x - 12, y + 2, 26, 1, '#C3D5E4');
    }
    // 学校
    const sx = 92, sy = hy + 6;
    prect(g, sx, sy - 24, 52, 24, '#9A6B42'); for (let k = 0; k < 24; k += 4) prect(g, sx, sy - 24 + k, 52, 1, '#7E5434');
    for (let i = 0; i <= 28; i++) prect(g, sx - 3 + i, sy - 24 - Math.floor(i * .6), 58 - i * 2, 1, '#B6402F');
    prect(g, sx + 23, sy - 48, 6, 9, '#9A6B42'); prect(g, sx + 21, sy - 51, 10, 3, '#B6402F'); pdisc(g, sx + 26, sy - 44, 2, '#E8B92E');
    for (const wx of [5, 37]) { prect(g, sx + wx, sy - 19, 10, 9, '#FFE9A8'); prect(g, sx + wx + 4, sy - 19, 1, 9, '#7E5434'); prect(g, sx + wx, sy - 15, 10, 1, '#7E5434'); }
    prect(g, sx + 21, sy - 14, 10, 14, '#5E3B22'); pdot(g, sx + 28, sy - 7, '#E8B92E');
    prect(g, sx - 2, sy, 56, 2, '#C9DCEA');
  });
}
function hookArctic(g, t) {
  const b = pbuf('arc', ARC_W, ARC_H);
  b.drawImage(arcticBG(), 0, 0);
  for (let i = 0; i < 40; i++) { const x = (hash(i) * 170 + t * (6 + hash(i, 2) * 8)) % 164 - 5, y = (hash(i, 1) * 290 + t * (14 + hash(i, 3) * 10)) % 284 - 5; pdot(b, x, y, '#FFFFFF'); }
  const xs = [5, 34, 65, 96, 125];
  xs.forEach((x, i) => { feetShadow(b, x, 116); drawClawd(b, x, 100, { hat: 'fur', brows: true, eyes: blinkEyes(t, i) }); });
  const gl = [true, false, true, true, false];
  xs.forEach((x, i) => {
    const on = gl[i] && t > T.pct50 + i * .07;
    feetShadow(b, x, 156);
    drawClawd(b, x, 140, { hat: 'fur', glasses: on, eyes: on ? 'n' : blinkEyes(t, i + 5) });
  });
  blit(g, 'arc', 7);
  // 标签
  const a1 = win(t, T.arctic + .4, 99, .25, 0);
  withAlpha(g, a1, () => { ptag(g, 50, 640, '老一辈', 36, { align: 'left', fill: '#C9D3DE' }); ptag(g, 50, 920, '下一代', 36, { align: 'left', fill: '#C9D3DE' }); });
  const p3 = pop(t, T.pct3), p50 = pop(t, T.pct50);
  if (p3 > 0) { g.save(); g.translate(820, 636); g.scale(p3, p3); ptext(g, '近视 <3%', 0, 20, 60, C.green, { align: 'center', ol: C.ink, olw: 6 }); g.restore(); }
  if (p50 > 0) { g.save(); g.translate(820, 916); g.scale(p50, p50); ptext(g, '近视 >50%', 0, 20, 60, C.red, { align: 'center', ol: C.ink, olw: 6 }); g.restore(); }
  // 还没有手机
  const np = pop(t, T.noPhone, .4), na = win(t, T.noPhone, T.pct3 + .3, 0, .25);
  if (np > 0 && na > 0) withAlpha(g, na, () => {
    g.save(); g.translate(330, 330); g.scale(np, np); g.imageSmoothingEnabled = false;
    g.drawImage(PHONE(), -48, -72, 96, 144);
    g.strokeStyle = C.red; g.lineWidth = 18; g.beginPath(); g.moveTo(-90, -90); g.lineTo(90, 90); g.moveTo(90, -90); g.lineTo(-90, 90); g.stroke();
    ptag(g, 0, 140, '手机：还没发明', 36, { fill: C.paper });
    g.restore();
  });
}

/* ================= 教室（正面：小怪们面朝镜头） ================= */
const CLS_W = 135, CLS_H = 300;   // 上面 60 行是天花板，用于镜头上摇
const KIDS = [ // [x, y, 颜色, 是否主角]
  [12, 150, 'blue'], [44, 150, 'green'], [76, 150, 'purple'], [108, 150, 'yellow'],
  [24, 198, 'pink'], [56, 198, 'base', true], [88, 198, 'teal'],
];
function classBG() {
  return cached('clsBG', CLS_W, CLS_H, g => {
    // 天花板
    pbands(g, 0, CLS_W, [[0, '#E8E2D4'], [52, '#DCD5C5'], [60, '#DCD5C5']], 2);
    for (let x = 0; x < CLS_W; x += 22) prect(g, x, 0, 1, 60, '#CFC7B5');
    for (let y = 12; y < 60; y += 14) prect(g, 0, y, CLS_W, 1, '#CFC7B5');
    for (const lx of [14, 76]) { prect(g, lx - 2, 26, 49, 6, '#BDB6A6'); prect(g, lx, 28, 45, 3, '#FFFDF0'); prect(g, lx, 31, 45, 1, '#E6E1CF'); }
    prect(g, 0, 60, CLS_W, 3, '#C8C0AE');
    // 墙
    pbands(g, 0, CLS_W, [[63, '#E3EDDA'], [160, '#D5E3CB'], [190, '#D5E3CB']], 2);
    prect(g, 0, 172, CLS_W, 18, '#B9CDAF'); prect(g, 0, 172, CLS_W, 1, '#9FB896');
    // 窗（右边，亮）
    prect(g, 104, 76, 28, 56, '#8A6B4A'); prect(g, 106, 78, 24, 52, '#CFEFFF');
    pbands(g, 106, 24, [[78, '#BFE8FF'], [110, '#E6F7FF'], [130, '#E6F7FF']], 2);
    prect(g, 117, 78, 2, 52, '#8A6B4A'); prect(g, 106, 103, 24, 2, '#8A6B4A');
    drawRoundTree(g, 124, 128, .55);
    // 公告栏
    prect(g, 10, 80, 40, 30, '#B78B5C'); prect(g, 12, 82, 36, 26, '#E7C9A0');
    prect(g, 15, 85, 12, 9, '#FFFFFF'); prect(g, 30, 86, 14, 7, '#FFE08A'); prect(g, 16, 97, 10, 8, '#BFE3FF'); prect(g, 30, 96, 13, 9, '#FFC7C7');
    pspr(g, CLOCK(), 63, 78);
    // 地板
    pbands(g, 0, CLS_W, [[190, '#C89A68'], [240, '#BB8C5B'], [300, '#AE8050']], 2);
    for (let y = 196; y < CLS_H; y += 9) prect(g, 0, y, CLS_W, 1, '#A87A4C');
  });
}
function drawDesk(g, x, y) { // (x,y) 桌面左上角
  prect(g, x, y, 30, 4, '#D9A56B'); prect(g, x, y + 4, 30, 1, '#A87545'); prect(g, x + 1, y + 5, 28, 9, '#B8875A');
  prect(g, x + 3, y + 14, 2, 8, '#7E8494'); prect(g, x + 25, y + 14, 2, 8, '#7E8494');
}
/* o.hero：主角的配置覆盖；o.dim 室内光；o.books 桌上的书本屏幕 */
function drawClassFront(g, t, o = {}) {
  g.drawImage(classBG(), 0, 0);
  KIDS.forEach(([x, y, tone, hero], i) => {
    const base = { col: TONES[tone], scarf: true, eyes: blinkEyes(t, i * 1.3) };
    if (o.glassesKids && o.glassesKids.includes(i)) base.glasses = true;
    const opt = hero ? Object.assign({ scarf: true, eyes: blinkEyes(t, 7) }, o.hero || {}) : base;
    drawClawd(g, x, y - 16 + (hero && o.heroBob ? Math.floor(t * 4) % 2 : 0), opt);
    drawDesk(g, x - 3, y - 2);
    if (hero && o.books) o.books(g, x, y);
  });
}
/* 开头第三段：镜头上摇到天花板，再钻进主角的眼睛 */
function hookCeiling(g, t) {
  const b = pbuf('cls', CLS_W, CLS_H);
  drawClassFront(b, t, { hero: { eyes: t > T.ceil + .6 ? 'up' : 'n' } });
  // 灯管闪烁
  const fl = .5 + .5 * Math.sin(t * 40) * (hash(Math.floor(t * 12)) > .85 ? 1 : 0);
  b.globalAlpha = .25 * fl; prect(b, 14, 28, 45, 3, '#FFFFFF'); b.globalAlpha = 1;
  // 先上摇到天花板，说完"天花板"再甩回主角，然后钻进他的眼睛
  const camY = t < T.ceilWord + .4 ? lerp(60, 6, E.io(seg(t, T.ceil + .3, T.ceilWord - .05))) : lerp(6, 60, E.io(seg(t, T.ceilWord + .4, T.dive - .1)));
  if (t > T.dive - .1) {
    const u = seg(t, T.dive - .1, T.site), z = Math.pow(150, E.in(u));
    const ex = 56 + 7, ey = 198 - 16 + 3;                     // 主角左眼（世界坐标）
    const sx0 = ex * 8, sy0 = (ey - 60) * 8;                  // 缩放前它在屏幕上的位置
    const cx = lerp(sx0, 540, E.io(u)), cy = lerp(sy0, 960, E.io(u)), P = 8 * z;
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    g.save(); g.imageSmoothingEnabled = false;
    g.drawImage(BUF.cls, cx - ex * P, cy - ey * P, CLS_W * P, CLS_H * P);
    g.restore();
    g.fillStyle = `rgba(0,0,0,${seg(t, T.site - .2, T.site)})`; g.fillRect(0, 0, W, H);
    return;
  }
  blit(g, 'cls', 8, 0, camY);
  // 灯光
  const la = 1 - camY / 60;
  if (la > 0) {
    for (const lx of [36, 98]) {
      const sy = (28 - camY) * 8, gr = g.createRadialGradient(lx * 8, sy, 10, lx * 8, sy, 380);
      gr.addColorStop(0, `rgba(255,253,230,${.5 * la})`); gr.addColorStop(1, 'rgba(255,253,230,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, 900);
    }
  }
  // 线索：天花板
  const cp = pop(t, T.ceilWord - .05, .45);
  if (cp > 0) {
    g.save(); g.translate(540, 520); g.scale(cp, cp);
    ptext(g, '天花板', 0, 40, 168, C.amber, { align: 'center', ol: C.ink, olw: 12, sh: 1 });
    g.restore();
    withAlpha(g, cp, () => {
      // 放大镜
      g.save(); g.translate(250, 330); g.rotate(-.5); g.strokeStyle = C.ink; g.lineWidth = 22; g.beginPath(); g.arc(0, 0, 70, 0, TAU); g.stroke();
      g.strokeStyle = C.white; g.lineWidth = 10; g.stroke(); g.fillStyle = C.ink; g.fillRect(64, -12, 110, 24); g.restore();
    });
  }
  const qa = win(t, T.ceil + .7, T.dive, .2, .1);
  if (qa) withAlpha(g, qa, () => { for (let i = 0; i < 3; i++) ptext(g, '?', 760 + i * 70, 760 - Math.abs(Math.sin(t * 5 + i)) * 30, 96, C.white, { ol: C.ink, olw: 8 }); });
}

/* ================= 眼球工地 =================
   侧剖面：左边是角膜和晶状体，右边是视网膜。眼轴（mm）→ 像素：4.2 px/mm。
   焦点固定在"正好的长度"23.5mm 处；施工队把后壁往右推。 */
const SITE_W = 180, SITE_H = 320, EYE_X0 = 18, EYE_CY = 112, EYE_RY = 46, MM = 4.2, FOCUS_MM = 23.5;
const MYO_X = 3;                                   // 超过 23.5mm 的部分放大 3 倍画（示意），否则 1 毫米只有几个像素
const eyeLen = L => L <= FOCUS_MM ? L * MM : FOCUS_MM * MM + (L - FOCUS_MM) * MM * MYO_X;
const eyeBack = L => EYE_X0 + eyeLen(L);
/* 剖面轮廓：前半是半圆，后半是半椭圆。inset 为向内收的像素（算内壁用） */
function eyeRow(L, dy, inset = 0) {
  const ry = EYE_RY - inset; if (Math.abs(dy) > ry) return null;
  const u = Math.sqrt(1 - dy * dy / (ry * ry));
  return [u * (EYE_RY - inset), u * Math.max(2, eyeLen(L) - EYE_RY - inset)];
}
const retX = L => eyeBack(L) - 4;          // 视网膜内表面（光轴上）
/* st：{L, light(0..1), lamp:'sun'|'bulb', foreman:'stand'|'blow'|'sleep', crew:'idle'|'work'|'stop'|'cheer'|'hidden', focusTag, ghost, retinaGlow, dopa(0..1), sign} */
function drawSite(g, t, st) {
  const L = st.L, light = st.light ?? 1, cx = EYE_X0 + EYE_RY, back = eyeBack(L);
  // 天空 / 背景（随光照明暗）
  const day = light;
  const top = day > .5 ? '#7CC8F2' : '#3B3F66', mid = day > .5 ? '#B9E4F8' : '#5A5A80';
  pbands(g, 0, SITE_W, [[0, top], [120, mid], [175, mid]], 3);
  if (day <= .5) { for (let i = 0; i < 30; i++) pdot(g, hash(i) * 180, hash(i, 1) * 120, '#8A8FC0'); }
  // 远处的城市剪影
  for (let x = 0; x < SITE_W; x += 9) { const hh = 10 + Math.floor(hash(x, 3) * 22); prect(g, x, 176 - hh, 8, hh, day > .5 ? '#A9CBE0' : '#4A4C72'); for (let k = 0; k < hh - 4; k += 4) if (hash(x, k) < .5) prect(g, x + 2 + (k % 2) * 3, 176 - hh + 2 + k, 2, 2, day > .5 ? '#C7E0EE' : '#FFE9A8'); }
  // 工地围挡和牌子
  prect(g, 0, 166, SITE_W, 10, day > .5 ? '#3E7FC1' : '#2A4F7A'); for (let x = 0; x < SITE_W; x += 12) prect(g, x, 166, 1, 10, day > .5 ? '#5D9AD6' : '#3A6390');
  // 地面
  pbands(g, 0, SITE_W, [[176, '#9A7552'], [196, '#8A6747'], [260, '#7A5A3E'], [320, '#6A4E36']], 3);
  for (let i = 0; i < 90; i++) pdot(g, hash(i, 9) * 180, 180 + hash(i, 8) * 140, hash(i, 7) < .5 ? '#B08A63' : '#6E5038');
  // 警示带
  for (let x = 0; x < SITE_W; x += 8) { prect(g, x, 200, 4, 2, '#F2C230'); prect(g, x + 4, 200, 4, 2, '#1B1730'); }
  // 光源
  if (st.lamp === 'bulb') {
    prect(g, 14, 0, 2, 34, '#555B6B'); pdisc(g, 15, 40, 5, '#FFF2A8'); prect(g, 11, 33, 9, 3, '#7E8494');
  } else drawSun(g, 22, 42, 10, t, { spin: true });
  // 托架
  prect(g, cx - 18, EYE_CY + 38, 3, 138 - EYE_CY, '#8A5A35'); prect(g, cx + 14, EYE_CY + 38, 3, 138 - EYE_CY, '#8A5A35');
  prect(g, cx - 24, EYE_CY + 44, 46, 3, '#A8743F');
  // —— 眼球 ——
  for (let dy = -EYE_RY; dy <= EYE_RY; dy++) {
    const o = eyeRow(L, dy), y = EYE_CY + dy;
    prect(g, Math.round(cx - o[0]), y, Math.round(o[0] + o[1]) + 1, 1, dy > EYE_RY * .55 ? '#D9D2C8' : '#F4F1EC');   // 巩膜
    const n = eyeRow(L, dy, 4); if (!n) continue;
    const i0 = Math.round(cx - n[0]), i1 = Math.round(cx + n[1]);
    prect(g, i0, y, i1 - i0 + 1, 1, day > .5 ? '#D4F1F7' : '#9FBFD0');                                  // 玻璃体
    if (i1 > cx) { prect(g, Math.max(cx, i1 - 2), y, Math.min(3, i1 - cx + 1), 1, st.retinaGlow ? '#FF9A72' : '#E8735A'); pdot(g, i1 + 1, y, '#8C3B2E'); }  // 视网膜、脉络膜
  }
  // 正好的长度（23.5mm）的后壁：虚线
  if (st.ghostWall) {
    for (let dy = -EYE_RY + 2; dy <= EYE_RY - 2; dy++) { const o = eyeRow(FOCUS_MM, dy); if (o && (dy & 2)) pdot(g, Math.round(cx + o[1]), EYE_CY + dy, '#FFE066'); }
  }
  // 视网膜血管
  for (let dy = -38; dy <= 38; dy += 3) { const n = eyeRow(L, dy, 4); if (n && hash(dy + 50) < .6) pdot(g, Math.round(cx + n[1]) - 1, EYE_CY + dy, '#B84A3A'); }
  // 角膜、虹膜、晶状体
  for (let dy = -22; dy <= 22; dy++) { const x = cx - EYE_RY - 3 + Math.round(dy * dy / 120); pdot(g, x, EYE_CY + dy, '#BFE9FF'); pdot(g, x + 1, EYE_CY + dy, '#E6F7FF'); }
  prect(g, EYE_X0 + 6, EYE_CY - 24, 3, 12, '#4A86E8'); prect(g, EYE_X0 + 6, EYE_CY + 13, 3, 12, '#4A86E8');
  prect(g, EYE_X0 + 6, EYE_CY - 24, 3, 2, '#2F5FB0'); prect(g, EYE_X0 + 6, EYE_CY + 23, 3, 2, '#2F5FB0');
  pell(g, EYE_X0 + 14, EYE_CY, 4, 13, '#9FD3EA'); pell(g, EYE_X0 + 14, EYE_CY, 3, 12, '#EAF8FF');
  // 视神经
  const nx = back + 1, ny = EYE_CY + 10;
  prect(g, nx, ny - 3, 20, 7, '#F2D08A'); prect(g, nx, ny + 3, 20, 1, '#C9A55E'); prect(g, nx + 16, ny - 3, 7, 60, '#F2D08A'); prect(g, nx + 22, ny - 3, 1, 60, '#C9A55E');
  // —— 光线 ——
  const ra = st.raysA ?? 1, rx = retX(L), fx2 = retX(FOCUS_MM), lx = EYE_X0 + 14;
  if (ra > 0) {
    const col = light > .5 ? '#FFE066' : '#C9B86A';
    for (const oy of [-13, 0, 13]) {
      pline(g, 0, EYE_CY + oy, lx, EYE_CY + oy, col);
      if (rx <= fx2) {
        const u = (rx - lx) / (fx2 - lx);
        pline(g, lx, EYE_CY + oy, rx, EYE_CY + oy * (1 - u), col);
        if (st.ghost && oy) pline(g, rx, EYE_CY + oy * (1 - u), fx2, EYE_CY, col, 2, Math.floor(t * 8));
      } else {
        pline(g, lx, EYE_CY + oy, fx2, EYE_CY, col);
        pline(g, fx2, EYE_CY, rx, EYE_CY - oy * (rx - fx2) / (fx2 - lx), col);   // 焦点之后又散开
      }
    }
    for (let i = 0; i < 6; i++) { const u = ((t * .9 + i / 6) % 1); pdot(g, u * lx, EYE_CY + [-13, 0, 13][i % 3], '#FFFFFF'); }
    // 视网膜上的光斑：离焦越多越大
    const r = Math.round(13 * Math.abs(rx - fx2) / (fx2 - lx));
    if (r <= 0) pdisc(g, rx, EYE_CY, 2, '#FFFFFF');
    else { g.globalAlpha = .75; prect(g, rx - 1, EYE_CY - r, 3, r * 2 + 1, '#FFF6B8'); g.globalAlpha = 1; }
    if (st.ghost && rx < fx2) { pspr(g, STAR4(), fx2 - 2, EYE_CY - 2); }
    if (st.focusStar && Math.abs(rx - fx2) < 1.5) pspr(g, STAR4(), fx2 - 2, EYE_CY - 2);
  }
  // 多巴胺粒子
  if (st.dopa > 0) {
    for (let i = 0; i < 26; i++) {
      const u = ((t * .5 + hash(i)) % 1) * st.dopa, a = hash(i, 4) * TAU;
      const px = back - 4 - u * 34 * (.5 + hash(i, 2)), py = EYE_CY + Math.sin(a) * (10 + u * 26);
      pdot(g, px, py, i % 2 ? '#B6FF6B' : '#FFE066'); if (i % 3 === 0) pdot(g, px + 1, py, '#FFFFFF');
    }
  }
  // 标尺
  const ry = EYE_CY + EYE_RY + 8;
  prect(g, EYE_X0, ry, back - EYE_X0 + 1, 2, '#FFFFFF');
  for (let mm = 0; mm <= L; mm++) prect(g, EYE_X0 + Math.round(eyeLen(mm)), ry - (mm % 5 === 0 ? 3 : 1), 1, mm % 5 === 0 ? 3 : 1, '#FFFFFF');
  prect(g, back, ry - 4, 1, 6, C.amber);
  // —— 施工队 ——
  const crew = st.crew || 'idle';
  if (crew !== 'hidden') {
    const spots = [[back + 4, 160], [back + 8, 186], [back + 30, 186]];
    // 脚手架
    prect(g, back + 2, 176, 30, 2, '#A8743F'); prect(g, back + 4, 176, 2, 22, '#8A5A35'); prect(g, back + 28, 176, 2, 22, '#8A5A35');
    spots.forEach(([x, y], i) => {
      const hit = crew === 'work' && (Math.floor(t * 6 + i * 2) % 4 < 2);
      const eyes = crew === 'cheer' ? 'happy' : crew === 'stop' ? (i === 1 ? 'happy' : 'n') : blinkEyes(t, i + 3, 'l');
      const arms = crew === 'cheer' ? 'up' : (crew === 'work' && hit ? 'upL' : 'n');
      const bob = crew === 'cheer' ? (Math.floor(t * 6 + i) % 2) * 2 : 0;
      drawClawd(g, x, y - 16 - bob, { hat: 'hard', eyes, arms }, true);
      if (crew === 'work') pspr(g, hit ? HAMMER_DN() : HAMMER_UP(), x - 6, y - 12 - (hit ? 0 : 4), true);
      if (crew === 'stop' && i === 2) { pspr(g, HAMMER_DN(), x + 6, y - 2); }
    });
  }
  // —— 工头（多巴胺） ——
  const fm = st.foreman;
  if (fm) {
    const x = 4, y = 186;
    prect(g, x + 26, 150, 2, 36, '#6B7180'); pdisc(g, x + 27, 146, 7, '#2B2547'); pdisc(g, x + 27, 146, 5, '#F4F1EC');
    const needle = (st.light ?? 1) * 1.6 - .8 + Math.sin(t * 9) * .03;
    pline(g, x + 27, 146, x + 27 + Math.round(Math.sin(needle) * 4), 146 - Math.round(Math.cos(needle) * 4), C.red);
    if (fm === 'sleep') {
      prect(g, x - 2, y - 10, 28, 3, '#8A5A35'); prect(g, x, y - 7, 2, 7, '#8A5A35'); prect(g, x + 22, y - 7, 2, 7, '#8A5A35'); prect(g, x - 2, y - 26, 3, 16, '#8A5A35');
      drawClawd(g, x, y - 16 - 7, { hat: 'boss', vest: true, eyes: 'shut', arms: 'dn' });
      pspr(g, WHISTLE(), x + 30, y - 12);
    } else {
      const blow = fm === 'blow';
      drawClawd(g, x, y - 16, { hat: 'boss', vest: true, eyes: blow ? 'squint' : blinkEyes(t, 9), arms: blow ? 'upR' : 'n' });
      if (blow) { pspr(g, WHISTLE(), x + 11, y - 12); }
      else pspr(g, WHISTLE(), x + 22, y - 9);
    }
  }
  // 停工牌
  if (st.sign) { const sx = 142, sy = 186; prect(g, sx + 6, sy - 20, 2, 20, '#6B7180'); pdisc(g, sx + 7, sy - 26, 8, '#FFFFFF'); pdisc(g, sx + 7, sy - 26, 7, '#E5322D'); prect(g, sx + 2, sy - 27, 11, 2, '#FFFFFF'); }
  // 锥桶
  pspr(g, CONE(), 70, 190); pspr(g, CONE(), 108, 191);
}
/* 工地上的屏幕文字（全分辨率） */
function siteLabels(g, t, st, P = 6) {
  const fx = retX(FOCUS_MM), back = eyeBack(st.L);
  if (st.focusTag) withAlpha(g, st.focusTag, () => {
    const x = fx * P, y = (EYE_CY - 18) * P;
    ptext(g, '焦点', x, y - 36, 48, C.gold, { align: 'center', ol: C.ink, olw: 6 });
    g.fillStyle = C.gold; for (let i = 0; i < 4; i++) g.fillRect(x - 6 + (i % 2) * 0, y - 6 + i * 14, 12, 8);
  });
  if (st.retTag) withAlpha(g, st.retTag, () => ptext(g, '视网膜', (back + 3) * P, (EYE_CY - EYE_RY + 2) * P, 36, '#FFB3A0', { align: 'center', ol: C.ink, olw: 5 }));
  // 眼轴读数
  ptext(g, `${st.L.toFixed(1)} mm`, (EYE_X0 + (back - EYE_X0) / 2) * P, (EYE_CY + EYE_RY + 20) * P, 36, C.white, { align: 'center', ol: C.ink, olw: 4 });
}
/* 名牌：在世界坐标 (x,y) 上方 */
function nameTag(g, x, y, s, P = 6, col = C.amber) { ptag(g, x * P, y * P, s, 24, { fill: col }); }

/* 眼球工地这一幕：e1–e6 */
const siteL = t => {
  let L = 16.5;
  L = lerp(L, FOCUS_MM, E.io(seg(t, T.grow0, T.onRet)));
  // 回放：退回出生时的长度，再一口气长回来
  const back1 = E.io(seg(t, T.replay, T.replay + .55)), fwd = E.io(seg(t, T.useUp, T.useUp + 1.1));
  if (t > T.replay) L = lerp(FOCUS_MM, 16.5, back1);
  if (t > T.useUp) L = lerp(16.5, FOCUS_MM, fwd);
  return L;
};
function reserveOf(L) { return L <= FOCUS_MM ? (FOCUS_MM - L) * 3 / 7 : -(L - FOCUS_MM) * 3; }   // 示意：出生 +3.00D，23.5mm 用完；再多长 1mm 约 -3.00D（300 度）
function eyeSite(g, t) {
  const b = pbuf('site', SITE_W, SITE_H);
  const L = siteL(t);
  const crew = t < T.crew + .3 ? 'hidden' : (t > T.onRet && t < T.replay) || t > T.useUp + 1.1 ? 'stop' : (t > T.grow0 - .1 ? 'work' : 'idle');
  drawSite(b, t, {
    L, light: 1, lamp: 'sun', crew, ghost: t > T.behind - .2 && t < T.grow0 + .4 || (t > T.replay && t < T.useUp + .5), focusStar: t > T.onRet - .1,
    sign: t > T.stopSign, foreman: null,
  });
  // 开工：小怪们从地下冒出来
  blit(g, 'site', 6);
  siteLabels(g, t, { L, focusTag: win(t, T.behind - .1, T.grow0, .2, .2) + win(t, T.replay + .3, T.useUp + .3, .2, .2), retTag: win(t, T.behind + .3, T.grow0 + 1, .2, .3) }, 6);
  // 对焦成功
  const okp = pop(t, T.onRet, .4), oka = win(t, T.onRet, T.replay, 0, .2);
  if (okp > 0 && oka > 0) withAlpha(g, oka, () => { g.save(); g.translate(retX(FOCUS_MM) * 6, (EYE_CY - 30) * 6); g.scale(okp, okp); ptag(g, 0, 0, '✓ 对焦成功', 36, { fill: C.green }); g.restore(); });
  // 远视储备：括号标出"还没长够的这一截"
  const ra = win(t, T.replay + .45, T.useUp + .9, .2, .25);
  if (ra > 0) withAlpha(g, ra, () => {
    const x0 = retX(L) * 6, x1 = retX(FOCUS_MM) * 6, y = (EYE_CY + EYE_RY + 16) * 6 + 40;
    if (x1 - x0 > 8) {
      g.fillStyle = C.amber; g.fillRect(x0, y, x1 - x0, 8); g.fillRect(x0, y - 24, 8, 32); g.fillRect(x1 - 8, y - 24, 8, 32);
      ptext(g, '还没长够的这一截', (x0 + x1) / 2, y + 66, 36, C.amber, { align: 'center', ol: C.ink, olw: 4 });
    }
  });
  // 开工牌
  const kp = pop(t, T.crew, .35), ka = win(t, T.crew, T.grow0 + 1.2, 0, .25);
  if (kp > 0 && ka > 0) withAlpha(g, ka, () => { g.save(); g.translate(780, 520); g.scale(kp, kp); g.rotate(.06); pbox(g, -170, -60, 340, 120, { k: 6, fill: '#F2C230', rim: C.ink }); ptext(g, '开工！', 0, 22, 72, C.ink, { align: 'center' }); g.restore(); });
  // 远视储备 概念卡
  conceptCard(g, t, T.reserve - .05, T.useUp + .3, '远视储备', 'HYPEROPIC RESERVE', ['出生时的眼球偏短：{约 +2.50～+3.00D}', '随着眼球变长，一点点{用掉}'], { top: 205 });
  // 停工牌文字
  const sp = pop(t, T.stopSign, .3);
  if (sp > 0 && t < T.manual + .3) { g.save(); g.translate(149 * 6, 160 * 6 - 40); g.scale(sp, sp); ptext(g, '停工', 0, 0, 36, C.white, { align: 'center', ol: C.ink, olw: 4 }); g.restore(); }
  // 对话
  dialogBox(g, t, 'd2', portraitClawd({ hat: 'hard', eyes: 'squint' }), { tagFill: '#F2C230' });
  // 施工手册从天而降
  const mp = clamp((t - T.manual) / .45);
  if (mp > 0) {
    const y = lerp(-300, 760, E.bounce(mp));
    g.save(); g.translate(540, y); g.rotate(-.05);
    drawManualBook(g, 0, 0, 1, t);
    g.restore();
    if (mp >= 1) for (let i = 0; i < 10; i++) { const u = clamp((t - T.manual - .45) / .8); if (u < 1) { g.fillStyle = `rgba(220,200,170,${.6 * (1 - u)})`; g.fillRect(540 + Math.cos(i) * (180 + u * 160) - 10, 960 + Math.sin(i * 2) * 30 - u * 40, 20, 20); } }
  }
}
/* 施工手册：一本旧石器风格的石板书（全分辨率像素风） */
function drawManualBook(g, x, y, s = 1, t = 0) {
  g.save(); g.translate(x, y); g.scale(s, s);
  const k = 10;
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-22 * k + 20, -15 * k + 20, 44 * k, 30 * k);
  g.fillStyle = '#5E5046'; g.fillRect(-22 * k, -15 * k, 44 * k, 30 * k);
  g.fillStyle = '#8C7A6B'; g.fillRect(-21 * k, -14 * k, 42 * k, 28 * k);
  g.fillStyle = '#A8968A'; g.fillRect(-21 * k, -14 * k, 42 * k, 3 * k);
  g.fillStyle = '#6E6056'; for (let i = 0; i < 9; i++) g.fillRect((-18 + i * 4.3) * k, (10 + (i % 3)) * k, 2 * k, k);
  g.fillStyle = '#C2B3A8'; g.fillRect(-21 * k, -14 * k, k, 28 * k);
  ptext(g, '眼球施工手册', 0, -2 * k, 72, '#FFF4DF', { align: 'center', sh: 1 });
  ptext(g, '旧石器版 · 第 1 版', 0, 6 * k, 36, '#E8D9C2', { align: 'center' });
  g.restore();
}
