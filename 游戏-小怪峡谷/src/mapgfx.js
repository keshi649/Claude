'use strict';
/* mapgfx.js：开局时把整张地图画成一张 2000×2000 的像素图（1 像素 = 2.5 单位），游戏里每帧只截取看得见的那块。
   一层层画：草地（噪声 + 抖动）→ 兵线的土路 → 河道 → 基地石板、泉水 → 草丛 → 墙的影子 → 树 → 野怪窝、龙坑、小装饰。 */

const MS = Math.round(L / PXU);                 // 2000
function hash2(x, y, s) { let h = (x * 374761393 + y * 668265263 + (s || 0) * 982451653) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
function vnoise(x, y, s) {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash2(xi, yi, s), b = hash2(xi + 1, yi, s), c = hash2(xi, yi + 1, s), d = hash2(xi + 1, yi + 1, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + 0.5) / 16);
// 形状画进遮罩（像素分辨率，只扫外框）
function rasterMask(shapes, mask, val, pad) {
  for (let n = 0; n < shapes.length; n++) {
    const s = shapes[n];
    const bb = s.c ? [s.c[0] - s.c[2], s.c[1] - s.c[2], s.c[0] + s.c[2], s.c[1] + s.c[2]]
      : [Math.min(s.k[0], s.k[2]) - s.k[4], Math.min(s.k[1], s.k[3]) - s.k[4], Math.max(s.k[0], s.k[2]) + s.k[4], Math.max(s.k[1], s.k[3]) + s.k[4]];
    const x0 = Math.max(0, Math.floor((bb[0] - pad) / PXU)), x1 = Math.min(MS - 1, Math.ceil((bb[2] + pad) / PXU));
    const y0 = Math.max(0, Math.floor((bb[1] - pad) / PXU)), y1 = Math.min(MS - 1, Math.ceil((bb[3] + pad) / PXU));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      if (shapeDist(s, (x + 0.5) * PXU, (y + 0.5) * PXU) < pad) mask[y * MS + x] = val === 'idx' ? n + 1 : val;
    }
  }
}
function inBaseFloor(team, x, y) {             // 基地里铺石板的地方（世界坐标）
  if (team) { const t = x; x = y; y = t; }
  const side = (ax, ay, bx, by) => (bx - ax) * (y - ay) - (by - ay) * (x - ax);
  // 角落 (0, L) 在三条线的同一侧
  return side(600, 3480, 1060, 3560) > 0 && side(1060, 3560, 1440, 3940) > 0 && side(1440, 3940, 1520, 4400) > 0;
}
function buildMapTex(progress) {
  const S = MS;
  const c = mkc(S, S), g = c.getContext('2d');
  const img = g.createImageData(S, S), d = img.data;
  const wall = new Uint8Array(S * S), bush = new Uint8Array(S * S);
  rasterMask(WALLS, wall, 1, 0);
  rasterMask(BUSHES, bush, 'idx', 0);
  const bp = BORDER / PXU;
  // 兵线：离中心线多远
  const laneD = new Float32Array(S * S).fill(999);
  const LW = 165 / PXU;
  for (const ln of LANES) for (let i = 1; i < ln.length; i++) {
    const ax = ln[i - 1][0] / PXU, ay = ln[i - 1][1] / PXU, bx = ln[i][0] / PXU, by = ln[i][1] / PXU;
    const x0 = Math.max(0, Math.floor(Math.min(ax, bx) - LW - 2)), x1 = Math.min(S - 1, Math.ceil(Math.max(ax, bx) + LW + 2));
    const y0 = Math.max(0, Math.floor(Math.min(ay, by) - LW - 2)), y1 = Math.min(S - 1, Math.ceil(Math.max(ay, by) + LW + 2));
    const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      // 中路是一条长对角线：外框是整张图，先粗筛
      let t = ((x - ax) * dx + (y - ay) * dy) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t;
      const qx = ax + dx * t - x, qy = ay + dy * t - y, dd = Math.sqrt(qx * qx + qy * qy);
      const k = y * S + x;
      if (dd < laneD[k]) laneD[k] = dd;
    }
  }
  const SPR_R = SPRING_R / PXU;
  const sp0 = [SPRING[0] / PXU, SPRING[1] / PXU], sp1 = [sp0[1], sp0[0]];
  const put = (k, col) => { d[k * 4] = col[0]; d[k * 4 + 1] = col[1]; d[k * 4 + 2] = col[2]; d[k * 4 + 3] = 255; };
  const G = ['#4F8E3C', '#5A9B44', '#64A84C', '#71B455'].map(rgb), GD = rgb('#3F7832'), GF = [rgb('#F4F0E4'), rgb('#FFE070'), rgb('#F59AC0')];
  const DIRT = ['#B8946A', '#C4A274', '#CDAD80', '#D8BA8C'].map(rgb), DIRTE = rgb('#9C7A52');
  const W = ['#2F7FB8', '#3A8FC6', '#4A9ED2', '#5CB0E0'].map(rgb), WL = rgb('#A6E0F6'), SAND = rgb('#D9C48E'), SANDD = rgb('#B9A06A');
  const STONE = [['#7F8CA3', '#8C99B0', '#98A5BB'].map(rgb), ['#A38B84', '#B09891', '#BCA59E'].map(rgb)], GROUT = [rgb('#5E6A80'), rgb('#7E6660')];
  const WALLC = rgb('#2C4F28'), BUSHC = ['#7CB83C', '#8CC646', '#9ED356', '#6AA532'].map(rgb);
  for (let y = 0; y < S; y++) for (let x = 0; x < S; x++) {
    const k = y * S + x, wx = (x + 0.5) * PXU, wy = (y + 0.5) * PXU;
    const by = BAYER[(y & 3) * 4 + (x & 3)];
    if (wall[k] || x < bp || y < bp || x >= S - bp || y >= S - bp) { put(k, WALLC); continue; }
    // 泉水
    const ds0 = Math.hypot(x - sp0[0], y - sp0[1]), ds1 = Math.hypot(x - sp1[0], y - sp1[1]);
    if (ds0 < SPR_R || ds1 < SPR_R) {
      const team = ds0 < SPR_R ? 0 : 1, dd = Math.min(ds0, ds1);
      if (dd > SPR_R - 4) { put(k, rgb('#E8E2D4')); continue; }
      const base = team ? ['#C8504A', '#E06A5E', '#F2948A'] : ['#3A78D8', '#4F92F0', '#7FB4FF'];
      const n = vnoise(x / 9, y / 9, 7) + (hash2(x, y, 3) < 0.03 ? 0.6 : 0);
      put(k, rgb(base[n > 0.75 ? 2 : n > 0.4 ? 1 : 0]));
      continue;
    }
    // 基地石板
    const team = inBaseFloor(0, wx, wy) ? 0 : inBaseFloor(1, wx, wy) ? 1 : -1;
    if (team >= 0) {
      const tx = Math.floor((x + (Math.floor(y / 10) % 2) * 5) / 10), ty = Math.floor(y / 10);
      if (x % 10 === ((Math.floor(y / 10) % 2) * 5) % 10 || y % 10 === 0) { put(k, GROUT[team]); continue; }
      const v = hash2(tx, ty, 11);
      put(k, STONE[team][v < 0.33 ? 0 : v < 0.75 ? 1 : 2]);
      continue;
    }
    // 河道
    const rv = Math.abs(x - y) * 0.7071;
    const RW = 255 / PXU;
    if (rv < RW + 6) {
      if (rv > RW) { put(k, (x + y) % 3 ? SAND : SANDD); continue; }
      const depth = 1 - rv / RW;
      const n = vnoise(x / 14 + y / 30, y / 14, 5) * 0.5 + depth * 0.6;
      let col = W[n > 0.75 ? 0 : n > 0.55 ? 1 : n > 0.35 ? 2 : 3];
      const ripple = ((x + y + Math.floor(vnoise(x / 20, y / 20, 9) * 30)) % 17 === 0) && hash2(x, y, 4) < 0.5;
      if (ripple) col = WL;
      put(k, col);
      continue;
    }
    // 土路
    const ld = laneD[k];
    if (ld < LW) {
      if (ld > LW - 3) { put(k, by < 0.5 ? DIRTE : DIRT[0]); continue; }
      const n = vnoise(x / 12, y / 12, 2) * 0.7 + hash2(x, y, 6) * 0.3;
      put(k, DIRT[n + (by - 0.5) * 0.15 > 0.62 ? 3 : n > 0.48 ? 2 : n > 0.33 ? 1 : 0]);
      continue;
    }
    // 草丛
    if (bush[k]) {
      const blade = (x * 3 + Math.floor(y / 3) * 7) % 5;
      const n = hash2(x, Math.floor(y / 2), 8);
      put(k, BUSHC[blade === 0 ? 3 : n > 0.7 ? 2 : n > 0.3 ? 1 : 0]);
      continue;
    }
    // 草地
    const n = vnoise(x / 40, y / 40, 1) * 0.6 + vnoise(x / 9, y / 9, 3) * 0.4;
    const q = n + (by - 0.5) * 0.18;
    let col = G[q > 0.68 ? 3 : q > 0.52 ? 2 : q > 0.36 ? 1 : 0];
    const h = hash2(x, y, 21);
    if (h < 0.004) col = GF[Math.floor(hash2(x, y, 22) * 3)];
    else if (h < 0.03 && (y & 1)) col = GD;
    put(k, col);
  }
  g.putImageData(img, 0, 0);
  if (progress) progress(0.5);
  // 墙的影子（往右下错开）
  g.globalAlpha = 0.28; g.fillStyle = '#0E2410';
  for (let y = 0; y < S; y += 1) {
    let run = -1;
    for (let x = 0; x <= S; x++) {
      const on = x < S && y >= 5 && x >= 4 && wall[(y - 5) * S + (x - 4)] && !wall[y * S + x];
      if (on && run < 0) run = x;
      if (!on && run >= 0) { g.fillRect(run, y, x - run, 1); run = -1; }
    }
  }
  g.globalAlpha = 1;
  // 野怪窝、龙坑
  const lair = (wx, wy, r, col) => {
    const cx = Math.round(wx / PXU), cy = Math.round(wy / PXU), rr = Math.round(r / PXU);
    for (let yy = -rr; yy <= rr; yy++) for (let xx = -rr; xx <= rr; xx++) {
      const dd = Math.hypot(xx, yy * 1.25);
      if (dd > rr) continue;
      g.fillStyle = dd > rr - 2 ? '#7A6448' : ((xx + yy) & 3) ? col : shade(col, 0.9);
      g.fillRect(cx + xx, cy + yy, 1, 1);
    }
  };
  for (const side of [0, 1]) for (const cp of CAMPS_BLUE) { const p = side ? mir(cp.p) : cp.p; lair(p[0], p[1], cp.type === 'red' || cp.type === 'blue' ? 95 : 75, '#8E7656'); }
  for (const dr of DRAGONS) {
    const cx = Math.round(dr.p[0] / PXU), cy = Math.round(dr.p[1] / PXU), rr = 68;
    for (let yy = -rr; yy <= rr; yy++) for (let xx = -rr; xx <= rr; xx++) {
      const dd = Math.hypot(xx, yy);
      if (dd > rr) continue;
      g.fillStyle = dd > rr - 4 ? ((Math.atan2(yy, xx) * 8 | 0) % 2 ? '#8A8478' : '#A8A296') : dd > rr - 7 ? '#5E584E' : ((xx * 7 + yy * 3) % 11 === 0 ? '#3E6A8E' : '#2E5A7E');
      g.fillRect(cx + xx, cy + yy, 1, 1);
    }
  }
  // 路上的小石子
  for (let i = 0; i < 2600; i++) {
    const x = Math.floor(hash2(i, 1, 31) * S), y = Math.floor(hash2(i, 2, 31) * S);
    if (laneD[y * S + x] < LW - 8 && !wall[y * S + x] && Math.abs(x - y) * 0.7071 > 255 / PXU + 6) {
      g.fillStyle = '#8E7452'; g.fillRect(x, y, 2, 1); g.fillStyle = '#E2CCA0'; g.fillRect(x, y - 1, 1, 1);
    }
  }
  // 草地上的小草丛、花
  for (let i = 0; i < 9000; i++) {
    const x = Math.floor(hash2(i, 3, 41) * S), y = Math.floor(hash2(i, 4, 41) * S), k = y * S + x;
    if (wall[k] || bush[k] || laneD[k] < LW + 2 || Math.abs(x - y) * 0.7071 < 255 / PXU + 8) continue;
    if (inBaseFloor(0, x * PXU, y * PXU) || inBaseFloor(1, x * PXU, y * PXU)) continue;
    g.fillStyle = '#3F7832'; g.fillRect(x, y, 1, 3); g.fillRect(x + 2, y + 1, 1, 2); g.fillStyle = '#86C062'; g.fillRect(x + 1, y - 1, 1, 3);
  }
  if (progress) progress(0.7);
  // 树：墙里按抖动的网格种树，从上往下画（下面的树挡住上面的）
  const trees = [];
  const TS = 13;
  for (let gy = 0; gy < S + TS; gy += TS) for (let gx = 0; gx < S + TS; gx += TS) {
    const x = gx + Math.floor((hash2(gx, gy, 51) - 0.5) * 10), y = gy + Math.floor((hash2(gx, gy, 52) - 0.5) * 10);
    if (x < 0 || y < 0 || x >= S || y >= S) continue;
    const inBorder = x < bp - 2 || y < bp - 2 || x >= S - bp + 2 || y >= S - bp + 2;
    if (!wall[y * S + x] && !inBorder) continue;
    trees.push([x, y, hash2(gx, gy, 53)]);
  }
  trees.sort((a, b) => a[1] - b[1]);
  const TREE = [0, 1, 2, 3].map(treeSprite);
  for (const [x, y, h] of trees) {
    const t = TREE[Math.floor(h * 4)];
    g.drawImage(t, x - (t.width >> 1), y - t.height + 6);
  }
  // 基地边上的石柱、泉水里的喷泉
  for (const team of [0, 1]) {
    const f = team ? mir : p => p;
    const sp = f(SPRING);
    const cx = Math.round(sp[0] / PXU), cy = Math.round(sp[1] / PXU);
    const ft = fountainSprite(team);
    g.drawImage(ft, cx + (team ? -50 : 20), cy + (team ? 18 : -60));
  }
  if (progress) progress(0.9);
  return c;
}
function treeSprite(v) {
  const c = mkc(30, 34), g = c.getContext('2d');
  const pal = [['#24502A', '#2F6534', '#3E7E40', '#5A9E52'], ['#1F4A2C', '#2A5E36', '#3A7646', '#56965A'], ['#2A5228', '#356A30', '#47853C', '#68A452'], ['#22482E', '#2E5C3A', '#3E744A', '#5C9462']][v];
  const r = [12, 11, 13, 10][v];
  const cx = 15, cy = 14;
  g.fillStyle = '#4A3420'; g.fillRect(cx - 2, cy + r - 4, 4, 10);
  for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
    const dd = Math.hypot(x, y * 1.08) + (hash2(x + v * 50, y, 61) - 0.5) * 2.2;
    if (dd > r) continue;
    let k = 1;
    if (dd > r - 1.5) k = 0;
    else if (x + y < -r * 0.5 && dd < r - 2) k = 3;
    else if (x + y < r * 0.25) k = 2;
    if (k === 2 && hash2(x + v * 30, y, 62) < 0.15) k = 1;
    g.fillStyle = pal[k]; g.fillRect(cx + x, cy + y, 1, 1);
  }
  return c;
}
function fountainSprite(team) {
  const c = mkc(30, 40), g = c.getContext('2d'), P = (x, y, w, h, cl) => { g.fillStyle = cl; g.fillRect(x, y, w, h); };
  const col = TEAM_COL[team], lt = TEAM_LT[team];
  P(3, 30, 24, 8, '#B8B2A6'); P(3, 30, 24, 2, '#D8D2C6'); P(6, 18, 18, 12, '#A39D91'); P(6, 18, 18, 2, '#C8C2B6');
  P(12, 4, 6, 14, '#B8B2A6'); P(11, 2, 8, 3, col); P(13, 0, 4, 2, lt); P(8, 20, 14, 2, col);
  return outline(c, 200);
}
// 小地图：整张图缩成 n×n
function buildMinimap(tex, n) {
  const c = mkc(n, n), g = c.getContext('2d');
  g.imageSmoothingEnabled = true; g.imageSmoothingQuality = 'high';
  g.drawImage(tex, 0, 0, n, n);
  return c;
}
if (typeof module !== 'undefined') module.exports = {};
