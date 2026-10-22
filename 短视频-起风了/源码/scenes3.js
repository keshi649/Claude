'use strict';
/* scenes3.js：第二段主歌（七年后：楼梯、空教室、课桌上刻的小怪、钟倒着走 → 七年前的早读，她回头笑）、
   第二遍副歌（骑车回家、一人一只耳机、晚自习看月亮、百日誓师、两扇亮着的窗、第一场雪、元旦晚会、日历、毕业照）、
   后半段（高考、铃响、扔试卷、签校服、她在他背上写字、毕业晚会、没送出去的纸飞机）和间奏（空教室、两列火车、四季、回到现在）。 */

/* ---------- 七年后的教学楼 ---------- */
/* 楼梯间（侧面）：台阶往右上走，拐角平台上一扇窗，夕阳照进来 */
function stairwell(g, s, o = {}) {
  g.fillStyle = '#E6DCCB'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#7A9C82'; g.beginPath(); g.moveTo(0, 1080); g.lineTo(0, 900); g.lineTo(1400, 300); g.lineTo(W, 300); g.lineTo(W, 1080); g.closePath(); g.globalAlpha = .45; g.fill(); g.globalAlpha = 1;
  // 窗
  rr(g, 1380, 60, 420, 300, 6); g.fillStyle = '#FFFFFF'; g.fill();
  g.fillStyle = vgrad(g, 72, 348, SKYS.golden); g.fillRect(1392, 72, 396, 276);
  cloud(g, 3, 1600, 200, 380, CLOUDP.golden, .9);
  g.strokeStyle = '#FFFFFF'; g.lineWidth = 8; g.beginPath(); g.moveTo(1590, 72); g.lineTo(1590, 348); g.stroke();
  g.fillStyle = '#E2D8C6'; g.fillRect(1360, 356, 460, 20);
  // 光
  g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = lgrad(g, 1500, 200, 900, 1000, [[0, 'rgba(255,214,150,.5)'], [1, 'rgba(255,214,150,0)']]);
  g.beginPath(); g.moveTo(1392, 72); g.lineTo(1788, 72); g.lineTo(1300, 1080); g.lineTo(500, 1080); g.closePath(); g.fill(); g.restore();
  // 台阶
  const n = 14;
  for (let i = 0; i < n; i++) { const x = 60 + i * 96, y = 1000 - i * 50; g.fillStyle = '#CFC6B6'; g.fillRect(x, y, 96, 1080 - y); g.fillStyle = '#B8AE9C'; g.fillRect(x, y, 96, 8); }
  g.fillStyle = '#CFC6B6'; g.fillRect(60 + n * 96, 1000 - (n - 1) * 50, W, 400);
  // 扶手
  g.strokeStyle = '#8E6A48'; g.lineWidth = 10; g.beginPath(); g.moveTo(40, 840); g.lineTo(60 + n * 96, 840 - n * 50); g.lineTo(W, 840 - n * 50); g.stroke();
  for (let i = 0; i < n; i += 2) line(g, 60 + i * 96 + 48, 1000 - i * 50, 60 + i * 96 + 48, 840 - i * 50 - 24, '#A08A70', 4);
  dust(g, s, 50, [600, 100, 1800, 1000], '#FFE2B0', .55);
}
/* 短短的路走走停停：七年后，他一步一步走上楼梯；拐角的窗台上，那只被风吹走的纸飞机停在那儿 */
function sStairs(g, s, k) {
  stairwell(g, s);
  const u = seg(k, 0, 2.6), i = u * 11;
  const x = 60 + i * 96 + 40, y = 1000 - i * 50 - 1.66 * 46;
  const atTop = u >= 1;
  person(g, { who: 'he', outfit: 'shirt', x, y: y - 4, u: 46, face: 1, pose: atTop ? lerpPose(POSE.stand, POSE.give, E.out(seg(k, 2.6, 3.1))) : walkPose(s * 1.0, .2), t: s, light: LIGHT.goldenR, bag: '#3A4A5E' });
  // 窗台上的纸飞机：快到顶的时候他伸手拿起来
  const take = seg(k, 2.7, 3.1);
  paperPlane(g, lerp(1500, 1420, take), lerp(340, 300, take), 34, -.1, { old: true, glow: .3 * (1 - take) });
}
/* 也有了几分的距离：教室门口，班牌"高三（2）班"。门里空荡荡的，光里飘着灰；他站在门外 */
function sDoorNow(g, s, k) {
  g.save(); cam(g, 960, 540, 1.04 + k * .02);
  classroomSide(g, s, { tod: 'present', x: 300, empty: true, wind: .3, fan: 0 });
  g.restore();
  // 门框（前景，左边一大块暗的墙）
  g.fillStyle = '#D6CAB4'; g.fillRect(0, 0, 420, H); g.fillRect(0, 0, W, 60);
  g.fillStyle = '#B88A5A'; g.fillRect(380, 60, 40, H);
  rr(g, 70, 150, 250, 70, 6); g.fillStyle = '#2E5E9E'; g.fill(); text(g, '高三（2）班', 195, 186, 34, { k: 'sans', col: '#FFFFFF' });
  person(g, { who: 'he', outfit: 'shirt', x: 260, y: 790, u: 56, face: 1, pose: POSE.hold, t: s, eyes: 'open', light: LIGHT.goldenR, bag: '#3A4A5E',
    hold: (gg, u) => paperPlane(gg, u * 1.0, -u * .5, u * .5, -.25, { old: true }) });
}
/* 不知抚摸的是故事：他走到靠窗那张课桌——当年他的座位，手掌轻轻按在桌面上 */
function sDeskNow(g, s, k) {
  g.save(); cam(g, 1100, 700, 1.5);
  classroomSide(g, s, { tod: 'present', x: 900, empty: true, wind: .4, fan: 0,
    front: gg => {
      deskSide(gg, 820, 868 - 20, 1, { w: 200, h: 120, books: 0 });
      person(gg, { who: 'he', outfit: 'shirt', x: 1140, y: 760, u: 52, face: -1, pose: lerpPose(POSE.stand, { ...POSE.give, aN: [1.0, .5], aF: [.3, .3] }, E.io(seg(k, .4, 1.4))), t: s, eyes: 'half', light: LIGHT.golden });
    } });
  g.restore();
}
/* 还是段心情：俯拍桌面。木头上刻着一只像素小怪、"2018"，他的手指顺着刻痕描了一遍 */
function deskTop(g, s, o = {}) {
  g.fillStyle = '#C49A68'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) { g.strokeStyle = `rgba(120,80,40,${.08 + hash(i, 2) * .1})`; g.lineWidth = 2 + hash(i, 3) * 4; g.beginPath(); g.moveTo(0, i * 30 + hash(i, 4) * 20); g.bezierCurveTo(600, i * 30 + 30, 1200, i * 30 - 20, W, i * 30 + hash(i, 5) * 30); g.stroke(); }
  // 刻痕：深色描边 + 亮边
  g.save(); g.translate(900, 520);
  for (const [off, col] of [[3, 'rgba(255,230,190,.5)'], [0, 'rgba(70,40,20,.85)']]) {
    g.save(); g.translate(off, off); monDoodle(g, 0, 0, 34, col, 9, 5); g.restore();
    text(g, '2018', 300 + off, 220 + off, 90, { k: 'hand', col, rot: -.08 });
  }
  g.restore();
  if (o.glow) glow(g, 900, 520, 520, '#FFE8B8', o.glow);
  g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = lgrad(g, 0, 0, W, H, [[0, 'rgba(255,214,150,.35)'], [1, 'rgba(255,214,150,0)']]); g.fillRect(0, 0, W, H); g.restore();
  dust(g, s, 50, [0, 0, W, H], '#FFE6C0', .5);
}
function sCarving(g, s, k) {
  g.save(); cam(g, 960, 540, 1.05 + k * .03);
  deskTop(g, s, { glow: .25 * seg(k, 1.2, 2.4) });
  // 手指（从右下角伸进来）顺着刻痕描
  const tr = seg(k, .3, 2.6), path = [[700, 420], [1100, 420], [1100, 500], [1180, 500], [1180, 580], [1100, 580], [1100, 650]];
  const [fx, fy] = pathAt(path, tr);
  g.save(); g.translate(fx, fy); g.rotate(-.7);
  g.fillStyle = '#F6F8FB'; rr(g, 120, 140, 260, 900, 80); g.fill();
  g.fillStyle = '#EFC7AE'; rr(g, 40, 60, 210, 260, 90); g.fill(); rr(g, -20, -10, 70, 220, 34); g.fill();
  g.fillStyle = 'rgba(255,240,230,.6)'; rr(g, -10, 0, 40, 40, 16); g.fill();
  g.restore();
  g.restore();
}
/* 也许期待的不过是：墙上的钟，嘀嗒嘀嗒 */
function wallClock(g, s, x, y, r, hh, mm, o = {}) {
  circ(g, x, y, r + 14); g.fillStyle = '#5A5A66'; g.fill();
  circ(g, x, y, r); g.fillStyle = o.face || '#FDFCF6'; g.fill();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(g, x + Math.sin(a) * r * .82, y - Math.cos(a) * r * .82, x + Math.sin(a) * r * .94, y - Math.cos(a) * r * .94, '#2A2A30', i % 3 ? 3 : 7); }
  const ha = (hh % 12 + mm / 60) / 12 * TAU, ma = mm / 60 * TAU;
  line(g, x, y, x + Math.sin(ha) * r * .5, y - Math.cos(ha) * r * .5, '#2A2A30', 10);
  line(g, x, y, x + Math.sin(ma) * r * .78, y - Math.cos(ma) * r * .78, '#2A2A30', 6);
  if (o.sec != null) line(g, x, y, x + Math.sin(o.sec / 60 * TAU) * r * .85, y - Math.cos(o.sec / 60 * TAU) * r * .85, '#C8382E', 3);
  circ(g, x, y, 10); g.fillStyle = '#2A2A30'; g.fill();
}
function sClock(g, s, k) {
  soft(g, gg => classroomSide(gg, s, { tod: 'present', x: 500, empty: true, fan: 0 }));
  g.fillStyle = 'rgba(80,60,40,.18)'; g.fillRect(0, 0, W, H);
  const sec = Math.floor((s - 131.7) / .8) * 6 + 30;     // 跟着拍子一秒一跳
  wallClock(g, s, 960, 480, 300, 4, 37, { sec });
  dust(g, s, 70, [0, 0, W, H], '#FFE6C0', .55);
}
/* 与时间为敌：指针倒着飞转，教室一闪一闪——空的、满的、空的、满的，最后停在七年前 */
const REWIND_END = 137.25;
function sRewind(g, s, k) {
  const u = seg(s, 134.9, REWIND_END);
  const back = E.in(u);
  const flick = Math.sin(u * u * 40) > 0;
  if (flick && u > .25) classroomSide(g, s, { tod: 'morning', x: 500, wind: .5, front: gg => seatRow(gg, s, ROW_F, -140 - 500 + 600, 7, i => (i === SEAT_HER ? { ...HER_LOOK, pose: POSE.sitHold } : classmate(i, { pose: POSE.write })), { light: LIGHT.morning }), back: gg => seatRow(gg, s, ROW_B, 160 - 425, 8, i => classmate(i + 40), { light: LIGHT.morning }) });
  else classroomSide(g, s, { tod: 'present', x: 500, empty: true, fan: 0 });
  g.fillStyle = `rgba(20,20,30,${.35 * (1 - u)})`; g.fillRect(0, 0, W, H);
  const mm = 37 - back * 60 * 18, hh = 4 - back * 18;
  withAlpha(g, 1 - seg(u, .85, 1), () => wallClock(g, s, 960, 480, 300 * (1 - u * .4), hh, ((mm % 60) + 60) % 60, { sec: ((30 - back * 3000) % 60 + 60) % 60 }));
  // 倒带的横条
  if (u > .2) for (let i = 0; i < 6; i++) { const y = hash(i, Math.floor(s * 20)) * H; g.fillStyle = `rgba(255,255,255,${.1 * u})`; g.fillRect(0, y, W, 4 + hash(i, 3, Math.floor(s * 20)) * 20); }
}
/* 再次看到你 / 微凉晨光里：七年前的早读。清晨蓝蓝的光，她坐在窗边读书，桌上一杯豆浆冒着热气 */
function sMorning(g, s, k) {
  g.save(); cam(g, 700, 720, 1.75 - k * .03);
  classroomSide(g, s, { tod: 'morning', x: 500, wind: .4, front: gg => seatRow(gg, s, ROW_F, -140 - 500 + 600, 7, (i) => i === SEAT_HER ? { ...HER_LOOK, pose: POSE.sitHold, eyes: k > 2.6 ? 'half' : 'open', mouth: 'talk', t: s, light: LIGHT.morning,
    hold: (g2, u) => { g2.save(); g2.translate(u * .9, -u * .6); g2.rotate(-.5); g2.fillStyle = '#F6F2E6'; g2.fillRect(-u * .7, -u * .5, u * 1.4, u * 1.0); g2.fillStyle = '#7FA6C8'; g2.fillRect(-u * .72, -u * .52, u * .1, u * 1.04); g2.restore(); } } : i === SEAT_HIM ? { ...HIM_LOOK, pose: POSE.chin, eyes: 'open' } : classmate(i, { pose: POSE.sitHold, mouth: 'talk' }), { light: LIGHT.morning }) });
  // 豆浆的热气
  const cx = 700, cy = ROW_F.hip - .5 * ROW_F.u - 32;
  rr(g, cx - 14, cy - 8, 28, 40, 6); g.fillStyle = '#FFFFFF'; g.fill();
  for (let i = 0; i < 3; i++) { const t = (s * .5 + i / 3) % 1; g.strokeStyle = `rgba(255,255,255,${.5 * Math.sin(Math.PI * t)})`; g.lineWidth = 4; g.beginPath(); g.moveTo(cx - 6 + i * 6, cy - 12 - t * 60); g.quadraticCurveTo(cx + 10 + Math.sin(s * 3 + i) * 10, cy - 30 - t * 80, cx - 4, cy - 50 - t * 90); g.stroke(); }
  g.restore();
  godRays(g, 300, 0, Math.PI * .3, 7, 1500, '#E8F2FF', .2, s);
}
/* 笑得很甜蜜：晨光里她回过头，冲他笑，拿书挡住半张脸 */
function sSmile2(g, s, k) {
  soft(g, gg => classroomSide(gg, s, { tod: 'morning', x: 300, wind: .5 }));
  g.fillStyle = 'rgba(220,235,255,.2)'; g.fillRect(0, 0, W, H);
  glow(g, 400, 300, 900, '#EAF4FF', .5);
  const bk = E.out(seg(k, .6, 1.2));
  g.save(); cam(g, 960, 560, 1.02 + k * .03);
  bust(g, { ...HER_LOOK, x: 1000, y: 640, u: 190, eyes: k > .5 ? 'happy' : 'open', gaze: .4, mouth: 'smile', blush: .9, tiltH: .06, light: LIGHT.morning, t: s, wind: [.3, 0],
    extra: (gg, u) => { gg.save(); gg.translate(-1.3 * u, 2.2 * u - bk * 1.0 * u); gg.rotate(-.1); gg.fillStyle = '#F6F2E6'; gg.fillRect(-1.4 * u, -.4 * u, 2.8 * u, 2.0 * u); gg.fillStyle = '#7FA6C8'; gg.fillRect(-1.45 * u, -.42 * u, .2 * u, 2.04 * u); text(gg, '语文', 0, .3 * u, .5 * u, { k: 'serifX', col: '#3E5E8E' }); gg.restore(); } });
  g.restore();
  dust(g, s, 60, [0, 0, W, H], '#EAF4FF', .5);
}

/* ---------- 第二遍副歌：一起的那些日子 ---------- */
/* 从前初识这世间：放学，夕阳下的河边，两辆自行车并排骑着 */
function sBikes(g, s, k) {
  const x = k * 260;
  riverRoad(g, s, x, { tod: 'sunset', sun: [1400, 600, 64] });
  const ph = s * 1.25;
  for (const [who, bx, by, col, off] of [['she', 760, 930, '#E86A7E', .3], ['he', 1130, 950, '#2E6EB0', 0]]) {
    const pos = bicycle(g, bx, by, .9, ph + off, col);
    person(g, { who, outfit: 'uni', x: pos.seat[0] + 6, y: pos.seat[1] - 8, u: 40, face: 1, pose: cyclePose(ph + off), t: s, eyes: who === 'she' ? 'happy' : 'open', mouth: 'smile', blush: who === 'she' ? .5 : .3, light: LIGHT.sunset, wind: [-.9, 0], bag: who === 'she' ? '#F2B8C8' : '#4A6A9E' });
    if (who === 'she') pixelMon(g, pos.seat[0] - 60, pos.seat[1] - 40 + Math.sin(s * 6) * 4, 3, MON.pink, 1);
  }
  windStreaks(g, s, 8, .2, { y0: 500, y1: 900, sp: 1600 });
}
/* 万般流连：操场边的长椅，一人一只耳机，音符往上飘 */
function sEarbuds(g, s, k) {
  g.save(); cam(g, 960, 560, 1.15 + k * .03);
  summerSky(g, s, { tod: 'sunset', sun: [1500, 560, 70], clouds: 3, cy: 560, cw: 900, seed: 16 });
  track(g, s, 0, 760, {});
  tree(g, 380, 780, 260, { col: '#5E8A46', lite: '#B8C86A', dark: '#3E6438', sway: Math.sin(s) * 6 });
  // 长椅
  g.fillStyle = '#9A6A44'; g.fillRect(560, 800, 760, 24); g.fillRect(560, 730, 760, 20); g.fillStyle = '#5A5A62'; g.fillRect(600, 824, 14, 120); g.fillRect(1260, 824, 14, 120);
  const her = { ...HER_LOOK, x: 820, y: 800, u: 50, face: 1, pose: { ...POSE.sit, head: .1 }, t: s, eyes: 'closed', mouth: 'smile', blush: .6, light: LIGHT.sunset };
  const him = { ...HIM_LOOK, x: 1060, y: 800, u: 52, face: -1, pose: { ...POSE.sit, head: .2 }, t: s, eyes: k > 1.0 ? 'open' : 'half', mouth: 'smile', blush: .5, light: LIGHT.sunsetR };
  person(g, her); person(g, him);
  const [ha, hb] = [headPos(her), headPos(him)];
  earphones(g, [ha[0] - 4, ha[1] + 14], [hb[0] + 4, hb[1] + 14], 110);
  g.restore();
  notes(g, s, 960, 420, 6, '#FFE8C8', .9);
}
/* 看着天边似在眼前：晚自习课间，两个人趴在走廊栏杆上看月亮 */
function sStars(g, s, k) {
  summerSky(g, s, { tod: 'night', clouds: 2, cy: 500, cw: 700, seed: 17, wisps: false });
  moon(g, 1500, 220, 80, { halo: '#9FB2FF' });
  milkyWay(g, 900, 300, 2200, -.25, .35);
  townSkyline(g, s, 0, 780, 'night');
  // 栏杆（他们在前面，背后是亮灯的教室——画在左边一小截）
  g.fillStyle = '#3A3E5A'; g.fillRect(0, 760, W, 320);
  g.fillStyle = '#E8E2D6'; g.fillRect(0, 760, W, 26);
  const lk = E.out(seg(k, .2, 1.0));
  person(g, { ...HER_LOOK, x: 780, y: 840, u: 52, face: 1, pose: { ...POSE.lean, head: -.35 - lk * .2 }, t: s, eyes: 'open', mouth: 'smile', light: LIGHT.night });
  person(g, { ...HIM_LOOK, x: 1020, y: 840, u: 54, face: 1, pose: { ...POSE.lean, head: k > 1.6 ? .1 : -.3 }, t: s, eyes: 'open', mouth: k > 1.6 ? 'smile' : 'n', light: LIGHT.night });
  if (k > 1.6) { const a = seg(k, 1.6, 2.0); text(g, '♡', 1000, 560, 40, { k: 'sans', col: '#FFB8C8', alpha: a * .8 }); }
  shootingStar(g, s, 149.3, 300, 120, .4, 300, 1.0);
}
/* 也甘愿赴汤蹈火去走它一遍（上）：百日誓师。操场上一整个年级举着拳头喊，红横幅、彩带 */
function sPledge(g, s, k) {
  summerSky(g, s, { tod: 'noon', clouds: 3, cy: 460, cw: 800, seed: 18, sun: [1700, 120, 50] });
  teachBuilding(g, s, -100, 560, 2200, 3, { fh: 110 });
  banner(g, 960, 230, 1200, 120, '百日誓师  决战高考', { sag: 20 });
  g.fillStyle = '#5FAE58'; g.fillRect(0, 560, W, 520);
  const shout = Math.max(0, Math.sin((s - 150.5) * Math.PI / .8));
  for (let r = 0; r < 5; r++) crowd(g, s, 640 + r * 90, 26 + r * 4, .8 + r * .25, { x: r * 77, cheer: .5 + shout, cols: ['#3E69B1', '#F4F6FA'] });
  for (let i = 0; i < 50; i++) { const t = (s * .4 + hash(i, 8)) % 1, x = hash(i, 9) * W + Math.sin(s * 2 + i) * 30, y = t * H; g.fillStyle = ['#FFD25A', '#FF5A5A', '#FFFFFF'][i % 3]; g.save(); g.translate(x, y); g.rotate(s * 3 + i); g.fillRect(-10, -4, 20, 8); g.restore(); }
}
/* 也甘愿赴汤蹈火去走它一遍（下）：夜里，城里两扇亮着的窗，一扇是他，一扇是她，都还在台灯下写卷子 */
function lampWindow(g, s, x, y, who, o = {}) {
  g.fillStyle = '#2A2E4A'; g.fillRect(x - 380, y - 300, 760, 600);
  g.fillStyle = '#FFE6B0'; g.fillRect(x - 300, y - 230, 600, 440);
  glow(g, x, y, 500, '#FFD890', .4);
  g.save(); g.beginPath(); g.rect(x - 300, y - 230, 600, 440); g.clip();
  g.fillStyle = '#E8C890'; g.fillRect(x - 300, y + 120, 600, 120);
  person(g, { who, outfit: 'uni', x: x + (o.face < 0 ? 120 : -120), y: y + 150, u: 60, face: o.face || 1, pose: POSE.write, t: s, eyes: 'open', light: LIGHT.lamp });
  g.fillStyle = '#5A5A66'; g.fillRect(x + (o.face < 0 ? -150 : 150), y - 20, 10, 140); g.beginPath(); g.moveTo(x + (o.face < 0 ? -200 : 100), y - 10); g.lineTo(x + (o.face < 0 ? -100 : 200), y - 10); g.lineTo(x + (o.face < 0 ? -130 : 170), y - 70); g.lineTo(x + (o.face < 0 ? -170 : 130), y - 70); g.closePath(); g.fillStyle = '#E8E8E8'; g.fill();
  for (let i = 0; i < 6; i++) { g.fillStyle = '#FBF8EE'; g.fillRect(x - 60 + i * 6, y + 112 - i * 6, 160, 10); }
  g.restore();
  g.strokeStyle = '#F2F0EA'; g.lineWidth = 12; g.strokeRect(x - 300, y - 230, 600, 440); line(g, x, y - 230, x, y + 210, '#F2F0EA', 10);
}
function sLamps(g, s, k) {
  summerSky(g, s, { tod: 'night', clouds: 1, seed: 19, wisps: false });
  moon(g, 960, 150, 70, {});
  lampWindow(g, s, 470, 600, 'he', { face: 1 });
  lampWindow(g, s, 1450, 600, 'she', { face: -1 });
  const clock = `0${Math.floor(lerp(23, 25, seg(k, 0, 2.4))) % 24}:${String(Math.floor(lerp(30, 59, seg(k, 0, 2.4)))).padStart(2, '0')}`.slice(-5);
  text(g, clock, 960, 960, 44, { k: 'sans', col: 'rgba(230,236,255,.85)', ls: 8 });
}
/* 如今走过这世间：第一场雪。她伸手接雪花，他在栏杆的积雪上画了一只像素小怪 */
function sSnow(g, s, k) {
  g.fillStyle = vgrad(g, 0, H, [[0, '#B8C6D8'], [1, '#E8ECF2']]); g.fillRect(0, 0, W, H);
  teachBuilding(g, s, -200, 700, 2400, 4, { fh: 130, wall: '#E8E2D6' });
  g.fillStyle = '#F6F8FC'; g.fillRect(0, 700, W, 380);
  for (const tx of [260, 1640]) { line(g, tx, 760, tx, 380, '#5A4A40', 22); for (let j = 0; j < 6; j++) { line(g, tx, 420 + j * 50, tx + (j % 2 ? -1 : 1) * 160, 360 + j * 50, '#5A4A40', 8); ell(g, tx + (j % 2 ? -1 : 1) * 120, 368 + j * 50, 70, 14); g.fillStyle = '#FFFFFF'; g.fill(); } }
  // 栏杆上的积雪、画的小怪
  g.fillStyle = '#D6CEC2'; g.fillRect(560, 860, 800, 30); g.fillStyle = '#FFFFFF'; rr(g, 550, 836, 820, 34, 16); g.fill();
  const dr = seg(k, .4, 2.2);
  g.save(); g.beginPath(); g.rect(900, 820, 200 * dr, 60); g.clip(); monDoodle(g, 1000, 852, 6, '#9AAABE', 3, 9); g.restore();
  const catchUp = E.out(seg(k, .2, .8));
  person(g, { ...HER_LOOK, x: 720, y: 780, u: 52, face: 1, pose: lerpPose(POSE.stand, POSE.reach, catchUp), t: s, eyes: 'happy', mouth: 'grin', blush: .7, light: LIGHT.day,
    extra: (gg, B) => { gg.fillStyle = '#E8586A'; gg.fillRect(B.Nk[0] - .5 * B.u, B.Nk[1] - .1 * B.u, 1.1 * B.u, .4 * B.u); } });
  person(g, { ...HIM_LOOK, x: 1200, y: 780, u: 54, face: -1, pose: dr < 1 ? POSE.write2 : POSE.stand, t: s, eyes: dr >= 1 ? 'happy' : 'open', mouth: 'smile', light: LIGHT.day });
  snowfall(g, s, 160, [0, -40, W, H]);
}
/* 万般流连：元旦晚会，教室里挂满气球和拉花，黑板上写着"元旦快乐" */
function sParty(g, s, k) {
  classroomFront(g, s, { tod: 'night', clock: 23.9,
    board: gg => { chalk(gg, '元旦快乐！', 500, 330, 120, { col: '#FFE08A' }); chalk(gg, '2018', 1080, 500, 80, { col: '#9AE0FF' }); monDoodle(gg, 450, 520, 8, '#FFB8C8', 3, 3); },
    backs: gg => { for (let i = 0; i < 5; i++) backView(gg, { ...classmate(i), x: 180 + i * 390, y: 1050 - Math.max(0, Math.sin(s * 8 + i)) * 20, u: 70, light: LIGHT.room, t: s + i }); } });
  bunting(g, s, 0, 120, 960, 140, 50); bunting(g, s, 960, 140, W, 120, 50);
  balloons(g, s, 180, 760, 6, { w: 260 }); balloons(g, s, 1740, 760, 6, { w: 260 });
  for (let i = 0; i < 40; i++) { const t = (s * .5 + hash(i, 4)) % 1; g.fillStyle = ['#FFD25A', '#FF7A8A', '#7AC8FF', '#9AE08A'][i % 4]; g.save(); g.translate(hash(i, 5) * W, t * H); g.rotate(s * 4 + i); g.fillRect(-8, -3, 16, 6); g.restore(); }
}
/* 翻过岁月不同侧脸：墙上的日历一页页翻，一月、二月……六月，6 月 7 日用红笔圈着 */
function sCalendar(g, s, k) {
  g.fillStyle = '#EFE8DA'; g.fillRect(0, 0, W, H);
  const u = seg(k, 0, 2.6), page = Math.min(5, Math.floor(u * 6)), flip = u * 6 - Math.floor(u * 6);
  const cal = (gg, m) => {
    gg.fillStyle = '#FFFFFF'; gg.fillRect(-340, -420, 680, 840);
    gg.fillStyle = '#C8382E'; gg.fillRect(-340, -420, 680, 160);
    text(gg, `${m}月`, 0, -340, 96, { k: 'serifX', col: '#FFFFFF' }); text(gg, '2018', 220, -380, 34, { k: 'sans', col: '#FFE0D8' });
    for (let d = 0; d < 30; d++) { const cx = -270 + (d % 7) * 90, cy = -180 + Math.floor(d / 7) * 110; text(gg, String(d + 1), cx, cy, 40, { k: 'sans', col: d % 7 === 6 ? '#C8382E' : '#3A3A44' }); if (m === 6 && d === 6) { gg.strokeStyle = '#E8392E'; gg.lineWidth = 7; gg.beginPath(); gg.ellipse(cx, cy, 44, 36, -.1, 0, TAU * seg(k, 2.7, 3.0)); gg.stroke(); text(gg, '高考', cx + 50, cy + 60, 34, { k: 'hand', col: '#E8392E', alpha: seg(k, 2.9, 3.1) }); } }
  };
  g.save(); g.translate(960, 560);
  rr(g, -360, -470, 720, 50, 10); g.fillStyle = '#9A9AA6'; g.fill();
  cal(g, page + 1 + (page < 5 ? 1 : 0));
  if (page < 5) { g.save(); const c = Math.cos(Math.PI * E.in(flip) * .5); g.translate(0, -420); g.scale(1, c); g.translate(0, 420); cal(g, page + 1); g.restore(); }
  g.restore();
}
/* 措不及防闯入你的笑颜：拍毕业照。"三、二、一"，快门按下的那一下，她偏过头看他，笑了 */
const SHUTTER = 166.25;
function groupPhoto(g, s, o = {}) {
  summerSky(g, s, { tod: 'noon', clouds: 3, cy: 380, cw: 800, seed: 20 });
  teachBuilding(g, s, -100, 560, 2200, 4, { fh: 120 });
  for (let r = 0; r < 3; r++) { g.fillStyle = shade('#D6CDBC', 1 - r * .05); g.fillRect(0, 700 + r * 110, W, 110); }
  banner(g, 960, 300, 900, 90, '高三（2）班  毕业留念  2018.6', { sag: 8 });
  // 三排人（正面半身，后排高）
  const rows = [[590, 10, 64], [700, 10, 72], [820, 9, 80]];
  rows.forEach(([y, n, u], r) => {
    for (let i = 0; i < n; i++) {
      const x = 960 + (i - (n - 1) / 2) * (u * 2.4);
      const isHer = r === 2 && i === 4, isHim = r === 2 && i === 5;
      const who = isHer ? HER_LOOK : isHim ? HIM_LOOK : classmate(r * 10 + i);
      const turn = isHer && o.turn ? o.turn : 0;
      bust(g, { ...who, x, y, u: u * .62, eyes: isHer && turn > .5 ? 'happy' : 'open', gaze: isHer ? turn * .9 : isHim ? 0 : (hash(i, r) - .5) * .4, mouth: isHer && turn > .5 ? 'smile' : (hash(i, r, 3) < .5 ? 'smile' : 'grin'), tiltH: isHer ? turn * .12 : (hash(i, r, 4) - .5) * .1, blush: isHer ? turn : 0, light: LIGHT.noon, t: s });
    }
  });
}
/* 拍合影前的倒数 3、2、1：像相机自拍倒计时，圆圈里一个数字，外圈一秒走完一圈。放在左上角的楼上，别压住横幅 */
function photoCount(g, s, at, stroke) {
  const cd = Math.ceil(at - s);
  if (cd < 1 || cd > 3) return;
  const ph = 1 - (at - s) % 1, pop = 1 + .3 * (1 - E.out(seg(ph, 0, .22)));
  g.save(); g.translate(250, 330); g.scale(pop, pop);
  circ(g, 0, 0, 96); g.fillStyle = stroke; g.fill();
  circ(g, 0, 0, 80); g.strokeStyle = 'rgba(255,255,255,.3)'; g.lineWidth = 10; g.stroke();
  g.beginPath(); g.arc(0, 0, 80, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - ph)); g.strokeStyle = '#FFFFFF'; g.lineCap = 'round'; g.stroke();
  text(g, String(cd), 0, 6, 104, { k: 'sans', col: '#FFFFFF' });
  g.restore();
}
function sPhoto(g, s, k) {
  const turn = E.out(seg(s, SHUTTER - .25, SHUTTER));
  const frozen = s > SHUTTER + .15;
  if (!frozen) {
    g.save(); cam(g, 960, 640, 1.05);
    groupPhoto(g, s, { turn });
    g.restore();
    photoCount(g, s, SHUTTER, 'rgba(40,50,90,.6)');
  } else {
    // 定格成一张照片
    const d = E.out(seg(s, SHUTTER + .15, SHUTTER + 1.2));
    g.fillStyle = '#3A3430'; g.fillRect(0, 0, W, H);
    photo(g, 960, 520, lerp(1920, 1300, d), lerp(1080, 731, d), (gg, w, h) => { gg.save(); gg.scale(w / W, h / H); gg.translate(W / 2, H / 2); gg.scale(1.05, 1.05); gg.translate(-960, -640); groupPhoto(gg, SHUTTER, { turn: 1 }); gg.restore(); gg.fillStyle = `rgba(150,110,60,${.25 * d})`; gg.fillRect(0, 0, w, h); }, { rot: -.02 * d, pad: 26 * d });
    // 她那一格画个小圈
    const ring = seg(s, SHUTTER + 1.3, SHUTTER + 2.0);
    if (ring > 0) { g.strokeStyle = '#E8392E'; g.lineWidth = 6; g.beginPath(); g.ellipse(960, 626, 62, 72, 0, -Math.PI / 2, -Math.PI / 2 + TAU * ring); g.stroke(); }
  }
  if (s > SHUTTER && s < SHUTTER + .3) { g.fillStyle = `rgba(255,255,255,${1 - seg(s, SHUTTER, SHUTTER + .3)})`; g.fillRect(0, 0, W, H); }
}

/* ---------- 后半段：高考、毕业 ---------- */
/* 我曾难自拔于世界之大：高考考场。一排排桌子、答题卡、墙上的钟，窗外是六月的树 */
function sExam(g, s, k) {
  g.save(); cam(g, 1100, 720, 1.5);
  classroomSide(g, s, { tod: 'noon', x: 1200, wind: .3, fan: 1,
    front: gg => seatRow(gg, s, { ...ROW_F, sp: 420 }, -100, 5, i => i === 2 ? { ...HIM_LOOK, pose: POSE.write, eyes: 'open', brow: 1, mouth: 'n' } : classmate(i + 60, { pose: POSE.write }), { books: 0 }),
    back: gg => seatRow(gg, s, { ...ROW_B, sp: 340 }, 100, 6, i => classmate(i + 70, { pose: POSE.write }), { books: 0 }) });
  g.restore();
  // 墙上的钟和黑板上的"考试时间"
  wallClock(g, s, 300, 200, 90, 9, 15 + k * 2, {});
  rr(g, 520, 120, 520, 170, 8); g.fillStyle = '#2F5244'; g.fill();
  chalk(g, '语文  9:00—11:30', 560, 190, 50); chalk(g, '考试结束前15分钟停止答题', 560, 250, 30, { alpha: .8 });
}
/* 也沉溺于其中梦话：最后一门的铃响了，大家从考点冲出来，家长举着花在门口等 */
function sBell(g, s, k) {
  summerSky(g, s, { tod: 'noon', sun: [1650, 150, 56], clouds: 4, cy: 480, cw: 800, seed: 22 });
  schoolGate(g, s, { y: 900, banner: '高考考点', open: 1 });
  const rush = seg(k, .3, 3.0);
  for (let i = 0; i < 16; i++) {
    const x0 = 960 + (hash(i, 31) - .5) * 500, dirx = hash(i, 32) < .5 ? -1 : 1;
    const x = x0 + dirx * rush * (300 + hash(i, 33) * 700), y = 960 + hash(i, 34) * 80;
    person(g, { ...classmate(i + 80), x, y: y - 120, u: 34, face: dirx, pose: rush > 0 ? (hash(i, 35) < .4 ? POSE.cheer : walkPose(s * 2 + i, 1)) : POSE.stand, t: s, mouth: 'grin', eyes: 'happy', light: LIGHT.noon });
  }
  // 家长和花
  for (let i = 0; i < 8; i++) { const x = 100 + i * 240 + (i > 3 ? 300 : 0); if (x > 700 && x < 1200) continue; person(g, { look: kidLook(i + 300), outfit: 'adult', x, y: 860, u: 40, face: x < 960 ? 1 : -1, pose: POSE.give, t: s, mouth: 'smile', light: LIGHT.noon, hold: (gg, u) => { for (let j = 0; j < 5; j++) { circ(gg, u * .2 + (j % 3) * u * .25, -u * .4 - Math.floor(j / 3) * u * .2, u * .18); gg.fillStyle = ['#FF7A8A', '#FFD25A', '#FF9AB8'][j % 3]; gg.fill(); } } }); }
  if (k < .6) { const r = seg(k, 0, .6); for (let i = 0; i < 3; i++) { g.strokeStyle = `rgba(255,255,255,${1 - r})`; g.lineWidth = 6; g.beginPath(); g.arc(960, 300, 80 + r * 300 + i * 60, -2.4, -.7); g.stroke(); } text(g, '叮铃铃——', 960, 230, 70, { k: 'brush', col: '#FFFFFF', stroke: 'rgba(40,50,90,.6)', lw: 10, alpha: 1 - r * .5 }); }
}
/* 不得真假不做挣扎：教学楼上，所有人把试卷、复习资料往楼下撒，白花花一片像下雪 */
function sPapers(g, s, k) {
  summerSky(g, s, { tod: 'noon', clouds: 3, cy: 260, cw: 700, seed: 21 });
  teachBuilding(g, s, -100, 1080, 2200, 5, { fh: 190 });
  // 每层栏杆上探出来的人
  for (let f = 0; f < 4; f++) for (let i = 0; i < 9; i++) {
    const x = 120 + i * 210 + (f % 2) * 90, y = 1080 - (f + 1) * 190 + 150;
    person(g, { ...classmate(f * 9 + i + 100), x, y: y + 30, u: 26, face: hash(i, f) < .5 ? 1 : -1, pose: Math.sin(s * 6 + i + f) > 0 ? POSE.cheer : POSE.reach, t: s, mouth: 'grin', eyes: 'happy', light: LIGHT.noon, alpha: .95 });
    g.fillStyle = '#F6F0E4'; g.fillRect(x - 120, y + 10, 240, 34);
  }
  flyingPapers(g, s, 176.4, 140, { x0: 0, w: W, y0: 120, wind: 140, spread: 2.5 });
}
/* 不惧笑话：在彼此的校服背上签名，写什么的都有 */
function sSign(g, s, k) {
  g.fillStyle = vgrad(g, 0, H, SKYS.noon); g.fillRect(0, 0, W, H);
  cumulus(g, 1500, 500, 900, CLOUDP.noon, 1, 4);
  backView(g, { look: kidLook(130), outfit: 'uni', x: 600, y: 520, u: 150, light: LIGHT.noon, backText: (gg, u) => signatures(gg, u, Math.min(5, Math.floor(k * 2.2) + 1)) });
  person(g, { look: kidLook(131), outfit: 'uni', x: 1250, y: 760, u: 70, face: -1, pose: { ...POSE.write2, aN: [1.6 + Math.sin(s * 14) * .1, .55] }, t: s, mouth: 'grin', eyes: 'happy', light: LIGHT.noon });
  person(g, { look: kidLook(132), outfit: 'uni', x: 1580, y: 770, u: 64, face: -1, pose: POSE.cheer, t: s, mouth: 'grin', eyes: 'happy', light: LIGHT.noon });
}
/* 我曾将青春翻涌成她：她在他背上写了什么。他背对着，看不见；脸红了，一动也不敢动 */
function sHerSign(g, s, k) {
  g.save(); cam(g, 960, 560, 1.4);
  campusPath(g, s, 300, {});
  const write = Math.sin(s * 10) * .08;
  person(g, { ...HIM_LOOK, x: 1080, y: 760, u: 60, face: 1, pose: { ...POSE.stand, head: -.1 }, t: s, eyes: k > 1.2 ? 'closed' : 'open', mouth: 'n', blush: .3 + seg(k, .5, 2) * .8, light: LIGHT.noon });
  person(g, { ...HER_LOOK, x: 860, y: 770, u: 54, face: 1, pose: { ...POSE.write2, head: .3, aN: [1.55 + write, .6] }, t: s, eyes: 'open', mouth: 'smile', blush: .6, light: LIGHT.noon });
  g.restore();
  // 马克笔写字的"沙沙"线条（看不清写的什么）
  for (let i = 0; i < 3; i++) { const t = (s * 2 + i / 3) % 1; text(g, '～', 1030 + i * 20, 520 - t * 50, 30, { k: 'sans', col: 'rgba(60,70,110,.6)', alpha: 1 - t }); }
}
/* 也曾指尖弹出盛夏：毕业晚会，教室里关了灯，他站在讲台上弹吉他，底下一片手机的光在晃 */
function sStage(g, s, k) {
  classroomFront(g, s, { tod: 'night', clock: 21.5,
    board: gg => { chalk(gg, '毕业快乐', 520, 330, 130, { col: '#FFE08A' }); chalk(gg, '高三（2）班', 650, 500, 60, { col: '#9AE0FF' }); monDoodle(gg, 1250, 470, 7, '#FFB8C8', 3, 4); },
    teacher: gg => { const strum = Math.sin(s * 9) * .1; person(gg, { ...HIM_LOOK, x: 845, y: 560, u: 60, face: 1, pose: { ...POSE.guitar, aN: [POSE.guitar.aN[0] + strum, POSE.guitar.aN[1]], ...sitL(.04), lN: [.1, 0], lF: [-.05, 0], tilt: .04 }, t: s, eyes: 'closed', mouth: 'smile', light: LIGHT.night, extra: (g2, B) => guitarAt(g2, B.armN[2][0] - .2 * B.u, B.armN[2][1] - .1 * B.u, B.u / 110, -.42) }); },
    backs: gg => { for (let i = 0; i < 5; i++) backView(gg, { ...(i === 2 ? HER_LOOK : classmate(i)), x: 180 + i * 390, y: 1050, u: 70, light: LIGHT.night, t: s + i }); } });
  g.fillStyle = 'rgba(10,12,30,.45)'; g.fillRect(0, 0, W, H);
  glow(g, 845, 420, 500, '#FFE6B0', .35);
  // 手机的光
  for (let i = 0; i < 14; i++) { const x = 80 + i * 130 + Math.sin(s * 2 + i) * 40, y = 820 - (i % 3) * 30; g.save(); g.translate(x, y); g.rotate(Math.sin(s * 2 + i) * .3); rr(g, -14, -24, 28, 48, 5); g.fillStyle = '#FFFFFF'; g.fill(); g.restore(); glow(g, x, y, 60, '#FFFFFF', .35); }
  notes(g, s, 845, 380, 6, '#FFE6B0', .9);
}
/* 心之所动且就随缘去吧：散场了。她在门口回头冲他挥手；他把纸飞机背在身后，最后也没拿出来 */
function sGoodbye(g, s, k) {
  g.save(); cam(g, 960, 560, 1.15);
  corridor(g, s, 400, { tod: 'night', walkers: gg => {
    const leave = seg(k, 2.4, 5.0);
    person(gg, { ...HER_LOOK, x: 700 - leave * 700, y: 690, u: 46, face: leave > 0 ? -1 : 1, pose: leave > 0 ? walkPose(s * 1.0, 0) : POSE.wave, t: s, eyes: 'happy', mouth: 'smile', light: LIGHT.night, bag: '#F2B8C8' });
    const lower = E.io(seg(k, 3.6, 4.6));
    person(gg, { ...HIM_LOOK, x: 1200, y: 690, u: 48, face: -1, pose: { ...POSE.stand, aN: [-.6 + lower * .5, 1.4 - lower], aF: [-.5, 1.3], head: lower * .3 }, t: s, eyes: lower > .5 ? 'half' : 'open', mouth: 'n', light: LIGHT.night,
      hold: (g2, u) => paperPlane(g2, -u * .2, u * .1, u * .5, 1.3 - lower, {}) });
  } });
  g.restore();
}

/* ---------- 间奏：毕业以后 ---------- */
/* 空教室：黑板上写满了"毕业快乐"和大家的名字；他把纸飞机放进书包 */
function sEmptyRoom(g, s, k) {
  classroomFront(g, s, { tod: 'sunset', clock: 18.4,
    board: gg => {
      chalk(gg, '毕业快乐', 450, 300, 140, { col: '#FFE08A' });
      const names = ['老王', '班长', '小胖', '眼镜', '阿杰', '小雨', '课代表', '体委'];
      names.forEach((n, i) => chalk(gg, n, 360 + (i % 4) * 250, 470 + Math.floor(i / 4) * 90, 46, { rot: (hash(i, 3) - .5) * .2, col: ['#FFFFFF', '#9AE0FF', '#FFB8C8'][i % 3] }));
      monDoodle(gg, 1290, 300, 9, '#FFFFFF', 3, 6); chalk(gg, '常回来看看', 1100, 600, 40, { col: '#FFFFFF', alpha: .8 });
    } });
  g.save(); g.globalCompositeOperation = 'soft-light'; g.fillStyle = 'rgba(255,150,80,.35)'; g.fillRect(0, 0, W, H); g.restore();
  const put = E.io(seg(k, 1.0, 2.2));
  person(g, { ...HIM_LOOK, x: 1620, y: 860, u: 70, face: -1, pose: lerpPose(POSE.hold, { ...POSE.hold, aN: [.2, .8], aF: [.1, .9], head: .5 }, put), t: s, eyes: 'half', light: LIGHT.sunsetR, bag: '#4A6A9E',
    hold: put < .9 ? (gg, u) => paperPlane(gg, u * .8, -u * .4 + put * u, u * .5, -.3, {}) : null });
}
/* 两列火车：站台两边，一列往南一列往北。她在这一列的窗边，他在那一列，擦肩而过，谁也没看见谁 */
function sTrains(g, s, k) {
  g.fillStyle = vgrad(g, 0, H, SKYS.golden); g.fillRect(0, 0, W, H);
  ridge(g, 0, 500, 120, '#A6B6C8', 22, .0014, 3);
  // 远处那列往左开、近处这列往右开
  const v = seg(k, 0, 6.4);
  g.save(); g.translate(0, -60); greenTrain(g, s, 2600 - v * 3600, 640, .7, { cars: 9 }); g.restore();
  // 她在远处那列车的一扇窗里（剪影）
  const fx = 2600 - v * 3600 - 330;
  if (fx > -100 && fx < W + 100) { g.save(); g.beginPath(); g.rect(fx - 22, 480, 40, 44); g.clip(); circ(g, fx, 506, 16); g.fillStyle = '#2B1D24'; g.fill(); g.restore(); }
  g.fillStyle = '#9A9286'; g.fillRect(0, 660, W, 30);
  greenTrain(g, s, -600 + v * 3800, 1000, 1.3, { cars: 5 });
  // 他在近处这列车的窗里
  const nx = -600 + v * 3800 - 1.3 * 520 * 2 + 300;
  if (nx > -200 && nx < W + 200) { g.save(); g.beginPath(); g.rect(nx - 100, 1000 - 195 + 18 * 1.3, 52 * 1.3, 57 * 1.3); g.clip(); bust(g, { ...HIM_LOOK, x: nx - 66, y: 900, u: 26, eyes: 'half', gaze: -.6, light: LIGHT.golden }); g.restore(); }
  text(g, '2018 · 夏', 1700, 120, 40, { k: 'kai', col: 'rgba(255,255,255,.9)', ls: 6, shadow: 'rgba(0,0,0,.4)', sblur: 8 });
}
/* 四季：山坡上的学校，一年年过去。叶子黄了、下雪了、花开了……角落里的年份从 2018 翻到 2025 */
function sSeasons(g, s, k) {
  const u = seg(k, 0, 6.2), yr = 2018 + Math.min(7, Math.floor(u * 7.6));
  const sea = (u * 7.6 * 4) % 4;   // 每年四季
  const tod = 'noon';
  summerSky(g, s, { tod, clouds: 4, cy: 420, cw: 700, seed: 23, drift: 120 });
  const leaf = ramp([[0, '#6CB35A'], [.25, '#6CB35A'], [.45, '#E0A040'], [.6, '#C8C8C8'], [.8, '#F2B8C8'], [1, '#6CB35A']], sea / 4);
  ridge(g, 0, 640, 160, sea > 2.2 && sea < 3 ? '#E8ECF2' : '#8FB06E', 24, .0015, 3);
  teachBuilding(g, s, 620, 700, 680, 4, { fh: 60 });
  for (const [tx, r] of [[460, 120], [1460, 140], [1720, 100]]) { if (sea > 2.2 && sea < 3) { line(g, tx, 720, tx, 560, '#5A4A40', 16); circ(g, tx, 520, r * .7); g.fillStyle = '#F4F6FA'; g.fill(); } else tree(g, tx, 720, r, { col: leaf, lite: shade(leaf, 1.25), dark: shade(leaf, .75) }); }
  g.fillStyle = sea > 2.2 && sea < 3 ? '#F2F4F8' : vgrad(g, 700, H, [[0, '#8CC264'], [1, '#6AA24E']]); g.fillRect(0, 720, W, H - 720);
  if (sea > 2.2 && sea < 3) snowfall(g, s, 120, [0, -40, W, H]);
  if (sea > 1 && sea < 2) leavesBlow(g, s, 30, [0, 0, W, H], 1, { cols: ['#E0A040', '#C86A3A', '#F2C060'], vx: 300, vy: -80 });
  if (sea > 3) petals(g, s, 40, [0, -40, W, H], ['#FFC8D8', '#FFFFFF'], { vx: 80, vy: 60 });
  text(g, String(yr), 1700, 140, 90, { k: 'serifX', col: '#FFFFFF', shadow: 'rgba(0,0,0,.4)', sblur: 12, ls: 6 });
}
/* 回到现在：空教室，夕阳。他坐在当年的座位上，闭上眼；窗外的风吹进来，带着白色的槐花 */
function sBackNow(g, s, k) {
  g.save(); cam(g, 1000, 700, 1.45 + k * .02);
  classroomSide(g, s, { tod: 'present', x: 900, empty: true, wind: .5 + seg(k, 3, 6) * 1.2, fan: 0,
    front: gg => {
      deskSide(gg, 820, 868 - 20, 1, { w: 200, h: 120, books: 0 });
      person(gg, { who: 'he', outfit: 'shirt', x: 1070, y: 868, u: 40, face: -1, pose: POSE.sitHold, t: s, eyes: k > 2 ? 'closed' : 'half', mouth: k > 3.5 ? 'smile' : 'n', light: LIGHT.golden, wind: [-.3 * seg(k, 3, 6), 0],
        hold: (g2, u) => paperPlane(g2, u * 1.05, -u * .55, u * .62, -.3, { old: true }) });
    } });
  g.restore();
  petals(g, s, Math.round(60 * seg(k, 3.0, 6.0)), [-200, -100, W, H], ['#FFFFFF', '#F6F2DA'], { vx: 260, vy: 40, size: 7 });
}

SCENES_DEF.push(() => {
  scene('stairs', 118.85, sStairs, { tr: { type: 'fade', dur: .5 }, bloom: .35 });
  scene('doornow', 122.0, sDoorNow, { tr: { type: 'fade', dur: .5 }, bloom: .35 });
  scene('desknow', 125.3, sDeskNow, { tr: { type: 'fade', dur: .4 }, bloom: .35 });
  scene('carving', 128.5, sCarving, { tr: { type: 'blur', dur: .4 }, bloom: .35 });
  scene('clock', 131.7, sClock, { tr: { type: 'fade', dur: .4 }, bloom: .3 });
  scene('rewind', 134.85, sRewind, { tr: { type: 'glitch', dur: .3 }, bloom: .3 });
  scene('morning', REWIND_END, sMorning, { tr: { type: 'flash', dur: .4 }, bloom: .35 });
  scene('smile2', 140.45, sSmile2, { tr: { type: 'fade', dur: .4 }, bloom: .4 });
  scene('bikes', 142.85, sBikes, { tr: { type: 'leak', dur: .6 }, bloom: .45 });
  scene('earbuds', 145.95, sEarbuds, { tr: { type: 'fade', dur: .4 }, bloom: .4 });
  scene('stars', 147.65, sStars, { tr: { type: 'black', dur: .4 }, bloom: .45 });
  scene('pledge', 150.5, sPledge, { tr: { type: 'flash', dur: .4 }, bloom: .2 });
  scene('lamps', 153.15, sLamps, { tr: { type: 'black', dur: .4 }, bloom: .45 });
  scene('snow', 155.7, sSnow, { tr: { type: 'flash', dur: .4 }, bloom: .25 });
  scene('party', 158.75, sParty, { tr: { type: 'whip', dur: .35 }, bloom: .35 });
  scene('calendar', 160.5, sCalendar, { tr: { type: 'blur', dur: .35 }, bloom: .2 });
  scene('photo', 163.55, sPhoto, { tr: { type: 'fade', dur: .4 }, bloom: .25 });
  scene('exam', 169.3, sExam, { tr: { type: 'fade', dur: .4 }, bloom: .2, grade: 'saturate(.95) contrast(1.08)' });
  scene('bell', 173.35, sBell, { tr: { type: 'flash', dur: .4 }, bloom: .25 });
  scene('papers', 176.5, sPapers, { tr: { type: 'whipV', dur: .4, dir: -1 }, bloom: .3 });
  scene('sign', 179.45, sSign, { tr: { type: 'whip', dur: .35 }, bloom: .25 });
  scene('hersign', 182.1, sHerSign, { tr: { type: 'fade', dur: .4 }, bloom: .3 });
  scene('stage', 185.95, sStage, { tr: { type: 'black', dur: .4 }, bloom: .5 });
  scene('goodbye', 189.05, sGoodbye, { tr: { type: 'fade', dur: .5 }, bloom: .4 });
  scene('emptyroom', bar(61), sEmptyRoom, { tr: { type: 'fade', dur: .8 }, bloom: .35 });
  scene('trains', bar(62), sTrains, { tr: { type: 'leak', dur: .7 }, bloom: .35 });
  scene('seasons', bar(64), sSeasons, { tr: { type: 'cloud', dur: .8, pal: CLOUDP.noon }, bloom: .25 });
  scene('backnow', bar(66), sBackNow, { tr: { type: 'fade', dur: .8 }, bloom: .35 });
});
