// scenes8.js — 最后一遍副歌（C4）和尾声：她从灯光室跑下来，跑过空空的观众席，停在光圈边上；他把她的黑铅笔递给她；
// 她在他那面"看不见的墙"上画了一扇门，他推开门走过来，两个人在追光里抱住；坐在台边，一起哼歌，音符从天窗飞出去变成星星；
// 回到开头的栈桥尽头：两杯咖啡，一片月光，她想开口，他把手指轻轻放在她嘴唇上。拉远：原来是速写本里的一页。合上本子，最后一句问话。

// ---------------- S49 愿意 用一支黑色的铅笔：她跑下来，停在光圈边上；他把她的铅笔递给她 ----------------
shot('s49', lineT0(33) - 0.17, (g, t, d) => {
  cam(g, 960, 500, 1.1);
  stageSet(g, t, { mode: 'show', moonX: 1350, footlights: false });
  darkness(g, 0.88, [[1060, 640, 380, 500, 0.95]]);
  spotBeam(g, 1300, -220, 1060, 905, 200, t, { on: 1 });
  const run = clamp(t / 1.4), give = smooth(2.0, 2.6, t), take = smooth(2.6, 3.0, t);
  const hx = lerp(-150, 760, easeOut(run));
  const herPose = run < 1 ? walkPose(t * 2.4, 1, { look: 0.3, mouth: 'open', hair: -1 }) : P({ torso: 6, look: 0.4, mouth: 'open', eyes: 'open', blush: 0.8, aF: [lerp(10, 60, take), lerp(10, 40, take)], hF: 'hold', bob: Math.sin(t * 6) * 1.5 * (1 - take) });
  figure(g, 'her', hx, 905, 4.7, herPose, { seed: 403, light: { dx: 1, dy: -0.8, a: 0.35 }, hold: take > 0.6 ? { hand: 'F', draw(g2, c, a) { blackPencil(g2, c[0] - 2, c[1] - 2, 12, a - 70, { w: 0.75, seed: 8101 }); } } : null });
  figure(g, 'him', 1100, 905, 4.8, P({ look: 0.5, mouth: 'smile', aF: [lerp(10, 70, give), lerp(20, 30, give)], hF: 'hold', eyes: 'open' }), { face: -1, seed: 402, light: { dx: 0.2, dy: -1, a: 0.45 },
    hold: take < 0.6 ? { hand: 'F', draw(g2, c, a) { blackPencil(g2, c[0] - 2, c[1] - 2, 13, a - 70, { w: 0.8, seed: 8101, glowTip: give * 0.5 }); } } : null });
});
sfx(lineT0(33) - 0.17, 'runSteps', { dur: 1.4 });

// ---------------- S50 画一出沉默舞台剧：她在他那面"看不见的墙"上画了一扇门；他推开门，走到她面前 ----------------
shot('s50', lineT0(34) - 0.14, (g, t, d) => {
  cam(g, 960, 470, 1.3);
  stageSet(g, t, { mode: 'show', moonX: 1350, footlights: false });
  darkness(g, 0.88, [[960, 640, 420, 520, 0.95]]);
  spotBeam(g, 1250, -260, 960, 905, 240, t, { on: 1 });
  const drawP = smooth(0.1, 1.9, t), open = smooth(2.1, 2.8, t), step = smooth(2.7, 3.6, t);
  const wallX = 980;
  mimeWall(g, wallX, 380, 900, 0.6 * (1 - open));
  // 发光的门框
  const door = [[wallX, 900], [wallX, 470], [wallX + 4, 455], [wallX + 18, 450]];
  const frame = spline([[wallX - 6, 905], [wallX - 6, 480], [wallX + 90 * (1 - open) + 6, 470], [wallX + 180 * (1 - open) - 6 + 6, 480], [wallX + 180 * (1 - open), 905]], 8);
  lightLine(g, frame, drawP, { w: 3.4 });
  if (drawP > 0.95) erase(g, circlePath(wallX + 160 * (1 - open), 700, 6), 0.9);
  figure(g, 'her', 800, 905, 4.7, P({ look: 0.5, mouth: 'smile', aF: [lerp(110, 30, open), lerp(20, 40, open)], hF: 'hold', eyes: 'open', blush: 0.6 }), { seed: 403, light: { dx: 1, dy: -0.8, a: 0.35 },
    hold: { hand: 'F', draw(g2, c, a) { blackPencil(g2, c[0] - 2, c[1] - 2, 12, a - 90 + 180, { w: 0.75, seed: 8101, glowTip: drawP < 1 ? 0.6 : 0 }); } } });
  figure(g, 'him', lerp(1180, 1010, step), 905, 4.8, step > 0.01 && step < 1 ? walkPose(t * 1.2, 0, { look: 0.6, mouth: 'smile' }) : P({ look: 0.6, mouth: 'smile', aF: [lerp(70, 20, step), lerp(20, 30, step)], hF: 'flat' }), { face: -1, seed: 402, light: { dx: 0.2, dy: -1, a: 0.45 } });
});
sfx(lineT0(34) - 0.14 + 0.1, 'sparkleDraw', { dur: 1.8 });
sfx(lineT0(34) - 0.14 + 2.1, 'doorCreak', {});

// ---------------- S51a 灯光再亮 也抱住你：两个人在追光里抱住 ----------------
shot('s51a', lineT0(35) - 0.15, (g, t, d) => {
  cam(g, 960, 520 - t * 6, 1.25 + t * 0.03);
  stageSet(g, t, { mode: 'show', moonX: 1350, footlights: false });
  darkness(g, 0.9, [[960, 640, 420, 520, 0.95]]);
  spotBeam(g, 1250, -260, 960, 905, 250, t, { on: 1, dustN: 90 });
  const hug = smooth(0.0, 0.9, t);
  const pose = (who) => P({ look: 0.5, eyes: hug > 0.5 ? 'closed' : 'open', mouth: 'smile', torso: 4 * hug, aF: [lerp(20, 75, hug), lerp(20, 65, hug)], aB: [lerp(-10, 65, hug), lerp(10, 75, hug)], blush: who === 'her' ? 0.8 : 0.3 });
  const gap = lerp(90, 34, hug);
  figure(g, 'her', 960 - gap, 905, 4.7, pose('her'), { seed: 403, light: { dx: 0.4, dy: -1, a: 0.45 } });
  figure(g, 'him', 960 + gap, 905, 4.8, pose('him'), { face: -1, seed: 402, light: { dx: -0.4, dy: -1, a: 0.45 } });
  lightHug(g, 960, 905, 560, smooth(0.6, 2.2, t), t);
  glow(g, 960, 600, 500, C.amberHot, 0.18 * hug);
});
sfx(lineT0(35) - 0.15, 'warmSwell', { dur: 3.0 });

// ---------------- S51b 拉远：空空的剧场，一束光，光里两个人；灯光室里没有人，追光灯自己亮着 ----------------
shot('s51b', bar(66), (g, t, d) => {
  cam(g, lerp(800, 1000, t / d), 520, lerp(1.3, 1.0, ease(t / d)));
  theaterSection(g, t, { mode: 'night' });
  const S = SECT;
  spotBeam(g, S.spotX - 70, S.spotY, 330, S.stageY - 6, 95, t, { on: 1, w0: 22, squash: 0.25, dustN: 80 });
  followSpot(g, S.spotX, S.spotY, 40, 165, { on: 1 });
  figure(g, 'her', 312, S.stageY - 6, 2.85, P({ look: 0.5, eyes: 'closed', mouth: 'smile', aF: [75, 65], aB: [65, 75] }), { seed: 403, light: { dx: 1, dy: -1, a: 0.5 } });
  figure(g, 'him', 350, S.stageY - 6, 2.9, P({ look: 0.5, eyes: 'closed', mouth: 'smile', aF: [75, 65], aB: [65, 75] }), { face: -1, seed: 402, light: { dx: 1, dy: -1, a: 0.5 } });
});

// ---------------- S52 愿意 在角落唱沙哑的歌：坐在台边，腿垂下来；她哼，他也跟着哼，两道音符缠在一起 ----------------
shot('s52', lineT0(36) - 0.15, (g, t, d) => {
  cam(g, 960, 500, 1.15);
  stageSet(g, t, { mode: 'show', moonX: 1350, footlights: false, frontY: 900 });
  darkness(g, 0.86, [[960, 760, 520, 420, 0.95]]);
  spotBeam(g, 1200, -260, 960, 900, 300, t, { on: 1 });
  const sw = Math.sin(t * 2) * 2;
  figure(g, 'her', 860, 903, 5.0, P({ torso: -2 + sw, look: 0.5, eyes: 'closed', mouth: 'hum', lF: [86, -76], lB: [80, -70], aF: [20, 30], aB: [-30, 20], neck: 6 }), { ground: false, seed: 403, light: { dx: 0.4, dy: -1, a: 0.4 } });
  figure(g, 'him', 1060, 903, 5.1, P({ torso: -2 - sw, look: 0.5, eyes: smooth(1.2, 1.4, t) > 0.5 ? 'closed' : 'open', mouth: t > 1.3 ? 'hum' : 'smile', lF: [86, -80], lB: [80, -72], aF: [20, 30], aB: [-30, 20], neck: 4 }), { face: -1, ground: false, seed: 402, light: { dx: -0.4, dy: -1, a: 0.4 } });
  // 两道音符：她的抖一点，他的圆一点，绕在一起往上
  const g1 = smooth(0.3, 4.4, t), g2 = smooth(1.3, 4.4, t);
  const P1 = [], P2 = [];
  for (let i = 0; i < 70; i++) { const u = i / 69; if (u <= g1) P1.push([960 + Math.sin(u * 12 + t * 2) * (50 + u * 120) - 60 * (1 - u), 640 - u * 520]); if (u <= g2) P2.push([960 + Math.sin(u * 12 + t * 2 + Math.PI) * (50 + u * 120) + 60 * (1 - u), 640 - u * 520]); }
  if (P1.length > 2) scribbleNotes(g, P1, t, { a: 1, rough: 5, size: 20, w: 2.6, warm: 1.2 });
  if (P2.length > 2) scribbleNotes(g, P2, t + 3, { a: 1, rough: 1.5, size: 20, w: 2.6, warm: 1.2, seed: 8801 });
});

// ---------------- S53 再大声也都是给你：缠在一起的音符从天窗飞出去，飞到海上，变成星星 ----------------
shot('s53', lineT0(37) - 0.15, (g, t, d) => {
  const u = t / d;
  cam(g, 960, lerp(560, 300, ease(u)), 1.0);
  const HZ = 820;
  nightSky(g, -200, -400, 2200, HZ + 2, t + 244, { moon: [1500, 120, 60], stars: 140, starA: 0.6 + u * 0.4 });
  moon(g, 1500, 120, 60, t);
  sea(g, -200, 2200, HZ, 1400, t + 244, { moonX: 1500, waves: 70 });
  // 剧场的屋顶和天窗（下面）
  g.save(); g.translate(960, 1010); g.scale(0.9, 0.9); g.translate(-675, -650); theaterFront(g, t, { night: true }); g.restore();
  // 音符一路飞上去，一个个停在天上变成星星
  for (let i = 0; i < 26; i++) {
    const st = i * 0.11, p = clamp((t - st) / 2.4);
    if (p <= 0) continue;
    const sx = 960 + (hash(i, 71) - 0.5) * 80, sy = 880;
    const ex = 200 + hash(i, 72) * 1520, ey = -300 + hash(i, 73) * 760;
    const x = lerp(sx, ex, ease(p)) + Math.sin(p * 8 + i) * 30 * (1 - p), y = lerp(sy, ey, ease(p));
    if (p < 1) { g.save(); g.globalAlpha = 1 - p * 0.5; doodle(g, 'note', x, y, 16); g.restore(); glow(g, x, y, 40, C.amberHot, 0.4 * (1 - p)); }
    else { const tw = 0.6 + 0.4 * Math.sin(t * 3 + i); erase(g, circlePath(x, y, 3.5), tw); eraseStroke(g, [[x - 9, y], [x + 9, y]], 1, tw * 0.7); eraseStroke(g, [[x, y - 9], [x, y + 9]], 1, tw * 0.7); glow(g, x, y, 30, C.moonHot, 0.4 * tw); }
  }
});
sfx(lineT0(37) - 0.15, 'notesFly', { dur: 3 });
sfx(lineT0(37) + 2.4, 'shimmer', { dur: 1.8 });

// ---------------- S54 爱是用心吗 不要说话：回到栈桥尽头。两杯咖啡，一片月光；她想开口，他把手指轻轻放在她嘴唇上 ----------------
shot('s54', lineT0(38) - 0.16, (g, t, d) => {
  cam(g, 1180, 590, 1.55 + t * 0.012);
  const HZ = 500;
  nightSky(g, -100, -100, 2100, HZ + 2, t + 248, { moon: [1500, 160, 56], stars: 80 });
  moon(g, 1500, 160, 56, t);
  sea(g, -100, 2100, HZ, 1200, t + 248, { moonX: 1500, waves: 80 });
  pierSide(g, -100, 1420, 860, t, { night: true, moonlit: true });
  coffeeCup(g, 1180, 858, 26, { doodle: 'moon', warm: 0.9, t, night: true });
  coffeeCup(g, 1222, 858, 26, { doodle: 'spot', warm: 0.9, t, night: true });
  const turn = smooth(1.2, 1.6, t), shh = smooth(2.0, 2.5, t), smile = smooth(3.0, 3.4, t);
  figure(g, 'her', 1120, 856, 3.6, P({ torso: -2, look: lerp(0.15, 0.5, turn), neck: -4, lF: [86, -80], lB: [80, -72], aF: [30, 30], aB: [-20, 20], mouth: turn > 0.5 && shh < 0.5 ? 'open' : smile > 0.5 ? 'smile' : 'line', eyes: smile > 0.5 ? 'smile' : 'open', blush: 0.6 * smile, hair: Math.sin(t) * 0.5 }),
    { ground: false, night: true, dim: 0.25, seed: 403, light: { dx: 1, dy: -0.4, a: 0.3, col: C.moonHot } });
  figure(g, 'him', 1290, 856, 3.7, P({ torso: -2, look: 0.5, lF: [86, -80], lB: [80, -72], aF: shh > 0.05 ? [lerp(30, 60, shh), lerp(30, 120, shh)] : [30, 30], hF: shh > 0.5 ? 'point' : 'open', aB: [-20, 20], mouth: 'smile', eyes: 'open' }),
    { face: -1, ground: false, night: true, dim: 0.25, seed: 402, light: { dx: -1, dy: -0.4, a: 0.3, col: C.moonHot } });
});

// ---------------- S55 尾声：拉远——原来是速写本里的一页，本子放在调光台上，旁边两杯咖啡 ----------------
shot('s55', bar(70) + 1.7, (g, t, d) => {
  const z = lerp(1.0, 0.42, ease(clamp(t / 3.6)));
  camReset(g);
  // 桌面
  const desk = rectPath(-100, -100, 2120, 1300); paperFill(g, desk); shade(g, desk, 0.6, 6, { scale: 1 });
  withSeed(11500, () => { for (let i = 0; i < 6; i++) sk(g, [[-100, 120 + i * 180], [2020, 110 + i * 185]], { w: 1, a: 0.3, passes: 1 }); });
  deskLamp(g, 1780, 420, 0.9, t, { on: 0.9 });
  coffeeCup(g, 300, 860, 150, { doodle: 'moon', warm: 0.9, t });
  coffeeCup(g, 480, 900, 150, { doodle: 'spot', warm: 0.9, t });
  // 本子里的这一页：就是刚才的栈桥
  if (!REW_A) { REW_A = mk(W, H); REW_B = mk(W, H); }
  renderShotInto(REW_A, 's54', lineT0(38) - 0.16 + 4.6);
  g.save(); g.translate(1060, 520); g.rotate(R(-3 * (1 - z) / 0.58)); g.scale(z, z);
  const cov = rectPath(-W / 2 - 30, -H / 2 - 30, W + 60, H + 60); paperFill(g, cov); shade(g, cov, 0.9, 30);
  g.drawImage(REW_A, -W / 2, -H / 2);
  withSeed(11501, () => { for (let i = 0; i < 14; i++) { const y = -H / 2 + (i + 0.5) * H / 14; skEllipse(g, -W / 2, y, 10, 7, { w: 2, a: 0.8, passes: 1 }); } });
  g.restore();
  glow(g, 1060, 520, 900, C.amber, 0.12);
});

// ---------------- S56 两只手握着同一支铅笔，在月光的路上画了一颗小小的心 ----------------
shot('s56', bar(72), (g, t, d) => {
  cam(g, 1180, 690, 1.9);
  renderShotInto(REW_A || (REW_A = mk(W, H)), 's54', lineT0(38) - 0.16 + 4.6);
  camReset(g);
  g.save(); g.translate(W / 2, H / 2); g.scale(1.9, 1.9); g.translate(-1180, -690); g.drawImage(REW_A, 0, 0); g.restore();
  // 一颗小心，一笔画出来
  const p = smooth(0.6, 2.4, t);
  const hx = 960, hy = 760;
  const heart = []; for (let i = 0; i <= 60; i++) { const a = i / 60 * 6.283; heart.push([hx + 16 * Math.pow(Math.sin(a), 3) * 4.2, hy - (13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)) * 4.2]); }
  const n = Math.max(2, Math.floor(heart.length * p));
  withSeed(11600, () => sk(g, heart.slice(0, n), { w: 4, a: 0.92 }));
  if (p > 0.95) glow(g, hx, hy - 10, 160, C.amberHot, 0.35 * smooth(2.4, 2.8, t));
  // 两只手（她的毛衣袖子、他的条纹袖子）一起握着笔
  const tip = heart[n - 1];
  if (t < 3.0) {
    handPencilClose(g, tip[0], tip[1], 820, -50);
    const a = R(-50), d_ = [Math.cos(a), Math.sin(a)], n_ = [-d_[1], d_[0]];
    const Q = (u, v) => [tip[0] + d_[0] * u * 820 + n_[0] * v * 820, tip[1] + d_[1] * u * 820 + n_[1] * v * 820];
    // 他的手从上面轻轻覆在她的手上
    const hp = [Q(0.3, -0.12), Q(0.5, -0.16), Q(0.7, -0.06), Q(0.68, 0.12), Q(0.5, 0.1), Q(0.32, 0.0)];
    part(g, hp, { w: 2.4, per: 5, tone: 0.06 });
    for (let i = 0; i < 3; i++) sk(g, [Q(0.34 + i * 0.06, -0.08), Q(0.5 + i * 0.05, -0.02)], { w: 1.2, a: 0.5 });
    const sl = new Path2D(); const s1 = [Q(0.62, -0.1), Q(0.7, 0.12), Q(1.4, -0.02), Q(1.3, -0.4)]; const sp = pathOf(spline(s1, 5, true)); paperFill(g, sp); stripes(g, sp, Q(0.65, 0), Q(1.35, -0.2), 400, 8, 0.72); sk(g, spline(s1, 5, true), { w: 2.4, a: 0.9 });
  }
});
sfx(bar(72) + 0.6, 'pencil', { dur: 1.8, gain: 0.7 });

// ---------------- S57 本子往回翻：一页页都是这个故事；最后合上，封面上写着"不要说话" ----------------
const RECAP = [['s54', 252.0], ['s51a', 236.0], ['s48', 223.5], ['s39', 189.6], ['s35', 174.6], ['s30', 150.6], ['s27a', 134.6], ['s17b', 88.0], ['s14a', 69.8], ['s01', 6.0]];
shot('s57', bar(73) + 1.5, (g, t, d) => {
  if (!REW_A) { REW_A = mk(W, H); REW_B = mk(W, H); }
  camReset(g);
  const flipEnd = d - 2.4;
  const desk = rectPath(-100, -100, 2120, 1300); paperFill(g, desk); shade(g, desk, 0.62, 6, { scale: 1 });
  deskLamp(g, 1780, 420, 0.9, t, { on: 0.9 });
  const z = 0.62;
  g.save(); g.translate(1000, 520); g.scale(z, z);
  const cov = rectPath(-W / 2 - 30, -H / 2 - 30, W + 60, H + 60); paperFill(g, cov); shade(g, cov, 0.9, 30);
  if (t < flipEnd) {
    const u = clamp(t / flipEnd), pos = (RECAP.length - 1) * u;
    const k = Math.min(RECAP.length - 2, Math.floor(pos)), f = pos - k;
    renderShotInto(REW_A, RECAP[k][0], RECAP[k][1]);
    renderShotInto(REW_B, RECAP[k + 1][0], RECAP[k + 1][1]);
    const T_ = BUF_T.getContext('2d'); T_.setTransform(1, 0, 0, 1, 0, 0); T_.clearRect(0, 0, W, H);
    pageCurl(T_, REW_B, REW_A, 1 - ease(clamp(f * 1.6)), true);
    g.drawImage(BUF_T, -W / 2, -H / 2);
  } else {
    // 合上：封面
    const c = smooth(flipEnd, flipEnd + 0.6, t);
    const front = rectPath(-W / 2, -H / 2, W, H); paperFill(g, front);
    if (c < 1) { renderShotInto(REW_A, 's01', 6.0); g.globalAlpha = 1 - c; g.drawImage(REW_A, -W / 2, -H / 2); g.globalAlpha = 1; }
    g.globalAlpha = c; shade(g, front, 0.88, 30); g.globalAlpha = 1;
    if (c > 0.3) {
      const lab = rectPath(-420, -150, 840, 300); g.globalAlpha = clamp((c - 0.3) / 0.7); paperFill(g, lab); skRect(g, -420, -150, 840, 300, { w: 3, a: 0.9 });
      pencilText(g, '不要说话', 0, -10, 150); pencilText(g, '速写本', 0, 100, 40, { a: 0.6 }); g.globalAlpha = 1;
    }
  }
  withSeed(11501, () => { for (let i = 0; i < 14; i++) { const y = -H / 2 + (i + 0.5) * H / 14; skEllipse(g, -W / 2, y, 10, 7, { w: 2, a: 0.8, passes: 1 }); } });
  g.restore();
  coffeeCup(g, 260, 900, 150, { doodle: 'moon', warm: 0.9, t });
  coffeeCup(g, 1720, 940, 150, { doodle: 'spot', warm: 0.9, t });
});
sfx(bar(73) + 1.5, 'pageFlipsBack', { dur: 6.4, n: 9, soft: 1 });

// ---------------- S58 最后的问话（画外音一起念） ----------------
shot('s58', VO.e1 - 1.1, (g, t, d) => {
  camReset(g);
  const ts = t + VO.e1 - 1.1;
  withSeed(11700, () => { skRect(g, 220, 230, 1480, 560, { w: 2.4, a: 0.55, over: 12 }); });
  // 跟着配音一个字一个字写出来（配音的逐字时间在 voice_cv3/n_e1.json，这里按 0.12 秒一个字估）
  const p = clamp((ts - VO.e1 + 0.1) / 2.6);
  writeWords(g, '你没说出口的那句话，', 960, 440, 96, clamp(p * 1.9), { sp: 6 });
  writeWords(g, '是什么？', 960, 600, 96, clamp(p * 1.9 - 1.0), { sp: 6 });
  coffeeCup(g, 1640, 800, 90, { doodle: 'spot', warm: 0.7, t });
});

// ---------------- 片尾卡 ----------------
shot('end', SONG_END - ENDCARD, (g, t, d) => {
  camReset(g);
  coffeeCup(g, 860, 360, 120, { doodle: 'moon', warm: 0.8, t });
  coffeeCup(g, 1060, 360, 120, { doodle: 'spot', warm: 0.8, t });
  pencilText(g, '不要说话', 960, 520, 88);
  pencilText(g, '演唱：陈奕迅　作词、作曲：小柯　编曲：Mac Chew', 960, 618, 30, { a: 0.75 });
  pencilText(g, '画面、动画、音效：Claude 用代码生成 · 配音：CosyVoice 3 合成', 960, 672, 28, { a: 0.7 });
  pencilText(g, '甜菜 出品', 960, 790, 56);
}, { type: 'smudge', d: 0.6 });
