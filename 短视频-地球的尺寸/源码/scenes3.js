/* 第四章（橘子还是柠檬：两支远征队）、第五章（米的诞生）、结尾（尺子里的地球）、片尾。 */

const ORANGE = '#e8913a', LEMON = '#e3d45c';

// ======================= 第四章：橘子还是柠檬 =======================
// 扁度夸大的子午椭圆；φ 是地理纬度（法线方向）
const ELL = { cx: 760, cy: 560, a: 320, b: 260 };
function ellPoint(phi) {
  const { cx, cy, a, b } = ELL;
  const beta = Math.atan((b / a) * Math.tan(phi));
  return [cx + a * Math.cos(beta), cy - b * Math.sin(beta), beta];
}
function ellCurv(phi) {
  const { a, b } = ELL;
  const beta = Math.atan((b / a) * Math.tan(phi));
  return Math.pow(a * a * Math.sin(beta) ** 2 + b * b * Math.cos(beta) ** 2, 1.5) / (a * b);
}
function shapeCard(x, y, w, h, title, sub, alpha) {
  card(x, y, w, h, { alpha });
  text(title, x + 32, y + 56, { f: 'zh', size: 34, color: COL.gold, alpha });
  text(sub, x + 32, y + 92, { f: 'zhm', size: 22, color: COL.dim, alpha });
}
function squashedGlobe(cx, cy, R, sx, sy, rot, tint, tintA, alpha) {
  if (alpha <= 0.003) return;
  g.save(); g.translate(cx, cy); g.scale(sx, sy); g.translate(-cx, -cy);
  globe(cx, cy, R, rot, { alpha, tilt: 0.25 });
  if (tintA > 0.003) {
    g.globalAlpha *= alpha * tintA; g.fillStyle = tint; g.globalCompositeOperation = 'overlay';
    g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
    g.globalCompositeOperation = 'source-over'; g.globalAlpha = alpha * tintA * 0.5;
    g.strokeStyle = tint; g.lineWidth = 3 / Math.min(sx, sy); g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
  }
  g.restore();
}
SCENES.era4 = function (t) {
  const s = SCN.era4;
  // ---- 1. 圆球？ → 牛顿的橘子 / 卡西尼的柠檬 ----
  const sA = vis(t, s.t0 + 0.4, T('p5') + 0.1, 0.6);
  if (sA > 0.003) {
    const toL = E.inOut(seg(t, T('p2') - 0.1, T('p2') + 0.8));
    const cx = lerp(960, 560, toL), cy = lerp(520, 540, toL), R = lerp(250, 190, toL);
    const fl = E.inOut(seg(t, T('p2') + 1.0, T('p2') + 2.6));
    shapeCard(290, 230, 540, 590, '牛顿 · 1687', '地球在自转', toL * sA);
    squashedGlobe(cx, cy, R, 1 + 0.12 * fl, 1 - 0.16 * fl, t * (0.15 + 1.2 * fl), ORANGE, E.out(seg(t, T('p3'), T('p3') + 0.8)), sA);
    if (toL < 0.5) text('?', 1290, 470, { f: 'num', size: 90, color: COL.goldHi, alpha: sA * (1 - toL * 2) * E.out(seg(t, T('p1') + 0.4, T('p1') + 1.2)), align: 'center', glow: 20 });
    // 赤道被甩出去的箭头
    const ar = fl * sA;
    if (ar > 0.003) {
      for (const d of [-1, 1]) {
        const x0 = cx + d * R * 1.14, x1 = x0 + d * 50 * ar;
        line(x0, cy, x1, cy, ORANGE, 3, ar);
        line(x1, cy, x1 - d * 12, cy - 9, ORANGE, 3, ar); line(x1, cy, x1 - d * 12, cy + 9, ORANGE, 3, ar);
      }
      text('甩', cx + R * 1.14 + 70, cy - 20, { f: 'zhk', size: 34, color: ORANGE, alpha: ar });
    }
    const oA = E.out(seg(t, T('p3') + 0.2, T('p3') + 1.0)) * sA;
    text('扁球 · 像橘子', 560, 790, { f: 'zh', size: 34, color: ORANGE, alpha: oA, align: 'center' });
    // 卡西尼
    const cA = E.out(seg(t, T('p4') + 0.1, T('p4') + 0.9)) * sA;
    if (cA > 0.003) {
      shapeCard(1090, 230, 540, 590, '卡西尼家族', '巴黎天文台 · 实测', cA);
      const pl = E.inOut(seg(t, T('p4') + 0.6, T('p4') + 2.0));
      squashedGlobe(1360, 540, 190, 1 - 0.14 * pl, 1 + 0.12 * pl, t * 0.3, LEMON, pl, cA);
      text('长球 · 像柠檬', 1360, 790, { f: 'zh', size: 34, color: LEMON, alpha: cA * pl, align: 'center' });
      text('VS', 960, 548, { f: 'cap', size: 56, color: COL.ivory, alpha: 0.7 * cA, align: 'center' });
    }
  }
  // ---- 2. 子午椭圆：两支远征队 ----
  const mA = vis(t, T('p5') - 0.1, T('p11') - 0.2, 0.6);
  if (mA > 0.003) {
    const { cx, cy, a, b } = ELL;
    g.save(); g.globalAlpha *= mA;
    const body = g.createRadialGradient(cx, cy - 80, 30, cx, cy, a);
    body.addColorStop(0, '#1d2433'); body.addColorStop(1, '#0b0d12');
    g.fillStyle = body; g.beginPath(); g.ellipse(cx, cy, a, b, 0, 0, Math.PI * 2); g.fill();
    g.strokeStyle = 'rgba(227,194,122,0.7)'; g.lineWidth = 2; g.beginPath(); g.ellipse(cx, cy, a, b, 0, 0, Math.PI * 2); g.stroke();
    line(cx - a - 40, cy, cx + a + 40, cy, COL.ivory, 1, 0.25, [4, 6]);
    line(cx, cy - b - 40, cx, cy + b + 40, COL.ivory, 1, 0.25, [4, 6]);
    text('北极', cx, cy - b - 54, { f: 'zhm', size: 24, color: COL.dim, align: 'center' });
    text('赤道', cx - a - 50, cy - 10, { f: 'zhm', size: 24, color: COL.dim, align: 'right' });
    text('子午线剖面 · 扁度已夸大', cx, cy + b + 70, { f: 'zhm', size: 22, color: COL.dim, align: 'center' });
    const PTS = [
      { phi: 0, n: '秘鲁', sub: '赤道 · 布格、拉孔达明', c: COL.redHi, dx: 40, dy: 56 },
      { phi: 49 * D2R, n: '巴黎', sub: '北纬 49°', c: COL.ivory, dx: 76, dy: 18 },
      { phi: 66 * D2R, n: '拉普兰', sub: '北纬 66° · 莫佩尔蒂', c: COL.goldHi, dx: 60, dy: -46 },
    ];
    const lab = E.out(seg(t, T('p5') + 0.2, T('p5') + 1.0));
    PTS.forEach(p => {
      const [x, y] = ellPoint(p.phi);
      dot(x, y, 7, p.c, lab, 12);
      text(p.n, x + p.dx, y + 10 + p.dy, { f: 'zh', size: 30, color: p.c, alpha: lab });
      text(p.sub, x + p.dx, y + 42 + p.dy, { f: 'zhm', size: 21, color: COL.ivory, alpha: 0.6 * lab });
    });
    // 航线：从巴黎出发，一北一南
    const rp = E.inOut(seg(t, T('p6') + 0.1, T('p6') + 2.2));
    const route = (phi0, phi1, col) => {
      g.save(); g.strokeStyle = col; g.lineWidth = 2; g.setLineDash([6, 8]); g.beginPath();
      let last = null;
      for (let k = 0; k <= 40; k++) {
        const ph = lerp(phi0, phi1, k / 40 * rp);
        const [x, y] = ellPoint(ph);
        const n = [Math.cos(ph), -Math.sin(ph)];
        const off = 22 + Math.sin(Math.PI * k / 40) * 26;
        const px = x + n[0] * off, py = y + n[1] * off;
        if (!k) g.moveTo(px, py); else g.lineTo(px, py);
        last = [px, py];
      }
      g.stroke(); g.restore();
      if (rp > 0 && rp < 1) glowDot(last[0], last[1], 16, col);
    };
    if (rp > 0) { route(49 * D2R, 66 * D2R, COL.goldHi); route(49 * D2R, 0, COL.redHi); }
    // 曲率：同样「一度」，北边那段更长
    const wA = vis(t, T('p7') + 0.2, T('p9') + 0.2, 0.6);
    if (wA > 0.003) {
      const wedge = (phi, col, label) => {
        const [x, y] = ellPoint(phi), M = ellCurv(phi), dl = 7 * D2R;
        const n = [Math.cos(phi), -Math.sin(phi)];
        const c = [x - n[0] * M, y - n[1] * M];
        const u = E.out(seg(t, T('p7') + 0.3, T('p7') + 1.4));
        const a0 = Math.atan2(-Math.sin(phi - dl), Math.cos(phi - dl)), a1 = Math.atan2(-Math.sin(phi + dl), Math.cos(phi + dl));
        g.save(); g.globalAlpha *= wA * u * 0.22; g.fillStyle = col;
        g.beginPath(); g.moveTo(c[0], c[1]); g.arc(c[0], c[1], M, a1, a0); g.closePath(); g.fill(); g.restore();
        line(c[0], c[1], c[0] + Math.cos(a0) * M, c[1] + Math.sin(a0) * M, col, 1.2, wA * u * 0.8);
        line(c[0], c[1], c[0] + Math.cos(a1) * M, c[1] + Math.sin(a1) * M, col, 1.2, wA * u * 0.8);
        arcS(c[0], c[1], M, a1, a0, col, 6, wA * u);
        text(label, x + n[0] * 120, y + n[1] * 120 + 12, { f: 'zhk', size: 40, color: col, alpha: wA * u, align: 'center', glow: 10, glowColor: col });
      };
      wedge(66 * D2R, COL.goldHi, '长');
      wedge(0, COL.redHi, '短');
      text('同样的「一度」', 1330, 380, { f: 'zh', size: 34, color: COL.ivory, alpha: wA * E.out(seg(t, T('p7') + 0.8, T('p7') + 1.6)) });
      text('地面越平，弧就越长', 1330, 430, { f: 'zhm', size: 28, color: COL.gold, alpha: wA * E.out(seg(t, T('p7') + 1.2, T('p7') + 2.0)) });
    }
    // 远征用了多久
    const yA = vis(t, T('p8') + 0.1, T('p9') - 0.1, 0.5);
    if (yA > 0.003) {
      const X = y => lerp(1300, 1800, (y - 1735) / 10);
      line(X(1735), 700, X(1745), 700, COL.ivory, 1, 0.4 * yA);
      for (let y = 1735; y <= 1745; y++) {
        line(X(y), 700, X(y), y % 5 === 0 ? 714 : 708, COL.ivory, 1, 0.4 * yA);
        if (y % 5 === 0) text(String(y), X(y), 744, { f: 'num', size: 26, color: COL.ivory, alpha: 0.6 * yA, align: 'center' });
      }
      const u1 = E.out(seg(t, T('p8') + 0.2, T('p8') + 0.8)), u2 = E.inOut(seg(t, T('p8') + 0.8, T('p8') + 2.6));
      g.save(); g.globalAlpha *= yA;
      g.fillStyle = COL.goldHi; g.fillRect(X(1736), 560, (X(1737) - X(1736)) * u1, 22);
      g.fillStyle = COL.redHi; g.fillRect(X(1735), 630, (X(1744) - X(1735)) * u2, 22);
      g.restore();
      text('拉普兰  1736—1737', X(1735), 548, { f: 'zh', size: 26, color: COL.goldHi, alpha: yA * u1 });
      text('秘鲁  1735—1744', X(1735), 618, { f: 'zh', size: 26, color: COL.redHi, alpha: yA * Math.min(1, u2 * 3) });
    }
    // 三个数
    const bA = vis(t, T('p9') + 0.1, T('p10') + 0.1, 0.5);
    if (bA > 0.003) {
      const vals = [[56750, '赤道', COL.redHi, 0], [57060, '巴黎', COL.ivory, 49], [57438, '北极圈', COL.goldHi, 66]];
      vals.forEach(([v, n, c], i) => {
        const x = 1400 + i * 170, base = 800;
        const u = E.out(seg(t, T('p9') + 0.3 + i * 0.35, T('p9') + 1.2 + i * 0.35));
        const h = (v - 56400) * 0.42 * u;
        g.save(); g.globalAlpha *= bA; g.fillStyle = c; g.globalAlpha *= 0.85;
        g.fillRect(x - 40, base - h, 80, h); g.restore();
        text(fmt(v * (0.98 + 0.02 * u)), x, base - h - 18, { f: 'num', size: 40, color: c, alpha: bA * u, align: 'center' });
        text(n, x, base + 40, { f: 'zh', size: 28, color: COL.ivory, alpha: bA, align: 'center' });
      });
      text('每度子午线的长度（托阿斯）', 1570, 880, { f: 'zhm', size: 22, color: COL.dim, alpha: bA, align: 'center' });
      text('纵轴从 56 400 起', 1570, 910, { f: 'zhm', size: 18, color: COL.dim, alpha: bA * 0.8, align: 'center' });
    }
    // 牛顿赢了
    const wA2 = E.out(seg(t, T('p10') + 0.1, T('p10') + 0.9)) * (1 - E.sine(seg(t, T('p11') - 0.3, T('p11') + 0.3)));
    if (wA2 > 0.003) {
      shapeCard(1250, 330, 280, 380, '牛顿', '扁球', wA2);
      shapeCard(1560, 330, 280, 380, '卡西尼', '长球', wA2 * 0.75);
      squashedGlobe(1390, 540, 82, 1.12, 0.86, t * 0.4, ORANGE, 1, wA2);
      squashedGlobe(1700, 540, 82, 0.88, 1.12, t * 0.4, LEMON, 0.6, wA2 * 0.6);
      stamp(1480, 660, 70, '胜', t, T('p10') + 0.5, { color: '#b8892f', rot: -0.1 });
      stamp(1790, 660, 70, '负', t, T('p10') + 0.8, { color: COL.red, rot: 0.08 });
    }
    g.restore();
  }
  // ---- 3. 伏尔泰的两行诗 ----
  const qA = vis(t, T('p11') + 0.1, s.t1 + 1, 0.7);
  if (qA > 0.003) {
    // 拉普兰的雪
    for (let i = 0; i < 70; i++) {
      const h1 = hash(i * 1.37), h2 = hash(i * 2.71), sp = 30 + h2 * 50;
      const x = (h1 * W + Math.sin(t * 0.8 + i) * 20) % W, y = ((h2 * H + (t - T('p11')) * sp) % H);
      dot(x, y, 1 + h2 * 2, '#eef3ff', qA * 0.5);
    }
    card(360, 300, 1200, 440, { alpha: qA, border: 'rgba(227,194,122,0.35)' });
    text('« Vous avez confirmé dans ces lieux pleins d’ennui', 960, 400, { f: 'it', size: 42, color: COL.ivory, alpha: 0.7 * E.out(seg(t, T('p11') + 0.3, T('p11') + 1.2)), align: 'center' });
    text('Ce que Newton connut sans sortir de chez lui. »', 960, 456, { f: 'it', size: 42, color: COL.ivory, alpha: 0.7 * E.out(seg(t, T('p11') + 0.6, T('p11') + 1.5)), align: 'center' });
    line(860, 500, 1060, 500, COL.gold, 1, 0.5 * qA);
    richLine('“你在那么沉闷荒凉的地方证实的，', 960, 576, 44, t, T('p11') + 1.4, { st: 0.04 });
    richLine('是牛顿{足不出户}就知道的事。”', 960, 640, 44, t, T('p12') - 0.4, { st: 0.04 });
    text('—— 伏尔泰《论人》第四篇 · 1738', 1480, 704, { f: 'zhm', size: 26, color: COL.gold, alpha: qA * E.out(seg(t, T('p12') + 0.6, T('p12') + 1.4)), align: 'right' });
  }
};

// ======================= 第五章：米的诞生 =======================
const RULERS = [
  ['aune', 'Paris', 0.70], ['aune', 'Lyon', 0.66], ['aune', 'Rouen', 0.74], ['pied du roi', '', 0.34],
  ['toise', '', 0.95], ['perche', 'Paris', 0.82], ['perche', 'Normandie', 0.88], ['canne', 'Marseille', 0.6], ['pouce', '', 0.18],
];
// 法国轮廓（经度, 纬度），粗略示意
const FRANCE = [[2.37, 51.05], [1.85, 50.95], [1.6, 50.7], [1.55, 50.2], [0.6, 49.85], [0.1, 49.5], [-0.2, 49.3], [-1.1, 49.35], [-1.6, 49.65], [-1.85, 49.7],
  [-1.6, 48.85], [-2.0, 48.65], [-3.0, 48.8], [-4.5, 48.6], [-4.75, 48.35], [-4.4, 48.1], [-4.7, 47.95], [-3.4, 47.7], [-2.5, 47.4], [-2.2, 47.27], [-2.0, 46.9], [-1.15, 46.15],
  [-1.05, 45.6], [-1.2, 45.1], [-1.2, 44.65], [-1.35, 44.0], [-1.56, 43.48], [-1.78, 43.36], [-1.0, 43.0], [-0.3, 42.8], [0.7, 42.85], [1.7, 42.5], [2.5, 42.4], [3.17, 42.43],
  [3.05, 42.9], [3.25, 43.25], [3.9, 43.5], [4.6, 43.4], [5.35, 43.3], [5.95, 43.1], [6.7, 43.3], [7.0, 43.55], [7.5, 43.78], [7.6, 44.15], [6.9, 44.5], [7.0, 45.25], [6.8, 45.75], [7.0, 45.9],
  [6.15, 46.2], [6.1, 46.6], [6.95, 47.05], [7.0, 47.5], [7.6, 47.6], [7.55, 48.1], [7.8, 48.6], [8.2, 48.97], [7.2, 49.1], [6.4, 49.45], [5.8, 49.55], [4.85, 50.15], [4.15, 49.98], [3.6, 50.4], [2.55, 51.08]];
const SPAIN = [[3.17, 42.43], [3.3, 42.3], [3.2, 41.9], [2.75, 41.6], [2.17, 41.38], [1.2, 41.1], [0.6, 40.8]];
const MX = lon => 960 + (lon - 2.4) * 40, MY = lat => 545 - (lat - 46.3) * 58;
const MERID = (() => {
  const pts = [];
  for (let i = 0; i <= 18; i++) {
    const lat = lerp(51.03, 41.39, i / 18);
    pts.push([MX(2.4 + (i % 2 ? 0.55 : -0.45) + (hash(i) - 0.5) * 0.2), MY(lat)]);
  }
  pts[0] = [MX(2.37), MY(51.03)]; pts[18] = [MX(2.17), MY(41.39)];
  return pts;
})();
const RODEZ_I = 12;   // 罗德兹：两人会合的地方
function polyPath(pts, closed) {
  g.beginPath(); pts.forEach(([lo, la], i) => (i ? g.lineTo(MX(lo), MY(la)) : g.moveTo(MX(lo), MY(la)))); if (closed) g.closePath();
}
SHAKE.push({ t: T('p10') + 0.72, amp: 4 });
SCENES.era5 = function (t) {
  const s = SCN.era5;
  // ---- 1. 五花八门的尺子 ----
  const rA = vis(t, s.t0 + 0.3, T('m2') + 0.4, 0.6);
  if (rA > 0.003) {
    const out = E.in(seg(t, T('m2') - 0.1, T('m2') + 0.7));
    RULERS.forEach(([nm, town, len], i) => {
      const y = 300 + i * 56, wob = Math.sin(t * 1.3 + i * 1.7);
      const L = (len * 560 + 20 * Math.sin(t * 0.9 + i)) * (1 - out * 0.3);
      const x0 = 760 + Math.sin(i * 2.3) * 30 + out * (i % 2 ? 900 : -900);
      const u = E.out(seg(t, s.t0 + 0.4 + i * 0.12, s.t0 + 1.0 + i * 0.12));
      g.save(); g.globalAlpha *= rA * u; g.translate(x0, y); g.rotate(wob * 0.02 + (hash(i) - 0.5) * 0.06);
      g.fillStyle = `hsl(${36 + i * 3}, ${30 + i * 4}%, ${62 + (i % 3) * 6}%)`; g.fillRect(0, -12, L, 24);
      for (let k = 0; k <= L; k += 14) line(k, -12, k, k % 70 < 1 ? 2 : -4, '#4a3a27', 1, 0.8);
      g.restore();
      text(nm, x0 - 16, y + 8, { f: 'it', size: 28, color: COL.ivory, alpha: rA * u * (1 - out), align: 'right' });
      if (town) text(town, x0 + L + 16, y + 8, { f: 'it', size: 24, color: COL.gold, alpha: 0.7 * rA * u * (1 - out) });
    });
    text('示意 · 同名单位各地长短不一', 960, 860, { f: 'zhm', size: 22, color: COL.dim, alpha: rA * (1 - out), align: 'center' });
  }
  // ---- 2. 属于所有人的尺子 ----
  const qA = vis(t, T('m2') + 0.3, T('m3') - 0.1, 0.6);
  if (qA > 0.003) {
    const p = E.out(seg(t, T('m2') + 0.5, T('m2') + 1.6));
    g.save(); g.globalAlpha *= qA;
    const rg = g.createLinearGradient(0, 520, 0, 560);
    rg.addColorStop(0, '#fbeec4'); rg.addColorStop(1, '#b8893a');
    g.fillStyle = rg; g.shadowColor = 'rgba(240,200,120,0.7)'; g.shadowBlur = 30;
    g.fillRect(960 - 450 * p, 520, 900 * p, 34); g.shadowBlur = 0;
    for (let k = 0; k <= 100; k++) { const x = 510 + k * 9; if (Math.abs(x - 960) <= 450 * p) line(x, 520, x, 520 + (k % 10 ? 8 : 18), '#5a4630', 1, 0.9); }
    g.restore();
    text('« À tous les temps, à tous les peuples. »', 960, 420, { f: 'it', size: 48, color: COL.ivory, alpha: 0.85 * qA * E.out(seg(t, T('m2') + 1.2, T('m2') + 2.0)), align: 'center' });
    text('献给所有时代，所有人民 —— 孔多塞', 960, 650, { f: 'zhm', size: 30, color: COL.gold, alpha: qA * E.out(seg(t, T('m2') + 1.6, T('m2') + 2.4)), align: 'center', ls: 2 });
  }
  // ---- 3. 北极到赤道的千万分之一 ----
  const aA = vis(t, T('m3') - 0.1, T('m4') - 0.1, 0.6);
  if (aA > 0.003) {
    const O = [600, 820], R = 520;
    const p = E.inOut(seg(t, T('m3') + 0.1, T('m3') + 1.4));
    g.save(); g.globalAlpha *= aA;
    arcS(O[0], O[1], R, -Math.PI / 2, -Math.PI / 2 + Math.PI / 2 * p, COL.goldHi, 4, 1);
    for (let k = 0; k <= 100; k++) {
      if (k > 100 * p) break;
      const a = -Math.PI / 2 + Math.PI / 2 * k / 100, L = k % 10 ? 10 : 22;
      line(O[0] + Math.cos(a) * R, O[1] + Math.sin(a) * R, O[0] + Math.cos(a) * (R + L), O[1] + Math.sin(a) * (R + L), COL.gold, 1, 0.8);
    }
    text('北极', O[0], O[1] - R - 40, { f: 'zh', size: 30, color: COL.ivory, align: 'center' });
    text('赤道', O[0] + R + 30, O[1] + 10, { f: 'zh', size: 30, color: COL.ivory, alpha: p });
    text('巴黎子午线', O[0] + Math.cos(-Math.PI / 4) * (R - 60) - 30, O[1] + Math.sin(-Math.PI / 4) * (R - 60) + 30, { f: 'zhm', size: 24, color: COL.dim, alpha: p, align: 'right' });
    // 放大镜
    const mg = E.out(seg(t, T('m3') + 1.6, T('m3') + 2.4));
    if (mg > 0.003) {
      const a = -Math.PI / 2 + Math.PI / 2 * 0.62, P = [O[0] + Math.cos(a) * R, O[1] + Math.sin(a) * R], V = [1440, 520], r = 170;
      line(P[0], P[1], V[0] - r * 0.9, V[1] + r * 0.4, COL.gold, 1, 0.5 * mg, [4, 5]);
      arcS(P[0], P[1], 16, 0, Math.PI * 2, COL.goldHi, 2, mg);
      g.save(); g.globalAlpha *= mg; g.beginPath(); g.arc(V[0], V[1], r, 0, Math.PI * 2); g.fillStyle = 'rgba(20,15,10,0.9)'; g.fill(); g.clip();
      g.fillStyle = '#efe3c6'; g.fillRect(V[0] - 130, V[1] - 16, 260, 32);
      for (let k = 0; k <= 100; k++) line(V[0] - 130 + k * 2.6, V[1] - 16, V[0] - 130 + k * 2.6, V[1] - 16 + (k % 10 ? 6 : 14), '#5a4630', 1, 0.9);
      g.restore();
      arcS(V[0], V[1], r, 0, Math.PI * 2, COL.goldHi, 2.5, mg);
      goldText('1 米', V[0], V[1] + 80, 48, { f: 'zhk', align: 'center', alpha: mg });
      text('= 北极到赤道的 1/10 000 000', V[0], V[1] + r + 56, { f: 'zh', size: 30, color: COL.ivory, alpha: mg, align: 'center' });
      text('mètre', V[0], V[1] - 52, { f: 'it', size: 34, color: COL.gold, alpha: mg * 0.8, align: 'center' });
    }
    g.restore();
  }
  // ---- 4. 敦刻尔克—巴塞罗那 ----
  const fA = vis(t, T('m4') - 0.1, T('m6') - 0.1, 0.6);
  if (fA > 0.003) {
    g.save(); g.globalAlpha *= fA;
    g.fillStyle = 'rgba(227,194,122,0.06)'; polyPath(FRANCE, true); g.fill();
    g.strokeStyle = 'rgba(227,194,122,0.6)'; g.lineWidth = 1.5; polyPath(FRANCE, true); g.stroke();
    g.strokeStyle = 'rgba(227,194,122,0.3)'; g.setLineDash([3, 5]); polyPath(SPAIN, false); g.stroke(); g.setLineDash([]);
    text('法国', MX(-0.4), MY(47.4), { f: 'zhm', size: 26, color: COL.dim, align: 'center', ls: 8 });
    text('西班牙', MX(0.2), MY(41.6), { f: 'zhm', size: 22, color: COL.dim, align: 'center', ls: 4, alpha: 0.7 });
    // 三角链：德朗布尔从北往南，梅尚从南往北，罗德兹会合
    const prog = E.inOut(seg(t, T('m4') + 0.6, TE('m5') - 0.6));
    const nN = Math.floor(lerp(0, RODEZ_I, Math.min(1, prog * 1.05)));
    const nS = Math.floor(lerp(0, 18 - RODEZ_I, prog));
    const tri = (i, col) => {
      const [p, q, r] = [MERID[i], MERID[i + 1], MERID[i + 2]];
      if (!r) return;
      g.save(); g.fillStyle = col; g.globalAlpha *= 0.12; g.beginPath(); g.moveTo(...p); g.lineTo(...q); g.lineTo(...r); g.closePath(); g.fill(); g.restore();
      line(p[0], p[1], q[0], q[1], col, 1.3, 0.8); line(q[0], q[1], r[0], r[1], col, 1.3, 0.8); line(p[0], p[1], r[0], r[1], col, 1.3, 0.8);
    };
    for (let i = 0; i < nN && i + 2 <= RODEZ_I; i++) tri(i, COL.goldHi);
    for (let i = 0; i < nS; i++) tri(16 - i, COL.redHi);
    const city = (lo, la, n, side, c, a) => {
      dot(MX(lo), MY(la), 6, c, a, 10);
      text(n, MX(lo) + side * 22, MY(la) + 9, { f: 'zh', size: 28, color: c, alpha: a, align: side > 0 ? 'left' : 'right' });
    };
    const cl = E.out(seg(t, T('m4') + 0.2, T('m4') + 1.0));
    city(2.37, 51.03, '敦刻尔克', 1, COL.goldHi, cl);
    city(2.35, 48.86, '巴黎', -1, COL.ivory, cl * 0.8);
    city(2.17, 41.39, '巴塞罗那', 1, COL.redHi, cl);
    const meet = E.out(seg(t, TE('m5') - 0.8, TE('m5') - 0.2));
    city(2.57, 44.35, '罗德兹 · 会合', 1, COL.ivory, Math.max(meet, 0.5 * cl));
    if (meet > 0) glowDot(MX(2.57), MY(44.35), 60, 'rgba(255,230,170,0.7)', meet * (1 - seg(t, TE('m5'), TE('m5') + 1)));
    text('德朗布尔 ↓', MX(-1.2), MY(50.3), { f: 'zh', size: 28, color: COL.goldHi, alpha: cl, align: 'right' });
    text('梅尚 ↑', MX(5.0), MY(42.2), { f: 'zh', size: 28, color: COL.redHi, alpha: cl });
    // 旁注
    const n1 = E.out(seg(t, T('m5') + 0.6, T('m5') + 1.3)), n2 = E.out(seg(t, T('m5') + 1.4, T('m5') + 2.1));
    text('多次被当地人扣下盘问', 1230, 340, { f: 'zhm', size: 26, color: COL.ivory, alpha: 0.75 * n1 });
    text('仪器和文件被怀疑是间谍的东西', 1230, 376, { f: 'zhm', size: 22, color: COL.dim, alpha: n1 });
    text('1793 年法西开战', 1230, 720, { f: 'zhm', size: 26, color: COL.ivory, alpha: 0.75 * n2 });
    text('梅尚被困在西班牙', 1230, 756, { f: 'zhm', size: 22, color: COL.dim, alpha: n2 });
    g.restore();
  }
  // ---- 5. 米原器 ----
  const bA = vis(t, T('m6') - 0.1, T('m7') - 0.1, 0.6);
  if (bA > 0.003) {
    const p = E.out(seg(t, T('m6') + 0.1, T('m6') + 1.1));
    const x0 = 460, x1 = 1460, y = 500, h = 50;
    g.save(); g.globalAlpha *= bA * p;
    const mg = g.createLinearGradient(0, y, 0, y + h);
    mg.addColorStop(0, '#f6f4ee'); mg.addColorStop(0.35, '#b9b6ae'); mg.addColorStop(0.55, '#e8e5dc'); mg.addColorStop(1, '#6d6a63');
    g.fillStyle = mg; g.shadowColor = 'rgba(220,220,230,0.35)'; g.shadowBlur = 30;
    rrect(x0, y, x1 - x0, h, 4); g.fill(); g.shadowBlur = 0;
    // 掠过的高光
    const gx = lerp(x0 - 200, x1 + 200, seg(t, T('m6') + 1.0, T('m6') + 2.4));
    g.save(); rrect(x0, y, x1 - x0, h, 4); g.clip();
    const sh = g.createLinearGradient(gx - 120, 0, gx + 120, 0);
    sh.addColorStop(0, 'rgba(255,255,255,0)'); sh.addColorStop(0.5, 'rgba(255,255,255,0.75)'); sh.addColorStop(1, 'rgba(255,255,255,0)');
    g.fillStyle = sh; g.fillRect(x0, y, x1 - x0, h); g.restore();
    g.restore();
    dimLine(x0, y + h + 40, x1, y + h + 40, '', { alpha: bA * p });
    goldText('1 米', 960, y + h + 100, 52, { f: 'zhk', align: 'center', alpha: bA * p });
    text('Mètre des Archives', 960, y - 40, { f: 'it', size: 40, color: COL.ivory, alpha: 0.8 * bA * p, align: 'center' });
    text('铂金 · 两个端面之间的长度，就是 1 米', 960, y + h + 156, { f: 'zhm', size: 26, color: COL.dim, alpha: bA * p, align: 'center' });
  }
  // ---- 6. 梅尚的秘密 ----
  const nA = vis(t, T('m7') - 0.1, T('m8') - 0.1, 0.6);
  if (nA > 0.003) {
    g.save(); g.globalAlpha *= nA; g.translate(760, 520); g.rotate(-0.03);
    g.fillStyle = '#d8cba9'; g.shadowColor = 'rgba(0,0,0,0.6)'; g.shadowBlur = 30; g.fillRect(-300, -230, 600, 460); g.shadowBlur = 0;
    const pg = g.createRadialGradient(0, 0, 50, 0, 0, 420); pg.addColorStop(0, 'rgba(0,0,0,0)'); pg.addColorStop(1, 'rgba(90,60,30,0.45)');
    g.fillStyle = pg; g.fillRect(-300, -230, 600, 460);
    text('Barcelone', -250, -170, { f: 'it', size: 40, color: '#3d2b1a' });
    for (let r = 0; r < 9; r++) {
      const y = -110 + r * 40;
      g.strokeStyle = 'rgba(61,43,26,0.75)'; g.lineWidth = 1.6; g.beginPath();
      for (let x = -250; x <= 230; x += 4) {
        const w = Math.sin(x * 0.21 + r * 3) * 3 + Math.sin(x * 0.07 + r) * 2;
        if (x === -250) g.moveTo(x, y + w); else g.lineTo(x, y + w);
      }
      g.stroke();
    }
    const c = E.out(seg(t, T('m7') + 1.2, T('m7') + 2.0));
    g.strokeStyle = COL.red; g.lineWidth = 4; g.beginPath();
    g.ellipse(0, -110 + 4 * 40, 270, 26, -0.02, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * c); g.stroke();
    g.restore();
    text('巴塞罗那两处观测的纬度', 1160, 470, { f: 'zh', size: 32, color: COL.ivory, alpha: nA * c });
    text('差了约 3 角秒', 1160, 524, { f: 'zh', size: 40, color: COL.redHi, alpha: nA * c, glow: 10, glowColor: 'rgba(230,90,70,0.5)' });
    text('他没有公开，只把它留在了笔记里', 1160, 580, { f: 'zhm', size: 24, color: COL.dim, alpha: nA * E.out(seg(t, T('m7') + 2.2, T('m7') + 3.0)) });
    text('（笔迹为示意）', 760, 800, { f: 'zhm', size: 20, color: COL.dim, alpha: nA, align: 'center' });
  }
  // ---- 7. 短了 0.2 毫米 ----
  const zA = vis(t, T('m8') - 0.1, s.t1 + 1, 0.6);
  if (zA > 0.003) {
    g.save(); g.globalAlpha *= zA;
    const mg = g.createLinearGradient(0, 470, 0, 590);
    mg.addColorStop(0, '#f6f4ee'); mg.addColorStop(0.4, '#b9b6ae'); mg.addColorStop(1, '#6d6a63');
    g.fillStyle = mg; g.fillRect(-20, 470, 1100, 120);
    const ext = 90 * E.out(seg(t, T('m8') + 0.6, T('m8') + 1.4));
    g.strokeStyle = COL.redHi; g.lineWidth = 2.5; g.setLineDash([8, 7]); g.strokeRect(1080, 470, ext, 120); g.setLineDash([]);
    g.restore();
    dimLine(1080, 640, 1080 + ext, 640, '', { alpha: zA, color: COL.redHi });
    text('0.2 毫米', 1125, 700, { f: 'zh', size: 40, color: COL.redHi, alpha: zA * seg(t, T('m8') + 1.0, T('m8') + 1.6), align: 'left' });
    text('按定义应有的长度', 1240, 540, { f: 'zhm', size: 26, color: COL.ivory, alpha: 0.7 * zA * seg(t, T('m8') + 1.2, T('m8') + 1.8) });
    text('米原器的端面（放大示意）', 900, 430, { f: 'zhm', size: 24, color: COL.dim, alpha: zA, align: 'center' });
    text('原因之一：当年估计的地球扁率不够准', 960, 820, { f: 'zhm', size: 26, color: COL.ivory, alpha: 0.65 * zA * seg(t, T('m8') + 1.8, T('m8') + 2.6), align: 'center' });
  }
};

// ======================= 结尾 =======================
SCENES.end = function (t) {
  const s = SCN.end;
  // ---- 1983：光 ----
  const lA = vis(t, s.t0 + 0.3, T('z2') - 0.2, 0.6);
  if (lA > 0.003) {
    const p = E.inOut(seg(t, T('z1') + 0.1, T('z1') + 1.6));
    const x = lerp(160, 1760, p);
    g.save(); g.globalAlpha *= lA;
    const bg = g.createLinearGradient(160, 0, x, 0);
    bg.addColorStop(0, 'rgba(255,240,200,0)'); bg.addColorStop(1, 'rgba(255,240,200,0.95)');
    g.fillStyle = bg; g.shadowColor = 'rgba(255,230,170,0.9)'; g.shadowBlur = 24; g.fillRect(160, 498, x - 160, 4); g.shadowBlur = 0;
    g.restore();
    if (p > 0 && p < 1) glowDot(x, 500, 40, 'rgba(255,240,200,0.95)', lA);
    richLine('1 米 = 光在真空中 {1/299 792 458} 秒内走过的距离', 960, 620, 40, t, T('z1') + 1.2, { alpha: lA });
    text('定义换成了光，长度原样保留', 960, 690, { f: 'zhm', size: 28, color: COL.dim, alpha: lA * E.out(seg(t, T('z1') + 2.2, T('z1') + 3.0)), align: 'center' });
  }
  // ---- 地球回来：四万公里 ----
  const gA = vis(t, T('z2') - 0.2, T('z4') + 0.6, 0.7);
  const un = E.inOut(seg(t, T('z4') - 0.1, T('z4') + 2.2));     // 子午圈展开成一把尺
  const { cx, cy, R, k } = OPEN;
  if (gA > 0.003) {
    g.save(); g.globalAlpha *= gA * (1 - un);
    globe(cx, cy, R, t * 0.12);
    g.restore();
    const p = E.inOut(seg(t, T('z2') + 0.1, T('z2') + 2.4));
    if (un <= 0) {
      g.save(); g.globalAlpha *= gA;
      const head = meridian(cx, cy, R, k, p);
      if (head && p < 1) glowDot(head[0], head[1], 26, 'rgba(255,230,170,0.9)');
      g.restore();
    }
    const kmA = gA * (1 - un) * E.sine(seg(t, T('z2'), T('z2') + 0.7));
    text('子午线周长', 1130, 368, { f: 'zhm', size: 28, color: COL.ivory, alpha: 0.6 * kmA, ls: 4 });
    goldText(fmt(40008 * p), 1126, 500, 128, { f: 'num', alpha: kmA });
    setFont('num', 128);
    text('km', 1126 + g.measureText(fmt(40008 * p)).width + 18, 500, { f: 'numl', size: 48, color: COL.gold, alpha: 0.8 * kmA });
    // 四分之一 = 一千万米
    const q = E.sine(seg(t, T('z3') + 0.2, T('z3') + 1.2)) * (1 - un) * gA;
    if (q > 0.003) {
      const pts = meridianPts(cx, cy, R, k, 240).slice(0, 61);
      g.save(); g.globalAlpha *= q; g.strokeStyle = COL.red; g.lineWidth = 5; g.lineCap = 'round';
      g.shadowColor = 'rgba(230,90,70,0.9)'; g.shadowBlur = 16; g.beginPath();
      pts.forEach((pt, i) => (i ? g.lineTo(pt[0], pt[1]) : g.moveTo(pt[0], pt[1]))); g.stroke(); g.restore();
      text('10 000 000 米', pts[30][0] + 26, pts[30][1] + 10, { f: 'num', size: 36, color: COL.redHi, alpha: q });
      text('先量了地球，才有了「米」', 1130, 590, { f: 'zh', size: 30, color: COL.ivory, alpha: q * 0.85 });
    }
  }
  // 展开成尺
  const uA = vis(t, T('z4') - 0.3, s.t1 + 1, 0.4);
  if (un > 0 && uA > 0.003) {
    {
      const pts = meridianPts(cx, cy, R, k, 240);
      const x0 = 260, x1 = 1660, y0 = 760;
      g.save(); g.globalAlpha *= uA; g.strokeStyle = COL.goldHi; g.lineWidth = 3; g.shadowColor = 'rgba(240,200,120,0.9)'; g.shadowBlur = 14;
      g.beginPath();
      pts.forEach((pt, i) => {
        const x = lerp(pt[0], lerp(x0, x1, i / 240), un), y = lerp(pt[1], y0, un);
        if (!i) g.moveTo(x, y); else g.lineTo(x, y);
      });
      g.stroke(); g.restore();
      const ra = E.out(seg(t, T('z4') + 1.6, T('z4') + 2.6));
      if (ra > 0.003) {
        g.save(); g.globalAlpha *= ra;
        const rg = g.createLinearGradient(0, y0, 0, y0 + 70);
        rg.addColorStop(0, '#f3e6c4'); rg.addColorStop(1, '#bfa778');
        g.fillStyle = rg; g.fillRect(x0, y0, x1 - x0, 70);
        for (let j = 0; j <= 200; j++) {
          const x = lerp(x0, x1, j / 200);
          line(x, y0, x, y0 + (j % 20 === 0 ? 30 : (j % 10 === 0 ? 20 : 10)), '#4a3a27', 1, 0.9);
          if (j % 50 === 0) text(fmt(j * 200), x + (j === 200 ? -6 : (j ? 0 : 6)), y0 + 58, { f: 'num', size: 22, color: '#3a2c1c', align: j === 200 ? 'right' : (j ? 'center' : 'left') });
        }
        g.restore();
        text('km', x1 + 18, y0 + 46, { f: 'numl', size: 32, color: COL.gold, alpha: ra });
      }
      goldText('地球的尺寸', 960, 520, 110, { f: 'zhk', align: 'center', alpha: E.out(seg(t, T('z4') + 2.2, T('z4') + 3.4)), ls: 16 });
    }
  }
};

SCENES.credits = function (t) {
  const s = SCN.credits;
  const a = E.sine(seg(t, s.t0, s.t0 + 1.0));
  text('DE  MAGNITUDINE  TERRAE', 960, 380, { f: 'cap', size: 26, color: COL.ivory, alpha: 0.6 * a, align: 'center', ls: 10 });
  goldText('地球的尺寸', 960, 500, 96, { f: 'zhk', align: 'center', alpha: a, ls: 14 });
  text('甜菜', 960, 580, { f: 'zhm', size: 30, color: COL.gold, alpha: 0.85 * a, align: 'center', ls: 8 });
  const r = E.sine(seg(t, s.t0 + 0.6, s.t0 + 1.6));
  const refs = [
    '参考：克莱奥梅德斯《天体的圆周运动》 · 《新唐书·天文志》 · Snellius, Eratosthenes Batavus (1617)',
    'Maupertuis, La Figure de la Terre (1738) · Ken Alder, The Measure of All Things (2002)',
  ];
  refs.forEach((l, i) => text(l, 960, 800 + i * 36, { f: 'zhm', size: 21, color: COL.dim, alpha: r, align: 'center' }));
};
