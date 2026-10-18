// main.js — 镜头表、转场、歌词、水印、片尾卡、逐帧入口 frame(T)。
// 镜头函数的写法：fn(g, t, d, ts)：t 是这个镜头里的时间（秒，转场时可以是负数或超过 d），d 是镜头长度，ts 是歌曲时间。

const SHOTS = [];      // {id, t0, fn, tin:{type, d}}，按 t0 排好；t0 是歌曲时间
function shot(id, t0, fn, tin) { SHOTS.push({ id, t0, fn, tin: tin || { type: 'cut', d: 0 } }); }

// ---------------- 摄像机 ----------------
// 世界坐标 (x, y) 放到屏幕中心，放大 z 倍，转 rot 度
function cam(g, x, y, z = 1, rot = 0) {
  g.setTransform(1, 0, 0, 1, 0, 0);
  g.translate(W / 2, H / 2);
  if (rot) g.rotate(R(rot));
  g.scale(z, z);
  g.translate(-x, -y);
}
function camReset(g) { g.setTransform(1, 0, 0, 1, 0, 0); }

// ---------------- 画布 ----------------
let MAIN, BUF_A, BUF_B, BUF_T, BUF_F, LUMC;
function initCanvases() {
  MAIN = document.getElementById('c');
  BUF_A = mk(W, H); BUF_B = mk(W, H); BUF_T = mk(W, H); BUF_F = mk(W, H); LUMC = mk(48, 6);
}

// ---------------- 转场 ----------------
// u: 0→1；A 是上一个镜头，B 是下一个
const TRANS = {
  fade(g, A, B, u) { g.drawImage(A, 0, 0); g.globalAlpha = ease(u); g.drawImage(B, 0, 0); g.globalAlpha = 1; },
  // 揉开：上一个镜头糊掉、淡出
  smudge(g, A, B, u) {
    g.drawImage(B, 0, 0);
    g.save(); g.globalAlpha = 1 - ease(u); g.filter = `blur(${(u * 14).toFixed(1)}px)`; g.drawImage(A, 0, 0); g.restore();
  },
  // 回到白纸再画出来：先褪成纸，再从纸上浮现
  paper(g, A, B, u) {
    if (u < 0.5) { g.drawImage(A, 0, 0); g.globalAlpha = ease(u * 2); g.drawImage(paperCanvas, 0, 0); }
    else { g.drawImage(B, 0, 0); g.globalAlpha = 1 - ease((u - 0.5) * 2); g.drawImage(paperCanvas, 0, 0); }
    g.globalAlpha = 1;
  },
  black(g, A, B, u) {
    g.drawImage(u < 0.5 ? A : B, 0, 0);
    g.fillStyle = `rgba(14,13,16,${(1 - Math.abs(u - 0.5) * 2).toFixed(3)})`; g.fillRect(0, 0, W, H);
  },
  // 翻页：右下角翘起来、往左上翻过去，露出下一页（纸背是空白的）
  page(g, A, B, u) { pageCurl(g, A, B, ease(u), false); },
  pageBack(g, A, B, u) { pageCurl(g, B, A, 1 - ease(u), true); },
  // 橡皮擦：从左往右擦掉，擦过的地方露出下一个镜头，边上掉橡皮屑
  erase(g, A, B, u) {
    g.drawImage(B, 0, 0);
    const T_ = BUF_T.getContext('2d');
    T_.setTransform(1, 0, 0, 1, 0, 0); T_.clearRect(0, 0, W, H); T_.globalCompositeOperation = 'source-over'; T_.drawImage(A, 0, 0);
    T_.globalCompositeOperation = 'destination-out';
    const x = lerp(-200, W + 200, ease(u));
    T_.beginPath(); T_.moveTo(-10, -10);
    for (let y = -10; y <= H + 10; y += 20) T_.lineTo(x + (n1(y / 60, 5) - 0.5) * 180 + Math.sin(y / 37) * 30, y);
    T_.lineTo(-10, H + 10); T_.closePath(); T_.fill();
    T_.globalCompositeOperation = 'source-over';
    g.drawImage(BUF_T, 0, 0);
    // 橡皮屑
    g.save();
    for (let i = 0; i < 40; i++) {
      const y = hash(i, 3) * H, xx = x + (n1(y / 60, 5) - 0.5) * 180 + Math.sin(y / 37) * 30 - hash(i, 4) * 60;
      g.fillStyle = rgba([120, 116, 110], 0.5); g.beginPath(); g.ellipse(xx, y + hash(i, 5) * 20, 3 + hash(i, 6) * 5, 2, hash(i, 7) * 3, 0, 6.283); g.fill();
    }
    g.restore();
  },
  // 光圈：圈子缩到黑，再从黑里张开
  iris(g, A, B, u, o = {}) {
    const cx = o.cx ?? W / 2, cy = o.cy ?? H / 2, M = Math.hypot(W, H) * 0.62;
    const src = u < 0.5 ? A : B, r = u < 0.5 ? lerp(M, 0, ease(u * 2)) : lerp(0, M, ease((u - 0.5) * 2));
    g.fillStyle = '#0e0d10'; g.fillRect(0, 0, W, H);
    g.save(); g.beginPath(); g.arc(cx, cy, Math.max(0.1, r), 0, 6.283); g.clip(); g.drawImage(src, 0, 0); g.restore();
  },
  // 往左推
  push(g, A, B, u) { const e = ease(u); g.drawImage(A, -e * W, 0); g.drawImage(B, W - e * W, 0); },
  pushUp(g, A, B, u) { const e = ease(u); g.drawImage(A, 0, -e * H); g.drawImage(B, 0, H - e * H); },
  // 闪成纸白
  flash(g, A, B, u) {
    g.drawImage(u < 0.5 ? A : B, 0, 0);
    g.globalAlpha = Math.pow(1 - Math.abs(u - 0.5) * 2, 1.5); g.drawImage(paperCanvas, 0, 0); g.globalAlpha = 1;
  },
};
function pageCurl(g, A, B, u, back) {
  // u=0：A 平放；u=1：A 完全翻走。折线垂直于从右下角往左上的方向；折线之后的部分翻过来，露出空白的纸背
  g.drawImage(B, 0, 0);
  if (u >= 0.999) return;
  const cx = W, cy = H;
  const dx = -W, dy = -H * 0.55, dl = Math.hypot(dx, dy), ux = dx / dl, uy = dy / dl;
  const s = u * 4500;
  const fx = cx + ux * s * 0.5, fy = cy + uy * s * 0.5;
  const nx = -uy, ny = ux, far = 5000;
  const poly = (sign) => { const p = new Path2D(); p.moveTo(fx + nx * far, fy + ny * far); p.lineTo(fx - nx * far, fy - ny * far); p.lineTo(fx - nx * far - ux * far * sign, fy - ny * far - uy * far * sign); p.lineTo(fx + nx * far - ux * far * sign, fy + ny * far - uy * far * sign); p.closePath(); return p; };
  const flatPart = poly(-1);
  g.save(); g.clip(flatPart);
  g.drawImage(A, 0, 0);
  g.restore();
  // 翻起来的纸在下一页上的影子
  g.save(); g.clip(poly(1));
  const sh = g.createLinearGradient(fx, fy, fx + ux * 90, fy + uy * 90);
  sh.addColorStop(0, 'rgba(40,36,30,0)'); sh.addColorStop(1, 'rgba(40,36,30,0)');
  const sh2 = g.createLinearGradient(fx, fy, fx - ux * 140, fy - uy * 140);
  g.restore();
  // 纸背：把"折线之后"的那块页面按折线镜像过来
  const e = 2 * (fx * ux + fy * uy);
  const m = new DOMMatrix([1 - 2 * ux * ux, -2 * ux * uy, -2 * ux * uy, 1 - 2 * uy * uy, e * ux, e * uy]);
  g.save();
  g.setTransform(m);
  const pg = new Path2D(); pg.rect(0, 0, W, H);
  g.clip(pg); g.clip(poly(1));
  g.setTransform(1, 0, 0, 1, 0, 0);
  // 纸背下面先投一层影子
  g.fillStyle = 'rgba(30,26,22,0.18)'; g.fillRect(0, 0, W, H);
  g.setTransform(m);
  g.drawImage(paperCanvas, 0, 0);
  g.setTransform(1, 0, 0, 1, 0, 0);
  const gr = g.createLinearGradient(fx, fy, fx - ux * 260, fy - uy * 260);
  gr.addColorStop(0, 'rgba(70,62,52,0.30)'); gr.addColorStop(0.35, 'rgba(255,250,240,0.10)'); gr.addColorStop(1, 'rgba(70,62,52,0.22)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.restore();
  // 折线边上的一笔
  g.save(); g.globalAlpha = 0.5; g.strokeStyle = 'rgba(60,56,50,0.6)'; g.lineWidth = 1.5;
  g.beginPath(); g.moveTo(fx + nx * far, fy + ny * far); g.lineTo(fx - nx * far, fy - ny * far); g.stroke(); g.restore();
}

// ---------------- 歌词 ----------------
// 一整句先用很淡的铅笔"起稿"，唱到哪个字，哪个字就被描深；唱完揉淡，往上飘走
const LYR = { x: 960, y: 978, size: 56 };
let lyrLayout = [];
function layoutLyrics() {
  const c = mk(10, 10).getContext('2d');
  c.font = `${LYR.size}px ${FONT_HAND}`;
  lyrLayout = LYRICS.map(L => {
    const chars = [...L.text];
    const sp = 3, ws = chars.map(ch => ch === ' ' ? LYR.size * 0.45 : c.measureText(ch).width + sp);
    const total = ws.reduce((a, b) => a + b, 0) - sp;
    let x = -total / 2, k = 0;
    const out = [];
    chars.forEach((ch, i) => { if (ch !== ' ') { out.push({ ch, x: x + ws[i] / 2, w: ws[i], t: L.ch[k][1], e: L.ch[k][2] }); k++; } x += ws[i]; });
    return { chars: out, width: total };
  });
}
function bgLum() {
  const c = LUMC.getContext('2d');
  c.drawImage(MAIN, 560, 930, 800, 100, 0, 0, 48, 6);
  const d = c.getImageData(0, 0, 48, 6).data; let s = 0;
  for (let i = 0; i < d.length; i += 4) s += 0.3 * d[i] + 0.59 * d[i + 1] + 0.11 * d[i + 2];
  return s / (d.length / 4);
}
function lyricWindow(i) {
  const a = lineT0(i) - 0.5;
  const nx = i + 1 < LYRICS.length ? lineT0(i + 1) - 0.55 : 1e9;
  const b = Math.min(lineT1(i) + 0.7, nx);
  return [a, b];
}
function drawLyrics(g, t) {
  let lum = -1;
  for (let i = 0; i < LYRICS.length; i++) {
    const [a, b] = lyricWindow(i);
    if (t < a - 0.01 || t > b + 0.45) continue;
    if (lum < 0) lum = bgLum();
    const vin = smooth(a, a + 0.3, t), vout = 1 - smooth(b, b + 0.45, t), v = vin * vout;
    if (v <= 0.003) continue;
    const Lo = lyrLayout[i], y = LYR.y - (1 - vout) * 14;
    g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
    // 橡皮擦出来的一条浅底：背景越暗，擦得越亮
    const bandA = clamp((205 - lum) / 110, 0.12, 0.9) * v;
    eraserBand(g, LYR.x, y, Lo.width + 150, 92, bandA);
    g.font = `${LYR.size}px ${FONT_HAND}`; g.textAlign = 'center'; g.textBaseline = 'middle';
    const gs = graphStyle(g);
    for (const c of Lo.chars) {
      const x = LYR.x + c.x;
      // 起稿
      g.globalAlpha = 0.3 * v; g.fillStyle = gs; g.fillText(c.ch, x, y);
      // 描深：从左往右 0.14 秒写出来
      const p = clamp((t - (c.t - 0.05)) / 0.14);
      if (p > 0) {
        const pop = 1 + 0.07 * Math.sin(Math.min(1, (t - c.t + 0.05) / 0.3) * Math.PI);
        g.save();
        g.beginPath(); g.rect(x - c.w / 2 - 2, y - LYR.size, (c.w + 4) * p, LYR.size * 2); g.clip();
        g.translate(x, y); g.scale(pop, pop);
        g.globalAlpha = 0.95 * v; g.fillStyle = gs; g.fillText(c.ch, 0, 0);
        g.globalAlpha = 0.28 * v; g.fillText(c.ch, 0.8, 0.6);
        g.restore();
      }
    }
    g.restore();
  }
}
// 擦出来的浅色长条：纸的纹理 + 柔边
function eraserBand(g, cx, cy, w, h, a) {
  if (a <= 0.01) return;
  const T_ = BUF_T.getContext('2d');
  const x0 = Math.max(0, cx - w / 2 - 40), y0 = Math.max(0, cy - h / 2 - 20), ww = Math.min(W - x0, w + 80), hh = Math.min(H - y0, h + 40);
  T_.setTransform(1, 0, 0, 1, 0, 0); T_.globalCompositeOperation = 'source-over'; T_.clearRect(0, 0, ww, hh);
  T_.drawImage(paperCanvas, x0, y0, ww, hh, 0, 0, ww, hh);
  T_.globalCompositeOperation = 'destination-in';
  T_.save(); T_.translate(cx - x0, cy - y0); T_.scale(w / h, 1);
  const gr = T_.createRadialGradient(0, 0, 0, 0, 0, h * 0.62);
  gr.addColorStop(0, 'rgba(0,0,0,1)'); gr.addColorStop(0.55, 'rgba(0,0,0,0.85)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
  T_.fillStyle = gr; T_.fillRect(-h, -h, 2 * h, 2 * h); T_.restore();
  T_.globalCompositeOperation = 'source-over';
  g.save(); g.globalAlpha = a; g.drawImage(BUF_T, 0, 0, ww, hh, x0, y0, ww, hh); g.restore();
}

// ---------------- 水印、片尾卡 ----------------
function watermark(g, t) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0);
  eraserBand(g, 1838, 50, 86, 52, 0.55);
  pencilText(g, '甜菜', 1838, 50, 36, { a: 0.78 });
  g.restore();
}

// ---------------- 逐帧入口 ----------------
function shotAt(ts) {
  let i = 0;
  while (i + 1 < SHOTS.length && SHOTS[i + 1].t0 <= ts) i++;
  return i;
}
function renderShot(g, i, ts) {
  const S = SHOTS[i], d = (i + 1 < SHOTS.length ? SHOTS[i + 1].t0 : SONG_END) - S.t0;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  drawPaper(g);
  withSeed(strHash(S.id), () => S.fn(g, ts - S.t0, d, ts));
  g.restore();
}
window.frame = function (T, opts = {}) {
  const ts = T + OFFSET;
  setBoil(Math.round(T * FPS));
  const g = MAIN.getContext('2d');
  g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.filter = 'none';
  const i = shotAt(ts);
  // 正在转场吗？转场窗口 [t0 - d/2, t0 + d/2]
  let tr = null;
  for (const j of [i, i + 1]) {
    if (j <= 0 || j >= SHOTS.length) continue;
    const S = SHOTS[j], d = S.tin.d || 0;
    if (S.tin.type !== 'cut' && d > 0 && ts >= S.t0 - d / 2 && ts < S.t0 + d / 2) tr = { j, u: (ts - (S.t0 - d / 2)) / d };
  }
  if (tr) {
    const ga = BUF_A.getContext('2d'), gb = BUF_B.getContext('2d');
    renderShot(ga, tr.j - 1, ts);
    renderShot(gb, tr.j, ts);
    g.save();
    const S = SHOTS[tr.j];
    TRANS[S.tin.type](g, BUF_A, BUF_B, clamp(tr.u), S.tin);
    g.restore();
  } else {
    renderShot(g, i, ts);
  }
  g.setTransform(1, 0, 0, 1, 0, 0);
  if (!opts.cover) drawLyrics(g, ts);
  if (window.overlayAfter) window.overlayAfter(g, ts, opts);
  if (!(ts > SONG_END - ENDCARD && !opts.cover)) watermark(g, ts);
  vignette(g, 0.32);
  postGrain(g, 0.45);
};

// 音效表：镜头里登记的动作时刻（歌曲时间），render.cjs sfx 导出给 mix.py
const SFX = [];
function sfx(t, name, o = {}) { SFX.push(Object.assign({ t: +t.toFixed(3), name }, o)); }
window.sfxPlan = () => SFX.slice().sort((a, b) => a.t - b.t);

const ENDCARD = 2.5;
(async () => {
  const all = LYRICS.map(l => l.text).join('') + '你有没有喜欢过一个人，从来没说出口？你没说出口的那句话，是什么？不要说话陈奕迅甜菜出品演唱词曲编曲小柯画面动画音效用代码生成配音合成海边剧场今晚演出沉默舞台剧我喜欢你我也是一二三四五六七八九十月日周';
  await document.fonts.load(`56px "Xiaolai SC"`, all);
  await document.fonts.load(`56px "Long Cang"`, '我也是喜欢你');
  makeTextures();
  initCanvases();
  layoutLyrics();
  if (window.initScenes) window.initScenes();
  window.READY = true;
})();
