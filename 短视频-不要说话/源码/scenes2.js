// scenes2.js — 第一段主歌 B（B1）：白天排练。他在台上演"看不见的墙"，她在灯光室的玻璃后面不知不觉跟着把手贴上去；
// 她从追光灯的瞄准圈里看他；速写本里全是他；每天清晨冲一杯咖啡，悄悄放在台口他站的那个"X"上，杯套上画一个小月亮。

const holdCup = (doodleKind, o = {}) => ({ hand: o.hand || 'F', draw(g, c) { coffeeCup(g, c[0] + (o.dx ?? 1), c[1] + (o.dy ?? 3.5), o.h ?? 6.5, { doodle: doodleKind, warm: o.warm ?? 0.6, t: o.t ?? 0, night: o.night }); } });

// 默剧"看不见的墙"：手掌贴着空气，碰到的地方浮出淡淡的铅笔线
function mimeWall(g, x, y0, y1, a) {
  if (a <= 0.01) return;
  g.save(); g.globalAlpha = a;
  withSeed(9400, () => {
    for (let i = 0; i < 9; i++) { const yy = lerp(y0, y1, i / 8); sk(g, [[x - 3, yy], [x + 3, yy + 26]], { w: 1.2, a: 0.5, passes: 1 }); }
    sk(g, [[x, y0], [x + 2, y1]], { w: 1.4, a: 0.35, passes: 1 });
  });
  g.restore();
}

// ---------------- S10a 爱一个人是不是应该有默契：他在台上演"看不见的墙" ----------------
shot('s10a', bar(13), (g, t, d) => {
  cam(g, 960, 540, 1.0 + t * 0.01);
  stageSet(g, t, { mode: 'day', mark: [700, 905] });
  glow(g, 960, -200, 1300, C.amber, 0.14);
  // 女主演坐在侧幕边的椅子上看剧本
  figure(g, 'star', 380, 905, 3.6, P({ lF: [80, -80], lB: [78, -75], aF: [40, 60], aB: [30, 70], neck: 14, look: 0.3, eyes: 'down' }), { ground: false, seed: 401,
    hold: { hand: 'F', draw(g, c) { const pg = rectPath(c[0] - 2, c[1] - 7, 9, 12); paperFill(g, pg); skRect(g, c[0] - 2, c[1] - 7, 9, 12, { w: 0.5, a: 0.8 }); } } });
  // 他：两手贴着空气往旁边摸
  const ph = t * 1.4, slide = Math.sin(ph) * 0.5;
  const pose = P({ torso: 4 + slide * 4, look: 0.55, mouth: 'line', brows: 1, aF: [66 + slide * 16, 42 - slide * 14], aB: [74 - slide * 10, 36 + slide * 10], wF: 62 + slide * 14, wB: 66 - slide * 10, hF: 'flat', hB: 'flat', lF: [8, -6], lB: [-8, -4] });
  const J = figure(g, 'him', 980 + slide * 30, 905, 5.0, pose, { seed: 402 });
  mimeWall(g, 980 + slide * 30 + 205, 330, 640, 0.6);
}, { type: 'page', d: 1.2 });
sfx(bar(13), 'roomTone', { dur: 14, kind: 'day' });

// ---------------- S10b 她在灯光室的玻璃后面，手也贴上了玻璃 ----------------
shot('s10b', bar(14), (g, t, d) => {
  cam(g, 960, 540, 1.04 + t * 0.012);
  // 灯光室的外墙（从观众席这边看）：一扇宽玻璃窗，她在里面
  const wall = rectPath(-100, -100, 2120, 1300); paperFill(g, wall); shade(g, wall, 0.5, 28, { scale: 1 });
  const wx0 = 300, wx1 = 1620, wy0 = 160, wy1 = 900;
  const win = rectPath(wx0, wy0, wx1 - wx0, wy1 - wy0);
  // 窗里面：灯光室（暖暖的台灯）、她
  g.save(); g.clip(win);
  const inner = rectPath(wx0, wy0, wx1 - wx0, wy1 - wy0); paperFill(g, inner); shade(g, inner, 0.42, 20, { scale: 1 });
  deskLamp(g, 1380, 900, 1.2, t, { on: 0.6 });
  followSpot(g, 520, 560, 70, 200, {});
  const real = smooth(1.9, 2.4, t);
  bustFront(g, 'her', 960, 560 + real * 30, 300, { arms: real < 0.5 ? 'glass' : 'mouth', eyes: real < 0.5 ? 'half' : 'wide', gaze: [0, 0.3], mouth: real < 0.5 ? 'line' : 'o', blush: real, tilt: real * -4 });
  // 玻璃：反光、她手掌贴着的地方起了一点雾
  for (let i = 0; i < 5; i++) { const x = wx0 + 80 + i * 300; eraseStroke(g, [[x, wy1], [x + 220, wy0]], 30 - i * 4, 0.13); }
  if (real < 0.8) { for (const sd of [-1, 1]) glow(g, 960 + sd * 145, 545, 90, [240, 236, 228], 0.25 * (1 - real), 'screen'); }
  g.restore();
  withSeed(9410, () => { skRect(g, wx0, wy0, wx1 - wx0, wy1 - wy0, { w: 3.2, a: 0.92 }); const sill = rectPath(wx0 - 30, wy1, wx1 - wx0 + 60, 26); paperFill(g, sill); shade(g, sill, 0.4, 0); skRect(g, wx0 - 30, wy1, wx1 - wx0 + 60, 26, { w: 2, a: 0.85 }); });
});
sfx(bar(14) + 1.9, 'gasp', { soft: 1 });

// ---------------- S11a 我以为你懂得：从追光灯的瞄准圈里看他，他一抬头，圈子慌得一抖 ----------------
shot('s11a', bar(15), (g, t, d) => {
  const jolt = t > 2.0 && t < 2.9 ? Math.sin((t - 2.0) * 30) * 40 * (1 - (t - 2.0) / 0.9) : 0;
  const away = smooth(2.0, 2.15, t) * (1 - smooth(2.6, 3.1, t));
  cam(g, 960 + jolt + away * 380, 520 - away * 120, 1.35);
  stageSet(g, t, { mode: 'day', mark: [700, 905] });
  glow(g, 960, -200, 1300, C.amber, 0.14);
  const lookUp = smooth(1.7, 2.0, t);
  figure(g, 'him', 960, 905, 5.0, P({ torso: 2, look: lerp(0.5, 1.0, lookUp), neck: -lookUp * 10, aF: [10, 20], aB: [-8, 14], mouth: lookUp > 0.5 ? 'smile' : 'line', hF: 'open' }), { seed: 402 });
  camReset(g);
  // 瞄准圈：圈外是灯光室里暗暗的一片
  darkness(g, 0.95, [[960, 540, 400, 400, 1]]);
  withSeed(9420, () => { skEllipse(g, 960, 540, 300, 300, { w: 2.2, a: 0.55 }); sk(g, [[960, 210], [960, 260]], { w: 1.6, a: 0.5 }); sk(g, [[960, 820], [960, 870]], { w: 1.6, a: 0.5 }); sk(g, [[630, 540], [680, 540]], { w: 1.6, a: 0.5 }); sk(g, [[1240, 540], [1290, 540]], { w: 1.6, a: 0.5 }); });
});
sfx(bar(15) + 2.0, 'jolt', {});

// ---------------- S11b 每当我看着你：她缩到调光台下面，再探出头——他正和女主演说说笑笑 ----------------
shot('s11b', bar(16), (g, t, d) => {
  cam(g, 1000, 520, 1.0);
  theaterSection(g, t, { mode: 'day' });
  const S = SECT;
  // 台上：他和女主演，她搭着他的肩膀，两个人在笑
  figure(g, 'him', 330, S.stageY - 6, 2.9, P({ look: 0.5, mouth: 'smile', eyes: 'smile', neck: -6, aF: [10, 20] }), { seed: 402 });
  figure(g, 'star', 220, S.stageY - 6, 2.85, P({ look: 0.55, mouth: 'open', eyes: 'smile', aF: [60, 40], torso: 6, blush: 0.4 }), { seed: 401 });
  // 灯光室里：她先蹲下，再慢慢探出头
  const peek = smooth(1.0, 1.7, t);
  const hy = S.boothY1 - 10 + (1 - peek) * 90;
  g.save(); g.beginPath(); g.rect(S.boothX0, S.boothY0, S.boothX1 - S.boothX0, S.boothY1 - S.boothY0 - 64); g.clip();
  figure(g, 'her', S.boothX0 + 230, hy, 2.9, P({ look: 0.2, eyes: peek > 0.6 ? 'half' : 'closed', mouth: 'line', aF: [80, 60], aB: [70, 70], hF: 'fist', hB: 'fist', torso: 10 }), { face: -1, seed: 403 });
  g.restore();
  const cd = rectPath(S.boothX0 + 140, S.boothY1 - 70, 200, 70); paperFill(g, cd); shade(g, cd, 0.5, 0); skRect(g, S.boothX0 + 140, S.boothY1 - 70, 200, 70, { w: 1.8, a: 0.85 });
  glow(g, 960, -200, 1300, C.amber, 0.12);
  // 她的视线：一条淡淡的虚线，从灯光室一直到台上
  if (peek > 0.7) {
    g.save(); g.globalAlpha = (peek - 0.7) / 0.3 * 0.55; g.setLineDash([6, 14]); g.strokeStyle = graphStyle(g); g.lineWidth = 2;
    g.beginPath(); g.moveTo(S.boothX0 + 190, hy - 160); g.quadraticCurveTo(900, 320, 330, S.stageY - 150); g.stroke(); g.restore();
  }
});

// ---------------- S12 我藏起来的秘密：速写本里全是他 ----------------
function hisSketch(g, k, w, h) {   // 速写本里的一页：各种样子的他
  const s = h / 60;
  g.save(); g.scale(s, s);
  const poses = [
    () => figure(g, 'him', 0, 22, 0.55, P({ aF: [62, 104], aB: [70, 96], hF: 'flat', hB: 'flat', look: 0.5 }), { lw: 0.8, seed: 501 }),
    () => figure(g, 'him', 4, 2, 0.55, P({ torso: -70, lF: [-70, 10], lB: [-75, 20], aF: [-150, 30], aB: [-160, 20], eyes: 'closed', look: 0.3 }), { ground: false, lw: 0.8, seed: 502 }),
    () => figure(g, 'him', 0, 22, 0.55, P({ look: 0.9, mouth: 'smile', eyes: 'smile', aF: [30, 80], hF: 'hold' }), { lw: 0.8, seed: 503 }),
    () => figure(g, 'him', 0, 22, 0.55, P({ torso: 10, aF: [100, 0], aB: [-40, 10], lF: [30, -10], lB: [-30, -5], look: 0.4 }), { lw: 0.8, seed: 504 }),
    () => figure(g, 'him', 0, 22, 0.55, P({ look: 0.6, aF: [30, 80], hF: 'hold', mouth: 'smile' }), { lw: 0.8, seed: 505, hold: { hand: 'F', draw(g2, c) { coffeeCup(g2, c[0], c[1] + 3, 6, { doodle: 'moon' }); } } }),
  ];
  poses[k % poses.length]();
  g.restore();
  pencilText(g, ['看不见的墙', '午睡', '笑', '跳', '咖啡'][k % 5], 0, h * 0.4, h * 0.09, { a: 0.6 });
}
shot('s12', lineT0(7) - 0.2, (g, t, d) => {
  cam(g, 960, 540, 1.0);
  // 俯视调光台：木头桌面、推子，摊开的速写本
  const desk = rectPath(-100, -100, 2120, 1300); paperFill(g, desk); shade(g, desk, 0.48, 6, { scale: 1 });
  withSeed(9500, () => { for (let i = 0; i < 6; i++) sk(g, [[-100, 120 + i * 180], [2020, 110 + i * 185]], { w: 1, a: 0.3, passes: 1 }); for (let i = 0; i < 10; i++) { const x = 120 + i * 60; sk(g, [[x, 40], [x, 200]], { w: 2.4, a: 0.6, passes: 1 }); const kn = rectPath(x - 13, 90 + hash(i, 3) * 70, 26, 14); paperFill(g, kn); skRect(g, x - 13, 90 + hash(i, 3) * 70, 26, 14, { w: 1.2, a: 0.8, over: 1 }); } });
  deskLamp(g, 1820, 330, 0.9, t, { on: 0.5 });
  const shut = smooth(2.75, 3.05, t), slide = smooth(3.1, 3.6, t);
  const bx = 960 + slide * 900, by = 560 + slide * 160;
  const flips = Math.floor(clamp(t / 2.6) * 7);
  // 速写本：左页、右页；翻页时右页翻到左边
  g.save(); g.translate(bx, by); g.rotate(R(-3 + slide * 10));
  const pw = 520, ph = 640;
  const L = rectPath(-pw, -ph / 2, pw, ph), Rr = rectPath(0, -ph / 2, pw, ph);
  const cov = rectPath(-pw - 14, -ph / 2 - 14, pw * 2 + 28, ph + 28); paperFill(g, cov); shade(g, cov, 0.9, 30);
  if (shut < 1) {
    g.save(); g.scale(1 - shut, 1);
    paperFill(g, L); hisSketch(g, flips + 1, pw, ph); g.save(); g.translate(-pw / 2, 0); hisSketch(g, flips + 1, pw, ph); g.restore();
    g.restore();
    g.save(); g.translate(pw / 2, 0);
    paperFill(g, rectPath(-pw / 2, -ph / 2, pw, ph)); hisSketch(g, flips + 2, pw, ph);
    g.restore();
    // 正在翻的那页
    const fp = (t / 2.6 * 7) % 1;
    if (t < 2.6) {
      const c = Math.cos(fp * Math.PI);
      const px = rectPath(Math.min(0, c * pw), -ph / 2, Math.abs(c) * pw, ph); paperFill(g, px);
      if (c > 0.05) { g.save(); g.clip(px); g.translate(c * pw / 2, 0); g.scale(c, 1); hisSketch(g, flips + 2, pw, ph); g.restore(); }
      sk(g, [[c * pw, -ph / 2], [c * pw, ph / 2]], { w: 1.6, a: 0.7 });
      smudgeBlob(g, c * pw * 0.5, 0, pw * 0.4 * Math.abs(c), 0.1);
    }
    sk(g, [[0, -ph / 2], [0, ph / 2]], { w: 2.2, a: 0.8 });
  } else {
    const cv = rectPath(0, -ph / 2, pw, ph); paperFill(g, cv); shade(g, cv, 0.88, 30);
    pencilText(g, '速写本', pw / 2, 0, 46, { a: 0.5 });
  }
  g.restore();
  // 她的两只手按着本子
  for (const sd of [-1, 1]) {
    const hx = bx + sd * 300 * (1 - shut * 0.6), hy = by + 330;
    const hp = [[hx - 60, hy + 120], [hx - 52, hy - 10], [hx - 20, hy - 46], [hx + 30, hy - 40], [hx + 56, hy], [hx + 54, hy + 120]];
    part(g, hp, { w: 2.2, per: 4 });
    const sl = [[hx - 70, hy + 90], [hx + 66, hy + 90], [hx + 72, hy + 260], [hx - 76, hy + 260]]; part(g, sl, { tone: 0.42, w: 2.2, per: 2 });
  }
});
sfx(lineT0(7) - 0.2, 'pageFlips', { dur: 2.6, n: 7 });
sfx(lineT0(7) - 0.2 + 2.75, 'bookShut', {});
sfx(lineT0(7) - 0.2 + 3.1, 'slide', {});

// ---------------- S13 在每一天清晨里：天亮了，海上的太阳，手冲咖啡 ----------------
shot('s13', lineT0(8) - 0.18, (g, t, d) => {
  cam(g, 960, 540, 1.0 + t * 0.01);
  // 窗外：清晨的海、太阳刚升起来
  const wx0 = 120, wx1 = 1800, wy0 = 60, wy1 = 720;
  const room = rectPath(-100, -100, 2120, 1300); paperFill(g, room); shade(g, room, 0.5, 30, { scale: 1 });
  const win = rectPath(wx0, wy0, wx1 - wx0, wy1 - wy0); paperFill(g, win);
  g.save(); g.clip(win);
  const HZ = 520;
  const sky = rectPath(wx0, wy0, wx1 - wx0, HZ - wy0); shade(g, sky, { x0: 0, y0: wy0, x1: 0, y1: HZ, v0: 0.16, v1: 0.02 }, 20, { scale: 1 });
  tint(g, [255, 214, 170], 0.22, 'multiply', sky);
  const sunY = HZ - 10 - t * 22;
  erase(g, circlePath(1200, sunY, 70), 1); skEllipse(g, 1200, sunY, 70, 70, { w: 2, a: 0.6 });
  sea(g, wx0, wx1, HZ, wy1, t + 64, { waves: 50, v0: 0.42, v1: 0.6, moonX: 1200, pathA: 1, hatch: 0.45 });
  glow(g, 1200, sunY, 520, C.dawn, 0.55); glow(g, 1200, sunY, 170, C.amberHot, 0.6);
  // 海鸥
  for (let i = 0; i < 3; i++) { const x = 500 + i * 160 + t * 40, y = 250 + i * 30 + Math.sin(t * 3 + i) * 8; sk(g, [[x - 20, y], [x - 8, y - 8], [x, y], [x + 8, y - 8], [x + 20, y]], { w: 1.6, a: 0.75, passes: 1, seed: 9600 + i }); }
  g.restore();
  withSeed(9610, () => { skRect(g, wx0, wy0, wx1 - wx0, wy1 - wy0, { w: 3, a: 0.9 }); sk(g, [[(wx0 + wx1) / 2, wy0], [(wx0 + wx1) / 2, wy1]], { w: 2.4, a: 0.8 }); sk(g, [[wx0, 300], [wx1, 300]], { w: 2.2, a: 0.8 }); });
  // 窗台、桌面
  const tb = new Path2D(); tb.moveTo(-100, 760); tb.lineTo(2020, 760); tb.lineTo(2020, 1200); tb.lineTo(-100, 1200); tb.closePath(); paperFill(g, tb); shade(g, tb, 0.22, 4, { scale: 1 });
  withSeed(9611, () => sk(g, [[-100, 760], [2020, 760]], { w: 2.6, a: 0.9 }));
  // 手冲：纸杯上架一个锥形滤杯，细嘴手壶往里倒水
  const cx = 820, cy = 1040;
  coffeeCup(g, cx, cy, 170, { warm: smooth(0.5, 2, t), t, doodle: null });
  withSeed(9612, () => {
    const dTop = cy - 170 - 10, dr = [[cx - 135, dTop - 120], [cx + 135, dTop - 120], [cx + 48, dTop], [cx - 48, dTop]];
    part(g, dr, { tone: 0.12, w: 2.4, per: 2 });
    for (let i = 1; i < 4; i++) sk(g, [[cx - 135 + i * 12, dTop - 120 + i * 30], [cx + 135 - i * 12, dTop - 120 + i * 30]], { w: 1, a: 0.35, passes: 1 });
    const flange = [[cx - 120, dTop + 2], [cx + 120, dTop + 2], [cx + 120, dTop + 14], [cx - 120, dTop + 14]]; part(g, flange, { tone: 0.2, w: 1.8, per: 1 });
    // 手壶（侧面）
    const kx = 1290, ky = 660;
    const kettle = [[kx - 120, ky + 130], [kx - 135, ky - 10], [kx - 80, ky - 80], [kx + 80, ky - 80], [kx + 135, ky - 10], [kx + 120, ky + 130]];
    part(g, kettle, { tone: 0.3, w: 2.6, per: 4 });
    const lid = [[kx - 70, ky - 80], [kx - 40, ky - 112], [kx + 40, ky - 112], [kx + 70, ky - 80]]; part(g, lid, { tone: 0.5, w: 2.2, per: 3 });
    erase(g, circlePath(kx, ky - 122, 12), 0.9); skEllipse(g, kx, ky - 122, 12, 10, { w: 1.6, a: 0.8 });
    sk(g, spline([[kx + 130, ky - 30], [kx + 220, ky - 10], [kx + 215, ky + 100], [kx + 120, ky + 110]], 6), { w: 6, a: 0.88 });
    // 鹅颈壶嘴：从壶底伸出来，弯上去，再往下指着滤杯
    const sp = spline([[kx - 125, ky + 95], [kx - 230, ky + 40], [kx - 330, ky - 90], [kx - 400, ky - 150], [cx + 60, dTop - 170]], 8);
    sk(g, sp, { w: 7, a: 0.9 }); sk(g, sp.map(([x, y]) => [x + 3, y + 5]), { w: 2, a: 0.45 });
    eraseStroke(g, sp.map(([x, y]) => [x - 1, y - 2]), 1.6, 0.5);
    const pour = smooth(0.3, 0.6, t);
    if (pour > 0) { g.save(); g.globalAlpha = pour; eraseStroke(g, [[cx + 60, dTop - 166], [cx + 50 + Math.sin(t * 20) * 2, dTop - 80]], 4, 0.9); g.restore(); sk(g, [[cx + 57, dTop - 166], [cx + 47, dTop - 80]], { w: 1, a: 0.5 * pour, passes: 1 }); }
    // 热气
    for (let i = 0; i < 4; i++) { const ph = (t * 0.5 + i * 0.25) % 1; const pts = []; for (let k = 0; k <= 10; k++) { const u = k / 10; pts.push([cx - 70 + i * 45 + Math.sin(u * 6 + t * 3 + i) * 14, dTop - 130 - ph * 160 - u * 110]); } g.save(); g.globalAlpha = Math.sin(ph * Math.PI) * 0.6; sk(g, pts, { w: 2, a: 0.6, passes: 1, taper: 0.9, seed: 9620 + i }); g.restore(); }
  });
  glow(g, 1200, 300, 900, C.dawn, 0.12);
});
sfx(lineT0(8) - 0.18 + 0.3, 'pour', { dur: 2.6 });

// ---------------- S14a 暖成咖啡：清晨空无一人的剧场，她把咖啡放在他站的"X"上，在杯套上画一个月亮 ----------------
shot('s14a', lineT0(9) - 0.15, (g, t, d) => {
  cam(g, 960, 520, 1.0);
  stageSet(g, t, { mode: 'dawn', mark: [800, 905], ghost: [1350, 880] });
  // 高处的窗户漏进来一束清晨的光
  beam(g, 1750, -100, 1050, 900, 140, 420, C.dawn, 0.32, { layers: 5, endA: 0.35 });
  const walk = clamp(t / 1.2), crouch = smooth(1.2, 1.6, t) * (1 - smooth(2.7, 3.0, t)), away = smooth(2.9, 3.3, t);
  const x = lerp(1900, 900, easeOut(walk)) - away * 500;
  const pose = crouch > 0.01 ? P({ torso: 34 * crouch, neck: 16 * crouch, look: 0.3, eyes: 'down', lF: [lerp(0, 92, crouch), lerp(0, -128, crouch)], lB: [lerp(0, 40, crouch), lerp(0, -150, crouch)], aF: [lerp(40, 70, crouch), lerp(70, 40, crouch)], aB: [30, 70], hF: 'hold', mouth: 'smile', blush: 0.4 })
    : walkPose(t * 1.3, 0, { look: 0.2, aF: [40, 70], hF: 'hold', mouth: 'line' });
  const drawing = t > 1.8 && t < 2.7;
  const cupPlaced = t > 1.55;
  if (cupPlaced) coffeeCup(g, 805, 905, 62, { doodle: t > 2.55 ? 'moon' : null, warm: 0.8, t });
  figure(g, 'her', x, 905, 4.7, pose, { face: -1, seed: 403, noPencil: drawing,
    hold: { hand: 'F', draw(g2, c, a) { if (!cupPlaced) coffeeCup(g2, c[0] - 1, c[1] + 3.5, 6.5, { warm: 0.7, t }); else if (drawing) blackPencil(g2, c[0], c[1] + 4, 12, a - 90 + 200 + Math.sin(t * 30) * 8, { w: 0.7, seed: 8101 }); } } });
  if (drawing) { const pr = (t - 1.8) / 0.75; g.save(); g.globalAlpha = 0.9; doodle(g, 'moon', 805, 905 - 62 * 0.5, 62 * 0.14 * clamp(pr * 1.4)); g.restore(); }
});
sfx(lineT0(9) - 0.15, 'steps', { dur: 1.2, soft: 1 });
sfx(lineT0(9) - 0.15 + 1.55, 'cupDown', {});
sfx(lineT0(9) - 0.15 + 1.8, 'pencil', { dur: 0.75, gain: 0.6 });

// ---------------- S14b 安静的拿给你：他来了，拿起咖啡，看见杯套上的月亮，笑了 ----------------
shot('s14b', chT(9, 4) - 0.2, (g, t, d) => {
  cam(g, 900, 560, 1.18 + t * 0.03);
  stageSet(g, t, { mode: 'day', mark: [800, 905] });
  glow(g, 960, -200, 1300, C.amber, 0.12);
  const walk = clamp(t / 1.0), up = smooth(1.0, 1.5, t);
  const x = lerp(260, 740, easeOut(walk));
  const look = smooth(2.4, 2.8, t);
  const pose = up < 0.01 ? walkPose(t * 1.3, 0, { look: 0.3 }) : P({ torso: lerp(30, 0, up), neck: lerp(10, -look * 8, up), look: lerp(0.4, 0.95, look), aF: [lerp(70, 40, up), lerp(30, 90, up)], aB: [lerp(60, 30, up), lerp(40, 95, up)], hF: 'hold', hB: 'hold', mouth: up > 0.6 ? 'smile' : 'line', eyes: look > 0.5 ? 'open' : 'down' });
  if (up < 0.5) coffeeCup(g, 805, 905, 62, { doodle: 'moon', warm: 0.8, t });
  figure(g, 'him', x, 905, 5.0, pose, { seed: 402, hold: { hand: 'F', draw(g2, c) { if (up >= 0.5) coffeeCup(g2, c[0] + 2, c[1] + 4, 6.5, { doodle: 'moon', warm: 1, t }); } } });
});
sfx(chT(9, 4) - 0.2 + 1.1, 'cupUp', {});
