'use strict';
/* main.js：镜头表、转场、逐字歌词、水印、片尾字幕、逐帧入口 frame(t)。
   视频时间就是歌曲时间（原曲第 0.003 秒就有声音，不剪头）；一共 61.16 秒，32 个小节，每小节 1.875 秒（128 BPM）。
   镜头基本一小节一个，切在小节线上；副歌的 drop（31.19 秒）闪白。 */
const ctx = document.getElementById('c').getContext('2d');
const AUX = mk(W, H), actx = AUX.getContext('2d');
const B = n => barT(n);

/* 镜头表：a、b 是开始、结束的歌曲时间；tr 是进这个镜头的转场（cut 硬切、dither 像素溶解、flash 闪白、black 闪黑），trd 转场时长 */
const SHOTS = [
  // ---- 主歌：烛灯下等他 ----
  { id: 'open', a: 0, b: B(1), fn: shotOpen },
  { id: 'window', a: B(1), b: B(2), fn: shotWindow },
  { id: 'toast', a: B(2), b: B(3), fn: shotToast },
  { id: 'split', a: B(3), b: B(4), fn: shotSplit },
  { id: 'write', a: B(4), b: B(5), fn: shotWrite, tr: 'dither', trd: .25 },
  { id: 'play', a: B(5), b: B(6), fn: shotPlay },
  { id: 'farewell', a: B(6), b: B(7), fn: shotFarewell, tr: 'dither', trd: .25 },
  { id: 'exam', a: B(7), b: B(8), fn: shotExam },
  // ---- 砚上三五笔，落墨鹧鸪啼 ----
  { id: 'ink', a: B(8), b: B(9), fn: shotInk },
  { id: 'letter', a: B(9), b: B(10), fn: shotLetter },
  { id: 'inkdrop', a: B(10), b: B(11), fn: shotInkDrop },
  { id: 'partridge', a: B(11), b: B(12), fn: shotPartridge },
  // ---- breakdown：谁识曲中意，断弦等你系 ----
  { id: 'qin', a: B(12), b: B(13), fn: shotQin, tr: 'dither', trd: .35 },
  { id: 'strings', a: B(13), b: 27.33, fn: shotStrings },
  { id: 'snap', a: 27.33, b: B(15), fn: shotSnap, tr: 'flash', trd: .12 },
  { id: 'thread', a: B(15), b: B(16), fn: shotThread },
  // ---- 副歌一：金榜题名、回来了 ----
  { id: 'list', a: B(16), b: B(17), fn: shotList, tr: 'flash', trd: .22 },
  { id: 'parade', a: B(17), b: B(18), fn: shotParade },
  { id: 'sleeves', a: B(18), b: B(19), fn: shotSleeves },
  { id: 'feast', a: B(19), b: B(20), fn: shotFeast },
  { id: 'moonrise', a: B(20), b: B(21), fn: shotMoonrise },
  { id: 'roof', a: B(21), b: B(22), fn: shotRoof, tr: 'dither', trd: .3 },
  { id: 'lanterns', a: B(22), b: B(23), fn: shotLanterns },
  // ---- 副歌二：系上红线、春来、拜天地、白首 ----
  { id: 'offer', a: B(23), b: B(24), fn: shotOffer },
  { id: 'tie', a: B(24), b: B(25), fn: shotTie },
  { id: 'spring', a: B(25), b: B(26), fn: shotSpring, tr: 'flash', trd: .15 },
  { id: 'petalsnow', a: B(26), b: B(27), fn: shotPetalSnow },
  { id: 'bow1', a: B(27), b: B(28), fn: shotBow1 },
  { id: 'bow2', a: B(28), b: B(29), fn: shotBow2 },
  { id: 'old', a: B(29), b: B(30), fn: shotOld, tr: 'dither', trd: .45 },
  { id: 'end', a: B(30), b: SONG_DUR + .1, fn: shotEnd, tr: 'dither', trd: .4 },
];
const DURATION = SONG_DUR;

function drawShot(c, s, t) {
  c.save();
  c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
  s.fn(c, t - s.a, t, s);
  c.restore();
}
/* 像素溶解的遮罩：480×270 的 Bayer 阈值图，放大 4 倍 */
const MASK = mk(PW, PH), mctx = MASK.getContext('2d'), MIMG = mctx.createImageData(PW, PH);
function ditherMask(f) {
  const d = MIMG.data;
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) { const i = (y * PW + x) * 4; d[i] = d[i + 1] = d[i + 2] = 255; d[i + 3] = bay(x, y) < f ? 255 : 0; }
  mctx.putImageData(MIMG, 0, 0);
  return MASK;
}

/* ---------------- 逐字歌词 ----------------
   底部居中（字的下沿在 y≈995，安全区 y<1026 以内），像素字 12px 放大 4 倍（每个字 48px）；还没唱到的字是暖白，唱到的字变成金色、往上跳一下。
   每句在第一个字开唱前 0.3 秒从下面浮上来，下一句来的时候淡出往上走。 */
const LY_IN = .3, LY_OUT = .12;
/* 每句什么时候出现、什么时候换掉：提前 0.3 秒出现，但要等上一句最后一个字开唱 0.12 秒以后（这首句子之间常常只隔 0.1~0.3 秒）；
   下一句出现时这一句就往上淡出；后面没有紧跟的句子时，唱完 0.9 秒淡出 */
const LY_SPAN = LYRICS.map((L, i) => {
  const prevLast = i ? LYRICS[i - 1].t[LYRICS[i - 1].t.length - 1][0] + .12 : -1;
  return Math.max(L.t[0][0] - LY_IN, prevLast);
});
function lyricLines(t) {
  const out = [];
  LYRICS.forEach((L, i) => {
    const t0 = LY_SPAN[i], nxt = i + 1 < LYRICS.length ? LY_SPAN[i + 1] : 1e9;
    const t1 = Math.min(nxt, L.t[L.t.length - 1][1] + .9);
    if (t >= t0 && t < t1 + LY_OUT) out.push({ L, i, t0, t1 });
  });
  return out;
}
function drawLyrics(c, t) {
  for (const { L, t0, t1 } of lyricLines(t)) {
    const fin = easeOut(seg(t, t0, t0 + .18)), fout = t > t1 ? seg(t, t1, t1 + LY_OUT) : 0;
    const alpha = fin * (1 - fout);
    if (alpha <= 0) continue;
    const chars = [...L.text];
    // 每个字的颜色：唱到了是金色；正在唱的那个字（开唱后 0.16 秒内）从整句里拿掉，单独画、往上跳一下
    let ci = 0, jump = -1, jumpP = 0;
    const cols = chars.map((ch, j) => {
      if (ch === ' ') return '#000000';
      const st = L.t[ci++][0], p = t - st;
      if (p >= -.03 && p < .16) { jump = j; jumpP = clamp(p / .16); }
      return t >= st - .03 ? '#FFD45A' : '#FFF6E6';
    });
    const pb = textPB(L.text, { col: '#FFF6E6', cols, ol: '#2A1028', sh: '#12081A', skip: jump });
    const k = 4, tw = pb.w * k;
    const x0 = Math.round((W - tw) / 2 / k) * k, y0 = 1000 - pb.h * k + Math.round((1 - fin) * 16 - fout * 36);
    // 底下垫一条很淡的暗带，亮背景上也看得清
    const gr = c.createLinearGradient(0, y0 - 30, 0, y0 + pb.h * k + 26);
    gr.addColorStop(0, 'rgba(10,4,20,0)'); gr.addColorStop(.5, `rgba(10,4,20,${.34 * alpha})`); gr.addColorStop(1, 'rgba(10,4,20,0)');
    c.fillStyle = gr; c.fillRect(x0 - 160, y0 - 30, tw + 320, pb.h * k + 56);
    drawTextPB(c, pb, x0, y0, k, alpha);
    if (jump >= 0) {
      let xx = 0; for (let j = 0; j < jump; j++) xx += pb.adv[j];
      const one = textPBc(chars[jump], { col: '#FFE88A', ol: '#2A1028', sh: '#12081A' });
      drawTextPB(c, one, x0 + xx * k, y0 - Math.round(2 * (1 - jumpP)) * k, k, alpha);
    }
  }
}

/* ---------------- 水印、片尾 ---------------- */
function watermark(c, t) {
  if (t > CARD_AT + .2) return;
  const pb = textPBc('甜菜', { col: '#FFFFFF', ol: '#1A1024' });
  drawTextPB(c, pb, 1890 - pb.w * 3, 44 - Math.round(pb.h * 1.5), 3, .78);
}
const CARD_AT = 58.2;
function endCard(c, t) {
  if (t < CARD_AT) return;
  const f = ease(seg(t, CARD_AT, CARD_AT + .7));
  const title = textPBc('鸳鸯戏', { font: 'ms', size: 44, col: '#F7D27A', ol: '#4A0E1E', sh: '#1A0610', gap: 2 });
  const tk = 4, tx = Math.round((W - title.w * tk) / 2 / 4) * 4;
  c.save(); c.fillStyle = `rgba(8,6,20,${.35 * f})`; c.fillRect(0, 0, W, H); c.restore();
  drawTextPB(c, title, tx, 150 - Math.round((1 - f) * 20), tk, f);
  const f2 = ease(seg(t, CARD_AT + .35, CARD_AT + 1));
  const by = textPBc('甜菜 出品', { col: '#FFFFFF', ol: '#1A1024' });
  drawTextPB(c, by, Math.round((W - by.w * 4) / 2), 400, 4, f2);
  const f3 = ease(seg(t, CARD_AT + .6, CARD_AT + 1.3));
  // 字幕都在 x 96~1650 以内（横屏右侧 x>1650 是抖音的按钮区）
  ['歌曲：《鸳鸯戏》DJ 版', '词：家浚　曲：家浚 / 乐金震　编曲：DJ 哈市小鹏', '画面、动画、像素小怪：Claude 用代码生成'].forEach((s, i) => {
    const p = textPBc(s, { col: '#E8E0FF', ol: '#1A1024' });
    drawTextPB(c, p, Math.round((W - p.w * 3) / 2), 496 + i * 54, 3, f3);
  });
}

/* ---------------- 封面：屋脊上的两个人、大月亮、一颗心，大字片名 ---------------- */
function drawCover(t) {
  const P = PAL.fest, g = pbuf('cover');
  skyFill(g, ['#0E0A26', '#1C1240', '#2E1A56', '#4A2A6A', '#6A3A6E']);
  stars(g, 3, 103, 120, 0, 0, PW, 200, P.star);
  moonDisc(g, 330, 118, 92, P);
  for (let i = 0; i < 30; i++) { const x = 20 + h2(i, 6) * 440, y = 30 + h2(i, 7) * 170, s = .6 + h2(i, 8) * .9; g.rect(x - 2 * s, y - 3 * s, 4 * s, 5 * s, '#FF9A4A'); g.rect(x - s, y - 2 * s, 2 * s, 2 * s, '#FFE0A0'); }
  roof(g, 300, 200, 290, 70, PAL.night, { rw: 230, curl: 18, col: '#1A1430', colL: '#3A3060', eave: '#4A4070', tile: '#120E24', ridge: '#120E24' });
  mon(g, 286, 200, { col: MON.lang, zhuang: true, eyes: 'closed', blush: true, ol: '#120A1C' }, 3);
  mon(g, 340, 202, { col: MON.niang, girl: true, eyes: 'closed', sway: 1, ol: '#120A1C' }, 3);
  heart(g, 314, 106, 3);
  petals(g, 3, 109, 40, P);
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  show(ctx, g);
  glow(ctx, 330, 118, 170, P.moon, .25); glow(ctx, 314, 106, 26, '#FF5A8A', .5);
  vignette(ctx, .45);
  const tt = textPBc('鸳鸯戏', { font: 'ms', size: 44, col: '#F7D27A', ol: '#4A0E1E', sh: '#14060E', gap: 2 });
  drawTextPB(ctx, tt, 120, 150, 5);
  const sub = textPBc('像素小怪 · 古风 MV', { col: '#FFE9C4', ol: '#1A0A1E' });
  drawTextPB(ctx, sub, 120 + (tt.w * 5 - sub.w * 4) / 2, 150 + tt.h * 5 + 10, 4);
  const sub2 = textPBc('哎呦小情郎　你莫愁', { col: '#FFFFFF', ol: '#1A0A1E' });
  drawTextPB(ctx, sub2, 120 + (tt.w * 5 - sub2.w * 3) / 2, 150 + tt.h * 5 + 90, 3);
}
window.drawCover = drawCover;

/* ---------------- 逐帧入口 ---------------- */
function shotIndex(t) { for (let i = SHOTS.length - 1; i >= 0; i--) if (t >= SHOTS[i].a) return i; return 0; }
function frame(t) {
  const i = shotIndex(t), s = SHOTS[i];
  const lt = t - s.a;
  if (i > 0 && s.tr && s.tr !== 'cut' && lt < s.trd) {
    const f = lt / s.trd, prev = SHOTS[i - 1];
    if (s.tr === 'dither') {
      drawShot(ctx, prev, t);
      drawShot(actx, s, t);
      actx.save(); actx.globalCompositeOperation = 'destination-in'; actx.imageSmoothingEnabled = false;
      actx.drawImage(ditherMask(ease(f)), 0, 0, W, H); actx.restore();
      ctx.drawImage(AUX, 0, 0);
    } else if (s.tr === 'flash' || s.tr === 'black') {
      drawShot(ctx, s, t);
      ctx.fillStyle = s.tr === 'flash' ? `rgba(255,250,240,${1 - easeOut(f)})` : `rgba(0,0,0,${1 - easeOut(f)})`;
      ctx.fillRect(0, 0, W, H);
    }
  } else drawShot(ctx, s, t);
  if (!window.COVER) { drawLyrics(ctx, t); watermark(ctx, t); endCard(ctx, t); }
}
window.frame = frame;
window.SHOTS = SHOTS;
window.TRIM = 0;
document.fonts.load('12px FusionPixel').then(() => document.fonts.load('44px MaShan')).then(() => {
  // 先把要用到的字形都过一遍，确认字体真的加载了
  glyph('鸳'); glyph('鸯', 'ms', 44);
  window.READY = true;
});
