// scenes6.js — 间奏（第 46~54 小节）：书页往回翻，翻回告白的那个晚上——"那天晚上，我走得太早了。"
// 她没看见的后半段：他把信推了回去，举起那杯画着月亮的咖啡；他在栈桥尽头捡起她的黑铅笔；
// 每天清晨他都躲在最后一排看她放咖啡；化妆间的墙上钉满了她的杯套；他用她的铅笔轻轻涂过那张被擦掉的杯套，"我喜欢你"一点点显出来。

let REW_A, REW_B;
function shotIndex(id) { return SHOTS.findIndex(s => s.id === id); }
function renderShotInto(buf, id, ts) {
  const i = shotIndex(id);
  const c = buf.getContext('2d');
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; c.filter = 'none';
  renderShot(c, i, ts);
}
// 铅笔画的"倒带"记号
function rewindIcon(g, x, y, s, a) {
  g.save(); g.globalAlpha = a;
  for (const dx of [0, s * 0.9]) { const tri = [[x + dx + s * 0.9, y - s * 0.6], [x + dx, y], [x + dx + s * 0.9, y + s * 0.6]]; const tp = pathOf(tri); paperFill(g, tp); shade(g, tp, 0.8, 30); sk(g, tri.concat([tri[0]]), { w: 2.2, a: 0.9, seed: 11000 + dx }); }
  g.restore();
}
const REWIND = [['s33', 164.0], ['s30', 150.2], ['s28', 141.0], ['s27a', 134.6], ['s24b', 123.6], ['s23b', 117.6], ['s22', 109.0], ['s20b', 101.0], ['s17b', 87.6], ['s14b', 73.6], ['s14a', 69.8], ['s11a', 55.6], ['s10b', 51.6], ['s09b', 43.4], ['s08', 37.4]];

// ---------------- S34 倒带：书页往回翻，翻回告白的那个晚上；然后一张字卡 ----------------
shot('s34', 167.40, (g, t, d) => {
  if (!REW_A) { REW_A = mk(W, H); REW_B = mk(W, H); }
  camReset(g);
  const flipEnd = 3.9;
  if (t < flipEnd) {
    // 越翻越快、最后慢下来
    const u = clamp(t / flipEnd);
    const pos = (REWIND.length - 1) * (u < 0.85 ? Math.pow(u / 0.85, 1.6) * 0.92 : 0.92 + (u - 0.85) / 0.15 * 0.08);
    const k = Math.min(REWIND.length - 2, Math.floor(pos)), f = pos - k;
    renderShotInto(REW_A, REWIND[k][0], REWIND[k][1]);
    renderShotInto(REW_B, REWIND[k + 1][0], REWIND[k + 1][1]);
    pageCurl(g, REW_B, REW_A, 1 - ease(f), true);
    // 往回翻的时候画面偏一点冷、旧
    tint(g, [214, 220, 232], 0.25, 'multiply');
    rewindIcon(g, 120, 110, 44, 0.85);
  } else {
    // 字卡：白纸上，铅笔写出一句话
    const p = clamp((t - flipEnd - 0.1) / 0.9);
    drawPaper(g);
    withSeed(11010, () => { skRect(g, 260, 200, 1400, 680, { w: 2.6, a: 0.7, over: 12 }); skRect(g, 280, 220, 1360, 640, { w: 1.2, a: 0.45, over: 8 }); });
    writeWords(g, '那天晚上，', 960, 440, 92, clamp(p * 1.6), { sp: 8 });
    writeWords(g, '我走得太早了。', 960, 600, 92, clamp(p * 1.6 - 0.6), { sp: 8 });
  }
}, { type: 'smudge', d: 0.6 });
sfx(167.40, 'pageFlipsBack', { dur: 3.9, n: 14 });
sfx(167.40 + 4.0, 'pencil', { dur: 1.1, gain: 0.8 });

// ---------------- S35 他那边：他把信轻轻推回去，摇摇头，举起那杯画着月亮的咖啡；女主演笑了，往栈桥那边指了指 ----------------
shot('s35', bar(48), (g, t, d) => {
  cam(g, 1000, 520, 1.45);
  boardwalkNight(g, t + 172, { lampX: 1240, wallX: 380 });
  const push = smooth(0.5, 1.1, t), shake = t > 0.9 && t < 1.7 ? Math.sin((t - 0.9) * 18) * 8 : 0;
  const cupUp = smooth(1.5, 2.1, t), point = smooth(2.6, 3.1, t);
  // 女主演
  figure(g, 'star', 840, 880, 4.6, P({ torso: lerp(18, 2, push), neck: lerp(10, 0, push), look: 0.45,
    aF: point > 0.1 ? [lerp(20, 95, point), lerp(10, -5, point)] : [lerp(70, 20, push), lerp(10, 30, push)], aB: [lerp(65, 70, point), lerp(15, 70, point)], hF: point > 0.1 ? 'point' : 'hold', hB: 'open',
    eyes: cupUp > 0.5 ? 'smile' : 'open', mouth: cupUp > 0.5 ? 'smile' : 'o', blush: 0.6, tear: cupUp > 0.5 ? 0.4 : 0 }),
    { night: true, dim: 0.2, light: { dx: 1, dy: -0.6, a: 0.5 }, seed: 401, hold: push < 0.5 ? { hand: 'F', draw(g2, c, a) { envelope(g2, c[0] + 4, c[1] - 1, 11, 7.5, -8); } } : null });
  // 他：先把信推回去（摇头），再举起咖啡，指着杯套上的月亮
  figure(g, 'him', 1180, 880, 4.6, P({ torso: -2, neck: shake * 0.6, look: lerp(0.45, 0.6, cupUp), aB: [lerp(-4, 60, push) * (1 - cupUp * 0.6), lerp(10, 30, push)], hB: 'flat',
    aF: [lerp(30, 70, cupUp), lerp(80, 70, cupUp)], hF: 'hold', mouth: cupUp > 0.4 ? 'smile' : 'line', eyes: cupUp > 0.4 ? 'smile' : 'open' }),
    { face: -1, night: true, dim: 0.2, light: { dx: -1, dy: -0.6, a: 0.5 }, seed: 402,
      hold: { hand: 'F', draw(g2, c) { coffeeCup(g2, c[0] + 1, c[1] + 3.5, 6.5, { night: true, doodle: 'moon', warm: 0.4 + cupUp * 0.8, t }); } } });
  if (push > 0.3 && push < 1) envelope(g, lerp(950, 900, push), 600, 50, 34, -6);
});
sfx(bar(48) + 1.5, 'cupUp', {});

// ---------------- S36 他走到栈桥尽头：没有人，只有月光下的橡皮屑，和一支黑铅笔 ----------------
shot('s36', bar(49), (g, t, d) => {
  cam(g, 1180, 560, 1.32);
  const HZ = 500;
  nightSky(g, -100, -100, 2100, HZ + 2, t + 176, { moon: [1500, 140, 56], stars: 60 });
  moon(g, 1500, 140, 56, t);
  sea(g, -100, 2100, HZ, 1200, t + 176, { moonX: 1500, waves: 80 });
  pierSide(g, -100, 1500, 860, t, { night: true, moonlit: true });
  // 桥面上的橡皮屑，在月光里发亮
  for (let i = 0; i < 26; i++) { const x = 1240 + hash(i, 61) * 200, y = 856 - hash(i, 62) * 6; g.save(); g.fillStyle = rgba([150, 146, 140], 0.9); g.beginPath(); g.ellipse(x, y, 3 + hash(i, 63) * 3, 1.6, 0, 0, 6.283); g.fill(); g.restore(); erase(g, circlePath(x, y - 1, 1.2), 0.7); }
  const walk = clamp(t / 1.3), crouch = smooth(1.3, 1.7, t) * (1 - smooth(2.6, 3.0, t)), look = smooth(2.6, 3.0, t);
  const x = lerp(760, 1250, easeOut(walk));
  const pose = crouch > 0.01 || t > 1.3 ? P({ torso: 40 * crouch, neck: lerp(10, -10, look) + crouch * 10, look: lerp(0.3, 0.6, look), eyes: look > 0.5 ? 'open' : 'down', lF: [lerp(4, 95, crouch), lerp(-3, -130, crouch)], lB: [lerp(-4, 45, crouch), lerp(-3, -150, crouch)], aF: [lerp(10, 70, crouch) + look * 40, lerp(20, 30, crouch) + look * 60], hF: 'hold', mouth: 'line' })
    : walkPose(t * 1.2, 0, { look: 0.3, eyes: 'open' });
  const got = t > 2.2;
  if (!got) blackPencil(g, 1300, 856, 64, 178, { w: 3.6, seed: 8101 });
  figure(g, 'him', x, 860, 5.0, pose, { night: true, dim: 0.3, seed: 402, light: { dx: 1, dy: -0.5, a: 0.3, col: C.moonHot },
    hold: got ? { hand: 'F', draw(g2, c, a) { blackPencil(g2, c[0] - 3, c[1] + 2, 13, a - 60, { w: 0.8, seed: 8101 }); } } : null });
  if (got) glow(g, x + 50, 700, 80, C.moonHot, 0.25);
});
sfx(bar(49), 'steps', { dur: 1.3, wood: 1 });
sfx(bar(49) + 2.2, 'pick', {});

// ---------------- S37 每天清晨：他躲在最后一排，看她放咖啡、画小涂鸦 ----------------
shot('s37', bar(50), (g, t, d) => {
  cam(g, 960, 520, 1.0);
  // 远处的舞台（清晨），她蹲在台口画涂鸦
  g.save(); g.translate(960, 300); g.scale(0.55, 0.55); g.translate(-960, -540);
  stageSet(g, t, { mode: 'dawn', mark: [800, 905], ghost: [1350, 880], footlights: false });
  beam(g, 1750, -100, 1050, 900, 140, 420, C.dawn, 0.3, { layers: 4 });
  coffeeCup(g, 805, 905, 62, { doodle: DOODLES[Math.floor(t * 1.4) % DOODLES.length], warm: 0.9, t });
  figure(g, 'her', 880, 905, 4.7, P({ torso: 34, neck: 16, look: 0.3, eyes: 'down', lF: [92, -128], lB: [40, -150], aF: [70, 40], aB: [30, 70], hF: 'hold', mouth: 'smile' }), { face: -1, seed: 403 });
  g.restore();
  // 近处：黑黑的观众席，最后一排
  const seats = rectPath(-100, 640, 2120, 600); paperFill(g, seats); shade(g, seats, 0.86, 30, { scale: 1 });
  withSeed(11100, () => {
    for (let r = 0; r < 3; r++) for (let i = 0; i < 9; i++) {
      const x = i * 240 + (r % 2) * 120 - 60, y = 700 + r * 130;
      const sb = [[x - 90, y + 140], [x - 86, y - 10], [x - 70, y - 30], [x + 70, y - 30], [x + 86, y - 10], [x + 90, y + 140]];
      part(g, sb, { tone: 0.88, w: 2, per: 3 });
    }
  });
  // 他：坐在最后一排的座位里，只露出头和肩膀，看着台上，笑了
  bustFront(g, 'him', 1500, 640, 210, { eyes: 'open', gaze: [-0.8, 0.2], mouth: smooth(1.2, 1.8, t) > 0.5 ? 'smile' : 'line', night: true, light: { dx: -1, dy: -0.4, a: 0.25, col: C.dawn } });
  withSeed(11101, () => { const sb = [[1340, 1100], [1336, 760], [1360, 740], [1640, 740], [1664, 760], [1660, 1100]]; part(g, sb, { tone: 0.9, w: 2.2, per: 3 }); });
});

// ---------------- S38 化妆间：镜子四周一圈灯泡，墙上钉满了她的杯套 ----------------
function sleeveCard(g, x, y, s, kind, rot, o = {}) {
  g.save(); g.translate(x, y); g.rotate(R(rot));
  const pts = [[-s, -s * 0.36], [s, -s * 0.42], [s * 0.86, s * 0.42], [-s * 0.86, s * 0.36]];
  const pp = pathOf(pts); paperFill(g, pp); shade(g, pp, 0.28, 90, { scale: 0.6 });
  const pane = new Path2D(); pane.ellipse(0, 0, s * 0.45, s * 0.28, 0, 0, 6.283); erase(g, pane, 0.9);
  sk(g, pts.concat([pts[0]]), { w: 1.4, a: 0.8, seed: o.seed ?? 1 });
  doodle(g, kind, 0, 0, s * 0.22);
  // 图钉
  erase(g, circlePath(0, -s * 0.3, s * 0.06), 1); skEllipse(g, 0, -s * 0.3, s * 0.06, s * 0.06, { w: 1.2, a: 0.8, passes: 1 });
  g.restore();
}
function dressingRoom(g, t, o = {}) {
  const wall = rectPath(-400, -200, 2800, 1500); paperFill(g, wall); shade(g, wall, 0.55, 80, { scale: 1 });
  const mx = o.mx ?? 960, my = o.my ?? 420, mw = 560, mh = 420;
  // 墙上的杯套：一排排
  let k = 0;
  for (let r = 0; r < 6; r++) for (let c = 0; c < 16; c++) {
    const x = -300 + c * 170 + (r % 2) * 60, y = 40 + r * 140;
    if (x > mx - mw / 2 - 120 && x < mx + mw / 2 + 120 && y > my - mh / 2 - 90 && y < my + mh / 2 + 90) continue;
    sleeveCard(g, x, y, 62, DOODLES[(k++) % DOODLES.length], (hash(r, c) - 0.5) * 14, { seed: 11200 + r * 20 + c });
  }
  // 镜子和灯泡
  const mirror = rectPath(mx - mw / 2, my - mh / 2, mw, mh); paperFill(g, mirror); shade(g, mirror, 0.3, 30, { scale: 1 });
  for (let i = 0; i < 3; i++) eraseStroke(g, [[mx - mw / 2 + 80 + i * 160, my + mh / 2], [mx - mw / 2 + 220 + i * 160, my - mh / 2]], 24 - i * 6, 0.18);
  withSeed(11300, () => { skRect(g, mx - mw / 2 - 30, my - mh / 2 - 30, mw + 60, mh + 60, { w: 3, a: 0.9 }); skRect(g, mx - mw / 2, my - mh / 2, mw, mh, { w: 2, a: 0.8 }); });
  const bulbs = [];
  for (let i = 0; i < 6; i++) { bulbs.push([mx - mw / 2 + 40 + i * (mw - 80) / 5, my - mh / 2 - 30]); }
  for (let i = 0; i < 4; i++) { bulbs.push([mx - mw / 2 - 30, my - mh / 2 + 50 + i * (mh - 100) / 3]); bulbs.push([mx + mw / 2 + 30, my - mh / 2 + 50 + i * (mh - 100) / 3]); }
  for (const [bx, by] of bulbs) { erase(g, circlePath(bx, by, 13), 1); skEllipse(g, bx, by, 13, 13, { w: 1.4, a: 0.7, passes: 1 }); glow(g, bx, by, 46, C.amberHot, 0.5); }
  glow(g, mx, my, 700, C.amber, 0.22);
  // 桌子
  const tb = rectPath(-400, my + mh / 2 + 70, 2800, 900); paperFill(g, tb); shade(g, tb, 0.5, 0, { scale: 1 });
  withSeed(11301, () => sk(g, [[-400, my + mh / 2 + 70], [2400, my + mh / 2 + 70]], { w: 2.6, a: 0.9 }));
}
shot('s38', bar(51), (g, t, d) => {
  const u = t / d;
  cam(g, lerp(150, 960, ease(u)), lerp(330, 470, ease(u)), lerp(1.35, 1.0, ease(u)));
  dressingRoom(g, t, {});
  // 他把最新的一张（画着小追光的）钉上去
  const pin = smooth(2.2, 2.7, t);
  sleeveCard(g, 1330, 360 - (1 - pin) * 30, 62, 'spot', -4, { seed: 11299 });
  const hx = 1330 + 40, hy = 400 - (1 - pin) * 30;
  part(g, [[hx - 30, hy + 10], [hx - 26, hy - 30], [hx + 10, hy - 40], [hx + 36, hy - 10], [hx + 60, hy + 160], [hx - 20, hy + 170]], { w: 2.2, per: 4, tone: 0.1 });
  const sl = new Path2D(); sl.moveTo(hx - 30, hy + 120); sl.lineTo(hx + 70, hy + 110); sl.lineTo(hx + 120, hy + 600); sl.lineTo(hx - 40, hy + 600); sl.closePath(); paperFill(g, sl);
  stripes(g, sl, [hx, hy + 100], [hx + 40, hy + 600], 120, 7, 0.72); sk(g, [[hx - 30, hy + 120], [hx - 40, hy + 600]], { w: 2.2, a: 0.85 }); sk(g, [[hx + 70, hy + 110], [hx + 120, hy + 600]], { w: 2.2, a: 0.85 });
});
sfx(bar(51) + 2.6, 'pin', {});

// ---------------- S39 那张擦掉的杯套：他用她的黑铅笔斜着轻轻涂，"我喜欢你"一点点显出来 ----------------
shot('s39', bar(52), (g, t, d) => {
  cam(g, 960, 520, 1.0 + t * 0.02);
  sleeveClose(g, t);
  // 被擦过的字的印子（很淡）
  writeWords(g, '我喜欢你', 900, 500, 190, 1, { sp: 18, a: 0.07 });
  // 斜着涂的石墨：一层排线从左往右铺过去，字的地方是压出来的凹痕，涂不上，留成白的
  const p = smooth(0.4, 2.8, t);
  const F = BUF_F.getContext('2d');
  F.setTransform(1, 0, 0, 1, 0, 0); F.globalCompositeOperation = 'source-over'; F.clearRect(0, 0, W, H);
  F.setTransform(g.getTransform());
  const pane = new Path2D(); pane.ellipse(960, 520, 600, 270, 0, 0, 6.283);
  F.save(); F.clip(pane);
  const cover = new Path2D(); const ex = lerp(300, 1620, p);
  cover.moveTo(300, 200); for (let y = 200; y <= 840; y += 20) cover.lineTo(ex + Math.sin(y / 40) * 30, y); cover.lineTo(300, 840); cover.closePath();
  shade(F, cover, 0.62, 28, { scale: 1.4 });
  F.restore();
  F.globalCompositeOperation = 'destination-out';
  writeWords(F, '我喜欢你', 900, 500, 190, 1, { sp: 18, a: 1 });
  F.globalCompositeOperation = 'source-over';
  F.setTransform(1, 0, 0, 1, 0, 0);
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(BUF_F, 0, 0); g.restore();
  // 显出来的字，亮一点
  if (p > 0.15) glow(g, Math.min(ex, 1300) - 200, 500, 300, C.amberHot, 0.18 * p);
  // 斜拿着的铅笔（笔芯侧面贴着纸）
  if (t < 3.2) { const px = ex + Math.sin(t * 22) * 25, py = 520 + Math.cos(t * 17) * 120; blackPencil(g, px - 80, py + 20, 820, -24, { w: 28, seed: 8101 }); }
  // 化妆镜的灯照着
  glow(g, 1500, 120, 600, C.amber, 0.25);
});
sfx(bar(52) + 0.4, 'rubbing', { dur: 2.4 });

// ---------------- S40 他的脸：灯泡的暖光里，先是愣住，然后笑了 ----------------
shot('s40', bar(53), (g, t, d) => {
  cam(g, 960, 540, 1.0 + t * 0.015);
  const bg = rectPath(-100, -100, 2120, 1300); paperFill(g, bg); shade(g, bg, 0.6, 80, { scale: 1 });
  for (let i = 0; i < 5; i++) { const bx = 1500 + (i % 2) * 120, by = 120 + i * 190; erase(g, circlePath(bx, by, 26), 1); glow(g, bx, by, 110, C.amberHot, 0.45); }
  const realize = smooth(0.2, 0.6, t), smile = smooth(1.4, 2.0, t);
  hisClose(g, 860, 470, 580, { tilt: lerp(6, -2, smile), eyes: realize > 0.5 && smile < 0.5 ? 'wide' : 'open', look: lerp(-0.6, 0.2, smile), mouth: smile > 0.5 ? 'smile' : realize > 0.5 ? 'open' : 'closed', warm: 1, blush: smile * 0.6, blink: Math.max(0, 1 - Math.abs(t - 1.2) / 0.08) });
  glow(g, 1300, 400, 600, C.amber, 0.25);
});

// ---------------- S41 他把杯套翻过来，用她的铅笔在背面写了几个字（看不清写的什么），站起来跑了出去 ----------------
shot('s41', bar(54), (g, t, d) => {
  cam(g, 960, 520, 1.0);
  if (t < 1.4) {
    // 杯套的背面：空白；他的手（条纹袖子）拿着她的铅笔在写，手挡住了字
    const bg = rectPath(-100, -100, 2120, 1300); paperFill(g, bg); shade(g, bg, 0.3, 90, { scale: 1.6 });
    const pane = new Path2D(); pane.ellipse(960, 520, 640, 300, 0, 0, 6.283); erase(g, pane, 0.92);
    withSeed(11400, () => { for (let i = 0; i < 12; i++) sk(g, [[640 + i * 50, 470 + Math.sin(i) * 20], [660 + i * 50, 540]], { w: 2.4, a: clamp(t / 1.2) * 0.6, passes: 1 }); });
    const tx = 700 + t * 380, ty = 520 + Math.sin(t * 16) * 30;
    // 他的手：大一点、指节分明（用同一个握笔的手，袖子换成条纹）
    handPencilClose(g, tx, ty, 900, -48);
    const sl = new Path2D(); const a = R(-48), d_ = [Math.cos(a), Math.sin(a)], n_ = [-d_[1], d_[0]];
    const Q = (u, v) => [tx + d_[0] * u * 900 + n_[0] * v * 900, ty + d_[1] * u * 900 + n_[1] * v * 900];
    const slp = [Q(0.6, 0.0), Q(0.66, 0.34), Q(1.3, 0.64), Q(1.4, 0.08), Q(0.9, -0.1)];
    const sp = pathOf(spline(slp, 6, true)); paperFill(g, sp); stripes(g, sp, Q(0.6, 0.15), Q(1.35, 0.35), 500, 9, 0.72); sk(g, spline(slp, 6, true), { w: 2.6, a: 0.9 });
  } else {
    // 他抓起外套，跑出化妆间的门
    dressingRoom(g, t, { mx: 760 });
    const run = smooth(1.5, 2.3, t);
    figure(g, 'him', lerp(900, 2100, run), 1000, 5.6, walkPose(t * 2.2, 1, { look: 0.3, mouth: 'line', brows: -1 }), { seed: 402, light: { dx: -1, dy: -0.4, a: 0.3 } });
  }
});
sfx(bar(54), 'pencil', { dur: 1.2, gain: 0.9 });
sfx(bar(54) + 1.5, 'runSteps', { dur: 0.9 });
sfx(bar(54) + 1.9, 'door', {});
