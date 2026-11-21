// 《MOONRIDE》像素版：场景里反复用到的东西（天、星星、月亮、云、山、花、车、小马、冰块、心……）
'use strict';

// ---------- 天和星 ----------
function sky(stops, y0, y1, lv) { vgrad(0, y0 || 0, W, (y1 || H) - (y0 || 0), stops, lv || 12); }
function stars(seed, n, x0, y0, x1, y1, t, o) {
  o = o || {}; const r = rng(seed);
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), ph = r() * 6.28, sp = 1 + r() * 3, big = r() < (o.big || .08);
    const tw = .55 + .45 * Math.sin(t * sp + ph);
    const c = o.col ? C(o.col) : (r() < .2 ? [255, 220, 240] : r() < .3 ? [200, 220, 255] : [255, 255, 255]);
    if (big && tw > .6) { px(x, y, c); px(x - 1, y, c, .5); px(x + 1, y, c, .5); px(x, y - 1, c, .5); px(x, y + 1, c, .5); glow(x, y, 2, c, .25); }
    else px(x, y, c, (o.a || 1) * tw * (.4 + r() * .6));
  }
}
function moon(x, y, r, o) {
  o = o || {}; const c = C(o.col || '#fbf6e8'), sh = shade(c, .82);
  halo(x, y, r * 2.6, o.halo || '#9fb4ff', o.ha || .22, 6);
  glow(x, y, r * 1.6, o.gc || [255, 245, 220], o.ga || .55);
  circ(x, y, r, c);
  // 月海
  const rr = rng(o.seed || 3);
  for (let i = 0; i < 7; i++) { const a = rr() * 6.28, d = rr() * r * .6; ell(x + Math.cos(a) * d, y + Math.sin(a) * d, r * (.12 + rr() * .18), r * (.1 + rr() * .14), sh, .75); }
  if (o.crescent) { circ(x + r * .45, y - r * .2, r * .95, o.crescent); }
}
// 一朵积云：几个圆叠起来，上亮下暗
function cloud(x, y, w, h, cols, seed, o) {
  o = o || {}; const r = rng(seed || 1); const n = Math.max(3, Math.round(w / Math.max(4, h * .7)));
  const cs = cols.map(C), a = o.a;
  const puffs = [];
  for (let i = 0; i < n; i++) { const t = (i + .5) / n; const pr = h * (.45 + .55 * Math.sin(t * Math.PI)) * (.75 + r() * .4); puffs.push([x - w / 2 + t * w + (r() - .5) * 4, y - pr * .35, pr]); }
  // 底：最暗
  for (const [px_, py_, pr] of puffs) ell(px_, py_ + pr * .2, pr, pr * .8, cs[0], a);
  for (const [px_, py_, pr] of puffs) ell(px_, py_, pr * .92, pr * .74, cs[1], a);
  for (const [px_, py_, pr] of puffs) ell(px_ - pr * .15, py_ - pr * .22, pr * .62, pr * .46, cs[2], a);
  if (cs[3]) for (const [px_, py_, pr] of puffs) ell(px_ - pr * .25, py_ - pr * .38, pr * .28, pr * .18, cs[3], a);
  rect(x - w / 2 - 2, y + h * .1, w + 4, h * .35, cs[0], a === undefined ? 1 : a);
}
// 一层起伏的山（剪影 + 顶上一道亮边）
function hills(seed, baseY, amp, freq, col, o) {
  o = o || {}; const c = C(col), rim = o.rim ? C(o.rim) : null, off = o.off || 0;
  for (let x = 0; x < W; x++) {
    const xx = x + off;
    const hgt = baseY - amp * (vnoise(xx * freq, seed) * .7 + vnoise(xx * freq * 3.1, seed + 9) * .3);
    const y0 = Math.round(hgt);
    if (o.grad) for (let y = y0; y < (o.bottom || H); y++) { const k = sat((y - y0) / (o.grad)); pp(x + OX, y + OY, mixc(c, o.dark || shade(c, .6), Math.floor(k * 5 + bay(x, y)) / 5)); }
    else for (let y = y0; y < (o.bottom || H); y++) pp(x + OX, y + OY, c);
    if (rim) pp(x + OX, y0 + OY, rim);
  }
}
function hillY(seed, baseY, amp, freq, x) { return baseY - amp * (vnoise(x * freq, seed) * .7 + vnoise(x * freq * 3.1, seed + 9) * .3); }

// ---------- 地上的东西 ----------
// 一片花草：每根茎随风摆，顶上一朵小花
function meadow(seed, n, x0, x1, yTop, yBot, t, o) {
  o = o || {}; const r = rng(seed); const cols = (o.cols || ['#f6d76a', '#f08aa8', '#ffffff', '#b89af0']).map(C);
  const stem = C(o.stem || '#3e6a3a'), arr = [];
  for (let i = 0; i < n; i++) arr.push([x0 + r() * (x1 - x0), yTop + Math.pow(r(), .8) * (yBot - yTop), r(), r(), r()]);
  arr.sort((p, q) => p[1] - q[1]);
  for (const [x, y, a, b, cc] of arr) {
    const depth = (y - yTop) / (yBot - yTop + 1), hgt = (3 + depth * (o.h || 14)) * (.6 + a * .6);
    const sw = Math.sin(t * (1.2 + b) + x * .05) * (1 + depth * 2) * (o.wind === undefined ? 1 : o.wind);
    line(x, y, x + sw, y - hgt, shade(stem, .7 + depth * .4));
    const fc = cols[Math.floor(cc * cols.length)];
    const fs = depth > .6 ? 2 : 1;
    if (o.lav) { for (let k = 0; k < 3 + depth * 3; k++) px(x + sw * (1 - k * .1) + (k % 2), y - hgt + k, k % 2 ? fc : lit(fc, .25)); }
    else { rect(x + sw - (fs > 1 ? 1 : 0), y - hgt - (fs > 1 ? 1 : 0), fs, fs, fc); if (fs > 1) px(x + sw, y - hgt - 2, lit(fc, .4)); }
  }
}
// 一片草叶
function grass(seed, n, x0, x1, y0, y1, t, col, o) {
  o = o || {}; const r = rng(seed), c = C(col);
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), hgt = (o.h || 5) * (.5 + r());
    const sw = Math.sin(t * 1.5 + x * .08 + r()) * (o.wind || 1);
    line(x, y, x + sw, y - hgt, r() < .3 ? lit(c, .2) : r() < .5 ? shade(c, .8) : c);
  }
}

// ---------- 粒子 ----------
function snow(seed, n, t, o) {
  o = o || {}; const r = rng(seed); const c = C(o.col || '#ffffff');
  for (let i = 0; i < n; i++) {
    const sp = 8 + r() * 18, x0 = r() * (W + 40), y0 = r() * H, big = r() < .25;
    const y = ((y0 + t * sp * (o.sp || 1)) % (H + 10)) - 5, x = ((x0 + Math.sin(t * .8 + i) * 6 + t * (o.wind || 4)) % (W + 40)) - 20;
    if (big) { rect(x, y, 2, 2, c, o.a || .9); glow(x + 1, y + 1, 2, c, .2); } else px(x, y, c, (o.a || .9) * .8);
  }
}
function sparkles(seed, n, x0, y0, x1, y1, t, o) {
  o = o || {}; const r = rng(seed); const c = C(o.col || '#fff4d0');
  for (let i = 0; i < n; i++) {
    const x = x0 + r() * (x1 - x0), y = y0 + r() * (y1 - y0), ph = r(), sp = .8 + r() * 1.6;
    const k = (t * sp + ph) % 1; const a = Math.sin(k * Math.PI);
    if (a < .3) continue;
    const yy = y - k * (o.rise || 0);
    px(x, yy, c, a);
    if (a > .75) { px(x - 1, yy, c, a * .5); px(x + 1, yy, c, a * .5); px(x, yy - 1, c, a * .5); px(x, yy + 1, c, a * .5); }
    glow(x, yy, 2, c, a * .25);
  }
}
function fireflies(seed, n, x0, y0, x1, y1, t, col) {
  const r = rng(seed), c = C(col || '#ffe9a0');
  for (let i = 0; i < n; i++) {
    const x = x0 + (r() * (x1 - x0) + Math.sin(t * (.4 + r() * .5) + i) * 12), y = y0 + (r() * (y1 - y0) + Math.cos(t * (.3 + r() * .4) + i * 2) * 8);
    const a = .5 + .5 * Math.sin(t * 3 + i * 1.7); if (a < .2) continue;
    px(x, y, c, a); glow(x, y, 3, c, a * .5);
  }
}
function petals(seed, n, t, cols, o) {
  o = o || {}; const r = rng(seed); const cs = (cols || ['#ffc2d4', '#ffe0ea']).map(C);
  for (let i = 0; i < n; i++) {
    const sp = 14 + r() * 16, x0 = r() * (W + 60), y0 = r() * H;
    const y = ((y0 + t * sp) % (H + 20)) - 10, x = ((x0 - t * (o.wind || 18) + Math.sin(t * 2 + i) * 5) % (W + 60) + W + 60) % (W + 60) - 30;
    const c = cs[i % cs.length]; const fl = Math.sin(t * 5 + i) > 0;
    rect(x, y, fl ? 2 : 1, fl ? 1 : 2, c);
  }
}

// ---------- 心 ----------
// 锡箔心形气球：主体 + 高光 + 绳子
function foilHeart(x, y, s, col, o) {
  o = o || {}; const c = C(col), d = shade(c, .55), l = lit(c, .45);
  if (o.string !== false) { const sl = o.sl || s * 2.5; for (let k = 0; k < sl; k++) px(x + Math.sin(k * .25 + (o.t || 0) * 2) * 1.2, y + s * .95 + k, '#e8e4f0', .8); }
  heart(x, y, s, d); heart(x - s * .06, y - s * .06, s * .88, c);
  heart(x - s * .3, y - s * .32, s * .32, l); px(x - s * .45, y - s * .5, '#ffffff'); px(x - s * .4, y - s * .55, '#ffffff');
  ell(x + s * .4, y + s * .05, s * .12, s * .25, lit(c, .2), .6);
  if (o.glow) glow(x, y, s * 1.2, c, o.glow);
}
// 毛绒心：边缘毛茸茸（按角度抖一抖）
function plushHeart(x, y, s, col, o) {
  o = o || {}; const c = C(col), d = shade(c, .62), l = lit(c, .3);
  const R = Math.ceil(s * 1.4);
  for (let yy = -R; yy <= R; yy++) for (let xx = -R; xx <= R; xx++) {
    const u = (xx + .5) / s, v = (yy + .5) / s;
    const fuzz = (h2(xx + Math.round(x), yy + Math.round(y), 5) - .5) * (s > 30 ? .1 : .2);
    if (!inHeart(u * (1 - fuzz), v * (1 - fuzz))) continue;
    let cc = c;
    const shadeK = u * .5 + v * .7 + (bay(xx & 3, yy & 3) - .5) * .18;
    if (shadeK > .45) cc = d; else if (shadeK < -.42) cc = l;
    if (h2(xx, yy, 9) > .96) cc = shadeK > .2 ? shade(c, .75) : lit(c, .15);
    px(x + xx, y + yy, cc, o.a);
  }
}

// ---------- 车（黑色 SUV） ----------
// 侧面：朝 dir，x 是车身中心，y 是轮子着地的线，k 是倍数（1 = 车长 96 像素）
function suvSide(x, y, k, o) {
  o = o || {}; const dir = o.dir || 1; const X = u => x + u * k * dir, Y = v => y + v * k;
  const body = C(o.col || '#15161d'), bodyL = lit(body, .12), glass = C(o.glass || '#24304a'), trim = C('#2c2e38');
  // 车身
  poly([X(-48), Y(-12), X(-46), Y(-26), X(-30), Y(-29), X(-22), Y(-44), X(20), Y(-45), X(34), Y(-30), X(46), Y(-27), X(49), Y(-14), X(48), Y(-6), X(-48), Y(-6)], body);
  poly([X(-46), Y(-27), X(-30), Y(-29), X(30), Y(-30), X(46), Y(-27), X(46), Y(-25), X(-46), Y(-25)], bodyL);
  // 车窗
  if (!o.noWin) {
    poly([X(-27), Y(-29.5), X(-20), Y(-42), X(-2), Y(-42.5), X(-2), Y(-29.5)], glass);
    poly([X(1), Y(-29.5), X(1), Y(-42.5), X(18), Y(-43), X(29), Y(-30)], glass);
    line(X(-19), Y(-40), X(-6), Y(-40.5), lit(glass, .25)); line(X(4), Y(-40.5), X(15), Y(-41), lit(glass, .25));
  }
  // 腰线、门缝、把手
  line(X(-46), Y(-17), X(48), Y(-17), bodyL); line(X(0), Y(-29), X(0), Y(-8), trim); line(X(-26), Y(-29), X(-26), Y(-8), trim);
  rect(Math.min(X(6), X(10)), Y(-23), 4 * k, 1, lit(body, .25)); rect(Math.min(X(-20), X(-16)), Y(-23), 4 * k, 1, lit(body, .25));
  // 灯
  rect(Math.min(X(44), X(48)), Y(-24), 4 * k, 2 * k, o.lights ? '#fff6d8' : '#c8ccd8'); if (o.lights) glow(X(48), Y(-23), 6 * k, [255, 240, 200], .4);
  rect(Math.min(X(-48), X(-45)), Y(-24), 3 * k, 2 * k, '#c0303a'); if (o.lights) glow(X(-48), Y(-23), 5 * k, [255, 60, 60], .5);
  // 轮子
  for (const wx of [-30, 31]) {
    circ(X(wx), Y(-6), 9 * k, '#0a0a0e'); circ(X(wx), Y(-6), 6 * k, '#3c3f4a'); circ(X(wx), Y(-6), 3.5 * k, '#7a7e8c');
    const a = (o.spin || 0); for (let i = 0; i < 5; i++) { const aa = a + i * 1.2566; line(X(wx), Y(-6), X(wx) + Math.cos(aa) * 5.5 * k, Y(-6) + Math.sin(aa) * 5.5 * k, '#22242c'); }
    circ(X(wx), Y(-6), 1.2 * k, '#c8ccd8');
  }
  // 车顶的心形气球
  if (o.heart) { line(X(0), Y(-45), X(0), Y(-52), '#d8d0e0'); foilHeart(X(0), Y(-62), 11 * k, o.heart, { string: false, glow: .3 }); }
}
// 正面：x 中心，y 着地，k 倍（1 = 宽 64）
function suvFront(x, y, k, o) {
  o = o || {}; const X = u => x + u * k, Y = v => y + v * k;
  const body = C(o.col || '#15161d'), bl = lit(body, .14), glass = C('#1f2a40');
  poly([X(-30), Y(-6), X(-31), Y(-22), X(-28), Y(-30), X(-22), Y(-48), X(22), Y(-48), X(28), Y(-30), X(31), Y(-22), X(30), Y(-6)], body);
  poly([X(-20), Y(-46), X(20), Y(-46), X(25), Y(-32), X(-25), Y(-32)], glass);
  line(X(-16), Y(-44), X(-6), Y(-44), lit(glass, .3));
  rect(X(-27), Y(-30), 54 * k, 2 * k, bl);
  // 格栅、灯带
  rect(X(-16), Y(-24), 32 * k, 9 * k, '#0b0b10'); for (let i = 0; i < 6; i++) line(X(-15 + i * 6), Y(-23), X(-13 + i * 6), Y(-16), '#2a2c36');
  const lc = o.lights ? '#ffffff' : '#c9d0e0';
  line(X(-28), Y(-27), X(-17), Y(-26), lc, 1, Math.max(1, Math.round(k))); line(X(17), Y(-26), X(28), Y(-27), lc, 1, Math.max(1, Math.round(k)));
  if (o.lights) { glow(X(-24), Y(-26), 6 * k, [255, 250, 235], .35); glow(X(24), Y(-26), 6 * k, [255, 250, 235], .35); }
  rect(X(-8), Y(-13), 16 * k, 4 * k, '#dcdde6'); // 车牌（空白）
  // 轮子
  rect(X(-30), Y(-8), 8 * k, 8 * k, '#09090c'); rect(X(22), Y(-8), 8 * k, 8 * k, '#09090c');
  // 后视镜
  rect(X(-35), Y(-36), 6 * k, 4 * k, body); rect(X(29), Y(-36), 6 * k, 4 * k, body);
  if (o.heart) { line(X(0), Y(-48), X(0), Y(-55), '#d8d0e0'); foilHeart(X(0), Y(-68), 14 * k, o.heart, { string: false, glow: .35 }); }
}

// ---------- 远处的马（剪影） ----------
function horseSil(x, y, k, col, ph) {
  const c = C(col); const X = u => x + u * k, Y = v => y + v * k;
  ell(X(0), Y(-7), 6 * k, 3 * k, c);                     // 身子
  poly([X(4), Y(-9), X(8), Y(-15), X(10), Y(-14), X(7), Y(-7)], c); // 脖子
  ell(X(9.5), Y(-14.5), 2.2 * k, 1.4 * k, c);            // 头
  const l = Math.sin(ph || 0) * 1.5;
  for (const [lx, s] of [[-4, 1], [-2.5, -1], [3, 1], [4.5, -1]]) line(X(lx), Y(-5), X(lx + l * s * .5), Y(0), c, 1, Math.max(1, Math.round(k)));
  line(X(-6), Y(-8), X(-8), Y(-3), c);                    // 尾巴
}

// ---------- 毛绒小马（白身子、粉鬃毛、身上印着花、胸口一颗红心） ----------
// 侧面朝 dir，(x, y) 是脚底中间，k 倍（1 = 身长约 24）；o.run 跑步的相位，o.jump 起跳
function pony(x, y, k, o) {
  o = o || {}; const dir = o.dir || 1;
  const L = layer(Math.ceil(44 * k) + 6, Math.ceil(40 * k) + 6); const ox = L.w / 2, oy = L.h - 3;
  const body = C(o.col || '#fbf6f4'), bodyS = C('#e6dcde'), mane = C(o.mane || '#f49ab8'), maneD = C('#d8709a'), maneL = C('#ffd0e0');
  onLayer(L, () => {
    const X = u => ox + u * k, Y = v => oy + v * k;
    const ph = o.run || 0, run = o.run !== undefined;
    const legA = run ? Math.sin(ph) * .7 : 0;
    // 后面的两条腿
    const leg = (hx, hy, a, col) => { const fx = hx + Math.sin(a) * 8, fy = hy + Math.cos(a) * 8; thick(X(hx), Y(hy), X(fx), Y(fy), Math.max(1.2, 2.2 * k), col); ell(X(fx), Y(fy) , 2.2 * k, 1.4 * k, '#e9c8d4'); };
    leg(-7, -9, -legA * .8, bodyS); leg(6, -9, legA * .8, bodyS);
    // 尾巴
    const tw = Math.sin((o.t || 0) * 6) * 1.5;
    for (let i = 0; i < 5; i++) ell(X(-12 - i * 1.6), Y(-13 + i * 1.1 + tw * i * .2), (2.6 - i * .3) * k, (2.2 - i * .2) * k, i % 2 ? maneD : mane);
    // 身子
    ell(X(0), Y(-13), 11 * k, 6.5 * k, body);
    ell(X(0), Y(-10.5), 9 * k, 3 * k, bodyS);
    // 印花
    const fl = [[-5, -14, '#c9a6f0'], [2, -16, '#f6c86a'], [6, -12, '#9cc8f8'], [-2, -11, '#f6a0b4'], [-8, -11, '#9ad6a8']];
    for (const [fx, fy, fc] of fl) { const cc = C(fc); px(X(fx), Y(fy), cc); px(X(fx) + 1, Y(fy), cc); px(X(fx), Y(fy) + 1, cc); px(X(fx) - 1, Y(fy), cc); px(X(fx), Y(fy) - 1, cc); if (k >= 2) circ(X(fx), Y(fy), k * 1.2, cc); }
    // 前面的两条腿
    leg(-5, -9, legA, body); leg(8, -9, -legA, body);
    // 脖子和头
    poly([X(5), Y(-16), X(10), Y(-24), X(14), Y(-22), X(11), Y(-12)], body);
    ell(X(14), Y(-24), 5 * k, 4.2 * k, body);
    ell(X(17.5), Y(-22), 3 * k, 2.6 * k, '#f6d6de');        // 鼻子
    px(X(18.5), Y(-22.5), '#c07a90');
    // 眼睛
    rect(X(14.5), Y(-26), Math.max(1, 1.4 * k), Math.max(1, 1.8 * k), '#2a1a2a'); if (k >= 1.5) px(X(14.5), Y(-26), '#ffffff');
    // 耳朵
    tri(X(11), Y(-27), X(12.5), Y(-32), X(14), Y(-27.5), body); tri(X(11.8), Y(-28), X(12.5), Y(-30.5), X(13.3), Y(-28), '#f2b6c8');
    // 鬃毛
    for (let i = 0; i < 6; i++) ell(X(11 - i * 1.6), Y(-28 + i * 2.4), 2.8 * k, 2.2 * k, i % 2 ? mane : maneL);
    ell(X(14.5), Y(-29), 2.4 * k, 1.8 * k, mane);
    // 胸口的红心
    heart(X(9.5), Y(-15), 2.6 * k, '#e8283c'); px(X(9), Y(-16), '#ff9aa0');
    // 缰绳
    if (o.bridle) { line(X(11), Y(-23), X(18), Y(-20), '#e86090'); }
  });
  outline(L, '#5a4050');
  if (o.amb) layerTint(L, o.amb[0], o.amb[1], o.amb[2]);
  comp(L, x - ox, y - oy - (o.jump || 0), { flip: dir < 0, a: o.a });
  free(L);
}

// ---------- 冰块 ----------
// 先画里面的东西（inner 回调，画在离屏层上），再盖一层半透明的冰、亮边、裂纹
function iceBlock(x, y, w, h, o) {
  o = o || {}; const L = layer(Math.ceil(w) + 2, Math.ceil(h) + 2);
  const tint = C(o.tint || '#cfe4ff');
  onLayer(L, () => {
    // 背后透过来的颜色
    vgrad(0, 0, w, h, o.bg || [[0, '#8c9ad8'], [1, '#c8b2e8']], 8);
    if (o.inner) o.inner(L);
  });
  // 冰的雾：往冰的颜色拉
  layerTint(L, tint, o.frost === undefined ? .45 : o.frost);
  onLayer(L, () => {
    // 冰里的斑点、霜
    const r = rng(o.seed || 7);
    for (let i = 0; i < w * h / 30; i++) px(r() * w, r() * h, lit(tint, .5), .5 + r() * .4);
    // 裂纹
    for (let i = 0; i < (o.cracks || 3); i++) { let cx = r() * w, cy = r() * h; for (let s = 0; s < 6; s++) { const nx = cx + (r() - .5) * 14, ny = cy + (r() - .3) * 10; line(cx, cy, nx, ny, '#ffffff', .7); cx = nx; cy = ny; } }
    // 亮边（左上）和暗边（右下）
    rect(0, 0, w, 2, '#ffffff', .85); rect(0, 0, 2, h, '#ffffff', .7); rect(w - 2, 0, 2, h, shade(tint, .7), .8); rect(0, h - 2, w, 2, shade(tint, .7), .8);
    // 斜着的反光
    for (let k = 0; k < 2; k++) { const x0 = w * (.15 + k * .45); poly([x0, 0, x0 + w * .12, 0, x0 + w * .12 - h * .35, h, x0 - h * .35, h], '#ffffff', .18); }
  });
  comp(L, x, y, { a: o.a === undefined ? .97 : o.a });
  free(L);
  if (o.glow) glowRect(x, y, w, h, tint, o.glow);
}

// ---------- 门 ----------
function door(x, y, w, h, col, o) { // (x,y) 左上
  o = o || {}; const c = C(col), d = shade(c, .7), l = lit(c, .3);
  rect(x - 2, y - 2, w + 4, h + 2, lit(c, .5));            // 门框
  if (o.open) { rect(x, y, w, h, o.inside || '#fff4d8'); if (o.light) glowRect(x, y, w, h, [255, 230, 180], o.light); const ow = w * o.open; rect(x, y, Math.max(2, w * .35 * (1 - o.open) + 3), h, d); }
  else {
    rect(x, y, w, h, c);
    rect(x + w * .15, y + h * .08, w * .7, h * .36, d); rect(x + w * .18, y + h * .1, w * .64, h * .32, c);
    rect(x + w * .15, y + h * .52, w * .7, h * .4, d); rect(x + w * .18, y + h * .54, w * .64, h * .36, c);
    rect(x + w * .8, y + h * .48, 2, 2, '#f2d27a');
    if (o.window) rect(x + w * .25, y + h * .14, w * .5, h * .22, o.window);
  }
  rect(x, y, w, 1, l);
}

// ---------- 蘑菇 ----------
function mushroom(x, y, s, o) { // (x,y) 柄的底；s = 伞盖半宽
  o = o || {}; const cap = C(o.cap || '#d8283a'), capD = shade(cap, .65), stem = C(o.stem || '#f4e8d8');
  poly([x - s * .28, y, x + s * .28, y, x + s * .2, y - s * .8, x - s * .2, y - s * .8], stem);
  rect(x - s * .28, y - s * .25, s * .56, s * .2, shade(stem, .85));
  ell(x, y - s * .85, s, s * .62, capD); ell(x - s * .05, y - s * .95, s * .95, s * .52, cap);
  rect(x - s, y - s * .85, s * 2, s * .3, capD);
  const r = rng(o.seed || 5); for (let i = 0; i < 7; i++) { const a = r() * Math.PI, d = r() * .8; ell(x + Math.cos(a) * d * s * .85, y - s * .95 - Math.sin(a) * d * s * .4, s * .1 + 1, s * .07 + 1, '#fff6ee'); }
  ell(x - s * .4, y - s * 1.2, s * .25, s * .1, lit(cap, .35));
}

// 一团毛茸茸的灌木 / 花丛
function bush(x, y, s, cols, seed) {
  const cs = cols.map(C), r = rng(seed || 1); const n = 4 + Math.floor(s / 4);
  const pts = []; for (let i = 0; i < n; i++) { const a = Math.PI * (.05 + .9 * i / (n - 1)); pts.push([x + Math.cos(a) * s * (.9 + r() * .2), y - Math.sin(a) * s * .55 * (.8 + r() * .4), s * (.32 + r() * .14)]); }
  pts.push([x, y - s * .45, s * .5]);
  for (const [px_, py_, pr] of pts) circ(px_, py_ + pr * .25, pr, cs[0]);
  for (const [px_, py_, pr] of pts) circ(px_ - pr * .1, py_, pr * .85, cs[1]);
  for (const [px_, py_, pr] of pts) circ(px_ - pr * .25, py_ - pr * .3, pr * .45, cs[2]);
  rect(x - s, y - 1, s * 2, 2, cs[0]);
  for (let i = 0; i < s; i++) px(x + (r() - .5) * s * 1.8, y - r() * s * .8, r() < .5 ? cs[2] : (cs[3] || cs[2]));
}

// 焦外的花园：大块柔和的绿、光斑，给近景的人当背景
function bokehGarden(lt, o) {
  o = o || {};
  sky(o.sky || [[0, '#f4d0b0'], [.5, '#fbe2c4'], [1, '#e8d0a8']]);
  const r = rng(o.seed || 1);
  for (let i = 0; i < 14; i++) { const x = r() * W, y = 60 + r() * 180, s = 30 + r() * 40, c = r() < .5 ? '#7aa060' : '#94b878'; ell(x, y, s, s * .8, c, .9); ell(x - s * .2, y - s * .2, s * .6, s * .5, lit(C(c), .12), .7); }
  if (o.heart) { heart(o.heart[0], o.heart[1], o.heart[2], '#6a9050', .9); heart(o.heart[0] - 3, o.heart[1] - 3, o.heart[2] * .8, '#86aa68', .8); }
  for (let i = 0; i < 24; i++) { const x = r() * W, y = r() * H, s = 4 + r() * 9, c = ['#fff4d8', '#ffd8e4', '#ffe8b0', '#ffffff'][i % 4], a = .25 + .2 * Math.sin(lt * 2 + i); circ(x, y, s, c, a); ring(x, y, s, 1, c, a * .8); }
  const fl = ['#ff9ab8', '#ffffff', '#c8a0f0', '#ffb070'];
  for (let i = 0; i < 40; i++) { const x = r() * W, y = 200 + r() * 70; circ(x, y, 3 + r() * 4, fl[i % 4], .6); }
}
// 白色的心形石栏
function heartRail(y, s, n, x0, dx) { for (let i = 0; i < n; i++) { const x = x0 + i * dx; heart(x, y, s, '#e8dccc'); heart(x - 1, y - 1, s * .82, '#fbf4ea'); heart(x, y + s * .05, s * .45, '#d8ccbc'); } rect(x0 - dx, y + s * .8, dx * (n + 1), 6, '#e8dccc'); }
