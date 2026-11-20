'use strict';
/* 方向 5：圣诞毛衣（针织世界）。
   画先画在 160×90 的小画布上（一个像素 = 一针），再把每一格"织"成一针：针 12 宽 × 9 高（平针本来就是横着宽），
   一列列 V 字，上面一行压着下面一行；再加毛絮、光照，亮的颜色（窗、灯、月亮）往外发光。
   贴在毛衣上的立体东西另画：十字绣的歌词布标、"甜菜"织标、毛线团、真的毛线（拆下来会打卷）、绒球做的雪、棒针。 */
NEED += '圣诞节剩下单人的剩单节我的依赖还在耍赖周杰伦《爱情废柴》甜菜一个人的';
const KB_W = 160, KB_H = 90, KSW = 12, KSH = 9;
const KN = { NAVY: '#1C2A5E', NAVY2: '#16214A', RED: '#C42E3A', RED2: '#9E2230', CREAM: '#F1E8CF', SNOW: '#EEF1F6', SNOW2: '#C6D3EA', SNOW3: '#A9BBDD', GREEN: '#2C7752', GREEN2: '#1F5C40', YEL: '#FFD36A', MOON: '#F7F2DE', BROWN: '#6A4632', CORAL: '#F07A5A' };
const SNOWFLAKE = ['....#....', '.#..#..#.', '..#.#.#..', '...###...', '#########', '...###...', '..#.#.#..', '.#..#..#.', '....#....'];
const KHEART = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
const REINDEER = ['#.#.#.........', '.###..........', '..#...........', '.###..........', '####..........', '..##..........', '..###########.', '...###########', '...##########.', '...#.#....#.#.', '...#.#....#.#.'];
const KTREE = ['...#...', '..###..', '.#####.', '..###..', '.#####.', '#######', '...#...'];
function motif(g, pat, x, y, col, flip) { pat.forEach((row, j) => { for (let i = 0; i < row.length; i++) if (row[flip ? row.length - 1 - i : i] === '#') R(g, x + i, y + j, 1, 1, col); }); }
function dotRow(g, y, a, b, step = 4, off = 1) { R(g, 0, y, KB_W, 1, b); for (let x = off; x < KB_W; x += step) R(g, x, y, 1, 1, a); }

/* ---------- 一针 ---------- */
const _kst = {};
function kStitch(col, v) {
  const key = col + v; if (_kst[key]) return _kst[key];
  const w = KSW + 8, h = 26, c = document.createElement('canvas'); c.width = w; c.height = h; const g = c.getContext('2d');
  const A = h2(col), r = rng(A[0] * 65536 + A[1] * 256 + A[2] + v * 7919), base = [col, lt(col, .07), dk(col, .08)][v];
  const cx = w / 2, cy = h / 2;
  [-1, 1].forEach(sd => {
    g.save(); g.translate(cx + sd * KSW * .21, cy); g.rotate(sd * .5);
    const rx = KSW * .29, ry = KSH * 1.02;
    g.beginPath(); g.ellipse(0, 0, rx, ry, 0, 0, Math.PI * 2); g.save(); g.clip();
    const gx = g.createLinearGradient(-rx, 0, rx, 0); gx.addColorStop(0, dk(base, .45)); gx.addColorStop(.4, lt(base, .2)); gx.addColorStop(.62, base); gx.addColorStop(1, dk(base, .32));
    g.fillStyle = gx; g.fillRect(-rx, -ry, 2 * rx, 2 * ry);
    const gy = g.createLinearGradient(0, -ry, 0, ry); gy.addColorStop(0, 'rgba(0,0,0,.45)'); gy.addColorStop(.3, 'rgba(0,0,0,0)'); gy.addColorStop(.72, 'rgba(0,0,0,0)'); gy.addColorStop(1, 'rgba(0,0,0,.4)');
    g.fillStyle = gy; g.fillRect(-rx, -ry, 2 * rx, 2 * ry);
    g.lineWidth = .9;
    for (let k = -6; k <= 6; k++) { const y = k * ry / 4.4 + (r() - .5) * 1.1; g.strokeStyle = `rgba(255,255,255,${.08 + r() * .12})`; g.beginPath(); g.moveTo(-rx, y + rx); g.lineTo(rx, y - rx); g.stroke(); g.strokeStyle = `rgba(0,0,0,${.08 + r() * .1})`; g.beginPath(); g.moveTo(-rx, y + rx + 1.3); g.lineTo(rx, y - rx + 1.3); g.stroke(); }
    g.restore();
    g.strokeStyle = 'rgba(0,0,0,.3)'; g.lineWidth = .8; g.stroke();
    g.restore();
  });
  return _kst[key] = c;
}
/* 把 160×90 的画织出来。o.rows 行数（默认 120），o.y0 从屏幕哪一行开始；o.hole(c, r) 为真的针不织；o.glow {颜色: 光色} */
function knit(main, buf, o = {}) {
  const rows = o.rows || 120, y0 = o.y0 || 0, d = buf.getImageData(0, 0, KB_W, KB_H).data, bg = o.bg || KN.NAVY;
  const colAt = (c, r) => { const by = Math.min(KB_H - 1, Math.max(0, fl(r * KB_H / rows))), k = (by * KB_W + c) * 4; return d[k + 3] < 128 ? bg : rgb([d[k], d[k + 1], d[k + 2]]); };
  const hole = o.hole || (() => false);
  main.save(); main.translate(0, y0);
  for (let r = 0; r < rows; r++) for (let c = 0; c < KB_W; c++) { if (hole(c, r)) continue; main.fillStyle = dk(colAt(c, r), .58); main.fillRect(c * KSW, r * KSH, KSW, KSH); }
  const rr = rng(7);
  for (let r = rows; r >= -1; r--) for (let c = 0; c < KB_W; c++) {
    const rc = Math.max(0, Math.min(rows - 1, r)); if (hole(c, rc)) continue;
    const sp = kStitch(colAt(c, rc), fl(rr() * 3));
    const x = c * KSW + KSW / 2 + (rr() - .5) * 1.1 + Math.sin(r * .7 + c * .13) * .45, y = r * KSH + KSH / 2 + (rr() - .5) * .8;
    main.drawImage(sp, Math.round(x - sp.width / 2), Math.round(y - sp.height / 2 + 1));
  }
  // 毛絮
  main.lineWidth = .7;
  for (let i = 0; i < 30000; i++) { const x = rr() * 1920, y = rr() * rows * KSH, c = fl(x / KSW), r = fl(y / KSH); if (c >= KB_W || hole(c, r)) { rr(); rr(); rr(); continue; } const a = rr() * 6.283, l = 1.6 + rr() * 3.6; main.strokeStyle = lt(colAt(c, r), .4); main.globalAlpha = .14 + rr() * .2; main.beginPath(); main.moveTo(x, y); main.quadraticCurveTo(x + Math.cos(a) * l * .5 + 1, y + Math.sin(a) * l * .5 - 1, x + Math.cos(a) * l, y + Math.sin(a) * l); main.stroke(); }
  main.globalAlpha = 1;
  // 发光
  if (o.glow) {
    const G = document.createElement('canvas'); G.width = KB_W; G.height = rows; const gg = G.getContext('2d'); const map = {}; Object.keys(o.glow).forEach(k => map[k.toLowerCase()] = o.glow[k]);
    for (let r = 0; r < rows; r++) for (let c = 0; c < KB_W; c++) { const g2 = map[colAt(c, r)]; if (g2 && !hole(c, r)) { gg.fillStyle = g2; gg.fillRect(c, r, 1, 1); } }
    main.save(); main.globalCompositeOperation = 'screen'; main.imageSmoothingEnabled = true;
    main.filter = 'blur(9px)'; main.globalAlpha = .85; main.drawImage(G, 0, 0, KB_W * KSW, rows * KSH);
    main.filter = 'blur(34px)'; main.globalAlpha = .7; main.drawImage(G, 0, 0, KB_W * KSW, rows * KSH);
    main.restore();
  }
  main.restore();
  return (bx, by) => [bx * KSW, y0 + by * rows * KSH / KB_H];
}
/* 整体打光：左上一点暖光，四周压暗，再加几道很淡的布褶 */
function kLight(main, o = {}) {
  main.save();
  const v = main.createRadialGradient(o.lx ?? 760, o.ly ?? 380, 200, 960, 540, 1250); v.addColorStop(0, 'rgba(255,236,210,.10)'); v.addColorStop(.55, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(4,6,20,.58)');
  main.fillStyle = v; main.fillRect(0, 0, 1920, 1080);
  main.globalCompositeOperation = 'soft-light';
  [[-300, .07], [500, -.06], [1300, .06]].forEach(([x, a]) => { const gr = main.createLinearGradient(x, 0, x + 700, 1080); gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(.5, a > 0 ? `rgba(255,255,255,${a * 3})` : `rgba(0,0,0,${-a * 3})`); gr.addColorStop(1, 'rgba(0,0,0,0)'); main.fillStyle = gr; main.fillRect(0, 0, 1920, 1080); });
  main.restore();
}

/* ---------- 毛衣上的立体东西 ---------- */
function smoothPts(pts, step = 3) { const out = []; for (let i = 0; i < pts.length - 1; i++) { const p0 = pts[Math.max(0, i - 1)], p1 = pts[i], p2 = pts[i + 1], p3 = pts[Math.min(pts.length - 1, i + 2)]; const L = Math.hypot(p2[0] - p1[0], p2[1] - p1[1]), n = Math.max(2, Math.ceil(L / step)); for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t; out.push([0, 1].map(d => .5 * ((2 * p1[d]) + (-p0[d] + p2[d]) * t + (2 * p0[d] - 5 * p1[d] + 4 * p2[d] - p3[d]) * t2 + (-p0[d] + 3 * p1[d] - 3 * p2[d] + p3[d]) * t3))); } } out.push(pts[pts.length - 1].slice()); return out; }
/* 一根毛线：pts 控制点；o.kink 打卷的幅度、o.wl 卷的长度（拆下来的毛线是一弯一弯的） */
function yarn(g, pts, col, w = 9, o = {}) {
  const P = smoothPts(pts, 2), Q = []; let s = 0;
  for (let i = 0; i < P.length; i++) { if (i) s += Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); const j = Math.min(i + 1, P.length - 1), k = Math.max(i - 1, 0), tx = P[j][0] - P[k][0], ty = P[j][1] - P[k][1], tl = Math.hypot(tx, ty) || 1, a = (o.kink || 0) * Math.sin(s / (o.wl || 12) * 6.283 + (o.ph || 0)); Q.push([P[i][0] - ty / tl * a, P[i][1] + tx / tl * a, tx / tl, ty / tl, s]); }
  const path = () => { g.beginPath(); Q.forEach((q, i) => i ? g.lineTo(q[0], q[1]) : g.moveTo(q[0], q[1])); };
  g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
  if (o.shadow !== false) { g.save(); g.strokeStyle = 'rgba(4,6,20,.5)'; g.lineWidth = w * 1.1; g.filter = `blur(${w * .55}px)`; g.translate(w * .55, w * .8); path(); g.stroke(); g.restore(); }
  g.strokeStyle = dk(col, .4); g.lineWidth = w; path(); g.stroke();
  g.strokeStyle = col; g.lineWidth = w * .74; path(); g.stroke();
  let next = 0; g.lineWidth = Math.max(1, w * .2);
  for (const q of Q) { if (q[4] < next) continue; next = q[4] + w * .72; const an = Math.atan2(q[3], q[2]) + 1.05, L = w * .4; g.strokeStyle = lt(col, .35); g.beginPath(); g.moveTo(q[0] - Math.cos(an) * L, q[1] - Math.sin(an) * L); g.lineTo(q[0] + Math.cos(an) * L, q[1] + Math.sin(an) * L); g.stroke(); g.strokeStyle = dk(col, .32); g.beginPath(); g.moveTo(q[0] - Math.cos(an) * L + q[2] * w * .3, q[1] - Math.sin(an) * L + q[3] * w * .3); g.lineTo(q[0] + Math.cos(an) * L + q[2] * w * .3, q[1] + Math.sin(an) * L + q[3] * w * .3); g.stroke(); }
  g.restore();
  return Q;
}
function yarnBall(g, x, y, r, col) {
  g.save(); g.fillStyle = 'rgba(4,6,20,.55)'; g.filter = `blur(${r * .25}px)`; g.beginPath(); g.ellipse(x + r * .25, y + r * .5, r, r * .8, 0, 0, 7); g.fill(); g.restore();
  g.save(); g.beginPath(); g.arc(x, y, r, 0, 7); g.clip(); g.fillStyle = dk(col, .35); g.fillRect(x - r, y - r, 2 * r, 2 * r);
  const rr = rng(Math.round(x * 3 + y)); g.lineCap = 'round';
  for (let k = 0; k < 30; k++) { const a = rr() * Math.PI, rx = r * (.2 + rr() * .85), cx = x + (rr() - .5) * r * .35, cy = y + (rr() - .5) * r * .35; [[.15, dk(col, .45)], [.105, col], [.04, lt(col, .4)]].forEach(([w, c]) => { g.lineWidth = r * w; g.strokeStyle = c; g.beginPath(); g.ellipse(cx, cy, rx, r * 1.02, a, -1.2, 1.9); g.stroke(); }); }
  const sh = g.createRadialGradient(x - r * .35, y - r * .4, r * .15, x, y, r * 1.02); sh.addColorStop(0, 'rgba(255,255,255,.18)'); sh.addColorStop(.5, 'rgba(0,0,0,0)'); sh.addColorStop(1, 'rgba(0,0,0,.55)'); g.fillStyle = sh; g.fillRect(x - r, y - r, 2 * r, 2 * r);
  g.restore();
}
/* 绒球（雪） */
function pompom(g, x, y, r, col = '#F4F3EE', o = {}) {
  if (o.shadow !== false) { g.save(); g.fillStyle = 'rgba(4,6,20,.42)'; g.filter = `blur(${Math.max(2, r * .35)}px)`; g.beginPath(); g.ellipse(x + r * .4, y + r * .6, r * .95, r * .78, 0, 0, 7); g.fill(); g.restore(); }
  g.save(); if (o.blur) g.filter = `blur(${o.blur}px)`;
  const gr = g.createRadialGradient(x - r * .3, y - r * .35, r * .1, x, y, r); gr.addColorStop(0, '#FFFFFF'); gr.addColorStop(.65, col); gr.addColorStop(1, dk(col, .28));
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r * .86, 0, 7); g.fill();
  const rr = rng(Math.round(x * 7 + y * 13)); g.lineWidth = Math.max(.6, r / 20);
  for (let i = 0; i < r * 16; i++) { const a = rr() * 6.283, d0 = r * (.25 + rr() * .55), d1 = r * (.82 + rr() * .3), b = a + (rr() - .5) * .35; g.strokeStyle = rr() < .55 ? '#FFFFFF' : dk(col, .16); g.globalAlpha = .45 + rr() * .5; g.beginPath(); g.moveTo(x + Math.cos(a) * d0, y + Math.sin(a) * d0); g.lineTo(x + Math.cos(b) * d1, y + Math.sin(b) * d1); g.stroke(); }
  g.restore();
}
/* 十字绣的布标 */
function xst(g, x, y, s, col) { const m = s * .14; g.lineCap = 'round'; [[x + m, y + m, x + s - m, y + s - m], [x + s - m, y + m, x + m, y + s - m]].forEach(([a, b, c2, d], k) => { g.strokeStyle = dk(col, .35); g.lineWidth = s * .42; g.beginPath(); g.moveTo(a, b); g.lineTo(c2, d); g.stroke(); g.strokeStyle = k ? lt(col, .18) : col; g.lineWidth = s * .26; g.beginPath(); g.moveTo(a, b); g.lineTo(c2, d); g.stroke(); }); }
function xpatch(g, text, cx, cy, o = {}) {
  const b = tbits(text), s = o.s || 7, pad = o.pad ?? 3, cols = b.w + pad * 2, rws = (b.y1 - b.y0 + 1) + pad * 2, W = cols * s, H = rws * s, x0 = Math.round(cx - W / 2), y0 = Math.round(cy - H / 2), bg = o.bg || '#F2EAD8';
  g.save(); g.fillStyle = 'rgba(4,6,20,.55)'; g.filter = 'blur(10px)'; g.fillRect(x0 + 8, y0 + 12, W, H); g.restore();
  g.save(); g.beginPath(); g.roundRect(x0, y0, W, H, 6); g.fillStyle = bg; g.fill(); g.clip();
  const rr = rng(W + H); for (let i = 0; i < W * H / 60; i++) { g.fillStyle = rr() < .5 ? 'rgba(255,255,255,.25)' : 'rgba(120,90,50,.08)'; g.fillRect(x0 + rr() * W, y0 + rr() * H, 2, 1); }
  g.fillStyle = 'rgba(110,90,60,.28)'; for (let j = 0; j <= rws; j++) for (let i = 0; i <= cols; i++) g.fillRect(x0 + i * s - .7, y0 + j * s - .7, 1.4, 1.4);
  const sh = g.createLinearGradient(0, y0, 0, y0 + H); sh.addColorStop(0, 'rgba(255,255,255,.18)'); sh.addColorStop(1, 'rgba(0,0,0,.12)'); g.fillStyle = sh; g.fillRect(x0, y0, W, H);
  g.restore();
  // 锁边：一圈红线
  const ec = o.edge || KN.RED; g.lineCap = 'round';
  for (let x = x0 + 8; x < x0 + W - 6; x += 9) { g.strokeStyle = dk(ec, .3); g.lineWidth = 3; g.beginPath(); g.moveTo(x, y0 - 1); g.lineTo(x, y0 + 8); g.stroke(); g.beginPath(); g.moveTo(x, y0 + H + 1); g.lineTo(x, y0 + H - 8); g.stroke(); g.strokeStyle = ec; g.lineWidth = 2; g.beginPath(); g.moveTo(x, y0 - 1); g.lineTo(x, y0 + 8); g.stroke(); g.beginPath(); g.moveTo(x, y0 + H + 1); g.lineTo(x, y0 + H - 8); g.stroke(); }
  for (let y = y0 + 8; y < y0 + H - 6; y += 9) { g.strokeStyle = ec; g.lineWidth = 2; g.beginPath(); g.moveTo(x0 - 1, y); g.lineTo(x0 + 8, y); g.stroke(); g.beginPath(); g.moveTo(x0 + W + 1, y); g.lineTo(x0 + W - 8, y); g.stroke(); }
  g.strokeStyle = ec; g.lineWidth = 2; g.strokeRect(x0 + 8, y0 + 8, W - 16, H - 16);
  const tc = o.col || '#2A3A7A'; b.pts.forEach(([i, j]) => xst(g, x0 + (i + pad) * s, y0 + (j - b.y0 + pad) * s, s, tc));
  return [x0, y0, W, H];
}
/* 织标（领口那种），水印"甜菜" */
function wovenLabel(g, text, x, y, o = {}) {
  const b = tbits(text), s = o.s || 3, W = b.w * s + 40, H = (b.y1 - b.y0 + 1) * s + 22;
  g.save(); g.fillStyle = 'rgba(4,6,20,.5)'; g.filter = 'blur(6px)'; g.fillRect(x + 5, y + 7, W, H); g.restore();
  g.fillStyle = '#F4EEDC'; g.fillRect(x, y, W, H); for (let j = 0; j < H; j += 2) { g.fillStyle = j % 4 ? 'rgba(0,0,0,.05)' : 'rgba(255,255,255,.4)'; g.fillRect(x, y + j, W, 1); }
  g.fillStyle = '#C42E3A'; g.fillRect(x, y + 3, W, 2); g.fillRect(x, y + H - 5, W, 2);
  [x, x + W - 9].forEach(ex => { g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(ex, y, 9, H); for (let yy = y + 3; yy < y + H - 3; yy += 6) { g.fillStyle = '#C42E3A'; g.fillRect(ex + 3, yy, 3, 3); } });
  b.pts.forEach(([i, j]) => { const px = x + 20 + i * s, py = y + 11 + (j - b.y0) * s; for (let k = 0; k < s; k += 1) { g.fillStyle = k % 2 ? '#9E2230' : '#C42E3A'; g.fillRect(px, py + k, s, 1); } });
}
/* 棒针 */
function kneedle(g, x0, y0, x1, y1, w = 16, col = '#D9A86A') {
  const L = Math.hypot(x1 - x0, y1 - y0), an = Math.atan2(y1 - y0, x1 - x0), tip = w * 3;
  g.save(); g.translate(x0, y0); g.rotate(an);
  g.save(); g.fillStyle = 'rgba(4,6,20,.5)'; g.filter = 'blur(8px)'; g.fillRect(0, w * .3, L, w); g.restore();
  const gr = g.createLinearGradient(0, -w / 2, 0, w / 2); gr.addColorStop(0, lt(col, .45)); gr.addColorStop(.35, lt(col, .15)); gr.addColorStop(1, dk(col, .4));
  g.fillStyle = gr; g.beginPath(); g.moveTo(0, -w / 2); g.lineTo(L - tip, -w / 2); g.quadraticCurveTo(L - tip * .2, -w * .12, L, 0); g.quadraticCurveTo(L - tip * .2, w * .12, L - tip, w / 2); g.lineTo(0, w / 2); g.closePath(); g.fill();
  g.strokeStyle = 'rgba(120,70,30,.25)'; g.lineWidth = 1; for (let i = 0; i < 18; i++) { g.beginPath(); g.moveTo(i * 97 % (L - tip), -w * .2 + (i % 5) * w * .1); g.lineTo(i * 97 % (L - tip) + 140, -w * .2 + (i % 5) * w * .1 + 1); g.stroke(); }
  const kg = g.createRadialGradient(-w * .3, -w * .3, 2, 0, 0, w * 1.1); kg.addColorStop(0, lt(col, .4)); kg.addColorStop(1, dk(col, .35)); g.fillStyle = kg; g.beginPath(); g.arc(0, 0, w * .95, 0, 7); g.fill();
  g.restore();
}

/* ---------- 毛衣上的图案（160×90 小画布） ---------- */
function khouse(g, x, base, w, h, wall, roof, o = {}) {
  R(g, x, base - h, w, h, wall); R(g, x + w - 1, base - h, 1, h, dk(wall, .2));
  const rh = o.rh || Math.ceil(w / 2.2);
  for (let j = 0; j < rh; j++) { const ins = Math.round((rh - 1 - j) * (w / 2 + 1) / rh); R(g, x - 1 + ins, base - h - rh + j, w + 2 - 2 * ins, 1, j < 2 ? KN.SNOW : (j === rh - 1 ? KN.SNOW : roof)); }
  if (o.chim) { R(g, x + w - 4, base - h - rh + 1, 2, 3, KN.BROWN); R(g, x + w - 4, base - h - rh, 2, 1, KN.SNOW); }
  (o.wins || [[2, 2]]).forEach(([wx, wy, dark]) => { R(g, x + wx, base - h + wy, 3, 3, dark ? '#2A3466' : KN.YEL); });
  if (o.door != null) { R(g, x + o.door, base - 4, 3, 4, o.doorCol || '#5A2A30'); }
}
function kpine(g, x, base, h, col = KN.GREEN) { R(g, x, base - 2, 1, 2, KN.BROWN); for (let j = 0; j < h; j++) { const w = 1 + fl(((j % 4) + j * .55) * .5); R(g, x - w, base - 2 - h + j, 2 * w + 1, 1, j % 4 === 0 ? KN.SNOW : col); } }
function ktree(g, x, base, h) { R(g, x - 1, base - 3, 3, 3, KN.BROWN); for (let j = 0; j < h; j++) { const w = 1 + fl(((j % 6) * .6 + j * .32)); R(g, x - w, base - 3 - h + j, 2 * w + 1, 1, j % 6 === 0 && j ? KN.SNOW : KN.GREEN); } const rr = rng(x); for (let i = 0; i < h * .9; i++) { const j = 2 + fl(rr() * (h - 3)), w = fl(((j % 6) * .6 + j * .32)); R(g, x - w + fl(rr() * (2 * w + 1)), base - 3 - h + j, 1, 1, BULBS[i % 5]); } R(g, x, base - 4 - h, 1, 1, '#FFE066'); R(g, x - 1, base - 3 - h, 3, 1, '#FFE066'); R(g, x, base - 5 - h, 1, 1, '#FFE066'); }
const KGLOW = { '#FFD36A': '#FFA640', '#FF5A5A': '#FF4030', '#5ADB7A': '#40D060', '#5AB8FF': '#40A0FF', '#FF8AD8': '#FF60C0', '#FFE066': '#FFC840', '#F7F2DE': '#B8B0A0' };
function topBand(g, y) { R(g, 0, y, KB_W, 3, KN.RED); dotRow(g, y + 3, KN.CREAM, KN.RED); R(g, 0, y + 4, KB_W, 11, KN.NAVY2); for (let x = 3; x < KB_W; x += 16) motif(g, SNOWFLAKE, x, y + 5, KN.CREAM); for (let x = 11; x < KB_W; x += 16) { R(g, x + 1, y + 8, 1, 1, KN.RED); R(g, x, y + 9, 3, 1, KN.RED); R(g, x + 1, y + 10, 1, 1, KN.RED); } dotRow(g, y + 15, KN.CREAM, KN.RED); R(g, 0, y + 16, KB_W, 2, KN.RED); }
function stars(g, seed, n, y0, y1) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = fl(r() * KB_W), y = y0 + fl(r() * (y1 - y0)); if (r() < .2) { R(g, x - 1, y, 3, 1, KN.CREAM); R(g, x, y - 1, 1, 3, KN.CREAM); } else R(g, x, y, 1, 1, KN.CREAM); } }

/* ============ 5a：开头。棒针正在织这个世界，片名是织进去的 ============ */
FRAMES['5a'] = async (main) => {
  // 毛衣上面：织毛衣的人身上的淡紫色衣服（虚的），暖光
  const bgr = main.createLinearGradient(0, 0, 0, 130); bgr.addColorStop(0, '#5A4A78'); bgr.addColorStop(1, '#7A68A0'); main.fillStyle = bgr; main.fillRect(0, 0, 1920, 130);
  main.save(); main.filter = 'blur(14px)'; for (let i = 0; i < 9; i++) { const x = i * 230 + 60; main.fillStyle = i % 2 ? 'rgba(40,30,70,.35)' : 'rgba(255,240,255,.12)'; main.beginPath(); main.ellipse(x, 40, 70, 160, .3, 0, 7); main.fill(); } [[300, 30, 170, '#FFB45A'], [960, 10, 140, '#FF8A5A'], [1500, 40, 150, '#FFD27A']].forEach(([x, y, r, c]) => { const gr = main.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, c + '55'); gr.addColorStop(1, c + '00'); main.fillStyle = gr; main.fillRect(x - r, y - r, 2 * r, 2 * r); }); main.restore();
  const g = mk(KB_W, KB_H);
  R(g, 0, 0, KB_W, KB_H, KN.NAVY); topBand(g, 0); stars(g, 3, 70, 19, 60);
  disc(g, 141, 30, 6.5, KN.MOON); R(g, 138, 28, 2, 2, '#E2DCC2'); R(g, 143, 32, 2, 1, '#E2DCC2'); R(g, 140, 34, 1, 1, '#E2DCC2');
  [['爱', KN.CREAM], ['情', KN.CREAM], ['废', KN.CORAL], ['柴', KN.CORAL]].forEach(([c, col], i) => ptext(g, c, 28 + i * 26, 25, col, { s: 2, sh: '#0B1230' }));
  motif(g, KHEART, 76, 52, KN.RED); for (let x = 40; x < 72; x += 6) R(g, x, 55, 2, 1, KN.CREAM); for (let x = 86; x < 120; x += 6) R(g, x, 55, 2, 1, KN.CREAM);
  for (let x = 0; x < KB_W; x++) { const h = 62 + Math.round(3 * Math.sin(x / 13 + 1) + 2 * Math.sin(x / 5)); R(g, x, h, 1, 90 - h, KN.SNOW2); }
  [[8, 64, 8, 6, '#B5654A', '#5A2E3A'], [18, 63, 7, 7, '#4E7A8C', '#2E3E5A'], [128, 62, 8, 6, '#C89858', '#6A3A2A'], [139, 64, 7, 5, '#A84A5A', '#4A2A3A'], [150, 63, 8, 7, '#7A5A8C', '#3A2A4E']].forEach(([x, b, w, h, wa, ro], i) => khouse(g, x, b, w, h, wa, ro, { wins: [[2, 2]], chim: i % 2 }));
  [30, 36, 120, 158, 2].forEach((x, i) => kpine(g, x, 64 + (i % 2), 7 + (i % 3)));
  for (let x = 0; x < KB_W; x++) { const h = 69 + Math.round(2.5 * Math.sin(x / 17 + 3) + 1.5 * Math.sin(x / 7)); R(g, x, h, 1, 90 - h, KN.SNOW); if (x % 7 === 3) R(g, x, h + 3, 2, 1, KN.SNOW2); }
  ktree(g, 108, 74, 20);
  chibi(g, 58, 73, 22, { ...HERO, sit: 1, eyes: 'n', mouth: 'flat', snow: 1 });
  dotRow(g, 78, KN.CREAM, KN.RED, 3, 1); R(g, 0, 79, KB_W, 11, KN.RED);
  for (let k = 0; k < 5; k++) { const x = 4 + k * 32; motif(g, REINDEER, x, 79, KN.CREAM, k % 2); motif(g, KTREE, x + 19, 81, KN.GREEN); }
  knit(main, g, { rows: 104, y0: 124, glow: KGLOW });
  kLight(main, { lx: 900, ly: 460 });
  // 最上面一排还挂在棒针上：后半圈在针后面，两条腿在针前面
  const NY = 112;
  for (let c = 0; c < KB_W; c++) { const x = c * KSW + KSW / 2; if (x > 1600) continue; yarn(main, [[x - 4, 132], [x - 7, NY + 2], [x, NY - 15], [x + 7, NY + 2], [x + 4, 132]], dk(KN.RED, .15), 5.5, { shadow: false }); }
  kneedle(main, -40, NY + 4, 1700, NY - 6, 24);
  for (let c = 0; c < KB_W; c++) { const x = c * KSW + KSW / 2; if (x > 1600) continue; yarn(main, [[x - 4, 134], [x - 6, 122], [x - 4, NY + 1]], KN.RED, 5.5, { shadow: false }); yarn(main, [[x + 4, 134], [x + 6, 122], [x + 4, NY + 1]], KN.RED, 5.5, { shadow: false }); }
  kneedle(main, 1990, -40, 1590, 128, 24);
  yarn(main, [[1600, 124], [1650, 132], [1700, 104], [1760, 80]], KN.RED, 8);
  yarnBall(main, 1810, 64, 62, KN.RED);
  [[150, 360, 20], [1700, 380, 16], [90, 660, 14], [1800, 760, 24], [1550, 880, 13], [380, 880, 17], [760, 780, 11], [1240, 720, 15], [1860, 560, 12]].forEach(([x, y, r]) => pompom(main, x, y, r));
  xpatch(main, '周杰伦《爱情废柴》', 290, 990, { s: 4, pad: 2, col: '#7A2A30' });
  wovenLabel(main, '甜菜', 1690, 160);
};

/* ============ 5b：主歌，街上 ============ */
FRAMES['5b'] = async (main) => {
  const g = mk(KB_W, KB_H);
  R(g, 0, 0, KB_W, KB_H, KN.NAVY); topBand(g, -2); stars(g, 9, 40, 17, 30);
  disc(g, 148, 22, 4.5, KN.MOON); R(g, 146, 21, 2, 1, '#E2DCC2');
  const HS = [[2, 62, 18, 30, '#B5654A', '#5A2E3A', [[3, 4], [11, 4], [3, 12], [11, 12, 1], [3, 20]], 7], [22, 62, 15, 36, '#4E7A8C', '#2E3E5A', [[2, 4], [9, 4, 1], [2, 11], [9, 11], [2, 18, 1], [9, 18], [2, 25]], 5], [39, 62, 19, 26, '#C89858', '#6A3A2A', [[3, 4], [13, 4], [3, 11], [13, 11, 1], [8, 17]], 8], [60, 62, 15, 33, '#A84A5A', '#4A2A3A', [[2, 4, 1], [9, 4], [2, 11], [9, 11], [2, 18], [9, 18, 1], [2, 25]], 6], [77, 62, 17, 28, '#7A5A8C', '#3A2A4E', [[3, 4], [11, 4], [3, 11, 1], [11, 11], [3, 18]], 7], [131, 62, 15, 31, '#4E7A8C', '#2E3E5A', [[2, 4], [9, 4], [2, 11], [9, 11, 1], [2, 18], [9, 18]], 6], [148, 62, 14, 26, '#B5654A', '#5A2E3A', [[2, 4, 1], [9, 4], [2, 11], [9, 11]], 5]];
  HS.forEach(([x, b, w, h, wa, ro, wins, dr], i) => khouse(g, x, b, w, h, wa, ro, { wins, door: dr, chim: i % 2 === 0 }));
  R(g, 0, 62, KB_W, 28, KN.SNOW); for (let y = 64; y < 90; y += 3) for (let x = (y % 2) * 3; x < KB_W; x += 7) R(g, x, y, 3, 1, KN.SNOW2);
  [97, 126].forEach(x => { R(g, x, 46, 1, 18, '#2A2438'); R(g, x - 1, 44, 3, 2, KN.YEL); });
  ktree(g, 112, 68, 34);
  const bubble = (x, y, kind) => { R(g, x - 6, y - 4, 13, 8, KN.CREAM); R(g, x - 5, y - 5, 11, 10, KN.CREAM); R(g, x - 1, y + 5, 2, 1, KN.CREAM); R(g, x, y + 6, 1, 1, KN.CREAM); if (kind === 'heart') motif(g, ['##.##', '#####', '.###.', '..#..'], x - 2, y - 2, KN.RED); else [-3, 0, 3].forEach(d => R(g, x + d - 1, y, 2, 1, '#2A3A7A')); };
  [[52, 74, 0], [96, 76, 2], [146, 75, 1]].forEach(([x, fy, k]) => { const P = [[{ hair: '#7A4A2A', coat: '#F08AB0', scarf: '#FFFFFF', girl: 1, hat: '#FFFFFF', pom: '#FF5A7A' }, { hair: '#1B1420', coat: '#5AA0E8', scarf: '#FFD54A' }], [{ hair: '#1B1420', coat: '#F2C94C', scarf: '#5AB8FF', girl: 1, hat: '#E0423A', pom: '#FFFFFF' }, { hair: '#8A5A2A', coat: '#E07A5A', scarf: '#FFFFFF' }], [{ hair: '#C8742E', coat: '#6CC58A', scarf: '#FFFFFF', girl: 1 }, { hair: '#3A2A20', coat: '#7A6AD8', scarf: '#E0423A' }]][k]; chibi(g, x - 6, fy, 19, { ...P[0], eyes: 'happy', mouth: 'smile' }); chibi(g, x + 6, fy, 19, { ...P[1], eyes: 'happy', mouth: 'smile' }); bubble(x, fy - 27, 'heart'); });
  chibi(g, 22, 76, 21, { ...HERO, eyes: 'dn', mouth: 'flat', snow: 1 }); bubble(22, 47, 'dots');
  knit(main, g, { glow: KGLOW });
  kLight(main, { lx: 1300, ly: 600 });
  const bead = (x, y, c) => { main.save(); main.fillStyle = 'rgba(4,6,20,.5)'; main.filter = 'blur(3px)'; main.beginPath(); main.arc(x + 3, y + 4, 7, 0, 7); main.fill(); main.restore(); const gr = main.createRadialGradient(x - 2, y - 2, 1, x, y, 8); gr.addColorStop(0, lt(c, .6)); gr.addColorStop(.6, c); gr.addColorStop(1, dk(c, .4)); main.fillStyle = gr; main.beginPath(); main.arc(x, y, 7, 0, 7); main.fill(); main.save(); main.globalCompositeOperation = 'screen'; const gl = main.createRadialGradient(x, y, 0, x, y, 44); gl.addColorStop(0, c + 'AA'); gl.addColorStop(1, c + '00'); main.fillStyle = gl; main.fillRect(x - 44, y - 44, 88, 88); main.restore(); };
  const wire = []; for (let i = 0; i <= 44; i++) { const t = i / 44, x = -20 + t * 1960, y = 350 + Math.abs(Math.sin(t * Math.PI * 4)) * -40 + 40; wire.push([x, y]); }
  yarn(main, wire, '#1F5C40', 4); wire.forEach(([x, y], i) => { if (i % 2 === 0) bead(x, y + 8, BULBS[i / 2 % 5]); });
  yarn(main, [[262, 770], [250, 840], [330, 905], [560, 892], [800, 908], [1040, 890], [1290, 906], [1520, 892], [1760, 905], [1960, 896]], KN.RED, 9, { kink: 2, wl: 26 });
  [[260, 220, 15], [690, 170, 11], [1200, 250, 18], [1610, 190, 13], [1820, 470, 21], [70, 560, 16], [930, 300, 10], [1380, 430, 12]].forEach(([x, y, r]) => pompom(main, x, y, r));
  xpatch(main, '圣诞节 剩下单人的剩单节', 960, 990, { s: 7 });
  wovenLabel(main, '甜菜', 1700, 44);
};

/* ============ 5c：副歌。她走了，织好的大心一针针拆开，他攥着那根线不放 ============ */
FRAMES['5c'] = async (main) => {
  const g = mk(KB_W, KB_H);
  R(g, 0, 0, KB_W, KB_H, KN.NAVY); stars(g, 21, 60, 2, 60);
  const HX = 82, HY = 32, HS = 22, inH = (x, y) => { const X = (x - HX) / HS, Y = -(y - HY) / HS * 1.05; const q = X * X + Y * Y - 1; return q * q * q - X * X * Y * Y * Y < 0; };
  for (let y = 0; y < 64; y++) for (let x = 40; x < 130; x++) if (inH(x + .5, y + .5)) { const e = !inH(x + 2.5, y + .5) || !inH(x - 1.5, y + .5) || !inH(x + .5, y + 2.5) || !inH(x + .5, y - 1.5); R(g, x, y, 1, 1, e ? '#F08AB0' : KN.RED); }
  for (let y = 6; y < 50; y += 6) for (let x = 54; x < 112; x += 8) { const ox = x + ((y / 6) % 2) * 4; if (inH(ox - 1, y - 1) && inH(ox + 4, y + 4) && inH(ox + 4, y - 1) && inH(ox - 1, y + 4)) motif(g, ['.#.', '###', '.#.'], ox, y, KN.CREAM); }
  for (let x = 0; x < KB_W; x++) { const h = 64 + Math.round(2 * Math.sin(x / 11) + 1.5 * Math.sin(x / 4 + 1)); R(g, x, h, 1, 90 - h, KN.SNOW); if (x % 6 === 2) R(g, x, h + 2, 2, 1, KN.SNOW2); }
  [8, 15, 150, 154].forEach((x, i) => kpine(g, x, 66, 9 + (i % 2) * 3));
  R(g, 122, 50, 1, 16, '#2A2438'); R(g, 121, 48, 3, 2, KN.YEL);
  chibi(g, 34, 80, 30, { ...HERO, sit: 1, arms: 'upR', eyes: 'shut', mouth: 'frown', tear: 1.3, snow: 1 });
  chibi(g, 140, 78, 27, { ...GIRL, back: 1, step: 1 });
  for (let i = 0; i < 9; i++) R(g, 126 - i * 6, 80 + (i % 2), 2, 1, KN.SNOW3);
  // 心的右半边已经拆掉了
  const edgeX = r => 88 + Math.round(2.5 * Math.sin(r * .55) + 1.5 * Math.sin(r * 1.7));
  const LAD = [[93, 66], [99, 60]];
  const hole = (c, r) => { const y = r * 90 / 120; if (inH(c + .5, y + .5) && c > edgeX(r)) return true; return LAD.some(([lc, lr]) => c === lc && r < lr && r > 30); };
  main.fillStyle = '#05060F'; main.fillRect(0, 0, 1920, 1080);
  const rs = rng(5); for (let i = 0; i < 160; i++) { main.fillStyle = `rgba(200,210,255,${.25 + rs() * .55})`; main.fillRect(1040 + rs() * 560, rs() * 760, 1.6, 1.6); }
  knit(main, g, { glow: KGLOW, hole });
  kLight(main, { lx: 500, ly: 600 });
  LAD.forEach(([c, r1]) => { for (let r = 31; r < r1; r++) { const x = c * KSW, y = r * KSH + KSH * .6, inHeart = inH(c + .5, r * .75 + .5); yarn(main, [[x - 2, y], [x + KSW / 2, y + 1.5], [x + KSW + 2, y]], inHeart ? KN.RED : KN.NAVY, 3.6, { shadow: false }); } });
  // 拆开的那一边：一圈圈打卷的毛线挂下来
  for (let r = 4; r < 86; r += 3) { const y0 = r * .75; if (!inH(edgeX(r) + 1.5, y0 + .5) && !inH(edgeX(r) + 3.5, y0 + .5)) continue; const x = edgeX(r) * KSW + 12, y = r * KSH + 4; yarn(main, [[x, y], [x + 16, y + 4], [x + 26 + (r % 3) * 6, y + 18 + (r % 5) * 5], [x + 22 + (r % 4) * 9, y + 40 + (r % 4) * 9]], KN.RED, 5.5, { kink: 3.2, wl: 8, ph: r }); }
  // 那根线：从心拆开的地方出来，到他举起的手里，再被她拉走、缠成一团
  const HAND = [490, 716], BALL = [1782, 848];
  yarn(main, [[1080, 300], [1000, 360], [860, 470], [700, 590], HAND], KN.RED, 10, { kink: 3, wl: 11 });
  yarn(main, [HAND, [560, 820], [820, 930], [1150, 940], [1450, 900], BALL], KN.RED, 10, { kink: 1.2, wl: 20 });
  main.save(); main.fillStyle = 'rgba(4,6,20,.4)'; main.beginPath(); main.arc(HAND[0] + 4, HAND[1] + 6, 20, 0, 7); main.fill(); main.restore(); main.fillStyle = '#C8862C'; main.beginPath(); main.ellipse(HAND[0] - 2, HAND[1] + 16, 18, 9, -.3, 0, 7); main.fill(); main.fillStyle = '#E3A23C'; main.beginPath(); main.ellipse(HAND[0] - 2, HAND[1] + 14, 16, 7, -.3, 0, 7); main.fill();
  const hg = main.createRadialGradient(HAND[0] - 5, HAND[1] - 5, 2, HAND[0], HAND[1], 17); hg.addColorStop(0, '#FFE6CF'); hg.addColorStop(1, '#D49C80'); main.fillStyle = hg; main.beginPath(); main.arc(HAND[0], HAND[1], 17, 0, 7); main.fill(); yarn(main, [[HAND[0] - 16, HAND[1] - 4], [HAND[0], HAND[1] - 9], [HAND[0] + 16, HAND[1] - 3]], KN.RED, 8, { shadow: false });
  yarnBall(main, BALL[0], BALL[1], 40, KN.RED);
  [[220, 120, 14], [640, 90, 10], [300, 400, 17], [80, 300, 12], [1000, 700, 12], [1840, 600, 16], [1860, 240, 12]].forEach(([x, y, r]) => pompom(main, x, y, r));
  xpatch(main, '我的依赖 还在耍赖', 960, 995, { s: 7 });
  wovenLabel(main, '甜菜', 1700, 44);
};
