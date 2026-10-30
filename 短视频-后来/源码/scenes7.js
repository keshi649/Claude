'use strict';
/* scenes7.js —— 最后一遍副歌、结尾和尾奏（242.8~315.5 秒）：
   S57 清晨，阳台上那盆栀子开了。   S58 她低头闻花，笑了（和十七岁那次一样）。
   S59 她把书里那朵干花拿出来，风把它带走。   S60 干花飞过清晨的城市，底下是人海。
   S61 穿过金色的云，干花一点点变回白色。   S62 落回 2009 年的夏天，往长椅上的两个人飘过去。
   S63 落在蓝色百褶裙上——画面定格成一张照片，慢慢泛黄。
   S64 空长椅，四季转了一圈（"永远不会再重来"）。
   S65 那年夏夜，两个人躺在草地上：她看着星星，他看着她（"有一个男孩爱着那个女孩"）。
   S66 镜头升起来，萤火虫变成星星，升进银河。
   S67 现在：她把那张拍立得翻过来，背面是他写的"爱你"。
   S68 片名、演唱和词曲、"甜菜 出品"、画面说明，淡出。 */

const DAWN_L = { x: .8, y: -.4, rim: '#FFE0B8', rimA: .7, sh: .3, col: '#3A2030', warm: '#FFB080', warmA: .3 };
function dawnSky(g, t, y0 = 0) {
  g.fillStyle = lg(g, 0, y0, 0, y0 + 1500, [[0, '#4A5A9A'], [.4, '#E89AA0'], [.7, '#FFC898'], [1, '#FFE8C0']]); g.fillRect(0, 0, W, H);
  glow(g, 820, y0 + 1180, 700, '#FFF0C8', .8); circ(g, 820, y0 + 1180, 70, '#FFF6E0');
  g.drawImage(cloudImg(30, 700, 360, '#FFD8C8', '#C88A9A'), -150 + t * 6, y0 + 300, 800, 410);
  g.drawImage(cloudImg(31, 700, 360, '#FFE0D0', '#C88A9A'), 500 + t * 4, y0 + 640, 640, 330);
}

/* ---------------- S57 清晨的阳台，栀子开了 ---------------- */
function shDawnBloom(g, t, s) {
  const lt = t - s.t;
  dawnSky(g, t);
  g.drawImage(skyline(281, 1200, 700, { col: '#5A4A6A', lit: .05 }), -60, 1080);
  g.fillStyle = '#4A3A48'; g.fillRect(0, 1460, W, 30); for (let i = 0; i < 20; i++) g.fillRect(i * 60, 1460, 8, 460);
  g.fillStyle = '#3A2E3A'; g.fillRect(0, 1700, W, 220);
  potGardenia(g, 660, 1470, 2.2, E.out(seg(lt, 0, 1.6)));
  sunRays(g, t, 820, 1180, .7, { ang: -2.4, k: .18 });
}
/* ---------------- S58 闻花 ---------------- */
function shSmellAgain(g, t, s) {
  const lt = t - s.t;
  dawnSky(g, t, -300);
  bokeh(g, t, { n: 20, seed: 291, size: 140, a: .3, cols: ['#FFF0C8', '#FFD0B0', '#FFFFFF'] });
  const down = E.io(seg(lt, .3, 1.6));
  fig(g, { x: 380, y: 3500, h: 3000, who: 'woman', view: 'side', dir: 1, light: DAWN_L, eyes: down > .4 ? 'closed' : 'open', smile: down > .6, blush: .25, pose: { lean: .05 + down * .1, head: .05 + down * .38, arms: [{ sh: 0, el: 0 }, { sh: 0, el: 0 }] } });
  // 阳台上开着的栀子（近）
  for (let i = 0; i < 9; i++) leaf(g, 640 + Math.cos(i) * 200, 1300 + Math.sin(i * 1.7) * 120, 200, i * .7, '#2F6B3A');
  gardenia(g, 780, 1180, 150, .3 + t * .05, { tilt: .85 }); gardenia(g, 560, 1380, 110, 1.2, { tilt: .8 }); gardenia(g, 920, 1420, 120, 2.2, { tilt: .75 });
  const k = seg(lt, 1.2, 3.5);
  if (k > 0) { g.save(); g.globalCompositeOperation = 'screen'; for (let i = 0; i < 20; i++) { const ph = mod(t * .4 + i / 20, 1); glow(g, 760 - ph * 160 + Math.sin(ph * 8 + i) * 40, 1150 - ph * 450, 30 + ph * 30, '#FFE6A8', (1 - ph) * .55 * k); } g.restore(); }
}
/* ---------------- S59 放走干花 ---------------- */
function shRelease(g, t, s) {
  const lt = t - s.t;
  dawnSky(g, t, -200);
  g.drawImage(skyline(282, 1200, 700, { col: '#6A5A7A', lit: .05 }), -60, 1250);
  const fly = seg(lt, 1.1, s.e - s.t);
  hand(g, 160, 1350, 2.2, -.5, 'open', '#E8DCC8');
  const fx = lerp(560, 1250, E.in2(fly)) + Math.sin(fly * 6) * 60, fy = lerp(1050, 300, E.out2(fly));
  gardenia(g, fx, fy, 85, lt * (fly > 0 ? 3 : .2), { aged: .95, tilt: .9 });
  if (fly > 0) for (let i = 0; i < 5; i++) { const k = mod(lt * 1.5 + i / 5, 1); g.strokeStyle = `rgba(255,255,255,${.35 * (1 - k)})`; g.lineWidth = 3; g.beginPath(); g.moveTo(fx - 300 + k * 200, fy + 80 - i * 40); g.quadraticCurveTo(fx - 150, fy - 40 - i * 30, fx + k * 100, fy - i * 40); g.stroke(); }
}
/* ---------------- S60 飞过清晨的城市 ---------------- */
function shOverCity(g, t, s) {
  const lt = t - s.t;
  // 俯瞰清晨的城市：街道、屋顶（水箱、空调外机）、行道树、车，人行道上密密的小人——"人海"
  const BW = 300, BH = 360, off = lt * 140;
  g.fillStyle = '#5E5A66'; g.fillRect(0, 0, W, H);
  const r = R(351);
  for (let i = -1; i < 6; i++) for (let j = -1; j < 8; j++) {
    const x = i * BW - mod(off * .25, BW), y = j * BH - mod(off, BH), id = i * 31 + j + Math.floor(off / BH) * 7;
    // 人行道
    g.fillStyle = '#A89A98'; g.fillRect(x + 30, y + 30, BW - 60, BH - 60);
    // 屋顶
    const rc = ['#C89A8A', '#B8A0B0', '#D8B8A0', '#A8A0B8', '#C8B0A0'][mod(id, 5)];
    g.fillStyle = rc; g.fillRect(x + 50, y + 50, BW - 100, BH - 100);
    g.fillStyle = 'rgba(40,20,40,.35)'; g.fillRect(x + 50, y + BH - 70, BW - 100, 20); g.fillRect(x + BW - 70, y + 50, 20, BH - 100);   // 朝阳拉出的影子
    g.fillStyle = shade(rc, 1.15); g.fillRect(x + 70 + hash(id, 1) * 60, y + 80 + hash(id, 2) * 80, 50, 40);                          // 水箱
    for (let k = 0; k < 3; k++) { g.fillStyle = '#D8D4D0'; g.fillRect(x + 80 + k * 40, y + BH - 120, 26, 18); }                        // 空调外机
    // 行道树
    for (let k = 0; k < 3; k++) { circ(g, x + 40 + k * 110, y + 24, 22, '#4A7A4A'); circ(g, x + 34 + k * 110, y + 18, 10, '#6A9A5A'); }
  }
  // 车
  for (let k = 0; k < 10; k++) { const lane = k % 3, x = mod(hash(k, 3) * 1800 + t * (180 + k * 20), 1500) - 200, y = mod(hash(k, 4) * 3000 - off, 2600) - 300; const yy = Math.round((y + mod(off, BH)) / BH) * BH - mod(off, BH) + 4 + lane * 8; g.fillStyle = ['#E8E4DC', '#C04A3A', '#3A4A6A'][k % 3]; g.fillRect(x, yy, 46, 20); }
  // 人行道上的人（小点），密密地流
  for (let k = 0; k < 420; k++) {
    const col = Math.floor(hash(k, 1) * 6) - 1, bx = col * BW - mod(off * .25, BW) + 30 + hash(k, 2) * (BW - 60);
    const y = mod(hash(k, 3) * 2600 + Math.sin(k) * t * 25 - off, 2600) - 300;
    circ(g, bx, y, 4.5, ['#2A2A30', '#E8E0D0', '#8A3A3A', '#3A4A6A'][k % 4]);
  }
  tint(g, '#FFB080', .32, 'soft-light');
  // 干花从上往下斜着飞过，越来越近
  const k = lt / 3.2, fx = lerp(200, 760, k), fy = lerp(500, 1100, k), rr = lerp(70, 220, k);
  g.save(); g.shadowColor = 'rgba(0,0,0,.35)'; g.shadowBlur = 30; g.shadowOffsetY = 60;
  gardenia(g, fx, fy, rr, lt * 2, { aged: .9 - k * .3, tilt: .9 }); g.restore();
}
/* ---------------- S61 穿过金色的云 ---------------- */
function shThroughClouds(g, t, s) {
  const lt = t - s.t, k = seg(lt, 0, 2.0);
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#FFD8A0'], [1, '#FFF4E0']]); g.fillRect(0, 0, W, H);
  // 云一团团往镜头冲过来
  for (let i = 0; i < 8; i++) {
    const z = mod(hash(i, 1) + lt * .55, 1), sc = .4 + z * 3.2, x = 540 + (hash(i, 2) - .5) * 1400 * z, y = 960 + (hash(i, 3) - .5) * 2200 * z;
    g.save(); g.globalAlpha = Math.sin(z * PI) * .9; g.drawImage(cloudImg(40 + i % 3, 700, 360, '#FFF4E8', '#E8B890'), x - 350 * sc, y - 180 * sc, 700 * sc, 360 * sc); g.restore();
  }
  glow(g, 540, 900, 500, '#FFFFFF', .5 + k * .3);
  gardenia(g, 540, 900, 170, lt * 1.5, { aged: .7 * (1 - k), tilt: .9 });
}
/* ---------------- S62 落回 2009 年的夏天 ---------------- */
function shDescend(g, t, s) {
  const lt = t - s.t;
  const { gy } = benchScene(g, t, {});
  fig(g, { x: 400, y: gy, h: 860, who: 'boy', view: 'side', dir: 1, pose: Object.assign(POSE.sit(1.86), { lean: .05 }), light: SUM_L });
  fig(g, { x: 640, y: gy, h: 820, who: 'girl', view: 'side', dir: 1, pose: Object.assign(POSE.sit(), { head: .3, arms: [{ sh: .5, el: 1.35 }, { sh: .42, el: 1.45 }] }), light: SUM_L, eyes: 'down', blush: .3 });
  const k = seg(lt, 0, 4.6), px = lerp(820, 690, k) + Math.sin(k * 7) * 70, py = lerp(-100, 1380, E.out2(k));
  glow(g, px, py, 120, '#FFFFFF', .6);
  g.save(); g.translate(px, py); g.rotate(lt * 2); g.scale(Math.max(.3, Math.abs(Math.cos(lt * 3))), 1); g.drawImage(petalImg(), -30, -45, 60, 90); g.restore();
  petals(g, t, { n: 16, seed: 301, fall: 80, size: 26 });
  sunRays(g, t, 1000, 60, .7);
}
/* ---------------- S63 落在裙子上，定格成照片 ---------------- */
function shBecomePhoto(g, t, s) {
  const lt = t - s.t, fr = 1.6;
  const freeze = seg(lt, 2.9, 3.3), shrink = E.io(seg(lt, 3.3, 5.2)), age = seg(lt, 4.6, 6.6);
  const tt = lt < 2.9 ? t : s.t + 2.9;
  // 先画百褶裙的主观镜头（定格在 2.9 秒）
  const q = layer('becomePhoto');
  shSkirtPetals(q, ch(8, 6) + .3 + (tt - s.t) * .5, { t: ch(8, 0) - .3 });
  // 新落下的这一片
  const k = seg(lt, 0, fr), px = lerp(520, 470, k) + Math.sin(k * 6) * 60 * (1 - k), py = lerp(-60, 1230, E.out2(k));
  q.save(); q.translate(px, py); q.rotate(.6 + (1 - k) * 4); q.scale(k < 1 ? Math.max(.3, Math.abs(Math.cos(k * 6))) : 1, 1); q.shadowColor = 'rgba(20,30,70,.4)'; q.shadowBlur = 14; q.drawImage(petalImg(), -42, -63, 84, 126); q.restore();
  // 定格以后缩成一张拍立得，放在桌上，慢慢泛黄
  g.fillStyle = lg(g, 0, 0, W, H, [[0, '#3A2A24'], [1, '#1A1214']]); g.fillRect(0, 0, W, H); glow(g, 250, 300, 900, '#FFB060', .4 * shrink);
  const pw = lerp(1080 / .88 * 1.05, 600, shrink);
  polaroid(g, 540, lerp(960 + pw * .06, 900, shrink), pw, -.04 * shrink, (pc, w, h) => { pc.drawImage(LAYER.becomePhoto, 0, 420, 1080, 1080, 0, 0, w, h); }, { age: .2 + age * .8 });
  if (freeze > 0 && freeze < 1) { g.fillStyle = `rgba(255,255,255,${1 - freeze})`; g.fillRect(0, 0, W, H); }
  if (age > 0) tint(g, '#C89A60', age * .35, 'soft-light');
}
/* ---------------- S64 空长椅，四季 ---------------- */
function shSeasons(g, t, s) {
  const lt = t - s.t, d = s.e - s.t, k = lt / d;   // 夏 → 秋 → 冬 → 春 → 夏
  const sea = k * 4, ph = Math.floor(sea), f = sea - ph;
  const { gy } = benchScene(g, t, {});
  const tints = ['#FFD08A', '#E0782A', '#D8E4F0', '#FFC0D0', '#FFD08A'];
  tint(g, mix(tints[ph], tints[ph + 1] || tints[4], smooth(f)), .45, 'soft-light');
  const winter = env(k, .4, .5, .7, .78), autumn = env(k, .15, .25, .4, .48), spring = env(k, .72, .8, .92, 1);
  if (winter > 0) { g.fillStyle = `rgba(240,245,255,${.75 * winter})`; g.fillRect(0, gy - 70, W, H); g.fillRect(260, gy - 1.95 * 820 / 7.3 - 20, 520, 14 * winter); snow(g, t, { n: Math.floor(160 * winter), seed: 311 }); }
  if (autumn > 0) withAlpha(g, autumn, () => autumnLeaves(g, t, { n: 40, seed: 312 }));
  if (spring > 0) withAlpha(g, spring, () => petals(g, t, { n: 30, seed: 313, fall: 100, wind: 60 }));
  // 光影快速转动（时间在流逝）
  g.fillStyle = `rgba(0,0,20,${.18 * (.5 + .5 * Math.sin(lt * 5))})`; g.fillRect(0, 0, W, H);
}

/* ---------------- S65 夏夜躺在草地上：她看星星，他看她 ---------------- */
function shBoyLovesGirl(g, t, s) {
  const lt = t - s.t, z = 1.15 - lt * .025;
  g.save(); g.translate(W / 2, H * .45); g.rotate(.06 - lt * .012); g.scale(z, z); g.translate(-W / 2, -H * .45);
  // 俯拍的草地
  g.fillStyle = lg(g, 0, 0, W, H, [[0, '#0E1E1E'], [1, '#08120F']]); g.fillRect(-200, -200, W + 400, H + 400);
  const r = R(321);
  for (let i = 0; i < 500; i++) { const x = r() * (W + 400) - 200, y = r() * (H + 400) - 200, a = r() * TAU; g.strokeStyle = r() > .5 ? '#16302A' : '#1E3A30'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * 30, y + Math.sin(a) * 30); g.stroke(); }
  for (let i = 0; i < 18; i++) gardenia(g, r() * W, r() * H, 22 + r() * 14, r() * 6, { tilt: .9 });
  glow(g, 540, 800, 700, '#7A8AE0', .25);
  // 两个人并排躺着（头朝上），月光从上面照下来
  const L = { x: 0, y: -1, rim: '#C8D4FF', rimA: .45, sh: .3, col: '#0A0A20' };
  const turn = E.io(seg(t, ch(54, 0) - .2, ch(54, 3))), smile = t > ch(54, 5) - .2;
  // 躺着：她的头发在草上散开
  const hu = 1250 / 7.3, hy = 1720 - 6.8 * hu;
  g.fillStyle = '#1E1A22'; g.beginPath(); g.ellipse(660, hy - .1 * hu, 1.05 * hu, .95 * hu, 0, 0, TAU); g.fill();
  for (let i = 0; i < 7; i++) { const a = -PI + i / 6 * PI; g.beginPath(); g.ellipse(660 + Math.cos(a) * .9 * hu, hy + Math.sin(a) * .8 * hu, .45 * hu, .2 * hu, a, 0, TAU); g.fill(); }
  fig(g, { x: 660, y: 1720, h: 1250, who: 'girl', view: 'front', light: L, eyes: 'open', smile: 1, blush: .4, swing: 0, pose: { tilt: -.04, arms: [{ sh: .3, el: .1 }, { sh: .15, el: .1 }] } });
  fig(g, { x: 400, y: 1760, h: 1320, who: 'boy', view: 'front', light: L, eyes: 'open', gaze: turn, smile: smile ? 1 : 0, pose: { tilt: -.35 * turn, hx: .1 * turn, arms: [{ sh: .15, el: .1 }, { sh: .3, el: .1 }] } });
  // 压在身上、身边的草叶和小花（看得出是躺在草地上）
  const r2 = R(324);
  for (let i = 0; i < 260; i++) {
    const x = 120 + r2() * 840, y = 250 + r2() * 1600, a = r2() * TAU, l = 20 + r2() * 30;
    if (x > 250 && x < 820 && y > 480 && y < 1730) continue;   // 只压在身边，不划过身上
    g.strokeStyle = r2() > .5 ? '#1E4A3A' : '#2A5A44'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); g.stroke();
  }
  for (let i = 0; i < 6; i++) gardenia(g, 200 + r2() * 700, 400 + r2() * 1300, 16, r2() * 6, { tilt: .9 });
  g.restore();
  // 镜头前虚化的萤火虫
  fireflies(g, t, { n: 30, size: 40, seed: 322 });
  g.save(); g.filter = 'blur(6px)'; fireflies(g, t, { n: 8, size: 90, seed: 323, a: .8 }); g.restore();
}
/* ---------------- S66 升进银河 ---------------- */
function shRiseStars(g, t, s) {
  const lt = t - s.t, up = E.io(seg(lt, 0, 7.5));
  g.save(); g.translate(0, up * 1900);
  nightField(g, t, {});
  // 草坡上并排坐着的两个人（剪影）
  const L = { x: 0, y: -1, rim: '#AFC4FF', rimA: .55, sh: 0 };
  fig(g, { x: 440, y: 2080, h: 900, who: 'boy', view: 'back', sil: '#0A0D1E', light: L, pose: { tilt: .08 } });
  fig(g, { x: 640, y: 2100, h: 860, who: 'girl', view: 'back', sil: '#0A0D1E', light: L, pose: { tilt: -.2, hx: -.2 } });
  g.fillStyle = '#060812'; spline(g, [[-50, 1700], [300, 1650], [700, 1690], [1130, 1640], [1130, H + 10], [-50, H + 10]], true, .4); g.fill();
  // 天往上接着画：更深的夜空和银河
  g.fillStyle = lg(g, 0, -1900, 0, 0, [[0, '#020310'], [1, '#04061A']]); g.fillRect(0, -1920, W, 1930);
  g.drawImage(milkyWay(5), 0, -1900);
  stars(g, t, { n: 500, seed: 331 }); g.save(); g.translate(0, -1900); stars(g, t, { n: 600, seed: 332 }); g.restore();
  g.restore();
  // 萤火虫一路往上飘，变成星星
  fireflies(g, t, { n: 50, rise: 160, y0: 600, y1: 2400, size: 24, seed: 333 });
  // 升到顶以后，星星一颗颗连起来，连成一朵栀子花
  const cst = seg(lt, 4.2, 8.6);
  if (cst > 0) {
    const cx = 540, cy = 820, pts = [];
    for (let i = 0; i < 6; i++) { const a = i / 6 * TAU - PI / 2; pts.push([[cx + Math.cos(a) * 90, cy + Math.sin(a) * 90], [cx + Math.cos(a + .32) * 290, cy + Math.sin(a + .32) * 290], [cx + Math.cos(a) * 330, cy + Math.sin(a) * 330], [cx + Math.cos(a - .32) * 250, cy + Math.sin(a - .32) * 250]]); }
    g.save(); g.globalCompositeOperation = 'screen'; g.lineCap = 'round';
    pts.forEach((pp, i) => {
      const k = clamp(cst * 7 - i);
      if (k <= 0) return;
      g.strokeStyle = `rgba(210,225,255,${.55 * k})`; g.lineWidth = 2.5;
      g.beginPath(); g.moveTo(pp[0][0], pp[0][1]);
      for (let j = 1; j < pp.length * k; j++) g.lineTo(pp[j][0], pp[j][1]);
      g.lineTo(lerp(pp[0][0], pp[0][0], 1), pp[0][1] * (k >= 1 ? 1 : 1)); if (k >= 1) g.stroke(); else g.stroke();
      for (const [x, y] of pp) { glow(g, x, y, 26, '#E8F0FF', .8 * k); circ(g, x, y, 3.5, `rgba(255,255,255,${k})`); }
    });
    glow(g, cx, cy, 120, '#FFF4D8', .5 * cst);
    g.restore();
  }
  const m = seg(lt, 6.8, 7.6);
  if (m > 0 && m < 1) { const x = lerp(950, 250, m), y = lerp(250, 700, m); g.save(); g.globalCompositeOperation = 'screen'; g.strokeStyle = lg(g, x, y, x + 320, y - 200, [[0, 'rgba(255,255,255,.95)'], [1, 'rgba(255,255,255,0)']]); g.lineWidth = 5; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 320, y - 200); g.stroke(); g.restore(); }
}
/* ---------------- S67 照片背面 ---------------- */
function photoBack(g, w, h) {
  // 卡片背面：米白的纸，蓝色圆珠笔写的"爱你"和日期
  g.fillStyle = '#F1EBDD'; g.fillRect(-w / 2, -h / 2, w, h);
  g.strokeStyle = 'rgba(160,140,110,.25)'; g.lineWidth = 2; g.strokeRect(-w / 2 + 14, -h / 2 + 14, w - 28, h - 28);
  g.save(); g.rotate(-.06);
  g.font = `${w * .3}px ${FONT.hand}`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = '#2A4A9A'; g.fillText('爱你', 0, -h * .06);
  g.font = `${w * .085}px ${FONT.hand}`; g.fillText('2009.7.17', w * .12, h * .24);
  g.restore();
}
function shPhotoBack(g, t, s) {
  const lt = t - s.t, flip = E.io(seg(lt, 2.4, 3.6)), z = 1 + seg(lt, 3.6, 9.6) * .12;
  g.fillStyle = lg(g, 0, 0, W, H, [[0, '#5A4A40'], [1, '#2A2024']]); g.fillRect(0, 0, W, H);
  glow(g, 900, 200, 1000, '#FFE8C0', .55);
  potGardenia(g, 860, 1500, 1.6, 1);
  g.save(); g.translate(540, 960); g.scale(z, z); g.translate(-540, -960);
  // 翻过来：横向压扁到 0 再展开
  const sx = Math.cos(flip * PI), back = sx < 0;
  g.save(); g.translate(500, 900); g.scale(Math.max(.02, Math.abs(sx)), 1); g.translate(-500, -900);
  if (!back) polaroid(g, 500, 900, 560, -.05, photoSummer, { age: .55, under: handBehind, over: handFront });
  else polaroid(g, 500, 900, 560, -.05, () => {}, { age: 0, paper: '#F1EBDD', back: (q, w, h) => photoBack(q, w, h), under: handBehind, over: handFront });
  g.restore();
  // 一滴眼泪落在背面
  const d = seg(lt, 6.2, 6.7);
  if (back && d > 0) { const y = lerp(300, 1040, E.in2(d)); if (d < 1) { g.fillStyle = 'rgba(220,235,255,.8)'; g.beginPath(); g.ellipse(620, y, 10, 15, 0, 0, TAU); g.fill(); } else { g.fillStyle = 'rgba(120,140,190,.25)'; g.beginPath(); g.ellipse(620, 1040, 26 + seg(lt, 6.7, 7.5) * 10, 20, 0, 0, TAU); g.fill(); } }
  g.restore();
  leak(g, t, .2, 3);
}
/* ---------------- S68 片尾 ---------------- */
function shEnd(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#03051A'], [.7, '#141848'], [1, '#2A2050']]); g.fillRect(0, 0, W, H);
  g.drawImage(milkyWay(6), 0, -200 - lt * 8);
  stars(g, t, { n: 500, seed: 341 });
  // 阳台上开着的栀子（剪影 + 月光）
  g.fillStyle = '#0A0A18'; g.fillRect(0, 1720, W, 200); for (let i = 0; i < 20; i++) g.fillRect(i * 60, 1640, 6, 80); g.fillRect(0, 1640, W, 14);
  potGardenia(g, 820, 1650, 1.3, 1);
  petals(g, t, { n: 10, seed: 342, fall: 40, size: 24, alpha: .7 });
}
function endCredits(g, t) {
  const t0 = 301.6;
  if (t < t0) return;
  const fadeAll = 1 - seg(t, 311.2, 315.0);
  const a = (d) => E.out(seg(t, t0 + d, t0 + d + 1.0)) * fadeAll;
  // 片名
  const u = seg(t, t0, t0 + 1.4);
  if (u > 0) {
    const q = layer('endTitle', 760, 400);
    q.font = `300px ${FONT.brush}`; q.textAlign = 'center'; q.textBaseline = 'middle'; q.shadowColor = 'rgba(255,220,170,.9)'; q.shadowBlur = 34; q.fillStyle = '#FFFBF2'; q.fillText('后来', 380, 210);
    q.globalCompositeOperation = 'destination-in'; q.fillStyle = lg(q, 0, 0, 760, 0, [[0, '#000'], [clamp(u * 1.2 - .05), '#000'], [clamp(u * 1.2 + .15), 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0)']]); q.fillRect(0, 0, 760, 400);
    g.save(); g.globalAlpha = fadeAll; g.drawImage(LAYER.endTitle, 490 - 380, 560 - 200); g.restore();
  }
  text(g, '演唱  刘若英', 490, 820, 40, '#F4EEE2', { alpha: a(1.2), ls: 4, shadow: 'rgba(0,0,0,.6)', blur: 10 });
  text(g, '作词  施人诚    作曲  玉城千春', 490, 890, 32, '#E8E0D0', { alpha: a(1.8), ls: 2, shadow: 'rgba(0,0,0,.6)', blur: 10 });
  text(g, '甜菜 出品', 490, 1060, 64, '#FFF6E6', { alpha: a(2.8), weight: 700, ls: 8, shadow: 'rgba(255,200,150,.6)', blur: 24 });
  text(g, '画面：Claude 用代码生成', 490, 1150, 30, '#D8D0C4', { alpha: a(3.6), ls: 2, shadow: 'rgba(0,0,0,.6)', blur: 10 });
  if (t > 311.2) { g.fillStyle = `rgba(0,0,0,${E.in2(seg(t, 311.2, 315.2))})`; g.fillRect(0, 0, W, H); }
}
