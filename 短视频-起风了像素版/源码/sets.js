'use strict';
/* sets.js —— 布景：天、云、太阳、月亮、远山、田野、草、水、树、房子、教学楼……
   全部按像素画：天用色阶加抖动，云和树用几层圆叠出亮面、中间色、暗面，再勾一圈亮边。 */

/* ---------------- 天 ---------------- */
/* 几套天色：上→下的关键色 */
const SKY = {
  noon: [[0, 0x2f7fd8], [.45, 0x5aa6ec], [.8, 0x9cd0f6], [1, 0xd8eefc]],
  morning: [[0, 0x4a8fd6], [.5, 0x8cc2ee], [.85, 0xcfe6f4], [1, 0xfdeccc]],
  dusk: [[0, 0x2e2a6e], [.35, 0x6b4a9a], [.6, 0xd8708a], [.82, 0xf6a36a], [1, 0xffd89a]],
  sunset: [[0, 0x3a5aa8], [.4, 0x8a86c8], [.65, 0xf2a0a0], [.85, 0xffbe7a], [1, 0xffe2a8]],
  night: [[0, 0x0b0b26], [.5, 0x1a1c4a], [.85, 0x2c2f6e], [1, 0x48447e]],
  dawn: [[0, 0x24305e], [.45, 0x5a5e9a], [.75, 0xc690a8], [1, 0xf8cfa4]],
  grey: [[0, 0x7d8ca6], [.6, 0xa8b4c6], [1, 0xd2d8e0]],
};
function sky(t, name, o = {}) { vgrad(0, o.y0 ?? 0, W, o.h ?? H, SKY[name] || name, o.bands ?? 14); }

/* 星星：一闪一闪，少数是十字的亮星 */
function stars(t, n, box = [0, 0, W, 150], seed = 5, a = 1) {
  const [x0, y0, x1, y1] = box;
  for (let i = 0; i < n; i++) {
    const x = x0 + Math.floor(hash(i, seed) * (x1 - x0)), y = y0 + Math.floor(hash(i, seed, 1) ** 1.4 * (y1 - y0));
    const tw = .45 + .55 * Math.max(0, Math.sin(t * (1 + hash(i, seed, 2) * 3) + i * 7));
    const big = hash(i, seed, 3) < .07, c = C(pick([0xffffff, 0xfff1c8, 0xd8e4ff], i));
    dot(x, y, c, a * tw);
    if (big) { dot(x - 1, y, c, a * tw * .5); dot(x + 1, y, c, a * tw * .5); dot(x, y - 1, c, a * tw * .5); dot(x, y + 1, c, a * tw * .5); }
  }
}

/* ---------------- 云 ---------------- */
/* 一朵积云：底是平的，上面一团团鼓起来；亮面在 light 那边（-1 左上、1 右上）。
   pal = [暗面, 中间, 亮面, 亮边]。w 宽度（格），x, y 是底边中点 */
const CLOUD_PAL = {
  noon: [0xa9bfe0, 0xdce9f8, 0xf6fbff, 0xffffff],
  morning: [0xb8c4e0, 0xe8ecf6, 0xfff8ee, 0xffffff],
  dusk: [0x7a5a9a, 0xc0789a, 0xf2a888, 0xffd6a0],
  sunset: [0x9a86b8, 0xe6a6b0, 0xffd2a8, 0xfff0d0],
  night: [0x24264e, 0x353866, 0x4c4f86, 0x6e70a8],
  grey: [0x8a96aa, 0xb0bac8, 0xd4dae2, 0xe8ecf0],
};
function cloud(t, x, y, w, seed = 1, pal = CLOUD_PAL.noon, o = {}) {
  const n = Math.max(3, Math.round(w / 9)), light = o.light ?? -1, puff = [];
  for (let i = 0; i < n; i++) {
    const u = n === 1 ? .5 : i / (n - 1), mid = 1 - Math.abs(u - .5) * 2;
    const r = (w / n) * (.75 + mid * .9) * (.85 + hash(i, seed) * .4) * (1 + .04 * Math.sin(t * .4 + i * 1.7 + seed));
    puff.push([x - w / 2 + u * w + (hash(i, seed, 1) - .5) * 4, y - r * (.55 + mid * .35) - hash(i, seed, 2) * r * .2, r]);
  }
  // 上面再加几团小的，让顶不平
  for (let i = 0; i < Math.floor(n / 2); i++) { const b = puff[1 + Math.floor(hash(i, seed, 5) * (n - 2))]; puff.push([b[0] + (hash(i, seed, 6) - .5) * b[2], b[1] - b[2] * .55, b[2] * .55]); }
  const cl = o.base ?? y;                                 // 平底
  const draw = (dx, dy, kr, col, a = 1) => {
    for (const [px, py, r] of puff) {
      const rr = r * kr, cx = px + dx * r, cy = py + dy * r;
      const x0 = Math.floor(cx - rr - 1), x1 = Math.ceil(cx + rr + 1), y0 = Math.floor(cy - rr - 1), y1 = Math.min(Math.ceil(cy + rr + 1), Math.floor(cl));
      for (let yy = y0; yy <= y1; yy++) for (let xx = x0; xx <= x1; xx++) { const ddx = xx + .5 - cx, ddy = yy + .5 - cy; if (ddx * ddx + ddy * ddy <= rr * rr + rr * .6) dot(xx, yy, col, a); }
    }
  };
  const A = o.alpha ?? 1;
  draw(0, 0, 1, C(pal[0]), A);
  draw(light * .06, -.12, .9, C(pal[1]), A);
  draw(light * .22, -.3, .62, C(pal[2]), A);
  if (pal[3]) draw(light * .34, -.44, .32, C(pal[3]), A);
  // 底边一行暗一点
  for (let xx = Math.floor(x - w / 2 - 6); xx < x + w / 2 + 6; xx++) if (pget(xx, Math.floor(cl)) === C(pal[1]) || pget(xx, Math.floor(cl)) === C(pal[2])) dot(xx, Math.floor(cl), C(pal[0]), .7 * A);
}
/* 一片云海：横着慢慢飘，循环 */
function cloudDrift(t, list, pal, speed = 2, span = W + 160) {
  for (const [x0, y, w, seed] of list) { const x = mod(x0 + t * speed * (60 / (w + 40)), span) - 80; cloud(t, x, y, w, seed, pal); }
}

/* ---------------- 太阳、月亮 ---------------- */
function sun(t, x, y, r = 10, col = 0xfff4d0, glowCol = 0xffe6a0, k = 1) {
  glowDisc(x, y, r * 6, C(glowCol), .55 * k, 7);
  glowDisc(x, y, r * 2.2, C(0xffffff), .5 * k, 4);
  disc(x, y, r, C(col)); disc(x - r * .25, y - r * .25, r * .55, C(0xffffff), .6);
  // 光芒：几道慢慢转的光柱
  for (let i = 0; i < 8; i++) {
    const ang = i / 8 * TAU + t * .05, len = r * (4 + 2 * Math.sin(t * .8 + i * 2));
    for (let s = r + 2; s < len; s++) dot(x + Math.cos(ang) * s, y + Math.sin(ang) * s, C(glowCol), .35 * (1 - s / len) * k, 's');
  }
}
function moon(t, x, y, r = 12, k = 1) {
  glowDisc(x, y, r * 4.5, C(0xb8c4ff), .45 * k, 6);
  disc(x, y, r, C(0xfff8e0));
  // 月海：几块淡淡的灰
  for (const [dx, dy, rr] of [[-.3, -.2, .28], [.25, .1, .22], [-.05, .38, .18], [.35, -.35, .12]]) disc(x + dx * r, y + dy * r, rr * r, C(0xe8dcc0));
  for (let yy = -r; yy <= r; yy++) for (let xx = -r; xx <= r; xx++) if (xx * xx + yy * yy <= r * r && xx + yy > r * .6) dot(x + xx, y + yy, C(0xd8ccb0), .5);
}

/* ---------------- 远山、丘陵 ---------------- */
/* 一道山脊：fbm 噪声做轮廓，往下填色；顶上一行亮一点（逆光的山边） */
function ridge(t, yBase, amp, col, seed = 1, freq = .012, x = 0, o = {}) {
  const c = C(col), edge = o.edge ? C(o.edge) : lighter(c, .25);
  for (let xx = 0; xx < W; xx++) {
    const wx = xx + x, top = Math.round(yBase - amp * (.55 + .45 * fbm(wx * freq, seed * 3.1, seed, 4)) - (o.peak ? o.peak(wx) : 0));
    rect(xx, top, 1, (o.bottom ?? H) - top, c);
    dot(xx, top, edge, o.edgeA ?? .8);
  }
}
/* 一排树冠（远处的树林）：一列列小圆 */
function treeline(t, yBase, h, col, seed = 2, x = 0, dens = 7) {
  const c = C(col), hi = lighter(c, .2), lo = darker(c, .25);
  for (let i = -2; i < W / dens + 3; i++) {
    const wx = i * dens + mod(x, dens), id = Math.floor((i * dens + x - mod(x, dens)) / dens) + 999, r = h * (.5 + hash(id, seed) * .6);
    const cx = wx + hash(id, seed, 1) * 3, cy = yBase - r * .6;
    disc(cx, cy, r, lo); disc(cx - r * .15, cy - r * .2, r * .8, c); disc(cx - r * .35, cy - r * .4, r * .38, hi);
  }
  rect(0, yBase - 1, W, H - yBase + 1, lo);
}

/* ---------------- 草 ---------------- */
/* 一片草：一根根 1 格宽的草叶，风吹时顶上往右偏 */
function grass(t, y0, y1, cols, dens = .35, wind = 1, seed = 4, x = 0) {
  const [base, mid, tip] = cols.map(c => C(c));
  for (let xx = -2; xx < W + 2; xx++) {
    const wx = Math.floor(xx + x);
    for (let k = 0; k < 2; k++) {
      if (hash(wx, seed, k) > dens) continue;
      const yy = y0 + Math.floor(hash(wx, seed, k + 5) * (y1 - y0)), h = 3 + Math.floor(hash(wx, seed, k + 9) * 5);
      const sway = (Math.sin(t * 2.2 + wx * .15) * .5 + .7) * wind;
      for (let s = 0; s < h; s++) { const f = s / h; dot(xx + Math.round(sway * f * f * 2), yy - s, f > .66 ? tip : f > .33 ? mid : base); }
    }
  }
}

/* ---------------- 水 ---------------- */
/* 河面：上面接天的倒影（颜色压暗一点），一道道横着的波光，岸边一条泡沫 */
function river(t, y0, y1, skyStops, o = {}) {
  const dark = o.dark ?? .25;
  for (let y = y0; y < y1; y++) {
    const u = (y - y0) / (y1 - y0), c0 = darker(gradAt(skyStops, 1 - u * .8), dark + u * .15);
    for (let x = 0; x < W; x++) {
      const wv = Math.sin(x * .09 + t * 1.6 + y * .7) + Math.sin(x * .023 - t * .9 + y * 1.3);
      pset(x, y, wv > 1.55 ? lighter(c0, .45) : wv < -1.6 ? darker(c0, .12) : c0);
    }
  }
  // 太阳 / 月亮在水里的倒影：一条竖着碎开的光
  if (o.glint) { const [gx, gw, gc] = o.glint; for (let y = y0 + 1; y < y1; y += 1) { const w = gw * (1 - (y - y0) / (y1 - y0) * .5), off = Math.sin(y * 1.7 + t * 4) * 2; for (let x = Math.round(gx - w + off); x < gx + w + off; x++) if (Math.sin(x * .6 + y * 2.1 + t * 5) > .2) dot(x, y, C(gc), .75, 's'); } }
  // 亮点：一闪一闪
  for (let i = 0; i < (o.sparkle ?? 40); i++) { const x = hash(i, 71) * W, y = y0 + 1 + hash(i, 72) * (y1 - y0 - 2), tw = Math.sin(t * 3 + i * 1.7); if (tw > .6) { dot(x + Math.sin(t + i) * 3, y, C(0xffffff), (tw - .6) * 2.2, 's'); } }
}

/* ---------------- 铁桥、火车 ---------------- */
/* 红色钢桁架桥：x0~x1，桥面在 deckY，桁架高 th。part = 'far'（后面那片桁架和桥面，画在火车前）| 'near'（前面那片，画在火车后）| 'piers'（桥墩）
   桁架是一节节的：上弦、下弦、竖杆、斜杆，亮面暗面两种红，上弦顶上一排铆钉 */
function trussBridge(x0, x1, deckY, th, pierY, part = 'all', o = {}) {
  const red = C(o.col ?? 0xc8483a), redS = C(o.colS ?? 0x8e2c2c), redH = C(o.colH ?? 0xf07a5e), K = C(0x3a1820);
  const span = o.span ?? 40, top = deckY - th;
  if (part === 'piers' || part === 'all') for (let x = x0 + span; x < x1; x += span * 2) {
    rect(x - 5, deckY + 3, 10, pierY - deckY - 2, C(0xa8a092)); rect(x + 1, deckY + 3, 4, pierY - deckY - 2, C(0x847c70)); rect(x - 5, deckY + 3, 10, 1, C(0x6a645c));
    for (let yy = deckY + 6; yy < pierY; yy += 3) hspan(yy, x - 5, x + 4, C(0x948c80));
    for (let k = -8; k <= 8; k++) dot(x + k, pierY, C(0xffffff), .6 - Math.abs(k) * .05);
  }
  if (part === 'far' || part === 'all') {
    for (let x = x0; x < x1; x += span) { line(x, deckY - 2, x + span / 2, top + 1, redS); line(x + span / 2, top + 1, x + span, deckY - 2, redS); line(x + span / 2, top, x + span / 2, deckY - 2, redS); }
    rect(x0, top, x1 - x0, 2, redS);
    rect(x0, deckY, x1 - x0, 4, C(0x4a3a3a)); rect(x0, deckY, x1 - x0, 1, C(0x8a7470)); rect(x0, deckY + 4, x1 - x0, 1, C(0x2a2026));
    for (let x = x0; x < x1; x += 3) pset(x, deckY + 2, C(0x6a5650));
  }
  if (part === 'near' || part === 'all') {
    for (let x = x0; x < x1; x += span) {
      for (const [a, b, c, d] of [[x, deckY - 1, x + span / 2, top], [x + span / 2, top, x + span, deckY - 1]]) { capsule(a, b, c, d, 3.4, K); capsule(a, b, c, d, 2, red); line(a, b - 1, c, d - 1, redH, .6); }
      capsule(x, top, x, deckY - 1, 3.4, K); capsule(x, top, x, deckY - 1, 2, red);
    }
    rect(x0, top - 2, x1 - x0, 4, K); rect(x0, top - 1, x1 - x0, 2, red); rect(x0, top - 1, x1 - x0, 1, redH);
    rect(x0, deckY - 3, x1 - x0, 3, K); rect(x0, deckY - 2, x1 - x0, 2, red); rect(x0, deckY - 2, x1 - x0, 1, redH);
    for (let x = x0; x < x1; x += 4) { pset(x, top - 1, C(0x5a2026)); pset(x + 2, deckY - 2, C(0x5a2026)); }
  }
}
/* 绿皮火车：车头（内燃机车，橙白）+ cars 节绿车厢（黄腰线、一排窗）。x 是车头最前端，y 是轨面，dir 1 往右开。
   win(i, j) 可以返回窗里画什么（人影、灯） */
function greenTrain(t, x, y, cars, o = {}) {
  const dir = o.dir ?? 1, carW = 64, gap = 2, H_ = 17, K = C(0x1c2420);
  const g = C(0x2f6a4a), gS = C(0x1f4a34), gH = C(0x4a8a62), yel = C(0xe8c860), win = C(o.night ? 0xffe0a0 : 0xbfe0f0), winS = C(o.night ? 0xd09050 : 0x7fa8c0);
  const roof = C(0x6a7470), roofH = C(0x8a948e);
  const wheel = (wx) => { const ph = (t * 18) % 1; disc(wx, y - 2, 2.2, C(0x2a2a2e)); pset(wx + Math.round(Math.cos(ph * TAU) * 1.4), y - 2 + Math.round(Math.sin(ph * TAU) * 1.4), C(0x9a9a9e)); };
  const carAt = (cx, i) => {                       // cx = 车厢后端（按行驶方向）
    const x0 = dir > 0 ? cx : cx - carW;
    rect(x0, y - H_ - 3, carW, H_, K);
    rect(x0 + 1, y - H_ - 2, carW - 2, H_ - 2, g);
    rect(x0 + 1, y - H_ - 2, carW - 2, 2, roof); rect(x0 + 1, y - H_ - 2, carW - 2, 1, roofH);
    rect(x0 + 1, y - 7, carW - 2, 2, gS);
    rect(x0 + 1, y - 9, carW - 2, 1, yel);
    for (let j = 0; j < 7; j++) {
      const wx = x0 + 5 + j * 8; rect(wx, y - H_ + 2, 5, 5, win); rect(wx, y - H_ + 6, 5, 1, winS);
      if (o.win) o.win(i, j, wx, y - H_ + 2);
    }
    wheel(x0 + 8); wheel(x0 + 14); wheel(x0 + carW - 14); wheel(x0 + carW - 8);
    rect(x0 + (dir > 0 ? carW : -gap), y - 12, gap, 4, K);
  };
  // 车头
  const lx0 = dir > 0 ? x - 54 : x, lw = 54;
  rect(lx0, y - 21, lw, 19, K);
  rect(lx0 + 1, y - 20, lw - 2, 17, C(0xe86a2a)); rect(lx0 + 1, y - 12, lw - 2, 5, C(0xf4f0e6)); rect(lx0 + 1, y - 20, lw - 2, 2, C(0x5a5a62));
  const cab = dir > 0 ? lx0 + lw - 12 : lx0 + 4; rect(cab, y - 18, 8, 5, win);
  wheel(lx0 + 8); wheel(lx0 + 16); wheel(lx0 + lw - 16); wheel(lx0 + lw - 8);
  if (o.light) glowDisc(dir > 0 ? x : x, y - 10, 10, C(0xfff0c0), .7, 4);
  for (let i = 0; i < cars; i++) carAt(dir > 0 ? x - 54 - gap - (i + 1) * (carW + gap) : x + 54 + gap + i * (carW + gap), i);
}

/* ---------------- 房子、小城 ---------------- */
/* 白墙灰瓦的小房子：x 左边，y 地面，w 宽，h 墙高。roof 屋顶色。窗户亮不亮按 lit */
function house(x, y, w, h, o = {}) {
  const wall = C(o.wall ?? 0xeee6d8), wallS = C(o.wallS ?? 0xc8bca8), roof = C(o.roof ?? 0x4a4c5a), roofH = C(o.roofH ?? 0x6a6e7e), K = C(0x2a2430);
  rect(x, y - h, w, h, wall); rect(x + w - 2, y - h, 2, h, wallS);
  const rh = Math.max(3, Math.round(w * .28));
  poly([[x - 2, y - h + 1], [x + w + 2, y - h + 1], [x + w - 1, y - h - rh], [x + 1, y - h - rh]], roof);
  hspan(y - h - rh, x + 1, x + w - 2, roofH); hspan(y - h + 1, x - 2, x + w + 1, K);
  if (o.horse) { rect(x - 1, y - h - rh - 2, 2, rh + 2, wall); rect(x + w - 1, y - h - rh - 2, 2, rh + 2, wall); }
  const nw = Math.max(1, Math.floor((w - 4) / 6));
  for (let i = 0; i < nw; i++) { const wx = x + 3 + i * 6, lit = o.lit && hash(x, i, 3) < o.lit; rect(wx, y - h + 3, 3, 3, lit ? C(0xffd890) : C(0x5a6070)); if (lit) glowDisc(wx + 1.5, y - h + 4.5, 5, C(0xffc870), .35, 3); }
  if (h > 12) rect(x + Math.floor(w / 2) - 1, y - 5, 3, 5, C(0x6a4a3a));
}
/* 一片村子：沿 y 一排房子，前后错开 */
function village(t, x, y, n, seed = 1, o = {}) {
  for (let i = 0; i < n; i++) { const w = 12 + Math.floor(hash(i, seed) * 10), h = 8 + Math.floor(hash(i, seed, 1) * 6), xx = x + i * 15 + hash(i, seed, 2) * 6, yy = y + (i % 2) * 3; house(xx, yy, w, h, { ...o, horse: hash(i, seed, 3) < .4 }); }
}
/* 一群燕子 / 鸟：v 字形，翅膀一扇一扇 */
function birds(t, n, x, y, sp = 30, seed = 2, col = 0x2a2a3a) {
  for (let i = 0; i < n; i++) {
    const bx = x + hash(i, seed) * 40 + t * sp * (.8 + hash(i, seed, 1) * .4), by = y + hash(i, seed, 2) * 18 + Math.sin(t * 1.5 + i) * 3;
    const flap = Math.sin(t * 12 + i * 2) > 0, c = C(col);
    pset(bx, by, c); if (flap) { pset(bx - 1, by - 1, c); pset(bx + 1, by - 1, c); pset(bx - 2, by - 1, c); pset(bx + 2, by - 1, c); } else { pset(bx - 1, by, c); pset(bx + 1, by, c); pset(bx - 2, by + 1, c); pset(bx + 2, by + 1, c); }
  }
}
/* 稻田：一垄一垄的横条，风吹过时一道亮的波往右走 */
function paddy(t, y0, y1, o = {}) {
  const c0 = C(o.c0 ?? 0x6aa846), c1 = C(o.c1 ?? 0x7cbc52), tip = C(o.c2 ?? 0xb8e07a), stem = C(o.cd ?? 0x4e8a38);
  for (let y = y0; y < y1; y++) rect(0, y, W, 1, ((y - y0) >> 1) % 2 ? c0 : c1);
  // 一簇簇稻子：越近越大、越稀；风吹过时穗尖往右倒，一道波往右走
  for (let y = y0 + 2; y < y1 + 4; ) {
    const u = (y - y0) / (y1 - y0), sp = 3 + Math.round(u * 5), h = 2 + Math.round(u * 4);
    for (let x = -4 + (y % 3); x < W + 4; x += sp) {
      const wave = Math.sin(x * .05 - t * 3 + y * .15) * .5 + .5, bend = Math.round(wave * wave * (1 + u * 2));
      line(x, y, x + bend, y - h, stem); pset(x + bend, y - h, wave > .75 ? C(0xe8f8b0) : tip);
      if (u > .4) { pset(x + bend - 1, y - h + 1, tip); }
    }
    y += 2 + Math.round(u * 4);
  }
}

/* 电线杆：x 底，y 地面，h 高；返回两个挂电线的点 */
function pole(x, y, h, o = {}) {
  const K = C(0x2a2026), wd = C(o.col ?? 0x6a5040), wdH = C(0x8a6a50), w = o.w ?? 2;
  rect(x - 1, y - h, w + 2, h, K); rect(x, y - h, w, h, wd); rect(x, y - h, 1, h, wdH);
  const arm = Math.round(h * .22) + 3;
  rect(x - arm, y - h + 3, arm * 2 + w, 2, K); rect(x - arm + 1, y - h + 3, arm * 2 + w - 2, 1, wd);
  for (const dx of [-arm + 1, arm + w - 2]) { pset(x + dx, y - h + 2, C(0xe8e8f0)); pset(x + dx, y - h + 1, C(0xb8b8c8)); }
  return [[x - arm + 1, y - h + 2], [x + arm + w - 2, y - h + 2]];
}
/* 一根电线：两点之间往下垂，风吹时轻轻晃 */
function wire(x0, y0, x1, y1, sag, t = 0, col = 0x2a2430, a = .9) {
  const n = Math.ceil(Math.abs(x1 - x0)) + 1, sw = Math.sin(t * 1.3 + x0 * .01) * sag * .08;
  let px = null, py = null;
  for (let i = 0; i <= n; i++) {
    const u = i / n, x = lerp(x0, x1, u), y = lerp(y0, y1, u) + Math.sin(u * Math.PI) * (sag + sw);
    const xi = Math.round(x), yi = Math.round(y);
    if (px !== null && Math.abs(yi - py) > 1) for (let yy = Math.min(yi, py) + 1; yy < Math.max(yi, py); yy++) dot(xi, yy, C(col), a);
    dot(xi, yi, C(col), a); px = xi; py = yi;
  }
}
/* 一朵小花 / 一棵草：前景点缀 */
function flower(x, y, col, t, i) { const sw = Math.round(Math.sin(t * 2 + i) * .8); pset(x + sw, y - 3, C(col)); pset(x + sw - 1, y - 3, C(col)); pset(x + sw, y - 4, C(col)); pset(x + sw, y - 2, C(0xfff0a0)); line(x, y, x + sw, y - 2, C(0x3f7a32)); }
/* 蜻蜓：一道细身子、两对翅膀一闪一闪 */
function dragonfly(t, x, y, i) {
  const bx = x + Math.sin(t * .9 + i) * 30 + Math.sin(t * 3.1 + i * 2) * 4, by = y + Math.cos(t * 1.1 + i) * 10 + Math.sin(t * 5 + i) * 2, fl = Math.sin(t * 40 + i) > 0;
  line(bx, by, bx + 4, by, C(0x3a5a8a)); pset(bx + 4, by, C(0x6a9ad8));
  dot(bx + 2, by - 1, C(0xe8f4ff), fl ? .8 : .4); dot(bx + 1, by - 1, C(0xe8f4ff), fl ? .8 : .4); dot(bx + 2, by + 1, C(0xe8f4ff), fl ? .4 : .8); dot(bx + 1, by + 1, C(0xe8f4ff), fl ? .4 : .8);
}

/* 一棵大树（前景框画面用）：树干从画面外伸进来，树冠是一团团三种绿的圆，风吹时整体晃、几团叶子跟着闪 */
function bigTree(t, x, y, k = 1, o = {}) {
  const K = C(0x1e2a1c), tr = C(o.trunk ?? 0x5a4234), trH = C(0x7a5a44), trS = C(0x3e2c24);
  const sw = Math.sin(t * 1.3) * 1.5;
  capsule(x, y + 10, x + 4 * k, y - 70 * k, 11 * k + 2, K); capsule(x, y + 10, x + 4 * k, y - 70 * k, 11 * k, tr);
  capsule(x - 3 * k, y + 10, x + 1 * k, y - 70 * k, 3 * k, trH); capsule(x + 4 * k, y + 10, x + 7 * k, y - 70 * k, 2 * k, trS);
  for (const [dx, dy, ex, ey] of [[2, -50, -34, -92], [3, -60, 30, -96], [2, -66, -6, -112]]) { capsule(x + dx * k, y + dy * k, x + ex * k + sw, y + ey * k, 5 * k + 2, K); capsule(x + dx * k, y + dy * k, x + ex * k + sw, y + ey * k, 5 * k, tr); }
  const S = makeCanopy(o.seed ?? 7, Math.round(150 * k), Math.round(96 * k), o.cols || GREENS, { r: 7 });
  drawCanopy(S, x + 2 * k, y - 52 * k, t, 2.2, { ph: o.ph });
}

/* ---------------- 树冠（缓存） ----------------
   很多小团叶子撒在一个椭圆里；每格取所有小团的"鼓起来的高度"最大值，按光（左上）方向的坡度分亮暗，量化成 4 种绿；
   外圈一格深色描边，里面零星几个深色的洞。生成一次存起来，画的时候按行错开模拟风吹（越往上晃得越多） */
const _canopies = new Map();
function makeCanopy(seed, w, h, cols, o = {}) {
  const key = [seed, w, h, cols.join(), JSON.stringify(o)].join('|');
  if (_canopies.has(key)) return _canopies.get(key);
  const S = surf(w + 4, h + 4), n = o.n ?? Math.round(w * h / 60), cl = [];
  // 先定几个大瓣，小团叶子撒在大瓣周围：整体有起伏，不是一个匀称的球
  const nl = o.lobes ?? 6, lobes = [];
  for (let j = 0; j < nl; j++) { const a = j / nl * TAU + hash(j, seed, 5) * .8, d = .35 + hash(j, seed, 6) * .3; lobes.push([w / 2 + 2 + Math.cos(a) * d * w / 2, h / 2 + 2 + Math.sin(a) * d * h / 2 * .85 - (Math.sin(a) < 0 ? 2 : 0), (.32 + hash(j, seed, 7) * .18) * Math.min(w, h)]); }
  lobes.push([w / 2 + 2, h / 2, .42 * Math.min(w, h)]);
  for (let i = 0; i < n; i++) {
    const L = lobes[Math.floor(hash(i, seed, 3) * lobes.length)], a = hash(i, seed) * TAU, d = Math.sqrt(hash(i, seed, 1)) * L[2];
    const cx = clamp(L[0] + Math.cos(a) * d, 5, w - 1), cy = clamp(L[1] + Math.sin(a) * d * .85, 5, h - 1);
    cl.push([cx, cy, 3 + hash(i, seed, 2) * (o.r ?? 6)]);
  }
  const hm = new Float32Array(S.w * S.h).fill(-1);
  for (let y = 0; y < S.h; y++) for (let x = 0; x < S.w; x++) {
    let best = -1; for (const [cx, cy, r] of cl) { const d = Math.hypot(x + .5 - cx, (y + .5 - cy) * 1.1); if (d < r) best = Math.max(best, (r - d) / r * (1 + r * .05)); }
    hm[y * S.w + x] = best;
  }
  const C4 = cols.map(c => C(c)), K = C(o.out ?? 0x1c2a1e);
  withT(S, () => {
    for (let y = 1; y < S.h - 1; y++) for (let x = 1; x < S.w - 1; x++) {
      const v = hm[y * S.w + x]; if (v < 0) continue;
      const g = (hm[(y - 1) * S.w + x - 1] < 0 ? -.4 : hm[(y - 1) * S.w + x - 1]) - (hm[(y + 1) * S.w + x + 1] < 0 ? -.4 : hm[(y + 1) * S.w + x + 1]);
      const lightness = clamp(.5 + g * 1.6 + v * .3 - (y / S.h) * .35 - (x / S.w) * .12 + (bay(x, y) - .5) * .18);
      pset(x, y, C4[Math.min(3, Math.floor(lightness * 4))]);
      if (hash(x, y, seed + 9) < (o.holes ?? .012) && v < .5) pset(x, y, K);
    }
  });
  outline(S, K);
  _canopies.set(key, S); return S;
}
/* 画树冠：(x, y) 是树冠底边中点，sway 晃的幅度（格），t 时间 */
function drawCanopy(S, x, y, t, sway = 2, o = {}) {
  const x0 = Math.round(x - S.w / 2), y0 = Math.round(y - S.h);
  for (let j = 0; j < S.h; j++) {
    const off = Math.round(Math.sin(t * 1.3 + (o.ph || 0)) * sway * (1 - j / S.h) + Math.sin(t * 3.1 + j * .2) * .4 * (1 - j / S.h));
    for (let i = 0; i < S.w; i++) { const c = S.d32[j * S.w + i]; if (c >>> 24) { if (o.tint) dot(x0 + i + off, y0 + j, mixc(c, o.tint[0], o.tint[1])); else pset(x0 + i + off, y0 + j, c); } }
  }
  // 亮叶子一闪一闪
  if (o.glint !== false) for (let i = 0; i < S.w * S.h / 90; i++) {
    const gx = Math.floor(hash(i, 3) * S.w), gy = Math.floor(hash(i, 4) * S.h * .7);
    if (S.d32[gy * S.w + gx] >>> 24 && Math.sin(t * 4 + i * 1.7) > .75) pset(x0 + gx + Math.round(Math.sin(t * 1.3 + (o.ph || 0)) * sway * (1 - gy / S.h)), y0 + gy, C(o.glintCol ?? 0xd8f4a0));
  }
}
const GREENS = [0x2c5e34, 0x44843e, 0x6cae4e, 0xa2d66a];

/* ---------------- 教室 ----------------
   侧面看：背后是窗户那面墙（上白下绿的墙裙），三扇大窗，窗外是树和天；窗帘被风鼓起来；
   地上是窗户投下的一块块光斑；天花板上日光灯、吊扇；一排排课桌（桌上一摞摞书）和椅子。
   o.x 镜头左右，o.tod 'day'|'morning'|'dusk'|'empty'，o.wind 风 */
const ROOM = {
  day: { wallT: 0xf2ecdc, wallB: 0x7cb898, wallBS: 0x5e9a7c, floor: 0xd8d2c4, floorS: 0xc4bcac, out: SKY.noon, light: 0xfff2c8 },
  morning: { wallT: 0xf4ead8, wallB: 0x86bc98, wallBS: 0x689e7e, floor: 0xdcd2c0, floorS: 0xc8bca8, out: SKY.morning, light: 0xffe6b0 },
  dusk: { wallT: 0xe8c8b0, wallB: 0x8a9a7c, wallBS: 0x6c7a62, floor: 0xc8aa98, floorS: 0xb09080, out: SKY.dusk, light: 0xffb878 },
  empty: { wallT: 0xe4ddd0, wallB: 0x8aa898, wallBS: 0x6c8a7c, floor: 0xccc6ba, floorS: 0xb8b0a4, out: SKY.noon, light: 0xfff0d0 },
};
function windowView(t, x, y, w, h, o = {}) {
  withT(layer('winview', w, h), () => {
    sky(t, o.out || SKY.noon, { y0: -20, h: h + 40, bands: 8 });
    cloud(t, w * .3 + Math.sin(t * .05) * 6, h * .45, w * .5, 31, o.cloud || CLOUD_PAL.noon);
    const S = makeCanopy(41, Math.round(w * 1.1), Math.round(h * .7), o.leaves || GREENS, { r: 6 });
    drawCanopy(S, w * .5, h + 6, t, 1.5, { ph: x * .1 });
  });
  blit(_pool['winview' + w + 'x' + h], x, y);
}
function classroom(t, o = {}) {
  const P_ = ROOM[o.tod || 'day'], cx = o.x || 0, wind = o.wind ?? .5;
  const wallTop = 0, dado = 150, floorY = o.floorY ?? 186;
  rect(0, 0, W, dado, C(P_.wallT));
  vgrad(0, 0, W, 30, [[0, 0xd8d0c0], [1, P_.wallT]], 5);
  rect(0, dado, W, floorY - dado, C(P_.wallB)); rect(0, dado, W, 2, C(P_.wallBS)); rect(0, floorY - 3, W, 3, C(P_.wallBS));
  // 地板：一格格瓷砖
  vgrad(0, floorY, W, H - floorY, [[0, P_.floorS], [1, P_.floor]], 6);
  for (let y = floorY + 6, k = 0; y < H; y += 6 + k * 3, k++) hspan(y, 0, W, darker(C(P_.floorS), .08));
  // 窗户
  const winW = 112, gap = 52, pitch = winW + gap;
  for (let i = -1; i < 4; i++) {
    const wx = Math.round(i * pitch + 30 - mod(cx * .9, pitch)), wy = 22, wh = 108;
    if (wx > W || wx + winW < 0) continue;
    rect(wx - 3, wy - 3, winW + 6, wh + 6, C(0xd8d4cc)); rect(wx - 2, wy - 2, winW + 4, wh + 4, C(0xf8f6f0));
    windowView(t, wx, wy, winW, wh, { out: P_.out });
    for (let k = 1; k < 4; k++) rect(wx + Math.round(winW * k / 4) - 1, wy, 2, wh, C(0xf0eee8));
    rect(wx, wy + 40, winW, 2, C(0xf0eee8));
    rect(wx - 4, wy + wh + 2, winW + 8, 3, C(0xc8c2b6));
    // 窗帘：在两边，风吹时鼓起来、下摆飘
    for (const side of [-1, 1]) {
      const bx = side < 0 ? wx - 2 : wx + winW + 2, billow = (Math.sin(t * 1.6 + i * 1.3 + side) * .5 + .5) * wind;
      for (let yy = wy - 4; yy < wy + wh + 10; yy++) {
        const u = (yy - wy) / wh, wd = 9 + billow * 18 * Math.sin(clamp(u) * Math.PI * .9) + Math.sin(yy * .25 + t * 3) * 1.2;
        const x0 = side < 0 ? bx - 6 : bx - wd + 6 + billow * 4, x1 = side < 0 ? bx + wd - 6 - billow * 4 : bx + 6;
        for (let xx = Math.round(Math.min(x0, x1)); xx <= Math.round(Math.max(x0, x1)); xx++) {
          const fold = Math.sin((xx - x0) * .9 + yy * .05) > .5;
          pset(xx, yy, C(fold ? 0xd8eade : 0xeef6f0));
        }
      }
    }
    // 窗户投到地上的光斑（平行四边形，透明度分级）
    const lx = wx + 40 + (o.sunDX ?? 60);
    poly([[wx + 10, floorY], [wx + winW - 10, floorY], [lx + winW + 30, H], [lx + 30, H]], C(P_.light), .22, 's');
    for (let k = 1; k < 4; k++) { const xx = wx + Math.round(winW * k / 4); line(xx, floorY, xx + (lx + 30 - wx) * 1.0, H, C(P_.floor), .5); }
  }
  // 窗户进来的光束
  for (let i = -1; i < 4; i++) {
    const wx = Math.round(i * pitch + 30 - mod(cx * .9, pitch));
    for (let k = 0; k < 3; k++) { const a = .05 + .02 * Math.sin(t * .8 + i + k); poly([[wx + 10 + k * 30, 30], [wx + 34 + k * 30, 30], [wx + 120 + k * 30, H], [wx + 80 + k * 30, H]], C(P_.light), a, 's'); }
  }
  // 天花板：日光灯、吊扇
  for (let i = 0; i < 4; i++) { const lx = Math.round(i * 150 + 40 - mod(cx * .7, 150)); rect(lx, 2, 50, 3, C(0xffffff)); rect(lx, 5, 50, 1, C(0xc8c8d0)); }
  if (o.fan !== false) { const fx = Math.round(240 - cx * .7), ph = t * 9; rect(fx, 0, 1, 8, C(0x6a6a72)); for (let k = 0; k < 3; k++) { const a = ph + k * TAU / 3, l = 22; line(fx, 9, fx + Math.cos(a) * l, 9 + Math.sin(a) * 2, C(0x8a8a92)); } disc(fx, 9, 2, C(0x5a5a62)); }
  motes(t, 40, [0, 20, W, floorY], P_.light, .6, 7);
}
/* 课桌（侧面）：桌面、桌肚、四条腿，桌上一摞书；x 左边，y 地面 */
function desk(x, y, o = {}) {
  const K = C(0x3a2a24), top = C(0xc89a62), topH = C(0xe0b47a), body = C(0xa87a4a), leg = C(0x7a7e86);
  rect(x + 2, y - 15, 2, 15, leg); rect(x + 22, y - 15, 2, 15, leg);
  rect(x, y - 19, 26, 5, K); rect(x + 1, y - 18, 24, 3, body); rect(x - 1, y - 21, 28, 3, K); rect(x, y - 20, 26, 1, topH); rect(x, y - 19, 26, 1, top);
  const nb = o.books ?? 4;
  for (let i = 0; i < nb; i++) { const bw = 7 + Math.floor(hash(x, i, 1) * 5), c = pick([0xe8dcc0, 0x6a9ad8, 0xe89a7a, 0xf4f0e6, 0x9ac89a, 0xd8c0e8], hash(x, i, 2) * 6); rect(x + 2 + (o.side ? 12 : 0), y - 22 - i * 2, bw, 2, C(c)); rect(x + 2 + (o.side ? 12 : 0), y - 22 - i * 2, 1, 2, darker(C(c), .2)); }
}
function chair(x, y, f = 1) { const c = C(0xc89a62), leg = C(0x7a7e86); rect(x - 5, y - 12, 10, 2, c); rect(x - 4, y - 10, 1, 10, leg); rect(x + 3, y - 10, 1, 10, leg); const bx = f > 0 ? x - 6 : x + 5; rect(bx, y - 24, 2, 14, leg); rect(bx - (f > 0 ? 0 : 1), y - 24, 3, 7, c); }

/* ---------------- 远处的小城剪影（黄昏 / 夜） ---------------- */
function skyline(t, yBase, col, seed = 3, x = 0, o = {}) {
  const c = C(col), win = C(o.win ?? 0xffd890);
  for (let i = -1; i < W / 14 + 2; i++) {
    const id = Math.floor((i * 14 + x) / 14), wx = Math.round(i * 14 - mod(x, 14)), w = 10 + Math.floor(hash(id, seed) * 12), h = 8 + Math.floor(hash(id, seed, 1) * (o.tall ?? 26));
    rect(wx, yBase - h, w, h + 40, c);
    if (hash(id, seed, 2) < .3) { rect(wx + 2, yBase - h - 3, 2, 3, c); }
    if (o.lit) for (let yy = yBase - h + 3; yy < yBase - 2; yy += 4) for (let xx = wx + 2; xx < wx + w - 2; xx += 3) if (hash(xx, yy, seed) < o.lit) pset(xx, yy, mixc(win, c, hash(xx, yy, 7) * .4));
  }
}
/* 天台：水泥地、女儿墙 + 铁栏杆、右边的水箱、左边楼梯间（有门）。floorY 地面 */
function rooftop(t, o = {}) {
  const fy = o.floorY ?? 214, dusk = o.dusk ?? 1, K = C(0x241a2a);
  const wall = mixc(C(0xc8c0b8), C(0x8a6a7a), dusk * .6), wallS = darker(wall, .25), floorC = mixc(C(0xb8b0a6), C(0x9a7a80), dusk * .6);
  // 女儿墙 + 栏杆
  rect(0, fy - 22, W, 14, wall); rect(0, fy - 22, W, 2, lighter(wall, .2)); rect(0, fy - 10, W, 2, wallS);
  for (let x = mod(-(o.x || 0), 10); x < W; x += 10) rect(x, fy - 40, 1, 18, C(0x5a4a5a));
  rect(0, fy - 41, W, 2, C(0x6a5a6a)); rect(0, fy - 41, W, 1, C(0x9a8a9a));
  // 地面
  vgrad(0, fy - 8, W, H - fy + 8, [[0, darker(floorC, .1)], [1, floorC]], 5);
  for (let x = mod(-(o.x || 0) * 1.3, 30); x < W; x += 30) line(x, fy - 8, x - 60, H, darker(floorC, .12), .6);
  // 楼梯间（左）
  if (o.door !== false) {
    const dx = o.doorX ?? 20;
    rect(dx - 2, fy - 92, 76, 92, K); rect(dx, fy - 90, 72, 90, mixc(C(0xd8d0c4), C(0xa88890), dusk * .6)); rect(dx + 50, fy - 90, 22, 90, darker(mixc(C(0xd8d0c4), C(0xa88890), dusk * .6), .2));
    rect(dx + 14, fy - 60, 26, 60, K); rect(dx + 15, fy - 59, 24, 59, C(0x2a2030));   // 门洞（门开着，里面黑）
    rect(dx + 38, fy - 59, 4, 59, C(0x7a8a9a));                                     // 门板（开着，侧面）
    rect(dx - 4, fy - 94, 80, 4, darker(wall, .1));
  }
  // 水箱（右）
  if (o.tank !== false) {
    const tx = o.tankX ?? 400, tk = mixc(C(0xb8c8d8), C(0xd09080), dusk * .55), tkS = mixc(C(0x8a9aac), C(0x6a4a6a), dusk * .6);
    rect(tx, fy - 70, 56, 40, K); rect(tx + 1, fy - 69, 54, 38, tk); rect(tx + 38, fy - 69, 17, 38, tkS); rect(tx + 1, fy - 69, 54, 2, lighter(tk, .3));
    for (let i = 0; i < 4; i++) rect(tx + 6 + i * 13, fy - 30, 3, 22, darker(tkS, .3));
    for (let i = 0; i < 3; i++) hspan(fy - 60 + i * 11, tx + 1, tx + 54, darker(tk, .1));
  }
  // 地上的积水：倒映着天
  if (o.puddles !== false) for (const [px, py, pw] of [[170, fy + 18, 40], [260, fy + 34, 56], [90, fy + 44, 30]]) {
    for (let yy = 0; yy < 4; yy++) { const w2 = pw * Math.sqrt(1 - ((yy - 1.5) / 2) ** 2); for (let xx = -w2 / 2; xx < w2 / 2; xx++) { const c = pget(px + xx, fy - 60 - yy * 6 - Math.abs(xx) * .2); pset(px + xx, py + yy, mixc(c || C(0xf0a080), C(0xffd8a0), .25)); } }
  }
}

/* ---------------- 火车车厢 ---------------- */
/* 车窗外的风景：远山慢、近处的树和电线杆快；画进 (x, y, w, h) 这一块。speed 越大越快 */
function trainView(t, x, y, w, h, o = {}) {
  const L = layer('tview', w, h), sp = o.speed ?? 1, tod = o.tod || 'noon';
  withT(L, () => {
    sky(t, o.sky || SKY.noon, { y0: -10, h: h * .8 + 10, bands: 8 });
    cloud(t, w * .4 - (t * 4 * sp) % (w + 120) + w + 60, h * .32, 70, 61, o.cloudPal || CLOUD_PAL.noon);
    cloud(t, w * .9 - (t * 3 * sp) % (w + 160) + w + 80, h * .2, 50, 62, o.cloudPal || CLOUD_PAL.noon);
    ridge(t, h * .58, h * .16, o.far ?? 0x9cbcd8, 71, .012, t * 12 * sp, { bottom: h });
    ridge(t, h * .66, h * .1, o.mid ?? 0x7aa68a, 72, .02, t * 40 * sp, { bottom: h });
    treeline(t, h * .74, 5, o.trees ?? 0x5a9a5a, 73, t * 90 * sp, 6);
    paddy(t, Math.round(h * .74), h);
    // 电线杆一根根闪过去
    const gap = 150, px = mod(-t * 260 * sp, gap) + 10;
    for (let k = -1; k < 3; k++) { const xx = px + k * gap; rect(xx, 0, 4, h, C(0x3a2e2a)); rect(xx, 8, 14, 2, C(0x3a2e2a)); }
    if (o.reflect) o.reflect(L);
  });
  blit(L, x, y);
}
/* 车厢内景（侧面对着窗户）：o.x 镜头左右，o.light 窗光颜色 */
function trainInterior(t, o = {}) {
  const K = C(0x1e1a24), wall = C(o.wall ?? 0xe6e0d0), wallS = C(0xc8c0ae), seat = C(0x3e6aa8), seatS = C(0x2c4e80), cover = C(0xf4f2ea);
  rect(0, 0, W, H, wall); vgrad(0, 0, W, 40, [[0, 0xb8b2a4], [1, 0xe6e0d0]], 6);
  // 行李架
  rect(0, 22, W, 4, C(0x9aa2aa)); rect(0, 26, W, 1, C(0x5a626a)); for (let x = mod(-(o.x || 0), 12); x < W; x += 12) rect(x, 26, 1, 8, C(0x7a828a));
  // 窗户（两扇）
  const wins = o.wins || [[70, 52, 150, 96], [290, 52, 150, 96]];
  for (const [wx, wy, ww, wh] of wins) {
    trainView(t, wx, wy, ww, wh, o.view || {});
    // 圆角窗框
    for (let i = 0; i < 4; i++) { rect(wx - 6 + i, wy - 6 + i, ww + 12 - i * 2, 1, C(0xb8bcc4)); rect(wx - 6 + i, wy + wh + 5 - i, ww + 12 - i * 2, 1, C(0x8a8e96)); rect(wx - 6 + i, wy - 6 + i, 1, wh + 12 - i * 2, C(0xa8acb4)); rect(wx + ww + 5 - i, wy - 6 + i, 1, wh + 12 - i * 2, C(0x9a9ea6)); }
    rect(wx, wy + Math.round(wh * .45), ww, 2, C(0xc8ccd4));
    // 蓝窗帘：两边挽起来
    for (const sd of [-1, 1]) { const cx = sd < 0 ? wx - 2 : wx + ww - 14; for (let yy = wy - 4; yy < wy + wh * .8; yy++) { const ww2 = 12 + Math.sin(yy * .3) * 1.5 + (yy > wy + wh * .55 ? -4 : 0); rect(cx + (sd < 0 ? 0 : 16 - ww2), yy, ww2, 1, (yy + Math.floor((cx + yy) / 3)) % 4 === 0 ? C(0x5a86c8) : C(0x3a66a8)); } }
    // 窗下的小桌板：茶杯、两个橘子
    rect(wx + 10, wy + wh + 10, ww - 20, 5, K); rect(wx + 11, wy + wh + 11, ww - 22, 3, C(0xd8d4cc));
    rect(wx + ww / 2 - 14, wy + wh + 2, 7, 9, C(0xe8f0f4), .85); rect(wx + ww / 2 - 13, wy + wh + 5, 5, 6, C(0xc8a060), .7);
    disc(wx + ww / 2 + 10, wy + wh + 7, 3.4, C(0xf09030)); disc(wx + ww / 2 + 17, wy + wh + 8, 3, C(0xe88028)); pset(wx + ww / 2 + 9, wy + wh + 5, C(0xffc070));
  }
  // 座椅：蓝色的背，白色的靠背套
  for (const sx of o.seats || [30, 250, 470]) {
    rect(sx - 22, 120, 44, 150, K); rect(sx - 21, 121, 42, 149, seat); rect(sx + 10, 121, 11, 149, seatS);
    rect(sx - 20, 122, 40, 26, cover); rect(sx - 20, 146, 40, 2, C(0xd8d4c8)); for (let k = 0; k < 5; k++) pset(sx - 16 + k * 8, 130, C(0xd0ccc0));
  }
  // 窗光投进来：两块斜着的亮斑，电线杆的影子一下一下扫过
  const sweep = mod(t * 260 * (o.view?.speed ?? 1) / 150, 1);
  for (const [wx, wy, ww, wh] of wins) {
    poly([[wx + 10, wy + wh + 14], [wx + ww - 10, wy + wh + 14], [wx + ww + 60, H], [wx + 50, H]], C(o.light ?? 0xfff0c8), .22, 's');
    const bx = wx + 60 + sweep * (ww + 100) - 60;
    poly([[bx, 0], [bx + 10, 0], [bx + 70, H], [bx + 58, H]], C(0x1a1424), .22);
  }
}
