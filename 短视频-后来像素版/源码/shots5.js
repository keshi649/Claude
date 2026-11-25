'use strict';
/* shots5.js —— 副歌二：夏日祭（灯笼、小摊、人海、狐狸面具、桥上的烟花、栀子花形状的大烟花）；
   间奏：记忆列车穿过银河 → 母校门口的四季；她：想发又删掉的消息、叠纸飞机。 */

/* ---------------- 夏日祭的街 ---------------- */
function stall(g, x, y, w, name, col, t, kind) {
  R(g, x, y - 60, w, 60, '#3A2418'); R(g, x + 2, y - 58, w - 4, 4, '#5A3A28');
  for (let k = 0; k < w; k += 8) R(g, x + k, y - 64, 8, 10, (k / 8) % 2 ? '#FFFFFF' : col);           // 条纹遮阳棚
  for (let k = 0; k < w; k += 8) disc(g, x + k + 4, y - 54, 4, (k / 8) % 2 ? '#FFFFFF' : col);
  R(g, x + 4, y - 50, w - 8, 12, '#F4E8D0'); txt(g, name, x + w / 2, y - 50, '#2A1A10', { align: 'c' });
  glow(g, x + w / 2, y - 30, w * .6, '#FFC070', .22, 5);
  R(g, x + 4, y - 20, w - 8, 20, '#6A4A30');
  if (kind === 'fish') { R(g, x + 8, y - 30, w - 16, 12, '#4AA8E0'); for (let k = 0; k < 6; k++) { const fx = x + 12 + mod(k * 13 + t * (8 + k * 3) * (k % 2 ? 1 : -1), w - 26); R(g, fx, y - 26 + (k % 3) * 3, 4, 2, '#FF7A2A'); P(g, fx + (k % 2 ? -1 : 4), y - 26 + (k % 3) * 3, '#FF7A2A'); } }
  if (kind === 'candy') for (let k = 0; k < 5; k++) { R(g, x + 10 + k * 10, y - 30, 1, 12, '#E8D8C0'); disc(g, x + 10 + k * 10, y - 34, 5, ['#FFB0D0', '#FFFFFF', '#B0D8FF'][k % 3]); }
  if (kind === 'grill') { R(g, x + 8, y - 26, w - 16, 4, '#2A2A2A'); for (let k = 0; k < 5; k++) R(g, x + 12 + k * 10, y - 30, 6, 4, '#C8703A'); for (let k = 0; k < 6; k++) { const v = mod(t * .6 + k / 6, 1); g.save(); g.globalAlpha = .35 * (1 - v); disc(g, x + w / 2 + Math.sin(v * 6 + k) * 8, y - 34 - v * 60, 3 + v * 8, '#E8E8F0'); g.restore(); } }
  if (kind === 'wheel') for (let k = 0; k < 5; k++) { const cx = x + 10 + k * 11, cy = y - 34, a = t * (6 + k); R(g, cx, cy, 1, 14, '#C8B8A0'); for (let j = 0; j < 4; j++) { const aa = a + j * PI / 2; R(g, cx + Math.cos(aa) * 3, cy + Math.sin(aa) * 3, 2, 2, ['#FF5A5A', '#FFE04A', '#5AC8FF', '#7AE87A'][j]); } }
  if (kind === 'mask') for (let k = 0; k < 4; k++) foxMask(g, x + 8 + k * 14, y - 40, 1);
}
function foxMask(g, x, y, s = 1) {
  const pal = { w: '#F8F4EC', r: '#E83A3A', k: '#1A1A1A', g: '#D8D0C0' };
  blit(g, spr(['w....w', 'ww..ww', 'wwwwww', 'wrkkrw', 'wwwwww', '.wrrw.', '..ww..'], pal), x, y, { k: s });
}
function lanternRows(g, t, y0, n, s, cam = 0) {
  for (let r = 0; r < n; r++) {
    const y = y0 + r * 30, sp = 34 - r * 6;
    for (let x = -mod(cam * (1 + r * .3), sp); x < W + sp; x += sp) {
      const yy = y + Math.sin((x + cam) / 80) * 6;
      lantern(g, x, yy, s + r * .25, t, { col: (fl((x + cam) / sp) + r) % 3 ? '#E8452E' : '#FFB040' });
    }
    for (let x = 0; x < W; x++) P(g, x, y - 6 + Math.sin((x + cam) / 80) * 6, '#1A0E14');
  }
}
function festivalStreet(g, t, o = {}) {
  const cam = o.cam || 0;
  vgrad(g, 0, 0, W, 140, [[0, '#0A0A2A'], [.6, '#24164A'], [1, '#4A2050']], .6);
  stars(g, t, { seed: 31, n: 60, h: 90, a: .7 });
  // 远处：屋顶和一座牌楼的剪影
  for (let i = 0; i < 9; i++) { const x = i * 60 - mod(cam * .3, 60), h = 30 + hash(i, 5) * 30; R(g, x, 140 - h, 56, h, '#1A1028'); for (let k = 0; k < 6; k++) R(g, x - 4 + k, 140 - h - 6 + k, 64 - 2 * k, 1, '#24142E'); if (hash(i, 6) < .6) R(g, x + 20, 140 - h + 10, 6, 6, '#FFC070'); }
  const gx = 240 - cam * .3; R(g, gx - 50, 50, 100, 8, '#8A2A2A'); R(g, gx - 56, 46, 112, 5, '#3A1A1A'); R(g, gx - 40, 58, 6, 82, '#7A2222'); R(g, gx + 34, 58, 6, 82, '#7A2222'); R(g, gx - 30, 66, 60, 5, '#7A2222');
  lanternRows(g, t, 70, 1, .8, cam * .6);
  // 小摊
  const kinds = [['金鱼', '#E8452E', 'fish'], ['棉花糖', '#FF8AC8', 'candy'], ['烤鱿鱼', '#3A7AC8', 'grill'], ['风车', '#4AB84A', 'wheel'], ['面具', '#8A4AC8', 'mask'], ['刨冰', '#4AC8E8', 'candy']];
  for (let i = 0; i < 8; i++) { const k = kinds[i % kinds.length], x = i * 78 - mod(cam, 78 * 6) - 10; stall(g, x, 196, 70, k[0], k[1], t, k[2]); }
  R(g, 0, 196, W, 74, '#3A2A3A'); for (let x = -mod(cam, 20); x < W; x += 20) R(g, x, 196, 1, 74, '#32222E');
  glow(g, 240, 200, 260, '#FF8040', .08, 8);
}
function festivalCrowd(g, t, y, n, s, seed, o = {}) {
  for (let i = 0; i < n; i++) {
    const dir = hash(i, seed) < .5 ? 1 : -1, sp = 10 + hash(i, seed + 1) * 12, x = mod(hash(i, seed + 2) * (W + 60) + t * sp * dir - (o.cam || 0), W + 60) - 30, yy = y + hash(i, seed + 3) * 18;
    if (o.skip && Math.abs(x - o.skip) < 24) continue;
    const wk = walk(t + i, 4, s), col = ['#E87A9A', '#7A9AE8', '#E8C07A', '#9AE87A', '#C88AE8', '#7AD8D8', '#E8E8E8'][i % 7];
    monAt(g, x, yy + wk.bob, s, { col: CROWD[i % CROWD.length], skirt: i % 2 === 0, legs: wk.legs, eyes: dir > 0 ? 'r' : 'l', ol: '#140A1A' });
    R(g, x - 4 * s, yy - 4 * s, 8 * s, 2 * s, col);                       // 浴衣的腰带
    if (i % 5 === 0) { const sx = x + 5 * s, sy = yy - 9 * s; R(g, sx, sy, 1, 4 * s, '#8A7A6A'); for (let k = 0; k < 5; k++) { const a = t * 20 + k * 1.3; P(g, sx + Math.cos(a) * (2 + k % 3), sy + Math.sin(a) * (2 + k % 3), k % 2 ? '#FFF6A0' : '#FFB040'); } glow(g, sx, sy, 6, '#FFD070', .6, 3); }   // 仙女棒
    if (i % 7 === 3) { line(g, x + 3 * s, yy - 8 * s, x + 3 * s + 2, yy - 18 * s, '#DDDDDD'); disc(g, x + 3 * s + 2, yy - 20 * s, 3 * s, ['#FF5A7A', '#5AC8FF', '#FFE04A'][i % 3]); }   // 气球
  }
}
/* F-1 夏日祭：她一个人走在人海里 */
function shFestival(g, t, u, s) {
  const cam = u * 26;
  festivalStreet(g, t, { cam });
  festivalCrowd(g, t, 214, 12, 3, 7, { cam: cam * .3, skip: 240 });
  const wk = walk(t, 3, 4);
  monAt(g, 240, 236 + wk.bob, 4, { col: CL.her, clip: 'dry', eyes: blinkAt(t, 5) ? 'blink' : 'l', legs: wk.legs, ol: '#140A1A', rim: ['#FFB060', 'r'] });
  festivalCrowd(g, t, 246, 6, 4, 9, { cam: cam * .5, skip: 240 });
  lanternRows(g, t, -4, 1, 1.6, cam * 1.4);
  bokeh(g, t, { n: 10, seed: 13, cols: ['#FFB040', '#FF5A3A', '#FFE0A0'], a: .18, rmin: 10, rmax: 22, h: 120 });
}
/* F-2 近景：气球飞走的小孩在哭；她蹲下，把手里的棉花糖递过去，小孩笑了（她学会了怎么去爱） */
function shGiveKid(g, t, u, s) {
  const bg = layer('kidBg'); festivalStreet(bg, t, { cam: 80 }); mosaic(g, LAYER.kidBg, 4);
  g.save(); g.globalAlpha = .4; R(g, 0, 0, W, H, '#140A20'); g.restore();
  bokeh(g, t, { n: 24, seed: 23, cols: ['#FFB040', '#FF5A3A', '#FFE0A0', '#FF8AC8'], a: .24, rmin: 8, rmax: 26 });
  lanternRows(g, t, -6, 1, 2.2, 40);
  const give = seg(u, 1.0, 2.0), happy = u > 2.1;
  const by = 110 - u * 36; line(g, 360, by + 16, 366, by + 34, '#DDDDDD'); disc(g, 360, by, 12, '#FF5A7A'); R(g, 354, by - 7, 4, 4, '#FFB0C0');
  monAt(g, 340, 250, 6, { col: '#9AD0E8', skirt: true, eyes: happy ? 'happy' : 'up', tear: happy ? 0 : .8, tear2: happy ? 0 : .7, blush: happy ? .6 : 0, ol: '#140A1A', arms: happy ? 'up' : 'n' });
  monAt(g, 170, 262, 9, { col: CL.her, clip: 'dry', eyes: happy ? 'happy' : 'r', legs: 'tuck', arms: give > 0 && give < 1 ? 'reachR' : 'holdR', ol: '#140A1A', rim: ['#FFB060', 'l'] });
  const cx = lerp(250, 300, E.io(give)), cy = lerp(176, 196, E.io(give)); R(g, cx, cy, 2, 26, '#E8D8C0'); disc(g, cx, cy - 8, 13, '#FFB0D0'); disc(g, cx - 4, cy - 12, 7, '#FFD0E4'); disc(g, cx + 5, cy - 5, 5, '#FF9AC4');
  if (happy) for (let k = 0; k < 8; k++) { const a = k / 8 * TAU + u, r = 30 + (u - 2.1) * 14; R(g, 340 + Math.cos(a) * r, 190 + Math.sin(a) * r * .6, 2, 2, '#FFF6A0'); }
}
/* F-3 人群那头：一个戴狐狸面具、头上翘一撮毛的青色小怪回头看了一眼，人潮一挡，就不见了 */
function shFoxMask(g, t, u, s) {
  festivalStreet(g, t, { cam: 200 });
  g.save(); g.globalAlpha = .25; R(g, 0, 0, W, H, '#140A20'); g.restore();
  festivalCrowd(g, t, 196, 10, 3, 17, { skip: 300 });
  const gone = u > 2.3;
  if (!gone) { monAt(g, 300, 240, 6, { col: CL.him, cowlick: true, eyes: u > 1.5 ? 'back' : 'l', ol: '#140A1A', rim: ['#FFB060', 'l'] }); if (u <= 1.5) foxMask(g, 272, 192, 6); }
  for (let k = 0; k < 5; k++) { const x = lerp(-80 + k * 60, 520 + k * 60, seg(u, 1.6 + k * .08, 3.2 + k * .08)); monAt(g, x, 300, 10, { col: '#1A1020', eyes: 'back', legs: walk(t + k).legs }); }
  lanternRows(g, t, -8, 1, 2, 120);
  bokeh(g, t, { n: 10, seed: 63, cols: ['#FFB040', '#FF5A3A'], a: .2, rmin: 12, rmax: 26, y: 0, h: 80 });
}
/* F-4 人潮从她身边飞快地流过去（她站着不动），他已经不在了 */
function shFestivalTop(g, t, u, s) {
  festivalStreet(g, t, { cam: 300 });
  g.save(); g.globalAlpha = .3; R(g, 0, 0, W, H, '#140A20'); g.restore();
  for (let k = 3; k >= 0; k--) { g.save(); g.globalAlpha = k ? .18 : 1; festivalCrowd(g, t * 3 - k * .03, 208, 14, 3, 27, { skip: 240 }); g.restore(); }
  monAt(g, 240, 238, 5, { col: CL.her, clip: 'dry', eyes: 'dn', ol: '#140A1A', rim: ['#FFB060', 'l'] });
  for (let k = 3; k >= 0; k--) { g.save(); g.globalAlpha = k ? .2 : 1; festivalCrowd(g, -t * 3.4 - k * .03, 250, 8, 5, 29, { skip: 240 }); g.restore(); }
  lanternRows(g, t, -6, 1, 1.8, 260);
}
/* ---------------- 桥上、河面、烟花 ---------------- */
const FW = [];                                                     // 这一段的烟花表：t0, x, y, 颜色, 种类
for (let i = 0; i < 26; i++) FW.push({ t0: 166.4 + i * .45 + hash(i, 1) * .25, x: 70 + hash(i, 2) * 340, y: 40 + hash(i, 3) * 50, col: ['#FF5A7A', '#FFE04A', '#5AC8FF', '#B07AFF', '#7AFF9A', '#FF9A4A'][i % 6], col2: ['#FFF0A0', '#FFFFFF', '#FFD0E8'][i % 3], kind: ['peony', 'willow', 'ring', 'peony', 'peony', 'heart'][i % 6], r: 44 + hash(i, 4) * 36 });
function fireworksSky(g, t, o = {}) {
  FW.forEach(f => { if (t > f.t0 - 1 && t < f.t0 + 3) firework(g, t, f.t0, f.x + (o.dx || 0), f.y + (o.dy || 0), { col: f.col, col2: f.col2, kind: f.kind, r: f.r * (o.k || 1), n: 56, y0: o.y0 ?? 160 }); });
}
function fwFlash(t) { let v = 0; FW.forEach(f => { const d = t - f.t0; if (d > 0 && d < .4) v = Math.max(v, 1 - d / .4); }); return v; }
function riverNight(g, t, o = {}) {
  vgrad(g, 0, 0, W, 150, [[0, '#08081E'], [.6, '#1A1440'], [1, '#2E1E50']], .6);
  stars(g, t, { seed: 41, n: 60, h: 100, a: .5 });
  fireworksSky(g, t, o);
  const CP = cityParts(); drawCity(g, CP.far, -20, -60 + (o.cityY || 0), t);
  // 河面：倒映城市和烟花
  vgrad(g, 0, 150, W, 120, [[0, '#14143A'], [1, '#08081A']], 1);
  reflect(g, 150, 100, t, { k: .55, amp: 2.5, tint: '#101040', tk: .3, sp: 3 });
  for (let i = 0; i < 14; i++) { const x = mod(i * 41 + t * (3 + i % 3), W + 20) - 10, y = 170 + (i % 5) * 14; R(g, x, y, 4, 3, '#F8E8C8'); R(g, x, y + 3, 4, 1, '#C8A070'); glow(g, x + 2, y + 1, 7, '#FFC070', .5, 3); }   // 河灯
}
function shBridgeFireworks(g, t, u, s) {
  riverNight(g, t, { k: .8 });
  // 桥栏杆（近景）+ 她（侧面，烟花的光一闪一闪打在身上）
  R(g, 0, 214, W, 56, '#2A1A24'); R(g, 0, 196, W, 4, '#6A4A3A'); for (let x = 10; x < W; x += 30) R(g, x, 196, 4, 20, '#5A3A2E');
  const fl1 = fwFlash(t), col = FW.find(f => t - f.t0 > 0 && t - f.t0 < .5);
  monFX(g, 300, 214, 7, { col: CL.her, clip: 'dry', eyes: u > 1.2 ? 'up' : 'l', tear: seg(u, 1.4, 3), ol: '#0A0612', rim: ['#FF8AB0', 'l'] }, { t, light: [col ? col.col : '#FFFFFF', .3 * fl1] });
  lanternRows(g, t, -10, 1, 1.6, 10);
}
function shFireworksWide(g, t, u, s) {
  riverNight(g, t, { k: 1.1 });
  for (let x = 0; x < W; x += 9) { const h = 12 + hash(x, 3) * 10; monAt(g, x + 4, 270 + (x % 2), 2, { col: '#0E0A18', eyes: 'back' }); }   // 河岸上看烟花的人（剪影）
  for (let i = 0; i < 3; i++) { const bx = mod(i * 170 + t * 6, W + 80) - 40, by = 200 + i * 10; R(g, bx, by, 30, 4, '#3A2A2A'); R(g, bx + 10, by - 8, 10, 8, '#5A3A2A'); for (let k = 0; k < 3; k++) { disc(g, bx + 4 + k * 10, by - 12, 2, '#FF7040'); glow(g, bx + 4 + k * 10, by - 12, 6, '#FF8040', .5, 2); } }
}
/* F-7 最后一朵：栀子花形状的大烟花，金色的柳条火花落下来，镜头抬上去 */
function shGardeniaFirework(g, t, u, s) {
  const tilt = E.io(seg(u, 3.4, 6.2)) * 120;
  riverNight(g, t, { dy: tilt, cityY: tilt });
  const t0 = s.t + .8;
  firework(g, t, t0, 240, 80 + tilt, { col: '#FFFFFF', col2: '#FFE8A0', kind: 'flower', r: 90, n: 120, life: 3.6, y0: 300 });
  firework(g, t, t0 + .25, 240, 80 + tilt, { col: '#FFF6C0', col2: '#FFD070', kind: 'flower', r: 54, n: 80, life: 3.4, y0: 300 });
  firework(g, t, t0 + 1.6, 240, 80 + tilt, { col: '#FFD070', col2: '#FF9A40', kind: 'willow', r: 110, n: 90, life: 4.5, y0: 300 });
  if (u > .8 && u < 1.4) { g.save(); g.globalAlpha = (1.4 - u) * .5; R(g, 0, 0, W, H, '#FFF6E0'); g.restore(); }
  if (u > 3.4) stars(g, t, { seed: 77, n: 200, y: -200 + tilt, h: 260, a: seg(u, 3.4, 5.5) });
}

/* ---------------- 间奏：记忆列车 ---------------- */
const MEMSNAP = [['shGardeniaMacro', 40.5], ['shBikeSea', 91.6], ['shUmbrellaWalk', 100.2], ['shWhisper', 53.2], ['shKissMoon', 73.2], ['shMontage', 96.5], ['shHillStars', 70.2], ['shBenchRead', 47.2]];
function memSnap(i) {                                              // 回忆的一帧（画一次缓存起来）
  const [fn, tt] = MEMSNAP[i % MEMSNAP.length];
  return cached('snap:' + fn, W, H, q => { const sh = SHOTS.find(z => z.fn === fn); window[fn](q, tt, tt - sh.t, sh); });
}
function shMemoryTrain(g, t, u, s) {
  const rise = E.io(seg(u, 0, 2.5));
  vgrad(g, 0, 0, W, H, [[0, '#04041A'], [.5, '#0E0E36'], [1, '#22184A']], .6);
  g.save(); g.globalAlpha = .55; g.drawImage(milkyWay(W, H, 13, { ang: -.25, cx: .5, cy: .5, wid: 40 }), 0, ri(-40 + rise * 40)); g.restore();
  stars(g, t, { seed: 61, n: 300, h: H, a: 1, big: .04, ox: -t * 10 });
  // 一列发光的车从右往左穿过银河，每扇窗里是一段回忆
  const x0 = lerp(520, -760, seg(u, .8, 6.3)), y0 = 130 + Math.sin(u * .8) * 10;
  for (let k = 0; k < 8; k++) {
    const cx = ri(x0 + k * 104), cy = ri(y0 + Math.sin((cx + 100) / 200) * 16);
    if (cx > W + 10 || cx + 100 < -10) continue;
    R(g, cx, cy, 100, 40, rgba('#C8E0FF', .25)); ring2(g, cx, cy, 100, 40, '#E8F4FF'); R(g, cx, cy + 36, 100, 2, '#FFE6A0');
    g.save(); g.imageSmoothingEnabled = true; g.drawImage(memSnap(k), cx + 4, cy + 4, 92, 30); g.restore();
    glow(g, cx + 50, cy + 20, 60, '#BFDFFF', .18, 5);
  }
  for (let i = 0; i < 60; i++) { const v = hash(i, 9), x = x0 + 830 + v * 300, y = y0 + 20 + Math.sin(v * 20 + t) * 14 + (hash(i, 10) - .5) * 20; if (x < W) R(g, x, y, 1, 1, i % 3 ? '#FFFFFF' : '#FFE6A0'); }   // 车尾的光尘
  const hx = x0 - 6; R(g, hx, y0 + 6, 8, 30, '#E8F4FF'); glow(g, hx - 4, y0 + 20, 24, '#FFFFFF', .7, 4);
}
/* ---------------- 间奏：母校门口的四季（日夜飞快交替；她每年都来一次） ---------------- */
function shSeasons(g, t, u, s) {
  const D = s.e - s.t, ph = u / D * 4, sea = fl(ph) % 4, f = ph - fl(ph);      // 0 夏 1 秋 2 冬 3 春
  const day = .5 + .5 * Math.sin(u * 4.2), nt = 1 - day;
  const SK = [['#3A86E0', '#9AD2F6'], ['#E89A5A', '#F8D8A0'], ['#8A98B0', '#D8E0E8'], ['#7AB8E8', '#D0EAF8']][sea];
  vgrad(g, 0, 0, W, 196, [[0, mix('#0A0C24', SK[0], day)], [1, mix('#2A2050', SK[1], day)]], .7);
  stars(g, t, { seed: 4, n: 90, h: 130, a: nt });
  const sa = mod(u * 4.2 / TAU + .25, 1), sunX = 40 + sa * 400, sunY = 120 - Math.sin(sa * PI) * 90;
  if (day > .3) glow(g, sunX, sunY, 20, '#FFF6D0', day, 4); else moon(g, 480 - sunX, sunY, 8, { ga: nt });
  for (let i = 0; i < 5; i++) blit(g, cloudSpr(20 + i, 120, 36, CLOUD_DAY.map(c => mix(c, '#3A3A5A', nt))), mod(i * 120 + t * 70, W + 200) - 180, 14 + (i % 3) * 18);
  hills(g, 160, t, { c1: mix('#2A2A4A', ['#8AB8D8', '#C8A880', '#C8D0E0', '#9AC8D8'][sea], day), c2: mix('#1A1A3A', ['#6A9AC0', '#A88860', '#A8B0C8', '#7AA8C0'][sea], day) });
  // 后面的教学楼（白天黑夜跟着变；冬天屋顶积雪）
  school(g, 110, 196, t, { night: nt, clock: u * .7, clockM: u * 8 });
  if (sea === 2) for (let k = 0; k < 300; k += 3) R(g, 110 + k, 196 - 72 - 2, 3, 2, '#FFFFFF');
  // 围墙、人行道
  R(g, 0, 182, W, 3, mix('#3A3A4A', '#C8B8A8', day)); for (let x = 0; x < W; x += 8) R(g, x, 185, 2, 11, mix('#2A2A3A', '#B8A898', day));
  const ground = ['#5AA850', '#B8984A', '#EEF2F8', '#7AC860'][sea];
  R(g, 0, 196, W, 74, mix('#14201A', ground, day)); R(g, 0, 196, W, 8, mix('#22222E', '#B8B0A8', day));
  if (sea !== 2) grass(g, 0, W, 206, t, { h: 4, pal: (sea === 1 ? ['#A87A3A', '#C8984A', '#D8B060', '#E8C878'] : GRASSC).map(c => mix('#0E1A14', c, day)), step: 2 });
  // 校门
  R(g, 40, 120, 14, 84, mix('#3A3A4A', '#E0D8C8', day)); R(g, 170, 120, 14, 84, mix('#3A3A4A', '#E0D8C8', day)); R(g, 34, 112, 156, 12, mix('#3A1A1A', '#B83A3A', day)); txt(g, '栀子路一中', 112, 112, '#FFE6A0', { align: 'c' });
  if (sea === 2) { R(g, 34, 110, 156, 3, '#FFFFFF'); R(g, 40, 118, 14, 2, '#FFFFFF'); R(g, 170, 118, 14, 2, '#FFFFFF'); }
  // 路灯：夜里亮
  R(g, 216, 140, 2, 64, '#3A3A48'); R(g, 210, 138, 12, 3, '#3A3A48'); if (nt > .5) { glow(g, 216, 142, 24, '#FFE0A0', .6 * nt, 5); R(g, 212, 141, 8, 1, '#FFF0C0'); }
  // 延时里一闪而过的学生（拖着残影）
  if (day > .4) for (let i = 0; i < 6; i++) { const dir = i % 2 ? 1 : -1, x = mod(i * 97 + t * 160 * dir, W + 60) - 30; for (let k = 3; k >= 0; k--) { g.save(); g.globalAlpha = (k ? .2 : .8) * day; monAt(g, x - dir * k * 6, 222 + (i % 3) * 8, 2, { col: CROWD[i + sea], skirt: i % 2 === 0, legs: walk(t * 3 + i).legs, eyes: dir > 0 ? 'r' : 'l' }); g.restore(); } }
  // 栀子树：夏天开花、秋天黄叶、冬天光秃秃积雪、春天冒新芽
  const pal = [LEAF, ['#8A4A1A', '#C8702A', '#E8A040', '#F8C860'], null, ['#3A8A3A', '#6AC85A', '#9AE87A', '#C8F8A0']][sea];
  if (pal) tree(g, 340, 236, { s: 1.7, flowers: sea === 0 ? 12 : 0, seed: 7, pal: pal.map(c => mix('#0E1A14', c, .3 + .7 * day)), sway: 1.4, clumps: [[-24, -50, 15], [14, -58, 16], [-6, -72, 17], [26, -42, 12], [-30, -34, 12], [4, -44, 14]] }, t);
  else { tree(g, 340, 236, { s: 1.7, seed: 7, clumps: [], pal: LEAF }, t); for (let i = 0; i < 40; i++) R(g, 300 + hash(i, 3) * 80, 150 + hash(i, 4) * 60, 4, 1, '#FFFFFF'); }
  bench(g, 304, 236, { col: mix('#3A2A1A', '#B07A4A', day) });
  if (sea === 2) R(g, 302, 216, 74, 2, '#FFFFFF');
  if (sea === 1) for (let i = 0; i < 24; i++) { const v = mod(t * .3 + i / 24, 1); bigLeaf(g, 280 + hash(i, 5) * 180 - v * 140, 110 + v * 130, 5, v * 12 + i, ['#8A4A1A', '#C8702A', '#E8A040', '#F8C860']); }
  if (sea === 2) snow(g, t, 140);
  if (sea === 0) { petals(g, t, { n: 24, x: 260, y: 100, w: 180, h: 140, seed: 9 }); if (day > .5) butterfly(g, 300 + Math.sin(t * 2) * 30, 180 + Math.cos(t * 3) * 10, t); else fireflies(g, t, { n: 10, x: 240, y: 170, w: 200, h: 60 }); }
  if (sea === 3) { rain(g, t, { n: 80, sp: 260, len: 5, sl: .1, col: 'rgba(200,220,255,.45)', seed: 5 }); splashes(g, t, { n: 20, y0: 206, y1: 262 }); }
  // 她：每个季节来一次（秋天抱着书，冬天戴毛线帽，春天撑伞）
  const vis = env(f, .12, .26, .78, .92);
  if (vis > 0) {
    g.save(); g.globalAlpha = vis;
    monAt(g, 300, 236, 4, { col: CL.her, clip: 'dry', eyes: 'up', ol: '#1A1A2A', arms: sea === 3 ? 'holdR' : 'n', rim: nt > .5 ? ['#FFE0A0', 'l'] : undefined });
    if (sea === 2) { R(g, 284, 196, 32, 6, '#C83A4A'); disc(g, 300, 193, 3, '#F4F0F0'); }
    if (sea === 3) umbrella(g, 318, 180, 22, { stick: 22 });
    if (sea === 1) R(g, 286, 214, 10, 12, '#5A6AA8');
    g.restore();
  }
  // 角上的日历一页页翻过去
  const yr = 2010 + fl(u / D * 14);
  R(g, 404, 40, 50, 44, '#F4F0E8'); R(g, 404, 40, 50, 12, '#D84A4A'); tiny(g, String(yr), 414, 43, '#FFFFFF'); tiny(g, ['JUL', 'OCT', 'JAN', 'APR'][sea], 418, 60, '#2A2A3A'); tiny(g, '17', 422, 70, '#E84A5A');
  const fp = mod(u * 3, 1); if (fp < .3) poly(g, [[404, 52], [454, 52], [454 - fp * 160, 52 + fp * 80]], '#E8E4D8');
}
function snow(g, t, n) { for (let i = 0; i < n; i++) { const x = mod(hash(i, 3) * W + Math.sin(t + i) * 8 + t * 6, W), y = mod(hash(i, 4) * H + t * (14 + hash(i, 5) * 16), H); R(g, x, y, i % 3 ? 1 : 2, i % 3 ? 1 : 2, '#FFFFFF'); } }

/* ---------------- 她：手机上想发又删掉的消息 ---------------- */
function shPhoneRoom(g, t, u, s) {
  roomBase(g, t);
  g.save(); g.globalAlpha = .3; R(g, 0, 0, W, H, '#0A0818'); g.restore();
  monAt(g, 236, 196, 6, { col: CL.her, clip: 'dry', eyes: 'dn', legs: 'tuck', ol: '#1A1428' });
  R(g, 250, 168, 10, 16, '#1A1A24'); R(g, 251, 169, 8, 13, '#BFE0FF'); glow(g, 255, 170, 30, '#9FD0FF', .45, 5);
  cat(g, 300, 182, 'loaf', t);
}
function phoneUI(g, t, u) {
  R(g, 0, 0, W, H, '#14121E'); glow(g, 240, 135, 200, '#5A7AC8', .15, 8);
  const px = 150, py = 6, pw = 180, ph = 214;
  R(g, px - 6, py - 6, pw + 12, ph + 12, '#2A2A34'); R(g, px, py, pw, ph, '#F4F4F8');
  R(g, px, py, pw, 34, '#5AC88A'); txt(g, '17', px + 34, py + 11, '#FFFFFF');
  disc(g, px + 18, py + 17, 10, '#FFFFFF'); gardenia(g, px + 18, py + 17, 7);
  const typing = u > 1.0 && u < 2.4 && fl(u * 4) % 2 === 0;
  if (u > 1.0 && u < 2.4) txt(g, '对方正在输入…', px + 54, py + 11, '#E8FFE8');
  // 很多年前的聊天记录
  tiny(g, "'09 7 17", px + pw / 2 - 16, py + 44, '#A0A0B0');
  const bub = (x, y, str, me) => { const w = textW(str) + 12; R(g, me ? px + pw - w - 8 : px + 8, y, w, 18, me ? '#9AE8A0' : '#FFFFFF'); ring2(g, me ? px + pw - w - 8 : px + 8, y, w, 18, '#D0D0D8'); txt(g, str, (me ? px + pw - w - 8 : px + 8) + 6, y + 3, '#2A2A34'); };
  bub(0, py + 56, '今天的星星好多', false); bub(0, py + 80, '流星！许愿了吗', true); bub(0, py + 104, '许了', false); bub(0, py + 128, '晚安', true);
  // 输入框：打字 → 删掉
  R(g, px, py + ph - 40, pw, 40, '#E8E8F0'); R(g, px + 8, py + ph - 32, pw - 50, 24, '#FFFFFF');
  const msg = '你还好吗', n = u < 1.6 ? Math.min(4, fl(u * 4)) : Math.max(0, 4 - fl((u - 2.2) * 5));
  txt(g, msg.slice(0, n), px + 12, py + ph - 26, '#2A2A34');
  if (fl(t * 2) % 2) R(g, px + 12 + textW(msg.slice(0, n)), py + ph - 27, 1, 13, '#3A7AC8');
  R(g, px + pw - 38, py + ph - 32, 30, 24, n > 0 ? '#5AC88A' : '#C8C8D0'); txt(g, '发送', px + pw - 35, py + ph - 26, '#FFFFFF');
}
function shPhoneScreen(g, t, u, s) { phoneUI(g, t, u); }
/* 她把想说的话写在纸上，叠成纸飞机 */
function shPlaneFold(g, t, u, s) {
  roomBase(g, t);
  g.save(); g.globalAlpha = .25; R(g, 0, 0, W, H, '#0A0818'); g.restore();
  monAt(g, 200, 196, 6, { col: CL.her, clip: 'dry', eyes: u > 4 ? 'up' : 'dn', legs: 'tuck', ol: '#1A1428', arms: 'reachR' });
  const fold = seg(u, 1.2, 4.2), x = 270, y = 140;
  if (fold < .25) { R(g, x - 20, y - 4, 40, 26, '#F8F4EC'); for (let k = 0; k < 4; k++) R(g, x - 16, y + k * 5, 30 - (k === 3 ? 12 : 0), 1, '#8A8AA8'); }
  else if (fold < .6) poly(g, [[x - 20, y + 20], [x, y - 6], [x + 20, y + 20]], '#F8F4EC');
  else { const k = seg(fold, .6, 1); poly(g, [[x - 18, y + 10], [x + 24, y + 4 - k * 4], [x - 4, y + 14]], '#F8F4EC'); poly(g, [[x - 4, y + 14], [x + 24, y + 4 - k * 4], [x - 2, y + 20]], '#D8D4CC'); }
  if (u > 4.4) glow(g, x, y, 30, '#FFF6D8', .3, 4);
}
