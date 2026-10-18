// scenes4.js — 第二段主歌 B（B2）：秋天下雨，她把咖啡护在怀里跑到剧场，看见他和女主演撑着一把伞走了；
// 冬天的演出，她从追光的圈里看他们跳舞，掉了一滴眼泪；速写本最后一页；一个季节又一个季节；
// 春天的清晨，她在杯套上写了"我喜欢你"，又用橡皮擦掉了。

// 雨：斜着的短线，地上溅起的小弧
function rain(g, t, o = {}) {
  const n = o.n ?? 260, ang = R(o.ang ?? 74), len = o.len ?? 46, sp = o.speed ?? 1500;
  const dx = Math.cos(ang), dy = Math.sin(ang);
  g.save(); g.globalAlpha = o.a ?? 0.55;
  withSeed(9900, () => {
    for (let i = 0; i < n; i++) {
      const ph = (hash(i, 1) + t * sp / (H + 200) * (0.8 + 0.4 * hash(i, 2))) % 1;
      const x = hash(i, 3) * (W + 400) - 200 - ph * 260, y = -100 + ph * (H + 200);
      const l = len * (0.6 + 0.6 * hash(i, 4));
      sk(g, [[x, y], [x + dx * l, y + dy * l]], { w: 1.1, a: 0.7, passes: 1, taper: 0.8, seed: 9900 + i });
    }
  });
  g.restore();
  if (o.ground != null) {
    g.save(); g.globalAlpha = 0.6;
    for (let i = 0; i < 40; i++) {
      const ph = (hash(i, 5) + t * 1.7 * (0.8 + hash(i, 6) * 0.4)) % 1;
      const x = hash(i, 7) * W, y = o.ground + hash(i, 8) * (o.groundH ?? 120);
      const r = 4 + ph * 22;
      g.globalAlpha = 0.55 * (1 - ph);
      skEllipse(g, x, y, r, r * 0.25, { w: 1, a: 0.7, passes: 1, seed: 9950 + i });
    }
    g.restore();
  }
}
function umbrella(g, x, y, r, tilt, o = {}) {
  g.save(); g.translate(x, y); g.rotate(R(tilt));
  withSeed(o.seed ?? 9960, () => {
    const can = [[-r, 0], [-r * 0.85, -r * 0.42], [-r * 0.45, -r * 0.7], [0, -r * 0.78], [r * 0.45, -r * 0.7], [r * 0.85, -r * 0.42], [r, 0], [r * 0.66, -r * 0.08], [r * 0.33, 0], [0, -r * 0.08], [-r * 0.33, 0], [-r * 0.66, -r * 0.08]];
    part(g, can, { tone: o.tone ?? 0.6, ang: 70, w: 2.2, per: 4 });
    for (const xx of [-0.66, -0.33, 0, 0.33, 0.66]) sk(g, [[0, -r * 0.78], [xx * r, xx === 0 ? -r * 0.08 : 0]], { w: 1.2, a: 0.6, passes: 1 });
    sk(g, [[0, -r * 0.78], [0, -r * 0.92]], { w: 2, a: 0.85 });
    sk(g, [[0, -r * 0.05], [0, r * 0.95], [r * 0.1, r * 1.05], [r * 0.18, r * 0.98]], { w: 2.4, a: 0.9 });
  });
  g.restore();
}
// 落叶
function leaves(g, t, n, o = {}) {
  for (let i = 0; i < n; i++) {
    const ph = (hash(i, 11) + t * 0.12 * (0.6 + hash(i, 12))) % 1;
    const x = hash(i, 13) * W + Math.sin(t * 1.5 + i) * 60 - ph * 200, y = -60 + ph * (H + 120);
    g.save(); g.translate(x, y); g.rotate(t * 2 + i); g.scale(1, 0.6 + 0.4 * Math.sin(t * 3 + i));
    doodle(g, 'leaf', 0, 0, 16 + hash(i, 14) * 10);
    g.restore();
  }
}

// ---------------- S23a 爱一个人是不是应该有默契：秋天下雨，她把咖啡护在怀里跑 ----------------
shot('s23a', lineT0(16) - 0.2, (g, t, d) => {
  const u = t / d;
  cam(g, 960 + u * 160, 540, 1.0);
  // 阴天的海边：浅灰的天、灰的海、木栈道
  const HZ = 520;
  const sky = rectPath(-200, -200, 2400, HZ + 202); shade(g, sky, { x0: 0, y0: -200, x1: 0, y1: HZ, v0: 0.5, v1: 0.3 }, 20, { scale: 1 });
  sea(g, -200, 2400, HZ, 900, t + 112, { waves: 60, v0: 0.55, v1: 0.7 });
  pierSide(g, -200, 2400, 880, t, { night: false });
  const deck = rectPath(-200, 898, 2400, 300); paperFill(g, deck); shade(g, deck, 0.45, 2, { scale: 1 });
  leaves(g, t + 3, 10);
  // 她：低着头跑，咖啡捂在开衫里
  const x = 300 + t * 360;
  figure(g, 'her', x, 900, 4.4, walkPose(t * 1.9, 0.9, { torso: 18, neck: 14, look: 0.15, eyes: 'down', mouth: 'line', aF: [50, 105], aB: [40, 110], hF: 'hold', hB: 'open', hair: -1 }),
    { seed: 403, hold: { hand: 'F', draw(g2, c) { coffeeCup(g2, c[0] + 2, c[1] + 3, 6, { warm: 1, t }); } } });
  glow(g, x + 40, 620, 120, C.amber, 0.35);
  rain(g, t, { ground: 900, groundH: 160 });
});
sfx(lineT0(16) - 0.2, 'rain', { dur: 7.1 });
sfx(lineT0(16) - 0.2, 'runSteps', { dur: 3.5, wet: 1 });

// ---------------- S23b 她停在剧场门口：他和女主演撑着一把伞，有说有笑地走远了 ----------------
shot('s23b', chT(16, 7) - 0.15, (g, t, d) => {
  cam(g, 960, 540, 1.0);
  const HZ = 520;
  const sky = rectPath(-200, -200, 2400, HZ + 202); shade(g, sky, { x0: 0, y0: -200, x1: 0, y1: HZ, v0: 0.5, v1: 0.3 }, 20, { scale: 1 });
  sea(g, -200, 2400, HZ, 900, t + 116, { waves: 60, v0: 0.55, v1: 0.7 });
  // 剧场的大门（左边一角）
  const wall = rectPath(-100, 120, 520, 800); paperFill(g, wall); shade(g, wall, 0.5, 0, { scale: 1 });
  withSeed(9970, () => { for (let y = 140; y < 900; y += 24) sk(g, [[-100, y], [420, y]], { w: 1, a: 0.3, passes: 1 }); sk(g, [[420, 120], [420, 900]], { w: 2.6, a: 0.9 }); });
  const door = rectPath(160, 520, 180, 380); paperFill(g, door); shade(g, door, 0.75, 80); skRect(g, 160, 520, 180, 380, { w: 2.2, a: 0.9 });
  const deck = rectPath(-200, 898, 2400, 300); paperFill(g, deck); shade(g, deck, 0.45, 2, { scale: 1 });
  withSeed(9971, () => sk(g, [[-200, 898], [2400, 898]], { w: 2.4, a: 0.85 }));
  // 远处：他撑着伞，女主演挨着他，往右走远
  const wx = 1150 + t * 70;
  const sc = 3.4 - t * 0.25;
  figure(g, 'star', wx - 60, 898, sc, walkPose(t * 1.2, 0, { look: 0.5, mouth: 'open', eyes: 'smile', aF: [30, 60] }), { seed: 401 });
  figure(g, 'him', wx + 20, 898, sc * 1.02, walkPose(t * 1.2 + 0.5, 0, { look: 0.6, mouth: 'smile', aF: [100, 70], hF: 'fist' }), { seed: 402 });
  umbrella(g, wx + 10, 898 - sc * 108, sc * 34, 8, { tone: 0.55 });
  // 近处：她停住，捧着咖啡站在雨里
  figure(g, 'her', 560, 900, 5.0, P({ look: 0.1, eyes: 'open', mouth: 'line', aF: [40, 95], aB: [38, 100], hF: 'hold', neck: 4, hair: 0.6 }),
    { seed: 403, hold: { hand: 'F', draw(g2, c) { coffeeCup(g2, c[0] + 2, c[1] + 3, 6, { warm: 1, t }); } } });
  glow(g, 600, 600, 140, C.amber, 0.4);
  rain(g, t + 3.5, { ground: 900, groundH: 160 });
});

// ---------------- S24a 我以为你懂得：冬天的演出，追光的圈里，他和女主演在跳舞 ----------------
shot('s24a', lineT0(17) - 0.15, (g, t, d) => {
  const follow = Math.sin(t * 1.4) * 60;
  cam(g, 960 + follow, 520, 1.3);
  stageSet(g, t, { mode: 'show', moonX: 1350 });
  // 布景上下着雪（舞台上的纸雪）
  for (let i = 0; i < 60; i++) { const ph = (hash(i, 21) + t * 0.15) % 1; const x = 200 + hash(i, 22) * 1520 + Math.sin(t + i) * 20, y = -40 + ph * 980; erase(g, circlePath(x, y, 2 + hash(i, 23) * 3), 0.8); }
  const spin = t * 2.4;
  figure(g, 'star', 900 + Math.cos(spin) * 40, 905, 4.4, P({ torso: -6, look: 0.6, eyes: 'closed', mouth: 'smile', aF: [150, 10], aB: [-60, 30], lF: [20, -10], lB: [-15, -20], hair: Math.sin(spin) }), { seed: 401, face: Math.cos(spin) > 0 ? 1 : -1, light: { dx: 0, dy: -1, a: 0.4 } });
  figure(g, 'him', 1080, 905, 4.6, P({ look: 0.6, aF: [120, -20], aB: [10, 20], mouth: 'smile', eyes: 'smile', torso: -4 }), { seed: 402, face: -1, light: { dx: 0, dy: -1, a: 0.4 } });
  spotBeam(g, 1300, -260, 990, 905, 230, t, { on: 1 });
  camReset(g);
  darkness(g, 0.95, [[960, 540, 400, 400, 1]]);
  withSeed(9420, () => skEllipse(g, 960, 540, 300, 300, { w: 2.2, a: 0.55 }));
});
sfx(lineT0(17) - 0.15, 'showMurmur', { dur: 3.2 });

// ---------------- S24b 每当我看着你：她的侧脸，调光台的光，一滴眼泪 ----------------
shot('s24b', chT(17, 7) - 0.1, (g, t, d) => {
  cam(g, 960, 540, 1.0 + t * 0.02);
  const bg = rectPath(-100, -100, 2120, 1300); paperFill(g, bg); shade(g, bg, 0.88, 30, { scale: 1 });
  glow(g, 700, 900, 700, C.amber, 0.35);
  herClose(g, 1040, 500, 560, { flip: true, tilt: -4, eyes: 'open', look: 0, tear: smooth(0.4, 2.4, t), warm: 1.1, blink: Math.max(0, 1 - Math.abs(t - 0.3) / 0.1) });
  glow(g, 700, 760, 420, C.amberHot, 0.22);
});

// ---------------- S25 我藏起来的秘密：速写本的最后一页，她画了两个人在追光里抱在一起，又合上了 ----------------
shot('s25', lineT0(18) - 0.15, (g, t, d) => {
  cam(g, 960, 540, 1.0);
  const desk = rectPath(-100, -100, 2120, 1300); paperFill(g, desk); shade(g, desk, 0.62, 6, { scale: 1 });
  deskLamp(g, 1760, 360, 0.9, t, { on: 0.8 });
  const close = smooth(3.0, 3.6, t);
  g.save(); g.translate(960, 560); g.rotate(R(-2));
  const pw = 520, ph = 640;
  const cov = rectPath(-pw - 14, -ph / 2 - 14, pw * 2 + 28, ph + 28); paperFill(g, cov); shade(g, cov, 0.9, 30);
  if (close < 1) {
    g.save(); g.scale(1, 1);
    paperFill(g, rectPath(-pw, -ph / 2, pw, ph)); g.save(); g.translate(-pw / 2, 0); hisSketch(g, 3, pw, ph); g.restore();
    paperFill(g, rectPath(0, -ph / 2, pw * (1 - close), ph));
    // 右页：一笔笔画出来——追光里的两个人
    const dp = clamp(t / 2.8);
    g.save(); g.beginPath(); g.rect(0, -ph / 2, pw * (1 - close), ph); g.clip();
    g.translate(pw / 2, 0);
    g.save(); g.beginPath(); g.rect(-pw / 2, -ph / 2, pw, ph * dp); g.clip();
    beam(g, -40, -ph / 2 + 10, 0, ph * 0.36, 30, 380, C.amber, 0.45, { layers: 3 });
    figure(g, 'her', -40, ph * 0.38, 4.3, P({ look: 0.3, eyes: 'closed', mouth: 'smile', aF: [70, 60], aB: [60, 70] }), { seed: 601, lw: 0.9 });
    figure(g, 'him', 40, ph * 0.38, 4.5, P({ look: 0.3, eyes: 'closed', mouth: 'smile', aF: [70, 60], aB: [60, 70] }), { seed: 602, face: -1, lw: 0.9 });
    g.restore();
    g.restore();
    sk(g, [[0, -ph / 2], [0, ph / 2]], { w: 2.2, a: 0.8 });
    g.restore();
  }
  if (close > 0) { const cv = rectPath(0, -ph / 2, pw, ph); g.save(); g.scale(-1 + 2 * (1 - close) > 0 ? 1 : 1, 1); g.restore(); }
  g.restore();
  // 画画的手和笔
  if (t < 2.9) {
    const tx = 960 + 260 + Math.sin(t * 9) * 60, ty = 560 - 200 + clamp(t / 2.8) * 420;
    handPencilClose(g, tx, ty, 520, -50);
  }
});
sfx(lineT0(18) - 0.15, 'pencil', { dur: 2.8, gain: 0.8 });
sfx(lineT0(18) - 0.15 + 3.0, 'bookShut', { soft: 1 });

// ---------------- S26 在每一天清晨里：台口的同一个位置，一个季节又一个季节 ----------------
shot('s26', lineT0(19) - 0.17, (g, t, d) => {
  cam(g, 960, 540, 1.0);
  const season = clamp(t / d * 3.2);      // 0 秋 → 1 冬 → 2 春
  stageSet(g, t, { mode: 'dawn', mark: [960, 905], footlights: false });
  // 高处的窗：外面换季
  const wx0 = 1380, wy0 = 150, ww = 300, wh = 260;
  const win = rectPath(wx0, wy0, ww, wh); paperFill(g, win);
  g.save(); g.clip(win);
  shade(g, win, 0.15, 20);
  for (let i = 0; i < 40; i++) {
    const ph = (hash(i, 31) + t * 0.4) % 1, x = wx0 + hash(i, 32) * ww, y = wy0 - 20 + ph * (wh + 40);
    if (season < 1) { g.save(); g.globalAlpha = 1 - season; doodle(g, 'leaf', x, y, 10); g.restore(); }
    else if (season < 2) { erase(g, circlePath(x, y, 3), 1 - Math.abs(season - 1.5) * 2 + 0.5); }
    else { g.save(); g.globalAlpha = season - 2; doodle(g, 'flower', x, y, 9); g.restore(); }
  }
  g.restore();
  withSeed(9980, () => { skRect(g, wx0, wy0, ww, wh, { w: 2.6, a: 0.9 }); sk(g, [[wx0 + ww / 2, wy0], [wx0 + ww / 2, wy0 + wh]], { w: 2, a: 0.8 }); });
  beam(g, wx0 + ww / 2, wy0 + wh, 980, 905, 120, 260, season < 1 ? C.dawn : season < 2 ? C.moon : C.dawn, 0.3, { layers: 4 });
  // 每天早上的那杯咖啡（一闪一个）
  const day = Math.floor(t * 4);
  coffeeCup(g, 960, 905, 70, { doodle: DOODLES[day % DOODLES.length], warm: 0.7, t });
  // 墙上的日历：一页页往上翻
  const cx = 420, cy = 330;
  const cal = rectPath(cx - 90, cy - 110, 180, 220); paperFill(g, cal); shade(g, cal, 0.06, 0); skRect(g, cx - 90, cy - 110, 180, 220, { w: 2.2, a: 0.9 });
  const months = ['十月', '十一月', '十二月', '一月', '二月', '三月', '四月'];
  const mi = Math.min(months.length - 1, Math.floor(clamp(t / d) * months.length));
  pencilText(g, months[mi], cx, cy - 60, 40);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { const xx = cx - 70 + c * 28, yy = cy + r * 30; sk(g, [[xx - 6, yy], [xx + 6, yy]], { w: 1.2, a: 0.5, passes: 1, seed: 9990 + r * 6 + c }); }
  const flip = (t * 2.1) % 1;
  if (t < d - 0.4) { g.save(); g.translate(cx, cy - 110); g.scale(1, Math.cos(flip * Math.PI)); const fp = rectPath(-90, 0, 180, 220); paperFill(g, fp); skRect(g, -90, 0, 180, 220, { w: 1.6, a: 0.7 }); g.restore(); }
});
sfx(lineT0(19) - 0.17, 'calendar', { dur: 3.3, n: 7 });

// ---------------- S27a 暖成咖啡：杯套特写，她一笔一笔写下"我喜欢你" ----------------
function sleeveClose(g, t, o = {}) {
  // 横过来的一大片杯套（瓦楞纸），中间一块空白，上面写字
  const bg = rectPath(-100, -100, 2120, 1300); paperFill(g, bg); shade(g, bg, 0.3, 90, { scale: 1.6 });
  withSeed(10010, () => { for (let x = -100; x < 2020; x += 26) sk(g, [[x, -100], [x + 6, 1200]], { w: 1.2, a: 0.22, passes: 1 }); });
  const pane = new Path2D(); pane.ellipse(960, 520, 640, 300, 0, 0, 6.283);
  erase(g, pane, 0.92);
  withSeed(10011, () => skEllipse(g, 960, 520, 640, 300, { w: 2, a: 0.5 }));
  // 角上的小追光涂鸦
  doodle(g, 'spot', 1420, 620, 70);
}
function writeWords(g, s, x, y, size, p, o = {}) {   // 一个字一个字写出来（每个字从左往右）
  g.save(); g.font = `${size}px ${o.font || FONT_HAND}`; g.textAlign = 'left'; g.textBaseline = 'middle';
  const chars = [...s]; let cx = x;
  const ws = chars.map(c => g.measureText(c).width + (o.sp ?? 6));
  const total = ws.reduce((a, b) => a + b, 0); cx = x - total / 2;
  const pos = [];
  chars.forEach((c, i) => {
    const q = clamp(p * chars.length - i);
    pos.push([cx + ws[i] / 2, y, q]);
    if (q > 0) {
      g.save(); g.beginPath(); g.rect(cx - 4, y - size, (ws[i] + 6) * q, size * 2); g.clip();
      g.fillStyle = graphStyle(g); g.globalAlpha = o.a ?? 0.9; g.fillText(c, cx, y);
      g.globalAlpha = (o.a ?? 0.9) * 0.3; g.fillText(c, cx + 1.2, y + 0.8);
      g.restore();
    }
    cx += ws[i];
  });
  g.restore();
  return pos;
}
shot('s27a', lineT0(20) - 0.18, (g, t, d) => {
  cam(g, 960, 520, 1.0 + t * 0.02);
  sleeveClose(g, t);
  const p = smooth(0.35, 2.7, t);
  const pos = writeWords(g, '我喜欢你', 900, 500, 190, p, { sp: 18 });
  const k = Math.min(3, Math.floor(p * 4)), cur = pos[k];
  const tx = cur[0] - 60 + clamp(p * 4 - k) * 150 + Math.sin(t * 14) * 10, ty = cur[1] + 50 + Math.cos(t * 11) * 30;
  if (t < 3.0) handPencilClose(g, tx, ty, 760, -52);
});
sfx(lineT0(20) - 0.18 + 0.35, 'pencil', { dur: 2.4, gain: 0.9 });

// ---------------- S27b 安静的拿给你：她愣住了，脸红，倒过铅笔，把字全擦掉了，只剩那个小小的追光 ----------------
shot('s27b', lineT0(20) + 3.0, (g, t, d) => {
  cam(g, 960, 520, 1.04);
  sleeveClose(g, t);
  const er = smooth(0.5, 1.9, t);
  // 字被一下下擦掉（擦过的地方留着淡淡的印子）
  const F = BUF_F.getContext('2d');
  F.setTransform(1, 0, 0, 1, 0, 0); F.globalCompositeOperation = 'source-over'; F.clearRect(0, 0, W, H);
  F.setTransform(g.getTransform());
  writeWords(F, '我喜欢你', 900, 500, 190, 1, { sp: 18 });
  F.setTransform(1, 0, 0, 1, 0, 0);
  F.globalCompositeOperation = 'destination-out';
  const ex = lerp(420, 1500, er);
  F.beginPath(); F.moveTo(0, 0); for (let y = 0; y <= H; y += 20) F.lineTo(ex + Math.sin(y / 30 + t * 30) * 40, y); F.lineTo(0, H); F.closePath(); F.globalAlpha = 0.93; F.fill(); F.globalAlpha = 1;
  F.globalCompositeOperation = 'source-over';
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(BUF_F, 0, 0); g.restore();
  // 橡皮屑
  for (let i = 0; i < 30; i++) { const st = 0.5 + hash(i, 41) * 1.4, age = t - st; if (age < 0 || age > 1.6) continue; const x = lerp(420, 1500, (st - 0.5) / 1.4) + (hash(i, 42) - 0.5) * 80, y = 560 + age * age * 300 + hash(i, 43) * 60; g.save(); g.globalAlpha = 1 - age / 1.6; g.fillStyle = rgba([118, 112, 106], 0.8); g.beginPath(); g.ellipse(x, y, 5 + hash(i, 44) * 5, 3, hash(i, 45) * 3, 0, 6.283); g.fill(); g.restore(); }
  // 倒拿着的铅笔（橡皮那头朝下）在擦
  if (er > 0 && er < 1) { const ey_ = 500 + Math.sin(t * 26) * 70; const a_ = R(120); blackPencil(g, ex - Math.cos(a_) * 721, ey_ - Math.sin(a_) * 721, 700, 120, { w: 26, seed: 8101 }); }
  // 右下角：她的脸，红红的
  if (t > 1.9) { const a = smooth(1.9, 2.2, t); g.save(); g.globalAlpha = a; herClose(g, 1650, 860, 380, { flip: true, eyes: 'down', blush: 1, mouth: 'closed', tilt: 8 }); g.restore(); }
});
sfx(lineT0(20) + 3.0 + 0.5, 'eraser', { dur: 1.4 });

// ---------------- S27c 她把咖啡放在"X"上，转身就跑 ----------------
shot('s27c', chT(20, 8) - 0.2, (g, t, d) => {
  cam(g, 960, 520, 1.0);
  stageSet(g, t, { mode: 'dawn', mark: [800, 905], ghost: [1350, 880] });
  beam(g, 1750, -100, 1050, 900, 140, 420, C.dawn, 0.32, { layers: 5, endA: 0.35 });
  coffeeCup(g, 805, 905, 62, { doodle: 'spot', warm: 0.9, t });
  const run = smooth(0.25, 1.6, t);
  const x = lerp(880, 2150, run);
  figure(g, 'her', x, 905, 4.7, walkPose(t * 2.2, 1, { look: 0.2, eyes: 'closed', mouth: 'line', blush: 1, hair: -1 }), { seed: 403 });
});
sfx(chT(20, 8) - 0.2 + 0.25, 'runSteps', { dur: 1.3 });
