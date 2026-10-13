'use strict';
/* scenes2.js：原始人的下巴 → 两百年的数据 → 饭变软 → 咀嚼信号与工地 → 大鼠实验、头骨。 */

const R_LONG = R_NEED[7] + 4;     // 原始人：智齿的车位修出来了
const R_SHORT = 112;              // 现代：修到第二磨牙就停了

/* ================= 过去 ================= */
function past(g, t) {
  // (a) 原始人的下巴：车位够
  if (t < S('p2') - .2) {
    const b = pbuf('site', SITE_W, SITE_H);
    siteBG(b, t, 'savanna');
    const up = clamp((t - S('p1') - .6) / 1.2);
    drawSite(b, t, { R: R_LONG, wis: { mode: 'up', p: up, face: up >= 1 ? 'happy' : 'n' }, crew: up >= 1 ? 'cheer' : 'idle' });
    blit(g, 'site', 6, 0, CAMY);
    slotOverlay(g, t, R_LONG, win(t, SS('past') + .5, S('p2'), .3, .2), { hl: 7 });
    parkSign(g, 100, SY(JAW.gum - 8), .8);
    const op = pop(t, S('p1') + 1.9, .35);
    if (op > 0) { g.save(); g.translate(SX(SLOT_X[7] + 8), SY(JAW.gum - 40)); g.scale(op, op); ptag(g, 0, 0, '✓ 正着长出来', 36, { fill: C.green }); g.restore(); }
    speech(g, t, S('p1') + 2.3, S('p2') - .4, SX(SLOT_X[7] + 8), SY(JAW.gum - 12), '有位置！', { side: 60 });
    return;
  }
  menuBG(g, t);
  // (b) 两百年：阻生比例的折线
  if (t < S('p5') - .2) {
    const a = E.out(clamp((t - S('p2') + .2) / .4));
    g.save(); g.globalAlpha = a;
    pbox(g, 50, 260, 980, 640, { k: 6 });
    ptext(g, '阻生智齿的比例', 100, 340, 48, C.white, { sh: 1 });
    const x0 = 140, x1 = 960, y0 = 820, y1 = 420, xb = 640;   // xb：左边是漫长的工业化以前，右边是最近两百年
    const Y = v => y0 - (y0 - y1) * v / 30;
    g.fillStyle = '#4B4473'; for (const v of [0, 10, 20, 30]) { g.fillRect(x0, Math.round(Y(v)), x1 - x0, 3); ptext(g, v + '%', x0 - 16, Y(v) + 10, 24, '#9C93C0', { align: 'right' }); }
    // 断轴记号
    g.fillStyle = '#151226'; g.fillRect(xb - 14, y1 - 10, 28, y0 - y1 + 20);
    g.fillStyle = '#9C93C0'; for (let k = 0; k < 2; k++) for (let j = 0; j < 6; j++) g.fillRect(xb - 12 + k * 14 + j * 2, y0 + 6 - j * 6, 4, 4);
    ptext(g, '工业化以前（几千到几万年）', (x0 + xb) / 2, y0 + 56, 30, '#CFC6E8', { align: 'center' });
    ptext(g, '最近两百年', (xb + x1) / 2, y0 + 56, 30, C.gold, { align: 'center' });
    // 折线：先平，过了断轴往上翘
    const u = clamp((t - S('p2')) / 2.2), pts = [];
    for (let i = 0; i <= 60; i++) { const f = i / 60; const x = f < .6 ? lerp(x0, xb - 16, f / .6) : lerp(xb + 16, x1, (f - .6) / .4); const v = f < .6 ? 3.4 + Math.sin(i * 1.7) * .4 : lerp(4, 25, Math.pow((f - .6) / .4, 1.6)); pts.push([x, Y(v)]); }
    const n = Math.floor(u * pts.length);
    for (let i = 1; i < n; i++) { if (pts[i - 1][0] < xb && pts[i][0] > xb) continue; g.fillStyle = i > 36 ? C.red : C.green; const [ax, ay] = pts[i - 1], [bx, by] = pts[i]; for (let s = 0; s <= 1; s += .1) g.fillRect(Math.round(lerp(ax, bx, s)) - 4, Math.round(lerp(ay, by, s)) - 4, 8, 8); }
    if (u > .4) ptag(g, 360, Y(3.4) - 60, '不到 5%', 36, { fill: C.green });
    if (u >= 1) { g.save(); const p = pop(t, S('p2') + 2.2, .35); g.translate(x1 - 40, Y(25) - 56); g.scale(p, p); ptag(g, 0, 0, '约 25%', 48, { fill: C.red, col: C.white }); g.restore(); }
    g.restore();
    // (c) 基因没变，饭变了
    const q = E.out(clamp((t - S('p4') + .1) / .4));
    if (q > 0) withAlpha(g, q, () => {
      pbox(g, 60, 960, 450, 250, { k: 6 }); pbox(g, 570, 960, 450, 250, { k: 6 });
      // DNA
      for (let i = 0; i < 12; i++) { const y = 990 + i * 15, s = Math.sin(i * .7 + t * 2) * 50; g.fillStyle = '#5EC8FF'; g.fillRect(170 + s, y, 12, 12); g.fillStyle = '#FF8FB0'; g.fillRect(170 - s, y, 12, 12); if (i % 2) { g.fillStyle = '#4B4473'; g.fillRect(Math.min(170 + s, 170 - s) + 12, y + 4, Math.abs(2 * s) - 12, 4); } }
      ptext(g, '基因', 290, 1070, 48, C.white); ptext(g, '没变', 290, 1140, 48, C.green);
      // 饭碗
      const c = mk(12, 10), cg = c.getContext('2d'); cg.drawImage(FOOD.porridge(), 1, 1);
      g.save(); g.imageSmoothingEnabled = false; g.drawImage(c, 620, 1000, 144, 120); g.restore();
      ptext(g, '饭', 800, 1070, 48, C.white); ptext(g, '变了', 800, 1140, 48, C.red);
    });
    return;
  }
  // (d) 吃的越来越软
  const items = [['生根茎', 'root', 5], ['硬肉干', 'jerky', 5], ['坚果', 'nut', 4], ['面包', 'bread', 2], ['粥', 'porridge', 1], ['面条', 'noodles', 1], ['蛋糕', 'cake', 1], ['奶茶', 'tea', 0]];
  ptext(g, '越来越不用嚼', 540, 330, 72, C.amber, { align: 'center', ol: C.ink, olw: 6, sh: 1 });
  // 箭头：远古 → 今天
  g.fillStyle = '#4B4473'; g.fillRect(100, 420, 880, 10); for (let j = 0; j < 4; j++) g.fillRect(960 + j * 8, 400 + j * 8, 8, 50 - j * 16);
  ptext(g, '远古', 100, 400, 30, '#CFC6E8'); ptext(g, '今天', 980, 400, 30, '#CFC6E8', { align: 'right' });
  items.forEach(([name, key, hard], i) => {
    const p = pop(t, S('p5') + .1 + i * .35, .35); if (p <= 0) return;
    const col = i % 4, row = Math.floor(i / 4), x = 160 + col * 250, y = 560 + row * 330;
    g.save(); g.translate(x, y); g.scale(p, p);
    pbox(g, -100, -90, 200, 260, { k: 5 });
    const sp = FOOD[key](); g.imageSmoothingEnabled = false; g.drawImage(sp, -sp.width * 5, -60 - sp.height * 3, sp.width * 10, sp.height * 10);
    ptext(g, name, 0, 70, 36, C.white, { align: 'center' });
    for (let k = 0; k < 5; k++) { g.fillStyle = k < hard ? C.amber : '#3B3363'; g.fillRect(-80 + k * 34, 110, 26, 26); }
    g.restore();
  });
  withAlpha(g, clamp((t - S('p5') - 3) / .4), () => ptext(g, '方块 = 要嚼多费劲（示意）', 540, 1220, 30, '#9C93C0', { align: 'center' }));
}

/* ================= 工地：咀嚼信号 ================= */
/* 这一幕的年龄和后墙：s2 现代 5→12 岁；s4 原始人 12→18；s5 现代停在 12 */
function siteState(t) {
  if (t < S('s4') - .2) { const age = lerp(5, 12, seg(t, S('s2') + .3, S('s3') + 1.5)); return { age, R: modernR(age), who: 'modern' }; }
  if (t < S('s5') - .2) { const age = lerp(12, 18, seg(t, S('s4') + .2, EN('s4') - .3)); return { age, R: ancientR(age), who: 'ancient' }; }
  return { age: lerp(12, 18, seg(t, S('s5') + .2, EN('s5') - .3)), R: R_SHORT, who: 'modern' };
}
function siteScene(g, t) {
  if (t > S('s6') - .2) return compareJaws(g, t);
  const st = siteState(t), anc = st.who === 'ancient';
  const b = pbuf('site', SITE_W, SITE_H);
  siteBG(b, t, anc ? 'savanna' : 'city');
  const pushing = anc ? st.R < R_LONG - .1 : (st.R < R_SHORT - .1 && t < S('s4'));
  const crew = pushing ? 'push' : (t > S('s5') ? 'sleep' : 'idle');
  let wis = { mode: 'none' };
  if (anc && st.age > 17) wis = { mode: 'up', p: clamp((st.age - 17) * 1.2), face: 'happy' };
  if (!anc && t > S('s5') + 1.4) wis = { mode: 'stuck', ang: .95, face: 'sad', dy: 4 };
  drawSite(b, t, { R: st.R, rise: riseFor(Math.min(st.age, 12.5), t).map((v, i) => i === 7 ? 0 : v), wis, crew });
  blit(g, 'site', 6, 0, CAMY);
  slotOverlay(g, t, st.R, .9, { hl: -1 });
  // 后墙标签和箭头
  const la = win(t, S('s2') + .4, S('s3'), .3, .3);
  if (la > 0) withAlpha(g, la, () => {
    const x = SX(st.R + 24), y = SY(112);
    ptag(g, x - 20, y - 60, '后墙（下颌升支）', 30, { fill: C.paper });
    g.fillStyle = C.amber; const ax = x + 40 + Math.sin(t * 6) * 10;
    for (let j = 0; j < 5; j++) g.fillRect(ax + j * 8, y - 16 + j * 8, 8, 40 - j * 16);
    g.fillRect(ax - 40, y - 4, 44, 16);
  });
  // 上方：嚼东西的小怪 + 开工信号
  const kidA = win(t, S('s3') - .2, S('s6') - .2, .3, .2);
  if (kidA > 0) withAlpha(g, kidA, () => {
    const kb = pbuf('kid', 60, 34);
    const chewing = anc ? Math.floor(t * 5) % 2 : Math.floor(t * 2) % 2;
    drawClawd(kb, 18, 12, anc ? { hat: 'bone', eyes: chewing ? 'squint' : 'n' } : { scarf: true, eyes: chewing ? 'happy' : 'n' });
    const food = anc ? FOOD.jerky() : FOOD.porridge();
    pspr(kb, food, anc ? 40 : 42, anc ? 18 + chewing : 20);
    pbox(g, 40, 180, 520, 300, { k: 6, fill: anc ? 'rgba(60,46,20,.85)' : 'rgba(27,23,48,.88)' });
    g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF.kid, 60, 196, 480, 272); g.restore();
    ptext(g, anc ? '原始人小孩：啃肉干' : (t > S('s5') - .2 ? '现代小孩：喝粥' : '小孩：嚼东西'), 70, 230, 30, C.white, { sh: 1 });
    // 咔嚓
    if (chewing && (anc || t < S('s5'))) ptext(g, anc ? '咔嚓！' : '吧唧', 420, 300, 48, anc ? C.amber : '#CFC6E8', { align: 'center', ol: C.ink, olw: 5 });
    if (!anc && t > S('s5') - .2 && chewing) ptext(g, '吸溜～', 420, 300, 48, '#CFC6E8', { align: 'center', ol: C.ink, olw: 5 });
  });
  // 信号：闪电从嘴边飞向工地
  if (t > S('s3') && t < S('s6') - .2) {
    const rate = anc ? 5 : (t > S('s5') - .2 ? .6 : 2.2), n = Math.floor((t - S('s3')) * rate);
    for (let k = Math.max(0, n - 6); k <= n; k++) {
      const t0 = S('s3') + k / rate, u = (t - t0) / .9; if (u < 0 || u > 1) continue;
      const x = lerp(470, SX(st.R + 30), u), y = lerp(330, SY(GROUND - 12), u) - Math.sin(u * Math.PI) * 120;
      const sp = BOLT(); g.save(); g.imageSmoothingEnabled = false; g.drawImage(sp, x - 18, y - 24, 36, 48); g.restore();
    }
    const tagA = win(t, S('s3') + .6, S('s4') - .2, .3, .2);
    withAlpha(g, tagA, () => ptag(g, 640, 560, '开工信号', 36, { fill: C.gold }));
  }
  speech(g, t, S('s5') + 1.1, EN('s5') - .1, SX(st.R + 36), SY(GROUND - 18), '今天又没活？', { side: -150 });
}
/* s6：两个下巴上下摆在一起比 */
function compareJaws(g, t) {
  menuBG(g, t, '#1A2236');
  const rows = [['原始人', R_LONG, 'savanna', { mode: 'up', p: 1, face: 'happy' }, 270], ['现代', R_SHORT, 'city', { mode: 'stuck', ang: .95, face: 'sad', dy: 4 }, 760]];
  rows.forEach(([name, R, theme, wis, y], i) => {
    const b = pbuf('cmp' + i, SITE_W, 112);
    b.fillStyle = theme === 'savanna' ? '#E9D7A6' : '#BFD7E8'; b.fillRect(0, 0, SITE_W, 112);
    b.save(); b.translate(0, -94); drawJaw(b, R); drawTeeth(b, { wis }); b.restore();
    pbox(g, 30, y - 20, 1020, 112 * 4 + 40, { k: 6, fill: '#000' });
    g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF['cmp' + i], 0, 0, SITE_W, 112, 40, y - 10, SITE_W * 5.6, 112 * 4); g.restore();
    ptag(g, 120, y + 20, name, 36, { fill: i ? '#C9D3DE' : C.gold });
  });
  // 少长的一截
  const p = pop(t, S('s6') + .6, .4);
  if (p > 0) {
    const xa = 40 + (R_SHORT + 2) * 5.6, xb = 40 + (R_LONG + 2) * 5.6, y = 700;
    g.save(); g.globalAlpha *= clamp(p);
    g.fillStyle = C.red; g.fillRect(xa, y, xb - xa, 10); g.fillRect(xa, y - 30, 10, 70); g.fillRect(xb - 10, y - 30, 10, 70);
    ptext(g, '少长的一截', (xa + xb) / 2, y - 44, 36, C.red, { align: 'center', ol: C.ink, olw: 4 });
    g.restore();
  }
}

/* ================= 大鼠实验 ================= */
function rats(g, t) {
  const b = pbuf('lab', 90, 160);
  pbands(b, 0, 90, [[0, '#E6ECF0'], [92, '#DCE4EA'], [94, '#DCE4EA']], 2);
  for (let x = 0; x < 90; x += 8) prect(b, x, 0, 1, 94, '#CED8DF');
  for (let y = 0; y < 94; y += 8) prect(b, 0, y, 90, 1, '#CED8DF');
  prect(b, 0, 94, 90, 3, '#F4F7F9'); prect(b, 0, 97, 90, 2, '#9AA6B2'); prect(b, 0, 99, 90, 61, '#B8C3CD');
  // 两只笼子
  for (const cx of [4, 49]) { prect(b, cx, 52, 37, 42, 'rgba(255,255,255,.35)'); for (let x = cx; x <= cx + 37; x += 4) prect(b, x, 52, 1, 42, '#9AA6B2'); prect(b, cx, 52, 38, 2, '#7E8A96'); prect(b, cx, 92, 38, 2, '#7E8A96'); }
  const fr = Math.floor(t * 6) % 2;
  // 左：硬颗粒；右：糊
  for (let i = 0; i < 5; i++) pspr(b, FOOD.pellet(), 26 + (i % 3) * 4, 87 - Math.floor(i / 3) * 3);
  pspr(b, RAT[fr](), 9, 84); RAT_TAIL(b, 9, 88, t);
  prect(b, 70, 87, 12, 5, '#9AA6B2'); prect(b, 71, 86, 10, 2, '#F1E4C4'); prect(b, 72, 85, 3, 1, '#F7EEDA');
  pspr(b, RAT[(fr + 1) % 2](), 55, 84); RAT_TAIL(b, 55, 88, t);
  blit(g, 'lab', 12);
  g.fillStyle = C.ink; for (let y = 0; y < 1270; y += 24) g.fillRect(534 + ((y / 24) % 2) * 6, y, 12, 24);
  ptag(g, 270, 230, '啃硬颗粒', 48, { fill: C.amber });
  ptag(g, 810, 230, '吃泡软的糊', 48, { fill: '#C9D3DE' });
  withAlpha(g, win(t, S('r2'), 99, .2, 0), () => ptext(g, '同一种饲料 · 幼年大鼠（30 日龄起）', 540, 320, 30, C.ink, { align: 'center' }));
  if (fr) { ptext(g, '咔嚓', 330, 880, 48, C.amber, { align: 'center', ol: C.ink, olw: 5 }); }
  else ptext(g, '吧唧', 860, 880, 48, '#5E6B7A', { align: 'center', ol: '#FFFFFF', olw: 4 });
  // 天数
  const day = Math.max(1, Math.round(60 * seg(t, S('r2') + 1.5, S('r3') + .3)));
  if (t > S('r2') + 1.2) { pbox(g, 380, 410, 320, 110, { k: 6 }); ptext(g, `第 ${day} 天`, 540, 486, 60, C.white, { align: 'center' }); }
  // 下巴长度条
  const ba = win(t, S('r3') + .2, S('r4') - .1, .3, .2);
  if (ba > 0) withAlpha(g, ba, () => {
    pbox(g, 60, 560, 960, 380, { k: 6 });
    ptext(g, '下颌长度（60 天后，平均值）', 100, 630, 36, C.white);
    const bar = (y, v, col, s) => { const w = 700 * v / 21; g.fillStyle = '#3B3363'; g.fillRect(120, y, 700, 70); g.fillStyle = col; g.fillRect(120, y, Math.round(w / 6) * 6 * clamp((t - S('r3') - .3) / .8), 70); ptext(g, s, 840, y + 52, 48, col); };
    bar(680, 20.74, C.amber, '20.7 mm'); bar(800, 17.43, '#9FD3FF', '17.4 mm');
    ptext(g, '硬', 100, 732, 36, C.amber, { align: 'right' }); ptext(g, '软', 100, 852, 36, '#9FD3FF', { align: 'right' });
    const p = pop(t, S('r3') + 1.3, .35);
    if (p > 0) { g.save(); g.translate(700, 1010); g.scale(p, p); ptag(g, 0, 0, '短了约 16%', 48, { fill: C.red, col: C.white }); g.restore(); }
  });
  // 世界各地的头骨
  const wa = E.out(clamp((t - S('r4') + .1) / .4));
  if (wa > 0) withAlpha(g, wa, () => {
    g.fillStyle = 'rgba(20,16,40,.94)'; g.fillRect(0, 0, W, H);
    ptext(g, '世界各地的下颌骨', 540, 320, 60, C.white, { align: 'center', sh: 1 });
    ptext(g, '11 个人群的比较（2011）', 540, 380, 30, '#9C93C0', { align: 'center' });
    [['狩猎采集者', R_LONG + 4, 470], ['农耕人群', R_SHORT + 4, 830]].forEach(([s, R, y], i) => {
      const jb = pbuf('sk' + i, 180, 112);
      jb.save(); jb.translate(0, -94); drawJaw(jb, R, { xray: true }); jb.restore();
      g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF['sk' + i], 0, 0, 180, 112, 60, y, 180 * 4.6, 112 * 3.2); g.restore();
      ptag(g, 220, y + 40, s, 36, { fill: i ? '#C9D3DE' : C.gold });
    });
    const p = pop(t, S('r4') + 1.2, .35);
    if (p > 0) { g.save(); g.translate(880, 640); g.scale(p, p); ptag(g, 0, 0, '更长', 48, { fill: C.gold }); g.restore(); }
  });
}

/* ================= HUD ================= */
function hudLater2(g, t) {
  if (t > SS('past') + .6 && t < S('p2') - .2) hud(g, [{ icon: (g, x, y) => iconSun(g, x, y), text: '下巴停车场 · 原始人' }, { right: true, text: '车位 8/8', col: C.green }], { alpha: win(t, SS('past') + .6, S('p2') - .2, .3, .2) });
  if (t > SS('site') && t < S('s6') - .2) {
    const st = siteState(t), n = R_NEED.filter(r => st.R >= r).length;
    hud(g, [{ icon: (g, x, y) => iconHat(g, x, y), text: st.who === 'ancient' ? '下巴工地 · 原始人' : '下巴工地 · 现代' }, { right: true, text: `年龄 ${Math.floor(st.age)}`, col: C.white }, { right: true, text: `车位 ${n}/8`, col: n === 8 ? C.green : C.white }], { alpha: win(t, SS('site'), S('s6') - .2, .3, .2) });
  }
}
