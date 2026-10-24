'use strict';
/* scenes4.js —— "那时候的爱情"到"有没有人能让你不寂寞"（89.8~153 秒）：
   S23 林荫道上，他骑车，她侧坐在后座，裙子被风吹起来。
   S24 台阶上一人一只耳机，她靠到他肩上。
   S25 阴天，校门口吵架。   S26 她转身走了，他伸出的手放下来。
   S27 下雨了，那朵栀子掉进水洼；他走过来，把它捡起来。
   S28 两扇窗：她在这个城市的雨夜，他在另一个城市的晴夜。   S29 同一个月亮。   S30 她拿着照片，他拿着那朵干花。
   S31 毕业那年的站台，他在等，她躲在柱子后面。   S32 车门关了，火车开走，她追了几步。
   S33 "如果当时"：她跑过去抱住他（过曝的梦）。   S34 梦碎了，站台空了。
   S35 旧盒子里的照片：笑着的他、不说话的他。   S36 手机：打了"这些年，你还好吗"，又一个字一个字删掉。 */

/* ---------------- 单车（侧面，朝右） ---------------- */
function bicycle(g, x, y, s, t, spin) {
  // (x,y) 两轮中间的地面；s 轮子半径
  const r = s, bx = x - r * 1.45, fx = x + r * 1.45, wy = y - r;
  for (const cx of [bx, fx]) {
    g.strokeStyle = '#1E1E24'; g.lineWidth = r * .09; g.beginPath(); g.arc(cx, wy, r, 0, TAU); g.stroke();
    g.strokeStyle = 'rgba(200,200,210,.55)'; g.lineWidth = 1.5;
    for (let i = 0; i < 16; i++) { const a = i / 16 * TAU + spin; g.beginPath(); g.moveTo(cx, wy); g.lineTo(cx + Math.cos(a) * r * .95, wy + Math.sin(a) * r * .95); g.stroke(); }
    circ(g, cx, wy, r * .08, '#888');
  }
  const seat = [x - r * .35, wy - r * 1.15], crank = [x - r * .15, wy], head = [fx - r * .25, wy - r * 1.25];
  g.strokeStyle = '#2E5A8A'; g.lineWidth = r * .1; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(bx, wy); g.lineTo(crank[0], crank[1]); g.lineTo(seat[0], seat[1]); g.lineTo(bx, wy); g.moveTo(seat[0] + r * .05, seat[1] + r * .2); g.lineTo(head[0], head[1] + r * .15); g.lineTo(crank[0], crank[1]); g.moveTo(head[0], head[1]); g.lineTo(fx, wy); g.stroke();
  // 后座架子
  g.strokeStyle = '#3A3A44'; g.lineWidth = r * .06; g.beginPath(); g.moveTo(bx - r * .55, wy - r * .85); g.lineTo(seat[0] - r * .1, wy - r * .85); g.moveTo(bx, wy); g.lineTo(bx - r * .3, wy - r * .85); g.stroke();
  // 车把、车座
  g.strokeStyle = '#222'; g.lineWidth = r * .07; g.beginPath(); g.moveTo(head[0], head[1]); g.lineTo(head[0] - r * .05, head[1] - r * .35); g.lineTo(head[0] - r * .35, head[1] - r * .4); g.stroke();
  g.fillStyle = '#2A2226'; ell(g, seat[0] - r * .05, seat[1] - r * .08, r * .3, r * .1, 0);
  // 曲柄
  g.strokeStyle = '#555'; g.lineWidth = r * .05; const ca = spin * .55;
  g.beginPath(); g.moveTo(crank[0] + Math.cos(ca) * r * .35, crank[1] + Math.sin(ca) * r * .35); g.lineTo(crank[0] - Math.cos(ca) * r * .35, crank[1] - Math.sin(ca) * r * .35); g.stroke();
  return { seat, rack: [bx - r * .3, wy - r * .85], bar: [head[0] - r * .3, head[1] - r * .4], crank, ca };
}

/* ---------------- 林荫道 ---------------- */
function treeRoad(g, t, camX) {
  skyGrad(g, [[0, '#7CC0EC'], [.4, '#CDE8F0'], [.62, '#F2EAD0']]);
  // 远处的田和树
  g.fillStyle = '#9EC27A'; g.fillRect(0, 1180, W, 200);
  for (let i = -1; i < 10; i++) { const x = i * 150 - mod(camX * .2, 150); g.fillStyle = i % 2 ? '#6FA060' : '#5E9050'; g.beginPath(); g.ellipse(x, 1170, 100, 70, 0, 0, TAU); g.fill(); }
  // 路
  g.fillStyle = lg(g, 0, 1360, 0, H, [[0, '#BDB4A2'], [1, '#8E8678']]); g.fillRect(0, 1360, W, H);
  g.fillStyle = '#E8E2D2'; for (let i = -1; i < 8; i++) g.fillRect(i * 220 - mod(camX, 220), 1640, 120, 10);
  // 中景的树干、上面的树冠
  for (let i = -1; i < 5; i++) {
    const x = i * 380 - mod(camX * .7, 380) + 120;
    g.fillStyle = '#5A4636'; g.fillRect(x - 22, 300, 44, 1080);
    g.fillStyle = '#3E7A3E'; g.beginPath(); g.ellipse(x, 250, 320, 380, 0, 0, TAU); g.fill();
  }
  // 树荫的光斑在路上闪
  for (let i = 0; i < 30; i++) {
    const x = mod(hash(i, 3) * 2200 - camX, 2200) - 100, y = 1400 + hash(i, 4) * 500, a = .15 + .12 * Math.sin(t * 2 + i);
    g.fillStyle = `rgba(255,248,210,${a})`; g.beginPath(); g.ellipse(x, y, 60 + hash(i, 5) * 60, 14, 0, 0, TAU); g.fill();
  }
}
function shBicycle(g, t, s) {
  const lt = t - s.t, camX = lt * 900;
  treeRoad(g, t, camX);
  const x = 520, gy = 1720, r = 170, spin = lt * 12;
  const bike = bicycle(g, x, gy, r, t, spin);
  // 他：坐在车座上蹬车
  const L = { x: .7, y: -.7, rim: '#FFF2D0', rimA: .5, sh: .2 }, u = 820 / 7.3;
  const ca = bike.ca, legs = [0, 1].map(k => { const a = ca + k * PI; return { th: 1.05 + Math.sin(a) * .35, kn: 1.15 + Math.cos(a) * .35 }; });
  fig(g, { x: bike.seat[0] + .1 * u, y: bike.seat[1] + 3.82 * u - .1 * u, h: 820, who: 'boy', view: 'side', dir: 1, light: L, pose: { lean: .32, head: -.2, legs, arms: [{ sh: 1.05, el: .2 }, { sh: 1.0, el: .25 }] } });
  // 她：侧坐在后座上（脸朝镜头），一手抓着他的衣角，小腿晃
  const sw = Math.sin(t * 3) * .12;
  fig(g, { x: bike.rack[0] - 10, y: bike.rack[1] + 3.82 * 112 - 1.0 * 112, h: 800, who: 'girl', view: 'front', light: SUM_L, eyes: 'closed', smile: 1, blush: .5, swing: .25 + sw * .3, pose: { sitF: 1, hip: 1.0, tilt: .08, legs: [{ sw: sw * 2 }, { sw: -sw * 2 + .1 }], arms: [{ sh: .15, el: .2 }, { sh: .9, el: .9 }] } });
  // 风里的叶子和花瓣
  petals(g, t, { n: 24, seed: 71, fall: 120, wind: -700, size: 30, wrap: 1, x0: -200, x1: W + 600 });
  { const x0 = mod(-camX * 1.6, 3600) - 300; g.save(); g.filter = 'blur(10px)'; g.fillStyle = '#1E3A22'; g.fillRect(x0, 0, 46, H); g.restore(); }   // 镜头前偶尔一闪而过的树干（虚的）
  sunRays(g, t, 980, 80, .6);
}

/* ---------------- S24 一人一只耳机 ---------------- */
function shEarphones(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#F2D6A8'], [.5, '#E8C08A'], [1, '#B08A62']]); g.fillRect(0, 0, W, H);
  glow(g, 900, 300, 900, '#FFE8B8', .7);
  // 台阶
  for (let i = 0; i < 6; i++) { g.fillStyle = shade('#C9B89A', 1 - i * .04); g.fillRect(0, 1180 + i * 130, W, 130); g.fillStyle = 'rgba(80,60,40,.25)'; g.fillRect(0, 1180 + i * 130, W, 10); }
  const lean = E.io(seg(t, ch(18, 5) - .3, ch(18, 7)));
  const L = { x: .7, y: -.6, rim: '#FFF0D0', rimA: .5, sh: .2 };
  // 并排坐在台阶上，脸朝镜头；她慢慢歪过去，靠在他肩上
  const seatY = 1440, ub = 1000 / 7.3, ug = 960 / 7.3;
  const B = { x: 400, y: seatY + 2.82 * ub, h: 1000, who: 'boy', view: 'front', light: L, eyes: 'closed', smile: lean, pose: { sitF: 1, hip: 1.0, tilt: .05 * lean, legs: [{ sw: .1 }, { sw: -.05 }], arms: [{ sh: .12, el: .5 }, { sh: .25, el: .9 }] } };
  const G2 = { x: 640 - lean * 30, y: seatY + 2.82 * ug, h: 960, who: 'girl', view: 'front', light: L, eyes: 'closed', smile: 1, blush: .45 + lean * .2, pose: { sitF: 1, hip: 1.0, tilt: -.38 * lean, hx: -.35 * lean, legs: [{ sw: Math.sin(t * 2) * .1 }, { sw: -Math.sin(t * 2) * .1 }], arms: [{ sh: .3, el: .8 }, { sh: .12, el: .5 }] } };
  fig(g, B); fig(g, G2);
  // 白色耳机线：从两个人挨着的那只耳朵垂下来，在中间连成一根
  const e1 = [B.headP[0] + .44 * B.u, B.headP[1] + .12 * B.u], e2 = [G2.headP[0] - .44 * G2.u * Math.cos(.38 * lean), G2.headP[1] + .12 * G2.u + .2 * G2.u * lean], mid = [(e1[0] + e2[0]) / 2, Math.max(e1[1], e2[1]) + 300];
  g.strokeStyle = '#F8F8F8'; g.lineWidth = 4; g.beginPath(); g.moveTo(e1[0], e1[1]); g.quadraticCurveTo(e1[0] + 10, mid[1] - 60, mid[0], mid[1]); g.quadraticCurveTo(e2[0] - 10, mid[1] - 60, e2[0], e2[1]); g.lineTo(mid[0], mid[1]); g.lineTo(mid[0], mid[1] + 160); g.stroke();
  circ(g, e1[0], e1[1], 9, '#FFFFFF'); circ(g, e2[0], e2[1], 9, '#FFFFFF');
  // 飘起来的音符
  for (let i = 0; i < 8; i++) { const k = mod(lt * .4 + i / 8, 1), x = 540 + Math.sin(k * 6 + i) * 160, y = 900 - k * 600; text(g, i % 2 ? '♪' : '♫', x, y, 50 + i % 3 * 10, `rgba(255,255,255,${Math.sin(k * PI) * .8})`, { font: 'sans', weight: 400 }); }
  leak(g, t, .25, 1);
}

/* ---------------- 校门口（S25、S26） ---------------- */
function schoolGate(g, t, dark = 0) {
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, mix('#9AA4B0', '#4E5664', dark)], [.6, mix('#C8CCD0', '#6A707A', dark)], [1, '#5A5E62']]); g.fillRect(0, 0, W, H);
  // 压下来的云
  for (let i = 0; i < 5; i++) g.drawImage(cloudImg(10 + i, 700, 360, mix('#B8BEC8', '#5A6070', dark), '#6A7080'), -200 + i * 300 + Math.sin(t * .2 + i) * 30 - (t * 20 % 300), 80 + (i % 2) * 160, 900, 460);
  // 校门：两根门柱、铁门
  g.fillStyle = '#8A8A8A'; g.fillRect(120, 760, 120, 760); g.fillRect(840, 760, 120, 760);
  g.fillStyle = '#6A6A6A'; g.fillRect(100, 740, 160, 40); g.fillRect(820, 740, 160, 40);
  g.strokeStyle = '#3A3A40'; g.lineWidth = 8; for (let i = 0; i < 13; i++) { g.beginPath(); g.moveTo(260 + i * 45, 900); g.lineTo(260 + i * 45, 1520); g.stroke(); }
  g.beginPath(); g.moveTo(240, 960); g.lineTo(840, 960); g.moveTo(240, 1440); g.lineTo(840, 1440); g.stroke();
  g.fillStyle = '#5A5E62'; g.fillRect(0, 1520, W, 400);
  g.fillStyle = 'rgba(0,0,0,.15)'; g.fillRect(0, 1520, W, 20);
}
function shArgue(g, t, s) {
  const lt = t - s.t;
  schoolGate(g, t, .2);
  const L = { x: .3, y: -1, rim: '#E8ECF4', rimA: .4, sh: .3, col: '#2A2E3A' };
  const gest = Math.sin(lt * 5) * .2 + .2;
  fig(g, { x: 340, y: 1700, h: 1050, who: 'boy', view: 'side', dir: 1, light: L, pose: { lean: .08, head: .05, arms: [{ sh: .7 + gest, el: .6 }, { sh: .2, el: .3 }] } });
  const away = E.io(seg(lt, 1.6, 2.6));
  fig(g, { x: 720, y: 1700, h: 1000, who: 'girl', view: 'side', dir: -1, light: L, eyes: 'down', pose: { lean: -.05, head: .15 + away * .1, arms: [{ sh: .9, el: 1.9 }, { sh: .85, el: 2.0 }] }, swing: .1 * Math.sin(t * 2) });
  petals(g, t, { n: 12, seed: 81, fall: 80, wind: 400, size: 26, alpha: .7 });
}
function shWalkAway(g, t, s) {
  const lt = t - s.t;
  schoolGate(g, t, .45);
  // 她背对着走远（越来越小），他在前景伸手，又放下
  const k = E.in2(seg(lt, 0, 4.2)), gx = lerp(620, 760, k), gyy = lerp(1650, 1470, k), gh = lerp(900, 380, k);
  fig(g, { x: gx, y: gyy, h: gh, who: 'girl', view: 'back', light: { x: 0, y: -1, sh: .3 }, swing: .1 * Math.sin(lt * 5), pose: { legs: [{ sp: .02 + .05 * Math.sin(lt * 6) }, { sp: .02 - .05 * Math.sin(lt * 6) }] } });
  const reach = env(lt, .3, 1.0, 2.2, 3.2);
  fig(g, { x: 230, y: 2300, h: 1900, who: 'boy', view: 'side', dir: 1, light: { x: .3, y: -1, sh: .45, col: '#1A1E28' }, pose: { lean: .04, head: .08, arms: [{ sh: .2 + reach * 1.1, el: .2 - reach * .1 }, { sh: .05, el: .2 }] } });
  if (lt > 3.6) rain(g, t, { n: Math.floor(seg(lt, 3.6, 4.4) * 120), len: 60, lw: 2, col: 'rgba(220,230,240,.35)', seed: 91 });
}

/* ---------------- S27 栀子花掉进水洼，他捡起来 ---------------- */
function shPuddle(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#4A5060'], [1, '#2A2E38']]); g.fillRect(0, 0, W, H);
  // 地砖
  g.strokeStyle = 'rgba(20,22,30,.5)'; g.lineWidth = 4;
  for (let i = 0; i < 12; i++) { g.beginPath(); g.moveTo(0, 600 + i * 120 + i * i * 4); g.lineTo(W, 600 + i * 120 + i * i * 4); g.stroke(); }
  // 水洼：映着灰白的天
  const px = 540, py = 1250;
  g.fillStyle = lg(g, 0, py - 260, 0, py + 260, [[0, '#9AA4B4'], [1, '#6A7484']]); g.beginPath(); g.ellipse(px, py, 460, 250, 0, 0, TAU); g.fill();
  g.save(); g.beginPath(); g.ellipse(px, py, 460, 250, 0, 0, TAU); g.clip();
  splashes(g, t, { n: 30, y0: py - 240, y1: py + 240, flat: .5, col: 'rgba(230,240,255,.6)', seed: 12 });
  g.restore();
  // 花：慢慢掉下来（0.2~1.4 秒），落进水里，溅起水花，漂着
  const fall = seg(lt, .2, 1.4), fy = lerp(-200, py, E.in2(fall)), rot = lt * .3;
  if (fall >= 1) {
    const k = seg(lt, 1.4, 2.4);
    if (k < 1) { g.strokeStyle = `rgba(240,245,255,${(1 - k) * .8})`; g.lineWidth = 5; for (let i = 0; i < 3; i++) { g.beginPath(); g.ellipse(px, py, 40 + k * 300 + i * 50, (40 + k * 300 + i * 50) * .5, 0, 0, TAU); g.stroke(); } }
    for (let i = 0; i < 12 && k < .6; i++) { const a = i / 12 * PI, d = k * 400; circ(g, px + Math.cos(a) * d, py - Math.sin(a) * d * 1.2 + k * k * 600, 8, 'rgba(230,240,255,.7)'); }
  }
  const picked = E.io(seg(lt, 3.8, 5.0));
  if (picked < 1 || lt < 3.8) gardenia(g, px + Math.sin(lt * .7) * 8 * (fall >= 1 ? 1 : 0), fall >= 1 ? py - picked * 700 : fy, 120, rot, { tilt: .55, aged: .1 });
  // 他的影子先落进来（3.0 秒），手伸下来把花捡起
  const step = E.out(seg(lt, 2.6, 3.4));
  g.fillStyle = `rgba(10,12,20,${.35 * step})`; g.beginPath(); g.ellipse(px + 200, py - 380, 520, 260, -.3, 0, TAU); g.fill();
  if (lt > 3.4) {
    const hd = E.io(seg(lt, 3.4, 3.9));
    hand(g, px + 40, lerp(-200, py - 120, hd) - picked * 700, 1.4, PI / 2 + .3, 'open', SKIN);
  }
  rain(g, t, { n: 200, len: 90, lw: 2, col: 'rgba(220,230,245,.4)', seed: 93 });
}

/* ---------------- 夜里的窗（S28~S30 共用）：x0,y0,w,h 区域里画一扇窗、窗里的人 ---------------- */
function nightWindow(g, t, x0, y0, w, h, o) {
  g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
  g.fillStyle = lg(g, 0, y0, 0, y0 + h, [[0, o.sky0], [1, o.sky1]]); g.fillRect(x0, y0, w, h);
  stars(g, t, { n: 60, y1: H, seed: o.seed });
  if (o.moon) { glow(g, o.moon[0], o.moon[1], 260, '#FFF4D8', .6); circ(g, o.moon[0], o.moon[1], 70, '#FFF6E2'); }
  // 楼的外墙和那扇亮着的窗
  g.fillStyle = o.wall; g.fillRect(x0, y0 + h * .3, w, h);
  for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) { if ((i + j + o.seed) % 3 === 0) { g.fillStyle = 'rgba(255,214,150,.5)'; g.fillRect(x0 + 60 + i * 170, y0 + h * .36 + j * 150, 90, 100); } }
  const wx = o.wx, wy = y0 + h * .28, ww = 420, wh = 470;
  g.fillStyle = o.inner; g.fillRect(wx, wy, ww, wh); glow(g, wx + ww * .3, wy + wh * .4, 360, '#FFC070', .5);
  if (o.rain) rainGlass(g, t, wx, wy, ww, wh, { n: 50, seed: o.seed });
  o.who(g, wx, wy, ww, wh);
  g.strokeStyle = '#1A1820'; g.lineWidth = 16; g.strokeRect(wx, wy, ww, wh); g.beginPath(); g.moveTo(wx + ww / 2, wy); g.lineTo(wx + ww / 2, wy + wh); g.stroke();
  if (o.rain) rain(g, t, { n: 80, len: 60, lw: 2, col: 'rgba(200,220,255,.3)', seed: o.seed + 3 });
  g.restore();
}
function herWin(g, t, x0, y0, w, h, look = 0) {
  nightWindow(g, t, x0, y0, w, h, { sky0: '#0A0E22', sky1: '#1E2440', wall: '#191B28', inner: '#5A4038', wx: 330, seed: 3, rain: 1, who: (q, wx, wy, ww, wh) => {
    fig(q, { x: wx + ww * .55, y: wy + wh + 560, h: 1100, who: 'woman', view: 'side', dir: -1, sil: '#1A1218', light: { x: -1, y: 0, rim: '#FFC890', rimA: .8 }, pose: { head: -look * .4 } });
  } });
}
function hisWin(g, t, x0, y0, w, h, look = 0, moonY) {
  nightWindow(g, t, x0, y0, w, h, { sky0: '#0C1430', sky1: '#24305A', wall: '#1A1E2C', inner: '#4A4038', wx: 330, seed: 8, moon: moonY ? [540, moonY] : null, who: (q, wx, wy, ww, wh) => {
    fig(q, { x: wx + ww * .45, y: wy + wh + 600, h: 1180, who: 'man', view: 'side', dir: 1, sil: '#16121A', light: { x: 1, y: 0, rim: '#FFC890', rimA: .8 }, pose: { head: -look * .4 } });
  } });
}
function shTwoWindows(g, t, s) {
  const lt = t - s.t;
  herWin(g, t, 0, 0, W, H / 2, 0);
  hisWin(g, t, 0, H / 2, W, H / 2, 0);
  g.fillStyle = '#05060C'; g.fillRect(0, H / 2 - 6, W, 12);
  const k = seg(lt, 0, .8);
  g.fillStyle = `rgba(0,0,0,${1 - k})`; g.fillRect(0, 0, W, H);
}
function shSameMoon(g, t, s) {
  const lt = t - s.t, look = E.io(seg(lt, .2, 1.2));
  // 一整片夜空当背景，中间一个大月亮；上半是她的窗，下半是他的窗，往两边让开
  const open = E.io(seg(lt, 0, 1.4)) * 260;
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#070B20'], [.5, '#1A2250'], [1, '#070B20']]); g.fillRect(0, 0, W, H);
  stars(g, t, { n: 200, seed: 21 });
  glow(g, 540, 960, 520, '#FFF4D8', .7); circ(g, 540, 960, 150, '#FFF8EA');
  g.fillStyle = 'rgba(220,210,190,.35)'; circ(g, 500, 920, 30); circ(g, 590, 1010, 22); circ(g, 560, 900, 14);
  herWin(g, t, 0, -open, W, H / 2, look);
  hisWin(g, t, 0, H / 2 + open, W, H / 2, look);
}
function shKeepsakes(g, t, s) {
  const lt = t - s.t;
  // 上：她的手拿着拍立得；下：他的手拿着夹在本子里的干栀子
  g.save(); g.beginPath(); g.rect(0, 0, W, H / 2); g.clip();
  g.fillStyle = '#2A1E22'; g.fillRect(0, 0, W, H / 2); glow(g, 300, 200, 700, '#FFB060', .35);
  polaroid(g, 540, 500, 420, -.08 + Math.sin(lt) * .01, photoSummer, { age: .5, under: handBehind, over: handFront });
  g.restore();
  g.save(); g.beginPath(); g.rect(0, H / 2, W, H / 2); g.clip();
  g.fillStyle = '#1C2030'; g.fillRect(0, H / 2, W, H / 2); glow(g, 800, 1300, 700, '#FFC080', .3);
  g.save(); g.translate(540, 1460); g.rotate(.06);
  g.fillStyle = '#E4D8BE'; g.fillRect(-330, -230, 660, 460); g.strokeStyle = 'rgba(80,70,60,.2)'; g.lineWidth = 4; for (let l = 0; l < 12; l++) { g.beginPath(); g.moveTo(-300, -200 + l * 36); g.lineTo(300, -200 + l * 36); g.stroke(); }
  g.restore();
  gardenia(g, 520, 1440, 130, 1.2, { aged: .9, tilt: .9 });
  hand(g, 950, 1700, 1.3, PI + .6, 'open', '#2E3240');
  g.restore();
  g.fillStyle = '#05060C'; g.fillRect(0, H / 2 - 6, W, 12);
}

/* ---------------- 站台（S31~S34） ---------------- */
function platform(g, t, o = {}) {
  const dream = o.dream || 0;
  g.fillStyle = lg(g, 0, 0, 0, 1100, [[0, mix('#3A3A6A', '#F4D0D8', dream)], [.6, mix('#E07A5A', '#FFE8D0', dream)], [1, mix('#FFC080', '#FFF4E0', dream)]]); g.fillRect(0, 0, W, 1100);
  glow(g, 760, 980, 600, '#FFD08A', .7);
  circ(g, 760, 1000, 90, mix('#FFE8B0', '#FFFFFF', dream));
  // 远处的楼
  g.drawImage(skyline(71, 1200, 500, { col: mix('#5A3A4A', '#E8C0C0', dream), lit: .1 }), -60, 650);
  // 站台顶棚
  g.fillStyle = mix('#2A2228', '#C8A8A8', dream); g.fillRect(0, 0, W, 140); for (let i = 0; i < 6; i++) g.fillRect(i * 220 + 40, 140, 20, 60);
  // 轨道
  g.fillStyle = mix('#3A2E30', '#D8B8B0', dream); g.fillRect(0, 1100, W, 140);
  g.fillStyle = '#6A5A5A'; g.fillRect(0, 1150, W, 8); g.fillRect(0, 1210, W, 8);
  // 站台面
  g.fillStyle = lg(g, 0, 1240, 0, H, [[0, mix('#B89A8A', '#FFE8DC', dream)], [1, mix('#6A5A5A', '#E8C8C0', dream)]]); g.fillRect(0, 1240, W, H);
  g.fillStyle = mix('#E8C850', '#FFF0B0', dream); g.fillRect(0, 1260, W, 20);
}
function train(g, x, y, t, o = {}) {
  // 侧面的绿皮火车，x 车头位置（往右开）
  for (let c = 0; c < 4; c++) {
    const cx = x - c * 1100;
    g.fillStyle = '#2E5A44'; g.fillRect(cx - 1080, y - 520, 1080, 480);
    g.fillStyle = '#E8D8A8'; g.fillRect(cx - 1080, y - 330, 1080, 18);
    for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,230,180,.85)'; g.fillRect(cx - 1040 + i * 170, y - 470, 130, 120); }
    if (o.face && c === 0) fig(g, { x: cx - 1040 + 2 * 170 + 65, y: y - 470 + 120 + 500, h: 560, who: 'boy', view: 'side', dir: -1, sil: '#1A2A22' });
    g.fillStyle = '#1A2420'; circ(g, cx - 900, y - 30, 50); circ(g, cx - 200, y - 30, 50);
  }
}
function shPlatformWait(g, t, s) {
  const lt = t - s.t;
  platform(g, t);
  train(g, 1600, 1240, t);
  // 他背着包，左右看（在等她）
  const L = { x: .7, y: -.3, rim: '#FFC890', rimA: .7, sh: .45, col: '#3A1E28' };
  const look = Math.sin(lt * 1.6) > 0 ? 1 : -1;
  fig(g, { x: 760, y: 1560, h: 760, who: 'boy', view: 'side', dir: look, light: L, pose: { head: -.05, arms: [{ sh: .1, el: .5 }, { sh: .05, el: .4 }] }, pre: (q) => {} });
  // 她躲在前景的柱子后面，手扶着柱子
  // 她躲在前景的柱子后面，只露出半张脸和扶着柱子的手
  fig(g, { x: 250, y: 2250, h: 1800, who: 'girl', view: 'side', dir: 1, light: L, eyes: 'down', pose: { lean: .02, head: .12, arms: [{ sh: .2, el: .3 }, { sh: .2, el: .3 }] } });
  g.fillStyle = '#2A2028'; g.fillRect(0, 0, 330, H);
  g.fillStyle = 'rgba(255,200,140,.28)'; g.fillRect(300, 0, 30, H);
  for (let i = 0; i < 4; i++) capsule(g, 318, 1010 + i * 34, 15, 352, 1004 + i * 34, 13, i % 2 ? SKIN : shade(SKIN, .95));   // 扶着柱子边的四个指尖
}
function shTrainLeave(g, t, s) {
  const lt = t - s.t;
  platform(g, t);
  const go = E.in2(seg(lt, .3, 3.1));
  train(g, 1600 + go * 2600, 1240, t, { face: 1 });
  // 她从柱子后面跑出来，追了几步，停下
  const L = { x: .7, y: -.3, rim: '#FFC890', rimA: .7, sh: .45, col: '#3A1E28' };
  const run = seg(lt, .5, 2.0), x = lerp(260, 640, E.out(run));
  fig(g, { x, y: 1700, h: 980, who: 'girl', view: 'side', dir: 1, light: L, eyes: 'open', pose: run < 1 ? POSE.run(lt * 1.4) : Object.assign(POSE.stand(), { arms: [{ sh: .9, el: .1 }, { sh: .1, el: .2 }], lean: .08 }), swing: run < 1 ? -.3 : 0 });
  petals(g, t, { n: 12, seed: 101, fall: 60, wind: 300, size: 24, alpha: .7 });
}
function shDreamHug(g, t, s) {
  const lt = t - s.t;
  platform(g, t, { dream: 1 });
  train(g, 1600, 1240, t);
  const k = E.out(seg(lt, 0, .9));
  const L = { x: 0, y: -1, rim: '#FFFFFF', rimA: .7, sh: .15 };
  fig(g, { x: lerp(380, 470, k), y: 1700, h: 1000, who: 'girl', view: 'side', dir: 1, light: L, eyes: 'closed', blush: .6, pose: k < 1 ? POSE.run(lt * 1.6) : { lean: .1, head: -.1, arms: [{ sh: 1.5, el: .9 }, { sh: 1.4, el: 1.0 }] }, swing: -.2 });
  fig(g, { x: 640, y: 1700, h: 1060, who: 'boy', view: 'side', dir: -1, light: L, pose: { lean: .1 * k, head: .15 * k, arms: [{ sh: .1 + k * 1.3, el: k * 1.0 }, { sh: .1 + k * 1.2, el: k * 1.1 }] } });
  leak(g, t, .5, 2); petals(g, t, { n: 30, seed: 111, fall: 70, size: 30 });
}
function shEmptyPlatform(g, t, s) {
  const lt = t - s.t;
  platform(g, t);
  const L = { x: .7, y: -.3, rim: '#FFC890', rimA: .7, sh: .45, col: '#3A1E28' };
  fig(g, { x: 560, y: 1640, h: 860, who: 'girl', view: 'back', light: L, pose: { tilt: .08 }, swing: .05 * Math.sin(t) });
  petals(g, t, { n: 16, seed: 121, fall: 50, wind: 200, size: 24, alpha: .75 });
}

/* ---------------- S35 旧盒子里的照片 ---------------- */
function boyPhoto(mood) {
  return (q, w, h) => {
    q.fillStyle = mood ? '#9CC8E0' : '#A0A8B0'; q.fillRect(0, 0, w, h);
    q.fillStyle = mood ? '#7FB070' : '#8A9088'; q.fillRect(0, h * .7, w, h * .3);
    const hf = h * 2.4;
    fig(q, { x: w / 2, y: h * .44 + hf * .93, h: hf, who: 'boy', view: mood ? 'front' : 'side', dir: -1, eyes: mood ? 'closed' : 'down', smile: mood ? 1 : 0, light: { x: .6, y: -.7, sh: .15 } });
  };
}
function shPhotos(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = lg(g, 0, 0, W, H, [[0, '#3A2A24'], [1, '#1A1214']]); g.fillRect(0, 0, W, H);
  glow(g, 250, 300, 900, '#FFB060', .4);
  // 铁皮盒子、车票、磁带
  g.fillStyle = '#8A3A3A'; g.fillRect(80, 1250, 920, 560); g.fillStyle = '#6A2A2A'; g.fillRect(100, 1270, 880, 520);
  g.fillStyle = '#E8DCC0'; g.save(); g.translate(300, 1500); g.rotate(-.2); g.fillRect(-140, -60, 280, 120); g.fillStyle = '#C04A3A'; g.fillRect(-140, -60, 280, 26); g.restore();
  g.fillStyle = '#222'; g.save(); g.translate(720, 1580); g.rotate(.15); g.fillRect(-160, -100, 320, 200); g.fillStyle = '#E8E0D0'; g.fillRect(-140, -80, 280, 90); circ(g, -60, 50, 26, '#555'); circ(g, 60, 50, 26, '#555'); g.restore();
  // 先拿起"笑着的他"，再换成"不说话的他"
  const k1 = E.out(seg(t, ch(26, 0) + .3, ch(26, 4))), k2 = E.out(seg(t, ch(27, 4) - .2, ch(27, 6)));
  const p1x = lerp(380, 540, k1) - k2 * 700, p1y = lerp(1450, 760, k1);
  polaroid(g, p1x, p1y, lerp(300, 600, k1), lerp(-.25, -.04, k1), boyPhoto(1), { age: .6, under: k1 > .5 ? handBehind : null, over: k1 > .5 ? handFront : null });
  if (k2 > 0) polaroid(g, lerp(1300, 560, k2), lerp(800, 760, k2), 600, lerp(.3, .05, k2), boyPhoto(0), { age: .6, under: handBehind, over: handFront });
}

/* ---------------- S36 手机：打了又删 ---------------- */
function shPhone(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = '#0A0A12'; g.fillRect(0, 0, W, H);
  glow(g, 540, 900, 900, '#7090C0', .25);
  const px = 540, py = 940, pw = 600, ph = 1180;
  // 手
  hand(g, px + 380, py + 600, 1.7, PI + .9, 'open', '#CDB592');
  g.fillStyle = '#16161C'; g.beginPath(); g.roundRect(px - pw / 2, py - ph / 2, pw, ph, 60); g.fill();
  g.fillStyle = '#F2F2F4'; g.beginPath(); g.roundRect(px - pw / 2 + 20, py - ph / 2 + 20, pw - 40, ph - 40, 44); g.fill();
  const x0 = px - pw / 2 + 20, y0 = py - ph / 2 + 20, sw = pw - 40;
  // 顶栏、一条很久以前的消息
  g.fillStyle = '#E4E4E8'; g.fillRect(x0, y0 + 40, sw, 110);
  text(g, '‹', x0 + 40, y0 + 95, 60, '#555', { font: 'sans' }); circ(g, x0 + sw / 2, y0 + 95, 34, '#9AA8B8');
  text(g, '2010 年 6 月 30 日', x0 + sw / 2, y0 + 220, 26, '#999');
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(x0 + 40, y0 + 260, 300, 90, 20); g.fill();
  text(g, '毕业快乐', x0 + 190, y0 + 305, 38, '#222', { weight: 500 });
  // 输入框：一个字一个字打出来，停一下，再删掉
  const msg = '这些年，你还好吗', n = msg.length;
  const typeK = seg(t, ch(28, 0), ch(28, 6)), delK = seg(t, ch(28, 9), ch(28, 13) + .3);
  const shown = Math.floor(n * typeK) - Math.floor(n * delK);
  const iy = y0 + ph - 40 - 260;
  g.fillStyle = '#E4E4E8'; g.fillRect(x0, iy - 40, sw, 300);
  g.fillStyle = '#FFFFFF'; g.beginPath(); g.roundRect(x0 + 30, iy, sw - 60, 100, 26); g.fill();
  const str = msg.slice(0, Math.max(0, shown));
  text(g, str, x0 + 60, iy + 50, 40, '#222', { align: 'left', weight: 500 });
  if (Math.floor(t * 2) % 2 === 0) { g.font = `500 40px ${FONT.serif}`; g.fillStyle = '#3A7AFF'; g.fillRect(x0 + 62 + g.measureText(str).width, iy + 26, 4, 50); }
  // 最后屏幕暗下去
  const off = seg(t, ch(28, 13) + .5, s.e - .1);
  g.fillStyle = `rgba(0,0,0,${off * .92})`; g.beginPath(); g.roundRect(px - pw / 2 + 20, py - ph / 2 + 20, pw - 40, ph - 40, 44); g.fill();
}
