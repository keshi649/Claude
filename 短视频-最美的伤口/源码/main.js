'use strict';
/* main.js：镜头表、转场、歌词、水印、片尾字幕，逐帧入口 frame(t)。
   换镜头都落在小节线上（每句歌词 2 小节、第 2、3 句各 1 小节）；第 5 小节（镲片）和副歌第一拍闪白。 */
const SHOTS = [
  { a: 0, fn: S1 }, { a: bar(2), fn: S2 }, { a: bar(3), fn: S3 }, { a: bar(4), fn: S4 },
  { a: bar(5), fn: S5, flash: .35 }, { a: bar(6), fn: S6 }, { a: bar(7), fn: S7 }, { a: bar(8), fn: S8 },
  { a: bar(9), fn: S9, flash: .5 }, { a: bar(10), fn: S10 }, { a: bar(11), fn: S11 }, { a: bar(12), fn: S12 },
  { a: bar(13), fn: S13 }, { a: bar(14), fn: S14 }, { a: bar(15), fn: S15 }, { a: bar(16), fn: S16 },
];
const END_FADE = [41.95, 42.75];          // 最后一小节：画面淡到黑，片尾字留着
const CREDIT_IN = 40.0;

/* ---------- 歌词：底部居中，像素字 5 倍（60px）；整句先淡淡地出来，唱到哪个字哪个字亮起来、往上跳一下 ---------- */
const LK = 5, LY_TOP = 934, LX = 960;
/* 每句什么时候出现、什么时候让位：下一句出现的那一刻上一句交棒（中间空得久就早点淡出） */
const LWIN = LY.map((L, i) => {
  const first = L.chars[0].t0, prevLast = i > 0 ? LY[i - 1].chars[LY[i - 1].chars.length - 1].t0 : -9;
  return { a: Math.max(first - .3, prevLast + .3) };
});
LWIN.forEach((w, i) => { w.b = i < LY.length - 1 ? Math.min(LWIN[i + 1].a, LY[i].end + .6) : 41.75; });
function lyricLayout(i) {
  const L = LY[i]; if (L._lay) return L._lay;
  let x = 0; const xs = [];
  L.chars.forEach((c, j) => { if (L.gap === j) x += 7; xs.push(x); x += textW12(c.c); });
  L._lay = { xs, w: x }; return L._lay;
}
function drawLyrics(g, t) {
  for (let i = 0; i < LY.length; i++) {
    const { a, b } = LWIN[i]; if (t < a || t > b) continue;
    const fin = clamp((t - a) / .12), fout = clamp((b - t) / .12);   // 上一句在交棒前 0.12 秒淡出、往上走，下一句交棒后从下面淡进来
    const A = Math.min(fin, fout); if (A <= 0) continue;
    const dy = (1 - E.out(fin)) * 2 * LK - (1 - fout) * 2 * LK;
    const L = LY[i], lay = lyricLayout(i), x0 = LX - lay.w * LK / 2;
    L.chars.forEach((c, j) => {
      const u = t - (c.t0 - .04);
      let col = '#FFFFFF', al = .36, jy = 0;
      if (u >= 0) { al = 1; if (u < .12) jy = -LK; col = u < .3 ? mix('#FFE7A0', '#FFFFFF', clamp(u / .3)) : '#FFFFFF'; }
      ptext(g, c.c, x0 + lay.xs[j] * LK, LY_TOP + dy + jy, LK, col, { ol: '#0A0C1C', alpha: A * al });
    });
  }
}

/* ---------- 暗角 ---------- */
const VIG = (() => {
  const c = mk(), g = c.getContext('2d');
  const gr = g.createRadialGradient(W / 2, H / 2, 420, W / 2, H / 2, 1150);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.42)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H); return c;
})();

/* ---------- 片尾字：片名、甜菜 出品、歌曲和画面的说明 ---------- */
function drawCredits(g, t) {
  const a = seg(t, CREDIT_IN, CREDIT_IN + .5); if (a <= 0) return;
  ptext(g, '最美的伤口', 960, 132, 7, '#FFE7A0', { align: 'center', alpha: a, ol: '#2A1020' });
  ptext(g, '甜菜 出品', 960, 246, 4, '#FFFFFF', { align: 'center', alpha: a, ol: '#2A1020' });
  ptext(g, '歌曲：《最美的伤口》小睿　画面：Claude 用代码生成', 960, 318, 2, '#FFF2E6', { align: 'center', alpha: a * .95, ol: '#2A1020' });
}

window.frame = function (t) {
  const g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.imageSmoothingEnabled = false; g.filter = 'none';
  let i = SHOTS.length - 1; while (i > 0 && t < SHOTS[i].a) i--;
  const sh = SHOTS[i];
  sh.fn(g, t);
  if (sh.flash) { const u = (t - sh.a) / sh.flash; if (u < 1) { g.fillStyle = `rgba(255,248,236,${(.85 * (1 - u) * (1 - u)).toFixed(3)})`; g.fillRect(0, 0, W, H); } }
  g.drawImage(VIG, 0, 0);
  if (!window.COVER) drawLyrics(g, t);
  const fade = seg(t, END_FADE[0], END_FADE[1]);
  if (fade > 0) { g.fillStyle = `rgba(0,0,0,${fade.toFixed(3)})`; g.fillRect(0, 0, W, H); }
  if (!window.COVER) drawCredits(g, t);
  if (window.COVER) window.coverOverlay(g, t);
  // 水印：右上角"甜菜"
  ptext(g, '甜菜', 1876, 42, 3, '#FFFFFF', { align: 'right', alpha: .78, ol: '#0A0C1C' });
};
/* 封面：不画歌词，大字片名 */
window.coverOverlay = function (g) {                       // 封面用鲸鱼游过月亮那一帧：片名居中放在最上面（抖音主页的格子按中间裁成竖的，也看得全）
  ptext(g, '最美的伤口', 960, 40, 12, '#FFF6E6', { align: 'center', ol: '#140A20', shadow: '#140A20' });
  ptext(g, '小睿', 960, 210, 4, '#F2E6FF', { align: 'center', ol: '#140A20' });
};

fontsReady(LY.map(l => l.text).join('') + '最美的伤口小睿甜菜出品歌曲画面用代码生成《》：　甜品电影院奶茶花店烧烤书店别走KTV24hClaude').then(() => { window.READY = true; });
