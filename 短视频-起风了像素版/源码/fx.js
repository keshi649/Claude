'use strict';
/* fx.js —— 镜头表、像素风转场、粒子。
   shot(id, t0, fn, o)：镜头从歌曲时间 t0 开始，到下一个镜头的 t0 为止。fn(t, k, sh) 画在当前画布 T 上（t 全局时间，k 镜头里的时间）。
   o.tr = { type, dur, pre }：从上一个镜头转进来；pre 秒提前开始（转场的中点可以压在节拍上）。
   o.post = { bloom: [阈值, 强度], grade: {...}, vig: 暗角 }：这个镜头的后期。 */
const SHOTS = [];
function shot(id, t0, fn, o = {}) { SHOTS.push({ id, t0, fn, ...o }); }

/* ---------------- 转场：A 是上一个镜头，B 是这一个；p 0→1；结果写进 SCR ---------------- */
const TRANS = {
  cut: (A, B) => SCR.d32.set(B.d32),
  /* Bayer 抖动溶解：一格一格换过去 */
  dither: (A, B, p) => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; SCR.d32[i] = bay(x >> (TRANS._blk || 0), y >> (TRANS._blk || 0)) < p ? B.d32[i] : A.d32[i]; } },
  /* 粗格子的抖动溶解（一格 = 4×4 像素） */
  dither4: (A, B, p) => { for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x, h = hash(x >> 2, y >> 2, 77); SCR.d32[i] = (h * .7 + bay(x >> 2, y >> 2) * .3) < p ? B.d32[i] : A.d32[i]; } },
  /* 马赛克：前一半 A 越来越粗，后一半 B 由粗变细 */
  mosaic: (A, B, p) => {
    const src = p < .5 ? A : B, q = p < .5 ? p * 2 : (1 - p) * 2, bs = Math.max(1, Math.round(1 + q * q * 23));
    for (let y = 0; y < H; y += bs) for (let x = 0; x < W; x += bs) {
      const c = src.d32[Math.min(H - 1, y + (bs >> 1)) * W + Math.min(W - 1, x + (bs >> 1))];
      for (let yy = y; yy < Math.min(H, y + bs); yy++) SCR.d32.fill(c, yy * W + x, yy * W + Math.min(W, x + bs));
    }
  },
  /* 闪白：亮度分 6 级跳上去再跳下来，中点换镜头 */
  flash: (A, B, p, t, tr) => {
    const src = p < .5 ? A : B, v = Math.round((1 - Math.abs(p * 2 - 1)) ** .7 * 6) / 6, c = tr.col ?? C(0xfffbf0);
    for (let i = 0; i < W * H; i++) SCR.d32[i] = mixc(src.d32[i], c, v);
  },
  flashB: (A, B, p, t, tr) => TRANS.flash(A, B, p, t, { col: C(0x080612) }),
  /* 圆孔开合：A 收成一个圆孔，B 从圆孔里张开（cx, cy 可以指定） */
  iris: (A, B, p, t, tr) => {
    const cx = tr.cx ?? W / 2, cy = tr.cy ?? H / 2, R = Math.hypot(W, H) * .6, r = p < .5 ? R * (1 - E.in(p * 2)) : R * E.out((p - .5) * 2);
    const src = p < .5 ? A : B;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x; SCR.d32[i] = Math.hypot(x + .5 - cx, y + .5 - cy) < r ? src.d32[i] : C(0x080612); }
  },
  /* 横推：A 往左推出去，B 跟着进来（甩镜头，中间拉出横向的残影） */
  whip: (A, B, p, t, tr) => {
    const dir = tr.dir ?? -1, e = E.io3(p), off = Math.round(e * W) * dir;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const sx = x - off, i = y * W + x;
      let c = sx >= 0 && sx < W ? A.d32[y * W + sx] : B.d32[y * W + (dir < 0 ? sx - W : sx + W)];
      if (c === undefined) c = 0;
      const blur = Math.sin(p * Math.PI);                         // 中间抹一下
      if (blur > .2) { const k = Math.round(blur * 10), x2 = clamp(x + k * dir, 0, W - 1), sx2 = x2 - off; const c2 = sx2 >= 0 && sx2 < W ? A.d32[y * W + sx2] : B.d32[y * W + (dir < 0 ? sx2 - W : sx2 + W)]; if (c2 !== undefined) c = mixc(c, c2, .5); }
      SCR.d32[i] = c;
    }
  },
  /* 竖推（往上甩） */
  whipV: (A, B, p, t, tr) => {
    const dir = tr.dir ?? -1, off = Math.round(E.io3(p) * H) * dir;
    for (let y = 0; y < H; y++) { const sy = y - off; const row = sy >= 0 && sy < H ? A.d32.subarray(sy * W, sy * W + W) : B.d32.subarray((dir < 0 ? sy - H : sy + H) * W, (dir < 0 ? sy - H : sy + H) * W + W); SCR.d32.set(row, y * W); }
  },
  /* 百叶窗：一条条横条依次翻过去 */
  blinds: (A, B, p) => { const n = 9, hh = H / n; for (let y = 0; y < H; y++) { const band = Math.floor(y / hh), f = (y - band * hh) / hh, q = clamp(p * 1.6 - band * .07); const useB = f < q; SCR.d32.set((useB ? B : A).d32.subarray(y * W, y * W + W), y * W); } },
  /* 台阶擦：斜着一级一级的台阶从左往右 */
  steps: (A, B, p) => { const st = 18; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = y * W + x, edge = p * (W + H + 60) - 30 - Math.floor(y / st) * st; SCR.d32[i] = x < edge ? B.d32[i] : A.d32[i]; } },
  /* 菱形格擦：一格格菱形从左往右长大 */
  diamonds: (A, B, p) => {
    const s = 20; for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, cx = Math.floor(x / s) * s + s / 2, cy = Math.floor(y / s) * s + s / 2;
      const q = clamp(p * 2.2 - (cx / W) * 1.2), d = (Math.abs(x + .5 - cx) + Math.abs(y + .5 - cy)) / s;
      SCR.d32[i] = d < q ? B.d32[i] : A.d32[i];
    }
  },
  /* 交叉淡化（量化成 8 级，像素风） */
  fade: (A, B, p) => { const q = Math.round(p * 8) / 8; for (let i = 0; i < W * H; i++) SCR.d32[i] = q <= 0 ? A.d32[i] : q >= 1 ? B.d32[i] : mixc(A.d32[i], B.d32[i], q); },
  /* 胶片烧：从一边烧进来一片暖光，烧白了换镜头 */
  burn: (A, B, p, t, tr) => {
    const src = p < .55 ? A : B, cx = tr.cx ?? W * .85, cy = tr.cy ?? H * .2;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = y * W + x, d = Math.hypot(x - cx, (y - cy) * 1.4) / W + noise2(x * .05, y * .05 + t * 3, 9) * .08;
      const heat = clamp((1 - Math.abs(p - .55) * 2.2) * 1.6 - d * 1.2);
      let c = src.d32[i];
      if (heat > 0) { const lv = Math.round(heat * 5) / 5; c = mixc(c, heat > .8 ? C(0xfff7e8) : heat > .5 ? C(0xffc070) : C(0xe8603a), lv); }
      SCR.d32[i] = c;
    }
  },
  /* 风擦：一阵风从左往右扫过，边缘是乱的（叶子在边上飞） */
  wind: (A, B, p, t) => {
    for (let y = 0; y < H; y++) {
      const edge = (p * 1.3 - .15) * W + noise1(y * .08 + 3, 5) * 40 + noise1(y * .5, 6) * 6;
      for (let x = 0; x < W; x++) { const i = y * W + x; SCR.d32[i] = x < edge ? B.d32[i] : A.d32[i]; }
    }
    const ex = (p * 1.3 - .15) * W;
    for (let k = 0; k < 40; k++) { const y = hash(k, 1) * H, x = ex + noise1(y * .08 + 3, 5) * 40 + (hash(k, 2) - .5) * 30; withT(SCR, () => leaf(x, y, k, t, 1)); }
  },
};
/* 转场的通用入口 */
function doTrans(type, A, B, p, t, tr) { (TRANS[type] || TRANS.cut)(A, B, clamp(p), t, tr || {}); }

/* ---------------- 粒子（只依赖时间的解析式：第 i 个粒子在 t 时刻在哪） ---------------- */
/* 一片叶子 / 花瓣：2~3 格，翻转时颜色在亮面暗面之间换 */
const LEAF_COLS = [[0x6fbf4a, 0x3f8a3a], [0x9fd85a, 0x5aa040], [0xf2c14e, 0xc98a2e]];
function leaf(x, y, i, t, sz = 1, cols = null) {
  const pal = cols || LEAF_COLS, cs = pal[mod(i, pal.length)], flip = Math.sin(t * (4 + hash(i, 3) * 4) + i) > 0;
  const c = C(flip ? cs[0] : cs[1]);
  pset(x, y, c); pset(x + 1, y, c);
  if (sz > 1 || hash(i, 4) < .5) pset(x + (flip ? 1 : 0), y - 1, C(flip ? cs[1] : cs[0]));
}
/* 风里的一群叶子 / 花瓣：box = [x0, y0, x1, y1]，wind 横向速度 */
function windLeaves(t, n, box, wind = 60, seed = 1, cols = null, a = 1) {
  const [x0, y0, x1, y1] = box, w = x1 - x0, h = y1 - y0;
  for (let i = 0; i < n; i++) {
    const sp = wind * (.6 + hash(i, seed, 1) * .8), fall = 6 + hash(i, seed, 2) * 14;
    const x = x0 + mod(hash(i, seed, 3) * w + t * sp, w + 20) - 10;
    const y = y0 + mod(hash(i, seed, 4) * h + t * fall + Math.sin(t * 2 + i) * 6, h + 10) - 5;
    if (a < 1 && bay(i, 0) > a) continue;
    leaf(x, y, i + seed * 31, t, 1, cols);
  }
}
/* 风的流线：一道道细白线往右飞 */
function windStreaks(t, n, box, sp = 300, seed = 7, a = .55, col = 0xffffff) {
  const [x0, y0, x1, y1] = box, w = x1 - x0, h = y1 - y0;
  for (let i = 0; i < n; i++) {
    const len = 10 + hash(i, seed) * 28, x = x0 + mod(hash(i, seed, 1) * w * 3 + t * sp * (.7 + hash(i, seed, 2) * .6), w + len * 2) - len;
    const y = y0 + hash(i, seed, 3) * h + Math.sin(t * 1.5 + i) * 3, cur = Math.sin(x * .03 + i) * 2;
    for (let k = 0; k < len; k++) dot(x - k, y + cur * k / len, C(col), a * (1 - k / len), 's');
  }
}
/* 光斑 / 灰尘：慢慢飘、一闪一闪 */
function motes(t, n, box, col = 0xfff2c8, a = .7, seed = 3, size = 1) {
  const [x0, y0, x1, y1] = box, w = x1 - x0, h = y1 - y0;
  for (let i = 0; i < n; i++) {
    const x = x0 + mod(hash(i, seed) * w + t * (4 + hash(i, seed, 1) * 6) + Math.sin(t * .7 + i) * 5, w);
    const y = y0 + mod(hash(i, seed, 2) * h - t * (2 + hash(i, seed, 3) * 4) + Math.cos(t * .5 + i * 2) * 4, h);
    const tw = .5 + .5 * Math.sin(t * (2 + hash(i, seed, 4) * 3) + i);
    if (size > 1 && hash(i, seed, 5) < .3) { dot(x, y, C(col), a * tw, 's'); dot(x + 1, y, C(col), a * tw * .5, 's'); dot(x - 1, y, C(col), a * tw * .5, 's'); dot(x, y + 1, C(col), a * tw * .5, 's'); dot(x, y - 1, C(col), a * tw * .5, 's'); }
    else dot(x, y, C(col), a * tw, 's');
  }
}

/* 焦外：fn 画进一块离屏画布，按 blk 格取平均色打成马赛克（背景虚掉），再贴回当前画布 */
function bokeh(fn, blk = 3, o = {}) {
  const S = layer('bokeh'); withT(S, () => { clear(C(0x101018)); fn(); });
  const d = S.d8;
  for (let y = 0; y < H; y += blk) for (let x = 0; x < W; x += blk) {
    let r = 0, g = 0, b = 0, n = 0;
    for (let j = 0; j < blk && y + j < H; j++) for (let i = 0; i < blk && x + i < W; i++) { const p = ((y + j) * W + x + i) * 4; r += d[p]; g += d[p + 1]; b += d[p + 2]; n++; }
    let c = rgb(r / n, g / n, b / n); if (o.tint) c = mixc(c, C(o.tint[0]), o.tint[1]);
    rect(x, y, blk, blk, c);
  }
  // 亮处冒出几个圆的光斑
  if (o.dots) for (let i = 0; i < o.dots; i++) {
    const x = hash(i, 91) * W, y = hash(i, 92) * H * .7, L = lum(pget(x, y));
    if (L > .72) { const r = 4 + hash(i, 93) * 6; disc(x, y, r, C(0xfff4dc), .18, 's'); ring(x, y, r, C(0xffffff), .12, 's'); }
  }
}

/* 铅笔速写：fn 画进一块 w×h 的离屏画布，颜色突变的地方描成铅笔灰，其余是纸色；贴到当前画布 (x, y)。
   本子上画的她、素描本里画的他都用它 */
function sketch(fn, x, y, w, h, o = {}) {
  const S = layer('sketch', w, h); withT(S, () => { clear(0); fn(); });
  const d = S.d32, lumAt = i => { const c = d[i]; if (!(c >>> 24)) return 1; return lum(c); };
  const pen = C(o.pen ?? 0x4a4650), pen2 = C(o.pen2 ?? 0x8a8690);
  for (let yy = 1; yy < h - 1; yy++) for (let xx = 1; xx < w - 1; xx++) {
    const i = yy * w + xx, a = lumAt(i), dx = Math.abs(a - lumAt(i + 1)) + Math.abs(a - lumAt(i - 1)), dy = Math.abs(a - lumAt(i + w)) + Math.abs(a - lumAt(i - w));
    const e = dx + dy, rev = o.reveal ?? 1;
    if ((xx + yy * .7) / (w + h * .7) > rev) continue;
    if (e > .5) dot(x + xx, y + yy, pen, o.alpha ?? 1); else if (e > .22) dot(x + xx, y + yy, pen2, (o.alpha ?? 1) * .8);
    else if (a < .35 && (xx + yy) % 3 === 0) dot(x + xx, y + yy, pen2, (o.alpha ?? 1) * .5);      // 暗的地方排线
  }
}
/* 一页纸（俯视）：横线、页边红线；writing 写几行字（只画成一道道小波浪，看不清写的什么） */
function paper(x, y, w, h, o = {}) {
  const K = C(0x6a6070);
  rect(x + 2, y + 2, w, h, C(0x2a2030), .25);
  rect(x, y, w, h, C(o.col ?? 0xfbf8ee)); rect(x, y, w, 1, K, .3); rect(x, y + h - 1, w, 1, K, .3); rect(x, y, 1, h, K, .3); rect(x + w - 1, y, 1, h, K, .3);
  if (o.lines !== false) for (let yy = y + 8; yy < y + h - 4; yy += 7) hspan(yy, x + 3, x + w - 4, C(0xb8cce0));
  if (o.margin) rect(x + 10, y, 1, h, C(0xe8a0a0));
  if (o.writing) for (let r = 0; r < o.writing; r++) { const yy = y + 6 + r * 7, len = (w - 20) * (r === o.writing - 1 ? .5 : .9); for (let i = 0; i < len; i++) if (Math.sin(i * 1.3 + r) > -.3) pset(x + 12 + i, yy + Math.round(Math.sin(i * .9 + r * 2) * 1), C(0x3a3a5a)); }
}
