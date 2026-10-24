'use strict';
/* main.js —— 镜头表、转场、歌词、日期戳、片名、水印、片尾字、封面；逐帧入口 frame(t)。
   镜头表 SHOTS：每个镜头 { t 开始（秒）, fn 画面函数(g, t, s), tr 进入时的转场, d 转场时长, look 后期, stamp 回忆里的日期戳 }。
   一个镜头画到下一个镜头开始；有转场时，上一个镜头接着往后画 d 秒，两个一起混。 */

/* 后期的几套风格：bloom 柔光、grain 颗粒、vig 暗角、warm 暖色（soft-light）、cool 冷色、leak 漏光 */
const LOOKS = {
  night: { bloom: .55, grain: .06, vig: .5, cool: .22 },
  summer: { bloom: .35, grain: .07, vig: .35, warm: .28, leak: .25 },
  dusk: { bloom: .45, grain: .07, vig: .45, warm: .32, leak: .15 },
  memNight: { bloom: .65, grain: .07, vig: .5, warm: .08 },
  gray: { bloom: .25, grain: .07, vig: .45, cool: .1, desat: .35 },
  room: { bloom: .45, grain: .06, vig: .5, warm: .12 },
  dawn: { bloom: .5, grain: .06, vig: .35, warm: .22 },
  dream: { bloom: .8, grain: .06, vig: .3, warm: .2, leak: .4 },
};

function todo(label, c1, c2) {
  return (g, t, s) => {
    g.fillStyle = lg(g, 0, 0, 0, H, [[0, c1], [1, c2]]); g.fillRect(0, 0, W, H);
    text(g, label, 490, 760, 44, 'rgba(255,255,255,.7)', { weight: 500 });
    text(g, `${s.t.toFixed(2)}–${s.e.toFixed(2)}`, 490, 830, 30, 'rgba(255,255,255,.5)');
  };
}

const SHOTS = [
  { t: 0, fn: shUmbrellaSea, look: 'night' },
  { t: 1.71, fn: shPolaroidRain, look: 'night' },
  { t: 3.32, fn: shRewind, look: 'night', tr: 'ripple', d: .35 },
  { t: 9.72, fn: shSummerTurn, look: 'summer', stamp: 1, tr: 'white', d: .5 },
  { t: 11.95, fn: shTitlePhoto, look: 'night', tr: 'shutter', d: .45 },
  { t: 14.10, fn: shWalkRain, look: 'night', tr: 'fade', d: .5 },
  { t: 18.85, fn: shCrossing, look: 'night', tr: 'fade', d: .3 },
  { t: 21.70, fn: shSeaLost, look: 'night', tr: 'fade', d: .3 },
  { t: 24.80, fn: shFaceRain, look: 'night', tr: 'fade', d: .4 },
  { t: 26.85, fn: shWindowRain, look: 'room', tr: 'fade', d: .5 },
  { t: 31.65, fn: shOldBook, look: 'room', tr: 'fade', d: .5 },
  { t: 38.56, fn: shGardeniaClose, look: 'summer', stamp: 1, tr: 'white', d: .6 },
  { t: 42.70, fn: shBenchRead, look: 'summer', stamp: 1, tr: 'fade', d: .5 },
  { t: 45.60, fn: shSkirtPetals, look: 'summer', stamp: 1, tr: 'fade', d: .4 },
  { t: 51.30, fn: shWhisper, look: 'summer', stamp: 1, tr: 'fade', d: .4 },
  { t: 58.40, fn: shSmell, look: 'summer', stamp: 1, tr: 'fade', d: .4 },
  { t: 64.80, fn: shDayToNight, look: 'dusk', stamp: 1, tr: 'fade', d: .5 },
  { t: 68.85, fn: shFireflies, look: 'memNight', stamp: 1, tr: 'fade', d: .4 },
  { t: 71.75, fn: shKiss, look: 'memNight', stamp: 1, tr: 'fade', d: .4 },
  { t: 77.60, fn: shBalconySky, look: 'night', tr: 'fade', d: .6 },
  { t: 81.35, fn: shSighs, look: 'night', tr: 'fade', d: .3 },
  { t: 84.40, fn: shEyeStars, look: 'night', tr: 'fade', d: .4 },
  { t: 89.83, fn: shBicycle, look: 'summer', stamp: 1, tr: 'white', d: .5 },
  { t: 96.95, fn: shEarphones, look: 'summer', stamp: 1, tr: 'fade', d: .4 },
  { t: 102.20, fn: shArgue, look: 'gray', stamp: 1, tr: 'fade', d: .4 },
  { t: 105.40, fn: shWalkAway, look: 'gray', stamp: 1, tr: 'fade', d: .3 },
  { t: 109.80, fn: shPuddle, look: 'gray', stamp: 1, tr: 'fade', d: .4 },
  { t: 115.75, fn: shTwoWindows, look: 'night', tr: 'fade', d: .5 },
  { t: 120.15, fn: shSameMoon, look: 'night', tr: 'fade', d: .4 },
  { t: 123.00, fn: shKeepsakes, look: 'night', tr: 'fade', d: .4 },
  { t: 128.27, fn: shPlatformWait, look: 'dusk', stamp: 1, tr: 'fade', d: .5 },
  { t: 132.60, fn: shTrainLeave, look: 'dusk', stamp: 1, tr: 'fade', d: .3 },
  { t: 135.70, fn: shDreamHug, look: 'dream', stamp: 1, tr: 'white', d: .4 },
  { t: 138.00, fn: shEmptyPlatform, look: 'dusk', stamp: 1, tr: 'shatter', d: .6 },
  { t: 140.65, fn: shPhotos, look: 'room', tr: 'fade', d: .5 },
  { t: 146.85, fn: shPhone, look: 'room', tr: 'fade', d: .4 },
  { t: 153.05, fn: shAutumn, look: 'night', tr: 'fade', d: .4 },
  { t: 155.05, fn: shFlowerShop, look: 'room', tr: 'fade', d: .4 },
  { t: 159.85, fn: shPlane, look: 'night', tr: 'fade', d: .3 },
  { t: 162.65, fn: shSeaPeople, look: 'night', tr: 'fade', d: .4 },
  { t: 165.85, fn: shTearEye, look: 'night', tr: 'fade', d: .3 },
  { t: 167.85, fn: shTearDrop, look: 'night', tr: 'fade', d: .3 },
  { t: 172.65, fn: shCampusGone, look: 'night', tr: 'fade', d: .4 },
  { t: 179.54, fn: shStumpGlow, look: 'dream', tr: 'fade', d: .5 },
  { t: 185.95, fn: shGhosts, look: 'dream', tr: 'fade', d: .5 },
  { t: 192.36, fn: shVortex, look: 'dream', tr: 'fade', d: .5 },
  { t: 198.76, fn: shPalmPetal, look: 'memNight', tr: 'fade', d: .6 },
  { t: 204.70, fn: shHisDesk, look: 'room', tr: 'fade', d: .5 },
  { t: 210.95, fn: shHisPhone, look: 'night', tr: 'fade', d: .4 },
  { t: 217.20, fn: shSubwayArrive, look: 'night', tr: 'fade', d: .3 },
  { t: 219.15, fn: shGiveSeat, look: 'night', tr: 'fade', d: .3 },
  { t: 223.90, fn: shTrainsPass, look: 'night', tr: 'fade', d: .3 },
  { t: 226.70, fn: shStationCrowd, look: 'night', tr: 'fade', d: .3 },
  { t: 229.95, fn: shStairsSnow, look: 'night', tr: 'fade', d: .3 },
  { t: 231.90, fn: shStandStill, look: 'night', tr: 'fade', d: .3 },
  { t: 236.70, fn: shSnowPetal, look: 'night', tr: 'fade', d: .4 },
  { t: 242.75, fn: shDawnBloom, look: 'dawn', tr: 'fade', d: .5 },
  { t: 244.75, fn: shSmellAgain, look: 'dawn', tr: 'fade', d: .4 },
  { t: 249.55, fn: shRelease, look: 'dawn', tr: 'fade', d: .4 },
  { t: 252.35, fn: shOverCity, look: 'dawn', tr: 'fade', d: .4 },
  { t: 255.55, fn: shThroughClouds, look: 'dream', tr: 'fade', d: .4 },
  { t: 257.55, fn: shDescend, look: 'summer', stamp: 1, tr: 'white', d: .4 },
  { t: 262.40, fn: shBecomePhoto, look: 'summer', stamp: 1, tr: 'fade', d: .4 },
  { t: 269.20, fn: shSeasons, look: 'summer', tr: 'fade', d: .5 },
  { t: 275.20, fn: shBoyLovesGirl, look: 'memNight', stamp: 1, tr: 'fade', d: .5 },
  { t: 282.07, fn: shRiseStars, look: 'memNight', tr: 'fade', d: .6 },
  { t: 291.68, fn: shPhotoBack, look: 'room', tr: 'fade', d: .8 },
  { t: 301.29, fn: shEnd, look: 'memNight', tr: 'fade', d: 1.0 },
];
SHOTS.forEach((s, i) => { s.i = i; s.e = i + 1 < SHOTS.length ? SHOTS[i + 1].t : DUR; });
buildRewind();

/* ---------------- 转场 ---------------- */
/* A 是上一个镜头、B 是这一个，u 0~1 */
const TRANS = {
  cut: (g, A, B, u) => g.drawImage(B, 0, 0),
  fade: (g, A, B, u) => { g.drawImage(A, 0, 0); g.globalAlpha = E.sine(u); g.drawImage(B, 0, 0); g.globalAlpha = 1; },
  white: (g, A, B, u) => {   // 闪白：先亮到白，再从白里出来
    if (u < .35) { g.drawImage(A, 0, 0); g.fillStyle = `rgba(255,252,240,${E.in2(u / .35)})`; }
    else { g.drawImage(B, 0, 0); g.fillStyle = `rgba(255,252,240,${1 - E.out(seg(u, .35, 1))})`; }
    g.fillRect(0, 0, W, H);
  },
  black: (g, A, B, u) => { g.drawImage(u < .5 ? A : B, 0, 0); g.fillStyle = `rgba(0,0,0,${1 - Math.abs(u * 2 - 1)})`; g.fillRect(0, 0, W, H); },
  shutter: (g, A, B, u) => {   // 快门：一下白光，画面"咔"地定住
    g.drawImage(u < .18 ? A : B, 0, 0);
    g.fillStyle = `rgba(255,255,255,${u < .18 ? u / .18 : 1 - E.out(seg(u, .18, 1))})`; g.fillRect(0, 0, W, H);
  },
  ripple: (g, A, B, u) => {   // 水波：横条带按正弦错开，A 淡出、B 淡入
    const amp = 40 * Math.sin(u * PI), q = layer('rippleTmp');
    q.drawImage(A, 0, 0); q.globalAlpha = E.sine(u); q.drawImage(B, 0, 0); q.globalAlpha = 1;
    const sh = 12;
    for (let y = 0; y < H; y += sh) g.drawImage(LAYER.rippleTmp, 0, y, W, sh, Math.sin(y * .02 + u * 18) * amp, y, W, sh);
  },
  zoom: (g, A, B, u) => {   // 冲进画面中心
    const k = E.in(u), s = 1 + k * 1.5;
    g.save(); g.translate(W / 2, H * .45); g.scale(s, s); g.translate(-W / 2, -H * .45); g.globalAlpha = 1 - E.in2(u); g.drawImage(A, 0, 0); g.restore();
    g.save(); g.globalAlpha = E.out(u); const s2 = 1.3 - .3 * E.out(u); g.translate(W / 2, H * .45); g.scale(s2, s2); g.translate(-W / 2, -H * .45); g.drawImage(B, 0, 0); g.restore();
  },
  whip: (g, A, B, u) => {   // 甩镜头：往左甩，带横向拖影
    const k = E.io(u), off = k * W;
    for (let i = 0; i < 6; i++) { g.globalAlpha = .22; g.drawImage(A, -off - i * 40 * Math.sin(u * PI), 0); g.drawImage(B, W - off - i * 40 * Math.sin(u * PI), 0); }
    g.globalAlpha = 1;
  },
  shatter: (g, A, B, u) => {   // 碎掉：A 裂成碎片往下掉，露出 B
    g.drawImage(B, 0, 0);
    const r = R(9), n = 7, m = 12;
    for (let j = 0; j < m; j++) for (let i = 0; i < n; i++) {
      const x = i * W / n, y = j * H / m, w = W / n, h = H / m, d = r() * .3, k = clamp((u - d) / (1 - d));
      if (k >= 1) continue;
      g.save(); g.globalAlpha = 1 - k * k;
      g.translate(x + w / 2 + (r() - .5) * 300 * k, y + h / 2 + 900 * k * k); g.rotate((r() - .5) * 2.5 * k);
      g.beginPath(); g.moveTo(-w / 2 + r() * 20, -h / 2); g.lineTo(w / 2, -h / 2 + r() * 30); g.lineTo(w / 2 - r() * 20, h / 2); g.lineTo(-w / 2, h / 2 - r() * 30); g.closePath(); g.clip();
      g.drawImage(A, -x - w / 2, -y - h / 2);
      g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 2; g.stroke();
      g.restore();
    }
  },
};

/* ---------------- 歌词 ---------------- */
const LYR = { x: 490, y: 1440, max: 820 };
/* 每句从什么时候显示到什么时候：交棒时刻 = max(下一句第一个字 − 0.45, 上一句最后一个字 + 0.25)；
   长间奏前的最后一句，唱完 1.2 秒后淡出。第 0 句"后来"由片名代替，不出歌词。 */
const LSPAN = LY.map((l, k) => {
  const first = l.chars[0][1], prevLast = k ? LY[k - 1].chars[LY[k - 1].chars.length - 1][1] : -9;
  return { a: Math.max(first - .45, prevLast + .25), end: l.chars[l.chars.length - 1][2] };
});
LSPAN.forEach((s, k) => { const nx = LSPAN[k + 1]; s.b = nx && nx.a - s.end < 3 ? nx.a : s.end + 1.2; });
function lyrics(g, t, warm) {
  // 歌词底下垫一层很淡的暗带，亮的画面上也看得清
  let band = 0;
  for (let k = 1; k < LY.length; k++) { const sp = LSPAN[k]; band = Math.max(band, env(t, sp.a - .1, sp.a + .3, sp.b, sp.b + .4)); }
  if (band > 0) { g.fillStyle = lg(g, 0, LYR.y - 150, 0, LYR.y + 150, [[0, 'rgba(10,8,20,0)'], [.5, `rgba(10,8,20,${.28 * band})`], [1, 'rgba(10,8,20,0)']]); g.fillRect(0, LYR.y - 150, W, 300); }
  for (let k = 1; k < LY.length; k++) {
    const sp = LSPAN[k];
    if (t < sp.a - .01 || t > sp.b + .35) continue;
    const inU = E.out(seg(t, sp.a, sp.a + .35)), outU = E.in2(seg(t, sp.b, sp.b + .35));
    const a = inU * (1 - outU); if (a <= 0) continue;
    const dy = (1 - inU) * 22 - outU * 34;
    drawLine(g, LY[k], t, LYR.x, LYR.y + dy, a, warm);
  }
}
function drawLine(g, L, t, cx, cy, a, warm) {
  const n = L.chars.length, size = Math.min(64, LYR.max / n), adv = size * 1.06;
  const x0 = cx - adv * n / 2 + adv / 2;
  const glowC = warm ? '#FFD49A' : '#A9D6FF';
  g.save();
  g.font = `600 ${size}px ${FONT.serif}`; g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = 0; i < n; i++) {
    const [c, t0, t1] = L.chars[i], k = seg(t, t0 - .05, t0 + .12), lift = Math.sin(seg(t, t0 - .05, t0 + .3) * PI) * 6;
    const x = x0 + i * adv, y = cy - lift;
    // 底：暗一点的字 + 阴影，保证亮背景上也看得清
    g.globalAlpha = a; g.shadowColor = 'rgba(0,0,0,.55)'; g.shadowBlur = 14; g.fillStyle = `rgba(255,255,255,${.42 + .58 * k})`;
    g.fillText(c, x, y);
    if (k > 0) { g.shadowColor = glowC; g.shadowBlur = 22 * k; g.globalAlpha = a * k; g.fillStyle = '#FFFDF6'; g.fillText(c, x, y); }
  }
  g.restore();
}

/* ---------------- 叠在最上面的东西 ---------------- */
let STAMP_TEXT = "'09 7 17";
function dateStamp(g, t, a, s) {
  if (a <= 0) return;
  segDigits(g, s || STAMP_TEXT, 700, 1500, 30, '#FF9A3C', a * .9);
}
function watermark(g) { text(g, '甜菜', W - 40, 52, 30, 'rgba(255,255,255,.62)', { align: 'right', weight: 600, shadow: 'rgba(0,0,0,.5)', blur: 8 }); }

/* ---------------- 一帧 ---------------- */
function shotAt(t) { let k = 0; while (k + 1 < SHOTS.length && SHOTS[k + 1].t <= t) k++; return k; }
function drawShot(s, t) { const g = layer('shot' + (s.i % 2)); s.fn(g, t, s); return LAYER['shot' + (s.i % 2)]; }
function post(g, src, t, lk) {
  const L = LOOKS[lk] || {};
  if (L.desat) { g.save(); g.globalCompositeOperation = 'saturation'; g.globalAlpha = L.desat; g.fillStyle = '#808080'; g.fillRect(0, 0, W, H); g.restore(); }
  if (L.warm) tint(g, '#FFB070', L.warm);
  if (L.cool) tint(g, '#5080C0', L.cool);
  if (L.leak) leak(g, t, L.leak);
  if (L.bloom) bloom(g, src, L.bloom);
  if (L.vig) vignette(g, L.vig);
  if (L.grain) grain(g, L.grain);
}
window.frame = function (t) {
  const k = shotAt(t), s = SHOTS[k], g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  const inTr = s.tr && s.tr !== 'cut' && t < s.t + (s.d || .4) && k > 0;
  const B = drawShot(s, t);
  const out = layer('frame');
  if (inTr) {
    const A = drawShot(SHOTS[k - 1], t);
    TRANS[s.tr](out, A, B, seg(t, s.t, s.t + (s.d || .4)));
  } else out.drawImage(B, 0, 0);
  g.drawImage(LAYER.frame, 0, 0);
  const lk = inTr && t < s.t + (s.d || .4) / 2 ? SHOTS[k - 1].look : s.look;
  post(g, LAYER.frame, t, lk);
  if (s.over) s.over(g, t, s);
  // 日期戳：回忆的镜头里亮着
  const st = s.stamp ? (inTr && !SHOTS[k - 1].stamp ? seg(t, s.t, s.t + (s.d || .4)) : 1) : (inTr && SHOTS[k - 1].stamp ? 1 - seg(t, s.t, s.t + (s.d || .4)) : 0);
  if (!window.COVER) {
    dateStamp(g, t, st);
    if (window.REWIND_STAMP) { dateStamp(g, t, 1, window.REWIND_STAMP); window.REWIND_STAMP = null; }
    lyrics(g, t, !!(LOOKS[lk] && LOOKS[lk].warm > .15));
  }
  titleCard(g, t);
  // 开头几秒：小字告诉刷到的人这是哪首歌
  const tag = env(t, .15, .7, 2.9, 3.3);
  if (tag > 0 && !window.COVER) text(g, '刘若英 ·《后来》', 490, 300, 42, '#F6F0E4', { alpha: tag, weight: 500, ls: 6, shadow: 'rgba(0,0,0,.7)', blur: 14 });
  watermark(g);
  endCredits(g, t);
};

fontsReady(LY.map(l => l.text).join('') + '后来刘若英甜菜出品演唱作词作曲施人诚玉城千春画面由用代码生成：·《》爱你').then(() => { window.READY = true; });
