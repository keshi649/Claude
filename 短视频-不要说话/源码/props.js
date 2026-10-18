// props.js — 道具：黑铅笔、速写本、纸折的心、咖啡杯（带杯套和小涂鸦）、对话泡泡、信封、音符。
// 还有两张特写的脸（她、他的侧脸），给情绪镜头用。

// ---------------- 黑铅笔 ----------------
// (x, y) 是笔尖，ang 是笔杆从笔尖往后的方向（度），len 是长度（像素，按当前坐标）
function blackPencil(g, x, y, len, ang, o = {}) {
  const a = R(ang), d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]];
  const w = o.w ?? len * 0.055;
  const P_ = (u, v) => [x + d[0] * u + n[0] * v, y + d[1] * u + n[1] * v];
  withSeed(o.seed ?? 8100, () => {
    const cone = len * 0.12, lead = len * 0.035;
    // 笔杆（黑色，侧面一道高光）
    const body = [P_(cone, -w), P_(len * 0.9, -w), P_(len * 0.9, w), P_(cone, w)];
    const bp = pathOf(body); paperFill(g, bp); shade(g, bp, 0.93, ang + 90, { hatch: 0.6 });
    eraseStroke(g, [P_(cone + 6, -w * 0.35), P_(len * 0.88, -w * 0.35)], Math.max(1, w * 0.22), 0.55);
    sk(g, [P_(cone, -w), P_(len * 0.9, -w)], { w: 1.6, a: 0.9 }); sk(g, [P_(cone, w), P_(len * 0.9, w)], { w: 1.6, a: 0.9 });
    // 削过的木头和笔芯
    const wood = [P_(lead, -w * 0.25), P_(cone, -w), P_(cone, w), P_(lead, w * 0.25)];
    const wp = pathOf(wood); paperFill(g, wp); shade(g, wp, 0.12, ang);
    for (let i = -1; i <= 1; i++) sk(g, [P_(lead + 2, i * w * 0.18), P_(cone, i * w * 0.7)], { w: 0.8, a: 0.4, passes: 1 });
    sk(g, [P_(lead, -w * 0.25), P_(cone, -w)], { w: 1.4, a: 0.85 }); sk(g, [P_(lead, w * 0.25), P_(cone, w)], { w: 1.4, a: 0.85 });
    // 笔尖的锯齿边（削出来的波浪）
    sk(g, [P_(cone, -w), P_(cone - 4, -w * 0.5), P_(cone, 0), P_(cone - 4, w * 0.5), P_(cone, w)], { w: 1.2, a: 0.7, passes: 1 });
    const tip = [P_(0, 0), P_(lead, -w * 0.25), P_(lead, w * 0.25)];
    const tp = pathOf(tip); g.save(); g.fillStyle = graphStyle(g); g.fill(tp); g.restore();
    // 金属箍和橡皮
    const fer = [P_(len * 0.9, -w * 1.05), P_(len * 0.96, -w * 1.05), P_(len * 0.96, w * 1.05), P_(len * 0.9, w * 1.05)];
    part(g, fer, { tone: 0.3, w: 1.4, per: 2 });
    for (let k = 1; k < 3; k++) sk(g, [P_(len * (0.9 + k * 0.02), -w), P_(len * (0.9 + k * 0.02), w)], { w: 0.9, a: 0.5, passes: 1 });
    const er = [P_(len * 0.96, -w * 0.95), P_(len * 1.02, -w * 0.9), P_(len * 1.03, 0), P_(len * 1.02, w * 0.9), P_(len * 0.96, w * 0.95)];
    part(g, er, { tone: 0.08, w: 1.4, per: 3 });
    // 小星星贴纸（她的笔的记号）
    if (o.star !== false) {
      const sc = P_(len * 0.62, 0), r = w * 0.75, st = [];
      for (let i = 0; i < 10; i++) { const aa = a + i * Math.PI / 5 - Math.PI / 2, rr = i % 2 ? r * 0.45 : r; st.push([sc[0] + Math.cos(aa) * rr, sc[1] + Math.sin(aa) * rr]); }
      const sp = pathOf(st); erase(g, sp, 0.95); sk(g, st.concat([st[0]]), { w: 0.9, a: 0.7, passes: 1 });
    }
  });
  if (o.glowTip) glow(g, x, y, len * 0.18, C.amberHot, o.glowTip);
}
// ---------------- 速写本 ----------------
function sketchbook(g, x, y, w, h, ang, o = {}) {
  g.save(); g.translate(x, y); g.rotate(R(ang));
  withSeed(o.seed ?? 8200, () => {
    const cov = rectPath(-w / 2 - 3, -h / 2 - 3, w + 6, h + 6); paperFill(g, cov); shade(g, cov, 0.88, 30);
    const pg = rectPath(-w / 2, -h / 2, w, h); paperFill(g, pg);
    if (o.page) o.page(g, w, h);
    skRect(g, -w / 2, -h / 2, w, h, { w: 1.4, a: 0.75, over: 2 });
    // 线圈
    for (let i = 0; i < 9; i++) { const yy = -h / 2 + (i + 0.5) * h / 9; skEllipse(g, -w / 2, yy, 3, 2.2, { w: 1.1, a: 0.7, passes: 1 }); }
  });
  g.restore();
}
// ---------------- 纸折的心 ----------------
function paperHeart(g, x, y, s, rot, o = {}) {
  g.save(); g.translate(x, y); g.rotate(R(rot)); g.scale(s, s);
  const pts = [];
  for (let i = 0; i < 40; i++) { const t = i / 40 * 6.283; pts.push([16 * Math.pow(Math.sin(t), 3) / 16, -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t)) / 16]); }
  const pth = pathOf(pts);
  withSeed(o.seed ?? 8300, () => {
    paperFill(g, pth);
    if (o.warm) { g.save(); g.clip(pth); g.fillStyle = rgba(C.amber, 0.35 * o.warm); g.fillRect(-1.2, -1.2, 2.4, 2.4); g.restore(); }
    g.save(); g.clip(pth); const hp = new Path2D(); hp.rect(0, -1.5, 1.5, 3); shade(g, hp, 0.25, 70); g.restore();      // 折痕右边暗一点
    sk(g, pts.concat([pts[0]]), { w: 1.8 / s, a: 0.85, j: 0.6 / s });
    sk(g, [[0, -0.55], [0, 0.95]], { w: 1.0 / s, a: 0.45, passes: 1 });
    if (o.crumple) for (let i = 0; i < 6; i++) sk(g, [[(hash(i, 1) - 0.5) * 1.4, (hash(i, 2) - 0.5) * 1.2], [(hash(i, 3) - 0.5) * 1.4, (hash(i, 4) - 0.5) * 1.2]], { w: 0.9 / s, a: 0.5 * o.crumple, passes: 1 });
  });
  g.restore();
  if (o.warm) glow(g, x, y, s * 2.2, C.amber, 0.3 * o.warm);
}
// ---------------- 咖啡杯 ----------------
// (x, y) 是杯底中心，h 是杯高（像素）；doodle：杯套上的小涂鸦（'moon' 'star' 'cat' 'fish' 'boat' 'umbrella' 'spot' 'heart'）
function coffeeCup(g, x, y, h, o = {}) {
  const wB = h * 0.36, wT = h * 0.5, lidH = h * 0.12;
  withSeed(o.seed ?? 8400, () => {
    const body = [[x - wB, y], [x - wT, y - h], [x + wT, y - h], [x + wB, y]];
    const bp = pathOf(body); paperFill(g, bp); shade(g, bp, o.night ? 0.3 : 0.08, 80);
    sk(g, [[x - wB, y], [x - wT, y - h]], { w: 2, a: 0.88 }); sk(g, [[x + wB, y], [x + wT, y - h]], { w: 2, a: 0.88 });
    sk(g, spline([[x - wB, y], [x, y + h * 0.04], [x + wB, y]], 6), { w: 2, a: 0.85 });
    // 杯套（瓦楞纸）
    const s0 = 0.28, s1 = 0.68;
    const L = u => [x - lerp(wB, wT, u), y - h * u], Rr = u => [x + lerp(wB, wT, u), y - h * u];
    const sl = [L(s0), L(s1), Rr(s1), Rr(s0)];
    const sp = pathOf(sl); paperFill(g, sp); shade(g, sp, o.night ? 0.42 : 0.3, 90, { scale: 0.7 });
    sk(g, spline([L(s0), [x, y - h * s0 + h * 0.035], Rr(s0)], 6), { w: 1.6, a: 0.8 });
    sk(g, spline([L(s1), [x, y - h * s1 + h * 0.035], Rr(s1)], 6), { w: 1.6, a: 0.8 });
    if (o.doodle) {
      const dc = [x, y - h * (s0 + s1) / 2 + h * 0.02], ds = h * 0.14;
      const dz = new Path2D(); dz.ellipse(dc[0], dc[1], ds * 1.25, ds * 1.05, 0, 0, 6.283); erase(g, dz, 0.9);
      doodle(g, o.doodle, dc[0], dc[1], ds);
    }
    // 盖子
    const lid = [[x - wT - h * 0.03, y - h], [x - wT * 0.92, y - h - lidH], [x + wT * 0.92, y - h - lidH], [x + wT + h * 0.03, y - h]];
    part(g, lid, { tone: o.night ? 0.35 : 0.18, w: 1.8, per: 2 });
    sk(g, [[x - wT * 0.6, y - h - lidH], [x - wT * 0.5, y - h - lidH * 1.5], [x - wT * 0.1, y - h - lidH * 1.5], [x, y - h - lidH]], { w: 1.4, a: 0.7 });
  });
  // 暖意：咖啡是热的
  if (o.warm) {
    glow(g, x, y - h * 0.5, h * 1.6, C.amber, 0.28 * o.warm);
    for (let i = 0; i < 3; i++) {
      const tt = (o.t ?? 0) * 0.6 + i * 0.33, ph = tt % 1;
      const sx = x - h * 0.15 + i * h * 0.15, sy = y - h - lidH * 1.6 - ph * h * 0.9;
      const pts = []; for (let k = 0; k <= 8; k++) { const u = k / 8; pts.push([sx + Math.sin(u * 5 + tt * 6 + i) * h * 0.06, sy - u * h * 0.35]); }
      g.save(); g.globalAlpha = Math.sin(ph * Math.PI) * 0.7 * o.warm; sk(g, pts, { w: 1.3, a: 0.6, passes: 1, taper: 0.9, seed: 8450 + i }); g.restore();
    }
  }
}
// 杯套上的小涂鸦
function doodle(g, kind, x, y, s, o = {}) {
  const W_ = 1.4, A_ = 0.85;
  withSeed(8500 + strHash(kind) % 1000, () => {
    if (kind === 'moon') { sk(g, spline([[x + s * 0.3, y - s * 0.8], [x - s * 0.6, y - s * 0.5], [x - s * 0.6, y + s * 0.5], [x + s * 0.3, y + s * 0.8], [x - s * 0.1, y]], 6, true), { w: W_, a: A_ }); }
    else if (kind === 'star') { const st = []; for (let i = 0; i <= 10; i++) { const a = i * Math.PI / 5 - Math.PI / 2, r = i % 2 ? s * 0.4 : s * 0.9; st.push([x + Math.cos(a) * r, y + Math.sin(a) * r]); } sk(g, st, { w: W_, a: A_ }); }
    else if (kind === 'cat') { skEllipse(g, x, y + s * 0.15, s * 0.6, s * 0.5, { w: W_, a: A_ }); sk(g, [[x - s * 0.5, y - s * 0.1], [x - s * 0.45, y - s * 0.7], [x - s * 0.15, y - s * 0.32]], { w: W_, a: A_ }); sk(g, [[x + s * 0.5, y - s * 0.1], [x + s * 0.45, y - s * 0.7], [x + s * 0.15, y - s * 0.32]], { w: W_, a: A_ }); }
    else if (kind === 'fish') { sk(g, spline([[x - s * 0.7, y], [x - s * 0.1, y - s * 0.45], [x + s * 0.5, y], [x - s * 0.1, y + s * 0.45]], 6, true), { w: W_, a: A_ }); sk(g, [[x + s * 0.5, y], [x + s * 0.9, y - s * 0.35], [x + s * 0.9, y + s * 0.35], [x + s * 0.5, y]], { w: W_, a: A_ }); }
    else if (kind === 'boat') { sk(g, [[x - s * 0.8, y + s * 0.2], [x + s * 0.8, y + s * 0.2], [x + s * 0.5, y + s * 0.6], [x - s * 0.5, y + s * 0.6], [x - s * 0.8, y + s * 0.2]], { w: W_, a: A_ }); sk(g, [[x, y + s * 0.2], [x, y - s * 0.8], [x + s * 0.6, y + s * 0.1]], { w: W_, a: A_ }); }
    else if (kind === 'umbrella') { sk(g, spline([[x - s * 0.8, y], [x, y - s * 0.75], [x + s * 0.8, y]], 6), { w: W_, a: A_ }); sk(g, [[x - s * 0.8, y], [x + s * 0.8, y]], { w: W_ * 0.8, a: A_ }); sk(g, [[x, y], [x, y + s * 0.7], [x - s * 0.2, y + s * 0.8]], { w: W_, a: A_ }); }
    else if (kind === 'spot') { sk(g, [[x - s * 0.2, y - s * 0.8], [x + s * 0.2, y - s * 0.8]], { w: W_, a: A_ }); sk(g, [[x - s * 0.15, y - s * 0.8], [x - s * 0.7, y + s * 0.6]], { w: W_ * 0.8, a: A_ * 0.7 }); sk(g, [[x + s * 0.15, y - s * 0.8], [x + s * 0.7, y + s * 0.6]], { w: W_ * 0.8, a: A_ * 0.7 }); skEllipse(g, x, y + s * 0.6, s * 0.7, s * 0.18, { w: W_, a: A_ }); }
    else if (kind === 'heart') { sk(g, spline([[x, y + s * 0.7], [x - s * 0.75, y - s * 0.05], [x - s * 0.4, y - s * 0.65], [x, y - s * 0.3], [x + s * 0.4, y - s * 0.65], [x + s * 0.75, y - s * 0.05]], 6, true), { w: W_, a: A_ }); }
    else if (kind === 'sun') { skEllipse(g, x, y, s * 0.4, s * 0.4, { w: W_, a: A_ }); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; sk(g, [[x + Math.cos(a) * s * 0.55, y + Math.sin(a) * s * 0.55], [x + Math.cos(a) * s * 0.85, y + Math.sin(a) * s * 0.85]], { w: W_ * 0.8, a: A_ }); } }
    else if (kind === 'note') { skEllipse(g, x - s * 0.25, y + s * 0.45, s * 0.28, s * 0.2, { w: W_, a: A_ }); sk(g, [[x + s * 0.02, y + s * 0.45], [x + s * 0.02, y - s * 0.7], [x + s * 0.5, y - s * 0.45]], { w: W_, a: A_ }); }
    else if (kind === 'snow') { for (let i = 0; i < 3; i++) { const a = i * Math.PI / 3; sk(g, [[x - Math.cos(a) * s * 0.8, y - Math.sin(a) * s * 0.8], [x + Math.cos(a) * s * 0.8, y + Math.sin(a) * s * 0.8]], { w: W_, a: A_ }); } }
    else if (kind === 'flower') { for (let i = 0; i < 5; i++) { const a = i * 1.2566; skEllipse(g, x + Math.cos(a) * s * 0.4, y + Math.sin(a) * s * 0.4, s * 0.28, s * 0.28, { w: W_ * 0.9, a: A_ }); } }
    else if (kind === 'leaf') { sk(g, spline([[x - s * 0.7, y + s * 0.5], [x - s * 0.2, y - s * 0.6], [x + s * 0.7, y - s * 0.5], [x + s * 0.1, y + s * 0.5]], 6, true), { w: W_, a: A_ }); sk(g, [[x - s * 0.7, y + s * 0.5], [x + s * 0.5, y - s * 0.4]], { w: W_ * 0.7, a: A_ }); }
  });
}
// ---------------- 对话泡泡、信封 ----------------
function bubble(g, x, y, w, h, tx, ty, o = {}) {
  withSeed(o.seed ?? 8600, () => {
    const pts = [];
    for (let i = 0; i < 24; i++) { const a = i / 24 * 6.283; pts.push([x + Math.cos(a) * w / 2 * (1 + 0.04 * Math.sin(a * 5)), y + Math.sin(a) * h / 2]); }
    const pth = pathOf(spline(pts, 4, true)); paperFill(g, pth);
    const tail = [[x + (tx - x) * 0.25 - 12, y + h * 0.4], [tx, ty], [x + (tx - x) * 0.25 + 14, y + h * 0.42]];
    const tp = pathOf(tail); paperFill(g, tp);
    sk(g, spline(pts, 4, true), { w: 2, a: 0.85 });
    sk(g, [tail[0], tail[1], tail[2]], { w: 2, a: 0.85 });
    if (o.inside) o.inside(g, x, y);
  });
}
function envelope(g, x, y, w, h, rot, o = {}) {
  g.save(); g.translate(x, y); g.rotate(R(rot));
  withSeed(o.seed ?? 8700, () => {
    part(g, [[-w / 2, -h / 2], [w / 2, -h / 2], [w / 2, h / 2], [-w / 2, h / 2]], { w: 1.8, per: 1, tone: 0.05 });
    sk(g, [[-w / 2, -h / 2], [0, h * 0.1], [w / 2, -h / 2]], { w: 1.4, a: 0.7 });
    doodle(g, 'heart', 0, h * 0.08, h * 0.2);
  });
  g.restore();
}
// 哼出来的"沙哑"音符：一串抖动的涂鸦线，带几个音符头
function scribbleNotes(g, pts, t, o = {}) {
  const a = o.a ?? 1;
  if (a <= 0.01) return;
  g.save(); g.globalAlpha = a;
  withSeed(o.seed ?? 8800, () => {
    // 抖动的线（越往后越宽松）
    const q = [];
    for (let i = 0; i < pts.length; i++) { const [x, y] = pts[i]; q.push([x + Math.sin(i * 1.7 + t * 9) * (o.rough ?? 4), y + Math.cos(i * 2.3 + t * 7) * (o.rough ?? 4)]); }
    if (o.warm) eraseStroke(g, q, (o.w ?? 1.8) * 2.6, 0.35);
    sk(g, q, { w: o.w ?? 1.8, a: 0.8, j: 2.5, passes: 2, taper: 0.6 });
    const step = Math.max(3, Math.floor(pts.length / 5));
    for (let i = step; i < pts.length; i += step) doodle(g, 'note', q[i][0], q[i][1] - 12, o.size ?? 16);
  });
  g.restore();
  if (o.warm) for (let i = 0; i < pts.length; i += 3) glow(g, pts[i][0], pts[i][1], 40, C.amber, 0.12 * o.warm * a);
}

// ---------------- 特写：她的侧脸（朝右） ----------------
// (x, y) 头的中心，s 头高（像素）。o: eyes 'open'|'closed'|'down'|'wide'；blink 0~1；look 视线（-1 往下，1 往上）；
// tear；blush；mouth 'closed'|'open'|'smile'；hair 摆动；moon 月光从右边照来的强度；warm 暖光；tilt 低头/抬头（度）
function herClose(g, x, y, s, o = {}) {
  const u = s / 2;
  g.save(); g.translate(x, y); if (o.flip) g.scale(-1, 1); g.rotate(R(o.tilt ?? 0));
  const Q = (a, b) => [a * u, b * u];
  const sw = (o.hair ?? 0) * 0.05;
  withSeed(o.seed ?? 9100, () => {
    // 肩膀、开衫
    const sh = [Q(0.3, 1.22), Q(0.42, 1.55), Q(0.85, 2.05), Q(1.15, 2.7), Q(-1.7, 2.7), Q(-1.55, 2.0), Q(-0.95, 1.5), Q(-0.4, 1.22)];
    const shp = pathOf(spline(sh, 6, true)); paperFill(g, shp); shade(g, shp, 0.45, 80, { scale: 0.9 });
    g.save(); g.clip(shp); for (let i = -7; i <= 6; i++) sk(g, [Q(i * 0.2, 1.45), Q(i * 0.25, 2.8)], { w: 1, a: 0.24, passes: 1 }); g.restore();
    sk(g, spline([Q(0.3, 1.22), Q(0.42, 1.55), Q(0.85, 2.05), Q(1.15, 2.7)], 6), { w: 2.4, a: 0.85 });
    sk(g, spline([Q(-0.4, 1.22), Q(-0.95, 1.5), Q(-1.55, 2.0), Q(-1.7, 2.7)], 6), { w: 2.4, a: 0.85 });
    sk(g, [Q(0.6, 1.8), Q(0.4, 2.7)], { w: 1.6, a: 0.6 });       // 开衫的门襟
    part(g, [Q(0.24, 1.16), Q(0.55, 1.4), Q(0.15, 1.58), Q(-0.15, 1.4), Q(-0.36, 1.18)], { w: 1.8, per: 3 });   // 白衬衫领
    // 脖子（画在脸后面，上沿被下巴盖住；下巴底下有一道影子）
    const nk = [Q(0.16, 0.6), Q(0.25, 1.26), Q(-0.42, 1.3), Q(-0.34, 0.38)];
    const np = pathOf(spline(nk, 4, true)); paperFill(g, np); shade(g, np, 0.24, 60, { scale: 0.9 });
    g.save(); g.clip(np); smudgeBlob(g, 0.0, 0.78 * u, 0.42 * u, 0.32, 0.45); g.restore();
    sk(g, spline([Q(0.2, 0.7), Q(0.22, 0.95), Q(0.26, 1.24)], 5), { w: 2, a: 0.8 }); sk(g, spline([Q(-0.33, 0.45), Q(-0.37, 0.9), Q(-0.41, 1.28)], 5), { w: 1.8, a: 0.62 });
    // 脸（额头被刘海盖住）
    const fp = [Q(0.55, -0.75), Q(0.66, -0.3), Q(0.67, -0.17), Q(0.63, -0.07), Q(0.69, 0.04), Q(0.8, 0.14), Q(0.79, 0.19), Q(0.69, 0.235), Q(0.72, 0.3), Q(0.685, 0.345),
      Q(0.705, 0.39), Q(0.64, 0.47), Q(0.665, 0.58), Q(0.58, 0.69), Q(0.38, 0.74), Q(0.06, 0.63), Q(-0.12, 0.42), Q(-0.3, 0.1), Q(-0.35, -0.5), Q(0.1, -0.95)];
    const facePath = pathOf(spline(fp, 6, true)); paperFill(g, facePath);
    g.save(); g.clip(facePath);
    const shd = new Path2D(); shd.rect(-1 * u, -1.2 * u, 1.08 * u, 2.4 * u); shade(g, shd, 0.14, 60, { scale: 0.9 });
    smudgeBlob(g, 0.25 * u, 0.62 * u, 0.3 * u, 0.12, 0.6);
    g.restore();
    sk(g, spline(fp.slice(1, 17), 6), { w: 2.6, a: 0.9, j: 0.5 });
    // 眼睛
    const look = o.look ?? 0, bl = o.blink ?? 0;
    const ex = 0.45 * u, ey = -0.08 * u;
    const open = (o.eyes === 'closed' ? 0 : 1) * (1 - bl) * (o.eyes === 'down' ? 0.55 : o.eyes === 'wide' ? 1.25 : 1);
    if (open < 0.12) {
      sk(g, spline([[ex - 0.13 * u, ey], [ex, ey + 0.03 * u], [ex + 0.11 * u, ey + 0.01 * u]], 5), { w: 2.2, a: 0.9 });
      sk(g, [[ex + 0.09 * u, ey + 0.015 * u], [ex + 0.15 * u, ey + 0.05 * u]], { w: 1.4, a: 0.7 });
    } else {
      const top = [[ex - 0.13 * u, ey], [ex - 0.02 * u, ey - 0.07 * u * open], [ex + 0.1 * u, ey - 0.028 * u * open]];
      const bot = [[ex - 0.12 * u, ey + 0.012 * u], [ex + 0.0 * u, ey + 0.045 * u * open], [ex + 0.09 * u, ey + 0.012 * u]];
      const eyeP = pathOf(spline(top.concat(bot.slice().reverse()), 5, true)); erase(g, eyeP, 1);
      g.save(); g.clip(eyeP);
      const ix = ex + 0.045 * u, iy = ey - 0.008 * u - look * 0.018 * u;
      const ir = new Path2D(); ir.ellipse(ix, iy, 0.032 * u, 0.055 * u, 0, 0, 6.283);
      g.fillStyle = graphStyle(g); g.globalAlpha = 0.95; g.fill(ir); g.globalAlpha = 1;
      erase(g, circlePath(ix + 0.012 * u, iy - 0.02 * u, 0.011 * u), 1);
      g.restore();
      sk(g, spline(top, 5), { w: 2.6, a: 0.95, taper: 0.4 });
      sk(g, spline(bot, 5), { w: 1.1, a: 0.55, taper: 0.5 });
      for (let i = 0; i < 4; i++) { const p0 = [lerp(ex - 0.03 * u, ex + 0.1 * u, i / 3), lerp(ey - 0.065 * u * open, ey - 0.028 * u * open, i / 3)]; sk(g, [p0, [p0[0] + 0.045 * u, p0[1] - 0.035 * u]], { w: 1.1, a: 0.75, passes: 1, taper: 0.8 }); }
    }
    const bw = (o.brows ?? 0) * 0.03 * u;
    sk(g, spline([[ex - 0.17 * u, ey - 0.19 * u + bw], [ex - 0.02 * u, ey - 0.245 * u], [ex + 0.13 * u, ey - 0.2 * u - bw]], 5), { w: 2.2, a: 0.78, taper: 0.6 });
    sk(g, [[0.71 * u, 0.2 * u], [0.75 * u, 0.215 * u]], { w: 1.2, a: 0.5 });
    const m = o.mouth ?? 'closed';
    if (m === 'open') { const mo = new Path2D(); mo.ellipse(0.665 * u, 0.345 * u, 0.032 * u, 0.026 * u, 0, 0, 6.283); g.save(); g.fillStyle = graphStyle(g); g.globalAlpha = 0.7; g.fill(mo); g.restore(); }
    else sk(g, [[0.6 * u, 0.345 * u], [0.685 * u, 0.345 * u]], { w: 1.4, a: 0.72 });
    if (m === 'smile') sk(g, [[0.57 * u, 0.32 * u], [0.605 * u, 0.345 * u]], { w: 1.2, a: 0.6 });
    if (o.blush) { for (let i = 0; i < 5; i++) sk(g, [[(0.26 + i * 0.05) * u, 0.27 * u], [(0.31 + i * 0.05) * u, 0.17 * u]], { w: 1.1, a: 0.45 * o.blush, passes: 1 }); glow(g, 0.38 * u, 0.22 * u, 0.2 * u, C.rose, 0.3 * o.blush, 'multiply'); }
    if (o.tear) { const ty = ey + 0.09 * u + o.tear * 0.42 * u, tx = ex + 0.05 * u + o.tear * 0.05 * u; const tp = new Path2D(); tp.ellipse(tx, ty, 0.034 * u, 0.052 * u, 0, 0, 6.283); sk(g, spline([[ex + 0.02 * u, ey + 0.06 * u], [tx - 0.01 * u, (ey + ty) / 2], [tx, ty - 0.04 * u]], 4), { w: 1.2, a: 0.35, passes: 1 }); glow(g, tx, ty, 0.12 * u, C.amberHot, 0.5); erase(g, tp, 1); sk(g, spline([[tx - 0.022 * u, ty], [tx, ty + 0.036 * u], [tx + 0.022 * u, ty]], 4), { w: 1, a: 0.6 }); glow(g, tx, ty, 0.05 * u, C.moonHot, 0.6); }
    // 头发：齐刘海、齐下巴的短发，侧边别在耳朵后面
    const hp = [Q(0.7, -0.25), Q(0.69, -0.7), Q(0.26, -1.12), Q(-0.5, -1.08), Q(-0.98, -0.62), Q(-1.1 + sw * 0.4, 0.05), Q(-1.02 + sw, 0.6), Q(-0.8 + sw, 0.86), Q(-0.56 + sw * 0.8, 0.9),
      Q(-0.42 + sw * 0.6, 0.78), Q(-0.33, 0.42), Q(-0.3, 0.0), Q(-0.16, -0.2), Q(0.18, -0.23), Q(0.42, -0.25)];
    const hpath = pathOf(spline(hp, 6, true)); paperFill(g, hpath); shade(g, hpath, 0.7, 72, { scale: 0.9 });
    g.save(); g.clip(hpath);
    for (let i = 0; i < 20; i++) { const v = i / 19; sk(g, spline([Q(lerp(0.6, -0.8, v), lerp(-0.9, -0.98, v)), Q(lerp(0.4, -1.02, v), lerp(-0.5, -0.3, v)), Q(lerp(0.45, -0.75, v) + sw * v, lerp(-0.25, 0.86, v))], 6), { w: 1.1, a: 0.4, passes: 1, taper: 0.8 }); }
    for (let i = 0; i < 6; i++) { const v = (i + hash(i, 61) * 0.6) / 6; const c0 = [lerp(0.42, -0.8, v), -0.93 - Math.sin(v * Math.PI) * 0.1 + (hash(i, 62) - 0.5) * 0.08]; const L_ = 0.04 + hash(i, 63) * 0.09; eraseStroke(g, [Q(c0[0] + L_, c0[1] + L_ * 0.5), Q(c0[0] - L_, c0[1] - 0.01)], (0.02 + hash(i, 64) * 0.025) * u, 0.38 + hash(i, 65) * 0.2); }
    g.restore();
    sk(g, spline(hp, 6, true), { w: 2.6, a: 0.9 });
    for (let i = 0; i < 5; i++) { const xx = lerp(0.22, 0.66, i / 4); sk(g, [Q(xx, -0.25), Q(xx - 0.02, -0.42)], { w: 1.1, a: 0.5, passes: 1 }); }
    // 耳朵（头发别在它后面）
    const ep = [Q(-0.08, -0.12), Q(0.0, 0.02), Q(-0.03, 0.22), Q(-0.11, 0.29), Q(-0.22, 0.2), Q(-0.25, -0.02), Q(-0.18, -0.13)];
    part(g, ep, { w: 2, per: 5, tone: 0.08 });
    sk(g, spline([Q(-0.09, -0.05), Q(-0.17, 0.04), Q(-0.12, 0.17)], 5), { w: 1.3, a: 0.6 });
    smudgeBlob(g, -0.12 * u, 0.05 * u, 0.06 * u, 0.25);
    // 耳朵前面垂下来的一缕碎发
    sk(g, spline([Q(0.02, -0.21), Q(0.06, 0.02), Q(0.03, 0.28)], 5), { w: 1.1, a: 0.5, passes: 1, taper: 0.8 });
    // 架在耳朵上的黑铅笔
    if (o.pencil !== false) blackPencil(g, 0.07 * u, -0.05 * u, 0.62 * u, 196, { w: 0.036 * u, seed: 9150 });
  });
  if (o.moon) glow(g, 0.85 * u, 0, 0.8 * u, C.moon, 0.28 * o.moon);
  if (o.warm) glow(g, 0.6 * u, 0.2 * u, 1.2 * u, C.amber, 0.3 * o.warm);
  g.restore();
}

// ---------------- 特写：他的侧脸（朝右） ----------------
// 参数和 herClose 一样；他的鼻梁高一点、下巴方一点、眉毛浓，头发乱，额前翘起一撮
function hisClose(g, x, y, s, o = {}) {
  const u = s / 2;
  g.save(); g.translate(x, y); if (o.flip) g.scale(-1, 1); g.rotate(R(o.tilt ?? 0));
  const Q = (a, b) => [a * u, b * u];
  withSeed(o.seed ?? 9200, () => {
    // 肩膀：条纹衫、背带
    const sh = [Q(0.32, 1.2), Q(0.5, 1.55), Q(0.95, 2.05), Q(1.3, 2.7), Q(-1.8, 2.7), Q(-1.6, 2.0), Q(-1.0, 1.5), Q(-0.42, 1.2)];
    const shp = pathOf(spline(sh, 6, true)); paperFill(g, shp); shade(g, shp, o.night ? 0.2 : 0.06, 80, { scale: 0.9 });
    g.save(); g.clip(shp); for (let i = 0; i < 6; i++) { const yy = 1.45 + i * 0.24; const st = new Path2D(); st.moveTo(-2 * u, (yy - 0.05) * u); st.lineTo(2 * u, (yy + 0.1) * u); st.lineTo(2 * u, (yy + 0.2) * u); st.lineTo(-2 * u, (yy + 0.05) * u); st.closePath(); shade(g, st, 0.72, 5, { hatch: 0.5, scale: 0.8 }); } g.restore();
    sk(g, spline([Q(0.32, 1.2), Q(0.5, 1.55), Q(0.95, 2.05), Q(1.3, 2.7)], 6), { w: 2.4, a: 0.85 });
    sk(g, spline([Q(-0.42, 1.2), Q(-1.0, 1.5), Q(-1.6, 2.0), Q(-1.8, 2.7)], 6), { w: 2.4, a: 0.85 });
    sk(g, [Q(0.45, 1.6), Q(0.2, 2.7)], { w: 4, a: 0.85 });            // 背带
    // 脖子
    const nk = [Q(0.2, 0.62), Q(0.3, 1.28), Q(-0.46, 1.3), Q(-0.38, 0.4)];
    const np = pathOf(spline(nk, 4, true)); paperFill(g, np); shade(g, np, 0.26, 60, { scale: 0.9 });
    g.save(); g.clip(np); smudgeBlob(g, 0.0, 0.78 * u, 0.42 * u, 0.32, 0.45); g.restore();
    sk(g, spline([Q(0.24, 0.72), Q(0.26, 0.98), Q(0.3, 1.25)], 5), { w: 2, a: 0.8 }); sk(g, spline([Q(-0.37, 0.45), Q(-0.42, 0.9), Q(-0.46, 1.28)], 5), { w: 1.8, a: 0.62 });
    sk(g, [Q(0.27, 0.92), Q(0.31, 0.98)], { w: 1.4, a: 0.5 });          // 喉结
    // 脸
    const fp = [Q(0.56, -0.78), Q(0.68, -0.32), Q(0.7, -0.18), Q(0.64, -0.06), Q(0.72, 0.06), Q(0.86, 0.17), Q(0.84, 0.22), Q(0.72, 0.25), Q(0.74, 0.31), Q(0.7, 0.36),
      Q(0.715, 0.41), Q(0.65, 0.48), Q(0.69, 0.6), Q(0.62, 0.72), Q(0.4, 0.78), Q(0.05, 0.66), Q(-0.14, 0.42), Q(-0.3, 0.1), Q(-0.36, -0.5), Q(0.1, -0.95)];
    const facePath = pathOf(spline(fp, 6, true)); paperFill(g, facePath);
    g.save(); g.clip(facePath);
    const shd = new Path2D(); shd.rect(-1 * u, -1.2 * u, 1.1 * u, 2.4 * u); shade(g, shd, o.night ? 0.3 : 0.18, 60, { scale: 0.9 });
    smudgeBlob(g, 0.3 * u, 0.66 * u, 0.32 * u, 0.14, 0.6);
    g.restore();
    sk(g, spline(fp.slice(1, 17), 6), { w: 2.8, a: 0.9, j: 0.5 });
    // 耳朵
    const ep = [Q(-0.08, -0.14), Q(0.0, 0.02), Q(-0.03, 0.22), Q(-0.12, 0.3), Q(-0.24, 0.2), Q(-0.27, -0.02), Q(-0.18, -0.14)];
    part(g, ep, { w: 2, per: 5, tone: 0.12 });
    sk(g, spline([Q(-0.09, -0.06), Q(-0.18, 0.04), Q(-0.12, 0.18)], 5), { w: 1.3, a: 0.6 });
    // 眼睛
    const look = o.look ?? 0, bl = o.blink ?? 0;
    const ex = 0.46 * u, ey = -0.07 * u;
    const open = (o.eyes === 'closed' ? 0 : 1) * (1 - bl) * (o.eyes === 'down' ? 0.55 : o.eyes === 'wide' ? 1.3 : 1);
    if (open < 0.12) {
      sk(g, spline([[ex - 0.12 * u, ey], [ex, ey + 0.025 * u], [ex + 0.1 * u, ey + 0.01 * u]], 5), { w: 2.4, a: 0.9 });
    } else {
      const top = [[ex - 0.12 * u, ey], [ex - 0.02 * u, ey - 0.055 * u * open], [ex + 0.09 * u, ey - 0.022 * u * open]];
      const bot = [[ex - 0.11 * u, ey + 0.01 * u], [ex, ey + 0.035 * u * open], [ex + 0.08 * u, ey + 0.01 * u]];
      const eyeP = pathOf(spline(top.concat(bot.slice().reverse()), 5, true)); erase(g, eyeP, 1);
      g.save(); g.clip(eyeP);
      const ix = ex + 0.04 * u, iy = ey - 0.006 * u - look * 0.016 * u;
      const ir = new Path2D(); ir.ellipse(ix, iy, 0.028 * u, 0.046 * u, 0, 0, 6.283);
      g.fillStyle = graphStyle(g); g.globalAlpha = 0.95; g.fill(ir); g.globalAlpha = 1;
      erase(g, circlePath(ix + 0.01 * u, iy - 0.016 * u, 0.01 * u), 1);
      g.restore();
      sk(g, spline(top, 5), { w: 2.8, a: 0.95, taper: 0.4 });
      sk(g, spline(bot, 5), { w: 1.1, a: 0.5, taper: 0.5 });
    }
    const bw = (o.brows ?? 0) * 0.03 * u;
    sk(g, spline([[ex - 0.18 * u, ey - 0.15 * u + bw], [ex - 0.02 * u, ey - 0.2 * u], [ex + 0.14 * u, ey - 0.16 * u - bw]], 5), { w: 4, a: 0.82, taper: 0.5 });
    sk(g, [[0.72 * u, 0.2 * u], [0.76 * u, 0.22 * u]], { w: 1.2, a: 0.5 });
    const m = o.mouth ?? 'closed';
    if (m === 'open') { const mo = new Path2D(); mo.ellipse(0.68 * u, 0.355 * u, 0.034 * u, 0.026 * u, 0, 0, 6.283); g.save(); g.fillStyle = graphStyle(g); g.globalAlpha = 0.7; g.fill(mo); g.restore(); }
    else sk(g, [[0.6 * u, 0.355 * u], [0.7 * u, 0.355 * u]], { w: 1.5, a: 0.75 });
    if (m === 'smile') sk(g, [[0.565 * u, 0.33 * u], [0.605 * u, 0.355 * u]], { w: 1.3, a: 0.65 });
    if (o.blush) { for (let i = 0; i < 4; i++) sk(g, [[(0.3 + i * 0.05) * u, 0.26 * u], [(0.35 + i * 0.05) * u, 0.16 * u]], { w: 1.1, a: 0.4 * o.blush, passes: 1 }); glow(g, 0.4 * u, 0.22 * u, 0.2 * u, C.rose, 0.25 * o.blush, 'multiply'); }
    if (o.tear) { const ty = ey + 0.09 * u + o.tear * 0.42 * u, tx = ex + 0.05 * u; const tp = new Path2D(); tp.ellipse(tx, ty, 0.03 * u, 0.048 * u, 0, 0, 6.283); erase(g, tp, 1); glow(g, tx, ty, 0.1 * u, C.amberHot, 0.5); }
    // 头发：乱乱的，额前一撮翘起来，耳朵上面剪短
    const hp = [Q(0.66, -0.36), Q(0.82, -0.62), Q(0.62, -0.98), Q(0.2, -1.16), Q(-0.4, -1.12), Q(-0.86, -0.86), Q(-1.02, -0.4), Q(-0.98, 0.1), Q(-0.8, 0.42), Q(-0.6, 0.38),
      Q(-0.42, 0.12), Q(-0.3, -0.12), Q(-0.12, -0.22), Q(0.12, -0.36), Q(0.36, -0.42)];
    const hpath = pathOf(spline(hp, 6, true)); paperFill(g, hpath); shade(g, hpath, o.night ? 0.75 : 0.62, 50, { scale: 0.9 });
    g.save(); g.clip(hpath);
    for (let i = 0; i < 16; i++) { const v = i / 15; sk(g, spline([Q(lerp(0.6, -0.85, v), lerp(-1.0, -0.95, v)), Q(lerp(0.4, -0.95, v), lerp(-0.6, -0.3, v)), Q(lerp(0.4, -0.75, v), lerp(-0.38, 0.35, v))], 6), { w: 1.2, a: 0.42, passes: 1, taper: 0.8 }); }
    for (let i = 0; i < 5; i++) { const v = i / 4; eraseStroke(g, [Q(lerp(0.3, -0.6, v) + 0.06, -0.98 - Math.sin(v * 3) * 0.06), Q(lerp(0.3, -0.6, v) - 0.06, -0.96 - Math.sin(v * 3) * 0.06)], 0.03 * u, 0.4); }
    g.restore();
    sk(g, spline(hp, 6, true), { w: 2.8, a: 0.9 });
    sk(g, spline([Q(0.55, -0.9), Q(0.95, -0.82), Q(0.8, -0.56)], 5), { w: 2.2, a: 0.8 });
  });
  if (o.warm) glow(g, 0.6 * u, 0.2 * u, 1.3 * u, C.amber, 0.3 * o.warm);
  if (o.moon) glow(g, 0.85 * u, 0, 0.8 * u, C.moon, 0.28 * o.moon);
  g.restore();
}
