// scenes7.js — 第三遍副歌（C3）：最后一场演完，观众散了。他拿着她的黑铅笔走上黑黑的舞台，在空中画出她画过的那片海和栈桥，
// 朝灯光室比了个"开灯"；她打开追光，光落在他身上，这一次他张开手臂抱住了光；他用默剧把她做过的事演了一遍——
// 端着咖啡踮着脚、蹲在角落哼歌、把空中的音符一个个接住放进胸口；最后他捂住嘴摇摇头（"我不会说话"），举起那张杯套："我喜欢你"。翻过来："我也是"。

// 空中的发光铅笔线
function lightLine(g, pts, p, o = {}) {
  if (p <= 0) return;
  const n = Math.max(2, Math.floor(pts.length * clamp(p)));
  const q = pts.slice(0, n);
  g.save(); g.globalCompositeOperation = 'screen'; g.strokeStyle = rgba(C.amberHot, 0.18); g.lineWidth = 16; g.lineCap = 'round'; g.lineJoin = 'round'; g.filter = 'blur(5px)';
  g.beginPath(); g.moveTo(q[0][0], q[0][1]); for (const x of q) g.lineTo(x[0], x[1]); g.stroke(); g.restore();
  eraseStroke(g, q, o.w ?? 3.2, 0.95);
  if (p < 1) glow(g, q[n - 1][0], q[n - 1][1], 50, C.amberHot, 0.6);
}
// 他在空中画的那幅画：海平线、月亮、栈桥、坐在尽头的小人
function airDrawing(g, cx, cy, s, p, t) {
  const L = (pts) => spline(pts.map(([x, y]) => [cx + x * s, cy + y * s]), 8);
  const parts = [
    L([[-1.6, 0.2], [-0.5, 0.18], [0.5, 0.22], [1.6, 0.2]]),                                         // 海平线
    (() => { const r = []; for (let i = 0; i <= 40; i++) { const a = i / 40 * 6.283; r.push([cx + (0.95 + Math.cos(a) * 0.22) * s, cy + (-0.55 + Math.sin(a) * 0.22) * s]); } return r; })(),  // 月亮
    L([[-1.5, 0.48], [-0.2, 0.48], [0.2, 0.48]]),                                                    // 栈桥
    L([[0.12, 0.48], [0.12, 0.34], [0.08, 0.22], [0.14, 0.12], [0.2, 0.22], [0.16, 0.34], [0.2, 0.48]]),   // 坐着的小人
    L([[0.95, 0.24], [0.95, 0.4], [0.9, 0.58], [1.0, 0.76], [0.92, 0.95]]),                          // 月光的路
  ];
  parts.forEach((pts, i) => lightLine(g, pts, clamp(p * parts.length - i), { w: 3 }));
}

// ---------------- S42 愿意 用一支黑色的铅笔：散场后黑黑的剧场，他走上台，举起她的黑铅笔给灯光室看 ----------------
shot('s42', lineT0(27) - 0.13, (g, t, d) => {
  cam(g, 1000, 520, 1.0);
  theaterSection(g, t, { mode: 'night' });
  const S = SECT;
  // 灯光室里，她在收拾东西（台灯亮着）
  figure(g, 'her', S.boothX0 + 230, S.boothY1 - 6, 2.9, P({ torso: 20, neck: 10, look: 0.2, eyes: lookAt(t), aF: [60, 50], aB: [50, 60], hF: 'hold', mouth: 'line' }), { face: -1, night: true, dim: 0.2, seed: 403 });
  ghostLight(g, 160, S.stageY - 6, 0.6, t);
  const walk = clamp(t / 1.6), raise = smooth(1.8, 2.4, t);
  const x = lerp(-60, 330, easeOut(walk));
  const pose = walk < 1 ? walkPose(t * 1.3, 0, { look: 0.4 }) : P({ look: 0.7, neck: -12 * raise, aF: [lerp(10, 150, raise), lerp(20, 10, raise)], hF: 'hold', mouth: 'line' });
  figure(g, 'him', x, S.stageY - 6, 2.9, pose, { night: true, dim: 0.2, seed: 402, light: { dx: -1, dy: -0.6, a: 0.3 },
    hold: { hand: 'F', draw(g2, c, a) { blackPencil(g2, c[0] - 2, c[1] - 3, 13, a - 90 + 180, { w: 0.8, seed: 8101, glowTip: raise * 0.5 }); } } });
  if (raise > 0.5) glow(g, x + 20, S.stageY - 250, 60, C.amberHot, 0.5 * raise);
});
function lookAt(t) { return t > 2.6 ? 'wide' : 'down'; }
sfx(lineT0(27) - 0.13, 'steps', { dur: 1.6, wood: 1 });

// ---------------- S43 画一出沉默舞台剧：他用铅笔在空中画，发光的线条画出她画过的那片海 ----------------
shot('s43', lineT0(28) - 0.12, (g, t, d) => {
  cam(g, 960, 520, 1.0);
  stageSet(g, t, { mode: 'night', ghost: [1600, 900], footlights: false });
  darkness(g, 0.86, [[1600, 650, 300, 360, 0.6]]);
  ghostLight(g, 1600, 900, 1.0, t);
  const p = smooth(0.15, 3.4, t);
  airDrawing(g, 900, 430, 360, p, t);
  // 他：举着笔在空中画（手跟着画到的位置走）
  const sw = Math.sin(t * 5) * 20;
  figure(g, 'him', 520, 905, 4.8, P({ look: 0.6, aF: [100 + sw, 10], aB: [-10, 20], hF: 'hold', mouth: 'line', neck: -6, torso: -4 }), { night: true, dim: 0.22, seed: 402, light: { dx: 1, dy: -0.5, a: 0.35 },
    hold: { hand: 'F', draw(g2, c, a) { blackPencil(g2, c[0] - 2, c[1] - 3, 13, a - 90 + 180, { w: 0.8, seed: 8101, glowTip: 0.6 }); } } });
});
sfx(lineT0(28) - 0.12 + 0.15, 'sparkleDraw', { dur: 3.2 });

// ---------------- S44 灯光再亮 也抱住你：她打开追光，光落在他身上，他张开手臂，把光抱住 ----------------
shot('s44', lineT0(29) - 0.14, (g, t, d) => {
  cam(g, 1000, 520, 1.0);
  theaterSection(g, t, { mode: 'night' });
  const S = SECT;
  const on = smooth(0.0, 0.35, t), hug = smooth(0.9, 2.2, t);
  spotBeam(g, S.spotX - 70, S.spotY, 330, S.stageY - 6, 90, t, { on, w0: 22, squash: 0.25 });
  airDrawing(g, 330, S.stageY - 250, 120, 1, t);
  figure(g, 'her', S.boothX0 + 230, S.boothY1 - 6, 2.9, P({ look: 0.3, eyes: 'wide', aF: [80, 30], aB: [40, 60], mouth: 'o', hF: 'hold' }), { face: -1, night: true, dim: 0.15, seed: 403, light: { dx: -1, a: 0.4 } });
  followSpot(g, S.spotX, S.spotY, 40, 165, { on });
  figure(g, 'him', 330, S.stageY - 6, 2.9, P({ look: 0.9, neck: -10, aF: [lerp(10, 110, hug), lerp(20, 30, hug)], aB: [lerp(-10, 100, hug), lerp(14, 40, hug)], mouth: 'smile', eyes: hug > 0.6 ? 'closed' : 'open' }),
    { seed: 402, light: { dx: 1, dy: -1, a: 0.5 } });
  lightHug(g, 330, S.stageY - 6, 300, hug, t);
});
sfx(lineT0(29) - 0.14, 'spotOn', {});
sfx(lineT0(29) - 0.14 + 0.9, 'warmSwell', { dur: 2.2 });

// ---------------- S45 愿意 在角落唱沙哑的歌：他演她：端着咖啡踮脚、放下；再蹲在角落抱着膝盖哼——她以前的音符又出现了 ----------------
shot('s45', lineT0(30) - 0.14, (g, t, d) => {
  cam(g, 960, 500, 1.05);
  stageSet(g, t, { mode: 'show', moonX: 1350, footlights: false });
  darkness(g, 0.88, [[960, 640, 420, 500, 0.95]]);
  spotBeam(g, 1250, -200, 960, 905, 220, t, { on: 1 });
  let pose;
  const a1 = smooth(0, 1.6, t), sit = smooth(2.0, 2.5, t);
  if (sit < 0.01) {
    // 端着一杯看不见的咖啡，踮着脚走
    pose = walkPose(t * 1.6, 0, { torso: 6, look: 0.6, aF: [55, 70], aB: [50, 75], hF: 'hold', hB: 'hold', mouth: 'line', eyes: 'down', bob: 3 });
  } else {
    pose = P({ torso: 16, neck: 6, lF: [128, -140], lB: [122, -132], aF: [5, 78], aB: [0, 72], eyes: 'closed', mouth: 'hum', look: 0.6 });
  }
  const x = sit < 0.01 ? lerp(700, 1120, a1) : 1040;
  figure(g, 'him', x, sit < 0.01 ? 905 : 860, 4.8, pose, { seed: 402, ground: sit < 0.01, light: { dx: 0.3, dy: -1, a: 0.45 } });
  // 看不见的咖啡：一点暖光
  if (sit < 0.01) glow(g, x + 80, 640, 50, C.amber, 0.6);
  if (sit > 0) {
    const pts = []; const N = Math.floor(10 + smooth(2.3, 4.4, t) * 50);
    for (let i = 0; i < N; i++) { const u = i / 60; pts.push([1100 + Math.cos(u * 9 + t) * (80 + u * 260), 560 - u * 360 + Math.sin(u * 9 + t) * 60]); }
    scribbleNotes(g, pts, t, { a: sit, rough: 5, size: 22, w: 2.8, warm: 1.2 });
  }
});

// ---------------- S46 再大声也都是给你：他把空中的音符一个个接住，放进胸口的口袋，朝灯光室点点头 ----------------
shot('s46', lineT0(31) - 0.13, (g, t, d) => {
  cam(g, 960, 470, 1.35);
  stageSet(g, t, { mode: 'show', moonX: 1350, footlights: false });
  darkness(g, 0.88, [[960, 620, 380, 520, 0.95]]);
  spotBeam(g, 1250, -260, 960, 905, 200, t, { on: 1 });
  const catchPh = (t * 1.8) % 1, k = Math.floor(t * 1.8);
  const reach = Math.sin(catchPh * Math.PI);
  const nod = smooth(3.0, 3.4, t);
  figure(g, 'him', 960, 905, 4.8, P({ look: lerp(0.6, 0.9, nod), neck: -8 * nod, aF: [lerp(150, 25, 1 - reach) * (1 - nod) + nod * 20, lerp(10, 140, 1 - reach) * (1 - nod) + nod * 150], aB: [-10, 14], hF: 'fist', mouth: 'smile', eyes: nod > 0.5 ? 'smile' : 'open' }),
    { seed: 402, light: { dx: 0.3, dy: -1, a: 0.45 } });
  // 一个个飘下来的音符
  for (let i = 0; i < 6; i++) {
    const st = i / 1.8, age = t - st; if (age < -1 || age > 0.55) continue;
    const u = clamp((age + 1) / 1.55);
    const x = lerp(700 + i * 90, 1010, u), y = lerp(150, 560, u);
    g.save(); g.globalAlpha = 1 - smooth(0.4, 0.55, age); doodle(g, 'note', x, y, 20); g.restore(); glow(g, x, y, 40, C.amberHot, 0.4);
  }
  glow(g, 985, 640, 70, C.amberHot, 0.3 + 0.2 * Math.sin(t * 5));
});

// ---------------- S47 请原谅我 不会说话：他捂住嘴摇摇头，然后举起那张杯套——"我喜欢你"；灯光室里，她捂住了嘴 ----------------
shot('s47', lineT0(32) - 0.15, (g, t, d) => {
  if (t < 1.75) {
    cam(g, 960, 470, 1.3);
    stageSet(g, t, { mode: 'show', moonX: 1350, footlights: false });
    darkness(g, 0.88, [[960, 620, 380, 520, 0.95]]);
    spotBeam(g, 1250, -260, 960, 905, 200, t, { on: 1 });
    const hold = smooth(0.85, 1.25, t), shake = t < 0.85 ? Math.sin(t * 16) * 8 : 0;
    figure(g, 'him', 960, 905, 4.8, P({ look: 0.9, neck: shake * 0.5 - 6, aF: hold > 0.1 ? [lerp(20, 150, hold), lerp(140, 20, hold)] : [20, 150], hF: hold > 0.1 ? 'hold' : 'flat', mouth: 'line', eyes: hold > 0.5 ? 'open' : 'closed', brows: 1 }),
      { seed: 402, light: { dx: 0.3, dy: -1, a: 0.45 } });
    if (hold > 0.2) {
      const hx = 960 + 70, hy = 905 - 4.8 * 120;
      g.save(); g.translate(hx, hy); g.scale(hold, hold); sleeveCard(g, 0, 0, 120, 'spot', -4, { seed: 11299 }); g.restore();
      g.save(); g.translate(hx, hy); g.scale(hold, hold); g.rotate(R(-4));
      const pane = new Path2D(); pane.ellipse(0, 0, 54, 34, 0, 0, 6.283); paperFill(g, pane); shade(g, pane, 0.6, 28); writeWords(g, '我喜欢你', 0, 0, 24, 1, { sp: 2, a: 0 });
      g.save(); g.clip(pane); g.fillStyle = paperStyle(g); g.font = `24px ${FONT_HAND}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('我喜欢你', 0, 0); g.restore();
      g.restore();
    }
  } else {
    // 她：在灯光室的窗后，捂住了嘴
    cam(g, 960, 540, 1.0 + (t - 1.75) * 0.02);
    boothInside(g, t, { mode: 'show', lampOn: 0.8, view: (g2, x0, y0, x1, y1) => { const v = rectPath(x0, y0, x1 - x0, y1 - y0); shade(g2, v, 0.9, 30); glow(g2, (x0 + x1) / 2, y1 - 40, 150, C.amberHot, 0.5); } });
    bustFront(g, 'her', 980, 470, 330, { arms: 'mouth', eyes: 'wide', blush: 1, tear: smooth(2.2, 3.2, t), gaze: [-0.2, 0.2] });
    glow(g, 980, 760, 520, C.amber, 0.35);
  }
});
sfx(lineT0(32) - 0.15 + 0.85, 'paperRustle', {});

// ---------------- S48 他把杯套翻过来：背面是他写的"我也是"。她转身冲出了灯光室 ----------------
shot('s48', chT(32, 7) + 0.5, (g, t, d) => {
  if (t < 1.5) {
    cam(g, 960, 520, 1.0 + t * 0.03);
    const bg = rectPath(-100, -100, 2120, 1300); paperFill(g, bg); shade(g, bg, 0.3, 90, { scale: 1.6 });
    const pane = new Path2D(); pane.ellipse(960, 520, 640, 300, 0, 0, 6.283); erase(g, pane, 0.92);
    withSeed(10011, () => skEllipse(g, 960, 520, 640, 300, { w: 2, a: 0.5 }));
    // 翻过来的一下：横向压扁再展开
    const flip = smooth(0.0, 0.35, t);
    g.save(); g.translate(960, 520); g.scale(Math.max(0.02, Math.abs(Math.cos(flip * Math.PI)) * (flip < 0.5 ? 1 : 1)), 1); g.translate(-960, -520);
    if (flip >= 0.5) writeWords(g, '我也是', 960, 510, 210, 1, { sp: 20, font: FONT_HIS });
    else { const p2 = new Path2D(); p2.ellipse(960, 520, 600, 270, 0, 0, 6.283); shade(g, p2, 0.62, 28, { scale: 1.4 }); g.save(); g.clip(p2); g.fillStyle = paperStyle(g); g.font = `190px ${FONT_HAND}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('我喜欢你', 900, 500); g.restore(); }
    g.restore();
    glow(g, 960, 520, 500, C.amberHot, 0.2 * flip);
  } else {
    cam(g, 1000, 520, 1.0);
    theaterSection(g, t, { mode: 'night' });
    const S = SECT;
    spotBeam(g, S.spotX - 70, S.spotY, 330, S.stageY - 6, 90, t, { on: 1, w0: 22, squash: 0.25 });
    followSpot(g, S.spotX, S.spotY, 40, 165, { on: 1 });
    figure(g, 'him', 330, S.stageY - 6, 2.9, P({ look: 0.9, neck: -10, aF: [150, 10], hF: 'hold', mouth: 'smile' }), { seed: 402, light: { dx: 1, dy: -1, a: 0.5 } });
    // 灯光室的门开了，她冲出来
    const run = smooth(1.55, 2.4, t);
    const doorOpen = smooth(1.5, 1.7, t);
    const dr = rectPath(S.boothX1 - 60, S.boothY0 + 60, 50 * (1 - doorOpen * 0.8), S.boothY1 - S.boothY0 - 60); paperFill(g, dr); shade(g, dr, 0.6, 80);
    figure(g, 'her', lerp(S.boothX1 - 40, S.boothX1 + 120, run), S.boothY1 - 6, 2.9, walkPose(t * 2.4, 1, { look: 0.3, mouth: 'o' }), { night: true, dim: 0.15, seed: 403 });
  }
});
sfx(chT(32, 7) + 0.5, 'flip', {});
sfx(chT(32, 7) + 0.5 + 1.55, 'door', {});
