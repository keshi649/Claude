'use strict';
/* scenes4.js：间奏（她睡着了、软木板上的照片、爬上天台）和第二段副歌（星空里的字）。 */

/* ---------------- 间奏 A：她趴在桌上睡着了（129.0–140.0） ---------------- */
function shotSleep(t, T, lt) {
  const D = ROOM.desk;
  const cam = { x: 84 + lt * .7, y: 44, k: 1.75 };
  // 毯子：Clawd 从桌子右边拖过来（131–134.6），盖到她背上（134.6–135.6）
  const drag = E.io(seg(t, 131.0, 134.6)), lay = E.io(seg(t, 134.6, 135.6));
  // 关灯：Clawd 走到台灯旁（135.8–137.4），跳起来按开关（137.6）
  const walk2 = E.io(seg(t, 135.8, 137.4)), off = seg(t, 137.6, 137.9);
  const lampOn = 1 - off;
  layer(g => {
    room(g, t, { tod: 0, moon: true });
    roomDesk(g, t, { lamp: lampOn, screen: .25 });
    // 她：趴着睡
    girl(g, 120, ROOM.floor - 2, 'sleep', { t });
    // 毯子
    const bx = lerp(212, 140, drag), by = D;
    if (lay < 1) { rect(g, bx - 9, by - 4 - rd(lay * 8), 18, 4, '#7d93c4'); rect(g, bx - 9, by - 4 - rd(lay * 8), 18, 1, '#97abd6'); dith(g, bx - 8, by - 3 - rd(lay * 8), 16, 2, '#6d82b3'); }
    if (lay > 0) { g.save(); g.globalAlpha *= lay; blanketOn(g, D); g.restore(); }
    // Clawd
    let cx = 222, cy = D, o = { u: 2, t, eyes: 'n', look: -1 };
    if (t >= 131.0 && t < 134.6) { cx = bx + 13; o.walk = t * 3; o.armL = 1; o.eyes = 'squint'; }
    else if (t >= 134.6 && t < 135.8) { cx = 153; o.eyes = 'happy'; }
    else if (t >= 135.8) { cx = lerp(153, 238, walk2); o.walk = walk2 > 0 && walk2 < 1 ? t * 3 : undefined; o.look = 1; if (t > 137.3 && t < 137.9) { o.hop = Math.sin(seg(t, 137.3, 137.9) * Math.PI) * 6; o.armR = 2; } if (t > 138.2) { o.look = -1; o.eyes = 'closed'; } }
    else if (t < 131.0) { cx = 222; o.eyes = t > 130 ? 'n' : 'up'; }
    clawd(g, cx, cy, o);
    // 睡着的 z
    for (let k = 0; k < 3; k++) { const ph = (t * .5 + k / 3) % 1; ptext(g, 'z', 126 + ph * 8, D - 30 - ph * 14, 'rgba(240,240,255,' + (Math.sin(ph * Math.PI) * .8).toFixed(2) + ')', { size: 10 }); }
  }, cam);
  roomLight(cam, t, { lamp: lampOn, screen: [186, D - 10], screenA: .3 });
  if (off > 0) shafts([{ x: 520, w: 260, a: .16 * off, col: '#a8c4ff' }, { x: 900, w: 140, a: .1 * off, col: '#a8c4ff' }], -.35, 16);
  bloom(.34, 1.12);
  dust(t, 18, 61, { a: .25, col: off > .5 ? '#cfe0ff' : '#fff4dc' });
  vignette(.58);
}

/* ---------------- 间奏 B：月光照着软木板上的照片（140.0–149.0） ---------------- */
function polaroid(g, x, y, kind, cap, t, a = 1) {
  g.save(); g.globalAlpha *= a;
  rect(g, x + 2, y + 2, 34, 38, 'rgba(40,25,15,.4)');
  rect(g, x, y, 34, 38, '#f4f1ea'); rect(g, x + 3, y + 3, 28, 24, '#2a2a36');
  const X = x + 3, Y = y + 3;
  g.save(); g.beginPath(); g.rect(X, Y, 28, 24); g.clip();
  if (kind === 'cross') { rect(g, X, Y, 28, 24, '#efe6d5'); for (let i = 0; i < 4; i++) { rect(g, X + 2 + i * 6, Y + 4, 5, 5, '#d2473b'); rect(g, X + 3 + i * 6, Y + 5, 3, 3, '#efe6d5'); } clawd(g, X + 14, Y + 20, { u: 1, t, noShadow: true, eyes: 'wide' }); }
  if (kind === 'xray') { rect(g, X, Y, 28, 24, '#cfe3e8'); clawd(g, X + 14, Y + 20, { u: 1, t, col: '#e8a04a', noShadow: true }); rect(g, X + 13, Y + 14, 2, 2, '#ff4f86'); }
  if (kind === 'claw') { rect(g, X, Y, 28, 24, '#ff8fb5'); rect(g, X + 3, Y + 6, 22, 14, '#c9e9f4'); plushToy(g, X + 10, Y + 19, 'heart', t); rect(g, X + 18, Y + 6, 1, 6, '#888'); }
  if (kind === 'receipt') { rect(g, X, Y, 28, 24, '#e9ece8'); for (let i = 0; i < 28; i++) rect(g, X + i, Y + 8 + rd(Math.sin(i * .4) * 3), 1, 6, '#fbfaf6'); clawd(g, X + 20, Y + 22, { u: 1, t, noShadow: true, eyes: 'sad' }); }
  if (kind === 'stairs') { rect(g, X, Y, 28, 24, '#3a3070'); for (let i = 0; i < 5; i++) rect(g, X + 2 + i * 5, Y + 18 - i * 3, 5, 4, BOOKC[i]); disc(g, X + 24, Y + 4, 2, '#f8f0d0'); }
  if (kind === 'rain') { rect(g, X, Y, 28, 24, '#7d8ca2'); for (let i = 0; i < 8; i++) px(g, X + 2 + i * 3, Y + 3 + (i * 7) % 12, '#cfe0f0'); clearUmbrella(g, X + 14, Y + 15, t); clawd(g, X + 14, Y + 22, { u: 1, t, noShadow: true, eyes: 'closed' }); }
  if (kind === 'sprout') { rect(g, X, Y, 28, 24, '#3a4060'); pot(g, X + 14, Y + 26, t, 1.4); }
  g.restore();
  ptext(g, cap, x + 17, y + 27, '#4a3a2a', { size: 10, align: 'c' });
  rect(g, x + 15, y - 2, 4, 4, '#d9473f'); px(g, x + 16, y - 1, '#ff8a80');
  g.restore();
}
function shotBoard(t, T, lt) {
  const cam = { x: lerp(-10, 80, E.sine(seg(t, 140.0, 149.0))), y: 0, k: 1.5 };
  const pin = E.out(seg(t, 146.4, 147.4));
  layer(g => {
    // 软木板（特写）
    rect(g, -40, -20, 360, 160, '#8d6a4a'); rect(g, -36, -16, 352, 152, '#c79b6a'); dith(g, -34, -14, 348, 148, '#b98d5e');
    for (let k = 0; k < 40; k++) px(g, -34 + hash(k, 1) * 348, -14 + hash(k, 2) * 148, '#a87d50');
    const P = [['cross', '谜', 4, 12], ['xray', '看透', 46, 20], ['claw', '没夹到', 88, 8], ['receipt', '太长了', 130, 22], ['stairs', '太高了', 172, 10], ['rain', '透明的', 214, 22]];
    P.forEach(([k, c, x, y], i) => polaroid(g, x, y + rd(Math.sin(i * 2.1) * 2), k, c, t));
    // 第七张：Clawd 把今天的照片钉上去
    const nx = 256, ny = lerp(80, 12, pin);
    if (t > 145.0) polaroid(g, nx, ny, 'sprout', '发芽了', t, seg(t, 145.0, 145.4));
    clawd(g, nx + 17, ny + 58 - (pin < 1 ? 0 : 0), { u: 2, t, eyes: pin >= 1 ? 'happy' : 'n', armL: t > 145.0 ? 2 : 0, armR: t > 145.0 ? 2 : 0, look: -1, noShadow: true, blush: pin >= 1 ? 1 : 0 });
    // 月光照出的窗格影子
  }, cam);
  shafts([{ x: 200 + lt * 30, w: 300, a: .2, col: '#b8ccff' }, { x: 760 + lt * 30, w: 300, a: .2, col: '#b8ccff' }], .25, 12);
  grade('#3a4a8a', .45, 'soft-light');
  grade('#8a96c8', .35, 'multiply');
  bloom(.28, 1.1);
  dust(t, 20, 71, { a: .3, col: '#dce6ff' });
  vignette(.55);
}

/* ---------------- 间奏 C：顺着空调外机爬上天台（149.0–156.0） ---------------- */
function building(g, t) {
  rect(g, 40, -60, 240, 260, '#4a4e6a'); rect(g, 40, -60, 240, 2, '#5c6080');
  for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) {
    const x = 56 + i * 56, y = -40 + j * 46, lit = hash(i, j) > .55 || (i === 1 && j === 2);
    rect(g, x, y, 30, 26, '#2a2c40'); rect(g, x + 2, y + 2, 26, 22, lit ? (i === 1 && j === 2 ? '#8a9ad8' : '#e8c98a') : '#3a3e5a');
    rect(g, x - 2, y + 26, 34, 2, '#5c6080');
    if (j < 3) { rect(g, x + 32, y + 18, 12, 9, '#c9ccd6'); rect(g, x + 33, y + 19, 6, 6, '#8a8f9c'); }
  }
  rect(g, 30, -66, 260, 6, '#5c6080');
}
function shotClimb(t, T, lt) {
  const u = seg(t, 149.0, 156.0);
  const cam = { x: 40, y: lerp(70, -90, E.io(u)), k: 1 };
  layer(g => skyNight(g, t, { seed: 41, n: 140 }), cam, { par: .25 });
  layer(g => {
    building(g, t);
    // Clawd：从她的窗户爬出来，踩着空调外机一层层往上跳，最后翻上天台
    const steps = [[100, 64], [114, 46], [158, 18], [170, 0], [214, -28], [226, -46], [200, -66]];
    const k = Math.min(steps.length - 2, fl(u * (steps.length - 1)));
    const f = u * (steps.length - 1) - k, a = steps[k], b = steps[k + 1];
    const cx = lerp(a[0], b[0], E.io(f)), cy = lerp(a[1], b[1], E.io(f)) - Math.sin(f * Math.PI) * 10;
    clawd(g, cx, cy, { u: 1, t, eyes: 'n', look: b[0] > a[0] ? 1 : -1, noShadow: true, armL: 1, armR: 1 });
  }, cam);
  layer(g => { for (let i = 0; i < 3; i++) { const y = -100 + i * 70 + lerp(70, -90, E.io(u)) * .6; line(g, -10, y, 340, y + 20, '#2a2a35'); } }, cam, { par: 1.4, blur: 2, alpha: .7 });
  grade('#2a3470', .3, 'soft-light');
  bloom(.34, 1.12);
  vignette(.55);
}

/* ---------------- 天台 + 星空（156.0–196.2） ----------------
   世界坐标：天台地面 F=140，Clawd 躺在 x=320，她坐在 x=78。 */
function milkyWay(g, t, x0, x1) {
  // 一条斜着的银河：密密的小点（学原片的星空）
  const r = R(91);
  for (let i = 0; i < 1400; i++) {
    const u = r(), x = lerp(x0, x1, u), band = (x - x0) * -.32 + 40, y = band + (r() + r() + r() - 1.5) * 34;
    const tw = .5 + .5 * Math.sin(t * (1 + r() * 2) + i);
    if (tw > .3) px(g, x, y, r() > .85 ? '#e8ecff' : r() > .5 ? '#8c96d8' : '#5f68b8');
  }
}
function skyRoof(g, t) {
  bands(g, -60, -100, 680, 260, ['#0c1236', '#111842', '#151f50', '#1a2560', '#212c6a', '#2a3070']);
  milkyWay(g, t, -60, 620);
  const r = R(17);
  for (let i = 0; i < 160; i++) { const x = -60 + r() * 680, y = -100 + r() * 220, tw = (Math.sin(t * (1 + r() * 3) + i * 1.7) + 1) / 2; if (tw > .2) px(g, x, y, r() > .8 ? '#ffffff' : '#c9d2ff'); if (r() > .94 && tw > .6) { px(g, x - 1, y, 'rgba(255,255,255,.5)'); px(g, x + 1, y, 'rgba(255,255,255,.5)'); px(g, x, y - 1, 'rgba(255,255,255,.5)'); px(g, x, y + 1, 'rgba(255,255,255,.5)'); } }
}
function roofTop(g, t, F = 140) {
  rect(g, -60, F, 680, 30, '#2e3046'); rect(g, -60, F, 680, 1, '#45485f');
  rect(g, -60, F - 7, 680, 3, '#3a3d55'); for (let i = -60; i < 620; i += 12) rect(g, i, F - 7, 2, 7, '#3a3d55');
  // 天台门（左边）、水塔（右边）
  rect(g, 4, F - 40, 34, 40, '#3f4260'); rect(g, 10, F - 34, 18, 34, '#2a2c40'); rect(g, 4, F - 42, 34, 3, '#55587a');
  rect(g, 430, F - 46, 30, 32, '#4a4e6a'); rect(g, 426, F - 50, 38, 5, '#3a3d55'); rect(g, 434, F - 14, 3, 14, '#2a2c40'); rect(g, 452, F - 14, 3, 14, '#2a2c40');
}
/* 星座一样的字：字和字之间连一条细线，字旁边一颗亮星 */
function constellation(g, chars, times, pts, t, o = {}) {
  const col = o.col || '#d6e2ff';
  let last = null;
  chars.forEach((ch, k) => {
    const t0 = times[k]; if (t < t0 - .05) return;
    const [x, y] = pts[k], a = clamp((t - t0 + .05) / .25) * (o.alpha ?? 1);
    if (last && a > 0) { g.save(); g.globalAlpha *= a * .55; line(g, last[0], last[1], x, y, '#9fb0f0'); g.restore(); }
    last = [x, y];
  });
  chars.forEach((ch, k) => {
    const t0 = times[k]; if (t < t0 - .05) return;
    const [x, y] = pts[k], a = clamp((t - t0 + .05) / .25) * (o.alpha ?? 1);
    rect(g, x - 7, y - 7, 14, 14, `rgba(10,14,50,${(.65 * a).toFixed(2)})`);
    ptext(g, ch, x - 6, y - 6, col, { alpha: a });
    const tw = .5 + .5 * Math.sin(t * 4 + k);
    g.save(); g.globalAlpha *= a * tw; px(g, x + 8, y - 8, '#ffffff'); px(g, x + 7, y - 8, 'rgba(255,255,255,.5)'); px(g, x + 9, y - 8, 'rgba(255,255,255,.5)'); px(g, x + 8, y - 9, 'rgba(255,255,255,.5)'); px(g, x + 8, y - 7, 'rgba(255,255,255,.5)'); g.restore();
  });
}
const vcol = (x, y0, n, step = 15) => Array.from({ length: n }, (_, k) => [x, y0 + k * step]);
function shotRoof(t, T, lt) {
  const F = 140, L18 = L(18), L19 = L(19), L20 = L(20), L21 = L(21), L22 = L(22), L23 = L(23);
  // 摄像机：先是一片星空慢慢往下摇到躺着的 Clawd；第二十一句切到她推门出来，往右摇；最后两人都在画面里
  let cam;
  if (t < 166.0) cam = { x: 214, y: lerp(-110, -6, E.io(seg(t, 156.0, 163.5))) };
  else if (t < L20.t[0] - .35) cam = { x: lerp(214, 226, seg(t, 166, 173.5)), y: -6 };
  else cam = { x: kf(t, [[L20.t[0] - .35, -10], [L20.t[12] + .4, 40], [196.2, 44]]), y: -6 };
  // 流星
  const meteor = seg(t, 160.4, 161.4);
  // 她：第二十句推门出来，走到 x=78 坐下，披着毯子
  const walkIn = seg(t, L20.t[0] - .2, L20.t[4]);
  const gx = lerp(22, 78, E.io(walkIn));
  // 第二十四句：星星乱转，然后连成一座桥，Clawd 走过去
  const swirl = seg(t, L23.t[0] - .2, L23.t[5]) * (1 - seg(t, L23.t[5], L23.t[8]));
  const walkC = E.io(seg(t, L23.t[6], L23.t[13]));
  layer(g => skyRoof(g, t + swirl * 0), cam, { par: .35 });
  layer(g => {
    // 乱转的星星
    if (swirl > 0) { const r = R(5); for (let i = 0; i < 70; i++) { const a0 = r() * TAU, rr = 20 + r() * 110, a = a0 + swirl * 3 * (1 - rr / 140) + t * .6 * swirl; px(g, 200 + Math.cos(a) * rr, 30 + Math.sin(a) * rr * .45, '#e8ecff'); } }
    // 流星
    if (meteor > 0 && meteor < 1) { const mx = lerp(420, 300, meteor), my = lerp(-60, -20, meteor); for (let k = 0; k < 14; k++) { g.save(); g.globalAlpha *= (1 - k / 14) * Math.sin(meteor * Math.PI); px(g, mx + k * 2, my - k * .7, '#ffffff'); g.restore(); } }
    roofTop(g, t, F);
    // 歌词星座
    constellation(g, [...L18.text], L18.t, vcol(470, 14, 6), t);
    constellation(g, [...L19.text], L19.t, vcol(436, 24, 6), t);
    const arc20 = [...L20.text].map((_, k) => [92 + k * 19, 22 - Math.sin(k / 12 * Math.PI) * 22]);
    constellation(g, [...L20.text], L20.t, arc20, t, { alpha: 1 - seg(t, L23.t[0] - .6, L23.t[0]) });
    constellation(g, [...L21.text], L21.t, vcol(176, 30, 6), t, { alpha: 1 - seg(t, L23.t[0] - .6, L23.t[0]) });
    constellation(g, [...L22.text], L22.t, vcol(214, 40, 6), t, { alpha: 1 - seg(t, L23.t[0] - .6, L23.t[0]) });
    // 星星桥：从她到 Clawd，字落在桥上（从她那头往右读）
    const bridge = [...L23.text].map((_, k) => [96 + k * 16.5, 96 - Math.sin(k / 13 * Math.PI) * 26]);
    if (t > L23.t[0] - .2) {
      const b = seg(t, L23.t[5], L23.t[8]);
      if (b > 0) for (let i = 0; i < 60; i++) { const s = i / 59; if (s > b) break; const x = lerp(96, 310, s), y = 110 - Math.sin(s * Math.PI) * 26; px(g, x, y, i % 3 ? '#a8b8ff' : '#ffffff'); }
      constellation(g, [...L23.text], L23.t, bridge, t, { col: '#ffe0ec' });
    }
    // 她
    if (t > L20.t[0] - .3) {
      girl(g, gx, F, walkIn < 1 ? 'walk' : 'sit', { t, walk: t * 1.5, eyes: t > L23.t[13] ? 'happy' : 'up' });
      if (walkIn >= 1) { rect(g, gx - 6, F - 14, 13, 10, '#7d93c4'); rect(g, gx - 6, F - 14, 13, 1, '#97abd6'); dith(g, gx - 5, F - 12, 11, 7, '#6d82b3'); }
    }
    // Clawd：躺在天台上看星星（眼睛朝上），流星时坐起来指；最后沿着星星桥走到她身边
    let cx = 320, cy = F, o = { u: 2, t, eyes: 'up' };
    if (meteor > 0 && t < 166) o.armR = 2;
    if (walkC > 0) { const s = 1 - walkC; cx = lerp(96 + 18, 310, s); cy = s > .02 && s < .98 ? 110 - Math.sin(s * Math.PI) * 26 : F; if (walkC >= 1) { cx = gx + 16; cy = F; } o.walk = walkC < 1 ? t * 3 : undefined; o.look = -1; o.eyes = walkC < 1 ? 'n' : 'happy'; o.blush = walkC >= 1 ? 1 : 0; }
    clawd(g, cx, cy, o);
    if (walkC >= 1) mark(g, (cx + gx) / 2, F - 30, '♥', t, L23.t[13] + .2, 197);
  }, cam);
  if (meteor > 0 && meteor < 1) glow(sx(cam, lerp(420, 300, meteor)), sy(cam, lerp(-60, -20, meteor)), 160, '#ffffff', .3 * Math.sin(meteor * Math.PI));
  grade('#2a3a9a', .2, 'soft-light');
  bloom(.38, 1.15);
  dust(t, 16, 81, { a: .3, col: '#dce6ff', vy: -3 });
  vignette(.5);
}

/* 盖在她背上的毯子 */
function blanketOn(g, D) {
  rect(g, 113, D - 20, 15, 4, '#7d93c4'); rect(g, 112, D - 16, 13, 12, '#7d93c4'); rect(g, 113, D - 20, 15, 1, '#97abd6');
  dith(g, 113, D - 15, 11, 10, '#6d82b3'); rect(g, 112, D - 5, 13, 1, '#5d72a3');
}
