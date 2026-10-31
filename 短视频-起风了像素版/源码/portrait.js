'use strict';
/* portrait.js —— 特写用的大头像（"2.5D"）：头 = 一个球（脑袋）+ 一个椭球（下巴），按转头的角度 yaw 逐格求出这一格看到的是
   头发、脸还是耳朵，再按法线打三档光。刘海、鬓角按头上的经纬度切，五官按脸上的位置投到屏幕上（转过去时横向压扁）。
   马尾、长发、呆毛是另外画的二维的一串。
   portrait({ x, y, R, yaw, pitch, roll, look, expr, gaze, t, wind, body, light, rim }) —— (x, y) 是头（球心）在画面上的位置，R 球半径（格）。
   yaw：0 正脸，正 = 往画面右边转（她的左脸转过来），±π 背影。expr：eyes 'open'|'closed'|'happy'|'half'|'wide'，mouth 'n'|'smile'|'open'|'grin'|'o'，blush 0~1 */
const PT = {
  she: { skin: [0xfde6d4, 0xf8d2b8, 0xe6aa90, 0xc8846e], hair: [0x5e3c3a, 0x3c2628, 0x261618, 0x8e6058], iris: [0x2a1a26, 0x5a3438, 0xa06c58], bang: 'girl', side: .7, pony: true, lash: true },
  sheA: { skin: [0xfde6d4, 0xf8d2b8, 0xe6aa90, 0xc8846e], hair: [0x5e3c3a, 0x3c2628, 0x261618, 0x8e6058], iris: [0x2a1a26, 0x5a3438, 0xa06c58], bang: 'girl2', side: .72, long: true, lash: true },
  sheA2: { skin: [0xfde6d4, 0xf8d2b8, 0xe6aa90, 0xc8846e], hair: [0x5e3c3a, 0x3c2628, 0x261618, 0x8e6058], iris: [0x2a1a26, 0x5a3438, 0xa06c58], bang: 'girl2', side: .7, pony: true, lash: true },
  he: { skin: [0xfbe2cc, 0xf4ccb0, 0xdea488, 0xc08066], hair: [0x4a3c56, 0x2c2232, 0x1a1420, 0x6e5a80], iris: [0x1e1828, 0x3c3044, 0x6a5a6a], bang: 'boy', side: .86, cowlick: true },
  heA: { skin: [0xfbe2cc, 0xf4ccb0, 0xdea488, 0xc08066], hair: [0x4a3c56, 0x2c2232, 0x1a1420, 0x6e5a80], iris: [0x1e1828, 0x3c3044, 0x6a5a6a], bang: 'boy', side: .86, cowlick: true },
};
const PT_OUT = 0x2a1a24;
/* 刘海的下沿：头上的纬度（y 往下为正），按经度 x 取；尖尖的一绺一绺 */
function bangLine(style, x) {
  const tri = v => Math.abs(fract(v) - .5) * 2;          // 0~1 的三角波
  if (style === 'girl') return -.36 + .3 * (1 - tri(x * 2.4 + .3)) ** 2.2 + .05 * Math.cos(x * 2) - (Math.abs(x) > .55 ? .1 : 0);
  if (style === 'girl2') return -.4 + .3 * (1 - tri(x * 1.9 + .55)) ** 1.5 + (x < -.15 ? .12 : -.04);   // 七年后：偏分
  return -.38 + .3 * (1 - tri(x * 3 + .15)) ** 2 + .04 * Math.cos(x * 2);                              // 男生
}
function portrait(o) {
  const P = PT[o.look] || PT.she, R = o.R, t = o.t ?? 0, ex = o.expr || {};
  const yaw = o.yaw ?? 0, pitch = o.pitch ?? 0, roll = o.roll ?? 0;
  const cy_ = Math.cos(yaw), sy_ = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr_ = Math.cos(roll), sr_ = Math.sin(roll);
  const K = C(PT_OUT);
  const skin = P.skin.map(c => C(c)), hair = P.hair.map(c => C(c));
  // 世界 → 头里的坐标（先转回 roll，再转回 pitch、yaw）
  const toLocal = (X, Y, Z) => { let x = X * cr_ + Y * sr_, y = -X * sr_ + Y * cr_, z = Z; let y2 = y * cp - z * sp, z2 = y * sp + z * cp; return [x * cy_ - z2 * sy_, y2, x * sy_ + z2 * cy_]; };
  const toWorld = (x, y, z) => { const X1 = x * cy_ + z * sy_, Z1 = -x * sy_ + z * cy_; const Y2 = y * cp + Z1 * sp, Z2 = -y * sp + Z1 * cp; return [X1 * cr_ - Y2 * sr_, X1 * sr_ + Y2 * cr_, Z2]; };
  // 光：从左上前方来
  const L = o.light || [-.55, -.6, .6], Ln = Math.hypot(...L), lx = L[0] / Ln, ly = L[1] / Ln, lz = L[2] / Ln;
  const S = layer('portrait', Math.ceil(R * 4.4), Math.ceil(R * 4.6)), OX = S.w / 2, OY = Math.round(R * 1.9);
  /* 一格看到什么：返回 [种类, 局部坐标, 法线] */
  const JAW = [0, .38, .14, .8, .72, .72], CHIN = [0, .88, .3, .34, .26, .3];      // 脸颊、下巴尖
  function hitEll(X, Y, cx, cy, cz, ax, ay, az) {
    // 椭球在头里的坐标系；视线是世界里的 z 轴：在头的坐标系里沿 d = toLocal(0,0,1) 方向
    const p = toLocal(X, Y, 0), d = toLocal(0, 0, 1);
    const ox = (p[0] - cx) / ax, oy = (p[1] - cy) / ay, oz = (p[2] - cz) / az, dx = d[0] / ax, dy = d[1] / ay, dz = d[2] / az;
    const A = dx * dx + dy * dy + dz * dz, B = 2 * (ox * dx + oy * dy + oz * dz), Cc = ox * ox + oy * oy + oz * oz - 1, D = B * B - 4 * A * Cc;
    if (D < 0) return null;
    const s = (-B + Math.sqrt(D)) / (2 * A);              // 离观众最近的交点（z 最大）
    const q = [p[0] + d[0] * s, p[1] + d[1] * s, p[2] + d[2] * s], n = [(q[0] - cx) / (ax * ax), (q[1] - cy) / (ay * ay), (q[2] - cz) / (az * az)], nl = Math.hypot(...n);
    return { s, q, n: n.map(v => v / nl) };
  }
  const hairOpen = (q) => {                            // 头发壳上"露出脸"的那块
    if (q[2] < .05) return false;
    const bl = bangLine(P.bang, q[0]);
    if (q[1] < bl) return false;
    if (Math.abs(q[0]) > P.side && q[1] < .2) return false;     // 鬓角上半截
    return true;
  };
  const shade4 = (ramp, v) => ramp[v > .72 ? 0 : v > .38 ? 1 : v > .1 ? 2 : 3];
  const mask = new Uint8Array(S.w * S.h);            // 1 皮肤 2 头发
  const lq = new Float32Array(S.w * S.h * 3);
  withT(S, () => {
    clear(0);
    // 长发、马尾在头后面（正脸时）
    if (P.pony && Math.cos(yaw) > -.2 && !o.noBack) ponyTail(OX, OY, R, toWorld, t, o.wind ?? 0, hair, K);
    if (P.long && !o.noBack) longBack(OX, OY, R, toWorld, t, o.wind ?? 0, hair, K, yaw);
    for (let py = 0; py < S.h; py++) for (let px = 0; px < S.w; px++) {
      const X = (px + .5 - OX) / R, Y = (py + .5 - OY) / R;
      if (X * X + Y * Y > 4) continue;
      const hs = hitEll(X, Y, 0, -.1, -.08, 1.1, 1.06, 1.1);          // 头发壳
      const sk = hitEll(X, Y, 0, 0, 0, 1, 1, 1), jw = hitEll(X, Y, ...JAW), ch = hitEll(X, Y, ...CHIN);
      let face = sk; for (const h of [jw, ch]) if (h && (!face || h.s > face.s)) face = h;          // 球、脸颊、下巴尖，取离观众最近的（s 越大越近）
      let kind = 0, hit = null;
      const hairHit = hs && !hairOpen(hs.q);
      if (hairHit && (!face || hs.s >= face.s)) { kind = 2; hit = hs; }
      else if (face) { kind = 1; hit = face; if (Math.abs(face.q[0]) > P.side && face.q[1] < (P.bang === 'boy' ? .25 : .2) && face.q[2] > -.2) kind = 2; }
      else if (hs) { kind = 2; hit = hs; }
      if (!kind) continue;
      const i = py * S.w + px; mask[i] = kind; lq[i * 3] = hit.q[0]; lq[i * 3 + 1] = hit.q[1]; lq[i * 3 + 2] = hit.q[2];
      // 皮肤用平滑的"虚拟法线"（从头的中心往外），不受下巴、脸颊椭球的影响，免得下半张脸一圈暗
      const vn = kind === 1 ? (() => { const q = hit.q, n = [q[0], q[1] * .55 - .1, Math.max(.2, q[2]) + .3], l = Math.hypot(...n); return n.map(v => v / l); })() : hit.n;
      const nw = toWorld(...vn), lam = nw[0] * lx + nw[1] * ly + nw[2] * lz;
      const v = clamp(lam * .8 + .3 + (bay(px, py) - .5) * .16);
      if (kind === 1) {
        const lit = lam * .8 + .32;
        let c = lit > .42 ? skin[1] : skin[2];
        if (lit > .9) c = skin[0];
        // 刘海在额头上投的影子、下巴下面的影子
        if (hit.q[1] < bangLine(P.bang, hit.q[0]) + .1) c = skin[2];
        pset(px, py, c);
      } else {
        let c = shade4([hair[0], hair[1], hair[2], hair[2]], v);
        // 头发的光环：一道亮弧，下沿是波浪
        const ring = -.52 + Math.sin(hit.q[0] * 9) * .035;
        if (Math.abs(hit.q[1] - ring) < .07 && nw[2] > .25 && v > .3) c = (hit.q[1] - ring > .02 && bay(px, py) > .5) ? hair[0] : hair[3];
        // 一缕缕的发丝：顺着经度的暗线
        if (nw[2] > .1 && Math.sin(hit.q[0] * 26 + hit.q[1] * 3) > .93 && hit.q[1] > -.75 && hit.q[1] < -.45) c = hair[2];
        pset(px, py, c);
      }
    }
    outline(S, K);
    // 刘海下沿描一道深色（头发和脸分开）
    for (let py = 1; py < S.h; py++) for (let px = 0; px < S.w; px++) { const i = py * S.w + px; if (mask[i] === 1 && mask[i - S.w] === 2) pset(px, py - 1, hair[1]); }
    // 五官
    feature(S, OX, OY, R, toWorld, P, ex, o.gaze || [0, 0], t, skin, hair, K, mask);
    if (P.cowlick) cowlick(OX, OY, R, toWorld, t, hair, K);
    if (P.bang !== 'boy') sideLocks(OX, OY, R, toWorld, t, o.wind ?? 0, hair, K);
    if (P.pony && Math.cos(yaw) <= -.2) ponyTail(OX, OY, R, toWorld, t, o.wind ?? 0, hair, K);
    if (o.petals) o.petals(S, OX, OY, R, toWorld);
  });
  if (o.rim) rimLight(S, o.rim[2] ?? 1, o.rim[3] ?? 0, C(o.rim[0]), o.rim[1] ?? .5, o.rim[4] ?? 1);
  blit(S, Math.round(o.x - OX), Math.round(o.y - OY), { alpha: o.alpha ?? 1 });
  return { toWorld: (x, y, z) => { const w = toWorld(x, y, z); return [o.x + w[0] * R, o.y + w[1] * R, w[2]]; } };
}
/* 五官：眼睛、眉毛、鼻子、嘴、腮红 */
function feature(S, OX, OY, R, toWorld, P, ex, gaze, t, skin, hair, K, mask) {
  const proj = (x, y, z) => { const w = toWorld(x, y, z); return [OX + w[0] * R, OY + w[1] * R, w[2]]; };
  const onFace = (x, y) => { const zz = Math.sqrt(Math.max(0, 1 - x * x - (y - .1) * (y - .1) * .8)); return [x, y, zz]; };
  const isSkin = (px, py) => mask[Math.floor(py) * S.w + Math.floor(px)] === 1;
  const iris = P.iris.map(c => C(c)), white = C(0xffffff), lashC = C(0x1e121c);
  const eyeW = R * (P.lash ? .38 : .33), eyeH = R * (P.lash ? .48 : .38);
  for (const side of [-1, 1]) {
    const e = onFace(side * .35, .3), c = proj(...e);
    // 眼睛朝外转过去多少：压扁
    const nrm = toWorld(side * .3, 0, 1), fs = clamp(nrm[2] * 1.15, 0, 1);
    if (fs < .18 || !isSkin(c[0], c[1])) continue;
    const w = eyeW * fs, h = eyeH, x0 = c[0] - w / 2, y0 = c[1] - h / 2;
    const blink = ex.eyes === 'closed' || ex.eyes === 'happy';
    if (blink) {
      // 闭眼：一道弧（笑眯眯的往上弯，闭着的往下弯）
      const up = ex.eyes === 'happy' ? -1 : 1;
      for (let i = 0; i <= Math.ceil(w); i++) { const u = i / Math.max(1, w), yy = c[1] + up * -Math.sin(u * Math.PI) * h * .3 + h * .1; pset(x0 + i, yy, lashC); pset(x0 + i, yy + 1, lashC); }
      if (P.lash) { pset(x0 - 1 + (side > 0 ? w + 1 : 0), c[1] + h * .1 - 1, lashC); }
    } else {
      const half = ex.eyes === 'half' ? .4 : 0, wide = ex.eyes === 'wide' ? -.1 : 0;
      // 上眼线是一道往上拱的弧；眼角往外挑
      const lidY = u => y0 + h * (half + wide) - Math.sin(clamp(u) * Math.PI) * h * .14 - (side > 0 ? u : 1 - u) * h * .05;
      const ix = c[0] + gaze[0] * w * .16, iy = c[1] + gaze[1] * h * .12 + h * .1, irx = w * .46, iry = h * .52;
      // 眼白：只在虹膜两边露一点
      for (let xx = Math.floor(x0); xx <= Math.ceil(x0 + w); xx++) { const u = (xx - x0) / w, top = lidY(u); for (let yy = Math.ceil(top) + 1; yy <= y0 + h * .95; yy++) { const dy = (yy - (y0 + h * .45)) / (h * .55), dx = (xx + .5 - c[0]) / (w * .55); if (dx * dx + dy * dy <= 1) pset(xx, yy, white); } }
      // 虹膜：上深下浅，被上眼线盖住上沿
      for (let yy = Math.floor(iy - iry); yy <= Math.ceil(iy + iry); yy++) for (let xx = Math.floor(ix - irx); xx <= Math.ceil(ix + irx); xx++) {
        const dx = (xx + .5 - ix) / (irx + .3), dy = (yy + .5 - iy) / (iry + .3); if (dx * dx + dy * dy > 1) continue;
        if (yy <= lidY((xx - x0) / w)) continue;
        const u = (yy + .5 - (iy - iry)) / (2 * iry);
        pset(xx, yy, u < .38 ? iris[0] : u < .66 ? iris[1] : iris[2]);
      }
      ellipse(ix, iy + h * .04, irx * .38, iry * .36, iris[0]);
      // 上眼线（两格粗）和眼角
      for (let i = -1; i <= Math.ceil(w) + 1; i++) { const u = i / Math.max(1, w), yy = Math.round(lidY(u)); pset(x0 + i, yy, lashC); const outer = side > 0 ? u : 1 - u; if (outer > .45 || !P.lash) pset(x0 + i, yy + 1, lashC); }
      if (P.lash) { const ox = side > 0 ? x0 + w + 2 : x0 - 2, oy = Math.round(lidY(side > 0 ? 1 : 0)); pset(ox, oy - 1, lashC); pset(ox, oy, lashC); pset(ox + side, oy - 2, lashC); }
      // 下眼线：外眼角一小截
      for (let i = 0; i < Math.max(2, Math.round(w * .3)); i++) pset(side > 0 ? x0 + w - i : x0 + i, Math.round(y0 + h * .98), darker(skin[2], .25));
      // 笑眼：下眼皮往上弯，盖住虹膜下面三成
      if (ex.eyes === 'smile') {
        for (let xx = Math.floor(x0 - 1); xx <= Math.ceil(x0 + w + 1); xx++) {
          const u = (xx - x0) / w, lo = y0 + h * (1.02 - .38 * Math.sin(clamp(u) * Math.PI));
          for (let yy = Math.floor(lo); yy <= y0 + h + 2; yy++) if (mask[yy * S.w + xx] === 1) pset(xx, yy, skin[1]);
          if (u > .05 && u < .95) pset(xx, Math.floor(lo), darker(skin[2], .2));
        }
      }
      // 高光：左上一大颗，右下一小颗
      const hx = Math.round(ix - irx * .5 + gaze[0] * .5), hy = Math.round(iy - iry * .42);
      rect(hx, hy, Math.max(1, Math.round(w * .22)), Math.max(2, Math.round(h * .24)), white);
      pset(Math.round(ix + irx * .45), Math.round(iy + iry * .35), white);
    }
    // 眉毛
    const bw = w * .85, bx0 = x0 + w * .1, by = y0 - h * .5 - (ex.eyes === 'wide' ? 2 : 0);
    for (let i = 0; i <= Math.ceil(bw); i++) { const u = i / Math.max(1, bw), yy = by - Math.sin(u * Math.PI) * h * .1 + (ex.brow === 'sad' ? (side > 0 ? u - .5 : .5 - u) * 3 : (side > 0 ? -u : -(1 - u)) * 1); if (isSkin(bx0 + i, yy)) pset(bx0 + i, Math.round(yy), mixc(hair[0], skin[2], .35)); }
    // 腮红
    const bl = ex.blush ?? .5;
    if (bl > 0) { const bc = proj(...onFace(side * .48, .6)); for (let yy = -2; yy <= 2; yy++) for (let xx = -4; xx <= 4; xx++) { if ((xx * xx) / 16 + (yy * yy) / 4 > 1) continue; if (bay(Math.round(bc[0] + xx), Math.round(bc[1] + yy)) < bl * .55 && isSkin(bc[0] + xx, bc[1] + yy)) pset(bc[0] + xx, bc[1] + yy, C(0xf2928e)); } }
  }
  // 鼻子：一点影子
  const nz = proj(...onFace(0, .58)); if (nz[2] > -.2) { pset(nz[0] + 1, nz[1], skin[2]); }
  // 嘴
  const m = proj(...onFace(0, .8)); if (m[2] > -.1 && isSkin(m[0], m[1])) {
    const mw = Math.max(2, Math.round(R * .16 * clamp(toWorld(0, 0, 1)[2] * 1.2, .4, 1)));
    const mc = C(0xb4505a), mi = C(0x7a2a3a), tg = C(0xf08a8a);
    if (ex.mouth === 'smile') { for (let i = -mw; i <= mw; i++) pset(m[0] + i, m[1] + Math.round(Math.cos(i / mw * Math.PI / 2) * 1.4) - 1, mc); }
    else if (ex.mouth === 'laugh') {          // 张嘴笑：上沿平、下沿弯，里面一点舌头
      for (let i = -mw; i <= mw; i++) { const d = Math.round(Math.cos(i / mw * Math.PI / 2) * 2.6); for (let j = 0; j <= d; j++) pset(m[0] + i, m[1] - 1 + j, j === d ? mc : j > d - 2 && Math.abs(i) < mw * .6 ? tg : mi); }
      hspan(Math.round(m[1] - 1), m[0] - mw, m[0] + mw, mc);
    }
    else if (ex.mouth === 'open' || ex.mouth === 'grin') { ellipse(m[0], m[1] + 1, mw * .9, ex.mouth === 'grin' ? 2.2 : 2.6, mi); hspan(Math.round(m[1] + 2), m[0] - mw * .5, m[0] + mw * .5, tg); if (ex.mouth === 'grin') hspan(Math.round(m[1]), m[0] - mw * .7, m[0] + mw * .7, C(0xffffff)); }
    else if (ex.mouth === 'o') { ellipse(m[0], m[1] + 1, 1.6, 2, mi); }
    else { hspan(Math.round(m[1]), m[0] - 1, m[0] + 1, mc); }
  }
}
/* 马尾：从后脑勺高处垂下来的一串，跟着风、转头甩 */
function ponyTail(OX, OY, R, toWorld, t, wind, hair, K) {
  const root = toWorld(0, -.7, -.85), ro = [OX + root[0] * R, OY + root[1] * R];
  const n = 12, pts = [ro];
  let x = ro[0], y = ro[1];
  const back = toWorld(0, 0, -1)[0];                 // 后脑勺朝哪边：马尾先往那边出去一点，再垂下来
  for (let i = 1; i <= n; i++) { const a = back * (1.2 - i * .1) + (Math.sin(t * 2.2) * .16 + wind * .8) * (i / n) + Math.sin(t * 3.4 + i * .5) * .04 * i / n; x += Math.sin(a) * R * .17; y += Math.cos(a) * R * .17; pts.push([x, y]); }
  const w0 = R * .55;
  for (let i = 0; i < n; i++) capsule(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w0 * (1 - i / n * .75) + 2, K);
  for (let i = 0; i < n; i++) capsule(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], w0 * (1 - i / n * .75), i % 4 === 1 ? hair[0] : hair[1]);
  for (let i = 1; i < n; i += 2) capsule(pts[i][0] - R * .08, pts[i][1], pts[i + 1][0] - R * .08, pts[i + 1][1], 1, hair[2]);
  // 红发绳
  disc(ro[0], ro[1], R * .13 + 1, K); disc(ro[0], ro[1], R * .13, C(0xe8343e)); pset(ro[0] - 1, ro[1] - 1, C(0xff8a8a));
}
/* 披肩长发（后面那片）：从头两侧垂到肩下 */
function longBack(OX, OY, R, toWorld, t, wind, hair, K, yaw) {
  const segs = [];
  for (const sd of [-1, 1]) for (let k = 0; k < 3; k++) {
    const a = toWorld(sd * (.75 + k * .1), .1 + k * .1, -.3 - k * .2), x0 = OX + a[0] * R, y0 = OY + a[1] * R;
    const sw = Math.sin(t * 1.8 + k + sd) * R * .04 + wind * R * .2;
    segs.push([x0, y0, x0 + sd * R * .12 + sw * .5, y0 + R * .9, R * .32], [x0 + sd * R * .12 + sw * .5, y0 + R * .9, x0 + sd * R * .2 + sw, y0 + R * 1.6, R * .26]);
  }
  for (const [a, b, c, d, w] of segs) capsule(a, b, c, d, w + 2, K);
  segs.forEach(([a, b, c, d, w], i) => capsule(a, b, c, d, w, i % 3 === 0 ? hair[1] : hair[2]));
}
/* 鬓角两缕：从太阳穴（头发壳边上）垂到下巴，转过去的那边被脸挡住 */
function sideLocks(OX, OY, R, toWorld, t, wind, hair, K) {
  for (const sd of [-1, 1]) {
    const a = toWorld(sd * .82, -.15, .45), b = toWorld(sd * .78, .45, .45), c = toWorld(sd * .7, .95, .35);
    if (a[2] < 0 && b[2] < 0) continue;
    const sw = Math.sin(t * 2 + sd) * R * .025 + wind * R * .08;
    const p = [[OX + a[0] * R, OY + a[1] * R], [OX + b[0] * R + sw * .5, OY + b[1] * R], [OX + c[0] * R + sw, OY + c[1] * R]];
    capsule(...p[0], ...p[1], R * .2 + 2, K); capsule(...p[1], ...p[2], R * .13 + 2, K);
    capsule(...p[0], ...p[1], R * .2, hair[1]); capsule(...p[1], ...p[2], R * .13, hair[1]);
    line(p[0][0] - sd, p[0][1] + 1, p[2][0] - sd, p[2][1] - 1, hair[0], .7);
  }
}
/* 男生头顶的呆毛 */
function cowlick(OX, OY, R, toWorld, t, hair, K) {
  const a = toWorld(.1, -1.05, .1), b = toWorld(.25, -1.3, .05), x0 = OX + a[0] * R, y0 = OY + a[1] * R, x1 = OX + b[0] * R + Math.sin(t * 3) * 1, y1 = OY + b[1] * R;
  capsule(x0, y0, x1, y1, R * .1 + 2, K); capsule(x0, y0, x1, y1, R * .1, hair[1]);
}
/* 脖子和肩膀（校服 / 开衫 / 衬衫），画在头像下面 */
function bust(o) {
  const R = o.R, x = o.x, y = o.y, by = (o.yaw ?? 0) * .35, K = C(PT_OUT);
  const of = o.outfit || 'uni', sk = (PT[o.look] || PT.she).skin;
  const shirt = of === 'cardigan' ? [0xefe2cc, 0xcdbb9e] : of === 'shirt' ? [0xf4f6fa, 0xc8d0e0] : [0xf6f8fc, 0xc6d0e4];
  // 脖子
  rect(x - R * .24 - 1, y + R * .85, R * .48 + 2, R * .8, K); rect(x - R * .24, y + R * .85, R * .48, R * .8, C(sk[1])); rect(x - R * .24, y + R * .85, R * .48, R * .3, C(sk[2]));
  // 肩膀：梯形
  const sw = R * 1.45, top = y + R * 1.5, bot = y + R * 3.4, cx = x + Math.sin(by) * R * .3;
  const shp = [[cx - R * .45, top - R * .1], [cx + R * .45, top - R * .1], [cx + sw * .92, top + R * .55], [cx + sw, bot], [cx - sw, bot], [cx - sw * .92, top + R * .55]];
  poly(shp.map(([a, b]) => [a + Math.sign(a - cx), b - 1]), K);
  poly(shp, C(shirt[0]));
  poly([[cx + R * .25, top], [cx + R * .45, top - R * .1], [cx + sw * .92, top + R * .55], [cx + sw, bot], [cx + sw * .55, bot]], C(shirt[1]));
  if (of === 'uni') {          // 蓝领子
    const bl = C(0x3266c4), blS = C(0x234c96);
    poly([[cx - R * .5, top - 1], [cx, top + R * .55], [cx - R * .12, top + R * .7], [cx - R * .75, top + R * .1]], bl);
    poly([[cx + R * .5, top - 1], [cx, top + R * .55], [cx + R * .12, top + R * .7], [cx + R * .75, top + R * .1]], blS);
    line(cx, top + R * .6, cx, bot, C(0xd8dfee));
  } else if (of === 'cardigan') {
    const blue = C(0xa8c0e0);
    poly([[cx - R * .4, top], [cx + R * .4, top], [cx + R * .1, top + R * .8], [cx - R * .1, top + R * .8]], blue);
    line(cx - R * .45, top, cx - R * .2, bot, C(0xcdbb9e)); line(cx + R * .45, top, cx + R * .2, bot, C(0xcdbb9e));
  } else {
    poly([[cx - R * .45, top - 1], [cx, top + R * .5], [cx - R * .3, top + R * .6]], C(0xffffff));
    poly([[cx + R * .45, top - 1], [cx, top + R * .5], [cx + R * .3, top + R * .6]], C(0xe0e6f0));
    for (let i = 0; i < 3; i++) pset(cx, top + R * (.8 + i * .5), C(0xc0c8d8));
  }
}

/* 一整张半身像：后面的头发（马尾、长发）→ 肩膀 → 头。马尾不会盖住脖子 */
function closeup(o) {
  const P = PT[o.look] || PT.she;
  if (P.pony || P.long) {
    // 只画后面的头发：借 portrait 的坐标变换，在一块空画布上画
    const yaw = o.yaw ?? 0, pitch = o.pitch ?? 0, roll = o.roll ?? 0, R = o.R;
    const cy_ = Math.cos(yaw), sy_ = Math.sin(yaw), cp = Math.cos(pitch), sp = Math.sin(pitch), cr_ = Math.cos(roll), sr_ = Math.sin(roll);
    const toWorld = (x, y, z) => { const X1 = x * cy_ + z * sy_, Z1 = -x * sy_ + z * cy_; const Y2 = y * cp + Z1 * sp, Z2 = -y * sp + Z1 * cp; return [X1 * cr_ - Y2 * sr_, X1 * sr_ + Y2 * cr_, Z2]; };
    const hair = P.hair.map(c => C(c)), K = C(PT_OUT);
    if (P.pony && Math.cos(yaw) > -.2) ponyTail(o.x, o.y, R, toWorld, o.t ?? 0, o.wind ?? 0, hair, K);
    if (P.long) longBack(o.x, o.y, R, toWorld, o.t ?? 0, o.wind ?? 0, hair, K, yaw);
  }
  bust(o);
  return portrait({ ...o, noBack: true });
}
