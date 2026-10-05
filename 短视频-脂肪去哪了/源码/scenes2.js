'use strict';
/* scenes2.js：第一关 —— 冷战的日期戳（核试验 → 碳-14 → 细胞的出生日期），房子拆不掉，油在流动 */

/* 倒数片头：灰底、十字准星、转动的扫描线、数字 */
function leader(g, w, h, num, t) {
  g.fillStyle = '#A59C8C'; g.fillRect(0, 0, w, h);
  g.strokeStyle = '#2B2823'; g.lineWidth = 6;
  g.beginPath(); g.moveTo(0, h / 2); g.lineTo(w, h / 2); g.moveTo(w / 2, 0); g.lineTo(w / 2, h); g.stroke();
  circ(g, w / 2, h / 2, h * .34); g.stroke(); circ(g, w / 2, h / 2, h * .26); g.stroke();
  const a = (t * 2.4) % 1 * TAU; g.fillStyle = 'rgba(30,26,20,.35)'; g.beginPath(); g.moveTo(w / 2, h / 2); g.arc(w / 2, h / 2, h * .34, -Math.PI / 2, -Math.PI / 2 + a); g.closePath(); g.fill();
  text(g, String(num), w / 2, h / 2 + 6, h * .42, '#2B2823', 'black');
}

/* ================= 冷战：核试验 → 碳-14 曲线 → 碳的旅程 → 出生日期 ================= */
function sceneCold(g, t) {
  bgDark(g, t, { c0: '#17294A', c1: '#050B16' });
  motes(g, t, 22, '#CFE6FF', .2, 14);
  const tTest0 = S('a1') + 1.55, tChart = S('a3') - .4, tPath = S('a4') - .45, tDecl = S('a5') - .35;
  const filmOut = E.in(seg(t, tPath - .2, tPath + .35));

  /* --- 胶片窗口 --- */
  if (filmOut < 1) {
    const big = { x: 430, y: 176, w: 1060, h: 636 }, small = { x: 130, y: 270, w: 560, h: 336 };
    const m = E.io(seg(t, tChart, tChart + .8));
    const fx = lerp(big.x, small.x, m), fy = lerp(big.y, small.y, m), fw = lerp(big.w, small.w, m), fh = lerp(big.h, small.h, m);
    // 先把内容画到离屏画布，再整体上滤镜贴过来
    tmpG.setTransform(1, 0, 0, 1, 0, 0); tmpG.globalAlpha = 1; tmpG.filter = 'none'; tmpG.clearRect(0, 0, 1200, 720);
    const jx = (hash(Math.floor(t * 24), 1) - .5) * 5, jy = (hash(Math.floor(t * 24), 2) - .5) * 4;
    tmpG.save(); tmpG.translate(jx, jy);
    const tests = 4, td = (tChart - .1 - tTest0) / tests;
    if (t < tTest0) {
      const n = clamp(Math.ceil((tTest0 - t) / ((tTest0 - (T.g1 + .4)) / 5)), 1, 5);
      leader(tmpG, 1200, 720, n, t);
    } else {
      const idx = Math.min(tests - 1, Math.floor((t - tTest0) / td)), k = clamp((t - tTest0 - idx * td) / td);
      const offs = [[.38, 1.0], [.6, .9], [.45, 1.1], [.55, 1.0]][idx];
      testSite(tmpG, t, 1200, 720, k * .98, { cx: 1200 * offs[0], sc: offs[1] });
      // 片内字幕条
      tmpG.fillStyle = 'rgba(0,0,0,.55)'; tmpG.fillRect(0, 640, 1200, 80);
      text(tmpG, '大气层核试验', 150, 681, 40, '#F3E8D2', 'black');
      const bx0 = 400, bx1 = 1020; tmpG.strokeStyle = 'rgba(243,232,210,.5)'; tmpG.lineWidth = 4; tmpG.beginPath(); tmpG.moveTo(bx0, 681); tmpG.lineTo(bx1, 681); tmpG.stroke();
      const prog = clamp((t - tTest0) / (tests * td)); tmpG.strokeStyle = '#FFB347'; tmpG.beginPath(); tmpG.moveTo(bx0, 681); tmpG.lineTo(lerp(bx0, bx1, prog), 681); tmpG.stroke();
      circ(tmpG, lerp(bx0, bx1, prog), 681, 9); tmpG.fillStyle = '#FFB347'; tmpG.fill();
      text(tmpG, '1955', bx0 - 24, 681, 30, '#F3E8D2', 'black', 1.3, 'right'); text(tmpG, '1963', bx1 + 24, 681, 30, '#F3E8D2', 'black', 1.3, 'left');
    }
    tmpG.restore();
    filmFX(tmpG, t, 0, 0, 1200, 720);
    g.save(); g.globalAlpha *= 1 - filmOut;
    const sc = fw / 1200;
    // 胶片边框与片孔
    g.save(); g.translate(fx, fy); g.scale(sc, sc); filmFrame(g, t, 0, 0, 1200, 720, t * 60); g.restore();
    g.filter = 'sepia(.85) contrast(1.12) brightness(.95) saturate(1.1)';
    g.drawImage(tmpCv, 0, 0, 1200, 720, fx, fy, fw, fh);
    g.filter = 'none';
    g.restore();
  }

  /* --- 碳-14 曲线（先涨到 1963 年的峰值） --- */
  const chartIn = E.out(seg(t, tChart + .2, tChart + .9)) * (1 - E.in(seg(t, tPath - .2, tPath + .3)));
  if (chartIn > .01) {
    g.save(); g.globalAlpha *= chartIn; g.translate((1 - chartIn) * 120, 0);
    const p = lerp(0, 13.5 / 60, E.io(seg(t, tChart + .45, S('a3') + 2.0)));
    const ch = bombChart(g, 840, 270, 820, 500, p, {});
    text(g, '大气中的碳-14（示意）', 840 + 410, 190, 38, C.white, 'black');
    if (p > .2) {
      const pk = pop(t, S('a3') + 2.1, .5);
      if (pk > 0) {
        g.save(); g.translate(ch.px(1963), ch.py(1.95) - 70); g.scale(pk, pk);
        tag(g, 0, 0, '1963 · 将近 2 倍', 36, { fill: 'rgba(150,60,0,.92)', lineCol: C.orange, col: '#FFE3C0', font: 'black', lw: 3 });
        g.restore();
        g.strokeStyle = hexA(C.orange, .9 * pk); g.lineWidth = 3; g.setLineDash([8, 8]); g.beginPath(); g.moveTo(ch.px(1963), ch.py(1.95)); g.lineTo(ch.px(1963), ch.py(.9)); g.stroke(); g.setLineDash([]);
      }
    }
    g.restore();
  }

  /* --- 碳的旅程：空气 → 植物 → 饭碗 → 新细胞的基因 --- */
  {
    const a = win(t, tPath, tDecl + .1, .45, .4);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const xs = [330, 760, 1190, 1600], y = 520;
      const labels = ['空气', '植物', '我们的饭碗', '新细胞的基因'];
      const tm = [tPath + .2, CK('a4', 0) + .1, CK('a4', 0) + 1.55, CK('a4', 1) + .35];
      const tp = [tPath + .1, tm[1] - .3, tm[2] - .3, tm[3] - .3];
      // 节点
      iconCloud(g, xs[0], y - 20, 1.55);
      iconLeaf(g, xs[1], y - 10, 1.35, -.45);
      iconBowl(g, xs[2], y + 6, 1.15, t);
      const dv = pop(t, CK('a4', 1) - .1, .5);
      if (dv > 0) { g.save(); g.translate(xs[3], y - 70); g.scale(dv, dv); iconDividing(g, 0, 0, 1.0, E.io(seg(t, CK('a4', 1) + .1, CK('a4', 2)))); g.restore(); }
      const dn = pop(t, CK('a4', 2) - .1, .5);
      if (dn > 0) { g.save(); g.translate(xs[3], y + 120); g.scale(dn, dn); dnaHelix(g, 0, 0, 250, { amp: 34, turns: 2.4, ph: t * 2, lw: 7 }); g.restore(); }
      labels.forEach((lb, i) => { if (i === 3 && dv <= 0) return; withAlpha(g, i === 3 ? dv : 1, () => tag(g, xs[i], y + 210 + (i === 3 ? 60 : 0), lb, 34, { font: 'black' })); });
      // 箭头
      for (let i = 0; i < 3; i++) {
        const u = E.out(seg(t, tp[i + 1] - .1, tp[i + 1] + .45));
        if (u > 0) arrow(g, xs[i] + 118, y - 10, lerp(xs[i] + 118, xs[i + 1] - 118, u), y - 10, 14, hexA(C.white, .55), { head: 30 });
      }
      // 碳-14 小球沿路走
      let dx = xs[0], dy = y - 60;
      for (let i = 0; i < 3; i++) { const u = E.io(seg(t, tm[i + 1] - .55, tm[i + 1])); if (u > 0) { dx = lerp(xs[i], xs[i + 1], u); dy = y - 60 - Math.sin(u * Math.PI) * 80; } }
      if (t > tm[3] + .3) { const u = E.io(seg(t, tm[3] + .3, CK('a4', 2) + .5)); dx = xs[3]; dy = lerp(y - 60, y + 100, u); }
      c14Dot(g, dx, dy, 1.0, t);
      g.restore();
    }
  }

  /* --- 曲线下降 → 每个新细胞有了“出生日期” --- */
  {
    const a = win(t, tDecl, T.cells + .5, .5, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const p = lerp(13.5 / 60, 1, E.io(seg(t, tDecl + .2, S('a5') + 4.2)));
      const ch = bombChart(g, 190, 280, 880, 500, p, {});
      text(g, '大气中的碳-14（示意）', 190 + 440, 200, 38, C.white, 'black');
      withAlpha(g, seg(t, S('a5') + 1.5, S('a5') + 2.0), () => tag(g, ch.px(1984), ch.py(1.62), '一路下降', 36, { font: 'black', fill: 'rgba(0,70,95,.9)', lineCol: C.cyan }));
      // 右侧：细胞 + DNA + 出生日期章
      const pc = pop(t, CK('a5', 1) - .05, .55);
      if (pc > 0) {
        g.save(); g.translate(1530, 520); g.scale(pc, pc);
        fatCell(g, { x: 0, y: 0, r: 150, t, seed: 3 });
        dnaHelix(g, 0, 0, 190, { amp: 30, turns: 2, ph: t * 2, lw: 7, tagAt: .62, t, tagS: .9 });
        g.restore();
        const st = seg(t, CK('a5', 2) + .05, CK('a5', 2) + .45);
        if (st > 0) { stamp(g, 1530, 400, '出生日期', st, { px: 52, rot: -.12, col: C.red }); }
        withAlpha(g, pc, () => tag(g, 1530, 740, '一个新细胞', 34, { font: 'black' }));
      }
      g.restore();
    }
  }
  vignette(g, .45);
}

/* ================= 小工具 ================= */
/* 蜂窝状排布的细胞团，围绕 (0,0)，取离中心最近的 n 个位置 */
function hexCluster(n, r, gap = 5) {
  const d = r * 2 + gap, pts = [];
  for (let q = -7; q <= 7; q++) for (let p = -7; p <= 7; p++) { const x = d * (q + p / 2), y = d * p * .866; pts.push([x, y, x * x + y * y]); }
  pts.sort((a, b) => a[2] - b[2]);
  return pts.slice(0, n).map(([x, y]) => [x, y]);
}
function houseIcon(g, x, y, s = 1, col = C.fat) {
  g.save(); g.translate(x, y); g.scale(s, s); g.lineJoin = 'round'; g.lineCap = 'round';
  g.beginPath(); g.moveTo(-96, -6); g.lineTo(0, -100); g.lineTo(96, -6); g.lineTo(96, 84); g.lineTo(-96, 84); g.closePath(); fs(g, 'rgba(255,201,60,.16)', col, 9);
  rr(g, -26, 18, 52, 66, 6); fs(g, 'rgba(255,201,60,.3)', col, 6);
  g.restore();
}
/* 细胞数量随年龄的变化（示意）：成年后是一条平线 */
function numChart(g, x, y, w, h, p, o = {}) {
  const px = a => x + a / 60 * w, py = v => y + h - v * h;
  const ss = u => { u = clamp(u); return u * u * (3 - 2 * u); };
  g.save();
  rr(g, x - 80, y - 74, w + 130, h + 160, 22); fs(g, 'rgba(8,18,34,.78)', hexA(C.white, .18), 2);
  g.strokeStyle = 'rgba(160,190,235,.18)'; g.lineWidth = 1.5;
  for (const a of [0, 20, 40, 60]) { g.beginPath(); g.moveTo(px(a), y); g.lineTo(px(a), y + h); g.stroke(); text(g, a + '岁', px(a), y + h + 30, 24, C.mute, 'bold'); }
  text(g, '脂肪细胞数量（示意）', x + w / 2 - 10, y - 38, 30, C.white, 'black');
  const A = 60 * clamp(p);
  const line = (vmax, col, lab) => {
    g.beginPath(); for (let a = 0; a <= A + .01; a += 1) { const v = vmax * ss(Math.min(a, 20) / 20); a ? g.lineTo(px(a), py(v)) : g.moveTo(px(a), py(v)); }
    g.strokeStyle = col; g.lineWidth = 7; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke();
    if (A > 24) tag(g, px(A) + 4, py(vmax) - 30, lab, 26, { font: 'black', fill: hexA(col, .22), lineCol: col, col: C.white });
  };
  line(.46, C.cyan, '瘦'); line(.9, C.orange, '胖');
  if (A > 21 && A < 60.1) { const pa = clamp((A - 21) / 6); g.save(); g.globalAlpha *= pa; text(g, '成年后：基本不变', px(36), py(.46) + 62, 28, C.fat, 'black'); g.restore(); }
  if (o.event !== undefined && A >= 40) {
    const pe = seg(o.event, 0, 1); g.save(); g.globalAlpha *= pe; g.setLineDash([9, 8]); g.strokeStyle = C.green; g.lineWidth = 4; g.beginPath(); g.moveTo(px(40), y); g.lineTo(px(40), y + h); g.stroke(); g.setLineDash([]);
    tag(g, px(40), y + 26, '大幅减重', 26, { font: 'black', fill: 'rgba(10,90,60,.9)', lineCol: C.green }); g.restore();
  }
  g.restore();
}

/* ================= 第一个发现：房子，拆不掉 ================= */
function sceneCells(g, t) {
  bgDark(g, t, { c0: '#16294A', c1: '#050B16' });
  motes(g, t, 22, '#CFE6FF', .2, 21);
  const tScope = S('a7') - .35, tTitle = S('a8') - .45, tCount = S('a9') - .3, tBall = S('a10') - .35, tTurn = S('a11') - .45;

  /* --- 读出生日期：测量值 → 对照曲线 → 哪一年 --- */
  {
    const a = win(t, T.cells, tScope + .3, .4, .45);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const ch = bombChart(g, 190, 300, 830, 470, 1, {});
      text(g, '大气中的碳-14（示意）', 190 + 415, 215, 36, C.white, 'black');
      const lvl = 1.328, yr = 1963 - 16 * Math.log((lvl - 1) / .95);   // ≈ 1980
      const tc = CK('a6', 2);
      const u1 = E.out(seg(t, tc + .1, tc + .9)), u2 = E.out(seg(t, tc + .9, tc + 1.6));
      if (u1 > 0) {
        g.strokeStyle = C.fat; g.lineWidth = 4; g.setLineDash([10, 8]);
        g.beginPath(); g.moveTo(ch.px(1950), ch.py(lvl)); g.lineTo(lerp(ch.px(1950), ch.px(yr), u1), ch.py(lvl)); g.stroke();
        if (u2 > 0) { g.beginPath(); g.moveTo(ch.px(yr), ch.py(lvl)); g.lineTo(ch.px(yr), lerp(ch.py(lvl), ch.py(.9), u2)); g.stroke(); }
        g.setLineDash([]);
        text(g, '1.33', ch.px(1950) - 40, ch.py(lvl), 24, C.fat, 'black');
        if (u1 >= 1) { circ(g, ch.px(yr), ch.py(lvl), 11); fs(g, C.fat, '#FFFFFF', 3); }
      }
      const yp = pop(t, tc + 1.5, .5);
      if (yp > 0) { g.save(); g.translate(ch.px(yr), ch.py(.9) + 62); g.scale(yp, yp); tag(g, 0, 0, '1980 年', 38, { font: 'black', fill: 'rgba(110,80,0,.95)', lineCol: C.fat, col: C.fatL }); g.restore(); }
      // 右侧：一个细胞 + 放大镜读数
      const pc = pop(t, S('a6') + .1, .5);
      if (pc > 0) {
        g.save(); g.translate(1470, 520); g.scale(pc, pc);
        fatCell(g, { x: 0, y: 0, r: 150, t, seed: 4 });
        dnaHelix(g, 0, 0, 200, { amp: 32, turns: 2, ph: t * 2, lw: 7, tagAt: .6, t, tagS: .9 });
        // 放大镜
        const lp = pop(t, CK('a6', 1) - .05, .5);
        if (lp > 0) { g.save(); g.translate(30, -10); g.scale(lp, lp); circ(g, 0, 0, 100); g.fillStyle = 'rgba(190,230,255,.12)'; g.fill(); g.strokeStyle = '#DDE9FF'; g.lineWidth = 12; g.stroke(); g.lineCap = 'round'; g.lineWidth = 20; g.beginPath(); g.moveTo(72, 72); g.lineTo(150, 150); g.stroke(); g.restore(); }
        g.restore();
        const rd = pop(t, CK('a6', 1) + .1, .45);
        if (rd > 0) { g.save(); g.translate(1470, 275); g.scale(rd, rd); rr(g, -190, -52, 380, 104, 20); fs(g, 'rgba(6,30,48,.92)', C.cyan, 3);
          text(g, '碳-14 读数', -60, -14, 28, C.mute, 'bold'); const v = lerp(1, 1.33, E.out(seg(t, CK('a6', 1) + .2, CK('a6', 1) + 1.1)));
          text(g, v.toFixed(2), 70, -8, 56, C.cyan, 'black'); text(g, '这个细胞出生在哪一年？', 0, 30, 24, C.mute, 'bold'); g.restore(); }
        const bp = pop(t, tc + 1.7, .5);
        if (bp > 0) { g.save(); g.translate(1470, 760); g.scale(bp, bp); tag(g, 0, 0, '出生：1980 年', 42, { font: 'black', fill: 'rgba(110,80,0,.95)', lineCol: C.fat, col: C.fatL }); g.restore(); }
      }
      const kp = pop(t, S('a6') + .2, .45);
      if (kp > 0) { g.save(); g.translate(1470, 160); g.scale(kp, kp); tag(g, 0, 0, '瑞典 · 卡罗林斯卡研究所', 30, { font: 'black' }); g.restore(); }
      g.restore();
    }
  }

  /* --- 显微镜下：脂肪细胞 --- */
  {
    const a = win(t, tScope, tTitle + .3, .4, .45);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const cx = 960, cy = 520, R0 = 300, grow = E.out(seg(t, tScope, tScope + .6));
      g.save(); g.translate(cx, cy); g.scale(grow, grow);
      circ(g, 0, 0, R0); const bgc = g.createRadialGradient(0, 0, 30, 0, 0, R0); bgc.addColorStop(0, '#FBF1DC'); bgc.addColorStop(1, '#E7D7B6'); g.fillStyle = bgc; g.fill();
      g.save(); circ(g, 0, 0, R0); g.clip();
      hexCluster(14, 62, 6).forEach(([x, y], i) => fatCell(g, { x: x + Math.sin(t * .6 + i) * 4, y: y + 10 + Math.cos(t * .5 + i * 2) * 4, r: 62, t, seed: i }));
      g.restore();
      glow(g, 0, 0, R0, '#FFFFFF', .08);
      circ(g, 0, 0, R0); g.strokeStyle = '#0E1A30'; g.lineWidth = 34; g.stroke(); g.strokeStyle = '#8CB0E6'; g.lineWidth = 5; circ(g, 0, 0, R0 - 17); g.stroke();
      g.strokeStyle = 'rgba(30,50,90,.35)'; g.lineWidth = 2; g.beginPath(); g.moveTo(-R0, 0); g.lineTo(R0, 0); g.moveTo(0, -R0); g.lineTo(0, R0); g.stroke();
      g.restore();
      const tp = pop(t, S('a7') + .15, .45);
      if (tp > 0) { g.save(); g.translate(960, 890); g.scale(tp, tp); tag(g, 0, 0, '成年人的脂肪细胞', 40, { font: 'black' }); g.restore(); }
      g.restore();
    }
  }

  /* --- 第一个发现：房子，拆不掉（拆迁球撞不倒） --- */
  {
    const a = win(t, tTitle, tCount + .3, .35, .4);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const hit = S('a8') + .85, sh = shake(t, hit, 14, .6);
      const th = t < hit ? lerp(.95, -.5, E.in(seg(t, tTitle + .2, hit))) : -.5 + .42 * Math.exp(-(t - hit) * 2.2) * Math.sin(1 + (t - hit) * 4.4) * 1.2;
      const piv = [900, 90], L = 520;
      // 房子
      g.save(); g.translate(sh[0], sh[1]); houseIcon(g, 620, 570, 1.75); fatCell(g, { x: 620, y: 590, r: 74, t, seed: 2 }); g.restore();
      // 拆迁球
      const bx = piv[0] + Math.sin(th) * L, by = piv[1] + Math.cos(th) * L;
      g.strokeStyle = '#7F93B5'; g.lineWidth = 8; g.beginPath(); g.moveTo(piv[0], piv[1]); g.lineTo(bx, by); g.stroke();
      circ(g, bx, by, 60); const bg = g.createRadialGradient(bx - 20, by - 22, 6, bx, by, 66); bg.addColorStop(0, '#9FAEC8'); bg.addColorStop(1, '#2B3752'); fs(g, bg, '#0F1626', 5);
      if (t > hit && t < hit + .5) { for (let k = 0; k < 8; k++) { const aa = k / 8 * TAU; g.strokeStyle = hexA(C.fat, 1 - (t - hit) / .5); g.lineWidth = 5; g.beginPath(); g.moveTo(560 + Math.cos(aa) * 40, 560 + Math.sin(aa) * 40); g.lineTo(560 + Math.cos(aa) * (70 + (t - hit) * 140), 560 + Math.sin(aa) * (70 + (t - hit) * 140)); g.stroke(); } }
      bigX(g, 560, 450, seg(t, hit + .35, hit + .7), { s: 1.0, rot: .08 });
      // 文字
      const p1 = pop(t, S('a8') + .05, .4), p2 = pop(t, S('a8') + .35, .5);
      g.save(); g.translate(1360, 400); g.scale(p1, p1); rich(g, '第一个发现', 0, 0, 62, { font: 'fun', col: C.mute, stroke: 10 }); g.restore();
      g.save(); g.translate(1360, 540); g.scale(p2, p2); rich(g, '房子，{拆不掉}', 0, 0, 120, { font: 'fun', stroke: 20, hl: C.fat, maxW: 800 }); g.restore();
      g.restore();
    }
  }

  /* --- 瘦人 / 胖人 / 年龄曲线 --- */
  {
    const a = win(t, tCount, tBall + .3, .4, .45);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const dive = seg(t, CK('a9', 2) - .1, CK('a9', 2) + 1.3);       // 大幅减重：细胞缩小
      // 瘦人
      const lean = hexCluster(16, 34), fat_ = hexCluster(25, 46);
      g.save(); g.translate(320, 520);
      lean.forEach(([x, y], i) => { const pp = pop(t, CK('a9', 0) + i * .03, .35); if (pp > 0) fatCell(g, { x: x * pp, y: y * pp, r: 34 * pp, t, seed: i, nuc: false }); });
      withAlpha(g, pop(t, CK('a9', 0) + .5, .3), () => tag(g, 0, 235, '瘦的人', 36, { font: 'black' }));
      g.restore();
      // 胖人
      g.save(); g.translate(880, 520);
      fat_.forEach(([x, y], i) => { const pp = pop(t, CK('a9', 1) + i * .03, .35); if (pp > 0) { const k = lerp(1, .74, E.io(dive)); fatCell(g, { x: x * pp * lerp(1, .78, E.io(dive)), y: y * pp * lerp(1, .78, E.io(dive)), r: 46 * pp * k, t, seed: i + 3, nuc: false }); } });
      withAlpha(g, pop(t, CK('a9', 1) + .5, .3), () => tag(g, 0, 290, dive > .5 ? '大幅减重之后' : '胖的人', 36, { font: 'black', fill: dive > .5 ? 'rgba(10,90,60,.9)' : 'rgba(10,18,32,.8)', lineCol: dive > .5 ? C.green : hexA(C.white, .25) }));
      g.restore();
      // 数量计数
      const cp = pop(t, CK('a9', 2) + .6, .4);
      if (cp > 0) { g.save(); g.translate(880, 150 + 0); g.scale(cp, cp); tag(g, 0, 0, '细胞数量　25 → 25', 36, { font: 'black', fill: 'rgba(110,60,0,.92)', lineCol: C.orange, col: '#FFD9B0' }); g.restore(); }
      // 年龄曲线
      numChart(g, 1370, 470, 400, 300, E.io(seg(t, CK('a9', 0) + .2, CK('a9', 1) + 1.6)), { event: seg(t, CK('a9', 2) + .1, CK('a9', 2) + .6) });
      g.restore();
      evid(g, t, S('a9') + .1, tBall - .1, 1580, 255, 500, { tag: 'Nature · 2008', title: '成年后，脂肪细胞总数基本不变', lines: ['胖人瘦人都是这样；{大幅减重}后也一样', '每年约{10%}被新细胞替换，总数不变'], foot: '斯波尔丁等 · 卡罗林斯卡研究所' }, { px: 24 });
    }
  }

  /* --- 细胞像气球：只会瘪下去 --- */
  {
    const a = win(t, tBall, tTurn + .3, .4, .45);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const cx = 960, cy = 540, R1 = 210;
      const sh = E.io(seg(t, CK('a10', 0) + .3, CK('a10', 2) + .2)), rad = lerp(R1, R1 * .58, sh);
      // 原来的“房子”：虚线圈
      g.save(); g.setLineDash([16, 12]); g.lineDashOffset = -t * 20; g.strokeStyle = hexA(C.fat, .75); g.lineWidth = 5; circ(g, cx, cy, R1 + 18); g.stroke(); g.restore();
      // 细胞缩小时飘出的小油滴
      if (sh > 0 && sh < 1) { const r = R(8); for (let i = 0; i < 12; i++) { const ph = (t * 1.1 + r()) % 1, an = r() * TAU; circ(g, cx + Math.cos(an) * (rad + ph * 200), cy + Math.sin(an) * (rad + ph * 200), 8 + r() * 6); g.fillStyle = hexA(C.fat, .85 * (1 - ph)); g.fill(); } }
      const wob_ = 1 + Math.sin(t * 14) * .012 * (1 - sh) * sh * 4;
      fatCell(g, { x: cx, y: cy, r: rad * wob_, t, seed: 5 });
      // 文字
      const pa = pop(t, CK('a10', 1), .4), pb = pop(t, CK('a10', 2) + .1, .45);
      if (pa > 0) { g.save(); g.translate(cx, 190); g.scale(pa, pa); rich(g, '细胞像{气球}', 0, 0, 76, { font: 'fun', stroke: 14, hl: C.fat }); g.restore(); }
      if (pb > 0) { g.save(); g.translate(cx + R1 + 70, cy - 150); g.scale(pb, pb); tag(g, 0, 0, '房子还在', 36, { font: 'black', fill: 'rgba(110,80,0,.95)', lineCol: C.fat, col: C.fatL }); g.restore(); g.strokeStyle = hexA(C.fat, .8 * pb); g.lineWidth = 3; g.beginPath(); g.moveTo(cx + R1 + 20, cy - 130); g.lineTo(cx + R1 * .72 + 10, cy - R1 * .72 + 10); g.stroke(); }
      // 小油缩在缩小后的细胞里
      const yy = seg(t, S('y4') - .1, S('y4') + .35);
      if (yy > 0) {
        xiaoyou(g, { x: cx - 20, y: cy + 10, s: .8 * yy, t, expr: 'wow', look: [1, -.5], tailAmp: .8 });
        const bp = pop(t, S('y4') + .05, .4) * (1 - E.in(seg(t, EN('y4') + .5, EN('y4') + .8)));
        if (bp > 0) speech(g, cx + 360, cy - 210, '所以……\n我家只是变小了？', 46, bp, [cx + 70, cy - 70]);
      }
      g.restore();
    }
  }

  /* --- 每年约十分之一换新，总数不变 --- */
  {
    const a = win(t, tTurn, T.flow + .5, .4, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const cells = hexCluster(24, 41, 7), cx = 960, cy = 540;
      const tr = seg(t, CK('a11', 0) + .2, CK('a11', 1) + .4);
      const swap = [3, 11, 19, 7];         // 被换掉的 4 个（约六分之一，示意；十分之一≈2~3 个，取 3 个）
      cells.forEach(([x, y], i) => {
        const k = swap.indexOf(i);
        let gray = 0, rad = 41, al = 1;
        if (k >= 0 && k < 3) { const u = clamp(tr * 3 - k); gray = clamp(u * 2) * (1 - clamp((u - .5) * 3)); const nu = clamp((u - .45) * 2.4); rad = 41 * (u < .5 ? 1 - u * .5 : .75 + nu * .25); if (u > .45) { gray = 0; } }
        fatCell(g, { x: cx + x, y: cy + y, r: rad, t, seed: i, gray: (k >= 0 && k < 3 && tr * 3 - k > 0 && tr * 3 - k < 1) ? clamp((tr * 3 - k) * 2.2) * (1 - clamp(((tr * 3 - k) - .5) * 3)) : 0, nuc: false });
        if (k >= 0 && k < 3) { const u = tr * 3 - k; if (u > .45 && u < 1.1) { star(g, cx + x, cy + y, 26 * (1 - Math.abs(u - .75)), 8, 4); fs(g, hexA('#FFFFFF', .9 * (1 - Math.abs(u - .75) * 2.5)), null); } }
      });
      const ct = pop(t, CK('a11', 1) + .1, .45);
      if (ct > 0) { g.save(); g.translate(cx, 170); g.scale(ct, ct); tag(g, 0, 0, '细胞总数　始终是 24', 44, { font: 'black', fill: 'rgba(10,90,60,.9)', lineCol: C.green }); g.restore(); }
      withAlpha(g, pop(t, CK('a11', 0) + .1, .4), () => tag(g, cx, 880, '每年约 1/10 的老细胞，换成新的（示意）', 34, { font: 'black' }));
      swap.slice(0, 3).forEach((idx, k) => { const u = tr * 3 - k, [x, y] = cells[idx]; if (u > .05 && u < .5) withAlpha(g, clamp(u * 6) * (1 - clamp((u - .4) * 10)), () => tag(g, cx + x + 120, cy + y - 4, '老细胞', 26, { font: 'black' })); else if (u >= .5 && u < 1.05) withAlpha(g, clamp((u - .5) * 6) * (1 - clamp((u - .95) * 10)), () => tag(g, cx + x + 120, cy + y - 4, '新细胞', 26, { font: 'black', fill: 'rgba(10,90,60,.9)', lineCol: C.green })); });
      g.restore();
    }
  }
  vignette(g, .45);
}

/* ================= 第二个发现：油，在流动 ================= */
/* 一滴油：小圆点带高光 */
function oilDrop(g, x, y, r, a = 1) {
  if (a <= .001) return;
  g.save(); g.globalAlpha *= a; circ(g, x, y, r);
  const gr = g.createRadialGradient(x - r * .3, y - r * .35, r * .1, x, y, r); gr.addColorStop(0, '#FFF6C8'); gr.addColorStop(.55, C.fat); gr.addColorStop(1, '#D98A00'); fs(g, gr, '#B87800', Math.max(1, r * .1));
  g.restore();
}
/* 一个细胞的剖面：里面有漂着的油滴；in/out 是进出的粗细（0..1），用来在图上标出流入和流出 */
function cellFlow(g, t, cx, cy, R0, o = {}) {
  const { inW = 20, outW = 20, n = 12, seed = 1, inRate = 1, outRate = 1 } = o;
  fatCell(g, { x: cx, y: cy, r: R0, t, seed });
  const r = R(seed * 13);
  for (let i = 0; i < n; i++) {
    const an = r() * TAU + t * (.25 + r() * .3), rad = r() * R0 * .55, rr_ = R0 * (.07 + r() * .05);
    oilDrop(g, cx + Math.cos(an) * rad, cy + Math.sin(an) * rad, rr_, .95);
  }
  // 流入：左上 → 细胞；流出：细胞 → 右下
  const a1 = [cx - R0 * 1.55, cy - R0 * 1.2], b1 = [cx - R0 * .62, cy - R0 * .5], a2 = [cx + R0 * .62, cy + R0 * .5], b2 = [cx + R0 * 1.55, cy + R0 * 1.2];
  arrow(g, a1[0], a1[1], b1[0], b1[1], inW, hexA(C.green, .7), { head: inW * 2.4 });
  arrow(g, a2[0], a2[1], b2[0], b2[1], outW, hexA(C.cyan, .7), { head: outW * 2.4 });
  const dl = (A, B, rate, w) => { const k = Math.max(2, Math.round(w / 6)); for (let i = 0; i < k; i++) { const u = ((t * .5 * rate + i / k) % 1); oilDrop(g, lerp(A[0], B[0], u), lerp(A[1], B[1], u) + (i % 2 ? 1 : -1) * w * .22, 5 + w * .12, Math.sin(u * Math.PI)); } };
  dl(a1, b1, inRate, inW); dl(a2, b2, outRate, outW);
}

function sceneFlow(g, t) {
  bgDark(g, t, { c0: '#16294A', c1: '#050B16' });
  motes(g, t, 22, '#CFE6FF', .2, 33);
  const tA13 = S('a13') - .3, tA14 = S('a14') - .35, tA15 = S('a15') - .4;

  /* --- 标题：油，在流动 --- */
  {
    const a = win(t, T.flow, tA13 + .3, .4, .45);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      // 背景里一条条流过的油滴
      const r = R(70);
      for (let i = 0; i < 38; i++) { const sp = 120 + r() * 160, yy = 220 + r() * 640, rr_ = 7 + r() * 11, x = ((r() * 2400 + t * sp) % 2200) - 140; oilDrop(g, x, yy + Math.sin(t * 2 + i) * 12, rr_, .5); }
      const p1 = pop(t, S('a12') + .05, .4), p2 = pop(t, S('a12') + .3, .5);
      g.save(); g.translate(W / 2, 400); g.scale(p1, p1); rich(g, '第二个发现', 0, 0, 62, { font: 'fun', col: C.mute, stroke: 10 }); g.restore();
      g.save(); g.translate(W / 2, 540); g.scale(p2, p2); rich(g, '{油}，在{流动}', 0, 0, 130, { font: 'fun', stroke: 22, hl: C.fat }); g.restore();
      g.restore();
    }
  }

  /* --- 一个细胞活十年，里面的油换六轮 --- */
  {
    const a = win(t, tA13, tA14 + .3, .4, .45);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      cellFlow(g, t, 520, 520, 190, { inW: 24, outW: 24, n: 14, seed: 2 });
      withAlpha(g, pop(t, tA13 + .3, .4), () => { tag(g, 250, 330, '存进来', 32, { font: 'black', fill: 'rgba(10,90,60,.9)', lineCol: C.green }); tag(g, 800, 760, '被带走', 32, { font: 'black', fill: 'rgba(0,70,95,.9)', lineCol: C.cyan }); });
      // 时间轴：10 年 = 6 段
      const bx0 = 1010, bx1 = 1790, by = 600, bh = 70;
      const grow = E.io(seg(t, CK('a13', 0) + .1, CK('a13', 0) + 1.6));
      text(g, '一个脂肪细胞的一生　≈ 10 年', (bx0 + bx1) / 2, by - 78, 36, C.white, 'black');
      rr(g, bx0, by, bx1 - bx0, bh, 18); fs(g, 'rgba(10,20,36,.7)', hexA(C.white, .25), 2);
      const segW = (bx1 - bx0) / 6;
      for (let i = 0; i < 6; i++) {
        const tp = CK('a13', 1) + .15 + i * .42, u = E.out(seg(t, tp, tp + .35));
        const fillW = clamp(grow * 6 - i) * segW; if (fillW <= 0) continue;
        const col = i % 2 ? C.fat2 : C.fat;
        rr(g, bx0 + i * segW + 3, by + 4, Math.max(2, (fillW - 6) * (u > 0 ? 1 : 1)), bh - 8, 14); fs(g, u > 0 ? col : 'rgba(255,201,60,.35)', null);
        if (u > 0) { oilDrop(g, bx0 + i * segW + segW / 2, by + bh / 2, 17 * u); text(g, '第' + (i + 1) + '轮', bx0 + i * segW + segW / 2, by + bh + 36, 26, C.fatL, 'black'); }
      }
      for (const [k, lab] of [[0, '0'], [3, '5 年'], [6, '10 年']]) text(g, lab, bx0 + k * segW, by - 20, 24, C.mute, 'bold');
      const br = pop(t, CK('a13', 2) + .1, .45);
      if (br > 0) {
        g.save(); g.translate(bx0 + segW / 2, by + bh + 108); g.scale(br, br);
        g.strokeStyle = C.orange; g.lineWidth = 5; g.beginPath(); g.moveTo(-segW / 2, -26); g.lineTo(-segW / 2, -14); g.lineTo(segW / 2, -14); g.lineTo(segW / 2, -26); g.stroke();
        tag(g, 0, 38, '平均　1.7 年　换一批', 32, { font: 'black', fill: 'rgba(120,50,10,.92)', lineCol: C.orange, col: '#FFD9B0' }); g.restore();
      }
      g.restore();
      evid(g, t, S('a13') + .1, tA14 - .15, 1400, 290, 640, { tag: 'Nature · 2011', title: '脂肪里的油，一直在换', lines: ['脂肪细胞平均能活{十年}，里面的油要换{六轮}', '用核试验留下的碳-14测出来的'], foot: '阿纳等 · 卡罗林斯卡研究所' }, { px: 24 });
    }
  }

  /* --- 瘦人 vs 胖人：存得更多，带走更慢 --- */
  {
    const a = win(t, tA14, tA15 + .3, .4, .45);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const pp = pop(t, tA14 + .1, .45);
      g.save(); g.translate(0, 0);
      cellFlow(g, t, 560, 520, 140, { inW: 20, outW: 20, n: 8, seed: 3 });
      cellFlow(g, t, 1360, 520, 178, { inW: 40, outW: 11, n: 20, seed: 4, inRate: 1.3, outRate: .5 });
      g.restore();
      withAlpha(g, pp, () => { tag(g, 560, 760, '瘦的人', 38, { font: 'black' }); tag(g, 1360, 790, '肥胖的人', 38, { font: 'black' }); });
      const t1 = pop(t, CK('a14', 0) + .3, .4), t2 = pop(t, CK('a14', 1) + .2, .4);
      if (t1 > 0) { g.save(); g.translate(1130, 290); g.scale(t1, t1); tag(g, 0, 0, '存进去的　更多', 36, { font: 'black', fill: 'rgba(10,90,60,.92)', lineCol: C.green }); g.restore(); }
      if (t2 > 0) { g.save(); g.translate(1630, 760); g.scale(t2, t2); tag(g, 0, 0, '带走的　更慢', 36, { font: 'black', fill: 'rgba(0,70,95,.92)', lineCol: C.cyan }); g.restore(); }
      g.restore();
    }
  }

  /* --- 河口有点窄 --- */
  {
    const a = win(t, tA15, T.g2 + .5, .4, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      // 源头：脂肪细胞（河从它那里流出来）
      const sp_ = pop(t, tA15 + .1, .5);
      if (sp_ > 0) { g.save(); g.translate(40, 570); g.scale(sp_, sp_); fatCell(g, { x: 0, y: 0, r: 250, t, seed: 5 }); g.restore(); withAlpha(g, sp_, () => tag(g, 120, 872, '脂肪细胞', 34, { font: 'black' })); }
      const xL = 150, xR = 1650, topL = 330, botL = 810, topR = 520, botR = 610;
      const edge = u => [lerp(topL, topR, E.sine(u)), lerp(botL, botR, E.sine(u))];
      g.beginPath(); for (let i = 0; i <= 40; i++) { const u = i / 40, [tp] = edge(u); const x = lerp(xL, xR, u); i ? g.lineTo(x, tp) : g.moveTo(x, tp); }
      for (let i = 40; i >= 0; i--) { const u = i / 40, [, bt] = edge(u); g.lineTo(lerp(xL, xR, u), bt); } g.closePath();
      const rg = g.createLinearGradient(xL, 0, xR, 0); rg.addColorStop(0, 'rgba(60,140,255,.5)'); rg.addColorStop(1, 'rgba(70,211,242,.75)'); fs(g, rg, 'rgba(180,225,255,.6)', 4);
      // 水纹
      g.save(); g.clip(); g.strokeStyle = 'rgba(220,240,255,.28)'; g.lineWidth = 3;
      for (let k = 0; k < 7; k++) { g.beginPath(); for (let i = 0; i <= 60; i++) { const u = i / 60, [tp, bt] = edge(u), yy = lerp(tp, bt, (k + .5) / 7) + Math.sin(u * 14 - t * 3 + k) * 7; const x = lerp(xL, xR, u); i ? g.lineTo(x, yy) : g.moveTo(x, yy); } g.stroke(); }
      g.restore();
      // 随河流动的油滴；越靠近河口越挤
      const r = R(91);
      for (let i = 0; i < 46; i++) {
        const lane = (r() - .5) * 1.6, sp = .045 + r() * .03, ph = r();
        let u = (ph + t * sp) % 1; u = Math.min(u, .93 - (i % 6) * .014 + Math.sin(t * 3 + i) * .004);
        const [tp, bt] = edge(u), yy = lerp(tp, bt, .5 + lane * .42) + Math.sin(t * 2 + i) * 4, x = lerp(xL, xR, u);
        oilDrop(g, x, yy, 7 + (i % 4) * 2.5, .95);
      }
      // 出口（肺）
      const ep = pop(t, tA15 + .2, .5);
      if (ep > 0) { glow(g, 1790, 565, 160, C.cyan, .5 * ep); g.save(); g.translate(1790, 565); g.scale(ep, ep); lungs(g, 0, 8, .46, Math.sin(t * 2) * .5 + .5); g.restore(); }
      // 河口的标注
      const mp = pop(t, CK('a15', 1) + .1, .4);
      if (mp > 0) { g.save(); g.translate(1490, 400); g.scale(mp, mp); tag(g, 0, 0, '河口有点窄', 40, { font: 'black', fill: 'rgba(120,50,10,.92)', lineCol: C.orange, col: '#FFD9B0' }); g.restore(); g.strokeStyle = hexA(C.orange, .9 * mp); g.lineWidth = 4; g.beginPath(); g.moveTo(1490, 430); g.lineTo(1550, 520); g.stroke(); }
      // 标题
      const tp_ = pop(t, S('a15') + .05, .45);
      if (tp_ > 0) { g.save(); g.translate(W / 2, 205); g.scale(tp_, tp_); rich(g, '脂肪不是仓库，是{一条河}', 0, 0, 84, { font: 'fun', stroke: 16, hl: C.cyan, maxW: 1500 }); g.restore(); }
      // 小油卡在河口
      const xp = seg(t, S('a15') + 1.0, S('a15') + 1.5);
      if (xp > 0) {
        xiaoyou(g, { x: 1470, y: 560 + Math.sin(t * 3) * 3, s: .72 * xp, t, expr: 'sweat', look: [1, 0], tailAmp: .5 });
        const bp = pop(t, S('y5') + .05, .4) * (1 - E.in(seg(t, EN('y5') + .6, EN('y5') + .9)));
        if (bp > 0) speech(g, 1250, 760, '难怪我出不去……', 46, bp, [1430, 630]);
      }
      g.restore();
    }
  }
  vignette(g, .45);
}
