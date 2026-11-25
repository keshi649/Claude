'use strict';
/* scenes2.js：挠自己为什么不痒（"你"挠自己：大脑里管音量的小人拿到预告单，对上了就把"痒"静音；
   "他"来挠你：没有预告，音量全开）→ 实验（左手摇把手，机器人照着动作挠右手心：不怎么痒；
   科学家偷偷让机器人慢 0.2 秒：大多数人没察觉，却痒多了，跟别人挠的差不多）。 */

/* ================= 挠痒 ================= */
function tickle(g, t) {
  if (t < S('t3') - .15) { tickleBrain(g, t); return; }
  tickleRobot(g, t);
}
/* 粉色方格纸："你"在左下，大脑圆窗在右上 */
function tickleBrain(g, t) {
  bgPaper(g, '#FDF0F4', 'rgba(220,120,160,.10)');
  const k = 13, cx = 290, by = 1200, t2 = S('t2') - .15;
  const other = t > t2;
  popTag(g, t, SS('tickle') + .1, 480, 250, '你挠自己时', 44, { fill: C.gold, t1: t2 });
  popTag(g, t, t2, 480, 250, '别人挠你时', 44, { fill: '#FFC2BE' });
  // "他"从右边走进来挠你
  const ex = 650, hx = other ? Math.max(ex, 1000 - (t - t2) * 900) : 1100;
  const arrived = other && hx <= ex + 1;
  const tMax = CH('t2', 2) - .2;
  const laugh = arrived && t > CH('t2', 1) - .1;
  const wig = Math.floor(t * 9) % 2;
  shadowAt(g, cx, by, k);
  const sh = laugh ? shake(t, Math.floor(t * 4) / 4, 6, .25) : [0, 0];
  crabAt(g, cx + sh[0], by, k, youO(t, laugh ? { eyes: 'happy', mouth: 'laugh', tears: true, arms: wig ? 'up' : 'n' }
    : other ? { eyes: 'wide', mouth: 'o' } : { arms: wig ? 'dn' : 'n', eyes: 'n', mouth: 'flat' }));
  if (!other) { itchFX(g, cx - 15 * k, by - 9 * k, t, 6, '#B9A8C0'); itchFX(g, cx + 15 * k, by - 9 * k, t + .3, 6, '#B9A8C0'); }
  if (other) {
    shadowAt(g, hx, by, k);
    crabAt(g, hx, by, k, himO(t, { eyes: 'happy', mouth: 'smile', legs: arrived ? 0 : walkLegs(t, 10) }), true);
    if (arrived) {
      reachArm(g, hx, by, k, (hx - 12 * k - (cx + 12 * k)) / k - 1 + wig, TONES.blue, true, 5 + wig);
      itchFX(g, cx + 14 * k, by - 10 * k, t, 7, '#FF5A7A');
    }
  }
  if (laugh) hahaFX(g, cx, by - 18 * k, t, CH('t2', 1) - .1);
  if (!other && t > CH('t1', 3) + .2) speech(g, t, CH('t1', 3) + .2, t2 - .1, cx + 40, by - 17 * k, '……', { px: 40 });
  // 大脑圆窗
  const pz = pop(t, CH('t1', 1) - .25, .35);
  if (pz > 0) {
    const bx = 670, byy = 600, r = 200;
    brainDots(g, cx + 6 * k, by - 18 * k, bx - r * .7, byy + r * .75);
    g.save(); g.translate(bx, byy); g.scale(pz, pz); g.translate(-bx, -byy);
    let vol = .5, mode = 'on', card = null, push = false, op = {};
    if (!other) {
      if (t > CH('t1', 2) - .25) card = { s: '预告：挠腰', mark: t > CH('t1', 2) + .25 ? 'ok' : null };
      const tm = CH('t1', 3) - .2;
      if (t > tm) { vol = lerp(.5, 0, E.io(clamp((t - tm) / .45))); push = t < tm + .7; mode = vol < .05 ? 'mute' : 'on'; op = { eyes: 'happy' }; }
    } else {
      vol = t > tMax ? lerp(0, 1, E.out(clamp((t - tMax) / .35))) : 0;
      mode = vol > .9 ? 'max' : vol < .05 ? 'mute' : 'on';
      op = t < tMax ? { eyes: 'wide', mouth: 'o' } : { eyes: 'wide', mouth: 'o', sweat: true };
      push = t > tMax - .1 && t < tMax + .5;
    }
    brainRoom(g, bx, byy, r, t, { vol, mode, card, push, op, label: '痒', title: '大脑' });
    if (other && t < tMax + .2) popText(g, t, t2 + .35, tMax + .2, '？！', bx - 60, byy - 70, 72, '#FF5A4F', { olw: 6 });
    g.restore();
    if (other && t > tMax) popTag(g, t, tMax + .1, 670, 860, '音量全开', 40, { fill: '#FFC2BE' });
    if (!other && t > CH('t1', 3) - .2) popTag(g, t, CH('t1', 3) + .1, 670, 860, '静音', 40, { fill: '#D3D0DE' });
  }
}
/* 一个手心：(x, y) 中心，朝上 */
function palm(g, x, y, k, col) {
  g.fillStyle = col; g.fillRect(Math.round(x - 4 * k), Math.round(y - k), 8 * k, 3 * k);
  g.fillStyle = '#FFE0D6'; g.fillRect(Math.round(x - 3 * k), Math.round(y - k), 6 * k, k);
}
/* 深色实验室："你"坐中间，左手摇把手，右边的机器人用海绵挠你的右手心；后来科学家偷偷加了 0.2 秒的延迟 */
function tickleRobot(g, t) {
  bgGrid(g, t, '#141A33');
  const t0 = S('t3') - .15, td = CH('t4', 1) - .2, delayOn = t > td + .5;
  const k = 13, cx = 470, by = 1190, rk = 8, ty = 1150;
  popTag(g, t, t0 + .05, 480, 250, '实验：机器人挠手心', 40, { fill: C.gold });
  // 把手每秒左右摇 1.6 次；海绵头跟着动，加了延迟以后晚 0.2 秒
  const uh = Math.sin(t * TAU * 1.6), uf = Math.sin((t - (delayOn ? .2 : 0)) * TAU * 1.6);
  labTable(g, 40, ty, 230); labTable(g, 690, ty, 210);
  for (let x = 270; x < 690; x += 18) { g.fillStyle = '#5EC8FF'; g.fillRect(x, ty + 14, 10, 6); }   // 两台机器人之间的线（从"你"脚后面穿过）
  const [hxh] = handleBot(g, 150, ty, rk, uh);
  const laugh = delayOn && t > CH('t5', 1) - .15;
  crabAt(g, cx, by, k, youO(t, laugh ? { eyes: 'happy', mouth: 'laugh', tears: true } : delayOn && t > S('t5') - .1 ? { eyes: 'n', mouth: 'smile' } : { eyes: 'n', mouth: 'flat' }));
  // 左手伸去握把手，右手伸到右边、手心朝上
  reachArm(g, cx, by, k, (cx - 12 * k - (hxh + rk)) / k, C.clawd, true, 3);
  const [px, py] = reachArm(g, cx, by, k, 4, C.clawd, false, 4);
  palm(g, px + k, py - k, k * .8, C.clawd);
  const [fx] = tickleBot(g, 830, ty, rk, uf, 22, py - 3 * k);
  if (Math.abs(fx - (px + k)) < 50) itchFX(g, px + k, py - 8 * k, t, 6, laugh ? '#FF5A7A' : '#6B6880');
  if (laugh) hahaFX(g, cx, by - 18 * k, t, CH('t5', 1) - .15);
  popTag(g, t, CH('t3', 1) - .25, 170, 870, '左手摇把手', 32, { fill: '#FFE9A8', t1: S('t4') - .1 });
  popTag(g, t, CH('t3', 2) - .25, 770, 830, '机器人照着动', 32, { fill: '#FFE9A8', t1: S('t4') - .1 });
  popTag(g, t, CH('t3', 3) - .25, 690, 930, '挠右手心', 32, { fill: '#FFC2BE', t1: S('t4') - .1 });
  // 大脑小窗：自己摇 → 预告对上了，静音；延迟 → 对不上，音量起来
  const pz = pop(t, t0 + .3, .35), chartT = CH('t5', 2) - .25;
  if (pz > 0 && t < chartT + .3) {
    const bx = 290, byy = 540, r = 160;
    g.save(); g.translate(bx, byy); g.scale(pz, pz); g.translate(-bx, -byy);
    let vol = .08, mode = 'mute', card = { s: '预告：手心', mark: t > t0 + .8 ? 'ok' : null }, alarm = 0, op = { eyes: 'happy' };
    if (delayOn && t > S('t5') - .1) {
      card = { s: '预告：手心', mark: Math.floor(t * 4) % 2 ? 'bad' : 'ok' };
      alarm = 1; op = { eyes: 'wide', mouth: 'o', sweat: true };
      vol = t < CH('t5', 1) - .3 ? .08 + .05 * Math.sin(t * 20) : lerp(.08, .95, E.out(clamp((t - CH('t5', 1) + .3) / .4)));
      mode = vol > .8 ? 'max' : vol > .15 ? 'on' : 'mute';
    }
    brainRoom(g, bx, byy, r, t, { vol, mode, card, alarm, op, label: '痒', title: '大脑' });
    g.restore();
    if (alarm && t > S('t5')) popText(g, t, S('t5'), chartT, '对不上！', bx, byy + r + 56, 48, '#FF5A4F', { olw: 6 });
  }
  if (!delayOn && t > CH('t3', 4) - .2) popTag(g, t, CH('t3', 4) - .1, 480, 760, '不怎么痒', 44, { fill: '#D3D0DE', t1: S('t4') });
  // 科学家偷偷拧延迟旋钮
  const ps = pop(t, S('t4') - .1, .35);
  if (ps > 0) {
    g.save(); g.translate(700, 520); g.scale(ps, ps); g.translate(-700, -520);
    const ku = E.io(clamp((t - td) / .5));
    delayBox(g, 700, 430, ku, ku >= 1 ? '0.2 秒' : (ku * .2).toFixed(1) + ' 秒');
    crabAt(g, 700, 700, 6, sciO(t, { eyes: 'l', mouth: 'smile', arms: 'upL' }));
    if (t < S('t5')) ptext(g, '嘘', 790, 640, 48, C.white, { ol: C.ink, olw: 4 });
    if (t > td) stopwatch(g, 590, 610, 4, t);
    g.restore();
  }
  // 没察觉：头上一个问号
  if (delayOn && t > S('t5') - .1 && t < CH('t5', 1)) popText(g, t, S('t5') - .1, CH('t5', 1), '？', cx + 170, by - 250, 96, C.gold, { olw: 8 });
  // 跟别人挠的差不多：三根柱子（示意）
  if (t > chartT) {
    const p = pop(t, chartT, .35);
    g.save(); g.translate(290, 540); g.scale(p, p);
    pbox(g, -230, -200, 460, 400, { k: 6, fill: '#FBF6EA', rim: '#E8DFCC' });
    ptext(g, '有多痒（示意）', 0, -140, 32, C.ink, { align: 'center' });
    [['自己摇', .22, '#9AA1AD'], ['慢 0.2 秒', .82, '#FF8A3D'], ['别人挠', .86, '#FF5A7A']].forEach(([s, v, col], i) => {
      const x = -140 + i * 140, u = E.out(clamp((t - chartT - .1 - i * .12) / .3));
      scoreBar(g, x, 130, 70, 220 * v * u, col);
      ptext(g, s, x, 172, 24, C.ink, { align: 'center' });
    });
    g.restore();
  }
  dialogBox(g, t, 'd3', PORTRAIT.youShock);
  source(g, 'Blakemore 等 1999：16 个志愿者', 880, 1250, { col: '#8A93B8' });
}
