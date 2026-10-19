'use strict';
/* scenes2.js：他们怎么歇（营地里没有椅子，蹲着、跪着；蹲着时腿上的肌肉还在上班，"你"往椅子上一靠就全下班了），
   肌肉下班会怎样（腿上的肌肉是用糖大户：工厂一关门，血管里的糖块车就堵住；实验：每坐 20 分钟起来走 2 分钟，饭后血糖少涨约 1/4）。 */

/* ================= 他们怎么歇 ================= */
function rest(g, t) {
  if (t < S('s2') - .15) { restCamp(g, t); return; }
  restMeter(g, t);
}
/* 营地：篝火边一个蹲着、一个跪着、一个坐在地上；"没有椅子" */
function restCamp(g, t) {
  const b = pbuf('rc', 108, 192);
  savannaBG(b, t, 92);
  drawHut(b, 86, 96, 24);
  drawFire(b, 47, 116, t);
  blit(g, 'rc', 10);
  const k = 10;
  const ppl = [
    { cx: 260, by: 1150, o: { pose: 'squat', arms: Math.floor(t * 2) % 2 ? 'upR' : 'n' }, tag: '蹲着', seed: 2 },
    { cx: 700, by: 1150, o: { pose: 'kneel' }, tag: '跪着', seed: 5, flip: true },
    { cx: 470, by: 1010, o: { pose: 'sit', eyes: 'happy' }, tag: null, seed: 7 },
  ];
  ppl.forEach(p => { shadowAt(g, p.cx, p.by, k); crabAt(g, p.cx, p.by, k, hadzaO(t, p.o, p.seed), p.flip); });
  // 跪着的人在削箭杆
  g.fillStyle = '#8C6440'; g.fillRect(560, 1060, 90, 8);
  popTag(g, t, SS('rest') + .1, 480, 250, '哈扎人怎么歇', 44, { fill: C.gold });
  // 没有椅子
  const pc = pop(t, S('s1') - .5, .3);
  if (pc > 0) {
    g.save(); g.translate(480, 470); g.scale(pc, pc);
    pbox(g, -200, -110, 400, 220, { k: 6, fill: 'rgba(255,255,255,.92)', rim: '#F4E9D8' });
    chairIcon(g, -80, -6, 14);
    g.fillStyle = '#FF4B3E'; for (let i = -9; i <= 9; i++) { g.fillRect(-80 + i * 10 - 6, -6 + i * 10 - 6, 14, 14); g.fillRect(-80 + i * 10 - 6, -6 - i * 10 - 6, 14, 14); }
    ptext(g, '没有', 90, 18, 60, C.ink, { align: 'center' });
    g.restore();
  }
  // 歇着的时候：蹲着、跪着
  ppl.forEach((p, i) => { if (p.tag) popTag(g, t, CH('s1', 2) - .2 + i * .3, p.cx, p.by - 230, p.tag, 40, { fill: '#FFE9A8' }); });
}
/* 上下两格：蹲着歇（肌肉上班）vs 坐椅子歇（肌肉下班） */
function restMeter(g, t) {
  bgPaper(g, '#FBF6EA');
  const k = 9;
  // ---- 上：哈扎人蹲着 ----
  const pt = E.out(clamp((t - S('s2') + .15) / .3));
  withAlpha(g, pt, () => {
    pbox(g, 70, 290, 820, 450, { k: 6, fill: '#FFF0D6', rim: '#F4E0B8' });
    ptag(g, 110, 330, '蹲着歇', 40, { align: 'left', fill: C.gold });
    shadowAt(g, 250, 640, k);
    crabAt(g, 250, 640, k, hadzaO(t, { pose: 'squat' }));
    muscleGuy(g, 580, 650, 10, t, 'work');
    ptag(g, 560, 410, '腿上的肌肉：上班中', 32, { fill: '#B8F0C8' });
    ptext(g, '出力', 120, 712, 32, C.ink);
    effortMeter(g, 200, 682, 640, .3 + .02 * Math.sin(t * 9), { col: '#3E9E4F' });
  });
  // ---- 下："你"往椅子上一靠 ----
  const t0 = S('s3') - .15, pb = E.out(clamp((t - t0) / .3));
  if (pb > 0) withAlpha(g, pb, () => {
    pbox(g, 70, 780, 820, 450, { k: 6, fill: '#E8EEF8', rim: '#D3DCEA' });
    ptag(g, 110, 820, '坐椅子歇', 40, { align: 'left', fill: '#9FD3FF' });
    const lean = E.out(clamp((t - t0 - .2) / .6));
    youInChair(g, t, 260, 1010, 7, { lean, you: { eyes: lean > .9 ? 'happy' : 'n' } });
    const off = t > CH('s3', 2) - .25;
    muscleGuy(g, 600, 1140, 10, t, off ? 'sleep' : 'idle');
    ptag(g, 590, 900, off ? '腿上的肌肉：下班了' : '腿上的肌肉：……', 32, { fill: off ? '#D3D0DE' : '#B8F0C8' });
    ptext(g, '出力', 120, 1202, 32, C.ink);
    const v = off ? lerp(.3, .02, E.out(clamp((t - CH('s3', 2) + .25) / .6))) : lerp(.3, .12, lean);
    effortMeter(g, 200, 1172, 640, v);
  });
  source(g, '肌电：Raichlen 等 2020', 880, 770);
  dialogBox(g, t, 'd2', PORTRAIT.youShock);
}

/* ================= 肌肉下班会怎样 ================= */
function jam(g, t) {
  if (t < S('n3') - .2) { jamRoad(g, t); return; }
  jamChart(g, t);
}
/* 血管是条路，糖块是车，腿上的肌肉是路尽头的"用糖大户"工厂；工厂下班，糖块就堵在路上 */
function jamRoad(g, t) {
  bgPaper(g, '#FFF1EE', 'rgba(200,90,90,.08)');
  popTag(g, t, SS('jam') + .1, 480, 250, '你身体里的"用糖大户"', 40, { fill: C.gold });
  const k = 8, px = 520, by = 1000;
  const tc = S('n2') - .6;                                  // "它一下班"之前的停顿里关门（卷帘门的声音不压字）
  const open = 1 - E.io(clamp((t - tc) / .5));
  musclePlant(g, px, by, k, t, open);
  muscleGuy(g, px + 38 * k, by + 150, 8, t, open > .5 ? 'work' : 'sleep');
  // 路：从左边进来，通到工厂大门
  const ry = by - 8 * k, len = px + 4 * k;
  bloodRoad(g, 0, ry, len, 110, t, 1 - open);
  ptext(g, '血管', 40, ry - 80, 32, '#B83A3A');
  // 糖块车：开门时一辆辆开进去，关门后越堵越多
  const gate = px + 6 * k, n = 8;
  for (let i = 0; i < n; i++) {
    let x;
    if (t < tc) x = ((t - SS('jam')) * 220 + i * 120) % (gate + 60) - 60;
    else {
      const free = ((tc - SS('jam')) * 220 + i * 120) % (gate + 60) - 60;
      const stop = gate - 80 - i * 76;                       // 排队：一辆挨一辆
      x = Math.min(free + (t - tc) * 220, Math.max(free, stop));
    }
    if (x > gate - 10 && t < tc) continue;
    const jamd = t > tc + .4;
    sugarCube(g, x, ry + Math.sin(t * 9 + i) * (jamd ? 0 : 3), 6, { face: jamd ? 'mad' : 'n' });
  }
  if (t < tc) ptag(g, 150, ry + 110, '饭后的糖', 32, { fill: '#FFFFFF' });
  // 右上："你"吃完饭，坐着不动
  withAlpha(g, E.out(clamp((t - SS('jam')) / .4)), () => {
    youInChair(g, t, 640, 470, 6, { lean: .5, you: { eyes: t > tc ? 'tired' : 'happy' } });
    bowlIcon(g, 790, 430, 7);
    ptag(g, 690, 610, '饭后，坐着不动', 32, { fill: '#FFFFFF' });
  });
  // 堵车：喇叭、红章
  if (t > CH('n2', 2) - .25) {
    stamp(g, 420, 770, '堵车', clamp((t - CH('n2', 2) + .25) / .25), { px: 84, rot: -.1 });
    if (t > EN('n2') && Math.floor(t * 4) % 2) ptext(g, '嘀！', 120, 840, 48, '#B83A3A', { ol: '#FFFFFF', olw: 4 });
  }
  // 左上的血糖表：堵了以后往上涨
  const lv = .25 + .55 * E.io(clamp((t - tc - .3) / 1.4));
  ptext(g, '血糖', 110, 360, 36, C.ink);
  g.fillStyle = C.ink; g.fillRect(114, 380, 60, 300); g.fillStyle = '#FFFFFF'; g.fillRect(120, 386, 48, 288);
  g.fillStyle = lv > .5 ? '#FF5A4F' : '#FFB547'; g.fillRect(120, 386 + Math.round(288 * (1 - lv)), 48, Math.round(288 * lv));
}
/* 实验：一直坐着 vs 每 20 分钟起来走 2 分钟；饭后血糖少涨约 1/4 */
function jamChart(g, t) {
  bgPaper(g, '#FBF6EA');
  const t0 = S('n3') - .2;
  popTag(g, t, t0, 480, 250, '实验：坐 5 个小时', 40, { fill: C.gold });
  // 上面两个小人：一个一直坐着，一个每隔一会儿起来走两步
  const k = 6, cyc = (t - t0) % 2.6, walking = cyc > 1.7;
  withAlpha(g, E.out(clamp((t - t0) / .3)), () => {
    youInChair(g, t, 260, 470, k, { you: { eyes: 'tired' } });
    ptag(g, 260, 640, '一直坐着', 32, { fill: '#FFC2BE' });
    if (walking) { const u = (cyc - 1.7) / .9, wx = 640 + Math.sin(u * Math.PI) * 120; drawOfficeChair(g, 640, 470, k); crabAt(g, wx, 548, k, youO(t, { legs: walkLegs(t, 10), eyes: 'happy' })); }
    else youInChair(g, t, 640, 470, k, { you: { eyes: 'happy' } });
    ptag(g, 690, 640, '每 20 分钟走 2 分钟', 32, { fill: '#B8F0C8' });
  });
  const u1 = clamp((t - CH('n3', 1) + .2) / 1.4), u2 = clamp((t - CH('n3', 2) + .2) / 1.4);
  glucoseChart(g, 150, 760, 660, 340, u1, u2);
  if (u2 >= 1) {
    const p = pop(t, CH('n3', 4) - .2, .3);
    g.save(); g.translate(640, 830); g.scale(p, p); ptag(g, 0, 0, '少涨约 1/4', 40, { fill: '#B8F0C8' }); g.restore();
  }
  source(g, 'Dunstan 等 2012：19 个超重的中年人', 880, 1250);
}
