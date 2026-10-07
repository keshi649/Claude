'use strict';
/* scenes1.js：共用的小工具和背景；开头（春天的街、打喷嚏、数据）；"鼻腔检查站"的保安队。 */

/* ================= 共用 ================= */
/* 弹出的小标签：t0 弹出，t1（可选）收起 */
function popTag(g, t, t0, x, y, s, px = 36, o = {}) {
  const p = pop(t, t0, .3) * (o.t1 ? clamp((o.t1 - t) / .2) : 1);
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p); ptag(g, 0, 0, s, px, o); g.restore();
}
/* 弹出的大字（像素字 + 描边） */
function popText(g, t, t0, t1, s, x, y, px, col, o = {}) {
  const p = pop(t, t0, .3) * clamp((t1 - t) / .2);
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p); g.rotate(o.rot || 0);
  ptext(g, s, 0, px * .35, px, col, { align: 'center', ol: o.ol || C.ink, olw: o.olw || px / 12 * 1.5, sh: 1 });
  g.restore();
}
/* 打喷嚏的节奏：times 里每个时刻打一个；返回 0（平常）… .3~.85（憋气）… 1（喷） */
function sneezeVal(t, times) {
  for (const T of times) {
    if (t >= T - .7 && t < T) return .3 + .55 * (t - T + .7) / .7;
    if (t >= T && t < T + .35) return 1;
  }
  return 0;
}
/* 喷嚏的飞沫：(x,y) 为鼻子，世界像素 */
function sneezeSpray(g, t, T, x, y, dir = 1) {
  const u = (t - T) / .5; if (u < 0 || u > 1) return;
  for (let i = 0; i < 14; i++) {
    const a = (hash(i, 5) - .5) * 1.2, d = 4 + u * (10 + hash(i, 6) * 18);
    pdot(g, x + dir * Math.cos(a) * d, y + Math.sin(a) * d * .8 + u * u * 4, i % 3 ? '#BFE6FF' : '#FFD84A');
  }
}
/* "阿嚏！" */
function achoo(g, t, T, x, y, px = 72) {
  const p = pop(t, T, .2) * clamp((T + .7 - t) / .2);
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p); g.rotate(-.08);
  ptext(g, '阿嚏！', 0, px * .35, px, C.white, { align: 'center', ol: '#D9443B', olw: px / 12 * 1.5, sh: 1 });
  g.restore();
}

/* 深色"菜单"背景：网格慢慢滚动 */
function menuBG(g, t, tint = '#1E1A3A') {
  g.fillStyle = tint; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.04)';
  for (let x = 0; x < W; x += 60) g.fillRect(x, 0, 2, H);
  for (let y = (t * 20) % 60; y < H; y += 60) g.fillRect(0, y, W, 2);
}

/* 草原（沿用前两集的画法） */
function savannaBG(w, h, hy) {
  return cached(`savBG${w}x${h}x${hy}`, w, h, g => {
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

/* 飘着的花粉：n 个小点 + 几个带脸的大花粉；区域 [x0,x1]×[y0,y1] */
function pollenAir(g, t, n, x0, x1, y0, y1, o = {}) {
  for (let i = 0; i < n; i++) {
    const sp = 3 + hash(i, 2) * 5, x = x0 + ((hash(i, 1) * (x1 - x0) + t * sp) % (x1 - x0)), y = y0 + hash(i, 3) * (y1 - y0) + Math.sin(t * 1.3 + i) * 3;
    pdot(g, x, y, i % 4 ? '#FFE27A' : '#F2C230');
    if (i % 5 === 0) pdot(g, x + 1, y, '#FFE27A');
  }
  for (let i = 0; i < (o.big || 0); i++) {
    const x = x0 + ((hash(i, 8) * (x1 - x0) + t * 4) % (x1 - x0)), y = y0 + 8 + hash(i, 9) * (y1 - y0 - 16) + Math.sin(t * 1.7 + i * 2) * 4;
    drawPollen(g, x, y, t, { r: 3, face: 'none' });
  }
}

/* 春天的街：世界 180×320 */
function streetBG(w = 180, h = 320, gy = 116) {
  return cached(`street${w}x${h}x${gy}`, w, h, g => {
    pbands(g, 0, w, [[0, '#8ED0F7'], [40, '#A9DCF8'], [80, '#C7E8F8'], [gy, '#C7E8F8']], 3);
    // 远处的楼
    for (let x = -4; x < w; x += 15) {
      const hh = 26 + Math.floor(hash(x, 11) * 34), col = ['#E9C9D6', '#D6D8EE', '#F2DCC2', '#CFE3E0'][Math.floor(hash(x, 12) * 4)];
      prect(g, x, gy - hh, 14, hh, col);
      for (let yy = gy - hh + 4; yy < gy - 6; yy += 6) for (let xx = x + 2; xx < x + 12; xx += 4) prect(g, xx, yy, 2, 3, hash(xx, yy) < .3 ? '#FFF3C4' : '#FFFFFF');
    }
    // 人行道
    pbands(g, 0, w, [[gy, '#D9D2C6'], [gy + 30, '#CFC7BA'], [h, '#C4BBAD']], 2);
    for (let y = gy + 6; y < h; y += 12) prect(g, 0, y, w, 1, '#B9AFA1');
    for (let y = gy; y < h; y += 12) for (let x = (y / 12) % 2 ? 0 : 10; x < w; x += 20) prect(g, x, y, 1, 12, '#B9AFA1');
    prect(g, 0, gy - 2, w, 2, '#A9A196');
    // 樱花树
    for (const [tx, s] of [[18, 1], [160, .9]]) {
      prect(g, tx - 2, gy - 34 * s, 4, 34 * s, '#7A4E3A');
      for (let i = 0; i < 26; i++) { const a = hash(i, tx) * TAU, d = hash(i, tx + 1) * 16 * s; pdisc(g, tx + Math.cos(a) * d, gy - 40 * s + Math.sin(a) * d * .7, 4, i % 3 ? '#F7B8CF' : '#F29BB8'); }
      for (let i = 0; i < 14; i++) pdot(g, tx - 14 + hash(i, tx + 2) * 28, gy - 52 * s + hash(i, tx + 3) * 26, '#FFFFFF');
    }
  });
}

/* ================= 开头 ================= */
const HOOK_SNEEZE = [2.15, 6.6, 9.4];
/* 封面：大标题放在中间，小怪正打着喷嚏（render.cjs cover 模式会设 window.COVER） */
function coverArt(g, t) {
  const b = pbuf('coverSt', 90, 160);
  b.drawImage(streetBG(90, 160, 104), 0, 0);
  pollenAir(b, t, 44, 0, 90, 8, 150, { big: 4 });
  feetShadow(b, 33, 120);
  drawSneezy(b, 33, 104, t, { sneeze: 1 });
  sneezeSpray(b, t, t - .15, 45, 109);
  blit(g, 'coverSt', 12);
  g.save(); g.translate(540, 520); g.rotate(-.03);
  ptext(g, '原始人为什么', 0, -60, 120, C.white, { align: 'center', ol: C.ink, olw: 11, sh: 1 });
  ptext(g, '不过敏？', 0, 160, 192, C.amber, { align: 'center', ol: C.ink, olw: 14, sh: 1 });
  g.restore();
  achoo(g, t, t - .3, 790, 1020, 120);
}
function hook(g, t) {
  if (window.COVER) { coverArt(g, t); return; }
  const b = pbuf('street', 135, 240);
  b.drawImage(streetBG(135, 240, 112), 0, 0);
  // 飘落的花瓣
  for (let i = 0; i < 14; i++) { const x = (hash(i, 4) * 150 + t * (6 + hash(i, 5) * 6)) % 150 - 8, y = (hash(i, 6) * 100 + t * 8) % 110 - 8; pdot(b, x, y, '#F7B8CF'); }
  pollenAir(b, t, 40, 0, 135, 16, 160, { big: 3 });
  // 打喷嚏的小怪
  const s = sneezeVal(t, HOOK_SNEEZE);
  feetShadow(b, 55, 112);
  drawSneezy(b, 55, 96, t, { sneeze: s });
  for (const T of HOOK_SNEEZE) sneezeSpray(b, t, T, 67, 101);
  blit(g, 'street', 8);
  for (const T of HOOK_SNEEZE) achoo(g, t, T, 790, 700, 72);
  // 标题
  const tp = 1 + .015 * Math.sin(t * 4);
  g.save(); g.translate(540, 210); g.scale(tp, tp); g.rotate(-.02);
  ptext(g, '原始人为什么', 0, -40, 96, C.white, { align: 'center', ol: C.ink, olw: 9, sh: 1 });
  ptext(g, '不过敏？', 0, 120, 144, C.amber, { align: 'center', ol: C.ink, olw: 11, sh: 1 });
  g.restore();
  // 数据：两百年前罕见；如今大城市约 1/6
  const out = 1 - clamp((t - S('h4') + .1) / .35);
  const p1 = E.out(clamp((t - S('h2') + .1) / .4)) * out, p2 = E.out(clamp((t - S('h3') + .1) / .4)) * out;
  if (p1 > 0) withAlpha(g, p1, () => {
    pbox(g, 40, 1010, 480, 230, { k: 6 });
    ptext(g, '两百年前', 80, 1072, 36, '#CFC6E8');
    const bb = pbuf('oldbook', 20, 18);
    prect(bb, 2, 3, 16, 13, '#7A4E3A'); prect(bb, 3, 4, 14, 11, '#E8D9B8'); prect(bb, 10, 3, 1, 13, '#7A4E3A'); for (let j = 0; j < 4; j++) { prect(bb, 4, 6 + j * 2, 5, 1, '#B8A47E'); prect(bb, 12, 6 + j * 2, 4, 1, '#B8A47E'); }
    g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF.oldbook, 66, 1092, 120, 108); g.restore();
    ptext(g, '罕见病', 360, 1160, 60, C.green, { align: 'center', sh: 1 });
    ptext(g, '1819 年才首次被描述', 350, 1204, 24, '#CFC6E8', { align: 'center' });
  });
  if (p2 > 0) withAlpha(g, p2, () => {
    pbox(g, 560, 1010, 480, 230, { k: 6 });
    ptext(g, '如今 · 中国大城市', 600, 1072, 36, '#CFC6E8');
    for (let i = 0; i < 6; i++) {
      const c = pbuf('ic' + (i === 3 ? 1 : 0), 34, 30);
      if (i === 3) drawSneezy(c, 3, 14, t, { sneeze: sneezeVal(t, [6.6, 9.4]), noTissue: true }); else drawClawd(c, 3, 14, { eyes: blinkEyes(t, i) });
      if (i === 3) { g.fillStyle = 'rgba(255,90,79,.35)'; g.fillRect(582 + i * 72, 1094, 76, 68); }
      g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF['ic' + (i === 3 ? 1 : 0)], 586 + i * 72, 1098, 68, 60); g.restore();
    }
    ptext(g, '约 1/6 成年人有过敏性鼻炎', 800, 1206, 30, C.red, { align: 'center' });
  });
  // 想象：原始人在草丛里打滚
  const ip = E.out(clamp((t - S('h4') + .05) / .4));
  if (ip > 0) {
    const sb = pbuf('roll', 150, 44);
    drawSavanna(sb, t, 150, 44, 20, { sun: false });
    pollenAir(sb, t, 30, 0, 150, 4, 42, { big: 2 });
    for (let i = 0; i < 9; i++) { const fx = 6 + i * 17, fy = 37 + (i % 3) * 2; pdot(sb, fx, fy - 1, ['#F29BB8', '#FFFFFF', '#FFD84A'][i % 3]); prect(sb, fx, fy, 1, 3, '#5DB65A'); }
    const u = clamp((t - S('h4')) / 3.2), rx = 20 + u * 100, step = Math.floor(u * 14);
    sb.save(); sb.translate(Math.round(rx), 31); sb.rotate(step * Math.PI / 2); drawClawd(sb, -12, -8, { hat: 'bone', eyes: 'happy' }); sb.restore();
    if (step % 2) for (let i = 0; i < 8; i++) pdot(sb, rx - 6 + hash(i, step) * 12, 23 + hash(i, step + 1) * 8, '#FFE27A');
    g.save(); g.globalAlpha *= ip;
    // 想象气泡的小圆点：从小怪身边一路连下来
    for (const [x, y, r] of [[640, 902, 9], [670, 930, 12], [702, 960, 15]]) { g.fillStyle = C.ink; g.beginPath(); g.arc(x, y, r + 6, 0, TAU); g.fill(); g.fillStyle = '#FFFFFF'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
    const fy = 984;
    g.fillStyle = C.ink; g.fillRect(84, fy - 6, 912, 280); g.fillStyle = '#FFFFFF'; g.fillRect(90, fy, 900, 268);
    g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF.roll, 0, 0, 150, 44, 96, fy + 4, 888, 260); g.restore();
    ptag(g, 230, fy + 40, '原始人', 36, { fill: C.amber });
    g.restore();
    popText(g, t, CH('h4', 1), 99, '？', 870, fy + 120, 132, C.amber);
  }
}

/* ================= 鼻腔检查站：保安队 =================
   世界 135×240，P=8。路在 y=140，访客从左边走来；拱门 x 48~112，横杆转轴在右边门柱上，岗亭在拱门右边 */
const ROAD = 140, NOSE_W = 135, NOSE_H = 240;
function noseBG(w = NOSE_W, h = NOSE_H) {
  return cached('noseBG', w, h, g => {
    pbands(g, 0, w, [[0, '#E98E96'], [50, '#F0A2A6'], [100, '#F4B3B1'], [ROAD, '#F4B3B1']], 3);
    // 黏膜的褶皱
    for (let i = 0; i < 18; i++) { const x = hash(i, 1) * w, y = 44 + hash(i, 2) * 84; pell(g, x, y, 5 + hash(i, 3) * 6, 2, '#F7C2BF'); pell(g, x + 1, y + 2, 4, 1, '#E99A9E'); }
    prect(g, 0, 0, w, 20, '#C9636E');
    // 路
    pbands(g, 0, w, [[ROAD, '#EFC9B8'], [ROAD + 18, '#E7BBA9'], [h, '#DDAA98']], 2);
    prect(g, 0, ROAD, w, 2, '#D99A88');
    for (let x = 0; x < w; x += 14) prect(g, x, ROAD + 10, 7, 2, '#F7E3D6');
    for (let i = 0; i < 60; i++) pdot(g, hash(i, 9) * w, ROAD + 4 + hash(i, 8) * (h - ROAD), hash(i, 7) < .5 ? '#F7D8C9' : '#D9A090');
    // 拱门
    for (const px of [48, 107]) { prect(g, px, 84, 6, ROAD - 84, '#5E6B8A'); prect(g, px + 1, 84, 1, ROAD - 84, '#7E8BAA'); prect(g, px - 1, ROAD - 3, 8, 3, '#3B435A'); }
    prect(g, 44, 72, 72, 14, '#3B435A'); prect(g, 45, 73, 70, 12, '#7A4E3A'); prect(g, 45, 73, 70, 1, '#9A6A4A');
  });
}
/* 纤毛摆动 */
function cilia(g, t, y0, w = NOSE_W) { for (let x = 1; x < w; x += 5) { const sway = Math.round(Math.sin(t * 5 + x * .3) * 1.5); pline(g, x, y0, x + sway, y0 + 6, '#C9636E'); } }

const NX = x => x * 8, NY = y => y * 8;     // 检查站世界坐标 → 屏幕
function guard(g, t) {
  if (t >= S('g5') - .12) { sneezeCloseup(g, t); return; }
  const b = pbuf('nose', NOSE_W, NOSE_H);
  b.drawImage(noseBG(), 0, 0);
  cilia(b, t, 20);
  const alarm = t >= MK('g4');
  drawBooth(b, 116, ROAD);
  drawSiren(b, 52, 72, t, alarm); drawSiren(b, 110, 72, t, alarm); drawSiren(b, 126, ROAD - 31, t, alarm);
  // 坏人：病毒、细菌（被打跑）
  const hit = MK('g2'), bu = E.out(clamp((t - S('g2') + .2) / 1.9));
  const vx = lerp(-12, 38, bu), bx = lerp(-30, 20, bu);
  if (t > S('g2') - .2 && t < hit + .5) {
    const bob = Math.floor(t * 6) % 2;
    if (t < hit + .05) { drawBacterium(b, bx, ROAD - 6, t); drawVirus(b, vx, ROAD - 10 - bob, t); }
    else for (let i = 0; i < 22; i++) { const a = hash(i, 3) * TAU, d = (t - hit) * (24 + hash(i, 4) * 36); pdot(b, 34 + Math.cos(a) * d, ROAD - 10 + Math.sin(a) * d, i % 2 ? '#6BCB5A' : '#A86ADB'); }
  }
  // 良民：花粉、尘螨、花生
  const visit = S('g3') - .1;
  let px = -30;
  if (t > visit) {
    const u = clamp((t - visit) / 2.6), bob = Math.floor(t * 5) % 2;
    px = Math.round(lerp(-20, 40, E.out(u)));
    const face = t > S('c2') - .2 ? (t > CH('g4', 1) ? 'scared' : 'sweat') : 'n';
    drawPeanut(b, px - 28, ROAD - 12 + bob, { face: 'n' });
    drawPollen(b, px, ROAD - 12 - bob, t, { r: 7, face });
    drawMite(b, px - 15, ROAD - 5, t);
  }
  // 保安：后排两个站在横杆后面，前排的保安站在门口
  const gx = 56, gy = ROAD - 16;
  const punch = t > hit - .25 && t < hit + .4;
  const salute = t > S('g1') && t < S('g2');
  const run = alarm ? Math.round(Math.sin(t * 9) * 3) : 0;
  const g1arms = punch ? 'upR' : t > S('c1') - .1 && t < MK('g4') ? 'upL' : salute ? 'upR' : alarm ? 'up' : 'n';
  const g1eyes = t > S('g4') && t < MK('g4') ? 'squint' : alarm ? 'wide' : undefined;
  feetShadow(b, 84, ROAD); drawGuard(b, 84 - run, gy - 1, t, { seed: 2, arms: salute ? 'upR' : alarm ? 'up' : 'n', eyes: alarm ? 'wide' : undefined, legs: alarm ? walkLegs(t + .3, 10) : 0 });
  drawBarrier(b, 110, ROAD - 12, 26, -Math.PI);
  feetShadow(b, 118, ROAD); drawGuard(b, 118 + run, gy, t, { seed: 4, arms: salute ? 'upR' : alarm ? 'up' : 'n', eyes: alarm ? 'wide' : undefined, legs: alarm ? walkLegs(t + .6, 10) : 0 });
  feetShadow(b, gx - (punch ? 4 : 0), ROAD);
  drawGuard(b, gx - (punch ? 4 : 0) + run, gy, t, { arms: g1arms, eyes: g1eyes, legs: alarm ? walkLegs(t, 10) : 0 });
  blit(g, 'nose', 8);
  // 警报：红光一闪一闪
  if (alarm) { const f = Math.floor(t * 6) % 2; g.fillStyle = `rgba(255,40,30,${f ? .28 : .12})`; g.fillRect(0, 0, W, H); }
  ptext(g, '鼻腔检查站', NX(80), NY(83), 60, '#FFF4DF', { align: 'center', sh: 1 });
  // 标签
  popTag(g, t, S('g1') + .2, 540, 470, '保安队 = 免疫系统', 48, { fill: '#9FD3FF', t1: S('g2') + .4 });
  if (t < hit + .3 && t > S('g2')) { popTag(g, t, S('g2') + .5, NX(vx), NY(ROAD - 24), '病毒', 36, { fill: C.red, col: C.white }); popTag(g, t, S('g2') + .9, Math.max(80, NX(bx)), NY(ROAD - 15), '细菌', 36, { fill: C.red, col: C.white }); }
  if (punch && t > hit) popText(g, t, hit, hit + .4, '砰！', NX(42), NY(ROAD - 26), 108, C.gold, { ol: '#D9443B' });
  if (t > visit && t < S('c1')) {
    popTag(g, t, CH('g3', 0) + .25, NX(px), NY(ROAD - 26), '花粉', 36, { fill: C.gold });
    popTag(g, t, CH('g3', 0) + .85, Math.max(70, NX(px - 15)), NY(ROAD + 6), '尘螨', 36, { fill: '#E9D6B0' });
    popTag(g, t, CH('g3', 0) + 1.45, Math.max(70, NX(px - 28)), NY(ROAD - 24), '花生', 36, { fill: '#E8C08A' });
  }
  if (t > CH('g3', 1) && t < CH('g4', 1)) popTag(g, t, CH('g3', 1), NX(px - 10), NY(ROAD - 36), '✓ 良民', 48, { fill: C.green });
  if (t > CH('g4', 1)) popTag(g, t, CH('g4', 1), NX(px), NY(ROAD - 30), '坏人？！', 48, { fill: C.red, col: C.white });
  say(g, t, 'c1', NX(gx + 12), NY(gy - 6), { side: 120, px: 40 });
  say(g, t, 'c2', NX(px), NY(ROAD - 22), { side: 120, px: 40 });
  // 警报
  if (alarm) {
    const f = Math.floor(t * 4) % 2;
    popText(g, t, MK('g4'), 99, '⚠ 警报！', 540, 420, 120, f ? C.white : C.gold, { ol: '#D9443B' });
    popTag(g, t, MK('g4') + .4, 540, 540, '警报 = 组胺', 36, { fill: C.red, col: C.white });
  }
}

/* 喷嚏特写：保安拉响警报，人就开始打喷嚏。世界 78×138，P=14 */
const G5_SNEEZE = [.42, 1.87];
function sneezeCloseup(g, t) {
  const b = pbuf('cu', 78, 138);
  b.drawImage(streetBG(78, 138, 80), 0, 0);
  pollenAir(b, t, 20, 0, 78, 6, 120, { big: 2 });
  const T = G5_SNEEZE.map(d => S('g5') + d), s = sneezeVal(t, T);
  feetShadow(b, 27, 80);
  drawSneezy(b, 27, 64, t, { sneeze: s, seed: 3 });
  for (const T0 of T) sneezeSpray(b, t, T0, 39, 69);
  // 眼睛痒：眼圈发红
  if (t > CH('g5', 0) + 1.4 && s < .3) { const r = '#FF6F6F'; for (const ex of [32, 42]) prect(b, ex, 68, 4, 1, r); }
  blit(g, 'cu', 14);
  // 切过来时白闪一下
  const fl = 1 - clamp((t - S('g5') + .12) / .25); if (fl > 0) { g.fillStyle = `rgba(255,255,255,${fl})`; g.fillRect(0, 0, W, H); }
  for (const T0 of T) achoo(g, t, T0, 800, 760, 108);
  const ty = 1200;
  popTag(g, t, CH('g5', 0) + .1, 220, ty, '喷嚏', 48, { fill: C.gold });
  popTag(g, t, CH('g5', 0) + .75, 540, ty, '鼻涕', 48, { fill: '#9FD3FF' });
  popTag(g, t, CH('g5', 0) + 1.4, 860, ty, '眼睛痒', 48, { fill: '#FF8A8A' });
  // 角落的小窗：里面的保安还在拉警报
  const wp = pop(t, CH('g5', 1) - .1, .3);
  if (wp > 0) {
    g.save(); g.translate(860, 330); g.scale(wp, wp);
    pbox(g, -170, -130, 340, 260, { k: 6, fill: '#F0A2A6' });
    const sb = pbuf('sirenmini', 44, 32); prect(sb, 0, 0, 44, 32, '#F0A2A6'); drawSiren(sb, 34, 26, t, true); drawGuard(sb, 4, 14, t, { arms: 'up', eyes: 'wide' });
    g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF.sirenmini, -146, -108, 292, 212); g.restore();
    if (Math.floor(t * 6) % 2) { g.fillStyle = 'rgba(255,40,30,.25)'; g.fillRect(-158, -118, 316, 236); }
    g.restore();
    popTag(g, t, CH('g5', 1) + .1, 860, 500, '保安还在拉警报', 36, { fill: C.red, col: C.white });
  }
}
