'use strict';
/* scenes5.js：尾奏、结尾的问话、片尾卡和封面。
   尾奏：那张纸被风吹回成一只纸飞机，飞过学校、小城和河，飞进晚霞；
         七年后再拍一张合影，这回两个人互相看着；和 2018 年那张并排放着；
         夜里两个人并肩走出校门；天台上，十七岁的他们坐在女儿墙上，扔出一只纸飞机，飞向月亮。
   钢琴收尾的时候，大字和画外音："你的青春里，有没有一句没说出口的话？" */

/* 第 87 小节起：纸被风折回一只纸飞机，飞过学校的屋顶、小城、河，一直飞进晚霞 */
function sSkyPlane(g, s, k) {
  const x = k * 220;
  summerSky(g, s, { tod: 'dusk', x, sun: [1600, 700, 70], clouds: 4, cy: 640, cw: 1000, seed: 35 });
  glow(g, 1600, 700, 900, '#FFB080', .45);
  townSkyline(g, s, x * .6, 860, 'dusk');
  river(g, s, 900, 1000, { top: '#E89A8A', bot: '#9A6A8E' });
  teachBuilding(g, s, 200 - x * 1.1, 1080, 900, 3, { fh: 120, night: true });
  const fold = E.io(seg(k, 0, 1.0));
  const [px, py, a] = pathAt([[300, 700], [700, 520], [1100, 470], [1400, 380], [1700, 300], [2100, 240]], seg(k, 0, 6.2));
  if (fold < 1) { g.save(); g.translate(px, py); g.rotate(s * 3); g.fillStyle = '#EFE2BE'; g.fillRect(-50 * (1 - fold), -60 * (1 - fold), 100 * (1 - fold), 120 * (1 - fold)); g.restore(); }
  paperPlane(g, px, py, 60 * fold + 1, a, { old: true, alpha: fold, glow: .4 });
  swallows(g, s, 4, [0, 200, W, 500], .8, 21);
}
/* 七年后的合影：同一段台阶，大人模样的同学们；"三、二、一"——这回他们两个互相看着 */
const SHUTTER2 = 288.6;
function groupPhoto2025(g, s, o = {}) {
  reunionBg(g, s, 0, { banner: false });
  banner(g, 960, 300, 900, 90, '高三（2）班  毕业七年  2025', { sag: 8 });
  for (let r = 0; r < 3; r++) { g.fillStyle = shade('#9A6A5A', 1 - r * .05); g.fillRect(0, 700 + r * 110, W, 110); }
  const rows = [[590, 9, 64], [700, 10, 72], [820, 9, 80]];
  rows.forEach(([y, n, u], r) => {
    for (let i = 0; i < n; i++) {
      const x = 960 + (i - (n - 1) / 2) * (u * 2.4);
      const isHer = r === 2 && i === 4, isHim = r === 2 && i === 5;
      const who = isHer ? ADULT_HER : isHim ? ADULT_HIM : adultMate(r * 10 + i);
      const turn = (isHer || isHim) ? (o.turn || 0) : 0;
      bust(g, { ...who, x, y, u: u * .62, eyes: turn > .5 ? 'happy' : 'open', gaze: isHer ? turn * .9 : isHim ? -turn * .9 : (hash(i, r) - .5) * .4, mouth: turn > .5 ? 'smile' : (hash(i, r, 3) < .5 ? 'smile' : 'grin'), tiltH: isHer ? turn * .12 : isHim ? -turn * .12 : (hash(i, r, 4) - .5) * .1, blush: turn * .8, light: LIGHT.dusk, t: s });
    }
  });
}
function sPhoto2025(g, s, k) {
  const turn = E.out(seg(s, SHUTTER2 - .3, SHUTTER2));
  g.save(); cam(g, 960, 640, 1.05);
  groupPhoto2025(g, s, { turn });
  g.restore();
  photoCount(g, s, SHUTTER2, 'rgba(40,30,60,.6)');
  if (s > SHUTTER2 && s < SHUTTER2 + .35) { g.fillStyle = `rgba(255,255,255,${1 - seg(s, SHUTTER2, SHUTTER2 + .35)})`; g.fillRect(0, 0, W, H); }
}
/* 两张合影并排：2018 年她偷偷看他，2025 年两个人互相看着 */
function sTwoPhotos(g, s, k) {
  g.fillStyle = '#3A3430'; g.fillRect(0, 0, W, H);
  const a = E.out(seg(k, 0, .8)), b = E.out(seg(k, .6, 1.4));
  photo(g, lerp(-500, 520, a), 500, 780, 439, (gg, w, h) => { gg.save(); gg.scale(w / W, h / H); gg.translate(W / 2, H / 2); gg.scale(1.05, 1.05); gg.translate(-960, -640); groupPhoto(gg, SHUTTER, { turn: 1 }); gg.restore(); gg.fillStyle = 'rgba(150,110,60,.25)'; gg.fillRect(0, 0, w, h); }, { rot: -.04, pad: 18 });
  photo(g, lerp(2400, 1400, b), 560, 780, 439, (gg, w, h) => { gg.save(); gg.scale(w / W, h / H); gg.translate(W / 2, H / 2); gg.scale(1.05, 1.05); gg.translate(-960, -640); groupPhoto2025(gg, SHUTTER2, { turn: 1 }); gg.restore(); }, { rot: .03, pad: 18 });
  text(g, '2018', 520, 820, 52, { k: 'hand', col: '#F6E8C8', alpha: a });
  text(g, '2025', 1400, 880, 52, { k: 'hand', col: '#F6E8C8', alpha: b });
  // 圈出两个人
  const r1 = seg(k, 1.6, 2.3), r2 = seg(k, 2.4, 3.1);
  g.strokeStyle = '#E8392E'; g.lineWidth = 5;
  if (r1 > 0) { g.beginPath(); g.ellipse(520 - 10, 500 + 52, 70, 46, -.04, -Math.PI / 2, -Math.PI / 2 + TAU * r1); g.stroke(); }
  if (r2 > 0) { g.beginPath(); g.ellipse(1400 + 25, 560 + 52, 100, 48, .03, -Math.PI / 2, -Math.PI / 2 + TAU * r2); g.stroke(); }
}
/* 夜里两个人并肩走出校门，路灯一盏盏亮着，风吹着她的头发 */
function sWalkOut(g, s, k) {
  const x = k * 120;
  summerSky(g, s, { tod: 'night', clouds: 2, seed: 36, wisps: false });
  moon(g, 1500, 200, 70, {});
  oldStreet(g, s, 800 + x, { y: 820, night: true });
  // 路灯
  for (let i = -1; i < 4; i++) { const lx = ((i * 640 - x * 1.15) % (W + 640) + W + 640) % (W + 640) - 300; line(g, lx, 900, lx, 420, '#4A4A56', 10); line(g, lx, 420, lx + 60, 400, '#4A4A56', 8); circ(g, lx + 64, 404, 12); g.fillStyle = '#FFE6A8'; g.fill(); glow(g, lx + 64, 404, 200, '#FFD890', .5); }
  person(g, { ...ADULT_HER, x: 860 + k * 30, y: 690, u: 46, face: 1, pose: walkPose(s * .9, 0), t: s, eyes: 'happy', mouth: 'smile', blush: .6, light: LIGHT.night, wind: [-.6, 0] });
  person(g, { ...ADULT_HIM, x: 1010 + k * 30, y: 682, u: 48, face: 1, pose: walkPose(s * .9 + .5, 0), t: s, eyes: 'open', mouth: 'smile', light: LIGHT.night, bag: '#3A4A5E' });
  const rise = E.io(seg(k, 6.0, 9.6));
  if (rise > 0) { g.fillStyle = `rgba(6,10,30,${rise * .85})`; g.fillRect(0, 0, W, H); stars(g, s, 0, 0, rise); }
}
/* 天台的夜：十七岁的他们坐在女儿墙上，七年后的他们站在后面看着；两个少年把一只纸飞机扔向月亮 */
const LAUNCH = 309.4;
function sFinale(g, s, k) {
  summerSky(g, s, { tod: 'night', clouds: 2, cy: 640, cw: 800, seed: 37, wisps: false });
  milkyWay(g, 960, 260, 2600, -.2, .45);
  moon(g, 1560, 220, 90, { halo: '#B8C4FF' });
  townSkyline(g, s, 0, 800, 'night');
  g.fillStyle = '#2E3048'; g.fillRect(0, 860, W, 220); g.fillStyle = '#4A4C66'; g.fillRect(0, 800, W, 66); g.fillStyle = '#5E6080'; g.fillRect(0, 792, W, 14);
  // 七年后的他们，站在后面
  person(g, { ...ADULT_HIM, x: 520, y: 760, u: 50, face: 1, pose: POSE.stand, t: s, eyes: 'open', mouth: 'smile', light: LIGHT.night });
  person(g, { ...ADULT_HER, x: 380, y: 768, u: 48, face: 1, pose: POSE.stand, t: s, eyes: 'happy', mouth: 'smile', light: LIGHT.night, wind: [-.4, 0] });
  // 十七岁的他们：发着淡淡的光，坐在女儿墙上
  g.save(); g.globalCompositeOperation = 'screen';
  const th = seg(s, LAUNCH - .5, LAUNCH + .2);
  person(g, { ...HER_LOOK, x: 960, y: 790, u: 46, face: 1, pose: POSE.sit, t: s, eyes: 'happy', mouth: 'grin', light: LIGHT.night, alpha: .8 });
  person(g, { ...HIM_LOOK, x: 1150, y: 790, u: 48, face: 1, pose: th > 0 && th < 1 ? lerpPose(POSE.sit, { ...POSE.sit, aN: [2.4, -.2] }, Math.sin(Math.PI * th)) : POSE.sit, t: s, eyes: 'open', mouth: 'grin', light: LIGHT.night, alpha: .8,
    hold: s < LAUNCH ? (gg, u) => paperPlane(gg, u * .3, 0, u * .5, -.3, {}) : null });
  g.restore();
  glow(g, 1060, 660, 260, '#BFD0FF', .25);
  if (s >= LAUNCH) { const u = seg(s, LAUNCH, LAUNCH + 6.5); const [px, py, a] = pathAt([[1200, 640], [1320, 520], [1420, 400], [1500, 300], [1550, 230]], E.out(u)); paperPlane(g, px, py, 40 * (1 - u * .7), a, { glow: .5 }); }
  // 片名再出来一次
  const ta = E.out(seg(s, 311.5, 313.2)) * (1 - seg(s, 315.6, 316.2));
  if (ta > 0) { text(g, '起风了', 760, 330, 170, { k: 'brush', col: '#FFFFFF', alpha: ta, glow: '#BFD0FF', gr: 40, ga: .5, shadow: 'rgba(0,0,20,.6)', sblur: 20 }); }
}
/* 结尾的问话（画外音同时念）：你的青春里，有没有一句没说出口的话？ */
const Q_AT = 316.7;
function sQuestion(g, s, k) {
  summerSky(g, s, { tod: 'night', clouds: 2, cy: 700, cw: 800, seed: 37, wisps: false });
  milkyWay(g, 960, 260, 2600, -.2, .45);
  moon(g, 1560, 220, 90, { halo: '#B8C4FF' });
  paperPlane(g, 1480 + k * 10, 270 - k * 4, 12, -.6, { glow: .5 });
  townSkyline(g, s, 0, 860, 'night');
  g.fillStyle = 'rgba(6,8,24,.35)'; g.fillRect(0, 0, W, H);
  const a = E.out(seg(s, Q_AT - .2, Q_AT + .5));
  text(g, '你的青春里，', 960, 420, 96, { k: 'serifX', col: '#FFFFFF', alpha: a, glow: '#BFD0FF', gr: 30, ga: .5, shadow: 'rgba(0,0,20,.7)', sblur: 16, ls: 8 });
  text(g, '有没有一句没说出口的话？', 960, 580, 96, { k: 'serifX', col: '#FFF1D6', alpha: E.out(seg(s, Q_AT + .9, Q_AT + 1.6)), glow: '#FFD8A0', gr: 30, ga: .5, shadow: 'rgba(0,0,20,.7)', sblur: 16, ls: 6 });
}
/* 片尾卡（2.5 秒）：夜空、纸飞机、片名、歌曲出处、AI 声明、甜菜 出品 */
function sEndCard(g, s, k) {
  skyGrad(g, SKYS.night); stars(g, s, 3000, 0, 1); milkyWay(g, 960, 300, 2400, -.2, .45);
  paperPlane(g, 1300 + k * 40, 330 - k * 12, 34, -.25, { glow: .5 });
  pixelMon(g, 600, 340 + Math.sin(s * 3) * 4, 4, MON.pink, 1, { glow: .4 });
  const a = E.out(seg(k, 0, .4));
  text(g, '你的青春里，有没有一句没说出口的话？', 960, 180, 54, { k: 'kai', col: '#FFFFFF', alpha: a, glow: '#FFD8A0', gr: 24, ls: 3 });
  text(g, '起风了', 960, 560, 150, { k: 'brush', col: '#FFFFFF', alpha: a, glow: '#BFD0FF', gr: 30 });
  text(g, '歌曲：《起风了》 买辣椒也用券', 960, 760, 34, { k: 'kai', col: '#D8D4F0', alpha: a * .95, ls: 2 });
  text(g, '画面、动画、音效：Claude 用代码生成 · 配音：CosyVoice 3 合成', 960, 820, 30, { k: 'kai', col: '#C2BEE0', alpha: a * .9, ls: 2 });
  text(g, '甜菜 出品', 960, 920, 46, { k: 'kai', col: '#FFE2B0', alpha: a, glow: '#FFB870', gr: 16, ls: 10 });
}

/* 封面：她在教室里回过头笑，窗帘被风吹起来；左边大字片名和开头那句问话。缩成小图也要看得清 */
function drawCoverArt(s = 74.8) {
  const g = ctx; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = GRADE;
  gM.save(); gM.setTransform(1, 0, 0, 1, 0, 0); gM.fillStyle = '#000'; gM.fillRect(0, 0, W, H);
  soft(gM, gg => { classroomSide(gg, s, { tod: 'noon', x: 300, wind: 1.4 }); });
  gM.fillStyle = 'rgba(255,250,235,.25)'; gM.fillRect(0, 0, W, H);
  glow(gM, 1500, 300, 900, '#FFF6DA', .55);
  bust(gM, { ...HER_LOOK, x: 1380, y: 560, u: 220, eyes: 'happy', gaze: -.3, mouth: 'smile', blush: .8, tiltH: .05, light: LIGHT.room, t: s, wind: [-.6, 0],
    extra: (gg, u) => paperPlane(gg, -1.9 * u, 1.3 * u, u * .5, -.3, {}) });
  petals(gM, s, 30, [0, -50, W, H], ['#FFFFFF', '#FFF2C8'], { vx: 60, vy: 30, size: 7, a: .8 });
  gM.restore();
  g.drawImage(main, 0, 0); g.filter = 'none';
  bloom(g, main, .3, .62);
  g.drawImage(TEX.vig, 0, 0);
  g.fillStyle = lgrad(g, 0, 0, 1150, 0, [[0, 'rgba(18,26,48,.62)'], [.7, 'rgba(18,26,48,.25)'], [1, 'rgba(18,26,48,0)']]); g.fillRect(0, 0, 1150, H);
  text(g, '起风了', 110, 330, 260, { k: 'brush', col: '#FFFFFF', align: 'left', glow: '#FFE8C0', gr: 50, ga: .5, shadow: 'rgba(10,16,36,.8)', sblur: 24, sy: 6 });
  text(g, '如果能回到高中，', 128, 560, 74, { k: 'serifX', col: '#FFFFFF', align: 'left', shadow: 'rgba(10,16,36,.85)', sblur: 14, sy: 3, ls: 4 });
  text(g, '你最想见谁？', 128, 660, 74, { k: 'serifX', col: '#FFE2B0', align: 'left', shadow: 'rgba(10,16,36,.85)', sblur: 14, sy: 3, ls: 4 });
  text(g, '买辣椒也用券 · 起风了 · MV', 132, 760, 38, { k: 'kai', col: 'rgba(240,236,255,.92)', align: 'left', ls: 3, shadow: 'rgba(10,16,36,.8)', sblur: 10 });
  text(g, '甜菜', 1888, 46, 30, { k: 'kai', align: 'right', col: 'rgba(255,255,255,.66)', shadow: 'rgba(0,0,0,.4)', sblur: 6, ls: 2 });
}

SCENES_DEF.push(() => {
  scene('skyplane', bar(87), sSkyPlane, { tr: { type: 'fade', dur: .8 }, bloom: .45 });
  scene('photo2025', bar(89), sPhoto2025, { tr: { type: 'flash', dur: .5 }, bloom: .35 });
  scene('twophotos', 290.3, sTwoPhotos, { tr: { type: 'fade', dur: .5 }, bloom: .25 });
  scene('walkout', bar(92), sWalkOut, { tr: { type: 'black', dur: .6 }, bloom: .45 });
  scene('finale', bar(95), sFinale, { tr: { type: 'fade', dur: .8 }, bloom: .5 });
  scene('question', Q_AT - .5, sQuestion, { tr: { type: 'fade', dur: .6 }, bloom: .45 });
  scene('endcard', CARD_AT, sEndCard, { tr: { type: 'fade', dur: .5 }, bloom: .45 });
});
