'use strict';
/* world.js —— 场景零件：天空、星星、银河、月亮、云、城市楼群、霓虹、轻轨、雨、水面倒影、树、草、花瓣、萤火虫、鸟、光束、焦外光斑、烟花、灯笼、海。
   不动的部分算一次缓存成图，会动的（闪灯、霓虹、雨、粒子）每帧按 t 画。 */

/* ---------------- 天空 ---------------- */
function skyC(key, w, h, stops, z = .6) { return cached('sky:' + key + w + 'x' + h, w, h, g => vgrad(g, 0, 0, w, h, stops, z)); }
const STARC = ['#FFFFFF', '#CFE0FF', '#FFF0C8', '#FFD0E8', '#BFF0FF'];
/* 星星：o {seed, n, x, y, w, h, ox 视差平移, tw 闪烁, a 透明度, big 亮星比例, col 统一颜色, fadeY 往下变淡的起点} */
function stars(g, t, o = {}) {
  const seed = o.seed || 1, n = o.n || 120, x0 = o.x || 0, y0 = o.y || 0, w = o.w || W, h = o.h || H, a = o.a ?? 1, big = o.big ?? .04;
  for (let i = 0; i < n; i++) {
    const x = x0 + mod(hash(i, seed) * w + (o.ox || 0) * (.6 + .4 * hash(i, seed + 7)), w), y = y0 + hash(i, seed + 1) * h;
    const b = hash(i, seed + 2), tw = .55 + .45 * Math.sin(t * (1.2 + 3.5 * hash(i, seed + 3)) + hash(i, seed + 4) * TAU);
    let al = a * (o.tw === 0 ? 1 : tw) * (o.fadeY ? clamp(1 - (y - o.fadeY) / 60) : 1);
    if (o.appear != null) al *= clamp((o.appear - hash(i, seed + 5)) * 6);
    if (al <= .05) continue;
    const c = o.col || STARC[fl(hash(i, seed + 6) * STARC.length)];
    g.globalAlpha = clamp(al);
    if (b > 1 - big) {                                     // 亮星：十字 + 光晕
      R(g, x - 1, y, 3, 1, c); R(g, x, y - 1, 1, 3, c);
      if (tw > .8) { R(g, x - 2, y, 1, 1, rgba(c, .6)); R(g, x + 2, y, 1, 1, rgba(c, .6)); R(g, x, y - 2, 1, 1, rgba(c, .6)); R(g, x, y + 2, 1, 1, rgba(c, .6)); }
      g.globalAlpha = 1; glow(g, x, y, 4, c, al * .35, 3);
    } else if (b > 1 - big * 4) R(g, x, y, 1, 1, c);
    else { g.globalAlpha = clamp(al * .55); R(g, x, y, 1, 1, c); }
  }
  g.globalAlpha = 1;
}
/* 银河：一条斜着的光带（噪声 + 抖动 + 密密的小星 + 暗尘带），缓存 */
function milkyWay(w, h, seed = 3, o = {}) {
  return cached(`mw:${w}:${h}:${seed}:${JSON.stringify(o)}`, w, h, g => {
    const ang = o.ang ?? -.35, ca = Math.cos(ang), sa = Math.sin(ang), cx = w * (o.cx ?? .5), cy = h * (o.cy ?? .45), wid = o.wid ?? h * .22;
    const cols = o.cols || ['#2A2A6A', '#4A3E8E', '#7E6AC0', '#C2B0F0', '#F4E8FF'];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const dx = x - cx, dy = y - cy, along = dx * ca + dy * sa, across = -dx * sa + dy * ca;
      const band = Math.exp(-(across * across) / (2 * wid * wid * (.6 + .8 * noise1(along / 60, seed))));
      const n = fbm(x / 26, y / 26, seed), dust = fbm(x / 14 + 9, y / 9, seed + 5);
      let v = band * (.35 + .9 * n) - (dust > .62 ? (dust - .62) * 2.2 * band : 0);
      v = clamp(v);
      if (v < .12) continue;
      const lv = v * (cols.length - .01), k = fl(lv), f = lv - k;
      const c = cols[Math.min(cols.length - 1, k)];
      if (k > 0 || f > .5) { const bth = BAYER4[(y & 3) * 4 + (x & 3)] / 16; g.fillStyle = f > bth && k + 1 < cols.length ? cols[k + 1] : c; g.globalAlpha = k === 0 ? .55 : .9; g.fillRect(x, y, 1, 1); }
    }
    g.globalAlpha = 1;
    for (let i = 0; i < w * h / 90; i++) {                 // 光带里密密的小星
      const x = hash(i, seed + 11) * w, y = hash(i, seed + 12) * h, dx = x - cx, dy = y - cy, across = -dx * sa + dy * ca;
      if (hash(i, seed + 13) < Math.exp(-(across * across) / (2 * wid * wid * 1.4))) { g.fillStyle = hash(i, seed + 14) > .8 ? '#FFFFFF' : '#D8D0FF'; g.fillRect(fl(x), fl(y), 1, 1); }
    }
  });
}
/* 月亮：满月带坑，r 半径 */
function moonSpr(r, o = {}) {
  return cached(`moon:${r}:${JSON.stringify(o)}`, 2 * r + 1, 2 * r + 1, g => {
    const c1 = o.c1 || '#FFF6DC', c2 = o.c2 || '#F2E2B8', c3 = o.c3 || '#DCC89C';
    disc(g, r, r, r, c2); disc(g, r - r * .12, r - r * .12, r * .86, c1);
    for (let i = 0; i < 9; i++) { const a = hash(i, 41) * TAU, d = hash(i, 42) * r * .7, cr = 1 + hash(i, 43) * r * .2; disc(g, r + Math.cos(a) * d, r + Math.sin(a) * d, cr, i % 3 ? c2 : c3); }
    if (o.phase) { g.globalCompositeOperation = 'destination-out'; disc(g, r + o.phase * r, r - r * .1, r * 1.02, '#000'); g.globalCompositeOperation = 'source-over'; }
  });
}
function moon(g, x, y, r, o = {}) {
  sglow(g, x, y, r * 6, o.glowCol || '#8890FF', .22 * (o.ga ?? 1)); glow(g, x, y, r * 2.6, o.haloCol || '#FFF0D0', .25 * (o.ga ?? 1), 4);
  blit(g, moonSpr(r, o), x - r, y - r);
}
/* 像素云：几个圆叠起来，左上亮、右下暗；pal [暗, 中, 亮, 最亮] */
function cloudSpr(seed, w, h, pal) {
  return cached(`cloud:${seed}:${w}:${h}:${pal}`, w, h, g => {
    const blobs = [], n = 4 + fl(hash(seed, 1) * 4);
    for (let i = 0; i < n; i++) { const u = (i + .5) / n, r = h * (.28 + .32 * Math.sin(u * PI) * (.7 + .5 * hash(i, seed + 2))); blobs.push([w * (.12 + .76 * u) + (hash(i, seed + 3) - .5) * 8, h - r - 2 - hash(i, seed + 4) * h * .15, r]); }
    const inside = (x, y) => y < h - 2 && blobs.some(([bx, by, r]) => (x - bx) ** 2 + (y - by) ** 2 < r * r);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (!inside(x, y)) continue;
      const lit = !inside(x - 2, y - 3), lit2 = !inside(x - 1, y - 1), shd = !inside(x + 2, y + 3) || y > h - 6;
      let c = pal[1];
      if (shd) c = pal[0]; else if (lit2) c = pal[3]; else if (lit) c = pal[2];
      else if (y > h * .62 && BAYER4[(y & 3) * 4 + (x & 3)] < 6) c = pal[0];
      g.fillStyle = c; g.fillRect(x, y, 1, 1);
    }
  });
}
/* 流星：t0 开始，dur 划完；(x,y) 起点，(dx,dy) 方向长度 */
function meteor(g, t, t0, x, y, dx, dy, o = {}) {
  const dur = o.dur || .7, u = (t - t0) / dur; if (u < 0 || u > 1.3) return;
  const hx = x + dx * Math.min(u, 1), hy = y + dy * Math.min(u, 1), len = o.len || 26, n = Math.hypot(dx, dy), ux = dx / n, uy = dy / n;
  const fade = u > 1 ? 1 - (u - 1) / .3 : 1;
  for (let k = 0; k < len; k++) { const a = (1 - k / len) * fade; if (a <= 0) continue; g.globalAlpha = a; R(g, hx - ux * k, hy - uy * k, 1, 1, k < 3 ? '#FFFFFF' : o.col || '#BFE4FF'); }
  g.globalAlpha = 1; if (u <= 1) glow(g, hx, hy, 5, '#DDF0FF', .7 * fade, 3);
}

/* ---------------- 雨 ----------------
   o：n 根数，sp 速度（像素/秒），len 长度，sl 斜率（每下落 1 像素横移多少），col，a，seed，x y w h 范围 */
function rain(g, t, o = {}) {
  const n = o.n || 150, sp = o.sp || 420, len = o.len || 8, sl = o.sl ?? .25, seed = o.seed || 5, x0 = o.x || 0, y0 = o.y || 0, w = o.w || W, h = o.h || H;
  g.fillStyle = o.col || 'rgba(190,210,255,.5)';
  for (let i = 0; i < n; i++) {
    const s = sp * (.8 + .4 * hash(i, seed + 2)), py = mod(hash(i, seed + 1) * (h + len) + t * s, h + len) - len;
    const px = x0 + mod(hash(i, seed) * (w + 40) + py * sl - 20, w + 40) - 20;
    for (let k = 0; k < len; k++) g.fillRect(ri(px + k * sl), ri(y0 + py + k), 1, 1);
  }
}
/* 雨点打在地上：小水花（一圈往外弹开的点），落在 y0~y1 的地面 */
function splashes(g, t, o = {}) {
  const n = o.n || 30, seed = o.seed || 9, x0 = o.x || 0, w = o.w || W, y0 = o.y0 ?? 230, y1 = o.y1 ?? 270, c = o.col || 'rgba(210,225,255,.8)';
  g.fillStyle = c;
  for (let i = 0; i < n; i++) {
    const per = .45 + hash(i, seed) * .4, u = mod(t + hash(i, seed + 1) * per, per) / per, k = fl((t + hash(i, seed + 1) * per) / per);
    const x = x0 + hash(i + k * 131, seed + 2) * w, y = y0 + hash(i + k * 131, seed + 3) * (y1 - y0);
    if (u < .25) { g.fillRect(ri(x), ri(y) - 1, 1, 1); }
    else if (u < .6) { const r = 1 + fl((u - .25) * 6); g.fillRect(ri(x - r), ri(y - 1), 1, 1); g.fillRect(ri(x + r), ri(y - 1), 1, 1); g.fillRect(ri(x - r + 1), ri(y - 2), 1, 1); g.fillRect(ri(x + r - 1), ri(y - 2), 1, 1); }
    else if (u < .8) { const r = 3; g.fillRect(ri(x - r), ri(y), 1, 1); g.fillRect(ri(x + r), ri(y), 1, 1); }
  }
}
/* 水面倒影：把 y 上面 h 行镜像到下面，带横向波纹、变暗、偏色 */
function reflect(g, y, h, t, o = {}) {
  y = ri(y); h = Math.min(h, H - y, y); if (h <= 0) return;
  const src = g.getImageData(0, y - h, W, h), dst = g.getImageData(0, y, W, h), s = src.data, d = dst.data;
  const amp = o.amp ?? 2, k = o.k ?? .55, tc = rgb(o.tint || '#203070'), tk = o.tk ?? .25, sp = o.sp ?? 5;
  for (let j = 0; j < h; j++) {
    const sj = h - 1 - j, off = ri(Math.sin(j * .9 + t * sp) * amp * (.3 + j / h) + Math.sin(j * 2.3 - t * 3) * .6);
    const fade = k * (1 - j / h * (o.fall ?? .6));
    if (o.broken && (j % 3 === 2)) continue;                    // 碎成一条条（雨天的水洼）
    for (let x = 0; x < W; x++) {
      const sx = Math.min(W - 1, Math.max(0, x + off)), si = (sj * W + sx) * 4, di = (j * W + x) * 4;
      const r = s[si] * (1 - tk) + tc[0] * tk, gg = s[si + 1] * (1 - tk) + tc[1] * tk, b = s[si + 2] * (1 - tk) + tc[2] * tk;
      d[di] = d[di] * (1 - fade) + r * fade; d[di + 1] = d[di + 1] * (1 - fade) + gg * fade; d[di + 2] = d[di + 2] * (1 - fade) + b * fade;
    }
  }
  g.putImageData(dst, 0, y);
}

/* ---------------- 树、草、花 ---------------- */
/* 一团叶子（缓存）：深 → 中 → 亮三层圆，亮面朝左上；flowers 撒栀子花 */
function leafClump(r, pal, seed, flowers = 0) {
  return cached(`clump:${r}:${pal}:${seed}:${flowers}`, 2 * r + 4, 2 * r + 4, g => {
    const c = r + 2;
    const blob = (cx, cy, rr, col) => { for (let y = -rr; y <= rr; y++) for (let x = -rr; x <= rr; x++) { const d = (x * x + y * y) / (rr * rr) + (hash(x + 99, y + 99, seed) - .5) * .35; if (d < 1) R(g, cx + x, cy + y, 1, 1, col); } };
    blob(c, c, r, pal[0]); blob(c - r * .15, c - r * .18, r * .78, pal[1]); blob(c - r * .32, c - r * .36, r * .45, pal[2]);
    for (let i = 0; i < r * 1.5; i++) { const a = hash(i, seed + 1) * TAU, d = hash(i, seed + 2) * r * .8; R(g, c + Math.cos(a) * d, c + Math.sin(a) * d, 1, 1, i % 3 ? pal[3] || pal[2] : pal[0]); }
    for (let i = 0; i < flowers; i++) {
      const a = hash(i, seed + 5) * TAU, d = Math.sqrt(hash(i, seed + 6)) * r * .85, x = c + Math.cos(a) * d, y = c + Math.sin(a) * d;
      if (r >= 9 && i % 3 === 0) { R(g, x - 1, y, 3, 1, GARD.w); R(g, x, y - 1, 1, 3, GARD.w); R(g, x, y, 1, 1, GARD.c); R(g, x + 1, y + 1, 1, 1, GARD.w3); }
      else { R(g, x, y, 2, 1, GARD.w); R(g, x, y + 1, 1, 1, GARD.w2); }
    }
  });
}
/* 树：trunk 树干色；clumps 叶团（相对位置、半径）；sway 风；flowers 每团花数 */
function tree(g, x, y, o, t) {
  const sc = o.s || 1, pal = o.pal || ['#1F5E3F', '#2E8B57', '#4FB06A', '#8FD16A'], tc = o.trunk || '#5A3A2A', seed = o.seed || 1;
  // 树干：往上变细，分两三个叉
  const th = ri(o.th || 40 * sc), tw = Math.max(2, ri(o.tw || 5 * sc));
  for (let j = 0; j < th; j++) { const w = Math.max(2, ri(tw * (1 - j / th * .45))); R(g, x - w / 2, y - j, w, 1, tc); R(g, x - w / 2, y - j, 1, 1, lt(tc, .25)); R(g, x + w / 2 - 1, y - j, 1, 1, dk(tc, .3)); }
  (o.branches || [[-1, .55], [1, .7], [-.5, .85]]).forEach(([dir, at], k) => {
    const by = y - th * at, len = 14 * sc * (.7 + .5 * hash(k, seed));
    for (let i = 0; i < len; i++) R(g, x + dir * i, by - i * .7, Math.max(1, ri(tw * .45 * (1 - i / len)) + 1), 1, tc);
  });
  const clumps = o.clumps || [[-18, -50, 14], [12, -56, 15], [-4, -70, 16], [24, -40, 11], [-26, -36, 11], [4, -44, 13]];
  clumps.forEach(([dx, dy, r], k) => {
    const sw = Math.sin(t * (o.sp || 1.1) + k * 1.3 + seed) * (o.sway ?? 1.2) * (-dy / 60);
    blit(g, leafClump(ri(r * sc), pal, seed * 10 + k, o.flowers || 0), x + dx * sc - r * sc - 2 + ri(sw), y + dy * sc - r * sc - 2);
  });
}
/* 草：一根根，尖端随风摆 */
function grass(g, x0, x1, y, t, o = {}) {
  const pal = o.pal || ['#2E7A3F', '#3E9A4E', '#5CBF5E', '#8FDA6A'], hmax = o.h || 6, seed = o.seed || 3, step = o.step || 1, wind = o.wind ?? 1;
  for (let x = x0; x < x1; x += step) {
    const h = 2 + fl(hash(x, seed) * hmax), c = pal[fl(hash(x, seed + 1) * pal.length)], sw = Math.sin(t * 2.2 + x * .13) * wind + (o.lean || 0);
    for (let j = 0; j < h; j++) { const dx = ri(sw * (j / h) * (j / h) * 2); R(g, x + dx, y - j, 1, 1, j === h - 1 ? lt(c, .2) : c); }
  }
}
/* 飘落的花瓣：o {n, x, y, w, h, sp 下落速度, wind 横风, seed, big, col} */
function petals(g, t, o = {}) {
  const n = o.n || 30, seed = o.seed || 21, w = o.w || W, h = o.h || H, x0 = o.x || 0, y0 = o.y || 0, sp = o.sp || 22, wind = o.wind ?? 10;
  for (let i = 0; i < n; i++) {
    const s = sp * (.7 + .6 * hash(i, seed + 2)), py = mod(hash(i, seed + 1) * h + t * s, h);
    const px = x0 + mod(hash(i, seed) * w + t * wind * (.6 + .8 * hash(i, seed + 3)) + Math.sin(t * 1.7 + i) * 6, w);
    petal(g, px, y0 + py, t * (2 + 3 * hash(i, seed + 4)) + i, { big: o.big && hash(i, seed + 5) > .5, col: o.col });
  }
}
/* 萤火虫：慢慢游走，一明一暗 */
function fireflies(g, t, o = {}) {
  const n = o.n || 20, seed = o.seed || 31, x0 = o.x || 0, y0 = o.y || 0, w = o.w || W, h = o.h || H, c = o.col || '#E6FF8A';
  for (let i = 0; i < n; i++) {
    const x = x0 + w * noise1(t * .12 + i * 7.3, seed + i) * 1.1 - w * .05, y = y0 + h * noise1(t * .1 + i * 3.1, seed + i + 50);
    const b = clamp(Math.sin(t * (1.5 + hash(i, seed) * 2) + i * 2.1) * .8 + .5) * (o.a ?? 1);
    if (b < .1) continue;
    R(g, x, y, 1, 1, lt(c, .5)); glow(g, x, y, 4, c, b * .8, 3);
  }
}
/* 鸟：一群往一个方向飞，翅膀两帧 */
function birds(g, t, o = {}) {
  const n = o.n || 6, seed = o.seed || 41, c = o.col || '#1A1A2A', dir = o.dir || 1;
  for (let i = 0; i < n; i++) {
    const sp = (o.sp || 30) * (.85 + .3 * hash(i, seed)), x = (o.x || 0) + dir * (t * sp) + hash(i, seed + 1) * 50 * dir * -1 - i * 9 * dir;
    const y = (o.y || 60) + hash(i, seed + 2) * 30 + Math.sin(t * 2 + i) * 2 + i * 2;
    const up = fl(t * 8 + i * 1.7) % 2;
    if (up) { P(g, x - 2, y - 1, c); P(g, x - 1, y, c); P(g, x, y, c); P(g, x + 1, y, c); P(g, x + 2, y - 1, c); }
    else { P(g, x - 2, y + 1, c); P(g, x - 1, y, c); P(g, x, y, c); P(g, x + 1, y, c); P(g, x + 2, y + 1, c); }
  }
}
/* 蝴蝶 */
function butterfly(g, x, y, t, c = '#FFF4A8') {
  const up = fl(t * 10) % 2;
  if (up) { R(g, x - 2, y - 1, 2, 2, c); R(g, x + 1, y - 1, 2, 2, c); } else { R(g, x - 1, y, 1, 2, c); R(g, x + 1, y, 1, 2, c); }
  P(g, x, y, '#3A2A1A');
}
/* 光束：从 (x,y) 往下斜射的几道光，lighter 叠加 */
function rays(g, x, y, t, o = {}) {
  const n = o.n || 5, ang = o.ang ?? .35, len = o.len || 300, c = o.col || '#FFF2C0', a = o.a ?? .12, spread = o.spread || 60;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const off = (i - (n - 1) / 2) * spread / n + Math.sin(t * .4 + i) * 4, w0 = 3 + hash(i, 61) * 8, w1 = w0 * 3.5;
    const al = a * (.5 + .5 * noise1(t * .5 + i * 3, 62));
    const dx = Math.sin(ang) * len, dy = Math.cos(ang) * len, x0 = x + off;
    g.globalAlpha = al; poly(g, [[x0, y], [x0 + w0, y], [x0 + dx + w1, y + dy], [x0 + dx, y + dy]], c);
  }
  g.restore();
}
/* 焦外光斑：大圆片，边一圈亮 */
function bokeh(g, t, o = {}) {
  const n = o.n || 10, seed = o.seed || 71, cols = o.cols || ['#FFD27A', '#FF7FB0', '#7FD8FF'], rmin = o.rmin || 6, rmax = o.rmax || 16;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const r = ri(hr(i, seed, rmin, rmax)), x = (o.x || 0) + mod(hash(i, seed + 1) * (o.w || W) + t * (o.vx || 4) * (hash(i, seed + 2) - .3), (o.w || W) + 2 * r) - r;
    const y = (o.y || 0) + hash(i, seed + 3) * (o.h || H) + Math.sin(t * .6 + i) * 3, c = cols[i % cols.length];
    const a = (o.a ?? .18) * (.6 + .4 * Math.sin(t * .8 + i * 1.7));
    g.globalAlpha = a; disc(g, x, y, r, c); g.globalAlpha = a * .9; ring(g, x, y, r, lt(c, .3));
  }
  g.restore();
}

/* ---------------- 烟花 ----------------
   firework(g, t, t0, x, y, o)：t0 炸开；o {col, col2, r 半径, n 粒子数, kind 'peony'|'willow'|'ring'|'heart'|'flower', rise 升空时长, x0 y0 发射点, life} */
function firework(g, t, t0, x, y, o = {}) {
  const rise = o.rise ?? .7, c = o.col || '#FF6A8A', c2 = o.col2 || '#FFF0A0', R0 = o.r || 40, n = o.n || 50, kind = o.kind || 'peony', life = o.life || 2.6;
  if (t < t0 - rise || t > t0 + life) return;
  if (t < t0) {                                             // 升空：一个亮点拖着火星往上
    const u = (t - (t0 - rise)) / rise, sx = o.x0 ?? x, sy = o.y0 ?? H, hy = lerp(sy, y, E.out(u)), hx = lerp(sx, x, u);
    R(g, hx, hy, 2, 2, '#FFF6D8'); glow(g, hx, hy, 5, '#FFE0A0', .7, 3);
    for (let k = 1; k < 10; k++) { g.globalAlpha = 1 - k / 10; R(g, hx + Math.sin(k * 1.7 + t * 30) * .6, hy + k * 2.2, 1, 1, '#FFC870'); }
    g.globalAlpha = 1; return;
  }
  const u = (t - t0) / life, G = kind === 'willow' ? 46 : 24;
  const pos = (ang, rr, uu) => { const e = E.out3(clamp(uu * 2.4)); return [x + Math.cos(ang) * rr * e, y + Math.sin(ang) * rr * e + uu * uu * G]; };
  if (u < .12) { glow(g, x, y, R0 * .9, lt(c, .6), (1 - u / .12) * .8, 6); R(g, x - 2, y - 2, 4, 4, '#FFFFFF'); }
  const fade = clamp(1.3 - u * 1.3);
  for (let i = 0; i < n; i++) {
    let ang = i / n * TAU + hash(i, 7) * .08, rr = R0 * (.88 + .12 * hash(i, 8));
    if (kind === 'heart') { const a = i / n * TAU, hx = 16 * Math.pow(Math.sin(a), 3), hy = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); ang = Math.atan2(hy, hx); rr = R0 * Math.hypot(hx, hy) / 17; }
    if (kind === 'flower') rr = R0 * (.5 + .5 * Math.abs(Math.cos(3 * ang)));
    if (kind === 'ring') rr = R0;
    const col = u < .18 ? '#FFFFFF' : u < .55 ? c : c2, tw = u > .6 ? (hash(i, fl(t * 18)) > .45 ? 1 : .15) : 1;
    // 拖尾：往回取几个时刻的位置
    const tl = kind === 'willow' ? 10 : 6;
    for (let k = tl; k >= 1; k--) { const [px, py] = pos(ang, rr, Math.max(0, u - k * .012)); g.globalAlpha = fade * (1 - k / (tl + 1)) * .8; R(g, px, py, 1, 1, k < 3 ? col : dk(col, .15 + k * .05)); }
    const [px, py] = pos(ang, rr, u); g.globalAlpha = fade * tw;
    if (u < .55) R(g, px - 1, py - 1, 2, 2, col); else R(g, px, py, 1, 1, col);
    if (i % 3 === 0) { g.globalAlpha = 1; glow(g, px, py, 4, col, .4 * fade * tw, 3); }
  }
  g.globalAlpha = 1;
  if (u < .5) glow(g, x, y, R0 * 1.2, c, .12 * (1 - u * 2), 6);
}
/* 灯笼：红纸灯笼，里面亮 */
function lantern(g, x, y, s, t, o = {}) {
  const c = o.col || '#E8452E', sw = ri(Math.sin(t * 1.4 + x * .1) * (o.sway ?? 1));
  x += sw; const rx = ri(4 * s), ry = ri(5 * s);
  glow(g, x, y, ri(14 * s), '#FF8040', .3, 3);
  ell(g, x, y, rx, ry, dk(c, .2)); ell(g, x - 1, y - 1, rx - 1, ry - 1, c); ell(g, x - 1, y - 1, rx * .5, ry * .7, lt(c, .35));
  for (let k = -ry + 2; k < ry; k += 3) R(g, x - rx + 1, y + k, rx * 2 - 1, 1, rgba('#7A1A10', .35));
  R(g, x - ri(2 * s), y - ry - 1, ri(4 * s), 2, '#2A1A10'); R(g, x - ri(2 * s), y + ry - 1, ri(4 * s), 2, '#2A1A10');
  if (o.tassel !== false) { R(g, x, y + ry + 1, 1, ri(3 * s), '#FFC040'); }
}
/* 海面：横向的波光条，sunX 有太阳（月亮）的倒影光柱 */
function sea(g, y0, y1, t, o = {}) {
  const pal = o.pal || ['#1C3C7A', '#2A5AA0', '#3E78C0'], hl = o.hl || '#FFE6A0';
  vgrad(g, 0, y0, W, y1 - y0, [[0, pal[2]], [.5, pal[1]], [1, pal[0]]], .5);
  for (let y = y0 + 1; y < y1; y += 2) {
    const d = (y - y0) / (y1 - y0), n = 3 + fl(d * 10);
    for (let i = 0; i < n * 3; i++) {
      const x = mod(hash(i, y) * W + t * (6 + d * 10) * (hash(i, y + 1) > .5 ? 1 : -1), W), len = 1 + fl(d * 6 * hash(i, y + 2));
      const on = Math.sin(t * 3 + i + y) > .2; if (!on) continue;
      R(g, x, y, len, 1, i % 4 ? lt(pal[2], .25) : lt(pal[2], .5));
    }
  }
  if (o.sunX != null) for (let y = y0; y < y1; y++) {
    const d = (y - y0) / (y1 - y0), hw = 3 + d * (o.sunW || 26), k = Math.sin(y * 1.7 + t * 4) * .5 + .5;
    if (fl(y + t * 6) % 2 === 0) R(g, o.sunX - hw * k, y, hw * 2 * k, 1, hl);
  }
}
