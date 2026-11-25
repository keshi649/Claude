'use strict';
/* main.js：镜头表、转场、歌词、水印、整体后期（柔光、调色、暗角、颗粒）、逐帧入口 frame(T)。
   视频时间 T = 歌曲时间 s - TRIM：歌曲文件开头有 0.38 秒的数字静音，剪掉 0.30 秒，第一帧就有声音、有画面。
   尾奏最后一秒几乎没声音了，片尾卡从歌曲结束前 1 秒开始，停 2.5 秒。 */
const TRIM = 0.30;
const EPI = 0;                         // 歌曲结束后没有另加尾声
const CARD = 2.5;                      // 片尾卡
const CARD_AT = SONG_DUR - 1.0;        // 片尾卡开始的歌曲时间
const S_END = CARD_AT + CARD;          // 歌曲时间的终点
const DURATION = S_END - TRIM;         // 视频总长（秒）

function buildScenes() {
  SCENES.length = 0;
  SCENES_DEF.forEach(f => f());
  SCENES.sort((x, y) => x.a - y.a);
  SCENES.forEach((sc, i) => { sc.b = i + 1 < SCENES.length ? SCENES[i + 1].a : S_END + 1; });
}

/* ---------------- 合成与转场 ---------------- */
const bufA = mk(), bufB = mk(), gA = bufA.getContext('2d'), gB = bufB.getContext('2d');
const bufT = mk(), gT = bufT.getContext('2d');
function drawScene(sc, g, s) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.fillStyle = '#05050F'; g.fillRect(0, 0, W, H);       // 先铺黑：镜头平移、旋转时露出来的边不会带上一帧的残影
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

function transition(g, s, tr, u, A, B) {
  const type = tr.type;
  const both = () => { drawScene(A, gA, s); drawScene(B, gB, s); };
  if (type === 'fade' || type === 'blur') {
    both();
    g.drawImage(bufA, 0, 0);
    const e = E.sine(u);
    if (type === 'blur') { const b = Math.sin(Math.PI * u) * 14; g.filter = `blur(${b.toFixed(1)}px)`; g.drawImage(bufA, 0, 0); g.globalAlpha = e; g.drawImage(bufB, 0, 0); g.filter = 'none'; g.globalAlpha = 1; return; }
    g.globalAlpha = e; g.drawImage(bufB, 0, 0); g.globalAlpha = 1;
    return;
  }
  if (type === 'flash' || type === 'black') {
    drawScene(u < .5 ? A : B, g, s);
    const k = u < .5 ? E.in2(u * 2) : 1 - E.out2((u - .5) * 2);
    g.fillStyle = type === 'flash' ? `rgba(255,248,240,${k})` : `rgba(4,4,12,${k})`; g.fillRect(0, 0, W, H);
    if (type === 'flash') glow(g, W / 2, H / 2, 1400 * k, '#FFE8F4', k * .6);
    return;
  }
  if (type === 'zoom') {            // 镜头冲进去：A 放大、变糊，B 从放大处缩回来
    both();
    const cx = tr.cx ?? W / 2, cy = tr.cy ?? H / 2;
    const za = 1 + E.in(Math.min(1, u * 1.6)) * (tr.zoom ?? 3), zb = 1 + (1 - E.out(clamp((u - .35) / .65))) * .5;
    g.save(); g.translate(cx, cy); g.scale(za, za); g.translate(-cx, -cy);
    if (u > .2) g.filter = `blur(${((u - .2) * 18).toFixed(1)}px)`;
    g.drawImage(bufA, 0, 0); g.restore(); g.filter = 'none';
    const ab = clamp((u - .3) / .4);
    g.save(); g.globalAlpha = ab; g.translate(W / 2, H / 2); g.scale(zb, zb); g.translate(-W / 2, -H / 2);
    if (u < .7) g.filter = `blur(${((.7 - u) * 16).toFixed(1)}px)`;
    g.drawImage(bufB, 0, 0); g.restore(); g.filter = 'none';
    const f = Math.sin(Math.PI * u); g.fillStyle = `rgba(255,250,255,${f * (tr.flash ?? .25)})`; g.fillRect(0, 0, W, H);
    return;
  }
  if (type === 'whip' || type === 'whipV') {  // 甩镜头，带运动模糊
    both();
    const e = E.io(u), dx = type === 'whip' ? (tr.dir ?? 1) : 0, dy = type === 'whipV' ? (tr.dir ?? 1) : 0;
    const L = type === 'whip' ? W : H;
    const off = -L * e, blur = Math.sin(Math.PI * u);
    g.fillStyle = '#000'; g.fillRect(0, 0, W, H);
    for (let k = 5; k >= 0; k--) {
      const o = k * 46 * blur;
      g.globalAlpha = k ? .16 : 1;
      g.drawImage(bufA, dx * (off - o), dy * (off - o)); g.drawImage(bufB, dx * (off + L - o), dy * (off + L - o));
    }
    g.globalAlpha = 1;
    return;
  }
  if (type === 'cloud') {           // 飞进云里再出来：云片从一边扫过，盖住切点
    drawScene(u < .5 ? A : B, g, s);
    const pal = tr.pal || CLOUD.nightL;
    const cover = Math.sin(Math.PI * u);
    g.fillStyle = rgba(pal[1], cover * .85); g.fillRect(0, 0, W, H);
    for (let i = 0; i < 14; i++) {
      const rs = hash(i, 77), y = (i / 14) * H * 1.1 - 60 + (hash(i, 78) - .5) * 120, w = 900 + rs * 700;
      const x = W + w / 2 - (u * 1.25 + rs * .2) * (W + w * 1.4);
      cloud(g, i, x, y, w, pal, clamp(cover * 1.6));
    }
    return;
  }
  if (type === 'iris') {
    drawScene(u < .5 ? A : B, g, s);
    const cx = tr.cx ?? W / 2, cy = tr.cy ?? H / 2, rmax = 1250;
    const r = u < .5 ? rmax * (1 - E.in(u * 2)) : rmax * E.out((u - .5) * 2);
    g.save(); g.beginPath(); g.rect(0, 0, W, H); g.arc(cx, cy, Math.max(r, 0), 0, TAU, true); g.fillStyle = tr.col || '#05050F'; g.fill('evenodd'); g.restore();
    return;
  }
  if (type === 'ripple') {          // 水波：两张图交叉，横条按正弦错开
    both();
    const amp = Math.sin(Math.PI * u) * 38, e = E.sine(u);
    for (let y = 0; y < H; y += 12) {
      const dx = Math.sin(y * .035 + u * 18) * amp;
      g.globalAlpha = 1; g.drawImage(bufA, 0, y, W, 12, dx, y, W, 12);
      g.globalAlpha = e; g.drawImage(bufB, 0, y, W, 12, -dx, y, W, 12);
    }
    g.globalAlpha = 1;
    const f = Math.sin(Math.PI * u) * .25; g.fillStyle = `rgba(220,240,255,${f})`; g.fillRect(0, 0, W, H);
    return;
  }
  if (type === 'glitch') {          // 倒带、时间：错位的横条 + 红蓝分离
    both();
    const src = u < .5 ? bufA : bufB, k = Math.sin(Math.PI * u);
    g.drawImage(src, 0, 0);
    for (let i = 0; i < 18; i++) {
      const y = Math.floor(hash(i, Math.floor(s * 30)) * H), h = 8 + hash(i, 3, Math.floor(s * 30)) * 60, dx = (hash(i, 5, Math.floor(s * 30)) - .5) * 160 * k;
      g.drawImage(src, 0, y, W, h, dx, y, W, h);
    }
    g.globalCompositeOperation = 'lighter'; g.globalAlpha = .35 * k;
    g.drawImage(tint(src, '#FF2A6A'), 14 * k, 0); g.drawImage(tint(src, '#2AD8FF'), -14 * k, 0);
    g.globalAlpha = 1; g.globalCompositeOperation = 'source-over';
    return;
  }
  if (type === 'leak') {            // 胶片漏光：暖色光从一边扫过
    both();
    g.drawImage(bufA, 0, 0); g.globalAlpha = E.sine(u); g.drawImage(bufB, 0, 0); g.globalAlpha = 1;
    const k = Math.sin(Math.PI * u), x = lerp(-400, W + 400, u);
    g.save(); g.globalCompositeOperation = 'screen';
    g.fillStyle = rgrad(g, x, H * .4, 0, 1100, [[0, `rgba(255,190,120,${.95 * k})`], [.4, `rgba(255,120,110,${.5 * k})`], [1, 'rgba(255,100,120,0)']]); g.fillRect(0, 0, W, H);
    g.restore();
    return;
  }
  if (type === 'slideUp') {         // 往上推（镜头往下沉）
    both();
    const e = E.io(u);
    g.drawImage(bufA, 0, -H * e * (tr.dir ?? 1)); g.drawImage(bufB, 0, H * (1 - e) * (tr.dir ?? 1));
    return;
  }
  drawScene(u < .5 ? A : B, g, s);
}
/* 整张图染成一个颜色（红蓝分离用） */
function tint(src, col) {
  gT.setTransform(1, 0, 0, 1, 0, 0); gT.globalCompositeOperation = 'copy'; gT.drawImage(src, 0, 0);
  gT.globalCompositeOperation = 'multiply'; gT.fillStyle = col; gT.fillRect(0, 0, W, H); gT.globalCompositeOperation = 'source-over';
  return bufT;
}

/* ---------------- 后期 ---------------- */
const small1 = mk(480, 270), small2 = mk(480, 270), gs1 = small1.getContext('2d'), gs2 = small2.getContext('2d');
/* 柔光：亮的地方往外晕开。k 强度，th 门槛（越大越只晕最亮的） */
function bloom(g, src, k = .5, th = .5) {
  if (k <= .01) return;
  gs1.setTransform(1, 0, 0, 1, 0, 0); gs1.globalCompositeOperation = 'copy';
  gs1.filter = `brightness(${(1 - th * .55).toFixed(2)}) contrast(${(1 + th * 2.2).toFixed(2)})`;
  gs1.drawImage(src, 0, 0, 480, 270); gs1.filter = 'none';
  gs2.setTransform(1, 0, 0, 1, 0, 0); gs2.globalCompositeOperation = 'copy'; gs2.filter = 'blur(7px)'; gs2.drawImage(small1, 0, 0); gs2.filter = 'none';
  gs2.globalCompositeOperation = 'lighter'; gs2.filter = 'blur(2px)'; gs2.drawImage(small1, 0, 0); gs2.filter = 'none'; gs2.globalCompositeOperation = 'source-over';
  g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = k; g.imageSmoothingQuality = 'high';
  g.drawImage(small2, 0, 0, W, H); g.restore();
}

/* ---------------- 歌词 ----------------
   底部居中，霞鹜文楷。整句先淡淡地出来，唱到哪个字，哪个字亮起来、往上轻轻一跳，带一点夏天傍晚的暖光。 */
const LYR_Y = 984, LYR_PX = 54, LYR_LS = 5;
const LYR_COL = '#FFD08A';
const LYR_HIDE = [];                   // 某些时段不显示歌词（比如片头大字），[开始, 结束]
function lyricsAt(s) {
  const out = [];
  for (let i = 0; i < LYRICS.length; i++) {
    const L = LYRICS[i], c0 = L.chars[0][1], cN = L.chars[L.chars.length - 1];
    const next = LYRICS[i + 1];
    const a = c0 - .32;
    let b = Math.max(cN[1] + .9, cN[2] + .3);
    if (next) b = Math.min(b, next.chars[0][1] - .5);
    if (s >= a - .01 && s <= b + .3) out.push({ L, a, b });
  }
  return out;
}
function drawLyrics(g, s) {
  if (LYR_HIDE.some(([a, b]) => s >= a && s <= b)) return;
  for (const { L, a, b } of lyricsAt(s)) {
    const fin = clamp((s - a) / .25), fout = clamp((b + .25 - s) / .25);
    const vis = Math.min(fin, fout);
    if (vis <= 0) continue;
    const chars = L.chars, col = LYR_COL;
    // 排版：中文按字排开，空格是一个半字的空
    const items = []; let x = 0;
    const txt = L.text;
    let ci = 0;
    for (const ch of txt) {
      if (ch === ' ') { x += LYR_PX * .7; continue; }
      items.push({ ch, x, t: chars[ci][1] }); ci++;
      x += LYR_PX + LYR_LS;
    }
    const wid = x - LYR_LS, x0 = W / 2 - wid / 2 + LYR_PX / 2;
    const yo = (1 - E.out(fin)) * 16 - (1 - fout) * 26;
    g.save();
    g.globalAlpha = vis;
    // 底下垫一条很淡的暗带，亮背景上也看得清
    g.fillStyle = rgrad(g, W / 2, LYR_Y, 10, wid * .62 + 60, [[0, 'rgba(10,8,30,.30)'], [1, 'rgba(10,8,30,0)']]);
    g.save(); g.translate(W / 2, LYR_Y); g.scale(1, .16); g.beginPath(); g.arc(0, 0, wid * .62 + 60, 0, TAU); g.restore(); g.fill();
    g.font = F(LYR_PX, 'kai'); g.textAlign = 'center'; g.textBaseline = 'middle';
    for (const it of items) {
      const lit = clamp((s - it.t + .04) / .16);
      const pop = it.t <= s ? Math.exp(-(s - it.t) * 7) : 0;
      const y = LYR_Y + yo - pop * 6;
      const cx = x0 + it.x;
      // 发光
      if (lit > 0) { g.save(); g.shadowColor = col; g.shadowBlur = 18 + pop * 16; g.globalAlpha = vis * lit * .85; g.fillStyle = col; g.fillText(it.ch, cx, y); g.restore(); }
      g.save();
      g.shadowColor = 'rgba(0,0,10,.55)'; g.shadowBlur = 8; g.shadowOffsetY = 2;
      g.globalAlpha = vis * (.38 + .62 * lit);
      g.fillStyle = lit > 0 ? mixc('#D8D4E8', '#FFFFFF', lit) : '#D8D4E8';
      g.fillText(it.ch, cx, y);
      g.restore();
    }
    g.restore();
  }
}

/* ---------------- 水印 ---------------- */
function overlays(g, s) {
  if (s < CARD_AT - .2) text(g, '甜菜', 1888, 46, 30, { k: 'kai', align: 'right', col: 'rgba(255,255,255,.66)', shadow: 'rgba(0,0,0,.4)', sblur: 6, ls: 2 });
}

/* ---------------- 逐帧入口 ---------------- */
const main = mk(), gM = main.getContext('2d');
const GRADE = 'saturate(1.14) contrast(1.06)';      // 默认调色：夏天的颜色浓一点
function frame(T) {
  const s = T + TRIM;
  const sc = composite(gM, s);
  const g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  // 调色（每个镜头自己定：CSS 滤镜）
  const grade = sc && sc.grade !== undefined ? sc.grade : GRADE;
  if (grade) g.filter = typeof grade === 'function' ? grade(s) : grade;
  g.drawImage(main, 0, 0); g.filter = 'none';
  // 柔光
  const bl = sc && sc.bloom != null ? (typeof sc.bloom === 'function' ? sc.bloom(s) : sc.bloom) : .2;
  bloom(g, main, bl, .62);
  // 暗角、颗粒
  g.drawImage(TEX.vig, 0, 0);
  g.globalCompositeOperation = 'soft-light'; g.globalAlpha = .22; g.drawImage(TEX.grain, 0, 0, W, H);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  if (!window.NO_LYRICS) drawLyrics(g, s);
  if (sc && sc.over) sc.over(g, s, s - sc.a);
  overlays(g, s);
  // 结尾淡出（开头不淡入：第一帧就要看得清大字）
  const fo = seg(s, S_END - .5, S_END);
  if (fo > 0) { g.fillStyle = `rgba(0,0,0,${fo})`; g.fillRect(0, 0, W, H); }
}
/* 封面：见 scenes6.js 的 drawCoverArt（她在教室里回头笑，大字片名和问话） */
window.drawCover = function (s) { if (typeof drawCoverArt === 'function') drawCoverArt(s); else frame(s - TRIM); };
window.frame = frame;
window.READY = false;
window.DURATION = DURATION;
Promise.all([['WenKaiM', '起风了'], ['WenKaiR', '起风了'], ['SerifB', '清溪'], ['SerifX', '清溪第一中学'], ['SansM', '清溪站'], ['LongCang', '我喜欢你'], ['ZhiMang', '起风了']]
  .map(([f, s]) => document.fonts.load(`60px "${f}"`, s))).then(() => {
  buildTextures();
  if (typeof buildWorld === 'function') buildWorld();
  buildScenes();
  frame(0);
  window.READY = true;
});
