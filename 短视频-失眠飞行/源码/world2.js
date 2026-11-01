'use strict';
/* world2.js：副歌里梦到的地方。会发光的森林、海底、云海上的日出日落、格林威治天文台、钟表隧道、教堂、广场上的人海。 */

/* ---------------- 会发光的森林 ----------------
   cx：镜头往右走了多少；o.deer：鹿出现的程度 0..1 */
function glowForest(g, s, cx, o = {}) {
  g.fillStyle = vgrad(g, 0, H, [[0, '#03101C'], [.55, '#082733'], [1, '#0D3A3C']]); g.fillRect(0, 0, W, H);
  glow(g, 1300 - cx * .05, 260, 700, '#3FA8A0', .25);
  stars(g, s, cx * .02, 120, .35, .4);
  treeRow(g, s, cx * .22, { seed: 11, tw: 210, col: '#0D2E3A', h0: 520, h1: 760, yb: 930, glowA: .18, lw: .55 });
  fogLayer(g, s, '#2E7A7A', 380, 1000, .35, 12, 0, 2.2);
  treeRow(g, s, cx * .5, { seed: 12, tw: 300, col: '#072029', h0: 640, h1: 900, yb: 1000, glowA: .45, lw: .8, vines: true });
  fogLayer(g, s, '#3A9A8E', 600, 1080, .22, 20, 1, 2.0);
  // 鹿：右边小坡上，角会发光
  if (o.deer > 0) deer(g, 1500 - (cx - (o.deerX0 ?? cx)) * .5, 860, 1.1, s, o.deer);
  // 地面、蘑菇
  g.fillStyle = '#04141A'; g.beginPath(); g.moveTo(0, H); for (let x = 0; x <= W; x += 40) g.lineTo(x, 930 + Math.sin((x + cx * .9) * .006) * 26 + noise1((x + cx * .9) * .01, 5) * 18); g.lineTo(W, H); g.fill();
  const tw = 160, i0 = Math.floor(cx * .9 / tw) - 1;
  for (let i = i0; i < i0 + W / tw + 3; i++) {
    const mx = i * tw - cx * .9 + hash(i, 31) * tw, n = 1 + Math.floor(hash(i, 32) * 3);
    for (let j = 0; j < n; j++) mushroom(g, mx + j * 26, 950 + hash(i, j) * 30, 10 + hash(i, j, 3) * 16, hash(i, j, 4) < .5 ? '#FF8AD8' : '#6FE8FF', s + i);
  }
  // 萤火虫
  for (const p of floaters(s, 21, 70, [0, 150, W, 1050], { vy: 14, vx: -40, amp: 40, wob: .9 })) {
    const a = .25 + .75 * p.tw, col = p.i % 4 ? '#C8FF8A' : '#8AF4FF';
    g.fillStyle = rgba(col, a); circ(g, p.x, p.y, 2 + p.sz * 1.5); g.fill(); glow(g, p.x, p.y, 16 + p.sz * 10, col, a * .7);
  }
  // 最前面的大树干和蕨叶（虚一点）
  treeRow(g, s, cx * 1.35, { seed: 13, tw: 760, col: '#010A0E', h0: 1200, h1: 1300, yb: 1120, glowA: .6, lw: 1.6, noCrown: true });
  ferns(g, s, cx * 1.6);
}
function treeRow(g, s, x, o) {
  const tw = o.tw, i0 = Math.floor(x / tw) - 1;
  for (let i = i0; i < i0 + W / tw + 3; i++) {
    const tx = i * tw - x + hash(i, o.seed) * tw * .6, th = o.h0 + hash(i, o.seed + 1) * (o.h1 - o.h0), tw2 = (26 + hash(i, o.seed + 2) * 30) * o.lw;
    const top = o.yb - th;
    g.fillStyle = o.col;
    g.beginPath(); g.moveTo(tx - tw2 * .6, o.yb); g.lineTo(tx - tw2 * .35, top + 40); g.lineTo(tx + tw2 * .35, top + 40); g.lineTo(tx + tw2 * .7, o.yb); g.fill();
    // 树根
    g.beginPath(); g.moveTo(tx - tw2 * 1.6, o.yb); g.quadraticCurveTo(tx - tw2 * .6, o.yb - 40, tx - tw2 * .4, o.yb - 120); g.lineTo(tx + tw2 * .4, o.yb - 120); g.quadraticCurveTo(tx + tw2 * .6, o.yb - 40, tx + tw2 * 1.7, o.yb); g.fill();
    if (!o.noCrown) {
      for (let k = 0; k < 9; k++) { const a = k / 9 * TAU, r = (90 + hash(i, k, o.seed) * 70) * o.lw; circ(g, tx + Math.cos(a) * r * 1.2, top + 20 + Math.sin(a) * r * .55, r * .75); g.fill(); }
      // 发光的叶子
      for (let k = 0; k < 7; k++) {
        const lx = tx + (hash(i, k, 7) - .5) * 260 * o.lw, ly = top + (hash(i, k, 8) - .3) * 140 * o.lw, col = hash(i, k, 9) < .6 ? '#5FFFE0' : '#B6FF7A';
        const tw_ = .6 + .4 * Math.sin(s * 1.6 + i + k);
        glow(g, lx, ly, (40 + hash(i, k, 10) * 60) * o.lw, col, o.glowA * tw_);
        g.fillStyle = rgba(col, .55 * o.glowA * tw_ + .1); circ(g, lx, ly, 3 * o.lw); g.fill();
      }
    }
    if (o.vines) for (let k = 0; k < 3; k++) {
      const vx = tx + (hash(i, k, 12) - .5) * 220, vl = 80 + hash(i, k, 13) * 220, sw = Math.sin(s * 1.2 + i + k) * 8;
      g.strokeStyle = o.col; g.lineWidth = 3; g.beginPath(); g.moveTo(vx, top + 40); g.quadraticCurveTo(vx + sw, top + 40 + vl / 2, vx + sw * 1.5, top + 40 + vl); g.stroke();
      glow(g, vx + sw * 1.5, top + 46 + vl, 18, '#8AF4FF', .8); g.fillStyle = '#DFFFFF'; circ(g, vx + sw * 1.5, top + 46 + vl, 4); g.fill();
    }
  }
}
function mushroom(g, x, y, r, col, s) {
  g.fillStyle = '#C9E8E0'; g.fillRect(x - r * .18, y - r * 1.1, r * .36, r * 1.1);
  g.fillStyle = col; g.beginPath(); g.ellipse(x, y - r * 1.1, r, r * .62, 0, Math.PI, 0); g.fill();
  glow(g, x, y - r * 1.1, r * 3.5, col, .45 + .2 * Math.sin(s * 2));
}
function ferns(g, s, x) {
  g.fillStyle = '#010608';
  for (const [bx, sgn] of [[-((x * .2) % 600) - 100, 1], [W + 120 - ((x * .2) % 700), -1]]) {
    for (let k = 0; k < 6; k++) {
      const ang = -Math.PI / 2 + sgn * (.2 + k * .22) + Math.sin(s * 1.3 + k) * .03, L = 300 + k * 30;
      g.save(); g.translate(bx, H + 30); g.rotate(ang + Math.PI / 2);
      g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(sgn * 60, -L * .5, 0, -L); g.quadraticCurveTo(-sgn * 10, -L * .5, 0, 0); g.fill();
      for (let j = 1; j < 9; j++) { const yy = -L * j / 10; g.beginPath(); g.ellipse(sgn * 20, yy, 34 - j * 2.5, 9, sgn * .5, 0, TAU); g.fill(); g.beginPath(); g.ellipse(-sgn * 14, yy, 28 - j * 2.5, 8, -sgn * .5, 0, TAU); g.fill(); }
      g.restore();
    }
  }
}
function deer(g, x, y, k, s, a = 1) {
  withAlpha(g, a, () => {
    g.save(); g.translate(x, y); g.scale(k, k); g.fillStyle = '#020A10';
    ell(g, 0, -90, 70, 34); g.fill();
    g.beginPath(); g.moveTo(-50, -100); g.lineTo(-80, -170); g.lineTo(-60, -176); g.lineTo(-30, -100); g.fill();
    ell(g, -82, -176, 22, 13, -.4); g.fill();
    for (const lx of [-40, -20, 30, 50]) g.fillRect(lx, -66, 9, 66);
    g.strokeStyle = '#7FF6FF'; g.lineWidth = 4; g.lineCap = 'round';
    g.shadowColor = '#7FF6FF'; g.shadowBlur = 18;
    for (const sgn of [-1, 1]) { g.beginPath(); g.moveTo(-80, -186); g.quadraticCurveTo(-80 + sgn * 30, -230, -80 + sgn * 18, -270); g.moveTo(-80 + sgn * 12, -215); g.lineTo(-80 + sgn * 40, -232); g.moveTo(-80 + sgn * 16, -245); g.lineTo(-80 + sgn * 34, -262); g.stroke(); }
    g.restore();
    glow(g, x - 80 * k, y - 230 * k, 120 * k, '#7FF6FF', .5 * a);
  });
}

/* ---------------- 海底 ---------------- */
function underwater(g, s, o = {}) {
  g.fillStyle = vgrad(g, 0, H, [[0, '#2A8CBC'], [.35, '#13507E'], [1, '#061736']]); g.fillRect(0, 0, W, H);
  // 水面的波光
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let j = 0; j < 3; j++) {
    g.strokeStyle = `rgba(190,240,255,${.22 - j * .06})`; g.lineWidth = 3;
    g.beginPath();
    for (let x = 0; x <= W; x += 12) { const y = 30 + j * 26 + Math.sin(x * .012 + s * 1.6 + j) * 9 + Math.sin(x * .031 - s * 2.2) * 5; x ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }
  // 光柱
  for (let i = 0; i < 8; i++) {
    const x = 120 + i * 240 + Math.sin(s * .3 + i) * 60, w = 70 + hash(i, 5) * 90, a = .08 + .06 * Math.sin(s * .7 + i * 2);
    g.fillStyle = lgrad(g, x, 0, x - 300, H, [[0, `rgba(200,245,255,${a})`], [1, 'rgba(200,245,255,0)']]);
    g.beginPath(); g.moveTo(x, 0); g.lineTo(x + w, 0); g.lineTo(x + w - 380, H); g.lineTo(x - 380, H); g.fill();
  }
  g.restore();
  // 鲸鱼（远处慢慢游过）
  if (o.whale !== false) whale(g, (o.whaleX ?? 1400) - s * 60 % 4000 * 0, o.whaleY ?? 560, o.whaleK ?? 1.3, s, o.whaleA ?? .85);
  // 鱼群
  for (let i = 0; i < 46; i++) {
    const ph = s * .5 + i * .13, fx = ((hash(i, 40) * W * 1.3 + s * 140 + Math.sin(ph) * 40) % (W + 200)) - 100, fy = 300 + Math.sin(i * .7 + s * .8) * 40 + hash(i, 41) * 120 + Math.sin(fx * .005 + s) * 30;
    g.save(); g.translate(fx, fy); g.fillStyle = 'rgba(190,225,255,.7)'; ell(g, 0, 0, 12, 4.5); g.fill(); g.beginPath(); g.moveTo(-10, 0); g.lineTo(-18, -5); g.lineTo(-18, 5); g.fill(); g.restore();
  }
  // 水母
  (o.jellies || [[300, 600, 1], [1600, 380, .8], [1150, 820, .65], [520, 260, .55]]).forEach(([jx, jy, jk], i) => jelly(g, jx + Math.sin(s * .5 + i) * 20, jy - ((s * 14 + i * 80) % 200) * .3, jk, s + i * .7, i % 2 ? '#FF9AD5' : '#B59BFF'));
  // 浮游的小点、泡泡
  for (const p of floaters(s, 44, 80, [0, 0, W, H], { vy: 20, amp: 12 })) { g.fillStyle = `rgba(210,240,255,${.15 + .3 * p.tw})`; circ(g, p.x, p.y, 1 + p.sz * 1.5); g.fill(); }
}
function whale(g, x, y, k, s, a = 1) {
  withAlpha(g, a, () => {
    g.save(); g.translate(x, y); g.scale(k, k);
    const tail = Math.sin(s * 1.4) * 22;
    g.fillStyle = '#0A2850';
    g.beginPath(); g.moveTo(260, 0);
    g.bezierCurveTo(240, -70, 80, -95, -60, -70); g.bezierCurveTo(-180, -50, -280, -20, -360, tail * .5);
    g.lineTo(-430, -40 + tail); g.lineTo(-410, tail * .7); g.lineTo(-440, 40 + tail); g.lineTo(-360, 12 + tail * .5);
    g.bezierCurveTo(-260, 40, -80, 70, 60, 64); g.bezierCurveTo(180, 58, 260, 40, 260, 0); g.fill();
    g.fillStyle = '#123A6A'; g.beginPath(); g.moveTo(240, 26); g.bezierCurveTo(120, 60, -60, 64, -200, 40); g.bezierCurveTo(-60, 50, 120, 44, 240, 26); g.fill();
    g.fillStyle = '#0A2850'; g.beginPath(); g.moveTo(120, 40); g.quadraticCurveTo(60, 140 + tail * .3, -10, 150 + tail * .4); g.quadraticCurveTo(50, 90, 70, 44); g.fill();
    g.fillStyle = '#9FD8FF'; circ(g, 200, -10, 5); g.fill();
    g.restore();
  });
}
function jelly(g, x, y, k, s, col) {
  const p = Math.sin(s * 2.6), sq = 1 + p * .12;
  g.save(); g.translate(x, y); g.scale(k, k);
  glow(g, 0, 0, 170, col, .45);
  g.strokeStyle = rgba(col, .55); g.lineWidth = 3; g.lineCap = 'round';
  for (let i = 0; i < 7; i++) { const tx = -42 + i * 14; g.beginPath(); g.moveTo(tx, 10); for (let j = 1; j <= 6; j++) g.lineTo(tx + Math.sin(s * 2 + j * .8 + i) * 8, 10 + j * 32); g.stroke(); }
  g.fillStyle = rgrad(g, 0, -20, 4, 70, [[0, rgba('#FFFFFF', .85)], [.4, rgba(col, .65)], [1, rgba(col, .15)]]);
  g.beginPath(); g.ellipse(0, 0, 56 * sq, 50 / sq, 0, Math.PI, 0);
  for (let i = 0; i <= 8; i++) g.lineTo(56 * sq - i * 14 * sq, 6 + (i % 2) * 8);
  g.closePath(); g.fill();
  g.restore();
}

/* ---------------- 云海上的一天 ----------------
   u：0 天还没亮 → .25 日出 → .5 中午 → .75 日落 → 1 夜里 */
const DAY = [
  [0, '#0B1240', '#3A3A7A', CLOUD.night], [.2, '#3A3F8A', '#F2A08E', CLOUD.dawn], [.34, '#4C86D0', '#F5D4A8', CLOUD.day],
  [.62, '#3F7CC8', '#B9D6F2', CLOUD.day], [.76, '#5A4C9E', '#FF9A6A', CLOUD.dusk], [.9, '#1C1E5E', '#8A4E8E', CLOUD.dusk], [1, '#0A1038', '#2E2E6E', CLOUD.night],
];
function dayAt(u) {
  for (let i = 1; i < DAY.length; i++) if (u <= DAY[i][0]) { const f = (u - DAY[i - 1][0]) / (DAY[i][0] - DAY[i - 1][0]); return { top: mixc(DAY[i - 1][1], DAY[i][1], f), bot: mixc(DAY[i - 1][2], DAY[i][2], f), palA: DAY[i - 1][3], palB: DAY[i][3], f }; }
  const l = DAY[DAY.length - 1]; return { top: l[1], bot: l[2], palA: l[3], palB: l[3], f: 0 };
}
function cloudSeaDay(g, s, u, o = {}) {
  const d = dayAt(u);
  g.fillStyle = vgrad(g, 0, 720, [[0, d.top], [1, d.bot]]); g.fillRect(0, 0, W, H);
  const dark = 1 - clamp(Math.min(seg(u, .12, .26), 1 - seg(u, .82, .95)));
  stars(g, s, 0, 0, dark * .9);
  // 太阳：从左边升起，划一道弧，右边落下
  const su = seg(u, .2, .8), sx = lerp(220, 1700, su), sy = 640 - Math.sin(Math.PI * su) * 520;
  if (su > 0 && su < 1) {
    const sc = mixc('#FF8A4A', '#FFF6D8', Math.sin(Math.PI * su));
    glow(g, sx, sy, 460, sc, .38); glow(g, sx, sy, 150, '#FFF2CF', .6);
    g.fillStyle = sc; circ(g, sx, sy, 62); g.fill();
  }
  if (u > .86) moon(g, 1500, 220, 70, { a: seg(u, .86, .96) });
  // 云海
  for (let row = 0; row < 3; row++) for (let i = 0; i < 6; i++) {
    const w = 900 + hash(i, row, 7) * 400, x = ((i * 380 + row * 170 - s * (12 + row * 10)) % (W + w) + W + w) % (W + w) - w / 2, y = 700 + row * 110 + hash(i, row, 8) * 40;
    cloud(g, i + row * 3, x, y, w, d.palA, 1);
    if (d.f > 0 && d.palB !== d.palA) cloud(g, i + row * 3, x, y, w, d.palB, d.f);
  }
  return { sx, sy, su };
}

/* ---------------- 格林威治天文台 ----------------
   夜里的小山坡，红砖楼和白色的圆顶，桅杆上的红色报时球；一道绿色的激光沿着本初子午线射向天空。 */
function observatory(g, s, o = {}) {
  skyGrad(g, SKY.night);
  stars(g, s, 900, 0, .9);
  moon(g, 300, 200, 60, { haloA: .5 });
  const x = o.x ?? 1100, y = o.y ?? 760, k = o.k ?? 1;
  // 子午线激光
  const la = o.laser ?? 1;
  if (la > 0) {
    g.save(); g.globalCompositeOperation = 'lighter';
    g.strokeStyle = `rgba(90,255,140,${.75 * la})`; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 40 * k, y - 330 * k); g.lineTo(x + 600 * k, -40); g.stroke();
    g.strokeStyle = `rgba(90,255,140,${.18 * la})`; g.lineWidth = 16; g.stroke();
    g.restore();
  }
  // 山坡
  g.fillStyle = '#0E1636'; g.beginPath(); g.moveTo(0, H); g.lineTo(0, 880); g.quadraticCurveTo(700, 690, x + 200 * k, y + 40 * k); g.quadraticCurveTo(1700, 800, W, 860); g.lineTo(W, H); g.fill();
  g.save(); g.translate(x, y); g.scale(k, k);
  // 楼
  g.fillStyle = '#5A2E34'; g.fillRect(-300, -170, 420, 170); g.fillStyle = '#6E3A40'; g.fillRect(-300, -170, 420, 14);
  for (let i = 0; i < 5; i++) { g.fillStyle = hash(i, 3) < .6 ? '#FFD38A' : '#2A1820'; rr(g, -270 + i * 80, -130, 34, 60, 14); g.fill(); }
  g.fillStyle = '#4A262C'; g.fillRect(-20, -300, 140, 300);
  // 圆顶
  g.fillStyle = '#D9DDE6'; g.beginPath(); g.arc(50, -300, 86, Math.PI, 0); g.fill();
  g.fillStyle = 'rgba(80,90,130,.35)'; g.beginPath(); g.arc(50, -300, 86, Math.PI * 1.35, Math.PI * 1.65); g.lineTo(50, -300); g.fill();
  g.fillStyle = '#2A2E44'; g.fillRect(40, -386, 20, 86);
  // 桅杆和红色报时球
  g.fillStyle = '#C9C9D2'; g.fillRect(-212, -330, 6, 160);
  const ballY = -330 + (o.ball ?? 0) * 120;
  glow(g, -209, ballY, 50, '#FF4A4A', .7); g.fillStyle = '#E8303A'; circ(g, -209, ballY, 18); g.fill();
  g.restore();
  // 地上的子午线：从楼前一直延伸过来
  g.save(); g.globalCompositeOperation = 'lighter';
  g.strokeStyle = 'rgba(200,255,220,.8)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 40 * k, y); g.lineTo(x - 220 * k, H + 20); g.stroke();
  g.strokeStyle = 'rgba(120,255,170,.25)'; g.lineWidth = 18; g.stroke();
  g.restore();
}

/* ---------------- 钟表隧道 ----------------
   u：往里飞了多远；一圈圈表盘从中间冲出来，指针乱转 */
const ROMAN = ['XII', 'I', 'II', 'III', 'IIII', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI'];
function clockTunnel(g, s, u, o = {}) {
  const cx = o.cx ?? W / 2, cy = o.cy ?? H / 2;
  g.fillStyle = rgrad(g, cx, cy, 0, 1200, [[0, '#2A1E5E'], [.5, '#120E36'], [1, '#05040F']]); g.fillRect(0, 0, W, H);
  // 放射状的光线
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 60; i++) {
    const a = hash(i, 1) * TAU, d0 = ((hash(i, 2) + u * 2.5) % 1), r0 = 80 + d0 * d0 * 1400, len = 60 + d0 * 400;
    g.strokeStyle = `rgba(255,230,190,${.35 * d0})`; g.lineWidth = 1 + d0 * 3;
    g.beginPath(); g.moveTo(cx + Math.cos(a) * r0, cy + Math.sin(a) * r0); g.lineTo(cx + Math.cos(a) * (r0 + len), cy + Math.sin(a) * (r0 + len)); g.stroke();
  }
  g.restore();
  // 表盘：远的先画
  const N = 9;
  const rings = [];
  for (let i = 0; i < N; i++) { const z = ((i / N - u * 1.6) % 1 + 1) % 1; rings.push([z, i]); }
  rings.sort((a, b) => a[0] - b[0]);
  for (const [z, i] of rings) {
    const sc = .08 + Math.pow(z, 2.2) * 3.2, r = 240 * sc, a = clamp(z * 3) * clamp((1 - z) * 6);
    if (a <= .01) continue;
    withAlpha(g, a, () => {
      g.save(); g.translate(cx, cy); g.rotate(i * .5 + s * .2 * (i % 2 ? 1 : -1));
      g.strokeStyle = '#E8D4A8'; g.lineWidth = Math.max(1, 6 * sc); circ(g, 0, 0, r); g.stroke();
      g.strokeStyle = 'rgba(232,212,168,.4)'; g.lineWidth = Math.max(1, 2 * sc); circ(g, 0, 0, r * .86); g.stroke();
      g.fillStyle = '#F4E6C8'; g.font = F(Math.max(6, 34 * sc), 'serif'); g.textAlign = 'center'; g.textBaseline = 'middle';
      for (let h = 0; h < 12; h++) { const ang = h / 12 * TAU; g.save(); g.translate(Math.sin(ang) * r * .74, -Math.cos(ang) * r * .74); g.rotate(ang); g.fillText(ROMAN[h], 0, 0); g.restore(); }
      const hs = s * (2 + i * .7) * (i % 2 ? 1 : -1);
      line(g, 0, 0, Math.sin(hs) * r * .5, -Math.cos(hs) * r * .5, '#F4E6C8', Math.max(1, 7 * sc));
      line(g, 0, 0, Math.sin(hs * 12) * r * .72, -Math.cos(hs * 12) * r * .72, '#F4E6C8', Math.max(1, 4 * sc));
      g.restore();
    });
  }
  glow(g, cx, cy, 220, '#FFE7C0', .6);
}

/* ---------------- 教堂里面 ----------------
   一点透视：两排柱子、尖拱、尽头一扇玫瑰窗；彩色的光从高窗斜着照下来，鸽子迎面飞过。z：往前走了多远 */
function cathedral(g, s, z, o = {}) {
  const vx = W / 2, vy = 470;
  g.fillStyle = vgrad(g, 0, H, [[0, '#0E0A22'], [.6, '#1C1236'], [1, '#2A1A3A']]); g.fillRect(0, 0, W, H);
  // 玫瑰窗
  const rw = 150;
  glow(g, vx, vy - 60, 520, '#B98AFF', .5);
  g.save(); g.translate(vx, vy - 60);
  const cols = ['#FF5A8A', '#5AC8FF', '#FFD25A', '#8AFF9E', '#B98AFF'];
  for (let i = 0; i < 16; i++) { const a0 = i / 16 * TAU + s * .05, a1 = a0 + TAU / 16; g.fillStyle = cols[i % 5]; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, rw, a0 + .02, a1 - .02); g.fill(); }
  g.fillStyle = '#F2E6FF'; circ(g, 0, 0, rw * .3); g.fill();
  g.strokeStyle = '#1C1236'; g.lineWidth = 8; circ(g, 0, 0, rw); g.stroke(); circ(g, 0, 0, rw * .62); g.stroke();
  g.restore();
  // 地砖
  g.save(); g.beginPath(); g.rect(0, vy + 40, W, H); g.clip();
  for (let k = 0; k < 30; k++) {
    const d = (k + 1 - (z % 1)), y = vy + 40 + 600 / d, y2 = vy + 40 + 600 / (d + 1);
    g.fillStyle = k % 2 ? '#2A1E40' : '#1E1530'; g.fillRect(0, y2, W, y - y2 + 1);
  }
  g.restore();
  // 柱子和拱：远的先画
  for (let k = 14; k >= 0; k--) {
    const d = (k + 1 - (z % 1)) * .9, sc = 1 / d;
    if (d < .25) continue;
    const off = 900 * sc, top = vy - 820 * sc, bot = vy + 40 + 600 * sc * 1.0;
    const a = clamp((d - .25) * 2);
    withAlpha(g, a, () => {
      for (const sgn of [-1, 1]) {
        const x = vx + sgn * off;
        g.fillStyle = mixc('#3A2A58', '#120C24', clamp(d / 8)); g.fillRect(x - 60 * sc, top, 120 * sc, bot - top);
        g.fillStyle = 'rgba(255,220,180,.08)'; g.fillRect(x - 60 * sc, top, 20 * sc, bot - top);
      }
      g.strokeStyle = mixc('#3A2A58', '#120C24', clamp(d / 8)); g.lineWidth = 50 * sc;
      g.beginPath(); g.moveTo(vx - off, top); g.quadraticCurveTo(vx - off * .2, top - 520 * sc, vx, top - 620 * sc); g.quadraticCurveTo(vx + off * .2, top - 520 * sc, vx + off, top); g.stroke();
    });
  }
  // 彩色的光柱
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) {
    const col = cols[i], x0 = 200 + i * 120 + Math.sin(s * .3 + i) * 20;
    g.fillStyle = lgrad(g, x0, 0, x0 + 700, H, [[0, rgba(col, .2)], [1, rgba(col, 0)]]);
    g.beginPath(); g.moveTo(x0, -20); g.lineTo(x0 + 90, -20); g.lineTo(x0 + 900, H); g.lineTo(x0 + 650, H); g.fill();
  }
  g.restore();
  // 蜡烛的光点
  for (let i = 0; i < 24; i++) { const x = (i % 2 ? vx + 220 : vx - 220) + (hash(i, 7) - .5) * 120, y = vy + 120 + hash(i, 8) * 80; glow(g, x, y, 22, '#FFC870', .6 + .3 * Math.sin(s * 8 + i)); }
}
/* 鸽子：翅膀一扇一扇 */
function dove(g, x, y, k, s, a = 1) {
  withAlpha(g, a, () => {
    const f = Math.sin(s * 14);
    g.save(); g.translate(x, y); g.scale(k, k); g.fillStyle = '#F4F2FF';
    ell(g, 0, 0, 26, 11); g.fill(); circ(g, 22, -6, 8); g.fill();
    g.beginPath(); g.moveTo(-6, -4); g.quadraticCurveTo(-10, -40 * f - 10, -40, -46 * f - 6); g.quadraticCurveTo(-20, -8, 8, -2); g.fill();
    g.beginPath(); g.moveTo(-24, 0); g.lineTo(-44, -8); g.lineTo(-44, 8); g.fill();
    g.restore();
  });
}

/* ---------------- 广场上的人海 ----------------
   远处是教堂的正面（玫瑰窗亮着），路灯，一排排行人的剪影在走动。返回每一排的地平线 y 给调用的人放主角 */
function plaza(g, s, o = {}) {
  skyGrad(g, SKY.night);
  stars(g, s, 1200, 0, .7);
  // 教堂正面
  const fx = o.churchX ?? 960;
  g.fillStyle = '#1A1838'; g.fillRect(fx - 300, 150, 600, 520);
  g.beginPath(); g.moveTo(fx - 300, 150); g.lineTo(fx, -20); g.lineTo(fx + 300, 150); g.fill();
  for (const sgn of [-1, 1]) { g.fillRect(fx + sgn * 380 - 70, 60, 140, 610); g.beginPath(); g.moveTo(fx + sgn * 380 - 80, 60); g.lineTo(fx + sgn * 380, -110); g.lineTo(fx + sgn * 380 + 80, 60); g.fill(); }
  glow(g, fx, 300, 260, '#C79BFF', .55);
  g.save(); g.translate(fx, 300);
  const cols = ['#FF5A8A', '#5AC8FF', '#FFD25A', '#8AFF9E', '#B98AFF'];
  for (let i = 0; i < 12; i++) { g.fillStyle = cols[i % 5]; g.beginPath(); g.moveTo(0, 0); g.arc(0, 0, 90, i / 12 * TAU, (i + 1) / 12 * TAU - .05); g.fill(); }
  g.fillStyle = '#F2E6FF'; circ(g, 0, 0, 26); g.fill(); g.restore();
  g.fillStyle = '#FFD38A'; rr(g, fx - 60, 520, 120, 150, 60); g.fill(); glow(g, fx, 600, 200, '#FFD38A', .4);
  // 地面
  g.fillStyle = vgrad(g, 640, H, [[0, '#24204A'], [1, '#100E26']]); g.fillRect(0, 640, W, H - 640);
  // 路灯
  for (const lx of [260, 1660]) { g.fillStyle = '#0C0B20'; g.fillRect(lx - 5, 420, 10, 300); circ(g, lx, 414, 16); g.fill(); glow(g, lx, 420, 260, '#FFD9A0', .5); glow(g, lx, 420, 50, '#FFF0D0', .9); }
}
/* 一排排的人：rows 从远到近；每排的人按 hash 排开，左右走动，上下点头 */
function crowdRows(g, s, rows, o = {}) {
  for (const [y, k, n, seed] of rows) {
    for (let i = 0; i < n; i++) {
      const dir_ = hash(i, seed) < .5 ? -1 : 1, sp = 30 + hash(i, seed, 1) * 40;
      const x = ((hash(i, seed, 2) * (W + 200) + dir_ * s * sp * k) % (W + 200) + W + 200) % (W + 200) - 100;
      if (o.gap && Math.abs(x - o.gap[0]) < o.gap[1] * k) continue;
      const bob = Math.abs(Math.sin(s * 5 + i)) * 4 * k, col = mixc('#2A2852', '#4A4678', hash(i, seed, 3) * .7) ;
      g.fillStyle = mixc(col, '#14122C', clamp(k - .5));
      circ(g, x, y - 112 * k - bob, 20 * k); g.fill();
      rr(g, x - 30 * k, y - 92 * k - bob, 60 * k, 100 * k, 22 * k); g.fill();
      g.fillStyle = 'rgba(200,190,255,.18)'; circ(g, x + 6 * k, y - 116 * k - bob, 14 * k); g.fill();
      if (hash(i, seed, 4) < .12) { glow(g, x + 14 * k, y - 70 * k - bob, 26 * k, '#9FC8FF', .6); }
    }
  }
}
