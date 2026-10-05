'use strict';
/* scenes3.js：第二关 —— 会说话的脂肪（并体共生的小鼠 → 瘦素 → 饥饿神经元 → 光控开关 → 减重后的激素） */

/* 实验台：深青色背景 + 台面 */
function labBench(g, t, y = 800) {
  bgDark(g, t, { c0: '#1B4560', c1: '#060F1A', cy: .45, gridA: .05 });
  rr(g, -40, y, W + 80, 60, 10); const gr = g.createLinearGradient(0, y, 0, y + 60); gr.addColorStop(0, '#D4DEEC'); gr.addColorStop(1, '#9FB1CC'); fs(g, gr, '#6F84A8', 3);
  g.fillStyle = '#6F84A8'; g.fillRect(-40, y + 60, W + 80, 240);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 3; for (let x = 0; x < W; x += 160) { g.beginPath(); g.moveTo(x, y + 60); g.lineTo(x, y + 300); g.stroke(); }
}
function iconLock(g, x, y, s = 1) {
  g.save(); g.translate(x, y); g.scale(s, s);
  g.strokeStyle = '#B9C6E0'; g.lineWidth = 12; g.beginPath(); g.arc(0, -16, 26, Math.PI, 0); g.stroke();
  rr(g, -40, -16, 80, 62, 12); fs(g, '#FFD45A', '#B88400', 4); circ(g, 0, 10, 9); g.fillStyle = '#7A5200'; g.fill(); g.restore();
}

/* ================= 并体共生的小鼠：一种“别吃了”的信号 ================= */
function sceneMice(g, t) {
  const BY = 800;                                   // 台面
  labBench(g, t, BY);
  motes(g, t, 16, '#CFE6FF', .15, 41);
  const tB3 = S('b3') - .4, tB5 = S('b5') - .5, tB6 = S('b6') - .3;

  /* --- 开场：警报灯 --- */
  {
    const a = win(t, T.g2 + .4, S('b2') + .3, .3, .6);
    if (a > 0) { g.save(); g.globalAlpha *= a; siren(g, W / 2, 640, 2.6, t, 1); g.restore(); }
  }

  /* --- 一群怪老鼠，吃个不停 --- */
  {
    const a = win(t, T.g2 + .4, tB3 + .45, .3, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      [[430, 1.0], [960, .92], [1490, 1.05]].forEach(([mx, f], i) => {
        const pm = pop(t, S('b2') - .2 + i * .22, .5) || (t > S('b2') + 1 ? 1 : 0);
        if (pm <= 0) return;
        const lvl = 1 - ((t * .12 + i * .3) % 1) * .8;
        g.save(); g.translate(mx, BY - 8); g.scale(pm, pm);
        foodBowl(g, 205, 0, .85, lvl);
        mouse(g, { x: 0, y: -(80 + 36 * f), s: .98, t: t + i, fat: f, state: 'eat' });
        g.restore();
      });
      const tp = pop(t, CK('b2', 0) + .2, .45);
      if (tp > 0) { g.save(); g.translate(960, 220); g.scale(tp, tp); tag(g, 0, 0, '1949 · 美国杰克逊实验室：一群特别胖的小鼠', 38, { font: 'black' }); g.restore(); }
      const bp = pop(t, CK('b2', 1) + .2, .45);
      if (bp > 0) { g.save(); g.translate(960, 330); g.scale(bp, bp); rich(g, '吃个不停，胖得{圆滚滚}', 0, 0, 72, { font: 'fun', stroke: 14, hl: C.fat }); g.restore(); }
      g.restore();
    }
  }

  /* --- 把两只老鼠的血液循环连在一起 --- */
  {
    const a = win(t, tB3, T.lept + .3, .45, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const second = t >= tB5;                       // 第二组：换一种胖老鼠
      const FX = 560, NX = 1260;
      const lose = E.io(seg(t, S('b4'), S('b4') + 1.6)), starve = E.io(seg(t, CK('b5', 1), CK('b5', 2) + 1.2));
      const fatF = second ? 1 : lerp(1, .55, lose), lvlF = second ? .55 : lerp(.9, .35, lose);
      // 血管
      const tubeP = E.io(seg(t, tB3 + .3, S('b3') + 2.8));
      const P = bloodTube(g, t, [FX + 30, BY - 205], [NX + 30, BY - 150], { lift: 150, p: tubeP, red: true, sig: t > tB6 - .4 ? 7 : 0 });
      // 胖老鼠
      mouse(g, { x: FX, y: BY - (80 + 36 * fatF), s: .98, t, fat: fatF, state: 'eat' });
      foodBowl(g, FX + 215, BY - 8, .85, lvlF);
      // 正常老鼠
      const nState = second ? (starve > .15 ? 'weak' : 'idle') : 'eat';
      mouse(g, { x: NX, y: BY - 86 + (nState === 'weak' ? 12 : 0), s: .98, t, fat: 0, state: nState, gray: second ? starve * .85 : 0, a: second ? 1 - starve * .22 : 1 });
      foodBowl(g, NX + 205, BY - 8, .85, second ? 1 : .55);
      if (second && starve > .3) { for (let i = 0; i < 3; i++) text(g, 'z', NX + 40 + i * 28, BY - 190 - i * 28 - Math.sin(t * 2 + i) * 4, 34 + i * 8, hexA('#BFD0F0', .9 * starve), 'fun'); }
      // 标签
      withAlpha(g, pop(t, tB3 + .2, .4), () => { tag(g, FX, BY - 270 - (second ? 20 : 0), second ? '另一种胖老鼠' : '胖老鼠', 36, { font: 'black' }); tag(g, NX, BY - 235, '正常老鼠', 36, { font: 'black' }); });
      // 结果
      const r1 = pop(t, S('b4') + .35, .45) * (second ? 0 : 1) * (1 - E.in(seg(t, tB5 - .3, tB5)));
      if (r1 > 0) { g.save(); g.translate(FX + 140, 440); g.scale(r1, r1); tag(g, 0, 0, '胖老鼠　少吃了，变瘦了', 38, { font: 'black', fill: 'rgba(10,90,60,.92)', lineCol: C.green }); g.restore(); }
      const r2 = pop(t, CK('b5', 1) + .1, .45) * (second ? 1 : 0) * (1 - E.in(seg(t, tB6 - .2, tB6 + .2)));
      if (r2 > 0) { g.save(); g.translate(NX - 20, 440); g.scale(r2, r2); tag(g, 0, 0, '正常的那只　不吃东西了', 38, { font: 'black', fill: 'rgba(130,30,40,.92)', lineCol: C.red }); g.restore(); }
      // 血液里的信号
      const sg = pop(t, tB6 + .2, .5);
      if (sg > 0) {
        const q = P(.5); g.save(); g.translate(q[0], q[1] - 110); g.scale(sg, sg);
        speech(g, 0, 0, '够了，别吃了', 52, 1, [0, 100], { fill: '#E8FBFF', line: C.cyan }); g.restore();
        withAlpha(g, sg, () => tag(g, q[0], q[1] - 230, '血液里的一种信号', 34, { font: 'black', fill: 'rgba(0,70,95,.92)', lineCol: C.cyan }));
      }
      g.restore();
      evid(g, t, S('b3') + 1.4, tB6 - .1, 1520, 270, 560, { tag: 'Diabetologia · 1973', title: '并体共生：把两只老鼠的血液循环连起来', lines: ['胖老鼠＋正常老鼠：胖老鼠{少吃了}，体重下降', '换一种胖老鼠：正常的那只{不吃东西}，最后饿死', '推论：血液里有一种{“别吃了”}的信号'], foot: '柯尔曼 · 杰克逊实验室' }, { px: 23 });
    }
  }
  vignette(g, .45);
}

/* ================= 瘦素：脂肪向大脑汇报库存 → 压着饥饿神经元 ================= */
function sceneLeptin(g, t) {
  bgDark(g, t, { c0: '#1A3558', c1: '#050B16' });
  motes(g, t, 22, '#CFE6FF', .18, 52);
  const tFew = S('b8') - .15, tBrain = S('b9') - .35, tInhib = S('b10') - .1, tRel = CK('b10', 1) - .05;

  /* --- 汇报：脂肪细胞 → 血管 → 大脑；右侧有“库存”表 --- */
  {
    const a = win(t, T.lept, tBrain + .45, .4, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const few = E.io(seg(t, tFew, tFew + .7));                   // 脂肪变少
      const nCells = few > .5 ? 3 : 7, cells = hexCluster(nCells, 52, 6);
      g.save(); g.translate(340, 700);
      const sh = few > .5 ? .86 : 1;
      cells.forEach(([x, y], i) => fatCell(g, { x, y, r: 52 * (few > .5 ? .8 : 1), t, seed: i + 2, nuc: false }));
      g.restore();
      withAlpha(g, pop(t, T.lept + .1, .4), () => tag(g, 340, 880, few > .5 ? '脂肪少了' : '脂肪细胞', 36, { font: 'black', fill: few > .5 ? 'rgba(130,30,40,.9)' : 'rgba(10,18,32,.8)', lineCol: few > .5 ? C.red : hexA(C.white, .25) }));
      // 血管 + 瘦素粒子
      const sig = few > .5 ? 2 : (t < CK('b7', 1) ? 3 : 9);
      const tubeP = E.io(seg(t, T.lept + .2, T.lept + 1.4));
      const P = bloodTube(g, t, [470, 650], [1440, 650], { lift: 130, p: tubeP, red: false, sig });
      const nm = pop(t, CK('b7', 0) + .1, .45);
      if (nm > 0) { const q = P(.5); g.save(); g.translate(q[0], q[1] - 78); g.scale(nm, nm); tag(g, 0, 0, '瘦素 leptin', 42, { font: 'black', fill: 'rgba(0,70,95,.92)', lineCol: C.cyan, col: '#CFF6FF' }); g.restore(); }
      // 大脑 + 库存表
      brain(g, 1500, 700, .82, t, {});
      const lvl = few > .5 ? lerp(.9, .16, E.io(seg(t, tFew + .2, tFew + 1.2))) : lerp(.2, .92, E.io(seg(t, CK('b7', 1) - .2, CK('b7', 1) + 1.3)));
      const gx = 1790, gy = 500, gh = 260; rr(g, gx - 26, gy, 52, gh, 16); fs(g, 'rgba(8,16,30,.8)', hexA(C.white, .3), 3);
      const gc = lvl > .5 ? C.green : C.red; rr(g, gx - 20, gy + gh - 6 - (gh - 12) * lvl, 40, (gh - 12) * lvl, 12); fs(g, gc, null);
      text(g, '库存', gx, gy - 26, 30, C.white, 'black');
      const sp = pop(t, CK('b7', 2), .45);
      if (sp > 0 && few < .5) { g.save(); g.translate(1500, 500); g.scale(sp, sp); tag(g, 0, 0, '库存充足', 40, { font: 'black', fill: 'rgba(10,90,60,.92)', lineCol: C.green }); g.restore(); }
      const lp = pop(t, tFew + .6, .45);
      if (lp > 0 && few > .5) { g.save(); g.translate(1500, 500); g.scale(lp, lp); tag(g, 0, 0, '库存告急', 40, { font: 'black', fill: 'rgba(130,30,40,.92)', lineCol: C.red }); g.restore(); }
      g.restore();
      evid(g, t, S('b7') + .2, tFew - .1, 560, 255, 620, { tag: 'Nature · 1994', title: '找到了“别吃了”的信号', lines: ['弗里德曼的团队克隆出老鼠的 {ob 基因}', '它编码的激素叫{瘦素}（leptin，来自希腊语 leptos，“瘦”）'], foot: 'Zhang 等 · 洛克菲勒大学' }, { px: 23 });
      evid(g, t, CK('b7', 1) + .1, tFew - .1, 1330, 255, 580, { tag: 'NEJM · 1996', n: 'n = 275', title: '血液里的瘦素，跟体脂高度相关', lines: ['瘦素浓度与体脂率：{r = 0.85}', '减重后瘦素{随之下降}'], foot: 'Considine 等 · 136 位正常体重 + 139 位肥胖者' }, { px: 23 });
    }
  }

  /* --- 大脑底部：饥饿神经元；瘦素压着它们 --- */
  {
    const a = win(t, tBrain, T.light + .5, .45, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const zoom = E.io(seg(t, CK('b9', 1) - .3, CK('b9', 1) + .7));
      // 左：大脑，下丘脑发光，放大镜圈出来
      brain(g, 620, 560, 1.28, t, { hl: .6 + .4 * Math.sin(t * 3) });
      withAlpha(g, pop(t, S('b9') + .1, .4), () => tag(g, 600, 850, '大脑底部', 36, { font: 'black' }));
      // 右：放大后的神经元圈
      const R0 = 300 * zoom, cx = 1360, cy = 540;
      if (zoom > 0.02) {
        g.save(); g.strokeStyle = hexA(C.cyan, .7 * zoom); g.lineWidth = 4; g.setLineDash([10, 8]); g.beginPath(); g.moveTo(520, 612); g.lineTo(cx - R0 * .9, cy + R0 * .35); g.stroke(); g.setLineDash([]); g.restore();
        g.save(); g.translate(cx, cy);
        circ(g, 0, 0, R0); const bgc = g.createRadialGradient(0, 0, 40, 0, 0, R0); bgc.addColorStop(0, '#2A1A3E'); bgc.addColorStop(1, '#120B22'); g.fillStyle = bgc; g.fill();
        g.save(); circ(g, 0, 0, R0); g.clip();
        const act = t < tInhib ? .15 : (t < tRel ? .08 : clamp(seg(t, tRel, tRel + .8)));
        [[-110, -40, 1], [30, -90, 2], [120, -10, 3], [-40, 60, 4], [80, 90, 5], [-150, 70, 6]].forEach(([nx, ny, sd], i) => {
          neuron(g, nx * zoom, ny * zoom, .95 * zoom, { t, act: t < tInhib ? .55 + .2 * Math.sin(t * 5 + i) : act, seed: sd, col: C.pink });
        });
        // 瘦素落在神经元上，像刹车
        if (t >= tInhib - .1 && t < tRel) {
          const u = clamp(seg(t, tInhib - .1, tInhib + .7));
          for (let i = 0; i < 12; i++) { const an = i * 2.4, rad = 60 + (i % 4) * 55, px = Math.cos(an) * rad * .9, py = Math.sin(an) * rad * .6 - 20; g.save(); g.translate(px, py + (1 - u) * -80); g.globalAlpha *= u; glow(g, 0, 0, 30, C.cyan, .7); poly(g, [0, 1, 2, 3, 4, 5].map(k => [Math.cos(k * Math.PI / 3) * 10, Math.sin(k * Math.PI / 3) * 10])); fs(g, '#BFF4FF', C.cyan, 2); g.restore(); }
          if (u > .6) { text(g, '⊣', -120, -150, 60, C.cyan, 'black'); text(g, '⊣', 100, -60, 60, C.cyan, 'black'); }
        }
        g.restore();
        circ(g, 0, 0, R0); g.strokeStyle = '#8CB0E6'; g.lineWidth = 6; g.stroke();
        g.restore();
        withAlpha(g, pop(t, CK('b9', 1) + .3, .45), () => tag(g, cx, cy + R0 + 52, '饥饿神经元', 44, { font: 'black', fill: 'rgba(130,30,80,.92)', lineCol: C.pink, col: '#FFD3E3' }));
        const rp = pop(t, tInhib + .5, .45) * (t < tRel ? 1 : 0);
        if (rp > 0) { g.save(); g.translate(cx, cy - R0 - 34); g.scale(rp, rp); tag(g, 0, 0, '瘦素：压着它们', 40, { font: 'black', fill: 'rgba(0,70,95,.92)', lineCol: C.cyan, col: '#CFF6FF' }); g.restore(); }
        const lp = pop(t, tRel + .2, .45);
        if (lp > 0) { siren(g, cx + R0 - 40, cy - R0 + 60, .9 * lp, t, 1); g.save(); g.translate(cx, cy - R0 - 34); g.scale(lp, lp); tag(g, 0, 0, '压制松开：饿！', 44, { font: 'black', fill: 'rgba(130,30,40,.95)', lineCol: C.red, col: '#FFE0E0' }); g.restore(); }
      }
      g.restore();
    }
  }
  vignette(g, .45);
}

/* ================= 光控开关：一束光让吃饱的小鼠狂吃 ================= */
function sceneLight(g, t) {
  const BY = 840;
  labBench(g, t, BY);
  motes(g, t, 14, '#CFE6FF', .12, 61);
  const tOn = CK('b12', 1) - .35, tOff = CK('b13', 1) - .1, tChart = CK('b12', 2) - .1;
  const on = (t >= tOn && t < tOff) ? E.out(seg(t, tOn, tOn + .25)) : 0;
  const a = win(t, T.light, T.human + .5, .45, .5);
  g.save(); g.globalAlpha *= a;
  // 左：有机玻璃箱 + 小鼠 + 食盆 + 光纤
  const bx = 150, by = 420, bw = 860, bh = 440;
  labBox(g, bx, by, bw, bh);
  const feeding = on > .5;
  const pel = feeding ? clamp(1 - (t - tOn) * .085) : (t >= tOff ? clamp(1 - (tOff - tOn) * .085) : 1);
  foodBowl(g, bx + bw - 170, BY - 8, .95, pel);
  const mx = bx + 400, my = BY - 128;
  mouse(g, { x: mx, y: my, s: 1.0, t, fat: .1, state: feeding ? 'eat' : 'idle' });
  const fiberOn = on;
  const fp = E.out(seg(t, S('b11') + 1.8, S('b11') + 2.8));
  if (fp > 0) fiber(g, t, [mx + 20, by - 40], [mx + 52, my - 70 + (feeding ? 20 : 0)], fiberOn);
  withAlpha(g, pop(t, S('b12') + .2, .4) * (t < tOn ? 1 : 0), () => tag(g, mx, by + 70, '刚吃饱，碰都不想碰', 36, { font: 'black' }));
  withAlpha(g, pop(t, tOn + .8, .4) * (t < tOff ? 1 : 0), () => tag(g, bx + bw / 2 - 40, by + 44, '几分钟内：狂吃', 38, { font: 'black', fill: 'rgba(130,60,10,.92)', lineCol: C.orange, col: '#FFD9B0' }));
  withAlpha(g, pop(t, tOff + .3, .4), () => tag(g, bx + bw / 2 - 40, by + 44, '灯一关：停', 38, { font: 'black', fill: 'rgba(10,90,60,.92)', lineCol: C.green }));
  // 右上：光控开关
  {
    const sx = 1450, sy = 215, sp = pop(t, S('b11') + 1.2, .45);
    if (sp > 0) {
      g.save(); g.translate(sx, sy); g.scale(sp, sp);
      rr(g, -150, -50, 300, 100, 50); fs(g, on > .5 ? 'rgba(40,120,220,.85)' : 'rgba(30,45,75,.9)', on > .5 ? '#9AD0FF' : hexA(C.white, .3), 4);
      text(g, on > .5 ? '开' : '关', lerp(62, -62, on), 2, 42, on > .5 ? '#FFFFFF' : '#7F95BE', 'black');
      circ(g, lerp(-62, 62, on), 0, 36); fs(g, '#EAF3FF', '#7FA6D8', 3);
      text(g, '光控开关', -240, 2, 32, C.mute, 'black', 1.3, 'right');
      g.restore();
      glow(g, sx, sy, 200, '#46A8FF', .5 * on);
    }
  }
  // 右：神经元（亮灭）→ 食量柱状图
  {
    const nx = 1450, ny = 580, pc = pop(t, S('b11') + 1.0, .5) * (1 - E.in(seg(t, tChart, tChart + .4)));
    if (pc > 0) {
      g.save(); g.translate(nx, ny); g.scale(pc, pc);
      circ(g, 0, 0, 250); const bgc = g.createRadialGradient(0, 0, 30, 0, 0, 250); bgc.addColorStop(0, '#2A1A3E'); bgc.addColorStop(1, '#120B22'); g.fillStyle = bgc; g.fill();
      g.save(); circ(g, 0, 0, 250); g.clip();
      [[-100, -50, 1], [30, -90, 2], [105, 0, 3], [-40, 55, 4], [80, 90, 5]].forEach(([px, py, sd], i) => neuron(g, px, py, .85, { t, act: on > .5 ? .85 + .15 * Math.sin(t * 20 + i) : .12, seed: sd }));
      g.restore();
      if (on > .1) { beam(g, 0, -250, Math.PI / 2, 250, 30, 220, '#7FC4FF', .45 * on); glow(g, 0, -230, 200, '#46A8FF', .7 * on); }
      circ(g, 0, 0, 250); g.strokeStyle = on > .5 ? '#9AD0FF' : '#8CB0E6'; g.lineWidth = 6; g.stroke();
      g.restore();
      withAlpha(g, pc, () => tag(g, nx, ny + 300, on > .5 ? '饥饿神经元：被光点亮' : '饥饿神经元', 38, { font: 'black', fill: 'rgba(130,30,80,.92)', lineCol: C.pink, col: '#FFD3E3' }));
    }
    // 食量柱状图
    const cp = pop(t, tChart + .2, .5);
    if (cp > 0) {
      g.save(); g.translate(1450, 580); g.scale(cp, cp);
      rr(g, -280, -290, 560, 600, 24); fs(g, 'rgba(8,18,34,.85)', hexA(C.white, .22), 3);
      text(g, '1 小时的食量', 0, -240, 38, C.white, 'black');
      const hmax = 360, bars = [[.85, '打光', C.cyan], [1.04, '饿了 24 小时\n再给饭', C.orange]];
      bars.forEach(([v, lab, col], i) => {
        const x = -110 + i * 220, h = hmax * (v / 1.1) * E.out(seg(t, tChart + .35 + i * .25, tChart + 1.1 + i * .25));
        rr(g, x - 62, 200 - h, 124, h, 10); fs(g, col, null);
        text(g, v.toFixed(2) + ' g', x, 200 - h - 30, 34, C.white, 'black');
        text(g, lab, x, 250, 28, C.mute, 'black');
      });
      g.restore();
    }
  }
  // 800 个神经元
  {
    const p8 = pop(t, S('b13') + .1, .5) * (t < T.human - .2 ? 1 : 0);
    if (p8 > 0) { g.save(); g.translate(560, 210); g.scale(p8, p8); tag(g, 0, 0, '只点亮了约 800 个神经元', 42, { font: 'black', fill: 'rgba(130,30,80,.92)', lineCol: C.pink, col: '#FFD3E3' }); g.restore(); }
  }
  g.restore();
  evid(g, t, tChart + .1, T.human - .3, 560, 255, 640, { tag: 'Nature Neuroscience · 2011', title: '一束光，让吃饱的小鼠狂吃', lines: ['用光激活约 {800 个}饥饿神经元', '{几分钟内}开始狂吃；灯一关就停', '1 小时食量 {0.85 g}，接近禁食 24 小时后补餐的 {1.04 g}'], foot: 'Aponte, Atasoy, Sternson' }, { px: 23 });
  vignette(g, .45);
}

/* ================= 人也一样：减重后的激素变化，一年还在 ================= */
function sceneHuman(g, t) {
  bgDark(g, t, { c0: '#1A3558', c1: '#050B16' });
  motes(g, t, 20, '#CFE6FF', .18, 71);
  const tConc = S('b16') - .15;
  const a = win(t, T.human, T.g3 + .5, .45, .5);
  g.save(); g.globalAlpha *= a;
  // 左：50 个人 + 10 周 −13.5 kg
  const px0 = 190, py0 = 330, cs = 56;
  withAlpha(g, pop(t, S('b14') + .2, .4), () => text(g, '50 位超重或肥胖的人', px0 + 4.5 * cs, py0 - 76, 38, C.white, 'black'));
  for (let i = 0; i < 50; i++) { const c = i % 10, r = Math.floor(i / 10); personIcon(g, px0 + c * cs, py0 + r * 58, 2.15, '#8FA6C8', seg(t, S('b14') + .25 + i * .008, S('b14') + .5 + i * .008)); }
  const w10 = pop(t, CK('b14', 2) - .2, .5);
  if (w10 > 0) { g.save(); g.translate(px0 + 4.5 * cs, 655); g.scale(w10, w10); tag(g, 0, 0, '10 周　减掉 13.5 kg', 40, { font: 'black', fill: 'rgba(10,90,60,.92)', lineCol: C.green }); g.restore(); }
  // 右：激素表
  const tx = 830, ty = 190, labW = 240, colW = 255, rowH = 112, tW = labW + colW * 3, tH = 96 + rowH * 3;
  const cols = ['开始', '10 周后', '一年后（62 周）'], rows = [['瘦素', C.cyan, '↓'], ['饥饿激素', C.pink, '↑'], ['食欲', C.orange, '↑']];
  const tp = pop(t, CK('b14', 2) - .3, .45);
  if (tp > 0) {
    g.save(); g.translate(0, (1 - tp) * 30); g.globalAlpha *= clamp(tp * 2);
    rr(g, tx, ty, tW, tH, 24); fs(g, 'rgba(8,18,34,.82)', hexA(C.white, .2), 3);
    cols.forEach((c, i) => text(g, c, tx + labW + colW * (i + .5), ty + 44, 30, i === 2 ? C.fat : C.mute, 'black'));
    rows.forEach(([nm, col, ar], r) => {
      const ry = ty + 96 + rowH * (r + .5), rp = pop(t, CK('b14', 3) + r * .32, .45); if (rp <= 0) return;
      g.save(); g.globalAlpha *= clamp(rp * 2);
      text(g, nm, tx + labW / 2, ry, 38, col, 'black');
      for (let i = 0; i < 3; i++) {
        const cx = tx + labW + colW * (i + .5);
        if (i === 0) { g.strokeStyle = hexA(C.white, .5); g.lineWidth = 6; g.lineCap = 'round'; g.beginPath(); g.moveTo(cx - 28, ry); g.lineTo(cx + 28, ry); g.stroke(); }
        else {
          const keep = i === 2, ap = keep ? pop(t, S('b15') + .1 + r * .12, .45) : 1;
          g.save(); g.translate(cx, ry); g.scale(ap, ap); circ(g, 0, 0, 40); fs(g, hexA(col, keep ? .35 : .22), col, keep ? 5 : 3.5);
          text(g, ar, 0, 2, 56, col, 'black'); g.restore();
        }
      }
      g.restore();
    });
    const kp = pop(t, S('b15') + .5, .5);
    if (kp > 0) { g.save(); g.translate(tx + labW + colW * 2.5, ty + tH + 36); g.scale(kp, kp); tag(g, 0, 0, '变化还在', 42, { font: 'black', fill: 'rgba(110,80,0,.95)', lineCol: C.fat, col: C.fatL }); g.restore(); }
    g.restore();
  }
  // 小油被锁回去
  const yp = seg(t, S('y6') - .15, S('y6') + .3);
  if (yp > 0) {
    xiaoyou(g, { x: 270, y: 880, s: .72 * yp, t, expr: 'sweat', look: [1, -.3], tailAmp: .6 });
    siren(g, 430, 860, .62 * yp, t, 1); iconLock(g, 120, 870, .8 * yp);
    const bp = pop(t, S('y6') + .05, .4) * (1 - E.in(seg(t, EN('y6') + .55, EN('y6') + .85)));
    if (bp > 0) speech(g, 700, 815, '警报响了……\n我又被锁回去了！', 44, bp, [470, 870]);
  }
  g.restore();
  evid(g, t, S('b14') + 1.0, tConc - .05, 1340, 800, 660, { tag: 'NEJM · 2011', n: 'n = 50', title: '减重后的“饥饿信号”会持续一年以上', lines: ['极低热量饮食 10 周，平均减 {13.5 kg}', '瘦素、饥饿激素、食欲：一年后{仍未回到原来的水平}'], foot: 'Sumithran 等 · 墨尔本' }, { px: 22 });
  // 结论：不是软弱，是警报系统在正常工作
  {
    const sp = pop(t, S('b16') + .1, .5) * (1 - E.in(seg(t, T.g3 - .3, T.g3 + .1)));
    if (sp > 0) {
      g.fillStyle = `rgba(4,10,22,${.9 * clamp(sp * 1.4)})`; g.fillRect(0, 0, W, H);
      g.save(); g.translate(W / 2, 400); g.scale(sp, sp);
      rich(g, '那种饿，{不是}你软弱', 0, 0, 96, { font: 'fun', stroke: 18, hl: C.orange });
      g.restore();
      const p2 = pop(t, CK('b16', 1) + .05, .5);
      if (p2 > 0) { siren(g, W / 2 - 560, 650, 1.0 * p2, t, 1); g.save(); g.translate(W / 2 + 40, 640); g.scale(p2, p2); rich(g, '是警报系统，在{正常工作}', 0, 0, 92, { font: 'fun', stroke: 18, hl: C.green, maxW: 1200 }); g.restore(); }
    }
  }
  vignette(g, .45);
}
