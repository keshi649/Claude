'use strict';
/* scenes2.js：嘴里（牙每天都在被拆、也在被补：细菌吃糖吐酸、口水冲淡酸再补钙；吃一回甜的，酸要闹半小时左右）
   → 几十万年前（甜的难得碰上，碰上了就一次吃完；一天里大部分时间口水都在补牙）
   → 如今（一天来好几回；考考你：同一杯奶茶，20 分钟喝完和一下午小口抿，哪个更伤牙？）。 */

/* ================= 共用的界面 ================= */
/* 牙釉质血条：v 0..1 */
function enamelBar(g, v, t, o = {}) {
  const x = o.x ?? 100, y = o.y ?? 214, w = o.w ?? 780;
  pbox(g, x, y, w, 92, { k: 6 });
  ptext(g, '牙釉质', x + 34, y + 60, 36, C.white);
  const bx = x + 200, bw = w - 330, val = Math.round(clamp(v) * 100);
  g.fillStyle = '#3B3363'; g.fillRect(bx, y + 30, bw, 32);
  const col = v > .8 ? C.green : v > .5 ? C.gold : C.red;
  g.fillStyle = col; g.fillRect(bx, y + 30, Math.round(bw * clamp(v) / 6) * 6, 32);
  g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(bx, y + 30, Math.round(bw * clamp(v) / 6) * 6, 6);
  if (o.flash) { g.fillStyle = `rgba(255,90,79,${o.flash * .6})`; g.fillRect(bx, y + 30, bw, 32); }
  ptext(g, val + '%', x + w - 34, y + 60, 36, col, { align: 'right' });
}
/* 一天的牙况：从 6 点到 24 点；acid = [[开始, 结束], ...]（小时）；q 0..1 光标走到哪儿；icons = [[小时, 精灵, 出现时刻]] */
function dayStrip(g, x, y, w, t, acid, o = {}) {
  const h = o.h ?? (o.labels ? 360 : 300), H0 = 6, H1 = 24;
  pbox(g, x, y, w, h, { k: 6 });
  ptext(g, o.title || '一天的牙况', x + 36, y + 58, 36, C.white);
  // 图例
  g.fillStyle = C.red; g.fillRect(x + w - 330, y + 34, 26, 26); ptext(g, '酸在拆', x + w - 294, y + 58, 26, '#FFB0A8');
  g.fillStyle = '#5EC8FF'; g.fillRect(x + w - 170, y + 34, 26, 26); ptext(g, '口水在补', x + w - 134, y + 58, 26, '#BFE6FF');
  const x0 = x + 40, x1 = x + w - 40, by = y + (o.labels ? 190 : 150), bh = 50;
  const X = hr => lerp(x0, x1, (hr - H0) / (H1 - H0));
  const q = clamp(o.q ?? 1), xq = lerp(x0, x1, q);
  g.fillStyle = '#2B2547'; g.fillRect(x0, by, x1 - x0, bh);
  g.fillStyle = '#5EC8FF'; g.fillRect(x0, by, Math.round((xq - x0) / 6) * 6, bh);
  for (const [a, b] of acid) {
    const xa = X(a), xb = Math.min(X(b), xq); if (xb <= xa) continue;
    g.fillStyle = C.red; g.fillRect(Math.round(xa / 6) * 6, by, Math.max(6, Math.round((xb - xa) / 6) * 6), bh);
  }
  g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(x0, by, x1 - x0, 6);
  for (const hr of [6, 12, 18, 24]) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(X(hr) - 2, by + bh, 4, 12); ptext(g, hr + ':00', X(hr), by + bh + 48, 24, '#9C93C0', { align: hr === 6 ? 'left' : hr === 24 ? 'right' : 'center' }); }
  if (q < 1) { g.fillStyle = C.white; g.fillRect(xq - 3, by - 10, 6, bh + 20); }
  (o.labels || []).forEach(([hr, s2, t0]) => { if (t > t0) ptext(g, s2, X(hr), by + bh + 96, 28, C.white, { align: 'center' }); });
  // 吃甜的那一刻：上面弹出小图标
  (o.icons || []).forEach(([hr, sp, t0]) => {
    const p = pop(t, t0, .3); if (p <= 0) return;
    const s = sp(), k = 7, cx = X(hr);
    g.save(); g.translate(cx, by - 18); g.scale(p, p); g.imageSmoothingEnabled = false;
    g.drawImage(s, Math.round(-s.width * k / 2), -s.height * k, s.width * k, s.height * k);
    g.restore();
  });
  return { X, by, bh };
}

/* ================= 嘴里 ================= */
/* 三只蛀牙菌的位置（世界坐标，身体左上角） */
const BUGS = [[30, 0], [70, 1], [108, 2]];
const bugY = x => toothTop(x + 12) - 16;
/* 被酸溶掉的砖（按顺序），以及后面蛀洞那一圈 */
const DIS1 = [2, 7, 12, 17, 22, 9, 4];
const DIS2 = [7, 8, 22, 23, 6, 21, 9];
function bodyBricks(t) {
  const tA = CH('s2', 4) + .25, tR = CH('s3', 3), tC = S('s5');
  const span = Math.max(.6, EN('s2') - tA) / DIS1.length, rspan = Math.max(.8, EN('s3') - tR) / DIS1.length;
  return i => {
    let h = 1;
    const k = DIS1.indexOf(i);
    if (k >= 0) {
      h -= .85 * clamp((t - tA - k * span) / .5);
      h += .85 * clamp((t - tR - k * rspan) / .4);
    }
    const c = DIS2.indexOf(i);
    if (c >= 0) h -= .9 * clamp((t - tC - c * .18) / .45);
    return h;
  };
}
function body(g, t) {
  const b = pbuf('mouth', MW, MH);
  mouthBG(b, t);
  const health = bodyBricks(t);
  const tC = S('s5'), cav = E.out(clamp((t - tC - .4) / Math.max(.8, EN('s5') - tC)));
  const tR = CH('s3', 3);
  drawMolar(b, health, { cavity: cav, fresh: i => DIS1.includes(i) && t > tR && t < EN('d3') + .4 ? .5 + .5 * Math.sin(t * 8) : 0 });
  // 蛀牙菌：s2 里冒出来，吃糖、吐酸；口水来了就被冲走；s5 又回来了
  const inB = clamp((t - CH('s2', 1) + .1) / .35), washed = clamp((t - CH('s3', 2) + .1) / .6), back = clamp((t - S('s5') + .2) / .4);
  const munch = t > CH('s2', 3) - .1 && t < CH('s2', 4) + .2, spit = t > CH('s2', 4) - .1 && t < EN('s2') + .3;
  BUGS.forEach(([x, i]) => {
    let dx = 0, dy = 0, show = 0;
    if (t < S('s5') - .2) { show = inB * (1 - washed); dy = -Math.round((1 - E.out(inB)) * 40); dx = -Math.round(E.in(washed) * 60); }
    else { show = back; dy = -Math.round((1 - E.out(back)) * 40); }
    if (show <= .02) return;
    const arms = munch ? (Math.floor(t * 8 + i) % 2 ? 'up' : 'n') : spit ? 'dn' : 'n';
    b.save(); b.globalAlpha = clamp(show * 2);
    drawBug(b, x + dx, bugY(x) + dy, t, { arms, eyes: munch ? 'happy' : 'angry' }, i === 1);
    b.restore();
  });
  // 糖块落下来
  const tS = CH('s2', 2);
  for (let j = 0; j < 9; j++) {
    const ts = tS + j * .13, u = (t - ts) / .55; if (u < 0 || u > 1) continue;
    const [x] = BUGS[j % 3], tx = x + 8 + (j * 5) % 7;
    pspr(b, SUGAR(), tx, lerp(40, bugY(x) + 2, E.in(u)));
  }
  // 酸滴：从细菌身上掉到砖上，滋滋冒泡
  if (spit) for (let j = 0; j < 12; j++) {
    const ts = CH('s2', 4) + j * .16, u = (t - ts) / .3; if (u < 0 || u > 2.2) continue;
    const [x] = BUGS[j % 3], dx = x + 4 + (j * 7) % 16, ty = toothTop(dx);
    if (u <= 1) pspr(b, ACID(), dx, lerp(bugY(x) + 14, ty - 4, u));
    else { for (let k = 0; k < 3; k++) { const v = (u - 1 + k * .3) % 1.2; pdot(b, dx + k - 1, ty - 2 - Math.round(v * 6), '#D8F78A'); } }
  }
  // 口水浪
  drawSaliva(b, clamp((t - S('s3') - .1) / 1.8), t);
  // 口水修理工：从右边扛着钙砖走进来，把溶掉的砖补上
  const wIn = clamp((t - CH('s3', 1) + .1) / 1.2);
  if (wIn > 0 && t < S('s4') + .3) {
    [[60, 0], [96, 1]].forEach(([tx, i]) => {
      const x = Math.round(lerp(MW + 10 + i * 20, tx, E.out(wIn))), walking = wIn < 1;
      const placing = t > tR + i * .3 && t < tR + i * .3 + 1.6;
      const yy = toothTop(x + 12) - 16 + (placing && Math.floor(t * 6) % 2 ? 1 : 0);
      drawWorker(b, x, yy, t, { seed: i + 3, legs: walking ? walkLegs(t + i * .2) : 0, arms: placing ? 'dn' : 'up', eyes: placing ? 'happy' : blinkEyes(t, i + 3) }, true);
      if (!placing && t < tR + 1.2) pspr(b, CABRICK(), x + 7, yy - 9);
    });
  }
  // s4 里画面变暗，让位给酸碱度曲线
  const dim = win(t, S('s4') - .1, EN('s4') + .2, .3, .3);
  if (dim > 0) { b.save(); b.globalAlpha = dim * .45; b.fillStyle = '#12060C'; b.fillRect(0, 0, MW, MH); b.restore(); }
  blit(g, 'mouth', MP);

  // —— 界面 ——
  let hp = 0; for (const br of BRICKS) hp += clamp(health(br.i)); hp /= BRICKS.length;
  hp = clamp(hp - cav * .25);
  const pb = E.out(clamp((t - SS('body') - .15) / .3));
  if (pb > 0) withAlpha(g, pb, () => enamelBar(g, hp, t, { flash: t > CH('s2', 5) - .1 && t < EN('s2') ? .5 + .5 * Math.sin(t * 14) : 0 }));
  popTag(g, t, CH('s1', 1), 250, 370, '拆：细菌', 40, { fill: '#FF8A7A', t1: S('s4') - .1 });
  popTag(g, t, CH('s1', 2), 730, 370, '补：口水', 40, { fill: '#9FD3FF', t1: S('s4') - .1 });
  if (t > CH('s2', 1) && t < CH('s3', 2)) popTag(g, t, CH('s2', 1) + .2, 250, 460, '细菌', 32, { fill: '#B8EC3C' });
  if (t > CH('s2', 4) && t < CH('s3', 2)) popTag(g, t, CH('s2', 4) + .1, 480, 640, '酸', 40, { fill: '#D8F78A' });
  if (t > CH('s3', 1) && t < S('s4')) popTag(g, t, CH('s3', 1) + .3, 730, 560, '口水修理工', 32, { fill: '#9FD3FF' });
  if (t > CH('s3', 3) && t < S('s4')) popTag(g, t, CH('s3', 3) + .1, 480, 640, '钙', 40, { fill: '#FFFFFF' });
  if (t > S('s4') - .2 && t < EN('s4') + .3) acidChart(g, t);
  // s5：蛀牙 = 拆得比补得快
  if (t > S('s5') - .1) {
    const p = pop(t, CH('s5', 1), .35);
    if (p > 0) {
      g.save(); g.translate(480, 470); g.scale(p, p);
      pbox(g, -360, -110, 720, 220, { k: 6 });
      ptext(g, '拆', -250, 40, 120, '#FF8A7A', { align: 'center' });
      ptext(g, '＞', -90, 30, 96, C.white, { align: 'center' });
      ptext(g, '补', 70, 40, 120, '#9FD3FF', { align: 'center' });
      ptext(g, '→ 蛀牙', 250, 30, 56, C.gold, { align: 'center' });
      g.restore();
    }
  }
  dialogBox(g, t, 'd2', PORTRAIT.bug, { pfill: '#2A1A20' });
  dialogBox(g, t, 'd3', PORTRAIT.worker, { pfill: '#1E2A3A' });
}

/* 吃一口甜的之后，牙面上的酸碱度：先往下掉，过线就开始溶牙；大约半小时才回到线上 */
const stephan = m => 7 - 2.4 * (1 - Math.exp(-m / 1.5)) / (1 + Math.pow(Math.max(0, m - 5) / 31, 2));
function acidChart(g, t) {
  const a = win(t, S('s4') - .2, EN('s4') + .3, .3, .3); if (a <= 0) return;
  const t0 = S('s4'), t1 = CH('s4', 2) + .4;           // 曲线从开始画到"口水才补得上"
  const M = 45, q = clamp((t - t0) / (t1 - t0)) * M;   // 已经画到第几分钟
  g.save(); g.globalAlpha *= a; g.translate(0, (1 - E.out(a)) * 40);
  const x = 90, y = 330, w = 800, h = 470;
  pbox(g, x, y, w, h, { k: 6 });
  ptext(g, '吃一口甜的之后 · 牙面上的酸', x + 36, y + 60, 32, '#CFC6E8');
  const x0 = x + 70, x1 = x + w - 40, yTop = y + 100, yBot = y + h - 80;
  const X = m => lerp(x0, x1, m / M), Y = ph => lerp(yTop, yBot, (7.2 - ph) / 2.8);
  g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(x0, yBot, x1 - x0, 4); g.fillRect(x0, yTop, 4, yBot - yTop);
  [0, 10, 20, 30, 40].forEach(m => ptext(g, m + (m === 40 ? ' 分钟' : ''), X(m), yBot + 40, 24, '#9C93C0', { align: m === 40 ? 'right' : 'center' }));
  // "开始溶牙"的线
  const yl = Y(5.5);
  g.fillStyle = 'rgba(255,90,79,.8)'; for (let xx = x0; xx < x1; xx += 28) g.fillRect(xx, yl - 2, 16, 4);
  ptext(g, '开始溶牙', x1, yl - 14, 24, '#FF8A7A', { align: 'right' });
  ptext(g, '酸', x0 - 40, yBot - 6, 28, '#FF8A7A', { align: 'center' });
  // 曲线：线下面那段涂成红色（在拆），回到线上以后是蓝色（在补）
  for (let m = 0; m < q; m += .25) {
    const ph = stephan(m), yy = Y(ph);
    if (ph < 5.5) { g.fillStyle = 'rgba(255,90,79,.35)'; g.fillRect(X(m), yl, X(.25) - X(0) + 1, yy - yl); }
    g.fillStyle = ph < 5.5 ? C.red : '#5EC8FF'; g.fillRect(X(m), yy - 4, X(.25) - X(0) + 1, 8);
  }
  if (q < M) { g.fillStyle = C.white; g.fillRect(X(q) - 7, Y(stephan(q)) - 7, 14, 14); }
  // 括号：约 30 分钟
  const mA = 1.6, mB = 29;
  if (t > CH('s4', 1) - .1) withAlpha(g, clamp((t - CH('s4', 1) + .1) / .3), () => {
    const by = yBot - 30;
    g.fillStyle = C.gold; g.fillRect(X(mA), by, X(Math.min(q, mB)) - X(mA), 6); g.fillRect(X(mA), by - 14, 6, 20);
    if (q >= mB) g.fillRect(X(mB) - 6, by - 14, 6, 20);
    ptext(g, '约 30 分钟', (X(mA) + X(mB)) / 2, by - 24, 40, C.gold, { align: 'center', sh: 1 });
  });
  if (t > CH('s4', 2) - .05) withAlpha(g, clamp((t - CH('s4', 2) + .05) / .3), () => ptext(g, '口水开工', X(36), Y(stephan(36)) - 26, 28, '#9FD3FF', { align: 'center' }));
  source(g, 'Stephan 1944 · 吃糖后牙菌斑的酸碱度变化', x + w - 30, y + h - 20, { px: 22 });
  g.restore();
}

/* ================= 几十万年前 ================= */
function ancient(g, t) {
  const b = pbuf('anc', 108, 192), hy = 100;
  dayField(b, t, hy);
  drawBerryBush(b, 20, hy + 12, clamp((t - CH('a1', 1) + .4) / .8));
  // 原始人：走到树下 → 爬上去掏蜂蜜 → 一口气吃完
  const tClimb = CH('a1', 2), tGrab = CH('a1', 3), tEat = CH('a1', 4);
  const hive = 1 - clamp((t - tEat) / Math.max(.6, S('d4') - tEat + .3));
  drawHiveTree(b, 74, hy + 10, t, t < tGrab ? 1 : .55 * hive);
  const climb = E.io(clamp((t - tClimb) / .9)), down = E.io(clamp((t - tGrab - .2) / .5));
  const cx = Math.round(lerp(34, 60, climb)), cy = Math.round(hy + 2 - 20 * climb * (1 - down));
  const eating = t > tEat - .1 && hive > 0;
  feetShadow(b, cx, hy + 18);
  drawCaveman(b, cx, cy, t, { arms: eating ? (Math.floor(t * 8) % 2 ? 'up' : 'n') : climb > 0 && climb < 1 ? 'up' : 'n', eyes: eating || t > S('d4') ? 'happy' : blinkEyes(t, 4), legs: climb > 0 && climb < 1 ? walkLegs(t) : 0, grin: t > EN('d4') - .2 ? 'white' : null });
  if (t > tGrab && hive > 0) pspr(b, FOOD.honey(), cx - 5, cy - 2 - (eating && Math.floor(t * 8) % 2 ? 2 : 0));
  blit(g, 'anc', 10);
  popTag(g, t, S('a1') - .3, 480, 250, '甜的？很少碰上', 40, { fill: C.amber, t1: S('a2') - .2 });
  popTag(g, t, CH('a1', 1) - .35, 220, 960, '野果：要等季节', 30, { fill: '#FFB0A8', t1: S('a2') - .2 });
  popTag(g, t, CH('a1', 2) + .1, 700, 600, '蜂蜜：爬树去掏', 30, { fill: C.gold, t1: S('a2') - .2 });
  if (t > CH('a1', 4) - .05 && t < S('a2')) popText(g, t, CH('a1', 4), S('a2') - .1, '一次吃完！', 480, 420, 84, C.gold);
  dialogBox(g, t, 'd4', PORTRAIT.cave);
  // 一天的牙况：只有一回酸，其余时间都在补
  const pa = E.out(clamp((t - S('a2') + .15) / .35));
  if (pa > 0) withAlpha(g, pa, () => {
    const q = clamp((t - S('a2')) / (CH('a2', 2) - S('a2') + .6));
    const r = dayStrip(g, 80, 300, 820, t, [[11, 11.6]], { q, title: '原始人 · 一天的牙况', icons: [[11.3, FOOD.honey, S('a2') + .35]] });
    if (t > CH('a2', 2) - .1) withAlpha(g, clamp((t - CH('a2', 2) + .1) / .3), () => ptext(g, '大把时间在补牙', r.X(17.5), r.by - 28, 32, '#9FD3FF', { align: 'center', sh: 1 }));
  });
}

/* ================= 如今 ================= */
const MODERN_ACID = [[7.5, 8.1], [10.5, 11.1], [14, 18.5], [19.5, 20.1], [22.5, 23.1]];
function modern(g, t) {
  if (t < S('m2') - .12) { modernDay(g, t); return; }
  quiz(g, t);
}
/* 一天来好几回：早饭、零食、奶茶、饮料、夜宵 */
function modernDay(g, t) {
  const b = pbuf('off', 108, 192);
  office(b, t);
  const sip = Math.floor(t * 1.2) % 2 === 0;
  drawYou(b, 22, 104, t, { arms: 'upL', grin: sip ? 'sip' : null, eyes: sip ? 'happy' : blinkEyes(t, 1) });
  drawTea(b, 14, 98, 10, 14, .7, t, { sip });
  pspr(b, FOOD.cookie(), 40, 113); pspr(b, FOOD.cola(), 92, 111);
  blit(g, 'off', 10);
  const T = [CH('m1', 1), CH('m1', 1) + .25, CH('m1', 1) + .5, CH('m1', 2), CH('m1', 2) + .3];
  const icons = [[7.8, FOOD.bun, T[0]], [10.8, FOOD.cookie, T[1]], [15, FOOD.tea, T[2]], [19.8, FOOD.cola, T[3]], [22.8, FOOD.skewer, T[4]]];
  const pa = E.out(clamp((t - S('m1') + .1) / .35));
  if (pa > 0) withAlpha(g, pa, () => {
    // 每弹出一个图标，那一段的酸就跟着出现
    const shown = MODERN_ACID.filter((_, i) => t > T[i] + .1);
    const labels = ['早饭', '零食', '奶茶', '饮料', '夜宵'].map((s2, i) => [icons[i][0], s2, T[i] + .15]);
    dayStrip(g, 80, 290, 820, t, shown, { title: '你 · 一天的牙况', icons, labels });
  });
  if (t > CH('m1', 3) - .05) popText(g, t, CH('m1', 3), 99, '一天好几回', 480, 740, 84, '#FF8A7A');
}
/* 考考你：A 20 分钟喝完，B 一下午小口抿，哪个更伤牙？ */
function quiz(g, t) {
  menuBG(g, t, '#2B1E3A');
  popTag(g, t, S('m2') - .12, 480, 250, '考考你', 48, { fill: C.amber });
  if (t > CH('m2', 1) - .1) withAlpha(g, clamp((t - CH('m2', 1) + .1) / .3), () => prich(g, '同一杯奶茶 · {糖一样多}', 480, 340, 40, C.white, C.gold, { align: 'center' }));
  const tAns = S('m3');
  const row = (y, key, label, t0, kind, tIn) => {
    const p = E.out(clamp((t - tIn + .1) / .3)); if (p <= 0) return;
    g.save(); g.globalAlpha *= p; g.translate((1 - p) * -60, 0);
    const hot = kind === 'B' && t > tAns + .2;
    pbox(g, 70, y, 840, 330, { k: 6, fill: hot ? 'rgba(90,24,36,.94)' : 'rgba(27,23,48,.94)' });
    // 杯子：A 很快喝完；B 一点一点往下掉
    const name = 'cup' + kind, cb = pbuf(name, 20, 30); cb.clearRect(0, 0, 20, 30);
    const run = kind === 'A' ? clamp((t - t0 - .4) / 1.2) : clamp((t - t0 - .4) / 9);
    const fill = kind === 'A' ? 1 - run : 1 - Math.floor(run * 12) / 12 * .9;
    const sip = kind === 'A' ? run > 0 && run < 1 : t > t0 && Math.floor((t - t0) * 2) % 3 === 0;
    drawTea(cb, 5, 10, 10, 16, fill, t, { sip });
    put(g, name, 0, 0, 20, 30, 90, y + 30, 9);
    ptext(g, key, 290, y + 80, 56, kind === 'A' ? C.gold : '#FF8A7A');
    if (t > t0 - .05) withAlpha(g, clamp((t - t0 + .05) / .2), () => ptext(g, label, 350, y + 80, 44, C.white));
    else ptext(g, '？', 350, y + 80, 44, '#6B6488');
    // 时间轴 14:00 → 19:00
    const x0 = 300, x1 = 870, X = hr => lerp(x0, x1, (hr - 14) / 5), by = y + 190;
    g.fillStyle = '#3B3363'; g.fillRect(x0, by, x1 - x0, 40);
    [14, 15, 16, 17, 18, 19].forEach(hr => ptext(g, hr + '点', X(hr), by + 80, 22, '#9C93C0', { align: 'center' }));
    // 喝的那几口
    if (kind === 'A') { g.fillStyle = 'rgba(217,167,119,.9)'; g.fillRect(X(14), by - 18, X(14.33) - X(14), 12); }
    else for (let k = 0; k < 16; k++) { g.fillStyle = 'rgba(217,167,119,.9)'; g.fillRect(X(14 + k * .27), by - 18, 10, 12); }
    if (t > tAns) {   // 揭晓：酸泡了多久
      const span = kind === 'A' ? [14, 15] : [14, 18.6];
      const ts = kind === 'A' ? CH('m3', 1) : CH('m3', 4) - .25, u = E.out(clamp((t - ts + .1) / .8));
      if (u > 0) {
        g.fillStyle = C.red; g.fillRect(X(span[0]), by, Math.round((X(span[1]) - X(span[0])) * u / 6) * 6, 40);
        if (u > .6) ptext(g, kind === 'A' ? '泡酸 1 个钟头左右' : '泡了一下午', kind === 'A' ? X(15) + 20 : X(16.3), by - 34 + (kind === 'A' ? 0 : 0), 32, kind === 'A' ? C.gold : '#FF8A7A', { align: kind === 'A' ? 'left' : 'center', sh: 1 });
      }
    }
    g.restore();
    if (hot) stamp(g, 760, y + 96, '更伤牙', clamp((t - tAns - .2) / .25), { px: 56, rot: -.12 });
  };
  row(400, 'A', '20 分钟喝完', CH('m2', 3), 'A', S('m2') - .1);
  row(780, 'B', '一下午小口抿', CH('m2', 4), 'B', S('m2') + .1);
  if (t > CH('m2', 5) - .1 && t < tAns + .1) popText(g, t, CH('m2', 5), tAns + .1, '哪个更伤牙？', 480, 1170, 72, C.gold);
  if (t > tAns + .6) withAlpha(g, clamp((t - tAns - .6) / .3), () => source(g, '示意图：按吃糖后的酸碱度曲线推算，每抿一口，酸就重新闹一阵', 880, 1160, { px: 22 }));
  dialogBox(g, t, 'd5', PORTRAIT.you);
  dialogBox(g, t, 'd6', PORTRAIT.workerMad, { pfill: '#1E2A3A' });
}
