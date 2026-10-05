'use strict';
/* scenes4.js：第三关（脂肪的记忆）、双胞胎彩蛋、怎么办、回到那十公斤 */

/* 一个简单的人形：头 + 身体。wide 0 瘦 → 1 胖 */
function bodyIcon(g, x, y, s, wide, col = '#9FB4DA', a = 1) {
  g.save(); g.translate(x, y); g.scale(s, s); g.globalAlpha *= a;
  const bw = 54 + wide * 54, bh = 110 + wide * 10;
  circ(g, 0, -bh - 52, 40); fs(g, col, hexA('#FFFFFF', .5), 3);
  g.beginPath(); g.moveTo(-bw * .62, -bh + 4); g.quadraticCurveTo(-bw, -bh * .3, -bw * .86, 70); g.lineTo(bw * .86, 70); g.quadraticCurveTo(bw, -bh * .3, bw * .62, -bh + 4); g.quadraticCurveTo(0, -bh - 16, -bw * .62, -bh + 4); g.closePath(); fs(g, col, hexA('#FFFFFF', .5), 3);
  g.restore();
}
/* 一排“基因活动”的小竖条（示意）。pattern 是 0..1 的数组 */
function geneStrip(g, x, y, w, h, pat, col0, col1, a = 1, dim) {
  const n = pat.length, bw = w / n;
  g.save(); g.globalAlpha *= a;
  rr(g, x - 10, y - 8, w + 20, h + 16, 14); fs(g, 'rgba(8,14,30,.75)', hexA(C.white, .18), 2);
  pat.forEach((v, i) => { rr(g, x + i * bw + 2, y + h * (1 - (.18 + v * .82)), bw - 4, h * (.18 + v * .82), 3); fs(g, mix(col0, col1, v), null); });
  if (dim) dim.forEach(i => { g.strokeStyle = C.red; g.lineWidth = 3; g.strokeRect(x + i * bw, y - 4, bw, h + 8); });
  g.restore();
}
function yoyo(g, x, y, r, t, ang = 0) {
  g.save(); g.translate(x, y); g.rotate(ang);
  circ(g, 0, 0, r); const gr = g.createRadialGradient(-r * .3, -r * .3, 2, 0, 0, r); gr.addColorStop(0, '#FF9BB8'); gr.addColorStop(1, '#D8305E'); fs(g, gr, '#7A1030', 4);
  circ(g, 0, 0, r * .58); fs(g, '#FFD4E0', '#7A1030', 3); circ(g, 0, 0, r * .16); g.fillStyle = '#7A1030'; g.fill();
  g.restore();
}
/* 橡皮：向右擦，擦不掉批注 */
function eraser(g, x, y, s = 1, rot = -.15) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  rr(g, -74, -34, 148, 68, 12); fs(g, '#FFB6C8', '#C25A78', 4);
  rr(g, -74, -34, 56, 68, 12); fs(g, '#5B7BD6', '#2E4A99', 4);
  g.restore();
}

/* ================= 第三关：脂肪的记忆 ================= */
function sceneMemory(g, t) {
  bgDark(g, t, { c0: '#2B2150', c1: '#080614', gridCol: '#C9B6FF', gridA: .06 });
  motes(g, t, 22, '#E0D0FF', .22, 81);
  const tHum = S('c3') - .3, tGene = S('c4') - .3, tEpi = S('c5') - .3, tMouse = S('c6') - .3, tYo = S('c7') - .3, tCau = S('c8') - .2;

  /* --- 《自然》2024 --- */
  {
    const a = win(t, T.g3 + .4, tHum + .4, .35, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const p = pop(t, S('c1') + .3, .55);
      g.save(); g.translate(640, 560); g.rotate(-.05); g.scale(p, p);
      rr(g, -215 + 10, -290 + 16, 430, 580, 14); g.fillStyle = 'rgba(0,0,0,.4)'; g.fill();
      rr(g, -215, -290, 430, 580, 14); const gr = g.createLinearGradient(0, -290, 0, 290); gr.addColorStop(0, '#F8F4EA'); gr.addColorStop(1, '#D9CFBA'); fs(g, gr, '#8A7C68', 3);
      rr(g, -215, -290, 430, 120, 14); fs(g, '#C8102E', null); g.fillRect(-215, -220, 430, 50);
      text(g, 'Nature', -20, -230, 84, '#FFFFFF', 'black');
      // 封面插图：一团细胞
      hexCluster(9, 40, 5).forEach(([x, y], i) => fatCell(g, { x: x * .9 + 10, y: y * .9 + 20, r: 40, t, seed: i, nuc: i % 3 === 0, tint: '#FFD45A' }));
      text(g, '2024', 120, 235, 54, '#4A2A10', 'black');
      g.restore();
      stamp(g, 850, 300, '最新', seg(t, S('c1') + 1.0, S('c1') + 1.45), { px: 58, rot: .13, col: C.red });
      const t1 = pop(t, CK('c2', 0) + .5, .45), t2 = pop(t, CK('c2', 1) + .1, .45);
      if (t1 > 0) { g.save(); g.translate(1330, 380); g.scale(t1, t1); tag(g, 0, 0, '2024 年 · 《自然》', 52, { font: 'black' }); g.restore(); }
      if (t2 > 0) { g.save(); g.translate(1330, 520); g.scale(t2, t2); tag(g, 0, 0, '苏黎世联邦理工学院等', 50, { font: 'black', fill: 'rgba(60,40,120,.9)', lineCol: C.purple, col: '#E6DCFF' }); g.restore(); g.save(); g.translate(1330, 630); g.scale(t2, t2); text(g, '一个以欧洲为主的研究团队', 0, 0, 36, C.mute, 'bold'); g.restore(); }
      g.restore();
    }
  }

  /* --- 人：做过减重手术的严重肥胖者，两年后 --- */
  {
    const a = win(t, tHum, tGene + .4, .4, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const p1 = pop(t, CK('c3', 0), .5), p2 = pop(t, CK('c3', 1) + .1, .5), p3 = pop(t, CK('c3', 2) + .2, .5);
      // 手术前
      g.save(); g.translate(420, 700); g.scale(p1, p1); bodyIcon(g, 0, 0, 1.55, 1, '#8FA6C8'); g.restore();
      withAlpha(g, p1, () => tag(g, 420, 860, '严重肥胖者', 40, { font: 'black' }));
      // 箭头 + 手术
      if (p2 > 0) { arrow(g, 620, 560, 960, 560, 26, hexA(C.white, .6 * p2), { head: 52 }); g.save(); g.translate(790, 470); g.scale(p2, p2); tag(g, 0, 0, '减重手术', 42, { font: 'black', fill: 'rgba(60,40,120,.9)', lineCol: C.purple, col: '#E6DCFF' }); g.restore(); }
      // 两年后
      g.save(); g.translate(1160, 700); g.scale(p3, p3); bodyIcon(g, 0, 0, 1.55, 0, '#8FA6C8'); g.restore();
      withAlpha(g, p3, () => { tag(g, 1160, 860, '两年后：体重仍明显下降', 40, { font: 'black', fill: 'rgba(10,90,60,.92)', lineCol: C.green }); });
      // 取样：脂肪组织
      const sp = pop(t, CK('c3', 0) + .3, .5);
      if (sp > 0) { g.save(); g.translate(1650, 420); g.scale(sp, sp); circ(g, 0, 0, 120); g.fillStyle = 'rgba(190,230,255,.1)'; g.fill(); g.strokeStyle = '#B9D8F5'; g.lineWidth = 8; g.stroke(); hexCluster(5, 40, 4).forEach(([x, y], i) => fatCell(g, { x: x * .8, y: y * .8, r: 38, t, seed: i, nuc: false })); text(g, '脂肪组织样本', 0, 170, 36, C.white, 'black'); g.restore(); }
      g.restore();
    }
  }

  /* --- 基因的活动模式（示意）--- */
  {
    const a = win(t, tGene, tEpi + .4, .4, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const r = R(1234); const N = 44, A = Array.from({ length: N }, () => r()), B = A.map(v => (r() < .55 ? clamp(1 - v + (r() - .5) * .3) : v)), Cc = B.map((v, i) => (r() < .12 ? A[i] : clamp(v + (r() - .5) * .08)));
      const diff = []; Cc.forEach((v, i) => { if (Math.abs(v - A[i]) > .35) diff.push(i); });
      const x0 = 360, w = 840, h = 120;
      text(g, '基因的活动模式（示意）', x0 + w / 2, 205, 44, C.white, 'black');
      const rows = [['从未肥胖', A, C.cyan, C.fat, S('c4') + .15], ['肥胖时', B, C.cyan, C.pink, CK('c4', 1) - .1], ['减重两年后', Cc, C.cyan, C.pink, CK('c4', 2) - .15]];
      rows.forEach(([nm, pat, c0, c1, tt], i) => {
        const p = pop(t, tt, .45), y = 290 + i * 210;
        if (p <= 0) return;
        text(g, nm, 200, y + h / 2, 36, i === 2 ? C.fat : C.white, 'black');
        geneStrip(g, x0, y, w, h, pat, c0, c1, clamp(p * 2), i === 2 && t > CK('c4', 2) + .5 ? diff : null);
      });
      const bp = pop(t, CK('c4', 2) + .5, .5);
      if (bp > 0) { g.save(); g.translate(1590, 640); g.scale(bp, bp); tag(g, 0, 0, '更像“肥胖时”', 44, { font: 'black', fill: 'rgba(120,50,10,.95)', lineCol: C.orange, col: '#FFD9B0' }); g.restore(); }
      g.restore();
    }
  }

  /* --- 小鼠：写在基因上的“批注”擦不掉 --- */
  {
    const a = win(t, tEpi, tMouse + .4, .4, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const dn = pop(t, S('c5') + .1, .5);
      g.save(); g.translate(960, 560); g.scale(dn, dn);
      dnaHelix(g, 0, 0, 1000, { amp: 80, turns: 4.2, ph: t * 1.2, lw: 14 });
      // 紫色批注贴纸
      [[-320, -1], [-110, 1], [140, -1], [350, 1]].forEach(([nx, sg], i) => {
        const np = pop(t, CK('c5', 1) - .1 + i * .12, .4); if (np <= 0) return;
        const th = ((nx + 500) / 1000) * 4.2 * TAU + t * 1.2, ny = Math.sin(th) * 80 * (sg > 0 ? -1 : 1);
        g.save(); g.translate(nx, ny + sg * 42); g.scale(np, np); g.rotate(sg * .12);
        rr(g, -34, -28, 68, 56, 6); fs(g, '#B79BFF', '#6A4CD6', 3); g.strokeStyle = 'rgba(60,30,130,.6)'; g.lineWidth = 3; for (let k = 0; k < 3; k++) { g.beginPath(); g.moveTo(-22, -10 + k * 14); g.lineTo(22, -10 + k * 14); g.stroke(); } g.restore();
      });
      g.restore();
      withAlpha(g, pop(t, CK('c5', 1) - .2, .4), () => tag(g, 960, 330, '写在基因上的“批注”', 46, { font: 'black', fill: 'rgba(60,40,120,.92)', lineCol: C.purple, col: '#E6DCFF' }));
      // 橡皮擦一遍，擦不掉
      const ep = seg(t, CK('c5', 1) + .9, CK('c5', 1) + 2.9);
      if (ep > 0 && ep < 1) eraser(g, lerp(380, 1560, E.io(ep)), 560 + Math.sin(ep * 18) * 18, 1.1);
      const st = seg(t, CK('c5', 1) + 3.0, CK('c5', 1) + 3.4);
      if (st > 0) stamp(g, 960, 760, '没被擦掉', st, { px: 64, rot: -.06, col: C.purple });
      withAlpha(g, pop(t, S('c5') + .1, .4), () => tag(g, 230, 330, '小鼠', 40, { font: 'black' }));
      g.restore();
    }
  }

  /* --- 带着记忆的小鼠复胖更快（曲线为示意）--- */
  {
    const a = win(t, tMouse, tYo + .4, .4, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      // 左：两只小鼠
      const p1 = pop(t, S('c6') + .1, .5), p2 = pop(t, CK('c6', 0) + .5, .5);
      g.save(); g.translate(350, 450); g.scale(p1, p1); mouse(g, { x: 0, y: 0, s: .95, t, fat: 0, state: 'idle' }); g.restore();
      withAlpha(g, p1, () => tag(g, 350, 575, '从没胖过', 38, { font: 'black' }));
      g.save(); g.translate(350, 790 - 20); g.scale(p2, p2); mouse(g, { x: 0, y: -20, s: .95, t, fat: .1, state: 'idle' });
      rr(g, 38, -108, 58, 46, 6); fs(g, '#B79BFF', '#6A4CD6', 3); g.restore();
      withAlpha(g, p2, () => tag(g, 350, 862, '曾经肥胖（带着“记忆”）', 32, { font: 'black', fill: 'rgba(60,40,120,.92)', lineCol: C.purple, col: '#E6DCFF' }));
      // 右：体重曲线
      const cx = 650, cy = 360, cw = 610, ch = 430, pc = E.io(seg(t, CK('c6', 1) - .2, CK('c6', 1) + 2.2));
      rr(g, cx - 70, cy - 86, cw + 130, ch + 180, 22); fs(g, 'rgba(8,14,30,.8)', hexA(C.white, .2), 2);
      text(g, '高脂饮食之后的体重（示意）', cx + cw / 2 - 40, cy - 40, 36, C.white, 'black');
      g.strokeStyle = 'rgba(160,190,235,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx, cy + ch); g.lineTo(cx + cw, cy + ch); g.stroke();
      text(g, '时间 →', cx + cw - 50, cy + ch + 34, 28, C.mute, 'bold'); text(g, '体重', cx - 12, cy - 4, 28, C.mute, 'bold');
      const drawLine = (f, col) => { g.beginPath(); for (let u = 0; u <= pc + .001; u += .02) { const x = cx + u * cw, y = cy + ch - f(u) * ch; u ? g.lineTo(x, y) : g.moveTo(x, y); } g.strokeStyle = col; g.lineWidth = 8; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); const x = cx + pc * cw, y = cy + ch - f(pc) * ch; circ(g, x, y, 10); fs(g, col, '#FFFFFF', 3); };
      drawLine(u => .12 + .38 * u, '#7FD6EC');
      drawLine(u => .14 + .74 * Math.pow(u, .85), C.purple);
      if (pc > .8) { withAlpha(g, clamp((pc - .8) * 5), () => { tag(g, cx + cw * .82, cy + ch * .18, '复胖得更快', 40, { font: 'black', fill: 'rgba(60,40,120,.95)', lineCol: C.purple, col: '#E6DCFF' }); tag(g, cx + cw * .84, cy + ch * .56, '从没胖过的', 30, { font: 'black' }); }); }
      g.restore();
    }
  }

  /* --- 溜溜球效应 --- */
  {
    const a = win(t, tYo, tCau + .4, .4, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      // 体重的锯齿线
      const cx = 420, cy = 380, cw = 900, ch = 340, pc = E.io(seg(t, S('c7') + .1, S('c7') + 3.2));
      const pts = [[0, .62], [.14, .3], [.3, .66], [.46, .26], [.62, .7], [.78, .24], [.94, .72]];
      g.beginPath(); pts.forEach(([u, v], i) => { const x = cx + u * cw, y = cy + ch - v * ch; i ? g.lineTo(x, y) : g.moveTo(x, y); });
      g.save(); const clipW = pc * cw + 20; g.beginPath(); g.rect(cx - 20, cy - 40, clipW, ch + 80); g.clip();
      g.beginPath(); pts.forEach(([u, v], i) => { const x = cx + u * cw, y = cy + ch - v * ch; i ? g.lineTo(x, y) : g.moveTo(x, y); }); g.strokeStyle = C.pink; g.lineWidth = 9; g.lineJoin = 'round'; g.lineCap = 'round'; g.stroke(); g.restore();
      const hx = cx + pc * cw; const hv = (() => { for (let i = 1; i < pts.length; i++) if (pc <= pts[i][0]) { const u = (pc - pts[i - 1][0]) / (pts[i][0] - pts[i - 1][0]); return lerp(pts[i - 1][1], pts[i][1], u); } return pts[pts.length - 1][1]; })();
      yoyo(g, hx, cy + ch - hv * ch - 6, 40, t, t * 6);
      text(g, '减下来　→　反弹　→　再减　→　再弹', cx + cw / 2, cy + ch + 58, 44, C.white, 'black');
      const yp = pop(t, S('c7') + .2, .5);
      if (yp > 0) { g.save(); g.translate(cx + cw / 2, 240); g.scale(yp, yp); rich(g, '“溜溜球效应”', 0, 0, 84, { font: 'fun', stroke: 16, hl: C.pink }); g.restore(); }
      // 小油
      const xp = seg(t, S('y7') - .1, S('y7') + .3);
      if (xp > 0) {
        xiaoyou(g, { x: 230, y: 905, s: .8 * xp, t, expr: 'wow', look: [1, -.3], tailAmp: .8 });
        const bp = pop(t, S('y7') + .05, .4) * (1 - E.in(seg(t, EN('y7') + .55, EN('y7') + .85)));
        if (bp > 0) speech(g, 620, 895, '原来我们家，\n有前科啊。', 46, bp, [330, 905]);
      }
      g.restore();
    }
  }

  /* --- 但这还是一项新研究 --- */
  {
    const a = win(t, tCau, T.twins + .5, .4, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      // 放大镜 + 问号
      const mp = pop(t, S('c8') + .1, .5);
      g.save(); g.translate(600, 520); g.scale(mp, mp);
      circ(g, 0, 0, 170); g.fillStyle = 'rgba(190,230,255,.1)'; g.fill(); g.strokeStyle = '#DDE9FF'; g.lineWidth = 22; g.stroke(); g.lineCap = 'round'; g.lineWidth = 40; g.beginPath(); g.moveTo(120, 120); g.lineTo(250, 250); g.stroke();
      text(g, '？', 0, 12, 200, C.fat, 'fun');
      g.restore();
      const t1 = pop(t, CK('c8', 0) + .1, .45), t2 = pop(t, CK('c8', 2) - .2, .45);
      if (t1 > 0) { g.save(); g.translate(1330, 360); g.scale(t1, t1); tag(g, 0, 0, '这是一项新研究', 56, { font: 'black' }); g.restore(); }
      if (t2 > 0) { g.save(); g.translate(1330, 520); g.scale(t2, t2); tag(g, 0, 0, '在人身上是不是复胖的原因', 46, { font: 'black', fill: 'rgba(120,50,10,.95)', lineCol: C.orange, col: '#FFD9B0' }); g.restore(); g.save(); g.translate(1330, 640); g.scale(t2, t2); rich(g, '还需要{更多证据}', 0, 0, 78, { font: 'fun', stroke: 14, hl: C.fat }); g.restore(); }
      g.restore();
    }
  }
  evid(g, t, S('c4') + .3, tCau - .1, 1620, 300, 540, { tag: 'Nature · 2024', title: '脂肪组织保留着“肥胖的记忆”', lines: ['人：减重手术两年后，基因活动{仍带着肥胖的痕迹}', '小鼠：表观遗传改变{没被擦掉}，高脂饮食{复胖更快}', '研究者推测：可能与{溜溜球效应}有关'], foot: 'Hinte 等 · 苏黎世联邦理工学院等' }, { px: 21 });
  vignette(g, .5);
}
