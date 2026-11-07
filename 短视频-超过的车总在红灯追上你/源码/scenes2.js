'use strict';
/* scenes2.js：讲道理的三幕。
   lead：倒回去看你怎么超过他——你快、他慢；你领先 10 秒，可一个红灯动不动就是一分钟（两根条对比）；
         你停下来等（快进），领先一点点被吃掉，红灯还没完他就到了：又碰面了。
   wheel：你到路口时红绿灯在哪一秒全凭运气，像转一次转盘（红一半、绿一半，红灯最后 10 秒是"逃得掉"的一小截）；
          转到红灯里、离变绿还不止 10 秒，他就追得上；红灯占一半，减掉这一小截：42%（揭晓开头的选择题：B 四成）。
   map：俯视一条路、8 个路口，按路口一个个亮出"至少被追上一次"的可能：42% → … → 75%（3 个）→ … → 90%（8 个）。 */

/* ================= lead：超车 → 红灯 → 又碰面 ================= */
const LEAD_STOP = 300;
function leadPlan() {
  const Tpass = CH('e1', 0) + .35, Tbrake = CH('e1', 2) - .1, Tstop = CH('e1', 3) + .6, Tarr = CH('e2', 3) + .2;
  const vY = 40, brk = Tstop - Tbrake, dBrake = vY * brk / 2;
  const dPass = dBrake + vY * (Tbrake - Tpass);
  const hb = 1.2, vH = dPass / ((Tarr - hb / 2) - Tpass);
  const dYou = t => t < Tbrake ? dBrake + vY * (Tbrake - t) : t < Tstop ? vY * (Tstop - t) ** 2 / (2 * brk) : 0;
  const dHim = t => t < Tarr - hb ? vH * ((Tarr - hb / 2) - t) : t < Tarr ? vH * (Tarr - t) ** 2 / (2 * hb) : 0;
  return { Tpass, Tbrake, Tstop, Tarr, dYou, dHim, vY, vH };
}
function leadScene(g, t) {
  const L = leadPlan();
  const dy = L.dYou(t), dh = L.dHim(t);
  const off = lerp(60, 34, E.io(seg(t, L.Tbrake - .4, L.Tstop + .4)));
  const camX = LEAD_STOP + dy - off;
  const waiting = t > L.Tstop, ff = waiting && t < L.Tarr;
  const num = t < L.Tstop ? 37 : Math.round(37 - 10 * clamp((t - L.Tstop) / (L.Tarr - L.Tstop)));
  const met = t > L.Tarr;
  const you = {
    x: LEAD_STOP + 1 + dy, lane: 'near', col: CAR_COL.you, spin: -(LEAD_STOP + dy) * .5, brake: t > L.Tbrake && t < L.Tstop + .3, puff: waiting ? t : undefined,
    drv: youO(t, met ? { eyes: 'up', mouth: 'o', sweat: true } : waiting ? { eyes: 'r' } : { eyes: 'happy', mouth: 'smile' }),
  };
  const him = {
    x: LEAD_STOP + 2 + dh, lane: 'far', col: CAR_COL.him, spin: -(LEAD_STOP + dh) * .5, brake: t > L.Tarr - 1.2 && t < L.Tarr + .3, puff: met ? t : undefined,
    drv: himO(t, met ? { eyes: 'happy', mouth: 'smile', arms: 'upR' } : { eyes: 'n' }), cup: true, cupDy: met ? -1 + (Math.floor(t * 4) % 2) : 5,
    bob: Math.abs(t - L.Tarr) < .1 ? 1 : 0,
  };
  const walkers = [[clamp((t - L.Tstop - .3) / 3.6), 1], [clamp((t - L.Tstop - 2.2) / 3.6), 4]].filter(([u]) => u > 0 && u < 1);
  street(g, t, { camX, stopX: LEAD_STOP, light: 'red', num, sky: 'day', you, him, walkers }, { extra: 0 });
  // 你超车时：车尾的速度线
  if (t < L.Tbrake) {
    const sx = WX(you.x + CAR_L, camX);
    for (let i = 0; i < 5; i++) { const u = (t * 3 + i / 5) % 1; g.fillStyle = `rgba(255,255,255,${(.8 * (1 - u)).toFixed(2)})`; g.fillRect(sx + 20 + Math.round(u * 200), 1080 + i * 30, 60 + i * 12, 6); }
  }
  // "◀◀ 倒回去"（这一幕刚开始）
  vcr(g, t, SS('lead') - .25, SS('lead') + .7, 'rew', '倒回去', '');
  // 快进
  if (ff) withAlpha(g, Math.floor(t * 3) % 2 ? 1 : .55, () => ptag(g, 620, 600, '▶▶ 快进：等红灯', 36, { fill: '#FFFFFF' }));
  // 上方的两根条：你领先 10 秒 vs 红灯 60 秒；等红灯时领先一点点被吃掉
  const pA = E.out(clamp((t - (CH('e1', 1) - .25)) / .3)), pB = E.out(clamp((t - (CH('e1', 3) - .25)) / .3));
  if (pA > 0) {
    const sc = 64;          // 每 6 秒 64 像素 → 60 秒 640 像素
    const lead = met ? 0 : 10 * (1 - clamp((t - L.Tstop) / (L.Tarr - L.Tstop)));
    withAlpha(g, pA, () => {
      pbox(g, 60, 226, 840, pB > 0 ? 220 : 130, { k: 6, fill: 'rgba(27,23,48,.92)' });
      ptext(g, '你领先', 92, 302, 36, C.white);
      const wA = Math.round(lead / 6 * sc / 6) * 6;
      g.fillStyle = C.ink; g.fillRect(234, 266, 112, 48); g.fillStyle = '#3B3363'; g.fillRect(240, 272, 100, 36);
      g.fillStyle = C.green; g.fillRect(240, 272, wA, 36);
      ptext(g, met ? '0 秒' : `${Math.ceil(lead)} 秒`, 364, 302, 36, met ? '#FF8A80' : C.green);
      if (t > EN('e2') - .02) bigStamp(g, t, EN('e2') - .02, 560, 290, '清零', { px: 48, rot: -.12 });
    });
    if (pB > 0) withAlpha(g, pB, () => {
      ptext(g, '红灯', 92, 396, 36, C.white);
      const wB = Math.round(640 * pB / 6) * 6;
      g.fillStyle = C.ink; g.fillRect(234, 356, wB + 12, 48); g.fillStyle = '#E5483B'; g.fillRect(240, 362, wB, 36);
      g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(240, 362, wB, 6);
      if (pB > .9) ptext(g, '60 秒', 240 + wB - 12, 392, 36, C.white, { align: 'right' });
    });
  }
  // 又碰面：他举杯
  if (met) speech(g, t, L.Tarr + .05, SE('lead') + .3, WX(him.x + 22, camX), (LANE_FAR - 22) * 10 + 10, '又见面了～', { px: 36 });
}

/* ================= wheel：幸运转盘 ================= */
const WH = { x: 480, y: 800, R: 290 };
const LAND = 20;       // 指针最后停在红灯的第 20 秒（离变绿还有 40 秒，他追得上）
function wheelRot(t) {
  const t0 = CH('e3', 3) + .1, t1 = S('e4') - .15, fin = 3 * TAU - LAND / 120 * TAU;
  if (t < t0) return Math.sin(Math.max(0, t - CH('e3', 2)) * 9) * .04 * clamp((t - CH('e3', 2)) / .3);   // "全凭运气"：转盘轻轻晃
  return fin * E.out(clamp((t - t0) / (t1 - t0)));
}
function wheelBG(g, t) {
  g.fillStyle = '#FFD86A'; g.fillRect(0, 0, W, H);
  // 旋转的放射光
  g.save(); g.translate(WH.x, WH.y); g.rotate(t * .25); g.fillStyle = 'rgba(255,255,255,.22)';
  for (let i = 0; i < 16; i++) { g.rotate(TAU / 16); g.beginPath(); g.moveTo(0, 0); g.lineTo(-120, -1500); g.lineTo(120, -1500); g.closePath(); g.fill(); }
  g.restore();
  // 地板
  g.fillStyle = '#E8B84A'; g.fillRect(0, 1230, W, H - 1230);
  for (let x = ((-t * 30) % 96 + 96) % 96 - 96; x < W; x += 96) { g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(Math.round(x), 1230, 48, H - 1230); }
}
function wheelScene(g, t) {
  wheelBG(g, t);
  const tIn = CH('e3', 1) - .25, pW = E.back(clamp((t - tIn) / .45));
  // "你到路口时"：先一辆小车开到一个红绿灯前（转盘出来以后缩到左上角）
  const pMini = 1 - clamp((t - CH('e3', 2)) / .3);
  if (pMini > 0) withAlpha(g, pMini, () => {
    const u = clamp((t - SS('wheel')) / 1.2), sm = E.io(seg(t, tIn, tIn + .5));
    const cx = lerp(480, 170, sm), cy = lerp(700, 300, sm), s = lerp(1, .5, sm);
    g.save(); g.translate(cx, cy); g.scale(s, s);
    pbox(g, -330, -160, 660, 320, { k: 6, fill: '#BFE6FA', rim: '#FFFFFF' });
    g.fillStyle = '#4B4F5C'; g.fillRect(-318, 60, 636, 88); g.fillStyle = '#E8E8E0'; for (let x = -300; x < 300; x += 60) g.fillRect(x, 100, 30, 6);
    g.fillStyle = '#5E6573'; g.fillRect(-250, -120, 12, 180); g.fillRect(-250, -120, 80, 12);
    g.fillStyle = '#2B2F38'; g.fillRect(-190, -110, 44, 100);
    for (let i = 0; i < 3; i++) { g.fillStyle = i === 0 ? '#FF3B30' : '#4A3A3A'; g.fillRect(-182, -102 + i * 32, 28, 26); }
    const carX = lerp(260, -120, E.out(u));
    g.save(); g.imageSmoothingEnabled = false;
    const cb = pbuf('mini', 44, 26); carSide(cb, 2, 24, { col: CAR_COL.you, drv: youO(t, {}), spin: -carX * .1, brake: u > .7 });
    g.drawImage(BUF.mini, Math.round(carX - 44 * 3), 160 - 26 * 6 + 6 - 24, 44 * 6, 26 * 6);
    g.restore();
    g.restore();
  });
  if (pW > 0) {
    const rot = wheelRot(t), landed = t > S('e4') - .15;
    g.save(); g.translate(WH.x, WH.y); g.scale(pW, pW); g.translate(-WH.x, -WH.y);
    // 转盘的影子和底座
    pixOval(g, WH.x + 18, WH.y + 24, WH.R, WH.R, 6, 'rgba(120,70,0,.25)');
    g.fillStyle = C.ink; g.fillRect(WH.x - 42, WH.y + WH.R - 12, 84, 36); g.fillStyle = '#9A6A3A'; g.fillRect(WH.x - 30, WH.y + WH.R - 12, 60, 30);
    const hi = t > CH('e4', 1) - .1 && t < S('e5') ? 'caught' : null;
    wheelDial(g, WH.x, WH.y, WH.R, rot, { hi, t });
    wheelPointer(g, WH.x, WH.y - WH.R + 8);
    // 停稳以后：红、绿两半写上字
    const pl = clamp((t - (CH('e3', 1) + .3)) / .3) * (t < CH('e3', 3) + .1 || landed ? 1 : 0);
    if (pl > 0) withAlpha(g, pl, () => {
      const [rx, ry] = wheelPt(WH.x, WH.y, WH.R * .52, rot, 33), [gx, gy] = wheelPt(WH.x, WH.y, WH.R * .55, rot, 90);
      ptext(g, '红灯', rx, ry - 4, 48, C.white, { align: 'center', ol: C.ink, olw: 4 });
      ptext(g, '1 分钟', rx, ry + 46, 36, '#FFE0DC', { align: 'center', ol: C.ink, olw: 3 });
      ptext(g, '绿灯', gx, gy - 4, 48, C.white, { align: 'center', ol: C.ink, olw: 4 });
      ptext(g, '1 分钟', gx, gy + 46, 36, '#E0FFE8', { align: 'center', ol: C.ink, olw: 3 });
    });
    g.restore();
    // 指针停下的地方：小车图标
    if (landed && t < CH('e4', 1)) popTag(g, t, S('e4') - .15, 480, 436, '你到的这一秒', 36, { fill: '#FFFFFF' });
    // "离变绿还不止 10 秒"：那一小截（红灯最后 10 秒）在外面标出来
    const rot2 = wheelRot(t);
    if (t > CH('e4', 1) - .25) {
      const [sx, sy] = wheelPt(WH.x, WH.y, WH.R + 10, rot2, 55);
      const p = pop(t, CH('e4', 1) - .25, .3);
      pixArrow(g, 800, 470, sx + 6, sy - 6, 6, C.ink, clamp(p));
      if (p > 0) { g.save(); g.translate(790, 420); g.scale(p, p); ptag(g, 0, 0, '最后 10 秒', 36, { fill: '#FF9A3C', col: C.ink }); g.restore(); }
      if (t > CH('e4', 1) + .3) ptext(g, '逃得掉', 790, 500, 36, C.ink, { align: 'center' });
    }
    // "他就追得上"：他的头像蹦进红色那一大块
    if (t > CH('e4', 2) - .25) {
      const [hx, hy] = wheelPt(WH.x, WH.y, WH.R * .6, rot2, 7), p = pop(t, CH('e4', 2) - .25, .35);
      g.save(); g.translate(hx, hy); g.scale(p, p); crabAt(g, 0, 60, 5, himO(t, { eyes: 'happy', mouth: 'smile' })); g.restore();
      if (p > 0 && t < S('e5') + .5) popTag(g, t, CH('e4', 2) - .1, hx, hy + 110, '追得上', 36, { fill: '#FFFFFF' });
    }
    // 红灯占一半 → 50%；减掉一小截 → −8%；就是 42%：一行算式，一段一段出来
    const tA = CH('e5', 0) - .25, tB = CH('e5', 1) - .25, tC = CH('e5', 2) - .25;
    if (t > tA) {
      const pb = E.out(clamp((t - tA) / .25));
      withAlpha(g, pb, () => {
        pbox(g, 90, 1104, 780, 150, { k: 6, fill: '#FFFFFF', rim: '#FFE27A' });
        const parts = [['50%', '#E5483B', tA], [' − ', C.ink, tB], ['8%', '#E07A1A', tB], [' = ', C.ink, tC], ['42%', '#D9443B', tC]];
        const ws = parts.map(([s]) => pw(g, s, 72)), tot = ws.reduce((x, y) => x + y, 0);
        let x = 480 - tot / 2;
        parts.forEach(([s, col, ta], i) => { const p = pop(t, ta, .3); if (p > 0) { g.save(); g.translate(x + ws[i] / 2, 1180); g.scale(p, p); ptext(g, s, 0, 26, i === 4 ? 84 : 72, col, { align: 'center' }); g.restore(); } x += ws[i]; });
        source(g, 'Boland 2026：追上的可能 = 红灯占比 − 领先秒数 ÷ 一轮秒数', 480, 1240, { px: 24, col: '#8A6A30', align: 'center' });
      });
      // 开头的选择题：B 四成 ✓
      const pq = pop(t, EN('e5') + .02, .35);
      if (pq > 0) { g.save(); g.translate(480, 300); g.scale(pq, pq); pbutton(g, -260, -50, 520, 100, '答案：B 四成', { fill: '#A8E6FF' }); checkMark(g, 190, -30, 9, '#2E9E4F'); g.restore(); }
    }
  }
  dialogBox(g, t, 'd2', PORTRAIT.youShock);
}

/* ================= map：连过 8 个路口 ================= */
const MAP_P = [42, 63, 75, 81, 85, 87, 89, 90];          // 按论文的公式模拟 40 万次：至少被追上一次的可能（%）
const MAP_Y = i => 1190 - i * 118;
function mapTimes() {
  const a = CH('e6', 0) - .2, c3 = CH('e6', 1) - .2, d = CH('e6', 3) - .2, e = CH('e6', 4) - .2;
  return [a, lerp(a, c3, .5), c3, lerp(c3, d, .25), lerp(c3, d, .5), lerp(c3, d, .75), d, e];
}
/* 俯视的楼顶：(x, y) 左上，w×h；c 墙色 */
function roofTop(g, x, y, w, h, c, seed) {
  g.fillStyle = 'rgba(0,0,0,.2)'; g.fillRect(x + 8, y + 10, w, h);
  g.fillStyle = shadeOf(c, .78); g.fillRect(x, y + h - 10, w, 10);                    // 朝南的墙
  g.fillStyle = c; g.fillRect(x, y, w, h - 10);
  g.fillStyle = shadeOf(c, 1.18); g.fillRect(x, y, w, 6); g.fillRect(x, y, 6, h - 10);
  // 楼顶的空调外机、水箱
  if (hash(seed, 1) > .4) { g.fillStyle = '#C3C8D3'; g.fillRect(x + w - 36, y + 12, 24, 18); g.fillStyle = '#8C93A0'; g.fillRect(x + w - 32, y + 16, 16, 4); }
  if (hash(seed, 2) > .5) pixOval(g, x + 26, y + 26, 12, 12, 6, '#9AA6B8');
}
function mapTree(g, x, y, r = 18) { pixOval(g, x + 4, y + 6, r, r * .8, 6, 'rgba(0,0,0,.18)'); pixOval(g, x, y, r, r, 6, '#3E8E41'); pixOval(g, x - r * .3, y - r * .3, r * .45, r * .45, 6, '#5DB65A'); }
function mapScene(g, t) {
  const T = mapTimes();
  // 俯视的城市：草地；横的小路（窄）；街区里是楼顶和树；最下面是一个公园
  g.fillStyle = '#86C46A'; g.fillRect(0, 0, W, H);
  for (let i = 0; i < 8; i++) {
    const yt = i === 7 ? 0 : MAP_Y(i + 1) + 20, yb = MAP_Y(i) - 20;
    for (const [x0, x1] of [[24, 446], [654, 1060]]) {
      let x = x0 + 6, k = 0;
      while (x < x1 - 60) {
        const w = 96 + Math.floor(hash(i, k, 3) * 4) * 18, ww = Math.min(w, x1 - x - 6);
        if (ww < 60) break;
        roofTop(g, x, yt + 8, ww, yb - yt - 16, ['#E8D5B5', '#F4B9A0', '#C9B8E8', '#B8D4F0', '#F2D27A', '#E8ECF2'][(i * 5 + k + (x0 > 500 ? 3 : 0)) % 6], i * 31 + k + x0);
        x += ww + 12; k++;
        if (hash(i, k, 9) > .6 && x < x1 - 50) { mapTree(g, x + 18, (yt + yb) / 2, 16); x += 42; }
      }
    }
  }
  for (let i = 0; i < 8; i++) {
    const y = MAP_Y(i);
    g.fillStyle = '#5E6370'; g.fillRect(0, y - 20, W, 40);
    g.fillStyle = '#C9C2B4'; g.fillRect(0, y - 24, W, 4); g.fillRect(0, y + 20, W, 4);
    g.fillStyle = '#E8E8E0'; for (let x = 0; x < W; x += 48) g.fillRect(x, y - 2, 24, 4);
    // 斑马线
    g.fillStyle = 'rgba(255,255,255,.85)'; for (let j = 0; j < 5; j++) { g.fillRect(476 + j * 32, y - 34, 18, 10); g.fillRect(476 + j * 32, y + 24, 18, 10); }
    // 横路上的小车
    for (let j = 0; j < 2; j++) {
      const dir = (i + j) % 2 ? 1 : -1, x = ((t * 140 * dir + i * 260 + j * 540) % 1320 + 1320) % 1320 - 120;
      if (x > 440 && x < 660) continue;
      g.save(); g.translate(x, y + (j ? 9 : -9)); g.rotate(dir * Math.PI / 2); topCar(g, 0, 0, ['#F2C230', '#E8ECF2', '#5F86D6', '#C9B8E8'][(i + j) % 4], 3); g.restore();
    }
  }
  // 最下面：公园（池塘、树、小路）
  g.fillStyle = '#7DBB5E'; g.fillRect(0, MAP_Y(0) + 24, W, H);
  pixOval(g, 230, 1640, 170, 90, 6, '#5EA6D6'); pixOval(g, 210, 1625, 120, 55, 6, '#7EC2EA'); pixOval(g, 180, 1610, 30, 10, 6, '#BDE3F7');
  g.fillStyle = '#D9C9A0'; for (let y = MAP_Y(0) + 40; y < H; y += 12) g.fillRect(Math.round(800 + Math.sin(y * .01) * 60), y, 36, 12);
  [[120, 1330], [320, 1300], [760, 1380], [960, 1330], [880, 1560], [60, 1500], [420, 1470], [980, 1760], [700, 1760], [420, 1800]].forEach(([x, y], i) => mapTree(g, x, y, 22 + (i % 3) * 4));
  // 竖着的这条路（两条车道）
  g.fillStyle = '#4B4F5C'; g.fillRect(470, 0, 160, H);
  g.fillStyle = '#E8E8E0'; for (let y = 0; y < H; y += 48) g.fillRect(547, y, 6, 24);
  g.fillStyle = '#C9C2B4'; g.fillRect(458, 0, 12, H); g.fillRect(630, 0, 12, H);
  // 每个路口的红绿灯（小圆点）
  for (let i = 0; i < 8; i++) {
    const y = MAP_Y(i), on = hash(i, Math.floor(t * .7 + i * .37)) > .5;
    pixOval(g, 652, y - 44, 14, 14, 6, C.ink); pixOval(g, 652, y - 44, 9, 9, 6, on ? '#3CE07A' : '#FF3B30');
  }
  // 两辆车往上开：你在前，他在后，路过标了 3、8 的路口时他追上来停在你旁边
  const key = [[SS('map') - .3, 1290], ...T.map((tt, i) => [tt, MAP_Y(i) + 40])];
  let yy = key[key.length - 1][1];
  for (let i = 0; i < key.length - 1; i++) if (t < key[i + 1][0]) { yy = lerp(key[i][1], key[i + 1][1], E.io(clamp((t - key[i][0]) / (key[i + 1][0] - key[i][0])))); break; }
  const near = [2, 7].some(i => Math.abs(t - T[i]) < .45);
  topCar(g, 510, Math.round(yy), CAR_COL.you, 6, { brake: near });
  topCar(g, 590, Math.round(near ? yy : yy + 110 + Math.sin(t * 3) * 20), CAR_COL.him, 6, { brake: near });
  // 标题和出处
  pbox(g, 60, 214, 840, 104, { k: 6, fill: 'rgba(27,23,48,.92)' });
  prich(g, '至少被他{追上一次}的可能', 480, 282, 48, C.white, C.amber, { align: 'center' });
  // 左边：每个路口的百分比，开到哪亮到哪
  for (let i = 0; i < 8; i++) {
    if (t < T[i]) continue;
    const p = pop(t, T[i], .3), hot = (i === 2 && t > CH('e6', 1) - .2) || (i === 7 && t > CH('e6', 3) - .2);
    g.save(); g.translate(250, MAP_Y(i)); g.scale(p, p);
    pbox(g, -190, -40, 380, 80, { k: 4, fill: hot ? '#FFE9A8' : 'rgba(255,255,255,.92)', shadow: false });
    ptext(g, `${i + 1} 个路口`, -166, 16, 36, C.ink);
    ptext(g, `${MAP_P[i]}%`, 170, 16, 48, hot ? '#D9443B' : '#3B3363', { align: 'right' });
    // 进度条
    g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(-166, 26, 336, 6); g.fillStyle = hot ? '#E5483B' : '#7A6ABF'; g.fillRect(-166, 26, Math.round(336 * MAP_P[i] / 100), 6);
    g.restore();
  }
  // 七成多 / 差不多九成
  if (t > CH('e6', 2) - .25) popTag(g, t, CH('e6', 2) - .25, 780, MAP_Y(2), '七成多', 48, { fill: '#FFE27A', t1: CH('e6', 3) + .2 });
  if (t > CH('e6', 4) - .25) popTag(g, t, CH('e6', 4) - .25, 750, MAP_Y(7) + 90, '差不多九成', 48, { fill: '#FF8A80' });
  g.fillStyle = 'rgba(27,23,48,.75)'; g.fillRect(0, 1214, W, 50);
  source(g, '按 Boland 2026 的公式模拟 40 万次：红灯占一半、一轮 2 分钟、领先 10 秒、之后一样快', 900, 1248, { px: 22, col: '#E8E0FF' });
}
