'use strict';
/* main.js：镜头表、转场、整体后期（纸纹、暗角、重拍时的轻微推镜）。
   视频时间 T = 歌曲时间 s + PRE（开头留 3 秒给唱针落下）。 */
const PRE = 3.0;
const END_S = 224.4;                 // 歌曲时间：原曲 222.3 秒淡出，后面留一点给片尾
const DURATION = PRE + END_S;

const SCENES = [
  { id: 'intro', a: -PRE, ...S_INTRO },
  { id: 'title', a: bar(4), ...S_TITLE },
  { id: 'morning', a: bar(8), ...S_MORNING },
  { id: 'subway', a: bar(12), ...S_SUBWAY },
  { id: 'office', a: bar(20), ...S_OFFICE },
  { id: 'feed', a: bar(24), ...S_FEED },
  { id: 'calendar', a: bar(30), ...S_CALENDAR },
  { id: 'roof', a: bar(36), ...S_ROOF },
  { id: 'melt', a: bar(44), ...S_MELT },
  { id: 'boom', a: bar(51), ...S_BOOM },
  { id: 'bike', a: bar(57), ...S_BIKE },
  { id: 'train', a: bar(63), ...S_TRAIN },
  { id: 'planes', a: bar(69), ...S_PLANES },
  { id: 'seasons', a: bar(75), ...S_SEASONS },
  { id: 'party', a: bar(87), ...S_PARTY },
  { id: 'progress', a: bar(100), ...S_PROGRESS },
  { id: 'stairs', a: bar(112), ...S_STAIRS },
  { id: 'wish', a: bar(126), ...S_WISH },
  { id: 'outro', a: bar(140), ...S_OUTRO },
  { id: 'end', a: bar(152), ...S_END },
];
SCENES.forEach((sc, i) => { sc.b = i + 1 < SCENES.length ? SCENES[i + 1].a : END_S + 1; });
/* 转场：落在进入第 i 个场景的那一刻；dur 是总时长，以切点为中心 */
const TRANS = {
  title: { type: 'flash', dur: .5 },
  morning: { type: 'stripes', dur: .7 },
  subway: { type: 'push', dur: .5 },
  office: { type: 'whip', dur: .36 },
  feed: { type: 'iris', dur: .6 },
  calendar: { type: 'stripes', dur: .7 },
  roof: { type: 'iris', dur: .8 },
  melt: { type: 'dissolve', dur: 1.0 },
  boom: { type: 'flash', dur: .5 },
  bike: { type: 'wipe', dur: .6 },
  train: { type: 'push', dur: .5 },
  planes: { type: 'iris', dur: .6 },
  seasons: { type: 'wipe', dur: .6 },
  party: { type: 'stripes', dur: .7 },
  progress: { type: 'iris', dur: .8 },
  stairs: { type: 'dissolve', dur: .8 },
  wish: { type: 'dissolve', dur: 1.2 },
  outro: { type: 'flash', dur: .6 },
  end: { type: 'stripes', dur: .8 },
};

const bufA = mk(), bufB = mk(), gA = bufA.getContext('2d'), gB = bufB.getContext('2d');
const STRIPE_COLS = [C.red, C.mustard, C.teal, C.pink, C.navy, C.cream, C.rose, C.tealL];

function drawScene(sc, g, s) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  sc.draw(g, s);
  g.restore();
}
function sceneAt(s) { for (let i = SCENES.length - 1; i >= 0; i--) if (s >= SCENES[i].a) return i; return 0; }

function composite(g, s) {
  const i = sceneAt(s);
  // 是否处在某个转场窗口里
  for (const j of [i, i + 1]) {
    const sc = SCENES[j]; if (!sc) continue;
    const tr = TRANS[sc.id]; if (!tr) continue;
    const a = sc.a - tr.dur / 2, b = sc.a + tr.dur / 2;
    if (s >= a && s < b) { transition(g, s, tr.type, (s - a) / tr.dur, SCENES[j - 1], sc); return; }
  }
  drawScene(SCENES[i], g, s);
}

function transition(g, s, type, u, A, B) {
  if (type === 'flash') {
    drawScene(u < .5 ? A : B, g, s);
    g.fillStyle = `rgba(255,250,240,${u < .5 ? E.in(u * 2) : 1 - E.out((u - .5) * 2)})`; g.fillRect(0, 0, W, H);
    return;
  }
  if (type === 'dissolve') {
    drawScene(A, gA, s); drawScene(B, gB, s);
    g.drawImage(bufA, 0, 0); g.globalAlpha = E.io(u); g.drawImage(bufB, 0, 0); g.globalAlpha = 1;
    return;
  }
  if (type === 'stripes') {
    drawScene(u < .5 ? A : B, g, s);
    const n = 8, bh = H / n;
    for (let k = 0; k < n; k++) {
      const d = k * .05;
      g.fillStyle = STRIPE_COLS[k % STRIPE_COLS.length];
      if (u < .5) { const w = W * E.io(clamp((u * 2 - d) / (1 - .35))); g.fillRect(0, k * bh, w, bh + 1); }
      else { const x = W * E.io(clamp(((u - .5) * 2 - d) / (1 - .35))); g.fillRect(x, k * bh, W - x, bh + 1); }
    }
    return;
  }
  if (type === 'iris') {
    const cx = W / 2, cy = H / 2 - 40, rmax = 1150;
    drawScene(u < .5 ? A : B, g, s);
    const r = u < .5 ? rmax * (1 - E.in(u * 2)) : rmax * E.out((u - .5) * 2);
    g.save(); g.beginPath(); g.rect(0, 0, W, H); g.arc(cx, cy, Math.max(r, 0), 0, TAU, true); g.fillStyle = INK; g.fill('evenodd');
    g.restore();
    return;
  }
  if (type === 'push' || type === 'whip') {
    drawScene(A, gA, s); drawScene(B, gB, s);
    const e = type === 'whip' ? E.io(u) : E.io(u);
    const x = -W * e;
    if (type === 'whip') {
      const blur = Math.sin(Math.PI * u);
      for (let k = 0; k < 6; k++) { g.globalAlpha = k ? .22 : 1; const o = k * 40 * blur; g.drawImage(bufA, x - o, 0); g.drawImage(bufB, x + W - o, 0); }
      g.globalAlpha = 1;
    } else { g.drawImage(bufA, x, 0); g.drawImage(bufB, x + W, 0); }
    return;
  }
  if (type === 'wipe') {
    drawScene(A, gA, s); drawScene(B, gB, s);
    g.drawImage(bufA, 0, 0);
    const x = (W + 200) * E.io(u) - 100;
    g.save(); g.beginPath(); g.rect(0, 0, x, H); g.clip(); g.drawImage(bufB, 0, 0); g.restore();
    g.fillStyle = C.red; g.fillRect(x - 40, 0, 80, H); g.fillStyle = C.cream; g.fillRect(x + 40, 0, 14, H);
    return;
  }
  drawScene(u < .5 ? A : B, g, s);
}

/* 全乐队段落里，每个小节强拍轻轻推一下镜头 */
const LOUD = [[bar(51), bar(126)], [bar(140), bar(152)]];
const main = mk(), gM = main.getContext('2d');
function frame(T) {
  const s = T - PRE;
  composite(gM, s);
  const g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
  const loud = LOUD.some(([a, b]) => s >= a && s < b);
  const z = loud ? 1 + .014 * pulse(s, 6, 4) : 1;
  if (z !== 1) { g.fillStyle = '#000'; g.fillRect(0, 0, W, H); g.drawImage(main, W / 2 * (1 - z), H / 2 * (1 - z), W * z, H * z); }
  else g.drawImage(main, 0, 0);
  // 纸纹 + 暗角
  g.globalCompositeOperation = 'overlay'; g.globalAlpha = .55; g.drawImage(TEX.grain, 0, 0, W, H);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  g.drawImage(TEX.vig, 0, 0);
  // 水印
  if (s > 0 && s < bar(152)) text(g, '知洲', 1838, 1046, 26, { k: 'brush', col: 'rgba(255,250,240,.55)', shadow: 'rgba(0,0,0,.25)', sx: 1.5, sy: 1.5 });
  // 片尾淡出
  const fo = seg(s, END_S - 1.2, END_S);
  if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}
window.frame = frame;
window.READY = false;
Promise.all([['MaShan', '才二十三'], ['KuaiLe', '叮铃'], ['QingKe', '才二'], ['NotoSansB', '测试Ab'], ['NotoSerifBlack', '测试'], ['Fredoka', 'Ab']].map(([f, s]) => document.fonts.load(`60px "${f}"`, s))).then(() => {
  buildTextures();
  frame(0);
  window.READY = true;
});
