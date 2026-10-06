'use strict';
/* scenes2.js：地铁安检（X 光）、早上的街、夹娃娃机。 */

/* ---------------- 地铁安检 ----------------
   世界坐标：地面 y=120。安检机 x 70–150，显示器在 x 170–230，头顶 LED 屏 x 60–160。 */
function station(g, t) {
  const F = 120;
  // 墙：白瓷砖 + 一条青色腰线
  rect(g, -40, -20, 400, F + 20, '#e6e2d6');
  for (let j = -20; j < F; j += 8) rect(g, -40, j, 400, 1, '#cfcabd');
  for (let i = -40; i < 360; i += 8) rect(g, i, -20, 1, F + 20, '#d6d1c4');
  rect(g, -40, 62, 400, 10, '#3f9a95'); rect(g, -40, 62, 400, 1, '#69b8b2'); rect(g, -40, 71, 400, 1, '#2e7672');
  ptext(g, '2号线 · 往 河边', 300, 64, '#f2f6f2', { size: 10, align: 'c' });
  // 地面
  rect(g, -40, F, 400, 40, '#8c8a86'); rect(g, -40, F, 400, 1, '#a9a7a2');
  for (let i = -40; i < 360; i += 16) rect(g, i, F + 1, 1, 30, '#7e7c78');
  rect(g, -40, F + 8, 400, 2, '#d9b73c');
  // 天花板灯管
  for (let i = 0; i < 340; i += 70) { rect(g, i, -6, 34, 3, '#fbf7ea'); }
}
function xrayMachine(g, t, belt) {
  const F = 120;
  // 传送带（左进右出）
  rect(g, 20, F - 22, 180, 4, '#2f3136'); for (let i = 20; i < 200; i += 6) rect(g, i + rd(belt % 6), F - 22, 1, 4, '#45474d');
  rect(g, 20, F - 18, 180, 2, '#5a5d63');
  for (const x of [26, 196]) rect(g, x, F - 16, 3, 16, '#6a6d73');
  // 机身
  rect(g, 70, F - 52, 80, 34, '#d6d0c2'); rect(g, 70, F - 52, 80, 2, '#ebe6da'); rect(g, 70, F - 20, 80, 2, '#b5ae9f');
  rect(g, 70, F - 18, 80, 18, '#c2bbac'); rect(g, 74, F - 14, 72, 1, '#a59e8f');
  // 入口、出口的铅帘
  for (let i = 0; i < 6; i++) { rect(g, 70 + i * 2, F - 44, 1, 22, '#4a4038'); rect(g, 144 + i * 2, F - 44, 1, 22, '#4a4038'); }
  rect(g, 84, F - 47, 52, 3, '#e8473b'); ptext(g, 'X-RAY', 110, F - 47 - 1, '#fff', { size: 10, align: 'c' });
  // 黄黑警示条
  for (let i = 0; i < 80; i += 4) rect(g, 70 + i, F - 23, 2, 1, i % 8 ? '#1f1f1f' : '#e6c13a');
}
/* 安检显示器：x,y 左上角，scan 0–1 是扫描进度；heart 心的亮度；cover Clawd 用手捂住心 */
function xrayMonitor(g, x, y, t, o) {
  rect(g, x + 26, y + 44, 6, 22, '#4a4d55'); rect(g, x + 16, y + 64, 26, 3, '#3b3e45');
  rect(g, x - 3, y - 3, 66, 50, '#2b2e35'); rect(g, x - 3, y - 3, 66, 1, '#3f434c');
  rect(g, x, y, 60, 44, '#0d1a22');
  // 画面：蓝底（X 光伪彩），扫描线从左往右
  const sw = rd(60 * o.scan);
  g.save(); g.beginPath(); g.rect(x, y, sw, 44); g.clip();
  rect(g, x, y, 60, 44, '#cfe3e8'); dith(g, x, y, 60, 44, '#bfd6dc');
  // 包的轮廓
  rect(g, x + 6, y + 10, 48, 28, '#e7d7a8'); rect(g, x + 6, y + 10, 48, 1, '#c79a3c'); rect(g, x + 6, y + 37, 48, 1, '#c79a3c');
  rect(g, x + 6, y + 10, 1, 28, '#c79a3c'); rect(g, x + 53, y + 10, 1, 28, '#c79a3c');
  line(g, x + 14, y + 10, x + 22, y + 3, '#c79a3c'); line(g, x + 46, y + 10, x + 38, y + 3, '#c79a3c'); rect(g, x + 22, y + 3, 16, 1, '#c79a3c');
  // 里面的东西：钥匙（蓝黑）、手机、伞、书（橙）
  rect(g, x + 9, y + 28, 6, 3, '#2a4f9a'); disc(g, x + 10, y + 26, 2, '#2a4f9a'); disc(g, x + 10, y + 26, 1, '#cfe3e8');
  rect(g, x + 44, y + 14, 6, 11, '#1d3d7a'); rect(g, x + 45, y + 15, 4, 8, '#3b62b0');
  rect(g, x + 10, y + 13, 30, 2, '#2f5bb0'); rect(g, x + 38, y + 12, 3, 4, '#2f5bb0');
  rect(g, x + 38, y + 27, 12, 8, '#e3913a'); rect(g, x + 38, y + 27, 12, 1, '#c46f20');
  // Clawd 的影子（橙色有机物）+ 胸口一颗心
  const cx = x + 26, cy = y + 36;
  clawd(g, cx, cy, { u: 2, t, col: '#e8a04a', noShadow: true, eyes: o.eyes || 'n', blinkOK: false, armL: o.cover ? 0 : 0, armR: 0 });
  const hb = o.heart;
  if (hb > 0 && !o.cover) {
    g.save(); g.globalAlpha *= hb;
    const HP = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
    HP.forEach((r, j) => { for (let i = 0; i < 7; i++) if (r[i] === '#') px(g, cx - 4 + i, cy - 11 + j, j < 2 && i % 3 === 1 ? '#ffd0dc' : '#ff4f86'); });
    g.restore();
  }
  if (o.cover) { rect(g, cx - 6, cy - 11, 5, 4, '#e8a04a'); rect(g, cx + 1, cy - 11, 5, 4, '#e8a04a'); rect(g, cx - 1, cy - 10, 2, 2, '#ff4f86'); }
  g.restore();
  if (o.scan < 1) rect(g, x + sw, y, 1, 44, '#9ff3ff');
  // 屏幕上的小字
  ptext(g, 'XR-02', x + 2, y + 1, '#2a5a6a', { size: 10 });
  if (o.alert) { const blink = fl(t * 4) % 2; if (blink) rect(g, x + 46, y + 2, 12, 6, '#ff4f86'); }
  // 扫描线条纹
  for (let j = 0; j < 44; j += 2) rect(g, x, y + j, 60, 1, 'rgba(0,30,40,.08)');
}
/* LED 点阵屏（挂在天花板下面），红/橙色字。x,y 左上角 */
function ledBoard(g, x, y, w, h, lines, t, col = '#ff6a3d') {
  rect(g, x + 10, y - 10, 1, 10, '#555'); rect(g, x + w - 11, y - 10, 1, 10, '#555');
  rect(g, x - 2, y - 2, w + 4, h + 4, '#2a2a2e'); rect(g, x, y, w, h, '#0e0b0b');
  dith(g, x, y, w, h, '#1a1212');
  lines.forEach((ln, i) => ptext(g, ln.s, x + w / 2, y + 3 + i * 13, ln.col || col, { align: 'c', times: ln.times, t, pop: .05 }));
}

/* 第四句：只是怕爱你的心被你看透（安检） */
function shotXray(t, T, lt) {
  const L3 = L(3), F = 120;
  const cam = { x: 8 + lt * 1.5, y: 2, k: 1.25 };
  const push = E.io(seg(t, L3.t[7] - .4, L3.t[9] + .2)) * (1 - E.io(seg(t, 32.6, 33.4)));
  // 包在传送带上：27.7 进机器，29 到中间，31.9 出来
  const bagX = kf(t, [[27.7, 70], [28.6, 104], [31.9, 112], [32.6, 168]], E.io);
  const scan = seg(t, 28.0, 29.2);
  const heart = seg(t, L3.t[3] - .1, L3.t[3] + .4);
  const cover = t > L3.t[9] + .1 && t < 33.0;
  layer(g => {
    station(g, t);
    ledBoard(g, 56, 8, 100, 30, [{ s: '只是怕爱你的心', times: L3.t.slice(0, 7) }, { s: '被你看透', times: L3.t.slice(7) }], t);
    xrayMachine(g, t, t * 18 * (t < 32.6 ? 1 : 0));
    // 包（机器外面才看得见）
    if (bagX < 72 || bagX > 148) {
      rect(g, bagX - 9, F - 34, 18, 12, '#e9dec2'); rect(g, bagX - 9, F - 34, 18, 1, '#f6efdc'); line(g, bagX - 6, F - 34, bagX - 2, F - 41, '#c9b78f'); line(g, bagX + 6, F - 34, bagX + 2, F - 41, '#c9b78f');
      if (t > 32.4) { clawd(g, bagX, F - 33, { u: 1, t, noShadow: true, eyes: 'happy', blush: 1 }); rect(g, bagX - 9, F - 30, 18, 8, '#e9dec2'); }
    }
    xrayMonitor(g, 176, 30, t, { scan, heart, cover, eyes: cover ? 'closed' : 'n', alert: heart > .5 });
    // 安检员：站在显示器旁边，看屏幕
    const lean = t > L3.t[7] && t < 32.4;
    npc(g, 246 - (lean ? 2 : 0), F, 'guard', { t, flip: true, eyes: lean ? 'wide' : 'n' });
    // 她：放下包，走到出口那边等
    const gx = kf(t, [[27.7, 40], [28.6, 44], [30.6, 44], [32.0, 160], [33.6, 166]], E.io);
    const walking = (t > 28.6 && t < 28.65) || (t > 30.6 && t < 32.0);
    girl(g, gx, F, walking ? 'walk' : (t > 32.4 ? 'hold' : 'stand'), { t, walk: t * 1.6, bag: false, eyes: t > 32.5 ? 'happy' : 'n' });
    if (t > 31.0) mark(g, 246, F - 40, t < 32.4 ? '!' : '♥', t, 31.0, 33.6, '#ff6a8a');
  }, cam);
  zoomView(1 + push * .15, .62, .15);
  glow(sx(cam, 206), sy(cam, 52), 300, '#9ff3ff', .22);
  glow(sx(cam, 106), sy(cam, 22), 380, '#ff6a3d', .2 + .15 * clamp(L3.t.filter(x => t >= x).length / 11));
  grade('#fff1d8', .12, 'soft-light');
  grade('#b8b4c8', .2, 'multiply');
  shafts([{ x: 300, w: 160, a: .1 }, { x: 1100, w: 220, a: .08 }], .35, 16);
  bloom(.22, 1.05);
  vignette(.45);
}

/* ---------------- 早上的街 ----------------
   一排小店：早餐、洗衣、花店、夹娃娃机、便利店。地面 y=128。世界宽 900。 */
const ST = { F: 128 };
function street(g, t, o = {}) {
  const F = ST.F, x0 = o.x0 ?? -40, x1 = o.x1 ?? 980;
  // 天空 + 远处的楼（白天）
  bands(g, x0, -20, x1 - x0, 70, ['#8ec3ec', '#9dcbee', '#afd5f0', '#c3def2', '#d6e7f2']);
  for (let k = 0, xx = x0; xx < x1; k++) { const w = 30 + hash(k, 1) * 40, h = 20 + hash(k, 2) * 30; rect(g, xx, 40 - h, w, h + 20, '#b9c8d8'); for (let j = 0; j < h; j += 6) for (let i = 3; i < w - 3; i += 6) px(g, xx + i, 44 - h + j, '#a3b4c6'); xx += w + 4; }
  // 店面
  const shops = o.shops || STREET_SHOPS;
  for (const s of shops) if (s.x + s.w > x0 && s.x < x1) shopFront(g, s, t, o);
  // 人行道 + 马路
  rect(g, x0, F, x1 - x0, 6, '#b5aea2'); rect(g, x0, F, x1 - x0, 1, '#d2ccc0'); for (let i = x0; i < x1; i += 12) rect(g, i, F + 1, 1, 5, '#a29b8f');
  rect(g, x0, F + 6, x1 - x0, 2, '#8f8a82');
  rect(g, x0, F + 8, x1 - x0, 30, '#6d6f74'); for (let i = x0; i < x1; i += 30) rect(g, i + 4, F + 16, 14, 1, '#e6e1d4');
  // 电线杆和电线
  for (let px0 = 60; px0 < x1; px0 += 260) if (px0 > x0 - 10) { rect(g, px0, -10, 3, F + 10, '#7a7a80'); rect(g, px0 - 6, 2, 15, 2, '#6a6a70'); }
  for (let k = 0; k < 2; k++) for (let xx = x0; xx < x1; xx += 2) { const ph = ((xx - 60) % 260 + 260) % 260 / 260; px(g, xx, 3 + k * 4 + rd(Math.sin(ph * Math.PI) * 8), '#3d3d44'); }
}
const STREET_SHOPS = [
  { x: -40, w: 90, kind: 'breakfast' },
  { x: 54, w: 84, kind: 'laundry' },
  { x: 142, w: 80, kind: 'flower' },
  { x: 226, w: 110, kind: 'claw' },
  { x: 340, w: 120, kind: 'store' },
  { x: 464, w: 90, kind: 'cafe' },
];
function shopFront(g, s, t, o) {
  const F = ST.F, { x, w } = s;
  const wall = { breakfast: '#d9c7a6', laundry: '#c6d4dc', flower: '#e8d6c8', claw: '#f0d2dc', store: '#e6e9ec', cafe: '#c9b49a' }[s.kind];
  // 楼体（二层有窗、铁窗花、晾衣）
  rect(g, x, 10, w, F - 10, wall); rect(g, x, 10, w, 2, mix(wall, '#ffffff', .4));
  for (let i = 0; i < 2; i++) {
    const wx = x + 8 + i * (w / 2), ww = w / 2 - 16;
    rect(g, wx, 20, ww, 22, '#5d7488'); rect(g, wx + 1, 21, ww - 2, 9, '#89a6bd');
    for (let k = 2; k < ww; k += 3) rect(g, wx + k, 20, 1, 22, '#e8e6e0');
    rect(g, wx - 1, 42, ww + 2, 2, '#e8e6e0');
    if (hash(x, i) > .4) { rect(g, wx + 2, 38, 5, 4, '#c96f4a'); rect(g, wx + 3, 34, 3, 4, '#5f9a5a'); }
  }
  rect(g, x, 50, w, 3, mix(wall, '#000000', .15));
  // 招牌 + 店面
  const sign = { breakfast: ['#f2c230', '早餐', '#3a2a1a'], laundry: ['#3f7fbf', '洗衣', '#ffffff'], flower: ['#7fb36a', '花店', '#ffffff'], claw: ['#ff7aa8', '夹娃娃', '#ffffff'], store: ['#2f9a6a', '24H 便利店', '#ffffff'], cafe: ['#6a4a3a', '咖啡', '#f2e6d0'] }[s.kind];
  rect(g, x + 4, 56, w - 8, 14, sign[0]); rect(g, x + 4, 56, w - 8, 1, mix(sign[0], '#ffffff', .4));
  ptext(g, sign[1], x + w / 2, 57, sign[2], { align: 'c' });
  rect(g, x + 2, 72, w - 4, F - 72, '#3a3f48');
  if (s.kind === 'store') { rect(g, x + 6, 76, w - 12, F - 80, '#dff2ea'); for (let i = 0; i < 4; i++) rect(g, x + 10 + i * 26, 82, 20, F - 90, '#f6faf6'); rect(g, x + 6, 98, w - 12, 1, '#a9c9bb'); for (let k = 0; k < 18; k++) rect(g, x + 10 + k * 6, 92, 4, 6, ['#e86a5a', '#f2c230', '#5aa0e8', '#7fc86a'][k % 4]); }
  else if (s.kind === 'claw') {
    rect(g, x + 4, 74, w - 8, F - 74, '#2a2030');
    for (let i = 0; i < 3; i++) if (!(o.noClawMachines && i === 1)) miniClaw(g, x + 12 + i * 34, F, t, i);
  } else {
    rect(g, x + 6, 76, w - 12, F - 80, '#e9e4d8'); rect(g, x + 6, 76, w - 12, 1, '#fff');
    if (s.kind === 'breakfast') { rect(g, x + 10, 100, w - 20, 10, '#c9b9a0'); for (let i = 0; i < 4; i++) { const ph = (t * .8 + i * .25) % 1; g.fillStyle = `rgba(255,255,255,${(.5 * Math.sin(ph * Math.PI)).toFixed(3)})`; g.fillRect(rd(x + 20 + i * 12 + Math.sin(ph * 6) * 2), rd(98 - ph * 18), 2, 3); } }
    if (s.kind === 'laundry') for (let i = 0; i < 3; i++) { disc(g, x + 20 + i * 22, 104, 8, '#d6dde3'); disc(g, x + 20 + i * 22, 104, 6, '#7a9cb8'); const a = t * 4 + i; px(g, x + 20 + i * 22 + Math.cos(a) * 3, 104 + Math.sin(a) * 3, '#fff'); }
    if (s.kind === 'flower') for (let i = 0; i < 9; i++) { rect(g, x + 8 + i * 7, 108, 6, 8, '#c96f4a'); disc(g, x + 11 + i * 7, 104, 3, ['#f2648c', '#f2c230', '#ffffff', '#c86af0'][i % 4]); }
    if (s.kind === 'cafe') { rect(g, x + 10, 90, w - 20, 2, '#8a6a4a'); for (let i = 0; i < 5; i++) rect(g, x + 14 + i * 13, 84, 6, 6, '#f2e6d0'); }
  }
  // 遮阳棚
  const aw = { breakfast: '#e8473b', laundry: '#ffffff', flower: '#f2c230', claw: '#ff9dbb', store: '#2f9a6a', cafe: '#8a5a3a' }[s.kind];
  for (let i = 0; i < w; i += 6) rect(g, x + i, 70, 3, 4, (i / 6) % 2 ? aw : '#f7f3ea');
}
/* 店里那排小夹娃娃机（背景用） */
function miniClaw(g, x, F, t, i) {
  rect(g, x, F - 46, 26, 46, '#ff9dbb'); rect(g, x + 2, F - 42, 22, 24, '#bfe6f2'); rect(g, x + 2, F - 42, 22, 1, '#e8fbff');
  for (let k = 0; k < 5; k++) disc(g, x + 5 + k * 4, F - 21, 2, ['#f2c230', '#7fb3e8', '#f2648c', '#ffffff', '#9ad06a'][(k + i) % 5]);
  rect(g, x + 10 + rd(Math.sin(t + i) * 6), F - 42, 2, 6, '#888');
  rect(g, x + 2, F - 16, 22, 14, '#e86a98'); disc(g, x + 8, F - 10, 2, '#f2c230');
}

/* 一台双人夹娃娃机（正面），x 是中心，F 是地面。o：clawX（0–1）、clawY（下降深度 0–1）、grab、hold（夹着什么）、
   plush（娃娃们）、marquee（顶上 LED 跑马灯的字，两行）、inside（柜子里额外画的东西） */
const CM = { w: 112, h: 104 };
function clawMachine(g, x, F, t, o = {}) {
  const w = CM.w, h = CM.h, x0 = rd(x - w / 2), y0 = F - h;
  // 机身
  rect(g, x0, y0, w, h, '#ff8fb5'); rect(g, x0, y0, w, 2, '#ffc2d6'); rect(g, x0, y0, 2, h, '#ffb0cb'); rect(g, x0 + w - 2, y0, 2, h, '#e0628e');
  // 顶上的 LED 跑马灯（两行字）
  rect(g, x0 + 3, y0 + 4, w - 6, 30, '#0e0b0b'); dith(g, x0 + 3, y0 + 4, w - 6, 30, '#191113');
  for (let i = 0; i < w; i += 4) px(g, x0 + i + 1, y0 + 1, (fl(t * 6) + i / 4) % 2 ? '#fff3a0' : '#ff5a8a');
  if (o.marquee) o.marquee.forEach((ln, i) => ptext(g, ln.s, x, y0 + 6 + i * 14, ln.col || '#ff6a3d', { align: 'c', times: ln.times, t, pop: .05 }));
  // 玻璃柜
  const gx = x0 + 5, gy = y0 + 37, gw = w - 10, gh = 42;
  rect(g, gx, gy, gw, gh, '#c9e9f4'); rect(g, gx, gy, gw, 1, '#eafaff'); dith(g, gx, gy + gh - 10, gw, 10, '#bfe0ec');
  rect(g, gx + gw / 2 - 1, gy, 2, gh, '#ff8fb5');
  const plush = o.plush || [];
  for (const p of plush) if (!p.hidden) plushToy(g, gx + p.x, gy + gh - 2 - (p.y || 0), p.kind, t);
  if (o.inside) o.inside(g, gx, gy, gw, gh);
  // 爪子（在左半边）
  const half = gw / 2 - 2, cxp = gx + 7 + (half - 14) * (o.clawX ?? .5), drop = (o.clawY ?? 0) * (gh - 16);
  rect(g, gx, gy + 1, gw, 2, '#9aa0a8');
  rect(g, cxp - 1, gy + 3, 2, 4 + drop, '#c0c4ca');
  const open = o.grab ? 0 : 1;
  rect(g, cxp - 4, gy + 7 + drop, 8, 2, '#8a9098');
  line(g, cxp - 4, gy + 9 + drop, cxp - 5 - open * 2, gy + 14 + drop, '#8a9098'); line(g, cxp + 3, gy + 9 + drop, cxp + 4 + open * 2, gy + 14 + drop, '#8a9098');
  if (o.hold) o.hold(g, cxp, gy + 16 + drop);
  // 右半边的爪子停在角落
  const c2 = gx + gw - 10; rect(g, c2 - 1, gy + 3, 2, 4, '#c0c4ca'); rect(g, c2 - 4, gy + 7, 8, 2, '#8a9098'); line(g, c2 - 4, gy + 9, c2 - 6, gy + 13, '#8a9098'); line(g, c2 + 3, gy + 9, c2 + 5, gy + 13, '#8a9098');
  // 玻璃反光
  for (let k = 0; k < 3; k++) line(g, gx + 8 + k * 3, gy + 2, gx + 2 + k * 3, gy + 12, 'rgba(255,255,255,.5)');
  line(g, gx + gw - 12, gy + gh - 3, gx + gw - 4, gy + gh - 14, 'rgba(255,255,255,.35)');
  // 下面：操作台、出口
  rect(g, x0 + 2, gy + gh, w - 4, 4, '#e0628e');
  for (const side of [0, 1]) {
    const bx = x0 + 6 + side * (w / 2);
    rect(g, bx, gy + gh + 6, 20, 14, '#2a2030'); rect(g, bx + 2, gy + gh + 8, 16, 10, '#3a3040');
    rect(g, bx + 28, gy + gh + 7, 2, 6, '#555'); disc(g, bx + 29, gy + gh + 6, 2, '#e8473b');
    disc(g, bx + 40, gy + gh + 10, 3, '#f2c230'); disc(g, bx + 40, gy + gh + 10, 2, '#ffe27a');
  }
  rect(g, x0 + 4, F - 6, w - 8, 6, '#e0628e');
}
function plushToy(g, x, y, kind, t) {
  if (kind === 'heart') { const HP = ['.###.###.', '#########', '#########', '.#######.', '..#####..', '...###...', '....#....']; HP.forEach((r, j) => { for (let i = 0; i < 9; i++) if (r[i] === '#') px(g, x - 4 + i, y - 7 + j, j < 2 && (i === 2 || i === 6) ? '#ffb3c8' : '#f2648c'); }); px(g, x - 2, y - 4, '#3a2030'); px(g, x + 2, y - 4, '#3a2030'); return; }
  const c = { bear: '#c9965a', bunny: '#f4f0ea', duck: '#f2c230', frog: '#7fc86a', blue: '#7fb3e8' }[kind] || '#ddd';
  disc(g, x, y - 4, 4, c); rect(g, x - 4, y - 2, 9, 3, c);
  if (kind === 'bunny') { rect(g, x - 3, y - 12, 2, 5, c); rect(g, x + 2, y - 12, 2, 5, c); }
  if (kind === 'bear') { disc(g, x - 3, y - 8, 1, c); disc(g, x + 3, y - 8, 1, c); }
  if (kind === 'duck') rect(g, x + 4, y - 4, 2, 1, '#e8873b');
  px(g, x - 1, y - 5, '#2a2030'); px(g, x + 2, y - 5, '#2a2030');
}

/* 街上：她走去上班，经过一排小店（33.6–39.4） */
function shotStreet(t, T, lt) {
  const gx = lerp(-30, 240, (t - 33.4) / 6.2);
  const cam = { x: gx - 100, y: 0 };
  layer(g => streetFar(g, t), cam, { par: .4 });
  layer(g => {
    street(g, t, { x0: cam.x - 20, x1: cam.x + 360 });
    // 猫在早餐店门口的摩托上睡觉
    scooter(g, 30, ST.F, '#7fb3c8'); cat(g, 30, ST.F - 13, t);
    girl(g, gx, ST.F + 1, 'walk', { t, walk: t * 1.55, bag: true });
    // Clawd 从包里探出头
    clawd(g, gx - 4, ST.F - 13 + (Math.abs(Math.cos(t * 1.55 * TAU)) > .7 ? -1 : 0), { u: 1, t, noShadow: true, eyes: 'n', look: 1 });
    rect(g, gx - 10, ST.F - 13, 9, 5, '#e9dec2');
  }, cam);
  layer(g => { for (const px0 of [180, 560]) { rect(g, px0, -20, 9, 200, '#2a2a30'); rect(g, px0 + 2, -20, 2, 200, '#4a4a52'); } }, cam, { par: 1.7, blur: 3 });
  shafts([{ x: 200, w: 260, a: .22 }, { x: 760, w: 180, a: .14 }, { x: 1300, w: 300, a: .18 }], .55, 14);
  grade('#ffe2b8', .18, 'soft-light');
  grade('#c8b4c8', .22, 'multiply');
  bloom(.2, 1.05);
  dust(t, 18, 21, { a: .35, vx: -4 });
  vignette(.4);
}
function streetFar(g, t) { }
function scooter(g, x, F, col) {
  rect(g, x - 12, F - 10, 20, 5, col); rect(g, x - 4, F - 14, 10, 4, '#2a2a30'); rect(g, x + 6, F - 18, 3, 10, col); rect(g, x + 4, F - 19, 7, 2, '#555');
  disc(g, x - 9, F - 3, 3, '#2a2a30'); disc(g, x + 8, F - 3, 3, '#2a2a30'); disc(g, x - 9, F - 3, 1, '#999'); disc(g, x + 8, F - 3, 1, '#999');
}
function cat(g, x, y, t) {
  const c = '#e8a04a';
  rect(g, x - 5, y - 3, 9, 4, c); rect(g, x + 3, y - 5, 4, 4, c); px(g, x + 3, y - 6, c); px(g, x + 6, y - 6, c);
  const tail = rd(Math.sin(t * 2) * 1.5); rect(g, x - 8, y - 2 + tail, 3, 1, c);
  px(g, x + 5, y - 3, '#3a2a1a'); rect(g, x - 3, y - 2, 2, 1, '#c9832e'); rect(g, x, y - 2, 2, 1, '#c9832e');
}

/* 第五、六句：夹娃娃机（39.4–53.2） */
function shotClaw(t, T, lt) {
  const L4 = L(4), L5 = L(5), F = ST.F, mx = 286;
  const cam = { x: kf(t, [[39.4, 150], [41, 156], [46.2, 160], [47.2, 166], [53.2, 170]]), y: 16, k: 1.25 };
  // 爪子的动作：先想很久（左右试探），"不会"时落下，夹住心，"果"时掉下去
  const think = t < L4.t[8];
  let clawX = .5 + Math.sin((t - 39.4) * 2.2) * .25 * (think ? 1 : 0), clawY = 0, grab = false, hold = null;
  const tDrop = L4.t[8], tGrab = L4.t[9] + .2, tLift = L4.t[10], tSlip = L4.t[12];
  if (!think) {
    clawX = .32;
    clawY = t < tGrab ? E.io(seg(t, tDrop, tGrab)) : 1 - E.io(seg(t, tLift, tLift + .6)) * .9;
    grab = t > tGrab;
    if (t > tGrab && t < tSlip) hold = (g2, hx, hy) => plushToy(g2, hx, hy + 2, 'heart', t);
  }
  // 第六句：Clawd 钻进柜子装娃娃，被她一眼看穿，最后被爪子夹出来
  const hideT = L5.t[0] - .6, caught = L5.t[10], lift2 = L5.t[12];
  let clawdIn = t > hideT && t < lift2 + 1.4;
  if (t > L5.t[7]) { clawX = lerp(.32, .62, seg(t, L5.t[7], L5.t[9])); clawY = t < caught ? E.io(seg(t, L5.t[9], caught)) : 1 - E.io(seg(t, lift2 - .3, lift2 + .5)) * .9; grab = t > caught; }
  const fallT = t > tSlip ? seg(t, tSlip, tSlip + .35) : 0;
  const plush = [
    { x: 6, kind: 'bear' }, { x: 15, kind: 'bunny' }, { x: 21, kind: 'heart', hidden: t > tGrab, y: 0 }, { x: 30, kind: 'duck' }, { x: 39, kind: 'frog' }, { x: 48, kind: 'blue' },
    { x: 11, kind: 'duck', y: 5 }, { x: 44, kind: 'bunny', y: 5 },
  ];
  if (t > tSlip) plush[2] = { x: 21, kind: 'heart', y: lerp(18, 0, E.in(fallT)) };
  layer(g => {
    street(g, t, { x0: cam.x - 20, x1: cam.x + 300, noClawMachines: true });
    clawMachine(g, mx, F, t, {
      clawX, clawY, grab, hold: t > caught && t < lift2 + 1 ? (g2, hx, hy) => clawd(g2, hx, hy + 9, { u: 1, t, noShadow: true, eyes: 'x' }) : hold,
      plush,
      marquee: t < L5.t[0] - .25 ? [{ s: '猜的没错想得太多', times: L4.t.slice(0, 8) }, { s: '不会有结果', times: L4.t.slice(8) }]
        : [{ s: '被你看穿了以后', times: L5.t.slice(0, 7) }, { s: '我更无处可躲', times: L5.t.slice(7) }],
      inside: (g2, gx, gy, gw, gh) => {
        if (clawdIn && t < caught) {
          const u = seg(t, hideT, hideT + .5);
          clawd(g2, gx + 34, gy + gh - 2 - rd((1 - E.out(u)) * 10), { u: 1, t, noShadow: true, eyes: t > L5.t[2] - .2 ? 'wide' : 'n', look: t > L5.t[2] ? -1 : 0, sweat: t > L5.t[3] ? 1 : 0, blinkOK: false });
        }
      },
    });
    // 她：站在机器左边玩
    const peek = E.io(seg(t, L5.t[1] - .3, L5.t[2] + .2)) * (1 - E.io(seg(t, L5.t[6], L5.t[7])));
    girl(g, mx - 66 + rd(peek * 8), F + 1, peek > .3 ? 'crouch' : 'hold', { t, bag: false, eyes: peek > .3 ? 'wide' : t > lift2 + .6 ? 'happy' : 'n' });
    // 包放在脚边
    rect(g, mx - 86, F - 9, 14, 10, '#e9dec2'); rect(g, mx - 86, F - 9, 14, 1, '#f6efdc');
    // 第五句：Clawd 站在机器的台沿上指挥，头顶冒出一串算式
    if (t < hideT) {
      const cx = mx - CM.w / 2 + 18, cy = F - 25;
      clawd(g, cx, cy, { u: 2, t, eyes: think ? 'up' : t < tSlip ? 'wide' : 'x', armR: think ? (fl(t * 3) % 2) * 2 : 0, look: 1 });
      if (think) thinkBubble(g, cx + 14, cy - 22, t, 39.6);
      if (t > tSlip + .2) mark(g, cx, cy - 18, '…', t, tSlip + .2, hideT, '#3a2a40');
    }
    // 掉出来的 Clawd 被她接住
    if (t > lift2 + 1.0) { const u = E.out(seg(t, lift2 + 1.0, lift2 + 1.5)); clawd(g, mx - 58, F - 20 - rd(u * 4), { u: 1, t, noShadow: true, eyes: 'happy', blush: 1 }); }
  }, cam);
  const lit = L4.t.filter(x => t >= x).length;
  glow(sx(cam, mx), sy(cam, F - 84), 360, '#ff6a3d', .12 + .02 * lit);
  glow(sx(cam, mx), sy(cam, F - 50), 300, '#bfe9ff', .18);
  shafts([{ x: 120, w: 220, a: .18 }, { x: 980, w: 260, a: .14 }], .55, 14);
  grade('#ffe2b8', .16, 'soft-light');
  grade('#c8b4c8', .22, 'multiply');
  bloom(.2, 1.05);
  dust(t, 16, 31, { a: .3, vx: -4 });
  vignette(.42);
}
/* "想太多"：头顶冒出的算式泡泡，和 Claude 的 ✻ 转圈 */
function thinkBubble(g, x, y, t, t0) {
  const n = clamp((t - t0) * 2.2, 0, 6);
  const items = ['θ=37°', 'v=0.8', 'Δx?', 'π/4'];
  for (let i = 0; i < Math.min(4, n); i++) {
    const bx = x - 24 + i * 16, by = y - 12 - (i % 2) * 9 + rd(Math.sin(t * 3 + i) * 1);
    rect(g, bx - 1, by - 1, textW(items[i], 10) + 3, 11, 'rgba(255,255,255,.88)');
    ptext(g, items[i], bx + 1, by, '#3a3a6a', { size: 10 });
  }
  spinStar(g, x + 1, y + 3, t, '#d97757');
}
/* Claude 思考时那颗转着的星（像素版）：· → + → × → ✻ 循环 */
function spinStar(g, x, y, t, col) {
  const k = fl(t * 8) % 4;
  if (k === 0) { rect(g, x - 1, y - 1, 2, 2, col); return; }
  if (k === 1 || k === 3) { rect(g, x - 3, y, 7, 1, col); rect(g, x, y - 3, 1, 7, col); }
  if (k === 2 || k === 3) for (let i = -2; i <= 2; i++) { px(g, x + i, y + i, col); px(g, x + i, y - i, col); }
}

/* ---------------- 便利店 ----------------
   世界坐标：地面 y=128，收银台 x 150–250（台面 y=100），小票机在 x 236。 */
function storeInside(g, t) {
  const F = 128;
  rect(g, -20, -20, 460, F + 20, '#e9ece8');
  rect(g, -20, -20, 460, 22, '#f6f8f4'); for (let i = 0; i < 440; i += 48) { rect(g, i, -4, 30, 3, '#ffffff'); }
  rect(g, -20, 2, 460, 4, '#2f9a6a'); rect(g, -20, 6, 460, 1, '#257a54');
  // 门口的玻璃门（右边）
  rect(g, 340, 20, 60, F - 20, '#9fb9c8'); rect(g, 344, 24, 52, F - 28, '#d6eef8'); rect(g, 369, 24, 2, F - 28, '#9fb9c8');
  ptext(g, '欢迎光临', 370, 40, '#2f9a6a', { size: 10, align: 'c' });
  // 货架（后面）
  for (let s0 = 0; s0 < 3; s0++) {
    const sx0 = -10 + s0 * 56;
    rect(g, sx0, 30, 50, F - 30, '#c9cfd6'); rect(g, sx0 + 2, 32, 46, F - 34, '#e2e6ea');
    for (let r = 0; r < 4; r++) {
      const sy0 = 36 + r * 22;
      rect(g, sx0 + 2, sy0 + 16, 46, 2, '#9aa3ad');
      for (let k = 0; k < 7; k++) { const c = ['#e8473b', '#f2c230', '#5aa0e8', '#7fc86a', '#f08aa8', '#ffffff', '#c86af0'][fl(hash(s0, r, k) * 7)]; const h = 8 + fl(hash(k, r, s0) * 6); rect(g, sx0 + 4 + k * 6, sy0 + 16 - h, 5, h, c); rect(g, sx0 + 4 + k * 6, sy0 + 16 - h, 5, 1, 'rgba(255,255,255,.5)'); }
    }
  }
  // 饮料冰柜（发光）
  rect(g, 262, 26, 64, F - 26, '#b9c2cc'); rect(g, 266, 30, 56, F - 36, '#dff4ff');
  for (let r = 0; r < 4; r++) for (let k = 0; k < 8; k++) rect(g, 269 + k * 7, 36 + r * 22, 4, 12, ['#e8473b', '#2f9a6a', '#f2c230', '#5aa0e8'][(k + r) % 4]);
  rect(g, 294, 30, 1, F - 36, '#9fb3c4');
  // 地板
  rect(g, -20, F, 460, 30, '#d8d4cc'); for (let i = -20; i < 440; i += 16) rect(g, i, F, 1, 30, '#c4c0b8'); rect(g, -20, F + 10, 460, 1, '#c4c0b8');
}
function storeCounter(g, t) {
  const F = 128;
  rect(g, 150, 100, 100, 3, '#f2efe8'); rect(g, 150, 103, 100, F - 103, '#2f9a6a'); rect(g, 150, 103, 100, 2, '#3fb07e');
  rect(g, 154, 110, 92, 10, '#278657'); ptext(g, '谢谢光临', 200, 108, '#f2efe8', { size: 10, align: 'c' });
  // 收银机屏幕
  rect(g, 206, 84, 22, 14, '#2a2e35'); rect(g, 208, 86, 18, 10, '#bfe6ff'); rect(g, 215, 98, 4, 2, '#555');
  // 小票机
  rect(g, 232, 92, 14, 8, '#3a3e45'); rect(g, 232, 92, 14, 2, '#50555e'); rect(g, 234, 91, 10, 1, '#1a1c20');
}
/* 一条很长的小票：从小票机吐出来往左飘，慢慢垂到地上。新印的字在机器口，旧的跟着纸往外走 */
function receipt(g, t, L6, x0, y0) {
  const n = L6.t.filter(x => t >= x - .02).length;
  const pre = clamp((t - L6.t[0] + 1.6) * 10, 0, 16);       // 歌词前已经吐出来的一截
  const feed = n ? clamp((t - L6.t[n - 1]) * 60, 0, 4) : 0;
  const len = rd(pre + n * 13 + feed);
  const yAt = i => y0 + Math.min(34, Math.pow(Math.max(0, i - 40) / 150, 2) * 60) + Math.sin(i * .06 + t * 2.2) * 1.2 * clamp(i / 80);
  for (let i = 0; i <= len; i++) { const y = rd(yAt(i)); rect(g, x0 - i, y, 1, 14, '#fbfaf6'); px(g, x0 - i, y + 14, '#d9d4c8'); }
  const chars = [...L6.text];
  for (let k = 0; k < n; k++) {
    const i = rd((n - 1 - k) * 13 + feed) + 13;
    ptext(g, chars[k], x0 - i, rd(yAt(i - 6)) + 1, '#1f1f24');
  }
  for (let i = n * 13 + 14; i < len; i += 3) px(g, x0 - i, rd(yAt(i)) + 6, '#9a9aa2');
}

/* 第七句：我开始后悔不应该太聪明的卖弄（便利店，53.2–60.6） */
function shotStore(t, T, lt) {
  const L6 = L(6), F = 128;
  const cam = { x: kf(t, [[53.25, 104], [55.0, 100], [59.6, 30], [60.5, 28]]), y: 30, k: 1.25 };
  layer(g => {
    storeInside(g, t);
    // 店员：站在收银台后面，看傻了
    npc(g, 222, 104, 'clerk', { t, flip: true, eyes: t > 54.5 ? 'wide' : 'n' });
    storeCounter(g, t);
    receipt(g, t, L6, 233, 93);
    // 她：手里拿着一个饭团，被小票缠住
    const wrap = seg(t, 58.4, 59.8);
    girl(g, 64, F, 'hold', { t, eyes: t > 58.8 ? 'closed' : 'n' });
    rect(g, 71, F - 18, 5, 4, '#f4f0ea'); rect(g, 71, F - 15, 5, 2, '#2a2a30');
    if (wrap > 0) for (let k = 0; k < 3; k++) { const yy = F - 6 - k * 6; if (wrap > k / 3) { rect(g, 57, yy, 14, 2, '#fbfaf6'); px(g, 57, yy + 2, '#d9d4c8'); } }
    // Clawd：先在收银机上得意地跳舞，然后拼命拽纸
    const proud = t < L6.t[2];
    const cx = proud ? 217 : lerp(226, 216, seg(t, L6.t[2], L6.t[4])), cy = proud ? 84 : 100;
    clawd(g, cx, cy, { u: 2, t, eyes: proud ? 'happy' : t < L6.t[5] ? 'wide' : 'sad', armL: proud ? (fl(t * 4) % 2) * 2 : 1, armR: proud ? ((fl(t * 4) + 1) % 2) * 2 : 1, sweat: proud ? 0 : 1, hop: proud ? Math.abs(Math.sin(t * 8)) * 3 : 0, look: proud ? 0 : 1 });
    if (proud) { for (let k = 0; k < 5; k++) { const a = t * 3 + k * 1.3; px(g, cx + Math.cos(a) * 16, cy - 10 + Math.sin(a) * 9, '#ffe27a'); } }
    else mark(g, cx - 10, cy - 18, '!', t, L6.t[2], L6.t[5], '#e8473b');
  }, cam);
  glow(sx(cam, 294), sy(cam, 70), 420, '#cfefff', .25);
  glow(sx(cam, 217), sy(cam, 90), 200, '#bfe6ff', .2);
  grade('#e8fff4', .1, 'soft-light');
  grade('#c0c8d0', .18, 'multiply');
  bloom(.24, 1.08);
  vignette(.4);
}

/* ---------------- 窗台（黄昏 / 雨天 / 夜 / 清晨） ----------------
   特写：窗台上的花盆。世界坐标：窗台面 y=110，花盆在 x=150。 */
function sill(g, t, o = {}) {
  const S0 = 110;
  // 窗外
  if (!o.noOutside) cityView(g, -20, -30, 360, S0 + 30, t, { tod: o.tod ?? 3, rain: o.rain, moon: o.moon, offx: o.offx || 0, sun: o.sun });
  // 远处飞过的鸟、电线
  if ((o.tod ?? 3) === 3 && !o.noOutside) for (let k = 0; k < 3; k++) { const bx = ((t * 9 + k * 40) % 400) - 40, by = 20 + k * 6 + Math.sin(t * 2 + k) * 2; px(g, bx, by, '#3a2a40'); px(g, bx - 1, by - 1, '#3a2a40'); px(g, bx + 1, by - 1, '#3a2a40'); }
  if (!o.noOutside) for (let xx = -20; xx < 340; xx++) px(g, xx, 40 + rd(Math.sin((xx + 20) / 360 * Math.PI) * 10), 'rgba(40,30,50,.6)');
  if (o.glass) o.glass(g);
  // 窗框（特写里只看到下半截）
  rect(g, 60, -30, 5, S0 + 30, '#ece5da'); rect(g, 64, -30, 1, S0 + 30, '#c9bfb0');
  rect(g, 250, -30, 5, S0 + 30, '#ece5da'); rect(g, 250, -30, 1, S0 + 30, '#c9bfb0');
  rect(g, -20, S0 - 3, 360, 3, '#ece5da');
  // 窗台
  rect(g, -20, S0, 360, 6, '#efe8dd'); rect(g, -20, S0, 360, 1, '#fffaf0'); rect(g, -20, S0 + 6, 360, 3, '#b7ab9b');
  rect(g, -20, S0 + 9, 360, 40, '#c7b49c');
  // 窗台上的小东西：仙人掌、一杯水
  rect(g, 86, S0 - 8, 8, 8, '#d9d0c0'); rect(g, 86, S0 - 8, 8, 1, '#fff'); rect(g, 88, S0 - 16, 4, 8, '#6aa85a'); rect(g, 86, S0 - 13, 2, 3, '#6aa85a'); rect(g, 92, S0 - 14, 2, 3, '#6aa85a'); px(g, 90, S0 - 17, '#f2648c');
  rect(g, 222, S0 - 10, 7, 10, 'rgba(220,240,255,.55)'); rect(g, 222, S0 - 6, 7, 6, 'rgba(160,200,240,.45)'); rect(g, 222, S0 - 10, 7, 1, 'rgba(255,255,255,.8)');
}

/* 第八句：只是怕亲手将我的真心葬送（窗台，黄昏，60.6–71.6） */
function shotSillDusk(t, T, lt) {
  const L7 = L(7), S0 = 110, px0 = 150;
  const cam = { x: 74 + lt * .6, y: 34 - lt * .3, k: 1.5 };
  // 时间：黄昏 → 入夜
  const night = seg(t, 65.5, 70.5);
  // 心：从胸口拿出来（61），捧着（61–62.5），挖坑放进去（62.5–63.6），盖土（63.6–64.6），拍拍（64.6–65.4）
  const take = seg(t, 60.4, 61.2), dig = seg(t, 62.6, 63.4), place = seg(t, 63.4, 63.9), cover = seg(t, 63.9, 64.8);
  layer(g => {
    sill(g, t, { tod: night > .5 ? 0 : 3, moon: night > .5, sun: night > .5 ? null : [250, 92 + lt * 1.5] });
    pot(g, px0, S0, t, 0, { sign: { lines: [{ s: '只是怕亲手', times: L7.t.slice(0, 5) }, { s: '将我的真心葬送', times: L7.t.slice(5) }], w: 90 }, glowHeart: place >= 1 ? .4 + .3 * Math.sin(t * 3) : 0 });
    // 心
    if (place < 1) {
      const hx = lerp(126, px0, E.io(place)), hy = lerp(lerp(S0 - 10, S0 - 22, E.out(take)), S0 - 14, E.io(place)) + rd(Math.sin(t * 3) * (place > 0 ? 0 : 1));
      if (take > 0) {
        const HP = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
        HP.forEach((r, j) => { for (let i = 0; i < 7; i++) if (r[i] === '#') px(g, hx - 3 + i, hy - 3 + j, j < 2 && i % 3 === 1 ? '#ffd0dc' : '#ff4f86'); });
      }
    }
    // 土被挖开又盖上
    if (dig > 0 && cover < 1) { rect(g, px0 - 4, S0 - 15, 9, 2, '#2a1a10'); rect(g, px0 + 6, S0 - 16 - rd(dig * 2), 4, 2, '#5b3a26'); }
    // Clawd
    const cx = 124, cy = S0;
    const patting = t > 64.6 && t < 65.6;
    clawd(g, cx, cy, {
      u: 2, t, eyes: t < 61.2 ? 'n' : t < 62.6 ? 'heart' : t < 65.6 ? 'closed' : 'sad',
      armR: take > 0 && take < 1 ? 2 : (t > 61.2 && t < 63.9) ? 1 : patting ? (fl(t * 8) % 2) * 2 : 0,
      look: 1, blinkOK: false,
    });
    // 入夜后 Clawd 抱膝坐在花盆旁边
  }, cam);
  const dusk = 1 - night;
  glow(sx(cam, 200), sy(cam, 70), 700, '#ff9a5a', .3 * dusk);
  if (night > 0) grade('#28305a', night * .5, 'multiply');
  if (t > 63.9) glow(sx(cam, px0), sy(cam, S0 - 14), 120, '#ff7aa8', (.25 + .1 * Math.sin(t * 3)) * seg(t, 63.9, 64.4));
  shafts([{ x: 300, w: 300, a: .2 * dusk, col: '#ffcf9a' }, { x: 900, w: 200, a: .14 * dusk, col: '#ffcf9a' }], .9, 18);
  grade('#ffd2a8', .15 * dusk, 'soft-light');
  bloom(.3, 1.1);
  dust(t, 14, 41, { a: .3 * dusk + .1 });
  vignette(.5);
}
