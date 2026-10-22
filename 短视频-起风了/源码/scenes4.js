'use strict';
/* scenes4.js：桥段和最后一遍副歌（七年后）。
   桥段：她回来了，站在学校后院那棵老槐树下，晚风把白色的槐花吹进她的鬓角；树皮上当年刻的小怪长成了一道疤；
         回忆里，运动会那天她扭了脚，他扶着她走在黄昏的跑道上；她回到老家，从床头的抽屉里拿出一本素描本，里面画的是低着头说话的他。
   最后一遍副歌：同学聚会，大家起哄；他终于把那只纸飞机交给她；拆开，是一张写着"我喜欢你"的卷子；
         风把它吹上了天；她翻开素描本——画的下面，也写着"我喜欢你"。 */

const ADULT_HER = { who: 'she', outfit: 'adult' }, ADULT_HIM = { who: 'he', outfit: 'shirt' };
function adultMate(i, extra = {}) { return { look: kidLook(i + 20), outfit: 'adult', ...extra }; }

/* 老槐树：粗树干、一团团叶子，挂满一串串白花 */
function pagodaTree(g, s, x, y, k, o = {}) {
  const sw = Math.sin(s * 1.3) * 8 * (o.wind ?? 1);
  g.fillStyle = '#5A4638'; g.beginPath(); g.moveTo(x - 60 * k, y); g.quadraticCurveTo(x - 40 * k, y - 300 * k, x - 90 * k, y - 520 * k); g.lineTo(x + 40 * k, y - 520 * k); g.quadraticCurveTo(x + 10 * k, y - 300 * k, x + 70 * k, y); g.closePath(); g.fill();
  line(g, x - 60 * k, y - 400 * k, x - 300 * k, y - 620 * k, '#5A4638', 30 * k); line(g, x + 20 * k, y - 450 * k, x + 280 * k, y - 640 * k, '#5A4638', 28 * k);
  const blobs = [[-300, -680, 200], [0, -760, 260], [280, -700, 210], [-150, -560, 180], [170, -560, 170], [-420, -560, 140], [420, -580, 150]];
  for (const [bx, by, br] of blobs) { circ(g, x + bx * k + sw, y + by * k, br * k); g.fillStyle = o.dark || '#3E6A44'; g.fill(); }
  for (const [bx, by, br] of blobs) { circ(g, x + bx * k + sw - 20 * k, y + by * k - 20 * k, br * k * .8); g.fillStyle = o.col || '#5E8A4E'; g.fill(); }
  // 一串串白花
  for (let i = 0; i < 70; i++) {
    const b = blobs[i % blobs.length], a = hash(i, 41) * TAU, d = Math.sqrt(hash(i, 42)) * b[2] * .9;
    const px = x + (b[0] + Math.cos(a) * d) * k + sw, py = y + (b[1] + Math.sin(a) * d) * k;
    for (let j = 0; j < 4; j++) { circ(g, px + (hash(i, j) - .5) * 10 * k, py + j * 9 * k, 6 * k); g.fillStyle = j % 2 ? '#FFFFFF' : '#F4F2DC'; g.fill(); }
  }
}
function backGarden(g, s, o = {}) {
  summerSky(g, s, { tod: o.tod || 'sunset', sun: o.sun || [1550, 640, 70], clouds: 3, cy: 600, cw: 900, seed: 30 });
  townSkyline(g, s, 0, 760, 'sunset');
  g.fillStyle = vgrad(g, 760, H, [[0, '#7A8A5A'], [1, '#5A6A44']]); g.fillRect(0, 760, W, H - 760);
  // 矮墙、石板路
  g.fillStyle = '#C9B8A0'; g.fillRect(0, 740, W, 40); g.fillStyle = '#B8A68C'; g.fillRect(0, 734, W, 10);
  for (let i = 0; i < 9; i++) { ell(g, 200 + i * 200, 980 - (i % 2) * 20, 90, 22); g.fillStyle = '#B9AE9C'; g.fill(); }
}
/* 第 68 小节：学校后院，老槐树开满白花。树下站着一个人——七年后的她 */
function sTreeWide(g, s, k) {
  g.save(); cam(g, 960, 560, 1.0 + k * .02);
  backGarden(g, s);
  pagodaTree(g, s, 760, 860, 1.0, {});
  person(g, { ...ADULT_HER, x: 1080, y: 760, u: 46, face: -1, pose: { ...POSE.lookUp, head: -.3 }, t: s, eyes: 'open', light: LIGHT.sunsetR, wind: [-.6, 0] });
  g.restore();
  petals(g, s, 50, [-100, -50, W, H], ['#FFFFFF', '#F4F2DC'], { vx: -120, vy: 40, size: 7 });
}
/* 晚风吹起你鬓间的白发：她的特写。风把槐花吹进她的鬓角，白白的几点，像白头发；她抬手拂了一下 */
function sWhiteHair(g, s, k) {
  soft(g, gg => { backGarden(gg, s); pagodaTree(gg, s, 760, 860, 1.0, {}); });
  g.fillStyle = 'rgba(255,190,140,.15)'; g.fillRect(0, 0, W, H);
  const z = 1.0 + k * .03;
  g.save(); cam(g, 960, 560, z);
  bust(g, { ...ADULT_HER, x: 900, y: 660, u: 200, eyes: k > 2.6 ? 'half' : 'open', gaze: .5, gazeY: -.4, mouth: 'n', blush: .3, tiltH: -.04, light: LIGHT.sunsetR, t: s, wind: [-1.1 - .3 * Math.sin(s * 1.7), .1],
    extra: (gg, u) => {
      // 落在鬓角头发上的槐花
      for (let i = 0; i < 9; i++) { const sx = i % 2 ? 1 : -1, px = sx * (1.0 + hash(i, 5) * .2) * u, py = (-.6 + hash(i, 6) * 1.2) * u, a = seg(s, 220.6 + i * .25, 221.0 + i * .25); if (a > 0) { circ(gg, px, py, .06 * u); gg.fillStyle = rgba('#FFFFFF', a); gg.fill(); } }
    } });
  g.restore();
  petals(g, s, 40, [-100, -50, W, H], ['#FFFFFF', '#F4F2DC'], { vx: -140, vy: 40, size: 9 });
}
/* 抚平回忆留下的疤：树皮上刻着一只像素小怪和"2018"，长了七年，长成了一道疤。她的手轻轻摸过去 */
function sScar(g, s, k) {
  g.fillStyle = '#6A5444'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 40; i++) { const x = hash(i, 3) * W; g.strokeStyle = `rgba(40,28,20,${.25 + hash(i, 4) * .3})`; g.lineWidth = 6 + hash(i, 5) * 14; g.beginPath(); g.moveTo(x, -20); g.bezierCurveTo(x + 40, 300, x - 40, 700, x + 20, 1100); g.stroke(); }
  g.save(); g.translate(900, 500); g.scale(1.2, 1.35);
  for (const [off, col] of [[4, 'rgba(255,220,180,.35)'], [0, 'rgba(40,24,16,.9)']]) { g.save(); g.translate(off, off); monDoodle(g, 0, 0, 30, col, 14, 8); g.restore(); text(g, '2018', 0 + off, 200 + off, 80, { k: 'hand', col, rot: .05 }); }
  g.restore();
  glow(g, 900, 520, 500, '#FFC890', .3);
  const tr = seg(k, .3, 2.8), [fx, fy] = pathAt([[620, 380], [1160, 380], [1160, 640], [760, 700]], tr);
  g.save(); g.translate(fx + 60, fy + 40); g.rotate(-.4);
  g.fillStyle = '#EBDCC6'; rr(g, 60, 200, 300, 900, 100); g.fill();
  g.fillStyle = '#F6D7C3'; rr(g, -10, 50, 230, 280, 100); g.fill(); for (let i = 0; i < 3; i++) { rr(g, -40 + i * 64, -30 + i * 10, 56, 170, 28); g.fill(); }
  g.restore();
}
/* 你的眼中明暗交杂：她眼睛的大特写，眼睛里映着天光，一闪一闪是当年的画面 */
function sEyes(g, s, k) {
  g.fillStyle = '#E8B898'; g.fillRect(0, 0, W, H);
  const u = 620, y0 = 470 - .1 * u;
  bust(g, { ...ADULT_HER, x: 960, y: y0, u, eyes: 'open', gaze: Math.sin(s * .8) * .15, mouth: 'n', light: LIGHT.sunsetR, t: s, blush: .2, tear: seg(k, 1.6, 2.8) * .5, wind: [-.4, 0] });
  // 眼睛的高光里映着当年的画面：一只小小的纸飞机一闪一闪
  for (const sx of [-1, 1]) {
    const hx = 960 + sx * .4 * u + .05 * u, hy = y0 + .1 * u - .07 * u;
    withAlpha(g, .55 + .35 * Math.sin(s * 3 + sx), () => paperPlane(g, hx + 14, hy + 4, 9, -.2, {}));
  }
  g.fillStyle = 'rgba(40,24,30,.18)'; g.fillRect(0, 0, W, H);
}
/* 一笑生花：她笑了。满树的槐花一下子被风吹起来，围着她转 */
function sBloom(g, s, k) {
  const pull = E.out(seg(k, 0, 2.4));
  g.save(); cam(g, 960, 520, lerp(2.4, 1.15, pull));
  backGarden(g, s);
  pagodaTree(g, s, 760, 860, 1.0, { wind: 2 });
  person(g, { ...ADULT_HER, x: 1080, y: 760, u: 46, face: -1, pose: { ...POSE.stand, head: -.1 }, t: s, eyes: 'happy', mouth: 'smile', blush: .6, light: LIGHT.sunsetR, wind: [-.8, 0] });
  g.restore();
  const swirl = seg(k, .1, 2.6);
  for (let i = 0; i < 90; i++) { const a = hash(i, 51) * TAU + s * (1 + hash(i, 52)), r = 120 + hash(i, 53) * 700 * swirl; const px = 1000 + Math.cos(a) * r, py = 480 + Math.sin(a) * r * .55 - swirl * 120; g.save(); g.translate(px, py); g.rotate(a); ell(g, 0, 0, 8, 5); g.fillStyle = i % 4 ? '#FFFFFF' : '#FFE8F0'; g.fill(); g.restore(); }
  glow(g, 1000, 480, 500, '#FFF0E0', .3 * swirl);
}
/* 暮色遮住你蹒跚的步伐：回忆。运动会那天她扭了脚，他把她的胳膊架在自己肩上，两个人一瘸一拐走在黄昏的跑道上 */
function sLimp(g, s, k) {
  summerSky(g, s, { tod: 'sunset', sun: [400, 600, 90], clouds: 3, cy: 600, cw: 1000, seed: 31 });
  glow(g, 400, 600, 700, '#FFB070', .5);
  track(g, s, k * 40, 760, {});
  const step = s * 1.1, limp = Math.max(0, Math.sin(step * TAU)) * .25;
  const she = { ...HER_LOOK, x: 1000 - k * 30, y: 840 + limp * 10, u: 56, face: -1, pose: { ...walkPose(step, 0), tilt: .1 + limp, aF: [2.5, .4] }, t: s, eyes: 'half', mouth: 'n', light: LIGHT.sunset };
  const he = { ...HIM_LOOK, x: 1150 - k * 30, y: 830, u: 58, face: -1, pose: { ...walkPose(step + .5, 0), aN: [2.4, .6] }, t: s, eyes: 'open', mouth: 'n', blush: .4, light: LIGHT.sunset };
  // 长长的影子
  for (const p of [she, he]) { g.save(); g.translate(p.x, 1000); g.transform(1, 0, -2.2, .25, 0, 0); g.fillStyle = 'rgba(80,40,40,.25)'; rr(g, -40, -500, 80, 500, 30); g.fill(); g.restore(); }
  person(g, she); person(g, he);
  g.fillStyle = 'rgba(255,170,110,.12)'; g.fillRect(0, 0, W, H);
}
/* 走进床头藏起的画：她的卧室（老家）。拉开床头柜的抽屉，下面压着一本素描本 */
function sDrawer(g, s, k) {
  g.save(); cam(g, 900, 640, 1.25);
  const open = E.io(seg(k, .2, 1.0));
  herBedroom(g, s, { drawer: open });
  const take = E.out(seg(k, 1.2, 2.6));
  person(g, { ...ADULT_HER, x: 1280, y: 780, u: 52, face: -1, pose: lerpPose({ ...POSE.give, aN: [1.0, .4], head: .4 }, POSE.hold, take), t: s, eyes: 'open', mouth: 'n', light: LIGHT.sunsetR,
    hold: take > .2 ? (gg, u) => { gg.save(); gg.translate(u * .9, -u * .4); gg.rotate(-.3); gg.fillStyle = '#5A6E8E'; gg.fillRect(-u * .9, -u * .6, u * 1.8, u * 1.2); gg.fillStyle = '#F2EEE2'; gg.fillRect(-u * .85, -u * .55, u * .1, u * 1.1); gg.restore(); } : null });
  g.restore();
}
/* 画中的你低着头说话：素描本里，铅笔画的十七岁的他，低着头，好像在小声说什么；画的下面那行字被她的拇指压着 */
function sSketch(g, s, k) {
  g.fillStyle = '#5A4A44'; g.fillRect(0, 0, W, H);
  g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = lgrad(g, W, 0, 600, H, [[0, 'rgba(255,170,110,.5)'], [1, 'rgba(255,170,110,0)']]); g.fillRect(0, 0, W, H); g.restore();
  g.save(); cam(g, 960, 540, 1.0 + k * .03);
  sketchOfHim(g, s, 960, 540, 640, { talk: seg(k, .3, .8) * (1 - seg(k, 4.5, 5.3)), caption: 0, rot: -.02 });
  // 她的拇指压着下面那行字
  g.save(); g.translate(1000, 900); g.rotate(-.15);
  g.fillStyle = '#F6D7C3'; rr(g, -90, -40, 180, 110, 50); g.fill(); g.fillStyle = 'rgba(255,255,255,.5)'; rr(g, -60, -30, 70, 40, 20); g.fill();
  g.fillStyle = '#EBDCC6'; rr(g, -100, 50, 220, 300, 60); g.fill();
  g.restore();
  g.restore();
}

/* ---------- 最后一遍副歌：同学聚会 ---------- */
function reunionBg(g, s, x, o = {}) {
  summerSky(g, s, { tod: 'dusk', x, sun: [1500, 760, 60], clouds: 3, cy: 640, cw: 900, seed: 33 });
  teachBuilding(g, s, -200 - x * .3, 760, 2400, 4, { fh: 120, night: true });
  g.fillStyle = vgrad(g, 760, H, [[0, '#9A6A5A'], [1, '#6A4A48']]); g.fillRect(0, 760, W, H - 760);
  // 一串小灯
  for (let i = 0; i < 30; i++) { const px = i * 70 - (x * .5) % 70, py = 180 + Math.sin(i * .4) * 30; circ(g, px, py, 7); g.fillStyle = ['#FFE08A', '#FFB8C8', '#9AE0FF'][i % 3]; g.fill(); glow(g, px, py, 30, '#FFE6B0', .4); }
  if (o.banner !== false) banner(g, 960 - x * .3, 290, 1180, 100, '高三（2）班  毕业七年  回家看看', { sag: 14 });
}
/* 我仍感叹于世界之大：黄昏的操场，横幅"毕业七年 回家看看"。老同学们三三两两聊着天，他走进来，四下找 */
function sReunion(g, s, k) {
  const x = k * 60;
  reunionBg(g, s, x);
  for (let i = 0; i < 9; i++) { const px = 140 + i * 200 + (i > 4 ? 120 : 0); person(g, { ...adultMate(i), x: px - x * .6, y: 880 + (i % 2) * 40, u: 40, face: i % 2 ? -1 : 1, pose: i % 3 ? POSE.stand : POSE.wave, t: s + i, mouth: i % 2 ? 'talk' : 'smile', eyes: 'open', light: LIGHT.dusk }); }
  person(g, { ...ADULT_HIM, x: 1680 - k * 120, y: 860, u: 50, face: -1, pose: k < 2.4 ? walkPose(s * 1.0, 0) : { ...POSE.stand, head: -.15 }, t: s, eyes: 'open', light: LIGHT.dusk, bag: '#3A4A5E' });
}
/* 也沉醉于儿时情话：一个老同学学当年的班主任扔粉笔头，大家笑成一团；他们身后，十七岁的他们也在笑 */
const _ghost = mk(), _ghostG = _ghost.getContext('2d');
function sJokes(g, s, k) {
  g.save(); cam(g, 960, 640, 1.3);
  reunionBg(g, s, 200, { banner: false });
  // 十七岁的影子：坐在课桌前的他们，先整排画到离屏画布上再一起淡淡地叠上去（不然桌椅、人互相盖住的地方会更深）
  _ghostG.setTransform(1, 0, 0, 1, 0, 0); _ghostG.clearRect(0, 0, W, H); _ghostG.setTransform(g.getTransform());
  seatRow(_ghostG, s, ROW_F, 300, 4, i => ({ ...classmate(i), mouth: 'grin', eyes: 'happy' }), { light: LIGHT.noon, books: 3 });
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = .3; g.drawImage(_ghost, 0, 0); g.restore();
  person(g, { ...adultMate(3), x: 760, y: 880, u: 46, face: 1, pose: Math.sin(s * 3) > 0 ? POSE.aim : POSE.stand, t: s, mouth: 'grin', eyes: 'open', glasses: true, light: LIGHT.dusk });
  for (let i = 0; i < 3; i++) person(g, { ...adultMate(i + 6), x: 1060 + i * 170, y: 880, u: 44, face: -1, pose: POSE.stand, t: s * 3 + i, mouth: 'grin', eyes: 'happy', light: LIGHT.dusk });
  person(g, { ...ADULT_HIM, x: 1600, y: 870, u: 48, face: -1, pose: POSE.stand, t: s, mouth: 'grin', eyes: 'happy', light: LIGHT.dusk });
  g.restore();
  for (let i = 0; i < 4; i++) { const t = (s * .8 + i / 4) % 1; text(g, '哈哈', 500 + i * 300, 360 - t * 140, 48, { k: 'brush', col: '#FFFFFF', alpha: Math.sin(Math.PI * t), stroke: 'rgba(60,40,70,.6)', lw: 8 }); }
}
/* 不剩真假不做挣扎：她来了。大家看见她，"哦——"地起哄，把他往前推 */
function sPush(g, s, k) {
  g.save(); cam(g, 960, 640, 1.2);
  reunionBg(g, s, 300, { banner: false });
  const push = E.io(seg(k, .8, 2.2));
  for (let i = 0; i < 4; i++) person(g, { ...adultMate(i + 2), x: 520 + i * 140 + push * 120, y: 880, u: 44, face: 1, pose: push > 0 && push < 1 ? POSE.give : POSE.cheer, t: s + i, mouth: 'o', eyes: 'happy', light: LIGHT.dusk });
  person(g, { ...ADULT_HIM, x: 1000 + push * 220, y: 870, u: 50, face: 1, pose: push > 0 && push < 1 ? walkPose(s * 1.6, .3) : POSE.stand, t: s, eyes: 'wide', mouth: 'o', blush: .5 + push * .4, light: LIGHT.dusk });
  person(g, { ...ADULT_HER, x: 1560 - E.out(seg(k, 0, 1.0)) * 120, y: 860, u: 48, face: -1, pose: k < 1 ? walkPose(s * 1.0, 0) : POSE.stand, t: s, eyes: 'open', mouth: 'smile', blush: .4, light: LIGHT.dusk, wind: [-.4, 0] });
  g.restore();
  const a = seg(k, .8, 1.4) * (1 - seg(k, 2.8, 3.3));
  text(g, '哦——', 620, 330, 90, { k: 'brush', col: '#FFFFFF', alpha: a, stroke: 'rgba(60,40,70,.6)', lw: 12, rot: -.08 });
}
/* 无谓笑话：两个人面对面，都不好意思地笑了 */
function sFace(g, s, k) {
  g.save(); cam(g, 960, 600, 1.9 + k * .02);
  reunionBg(g, s, 300, { banner: false });
  person(g, { ...ADULT_HIM, x: 840, y: 870, u: 50, face: 1, pose: k > 1 ? POSE.scratch : POSE.stand, t: s, eyes: 'happy', mouth: 'grin', blush: .7, light: LIGHT.dusk });
  person(g, { ...ADULT_HER, x: 1100, y: 860, u: 48, face: -1, pose: { ...POSE.stand, head: .2 }, t: s, eyes: 'happy', mouth: 'smile', blush: .8, light: LIGHT.dusk, wind: [-.3, 0] });
  g.restore();
}
/* 我终将青春还给了她：他把那只发黄的纸飞机递给她 */
function sGive(g, s, k) {
  g.save(); cam(g, 960, 600, 1.85);
  reunionBg(g, s, 300, { banner: false });
  const give = E.io(seg(k, .2, 1.2)), take = seg(k, 1.8, 2.6);
  person(g, { ...ADULT_HIM, x: 830, y: 870, u: 50, face: 1, pose: lerpPose(POSE.hold, POSE.give, give), t: s, eyes: 'open', mouth: 'n', blush: .6, light: LIGHT.dusk,
    hold: take < .5 ? (gg, u) => paperPlane(gg, u * .5, -u * .1, u * .55, -.1, { old: true }) : null });
  person(g, { ...ADULT_HER, x: 1110, y: 860, u: 48, face: -1, pose: take > 0 ? lerpPose(POSE.stand, POSE.hold, take) : POSE.stand, t: s, eyes: k > 1.2 ? 'open' : 'wide', mouth: 'o', blush: .5, light: LIGHT.dusk,
    hold: take >= .5 ? (gg, u) => paperPlane(gg, u * 1.0, -u * .5, u * .55, -.2, { old: true }) : null });
  g.restore();
}
/* 连同指尖弹出的盛夏：她把纸飞机拆开。是当年的一张卷子，背面用铅笔写着"我喜欢你"，旁边画了一只小怪 */
function sUnfold(g, s, k) {
  g.fillStyle = '#4A3A40'; g.fillRect(0, 0, W, H);
  g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = rgrad(g, 960, 540, 100, 1100, [[0, 'rgba(255,190,140,.4)'], [1, 'rgba(255,190,140,0)']]); g.fillRect(0, 0, W, H); g.restore();
  const un = E.io(seg(k, 0, 1.1));
  if (un < .98) paperPlane(g, 1200, 540, 220 * (1 - un * .5), -.1 + un * .3, { old: true, alpha: 1 - un });
  if (un > .3) {
    paperSheet(g, 960, 540, 900 * (.6 + .4 * un), 1100 * (.6 + .4 * un), { col: '#EFE2BE', lines: false, rot: -.03, draw: (gg, w, h) => {
      // 折痕
      gg.strokeStyle = 'rgba(160,140,100,.5)'; gg.lineWidth = 3; gg.beginPath(); gg.moveTo(0, -h / 2); gg.lineTo(0, h / 2); gg.moveTo(-w / 2, -h / 2); gg.lineTo(0, -h * .1); gg.lineTo(w / 2, -h / 2); gg.stroke();
      // 卷子正面透过来的印刷字（反着的、淡淡的）
      for (let i = 0; i < 14; i++) gg.fillRect(-w * .4 + (i % 2) * 20, -h * .42 + i * h * .06, w * (.5 + hash(i, 3) * .3), 3);
      const wr = seg(k, .9, 1.8);
      gg.save(); gg.beginPath(); gg.rect(-w / 2, -h / 2, w * wr, h); gg.clip();
      text(gg, '我喜欢你', 0, h * .02, w * .16, { k: 'hand', col: 'rgba(50,46,60,.9)', rot: -.04, ls: 10 });
      gg.restore();
      monDoodle(gg, w * .28, h * .25, w * .02, 'rgba(50,46,60,.75)', 3, 4);
      text(gg, '2018.6.7', -w * .25, h * .3, w * .05, { k: 'hand', col: 'rgba(50,46,60,.7)' });
    } });
  }
}
/* 心之所动就随风去了：一阵风，把那张纸从她手里吹走，一路飞上了晚霞；她笑着，眼角有泪 */
function sFlyAway(g, s, k) {
  const z = lerp(1.6, 1.0, E.io(seg(k, 1.0, 3.0)));
  g.save(); cam(g, 960, lerp(600, 540, seg(k, 1, 3)), z);
  reunionBg(g, s, 300, { banner: false });
  const gust = seg(k, .5, 1.0);
  person(g, { ...ADULT_HIM, x: 830, y: 870, u: 50, face: 1, pose: { ...POSE.lookUp }, t: s, eyes: 'open', mouth: 'smile', light: LIGHT.dusk, wind: [-gust, 0] });
  person(g, { ...ADULT_HER, x: 1110, y: 860, u: 48, face: -1, pose: k < .7 ? POSE.hold : { ...POSE.lookUp }, t: s, eyes: 'happy', mouth: 'smile', blush: .7, tear: seg(k, 2, 3.5) * .6, light: LIGHT.dusk, wind: [-1.2 * gust, 0] });
  g.restore();
  if (k > .6) {
    const u = seg(k, .6, 5.2);
    const [px, py, a] = pathAt([[1000, 560], [900, 420], [1100, 300], [1300, 200], [1500, 120], [1700, 40]], E.io(u));
    g.save(); g.translate(px, py); g.rotate(a + Math.sin(s * 4) * .5); g.scale(Math.cos(s * 3), 1); g.fillStyle = '#EFE2BE'; g.fillRect(-60 * (1 - u * .6), -75 * (1 - u * .6), 120 * (1 - u * .6), 150 * (1 - u * .6)); g.restore();
  }
  windStreaks(g, s, 12, .3 * gust + .1, { y0: 200, y1: 900, sp: 1600 });
  petals(g, s, 40, [-100, -50, W, H], ['#FFFFFF', '#F4F2DC'], { vx: 300, vy: -20, size: 7 });
}
/* 以爱之名你还愿意吗：她翻开素描本给他看。画的是低着头的他；拇指挪开，下面一行字——"我喜欢你"。和他那张，是同一句 */
const REVEAL = 273.2;
function sReveal(g, s, k) {
  if (s < REVEAL) {
    g.save(); cam(g, 960, 600, 1.9);
    reunionBg(g, s, 300, { banner: false });
    const show = E.out(seg(k, .2, 1.2));
    person(g, { ...ADULT_HIM, x: 830, y: 870, u: 50, face: 1, pose: POSE.stand, t: s, eyes: 'open', mouth: 'n', light: LIGHT.dusk });
    person(g, { ...ADULT_HER, x: 1110, y: 860, u: 48, face: -1, pose: lerpPose(POSE.stand, POSE.give, show), t: s, eyes: 'open', mouth: 'smile', blush: .7, light: LIGHT.dusk,
      hold: (gg, u) => { gg.save(); gg.translate(u * .4, -u * .3); gg.rotate(-.1); gg.fillStyle = '#5A6E8E'; gg.fillRect(-u * .9, -u * .65, u * 1.8, u * 1.3); gg.fillStyle = '#F8F4E8'; gg.fillRect(-u * .8, -u * .55, u * 1.6, u * 1.1); gg.restore(); } });
    g.restore();
  } else {
    g.fillStyle = '#4A3A40'; g.fillRect(0, 0, W, H);
    g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = rgrad(g, 960, 500, 100, 1100, [[0, 'rgba(255,200,150,.45)'], [1, 'rgba(255,200,150,0)']]); g.fillRect(0, 0, W, H); g.restore();
    const cap = seg(s, REVEAL + .5, REVEAL + 1.6);
    g.save(); cam(g, 960, 560, 1.0 + seg(s, REVEAL, 279) * .06);
    sketchOfHim(g, s, 960, 540, 620, { talk: 0, caption: cap, rot: -.02 });
    // 拇指挪开
    const mv = E.io(seg(s, REVEAL + .2, REVEAL + .8));
    g.save(); g.translate(1000 + mv * 320, 900 + mv * 160); g.rotate(-.15);
    g.fillStyle = '#F6D7C3'; rr(g, -90, -40, 180, 110, 50); g.fill(); g.fillStyle = '#EBDCC6'; rr(g, -100, 50, 220, 300, 60); g.fill();
    g.restore();
    g.restore();
    // 两张纸并排：他的卷子在左边飘进来
    const pair = E.out(seg(s, REVEAL + 2.4, REVEAL + 3.4));
    if (pair > 0) { paperSheet(g, lerp(-400, 330, pair), 620, 380, 460, { col: '#EFE2BE', lines: false, rot: -.08, draw: (gg, w, h) => { text(gg, '我喜欢你', 0, 0, w * .16, { k: 'hand', col: 'rgba(50,46,60,.9)', rot: -.04, ls: 6 }); text(gg, '2018.6.7', -w * .2, h * .3, w * .06, { k: 'hand', col: 'rgba(50,46,60,.7)' }); } }); }
  }
}

SCENES_DEF.push(() => {
  scene('treewide', bar(68), sTreeWide, { tr: { type: 'fade', dur: .8 }, bloom: .4 });
  scene('whitehair', 220.4, sWhiteHair, { tr: { type: 'fade', dur: .5 }, bloom: .45 });
  scene('scar', 224.5, sScar, { tr: { type: 'blur', dur: .5 }, bloom: .3 });
  scene('eyes', 227.7, sEyes, { tr: { type: 'fade', dur: .4 }, bloom: .35 });
  scene('bloomtree', 230.7, sBloom, { tr: { type: 'flash', dur: .4 }, bloom: .45 });
  scene('limp', 233.35, sLimp, { tr: { type: 'leak', dur: .6 }, bloom: .45, grade: 'saturate(1.05) sepia(.18) contrast(1.04)' });
  scene('drawer', 237.3, sDrawer, { tr: { type: 'fade', dur: .5 }, bloom: .35 });
  scene('sketch', 240.5, sSketch, { tr: { type: 'blur', dur: .5 }, bloom: .3 });
  scene('reunion', 246.1, sReunion, { tr: { type: 'flash', dur: .5 }, bloom: .4 });
  scene('jokes', 249.85, sJokes, { tr: { type: 'whip', dur: .35 }, bloom: .4 });
  scene('push', 253.1, sPush, { tr: { type: 'whip', dur: .35, dir: -1 }, bloom: .4 });
  scene('face', 256.35, sFace, { tr: { type: 'fade', dur: .4 }, bloom: .4 });
  scene('give', 258.95, sGive, { tr: { type: 'fade', dur: .4 }, bloom: .4 });
  scene('unfold', 262.7, sUnfold, { tr: { type: 'blur', dur: .4 }, bloom: .35 });
  scene('flyaway', 266.1, sFlyAway, { tr: { type: 'fade', dur: .4 }, bloom: .45 });
  scene('reveal', 271.6, sReveal, { tr: { type: 'fade', dur: .4 }, bloom: .4 });
});
