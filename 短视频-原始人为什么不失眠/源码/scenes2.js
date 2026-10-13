'use strict';
/* scenes2.js：几十万年前（太阳一落，气温一路往下掉，人跟着睡着、在最冷的时候醒来）
   → 如今（卧室一整夜一个温度，开关等不到信号）→ 实验（睡前 1~2 小时洗个热水澡）。 */

/* 一夜的气温曲线：q 0..1 从傍晚到天亮前最冷的时候 */
const nightTemp = q => 1 - Math.pow(clamp(q), .75);
function tempChart(g, x, y, w, h, t, o = {}) {
  pbox(g, x, y, w, h, { k: 6 });
  ptext(g, o.title || '气温 · 一夜', x + 40, y + 62, 32, '#CFC6E8');
  const x0 = x + 70, x1 = x + w - 60, yTop = y + 110, yBot = y + h - 70;
  g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x0, yBot, x1 - x0, 4); g.fillRect(x0, yTop, 4, yBot - yTop);
  (o.xl || ['傍晚', '半夜', '天亮']).forEach((s, i, a) => ptext(g, s, lerp(x0, x1, i / (a.length - 1)), yBot + 44, 26, '#9C93C0', { align: 'center' }));
  const Y = v => lerp(yBot - 10, yTop + 10, v);
  // 虚线参考（野外）
  if (o.ghost) withAlpha(g, o.ghost, () => { g.fillStyle = '#9FD3FF'; for (let i = 0; i <= 60; i += 2) g.fillRect(lerp(x0, x1, i / 60), Y(nightTemp(i / 60)) - 3, (x1 - x0) / 60, 6); });
  // 实线：画到 q
  const q = clamp(o.q ?? 1), f = o.f || nightTemp, col = o.col || '#FF8A3D';
  g.fillStyle = col;
  const N = 80;
  for (let i = 0; i < Math.floor(N * q); i++) { const u0 = i / N; g.fillRect(lerp(x0, x1, u0), Y(f(u0)) - 4, (x1 - x0) / N + 1, 8); }
  if (q > 0) { g.fillStyle = C.white; g.fillRect(lerp(x0, x1, q) - 8, Y(f(q)) - 8, 16, 16); }
  return { x0, x1, Y };
}

/* ================= 几十万年前 ================= */
function ancient(g, t) {
  const t0 = CH('a1', 3), tSleep = CH('a2', 0), tWake = CH('a2', 1) + .2;
  // 天色：傍晚 → 入夜 → 深夜 → 黎明
  const phase = t < t0 ? 0 : t < tSleep ? lerp(0, 1.6, (t - t0) / (tSleep - t0)) : t < tWake ? lerp(1.6, 2.2, (t - tSleep) / (tWake - tSleep)) : lerp(2.2, 3, clamp((t - tWake) / .8));
  const b = pbuf('anc', 108, 192), hy = 100;
  drawNightSky(b, 108, hy, phase, t, { n: 50 });
  if (phase < 1) drawSun(b, 82, hy - 6 + Math.round(clamp(phase) * 16), 7, t);
  else drawMoon(b, 20, 22, 6, skyAt(phase)[0]);
  drawHills(b, 108, hy, mixHex('#4A2E4E', '#151633', clamp(phase / 1.5)), 2, 6);
  drawGround(b, 108, 192, hy, mixHex('#8C5A3A', '#3A2E2A', clamp(phase)), mixHex('#6B4630', '#2A211E', clamp(phase)), 5);
  drawHut(b, 96, hy + 2, 1, '#2E2434');
  const fk = clamp(1 - Math.max(0, phase - .6) / 1.8, .1, 1);
  fireGlow(b, 54, hy + 20, 24, .3 + .6 * clamp(phase)); drawFire(b, 54, hy + 22, t, fk);
  if (t > tSleep - .2 && t < tWake) drawBreeze(b, 108, 20, 80, t, .7);
  const asleep = t > tSleep && t < tWake, woke = t >= tWake;
  const shiv = woke && t < tWake + 1.2 ? (Math.floor(t * 16) % 2 ? 1 : -1) : 0;
  [[8, 'cave'], [28, 'tribe'], [72, 'tribe2']].forEach(([x, who], i) => {
    const y = hy + 8, eyes = asleep ? 'shut' : woke ? 'wide' : blinkEyes(t, i);
    if (who === 'cave') drawCaveman(b, x + shiv, y, t, { eyes, arms: woke && t > S('d4') ? 'up' : 'n' });
    else drawTribe(b, x + shiv, y, t, { eyes, seed: i + 2 });
    if (asleep) drawZzz(b, x + 20, y - 8 - i, t + i * .3, '#E8E4FF');
    if (shiv) { pline(b, x - 3, y + 4, x - 5, y + 6, '#BFE6FF'); pline(b, x + 26, y + 4, x + 28, y + 6, '#BFE6FF'); }
  });
  blit(g, 'anc', 10);
  // 一夜的气温曲线
  const pc = E.out(clamp((t - CH('a1', 3) + .2) / .4));
  if (pc > 0) withAlpha(g, pc, () => {
    const q = clamp((t - t0) / (tWake - t0));
    const r = tempChart(g, 100, 300, 800, 420, t, { q, title: '气温 · 一夜（野外）' });
    if (t > tSleep - .05) { const u = (tSleep - t0) / (tWake - t0); g.fillStyle = '#9FD3FF'; g.fillRect(lerp(r.x0, r.x1, u) - 3, 400, 6, 230); ptext(g, '睡着', lerp(r.x0, r.x1, u), 395, 28, '#9FD3FF', { align: 'center' }); }
    if (t > tWake - .05) ptext(g, '最冷 · 醒来', r.x1 - 10, r.Y(nightTemp(1)) - 24, 28, C.gold, { align: 'right' });
  });
  popTag(g, t, CH('a1', 1) - .1, 480, 260, '大自然每晚按一次开关', 36, { fill: C.amber, t1: CH('a1', 3) });
  dialogBox(g, t, 'd4', PORTRAIT.cave);
}

/* ================= 如今：卧室一整夜一个温度 ================= */
/* 卧室（缓冲 108×192）：o.ac 空调，o.rad 暖气，o.wall 加厚的墙，o.cool 开窗凉风 */
function bedroom(b, t, o = {}) {
  const hy = 136;
  pbands(b, 0, 108, [[0, '#2A2C55'], [hy, '#33356A']], 2);
  for (let x = 0; x < 108; x += 9) prect(b, x, 0, 1, hy, '#2F3160');
  pbands(b, 0, 108, [[hy, '#4A3E5C'], [192, '#3E3350']], 2);
  for (let y = hy + 6; y < 192; y += 8) prect(b, 0, y, 108, 1, '#43375A');
  if (o.wall) { const k = Math.round(6 * o.wall); for (let y = 0; y < hy; y += 4) { prect(b, 0, y, k, 3, '#7A5A6A'); prect(b, 108 - k, y, k, 3, '#7A5A6A'); } }
  drawWindowCity(b, 8, 34, 30, 22, t);
  if (o.cool) drawBreeze(b, 60, 34, 30, t, o.cool);
  if (o.ac) { b.save(); b.globalAlpha *= o.ac; drawAC(b, 60, 28, t, { on: o.acOn }); b.restore(); }
  if (o.rad) drawRadiator(b, 12, 134, 6, t, o.radGlow || 0);
  prect(b, 64, 58, 22, 9, '#1B1730'); prect(b, 65, 59, 20, 7, '#0E2A1E');
}
function modern(g, t) {
  const b = pbuf('room', 108, 192);
  const wall = E.out(clamp((t - CH('m1', 1)) / .4)), rad = t > CH('m1', 2) - .1, ac = clamp((t - CH('m1', 3) + .1) / .3);
  bedroom(b, t, { wall, rad, radGlow: rad ? .8 : 0, ac, acOn: ac > .5 });
  // 床和"你"：翻来覆去
  const toss = t > S('m2') ? Math.floor((t - S('m2')) / 1.3) % 2 === 1 : false;
  drawBed(b, 44, 126, 52);
  drawYou(b, 50, 112 - (toss ? 1 : 0), t, { night: true, eyes: t > S('m2') ? (t > S('d5') ? 'tired' : 'wide') : blinkEyes(t, 1) }, toss);
  blanket(b, 44, 126, 52, '#6E9BD6');
  // 墙上的开关：等不到信号
  drawSwitch(b, 10, 70, t, 0, { face: t > CH('m2', 1) ? 'shock' : 'n' });
  blit(g, 'room', 10);
  // 钟：时间一路往后跳
  const hm = t < CH('m1', 4) ? 23 * 60 : Math.min(23 * 60 + (t - CH('m1', 4)) * 22, 26 * 60 + 47);
  const clock = `${String(Math.floor(hm / 60) % 24).padStart(2, '0')}:${String(Math.floor(hm % 60)).padStart(2, '0')}`;
  ptext(g, clock, 750, 655, 56, '#5BE37D', { align: 'center' });
  if (ac > .5) popTag(g, t, CH('m1', 3) + .1, 760, 440, '空调 26℃', 32, { fill: '#BFE6FF' });
  if (rad) popTag(g, t, CH('m1', 2), 200, 1180, '暖气', 30, { fill: '#FFB08A', t1: S('m2') });
  if (wall > .3) popTag(g, t, CH('m1', 1), 240, 300, '墙更厚、更保温', 30, { fill: '#E8C08A', t1: CH('m1', 4) - .1 });
  if (t > CH('m2', 1) - .1) popTag(g, t, CH('m2', 1), 250, 1140, '等待降温信号……', 28, { fill: '#C9D3DE' });
  // 一整夜的卧室温度：一条直线（叠一条野外的虚线对比）
  const pc = win(t, CH('m1', 4) - .1, S('m2') - .1, .3, .25);
  if (pc > 0) withAlpha(g, pc, () => {
    const q = clamp((t - CH('m1', 4)) / 1.2);
    tempChart(g, 100, 300, 800, 420, t, { q, f: () => .62, col: C.red, ghost: clamp((t - CH('m1', 5)) / .4), title: '卧室温度 · 一夜' });
    if (t > CH('m1', 5)) { ptext(g, '卧室：一条直线', 860, 470, 30, C.red, { align: 'right' }); ptext(g, '野外：一路往下掉', 860, 640, 28, '#9FD3FF', { align: 'right' }); }
  });
  // 数羊
  const ps = win(t, S('d5') - .1, EN('d5') + .4, .25, .25);
  if (ps > 0) withAlpha(g, ps, () => {
    pbox(g, 440, 700, 440, 290, { k: 6, fill: 'rgba(255,255,255,.95)', rim: '#FFFFFF' });
    const sb = pbuf('sheep', 40, 22); sb.clearRect(0, 0, 40, 22);
    const ph = ((t - S('d5')) * 1.4) % 1, sx = Math.round(lerp(-6, 32, ph)), sy = 12 - Math.round(Math.sin(ph * Math.PI) * 8);
    drawFence(sb, 18, 21); pspr(sb, SHEEP(), sx, sy);
    put(g, 'sheep', 0, 0, 40, 22, 460, 730, 10);
    ptext(g, `第 ${Math.min(300, 280 + Math.floor((t - S('d5')) * 14))} 只`, 660, 968, 30, C.ink, { align: 'center' });
  });
  if (t > S('m3') - .1) source(g, 'Yetish 等，Current Biology 2015', 100, 680, { align: 'left' });
  dialogBox(g, t, 'd5', PORTRAIT.you);
}

/* ================= 实验：睡前 1~2 小时，洗个热水澡 ================= */
function lab(g, t) {
  const b = pbuf('bath', 108, 192), fy = 150;
  drawTiles(b, 0, 0, 108, fy);
  pbands(b, 0, 108, [[fy, '#B9D7E2'], [192, '#9FC4D2']], 2);
  for (let x = 0; x < 108; x += 8) prect(b, x, fy, 1, 42, '#A9CAD6');
  const showerOn = t > CH('l1', 2) - .1 && t < S('l3') + .3, out = t > CH('l3', 1) - .1;
  const steam = clamp((t - CH('l1', 2)) / 1.2) * (out ? clamp(1 - (t - CH('l3', 1)) / 4, .3, 1) : 1);
  drawShower(b, 66, 62, t, showerOn, steam, 30);
  // 浴帘杆和帘子
  prect(b, 40, 40, 66, 1, '#9AA1AD'); for (let i = 0; i < 5; i++) prect(b, 42 + i * 3, 41, 2, 50, i % 2 ? '#F2A0C0' : '#F7C4D8');
  const yx = out ? Math.round(lerp(58, 20, E.io(clamp((t - CH('l3', 1) + .1) / .6)))) : 58;
  drawYou(b, yx, 104, t, { eyes: t < CH('l1', 2) ? 'up' : (out ? 'n' : 'happy') });
  const vk = t > CH('l3', 2) - .1 ? (t > MK('l3', 0) ? 1 : .55) : 0;
  drawVents(b, yx, 104, t, vk, { len: t > MK('l3', 0) ? 1.6 : 1 });
  if (out) { prect(b, yx + 2, 100, 20, 3, '#FFFFFF'); prect(b, yx + 2, 102, 20, 1, '#DCE4EE'); }
  blit(g, 'bath', 10);
  if (t < CH('l1', 2)) popText(g, t, S('l1') + .2, CH('l1', 2), '？', 700, 920, 120, C.white);
  popText(g, t, CH('l1', 2), S('l2') - .1, '热水澡？！', 480, 330, 110, C.amber);
  // 汇总了十几项研究
  const pp = win(t, S('l2') - .05, S('l3') - .1, .3, .25);
  if (pp > 0) withAlpha(g, pp, () => {
    pbox(g, 100, 250, 800, 520, { k: 6 });
    const n = Math.min(17, Math.floor((t - S('l2')) * 14));
    for (let i = 0; i < n; i++) {
      const x = 150 + (i % 9) * 66 + (i >= 9 ? 33 : 0), y = 290 + (i >= 9 ? 70 : 0);
      g.fillStyle = C.ink; g.fillRect(x - 4, y - 4, 56, 68); g.fillStyle = '#FFF4DF'; g.fillRect(x, y, 48, 60);
      g.fillStyle = '#9A8E7A'; for (let j = 0; j < 4; j++) g.fillRect(x + 8, y + 12 + j * 11, j === 3 ? 18 : 32, 4);
    }
    if (n >= 17) ptext(g, '汇总 17 项研究', 860, 462, 32, C.gold, { align: 'right' });
    if (t > CH('l2', 1) - .05) { ptext(g, '何时：睡前 1~2 小时', 150, 540, 40, C.white); }
    if (t > CH('l2', 2) - .05) { ptext(g, '水温：40~42.5℃（10 分钟就有用）', 150, 610, 36, C.white); }
    if (t > CH('l2', 3) - .05) {
      const p = pop(t, CH('l2', 3), .35);
      g.save(); g.translate(480, 700); g.scale(p, p);
      prich(g, '平均早 {10 分钟} 睡着', 0, 0, 56, C.white, C.gold, { align: 'center' });
      g.restore();
    }
    source(g, 'Haghayegh 等，Sleep Medicine Reviews 2019', 880, 752);
  });
  // 热水怎么会降温：洗完以后体温掉得更快
  const pc = E.out(clamp((t - CH('l3', 2) + .2) / .35));
  if (pc > 0) withAlpha(g, pc, () => {
    const qa = clamp((t - CH('l3', 2)) / (MK('l3', 1) + .6 - CH('l3', 2)));
    const bathF = u => u < .18 ? .7 + u * .9 : .86 - (u - .18) * 1.1;
    const plain = u => .74 - u * .32;
    const r = tempChart(g, 100, 250, 800, 470, t, { q: qa, f: bathF, col: C.red, title: '体温 · 洗完澡以后', xl: ['洗澡', '1 小时', '2 小时'] });
    withAlpha(g, .6, () => { g.fillStyle = '#C9D3DE'; for (let i = 0; i < 80 * qa; i += 2) g.fillRect(lerp(r.x0, r.x1, i / 80), r.Y(plain(i / 80)) - 3, (r.x1 - r.x0) / 80, 6); });
    const ly = r.Y(.42); g.fillStyle = '#5EC8FF'; for (let x = r.x0; x < r.x1; x += 24) g.fillRect(x, ly - 2, 12, 4);
    ptext(g, '关机线', r.x0 + 10, ly - 14, 24, '#9FD3FF');
    if (qa > .3) { ptext(g, '洗了热水澡', 860, 400, 26, C.red, { align: 'right' }); ptext(g, '没洗', 860, 440, 26, '#C9D3DE', { align: 'right' }); }
    if (t > MK('l3', 1)) { const u = (.86 - .42) / 1.1 + .18; ptext(g, 'Zzz', lerp(r.x0, r.x1, u), ly + 56, 32, '#CFC6E8', { align: 'center' }); }
  });
  if (vk > 0) popTag(g, t, CH('l3', 2), 300, 1000, '散热口全开', 30, { fill: C.amber });
}
