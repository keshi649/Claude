/* 开场（四万公里与一根木棍）、片名、第一章（埃拉托色尼：一口井、一根棍、1/50）。 */

function fmt(n) { return Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' '); }
// 逐位滚动的数字（左对齐）；dt：从开始滚动算起的秒数
function rollDigits(oldS, newS, x, y, S, dt, o = {}) {
  const f = o.f || 'num';
  setFont(f, S);
  let xo = x, xn = x;
  const n = Math.max(oldS.length, newS.length);
  for (let k = 0; k < n; k++) {
    const co = oldS[k] || '', cn = newS[k] || '';
    setFont(f, S);
    const wo = co ? g.measureText(co).width : 0, wn = cn ? g.measureText(cn).width : 0;
    const u = co === cn ? 1 : E.inOut(seg(dt, k * 0.06, k * 0.06 + 0.5));
    const draw = (s, xx, yy, a) => (o.color ? text(s, xx, yy, { f, size: S, color: o.color, alpha: a * (o.alpha || 1), glow: o.glow })
      : goldText(s, xx, yy, S, { f, alpha: a * (o.alpha === undefined ? 1 : o.alpha) }));
    if (co === cn) draw(cn, xn, y, 1);
    else {
      if (co && u < 1) draw(co, xo, y - u * S * 0.8, 1 - u);
      if (cn) draw(cn, xn, y + (1 - u) * S * 0.8, u);
    }
    xo += wo; xn += wn;
  }
}
// 尺寸标注线（两端短竖线 + 中间文字）
function dimLine(x1, y1, x2, y2, label, o = {}) {
  const a = o.alpha === undefined ? 1 : o.alpha;
  if (a <= 0.003) return;
  const c = o.color || COL.gold;
  const ang = Math.atan2(y2 - y1, x2 - x1), nx = -Math.sin(ang) * 9, ny = Math.cos(ang) * 9;
  line(x1, y1, x2, y2, c, 1.3, a * 0.85);
  line(x1 - nx, y1 - ny, x1 + nx, y1 + ny, c, 1.3, a * 0.85);
  line(x2 - nx, y2 - ny, x2 + nx, y2 + ny, c, 1.3, a * 0.85);
  if (label) text(label, (x1 + x2) / 2 + (o.dx || 0), (y1 + y2) / 2 + (o.dy || 0), { f: o.f || 'zhm', size: o.size || 24, color: c, alpha: a, align: 'center' });
}

// ======================= 开场 =======================
const OPEN = { cx: 700, cy: 470, R: 290, k: 0.5 };
SCENES.open = function (t) {
  const t4 = T('o4');
  // ---- 地球仪与子午圈 ----
  const ga = E.sine(seg(t, 0.5, 2.2)) * (1 - E.sine(seg(t, t4 - 0.2, t4 + 0.8)));
  if (ga > 0.003) {
    const sc = lerp(1, 0.86, E.inOut(seg(t, t4 - 0.2, t4 + 0.8)));
    const { cx, cy } = OPEN, R = OPEN.R * sc;
    g.save(); g.globalAlpha *= ga;
    globe(cx, cy, R, t * 0.12);
    const p = E.inOut(seg(t, T('o1') + 0.2, T('o1') + 3.4));
    const head = meridian(cx, cy, R, OPEN.k, p);
    if (head && p < 1) glowDot(head[0], head[1], 26, 'rgba(255,230,170,0.9)');
    // 计数：0 → 40 008
    const kmA = E.sine(seg(t, T('o1') + 0.1, T('o1') + 0.8));
    text('子午线周长', 1130, 368, { f: 'zhm', size: 28, color: COL.ivory, alpha: 0.6 * kmA, ls: 4 });
    const dRoll = t - (T('o2') + 0.7);
    if (dRoll < 0) goldText(fmt(40008 * p), 1126, 500, 128, { f: 'num', alpha: kmA });
    else rollDigits('40 008', '40 000', 1126, 500, 128, dRoll, { alpha: kmA });
    setFont('num', 128);
    text('km', 1126 + g.measureText(dRoll < 0 ? fmt(40008 * p) : '40 000').width + 18, 500, { f: 'numl', size: 48, color: COL.gold, alpha: 0.8 * kmA });
    const ap = E.out(seg(t, T('o2') + 0.7, T('o2') + 1.4));
    text('≈', 1080, 492, { f: 'num', size: 64, color: COL.gold, alpha: ap * kmA });
    // 「确实有人」：北极到赤道这四分之一，被单独点亮
    const q = E.sine(seg(t, T('o3') + 0.2, T('o3') + 1.4));
    if (q > 0.003) {
      const pts = meridianPts(cx, cy, R, OPEN.k, 240).slice(0, 61);
      g.save(); g.globalAlpha *= q; g.strokeStyle = COL.red; g.lineWidth = 5; g.lineCap = 'round';
      g.shadowColor = 'rgba(230,90,70,0.9)'; g.shadowBlur = 16; g.beginPath();
      pts.forEach((pt, i) => (i ? g.lineTo(pt[0], pt[1]) : g.moveTo(pt[0], pt[1]))); g.stroke(); g.restore();
      const mid = pts[30];
      text('北极 → 赤道', mid[0] + 26, mid[1] - 8, { f: 'zhm', size: 26, color: COL.redHi, alpha: q });
      text('10 000 km', mid[0] + 26, mid[1] + 30, { f: 'num', size: 36, color: COL.redHi, alpha: q });
      text('1/4', 1130, 590, { f: 'num', size: 40, color: COL.redHi, alpha: q * 0.9 });
      text('一万公里，又是一个整数。', 1190, 588, { f: 'zhm', size: 26, color: COL.ivory, alpha: q * 0.6 });
    }
    g.restore();
  }
  // ---- 木棍与影子 ----
  const sa = E.sine(seg(t, t4 + 0.2, t4 + 1.2));
  if (sa > 0.003) {
    g.save(); g.globalAlpha *= sa;
    const GY = 700, X = 960, Hh = 300;
    // 地面
    const fl = g.createLinearGradient(0, GY, 0, H);
    fl.addColorStop(0, 'rgba(60,46,30,0.55)'); fl.addColorStop(1, 'rgba(10,8,6,0)');
    g.fillStyle = fl; g.fillRect(0, GY, W, H - GY);
    const hz = g.createLinearGradient(0, 0, W, 0);
    hz.addColorStop(0, 'rgba(227,194,122,0)'); hz.addColorStop(0.5, 'rgba(227,194,122,0.45)'); hz.addColorStop(1, 'rgba(227,194,122,0)');
    g.fillStyle = hz; g.fillRect(0, GY, W, 1.5);
    // 地面上的一片暖光，好让影子看得见
    g.save(); g.translate(X + 120, GY + 40); g.scale(1, 0.16);
    const pool = g.createRadialGradient(0, 0, 0, 0, 0, 900);
    pool.addColorStop(0, 'rgba(150,115,70,0.55)'); pool.addColorStop(0.6, 'rgba(110,80,45,0.2)'); pool.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = pool; g.beginPath(); g.arc(0, 0, 900, 0, Math.PI * 2); g.fill(); g.restore();
    // 太阳从低处升到高处
    const el = lerp(14, 58, E.inOut(seg(t, t4 + 0.6, T('o6') + 1.2))) * D2R;
    const sx = X - Math.cos(el) * 760, sy = GY - Math.sin(el) * 760;
    sun(sx, sy, 20, E.sine(seg(t, t4 + 0.4, t4 + 1.4)));
    // 平行光
    const dx = Math.cos(el), dy = Math.sin(el);
    for (let k = -8; k <= 8; k++) {
      const ox = -dy * k * 70, oy = dx * k * 70;
      const x0 = sx + ox, y0 = sy + oy;
      const L = 2200;
      line(x0, y0, x0 + dx * L, y0 + dy * L, 'rgba(255,225,170,1)', 1.2, 0.08 + 0.04 * Math.sin(t * 1.3 + k));
    }
    // 木棍从上方落下、插进地里
    const land = t4 + 0.9;
    const fall = E.in(seg(t, t4 + 0.3, land));
    const yOff = (1 - fall) * -260;
    const L = Hh / Math.tan(el);
    const shA = seg(t, land, land + 0.3);
    if (shA > 0) {
      g.save(); g.globalAlpha *= shA * 0.95; g.filter = 'blur(2.5px)';
      const sg2 = g.createLinearGradient(X, 0, X + L, 0);
      sg2.addColorStop(0, 'rgba(0,0,0,0.95)'); sg2.addColorStop(1, 'rgba(0,0,0,0.55)');
      g.fillStyle = sg2; g.beginPath();
      g.moveTo(X - 7, GY + 1); g.lineTo(X + L, GY + 8 + L * 0.03); g.lineTo(X + L + 4, GY + 15 + L * 0.03); g.lineTo(X - 7, GY + 9); g.closePath(); g.fill();
      g.restore();
    }
    gnomon(X, GY + yOff, Hh, { alpha: clamp(fall * 3), noBase: fall < 1 });
    // 落地扬尘
    const du = seg(t, land, land + 1.2);
    if (du > 0 && du < 1) {
      for (let i = 0; i < 18; i++) {
        const h1 = hash(i * 5.3), h2 = hash(i * 9.1);
        const dir = h1 < 0.5 ? -1 : 1;
        dot(X + dir * (14 + h2 * 90) * E.out(du), GY - 6 - Math.sin(du * Math.PI) * (10 + h1 * 30), 1.5 + h2 * 1.5, '#efe3c6', (1 - du) * 0.8);
      }
      g.save(); g.globalAlpha *= (1 - du); g.strokeStyle = COL.gold; g.lineWidth = 1.2;
      g.beginPath(); g.ellipse(X, GY, 40 + du * 140, 6 + du * 14, 0, 0, Math.PI * 2); g.stroke(); g.restore();
    }
    // 线框：杆高、影长、角度（参考片里骰子变成 1/6 线框的那一下）
    const w = E.out(seg(t, T('o6') + 0.3, T('o6') + 1.4));
    if (w > 0.003) {
      const tipX = X, tipY = GY - Hh, shX = X + L;
      lineP(tipX, tipY, shX, GY, w, COL.goldHi, 2, 0.9);
      dimLine(X - 60, GY, X - 60, tipY, '', { alpha: w });
      text('杆高', X - 82, (GY + tipY) / 2 + 8, { f: 'zhm', size: 26, color: COL.gold, alpha: w, align: 'right' });
      dimLine(X, GY + 46, shX, GY + 46, '影长', { alpha: w, dy: 40 });
      const a0 = Math.PI / 2, a1 = Math.atan2(GY - tipY, shX - tipX);
      arcS(tipX, tipY, 70, a1, a0, COL.goldHi, 2.5, w);
      text('θ', tipX + 30, tipY + 110, { f: 'it', size: 46, color: COL.goldHi, alpha: w, glow: 10 });
      g.save(); g.globalAlpha *= w * 0.8; g.strokeStyle = COL.gold; g.lineWidth = 1.2;
      g.strokeRect(X + 2, GY - 22, 20, 20); g.restore();
      // 浮出几个小问号般的刻度标签
      for (let i = 0; i < 5; i++) {
        const u = E.out(seg(t, T('o6') + 0.8 + i * 0.15, T('o6') + 1.4 + i * 0.15));
        const ang = -Math.PI / 2 + (i - 2) * 0.5;
        const rx = tipX + Math.cos(ang) * 230, ry = tipY + 40 + Math.sin(ang) * 150;
        text('?', rx, ry, { f: 'num', size: 30, color: COL.gold, alpha: u * 0.5, align: 'center' });
      }
    }
    g.restore();
  }
};

// ======================= 片名 =======================
SCENES.title = function (t) {
  const t0 = SCN.title.t0;
  const lt = t - t0;
  // 放射光
  const ra = E.sine(seg(lt, 0, 1.4));
  g.save(); g.translate(960, 470); g.rotate(lt * 0.03);
  for (let i = 0; i < 40; i++) {
    const a = i / 40 * Math.PI * 2, w = 0.012 + hash(i) * 0.02, L = 700 + hash(i + 3) * 500;
    const gr = g.createLinearGradient(0, 0, Math.cos(a) * L, Math.sin(a) * L);
    gr.addColorStop(0, `rgba(240,205,140,${0.10 * ra})`); gr.addColorStop(1, 'rgba(240,205,140,0)');
    g.fillStyle = gr; g.beginPath(); g.moveTo(0, 0);
    g.lineTo(Math.cos(a - w) * L, Math.sin(a - w) * L); g.lineTo(Math.cos(a + w) * L, Math.sin(a + w) * L); g.closePath(); g.fill();
  }
  g.restore();
  glowDot(960, 470, 520, 'rgba(240,200,130,0.10)', ra);
  text('DE  MAGNITUDINE  TERRAE', 960, 322, { f: 'cap', size: 30, color: COL.ivory, alpha: 0.72 * E.sine(seg(lt, 0.2, 1.3)), align: 'center', ls: 10 });
  // 片名逐字浮现
  const title = '地球的尺寸';
  setFont('zhk', 156); g.letterSpacing = '20px';
  const tw = g.measureText(title).width - 20; g.letterSpacing = '0px';
  let x = 960 - tw / 2;
  [...title].forEach((ch, i) => {
    const u = E.out(seg(lt, 0.4 + i * 0.13, 1.3 + i * 0.13));
    setFont('zhk', 156);
    const cw = g.measureText(ch).width;
    goldText(ch, x, 512 + (1 - u) * 16, 156, { f: 'zhk', alpha: u, glow: 40 });
    x += cw + 20;
  });
  // 一段地球的弧线 + 刻度尺（对应参考片片名下的正态曲线）
  const p = E.inOut(seg(lt, 1.1, 2.6));
  const ACX = 960, ACY = 2612, AR = 2022, half = Math.asin(410 / AR);   // 弧的两端正好落在刻度尺上
  if (p > 0) {
    arcS(ACX, ACY, AR, -Math.PI / 2 - half, -Math.PI / 2 - half + 2 * half * p, COL.goldHi, 2.2, 0.9);
    const hx = ACX + Math.cos(-Math.PI / 2 - half + 2 * half * p) * AR, hy = ACY + Math.sin(-Math.PI / 2 - half + 2 * half * p) * AR;
    if (p < 1) glowDot(hx, hy, 18, 'rgba(255,230,170,0.9)');
    line(550, 632, 550 + 820 * p, 632, COL.gold, 1.2, 0.7);
    for (let k = 0; k <= 82; k++) {
      const xx = 550 + k * 10;
      if (xx > 550 + 820 * p) break;
      const big = k % 10 === 0;
      line(xx, 632, xx, 632 + (big ? 12 : 6), COL.gold, 1, big ? 0.8 : 0.45);
    }
  }
  text('人类如何用影子量出世界', 960, 712, { f: 'zhm', size: 40, color: COL.ivory, alpha: 0.9 * E.sine(seg(lt, 2.0, 2.9)), align: 'center', ls: 10 });
  const ba = E.sine(seg(lt, 2.5, 3.4));
  text('知洲  出品', 960, 772, { f: 'zhm', size: 26, color: COL.gold, alpha: 0.85 * ba, align: 'center', ls: 4 });
  line(800, 763, 880, 763, COL.gold, 1, 0.6 * ba); line(1040, 763, 1120, 763, COL.gold, 1, 0.6 * ba);
};

// ======================= 第一章：埃拉托色尼 =======================
const ERA1 = { cx: 760, cy: 850, R: 480 };
function era1Rays(x0, x1, step, yTop, yBot, p, alpha) {
  for (let x = x0; x <= x1; x += step) {
    const yb = typeof yBot === 'function' ? yBot(x) : yBot;
    lineP(x, yTop, x, yb, p, 'rgba(255,226,170,1)', 1.2, alpha);
  }
}
SCENES.era1 = function (t) {
  const s = SCN.era1;
  text('ΓΕΩΜΕΤΡΙΑ', 960, 330, { f: 'cap', size: 200, color: COL.gold, alpha: 0.05 * vis(t, s.t0, T('e4'), 1.0), align: 'center', ls: 36 });
  text('geometria · 丈量大地', 960, 390, { f: 'it', size: 30, color: COL.gold, alpha: 0.28 * vis(t, s.t0 + 0.6, T('e1') + 1.0, 0.8), align: 'center', ls: 4 });

  // ---- 1. 两个小剧场：赛伊尼的井、亚历山大的木棍 ----
  const pA = vis(t, T('e1') - 0.3, T('e3') - 0.2, 0.6);      // 赛伊尼面板
  const zoom = E.inOut(seg(t, T('e3') - 0.1, T('e3') + 0.9)); // 亚历山大面板放大
  const bA = vis(t, T('e2') - 0.2, T('e4') - 0.3, 0.6);
  const GY = 600;
  if (pA > 0.003) {
    g.save(); g.globalAlpha *= pA;
    const X = 600;
    line(360, GY, 840, GY, COL.gold, 1.4, 0.55);
    // 井：石砌井口 + 竖井 + 井底水面
    g.fillStyle = '#0a0806'; g.fillRect(X - 34, GY, 68, 170);
    g.strokeStyle = 'rgba(227,194,122,0.6)'; g.lineWidth = 1.5;
    g.beginPath(); g.moveTo(X - 34, GY); g.lineTo(X - 34, GY + 170); g.moveTo(X + 34, GY); g.lineTo(X + 34, GY + 170); g.stroke();
    for (let k = 0; k < 6; k++) {
      line(X - 44, GY + 14 + k * 28, X - 34, GY + 14 + k * 28, COL.gold, 1, 0.3);
      line(X + 34, GY + 14 + k * 28, X + 44, GY + 14 + k * 28, COL.gold, 1, 0.3);
    }
    g.fillStyle = 'rgba(227,194,122,0.25)'; g.fillRect(X - 50, GY - 18, 16, 18); g.fillRect(X + 34, GY - 18, 16, 18);
    sun(X, 190, 20, E.sine(seg(t, T('e1') - 0.2, T('e1') + 0.6)));
    const rp = E.inOut(seg(t, T('e1') + 0.2, T('e1') + 1.6));
    era1Rays(X - 200, X + 200, 40, 230, x => (Math.abs(x - X) < 30 ? GY + 160 : GY), rp, 0.35);
    const glint = seg(t, T('e1') + 1.5, T('e1') + 1.9);
    if (glint > 0) {
      g.save(); g.globalAlpha *= glint; g.fillStyle = '#ffe9b8'; g.shadowColor = '#ffd98a'; g.shadowBlur = 30;
      g.beginPath(); g.ellipse(X, GY + 162, 30, 6, 0, 0, Math.PI * 2); g.fill(); g.restore();
      glowDot(X, GY + 160, 70 + 10 * Math.sin(t * 6), 'rgba(255,225,150,0.5)', glint);
    }
    text('赛伊尼', X, 826, { f: 'zh', size: 34, color: COL.ivory, align: 'center', alpha: 0.95 });
    text('今阿斯旺 · 正午无影', X, 866, { f: 'zhm', size: 24, color: COL.gold, align: 'center', alpha: 0.75, ls: 2 });
    g.restore();
  }
  // 中间的方向提示
  const mid = Math.min(pA, bA);
  if (mid > 0.003) {
    line(860, GY, 1000, GY, COL.gold, 1.2, 0.5 * mid, [3, 7]);
    text('南', 872, GY + 34, { f: 'zhm', size: 22, color: COL.dim, alpha: mid });
    text('北', 988, GY + 34, { f: 'zhm', size: 22, color: COL.dim, alpha: mid, align: 'right' });
  }
  if (bA > 0.003) {
    const X = 1280, Hh = 240, ang = 7.2 * D2R;
    const tipY = GY - Hh;
    // 放大：以棍顶为中心
    const zx = lerp(X, 700, zoom), zy = lerp(tipY, 300, zoom), zs = lerp(1, 1.7, zoom);
    g.save(); g.globalAlpha *= bA;
    g.translate(zx, zy); g.scale(zs, zs); g.translate(-X, -tipY);
    line(1040, GY, 1520, GY, COL.gold, 1.4, 0.55);
    sun(X - Math.tan(ang) * 400, 190, 20, E.sine(seg(t, T('e2') - 0.2, T('e2') + 0.6)) * (1 - zoom));
    const rp = E.inOut(seg(t, T('e2') + 0.2, T('e2') + 1.6));
    for (let k = -5; k <= 5; k++) {
      const x0 = X + k * 40 - Math.tan(ang) * 370;
      lineP(x0, 230, x0 + Math.tan(ang) * 370, GY, rp, 'rgba(255,226,170,1)', 1.2, 0.35 * (1 - zoom * 0.6));
    }
    const shL = Hh * Math.tan(ang);
    const sh = seg(t, T('e2') + 1.2, T('e2') + 1.8);
    g.save(); g.globalAlpha *= sh; g.fillStyle = 'rgba(0,0,0,0.85)'; g.filter = 'blur(1px)';
    g.fillRect(X, GY - 2, shL, 7); g.restore();
    gnomon(X, GY, Hh, {});
    line(X - Math.tan(ang) * 300, tipY - 300, X + shL, GY, COL.goldHi, 1.6, 0.8 * rp);
    // 角度标注（放大后出现）
    const za = E.out(seg(t, T('e3') + 0.6, T('e3') + 1.4));
    if (za > 0.003) {
      const a0 = Math.PI / 2, a1 = Math.PI / 2 - ang;
      g.save(); g.globalAlpha *= za; g.fillStyle = 'rgba(227,194,122,0.35)';
      g.beginPath(); g.moveTo(X, tipY); g.arc(X, tipY, 120, a1, a0); g.closePath(); g.fill(); g.restore();
      arcS(X, tipY, 120, a1, a0, COL.goldHi, 2, za);
      line(X, tipY, X, tipY + 150, COL.ivory, 1, 0.5 * za, [4, 5]);
      text('7.2°', X + 34, tipY + 108, { f: 'num', size: 40, color: COL.goldHi, alpha: za, glow: 12 });
    }
    g.restore();
    if (zoom < 0.5) {
      const la = 1 - zoom * 2;
      text('亚历山大', X, 826, { f: 'zh', size: 34, color: COL.ivory, align: 'center', alpha: 0.95 * la });
      text('同一时刻 · 一小段影子', X, 866, { f: 'zhm', size: 24, color: COL.gold, align: 'center', alpha: 0.75 * la, ls: 2 });
    }
  }
  // ---- 2. 1/50 的饼 ----
  const pie = vis(t, T('e3') + 0.9, T('e4') - 0.3, 0.6);
  if (pie > 0.003) {
    const PX = 1360, PY = 450, PR = 160;
    g.save(); g.globalAlpha *= pie;
    arcS(PX, PY, PR, 0, Math.PI * 2, COL.gold, 1.5, 0.5);
    for (let k = 0; k < 50; k++) {
      const a = -Math.PI / 2 + k * 7.2 * D2R;
      const u = seg(t, T('e3') + 1.0 + k * 0.025, T('e3') + 1.2 + k * 0.025);
      line(PX + Math.cos(a) * (PR - 10), PY + Math.sin(a) * (PR - 10), PX + Math.cos(a) * PR, PY + Math.sin(a) * PR, COL.gold, 1, 0.6 * u);
    }
    g.fillStyle = 'rgba(240,205,130,0.85)'; g.shadowColor = 'rgba(240,205,130,0.8)'; g.shadowBlur = 20;
    g.beginPath(); g.moveTo(PX, PY); g.arc(PX, PY, PR, -Math.PI / 2, -Math.PI / 2 + 7.2 * D2R); g.closePath(); g.fill();
    g.restore();
    goldText('1/50', PX + 60, PY - PR - 18, 56, { f: 'num', alpha: pie });
    text('360° ÷ 7.2° = 50', PX, PY + PR + 66, { f: 'num', size: 40, color: COL.ivory, alpha: 0.85 * pie, align: 'center' });
  }
  // ---- 3. 地球剖面：平行光、两条半径、地心的 7.2° ----
  const ea = vis(t, T('e4') - 0.2, s.t1 + 1, 0.8);
  if (ea > 0.003) {
    const { cx, cy, R } = ERA1;
    g.save(); g.globalAlpha *= ea;
    const body = g.createRadialGradient(cx, cy - R * 0.4, R * 0.2, cx, cy, R);
    body.addColorStop(0, '#2a2016'); body.addColorStop(1, '#0d0a07');
    g.fillStyle = body; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
    // 绕一整圈（e6）
    const full = E.inOut(seg(t, T('e6') - 0.2, T('e6') + 1.6));
    arcS(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * Math.max(0.0001, full), COL.goldHi, 3, full > 0 ? 0.9 : 0);
    arcS(cx, cy, R, 0, Math.PI * 2, COL.gold, 1.5, 0.55);
    // 平行光
    const rp = E.inOut(seg(t, T('e4') + 0.1, T('e4') + 1.4));
    era1Rays(cx - 420, cx + 420, 42, 210, x => cy - Math.sqrt(Math.max(0, R * R - (x - cx) ** 2)), rp, 0.25);
    const syA = -Math.PI / 2, alA = -Math.PI / 2 + 7.2 * D2R;
    const sy = [cx, cy - R], al = [cx + Math.cos(alA) * R, cy + Math.sin(alA) * R];
    // 两条半径
    const rr = E.out(seg(t, T('e4') + 0.8, T('e4') + 1.8));
    lineP(sy[0], sy[1], cx, cy, rr, COL.ivory, 1.2, 0.6, [6, 6]);
    lineP(al[0], al[1], cx, cy, rr, COL.ivory, 1.2, 0.6, [6, 6]);
    // 亚历山大的木棍（沿半径向外）
    const gx = al[0] + Math.cos(alA) * 64, gy = al[1] + Math.sin(alA) * 64;
    line(al[0], al[1], gx, gy, '#e9dcc0', 5, 1);
    line(gx, gy - 140, gx, gy, COL.goldHi, 1.4, 0.8 * rp);
    // 两个角，同色呼吸
    const ang = E.out(seg(t, T('e4') + 1.4, T('e4') + 2.2));
    const pulse = 0.75 + 0.25 * Math.sin(t * 4);
    if (ang > 0.003) {
      g.save(); g.globalAlpha *= ang * pulse; g.fillStyle = 'rgba(240,205,130,0.45)';
      g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, 150, syA, alA); g.closePath(); g.fill();
      g.beginPath(); g.moveTo(gx, gy); g.arc(gx, gy, 60, -Math.PI / 2, alA); g.closePath(); g.fill(); g.restore();
      arcS(cx, cy, 150, syA, alA, COL.goldHi, 2, ang);
      text('7.2°', cx + 34, cy - 160, { f: 'num', size: 40, color: COL.goldHi, alpha: ang, glow: 10 });
      text('地心', cx, cy + 40, { f: 'zhm', size: 26, color: COL.ivory, alpha: 0.7 * ang, align: 'center' });
      text('7.2°', gx + 22, gy - 40, { f: 'num', size: 30, color: COL.goldHi, alpha: ang });
    }
    const lab = E.out(seg(t, T('e4') + 0.4, T('e4') + 1.2));
    text('赛伊尼', sy[0] - 18, sy[1] - 18, { f: 'zh', size: 28, color: COL.ivory, alpha: lab, align: 'right' });
    text('亚历山大', gx + 18, gy + 6, { f: 'zh', size: 28, color: COL.ivory, alpha: lab });
    dot(sy[0], sy[1], 6, COL.goldHi, lab, 10); dot(al[0], al[1], 6, COL.goldHi, lab, 10);
    // 5000 斯塔德
    const arcA = E.out(seg(t, T('e5') + 0.1, T('e5') + 0.9));
    if (arcA > 0.003) {
      arcS(cx, cy, R + 2, syA, syA + 7.2 * D2R * arcA, COL.redHi, 6, 1);
      text('5000 斯塔德', sy[0] - 30, sy[1] - 62, { f: 'zh', size: 30, color: COL.redHi, alpha: arcA, align: 'center' });
    }
    // × 50：沿圆周一格一格数过去
    const n50 = Math.floor(lerp(0, 50, E.inOut(seg(t, T('e5') + 1.0, T('e5') + 3.4))));
    for (let k = 1; k <= n50; k++) {
      const a = syA + k * 7.2 * D2R;
      line(cx + Math.cos(a) * (R - 14), cy + Math.sin(a) * (R - 14), cx + Math.cos(a) * (R + 14), cy + Math.sin(a) * (R + 14), COL.goldHi, 2, 0.9);
    }
    // 右侧数字
    const RX = 1330;
    const cA = vis(t, T('e5') + 0.9, T('e6') - 0.1, 0.3);
    if (n50 > 0) text('× ' + n50, RX, 520, { f: 'num', size: 110, color: COL.goldHi, alpha: cA, glow: 20 });
    const bigA = E.out(seg(t, T('e6') + 0.1, T('e6') + 1.0));
    if (bigA > 0.003) {
      goldText(fmt(250000 * E.out(seg(t, T('e6') + 0.1, T('e6') + 1.5))), RX, 470, 112, { f: 'num', alpha: bigA });
      text('斯塔德', RX + 4, 528, { f: 'zhm', size: 30, color: COL.ivory, alpha: 0.75 * bigA, ls: 4 });
    }
    // 换成公里：区间
    const rA = E.out(seg(t, T('e7') + 0.1, T('e7') + 1.0));
    if (rA > 0.003) {
      const x0 = 1300, x1 = 1840, v0 = 36000, v1 = 49000, by = 680;
      const X = v => lerp(x0, x1, (v - v0) / (v1 - v0));
      line(x0, by, x1, by, COL.ivory, 1.2, 0.4 * rA);
      for (let v = 36000; v <= 49000; v += 1000) line(X(v), by, X(v), v % 5000 === 0 ? by + 14 : by + 8, COL.ivory, 1, 0.4 * rA);
      g.save(); g.globalAlpha *= rA; g.fillStyle = 'rgba(227,194,122,0.55)';
      g.fillRect(X(39375), by - 14, (X(46250) - X(39375)) * E.out(seg(t, T('e7') + 0.3, T('e7') + 1.3)), 14); g.restore();
      text('3.9 万', X(39375), by - 30, { f: 'zh', size: 28, color: COL.gold, alpha: rA, align: 'center' });
      text('4.6 万 km', X(46250), by - 30, { f: 'zh', size: 28, color: COL.gold, alpha: rA, align: 'center' });
      text('1 斯塔德 = 157.5 米？还是 185 米？', x0, by + 104, { f: 'zhm', size: 24, color: COL.ivory, alpha: 0.6 * rA });
      text('古代的斯塔德不止一种', x0, by + 140, { f: 'zhm', size: 22, color: COL.ivory, alpha: 0.4 * rA });
      const tA = E.out(seg(t, T('e8') + 0.1, T('e8') + 0.9));
      if (tA > 0.003) {
        const xt = X(40008);
        line(xt, by - 22, xt, by + 26, COL.redHi, 3, tA);
        dot(xt, by + 26, 5, COL.redHi, tA, 12);
        text('真实 40 008', xt, by + 62, { f: 'zh', size: 28, color: COL.redHi, alpha: tA, align: 'center', glow: 8, glowColor: 'rgba(230,90,70,0.6)' });
      }
    }
    g.restore();
  }
};
