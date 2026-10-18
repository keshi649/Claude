// scenes5.js — 第二遍副歌（C2）：夜里，她的小房间。窗外是海，对岸栈桥上的剧场还亮着灯。
// 她在桌上用纸板做了一个小剧场，把画好的两个纸人放上去；把台灯转过去，两个纸人抱在一起，墙上的影子也抱在一起。
// 她坐在墙角哼歌，音符变成纸鸟，从窗口飞出去，飞过海，飞进剧场——他一个人坐在守夜灯下面。

// 剪影：把 draw 画成一块灰影，放大、糊一点，贴到墙上
function shadowOf(g, draw, x, y, sc, blur, a) {
  const F = BUF_F.getContext('2d');
  F.setTransform(1, 0, 0, 1, 0, 0); F.globalCompositeOperation = 'source-over'; F.filter = 'none'; F.clearRect(0, 0, W, H);
  F.translate(W / 2, H / 2); draw(F); F.setTransform(1, 0, 0, 1, 0, 0);
  F.globalCompositeOperation = 'source-in'; F.fillStyle = rgba([40, 38, 44], 1); F.fillRect(0, 0, W, H); F.globalCompositeOperation = 'source-over';
  g.save(); g.globalAlpha = a; g.filter = `blur(${blur}px)`; g.globalCompositeOperation = 'multiply';
  g.translate(x, y); g.scale(sc, sc); g.drawImage(BUF_F, -W / 2, -H / 2); g.restore();
}
// 纸人：画在卡纸上剪下来的小人，下面插一根小木棍
function paperPuppet(g, who, x, y, k, pose, o = {}) {
  sk(g, [[x + (o.stickDx ?? 0), y - 4], [x + (o.stickDx ?? 0) + 4, y + 120 * k / 1.0]], { w: 3 * k, a: 0.85 });
  figure(g, who, x, y, k, pose, Object.assign({ seed: who === 'her' ? 611 : 612, lw: 0.9 }, o));
}
// 纸板小剧场
function toyTheater(g, x, y, w, t, o = {}) {
  const h = w * 0.72;
  withSeed(10100, () => {
    const back = rectPath(x - w / 2, y - h, w, h); paperFill(g, back); shade(g, back, 0.2, 20);
    for (let i = 0; i < 4; i++) sk(g, [[x - w / 2 + 10, y - h * 0.35 + i * 10], [x + w / 2 - 10, y - h * 0.35 + i * 10 + 2]], { w: 1, a: 0.4, passes: 1 });
    erase(g, circlePath(x + w * 0.25, y - h * 0.72, w * 0.07), 0.9); skEllipse(g, x + w * 0.25, y - h * 0.72, w * 0.07, w * 0.07, { w: 1.2, a: 0.6, passes: 1 });
    if (o.inside) o.inside(g, x, y, w, h);
    // 台口的框：上面一个拱，两边柱子
    const fr = new Path2D();
    fr.rect(x - w / 2 - w * 0.08, y - h - w * 0.16, w * 1.16, h + w * 0.16 + w * 0.06);
    fr.moveTo(x - w / 2, y); fr.lineTo(x - w / 2, y - h * 0.8); fr.quadraticCurveTo(x, y - h * 1.12, x + w / 2, y - h * 0.8); fr.lineTo(x + w / 2, y); fr.closePath();
    g.save(); g.fillStyle = paperStyle(g); g.fill(fr, 'evenodd'); g.restore();
    g.save(); g.clip(fr, 'evenodd'); const fp = rectPath(x - w, y - h * 1.5, w * 2, h * 1.6); shade(g, fp, 0.35, 70); g.restore();
    sk(g, [[x - w / 2, y], [x - w / 2, y - h * 0.8]], { w: 2, a: 0.85 }); sk(g, spline([[x - w / 2, y - h * 0.8], [x, y - h * 1.02], [x + w / 2, y - h * 0.8]], 8), { w: 2, a: 0.85 }); sk(g, [[x + w / 2, y - h * 0.8], [x + w / 2, y]], { w: 2, a: 0.85 });
    skRect(g, x - w / 2 - w * 0.08, y - h - w * 0.16, w * 1.16, h + w * 0.22, { w: 2.2, a: 0.9 });
    // 两边的小幕布
    curtain(g, x - w / 2, x - w / 2 + w * 0.12, y - h * 0.8, y, 2, t, { tone: 0.6, seed: 10110, sway: 0.5 });
    curtain(g, x + w / 2 - w * 0.12, x + w / 2, y - h * 0.8, y, 2, t, { tone: 0.6, seed: 10120, sway: 0.5 });
    // 台面
    const st = rectPath(x - w / 2 - w * 0.08, y, w * 1.16, w * 0.06); paperFill(g, st); shade(g, st, 0.5, 0); skRect(g, x - w / 2 - w * 0.08, y, w * 1.16, w * 0.06, { w: 1.8, a: 0.85 });
    pencilText(g, '不要说话', x, y - h - w * 0.08, w * 0.075, { a: 0.8 });
  });
}
// 她的房间（夜）：后墙、右边的窗（窗外是海和对岸的剧场）、窗前的书桌、台灯
function herRoom(g, t, o = {}) {
  const wall = rectPath(-200, -200, 2400, 1500); paperFill(g, wall); shade(g, wall, o.wallTone ?? 0.62, 85, { scale: 1 });
  withSeed(10200, () => { for (let x = -200; x < 2200; x += 90) sk(g, [[x, -200], [x + 2, 900]], { w: 1, a: 0.16, passes: 1 }); });
  const wx0 = o.winX ?? 1160, wy0 = 120, ww = o.winW ?? 640, wh = 520;
  const win = rectPath(wx0, wy0, ww, wh); paperFill(g, win);
  g.save(); g.clip(win);
  const HZ = wy0 + wh * 0.58;
  nightSky(g, wx0, wy0, wx0 + ww, HZ, t, { moon: [wx0 + ww * 0.7, wy0 + 110, 46], stars: 24, top: 0.88, bottom: 0.64 });
  moon(g, wx0 + ww * 0.7, wy0 + 110, 46, t);
  sea(g, wx0, wx0 + ww, HZ, wy0 + wh, t, { waves: 30, moonX: wx0 + ww * 0.7, v0: 0.7 });
  // 对岸：栈桥上的小剧场，几点暖灯
  const tx = wx0 + ww * 0.28, ty = HZ + 18;
  const th = [[tx - 46, ty], [tx - 46, ty - 40], [tx, ty - 62], [tx + 46, ty - 40], [tx + 46, ty]]; part(g, th, { tone: 0.75, w: 1.4, per: 1 });
  sk(g, [[tx - 120, ty + 2], [tx + 150, ty + 2]], { w: 1.6, a: 0.8 });
  for (let i = 0; i < 5; i++) { const lx = tx - 34 + i * 17; erase(g, circlePath(lx, ty - 30, 2.4), 1); glow(g, lx, ty - 30, 16, C.amberHot, 0.6 * (o.theaterLights ?? 1)); }
  glow(g, tx, ty - 30, 90, C.amber, 0.25 * (o.theaterLights ?? 1));
  g.restore();
  withSeed(10201, () => {
    skRect(g, wx0, wy0, ww, wh, { w: 3, a: 0.92 });
    sk(g, [[wx0 + ww / 2, wy0], [wx0 + ww / 2, wy0 + wh]], { w: 2.4, a: 0.85 }); sk(g, [[wx0, wy0 + wh * 0.42], [wx0 + ww, wy0 + wh * 0.42]], { w: 2.2, a: 0.8 });
  });
  // 窗帘
  const cs = o.curtainSway ?? 0;
  curtain(g, wx0 - 120, wx0 + 10 + cs * 40, wy0 - 60, wy0 + wh + 40, 3, t, { tone: 0.45, seed: 10210, sway: 1 + cs * 4 });
  curtain(g, wx0 + ww - 10 - cs * 30, wx0 + ww + 120, wy0 - 60, wy0 + wh + 40, 3, t, { tone: 0.45, seed: 10220, sway: 1 + cs * 4 });
  if (o.desk === true) deskFront(g, o.deskY ?? 720);
}
function deskFront(g, dy) {
  {
    const top = new Path2D(); top.moveTo(-200, dy); top.lineTo(2200, dy); top.lineTo(2200, dy + 40); top.lineTo(-200, dy + 40); top.closePath();
    paperFill(g, top); shade(g, top, 0.35, 0);
    const front = rectPath(-200, dy + 40, 2400, 600); paperFill(g, front); shade(g, front, 0.72, 80, { scale: 1 });
    withSeed(10202, () => { sk(g, [[-200, dy], [2200, dy]], { w: 2.6, a: 0.9 }); sk(g, [[-200, dy + 40], [2200, dy + 40]], { w: 2.2, a: 0.85 }); });
  }
}

// ---------------- S28 愿意 用一支黑色的铅笔：夜里，她在窗前的书桌上画画 ----------------
shot('s28', lineT0(21) - 0.15, (g, t, d) => {
  cam(g, 960, 520, 1.0 + t * 0.01);
  herRoom(g, t + 140, { desk: false });
  // 椅背
  withSeed(10300, () => { sk(g, [[400, 560], [400, 900]], { w: 3.2, a: 0.85 }); sk(g, [[400, 560], [440, 560]], { w: 3, a: 0.85 }); });
  const dr = Math.sin(t * 8) * 6;
  figure(g, 'her', 520, 800, 5.4, P({ torso: 20, neck: 18, look: 0.2, eyes: 'down', lF: [88, -86], lB: [84, -80], aF: [62 + dr * 0.3, 38 + dr], aB: [55, 42], hF: 'hold', hair: Math.sin(t) * 0.3 }),
    { ground: false, seed: 403, light: { dx: 1, dy: -0.5, a: 0.45 }, hold: holdPencil(12, 95) });
  deskFront(g, 742);
  // 桌上的纸、台灯
  const pp = new Path2D(); pp.moveTo(700, 741); pp.lineTo(1000, 741); pp.lineTo(1020, 752); pp.lineTo(680, 752); pp.closePath(); paperFill(g, pp); sk(g, [[680, 752], [1020, 752]], { w: 1.4, a: 0.7 });
  deskLamp(g, 1060, 742, 1.1, t, { on: 1 });
  glow(g, 900, 700, 520, C.amber, 0.35);
});
sfx(lineT0(21) - 0.15, 'roomNight', { dur: 27 });
sfx(lineT0(21) + 0.4, 'pencil', { dur: 3.6, gain: 0.6 });

// ---------------- S29 画一出沉默舞台剧：桌上的纸板小剧场，两个纸人被放上去，演起来 ----------------
shot('s29', lineT0(22) - 0.15, (g, t, d) => {
  cam(g, 1000, 520, 1.0 + t * 0.015);
  herRoom(g, t + 144, { desk: false, wallTone: 0.68 });
  const dy = 860;
  const top = rectPath(-200, dy, 2400, 400); paperFill(g, top); shade(g, top, 0.4, 0, { scale: 1 });
  withSeed(10301, () => sk(g, [[-200, dy], [2200, dy]], { w: 2.6, a: 0.9 }));
  glow(g, 1000, 600, 700, C.amber, 0.3);
  toyTheater(g, 1000, dy - 30, 720, t, {
    inside: (g2, x, y, w, h) => {
      // 纸人：先被手放上去，然后自己动起来
      const inA = smooth(0.2, 0.8, t), inB = smooth(0.9, 1.5, t);
      const live = smooth(1.6, 2.0, t);
      const mime = Math.sin(t * 3) * 0.5;
      paperPuppet(g2, 'him', x - 90, y - 120 * (1 - inA) - 2, 2.2, P({ look: 0.6, aF: [66 + mime * 16 * live, 42], aB: [74, 36], wF: 62 * live, wB: 66 * live, hF: live > 0.5 ? 'flat' : 'open', hB: live > 0.5 ? 'flat' : 'open', mouth: 'line' }), { stickDx: 0 });
      const knock = live > 0.5 ? Math.max(0, Math.sin(t * 9)) : 0;
      if (inB > 0) paperPuppet(g2, 'her', x + 90, y - 120 * (1 - inB) - 2, 2.1, P({ look: 0.6, aF: [lerp(10, 70, live), lerp(10, 60 + knock * 30, live)], hF: 'fist', mouth: 'line' }), { face: -1 });
      if (live > 0.5) mimeWall(g2, x - 4, y - 200, y - 40, 0.5);
    },
  });
  // 放纸人的手（从上面伸进来）
  const hand = t < 1.6 ? (t < 0.85 ? [910, 400 - (1 - smooth(0.0, 0.8, t)) * 400] : [1090, 400 - (1 - smooth(0.85, 1.5, t)) * 400]) : [1090, 400 - smooth(1.5, 1.9, t) * 600];
  const hp = [[hand[0] - 40, hand[1] + 20], [hand[0] - 30, hand[1] - 40], [hand[0] + 30, hand[1] - 40], [hand[0] + 40, hand[1] + 20], [hand[0] + 50, hand[1] - 400], [hand[0] - 60, hand[1] - 400]];
  part(g, hp, { w: 2.4, per: 4, tone: 0.1 });
  part(g, [[hand[0] - 70, hand[1] - 150], [hand[0] + 70, hand[1] - 150], [hand[0] + 80, hand[1] - 500], [hand[0] - 80, hand[1] - 500]], { tone: 0.45, w: 2.4, per: 2 });
});
sfx(lineT0(22) - 0.15 + 0.6, 'paperTap', {});
sfx(lineT0(22) - 0.15 + 1.4, 'paperTap', {});

// ---------------- S30 灯光再亮 也抱住你：台灯转过去，两个纸人抱在一起，墙上的影子也抱在一起 ----------------
shot('s30', lineT0(23) - 0.14, (g, t, d) => {
  cam(g, 960, 520, 1.0);
  herRoom(g, t + 148, { desk: false, wallTone: 0.72, theaterLights: 1 });
  const dy = 880;
  const top = rectPath(-200, dy, 2400, 400); paperFill(g, top); shade(g, top, 0.42, 0, { scale: 1 });
  withSeed(10301, () => sk(g, [[-200, dy], [2200, dy]], { w: 2.6, a: 0.9 }));
  const hug = smooth(0.6, 1.8, t);
  const pose = (who) => P({ look: 0.5, eyes: hug > 0.6 ? 'closed' : 'open', mouth: 'smile', aF: [lerp(10, 70, hug), lerp(10, 70, hug)], aB: [lerp(-10, 60, hug), lerp(10, 80, hug)] });
  const gap = lerp(70, 18, hug);
  // 墙上的大影子（灯在前面，影子落在后墙）
  shadowOf(g, F => { F.translate(0, 300); paperPuppet(F, 'him', -gap, 0, 2.2, pose('him')); paperPuppet(F, 'her', gap, 0, 2.1, pose('her'), { face: -1 }); }, 430, -80, 2.6, 5, 0.75 * smooth(0.0, 0.5, t));
  // 小剧场和纸人
  toyTheater(g, 820, dy - 26, 520, t, { inside: (g2, x, y) => { paperPuppet(g2, 'him', x - gap, y - 2, 2.2, pose('him')); paperPuppet(g2, 'her', x + gap, y - 2, 2.1, pose('her'), { face: -1 }); glow(g2, x, y - 100, 180, C.amberHot, 0.35 * hug); } });
  // 台灯（转过来对着小剧场）
  deskLamp(g, 1250, dy, 1.0, t, { on: 1 });
  beam(g, 1210, dy - 160, 860, dy - 120, 30, 260, C.amber, 0.35, { layers: 4, endA: 0.3 });
  // 她的背影（右下，近景）：短发的后脑勺和肩膀，边上被灯照亮
  withSeed(10320, () => {
    const bx = 1600, by = 860;
    const sh = [[bx - 260, by + 260], [bx - 230, by + 60], [bx - 120, by - 10], [bx + 120, by - 10], [bx + 230, by + 60], [bx + 260, by + 260]];
    const sp = pathOf(spline(sh, 5, true)); paperFill(g, sp); shade(g, sp, 0.86, 80);
    const hp = new Path2D(); hp.ellipse(bx, by - 110, 128, 140, 0, 0, 6.283); paperFill(g, hp); shade(g, hp, 0.9, 72);
    sk(g, spline(sh.slice(1, 5), 5), { w: 2.4, a: 0.85 }); skEllipse(g, bx, by - 110, 128, 140, { w: 2.4, a: 0.85 });
    blackPencil(g, bx - 150, by - 150, 170, -20, { w: 7, seed: 9150 });
    g.save(); g.clip(hp); glow(g, bx - 120, by - 160, 120, C.amber, 0.45); g.restore();
  });
  glow(g, 900, 600, 900, C.amber, 0.22);
});
sfx(lineT0(23) - 0.14 + 0.2, 'lampClick', {});
sfx(lineT0(23) - 0.14 + 0.6, 'warmSwell', { dur: 2.0 });

// ---------------- S31 愿意 在角落唱沙哑的歌：她坐在房间的墙角，窗开着，音符往外飘 ----------------
shot('s31', lineT0(24) - 0.15, (g, t, d) => {
  cam(g, 960, 540, 1.04 + t * 0.012);
  herRoom(g, t + 154, { desk: false, wallTone: 0.75, winX: 980, winW: 680, curtainSway: 1 });
  const fl = rectPath(-200, 880, 2400, 400); paperFill(g, fl); shade(g, fl, 0.8, 8, { scale: 1 });
  withSeed(10310, () => sk(g, [[-200, 880], [2200, 880]], { w: 2.4, a: 0.85 }));
  const sway = Math.sin(t * 2.2) * 2;
  figure(g, 'her', 520, 930, 6.6, P({ torso: 16 + sway, neck: 4, lF: [128, -140], lB: [122, -132], aF: [5, 78], aB: [0, 72], eyes: 'closed', mouth: 'hum', look: 0.35, hair: Math.sin(t) * 0.4 }),
    { ground: false, night: true, dim: 0.28, light: { dx: 1, dy: -0.6, a: 0.4, col: C.moonHot } });
  const ts = t + lineT0(24) - 0.15;
  const grow = smooth(chT(24, 2) - 0.3, lineT1(24) + 0.2, ts);
  const pts = []; const N = Math.floor(8 + grow * 60);
  // 从她嘴边出发，飘向开着的窗
  for (let i = 0; i < N; i++) { const u = i / 68, k = Math.min(1, u * 4); pts.push([585 + u * 720 + Math.sin(u * 8 + t * 2) * 50 * k, 700 - u * 430 + Math.cos(u * 6 + t * 1.5) * 40 * k]); }
  scribbleNotes(g, pts, t, { a: 1, rough: 6, size: 34, w: 3.4, warm: 1.1 });
  glow(g, 1320, 300, 400, C.moon, 0.18);
});
sfx(lineT0(24) - 0.15, 'hum', { dur: 4.5 });

// ---------------- S32 再大声也都是给你：音符变成纸鸟，飞过夜里的海，飞向对岸的剧场 ----------------
function paperBird(g, x, y, s, ph, o = {}) {
  const f = Math.sin(ph * 6.283);
  g.save(); g.translate(x, y); g.scale(s, s); g.rotate(o.rot ?? 0);
  const body = [[-1, 0], [0.2, -0.12], [1.1, 0.05], [0.2, 0.18]];
  const wingA = [[-0.3, 0], [0.25, -0.05], [0.1 - f * 0.1, -0.9 * f - 0.1]];
  const wingB = [[-0.2, 0.05], [0.3, 0.05], [0.25, 0.6 * f + 0.2]];
  for (const pp of [wingB, body, wingA]) { const p = pathOf(pp); erase(g, p, 1); }
  sk(g, body.concat([body[0]]), { w: 1.4 / s, a: 0.8, passes: 1, seed: o.seed ?? 1 });
  sk(g, wingA.concat([wingA[0]]), { w: 1.4 / s, a: 0.8, passes: 1, seed: (o.seed ?? 1) + 1 });
  g.restore();
  if (o.warm) glow(g, x, y, s * 2.4, C.amber, 0.25 * o.warm);
}
shot('s32', lineT0(25) - 0.15, (g, t, d) => {
  const u = t / d;
  cam(g, lerp(700, 1250, ease(u)), 470, 1.0);
  const HZ = 600;
  nightSky(g, -400, -200, 2600, HZ + 2, t + 158, { moon: [1500, 180, 64], stars: 110, clouds: [[400, 140, 600, 4, 9]] });
  moon(g, 1500, 180, 64, t);
  sea(g, -400, 2600, HZ, 1200, t + 158, { moonX: 1500, waves: 100 });
  // 左边岸上她的小屋（窗亮着），右边远处栈桥上的剧场
  withSeed(10400, () => {
    const hs = [[-300, 640], [-300, 420], [-100, 330], [100, 420], [100, 640]]; part(g, hs, { tone: 0.78, w: 2 });
    const w_ = rectPath(-60, 470, 90, 90); erase(g, w_, 1); g.save(); g.globalCompositeOperation = 'multiply'; g.fillStyle = rgba(C.amber, 0.5); g.fill(w_); g.restore(); skRect(g, -60, 470, 90, 90, { w: 2, a: 0.85 });
    glow(g, -15, 515, 160, C.amber, 0.5);
    const shore = rectPath(-420, 640, 560, 600); paperFill(g, shore); shade(g, shore, 0.85, 40);
  });
  pierSide(g, 1600, 2600, 700, t, { night: true, moonlit: true });
  g.save(); g.translate(2050, 700); g.scale(0.4, 0.4); g.translate(-675, -650); theaterFront(g, t, { night: true }); g.restore();
  // 一群纸鸟
  for (let i = 0; i < 14; i++) {
    const st = i * 0.12, p = clamp((t - st) / 3.4);
    if (p <= 0) continue;
    const x = lerp(0, 2000, p) + Math.sin(p * 9 + i) * 40, y = 520 - Math.sin(p * Math.PI) * (220 + hash(i, 1) * 120) + hash(i, 2) * 80;
    paperBird(g, x, y, 22 + hash(i, 3) * 10, t * 2.2 + i * 0.37, { warm: 0.8, seed: 10500 + i, rot: -0.1 });
    if (p < 1) sk(g, [[x - 60, y + 6], [x - 30, y + 2]], { w: 1, a: 0.3, passes: 1, seed: 10600 + i });
  }
});
sfx(lineT0(25) - 0.15, 'wings', { dur: 4 });

// ---------------- S33 请用心听 不要说话：剧场里，守夜灯下，他一个人坐在台边；一只纸鸟落在他手上，他抬头看向黑着的灯光室 ----------------
shot('s33', lineT0(26) - 0.14, (g, t, d) => {
  cam(g, 960, 540, 1.0 + t * 0.012);
  stageSet(g, t, { mode: 'night', ghost: [1250, 900], footlights: false });
  darkness(g, 0.86, [[1250, 650, 520, 420, 0.92]]);
  ghostLight(g, 1250, 900, 1.0, t);
  // 鸟从高窗飞进来，落到他手上
  const land = smooth(0.4, 2.4, t);
  const bx = lerp(1900, 1012, ease(land)), by = lerp(-80, 690, ease(land)) - Math.sin(land * Math.PI) * 120;
  const lookUp = smooth(2.8, 3.4, t);
  // 他坐在台口边上，手里拿着几张杯套
  figure(g, 'him', 900, 955, 5.0, P({ torso: 10 - lookUp * 14, neck: lerp(18, -22, lookUp), look: lerp(0.3, 0.7, lookUp), eyes: lookUp > 0.5 ? 'open' : 'down', mouth: 'line', lF: [86, -82], lB: [80, -74], aF: [lerp(30, 60, land), lerp(50, 60, land)], aB: [20, 50], hF: 'open' }),
    { ground: false, seed: 402, night: true, dim: 0.25, light: { dx: 1, dy: -0.5, a: 0.5 },
      hold: { hand: 'B', draw(g2, c) { coffeeCup(g2, c[0] + 2, c[1] + 3, 5.5, { doodle: 'spot', night: true }); } } });
  paperBird(g, bx, by, 26, land < 1 ? t * 2.2 : 0.25, { warm: 1, seed: 10700 });
  for (let i = 0; i < 4; i++) { const p = clamp((t - 0.2 - i * 0.25) / 2.6); if (p <= 0 || p >= 1) continue; paperBird(g, lerp(1950, 1300 - i * 150, p), lerp(-60, 300 + i * 40, p), 18, t * 2 + i, { warm: 0.6, seed: 10710 + i }); }
});
sfx(lineT0(26) - 0.14 + 0.4, 'wings', { dur: 2 });
