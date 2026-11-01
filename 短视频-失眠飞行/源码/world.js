'use strict';
/* world.js：室外的场景。夜里的城市（远、中、近三层楼，可以横向平铺）、低空飞过的屋顶、云海。
   楼和窗户都在开头生成一次（buildWorld），每帧只是按视差贴图。 */

const CITY = {};
/* 一层楼：w×h 的画布，横向可以平铺。o：hmin, hmax, wmin, wmax, col（楼的颜色）, haze（底部雾气颜色）, win（窗户 [宽, 高, 间距]）, lit（亮灯比例）, seed */
function buildCityLayer(w, h, o) {
  const c = mk(w, h), g = c.getContext('2d'), r = R(o.seed);
  const lights = [];
  let x = -20;
  while (x < w) {
    const bw = o.wmin + r() * (o.wmax - o.wmin), bh = o.hmin + Math.pow(r(), 1.3) * (o.hmax - o.hmin);
    const top = h - bh, col = mixc(o.col, o.col2 || o.col, r());
    const bx = x;
    // 楼身
    g.fillStyle = col; g.fillRect(bx, top, bw, bh);
    // 楼顶的花样
    const kind = r();
    if (kind < .2) { g.fillRect(bx + bw * .2, top - bh * .08, bw * .6, bh * .08 + 1); g.fillRect(bx + bw * .35, top - bh * .14, bw * .3, bh * .06 + 1); }
    else if (kind < .32) { g.beginPath(); g.moveTo(bx, top); g.lineTo(bx + bw / 2, top - bw * .35); g.lineTo(bx + bw, top); g.fill(); }
    else if (kind < .45) { g.fillRect(bx + bw * .45, top - 70 * o.k, 3 * o.k, 70 * o.k); lights.push([bx + bw * .45 + 1.5 * o.k, top - 70 * o.k, 'red']); }
    else if (kind < .58) { const tw = bw * .3; g.fillRect(bx + bw * .6, top - tw * .9, tw, tw * .7); g.fillRect(bx + bw * .6 + tw * .1, top - tw * .2, 2 * o.k, tw * .2); g.fillRect(bx + bw * .6 + tw * .8, top - tw * .2, 2 * o.k, tw * .2); }
    // 窗户
    const [ww, wh, gap] = o.win;
    const cols = Math.max(1, Math.floor((bw - gap) / (ww + gap))), rows = Math.floor((bh - gap * 2) / (wh + gap * 1.4));
    const mx = bx + (bw - cols * (ww + gap) + gap) / 2;
    const litP = o.lit * (.4 + r() * 1.2);
    for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
      const wx = mx + i * (ww + gap), wy = top + gap * 1.5 + j * (wh + gap * 1.4);
      if (wy + wh > h - 4) continue;
      const lit = r() < litP;
      if (lit) {
        const wc = r() < .78 ? (r() < .5 ? '#FFD48A' : '#FFC274') : (r() < .5 ? '#BFD6FF' : '#E8C8FF');
        g.fillStyle = wc; g.fillRect(wx, wy, ww, wh);
        lights.push([wx + ww / 2, wy + wh / 2, wc]);
        if (r() < .3) { g.fillStyle = rgba('#000000', .25); g.fillRect(wx, wy, ww * .45, wh); }   // 窗帘
      } else { g.fillStyle = rgba('#000000', .18); g.fillRect(wx, wy, ww, wh); }
    }
    x += bw + (r() < .3 ? r() * 12 * o.k : 0);
  }
  // 窗户的光晕（烘焙进贴图）
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [lx, ly, lc] of lights) {
    if (lc === 'red') { g.fillStyle = rgrad(g, lx, ly, 0, 9 * o.k, [[0, 'rgba(255,80,80,.9)'], [1, 'rgba(255,80,80,0)']]); g.fillRect(lx - 9 * o.k, ly - 9 * o.k, 18 * o.k, 18 * o.k); continue; }
    const rr_ = o.win[0] * 2.2;
    g.fillStyle = rgrad(g, lx, ly, 0, rr_, [[0, rgba(lc, .22)], [1, rgba(lc, 0)]]); g.fillRect(lx - rr_, ly - rr_, rr_ * 2, rr_ * 2);
  }
  g.restore();
  // 底部的雾气
  if (o.haze) { g.globalCompositeOperation = 'source-atop'; g.fillStyle = vgrad(g, h * .35, h, [[0, rgba(o.haze, 0)], [1, rgba(o.haze, o.hazeA ?? .55)]]); g.fillRect(0, 0, w, h); g.globalCompositeOperation = 'source-over'; }
  return { c, lights, w, h };
}
/* 贴一层：x 是视差偏移（越大越往左），yb 是这层的底边，sc 缩放 */
function cityLayer(g, L, x, yb, sc = 1, a = 1) {
  const w = L.w * sc, h = L.h * sc;
  let x0 = -(((x % w) + w) % w);
  withAlpha(g, a, () => { for (; x0 < W; x0 += w) g.drawImage(L.c, x0, yb - h, w + 1, h); });
}

/* 低空飞过的屋顶：大一号的楼顶，带水箱、天线、晾衣绳、空调外机、盆栽，有几只猫 */
function buildRoofs(w, h, seed) {
  const c = mk(w, h), g = c.getContext('2d'), r = R(seed);
  let x = 0;
  const items = [];
  while (x < w - 100) {
    const bw = 260 + r() * 420, top = h * (.28 + r() * .35);
    const body = mixc('#151A3E', '#1E2350', r());
    g.fillStyle = body; g.fillRect(x, top, bw, h - top);
    // 屋顶边沿（被月光照亮的一道）
    g.fillStyle = mixc('#3A4380', '#4C55A0', r()); g.fillRect(x - 4, top - 10, bw + 8, 12);
    g.fillStyle = 'rgba(190,205,255,.35)'; g.fillRect(x - 4, top - 10, bw + 8, 3);
    // 窗户
    for (let j = 0; j < 4; j++) for (let i = 0; i < Math.floor(bw / 70); i++) {
      const wx = x + 24 + i * 70, wy = top + 40 + j * 90;
      if (wy > h - 30) continue;
      const lit = r() < .3, wc = r() < .8 ? '#C9A26E' : '#93A6C9';
      g.fillStyle = lit ? wc : 'rgba(0,0,0,.2)'; g.fillRect(wx, wy, 34, 46);
      if (lit) { g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(wx + 16, wy, 2, 46); g.fillRect(wx, wy + 22, 34, 2); }
    }
    // 屋顶上的东西
    const n = 1 + Math.floor(r() * 3);
    for (let k = 0; k < n; k++) {
      const ix = x + 30 + r() * (bw - 120), kind = r();
      if (kind < .25) {        // 水箱
        g.fillStyle = '#2A2F5C'; g.fillRect(ix, top - 110, 70, 80); g.fillStyle = '#343B70'; g.fillRect(ix, top - 116, 70, 10);
        g.fillStyle = '#20254A'; g.fillRect(ix + 8, top - 30, 6, 30); g.fillRect(ix + 56, top - 30, 6, 30);
      } else if (kind < .45) { // 天线
        g.strokeStyle = '#2D3466'; g.lineWidth = 4; g.beginPath(); g.moveTo(ix, top - 10); g.lineTo(ix, top - 150); g.moveTo(ix - 30, top - 120); g.lineTo(ix + 30, top - 120); g.moveTo(ix - 20, top - 95); g.lineTo(ix + 20, top - 95); g.stroke();
        items.push(['blink', ix, top - 150]);
      } else if (kind < .6) {  // 空调外机
        g.fillStyle = '#2C3263'; g.fillRect(ix, top - 46, 64, 36); g.strokeStyle = '#3B4380'; g.lineWidth = 2; circ(g, ix + 22, top - 28, 13); g.stroke();
      } else if (kind < .75) { // 晾衣绳
        const len = 120 + r() * 80;
        g.strokeStyle = '#3A4178'; g.lineWidth = 3; g.beginPath(); g.moveTo(ix, top - 10); g.lineTo(ix, top - 80); g.moveTo(ix + len, top - 10); g.lineTo(ix + len, top - 80); g.stroke();
        g.lineWidth = 1.5; g.beginPath(); g.moveTo(ix, top - 76); g.quadraticCurveTo(ix + len / 2, top - 62, ix + len, top - 76); g.stroke();
        items.push(['laundry', ix, top - 76, len]);
      } else if (kind < .88) { // 盆栽
        g.fillStyle = '#3A3058'; g.fillRect(ix, top - 34, 34, 24); g.fillStyle = '#2E4A5A'; circ(g, ix + 17, top - 44, 20); g.fill(); circ(g, ix + 6, top - 36, 12); g.fill();
      } else items.push(['cat', ix, top - 10]);
    }
    x += bw + 30 + r() * 140;
  }
  return { c, w, h, items };
}
function roofLayer(g, L, s, x, yb, sc = 1) {
  const w = L.w * sc, h = L.h * sc;
  let x0 = -(((x % w) + w) % w);
  for (; x0 < W; x0 += w) {
    g.drawImage(L.c, x0, yb - h, w + 1, h);
    for (const it of L.items) {
      const ix = x0 + it[1] * sc, iy = yb - h + it[2] * sc;
      if (ix < -200 || ix > W + 200) continue;
      if (it[0] === 'blink') { const on = Math.sin(s * 3 + it[1]) > .3; if (on) glow(g, ix, iy, 16 * sc, '#FF5A5A', .9); }
      else if (it[0] === 'laundry') {
        const len = it[3] * sc;
        for (let k = 0; k < 3; k++) {
          const px = ix + len * (.25 + k * .25), sw = Math.sin(s * 3 + k + it[1]) * 6 * sc;
          g.fillStyle = ['#7A6FA8', '#A887B8', '#6F8FB8'][k];
          g.beginPath(); g.moveTo(px - 16 * sc, iy + 4 * sc); g.lineTo(px + 16 * sc, iy + 4 * sc); g.lineTo(px + 14 * sc + sw, iy + 40 * sc); g.lineTo(px - 14 * sc + sw, iy + 40 * sc); g.fill();
        }
      } else if (it[0] === 'cat') catSil(g, ix, iy, 1.1 * sc, s, it[1]);
    }
  }
}
/* 屋顶上的黑猫剪影，尾巴会摆 */
function catSil(g, x, y, k, s, seed = 0) {
  g.save(); g.translate(x, y); g.scale(k, k); g.fillStyle = '#0B0D22';
  ell(g, 0, -16, 22, 14); g.fill(); circ(g, 18, -30, 11); g.fill();
  poly(g, [[11, -38], [14, -50], [19, -39]]); g.fill(); poly(g, [[19, -39], [25, -50], [27, -36]]); g.fill();
  g.strokeStyle = '#0B0D22'; g.lineWidth = 5; g.lineCap = 'round';
  const sw = Math.sin(s * 2 + seed) * 10;
  g.beginPath(); g.moveTo(-20, -12); g.quadraticCurveTo(-40, -20 + sw, -36, -44 + sw); g.stroke();
  glow(g, 22, -32, 5, '#FFE27A', .9); g.fillStyle = '#FFE27A'; circ(g, 22, -32, 1.8); g.fill();
  g.restore();
}

function buildWorld() {
  CITY.far = buildCityLayer(3840, 520, { seed: 1, hmin: 110, hmax: 420, wmin: 50, wmax: 150, col: '#262C63', col2: '#2E3270', haze: '#5A4C8E', hazeA: .65, win: [5, 7, 6], lit: .13, k: .7 });
  CITY.mid = buildCityLayer(3840, 640, { seed: 2, hmin: 170, hmax: 580, wmin: 70, wmax: 210, col: '#171C49', col2: '#1D2052', haze: '#40397A', hazeA: .5, win: [8, 11, 8], lit: .17, k: 1 });
  CITY.near = buildCityLayer(3840, 780, { seed: 3, hmin: 260, hmax: 740, wmin: 110, wmax: 300, col: '#0D1133', col2: '#121640', haze: '#2A2860', hazeA: .35, win: [11, 15, 10], lit: .21, k: 1.4 });
  CITY.roofs = buildRoofs(4800, 620, 9);
  buildHeartCity();
  buildProps();
}

/* 夜里的城市全景：sky、星星、月亮、三层楼。cam：{ x 横向位置, y 上下（正 = 往上看）, z 缩放 }。o.moon = [x, y, r] */
function nightCity(g, s, cam, o = {}) {
  skyGrad(g, o.sky || SKY.nightCity);
  stars(g, s, cam.x * .02, -cam.y * .05, o.stars ?? .9);
  if (o.milky) milkyWay(g, W * .55, H * .32, 2000, -.35, o.milky);
  if (o.moon) moon(g, o.moon[0] - cam.x * .01, o.moon[1] + cam.y * .05, o.moon[2], { haloA: o.moonHalo ?? .5 });
  const z = cam.z || 1, yb = (o.horizon ?? H) + cam.y;
  cityLayer(g, CITY.far, cam.x * .15, yb - 120 * z, .85 * z);
  fogLayer(g, s, '#6A5A9E', yb - 420 * z, yb - 40 * z, .25, 6, 1);
  cityLayer(g, CITY.mid, cam.x * .35, yb - 40 * z, .95 * z);
  if (!o.noNear) cityLayer(g, CITY.near, cam.x * .7, yb + 60 * z, 1 * z);
}

/* ---------------- 飞行时的背景：天空、月亮、远处的城市、一条云带 ----------------
   o：x（横向位置，越往右飞越大）, moon [x,y,r], cloudA, sky, horizon, roofs（是否画近处的屋顶，低空飞行）, fog */
function flightBg(g, s, o = {}) {
  const x = o.x || 0;
  skyGrad(g, o.sky || SKY.nightCity);
  stars(g, s, x * .02, 0, o.stars ?? 1);
  if (o.milky) milkyWay(g, o.milky[0], o.milky[1], o.milky[2] || 2200, o.milky[3] ?? -.3, o.milkyA ?? .8);
  if (o.moon) moon(g, o.moon[0], o.moon[1], o.moon[2], { haloA: o.moonHalo ?? .6 });
  // 远处的云带
  const ca = o.cloudA ?? .7;
  if (ca > 0) for (let i = 0; i < 7; i++) {
    const w = 700 + hash(i, 61) * 500, cx = ((hash(i, 62) * (W + w) - x * (.06 + hash(i, 63) * .05)) % (W + w) + W + w) % (W + w) - w / 2;
    cloud(g, i, cx, (o.cloudY ?? 640) + hash(i, 64) * 120, w, o.cloudPal || CLOUD.night, ca * (.5 + hash(i, 65) * .5), i % 2 === 0);
  }
  const yb = o.horizon ?? H;
  cityLayer(g, CITY.far, x * .12, yb - 80, .8);
  fogLayer(g, s, '#5E5296', yb - 380, yb, .3, 8, 1);
  cityLayer(g, CITY.mid, x * .3, yb + 10, .9);
  if (o.roofs) { fogLayer(g, s, '#3B3478', yb - 300, yb, .25, 12, 0); roofLayer(g, CITY.roofs, s, x * .9, yb + (o.roofDY ?? 140), o.roofSc ?? 1); }
  // 底下压暗一点，歌词更清楚
  g.fillStyle = vgrad(g, H - 260, H, [[0, 'rgba(6,6,22,0)'], [1, 'rgba(6,6,22,.45)']]); g.fillRect(0, H - 260, W, 260);
}

/* ---------------- 俯视的城市：街灯连成网，中间一个心形的湖 ---------------- */
function buildHeartCity() {
  const S = 2400, c = mk(S, S), g = c.getContext('2d'), r = R(57);
  g.fillStyle = '#0B0D25'; g.fillRect(0, 0, S, S);
  // 街区：不规则的网格
  const xs = [0], ys = [0];
  while (xs[xs.length - 1] < S) xs.push(xs[xs.length - 1] + 90 + r() * 140);
  while (ys[ys.length - 1] < S) ys.push(ys[ys.length - 1] + 90 + r() * 140);
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
    const x0 = xs[i] + 10, y0 = ys[j] + 10, w = xs[i + 1] - xs[i] - 20, h = ys[j + 1] - ys[j] - 20;
    let yy = y0;
    while (yy < y0 + h - 10) {
      const bh = 24 + r() * 50; let xx = x0;
      while (xx < x0 + w - 10) {
        const bw = 24 + r() * 60;
        g.fillStyle = mixc('#151A40', '#232A5C', r()); g.fillRect(xx, yy, Math.min(bw, x0 + w - xx) - 3, Math.min(bh, y0 + h - yy) - 3);
        if (r() < .25) { g.fillStyle = r() < .7 ? 'rgba(255,205,130,.55)' : 'rgba(190,215,255,.5)'; g.fillRect(xx + 4 + r() * (bw - 14), yy + 4 + r() * (bh - 14), 5, 5); }
        xx += bw;
      }
      yy += bh;
    }
  }
  // 街道的灯
  g.save(); g.globalCompositeOperation = 'lighter';
  const road = (x0, y0, x1, y1, main) => {
    g.strokeStyle = main ? 'rgba(255,190,110,.55)' : 'rgba(255,200,140,.22)'; g.lineWidth = main ? 6 : 3;
    g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke();
    g.strokeStyle = main ? 'rgba(255,170,90,.18)' : 'rgba(255,180,110,.08)'; g.lineWidth = main ? 26 : 12; g.stroke();
    const len = Math.hypot(x1 - x0, y1 - y0), n = Math.floor(len / 28);
    for (let k = 0; k < n; k++) { const u = k / n, px = lerp(x0, x1, u), py = lerp(y0, y1, u); g.fillStyle = r() < .08 ? 'rgba(255,90,90,.9)' : 'rgba(255,230,180,.8)'; g.fillRect(px - 1.5, py - 1.5, 3, 3); }
  };
  xs.forEach((x, i) => road(x, 0, x, S, i % 4 === 0));
  ys.forEach((y, i) => road(0, y, S, y, i % 4 === 0));
  g.restore();
  // 心形的湖（中间），一圈暖光的小路
  const heart = (sc) => { g.beginPath(); for (let k = 0; k <= 120; k++) { const t = k / 120 * TAU; const hx = 16 * Math.pow(Math.sin(t), 3), hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); const px = S / 2 + hx * sc, py = S / 2 + hy * sc; k ? g.lineTo(px, py) : g.moveTo(px, py); } g.closePath(); };
  g.fillStyle = '#0B0D25'; heart(19); g.fill();
  g.fillStyle = '#16244A'; heart(17); g.fill();
  g.save(); heart(17); g.clip();
  g.fillStyle = rgrad(g, S / 2, S / 2 - 40, 10, 330, [[0, 'rgba(255,170,220,.55)'], [.6, 'rgba(160,120,255,.25)'], [1, 'rgba(60,80,180,.1)']]); g.fillRect(0, 0, S, S);
  for (let k = 0; k < 160; k++) { g.fillStyle = `rgba(255,255,255,${.2 + r() * .5})`; g.fillRect(S / 2 - 300 + r() * 600, S / 2 - 280 + r() * 560, 2, 2); }
  g.restore();
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let k = 0; k < 110; k++) { const t = k / 110 * TAU; const hx = 16 * Math.pow(Math.sin(t), 3), hy = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)); const px = S / 2 + hx * 18, py = S / 2 + hy * 18; g.fillStyle = rgrad(g, px, py, 0, 16, [[0, 'rgba(255,190,225,.95)'], [1, 'rgba(255,150,210,0)']]); g.fillRect(px - 16, py - 16, 32, 32); }
  g.restore();
  CITY.heart = c;
}
/* z：缩放（1 = 整个城市铺满屏幕的宽），中心在心形湖 */
function heartCity(g, s, z, rot = 0) {
  const S = 2400, k = W / S * z * 1.2;
  g.save(); g.translate(W / 2, H / 2); g.rotate(rot); g.scale(k, k); g.translate(-S / 2, -S / 2 - 60);
  g.drawImage(CITY.heart, 0, 0);
  g.restore();
  // 心形湖一闪一闪
  glow(g, W / 2, H / 2 - 60 * k, 200 * k * 2, '#FF9ED3', .25 + .1 * Math.sin(s * 4));
}

/* ---------------- 吵闹的街：霓虹招牌、车灯拖出的光、"嘀——" ---------------- */
const NEON = [['KTV', '#FF4FA8'], ['烧烤', '#FFD23F'], ['24H', '#3FE8FF'], ['网咖', '#7CFF9E'], ['火锅', '#FF6A4F'], ['酒吧', '#C77DFF'], ['便利店', '#3FE8FF'], ['奶茶', '#FF9ED3'], ['按摩', '#FFD23F'], ['夜宵', '#FF4FA8']];
function neonStreet(g, s, o = {}) {
  const x = o.x || 0;
  g.fillStyle = vgrad(g, 0, H, [[0, '#14082E'], [.6, '#2A0E44'], [1, '#3D1650']]); g.fillRect(0, 0, W, H);
  // 楼
  for (let i = -1; i < 9; i++) {
    const bx = i * 260 - (x % 260), id = Math.floor(x / 260) + i;
    const bh = 520 + hash(id, 1) * 300, top = 860 - bh;
    g.fillStyle = mixc('#1B0F35', '#26143F', hash(id, 2)); g.fillRect(bx, top, 252, bh);
    for (let j = 0; j < 6; j++) for (let k = 0; k < 4; k++) { if (hash(id, j, k) < .35) { g.fillStyle = hash(id, k, j) < .5 ? 'rgba(255,120,200,.35)' : 'rgba(120,220,255,.3)'; g.fillRect(bx + 20 + k * 58, top + 30 + j * 70, 34, 40); } }
    const [txt, col] = NEON[((id % NEON.length) + NEON.length) % NEON.length];
    const fl = hash(id, Math.floor(s * 12)) < .12 ? .25 : 1;
    const sy = top + 140 + hash(id, 9) * 200;
    g.save(); g.shadowColor = col; g.shadowBlur = 30 * fl;
    g.strokeStyle = rgba(col, .9 * fl); g.lineWidth = 5; rr(g, bx + 30, sy - 50, 190, 100, 14); g.stroke();
    text(g, txt, bx + 125, sy, txt.length > 2 ? 46 : 58, { k: 'serif', col: mixc(col, '#FFFFFF', .5), glow: col, gr: 26, alpha: fl });
    g.restore();
  }
  // 路面和车灯拖出的光
  g.fillStyle = '#120A24'; g.fillRect(0, 860, W, H - 860);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 26; i++) {
    const lane = i % 2, y = 900 + lane * 70 + hash(i, 4) * 30, len = 300 + hash(i, 5) * 600;
    const sp = (lane ? -1 : 1) * (1600 + hash(i, 6) * 900);
    const xx = (((hash(i, 7) * (W + len * 2) + s * sp) % (W + len * 2)) + W + len * 2) % (W + len * 2) - len;
    const col = lane ? '255,70,90' : '255,240,210';
    g.strokeStyle = lgrad(g, xx, y, xx + len * (lane ? 1 : -1), y, [[0, `rgba(${col},.9)`], [1, `rgba(${col},0)`]]);
    g.lineWidth = 5; g.beginPath(); g.moveTo(xx, y); g.lineTo(xx + len * (lane ? 1 : -1), y); g.stroke();
  }
  g.restore();
}
/* ---------------- 安静的湖：月亮的倒影、芦苇、萤火虫 ---------------- */
function calmLake(g, s, o = {}) {
  g.fillStyle = vgrad(g, 0, 620, [[0, '#060A24'], [.7, '#16205A'], [1, '#2E3A7A']]); g.fillRect(0, 0, W, 620);
  stars(g, s, 300, 40, .9);
  const mx = o.moonX ?? 1300, my = o.moonY ?? 250;
  moon(g, mx, my, 70, { haloA: .7 });
  // 远山
  g.fillStyle = '#0E1340'; g.beginPath(); g.moveTo(0, 620); for (let x = 0; x <= W; x += 40) g.lineTo(x, 560 - Math.sin(x * .004) * 50 - noise1(x * .01, 3) * 40); g.lineTo(W, 620); g.fill();
  // 水面
  g.fillStyle = vgrad(g, 620, H, [[0, '#1D2862'], [1, '#090C2A']]); g.fillRect(0, 620, W, H - 620);
  // 月亮的倒影：一条碎光
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let y = 630; y < H; y += 7) {
    const v = (y - 620) / 460, w = 40 + v * 160 + Math.sin(y * .3 + s * 2) * 20;
    const xo = Math.sin(y * .11 + s * 1.7) * 10 * (1 + v);
    g.fillStyle = `rgba(255,240,200,${(.35 - v * .25) * (.6 + .4 * Math.sin(y * 1.3 + s * 4))})`;
    g.fillRect(mx - w / 2 + xo, y, w, 2.5);
  }
  g.restore();
  // 芦苇
  g.strokeStyle = '#05061A'; g.lineWidth = 4; g.lineCap = 'round';
  for (let i = 0; i < 40; i++) {
    const rx = (o.reedX ?? 0) + hash(i, 21) * 700, h = 120 + hash(i, 22) * 200, sw = Math.sin(s * 1.2 + i) * 10;
    g.beginPath(); g.moveTo(rx, H); g.quadraticCurveTo(rx + sw * .5, H - h * .5, rx + sw, H - h); g.stroke();
    if (hash(i, 23) < .4) { g.fillStyle = '#05061A'; ell(g, rx + sw, H - h, 5, 18, sw * .02); g.fill(); }
  }
  // 小船
  g.fillStyle = '#0A0C26'; g.beginPath(); g.moveTo(1500, 760); g.quadraticCurveTo(1580, 790, 1660, 760); g.lineTo(1640, 776); g.lineTo(1520, 776); g.fill();
  // 萤火虫
  for (const p of floaters(s, 33, 30, [0, 520, W, H], { vy: 6, vx: 4, amp: 30 })) {
    const a = .3 + .7 * p.tw; g.fillStyle = `rgba(220,255,170,${a})`; circ(g, p.x, p.y, 2); g.fill(); glow(g, p.x, p.y, 14, '#D8FF9C', a * .7);
  }
}

/* ---------------- 回忆：白天的玄关（暖色） ---------------- */
function hallway(g, s, o = {}) {
  g.fillStyle = vgrad(g, 0, H, [[0, '#F3E2C6'], [.8, '#EAD3AE'], [1, '#D9B88C']]); g.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 60) { g.fillStyle = 'rgba(200,160,110,.05)'; g.fillRect(x, 0, 28, 860); }
  // 门（左边）
  g.fillStyle = '#B5835A'; rr(g, 150, 170, 360, 700, 6); g.fill();
  g.fillStyle = '#9C6E48'; rr(g, 190, 220, 280, 250, 6); g.fill(); rr(g, 190, 520, 280, 300, 6); g.fill();
  g.fillStyle = '#E8C77A'; circ(g, 470, 540, 12); g.fill();
  // 挂衣架、帽子
  g.fillStyle = '#7A5638'; g.fillRect(560, 300, 140, 12); g.fillStyle = '#E58BAA'; ell(g, 600, 330, 40, 16); g.fill(); rr(g, 578, 300, 44, 30, 12); g.fill();
  // 窗（右边）和阳光
  g.fillStyle = '#FFFBEA'; g.fillRect(1420, 150, 360, 460);
  g.fillStyle = 'rgba(255,240,200,.5)'; g.fillRect(1420, 150, 360, 460);
  g.strokeStyle = '#D9B98E'; g.lineWidth = 14; g.strokeRect(1420, 150, 360, 460); g.lineWidth = 8; g.beginPath(); g.moveTo(1600, 150); g.lineTo(1600, 610); g.moveTo(1420, 380); g.lineTo(1780, 380); g.stroke();
  // 窗台上的植物
  g.fillStyle = '#C97B5A'; rr(g, 1470, 570, 80, 50, 8); g.fill();
  g.fillStyle = '#6DAF7A'; for (let k = 0; k < 7; k++) { g.save(); g.translate(1510, 575); g.rotate(-1.1 + k * .36 + Math.sin(s * 1.5 + k) * .04); ell(g, 0, -45, 14, 45); g.fill(); g.restore(); }
  // 地板
  g.fillStyle = '#C89B6A'; g.fillRect(0, 860, W, H - 860); g.fillStyle = 'rgba(120,80,40,.15)'; for (let x = 0; x < W; x += 120) g.fillRect(x, 860, 3, H - 860);
  // 阳光：斜着的光柱
  g.save(); g.globalCompositeOperation = 'screen';
  g.beginPath(); g.moveTo(1420, 150); g.lineTo(1780, 150); g.lineTo(1300, 1080); g.lineTo(700, 1080); g.closePath();
  g.fillStyle = lgrad(g, 1600, 150, 1000, 1080, [[0, 'rgba(255,236,180,.55)'], [1, 'rgba(255,220,160,.12)']]); g.fill();
  g.restore();
  for (const p of floaters(s, 12, 40, [700, 150, 1700, 1000], { vy: 8, amp: 14 })) { const a = .25 + .5 * p.tw; g.fillStyle = `rgba(255,250,220,${a})`; circ(g, p.x, p.y, 1.5 + p.sz * 2); g.fill(); }
}
