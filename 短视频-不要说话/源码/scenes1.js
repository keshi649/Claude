// scenes1.js — 前奏和第一段主歌（A1）：海边的夜，她在栈桥尽头画画；她听见女主演对他说"喜欢你"，不知道躲到哪里，就用橡皮把自己擦掉了。

// 画留在纸中间：四周盖回纸（边缘参差、柔和），像在速写本上只画了一小幅
function vignettePaper(g, cx, cy, rx, ry, seed = 1, soft = 70) {
  const T_ = BUF_T.getContext('2d');
  T_.setTransform(1, 0, 0, 1, 0, 0); T_.globalCompositeOperation = 'source-over'; T_.clearRect(0, 0, W, H);
  T_.drawImage(paperCanvas, 0, 0);
  T_.globalCompositeOperation = 'destination-out';
  const ring = (k, a) => {
    T_.globalAlpha = a; T_.beginPath();
    for (let i = 0; i <= 120; i++) {
      const th = i / 120 * 6.283;
      const r = 1 + 0.07 * (n1(th * 3.2, seed) - 0.5) * 2 + 0.035 * (n1(th * 17, seed + 1) - 0.5) * 2;
      const x = cx + Math.cos(th) * (rx * r - k), y = cy + Math.sin(th) * (ry * r - k);
      if (i) T_.lineTo(x, y); else T_.moveTo(x, y);
    }
    T_.closePath(); T_.fill();
  };
  for (let k = 0; k < 18; k++) ring(soft * (1 - k / 17) - soft * 0.2, 0.1);
  T_.globalAlpha = 1; T_.globalCompositeOperation = 'source-over';
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(BUF_T, 0, 0); g.restore();
}
// 她手里的黑铅笔
const holdPencil = (len = 13, ang = 120) => ({ hand: 'F', draw(g, c, a) { blackPencil(g, c[0] + 1.5, c[1] + 4, len, a + ang - 90 - 180, { w: len * 0.06, seed: 8101 }); } });
function lapSketchbook(page) {
  return (g, J, B) => {
    const c = add(add(J.hip, J.fw, 13), J.up, 4.5);
    sketchbook(g, c[0], c[1], 19, 13, -14, { page });
  };
}
// 速写本上画的小海景
function tinySea(g, w, h) {
  sk(g, [[-w * 0.42, 0], [w * 0.42, 0]], { w: 0.5, a: 0.7, passes: 1 });
  skEllipse(g, w * 0.18, -h * 0.22, h * 0.09, h * 0.09, { w: 0.45, a: 0.7, passes: 1 });
  for (let i = 0; i < 4; i++) sk(g, [[-w * 0.35 + i * 2.5, h * 0.12 + i * 1.3], [-w * 0.2 + i * 3, h * 0.12 + i * 1.3]], { w: 0.4, a: 0.6, passes: 1 });
}

// ---------------- S01 开头：大字问话 + 正在画画的她，夜海一笔笔画出来 ----------------
shot('s01', OFFSET, (g, t, d) => {
  cam(g, 960 + t * 6, 540, 1 + t * 0.006);
  const HZ = 610, MX = 1585, MY = 255, MR = 72;
  // 天和海从右往左画出来
  const skyP = clamp(t / 3.0), seaP = clamp((t - 0.5) / 3.0);
  g.save(); g.clip(sweepPath(2000, 560, -80, HZ + 2, ease(skyP), 7));
  nightSky(g, 500, -80, 2100, HZ + 2, t, { moon: [MX, MY, MR * smooth(1.1, 2.2, t)], stars: 46, top: 0.9, bottom: 0.64, clouds: [[1180, 170, 420, 3, 1], [1700, 420, 360, 5, 2]] });
  g.restore();
  g.save(); g.clip(sweepPath(2000, 560, HZ - 2, 1180, ease(seaP), 9));
  sea(g, 500, 2100, HZ, 1180, t, { moonX: MX, pathReveal: smooth(2.0, 3.8, t), waves: 80 });
  g.restore();
  moon(g, MX, MY, MR, t, { draw: smooth(0.3, 1.3, t), lit: smooth(1.2, 2.2, t) });
  lighthouse(g, 1890, HZ, t, { on: smooth(3.0, 4.0, t) });
  // 栈桥（最先画好的）、坐在尽头的她
  pierSide(g, 380, 1425, 700, t, { night: true, moonlit: true });
  const up = t > 4.7;
  const dr = Math.sin(t * 7.5) * 6 * (up ? 0.2 : 1);
  const lookUp = smooth(4.6, 5.3, t);
  figure(g, 'her', 1340, 697, 5.2, P({ torso: lerp(4, -3, lookUp), neck: lerp(18, -12, lookUp), look: 0.12, eyes: lookUp > 0.5 ? 'open' : 'down',
    lF: [86, -78], lB: [80, -70], fF: 8, fB: 12, aB: [38, -48], aF: [42 + dr * 0.4, 62 + dr], hF: 'hold', hB: 'open', hair: Math.sin(t * 1.3) * 0.7, mouth: 'none' }),
    { ground: false, night: true, dim: 0.3, light: { dx: 1, dy: -0.5, a: 0.35, col: C.moonHot }, hold: holdPencil(12, 105), lap: lapSketchbook(tinySea) });
  // 左边留白写字
  camReset(g);
  vignettePaper(g, 1420, 560, 700, 640, 5, 90);
  camReset(g);
  if (!COVERMODE) {
    pencilText(g, '你有没有喜欢过一个人，', 96, 352, 74, { align: 'left' });
    pencilText(g, '从来没说出口？', 96, 466, 74, { align: 'left' });
  }
});
sfx(OFFSET + 0.0, 'pencil', { dur: 3.4, gain: 0.8 });
sfx(OFFSET + 2.0, 'shimmer', { dur: 1.8 });

// ---------------- S02 海边剧场（夜） ----------------
shot('s02', bar(2), (g, t, d) => {
  const u = t / d;
  cam(g, lerp(1230, 860, ease(u)), 455, 1.1);
  const HZ = SEA.hz;
  nightSky(g, -300, -200, 2400, HZ + 2, t + 8, { stars: 70, top: 0.9, bottom: 0.6, clouds: [[200, 140, 500, 4, 3], [1500, 90, 600, 5, 4]] });
  sea(g, -300, 2400, HZ, 1100, t + 8, { waves: 70, v0: 0.7 });
  lighthouse(g, 2150, HZ, t + 8);
  pierSide(g, SEA.theaterX1 - 20, 2400, SEA.deck, t, { night: true, moonlit: true });
  // 木栈道
  pierSide(g, -300, SEA.theaterX1 + 40, SEA.deck, t, { night: true });
  theaterFront(g, t + 8, { night: true });
  lampPost(g, SEA.lampX, SEA.deck, 262, t);
  // 散场的观众：几个小小的人从大门走出来
  for (let i = 0; i < 3; i++) {
    const tt = t - i * 0.7; if (tt < 0) continue;
    const x = 675 - 30 + i * 20 - tt * (40 + i * 12) * (i % 2 ? -1 : 1);
    figure(g, i === 1 ? 'him' : 'star', x, SEA.deck, 1.55, walkPose(tt * 1.1 + i * 0.3, 0, { look: 0.1 }), { face: i % 2 ? 1 : -1, night: true, dim: 0.55, seed: 300 + i });
  }
  // 他从侧门出来，手里拿着一杯咖啡，往路灯走
  const ht = t - 1.3;
  if (ht > 0) {
    const hx = SEA.theaterX1 - 47 + ht * 62;
    figure(g, 'him', hx, SEA.deck, 1.75, walkPose(ht * 1.0, 0, { look: 0.15, aF: [40, 70], hF: 'hold' }), { night: true, dim: 0.4, light: { dx: 1, a: 0.3 }, hold: { hand: 'F', draw(g, c) { coffeeCup(g, c[0] + 1, c[1] + 3.5, 6, { night: true, doodle: 'moon' }); } } });
  }
}, { type: 'erase', d: 1.1 });
sfx(bar(2) - 0.5, 'eraser', { dur: 1.1 });
sfx(bar(2) + 1.3, 'door', {});

// ---------------- S03 片名 ----------------
function titleChars(g, s, x, y, size, t, t0, step, o = {}) {
  g.save();
  g.font = `${size}px ${FONT_HAND}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  const chars = [...s], ws = chars.map(c => g.measureText(c).width + (o.sp ?? 8));
  const total = ws.reduce((a, b) => a + b, 0);
  let cx = x - total / 2;
  chars.forEach((c, i) => {
    const p = clamp((t - t0 - i * step) / (o.dur ?? 0.45));
    const xx = cx + ws[i] / 2; cx += ws[i];
    if (p <= 0) return;
    g.save();
    g.beginPath(); g.rect(xx - ws[i] / 2 - 4, y - size * 0.7, ws[i] + 8, size * 1.4 * ease(p)); g.clip();
    if (o.erased) {
      g.fillStyle = paperStyle(g); g.globalAlpha = 0.97; g.fillText(c, xx, y);
      g.strokeStyle = graphStyle(g); g.globalAlpha = 0.35; g.lineWidth = 1.6; g.strokeText(c, xx + 2, y + 2);
    } else {
      g.fillStyle = graphStyle(g); g.globalAlpha = o.a ?? 0.92; g.fillText(c, xx, y);
    }
    g.restore();
  });
  g.restore();
}
shot('s03', bar(3), (g, t, d) => {
  cam(g, 960, 540 - t * 8, 1.04 + t * 0.012);
  const HZ = 860;
  nightSky(g, -100, -200, 2100, HZ + 2, t + 11, { moon: [1460, 250, 58], stars: 90, top: 0.92, bottom: 0.7 });
  sea(g, -100, 2100, HZ, 1300, t + 11, { moonX: 1460, waves: 60, v0: 0.78 });
  moon(g, 1460, 250, 58, t);
  camReset(g);
  titleChars(g, '不要说话', 960, 500, 196, t, 0.25, 0.42, { erased: true, sp: 26, dur: 0.5 });
  titleChars(g, '陈奕迅', 960, 676, 46, t, 2.1, 0.12, { erased: true, sp: 14, dur: 0.3 });
}, { type: 'smudge', d: 0.8 });
sfx(bar(3) + 0.25, 'eraser', { dur: 1.9, gain: 0.7 });

// ---------------- S04 特写：她的侧脸，月光，从速写本上抬起眼睛 ----------------
shot('s04', bar(4), (g, t, d) => {
  cam(g, 960, 540, 1.0 + t * 0.018);
  // 背景：夜空和远处的海
  nightSky(g, -100, -100, 2100, 760, t + 15, { moon: [1700, 120, 50], stars: 40, top: 0.9, bottom: 0.66 });
  sea(g, -100, 2100, 760, 1300, t + 15, { moonX: 1700, waves: 50 });
  const up = smooth(1.2, 2.0, t);
  const bl = Math.max(0, 1 - Math.abs(t - 2.7) / 0.09);
  herClose(g, 820, 560, 600, { tilt: lerp(9, -3, up), eyes: up < 0.3 ? 'down' : 'open', look: lerp(-1, 0.4, up), blink: bl, hair: Math.sin(t * 1.1) * 1.2, moon: 1, mouth: 'closed' });
  // 月光从右边来
  glow(g, 1500, 300, 700, C.moon, 0.18);
}, { type: 'smudge', d: 0.7 });

// ---------------- S05 深色的海面布满白色的月光 ----------------
shot('s05', bar(5), (g, t, d) => {
  const u = t / d;
  cam(g, 960, lerp(330, 760, ease(u)), 1.0);
  const HZ = 640, MX = 960, MY = 170;
  nightSky(g, -100, -400, 2100, HZ + 2, t + 18, { moon: [MX, MY, 66], stars: 120, top: 0.92, bottom: 0.62, clouds: [[420, 60, 560, 4, 7], [1500, 250, 420, 6, 8]] });
  moon(g, MX, MY, 66, t);
  sea(g, -100, 2100, HZ, 1500, t + 18, { moonX: MX, waves: 110, v0: 0.78, v1: 0.94, pathN: 320 });
  // "布满"：月光从光路往两边铺开，整片海都有了碎光
  const spread = smooth(lineT0(0) + 2.1, lineT0(0) + 4.6, t + bar(5));
  if (spread > 0) {
    for (let i = 0; i < 420; i++) {
      const y = HZ + 6 + Math.pow(hash(i, 71), 1.4) * 860, side = hash(i, 72) < 0.5 ? -1 : 1;
      const reach = 60 + (y - HZ) * 0.5 + spread * 1100 * hash(i, 73);
      const x = MX + side * reach * hash(i, 74);
      const a = clamp(spread * 1.3 - Math.abs(x - MX) / 1300) * (0.4 + 0.6 * Math.abs(Math.sin(t * (1 + hash(i, 75) * 2) + i)));
      if (a < 0.05) continue;
      const len = (4 + (y - HZ) * 0.08) * (0.5 + hash(i, 76));
      eraseStroke(g, [[x - len / 2, y], [x + len / 2, y]], 1.2 + (y - HZ) * 0.008, a * 0.8);
    }
  }
  // 栈桥的尽头和她（小小的，在右下）
  pierSide(g, 1100, 1560, 1180, t, { night: true, moonlit: true });
  figure(g, 'her', 1520, 1177, 2.6, P({ lF: [86, -78], lB: [80, -70], aF: [40, 50], aB: [38, -48], look: 0.1, neck: -8, hair: Math.sin(t * 1.2) * 0.6 }), { ground: false, night: true, dim: 0.35, lap: lapSketchbook(tinySea) });
});
sfx(bar(5), 'wavesSoft', { dur: 7 });

// ---------------- S06 我出神望着海，心不知飞哪去 ----------------
shot('s06', bar(7), (g, t, d) => {
  cam(g, 960 - t * 6, 540, 1.02 + t * 0.006);
  const HZ = 470;
  nightSky(g, -100, -100, 2100, HZ + 2, t + 25, { moon: [1640, 150, 60], stars: 60, top: 0.9, bottom: 0.64 });
  moon(g, 1640, 150, 60, t);
  sea(g, -100, 2100, HZ, 1200, t + 25, { moonX: 1640, waves: 90 });
  pierSide(g, -100, 1180, 720, t, { night: true, moonlit: true });
  const ts = t + bar(7);
  figure(g, 'her', 1060, 717, 6.4, P({ torso: -2, neck: -6, lF: [86, -80], lB: [80, -72], fF: 6, fB: 10, aF: [36, 46], aB: [40, -44], hF: 'open', look: 0.15, eyes: 'half', hair: Math.sin(t * 1.1) * 0.8 }),
    { ground: false, night: true, dim: 0.28, light: { dx: 1, dy: -0.4, a: 0.32, col: C.moonHot }, lap: lapSketchbook(tinySea) });
  // 心从胸口飘出来，往左边（剧场那边）飞走
  const h0 = chT(1, 6) - 0.25;          // "心"
  const hp = ts - h0;
  if (hp > 0) {
    const x = 1110 - hp * 150 - Math.pow(Math.max(0, hp - 1), 2) * 60, y = 500 - hp * 70 + Math.sin(hp * 2.4) * 22;
    paperHeart(g, x, y, 34 + Math.min(1, hp) * 6, Math.sin(hp * 2.2) * 18, { warm: smooth(0, 0.6, hp) });
  }
});
sfx(chT(1, 6) - 0.25, 'heartOut', {});

// ---------------- S07 听到她在告诉你 ----------------
shot('s07', lineT0(2) - 0.2, (g, t, d) => {
  cam(g, 960 + t * 8, 540, 1.0);
  boardwalkNight(g, t + 31, { lampX: 1240, wallX: 380 });
  const ts = t + lineT0(2) - 0.2;
  // 女主演（朝右），他（朝左，拿着咖啡）
  const talk = Math.sin(t * 9) > 0 && t > 0.3 && t < 3.2;
  figure(g, 'star', 800, 880, 4.6, P({ torso: 6, neck: 4, look: 0.45, aF: [-30, -40], aB: [-35, -30], hF: 'fist', hB: 'fist', mouth: talk ? 'open' : 'line', blush: 0.6, hair: Math.sin(t) * 0.3 }),
    { night: true, dim: 0.22, light: { dx: 1, dy: -0.6, a: 0.5 } });
  figure(g, 'him', 1180, 880, 4.6, P({ look: 0.4, aF: [30, 80], hF: 'hold', aB: [-4, 10], mouth: 'line', eyes: t > 1.5 ? 'wide' : 'open' }),
    { face: -1, night: true, dim: 0.22, light: { dx: -1, dy: -0.6, a: 0.5 }, hold: { hand: 'F', draw(g, c) { coffeeCup(g, c[0] + 1, c[1] + 3.5, 6.5, { night: true, doodle: 'moon' }); } } });
  // 她说的话：泡泡里画了一颗心
  const bp = smooth(0.35, 0.65, t);
  if (bp > 0) {
    g.save(); g.globalAlpha = bp;
    bubble(g, 760, 330, 230 * bp + 20, 130 * bp + 12, 820, 430, { inside: (g, x, y) => { doodle(g, 'heart', x - 30, y, 30); pencilText(g, '……', x + 40, y + 6, 32); } });
    g.restore();
  }
  // 她的纸心飘进来，停在半空
  const hx = lerp(2050, 1010, easeOut(clamp(t / 2.4))), hy = 210 + Math.sin(t * 2) * 16;
  paperHeart(g, hx, hy, 36, Math.sin(t * 2.3) * 14, { warm: 0.8 });
});
sfx(lineT0(2) + 0.2, 'bubble', {});

// ---------------- S08 说她真的喜欢你 ----------------
shot('s08', lineT0(3) - 0.15, (g, t, d) => {
  cam(g, 980, 520, 1.55 + t * 0.03);
  boardwalkNight(g, t + 35, { lampX: 1240, wallX: 380 });
  const give = smooth(0.2, 0.9, t);
  figure(g, 'star', 840, 880, 4.6, P({ torso: lerp(6, 22, give), neck: lerp(4, 12, give), look: 0.4, aF: [lerp(-30, 70, give), lerp(-40, 10, give)], aB: [lerp(-35, 65, give), lerp(-30, 15, give)], hF: 'hold', hB: 'hold', eyes: 'closed', mouth: 'line', blush: 1 }),
    { night: true, dim: 0.2, light: { dx: 1, dy: -0.6, a: 0.5 }, hold: { hand: 'F', draw(g, c, a) { envelope(g, c[0] + 4, c[1] - 1, 11, 7.5, -8 - a * 0.1); } } });
  figure(g, 'him', 1180, 880, 4.6, P({ torso: -4, neck: -6, look: 0.45, aF: [30, 80], hF: 'hold', aB: [-4, 10], mouth: 'o', eyes: 'wide', brows: 1 }),
    { face: -1, night: true, dim: 0.2, light: { dx: -1, dy: -0.6, a: 0.5 }, hold: { hand: 'F', draw(g, c) { coffeeCup(g, c[0] + 1, c[1] + 3.5, 6.5, { night: true, doodle: 'moon' }); } } });
  // 纸心在头顶发抖，然后往下掉、皱起来
  const ts = t + lineT0(3) - 0.15, fall = smooth(chT(3, 5) - 0.1, chT(3, 6) + 0.6, ts);
  const hx = 1010 + Math.sin(t * 30) * 3 * (1 - fall) - fall * 60, hy = 230 + fall * fall * 760;
  paperHeart(g, hx, hy, 36, Math.sin(t * 30) * 4 + fall * 140, { warm: 0.8 * (1 - fall), crumple: fall });
});
sfx(chT(3, 5) - 0.1, 'paperFall', {});

// ---------------- S09 我不知该……躲哪里：拿速写本挡脸，最后用橡皮把自己擦掉 ----------------
function erasedLayer(g, draw, y0, y1, p, o = {}) {
  // 把 draw 画到一张透明画布上，从 y0 往 y1 擦掉 p 那么多（边缘参差），再贴回来
  const F = BUF_F.getContext('2d');
  F.setTransform(1, 0, 0, 1, 0, 0); F.globalCompositeOperation = 'source-over'; F.clearRect(0, 0, W, H);
  F.setTransform(g.getTransform());
  draw(F);
  F.setTransform(1, 0, 0, 1, 0, 0);
  if (p > 0) {
    const yy = lerp(y0, y1, p);
    F.globalCompositeOperation = 'destination-out';
    F.beginPath(); F.moveTo(-10, -10);
    for (let x = -10; x <= W + 10; x += 16) F.lineTo(x, yy + (n1(x / 40, 7) - 0.5) * 40 + Math.sin(x / 9 + p * 30) * 6);
    F.lineTo(W + 10, -10); F.closePath(); F.fill();
    // 擦过的边上淡一点
    F.globalAlpha = 0.5; F.fillRect(0, yy + 18, W, 30); F.globalAlpha = 1;
    F.globalCompositeOperation = 'source-over';
  }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.drawImage(BUF_F, 0, 0); g.restore();
  return lerp(y0, y1, p);
}
shot('s09a', lineT0(4) - 0.18, (g, t, d) => {
  cam(g, 960, 540, 1.0);
  const HZ = 500;
  nightSky(g, -100, -100, 2100, HZ + 2, t + 39, { moon: [1500, 140, 56], stars: 60 });
  moon(g, 1500, 140, 56, t);
  sea(g, -100, 2100, HZ, 1200, t + 39, { moonX: 1500, waves: 80 });
  // 远处左边：路灯下的两个人
  pierSide(g, -100, 1500, 860, t, { night: true, moonlit: true });
  lampPost(g, 240, 860, 230, t, { size: 0.8 });
  figure(g, 'star', 200, 860, 1.55, P({ torso: 18, aF: [70, 10], aB: [65, 15], hF: 'hold', look: 0.3 }), { night: true, dim: 0.3, seed: 77 });
  figure(g, 'him', 300, 860, 1.55, P({ look: 0.3, aF: [30, 80], hF: 'hold' }), { face: -1, night: true, dim: 0.3, seed: 78 });
  // 她站起来了：东张西望，拿速写本挡住脸
  const ph = t;
  const look = Math.sin(ph * 5.5) > 0 ? 1 : -1;
  const hide = smooth(1.6, 2.1, t);
  const hop = Math.abs(Math.sin(ph * 7)) * 3 * (1 - hide);
  figure(g, 'her', 1290, 860 - hop, 5.0, P({ torso: lerp(3, -2, hide), neck: look * 6 * (1 - hide), look: lerp(0.5, 0.2, hide), eyes: 'wide', mouth: 'o', brows: 1, blush: 0.7,
    aF: [lerp(20, 62, hide), lerp(40, 92, hide)], aB: [lerp(-20, 58, hide), lerp(30, 96, hide)], hF: 'hold', hB: 'hold', lF: [6, -4], lB: [-6, -4] }),
    { night: true, dim: 0.3, face: t < 1.6 ? look : 1, light: { dx: 1, dy: -0.5, a: 0.3, col: C.moonHot },
      hold: { hand: 'F', draw(g, c) { if (hide > 0.3) sketchbook(g, c[0] + 1, c[1] - 2, 16, 12, -6, { page: tinySea }); } } });
});
sfx(lineT0(4) - 0.1, 'gasp', {});
shot('s09b', chT(4, 4) - 0.25, (g, t, d) => {
  cam(g, 1180, 560, 1.32);
  const HZ = 500;
  nightSky(g, -100, -100, 2100, HZ + 2, t + 42, { moon: [1500, 140, 56], stars: 60 });
  moon(g, 1500, 140, 56, t);
  sea(g, -100, 2100, HZ, 1200, t + 42, { moonX: 1500, waves: 80 });
  pierSide(g, -100, 1500, 860, t, { night: true, moonlit: true });
  lampPost(g, 240, 860, 230, t, { size: 0.8 });
  const turn = smooth(3.3, 3.8, t);
  figure(g, 'him', 300, 860, 1.55, P({ look: lerp(0.3, 0.6, turn), aF: [30, 80], hF: 'hold', neck: -turn * 4 }), { face: turn > 0.5 ? 1 : -1, night: true, dim: 0.3, seed: 78 });
  // 拿出耳朵上的铅笔，倒过来，用橡皮从头往下把自己擦掉
  const er = smooth(0.7, 2.4, t);
  const pose = P({ torso: 2, neck: 8, look: 0.3, eyes: 'closed', mouth: 'line', blush: 0.5, aF: [150 - er * 20, 30 + Math.sin(t * 22) * 12 * (er > 0 && er < 1 ? 1 : 0)], aB: [10, 20], hF: 'hold', lF: [4, -3], lB: [-4, -3] });
  const yTop = 860 - 5 * 98, yBot = 870;
  let edge = 0;
  if (er < 1) edge = erasedLayer(g, F => {
    figure(F, 'her', 1290, 860, 5.0, pose, { night: true, dim: 0.3, noPencil: true, light: { dx: 1, dy: -0.5, a: 0.3, col: C.moonHot },
      hold: { hand: 'F', draw(F2, c, a) { blackPencil(F2, c[0] - 2, c[1] - 9, 13, a - 90 + 180 + 10, { w: 0.8, seed: 8101 }); } } });
  }, yTop, yBot, er);
  // 橡皮屑：从擦过的边上掉下来
  for (let i = 0; i < 26; i++) {
    const st = 0.7 + hash(i, 81) * 1.7, age = t - st;
    if (age < 0 || age > 2.2) continue;
    const x = 1290 + (hash(i, 82) - 0.5) * 120 + age * 30 * (hash(i, 83) - 0.3), y = lerp(yTop, yBot, clamp((st - 0.7) / 1.7)) + age * age * 120;
    g.save(); g.globalAlpha = 1 - age / 2.2; g.fillStyle = rgba([110, 106, 100], 0.8); g.beginPath(); g.ellipse(x, y, 4 + hash(i, 84) * 4, 2.2, hash(i, 85) * 3, 0, 6.283); g.fill(); g.restore();
  }
  // 铅笔掉在桥面上，滚一下
  if (er >= 1) {
    const ft = t - 2.4, fall = clamp(ft / 0.35);
    const px = 1300 + Math.min(ft, 1.2) * 18, py = lerp(700, 852, fall * fall);
    blackPencil(g, px, py, 64, fall < 1 ? 200 + ft * 300 : 178 + Math.sin(ft * 9) * 4 * Math.exp(-ft * 3), { w: 3.6, seed: 8101 });
    glow(g, px + 30, py, 60, C.moonHot, 0.15);
  }
});
sfx(chT(4, 4) + 0.45, 'eraser', { dur: 1.7 });
// 特写：桥面上的黑铅笔，橡皮屑，月光；远处的他回过头来
shot('s09c', bar(12) + 1.55, (g, t, d) => {
  cam(g, 960, 540, 1.0 + t * 0.02);
  const HZ = 300;
  nightSky(g, -100, -100, 2100, HZ + 2, t + 45, { stars: 30, top: 0.86, bottom: 0.7 });
  sea(g, -100, 2100, HZ, 760, t + 45, { waves: 50, moonX: 1500, pathA: 0.6 });
  // 近处的桥面（俯一点看，木板一条条）
  const deck = new Path2D(); deck.moveTo(-100, 640); deck.lineTo(2100, 600); deck.lineTo(2100, 1200); deck.lineTo(-100, 1200); deck.closePath();
  paperFill(g, deck); shade(g, deck, 0.5, 2);
  withSeed(9300, () => { for (let k = 0; k < 7; k++) { const y = 640 + k * k * 11 + k * 20; sk(g, [[-100, y], [2100, y - 40 + k * 5]], { w: 1.6, a: 0.55 }); } sk(g, [[-100, 640], [2100, 600]], { w: 2.6, a: 0.9 }); });
  eraseStroke(g, [[-100, 643], [2100, 603]], 3, 0.5);
  // 远处：路灯和他（小小的），他回头
  lampPost(g, 380, 618, 150, t, { size: 0.6 });
  figure(g, 'him', 430, 616, 1.05, P({ look: 0.7, aF: [30, 80], hF: 'hold', neck: -4 }), { face: t > 0.6 ? 1 : -1, night: true, dim: 0.35, seed: 78 });
  // 铅笔和橡皮屑
  blackPencil(g, 820, 905, 520, 184, { w: 22, seed: 8101 });
  glow(g, 1080, 890, 380, C.moonHot, 0.16);
  for (let i = 0; i < 40; i++) {
    const x = 760 + hash(i, 91) * 640, y = 880 + (hash(i, 92) - 0.3) * 120, r = 3 + hash(i, 93) * 7;
    g.save(); g.fillStyle = rgba([118, 112, 106], 0.75); g.beginPath(); g.ellipse(x, y, r, r * 0.55, hash(i, 94) * 3, 0, 6.283); g.fill(); g.restore();
    erase(g, circlePath(x - r * 0.3, y - r * 0.2, r * 0.35), 0.6);
  }
});
sfx(chT(4, 4) - 0.25 + 2.4 + 0.35, 'pencilDrop', {});
