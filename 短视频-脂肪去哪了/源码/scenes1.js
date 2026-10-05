'use strict';
/* scenes1.js：开场测验、答案、质量守恒，以及“三道关卡”的路线图与小油登场 */

/* ---------- 关键时刻（都从配音时间轴推出来） ---------- */
const T = {};
T.q = S('h3') - .45;                      // 进入选择题
T.surv = S('h6') - .3;                    // 调查
T.phys = S('h7') - .25;                   // 热量不是东西
T.ans = S('h8') - .5;                     // 揭晓
T.breath = MK('h8');                      // “呼出去了”
T.split = S('h9') - .15;
T.water = S('h10') - .1;
T.lung = S('h11') - .2;
T.eq = EN('h11') + .35;                   // 质量守恒
T.map = S('h12') - .35;                   // 路线图
T.doors = CK('h13', 1);                   // 三道关卡落下
T.title = EN('h14') + .25;                // 片名
T.xy = S('y1') - .3;                      // 小油登场
T.g1 = S('a1') - 1.25;                    // 第一关章节卡
T.cold = S('a1') + .5;                    // 冷战
T.cells = S('a6') - .2;
T.find1 = S('a8') - .45;
T.flow = S('a12') - .5;
T.g2 = S('b1') - 1.25;
T.mice = S('b2') - .2;
T.lept = S('b7') - .3;
T.brain = S('b9') - .3;
T.light = S('b11') - .4;
T.human = S('b14') - .35;
T.g3 = S('c1') - 1.25;
T.mem = S('c2') - .2;
T.twins = S('d1') - .5;
T.how = S('e1') - .5;
T.fin = S('f1') - .6;
T.endcard = EN('f5') + .5;

const SHOW_LCD = { x: 560, y: 520 };

/* ---------- 小工具：天平 ---------- */
function balance(g, cx, cy, tilt, leftFn, rightFn, s = 1) {
  g.save(); g.translate(cx, cy); g.scale(s, s);
  poly(g, [[-16, 230], [16, 230], [9, 0], [-9, 0]]); fs(g, '#7E93B5', '#4A5E80', 3);
  rr(g, -90, 224, 180, 22, 10); fs(g, '#6A7FA2', '#4A5E80', 3);
  g.rotate(tilt);
  rr(g, -310, -9, 620, 18, 9); fs(g, '#AFC2E2', '#6A7FA2', 3);
  circ(g, 0, 0, 16); fs(g, '#E7EEF9', '#6A7FA2', 3);
  for (const [sg, fn] of [[-1, leftFn], [1, rightFn]]) {
    g.save(); g.translate(sg * 300, 0); g.rotate(-tilt);
    g.strokeStyle = '#8FA6C8'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 0); g.lineTo(-90, 130); g.moveTo(0, 0); g.lineTo(90, 130); g.stroke();
    g.beginPath(); g.moveTo(-110, 130); g.lineTo(110, 130); g.quadraticCurveTo(100, 160, 0, 160); g.quadraticCurveTo(-100, 160, -110, 130); g.closePath(); fs(g, '#C8D6EE', '#6A7FA2', 3);
    g.save(); g.translate(0, 130); fn(g); g.restore();
    g.restore();
  }
  g.restore();
}
function bigX(g, x, y, p, o = {}) {
  if (p <= 0) return;
  const sc = lerp(2.2, 1, E.out(clamp(p * 4))) * (o.s || 1), a = clamp(p * 6);
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -.12); g.scale(sc, sc); g.globalAlpha *= a * .96;
  g.strokeStyle = C.red; g.lineWidth = 10; circ(g, 0, 0, 64); g.stroke(); g.lineWidth = 3; circ(g, 0, 0, 53); g.stroke();
  g.lineWidth = 15; g.lineCap = 'round'; g.beginPath(); g.moveTo(-27, -27); g.lineTo(27, 27); g.moveTo(27, -27); g.lineTo(-27, 27); g.stroke();
  g.restore();
}

/* ================= 开场：测验 → 答案 → 质量守恒 ================= */
function sceneOpen(g, t) {
  bgDark(g, t, { c0: '#1A3A63', c1: '#060D19', cy: .38 });
  motes(g, t, 36, '#CFE6FF', .28, 5);
  const qU = E.io(seg(t, T.q, T.q + .75));          // 0 → 1：LCD 和砖堆缩到上方
  const gone = E.in(seg(t, T.surv, T.surv + .5));    // 选择题退场

  /* --- 数码管体重 + 绿色徽章 --- */
  const lcdCx = lerp(560, 450, qU), lcdCy = lerp(500, 345, qU), lcdS = lerp(1, .66, qU);
  const lcdA = 1 - gone;
  if (lcdA > .01) {
    g.save(); g.globalAlpha *= lcdA; g.translate(lcdCx, lcdCy); g.scale(lcdS, lcdS);
    const pw = 740, ph = 400;
    rr(g, -pw / 2 + 8, -ph / 2 + 14, pw, ph, 36); g.fillStyle = 'rgba(0,0,0,.4)'; g.fill();
    rr(g, -pw / 2, -ph / 2, pw, ph, 36); const gp = g.createLinearGradient(0, -ph / 2, 0, ph / 2); gp.addColorStop(0, '#2B3B57'); gp.addColorStop(1, '#172336'); fs(g, gp, '#52688F', 4);
    rr(g, -pw / 2 + 30, -ph / 2 + 30, pw - 60, ph - 60, 22); g.fillStyle = '#04100E'; g.fill();
    glow(g, 0, -10, 330, '#3EF2A0', .16);
    const v = lerp(70, 60, E.io(seg(t, .75, 3.0)));
    const str = v.toFixed(1), h = 172, w0 = lcdWidth('88.8', h);
    lcdText(g, '88.8', -w0 / 2 - 36, -h / 2 + 8, h, 'rgba(62,242,160,.07)', 'rgba(62,242,160,.07)');
    glow(g, 0, 8, 220, '#3EF2A0', .12);
    lcdText(g, str.padStart(4, ' '), -w0 / 2 - 36, -h / 2 + 8, h, '#5CFFB4', 'rgba(62,242,160,.07)');
    text(g, 'kg', w0 / 2 + 60, h / 2 - 28, 60, '#5CFFB4', 'black');
    text(g, '体重', -pw / 2 + 92, -ph / 2 + 62, 34, '#6FE0AE', 'bold', 1.3, 'left');
    g.restore();
    // 绿色减重徽章
    const pb = pop(t, 3.0, .45);
    if (pb > 0) {
      g.save(); g.globalAlpha *= lcdA; g.translate(lcdCx + 20 * lcdS, lcdCy + 255 * lcdS); g.scale(pb * lcdS, pb * lcdS);
      rr(g, -170, -44, 340, 88, 44); fs(g, '#12A86A', '#7CFFC4', 4); text(g, '−10.0 kg', 0, 4, 54, '#FFFFFF', 'black'); g.restore();
    }
  }

  /* --- 砖堆（10 公斤脂肪） --- */
  const pileCx = lerp(1390, 1460, qU), pileBase = lerp(800, 470, qU), pileS = lerp(1, .64, qU);
  if (gone < .99) {
    {
      const bw = 150, bh = 66;
      // 聚光灯
      const spA = clamp(seg(t, .9, 1.6)) * (1 - gone);
      beam(g, pileCx, -60, Math.PI / 2, pileBase + 100, 120, 760 * pileS, '#FFF2C4', .17 * spA);
      g.save(); g.globalAlpha *= 1 - gone; g.translate(pileCx, pileBase); g.scale(pileS, pileS); g.translate(-pileCx, -pileBase);
      // 地台
      ell(g, pileCx, pileBase + 16, 430, 36); g.fillStyle = 'rgba(255,230,160,.12)'; g.fill();
      ell(g, pileCx, pileBase + 10, 400, 26); fs(g, '#27406B', '#4C6FA8', 3);
      pileLayout(pileCx, pileBase, bw, bh).forEach(b => {
        const tl = 1.0 + b.k * .17, u = seg(t, tl, tl + .5);
        if (u <= 0) return;
        const fall = (1 - E.bounce(u)) * -(pileBase - 40 + 400);
        brick(g, b.x, b.y + fall, bw, bh, { glow: .22 * clamp(seg(t, 3.0, 3.6)) });
      });
      g.restore();
      if (t > 3.0) {
        const pt = pop(t, 3.0, .45) * (1 - gone);
        if (pt > 0) {
          g.save(); g.translate(pileCx, lerp(300, pileBase - 290 * pileS - 36, qU)); g.scale(pt, pt);
          tag(g, 0, 0, '10 公斤 脂肪', 44, { fill: 'rgba(120,80,0,.88)', lineCol: C.fat, col: C.fatL, font: 'black', lw: 3 }); g.restore();
        }
      }
    }
  }

  /* --- 大标题：这十公斤，去哪了？ --- */
  {
    const pq = pop(t, S('h2') - .05, .5) * (1 - E.in(seg(t, T.surv, T.surv + .5)));
    if (pq > 0) {
      const sz = lerp(128, 100, qU), yy = lerp(152, 112, qU);
      g.save(); g.translate(W / 2, yy); g.scale(pq, pq);
      const m = MK('h2'); const k = t > m ? 1 + .06 * Math.exp(-(t - m) * 5) * Math.cos((t - m) * 22) : 1;
      g.scale(k, k);
      rich(g, '这十公斤，{去哪了}？', 0, 0, sz, { font: 'fun', stroke: sz * .17, hl: C.fat });
      g.restore();
    }
  }

  /* --- 四张选择题卡片 --- */
  const cw = 370, chh = 310, cy0 = 722;
  const letters = ['A', 'B', 'C', 'D'], labels = ['烧成热量', '随大便排出', '变成肌肉', '变成汗和尿'];
  const cols = [C.orange, '#C98A55', C.blue, C.cyan];
  const icons = [(g) => iconFlame(g, 0, 8, 1.1, t), (g) => iconToilet(g, 0, 6, 1.1), (g) => iconDumbbell(g, 0, 4, 1.2), (g) => iconSweat(g, 0, 4, 1.25)];
  for (let i = 0; i < 4; i++) {
    const cx = 160 + cw / 2 + i * (cw + 40);
    const p = pop(t, CK('h3', i) - .05, .45);
    quizCard(g, cx, cy0, cw, chh, letters[i], labels[i], icons[i], p, { col: cols[i], dim: 1 - gone });
  }
  // 倒计时/思考中的问号
  if (t > CK('h3', 3) && t < S('h4')) { const p = pop(t, CK('h3', 3) + .6, .4); text(g, '？', 960, 540, 90 * p, 'rgba(255,255,255,.5)', 'fun'); }
  // 红色叉叉
  const xs = [S('h4') + .18, S('h4') + .62, S('h4') + 1.0];
  xs.forEach((tt, i) => { const cx = 160 + cw / 2 + i * (cw + 40); withAlpha(g, 1 - gone, () => bigX(g, cx + 112, cy0 - 78, seg(t, tt, tt + .35), { rot: -.15 + i * .1, s: .78 })); });
  // D：只对一小部分
  {
    const cx = 160 + cw / 2 + 3 * (cw + 40);
    const tp = seg(t, S('h5') + .85, S('h5') + 1.25);
    withAlpha(g, 1 - gone, () => {
      if (tp > 0) {
        g.save(); g.translate(cx + 40, cy0 - 78); g.rotate(-.1); g.scale(lerp(2, 1, E.out(tp)), lerp(2, 1, E.out(tp))); g.globalAlpha *= tp;
        g.strokeStyle = C.orange; g.lineWidth = 8; rr(g, -112, -38, 224, 76, 14); g.stroke();
        text(g, '只对 16%', 0, 3, 42, C.orange, 'black'); g.restore();
      }
    });
  }

  /* --- 调查：150 位医生/营养师/健身教练 --- */
  if (t >= T.surv - .1 && t < T.phys + .1) {
    const a = win(t, T.surv, T.phys, .5, .35);
    g.save(); g.globalAlpha *= a;
    const gx = 330, gy = 330, cs = 46, cols_n = 15;
    const need = 80;
    text(g, '150 位医生 · 营养师 · 健身教练', gx + (cols_n * cs) / 2 - 22, gy - 74, 42, C.white, 'black');
    for (let i = 0; i < 150; i++) {
      const c = i % cols_n, r = Math.floor(i / cols_n);
      const appear = seg(t, S('h6') + .05 + i * .006, S('h6') + .35 + i * .006);
      const hot = seg(t, CK('h6', 1) + .12 + i * .012, CK('h6', 1) + .42 + i * .012);
      const isHot = i < need;
      const col = isHot ? mix('#7C93B8', C.orange, hot) : '#7C93B8';
      personIcon(g, gx + c * cs, gy + r * cs * 1.0, 1.65, col, appear);
    }
    // 花括号 + 文字
    const hp = seg(t, CK('h6', 2) - .1, CK('h6', 2) + .4);
    if (hp > 0) {
      g.save(); g.globalAlpha *= hp;
      const bx = gx + cols_n * cs + 4, by0 = gy - 26, by1 = gy + 5 * cs * 1.0 - 16;
      g.strokeStyle = C.orange; g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(bx, by0); g.quadraticCurveTo(bx + 24, by0, bx + 24, by0 + 24); g.lineTo(bx + 24, (by0 + by1) / 2 - 12); g.quadraticCurveTo(bx + 24, (by0 + by1) / 2, bx + 46, (by0 + by1) / 2); g.moveTo(bx + 24, (by0 + by1) / 2 + 12 - 12); g.lineTo(bx + 24, by1 - 24); g.quadraticCurveTo(bx + 24, by1, bx, by1); g.stroke();
      iconFlame(g, bx + 104, (by0 + by1) / 2, .55, t);
      text(g, '＞ 一半', bx + 104, (by0 + by1) / 2 + 66, 38, C.orange, 'black');
      g.restore();
    }
    g.restore();
    evid(g, t, S('h6') + .2, T.phys - .1, 1560, 520, 560, { tag: 'BMJ · 2014', n: '调查 n = 150', title: '减掉的脂肪，到底去哪了？', lines: ['{超过一半}的医生、营养师和健身教练认为：脂肪变成了{能量或热量}', '作者：梅尔曼 & 布朗'], foot: 'The BMJ · 圣诞特刊' }, { px: 25 });
  }

  /* --- 热量不是东西，脂肪才是 --- */
  if (t >= T.phys - .1 && t < T.ans + .2) {
    const a = win(t, T.phys, T.ans + .1, .45, .4);
    g.save(); g.globalAlpha *= a;
    const tilt = lerp(0, .13, E.io(seg(t, S('h7') + .1, S('h7') + 1.2)));
    balance(g, W / 2, 380, tilt,
      (gg) => { iconFlame(gg, 0, -52, .62, t); },
      (gg) => { brick(gg, -66, -66, 132, 58, {}); }, .95);
    const pl = pop(t, S('h7') + .2, .4), pr = pop(t, CK('h7', 0) + 1.7, .4);
    g.save(); g.translate(W / 2 - 300, 760); g.scale(pl, pl); tag(g, 0, 0, '热量　是能量，没有重量', 40, { fill: 'rgba(120,50,10,.9)', lineCol: C.orange, col: '#FFD7B0', font: 'black', lw: 3 }); g.restore();
    g.save(); g.translate(W / 2 + 300, 760); g.scale(pr, pr); tag(g, 0, 0, '脂肪　是物质，有重量', 40, { fill: 'rgba(110,80,0,.9)', lineCol: C.fat, col: C.fatL, font: 'black', lw: 3 }); g.restore();
    const pc = pop(t, CK('h7', 1) + .05, .5);
    if (pc > 0) { g.save(); g.translate(W / 2, 200); g.scale(pc, pc); rich(g, '物质不会{凭空消失}', 0, 0, 84, { font: 'fun', stroke: 14, hl: C.fat }); g.restore(); }
    g.restore();
  }

  /* --- 揭晓：呼出去了 --- */
  if (t >= T.breath - .1 && t < T.breath + .4) { g.fillStyle = `rgba(190,240,255,${.28 * (1 - seg(t, T.breath - .1, T.breath + .4))})`; g.fillRect(0, 0, W, H); }
  if (t >= T.ans) {
    const a = E.out(seg(t, T.ans, T.ans + .5)) * (1 - E.in(seg(t, T.eq - .15, T.eq + .3)));
    const px = 1310, py = 585, ps = .98;
    const diss = seg(t, T.breath - .05, T.breath + 2.0);           // 0..1 砖块消散
    const mouth = [px + 146 * ps, py - 165 * ps];
    const lungC = [px + 12 * ps, py + 168 * ps * 1.0];
    g.save(); g.globalAlpha *= a;
    // 左侧：砖堆
    const bw = 150, bh = 66, cxp = 560, base = 790;
    ell(g, cxp, base + 12, 380, 24); fs(g, '#27406B', '#4C6FA8', 3);
    glow(g, cxp, base - 120, 360, C.fat, .22 * (1 - diss));
    pileLayout(cxp, base, bw, bh).forEach(b => {
      const u = clamp((diss - b.k * .05) / .45);
      if (u < 1) { g.save(); g.globalAlpha *= 1 - E.in(u); brick(g, b.x, b.y - u * 18, bw, bh, {}); g.restore(); }
      dissolve(g, b.x, b.y, bw, bh, b.k, u, lungC, { col: C.cyan });
    });
    // 右侧：人像 + 呼出的气泡
    const m = profile(g, px, py, ps, t, { breath: .5 + .5 * Math.sin(t * 2.2) });
    const rate = lerp(0, 1, E.out(diss)) + (t > T.lung ? .5 : 0);
    const r = R(77);
    for (let i = 0; i < 46; i++) {
      const ph = r() * 1.0, life = 2.6 + r() * 1.4, sp = 70 + r() * 90, yoff = (r() - .5) * 60, rad = 11 + r() * 15;
      const tt = (t * 0.55 + ph * life + i * .31) % life, u = tt / life;
      if (i / 46 > rate) continue;
      const bx = m[0] + 14 + u * (330 + sp), by = m[1] + yoff - u * (150 + sp * .6) + Math.sin(u * 7 + i) * 16;
      bubble(g, bx, by, rad * (.5 + u * .7), C.cyan, (1 - u) * clamp(u * 8), i % 3 === 0 ? 'CO₂' : undefined);
    }
    g.restore();
    // 砖堆标签
    const tp = pop(t, T.ans + .1, .4) * (1 - diss);
    if (tp > 0) { g.save(); g.translate(cxp, 430); g.scale(tp, tp); tag(g, 0, 0, '10 公斤 脂肪', 44, { fill: 'rgba(120,80,0,.88)', lineCol: C.fat, col: C.fatL, font: 'black', lw: 3 }); g.restore(); }
    // “呼出去”大字
    const pbig = pop(t, T.breath - .05, .5) * (1 - E.in(seg(t, T.split + .6, T.split + 1.0)));
    if (pbig > 0) { g.save(); g.translate(560, 250); g.scale(pbig, pbig); rich(g, '呼出去了！', 0, 0, 124, { font: 'fun', stroke: 22, hl: C.cyan, col: C.cyan }); g.restore(); }
    // 10 公斤 = 8.4 + 1.6 分解条
    if (t >= T.split) {
      const pb = E.out(seg(t, T.split, T.split + .6)) * (t < T.eq - .1 ? 1 : 1 - E.in(seg(t, T.eq - .1, T.eq + .3)));
      g.save(); g.globalAlpha *= pb;
      const bx = 330, by = 150, bwid = 1260, bhh = 74, k8 = 8.4 / 10, f1 = E.out(seg(t, T.split + .2, T.split + 1.0));
      rr(g, bx, by, bwid, bhh, 18); fs(g, 'rgba(10,20,36,.7)', hexA(C.white, .3), 3);
      rr(g, bx + 5, by + 5, (bwid - 10) * k8 * f1, bhh - 10, 14); fs(g, C.cyan, null);
      const w2 = (bwid - 10) * (1 - k8) * E.out(seg(t, T.water - .1, T.water + .6));
      if (w2 > 1) { rr(g, bx + 5 + (bwid - 10) * k8, by + 5, w2, bhh - 10, 14); fs(g, C.blue, null); }
      if (f1 > .8) text(g, '8.4 kg　二氧化碳 → 呼出', bx + (bwid - 10) * k8 / 2, by + bhh / 2 + 2, 36, '#06303F', 'black');
      if (w2 > 150) text(g, '1.6 kg 水', bx + 5 + (bwid - 10) * k8 + w2 / 2, by + bhh / 2 + 2, 32, '#EAF3FF', 'black');
      g.restore();
    }
    // 你，是用肺，在减肥。
    if (t >= T.lung) {
      const pl = pop(t, T.lung + .1, .5) * (1 - E.in(seg(t, T.eq - .05, T.eq + .3)));
      if (pl > 0) { g.save(); g.translate(560, 430); g.scale(pl, pl); rich(g, '你，是用{肺}', 0, -62, 104, { font: 'fun', stroke: 18, hl: C.cyan }); rich(g, '在减肥。', 0, 62, 104, { font: 'fun', stroke: 18 }); g.restore(); }
    }
  }

  /* --- 质量守恒：两边一样高 --- */
  if (t >= T.eq - .1) {
    const a = win(t, T.eq, T.map + .25, .4, .35);
    g.save(); g.globalAlpha *= a;
    text(g, '质量守恒：吃进去的 = 出来的', 800, 170, 66, C.white, 'fun');
    const p = seg(t, T.eq + .1, T.eq + 1.7);
    massColumns(g, 800, 880, 12.6, p, t);
    const pi_ = pop(t, T.eq + .5, .4), po_ = pop(t, T.eq + 1.3, .4);
    g.save(); g.translate(620, 330); g.scale(pi_, pi_); tag(g, 0, 0, '吸进来 + 脂肪', 34, { font: 'black' }); g.restore();
    g.save(); g.translate(980, 330); g.scale(po_, po_); tag(g, 0, 0, '出去了', 34, { font: 'black' }); g.restore();
    if (p > .9) { const pp = pop(t, T.eq + 1.8, .4); if (pp > 0) { g.save(); g.translate(800, 940); g.scale(pp, pp); tag(g, 0, 0, '39 kg　＝　39 kg', 40, { font: 'black', fill: 'rgba(10,30,50,.9)' }); g.restore(); } }
    g.restore();
    evid(g, t, T.eq + .5, T.map + .15, 1480, 560, 520, { tag: 'BMJ · 2014', title: '10 公斤脂肪的去向', lines: ['吸进 {29 kg} 氧气', '产生 {28 kg} 二氧化碳和 {11 kg} 水', '约 {84%} 的脂肪原子经肺呼出'], foot: '梅尔曼 & 布朗' }, { px: 24 });
  }
  vignette(g, .5);
}


/* ================= 路线图：出口很宽 → 三道关卡 → 片名 → 小油登场 ================= */
const MAP = { cell: [210, 560], lung: [1710, 575], road: [330, 1580], y: 560, doors: [640, 960, 1280], base: 668 };
function camAt(t, keys) {
  if (t <= keys[0][0]) return { cx: keys[0][1], cy: keys[0][2], s: keys[0][3] };
  for (let i = 1; i < keys.length; i++) {
    if (t <= keys[i][0]) {
      const u = E.io(seg(t, keys[i - 1][0], keys[i][0])), a = keys[i - 1], b = keys[i];
      return { cx: lerp(a[1], b[1], u), cy: lerp(a[2], b[2], u), s: lerp(a[3], b[3], u) };
    }
  }
  const k = keys[keys.length - 1]; return { cx: k[1], cy: k[2], s: k[3] };
}
function w2s(c, x, y) { return [(x - c.cx) * c.s + W / 2, (y - c.cy) * c.s + H / 2]; }

function sceneMap(g, t) {
  bgDark(g, t, { c0: '#17335A', c1: '#050C18', cy: .5 });
  motes(g, t, 30, '#CFE6FF', .25, 9);
  const cam = camAt(t, [
    [T.map, 960, 540, 1], [T.xy - .5, 960, 540, 1], [T.xy + .6, 330, 575, 2.25],
    [S('y3') - .3, 330, 575, 2.25], [S('y3') + .7, 560, 575, 1.55],
    [S('n0') - .1, 560, 575, 1.55], [S('n0') + 1.7, 700, 570, 1.32],
  ]);
  g.save(); g.translate(W / 2, H / 2); g.scale(cam.s, cam.s); g.translate(-cam.cx, -cam.cy);
  const [cx0, cy0] = MAP.cell, [lx, ly] = MAP.lung, ry = MAP.y;
  // 出口的光
  const exitA = E.out(seg(t, T.map + .1, T.map + .9));
  glow(g, lx, ly, 360, C.cyan, .35 * exitA);
  roadStrip(g, t, MAP.road[0], MAP.road[1], ry, 130 + 30 * (1 - clamp(seg(t, T.doors, T.doors + 1))) * 0);
  // 沿路流动的光点（脂肪一路往出口去；三道门落下后被堵在第一道门前）
  const blockX = MAP.doors[0] - 118;
  for (let i = 0; i < 18; i++) {
    const ph = (i / 18), sp = 130, L = MAP.road[1] - MAP.road[0] - 100;
    let x = MAP.road[0] + 50 + ((t * sp + ph * L) % L);
    const doorsDown = t > T.doors + .6;
    if (doorsDown && x > blockX) x = blockX - ((i * 29) % 70) - 6 * Math.sin(t * 4 + i);
    const y = ry + Math.sin(t * 2 + i * 1.7) * 30;
    const a = exitA * (doorsDown && x < blockX - 5 ? .95 : .85);
    circ(g, x, y, 8 + (i % 3) * 2); g.globalAlpha *= 1; fs(g, hexA(doorsDown && x > blockX - 80 ? C.fat : C.fat, a), null);
  }
  // 起点：脂肪细胞
  fatCell(g, { x: cx0, y: cy0, r: 128, t, seed: 1 });
  withAlpha(g, exitA, () => tag(g, cx0, cy0 + 188, '脂肪细胞', 36, { font: 'black' }));
  // 终点：肺
  withAlpha(g, exitA, () => { lungs(g, lx, ly, .78, Math.sin(t * 2) * .5 + .5); tag(g, lx, ly + 170, '出口 · 肺', 36, { font: 'black', fill: 'rgba(0,70,95,.85)', lineCol: C.cyan }); });
  // “出口很宽”的大箭头光效
  withAlpha(g, exitA * (1 - E.in(seg(t, T.doors - .3, T.doors + .3))), () => {
    const ap = .5 + .5 * Math.sin(t * 3);
    arrow(g, 1240, ry - 130, 1540, ry - 130, 26, hexA(C.cyan, .5 + .3 * ap), { head: 52 });
    text(g, '出口很宽', 1390, ry - 190, 44, C.cyan, 'black');
  });
  // 排队的人群
  const crowdA = seg(t, CK('h12', 2) - .1, CK('h12', 2) + .6) * (1 - E.in(seg(t, T.title - .5, T.title)));
  if (crowdA > 0) {
    const r = R(31);
    for (let i = 0; i < 28; i++) {
      const col = i % 7, row = Math.floor(i / 7), px = 380 + col * 40 + r() * 8, py = 760 + row * 46 + Math.sin(t * 2 + i) * 3;
      personIcon(g, px, py, 1.75, '#8FA6C8', crowdA * seg(t, CK('h12', 2) + i * .015, CK('h12', 2) + i * .015 + .3));
    }
    const q = pop(t, CK('h12', 2) + .3, .4) * crowdA;
    if (q > 0) { for (let i = 0; i < 4; i++) text(g, '？', 410 + i * 90, 700 + Math.sin(t * 3 + i) * 8, 46 * q, C.fat, 'fun'); }
    withAlpha(g, crowdA, () => tag(g, 790, 842, '减不下来', 34, { font: 'black' }));
  }
  // 三道门落下
  MAP.doors.forEach((dx, i) => {
    const t0 = T.doors + i * .32 - .05, u = seg(t, t0, t0 + .55); if (u <= 0) return;
    const drop = (1 - E.bounce(u)) * 520;
    const lit = win(t, S('h14') + .3 + i * .6, S('h14') + 1.1 + i * .6, .2, .4);
    gateDoor(g, dx, MAP.base - drop, .9, { num: '?', t, glowA: lit, lit });
    if (u > .85 && u < 1) { for (let k = 0; k < 6; k++) { const a = (k / 6) * TAU; circ(g, dx + Math.cos(a) * (60 + 70 * u), MAP.base + 6 + Math.sin(a) * 10, 5); g.fillStyle = 'rgba(190,210,240,.35)'; g.fill(); } }
  });
  // 小油
  const xyIn = seg(t, T.xy, T.xy + .5);
  if (xyIn > 0) {
    let px = cx0, py = cy0 + 6, expr = 'happy', flip = false, sc = 1.0, look = [1, 0];
    const tj = S('y3');
    if (t >= tj - .05) {
      const u = seg(t, tj + .2, tj + 1.3), v = seg(t, S('n0'), S('n0') + 1.3);
      px = lerp(cx0, MAP.doors[0] - 150, E.io(Math.max(u * .55, v) * (v > 0 ? 1 : 1)));
      if (v <= 0) px = lerp(cx0, 380, E.io(u));
      expr = 'det';
    }
    if (t >= S('y4') ) expr = 'det';
    const hop = (t >= tj + .1) ? Math.abs(Math.sin(t * 7)) * 26 * (t < S('n0') + 1.4 ? 1 : 0) : Math.sin(t * 2) * 6;
    xiaoyou(g, { x: px, y: py - hop - (t >= tj ? 40 : 0), s: .96 * xyIn * sc, t, expr, look, flip, tailAmp: 1 });
    // 对话（屏幕坐标）
    g.restore(); g.save();
    const sp = w2s(cam, px, py - 60);
    const lines = [['y1', '大家好，\n我是小油。'], ['y2', '一个脂肪分子。\n在你的肚子里，\n已经住了一年多了。'], ['y3', '今天，\n我要出去！']];
    for (const [id, txt] of lines) {
      const a = S(id) - .05, b = EN(id) + .55, p = pop(t, a, .35) * (1 - E.in(seg(t, b, b + .25)));
      if (p > 0) speech(g, sp[0] + 270, sp[1] - 190, txt, 46, p, [sp[0] + 60, sp[1] - 110]);
    }
    g.restore(); g.save(); g.translate(W / 2, H / 2); g.scale(cam.s, cam.s); g.translate(-cam.cx, -cam.cy);
  }
  g.restore();

  /* --- 片名卡 --- */
  {
    const a = win(t, T.title, S('y1') + .15, .45, .55);
    if (a > 0) {
      g.fillStyle = `rgba(3,8,18,${.82 * a})`; g.fillRect(0, 0, W, H);
      const p = pop(t, T.title + .1, .55);
      g.save(); g.globalAlpha *= a; glow(g, W / 2, 500, 620, C.fat, .22);
      g.translate(W / 2, 500); g.scale(p, p); rich(g, '你减掉的脂肪，{去哪了}？', 0, 0, 140, { font: 'fun', stroke: 22, hl: C.fat, maxW: 1700 }); g.restore();
      g.save(); g.globalAlpha *= a * clamp(seg(t, T.title + .5, T.title + .9)); text(g, '关于「减不下来」的三道关卡', W / 2, 655, 50, C.mute, 'bold'); g.restore();
    }
  }
  vignette(g, .5);
}
