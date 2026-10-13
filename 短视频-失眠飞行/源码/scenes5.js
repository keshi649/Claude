'use strict';
/* scenes5.js：第二遍副歌（第 50~58 小节）和间奏（第 58~66 小节）。
   副歌：两个人同时在梦里飞，画面一分为二——同一片森林、同一片海，却各在一边；他看日出，她看日落；
   格林威治的子午线把他们隔开；最后在同一片人海里背对背擦肩而过，各自抱着自己的玩偶。
   间奏：两只小怪玩偶从两扇窗里飞出来，在城市上空碰面，用像素方块沿着红线搭起一座桥（鹊桥）。 */

/* 左右分屏：x 分界线；left/right 各画一整张，裁成半边，内容挪到半边的中间 */
function splitScreen(g, s, x, left, right, o = {}) {
  g.save(); g.beginPath(); g.rect(0, 0, x, H); g.clip(); g.translate(x / 2 - W / 2 + (o.lShift || 0), 0); left(g); g.restore();
  g.save(); g.beginPath(); g.rect(x, 0, W - x, H); g.clip(); g.translate((x + W) / 2 - W / 2 + (o.rShift || 0), 0); right(g); g.restore();
  // 分界线：一道柔光，微微起伏
  g.save(); g.globalCompositeOperation = 'lighter';
  g.strokeStyle = 'rgba(255,230,250,.55)'; g.lineWidth = 3; g.beginPath();
  for (let y = 0; y <= H; y += 20) { const xx = x + Math.sin(y * .01 + s * 2) * (o.wave || 4); y ? g.lineTo(xx, y) : g.moveTo(xx, y); }
  g.stroke(); g.strokeStyle = 'rgba(255,200,240,.15)'; g.lineWidth = 26; g.stroke();
  g.restore();
}

/* ---------- 第 50 小节：森林（分屏） ---------- */
function sForest2(g, s, k) {
  const cx = k * 900;
  splitScreen(g, s, W / 2,
    gg => { glowForest(gg, s, cx, {}); person(gg, { who: 'he', x: 900, y: 520 + Math.sin(s * 2) * 24, u: 30, face: 1, pose: { ...POSE.fly, aN: [2.2, .1] }, t: s, eyes: 'open', mouth: 'n', wind: [-2, -.3], light: LIGHT.forest }); },
    gg => { glowForest(gg, s, cx + 6000, {}); person(gg, { who: 'she', x: 1020, y: 560 + Math.sin(s * 2 + 1) * 24, u: 30, face: -1, pose: { ...POSE.fly, aN: [2.2, .1] }, t: s, eyes: 'open', mouth: 'n', wind: [-2, -.3], light: LIGHT.forest }); });
  // 红线穿过分界线，把两个人的手连起来
  redThread(g, s, [[640, 470], [820, 430], [960, 470], [1100, 520], [1290, 510]], { w: 3 });
  bigWord(g, s, 128.31, '森林', 960, 220, 200, '#5FFFE0');
}
/* ---------- 潜入海底（分屏） ---------- */
function sSea2(g, s, k) {
  splitScreen(g, s, W / 2,
    gg => { underwater(gg, s, { whaleX: 1100 - k * 120, whaleY: 640, whaleK: 1.1, jellies: [[1300, 380, .7]] }); person(gg, { who: 'he', x: 980, y: 470 + Math.sin(s * 1.5) * 20, u: 30, face: 1, pose: { ...POSE.fly, tilt: 1.0, aN: [2.3, .4] }, t: s, eyes: 'open', mouth: 'n', wind: [-1, -1.2], light: LIGHT.sea }); },
    gg => { underwater(gg, s + 3, { whale: false, jellies: [[700, 300, 1], [1200, 760, .8], [560, 700, .6]] }); person(gg, { who: 'she', x: 940, y: 520 + Math.sin(s * 1.5 + 1) * 20, u: 30, face: -1, pose: { ...POSE.fly, tilt: 1.0, aN: [2.3, .4] }, t: s, eyes: 'open', mouth: 'n', wind: [-1, -1.2], light: LIGHT.sea }); }, { wave: 14 });
  redThread(g, s, [[650, 430], [800, 380], [960, 450], [1120, 480], [1270, 470]], { w: 3 });
  bigWord(g, s, 129.57, '海底', 960, 240, 200, '#7FE8FF');
}
/* ---------- 第 52 小节：他看日出，她看日落 ---------- */
function sSunSplit(g, s, k) {
  const uL = lerp(.18, .4, seg(k, 0, 5)), uR = lerp(.66, .9, seg(k, 0, 5));
  splitScreen(g, s, W / 2,
    gg => { cloudSeaDay(gg, s, uL); const d = dayAt(uL); cloud(gg, 4, 960, 820, 900, d.palA, 1); person(gg, { who: 'he', x: 960, y: 734, u: 32, face: 1, pose: { ...POSE.sit, head: -.15 }, t: s, eyes: 'open', mouth: 'n', light: { ...LIGHT.sunset, lx: -.9 } }); },
    gg => { cloudSeaDay(gg, s, uR); const d = dayAt(uR); cloud(gg, 5, 960, 820, 900, d.palA, 1); person(gg, { who: 'she', x: 960, y: 736, u: 31, face: -1, pose: { ...POSE.sit, head: -.15 }, t: s, eyes: 'open', mouth: 'n', light: { ...LIGHT.sunset, lx: .9 } }); });
  bigWord(g, s, 133.13, '日出', 480, 320, 180, '#FFC88A', 1.1);
  bigWord(g, s, 134.05, '日落', 1440, 320, 180, '#FF8A6A', 1.3);
}
/* ---------- 第 54 小节：子午线把他们隔开 ---------- */
function sMeridian(g, s, k) {
  skyGrad(g, SKY.night); stars(g, s, 2000, 0, 1); milkyWay(g, 960, 300, 2400, -1.4, .5);
  // 竖着的绿色激光就是分界线
  g.save(); g.globalCompositeOperation = 'lighter';
  g.strokeStyle = 'rgba(90,255,140,.9)'; g.lineWidth = 4; g.beginPath(); g.moveTo(960, -10); g.lineTo(960, H + 10); g.stroke();
  g.strokeStyle = 'rgba(90,255,140,.2)'; g.lineWidth = 40; g.stroke();
  g.restore();
  text(g, 'W', 860, 140, 40, { k: 'serif', col: '#BFFFD0', alpha: .7 }); text(g, 'E', 1060, 140, 40, { k: 'serif', col: '#BFFFD0', alpha: .7 });
  text(g, '0°', 960, 80, 46, { k: 'serif', col: '#D8FFE4', glow: '#5AFF8C', gr: 20 });
  cityLayer(g, CITY.far, 9000 + k * 40, 1040, .9);
  const up = E.io(seg(k, 0, 2.4));
  person(g, { who: 'he', x: 700, y: lerp(900, 420, up), u: 30, face: 1, rot: -1.2, pose: { ...POSE.fly, aN: [2.4, .1] }, t: s, eyes: 'open', mouth: 'n', wind: [0, 2], light: LIGHT.night });
  person(g, { who: 'she', x: 1220, y: lerp(940, 460, up), u: 30, face: -1, rot: 1.2, pose: { ...POSE.fly, aN: [2.4, .1] }, t: s, eyes: 'open', mouth: 'n', wind: [0, 2], light: LIGHT.night });
  bigWord(g, s, 137.49, '格林威治', 960, 540, 150, '#7CFFA8', 1.4);
}
/* ---------- 时间飞行：两条钟表隧道，一个顺时针、一个逆时针 ---------- */
function sClocks2(g, s, k) {
  splitScreen(g, s, W / 2, gg => clockTunnel(gg, s, k * .7), gg => clockTunnel(gg, -s, k * .7 + .3));
  person(g, { who: 'he', x: 480, y: 600 + Math.sin(s * 3) * 10, u: 26, face: 1, rot: Math.sin(s * 2) * .2, pose: POSE.fly, t: s, eyes: 'wide', mouth: 'o', wind: [-2, -.3], light: LIGHT.warm });
  person(g, { who: 'she', x: 1440, y: 600 + Math.sin(s * 3 + 1) * 10, u: 26, face: -1, rot: -Math.sin(s * 2) * .2, pose: POSE.fly, t: s, eyes: 'wide', mouth: 'o', wind: [-2, -.3], light: LIGHT.warm });
  bigWord(g, s, 139.06, '时间', 960, 200, 170, '#FFE0A8', 1.1);
}
/* ---------- 第 56 小节：同一片人海，背对背擦肩而过 ----------
   两个人在人群里各自往前挤，在中间背对背错开；"拥抱你"的时候，各自抱着的只是自己的玩偶。 */
function sMiss(g, s, k) {
  plaza(g, s, { churchX: 960 });
  crowdRows(g, s, [[690, .45, 34, 11], [740, .55, 30, 15], [800, .68, 24, 12], [870, .82, 18, 13]]);
  const u = E.io(seg(s, 141.9, 144.3));
  const hx = lerp(380, 1500, u), sx = lerp(1540, 420, u);
  const done = s > 144.3, hug = seg(s, 144.4, 144.9);
  const wp = done ? lerpPose(POSE.stand, POSE.sitHug, 0) : walkPose(s * 2.1, .5);
  const hugP = { ...POSE.hug, aN: [1.2, 1.5], aF: [1.1, 1.6] };
  person(g, { who: 'he', x: hx, y: 900, u: 38, face: 1, pose: hug > 0 ? lerpPose(POSE.stand, hugP, hug) : wp, t: s, eyes: hug > .5 ? 'closed' : 'open', mouth: hug > .5 ? 'sad' : 'n', light: LIGHT.night });
  person(g, { who: 'she', x: sx, y: 904, u: 37, face: -1, pose: hug > 0 ? lerpPose(POSE.stand, hugP, hug) : wp, t: s, eyes: hug > .5 ? 'closed' : 'open', mouth: hug > .5 ? 'sad' : 'n', light: LIGHT.night });
  if (hug > 0) {
    withAlpha(g, hug, () => { plush(g, { x: hx + 50, y: 830, s: 5, col: PLUSH.orange, eyes: 'n' }); plush(g, { x: sx - 50, y: 834, s: 5, col: PLUSH.pink, eyes: 'n' }); });
  }
  crowdRows(g, s, [[980, 1.0, 12, 16], [1080, 1.25, 9, 14]], { gap: [960, 0] });
  // 擦肩的那一瞬：放慢、发光
  const pass = win(s, 143.0, 143.7, .15, .25);
  if (pass > 0) glow(g, 960, 760, 280, '#FFE6F4', pass * .5);
  // 缠在人群里的红线
  redThread(g, s, [[hx + 20, 800], [hx + (sx - hx) * .3, 720], [(hx + sx) / 2, 860], [hx + (sx - hx) * .7, 740], [sx - 20, 804]], { w: 3, sway: 14 });
  bigWord(g, s, 143.84, '人海', 520, 240, 150, '#9FC8FF', 1.0);
}

/* ---------- 间奏（第 58~62 小节）：两只小怪飞出窗口，在天上碰面 ---------- */
const WIN_HE = [430, 560], WIN_SHE = [1500, 600];
function arcPt(u) { const x = lerp(WIN_HE[0], WIN_SHE[0], u), y = lerp(WIN_HE[1], WIN_SHE[1], u) - Math.sin(Math.PI * u) * 420; return [x, y]; }
function sComets(g, s, k) {
  skyGrad(g, SKY.deep);
  stars(g, s, 3000, 0, 1);
  milkyWay(g, 960, 260, 2400, -.2, .55);
  moon(g, 1700, 140, 50, { haloA: .4 });
  cityNightBand(g, s);
  // 红线
  const pts = []; for (let i = 0; i <= 16; i++) pts.push(arcPt(i / 16));
  redThread(g, s, pts, { w: 3, a: .8 });
  // 两只小怪：从窗户出来，绕着红线螺旋上升，第 60 小节在正中间碰头
  const meet = bar(60);
  const fly = (who, start, col, side) => {
    const u = seg(s, start, meet);
    if (u <= 0) return null;
    const e = E.io(u), base = arcPt(side < 0 ? e * .5 : 1 - e * .5);
    const r = 70 * (1 - e), a = s * 6 * side;
    const x = base[0] + Math.cos(a) * r, y = base[1] + Math.sin(a) * r * .6;
    for (let j = 1; j < 14; j++) { const e2 = E.io(seg(s - j * .05, start, meet)), b2 = arcPt(side < 0 ? e2 * .5 : 1 - e2 * .5), r2 = 70 * (1 - e2), a2 = (s - j * .05) * 6 * side; g.fillStyle = rgba(col, .6 - j * .04); g.fillRect(b2[0] + Math.cos(a2) * r2 - 5, b2[1] + Math.sin(a2) * r2 * .6 - 5, 10, 10); }
    pixelMon(g, x, y, 4, col, 1);
    return [x, y];
  };
  if (s < meet + .05) { fly('he', bar(58) + .2, PLUSH.orange, -1); fly('she', bar(58) + .6, PLUSH.pink, 1); }
  else {
    // 碰面以后：像素烟花，然后两个绕着转圈
    const c = arcPt(.5), b = seg(s, meet, meet + 1.4);
    if (b < 1) for (let i = 0; i < 70; i++) { const a = hash(i, 1) * TAU, d = E.out(b) * (120 + hash(i, 2) * 360); g.fillStyle = rgba([PLUSH.orange, PLUSH.pink, '#FFE68A', '#9AE6FF'][i % 4], 1 - b); g.fillRect(c[0] + Math.cos(a) * d - 5, c[1] + Math.sin(a) * d - 5 + b * b * 80, 10, 10); }
    // 两只一左一右，各描半个心：留下像素方块的尾巴，拼成一颗心
    const hu = seg(s, meet + .6, meet + 3.6), heartAt = (v, side) => { const t = Math.PI * v; const hx = 16 * Math.pow(Math.sin(t), 3), hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); return [c[0] + side * hx * 13, c[1] + 40 + hy * 13]; };
    for (const [side, col] of [[-1, PLUSH.orange], [1, PLUSH.pink]]) {
      const steps = Math.floor(hu * 24);
      for (let j = 0; j <= steps; j++) { const [x, y] = heartAt(j / 24, side); g.fillStyle = rgba(col, .9); g.fillRect(x - 6, y - 6, 12, 12); glow(g, x, y, 20, col, .3); }
      const [mx, my] = hu > 0 ? heartAt(Math.min(1, hu), side) : [c[0] + side * Math.cos((s - meet) * 3) * 70, c[1] + Math.sin((s - meet) * 3) * 40 * side];
      pixelMon(g, mx, my, 4, col, 1);
    }
    if (hu >= 1) glow(g, c[0], c[1] + 40, 320, '#FFD6EA', .3 + .2 * Math.sin(s * 4));
    // 每小节城市上空炸一朵像素烟花
    for (let n = 0; n < 2; n++) {
      const t0 = bar(60 + n) + BAR * .5, b2 = seg(s, t0, t0 + 1.3); if (b2 <= 0 || b2 >= 1) continue;
      const fx = n ? 1500 : 420, fy = 300;
      for (let i = 0; i < 36; i++) { const ang = i / 36 * TAU, d = E.out(b2) * 160; g.fillStyle = rgba(['#FFE68A', '#9AE6FF', '#FFB3D1'][i % 3], 1 - b2); g.fillRect(fx + Math.cos(ang) * d - 4, fy + Math.sin(ang) * d - 4 + b2 * b2 * 60, 8, 8); }
    }
  }
}
/* 城市的一条：两扇窗亮着（他的、她的） */
function cityNightBand(g, s) {
  cityLayer(g, CITY.far, 5200, 900, .9);
  cityLayer(g, CITY.mid, 6400, 1010, 1);
  for (const [[x, y], col, seed] of [[WIN_HE, '#FFD48A', 3], [WIN_SHE, '#FFC9DE', 4]]) {
    g.fillStyle = '#161B48'; g.fillRect(x - 110, y - 70, 220, 640);
    g.fillStyle = '#2A3168'; g.fillRect(x - 110, y - 70, 220, 8); g.fillStyle = 'rgba(190,205,255,.25)'; g.fillRect(x - 110, y - 70, 220, 2);
    for (let j = 0; j < 8; j++) for (let i = 0; i < 3; i++) { if (j === 0 && i === 1) continue; g.fillStyle = hash(i, j, seed) < .15 ? '#C9A26E' : '#0E1230'; g.fillRect(x - 84 + i * 64, y - 26 + j * 70, 40, 52); }
    glow(g, x, y, 130, col, .85); g.fillStyle = col; g.fillRect(x - 20, y - 26, 40, 52);
  }
}
/* ---------- 间奏（第 62~66 小节）：像素方块沿着红线搭成一座桥 ---------- */
function sPixelBridge(g, s, k) {
  const dawn = E.io(seg(s, 163.5, 166.9));
  skyGrad(g, [[0, mixc('#04061A', '#2A3C7E', dawn)], [.6, mixc('#0D1238', '#D8909E', dawn)], [1, mixc('#1E2052', '#FFD3A8', dawn)]]);
  stars(g, s, 3000, 0, 1 - dawn);
  milkyWay(g, 960, 260, 2400, -.2, .55 * (1 - dawn));
  cityNightBand(g, s);
  // 搭桥：两头往中间铺
  const N = 40, built = seg(s, bar(62), bar(62) + 6.5);
  for (let i = 0; i < N; i++) {
    const u = i / (N - 1), order = Math.min(i, N - 1 - i) / (N / 2);
    const on = seg(built, order * .9, order * .9 + .1);
    if (on <= 0) continue;
    const [x, y] = arcPt(u), col = i < N / 2 ? PLUSH.orange : PLUSH.pink;
    const drop = (1 - E.out(on)) * 60;
    for (const dy of [0, 14]) { g.fillStyle = rgba(mixc(col, '#FFFFFF', dy ? .3 : 0), on); g.fillRect(x - 12, y - 12 + dy - drop, 24, 14); }
    glow(g, x, y, 40, col, .35 * on + .15 * Math.sin(s * 3 + i));
  }
  // 两只小怪在桥上搬方块
  const wk = seg(s, bar(62), bar(62) + 6.5) * .5;
  const pL = arcPt(Math.min(.5, wk) - .02), pR = arcPt(Math.max(.5, 1 - wk) + .02);
  pixelMon(g, pL[0], pL[1] - 46 + Math.abs(Math.sin(s * 8)) * -8, 3.5, PLUSH.orange, 1);
  pixelMon(g, pR[0], pR[1] - 46 + Math.abs(Math.sin(s * 8 + 1)) * -8, 3.5, PLUSH.pink, 1);
  if (built >= 1) { const sp = seg(s, bar(62) + 6.5, bar(62) + 8); for (let i = 0; i < 20; i++) { const [x, y] = arcPt(hash(i, 4)); glow(g, x, y - 20, 30, '#FFFFFF', Math.sin(Math.PI * clamp(sp * 2 - hash(i, 5)))); } }
  glow(g, 960, 1000, 900, '#FFC8A0', dawn * .5);
}

SCENES_DEF.push(() => {
  scene('forest2', bar(50), sForest2, { tr: { type: 'flash', dur: .5 }, bloom: .6 });
  scene('sea2', 128.85, sSea2, { tr: { type: 'ripple', dur: .4 }, bloom: .55 });
  scene('sunsplit', bar(52), sSunSplit, { tr: { type: 'whipV', dur: .45, dir: -1 }, bloom: .4 });
  scene('meridian', bar(54), sMeridian, { tr: { type: 'cloud', dur: .6, pal: CLOUD.dusk }, bloom: .55 });
  scene('clocks2', 139.0, sClocks2, { tr: { type: 'zoom', dur: .5, zoom: 3 }, bloom: .55 });
  scene('miss', bar(56), sMiss, { tr: { type: 'flash', dur: .5 }, bloom: .5 });
  scene('comets', bar(58), sComets, { tr: { type: 'blur', dur: .8 }, bloom: .6, cam: true });
  scene('pixelbridge', bar(62), sPixelBridge, { tr: { type: 'fade', dur: .8 }, bloom: .6 });
});
