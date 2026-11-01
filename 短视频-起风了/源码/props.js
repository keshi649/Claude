'use strict';
/* props.js：道具。纸飞机（新的白纸 / 七年后发黄的）、吉他、自行车、耳机线、笔记本、素描本里的画、世界地图、
   满天的试卷、花瓣、雪、彩虹、横幅、拍立得、粉笔头、课桌上刻的像素小怪。 */

/* 纸飞机：x, y 机头，sz 翼展的一半，ang 朝向（0 = 朝右），o.old 发黄的旧纸，o.bank 机翼倾斜（-1..1） */
function paperPlane(g, x, y, sz, ang = 0, o = {}) {
  const col = o.old ? '#EFE2BE' : '#FFFFFF', dark = o.old ? '#CDBB90' : '#D6DEE8', bank = o.bank || 0;
  g.save(); g.translate(x, y); g.rotate(ang); if (o.flip) g.scale(1, -1);
  g.globalAlpha *= o.alpha ?? 1;
  if (o.glow) glow(g, -sz, 0, sz * 3, '#FFF4D8', o.glow);
  // 上面的翼（亮）、下面的翼（暗）、机身折痕
  const up = .55 - bank * .3, dn = .45 + bank * .3;
  g.beginPath(); g.moveTo(0, 0); g.lineTo(-sz * 2.2, -sz * up); g.lineTo(-sz * 1.85, 0); g.closePath(); g.fillStyle = col; g.fill();
  g.beginPath(); g.moveTo(0, 0); g.lineTo(-sz * 2.2, sz * dn); g.lineTo(-sz * 1.85, 0); g.closePath(); g.fillStyle = dark; g.fill();
  g.beginPath(); g.moveTo(0, 0); g.lineTo(-sz * 1.85, 0); g.lineTo(-sz * 2.0, sz * .18); g.closePath(); g.fillStyle = shade(dark, .9); g.fill();
  g.strokeStyle = 'rgba(80,80,90,.35)'; g.lineWidth = Math.max(1, sz * .03); g.beginPath(); g.moveTo(0, 0); g.lineTo(-sz * 2.2, -sz * up); g.lineTo(-sz * 1.85, 0); g.lineTo(-sz * 2.2, sz * dn); g.closePath(); g.stroke();
  if (o.old && sz > 30) {      // 机翼上铅笔写的日期和涂鸦
    g.save(); g.beginPath(); g.moveTo(0, 0); g.lineTo(-sz * 2.2, -sz * up); g.lineTo(-sz * 1.85, 0); g.closePath(); g.clip();
    text(g, '2018.6.7', -sz * 1.25, -sz * .17, sz * .2, { k: 'hand', col: 'rgba(90,80,90,.75)', rot: -.12 });
    monDoodle(g, -sz * 1.55, -sz * .3, sz * .028, 'rgba(90,80,90,.7)', Math.max(1, sz * .015), 4);
    g.restore();
  }
  g.restore();
}
/* 一段飞行轨迹上的位置和朝向：pts 是几个控制点，u 0..1 */
function pathAt(pts, u) {
  const n = pts.length - 1, f = clamp(u) * n, i = Math.min(n - 1, Math.floor(f)), v = f - i;
  const P = k => pts[clamp(k, 0, n)];
  const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
  const cr = (a, b, c, d) => .5 * ((2 * b) + (-a + c) * v + (2 * a - 5 * b + 4 * c - d) * v * v + (-a + 3 * b - 3 * c + d) * v * v * v);
  const x = cr(p0[0], p1[0], p2[0], p3[0]), y = cr(p0[1], p1[1], p2[1], p3[1]);
  const v2 = Math.min(1, v + .02), x2 = (() => { const vv = v2; return .5 * ((2 * p1[0]) + (-p0[0] + p2[0]) * vv + (2 * p0[0] - 5 * p1[0] + 4 * p2[0] - p3[0]) * vv * vv + (-p0[0] + 3 * p1[0] - 3 * p2[0] + p3[0]) * vv * vv * vv); })();
  const y2 = .5 * ((2 * p1[1]) + (-p0[1] + p2[1]) * v2 + (2 * p0[1] - 5 * p1[1] + 4 * p2[1] - p3[1]) * v2 * v2 + (-p0[1] + 3 * p1[1] - 3 * p2[1] + p3[1]) * v2 * v2 * v2);
  return [x, y, Math.atan2(y2 - y, x2 - x)];
}
/* 吉他（抱在怀里，侧面）：画在角色的近侧手的位置附近；放在 hold 里用 */
function guitarAt(g, x, y, k, rot = -.35) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(k, k);
  g.fillStyle = '#5A3A26'; g.fillRect(40, -10, 300, 22);                     // 琴颈
  g.fillStyle = '#3A2618'; g.fillRect(330, -16, 50, 34);
  for (let i = 0; i < 6; i++) { g.fillStyle = '#E8E0D0'; g.fillRect(40 + i * 46, -10, 3, 22); }
  g.beginPath(); g.ellipse(-30, 0, 110, 92, 0, 0, TAU); g.fillStyle = '#C8843E'; g.fill();
  g.beginPath(); g.ellipse(50, 0, 70, 62, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(-30, 0, 100, 82, 0, 0, TAU); g.strokeStyle = '#8E5228'; g.lineWidth = 6; g.stroke();
  circ(g, 30, 0, 28); g.fillStyle = '#2A1A10'; g.fill();
  g.strokeStyle = 'rgba(255,255,255,.6)'; g.lineWidth = 1.5; for (let i = 0; i < 4; i++) { g.beginPath(); g.moveTo(-100, -9 + i * 6); g.lineTo(360, -9 + i * 6); g.stroke(); }
  g.restore();
}
/* 自行车（侧面）：x, y 两轮之间的地面中点，k 比例，ph 轮子转到哪，col 车架颜色 */
function bicycle(g, x, y, k, ph, col = '#2E6EB0') {
  const r = 70 * k, bx = x - 110 * k, fx = x + 110 * k, wy = y - r;
  for (const wx of [bx, fx]) {
    circ(g, wx, wy, r); g.strokeStyle = '#2A2A2E'; g.lineWidth = 9 * k; g.stroke();
    g.strokeStyle = 'rgba(200,200,205,.8)'; g.lineWidth = 1.5 * k;
    for (let i = 0; i < 8; i++) { const a = ph * TAU + i * Math.PI / 8; g.beginPath(); g.moveTo(wx - Math.cos(a) * r, wy - Math.sin(a) * r); g.lineTo(wx + Math.cos(a) * r, wy + Math.sin(a) * r); g.stroke(); }
  }
  const crank = [x - 10 * k, wy], seat = [x - 40 * k, wy - 110 * k], head = [fx - 30 * k, wy - 115 * k];
  g.strokeStyle = col; g.lineWidth = 9 * k; g.lineCap = 'round'; g.lineJoin = 'round';
  g.beginPath(); g.moveTo(bx, wy); g.lineTo(...crank); g.lineTo(...seat); g.lineTo(bx, wy); g.moveTo(...crank); g.lineTo(...head); g.lineTo(fx, wy); g.moveTo(...seat); g.lineTo(head[0] - 10 * k, head[1] + 10 * k); g.stroke();
  rr(g, seat[0] - 26 * k, seat[1] - 14 * k, 52 * k, 12 * k, 6 * k); g.fillStyle = '#2A2A2E'; g.fill();
  line(g, head[0], head[1], head[0] + 24 * k, head[1] - 30 * k, '#3A3A40', 7 * k); line(g, head[0] + 24 * k, head[1] - 30 * k, head[0] + 4 * k, head[1] - 38 * k, '#3A3A40', 7 * k);
  // 脚踏
  const a = ph * TAU * .5;
  line(g, crank[0], crank[1], crank[0] + Math.cos(a) * 30 * k, crank[1] + Math.sin(a) * 30 * k, '#555', 6 * k);
  // 车篮
  rr(g, fx - 30 * k, wy - 150 * k, 70 * k, 46 * k, 6 * k); g.strokeStyle = '#C8CCD0'; g.lineWidth = 4 * k; g.stroke();
  return { seat, handle: [head[0] + 4 * k, head[1] - 38 * k], crank };
}
/* 一副有线耳机：两个人一人一边，线在中间垂成 Y 形 */
function earphones(g, a, b, sag = 120) {
  const mx = (a[0] + b[0]) / 2, my = Math.max(a[1], b[1]) + sag;
  g.strokeStyle = 'rgba(250,250,250,.95)'; g.lineWidth = 3; g.lineCap = 'round';
  g.beginPath(); g.moveTo(...a); g.quadraticCurveTo(a[0], my - 20, mx, my); g.quadraticCurveTo(b[0], my - 20, ...b); g.stroke();
  g.beginPath(); g.moveTo(mx, my); g.quadraticCurveTo(mx + 10, my + 60, mx - 10, my + 120); g.stroke();
  for (const p of [a, b]) { circ(g, p[0], p[1], 7); g.fillStyle = '#FFFFFF'; g.fill(); }
}
/* 漂起来的音符 */
function notes(g, s, x, y, n, col = '#FFFFFF', a = 1) {
  for (let i = 0; i < n; i++) {
    const t = (s * .6 + hash(i, 81)) % 1, px = x + (hash(i, 82) - .5) * 160 + Math.sin(s * 2 + i) * 20, py = y - t * 220;
    const al = Math.sin(Math.PI * t) * a;
    withAlpha(g, al, () => { text(g, i % 2 ? '♪' : '♫', px, py, 44, { k: 'sans', col, glow: '#FFFFFF', gr: 10 }); });
  }
}
/* 花瓣、槐花、樱花：从 box 上面飘下来，被风往 vx 方向吹 */
function petals(g, s, n, box, cols, o = {}) {
  for (const p of floaters(s, o.seed || 91, n, box, { vy: -(o.vy ?? 70), vx: o.vx ?? 60, amp: 30, wob: 1.2 })) {
    const c = cols[p.i % cols.length], r = (o.size || 9) * (.6 + p.sz * .8);
    g.save(); g.translate(p.x, p.y); g.rotate(s * (1 + p.sz) * 2 + p.ph); g.scale(1, .5 + .5 * Math.sin(s * 3 + p.ph));
    g.globalAlpha *= o.a ?? 1; ell(g, 0, 0, r, r * .6); g.fillStyle = c; g.fill(); g.restore();
  }
}
function snowfall(g, s, n, box, a = 1) {
  for (const p of floaters(s, 93, n, box, { vy: -60, vx: 15, amp: 24, wob: .8 })) { circ(g, p.x, p.y, 2 + p.sz * 4); g.fillStyle = `rgba(255,255,255,${a * (.6 + .4 * p.tw)})`; g.fill(); }
}
function rainbow(g, x, y, r, a = 1) {
  if (a <= .01) return;
  const cols = ['#FF6A6A', '#FFAA5A', '#FFE36A', '#7ED67A', '#6AB8FF', '#8E7AE6'];
  g.save(); g.globalAlpha *= a * .55; g.globalCompositeOperation = 'screen';
  cols.forEach((c, i) => { g.beginPath(); g.arc(x, y, r - i * 18, Math.PI, 0); g.strokeStyle = c; g.lineWidth = 18; g.stroke(); });
  g.restore();
}
/* 满天的试卷：从楼上撒下来，翻着飞 */
function flyingPapers(g, s, s0, n, o = {}) {
  const k = s - s0; if (k < 0) return;
  for (let i = 0; i < n; i++) {
    const t0 = hash(i, 71) * (o.spread ?? 1.2), kk = k - t0; if (kk < 0) continue;
    const x0 = (o.x0 ?? 200) + hash(i, 72) * (o.w ?? 1500), y0 = (o.y0 ?? 200) + hash(i, 73) * 300;
    const vx = (hash(i, 74) - .3) * 260 + (o.wind ?? 120), x = x0 + vx * kk + Math.sin(kk * 2 + i) * 60;
    const y = y0 - 260 * Math.exp(-kk * 1.2) + kk * (70 + hash(i, 75) * 60) + 120 * (1 - Math.exp(-kk * 1.2));
    if (y > H + 100 || x < -100 || x > W + 100) continue;
    const sz = (36 + hash(i, 76) * 30) * (o.k ?? 1);
    g.save(); g.translate(x, y); g.rotate(kk * (1.5 + hash(i, 77) * 3) + i); g.scale(Math.cos(kk * 3 + i), 1);
    g.fillStyle = '#FBFBF6'; g.fillRect(-sz / 2, -sz * .7, sz, sz * 1.4);
    g.fillStyle = 'rgba(80,90,110,.4)'; for (let j = 0; j < 5; j++) g.fillRect(-sz * .4, -sz * .55 + j * sz * .24, sz * (.5 + hash(i, j) * .3), 2);
    g.restore();
  }
}
/* 横幅：红底黄字 */
function banner(g, x, y, w, h, str, o = {}) {
  g.save(); g.translate(x, y); if (o.rot) g.rotate(o.rot);
  const sag = o.sag ?? 0;
  g.beginPath(); g.moveTo(-w / 2, -h / 2); g.quadraticCurveTo(0, -h / 2 + sag, w / 2, -h / 2); g.lineTo(w / 2, h / 2); g.quadraticCurveTo(0, h / 2 + sag, -w / 2, h / 2); g.closePath();
  g.fillStyle = o.bg || '#D63A2E'; g.fill();
  text(g, str, 0, sag * .5, h * .56, { k: o.k || 'serifX', col: o.col || '#FFE9A8', ls: o.ls ?? 6 });
  g.restore();
}
/* 拍立得 / 照片：draw(gg, w, h) 画照片里面 */
function photo(g, x, y, w, h, draw, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.globalAlpha *= o.alpha ?? 1;
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-w / 2 + 8, -h / 2 + 10, w + 0, h + (o.pola ? h * .2 : 0));
  const pad = o.pad ?? w * .05;
  g.fillStyle = '#FFFEF8'; g.fillRect(-w / 2 - pad, -h / 2 - pad, w + pad * 2, h + pad * 2 + (o.pola ? h * .18 : 0));
  g.save(); g.beginPath(); g.rect(-w / 2, -h / 2, w, h); g.clip(); g.translate(-w / 2, -h / 2); draw(g, w, h); g.restore();
  if (o.caption) text(g, o.caption, 0, h / 2 + h * .1, h * .08, { k: 'hand', col: '#4A4458' });
  g.restore();
}
/* 粉笔头：从讲台飞到他的头上，划一道弧线 */
function chalkPiece(g, x, y, ang) { g.save(); g.translate(x, y); g.rotate(ang); rr(g, -14, -5, 28, 10, 4); g.fillStyle = '#FAFAF4'; g.fill(); g.restore(); }
/* 铅笔写的字（手写体，带一点歪） */
function pencil(g, str, x, y, px, o = {}) { text(g, str, x, y, px, { k: 'hand', col: o.col || 'rgba(60,56,70,.85)', align: o.align || 'center', rot: o.rot ?? -.03, alpha: o.alpha ?? 1, ls: o.ls ?? 1 }); }
/* 一页纸（俯视）：横线、页边 */
function paperSheet(g, x, y, w, h, o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot || 0);
  g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(-w / 2 + 10, -h / 2 + 12, w, h);
  g.fillStyle = o.col || '#FBF8EE'; g.fillRect(-w / 2, -h / 2, w, h);
  if (o.lines !== false) { g.strokeStyle = 'rgba(120,150,200,.35)'; g.lineWidth = 2; for (let yy = -h / 2 + 60; yy < h / 2; yy += 44) { g.beginPath(); g.moveTo(-w / 2 + 20, yy); g.lineTo(w / 2 - 20, yy); g.stroke(); } g.strokeStyle = 'rgba(220,120,120,.4)'; g.beginPath(); g.moveTo(-w / 2 + 70, -h / 2); g.lineTo(-w / 2 + 70, h / 2); g.stroke(); }
  if (o.draw) o.draw(g, w, h);
  g.restore();
}
/* 素描本里那张画：铅笔画的十七岁的他，低着头说话。o.talk 0..1 线条跟着说话轻轻动；o.caption 0..1 底下那行字露出来多少 */
function sketchOfHim(g, s, x, y, w, o = {}) {
  const h = w * 1.3;
  g.save(); g.translate(x, y); g.rotate(o.rot || 0);
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(-w / 2 + 12, -h / 2 + 14, w, h);
  g.fillStyle = '#F8F4E8'; g.fillRect(-w / 2, -h / 2, w, h);
  // 纸纹
  g.globalAlpha *= .25; g.drawImage(TEX.paper, -w / 2, -h / 2, w, h); g.globalAlpha /= .25;
  const u = w * .16, jit = (i) => (o.talk ? Math.sin(s * 9 + i) * u * .015 * o.talk : 0);
  const pen = (lw = 2.2) => { g.strokeStyle = 'rgba(60,58,70,.85)'; g.lineWidth = lw * w / 500; g.lineCap = 'round'; g.lineJoin = 'round'; };
  const cx = 0, cy = -h * .08, nod = (o.talk ? Math.sin(s * 4.5) * .03 * o.talk : 0) + .12;
  g.save(); g.translate(cx, cy); g.rotate(nod);
  pen(2.6);
  // 脸（正面，低着头：眼睛往下看）
  g.beginPath(); g.moveTo(-u, -.2 * u); g.quadraticCurveTo(-u, .8 * u + jit(1), 0, 1.1 * u); g.quadraticCurveTo(u, .8 * u + jit(2), u, -.2 * u); g.stroke();
  // 头发（乱乱的几笔）
  g.beginPath(); g.moveTo(-1.08 * u, .05 * u); g.quadraticCurveTo(-1.25 * u, -1.2 * u, -.1 * u, -1.32 * u); g.lineTo(.05 * u, -1.5 * u); g.lineTo(.2 * u, -1.28 * u); g.lineTo(.55 * u, -1.36 * u); g.quadraticCurveTo(1.25 * u, -1.0 * u, 1.08 * u, .05 * u); g.stroke();
  for (let i = 0; i < 7; i++) { g.beginPath(); g.moveTo(-.8 * u + i * .26 * u, -1.0 * u + jit(i + 5)); g.quadraticCurveTo(-.7 * u + i * .26 * u, -.6 * u, -.75 * u + i * .27 * u, -.38 * u); g.stroke(); }
  // 眼睛往下看、眉毛、鼻子、嘴（说话时一张一合）
  for (const sx of [-1, 1]) { g.beginPath(); g.arc(sx * .4 * u, .1 * u, .16 * u, .3, Math.PI - .3); g.stroke(); g.beginPath(); g.moveTo(sx * .25 * u, -.28 * u); g.quadraticCurveTo(sx * .42 * u, -.36 * u, sx * .58 * u, -.3 * u); g.stroke(); }
  g.beginPath(); g.moveTo(0, .35 * u); g.lineTo(-.04 * u, .48 * u); g.stroke();
  const mo = o.talk ? (.5 + .5 * Math.sin(s * 11)) * o.talk : 0;
  g.beginPath(); g.ellipse(0, .72 * u, .12 * u, .03 * u + mo * .07 * u, 0, 0, TAU); g.stroke();
  // 害羞的腮红斜线
  for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(sx * .62 * u + i * .07 * u, .3 * u); g.lineTo(sx * .55 * u + i * .07 * u, .42 * u); g.stroke(); }
  // 耳朵、脖子、校服领子
  g.beginPath(); g.arc(-1.02 * u, .1 * u, .2 * u, 1.2, 5); g.stroke(); g.beginPath(); g.arc(1.02 * u, .1 * u, .2 * u, -1.9, 1.9); g.stroke();
  g.beginPath(); g.moveTo(-.3 * u, 1.05 * u); g.lineTo(-.3 * u, 1.6 * u); g.moveTo(.3 * u, 1.05 * u); g.lineTo(.3 * u, 1.6 * u); g.stroke();
  g.beginPath(); g.moveTo(-.65 * u, 1.45 * u); g.lineTo(-.55 * u, 1.9 * u); g.quadraticCurveTo(0, 2.1 * u, .55 * u, 1.9 * u); g.lineTo(.65 * u, 1.45 * u); g.moveTo(-2.0 * u, 2.9 * u); g.quadraticCurveTo(-1.9 * u, 1.75 * u, -.65 * u, 1.6 * u); g.moveTo(2.0 * u, 2.9 * u); g.quadraticCurveTo(1.9 * u, 1.75 * u, .65 * u, 1.6 * u); g.stroke();
  // 排线阴影
  pen(1.2); for (let i = 0; i < 10; i++) { g.beginPath(); g.moveTo(-1.9 * u + i * .12 * u, 2.2 * u); g.lineTo(-1.6 * u + i * .12 * u, 2.8 * u); g.stroke(); }
  g.restore();
  // 角落里画了一只像素小怪
  monDoodle(g, w * .33, -h * .38, w * .012, 'rgba(60,58,70,.7)', 1.6 * w / 500, 7);
  // 底下那行字
  const cap = o.caption ?? 0;
  if (cap > 0) {
    g.save(); g.beginPath(); g.rect(-w / 2, h * .3, w * cap, h * .2); g.clip();
    text(g, o.captionText || '我喜欢你', 0, h * .38, w * .1, { k: 'hand', col: 'rgba(60,56,70,.85)', rot: -.03, ls: 4 });
    text(g, '2018.6', w * .32, h * .45, w * .045, { k: 'hand', col: 'rgba(60,56,70,.6)' });
    g.restore();
  }
  g.restore();
}
/* 世界地图（挂在墙上）：几块大陆 + 他想象的航线 */
function worldMap(g, s, x, y, w, h, o = {}) {
  g.save(); g.translate(x, y);
  g.fillStyle = '#F6EFD8'; g.fillRect(-w / 2 - 12, -h / 2 - 12, w + 24, h + 24);
  g.fillStyle = vgrad(g, -h / 2, h / 2, [[0, '#8EC6E8'], [1, '#6AAED8']]); g.fillRect(-w / 2, -h / 2, w, h);
  const land = [[-.32, -.12, .16, .2], [-.25, .22, .08, .18], [.02, -.15, .1, .14], [.06, .15, .1, .2], [.28, -.12, .2, .18], [.38, .28, .07, .06], [-.1, -.38, .1, .06]];
  land.forEach(([lx, ly, rx, ry], i) => { g.beginPath(); for (let a = 0; a < TAU; a += .3) { const r = 1 + (noise1(a * 2 + i * 5, i) * .35); g.lineTo(lx * w + Math.cos(a) * rx * w * r, ly * h + Math.sin(a) * ry * h * r * 1.6); } g.closePath(); g.fillStyle = ['#A8D08A', '#C8D890', '#E8D49A'][i % 3]; g.fill(); });
  // 航线：从中国出发的虚线，上面一只小纸飞机
  const home = [.3 * w, -.08 * h];
  (o.routes || []).forEach(([tx, ty, t0], i) => {
    const u = clamp((s - t0) / 1.2); if (u <= 0) return;
    const to = [tx * w, ty * h], mid = [(home[0] + to[0]) / 2, Math.min(home[1], to[1]) - h * .22];
    g.setLineDash([10, 10]); g.strokeStyle = 'rgba(255,255,255,.9)'; g.lineWidth = 4; g.beginPath();
    for (let v = 0; v <= u + .001; v += .05) { const px = (1 - v) * (1 - v) * home[0] + 2 * (1 - v) * v * mid[0] + v * v * to[0], py = (1 - v) * (1 - v) * home[1] + 2 * (1 - v) * v * mid[1] + v * v * to[1]; v ? g.lineTo(px, py) : g.moveTo(px, py); }
    g.stroke(); g.setLineDash([]);
    const px = (1 - u) * (1 - u) * home[0] + 2 * (1 - u) * u * mid[0] + u * u * to[0], py = (1 - u) * (1 - u) * home[1] + 2 * (1 - u) * u * mid[1] + u * u * to[1];
    paperPlane(g, px, py, 16, Math.atan2(to[1] - mid[1], to[0] - mid[0]) * (u > .5 ? 1 : .5));
  });
  circ(g, home[0], home[1], 8); g.fillStyle = '#E83A3A'; g.fill();
  g.restore();
}
/* 一摞气球、彩带（元旦晚会） */
function balloons(g, s, x, y, n, o = {}) {
  const cols = ['#FF7A8A', '#FFD25A', '#7AC8FF', '#9AE08A', '#C9A2FF'];
  for (let i = 0; i < n; i++) {
    const bx = x + (hash(i, 51) - .5) * (o.w ?? 300), by = y - hash(i, 52) * (o.h ?? 120) + Math.sin(s * 1.8 + i) * 8;
    g.strokeStyle = 'rgba(255,255,255,.7)'; g.lineWidth = 1.5; g.beginPath(); g.moveTo(bx, by + 40); g.quadraticCurveTo(bx + 10, by + 90, x, y + 120); g.stroke();
    ell(g, bx, by, 32, 40); g.fillStyle = cols[i % 5]; g.fill(); ell(g, bx - 10, by - 14, 8, 12); g.fillStyle = 'rgba(255,255,255,.5)'; g.fill();
  }
}
/* 拉花：一串彩色三角旗挂在两点之间 */
function bunting(g, s, x0, y0, x1, y1, sag = 60) {
  const n = Math.floor(Math.hypot(x1 - x0, y1 - y0) / 50);
  const cols = ['#FF7A8A', '#FFD25A', '#7AC8FF', '#9AE08A', '#C9A2FF'];
  g.strokeStyle = 'rgba(255,255,255,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag * 2, x1, y1); g.stroke();
  for (let i = 0; i < n; i++) {
    const u = (i + .5) / n, px = (1 - u) * (1 - u) * x0 + 2 * (1 - u) * u * (x0 + x1) / 2 + u * u * x1, py = (1 - u) * (1 - u) * y0 + 2 * (1 - u) * u * ((y0 + y1) / 2 + sag * 2) + u * u * y1;
    const sw = Math.sin(s * 3 + i) * .15;
    g.save(); g.translate(px, py); g.rotate(sw); g.beginPath(); g.moveTo(-16, 0); g.lineTo(16, 0); g.lineTo(0, 34); g.closePath(); g.fillStyle = cols[i % 5]; g.fill(); g.restore();
  }
}
/* 校服背上的签名：几行马克笔写的字和涂鸦 */
const SIGNS = [['前程似锦', '#2E5E9E', -.1], ['毕业快乐！', '#C8382E', .08], ['老王到此一游', '#2E7A4A', -.05], ['常联系', '#8E3E7A', .12], ['苟富贵 勿相忘', '#D9902E', -.14]];
function signatures(g, u, n = 5, a = 1) {
  SIGNS.slice(0, n).forEach(([str, col, rot], i) => {
    const px = (-1.2 + (i % 2) * 1.1) * u + (i > 3 ? .3 * u : 0), py = (2.1 + Math.floor(i / 2) * .62) * u;
    text(g, str, px + .5 * u, py, .36 * u, { k: 'hand', col, rot, alpha: a });
  });
}
