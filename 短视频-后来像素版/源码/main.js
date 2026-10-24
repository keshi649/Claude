'use strict';
/* main.js —— 镜头表、转场、歌词、1P/2P 状态栏、开头小字、水印、片尾字、封面；逐帧入口 frame(t)。
   镜头表 SHOTS：每个镜头 { t 开始（秒）, fn 画面函数名, tr 进入时的转场, d 转场时长, look 后期, hud 回忆里的状态栏 }。
   一个镜头画到下一个镜头开始；有转场时，上一个镜头接着往后画 d 秒，两个一起混。
   换镜头落在小节线（bar(k)）或这句歌词开口前 0.15~0.3 秒。 */

/* 后期：vig 暗角；tint 整体叠一层颜色（[颜色, 强度]，soft-light 那样柔和地染） */
const LOOKS = {
  space: { vig: .35 },
  night: { vig: .45, tint: ['#3050A0', .10] },
  room: { vig: .5, tint: ['#2A3870', .08] },
  screen: { vig: .4 },
  mem: { vig: .25, tint: ['#FFB060', .06] },
  memNight: { vig: .4 },
  gray: { vig: .4, tint: ['#506080', .12] },
  dusk: { vig: .35, tint: ['#FF8040', .08] },
  summer: { vig: .4, tint: ['#203060', .06] },
  dream: { vig: .3 },
  dawn: { vig: .3, tint: ['#FFA060', .06] },
};

/* 回忆里的状态栏：每个镜头返回 {p2, heart, broken, flash} */
const HUD = {
  wait: () => ({ p2: 'wait', heart: 0 }),
  join: t => ({ p2: t < 51.9 ? 'wait' : 'on', heart: t < 51.9 ? 0 : .2, flash: 51.9 }),
  on2: () => ({ p2: 'on', heart: .35 }),
  on3: t => ({ p2: 'on', heart: lerp(.35, .55, seg(t, 59, 63)) }),
  on4: () => ({ p2: 'on', heart: .6 }),
  kiss: t => ({ p2: 'on', heart: lerp(.6, 1, E.out(seg(t, ch(13, 4), ch(13, 4) + .8))), flash: ch(13, 4) }),
  full: () => ({ p2: 'on', heart: 1 }),
  drain: t => ({ p2: 'on', heart: lerp(1, .35, seg(t, 102.4, 105.4)) }),
  snap: t => ({ p2: t < 107.55 ? 'on' : 'off', heart: lerp(.35, .2, seg(t, 105.4, 107.5)), flash: 107.55 }),
  broken: t => ({ p2: 'off', heart: .2, broken: E.out(seg(t, ch(20, 8), ch(20, 8) + .9)) }),
  off: () => ({ p2: 'off', heart: 0, broken: 1 }),
};

const SHOTS = [
  // ---------- 前奏：曲速星空 → 坠向城市里的一扇窗 → 掌机开机 → 钻进屏幕 → 2P 碎成像素拼出片名 ----------
  { t: 0, fn: 'shWarp', look: 'space' },
  { t: bar(1), fn: 'shFall', look: 'night' },
  { t: bar(2), fn: 'shPowerOn', look: 'room', tr: 'flash', d: .35 },
  { t: bar(3), fn: 'shTitleScreen', look: 'memNight' },
  // ---------- 开头副歌：现在，她一个人 ----------
  { t: 14.10, fn: 'shRoomHold', look: 'room', tr: 'pixelate', d: .5 },
  { t: 18.90, fn: 'shScreenWalkAway', look: 'screen', tr: 'cut' },
  { t: 21.70, fn: 'shWindowCrowd', look: 'night', tr: 'dissolve', d: .4 },
  { t: 24.80, fn: 'shFaceGlow', look: 'room', tr: 'cut' },
  { t: 26.85, fn: 'shTearScreen', look: 'screen', tr: 'cut' },
  { t: 31.65, fn: 'shContinue', look: 'screen', tr: 'dissolve', d: .4 },
  // ---------- 主歌：游戏里的十七岁夏天 ----------
  { t: 38.56, fn: 'shGardeniaClose', look: 'mem', tr: 'load', d: .7 },
  { t: 42.70, fn: 'shBenchWide', look: 'mem', tr: 'iris', d: .6, hud: 'wait' },
  { t: 45.70, fn: 'shSkirt', look: 'mem', tr: 'dissolve', d: .35, hud: 'wait' },
  { t: 51.30, fn: 'shWhisper', look: 'mem', tr: 'cut', hud: 'join' },
  { t: 58.40, fn: 'shSmell', look: 'mem', tr: 'dissolve', d: .35, hud: 'on3' },
  { t: 64.80, fn: 'shDayNight', look: 'mem', tr: 'dissolve', d: .4, hud: 'on4' },
  { t: 68.85, fn: 'shHillNight', look: 'memNight', tr: 'dissolve', d: .4, hud: 'on4' },
  { t: 71.75, fn: 'shKiss', look: 'memNight', tr: 'cut', hud: 'kiss' },
  // ---------- 现在：往后的时光，每次叹气都变成一颗星 ----------
  { t: 77.30, fn: 'shRooftop', look: 'night', tr: 'dissolve', d: .6 },
  { t: 81.35, fn: 'shSigh', look: 'night', tr: 'cut' },
  { t: 84.40, fn: 'shStarsReturn', look: 'night', tr: 'dissolve', d: .4 },
  // ---------- 乐队进来：那时候的爱情 → 吵架 → 断开连接 ----------
  { t: 89.83, fn: 'shLinkPlay', look: 'mem', tr: 'flash', d: .45, hud: 'full' },
  { t: 96.95, fn: 'shPopsicle', look: 'mem', tr: 'iris', d: .5, hud: 'full' },
  { t: 102.20, fn: 'shArgue', look: 'gray', tr: 'glitch', d: .35, hud: 'drain' },
  { t: 105.40, fn: 'shCableSnap', look: 'gray', tr: 'cut', hud: 'snap' },
  { t: 109.80, fn: 'shRainFlower', look: 'gray', tr: 'dissolve', d: .4, hud: 'broken' },
  // ---------- 现在：两个人都在"搜索"对方 ----------
  { t: 115.75, fn: 'shSearchHer', look: 'room', tr: 'pixelate', d: .5 },
  { t: 120.15, fn: 'shSearchHim', look: 'room', tr: 'cut' },
  { t: 123.00, fn: 'shMapSignals', look: 'night', tr: 'dissolve', d: .4 },
  // ---------- 如果当时：路口的选项 → 各走各的 → 他那边 ----------
  { t: 128.27, fn: 'shForkChoice', look: 'dusk', tr: 'load', d: .6, hud: 'off' },
  { t: 135.70, fn: 'shWalkApart', look: 'dusk', tr: 'cut', hud: 'off' },
  { t: 140.65, fn: 'shHimRemember', look: 'room', tr: 'dissolve', d: .5 },
  { t: 146.85, fn: 'shHimPopsicle', look: 'night', tr: 'dissolve', d: .4 },
  // ---------- 副歌：夏天的夜，她学会了把另一半分出去 ----------
  { t: 153.05, fn: 'shStreetSummer', look: 'summer', tr: 'pixelate', d: .45 },
  { t: 155.05, fn: 'shGiveHalf', look: 'summer', tr: 'cut' },
  { t: 159.85, fn: 'shFireworksFar', look: 'summer', tr: 'dissolve', d: .35 },
  { t: 162.65, fn: 'shFestivalCrowd', look: 'summer', tr: 'cut' },
  { t: 165.85, fn: 'shFaceFireworks', look: 'summer', tr: 'cut' },
  { t: 167.85, fn: 'shBokehMemories', look: 'summer', tr: 'dissolve', d: .35 },
  { t: 172.65, fn: 'shLastFirework', look: 'summer', tr: 'dissolve', d: .4 },
  // ---------- 间奏：钻进游戏，一路往上爬 ----------
  { t: 179.54, fn: 'shClimb', look: 'dream', tr: 'load', d: .6 },
  // ---------- 存档点：十七岁的他的影子 ----------
  { t: 204.70, fn: 'shGhost', look: 'memNight', tr: 'flash', d: .4 },
  { t: 210.95, fn: 'shSitGhost', look: 'memNight', tr: 'dissolve', d: .4 },
  // ---------- 副歌：想改写存档 ----------
  { t: 217.20, fn: 'shLoadSave', look: 'screen', tr: 'pixelate', d: .4 },
  { t: 219.15, fn: 'shTurnBack', look: 'dusk', tr: 'load', d: .5, hud: 'off' },
  { t: 223.90, fn: 'shRunStretch', look: 'dusk', tr: 'cut' },
  { t: 226.70, fn: 'shGlitchCrowd', look: 'dusk', tr: 'glitch', d: .3 },
  { t: 229.95, fn: 'shError', look: 'dusk', tr: 'cut' },
  { t: 231.90, fn: 'shBreakTears', look: 'dusk', tr: 'glitch', d: .3 },
  { t: 236.70, fn: 'shCollapse', look: 'space', tr: 'cut' },
  // ---------- 副歌：天亮了，回到母校 ----------
  { t: 242.75, fn: 'shSunrise', look: 'dawn', tr: 'cut' },
  { t: 244.75, fn: 'shSchoolDawn', look: 'dawn', tr: 'dissolve', d: .4 },
  { t: 249.55, fn: 'shOldBench', look: 'dawn', tr: 'dissolve', d: .35 },
  { t: 252.35, fn: 'shNewGeneration', look: 'dawn', tr: 'cut' },
  { t: 255.55, fn: 'shSmileTear', look: 'dawn', tr: 'cut' },
  { t: 257.55, fn: 'shTearSun', look: 'dawn', tr: 'dissolve', d: .35 },
  { t: 262.40, fn: 'shLeaveIt', look: 'dawn', tr: 'dissolve', d: .4 },
  // ---------- 永远不会再重来：没电了；有一个男孩爱着那个女孩 ----------
  { t: 269.20, fn: 'shBatteryDie', look: 'screen', tr: 'dissolve', d: .5 },
  { t: 275.20, fn: 'shBoyLoves', look: 'memNight', tr: 'dissolve', d: .6, hud: 'full' },
  // ---------- 尾奏 ----------
  { t: 282.07, fn: 'shRiseSky', look: 'memNight', tr: 'cut' },
  { t: 291.68, fn: 'shWalkOn', look: 'dawn', tr: 'dissolve', d: .8 },
  { t: 301.29, fn: 'shEnd', look: 'space', tr: 'fade', d: 1.0 },
];
SHOTS.forEach((s, i) => { s.i = i; s.e = i + 1 < SHOTS.length ? SHOTS[i + 1].t : DUR; });

/* 还没画的镜头先用占位画面 */
function todoShot(s) {
  return (g, t) => {
    g.fillStyle = s.i % 2 ? '#24304F' : '#3A2A4F'; g.fillRect(0, 0, W, H);
    ptext(g, s.fn, 960, 420, 4, '#FFFFFF', { align: 'center' });
    ptext(g, `${s.t.toFixed(2)}–${s.e.toFixed(2)}`, 960, 500, 3, '#C8D0E8', { align: 'center' });
  };
}
function shotFn(s) { const f = window[s.fn]; return typeof f === 'function' ? f : todoShot(s); }

/* ---------------- 转场（A 上一个镜头，B 这一个，u 0~1） ---------------- */
let DMASK = null;
function ditherMask(level) {                     // 8 位游戏那样的抖动溶解：每 12 像素一格，按 Bayer 阈值一格格换
  const cw = W / 12, chh = H / 12, q = layer('dmask', cw, chh);
  q.fillStyle = '#FFFFFF';
  for (let y = 0; y < chh; y++) for (let x = 0; x < cw; x++) if (BAYER[(y & 3) * 4 + (x & 3)] < level) q.fillRect(x, y, 1, 1);
  return LAYER.dmask;
}
const TRANS = {
  cut: (g, A, B) => g.drawImage(B, 0, 0),
  fade: (g, A, B, u) => { g.drawImage(A, 0, 0); g.globalAlpha = E.sine(u); g.drawImage(B, 0, 0); g.globalAlpha = 1; },
  flash: (g, A, B, u) => {
    if (u < .3) { g.drawImage(A, 0, 0); g.fillStyle = `rgba(255,252,240,${E.in2(u / .3)})`; }
    else { g.drawImage(B, 0, 0); g.fillStyle = `rgba(255,252,240,${1 - E.out(seg(u, .3, 1))})`; }
    g.fillRect(0, 0, W, H);
  },
  black: (g, A, B, u) => { g.drawImage(u < .5 ? A : B, 0, 0); g.fillStyle = `rgba(0,0,0,${1 - Math.abs(u * 2 - 1)})`; g.fillRect(0, 0, W, H); },
  dissolve: (g, A, B, u) => {
    g.drawImage(A, 0, 0);
    const lv = Math.floor(u * 17); if (lv <= 0) return;
    const q = layer('dissB'); q.drawImage(B, 0, 0); q.globalCompositeOperation = 'destination-in'; q.imageSmoothingEnabled = false;
    q.drawImage(ditherMask(lv), 0, 0, W, H);
    g.drawImage(LAYER.dissB, 0, 0);
  },
  pixelate: (g, A, B, u) => {                    // 先碎成越来越大的马赛克，再从大马赛克里清楚回来
    const blk = ri(Math.pow(2, 1 + 5 * (1 - Math.abs(u * 2 - 1))));
    mosaic(g, u < .5 ? A : B, Math.max(2, blk));
  },
  iris: (g, A, B, u) => {                        // 老游戏的圆形开合：黑圈收到中心，再从中心张开
    const src = u < .5 ? A : B, k = u < .5 ? 1 - E.in2(u * 2) : E.out((u - .5) * 2), r = k * 1150;
    g.fillStyle = '#05060F'; g.fillRect(0, 0, W, H);
    if (r > 2) { g.save(); g.beginPath(); for (let y = -r; y <= r; y += 12) { const hw = Math.floor(Math.sqrt(Math.max(0, r * r - y * y)) / 12) * 12; g.rect(ri(960 - hw), ri(500 + y), hw * 2, 12); } g.clip(); g.drawImage(src, 0, 0); g.restore(); }
  },
  glitch: (g, A, B, u) => { glitch(g, u < .5 ? A : B, Math.sin(u * PI), 900 + Math.floor(u * 10)); },
  load: (g, A, B, u) => {                        // 地图一行行读出来：B 按 48 像素的格子从上往下铺满，每行从左往右
    g.drawImage(A, 0, 0);
    g.fillStyle = '#05060F'; g.fillRect(0, 0, W, H * clamp(u * 3));
    const rows = H / 48, cols = W / 48, n = Math.floor(clamp((u - .15) / .85) * rows * cols);
    for (let k = 0; k < n; k++) { const r = Math.floor(k / cols), c = k % cols; g.drawImage(B, c * 48, r * 48, 48, 48, c * 48, r * 48, 48, 48); }
  },
};

/* ---------------- 歌词：底部居中，像素字 5 倍（60px）；整句先淡淡地出来，唱到哪个字哪个字亮起来、跳一下 ---------------- */
const LK = 5, LCX = 960, LTOP = 934;           // 最长一句 14 个字 840px：x 540~1380，在 y 934~994（下边 y>1026 是界面）
const LSPAN = LY.map((l, k) => {
  const first = l.chars[0][1], prevLast = k ? LY[k - 1].chars[LY[k - 1].chars.length - 1][1] : -9;
  return { a: Math.max(first - .35, prevLast + .25), end: l.chars[l.chars.length - 1][2] };
});
LSPAN.forEach((s, k) => { const nx = LSPAN[k + 1]; s.b = nx && nx.a - s.end < 3 ? nx.a : s.end + 1.0; });
function lyrLayout(k) {
  const L = LY[k]; if (L._lay) return L._lay;
  let x = 0; const xs = [];
  L.chars.forEach(c => { xs.push(x); x += textW12(c[0]); });
  return (L._lay = { xs, w: x });
}
function drawLyrics(g, t) {
  for (let k = 1; k < LY.length; k++) {
    const sp = LSPAN[k]; if (t < sp.a || t > sp.b + .2) continue;
    const fin = E.out(seg(t, sp.a, sp.a + .15)), fout = 1 - seg(t, sp.b, sp.b + .2);
    const A = Math.min(fin, fout); if (A <= 0) continue;
    const dy = ri((1 - fin) * 3) * LK - ri((1 - fout) * 3) * LK;
    const L = LY[k], lay = lyrLayout(k), x0 = ri((LCX - lay.w * LK / 2) / LK) * LK;
    L.chars.forEach((c, j) => {
      const u = t - (c[1] - .05);
      let col = '#FFFFFF', al = .45, jy = 0;
      if (u >= 0) { al = 1; if (u < .1) jy = -LK; col = u < .22 ? '#FFE27A' : '#FFFFFF'; }
      ptext(g, c[0], x0 + lay.xs[j] * LK, LTOP + dy + jy, LK, col, { ol: '#0B0D1E', shadow: '#0B0D1E', alpha: A * al });
    });
  }
}

/* ---------------- 叠在最上面的东西 ---------------- */
function watermark(g) { ptext(g, '甜菜', 1876, 42, 3, '#FFFFFF', { align: 'right', alpha: .78, ol: '#0A0C1C' }); }
function openingTag(g, t) {
  const a = env(t, .15, .5, 2.9, 3.25); if (a <= 0) return;
  ptext(g, '刘若英《后来》', 960, 96, 3, '#F6F0E4', { align: 'center', alpha: a, ol: '#0A0C1C' });
}
const CREDITS = [
  { s: '演唱 刘若英', y: 560, k: 3, t: 303.6 },
  { s: '作词 施人诚　作曲 玉城千春', y: 616, k: 3, t: 304.4 },
  { s: '甜菜 出品', y: 712, k: 4, t: 305.6, col: '#FFE27A' },
  { s: '画面：Claude 用代码生成', y: 796, k: 3, t: 306.6 },
];
function endCredits(g, t) {
  if (t < 303) return;
  const fade = 1 - seg(t, 313.6, 315.2);
  CREDITS.forEach(c => {
    const a = E.out(seg(t, c.t, c.t + .6)) * fade; if (a <= 0) return;
    ptext(g, c.s, 960, c.y + ri((1 - a) * 4) * c.k, c.k, c.col || '#F4F1E8', { align: 'center', alpha: a, ol: '#05060F' });
  });
}
function postLook(g, lk) {
  const L = LOOKS[lk] || {};
  if (L.tint) { g.save(); g.globalCompositeOperation = 'soft-light'; g.globalAlpha = L.tint[1] * 2; g.fillStyle = L.tint[0]; g.fillRect(0, 0, W, H); g.restore(); }
  vignette(g, L.vig || 0);
}

/* ---------------- 一帧 ---------------- */
function shotAt(t) { let k = 0; while (k + 1 < SHOTS.length && SHOTS[k + 1].t <= t) k++; return k; }
function drawShot(s, t, slot) { const g = layer('shot' + slot); g.fillStyle = '#000'; g.fillRect(0, 0, W, H); shotFn(s)(g, t, s); return LAYER['shot' + slot]; }
window.frame = function (t) {
  const k = shotAt(t), s = SHOTS[k], g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.imageSmoothingEnabled = false;
  const d = s.d || .4, inTr = k > 0 && s.tr && s.tr !== 'cut' && t < s.t + d;
  const B = drawShot(s, t, 'B');
  const out = layer('frame');
  if (inTr) { const A = drawShot(SHOTS[k - 1], t, 'A'); TRANS[s.tr](out, A, B, seg(t, s.t, s.t + d)); }
  else out.drawImage(B, 0, 0);
  g.drawImage(LAYER.frame, 0, 0);
  const lk = inTr && t < s.t + d / 2 ? SHOTS[k - 1].look : s.look;
  postLook(g, lk);
  // 回忆里的 1P / 2P 状态栏：跟着镜头淡进淡出
  const prev = k > 0 ? SHOTS[k - 1] : null;
  let hs = s.hud, ha = 1;
  if (inTr && prev && !!prev.hud !== !!s.hud) { const u = seg(t, s.t, s.t + d); if (s.hud) ha = u; else { hs = prev.hud; ha = 1 - u; } }
  if (hs && !window.COVER) uiHud(g, t, HUD[hs](t), ha);
  if (!window.COVER) { drawLyrics(g, t); openingTag(g, t); endCredits(g, t); }
  if (window.COVER) coverTitle(g);
  watermark(g);
};

/* 封面：大字片名放在横向的中间（抖音主页的格子把横屏封面按中间裁成 3:4，放在左边会被裁掉） */
function coverTitle(g) {                       // 封面用吻的那一刻（75.2 秒）：片名在上面的夜空里，"刘若英"紧挨着片名，不压那颗心
  ptext(g, '后来', 960, 40, 16, '#FFF6E6', { align: 'center', ol: '#140A20', shadow: '#140A20' });
  ptext(g, '刘若英', 960, 252, 4, '#F2E6FF', { align: 'center', ol: '#140A20' });
}

fontsReady(LY.map(l => l.text).join('') + '后来刘若英甜菜出品演唱作词作曲施人诚玉城千春画面用代码生成：·《》1P2P等待加入已断开连接搜索中继续存档读取获得栀子花无法改写是否回头走开▶▼♥…×').then(() => { window.READY = true; });
