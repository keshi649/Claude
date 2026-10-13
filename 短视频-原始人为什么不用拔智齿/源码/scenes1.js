'use strict';
/* scenes1.js：开头（X 光片 + 数据）和"下巴停车场"。 */

/* ================= 共用：下巴工地 =================
   世界 180×320，P=6。下巴在 y 64~192，地面 y=200；施工队在后墙（升支）右边推墙。 */
const SITE_W = 180, SITE_H = 340, GROUND = 200;
const CAMY = 16;                                         // 工地镜头往下挪一点，让下巴落在画面中间
const SX = x => x * 6, SY = y => (y - CAMY) * 6;          // 世界坐标 → 屏幕坐标（P=6）
const SLOT_X = rowX(JAW.x0 + 6);                       // 8 个车位（牙）的左边缘
const SLOT_END = SLOT_X.map((x, i) => x + TOOTH[ROW[i]][0]);
const R_NEED = SLOT_END.map(x => x + 1);               // 后墙至少要退到这里，这颗牙才放得下
/* 背景：theme 'city'（现代）或 'savanna'（原始） */
function siteBG(g, t, theme) {
  if (theme === 'savanna') {
    pbands(g, 0, SITE_W, [[0, '#4FA9E8'], [70, '#7CC4F2'], [140, '#B5E2FA'], [166, '#D6F0FB'], [172, '#D6F0FB']], 3);
    for (let x = 0; x < SITE_W; x++) { const h1 = 6 + Math.sin(x * .07) * 3; prect(g, x, 172 - h1, 1, h1, '#A9CFC0'); }
    drawAcaciaS(g, 30, 174, .6); drawAcaciaS(g, 150, 173, .45);
    drawSunS(g, 150, 46, 9, t);
    pbands(g, 0, SITE_W, [[172, '#E3C46A'], [196, '#D3AE58'], [240, '#C09A48'], [SITE_H, '#B08C40']], 3);
  } else {
    pbands(g, 0, SITE_W, [[0, '#7CC8F2'], [120, '#B9E4F8'], [172, '#D3EEF8']], 3);
    for (let x = 0; x < SITE_W; x += 9) { const hh = 14 + Math.floor(hash(x, 3) * 28); prect(g, x, 172 - hh, 8, hh, '#A9CBE0'); for (let k = 0; k < hh - 4; k += 4) if (hash(x, k) < .5) prect(g, x + 2 + (k % 2) * 3, 172 - hh + 2 + k, 2, 2, '#C7E0EE'); }
    drawSunS(g, 150, 46, 9, t);
    prect(g, 0, 160, SITE_W, 12, '#3E7FC1'); for (let x = 0; x < SITE_W; x += 12) prect(g, x, 160, 1, 12, '#5D9AD6');
    pbands(g, 0, SITE_W, [[172, '#9A7552'], [196, '#8A6747'], [260, '#7A5A3E'], [SITE_H, '#6A4E36']], 3);
  }
  for (let i = 0; i < 80; i++) pdot(g, hash(i, 9) * SITE_W, 176 + hash(i, 8) * (SITE_H - 176), hash(i, 7) < .5 ? 'rgba(255,255,255,.18)' : 'rgba(0,0,0,.15)');
  for (let x = 0; x < SITE_W; x += 8) { prect(g, x, GROUND + 4, 4, 2, '#F2C230'); prect(g, x + 4, GROUND + 4, 4, 2, '#1B1730'); }
}
/* 草原用的小号树和太阳（直接复用第一集的画法） */
function drawAcaciaS(g, x, y, s) { drawAcacia(g, x, y, s); }
function drawSunS(g, x, y, r, t) { drawSun(g, x, y, r, t, { spin: true }); }

/* st：{R, upto, rise[], wis:{…}, crew:'push'|'idle'|'sleep'|'cheer'|'hidden', wear, shift[], pal} */
function drawSite(g, t, st) {
  const R = st.R;
  // 托架
  prect(g, 30, 192, 6, GROUND - 192, '#8A5A35'); prect(g, R - 6, 192, 6, GROUND - 192, '#8A5A35');
  drawJaw(g, R);
  drawTeeth(g, { upto: st.upto ?? 7, rise: st.rise, wis: st.wis, wear: st.wear, shift: st.shift, pal: st.pal });
  // 施工队：在后墙右边推
  const crew = st.crew || 'hidden';
  if (crew !== 'hidden') {
    const wallX = R + Math.round((GROUND - 150) * .12) + 22;
    [[0, 0], [1, 26]].forEach(([i, dx]) => {
      const x = wallX + 1 + dx, y = GROUND - 16;
      let o = { hat: 'hard', eyes: blinkEyes(t, i + 2, 'l') };
      if (crew === 'push') o = { hat: 'hard', eyes: 'squint', arms: 'upL', legs: walkLegs(t + i * .2, 7) };
      if (crew === 'sleep') o = { hat: 'hard', eyes: 'shut', arms: 'dn' };
      if (crew === 'cheer') o = { hat: 'hard', eyes: 'happy', arms: 'up' };
      const bob = crew === 'cheer' ? (Math.floor(t * 6 + i) % 2) * 2 : 0;
      drawClawd(g, x - (crew === 'push' ? 2 : 0), y - bob, o, true);
    });
    if (crew === 'sleep') for (let i = 0; i < 2; i++) { const u = (t * .7 + i * .5) % 1; g.globalAlpha = 1 - u; pdot(g, wallX + 14 + u * 6 + i * 26, GROUND - 22 - u * 12, '#FFFFFF'); pdot(g, wallX + 15 + u * 6 + i * 26, GROUND - 22 - u * 12, '#FFFFFF'); g.globalAlpha = 1; }
  }
}
/* 车位标线（全分辨率叠加）：P=6；hl 高亮第几个车位；full 表示最后一个车位被墙占了 */
function slotOverlay(g, t, R, a = 1, o = {}) {
  if (a <= 0) return;
  const y0 = SY(JAW.gum - 26), y1 = SY(JAW.gum - 1);
  g.save(); g.globalAlpha *= a;
  for (let i = 0; i <= 8; i++) {
    const x = i < 8 ? SX(SLOT_X[i] - .5) : SX(SLOT_END[7] + .5);
    if (i === 8 && R < R_NEED[7]) continue;
    for (let y = y0; y < y1; y += 24) { g.fillStyle = C.ink; g.fillRect(Math.round(x) - 5, y - 2, 10, 16); g.fillStyle = '#FFFFFF'; g.fillRect(Math.round(x) - 3, y, 6, 12); }
  }
  for (let i = 0; i < 8; i++) {
    const cx = SX((SLOT_X[i] + SLOT_END[i]) / 2), blocked = R < R_NEED[i];
    if (blocked && i === 7) continue;
    ptext(g, String(i + 1), cx, y0 - 16, 36, i === (o.hl ?? -1) ? C.gold : '#FFFFFF', { align: 'center', ol: C.ink, olw: 4 });
  }
  g.restore();
}
/* 停车场的 P 牌子 */
function parkSign(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.fillStyle = C.ink; g.fillRect(-6, 0, 12, 160); g.fillStyle = '#9AA1AD'; g.fillRect(-3, 0, 6, 160);
  g.fillStyle = C.ink; g.fillRect(-54, -108, 108, 108); g.fillStyle = '#2F6FD0'; g.fillRect(-48, -102, 96, 96);
  ptext(g, 'P', 0, -26, 96, C.white, { align: 'center' });
  g.restore();
}

/* ================= 草原（片尾用，沿用第一集的画法） ================= */
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

/* ================= 开头：X 光片 + 数据 ================= */
function hook(g, t) {
  g.fillStyle = '#151226'; g.fillRect(0, 0, W, H);
  // 诊室的墙：竖条纹
  for (let x = 0; x < W; x += 60) { g.fillStyle = x % 120 ? '#1A1630' : '#1E1A38'; g.fillRect(x, 0, 60, H); }
  // 观片灯 + X 光片
  const b = pbuf('pano', PANO_W, PANO_H);
  const stuck = drawPanoramic(b, t, { stuck: true });
  const bx = 20, by = 380, P = 4;
  g.fillStyle = '#0B0918'; g.fillRect(bx - 10, by - 10, PANO_W * P + 20, PANO_H * P + 20);
  g.fillStyle = '#E8EEF6'; g.fillRect(bx - 4, by - 4, PANO_W * P + 8, PANO_H * P + 8);
  g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF.pano, bx, by, PANO_W * P, PANO_H * P); g.restore();
  // 观片灯的光
  g.save(); g.globalCompositeOperation = 'lighter'; const gr = g.createRadialGradient(540, by + 300, 50, 540, by + 300, 700); gr.addColorStop(0, 'rgba(120,170,255,.12)'); gr.addColorStop(1, 'rgba(120,170,255,0)'); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
  // 圈出卡住的智齿
  if (stuck) {
    const cx = bx + stuck[0] * P, cy = by + stuck[1] * P, r = 84 + Math.sin(t * 6) * 6;
    const blink = t < 4 || Math.floor(t * 3) % 2 === 0;
    if (blink) { g.strokeStyle = C.red; g.lineWidth = 8; g.setLineDash([18, 12]); g.lineDashOffset = -t * 40; g.strokeRect(cx - r, cy - r * .8, r * 2, r * 1.6); g.setLineDash([]); }
    const tp = pop(t, .35, .35);
    if (tp > 0) { g.save(); g.translate(cx - 40, cy - r * .8 - 46); g.scale(tp, tp); ptag(g, 0, 0, '⚠ 智齿', 36, { fill: C.red, col: C.white }); g.restore(); }
  }
  // 标题
  const tp = 1 + .015 * Math.sin(t * 4);
  g.save(); g.translate(540, 200); g.scale(tp, tp); g.rotate(-.02);
  ptext(g, '原始人为什么', 0, -40, 96, C.white, { align: 'center', ol: C.ink, olw: 9, sh: 1 });
  ptext(g, '不用拔智齿？', 0, 110, 132, C.amber, { align: 'center', ol: C.ink, olw: 10, sh: 1 });
  g.restore();
  // 数据：如今约 1/4，工业化以前不到 1/20
  const p1 = E.out(clamp((t - S('h2') + .1) / .4)), p2 = E.out(clamp((t - S('h3') + .1) / .4));
  if (p1 > 0) withAlpha(g, p1, () => {
    pbox(g, 40, 1010, 480, 230, { k: 6 });
    ptext(g, '如今', 80, 1072, 36, '#CFC6E8');
    for (let i = 0; i < 4; i++) {
      const c = pbuf('ic' + i, 32, 30);
      if (i === 2) drawSwollen(c, 2, 12, t, {}); else drawClawd(c, 2, 12, { eyes: blinkEyes(t, i) });
      g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF['ic' + i], 70 + i * 104, 1090, 96, 90); g.restore();
    }
    ptext(g, '约 1/4', 380, 1072, 48, C.red, { align: 'center' });
  });
  if (p2 > 0) withAlpha(g, p2, () => {
    pbox(g, 560, 1010, 480, 230, { k: 6 });
    ptext(g, '工业化以前', 600, 1072, 36, '#CFC6E8');
    for (let i = 0; i < 20; i++) {
      const c = pbuf('cv' + (i === 13 ? 1 : 0), 32, 30);
      if (i === 13) drawSwollen(c, 2, 12, t, { hat: 'bone' }); else drawClawd(c, 2, 12, { hat: 'bone', eyes: 'n' });
      g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF['cv' + (i === 13 ? 1 : 0)], 592 + (i % 10) * 42, 1094 + Math.floor(i / 10) * 60, 40, 38); g.restore();
    }
    ptext(g, '<1/20', 960, 1072, 48, C.green, { align: 'center' });
  });
}

/* ================= 下巴停车场（现代） ================= */
/* 年龄 → 后墙位置：6 岁前放下第一磨牙，12 岁前放下第二磨牙，之后停在 112（智齿的车位没修出来） */
function modernR(age) {
  if (age < 5) return 76;
  if (age < 6) return lerp(76, R_NEED[5] + 1, E.io(age - 5));
  if (age < 11) return R_NEED[5] + 1;
  if (age < 12) return lerp(R_NEED[5] + 1, 112, E.io(age - 11));
  return 112;
}
function ancientR(age) {
  if (age < 12) return modernR(age);
  if (age < 17) return lerp(112, R_NEED[7] + 4, E.io((age - 12) / 5));
  return R_NEED[7] + 4;
}
/* 停车场这一幕的年龄：l2 里 5→12 岁，l3 里 12→18 岁 */
const lotAge = t => t < S('l2') ? 5 : t < S('l3') ? lerp(5, 12, seg(t, S('l2') + .3, EN('l2') - .4)) : lerp(12, 18, seg(t, S('l3') + .2, S('l3') + 2.2));
function riseFor(age, t) {
  return ROW.map((k, i) => i < 5 ? 1 : i === 5 ? clamp((age - 5.6) * 2.5) : i === 6 ? clamp((age - 11.6) * 2.5) : 0);
}
function lot(g, t) {
  const b = pbuf('site', SITE_W, SITE_H);
  siteBG(b, t, 'city');
  const age = lotAge(t), R = modernR(age);
  // 智齿：先在骨头里冒头，再试着往上长，长不上去就倒向前面
  let wis = { mode: 'none' };
  if (t > S('l3') + 1.5) {
    const tryUp = clamp((t - S('l4') - .2) / .8), tilt = E.out(clamp((t - S('l5') - .2) / .7));
    if (t < S('l5')) wis = { mode: 'up', p: tryUp * .35 - .1, face: t > S('l4') + 1 ? 'sad' : 'n', dx: Math.round(Math.sin(t * 30) * (t > S('l4') + .9 ? 1 : 0)) };
    else wis = { mode: 'stuck', ang: lerp(0, .95, tilt), face: 'sad', dy: Math.round(lerp(-2, 4, tilt)) };
  }
  const crew = R < 111.9 && Math.abs(R - modernR(age + .05)) > .01 ? 'push' : (t > S('l2') && t < S('l4') ? 'idle' : 'hidden');
  drawSite(b, t, { R, rise: riseFor(age, t), wis, crew });
  // 发炎：牙龈红肿 + 细菌 + 食物残渣
  if (t > S('l6') - .1 && t < SE('lot')) {
    const k = clamp((t - S('l6')) / .6), x = R_NEED[6] - 2;
    b.globalAlpha = .6 + .3 * Math.sin(t * 8); pell(b, x + 4, JAW.gum + 1, 8 * k, 3 * k, '#E2414F'); b.globalAlpha = 1;
    for (let i = 0; i < 6; i++) { const u = clamp((t - S('l6') - i * .15) / .5); if (u > 0) pdot(b, x + (i % 3) * 2, JAW.gum - 8 + u * 9 + (i > 2 ? 1 : 0), i % 2 ? '#C8934E' : '#E8C27A'); }
    if (t > S('l6') + 1) for (let i = 0; i < 4; i++) { const gx = x + 6 + Math.round(Math.sin(t * 3 + i * 2) * 3) + i * 2, gy = JAW.gum + 4 + (i % 2) * 3; prect(b, gx, gy, 2, 2, '#69C04A'); pdot(b, gx, gy, '#2F7A2A'); }
  }
  blit(g, 'site', 6, 0, CAMY);
  slotOverlay(g, t, R, win(t, S('l1') - .2, SE('lot'), .3, .2), { hl: t > S('l3') ? 7 : t > S('l2') + 2.2 ? 6 : t > S('l2') ? 5 : -1 });
  parkSign(g, 100, SY(JAW.gum - 8), .8);
  // 年龄进度条
  const aa = win(t, S('l2') - .3, S('l5'), .3, .3);
  if (aa > 0) withAlpha(g, aa, () => {
    pbox(g, 60, 190, 960, 120, { k: 6 });
    const x0 = 120, x1 = 960, ax = a => x0 + (x1 - x0) * a / 25;
    g.fillStyle = '#3B3363'; g.fillRect(x0, 262, x1 - x0, 16); g.fillStyle = C.amber; g.fillRect(x0, 262, ax(Math.min(25, age)) - x0, 16);
    [[6, '6 岁'], [12, '12 岁'], [18, '18～25 岁']].forEach(([a, s]) => { g.fillStyle = C.white; g.fillRect(Math.round(ax(a)) - 3, 254, 6, 32); ptext(g, s, ax(a), 244, 24, age >= a ? C.gold : '#CFC6E8', { align: 'center' }); });
    ptext(g, `年龄 ${Math.floor(age)} 岁`, x0, 240, 24, C.white);
  });
  // 牙的名字
  const ta = win(t, S('l2') + .6, S('l4'), .3, .3);
  if (ta > 0) withAlpha(g, ta, () => {
    if (age > 6) nameTagAt(g, SX((SLOT_X[5] + SLOT_END[5]) / 2), SY(JAW.gum + 24), '第一磨牙');
    if (age > 12) nameTagAt(g, SX((SLOT_X[6] + SLOT_END[6]) / 2), SY(JAW.gum + 34), '第二磨牙');
  });
  if (t > S('l3') + 1.2 && t < S('l5')) nameTagAt(g, SX(SLOT_X[7] + 8), SY(JAW.gum + 30), '智齿', C.amber);
  // 车位已满
  const fp = pop(t, S('l4') + .9, .3);
  if (fp > 0 && t < SE('lot')) {
    g.save(); g.translate(SX(112 + 16), SY(112)); g.scale(fp, fp); g.rotate(.05);
    pbox(g, -150, -60, 300, 120, { k: 6, fill: '#D9443B', rim: C.ink }); ptext(g, '车位已满', 0, 20, 60, C.white, { align: 'center' });
    g.restore();
  }
  // 阻生
  const zp = pop(t, S('l5') + .9, .35);
  if (zp > 0 && t < S('l6') + .3) { g.save(); g.translate(SX(SLOT_X[7] + 6), SY(JAW.gum + 30)); g.scale(zp, zp); ptag(g, 0, 0, '阻生', 48, { fill: C.red, col: C.white }); g.restore(); }
  speech(g, t, S('l5') + .5, EN('l5') - .2, SX(SLOT_X[7] + 5), SY(JAW.gum - 2), '让一让……我也有车位票！', { side: -160 });
  // 后果：三个小标签
  const cons = [['塞食物', SX(SLOT_X[6] + 2), SY(JAW.gum - 34)], ['发炎', SX(SLOT_X[7] + 4), SY(JAW.gum + 14)], ['顶坏邻牙', SX(SLOT_X[6] - 2), SY(JAW.gum + 30)]];
  cons.forEach(([s, x, y], i) => { const p = pop(t, S('l6') + .3 + i * .5, .3); if (p > 0 && t < SE('lot')) { g.save(); g.translate(x, y); g.scale(p, p); ptag(g, 0, 0, s, 36, { fill: i === 1 ? C.red : C.paper, col: i === 1 ? C.white : C.ink }); g.restore(); } });
  // 修小了
  if (t > S('l7') + .8) stamp(g, 760, 1120, '修小了', clamp((t - S('l7') - .8) / .5), { px: 60, rot: -.1 });
}
function nameTagAt(g, x, y, s, col = C.paper) { ptag(g, x, y, s, 24, { fill: col }); }
