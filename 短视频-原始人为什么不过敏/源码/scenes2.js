'use strict';
/* scenes2.js：一百五十年前的怪事（贵族病）→ 保安的训练（陪练）→ 两群农民（阿米什 vs 哈特派）。 */

/* ================= 维多利亚时代的室内（旧照片色调） ================= */
function parlorBG(w, h, fy) {
  return cached(`parlor${w}x${h}x${fy}`, w, h, g => {
    pbands(g, 0, w, [[0, '#CDB088'], [fy, '#C4A57C']], 2);
    for (let y = 6; y < fy - 4; y += 10) for (let x = (y / 10) % 2 ? 4 : 9; x < w; x += 10) { pdot(g, x, y, '#B38F62'); pdot(g, x - 1, y + 1, '#B38F62'); pdot(g, x + 1, y + 1, '#B38F62'); pdot(g, x, y + 2, '#B38F62'); }
    prect(g, 0, fy - 8, w, 8, '#8C6440'); prect(g, 0, fy - 8, w, 1, '#A87C52');
    pbands(g, 0, w, [[fy, '#7A5236'], [h, '#5E3E28']], 2);
    for (let x = 0; x < w; x += 12) prect(g, x, fy, 1, h - fy, '#6B4630');
  });
}
/* 书架：(x,y) 左下 */
function drawShelf(g, x, y, w = 26, rows = 3) {
  prect(g, x, y - rows * 10 - 2, w, rows * 10 + 2, '#5E3E28');
  for (let r = 0; r < rows; r++) {
    const by = y - r * 10 - 2;
    prect(g, x + 1, by - 8, w - 2, 8, '#3E2818');
    for (let i = 0; i < w - 4; i += 3) prect(g, x + 2 + i, by - 7 + (i % 2), 2, 7 - (i % 2), ['#8E2A35', '#3F5E8C', '#4E7A3A', '#C9A04A', '#6B3F1E'][(i + r) % 5]);
  }
}
/* 壁炉：(x,y) 左下 */
function drawFireplace(g, x, y, t) {
  prect(g, x, y - 22, 26, 22, '#9C8C78'); prect(g, x - 2, y - 24, 30, 3, '#7E6E5C');
  prect(g, x + 5, y - 15, 16, 15, '#2A1E16');
  for (let i = 0; i < 6; i++) { const h = 4 + Math.floor((Math.sin(t * 12 + i * 1.7) + 1) * 2.5); prect(g, x + 7 + i * 2, y - 2 - h, 2, h, i % 2 ? '#FF8A3D' : '#FFD84A'); }
}
/* 维多利亚时代的绅士：礼帽 + 单片眼镜 */
function drawGent(g, x, y, t, o = {}) {
  drawClawd(g, x, y, { hat: 'top', eyes: o.eyes || blinkEyes(t, 5), arms: o.arms || 'n', nose: o.nose });
  prect(g, x + 14, y + 1, 4, 4, 'rgba(255,255,255,.35)'); prect(g, x + 14, y + 1, 4, 1, '#C9A04A'); prect(g, x + 17, y + 1, 1, 4, '#C9A04A'); pline(g, x + 18, y + 4, x + 19, y + 9, '#C9A04A');
  prect(g, x + 9, y + 6, 6, 2, '#F4F4F4'); pdot(g, x + 11, y + 8, '#8E2A35');
}
/* 一百五十年前的医生：写字台 + 台灯 */
function drawDoctor1873(g, x, y, t) {
  drawClawd(g, x, y, { eyes: Math.floor(t * 2) % 3 ? 'l' : 'blink', arms: 'upR', brows: true });
  prect(g, x + 4, y + 6, 16, 6, '#3A2A22'); prect(g, x + 10, y + 6, 4, 2, '#F4F4F4');
}
/* 干草地（旧照片色调） */
function fieldBG(w, h, hy) {
  return cached(`field${w}x${h}x${hy}`, w, h, g => {
    pbands(g, 0, w, [[0, '#D9C49A'], [hy * .6, '#E3D3AE'], [hy, '#E3D3AE']], 3);
    for (let x = 0; x < w; x++) prect(g, x, hy - 4 - Math.round(Math.sin(x * .09) * 2), 1, 5, '#B9A06E');
    pbands(g, 0, w, [[hy, '#C9A85E'], [hy + 20, '#BC9A52'], [h, '#AE8C46']], 3);
    for (let i = 0; i < w * 2; i++) { const x = hash(i, 21) * w, y = hy + 2 + hash(i, 22) * (h - hy - 2); pline(g, x, y, x + (hash(i, 23) < .5 ? -1 : 1), y - 3, hash(i, 24) < .5 ? '#9C7E3A' : '#DCC07A'); }
  });
}

function historyScene(g, t) {
  const tA = CH('y1', 1) - .15;                   // 之前：原始人；之后：1873 年的英国
  if (t < tA) { noRecord(g, t); return; }
  if (t < S('y3') - .1) { victorian(g, t); return; }
  if (t < S('y4') - .1) { farmer(g, t); return; }
  compareHist(g, t);
}
/* 原始人没留下病历 */
function noRecord(g, t) {
  const b = pbuf('nr', 108, 192);
  drawSavanna(b, t, 108, 192, 120, { sunX: 90, sunY: 30 });
  pollenAir(b, t, 26, 0, 108, 30, 150, { big: 2 });
  feetShadow(b, 22, 132); drawClawd(b, 22, 116, { hat: 'bone', eyes: blinkEyes(t, 2), arms: t > S('y1') + .4 ? 'up' : 'n' });
  drawClipboard(b, 62, 104);
  blit(g, 'nr', 10);
  popTag(g, t, S('y1') - .2, 690, 1000, '病历', 36, { fill: '#E8C08A' });
  popText(g, t, S('y1') + .3, 99, '？', 690, 1170, 120, C.amber);
  popText(g, t, S('y1') + .6, 99, '（空白）', 690, 1260, 36, C.white, { olw: 4 });
}
/* 1873 年的英国：医生的书房 → 绅士的客厅 */
function victorian(g, t) {
  const b = pbuf('vic', 108, 192), fy = 132;
  b.drawImage(parlorBG(108, 192, fy), 0, 0);
  drawShelf(b, 4, fy - 8, 26, 4);
  drawFireplace(b, 74, fy - 8, t);
  const gent = t > S('y2') - .15;
  if (!gent) {
    // 写字台
    prect(b, 36, fy - 22, 40, 4, '#6B4630'); prect(b, 38, fy - 18, 3, 18, '#5E3E28'); prect(b, 71, fy - 18, 3, 18, '#5E3E28');
    prect(b, 50, fy - 26, 14, 4, '#F2E3C8'); prect(b, 57, fy - 26, 1, 4, '#C9B48E');
    prect(b, 68, fy - 34, 2, 12, '#C9A04A'); pell(b, 69, fy - 36, 4, 2, '#3F7A5A'); pdot(b, 69, fy - 33, '#FFF3B0');
    drawDoctor1873(b, 40, fy - 38, t);
  } else {
    // 扶手椅 + 书 + 钱袋
    prect(b, 34, fy - 26, 32, 18, '#8E2A35'); prect(b, 32, fy - 30, 6, 22, '#7A2230'); prect(b, 62, fy - 30, 6, 22, '#7A2230'); prect(b, 36, fy - 8, 3, 8, '#5E3E28'); prect(b, 61, fy - 8, 3, 8, '#5E3E28');
    const s = sneezeVal(t, [S('y2') + .9, S('y2') + 2.3]);
    drawGent(b, 38, fy - 40 + (s >= .85 ? 1 : 0), t, { eyes: s > .3 ? (s >= .85 ? 'shut' : 'squint') : undefined, nose: true, arms: 'upR' });
    prect(b, 60, fy - 44, 5, 5, '#F4F4F4');
    for (const T of [S('y2') + .9, S('y2') + 2.3]) sneezeSpray(b, t, T, 50, fy - 35);
    pspr(b, BOOKS(), 8, fy - 20); drawMoneyBag(b, 84, fy - 4);
  }
  blit(g, 'vic', 10);
  g.fillStyle = 'rgba(120,80,30,.12)'; g.fillRect(0, 0, W, H);
  if (!gent) {
    popTag(g, t, CH('y1', 1) + .1, 540, 300, '1873 年 · 英国医生', 48, { fill: '#E8C08A' });
    popText(g, t, CH('y1', 2) + .6, S('y2'), '?!', 620, 820, 132, C.amber);
  } else {
    for (const T of [S('y2') + .9, S('y2') + 2.3]) achoo(g, t, T, 740, 640, 84);
    popTag(g, t, S('y2') + .5, 230, 1010, '读书人', 48, { fill: '#9FD3FF' });
    popTag(g, t, S('y2') + 1.3, 860, 1210, '有钱人', 48, { fill: C.gold });
    popTag(g, t, S('y2') + .1, 540, 300, '花粉症：偏爱读书人、有钱人', 36, { fill: '#E8C08A' });
  }
}
/* 天天跟花粉打交道的农民 */
function farmer(g, t) {
  const b = pbuf('farm1', 108, 192), hy = 84;
  b.drawImage(fieldBG(108, 192, hy), 0, 0);
  drawHay(b, 16, 104, 26, 14); drawHay(b, 92, 100, 22, 12);
  pollenAir(b, t, 70, 0, 108, 30, 150, { big: 5 });
  const sw = Math.floor(t * 2) % 2;
  feetShadow(b, 44, 116); drawClawd(b, 44, 100, { hat: 'straw', eyes: 'happy', arms: sw ? 'upR' : 'n' });
  pline(b, 70, 86 + sw * 4, 66, 114, '#8C6440'); for (let i = 0; i < 3; i++) pline(b, 67 + i * 2, 82 + sw * 4, 67 + i * 2, 86 + sw * 4, '#9AA1AD');
  blit(g, 'farm1', 10);
  g.fillStyle = 'rgba(120,80,30,.10)'; g.fillRect(0, 0, W, H);
  popTag(g, t, S('y3') + .4, 560, 1210, '农民', 48, { fill: '#E8C08A' });
  popTag(g, t, CH('y3', 1) + .1, 560, 300, '✓ 很少得花粉症', 48, { fill: C.green });
  say(g, t, 'c3', 600, 960, { side: 100, px: 48 });
}
/* 对比：花粉少的绅士喷嚏不停，花粉多的农民没事 */
function compareHist(g, t) {
  g.fillStyle = '#2A2033'; g.fillRect(0, 0, W, H);
  const rows = [['vic2', '读书人、有钱人', '花粉：少', '喷嚏不停', C.red, 150], ['farm2', '农民', '花粉：多', '没事', C.green, 720]];
  rows.forEach(([name, who, pol, sym, col, y], i) => {
    const b = pbuf(name, 108, 50);
    if (i === 0) {
      b.drawImage(parlorBG(108, 50, 44), 0, 0); drawFireplace(b, 80, 40, t);
      const s = sneezeVal(t, [S('y4') + .6, S('y4') + 1.8, S('y4') + 3.0]);
      drawGent(b, 30, 16 + (s >= .85 ? 1 : 0), t, { eyes: s > .3 ? (s >= .85 ? 'shut' : 'squint') : undefined, nose: true });
      pollenAir(b, t, 4, 0, 108, 4, 40);
    } else {
      b.drawImage(fieldBG(108, 50, 20), 0, 0); drawHay(b, 86, 44, 22, 12);
      drawClawd(b, 30, 30, { hat: 'straw', eyes: 'happy', arms: Math.floor(t * 2) % 2 ? 'upR' : 'n' });
      pollenAir(b, t, 60, 0, 108, 0, 50, { big: 3 });
    }
    pbox(g, 40, y, 1000, 520, { k: 6, fill: '#1B1730' });
    g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF[name], 0, 0, 108, 50, 58, y + 18, 964, 446); g.restore();
    g.fillStyle = 'rgba(120,80,30,.12)'; g.fillRect(58, y + 18, 964, 446);
    ptag(g, 80, y + 50, who, 36, { fill: '#E8C08A', align: 'left' });
    const p = pop(t, S('y4') + .2 + i * .6, .3);
    if (p > 0) { g.save(); g.translate(840, y + 400); g.scale(p, p); pbox(g, -170, -60, 340, 120, { k: 6 }); ptext(g, pol, 0, -8, 36, C.gold, { align: 'center' }); ptext(g, sym, 0, 42, 36, col, { align: 'center' }); g.restore(); }
  });
  popText(g, t, CH('y4', 2), 99, '怪事！', 540, 700, 96, C.amber);
}

/* ================= 保安的训练：陪练 =================
   世界 135×240，P=8。原始的草原训练营 → 现代的楼房 → 检查站里的新兵 */
const EXP = t => {   // 训练值（0~1）
  if (t < S('t4') - .2) return clamp(.12 + .7 * seg(t, CH('t2', 1), MK('t2', 2) + .8) + .18 * seg(t, S('t3'), CH('t3', 2) + .3));
  return .15;
};
function expBar(g, t, x, y, w, o = {}) {
  const v = EXP(t);
  pbox(g, x, y, w, 96, { k: 6 });
  ptext(g, '训练值', x + 34, y + 62, 36, C.white);
  const bx = x + 180, bw = w - 220;
  g.fillStyle = '#3B3363'; g.fillRect(bx, y + 30, bw, 36);
  g.fillStyle = v >= .99 ? C.gold : v < .3 ? C.red : C.green; g.fillRect(bx, y + 30, Math.round(bw * v / 6) * 6, 36);
  if (v >= .99) ptext(g, 'MAX', bx + bw - 12, y + 62, 36, C.ink, { align: 'right' });
}
function train(g, t) {
  if (t >= S('t4') - .15 && t < S('c4') - .2) { cleanHome(g, t); return; }
  if (t >= S('c4') - .2) { rookie(g, t); return; }
  const b = pbuf('camp', 135, 240), hy = 96;
  drawSavanna(b, t, 135, 240, hy, { sunX: 112, sunY: 44 });
  // 训练营的牌子和栅栏
  for (let x = 4; x < 135; x += 10) { prect(b, x, hy + 2, 2, 10, '#8C6440'); }
  prect(b, 0, hy + 4, 135, 1, '#A87C52'); prect(b, 0, hy + 8, 135, 1, '#A87C52');
  prect(b, 54, hy - 22, 2, 24, '#6B4630'); prect(b, 80, hy - 22, 2, 24, '#6B4630'); prect(b, 50, hy - 30, 36, 10, '#8C6440'); prect(b, 51, hy - 29, 34, 8, '#A87C52');
  // 新兵：三个戴帽子的小宝宝
  const babies = [[42, 124], [62, 128], [82, 124]];
  const learn = t > S('t3');
  babies.forEach(([x, y], i) => { const bob = Math.floor(t * 4 + i) % 2; drawBaby(b, x, y - bob, { cap: true, eyes: learn ? 'happy' : 'n' }); if (learn && i === 1 && t > CH('t3', 2)) { prect(b, x + 5, y + 3 - bob, 2, 2, '#5BE37D'); } });
  // 陪练：泥土、动物、哥哥姐姐带来的微生物
  const src = [[MK('t2', 0), 18, 146], [MK('t2', 1), 112, 120], [MK('t2', 2), 104, 146]];
  if (t > MK('t2', 0) - .3) { pell(b, 18, 152, 13, 4, '#7A5236'); pell(b, 18, 151, 11, 3, '#8C6440'); for (let i = 0; i < 3; i++) if (Math.floor(t * 3 + i) % 3 === 0) pdot(b, 12 + i * 5, 150, '#A87C52'); }
  if (t > MK('t2', 1) - .4) { const u = E.out(clamp((t - MK('t2', 1) + .4) / .8)); drawDog(b, lerp(140, 106, u), 116, t); }
  if (t > MK('t2', 2) - .4) { const u = E.out(clamp((t - MK('t2', 2) + .4) / .8)); drawClawd(b, lerp(150, 92, u), 138, { hat: 'bone', eyes: 'happy', legs: u < 1 ? walkLegs(t, 8) : 0 }); drawClawd(b, lerp(172, 112, u), 142, { hat: 'bone', eyes: 'happy', col: TONES.yellow, legs: u < 1 ? walkLegs(t + .2, 8) : 0 }); }
  src.forEach(([t0, sx, sy], k) => {
    for (let j = 0; j < 4; j++) {
      const st = t0 + .3 + j * .35; if (t < st) continue;
      const u = clamp((t - st) / 1.2), [tx, ty] = babies[(j + k) % 3];
      const mx = lerp(sx, tx + 6 + (j - 1.5) * 5, E.out(u)), my = lerp(sy, ty - 6 - j % 2 * 4, E.out(u)) - Math.sin(u * Math.PI) * 10;
      drawMicrobe(b, mx, my, k * 2 + j, t);
    }
  });
  // 分辨训练：坏人混在陪练里，被认出来
  if (t > CH('t3', 1)) { const u = clamp((t - CH('t3', 1)) / .8); drawVirus(b, lerp(150, 122, u), 112, t, { r: 5 }); }
  blit(g, 'camp', 8);
  ptext(g, '新兵训练营', NX(68), NY(hy - 23), 36, '#FFF4DF', { align: 'center', sh: 1 });
  expBar(g, t, 140, 200, 800);
  popTag(g, t, MK('t2', 0), NX(18), NY(162), '泥土', 36, { fill: '#E8C08A' });
  popTag(g, t, MK('t2', 1), NX(116), NY(106), '动物', 36, { fill: '#E8C08A' });
  popTag(g, t, MK('t2', 2), NX(104), NY(160), '哥哥姐姐', 36, { fill: '#E8C08A' });
  popTag(g, t, CH('t2', 1) + .2, 540, 420, '陪练 = 各种微生物', 48, { fill: C.green, t1: S('t3') });
  if (t > CH('t3', 1)) { popTag(g, t, CH('t3', 1) + .4, 540, 420, '✓ 陪练  ✗ 病毒', 48, { fill: C.green }); popText(g, t, CH('t3', 1) + .8, 99, '✗', NX(122), NY(100), 72, C.red); }
  if (t > CH('t3', 2)) { popText(g, t, CH('t3', 2) + .1, 99, 'LEVEL UP!', 540, 560, 84, C.gold); popTag(g, t, CH('t3', 2) + .5, NX(68), NY(146), '淡定', 36, { fill: C.green }); }
}
/* 现代：楼房里干干净净 */
function cleanHome(g, t) {
  const b = pbuf('home', 108, 192), fy = 112;
  pbands(b, 0, 108, [[0, '#EEF2F6'], [fy, '#E4EAF0']], 2);
  prect(b, 0, fy, 108, 80, '#D9DEE6'); for (let x = 0; x < 108; x += 14) prect(b, x, fy, 1, 80, '#C9D0DA');
  // 窗外的楼
  prect(b, 56, 34, 44, 48, '#5E6B8A'); prect(b, 58, 36, 40, 44, '#BFE6FF');
  for (let i = 0; i < 4; i++) { const hh = 12 + i * 7 % 19; prect(b, 60 + i * 9, 80 - hh, 8, hh, '#A9CBE0'); }
  prect(b, 77, 36, 2, 44, '#5E6B8A'); prect(b, 58, 57, 40, 2, '#5E6B8A');
  // 沙发、孩子、消毒喷雾
  prect(b, 6, fy - 14, 40, 10, '#7FA6D9'); prect(b, 4, fy - 22, 6, 18, '#6B8FC2'); prect(b, 42, fy - 22, 6, 18, '#6B8FC2'); prect(b, 6, fy - 26, 40, 8, '#8FB4E2');
  drawBaby(b, 20, fy - 22, { eyes: blinkEyes(t, 3) === 'blink' ? 'shut' : 'n' });
  prect(b, 74, fy - 14, 6, 13, '#F4F4F4'); prect(b, 75, fy - 18, 4, 4, '#5EC8FF'); prect(b, 79, fy - 17, 3, 1, '#5EC8FF');
  if (Math.floor(t * 2) % 2) for (let i = 0; i < 10; i++) pdot(b, 82 + i * 1.5, fy - 17 + (hash(i, Math.floor(t * 2)) - .5) * 6, '#BFE6FF');
  blit(g, 'home', 10);
  ptag(g, 770, (fy + 6) * 10, '消毒', 36, { fill: '#9FD3FF' });
  ptag(g, 260, (fy + 6) * 10, '孩子', 36, { fill: '#E8C08A' });
  expBar(g, t, 140, 200, 800);
  popTag(g, t, S('t4') + .2, 540, 420, '住楼房 · 干干净净', 48, { fill: '#C9D3DE' });
  popTag(g, t, CH('t4', 2), 540, 420 + 110, '陪练少了', 48, { fill: C.red, col: C.white });
}
/* 没见过世面的新兵：看谁都像坏人 */
function rookie(g, t) {
  const b = pbuf('nose', NOSE_W, NOSE_H);
  b.drawImage(noseBG(), 0, 0);
  cilia(b, t, 20);
  const alarm = t > EN('c4') - .3;
  drawBooth(b, 116, ROAD);
  drawSiren(b, 52, 72, t, alarm); drawSiren(b, 110, 72, t, alarm); drawSiren(b, 126, ROAD - 31, t, alarm);
  drawBarrier(b, 110, ROAD - 12, 26, -Math.PI);
  // 路过的花粉、蝴蝶、一粒灰
  const u = clamp((t - S('c4') + .5) / 2);
  drawPollen(b, lerp(-12, 26, E.out(u)), ROAD - 12 - Math.floor(t * 5) % 2, t, { r: 7, face: t > S('t5') ? 'scared' : 'n' });
  if (t > S('t5')) { pspr(b, BUTTERFLY[Math.floor(t * 6) % 2](), 18 + Math.round(Math.sin(t * 2) * 6), 92); drawMite(b, 34, 112, t); }
  const shake = alarm ? Math.round(Math.sin(t * 30)) : 0;
  feetShadow(b, 56, ROAD);
  drawGuard(b, 56 + shake, ROAD - 16, t, { eyes: 'wide', arms: alarm ? 'up' : 'upL' });
  if (Math.floor(t * 3) % 2) { pdot(b, 80, ROAD - 18, '#7FC8FF'); prect(b, 79, ROAD - 17, 3, 2, '#7FC8FF'); }
  blit(g, 'nose', 8);
  if (alarm) { const f = Math.floor(t * 6) % 2; g.fillStyle = `rgba(255,40,30,${f ? .26 : .1})`; g.fillRect(0, 0, W, H); }
  ptext(g, '鼻腔检查站', NX(80), NY(83), 60, '#FFF4DF', { align: 'center', sh: 1 });
  popTag(g, t, S('c4') - .2, NX(68), NY(ROAD - 30) - 60, '没见过世面的新兵', 36, { fill: '#C9D3DE' });
  say(g, t, 'c4', NX(68), NY(ROAD - 18), { side: -40, px: 40 });
  if (t > S('t5')) {
    const marks = [[NX(26), NY(ROAD - 26)], [NX(22), NY(84)], [NX(38), NY(104)]];
    marks.forEach(([x, y], i) => popText(g, t, S('t5') + .3 + i * .5, 99, '坏人？', x + 40, y - 10, 36, C.white, { ol: '#D9443B' }));
    popText(g, t, CH('t5', 1), 99, '⚠ 警报！', 540, 420, 108, Math.floor(t * 4) % 2 ? C.white : C.gold, { ol: '#D9443B' });
  }
}

/* ================= 两群农民：阿米什 vs 哈特派 =================
   世界 108×192，P=10，左右各半 */
function amish(g, t) {
  const b = pbuf('farms', 108, 192), hy = 70;
  pbands(b, 0, 108, [[0, '#8ED0F7'], [60, '#B5E2FA'], [hy, '#B5E2FA']], 3);
  pbands(b, 0, 108, [[hy, '#7FBF5A'], [hy + 30, '#6FAE4E'], [192, '#5E9C44']], 3);
  for (let i = 0; i < 90; i++) pdot(b, hash(i, 31) * 108, hy + 2 + hash(i, 32) * 100, hash(i, 33) < .5 ? '#5E9C44' : '#94CF6E');
  // 左：阿米什——小牛棚、马、牛、在牛棚里玩的孩子
  drawBarn(b, 3, hy + 20);
  drawHay(b, 40, hy + 26, 10, 6);
  drawHorse(b, 4, hy + 32, t);
  drawCow(b, 22, hy + 42, t);
  const kidL = t > CH('a2', 1) - .2;
  drawBaby(b, 33, hy + 22 - Math.floor(t * 4) % 2, { eyes: 'happy' });
  if (kidL) for (let i = 0; i < 18; i++) { const x = 16 + ((hash(i, 41) * 34 + t * 3) % 34), y = hy + 6 + hash(i, 42) * 30 + Math.sin(t * 2 + i) * 2; pdot(b, x, y, i % 3 ? '#E8D9B8' : '#A6D96A'); }
  // 右：哈特派——机械化大农场
  drawBigFarm(b, 57, hy + 20);
  prect(b, 60, hy + 40, 44, 14, '#C9B48E'); for (let x = 60; x < 104; x += 3) prect(b, x, hy + 40, 1, 14, '#B39D74');
  const tr = (t * 6) % 70;
  drawTractor(b, 112 - tr, hy + 44, t);
  blit(g, 'farms', 10);
  // 屋里的孩子（画在大棚的窗里）
  const kb = pbuf('kidR', 14, 10); prect(kb, 0, 0, 14, 10, '#CFE2F0'); drawBaby(kb, 1, 2, { eyes: blinkEyes(t, 6) === 'blink' ? 'shut' : 'n' });
  g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF.kidR, 0, 0, 9, 5, (57 + 20) * 10, (hy + 20 - 15) * 10, 90, 50); g.restore();
  // 中线、标签、VS
  g.fillStyle = C.ink; for (let y = 0; y < 1270; y += 24) g.fillRect(534 + ((y / 24) % 2) * 6, y, 12, 24);
  ptag(g, 270, 230, '阿米什', 48, { fill: C.amber });
  ptag(g, 810, 230, '哈特派', 48, { fill: '#C9D3DE' });
  const vp = pop(t, S('a1') + .2, .4) * (1 - clamp((t - S('a2') + .2) / .3));
  if (vp > 0) { g.save(); g.globalAlpha *= clamp(vp * 2); vsBadge(g, 540, 470, vp, t); g.restore(); }
  const sp = pop(t, CH('a1', 2) - .1, .35);
  if (sp > 0 && t < S('a3') - .2) { g.save(); g.translate(540, 340); g.scale(sp, sp); pbox(g, -400, -60, 800, 120, { k: 6 }); ptext(g, '祖先都来自欧洲 · 大家庭 · 都种地', 0, 14, 36, C.white, { align: 'center' }); g.restore(); }
  popTag(g, t, CH('a2', 1) + .3, 270, 470, '孩子泡在牛棚里', 36, { fill: C.amber });
  popTag(g, t, CH('a2', 2) + .3, 810, 470, '机械化大农场', 36, { fill: '#C9D3DE' });
  // 哮喘的比例
  const ba = win(t, S('a3') - .1, S('a4') - .1, .3, .2);
  if (ba > 0) withAlpha(g, ba, () => {
    g.fillStyle = 'rgba(16,13,32,.55)'; g.fillRect(0, 0, W, H);
    pbox(g, 60, 360, 960, 560, { k: 6 });
    ptext(g, '孩子得哮喘的比例', 540, 440, 48, C.white, { align: 'center' });
    const grow = clamp((t - S('a3') - .2) / .9);
    const bar = (x, v, col, s) => { const h = Math.round(360 * v / 25 * grow / 6) * 6; g.fillStyle = '#3B3363'; g.fillRect(x - 90, 520, 180, 360); g.fillStyle = col; g.fillRect(x - 90, 880 - h, 180, h); ptext(g, s, x, 860 - h, 48, col, { align: 'center' }); };
    bar(300, 5.2, C.green, '5.2%'); bar(780, 21.3, C.red, '21.3%');
    ptext(g, '阿米什', 300, 910, 36, C.amber, { align: 'center' }); ptext(g, '哈特派', 780, 910, 36, '#C9D3DE', { align: 'center' });
    const p = pop(t, CH('a3', 1), .35);
    if (p > 0) { g.save(); g.translate(560, 640); g.scale(p, p); ptag(g, 0, 0, '× 4', 72, { fill: C.red, col: C.white }); g.restore(); }
    ptext(g, '过敏（致敏）：7.2% 对 33.3%', 540, 1010, 30, '#CFC6E8', { align: 'center' });
  });
  // 小鼠实验
  const la = E.out(clamp((t - S('a4') + .15) / .35));
  if (la > 0) withAlpha(g, la, () => labMice(g, t));
}
function labMice(g, t) {
  const b = pbuf('lab3', 90, 160);
  pbands(b, 0, 90, [[0, '#E6ECF0'], [92, '#DCE4EA'], [94, '#DCE4EA']], 2);
  for (let x = 0; x < 90; x += 8) prect(b, x, 0, 1, 94, '#CED8DF');
  for (let y = 0; y < 94; y += 8) prect(b, 0, y, 90, 1, '#CED8DF');
  prect(b, 0, 94, 90, 3, '#F4F7F9'); prect(b, 0, 97, 90, 2, '#9AA6B2'); prect(b, 0, 99, 90, 61, '#B8C3CD');
  const fr = Math.floor(t * 6) % 2;
  const sniff = t > S('a4') + .5;
  drawDustJar(b, 26, 94, '#9C7A4A'); drawDustJar(b, 70, 94, '#8E959E');
  const ok = t > CH('a4', 1);
  pspr(b, MOUSE[fr](), 8, 89); MOUSE_TAIL(b, 8, 92, t);
  pspr(b, MOUSE[(fr + 1) % 2](), 52, 89); MOUSE_TAIL(b, 52, 92, t);
  if (sniff) { for (let i = 0; i < 3; i++) { pdot(b, 20 + i * 2, 86 - (Math.floor(t * 4) + i) % 3, '#9C7A4A'); pdot(b, 64 + i * 2, 86 - (Math.floor(t * 4) + i) % 3, '#8E959E'); } }
  if (ok && Math.floor(t * 4) % 2) { pdot(b, 66, 84, '#FF6F6F'); pdot(b, 68, 82, '#FF6F6F'); }
  blit(g, 'lab3', 12);
  g.fillStyle = C.ink; for (let y = 0; y < 1270; y += 24) g.fillRect(534 + ((y / 24) % 2) * 6, y, 12, 24);
  ptext(g, '小鼠哮喘实验：给小鼠闻两家的灰尘', 540, 230, 36, C.ink, { align: 'center' });
  ptag(g, 270, 330, '阿米什家的灰尘', 36, { fill: C.amber });
  ptag(g, 810, 330, '哈特派家的灰尘', 36, { fill: '#C9D3DE' });
  if (ok) {
    popTag(g, t, CH('a4', 2), 270, 820, '✓ 护住了', 48, { fill: C.green });
    popTag(g, t, CH('a4', 1) + .3, 810, 820, '✗ 照样哮喘', 48, { fill: C.red, col: C.white });
  }
}
