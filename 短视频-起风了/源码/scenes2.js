'use strict';
/* scenes2.js：第一遍副歌和后半段（七年前，高中）：追着纸飞机跑进校园、天台、运动会、走廊、她回头一笑；
   上课走神、趴桌睡觉被粉笔头砸、全班笑、本子上画满了她、天台弹吉他、写好的纸飞机没敢扔、太阳雨；间奏的彩虹和倒计时。 */

const HER_LOOK = { who: 'she', outfit: 'uni' }, HIM_LOOK = { who: 'he', outfit: 'uni' };
/* 教室里的座位：前排第 2 张是她，第 3 张是他（坐在她后面）；其他是同学 */
const SEAT_HER = 2, SEAT_HIM = 3;
function classmate(i, extra = {}) { return { look: kidLook(i + 20), outfit: 'uni', ...extra }; }

/* ---------- 从前初识这世间：追着纸飞机跑进校园（开学第一天） ---------- */
function campusPath(g, s, x, o = {}) {
  summerSky(g, s, { tod: o.tod || 'noon', x, sun: o.sun || [1650, 160, 56], clouds: 4, cy: 520, cw: 820, seed: 11 });
  ridge(g, x * .1, 560, 70, '#9FC0D8', 3, .002, 3);
  teachBuilding(g, s, 300 - x * .35, 700, 1500, 4, { fh: 120 });
  for (let i = -1; i < 5; i++) { const tx = ((i * 640 - x * .7) % (W + 640) + W + 640) % (W + 640) - 300; tree(g, tx, 760, 150, { sway: Math.sin(s * 1.5 + i) * 6 }); }
  g.fillStyle = vgrad(g, 760, H, [[0, '#D6CDBC'], [1, '#C2B8A6']]); g.fillRect(0, 760, W, H - 760);
  g.fillStyle = '#7DBB5E'; g.fillRect(0, 752, W, 14);
  if (o.banner) { const bx = 960 - x * .7; line(g, bx - 520, 300, bx - 520, 760, '#6A4A36', 10); line(g, bx + 520, 300, bx + 520, 760, '#6A4A36', 10); banner(g, bx, 330, 1000, 90, o.banner, { sag: 16 }); }
}
function sGate(g, s, k) {
  const camX = k * 260;
  campusPath(g, s, camX, { banner: '欢迎新同学' });
  // 新生往里走
  for (let i = 0; i < 9; i++) {
    const px = ((hash(i, 301) * 2400 + k * 70 - camX * 1.0) % 2400 + 2400) % 2400 - 240;
    person(g, { ...classmate(i), x: px, y: 860 - hash(i, 302) * 40, u: 26 + hash(i, 303) * 4, face: 1, pose: walkPose(s * .9 + hash(i, 304), 0), t: s + i, light: LIGHT.noon, bag: ['#4A6A9E', '#C8584A', '#5A8A5A'][i % 3] });
  }
  // 纸飞机在前面飞，他在后面追
  const [px, py, a] = pathAt([[-200, 420], [500, 360], [1100, 420], [1700, 300], [2300, 260]], seg(k, 0, 3.4));
  paperPlane(g, px, py, 40, a, {});
  person(g, { ...HIM_LOOK, x: 300 + k * 330, y: 860, u: 46, face: 1, pose: walkPose(s * 2.2, 1), t: s, mouth: 'grin', eyes: 'open', light: LIGHT.noon, bag: '#4A6A9E', wind: [-.6, 0] });
  const flash = 1 - seg(k, 0, .7);
  if (flash > 0) { g.fillStyle = `rgba(255,252,240,${E.in(flash)})`; g.fillRect(0, 0, W, H); }
}
/* 万般流连：镜头一路甩过校园：篮球场、大香樟、旗杆、红旗 */
function sCampus(g, s, k) {
  const camX = 1200 + k * 1400;
  summerSky(g, s, { tod: 'noon', x: camX, sun: [300, 140, 50], clouds: 5, cy: 560, cw: 760, seed: 12 });
  g.fillStyle = vgrad(g, 720, H, [[0, '#C9573E'], [1, '#A84432']]); g.fillRect(0, 720, W, H - 720);
  g.fillStyle = '#5FAE58'; g.fillRect(0, 700, W, 30);
  // 篮球架、香樟树、旗杆（各自有自己的位置）
  const obj = [[600, 'hoop'], [1400, 'tree'], [2300, 'flag'], [3100, 'hoop'], [3700, 'tree']];
  for (const [ox, kind] of obj) {
    const x = ox - camX + 960;
    if (x < -500 || x > W + 500) continue;
    if (kind === 'hoop') { g.fillStyle = '#5A6A80'; g.fillRect(x - 8, 380, 16, 340); g.fillStyle = '#FFFFFF'; g.fillRect(x - 90, 330, 180, 110); g.strokeStyle = '#E8582E'; g.lineWidth = 6; g.beginPath(); g.ellipse(x - 120, 430, 40, 10, 0, 0, TAU); g.stroke(); }
    else if (kind === 'tree') tree(g, x, 720, 260, { sway: Math.sin(s * 1.5) * 8 });
    else { g.fillStyle = '#E8E8E8'; g.fillRect(x - 5, 140, 10, 580); const fw = Math.sin(s * 6) * 12; g.fillStyle = '#E8392E'; g.beginPath(); g.moveTo(x + 5, 150); g.quadraticCurveTo(x + 90, 140 + fw, x + 170, 156); g.lineTo(x + 170, 250); g.quadraticCurveTo(x + 90, 236 + fw, x + 5, 246); g.closePath(); g.fill(); }
  }
  person(g, { ...HIM_LOOK, x: 700 + k * 200, y: 900, u: 44, face: 1, pose: walkPose(s * 2.4, 1), t: s, mouth: 'grin', light: LIGHT.noon, bag: '#4A6A9E' });
  paperPlane(g, 1100 + k * 260, 520 - Math.sin(k * 2) * 60, 40, -.1 + Math.cos(k * 2) * .15, {});
  windStreaks(g, s, 10, .25, { y0: 200, y1: 900, sp: 2200 });
}
/* 看着天边似在眼前：天台，低机位。他踮着脚去够天上的云，纸飞机一路往上飞进积云里 */
function sRoofSky(g, s, k) {
  g.save(); cam(g, 960, 640, 1.0, -.04);
  rooftop(g, s, { tod: 'noon', sun: [1500, 160, 60], cy: 800, cw: 1200, tankX: 1700 });
  const rk = E.out(seg(k, .3, 1.4));
  person(g, { ...HIM_LOOK, x: 760, y: 700, u: 62, face: 1, pose: lerpPose(POSE.lookUp, POSE.reach, rk), t: s, mouth: 'smile', eyes: 'open', light: LIGHT.noon, wind: [-.5, 0] });
  const [px, py, a] = pathAt([[960, 520], [1150, 380], [1300, 260], [1420, 160], [1500, 90]], seg(k, 0, 2.9));
  paperPlane(g, px, py, 46 * (1 - seg(k, 1.5, 2.9) * .6), a - .5, { glow: .3 });
  g.restore();
  godRays(g, 1500, 160, Math.PI * .7, 8, 1400, '#FFF6DA', .14, s);
  flare(g, 1500, 160, .6);
}
/* 也甘愿赴汤蹈火去走它一遍：运动会的一千米。他跑在最前面，看台上全班在喊；最后一个字"遍"撞线 */
const FINISH = 61.3;
function sRace(g, s, k) {
  const dist = (s - 57.75) * 520;
  const camX = dist;
  g.fillStyle = vgrad(g, 0, 420, SKYS.noon); g.fillRect(0, 0, W, 420);
  // 看台
  g.fillStyle = '#B9C2CE'; g.fillRect(0, 300, W, 260); g.fillStyle = '#9AA6B6'; for (let i = 0; i < 4; i++) g.fillRect(0, 330 + i * 62, W, 8);
  crowd(g, s, 400, 70, 1, { x: camX * .5, cheer: 1 });
  crowd(g, s, 470, 80, 1.15, { x: camX * .55, cheer: 1 });
  banner(g, 1100 - (camX * .5) % 2000, 330, 620, 64, '高二（2）班  加油！', { sag: 10 });
  track(g, s, camX, 640, {});
  // 终点线和撞线的红绳
  const fx = 1500 - (s - FINISH) * 520 + 0;
  if (fx > -100 && fx < W + 100) {
    g.fillStyle = '#FFFFFF'; g.fillRect(fx - 4, 640, 8, 440);
    const broke = s > FINISH;
    line(g, fx, 560, fx, 900, '#E8E8E8', 8);
    if (!broke) line(g, fx, 760, fx + 4, 760, '#E8392E', 4);
    else { const d = seg(s, FINISH, FINISH + .6); line(g, fx, 760, fx + 160 * d, 760 + 120 * d, '#E8392E', 5); }
  }
  // 跑在后面的两个人
  for (let i = 0; i < 2; i++) person(g, { ...classmate(i + 5), x: 420 - i * 260 - k * 40, y: 812 + i * 40, u: 40, face: 1, pose: walkPose(s * 2.6 + i * .3, 1), t: s, light: LIGHT.noon, mouth: 'o' });
  // 他：胸前别着号码布
  const hx = 1040 + (s > FINISH ? (s - FINISH) * 120 : 0);
  person(g, { ...HIM_LOOK, x: hx, y: 840, u: 46, face: 1, pose: s > FINISH + .3 ? lerpPose(walkPose(s * 2.6, 1), POSE.cheer, seg(s, FINISH + .3, FINISH + .8)) : walkPose(s * 2.7, 1), t: s, mouth: s > FINISH ? 'grin' : 'o', eyes: s > FINISH + .3 ? 'happy' : 'open', light: LIGHT.noon, brow: s < FINISH ? 1 : 0,
    extra: (gg, P) => { gg.save(); gg.translate(P.Sh[0] + .1 * P.u, P.Sh[1] + .9 * P.u); gg.rotate(P.tilt); gg.fillStyle = '#FFFFFF'; gg.fillRect(-.05 * P.u, -.3 * P.u, .55 * P.u, .6 * P.u); text(gg, '27', .22 * P.u, 0, .32 * P.u, { k: 'sans', col: '#C8382E' }); gg.restore(); } });
  // 热浪、汗
  windStreaks(g, s, 8, .12, { y0: 600, y1: 1000, sp: 2000 });
  if (s > FINISH) { const c = seg(s, FINISH, FINISH + 1.4); for (let i = 0; i < 40; i++) { const a = hash(i, 9) * Math.PI - Math.PI, d = E.out(c) * (200 + hash(i, 10) * 500); g.fillStyle = ['#FFD25A', '#FF7A8A', '#7AC8FF', '#9AE08A'][i % 4]; g.globalAlpha = 1 - c; g.fillRect(hx + Math.cos(a) * d, 520 + Math.sin(a) * d * .7 + c * 200, 12, 8); g.globalAlpha = 1; } }
}
/* 如今走过这世间：走廊。他和两个哥们儿往前走，他把纸飞机往前一扔 */
const THROW = 64.4;
function sCorridorWalk(g, s, k) {
  const camX = k * 160;
  g.save(); cam(g, 900, 560, 1.35);
  corridor(g, s, camX, { tod: 'noon', walkers: gg => {
    for (let i = 0; i < 2; i++) person(gg, { ...classmate(i + 11), x: 520 - i * 200 + k * 140, y: 690, u: 40, face: 1, pose: walkPose(s * 1.0 + i * .4, 0), t: s, mouth: i ? 'talk' : 'smile', light: LIGHT.noon });
    const th = seg(s, THROW - .4, THROW + .2);
    const pose = th > 0 && th < 1 ? lerpPose(walkPose(s * 1.0, 0), POSE.aim, Math.sin(Math.PI * th)) : walkPose(s * 1.0, 0);
    person(gg, { ...HIM_LOOK, x: 760 + k * 140, y: 690, u: 40, face: 1, pose, t: s, mouth: 'grin', light: LIGHT.noon, hold: s < THROW ? (g2, u) => paperPlane(g2, u * .3, u * .1, u * .5, -.2, {}) : null });
  } });
  if (s >= THROW) { const u = seg(s, THROW, THROW + 1.6); const [px, py, a] = pathAt([[880, 560], [1200, 520], [1500, 540], [1900, 500], [2200, 520]], u); paperPlane(g, px, py, 34, a, {}); }
  g.restore();
}
/* 万般流连：纸飞机顺着走廊飞，一扇扇窗户往后掠，窗户里是各个班在上课 */
function sWindowsFly(g, s, k) {
  const camX = 2000 + k * 900;
  g.save(); cam(g, 960, 470, 1.5);
  corridor(g, s, camX, { tod: 'noon' });
  const by = 470 + Math.sin(s * 2.5) * 30;
  paperPlane(g, 1000, by, 40, Math.cos(s * 2.5) * .12, {});
  g.restore();
  windStreaks(g, s, 10, .2, { y0: 300, y1: 700, sp: 1800 });
}
/* 翻过岁月不同侧脸：贴着窗户飞过去，一张张侧脸往后掠——打哈欠的、看书的、偷吃零食的、戴眼镜皱眉的 */
function sFaces(g, s, k) {
  g.fillStyle = '#EFE6D6'; g.fillRect(0, 0, W, H);
  const sp = 700, camX = k * 760;
  for (let j = -1; j < 5; j++) {
    const wx = j * sp - (camX % sp) + 80, idx = j + Math.floor(camX / sp);
    g.save(); rr(g, wx, 150, 560, 640, 12); g.clip();
    g.fillStyle = vgrad(g, 150, 790, [[0, '#F6F0E2'], [1, '#E2D6C0']]); g.fillRect(wx, 150, 560, 640);
    const mood = ((idx % 4) + 4) % 4;
    person(g, { ...classmate(idx + 3), x: wx + 330, y: 980, u: 130, face: -1, pose: mood === 1 ? POSE.write : POSE.sitDesk, t: s + idx, light: LIGHT.room,
      eyes: mood === 0 ? 'closed' : mood === 3 ? 'half' : 'open', mouth: mood === 0 ? 'o' : mood === 2 ? 'grin' : 'n', brow: mood === 3 ? 1 : 0, glasses: mood === 3 });
    g.restore();
    rr(g, wx, 150, 560, 640, 12); g.strokeStyle = '#F8F4EA'; g.lineWidth = 22; g.stroke();
  }
  paperPlane(g, 1040, 420 + Math.sin(s * 2) * 20, 44, Math.cos(s * 2) * .1, {});
}
/* 措不及防闯入你的笑颜（上）：教室。纸飞机从后面飘进来，绕了半圈，轻轻撞在她的马尾上；她转过头来 */
const BONK = 72.55, TURN = 73.05;
function classroomWide(g, s, x, o = {}) {
  classroomSide(g, s, { tod: o.tod || 'noon', x, wind: o.wind ?? .8,
    back: gg => seatRow(gg, s, ROW_B, 160 - x * .85, 8, i => classmate(i + 40, o.backWho ? o.backWho(i) : {}), { light: LIGHT.room }),
    front: gg => seatRow(gg, s, ROW_F, -140 - x, 7, (i, dx, hx) => o.who ? o.who(i, dx, hx) : (i === SEAT_HER ? HER_LOOK : i === SEAT_HIM ? HIM_LOOK : classmate(i)), { light: LIGHT.room }) });
}
function herSeatX(x) { return -140 - x + SEAT_HER * ROW_F.sp + ROW_F.w + .95 * ROW_F.u; }
function sMeet(g, s, k) {
  const x = 120 + k * 30;
  const turned = seg(s, TURN, TURN + .25);
  g.save(); cam(g, 780, 700, 1.55);
  classroomWide(g, s, x, { who: (i) => i === SEAT_HER ? { ...HER_LOOK, face: turned > .5 ? 1 : -1, pose: turned > 0 ? lerpPose(POSE.sitDesk, POSE.sit, turned) : POSE.write, eyes: turned > .5 ? 'wide' : 'open', mouth: turned > .5 ? 'o' : 'n', blush: turned } : i === SEAT_HIM ? { ...HIM_LOOK, pose: POSE.chin, eyes: 'open' } : classmate(i, { pose: POSE.write }) });
  // 纸飞机：从右上角飘进来，绕一下，撞到她的头
  const hx = herSeatX(x), [hdx, hdy] = [hx - 10, ROW_F.hip - 3.4 * ROW_F.u];
  if (s < BONK + .5) {
    const u = seg(s, 70.7, BONK);
    let [px, py, a] = pathAt([[2000, 200], [1500, 260], [1200, 420], [1350, 520], [hdx + 120, hdy - 40], [hdx + 20, hdy]], E.io(u) * .5 + u * .5);
    if (s > BONK) { const d = seg(s, BONK, BONK + .5); px = hdx + 20 - d * 30; py = hdy + d * 90; a = 1.2 * d; }
    paperPlane(g, px, py, 30, a, {});
    if (s > BONK && s < BONK + .3) { text(g, '！', hdx, hdy - 120, 60, { k: 'sans', col: '#E8582E' }); }
  } else paperPlane(g, hdx - 60, ROW_F.hip - .6 * ROW_F.u - 20, 30, .1, {});
  g.restore();
}
/* 措不及防闯入你的笑颜（下）：她的特写。转过来，笑了；窗帘被风吹起来，阳光和灰尘在她身后发亮 */
function sSmile1(g, s, k) {
  // 背景：亮的窗户和鼓起来的窗帘（虚的）
  soft(g, gg => { classroomSide(gg, s, { tod: 'noon', x: 300, wind: 1.4, beams: true }); });
  g.fillStyle = 'rgba(255,250,235,.25)'; g.fillRect(0, 0, W, H);
  glow(g, 1500, 300, 900, '#FFF6DA', .55);
  const z = 1 + k * .04;
  g.save(); cam(g, 960, 560, z);
  const gz = lerp(-.8, .3, E.out(seg(s, TURN + .3, TURN + .9)));
  const smile = s > 73.55;
  bust(g, { ...HER_LOOK, x: 900, y: 640, u: 190, eyes: smile && s > 74.4 ? 'happy' : 'open', gaze: gz, mouth: smile ? 'smile' : 'o', blush: .7, tiltH: -.05 + Math.sin(s * 1.2) * .02, light: LIGHT.room, t: s, wind: [.8 + .3 * Math.sin(s * 2), 0],
    extra: (gg, u) => { if (s > 74.9) { const r = E.back(seg(s, 74.9, 75.4)); paperPlane(gg, 1.9 * u, 1.3 * u - r * .2 * u, u * .45 * r, -.3, {}); } } });
  g.restore();
  petals(g, s, 30, [0, -50, W, H], ['#FFFFFF', '#FFF2C8'], { vx: 60, vy: 30, size: 6, a: .8 });
  dust(g, s, 80, [0, 0, W, H], '#FFF6DA', .6);
}

/* ---------- 后半段：上课走神、睡觉、粉笔头、笑话、本子、吉他、纸飞机、太阳雨 ---------- */
/* 我曾难自拔于世界之大：墙上的世界地图。他托着下巴看，地图上一条条航线伸出去，小纸飞机沿着飞 */
function sMap(g, s, k) {
  g.fillStyle = '#F4F0E6'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#7FB08C'; g.fillRect(0, 760, W, 320);
  worldMap(g, s, 760, 400, 1160, 600, { routes: [[-.33, -.12, 77.3], [.04, -.14, 78.0], [-.25, .25, 78.6], [.08, .2, 79.2], [.4, .3, 79.8]] });
  person(g, { ...HIM_LOOK, x: 1620, y: 980, u: 80, face: -1, pose: POSE.chin, t: s, eyes: 'open', mouth: 'smile', light: LIGHT.room });
  deskSide(g, 1240, 940, 1.3, { w: 200, h: 140, books: 5, seed: 3 });
}
/* 也沉溺于其中梦话：他趴在桌上睡着了，头顶冒出一个梦：两辆自行车骑在云上 */
function sDoze(g, s, k) {
  g.save(); cam(g, 860, 740, 1.9);
  classroomSide(g, s, { tod: 'noon', x: 700, wind: .6, front: gg => seatRow(gg, s, ROW_F, 220, 3, i => i === 1 ? { ...HIM_LOOK, pose: POSE.sleep, eyes: 'closed', mouth: 'o' } : classmate(i, { pose: POSE.write }), {}) });
  g.restore();
  // 梦的泡泡
  const a = E.out(seg(k, .3, 1.0));
  g.save(); g.globalAlpha = a;
  for (const [bx, by, br] of [[1180, 520, 16], [1240, 450, 26]]) { circ(g, bx, by, br); g.fillStyle = 'rgba(255,255,255,.9)'; g.fill(); }
  g.save(); ell(g, 1420, 250, 360, 200); g.fillStyle = '#FFFFFF'; g.fill(); g.clip();
  g.fillStyle = vgrad(g, 50, 450, SKYS.noon); g.fillRect(1060, 50, 720, 400);
  cumulus(g, 1300, 420, 500, CLOUDP.noon, 1, 3); cumulus(g, 1620, 430, 380, CLOUDP.noon, 1, 5);
  const ph = s * 1.2;
  bicycle(g, 1360 + Math.sin(s) * 20, 330, .45, ph, '#2E6EB0'); bicycle(g, 1540 + Math.sin(s + 1) * 20, 320, .45, ph + .3, '#E86A7E');
  person(g, { ...HIM_LOOK, x: 1350 + Math.sin(s) * 20, y: 270, u: 18, face: 1, pose: cyclePose(ph), t: s, light: LIGHT.noon });
  person(g, { ...HER_LOOK, x: 1530 + Math.sin(s + 1) * 20, y: 260, u: 18, face: 1, pose: cyclePose(ph + .3), t: s, light: LIGHT.noon });
  g.restore();
  ell(g, 1420, 250, 360, 200); g.strokeStyle = 'rgba(255,255,255,.95)'; g.lineWidth = 10; g.stroke();
  g.restore();
  text(g, 'z z Z', 1080 + Math.sin(s * 2) * 10, 640 - k * 20, 44, { k: 'hand', col: '#5A6A9E', alpha: .8 });
}
/* 不得真假不做挣扎（上）：讲台前，老师写着写着回头，一甩手，一个粉笔头飞出去 */
const CHALK_T = 84.55;
function sChalk(g, s, k) {
  classroomFront(g, s, { tod: 'noon', clock: 10.4,
    board: gg => { chalk(gg, 'f(x) = sin(ωx + φ)', 350, 260, 54); chalk(gg, '求 ω 的取值范围', 350, 360, 48); chalk(gg, '∵ T = 2π / ω', 370, 460, 48); },
    teacher: gg => { const turn = s > 84.15; person(gg, { who: 'teacher', x: 600, y: 760, u: 52, face: turn ? 1 : -1, pose: s > CHALK_T - .2 && s < CHALK_T + .3 ? POSE.aim : turn ? POSE.stand : POSE.reach, t: s, eyes: 'open', brow: turn ? 1.5 : 0, mouth: turn ? 'sad' : 'n', light: LIGHT.room }); },
    backs: gg => { for (let i = 0; i < 5; i++) backView(gg, { ...classmate(i), x: 180 + i * 390, y: 1050, u: 70, light: LIGHT.room, t: s + i }); } });
  if (s > CHALK_T) { const u = seg(s, CHALK_T, CHALK_T + .7); chalkPiece(g, lerp(660, 1200, u), 560 - Math.sin(Math.PI * u) * 160 + u * 300, s * 20); }
}
/* 不得真假不做挣扎（下）：粉笔头"啪"地砸在他脑门上，他一下子醒了 */
const BONK2 = 85.55;
function sBonk(g, s, k) {
  g.save(); cam(g, 860, 740, 1.9);
  const up = seg(s, BONK2, BONK2 + .25);
  classroomSide(g, s, { tod: 'noon', x: 700, wind: .6, front: gg => seatRow(gg, s, ROW_F, 220, 3, i => i === 1 ? { ...HIM_LOOK, pose: lerpPose(POSE.sleep, POSE.sitBack, up), eyes: up > .5 ? 'wide' : 'closed', mouth: up > .5 ? 'o' : 'n' } : classmate(i, { pose: POSE.write }), {}) });
  g.restore();
  const hp = headPos({ x: 220 + ROW_F.sp + ROW_F.w + .95 * ROW_F.u, y: ROW_F.hip, u: ROW_F.u, face: -1, pose: lerpPose(POSE.sleep, POSE.sitBack, up) });
  const hit = [960 + (hp[0] - 860) * 1.9, 540 + (hp[1] - 740 - ROW_F.u) * 1.9];
  if (s < BONK2) { const u = seg(s, BONK2 - .35, BONK2); chalkPiece(g, lerp(200, hit[0], u), lerp(300, hit[1], u), s * 20); }
  else {
    const d = seg(s, BONK2, BONK2 + .6);
    chalkPiece(g, hit[0] - 30 - d * 80, hit[1] - d * 120 + d * d * 300, s * 20);
    for (let i = 0; i < 10; i++) { const a = i / 10 * TAU; line(g, hit[0] + Math.cos(a) * 30 * (1 + d), hit[1] + Math.sin(a) * 30 * (1 + d), hit[0] + Math.cos(a) * 60 * (1 + d), hit[1] + Math.sin(a) * 60 * (1 + d), `rgba(255,255,255,${1 - d})`, 4); }
    text(g, '啪！', hit[0] + 120, hit[1] - 80, 72, { k: 'brush', col: '#FFFFFF', alpha: 1 - seg(s, BONK2 + .6, BONK2 + 1), stroke: '#3A4A7A', lw: 10 });
  }
}
/* 不惧笑话：全班哄堂大笑，前排的她也回头在笑；他挠挠头，也笑了 */
function sLaugh(g, s, k) {
  g.save(); cam(g, 960, 680, 1.1);
  classroomWide(g, s, 160, { who: (i) => {
    const bob = { t: s * 3 + i };
    if (i === SEAT_HER) return { ...HER_LOOK, face: 1, pose: POSE.sit, eyes: 'happy', mouth: 'grin', blush: .6, ...bob };
    if (i === SEAT_HIM) return { ...HIM_LOOK, pose: POSE.scratch, eyes: 'happy', mouth: 'grin', blush: .4 };
    return classmate(i, { face: i > SEAT_HIM ? -1 : 1, pose: POSE.sit, eyes: 'happy', mouth: 'grin' });
  }, backWho: i => ({ eyes: 'happy', mouth: 'grin', face: 1 }) });
  g.restore();
  for (let i = 0; i < 6; i++) { const t = (s * .8 + i / 6) % 1; text(g, ['哈', '哈哈', '哈'][i % 3], 200 + i * 300, 300 - t * 160, 50 + (i % 2) * 20, { k: 'brush', col: '#FFFFFF', alpha: Math.sin(Math.PI * t), stroke: 'rgba(60,70,120,.6)', lw: 8 }); }
}
/* 我曾将青春翻涌成她：他的本子被风一页页翻过去，页页都画着她 */
const NB_PAGES = [
  (g, w, h) => { pencil(g, '第三排 靠窗', 0, -h * .32, 56); ponySketch(g, 0, 40, 1.4); },
  (g, w, h) => { monDoodle(g, -80, -40, 18, 'rgba(60,56,70,.85)', 4, 2); pencil(g, '她书包上挂的那只', 60, 180, 44); },
  (g, w, h) => { pencil(g, '今天她笑了', 0, -80, 70); pencil(g, '三次', 120, 40, 52, { rot: .08 }); },
  (g, w, h) => { pencil(g, '她喜欢橘子味的冰棍', 0, -60, 48); g.fillStyle = 'rgba(255,170,90,.6)'; rr(g, -40, 20, 80, 150, 30); g.fill(); line(g, 0, 170, 0, 230, 'rgba(160,120,80,.8)', 10); },
  (g, w, h) => { paperPlane(g, 120, -20, 70, -.2, {}); pencil(g, '折法：第 7 步', -40, 120, 48); },
  (g, w, h) => { ponySketch(g, -120, 0, 1.0); ponySketch(g, 140, 10, .9); pencil(g, '又画了一遍', 0, 200, 46); },
];
function ponySketch(g, x, y, k) {
  g.save(); g.translate(x, y); g.scale(k, k); g.strokeStyle = 'rgba(60,56,70,.8)'; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.arc(0, 0, 70, 0, TAU); g.stroke();
  g.beginPath(); g.moveTo(-50, -48); g.quadraticCurveTo(10, -90, 62, -30); g.stroke();
  g.beginPath(); g.moveTo(55, -55); g.quadraticCurveTo(130, -60, 120, 30); g.quadraticCurveTo(110, 70, 90, 90); g.stroke();
  g.beginPath(); g.moveTo(-60, 30); g.quadraticCurveTo(-90, 100, -40, 140); g.stroke();
  g.restore();
}
function sNotebook(g, s, k) {
  g.fillStyle = '#B88E5E'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(80,50,30,.08)'; g.fillRect(0, i * 130 + 40, W, 30); }
  const pageT = Math.max(0, k - .3) / .5, pi = Math.floor(pageT), flip = pageT - pi;
  const draw = (gg, idx) => paperSheet(gg, 0, 0, 760, 880, { draw: (g2, w, h) => NB_PAGES[idx % NB_PAGES.length](g2, w, h) });
  g.save(); g.translate(1340, 540); g.rotate(-.03);
  draw(g, pi + 1);
  // 正在翻的那页：从右往左翻（宽度按余弦缩，翻过一半换成背面）
  const c = Math.cos(Math.PI * E.io(flip));
  g.save(); g.scale(c >= 0 ? Math.max(.01, c) : Math.max(.01, -c), 1); g.translate(c >= 0 ? 0 : 0, 0);
  if (c >= 0) draw(g, pi); else paperSheet(g, 0, 0, 760, 880, { col: '#F2EEE2' });
  g.restore();
  g.restore();
  // 左边那页（已经翻过去的）
  g.save(); g.translate(560, 540); g.rotate(.02); paperSheet(g, 0, 0, 760, 880, { draw: (g2, w, h) => { pencil(g2, '高二（2）班  数学', 0, -h * .38, 40); for (let i = 0; i < 6; i++) pencil(g2, ['∵ a²+b²≥2ab', '∴ …', 'sin²x+cos²x=1', '（她转过头了）', '……', 'x = ?'][i], -80, -200 + i * 90, 38, { align: 'left', alpha: i === 3 ? 1 : .8 }); } }); g.restore();
  windStreaks(g, s, 8, .2, { y0: 100, y1: 900 });
}
/* 也曾指尖弹出盛夏：黄昏的天台，他坐在女儿墙上弹吉他；门口，她悄悄探出半个身子在听 */
function sGuitar(g, s, k) {
  g.save(); cam(g, 960, 560, 1.02 + k * .02);
  rooftop(g, s, { tod: 'golden', sun: [1550, 520, 70], cy: 760, cw: 1000, tankX: 1750 });
  flare(g, 1550, 520, .5);
  // 天台的门（左边）
  g.fillStyle = '#C8BEB0'; g.fillRect(40, 380, 320, 420); g.fillStyle = '#4A4038'; g.fillRect(110, 450, 170, 350);
  const peek = E.out(seg(k, 1.2, 2.0));
  g.save(); g.beginPath(); g.rect(110, 380, 400, 420); g.clip();
  person(g, { ...HER_LOOK, x: lerp(150, 250, peek), y: 640, u: 40, face: 1, pose: POSE.stand, t: s, eyes: 'open', mouth: 'smile', blush: .6, light: LIGHT.goldenR });
  g.restore();
  // 他
  const strum = Math.sin(s * 9) * .1;
  const P = { ...POSE.guitar, aN: [POSE.guitar.aN[0] + strum, POSE.guitar.aN[1]] };
  person(g, { ...HIM_LOOK, x: 1000, y: 760, u: 56, face: 1, pose: P, t: s, eyes: 'closed', mouth: 'smile', light: LIGHT.goldenR, wind: [-.4, 0],
    extra: (gg, B) => guitarAt(gg, B.armN[2][0] - .2 * B.u, B.armN[2][1] - .1 * B.u, B.u / 110, -.42) });
  g.restore();
  notes(g, s, 1060, 520, 6, '#FFF4DA', .9);
}
/* 心之所动且就随缘去吧（上）：放学后空下来的教室，夕阳。他一个人在写什么，写完折成一只纸飞机 */
const FOLD_T = 98.4;
function sFoldWrite(g, s, k) {
  g.save(); cam(g, 1180, 700, 1.7);
  classroomSide(g, s, { tod: 'sunset', x: 700, wind: .3, front: gg => seatRow(gg, s, ROW_F, 220, 4, i => i === 2 ? { ...HIM_LOOK, pose: s < FOLD_T ? POSE.write : POSE.sitHold, eyes: 'open', mouth: 'n', light: LIGHT.sunset } : null, { light: LIGHT.sunset }) });
  g.restore();
  // 纸：先是一张写了字的纸，再折成飞机
  const f = seg(s, FOLD_T - .2, FOLD_T + .6);
  if (f <= 0) { paperSheet(g, 1080, 690, 150, 190, { rot: -.15, lines: false, draw: (gg) => { for (let i = 0; i < 3; i++) line(gg, -50, -40 + i * 30, 30 - i * 10, -40 + i * 30, 'rgba(60,56,70,.7)', 3); } }); }
  else paperPlane(g, 1110, 600, 46 * E.out(f), -.3, { alpha: f });
}
/* 心之所动且就随缘去吧（下）：他举起纸飞机，对准前面她的空座位，停住……还是放下了，塞进了桌肚 */
function sFoldDrawer(g, s, k) {
  g.save(); cam(g, 1000, 700, 1.45);
  const aim = E.io(seg(k, .1, .8)), down = E.io(seg(k, 1.6, 2.4)), tuck = seg(k, 2.4, 2.9);
  const pose = down > 0 ? lerpPose(POSE.aim, POSE.sitDesk, down) : lerpPose(POSE.sitHold, POSE.aim, aim);
  classroomSide(g, s, { tod: 'sunset', x: 700, wind: .3, front: gg => seatRow(gg, s, ROW_F, 220, 4, i => i === 2 ? { ...HIM_LOOK, pose: { ...pose, tilt: 0, lN: sitL(0).lN, lF: sitL(0).lF }, eyes: down > .5 ? 'half' : 'open', mouth: 'n', light: LIGHT.sunset,
    hold: tuck < 1 ? (g2, u) => paperPlane(g2, u * .3, 0, u * .5, -.2 + down * .8, {}) : null } : null, { light: LIGHT.sunset }) });
  // 她的空座位上一道夕阳
  g.restore();
  if (tuck > 0 && tuck < 1) paperPlane(g, lerp(930, 860, tuck), lerp(820, 860, tuck), 34 * (1 - tuck * .5), .3, { alpha: 1 - tuck });
}
/* 逆着光行走，任风吹雨打：太阳雨。他把校服外套撑在两个人头顶，迎着夕阳一起跑；雨丝被照得发亮 */
function sunRainBg(g, s, x) {
  summerSky(g, s, { tod: 'golden', x, sun: [1600, 460, 80], clouds: 3, cy: 600, cw: 900, seed: 14 });
  teachBuilding(g, s, -x * .4 - 200, 760, 2400, 4, { fh: 110 });
  g.fillStyle = vgrad(g, 760, H, [[0, '#A89A8A'], [1, '#7E7266']]); g.fillRect(0, 760, W, H - 760);
  // 地上的水坑反光
  for (let i = 0; i < 8; i++) { const px = ((i * 340 - x * 1.2) % (W + 340) + W + 340) % (W + 340) - 170; ell(g, px, 900 + (i % 3) * 50, 120, 14); g.fillStyle = 'rgba(255,214,150,.45)'; g.fill(); }
}
function sSunRain(g, s, k) {
  const x = k * 300;
  sunRainBg(g, s, x);
  const run = walkPose(s * 2.2, 1);
  const her = { ...HER_LOOK, x: 880 + k * 30, y: 830, u: 44, face: 1, pose: run, t: s, eyes: 'happy', mouth: 'grin', light: LIGHT.goldenR, wind: [-.8, 0] };
  const him = { ...HIM_LOOK, x: 1010 + k * 30, y: 822, u: 46, face: 1, pose: { ...walkPose(s * 2.2 + .5, 1), aN: [2.6, .3], aF: [2.4, .4] }, t: s, eyes: 'open', mouth: 'grin', light: LIGHT.goldenR, outfit: 'uni' };
  person(g, her); person(g, him);
  // 撑在头顶的外套
  const [hx, hy] = handPos(him, 'N');
  g.beginPath(); g.moveTo(hx + 20, hy - 10); g.quadraticCurveTo(hx - 120, hy - 70 + Math.sin(s * 8) * 8, hx - 260, hy + 10); g.lineTo(hx - 240, hy + 40); g.quadraticCurveTo(hx - 120, hy - 20, hx + 10, hy + 26); g.closePath(); g.fillStyle = '#3E69B1'; g.fill();
  g.fillStyle = '#F4F6FA'; g.beginPath(); g.moveTo(hx - 80, hy - 50); g.quadraticCurveTo(hx - 140, hy - 66, hx - 200, hy - 30); g.lineTo(hx - 190, hy - 10); g.quadraticCurveTo(hx - 140, hy - 40, hx - 80, hy - 26); g.fill();
  // 发亮的雨丝和水花
  rain(g, s, 260, { col: 'rgba(255,236,190,.55)', ang: .16, len: 60, sp: 1500, lw: 2 });
  for (let i = 0; i < 12; i++) { const t = (s * 2 + hash(i, 5)) % 1, px = hash(i, 6) * W, py = 880 + hash(i, 7) * 160; g.strokeStyle = `rgba(255,240,210,${1 - t})`; g.lineWidth = 2; g.beginPath(); g.ellipse(px, py, 30 * t, 8 * t, 0, 0, TAU); g.stroke(); }
  glow(g, 1600, 460, 600, '#FFD8A0', .35);
}
/* 太阳雨（近）：两个人跑着、笑着，头发湿了 */
function sSunRainClose(g, s, k) {
  g.save(); cam(g, 960, 600, 1.9);
  sunRainBg(g, s, 600 + k * 300);
  const her = { ...HER_LOOK, x: 880, y: 830, u: 44, face: 1, pose: walkPose(s * 2.2, 1), t: s, eyes: 'happy', mouth: 'grin', blush: .7, light: LIGHT.goldenR, wind: [-.8, .2] };
  const him = { ...HIM_LOOK, x: 1010, y: 822, u: 46, face: 1, pose: { ...walkPose(s * 2.2 + .5, 1), aN: [2.6, .3], aF: [2.4, .4] }, t: s, eyes: s > 107.5 ? 'open' : 'happy', mouth: 'grin', light: LIGHT.goldenR };
  person(g, her); person(g, him);
  const [hx, hy] = handPos(him, 'N');
  g.beginPath(); g.moveTo(hx + 20, hy - 10); g.quadraticCurveTo(hx - 120, hy - 70 + Math.sin(s * 8) * 8, hx - 260, hy + 10); g.lineTo(hx - 240, hy + 40); g.quadraticCurveTo(hx - 120, hy - 20, hx + 10, hy + 26); g.closePath(); g.fillStyle = '#3E69B1'; g.fill();
  rain(g, s, 160, { col: 'rgba(255,236,190,.5)', ang: .16, len: 40, sp: 1400, lw: 1.5 });
  g.restore();
  glow(g, 1700, 400, 700, '#FFD8A0', .3);
}

/* ---------- 间奏：彩虹、倒计时 ---------- */
/* 雨停了：两个人在走廊下躲雨，浑身湿透。她指着操场上空的彩虹，他看的不是彩虹，是她 */
function sRainbow(g, s, k) {
  summerSky(g, s, { tod: 'golden', sun: [300, 300, 70], clouds: 4, cy: 640, cw: 900, seed: 15 });
  rainbow(g, 1150, 820, 620, E.out(seg(k, .2, 1.6)));
  track(g, s, 0, 820, {});
  // 屋檐、滴水
  g.fillStyle = '#E6DCCB'; g.fillRect(0, 0, W, 90); g.fillStyle = '#CFC4B2'; g.fillRect(0, 90, W, 14);
  for (let i = 0; i < 14; i++) { const t = (s * 1.3 + hash(i, 3)) % 1; circ(g, 80 + i * 135, 104 + t * 700, 4); g.fillStyle = `rgba(220,236,255,${.8 * (1 - t)})`; g.fill(); }
  g.fillStyle = '#D9CDB8'; g.fillRect(0, 880, W, 200);
  const point = E.out(seg(k, .5, 1.1));
  person(g, { ...HER_LOOK, x: 760, y: 790, u: 52, face: 1, pose: lerpPose(POSE.stand, { ...POSE.wave, aN: [2.2, .1] }, point), t: s, eyes: 'happy', mouth: 'grin', light: LIGHT.golden });
  person(g, { ...HIM_LOOK, x: 560, y: 790, u: 54, face: 1, pose: POSE.stand, t: s, eyes: 'open', mouth: k > 1.8 ? 'smile' : 'n', blush: .5, light: LIGHT.golden, extra: (gg, B) => {} });
}
/* 倒计时：黑板旁边的牌子一天天往下翻；窗外的季节跟着变（秋、冬、春）；最后教室空了，落了灰——又回到七年后 */
function sCountdown(g, s, k) {
  const u = seg(k, 0, 5.4);
  const days = Math.max(1, Math.round(lerp(300, 1, E.in(u))));
  const empty = seg(k, 5.0, 6.2);
  classroomFront(g, s, { tod: empty > .5 ? 'present' : 'noon', count: empty > .6 ? null : days, clock: 8 + k * 3,
    board: gg => { if (empty < .5) { chalk(gg, '高考加油！', 640, 300, 90); chalk(gg, `${days}`, 1180, 470, 70, { alpha: .6 }); } else { chalk(gg, '毕业快乐', 640, 330, 96, { alpha: .25 }); } },
    backs: gg => { if (empty < .6) for (let i = 0; i < 5; i++) backView(gg, { ...classmate(i), x: 180 + i * 390, y: 1050 + Math.sin(s * 9 + i) * 2 * u, u: 70, light: LIGHT.room, t: s + i, alpha: 1 - empty }); } });
  // 窗外的季节：右边一道光的颜色跟着变
  const season = u < .33 ? '#FFB060' : u < .66 ? '#BFD8FF' : '#B8F0A0';
  g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = rgba(season, .35 * (1 - empty)); g.fillRect(0, 0, W, H); g.restore();
  if (empty > 0) { g.fillStyle = `rgba(120,96,70,${.25 * empty})`; g.fillRect(0, 0, W, H); dust(g, s, 80, [0, 0, W, H], '#FFE6C0', .6 * empty); }
}

SCENES_DEF.push(() => {
  scene('gate', 49.95, sGate, { tr: { type: 'fade', dur: .15 }, bloom: .25 });
  scene('campus', 53.0, sCampus, { tr: { type: 'whip', dur: .4 }, bloom: .2 });
  scene('roofsky', 54.85, sRoofSky, { tr: { type: 'whipV', dur: .45, dir: -1 }, bloom: .3 });
  scene('race', 57.75, sRace, { tr: { type: 'flash', dur: .4 }, bloom: .2 });
  scene('corridor', 62.85, sCorridorWalk, { tr: { type: 'whip', dur: .4 }, bloom: .2 });
  scene('windows', 65.8, sWindowsFly, { tr: { type: 'blur', dur: .3 }, bloom: .2 });
  scene('faces', 67.65, sFaces, { tr: { type: 'whip', dur: .35 }, bloom: .2 });
  scene('meet', 70.7, sMeet, { tr: { type: 'fade', dur: .4 }, bloom: .25 });
  scene('smile1', 73.45, sSmile1, { tr: { type: 'flash', dur: .3 }, bloom: .35 });
  scene('map', 76.55, sMap, { tr: { type: 'blur', dur: .4 }, bloom: .2 });
  scene('doze', 80.5, sDoze, { tr: { type: 'fade', dur: .4 }, bloom: .25 });
  scene('chalk', 83.7, sChalk, { tr: { type: 'whip', dur: .35 }, bloom: .2 });
  scene('bonk', 85.25, sBonk, { tr: { type: 'whip', dur: .3, dir: -1 }, bloom: .2 });
  scene('laugh', 86.7, sLaugh, { tr: { type: 'flash', dur: .3 }, bloom: .2 });
  scene('notebook', 89.35, sNotebook, { tr: { type: 'blur', dur: .4 }, bloom: .2 });
  scene('guitar', 93.15, sGuitar, { tr: { type: 'leak', dur: .6 }, bloom: .4 });
  scene('foldwrite', 96.3, sFoldWrite, { tr: { type: 'fade', dur: .5 }, bloom: .35 });
  scene('folddrawer', 99.15, sFoldDrawer, { tr: { type: 'blur', dur: .4 }, bloom: .35 });
  scene('sunrain', 102.05, sSunRain, { tr: { type: 'flash', dur: .4 }, bloom: .45 });
  scene('sunrainclose', 105.75, sSunRainClose, { tr: { type: 'fade', dur: .4 }, bloom: .45 });
  scene('rainbow', bar(34), sRainbow, { tr: { type: 'leak', dur: .6 }, bloom: .35 });
  scene('countdown', bar(35), sCountdown, { tr: { type: 'fade', dur: .5 }, bloom: .2 });
});
