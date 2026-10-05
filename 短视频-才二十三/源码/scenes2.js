'use strict';
/* scenes2.js：全乐队进来之后——蜡烛重新点亮，同样的地方，换一种活法。
   生日蛋糕、骑车、地铁开出隧道、纸飞机、四季飞行。 */

/* 五彩纸屑：t0 时从 (x, y) 炸开，然后飘落（确定性） */
function confetti(g, s, t0, x, y, n, seed, spread = 1) {
  if (s < t0) return;
  const r = R(seed), u = s - t0;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (r() - .5) * 2.6 * spread, v = 500 + r() * 900, spin = (r() - .5) * 14, col = [C.red, C.mustard, C.teal, C.pink, C.navy, C.rose, C.tealL][i % 7];
    const drag = 1.6, vx = Math.cos(a) * v, vy = Math.sin(a) * v;
    const k = (1 - Math.exp(-drag * u)) / drag;
    const px = x + vx * k + Math.sin(u * 3 + i) * 30, py = y + vy * k + 260 * u * u * .5 + 140 * u;
    if (py > H + 40) continue;
    g.save(); g.translate(px, py); g.rotate(spin * u); g.scale(1, Math.cos(u * (4 + r() * 6) + i));
    g.fillStyle = col; g.fillRect(-9, -5, 18, 10); g.restore();
  }
}

/* ================= 9 重新点亮：生日蛋糕 ================= */
function bigCake(g, cx, by, w, h, label) {
  g.fillStyle = 'rgba(60,20,30,.25)'; ell(g, cx, by + 10, w * .62, 40); g.fill();
  ell(g, cx, by, w * .6, 36); fs(g, C.cream, INK, 5);  // 盘子
  rr(g, cx - w / 2, by - h, w, h, [30, 30, 16, 16]); fs(g, '#F6C7A8', INK, 6);
  g.save(); rr(g, cx - w / 2, by - h, w, h, [30, 30, 16, 16]); g.clip();
  g.fillStyle = '#E8A27E'; g.fillRect(cx - w / 2, by - h * .45, w, h * .12);
  g.fillStyle = 'rgba(255,255,255,.2)'; g.fillRect(cx - w / 2 + 20, by - h, 26, h);
  g.restore();
  // 奶油顶 + 滴落
  g.beginPath(); g.moveTo(cx - w / 2 - 6, by - h + 30);
  const n = 9;
  for (let i = 0; i <= n; i++) { const x = cx - w / 2 + i * w / n, d = 34 + (i % 3) * 22; g.lineTo(x - w / n * .25, by - h + 20); g.quadraticCurveTo(x, by - h + 20 + d, x + w / n * .25, by - h + 20); }
  g.lineTo(cx + w / 2 + 6, by - h - 10); g.quadraticCurveTo(cx + w / 2, by - h - 30, cx + w / 2 - 30, by - h - 30); g.lineTo(cx - w / 2 + 30, by - h - 30); g.quadraticCurveTo(cx - w / 2, by - h - 30, cx - w / 2 - 6, by - h - 10); g.closePath();
  fs(g, '#FFE3EA', INK, 5);
  for (let i = 0; i < 7; i++) { const x = cx - w / 2 + 70 + i * (w - 140) / 6; circ(g, x, by - h - 34, 22); fs(g, C.red, INK, 4); circ(g, x - 7, by - h - 41, 6); fs(g, 'rgba(255,255,255,.6)'); }
  if (label) text(g, label, cx, by - h * .5 + 20, h * .42, { k: 'brush', col: C.redD, alpha: .9 });
}
const S_BOOM = {
  draw(g, s) {
    const t0 = bar(51);
    const L = s - t0;
    sunburst(g, W / 2, 620, 24, C.red, '#E8475B', s * .25);
    dots(g, .1, true);
    const [sx, sy] = shake(s, t0, 22, .5);
    g.save(); g.translate(sx, sy);
    // 朋友们从蛋糕后面一个个冒出来
    [['cake', 520, bar(52), false], ['cup', 1420, bar(53), true], ['donut', 300, bar(54), false], ['cake', 1640, bar(55), true]].forEach(([k, x, tt, flip], i) => {
      if (s < tt) return;
      const u = E.back(clamp((s - tt) / .4));
      friend(g, k, x, 980 + (1 - u) * 300 - bob(s + i * .18) * 16, s, { s: 1.15, hat: 'party', face: 'happy', flip, armL: 2.2 + bob(s) * .4, armR: 2.2 + bob(s) * .4, seed: i, mouth: sing(s) * .6 });
    });
    bigCake(g, 960, 1010, 760, 250, '二十三');
    // 主角：站在蛋糕顶上，火苗烧得正旺
    const relight = E.elastic(clamp(L / .7));
    candle(g, 960, 735 - bob(s) * 14, s, { s: 1.5, flame: .3 + relight * 1.4, glow: 1.2, face: L < .4 ? 'surprise' : 'happy', mouth: L > .4 ? sing(s) : 0, armL: 2.4 + bob(s) * .35, armR: 2.4 + bob(s) * .35, hat: L > bar(53) - t0 ? 'party' : null, shadow: false });
    g.restore();
    // 片名再砸一次
    const st = t0 + .05;
    if (s > st) {
      const u = clamp((s - st) / .35), sc = 1 + 1.8 * Math.pow(1 - u, 3);
      text(g, '才二十三！', W / 2, 160, 160, { k: 'brush', col: C.cream, ext: 12, extCol: C.redD, sc, alpha: clamp((s - st) / .1) });
    }
    confetti(g, s, t0, 960, 520, 140, 5, 1.3);
    confetti(g, s, bar(55), 300, 900, 60, 8, .6);
    confetti(g, s, bar(55), 1620, 900, 60, 9, .6);
    seal(g, 1800, 980, 80, '点亮', -.08);
  },
};

/* ================= 10 骑车 ================= */
function hills(g, s, y0, amp, freq, speed, col, seed, deco) {
  const off = s * speed;
  g.beginPath(); g.moveTo(0, H);
  for (let x = 0; x <= W; x += 20) { const X = x + off; g.lineTo(x, y0 - amp * (.6 * Math.sin(X * freq + seed) + .4 * Math.sin(X * freq * 2.3 + seed * 2))); }
  g.lineTo(W, H); g.closePath(); g.fillStyle = col; g.fill();
  if (deco) {
    const sp = deco.every, k0 = Math.floor(off / sp);
    for (let k = k0; k < k0 + W / sp + 2; k++) {
      const X = k * sp + hash(k, seed) * sp * .6, x = X - off;
      const y = y0 - amp * (.6 * Math.sin(X * freq + seed) + .4 * Math.sin(X * freq * 2.3 + seed * 2));
      deco.draw(g, x, y, k);
    }
  }
}
function tree(g, x, y, sc, col, trunk = C.brown) {
  rr(g, x - 8 * sc, y - 60 * sc, 16 * sc, 64 * sc, 4); fs(g, trunk, INK, 3);
  circ(g, x, y - 90 * sc, 48 * sc); fs(g, col, INK, 3.5);
  circ(g, x - 14 * sc, y - 104 * sc, 12 * sc); fs(g, 'rgba(255,255,255,.18)');
}
function bird(g, x, y, s, sz = 1) {
  const f = Math.sin(s * 12 + x) * 10 * sz;
  g.beginPath(); g.moveTo(x - 16 * sz, y - f * .6); g.quadraticCurveTo(x - 8 * sz, y - 8 * sz, x, y); g.quadraticCurveTo(x + 8 * sz, y - 8 * sz, x + 16 * sz, y - f * .6);
  g.strokeStyle = INK; g.lineWidth = 3.5; g.lineCap = 'round'; g.stroke();
}
function sunFace(g, x, y, r, s, face_ = 'happy') {
  g.save(); g.translate(x, y); g.rotate(s * .3);
  for (let i = 0; i < 12; i++) { g.rotate(TAU / 12); poly(g, [[-12, -r - 8], [12, -r - 8], [0, -r - 40]]); fs(g, C.mustard); }
  g.restore();
  circ(g, x, y, r); fs(g, C.yel, INK, 4);
  g.save(); g.translate(x, y + 6); face(g, { face: face_, blush: 1 }, s); g.restore();
}
function bicycle(g, x, y, s, spin, col = C.red) {
  const wr = 78;
  [[-150, 0], [150, 0]].forEach(([dx]) => {
    circ(g, x + dx, y, wr); g.strokeStyle = INK; g.lineWidth = 12; g.stroke();
    circ(g, x + dx, y, wr - 8); g.strokeStyle = '#3A3F4A'; g.lineWidth = 3; g.stroke();
    for (let i = 0; i < 6; i++) { const a = spin + i * Math.PI / 3; line(g, x + dx, y, x + dx + Math.cos(a) * (wr - 8), y + Math.sin(a) * (wr - 8), '#6F6C78', 3); }
    circ(g, x + dx, y, 9); fs(g, C.grey, INK, 3);
  });
  const P = [x - 150, y], Q = [x - 20, y], S = [x - 50, y - 120], T = [x + 110, y - 130], F = [x + 150, y];
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(...P); g.lineTo(...Q); g.lineTo(...S); g.closePath(); g.moveTo(...S); g.lineTo(...T); g.lineTo(...Q); g.moveTo(...T); g.lineTo(...F);
  g.strokeStyle = INK; g.lineWidth = 16; g.stroke(); g.strokeStyle = col; g.lineWidth = 9; g.stroke();
  line(g, T[0], T[1], T[0] - 10, T[1] - 50, INK, 8); line(g, T[0] - 10, T[1] - 50, T[0] + 30, T[1] - 56, INK, 8);
  rr(g, S[0] - 34, S[1] - 18, 68, 18, 9); fs(g, '#4A3A3A', INK, 3);
  // 车篮里放着一朵花
  rr(g, x + 120, y - 150, 70, 50, 8); fs(g, C.mustard, INK, 4);
  circ(g, x + 150, y - 168, 14); fs(g, C.pink, INK, 3); circ(g, x + 150, y - 168, 5); fs(g, C.yel);
  // 踏板
  const pr = 26, pa = spin * .6;
  circ(g, Q[0], Q[1], 16); fs(g, '#6F6C78', INK, 3);
  return { seat: S, pedalA: [Q[0] + Math.cos(pa) * pr, Q[1] + Math.sin(pa) * pr], pedalB: [Q[0] - Math.cos(pa) * pr, Q[1] - Math.sin(pa) * pr] };
}
function donutRoll(g, x, y, r, ang, s) {
  g.save(); g.translate(x, y - r); g.rotate(ang);
  circ(g, 0, 0, r); fs(g, '#E8B074', INK, 4);
  g.save(); circ(g, 0, 0, r); g.clip();
  g.beginPath(); for (let i = 0; i <= 24; i++) { const a = i / 24 * TAU, rr_ = r * (.78 + (i % 2) * .08); g.lineTo(Math.cos(a) * rr_, Math.sin(a) * rr_); } g.closePath(); g.fillStyle = '#F48FB1'; g.fill();
  const rn = R(3); for (let i = 0; i < 14; i++) { const a = rn() * TAU, d = r * (.4 + rn() * .3); g.save(); g.translate(Math.cos(a) * d, Math.sin(a) * d); g.rotate(rn() * 3); rr(g, -5, -2, 10, 4, 2); fs(g, [C.yel, C.teal, C.white, C.navy][i % 4]); g.restore(); }
  g.restore();
  circ(g, 0, 0, r); g.strokeStyle = INK; g.lineWidth = 4; g.stroke();
  circ(g, 0, 0, r * .24); fs(g, C.sky, INK, 4);
  g.translate(0, -r * .55); g.scale(.6, .6); face(g, { face: 'happy', blush: 1 }, s);
  g.restore();
}
const S_BIKE = {
  draw(g, s) {
    const t0 = bar(57);
    g.fillStyle = vgrad(g, 0, H, [[0, '#8FD0EA'], [.6, '#D9F0F2'], [1, '#FFF2D2']]); g.fillRect(0, 0, W, H);
    sunFace(g, 1620, 180, 90, s);
    for (let i = 0; i < 4; i++) cloud(g, ((i * 600 - s * 40) % 2400 + 2400) % 2400 - 200, 120 + i * 50, .8 + (i % 2) * .4);
    for (let i = 0; i < 5; i++) bird(g, ((i * 390 + s * 90) % 2200) - 140, 260 + Math.sin(i * 2 + s) * 30, s, .9);
    hills(g, s, 640, 60, .0022, 50, '#B9A6D9', 1);
    hills(g, s, 760, 70, .003, 160, C.tealL, 2, { every: 260, draw: (g, x, y, k) => tree(g, x, y + 30, .8, k % 2 ? C.grass : C.grassD) });
    hills(g, s, 880, 30, .004, 420, C.grass, 3);
    // 路
    g.fillStyle = '#C9B79A'; g.fillRect(0, 900, W, 180); line(g, 0, 900, W, 900, INK, 5);
    for (let i = 0; i < 12; i++) { const x = ((i * 220 - s * 900) % 2640 + 2640) % 2640 - 200; rr(g, x, 980, 120, 14, 7); fs(g, C.cream); }
    // 栏杆
    for (let i = 0; i < 16; i++) { const x = ((i * 160 - s * 650) % 2560 + 2560) % 2560 - 200; rr(g, x, 820, 18, 90, 4); fs(g, C.white, INK, 3); }
    line(g, 0, 840, W, 840, INK, 7); line(g, 0, 840, W, 840, C.white, 3);
    // 自行车 + 小烛
    const by = 900 - 78 - bob(s) * 6, bx = 880;
    const spin = s * 10;
    const bk = bicycle(g, bx, by, s, spin);
    candle(g, bk.seat[0] + 4, bk.seat[1] + 6, s, { s: 1.1, sit: true, kick: spin * .6, face: 'happy', mouth: sing(s), flame: 1.2, wickBend: -22, glow: .4, scarf: true, armR: 1.6, bendR: -.2, armL: .7, tilt: -.05, shadow: false });
    // 甜甜圈在旁边滚着追
    const dx = 300 + Math.sin(s * 1.3) * 60;
    donutRoll(g, dx, 980, 70, s * 7, s);
    // 纸杯蛋糕在后面跑
    friend(g, 'cake', 1500 + Math.sin(s * 1.1) * 30, 990, s, { s: .9, walk: s * 3, face: 'happy', armL: 1.8, armR: 2.6, hat: 'party', seed: 2 });
    // 速度线
    for (let i = 0; i < 6; i++) { const y = 360 + i * 70, x = ((i * 370 - s * 2200) % 2400 + 2400) % 2400 - 300; line(g, x, y, x + 160, y, 'rgba(255,255,255,.7)', 5); }
  },
};

/* ================= 11 地铁开出隧道，开上海面 ================= */
function trainCar(g, x, y, w, h, s, inside, front) {
  rr(g, x, y, w, h, front ? [24, 90, 24, 24] : 24); fs(g, C.cream, INK, 6);
  g.fillStyle = C.teal; g.fillRect(x + 4, y + h - 70, w - 8, 30);
  g.fillStyle = C.red; g.fillRect(x + 4, y + h - 40, w - 8, 12);
  const nw = 3, ww = (w - 80) / nw;
  for (let i = 0; i < nw; i++) {
    const wx = x + 30 + i * (ww + 10), wy = y + 40;
    rr(g, wx, wy, ww - 20, h - 150, 18); fs(g, '#BFE3EE', INK, 5);
    g.save(); rr(g, wx, wy, ww - 20, h - 150, 18); g.clip(); inside(g, wx, wy, ww - 20, h - 150, i); g.restore();
    g.fillStyle = 'rgba(255,255,255,.35)'; g.beginPath(); g.moveTo(wx + 20, wy); g.lineTo(wx + 60, wy); g.lineTo(wx + 20, wy + 80); g.lineTo(wx - 20, wy + 80); g.fill();
  }
  [x + 90, x + w - 90].forEach(cx => { circ(g, cx, y + h + 6, 32); fs(g, '#3A3F4A', INK, 4); circ(g, cx, y + h + 6, 10); fs(g, C.grey); });
}
const S_TRAIN = {
  draw(g, s) {
    const t0 = bar(63), L = s - t0;
    // 天空和海
    g.fillStyle = vgrad(g, 0, 640, [[0, '#7CC7EA'], [1, '#D6F1F6']]); g.fillRect(0, 0, W, 640);
    sunFace(g, 280, 170, 80, s, 'grin');
    for (let i = 0; i < 4; i++) cloud(g, ((i * 650 - s * 30) % 2600 + 2600) % 2600 - 200, 110 + (i % 2) * 70, .9);
    // 远山小岛
    g.fillStyle = '#9CC9B6'; g.beginPath(); g.moveTo(0, 640); g.quadraticCurveTo(300, 540, 600, 640); g.moveTo(1200, 640); g.quadraticCurveTo(1500, 520, 1900, 640); g.fill();
    g.fillStyle = vgrad(g, 640, H, [[0, '#3FA7C6'], [1, '#1F6E9A']]); g.fillRect(0, 640, W, H - 640);
    for (let i = 0; i < 40; i++) { const r = hash(i, 7), x = ((r * 2200 - s * (60 + r * 80)) % 2200 + 2200) % 2200 - 140, y = 680 + hash(i, 8) * 380; withAlpha(g, .5 + .5 * Math.sin(s * 4 + i), () => line(g, x, y, x + 40 + r * 60, y, 'rgba(255,255,255,.7)', 4)); }
    // 帆船
    const bx = ((1500 - s * 40) % 2200 + 2200) % 2200 - 100;
    poly(g, [[bx - 60, 700], [bx + 60, 700], [bx + 40, 730], [bx - 40, 730]]); fs(g, C.red, INK, 3);
    poly(g, [[bx, 600], [bx, 695], [bx + 60, 695]]); fs(g, C.white, INK, 3);
    // 海鸥
    for (let i = 0; i < 4; i++) bird(g, ((i * 520 + s * 140) % 2400) - 200, 300 + Math.sin(s * 2 + i) * 30, s, 1.1);
    // 高架桥
    const off = s * 700;
    for (let k = Math.floor(off / 360) - 1; k < off / 360 + 7; k++) { const x = k * 360 - off; rr(g, x, 790, 60, 300, 4); fs(g, '#D9CFC1', INK, 4); }
    g.fillStyle = '#E8DED0'; g.fillRect(0, 760, W, 40); line(g, 0, 760, W, 760, INK, 5); line(g, 0, 800, W, 800, INK, 5);
    // 列车（固定在画面里，背景在跑），每拍轻轻颠一下
    const ty = 450 - pulse(s, 10, 2) * 6;
    const inside = (g, x, y, w, h, i, car) => {
      g.fillStyle = '#F7E7CF'; g.fillRect(x, y, w, h);
      const who = [['cup', 'cake', 'commuterP'], ['commuterB', 'candle', 'donut'], ['commuterY', 'commuterP', 'cake']][car][i];
      const cx = x + w / 2, cy = y + h + 60;
      if (who === 'candle') {
        candle(g, cx - 10, cy + 50, s, { s: 1.05, face: 'happy', mouth: sing(s), flame: 1.2, armR: 2.6 + Math.sin(s * 9) * .3, armL: .5, shadow: false, scarf: true });
      } else if (who.startsWith('commuter')) {
        const col = { commuterP: '#F2A7B5', commuterB: '#9FC8F0', commuterY: '#F5D58A' }[who];
        commuter(g, cx, cy + 60, s, { s: .95, h: 240, col, face: 'happy', blush: 1, armR: 2.5 + bob(s) * .3, seed: i + car * 3 });
      } else friend(g, who, cx, cy + 10, s, { s: .95, face: 'happy', armL: 2.2 + bob(s + i) * .3, armR: .4, shadow: false, seed: i });
    };
    for (let c = 0; c < 3; c++) trainCar(g, 40 + c * 640, ty, 610, 310, s, (g, x, y, w, h, i) => inside(g, x, y, w, h, i, c), c === 2);
    for (let c = 0; c < 2; c++) { rr(g, 640 + c * 640 + 4, ty + 120, 36, 120, 6); fs(g, '#3A3F4A', INK, 3); }
    // 车顶电子屏：下一站
    rr(g, 690, ty - 70, 560, 60, 10); fs(g, '#20232B', INK, 4);
    g.save(); rr(g, 690, ty - 70, 560, 60, 10); g.clip();
    const msg = '下一站：随便哪儿    NEXT STOP: ANYWHERE    ';
    g.font = F(32, 'sans'); const mw = g.measureText(msg).width;
    const mx = 1250 - ((s * 160) % mw);
    g.fillStyle = '#FFB547'; g.textBaseline = 'middle'; g.fillText(msg, mx, ty - 40); g.fillText(msg, mx + mw, ty - 40);
    g.restore();
    // 速度线
    for (let i = 0; i < 5; i++) { const y = 470 + i * 60, x = ((i * 410 - s * 2600) % 2600 + 2600) % 2600 - 300; line(g, x, y, x + 200, y, 'rgba(255,255,255,.65)', 5); }
  },
};

/* ================= 12 纸飞机 ================= */
function paperPlane(g, x, y, sc, rot = 0, col = C.white) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sc, sc);
  poly(g, [[110, 0], [-90, -50], [-40, 0]]); fs(g, col, INK, 4);
  poly(g, [[110, 0], [-90, 40], [-40, 0]]); fs(g, mixc(col, '#B9B2A8', .35), INK, 4);
  poly(g, [[110, 0], [-60, 14], [-40, 0]]); fs(g, mixc(col, '#8F887E', .4), INK, 3);
  g.restore();
}
const S_PLANES = {
  draw(g, s) {
    const t0 = bar(69), jump = bar(73), away = bar(74);
    deskScene(g, s, {
      wall: '#F3E3C3',
      window: (g) => {
        const wx = 90, wy = 120, ww = 420, wh = 420;
        rr(g, wx - 16, wy - 16, ww + 32, wh + 32, 10); fs(g, C.cream, INK, 5);
        g.save(); rr(g, wx, wy, ww, wh, 4); g.clip();
        g.fillStyle = vgrad(g, wy, wy + wh, [[0, '#7CC7EA'], [1, '#E3F5F7']]); g.fillRect(wx, wy, ww, wh);
        cloud(g, wx + 120 + Math.sin(s * .5) * 20, wy + 120, .7); cloud(g, wx + 320, wy + 260, .5);
        g.restore();
        // 窗扇打开
        poly(g, [[wx, wy], [wx - 60, wy + 40], [wx - 60, wy + wh - 40], [wx, wy + wh]]); fs(g, 'rgba(200,230,240,.8)', INK, 4);
        poly(g, [[wx + ww, wy], [wx + ww + 60, wy + 40], [wx + ww + 60, wy + wh - 40], [wx + ww, wy + wh]]); fs(g, 'rgba(200,230,240,.8)', INK, 4);
      },
      screen: (g, x, y, w, h) => {
        g.fillStyle = '#F4F7FA'; g.fillRect(x, y, w, h);
        text(g, '周报 · 已提交', x + w / 2, y + 140, 50, { k: 'sans', col: INK });
        circ(g, x + w / 2, y + 260, 60); fs(g, C.grass, INK, 4);
        g.beginPath(); g.moveTo(x + w / 2 - 28, y + 260); g.lineTo(x + w / 2 - 6, y + 284); g.lineTo(x + w / 2 + 30, y + 236); g.strokeStyle = C.white; g.lineWidth = 12; g.lineCap = 'round'; g.stroke();
      },
    });
    // 纸堆越来越矮（都折成飞机了）
    const nb = Math.max(0, Math.floor(beatIdx(s) - beatIdx(t0)));
    [[200], [1640]].forEach(([x], k) => { const n = Math.max(0, 40 - nb * 2); for (let i = 0; i < n; i++) { const jit = (hash(i, k) - .5) * 24; rr(g, x - 120 + jit, 760 - 12 - i * 13, 240, 12, 2); fs(g, i % 5 ? C.white : '#F3E9C7', INK, 2.5); } });
    // 每两拍扔出一架纸飞机，飞出窗外
    for (let k = Math.ceil(beatIdx(t0) / 2) * 2; k < beatIdx(jump); k += 2) {
      const tt = BEAT0 + k * BEAT, u = (s - tt) / 1.3;
      if (u < 0 || u > 1) continue;
      const x = lerp(600, 300 + hash(k, 1) * 120, E.sine(u)), y = lerp(760, 300 + hash(k, 2) * 120, u) - Math.sin(u * Math.PI) * 160;
      paperPlane(g, x, y, lerp(.7, .3, u), -2.6 + Math.sin(u * 6) * .2, [C.white, C.pinkL, C.skyL, '#FCE3B0'][(k / 2) % 4]);
    }
    // 一架大纸飞机滑进来，小烛跳上去，飞出窗外
    let px = lerp(2200, 700, E.out(seg(s, jump - 2 * BEAT, jump))), py = 700, pr = .05, ps = 1.5;
    if (s > away) { const u = E.in(seg(s, away, bar(75) + .2)); px = lerp(700, 260, u); py = lerp(700, 260, u) - Math.sin(u * Math.PI) * 120; pr = lerp(.05, -2.6, E.io(u)) ; ps = lerp(1.5, .5, u); }
    const onPlane = s > jump + BEAT;
    if (s > jump - 2 * BEAT) {
      paperPlane(g, px, py, ps, pr + (s > away ? 0 : Math.sin(s * 3) * .03), C.white);
    }
    const hop = E.sine(clamp((s - jump) / (BEAT * 1.2)));
    let cx = 560, cy = 905;
    if (s > jump) { cx = lerp(560, px - 10, hop); cy = lerp(905, py - 30 * ps, hop) - Math.sin(hop * Math.PI) * 140; }
    if (s > away) { cx = px - 10 * ps / 1.5; cy = py - 30 * ps; }
    candle(g, cx, cy, s, {
      s: onPlane ? 1.3 * ps / 1.5 : 1.3, face: s > jump - 2 * BEAT ? 'happy' : 'smile', mouth: sing(s), flame: 1.15, glow: .3, scarf: s > away,
      armL: s < jump ? .6 : 2.5, armR: s < jump ? (bphase(s, 2) < .3 ? 2.4 : 1.5) : 2.5, bendR: -.4, look: -8, tilt: s > away ? pr * .2 : 0, sit: onPlane && s > away,
    });
    if (s > away) sfx(g, '出发！', 900, 300, 90, C.red, s, away, -.1, 1.2);
    caption(g, s, t0 + .2, bar(72), '16:00', '周报交了，剩下的纸都折成飞机');
  },
};

/* ================= 13 四季飞行 ================= */
const SEASONS = [
  { name: '春', sky: ['#F7B6C8', '#FCE6D8'], hill: ['#B9DDB0', '#8CCB8A', '#6DB56D'], tree: '#F7A6C0', part: 'petal' },
  { name: '夏', sky: ['#5EBBEA', '#CDEFF7'], hill: null, tree: C.grass, part: 'spark' },
  { name: '秋', sky: ['#F4A259', '#FCE1B0'], hill: ['#E9B872', '#D9853B', '#B85C2E'], tree: '#E05A2B', part: 'leaf' },
  { name: '冬', sky: ['#2C3E77', '#9BB3D9'], hill: ['#DDE7F3', '#C3D3E8', '#F4F8FC'], tree: '#2E7D6B', part: 'snow' },
];
function seasonBG(g, s, k) {
  const se = SEASONS[k];
  g.fillStyle = vgrad(g, 0, H, [[0, se.sky[0]], [1, se.sky[1]]]); g.fillRect(0, 0, W, H);
  if (k === 3) { starfield(g, s, 60, 33, 500); for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(0, 220 + i * 30); g.bezierCurveTo(500, 80 + i * 30, 1100, 360 + i * 30, W, 160 + i * 30); g.strokeStyle = `rgba(120,240,190,${.35 - i * .1})`; g.lineWidth = 40; g.stroke(); } }
  else sunFace(g, 1650, 170, 70, s, k === 2 ? 'smile' : 'happy');
  for (let i = 0; i < 3; i++) cloud(g, ((i * 760 - s * 70) % 2400 + 2400) % 2400 - 200, 140 + i * 60, .7, k === 3 ? '#DDE6F5' : C.white);
  if (k === 1) {
    g.fillStyle = vgrad(g, 700, H, [[0, '#3FA7C6'], [1, '#1F6E9A']]); g.fillRect(0, 700, W, H - 700);
    for (let i = 0; i < 30; i++) { const x = ((hash(i, 2) * 2200 - s * 200) % 2200 + 2200) % 2200 - 100, y = 720 + hash(i, 3) * 340; line(g, x, y, x + 50, y, 'rgba(255,255,255,.7)', 4); }
    const bx = ((1700 - s * 160) % 2400 + 2400) % 2400 - 200;
    poly(g, [[bx - 80, 760], [bx + 80, 760], [bx + 55, 800], [bx - 55, 800]]); fs(g, C.mustard, INK, 3); poly(g, [[bx, 620], [bx, 755], [bx + 80, 755]]); fs(g, C.white, INK, 3);
    // 小岛和椰子树
    const ix = ((900 - s * 120) % 2600 + 2600) % 2600 - 300;
    ell(g, ix, 720, 200, 40); fs(g, '#F3D9A0', INK, 4);
    g.beginPath(); g.moveTo(ix, 700); g.quadraticCurveTo(ix + 20, 600, ix - 10, 520); g.strokeStyle = C.brown; g.lineWidth = 16; g.stroke();
    for (let a = 0; a < 5; a++) { g.save(); g.translate(ix - 10, 520); g.rotate(-2.6 + a * .55); ell(g, 60, 0, 60, 16); fs(g, C.grass, INK, 3); g.restore(); }
  } else {
    hills(g, s, 640, 70, .002, 60, se.hill[0], 11 + k);
    hills(g, s, 780, 80, .0028, 160, se.hill[1], 12 + k, { every: 240, draw: (g, x, y, i) => k === 3 ? (poly(g, [[x - 50, y + 20], [x + 50, y + 20], [x, y - 110]]), fs(g, se.tree, INK, 3), poly(g, [[x - 22, y - 50], [x + 22, y - 50], [x, y - 110]]), fs(g, C.white)) : tree(g, x, y + 30, .9, i % 3 ? se.tree : mixc(se.tree, '#FFFFFF', .3)) });
    hills(g, s, 930, 40, .0035, 360, se.hill[2], 13 + k);
    if (k === 3) { const hx = ((1300 - s * 360) % 2600 + 2600) % 2600 - 300; rr(g, hx, 820, 160, 110, 6); fs(g, '#8A5A3C', INK, 4); poly(g, [[hx - 20, 830], [hx + 180, 830], [hx + 80, 750]]); fs(g, C.white, INK, 4); rr(g, hx + 30, 850, 40, 40, 4); fs(g, '#FFD98A', INK, 3); }
  }
  // 飘落物
  const r = R(50 + k);
  for (let i = 0; i < 46; i++) {
    const x0 = r() * W * 1.3, sp = 60 + r() * 120, ph = r();
    const y = ((ph * H + s * sp) % (H + 100)) - 50, x = ((x0 - s * (k === 3 ? 60 : 220)) % (W + 200) + W + 200) % (W + 200) - 100 + Math.sin(s * 2 + i) * 30;
    if (se.part === 'petal') { g.save(); g.translate(x, y); g.rotate(s * 2 + i); ell(g, 0, 0, 10, 6); fs(g, '#FFD1DE', '#E88CA8', 2); g.restore(); }
    if (se.part === 'leaf') { g.save(); g.translate(x, y); g.rotate(s * 1.5 + i); ell(g, 0, 0, 14, 7); fs(g, i % 2 ? '#E05A2B' : C.mustard, INK, 2); g.restore(); }
    if (se.part === 'snow') { circ(g, x, y, 3 + (i % 3) * 2); fs(g, C.white); }
    if (se.part === 'spark' && i < 16) withAlpha(g, .5 + .5 * Math.sin(s * 5 + i), () => sparkle(g, x, (y * .5 + 80), 8, C.white));
  }
  seal(g, 120, 120, 96, se.name, -.06);
}
const S_SEASONS = {
  draw(g, s) {
    const t0 = bar(75);
    const k = clamp(Math.floor((s - t0) / (3 * BAR)), 0, 3);
    seasonBG(g, s, k);
    // 下一个季节从右往左斜着擦过来
    const nk = k + 1, tb = t0 + nk * 3 * BAR, ws = tb - .35;
    if (nk <= 3 && s > ws) {
      const u = E.io(clamp((s - ws) / .7)), x = W + 300 - u * (W + 700);
      g.save(); g.beginPath(); g.moveTo(x, 0); g.lineTo(W, 0); g.lineTo(W, H); g.lineTo(x - 300, H); g.closePath(); g.clip(); seasonBG(g, s, nk); g.restore();
      line(g, x, 0, x - 300, H, C.cream, 18);
    }
    // 朋友们一个个坐着小飞机加入
    const joins = [['cup', bar(78), 1350, 420, C.skyL], ['cake', bar(81), 1250, 760, C.pinkL], ['donut', bar(84), 420, 300, '#FCE3B0']];
    joins.forEach(([who, tt, x, y, col], i) => {
      if (s < tt - .3) return;
      const u = E.out(clamp((s - tt + .3) / 1.2)), fx = lerp(W + 300, x, u) + Math.sin(s * 1.7 + i) * 30, fy = y + Math.sin(s * 2.1 + i * 2) * 26;
      paperPlane(g, fx, fy, 1.15, -.05, col);
      friend(g, who, fx - 20, fy - 6, s, { s: .62, face: 'happy', armL: 2.4 + bob(s) * .3, armR: .5, shadow: false, legs: [-1.3, -1.2], seed: i });
    });
    // 主角的大纸飞机
    const px = 820 + Math.sin(s * .9) * 70, py = 560 + Math.sin(s * 1.6) * 40 - bob(s) * 8;
    paperPlane(g, px, py, 2.2, -.04 + Math.sin(s * 1.6) * .03, C.white);
    candle(g, px - 30, py - 6, s, { s: 1.1, sit: true, kick: s * 3, face: 'happy', mouth: sing(s), flame: 1.2, wickBend: -18, glow: k === 3 ? 1 : .3, scarf: true, armL: 2.3 + bob(s) * .3, armR: .6, shadow: false, hat: k === 3 ? null : null });
    for (let i = 0; i < 4; i++) { const y = py - 60 + i * 40, x = px - 360 - ((s * 900 + i * 200) % 400); line(g, x, y, x + 120, y, 'rgba(255,255,255,.75)', 5); }
  },
};
