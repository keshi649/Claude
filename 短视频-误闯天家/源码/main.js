'use strict';
/* main.js：镜头表、歌词（竖排像素毛笔字，唱到哪个字哪个字落下来）、水印、片头歌名、片尾署名，逐帧入口 frame(t)。 */

/* 镜头表：[开始时刻, 画面函数]。切点都落在字头上（逐字时间，比拍点早约 0.06 秒，是辅音开口的地方） */
const SHOTS = [
  [0, shotGate],              // 误：指尖推门；闯：门开，冲进去
  [CT(0, 2), shotCourt],      // 天家：宫殿浮在云上，茫然张望
  [CT(1, 0), shotAdvise],     // 劝余放下
  [CT(1, 4), shotSand],       // 手中砂
  [CT(2, 0), shotStage],      // 张口欲唱
  [CT(2, 4), shotMute],       // 声却哑
  [CT(3, 0), shotDress],      // 粉面披衣
  [CT(3, 4), shotPose],       // 叫
  [CT(3, 5), shotMirror],     // 个假
  [CT(4, 0), shotPity],       // 怜余来
  [CT(4, 3), shotSit],        // 安座下
  [CT(5, 0), shotBuddha],     // 不敢沾染
  [CT(5, 4), shotTea],        // 佛前茶
  [CT(6, 0), shotLeave],      // 只作凡人
  [CT(6, 4), shotLeap],       // 赴
  [CT(6, 5), shotFall],       // 雪月
  [CT(6, 7), shotSnow],       // 风花
];
/* 这几个切点再加一下白闪（其余是硬切） */
const PUNCH = [CT(2, 0), CT(4, 0), CT(5, 0), CT(6, 4), CT(6, 7)];

/* ---------------- 歌词 ----------------
   第一句"误闯天家"是片名：四个大金字横在上面，开头就虚着显出来，唱到哪个字哪个字点亮。
   其余每句竖排两列（从右往左读，第二列低一个字），像素毛笔字；唱到的字从大到小"盖"下来，先是金色再褪成象牙白；
   这句唱完，整句像砂一样一格一格散掉。'R' 放在右上，'L' 放在左上（看镜头里哪边空）。 */
const LYR_POS = ['title', 'R', 'R', 'L', 'R', 'L', 'L'];
const COL = { R: [822, 704], L: [258, 140] };
const CH_Y0 = 300, CH_DY = 104;
const GOLD = [[0, '#FFF6C8'], [.45, '#FFD34E'], [1, '#E89A2E']];
function lineExit(li) {
  if (li + 1 >= LINES.length) return 99;
  if (LYR_POS[li] === 'title') return LEND(li) - .1;                    // 片名在上面，和下一句不在一处，可以晚点散
  return Math.min(LEND(li) + .15, CT(li + 1, 0) - .45);                  // 散完（0.32 秒）再出下一句的第一个字
}
/* 一格一格散掉的版本：按 Bayer 阈值挖掉一部分像素，lvl 0~1 */
function dissolved(c, lvl) {
  const n = Math.round(lvl * 8);
  if (n <= 0) return c;
  const key = c.__id || (c.__id = 'g' + (++dissolved.n));
  const ck = key + '|d' + n;
  if (CACHE[ck]) return CACHE[ck];
  const d = mk(c.width, c.height), dg = d.getContext('2d');
  dg.drawImage(c, 0, 0);
  const im = dg.getImageData(0, 0, c.width, c.height);
  for (let y = 0; y < c.height; y++) for (let x = 0; x < c.width; x++) if (BAYER[(y & 3) * 4 + (x & 3)] < n * 2) im.data[(y * c.width + x) * 4 + 3] = 0;
  dg.putImageData(im, 0, 0);
  CACHE[ck] = d;
  return d;
}
dissolved.n = 0;
function drawGlyph(g, c, cx, cy, k, sc = 1, alpha = 1) {
  if (alpha <= 0) return;
  g.save(); g.imageSmoothingEnabled = false; g.globalAlpha *= alpha;
  const w = c.width * k * sc, h = c.height * k * sc;
  g.drawImage(c, ri(cx - w / 2), ri(cy - h / 2), ri(w), ri(h));
  g.restore();
}
function drawLyrics(g, t) {
  LINES.forEach((L, li) => {
    const pos = LYR_POS[li], t0 = L.chars[0].t, tx = lineExit(li);
    if (t > tx + .36) return;
    const dl = clamp((t - tx) / .32), lift = -E.in(dl) * 18;
    if (pos === 'title') {
      L.chars.forEach((ch, i) => {
        const x = 540 + (i - 1.5) * 196, y = 330 + lift;
        const sung = t >= ch.t - .05;
        if (!sung) { drawGlyph(g, dissolved(brushGlyph(ch.c, 44, C.ivory), dl), x, y, 4, 1, .82); return; }   // 还没唱到：象牙白，唱到了变金
        const u = clamp((t - ch.t + .05) / .16), sc = 1 + .5 * (1 - E.out(u));
        drawGlyph(g, dissolved(brushGlyph(ch.c, 44, GOLD), dl), x, y, 4, sc, Math.min(1, u * 3));
        if (u < 1) { const r = 90 + 60 * u; g.save(); g.globalAlpha = (1 - u) * .5; g.strokeStyle = '#FFE58A'; g.lineWidth = 6; g.beginPath(); g.arc(x, y, r, 0, TAU); g.stroke(); g.restore(); }
      });
      return;
    }
    if (t < t0 - .1) return;
    let idx = 0;
    L.cols.forEach((colText, ci) => {
      const x = COL[pos][ci];
      [...colText].forEach((c, j) => {
        const ch = L.chars[idx++];
        const ta = ch.t - .06;
        if (t < ta) return;
        const u = clamp((t - ta) / .14), sc = 1 + .45 * (1 - E.out(u));
        const y = CH_Y0 + (ci * CH_DY) + j * CH_DY + lift;
        const gold = clamp(1 - (t - ta - .25) / .4);
        const ivory = brushGlyph(c, 32, C.ivory);
        drawGlyph(g, dissolved(ivory, dl), x, y, 3, sc, Math.min(1, u * 3));
        if (gold > 0) drawGlyph(g, dissolved(brushGlyph(c, 32, GOLD), dl), x, y, 3, sc, Math.min(1, u * 3) * gold);
      });
    });
  });
}

/* 片尾：落款"甜菜 出品"、AI 声明、歌名，写在月亮下面、梅枝上面的夜空里（开头不放字，免得压在推门的小怪身上） */
function drawCredits(g, t) {
  const tE = CT(6, 8) + .55;
  if (t < tE) return;
  const u = clamp((t - tE) / .25), u2 = clamp((t - tE - .2) / .3);
  brushText(g, '甜菜 出品', 724, 690, 24, 3, C.ivory, { alpha: u, sc: 1 + .3 * (1 - E.out(u)) });
  plainText(g, '画面：Claude 用代码生成', 724, 772, 32, '#E2EAF7', { alpha: u2 * .9, ol: 'rgba(10,18,38,.85)', olw: 6 });
  plainText(g, '歌曲：辞九门回忆（编曲：名龙）', 724, 822, 28, '#C9D6EE', { alpha: u2 * .8, ol: 'rgba(10,18,38,.85)', olw: 6 });
}
/* 右上角水印 */
function drawWatermark(g) {
  plainText(g, '甜菜', 1012, 66, 34, '#FFFFFF', { alpha: .62, ol: 'rgba(0,0,0,.35)', olw: 4 });
}
/* 暗角 */
const vignCv = (() => {
  const c = mk(), g = c.getContext('2d');
  const gr = g.createRadialGradient(540, 960, 520, 540, 960, 1200);
  gr.addColorStop(0, 'rgba(10,4,20,0)'); gr.addColorStop(1, 'rgba(10,4,20,.42)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  return c;
})();

/* 封面：一身行头的小怪站在洞开的天门前，背后金光；上面四个大金字"误闯天家"，下面一行小字 */
function drawCover(g) {
  const w = 77, h = 137, b = pbuf('cover', w, h), t = 13.25;
  skyHeaven(b, w, h, t, { k: .75, seed: 4, nstars: 40 });
  pglow(b, 38, 86, 46, '#FFE9B0', .55);
  rays(b, 38, 86, 8, 110, 16, .3, '#FFF0B0', .45);
  prect(b, 20, 50, 37, 66, '#FFF6D8'); pdisc(b, 38, 84, 16, '#FFFFFF');      // 门洞里的光
  gateLeaf(b, 12, 50, 8, 64, false, .9); gateLeaf(b, 57, 50, 8, 64, true, .9);
  for (const x of [4, 65]) { prect(b, x, 46, 8, 72, PAL.verm.m); prect(b, x, 46, 2, 72, PAL.verm.l); prect(b, x + 6, 46, 2, 72, PAL.verm.d); }
  roof(b, 38, 46, 88, 12);
  cloudSea(b, w, 112, 30, t, { r: 6, seed: 5, pal: CLOUD_PINK });
  const cx = 38, foot = 118;
  feathers(b, cx, foot - 16, t, 1);
  sleeves(b, cx, foot, t, { amp: 2, len: 18, out: .8, x0: 15, y0: 13 });
  clawdAt(b, cx, foot, { powder: true, robe: true, crown: true, arms: 'spread', eyes: 'happy', mouth: 'smile' });
  blit(g, 'cover', 14);
  g.save(); g.globalAlpha = .55; g.fillStyle = '#1A0E30'; g.fillRect(0, 230, W, 420); g.restore();
  [...'误闯天家'].forEach((c, i) => drawGlyph(g, brushGlyph(c, 44, GOLD), 540 + (i - 1.5) * 222, 410, 5));
  plainText(g, '像素小怪 · 戏腔 MV', 540, 590, 48, '#FFF4DF', { ol: 'rgba(30,10,40,.85)', olw: 8 });
}

function frame(t) {
  t = Math.min(t, DUR - 1e-3);
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.imageSmoothingEnabled = false;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  let k = 0; while (k + 1 < SHOTS.length && t >= SHOTS[k + 1][0]) k++;
  if (window.COVER) { drawCover(ctx); drawWatermark(ctx); return; }
  SHOTS[k][1](ctx, t);
  for (const tp of PUNCH) { const u = (t - tp) / .12; if (u >= 0 && u < 1) { ctx.save(); ctx.globalAlpha = (1 - u) * .35; ctx.fillStyle = '#FFFFFF'; ctx.fillRect(0, 0, W, H); ctx.restore(); } }
  ctx.drawImage(vignCv, 0, 0);
  if (!window.COVER) { drawLyrics(ctx, t); drawCredits(ctx, t); }
  drawWatermark(ctx);
  // 结尾最后 0.45 秒慢慢暗下去（歌声也在淡出）
  const fo = seg(t, DUR - .45, DUR);
  if (fo > 0) { ctx.save(); ctx.globalAlpha = fo * .85; ctx.fillStyle = '#05030C'; ctx.fillRect(0, 0, W, H); ctx.restore(); }
}
window.frame = frame;

const ALLTEXT = LINES.map(l => l.text).join('') + '甜菜出品辞九门回忆编曲名龙画面用代码生成像素小怪戏腔♪';
Promise.all([document.fonts.load(`32px "${BRUSH}"`, ALLTEXT), document.fonts.load(`44px "${BRUSH}"`, ALLTEXT)])
  .then(() => document.fonts.ready).then(() => { window.READY = true; });
