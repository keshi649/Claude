// 《MOONRIDE》像素版：145 秒 ~ 结尾
'use strict';

// ================= 金色花园 =================
function gardenBG(lt, hz, o) {
  o = o || {};
  sky(o.sky || [[0, '#8ab0e8'], [.5, '#f6c8b0'], [1, '#ffe0b8']], 0, hz + 10);
  for (let i = 0; i < 4; i++) cloud(((i * 150 - lt * 4) % 640 + 640) % 640 - 80, 30 + (i % 2) * 30, 120, 16, ['#d8b0b0', '#f6d8d0', '#fff2ea', '#ffffff'], 700 + i);
  if (o.sun !== false) { const sx = o.sunX || 380; glow(sx, hz - 16, 26, [255, 230, 170], .3); halo(sx, hz - 16, 48, '#fff0c8', .2, 5); circ(sx, hz - 16, 7, '#fff4dc'); }
  // 远山
  hills(701, hz - 6, 16, .008, '#b8a0c8', { rim: '#d8c0e0' });
  // 树篱、球形灌木、心形灌木、远处的蘑菇
  for (let i = 0; i < 10; i++) { const x = i * 52 + 6 + (o.shift || 0), y = hz + 4; if (i % 4 === 0) { tri(x - 10, y, x, y - 34, x + 10, y, '#3e6a2e'); tri(x - 8, y, x - 2, y - 28, x + 3, y, '#5a8a3e'); } else if (i % 4 === 1) { circ(x, y - 12, 13, '#3e6a2e'); circ(x - 3, y - 15, 8, '#5a8a3e'); } else if (i % 4 === 2) { heart(x, y - 16, 14, '#3e6a2e'); heart(x - 2, y - 18, 9, '#5a8a3e'); } else mushroom(x, y, 12, { cap: '#ff8a6a', seed: i }); }
  vgrad(0, hz, W, H - hz, [[0, '#7aaa48'], [1, '#4e8030']], 5);
  // 花坛
  meadow(o.seed || 702, o.flowers || 140, 0, W, hz + 6, H, lt, { cols: ['#ff9ab8', '#ffffff', '#c8a0f0', '#ffb070', '#8a70e0'], h: 16, stem: '#3e6a2e' });
}
function fountainTiered(x, y, s, lt, o) { // (x,y) 池底中心
  o = o || {};
  ell(x, y, 50 * s, 12 * s, '#e8dccc'); ell(x, y - 2 * s, 46 * s, 10 * s, '#9ac8e0'); ell(x - 8 * s, y - 4 * s, 20 * s, 3 * s, '#c8e8f8');
  rect(x - 4 * s, y - 34 * s, 8 * s, 32 * s, '#f0e4d4'); ell(x, y - 34 * s, 22 * s, 6 * s, '#e8dccc'); ell(x, y - 35 * s, 19 * s, 4 * s, '#9ac8e0');
  rect(x - 2 * s, y - 52 * s, 4 * s, 18 * s, '#f0e4d4'); ell(x, y - 52 * s, 10 * s, 3 * s, '#e8dccc');
  // 水：从顶上喷出来，落进下面两层
  for (let k = 0; k < 40; k++) { const t = ((lt * 1.3 + k / 40) % 1), a = (k / 40) * Math.PI * 2; const r = 20 * s * t, h0 = 56 * s, hy = h0 - (t * 10 * s - t * t * 30 * s); px(x + Math.cos(a) * r, y - hy, '#ffffff', .85); }
  for (let k = 0; k < 30; k++) { const t = ((lt * 1.6 + k / 30) % 1), a = (k / 30) * Math.PI * 2; px(x + Math.cos(a) * (19 + t * 26) * s, y - 34 * s + t * t * 30 * s, '#e8f6ff', .8); }
  glow(x, y - 30 * s, 20 * s, [220, 240, 255], .12);
}
function shCarDoor(lt, d) {
  gardenBG(lt, 120, { seed: 711, sunX: 300 });
  // 远处的台阶、喷泉
  fountainTiered(320, 160, .6, lt);
  // 她跑过去和大家抱在一起
  const run = ramp(lt, .8, 3.0);
  const gx = lerp(240, 300, run), gy = lerp(250, 190, run), gh = lerp(150, 54, easeOut(run));
  for (let i = 0; i < 4; i++) fig([2, 4, 6, 3][i], 260 + i * 22, 186, 50, { view: 'back', top: ['strap', 'cami', 'puff', 'blouse'][i], col: ['white', 'lilac', 'white', 'white'][i], skirt: 'puffy', shoes: 'boots', pose: run > .9 ? { la: [2.0, .3], ra: [2.0, .3] } : POSE.stand() });
  fig(1, gx, gy, gh, { view: 'back', top: 'blouse', col: 'white', skirt: 'puffy', shoes: 'boots', pose: lt < .8 ? POSE.stand() : POSE.walk(lt * 10), wind: .8, ph: lt * 5 });
  // 车门框（车里往外看，暗）
  rect(0, 0, W, 34, '#0c0c12'); rect(0, 0, 70, H, '#0c0c12'); rect(410, 0, 70, H, '#0c0c12'); rect(0, 226, W, H, '#0c0c12');
  poly([70, 34, 120, 34, 70, 80], '#0c0c12'); poly([410, 34, 380, 34, 410, 70], '#0c0c12');
  rect(410, 40, 50, 180, '#16161e'); rect(420, 120, 30, 6, '#3a3a46');            // 打开的车门内侧
  rect(0, 200, 100, 30, '#1a1a24'); line(70, 34, 410, 34, '#2a2c38'); line(70, 34, 70, 226, '#2a2c38');
  bloom(.7, 3, .93); vignette(.5);
}
function shGeyser(lt, d, o) {
  if (!o.k) {
    gardenBG(lt, 170, { seed: 721, sun: true, sunX: 120 });
    // 白色的喷泉：一股冲天的水柱
    ell(240, 214, 70, 14, '#f0e8dc'); ell(240, 211, 64, 11, '#a8d0e8');
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; heart(240 + Math.cos(a) * 60, 216 + Math.sin(a) * 12, 7, '#f6eee4'); }
    const hgt = 170 + Math.sin(lt * 8) * 6;
    for (let y = 0; y < hgt; y++) { const w = 4 + (y / hgt) * 10 + Math.sin(y * .3 + lt * 20) * 2; rect(240 - w / 2, 210 - y, w, 1, y % 5 ? '#f6fbff' : '#d8ecff'); }
    for (let k = 0; k < 120; k++) { const t = ((lt * .9 + k / 120) % 1), a = (k / 120) * Math.PI * 2; const r = t * 70, yy = 210 - hgt + t * t * 160 - Math.sin(t * Math.PI) * 30; px(240 + Math.cos(a) * r, yy, '#ffffff', 1 - t); }
    glow(240, 60, 30, [255, 255, 255], .25);
  } else {
    sky([[0, '#5a88d8'], [.6, '#d8b8e0'], [1, '#ffd8c8']]);
    for (let i = 0; i < 3; i++) cloud(80 + i * 150, 60 + i * 20, 130, 18, ['#c8b0d0', '#f0d8e4', '#ffffff'], 730 + i);
    // 低角度：水雾往右上冲
    for (let k = 0; k < 90; k++) { const r = rng(731 + k); const t = ((lt * .7 + r()) % 1); const x = 120 + t * 300 + (r() - .5) * 90 * t, y = H - 30 - t * 230 - (r() - .5) * 90 * t, s = 4 + t * 18; circ(x, y, s, '#ffffff', (1 - t) * .55); }
    for (let k = 0; k < 500; k++) { const r = rng(1731 + k); const t = ((lt * .8 + r()) % 1); px(120 + t * 330 + (r() - .5) * 80 * t, H - 30 - t * 240 - (r() - .5) * 80 * t, '#ffffff', (1 - t)); }
    for (let i = 0; i < 6; i++) { const x = i * 80; rect(x, 210, 70, 60, ['#f6c8c0', '#bfe6d8', '#fbe4c8'][i % 3]); }
    for (let i = 0; i < 5; i++) { const x = 60 + i * 30; heart(x, 252, 12, '#f6eee4'); heart(x, 250, 9, '#ffffff'); }
  }
  bloom(.8, 3, .9); vignette(.35);
}
function shGroupGarden(lt, d) {
  gardenBG(lt, 130, { seed: 741, sunX: 420 });
  for (const [x, s, c] of [[40, 30, '#ff8a6a'], [440, 26, '#ffb0c8'], [110, 20, '#e8c070']]) mushroom(x, 160, s, { cap: c });
  // 八个人：后排四个、前排四个
  const back = [[3, 90, 104], [5, 190, 100], [6, 290, 102], [7, 390, 104]], front = [[2, 60, 150], [0, 180, 146], [4, 300, 148], [1, 420, 150]];
  const ex = (i) => Math.sin(lt * 6 + i) * 2;
  back.forEach(([g, x, y], i) => bust(g, x, y + ex(i), 22, { cloth: ['blouse', 'cami', 'strap', 'off'][i], col: ['white', 'lilac', 'pink', 'white'][i], mouth: 'grin', eyes: i % 2 ? 'happy' : 'open', look: [0, -.6], amb: ['#ffd090', .08], rim: ['#fff0c8', 1, 0, .5], bottom: 3 }));
  front.forEach(([g, x, y], i) => bust(g, x, y + ex(i + 4), 26, { cloth: ['off', 'blouse', 'cami', 'puff'][i], col: ['white', 'white', 'pink', 'lav'][i], mouth: i === 1 ? 'open' : 'smile', eyes: 'open', look: [0, -.5], amb: ['#ffd090', .08], rim: ['#fff0c8', -1, 0, .5],
    after: i === 2 ? (L, ox, oy, s) => { thick(ox + 1.3 * s, oy + 2.6 * s, ox + 1.9 * s, oy - 1.2 * s, .35 * s, SKIN.b); thick(ox + 1.9 * s, oy - 1.2 * s, ox + 2.0 * s, oy - 2.0 * s, .15 * s, SKIN.b); } : i === 1 ? (L, ox, oy, s) => { for (const sd of [-1, 1]) ell(ox + sd * .35 * s, oy + .8 * s, .38 * s, .42 * s, SKIN.b); } : null }));
  petals(742, 24, lt, ['#ffffff', '#ffd8e8', '#ffe8a0']);
  bloom(.7, 3, .93); vignette(.35);
}
function shHeartHole(lt, d) {
  rect(0, 0, W, H, '#0e1a0c');
  for (let i = 0; i < 900; i++) { const r = rng(751 + i); const x = r() * W, y = r() * H; px(x, y, r() < .5 ? '#1e3a18' : '#2a4a22'); }
  const s = 64 + lt * 40;
  withMask((() => { const m = new Uint8Array(W * H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (inHeart((x + .5 - 240) / s, (y + .5 - 135) / s)) m[y * W + x] = 1; return m; })(), () => { sky([[0, '#6ab0f0'], [1, '#d8ecff']]); cloud(240, 130, 160, 20, ['#d8e8f8', '#f4f8ff', '#ffffff'], 752); });
  // 洞边一圈亮的叶子
  for (let i = 0; i < 80; i++) { const p = HPATH[Math.floor(i / 80 * (HPATH.length - 1))]; const x = 240 + (p[0] - .5) * s * 2.05, y = 135 + (p[1] - .5) * s * 1.85 - s * .05; circ(x, y, 4, '#4a8a3a'); px(x - 1, y - 1, '#8acc6a'); }
  // 两只毛绒小马的剪影（近处，糊）
  pony(90, 300, 6, { dir: 1, amb: ['#1a2a14', .8] }); pony(400, 310, 6.5, { dir: -1, amb: ['#1a2a14', .8] });
  bloom(.8, 3, .9); vignette(.6);
}
function shPonyHedge(lt, d) {
  gardenBG(lt, 150, { seed: 761, sunX: 240 });
  heart(240, 200, 120, '#2e5a24'); heart(238, 196, 112, '#3e6a2e'); for (let i = 0; i < 200; i++) { const r = rng(762 + i); const x = 240 + (r() - .5) * 220, y = 150 + r() * 130; if (inHeart((x - 240) / 112, (y - 196) / 112)) px(x, y, r() < .5 ? '#5a8a3e' : '#2e5a24'); }
  const ps = [[120, 1], [180, -1], [240, 1], [300, -1], [360, 1]];
  ps.forEach(([x, dir], i) => pony(x, 126 + Math.abs(x - 240) * .25 - Math.abs(Math.sin(lt * 6 + i)) * 3, 1.6, { dir, t: lt + i }));
  bloom(.7, 3, .93); vignette(.35);
}
function shSurprise(lt, d, o) {
  bokehGarden(lt, { seed: 771, heart: [400, 110, 60] });
  bust(o.g, 250, 104, 36, { cloth: 'blouse', col: 'white', eyes: 'open', mouth: 'o', brow: -.08, look: [.2, -.2], ear: '#ffe8c0', amb: ['#ffd090', .1], rim: ['#fff0c8', 1, 0, .6], wind: .3, ph: lt * 2,
    after: (L, ox, oy, s) => { for (const sd of [-1, 1]) { thick(ox + sd * 1.4 * s, oy + 3.4 * s, ox + sd * .8 * s, oy + 2.0 * s, .5 * s, '#ecebf4'); thick(ox + sd * .8 * s, oy + 2.0 * s, ox + sd * .45 * s, oy + 1.1 * s, .36 * s, SKIN.b); ell(ox + sd * .28 * s, oy + .78 * s, .38 * s, .45 * s, SKIN.b); for (let f = 0; f < 3; f++) line(ox + sd * (.1 + f * .12) * s, oy + .5 * s, ox + sd * (.12 + f * .12) * s, oy + .95 * s, SKIN.s); } rect(ox - .4 * s, oy + .55 * s, .8 * s, 1, '#fff4f8'); } });
  bloom(.7, 3, .93); vignette(.35);
}
function shLookUp(lt, d, o) {
  bokehGarden(lt, { seed: 781, sky: [[0, '#a8c8f0'], [.6, '#f4dcc8'], [1, '#e8d8b0']] });
  bust(o.g, 240, 110 - lt * 3, 38, { cloth: 'puff', col: 'white', mouth: 'smile', look: [-.2, -1], turn: -.1, amb: ['#ffd090', .1], rim: ['#fff0c8', 1, 0, .7], wind: .5, ph: lt * 2.5 });
  petals(782, 18, lt, ['#ffffff', '#ffd8e8']);
  bloom(.7, 3, .93); vignette(.35);
}
function shPonyStatue(lt, d) {
  gardenBG(lt, 160, { seed: 791, sunX: 400 });
  // 白色的小马雕像（大）
  rect(150, 200, 120, 60, '#e8e0d4'); rect(150, 200, 120, 6, '#fffaf0');
  pony(210, 202, 4, { dir: 1, col: '#f4f0ea', mane: '#ece4dc', amb: ['#e8e0d8', .55] });
  pony(380 + lt * 30, 150 - Math.sin(lt * 4) * 30, 2.2, { dir: -1, run: lt * 12, t: lt });
  bloom(.7, 3, .93); vignette(.35);
}
function shGardenPath(lt, d) {
  // 俯一点看：草地、踏脚石小路、亭子
  vgrad(0, 0, W, H, [[0, '#6a9a40'], [1, '#86b450']], 5);
  for (let i = 0; i < 14; i++) { const t = i / 13; const x = 60 + t * 360 + Math.sin(t * 6) * 40, y = 240 - t * 200; ell(x, y, 12 - t * 5, 6 - t * 2, '#e8dcc8'); ell(x - 1, y - 1, 10 - t * 5, 4 - t * 2, '#f6eee0'); }
  rect(320, 30, 40, 30, '#f4ece0'); tri(316, 30, 340, 12, 364, 30, '#e8d8c8'); for (const x of [324, 352]) rect(x, 40, 4, 20, '#e8dcd0');
  for (const [x, y] of [[100, 60], [420, 120], [60, 180], [200, 100]]) { heart(x, y, 14, '#3e6a2e'); heart(x - 2, y - 2, 10, '#5a8a3e'); }
  meadow(801, 160, 0, W, 0, H, lt, { cols: ['#c8a0f0', '#ff9ab8', '#ffffff', '#ffb070'], h: 8, stem: '#3e6a2e' });
  const t = lt / d; pony(80 + t * 300, 230 - t * 120, 1.1, { dir: 1, run: lt * 14, t: lt });
  bloom(.6, 3, .95); vignette(.35);
}
function shPonyRun(lt, d) {
  gardenBG(lt, 150, { seed: 811, sunX: 120, sky: [[0, '#7a90d8'], [.5, '#f0b8b0'], [1, '#ffd8a8']] });
  for (let i = 0; i < 6; i++) pony(-60 + i * 70 + lt * 60, 224 - Math.abs(Math.sin(lt * 9 + i)) * 5, 1.5, { dir: 1, run: lt * 15 + i, t: lt + i });
  meadow(812, 50, 0, W, 236, H + 6, lt, { cols: ['#ffffff', '#ff9ab8', '#ffd870'], h: 26, stem: '#3e6a2e' });
  bloom(.7, 3, .93); vignette(.35);
}
function shPonyMush(lt, d) {
  sky([[0, '#7aa0e0'], [.6, '#f6c0b0'], [1, '#ffe0c0']]);
  hills(821, 210, 14, .01, '#8ab060');
  mushroom(240, 290, 140, { cap: '#d8283a' });
  pony(230, 158, 2.6, { dir: 1, t: lt });
  bloom(.7, 3, .93); vignette(.35);
}
function shFountainBust(lt, d, o) {
  bokehGarden(lt, { seed: 831 + o.g });
  fountainTiered(o.g === 4 ? 240 : 360, 206, 1.4, lt);
  heartRail(236, 18, 7, 20, 74);
  bust(o.g, o.g === 4 ? 240 : 170, 108, 36, { cloth: o.g === 4 ? 'blouse' : 'puff', col: 'white', mouth: o.smile ? 'grin' : 'smile', eyes: o.smile ? 'happy' : 'open', turn: o.g === 4 ? 0 : .2, ear: true, amb: ['#ffd090', .1], rim: ['#fff0c8', -1, 0, .6], wind: .3, ph: lt * 2 });
  bloom(.7, 3, .93); vignette(.35);
}
function shMushBust(lt, d, o) {
  bokehGarden(lt, { seed: 841 + o.g, sky: [[0, '#f6c8d8'], [.6, '#fbe0d8'], [1, '#f0d8c0']] });
  for (const [x, s, c] of [[50, 60, '#ffb0c8'], [430, 70, '#d8283a'], [350, 34, '#e8c070'], [130, 30, '#ff8a6a']]) mushroom(x, 250, s, { cap: c, seed: x });
  bust(o.g, 240, 110, 36, { cloth: 'strap', col: 'pink', mouth: o.g === 2 ? 'smile' : 'pout', choker: o.g === 2 ? '#ffffff' : null, turn: o.g === 2 ? .1 : -.15, ear: true, amb: ['#ffd090', .1], rim: ['#fff0c8', 1, 0, .6],
    after: o.g === 5 ? (L, ox, oy, s) => { thick(ox + 1.4 * s, oy + 3.4 * s, ox + 2.2 * s, oy + .3 * s, .38 * s, SKIN.b); ell(ox + 2.2 * s, oy, .42 * s, .5 * s, SKIN.b); } : null });
  bloom(.7, 3, .93); vignette(.35);
}
function shPonyLeap(lt, d) {
  gardenBG(lt, 170, { seed: 851, sunX: 100 });
  mushroom(250, 268, 90, { cap: '#d8283a', seed: 3 });
  const t = sat(lt / d), x = 80 + t * 340, jump = Math.sin(t * Math.PI) * 150;
  pony(x, 236, 2.4, { dir: 1, run: lt * 6, jump, t: lt });
  sparkles(852, 16, x - 40, 100, x + 40, 240, lt, { col: '#ffffff' });
  bloom(.7, 3, .93); vignette(.35);
}
function shPonySky(lt, d, o) {
  if (o.top) {
    vgrad(0, 0, W, H, [[0, '#86b450'], [1, '#6a9a40']], 5);
    for (let i = 0; i < 30; i++) { const r = rng(861 + i); heart(r() * W, r() * H, 6 + r() * 8, '#3e6a2e'); }
    meadow(862, 200, 0, W, 0, H, lt, { cols: ['#c8a0f0', '#ff9ab8', '#ffffff'], h: 6, stem: '#3e6a2e' });
    for (let i = 0; i < 4; i++) { const r = rng(863 + i); const x = (r() * W + lt * 60) % (W + 80) - 40, y = 40 + r() * 180; ell(x + 20, y + 26, 18, 6, '#2e4a22', .4); pony(x, y, 1.4, { dir: 1, run: lt * 10 + i, t: lt + i }); }
    for (let i = 0; i < 3; i++) cloud(((i * 170 - lt * 50) % 600 + 600) % 600 - 60, 60 + i * 70, 120, 18, ['#e8e8f0', '#f8f8ff', '#ffffff'], 864 + i, { a: .7 });
  } else {
    sky([[0, '#e8a8a0'], [.5, '#ffc8a8'], [1, '#ffe8c8']]);
    cloudSea(lt * 4, 200, { seed: 871 });
    for (let i = 0; i < 3; i++) cloud(((i * 180 - lt * 40) % 640 + 640) % 640 - 80, 70 + i * 40, 140, 22, ['#e0b0b0', '#f8d0c8', '#fff0ea', '#ffffff'], 872 + i);
    pony(160 + lt * 40, 140 + Math.sin(lt * 3) * 6, 2.4, { dir: 1, run: lt * 8, t: lt });
    pony(300 + lt * 50, 110 + Math.sin(lt * 3 + 1) * 6, 1.8, { dir: 1, run: lt * 8 + 1, t: lt });
  }
  bloom(.7, 3, .93); vignette(.3);
}
function shFountainDance(lt, d) {
  gardenBG(lt, 130, { seed: 881, sunX: 60 });
  fountainTiered(240, 200, 1.0, lt);
  const gs = [[0, 120, 238], [2, 190, 222], [5, 300, 222], [6, 370, 238]];
  gs.forEach(([g, x, y], i) => fig(g, x, y, 92, { top: ['blouse', 'cami', 'cami', 'strap'][i], col: ['white', 'lav', 'white', 'pink'][i], skirt: i === 1 ? 'gown' : 'puffy', scol: ['white', 'lav', 'white', 'pink'][i], shoes: 'boots', pose: POSE.dance(lt + 164.25, i * 2), mouth: 'smile', amb: ['#ffd090', .08], rim: ['#fff0c8', -1, 0, .5] }));
  bloom(.7, 3, .93); vignette(.35);
}
function shFountain(lt, d) {
  gardenBG(lt, 120, { seed: 891, sunX: 380 });
  fountainTiered(240, 230, 2.0, lt);
  for (const [x, dir] of [[170, 1], [320, -1]]) { const by = 222 - Math.abs(Math.sin(lt * 7 + x)) * 8; pony(x, by, 1.4, { dir, t: lt }); }
  for (let k = 0; k < 40; k++) { const r = rng(892 + k); const t = (lt * 1.5 + r()) % 1; px(170 + (r() - .5) * 40, 220 - Math.sin(t * Math.PI) * 30, '#ffffff', 1 - t); }
  bloom(.7, 3, .93); vignette(.35);
}
function shPonySplash(lt, d) {
  rect(0, 0, W, H, '#f0c8a0'); gardenBG(lt, 90, { seed: 901, sunX: 300 });
  // 池子
  ell(240, 300, 300, 120, '#e8dccc'); ell(240, 300, 290, 110, '#8ac0d8');
  for (let y = 190; y < H; y += 5) line(0, y + Math.sin(lt * 4 + y) * 2, W, y + Math.cos(lt * 4 + y) * 2, '#b8e0f0', .6);
  for (const [x, dir, ph] of [[170, 1, 0], [330, -1, 1.5]]) {
    const bob = Math.sin(lt * 5 + ph) * 4;
    pony(x, 240 + bob, 4.2, { dir, t: lt + ph });
    for (let k = 0; k < 24; k++) { const r = rng(902 + k + x); const t = (lt * 2 + r()) % 1; px(x + (r() - .5) * 90, 230 - Math.sin(t * Math.PI) * 40 * r(), '#ffffff', 1 - t); }
    rect(x - 70, 238 + bob, 140, 30, '#8ac0d8', .6);
  }
  bloom(.7, 3, .93); vignette(.35);
}
function shPonyBack(lt, d) {
  gardenBG(lt, 150, { seed: 911, sunX: 240 });
  heart(380, 120, 44, '#3e6a2e'); heart(376, 116, 36, '#5a8a3e');
  for (const [x, y, dir, k] of [[140, 250, -1, 3.2], [260, 236, 1, 2.6], [360, 260, -1, 3.6]]) pony(x, y, k, { dir, t: lt + x });
  bloom(.7, 3, .93); vignette(.35);
}
function shHeartHedges(lt, d) {
  gardenBG(lt, 140, { seed: 921, sunX: 420 });
  for (const [x, y, s] of [[150, 200, 70], [350, 214, 54]]) { heart(x, y, s, '#2e5a24'); heart(x - 3, y - 3, s - 6, '#3e6a2e'); for (let i = 0; i < 60; i++) { const r = rng(x + i); const xx = x + (r() - .5) * s * 1.8, yy = y + (r() - .5) * s * 1.6; if (inHeart((xx - x) / (s - 6), (yy - y) / (s - 6))) px(xx, yy, '#5a8a3e'); }
    for (const hx of [-.35, .3]) { circ(x + hx * s, y - s * .1, s * .16, '#1a2a14'); const peek = Math.sin(lt * 4 + hx * 5) > 0; if (peek) { ell(x + hx * s, y - s * .05, s * .12, s * .1, '#fbf6f4'); px(x + hx * s - 2, y - s * .1, '#2a1a2a'); px(x + hx * s + 2, y - s * .1, '#2a1a2a'); ell(x + hx * s, y - s * .22, s * .1, s * .06, '#f49ab8'); } } }
  pony(260, 250, 1.6, { dir: -1, t: lt }); pony(300, 256, 1.4, { dir: 1, t: lt + 1 });
  bloom(.7, 3, .93); vignette(.35);
}
function shParade(lt, d) {
  gardenBG(lt, 120, { seed: 931, sunX: 240, sky: [[0, '#8a80d0'], [.5, '#f0a8b0'], [1, '#ffd0a0']] });
  // 一排排小马朝镜头走过来（远小近大）
  for (let row = 4; row >= 0; row--) { const k = .6 + row * .45, y = 150 + row * 26 + lt * 6; for (let i = 0; i < 6 - Math.floor(row / 2); i++) { const x = 240 + (i - (5 - Math.floor(row / 2)) / 2) * (40 + row * 22); pony(x, y - Math.abs(Math.sin(lt * 8 + i + row)) * 2, k, { dir: (i + row) % 2 ? 1 : -1, run: lt * 8 + i, t: lt + i }); } }
  bloom(.7, 3, .93); vignette(.35);
}
function shHeartStatue(lt, d) {
  rect(0, 0, W, H, '#8a9aa8');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const rr = Math.hypot(x - 240, (y - 135) * 1.05); let c = null; if (rr < 120) c = Math.floor(rr / 12) % 2 ? [150, 170, 190] : [140, 160, 182]; if (rr < 100) c = [120, 150, 180]; if (rr > 118 && rr < 128) c = [210, 200, 190]; if (c) pp(x, y, c); }
  for (let i = 0; i < 8; i++) { const a = i / 8 * Math.PI * 2; rect(240 + Math.cos(a) * 124 - 6, 135 + Math.sin(a) * 118 - 6, 12, 12, '#d8ccbc'); }
  const s = 64 + lt * 8; heart(240, 132, s + 4, '#c88870'); heart(238, 130, s, '#f2b49a'); heart(224, 112, s * .35, '#ffd8c4');
  ell(240, 186, s * .7, 8, '#6a7a8a', .5);
  bloom(.6, 3, .95); vignette(.4);
}

// ================= THE END：花园迷宫 =================
function mazeGarden(lt, zoom, o) {
  o = o || {}; const cx = 240, cy = 140, z = zoom;
  rect(0, 0, W, H, '#3e5a2a');
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x - cx) / z, dy = (y - cy) / z, rr = Math.hypot(dx, dy), a = Math.atan2(dy, dx);
    let c = null;
    if (rr < 30) c = rr < 18 ? [150, 170, 190] : [226, 210, 196];
    else if ((rr % 52) < 8) c = [232, 214, 198];
    else if (Math.abs(((a / (Math.PI * 2) * 8) % 1 + 1) % 1 - .5) * rr * Math.PI * 2 / 8 < 5) c = [232, 214, 198];
    if (!c) { const hh = h2(Math.floor(x / 3), Math.floor(y / 3), 9); c = hh > .8 ? [74, 110, 50] : hh < .15 ? [40, 66, 30] : [58, 90, 40]; if (h2(x, y, 3) > .97) c = ['#ff9ab8', '#ffffff', '#ffb070'].map(C)[Math.floor(h2(x, y, 4) * 3)]; }
    pp(x, y, c);
  }
  // 圆形的小树
  for (let i = 0; i < 26; i++) { const r = rng(941 + i); const a = r() * 6.28, rr = (60 + r() * 140) * z; const x = cx + Math.cos(a) * rr, y = cy + Math.sin(a) * rr; circ(x, y, 6 * z, '#e8906a'); circ(x - 1, y - 1, 4 * z, '#ffb88a'); }
  // 中间的喷泉
  circ(cx, cy, 14 * z, '#b8d0e8'); ring(cx, cy, 14 * z, 2, '#ffffff'); heart(cx, cy, 6 * z, '#f2b49a');
  // 三辆车（顶视）
  const cars = [[-40, 30, '#ff9ab8'], [40, 34, '#e8e8f0'], [0, 58, '#ffd84a']];
  cars.forEach(([dx, dy, hc], i) => { const x = cx + dx * z, y = cy + dy * z; rect(x - 6 * z, y - 10 * z, 12 * z, 20 * z, '#111216'); rect(x - 5 * z, y - 6 * z, 10 * z, 6 * z, '#2a3448'); o.cars && o.cars(i, x, y, hc); });
}
function shTheEnd(lt, d) {
  const z = 1.25 - lt * .03;
  mazeGarden(lt, z, { cars: (i, x, y, hc) => { const up = ramp(lt, 2.8 + i * .3, d); if (up <= 0) foilHeart(x, y - 2, 5 * z, hc, { string: false }); else { const yy = y - 2 - easeIn(up) * 200, s = 5 * z + up * 6; foilHeart(x + Math.sin(lt * 2 + i) * 4 * up, yy, s, hc, { string: false, glow: .2 }); } } });
  // THE END：大字，2.3 秒后淡掉
  const a = 1 - smooth(ramp(lt, 2.1, 2.6));
  if (a > 0) { rect(0, 92, W, 84, '#2a1e14', a * .35); for (const dx of [0, 3]) text('THE END', 240 + dx, 104, '#4a3628', { al: 'c', sc: 6, a, sp: 1, ol: '#4a3628', olw: 3 }); for (const dx of [0, 3]) text('THE END', 240 + dx, 104, '#fffaf2', { al: 'c', sc: 6, a, sp: 1 }); onGlow(() => text('THE END', 241, 104, [255, 236, 210], { al: 'c', sc: 6, a: a * .5, sp: 1 })); }
  bloom(.8, 4, .9); vignette(.45);
}
function shBalloonsPalace(lt, d) {
  sky([[0, '#e0a8a0'], [1, '#ffd8b8']]);
  // 宫殿
  const y0 = 300 - lt * 40;
  rect(60, y0 - 120, 360, 200, '#f0e0cc'); for (let i = 0; i < 10; i++) { rect(76 + i * 34, y0 - 96, 14, 50, '#c8a888'); ell(83 + i * 34, y0 - 96, 7, 6, '#c8a888'); }
  for (const [x, r] of [[240, 50], [110, 34], [370, 34]]) { ell(x, y0 - 120, r, r * .8, '#e8d8c0'); ell(x - r * .2, y0 - 128, r * .5, r * .4, '#fff4e0'); rect(x - 2, y0 - 120 - r * .8 - 12, 4, 12, '#e8c8a0'); }
  rect(200, y0 - 40, 80, 60, '#c8a888'); ell(240, y0 - 40, 40, 30, '#c8a888');
  for (const [x, c, ph] of [[160, '#ffd84a', 0], [240, '#ff9ab8', 1], [320, '#e0e0ec', 2]]) foilHeart(x + Math.sin(lt * 2 + ph) * 5, 120 - lt * 30 + ph * 10, 22, c, { string: false, glow: .2 });
  bloom(.7, 3, .93); vignette(.35);
}
function shBalloonsSky(lt, d) {
  vgrad(0, 0, W, H, [[0, '#f8e4d8'], [1, '#fff4ec']], 6);
  for (let i = 0; i < 4; i++) cloud(i * 140 + 20, 200 + (i % 2) * 20, 140, 20, ['#f0dcd0', '#fbece4', '#ffffff'], 950 + i, { a: .7 });
  const k = 1 - lt / d * .7;
  for (const [x, c, ph] of [[180, '#ffd84a', 0], [240, '#ff9ab8', 1], [300, '#e0e0ec', 2]]) foilHeart(240 + (x - 240) * k + Math.sin(lt * 2 + ph) * 3, 140 - lt * 26 + ph * 4, 20 * k, c, { string: false });
  const fw = ramp(lt, d - 1.2, d - .2); if (fw > 0) flash('#fffaf6', smooth(fw));
}

// ================= 粉色沙丘 =================
function dunes(lt, hz, o) {
  o = o || {};
  for (let k = 0; k < 4; k++) { const base = hz + k * 22, c = mixc(o.far || '#c87a78', o.near || '#e8a49a', k / 3); for (let x = 0; x < W; x++) { const y = base - 12 * Math.sin(x * .012 + k * 1.7) - 6 * Math.sin(x * .031 + k); for (let yy = Math.floor(y); yy < (k === 3 ? H : base + 40); yy++) pp(x, yy, yy - y < 2 ? lit(c, .15) : c); } }
}
function shDesert(lt, d) {
  sky([[0, '#1a1a2a'], [1, '#4a3a4a']], 0, 120);
  dunes(lt, 50, {});
  // 白色的弯路
  for (let i = 0; i < 70; i++) { const t = i / 70, t2 = (i + 1) / 70; const p = s => [160 + Math.sin(s * 6) * 90 + s * 160, H + 10 - s * 230]; const [x0, y0] = p(t), [x1, y1] = p(t2); thick(x0, y0, x1, y1, 9 - t * 7, '#f4f0ec'); }
  const t = .25 + lt / d * .1, x = 160 + Math.sin(t * 6) * 90 + t * 160, y = H + 10 - t * 230;
  ell(x, y, 6, 4, '#0e0e12'); rect(x - 3, y - 4, 6, 3, '#2a2c36');
  bloom(.5, 3, .95); vignette(.5);
}
function darkDuneBG(lt) {
  sky([[0, '#05060e'], [1, '#141428']]);
  stars(961, 80, 0, 0, W, 160, lt, { a: .8 });
  dunes(lt, 190, { far: '#7a3e48', near: '#b05a5a' });
}
function shFace(lt, d, o) {
  // 大特写：脸占满画面
  if (o.car) { rect(0, 0, W, H, '#07070c'); rect(0, 0, 120, H, '#0c0c14'); }
  else darkDuneBG(lt);
  const s = o.side ? 62 : 70;
  const push = lt * 6;
  if (o.side) profBust(o.g, 220 - push, 120, s, { dir: 1, cloth: 'black', col: 'black', amb: ['#a06070', .12], rim: ['#ffb0b0', 1, 0, .5], ear: '#f0e0c0' });
  else bust(o.g, 240, 150 + push * .2, s + push * .3, { cloth: 'black', col: 'black', mouth: o.g === 0 ? 'pout' : 'n', look: [0, 0], eyes: lt > d - .3 && lt < d - .2 ? 'closed' : 'open', ear: '#f0e0c0', amb: [o.car ? '#4a4a70' : '#a06070', .14], rim: ['#ffc0c0', -1, 0, .45], wind: .2, ph: lt * 2 });
  bloom(.6, 3, .92); vignette(.6);
}
function shDuneBust(lt, d, o) {
  darkDuneBG(lt);
  bust(o.g, 240, 104, 36, { cloth: 'black', col: 'black', mouth: 'n', look: [.1, 0], ear: '#f0e0c0', amb: ['#8a6070', .12], rim: ['#ffb0b0', 1, 0, .5], wind: .3, ph: lt * 2 });
  bloom(.6, 3, .92); vignette(.55);
}
function shDuneGirl(lt, d, o) {
  darkDuneBG(lt);
  bust(o.g, 250, 112, 30, { cloth: 'black', col: 'black', mouth: 'smile', turn: -.2, look: [-.3, 0], ear: '#f0e0c0', amb: ['#8a6070', .12], rim: ['#ffb0b0', 1, 0, .5],
    after: (L, ox, oy, s) => { thick(ox - 1.3 * s, oy + 3.2 * s, ox - .55 * s, oy + .9 * s, .35 * s, SKIN.b); ell(ox - .5 * s, oy + .75 * s, .35 * s, .4 * s, SKIN.b); } });
  bloom(.6, 3, .92); vignette(.55);
}
function shCarDark(lt, d, o) {
  rect(0, 0, W, H, '#06060a');
  // 后座、车窗外的沙丘
  withMask(maskPoly([300, 40, 470, 30, 470, 150, 300, 160]), () => { sky([[0, '#05060e'], [1, '#141428']]); dunes(lt, 110, { far: '#5a2e38', near: '#8a4a4a' }); });
  rect(120, 120, 160, 150, '#121218'); ell(160, 110, 40, 26, '#16161e');
  bust(o.g, 220, 118, 32, { cloth: 'black', col: 'black', mouth: 'n', turn: .3, look: [.4, 0], amb: ['#5a5a80', .22], rim: ['#c0b0ff', 1, 0, .5], ear: '#f0e0c0' });
  bloom(.6, 3, .92); vignette(.6);
}
function shDuneFade(lt, d) {
  sky([[0, '#05060e'], [1, '#1a1626']], 0, 120);
  dunes(lt, 110, { far: '#6a3a44', near: '#a05858' });
  vgrad(0, 170, W, H - 170, [[0, '#a8a0a4'], [1, '#5a5458']], 6);
  flash('#000000', ramp(lt, 0, d));
}
// 片尾：甜菜 出品（原版这里是公司的标志）
function shEndCard(lt, d) {
  rect(0, 0, W, H, '#000000');
  const a = smooth(ramp(lt, .1, .6));
  text('甜菜 出品', 240, 96, '#ffffff', { al: 'c', sc: 3, a });
  const b = smooth(ramp(lt, .5, 1.0));
  text('歌曲：Hearts2Hearts《MOONRIDE》', 240, 158, '#d8d0e0', { al: 'c', a: b });
  text('照原版 MV 逐镜重画 · 像素画面：Claude 用代码生成', 240, 178, '#a8a0b0', { al: 'c', a: b });
  heart(240, 222, 5, [255, 120, 160], a);
  onGlow(() => heart(240, 222, 7, [255, 80, 140], a * .6));
  bloom(.6, 3, .95);
}

// ================= 封面（单独构图：抖音主页按中间裁成 3:4，片名两行放在横向正中） =================
function neonWord(word, cx, y, h, lt) {
  const gap = .28; let tw = 0; for (const ch of word) tw += NEON_W[ch] + gap; tw = (tw - gap) * h;
  let x = cx - tw / 2; const core = [255, 244, 250], tube = [255, 170, 205];
  for (const ch of word) {
    const w = NEON_W[ch] * h, paths = ch === 'O' ? [HPATH] : NEON[ch];
    for (const pth of paths) for (let i = 0; i + 1 < pth.length; i++) {
      const [ax, ay] = pth[i], [bx, by] = pth[i + 1]; const X0 = x + ax * w, Y0 = y + ay * h, X1 = x + bx * w, Y1 = y + by * h;
      line(X0, Y0, X1, Y1, [60, 10, 40], 1, 5); line(X0, Y0, X1, Y1, tube, 1, 3); line(X0, Y0, X1, Y1, core, 1, 1);
      onGlow(() => line(X0, Y0, X1, Y1, [255, 90, 150], .9, 5));
    }
    x += w + gap * h;
  }
}
function shCover(lt) {
  sky([[0, '#060a22'], [.6, '#1a2458'], [1, '#3a3a7a']]);
  stars(991, 120, 0, 0, W, 200, lt, { big: .12 });
  moon(240, 74, 44, { halo: '#9fb4ff', ha: .25, ga: .3, col: '#e8e4f0' });
  // 两边的楼，亮着窗
  for (const sd of [-1, 1]) for (let i = 0; i < 5; i++) { const w = 34 + (i % 2) * 10, h = 70 + ((i * 37) % 50), x = sd < 0 ? i * 40 - 10 : W - i * 40 - w + 10; rect(x, H - h, w, h, '#141a36'); for (let yy = H - h + 6; yy < H - 4; yy += 9) for (let xx = x + 4; xx < x + w - 4; xx += 8) if (h2(xx, yy, 3) > .45) { rect(xx, yy, 4, 5, '#ffcf8a'); rect(xx, yy, 4, 1, '#ffe6b8'); } }
  floatHearts(992, 6, 1.3, [10, 110, 120, 220], ['#ff8aa8', '#c070f0', '#ffd84a', '#8ac8ff']); floatHearts(994, 6, 1.3, [360, 110, 470, 220], ['#8ac8ff', '#ffd84a', '#ff8aa8', '#c070f0']);
  neonWord('MOON', 240, 26, 42, lt); neonWord('RIDE', 240, 82, 42, lt);
  text('像素版 MV', 240, 136, '#ffffff', { al: 'c', sc: 1, sh: '#2a1440', sp: 1 });
  // 三个人
  bust(0, 178, 214, 22, { cloth: 'blouse', col: 'white', mouth: 'smile', turn: .2, amb: ['#7080c0', .18], rim: ['#ffc0e0', -1, 0, .5] });
  bust(1, 302, 214, 22, { cloth: 'off', col: 'pink', mouth: 'smile', turn: -.2, amb: ['#7080c0', .18], rim: ['#ffc0e0', 1, 0, .5] });
  bust(2, 240, 226, 25, { cloth: 'strap', col: 'white', choker: '#ffffff', mouth: 'grin', eyes: 'happy', amb: ['#7080c0', .15], rim: ['#ffd0e8', 1, 0, .5] });
  sparkles(993, 24, 60, 10, 420, 150, lt, { col: '#fff0f8' });
  bloom(1, 3, .92); vignette(.45);
}
