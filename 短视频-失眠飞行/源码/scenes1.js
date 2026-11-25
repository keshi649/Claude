'use strict';
/* scenes1.js：开头（她的卧室，凌晨三点）和主歌 A 第一遍（她的失眠飞行）。
   时间都是歌曲时间 s；bar(n) 是第 n 小节的强拍。 */

/* ---------- 开头：凌晨三点，你也还没睡吗？ ----------
   第一帧就有大字和在动的人：她睁着眼躺着，钟停在 03:07。
   1.4 秒起东西开始漂起来，玩偶的眼睛亮了；2.6 秒窗户被风推开；3 秒床浮起来，她坐起来；
   第 2 小节强拍（视频 3.9 秒）冲出窗外。 */
function sHook(g, s, k) {
  const T = s - TRIM;                        // 视频时间
  const fl = E.out(seg(T, 1.3, 3.4));
  const open = E.io(seg(T, 2.4, 3.0));
  const wind = seg(T, 2.35, 2.9) * (.8 + .2 * Math.sin(s * 5));
  const sit = seg(T, 2.85, 3.45);
  const lift = E.out(seg(T, 2.8, 3.6)) * 60 + E.in(seg(T, 3.4, 4.2)) * 120;
  const bedDX = E.in(seg(T, 3.3, 4.2)) * 520;
  // 镜头：慢慢推近，最后朝窗户冲过去
  const z = 1.06 + T * .018 + E.in(seg(T, 2.9, 4.1)) * .3;
  const cx = lerp(930, 1300, E.io(seg(T, 2.6, 4.1))), cy = lerp(560, 470, E.io(seg(T, 2.6, 4.1)));
  const [dx, dy] = drift(s, 4, 3);
  g.save();
  g.translate(W / 2 + dx, H / 2 + dy); g.scale(z, z); g.translate(-cx, -cy);
  // 眨眼：0.9 秒、2.0 秒
  const blink = [0.9, 2.0].some(b => T > b && T < b + .13);
  herRoom(g, s, { T, open, wind, float: fl, sit, lift, bedDX, beam: .55 + fl * .3, plush: E.out(seg(T, 1.25, 1.8)), eyes: blink ? 'closed' : (sit > .3 ? 'wide' : 'open'), mouth: sit > .4 ? 'o' : 'n', clock: '03:07' });
  g.restore();
  // 风吹进来的光线
  if (wind > 0) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 14; i++) {
      const y = 180 + hash(i, 4) * 700, sp = 900 + hash(i, 5) * 900, len = 120 + hash(i, 6) * 220;
      const x = 1500 - ((T - 2.4) * sp + hash(i, 7) * 900) % 1900;
      g.strokeStyle = lgrad(g, x, y, x + len, y, [[0, 'rgba(200,215,255,0)'], [1, `rgba(200,215,255,${.22 * wind})`]]);
      g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + len / 2, y - 12, x + len, y); g.stroke();
    }
    g.restore();
  }
  // 大字：第一帧就在；3.1 秒起化成光点往窗外飞
  hookText(g, s, T);
}
function hookText(g, s, T) {
  const out = seg(T, 3.05, 3.75);
  if (out >= 1) return;
  const lines = [['凌晨三点，', 150, 'serifX', 168, 300, 10], ['你也还没睡吗？', 92, 'kai', 172, 452, 8]];
  for (const [str, px, k, x0, y0, ls] of lines) {
    let x = x0;
    [...str].forEach((ch, i) => {
      const cw = tw(g, ch, px, k, 0) + ls;
      const d = clamp(out * 1.6 - i * .06 - (y0 > 400 ? .15 : 0));
      const a = 1 - E.in(d);
      if (a > .01) {
        const fx = x + E.in(d) * (900 + i * 40), fy = y0 - E.in(d) * (120 + hash(i, y0) * 160);
        const breathe = .55 + .15 * Math.sin(s * 2.4);
        text(g, ch, fx + cw / 2, fy, px, { k, col: '#FFFFFF', alpha: a, glow: '#8FA8FF', gr: px * .45, ga: breathe * a, shadow: 'rgba(10,8,40,.6)', sblur: 18 });
        if (d > 0) glow(g, fx + cw / 2, fy, px * 1.2, '#CFD9FF', d * a * .8);
      }
      x += cw;
    });
  }
  // 小字：右下角的时间戳
  text(g, '03:07 AM', 176, 534, 30, { k: 'sans', align: 'left', col: 'rgba(200,210,255,.75)', ls: 6, alpha: 1 - out });
}


/* ---------- 第 2 小节：想要和你低空飞行 ----------
   床冲出窗外，贴着屋顶飞。片名在天上亮起来。 */
function sLowFly(g, s, k) {
  const x = 2000 + k * 950;
  const [dx, dy] = drift(s, 5, 7);
  g.save(); g.translate(dx, dy);
  flightBg(g, s, { x, moon: [1640, 210, 108], roofs: true, roofDY: 150, cloudA: .55, cloudY: 600 });
  // 风
  speedLines(g, s, 18, .2);
  const by = 590 + Math.sin(s * 2.6) * 10;
  flyingBed(g, s, 700, by + 20, .74, { plush: PLUSH.pink, hugPlush: true, eyes: k < 1.2 ? 'wide' : 'happy', mouth: k < 1.2 ? 'o' : 'smile', plushEyes: 'glow', plushGlow: .8, rot: -.04 + Math.sin(s * 2.1) * .015 });
  g.restore();
  titleCard(g, s, k);
}
function speedLines(g, s, n, a = .25, col = '200,215,255') {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const y = 80 + hash(i, 40) * 900, sp = 1600 + hash(i, 41) * 1600, len = 140 + hash(i, 42) * 300;
    const x = W + 200 - ((s * sp + hash(i, 43) * 3000) % (W + 600));
    g.strokeStyle = lgrad(g, x, y, x + len, y, [[0, `rgba(${col},${a})`], [1, `rgba(${col},0)`]]);
    g.lineWidth = 1.5 + hash(i, 44) * 1.5; g.beginPath(); g.moveTo(x, y); g.lineTo(x + len, y); g.stroke();
  }
  g.restore();
}
/* 片名：失眠飞行 */
function titleCard(g, s, k) {
  const out = 1 - seg(k, 2.0, 2.5);
  if (out <= 0) return;
  const chars = [...'失眠飞行'], px = 168, ls = 46, cx = 900, cy = 260;
  const wsum = chars.length * px + (chars.length - 1) * ls;
  chars.forEach((ch, i) => {
    const t0 = .08 + i * .13, u = seg(k, t0, t0 + .5);
    if (u <= 0) return;
    const e = E.out(u), x = cx - wsum / 2 + px / 2 + i * (px + ls);
    g.save();
    if (u < 1) g.filter = `blur(${((1 - e) * 10).toFixed(1)}px)`;
    text(g, ch, x, cy + (1 - e) * 24, px, { k: 'kai', col: '#FFFFFF', alpha: e * out, sc: 1.18 - .18 * e, glow: '#FFB8DA', gr: 44, ga: .75 * out, shadow: 'rgba(20,10,50,.6)', sblur: 24 });
    g.restore();
    if (u < 1) glow(g, x, cy, 180, '#FFE3F2', (1 - u) * .8);
  });
  const a2 = E.out(seg(k, .7, 1.2)) * out;
  text(g, 'I N S O M N I A   F L I G H T', cx, cy + 128, 26, { k: 'serif', col: '#E6E2FF', alpha: a2 * .9, ls: 4 });
  text(g, '接个吻，开一枪 · 沈以诚 · 薛黛霏', cx, cy + 178, 30, { k: 'kai', col: '#CFCBEF', alpha: E.out(seg(k, .9, 1.4)) * out * .9, ls: 3 });
}

/* ---------- 第 3 小节：和你到处收集氧气 ----------
   城市的灯虚成光斑，一串串发光的泡泡从下面升上来。她捧着玻璃罐去接，接到一个罐子就亮一点。 */
const OXY_CATCH = [.35, .95, 1.55];
function sOxygen(g, s, k) {
  g.fillStyle = vgrad(g, 0, H, [[0, '#0B0F33'], [.6, '#1D1F55'], [1, '#3A2D6A']]); g.fillRect(0, 0, W, H);
  stars(g, s, 600, 0, .5, .6);
  bokeh(g, s, 5, 70, ['#FFC274', '#FFD8A8', '#9FC4FF', '#E8B8FF'], { y0: 560, y1: 1100, rmin: 14, rmax: 56, a: .32, vx: 30 });
  bokeh(g, s, 6, 30, ['#FFC274', '#9FC4FF'], { y0: 300, y1: 700, rmin: 8, rmax: 24, a: .2, vx: 14 });
  // 升起来的泡泡
  for (let i = 0; i < 26; i++) {
    const r = 12 + hash(i, 50) * 38, sp = 70 + hash(i, 51) * 90;
    const y = H + 80 - ((k * sp + hash(i, 52) * 1300) % (H + 160));
    const x = hash(i, 53) * W + Math.sin(s * 1.3 + i) * 30;
    bubble(g, x, y, r, .85, s);
  }
  const bx = 720, by = 650 + Math.sin(s * 2.4) * 8;
  const caught = OXY_CATCH.filter(t => k > t + .45).length;
  // 罐子拿在手里
  flyingBed(g, s, bx, by, .9, {
    plush: PLUSH.pink, eyes: 'happy', mouth: 'smile', plushEyes: k > 1.25 && k < 1.6 ? 'happy' : 'glow', plushGlow: .6, wind: .5, trail: false,
    pose: { tilt: .12, head: .12, aN: [1.05, .55], aF: [.95, .65], lN: [1.5, -1.45], lF: [1.45, -1.5] },
  });
  const hx = bx + (-150 + 46 * 2.7) * .9, hy = by + (8 - 46 * 1.75) * .9;
  jar(g, hx + 30, hy + 40, .9, .25 + caught * .25, s);
  // 正在被接住的泡泡：从旁边飘进罐口
  OXY_CATCH.forEach((t0, i) => {
    const u = seg(k, t0, t0 + .45); if (u <= 0 || u >= 1) { if (u >= 1 && k < t0 + .7) glow(g, hx + 30, hy - 80, 120, '#DFF6FF', (1 - (k - t0 - .45) / .25) * .8); return; }
    const sx = hx + 30 + [-260, 240, -180][i], sy = hy - [300, 260, 340][i];
    const e = E.io(u), x = lerp(sx, hx + 30, e), y = lerp(sy, hy - 70, e) - Math.sin(Math.PI * e) * 60;
    bubble(g, x, y, 34 * (1 - e * .6), 1, s);
  });
  // 玩偶戳破一个泡泡
  const pu = seg(k, 1.15, 1.35);
  if (pu > 0 && pu < 1) bubble(g, bx + 135 * .9, by - 120 + pu * 30, 26, 1 - pu, s);
  if (k > 1.33 && k < 1.7) sparkleBurst(g, bx + 135 * .9, by - 95, (k - 1.33) / .37, '#BFF0FF');
}
/* 一圈散开的小星光 */
function sparkleBurst(g, x, y, u, col = '#FFFFFF', n = 10, R0 = 70) {
  if (u <= 0 || u >= 1) return;
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + .3, d = E.out(u) * R0 * (.7 + hash(i, 9) * .5);
    const px = x + Math.cos(a) * d, py = y + Math.sin(a) * d, al = 1 - u;
    g.fillStyle = rgba(col, al); star4(g, px, py, 7 * (1 - u * .5)); glow(g, px, py, 16, col, al * .6);
  }
}
function star4(g, x, y, r) { g.beginPath(); g.moveTo(x, y - r); g.quadraticCurveTo(x, y, x + r, y); g.quadraticCurveTo(x, y, x, y + r); g.quadraticCurveTo(x, y, x - r, y); g.quadraticCurveTo(x, y, x, y - r); g.fill(); }

/* ---------- 第 4 小节：假如迷雾你看不清 ----------
   床飞进雾里，灯都化成一团一团的光。雾的深处有个人站在楼顶上，一下就看不见了。 */
function sFog(g, s, k) {
  const x = 6000 + k * 420;
  flightBg(g, s, { x, moon: [1500, 200, 90], cloudA: .4, roofs: true, roofDY: 170, moonHalo: .9 });
  const thick = .25 + E.io(seg(k, 0, 2.3)) * .55;
  // 远处楼顶上的他（剪影，背后一盏灯）
  const hv = win(k, .3, 1.9, .3, .45);
  if (hv > 0) {
    glow(g, 1450, 560, 260, '#FFD9A0', hv * .8);
    g.fillStyle = rgba('#0B0D25', hv); g.fillRect(1330, 668, 260, 40); g.fillRect(1520, 520, 8, 150);
    glow(g, 1524, 516, 40, '#FFE2B0', hv); g.fillStyle = rgba('#FFE9C4', hv); circ(g, 1524, 516, 7); g.fill();
    person(g, { who: 'he', x: 1450, y: 600, u: 22, face: -1, pose: POSE.stand, t: s, light: LIGHT.sil, alpha: hv });
  }
  fogLayer(g, s, '#AEB4E2', 300, 1000, thick * .45, 30, 0, 2.4);
  // 雾里化开的灯
  bokeh(g, s, 9, 26, ['#FFD8A8', '#C9D6FF'], { y0: 500, y1: 1000, rmin: 30, rmax: 90, a: .16 * thick, vx: 50 });
  const bx = 820, by = 600 + Math.sin(s * 2.2) * 9;
  flyingBed(g, s, bx, by, .55, { plush: PLUSH.pink, eyes: hv > .3 ? 'wide' : 'half', mouth: 'n', plushEyes: 'glow', plushGlow: .5, wind: .6,
    pose: { tilt: .05, head: -.1, aN: [2.3, 1.4], aF: [.4, .8], lN: [1.5, -1.45], lF: [1.45, -1.5] } });
  fogLayer(g, s, '#C2C7EC', 0, H, thick * .7, 55, 1, 2.0);
  g.fillStyle = `rgba(178,184,226,${thick * .45})`; g.fillRect(0, 0, W, H);
}

/* ---------- 第 5 小节：不如坠入我的心里 ----------
   往下看：她从雾里掉下去，下面的城市灯火连成一个心形的湖，越来越近。 */
function sFall(g, s, k) {
  const z = 1 + E.in(seg(k, 0, 2.5)) * 2.4;
  heartCity(g, s, z, .1 - k * .04);
  // 往上掠过的云
  for (let i = 0; i < 8; i++) {
    const w = 900 + hash(i, 70) * 600, y = H + 400 - ((k * (900 + hash(i, 71) * 700) + hash(i, 72) * 1600) % (H + 900));
    cloud(g, i + 3, hash(i, 73) * W, y, w, CLOUD.nightL, .45);
  }
  // 她：头朝下，张开手，头发往上飘
  const fx = 900 + Math.sin(s * 1.7) * 30, fy = 330 + Math.sin(s * 2.3) * 14;
  person(g, { who: 'she', x: fx, y: fy, u: 42, face: 1, rot: Math.PI * .92 + Math.sin(s * 1.5) * .08, pose: { tilt: .1, head: -.3, aN: [2.1, .3], aF: [1.7, .4], lN: [.25, -.6], lF: [-.1, -.3] }, t: s, eyes: 'closed', mouth: 'smile', blush: .8, wind: [0, 2.2], light: LIGHT.dream });
  plush(g, { x: fx + 210, y: fy - 60, s: 6.5, col: PLUSH.pink, eyes: 'glow', glow: .8, tilt: s * 1.5 });
  speedLinesV(g, s, 22, .22);
}
function speedLinesV(g, s, n, a) {
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const x = hash(i, 80) * W, sp = 1800 + hash(i, 81) * 1500, len = 160 + hash(i, 82) * 260;
    const y = H + 200 - ((s * sp + hash(i, 83) * 3000) % (H + 500));
    g.strokeStyle = lgrad(g, x, y, x, y + len, [[0, `rgba(220,215,255,${a})`], [1, 'rgba(220,215,255,0)']]);
    g.lineWidth = 2; g.beginPath(); g.moveTo(x, y); g.lineTo(x, y + len); g.stroke();
  }
  g.restore();
}

/* ---------- 第 6 小节：想带你从吵闹到安宁 ----------
   左边是霓虹、车灯、喇叭声，右边是月亮下的湖。中间那条光一路往左推，床飞进安静的那一边。 */
function sCalm(g, s, k) {
  const bxl = lerp(1650, 90, E.io(seg(k, .15, 2.35)));
  g.save(); g.beginPath(); g.rect(0, 0, bxl, H); g.clip();
  neonStreet(g, s, { x: k * 300 });
  // 拟声字
  [['嘀——', 300, 300, .1], ['叭叭!', 900, 220, .45], ['吵', 560, 520, .8], ['哔——', 1250, 360, 1.05], ['轰', 160, 640, 1.3]].forEach(([w, x, y, t0], i) => {
    const u = seg(k, t0, t0 + .35); if (u <= 0) return;
    text(g, w, x + Math.sin(s * 30 + i) * 3, y, 70 + i * 6, { k: 'brush', col: '#FFF3A0', alpha: Math.min(1, u * 3) * (1 - seg(k, t0 + .7, t0 + .9)), sc: .6 + E.back(u) * .4, rot: (hash(i, 3) - .5) * .5, glow: '#FF4FA8', gr: 20 });
  });
  g.restore();
  g.save(); g.beginPath(); g.rect(bxl, 0, W - bxl, H); g.clip();
  calmLake(g, s, { moonX: 1320, reedX: 1150 });
  g.restore();
  // 分界的光
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = lgrad(g, bxl - 60, 0, bxl + 60, 0, [[0, 'rgba(255,210,240,0)'], [.5, 'rgba(255,230,250,.7)'], [1, 'rgba(255,210,240,0)']]); g.fillRect(bxl - 60, 0, 120, H);
  g.restore();
  for (let i = 0; i < 12; i++) { const y = (hash(i, 90) * H + s * 80) % H; glow(g, bxl + (hash(i, 91) - .5) * 30, y, 18, '#FFE6F6', .8); }
  // 床从左往右飞
  const bxp = lerp(380, 1180, E.io(seg(k, 0, 2.5))), calm = bxp > bxl ? 1 : 0;
  flyingBed(g, s, bxp, 500 + Math.sin(s * 2.4) * 8, .56, { plush: PLUSH.pink, hugPlush: true, eyes: calm ? 'closed' : 'half', mouth: calm ? 'smile' : 'n', plushEyes: calm ? 'happy' : 'n', wind: .5, light: calm ? LIGHT.moon : LIGHT.dream });
}

/* ---------- 第 7 小节：想带你从多云到转晴 ----------
   头顶压着厚厚的云。她举起手，云往两边散开，月亮和银河露出来。 */
function sClear(g, s, k) {
  const open = E.io(seg(k, .55, 2.0));
  skyGrad(g, SKY.night);
  stars(g, s, 200, 0, .4 + open * .6);
  milkyWay(g, 980, 330, 2200, -.42, .25 + open * .75);
  moon(g, 960, 300, 120, { haloA: .3 + open * .7 });
  // 月光透出来的光柱
  if (open > .05) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 9; i++) {
      const a0 = Math.PI / 2 + (i - 4) * .16 + Math.sin(s * .5 + i) * .02;
      g.fillStyle = lgrad(g, 960, 300, 960 + Math.cos(a0) * 900, 300 + Math.sin(a0) * 900, [[0, `rgba(220,225,255,${.16 * open})`], [1, 'rgba(220,225,255,0)']]);
      g.beginPath(); g.moveTo(960, 300); g.lineTo(960 + Math.cos(a0 - .04) * 1200, 300 + Math.sin(a0 - .04) * 1200); g.lineTo(960 + Math.cos(a0 + .04) * 1200, 300 + Math.sin(a0 + .04) * 1200); g.fill();
    }
    g.restore();
  }
  // 云：越靠中间的散得越快
  for (let i = 0; i < 16; i++) {
    const row = i % 4, col = Math.floor(i / 4);
    const cx0 = -100 + col * 620 + hash(i, 11) * 160, cy = 60 + row * 210 + hash(i, 12) * 80;
    const side = cx0 < W / 2 ? -1 : 1;
    const cx = cx0 + side * open * (700 + hash(i, 13) * 400) + Math.sin(s * .4 + i) * 10;
    cloud(g, i, cx, cy, 900 + hash(i, 14) * 300, CLOUD.storm, 1 - open * .35, i % 2 === 0);
  }
  const by = 860 + Math.sin(s * 2) * 8;
  const reach = E.out(seg(k, .2, .6));
  flyingBed(g, s, 960, by, .5, { plush: PLUSH.pink, eyes: open > .5 ? 'happy' : 'open', mouth: open > .5 ? 'smile' : 'n', plushEyes: 'glow', plushGlow: .3 + open * .6, wind: .4, trail: false,
    pose: { tilt: -.08, head: -.5, aN: [lerp(.4, 2.75, reach), .1], aF: [.5, .9], lN: [1.5, -1.45], lF: [1.45, -1.5] }, light: open > .4 ? LIGHT.moon : LIGHT.night });
}

/* ---------- 第 8 小节：想要为你整理衬衣（回忆） ----------
   白天的玄关，阳光斜斜地照进来。她踮起脚，给他理了理衣领。 */
function sCollar(g, s, k) {
  const z = 1.34 + k * .03;
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-1010, -520);
  hallway(g, s);
  const tip = E.io(seg(k, .1, .5));
  person(g, { who: 'he', x: 1095, y: 676, u: 60, face: -1, pose: { tilt: .03, head: .3, aN: [.1, .2], aF: [-.05, .15], lN: [.02, 0], lF: [-.06, 0] }, t: s, eyes: k > 1.3 ? 'happy' : 'open', mouth: 'smile', blush: .7, outfit: 'shirt', light: LIGHT.day });
  person(g, { who: 'she', x: 910, y: 680 - tip * 14, u: 58, face: 1, pose: { tilt: .04, head: -.35, aN: [1.92, -.18], aF: [1.85, -.1], lN: [.02, 0], lF: [-.08, 0] }, t: s, eyes: 'open', mouth: 'smile', blush: .8, outfit: 'day', light: LIGHT.day });
  g.restore();
  // 漏光
  g.save(); g.globalCompositeOperation = 'screen';
  const lx = 200 + Math.sin(s * .9) * 120;
  g.fillStyle = rgrad(g, lx, 120, 0, 700, [[0, 'rgba(255,170,110,.45)'], [1, 'rgba(255,140,110,0)']]); g.fillRect(0, 0, W, H);
  g.restore();
}

/* ---------- 第 9 小节：为你到处收集诗句 ----------
   夜空里飘着写了字的小纸条。她接住一张。另一张被风吹走，一路飞向远处一扇亮着的窗。 */
const POEMS = ['晚安', '想你', '月亮很圆', '风很温柔', '你好吗', '今天也是', '星星', '睡不着'];
function sPoems(g, s, k) {
  const x = 9000 + k * 380;
  flightBg(g, s, { x, moon: [1500, 220, 96], cloudA: .6, cloudY: 660 });
  // 远处那扇亮着的窗（他的）
  const wx = 1640, wy = 820;
  glow(g, wx, wy, 60 + seg(k, 1.6, 2.5) * 80, '#FFD08A', .6 + seg(k, 1.6, 2.5) * .4);
  g.fillStyle = '#FFE0A8'; g.fillRect(wx - 9, wy - 12, 18, 24);
  const by = 560 + Math.sin(s * 2.3) * 9;
  const read = E.out(seg(k, .75, 1.05));
  flyingBed(g, s, 650, by, .6, { plush: PLUSH.pink, eyes: read > .5 ? 'happy' : 'open', mouth: 'smile', plushEyes: 'glow', plushGlow: .5, wind: .5,
    pose: { tilt: .02, head: -.1 + read * .3, aN: [lerp(.5, 1.5, read), lerp(.6, 1.2, read)], aF: [lerp(.4, 1.3, read), lerp(.6, 1.3, read)], lN: [1.5, -1.45], lF: [1.45, -1.5] } });
  // 漂着的纸条
  POEMS.forEach((p, i) => {
    if (i === 0) return;
    const r0 = 260 + hash(i, 1) * 360, ang = s * (.35 + hash(i, 2) * .3) + i * .8;
    const px = 650 + Math.cos(ang) * r0 * 1.4, py = 470 + Math.sin(ang) * r0 * .55 - 80;
    paperSlip(g, px, py, 120 + hash(i, 3) * 40, Math.sin(s + i) * .3, p, s * 4 + i, .95);
  });
  // 她接住的那一张："晚安"
  const cu = E.io(seg(k, .3, .8));
  paperSlip(g, lerp(1050, 760, cu), lerp(260, 430, cu) + Math.sin(s * 3) * 4 * (1 - cu), lerp(130, 170, cu), lerp(.4, -.08, cu), '晚安', lerp(s * 5, 0, cu), 1);
  // 被风吹走的那一张：飞向那扇窗
  const fu = seg(k, 1.3, 2.45);
  if (fu > 0) {
    const e = E.in2(fu), fx = lerp(820, wx, e), fy = lerp(380, wy, e) - Math.sin(Math.PI * e) * 160;
    paperSlip(g, fx, fy, lerp(130, 20, e), s * 2, '想你', s * 6, 1 - seg(fu, .9, 1));
    for (let j = 1; j < 8; j++) { const e2 = E.in2(Math.max(0, fu - j * .03)); glow(g, lerp(820, wx, e2), lerp(380, wy, e2) - Math.sin(Math.PI * e2) * 160, 10, '#FFE7B0', .5 - j * .06); }
  }
}

SCENES_DEF.push(() => {
  scene('hook', TRIM, sHook, { bloom: .45 });
  scene('lowfly', bar(2), sLowFly, { tr: { type: 'zoom', dur: .7, pre: .45, cx: 1134, cy: 454, zoom: 4 }, bloom: .5 });
  scene('oxygen', bar(3), sOxygen, { tr: { type: 'blur', dur: .45 }, bloom: .55 });
  scene('fog', bar(4), sFog, { tr: { type: 'cloud', dur: .6, pal: CLOUD.nightL }, bloom: .5 });
  scene('fall', bar(5), sFall, { tr: { type: 'whipV', dur: .45, dir: -1 }, bloom: .55 });
  scene('calm', bar(6), sCalm, { tr: { type: 'flash', dur: .5 }, bloom: .45 });
  scene('clear', bar(7), sClear, { tr: { type: 'fade', dur: .5 }, bloom: .55 });
  scene('collar', bar(8), sCollar, { tr: { type: 'leak', dur: .7 }, bloom: .5, grade: 'sepia(.22) saturate(1.12) contrast(.95) brightness(1.03)' });
  scene('poems', bar(9), sPoems, { tr: { type: 'leak', dur: .7 }, bloom: .5 });
});
