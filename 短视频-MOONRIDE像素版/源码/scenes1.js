// 《MOONRIDE》像素版：开头到第一段副歌（0 ~ 28.8 秒）
'use strict';

// 遮罩：只在多边形里画
function maskPoly(pts) { const m = new Uint8Array(W * H); const t0 = T, b0 = BM; const tmp = { w: W, h: H, d: new Float32Array(W * H * 3), a: null };
  T = tmp; const c0 = [CX0, CY0, CX1, CY1]; CX0 = 0; CY0 = 0; CX1 = W; CY1 = H; poly(pts, [255, 0, 0]); T = t0; BM = b0; [CX0, CY0, CX1, CY1] = c0;
  for (let i = 0; i < W * H; i++) m[i] = tmp.d[i * 3] > 0 ? 1 : 0; return m; }
function withMask(m, fn) { const m0 = MASK; MASK = m; fn(); MASK = m0; }

// ================= 片名：夜里的城市广场 =================
// 一个小光线追踪：两排楼夹着一条大道，镜头在楼顶上面往前推
const CITY = (() => { const r = rng(11), L = [], R = []; let z = .4; while (z < 30) { const len = .8 + r() * 1.2; L.push([z, z + len, .8 + r() * 1.6, Math.floor(r() * 4)]); z += len; } z = .3; while (z < 30) { const len = .8 + r() * 1.2; R.push([z, z + len, .8 + r() * 1.6, Math.floor(r() * 4)]); z += len; } return { L, R }; })();
const BLD_COL = ['#d9cdb8', '#cbbfae', '#e3d8c6', '#bfb2a0'];
function cityRay(dx, dy, g, zc, side, segs) {
  // 返回 [t, 类型, z, Y, 楼的编号]
  let best = null; const sx = side; // -1 左、1 右
  if (dx * sx > 0) {
    const t = (sx * 1 - 0) / dx; const z = zc + t, Y = g + t * dy;
    for (let i = 0; i < segs.length; i++) { const s = segs[i]; if (z >= s[0] && z < s[1]) { if (Y >= 0 && Y <= s[2]) best = [t, 'f', z, Y, i]; break; } }
  }
  for (let i = 0; i < segs.length; i++) { // 楼顶
    const s = segs[i]; if (dy >= 0) break;
    const t = (s[2] - g) / dy; if (t <= 0) continue; const z = zc + t, x = t * dx;
    if (z >= s[0] && z < s[1] && x * sx >= 1 && x * sx <= 5) { if (!best || t < best[0]) best = [t, 'r', z, x, i]; }
  }
  for (let i = 1; i < segs.length; i++) { // 朝镜头的山墙
    const s = segs[i], p = segs[i - 1]; const t = s[0] - zc; if (t <= 0) continue; const x = t * dx, Y = g + t * dy;
    if (x * sx >= 1 && x * sx <= 5 && Y >= p[2] && Y <= s[2]) { if (!best || t < best[0]) best = [t, 'w', s[0], Y, i]; }
  }
  return best;
}
function shTitle(lt, d, o, T_) {
  const VX = 240, VY = 70, k = 150, g = 2.25, zc = lt * .32;
  const off = smooth(ramp(lt, 3.35, 4.05));       // 灯一片片灭掉
  const moonK = smooth(ramp(lt, 3.3, 4.2));        // 变成月光
  const fogC = mixc('#2a2550', '#6a7cc0', moonK);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const dx = (x + .5 - VX) / k, dy = -(y + .5 - VY) / k;
    let c = null, dist = 0;
    const hl = cityRay(dx, dy, g, zc, -1, CITY.L), hr = cityRay(dx, dy, g, zc, 1, CITY.R);
    let h = hl; if (hr && (!h || hr[0] < h[0])) h = hr;
    if (dy < 0) { const tg = -g / dy; if (!h || tg < h[0]) { const xw = tg * dx, z = zc + tg; dist = tg;
      // 大道和广场
      const pz = z - 6.2, pd = Math.hypot(xw, pz * .9);
      if (pd < 1.05) { c = pd < .25 ? [70, 64, 92] : (Math.floor(pd * 9) % 2 ? [92, 86, 116] : [104, 98, 128]); if (pd < .22) c = [40, 36, 60]; }
      else if (Math.abs(xw) < .8) { c = [46, 44, 64]; if (Math.abs(xw) < .02 && (Math.floor(z * 2) % 2)) c = [150, 140, 120]; }
      else c = (Math.floor(z * 4) + Math.floor(xw * 4)) % 2 ? [84, 78, 98] : [76, 70, 90];
      h = null; } }
    if (h) {
      dist = h[0]; const seg = (h === hl ? CITY.L : CITY.R)[h[4]], col = C(BLD_COL[seg[3]]);
      if (h[1] === 'f' || h[1] === 'w') {
        const u = h[1] === 'f' ? h[2] : h[3] * 0, Y = h[3];
        const wz = h[1] === 'f' ? h[2] * 3.2 : (Math.abs(dx * (h[2] - zc)) * 3.2), wy = Y * 4.2;
        const fx = wz - Math.floor(wz), fy = wy - Math.floor(wy);
        c = h[1] === 'w' ? shade(col, .78) : col;
        if (Y > seg[2] - .08) c = lit(col, .25);
        else if (fx > .22 && fx < .74 && fy > .28 && fy < .78 && Y > .25) {
          const hs = h2(Math.floor(wz), Math.floor(wy), seg[3] + (h === hl ? 0 : 50));
          const on = hs > .38 && hs > .38 + off * .7 + (1 - h2(Math.floor(wz), 7, 3)) * off * .3 - .02;
          c = on ? (hs > .8 ? [255, 214, 150] : [255, 190, 120]) : [48, 56, 88];
        } else if (Y < .25) c = shade(col, .7);
      } else c = (Math.abs(h[3]) < 1.07) ? lit(col, .1) : shade(col, .55 + .1 * h2(Math.floor(h[2] * 2), Math.floor(h[3] * 2), 4));
    }
    if (!c) { // 天
      const tt = sat(y / VY); c = mixc(mixc('#05081a', '#0b1236', moonK), mixc('#2c2058', '#4a5aa0', moonK), tt);
    } else {
      const f = sat((dist - 2) / 14); c = mixc(c, fogC, f * .75);
      c = mixc(c, mixc(c, [150, 170, 235], .55), moonK * .8);
    }
    pp(x, y, c);
  }
  // 路灯（投影到画面上）
  for (const sx of [-1, 1]) for (let i = 0; i < 18; i++) {
    const z = .6 + i * .7, t = z - zc; if (t < .3) continue;
    const xw = sx * .86, X = VX + xw / t * k, Yb = VY + g / t * k, Yt = VY + (g - .55) / t * k;
    line(X, Yb, X, Yt, [40, 36, 50]);
    const on = 1 - smooth(ramp(lt, 3.55 + i * .02, 3.8 + i * .02));
    if (on > .05) { circ(X, Yt, Math.max(1, 1.6 / t), [255, 236, 190], on); glow(X, Yt, 6 / Math.sqrt(t), [255, 200, 120], .7 * on); ell(X, Yb, 10 / t, 3 / t, [255, 200, 130], .18 * on); }
  }
  // 广场中间的心形喷泉（一直亮着）
  { const t = 6.2 - zc, X = VX, Yb = VY + g / t * k, s = 1 / t;
    ell(X, Yb, 40 * s, 12 * s, [150, 140, 170]); ell(X, Yb - 1, 34 * s, 9 * s, [96, 140, 200]);
    rect(X - 3 * s, Yb - 18 * s, 6 * s, 16 * s, [180, 170, 190]);
    heart(X, Yb - 26 * s, 9 * s, [255, 150, 170]); heart(X - 1, Yb - 27 * s, 5 * s, [255, 220, 226]);
    glow(X, Yb - 26 * s, 26 * s, [255, 120, 150], .9); halo(X, Yb - 20 * s, 60 * s, [255, 140, 170], .18, 5, 20 * s);
    sparkles(5, 18, X - 40 * s, Yb - 60 * s, X + 40 * s, Yb, lt, { col: '#ffd6e0', rise: 10 });
  }
  stars(3, 70, 0, 0, W, VY - 5, lt, { big: .1 });
  // 霓虹片名
  neonTitle(240, 22, 40, lt, { on: .24 + .76 * smooth(ramp(lt, .0, .8)) });
  const hk = .35 + .65 * smooth(ramp(lt, .2, 1.0));
  if (hk > 0) { text('HEARTS2HEARTS', 240, 226, [255, 230, 240], { al: 'c', a: hk, sp: 1 }); onGlow(() => text('HEARTS2HEARTS', 240, 226, [255, 120, 170], { al: 'c', a: hk * .9, sp: 1 })); }
  bloom(1.1, 3, .92);
  vignette(.55);
}
// 霓虹的 MOONRIDE：O 是两颗心
const NEON = {
  M: [[[0, 1], [0, .18], [.07, 0], [.18, .04], [.5, .62], [.82, .04], [.93, 0], [1, .18], [1, 1]]],
  N: [[[0, 1], [0, .12], [.06, 0], [.14, .05], [.74, .95], [.8, 1], [.86, .9], [.86, 0]]],
  R: [[[0, 1], [0, 0], [.42, 0], [.6, .07], [.67, .25], [.6, .43], [.42, .5], [0, .5]], [[.32, .5], [.68, 1]]],
  I: [[[.1, 0], [.1, 1]]],
  D: [[[0, 0], [0, 1], [.38, 1], [.64, .88], [.74, .5], [.64, .12], [.38, 0], [0, 0]]],
  E: [[[.62, 0], [0, 0], [0, 1], [.62, 1]], [[0, .5], [.48, .5]]],
};
const NEON_W = { M: 1, O: .92, N: .86, R: .7, I: .2, D: .75, E: .62 };
function heartPath(n) { const p = []; for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2; const x = 16 * Math.pow(Math.sin(a), 3), y = -(13 * Math.cos(a) - 5 * Math.cos(2 * a) - 2 * Math.cos(3 * a) - Math.cos(4 * a)); p.push([(x + 17) / 34, (y + 17) / 30]); } return p; }
const HPATH = heartPath(40);
function neonTitle(cx, y, h, lt, o) {
  o = o || {}; const word = 'MOONRIDE', gap = .28;
  let tw = 0; for (const ch of word) tw += NEON_W[ch] + gap; tw = (tw - gap) * h;
  let x = cx - tw / 2; const core = [255, 244, 250], tube = [255, 170, 205];
  let li = 0;
  for (const ch of word) {
    const w = NEON_W[ch] * h;
    const on = o.on === undefined ? 1 : sat((o.on * 9 - li) * 1.5);
    const fl = on > 0 && on < 1 ? (h2(Math.floor(lt * 30), li, 3) > .5 ? 1 : .25) : on;
    if (fl > 0) {
      const paths = ch === 'O' ? [HPATH] : NEON[ch];
      for (const pth of paths) for (let i = 0; i + 1 < pth.length; i++) {
        const [ax, ay] = pth[i], [bx, by] = pth[i + 1];
        const X0 = x + ax * w, Y0 = y + ay * h, X1 = x + bx * w, Y1 = y + by * h;
        line(X0, Y0, X1, Y1, tube, fl, 3);
        line(X0, Y0, X1, Y1, core, fl, 1);
        onGlow(() => line(X0, Y0, X1, Y1, [255, 90, 150], fl * .9, 4));
      }
    }
    x += w + gap * h; li++;
  }
}

// ================= 楼面上的窗：心形一格格灭 / 亮 =================
function facade(lt, d, mode, scale) {
  const sc = scale || 1;
  sky([[0, '#060a1c'], [1, '#18204a']]);
  stars(9, 40, 0, 0, W, 60, lt);
  const cols = 15, rows = 9, ww = 14 * sc, wh = 16 * sc, gx = 22 * sc, gy = 24 * sc;
  const bx = W / 2 - cols * gx / 2, by = (H - rows * gy) / 2 + 6 * sc;
  // 楼体
  rect(bx - 16 * sc, by - 26 * sc, cols * gx + 32 * sc, rows * gy + 60 * sc, '#1c2440');
  vgrad(bx - 16 * sc, by - 26 * sc, cols * gx + 32 * sc, rows * gy + 60 * sc, [[0, '#2a3458'], [1, '#141a30']], 6);
  rect(bx - 20 * sc, by - 30 * sc, cols * gx + 40 * sc, 6 * sc, '#3a4670');
  for (let r = 0; r <= rows; r++) rect(bx - 16 * sc, by + r * gy - 5 * sc, cols * gx + 32 * sc, 1, '#263050');
  // 窗
  const cx = (cols - 1) / 2, cy = (rows - 1) / 2;
  let lastOn = null;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const u = (c - cx) / 4.6, v = (r - cy + .6) / 4.3;
    const inH = inHeart(u, v);
    let on = false;
    if (inH) {
      if (mode === 'off') { const tOff = .15 + (r / rows) * (d - .5) + h2(c, r, 2) * .12; on = lt < tOff || (r === rows - 1 && c === 7) || (r === rows - 2 && c === 7 && lt < d - .15); }
      else { const tOn = .1 + ((rows - 1 - r) / rows) * (d - .45) + h2(c, r, 3) * .1; on = lt > tOn; }
    }
    const x = bx + c * gx + (gx - ww) / 2, y = by + r * gy;
    rect(x - sc, y - sc, ww + 2 * sc, wh + 2 * sc, '#0e1222');
    if (on) { rect(x, y, ww, wh, '#ffcf7a'); rect(x, y, ww, wh * .3, '#ffe6b0'); rect(x + ww / 2 - .5 * sc, y, sc, wh, '#d89a50'); glow(x + ww / 2, y + wh / 2, 10 * sc, [255, 180, 90], .55); }
    else { rect(x, y, ww, wh, '#222c4c'); rect(x, y, ww * .4, wh * .5, '#2e3a62'); rect(x + ww / 2 - .5 * sc, y, sc, wh, '#141a30'); }
  }
  // 地上一层薄雪、门口
  rect(0, by + rows * gy + 28 * sc, W, H, '#c8d0ea'); vgrad(0, by + rows * gy + 28 * sc, W, 30, [[0, '#a8b4dc'], [1, '#e8ecff']], 5);
  snow(4, 40, lt, { a: .7 });
  bloom(1, 3, .95); vignette(.6);
}
function shFacadeOff(lt, d) { facade(lt, d, 'off', 1); }
function shFacadeOn(lt, d) { facade(lt, d, 'on', .82); }

// ================= 老电影院 =================
function shTheater(lt, d) {
  // 墙、天花板
  vgrad(0, 0, W, H, [[0, '#3a2a22'], [.5, '#6a5038'], [1, '#2a1c16']], 8);
  // 天花板的格子（透视）
  for (let i = 0; i < 9; i++) { const y = 4 + i * i * 1.3; line(0, y, W, y + 8, '#8a6c4c'); }
  for (let i = -6; i <= 6; i++) line(240 + i * 12, 0, 240 + i * 60, 110, '#7a5e42');
  rect(0, 60, W, 70, '#7a6048'); for (let x = 0; x < W; x += 24) { rect(x + 4, 66, 16, 56, '#8e7256'); rect(x + 6, 68, 12, 52, '#6e563e'); }
  rect(0, 126, W, 6, '#a88a64');
  // 光柱：从右上的放映窗打到左边
  const flick = .85 + .15 * Math.sin(lt * 37) * Math.sin(lt * 13);
  const sx = 420, sy = 26;
  rect(sx - 8, sy - 6, 16, 12, '#fff8e8'); glow(sx, sy, 20, [255, 240, 210], 1.2 * flick);
  blend('screen');
  for (let i = 0; i < 8; i++) { const sp = 8 + i * 9; poly([sx, sy - 3, sx, sy + 3, 0, 120 + sp, 0, 60 - sp * .6], [255, 236, 200], .055 * flick); }
  blend();
  // 光里的灰尘
  const r = rng(21);
  for (let i = 0; i < 90; i++) { const t0 = r(); const u = (t0 + lt * .05 * (r() + .2)) % 1; const x = sx - u * 420, spread = 6 + u * 60; const y = sy + u * 66 + (r() - .5) * spread * 1.4 + Math.sin(lt * 2 + i) * 2; px(x, y, [255, 240, 210], .5 + r() * .5); }
  // 座椅：一排排红丝绒椅背
  for (let row = 0; row < 4; row++) {
    const y = 150 + row * 34, sc = 1 + row * .35, w = 46 * sc, hgt = 26 * sc;
    for (let i = -1; i < 12; i++) {
      const x = i * (w + 6 * sc) - (row % 2) * w * .5 + 6;
      ell(x + w / 2, y + hgt * .25, w / 2, hgt * .35, '#7a2030'); rect(x, y + hgt * .25, w, hgt, '#7a2030');
      ell(x + w / 2, y + hgt * .2, w / 2 - 2, hgt * .3, '#b8495a'); rect(x + 2, y + hgt * .2, w - 4, hgt * .7, '#9e3448');
      for (let k = 0; k < 4; k++) line(x + 6 + k * w * .25, y + hgt * .3, x + 6 + k * w * .25, y + hgt, '#842838');
      glowRect(x + 4, y, w - 8, 2, [255, 200, 170], .25 * flick);
    }
  }
  bloom(1, 4, .9); vignette(.7);
}

// ================= 花丛里的车 =================
function nightField(lt, horizon) {
  sky([[0, '#070d26'], [.7, '#1d2c5e'], [1, '#3e4c86']], 0, horizon + 4);
  stars(13, 90, 0, 0, W, horizon - 10, lt);
  hills(4, horizon, 14, .012, '#1a2246', { rim: '#2e3a6a' });
  hills(5, horizon + 16, 10, .02, '#141a36');
  rect(0, horizon + 16, W, H, '#141a36');
}
function carGirls(cx, gy, k, lt, o) {
  o = o || {};
  const X = u => cx + u * k, Y = v => gy + v * k;
  suvSide(cx, gy, k, { dir: 1, lights: o.lights });
  // 后窗：拿相机的她（0）；前窗：拿对讲机的她（5）
  const back = maskPoly([X(-27), Y(-29.5), X(-20), Y(-42), X(-2), Y(-42.5), X(-2), Y(-29.5)]);
  const front = maskPoly([X(1), Y(-29.5), X(1), Y(-42.5), X(18), Y(-43), X(29), Y(-30)]);
  const s = 3.1 * k;
  withMask(back, () => { rect(X(-28), Y(-44), 28 * k, 16 * k, '#0c1020'); bust(0, X(-13), Y(-37.5) + (o.up || 0) * k, s, { cloth: 'blouse', col: 'white', turn: -.2, mouth: o.m0 || 'n', eyes: o.e0, amb: ['#8090d0', .18], after: o.after0 }); });
  withMask(front, () => { rect(X(0), Y(-44), 30 * k, 16 * k, '#0c1020'); bust(5, X(14), Y(-37) , s, { cloth: 'blouse', col: 'white', turn: .25, mouth: o.m1 || 'smile', amb: ['#8090d0', .18], after: o.after1 }); });
  // 搭在车门上的胳膊
  if (o.arms) { for (const ax of [6, 22]) { thick(X(ax), Y(-30), X(ax + 6), Y(-29), 1.6 * k, '#f6efe8'); } }
}
function shCarField(lt, d) {
  nightField(lt, 140);
  const gy = 222, k = 2.4;
  // 车后面的高草
  meadow(31, 110, 0, W, 186, 222, lt, { cols: ['#f2b25a', '#e86a4a', '#c79af0', '#f6e27a'], h: 30, stem: '#2c4a3a' });
  carGirls(250, gy, k, lt, {});
  // 前景的花
  meadow(32, 120, -10, W + 10, 214, 280, lt, { cols: ['#f2b25a', '#e86a4a', '#c79af0', '#f6e27a', '#ffffff'], h: 40, stem: '#243c30' });
  fireflies(6, 14, 0, 150, W, 260, lt);
  bloom(.9, 3, .95); vignette(.6);
}
function shCarCamera(lt, d) {
  nightField(lt, 120);
  const k = 3.9, cx = 250, gy = 280;
  const flashT = d - .32, fl = lt > flashT ? Math.exp(-(lt - flashT) * 9) : 0;
  carGirls(cx, gy, k, lt, {
    up: -1, m1: 'open',
    after0: (L, ox, oy, s) => { // 举到脸前的相机
      const cy = oy + .1 * s, cxx = ox - .1 * s;
      rect(cxx - 1.3 * s, cy - .55 * s, 2.6 * s, 1.3 * s, '#f4f2f6'); rect(cxx - 1.3 * s, cy - .55 * s, 2.6 * s, .25 * s, '#ffffff');
      circ(cxx + .2 * s, cy + .1 * s, .45 * s, '#2a2a34'); circ(cxx + .2 * s, cy + .1 * s, .25 * s, '#5a6a9a'); px(cxx + .1 * s, cy, '#ffffff');
      rect(cxx + .8 * s, cy - .4 * s, .3 * s, .2 * s, '#ffd6e0');
      thick(cxx - 1.4 * s, cy + .4 * s, cxx - 1.9 * s, cy + 2.2 * s, .32 * s, SKIN.b); thick(cxx + 1.3 * s, cy + .4 * s, cxx + 1.7 * s, cy + 2.2 * s, .32 * s, SKIN.b);
      for (let i = 0; i < 6; i++) px(cxx + 1.3 * s + i * .3 * s, cy + .5 * s + i * .5 * s, '#ff9ac0');
    },
    after1: (L, ox, oy, s) => { const hx = ox + .9 * s, hy = oy + 1.2 * s; rect(hx - .3 * s, hy - .6 * s, .9 * s, 1.6 * s, '#ff8fb8'); rect(hx - .1 * s, hy - 1.3 * s, .2 * s, .7 * s, '#ff8fb8'); px(hx, hy - .3 * s, '#ffffff'); thick(hx, hy + 1 * s, hx + .3 * s, hy + 2.6 * s, .32 * s, SKIN.b); },
  });
  meadow(33, 60, -10, W + 10, 236, 290, lt, { cols: ['#f2b25a', '#e86a4a', '#c79af0'], h: 50, stem: '#243c30' });
  if (fl > 0) { glow(150, 150, 18, [255, 255, 255], 1.5 * fl); flash('#ffffff', fl * .7); }
  bloom(1, 3, .95); vignette(.55);
}

// ================= 取景框 =================
function violetHills(lt, horizon, o) {
  o = o || {};
  sky([[0, '#2a1f56'], [.6, '#5e4a9a'], [1, '#a98ad2']], 0, horizon + 10);
  if (o.moon) moon(o.moon[0], o.moon[1], o.moon[2], { crescent: '#3a2c6c', halo: '#c0a8ff' });
  stars(17, 40, 0, 0, W, horizon - 30, lt, { a: .7 });
  hills(21, horizon, 22, .008, '#6a52a0', { rim: '#9a84d0' });
  for (const [hx, ph] of [[90, 0], [140, 1], [330, 2], [380, 3]]) horseSil(hx + Math.sin(lt * .3 + ph) * 3, hillY(21, horizon, 22, .008, hx) + 1, .9, '#3c2c6a', lt * 2 + ph);
  hills(22, horizon + 20, 18, .012, '#4e3c84', { rim: '#7a64b4' });
  hills(23, horizon + 48, 16, .016, '#3a2c66', { rim: '#5e4a96', grad: 60, dark: '#22183e' });
}
function shViewfinder(lt, d) {
  violetHills(lt, 150);
  meadow(41, 160, 0, W, 210, 272, lt, { cols: ['#c8a6ff', '#9a7ad8', '#e4d0ff'], lav: 1, h: 18, stem: '#3a2c5c' });
  // 取景框
  const br = (x, y, sx, sy) => { rect(x, y, 22 * sx, 2, '#ffffff', .9); rect(x + (sx < 0 ? -2 : 0), y, 2, 16 * sy, '#ffffff', .9); };
  const b = 1 + Math.sin(lt * 3) * .5;
  for (const [x, y, sx, sy] of [[60, 40, 1, 1], [420, 40, -1, 1], [60, 230, 1, -1], [420, 230, -1, -1]]) { rect(x + (sx < 0 ? -22 : 0), y + (sy < 0 ? 0 : 0), 22, 2, '#ffffff', .85); rect(x + (sx < 0 ? -2 : 0), y + (sy < 0 ? -16 : 0), 2, 16, '#ffffff', .85); }
  rect(232, 135, 16, 1, '#ffffff', .85); rect(240, 127, 1, 16, '#ffffff', .85);
  ring(240, 135, 26 + b, 1, '#ffffff', .45);
  if (Math.floor(lt * 2) % 2 === 0) { circ(76, 22, 3, '#ff3a4a'); }
  text('1/125  F2.8', 400, 16, '#ffffff', { al: 'r', a: .8 });
  vignette(.9);
  // 快门：最后 0.2 秒黑一下
  if (lt > d - .2) flash('#000000', 1 - Math.abs(lt - (d - .1)) / .1);
}

// ================= 车里的她 =================
function shCarGirl(lt, d) {
  // 车里很暗，对面车窗透出夜空
  rect(0, 0, W, H, '#07080e');
  withMask(maskPoly([40, 40, 200, 30, 210, 150, 40, 160]), () => { sky([[0, '#0a1230'], [1, '#2c3a74']]); stars(5, 20, 40, 30, 210, 160, lt); hills(8, 140, 10, .03, '#141c3a'); });
  rect(200, 20, 14, 160, '#0e0f16');
  ell(330, 120, 70, 60, '#11121a'); rect(270, 120, 120, 150, '#101118');
  const s = 30;
  bust(0, 232, 104, s, { cloth: 'blouse', col: 'white', turn: -.3, look: [-.7, 0], mouth: 'o', amb: ['#6070b0', .25], rim: ['#a8b8ff', -1, 0, .7], wind: .4, ph: lt * 3,
    after: (L, ox, oy, s) => { const hx = ox - .8 * s, hy = oy + 2.7 * s; rect(hx - 1.2 * s, hy - .6 * s, 2.3 * s, 1.15 * s, '#f6f0f6'); rect(hx - 1.2 * s, hy - .6 * s, 2.3 * s, .2 * s, '#ffffff'); circ(hx, hy, .4 * s, '#2a2a34'); circ(hx, hy, .22 * s, '#5a6a9a'); px(hx - .1 * s, hy - .1 * s, '#ffffff');
      ell(hx - 1.3 * s, hy + .1 * s, .42 * s, .36 * s, SKIN.b); ell(hx + 1.2 * s, hy + .1 * s, .42 * s, .36 * s, SKIN.b); } });
  // 车门和车窗框（在最前面）
  poly([0, 0, W, 0, W, 34, 430, 30, 60, 30, 20, 40, 0, 40], '#14151d');
  poly([0, 214, 60, 206, 440, 200, W, 202, W, H, 0, H], '#121319');
  rect(0, 0, 22, H, '#14151d'); rect(452, 0, 28, H, '#14151d');
  line(60, 206, 440, 200, '#3a3e50'); line(22, 40, 22, 214, '#2a2c3a'); line(452, 30, 452, 202, '#2a2c3a');
  glowRect(60, 204, 380, 2, [140, 160, 230], .35);
  // 窗外掠过的光
  const ly = (lt * 300) % 520 - 60; glowRect(30, ly, 420, 5, [170, 190, 255], .35);
  bloom(.9, 3, .95); vignette(.55);
}
function shCarTwo(lt, d) {
  nightField(lt, 110);
  carGirls(236, 290, 3.1, lt, { arms: 1, m1: 'smile', e0: 'happy' });
  meadow(35, 50, -10, W + 10, 246, 290, lt, { cols: ['#f2b25a', '#c79af0'], h: 40, stem: '#243c30' });
  bloom(.9, 3, .95); vignette(.6);
}
function shWalkie(lt, d) {
  sky([[0, '#0e1a44'], [1, '#3a58a0']]);
  stars(23, 40, 0, 0, W, H, lt);
  const talk = Math.floor(beatN(lt + 14) * 2) % 2;
  bust(5, 250, 108, 34, { cloth: 'blouse', col: 'white', turn: -.15, look: [-.3, 0], mouth: talk ? 'open' : 'o', amb: ['#7088d0', .15], rim: ['#bcd0ff', -1, 0, .6],
    after: (L, ox, oy, s) => { const hx = ox - 1.05 * s, hy = oy + .95 * s;
      rect(hx - .45 * s, hy - .9 * s, 1.0 * s, 2.0 * s, '#ff9cc2'); rect(hx - .45 * s, hy - .9 * s, 1.0 * s, .2 * s, '#ffd0e2');
      rect(hx - .2 * s, hy - 1.7 * s, .22 * s, .8 * s, '#e87aa6'); for (let i = 0; i < 4; i++) rect(hx - .3 * s, hy - .5 * s + i * .3 * s, .7 * s, 1, '#e06a98');
      px(hx + .3 * s, hy - .6 * s, '#ffffff'); px(hx - .2 * s, hy + .7 * s, '#fff2a0');
      thick(hx + .1 * s, hy + .9 * s, hx + .6 * s, hy + 2.8 * s, .34 * s, SKIN.b); ell(hx + .1 * s, hy + .6 * s, .45 * s, .35 * s, SKIN.b); } });
  bloom(.9, 3, .95); vignette(.5);
}

// ================= 紫色原野：石碑、冰块 =================
function monolith(x, y, w, h, lt, o) { // (x,y) 底边中点
  o = o || {}; const x0 = x - w / 2, y0 = y - h;
  rect(x0, y0 + w / 2, w, h - w / 2, '#c58ac8'); ell(x, y0 + w / 2, w / 2, w / 2, '#c58ac8');
  rect(x0 + 2, y0 + w / 2, w - 4, h - w / 2, '#d9a2d8'); ell(x, y0 + w / 2, w / 2 - 2, w / 2 - 2, '#d9a2d8');
  rect(x0 + w - 5, y0 + w / 2, 3, h - w / 2, '#a46ab0');
  // 闪粉
  const r = rng(o.seed || 3);
  for (let i = 0; i < w * h / 6; i++) { const xx = x0 + r() * w, yy = y0 + r() * h; if (yy < y0 + w / 2 && Math.hypot(xx - x, yy - (y0 + w / 2)) > w / 2) continue; const tw = Math.sin(lt * (2 + r() * 4) + i) > .7; px(xx, yy, tw ? '#ffffff' : (r() < .5 ? '#f0c4ee' : '#b47ac0')); if (tw) glow(xx, yy, 1.5, [255, 220, 255], .3); }
  // 霓虹心
  const hx = x + w * .12, hy = y0 + h * .3, hs = w * .32;
  heart(hx, hy, hs + 2, '#4a1a40'); heart(hx, hy, hs, '#1a0c1a'); heart(hx - hs * .3, hy - hs * .35, hs * .25, '#3a2440');
  const on = o.on === undefined ? 1 : o.on;
  if (on > 0) { const fl = on * (h2(Math.floor(lt * 20), 1, 1) > .08 ? 1 : .3);
    text('Need', hx, hy - hs * .55, '#ffd0e6', { al: 'c', a: fl }); text('HEART', hx, hy - hs * .05, '#ffd0e6', { al: 'c', a: fl });
    onGlow(() => { text('Need', hx, hy - hs * .55, '#ff4aa0', { al: 'c', a: fl }); text('HEART', hx, hy - hs * .05, '#ff4aa0', { al: 'c', a: fl }); }); glow(hx, hy, hs * 1.5, [255, 60, 150], .35 * fl); }
  // 发光的台阶
  if (o.steps !== false) for (let i = 0; i < 4; i++) { const sw = w * .55 - i * 4, sx = x + w * .5 - 2, sy = y - i * 4; rect(sx, sy - 4, sw, 4, '#b8f4ff'); rect(sx, sy - 4, sw, 1, '#ffffff'); glowRect(sx, sy - 4, sw, 4, [120, 230, 255], .5); }
}
function purpleGround(lt, horizon, o) {
  o = o || {};
  violetHills(lt, horizon, { moon: o.moon });
  // 一团团毛茸茸的薰衣草丛
  const r = rng(o.seed || 51);
  const bs = []; for (let i = 0; i < (o.bushes || 26); i++) { const y = horizon + 30 + r() * (H - horizon - 30); bs.push([r() * W, y, 5 + (y - horizon) * .12]); }
  bs.sort((a, b) => a[1] - b[1]);
  for (const [x, y, s] of bs) bush(x, y, s, ['#4a3480', '#6e56aa', '#9a82d2', '#d8b8ff'], Math.floor(x));
  meadow((o.seed || 51) + 1, 140, 0, W, horizon + 40, H + 6, lt, { cols: ['#c8a6ff', '#9a7ad8', '#e4d0ff', '#ff9ad6'], lav: 1, h: 16, stem: '#3a2c5c' });
}
function shMonolith(lt, d) {
  purpleGround(lt, 150, { moon: [410, 40, 10] });
  monolith(170, 236, 64, 150, lt, {});
  fig(6, 316, 236, 40, { top: 'puff', col: 'pink', skirt: 'mid', shoes: 'boots', pose: POSE.stand(), dir: -1, amb: ['#a080e0', .22] });
  fireflies(9, 12, 0, 120, W, 260, lt, '#ffd0f0');
  bloom(1, 3, .9); vignette(.55);
}
function iceGirlInner(g, s, lt) { // 冰里的她：手贴着冰
  return (L) => { bust(g, L.w / 2, L.h * .36, s, { cloth: 'strap', col: 'pink', bow: '#ffb8d0', look: [0, 0], mouth: 'n',
    after: (Lb, ox, oy, ss) => { for (const sd of [-1, 1]) { const hx = ox + sd * 1.25 * ss, hy = oy + .3 * ss; thick(ox + sd * 1.6 * ss, oy + 2.4 * ss, hx, hy + .6 * ss, .38 * ss, SKIN.b); ell(hx, hy, .5 * ss, .62 * ss, SKIN.b); for (let f = -1; f <= 2; f++) thick(hx + f * .2 * ss, hy - .3 * ss, hx + f * .25 * ss, hy - .95 * ss, .12 * ss + .3, SKIN.b); } } }); };
}
function shIceGirl(lt, d) {
  purpleGround(lt, 120, { bushes: 14 });
  const push = lt * 4;
  iceBlock(150 - push * .3, 20, 180 + push * .6, 250, { inner: iceGirlInner(0, 22 + push * .08, lt), bg: [[0, '#6a58a8'], [1, '#c9a8e8']], frost: .32, cracks: 4 });
  sparkles(12, 30, 140, 20, 340, 260, lt, { col: '#ffffff' });
  bloom(1, 3, .9); vignette(.5);
}
function lily(x, y, s, lt, col) { // 前景的大百合（暗紫）
  const c = C(col || '#5a3e96'), l = lit(c, .25), sw = Math.sin(lt * 1.3 + x) * 2;
  line(x, y + 40, x + sw, y, '#2a2048', 1, 2);
  for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + (i - 2) * .55; const ex = x + sw + Math.cos(a) * s, ey = y + Math.sin(a) * s * .8; poly([x + sw, y, ex - Math.sin(a) * s * .25, ey + Math.cos(a) * s * .1, ex, ey, ex + Math.sin(a) * s * .25, ey - Math.cos(a) * s * .1], i % 2 ? c : l); }
  circ(x + sw, y, s * .18, '#e8d070');
}
function shIceWide(lt, d) {
  const pan = lt * 10;
  purpleGround(lt, 140, { moon: [440 - pan * .3, 34, 9], bushes: 22 });
  monolith(120 - pan, 222, 46, 112, lt, { steps: true });
  iceBlock(250 - pan, 128, 52, 96, { inner: (L) => fig(0, L.w / 2, L.h - 4, 70, { top: 'strap', col: 'pink', skirt: 'mid', pose: { la: [2.6, .3], ra: [2.6, .3] } }), bg: [[0, '#6a58a8'], [1, '#b89ad8']], frost: .35 });
  for (const [hx, ph] of [[360, 0], [420, 1]]) horseSil(hx - pan * .6, 168, 1.4, '#3c2c6a', lt * 2 + ph);
  lily(40, 220, 26, lt); lily(430, 235, 30, lt, '#6a4aa8'); lily(470, 210, 22, lt);
  fireflies(14, 16, 0, 140, W, 260, lt, '#e0d0ff');
  bloom(1, 3, .9); vignette(.55);
}
function shNeedHeart(lt, d) {
  rect(0, 0, W, H, '#c58ac8');
  const r = rng(77);
  for (let i = 0; i < 2600; i++) { const x = r() * W, y = r() * H; const tw = Math.sin(lt * (2 + r() * 5) + i) > .75; px(x, y, tw ? '#ffffff' : (r() < .5 ? '#f2c8ee' : '#a868b8')); if (tw) glow(x, y, 2, [255, 220, 255], .35); }
  const hx = 240, hy = 140, hs = 92 + lt * 6;
  heart(hx, hy, hs + 5, '#3a1430'); heart(hx, hy, hs, '#140812'); heart(hx - hs * .35, hy - hs * .38, hs * .22, '#2a1a30'); heart(hx - hs * .38, hy - hs * .42, hs * .08, '#4a3a58');
  const on = h2(Math.floor(lt * 18), 2, 5) > .12 || lt > .5 ? 1 : .2;
  text('Need', hx, hy - 52, '#ffe0f0', { al: 'c', sc: 3, a: on }); text('HEART', hx, hy - 6, '#ffe0f0', { al: 'c', sc: 4, a: on });
  onGlow(() => { text('Need', hx, hy - 52, '#ff3a96', { al: 'c', sc: 3, a: on }); text('HEART', hx, hy - 6, '#ff3a96', { al: 'c', sc: 4, a: on }); });
  bloom(1.2, 4, .92); vignette(.5);
}

// ================= 湖、小马 =================
function shLake(lt, d) {
  const hz = 150;
  sky([[0, '#1a1640'], [.7, '#4a3a86'], [1, '#8a6cc0']], 0, hz);
  stars(31, 60, 0, 0, W, hz - 20, lt);
  moon(360, 44, 12, { halo: '#b8a0ff' });
  hills(33, hz, 26, .01, '#4a3a80', { rim: '#7a62b0' });
  // 湖面：倒影一行行翻过来，加波纹
  for (let y = hz; y < H; y++) for (let x = 0; x < W; x++) {
    const ry = hz - (y - hz) - 1; const wob = Math.round(Math.sin(y * .5 + lt * 2) * (y - hz) * .03);
    const sx = clamp(x + wob, 0, W - 1), sy = clamp(ry, 0, H - 1);
    const i = (sy * W + sx) * 3; const c = [F.d[i] * .75 + 10, F.d[i + 1] * .72 + 8, F.d[i + 2] * .85 + 18];
    pp(x, y, (y + Math.floor(lt * 3)) % 7 === 0 ? lit(c, .08) : c);
  }
  for (let y = hz + 4; y < H; y += 3) { const w = 6 + (y - hz) * .12 + Math.sin(y + lt * 5) * 3; rect(360 - w / 2 + Math.sin(y * .7 + lt * 3) * 3, y, w, 1, [230, 220, 255], .55); }
  // 岸
  poly([0, 190, 140, 200, 200, 230, 210, H, 0, H], '#2e2456'); meadow(61, 50, 0, 190, 196, 272, lt, { cols: ['#c8a6ff', '#ff9ad6'], lav: 1, h: 14, stem: '#2a2048' });
  pony(96, 214, 2.2, { amb: ['#9a80e0', .25], t: lt });
  ell(470, 262, 50, 26, '#2e2456'); heart(462, 236, 18, '#5a4290'); heart(458, 232, 11, '#7a60b4');
  fireflies(19, 18, 0, 140, W, 260, lt, '#ffe8a8');
  bloom(1, 3, .9); vignette(.55);
}
function shHillCar(lt, d) {
  sky([[0, '#050a20'], [1, '#26346a']]);
  stars(37, 120, 0, 0, W, 200, lt, { big: .12 });
  const mv = lt / d;
  // 坡：从左下到右上
  poly([0, 170, 280, 120, W, 132, W, H, 0, H], '#0e1424');
  for (let i = 0; i < 40; i++) { const x = ((i * 37 + lt * 400) % 560) - 40, y = 170 - x * .17 + 18 + (i % 5) * 18; line(x, y, x - 30, y + 5, '#2a3a5a', .6); }
  suvSide(150 + mv * 220, 144 - mv * 38 + 8, 1.1, { dir: 1, lights: 1, spin: lt * 20 });
  // 前景高草，速度线
  grass(41, 90, 0, W, 230, 275, lt, '#1e2e3a', { h: 20, wind: 4 });
  bloom(1, 3, .95); vignette(.6);
}

// ================= 第一段副歌：雪夜、屋顶 =================
function nightSnowSky(lt) {
  sky([[0, '#0a1430'], [.6, '#1c2e64'], [1, '#2e447e']]);
  cloud(120 - lt * 3, 210, 260, 26, ['#1e2c5c', '#2c3e74', '#3e5490'], 4);
  cloud(400 - lt * 4, 230, 240, 22, ['#1e2c5c', '#2c3e74', '#3e5490'], 5);
  stars(43, 40, 0, 0, W, 160, lt);
}
function shSnowProfile(lt, d, o) {
  nightSnowSky(lt);
  const dir = o.dir || 1;
  profBust(o.g, dir > 0 ? 210 : 270, 92, 28, { dir, cloth: o.g === 1 ? 'strap' : 'puff', col: 'blue', wind: 1.2, ph: lt * 4, amb: ['#7a90d0', .2], rim: ['#d8e4ff', dir, 0, .6] });
  snow(47, 70, lt, { wind: 10 });
  bloom(.9, 3, .95); vignette(.5);
}
function shSnowBob(lt, d) {
  nightSnowSky(lt);
  const tr = -.8 + smooth(ramp(lt, .1, 1.0)) * .8;
  if (tr < -.55) profBust(2, 250, 96, 28, { dir: -1, cloth: 'strap', col: 'white', amb: ['#7a90d0', .2], rim: ['#d8e4ff', -1, 0, .6] });
  else bust(2, 250, 96, 28, { cloth: 'strap', col: 'white', turn: tr, look: [tr * .5, 0], amb: ['#7a90d0', .2], rim: ['#d8e4ff', -1, 0, .5], ear: true });
  snow(48, 70, lt, { wind: 10 });
  bloom(.9, 3, .95); vignette(.5);
}
function shRooftop(lt, d, o) {
  const near = o.near;
  sky([[0, '#060c26'], [.7, '#1a2a5a'], [1, '#30447e']]);
  stars(51, 80, 0, 0, W, 140, lt);
  moon(240, near ? 50 : 46, near ? 26 : 20, { halo: '#9fb4ff', ha: .3 });
  cloud(80, 132, 200, 16, ['#24346a', '#34487e', '#4a6098'], 6); cloud(400, 138, 220, 14, ['#24346a', '#34487e', '#4a6098'], 7);
  const ry = near ? 190 : 176;
  // 玻璃拱顶
  vgrad(0, ry - 10, W, 14, [[0, '#9cb4e8'], [1, '#4a5c92']], 5);
  for (let x = 0; x < W; x += 16) { line(x, ry - 10, x, ry + 3, '#2c3a64'); }
  rect(0, ry + 3, W, 3, '#c8d4f0');
  // 楼面
  rect(0, ry + 6, W, H, '#1c2444');
  for (let x = 8; x < W; x += 56) { rect(x, ry + 26, 30, 50, '#0e1224'); rect(x + 2, ry + 28, 26, 46, ((x / 56) | 0) % 3 === 1 ? '#ffcf8a' : '#2a3458'); glow(x + 15, ry + 22, 4, [255, 200, 130], .6); rect(x + 12, ry + 18, 6, 3, '#ffe0a8'); }
  rect(0, ry + 6, W, 4, '#2a3458');
  // 跳舞的两个人
  const hgt = near ? 56 : 38;
  fig(1, 214, ry - 6, hgt, { top: 'puff', col: 'blue', skirt: 'long', shoes: 'boots', pose: POSE.dance(lt + 23.1, 0), amb: ['#8098e0', .2], wind: 1, ph: lt * 4 });
  fig(2, 266, ry - 6, hgt, { top: 'strap', col: 'white', skirt: 'mid', shoes: 'boots', legs: 'bare', pose: POSE.dance(lt + 23.1, 4), amb: ['#8098e0', .2] });
  snow(52, 60, lt, { wind: 8 });
  bloom(1, 3, .95); vignette(.55);
}
function shBlueBust(lt, d, o) {
  sky([[0, '#0c1a46'], [1, '#2a4a92']]);
  sparkles(57, 30, 0, 0, W, H, lt, { col: '#cfe0ff' });
  bust(o.g, 240, 104 - lt * 2, 36, { cloth: 'strap', col: 'white', turn: -.1, look: [0, 0], mouth: 'n', eyes: lt > d - .5 && lt < d - .38 ? 'closed' : 'open', amb: ['#7088d0', .2], rim: ['#c8d8ff', 1, 0, .6], ear: true, wind: .5, ph: lt * 3 });
  bloom(.9, 3, .95); vignette(.5);
}
