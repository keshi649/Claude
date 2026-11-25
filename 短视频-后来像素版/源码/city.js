'use strict';
/* city.js —— 城市：一排排楼（远、中层，带雾）、近处细画的楼面（阳台、晾衣服、空调、竖招牌、管子）、霓虹、电线上的小灯。
   楼的不动部分缓存成图；闪灯、霓虹、电视光、开关的窗每帧按 t 画。 */
const WARM = ['#FFD27A', '#FFC060', '#FFE6A8', '#FFB070'], COOL = ['#9FD8FF', '#C8EEFF', '#86B8FF', '#E0F4FF'];
const NEONC = ['#FF4FA0', '#3FF0FF', '#FFE14F', '#B66CFF', '#FF6A3D', '#5CFF9D'];
const neonOn = (t, seed) => { const u = mod(t * 7 + seed * 3.7, 23); return !(u > 21.3 && u < 21.7) && !(u > 22.2 && u < 22.5); };

/* 一排楼：o {w h base seed hmin hmax wmin wmax gap col col2 ws 窗大小 lit 亮窗比例 warm fog fogA glow 地面光 signs signP rim tallAt}
   返回 {C, lights, neons, tvs} */
function makeCity(key, o) {
  const k = 'city:' + key; let cty = CACHE.get(k); if (cty) return cty;
  const C = mk(o.w, o.h), g = C.getContext('2d'); g.imageSmoothingEnabled = false;
  const lights = [], neons = [], tvs = [], seed = o.seed || 1, ws = o.ws || 1;
  let x = -fl(hash(seed, 1) * 12), i = 0;
  while (x < o.w) {
    const st = hash(i, seed + 20), style = st < .4 ? 'res' : st < .65 ? 'office' : st < .85 ? 'glass' : 'old';
    let bw = ri(hr(i, seed, o.wmin, o.wmax)), bh = ri(hr(i, seed + 1, o.hmin, o.hmax));
    if (style === 'old') bh = ri(bh * .6);
    if (o.tallAt != null && Math.abs(x + bw / 2 - o.tallAt) < bw) bh = ri(o.hmax * 1.25);
    const top = o.base - bh;
    let wc = mix(o.col, o.col2 || o.col, hash(i, seed + 2));
    if (style === 'glass') wc = mix(wc, '#203060', .35);
    const roof = hash(i, seed + 3);
    // 身子 + 顶
    R(g, x, top, bw, bh, wc);
    if (roof < .25 && bw > 16) { R(g, x + 3, top - 6, bw - 6, 6, wc); R(g, x + 3, top - 6, bw - 6, 1, lt(wc, .15)); if (roof < .12) { R(g, x + bw / 2 - 1, top - 20, 2, 14, wc); lights.push({ x: x + bw / 2, y: top - 21, c: '#FF3040', ph: hash(i, 4) * 3, per: 1.6 }); } }
    else if (roof < .4) { for (let j = 0; j < 6; j++) R(g, x + j, top - 6 + j, bw - 2 * j, 1, wc); }
    else if (roof < .55 && bw > 12) { const tx = x + 2 + fl(hash(i, 5) * (bw - 10)); R(g, tx, top - 7, 7, 5, dk(wc, .15)); R(g, tx, top - 7, 7, 1, lt(wc, .2)); R(g, tx + 1, top - 2, 1, 2, wc); R(g, tx + 5, top - 2, 1, 2, wc); }
    else if (roof < .75) { const ax = x + 2 + fl(hash(i, 6) * (bw - 4)), ah = 8 + fl(hash(i, 7) * 16); R(g, ax, top - ah, 1, ah, lt(wc, .12)); lights.push({ x: ax, y: top - ah - 1, c: '#FF3040', ph: hash(i, 8) * 3, per: 1.3 + hash(i, 9) }); }
    R(g, x, top, bw, 1, lt(wc, .16));
    if (style === 'glass') {                                   // 玻璃楼：竖条反光 + 细格子 + 顶上一道灯带
      for (let yy = top + 2; yy < o.base; yy++) { const v = (yy - top) / bh; R(g, x + 2, yy, Math.max(1, ri(bw * .25)), 1, rgba('#8AA0E0', .1 + .1 * Math.sin(v * 6))); }
      for (let xx = x + 3; xx < x + bw - 1; xx += 3 + ws) R(g, xx, top + 2, 1, bh - 2, lt(wc, .07));
      for (let yy = top + 4; yy < o.base; yy += 3 + ws) R(g, x + 1, yy, bw - 2, 1, lt(wc, .05));
      const lc = NEONC[fl(hash(i, 10) * 3)]; R(g, x + 1, top + 1, bw - 2, 1, lc); neons.push({ glowOnly: true, x: x + bw / 2, y: top + 1, c: lc, r: bw * .6, seed: i });
    }
    // 窗户：按噪声成片地亮（不是每扇随机）
    const sx = ws + 1 + (style === 'res' ? 1 : 0), sy = ws + (style === 'office' ? 2 : 3);
    const warmB = hash(i, seed + 11) < (o.warm ?? .65);
    for (let wy = top + 3, row = 0; wy < o.base - ws - 1; wy += sy, row++) {
      if (style === 'office') {                                 // 横条窗：一层一条
        const on = noise2(i * 3.1, row * .55, seed) > 1 - (o.lit ?? .4) * 1.1;
        const c = on ? (warmB ? WARM[2] : COOL[(row + i) % 4]) : lt(wc, .07);
        R(g, x + 2, wy, bw - 4, ws, c);
        if (on) for (let xx = x + 4; xx < x + bw - 3; xx += 4) R(g, xx, wy, 1, ws, dk(c, .3));
        continue;
      }
      if (style === 'glass') { if (noise2(i * 2.3, row * .8, seed + 3) > .78) R(g, x + 2, wy, bw - 4, ws, rgba(COOL[1], .7)); continue; }
      for (let wx = x + 2, col = 0; wx + ws <= x + bw - 2; wx += sx, col++) {
        const n = noise2(col * .45 + i * 7, row * .7, seed + 1) + hash(col * 37 + row, i + seed) * .25;
        if (n > 1.05 - (o.lit ?? .4)) {
          const pal = (hash(col, row + i * 50) < .85) === warmB ? WARM : COOL, c = pal[fl(hash(col + 9, row + i) * 4)];
          R(g, wx, wy, ws, ws, c);
          if (ws >= 2) { const dd = hash(col * 3 + row * 7, i + 99); if (dd < .2) R(g, wx + ws - 1, wy, 1, ws, dk(c, .35)); else if (dd > .97) tvs.push({ x: wx, y: wy, w: ws, h: ws, ph: dd * 50 }); }
        } else R(g, wx, wy, ws, ws, lt(wc, .06));
      }
      if (style === 'res' && row % 2 === 1 && ws >= 2) R(g, x + 1, wy + ws + 1, bw - 2, 1, lt(wc, .1));   // 阳台的一道
    }
    if (o.rim) { R(g, x, top, 1, bh, rgba(o.rim[0], .5)); R(g, x + bw - 1, top, 1, bh, rgba(o.rim[1], .35)); }
    // 招牌
    if (o.signs && hash(i, seed + 12) < (o.signP ?? .3) && bh > 50) {
      const s2 = o.signs[fl(hash(i, seed + 13) * o.signs.length)], c = NEONC[fl(hash(i, seed + 14) * NEONC.length)];
      if (/[一-鿿]/.test(s2)) neons.push({ s: s2, x: x + (hash(i, 15) > .5 ? 1 : bw - 15), y: top + 8 + fl(hash(i, 16) * Math.max(1, bh - 26 - [...s2].length * 13)), c, v: true, seed: i * 7 + seed });
      else neons.push({ s: s2, x: x + fl((bw - tinyW(s2) - 4) / 2), y: top + 5 + fl(hash(i, 17) * Math.min(30, bh / 3)), c, v: false, seed: i * 7 + seed });
    }
    x += bw + ri(hr(i, seed + 5, 0, o.gap ?? 2)); i++;
  }
  // 雾：越往下越亮（地面的光把雨雾照亮）
  if (o.fog) {
    g.globalCompositeOperation = 'source-atop';
    for (let y = 0; y < o.h; y++) { const v = clamp((y - (o.base - o.h * .9)) / (o.h * .9)); g.fillStyle = rgba(o.fog, (o.fogA ?? .3) * (.35 + .65 * v * v)); g.fillRect(0, y, o.w, 1); }
    g.globalCompositeOperation = 'source-over';
  }
  cty = { C, lights, neons, tvs, w: o.w, h: o.h }; CACHE.set(k, cty); return cty;
}
function drawCity(g, cty, x, y, t, o = {}) {
  x = ri(x); y = ri(y);
  g.drawImage(cty.C, x, y);
  const a = o.a ?? 1;
  cty.lights.forEach(L => { if (mod(t + L.ph, L.per) < .45) { R(g, x + L.x, y + L.y, 1, 1, L.c); glow(g, x + L.x, y + L.y, 3, L.c, .6 * a, 2); } });
  cty.tvs.forEach(T => { const c = ['#7AB8FF', '#C8E0FF', '#5A88E0', '#FFFFFF'][fl(t * 3 + T.ph) % 4]; R(g, x + T.x, y + T.y, T.w, T.h, c); });
  cty.neons.forEach(N => {
    if (N.glowOnly) { glow(g, x + N.x, y + N.y, N.r, N.c, .18 * a, 3); return; }
    const on = neonOn(t, N.seed), c = on ? N.c : dk(N.c, .65);
    if (N.v) neonV(g, x + N.x, y + N.y, N.s, c, on, a);
    else { const bx = x + N.x, by = y + N.y, w = tinyW(N.s) + 4; R(g, bx, by, w, 9, '#100A1C'); ring2(g, bx, by, w, 9, c); tiny(g, N.s, bx + 2, by + 2, on ? lt(c, .35) : c); if (on) glow(g, bx + w / 2, by + 4, w * .8, c, .32 * a, 3); }
  });
}
/* 竖招牌：深底板、亮边、一列字 */
function neonV(g, bx, by, s, c, on = true, a = 1) {
  const n = [...s].length;
  R(g, bx - 1, by - 2, 14, n * 13 + 3, '#100A1C'); ring2(g, bx - 1, by - 2, 14, n * 13 + 3, on ? c : dk(c, .4));
  [...s].forEach((chh, j) => txt(g, chh, bx, by + j * 13, on ? lt(c, .4) : dk(c, .3)));
  if (on) glow(g, bx + 6, by + n * 6, 8 + n * 5, c, .3 * a, 3);
}
function ring2(g, x, y, w, h, c) { R(g, x, y, w, 1, c); R(g, x, y + h - 1, w, 1, c); R(g, x, y, 1, h, c); R(g, x + w - 1, y, 1, h, c); }

/* ---------------- 近处的楼面（细画）：facade(key, w, h, o) 缓存不动的部分，返回 {C, dyn} ----------------
   一层 26 像素：两三扇窗（亮的有窗帘、人影、台灯）、阳台（栏杆、盆栽、晾的衣服、空调外机）、竖管子；
   o {seed, col, floors, signs: [{s, c, x, y}], side 'l'|'r'（朝街那边打霓虹边光）, shop 一楼店面} */
function facade(key, w, h, o) {
  const k = 'fac:' + key; let F = CACHE.get(k); if (F) return F;
  const C = mk(w, h), g = C.getContext('2d'), seed = o.seed || 1, wc = o.col || '#1A1430', dyn = [];
  R(g, 0, 0, w, h, wc);
  for (let x = 6; x < w; x += 18) R(g, x, 0, 1, h, lt(wc, .04));            // 墙板缝
  const fh = 26, nfl = Math.ceil(h / fh);
  for (let f = 0; f < nfl; f++) {
    const y = h - (o.shop ? 40 : 0) - (f + 1) * fh; if (y + fh < 0) break;
    R(g, 0, y + fh - 2, w, 2, lt(wc, .1)); R(g, 0, y + fh - 1, w, 1, dk(wc, .3));   // 楼板
    const nw = w > 110 ? 3 : 2, ww = 14, wh = 12, gap = (w - nw * ww) / (nw + 1);
    for (let j = 0; j < nw; j++) {
      const wx = ri(gap + j * (ww + gap)), wy = y + 6, hh = hash(f * 7 + j, seed);
      R(g, wx - 1, wy - 1, ww + 2, wh + 2, lt(wc, .12));
      if (hh < .55) {                                          // 亮窗：暖光、窗帘、人影、台灯
        const c = hh < .4 ? WARM[fl(hh * 10) % 4] : COOL[fl(hh * 10) % 4];
        vgrad(g, wx, wy, ww, wh, [[0, lt(c, .2)], [1, dk(c, .25)]], .7);
        R(g, wx, wy, 3, wh, dk(c, .35)); R(g, wx + ww - 3, wy, 3, wh, dk(c, .35));
        if (hh < .18) { R(g, wx + 6, wy + 4, 3, 3, '#3A2438'); R(g, wx + 5, wy + 7, 5, 5, '#3A2438'); }
        else if (hh < .3) { R(g, wx + 9, wy + 7, 3, 1, '#2A1A20'); R(g, wx + 10, wy + 5, 1, 2, '#2A1A20'); R(g, wx + 9, wy + 4, 3, 1, '#FFF6D0'); }
        else if (hh > .5) dyn.push({ kind: 'tv', x: wx + 3, y: wy, w: ww - 6, h: wh, ph: hh * 40 });
        R(g, wx + ww / 2, wy, 1, wh, dk(c, .45));
      } else {
        R(g, wx, wy, ww, wh, dk(wc, .2)); R(g, wx + 1, wy + 1, 4, 1, lt(wc, .15)); R(g, wx + ww / 2, wy, 1, wh, wc);
      }
      // 阳台上的东西
      const b = hash(f * 13 + j, seed + 3);
      if (b < .25) { for (let px = 0; px < 3; px++) { R(g, wx + 1 + px * 5, wy + wh + 3, 4, 3, '#7A4A3A'); disc(g, wx + 3 + px * 5, wy + wh + 1, 2, ['#2E8B57', '#4FB06A', '#3E9A4E'][px]); } }
      else if (b < .45) { R(g, wx - 2, wy - 3, ww + 4, 1, '#6A6A80'); ['#E8505B', '#F2EEE8', '#3E7FE0', '#F2C94C'].forEach((cc, q) => { if (hash(q, f + j * 9 + seed) < .7) R(g, wx + q * 4, wy - 2, 3, 5 + (q % 2) * 2, cc); }); dyn.push({ kind: 'cloth', x: wx, y: wy - 2, f, j }); }
      else if (b < .62) { R(g, wx + ww + 1, wy + wh - 6, 7, 6, '#9098B0'); R(g, wx + ww + 1, wy + wh - 6, 7, 1, '#B8C0D8'); ring(g, wx + ww + 4, wy + wh - 3, 2, '#5A6078'); dyn.push({ kind: 'drip', x: wx + ww + 6, y: wy + wh, ph: b * 9 }); }
    }
    R(g, 0, y + fh - 4, w, 1, rgba('#B0B8D0', .25)); for (let x = 1; x < w; x += 3) R(g, x, y + fh - 8, 1, 4, rgba('#B0B8D0', .22));   // 栏杆
  }
  // 竖着的管子
  const px = o.side === 'l' ? w - 8 : 6;
  R(g, px, 0, 2, h, '#3A3450'); R(g, px, 0, 1, h, '#5A5470'); for (let y = 10; y < h; y += 40) R(g, px - 1, y, 4, 2, '#4A4460');
  // 朝街一侧的霓虹边光
  if (o.side) { const ex = o.side === 'l' ? w - 2 : 0; R(g, ex, 0, 2, h, rgba(o.rimCol || '#FF4FA0', .55)); }
  if (o.shop) { R(g, 0, h - 40, w, 40, '#140E22'); }
  F = { C, dyn, w, h }; CACHE.set(k, F); return F;
}
function drawFacade(g, F, x, y, t, o = {}) {
  x = ri(x); y = ri(y); g.drawImage(F.C, x, y);
  F.dyn.forEach(d => {
    if (d.kind === 'tv') { if (mod(t * .7 + d.ph, 6) < 4) R(g, x + d.x, y + d.y, d.w, d.h, rgba(['#6A9CFF', '#B8D4FF', '#4A70D0'][fl(t * 4 + d.ph) % 3], .55)); }
    else if (d.kind === 'drip') { const u = mod(t * 1.3 + d.ph, 1); if (u < .7) R(g, x + d.x, y + d.y + u * 14, 1, 2, '#BFD8FF'); }
  });
}
/* 楼与楼之间挂的一串小灯（悬链线） */
function stringLights(g, x0, y0, x1, y1, sag, t, o = {}) {
  const n = o.n || 14, c = o.cols || ['#FFD27A', '#FF7FB0', '#7FE8FF', '#FFF2B0'];
  for (let i = 0; i <= 60; i++) { const u = i / 60, x = lerp(x0, x1, u), y = lerp(y0, y1, u) + Math.sin(u * PI) * sag; R(g, x, y, 1, 1, o.wire || '#0E0A18'); }
  for (let i = 1; i < n; i++) {
    const u = i / n, x = lerp(x0, x1, u), y = lerp(y0, y1, u) + Math.sin(u * PI) * sag + 1, on = Math.sin(t * 2.2 + i * 1.3) > -.6;
    const cc = c[i % c.length]; R(g, x, y, 1, 2, on ? cc : dk(cc, .5)); if (on) glow(g, x, y + 1, 4, cc, .5, 2);
  }
}
