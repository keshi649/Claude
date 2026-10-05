/* 第二章（一行与南宫说：四根八尺表、妄矣、北极高一度）
   第三章（斯涅尔的三角链、皮卡尔的望远镜）。 */

// ======================= 第二章：大唐 =======================
const TANG_TEXT = '太史監南宮說擇河南平地設水準繩墨植表而以引度之自滑臺始白馬夏至之晷尺五寸七分又南百九十八里百七十九步得浚儀岳臺晷尺五寸三分又南百六十七里二百八十一步得扶溝晷尺四寸四分又南百六十里百一十步至上蔡武津晷尺三寸六分半大率五百二十六里二百七十步晷差二寸餘而舊說王畿千里影差一寸妄矣';
const POSTS = [
  { name: '白马', sub: '滑台', li: 0, sh: 1.57, shs: '1尺5寸7分' },
  { name: '浚仪', sub: '岳台', li: 198 + 179 / 300, sh: 1.53, shs: '1尺5寸3分' },
  { name: '扶沟', sub: '', li: 198 + 179 / 300 + 167 + 281 / 300, sh: 1.44, shs: '1尺4寸4分' },
  { name: '上蔡', sub: '武津', li: 526 + 270 / 300, sh: 1.365, shs: '1尺3寸6分半' },
];
const GAPS = ['198 里 179 步', '167 里 281 步', '160 里 110 步'];

function oldSaying(cx, cy, sc, alpha, strike) {
  if (alpha <= 0.003) return;
  g.save(); g.globalAlpha *= alpha; g.translate(cx, cy); g.scale(sc, sc);
  card(-400, -130, 800, 260, { border: 'rgba(227,194,122,0.5)', fill: 'rgba(28,16,10,0.75)' });
  text('旧 说', -360, -78, { f: 'zhm', size: 26, color: COL.redHi, ls: 6 });
  goldText('王畿千里，影差一寸', 0, 28, 74, { f: 'zhk', align: 'center', ls: 6 });
  text('南北每隔一千里，正午的日影就差一寸', 0, 92, { f: 'zhm', size: 26, color: COL.ivory, alpha: 0.6, align: 'center', ls: 2 });
  if (strike > 0) line(-330, 4, -330 + 660 * strike, 4, COL.red, 6, 0.9);
  g.restore();
}
SHAKE.push({ t: T('t7') + 0.34, amp: 7 });
SCENES.era2 = function (t) {
  const s = SCN.era2;
  // 背景：《新唐书》原文竖排
  const bgA = 0.1 * vis(t, s.t0, s.t1, 1.0);
  if (bgA > 0.003) {
    const per = 16;
    for (let i = 0; i < TANG_TEXT.length; i++) {
      const col = Math.floor(i / per), row = i % per;
      text(TANG_TEXT[i], 1830 - col * 44, 250 + row * 40, { f: 'zhm', size: 30, color: COL.gold, alpha: bgA * (0.6 + 0.4 * hash(i)) });
    }
  }
  // ---- 旧说的牌子：先在中间，量的时候挪到左上，比较时回来，再被盖章 ----
  const plA = vis(t, T('t1') + 0.4, T('t8') - 0.3, 0.6);
  const mv1 = E.inOut(seg(t, T('t3') - 0.2, T('t3') + 0.7));
  const mv2 = E.inOut(seg(t, T('t6') - 0.2, T('t6') + 0.7));
  const pcx = lerp(lerp(960, 470, mv1), 960, mv2), pcy = lerp(lerp(420, 330, mv1), 360, mv2);
  const psc = lerp(lerp(1, 0.48, mv1), 0.82, mv2);
  oldSaying(pcx, pcy, psc, plA, E.out(seg(t, T('t7') + 0.25, T('t7') + 0.6)));
  // 「千里 · 一寸」示意
  const kA = vis(t, T('t2') + 0.2, T('t3') - 0.2, 0.5);
  if (kA > 0.003) {
    const p = E.out(seg(t, T('t2') + 0.2, T('t2') + 1.4));
    dimLine(560, 680, 560 + 800 * p, 680, '', { alpha: kA });
    text('南北 1000 里', 960, 660, { f: 'zh', size: 30, color: COL.gold, alpha: kA * p, align: 'center' });
    g.save(); g.globalAlpha *= kA * p; g.fillStyle = COL.goldHi; g.fillRect(944, 726, 32, 10); g.restore();
    text('日影差 1 寸', 960, 780, { f: 'zh', size: 30, color: COL.goldHi, alpha: kA * p, align: 'center' });
  }
  // ---- 四根八尺表 ----
  const gA = vis(t, T('t3') + 0.2, T('t6') - 0.2, 0.6);
  const GY = 700, PX = li => lerp(440, 1500, li / POSTS[3].li), HH = 240, K = HH / 8;
  if (gA > 0.003) {
    g.save(); g.globalAlpha *= gA;
    const hz = g.createLinearGradient(260, 0, 1660, 0);
    hz.addColorStop(0, 'rgba(227,194,122,0)'); hz.addColorStop(0.15, 'rgba(227,194,122,0.55)'); hz.addColorStop(0.85, 'rgba(227,194,122,0.55)'); hz.addColorStop(1, 'rgba(227,194,122,0)');
    g.fillStyle = hz; g.fillRect(260, GY, 1400, 1.5);
    text('北', 290, GY - 14, { f: 'zhm', size: 24, color: COL.dim });
    text('南', 1630, GY - 14, { f: 'zhm', size: 24, color: COL.dim, align: 'right' });
    POSTS.forEach((p, i) => {
      const x = PX(p.li);
      const u = E.out(seg(t, T('t3') + 0.5 + i * 0.35, T('t3') + 1.1 + i * 0.35));
      if (u <= 0) return;
      gnomon(x, GY, HH * u, { alpha: u, w: 9 });
      text(p.name, x, GY + 52, { f: 'zh', size: 32, color: COL.ivory, alpha: u, align: 'center' });
      if (p.sub) text(p.sub, x, GY + 84, { f: 'zhm', size: 22, color: COL.dim, alpha: u, align: 'center' });
      // 影子（夏至正午，影子朝北 = 朝左）
      const v = E.out(seg(t, T('t4') + 0.3 + i * 0.3, T('t4') + 1.1 + i * 0.3));
      if (v > 0) {
        const L = p.sh * K * v;
        g.save(); g.fillStyle = 'rgba(0,0,0,0.9)'; g.fillRect(x - L, GY - 3, L, 8); g.restore();
        line(x - L, GY + 2, x, GY + 2, COL.goldHi, 2, 0.8);
        text(p.shs, x - 8, GY - 40, { f: 'zh', size: 22, color: COL.goldHi, alpha: v, align: 'right' });
      }
      if (i < 3) {
        const w = E.out(seg(t, T('t3') + 1.0 + i * 0.35, T('t3') + 1.6 + i * 0.35));
        const xm = (x + PX(POSTS[i + 1].li)) / 2;
        text(GAPS[i], xm, GY + 52, { f: 'zhm', size: 22, color: COL.ivory, alpha: 0.5 * w, align: 'center' });
      }
    });
    // 总长
    const b = E.out(seg(t, T('t5') + 0.1, T('t5') + 0.9));
    if (b > 0.003) {
      const y = GY + 120;
      dimLine(PX(0), y, PX(0) + (PX(POSTS[3].li) - PX(0)) * b, y, '', { alpha: b });
      text('526 里 270 步', 970, y + 42, { f: 'zh', size: 30, color: COL.gold, alpha: b, align: 'center' });
    }
    g.restore();
  }
  // 影差放大
  const dA = vis(t, T('t5') + 0.6, T('t6') - 0.2, 0.5);
  if (dA > 0.003) {
    const x0 = 1090, sc = 230;
    g.save(); g.globalAlpha *= dA;
    text('影长 · 放大', x0, 262, { f: 'zhm', size: 22, color: COL.dim, ls: 2 });
    g.fillStyle = 'rgba(239,231,212,0.75)'; g.fillRect(x0, 290, 1.57 * sc, 14);
    g.fillStyle = 'rgba(239,231,212,0.75)'; g.fillRect(x0, 340, 1.365 * sc, 14);
    g.fillStyle = COL.redHi; g.fillRect(x0 + 1.365 * sc, 336, 0.205 * sc, 22);
    text('白马', x0 - 14, 304, { f: 'zhm', size: 22, color: COL.ivory, align: 'right' });
    text('上蔡', x0 - 14, 354, { f: 'zhm', size: 22, color: COL.ivory, align: 'right' });
    text('差 2 寸余', x0 + 1.57 * sc + 18, 356, { f: 'zh', size: 30, color: COL.redHi });
    g.restore();
  }
  // 旧说 vs 实测
  const cA = vis(t, T('t6') + 0.4, T('t8') - 0.3, 0.6);
  if (cA > 0.003) {
    const x0 = 820, sc = 170;
    const u1 = E.out(seg(t, T('t6') + 0.6, T('t6') + 1.4)), u2 = E.out(seg(t, T('t6') + 1.2, T('t6') + 2.2));
    g.save(); g.globalAlpha *= cA;
    text('照旧说推算', x0 - 24, 640, { f: 'zhm', size: 28, color: COL.ivory, align: 'right', alpha: 0.8 });
    g.fillStyle = 'rgba(227,194,122,0.8)'; g.fillRect(x0, 618, 0.53 * sc * u1, 22);
    text('约半寸', x0 + 0.53 * sc + 18, 640, { f: 'zh', size: 28, color: COL.gold, alpha: u1 });
    text('实际测得', x0 - 24, 716, { f: 'zhm', size: 28, color: COL.ivory, align: 'right', alpha: 0.8 });
    g.fillStyle = COL.redHi; g.fillRect(x0, 694, 2.05 * sc * u2, 22);
    text('2 寸余', x0 + 2.05 * sc + 18, 716, { f: 'zh', size: 28, color: COL.redHi, alpha: u2 });
    text('（同样是 526 里）', 960, 790, { f: 'zhm', size: 24, color: COL.dim, alpha: u2, align: 'center' });
    g.restore();
  }
  // 妄矣
  const st = T('t7') + 0.12;
  if (t >= st && t < T('t8') + 0.4) {
    const fade = 1 - E.sine(seg(t, T('t8') - 0.3, T('t8') + 0.3));
    stamp(1270, 380, 200, '妄矣', t, st, { rot: -0.1, alpha: fade });
  }
  // ---- 北极星：每往北 351 里 80 步，北极高一度 ----
  const nA = vis(t, T('t8') - 0.1, T('t9') - 0.1, 0.6);
  if (nA > 0.003) {
    g.save(); g.globalAlpha *= nA;
    // 弯曲的地面：两地的地平线方向不同，北极星的光却几乎平行
    const C = [760, 1900], R = 1200, sd = [-80 * D2R, 35 * D2R];
    const sdir = [-Math.cos(sd[1]), -Math.sin(sd[1])], sAng = Math.atan2(sdir[1], sdir[0]);
    arcS(C[0], C[1], R, -Math.PI / 2 - 0.42, -Math.PI / 2 + 0.42, COL.gold, 2, 0.8);
    const sites = [{ th: -99 * D2R, n: '白马', side: -1 }, { th: -81 * D2R, n: '上蔡', side: 1 }];
    sites.forEach((st2, i) => {
      const x = C[0] + Math.cos(st2.th) * R, y = C[1] + Math.sin(st2.th) * R;
      const u = E.out(seg(t, T('t8') + 0.2 + i * 0.4, T('t8') + 1.2 + i * 0.4));
      const tg = [Math.sin(st2.th), -Math.cos(st2.th)], tAng = Math.atan2(tg[1], tg[0]);
      line(x - tg[0] * 230, y - tg[1] * 230, x + tg[0] * 230, y + tg[1] * 230, COL.ivory, 1.2, 0.45 * u);
      g.save(); g.globalAlpha *= u * 0.3; g.fillStyle = COL.gold;
      g.beginPath(); g.moveTo(x, y); g.arc(x, y, 190, tAng, sAng + Math.PI * 2 * (sAng < tAng ? 1 : 0)); g.closePath(); g.fill(); g.restore();
      arcS(x, y, 190, tAng, sAng + Math.PI * 2 * (sAng < tAng ? 1 : 0), COL.goldHi, 2, u);
      lineP(x, y, x + sdir[0] * 1100, y + sdir[1] * 1100, u, 'rgba(220,230,255,1)', 1.3, 0.6, [6, 6]);
      dot(x, y, 6, COL.goldHi, u, 10);
      text(st2.n, x, y + 46, { f: 'zh', size: 30, color: COL.ivory, alpha: u, align: 'center' });
    });
    glowDot(150, 300, 60, 'rgba(220,230,255,0.35)');
    dot(150, 300, 5, '#f4f2ff', 1, 16);
    text('北极星', 150, 352, { f: 'zhm', size: 24, color: COL.ivory, alpha: 0.75, align: 'center' });
    text('（极远，光线几乎平行）', 150, 384, { f: 'zhm', size: 20, color: COL.dim, align: 'center' });
    const dA2 = E.out(seg(t, T('t8') + 1.4, T('t8') + 2.0));
    text('越往北，北极星越高', 760, 800, { f: 'zhm', size: 28, color: COL.redHi, alpha: dA2, align: 'center' });
    text('白马比上蔡高 1.5 度 · 图中角度差已放大', 760, 838, { f: 'zhm', size: 21, color: COL.dim, alpha: dA2, align: 'center' });
    // 右侧算式
    const q = [E.out(seg(t, T('t8') + 0.6, T('t8') + 1.2)), E.out(seg(t, T('t8') + 1.2, T('t8') + 1.8)), E.out(seg(t, T('t8') + 1.9, T('t8') + 2.7))];
    const QX = 1240;
    text('526 里 270 步', QX, 430, { f: 'zh', size: 46, color: COL.ivory, alpha: q[0] });
    text('÷ 1.5 度', QX, 510, { f: 'zh', size: 46, color: COL.ivory, alpha: q[1] });
    line(QX, 548, QX + 420, 548, COL.gold, 1.5, q[2]);
    goldText('351 里 80 步', QX, 626, 60, { f: 'zhk', alpha: q[2] });
    text('= 北极高 1 度', QX + 4, 680, { f: 'zhm', size: 30, color: COL.gold, alpha: q[2] });
    text('古度：一周天 365¼ 度', QX + 4, 730, { f: 'zhm', size: 22, color: COL.dim, alpha: q[2] });
    g.restore();
  }
  // ---- 子午线的刻度 ----
  const zA = vis(t, T('t9') - 0.1, s.t1 + 1, 0.7);
  if (zA > 0.003) {
    g.save(); g.globalAlpha *= zA;
    const y = 560, off = (t - T('t9')) * 26;
    const lg = g.createLinearGradient(160, 0, 1760, 0);
    lg.addColorStop(0, 'rgba(227,194,122,0)'); lg.addColorStop(0.2, 'rgba(240,205,130,0.9)'); lg.addColorStop(0.8, 'rgba(240,205,130,0.9)'); lg.addColorStop(1, 'rgba(227,194,122,0)');
    g.fillStyle = lg; g.fillRect(160, y - 1.5, 1600, 3);
    for (let k = -2; k < 12; k++) {
      const x = 160 + k * 180 + (off % 180);
      const edge = clamp(Math.min(x - 160, 1760 - x) / 260);
      if (edge <= 0) continue;
      line(x, y - 24, x, y + 24, COL.goldHi, 2, edge);
      text('1°', x, y - 40, { f: 'num', size: 34, color: COL.goldHi, alpha: edge, align: 'center' });
      for (let j = 1; j < 6; j++) line(x + j * 30, y - 8, x + j * 30, y + 8, COL.gold, 1, 0.5 * edge);
      text('351 里 80 步', x + 90, y + 52, { f: 'zhm', size: 20, color: COL.ivory, alpha: 0.55 * edge, align: 'center' });
    }
    text('子午线', 960, 420, { f: 'zhk', size: 64, color: COL.gold, alpha: E.out(seg(t, T('t9') + 0.2, T('t9') + 1.0)), align: 'center', ls: 20, glow: 20 });
    text('沿着南北方向，量出每一度有多长', 960, 680, { f: 'zhm', size: 28, color: COL.ivory, alpha: 0.7 * E.out(seg(t, T('t9') + 0.6, T('t9') + 1.4)), align: 'center', ls: 2 });
    g.restore();
  }
};

// ======================= 第三章：三角形与望远镜 =======================
// 斯涅尔三角链：35 个点交错排成一条带，相邻三点成一个三角形，共 33 个
const CHAIN = (() => {
  const pts = [];
  for (let i = 0; i < 35; i++) {
    const v = i / 34;
    const cx = 960 + Math.sin(v * 2.4 + 0.4) * 50 - v * 40;
    pts.push([cx + (i % 2 ? 1 : -1) * (70 + hash(i * 3.3) * 45) + (hash(i * 1.7) - 0.5) * 30, 250 + v * 600 + (hash(i * 5.1) - 0.5) * 10]);
  }
  return pts;
})();
function churchIcon(x, y, s, alpha) {
  if (alpha <= 0.003) return;
  g.save(); g.globalAlpha *= alpha; g.fillStyle = COL.ivory; g.translate(x, y); g.scale(s, s);
  g.beginPath(); g.moveTo(-6, 0); g.lineTo(-6, -16); g.lineTo(0, -30); g.lineTo(6, -16); g.lineTo(6, 0); g.closePath(); g.fill();
  g.fillRect(-0.8, -38, 1.6, 9); g.fillRect(-3.5, -35, 7, 1.6);
  g.restore();
}
SCENES.era3 = function (t) {
  const s = SCN.era3;
  // ---- 1. 拿尺子一步步量？ ----
  const rA = vis(t, s.t0 + 0.3, T('s2') + 0.2, 0.6);
  if (rA > 0.003) {
    const cx = 960, cy = 2700, R = 1980;
    g.save(); g.globalAlpha *= rA;
    arcS(cx, cy, R, -Math.PI / 2 - 0.55, -Math.PI / 2 + 0.55, COL.gold, 2, 0.7);
    const steps = Math.floor(Math.max(0, t - T('s1') + 0.6) / 0.32);
    const a0 = -Math.PI / 2 - 0.36;
    const da = 46 / R;
    for (let k = 0; k <= steps; k++) {
      const a = a0 + k * da;
      const x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
      line(x, y - 8, x, y + 8, COL.ivory, 1, k === steps ? 0 : 0.35);
    }
    const a = a0 + steps * da, x = cx + Math.cos(a) * R, y = cy + Math.sin(a) * R;
    g.save(); g.translate(x, y); g.rotate(a + Math.PI / 2);
    g.fillStyle = '#efe3c6'; g.fillRect(0, -10, 46, 9);
    for (let j = 0; j <= 9; j++) line(j * 5, -10, j * 5, j % 5 ? -6 : -3, '#5a4630', 1, 1);
    g.restore();
    text('第 ' + (steps + 1) + ' 尺', x, y - 40, { f: 'zh', size: 28, color: COL.gold, align: 'center' });
    text('……地球一圈，要量几千万尺', 1460, 560, { f: 'zhm', size: 28, color: COL.ivory, alpha: 0.65 * E.out(seg(t, T('s1') + 1.2, T('s1') + 2.0)), align: 'center' });
    g.restore();
  }
  // ---- 2. 只量一条边，其余靠角度 ----
  const tA = vis(t, T('s2') + 0.2, T('s4') + 0.2, 0.6);
  if (tA > 0.003) {
    const A = [720, 760], B = [1200, 760], C = [910, 360];
    g.save(); g.globalAlpha *= tA;
    const bp = E.out(seg(t, T('s2') + 0.6, T('s2') + 1.6));
    line(A[0], A[1], lerp(A[0], B[0], bp), B[1], COL.goldHi, 5, 1);
    for (let k = 0; k <= 24; k++) { const x = A[0] + k * 20; if (x <= lerp(A[0], B[0], bp)) line(x, A[1] + 6, x, A[1] + (k % 5 ? 14 : 22), COL.gold, 1, 0.7); }
    text('基线：唯一要用尺子量的边', 960, 830, { f: 'zhm', size: 28, color: COL.gold, alpha: bp, align: 'center', ls: 2 });
    const ap = E.out(seg(t, T('s3') + 0.2, T('s3') + 1.0));
    const aA = Math.atan2(C[1] - A[1], C[0] - A[0]), aB = Math.atan2(C[1] - B[1], C[0] - B[0]);
    arcS(A[0], A[1], 80, aA, 0, COL.redHi, 2.5, ap);
    arcS(B[0], B[1], 80, Math.PI, aB + Math.PI * 2, COL.redHi, 2.5, ap);
    text('α', A[0] + 90, A[1] - 26, { f: 'it', size: 44, color: COL.redHi, alpha: ap });
    text('β', B[0] - 110, B[1] - 26, { f: 'it', size: 44, color: COL.redHi, alpha: ap });
    const rp = E.inOut(seg(t, T('s3') + 0.8, T('s3') + 2.0));
    lineP(A[0], A[1], C[0], C[1], rp, COL.ivory, 1.6, 0.9);
    lineP(B[0], B[1], C[0], C[1], rp, COL.ivory, 1.6, 0.9);
    if (rp >= 1) { glowDot(C[0], C[1], 50, 'rgba(255,230,170,0.6)', E.out(seg(t, T('s3') + 2.0, T('s3') + 2.4))); churchIcon(C[0], C[1] - 4, 1.2, 1); }
    churchIcon(A[0], A[1] - 4, 1, bp); churchIcon(B[0], B[1] - 4, 1, bp);
    text('一条边 + 两个角 → 整个三角形', 1300, 460, { f: 'zhm', size: 28, color: COL.ivory, alpha: 0.75 * E.out(seg(t, T('s3') + 2.2, T('s3') + 3.0)) });
    g.restore();
  }
  // ---- 3. 三十三个三角形 ----
  const cA = vis(t, T('s4') - 0.1, T('s7') - 0.2, 0.6);
  if (cA > 0.003) {
    const shift = -230 * E.inOut(seg(t, T('s5') - 0.2, T('s5') + 0.8));
    g.save(); g.globalAlpha *= cA; g.translate(shift, 0);
    const n = Math.floor(lerp(0, 33, E.inOut(seg(t, T('s4') + 0.3, T('s4') + 3.6))));
    for (let i = 0; i < n; i++) {
      const [p, q, r] = [CHAIN[i], CHAIN[i + 1], CHAIN[i + 2]];
      g.save(); g.fillStyle = `rgba(227,194,122,${i === n - 1 ? 0.35 : 0.08})`;
      g.beginPath(); g.moveTo(p[0], p[1]); g.lineTo(q[0], q[1]); g.lineTo(r[0], r[1]); g.closePath(); g.fill(); g.restore();
      line(p[0], p[1], q[0], q[1], COL.gold, 1.2, 0.7); line(q[0], q[1], r[0], r[1], COL.gold, 1.2, 0.7); line(p[0], p[1], r[0], r[1], COL.gold, 1.2, 0.7);
    }
    for (let i = 0; i < Math.min(35, n + 2); i++) dot(CHAIN[i][0], CHAIN[i][1], 3, COL.ivory, 0.9);
    line(CHAIN[16][0], CHAIN[16][1], CHAIN[18][0], CHAIN[18][1], COL.goldHi, 4, n > 17 ? 1 : 0);
    if (n > 17) text('基线', CHAIN[18][0] + 16, CHAIN[18][1] + 6, { f: 'zhm', size: 22, color: COL.goldHi });
    const lab = (i, nm, en, side) => {
      const u = E.out(seg(t, T('s4') + 0.3 + i / 33 * 3.3, T('s4') + 0.8 + i / 33 * 3.3));
      const [x, y] = CHAIN[i];
      churchIcon(x, y - 4, 0.9, u);
      text(nm, x + side * 34, y + 8, { f: 'zh', size: 28, color: COL.ivory, alpha: u, align: side > 0 ? 'left' : 'right' });
      text(en, x + side * 34, y + 38, { f: 'it', size: 24, color: COL.gold, alpha: 0.75 * u, align: side > 0 ? 'left' : 'right' });
    };
    lab(1, '阿尔克马尔', 'Alkmaar', 1); lab(17, '莱顿', 'Leiden', -1); lab(34, '贝亨奥普佐姆', 'Bergen op Zoom', 1);
    if (n > 0) {
      text(String(n), 1300, 520, { f: 'num', size: 120, color: COL.goldHi, alpha: 1 - E.out(seg(t, T('s5') - 0.2, T('s5') + 0.4)), glow: 20 });
      text('个三角形', 1306, 572, { f: 'zhm', size: 30, color: COL.ivory, alpha: 0.8 * (1 - E.out(seg(t, T('s5') - 0.2, T('s5') + 0.4))) });
    }
    g.restore();
    // 埃拉托色尼的幽灵
    const ghA = E.out(seg(t, T('s5') + 0.4, T('s5') + 1.4)) * (1 - E.out(seg(t, T('s6') - 0.2, T('s6') + 0.4)));
    if (ghA > 0.003) {
      g.save(); g.globalAlpha *= ghA * 0.6;
      arcS(1380, 560, 170, 0, Math.PI * 2, COL.gold, 1.5, 0.8, [4, 6]);
      line(1380, 390, 1380, 560, COL.ivory, 1, 0.6, [4, 4]);
      line(1380 + Math.sin(7.2 * D2R) * 170, 560 - Math.cos(7.2 * D2R) * 170, 1380, 560, COL.ivory, 1, 0.6, [4, 4]);
      text('前 240 · 埃拉托色尼', 1380, 780, { f: 'zhm', size: 26, color: COL.ivory, alpha: 0.8, align: 'center' });
      text('→ 1617 · 斯涅尔', 1380, 818, { f: 'zhm', size: 26, color: COL.gold, alpha: 0.9, align: 'center' });
      g.restore();
    }
    // −3.4%
    const dA = E.out(seg(t, T('s6') + 0.2, T('s6') + 1.2));
    if (dA > 0.003) {
      g.save(); g.globalAlpha *= cA;
      arcS(1400, 540, 200, 0, Math.PI * 2, COL.ivory, 1.5, 0.6 * dA, [6, 6]);
      arcS(1400, 540, 200 * (1 - 0.034 * E.out(seg(t, T('s6') + 0.6, T('s6') + 1.6))), 0, Math.PI * 2, COL.goldHi, 2.5, dA);
      text('真实', 1400 + 150, 540 - 160, { f: 'zhm', size: 24, color: COL.ivory, alpha: 0.7 * dA });
      text('斯涅尔', 1400, 548, { f: 'zh', size: 30, color: COL.gold, alpha: dA, align: 'center' });
      goldText('−3.4%', 1400, 830, 72, { f: 'num', align: 'center', alpha: dA });
      g.restore();
    }
  }
  // ---- 4. 皮卡尔：给测角仪装上望远镜 ----
  const qA = vis(t, T('s7') - 0.1, s.t1 + 1, 0.6);
  if (qA > 0.003) {
    g.save(); g.globalAlpha *= qA;
    const O = [700, 760], R = 380;
    const p = E.out(seg(t, T('s7') + 0.1, T('s7') + 1.1));
    // 四分仪
    arcS(O[0], O[1], R, -Math.PI / 2, -Math.PI / 2 + Math.PI / 2 * p, COL.gold, 4, 0.9);
    arcS(O[0], O[1], R - 26, -Math.PI / 2, -Math.PI / 2 + Math.PI / 2 * p, COL.gold, 1.2, 0.6);
    for (let k = 0; k <= 90; k++) {
      const a = -Math.PI / 2 + k * D2R;
      if (k > 90 * p) break;
      const L = k % 10 === 0 ? 26 : (k % 5 === 0 ? 16 : 8);
      line(O[0] + Math.cos(a) * R, O[1] + Math.sin(a) * R, O[0] + Math.cos(a) * (R - L), O[1] + Math.sin(a) * (R - L), COL.gold, 1, 0.8);
    }
    line(O[0], O[1], O[0], O[1] - R * p, COL.gold, 3, 0.9);
    line(O[0], O[1], O[0] + R * p, O[1], COL.gold, 3, 0.9);
    // 望远镜
    const ta = (-90 + 52) * D2R;
    const tp = E.out(seg(t, T('s7') + 0.8, T('s7') + 1.8));
    g.save(); g.translate(O[0], O[1]); g.rotate(ta); g.globalAlpha *= tp;
    const tg = g.createLinearGradient(0, -14, 0, 14);
    tg.addColorStop(0, '#6b5434'); tg.addColorStop(0.4, '#e6cf98'); tg.addColorStop(1, '#5b4428');
    g.fillStyle = tg; rrect(30, -12, R + 60, 24, 6); g.fill();
    g.fillStyle = '#d9bf86'; g.fillRect(R + 70, -17, 22, 34); g.fillRect(16, -15, 20, 30);
    g.restore();
    dot(O[0], O[1], 8, COL.goldHi, 1, 10);
    // 十字丝视野
    const vA = E.out(seg(t, T('s7') + 1.6, T('s7') + 2.4));
    if (vA > 0.003) {
      const V = [1380, 410], r = 150;
      const tip = [O[0] + Math.cos(ta) * (R + 90), O[1] + Math.sin(ta) * (R + 90)];
      line(tip[0], tip[1], V[0] - r * 0.95, V[1] + 40, COL.gold, 1, 0.5 * vA, [4, 5]);
      g.save(); g.globalAlpha *= vA;
      g.beginPath(); g.arc(V[0], V[1], r, 0, Math.PI * 2); g.clip();
      const vg = g.createRadialGradient(V[0], V[1], 10, V[0], V[1], r);
      vg.addColorStop(0, '#3a3424'); vg.addColorStop(1, '#100d08');
      g.fillStyle = vg; g.fillRect(V[0] - r, V[1] - r, r * 2, r * 2);
      // 远处的塔
      g.fillStyle = 'rgba(239,231,212,0.75)';
      g.beginPath(); g.moveTo(V[0] - 14, V[1] + 60); g.lineTo(V[0] - 14, V[1] - 10); g.lineTo(V[0], V[1] - 52); g.lineTo(V[0] + 14, V[1] - 10); g.lineTo(V[0] + 14, V[1] + 60); g.fill();
      g.fillRect(V[0] - r, V[1] + 60, r * 2, 2);
      line(V[0] - r, V[1], V[0] + r, V[1], COL.redHi, 1.2, 0.95);
      line(V[0], V[1] - r, V[0], V[1] + r, COL.redHi, 1.2, 0.95);
      g.restore();
      arcS(V[0], V[1], r, 0, Math.PI * 2, COL.gold, 2, vA);
      text('十字丝对准远处的塔尖', V[0], V[1] + r + 46, { f: 'zhm', size: 26, color: COL.ivory, alpha: 0.75 * vA, align: 'center' });
    }
    g.restore();
    // 1° = 57 060 托阿斯
    const nA = E.out(seg(t, T('s8') + 0.1, T('s8') + 1.0));
    if (nA > 0.003) {
      g.save(); g.globalAlpha *= qA;
      card(1110, 690, 640, 170, { alpha: nA });
      const cnt = fmt(57060 * E.out(seg(t, T('s8') + 0.2, T('s8') + 1.6)));
      text('1° =', 1150, 790, { f: 'num', size: 64, color: COL.ivory, alpha: nA });
      goldText(cnt, 1290, 790, 80, { f: 'num', alpha: nA });
      text('托阿斯', 1560, 790, { f: 'zhm', size: 30, color: COL.ivory, alpha: 0.8 * nA });
      text('≈ 111 公里 · 巴黎 — 亚眠', 1152, 836, { f: 'zhm', size: 26, color: COL.gold, alpha: nA * E.out(seg(t, T('s8') + 1.2, T('s8') + 2.0)) });
      g.restore();
    }
  }
};
