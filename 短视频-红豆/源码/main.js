'use strict';
/* main.js：镜头表、转场、歌词、水印、片尾字、整体后期（柔光、调色、暗角、颗粒）、逐帧入口 frame(T)。
   视频时间 T = 歌曲时间 s（开头 0.43 秒静音不剪：第一帧就有画面在动，前奏马上就起）。成片和歌一样长，不另加片尾卡。 */
const DURATION = SONG_DUR;

/* 歌词时间：第 k 句（从 0 数）第一个字开口 / 第 i 个字 / 最后一个字唱完 */
const Lt = k => LYRICS[k].chars[0][1];
const Lc = (k, i) => LYRICS[k].chars[Math.min(i, LYRICS[k].chars.length - 1)][1];
const Le = k => LYRICS[k].chars[LYRICS[k].chars.length - 1][2];
/* 镜头一般在这句开口前 0.3 秒切进来 */
const CUT = k => Lt(k) - .3;

function buildScenes() {
  SCENES.length = 0;
  SCENES_DEF.forEach(f => f());
  SCENES.sort((x, y) => x.a - y.a);
  SCENES.forEach((sc, i) => { sc.b = i + 1 < SCENES.length ? SCENES[i + 1].a : DURATION + 1; });
}

/* ---------------- 合成与转场 ---------------- */
const bufA = mk(), bufB = mk(), gA = bufA.getContext('2d'), gB = bufB.getContext('2d');
const bufT = mk(), gT = bufT.getContext('2d');
function drawScene(sc, g, s) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  g.fillStyle = '#0B0A12'; g.fillRect(0, 0, W, H);
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
    g.fillStyle = type === 'flash' ? `rgba(255,246,238,${k})` : `rgba(6,5,12,${k})`; g.fillRect(0, 0, W, H);
    if (type === 'flash') glow(g, W / 2, H / 2, 1400 * k, '#FFE4E8', k * .5);
    return;
  }
  if (type === 'zoom') {            // 冲进去：A 放大、变糊，B 从放大处缩回来
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
    const f = Math.sin(Math.PI * u); g.fillStyle = `rgba(255,250,250,${f * (tr.flash ?? .2)})`; g.fillRect(0, 0, W, H);
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
  if (type === 'iris') {
    drawScene(u < .5 ? A : B, g, s);
    const cx = tr.cx ?? W / 2, cy = tr.cy ?? H / 2, rmax = 1250;
    const r = u < .5 ? rmax * (1 - E.in(u * 2)) : rmax * E.out((u - .5) * 2);
    g.save(); g.beginPath(); g.rect(0, 0, W, H); g.arc(cx, cy, Math.max(r, 0), 0, TAU, true); g.fillStyle = tr.col || '#0B0A12'; g.fill('evenodd'); g.restore();
    return;
  }
  if (type === 'bean') {            // 红豆形的口子从一点张开，里面是下一个镜头；口子边上一圈红光
    both();
    g.drawImage(bufA, 0, 0);
    const cx = tr.cx ?? W / 2, cy = tr.cy ?? H / 2, e = E.io(u), rot = tr.rot ?? -.5;
    const R0 = 1500 * e;
    if (R0 > 1) {
      g.save(); g.translate(cx, cy); g.rotate(rot + u * .6); g.beginPath(); g.ellipse(0, 0, R0, R0 * .72, 0, 0, TAU); g.restore();
      g.save(); g.clip(); g.drawImage(bufB, 0, 0); g.restore();
      g.save(); g.translate(cx, cy); g.rotate(rot + u * .6); g.strokeStyle = rgba(RED, .9 * (1 - e)); g.lineWidth = 26 * (1 - e) + 2; g.shadowColor = RED_L; g.shadowBlur = 40;
      g.beginPath(); g.ellipse(0, 0, R0, R0 * .72, 0, 0, TAU); g.stroke(); g.restore();
    }
    return;
  }
  if (type === 'ripple') {          // 水波：两张图交叉，横条按正弦错开
    both();
    const amp = Math.sin(Math.PI * u) * 34, e = E.sine(u);
    for (let y = 0; y < H; y += 12) {
      const dx = Math.sin(y * .035 + u * 18) * amp;
      g.globalAlpha = 1; g.drawImage(bufA, 0, y, W, 12, dx, y, W, 12);
      g.globalAlpha = e; g.drawImage(bufB, 0, y, W, 12, -dx, y, W, 12);
    }
    g.globalAlpha = 1;
    const f = Math.sin(Math.PI * u) * .22; g.fillStyle = `rgba(230,240,255,${f})`; g.fillRect(0, 0, W, H);
    return;
  }
  if (type === 'leak') {            // 胶片漏光：暖色光从一边扫过
    both();
    g.drawImage(bufA, 0, 0); g.globalAlpha = E.sine(u); g.drawImage(bufB, 0, 0); g.globalAlpha = 1;
    const k = Math.sin(Math.PI * u), x = lerp(-400, W + 400, tr.dir === -1 ? 1 - u : u);
    g.save(); g.globalCompositeOperation = 'screen';
    g.fillStyle = rgrad(g, x, H * .4, 0, 1100, [[0, `rgba(255,196,140,${.95 * k})`], [.4, `rgba(255,110,100,${.5 * k})`], [1, 'rgba(255,90,100,0)']]); g.fillRect(0, 0, W, H);
    g.restore();
    return;
  }
  if (type === 'slide' || type === 'slideUp') {   // 推：B 把 A 推出去
    both();
    const e = E.io(u), d = tr.dir ?? 1;
    if (type === 'slide') { g.drawImage(bufA, -W * e * d, 0); g.drawImage(bufB, W * (1 - e) * d, 0); }
    else { g.drawImage(bufA, 0, -H * e * d); g.drawImage(bufB, 0, H * (1 - e) * d); }
    return;
  }
  if (type === 'blinds') {          // 百叶窗：一条一条翻过去
    both();
    g.drawImage(bufA, 0, 0);
    const n = 12, hh = H / n;
    for (let i = 0; i < n; i++) {
      const k = E.io(clamp(u * 1.6 - i / n * .6));
      if (k <= 0) continue;
      const h = hh * k;
      g.drawImage(bufB, 0, i * hh + (hh - h) / 2, W, h, 0, i * hh + (hh - h) / 2, W, h);
    }
    return;
  }
  if (type === 'spin') {            // 转着推进去
    both();
    const e = E.io(u), a = (tr.dir ?? 1) * (e < .5 ? E.in2(e * 2) : -(1 - E.out2((e - .5) * 2))) * .35;
    const src = u < .5 ? bufA : bufB, z = u < .5 ? 1 + E.in2(u * 2) * .9 : 1 + (1 - E.out2((u - .5) * 2)) * .9;
    g.save(); g.translate(W / 2, H / 2); g.rotate(a); g.scale(z, z); g.translate(-W / 2, -H / 2);
    g.filter = `blur(${(Math.sin(Math.PI * u) * 10).toFixed(1)}px)`; g.drawImage(src, 0, 0); g.restore(); g.filter = 'none';
    return;
  }
  if (type === 'burn') {            // 胶片烧穿：白热的斑从中间化开
    both();
    g.drawImage(u < .5 ? bufA : bufB, 0, 0);
    const k = Math.sin(Math.PI * u);
    g.save(); g.globalCompositeOperation = 'screen';
    for (let i = 0; i < 5; i++) {
      const x = W * (.2 + hash(i, 3) * .6), y = H * (.2 + hash(i, 4) * .6);
      g.fillStyle = rgrad(g, x, y, 0, 300 + 900 * k, [[0, `rgba(255,240,220,${k})`], [.3, `rgba(255,150,90,${.8 * k})`], [1, 'rgba(255,60,60,0)']]); g.fillRect(0, 0, W, H);
    }
    g.restore();
    return;
  }
  drawScene(u < .5 ? A : B, g, s);
}

/* ---------------- 后期 ---------------- */
const small1 = mk(480, 270), small2 = mk(480, 270), gs1 = small1.getContext('2d'), gs2 = small2.getContext('2d');
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
   底部居中，思源宋体。整句淡淡地出来，唱到哪个字，哪个字亮起来；一颗小红豆在正在唱的字上面一跳一跳。
   上一句提前淡出、往上走，下一句从下面淡进来（交棒时刻 = max(下一句第一个字 − 0.3, 上一句最后一个字 + 0.3)）。 */
const LYR_Y = 990, LYR_PX = 50, LYR_LS = 8;
const LYR_HIDE = [];                   // 某些时段不显示歌词，[开始, 结束]
function lyricWindows() {
  // 每句：a 开始淡入（0.3 秒淡完），b 开始淡出（0.3 秒淡完）。上一句淡完了下一句才进来，两句不叠在一起
  const out = [];
  for (let i = 0; i < LYRICS.length; i++) {
    const L = LYRICS[i], c0 = L.chars[0][1], cN = L.chars[L.chars.length - 1], next = LYRICS[i + 1];
    let a = c0 - .4;
    if (out.length) a = Math.max(a, out[out.length - 1].b + .3);
    let b = Math.max(cN[2] + .15, cN[1] + 1.0);
    if (next) b = Math.max(Math.min(b, next.chars[0][1] - .62), cN[1] + .25);
    out.push({ L, a, b });
  }
  return out;
}
let LYRW = null;
function drawLyrics(g, s) {
  if (LYR_HIDE.some(([a, b]) => s >= a && s <= b)) return;
  if (!LYRW) LYRW = lyricWindows();
  for (const { L, a, b } of LYRW) {
    if (s < a - .05 || s > b + .4) continue;
    const fin = clamp((s - a) / .3), fout = clamp((b + .3 - s) / .3);
    const vis = Math.min(fin, fout);
    if (vis <= 0) continue;
    const chars = L.chars;
    const items = []; let x = 0, ci = 0;
    for (const ch of L.text) {
      if (ch === ' ') { x += LYR_PX * .8; continue; }
      items.push({ ch, x, t: chars[ci][1], e: chars[ci][2] }); ci++;
      x += LYR_PX + LYR_LS;
    }
    const wid = x - LYR_LS, x0 = W / 2 - wid / 2 + LYR_PX / 2;
    const yo = (1 - E.out(fin)) * 18 - (1 - fout) * 24;
    g.save();
    g.globalAlpha = vis;
    // 字底下垫一条很淡的暗带
    g.fillStyle = rgrad(g, W / 2, LYR_Y, 10, wid * .62 + 80, [[0, 'rgba(12,8,16,.34)'], [1, 'rgba(12,8,16,0)']]);
    g.save(); g.translate(W / 2, LYR_Y + 4); g.scale(1, .17); g.beginPath(); g.arc(0, 0, wid * .62 + 80, 0, TAU); g.restore(); g.fill();
    g.font = F(LYR_PX, 'serif'); g.textAlign = 'center'; g.textBaseline = 'middle';
    let cur = -1;
    for (let i = 0; i < items.length; i++) if (s >= items[i].t - .02) cur = i;
    for (const it of items) {
      const lit = clamp((s - it.t + .05) / .18);
      const y = LYR_Y + yo;
      const cx = x0 + it.x;
      if (lit > 0) { g.save(); g.shadowColor = 'rgba(255,190,190,.9)'; g.shadowBlur = 16; g.globalAlpha = vis * lit * .55; g.fillStyle = '#FFE9E4'; g.fillText(it.ch, cx, y); g.restore(); }
      g.save();
      g.shadowColor = 'rgba(0,0,8,.6)'; g.shadowBlur = 8; g.shadowOffsetY = 2;
      g.globalAlpha = vis * (.42 + .58 * lit);
      g.fillStyle = lit > 0 ? mixc('#DCD6D2', '#FFFFFF', lit) : '#DCD6D2';
      g.fillText(it.ch, cx, y);
      g.restore();
    }
    // 跳动的小红豆：从上一个字跳到这个字上面
    if (cur >= 0 && s < b + .1) {
      const it = items[cur], prev = items[Math.max(0, cur - 1)];
      const hop = clamp((s - it.t + .06) / .22);
      const bx = lerp(x0 + (cur ? prev.x : it.x - 40), x0 + it.x, E.out2(hop));
      const by = LYR_Y + yo - LYR_PX * .78 - Math.sin(Math.PI * hop) * 18;
      const ba = clamp((b + .1 - s) / .25) * clamp((s - it.t + .3) / .2);
      withAlpha(g, ba * vis, () => bean(g, bx, by, 9, -.3 + Math.sin(s * 3) * .15));
    }
    g.restore();
  }
}

/* ---------------- 水印、片尾字 ---------------- */
const CREDIT_AT = 226.2;               // 尾奏最后一次起伏（222~229 秒）的中间，片尾字淡进来
function overlays(g, s) {
  text(g, '甜菜', 1886, 48, 30, { k: 'serif', align: 'right', col: 'rgba(255,255,255,.7)', shadow: 'rgba(0,0,0,.45)', sblur: 6, ls: 3 });
  const ca = seg(s, CREDIT_AT, CREDIT_AT + 1.2);
  if (ca > 0) {
    withAlpha(g, E.out(ca), () => {
      // 字底下垫一层淡淡的暗带（后面是雪里的树，小字会和雪团叠在一起）
      g.fillStyle = rgrad(g, W / 2, 920, 20, 520, [[0, 'rgba(8,8,24,.55)'], [1, 'rgba(8,8,24,0)']]);
      g.save(); g.translate(W / 2, 920); g.scale(1, .3); g.beginPath(); g.arc(0, 0, 520, 0, TAU); g.restore(); g.fill();
      text(g, '甜菜 出品', W / 2, 860, 46, { k: 'serifB', col: '#FFF6EE', shadow: 'rgba(0,0,0,.55)', sblur: 10, ls: 10 });
      text(g, '歌曲《红豆》 演唱：方大同　词：林夕　曲：柳重言', W / 2, 930, 26, { k: 'serif', col: 'rgba(255,246,238,.85)', shadow: 'rgba(0,0,0,.5)', sblur: 6, ls: 2 });
      text(g, '画面、动画：Claude 用代码生成', W / 2, 972, 24, { k: 'serif', col: 'rgba(255,246,238,.75)', shadow: 'rgba(0,0,0,.5)', sblur: 6, ls: 2 });
    });
  }
}

/* ---------------- 逐帧入口 ---------------- */
const main = mk(), gM = main.getContext('2d');
const GRADE = 'saturate(1.04) contrast(1.04)';
function frame(T) {
  const s = T;
  const sc = composite(gM, s);
  const g = ctx;
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  const grade = sc && sc.grade !== undefined ? sc.grade : GRADE;
  if (grade) g.filter = typeof grade === 'function' ? grade(s) : grade;
  g.drawImage(main, 0, 0); g.filter = 'none';
  const bl = sc && sc.bloom != null ? (typeof sc.bloom === 'function' ? sc.bloom(s) : sc.bloom) : .22;
  bloom(g, main, bl, .6);
  g.drawImage(TEX.vig, 0, 0);
  // 纸纹 + 颗粒：绘本的质感
  g.globalCompositeOperation = 'soft-light'; g.globalAlpha = .2; g.drawImage(TEX.grain, 0, 0, W, H);
  g.globalAlpha = .1; g.drawImage(TEX.paperBig, 0, 0, W, H);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = 1;
  if (sc && sc.over) sc.over(g, s, s - sc.a);
  if (!window.NO_LYRICS) drawLyrics(g, s);
  overlays(g, s);
  const fo = seg(s, DURATION - 1.4, DURATION - .05);
  if (fo > 0) { g.fillStyle = `rgba(0,0,0,${E.sine(fo)})`; g.fillRect(0, 0, W, H); }
}
window.drawCover = function (s) { if (typeof drawCoverArt === 'function') drawCoverArt(s); else frame(s); };
window.frame = frame;
window.READY = false;
window.DURATION = DURATION;
Promise.all([['SerifM', '红豆还没好好的感受'], ['SerifB', '甜菜出品'], ['MaShan', '红豆'], ['LongCang', '一起看一场雪']]
  .map(([f, s]) => document.fonts.load(`60px "${f}"`, s))).then(() => {
  buildTextures();
  // 纸纹（大张，叠在整个画面上）
  TEX.paperBig = noiseCanvas(480, 270, (x, y) => { const n = fbm(x / 6, y / 6, 4, 91), m = fbm(x / 40, y / 40, 3, 92); const v = 128 + (n - .5) * 70 + (m - .5) * 50; return [v, v, v, 255]; });
  if (typeof buildWorld === 'function') buildWorld();
  buildScenes();
  frame(0);
  window.READY = true;
});
