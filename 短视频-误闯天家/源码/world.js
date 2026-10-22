'use strict';
/* world.js：天家和人间的布景（都画在像素缓冲里，坐标是世界像素）。 */

const PAL = {
  // 天家
  sky: ['#120A2A', '#1E1046', '#311A5E', '#4E2470', '#7A3279', '#B24E7C', '#E57F72', '#FFB86E'],
  cloud: { hi: '#FFFFFF', base: '#FFF1E6', sh: '#F4C3CF', deep: '#D99AB8', ol: '#B97AA6' },
  gold: { l: '#FFE58A', m: '#F2C14E', d: '#C99A3A', dd: '#8A6420' },
  verm: { l: '#F06A45', m: '#D9452B', d: '#B23324', dd: '#7A1E18' },
  jade: { l: '#FFFFFF', m: '#EEF3F0', d: '#C9D6D0', dd: '#9FB3AA' },
  // 人间
  night: ['#0A1226', '#101C38', '#16274A', '#1E3358', '#2A4268'],
  snow: { l: '#F4F8FF', m: '#E2EAF7', d: '#B8C8E4', dd: '#8EA2C8' },
  moon: { l: '#FFF8E0', m: '#FFF0C2', d: '#EAD9A0', g: '#FFF6D8' },
  plum: { l: '#FF9AB0', m: '#F04E6A', d: '#B8324C', c: '#FFD34E', br: '#3A2630', brl: '#5A3A44' },
};

/* 天家的天：从深紫到晚霞色，上面一层会闪的星星 */
function skyHeaven(g, w, h, t, o = {}) {
  const s = PAL.sky, n = s.length, k = o.k || 1;
  const stops = s.map((c, i) => [Math.round(h * k * i / (n - 1) * .98), c]);
  stops.push([h, s[n - 1]]);
  pbands(g, 0, w, stops);
  stars(g, w, Math.round(h * k * .45), t, o.seed || 3, o.nstars || Math.round(w * h / 260));
}
function stars(g, w, h, t, seed = 1, n = 60) {
  const r = R(seed);
  for (let i = 0; i < n; i++) {
    const x = Math.floor(r() * w), y = Math.floor(r() * h), ph = r() * TAU, big = r() < .12;
    const tw = .5 + .5 * Math.sin(t * (2 + r() * 3) + ph);
    const c = tw > .75 ? '#FFFFFF' : tw > .4 ? '#F6E7C8' : '#8E7AAE';
    pdot(g, x, y, c);
    if (big && tw > .6) { pdot(g, x - 1, y, '#C9B8E8'); pdot(g, x + 1, y, '#C9B8E8'); pdot(g, x, y - 1, '#C9B8E8'); pdot(g, x, y + 1, '#C9B8E8'); }
  }
}
/* 一朵云团：亮面在左上，暗面在下 */
function puff(g, cx, cy, r, P = PAL.cloud) {
  pdisc(g, cx, cy + 1, r, P.sh);
  pdisc(g, cx, cy, r, P.base);
  if (r > 2) pdisc(g, cx - Math.round(r * .3), cy - Math.round(r * .35), Math.round(r * .5), P.hi);
}
/* 祥云：几团云叠成一长条，底下一道暗边，两头各卷一个卷儿 */
function xiangyun(g, x, y, s = 1, P = PAL.cloud, flip = false) {
  const d = flip ? -1 : 1;
  pell(g, x, y + 2 * s, 14 * s, 3 * s, P.deep);
  pell(g, x, y + 1 * s, 14 * s, 3 * s, P.sh);
  puff(g, x - 7 * d * s, y - 1 * s, 4 * s, P); puff(g, x + 1 * d * s, y - 3 * s, 6 * s, P); puff(g, x + 9 * d * s, y, 4 * s, P);
  pell(g, x, y + 1 * s, 13 * s, 2 * s, P.base);
  curl(g, x - 13 * d * s, y + 1 * s, 3 * s, P.ol, d);
  curl(g, x + 12 * d * s, y - 1 * s, 2 * s, P.ol, -d);
}
/* 卷儿：一圈往里收的螺旋 */
function curl(g, cx, cy, r, col, d = 1) {
  for (let i = 0; i < 26; i++) {
    const u = i / 25, a = u * TAU * 1.15 * d, rr = r * (1 - u * .8);
    pdot(g, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr, col);
  }
}
/* 一条连绵的云海：y 是云顶，往下铺满 */
function cloudSea(g, w, y, h, t, o = {}) {
  const P = o.pal || PAL.cloud, r0 = o.r || 8, drift = (o.drift || 2) * t, seed = o.seed || 7;
  prect(g, 0, y + r0, w, h, P.sh);
  const n = Math.ceil(w / (r0 * 1.3)) + 3;
  for (let i = -2; i < n; i++) {
    const x = ((i * r0 * 1.3 + drift) % (w + r0 * 4) + w + r0 * 4) % (w + r0 * 4) - r0 * 2;
    const rr = r0 * (.75 + .5 * hash(i, seed));
    puff(g, x, y + r0 - rr * .6 + 2 * hash(i, seed + 1), rr, P);
  }
  prect(g, 0, y + r0 + 3, w, h, P.base);
  pdither(g, 0, y + r0 + 3, w, 3, P.sh, .5);
}

/* 宫殿（正面）：台基、红柱、金瓦屋顶、翘角。(cx, by) 是台基底边中点，s 是宽度系数 */
function hall(g, cx, by, s = 1, o = {}) {
  const G = PAL.gold, V = PAL.verm, J = PAL.jade;
  const w = Math.round(40 * s), hw = w / 2;
  // 台基
  prect(g, cx - hw - 3 * s, by - 4 * s, w + 6 * s, 4 * s, J.m); prect(g, cx - hw - 3 * s, by - 1, w + 6 * s, 1, J.dd);
  for (let i = 0; i < 9; i++) pdot(g, cx - hw - 2 * s + i * (w + 4 * s) / 8, by - 3 * s, J.d);
  // 墙和柱子
  const wy = by - 4 * s - 14 * s;
  prect(g, cx - hw + 2 * s, wy, w - 4 * s, 14 * s, V.d);
  for (let i = 0; i < 5; i++) prect(g, cx - hw + 2 * s + i * (w - 6 * s) / 4, wy, Math.max(1, 2 * s), 14 * s, V.m);
  // 门窗透出的金光
  prect(g, cx - 4 * s, wy + 4 * s, 8 * s, 10 * s, o.lit === false ? V.dd : G.l);
  if (s >= 1) { prect(g, cx - hw + 6 * s, wy + 5 * s, 5 * s, 5 * s, G.m); prect(g, cx + hw - 11 * s, wy + 5 * s, 5 * s, 5 * s, G.m); }
  // 屋檐下的彩画
  prect(g, cx - hw, wy - 3 * s, w, 3 * s, '#2F6E8E'); prect(g, cx - hw, wy - 3 * s, w, 1, '#58A6C4');
  // 屋顶：金瓦，两头翘起来
  roof(g, cx, wy - 3 * s, w + 14 * s, 10 * s);
  if (o.tiers === 2) { prect(g, cx - hw * .6, wy - 16 * s, w * .6, 4 * s, V.d); roof(g, cx, wy - 16 * s, w * .6 + 10 * s, 8 * s); }
}
/* 屋顶：(cx, by) 屋檐底边中点，w 宽，h 高 */
function roof(g, cx, by, w, h) {
  const G = PAL.gold, hw = w / 2;
  for (let j = 0; j < h; j++) {
    const u = j / h, half = hw * (.55 + .45 * u);
    prect(g, cx - half, by - h + j, half * 2, 1, j % 3 === 2 ? G.d : G.m);
  }
  for (let i = -hw * .55; i < hw * .55; i += 3) prect(g, cx + i, by - h, 1, h, G.d);
  prect(g, cx - hw * .55, by - h - 1, hw * 1.1, 2, G.l);
  // 翘角
  for (const d of [-1, 1]) { pline(g, cx + d * hw, by - 1, cx + d * (hw + 3), by - 4, G.l); pline(g, cx + d * hw, by, cx + d * (hw + 3), by - 3, G.d); pdot(g, cx + d * (hw + 3), by - 5, G.l); }
  prect(g, cx - hw, by - 1, w, 1, G.dd);
  // 正脊两头的鸱吻
  for (const d of [-1, 1]) { prect(g, cx + d * hw * .55 - 1, by - h - 3, 2, 3, G.l); pdot(g, cx + d * (hw * .55 + 1), by - h - 4, G.l); }
}

/* 灯笼：红色、上下金边、落拍时轻轻一晃 */
function lantern(g, x, y, t, s = 1, lit = 1) {
  const sw = Math.round(Math.sin(t * 2.2 + x) * 1);
  pline(g, x, y - 6 * s, x + sw, y, PAL.gold.dd);
  const cx = x + sw;
  if (lit) pdither(g, cx - 6 * s, y - 1 * s, 12 * s + 1, 12 * s, '#FFB86E', .22 * lit);
  prect(g, cx - 2 * s, y, 4 * s + 1, 1 * s, PAL.gold.m);
  pell(g, cx, y + 5 * s, 4 * s, 4 * s, '#E8453C');
  pell(g, cx - 1 * s, y + 4 * s, 2 * s, 3 * s, '#FF7A5C');
  prect(g, cx - 2 * s, y + 9 * s, 4 * s + 1, 1 * s, PAL.gold.m);
  pline(g, cx, y + 10 * s, cx, y + 13 * s, '#E8453C');
}

/* 金色光芒：从 (cx, cy) 往外射的一圈光条（半透明的细长三角），rot 转角 */
function rays(g, cx, cy, r0, r1, n, rot, col, a = .5) {
  palpha(g, a, () => {
    g.fillStyle = col;
    for (let i = 0; i < n; i++) {
      const a0 = rot + i * TAU / n, da = TAU / n * .22;
      g.beginPath();
      g.moveTo(cx + Math.cos(a0) * r0, cy + Math.sin(a0) * r0);
      g.lineTo(cx + Math.cos(a0 - da) * r1, cy + Math.sin(a0 - da) * r1);
      g.lineTo(cx + Math.cos(a0 + da) * r1, cy + Math.sin(a0 + da) * r1);
      g.closePath(); g.fill();
    }
  });
}

/* 金色砂粒：从 (x, y) 漏下去，t 是漏了多久 */
function sandFall(g, x, y, t, o = {}) {
  const n = o.n || 40, spd = o.spd || 34, spread = o.spread || 4, seed = o.seed || 11;
  for (let i = 0; i < n; i++) {
    const t0 = hash(i, seed) * (o.span || 1.2);
    const age = t - t0;
    if (age < 0) continue;
    const yy = y + age * spd + .5 * 40 * age * age;
    if (o.maxY && yy > o.maxY) continue;
    const xx = x + (hash(i, seed + 1) - .5) * spread * 2 + Math.sin(age * 4 + i) * .6;
    pdot(g, xx, yy, (i + Math.floor(t * 12)) % 5 === 0 ? '#FFFFFF' : i % 3 ? '#E2B867' : '#FFF0B0');
  }
}

/* 闪光的小十字 */
function sparkle(g, x, y, u, col = '#FFFFFF') {
  if (u <= 0 || u >= 1) return;
  const r = Math.round(Math.sin(u * Math.PI) * 3);
  pdot(g, x, y, col);
  for (let i = 1; i <= r; i++) { pdot(g, x - i, y, col); pdot(g, x + i, y, col); pdot(g, x, y - i, col); pdot(g, x, y + i, col); }
}

/* 音符：♪ */
function note(g, x, y, col, ol) {
  const px = [[2, 0], [3, 0], [3, 1], [4, 1], [2, 1], [2, 2], [2, 3], [2, 4], [2, 5], [1, 5], [0, 6], [1, 6], [2, 6], [0, 7], [1, 7], [4, 2]];
  if (ol) px.forEach(([i, j]) => { for (const [a, b] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) pdot(g, x + i + a, y + j + b, ol); });
  px.forEach(([i, j]) => pdot(g, x + i, y + j, col));
}

/* 心 */
function heart(g, cx, cy, s, col = '#FF6F91') {
  const rows = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') prect(g, cx - 3 * s + i * s, cy - 3 * s + j * s, s, s, col); });
  prect(g, cx - 2 * s, cy - 2 * s, s, s, '#FFFFFF');
}

/* 蒲团：圆鼓鼓的坐垫 */
function cushion(g, cx, by, s = 1, col = '#B23A48') {
  pell(g, cx, by - 2 * s, 13 * s, 3 * s, shadeOf(col, .7));
  pell(g, cx, by - 3 * s, 13 * s, 3 * s, col);
  pell(g, cx - 2 * s, by - 4 * s, 8 * s, 1 * s, shadeOf(col, 1.25));
  for (let i = -10; i <= 10; i += 4) pdot(g, cx + i * s, by - 2 * s, PAL.gold.m);
}
/* 云朵坐垫 */
function cloudCushion(g, cx, by, t) {
  puff(g, cx - 8, by - 3, 4); puff(g, cx + 8, by - 3, 4); puff(g, cx, by - 4, 6);
  pell(g, cx, by - 1, 14, 2, PAL.cloud.sh);
}

/* ---------------- 人间 ---------------- */
function skyNight(g, w, h, t, o = {}) {
  const s = PAL.night, n = s.length;
  pbands(g, 0, w, s.map((c, i) => [Math.round(h * i / n), c]).concat([[h, s[n - 1]]]));
  stars(g, w, Math.round(h * .7), t, o.seed || 21, o.nstars || Math.round(w * h / 300));
}
/* 月亮：带月晕和环形山 */
function moon(g, cx, cy, r, t = 0) {
  const M = PAL.moon;
  pglow(g, cx, cy, r * 1.8, M.g, .22);
  pdisc(g, cx, cy, r + 2, '#3A4A70');
  pdisc(g, cx, cy, r, M.m);
  pdisc(g, cx - Math.round(r * .15), cy - Math.round(r * .15), Math.round(r * .85), M.l);
  const r1 = R(5);
  for (let i = 0; i < Math.max(3, r / 5); i++) {
    const a = r1() * TAU, d = r1() * r * .65, rr = 1 + Math.floor(r1() * r * .16);
    pdisc(g, cx + Math.cos(a) * d, cy + Math.sin(a) * d, rr, M.d);
    pdisc(g, cx + Math.cos(a) * d - 1, cy + Math.sin(a) * d - 1, Math.max(0, rr - 1), M.m);
  }
}
/* 雪花：wind 风把雪往右吹（世界像素/秒），seed 区分层 */
function snowfall(g, w, h, t, o = {}) {
  const n = o.n || 80, spd = o.spd || 14, wind = o.wind || 0, seed = o.seed || 31, big = o.big || 0;
  for (let i = 0; i < n; i++) {
    const x0 = hash(i, seed) * (w + 40) - 20, y0 = hash(i, seed + 1) * h, sp = spd * (.6 + .8 * hash(i, seed + 2));
    const y = ((y0 + t * sp) % h + h) % h;
    const x = ((x0 + t * wind * (.7 + .6 * hash(i, seed + 3)) + Math.sin(t * 1.5 + i) * 2) % (w + 40) + w + 40) % (w + 40) - 20;
    const c = hash(i, seed + 4) < .5 ? PAL.snow.l : PAL.snow.m;
    if (big && hash(i, seed + 5) < big) { pdot(g, x, y, c); pdot(g, x + 1, y, c); pdot(g, x, y + 1, c); pdot(g, x + 1, y + 1, c); }
    else pdot(g, x, y, c);
  }
}
/* 梅枝：从 (x0, y0) 往一边伸出去，rise 往上翘的角度，bloom 0~1 开了多少朵；返回花的位置 */
function plumBranch(g, x0, y0, len, dir, t, bloom, seed = 3, rise = .5) {
  const P = PAL.plum, r = R(seed), pts = [];
  let x = x0, y = y0, a = dir > 0 ? -rise : Math.PI + rise;
  const segs = [];
  for (let i = 0; i < len; i++) {
    a += (r() - .5) * .45; x += Math.cos(a); y += Math.sin(a) * .8;
    segs.push([x, y]);
    if (i % 7 === 3) pts.push([x + (r() - .5) * 3, y - 1 - r() * 2]);
    if (i % 13 === 8) { // 分杈
      let bx = x, by = y, ba = a + (r() < .5 ? -.8 : .8);
      for (let j = 0; j < len * .35; j++) { ba += (r() - .5) * .4; bx += Math.cos(ba); by += Math.sin(ba) * .8; segs.push([bx, by]); if (j % 5 === 3) pts.push([bx, by - 1]); }
    }
  }
  segs.forEach(([sx, sy], i) => { prect(g, sx, sy, 2, 2, P.br); if (i % 3 === 0) pdot(g, sx, sy, P.brl); });
  pts.forEach(([px, py], i) => {
    const u = clamp(bloom * pts.length - i);
    if (u <= 0) { pdot(g, px, py, P.d); return; }
    const rr = u < .5 ? 1 : 2;
    pdisc(g, px, py, rr, P.m);
    if (rr > 1) { pdot(g, px - 1, py - 1, P.l); pdot(g, px, py, P.c); }
  });
  return pts;
}
/* 人间的小镇：一排屋顶积雪的房子，窗子亮着暖黄的灯 */
function town(g, w, by, t, o = {}) {
  const r = R(o.seed || 9), S = PAL.snow;
  let x = -4;
  while (x < w + 4) {
    const hw = 10 + Math.floor(r() * 10), hh = 8 + Math.floor(r() * 8);
    prect(g, x, by - hh, hw, hh, o.wall || '#1B2236');
    // 屋顶和积雪
    for (let j = 0; j < 4; j++) prect(g, x - 2 + j, by - hh - 4 + j, hw + 4 - j * 2, 1, j === 0 ? S.l : '#2A3550');
    prect(g, x - 2, by - hh - 4, hw + 4, 1, S.l);
    for (let k = 0; k < Math.floor(hw / 5); k++) if (r() < .7) {
      const lit = .6 + .4 * Math.sin(t * 2 + x + k);
      prect(g, x + 2 + k * 5, by - hh + 3, 2, 3, lit > .7 ? '#FFD884' : '#FFC861');
    }
    x += hw + 2 + Math.floor(r() * 4);
  }
  prect(g, 0, by, w, 2, S.d);
}
/* 雪地：起伏的雪坡 */
function snowHill(g, w, y, h, t, o = {}) {
  const S = PAL.snow;
  for (let x = 0; x < w; x++) {
    const yy = Math.round(y + Math.sin(x * .05 + (o.ph || 0)) * (o.amp || 3) + Math.sin(x * .13) * 1.5);
    prect(g, x, yy, 1, h, S.m);
    pdot(g, x, yy, S.l);
    if (x % 9 === 0) pdot(g, x, yy + 2, S.d);
  }
}
