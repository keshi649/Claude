'use strict';
/* world.js：场景零件（全部按像素画在 PB 上）。
   天空、星星、月亮、云、远山、雾、水面倒影、中式屋顶（飞檐翘角）、楼阁（西窗）、粉墙黛瓦、灯笼、梅树、柳树、石桥、
   鸳鸯、马、花瓣 / 雪 / 萤火虫，屋里的桌子、蜡烛、砚台、古琴。
   颜色按时间和季节分成几套（PAL）：夜、灯会夜、春日、雪夜、回忆（暖褐）、水墨。 */

const PAL = {
  night: {
    sky: ['#0B0C26', '#121640', '#1C2156', '#2B2E6C', '#433F82'], star: '#FFF6D8', moon: '#FFF2C8', moonD: '#E8D79E', halo: '#3A3C80',
    mtn: ['#2A2C63', '#232552', '#1B1C42'], mist: '#4A4C8C',
    wall: '#8A8EC4', wallD: '#6E71A6', tile: '#1D1B36', tileL: '#4B4B85', roof: '#1E1C38', roofL: '#4A4A82', eave: '#5A5A96',
    pillar: '#7A2630', pillarD: '#561A24', wood: '#4A2A36', woodL: '#6A3A44', stone: '#4A4C7C', stoneD: '#36385E',
    paper: '#FFCE7A', paperD: '#E89A4A', lat: '#5A2A20', water: '#141A44', waterL: '#2E3878', waterH: '#7C86D6',
    trunk: '#2A1A2C', trunkL: '#4A3048', bloom: '#F6B6CC', bloomL: '#FFE6EF', leaf: '#2E4A5A', ground: '#23244A', groundL: '#30326A',
  },
  spring: {
    sky: ['#7EC3EE', '#9CD3F2', '#BCE2F6', '#DDF0FA', '#F4FAFD'], star: '#FFFFFF', moon: '#FFFFFF', moonD: '#EEEEEE', halo: '#CDE8F8',
    mtn: ['#9CC7D9', '#86B6CB', '#6FA3BA'], mist: '#E8F4FA',
    wall: '#F4F1EA', wallD: '#D9D4C8', tile: '#3F4A5E', tileL: '#6C7A92', roof: '#3E4860', roofL: '#7684A0', eave: '#8E9AB4',
    pillar: '#B3263A', pillarD: '#86182A', wood: '#7A3A2A', woodL: '#9A5A3A', stone: '#A9A9A2', stoneD: '#87877F',
    paper: '#FFF4DC', paperD: '#E9D6B0', lat: '#7A3A2A', water: '#5BA7C9', waterL: '#8CCBE4', waterH: '#E4F6FF',
    trunk: '#4A3028', trunkL: '#6A4A38', bloom: '#F7B3C9', bloomL: '#FFFFFF', leaf: '#7CC46E', ground: '#8CC66F', groundL: '#A6D884',
  },
  snow: {
    sky: ['#1A2246', '#26305C', '#34416F', '#4A5884', '#66749C'], star: '#FFFFFF', moon: '#F4F1E6', moonD: '#D8D4C6', halo: '#4C5A88',
    mtn: ['#5A6A98', '#4A5A88', '#3C4A76'], mist: '#8A98C4',
    wall: '#B9C2E2', wallD: '#97A1C8', tile: '#2A2E4A', tileL: '#F2F5FF', roof: '#2C3050', roofL: '#EEF2FF', eave: '#C9D2EE',
    pillar: '#7A2630', pillarD: '#561A24', wood: '#4A2A36', woodL: '#6A3A44', stone: '#6A7298', stoneD: '#50587C',
    paper: '#FFCE7A', paperD: '#E89A4A', lat: '#5A2A20', water: '#1E2850', waterL: '#3A4884', waterH: '#9AA8E0',
    trunk: '#2E2030', trunkL: '#4E3A4E', bloom: '#E8405A', bloomL: '#FF9AAE', leaf: '#2E4A5A', ground: '#E6EBFA', groundL: '#FFFFFF',
  },
};
PAL.fest = Object.assign({}, PAL.night, { sky: ['#140A2A', '#22103C', '#341650', '#4A1E5C', '#6A2A5E'], mist: '#6A3A6E', halo: '#5A3070' });

/* ---------------- 天空、星、月、云 ---------------- */
function skyFill(g, cols, x = 0, y = 0, w = g.w, h = g.h) {
  const L = layer('sky' + cols.join() + w + 'x' + h, w, h, p => p.vgrad(0, 0, w, h, cols));
  g.blit(L, x, y);
}
function stars(g, t, seed, n, x0 = 0, y0 = 0, w = g.w, h = g.h * .5, col = '#FFF6D8') {
  for (let i = 0; i < n; i++) {
    const x = x0 + h2(i, seed) * w, y = y0 + Math.pow(h2(i, seed + 1), 1.4) * h;
    const tw = Math.sin(t * (1.5 + 2 * h2(i, seed + 2)) + i) * .5 + .5;
    if (tw < .25) continue;
    g.px(x, y, col);
    if (h2(i, seed + 3) > .86 && tw > .7) { g.px(x - 1, y, col); g.px(x + 1, y, col); g.px(x, y - 1, col); g.px(x, y + 1, col); }
  }
}
function moonDisc(g, cx, cy, r, P, o = {}) {
  // 光晕：几圈抖动
  if (o.halo !== false) for (let i = 4; i >= 1; i--) g.discD(cx, cy, r + i * r * .28, P.halo, .14 * (5 - i));
  g.disc(cx, cy, r, P.moon);
  // 月面的暗斑
  const sp = [[-.35, -.2, .22], [.25, .15, .28], [-.05, .45, .16], [.4, -.35, .12]];
  for (const [dx, dy, rr] of sp) g.discD(cx + dx * r, cy + dy * r, rr * r, P.moonD, .5);
  if (o.crescent) g.disc(cx + r * .45, cy - r * .2, r * .92, o.crescent);
}
/* 一朵像素云：几个椭圆叠起来，底下一条暗边 */
function cloud(g, x, y, w, col, colD, seed = 0, lv = 1) {
  const n = 3 + Math.floor(w / 18);
  for (let i = 0; i < n; i++) {
    const f = i / (n - 1), cx = x + f * w, rr = (w / n) * (.7 + .6 * Math.sin(f * Math.PI)) * (.8 + .4 * h2(i, seed));
    g.ellD(cx, y - rr * .35, rr, rr * .62, col, lv);
  }
  g.rectD(x - w * .05, y, w * 1.1, 2, colD, lv);
}
/* 祥云纹：中国式的卷云（装饰边框、回忆画框用） */
function xiangyun(g, x, y, s, col) {
  g.ring(x, y, 3 * s, col, s); g.ring(x + 5 * s, y + 1 * s, 2 * s, col, s); g.ring(x - 5 * s, y + 1 * s, 2 * s, col, s);
  g.rect(x - 8 * s, y + 3 * s, 16 * s, s, col);
}

/* ---------------- 远山、雾 ---------------- */
function ridge(g, seed, baseY, amp, freq, col, x0 = 0, w = g.w, lv = 1) {
  for (let x = 0; x < w; x++) {
    const X = x + x0;
    const v = noise1(X * freq, seed) * .65 + noise1(X * freq * 2.7, seed + 9) * .25 + noise1(X * freq * 7, seed + 3) * .1;
    const top = Math.round(baseY - v * amp);
    for (let y = top; y < g.h; y++) { if (lv >= 1 || bay(x, y) < lv) g.px(x, y, col); }
  }
}
function mist(g, y, h, col, lv = .3, x0 = 0, w = g.w) {
  for (let j = 0; j < h; j++) g.hlD(x0, x0 + w, y + j, col, lv * Math.sin(Math.PI * (j + .5) / h));
}

/* ---------------- 水面 ---------------- */
/* refl: [[x, 颜色, 宽度], ...] 倒影的光柱（月亮、亮着的窗、灯笼） */
function water(g, x, y, w, h, t, P, refl = [], seed = 3) {
  g.rect(x, y, w, h, P.water);
  for (let j = 0; j < h; j += 2) g.hlD(x, x + w, y + j, P.waterL, .12 + .25 * (j / h));
  // 波纹：一段段亮线，慢慢往左漂
  for (let i = 0; i < Math.floor(w * h / 220); i++) {
    const yy = y + 2 + Math.floor(h2(i, seed) * (h - 3)), len = 3 + Math.floor(h2(i, seed + 1) * 9);
    const xx = x + ((h2(i, seed + 2) * w - t * (4 + 6 * h2(i, seed + 3))) % w + w) % w;
    if (Math.sin(t * 2 + i) > -.3) g.hl(xx, xx + len, yy, P.waterL);
  }
  for (const [rx, col, rw] of refl) {
    for (let j = 1; j < h; j++) {
      const wob = Math.round(Math.sin(t * 3 + j * .9) * (1 + j * .06)), ww = Math.max(1, Math.round(rw * (1 - j / h * .4)));
      if ((j + Math.floor(t * 6)) % 3 === 0) continue;
      g.hlD(rx - ww / 2 + wob, rx + ww / 2 + wob, y + j, col, .9 - .5 * j / h);
    }
  }
}

/* ---------------- 中式屋顶：飞檐翘角 ----------------
   (cx, y) 是正脊中间；w 是屋檐的半宽；h 是从正脊到屋檐的高度；屋面是凹的（靠近屋脊陡、靠近屋檐平），檐角往上翘 curl 像素 */
function roof(g, cx, y, w, h, P, o = {}) {
  const rw = o.rw || w * .5, curl = o.curl !== undefined ? o.curl : Math.max(2, h * .35);
  const col = o.col || P.roof, colL = o.colL || P.roofL, eave = o.eave || P.eave, tile = o.tile || P.tile;
  for (let x = -Math.round(w); x <= Math.round(w); x++) {
    const ax = Math.abs(x);
    const top = ax <= rw ? y : y + h * Math.sqrt((ax - rw) / (w - rw));
    const bot = y + h - curl * Math.pow(ax / w, 5);
    if (bot <= top) continue;
    for (let yy = Math.round(top); yy <= Math.round(bot); yy++) g.px(cx + x, yy, col);
    // 瓦垄：每 3 列一条暗线
    if (((x % 3) + 3) % 3 === 0) for (let yy = Math.round(top) + 1; yy < Math.round(bot) - 1; yy++) g.px(cx + x, yy, tile);
    // 檐口：最下面两格亮一点（月光照着）
    g.px(cx + x, Math.round(bot), eave); g.px(cx + x, Math.round(bot) - 1, colL);
    // 屋面上半截被月光照亮的一侧
    if (o.lit && x < 0 && h2(x, 5) > .5) g.px(cx + x, Math.round(top) + 1, colL);
    // 积雪：屋面最上面一层白，越往檐口越薄
    if (o.snow) { const th = ax <= rw ? 2 : 1 + Math.round(h2(x, 9) * 1.5); for (let j = 0; j < th; j++) g.px(cx + x, Math.round(top) + j, j === th - 1 ? '#C9D3EC' : '#F5F7FF'); }
  }
  // 正脊 + 两头的鸱吻（往上卷的小钩）
  g.rect(cx - rw - 1, y - 2, rw * 2 + 3, 3, o.ridge || tile);
  g.hl(cx - rw, cx + rw + 1, y - 2, colL);
  if (o.snow) { g.hl(cx - rw - 1, cx + rw + 2, y - 3, '#F5F7FF'); g.hl(cx - rw - 1, cx + rw + 2, y - 2, '#F5F7FF'); }
  for (const s of [-1, 1]) {
    const ex = cx + s * (rw + 1);
    g.rect(ex - 1, y - 5, 3, 4, o.ridge || tile); g.px(ex + s * 2, y - 6, o.ridge || tile); g.px(ex + s, y - 6, o.ridge || tile);
    g.px(ex, y - 5, colL);
  }
  // 檐角往外挑的尖
  for (const s of [-1, 1]) { const ex = cx + s * Math.round(w); const ey = Math.round(y + h - curl); g.px(ex + s, ey - 1, eave); g.px(ex + s * 2, ey - 2, eave); }
  return { y: y + h, w };
}
/* 灯笼：(x, y) 是挂绳的顶端 */
function lantern(g, x, y, t, k = 1, lit = true, seed = 0) {
  const sw = Math.round(Math.sin(t * 1.6 + seed) * .8);
  const L = 3 * k, cx = x + sw, cy = y + L + 4 * k;
  g.line(x, y, cx, y + L, '#2A1A1A');
  g.ell(cx, cy, 4 * k, 3.5 * k, lit ? '#E8323A' : '#8A1A22');
  g.ell(cx - k, cy - k, 2 * k, 1.5 * k, lit ? '#FF7A4A' : '#A82A2A');
  g.rect(cx - 2 * k, cy - 4 * k, 4 * k, k, '#F2C14E'); g.rect(cx - 2 * k, cy + 3 * k, 4 * k, k, '#F2C14E');
  g.rect(cx, cy + 4 * k, Math.max(1, k * .6), 3 * k, '#E8323A');
  return [cx, cy];
}
/* ---------------- 楼阁（她家的绣楼）----------------
   (x, baseY) 是台基底边的中间；返回西窗的位置（给剪影、光晕用） */
function tower(g, x, baseY, t, P, o = {}) {
  const w1 = o.w || 64, s = o.snow;
  // 台基
  g.rect(x - w1 - 6, baseY - 8, (w1 + 6) * 2, 8, P.stone);
  for (let i = 0; i < 6; i++) g.hl(x - w1 - 6 + i * 22 % (w1 * 2 + 12), x - w1 + 10 + i * 22 % (w1 * 2 + 12), baseY - 4, P.stoneD);
  g.hl(x - w1 - 6, x + w1 + 6, baseY - 8, hexOf(shadeC(P.stone, 1.25)));
  g.rect(x - 14, baseY - 4, 28, 4, P.stoneD); g.rect(x - 10, baseY - 6, 20, 2, P.stone);
  // 一层：柱子、格扇门
  const f1 = baseY - 8, h1 = o.h1 || 36;
  g.rect(x - w1 + 4, f1 - h1, (w1 - 4) * 2, h1, P.wood);
  for (let i = 0; i < 4; i++) {
    const px0 = x - w1 + 4 + i * ((w1 * 2 - 8) / 3);
    g.rect(px0 - 2, f1 - h1, 4, h1, P.pillar); g.rect(px0 - 2, f1 - h1, 1, h1, hexOf(shadeC(P.pillar, 1.3)));
  }
  for (let i = 0; i < 3; i++) {   // 门上的窗格
    const dx0 = x - w1 + 4 + i * ((w1 * 2 - 8) / 3) + 4, dw = (w1 * 2 - 8) / 3 - 8;
    const lit = o.lit1 !== undefined ? o.lit1 : false;
    g.rect(dx0, f1 - h1 + 6, dw, h1 - 14, lit ? P.paperD : P.woodL);
    for (let yy = f1 - h1 + 8; yy < f1 - 8; yy += 4) g.hl(dx0, dx0 + dw, yy, P.lat);
    for (let xx = dx0 + 3; xx < dx0 + dw; xx += 4) g.rect(xx, f1 - h1 + 6, 1, h1 - 14, P.lat);
  }
  // 一层的屋檐
  const r1y = f1 - h1 - 10;
  roof(g, x, r1y, w1 + 22, 12, P, { rw: w1 - 8, curl: 6, lit: true, snow: s });
  // 二层：栏杆、墙、西窗
  const w2 = Math.round(w1 * .72), f2 = r1y + 6, h2_ = o.h2 || 34;
  g.rect(x - w2, f2 - h2_, w2 * 2, h2_, P.wood);
  g.rect(x - w2, f2 - h2_, 3, h2_, P.pillar); g.rect(x + w2 - 3, f2 - h2_, 3, h2_, P.pillar);
  const win = { x: x - Math.round(w2 * .55), y: f2 - h2_ + 6, w: Math.round(w2 * 1.1), h: h2_ - 16 };
  const lit = o.lit2 !== undefined ? o.lit2 : true;
  g.rect(win.x - 2, win.y - 2, win.w + 4, win.h + 4, P.pillarD);
  g.rect(win.x, win.y, win.w, win.h, lit ? P.paper : P.woodL);
  if (lit) g.rectD(win.x, win.y + win.h * .55, win.w, win.h * .45, P.paperD, .5);
  if (o.inside) o.inside(g, win);           // 窗纸上的剪影
  for (let xx = win.x + 4; xx < win.x + win.w; xx += 5) g.rect(xx, win.y, 1, win.h, P.lat);   // 窗棂
  for (let yy = win.y + 4; yy < win.y + win.h; yy += 5) g.hl(win.x, win.x + win.w, yy, P.lat);
  g.rect(win.x + win.w / 2 - 1, win.y, 2, win.h, P.lat);
  // 栏杆
  const ry = f2 - 6;
  g.rect(x - w2 - 6, ry, (w2 + 6) * 2, 2, P.pillarD);
  g.rect(x - w2 - 6, ry + 5, (w2 + 6) * 2, 1, P.pillarD);
  for (let xx = x - w2 - 6; xx <= x + w2 + 6; xx += 5) g.rect(xx, ry, 1, 6, P.pillarD);
  // 顶层屋顶
  const r2y = f2 - h2_ - 16;
  roof(g, x, r2y, w2 + 20, 18, P, { rw: w2 - 10, curl: 8, lit: true, snow: s });
  // 屋檐下挂的灯笼
  const lan = [];
  if (o.lanterns !== false) {
    lan.push(lantern(g, x - w1 - 14, r1y + 10, t, 1, true, 1));
    lan.push(lantern(g, x + w1 + 14, r1y + 10, t, 1, true, 2));
  }
  // 积雪：屋脊、屋檐、栏杆上
  if (s) { snowLine(g, x - w2 - 6, x + w2 + 7, ry, 1); snowLine(g, x - w1 - 6, x + w1 + 6, baseY - 8, 1); }
  return { win, lanterns: lan, roofY: r2y, top: r2y - 6 };
}
/* 一条积雪：顺着一条线往上堆一层白，边上不齐 */
function snowLine(g, x0, x1, y, th = 2) {   // y 是被盖住的那条边的上沿，雪往上堆
  for (let x = Math.round(x0); x < x1; x++) {
    const n = th + Math.round(h2(x >> 1, 41) * 1.4);
    for (let j = 0; j < n; j++) g.px(x, y - 1 - j, j === 0 ? '#C9D3EC' : '#F5F7FF');
  }
}
/* 粉墙黛瓦：一段院墙 */
function wallSeg(g, x0, x1, top, bottom, P, o = {}) {
  g.rect(x0, top + 4, x1 - x0, bottom - top - 4, P.wall);
  g.rectD(x0, bottom - 6, x1 - x0, 6, P.wallD, .5);
  g.rect(x0 - 2, top, x1 - x0 + 4, 4, P.tile);
  for (let x = x0; x < x1; x += 4) g.px(x, top, P.tileL);
  g.hl(x0 - 2, x1 + 2, top + 3, hexOf(shadeC(P.tile, .7)));
  if (o.snow) snowLine(g, x0 - 2, x1 + 2, top, 2);
  if (o.win) for (const wx of o.win) {   // 墙上的漏窗（圆）
    g.disc(wx, top + (bottom - top) * .45, 6, P.tile); g.disc(wx, top + (bottom - top) * .45, 5, P.wallD);
    g.ring(wx, top + (bottom - top) * .45, 3, P.tile);
  }
}

/* ---------------- 树 ----------------
   梅树：按种子长出来的枝条（每段一条粗线），枝头和枝上开花。结果按 key 缓存成图层 */
function treeSegs(seed, x, y, len, ang, depth, wid) {
  const r = rng(seed), segs = [];
  const grow = (x0, y0, l, a, d, w) => {
    const bend = (r() - .5) * .9, n = 3;
    let px = x0, py = y0, aa = a;
    for (let i = 0; i < n; i++) {
      aa += bend / n + (r() - .5) * .35;
      const nx = px + Math.cos(aa) * l / n, ny = py + Math.sin(aa) * l / n;
      segs.push([px, py, nx, ny, Math.max(1, w * (1 - i / n * .3)), d]);
      px = nx; py = ny;
    }
    if (d <= 0) return;
    const kids = d > 2 ? 2 : 2 + (r() > .5 ? 1 : 0);
    for (let k = 0; k < kids; k++) grow(px, py, l * (.62 + r() * .2), aa + (k - (kids - 1) / 2) * (.7 + r() * .4), d - 1, w * .62);
  };
  grow(x, y, len, ang, depth, wid);
  return segs;
}
function plumTree(g, x, y, seed, P, o = {}) {
  const sc = o.scale || 1, key = 'plum' + seed + sc + (o.bloom || P.bloom) + (o.snow ? 's' : '') + (o.flip ? 'f' : '') + (o.bare ? 'b' : '');
  const L = layer(key, Math.round(420 * sc), Math.round(240 * sc), p => {
    const segs = treeSegs(seed, 210 * sc, 238 * sc, 70 * sc, -Math.PI / 2 + (o.lean || .25), o.depth || 5, 7 * sc);
    for (const [x0, y0, x1, y1, w] of segs) {
      const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
      for (let i = 0; i <= n; i++) { const xx = x0 + (x1 - x0) * i / n, yy = y0 + (y1 - y0) * i / n; p.disc(xx, yy, w / 2, P.trunk); if (w > 2) p.px(xx - w / 2 + 1, yy, P.trunkL); }
    }
    if (o.snow) for (const [x0, y0, x1, y1, w] of segs) if (w > 1.5) { const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0)); for (let i = 0; i <= n; i += 1) { const xx = x0 + (x1 - x0) * i / n, yy = y0 + (y1 - y0) * i / n; if (Math.abs(x1 - x0) > Math.abs(y1 - y0) * .6) p.px(xx, yy - w / 2 - 1, '#F5F7FF'); } }
    if (!o.bare) {
      const r = rng(seed + 77), bc = o.bloom || P.bloom, bl = o.bloomL || P.bloomL;
      for (const [x0, y0, x1, y1, w, d] of segs) {
        if (d > 3) continue;
        const cnt = d <= 1 ? 3 : 1;
        for (let k = 0; k < cnt; k++) {
          const f = r(), xx = x0 + (x1 - x0) * f + (r() - .5) * 4, yy = y0 + (y1 - y0) * f + (r() - .5) * 4;
          if (r() < .55) { p.px(xx, yy, bc); p.px(xx + 1, yy, bc); p.px(xx, yy + 1, bc); p.px(xx + 1, yy + 1, bc); p.px(xx + (r() < .5 ? 0 : 1), yy + (r() < .5 ? 0 : 1), bl); }
          else { p.px(xx, yy - 1, bc); p.px(xx - 1, yy, bc); p.px(xx + 1, yy, bc); p.px(xx, yy + 1, bc); p.px(xx, yy, bl); }
        }
      }
    }
  });
  g.blit(L, Math.round(x - 210 * sc), Math.round(y - 238 * sc), { flip: o.flip });
}
/* 柳树：一根树干 + 很多垂下来的柳条，柳条随风摆 */
function willow(g, x, y, t, P, o = {}) {
  const h = o.h || 90, col = o.leaf || '#4E8A5A', colL = o.leafL || '#7AB86A';
  for (let j = 0; j < h; j++) { const w = 3 + (1 - j / h) * 3; g.rect(x - w / 2 + Math.sin(j * .05) * 2, y - j, w, 1, P.trunk); }
  // 树冠的几根主枝：从树干顶上往两边弯出去
  const tops = [];
  for (let b = 0; b < 5; b++) {
    const a = -Math.PI / 2 + (b - 2) * .5, len = 26 + h2(b, 3) * 10;
    let px = x, py = y - h;
    for (let i = 0; i < len; i++) { px += Math.cos(a) * 1; py += Math.sin(a) * 1 + i * .035; g.rect(px, py, 2, 2, P.trunk); if (i % 4 === 0) tops.push([px, py]); }
  }
  // 柳条：从主枝上垂下来，随风摆
  tops.forEach(([sx, sy], i) => {
    const len = 30 + h2(i, 5) * 46;
    for (let j = 0; j < len; j++) {
      const xx = sx + Math.sin(t * 1.3 + i + j * .05) * (j / len) * 4 + (o.wind || 0) * j * .12;
      g.px(xx, sy + j, (j + i) % 6 === 0 ? colL : col);
      if (j % 5 === 2) g.px(xx + 1, sy + j, col);
    }
  });
}

/* ---------------- 粒子 ---------------- */
function petals(g, t, seed, n, P, o = {}) {   // 花瓣：从右上往左下飘
  const w = o.w || g.w, h = o.h || g.h, cols = o.cols || [P.bloom, P.bloomL], sp = o.speed || 1, x0 = o.x0 || 0, y0 = o.y0 || 0;
  for (let i = 0; i < n; i++) {
    const v = .5 + h2(i, seed + 1) * .8, ph = h2(i, seed);
    const x = x0 + ((ph * (w + 60) - t * 18 * v * sp * (o.dx || 1)) % (w + 60) + w + 60) % (w + 60) - 30 + Math.sin(t * 1.5 + i) * 6;
    const y = y0 + ((h2(i, seed + 2) * (h + 40) + t * 14 * v * sp) % (h + 40)) - 20;
    const c = cols[i % cols.length], f = Math.floor(t * 4 + i) % 3;
    g.px(x, y, c); if (f > 0) g.px(x + 1, y, c); if (f === 2) g.px(x, y + 1, c);
  }
}
function snowfall(g, t, seed, n, o = {}) {
  const w = o.w || g.w, h = o.h || g.h, sp = o.speed || 1;
  for (let i = 0; i < n; i++) {
    const v = .4 + h2(i, seed + 1) * .9, big = h2(i, seed + 4) > .8;
    const x = (h2(i, seed) * w + Math.sin(t * .9 + i * 1.7) * 6 - t * 4 * (o.wind || 1) + w * 10) % w;
    const y = ((h2(i, seed + 2) * h + t * 16 * v * sp) % (h + 10)) - 5;
    g.px(x, y, o.col || '#F5F7FF'); if (big) { g.px(x + 1, y, o.col || '#F5F7FF'); g.px(x, y + 1, o.col || '#DDE4F8'); g.px(x + 1, y + 1, '#DDE4F8'); }
  }
}
function fireflies(g, ctx, t, seed, n, x0, y0, w, h, col = '#FFE9A0') {   // 萤火虫：像素点 + 屏幕层的小光晕（ctx 为空就只画点）
  const pts = [];
  for (let i = 0; i < n; i++) {
    const x = x0 + h2(i, seed) * w + Math.sin(t * .7 + i * 2.1) * 8, y = y0 + h2(i, seed + 1) * h + Math.sin(t * .9 + i) * 5;
    const on = Math.sin(t * 2.2 + i * 1.3) > -.2;
    if (on) { g.px(x, y, col); pts.push([x, y]); }
  }
  return pts;
}

/* ---------------- 鸳鸯（侧面，朝右） ---------------- */
const DUCK_M = ['.......gg.....', '......gGGg....', '.....gGwkwg...', '....oGwwwwwRR.', '..O.oowww.....', '.OOOooPPP.....', 'OOOoPPPPPP....', 'bbbbbbbbbbP...', '.bbbbbbbbb....'];
const DUCK_F = ['.......nnn....', '......nnnnn...', '......nwkwn...', '......nnnnnyy.', '.......nnn....', '...nnnnnnnn...', '.nnnsnnsnnnn..', 'nnnnnnnnnnnn..', '.nnnnnnnnnn...'];
const DUCK_PAL = { g: '#1E5A4A', G: '#3FA07A', w: '#FFFFFF', k: '#111111', R: '#E5323A', o: '#F0A040', O: '#E87A2A', P: '#6A2A5A', b: '#B88A5A', n: '#8A7A6A', s: '#C8B8A0', y: '#C89A5A' };
function duck(g, x, y, t, male = true, flip = false, seed = 0) {
  const sp = artc(male ? 'duckM' : 'duckF', male ? DUCK_M : DUCK_F, DUCK_PAL);
  const bob = Math.round(Math.sin(t * 2.4 + seed) * .6);
  g.blit(sp, Math.round(x) - 7, Math.round(y) - 8 + bob, { flip });
  // 水纹
  const r = 9 + Math.floor((t * 4 + seed) % 4);
  g.hl(x - r, x - r + 3, y + 2, '#9AA8E0'); g.hl(x + r - 3, x + r, y + 2, '#9AA8E0');
}

/* ---------------- 屋里的东西 ---------------- */
function candle(g, x, y, t, k = 1, seed = 0) {   // (x, y) 是烛台底
  g.rect(x - 3 * k, y - k, 6 * k, k, '#B8862A'); g.rect(x - k, y - 3 * k, 2 * k, 2 * k, '#B8862A'); g.rect(x - 2 * k, y - 4 * k, 4 * k, k, '#D8A84A');
  g.rect(x - k, y - 10 * k, 2 * k, 6 * k, '#F2E6D0'); g.rect(x - k, y - 10 * k, k, 6 * k, '#FFFFFF');
  const fl = Math.sin(t * 13 + seed) * .5 + Math.sin(t * 7.3 + seed) * .5, fh = 3 + Math.round(fl);
  g.rect(x - Math.max(1, k * .6), y - (11 + fh) * k, Math.max(1, k * 1.2), fh * k, '#FFE08A');
  g.rect(x - Math.max(1, k * .3), y - (12 + fh) * k, Math.max(1, k * .6), k * 2, '#FFF6D0');
  g.px(x, y - 11 * k, '#FF8A3A');
  return [x, y - (11 + fh * .5) * k];
}
function table(g, x, y, w, P, o = {}) {   // (x, y) 是桌面左端
  g.rect(x, y, w, 3, o.top || P.woodL); g.rect(x, y + 3, w, 2, o.col || P.wood);
  g.rect(x + 3, y + 5, 3, o.leg || 16, o.col || P.wood); g.rect(x + w - 6, y + 5, 3, o.leg || 16, o.col || P.wood);
}
function qin(g, x, y, w, o = {}) {   // 古琴：长条琴身 + 七根弦（侧上方看），broken：断了一根
  g.rect(x, y, w, 6, '#4A2418'); g.rect(x + 2, y + 1, w - 4, 4, '#6A3420'); g.rect(x + w - 10, y, 10, 6, '#3A1A10');
  for (let i = 0; i < 13; i++) g.px(x + 8 + i * (w - 20) / 12, y - 1, '#F2E6C0');   // 徽位
  for (let s = 0; s < 4; s++) {
    const yy = y + 1 + s, vib = o.vib ? Math.round(Math.sin(o.t * 40 + s) * o.vib * (s === o.vs ? 1 : .3)) : 0;
    if (o.broken === s) { g.hl(x + 4, x + w * .45, yy, '#E8C27A'); continue; }
    for (let xx = x + 4; xx < x + w - 6; xx++) g.px(xx, yy + (Math.abs(xx - x - w / 2) < w * .3 ? vib : 0), '#E8C27A');
  }
}
