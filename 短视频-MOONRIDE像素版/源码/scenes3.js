// 《MOONRIDE》像素版：81.5 ~ 145 秒
'use strict';

// ================= 对称的舞：BACK / SEAT =================
function signPost(x, y, s, word, dir) {
  rect(x - 1, y - 30 * s, 2 * s, 30 * s, '#e8e0d0');
  const w = (textW(word) + 8) * s, x0 = dir > 0 ? x : x - w;
  poly(dir > 0 ? [x0, y - 30 * s, x0 + w, y - 30 * s, x0 + w + 5 * s, y - 25 * s, x0 + w, y - 20 * s, x0, y - 20 * s] : [x0 + w, y - 30 * s, x0, y - 30 * s, x0 - 5 * s, y - 25 * s, x0, y - 20 * s, x0 + w, y - 20 * s], '#5a8aa0');
  text(word, x0 + 4 * s, y - 31 * s, '#ffffff', { sc: s });
}
function smallHouse(x, y, s, col, slide) {
  const c = C(col);
  rect(x - 10 * s, y - 18 * s, 20 * s, 18 * s, c); tri(x - 12 * s, y - 18 * s, x, y - 30 * s, x + 12 * s, y - 18 * s, shade(c, .7));
  rect(x - 3 * s, y - 9 * s, 6 * s, 9 * s, shade(c, .6)); rect(x - 7 * s, y - 15 * s, 4 * s, 4 * s, '#ffffff'); rect(x + 3 * s, y - 15 * s, 4 * s, 4 * s, '#ffffff');
  if (slide) { line(x + 10 * s, y - 14 * s, x + 22 * s, y, '#f0a8c0', 1, Math.max(1, Math.round(s * 2))); }
}
function alpaca(x, y, s, dir) {
  const c = C('#f6efe4'); ell(x, y - 6 * s, 6 * s, 4 * s, c); rect(x + dir * 3 * s - s, y - 15 * s, 3 * s, 9 * s, c); ell(x + dir * 4 * s, y - 15 * s, 2.5 * s, 2 * s, c);
  for (const lx of [-4, -1, 2, 4]) rect(x + lx * s, y - 3 * s, s, 3 * s, shade(c, .85));
}
function shDanceRoad(lt, d, o) {
  const near = o.near, VX = 240, VY = near ? 110 : 96;
  sky([[0, '#8ec4f0'], [.7, '#cfe6ff'], [1, '#fff4e8']], 0, VY + 6);
  for (let i = 0; i < 6; i++) cloud(((i * 90 + lt * 4) % 560) - 40, 20 + (i % 3) * 16, 70, 10, ['#c8d8f0', '#e8f0ff', '#ffffff'], 300 + i);
  hills(301, VY + 4, 10, .015, '#7ab868', { rim: '#a8d888' });
  // 草地和路（透视）
  for (let y = VY; y < H; y++) { const tt = (y - VY) / (H - VY); const hw = 6 + tt * 150; for (let x = 0; x < W; x++) { const ax = Math.abs(x - VX); let c; if (ax < hw) { const z = 40 / (y - VY + 1), u = Math.floor((x - VX) / (hw + 1) * 6 + 6), v = Math.floor(z * 6); c = [[246, 216, 200], [210, 230, 246], [250, 236, 190], [226, 210, 246]][(u + v) & 3]; if (ax < hw * .2) c = mixc(c, [120, 180, 90], .85); } else { c = ((Math.floor(x / 6) + Math.floor(y / 3)) & 1) ? [128, 190, 98] : [116, 178, 88]; } pp(x, y, c); } }
  // 远处的小房子、滑梯、羊驼
  for (const sd of [-1, 1]) { smallHouse(VX + sd * 120, VY + 8, .9, '#f6d8c8', true); smallHouse(VX + sd * 190, VY + 14, 1.1, '#e8e0f8', false); alpaca(VX + sd * 70, VY + 14, .8, -sd); alpaca(VX + sd * 160, VY + 24, 1, sd); }
  smallHouse(VX, VY + 2, .7, '#f8e8d8', false);
  // 路牌
  signPost(VX - 2, VY + 28, near ? 1 : 1, 'BACK', -1); signPost(VX + 2, VY + 28, near ? 1 : 1, 'SEAT', 1);
  // 八个人：两边对称
  const lay = near ? [[0, 80, 250, 120], [1, 150, 214, 90]] : [[0, 64, 262, 92], [1, 118, 224, 70], [2, 160, 196, 54], [3, 192, 176, 42]];
  const gL = [0, 3, 4, 6], gR = [1, 2, 5, 7];
  lay.forEach(([i, x, y, h]) => {
    const p = POSE.dance(lt + 81.5, 2);
    const m = { la: p.ra, ra: p.la, ll: p.rl, rl: p.ll, lean: -(p.lean || 0), bob: p.bob };
    fig(gL[i], x, y, h, { top: 'blouse', col: 'white', skirt: 'puffy', scol: 'white', shoes: 'mary', legs: 'socks', pose: p, mouth: 'smile', turn: .3 });
    fig(gR[i], W - x, y, h, { top: 'blouse', col: 'cream', skirt: 'puffy', scol: 'cream', shoes: 'mary', legs: 'socks', pose: m, mouth: 'smile', turn: -.3 });
  });
  petals(302, 20, lt, ['#ffffff', '#ffd8e8']);
  bloom(.7, 3, .95); vignette(.3);
}

// ================= 街上递毛绒心 =================
function decoBuilding(x, y, w, h, col, o) { // (x,y) 左下
  o = o || {}; const c = C(col), d = shade(c, .82), l = lit(c, .3), tr = C(o.trim || '#7ec8b8');
  rect(x, y - h, w, h, c);
  if (o.round) { ell(x + w, y - h / 2, w * .25, h / 2, c); }
  rect(x, y - h, w, 4, l); rect(x, y - h - 3, w, 3, tr);
  for (let k = 1; k < 4; k++) rect(x, y - h + k * h / 4, w, 2, d);
  // 窗：长条窗、圆窗
  for (let k = 0; k < 3; k++) for (let i = 0; i < Math.floor(w / 18); i++) {
    const wx = x + 6 + i * 18, wy = y - h + 10 + k * h / 4;
    if (o.port && k === 0) { circ(wx + 5, wy + 5, 4, tr); circ(wx + 5, wy + 5, 3, '#cfe8f8'); }
    else { rect(wx, wy, 11, h / 4 - 14, tr); rect(wx + 1, wy + 1, 9, h / 4 - 16, o.warm ? '#ffe2b0' : '#cfe8f8'); }
  }
  rect(x + w * .4, y - 18, w * .2, 18, tr); rect(x + w * .4 + 2, y - 16, w * .2 - 4, 16, '#fff0d8');
  if (o.fin) { rect(x + w * .5 - 3, y - h - 26, 6, h * .6, tr); }
}
function lampPost(x, y, s, on) {
  rect(x - s, y - 40 * s, 2 * s, 40 * s, '#3a4a4a'); rect(x - 3 * s, y - 44 * s, 6 * s, 5 * s, '#3a4a4a');
  rect(x - 2 * s, y - 43 * s, 4 * s, 3 * s, on ? '#ffe8b0' : '#d8d0b8'); if (on) glow(x, y - 42 * s, 8 * s, [255, 210, 140], .5);
}
function goldenStreet(lt, VY, o) {
  o = o || {};
  sky([[0, '#f6b088'], [.6, '#ffd0a0'], [1, '#ffe6c0']], 0, VY + 10);
  // 远处的路、两边的楼（透视收过去）
  rect(0, VY, W, H, '#c8a890');
  for (let y = VY; y < H; y++) { const tt = (y - VY) / (H - VY); line(VX0(tt), y, W - VX0(tt), y, ((y * 7) % 13) < 6 ? '#d8b8a0' : '#d0b098'); }
  function VX0(tt) { return 240 - 30 - tt * 260; }
  const cols = ['#f6c8c0', '#bfe6d8', '#fbe4c8', '#f4d0e0', '#d8e8f4'];
  for (const sd of [-1, 1]) for (let i = 5; i >= 0; i--) { const t = i / 5, x = sd < 0 ? 0 + t * 180 : W - t * 180, w = 120 - t * 90, h = 190 - t * 140, yb = VY + 10 + (1 - t) * 60; decoBuilding(sd < 0 ? x - w * .2 : x - w * .8, yb, w, h, cols[(i + (sd > 0 ? 2 : 0)) % 5], { port: i % 2, warm: 1, round: i === 2 }); lampPost(sd < 0 ? x + w * .7 : x - w * .7, yb + 4, .6 + (1 - t) * .6, true); }
  // 地面的反光
  rect(0, VY + 70, W, H, '#ffffff', .06);
}
function suvRear(x, y, k, o) { // 车尾（朝镜头），x 中心，y 着地
  o = o || {}; const X = u => x + u * k, Y = v => y + v * k; const body = C('#15161d');
  poly([X(-30), Y(-6), X(-31), Y(-24), X(-26), Y(-46), X(26), Y(-46), X(31), Y(-24), X(30), Y(-6)], body);
  rect(X(-30), Y(-8), 8 * k, 8 * k, '#09090c'); rect(X(22), Y(-8), 8 * k, 8 * k, '#09090c');
  rect(X(-30), Y(-26), 10 * k, 3 * k, '#c0303a'); rect(X(20), Y(-26), 10 * k, 3 * k, '#c0303a');
  if (o.open) { // 后备箱打开：里面塞满毛绒心
    rect(X(-24), Y(-44), 48 * k, 30 * k, '#1c1c24');
    const r = rng(o.seed || 7); for (let i = 0; i < 14; i++) plushHeart(X(-18 + r() * 36), Y(-36 + r() * 18), (4 + r() * 4) * k, ['#e8283c', '#ff5a7a', '#8a3ab0', '#c04ad0'][i % 4]);
    poly([X(-27), Y(-46), X(27), Y(-46), X(24), Y(-70), X(-24), Y(-70)], body); rect(X(-22), Y(-68), 44 * k, 14 * k, '#22304a');
  } else { rect(X(-22), Y(-44), 44 * k, 14 * k, '#22304a'); }
  if (o.heart) { line(X(0), Y(-46), X(0), Y(-54), '#d8d0e0'); foilHeart(X(0), Y(-66), 13 * k, o.heart, { string: false, glow: .25 }); }
}
function shStreetHeart(lt, d) {
  goldenStreet(lt, 120);
  // 右边：车尾打开、塞满心
  suvSide(430, 236, 1.6, { dir: -1 });
  { const X = u => 430 - u * 1.6, Y = v => 236 + v * 1.6; poly([X(46), Y(-27), X(50), Y(-56), X(78), Y(-50), X(70), Y(-26)], '#15161d'); const r = rng(3); for (let i = 0; i < 9; i++) plushHeart(X(38 + r() * 10), Y(-14 - r() * 20), 5 + r() * 4, ['#e8283c', '#ff5a7a', '#8a3ab0'][i % 3]); }
  // 三个人：两个递心
  const P1 = fig(0, 150, 248, 100, { top: 'blouse', col: 'white', skirt: 'puffy', scol: 'white', shoes: 'mary', legs: 'socks', turn: .3, pose: { la: [.2, 0], ra: [1.0, -.4] }, mouth: 'smile', amb: ['#ffc080', .1], rim: ['#fff0c8', -1, 0, .5] });
  fig(4, 228, 248, 96, { top: 'cami', col: 'pink', skirt: 'puffy', scol: 'pink', shoes: 'boots', turn: -.3, pose: { la: [1.0, -.4], ra: [.2, 0] }, mouth: 'smile', amb: ['#ffc080', .1] });
  fig(5, 310, 248, 98, { top: 'cami', col: 'lilac', skirt: 'long', scol: 'lilac', shoes: 'boots', turn: -.4, pose: POSE.stand(), mouth: 'n', amb: ['#ffc080', .1] });
  plushHeart(190, 176 + Math.sin(lt * 3) * 2, 15, '#e8283c');
  sparkles(311, 14, 0, 100, W, 240, lt, { col: '#fff0c8' });
  bloom(.8, 3, .93); vignette(.35);
}
function shHandsHeart(lt, d) {
  // 背景：焦外的街（大块的色斑）
  vgrad(0, 0, W, H, [[0, '#f0b890'], [1, '#d89878']], 6);
  for (let i = 0; i < 12; i++) { const r = rng(320 + i); circ(r() * W, r() * H, 16 + r() * 22, ['#ffe0b0', '#fff0d8', '#f8c8a8'][i % 3], .35); }
  const mx = Math.sin(lt * 2) * 4;
  // 两只手托着毛绒心
  for (const sd of [-1, 1]) { thick(240 + sd * 260, 300, 240 + sd * 90 + mx, 190, 26, SKIN.b); ell(240 + sd * 86 + mx, 184, 30, 22, SKIN.b); for (let f = 0; f < 4; f++) thick(240 + sd * (70 - f * 8) + mx, 172 + f * 4, 240 + sd * (52 - f * 8) + mx, 150 + f * 6, 5, SKIN.b); thick(240 + sd * 300, 320, 240 + sd * 150 + mx, 214, 30, '#f4f0f8'); }
  plushHeart(240 + mx, 140, 70, '#e8283c');
  bloom(.8, 3, .93); vignette(.4);
}
function shStreetWalk(lt, d) {
  goldenStreet(lt, 110);
  suvSide(440, 250, 1.9, { dir: -1 });
  const walk = lt * 7;
  fig(4, 150, 252 + lt * 6, 104 + lt * 6, { top: 'cami', col: 'pink', skirt: 'puffy', scol: 'pink', shoes: 'boots', pose: POSE.walkF(walk), mouth: 'smile', amb: ['#ffc080', .1], hold: (P) => { plushHeart(P.hip[0], P.hip[1] - P.hh * .9, P.hh * .8, '#e8283c'); } });
  fig(5, 260, 248 + lt * 6, 100 + lt * 6, { top: 'cami', col: 'lilac', skirt: 'long', scol: 'lilac', shoes: 'boots', pose: POSE.walkF(walk + 1.6), mouth: 'n', amb: ['#ffc080', .1] });
  bloom(.8, 3, .93); vignette(.35);
}
function shTrunkPOV(lt, d, o) {
  goldenStreet(lt, 150);
  // 两个人往后备箱里看
  bust(0, 200, 120 + Math.sin(lt * 2) * 2, 26, { cloth: 'blouse', col: 'white', mouth: 'smile', look: [.2, .4], amb: ['#ffc080', .12], rim: ['#fff0c8', -1, 0, .5] });
  bust(7, 300, 126, 25, { cloth: 'cami', col: 'pink', mouth: o.b ? 'grin' : 'smile', look: [-.2, .4], amb: ['#ffc080', .12] });
  // 后备箱的框（车里往外看）
  poly([0, 0, W, 0, W, H, 0, H, 0, 0, 40, 30, 40, 220, 440, 220, 440, 30, 40, 30], '#0c0c12');
  rect(0, 0, W, 30, '#0c0c12'); rect(0, 0, 40, H, '#0c0c12'); rect(440, 0, 40, H, '#0c0c12'); rect(0, 220, W, H, '#0c0c12');
  line(40, 30, 440, 30, '#2a2c38'); line(40, 30, 40, 220, '#2a2c38'); line(440, 30, 440, 220, '#2a2c38');
  // 前景的毛绒心（大、近）
  const hs = [[60, 250, 70, '#e8283c'], [170, 270, 60, '#8a3ab0'], [300, 262, 74, '#ff3a5e'], [430, 250, 66, '#a040c0'], [110, 190, 40, '#c81e34'], [380, 196, 44, '#e8283c']];
  for (const [x, y, s, c] of hs) plushHeart(x + Math.sin(lt * 2 + x) * 2, y + (o.b ? -lt * 4 : 0), s, c);
  bloom(.7, 3, .95); vignette(.4);
}
function shTrunkTwo(lt, d) {
  goldenStreet(lt, 160);
  bust(0, 170, 110, 36, { cloth: 'blouse', col: 'white', mouth: 'grin', eyes: 'happy', turn: .3, amb: ['#ffc080', .12], rim: ['#fff0c8', -1, 0, .6], wind: .3, ph: lt });
  bust(5, 330, 120, 34, { cloth: 'cami', col: 'white', mouth: 'smile', turn: -.25, look: [-.4, .3], amb: ['#ffc080', .12], rim: ['#fff0c8', 1, 0, .5] });
  rect(400, 0, 80, H, '#0c0c12'); rect(396, 0, 4, H, '#2a2c38');
  bloom(.7, 3, .95); vignette(.4);
}

// ================= 天窗、星星 =================
function shSunroof(lt, d) {
  sky([[0, '#02040e'], [1, '#0e1a3a']]);
  stars(331, 220, 0, 0, W, 200, lt, { big: .12 });
  // 银河
  for (let i = 0; i < 400; i++) { const r = rng(332 + i); const t = r(); px(t * W, 20 + t * 120 + (r() - .5) * 40, [200, 200, 255], .3 + r() * .4); }
  // 车顶
  poly([0, 220, W, 214, W, H, 0, H], '#111218'); rect(70, 214, 340, 8, '#1c1d26');
  const g = [[0, 180], [5, 310]];
  for (const [gi, x] of g) bust(gi, x, 150, 28, { cloth: gi ? 'blouse' : 'cami', col: 'white', mouth: 'smile', look: [0, -1], eyes: 'open', amb: ['#6070c0', .25], rim: ['#c0d0ff', 0, -1, .5],
    after: (L, ox, oy, s) => { for (const sd of [-1, 1]) { ell(ox + sd * .75 * s, oy + 1.05 * s, .4 * s, .35 * s, SKIN.b); thick(ox + sd * .8 * s, oy + 1.2 * s, ox + sd * 1.2 * s, oy + 3.0 * s, .35 * s, SKIN.b); } } });
  poly([60, 222, 420, 222, 430, H, 50, H], '#0a0b10');
  rect(60, 220, 360, 3, '#3a3e50');
  bloom(.9, 3, .9); vignette(.5);
}
function shSunroofTop(lt, d) {
  // 往下看：车顶、天窗里两个人往上看
  rect(0, 0, W, H, '#0c0d14');
  for (let y = 0; y < H; y += 4) rect(0, y, W, 1, '#111320');
  rect(110, 50, 260, 180, '#06070c'); rect(106, 46, 268, 4, '#2a2c3a'); rect(106, 230, 268, 4, '#2a2c3a');
  withMask(maskPoly([110, 50, 370, 50, 370, 230, 110, 230]), () => {
    rect(110, 50, 260, 180, '#141626');
    bust(0, 190, 128, 30, { cloth: 'cami', col: 'white', mouth: 'grin', eyes: 'happy', amb: ['#7080c0', .2], after: (L, ox, oy, s) => { thick(ox + 1.2 * s, oy + 2 * s, ox + 2.4 * s, oy - .3 * s, .35 * s, SKIN.b); ell(ox + 2.4 * s, oy - .6 * s, .4 * s, .45 * s, SKIN.b); } });
    bust(5, 300, 132, 29, { cloth: 'blouse', col: 'white', mouth: 'smile', look: [0, -1], amb: ['#7080c0', .2] });
  });
  // 天上的星星倒映在车顶
  stars(341, 60, 0, 0, W, H, lt, { a: .4 });
  bloom(.8, 3, .9); vignette(.55);
}

// ================= 发光的弯路 =================
function shGlowRoad(lt, d) {
  rect(0, 0, W, H, '#03040a');
  stars(351, 40, 0, 0, W, 60, lt, { a: .5 });
  // 路：一条弯曲的发光带
  const path = []; for (let i = 0; i <= 60; i++) { const t = i / 60; path.push([40 + t * 420 + Math.sin(t * 7) * 60, 240 - t * 170 + Math.cos(t * 5) * 30]); }
  for (let i = 0; i < path.length - 1; i++) { const [x0, y0] = path[i], [x1, y1] = path[i + 1]; const w = 10 - i * .1; thick(x0, y0, x1, y1, w, '#9a9ad8'); thick(x0, y0, x1, y1, w * .6, '#d8d8ff'); onGlow(() => thick(x0, y0, x1, y1, w, [120, 120, 255], .5)); }
  // 路边的灯
  for (let i = 0; i < path.length; i += 4) { const [x, y] = path[i]; const k = (Math.sin(lt * 4 + i) + 1) / 2; px(x + 14, y - 4, '#ffe0a0', .6 + k * .4); glow(x + 14, y - 4, 3, [255, 220, 150], .6); px(x - 14, y + 4, '#ffe0a0', .6 + k * .4); glow(x - 14, y + 4, 3, [255, 220, 150], .6); }
  // 车：沿着路走
  const u = (lt / d) * .6 + .15, j = Math.floor(u * 60), [cx, cy] = path[j];
  rect(cx - 4, cy - 3, 8, 5, '#050508'); glow(cx + 6, cy - 3, 10, [255, 250, 230], 1.2);
  bloom(1, 4, .85); vignette(.6);
}

// ================= 车里长出了草地 =================
function carInterior(lt) {
  rect(0, 0, W, H, '#1a1c24');
  // 前排座椅背面
  for (const x of [80, 300]) { rect(x, 30, 130, 170, '#262833'); rect(x + 6, 36, 118, 158, '#2e303c'); ell(x + 65, 30, 50, 22, '#262833'); for (let k = 0; k < 4; k++) rect(x + 12, 60 + k * 30, 106, 2, '#22242e'); }
  rect(212, 120, 80, 80, '#16171e'); rect(220, 130, 64, 20, '#20222a');   // 中间扶手箱
  rect(0, 0, W, 20, '#101118');
}
function shCarFloor(lt, d) {
  carInterior(lt);
  // 地板：草地、花
  vgrad(0, 196, W, H - 196, [[0, '#3e6a2e'], [1, '#5a9a3e']], 5);
  grass(361, 600, 0, W, 200, H + 4, lt, '#6ab84a', { h: 12, wind: 1.5 });
  meadow(362, 70, 0, W, 205, H, lt, { cols: ['#ff8a4a', '#ffd84a', '#ffffff', '#ff6aa0', '#9a7af0'], h: 30, stem: '#3e7a2e' });
  // 几朵大的花
  for (const [x, y, c] of [[120, 240, '#ff7a3a'], [360, 250, '#ffd84a'], [250, 262, '#ff6aa0']]) { line(x, y + 20, x + Math.sin(lt * 2 + x) * 2, y, '#3e7a2e', 1, 2); for (let a = 0; a < 6.28; a += 1.05) circ(x + Math.cos(a + lt) * 6, y + Math.sin(a + lt) * 6, 5, c); circ(x, y, 4, '#ffe8a0'); }
  petals(363, 18, lt, ['#ffffff', '#ffd8e8', '#fff0b0']);
  bloom(.6, 3, .95); vignette(.5);
}
function shCarLegs(lt, d) {
  carInterior(lt);
  vgrad(0, 186, W, H - 186, [[0, '#3e6a2e'], [1, '#5a9a3e']], 5);
  grass(371, 500, 0, W, 190, H + 4, lt, '#6ab84a', { h: 14 });
  // 两双腿：白袜子、黑皮鞋
  for (const [x, sw] of [[150, 1], [310, -1]]) {
    for (const k of [-1, 1]) { const lx = x + k * 18, kick = Math.sin(lt * 5 + x) * 4 * (k > 0 ? 1 : 0);
      thick(lx, 40, lx + kick, 200, 13, SKIN.b); thick(lx + kick * .6, 130, lx + kick, 214, 13, '#f6f4fa'); ell(lx + kick + 4, 220, 18, 9, '#141218'); ell(lx + kick, 216, 10, 4, '#2a2830'); }
    rect(x - 46, 0, 92, 70, sw > 0 ? '#f4f0f8' : '#f6c8d8'); for (let k = 0; k < 8; k++) circ(x - 42 + k * 12, 70, 6, sw > 0 ? '#ffffff' : '#ffd8e4');
  }
  plushHeart(230, 200, 36, '#e8283c');
  meadow(372, 40, 0, W, 220, H, lt, { cols: ['#ff8a4a', '#ffd84a', '#ffffff'], h: 24, stem: '#3e7a2e' });
  bloom(.6, 3, .95); vignette(.5);
}
function shShoe(lt, d) {
  vgrad(0, 0, W, H, [[0, '#2e4a24'], [1, '#5a8a3a']], 6);
  for (let i = 0; i < 8; i++) { const r = rng(380 + i); circ(r() * W, r() * 100, 20 + r() * 20, ['#4a7a3a', '#6a9a4a', '#ffe0a0'][i % 3], .3); }
  grass(381, 400, 0, W, 120, H + 4, lt, '#7ac85a', { h: 30, wind: 2 });
  // 脚：黑色玛丽珍鞋、白袜
  const sx = 150 + Math.sin(lt * 2) * 3;
  thick(sx - 200, -40, sx + 30, 120, 34, '#f6f4fa');
  poly([sx - 10, 100, sx + 150, 150, sx + 170, 186, sx + 150, 200, sx - 30, 190, sx - 50, 150], '#141218');
  poly([sx, 110, sx + 140, 154, sx + 150, 170, sx - 20, 160], '#2a2830'); line(sx + 20, 120, sx + 60, 150, '#3a3840', 1, 3);
  rect(sx + 30, 126, 34, 5, '#141218'); circ(sx + 48, 128, 4, '#c8c0b0');
  for (const [x, y, c] of [[340, 160, '#ffffff'], [380, 210, '#ffe0f0'], [60, 230, '#ff8aa8'], [420, 120, '#ffffff']]) { line(x, y + 30, x, y, '#4a8a3a', 1, 2); for (let a = 0; a < 6.28; a += 1.26) circ(x + Math.cos(a) * 7, y + Math.sin(a) * 7, 5, c); circ(x, y, 4, '#ffd84a'); }
  meadow(382, 60, 0, W, 200, H, lt, { cols: ['#ffffff', '#ffd8e8', '#ffe88a'], h: 40, stem: '#3e7a2e' });
  bloom(.6, 3, .95); vignette(.45);
}

// ================= 飘着门的草地 =================
function floatingDoors(lt, seed, n, area) {
  const r = rng(seed); const cols = ['#5a3a2a', '#e8c070', '#3a3a3a', '#7a4a3a', '#f0a8b8'];
  for (let i = 0; i < n; i++) { const x = area[0] + r() * (area[2] - area[0]), y = area[1] + r() * (area[3] - area[1]) + Math.sin(lt * .8 + i) * 4, s = .5 + r() * .7; const w = 12 * s, h = 22 * s; door(x, y, w, h, cols[i % cols.length], { open: r() < .4 ? .3 : 0, inside: '#f8e8c0' }); }
}
function goldenMeadowBG(lt, hz) {
  sky([[0, '#6aa8e8'], [.6, '#b8d8f4'], [1, '#ffe8c0']], 0, hz + 4);
  for (let i = 0; i < 5; i++) cloud(((i * 120 - lt * 5) % 600 + 600) % 600 - 60, 40 + (i % 2) * 40, 110, 18, ['#d8c0b0', '#f4e0d0', '#fff4ec', '#ffffff'], 400 + i);
  glow(380, 70, 26, [255, 240, 200], .22); circ(380, 70, 7, '#fff8e4');
  hills(401, hz, 8, .01, '#9ac870', { rim: '#c8e890' });
  vgrad(0, hz, W, H - hz, [[0, '#8ac060'], [1, '#5a9a3a']], 5);
}
function shDoorMeadow(lt, d, o) {
  goldenMeadowBG(lt, 170);
  floatingDoors(lt, 411, 9, [0, 10, W, 120]);
  meadow(412, 160, 0, W, 172, H, lt, { cols: ['#ffffff', '#ffe88a', '#ffc8d8'], h: 10, stem: '#4a8a3a' });
  bust(o.g, 200, 104, 34, { cloth: 'cami', col: 'lilac', mouth: 'smile', turn: -.2, look: [-.3, -.2], necklace: 1, amb: ['#ffe0b0', .08], rim: ['#fff4d8', 1, 0, .7], wind: .6, ph: lt * 2 });
  bloom(.7, 3, .95); vignette(.3);
}
function shCarLean(lt, d, o) {
  // 夜里的路往后退
  rect(0, 0, W, H, '#05060c');
  for (let y = 120; y < H; y++) for (let x = 300; x < W; x++) { const z = 30 / (y - 100), v = Math.floor(z * 8 + lt * 20); pp(x, y, (v & 1) ? [40, 44, 70] : [34, 38, 60]); }
  const lp = (lt * 1.4) % 1; lampPost(320 + lp * 200, 180 + lp * 80, .8 + lp * 1.6, true);
  // 车身（暗，从后面斜着看）
  poly([0, 0, 300, 0, 330, H, 0, H], '#0d0e14'); poly([20, 60, 290, 40, 300, 250, 30, 260], '#08090e');
  bust(o.g, 190, 120, 34, { cloth: 'blouse', col: 'white', mouth: 'smile', eyes: 'closed', turn: .3, amb: ['#7080c0', .25], rim: ['#ffe0b0', 1, 0, .6], wind: 1.2, ph: lt * 5,
    after: (L, ox, oy, s) => { thick(ox - 1.2 * s, oy + 3.2 * s, ox + 1.4 * s, oy + 2.3 * s, .4 * s, SKIN.b); thick(ox + 1.4 * s, oy + 2.3 * s, ox + .3 * s, oy + 1.7 * s, .35 * s, SKIN.b); } });
  rect(0, 210, 320, H, '#121320'); line(0, 210, 320, 206, '#3a3e54', 1, 2);
  bloom(.9, 3, .9); vignette(.5);
}
function doorField(lt, hz, n, o) {
  o = o || {};
  sky([[0, '#05081c'], [1, '#1a2450']], 0, hz + 6); stars(421, 80, 0, 0, W, hz - 10, lt);
  rect(0, hz, W, H, '#16203a'); grass(422, 300, 0, W, hz, H + 4, lt, '#2a4a3a', { h: 6 });
  const cols = ['#8ad8c8', '#f6a8c8', '#f0f0f0', '#e8c070', '#4a7ae0', '#f8b8c8', '#c8b0e8'];
  for (let i = 0; i < n; i++) { const x = o.x0 + i * o.dx, open = i === (o.openIdx === undefined ? 3 : o.openIdx); door(x, hz - o.h + 4, o.w, o.h, cols[i % cols.length], { open: open ? .2 : 0, inside: '#fff0c0', light: open ? .25 : 0 }); }
}
function shDoorNight(lt, d, o) {
  doorField(lt, 200, 7, { x0: 20, dx: 66, w: 30, h: 60, openIdx: 6 });
  meadow(431, 90, 0, W, 204, H, lt, { cols: ['#ffffff', '#ffc8d8', '#c8b0f0'], h: 10, stem: '#2a4a3a' });
  bust(o.g, 240, 110, 38, { cloth: 'blouse', col: 'white', mouth: lt % 1 < .5 ? 'open' : 'smile', look: [0, 0], amb: ['#7080c0', .2], rim: ['#ffe0b0', -1, 0, .5],
    after: (L, ox, oy, s) => { ell(ox - .2 * s, oy + 2.4 * s, .45 * s, .4 * s, SKIN.b); thick(ox - .2 * s, oy + 2.4 * s, ox - 1 * s, oy + 3.8 * s, .35 * s, SKIN.b); } });
  bloom(.9, 3, .9); vignette(.5);
}
function shMeadowWalk(lt, d, o) {
  goldenMeadowBG(lt, 160);
  floatingDoors(lt, 441, 10, [0, 6, W, 110]);
  meadow(442, 200, 0, W, 162, H, lt, { cols: ['#ffffff', '#ffe88a', '#ffc8d8'], h: 12, stem: '#4a8a3a' });
  fig(o.g, 240, 246 + lt * 4, 150 + lt * 6, { top: 'cami', col: 'lav', skirt: 'gown', scol: 'lav', shoes: 'boots', pose: POSE.walkF(lt * 6), mouth: 'smile', amb: ['#ffe0b0', .08], rim: ['#fff4d8', 1, 0, .6], wind: .6, ph: lt * 3, sway: Math.sin(lt * 6) });
  bloom(.7, 3, .95); vignette(.3);
}
function shCloudBust(lt, d, o) {
  sky([[0, '#7aa0e8'], [.5, '#c8b8e8'], [1, '#ffd8d0']]);
  cloudSea(lt, 190, { seed: 451, cols: ['#d0a0c0', '#f4c4d0', '#ffe4e8', '#fff8f8'] });
  floatHearts(452, 10, lt, [0, 10, W, 180], ['#ff8aa8', '#ff6a8e', '#ffb0c8']);
  bust(o.g, 210, 106, 36, { cloth: 'cami', col: 'lilac', mouth: 'smile', turn: -.15, look: [.2, 0], amb: ['#ffd0e0', .08], rim: ['#ffffff', 1, 0, .5], wind: .5, ph: lt * 2.5 });
  bloom(.8, 3, .93); vignette(.3);
}
function shPonyMeadow(lt, d) {
  goldenMeadowBG(lt, 150);
  meadow(461, 200, 0, W, 152, H, lt, { cols: ['#ffffff', '#ffe88a', '#ffc8d8', '#c8b0f0'], h: 14, stem: '#4a8a3a' });
  pony(180 + lt * 40, 222 + Math.abs(Math.sin(lt * 9)) * -6, 2.4, { dir: 1, run: lt * 14, t: lt });
  pony(300 + lt * 44, 236 + Math.abs(Math.sin(lt * 9 + 1)) * -6, 2.2, { dir: 1, run: lt * 14 + 1.5, t: lt });
  meadow(462, 60, 0, W, 240, H + 6, lt, { cols: ['#ffffff', '#ffe88a', '#ff9ab8'], h: 30, stem: '#4a8a3a' });
  bloom(.7, 3, .95); vignette(.3);
}

// ================= 车里的紫色心形气球 =================
function shBalloonCar(lt, d, o) {
  const k = o.k;
  rect(0, 0, W, H, '#0a0a14');
  rect(0, 0, W, 40, '#101020'); // 车顶
  // 窗外的夜
  withMask(maskPoly([20, 40, 200, 34, 210, 120, 20, 130]), () => { sky([[0, '#0a1030'], [1, '#2a3060']]); stars(470, 10, 20, 34, 210, 130, lt); });
  rect(200, 30, 12, 110, '#14141e');
  // 后座
  rect(0, 150, W, 120, '#1c1a28'); for (let x = 20; x < W; x += 150) rect(x, 120, 130, 100, '#24222f');
  const party = (ph) => Math.sin(lt * 8 + ph) * 2;
  const gs = k === 1 ? [[0, 170, 140, 32], [7, 320, 136, 32]] : k === 2 ? [[4, 240, 120, 38]] : k === 3 ? [[0, 280, 130, 34]] : k === 4 ? [[7, 160, 140, 30]] : [[0, 330, 140, 30], [7, 150, 146, 28]];
  for (const [g, x, y, s] of gs) bust(g, x, y + party(x), s, { cloth: g === 4 ? 'cami' : 'blouse', col: g === 7 ? 'white' : 'pink', mouth: g === 4 ? 'grin' : 'smile', eyes: (k === 1) ? 'happy' : 'open', turn: x < 240 ? .2 : -.2, amb: ['#8060c0', .25], rim: ['#c8a0ff', x < 240 ? -1 : 1, 0, .6],
    after: k === 2 ? (L, ox, oy, s) => { const wv = Math.sin(lt * 10) * .3; thick(ox + 1.4 * s, oy + 3.2 * s, ox + 1.9 * s, oy + .4 * s, .35 * s, SKIN.b); ell(ox + 1.9 * s + wv * s, oy + .1 * s, .45 * s, .55 * s, SKIN.b); for (let f = -1; f <= 2; f++) thick(ox + (1.85 + f * .17 + wv) * s, oy - .1 * s, ox + (1.85 + f * .22 + wv) * s, oy - .75 * s, .1 * s + .4, SKIN.b); } : null });
  // 安全带
  if (k === 1) for (const x of [170, 320]) line(x - 40, 120, x + 30, 260, '#3a3846', 1, 4);
  // 紫色锡箔心形气球（前景，有大有小）
  const bs = k === 0 ? [[90, 110, 60], [260, 70, 44], [420, 140, 64], [200, 220, 50]] : k === 3 ? [[110, 90, 54], [420, 70, 40], [160, 230, 48]] : k === 4 ? [[320, 100, 64], [430, 210, 50]] : [[60, 60, 34], [430, 60, 30], [40, 230, 30], [450, 230, 34]];
  bs.forEach(([x, y, s], i) => foilHeart(x + Math.sin(lt * 2 + i) * 4, y + Math.cos(lt * 1.7 + i) * 3, s, ['#8a4ad0', '#b060e0', '#6a3ab0', '#c070f0'][i % 4], { string: false, glow: .15 }));
  // 一闪一闪的彩灯
  for (let i = 0; i < 12; i++) { const x = 20 + i * 40, on = Math.sin(lt * 6 + i * 1.3) > 0; circ(x, 10 + (i % 2) * 6, 2, on ? ['#ff8ad0', '#8ad0ff', '#ffe08a'][i % 3] : '#3a3a4a'); if (on) glow(x, 12, 6, [255, 180, 230], .5); }
  bloom(1, 4, .85); vignette(.55);
}

// ================= 修剪过的花园 =================
function hedgeGarden(lt, hz, o) {
  o = o || {};
  sky([[0, '#f6c080'], [.6, '#ffd8a0'], [1, '#fff0d0']], 0, hz + 10);
  glow(o.sunX || 380, hz - 20, 26, [255, 220, 150], .22); circ(o.sunX || 380, hz - 20, 7, '#fff4dc');
  // 远处的树篱：圆锥、球、心形
  for (let i = 0; i < 9; i++) { const x = i * 58 + 10, y = hz + 6, h = 30 + (i % 3) * 14; if (i % 3 === 0) { tri(x - 12, y, x, y - h, x + 12, y, '#3e6a2e'); tri(x - 10, y, x - 2, y - h + 6, x + 4, y, '#5a8a3e'); } else if (i % 3 === 1) { circ(x, y - 14, 15, '#3e6a2e'); circ(x - 3, y - 17, 10, '#5a8a3e'); } else { heart(x, y - 18, 16, '#3e6a2e'); heart(x - 2, y - 20, 11, '#5a8a3e'); } rect(x - 1, y - 2, 2, 4, '#5a3a2a'); }
  vgrad(0, hz, W, H - hz, [[0, '#6a9a3e'], [1, '#4a7a2e']], 5);
  // 石板小路
  for (let i = 0; i < 9; i++) { const t = i / 8, x = (o.pathX || 240) + Math.sin(t * 3) * 40 * (1 - t), y = H - 10 - t * (H - hz - 20), s = 18 - t * 12; ell(x, y, s, s * .35, '#d8c8b0'); ell(x - 1, y - 1, s * .8, s * .25, '#ece0cc'); }
  // 花坛
  meadow(o.seed || 481, 120, 0, W, hz + 4, H, lt, { cols: ['#ff9ab8', '#ffffff', '#c8a0f0', '#ffb070'], h: 16, stem: '#3e6a2e' });
}
function shHedgeBust(lt, d, o) {
  hedgeGarden(lt, 160, { seed: o.near ? 491 : 492, pathX: 400 });
  if (o.near) { heart(330, 120, 40, '#3e6a2e'); heart(326, 116, 32, '#5a8a3e'); rect(328, 156, 4, 30, '#5a3a2a'); }
  bust(o.g, o.near ? 220 : 240, 108, o.near ? 36 : 32, { cloth: 'strap', col: 'pink', choker: '#ffffff', mouth: o.near ? 'n' : 'smile', eyes: o.near && lt < .5 ? 'closed' : 'open', turn: o.near ? 0 : -.1, ear: true, amb: ['#ffd090', .1], rim: ['#fff0c8', 1, 0, .7], wind: .3, ph: lt * 2 });
  bloom(.7, 3, .95); vignette(.35);
}
function shDoorRow(lt, d) {
  doorField(lt, 196, 7, { x0: 14, dx: 68, w: 34, h: 74, openIdx: -1 });
  const gs = [0, 1, 2, 3, 4, 5, 6, 7];
  const outfit = [['blouse', 'white', 'puffy'], ['cami', 'lilac', 'long'], ['strap', 'pink', 'puffy'], ['blouse', 'cream', 'mid'], ['cami', 'pink', 'puffy'], ['blouse', 'white', 'long'], ['strap', 'lav', 'mid'], ['cami', 'white', 'puffy']];
  gs.forEach((g, i) => { const [top, col, skirt] = outfit[i]; fig(g, 120 + i * 34, 236, 74, { top, col, skirt, scol: col, shoes: 'boots', pose: i % 3 === 1 ? POSE.hips() : POSE.stand(), mouth: 'smile', amb: ['#7080c0', .18], rim: ['#ffe0b0', 1, 0, .4] }); });
  meadow(501, 60, 0, W, 236, H, lt, { cols: ['#ffffff', '#ffc8d8'], h: 12, stem: '#2a4a3a' });
  bloom(.9, 3, .9); vignette(.5);
}
function shLavenderHearts(lt, d) {
  purpleGround(lt, 140, { bushes: 14, seed: 511 });
  const bob = (p) => Math.sin(lt * 6 + p) * 3;
  fig(2, 150, 250, 110, { top: 'strap', col: 'white', skirt: 'puffy', shoes: 'boots', pose: { la: [.35, -1.5], ra: [.35, -1.5] }, mouth: 'smile', amb: ['#a080e0', .15], hold: (P) => plushHeart(P.hip[0] + 2, P.hip[1] - P.hh * .55, P.hh * .95, '#ff4a8a') });
  fig(4, 250, 246, 112, { top: 'cami', col: 'pink', skirt: 'puffy', shoes: 'boots', pose: { la: [.35, -1.5], ra: [.35, -1.5], bob: bob(1) }, mouth: 'grin', eyes: 'happy', amb: ['#a080e0', .15], hold: (P) => plushHeart(P.hip[0], P.hip[1] - P.hh * .55, P.hh * 1.0, '#e8306a') });
  fig(5, 340, 248, 108, { top: 'blouse', col: 'lav', skirt: 'long', shoes: 'boots', pose: POSE.wave(lt), mouth: 'smile', amb: ['#a080e0', .15] });
  fireflies(512, 16, 0, 120, W, 260, lt, '#ffe0f0');
  bloom(1, 3, .9); vignette(.5);
}
function bench(x, y, w) { rect(x, y - 14, w, 4, '#f4f0e8'); rect(x, y - 22, w, 3, '#f4f0e8'); rect(x, y - 30, w, 3, '#f4f0e8'); for (const lx of [x + 3, x + w - 6]) { rect(lx, y - 14, 3, 14, '#d8d0c0'); rect(lx, y - 32, 3, 18, '#d8d0c0'); } }
function shBench(lt, d, o) {
  hedgeGarden(lt, 150, { seed: 521, sunX: 120 });
  heart(390, 104, 40, '#3e6a2e'); heart(386, 100, 32, '#5a8a3e'); rect(388, 140, 4, 30, '#5a3a2a');
  bench(150, 230, 120);
  fig(o.g, 200, 252, 104, { pose: Object.assign(POSE.sit(), { la: [.2, -.4], ra: [.25, -.5] }), top: 'blouse', col: 'white', skirt: 'puffy', scol: 'white', shoes: 'boots', mouth: 'smile', turn: .25, amb: ['#ffd090', .1], rim: ['#fff0c8', -1, 0, .6], wind: .3, ph: lt * 2 });
  meadow(522, 70, 0, W, 240, H, lt, { cols: ['#ff9ab8', '#ffffff', '#c8a0f0'], h: 28, stem: '#3e6a2e' });
  bloom(.7, 3, .95); vignette(.35);
}

// ================= 发光的路、彩虹路、心形云洞 =================
function shWheel(lt, d, o) {
  if (o.city) { goldenStreet(lt, 80); } else { vgrad(0, 0, W, H, [[0, '#f4c0d0'], [.6, '#ffd8e4'], [1, '#ffeef4']], 6); cloudSea(lt * 6, 120, { seed: 531 }); }
  // 路面往后飞
  const yRoad = 200; vgrad(0, yRoad, W, H - yRoad, o.city ? [[0, '#a8988c'], [1, '#c8b8aa']] : [[0, '#ff9ac0'], [1, '#ffd0e2']], 5);
  for (let i = 0; i < 14; i++) { const x = ((i * 53 - lt * 900) % 760 + 760) % 760 - 80; line(x, yRoad + 10 + (i % 4) * 14, x + 60, yRoad + 10 + (i % 4) * 14, o.city ? '#e8dcd0' : '#ffffff', .8, 2); }
  if (!o.city) onGlow(() => rect(0, yRoad, W, 6, [255, 120, 180], .6));
  // 车身下半截和轮子（特写）
  rect(0, 40, W, 130, '#111218'); rect(0, 40, W, 6, '#2a2c36'); line(0, 120, W, 116, '#2a2c36', 1, 2);
  const cx = 250, cy = 182, R = 62, a = -lt * 22;
  circ(cx, cy, R + 8, '#0a0a0e'); circ(cx, cy, R, '#0c0c10'); circ(cx, cy, R * .7, '#3a3e4a'); circ(cx, cy, R * .62, '#262832');
  for (let i = 0; i < 6; i++) { const aa = a + i * 1.047; thick(cx + Math.cos(aa) * R * .15, cy + Math.sin(aa) * R * .15, cx + Math.cos(aa) * R * .6, cy + Math.sin(aa) * R * .6, 4, '#8a8e9a'); }
  circ(cx, cy, R * .14, '#c8ccd8');
  ell(cx - R * .3, cy - R * .45, R * .3, R * .08, '#ffffff', .25);
  sparkles(532, 30, 0, 180, W, H, lt * 3, { col: o.city ? '#fff0d0' : '#ffffff' });
  bloom(.9, 3, .9); vignette(.4);
}
function rainbowPath(t) { return [240 + Math.sin(t * 4.2) * 150 * (1 - t * .7), H + 20 - t * (H - 40)]; }
function shRainbow(lt, d) {
  sky([[0, '#7a90e0'], [.4, '#e0a8c8'], [.8, '#ffc8a0'], [1, '#ffe0b0']]);
  glow(360, 70, 26, [255, 230, 170], .22); circ(360, 70, 8, '#fff4dc');
  cloudSea(lt, 60, { seed: 541, cols: ['#d89aa8', '#f4bcc0', '#ffdcd4', '#fff4ee'] });
  // 彩虹路：一段段宽带
  const RB = ['#ff6a6a', '#ffa84a', '#ffe85a', '#6ad86a', '#5ab0ff', '#a07aff'];
  for (let i = 0; i < 80; i++) { const t0 = i / 80, t1 = (i + 1) / 80; const [x0, y0] = rainbowPath(t0), [x1, y1] = rainbowPath(t1); const w = 30 * (1 - t0 * .85); for (let b = 0; b < 6; b++) { const off = (b - 2.5) / 6 * w; line(x0 + off, y0, x1 + off, y1, RB[b], 1, Math.max(1, Math.round(w / 6))); } }
  const tc = .25 + lt / d * .35, [cx, cy] = rainbowPath(tc), sc = 1 - tc * .8;
  rect(cx - 6 * sc, cy - 8 * sc, 12 * sc, 8 * sc, '#111218'); foilHeart(cx, cy - 14 * sc, 5 * sc, '#ffd84a', { string: false, glow: .3 });
  sparkles(542, 30, 0, 60, W, H, lt, { col: '#ffffff' });
  bloom(.8, 3, .93); vignette(.3);
}
function shHeartTunnel(lt, d) {
  rect(0, 0, W, H, '#f8d8e8');
  // 一圈圈心形的云，越往里越亮
  const cols = ['#a890d8', '#c8a8e4', '#e8b8e0', '#f8c8dc', '#ffd8d8', '#ffe8d8', '#fff4e4', '#ffffff'];
  for (let i = 0; i < 8; i++) { const s = 300 * Math.pow(.72, i) * (1 + (lt * .3) % .28); heart(240, 128 + i * 2, s, cols[i]); const r = rng(551 + i); for (let k = 0; k < 30; k++) { const p = HPATH[k % HPATH.length]; circ(240 + (p[0] - .5) * s * 2.1, 128 + (p[1] - .5) * s * 1.8, s * .12 + r() * 4, lit(C(cols[i]), .2), .7); } }
  glow(240, 120, 40, [255, 250, 230], .6);
  // 彩虹路往里收
  const RB = ['#ff6a6a', '#ffa84a', '#ffe85a', '#6ad86a', '#5ab0ff', '#a07aff'];
  for (let b = 0; b < 6; b++) { const xl = 120 + b * 40, xr = 225 + b * 6; poly([xl, H, xl + 40, H, xr + 6, 150, xr, 150], RB[b]); }
  // 车尾 + 顶上的金色心
  const sc = 1.4 - lt * .3; suvRear(240, 228 - lt * 8, sc, { heart: '#ffd84a' });
  bloom(.8, 4, .9); vignette(.3);
}

// ================= 粉色小城 =================
function decoStreet(lt, VY, o) {
  o = o || {};
  sky([[0, '#8ac0f0'], [.6, '#ffd8c0'], [1, '#ffe8d0']], 0, VY + 10);
  for (let i = 0; i < 4; i++) cloud(i * 140 + 20, 30 + (i % 2) * 20, 110, 14, ['#e0c0c0', '#f8e0e0', '#ffffff'], 560 + i);
  rect(0, VY, W, H, '#8a8a94'); vgrad(0, VY, W, H - VY, [[0, '#9a98a0'], [1, '#6a6a74']], 5);
  for (let i = 0; i < 6; i++) { const t = i / 6; rect(236, VY + 6 + t * t * (H - VY), 8, 4 + t * 10, '#e8e4d8'); }
  const cols = ['#f6c8c0', '#bfe6d8', '#fbe4c8', '#f4d0e0', '#d8e8f4'];
  for (const sd of [-1, 1]) for (let i = 4; i >= 0; i--) { const t = i / 4, w = 140 - t * 100, h = 170 - t * 110, x = sd < 0 ? -20 + t * 170 : W + 20 - t * 170 - w, yb = VY + 10 + (1 - t) * 70; decoBuilding(x, yb, w, h, cols[(i + (sd > 0 ? 3 : 0)) % 5], { port: (i + 1) % 2, round: i === 1, fin: i === 3 }); if (i < 3) { mushroom(sd < 0 ? x + w * .8 : x + w * .2, yb - h + 2, 10 + (2 - i) * 4, { cap: i % 2 ? '#ffb0c8' : '#ff8a6a', seed: i }); } }
  for (const sd of [-1, 1]) for (let i = 0; i < 4; i++) { const t = i / 4; lampPost(240 + sd * (40 + (1 - t) * 160), VY + 20 + (1 - t) * 60, .5 + (1 - t) * .7, false); }
  meadow(o.seed || 561, 50, 0, W, H - 30, H, lt, { cols: ['#ff9ab8', '#ffffff', '#ffd84a'], h: 18, stem: '#4a7a3a' });
}
function shDecoCar(lt, d, o) {
  const c = o.c;
  decoStreet(lt, c === 3 ? 120 : 100, { seed: 570 + c });
  const hc = ['#ff9ab8', '#8ac8ff', '#ffd84a', '#ff9ab8'][c];
  if (c === 0) suvFront(240, 250, 2.4 + lt * .15, { heart: hc, lights: 1 });
  else if (c === 2) suvFront(240 + Math.sin(lt * 3) * 3, 246, 2.8, { heart: hc, lights: 1 });
  else if (c === 1) suvSide(180 + lt * 90, 240, 1.5, { dir: 1, heart: hc, lights: 1, spin: lt * 10 });
  else suvSide(260 - lt * 30, 300, 3.4, { dir: -1, lights: 1, spin: -lt * 10 });
  bloom(.8, 3, .92); vignette(.35);
}
function shCityTop(lt, d, o) {
  rect(0, 0, W, H, '#8a8c94');
  // 俯视：环岛、街区
  const cx = 240 + (o.k ? -lt * 30 : lt * 20), cy = 135;
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const dx = x - cx, dy = y - cy; const rr = Math.hypot(dx, dy); let c = null; if (rr < 26) c = rr < 18 ? [120, 180, 110] : [230, 220, 210]; else if (Math.abs(dx) < 22 || Math.abs(dy) < 22 || rr < 60) c = [130, 132, 142]; if (c) pp(x, y, c); }
  // 街区：粉、薄荷、奶油色的屋顶
  const cols = ['#f6c8c0', '#bfe6d8', '#fbe4c8', '#f4d0e0'];
  for (const [qx, qy] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) { const bx = cx + qx * 40, by = cy + qy * 40; for (let i = 0; i < 3; i++) for (let j = 0; j < 2; j++) { const x = bx + qx * i * 50 - (qx < 0 ? 44 : 0), y = by + qy * j * 50 - (qy < 0 ? 44 : 0); rect(x, y, 44, 44, cols[(i + j + qx + 2) & 3]); rect(x + 4, y + 4, 36, 36, lit(C(cols[(i + j + qx + 2) & 3]), .25)); circ(x + 22, y + 22, 8, '#8acad8'); if ((i + j) % 2) mushroomTop(x + 10, y + 10); } }
  // 车：顶上带心
  for (let i = 0; i < 4; i++) { const a = lt * 1.2 + i * 1.57; const x = cx + Math.cos(a) * 42, y = cy + Math.sin(a) * 42; rect(x - 5, y - 3, 10, 6, '#141418'); foilHeart(x, y, 4, ['#ff9ab8', '#8ac8ff', '#ffd84a', '#e8e8f0'][i], { string: false }); }
  bloom(.6, 3, .95); vignette(.3);
}
function mushroomTop(x, y) { circ(x, y, 7, '#ff8a6a'); for (let a = 0; a < 6.28; a += 1.3) px(x + Math.cos(a) * 4, y + Math.sin(a) * 4, '#ffffff'); }
function shDecoPlaza(lt, d) {
  sky([[0, '#6a90d8'], [.6, '#ffc8a8'], [1, '#ffe0c0']], 0, 130);
  // 远处的高塔
  poly([236, 30, 244, 30, 256, 130, 224, 130], '#f0c0c8'); rect(230, 60, 20, 4, '#ffffff'); rect(226, 90, 28, 4, '#ffffff');
  for (const sd of [-1, 1]) for (let i = 0; i < 3; i++) decoBuilding(240 + sd * (60 + i * 70) - 30, 140, 60, 50 + i * 16, ['#f6c8c0', '#bfe6d8', '#fbe4c8'][i], { port: i % 2 });
  vgrad(0, 130, W, H - 130, [[0, '#d8c0b0'], [1, '#f0dccc']], 5);
  // 一排喷泉
  for (let i = 0; i < 7; i++) { const x = 60 + i * 60, y = 200 + Math.abs(i - 3) * 6, hgt = 36 + (i % 2) * 18 + Math.sin(lt * 6 + i) * 3; ell(x, y, 16, 5, '#a8c8e0'); ell(x, y - 1, 12, 3, '#d8f0ff');
    for (let yy = 0; yy < hgt; yy++) { const w = 2 + (yy / hgt) * 3; rect(x - w / 2, y - yy, w, 1, yy % 4 ? '#f4fbff' : '#cfe8fa', .9); }
    for (let k = 0; k < 18; k++) { const t = ((lt * 1.2 + k / 18) % 1), a = k / 18 * 6.28; px(x + Math.cos(a) * t * 12, y - hgt + t * t * hgt * .8, '#ffffff', 1 - t); } }
  bloom(.7, 3, .93); vignette(.35);
}
function shCityView(lt, d) {
  sky([[0, '#7aa0e0'], [.6, '#ffd0b8'], [1, '#ffe8d0']], 0, 110);
  vgrad(0, 100, W, 50, [[0, '#f8d8c8'], [1, '#ecd4c4']], 4);
  // 远处的楼群
  const r = rng(581); for (let i = 0; i < 30; i++) { const x = r() * W, w = 14 + r() * 26, h = 20 + r() * 50; rect(x, 110 - h, w, h + 40, ['#f6c8c0', '#bfe6d8', '#fbe4c8', '#f4d0e0', '#e8e4f4'][i % 5]); for (let k = 0; k < h / 8; k++) rect(x + 2, 112 - h + k * 8, w - 4, 2, '#ffffff', .5); }
  vgrad(0, 140, W, H - 140, [[0, '#e8d0c0'], [1, '#c8b0a0']], 5);
  // 高架路
  poly([0, 190, W, 160, W, 172, 0, 204], '#e8e0e8'); line(0, 190, W, 160, '#ffffff', 1, 2); for (let x = 20; x < W; x += 60) rect(x, 196 - x * .06, 6, 80, '#d8d0d8');
  const cx = (lt * 160) % 560 - 40; rect(cx - 8, 182 - cx * .06, 16, 8, '#141418'); foilHeart(cx, 172 - cx * .06, 5, '#8ac8ff', { string: false });
  // 前景一朵大花
  const fx = 400, fy = 250; for (let a = 0; a < 6.28; a += .52) ell(fx + Math.cos(a + lt * .3) * 34, fy + Math.sin(a + lt * .3) * 22, 22, 12, a % 1.04 < .52 ? '#ff9ab0' : '#ffb8c8'); circ(fx, fy, 14, '#ffd870');
  bloom(.7, 3, .93); vignette(.35);
}
function shFrozenFlower(lt, d) {
  vgrad(0, 0, W, H, [[0, '#2a4a8a'], [1, '#6a8ad0']], 8);
  for (let i = 0; i < 10; i++) { const r = rng(590 + i); circ(r() * W, r() * H, 14 + r() * 24, '#8aa8e8', .3); }
  const cx = 230, cy = 140, rot = lt * .2;
  line(cx + 10, cy + 40, cx + 40, H, '#5a8ab0', 1, 4);
  for (let i = 0; i < 7; i++) { const a = rot + i * .9; const px_ = cx + Math.cos(a) * 46, py_ = cy + Math.sin(a) * 38; poly([cx, cy, px_ + Math.cos(a + 1.2) * 30, py_ + Math.sin(a + 1.2) * 20, px_ + Math.cos(a) * 20, py_ + Math.sin(a) * 20, px_ + Math.cos(a - 1.2) * 30, py_ + Math.sin(a - 1.2) * 20], i % 2 ? '#f4a8c8' : '#a8b8ff'); }
  circ(cx, cy, 18, '#ffd070'); circ(cx - 4, cy - 4, 8, '#ffe8a0');
  // 霜和露珠
  for (let i = 0; i < 300; i++) { const r = rng(600 + i); const a = r() * 6.28, rr = r() * 80; px(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .8, '#ffffff', .6); }
  for (const [x, y, s] of [[320, 80, 6], [360, 160, 9], [140, 70, 5], [300, 220, 7]]) { circ(x, y, s, '#c8e0ff', .8); px(x - s * .3, y - s * .4, '#ffffff'); }
  bloom(.9, 3, .88); vignette(.4);
}
function shArchStreet(lt, d) {
  decoStreet(lt, 110, { seed: 611 });
  // 远处的拱门
  const ax = 240, ay = 118, aw = 120, ah = 96;
  rect(ax - aw / 2, ay - ah, aw, ah, '#f6e6d6'); rect(ax - aw / 2, ay - ah, aw, 6, '#ffffff'); rect(ax - aw / 2 - 4, ay - ah - 6, aw + 8, 6, '#e8d4c0');
  rect(ax - 32, ay - 60, 64, 60, '#ffd8c0'); ell(ax, ay - 60, 32, 26, '#ffd8c0'); vgrad(ax - 30, ay - 58, 60, 58, [[0, '#ffe8d0'], [1, '#f8c8b0']], 4);
  for (const sd of [-1, 1]) { rect(ax + sd * 46 - 4, ay - ah + 14, 8, ah - 14, '#ead8c6'); circ(ax + sd * 46, ay - ah + 22, 5, '#bfe6d8'); }
  heart(ax, ay - ah + 16, 7, '#ff9ab8');
  bloom(.7, 3, .93); vignette(.35);
}
function shThreeCars(lt, d) {
  decoStreet(lt, 104, { seed: 621 });
  const k = .9 + lt * .25;
  suvFront(150, 214 + lt * 6, k * .8, { heart: '#8ac8ff', lights: 1 });
  suvFront(330, 214 + lt * 6, k * .8, { heart: '#ffd84a', lights: 1 });
  suvFront(240, 236 + lt * 8, k, { heart: '#ff9ab8', lights: 1 });
  bloom(.8, 3, .92); vignette(.35);
}
function shParked(lt, d) {
  sky([[0, '#e8a8a8'], [.6, '#ffd0b0'], [1, '#ffe8d0']], 0, 150);
  // 圆顶的大楼
  rect(40, 70, 400, 90, '#f4e4d0'); ell(240, 70, 50, 40, '#f0c890'); ell(234, 64, 30, 24, '#ffe0a8'); ell(90, 80, 26, 20, '#f0c890'); ell(390, 80, 26, 20, '#f0c890');
  for (let i = 0; i < 12; i++) { rect(52 + i * 32, 96, 14, 40, '#c8a888'); ell(59 + i * 32, 96, 7, 6, '#c8a888'); }
  vgrad(0, 150, W, H - 150, [[0, '#d8c8c0'], [1, '#c0b0a8']], 5);
  mushroom(450, 200, 30, { cap: '#ff8a6a' });
  suvFront(110, 236, 1.5, { heart: '#ffd84a' }); suvFront(370, 236, 1.5, { heart: '#d8d8e8' }); suvFront(240, 254, 1.9, { heart: '#ff9ab8', lights: 1 });
  bloom(.7, 3, .93); vignette(.35);
}
