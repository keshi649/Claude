// 《MOONRIDE》像素版：28.8 ~ 81.5 秒
'use strict';

// ================= 心形的谷地 =================
function shHeartCrater(lt, d) {
  sky([[0, '#2a2060'], [1, '#7a62b4']], 0, 70);
  stars(61, 30, 0, 0, W, 50, lt);
  moon(400, 24, 8, { halo: '#c8b0ff' });
  hills(62, 66, 10, .01, '#5a4896', { rim: '#8a74c8' });
  rect(0, 66, W, H, '#4a3a84');
  const cx = 240, cy = 168, sp = lt * 2;
  // 外圈毛茸茸的边
  const r = rng(63);
  for (let i = 0; i < 260; i++) { const a = i / 260 * Math.PI * 2; const p = HPATH[Math.floor(i / 260 * (HPATH.length - 1))]; const x = cx + (p[0] - .5) * 300, y = cy + (p[1] - .5) * 190 - 6; circ(x + (r() - .5) * 6, y + (r() - .5) * 6, 6 + r() * 5, r() < .5 ? '#9a82d2' : '#8068bc'); }
  // 一圈圈台阶往里收
  const cols = ['#b8a0e8', '#9a82d2', '#c8b4f0', '#8a72c4', '#b09ae0', '#7a62b4', '#a690dc', '#6a54a6'];
  for (let i = 0; i < 8; i++) { const s = 132 - i * 15; heart(cx, cy + i * 2.4, s, cols[i]); heart(cx, cy + i * 2.4 + 2, s - 2, shade(cols[i], .9)); }
  // 中间的小水塘，倒映月亮
  heart(cx, cy + 22, 16, '#3a3a7a'); heart(cx, cy + 22, 13, '#5a62b0'); circ(cx + 3, cy + 18, 3, '#f0eaff'); glow(cx, cy + 20, 18, [200, 190, 255], .5);
  // 台阶上的小马
  for (let i = 0; i < 6; i++) { const a = i * 1.05 + sp * .1, rr = 70 + (i % 3) * 18; pony(cx + Math.cos(a) * rr * 1.3, cy + Math.sin(a) * rr * .55 + 10, .55, { dir: Math.cos(a + 1.57) > 0 ? 1 : -1, run: lt * 8 + i, amb: ['#a080e0', .2] }); }
  fireflies(64, 20, 40, 80, 440, 260, lt, '#ffe0ff');
  bloom(1, 3, .9); vignette(.6);
}

// ================= 冻在冰里的小马 =================
function shFrozenPony(lt, d) {
  rect(0, 0, W, H, '#1a2450');
  iceBlock(-10, -10, W + 20, H + 20, {
    inner: (L) => { vgrad(0, 0, L.w, L.h, [[0, '#4a5aa0'], [1, '#9aa8e0']], 8); pony(L.w * .42 + lt * 3, L.h * .93, 5.4, { dir: 1, amb: ['#a0b8ff', .3] }); },
    bg: [[0, '#4a5aa0'], [1, '#9aa8e0']], frost: .3, cracks: 9, seed: 13,
  });
  // 冰面上的冷光扫过
  const sx = (lt / d) * 700 - 120; blend('screen'); poly([sx, 0, sx + 40, 0, sx - 60, H, sx - 100, H], [200, 230, 255], .25); blend();
  sparkles(66, 40, 0, 0, W, H, lt, { col: '#ffffff' });
  bloom(1, 3, .85); vignette(.5);
}

// ================= 冰块、车站 =================
function silhouette(L, pose, col) { fig(0, L.w / 2, L.h - 3, L.h * .82, { pose: pose || {}, top: 'blouse', col: 'navy', skirt: 'pants', amb: [col || '#1a1430', .85] }); }
function shBusStop(lt, d) {
  const pan = lt * 12;
  purpleGround(lt, 130, { bushes: 18, seed: 71 });
  // 车站：棚子 + 发光的灯箱
  const sx = 300 - pan;
  rect(sx, 120, 120, 6, '#e8e4f4'); rect(sx + 4, 126, 112, 2, '#a8a0c8');
  rect(sx + 6, 126, 3, 74, '#c8c0e0'); rect(sx + 110, 126, 3, 74, '#c8c0e0');
  rect(sx + 70, 136, 34, 56, '#f8f0ff'); rect(sx + 72, 138, 30, 52, '#d8eaff'); glowRect(sx + 70, 136, 34, 56, [200, 230, 255], .8);
  rect(sx + 20, 176, 40, 4, '#b8b0d8'); rect(sx + 22, 180, 3, 18, '#8a82b0'); rect(sx + 55, 180, 3, 18, '#8a82b0');
  // 冰块里的人
  const blocks = [[60, 120, 44, 100], [150, 140, 34, 72], [220, 104, 40, 92], [440, 150, 50, 110]];
  blocks.forEach(([bx, by, bw, bh], i) => iceBlock(bx - pan * (.8 + i * .1), by, bw, bh, { inner: (L) => silhouette(L, i % 2 ? POSE.stand() : { la: [2.5, .3], ra: [2.6, .2] }), bg: [[0, '#6a58a8'], [1, '#b89ad8']], frost: .4, seed: 20 + i }));
  fireflies(72, 12, 0, 100, W, 250, lt, '#e0d0ff');
  bloom(1, 3, .9); vignette(.55);
}
function shIceSil(lt, d) {
  purpleGround(lt, 150, { moon: [80, 40, 12], bushes: 16, seed: 81 });
  const s = 1 + lt * .02;
  iceBlock(170, 30, 140, 230, { inner: (L) => { fig(0, L.w / 2, L.h - 2, L.h * .95, { pose: { la: [2.4, .6], ra: [2.4, .6] }, top: 'blouse', col: 'navy', skirt: 'pants', amb: ['#2a1c48', .7] }); }, bg: [[0, '#5a48a0'], [1, '#c0a0e8']], frost: .38, cracks: 5, seed: 33 });
  fireflies(82, 14, 0, 120, W, 260, lt, '#e0d0ff');
  bloom(1, 3, .9); vignette(.55);
}
function shHandGlass(lt, d, o) {
  violetHills(lt, 170);
  meadow(91, 120, 0, W, 196, H + 4, lt, { cols: ['#c8a6ff', '#9a7ad8', '#e4d0ff'], lav: 1, h: 18, stem: '#3a2c5c' });
  const push = smooth(ramp(lt, 0, d)) * 14;
  bust(o.g, 250, 100, 32, { cloth: 'blouse', col: 'white', mouth: 'n', look: [0, 0], amb: ['#a088e0', .18],
    after: (L, ox, oy, s) => { const hx = ox - 1.75 * s, hy = oy + 1.5 * s - push * .3; thick(ox - 1.6 * s, oy + 3.6 * s, hx, hy + 1 * s, .45 * s, SKIN.b); ell(hx, hy, .75 * s, .9 * s, SKIN.b); for (let f = -1.5; f <= 1.5; f++) thick(hx + f * .32 * s, hy - .5 * s, hx + f * .4 * s, hy - 1.55 * s, .17 * s, SKIN.b); thick(hx + .7 * s, hy + .1 * s, hx + 1.25 * s, hy - .5 * s, .17 * s, SKIN.b); line(hx - .2 * s, hy + .2 * s, hx + .3 * s, hy + .5 * s, SKIN.s); } });
  // 冰面：四周的霜
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const e = Math.min(x, W - x, y * 1.5, (H - y) * 1.5); if (e < 40) { const k = (1 - e / 40); if (k > bay(x, y) * .9) pp(x, y, mixc([210, 225, 255], [255, 255, 255], h2(x, y, 3)), .5 * k + .2); } }
  rect(0, 0, W, H, '#dce8ff', .08);
  bloom(.9, 3, .9); vignette(.4);
}

// ================= 白栅栏的路、钟楼门 =================
function sunsetSky(lt, y1, o) {
  o = o || {};
  sky(o.stops || [[0, '#5a4aa0'], [.45, '#c07ab8'], [.8, '#f6a8a0'], [1, '#ffd2a8']], 0, y1);
  const r = rng(o.seed || 101);
  for (let i = 0; i < (o.n || 7); i++) { const x = r() * W + (o.drift || 0) * lt * (r() + .3), y = 20 + r() * (y1 * .7), w = 60 + r() * 120; cloud(((x % (W + 160)) + W + 160) % (W + 160) - 80, y, w, 14 + r() * 14, ['#c28ab8', '#f2b0c4', '#ffd8dc', '#fff2ee'], i + (o.seed || 0)); }
}
function floatHearts(seed, n, lt, area, cols) {
  const r = rng(seed); const cs = cols || ['#ff8fb0', '#ff6a8e', '#ffb0c8'];
  for (let i = 0; i < n; i++) { const x = area[0] + r() * (area[2] - area[0]), y = area[1] + r() * (area[3] - area[1]) - ((lt * (3 + r() * 4)) % 40), s = 3 + r() * 5; foilHeart(x + Math.sin(lt + i) * 3, y, s, cs[i % cs.length], { sl: s * 1.6, t: lt + i }); }
}
function clockGate(x, y, s, lt, o) { // (x,y) 底中；s 倍
  o = o || {}; const X = u => x + u * s, Y = v => y + v * s;
  rect(X(-20), Y(-70), 40 * s, 70 * s, '#d89a86'); ell(X(0), Y(-70), 20 * s, 18 * s, '#d89a86');
  rect(X(-16), Y(-66), 32 * s, 66 * s, '#c28274'); ell(X(0), Y(-66), 16 * s, 14 * s, '#c28274');
  // 门洞：透出光
  rect(X(-8), Y(-34), 16 * s, 34 * s, '#ffe8c0'); ell(X(0), Y(-34), 8 * s, 8 * s, '#ffe8c0');
  glow(X(0), Y(-20), 18 * s, [255, 220, 160], o.light || .3); glowRect(X(-8), Y(-40), 16 * s, 40 * s, [255, 230, 170], (o.light || .3) * .5);
  // 钟
  circ(X(0), Y(-64), 9 * s, '#fff4e0'); circ(X(0), Y(-64), 8 * s, '#ffe8d0'); heart(X(0), Y(-64), 4 * s, '#d8566e');
  const a = lt * .7; line(X(0), Y(-64), X(0) + Math.sin(a) * 6 * s, Y(-64) - Math.cos(a) * 6 * s, '#5a3030'); line(X(0), Y(-64), X(0) + Math.sin(a * 12) * 4 * s, Y(-64) - Math.cos(a * 12) * 4 * s, '#5a3030');
  // 门两边的心形灌木
  for (const sd of [-1, 1]) { heart(X(sd * 30), Y(-14), 9 * s, '#4a7a4a'); heart(X(sd * 30), Y(-15), 7 * s, '#5e9a5a'); rect(X(sd * 30) - 1, Y(-6), 2, 6 * s, '#5a3a2a'); }
}
function shGateWalk(lt, d) {
  const hz = 150;
  sunsetSky(lt, hz + 10, { seed: 103, drift: 3 });
  floatHearts(105, 9, lt, [0, 20, W, 120]);
  hills(106, hz, 12, .01, '#9a6aa8', { rim: '#c890c8' });
  rect(0, hz, W, H, '#7a5a96');
  meadow(107, 200, 0, W, hz + 2, H, lt, { cols: ['#b48ae0', '#e8a8d8', '#ffffff'], lav: 1, h: 12, stem: '#5a3e72' });
  clockGate(240, hz + 2, 1.15, lt);
  // 小路（透视）和白栅栏
  poly([228, hz + 2, 252, hz + 2, 330, H, 150, H], '#e8c8c0'); poly([232, hz + 2, 248, hz + 2, 300, H, 180, H], '#f4dcd4');
  for (const sd of [-1, 1]) {
    for (let i = 0; i < 16; i++) { const t = i / 15, tt = t * t; const x = 240 + sd * (16 + tt * 140), yb = hz + 4 + tt * (H - hz), hgt = 3 + tt * 34, w = 1 + tt * 3; rect(x - w / 2, yb - hgt, w, hgt, '#ffffff'); rect(x - w / 2, yb - hgt, w, 1, '#ffeef0'); }
    for (const k of [.35, .75]) line(240 + sd * 16, hz + 4 - 3 * k, 240 + sd * 156, H - 37 * k, '#ffffff', 1, 2);
  }
  // 三个人往门走（背影）
  const walk = lt * 7;
  const pz = 1 - lt / d * .25;
  for (const [i, g, dx] of [[0, 4, -26], [1, 2, 0], [2, 0, 26]]) fig(g, 240 + dx * pz, 232 - lt * 10, 70 * pz, { view: 'back', top: i === 1 ? 'off' : 'strap', col: i === 1 ? 'white' : 'pink', skirt: 'puffy', scol: i === 1 ? 'white' : 'pink', shoes: 'boots', pose: POSE.walkF(walk + i), amb: ['#ffb0a0', .12] });
  bloom(1, 3, .9); vignette(.45);
}
function shGateProfiles(lt, d) {
  sunsetSky(lt, H, { seed: 111, stops: [[0, '#6a4ab0'], [.5, '#b478c0'], [1, '#f0a8b8']], n: 5 });
  floatHearts(112, 7, lt, [0, 10, W, 180]);
  hills(113, 200, 14, .01, '#8a62a8'); rect(0, 200, W, H, '#7a5296');
  clockGate(400, 210, 1.3, lt, { light: .35 + lt * .2 });
  const g0 = [[4, 140, 108, 34], [2, 236, 116, 28], [0, 320, 122, 24]];
  for (let i = g0.length - 1; i >= 0; i--) { const [g, x, y, s] = g0[i]; profBust(g, x + lt * 2, y, s, { dir: 1, cloth: i === 1 ? 'off' : 'strap', col: i === 1 ? 'white' : 'pink', wind: .4, ph: lt * 2 + i, rim: ['#ffe0b0', 1, 0, .7], amb: ['#c090d0', .12], eyes: i === 0 && lt > 1.2 && lt < 1.32 ? 'closed' : 'open' }); }
  bloom(1.1, 4, .88);
  const fw = ramp(lt, d - .75, d - .2); if (fw > 0) { radial(400, 180, 300 * fw + 40, [255, 250, 230], 2 * fw); flash('#fffaf0', smooth(fw)); }
  vignette(.4 * (1 - ramp(lt, d - .8, d - .3)));
}

// ================= 薄荷绿展厅、胶囊电梯 =================
function capsule(x, y, w, h, lt, o) { // (x,y) 底中
  o = o || {}; const x0 = x - w / 2, y0 = y - h;
  rect(x0 - 3, y0 - 8, w + 6, 10, '#8ad0c0'); rect(x0 - 3, y0 - 8, w + 6, 2, '#bff0e4'); rect(x0 - 3, y - 4, w + 6, 6, '#8ad0c0');
  rect(x0, y0 + 2, w, h - 6, '#ffd8e4'); vgrad(x0, y0 + 2, w, h - 6, [[0, '#ffe8f0'], [1, '#f4a8c4']], 6);
  glowRect(x0, y0, w, h, [255, 170, 210], o.glow || .22);
  // 里面三个人
  const gs = o.girls || [4, 2, 0];
  gs.forEach((g, i) => fig(g, x - w * .28 + i * w * .28, y - 5, h * .72, { top: i === 1 ? 'off' : 'strap', col: i === 1 ? 'white' : 'pink', skirt: 'puffy', scol: 'white', shoes: 'boots', pose: o.dance ? POSE.dance(lt, i * 2) : POSE.stand(), mouth: 'smile' }));
  // 玻璃
  rect(x0, y0 + 2, w, h - 6, '#e8fff8', .18); rect(x0 + 2, y0 + 2, 3, h - 6, '#ffffff', .5); rect(x0 + w * .7, y0 + 2, 2, h - 6, '#ffffff', .3);
  rect(x0 - 3, y0 + 2, 3, h - 6, '#8ad0c0'); rect(x0 + w, y0 + 2, 3, h - 6, '#6ab8a8');
  heart(x, y0 - 3, 3, '#ff7aa0');
}
function museumHall(lt, light) {
  const VX = 240, VY = 120;
  rect(0, 0, W, H, '#7cc4b0');
  // 天花板
  poly([0, 0, W, 0, 340, 60, 140, 60], '#f0d4bc'); for (let i = 0; i < 6; i++) line(i * 96, 0, 140 + i * 40, 60, '#d8b8a0');
  // 左右墙
  poly([0, 0, 140, 60, 140, 190, 0, H], '#86ccb8'); poly([W, 0, 340, 60, 340, 190, W, H], '#76bca8');
  // 墙上的拱形壁龛（粉色灯光、架子上的瓶子）
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) {
    const t = i / 3, x = sd < 0 ? 14 + t * 108 : W - 14 - t * 108, w = 34 - t * 18, top = 40 + t * 22, hgt = 120 - t * 60;
    const x0 = sd < 0 ? x : x - w;
    rect(x0, top, w, hgt, '#f2a890'); ell(x0 + w / 2, top, w / 2, w * .3, '#f2a890');
    rect(x0 + 2, top + 2, w - 4, hgt - 4, '#ffc8b0'); glowRect(x0, top, w, hgt, [255, 170, 140], .25 * light);
    for (let k = 1; k < 4; k++) { rect(x0 + 2, top + hgt * k / 4, w - 4, 2, '#e08870'); for (let v = 0; v < 3; v++) { const vx = x0 + 4 + v * (w - 8) / 3, vy = top + hgt * k / 4; ell(vx + 2, vy - 3, 2 + (1 - t), 3 + (1 - t), ['#5a9ab8', '#e8c878', '#b85a5a'][(v + k) % 3]); } }
  }
  // 地板：橙色的格子（透视）
  for (let y = 190; y < H; y++) for (let x = 0; x < W; x++) { const z = 60 / (y - VY), u = (x - VX) * z * .08, v = z * 2.2; pp(x, y, (Math.floor(u) + Math.floor(v)) % 2 ? [232, 176, 120] : [244, 196, 140]); }
  poly([140, 190, 340, 190, W, H, 0, H], '#000000', 0);
  rect(140, 60, 200, 130, '#94d6c2'); rect(150, 70, 180, 120, '#a2dece');
}
function shMuseum(lt, d) {
  museumHall(lt, 1);
  const sink = smooth(ramp(lt, d - .55, d)) * 60;
  withMask(maskPoly([0, 0, W, 0, W, 210, 0, 210]), () => capsule(240, 210 + sink, 66, 120, lt, { dance: 0 }));
  ell(240, 211, 40, 6, '#5aa894');
  sparkles(121, 20, 100, 40, 380, 200, lt, { col: '#fff0f4' });
  bloom(1, 3, .9); vignette(.4);
}
function shShaft(lt, d) {
  const blue = smooth(ramp(lt, 4.5, 4.9)), dark = Math.sin(Math.PI * sat(lt / d)) * .5;
  const base = mixc(mixc('#3a3e24', '#1c1e14', dark), '#14244a', blue), lineC = mixc(mixc('#6a6e40', '#3a3c24', dark), '#2a4a8a', blue);
  rect(0, 0, W, H, base);
  // 分三段换景别：近 → 远（看得到更多层架子）→ 近 + 蓝光
  const far = lt > 2.0 && lt < 4.0, gap = far ? 34 : 60;
  // 一层层往上掠过的架子（透视）
  const speed = far ? 70 : 110, off = (lt * speed) % gap;
  for (let k = -1; k < (far ? 10 : 6); k++) {
    const y = H - (k * gap + off) * 1;
    const t = (y - 135) / 135;
    poly([0, y - 10, W, y - 10, W, y, 0, y], lineC);
    rect(0, y - 10, W, 2, lit(lineC, .25));
    // 架子上的黑色轮胎和粉色挡板
    const sc = far ? .6 : 1; for (let i = 0; i < (far ? 9 : 6); i++) { const x = (i * (far ? 61 : 97) + k * 41) % W; ring(x, y - 18 * sc, 9 * sc, 5 * sc, '#0c0c10'); rect(x + 20 * sc, y - 34 * sc, 18 * sc, 24 * sc, mixc('#d88aa0', '#5a7ad0', blue)); }
  }
  // 两边的竖梁
  for (const x of (far ? [40, 110, 180, 300, 370, 440] : [60, 150, 330, 420])) { rect(x - (far ? 4 : 6), 0, far ? 8 : 12, H, shade(lineC, .8)); rect(x - (far ? 4 : 6), 0, 2, H, lit(lineC, .2)); }
  // 掉下来的火花
  for (let i = 0; i < 14; i++) { const r = rng(1300 + i); const y = ((r() * H + lt * (60 + r() * 80)) % (H + 20)) - 10, x = r() * W; px(x, y, '#ffe8a0', .8); glow(x, y, 2, [255, 220, 150], .4); }
  // 中间的胶囊：跟着往下（在画面里基本不动，轻轻晃）
  const wob = Math.sin(lt * 3) * 2;
  if (far) { capsule(240 + wob, 190, 42, 78, lt + 43.4, { dance: 1, glow: .32 }); line(240 + wob, 0, 240 + wob, 104, '#9a9a8a'); }
  else { capsule(240 + wob, 215, 70, 128, lt + 43.4, { dance: 1, glow: .32 }); line(240 + wob, 0, 240 + wob, 80, '#9a9a8a'); }
  // 光圈扫过
  const ry = (lt * 140) % 340 - 40; blend('screen'); rect(0, ry, W, 6, mixc([200, 200, 120], [120, 170, 255], blue), .25); blend();
  bloom(1, 4, .85); vignette(.75);
  if (lt > d - .25) flash('#000000', ramp(lt, d - .25, d - .05));
}
function shBlack(lt, d) { rect(0, 0, W, H, '#000000'); }

// ================= 粉色浴室 =================
function shBath(lt, d) {
  vgrad(0, 0, W, H, [[0, '#ffe6ea'], [1, '#ffd0dc']], 6);
  // 圆窗
  for (const x of [60, 420]) { circ(x, 70, 30, '#ffffff'); circ(x, 70, 26, '#cfeaff'); circ(x - 6, 62, 8, '#e8f6ff'); glow(x, 70, 26, [255, 255, 255], .12); }
  // 柱子
  for (const x of [130, 350]) { rect(x - 8, 0, 16, 200, '#bfe2f2'); rect(x - 8, 0, 4, 200, '#e4f6ff'); }
  // 中间的胶囊
  capsule(240, 196, 62, 116, lt + 50, { dance: 1, glow: .2 });
  // 池子
  rect(0, 196, W, H, '#bfe8f8'); for (let y = 198; y < H; y += 4) line(0, y + Math.sin(lt * 3 + y) * 2, W, y + Math.sin(lt * 3 + y + 1) * 2, '#e4f8ff');
  // S 形气球
  const sx = 340, sy = 160 + Math.sin(lt * 2) * 3;
  const sp = []; for (let i = 0; i <= 24; i++) { const a = (-20 - i * 250 / 24) * Math.PI / 180; sp.push([sx + Math.cos(a) * 15, sy - 15 + Math.sin(a) * 15]); }
  for (let i = 0; i <= 24; i++) { const a = (-90 + i * 250 / 24) * Math.PI / 180; sp.push([sx + Math.cos(a) * 15, sy + 15 + Math.sin(a) * 15]); }
  for (const [x, y] of sp) circ(x, y, 7, '#e85a8a'); for (const [x, y] of sp) circ(x - 1, y - 1, 6, '#ff7aa8'); for (const [x, y] of sp) circ(x - 2, y - 2, 2, '#ffc8dc');
  // 小黄鸭、游泳圈
  for (const [x, y, s] of [[90, 214, 1], [170, 230, 1.3], [400, 240, 1.1]]) { const yy = y + Math.sin(lt * 3 + x) * 2; ell(x, yy, 9 * s, 6 * s, '#ffd84a'); circ(x + 6 * s, yy - 7 * s, 5 * s, '#ffd84a'); rect(x + 10 * s, yy - 7 * s, 4 * s, 2 * s, '#ff8a3a'); px(x + 7 * s, yy - 9 * s, '#2a1a10'); }
  ring(280, 236, 16, 8, '#ff6a8a'); for (let a = 0; a < 6.28; a += 1.57) circ(280 + Math.cos(a) * 16, 236 + Math.sin(a) * 16, 3, '#ffffff');
  // 雾
  rect(0, 0, W, H, '#ffffff', .12);
  bloom(1, 4, .95); vignette(.3);
}

// ================= 粉色湖 =================
function shPinkLake(lt, d) {
  vgrad(0, 0, W, 120, [[0, '#ffd8e8'], [1, '#ffe8f0']], 6);
  // 远处的岸、花
  hills(131, 112, 16, .012, '#d8a0c0'); rect(0, 112, W, 20, '#c890b8');
  meadow(132, 120, 0, W, 106, 130, lt, { cols: ['#ffffff', '#ffb8d0', '#ffd8e8'], h: 6, stem: '#a87098' });
  // 湖
  vgrad(0, 128, W, 110, [[0, '#ffc8dc'], [1, '#f4a0c0']], 6);
  for (let k = 0; k < 4; k++) { const r = ((lt * 18 + k * 22) % 88); ell(240, 186, r * 1.6, r * .4, '#ffe4ee', .5 * (1 - r / 88)); ell(240, 186, r * 1.6 - 2, r * .4 - 1, '#f4a0c0', .5 * (1 - r / 88)); }
  // 漂着的心
  const by = 176 + Math.sin(lt * 2) * 2;
  heart(240, by, 30, '#e0507a'); heart(237, by - 2, 27, '#ff6f96'); heart(228, by - 10, 10, '#ffb0c8'); px(224, by - 14, '#ffffff'); px(225, by - 15, '#ffffff');
  ell(240, by + 26, 30, 4, '#c05878', .5);
  glow(240, by, 36, [255, 140, 180], .22);
  // 前景的花
  meadow(133, 150, 0, W, 232, H + 4, lt, { cols: ['#ffffff', '#ffb0c8', '#ff8fb0', '#ffe8a0'], h: 30, stem: '#6a9a6a' });
  // 蝴蝶
  for (let i = 0; i < 6; i++) { const x = (i * 83 + lt * 30) % (W + 40) - 20, y = 60 + Math.sin(lt * 1.5 + i) * 30 + i * 18, f = Math.sin(lt * 20 + i) > 0; const c = i % 2 ? '#ffffff' : '#ffd0e0'; rect(x - (f ? 3 : 1), y, f ? 3 : 1, 2, c); rect(x + 1, y, f ? 3 : 1, 2, c); px(x, y, '#5a4050'); }
  rect(0, 0, W, H, '#ffffff', .1);
  bloom(1, 4, .95); vignette(.3);
}

// ================= 红色天空、心形大锤 =================
function redField(lt, hz, o) {
  o = o || {};
  sky([[0, '#4a0410'], [.6, '#a01020'], [1, '#d83a3a']], 0, hz + 6);
  hills(141, hz, 10, .01, '#5a4a7a', { rim: '#8a7aa8' });
  rect(0, hz, W, H, '#4a3e70');
  vgrad(0, hz, W, H - hz, [[0, '#5a4c82'], [1, '#2e2448']], 6);
  const r = rng(o.seed || 142); const bs = [];
  for (let i = 0; i < 22; i++) { const y = hz + 8 + r() * (H - hz); bs.push([r() * W, y, 4 + (y - hz) * .1]); }
  bs.sort((a, b) => a[1] - b[1]); for (const [x, y, s] of bs) bush(x, y, s, ['#3a2e5a', '#5a4a84', '#7a6aa8', '#a898d0'], Math.floor(x));
}
function mallet(x0, y0, x1, y1, s) { // 握把在 (x0,y0)，锤头在 (x1,y1)
  line(x0, y0, x1, y1, '#f4e8f0', 1, Math.max(2, Math.round(s * .12)));
  const n = Math.hypot(x1 - x0, y1 - y0) / 4; for (let i = 0; i < n; i++) { const t = i / n; if (i % 2) px(x0 + (x1 - x0) * t, y0 + (y1 - y0) * t, '#ff9ac0'); }
  const a = Math.atan2(y1 - y0, x1 - x0), px_ = -Math.sin(a), py_ = Math.cos(a);
  // 锤头：横着的圆柱，两头是心
  const hx = x1, hy = y1, L = s * .9;
  thick(hx - px_ * L, hy - py_ * L, hx + px_ * L, hy + py_ * L, s * .42, '#f8eef4');
  thick(hx - px_ * L, hy - py_ * L, hx + px_ * L, hy + py_ * L, s * .3, '#ffffff');
  for (const k of [-1, 1]) { heart(hx + px_ * L * k, hy + py_ * L * k, s * .4, '#ff6f9a'); heart(hx + px_ * L * k - 1, hy + py_ * L * k - 1, s * .2, '#ffb8d0'); }
  for (let i = -3; i <= 3; i++) px(hx + px_ * i * s * .2, hy + py_ * i * s * .2, '#e0c0d0');
}
function shRedField(lt, d) {
  redField(lt, 150);
  const blocks = [[40, 150, 30, 64], [110, 160, 26, 52], [330, 140, 34, 70], [420, 156, 30, 60]];
  blocks.forEach(([bx, by, bw, bh], i) => iceBlock(bx, by, bw, bh, { inner: (L) => silhouette(L, i % 2 ? POSE.stand() : { la: [2.5, .3], ra: [2.6, .2] }, '#200818'), bg: [[0, '#8a2a40'], [1, '#c06070']], tint: '#ffd0dc', frost: .35, seed: 40 + i }));
  // 冰块里的她（要被救出来）
  iceBlock(272, 116, 44, 104, { inner: (L) => fig(6, L.w / 2, L.h - 3, 88, { top: 'strap', col: 'pink', skirt: 'mid', pose: { la: [.8, -1.6], ra: [.6, -2.2] } }), bg: [[0, '#a04050'], [1, '#e09090']], tint: '#ffd8e4', frost: .3, seed: 49 });
  // 扛着锤子走过来
  const x = 120 + lt * 26;
  const P = fig(0, x, 236, 96, { top: 'cami', col: 'white', skirt: 'puffy', shoes: 'boots', pose: Object.assign(POSE.walkF(lt * 7), { ra: [2.5, 1.2], la: [.3, -.3] }), amb: ['#ff8080', .12], rim: ['#ff9a8a', -1, 0, .5] });
  const hx = P.ox + P.hr[0], hy = P.oy + P.hr[1];
  mallet(hx, hy, hx - 34, hy - 30, 26);
  sparkles(143, 16, 0, 60, W, 240, lt, { col: '#ffd0d8' });
  bloom(1, 3, .9); vignette(.55);
}
function shHammerGirl(lt, d, o) {
  redField(lt, 150, { seed: 151 });
  for (const [bx, by, bw, bh] of [[30, 120, 40, 90], [400, 110, 44, 100]]) iceBlock(bx, by, bw, bh, { inner: (L) => silhouette(L, POSE.stand(), '#200818'), bg: [[0, '#8a2a40'], [1, '#c06070']], tint: '#ffd0dc', frost: .35, seed: bx });
  bust(o.g, 250, 100, 34, { cloth: 'off', col: 'white', mouth: 'smile', turn: -.2, look: [-.3, 0], amb: ['#ff9090', .1], rim: ['#ffb0a0', 1, 0, .6], ear: true, wind: .5, ph: lt * 2,
    after: (L, ox, oy, s) => { const hx = ox - 1.3 * s, hy = oy + 2.4 * s; thick(ox - 1.6 * s, oy + 3.4 * s, hx, hy, .4 * s, SKIN.b); } });
  mallet(175, 230, 120, 70, 44);
  bloom(1, 3, .9); vignette(.5);
}
function shSwing(lt, d) {
  redField(lt, 150, { seed: 161 });
  const hit = d - .12, k = lt < hit - .55 ? -ramp(lt, 0, hit - .55) : -1 + easeIn(ramp(lt, hit - .55, hit)) * 2.4;
  const shake = lt > hit ? Math.round(Math.sin(lt * 90) * 3 * Math.exp(-(lt - hit) * 8)) : 0; OX = shake;
  // 冰块
  iceBlock(282, 60, 120, 196, { inner: (L) => bust(6, L.w / 2, 60, 22, { cloth: 'strap', col: 'pink', eyes: 'closed', mouth: 'n', blush: true }), bg: [[0, '#a04050'], [1, '#e09090']], tint: '#ffd8e4', frost: .28, cracks: lt > hit ? 14 : 3, seed: 51 });
  // 挥锤的她（侧面朝右）
  const a = 1.2 + k * 1.6;
  const P = fig(0, 190, 254, 150, { view: 'side', dir: 1, top: 'cami', col: 'white', skirt: 'puffy', shoes: 'boots', pose: { la: [a, .2], ra: [a + .1, .1], ll: [.25, 0], rl: [-.2, .1], lean: k * .3 }, amb: ['#ff8080', .12], rim: ['#ffb0a0', 1, 0, .6] });
  const hx = P.ox + P.hf[0], hy = P.oy + P.hf[1], ang = -Math.PI / 2 + a;
  mallet(hx, hy, hx + Math.cos(ang) * 60, hy + Math.sin(ang) * 60, 36);
  OX = 0;
  if (lt > hit) { const f = Math.exp(-(lt - hit) * 10); flash('#ffffff', f); sparkles(162, 40, 260, 40, 420, 240, lt * 3, { col: '#ffffff' }); }
  bloom(1, 3, .9); vignette(.5);
}
function shShatter(lt, d) {
  vgrad(0, 0, W, H, [[0, '#5a0412'], [.5, '#9a0e22'], [1, '#4a0410']], 8);
  const r = rng(171);
  for (let i = 0; i < 46; i++) {
    const a = r() * 6.28, sp = 30 + r() * 120, s = 4 + r() * 18, rot = r() * 6;
    const dist = sp * (.25 + lt), x = 240 + Math.cos(a) * dist, y = 135 + Math.sin(a) * dist * .8;
    const isH = r() < .35;
    const c1 = [255, 240, 248], c2 = [214, 190, 226], c3 = [150, 110, 160];
    if (isH) { heart(x, y, s, c3, 1, rot + lt * 2); heart(x - 1, y - 1, s * .85, c2, 1, rot + lt * 2); heart(x - s * .3, y - s * .3, s * .3, c1, 1, rot + lt * 2); }
    else { const p = []; for (let k = 0; k < 4; k++) { const aa = rot + lt * 3 + k * 1.57 + (k % 2) * .4; p.push(x + Math.cos(aa) * s * (k % 2 ? .45 : 1), y + Math.sin(aa) * s * (k % 2 ? .45 : 1)); } poly(p, c2); poly([p[0], p[1], x, y, p[6], p[7]], c1); }
    if (r() < .25) glow(x, y, s * .7, [255, 220, 240], .15);
  }
  // 中间一颗大的心形晶体
  const s = 34 + lt * 50, cr = sat(lt * 3); heart(240, 135, s, [150, 110, 160], 1 - cr, Math.sin(lt) * .1); heart(238, 133, s * .88, [220, 200, 230], 1 - cr, Math.sin(lt) * .1);
  sparkles(172, 50, 0, 0, W, H, lt, { col: '#ffffff' });
  bloom(.8, 3, .93); vignette(.5);
}

// ================= 后视镜 =================
function shMirror(lt, d, o) {
  const tone = o.tone;
  const bg = tone === 'green' ? '#0e140c' : tone === 'warm' ? '#120c08' : '#08080c';
  rect(0, 0, W, H, bg);
  // 车顶、挡风玻璃外的光
  vgrad(0, 0, W, 50, [[0, '#050506'], [1, tone === 'green' ? '#1a2414' : '#1a140e']], 4);
  const shake = Math.round(Math.sin(lt * 23) * .8);
  const mx = 240, my = 136 + shake, mw = 360, mh = 88;
  rect(mx - 4, 0, 8, my - mh / 2, '#1a1a1e');
  // 镜框
  const r = 18;
  const frame = (pad, col) => { rect(mx - mw / 2 - pad + r, my - mh / 2 - pad, mw + pad * 2 - r * 2, mh + pad * 2, col); rect(mx - mw / 2 - pad, my - mh / 2 - pad + r, mw + pad * 2, mh + pad * 2 - r * 2, col); for (const [cx, cy] of [[mx - mw / 2 + r - pad * 0, my - mh / 2 + r], [mx + mw / 2 - r, my - mh / 2 + r], [mx - mw / 2 + r, my + mh / 2 - r], [mx + mw / 2 - r, my + mh / 2 - r]]) circ(cx, cy, r + pad, col); };
  frame(6, '#16161c'); frame(3, '#2a2a34');
  // 镜子里：大特写的脸
  const m = new Uint8Array(W * H); { const t0 = T; const tmp = { w: W, h: H, d: new Float32Array(W * H * 3), a: null }; T = tmp; frame(0, [255, 0, 0]); T = t0; for (let i = 0; i < W * H; i++) m[i] = tmp.d[i * 3] > 0 ? 1 : 0; }
  withMask(m, () => {
    rect(0, 0, W, H, tone === 'green' ? '#44583a' : tone === 'warm' ? '#7a4a2a' : '#2a2830');
    const s = o.lips ? 120 : 96;
    if (o.lips) bust(o.g, mx + 30, my - s * .55, s, { cloth: 'black', col: 'black', turn: .35, mouth: 'pout', amb: ['#3a3040', .35], ear: '#f0e0c0' });
    else bust(o.g, mx + (tone === 'warm' ? -10 : 0), my + 10 + s * .02, s, { cloth: 'blouse', col: 'white', turn: tone === 'warm' ? .3 : 0, look: [Math.sin(lt * 1.5) * .3, 0], eyes: lt % 2.2 > 2.05 ? 'closed' : 'open', amb: tone === 'green' ? ['#a8d890', .35] : ['#ffb070', .3] });
    // 镜面的光
    blend('screen'); const sx = (lt * 260) % 700 - 150; poly([sx, my - 60, sx + 30, my - 60, sx - 20, my + 60, sx - 50, my + 60], [255, 255, 255], .12); blend();
  });
  // 镜子下面的灯
  glow(mx, my + mh / 2 + 8, 10, tone === 'green' ? [150, 255, 120] : [255, 180, 120], .3);
  bloom(.9, 3, .9); vignette(.7);
}
function shSideMirror(lt, d) {
  vgrad(0, 0, W, H, [[0, '#7a0a14'], [1, '#2a0206']], 8);
  // 红色的车门
  poly([0, 170, W, 150, W, H, 0, H], '#5a0610'); line(0, 170, W, 150, '#c02a38');
  const k = 1 + lt * .04, cx = 200 + lt * 10, cy = 130;
  // 后视镜
  ell(cx, cy, 120 * k, 78 * k, '#14060a'); ell(cx - 2, cy - 2, 112 * k, 70 * k, '#2a0a10');
  ell(cx + 4, cy + 2, 100 * k, 60 * k, '#c01020'); ell(cx - 10, cy - 8, 86 * k, 48 * k, '#e02030');
  rect(cx + 90 * k, cy + 20, 70, 30, '#14060a');
  // 镜子里扫过的光
  const sx = (lt * 300) % 600 - 100; withMask(maskPoly((() => { const p = []; for (let i = 0; i < 24; i++) { const a = i / 24 * 6.28; p.push(cx + 4 + Math.cos(a) * 100 * k, cy + 2 + Math.sin(a) * 60 * k); } return p; })()), () => { blend('screen'); poly([sx, 0, sx + 40, 0, sx - 40, H, sx - 80, H], [255, 160, 160], .35); blend(); });
  glow(cx - 40, cy - 30, 30, [255, 120, 120], .4);
  bloom(1, 4, .85); vignette(.6);
}

// ================= 云海上的柱子 =================
function cloudSea(lt, y0, o) {
  o = o || {}; const cs = o.cols || ['#d88aa0', '#f4b4b8', '#ffd8cc', '#fff0e6'];
  const r = rng(o.seed || 181);
  for (let row = 0; row < 6; row++) { const y = y0 + row * row * 3.5 + row * 6, s = 8 + row * 6; for (let i = -1; i < W / (s * 1.6) + 2; i++) { const x = i * s * 1.6 + (row % 2) * s * .8 + (lt * (o.drift || 2) * (1 + row * .3)) % (s * 1.6); cloud(x, y, s * 2.4, s, cs, row * 31 + i + (o.seed || 0)); } }
}
function pillar(x, yTop, w, h, o) { // 古典柱子：柱头在 yTop
  o = o || {}; const c = C(o.col || '#e8c8b4'), d = shade(c, .72), l = lit(c, .35);
  rect(x - w * .7, yTop - 4, w * 1.4, 6, c); rect(x - w * .7, yTop - 4, w * 1.4, 1, l);
  rect(x - w * .62, yTop + 2, w * 1.24, 5, d); for (const sd of [-1, 1]) circ(x + sd * w * .55, yTop + 6, 3, c);
  rect(x - w / 2, yTop + 7, w, h, c); for (let i = 1; i < 5; i++) line(x - w / 2 + i * w / 5, yTop + 8, x - w / 2 + i * w / 5, yTop + h, d);
  rect(x - w / 2, yTop + 7, 2, h, l); rect(x + w / 2 - 3, yTop + 7, 3, h, d);
}
function shPillar(lt, d) {
  sky([[0, '#6a7ad0'], [.45, '#d8a0c0'], [.75, '#ffc0a0'], [1, '#ffe0b0']], 0, 200);
  const sun = [300, 186]; glow(sun[0], sun[1], 30, [255, 220, 160], .4); halo(sun[0], sun[1], 60, '#fff0c8', .25, 5); circ(sun[0], sun[1], 10, '#fff4d8');
  for (let i = 0; i < 5; i++) cloud(i * 110 + 40 - lt * 4, 60 + (i % 2) * 30, 100, 12, ['#b088c0', '#e8a8c0', '#ffd0d0', '#fff0ea'], 190 + i);
  cloudSea(lt, 186, { seed: 191 });
  pillar(150, 120, 22, 120);
  fig(3, 150, 122, 26, { view: 'front', pose: POSE.sit(), top: 'strap', col: 'blush', skirt: 'puffy', scol: 'blush', shoes: 'boots', bow: '#f4c0b0' });
  bloom(1, 4, .9); vignette(.4);
}
function pinkSkyBG(lt) {
  sky([[0, '#8aa0e8'], [.5, '#c8b0e8'], [1, '#f6c4d4']]);
  for (let i = 0; i < 6; i++) cloud(((i * 97 - lt * 6) % 560 + 560) % 560 - 40, 40 + (i % 3) * 70, 90, 12, ['#b8a0d8', '#e8c0e0', '#ffe0ec', '#fff6fa'], 200 + i);
}
function shPinkBust(lt, d, o) {
  pinkSkyBG(lt);
  bust(o.g, 240 + lt * 3, 104, 36, { cloth: 'off', col: 'pink', mouth: o.m, turn: o.turn || 0, look: [o.turn ? -.4 : 0, 0], ear: '#fff0c0', amb: ['#ffd0e0', .08], wind: .5, ph: lt * 2.5 });
  sparkles(201, 14, 0, 0, W, H, lt, { col: '#ffffff' });
  bloom(.9, 3, .92); vignette(.35);
}
function shPillarSit(lt, d) {
  sky([[0, '#7a8ad8'], [.6, '#e0a8c8'], [1, '#ffd0b0']]);
  for (let i = 0; i < 4; i++) cloud(i * 140 + 30 - lt * 6, 60 + (i % 2) * 40, 120, 16, ['#b088c0', '#e8a8c0', '#ffd0d0', '#fff0ea'], 210 + i);
  cloudSea(lt, 230, { seed: 211, drift: 4 });
  pillar(240, 196, 90, 80, {});
  fig(3, 240, 230, 120, { pose: Object.assign(POSE.sit(), { la: [.5, -.6], ra: [.5, -.6] }), top: 'strap', col: 'blush', skirt: 'puffy', scol: 'blush', shoes: 'boots', bow: '#f4b8a8', mouth: 'n', wind: .3, ph: lt * 2 });
  bloom(.9, 3, .92); vignette(.35);
}
function shPillarLow(lt, d) {
  sky([[0, '#5a70c8'], [.7, '#c8a0d8'], [1, '#ffd0c8']]);
  for (let i = 0; i < 4; i++) cloud(i * 150 - lt * 8, 40 + (i % 2) * 50, 140, 18, ['#9a88c8', '#d8a8d8', '#ffd8e0', '#fff4f6'], 220 + i);
  pillar(240, 210, 150, 80, {});
  fig(3, 240, 264, 190, { pose: Object.assign(POSE.sit(), { la: [.3, -1.2], ra: [.35, -1.3] }), top: 'strap', col: 'blush', skirt: 'puffy', scol: 'blush', shoes: 'boots', bow: '#f4b8a8', mouth: 'smile', turn: .15 });
  bloom(.9, 3, .92); vignette(.35);
}
function shArchWindow(lt, d) {
  sky([[0, '#6a6ac0'], [.6, '#d8a0c8'], [1, '#ffc8b8']]);
  for (let i = 0; i < 3; i++) cloud(60 + i * 60, 50 + i * 60, 90, 14, ['#b088c0', '#e8a8c0', '#ffd0d0', '#fff0ea'], 230 + i);
  const up = lt * 8, X = 300, Y = 170 + up;
  // 拱形的楼面
  rect(X - 140, Y - 140, 300, 400, '#c27a62'); ell(X + 10, Y - 140, 150, 110, '#c27a62');
  ell(X + 10, Y - 140, 130, 94, '#d48c72'); rect(X - 120, Y - 140, 260, 400, '#d48c72');
  ell(X + 10, Y - 140, 112, 80, '#c27a62'); rect(X - 102, Y - 140, 224, 400, '#c27a62');
  // 心形窗
  circ(X + 10, Y - 60, 62, '#8a4a3a'); circ(X + 10, Y - 60, 56, '#3a3a6a');
  for (let y = -56; y < 56; y++) for (let x = -56; x < 56; x++) { if (x * x + y * y > 56 * 56) continue; const tt = (y + 56) / 112; pp(Math.round(X + 10 + x), Math.round(Y - 60 + y), mixc([90, 100, 170], [200, 150, 190], tt)); }
  heart(X + 10, Y - 58, 40, '#8a4a3a'); heart(X + 10, Y - 58, 36, '#4a4a8a'); for (let y = -36; y < 40; y++) for (let x = -40; x < 40; x++) if (inHeart(x / 36, y / 36)) { const tt = (y + 36) / 76; pp(Math.round(X + 10 + x), Math.round(Y - 58 + y), mixc([120, 120, 200], [230, 170, 200], tt)); }
  line(X + 10, Y - 116, X + 10, Y - 4, '#8a4a3a', 1, 3); line(X - 46, Y - 60, X + 66, Y - 60, '#8a4a3a', 1, 3);
  // 两边的小拱窗
  for (const sx of [X - 110, X + 110]) { rect(sx, Y + 20, 26, 60, '#8a4a3a'); ell(sx + 13, Y + 20, 13, 13, '#8a4a3a'); }
  floatHearts(261, 8, lt, [0, 40, 200, 260], ['#ff8aa8', '#ff6a8e', '#ffb0c8']);
  const sw = (lt / d) * 520 - 60; blend('screen'); poly([sw, 0, sw + 26, 0, sw - 60, H, sw - 86, H], [255, 230, 210], .18); blend();
  bloom(.8, 3, .95); vignette(.4);
}

// ================= 毛绒心堆 =================
function shHeartCushion(lt, d) {
  sky([[0, '#6a6ad0'], [.5, '#d0a0d0'], [1, '#ffc8b0']]);
  const sun = [380, 150]; glow(sun[0], sun[1], 30, [255, 220, 170], .35); halo(sun[0], sun[1], 50, '#fff0c8', .2, 5); circ(sun[0], sun[1], 8, '#fff4dc');
  cloudSea(lt, 150, { seed: 241, drift: 3 });
  floatHearts(242, 10, lt, [0, 10, W, 140], ['#ff7aa0', '#ff5a80', '#ffa8c0']);
  // 后面的毛绒心
  for (const [x, y, s, c] of [[90, 200, 40, '#e85a7a'], [400, 190, 46, '#ff8aa8'], [330, 230, 34, '#d8405e'], [150, 236, 32, '#ff9ab4']]) plushHeart(x, y, s, c);
  bust(2, 240, 104, 30, { cloth: 'strap', col: 'pink', mouth: 'smile', turn: -.15, look: [-.2, 0], choker: '#ffffff', ear: true, amb: ['#ffc0a0', .1], rim: ['#ffe0c0', 1, 0, .7], wind: .4, ph: lt * 2 });
  // 前面的毛绒心挡住下半身
  for (const [x, y, s, c] of [[60, 270, 56, '#ff7a98'], [250, 280, 64, '#e84a6c'], [440, 268, 58, '#ff92ae']]) plushHeart(x + Math.sin(lt + x) * 2, y, s, c);
  bloom(1, 3, .9); vignette(.4);
}
function shHeartCushionBack(lt, d) {
  sky([[0, '#5a5ac8'], [.5, '#c898c8'], [1, '#ffc0a0']], 0, 170);
  glow(320, 160, 30, [255, 220, 170], .4); halo(320, 160, 50, '#fff0c8', .22, 5); circ(320, 160, 9, '#fff2d8');
  cloudSea(lt, 156, { seed: 251, drift: 3 });
  pillar(420, 120, 10, 40, {});
  floatHearts(252, 12, lt, [0, 10, W, 150], ['#ff7aa0', '#ff5a80', '#ffa8c0']);
  // 心堆
  for (const [x, y, s, c] of [[180, 230, 50, '#d8405e'], [300, 236, 54, '#e85a7a'], [240, 214, 46, '#ff7a98']]) plushHeart(x, y, s, c);
  fig(2, 240, 232, 66, { view: 'back', pose: POSE.sit(), top: 'strap', col: 'pink', skirt: 'mid', scol: 'pink', rim: ['#ffd0a0', 1, 0, .6] });
  for (const [x, y, s, c] of [[120, 262, 50, '#ff92ae'], [370, 264, 52, '#ff7a98'], [240, 276, 58, '#e84a6c']]) plushHeart(x, y, s, c);
  bloom(1, 3, .9); vignette(.4);
}
