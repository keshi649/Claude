// figures.js — 人物：她（剧场的灯光师，"我"）、他（默剧演员，"你"）、女主演（"她"）。
// 侧身的二维骨骼：髋 → 躯干 → 脖子 → 头；肩 → 上臂 → 前臂 → 手；髋 → 大腿 → 小腿 → 脚。
// 角度都用度：手臂、腿从"竖直向下"量起，往脸朝的方向转为正；躯干从"竖直向上"量起，往前倾为正。
// 画法：每块先用纸色填（挡住后面的线），再上调子、描轮廓；线宽按屏幕像素算（缩小了也是铅笔线的粗细）。

const BODY = {
  her: { head: 17, neck: 3.0, torso: 26, uarm: 15, farm: 13.5, hand: 5.2, thigh: 22, shin: 21, foot: 8,
    chest: 6.0, waist: 5.2, hipw: 6.8, armw: 2.9, legw: 3.2 },
  him: { head: 16.2, neck: 3.6, torso: 30, uarm: 17, farm: 15, hand: 5.8, thigh: 25, shin: 24, foot: 9.4,
    chest: 7.4, waist: 6.4, hipw: 6.8, armw: 3.2, legw: 3.8 },
  star: { head: 16.6, neck: 3.3, torso: 27, uarm: 15.5, farm: 14, hand: 5.2, thigh: 23, shin: 22, foot: 8.2,
    chest: 6.4, waist: 5.0, hipw: 7.0, armw: 2.8, legw: 3.1 },
};
const R = d => d * Math.PI / 180;
const dirDown = a => [Math.sin(R(a)), Math.cos(R(a))];
const dirUp = a => [Math.sin(R(a)), -Math.cos(R(a))];
const add = (p, d, s) => [p[0] + d[0] * s, p[1] + d[1] * s];
const norm = v => { const l = Math.hypot(v[0], v[1]) || 1; return [v[0] / l, v[1] / l]; };

const POSE0 = { torso: 0, neck: 0, look: 0.3, aF: [6, 12], aB: [-6, 10], lF: [3, -3], lB: [-3, -3], fF: 0, fB: 0,
  hF: 'open', hB: 'open', wF: 0, wB: 0, eyes: 'open', mouth: 'none', brows: 0, blush: 0, hair: 0, tear: 0, bob: 0 };
function P(o) { return Object.assign({}, POSE0, o); }
function poseMix(a, b, t) {
  const o = {};
  for (const k in a) {
    const x = a[k], y = b[k] ?? x;
    if (Array.isArray(x)) o[k] = x.map((v, i) => lerp(v, y[i], t));
    else if (typeof x === 'number') o[k] = lerp(x, typeof y === 'number' ? y : x, t);
    else o[k] = t < 0.5 ? x : y;
  }
  for (const k in b) if (!(k in o)) o[k] = b[k];
  return o;
}
// 走路 / 跑步：p 是步伐相位（每走两步 +1）
function walkPose(p, run = 0, base = {}) {
  const s = Math.sin(p * 6.283), c = Math.cos(p * 6.283);
  const A = lerp(22, 40, run), K = lerp(28, 75, run);
  return P(Object.assign({
    torso: lerp(3, 14, run), neck: lerp(2, -6, run),
    aF: [-lerp(16, 42, run) * s, lerp(16, 75, run)], aB: [lerp(16, 42, run) * s, lerp(16, 75, run)],
    lF: [A * s, -Math.max(0, -c) * K - 5], lB: [-A * s, -Math.max(0, c) * K - 5],
    fF: Math.max(0, -s) * 16, fB: Math.max(0, s) * 16, bob: Math.abs(c) * lerp(1.0, 3, run),
  }, base));
}

function joints(B, p) {
  const J = {};
  J.hip = [0, 0];
  const tor = p.torso;
  J.up = dirUp(tor); J.fw = [-J.up[1], J.up[0]];
  J.neck = add(J.hip, J.up, B.torso);
  J.sh = add(J.neck, J.up, -2.6);
  J.headRot = tor * 0.6 + p.neck;
  J.headC = add(J.neck, dirUp(tor * 0.8 + p.neck * 0.6), B.neck + B.head * 0.46);
  const arm = (a) => { const e = add(J.sh, dirDown(tor + a[0]), B.uarm); const w = add(e, dirDown(tor + a[0] + a[1]), B.farm); return [e, w, tor + a[0] + a[1]]; };
  [J.elF, J.wrF, J.angF] = arm(p.aF);
  [J.elB, J.wrB, J.angB] = arm(p.aB);
  const leg = (l, f) => { const k = add(J.hip, dirDown(l[0]), B.thigh); const an = add(k, dirDown(l[0] + l[1]), B.shin); return [k, an, l[0] + l[1] + f]; };
  [J.knF, J.anF, J.ftF] = leg(p.lF, p.fF || 0);
  [J.knB, J.anB, J.ftB] = leg(p.lB, p.fB || 0);
  J.footBottom = Math.max(J.anF[1], J.anB[1]) + 3.0;
  return J;
}
function limbOutline(pts, ws, capA = true, capB = true) {
  const n = pts.length, L = [], Rr = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
    L.push([pts[i][0] - ty * ws[i], pts[i][1] + tx * ws[i]]);
    Rr.push([pts[i][0] + ty * ws[i], pts[i][1] - tx * ws[i]]);
  }
  const out = [];
  if (capA) { const p = pts[0], q = pts[1]; const d = norm([p[0] - q[0], p[1] - q[1]]); out.push([p[0] + d[0] * ws[0] * 0.8, p[1] + d[1] * ws[0] * 0.8]); }
  out.push(...L);
  if (capB) { const p = pts[n - 1], q = pts[n - 2]; const d = norm([p[0] - q[0], p[1] - q[1]]); out.push([p[0] + d[0] * ws[n - 1] * 0.8, p[1] + d[1] * ws[n - 1] * 0.8]); }
  out.push(...Rr.reverse());
  return out;
}
function mid(a, b, t = 0.5) { return [lerp(a[0], b[0], t), lerp(a[1], b[1], t)]; }

// 线宽（屏幕像素 → 当前单位）
const LW = { out: 2.4, in: 1.4, fine: 1.0, px: 1 };
function setLW(g, mul = 1) { const s = scaleOf(g); LW.px = 1 / s; LW.out = 2.6 * mul / s; LW.in = 1.55 * mul / s; LW.fine = 1.1 * mul / s; }
// 画一块：纸填、调子、轮廓
function part(g, pts, o = {}) {
  const sp = spline(pts, o.per ?? 6, true);
  const path = pathOf(sp);
  paperFill(g, path, o.fillA ?? 1);
  if (o.tone) shade(g, path, o.tone, o.ang ?? 60, { hatch: o.hatch, cross: o.cross, scale: o.hs ?? 0.8, sscale: 1.2 });
  if (o.inner) o.inner(path);
  if (o.line !== false) sk(g, sp, { w: o.w ?? LW.out, a: o.a ?? 0.88, j: o.j ?? 0.8, taper: 0.05, passes: o.passes ?? 2 });
  return path;
}

// ---------------- 手 ----------------
function hand(g, c, ang, type, B, o = {}) {
  const s = B.hand, d = dirDown(ang), n = [d[1], -d[0]];
  const Q = (u, v) => [c[0] + d[0] * u * s + n[0] * v * s, c[1] + d[1] * u * s + n[1] * v * s];
  let pts;
  if (type === 'fist') pts = [Q(-0.5, -0.42), Q(0.15, -0.5), Q(0.6, -0.28), Q(0.62, 0.2), Q(0.3, 0.5), Q(-0.4, 0.45)];
  else if (type === 'point') pts = [Q(-0.5, -0.38), Q(0.3, -0.42), Q(1.3, -0.24), Q(1.34, -0.08), Q(0.45, 0.04), Q(0.5, 0.38), Q(-0.3, 0.46)];
  else if (type === 'flat') pts = [Q(-0.5, -0.3), Q(0.85, -0.34), Q(1.2, -0.18), Q(1.2, 0.1), Q(0.85, 0.26), Q(0.15, 0.55), Q(-0.4, 0.32)];
  else if (type === 'hold') pts = [Q(-0.45, -0.42), Q(0.3, -0.55), Q(0.7, -0.15), Q(0.6, 0.32), Q(0.1, 0.5), Q(-0.4, 0.42)];
  else pts = [Q(-0.5, -0.36), Q(0.5, -0.4), Q(0.98, -0.2), Q(0.98, 0.12), Q(0.5, 0.28), Q(0.22, 0.56), Q(-0.35, 0.42)];
  part(g, pts, { w: LW.in * 1.15, tone: o.tone || 0, ang: 40 });
}

// ---------------- 头 ----------------
const HEAD_PROF = [[-0.1, -1.0], [0.55, -0.74], [0.8, -0.26], [0.8, -0.12], [0.97, 0.1], [0.8, 0.22], [0.83, 0.32], [0.8, 0.47], [0.72, 0.66], [0.52, 0.84], [0.12, 0.78], [-0.2, 0.55], [-0.74, 0.3], [-0.92, -0.25], [-0.65, -0.82]];
const HEAD_FRONT = [[0, -1.0], [0.6, -0.82], [0.82, -0.4], [0.84, -0.15], [0.85, 0.06], [0.82, 0.24], [0.77, 0.38], [0.68, 0.53], [0.5, 0.72], [0.2, 0.9], [-0.2, 0.9], [-0.5, 0.72], [-0.77, 0.38], [-0.84, -0.15], [-0.6, -0.82]];
function headPts(B, look, who) {
  const r = B.head * 0.5;
  const sharp = who === 'him' ? 1 : 0.85;              // 她们的鼻子小一点
  return HEAD_PROF.map((pp, i) => {
    let px = pp[0], py = pp[1];
    if (i >= 3 && i <= 7) px = lerp(0.78, px, sharp);
    return [lerp(px, HEAD_FRONT[i][0], look) * r, lerp(py, HEAD_FRONT[i][1], look) * r];
  });
}
function face(g, B, p, who) {
  const r = B.head * 0.5, look = p.look, k = 1 / LW.px;
  const small = k * B.head < 30;
  const eyeS = who === 'him' ? 0.115 : 0.14;
  const ex = lerp(0.5, 0.33, look) * r, ey = -0.06 * r;
  const eye = (x, y, sz, near) => {
    const er = sz * r;
    if (small) { const d_ = new Path2D(); d_.arc(x, y, Math.max(er * 0.55, 0.9 * LW.px), 0, 6.283); g.save(); g.fillStyle = graphStyle(g); g.fill(d_); g.restore(); return; }
    if (p.eyes === 'closed' || p.eyes === 'smile') {
      const up = p.eyes === 'smile' ? -1 : 1;
      sk(g, [[x - er * 1.0, y], [x, y + up * er * 0.55], [x + er * 1.0, y]], { w: LW.in * 1.15, a: 0.85, taper: 0.4, passes: 1 });
      if (who !== 'him' && p.eyes === 'closed') sk(g, [[x + er * 0.85, y + er * 0.2], [x + er * 1.4, y + er * 0.5]], { w: LW.fine, a: 0.6, passes: 1 });
      return;
    }
    const h = p.eyes === 'half' ? 0.55 : p.eyes === 'wide' ? 1.2 : p.eyes === 'down' ? 0.5 : 1;
    const dy = p.eyes === 'down' ? er * 0.3 : 0;
    const ell = new Path2D(); ell.ellipse(x, y + dy, er * (near ? 0.6 : 0.5), er * h * 0.95, 0, 0, 6.283);
    g.save(); g.fillStyle = graphStyle(g); g.globalAlpha = 0.95; g.fill(ell); g.restore();
    if (p.eyes !== 'down') { const hl = new Path2D(); hl.arc(x + er * 0.18, y - er * 0.32 * h, er * 0.2, 0, 6.283); erase(g, hl, 0.95); }
    if (who !== 'him') {
      sk(g, [[x + er * 0.4, y - er * 0.75 * h + dy], [x + er * 0.95, y - er * 1.05 * h + dy]], { w: LW.fine, a: 0.75, passes: 1, taper: 0.8 });
      if (near) sk(g, [[x - er * 0.15, y - er * 0.9 * h + dy], [x + er * 0.15, y - er * 1.3 * h + dy]], { w: LW.fine, a: 0.6, passes: 1, taper: 0.8 });
    }
    if (p.eyes === 'half' || p.eyes === 'down') sk(g, [[x - er * 0.85, y - er * 0.12 + dy * 0.6], [x + er * 0.85, y - er * 0.12 + dy * 0.6]], { w: LW.in, a: 0.8, passes: 1 });
  };
  const brow = (x, y, near) => {
    const bl = 0.2 * r, tilt = (p.brows || 0) * 0.1 * r;
    sk(g, [[x - bl, y + (near ? -tilt : tilt) * 0.2], [x + bl, y + (near ? tilt : -tilt)]], { w: LW.in * (who === 'him' ? 1.35 : 1.0), a: 0.72, passes: 1, taper: 0.6 });
  };
  eye(ex, ey, eyeS, true);
  if (!small) brow(ex, ey - 0.3 * r, true);
  if (look > 0.12) {
    const x2 = lerp(0.18, -0.33, clamp((look - 0.12) / 0.88)) * r;
    eye(x2, ey, eyeS * lerp(0.8, 1, look), false);
    if (!small) brow(x2, ey - 0.3 * r, false);
  }
  if (small) return;
  if (look > 0.25) {
    const nx = lerp(0.82, 0.02, look) * r;
    sk(g, [[nx + 0.04 * r, ey + 0.16 * r], [nx + 0.09 * r, ey + 0.33 * r], [nx - 0.03 * r, ey + 0.36 * r]], { w: LW.fine, a: 0.55, passes: 1 });
  }
  const mx = lerp(0.66, 0.02, look) * r, my = 0.44 * r;
  const m = p.mouth;
  if (m === 'smile') sk(g, [[mx - 0.14 * r, my - 0.03 * r], [mx - 0.02 * r, my + 0.06 * r], [mx + 0.09 * r, my - 0.03 * r]], { w: LW.in, a: 0.8, passes: 1 });
  else if (m === 'line') sk(g, [[mx - 0.11 * r, my], [mx + 0.07 * r, my]], { w: LW.in, a: 0.72, passes: 1 });
  else if (m === 'sad') sk(g, [[mx - 0.12 * r, my + 0.04 * r], [mx - 0.02 * r, my - 0.03 * r], [mx + 0.08 * r, my + 0.04 * r]], { w: LW.in, a: 0.72, passes: 1 });
  else if (m === 'o' || m === 'open') { const o_ = new Path2D(); o_.ellipse(mx - 0.02 * r, my + 0.02 * r, 0.065 * r, (m === 'o' ? 0.085 : 0.055) * r, 0, 0, 6.283); g.save(); g.fillStyle = graphStyle(g); g.globalAlpha = 0.72; g.fill(o_); g.restore(); }
  else if (m === 'hum') sk(g, [[mx - 0.07 * r, my + 0.02 * r], [mx + 0.05 * r, my + 0.02 * r]], { w: LW.in * 1.2, a: 0.8, passes: 1 });
  if (p.blush > 0.02) {
    const bx = lerp(0.3, 0.3, look) * r, by = 0.22 * r;
    for (let i = 0; i < 4; i++) sk(g, [[bx - 0.12 * r + i * 0.065 * r, by + 0.07 * r], [bx - 0.05 * r + i * 0.065 * r, by - 0.05 * r]], { w: LW.fine, a: 0.5 * p.blush, passes: 1 });
    glow(g, bx, by, 0.28 * r, C.rose, 0.28 * p.blush, 'multiply');
  }
  if (p.tear > 0.01) {
    const ty = ey + 0.18 * r + p.tear * 0.45 * r;
    const tp = new Path2D(); tp.ellipse(ex + 0.04 * r, ty, 0.045 * r, 0.075 * r, 0, 0, 6.283);
    erase(g, tp, 1); sk(g, [[ex - 0.0 * r, ty - 0.01 * r], [ex + 0.04 * r, ty + 0.075 * r], [ex + 0.085 * r, ty - 0.01 * r]], { w: LW.fine, a: 0.5, passes: 1 });
  }
}
function ear(g, B, look) {
  if (look > 0.8) return;
  const r = B.head * 0.5, x = lerp(-0.18, -0.62, look) * r, y = 0.05 * r, s = 0.16 * r;
  part(g, [[x + s * 0.3, y - s * 1.1], [x - s * 0.7, y - s * 0.9], [x - s * 0.9, y + s * 0.1], [x - s * 0.4, y + s * 1.0], [x + s * 0.35, y + s * 0.7]], { w: LW.in, per: 5 });
  sk(g, [[x - s * 0.1, y - s * 0.4], [x - s * 0.45, y + 0.0], [x - s * 0.1, y + s * 0.4]], { w: LW.fine, a: 0.5, passes: 1 });
}

// ---------------- 头发 ----------------
function hairBob(g, B, p, o) {          // 她：齐下巴的短发、齐刘海
  const r = B.head * 0.5, look = p.look, sw = (p.hair || 0) * r * 0.14;
  const fx = lerp(0.66, 0.62, look) * r;
  const pts = [
    [fx, -0.36 * r], [0.52 * r, -0.92 * r], [-0.05 * r, -1.14 * r], [-0.72 * r, -0.95 * r], [-1.06 * r, -0.4 * r], [-1.1 * r + sw * 0.4, 0.25 * r],
    [-1.0 * r + sw, 0.72 * r], [-0.66 * r + sw, 0.9 * r], [-0.38 * r + sw * 0.6, 0.72 * r], [-0.34 * r, 0.25 * r],
    [-0.1 * r, -0.12 * r], [lerp(0.3, 0.1, look) * r, -0.3 * r], [lerp(0.5, 0.35, look) * r, -0.24 * r], [fx + 0.03 * r, -0.26 * r],
  ];
  const path = part(g, pts, { tone: o.night ? 0.8 : 0.68, ang: 74, hs: 0.7 });
  withSeed(SEED + 77, () => {
    for (let i = 0; i < 6; i++) {
      const u = i / 5;
      sk(g, [[lerp(0.35, -0.75, u) * r, lerp(-1.0, -0.9, u) * r], [lerp(0.05, -1.0, u) * r, -0.3 * r], [lerp(-0.2, -0.85, u) * r + sw * u, lerp(0.1, 0.78, u) * r]], { w: LW.fine, a: 0.5, passes: 1, taper: 0.7 });
    }
  });
  if (1 / LW.px * B.head > 40) {
    g.save(); g.clip(path);
    eraseStroke(g, spline([[0.25 * r, -0.86 * r], [-0.3 * r, -0.97 * r], [-0.82 * r, -0.62 * r]], 6), 0.1 * r, 0.5);
    g.restore();
  }
  return path;
}
function pencilBehindEar(g, B, p) {       // 她别在耳朵上方的黑铅笔
  const r = B.head * 0.5, x = lerp(-0.18, -0.55, p.look) * r, y = -0.36 * r;
  const a = R(-58), L = 1.0 * r, w = 0.07 * r;
  const d = [Math.cos(a), Math.sin(a)], n = [-d[1], d[0]];
  const p0 = [x - d[0] * L * 0.55, y - d[1] * L * 0.55], p1 = [x + d[0] * L * 0.45, y + d[1] * L * 0.45];
  const body = [[p0[0] + n[0] * w, p0[1] + n[1] * w], [p1[0] + n[0] * w, p1[1] + n[1] * w], [p1[0] - n[0] * w, p1[1] - n[1] * w], [p0[0] - n[0] * w, p0[1] - n[1] * w]];
  const bp = pathOf(body); paperFill(g, bp); shade(g, bp, 0.9, 30, { hatch: 0.5 });
  const tipP = [[p1[0] + n[0] * w, p1[1] + n[1] * w], [p1[0] + d[0] * w * 3.2, p1[1] + d[1] * w * 3.2], [p1[0] - n[0] * w, p1[1] - n[1] * w]];
  const tp = pathOf(tipP); paperFill(g, tp);
  sk(g, tipP.concat([tipP[0]]), { w: LW.fine, a: 0.75, passes: 1 });
  sk(g, body.concat([body[0]]), { w: LW.fine, a: 0.8, passes: 1 });
}
function hairMessy(g, B, p, o) {          // 他：有点乱的短发，额前一撮
  const r = B.head * 0.5, look = p.look;
  const pts = [[0.66 * r, -0.36 * r], [0.82 * r, -0.62 * r], [0.52 * r, -1.0 * r], [0.1 * r, -1.14 * r], [-0.45 * r, -1.1 * r], [-0.88 * r, -0.82 * r],
    [-1.02 * r, -0.32 * r], [-0.96 * r, 0.12 * r], [-0.78 * r, 0.3 * r], [-0.62 * r, 0.02 * r], [-0.42 * r, -0.3 * r], [0.0 * r, -0.4 * r], [lerp(0.4, 0.2, look) * r, -0.52 * r]];
  const path = part(g, pts, { tone: o.night ? 0.78 : 0.6, ang: 50, hs: 0.7 });
  withSeed(SEED + 91, () => {
    for (let i = 0; i < 5; i++) { const u = i / 4; sk(g, [[lerp(0.5, -0.8, u) * r, -0.98 * r], [lerp(0.2, -0.95, u) * r, lerp(-0.6, -0.15, u) * r]], { w: LW.fine, a: 0.5, passes: 1, taper: 0.8 }); }
    sk(g, [[0.55 * r, -0.88 * r], [0.9 * r, -0.76 * r], [0.74 * r, -0.5 * r]], { w: LW.in, a: 0.7, passes: 1 });
  });
  return path;
}
function hairLongBack(g, B, p, o) {       // 女主演：披在背后的长卷发（画在身体后面）
  const r = B.head * 0.5, sw = (p.hair || 0) * r * 0.25;
  const pts = [[-0.3 * r, -0.9 * r], [-1.0 * r, -0.5 * r], [-1.18 * r, 0.4 * r], [-1.28 * r + sw * 0.5, 1.3 * r], [-1.3 * r + sw, 2.3 * r], [-1.05 * r + sw, 3.1 * r],
    [-0.55 * r + sw, 3.25 * r], [-0.35 * r + sw * 0.5, 2.2 * r], [-0.2 * r, 1.1 * r], [0.1 * r, 0.3 * r]];
  part(g, pts, { tone: o.night ? 0.72 : 0.52, ang: 82, hs: 0.7 });
  withSeed(SEED + 55, () => {
    for (let i = 0; i < 5; i++) { const u = i / 4; const xx = lerp(-0.45, -1.15, u) * r + sw;
      sk(g, [[lerp(-0.2, -0.95, u) * r, -0.6 * r], [xx - 0.12 * r, 0.6 * r], [xx + 0.12 * r, 1.4 * r], [xx - 0.12 * r, 2.2 * r], [xx + 0.06 * r, 3.0 * r]], { w: LW.fine, a: 0.48, passes: 1, taper: 0.6 }); }
  });
}
function hairLongFront(g, B, p, o) {      // 女主演：头顶的头发和贝雷帽
  const r = B.head * 0.5, look = p.look;
  const pts = [[0.66 * r, -0.38 * r], [0.48 * r, -0.95 * r], [-0.1 * r, -1.12 * r], [-0.8 * r, -0.85 * r], [-1.05 * r, -0.2 * r], [-0.9 * r, 0.5 * r], [-0.55 * r, 0.6 * r],
    [-0.4 * r, 0.0 * r], [-0.05 * r, -0.4 * r], [lerp(0.4, 0.2, look) * r, -0.45 * r]];
  part(g, pts, { tone: o.night ? 0.72 : 0.52, ang: 70, hs: 0.7 });
  const bt = [[0.58 * r, -0.72 * r], [0.25 * r, -1.28 * r], [-0.45 * r, -1.4 * r], [-1.12 * r, -1.08 * r], [-1.0 * r, -0.78 * r], [-0.2 * r, -0.9 * r]];
  part(g, bt, { tone: o.night ? 0.7 : 0.5, ang: 30, hs: 0.7 });
  sk(g, [[-0.42 * r, -1.4 * r], [-0.38 * r, -1.55 * r]], { w: LW.in * 1.3, a: 0.8, passes: 1 });
}

// ---------------- 衣服 ----------------
function limb(g, a, b, c, w0, w1, w2, o) {
  const pts = [a, mid(a, b, 0.5), b, mid(b, c, 0.5), c];
  const ws = [w0, lerp(w0, w1, 0.5), w1, lerp(w1, w2, 0.5), w2];
  return part(g, limbOutline(pts, ws, o.capA ?? true, o.capB ?? true), o);
}
function stripes(g, path, a, b, w, n, tone = 0.72) {   // 他的条纹：沿 a→b 一条条横过去
  g.save(); g.clip(path);
  const d = [b[0] - a[0], b[1] - a[1]], L = Math.hypot(d[0], d[1]) || 1, u = [d[0] / L, d[1] / L], nn = [-u[1], u[0]];
  const hw = L / n * 0.26;
  for (let i = 0; i < n; i++) {
    const c = mid(a, b, (i + 0.5) / n);
    const s = new Path2D();
    s.moveTo(c[0] + nn[0] * w - u[0] * hw, c[1] + nn[1] * w - u[1] * hw); s.lineTo(c[0] + nn[0] * w + u[0] * hw, c[1] + nn[1] * w + u[1] * hw);
    s.lineTo(c[0] - nn[0] * w + u[0] * hw, c[1] - nn[1] * w + u[1] * hw); s.lineTo(c[0] - nn[0] * w - u[0] * hw, c[1] - nn[1] * w - u[1] * hw); s.closePath();
    shade(g, s, tone, Math.atan2(u[1], u[0]) * 180 / Math.PI + 90, { hatch: 0.5, scale: 0.7 });
  }
  g.restore();
}
// 裙子：从腰沿着两条大腿到膝盖，再从膝盖往下垂（站着时顺着小腿，坐着时往下垂）。A 字：下摆比膝盖宽
const fwdOf = d => [d[1], -d[0]];        // "向下"的方向转 90°，指向前方（脸朝的一侧）
function skirtPts(B, J, p, len, flare) {
  const up = J.up, fw = J.fw, hw = B.hipw;
  const waist = add(J.hip, up, 7);
  const tF = norm(dirDown(p.lF[0])), tB = norm(dirDown(p.lB[0]));
  const oF = fwdOf(tF), oB = fwdOf(tB);
  const drape = (k, l) => { const sh = dirDown(l[0] + l[1]); const dv = norm([lerp(sh[0], 0, 0.5), lerp(sh[1], 1, 0.5)]); return [add(k, dv, len), dv]; };
  const [hemF, dF] = drape(J.knF, p.lF), [hemB, dB] = drape(J.knB, p.lB);
  const hF = fwdOf(dF), hB = fwdOf(dB);
  return [
    add(waist, fw, -hw * 1.02), add(waist, fw, hw * 1.0),
    add(add(J.hip, tF, B.thigh * 0.45), oF, hw * 1.12),
    add(J.knF, oF, hw * 1.12 + flare * 0.3),
    add(hemF, hF, hw * 1.15 + flare),
    add(mid(hemF, hemB), mid(dF, dB), 0.8),
    add(hemB, hB, -(hw * 1.15 + flare)),
    add(J.knB, oB, -(hw * 1.1 + flare * 0.3)),
    add(add(J.hip, tB, B.thigh * 0.45), oB, -hw * 1.15),
  ];
}

// ---------------- 主函数 ----------------
// who: 'her' | 'him' | 'star'；(x, y)：站着时是脚底，ground:false 时是髋；k：每单位多少像素；face：1 朝右，-1 朝左
// o.night 夜里（整个人压暗一层）；o.light {dx, dy, a, col} 迎光一侧提亮；o.hold {hand:'F'|'B', draw(g, c, ang)} 手里拿的东西
function figure(g, who, x, y, k, pose, o = {}) {
  const B = BODY[who], p = P(pose), J = joints(B, p);
  const fc = o.face ?? 1;
  g.save();
  g.translate(x, y);
  g.scale(k * fc, k);
  if (o.rot) g.rotate(R(o.rot));
  if (o.ground ?? true) g.translate(0, -J.footBottom - (p.bob || 0));
  setLW(g, o.lw ?? 1);
  const night = !!o.night;
  const T = v => night ? Math.min(0.95, v + 0.12) : v;
  const hold = o.hold || null;
  const all = new Path2D();
  const keep = pth => { if (pth) all.addPath(pth); return pth; };
  withSeed((o.seed ?? strHash(who)) + 13, () => {
    const handAt = (wr, an, type, wa = 0) => { const c = add(wr, dirDown(an + wa), B.hand * 0.42); hand(g, c, an + wa, type, B, { tone: night ? 0.25 : 0 }); return c; };
    const sleeve = (sh, el, wr, an, front) => {
      if (who === 'her') {
        const pth = keep(limb(g, sh, el, wr, B.armw * 1.4, B.armw * 1.35, B.armw * 1.1, { tone: T(front ? 0.3 : 0.42), ang: an + 90, hs: 0.8, w: LW.out * 0.9 }));
        const d = dirDown(an), nn = [d[1], -d[0]], c0 = add(wr, d, -1.8);
        sk(g, [add(c0, nn, B.armw * 1.15), add(c0, nn, -B.armw * 1.15)], { w: LW.fine, a: 0.45, passes: 1 });
        return pth;
      } else if (who === 'him') {
        const pth = keep(limb(g, sh, el, wr, B.armw * 1.15, B.armw * 1.0, B.armw * 0.85, { tone: T(front ? 0.05 : 0.18), w: LW.out * 0.9 }));
        stripes(g, pth, sh, wr, B.armw * 1.5, 6, T(0.72));
        return pth;
      }
      return keep(limb(g, sh, el, wr, B.armw * 1.05, B.armw * 0.85, B.armw * 0.7, { tone: T(front ? 0.08 : 0.22), w: LW.out * 0.9 }));
    };
    const legDraw = (kn, an, ft, front) => {
      const tone = who === 'him' ? T(front ? 0.6 : 0.74) : T(front ? 0.04 : 0.14);
      const wTop = who === 'him' ? B.legw * 1.25 : B.legw * 1.05;
      keep(limb(g, J.hip, kn, an, wTop, B.legw * 0.85, B.legw * 0.6, { tone, ang: 75, hs: 0.8, capA: false }));
      const d = dirDown(ft), fw = [d[1], -d[0]];
      const heel = add(an, d, 0.8), toe = add(add(an, fw, B.foot * 0.85), d, 2.2);
      const shoe = [add(heel, fw, -1.6), add(an, fw, -1.2), add(add(an, fw, B.foot * 0.45), d, -0.6), add(toe, d, -1.2), add(toe, d, 0.6), add(heel, d, 1.6), add(add(heel, fw, -1.8), d, 1.4)];
      keep(part(g, shoe, { tone: who === 'her' ? T(0.08) : T(0.82), ang: 10, hs: 0.7, w: LW.out * 0.95 }));
      if (who === 'her') sk(g, [add(heel, d, -0.5), add(toe, d, -0.4)], { w: LW.fine, a: 0.45, passes: 1 });
    };
    // 1. 后面的胳膊、长头发
    if (who === 'star') { g.save(); g.translate(J.headC[0], J.headC[1]); g.rotate(R(J.headRot)); hairLongBack(g, B, p, { night }); g.restore(); }
    sleeve(J.sh, J.elB, J.wrB, J.angB, false);
    const cB = handAt(J.wrB, J.angB, p.hB, p.wB || 0);
    if (hold && hold.hand === 'B') hold.draw(g, cB, J.angB);
    // 2. 两条腿
    legDraw(J.knB, J.anB, J.ftB, false);
    legDraw(J.knF, J.anF, J.ftF, true);
    // 3. 裙子
    if (who === 'her' || who === 'star') {
      const sp = skirtPts(B, J, p, who === 'her' ? 11 : 6, who === 'her' ? 2.5 : 4);
      keep(part(g, sp, { tone: who === 'her' ? T(0.6) : T(0.42), ang: 85, hs: 0.8, per: 5 }));
      for (let i = -2; i <= 2; i++) sk(g, [add(add(J.hip, J.up, 4), J.fw, i * 1.8), mid(sp[4], sp[6], 0.5 - i * 0.2)], { w: LW.fine, a: 0.35, passes: 1 });
    }
    // 4. 躯干（她：盖过屁股的宽松开衫）
    const up = J.up, fw = J.fw;
    const along = s => add(J.hip, up, B.torso * s);
    let tp;
    if (who === 'her') {
      const th = norm(dirDown((p.lF[0] + p.lB[0]) / 2));
      const hemB = add(add(J.hip, th, 3.5), fw, -B.hipw * 1.18), hemF = add(add(J.hip, th, 4), fw, B.hipw * 1.1);
      tp = [hemB, add(along(0.4), fw, -B.waist * 1.3), add(along(0.8), fw, -B.chest * 1.1), add(along(0.97), fw, -B.chest * 0.6),
        add(along(1.0), fw, B.chest * 0.45), add(along(0.85), fw, B.chest * 1.15), add(along(0.45), fw, B.waist * 1.3), hemF];
    } else if (who === 'him') {
      tp = [add(along(-0.06), fw, -B.hipw * 1.0), add(along(0.4), fw, -B.waist), add(along(0.8), fw, -B.chest * 0.95), add(along(0.97), fw, -B.chest * 0.6),
        add(along(1.0), fw, B.chest * 0.45), add(along(0.84), fw, B.chest), add(along(0.45), fw, B.waist * 1.02), add(along(-0.06), fw, B.hipw * 1.0)];
    } else {
      tp = [add(along(0.12), fw, -B.hipw * 0.9), add(along(0.42), fw, -B.waist), add(along(0.8), fw, -B.chest * 0.95), add(along(0.97), fw, -B.chest * 0.6),
        add(along(1.0), fw, B.chest * 0.45), add(along(0.8), fw, B.chest * 1.05), add(along(0.42), fw, B.waist * 1.0), add(along(0.12), fw, B.hipw * 0.95)];
    }
    const torsoPath = keep(part(g, tp, { tone: who === 'him' ? T(0.04) : who === 'her' ? T(0.32) : T(0.42), ang: 80, hs: 0.8 }));
    if (who === 'him') {
      stripes(g, torsoPath, add(J.neck, up, -3), add(J.hip, up, 0), B.chest * 1.7, 8, T(0.72));
      sk(g, [add(add(J.neck, up, -2), fw, B.chest * 0.5), add(add(J.hip, up, 2), fw, B.waist * 0.3)], { w: LW.out * 1.15, a: 0.85 });
      sk(g, [add(add(J.neck, up, -1.5), fw, -B.chest * 0.62), add(add(J.hip, up, 2), fw, -B.waist * 0.55)], { w: LW.out, a: 0.65 });
      sk(g, [add(add(J.hip, up, 1.2), fw, -B.hipw), add(add(J.hip, up, 1.2), fw, B.hipw)], { w: LW.in, a: 0.7, passes: 1 });
    } else if (who === 'her') {
      sk(g, [add(add(J.neck, up, -1), fw, B.chest * 0.7), add(add(J.hip, up, -4), fw, B.waist * 0.95)], { w: LW.in, a: 0.7, passes: 1 });
      g.save(); g.clip(torsoPath);
      for (let i = -3; i <= 3; i++) sk(g, [add(add(J.neck, up, -1), fw, i * 2.0), add(add(J.hip, up, -5), fw, i * 2.5)], { w: LW.fine, a: 0.26, passes: 1 });
      g.restore();
      const cl = [add(add(J.neck, up, 0.6), fw, 1.8), add(add(J.neck, up, -2.2), fw, 3.7), add(add(J.neck, up, -1.6), fw, 0.4), add(add(J.neck, up, -2.2), fw, -2.2), add(add(J.neck, up, 0.4), fw, -1.6)];
      keep(part(g, cl, { w: LW.in, per: 3 }));
    } else {
      sk(g, [add(along(0.42), fw, -B.waist), add(along(0.42), fw, B.waist)], { w: LW.in, a: 0.6, passes: 1 });
    }
    // 5. 脖子、头
    keep(part(g, [add(J.neck, up, -1.2), add(J.neck, fw, 1.9), add(J.headC, dirDown(J.headRot), B.head * 0.3), add(add(J.headC, dirDown(J.headRot), B.head * 0.3), fw, -2.6), add(J.neck, fw, -1.9)], { w: LW.in, per: 3 }));
    g.save();
    g.translate(J.headC[0], J.headC[1]);
    g.rotate(R(J.headRot));
    keep(part(g, headPts(B, p.look, who), { w: LW.out, per: 4, tone: night ? 0.16 : 0 }));
    if (who === 'him') ear(g, B, p.look);
    face(g, B, p, who);
    if (who === 'her') { hairBob(g, B, p, { night }); if (!o.noPencil) pencilBehindEar(g, B, p); }
    else if (who === 'him') hairMessy(g, B, p, { night });
    else hairLongFront(g, B, p, { night });
    g.restore();
    // 腿上放的东西（速写本……），在前面的胳膊之下
    if (o.lap) o.lap(g, J, B);
    // 6. 前面的胳膊
    sleeve(J.sh, J.elF, J.wrF, J.angF, true);
    const cF = handAt(J.wrF, J.angF, p.hF, p.wF || 0);
    if (hold && hold.hand !== 'B') hold.draw(g, cF, J.angF);
    // 7. 夜里压暗、迎光一侧提亮
    if (night || o.dim) {
      g.save(); g.clip(all); g.globalAlpha = o.dim ?? 0.38;
      const pt = g.createPattern(smudgeTile, 'repeat'); const ss = 1.4 / scaleOf(g); pt.setTransform(new DOMMatrix().scaleSelf(ss, ss));
      g.fillStyle = pt; g.fillRect(-90, -160, 180, 260); g.restore();
    }
    if (o.light) {
      const L = o.light, ldx = (L.dx ?? 1) * fc, ldy = L.dy ?? 0;
      g.save(); g.clip(all);
      const cy = -B.torso * 0.6;
      const gr = g.createLinearGradient(-25 * ldx, cy - 25 * ldy, 25 * ldx, cy + 25 * ldy);
      gr.addColorStop(0, rgba(L.col || C.amberHot, 0)); gr.addColorStop(0.55, rgba(L.col || C.amberHot, (L.a ?? 0.4) * 0.35)); gr.addColorStop(1, rgba(L.col || C.amberHot, L.a ?? 0.4));
      g.globalCompositeOperation = 'screen'; g.fillStyle = gr; g.fillRect(-90, -160, 180, 260);
      g.restore();
    }
  });
  o.__all = all; o.__J = J; o.__m = g.getTransform();
  g.restore();
  return J;
}

// ---------------- 正面的半身像 ----------------
// (x, y) 头的中心，s 头高（像素）。o.arms：'down' 垂着 | 'glass' 两手贴在玻璃上 | 'shh' 食指放在嘴唇上 | 'chest' 手按在胸口 | 'mouth' 捂嘴 | 'cup' 双手捧杯子
// o.eyes：'open'|'closed'|'down'|'wide'|'smile'；o.gaze [-1..1, -1..1] 眼珠方向；o.mouth；o.blush；o.tear；o.tilt；o.night；o.light
function bustFront(g, who, x, y, s, o = {}) {
  const r = s / 2;
  g.save(); g.translate(x, y); g.rotate(R(o.tilt ?? 0));
  const Q = (a, b) => [a * r, b * r];
  const T = v => o.night ? Math.min(0.95, v + 0.12) : v;
  const lw = Math.max(1.6, s / 130);
  const all = new Path2D();
  withSeed(o.seed ?? (strHash(who) + 500), () => {
    // 肩膀和身体
    const bodyTone = who === 'him' ? T(0.05) : who === 'her' ? T(0.36) : T(0.42);
    const body = [Q(-0.42, 0.95), Q(-1.05, 1.35), Q(-1.45, 1.9), Q(-1.6, 3.2), Q(1.6, 3.2), Q(1.45, 1.9), Q(1.05, 1.35), Q(0.42, 0.95)];
    const bp = pathOf(spline(body, 6, true)); paperFill(g, bp); shade(g, bp, bodyTone, 80, { scale: 0.9 }); all.addPath(bp);
    if (who === 'him') {
      g.save(); g.clip(bp); for (let i = 0; i < 7; i++) { const yy = 1.3 + i * 0.3; const st = new Path2D(); st.rect(-2 * r, yy * r, 4 * r, 0.12 * r); shade(g, st, T(0.72), 0, { hatch: 0.5, scale: 0.8 }); } g.restore();
      sk(g, [Q(-0.7, 1.22), Q(-0.55, 3.2)], { w: lw * 1.6, a: 0.85 }); sk(g, [Q(0.7, 1.22), Q(0.55, 3.2)], { w: lw * 1.6, a: 0.85 });
    } else if (who === 'her') {
      g.save(); g.clip(bp); for (let i = -7; i <= 7; i++) sk(g, [Q(i * 0.2, 1.2), Q(i * 0.23, 3.2)], { w: lw * 0.55, a: 0.22, passes: 1 }); g.restore();
      sk(g, [Q(-0.3, 1.05), Q(-0.42, 3.2)], { w: lw, a: 0.7 }); sk(g, [Q(0.3, 1.05), Q(0.42, 3.2)], { w: lw, a: 0.7 });
      part(g, [Q(-0.42, 0.98), Q(-0.05, 1.32), Q(0, 1.12), Q(0.05, 1.32), Q(0.42, 0.98), Q(0.2, 0.86), Q(-0.2, 0.86)], { w: lw, per: 2 });
    }
    sk(g, spline(body.slice(0, 4), 6), { w: lw * 1.3, a: 0.88 }); sk(g, spline(body.slice(4), 6), { w: lw * 1.3, a: 0.88 });
    // 脖子
    const nk = [Q(-0.24, 0.6), Q(-0.27, 1.05), Q(0.27, 1.05), Q(0.24, 0.6)];
    const np = pathOf(nk); paperFill(g, np); shade(g, np, 0.22, 60); sk(g, [Q(-0.24, 0.62), Q(-0.27, 1.02)], { w: lw, a: 0.75 }); sk(g, [Q(0.24, 0.62), Q(0.27, 1.02)], { w: lw, a: 0.75 });
    if (o.hairBack !== false && who === 'star') { const hb = [Q(-0.95, -0.4), Q(-1.15, 0.8), Q(-1.1, 1.9), Q(-0.6, 1.8), Q(0.6, 1.8), Q(1.1, 1.9), Q(1.15, 0.8), Q(0.95, -0.4)]; const hbp = pathOf(spline(hb, 6, true)); paperFill(g, hbp); shade(g, hbp, T(0.5), 82, { scale: 0.8 }); sk(g, spline(hb, 6, true), { w: lw * 1.2, a: 0.85 }); }
    // 脸
    const fp = [Q(0, -1.0), Q(0.62, -0.84), Q(0.84, -0.35), Q(0.83, 0.08), Q(0.7, 0.45), Q(0.42, 0.75), Q(0, 0.86), Q(-0.42, 0.75), Q(-0.7, 0.45), Q(-0.83, 0.08), Q(-0.84, -0.35), Q(-0.62, -0.84)];
    const facePath = pathOf(spline(fp, 6, true)); paperFill(g, facePath); all.addPath(facePath);
    g.save(); g.clip(facePath); smudgeBlob(g, 0, 0.75 * r, 0.6 * r, 0.12, 0.5); g.restore();
    sk(g, spline(fp, 6, true), { w: lw * 1.3, a: 0.88 });
    // 耳朵
    for (const sd of [-1, 1]) { const ep = [Q(sd * 0.8, -0.12), Q(sd * 0.98, -0.08), Q(sd * 0.98, 0.18), Q(sd * 0.82, 0.28)]; if (who !== 'her' && who !== 'star') part(g, ep, { w: lw, per: 4 }); }
    // 眼睛
    const ey = -0.04 * r, ex = 0.33 * r, er = (who === 'him' ? 0.1 : 0.125) * r;
    const gx = (o.gaze ? o.gaze[0] : 0) * er * 0.35, gy = (o.gaze ? o.gaze[1] : 0) * er * 0.3;
    for (const sd of [-1, 1]) {
      const cx = sd * ex;
      const e = o.eyes ?? 'open';
      if (e === 'closed' || e === 'smile') { const up = e === 'smile' ? -1 : 1; sk(g, spline([[cx - er, ey], [cx, ey + up * er * 0.5], [cx + er, ey]], 5), { w: lw * 1.2, a: 0.88 }); continue; }
      const h = e === 'wide' ? 1.2 : e === 'down' ? 0.55 : 1;
      const ell = new Path2D(); ell.ellipse(cx + gx, ey + gy + (e === 'down' ? er * 0.25 : 0), er * 0.62, er * 0.9 * h, 0, 0, 6.283);
      g.save(); g.fillStyle = graphStyle(g); g.globalAlpha = 0.95; g.fill(ell); g.restore();
      if (e !== 'down') erase(g, circlePath(cx + gx + er * 0.2, ey + gy - er * 0.3, er * 0.2), 0.95);
      if (who !== 'him') { sk(g, [[cx + sd * er * 0.55, ey - er * 0.7 * h], [cx + sd * er * 1.0, ey - er * 1.0 * h]], { w: lw * 0.7, a: 0.7, passes: 1 }); }
      if (e === 'down') sk(g, [[cx - er * 0.9, ey], [cx + er * 0.9, ey]], { w: lw, a: 0.8, passes: 1 });
      // 眉毛
      const bt = (o.brows ?? 0) * 0.08 * r;
      sk(g, [[cx - sd * er * 0.9, ey - er * 2.1 + (sd < 0 ? -bt : -bt)], [cx + sd * er * 1.0, ey - er * 2.2 + bt]], { w: lw * (who === 'him' ? 1.3 : 0.9), a: 0.72, passes: 1 });
    }
    sk(g, [[0.02 * r, 0.18 * r], [0.06 * r, 0.3 * r], [-0.03 * r, 0.32 * r]], { w: lw * 0.7, a: 0.55, passes: 1 });
    const m = o.mouth ?? 'line', my = 0.5 * r;
    if (m === 'smile') sk(g, spline([[-0.14 * r, my - 0.02 * r], [0, my + 0.06 * r], [0.14 * r, my - 0.02 * r]], 5), { w: lw, a: 0.8 });
    else if (m === 'o' || m === 'open') { const mo = new Path2D(); mo.ellipse(0, my + 0.02 * r, 0.07 * r, (m === 'o' ? 0.08 : 0.05) * r, 0, 0, 6.283); g.save(); g.fillStyle = graphStyle(g); g.globalAlpha = 0.7; g.fill(mo); g.restore(); }
    else if (m === 'sad') sk(g, spline([[-0.12 * r, my + 0.04 * r], [0, my - 0.02 * r], [0.12 * r, my + 0.04 * r]], 5), { w: lw, a: 0.75 });
    else sk(g, [[-0.09 * r, my], [0.09 * r, my]], { w: lw, a: 0.75 });
    if (o.blush) for (const sd of [-1, 1]) { for (let i = 0; i < 4; i++) sk(g, [[sd * 0.42 * r + (i - 1.5) * 0.06 * r, 0.3 * r], [sd * 0.42 * r + (i - 1.5) * 0.06 * r + 0.05 * r, 0.18 * r]], { w: lw * 0.6, a: 0.45 * o.blush, passes: 1 }); glow(g, sd * 0.45 * r, 0.24 * r, 0.22 * r, C.rose, 0.28 * o.blush, 'multiply'); }
    if (o.tear) { const ty = ey + 0.2 * r + o.tear * 0.4 * r; const tp = new Path2D(); tp.ellipse(ex * 0.9, ty, 0.03 * r, 0.05 * r, 0, 0, 6.283); erase(g, tp, 1); sk(g, spline([[ex * 0.9 - 0.03 * r, ty], [ex * 0.9, ty + 0.05 * r], [ex * 0.9 + 0.03 * r, ty]], 4), { w: lw * 0.6, a: 0.6 }); }
    // 头发
    let hp;
    if (who === 'her') hp = [Q(0, -1.15), Q(0.72, -0.98), Q(1.02, -0.45), Q(1.04, 0.3), Q(0.95, 0.78), Q(0.68, 0.82), Q(0.74, 0.25), Q(0.74, -0.2), Q(0.5, -0.28), Q(0.15, -0.3), Q(-0.15, -0.3), Q(-0.5, -0.28), Q(-0.74, -0.2), Q(-0.74, 0.25), Q(-0.68, 0.82), Q(-0.95, 0.78), Q(-1.04, 0.3), Q(-1.02, -0.45), Q(-0.72, -0.98)];
    else if (who === 'him') hp = [Q(0, -1.18), Q(0.7, -1.0), Q(0.95, -0.55), Q(0.88, -0.2), Q(0.72, -0.4), Q(0.4, -0.55), Q(0.2, -0.42), Q(-0.1, -0.55), Q(-0.45, -0.48), Q(-0.75, -0.35), Q(-0.88, -0.15), Q(-0.95, -0.55), Q(-0.7, -1.0)];
    else hp = [Q(0, -1.15), Q(0.75, -0.95), Q(0.98, -0.3), Q(0.82, -0.25), Q(0.45, -0.55), Q(0.0, -0.62), Q(-0.45, -0.55), Q(-0.82, -0.25), Q(-0.98, -0.3), Q(-0.75, -0.95)];
    const hpath = pathOf(spline(hp, 6, true)); paperFill(g, hpath); shade(g, hpath, T(who === 'him' ? 0.62 : who === 'her' ? 0.7 : 0.5), 75, { scale: 0.85 }); all.addPath(hpath);
    g.save(); g.clip(hpath); for (let i = 0; i < 14; i++) { const u = i / 13 - 0.5; sk(g, spline([Q(u * 0.6, -1.1), Q(u * 1.6, -0.6), Q(u * 1.9, 0.2)], 5), { w: lw * 0.55, a: 0.4, passes: 1 }); } g.restore();
    sk(g, spline(hp, 6, true), { w: lw * 1.3, a: 0.88 });
    if (who === 'her' && o.pencil !== false) blackPencil(g, 0.95 * r, -0.62 * r, 0.75 * r, -28, { w: 0.035 * r, seed: 9150 });
    if (who === 'star') { const bt = [Q(-0.95, -0.75), Q(-0.5, -1.35), Q(0.4, -1.42), Q(1.0, -1.05), Q(0.8, -0.78), Q(0, -0.92)]; const btp = pathOf(spline(bt, 6, true)); paperFill(g, btp); shade(g, btp, T(0.5), 30, { scale: 0.85 }); sk(g, spline(bt, 6, true), { w: lw * 1.3, a: 0.88 }); }
    // 手
    const hand = (cx, cy, sz, ang, kind) => {
      g.save(); g.translate(cx, cy); g.rotate(R(ang));
      const pw = sz * 0.5, ph = sz * 0.55;
      const palm = [[-pw, ph * 0.5], [-pw * 1.05, -ph * 0.35], [-pw * 0.6, -ph * 0.6], [pw * 0.6, -ph * 0.6], [pw * 1.0, -ph * 0.3], [pw * 0.9, ph * 0.55], [0, ph * 0.75]];
      const fingers = [];
      if (kind === 'open' || kind === 'glass') for (let i = 0; i < 4; i++) { const fx = lerp(-pw * 0.72, pw * 0.72, i / 3), fl = sz * (i === 0 || i === 3 ? 0.42 : 0.52); fingers.push([fx, -ph * 0.55, fl]); }
      if (kind === 'point') fingers.push([-pw * 0.3, -ph * 0.55, sz * 0.62]);
      for (const [fx, fy, fl] of fingers) { const fp_ = [[fx - sz * 0.085, fy + 2], [fx - sz * 0.08, fy - fl], [fx, fy - fl - sz * 0.07], [fx + sz * 0.08, fy - fl], [fx + sz * 0.085, fy + 2]]; part(g, fp_, { w: lw, per: 4 }); }
      const pp_ = part(g, palm, { w: lw * 1.1, per: 4 });
      const th = [[pw * 0.7, ph * 0.1], [pw * 1.35, -ph * 0.25], [pw * 1.45, -ph * 0.05], [pw * 0.9, ph * 0.45]]; part(g, th, { w: lw, per: 4 });
      if (kind === 'glass') { g.save(); g.clip(pp_); smudgeBlob(g, 0, 0, sz * 0.5, 0.1); g.restore(); }
      g.restore();
    };
    const arms = o.arms ?? 'down';
    if (arms === 'glass') { hand(-0.95 * r, -0.1 * r, 0.7 * r, -8, 'glass'); hand(0.95 * r, -0.1 * r, 0.7 * r, 8, 'glass'); sk(g, [Q(-1.45, 2.1), Q(-1.3, 0.9), Q(-1.05, 0.25)], { w: lw * 1.2, a: 0.8 }); sk(g, [Q(1.45, 2.1), Q(1.3, 0.9), Q(1.05, 0.25)], { w: lw * 1.2, a: 0.8 }); }
    else if (arms === 'shh') { sk(g, [Q(0.9, 2.6), Q(0.55, 1.45), Q(0.2, 0.9)], { w: lw * 1.2, a: 0.8 }); hand(0.08 * r, 0.62 * r, 0.6 * r, -12, 'point'); }
    else if (arms === 'chest') { hand(0.15 * r, 1.75 * r, 0.75 * r, -60, 'open'); hand(-0.25 * r, 1.85 * r, 0.75 * r, 50, 'open'); }
    else if (arms === 'mouth') { hand(0.05 * r, 0.6 * r, 0.75 * r, -10, 'open'); }
    else if (arms === 'cup') { if (o.cupDraw) o.cupDraw(g, 0, 1.75 * r, r); hand(-0.42 * r, 1.85 * r, 0.62 * r, 70, 'open'); hand(0.42 * r, 1.85 * r, 0.62 * r, -70, 'open'); }
  });
  if (o.night) { g.save(); g.clip(all); g.globalAlpha = 0.25; const pt = g.createPattern(smudgeTile, 'repeat'); g.fillStyle = pt; g.fillRect(-3 * r, -3 * r, 6 * r, 7 * r); g.restore(); }
  if (o.light) glow(g, (o.light.dx ?? 0) * r, (o.light.dy ?? -0.5) * r, 2.2 * r, o.light.col || C.amber, o.light.a ?? 0.3);
  g.restore();
}
