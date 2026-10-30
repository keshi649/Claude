'use strict';
/* main.js：镜头表、像素风的转场、歌词、水印、片尾字、逐帧入口 frame(t)。
   视频时间 = 歌曲时间（开头 0.43 秒静音不剪：第一帧就有画面在动）。成片和歌一样长，不另加片尾卡。 */
const DURATION = SONG_DUR;
function buildScenes() {
  SCENES.length = 0;
  SCENES_DEF.forEach(f => f());
  SCENES.sort((x, y) => x.a - y.a);
  SCENES.forEach((sc, i) => { sc.b = i + 1 < SCENES.length ? SCENES[i + 1].a : DURATION + 1; });
}

/* ---------------- 合成与转场 ---------------- */
const bufA = mk(), bufB = mk(), gA = bufA.getContext('2d'), gB = bufB.getContext('2d');
const bufT = mk(), gT = bufT.getContext('2d');
const MASK = mk(160, 90), gMask = MASK.getContext('2d');       // 转场的遮罩：160×90 一格 = 屏幕上 12×12（像素风的方块）
function drawScene(sc, g, s) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.imageSmoothingEnabled = false;
  g.fillStyle = '#07060E'; g.fillRect(0, 0, W, H);
  sc.draw(g, s, s - sc.a);
  g.restore();
}
function sceneAt(s) { for (let i = SCENES.length - 1; i >= 0; i--) if (s >= SCENES[i].a) return i; return 0; }
function composite(g, s) {
  const i = sceneAt(s);
  for (const j of [i, i + 1]) {
    const sc = SCENES[j]; if (!sc || !sc.tr || j === 0) continue;
    const tr = sc.tr, pre = tr.pre ?? tr.dur / 2;
    const a = sc.a - pre, b = a + tr.dur;
    if (s >= a && s < b) { transition(g, s, tr, (s - a) / tr.dur, SCENES[j - 1], sc); return SCENES[(s < sc.a) ? j - 1 : j]; }
  }
  drawScene(SCENES[i], g, s);
  return SCENES[i];
}
/* 按遮罩把 B 盖到 A 上：fn(cx, cy) 返回这一格要不要换成 B（160×90 的格子） */
function maskBlend(g, fn, skipA = false) {
  gMask.clearRect(0, 0, 160, 90); gMask.fillStyle = '#fff';
  for (let cy = 0; cy < 90; cy++) for (let cx = 0; cx < 160; cx++) if (fn(cx, cy)) gMask.fillRect(cx, cy, 1, 1);
  gT.save(); gT.setTransform(1, 0, 0, 1, 0, 0); gT.globalCompositeOperation = 'copy'; gT.drawImage(bufB, 0, 0);
  gT.globalCompositeOperation = 'destination-in'; gT.imageSmoothingEnabled = false; gT.drawImage(MASK, 0, 0, W, H); gT.restore();
  if (!skipA) g.drawImage(bufA, 0, 0);
  g.drawImage(bufT, 0, 0);
}
function transition(g, s, tr, u, A, B) {
  const type = tr.type;
  const both = () => { drawScene(A, gA, s); drawScene(B, gB, s); };
  g.imageSmoothingEnabled = false;
  if (type === 'flash' || type === 'black') {
    drawScene(u < .5 ? A : B, g, s);
    const k = u < .5 ? E.in2(u * 2) : 1 - E.out2((u - .5) * 2), q = Math.round(k * 8) / 8;     // 亮度分 8 级跳（像素风）
    g.fillStyle = type === 'flash' ? `rgba(255,246,236,${q})` : `rgba(6,5,12,${q})`; g.fillRect(0, 0, W, H);
    return;
  }
  if (type === 'dither') {          // 抖动溶解：按 4×4 Bayer 阈值一格一格换成下一个镜头
    both(); const th = u * 16;
    maskBlend(g, (cx, cy) => BAYER[(cy & 3) * 4 + (cx & 3)] + hash(cx >> 2, cy >> 2, 9) * .99 < th);
    return;
  }
  if (type === 'mosaic') {          // 马赛克：前一个镜头的方块越变越大，后一个镜头从大方块变回来
    both(); const src = u < .5 ? bufA : bufB, k = u < .5 ? u * 2 : (1 - u) * 2;
    const bs = Math.max(1, Math.round(1 + E.in2(k) * (tr.max || 60)));
    const sw = Math.max(1, Math.round(W / bs)), sh = Math.max(1, Math.round(H / bs));
    gT.save(); gT.setTransform(1, 0, 0, 1, 0, 0); gT.globalCompositeOperation = 'copy'; gT.imageSmoothingEnabled = true; gT.drawImage(src, 0, 0, sw, sh); gT.restore();
    g.drawImage(bufT, 0, 0, sw, sh, 0, 0, W, H);
    return;
  }
  if (type === 'iris' || type === 'bean') {   // 方块组成的圆孔 / 红豆形的口子张开，里面是下一个镜头
    both(); const cx0 = (tr.cx ?? W / 2) / 12, cy0 = (tr.cy ?? H / 2) / 12, r = E.io(u) * 110, rot = tr.rot ?? -.5;
    const cs = Math.cos(rot), sn = Math.sin(rot);
    maskBlend(g, (cx, cy) => { const dx = cx + .5 - cx0, dy = cy + .5 - cy0; if (type === 'iris') return dx * dx + dy * dy < r * r; const x = dx * cs + dy * sn, y = -dx * sn + dy * cs; return (x * x) / (r * r) + (y * y) / (r * r * .5) < 1; });
    if (type === 'bean' && u > .02 && u < .98) {   // 口子边上一圈红
      gMask.clearRect(0, 0, 160, 90); gMask.fillStyle = RED;
      for (let cy = 0; cy < 90; cy++) for (let cx = 0; cx < 160; cx++) { const dx = cx + .5 - cx0, dy = cy + .5 - cy0, x = dx * cs + dy * sn, y = -dx * sn + dy * cs, v = (x * x) / (r * r) + (y * y) / (r * r * .5); if (v >= 1 && v < 1 + 4 / Math.max(4, r)) gMask.fillRect(cx, cy, 1, 1); }
      g.drawImage(MASK, 0, 0, W, H);
    }
    return;
  }
  if (type === 'wipe') {            // 斜着的台阶一格格扫过去
    both(); const d = tr.dir ?? 1;
    maskBlend(g, (cx, cy) => ((d > 0 ? cx : 159 - cx) + cy * 1.2) / (160 + 108) < E.io(u) * 1.04);
    return;
  }
  if (type === 'blinds') {          // 百叶窗：一条条从中间张开
    both(); const n = 9;
    maskBlend(g, (cx, cy) => { const band = Math.floor(cy / (90 / n)), inBand = (cy % (90 / n)) / (90 / n), k = clamp(u * 1.6 - band / n * .6); return Math.abs(inBand - .5) < k / 2; });
    return;
  }
  if (type === 'push' || type === 'whip') {   // 推过去 / 甩过去（带残影）；位移按 12 像素取整
    both(); const e = type === 'whip' ? E.io(u) : E.io2(u), d = tr.dir ?? 1, off = Math.round(-W * e * d / 12) * 12;
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    if (type === 'whip') { const bl = Math.sin(Math.PI * u); for (let k = 4; k >= 1; k--) { g.globalAlpha = .14; const o2 = Math.round(k * 60 * bl / 12) * 12 * d; g.drawImage(bufA, off - o2, 0); g.drawImage(bufB, off + W * d - o2, 0); } g.globalAlpha = 1; }
    g.drawImage(bufA, off, 0); g.drawImage(bufB, off + W * d, 0);
    return;
  }
  if (type === 'drop') {            // 往下沉：上一个镜头往上推走（镜头往下摇）
    both(); const e = E.io2(u), off = Math.round(H * e / 12) * 12;
    g.drawImage(bufA, 0, -off); g.drawImage(bufB, 0, H - off);
    return;
  }
  if (type === 'ripple') {          // 水波：一行行左右错开，同时抖动溶解
    both(); const amp = Math.sin(Math.PI * u) * 5, th = u * 16;
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    for (let y = 0; y < H; y += 12) { const dx = Math.round(Math.sin(y * .02 + u * 14) * amp) * 12; g.drawImage(bufA, 0, y, W, 12, dx, y, W, 12); }
    maskBlend(g, (cx, cy) => BAYER[(cy & 3) * 4 + (cx & 3)] < th, true);
    return;
  }
  drawScene(u < .5 ? A : B, g, s);
}

/* ---------------- 歌词：底部居中，像素字 5 倍（60px）；整句淡淡地出来，唱到哪个字哪个字亮起来、往上跳一下；
   一颗小红豆跳在正在唱的那个字上面。上一句淡完了下一句才进来 ---------------- */
const LK = 5, LY_TOP = 930, LX = 960;
function lyricWindows() {
  const out = [];
  for (let i = 0; i < LYRICS.length; i++) {
    const L = LYRICS[i], c0 = L.chars[0][1], cN = L.chars[L.chars.length - 1], next = LYRICS[i + 1];
    let a = c0 - .4;
    if (out.length) a = Math.max(a, out[out.length - 1].b + .25);
    let b = Math.max(cN[2] + .15, cN[1] + 1.0);
    if (next) b = Math.max(Math.min(b, next.chars[0][1] - .6), cN[1] + .25);
    out.push({ L, a, b });
  }
  return out;
}
let LYRW = null;
function lyricLayout(L) {
  if (L._lay) return L._lay;
  let x = 0; const xs = [], cs = [];
  for (const ch of L.text) { if (ch === ' ') { x += 7; continue; } xs.push(x); cs.push(ch); x += textW12(ch); }
  return (L._lay = { xs, cs, w: x });
}
const BEAN_SPR = () => cached('lyr_bean', 7, 5, g => { pbean(g, 1, 1, 2); });
function drawLyrics(g, t) {
  if (!LYRW) LYRW = lyricWindows();
  for (const { L, a, b } of LYRW) {
    if (t < a - .05 || t > b + .3) continue;
    const fin = clamp((t - a) / .25), fout = clamp((b + .25 - t) / .25), A = Math.min(fin, fout);
    if (A <= 0) continue;
    const dy = ri((1 - E.out(fin)) * 3) * LK - ri((1 - fout) * 3) * LK;
    const lay = lyricLayout(L), x0 = LX - lay.w * LK / 2;
    let cur = -1;
    lay.cs.forEach((c, j) => {
      const u = t - (L.chars[j][1] - .04);
      let col = '#FFFFFF', al = .38, jy = 0;
      if (u >= 0) { al = 1; cur = j; if (u < .12) jy = -LK; col = u < .3 ? mix('#FFC7C7', '#FFFFFF', clamp(u / .3)) : '#FFFFFF'; }
      ptext(g, c, x0 + lay.xs[j] * LK, LY_TOP + dy + jy, LK, col, { ol: '#0A0C1C', alpha: A * al });
    });
    if (cur >= 0 && t < b + .1) {   // 跳动的小红豆
      const ct = L.chars[cur][1], hop = clamp((t - ct + .06) / .22);
      const xa = cur ? x0 + lay.xs[cur - 1] * LK : x0 - 40, xb = x0 + lay.xs[cur] * LK;
      const bx = lerp(xa, xb, E.out2(hop)) + 3 * LK, by = LY_TOP + dy - 7 * LK - ri(Math.sin(Math.PI * hop) * 3) * LK;
      g.save(); g.globalAlpha = A * clamp((b + .1 - t) / .25); g.imageSmoothingEnabled = false;
      g.drawImage(BEAN_SPR(), ri(bx / LK) * LK, ri(by / LK) * LK, 7 * LK, 5 * LK); g.restore();
    }
  }
}

/* ---------------- 暗角、水印、片尾字 ---------------- */
const VIG = (() => {
  const c = mk(), g = c.getContext('2d');
  const gr = g.createRadialGradient(W / 2, H / 2, 460, W / 2, H / 2, 1150);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.36)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H); return c;
})();
const CREDIT_AT = 226.2;            // 尾奏最后一次起伏（222~229 秒）的中间
function drawCredits(g, t) {
  const a = seg(t, CREDIT_AT, CREDIT_AT + .8); if (a <= 0) return;
  g.save(); g.globalAlpha = a; g.fillStyle = 'rgba(8,8,24,.45)'; g.fillRect(420, 780, 1080, 230); g.restore();
  ptext(g, '甜菜 出品', 960, 796, 6, '#FFF6E6', { align: 'center', alpha: a, ol: '#140A20' });
  ptext(g, '歌曲《红豆》 演唱：方大同　词：林夕　曲：柳重言', 960, 900, 3, '#FFF2E6', { align: 'center', alpha: a, ol: '#140A20' });
  ptext(g, '画面、动画：Claude 用代码生成', 960, 954, 3, '#FFF2E6', { align: 'center', alpha: a * .95, ol: '#140A20' });
}

/* ---------------- 逐帧入口 ---------------- */
const MAIN = mk(), gM = MAIN.getContext('2d');
window.frame = function (t) {
  const sc = composite(gM, t);
  const g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none'; g.imageSmoothingEnabled = false;
  g.drawImage(MAIN, 0, 0);
  g.drawImage(VIG, 0, 0);
  if (sc && sc.over) sc.over(g, t, t - sc.a);
  if (!window.NO_LYRICS) drawLyrics(g, t);
  const fo = seg(t, DURATION - 1.4, DURATION - .05);
  if (fo > 0) { g.fillStyle = `rgba(0,0,0,${(Math.round(E.sine(fo) * 12) / 12).toFixed(3)})`; g.fillRect(0, 0, W, H); }
  drawCredits(g, t);
  ptext(g, '甜菜', 1876, 42, 3, '#FFFFFF', { align: 'right', alpha: .8, ol: '#0A0C1C' });
};
window.drawCover = function (t) { if (typeof drawCoverArt === 'function') drawCoverArt(t); else window.frame(t); };
window.READY = false;
fontsReady(LYRICS.map(l => l.text).join('') + '红豆方大同甜菜出品歌曲演唱词林夕曲柳重言画面动画用代码生成《》：　一起看一场雪牵手走过沙丘陪你看细水长流明年还一起看雪南站年还没Claude0123456789').then(() => {
  buildScenes();
  window.frame(0);
  window.READY = true;
});
