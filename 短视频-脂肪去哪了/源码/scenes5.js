'use strict';
/* scenes5.js：双胞胎彩蛋、怎么办（三件小事）、回到那十公斤（碳的旅行）与片尾卡 */

/* ================= 彩蛋：同样多吃，为什么胖得不一样 ================= */
const TWIN_COLS = ['#FF8FA3', '#FFB347', '#FFD45A', '#9BE89F', '#46D3F2', '#8EC8FF', '#A58BFF', '#FF8AD8', '#7FE0C8', '#F7A072', '#C9A0FF', '#B8E986'];
const TWIN_V = [[4.3, 4.6], [4.9, 5.3], [5.6, 6.1], [6.2, 6.7], [6.9, 7.3], [7.5, 7.9], [8.0, 8.5], [8.6, 9.0], [9.3, 9.8], [10.1, 10.7], [11.3, 11.9], [12.9, 13.3]];

function sceneTwins(g, t) {
  bgDark(g, t, { c0: '#1A3558', c1: '#050B16' });
  motes(g, t, 20, '#CFE6FF', .18, 91);
  const tD2 = S('d2') - .3, tD3 = S('d3') - .3, tD4 = S('d4') - .3;

  /* --- 三道关卡的高度，每个人不一样 --- */
  {
    const a = win(t, T.twins, tD2 + .45, .4, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const tp = pop(t, S('d1') + .1, .5);
      g.save(); g.translate(W / 2, 250); g.scale(tp, tp); rich(g, '三道关卡的{高度}，每个人不一样', 0, 0, 84, { font: 'fun', stroke: 16, hl: C.fat, maxW: 1700 }); g.restore();
      [[560, '房子', 0], [960, '警报', 1.7], [1360, '记忆', 3.2]].forEach(([dx, nm, ph], i) => {
        const dp = pop(t, S('d1') + .3 + i * .18, .5); if (dp <= 0) return;
        const k = 1 + .26 * Math.sin(t * 1.3 + ph);
        g.save(); g.translate(dx, 800); g.scale(dp, dp * k); gateDoor(g, 0, 0, .86, { num: String(i + 1), t }); g.restore();
        withAlpha(g, dp, () => tag(g, dx, 860, nm, 34, { font: 'black' }));
      });
      g.restore();
    }
  }

  /* --- 12 对同卵双胞胎，每天多吃 1000 大卡 --- */
  {
    const a = win(t, tD2, tD3 + .45, .4, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      text(g, '12 对同卵双胞胎（年轻男性）', 740, 190, 46, C.white, 'black');
      TWIN_COLS.forEach((c, i) => { const col = i % 6, row = Math.floor(i / 6), p = pop(t, CK('d2', 0) + .1 + i * .07, .4); if (p > 0) { g.save(); g.translate(300 + col * 190, 340 + row * 200); g.scale(p, p); twinPair(g, 0, 0, 2.0, c); g.restore(); } });
      const pf = pop(t, CK('d2', 1) + .1, .5);
      if (pf > 0) { g.save(); g.translate(740, 770); g.scale(pf, pf); tag(g, 0, 0, '每天多吃　1000 大卡', 50, { font: 'black', fill: 'rgba(120,60,10,.95)', lineCol: C.orange, col: '#FFD9B0' }); g.restore(); }
      const cp = pop(t, CK('d2', 2) + .1, .5);
      if (cp > 0) {
        g.save(); g.translate(740, 880); g.scale(cp, cp);
        const days = clamp(seg(t, CK('d2', 2) + .2, CK('d2', 2) + 2.0)), bw = 760;
        rr(g, -bw / 2, -20, bw, 40, 20); fs(g, 'rgba(10,20,36,.8)', hexA(C.white, .3), 2); rr(g, -bw / 2 + 3, -17, (bw - 6) * .84 * days, 34, 17); fs(g, C.orange, null);
        text(g, '每周 6 天，共 84 天', 0, -54, 34, C.white, 'black'); g.restore();
      }
      g.restore();
    }
  }

  /* --- 增重从 4.3 到 13.3 公斤（逐对示意）--- */
  {
    const a = win(t, tD3, T.how + .3, .4, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const x0 = 240, y0 = 780, cw = 1000, ch = 470, ppk = ch / 14.5;
      text(g, '多吃 84 天之后，每个人的增重（示意）', x0 + cw / 2 - 30, 190, 42, C.white, 'black');
      g.strokeStyle = 'rgba(160,190,235,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x0 - 20, y0); g.lineTo(x0 + cw + 20, y0); g.moveTo(x0 - 20, y0); g.lineTo(x0 - 20, y0 - ch - 20); g.stroke();
      text(g, '增重 kg', x0 - 20, y0 - ch - 46, 28, C.mute, 'bold');
      const bwid = cw / 12;
      TWIN_V.forEach((vv, i) => {
        const p = E.out(seg(t, CK('d3', 1) - .3 + i * .1, CK('d3', 1) + .4 + i * .1));
        vv.forEach((v, j) => { const h = v * ppk * p, bx = x0 + i * bwid + 6 + j * (bwid / 2 - 5); rr(g, bx, y0 - h, bwid / 2 - 8, h, 6); fs(g, TWIN_COLS[i], null); });
      });
      // 平均线
      const mp = pop(t, CK('d3', 1) + 1.0, .4);
      if (mp > 0) { g.setLineDash([12, 9]); g.strokeStyle = hexA(C.white, .8 * mp); g.lineWidth = 3; g.beginPath(); g.moveTo(x0 - 20, y0 - 8.1 * ppk); g.lineTo(x0 + cw + 20, y0 - 8.1 * ppk); g.stroke(); g.setLineDash([]); g.save(); g.translate(x0 + cw + 70, y0 - 8.1 * ppk); g.scale(mp, mp); tag(g, 0, 0, '平均 8.1', 28, { font: 'black' }); g.restore(); }
      const lo = pop(t, CK('d3', 1) + .2, .4), hi = pop(t, CK('d3', 2) + .1, .45);
      if (lo > 0) { g.save(); g.translate(x0 + 30, y0 - 4.6 * ppk - 40); g.scale(lo, lo); tag(g, 0, 0, '4.3 kg', 36, { font: 'black', fill: 'rgba(0,70,95,.92)', lineCol: C.cyan }); g.restore(); }
      if (hi > 0) { g.save(); g.translate(x0 + cw - 70, y0 - 13.3 * ppk - 40); g.scale(hi, hi); tag(g, 0, 0, '13.3 kg　约 3 倍', 36, { font: 'black', fill: 'rgba(130,60,10,.95)', lineCol: C.orange, col: '#FFD9B0' }); g.restore(); }
      // 同一对：很接近
      const sp = pop(t, S('d4') + .1, .5);
      if (sp > 0) {
        [3, 8].forEach(i => { g.save(); g.globalAlpha *= sp; g.strokeStyle = C.fat; g.lineWidth = 5; rr(g, x0 + i * bwid + 1, y0 - TWIN_V[i][1] * ppk - 14, bwid - 2, TWIN_V[i][1] * ppk + 20, 10); g.stroke(); g.restore(); });
        g.save(); g.translate(x0 + 4 * bwid + 20, y0 - 8.8 * ppk - 70); g.scale(sp, sp); tag(g, 0, 0, '同一对：很接近', 36, { font: 'black', fill: 'rgba(110,80,0,.95)', lineCol: C.fat, col: C.fatL }); g.restore();
      }
      g.restore();
    }
  }
  evid(g, t, S('d2') + .3, T.how - .1, 1630, 330, 520, { tag: 'NEJM · 1990', n: '12 对 · 男性', title: '同样多吃，增重最多的是最少的 3 倍', lines: ['每天多吃 {1000 大卡}，每周 6 天，共 {84 天}', '平均增重 8.1 kg，范围 {4.3 到 13.3 kg}', '同一对双胞胎的增重{很相似}'], foot: 'Bouchard 等 · 拉瓦尔大学' }, { px: 22 });
  vignette(g, .45);
}

/* ================= 怎么办：三件小事 ================= */
/* 左边的三件小事清单，当前这件亮起 */
function todoList(g, t, cur, a = 1) {
  const items = ['把警报的音量调小', '把“保持”当成长期战斗', '必要时去医院评估'];
  items.forEach((s, i) => {
    const on = i === cur, p = pop(t, S('e3') + 1.0 + i * .5, .45); if (p <= 0) return;
    g.save(); g.globalAlpha *= a * p * (on ? 1 : .45); g.translate(0, i * 78);
    circ(g, 0, 0, 26); fs(g, on ? C.fat : 'rgba(30,45,75,.9)', on ? '#FFE9A0' : '#6F88B5', 3); text(g, String(i + 1), 0, 2, 30, on ? '#4A3000' : '#9FB4DA', 'black');
    text(g, s, 44, 2, on ? 34 : 30, on ? C.white : C.mute, 'black', 1.3, 'left'); g.restore();
  });
}
function sceneHow(g, t) {
  bgDark(g, t, { c0: '#16335A', c1: '#050B16' });
  motes(g, t, 22, '#CFE6FF', .2, 101);
  const tE3 = S('e3') - .35, tE4 = S('e4') - .3, tE7 = S('e7') - .3, tE11 = S('e11') - .3;

  /* --- 所以：不是出口堵了，是关卡在帮你守住脂肪 --- */
  {
    const a = win(t, T.how, tE3 + .4, .4, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const evoU = E.io(seg(t, CK('e2', 1) - .2, CK('e2', 1) + .5));         // 后半句：切到“饿死 vs 胖死”
      g.save(); g.globalAlpha *= 1 - evoU;
      glow(g, 1710, 575, 340, C.cyan, .4);
      roadStrip(g, t, 330, 1580, 560, 130);
      fatCell(g, { x: 210, y: 560, r: 118, t, seed: 1 });
      lungs(g, 1710, 575, .78, Math.sin(t * 2) * .5 + .5);
      const okp = pop(t, S('e1') + .55, .5);
      if (okp > 0) { g.save(); g.translate(1590, 330); g.scale(okp, okp); tag(g, 0, 0, '出口没堵', 52, { font: 'black', fill: 'rgba(10,90,60,.92)', lineCol: C.green }); g.restore(); arrow(g, 1630, 390, 1700, 480, 16, hexA(C.green, .8 * okp), { head: 36 }); }
      [[640, '房子'], [960, '警报'], [1280, '记忆']].forEach(([dx, nm], i) => {
        const pg = pop(t, CK('e2', 0) + .1 + i * .35, .5), lit = win(t, CK('e2', 0) + .2 + i * .35, CK('e2', 0) + 1.2 + i * .35, .15, .3);
        gateDoor(g, dx, 668, .9, { num: String(i + 1), t, lit, glowA: lit });
        if (pg > 0) { g.save(); g.translate(dx, 330); g.scale(pg, pg); tag(g, 0, 0, '守住脂肪', 34, { font: 'black', fill: 'rgba(110,80,0,.95)', lineCol: C.fat, col: C.fatL }); g.restore(); }
      });
      g.restore();
      // 演化：饿死 ≫ 胖死
      if (evoU > 0) {
        g.save(); g.globalAlpha *= evoU;
        text(g, '在漫长的演化里（示意）', W / 2, 220, 56, C.white, 'fun');
        const bx = [640, 1280], hs = [380, 38], cl = [C.orange, C.cyan], nm = ['饿死', '胖死'];
        bx.forEach((x, i) => {
          const h = hs[i] * E.out(seg(t, CK('e2', 1) + .2 + i * .3, CK('e2', 1) + 1.0 + i * .3));
          rr(g, x - 90, 800 - h, 180, h, 10); fs(g, cl[i], null);
          text(g, nm[i], x, 850, 46, C.white, 'black');
        });
        text(g, '常见得多', 640, 330, 40, C.orange, 'black'); text(g, '少得多', 1280, 640, 40, C.cyan, 'black');
        g.restore();
      }
      g.restore();
    }
  }

  /* --- 三件小事：清单 --- */
  {
    const a = win(t, tE3, tE4 + .5, .4, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const pq = pop(t, S('e3') + .05, .4) * (1 - E.in(seg(t, CK('e3', 1) - .15, CK('e3', 1) + .1)));
      if (pq > 0) { g.save(); g.translate(W / 2, 330); g.scale(pq, pq); text(g, '？', 0, 0, 260, C.fat, 'fun'); g.restore(); }
      const tp = pop(t, CK('e3', 1) + .05, .5);
      g.save(); g.translate(W / 2, 250); g.scale(tp, tp); rich(g, '不是更用力地{硬扛}', 0, 0, 96, { font: 'fun', stroke: 18, hl: C.fat }); g.restore();
      const p2 = pop(t, CK('e3', 2) + .1, .5);
      g.save(); g.translate(W / 2, 400); g.scale(p2, p2); rich(g, '而是{三件小事}', 0, 0, 120, { font: 'fun', stroke: 22, hl: C.green }); g.restore();
      g.save(); g.translate(W / 2 - 280, 600); todoList(g, t, -1); g.restore();
      g.restore();
    }
  }

  /* --- ① 把警报的音量调小：蛋白质、睡眠 --- */
  {
    const a = win(t, tE4, tE7 + .4, .4, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      g.save(); g.translate(180, 230); g.scale(.8, .8); todoList(g, t, 0); g.restore();
      const turn = E.io(seg(t, S('e4') + .1, S('e4') + 1.6));
      g.save(); g.translate(0, 0);
      siren(g, 380, 700, 1.15, t, 1 - turn * .8);
      iconKnob(g, 380, 850, 1.1, lerp(.92, .25, turn));
      withAlpha(g, pop(t, S('e4') + .1, .4), () => tag(g, 380, 975 - 40, '警报音量', 32, { font: 'black' }));
      g.restore();
      // 蛋白质
      const pp = pop(t, S('e5') - .1, .5) * (1 - E.in(seg(t, S('e6') - .25, S('e6') + .15)));
      if (pp > 0) {
        g.save(); g.translate(1130, 560); g.scale(pp, pp);
        rr(g, -400, -300, 800, 600, 26); fs(g, 'rgba(8,18,34,.86)', hexA(C.white, .22), 3);
        iconEgg(g, -300, -210, 1.0); text(g, '蛋白质占热量：15% → 30%', 80, -214, 44, C.white, 'black');
        text(g, 'AJCN · 2005 · 19 人 · 12 周', 80, -160, 28, C.mute, 'bold');
        const b1 = E.out(seg(t, CK('e5', 1) - .1, CK('e5', 1) + .8)), b2 = E.out(seg(t, CK('e5', 2) - .1, CK('e5', 2) + .8));
        text(g, '每天自然少吃', -200, -70, 36, C.mute, 'black'); rr(g, -330, -30, 640 * b1 * .85, 54, 12); fs(g, C.green, null); text(g, '441 大卡', -330 + 640 * b1 * .85 + 90, -3, 40, C.green, 'black');
        text(g, '12 周体重', -240, 100, 36, C.mute, 'black'); rr(g, -330, 140, 640 * b2 * .55, 54, 12); fs(g, C.cyan, null); text(g, '−4.9 kg', -330 + 640 * b2 * .55 + 90, 167, 40, C.cyan, 'black');
        g.restore();
      }
      // 睡眠
      const sp = pop(t, S('e6') - .05, .5);
      if (sp > 0) {
        g.save(); g.translate(1130, 560); g.scale(sp, sp);
        rr(g, -400, -300, 800, 600, 26); fs(g, 'rgba(8,18,34,.86)', hexA(C.white, .22), 3);
        iconMoon(g, -310, -210, .85, t); text(g, '同样节食 14 天，睡得不一样', 90, -214, 40, C.white, 'black');
        text(g, 'Ann Intern Med · 2010 · 10 人', 90, -160, 28, C.mute, 'bold');
        const b1 = E.out(seg(t, CK('e6', 1) - .1, CK('e6', 1) + .8)), b2 = E.out(seg(t, CK('e6', 2) - .1, CK('e6', 2) + .8));
        text(g, '睡 8.5 小时', -250, -60, 36, C.mute, 'black'); rr(g, -330, -20, 640 * b1 * .9 * (1.4 / 1.4), 54, 12); fs(g, C.green, null); text(g, '减掉脂肪 1.4 kg', -330 + 640 * b1 * .9 + 150, 7, 36, C.green, 'black');
        text(g, '睡 5.5 小时', -250, 110, 36, C.mute, 'black'); rr(g, -330, 150, 640 * b2 * .9 * (.6 / 1.4), 54, 12); fs(g, C.red, null); text(g, '减掉脂肪 0.6 kg', -330 + 640 * b2 * .9 * (.6 / 1.4) + 150, 177, 36, C.red, 'black');
        g.restore();
      }
      g.restore();
    }
  }

  /* --- ② 把“保持”当成另一场长期战斗 --- */
  {
    const a = win(t, tE7, tE11 + .4, .4, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      g.save(); g.translate(180, 230); g.scale(.8, .8); todoList(g, t, 1); g.restore();
      // 长路 + 终点旗
      const rp = E.io(seg(t, S('e7') + .2, S('e7') + 2.0));
      const x0 = 260, x1 = 1660, ry = 700;
      g.strokeStyle = 'rgba(160,190,235,.3)'; g.lineWidth = 16; g.lineCap = 'round'; g.beginPath(); g.moveTo(x0, ry); g.lineTo(x1, ry); g.stroke();
      g.strokeStyle = C.fat; g.setLineDash([22, 18]); g.lineWidth = 8; g.lineDashOffset = -t * 40; g.beginPath(); g.moveTo(x0, ry); g.lineTo(lerp(x0, x1, rp), ry); g.stroke(); g.setLineDash([]);
      xiaoyou(g, { x: lerp(x0, x1, rp), y: ry - 70 - Math.abs(Math.sin(t * 6)) * 14, s: .55, t, expr: 'det', tailAmp: .8 });
      withAlpha(g, pop(t, S('e7') + .2, .4), () => { tag(g, x0, ry + 70, '减重成功', 34, { font: 'black' }); });
      withAlpha(g, pop(t, S('e7') + 1.8, .4), () => { g.save(); g.translate(x1, ry - 50); g.strokeStyle = '#E8EEFF'; g.lineWidth = 7; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, -120); g.stroke(); poly(g, [[0, -120], [90, -96], [0, -70]]); fs(g, C.green, null); g.restore(); tag(g, x1, ry + 70, '保持 5 年以上', 34, { font: 'black', fill: 'rgba(10,90,60,.92)', lineCol: C.green }); });
      // 登记处的数据
      const c1 = pop(t, CK('e8', 1) - .1, .45), c2 = pop(t, CK('e9', 0) + .3, .45), c3 = pop(t, CK('e9', 1) - .1, .45), c4 = pop(t, CK('e10', 1) - .1, .45);
      const chip = (p, x, y, ic, s1, s2) => { if (p <= 0) return; g.save(); g.translate(x, y); g.scale(p, p); rr(g, -210, -72, 420, 144, 22); fs(g, 'rgba(8,18,34,.86)', hexA(C.white, .22), 3); ic(g); text(g, s1, 52, -16, 34, C.white, 'black'); text(g, s2, 52, 30, 26, C.mute, 'bold'); g.restore(); };
      chip(c1, 520, 470, g2 => iconScale(g2, -140, 0, .55, 0), '平均减 33 公斤', '保持 5 年以上');
      chip(c2, 980, 470, g2 => iconClock(g2, -140, 0, .6, t), '每天活动约 1 小时', '登记处成员的共同点');
      chip(c3, 1440, 470, g2 => iconScale(g2, -140, 0, .55, .5), '经常称体重', '登记处成员的共同点');
      if (c4 > 0) { g.save(); g.translate(960, 850); g.scale(c4, c4); tag(g, 0, 0, '坚持 2 到 5 年后：越来越容易', 46, { font: 'black', fill: 'rgba(10,90,60,.92)', lineCol: C.green }); g.restore(); }
      withAlpha(g, pop(t, CK('e8', 0) + .2, .4), () => tag(g, 1300, 330, '美国国家体重控制登记处 · AJCN 2005', 32, { font: 'black' }));
      g.restore();
    }
  }

  /* --- ③ 必要时去正规医院评估 --- */
  {
    const a = win(t, tE11, T.fin + .5, .4, .5);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      g.save(); g.translate(180, 230); g.scale(.8, .8); todoList(g, t, 2); g.restore();
      const hp = pop(t, CK('e11', 0) + .5, .5);
      g.save(); g.translate(560, 560); g.scale(hp, hp); iconHospital(g, 0, 0, 2.2); g.restore();
      const t1 = pop(t, CK('e11', 1) + .1, .45), t2 = pop(t, CK('e11', 2) + .1, .45);
      if (t1 > 0) { g.save(); g.translate(1330, 430); g.scale(t1, t1); tag(g, 0, 0, '去正规医院评估一下', 58, { font: 'black', fill: 'rgba(10,90,60,.92)', lineCol: C.green }); g.restore(); }
      if (t2 > 0) { g.save(); g.translate(1330, 590); g.scale(t2, t2); rich(g, '有些{疾病}和{药物}', 0, 0, 62, { font: 'fun', stroke: 12, hl: C.orange }); g.restore(); g.save(); g.translate(1330, 690); g.scale(t2, t2); rich(g, '会让减重{更难}', 0, 0, 62, { font: 'fun', stroke: 12, hl: C.orange }); g.restore(); }
      g.restore();
    }
  }
  vignette(g, .45);
}

/* ================= 回到那十公斤：碳的旅行 ================= */
function sceneFinal(g, t) {
  bgDark(g, t, { c0: '#17335A', c1: '#050B16' });
  motes(g, t, 26, '#CFE6FF', .22, 111);
  const tF2 = S('f2') - .3, tF3 = S('f3') - .3, tF4 = S('f4') - .3, tEnd = T.endcard;
  const px = 900, py = 650, ps = .82;                                   // 人像
  const mouth = [px + 146 * ps, py - 165 * ps], lungC = [px + 12 * ps, py + 168 * ps];

  /* --- 左：那十公斤脂肪 → 被呼出去 --- */
  {
    const a = win(t, T.fin, tF4 + .6, .5, .6);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const bw = 112, bh = 50, cxp = 310, base = 880, diss = seg(t, S('f2') + .1, S('f2') + 3.0);
      ell(g, cxp, base + 10, 240, 18); fs(g, '#27406B', '#4C6FA8', 3);
      pileLayout(cxp, base, bw, bh).forEach(b => { const u = clamp((diss - b.k * .05) / .45); if (u < 1) { g.save(); g.globalAlpha *= 1 - E.in(u); brick(g, b.x, b.y - u * 14, bw, bh, {}); g.restore(); } dissolve(g, b.x, b.y, bw, bh, b.k, u, lungC, { col: C.cyan, n: 14 }); });
      withAlpha(g, pop(t, S('f1') + .1, .4) * (1 - diss), () => tag(g, cxp, 540, '10 公斤 脂肪', 38, { font: 'black', fill: 'rgba(120,80,0,.88)', lineCol: C.fat, col: C.fatL }));
      profile(g, px, py, ps, t, { breath: .5 + .5 * Math.sin(t * 2.2) });
      g.restore();
    }
  }
  /* --- 呼出的二氧化碳 → 飘向树 --- */
  {
    const a = Math.max(win(t, tF2, tF4 - .05, .5, .35), 0);
    if (a > 0) {
      const ex = px + 146 * ps, ey = py - 165 * ps, treeX = 1560, treeY = 880;
      const rate = E.out(seg(t, S('f2') + .3, S('f2') + 3.0)), r = R(66);
      g.save(); g.globalAlpha *= a;
      for (let i = 0; i < 44; i++) {
        const life = 5.5 + r() * 2, ph = r() * life, u = ((t - S('f2') * 0 + ph + i * .37) % life) / life, yo = (r() - .5) * 60, rad = 11 + r() * 14;
        if (i / 44 > rate) continue;
        const bx = lerp(ex + 20, treeX - 60, E.io(u)) , by = lerp(ey + yo, treeY - 420 + yo * .5, E.sine(u)) - Math.sin(u * Math.PI) * 120;
        const inLeaf = u > .86;
        bubble(g, bx, by, rad * (inLeaf ? lerp(1, .3, (u - .86) / .14) : .5 + u * .6), inLeaf ? C.green : C.cyan, (1 - clamp((u - .96) / .04)) * clamp(u * 8), i % 4 === 0 && !inLeaf ? 'CO₂' : undefined);
      }
      g.restore();
    }
  }
  /* --- 右：树，明年春天变成一片叶子 --- */
  {
    const a = Math.max(win(t, S('f3') - .5, tF4 - .05, .6, .35), win(t, S('y8') - .9, T.endcard + .4, .45, .8));
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const spring = E.io(seg(t, CK('f3', 1) - .2, CK('f3', 1) + 2.2));
      const treeX = 1560, treeY = 880;
      iconTree(g, treeX, treeY, 1.05, .35 + .65 * spring, t);
      // 明年春天：日历 + 一片新叶
      const cp = pop(t, CK('f3', 1) + .1, .5) * (t < tF4 ? 1 : 0);
      if (cp > 0) { iconCalendar(g, treeX - 380, 260, 1.0, '春', cp); g.save(); g.translate(treeX - 380, 380); g.scale(cp, cp); text(g, '明年春天', 0, 0, 40, C.white, 'black'); g.restore(); }
      if (spring > .3) { g.save(); g.translate(treeX + 140, treeY - 440); g.scale(spring * 1.2, spring * 1.2); g.rotate(-.5 + Math.sin(t * 2) * .05); iconLeaf(g, 0, 0, 1.0, 0); glow(g, 0, 0, 120, C.green, .5 * spring); g.restore(); }
      g.restore();
    }
  }
  /* --- 碳的旅行：一圈 --- */
  {
    const a = win(t, tF4, S('y8') - .35, .45, .45);
    if (a > 0) {
      g.fillStyle = `rgba(4,10,22,${.86 * a})`; g.fillRect(0, 0, W, H);
      g.save(); g.globalAlpha *= a;
      const cx = 960, cy = 505, Rr = 250, nodes = [['脂肪', -Math.PI / 2], ['空气', 0], ['叶子', Math.PI / 2], ['饭碗', Math.PI]];
      g.strokeStyle = 'rgba(160,200,255,.35)'; g.lineWidth = 8; g.setLineDash([16, 14]); g.lineDashOffset = -t * 30; circ(g, cx, cy, Rr); g.stroke(); g.setLineDash([]);
      nodes.forEach(([nm, an], i) => {
        const p = pop(t, S('f4') + .1 + i * .28, .45), x = cx + Math.cos(an) * Rr, y = cy + Math.sin(an) * Rr;
        g.save(); g.translate(x, y); g.scale(p, p); circ(g, 0, 0, 92); fs(g, 'rgba(14,28,52,.95)', hexA(C.white, .3), 3);
        if (i === 0) brick(g, -34, -14, 68, 30, { noLabel: true }); else if (i === 1) iconCloud(g, 0, 4, .8); else if (i === 2) iconLeaf(g, 0, 0, .62, -.5); else iconBowl(g, 0, 6, .55, t);
        text(g, nm, 0, 128, 34, C.white, 'black'); g.restore();
      });
      // 沿圈跑的碳原子
      const an = -Math.PI / 2 + t * .9; c14Dot(g, cx + Math.cos(an) * Rr, cy + Math.sin(an) * Rr, .7, t); g.save(); g.restore();
      const tp = pop(t, CK('f4', 1) + .2, .5);
      if (tp > 0) { g.save(); g.translate(cx, cy - 34); g.scale(tp, tp); rich(g, '碳，', 0, 0, 74, { font: 'fun', stroke: 14 }); g.restore(); g.save(); g.translate(cx, cy + 44); g.scale(tp, tp); rich(g, '在{旅行}', 0, 0, 74, { font: 'fun', stroke: 14, hl: C.green }); g.restore(); }
      g.restore();
    }
  }
  /* --- 小油：我去当树叶咯 --- */
  {
    const a = win(t, S('y8') - .6, S('y8') + 3.2, .35, .6);
    if (a > 0) {
      g.save(); g.globalAlpha *= a;
      const u = E.io(seg(t, S('y8') - .4, S('y8') + 2.6));
      const x = lerp(1180, 1560, u), y = lerp(760, 470, u) - Math.sin(u * Math.PI) * 140;
      bubble(g, x, y, 110, C.cyan, .75);
      xiaoyou(g, { x, y: y + 8, s: .55, t, expr: 'happy', tailAmp: 1.1, glowA: .2 });
      const bp = pop(t, S('y8') + .05, .4) * (1 - E.in(seg(t, EN('y8') + .5, EN('y8') + .8)));
      if (bp > 0) speech(g, x - 330, y - 160, '再见啦——\n我去当树叶咯！', 46, bp, [x - 80, y - 60]);
      g.restore();
    }
  }
  vignette(g, .45);
}

/* 最后一句 + 片尾卡 */
function endCard(g, t) {
  const t0 = S('f5') - .3, a = win(t, t0, DURATION + 1, .6, 0); if (a <= 0) return;
  g.save(); g.globalAlpha *= a;
  const veil = clamp(seg(t, T.endcard - .3, T.endcard + .6));
  g.fillStyle = `rgba(4,10,22,${.55 + .4 * veil})`; g.fillRect(0, 0, W, H);
  const p1 = pop(t, S('f5') + .1, .5);
  g.save(); g.translate(W / 2, 430); g.scale(p1, p1); rich(g, '出口一直是通的', 0, 0, 120, { font: 'fun', stroke: 22, maxW: 1700 }); g.restore();
  const p2 = pop(t, CK('f5', 1) + .05, .5);
  g.save(); g.translate(W / 2, 580); g.scale(p2, p2); rich(g, '路，要{慢慢走}', 0, 0, 120, { font: 'fun', stroke: 22, hl: C.fat }); g.restore();
  if (veil > 0) {
    g.save(); g.globalAlpha *= veil;
    text(g, '你减掉的脂肪，去哪了？', W / 2, 760, 52, C.fat, 'fun');
    text(g, '数据出处与限定见 脚本.md · 本片为科普，不构成医疗建议', W / 2, 850, 30, C.mute, 'bold');
    text(g, '有疾病、孕期或进食障碍史的人，请先咨询医生', W / 2, 898, 28, C.dim, 'bold');
    xiaoyou(g, { x: 1640, y: 780, s: .6, t, expr: 'happy', flip: true, tailAmp: 1 });
    g.restore();
  }
  g.restore();
}
