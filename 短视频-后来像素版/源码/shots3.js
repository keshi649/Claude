'use strict';
/* shots3.js —— 主歌一：十七岁的夏天（栀子花、校园、长椅、他说爱你、花戴在她头上、闻花香、日落延时、山顶星空、月亮前的吻）；
   现在：楼顶叹气 → 那天的星光回来。 */
const SKY_DAY = [[0, '#3A86E0'], [.45, '#5EAEF0'], [.8, '#9AD2F6'], [1, '#CDEBFA']];
const CLOUD_DAY = ['#A6C0E4', '#D4E4F6', '#F2F8FF', '#FFFFFF'];
const LEAF = ['#1C5236', '#2A7444', '#45A052', '#7CC662'];
const GRASSC = ['#3A8A3C', '#4AA246', '#62BA52', '#8ED266'];

/* ---------------- 夏天的零件 ---------------- */
/* 太阳 + 镜头光晕（一串淡淡的圆片往画面中心排） */
function sunFlare(g, x, y, t, a = 1) {
  sglow(g, x, y, 140, '#FFF2C0', .35 * a); glow(g, x, y, 26, '#FFFBE8', .9 * a, 5); disc(g, x, y, 7, '#FFFFF0');
  const dx = 240 - x, dy = 135 - y;
  [[.35, 6, '#FFE0A0'], [.6, 10, '#A0E0FF'], [.9, 4, '#FFFFFF'], [1.3, 14, '#C8A0FF'], [1.6, 7, '#FFE0A0']].forEach(([k, r, c]) => {
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = .12 * a; disc(g, x + dx * k, y + dy * k, r, c); g.globalAlpha = .2 * a; ring(g, x + dx * k, y + dy * k, r, c); g.restore();
  });
}
/* 远山：两层，淡蓝 */
function hills(g, y, t, o = {}) {
  const c1 = o.c1 || '#8AB8D8', c2 = o.c2 || '#6A9AC0';
  for (let x = 0; x < W; x++) { const h1 = 26 + noise1(x / 60, 3) * 30, h2 = 12 + noise1(x / 40 + 9, 4) * 22; R(g, x, y - h1, 1, h1, c1); R(g, x, y - h2, 1, h2, c2); }
}
/* 远处小镇的屋顶 */
function townRoofs(g, y, o = {}) {
  for (let i = 0, x = -4; x < W; i++) {
    const w = 14 + fl(hash(i, 51) * 18), h = 8 + fl(hash(i, 52) * 12), c = ['#C0504D', '#4A78B0', '#D8A050', '#8A6AB0'][fl(hash(i, 53) * 4)];
    const wall = o.night ? '#2A2A4A' : '#E8DCC8';
    R(g, x, y - h, w, h, wall); for (let k = 0; k < 4; k++) R(g, x + k, y - h - 4 + k, w - 2 * k, 1, o.night ? dk(c, .6) : c);
    if (o.night && hash(i, 54) < .6) R(g, x + 3, y - h + 3, 2, 2, '#FFD27A'); else if (!o.night) R(g, x + 3, y - h + 3, 2, 2, '#7EB8E0');
    x += w + 2;
  }
}
/* 学校：三层教学楼 + 中间钟楼 + 红旗；night 0~1 夜里窗户亮 */
function school(g, x, y, t, o = {}) {
  const n = o.night || 0, wall = mix('#F2E8D8', '#2A2850', n), wall2 = mix('#D8C8B4', '#1E1C40', n), roof = mix('#C0504D', '#4A2030', n);
  const w = 300, fh = 24;
  R(g, x, y - fh * 3, w, fh * 3, wall); R(g, x, y - fh * 3, w, 2, lt(wall, .3)); R(g, x + w - 8, y - fh * 3, 8, fh * 3, wall2);
  for (let f = 0; f < 3; f++) {
    R(g, x, y - fh * (f + 1), w, 2, wall2);
    for (let k = 0; k < 11; k++) {
      const wx = x + 8 + k * 26, wy = y - fh * (f + 1) + 6, lit = hash(k, f + 7) < .55;
      vgrad(g, wx, wy, 16, 12, [[0, mix('#9ACEF0', lit ? '#FFD890' : '#1A2A50', n)], [1, mix('#5A9ACC', lit ? '#FFB860' : '#141E40', n)]], 1);
      R(g, wx + 8, wy, 1, 12, wall2); R(g, wx, wy + 5, 16, 1, wall2);
      if (n < .5 && hash(k, f) < .2) R(g, wx + 2, wy + 1, 3, 4, '#FFFFFF');      // 窗上反光
      if (hash(k, f + 3) < .15) { const sw = ri(Math.sin(t * 2 + k) * 1.5); R(g, wx + 1 + sw, wy, 5, 11, mix('#F4F0F0', '#5A5A7A', n)); }   // 飘出来的窗帘
      if (n > .5 && lit) glow(g, wx + 8, wy + 6, 14, '#FFD890', .35 * n, 3);
    }
  }
  // 钟楼
  const cx = x + w / 2;
  R(g, cx - 22, y - fh * 3 - 30, 44, 30, wall); R(g, cx - 22, y - fh * 3 - 30, 44, 2, lt(wall, .3));
  for (let k = 0; k < 6; k++) R(g, cx - 24 + k, y - fh * 3 - 36 + k, 48 - 2 * k, 1, roof);
  disc(g, cx, y - fh * 3 - 16, 9, mix('#FFFFFF', '#E8E0C0', n)); ring(g, cx, y - fh * 3 - 16, 9, '#4A3A30');
  const hh = (o.clock ?? (t * .02)) % 1, mm = (o.clockM ?? t * .3) % 1;
  line(g, cx, y - fh * 3 - 16, cx + Math.sin(hh * TAU) * 5, y - fh * 3 - 16 - Math.cos(hh * TAU) * 5, '#2A2030');
  line(g, cx, y - fh * 3 - 16, cx + Math.sin(mm * TAU) * 7, y - fh * 3 - 16 - Math.cos(mm * TAU) * 7, '#2A2030');
  if (n > .5) glow(g, cx, y - fh * 3 - 16, 20, '#FFF6D0', .4 * n, 3);
  R(g, cx - 40, y - fh * 3 + 4, 80, 12, mix('#C83A3A', '#5A1A2A', n)); txt(g, '栀子路一中', cx, y - fh * 3 + 4, mix('#FFE6A0', '#C8A070', n), { align: 'c' });
  // 旗杆 + 飘的红旗
  const fx = x + w + 20; R(g, fx, y - 110, 2, 110, '#C8C8D0');
  for (let i = 0; i < 18; i++) for (let j = 0; j < 12; j++) { const dy = ri(Math.sin(t * 5 - i * .45) * 2 * (i / 18)); R(g, fx + 2 + i, y - 108 + j + dy, 1, 1, j < 1 ? '#FF6A5A' : '#D8282E'); }
  // 门口的台阶和门
  R(g, cx - 14, y - 18, 28, 18, mix('#5A3A2A', '#1A1020', n)); R(g, cx - 18, y - 2, 36, 2, wall2);
}
/* 长椅 */
function bench(g, x, y, o = {}) {
  const c = o.col || '#B07A4A', c2 = dk(c, .3);
  for (let k = 0; k < 3; k++) { R(g, x, y - 18 + k * 5, 70, 3, k === 2 ? c : lt(c, .1)); R(g, x, y - 16 + k * 5, 70, 1, c2); }
  R(g, x - 2, y - 6, 74, 3, lt(c, .15)); R(g, x - 2, y - 3, 74, 1, c2);
  [[4, 0], [62, 0]].forEach(([dx]) => { R(g, x + dx, y - 3, 3, 10, '#3A3A48'); R(g, x + dx, y - 20, 3, 4, '#3A3A48'); });
}
/* 自行车 */
function bike(g, x, y, col = '#3A7AC8') {
  ring(g, x + 5, y - 5, 5, '#2A2A30'); ring(g, x + 23, y - 5, 5, '#2A2A30'); P(g, x + 5, y - 5, '#8A8A98'); P(g, x + 23, y - 5, '#8A8A98');
  line(g, x + 5, y - 5, x + 12, y - 12, col); line(g, x + 12, y - 12, x + 22, y - 12, col); line(g, x + 12, y - 12, x + 14, y - 5, col); line(g, x + 14, y - 5, x + 23, y - 5, col); line(g, x + 22, y - 12, x + 23, y - 5, col);
  R(g, x + 10, y - 14, 5, 1, '#2A2A30'); R(g, x + 21, y - 15, 3, 1, '#2A2A30');
}
/* 大片的栀子花叶子：长椭圆，中脉，亮边 */
function bigLeaf(g, x, y, len, ang, pal = LEAF) {
  const ca = Math.cos(ang), sa = Math.sin(ang), wid = len * .28, pts = [], pts2 = [];
  for (let i = 0; i <= 16; i++) { const u = i / 16, w = Math.sin(u * PI) * wid * (1 - u * .25); pts.push([x + ca * len * u - sa * w, y + sa * len * u + ca * w]); pts2.unshift([x + ca * len * u + sa * w, y + sa * len * u - ca * w]); }
  poly(g, pts.concat(pts2), pal[1]);
  poly(g, pts2.concat([[x + ca * len, y + sa * len], [x, y]]), pal[2]);
  for (let i = 1; i < 15; i++) { const u = i / 16; P(g, x + ca * len * u, y + sa * len * u, pal[0]); }
  for (let i = 3; i < 12; i += 3) { const u = i / 16; P(g, x + ca * len * u + sa * 2, y + sa * len * u - ca * 2, pal[3]); }
}
/* 大朵栀子花：两圈尖花瓣，有阴影和亮边 */
function gardeniaBig(g, cx, cy, r, rot = 0, o = {}) {
  const w1 = o.dry ? GARD.dry : '#FFFFFF', w2 = o.dry ? GARD.dry2 : '#F0EEDC', w3 = o.dry ? '#A8916A' : '#CFCBB0';
  const pet = (a, len, wid, c, cs) => {
    const ca = Math.cos(a), sa = Math.sin(a), pts = [];
    for (let i = 0; i <= 10; i++) { const u = i / 10, w = Math.sin(Math.pow(u, .8) * PI) * wid; pts.push([cx + ca * len * u - sa * w, cy + sa * len * u + ca * w]); }
    for (let i = 10; i >= 0; i--) { const u = i / 10, w = Math.sin(Math.pow(u, .8) * PI) * wid; pts.push([cx + ca * len * u + sa * w * .2, cy + sa * len * u - ca * w * .2]); }
    poly(g, pts, cs);
    const pts2 = [];
    for (let i = 0; i <= 10; i++) { const u = i / 10, w = Math.sin(Math.pow(u, .8) * PI) * wid; pts2.push([cx + ca * len * u - sa * w * .2, cy + sa * len * u + ca * w * .2]); }
    for (let i = 10; i >= 0; i--) { const u = i / 10, w = Math.sin(Math.pow(u, .8) * PI) * wid; pts2.push([cx + ca * len * u + sa * w, cy + sa * len * u - ca * w]); }
    poly(g, pts2, c);
  };
  for (let i = 0; i < 6; i++) pet(rot + i / 6 * TAU, r, r * .42, w2, w3);
  for (let i = 0; i < 6; i++) pet(rot + (i + .5) / 6 * TAU, r * .72, r * .36, w1, w2);
  for (let i = 0; i < 5; i++) pet(rot + .3 + i / 5 * TAU, r * .4, r * .26, w1, w2);
  disc(g, cx, cy, Math.max(1, r * .12), o.dry ? '#C8B070' : '#E2D86A'); P(g, cx - 1, cy - 1, '#FFF8C0');
}
/* 一大片栀子花丛（缓存不动的叶子，花一朵朵画） */
function gardeniaBush(g, x, y, w, h, t, o = {}) {
  const seed = o.seed || 5;
  for (let i = 0; i < w * h / 160; i++) { const lx = x + hash(i, seed) * w, ly = y + hash(i, seed + 1) * h, a = hash(i, seed + 2) * TAU, len = 10 + hash(i, seed + 3) * 12; bigLeaf(g, lx, ly + Math.sin(t * 1.5 + i) * .8, len, a); }
  for (let i = 0; i < w * h / 900; i++) { const fx = x + hash(i, seed + 4) * w, fy = y + hash(i, seed + 5) * h; gardeniaBig(g, fx, fy, 7 + hash(i, seed + 6) * 5, hash(i, seed + 7) * 3); }
}
/* 树下的光斑（一个个亮椭圆，慢慢晃） */
function dapples(g, x0, x1, y0, y1, t, o = {}) {
  g.save(); g.globalCompositeOperation = o.op || 'lighter'; g.globalAlpha = o.a ?? .18;
  for (let i = 0; i < (o.n || 20); i++) { const x = x0 + hash(i, 61) * (x1 - x0) + Math.sin(t * .9 + i) * 3, y = y0 + hash(i, 62) * (y1 - y0), r = 3 + hash(i, 63) * 6; ell(g, x, y, r, r * .45, o.col || '#FFF2B0'); }
  g.restore();
}
/* 学生（小怪），s 大小；kind 'walk' 'ball' 'sit' */
function student(g, x, y, s, t, i, o = {}) {
  const col = CROWD[i % CROWD.length], girl = i % 2 === 0, wk = walk(t + i, o.rate ?? 4, s);
  monAt(g, x, y + (o.still ? 0 : wk.bob), s, { col, skirt: girl, legs: o.still ? 0 : wk.legs, eyes: o.eyes || (o.dir > 0 ? 'r' : 'l'), cowlick: !girl && i % 3 === 0, ol: o.ol });
}

/* 头顶的树冠（前景）：大小叶团挤在一起，参差的下沿，挂着白花，随风轻摆 */
function canopy(g, t, o = {}) {
  const y0 = o.y ?? 0, seed = o.seed || 3, depth = o.depth ?? 46;
  for (let i = 0; i < 26; i++) {
    const x = (i / 26) * (W + 60) - 30 + hash(i, seed) * 18, r = 14 + fl(hash(i, seed + 1) * 16), y = y0 - r + hash(i, seed + 2) * depth * (.4 + .6 * Math.abs(Math.sin(i * 1.7)));
    const sw = Math.sin(t * 1.1 + i * .7) * 1.4;
    blit(g, leafClump(r, o.pal || LEAF, seed * 31 + i, o.flowers ?? 7), x - r - 2 + ri(sw), y - r - 2);
  }
  for (let i = 0; i < 6; i++) { const x = 40 + i * 80 + hash(i, seed + 5) * 30, len = 20 + hash(i, seed + 6) * 26; for (let j = 0; j < len; j++) { const sx = ri(Math.sin(t * 1.4 + i + j * .1) * j * .05); R(g, x + sx, y0 + depth * .6 + j, 1, 1, LEAF[0]); if (j % 6 === 3) R(g, x + sx - 1, y0 + depth * .6 + j, 3, 2, LEAF[2]); } }
}
/* ---------------- V1-1 栀子花特写：大花、密密的亮叶子，阳光里花瓣一片片掉 ---------------- */
function shGardeniaMacro(g, t, u, s) {
  vgrad(g, 0, 0, W, H, [[0, '#4E9ACC'], [.5, '#3E7E5A'], [1, '#1E4A34']], 1);
  sunFlare(g, 410, 26, t, .8);
  const pan = -u * 10;
  for (let i = 0; i < 60; i++) bigLeaf(g, pan * .4 + hash(i, 1) * 540 - 30, 30 + hash(i, 2) * 260, 30 + hash(i, 3) * 20, hash(i, 4) * TAU, ['#16402C', '#1E5236', '#2A6A44', '#3E8452']);
  rays(g, 410, 0, t, { n: 6, ang: -.5, len: 340, col: '#FFF6D0', a: .09, spread: 160 });
  for (let i = 0; i < 70; i++) { const lx = pan + hash(i, 11) * 540 - 30, ly = 40 + hash(i, 12) * 250; bigLeaf(g, lx, ly + Math.sin(t * 1.3 + i) * 1.2, 34 + hash(i, 13) * 26, hash(i, 14) * TAU); }
  const fl2 = [[110, 110, 40, .2], [290, 80, 48, 1.1], [420, 170, 36, 2.3], [220, 200, 32, .7], [40, 220, 28, 1.7], [360, 250, 24, .9]];
  fl2.forEach(([x, y, r, rot], k) => { const fx = x + pan + Math.sin(t * .9 + k) * 1.5, fy = y + Math.cos(t * .8 + k) * 1.2; ell(g, fx + 4, fy + 6, r * .9, r * .7, rgba('#0A2014', .35)); gardeniaBig(g, fx, fy, r, rot + Math.sin(t * .3 + k) * .05); });
  [[350, 30], [60, 70], [180, 34], [470, 90]].forEach(([x, y]) => { ell(g, x + pan, y, 7, 12, '#DCE8C8'); ell(g, x + pan - 1, y - 2, 5, 8, '#FFFFFF'); R(g, x + pan, y + 11, 2, 10, '#3E7A3E'); });
  for (let i = 0; i < 9; i++) {
    const t0 = i * .45, v = mod(u - t0, 4) / 4, x = 100 + hash(i, 21) * 300 + Math.sin(u * 2 + i) * 20 - v * 60, y = 40 + v * 260, ph = u * 3 + i;
    const w = ri(Math.abs(Math.cos(ph)) * 7) + 2; ell(g, x, y, w, 4, '#FFFFFF'); ell(g, x + 1, y + 1, Math.max(1, w - 2), 2, '#E2DFC8');
  }
  for (let i = 0; i < 50; i++) { const x = 260 + hash(i, 31) * 220 - (i % 3) * 50, y = mod(hash(i, 32) * 270 - t * 3 * (1 + hash(i, 33)), 270); g.globalAlpha = .4 + .5 * Math.sin(t * 2 + i); P(g, x, y, '#FFFBE0'); g.globalAlpha = 1; }
  butterfly(g, 200 + Math.sin(t * .8) * 60 + pan, 60 + Math.cos(t * 1.3) * 20, t, '#FFF4A8');
  const bx = 300 + pan + Math.sin(t * 3) * 3, by = 66 + Math.cos(t * 4) * 2; R(g, bx, by, 4, 3, '#F2C94C'); R(g, bx + 1, by, 1, 3, '#2A2A2A'); R(g, bx + 3, by, 1, 3, '#2A2A2A'); if (fl(t * 20) % 2) R(g, bx + 1, by - 2, 2, 2, rgba('#FFFFFF', .8));
}

/* ---------------- V1-2 校园大全景：教学楼、红旗、操场、单车棚、大栀子树和长椅；她走进来 ---------------- */
function campus(g, t, o = {}) {
  const cam = o.cam || 0, n = o.night || 0;
  vgrad(g, 0, 0, W, 170, SKY_DAY, .6);
  for (let i = 0; i < 4; i++) blit(g, cloudSpr(20 + i, 120 + i * 20, 40, CLOUD_DAY), mod(i * 150 + t * (3 + i), W + 200) - 180, 14 + (i % 2) * 26);
  birds(g, t, { n: 5, x: -40, y: 40, sp: 24, col: '#3A4A6A', seed: 3 });
  hills(g, 150, t); townRoofs(g, 156);
  // 操场：跑道 + 球门
  R(g, 0, 150, W, 20, '#C84A3A'); for (let x = 0; x < W; x += 30) R(g, x, 158, 18, 1, '#F0E8E0');
  school(g, 60 - cam * .3, 150, t, { night: n });
  R(g, 0, 168, W, 102, '#5AB050'); grass(g, 0, W, 170, t, { h: 4, pal: GRASSC, step: 2 });
  // 打篮球的学生、跑步的学生
  const ballX = 40 + Math.sin(t * 1.5) * 20, ballY = 150 - Math.abs(Math.sin(t * 4)) * 14;
  disc(g, ballX, ballY, 2, '#E87A2A');
  student(g, 26 + Math.sin(t * 1.5) * 16, 164, 2, t, 1, { dir: 1, rate: 5 }); student(g, 66 - Math.sin(t * 1.5) * 10, 164, 2, t, 4, { dir: -1, rate: 5 });
  for (let i = 0; i < 3; i++) student(g, mod(i * 160 + t * 20, W + 40) - 20, 160 + i, 2, t, i + 6, { dir: 1, rate: 6 });
  // 路灯、垃圾桶、喷水的水龙头
  R(g, 150, 168, 2, 40, '#4A5060'); R(g, 146, 166, 10, 3, '#4A5060');
  // 单车棚
  R(g, 380, 140, 90, 4, '#6A7A8A'); R(g, 384, 144, 2, 26, '#6A7A8A'); R(g, 464, 144, 2, 26, '#6A7A8A');
  for (let k = 0; k < 3; k++) bike(g, 388 + k * 26, 170, ['#3A7AC8', '#C83A5A', '#E8C040'][k]);
}
function shCampusWide(g, t, u, s) {
  campus(g, t);
  // 大栀子树 + 长椅 + 花丛
  tree(g, 300, 236, { s: 1.9, flowers: 12, seed: 7, pal: LEAF, sway: 1.5, clumps: [[-24, -50, 15], [14, -58, 16], [-6, -72, 17], [26, -42, 12], [-30, -34, 12], [4, -44, 14], [-16, -64, 12], [24, -66, 12]] }, t);
  cat(g, 200, 222, 'loaf', t, { col: '#F2EEE8' });
  dapples(g, 200, 380, 200, 240, t, { n: 24, a: .15 });
  bench(g, 255, 232, {});
  gardeniaBush(g, 20, 196, 120, 40, t, { seed: 3 });
  // 她：从左边走过来，到长椅前
  const x = lerp(140, 262, E.io(seg(u, 0, 2.6))), wk = walk(t, u < 2.6 ? 4 : 0, 3);
  monAt(g, x, 236 + (u < 2.6 ? wk.bob : 0), 3, { col: CL.her, skirt: true, legs: u < 2.6 ? wk.legs : 0, eyes: 'r', ol: '#2A3A2A' });
  R(g, x - 12, 223, 4, 8, '#5A6AA8');                        // 书包
  petals(g, t, { n: 24, x: 160, y: 100, w: 260, h: 170, sp: 16, wind: 8, seed: 31 });
  butterfly(g, 120 + Math.sin(t) * 40, 190 + Math.sin(t * 1.7) * 10, t);
  sunFlare(g, 440, 20, t, .7);
}
/* ---------------- V1-3 长椅上看书，花瓣落下来 ---------------- */
function benchScene(g, t, o = {}) {
  vgrad(g, 0, 0, W, 160, SKY_DAY, .6);
  for (let i = 0; i < 3; i++) blit(g, cloudSpr(20 + i, 130, 40, CLOUD_DAY), mod(i * 170 + t * 4, W + 200) - 180, 30 + (i % 2) * 20);
  hills(g, 150, t); townRoofs(g, 154);
  school(g, 30, 160, t, {});
  R(g, 0, 156, W, 10, '#C84A3A');
  R(g, 0, 164, W, 106, '#4E9E46'); grass(g, 0, W, 166, t, { h: 5, pal: GRASSC, step: 2 });
  for (let i = 0; i < 4; i++) student(g, mod(i * 130 + t * 18 * (i % 2 ? 1 : -1), W + 40) - 20, 168, 2, t, i + 2, { dir: i % 2 ? 1 : -1 });
  gardeniaBush(g, 330, 168, 150, 36, t, { seed: 9 });
  bench(g, 190, 222, { col: '#B07A4A' });
  dapples(g, 120, 360, 170, 240, t, { n: 34, a: .16 });
  canopy(g, t, { y: 0, depth: 60, flowers: 8 });
  rays(g, 380, 0, t, { n: 5, ang: -.35, len: 300, col: '#FFF6D0', a: .08, spread: 120 });
}
function shBenchRead(g, t, u, s) {
  benchScene(g, t);
  monAt(g, 226, 216, 5, { col: CL.her, skirt: true, legs: 0, eyes: blinkAt(t, 2) ? 'blink' : 'dn', ol: '#2A3A2A' });
  R(g, 206, 188, 40, 4, '#F4F0E8'); R(g, 225, 186, 2, 6, '#C8C0B0'); if (mod(u, 2) > 1.6) poly(g, [[226, 188], [246 - (mod(u, 2) - 1.6) * 60, 184], [246 - (mod(u, 2) - 1.6) * 60, 188]], '#FFFFFF');
  petals(g, t, { n: 30, x: 100, y: 30, w: 300, h: 200, sp: 18, wind: 6, seed: 41, big: true });
}
/* ---------------- V1-3b 坐着的她的裙子（近景），花瓣一片片落在蓝色百褶裙上 ---------------- */
function shSkirtPetals(g, t, u, s) {
  benchScene(g, t);
  g.save(); g.globalAlpha = .25; R(g, 0, 0, W, H, '#2A4A30'); g.restore();
  bench2(g, 40, 262);
  monAt(g, 230, 262, 14, { col: CL.her, skirt: true, legs: 0, eyes: 'dn', ol: '#2A3A2A' });
  for (let i = 0; i < 14; i++) {                               // 落下来、停在裙子上的花瓣
    const t0 = i * .2, v = seg(u, t0, t0 + 1.3); if (v <= 0) continue;
    const tx = 110 + hash(i, 51) * 250, ty = 210 + hash(i, 52) * 26, x = tx + (1 - v) * 40 * Math.sin(i), y = ty - (1 - E.out(v)) * 220;
    const ph = v < 1 ? u * 4 + i : hash(i, 53) * 3, w = v < 1 ? ri(Math.abs(Math.cos(ph)) * 5) + 2 : 5;
    ell(g, x + 1, y + 2, w, 2, rgba('#0A1430', .35)); ell(g, x, y, w, 2, '#FFFFFF'); P(g, x + 1, y + 1, '#E2DFC8');
  }
  petals(g, t, { n: 20, sp: 16, wind: 6, seed: 44, big: true });
  dapples(g, 60, 420, 120, 250, t, { n: 30, a: .14 });
}
function bench2(g, x, y) { R(g, x, y - 40, 360, 10, '#B07A4A'); R(g, x, y - 40, 360, 2, '#C8946A'); R(g, x, y - 30, 360, 4, '#8A5A34'); }
/* V1-4 低角度近景：头顶是树冠和天，他凑过去小声说"爱你"，她脸红。o 换成别的一对（副歌四的新一对） */
function whisperScene(g, t, u, s, o = {}) {
  vgrad(g, 0, 0, W, H, [[0, '#3A86E0'], [.6, '#8ACCF4'], [1, '#CDEBFA']], .6);
  for (let i = 0; i < 3; i++) blit(g, cloudSpr(30 + i, 150, 44, CLOUD_DAY), mod(i * 170 + t * 6, W + 200) - 180, 60 + (i % 2) * 30);
  sunFlare(g, 380, 30, t, .7);
  canopy(g, t, { y: 10, depth: 70, flowers: 10, seed: 5 });
  rays(g, 380, 0, t, { n: 6, ang: -.3, len: 320, col: '#FFF6D0', a: .09, spread: 140 });
  R(g, 0, 226, W, 44, '#4E9E46'); grass(g, 0, W, 228, t, { h: 6, pal: GRASSC, step: 2 });
  R(g, 90, 232, 300, 8, '#B07A4A'); R(g, 90, 232, 300, 2, '#C8946A'); R(g, 90, 214, 300, 6, '#A06A3A');
  const hx = lerp(340, 300, E.out(seg(u, 0, .5)));
  monAt(g, 180, 250, 8, { col: o.a || CL.her, skirt: true, legs: 0, eyes: u > 1.0 ? (u > 2.2 ? 'happy' : 'wide') : 'dn', blush: seg(u, 1.0, 2.0), ol: '#2A3A2A', rim: ['#FFF0C0', 'l'] });
  monAt(g, hx, 250, 8, { col: o.b || CL.him, cowlick: true, legs: 0, eyes: 'l', lean: u > .3 ? -1 : 0, blush: .4, ol: '#2A3A2A', rim: ['#FFF0C0', 'r'] });
  if (u > .5 && u < 1.6) { const b = seg(u, .5, .7); R(g, hx - 64, 136 - ri(b * 3), 30, 16, '#FFFFFF'); R(g, hx - 40, 150 - ri(b * 3), 4, 4, '#FFFFFF'); for (let k = 0; k < 3; k++) if (mod(u * 3, 1) * 3 > k) R(g, hx - 58 + k * 8, 142 - ri(b * 3), 4, 4, '#5A5A7A'); }
  if (u > 1.4) for (let k = 0; k < 3; k++) { const v = u - 1.4 - k * .3; if (v > 0) { heart(g, 236 + Math.sin(v * 3 + k) * 10, 150 - v * 24, ['#FF5A7A', '#FF8AA8', '#FFB0C0'][k], k ? 1 : 2); } }
  if (u > 1.4 && u < 1.9) glow(g, 244, 156, 30, '#FF8AA8', .5 * (1 - (u - 1.4) * 2), 4);
  petals(g, t, { n: 40, sp: 20, wind: 10, seed: 42, big: true });
  if (u > 1.0) birds(g, t - s.t - 1.0, { n: 4, x: 300, y: 90, sp: 50, dir: 1, col: '#4A5A7A', seed: 9 });
}
function shWhisper(g, t, u, s) { whisperScene(g, t, u, s); }
/* ---------------- V1-4b 他站起来，把一朵栀子花戴到她头上（她以后的发夹就是这朵） ---------------- */
function shFlowerOnHead(g, t, u, s) {
  benchScene(g, t);
  const placed = u > 2.1;
  monAt(g, 200, 244, 7, { col: CL.her, skirt: true, legs: 0, clip: placed ? 'fresh' : undefined, eyes: placed ? 'happy' : 'up', blush: .4 + .6 * seg(u, 1.6, 2.4), ol: '#2A3A2A' });
  const hx = 300, reach = E.io(seg(u, .4, 2.1)) * (1 - E.io(seg(u, 2.4, 3.2)));
  monAt(g, hx, 244, 7, { col: CL.him, cowlick: true, legs: 0, arms: reach > .1 ? 'reachL' : 'n', eyes: 'l', blush: .5, lean: reach > .5 ? -1 : 0, ol: '#2A3A2A' });
  if (!placed) { const fx = lerp(hx - 52, 196, reach), fy = lerp(214, 184, reach); gardeniaBig(g, fx, fy, 9, t * .3); }
  if (u > 2.0 && u < 3.3) { const v = seg(u, 2.0, 3.3); for (let k = 0; k < 10; k++) { const a = k / 10 * TAU + v * 2, r = 8 + v * 40; R(g, 182 + Math.cos(a) * r, 186 + Math.sin(a) * r * .7, 2, 2, '#FFF6B0'); } glow(g, 182, 186, 30, '#FFFBE0', .5 * (1 - v), 4); }
  petals(g, t, { n: 30, sp: 16, wind: 8, seed: 52, big: true });
}
/* ---------------- V1-5 低下头闻花：香气是一圈圈往上绕的光点 ---------------- */
function shSmell(g, t, u, s) {
  vgrad(g, 0, 0, W, H, [[0, '#6AA86A'], [.5, '#4A8A5A'], [1, '#2E6040']], 1);
  for (let i = 0; i < 40; i++) bigLeaf(g, hash(i, 1) * 520 - 20, hash(i, 2) * 270, 30 + hash(i, 3) * 20, hash(i, 4) * TAU, ['#2A5A3A', '#3A7048', '#4A8456', '#5E9864']);
  bokeh(g, t, { n: 22, seed: 25, rmin: 8, rmax: 30, a: .2, cols: ['#FFFFFF', '#FFF0B0', '#D8FFC8', '#FFD8E8'], vx: 2 });
  rays(g, 240, -20, t, { n: 7, ang: .1, len: 320, col: '#FFF6D8', a: .07, spread: 300 });
  const dip = E.io(seg(u, 0, 1.2));
  monAt(g, 220, 286 + ri(dip * 6), 12, { col: CL.her, clip: 'fresh', eyes: u > .8 ? 'shut' : 'dn', blush: .7, ol: '#3A3A2A', rim: ['#FFF0C0', 'l'] });
  gardeniaBig(g, 300, 196 + ri(dip * 4), 22, t * .15);
  // 香气：三条绕着往上的光点带
  for (let k = 0; k < 3; k++) for (let i = 0; i < 26; i++) {
    const v = mod(i / 26 + t * .18 + k / 3, 1), y = 190 - v * 200, x = 300 + Math.sin(v * 9 + k * 2.1 + t) * (14 + v * 60);
    const a = Math.sin(v * PI); g.globalAlpha = a; R(g, x, y, 2, 2, ['#FFFFFF', '#FFF2A0', '#FFC8E0'][k]); g.globalAlpha = 1;
    if (i % 3 === 0) glow(g, x, y, 5, '#FFF6C0', .5 * a, 3);
  }
  petals(g, t, { n: 24, sp: 10, wind: 5, seed: 61, big: true });
}

/* V1-5b 金色的光里，两个人并排坐在栀子树下，花瓣绕着他们转 */
function shSmellWide(g, t, u, s) {
  vgrad(g, 0, 0, W, 190, [[0, '#4A7AC8'], [.5, '#E8A880'], [.85, '#FFD890'], [1, '#FFF0C0']], .6);
  sglow(g, 380, 150, 200, '#FFC870', .35); glow(g, 380, 150, 26, '#FFF6D0', .9, 5); disc(g, 380, 150, 10, '#FFFBE8');
  for (let i = 0; i < 4; i++) blit(g, cloudSpr(60 + i, 140, 36, ['#C88A8A', '#F0B8A0', '#FFD8B0', '#FFF0D0']), mod(i * 140 + t * 5, W + 200) - 180, 20 + (i % 2) * 26);
  hills(g, 190, t, { c1: '#C8A0A0', c2: '#A88088' });
  R(g, 0, 188, W, 82, '#6AA04A'); grass(g, 0, W, 190, t, { h: 6, pal: ['#5A8A3A', '#7AA84A', '#9AC85A', '#C8E07A'], step: 1 });
  tree(g, 180, 214, { s: 1.6, flowers: 14, seed: 7, pal: ['#2A5A2A', '#4A8040', '#7AA84A', '#B8D070'], sway: 1.6 }, t);
  monAt(g, 214, 212, 4, { col: CL.her, skirt: true, clip: 'fresh', legs: 'tuck', eyes: 'shut', blush: .6, rim: ['#FFE0A0', 'r'] });
  monAt(g, 250, 212, 4, { col: CL.him, cowlick: true, legs: 'tuck', eyes: 'happy', blush: .4, rim: ['#FFE0A0', 'r'] });
  rays(g, 380, 150, t, { n: 0 });
  for (let i = 0; i < 40; i++) { const a = t * .6 + i / 40 * TAU, r = 40 + 20 * Math.sin(i * 1.7 + t), x = 232 + Math.cos(a) * r * 1.6, y = 190 + Math.sin(a) * r * .5 - i % 3 * 8; petal(g, x, y, t * 3 + i, { big: i % 2 === 0 }); }
  for (let i = 0; i < 20; i++) { const x = hash(i, 7) * W, y = 120 + hash(i, 8) * 90 + Math.sin(t + i) * 4; g.globalAlpha = .5 + .5 * Math.sin(t * 3 + i); P(g, x, y, '#FFF6C0'); g.globalAlpha = 1; }
  butterfly(g, 300 + Math.sin(t * 1.2) * 40, 160 + Math.cos(t * 1.7) * 14, t, '#FFF4A8');
}

/* ---------------- V1-6 延时：下午 → 日落 → 夜，小镇的灯一盏盏亮起来，月亮升起来 ---------------- */
function skyAt(tod) {                                          // tod 0 下午 → 1 夜
  const A = [[0, '#3A86E0'], [.5, '#6AB4F0'], [1, '#CDEBFA']], B = [[0, '#3A4A9A'], [.45, '#C86A8A'], [.75, '#FF9A6A'], [1, '#FFD890']], C = [[0, '#0A0A28'], [.5, '#1E1A4E'], [1, '#3A2A6A']];
  const blend = (P1, P2, k) => [0, .5, 1].map(y => [y, mix(sampleStops(P1, y), sampleStops(P2, y), k)]);
  return tod < .5 ? blend(A, B, tod * 2) : blend(B, C, (tod - .5) * 2);
}
function sampleStops(st, y) { let k = 0; while (k < st.length - 2 && y > st[k + 1][0]) k++; return mix(st[k][1], st[k + 1][1], clamp((y - st[k][0]) / (st[k + 1][0] - st[k][0]))); }
function shTimelapse(g, t, u, s) {
  const tod = clamp(u / 3.9);
  vgrad(g, 0, 0, W, 170, skyAt(tod), 1);
  stars(g, t, { seed: 61, n: 120, h: 140, a: clamp((tod - .6) * 2.5), big: .05 });
  const sunY = lerp(40, 190, clamp(tod * 1.6)); if (sunY < 170) { glow(g, 380, sunY, 30, mix('#FFF6D0', '#FF8A4A', tod * 1.5), .9, 5); disc(g, 380, sunY, 9, mix('#FFFFF0', '#FFB070', tod * 1.5)); }
  if (tod > .6) moon(g, 90, lerp(190, 50, seg(tod, .6, 1)), 10, { ga: seg(tod, .6, 1) });
  for (let i = 0; i < 5; i++) blit(g, cloudSpr(40 + i, 140, 36, [mix('#A6C0E4', '#3A2A5A', tod), mix('#D4E4F6', '#E87A8A', Math.min(1, tod * 1.5)), mix('#F2F8FF', '#FFB08A', Math.min(1, tod * 1.5)), mix('#FFFFFF', '#FFD8A0', Math.min(1, tod * 1.5))]), mod(i * 120 + t * 40, W + 200) - 170, 20 + (i % 3) * 22, { a: 1 - seg(tod, .75, 1) * .7 });
  hills(g, 150, t, { c1: mix('#8AB8D8', '#1A1A3A', tod), c2: mix('#6A9AC0', '#141430', tod) });
  // 小镇：灯一盏盏亮
  for (let i = 0, x = -4; x < W; i++) {
    const w = 14 + fl(hash(i, 51) * 18), h = 8 + fl(hash(i, 52) * 14), lit = tod > .45 + hash(i, 55) * .4;
    R(g, x, 166 - h, w, h, mix('#E8DCC8', '#22224A', tod)); for (let k = 0; k < 4; k++) R(g, x + k, 166 - h - 4 + k, w - 2 * k, 1, mix(['#C0504D', '#4A78B0', '#D8A050'][i % 3], '#2A1A3A', tod));
    if (lit) { R(g, x + 3, 166 - h + 3, 2, 2, '#FFD27A'); glow(g, x + 4, 166 - h + 4, 6, '#FFB060', .4, 2); }
    x += w + 2;
  }
  school(g, 90, 200, t, { night: clamp((tod - .4) * 2), clock: .6 + tod * 3, clockM: tod * 36 });
  R(g, 0, 198, W, 72, mix('#5AA850', '#142A20', tod)); grass(g, 0, W, 200, t, { h: 5, pal: GRASSC.map(c => mix(c, '#0E2418', tod)) });
  // 两个人沿着坡往上走（真实速度）
  const x = 380 + u * 12;
  monAt(g, x, 236, 2, { col: CL.her, skirt: true, legs: walk(t).legs, eyes: 'r', clip: 'fresh' }); monAt(g, x + 26, 236, 2, { col: CL.him, cowlick: true, legs: walk(t + .1).legs, eyes: 'l' });
  if (tod > .7) fireflies(g, t, { n: 12, y: 190, h: 60, a: seg(tod, .7, 1) });
}

/* ---------------- V1-7 山顶：银河、月亮、小镇的灯在脚下、草里的萤火虫、望远镜；两个人坐在草上 ---------------- */
function hillNight(g, t, o = {}) {
  vgrad(g, 0, 0, W, H, [[0, '#05061A'], [.4, '#10123A'], [.75, '#2A1E5A'], [1, '#4A2A6A']], .6);
  g.drawImage(milkyWay(W, 200, 7, { ang: -.42, cx: .55, cy: .4, wid: 34 }), 0, 0);
  stars(g, t, { seed: 71, n: 260, h: 200, a: 1, big: .03 });
  if (o.moon !== false) moon(g, o.mx ?? 90, o.my ?? 56, o.mr ?? 12);
  // 远处的小镇灯海
  for (let i = 0; i < 160; i++) { const x = hash(i, 81) * W, y = 186 + hash(i, 82) * 22, c = hash(i, 83) < .7 ? '#FFD27A' : '#9FD8FF'; R(g, x, y, 1, 1, c); if (i % 9 === 0) glow(g, x, y, 4, c, .3, 2); }
  for (let x = 0; x < W; x++) { const h = 6 + noise1(x / 50, 2) * 10; R(g, x, 186 - h, 1, h, '#141436'); }
  // 山坡（近）
  for (let x = 0; x < W; x++) { const y = 210 - Math.sin(x / W * PI) * 26 - noise1(x / 30, 5) * 6; R(g, x, y, 1, H - y, '#0E1A24'); R(g, x, y, 1, 1, '#2A4A4A'); }
  grass(g, 0, W, 200, t, { h: 7, pal: ['#0E2A2A', '#163A34', '#1E4A3E', '#2A5A4A'], step: 1, wind: 1.4 });
  fireflies(g, t, { n: 26, y: 160, h: 80, seed: 33 });
}
function shHillStars(g, t, u, s) {
  hillNight(g, t);
  // 望远镜
  line(g, 330, 186, 324, 200, '#5A5A70'); line(g, 330, 186, 336, 200, '#5A5A70'); R(g, 322, 178, 18, 5, '#C8C8D8'); R(g, 336, 177, 4, 7, '#E8E8F0');
  monAt(g, 210, 190, 3, { col: CL.her, skirt: true, legs: 'tuck', eyes: 'up', clip: 'fresh', rim: ['#C8B8FF', 'l'] });
  monAt(g, 252, 190, 3, { col: CL.him, cowlick: true, legs: 'tuck', eyes: 'up', rim: ['#C8B8FF', 'r'] });
  meteor(g, t, s.t + .6, 400, 20, -120, 50, { len: 30, dur: .9 }); meteor(g, t, s.t + 1.9, 300, 10, -90, 40, { len: 22, dur: .7 });
}
/* ---------------- V1-8 大月亮前的吻：流星雨，萤火虫绕成一圈，吻的那一刻一阵光 ---------------- */
function shKissMoon(g, t, u, s) {
  vgrad(g, 0, 0, W, H, [[0, '#06071C'], [.5, '#16164A'], [1, '#3A2A6A']], .6);
  g.save(); g.globalAlpha = .7; g.drawImage(milkyWay(W, 200, 9, { ang: -.6, cx: .5, cy: .35, wid: 30 }), 0, 0); g.restore();
  stars(g, t, { seed: 91, n: 220, h: 220, a: 1, big: .03 });
  const kiss = ch(13, 1);
  for (let i = 0; i < 14; i++) meteor(g, t, s.t + .3 + i * .38, 80 + hash(i, 5) * 400, hash(i, 6) * 60, -100 - hash(i, 7) * 60, 50 + hash(i, 8) * 30, { len: 20 + hash(i, 9) * 14, dur: .8 });
  moon(g, 240, 150, 92, { ga: .35, c1: '#D8CCAA', c2: '#C2B48E', c3: '#A89A76' });
  // 山脊和两个人的剪影
  for (let x = 0; x < W; x++) { const y = 196 + Math.pow((x - 240) / 240, 2) * 40; R(g, x, y, 1, H - y, '#0A0A18'); }
  const d = lerp(18, 7, E.io(seg(t, kiss - .9, kiss)));
  monAt(g, 240 - d - 6, 196, 4, { col: '#0E0C1E', legs: 'tuck', eyes: 'shut', clip: 'fresh', rim: ['#E8D8B0', 'l'], lean: t > kiss - .3 ? 1 : 0 });
  monAt(g, 240 + d + 6, 196, 4, { col: '#0E0C1E', legs: 'tuck', eyes: 'shut', cowlick: true, rim: ['#E8D8B0', 'r'], lean: t > kiss - .3 ? -1 : 0 });
  // 吻的那一刻：光、心、萤火虫绕一圈
  const v = t - kiss;
  if (v > 0) {
    glow(g, 240, 168, 60 + v * 40, '#FFF6D8', Math.max(0, .7 - v * .25), 6);
    for (let k = 0; k < 24; k++) { const a = k / 24 * TAU + v * .6, r = 30 + v * 26 + Math.sin(k * 3 + t * 2) * 4; const x = 240 + Math.cos(a) * r, y = 168 + Math.sin(a) * r * .6; R(g, x, y, 1, 1, '#F0FF9A'); glow(g, x, y, 3, '#E6FF8A', .5 * clamp(1.5 - v * .3), 2); }
    if (v < 2.5) heart(g, 237, 150 - v * 14, '#FF7A9A', 1);
  }
  fireflies(g, t, { n: 16, y: 120, h: 100, seed: 19 });
}

/* ---------------- 现在：楼顶 ---------------- */
function rooftopScene(g, t, o = {}) {
  const sky = o.sky ?? 0;                                       // 0 城市光污染的天，1 那天的星空
  vgrad(g, 0, 0, W, 200, [[0, mix('#14123A', '#05061A', sky)], [.6, mix('#3A2458', '#16164A', sky)], [1, mix('#8A3A6A', '#3A2A6A', sky)]], .6);
  if (sky > 0) { g.save(); g.globalAlpha = sky; g.drawImage(milkyWay(W, 200, 7, { ang: -.42, cx: .55, cy: .4, wid: 34 }), 0, 0); g.restore(); }
  stars(g, t, { seed: 71, n: ri(30 + 230 * sky), h: 190, a: .5 + .5 * sky, big: .03 });
  const sp = mod(t, 4), blinkA = sp < .2 || (sp > .4 && sp < .6) ? 1 : .45;     // 那颗会眨两下的星
  R(g, 352, 30, 1, 1, '#FFFFFF'); glow(g, 352, 30, 7, '#BFE4FF', .55 * blinkA, 3); if (blinkA > .9) { R(g, 350, 30, 5, 1, '#FFFFFF'); R(g, 352, 28, 1, 5, '#FFFFFF'); }
  const CP = cityParts();
  g.save(); g.globalAlpha = 1 - sky * .5; drawCity(g, CP.far, -30, -40, t); drawCity(g, CP.mid, -60, -60, t); g.restore();
  tvTower(g, 330, 60, t, 1 - sky * .5);
  // 楼顶：地面、栏杆、水箱、晾衣绳、花盆、天线
  R(g, 0, 214, W, 56, '#2A2440'); for (let x = 0; x < W; x += 20) R(g, x, 214, 1, 56, '#241E38'); reflect(g, 214, 40, t, { k: .25, amp: 1, tint: '#1A1030' });
  R(g, 0, 196, W, 2, '#6A6080'); for (let x = 4; x < W; x += 10) R(g, x, 196, 1, 18, '#5A5070'); R(g, 0, 205, W, 1, '#5A5070');
  R(g, 30, 140, 40, 46, '#4A4466'); R(g, 30, 140, 40, 3, '#6A6488'); R(g, 34, 186, 4, 28, '#3A3450'); R(g, 62, 186, 4, 28, '#3A3450');
  line(g, 80, 150, 200, 158, '#8A8098'); [['#F2EEE8', 90], ['#E8505B', 110], ['#3E7FE0', 130], ['#F2C94C', 160], ['#F2EEE8', 180]].forEach(([c, x], k) => { const sw = ri(Math.sin(t * 2 + k) * 1); R(g, x + sw, 152 + (x - 80) / 15, 8, 12 + (k % 2) * 4, c); });
  for (let k = 0; k < 4; k++) { R(g, 400 + k * 16, 200, 10, 10, '#8A5A3A'); disc(g, 405 + k * 16, 196, 5, ['#2E8B57', '#4FB06A', '#3E9A4E', '#2E8B57'][k]); if (k === 1) gardeniaBig(g, 421, 192, 3); }
  R(g, 220, 100, 2, 100, '#5A5070'); line(g, 210, 110, 232, 110, '#5A5070'); line(g, 212, 120, 230, 120, '#5A5070'); const on = mod(t, 1.5) < .5; if (on) glow(g, 221, 99, 4, '#FF3040', .8, 2);
  cat(g, 360, 186, 'sit', t);
}
function shRooftopNow(g, t, u, s) {
  rooftopScene(g, t, { sky: 0 });
  monAt(g, 280, 212, 4, { col: CL.her, clip: 'dry', eyes: 'up', arms: 'n', ol: '#140E24', rim: ['#FF7AB0', 'l'] });
  petals(g, t, { n: 6, sp: 8, wind: 12, seed: 8 });
}
function shSighClose(g, t, u, s) {
  const bg = layer('sighBg'); rooftopScene(bg, t, { sky: 0 }); mosaic(g, LAYER.sighBg, 3);
  g.save(); g.globalAlpha = .45; R(g, 0, 0, W, H, '#140E30'); g.restore();
  bokeh(g, t, { n: 18, seed: 33, rmin: 6, rmax: 22, a: .2, cols: ['#FFD27A', '#FF7FB0', '#7FD8FF'], vx: 2, y: 100, h: 170 });
  monFX(g, 200, 250, 8, { col: CL.her, clip: 'dry', eyes: u > .5 && u < 1.6 ? 'shut' : 'up', ol: '#0A0818', rim: ['#FF7AB0', 'l'] }, { t, light: ['#3A2A6A', .15] });
  // 叹出来的一口白气：一团往上飘，变成一颗小星星
  const v = seg(u, .6, 2.8);
  if (v > 0) {
    const x = 270 + v * 30, y = 150 - v * 120, r = 4 + v * 8;
    if (v < .7) { g.save(); g.globalAlpha = .55 * (1 - v / .7); disc(g, x, y, r, '#E8ECFF'); disc(g, x + r * .6, y + 2, r * .7, '#E8ECFF'); g.restore(); }
    if (v > .4) { const k = seg(v, .4, 1); R(g, x - 2, y, 5, 1, '#FFFFFF'); R(g, x, y - 2, 1, 5, '#FFFFFF'); glow(g, x, y, 8 + k * 6, '#C8E4FF', .7 * k, 4); }
  }
}
function shStarsReturn(g, t, u, s) {
  const sky = E.io(seg(u, .4, 3.6));
  rooftopScene(g, t, { sky });
  monAt(g, 280, 212, 4, { col: CL.her, clip: 'dry', eyes: 'up', ol: '#140E24', rim: ['#C8B8FF', 'l'] });
  meteor(g, t, s.t + 2.6, 420, 30, -140, 60, { len: 30, dur: 1 }); meteor(g, t, s.t + 4.2, 300, 20, -120, 50, { len: 26, dur: .9 });
  if (u > 4.6) glow(g, 352, 30, 30 + (u - 4.6) * 300, '#FFFFFF', (u - 4.6) * .9, 6);
}
