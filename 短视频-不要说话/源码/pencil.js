// pencil.js — 铅笔画引擎：纸、石墨线、排线、擦亮、灯光。
// 所有随机都用固定种子；线条按 BOIL（每 4 帧换一次、三套循环）轻轻抖动，像手绘动画的"线在呼吸"。
// frame(T) 只依赖 T，所以可以并行渲染、单帧预览。
const W = 1920, H = 1080;

// ---------------- 随机、噪声、缓动 ----------------
function rng(seed) {
  let s = seed | 0;
  return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; };
}
function hash(a, b = 0, c = 0) {
  let h = Math.imul((a | 0) ^ 0x9E3779B1, 0x85EBCA77) ^ Math.imul((b | 0) + 0x632BE5AB, 0xC2B2AE3D) ^ Math.imul((c | 0) + 0x27D4EB2F, 0x165667B1);
  h ^= h >>> 15; h = Math.imul(h, 0x2C1B3C6D); h ^= h >>> 12; h = Math.imul(h, 0x297A2D39); h ^= h >>> 15;
  return (h >>> 0) / 4294967296;
}
function n1(x, seed = 0) {           // 一维值噪声，0..1，平滑
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return hash(i, seed) * (1 - u) + hash(i + 1, seed) * u;
}
function n2(x, y, seed = 0) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
  const ux = fx * fx * (3 - 2 * fx), uy = fy * fy * (3 - 2 * fy);
  const a = hash(i, j, seed), b = hash(i + 1, j, seed), c = hash(i, j + 1, seed), d = hash(i + 1, j + 1, seed);
  return (a * (1 - ux) + b * ux) * (1 - uy) + (c * (1 - ux) + d * ux) * uy;
}
function fbm(x, y, seed = 0, oct = 4) { let s = 0, a = 0.5, f = 1; for (let k = 0; k < oct; k++) { s += a * n2(x * f, y * f, seed + k * 17); f *= 2; a *= 0.5; } return s / (1 - Math.pow(0.5, oct)); }
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, t) => a + (b - a) * t;
const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const ease = t => { t = clamp(t); return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; };
const easeOut = t => 1 - Math.pow(1 - clamp(t), 3);
const easeIn = t => Math.pow(clamp(t), 3);
const easeOut2 = t => 1 - Math.pow(1 - clamp(t), 2);
const backOut = t => { t = clamp(t); const c = 1.70158; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const win = (x, a, b, f = 0.3) => smooth(a, a + f, x) * (1 - smooth(b - f, b, x));   // a..b 之间为 1，两头渐变
function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.ceil(w); c.height = Math.ceil(h); return c; }

// ---------------- 线条抖动（boil） ----------------
let BOIL = 0;                       // 0,1,2 三套
// 面（排线）默认不抖：整屏的排线每 4 帧换一套，画面像在闪，码率也翻倍；只让线条"呼吸"
const FILL_BOIL = false;
function setBoil(frameNo) { BOIL = Math.floor(frameNo / 4) % 3; }

// ---------------- 颜色 ----------------
const PAPER = '#EEE8DC';
const GRAPH = [44, 43, 48];         // 石墨
const C = {
  amber: [255, 186, 92], amberHot: [255, 222, 160], moon: [196, 214, 240], moonHot: [236, 243, 255],
  dawn: [255, 196, 150], night: [70, 82, 110], coffee: [150, 96, 58], rose: [235, 150, 140],
};
const rgba = (c, a) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;

// ---------------- 纹理（开头生成一次） ----------------
let paperCanvas, paperPat, graphPats = [], hatchTiles = {}, grainCanvas, smudgeTile;
function makeTextures() {
  // 纸：暖白底、低频的深浅、纤维、细颗粒（纸的"牙"）
  paperCanvas = mk(W, H);
  const pg = paperCanvas.getContext('2d');
  pg.fillStyle = PAPER; pg.fillRect(0, 0, W, H);
  const id = pg.getImageData(0, 0, W, H), d = id.data, r = rng(11);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const i = (y * W + x) * 4;
    const low = (n2(x / 180, y / 180, 3) - 0.5) * 7 + (n2(x / 40, y / 40, 4) - 0.5) * 3;
    const tooth = (r() - 0.5) * 7;
    const v = low + tooth;
    d[i] += v; d[i + 1] += v * 0.98; d[i + 2] += v * 0.92;
  }
  pg.putImageData(id, 0, 0);
  pg.globalAlpha = 0.045; pg.strokeStyle = '#7d7262'; pg.lineWidth = 0.7;
  for (let k = 0; k < 2600; k++) {
    const a = r() * W, b = r() * H, l = 8 + r() * 34, an = r() * 6.283;
    pg.beginPath(); pg.moveTo(a, b);
    pg.quadraticCurveTo(a + Math.cos(an) * l * 0.5 + (r() - 0.5) * 8, b + Math.sin(an) * l * 0.5 + (r() - 0.5) * 8, a + Math.cos(an) * l, b + Math.sin(an) * l);
    pg.stroke();
  }
  pg.globalAlpha = 1;
  // 石墨：深灰，颗粒顺着笔触方向（横向拉长），偶尔漏白
  for (let p = 0; p < 3; p++) {
    const c = mk(256, 256), x = c.getContext('2d'), im = x.createImageData(256, 256), rr = rng(100 + p);
    for (let yy = 0; yy < 256; yy++) {
      const row = 0.85 + 0.15 * n1(yy * 0.9, 7 + p);
      for (let xx = 0; xx < 256; xx++) {
        const i = (yy * 256 + xx) * 4;
        let a = row * (0.78 + 0.22 * n2(xx / 3.0, yy / 1.2, 20 + p));
        if (rr() < 0.07) a *= 0.35;
        im.data[i] = GRAPH[0]; im.data[i + 1] = GRAPH[1]; im.data[i + 2] = GRAPH[2]; im.data[i + 3] = 255 * a;
      }
    }
    x.putImageData(im, 0, 0);
    graphPats.push(c);
  }
  // 纸纹颗粒：叠在整幅画上（multiply），让石墨也有纸的牙
  grainCanvas = mk(512, 512);
  { const x = grainCanvas.getContext('2d'), im = x.createImageData(512, 512), rr = rng(5);
    for (let i = 0; i < 512 * 512; i++) { const v = 255 - rr() * rr() * 34; im.data[i * 4] = v; im.data[i * 4 + 1] = v; im.data[i * 4 + 2] = v; im.data[i * 4 + 3] = 255; }
    x.putImageData(im, 0, 0); }
  // 擦抹（smudge）：顺着一个方向揉开的软灰，有一道道浅浅的纹
  smudgeTile = mk(512, 512);
  { const x = smudgeTile.getContext('2d'), im = x.createImageData(512, 512);
    for (let yy = 0; yy < 512; yy++) for (let xx = 0; xx < 512; xx++) {
      const i = (yy * 512 + xx) * 4;
      // 周期为 512 的噪声，平铺没有接缝
      const X = xx / 512, Y = yy / 512;
      const streak = 0.5 + 0.5 * Math.sin((Y * 6.283 * 23) + Math.sin(X * 6.283 * 2) * 1.5 + Math.sin(X * 6.283 * 5 + Y * 12) * 0.4);
      const cloud = 0.5 + 0.25 * Math.sin(X * 6.283 * 3 + Y * 6.283 * 2) + 0.25 * Math.sin(X * 6.283 * 7 - Y * 6.283 * 4 + 1.3);
      const a = 0.72 + 0.16 * streak + 0.12 * cloud;
      im.data[i] = GRAPH[0] + 6; im.data[i + 1] = GRAPH[1] + 6; im.data[i + 2] = GRAPH[2] + 9; im.data[i + 3] = 255 * Math.min(1, a);
    }
    x.putImageData(im, 0, 0); }
  // 排线贴图：每种疏密三套（boil），线是一段段短笔触，两头收尖，可以无缝平铺
  const DENS = [17, 12, 8.5, 6];
  for (let L = 0; L < DENS.length; L++) for (let p = 0; p < 3; p++) {
    const S = 384, c = mk(S, S), x = c.getContext('2d'), rr = rng(1000 + L * 10 + p);
    x.fillStyle = x.createPattern(graphPats[p], 'repeat');
    const sp = DENS[L];
    for (let y0 = 0; y0 < S; y0 += sp) {
      let xx = -rr() * 60;
      while (xx < S) {
        const len = 60 + rr() * 110, ang = (rr() - 0.5) * 0.05, yy = y0 + (rr() - 0.5) * sp * 0.3;
        const w = 1.0 + rr() * 0.8, a = 0.45 + rr() * 0.4;
        for (const ox of [-S, 0, S]) for (const oy of [-S, 0, S]) {
          const X = xx + ox, Y = yy + oy;
          if (X > S + 5 || X + len < -5 || Y < -6 || Y > S + 6) continue;
          x.globalAlpha = a;
          dash(x, X, Y, len, ang, w);
        }
        xx += len + 2 + rr() * 9;
      }
    }
    hatchTiles[L + '_' + p] = c;
  }
}
function dash(x, X, Y, len, ang, w) {      // 一笔排线：中间粗、两头尖、略弯
  const cx = Math.cos(ang), sy = Math.sin(ang), nx = -sy, ny = cx, b = len * 0.012;
  x.beginPath();
  const N = 6;
  for (let k = 0; k <= N; k++) { const s = k / N, hw = w * Math.sin(Math.PI * Math.min(1, 0.15 + s * 0.85)) * 0.5 + 0.1, bend = Math.sin(s * Math.PI) * b; x.lineTo(X + cx * len * s + nx * (hw + bend), Y + sy * len * s + ny * (hw + bend)); }
  for (let k = N; k >= 0; k--) { const s = k / N, hw = w * Math.sin(Math.PI * Math.min(1, 0.15 + s * 0.85)) * 0.5 + 0.1, bend = Math.sin(s * Math.PI) * b; x.lineTo(X + cx * len * s - nx * (hw - bend), Y + sy * len * s - ny * (hw - bend)); }
  x.closePath(); x.fill();
}

// ---------------- 填充样式 ----------------
function graphStyle(g) { const p = g.createPattern(graphPats[BOIL], 'repeat'); const s = 1 / scaleOf(g); if (Math.abs(s - 1) > 0.05) p.setTransform(new DOMMatrix().scaleSelf(s, s)); return p; }
function paperStyle(g) {            // 纸（按屏幕对齐）：拿来遮住后面的线
  const p = g.createPattern(paperCanvas, 'no-repeat');
  p.setTransform(g.getTransform().inverse());
  return p;
}
function hatchStyle(g, L, angDeg, scale = 1, phase = BOIL) {
  const p = g.createPattern(hatchTiles[clamp(L, 0, 3) + '_' + phase], 'repeat');
  p.setTransform(new DOMMatrix().rotateSelf(angDeg).scaleSelf(scale, scale));
  return p;
}

// ---------------- 种子 ----------------
// 每个物体自己的种子：withSeed(id, () => {...}) 里画的每一笔按顺序编号，同一个 BOIL 里每一帧都一样
let SEED = 1, SK = 0;
function withSeed(id, fn) { const s0 = SEED, k0 = SK; SEED = typeof id === 'number' ? id : strHash(id); SK = 0; try { return fn(); } finally { SEED = s0; SK = k0; } }
function strHash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
function nextSeed() { return (SEED * 31 + (SK++) * 7919) | 0; }

// ---------------- 线 ----------------
// 把折线按弧长重采样
function resample(pts, step) {
  const out = [pts[0]];
  let acc = 0;
  for (let i = 1; i < pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i];
    const L = Math.hypot(x1 - x0, y1 - y0);
    if (L < 1e-6) continue;
    let s = step - acc;
    while (s <= L) { out.push([x0 + (x1 - x0) * s / L, y0 + (y1 - y0) * s / L]); s += step; }
    acc = L - (s - step);
  }
  const last = pts[pts.length - 1], ol = out[out.length - 1];
  if (Math.hypot(last[0] - ol[0], last[1] - ol[1]) > step * 0.25) out.push(last);
  return out;
}
// Catmull-Rom：过控制点的平滑曲线
function spline(ctrl, per = 8, closed = false) {
  const n = ctrl.length, out = [];
  if (n < 3) return ctrl.slice();
  const P = i => closed ? ctrl[(i + n) % n] : ctrl[clamp(i, 0, n - 1)];
  const segs = closed ? n : n - 1;
  for (let i = 0; i < segs; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    for (let k = 0; k < per; k++) {
      const t = k / per, t2 = t * t, t3 = t2 * t;
      out.push([0.5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * t + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * t2 + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * t3),
        0.5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * t + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * t2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * t3)]);
    }
  }
  out.push(closed ? ctrl[0] : ctrl[n - 1]);
  return out;
}
function scaleOf(g) { const m = g.getTransform(); return Math.sqrt(Math.abs(m.a * m.d - m.b * m.c)) || 1; }

// 一笔铅笔线。o: w 粗细, a 深浅, j 抖动幅度, taper 两头收尖, over 出头, passes 叠几遍, draw 画到哪（0~1，画线动画）
function sk(g, pts, o = {}) {
  if (!pts || pts.length < 2) return;
  const sc = scaleOf(g);
  const w = (o.w ?? 2.2), a = (o.a ?? 0.85), j = (o.j ?? 1.4) / Math.max(0.35, Math.min(2.5, sc)) * Math.min(1.6, Math.max(0.6, sc));
  const seed = o.seed ?? nextSeed();
  const passes = o.passes ?? 2, taper = o.taper ?? 0.5, over = o.over ?? 0;
  const draw = o.draw ?? 1;
  if (draw <= 0) return;
  let p = pts;
  if (over > 0 && !o.closed) {
    const [a0, a1] = [p[0], p[1]], [b0, b1] = [p[p.length - 1], p[p.length - 2]];
    const la = Math.hypot(a0[0] - a1[0], a0[1] - a1[1]) || 1, lb = Math.hypot(b0[0] - b1[0], b0[1] - b1[1]) || 1;
    p = [[a0[0] + (a0[0] - a1[0]) / la * over * hash(seed, 1), a0[1] + (a0[1] - a1[1]) / la * over * hash(seed, 1)], ...p,
      [b0[0] + (b0[0] - b1[0]) / lb * over * hash(seed, 2), b0[1] + (b0[1] - b1[1]) / lb * over * hash(seed, 2)]];
  }
  const step = Math.max(2.2, 7 / sc);
  let q = resample(p, step);
  if (draw < 1) q = q.slice(0, Math.max(2, Math.ceil(q.length * draw)));
  const n = q.length;
  if (n < 2) return;
  const total = (n - 1) * step;
  g.save();
  g.fillStyle = graphStyle(g);
  for (let pass = 0; pass < passes; pass++) {
    const ps = seed * 3 + pass * 101 + BOIL * 977;
    const pw = pass ? w * 0.62 : w, pa = pass ? a * 0.5 : a;
    const off = pass ? (hash(ps, 9) - 0.5) * 1.6 * Math.max(0.6, w * 0.45) : 0;
    const L = [], R = [];
    for (let i = 0; i < n; i++) {
      const i0 = Math.max(0, i - 1), i1 = Math.min(n - 1, i + 1);
      let tx = q[i1][0] - q[i0][0], ty = q[i1][1] - q[i0][1];
      const tl = Math.hypot(tx, ty) || 1; tx /= tl; ty /= tl;
      const nx = -ty, ny = tx, s = i * step;
      const wob = (n1(s / 70, ps) - 0.5) * 2 * j + (n1(s / 13, ps + 5) - 0.5) * j * 0.35 + off;
      const u = total > 0 ? s / total : 0;
      let tp = 1;
      if (taper > 0) tp = Math.min(1, Math.pow(Math.min(u, 1 - u) * 2 / taper, 0.6) + 0.12);
      const pr = 0.72 + 0.56 * n1(s / 110, ps + 13);
      const hw = Math.max(0.25, pw * tp * pr * 0.5);
      L.push([q[i][0] + nx * (wob + hw), q[i][1] + ny * (wob + hw)]);
      R.push([q[i][0] + nx * (wob - hw), q[i][1] + ny * (wob - hw)]);
    }
    g.globalAlpha = pa * (o.alphaMul ?? 1);
    g.beginPath();
    g.moveTo(L[0][0], L[0][1]);
    for (let i = 1; i < n; i++) g.lineTo(L[i][0], L[i][1]);
    for (let i = n - 1; i >= 0; i--) g.lineTo(R[i][0], R[i][1]);
    g.closePath();
    g.fill();
  }
  g.restore();
}
// 平滑曲线（过控制点）
function skc(g, ctrl, o = {}) { sk(g, spline(ctrl, o.per ?? 8, o.closed), o); }
function skLine(g, x0, y0, x1, y1, o = {}) { sk(g, [[x0, y0], [x1, y1]], o); }
// 手画的椭圆：起笔位置随机，多画一点首尾交叠，半径略有起伏
function skEllipse(g, cx, cy, rx, ry, o = {}) {
  const seed = o.seed ?? nextSeed(), rot = o.rot ?? 0, N = Math.max(24, Math.min(90, (rx + ry) * scaleOf(g) / 5));
  const a0 = (o.start ?? hash(seed, 3) * 6.283), sweep = 6.283 * (1 + (o.overlap ?? 0.08));
  const pts = [];
  for (let k = 0; k <= N; k++) {
    const t = a0 + sweep * k / N, rr = 1 + (n1(k / N * 5, seed) - 0.5) * (o.wob ?? 0.04);
    const x = Math.cos(t) * rx * rr, y = Math.sin(t) * ry * rr;
    pts.push([cx + x * Math.cos(rot) - y * Math.sin(rot), cy + x * Math.sin(rot) + y * Math.cos(rot)]);
  }
  sk(g, pts, { ...o, seed, taper: o.taper ?? 0.25 });
}
function skRect(g, x, y, w, h, o = {}) {
  const ov = o.over ?? 6;
  skLine(g, x, y, x + w, y, { ...o, over: ov }); skLine(g, x + w, y, x + w, y + h, { ...o, over: ov });
  skLine(g, x + w, y + h, x, y + h, { ...o, over: ov }); skLine(g, x, y + h, x, y, { ...o, over: ov });
}
function skPoly(g, pts, o = {}) {   // 多边形：每条边单独一笔，带出头
  for (let i = 0; i < pts.length - (o.open ? 1 : 0); i++) skLine(g, pts[i][0], pts[i][1], pts[(i + 1) % pts.length][0], pts[(i + 1) % pts.length][1], { over: 5, ...o });
}

// ---------------- 面 ----------------
function pathOf(pts, closed = true) { const p = new Path2D(); p.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) p.lineTo(pts[i][0], pts[i][1]); if (closed) p.closePath(); return p; }
function paperFill(g, path, a = 1) { g.save(); g.globalAlpha = a; g.fillStyle = paperStyle(g); g.fill(path); g.restore(); }
// 排线：tone 0~1（0 白纸，1 最黑）；ang 排线方向（度）
function hatch(g, path, tone, ang = 35, o = {}) {
  if (tone <= 0.02) return;
  const sc = (o.scale ?? 1) / scaleOf(g), a = o.a ?? 1, ph = o.phase ?? (FILL_BOIL ? BOIL : 0);
  g.save();
  g.clip(path);
  const lay = (L, an, al) => { if (al <= 0.01) return; g.globalAlpha = al * a; g.fillStyle = hatchStyle(g, L, an, sc, ph); g.fill(path); };
  const t = clamp(tone);
  if (t < 0.25) lay(0, ang, t / 0.25);
  else if (t < 0.45) { lay(0, ang, 1 - (t - 0.25) / 0.2); lay(1, ang, (t - 0.25) / 0.2); }
  else if (t < 0.62) { lay(1, ang, 1); lay(0, ang + 70, (t - 0.45) / 0.17); }
  else if (t < 0.8) { lay(2, ang, 1); lay(1, ang + 70, 0.6 + (t - 0.62) / 0.18 * 0.4); }
  else { lay(3, ang, 1); lay(2, ang + 70, 1); lay(1, ang - 40, (t - 0.8) / 0.2); smudgeIn(g, path, (t - 0.8) * 1.6); }
  g.restore();
}
function smudgeIn(g, path, a) {
  if (a <= 0.01) return;
  g.save(); g.globalAlpha = clamp(a); const p = g.createPattern(smudgeTile, 'repeat'); const ss = 1.4 / scaleOf(g); p.setTransform(new DOMMatrix().scaleSelf(ss, ss)); g.fillStyle = p; g.fill(path); g.restore();
}
// 上调子：先揉一层软灰（底色），再排一层顺方向的线（质感）。v 0~1；
// v 可以是数字，也可以是渐变 {x0,y0,x1,y1,v0,v1}（比如天空上深下浅）
function shade(g, path, v, ang = 30, o = {}) {
  const grad = typeof v === 'object';
  const vm = grad ? (v.v0 + v.v1) / 2 : v;
  if (vm <= 0.01 && !grad) return;
  const base = x => clamp((x - 0.08) * 0.92, 0, 0.86);
  g.save();
  g.clip(path);
  // 底：揉开的石墨
  g.save();
  if (grad) {
    const gr = g.createLinearGradient(v.x0, v.y0, v.x1, v.y1);
    const st = v.stops || [[0, v.v0], [1, v.v1]];
    for (const [p, x] of st) gr.addColorStop(p, rgba([GRAPH[0] + 4, GRAPH[1] + 4, GRAPH[2] + 7], base(x)));
    g.fillStyle = gr; g.fill(path);
  } else {
    g.globalAlpha = base(vm);
    const ss = (o.sscale ?? 1.4) / scaleOf(g);
    const p = g.createPattern(smudgeTile, 'repeat'); p.setTransform(new DOMMatrix().rotateSelf(ang).scaleSelf(ss, ss));
    g.fillStyle = p; g.fill(path);
  }
  g.restore();
  // 面上的线
  const ht = clamp(o.hatch ?? (vm * 0.62 + 0.08));
  hatchLayer(g, path, ht, ang, o);
  g.restore();
}
// 只排一个方向（cross 时再加一层交叉）
function hatchLayer(g, path, t, ang, o = {}) {
  if (t <= 0.02) return;
  const sc = (o.scale ?? 1) / scaleOf(g), a = o.a ?? 1, ph = o.phase ?? (FILL_BOIL ? BOIL : 0);
  const lay = (L, an, al) => { if (al <= 0.01) return; g.globalAlpha = al * a; g.fillStyle = hatchStyle(g, L, an, sc, ph); g.fill(path); };
  if (t < 0.25) lay(0, ang, t / 0.25);
  else if (t < 0.5) { lay(0, ang, 1 - (t - 0.25) / 0.25); lay(1, ang, (t - 0.25) / 0.25); }
  else if (t < 0.75) { lay(1, ang, 1 - (t - 0.5) / 0.25); lay(2, ang, (t - 0.5) / 0.25); }
  else { lay(2, ang, 1 - (t - 0.75) / 0.25); lay(3, ang, (t - 0.75) / 0.25 + 0.3); }
  if (o.cross) lay(t > 0.6 ? 1 : 0, ang + (o.crossAng ?? 75), clamp((t - 0.35) * 1.6) * o.cross);
}
// 揉开的柔和阴影：径向渐变的石墨
function smudgeBlob(g, x, y, r, a, sy = 1) {
  g.save(); g.translate(x, y); g.scale(1, sy);
  const gr = g.createRadialGradient(0, 0, 0, 0, 0, r);
  gr.addColorStop(0, rgba([GRAPH[0] + 8, GRAPH[1] + 8, GRAPH[2] + 10], a)); gr.addColorStop(1, rgba(GRAPH, 0));
  g.fillStyle = gr; g.fillRect(-r, -r, 2 * r, 2 * r); g.restore();
}
// 擦亮：用纸色擦出高光（月光、反光）
function erase(g, path, a = 1, soft = 0) {
  g.save(); g.globalAlpha = a; if (soft) g.filter = `blur(${soft}px)`; g.fillStyle = paperStyle(g); g.fill(path); g.restore();
}
function eraseStroke(g, pts, w, a = 0.9) {
  g.save(); g.globalAlpha = a; g.strokeStyle = paperStyle(g); g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); g.stroke(); g.restore();
}

// ---------------- 光 ----------------
function glow(g, x, y, r, col, a, mode = 'screen') {
  if (a <= 0.005) return;
  g.save(); g.globalCompositeOperation = mode;
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, rgba(col, a)); gr.addColorStop(0.35, rgba(col, a * 0.45)); gr.addColorStop(1, rgba(col, 0));
  g.fillStyle = gr; g.fillRect(x - r, y - r, 2 * r, 2 * r); g.restore();
}
function tint(g, col, a, mode = 'multiply', path) {     // 整片染色（比如夜里的冷灰、清晨的暖金）
  if (a <= 0.005) return;
  g.save(); g.globalCompositeOperation = mode; g.globalAlpha = a; g.fillStyle = rgba(col, 1);
  if (path) g.fill(path); else { g.setTransform(1, 0, 0, 1, 0, 0); g.fillRect(0, 0, W, H); }
  g.restore();
}
// 光柱：从 (x0,y0) 打到 (x1,y1)，起点宽 w0、终点宽 w1；几层由宽到窄叠出柔边
function beam(g, x0, y0, x1, y1, w0, w1, col, a, o = {}) {
  if (a <= 0.005) return;
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  g.save(); g.globalCompositeOperation = o.mode || 'screen';
  const layers = o.layers ?? 5;
  for (let k = 0; k < layers; k++) {
    const f = 1 + (layers - 1 - k) * 0.22, al = a * (k + 1) / layers / layers * 1.7;
    const gr = g.createLinearGradient(x0, y0, x1, y1);
    gr.addColorStop(0, rgba(col, al * 1.0)); gr.addColorStop(0.7, rgba(col, al * 0.75)); gr.addColorStop(1, rgba(col, al * (o.endA ?? 0.55)));
    g.fillStyle = gr;
    g.beginPath();
    g.moveTo(x0 + nx * w0 * f / 2, y0 + ny * w0 * f / 2); g.lineTo(x1 + nx * w1 * f / 2, y1 + ny * w1 * f / 2);
    g.lineTo(x1 - nx * w1 * f / 2, y1 - ny * w1 * f / 2); g.lineTo(x0 - nx * w0 * f / 2, y0 - ny * w0 * f / 2);
    g.closePath(); g.fill();
  }
  g.restore();
}
// 光里的灰尘：在光柱里慢慢飘的小亮点
function dust(g, x0, y0, x1, y1, w0, w1, n, t, col, a, seed = 7) {
  g.save(); g.globalCompositeOperation = 'screen';
  const dx = x1 - x0, dy = y1 - y0, L = Math.hypot(dx, dy), nx = -dy / L, ny = dx / L;
  for (let i = 0; i < n; i++) {
    const u = (hash(i, seed) + t * (0.01 + 0.02 * hash(i, seed + 1))) % 1;
    const v = (hash(i, seed + 2) - 0.5) + Math.sin(t * 0.7 + i) * 0.05;
    const w = lerp(w0, w1, u);
    const x = x0 + dx * u + nx * v * w * 0.9, y = y0 + dy * u + ny * v * w * 0.9;
    const tw = 0.5 + 0.5 * Math.sin(t * (1.5 + hash(i, seed + 3) * 2) + i);
    const r = 1.2 + 2.4 * hash(i, seed + 4);
    g.fillStyle = rgba(col, a * tw * (1 - Math.abs(v) * 1.6));
    g.beginPath(); g.arc(x, y, r, 0, 6.283); g.fill();
  }
  g.restore();
}

// ---------------- 字 ----------------
const FONT_HAND = '"Xiaolai SC", "Xiaolai", "LXGW WenKai", serif';
const FONT_HIS = '"Long Cang", "Xiaolai SC", serif';
// 铅笔写的字：石墨纹理 + 略微错开的第二遍
function pencilText(g, s, x, y, size, o = {}) {
  g.save();
  g.font = `${o.weight || ''} ${size}px ${o.font || FONT_HAND}`;
  g.textAlign = o.align || 'center'; g.textBaseline = o.base || 'middle';
  g.fillStyle = graphStyle(g);
  const a = o.a ?? 0.92;
  g.globalAlpha = a; g.fillText(s, x, y);
  g.globalAlpha = a * 0.3; g.fillText(s, x + size * 0.012 * (hash(BOIL, 3) - 0.3), y + size * 0.01 * (hash(BOIL, 4) - 0.5));
  g.restore();
}

// ---------------- 合成 ----------------
function drawPaper(g) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1; g.globalCompositeOperation = 'source-over'; g.drawImage(paperCanvas, 0, 0); g.restore(); }
function postGrain(g, a = 0.5) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.globalAlpha = a;
  g.fillStyle = g.createPattern(grainCanvas, 'repeat'); g.fillRect(0, 0, W, H); g.restore();
}
function vignette(g, a = 0.35, col = [60, 52, 44]) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply';
  const gr = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 1.05);
  gr.addColorStop(0, 'rgba(255,255,255,0)'); gr.addColorStop(1, rgba(col, a));
  g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
}
