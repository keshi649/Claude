'use strict';
/* vportrait.js —— 特写的大头像：先在 4 倍大的离屏画布上用平滑曲线画（平涂，颜色全部来自一套调色板），
   再按每 4×4 一块取"占得最多的那个调色板颜色"缩回像素网格，最后描一圈外轮廓。曲线干净，缩下来就是规整的像素画。
   转头：五官、刘海按"圆柱"投影：x → sin(asin(x) + yaw)，转过去的那边压窄、被脸挡住。|yaw| > 1.1 时画背影。
   vhead({ x, y, R, yaw, tilt, look, expr, gaze, t, wind, light, rim, out }) —— (x, y) 是脸的中心（两眼之间偏下），R：脸半宽（格） */
const VP = {
  she: {
    skin: ['#fde8d8', '#f6d0b6', '#e4a88e'], hair: ['#7a5250', '#4e3234', '#33202a', '#a8786a'], iris: ['#2e1c2a', '#6a3a3e', '#b07458', '#e0b088'],
    line: '#2a1622', blush: '#f29a96', lip: '#c4586a', tie: '#e8343e', pony: true, bangs: 'girl', lash: 1, uni: 'uni',
  },
  sheA: {
    skin: ['#fde8d8', '#f6d0b6', '#e4a88e'], hair: ['#7a5250', '#4e3234', '#33202a', '#a8786a'], iris: ['#2e1c2a', '#6a3a3e', '#b07458', '#e0b088'],
    line: '#2a1622', blush: '#f29a96', lip: '#c4586a', long: true, bangs: 'part', lash: 1, uni: 'cardigan',
  },
  he: {
    skin: ['#fce6d2', '#f2cdb0', '#dca286'], hair: ['#4c3e5c', '#2e2438', '#1c1624', '#6e5c86'], iris: ['#1e1828', '#40324a', '#7a6478', '#a898a8'],
    line: '#1e1420', blush: '#efa09a', lip: '#b8606a', bangs: 'boy', lash: 0, uni: 'uni', cowlick: true,
  },
  heA: {
    skin: ['#fce6d2', '#f2cdb0', '#dca286'], hair: ['#4c3e5c', '#2e2438', '#1c1624', '#6e5c86'], iris: ['#1e1828', '#40324a', '#7a6478', '#a898a8'],
    line: '#1e1420', blush: '#efa09a', lip: '#b8606a', bangs: 'boy', lash: 0, uni: 'shirt', cowlick: true,
  },
};
VP.sheA2 = { ...VP.sheA, long: false, pony: true, tie: '#e8343e' };
const VSS = 4;                                        // 离屏画布是像素网格的几倍
const _vc = document.createElement('canvas'), _vg = _vc.getContext('2d', { willReadFrequently: true });
const _hex = h => [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)];

function vhead(o) {
  const P = VP[o.look] || VP.she, R = o.R, t = o.t ?? 0, ex = o.expr || {}, gz = o.gaze || [0, 0];
  const yaw = o.yaw ?? 0, wind = o.wind ?? 0;
  // 画布：脸宽 2R，上下左右留够头发、马尾、肩膀（o.box = [左, 上, 右, 下]，单位是 R）
  const box = o.box || [-2.6, -2.0, 2.6, 3.6];
  const bw = Math.ceil(R * (box[2] - box[0])), bh = Math.ceil(R * (box[3] - box[1])), ox = Math.round(-box[0] * R), oy = Math.round(-box[1] * R);
  _vc.width = bw * VSS; _vc.height = bh * VSS;
  const g = _vg; g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, _vc.width, _vc.height);
  g.setTransform(R * VSS, 0, 0, R * VSS, ox * VSS, oy * VSS);             // 单位：1 = 半个脸宽
  if (o.tilt) g.rotate(o.tilt);
  g.lineJoin = 'round'; g.lineCap = 'round';
  const back = Math.abs(yaw) > 1.15;
  const sy = Math.sin(yaw), cy = Math.cos(yaw);
  /* 脸的每个高度 y 上是一个横截面：半宽 a、前后半深 b、中心往前凸 zc（下巴往前）。五官按截面上的位置投影，脸的轮廓 = 截面转过去以后的左右边 */
  const xsec = y => { if (y <= .15) { const k = y < -.6 ? Math.sqrt(Math.max(0, 1 - ((y + .6) / .9) ** 2)) : 1; return [k, k, 0]; } const v = Math.min(1, (y - .15) / .87); return [Math.max(.06, 1 - .92 * v ** 1.7), .95 - .5 * v, .32 * v]; };
  const cyl = (x, y) => { const [a, b, zc] = xsec(y), X = clamp(x, -1, 1) * a, Z = zc + b * Math.sqrt(Math.max(0, 1 - clamp(x, -1, 1) ** 2)); return [X * cy + Z * sy, y, -X * sy + Z * cy]; };
  const contour = y => { const [a, b, zc] = xsec(y), c = zc * sy, e = Math.sqrt((a * cy) ** 2 + (b * sy) ** 2); return [c - e, c + e]; };
  const fill = (c, path) => { g.fillStyle = c; g.beginPath(); path(); g.fill(); };
  const stroke = (c, w, path) => { g.strokeStyle = c; g.lineWidth = w; g.beginPath(); path(); g.stroke(); };
  const LW = 1.15 / R;                                 // 一格宽的线
  const H = P.hair, S = P.skin;
  const sway = Math.sin(t * 1.7) * .03 + wind * .12;

  /* ---------- 后面的头发：马尾、长发、后脑勺 ---------- */
  const ponyRoot = [-sy * .85, -.95];
  const drawPony = () => {
    const n = 7; let px = ponyRoot[0], py = ponyRoot[1]; const pts = [[px, py]];
    for (let i = 1; i <= n; i++) { const a = (yaw > 0 ? -1 : 1) * (back ? .2 : .9) * (1 - i / n * .6) * Math.min(1, Math.abs(sy) * 1.6 + .2) + sway * (i / n) * 3 + Math.sin(t * 2.6 + i * .7) * .03; px += Math.sin(a) * .32; py += Math.cos(a) * .32; pts.push([px, py]); }
    const wv = i => .34 * (1 - i / n * .7);
    const left = pts.map((p, i) => [p[0] - wv(i), p[1]]), right = pts.map((p, i) => [p[0] + wv(i), p[1]]).reverse();
    fill(H[1], () => { g.moveTo(...left[0]); for (const p of left) g.lineTo(...p); for (const p of right) g.lineTo(...p); g.closePath(); });
    stroke(H[0], LW * 1.5, () => { g.moveTo(pts[0][0] - .08, pts[0][1]); for (let i = 1; i < pts.length - 1; i++) g.lineTo(pts[i][0] - wv(i) * .4, pts[i][1]); });
    stroke(H[2], LW, () => { g.moveTo(pts[1][0] + .1, pts[1][1]); for (let i = 2; i < pts.length - 1; i++) g.lineTo(pts[i][0] + wv(i) * .35, pts[i][1]); });
    // 发绳
    fill(P.tie || '#e8343e', () => g.ellipse(ponyRoot[0], ponyRoot[1] + .05, .16, .1, 0, 0, TAU));
    fill('#ff8a8a', () => g.ellipse(ponyRoot[0] - .05, ponyRoot[1] + .02, .05, .03, 0, 0, TAU));
  };
  const drawLongBack = () => {
    fill(H[2], () => { g.moveTo(-1.15, -.4); g.bezierCurveTo(-1.35, .6, -1.3 + sway, 1.5, -1.05 + sway, 2.1); g.lineTo(1.05 + sway, 2.1); g.bezierCurveTo(1.3 + sway, 1.5, 1.35, .6, 1.15, -.4); g.closePath(); });
    for (let k = 0; k < 6; k++) stroke(H[1], LW * 1.2, () => { const x = -1 + k * .4; g.moveTo(x, .3); g.quadraticCurveTo(x * 1.1 + sway, 1.3, x * 1.05 + sway * 1.5, 2.0); });
  };
  if (P.long) drawLongBack();
  if (P.pony && !back) drawPony();
  const U = { g, fill, stroke, LW, P, t, R, yaw, sy, cy };
  if (o.behind) { g.save(); o.behind(U); g.restore(); }

  /* ---------- 脖子、肩膀 ---------- */
  if (o.body !== false) {
    const bxs = -sy * .18;
    fill(S[1], () => { g.moveTo(-.3 + bxs, .7); g.lineTo(.3 + bxs, .7); g.lineTo(.34 + bxs, 1.5); g.lineTo(-.34 + bxs, 1.5); g.closePath(); });
    fill(S[2], () => { g.moveTo(-.3 + bxs, .7); g.lineTo(.3 + bxs, .7); g.lineTo(.32 + bxs, 1.0); g.quadraticCurveTo(bxs, 1.12, -.32 + bxs, 1.0); g.closePath(); });
    const shirt = P.uni === 'cardigan' ? ['#efe2cc', '#cdbb9e'] : P.uni === 'shirt' ? ['#f6f8fc', '#c8d0e2'] : ['#f6f8fc', '#c6d0e4'];
    fill(shirt[0], () => { g.moveTo(-.45 + bxs, 1.3); g.quadraticCurveTo(-1.2 + bxs, 1.38, -1.45 + bxs, 2.1); g.lineTo(-1.6, 3.6); g.lineTo(-1.7, 9); g.lineTo(1.7, 9); g.lineTo(1.6, 3.6); g.lineTo(1.45 + bxs, 2.1); g.quadraticCurveTo(1.2 + bxs, 1.38, .45 + bxs, 1.3); g.closePath(); });
    fill(shirt[1], () => { g.moveTo(.55 + bxs, 1.38); g.quadraticCurveTo(1.2 + bxs, 1.42, 1.45 + bxs, 2.1); g.lineTo(1.6, 3.6); g.lineTo(1.7, 9); g.lineTo(1.1, 9); g.lineTo(1.0, 3.6); g.quadraticCurveTo(1.05, 2.3, .55 + bxs, 1.38); g.closePath(); });
    if (P.uni === 'uni') {
      // 蓝色翻领
      fill('#3266c4', () => { g.moveTo(-.55 + bxs, 1.3); g.lineTo(bxs, 2.05); g.lineTo(-.15 + bxs, 2.25); g.lineTo(-.95 + bxs, 1.55); g.closePath(); });
      fill('#234c96', () => { g.moveTo(.55 + bxs, 1.3); g.lineTo(bxs, 2.05); g.lineTo(.15 + bxs, 2.25); g.lineTo(.95 + bxs, 1.55); g.closePath(); });
      stroke('#d8dfee', LW, () => { g.moveTo(bxs, 2.2); g.lineTo(bxs - .05, 9); });
    } else if (P.uni === 'cardigan') {
      fill('#a8c0e0', () => { g.moveTo(-.45 + bxs, 1.32); g.lineTo(.45 + bxs, 1.32); g.lineTo(bxs, 2.1); g.closePath(); });
      stroke('#b8a688', LW * 1.4, () => { g.moveTo(-.48 + bxs, 1.35); g.lineTo(-.25 + bxs, 3.6); g.moveTo(.48 + bxs, 1.35); g.lineTo(.25 + bxs, 3.6); });
    } else {
      fill('#ffffff', () => { g.moveTo(-.5 + bxs, 1.3); g.lineTo(bxs, 1.85); g.lineTo(-.35 + bxs, 2.0); g.closePath(); g.moveTo(.5 + bxs, 1.3); g.lineTo(bxs, 1.85); g.lineTo(.35 + bxs, 2.0); g.closePath(); });
    }
  }

  /* ---------- 头 ---------- */
  // 后脑勺（头发的大轮廓，比脸大一圈）
  fill(H[1], () => g.ellipse(-sy * .12, -.42, 1.17, 1.02, 0, 0, TAU));
  if (back) {
    // 背影：后脑勺的头发、光环、马尾在最上面
    fill(H[0], () => g.ellipse(-sy * .12 - .2, -.75, .7, .32, -.2, 0, TAU));
    stroke(H[3], LW * 1.5, () => { g.ellipse(-sy * .12, -.62, .85, .5, 0, Math.PI * 1.15, Math.PI * 1.85); });
    for (let k = -2; k <= 2; k++) stroke(H[2], LW, () => { g.moveTo(k * .3, -.2); g.quadraticCurveTo(k * .32, .2, k * .28, .5); });
    // 脖子后面露一点
    fill(S[2], () => { g.moveTo(-.25, .45); g.lineTo(.25, .45); g.lineTo(.3, .85); g.lineTo(-.3, .85); g.closePath(); });
    if (P.pony) drawPony();
  } else {
    // 耳朵（转过去的那边看得见）
    const earX = sy > .15 ? -1 : sy < -.15 ? 1 : 0;
    if (earX) { const e = cyl(earX * .99, .1); fill(S[1], () => g.ellipse(e[0] - earX * .08, .12, .12, .2, 0, 0, TAU)); fill(S[2], () => g.ellipse(e[0] - earX * .06, .14, .05, .1, 0, 0, TAU)); }
    // 脸
    const faceL = [], faceR = [];
    // 脸的左右边：两边太阳穴（截面上 x = ±0.92）；转到背面看不见的那边，用截面的轮廓
    for (let i = 0; i <= 24; i++) {
      const y = lerp(-.75, 1.02, i / 24), [l, r] = contour(y), tl = cyl(-.92, y), tr = cyl(.92, y);
      faceL.push([tl[2] > 0 ? Math.max(l, tl[0]) : l, y]); faceR.push([tr[2] > 0 ? Math.min(r, tr[0]) : r, y]);
    }
    fill(S[1], () => { g.moveTo(faceL[0][0], faceL[0][1]); for (const p of faceL) g.lineTo(Math.max(p[0], -1), p[1]); for (let i = faceR.length - 1; i >= 0; i--) g.lineTo(Math.min(faceR[i][0], 1), faceR[i][1]); g.closePath(); });
    // 脸侧的阴影（背光那边）、刘海下的阴影
    const shSide = -1;                               // 光从左边来：右边是暗面
    fill(S[2], () => { const a = faceR; g.moveTo(a[8][0] - .08, a[8][1]); for (let i = 8; i <= 22; i++) g.lineTo(a[i][0] - .1 * Math.sin((i - 8) / 14 * Math.PI) - .02, a[i][1]); for (let i = 22; i >= 8; i--) g.lineTo(a[i][0], a[i][1]); g.closePath(); });
    // 腮红
    const bl = ex.blush ?? .5;
    if (bl > 0) for (const sd of [-1, 1]) { const c = cyl(sd * .55, .5); if (c[2] < .2) continue; g.globalAlpha = Math.min(1, bl); fill(P.blush, () => g.ellipse(c[0], c[1], .2 * c[2], .09, 0, 0, TAU)); for (let k = -1; k <= 1; k++) stroke('#e8787a', LW * .9, () => { g.moveTo(c[0] + k * .08 * c[2] - .03, c[1] + .05); g.lineTo(c[0] + k * .08 * c[2] + .03, c[1] - .05); }); g.globalAlpha = 1; }
    // 眼睛
    for (const sd of [-1, 1]) drawEye(g, P, cyl, sd, ex, gz, t, LW);
    // 鼻子、嘴
    const nz = cyl(0, .42); stroke(S[2], LW * 1.2, () => { g.moveTo(nz[0] + .02, nz[1] - .04); g.lineTo(nz[0] + .05 * (sy >= 0 ? 1 : -1), nz[1] + .03); });
    drawMouth(g, P, cyl, ex, LW);
    // 刘海、鬓角（在脸上面）
    drawBangs(g, P, cyl, yaw, t, wind, LW);
    if (P.cowlick) { const c = cyl(.1, -1.38); stroke(H[1], LW * 3.5, () => { g.moveTo(c[0] - .1, -1.25); g.quadraticCurveTo(c[0] + .05, -1.55, c[0] + .3 + Math.sin(t * 3) * .03, -1.5); }); }
  }
  if (o.front) { g.save(); o.front(U); g.restore(); }
  const Sf = vpixelize(bw, bh);
  outline(Sf, C(parseInt((o.out || P.line).slice(1), 16)));
  if (o.rim) rimLight(Sf, o.rim[2] ?? -1, o.rim[3] ?? 0, C(o.rim[0]), o.rim[1] ?? .5, o.rim[4] ?? 1);
  if (o.tint) tintSurf(Sf, C(o.tint[0]), o.tint[1]);
  blit(Sf, Math.round(o.x - ox), Math.round(o.y - oy), { alpha: o.alpha ?? 1 });
  return { cyl, map: (x, y) => { const c = cyl(x, y); return [o.x + c[0] * R, o.y + c[1] * R]; } };
}
/* 把 _vc 上画好的（4 倍大）缩回像素网格：调色板 = 画布里出现得多的颜色（抗锯齿的边是混出来的颜色，出现得少）；
   每 4×4 一块，每格先归到最近的调色板颜色，取占得最多的那个 */
function vpixelize(bw, bh, name = 'vhead') {
  const img = _vg.getImageData(0, 0, _vc.width, _vc.height).data, n = _vc.width * _vc.height;
  const hist = new Map();
  for (let i = 0; i < n; i++) { if (img[i * 4 + 3] < 255) continue; const k = (img[i * 4] << 16) | (img[i * 4 + 1] << 8) | img[i * 4 + 2]; hist.set(k, (hist.get(k) || 0) + 1); }
  const keys = [...hist.entries()].filter(([, c]) => c >= 10).map(([k]) => k);
  const pal = keys.map(k => [k >> 16, (k >> 8) & 255, k & 255]), palC = keys.map(k => C(k));
  const Sf = layer(name, bw, bh), cnt = new Float32Array(pal.length), cache = new Map();
  for (let py = 0; py < bh; py++) for (let px = 0; px < bw; px++) {
    cnt.fill(0); let opaque = 0;
    for (let j = 0; j < VSS; j++) for (let i = 0; i < VSS; i++) {
      const q = ((py * VSS + j) * _vc.width + px * VSS + i) * 4; if (img[q + 3] < 110) continue; opaque++;
      const key = (img[q] << 16) | (img[q + 1] << 8) | img[q + 2];
      let best = cache.get(key);
      if (best === undefined) { let bd = 1e9; best = 0; for (let k = 0; k < pal.length; k++) { const d = (img[q] - pal[k][0]) ** 2 + (img[q + 1] - pal[k][1]) ** 2 + (img[q + 2] - pal[k][2]) ** 2; if (d < bd) { bd = d; best = k; } } cache.set(key, best); }
      cnt[best] += hist.has(key) && hist.get(key) >= 10 ? 2 : 1;
    }
    if (opaque < VSS * VSS * .45 || !pal.length) continue;
    let bk = 0; for (let k = 1; k < pal.length; k++) if (cnt[k] > cnt[bk]) bk = k;
    Sf.d32[py * bw + px] = palC[bk];
  }
  return Sf;
}

/* 眼睛：上眼线（往上拱的弧，外眼角挑一下）、虹膜（三档颜色、瞳孔、两颗高光）、一点眼白、下眼线、眉毛 */
function drawEye(g, P, cyl, sd, ex, gz, t, LW) {
  const c = cyl(sd * .4, .1); if (c[2] < .25) return;
  const k = clamp(c[2] * 1.15, .3, 1), w = .25 * k, h = P.lash ? .3 : .25, x = c[0], y = c[1];
  const fill = (col, path) => { g.fillStyle = col; g.beginPath(); path(); g.fill(); };
  const stroke = (col, lw, path) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); path(); g.stroke(); };
  const out = sd;                                   // 外眼角在哪边
  const E = ex.eyes || 'open';
  // 眉毛
  stroke(P.hair[1], LW * 1.4, () => { g.moveTo(x - w * .9 * out * -1 * -1 - out * w * .1, y - h * 1.15); g.quadraticCurveTo(x, y - h * 1.45, x + out * w * 1.05, y - h * (E === 'wide' ? 1.3 : 1.18)); });
  if (E === 'closed' || E === 'happy') {
    const up = E === 'happy' ? -1 : 1;
    stroke(P.line, LW * 2, () => { g.moveTo(x - w, y + .02); g.quadraticCurveTo(x, y + .02 + up * -h * .55, x + w, y + .02); });
    if (P.lash) stroke(P.line, LW * 1.5, () => { g.moveTo(x + out * w, y + .02); g.lineTo(x + out * (w + .07), y - .05); });
    return;
  }
  const lidDrop = E === 'half' ? h * .45 : E === 'wide' ? -h * .08 : 0;
  const top = y - h * .55 + lidDrop, bot = y + h * .55;
  // 眼白 + 虹膜，按上下眼皮裁
  g.save(); g.beginPath();
  g.moveTo(x - w, y - h * .1 + lidDrop * .6); g.quadraticCurveTo(x - w * .2, top - h * .25, x + out * w * .1 + w * .6 * out, top - h * .05); g.lineTo(x + out * w * 1.05, y - h * .2 + lidDrop * .6);
  g.quadraticCurveTo(x + out * w * .9, bot, x, bot); g.quadraticCurveTo(x - out * w * .9, bot - h * .05, x - out * w, y - h * .1);
  // 用矩形再框一下，保证闭合方向一致
  g.closePath(); g.clip();
  fill('#f4f0f0', () => g.rect(x - w * 1.2, top - h, w * 2.4, h * 2.4));
  const ix = x + gz[0] * w * .3, iy = y + gz[1] * h * .2 + h * .06, irx = w * .72, iry = h * .62;
  fill(P.iris[1], () => g.ellipse(ix, iy, irx, iry, 0, 0, TAU));
  fill(P.iris[2], () => g.ellipse(ix, iy + iry * .45, irx * .82, iry * .5, 0, 0, TAU));
  fill(P.iris[3], () => g.ellipse(ix, iy + iry * .62, irx * .55, iry * .26, 0, 0, TAU));
  fill(P.iris[0], () => g.ellipse(ix, iy - iry * .45, irx * 1.05, iry * .55, 0, 0, TAU));
  fill(P.iris[0], () => g.ellipse(ix, iy + iry * .05, irx * .36, iry * .42, 0, 0, TAU));
  fill('#ffffff', () => g.ellipse(ix - irx * .38, iy - iry * .3, irx * .3, iry * .26, -.3, 0, TAU));
  fill('#ffffff', () => g.ellipse(ix + irx * .42, iy + iry * .42, irx * .13, iry * .1, 0, 0, TAU));
  if (E === 'smile') fill(P.skin[1], () => { g.moveTo(x - w * 1.3, bot + h); g.lineTo(x - w * 1.3, y + h * .32); g.quadraticCurveTo(x, y - h * .05, x + w * 1.3, y + h * .32); g.lineTo(x + w * 1.3, bot + h); g.closePath(); });
  g.restore();
  // 上眼线：粗，外眼角挑起来
  stroke(P.line, LW * (P.lash ? 2.4 : 2), () => { g.moveTo(x - out * w * 1.0, y - h * .1 + lidDrop * .6); g.quadraticCurveTo(x - out * w * .2, top - h * .25, x + out * w * .7, top - h * .02); g.lineTo(x + out * w * 1.1, y - h * .22 + lidDrop * .6); });
  if (P.lash) stroke(P.line, LW * 1.6, () => { g.moveTo(x + out * w * 1.05, y - h * .2 + lidDrop * .6); g.lineTo(x + out * (w * 1.05 + .08), y - h * .42 + lidDrop * .4); });
  // 下眼线：外眼角一小截；笑眼时是一道往上弯的弧
  if (E === 'smile') stroke(P.skin[2], LW * 1.3, () => { g.moveTo(x - w * .9, y + h * .34); g.quadraticCurveTo(x, y + h * .02, x + w * .9, y + h * .34); });
  else stroke(P.skin[2], LW * 1.2, () => { g.moveTo(x + out * w * .95, y + h * .1); g.quadraticCurveTo(x + out * w * .6, bot + h * .05, x + out * w * .1, bot + h * .02); });
}
function drawMouth(g, P, cyl, ex, LW) {
  const m = cyl(0, .72); if (m[2] < .1) return;
  const k = clamp(m[2] * 1.2, .4, 1), x = m[0], y = m[1], w = .14 * k, M = ex.mouth || 'n';
  const stroke = (col, lw, path) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); path(); g.stroke(); };
  const fill = (col, path) => { g.fillStyle = col; g.beginPath(); path(); g.fill(); };
  if (M === 'smile') stroke(P.lip, LW * 1.5, () => { g.moveTo(x - w, y - .03); g.quadraticCurveTo(x, y + .07, x + w, y - .03); });
  else if (M === 'laugh' || M === 'open') {
    const hh = M === 'laugh' ? .13 : .1;
    fill('#7a2a3a', () => { g.moveTo(x - w * 1.1, y - .03); g.quadraticCurveTo(x, y - .01, x + w * 1.1, y - .03); g.quadraticCurveTo(x + w * .6, y + hh, x, y + hh); g.quadraticCurveTo(x - w * .6, y + hh, x - w * 1.1, y - .03); });
    fill('#f08a8a', () => g.ellipse(x, y + hh * .72, w * .55, hh * .3, 0, 0, TAU));
    if (M === 'laugh') fill('#ffffff', () => { g.rect(x - w * .8, y - .03, w * 1.6, .03); });
  } else if (M === 'o') fill('#7a2a3a', () => g.ellipse(x, y + .03, w * .4, .06, 0, 0, TAU));
  else stroke(P.lip, LW * 1.3, () => { g.moveTo(x - w * .55, y); g.lineTo(x + w * .55, y); });
}
/* 刘海、鬓角 */
function drawBangs(g, P, cyl, yaw, t, wind, LW) {
  const H = P.hair, fill = (col, path) => { g.fillStyle = col; g.beginPath(); path(); g.fill(); };
  const stroke = (col, lw, path) => { g.strokeStyle = col; g.lineWidth = lw; g.beginPath(); path(); g.stroke(); };
  const sw = Math.sin(t * 2.1) * .02 + wind * .05;
  // 头顶（发际线以上）整块盖住
  fill(H[1], () => { const a = cyl(-1.02, -.35), b = cyl(1.02, -.35); g.moveTo(a[0] - .1, a[1]); g.bezierCurveTo(a[0] - .2, -1.45, b[0] + .2, -1.45, b[0] + .1, b[1]); g.lineTo(b[0], -.5); g.lineTo(a[0], -.5); g.closePath(); });
  // 一绺一绺的刘海：每绺是一片尖叶子，从发际线垂下来
  const locks = P.bangs === 'boy' ? [[-.95, .5, -.08], [-.62, .44, -.05], [-.28, .5, 0], [.06, .46, .04], [.42, .42, .06], [.78, .46, .08]]
    : P.bangs === 'part' ? [[-.98, .62, -.1], [-.64, .42, -.12], [-.32, .3, -.14], [.2, .58, .12], [.56, .5, .1], [.9, .52, .08]]
      : [[-.96, .55, -.06], [-.64, .4, -.04], [-.3, .38, -.02], [.0, .5, .02], [.32, .4, .04], [.66, .42, .06], [.92, .52, .06]];
  const baseY = -.62;
  locks.forEach(([lx, len, lean], i) => {
    const w = .24, a = cyl(lx - w, baseY), b = cyl(lx + w, baseY), tip = cyl(lx + lean + sw, baseY + len);
    if (Math.max(a[2], b[2], tip[2]) < -.1) return;
    const col = i % 2 ? H[1] : H[0];
    fill(col, () => { g.moveTo(a[0], a[1] - .1); g.quadraticCurveTo(a[0] + .02, a[1] + len * .55, tip[0], tip[1]); g.quadraticCurveTo(b[0] - .02, b[1] + len * .5, b[0], b[1] - .1); g.closePath(); });
    stroke(H[2], LW * 1.1, () => { g.moveTo((a[0] + b[0]) / 2, a[1] + .02); g.quadraticCurveTo((a[0] + b[0]) / 2 + .02, a[1] + len * .5, tip[0] - .02, tip[1] - .06); });
  });
  // 头发的光环：一道亮弧
  const r0 = cyl(-.8, -.92), r1 = cyl(.75, -.98);
  stroke(H[3], LW * 2.2, () => { g.moveTo(r0[0], r0[1]); g.quadraticCurveTo((r0[0] + r1[0]) / 2, -1.16, r1[0], r1[1]); });
  stroke(H[0], LW * 1.2, () => { g.moveTo(r0[0] + .1, r0[1] + .1); g.quadraticCurveTo((r0[0] + r1[0]) / 2, -1.02, r1[0] - .1, r1[1] + .1); });
  // 鬓角：两缕从太阳穴垂到下巴
  if (P.bangs !== 'boy') for (const sd of [-1, 1]) {
    // 鬓角贴着脸的外轮廓垂下来；转到背面的那一缕被脸挡住，不画
    const sy_ = Math.sin(yaw); if (sd * sy_ > .25) continue;
    const edge = y => { const [a_, b_, zc] = y <= .15 ? [1, 1, 0] : (() => { const v = Math.min(1, (y - .15) / .87); return [Math.max(.06, 1 - .92 * v ** 1.7), .95 - .5 * v, .32 * v]; })(); const c_ = zc * sy_, e_ = Math.sqrt((a_ * Math.cos(yaw)) ** 2 + (b_ * sy_) ** 2); return sd < 0 ? c_ - e_ : c_ + e_; };
    const a = cyl(sd * .96, -.45), b = [edge(.45) + sd * .02, .45], c = [edge(.95) + sd * .06, 1.05];
    const s2 = sw * 2 + Math.sin(t * 1.9 + sd) * .02;
    fill(H[1], () => { g.moveTo(a[0] - sd * .16, a[1]); g.quadraticCurveTo(b[0] - sd * .12, b[1], c[0] + s2, c[1]); g.quadraticCurveTo(b[0] + sd * .14, b[1], a[0] + sd * .12, a[1]); g.closePath(); });
    stroke(H[0], LW, () => { g.moveTo(a[0] - sd * .04, a[1] + .1); g.quadraticCurveTo(b[0] - sd * .02, b[1], c[0] + s2 - sd * .02, c[1] - .1); });
  } else for (const sd of [-1, 1]) { const a = cyl(sd * .98, -.5), c = cyl(sd * .92, .2); if (a[2] < -.05) continue; fill(H[1], () => { g.moveTo(a[0] - sd * .1, a[1]); g.lineTo(c[0], c[1]); g.lineTo(a[0] + sd * .1, a[1]); g.closePath(); }); }
}

/* ---------------- 胳膊、手、道具（画在头像的同一块画布上，单位 = R） ---------------- */
/* 一条胳膊：side -1 画面左边那条 / 1 右边那条；a1 大臂角度（0 竖直向下，正 = 往画面右转），a2 小臂再弯多少。
   sleeve 'short'（短袖：袖子盖住大臂七成，蓝袖口）| 'long'。返回手的位置和朝向 */
function varm(U, side, a1, a2, o = {}) {
  const { g, fill, stroke, LW, P } = U, S_ = P.skin, line_ = P.line;
  const sh = [side * (o.shW ?? .98) + (o.dx || 0), o.shY ?? 1.62];
  const v1 = [Math.sin(a1), Math.cos(a1)], el = [sh[0] + v1[0] * (o.l1 ?? 1.45), sh[1] + v1[1] * (o.l1 ?? 1.45)];
  const a = a1 + a2, v2 = [Math.sin(a), Math.cos(a)], hd = [el[0] + v2[0] * (o.l2 ?? 1.3), el[1] + v2[1] * (o.l2 ?? 1.3)];
  const seg = (p, q, w0, w1, col, shade) => {
    const dx = q[0] - p[0], dy = q[1] - p[1], L = Math.hypot(dx, dy) || 1e-6, nx = -dy / L, ny = dx / L;
    const pts = [[p[0] + nx * w0, p[1] + ny * w0], [q[0] + nx * w1, q[1] + ny * w1], [q[0] - nx * w1, q[1] - ny * w1], [p[0] - nx * w0, p[1] - ny * w0]];
    g.fillStyle = col; g.strokeStyle = line_; g.lineWidth = LW * 2.2; g.beginPath(); g.moveTo(...pts[0]); for (const pp of pts.slice(1)) g.lineTo(...pp); g.closePath(); g.stroke(); g.fill();
    g.beginPath(); g.arc(q[0], q[1], w1, 0, TAU); g.fill();
    if (shade) { g.fillStyle = shade; g.beginPath(); g.moveTo(pts[1][0] * .55 + q[0] * .45, pts[1][1] * .55 + q[1] * .45); g.lineTo(...pts[1]); g.lineTo(...pts[0]); g.lineTo(pts[0][0] * .55 + p[0] * .45, pts[0][1] * .55 + p[1] * .45); g.closePath(); g.fill(); }
  };
  const shirt = o.shirt || ['#f6f8fc', '#c6d0e4'], long = o.sleeve === 'long';
  // 大臂（袖子）、小臂（皮肤或袖子）
  seg(sh, el, .27, .23, long ? shirt[0] : S_[1], long ? shirt[1] : S_[2]);
  if (!long) { const mid = [sh[0] + (el[0] - sh[0]) * .72, sh[1] + (el[1] - sh[1]) * .72]; seg(sh, mid, .3, .28, shirt[0], shirt[1]); stroke(o.cuff || '#3266c4', LW * 2.4, () => { const dx = mid[0] - sh[0], dy = mid[1] - sh[1], L = Math.hypot(dx, dy), nx = -dy / L * .28, ny = dx / L * .28; g.moveTo(mid[0] + nx, mid[1] + ny); g.lineTo(mid[0] - nx, mid[1] - ny); }); }
  seg(el, hd, .22, .17, long ? shirt[0] : S_[1], long ? shirt[1] : S_[2]);
  if (long) { const cf = [el[0] + (hd[0] - el[0]) * .9, el[1] + (hd[1] - el[1]) * .9]; seg(cf, hd, .19, .18, shirt[0]); }
  // 手：掌心、四根手指的缝、拇指
  const ha = Math.atan2(v2[1], v2[0]), hc = [hd[0] + v2[0] * .2, hd[1] + v2[1] * .2];
  g.save(); g.translate(hc[0], hc[1]); g.rotate(ha - Math.PI / 2);
  g.fillStyle = S_[1]; g.strokeStyle = line_; g.lineWidth = LW * 2.2;
  g.beginPath(); g.ellipse(0, .05, .2, .27, 0, 0, TAU); g.stroke(); g.fill();
  if (o.grip) { g.fillStyle = S_[2]; g.beginPath(); g.ellipse(0, .2, .17, .1, 0, 0, TAU); g.fill(); }
  else { g.strokeStyle = S_[2]; g.lineWidth = LW * 1.1; for (const fx of [-.07, .03, .12]) { g.beginPath(); g.moveTo(fx, .12); g.lineTo(fx, .28); g.stroke(); } }
  g.fillStyle = S_[1]; g.strokeStyle = line_; g.lineWidth = LW * 2;
  g.beginPath(); g.ellipse(side * -.17, -.02, .08, .15, side * -.5, 0, TAU); g.stroke(); g.fill();
  g.restore();
  return { hand: hc, ang: ha, elbow: el };
}
/* 纸飞机（矢量）：c 机头，s 大小，ang 朝向，old 发黄。text 机翼上写的字 */
function vplane(U, c, s, ang, o = {}) {
  const { g, LW, P } = U, ca = Math.cos(ang), sa = Math.sin(ang), Pt = (u, v) => [c[0] + u * ca - v * sa, c[1] + u * sa + v * ca];
  const col = o.old ? ['#efe2be', '#d6c49a', '#b8a478'] : ['#ffffff', '#dde6f0', '#b8c4d4'];
  const poly_ = (pts, f) => { g.fillStyle = f; g.strokeStyle = P.line; g.lineWidth = LW * 2; g.beginPath(); g.moveTo(...pts[0]); for (const p of pts.slice(1)) g.lineTo(...p); g.closePath(); g.stroke(); g.fill(); };
  poly_([Pt(0, 0), Pt(-s * 2.2, s * .5), Pt(-s * 1.8, 0)], col[1]);
  poly_([Pt(0, 0), Pt(-s * 1.8, 0), Pt(-s * 2.0, s * .22)], col[2]);
  poly_([Pt(0, 0), Pt(-s * 2.2, -s * .55), Pt(-s * 1.8, 0)], col[0]);
  if (o.text) { g.save(); g.translate(...Pt(-s * 1.3, -s * .2)); g.rotate(ang - .12); g.fillStyle = '#7a6a70'; g.font = `${s * .26}px LongCang, cursive`; g.textAlign = 'center'; g.fillText(o.text, 0, 0); g.restore(); }
  if (o.doodle) { g.strokeStyle = '#8a7a80'; g.lineWidth = LW * 1.2; g.beginPath(); const d = Pt(-s * 1.65, -s * .32); g.arc(d[0], d[1], s * .07, 0, TAU); g.stroke(); for (let i = 0; i < 6; i++) { const a = i / 6 * TAU; g.beginPath(); g.moveTo(d[0] + Math.cos(a) * s * .1, d[1] + Math.sin(a) * s * .1); g.lineTo(d[0] + Math.cos(a) * s * .15, d[1] + Math.sin(a) * s * .15); g.stroke(); } }
}
/* 同学 i 的大头像样子（和 kid(i) 的发型发色对得上） */
function vpKid(i) {
  const lk = kid(i), hc = lk.hc, hx = c => '#' + c.toString(16).padStart(6, '0');
  const girl = lk.hair !== 'boy' && lk.hair !== 'buzz';
  const base = girl ? VP.she : VP.he, key = 'kid' + i;
  if (!VP[key]) VP[key] = { ...base, hair: [hx(lighter(C(hc[1]), 0) & 0xffffff ? hc[1] : hc[1]), hx(hc[0]), hx(darker(C(hc[0]), .3) & 0xffffff), hx(hc[1])].map((h, j) => j === 2 ? '#' + ((cr(darker(C(hc[0]), .3)) << 16) | (cg(darker(C(hc[0]), .3)) << 8) | cb(darker(C(hc[0]), .3))).toString(16).padStart(6, '0') : h),
    pony: lk.hair === 'pony', long: false, bangs: girl ? (lk.hair === 'bob' ? 'girl2' : 'girl') : 'boy', cowlick: false, tie: '#' + lk.tie.toString(16).padStart(6, '0') };
  return key;
}
