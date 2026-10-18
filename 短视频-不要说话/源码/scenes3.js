// scenes3.js — 第一遍副歌（C1）和间奏：黑铅笔在纸上一拉，拉出一座立起来的舞台；演出的晚上，她推上推子，追光落在他身上，像一个拥抱；
// 她躲在灯光室的角落哼歌，沙哑的音符飞过观众席，绕着他转，他听不见；他停下来按住胸口，她把手指放在嘴唇上。谢幕。日子一天天过去。

// 观众：前景一排后脑勺和肩膀（剪影），边上被台上的光描一道亮边
function audienceRow(g, y, n, t, o = {}) {
  withSeed(o.seed ?? 9700, () => {
    for (let i = 0; i < n; i++) {
      const x = (i + 0.5) / n * (W + 200) - 100 + (hash(i, 1) - 0.5) * 60, s = (o.s ?? 1) * (0.9 + hash(i, 2) * 0.25);
      const hy = y - 80 * s + Math.sin(t * 0.7 + i) * 2;
      const sh = [[x - 95 * s, y + 60], [x - 80 * s, hy + 70 * s], [x - 40 * s, hy + 50 * s], [x + 40 * s, hy + 50 * s], [x + 80 * s, hy + 70 * s], [x + 95 * s, y + 60]];
      const sp = pathOf(spline(sh, 5, true)); paperFill(g, sp); shade(g, sp, 0.92, 30, { scale: 1 });
      const hp = new Path2D(); hp.ellipse(x, hy, 44 * s, 52 * s, 0, 0, 6.283); paperFill(g, hp); shade(g, hp, 0.93, 40, { scale: 1 });
      sk(g, spline(sh.slice(1, 5), 5), { w: 1.6, a: 0.6, passes: 1 });
      if (o.rim) { g.save(); g.clip(hp); glow(g, x + (o.rimX ?? 0) * 40 * s, hy - 40 * s, 50 * s, C.amber, 0.3 * o.rim); g.restore(); }
      if (o.clap && hash(i, 3) < 0.7) { // 鼓掌的手
        const ph = Math.sin(t * 14 + i * 1.3), hx = x + (hash(i, 4) - 0.5) * 30, hyy = hy + 10 * s;
        for (const sd of [-1, 1]) { const hp2 = new Path2D(); hp2.ellipse(hx + sd * (8 + Math.max(0, ph) * 14) * s, hyy, 13 * s, 20 * s, sd * 0.3, 0, 6.283); paperFill(g, hp2); shade(g, hp2, 0.82, 40); }
      }
    }
  });
}
// 光的拥抱：从光斑里升起两道暖光，绕到他身前合拢
function lightHug(g, cx, cy, h, p, t) {
  if (p <= 0.01) return;
  for (const sd of [-1, 1]) {
    // 从光斑的一边升起来，绕到他身前，在胸口合拢
    const ctrl = [[cx + sd * h * 0.42, cy + 6], [cx + sd * h * 0.5, cy - h * 0.3], [cx + sd * h * 0.36, cy - h * 0.56], [cx + sd * h * 0.12, cy - h * 0.6], [cx + sd * h * 0.02, cy - h * 0.55]];
    const sp = spline(ctrl, 10);
    const n = Math.max(2, Math.floor(sp.length * p));
    const pts = sp.slice(0, n).map(([x, y], i) => [x + Math.sin(t * 2 + i * 0.3) * 3, y]);
    for (const [w, al] of [[54, 0.1], [30, 0.16], [12, 0.26]]) {
      g.save(); g.globalCompositeOperation = 'screen'; g.strokeStyle = rgba(C.amberHot, al); g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round';
      g.filter = 'blur(7px)';
      g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (const q of pts) g.lineTo(q[0], q[1]); g.stroke(); g.restore();
    }
    // 手臂的尽头，一团更亮的光，像手
    const e = pts[pts.length - 1]; glow(g, e[0], e[1], 50, C.amberHot, 0.35 * p);
  }
}
// ---------------- S15 愿意 用一支黑色的铅笔：大特写，她的手、黑铅笔在纸上拉出一条线 ----------------
function handPencilClose(g, tipX, tipY, L, angDeg, o = {}) {
  // 铅笔从笔尖往右上伸出去；手握在离笔尖 0.15~0.45 L 的地方
  const a = R(angDeg), d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]];
  const Q = (u, v) => [tipX + d[0] * u * L + n[0] * v * L, tipY + d[1] * u * L + n[1] * v * L];
  blackPencil(g, tipX, tipY, L, angDeg, { w: L * 0.034, seed: 8101, glowTip: o.glowTip });
  withSeed(9800, () => {
    // 袖子（开衫）
    const sl = [Q(0.55, 0.06), Q(0.62, 0.34), Q(1.25, 0.62), Q(1.35, 0.1), Q(0.9, -0.08)];
    part(g, sl, { tone: 0.42, ang: angDeg + 90, w: 2.6, hs: 1 });
    g.save(); g.clip(pathOf(spline(sl, 6, true))); for (let i = 0; i < 7; i++) sk(g, [Q(0.62 + i * 0.1, -0.1), Q(0.7 + i * 0.1, 0.7)], { w: 1.1, a: 0.3, passes: 1 }); g.restore();
    sk(g, spline([Q(0.6, 0.0), Q(0.66, 0.2), Q(0.66, 0.36)], 5), { w: 2, a: 0.7 });
    // 中指（在笔下面）
    part(g, [Q(0.14, 0.022), Q(0.2, 0.06), Q(0.36, 0.1), Q(0.4, 0.06), Q(0.34, 0.03), Q(0.2, 0.018)], { w: 2.2, per: 5, tone: 0.06 });
    // 手掌、蜷着的无名指和小指
    part(g, [Q(0.33, -0.04), Q(0.5, -0.06), Q(0.64, 0.04), Q(0.64, 0.26), Q(0.5, 0.33), Q(0.38, 0.28), Q(0.33, 0.17), Q(0.3, 0.05)], { w: 2.4, per: 5, tone: 0.08 });
    sk(g, spline([Q(0.36, 0.18), Q(0.42, 0.24), Q(0.5, 0.25)], 5), { w: 1.4, a: 0.55 });
    sk(g, spline([Q(0.4, 0.27), Q(0.46, 0.31), Q(0.54, 0.31)], 5), { w: 1.4, a: 0.5 });
    // 大拇指（从左下压住笔）
    part(g, [Q(0.2, 0.05), Q(0.26, 0.03), Q(0.42, 0.1), Q(0.48, 0.19), Q(0.4, 0.2), Q(0.24, 0.1)], { w: 2.3, per: 5, tone: 0.04 });
    sk(g, [Q(0.235, 0.045), Q(0.27, 0.07)], { w: 1.2, a: 0.6 });   // 指甲
    // 食指（压在笔上面）
    part(g, [Q(0.15, -0.018), Q(0.22, -0.045), Q(0.4, -0.07), Q(0.5, -0.05), Q(0.42, -0.02), Q(0.22, -0.006)], { w: 2.4, per: 5, tone: 0.03 });
    sk(g, [Q(0.17, -0.022), Q(0.21, -0.03)], { w: 1.2, a: 0.6 });
    sk(g, spline([Q(0.29, -0.045), Q(0.3, -0.03)], 3), { w: 1.1, a: 0.5 });
  });
}
shot('s15', lineT0(10) - 0.15, (g, t, d) => {
  const ts = t + lineT0(10) - 0.15;
  // 笔尖沿着一条长长的弧线走，镜头跟着笔尖
  const p = smooth(chT(10, 2) - 0.2, chT(10, 9) + 0.3, ts);
  const lx = (u) => lerp(-900, 2300, u), ly = (u) => 640 - Math.sin(u * Math.PI) * 60;
  const tipU = 0.05 + p * 0.85;
  const tx = lx(tipU), ty = ly(tipU);
  cam(g, tx - 120, ty - 60, 1.0);
  // 纸面：一张空白的大纸，笔画出来的线
  withSeed(9810, () => {
    const pts = []; for (let i = 0; i <= 80; i++) { const u = i / 80 * tipU; pts.push([lx(u), ly(u)]); }
    sk(g, pts, { w: 4.2, a: 0.92, j: 1.5, taper: 0.05 });
    // 线下面几笔排线，像台面的影子
    for (let i = 0; i < 40; i++) { const u = (i / 40) * tipU; if (u < 0.02) continue; sk(g, [[lx(u), ly(u) + 10], [lx(u) - 30, ly(u) + 70]], { w: 1.4, a: 0.4, passes: 1 }); }
  });
  // 石墨粉
  for (let i = 0; i < 18; i++) { const age = (t * 3 + i * 0.37) % 1; const x = tx - age * 60 - hash(i, 1) * 30, y = ty + 6 + age * age * 30 + hash(i, 2) * 8; g.save(); g.globalAlpha = (1 - age) * 0.6; g.fillStyle = rgba(GRAPH, 1); g.beginPath(); g.arc(x, y, 1.5 + hash(i, 3) * 2, 0, 6.283); g.fill(); g.restore(); }
  handPencilClose(g, tx, ty, 900, -48, { glowTip: 0.35 });
  glow(g, tx, ty, 160, C.amberHot, 0.25);
});
sfx(lineT0(10) - 0.15, 'pencil', { dur: 4.3, gain: 1.0, long: 1 });

// ---------------- S16 画一出沉默舞台剧：线变成台口，一座舞台从纸上立起来，大幕拉开 ----------------
shot('s16', lineT0(11) - 0.12, (g, t, d) => {
  cam(g, 960, 540, 1.0);
  const pop = backOut(clamp((t - 0.15) / 0.9));
  // 先把舞台画到一张透明画布上，再按"立起来"的样子贴回来（以台口的边为轴，竖直方向从 0 拉到 1）
  const F = BUF_F.getContext('2d');
  F.setTransform(1, 0, 0, 1, 0, 0); F.globalCompositeOperation = 'source-over'; F.clearRect(0, 0, W, H);
  F.drawImage(paperCanvas, 0, 0);
  stageSet(F, t, { mode: 'show', foot: smooth(1.2, 1.6, t), moonX: 1350 });
  // 台上的他（大幕拉开以后才看得见）
  figure(F, 'him', 960, 900, 4.6, P({ look: 0.9, aF: [62, 46], aB: [70, 40], wF: 62, wB: 66, hF: 'flat', hB: 'flat', mouth: 'line' }), { seed: 402, dim: 0.15 });
  spotBeam(F, 1250, -150, 960, 905, 170, t, { on: smooth(2.4, 2.9, t), squash: 0.2 });
  // 大幕：两半往两边拉开
  const open = smooth(1.6, 2.6, t);
  curtain(F, -100, 960 - open * 820, -60, 990, 7, t, { tone: 0.72, seed: 7230, sway: 2 });
  curtain(F, 960 + open * 820, 2020, -60, 990, 7, t, { tone: 0.72, seed: 7240, sway: 2 });
  valance(F, -100, 2020, 120, t, { n: 10, tone: 0.8 });
  // 檐幕上写着剧名
  const ban = rectPath(660, 18, 600, 70); paperFill(F, ban); shade(F, ban, 0.1, 0); skRect(F, 660, 18, 600, 70, { w: 2, a: 0.85 });
  pencilText(F, '沉默舞台剧', 960, 54, 44);
  // 一座小小的纸舞台立在纸中间，然后镜头飞进台口
  const zoom = lerp(0.5, 1.0, ease(smooth(1.0, 3.0, t)));
  const base = 990, cx = 960;
  g.save();
  g.translate(cx, 540 + (base - 540) * zoom); g.scale(zoom, zoom); g.translate(-cx, -base);
  // 纸面上那条线
  withSeed(9810, () => sk(g, [[-1200, base + 2], [3200, base]], { w: 4 / zoom, a: 0.92, j: 1.5 }));
  // 立起来的影子
  g.save(); g.globalAlpha = 0.28 * clamp(pop); const sh = g.createLinearGradient(0, base, 0, base + 160); sh.addColorStop(0, rgba(GRAPH, 1)); sh.addColorStop(1, rgba(GRAPH, 0)); g.fillStyle = sh; g.fillRect(-60, base, W + 120, 160); g.restore();
  g.translate(0, base); g.scale(1, Math.max(0.02, pop)); g.translate(0, -base);
  g.drawImage(BUF_F, 0, 0);
  if (pop < 1) { g.globalAlpha = (1 - Math.min(1, pop)) * 0.5; g.fillStyle = rgba(GRAPH, 1); g.fillRect(0, 0, W, H); g.globalAlpha = 1; }
  // 纸板的边
  withSeed(9811, () => { sk(g, [[0, 0], [0, base]], { w: 3 / zoom, a: 0.9 }); sk(g, [[W, 0], [W, base]], { w: 3 / zoom, a: 0.9 }); sk(g, [[0, 0], [W, 0]], { w: 3 / zoom, a: 0.9 }); });
  g.restore();
});
sfx(lineT0(11) - 0.12 + 0.15, 'popup', {});
sfx(lineT0(11) - 0.12 + 1.6, 'curtainOpen', { dur: 1.0 });

// ---------------- S17a 灯光再亮：她的手把推子推上去，脸被调光台照亮 ----------------
shot('s17a', lineT0(12) - 0.18, (g, t, d) => {
  cam(g, 960, 540, 1.0);
  const up = smooth(0.25, 1.1, t);
  boothInside(g, t, { mode: 'show', faders: i => i === 6 ? up : 0.2 + 0.1 * hash(i, 5), lampOn: 0.6,
    view: (g, x0, y0, x1, y1) => { const v = rectPath(x0, y0, x1 - x0, y1 - y0); shade(g, v, 0.9, 30); const sx = (x0 + x1) / 2, sy = y1 - 60; glow(g, sx, sy, 150 * up, C.amberHot, 0.5 * up); figure(g, 'him', sx, sy + 20, 1.2, P({ look: 0.9 }), { night: true, seed: 402 }); } });
  // 推子上的手（从右下伸进来）
  const fx = 150 + 6 * 62, ky = lerp(760 + 16, 760 - 46, up);
  const hp = [[fx - 36, ky + 12], [fx - 30, ky - 30], [fx + 10, ky - 44], [fx + 40, ky - 20], [fx + 46, ky + 20], [fx + 160, ky + 160], [fx + 60, ky + 260], [fx - 60, ky + 80]];
  part(g, hp, { w: 2.4, per: 4, tone: 0.1 });
  const sl = [[fx + 120, ky + 120], [fx + 330, ky + 260], [fx + 260, ky + 420], [fx + 40, ky + 240]]; part(g, sl, { tone: 0.45, w: 2.4, per: 3 });
  glow(g, fx, ky, 220, C.amberHot, 0.35 * up);
  // 她的脸（右边），被下面的光照亮
  herClose(g, 1480, 470, 440, { flip: true, tilt: -6, eyes: 'open', look: -0.2, warm: 0.5 + up * 0.8, mouth: 'closed' });
  glow(g, 1450, 640, 360, C.amber, 0.25 * up);
});
sfx(lineT0(12) - 0.18 + 0.25, 'fader', { dur: 0.8 });
sfx(lineT0(12) - 0.18 + 1.05, 'spotOn', {});

// ---------------- S17b 也抱住你：追光落在台上的他身上，光像两只手臂把他抱住 ----------------
shot('s17b', chT(12, 4) - 0.2, (g, t, d) => {
  cam(g, 960, 520, 1.0 + t * 0.015);
  stageSet(g, t, { mode: 'show', moonX: 1350 });
  darkness(g, 0.9, [[960, 640, 330, 520, 0.95]]);
  spotBeam(g, 1250, -200, 960, 905, 190, t, { on: 1, squash: 0.2 });
  const hug = smooth(0.2, 1.6, t);
  figure(g, 'him', 960, 905, 4.8, P({ look: 0.85, eyes: hug > 0.6 ? 'closed' : 'open', mouth: hug > 0.6 ? 'smile' : 'line', aF: [12, 18], aB: [-10, 14], neck: -4 }),
    { seed: 402, light: { dx: 0.4, dy: -1, a: 0.45 } });
  lightHug(g, 960, 905, 520, hug, t);
  glow(g, 960, 600, 420, C.amber, 0.18 * hug);
  audienceRow(g, 1050, 9, t, { rim: 1, s: 1.15 });
});
sfx(chT(12, 4) - 0.2 + 0.2, 'warmSwell', { dur: 2.2 });

// ---------------- S18 愿意 在角落唱沙哑的歌：灯光室的角落，她抱着膝盖坐在地上哼歌 ----------------
shot('s18', lineT0(13) - 0.15, (g, t, d) => {
  cam(g, 960, 540, 1.04 + t * 0.012);
  // 墙角：左墙暗、右墙亮一点，地板
  const lw_ = new Path2D(); lw_.moveTo(-100, -100); lw_.lineTo(820, -100); lw_.lineTo(820, 760); lw_.lineTo(-100, 1000); lw_.closePath();
  const rw = new Path2D(); rw.moveTo(820, -100); rw.lineTo(2020, -100); rw.lineTo(2020, 1000); rw.lineTo(820, 760); rw.closePath();
  const fl = new Path2D(); fl.moveTo(-100, 1000); fl.lineTo(820, 760); fl.lineTo(2020, 1000); fl.lineTo(2020, 1200); fl.lineTo(-100, 1200); fl.closePath();
  paperFill(g, lw_); shade(g, lw_, 0.86, 70, { scale: 1 });
  paperFill(g, rw); shade(g, rw, 0.74, 20, { scale: 1 });
  paperFill(g, fl); shade(g, fl, 0.8, 10, { scale: 1 });
  withSeed(9820, () => { sk(g, [[820, -100], [820, 760]], { w: 2.2, a: 0.75 }); sk(g, [[-100, 1000], [820, 760], [2020, 1000]], { w: 2.2, a: 0.75 }); });
  // 上面调光台漏下来的一点暖光
  glow(g, 1500, 120, 520, C.amber, 0.3);
  glow(g, 1000, 620, 420, C.amber, 0.16);
  // 她：抱着膝盖，闭着眼哼
  const sway = Math.sin(t * 2.2) * 2;
  figure(g, 'her', 820, 900, 8.2, P({ torso: 16 + sway, neck: 6, lF: [128, -140], lB: [122, -132], aF: [5, 78], aB: [0, 72], eyes: 'closed', mouth: 'hum', look: 0.25, hair: Math.sin(t) * 0.4 }),
    { ground: false, night: true, dim: 0.3, light: { dx: 1, dy: -1, a: 0.4 } });
  // 沙哑的音符：一串抖抖的线，从她嘴边往右上飘
  const ts = t + lineT0(13) - 0.15;
  const grow = smooth(chT(13, 2) - 0.3, lineT1(13), ts);
  const pts = [];
  const N = Math.floor(10 + grow * 50);
  for (let i = 0; i < N; i++) { const u = i / 60, k = Math.min(1, u * 4); pts.push([930 + u * 930 + Math.sin(u * 9 + t * 2) * 60 * k, 630 - u * 500 + Math.cos(u * 7 + t * 1.5) * 50 * k]); }
  scribbleNotes(g, pts, t, { a: 1, rough: 6, size: 30, w: 3.2, warm: 1 });
});
sfx(lineT0(13) - 0.15, 'hum', { dur: 4.4 });

// ---------------- S19 再大声也都是给你：音符飞过黑黑的观众席，绕着追光里的他转，他听不见 ----------------
shot('s19', lineT0(14) - 0.15, (g, t, d) => {
  cam(g, 960, 520, 1.0);
  theaterSection(g, t, { mode: 'show', audience: true });
  const S = SECT;
  spotBeam(g, S.spotX - 70, S.spotY, 330, S.stageY - 6, 80, t, { on: 1, w0: 22, squash: 0.25 });
  figure(g, 'him', 330, S.stageY - 6, 2.9, P({ look: 0.6, aF: [62, 46], aB: [70, 40], wF: 62, wB: 66, hF: 'flat', hB: 'flat' }), { seed: 402, light: { dx: 1, dy: -1, a: 0.45 } });
  // 灯光室里的她
  figure(g, 'her', S.boothX0 + 230, S.boothY1 - 6, 2.9, P({ look: 0.3, eyes: 'closed', mouth: 'hum', aF: [40, 60], aB: [30, 60] }), { face: -1, night: true, dim: 0.25, seed: 403 });
  followSpot(g, S.spotX, S.spotY, 40, 165, { on: 1 });
  // 音符：从灯光室的窗口出来，划一道弧，到台上绕着他转圈
  const ts = t + lineT0(14) - 0.15;
  const p = smooth(lineT0(14) - 0.1, lineT1(14) + 0.2, ts);
  const pts = [];
  const N = 90;
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1);
    if (u > p) break;
    let x, y;
    if (u < 0.6) { const v = u / 0.6; x = lerp(S.boothX0 + 20, 420, v); y = lerp(S.boothY0 + 120, 380, v) - Math.sin(v * Math.PI) * 160; }
    else { const v = (u - 0.6) / 0.4, a = v * 6.283 * 1.6 + 1.0; x = 330 + Math.cos(a) * (90 - v * 30); y = S.stageY - 150 - v * 60 + Math.sin(a) * 40; }
    pts.push([x + Math.sin(i * 0.9 + t * 3) * 6, y + Math.cos(i * 1.3 + t * 2) * 6]);
  }
  if (pts.length > 2) scribbleNotes(g, pts, t, { a: 1, rough: 4, size: 22, w: 2.8, warm: 1.2 });
});
sfx(lineT0(14) - 0.15, 'notesFly', { dur: 4 });

// ---------------- S20a 请用心听：他停下来，按住胸口 ----------------
shot('s20a', lineT0(15) - 0.15, (g, t, d) => {
  cam(g, 960, 470, 1.55);
  stageSet(g, t, { mode: 'show', moonX: 1350 });
  darkness(g, 0.9, [[960, 600, 300, 480, 0.95]]);
  spotBeam(g, 1200, -260, 960, 905, 170, t, { on: 1 });
  const hold = smooth(0.15, 0.6, t);
  figure(g, 'him', 960, 905, 4.8, P({ look: 0.8, eyes: hold > 0.5 ? 'closed' : 'open', mouth: 'line', aF: [lerp(12, 22, hold), lerp(18, 150, hold)], aB: [-10, 14], hF: 'open', neck: 4 * hold }),
    { seed: 402, light: { dx: 0.4, dy: -1, a: 0.45 } });
  // 音符钻进他的胸口
  for (let i = 0; i < 5; i++) { const u = clamp(t * 0.8 - i * 0.12); if (u <= 0 || u >= 1) continue; const a = i * 1.3 + u * 4; const r = (1 - u) * 160; g.save(); g.globalAlpha = 1 - u; doodle(g, 'note', 985 + Math.cos(a) * r, 620 + Math.sin(a) * r * 0.6, 14); g.restore(); glow(g, 985, 620, 60, C.amberHot, 0.2 * (1 - u)); }
});
sfx(lineT0(15) - 0.15 + 0.3, 'heartbeat', { dur: 1.8 });

// ---------------- S20b 不要说话：灯光室里的她，把食指放在嘴唇上 ----------------
shot('s20b', chT(15, 4) - 0.18, (g, t, d) => {
  cam(g, 960, 540, 1.0 + t * 0.012);
  boothInside(g, t, { mode: 'show', lampOn: 0.8, view: (g, x0, y0, x1, y1) => { const v = rectPath(x0, y0, x1 - x0, y1 - y0); shade(g, v, 0.92, 30); glow(g, (x0 + x1) / 2, y1 - 40, 120, C.amberHot, 0.45); } });
  const sh = smooth(0.1, 0.5, t);
  bustFront(g, 'her', 980, 470, 330, { arms: sh > 0.3 ? 'shh' : 'down', eyes: 'smile', mouth: 'line', blush: 0.6, gaze: [0, 0] });
  glow(g, 980, 760, 520, C.amber, 0.35);
});

// ---------------- S21 谢幕：大幕合上，他和女主演手拉手鞠躬，彩纸，掌声 ----------------
shot('s21', bar(28) + 1.75, (g, t, d) => {
  cam(g, 960, 540, 1.0);
  stageSet(g, t, { mode: 'show', foot: 1, moonX: 1350 });
  // 大幕合上
  const close = smooth(-0.6, 0.4, t);
  curtain(g, -100, lerp(140, 980, close), -60, 990, 7, t, { tone: 0.72, seed: 7230, sway: 2 });
  curtain(g, lerp(1780, 940, close), 2020, -60, 990, 7, t, { tone: 0.72, seed: 7240, sway: 2 });
  valance(g, -100, 2020, 120, t, { n: 10, tone: 0.8 });
  glow(g, 960, 1000, 900, C.amber, 0.3);
  // 幕前鞠躬
  const bow = Math.max(0, Math.sin(clamp((t - 0.7) / 2.2) * Math.PI));
  figure(g, 'him', 1010, 975, 4.4, P({ torso: bow * 48, neck: bow * 10, look: 0.7, aF: [-10, 10], aB: [-30, 20], mouth: 'smile', eyes: 'smile' }), { seed: 402, light: { dx: 0, dy: -1, a: 0.35 } });
  figure(g, 'star', 880, 975, 4.3, P({ torso: bow * 48, neck: bow * 10, look: 0.7, aF: [40, 10], aB: [-20, 10], mouth: 'smile', eyes: 'smile' }), { seed: 401, light: { dx: 0, dy: -1, a: 0.35 } });
  // 彩纸
  for (let i = 0; i < 70; i++) {
    const st = hash(i, 1) * 1.2, age = t - st; if (age < 0) continue;
    const x = hash(i, 2) * W + Math.sin(age * 2 + i) * 30, y = -40 + age * (160 + hash(i, 3) * 120);
    if (y > H) continue;
    g.save(); g.translate(x, y); g.rotate(age * (2 + hash(i, 4) * 4) + i); g.scale(1, Math.cos(age * 6 + i));
    const cp = rectPath(-9, -5, 18, 10); if (hash(i, 5) < 0.5) erase(g, cp, 0.95); else { paperFill(g, cp); shade(g, cp, 0.6, 0); }
    g.restore();
  }
  audienceRow(g, 1060, 9, t, { clap: 1, s: 1.15, rim: 0.6 });
});
sfx(bar(28) + 1.75 - 0.4, 'curtainClose', { dur: 1 });
sfx(bar(28) + 1.75 + 0.3, 'applause', { dur: 3.2 });

// ---------------- S22 日子一天天过去：清晨的台口，一杯又一杯的咖啡，杯套上每天一个小涂鸦 ----------------
const DOODLES = ['moon', 'star', 'cat', 'fish', 'boat', 'umbrella', 'sun', 'flower', 'leaf', 'note', 'snow', 'moon', 'star'];
shot('s22', bar(29) + 1.75, (g, t, d) => {
  const u = t / d;
  // 布景只有 x -100~2020 宽：放大 1.15 倍，镜头中心只在 745~1175 之间摇，摇不出布景
  cam(g, lerp(745, 1175, ease(u)), 560, 1.15);
  stageSet(g, t, { mode: 'dawn', ghost: [1567, 800], footlights: false });
  beam(g, 1900, -200, 1400, 900, 200, 600, C.dawn, 0.25, { layers: 4, endA: 0.3 });
  // 一排杯子，一天出现一个
  for (let i = 0; i < 11; i++) {
    const appear = 0.25 + i * 0.42;
    if (t < appear) continue;
    const x = 285 + i * 135, pp = backOut(clamp((t - appear) / 0.35));
    g.save(); g.translate(x, 930); g.scale(pp, pp); coffeeCup(g, 0, 0, 92, { doodle: DOODLES[i], warm: i === Math.floor((t - 0.25) / 0.42) ? 0.8 : 0.25, t }); g.restore();
    pencilText(g, ['一', '二', '三', '四', '五', '六', '日', '一', '二', '三', '四'][i], x, 975, 26, { a: 0.6 * pp });
  }
}, { type: 'smudge', d: 0.8 });
sfx(bar(29) + 1.75, 'cupsDay', { n: 11, step: 0.42, first: 0.25 });
