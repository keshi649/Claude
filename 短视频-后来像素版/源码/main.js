'use strict';
/* main.js —— 镜头表、转场、后期、歌词、水印、片尾字；逐帧入口 frame(t)。
   镜头表 SHOTS：{ t 开始（秒）, fn 画面函数名, tr 进入的转场, d 转场时长, look 调色, ca 色差, pulse 跟拍子闪 }
   画面函数 fn(g, t, u, s)：t 全片时刻，u 镜头里的时刻（t − s.t），s 镜头本身（s.e 结束时刻）。
   有转场时上一个镜头接着往后画 d 秒，两个一起混。 */
const SHOTS = [
  // ---------- 前奏：十三个闪回（以后都会出现的画面）一拍一个 → 碎片卷成漩涡 → 拼出片名 ----------
  { t: 0, fn: 'gMeteor', look: 'starry' },
  { t: 1.71, fn: 'gCity', tr: 'glitch', d: .25, look: 'neon' },
  { t: 2.52, fn: 'gSkirt', tr: 'white', d: .3, look: 'summer' },
  { t: 3.32, fn: 'gUmbrellas', tr: 'push', d: .3, look: 'neon' },
  { t: 4.12, fn: 'gPhoto', tr: 'burn', d: .4, look: 'room' },
  { t: 4.92, fn: 'gBike', tr: 'wipe', d: .35, look: 'sunset' },
  { t: 5.72, fn: 'gFireworks', tr: 'pixel', d: .3, look: 'festival' },
  { t: 6.52, fn: 'gTrain', tr: 'glitch', d: .25, look: 'night' },
  { t: 7.33, fn: 'gStorm', tr: 'white', d: .2, look: 'storm' },
  { t: 7.73, fn: 'gHisWindow', tr: 'cut', look: 'night' },
  { t: 8.13, fn: 'gPlane', tr: 'cut', look: 'dawn' },
  { t: 8.53, fn: 'gPhone', tr: 'cut', look: 'room' },
  { t: 8.93, fn: 'gKiss', tr: 'white', d: .3, look: 'moon' },
  { t: 9.73, fn: 'shVortex', tr: 'shatter', d: .6, look: 'space' },
  { t: 12.10, fn: 'shTitle', tr: 'white', d: .3, look: 'space' },
  // ---------- 副歌一：现在，雨夜的城市 ----------
  { t: 14.10, fn: 'shCityCrane', tr: 'ripple', d: .55, look: 'neon' },
  { t: 16.90, fn: 'shCrosswalk', tr: 'cut', look: 'neon' },
  { t: 19.00, fn: 'shHimAcross', tr: 'cut', look: 'neon' },
  { t: 21.80, fn: 'shUmbrellaSea', tr: 'wipe', d: .4, look: 'neon' },
  { t: 24.90, fn: 'shHerRainClose', tr: 'cut', look: 'neon' },
  { t: 27.00, fn: 'shTrainRide', tr: 'dissolve', d: .4, look: 'night' },
  { t: 31.70, fn: 'shRoomNight', tr: 'dissolve', d: .45, look: 'room' },
  { t: 35.36, fn: 'shPhotoInsert', tr: 'cut', look: 'room' },
  // ---------- 主歌一：十七岁的夏天 ----------
  { t: 38.56, fn: 'shGardeniaMacro', tr: 'white', d: .7, look: 'summer' },
  { t: 42.70, fn: 'shCampusWide', tr: 'dissolve', d: .4, look: 'summer' },
  { t: 45.70, fn: 'shBenchRead', tr: 'cut', look: 'summer' },
  { t: 48.17, fn: 'shSkirtPetals', tr: 'dissolve', d: .35, look: 'summer' },
  { t: 51.30, fn: 'shWhisper', tr: 'cut', look: 'summer' },
  { t: 54.58, fn: 'shFlowerOnHead', tr: 'cut', look: 'summer' },
  { t: 58.40, fn: 'shSmell', tr: 'dissolve', d: .4, look: 'dream' },
  { t: 61.70, fn: 'shSmellWide', tr: 'dissolve', d: .4, look: 'sunset' },
  { t: 64.60, fn: 'shTimelapse', tr: 'dissolve', d: .4, look: 'sunset' },
  { t: 68.85, fn: 'shHillStars', tr: 'dissolve', d: .4, look: 'starry' },
  { t: 71.75, fn: 'shKissMoon', tr: 'cut', look: 'moon' },
  // ---------- 现在：每次叹气，都想起那天的星光 ----------
  { t: 77.30, fn: 'shRooftopNow', tr: 'dissolve', d: .6, look: 'night' },
  { t: 81.40, fn: 'shSighClose', tr: 'cut', look: 'night' },
  { t: 84.40, fn: 'shStarsReturn', tr: 'dissolve', d: .4, look: 'starry' },
  // ---------- 主歌二：那时候的爱情 → 吵架 → 两地的深夜 ----------
  { t: 89.83, fn: 'shBikeSea', tr: 'white', d: .45, look: 'sunset', pulse: 1 },
  { t: 93.03, fn: 'shMontage', tr: 'cut', look: 'summer', pulse: 1 },
  { t: 96.95, fn: 'shUmbrellaWalk', tr: 'iris', d: .5, look: 'summer' },
  { t: 102.40, fn: 'shStormGather', tr: 'glitch', d: .3, look: 'storm' },
  { t: 105.85, fn: 'shUmbrellaFly', tr: 'cut', look: 'storm' },
  { t: 109.05, fn: 'shPhotoTear', tr: 'cut', look: 'storm' },
  { t: 109.97, fn: 'shRunAway', tr: 'cut', look: 'storm' },
  { t: 115.46, fn: 'shSplitNight', tr: 'dissolve', d: .45, look: 'night' },
  { t: 120.33, fn: 'shHisHalf', tr: 'cut', look: 'room' },
  { t: 123.07, fn: 'shTwoWindows', tr: 'cut', look: 'night' },
  // ---------- 如果当时：倒带 → 回头 → 碎掉 ----------
  { t: 128.27, fn: 'shRewind', tr: 'rewind', d: .5, look: 'storm', ca: 1 },
  { t: 131.48, fn: 'shAltTurnBack', tr: 'white', d: .35, look: 'dream' },
  { t: 135.86, fn: 'shShatterAlone', tr: 'cut', look: 'shatter' },
  // ---------- 他：你都如何回忆我 ----------
  { t: 141.09, fn: 'shStore', tr: 'dissolve', d: .4, look: 'store' },
  { t: 144.29, fn: 'shStoreReflect', tr: 'cut', look: 'store' },
  { t: 147.50, fn: 'shWalkHome', tr: 'dissolve', d: .4, look: 'night' },
  // ---------- 副歌二：夏日祭，人海 ----------
  { t: 153.22, fn: 'shFestival', tr: 'white', d: .35, look: 'festival', pulse: 1 },
  { t: 157.11, fn: 'shGiveKid', tr: 'cut', look: 'festival' },
  { t: 160.32, fn: 'shFoxMask', tr: 'cut', look: 'festival' },
  { t: 163.52, fn: 'shFestivalTop', tr: 'cut', look: 'festival' },
  { t: 166.72, fn: 'shBridgeFireworks', tr: 'cut', look: 'festival' },
  { t: 169.93, fn: 'shFireworksWide', tr: 'cut', look: 'festival', pulse: 1 },
  { t: 173.13, fn: 'shGardeniaFirework', tr: 'dissolve', d: .35, look: 'festival' },
  // ---------- 间奏：记忆列车 → 一年又一年 ----------
  { t: 179.54, fn: 'shMemoryTrain', tr: 'white', d: .5, look: 'space' },
  { t: 185.95, fn: 'shSeasons', tr: 'dissolve', d: .5, look: 'summer' },
  // ---------- 她：想发的消息 ----------
  { t: 204.89, fn: 'shPhoneRoom', tr: 'dissolve', d: .45, look: 'room' },
  { t: 208.38, fn: 'shPhoneScreen', tr: 'cut', look: 'room' },
  { t: 211.58, fn: 'shPlaneFold', tr: 'cut', look: 'room' },
  // ---------- 副歌三：追到站台 ----------
  { t: 217.36, fn: 'shBurstOut', tr: 'white', d: .3, look: 'neon', pulse: 1 },
  { t: 220.07, fn: 'shRunStreet', tr: 'cut', look: 'neon', pulse: 1 },
  { t: 224.40, fn: 'shPlatformDoors', tr: 'cut', look: 'station' },
  { t: 227.60, fn: 'shTrainLeaves', tr: 'cut', look: 'station' },
  { t: 230.80, fn: 'shTearEye', tr: 'cut', look: 'night' },
  { t: 232.87, fn: 'shTimeFreeze', tr: 'cut', look: 'dream' },
  { t: 236.88, fn: 'shGhostTrain', tr: 'dissolve', d: .4, look: 'dream' },
  // ---------- 副歌四：天亮，回到母校 ----------
  { t: 242.90, fn: 'shSunriseCity', tr: 'white', d: .5, look: 'dawn' },
  { t: 246.82, fn: 'shSchoolGate', tr: 'dissolve', d: .4, look: 'dawn' },
  { t: 250.03, fn: 'shNewCouple', tr: 'cut', look: 'dawn' },
  { t: 253.23, fn: 'shSheWatches', tr: 'cut', look: 'dawn' },
  { t: 256.44, fn: 'shLeaveClip', tr: 'cut', look: 'dawn' },
  { t: 259.64, fn: 'shSmileCry', tr: 'cut', look: 'dawn' },
  { t: 262.84, fn: 'shThrowPlane', tr: 'dissolve', d: .4, look: 'dawn' },
  // ---------- 永远不会再重来；有一个男孩爱着那个女孩 ----------
  { t: 269.25, fn: 'shPlaneFlight', tr: 'cut', look: 'dawn' },
  { t: 275.66, fn: 'shBoyLoves', tr: 'dissolve', d: .5, look: 'summer' },
  // ---------- 尾奏 ----------
  { t: 282.07, fn: 'shPhotoWhole', tr: 'white', d: .5, look: 'dawn' },
  { t: 286.88, fn: 'shMorningWindow', tr: 'dissolve', d: .5, look: 'dawn' },
  { t: 291.68, fn: 'shWalkOn', tr: 'white', d: .5, look: 'dawn' },
  { t: 301.29, fn: 'shEndCard', tr: 'fade', d: 1.0, look: 'starry' },
];
SHOTS.forEach((s, i) => { s.i = i; s.e = i + 1 < SHOTS.length ? SHOTS[i + 1].t : DUR; });

function todoShot(s) {
  return (g, t) => {
    R(g, 0, 0, W, H, s.i % 2 ? '#24304F' : '#3A2A4F');
    txt(g, s.fn, 240, 110, '#FFFFFF', { align: 'c' });
    tiny(g, `${s.t.toFixed(2)}-${s.e.toFixed(2)}`, 240, 135, '#C8D0E8', { align: 'c' });
  };
}
const shotFn = s => (typeof window[s.fn] === 'function' ? window[s.fn] : todoShot(s));

/* ---------------- 歌词：底部居中，像素字；整句先淡淡出来，唱到哪个字哪个字亮一下、跳一下 ---------------- */
const LTOP = 233;
const LSPAN = LY.map((l, k) => {
  const first = l.chars[0][1], prevLast = k ? LY[k - 1].chars[LY[k - 1].chars.length - 1][1] : -9;
  return { a: Math.max(first - .4, prevLast + .2), end: lineEnd(k) };
});
LSPAN.forEach((s, k) => { const nx = LSPAN[k + 1]; s.b = nx && nx.a - s.end < 3 ? nx.a : s.end + .9; });
function drawLyrics(g, t) {
  for (let k = 0; k < LY.length; k++) {
    const sp = LSPAN[k]; if (t < sp.a - .05 || t > sp.b + .25) continue;
    if (k === 0 && t < 14) continue;                      // 第一句"后来"由片名画
    const L = LY[k], n = L.chars.length, wsum = L.chars.reduce((m, c) => m + glyph(c[0]).w, 0);
    let x = ri(240 - wsum / 2);
    const fout = 1 - seg(t, sp.b, sp.b + .25);
    L.chars.forEach((c, j) => {
      const fin = E.out(seg(t, sp.a + j * .025, sp.a + j * .025 + .2)), A = Math.min(fin, fout);
      const gw = glyph(c[0]).w;
      if (A > 0) {
        const u = t - (c[1] - .04), sung = u >= 0;
        let col = '#C9D2F2', al = .78, dy = ri((1 - fin) * -3) + ri((1 - fout) * -2);
        if (sung) { al = 1; col = u < .28 ? '#FFE27A' : '#FFFFFF'; if (u < .09) dy -= 1; }
        if (sung && u < .5) glow(g, x + gw / 2, LTOP + 6, 9, '#FFC860', (1 - u / .5) * .45 * A, 3);
        txt(g, c[0], x, LTOP + dy, col, { ol: '#0B0A1E', sh: '#0B0A1E', a: A * al });
      }
      x += gw;
    });
  }
}

/* ---------------- 叠在最上面的 ---------------- */
function watermark(g) { txt(g, '甜菜', 455, 14, '#FFFFFF', { align: 'r', ol: '#0A0A1C', a: .8 }); }
function openingTag(g, t) {
  const a = env(t, .3, .7, 3.6, 4.1); if (a <= 0) return;
  txt(g, '刘若英《后来》', 26, 14, '#F6F0E4', { ol: '#0A0A1C', a });
}
const CREDITS = [
  { s: '演唱 刘若英', y: 128, t: 303.8 },
  { s: '作词 施人诚　作曲 玉城千春', y: 144, t: 304.6 },
  { s: '甜菜 出品', y: 166, t: 305.8, col: '#FFE27A' },
  { s: '画面：Claude 用代码生成', y: 188, t: 306.8 },
];
function endCredits(g, t) {
  if (t < 303.5) return;
  const fade = 1 - seg(t, 313.8, 315.3);
  CREDITS.forEach(c => { const a = E.out(seg(t, c.t, c.t + .6)) * fade; if (a > 0) txt(g, c.s, 240, c.y + ri((1 - a) * 3), c.col || '#F4F1E8', { align: 'c', ol: '#05040C', a }); });
}

/* ---------------- 一帧 ---------------- */
function shotAt(t) { let k = 0; while (k + 1 < SHOTS.length && SHOTS[k + 1].t <= t) k++; return k; }
function drawShot(s, t, slot) {
  const g = layer('shot' + slot); R(g, 0, 0, W, H, '#000');
  g.save(); shotFn(s)(g, t, t - s.t, s); g.restore();
  return LAYER['shot' + slot];
}
window.frame = function (t) {
  const k = shotAt(t), s = SHOTS[k], g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.imageSmoothingEnabled = false;
  const d = s.d || .4, inTr = k > 0 && s.tr && s.tr !== 'cut' && t < s.t + d;
  const B = drawShot(s, t, 'B');
  if (inTr) { const A = drawShot(SHOTS[k - 1], t, 'A'); TRANS[s.tr](g, A, B, seg(t, s.t, s.t + d)); }
  else g.drawImage(B, 0, 0);
  const cur = inTr && t < s.t + d / 2 ? SHOTS[k - 1] : s;
  const ex = {};
  if (cur.ca) ex.ca = cur.ca;
  if (cur.pulse) ex.exp = (LOOKS[cur.look] || LOOKS.flat).exp + .07 * beatHit(t, 7);
  if (window.FX_EXTRA) Object.assign(ex, window.FX_EXTRA); window.FX_EXTRA = null;
  post(g, LOOKS[cur.look] || LOOKS.flat, ex);
  if (!window.COVER) { drawLyrics(g, t); openingTag(g, t); endCredits(g, t); }
  if (window.COVER) window.COVER(g);
  watermark(g);
};

/* 封面：片名放在横向正中（抖音主页的格子按中间裁成 3:4，即 x 139~341） */
window.coverTitle = function (g) {
  const c1 = bigGlyph('后', 2), c2 = bigGlyph('来', 2);
  sglow(g, 240, 64, 150, '#0A0618', .55, 'source-over'); glow(g, 240, 64, 110, '#FF7AB0', .12, 8);
  [[c1, 142], [c2, 242]].forEach(([c, x]) => {
    [[-2, 0], [2, 0], [0, -2], [0, 2], [2, 2], [4, 4]].forEach(([dx, dy]) => g.drawImage(tint(c, '#140A24'), x + dx, 16 + dy, 96, 96));
    g.drawImage(tint(c, '#FFF6EC'), x, 16, 96, 96);
  });
  txt(g, '刘若英', 240, 122, '#FFE6F0', { align: 'c', sp: 4, ol: '#140A24' });
};
/* 调试：几个时刻拼一张图（每格 480×270 × k，左上角标时刻） */
window.sheet = function (ts, cols = 3, k = 1) {
  const rows = Math.ceil(ts.length / cols), S = mk(W * k * cols, H * k * rows), q = S.getContext('2d'); q.imageSmoothingEnabled = false;
  ts.forEach((t, i) => { window.frame(t); q.drawImage(cv, (i % cols) * W * k, fl(i / cols) * H * k, W * k, H * k); R(q, (i % cols) * W * k, fl(i / cols) * H * k, 40, 9, '#000'); tiny(q, t.toFixed(2), (i % cols) * W * k + 2, fl(i / cols) * H * k + 2, '#FFFF00'); });
  return S.toDataURL('image/png');
};

fontsReady(LY.map(l => l.text).join('') + '后来刘若英甜菜出品演唱作词作曲施人诚玉城千春画面用代码生成：·《》，。！？…—下一站仲夏今夜流星雨栀子花香水便利店拉面旅馆药房咖啡书店影院站已发车金鱼棉花糖烤鱿鱼风车你还好吗对方正在输入最近发送删除十七月日夏天冰棍再来一根早上好晚安时光小卖部网吧游戏厅冰室奶茶花店电影院照相馆糖水水果超市牛肉面麻辣烫火锅烧烤书报亭理发报刊公交出口入口禁止吸烟请勿倚靠车门站台往终点开往北南东西学校一中高三班栀子路').then(() => { window.READY = true; });
window.crop = function (t, x, y, w, h, k = 3) {
  window.frame(t); const S = mk(w * k, h * k), q = S.getContext('2d'); q.imageSmoothingEnabled = false;
  q.drawImage(cv, x, y, w, h, 0, 0, w * k, h * k); return S.toDataURL('image/png');
};
