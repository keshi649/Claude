'use strict';
/* scenes1.js —— 前奏（0 ~ 15.8 秒）和第一段主歌（"还没好好的感受" ~ "天长和地久"）。
   前奏：一颗红豆一直落在画面同一个位置，背后一拍换一个世界——都是后面故事里的镜头（直接借后面镜头的画面函数，
   "闪回到未来"），最后落进她的手心，片名出来，接第一句。 */

const LT = {
  warm: { dir: 1, shade: .18, amb: '#3A2A40', ambA: .1, rim: '#FFD9A0', rimA: .5 },
  lamp: { dir: -1, shade: .24, amb: '#2A2E52', ambA: .22, rim: '#FFCF8A', rimA: .65 },
  snow: { dir: 1, shade: .22, amb: '#2A3566', ambA: .3, rim: '#FFE0A8', rimA: .7 },
  gold: { dir: 1, shade: .22, amb: '#E8A070', ambA: .14, rim: '#FFE6B0', rimA: .75 },
  fire: { dir: -1, shade: .3, amb: '#2A2A5A', ambA: .35, rim: '#FFB070', rimA: .85 },
  day: { dir: 1, shade: .14, rim: '#FFFFFF', rimA: .35 },
};

/* 手（特写）：x, y 是手腕，ang 指尖朝哪（弧度），sc 大小（sc=1 手掌宽 80）；
   o: curl 手指弯（0..1），spread 张开，flip 拇指在另一边，sleeve 袖子颜色，skin，palm 手心朝上（颜色浅一点），fing 每根手指单独的弯曲 */
function hand(g, x, y, sc, ang, o = {}) {
  const skin = o.skin || SKIN.she, curl = o.curl ?? .1, fl = o.flip ? -1 : 1;
  const pts = {};
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(sc, sc * fl);
  if (o.sleeve) { g.fillStyle = o.sleeve; rr(g, -150, -50, 150, 100, 26); g.fill(); g.fillStyle = shade(o.sleeve, .85); g.fillRect(-14, -50, 10, 100); }
  // 拇指
  const thumb = () => { g.fillStyle = shade(skin, .96); capsule(g, 30, -30, 15, 62 + (o.thumbIn ?? 0) * 20, -62 + curl * 30, 12); g.fill(); };
  if (!o.palm) thumb();
  // 手掌
  g.fillStyle = skin; rr(g, -6, -38, 92, 76, 30); g.fill();
  if (o.palm) { g.fillStyle = shade(skin, 1.04); ell(g, 40, 0, 34, 26); g.fill(); g.strokeStyle = rgba('#B07A68', .35); g.lineWidth = 2.5; g.beginPath(); g.arc(30, 30, 40, -1.3, -.4); g.stroke(); }
  // 四根手指：食指在 -y（拇指那边）
  const base = [[80, -27], [86, -9], [84, 9], [76, 26]], len = [62, 70, 64, 50], wd = [11, 11.5, 11, 9.5];
  for (let i = 0; i < 4; i++) {
    const c = (o.fing ? o.fing[i] : curl);
    const sp = (o.spread ?? .1) * (i - 1.5) * .25;
    const a1 = sp + c * 1.3, a2 = a1 + c * 1.5;
    const b = base[i], m = [b[0] + Math.cos(a1) * len[i] * .55, b[1] + Math.sin(a1) * len[i] * .55], t = [m[0] + Math.cos(a2) * len[i] * .45, m[1] + Math.sin(a2) * len[i] * .45];
    g.fillStyle = i % 2 ? skin : shade(skin, .98);
    capsule(g, b[0] - 6, b[1], wd[i], m[0], m[1], wd[i] * .95); g.fill(); capsule(g, m[0], m[1], wd[i] * .95, t[0], t[1], wd[i] * .85); g.fill();
    g.fillStyle = rgba('#FFFFFF', .35); ell(g, t[0] - Math.cos(a2) * 6, t[1] - Math.sin(a2) * 6, 5, 3.5, a2); g.fill();
    pts[i] = { b, m, t };
  }
  if (o.palm) thumb();
  // 换成世界坐标（给红线用）
  const M = g.getTransform();
  g.restore();
  const inv = ctxInv(g, M);
  for (const i in pts) for (const k of ['b', 'm', 't']) pts[i][k] = inv(pts[i][k]);
  return pts;
}
/* 把 hand 里的局部坐标（已经乘过 g 的变换）换回调用者的坐标 */
function ctxInv(g, M) {
  const G = g.getTransform().inverse();
  return ([x, y]) => { const X = M.a * x + M.c * y + M.e, Y = M.b * x + M.d * y + M.f; return [G.a * X + G.c * Y + G.e, G.b * X + G.d * Y + G.f]; };
}
/* 呵气：一团白雾从 (x, y) 往 dir 方向飘 */
function puff(g, x, y, s, s0, dir = 1, sc = 1) {
  const k = (s - s0) / 1.4; if (k < 0 || k > 1) return;
  for (let i = 0; i < 4; i++) {
    const kk = clamp(k * 1.3 - i * .1);
    g.fillStyle = `rgba(240,245,255,${.32 * Math.sin(Math.PI * kk)})`;
    circ(g, x + dir * (20 + kk * 90 + i * 12) * sc, y - kk * 30 * sc + i * 4, (12 + kk * 34) * sc); g.fill();
  }
}

/* 前奏用：借后面某个镜头的画面（at：那个镜头开始后第几秒；rate：时间流多快） */
function peek(id, at, rate = 1) {
  return (g, s, k) => {
    const sc = SCENES.find(x => x.id === id);
    if (!sc) { g.fillStyle = '#333'; g.fillRect(0, 0, W, H); text(g, id, W / 2, H / 2, 60); return; }
    const kk = at + k * rate;
    sc.draw(g, sc.a + kk, kk);
  };
}
/* 前奏里一直往下落的那颗红豆（画在最上层，转场时也不动） */
const BEAN_X = 960, BEAN_Y = 452;
function fallingBean(g, s) {
  if (s > 14.25) return;
  let r = 24, y = BEAN_Y, x = BEAN_X + Math.sin(s * 1.1) * 10;
  if (s < 1.9) r = lerp(170, 24, E.io(seg(s, 1.45, 1.9)));
  if (s > 13.5) { const u = seg(s, 13.5, 14.25); y = lerp(BEAN_Y, 742, E.in2(u)); r = lerp(24, 30, u); }
  const rot = -.6 + s * 1.15;
  // 下落的光迹
  const k = s < 1.9 ? 0 : 1;
  for (let i = 1; i <= 6; i++) { g.fillStyle = `rgba(255,120,130,${.07 * k * (1 - i / 7)})`; ell(g, x, y - i * 22, r * (1 - i / 9), r * .7 * (1 - i / 9)); g.fill(); }
  glow(g, x, y, r * 5, '#FF5060', .55);
  bean(g, x, y, r, rot, { light: '#FF6070' });
  // 周围往上飘的光点（看起来像在下落）
  for (const p of floaters(s, 61, 14, [x - 260, y - 300, x + 260, y + 300], { vy: -420, amp: 4, vx: 0 })) {
    const d = Math.hypot(p.x - x, p.y - y); if (d < r * 2) continue;
    g.fillStyle = `rgba(255,236,220,${.35 * p.tw * clamp(1 - d / 300)})`; g.fillRect(p.x, p.y, 2, 10 + p.sz * 16);
  }
}

SCENES_DEF.push(() => {
  // ---------- 前奏 ----------
  // I0：一开场就是一颗很大的红豆，在暖色的光斑里慢慢翻转；1.45 秒镜头猛地拉远
  scene('I0', 0, (g, s, k) => {
    g.fillStyle = rgrad(g, W / 2, H / 2, 100, 1300, [[0, '#4A1A26'], [.6, '#24101A'], [1, '#0E0710']]); g.fillRect(0, 0, W, H);
    bokeh(g, s, 3, 26, ['#FF9A7A', '#FFD3A0', '#FF5A6A', '#FFE9C8'], { r0: 30, r1: 90, a: .3, drift: 30 });
    // 远处慢慢飘的光尘
    for (const p of floaters(s, 7, 50, [0, 0, W, H], { vy: -40, amp: 30 })) { g.fillStyle = `rgba(255,220,200,${.4 * p.tw})`; circ(g, p.x, p.y, 1 + p.sz * 2.5); g.fill(); }
    // 光芒
    g.save(); g.globalCompositeOperation = 'screen'; g.translate(BEAN_X, BEAN_Y);
    for (let i = 0; i < 12; i++) { g.rotate(TAU / 12); g.fillStyle = `rgba(255,140,140,${.06 + .03 * Math.sin(s * 2 + i)})`; poly(g, [[0, 0], [1400, -60], [1400, 60]]); g.fill(); }
    g.restore();
  }, { over: (g, s) => fallingBean(g, s), bloom: .45, grade: 'saturate(1.1) contrast(1.05)' });
  // I1~I9：闪回（借后面镜头的画面），每个镜头一种转场
  const flash = [
    ['I1', 1.72, 'V1c', 1.2, { type: 'flash', dur: .5 }],
    ['I2', 3.08, 'V1f', 1.6, { type: 'whip', dur: .45 }],
    ['I3', 4.62, 'V2a', 1.8, { type: 'bean', dur: .55, cx: BEAN_X, cy: BEAN_Y }],
    ['I4', 5.65, 'C1h', 1.4, { type: 'spin', dur: .5 }],
    ['I5', 7.40, 'V2h', 2.6, { type: 'slide', dur: .5, dir: -1 }],
    ['I6', 9.17, 'C2e', 1.9, { type: 'flash', dur: .32, pre: .08 }],
    ['I7', 10.53, 'X2', 4.0, { type: 'ripple', dur: .5 }],
    ['I8', 11.52, 'C3f', 1.6, { type: 'blinds', dur: .5 }],
    ['I9', 12.63, 'O1', 2.0, { type: 'leak', dur: .5 }],
  ];
  for (const [id, a, src, at, tr] of flash) scene(id, a, peek(src, at, id === 'I7' ? 2.5 : 1), { tr, over: (g, s) => fallingBean(g, s), bloom: .3 });
  // I10：红豆落进她的手心；片名
  scene('I10', 13.50, (g, s, k) => {
    g.fillStyle = rgrad(g, W / 2, H * .45, 100, 1300, [[0, '#FFF2E4'], [.6, '#F4D9C6'], [1, '#D9B3A0']]); g.fillRect(0, 0, W, H);
    bokeh(g, s, 13, 22, ['#FFFFFF', '#FFE2C8', '#FFC9C0'], { r0: 40, r1: 110, a: .4, drift: 25 });
    // 手：从下面伸上来，手心朝上
    const up = E.out(seg(s, 13.4, 14.0)), close = E.io(seg(s, 15.0, 15.6));
    const hy = lerp(1200, 905, up);
    withAlpha(g, 1 - close, () => mitt(g, 960, hy, 2.3, -Math.PI / 2, { cup: true, sleeve: '#E7DAC6', skin: SKIN.she }));
    if (close > 0) withAlpha(g, close, () => mitt(g, 960, hy, 2.3, -Math.PI / 2 - .1, { fist: true, sleeve: '#E7DAC6', skin: SKIN.she }));
    if (s >= 14.25) {
      const bounce = Math.exp(-(s - 14.25) * 8) * Math.abs(Math.sin((s - 14.25) * 22)) * 24;
      glow(g, 960, 742 - bounce, 160, '#FF5060', .5 * (1 - close * .6));
      bean(g, 960, 742 - bounce, 30, -.6 + 14.25 * 1.15 + (s - 14.25) * .5);
    }
    // 片名：毛笔字墨晕开
    const ta = E.out(seg(s, 14.3, 15.0)), tb = E.out(seg(s, 14.8, 15.4));
    if (ta > 0) {
      g.save(); g.filter = `blur(${((1 - ta) * 12).toFixed(1)}px)`;
      text(g, '红豆', 960, 330 + (1 - ta) * 20, 230, { k: 'brush', col: '#B81F33', alpha: ta, ls: 20, glow: 'rgba(255,255,255,.9)', gr: 30, ga: .6 });
      g.restore();
      text(g, '方大同', 960, 500, 44, { k: 'serif', col: '#6B3A34', alpha: tb, ls: 18 });
      g.fillStyle = rgba('#B81F33', .6 * tb); g.fillRect(960 - 120 * tb, 462, 240 * tb, 2);
    }
  }, { tr: { type: 'blur', dur: .5 }, over: (g, s) => fallingBean(g, s), bloom: .3, grade: 'saturate(1.05)' });

  // ---------- 第一段主歌 ----------
  // V1a：特写——她在纸条上写"一起看一场雪"（俯拍桌面）
  scene('V1a', CUT(0), (g, s, k) => {
    const z = 1 + k * .02;
    camera(g, 960, 540, z, () => {
      // 木桌面
      g.fillStyle = '#7A5640'; g.fillRect(-100, -100, W + 200, H + 200);
      g.strokeStyle = rgba('#5A3E2E', .5); g.lineWidth = 3;
      for (let i = 0; i < 14; i++) { g.beginPath(); for (let x = -100; x <= W + 100; x += 40) { const y = i * 90 + Math.sin(x / 300 + i) * 14; x === -100 ? g.moveTo(x, y) : g.lineTo(x, y); } g.stroke(); }
      // 灯光
      g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = rgrad(g, 900, 480, 50, 900, [[0, 'rgba(255,200,130,.5)'], [1, 'rgba(255,200,130,0)']]); g.fillRect(-100, -100, W + 200, H + 200); g.restore();
      // 桌上的东西：一杯热茶、几颗红豆、几卷纸条
      mug(g, 1560, 300, 2.2, '#E9E1D3', s, 1);
      for (let i = 0; i < 7; i++) bean(g, 300 + hash(i, 1) * 260, 760 + hash(i, 2) * 140, 18, hash(i, 3) * 6);
      slipRoll(g, 1400, 820, 150, .4); slipRoll(g, 1520, 900, 150, -.2);
      // 纸条
      const rev = seg(s, Lt(0) - .1, Lc(0, 6) + .3);
      slip(g, 900, 540, 860, '一起看一场雪', rev, { rot: -.03 });
      // 握笔的手：跟着写到的字往右挪
      const n = 6, px = Math.min(860 * .32 * .52, 860 * .82 / n), x0 = 900 - (n - 1) * px * .5 + 860 * .32 * .08;
      const hx = x0 + Math.min(rev * n, n - .3) * px + 40 + Math.sin(s * 14) * 6 * (rev < 1 ? 1 : 0), hy = 600 + Math.cos(s * 14) * 4 * (rev < 1 ? 1 : 0);
      // 笔：笔尖落在写到的字后面，笔杆往右上斜
      const tx = hx - 40, ty = hy - 30, pa = -.95;
      g.save(); g.lineCap = 'round';
      g.strokeStyle = '#2C2A33'; g.lineWidth = 15; g.beginPath(); g.moveTo(tx, ty); g.lineTo(tx + Math.cos(pa) * 250, ty + Math.sin(pa) * 250); g.stroke();
      g.strokeStyle = RED; g.beginPath(); g.moveTo(tx + Math.cos(pa) * 215, ty + Math.sin(pa) * 215); g.lineTo(tx + Math.cos(pa) * 250, ty + Math.sin(pa) * 250); g.stroke();
      g.fillStyle = '#C9B48A'; poly(g, [[tx, ty], [tx + Math.cos(pa - .25) * 30, ty + Math.sin(pa - .25) * 30], [tx + Math.cos(pa + .25) * 30, ty + Math.sin(pa + .25) * 30]]); g.fill();
      g.restore();
      mitt(g, tx + 190, ty + 120, 1.55, Math.PI + .78, { fist: true, sleeve: OUTFIT.sheHome.top, skin: SKIN.she, flip: true });
    });
  }, { tr: { type: 'fade', dur: .5 }, bloom: .2, grade: 'saturate(1.02)' });

  // V1a2：屋里——她卷起纸条、系上红线，放进玻璃罐；窗外开始下雪；他端着两杯热茶走过来
  scene('V1a2', Lc(0, 5) - .25, (g, s, k) => {
    const z = 1.42 - k * .03;
    camera(g, 1130, 700, z, () => {
      room(g, s, { mood: 'night', outside: (gg, x, y, w, h) => nightSnowOutside(gg, x, y, w, h, s, { bloom: seg(s, Lt(1) - .8, Lt(1) + .5) }), lampX: 1180 });
      const tx = 1200, ty = 856;          // 桌面
      // 椅子（在她身后）
      g.fillStyle = '#5E4334'; g.fillRect(850, 912, 130, 14); g.fillRect(862, 924, 10, 74); g.fillRect(958, 924, 10, 74); g.fillRect(848, 760, 12, 166);
      // 她：坐在桌子左边，朝右；把卷好的纸条放进罐子
      const drop = seg(s, Lt(0) + 2.4, Lt(0) + 3.2);
      const sp = pose('sit', { tb: 8, aN1: lerp(62, 88, E.io(drop)), aN2: lerp(50, 8, drop), aF1: 55, aF2: 60, hd: 8 });
      const Ps = { who: 'she', u: 40, x: 915, seat: 912, f: 1, out: OUTFIT.sheHome, pose: sp, light: LT.lamp, t: s, eyes: 'down', mouth: 'smile' };
      person(g, Ps);
      // 桌子
      g.fillStyle = '#7B5843'; rr(g, tx - 230, ty, 460, 20, 6); g.fill(); g.fillStyle = '#5E4334'; g.fillRect(tx - 205, ty + 20, 16, 120); g.fillRect(tx + 190, ty + 20, 16, 120);
      jar(g, tx + 70, ty, .72, { fill: .3, slips: 2 + (drop >= 1 ? 1 : 0), seed: 7 });
      mug(g, tx - 110, ty, .7, '#E9E1D3', s, .8);
      if (drop < 1) { const p = handPos(Ps); slipRoll(g, p[0] + 10, p[1] - 4 + drop * 26, 46, 1.2); }
      // 他端着两杯茶走进来
      const wk = seg(s, Lt(0) + 2.2, Lt(0) + 4.6);
      const hx = lerp(1880, 1530, E.out(wk));
      const hp_ = wk < 1 ? walkPose(s * 7, 0, { aN1: 62, aN2: 30, aF1: 62, aF2: 30 }) : pose('stand', { aN1: 62, aN2: 30, aF1: 62, aF2: 30 });
      const Ph = { who: 'he', u: 42, x: hx, y: 1000, f: -1, out: OUTFIT.heHome, pose: hp_, light: LT.lamp, t: s, mouth: 'smile' };
      person(g, Ph);
      const hp = handPos(Ph);
      mug(g, hp[0] - 6, hp[1] + 10, .62, '#D8C9B4', s, 1);
      roomLight(g, 'night', { lx: 1180, ly: 460 });
    });
  }, { tr: { type: 'zoom', dur: .5, cx: 900, cy: 560, zoom: .6, flash: .1 }, bloom: .26 });

  // V1b：雪夜小镇——雪花一边落一边开成小花；他们推门出来，抬头看
  scene('V1b', CUT(1), (g, s, k) => {
    const cy = lerp(420, 650, E.io(clamp(k / 3.6)));
    camera(g, 960, cy, 1.05, () => {
      snowTown(g, s, { lamps: [[1380, 940, 1.15]], hz: 640 });
      // 一扇开着的门
      g.fillStyle = '#FFC774'; g.fillRect(560, 770, 80, 150); glow(g, 600, 850, 200, '#FFB050', .5);
      const out = E.out(seg(s, Lt(1) + .5, Lt(1) + 2.4));
      person(g, { who: 'he', u: 22, x: lerp(600, 760, out), y: 960, f: 1, out: OUTFIT.heWinter, pose: out < 1 ? walkPose(s * 7) : pose('stand', { hd: -25 }), light: LT.snow, t: s });
      person(g, { who: 'she', u: 22, x: lerp(600, 830, out), y: 965, f: 1, out: OUTFIT.sheWinter, pose: out < 1 ? walkPose(s * 7 + 2) : pose('stand', { hd: -28, aN1: 120, aN2: -20 }), light: LT.snow, t: s, eyes: 'up' });
    });
    bloomSnow(g, s, 21, 120, [-40, -60, W + 40, H + 40], { r: 9, vy: 60 });
    bloomSnow(g, s, 22, 26, [-40, -60, W + 40, H + 40], { r: 18, vy: 110, a: .85 });
  }, { tr: { type: 'fade', dur: .6 }, bloom: .32, grade: 'saturate(1.02) contrast(1.03)' });

  // V1c：路灯下、雪人旁边，两个人冻得直哆嗦；她把长长的红围巾绕到他脖子上，一条围巾围两个人
  scene('V1c', CUT(2), (g, s, k) => {
    camera(g, 960 + k * 8, 730, 1.12, () => {
      snowTown(g, s, { lamps: [[1180, 1000, 1.5]], hz: 600, moonX: 300, moonY: 300 });
      snowman(g, 620, 1000, 1.25, 0, s);
      const shiv = (sd) => Math.sin(s * 38 + sd) * 2.2;
      const wrap = E.io(seg(s, Lt(2) + .9, Lt(2) + 2.2));
      const P1 = { who: 'he', u: 46, x: 880 + shiv(0), y: 1010, view: 'front', out: OUTFIT.heWinter, pose: { aN1: 14, aN2: 30, aF1: 14, aF2: 30, lean: wrap * 4 }, light: LT.snow, t: s, eyes: 'happy', mouth: 'open', blush: .9 };
      const P2 = { who: 'she', u: 46, x: 1035 + shiv(1.3), y: 1010, view: 'front', out: Object.assign({}, OUTFIT.sheWinter, { scarf: false }), pose: { aN1: 14, aN2: 30, aF1: 14, aF2: 30, lean: -wrap * 5 }, light: LT.snow, t: s, eyes: 'happy', mouth: 'smile', blush: 1 };
      person(g, P1); person(g, P2);
      // 一条长围巾：她的脖子 → 他的脖子
      const n1 = headPos(P1), n2 = headPos(P2);
      const y1 = n1[1] + 46 * 1.35, y2 = n2[1] + 46 * .94 * 1.35;
      g.fillStyle = RED;
      rr(g, n2[0] - 30, y2 - 12, 60, 26, 12); g.fill();
      const ex = lerp(n2[0] - 20, n1[0] + 28, wrap);
      capsule(g, n2[0] - 20, y2, 14, ex, lerp(y2 + 30, y1, wrap), 14); g.fill();
      if (wrap > .8) { rr(g, n1[0] - 30, y1 - 12, 60, 26, 12); g.fill(); limb(g, [[n1[0] - 18, y1], [n1[0] - 24, y1 + 50], [n1[0] - 20 + Math.sin(s * 2) * 6, y1 + 100]], [12, 11, 11], RED); }
      limb(g, [[n2[0] + 18, y2], [n2[0] + 24, y2 + 50], [n2[0] + 20 + Math.sin(s * 2 + 1) * 6, y2 + 96]], [12, 11, 11], RED);
      puff(g, n1[0] + 20, n1[1] + 30, s, Lt(2) + .2, 1, .8); puff(g, n2[0] - 20, n2[1] + 30, s, Lt(2) + 1.3, -1, .8);
      puff(g, n1[0] + 20, n1[1] + 30, s, Lt(2) + 1.9, 1, .8);
    });
    bloomSnow(g, s, 31, 90, [-40, -60, W + 40, H + 40], { r: 8, vy: 55 });
  }, { tr: { type: 'blur', dur: .5 }, bloom: .3 });

  // V1d：两个人的半身特写——他握着她冰凉的手呵气；"什么是温柔"时她把头靠到他肩上
  scene('V1d', CUT(3), (g, s, k) => {
    g.fillStyle = vgrad(g, 0, H, [[0, '#1A2148'], [1, '#3A3A68']]); g.fillRect(0, 0, W, H);
    bokeh(g, s, 41, 20, ['#FFC680', '#FFE0A8', '#9FB2FF'], { r0: 50, r1: 120, a: .3 });
    const lean = E.io(seg(s, Lc(3, 4) - .3, Lc(3, 4) + .8));
    const z = 1 + k * .015;
    camera(g, 960, 560, z, () => {
      bust(g, 760 + lean * 20, 430, 175, { who: 'he', out: OUTFIT.heWinter, light: LT.snow, t: s, eyes: lean > .5 ? 'happy' : 'down', mouth: 'smile', tilt: .06, blush: .7 });
      bust(g, 1170 - lean * 120, 450 + lean * 70, 165, { who: 'she', out: OUTFIT.sheWinter, light: LT.snow, t: s, eyes: lean > .4 ? 'closed' : 'happy', mouth: 'smile', tilt: -.08 - lean * .22, blush: 1 });
      // 他捧着她的手，凑到嘴边呵气
      const hy = lerp(860, 780, E.io(seg(s, CUT(3), CUT(3) + 1))), hx = 905 - lean * 30;
      // 她两只手捧着一杯热茶，他把一只大手盖在她手上（给她暖手）
      const mx = hx + 60, my = hy + 150;
      mitt(g, mx - 150, my - 40, 1.0, -.25, { fist: true, sleeve: OUTFIT.sheWinter.top, skin: SKIN.she });
      mug(g, mx, my, 1.7, '#F2EBE0', s, 1.2);
      mitt(g, mx + 150, my - 40, 1.0, Math.PI + .25, { fist: true, sleeve: OUTFIT.sheWinter.top, skin: SKIN.she, flip: true });
      const cover = E.out(seg(s, CUT(3) + .4, CUT(3) + 1.2));
      mitt(g, lerp(mx - 420, mx - 210, cover), my - 100 + (1 - cover) * 60, 1.15, .25, { sleeve: OUTFIT.heWinter.top, skin: SKIN.he, flip: true });
      puff(g, 800, 600, s, Lt(3) + .2, 1, 1.1); puff(g, 800, 600, s, Lt(3) + 1.6, 1, 1.1);
    });
    bloomSnow(g, s, 43, 40, [-40, -60, W + 40, H + 40], { r: 12, vy: 50, a: .7 });
  }, { tr: { type: 'fade', dur: .4 }, bloom: .3 });

  // V1e：手的特写——"还没跟你牵着手"：两只手慢慢靠近、扣在一起，小指上系着的红线亮起来；
  // 背景从雪夜的蓝慢慢变成沙漠的金色，飘的雪变成风里的沙
  scene('V1e', CUT(4), (g, s, k) => {
    const warm = E.io(seg(s, Lt(4) + .3, Lt(5) - .2));
    g.fillStyle = vgrad(g, 0, H, [[0, mixc('#1A2148', '#E8A07A', warm)], [1, mixc('#3A3A68', '#F6D3A0', warm)]]); g.fillRect(0, 0, W, H);
    bokeh(g, s, 51, 16, warm < .5 ? ['#FFC680', '#9FB2FF'] : ['#FFF0C8', '#FFC890'], { r0: 60, r1: 140, a: .25 });
    // 粒子：雪 → 沙
    for (const p of floaters(s, 52, 70, [0, 0, W, H], { vy: lerp(-40, 0, warm), vx: lerp(0, 220, warm), amp: 20 })) {
      g.fillStyle = warm < .5 ? `rgba(255,255,255,${.6 * p.tw * (1 - warm * 2)})` : `rgba(255,230,190,${.6 * p.tw * (warm * 2 - 1)})`;
      if (warm < .5) { circ(g, p.x, p.y, 2 + p.sz * 3); g.fill(); } else g.fillRect(p.x, p.y, 4 + p.sz * 10, 2);
    }
    // 两只拳头从两边靠近，小指伸出来勾在一起（全乐队进来的强拍 bar(8) 正好勾上）
    const meet = E.io(seg(s, Lt(4) + .1, bar(8) - .1));
    const ext = E.out(seg(s, bar(8) - .9, bar(8) - .3)), hook = E.io(seg(s, bar(8) - .25, bar(8) + .15));
    const shake = s > bar(8) + .2 ? Math.sin((s - bar(8)) * 9) * 10 * Math.exp(-(s - bar(8) - .2) * 1.2) : 0;
    const cy = 560 + shake;
    const A = mitt(g, lerp(-80, lerp(600, 700, hook), meet), cy - 90, 2.3, .1, { fist: true, pinky: ext * .3 + hook * .7, sleeve: OUTFIT.sheWinter.top, skin: SKIN.she });
    const B = mitt(g, lerp(W + 80, lerp(1330, 1230, hook), meet), cy + 110, 2.35, Math.PI + .1, { fist: true, pinky: ext * .3 + hook * .7, sleeve: OUTFIT.heWinter.top, skin: SKIN.he });
    // 小指上系的红线：两个小圈 + 中间一段
    if (ext > 0) {
      const a = A.pinkyMid, b = B.pinkyMid;
      redThread(g, [a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + lerp(80, 24, hook)], b], 5, 1, .5 + hook);
      for (const p of [a, b]) { g.strokeStyle = RED; g.lineWidth = 6; g.beginPath(); g.ellipse(p[0], p[1], 10, 22, .2, 0, TAU); g.stroke(); }
      // 线头垂下来，坠一颗红豆
      const m = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + lerp(80, 24, hook)];
      redThread(g, [m, [m[0] + 6 + Math.sin(s * 2) * 6, m[1] + 70], [m[0] + Math.sin(s * 2 + .5) * 12, m[1] + 140]], 4, ext, .5);
      bean(g, m[0] + Math.sin(s * 2 + .5) * 12, m[1] + 156, 14, .3 + Math.sin(s * 2) * .2);
    }
    if (hook > 0) glow(g, W / 2, 600, 700 * Math.sin(Math.PI * clamp(hook * 1.1)), '#FF8A7A', .55);
  }, { tr: { type: 'fade', dur: .5 }, bloom: s => .3 + .3 * Math.exp(-Math.abs(s - bar(8)) * 3) });

  // V1f：黄昏的沙漠——两个人牵着手走在沙丘的脊线上，身后一串脚印
  scene('V1f', CUT(5), (g, s, k) => {
    const pan = k * 40;
    desert(g, s, {
      pan, sunX: 1550, sunY: 560, after: (gg, ridge) => {
        const wx = 700 + k * 95;
        // 脚印
        for (let i = 1; i < 30; i++) { const fx = wx - i * 46; gg.fillStyle = 'rgba(160,100,70,.35)'; ell(gg, fx, ridge(fx) + 4 + (i % 2) * 6, 8, 3); gg.fill(); ell(gg, fx - 50, ridge(fx - 50) + 4 + (i % 2) * 6, 7, 3); gg.fill(); }
        const ph = s * 6.5;
        const Ph = { who: 'he', u: 22, x: wx + 30, y: ridge(wx + 30) + 4, f: 1, out: OUTFIT.heDesert, pose: walkPose(ph, 0, { aF1: 25, aF2: 10 }), light: LT.gold, t: s };
        const Ps = { who: 'she', u: 22, x: wx - 30, y: ridge(wx - 30) + 6, f: 1, out: OUTFIT.sheDesert, pose: walkPose(ph + Math.PI, 0, { aN1: 30, aN2: 5 }), light: LT.gold, t: s, wind: .5 };
        person(gg, Ph);
        person(gg, Ps);
        const a = handPos(Ps, 'N'), b = handPos(Ph, 'F');
        gg.strokeStyle = RED; gg.lineWidth = 1.6; gg.beginPath(); gg.moveTo(a[0], a[1]); gg.quadraticCurveTo((a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 3, b[0], b[1]); gg.stroke();
      }
    });
  }, { tr: { type: 'leak', dur: .6 }, bloom: .35, grade: 'saturate(1.08) contrast(1.03)' });

  // V1g：沙漠的夜——篝火旁坐着；她把一颗红豆举向星空；"学会珍惜"时一颗流星划过，她把红豆握回手心
  scene('V1g', CUT(6), (g, s, k) => {
    camera(g, 960, 540, 1.04 + k * .01, () => {
      desert(g, s, {
        mode: 'night', ridgeY: 900, starX: k * 6, after: (gg, ridge) => {
          campfire(gg, 620, ridge(620) + 20, 1.3, s);
          const raise = E.io(seg(s, Lt(6) + .4, Lt(6) + 1.6)), lower = E.io(seg(s, Lc(6, 6) + .6, Lc(6, 6) + 1.6));
          const up = raise * (1 - lower);
          const Ph = { who: 'he', u: 40, x: 1230, seat: ridge(1230) - 8, f: -1, out: OUTFIT.heDesert, pose: pose('sitFloor', { aF1: 40 }), light: LT.fire, t: s, eyes: up > .5 ? 'up' : 'open' };
          const Ps = { who: 'she', u: 40, x: 1060, seat: ridge(1060) - 8, f: -1, out: OUTFIT.sheDesert, pose: pose('sitFloor', { aN1: lerp(52, 160, up), aN2: lerp(28, -10, up), hd: -up * 30 }), light: LT.fire, t: s, eyes: up > .3 ? 'up' : 'open', mouth: 'smile' };
          person(gg, Ph); person(gg, Ps);
          const hp = handPos(Ps, 'N');
          if (up > .05) { glow(gg, hp[0], hp[1] - 14, 60, '#FF6070', .5 * up); bean(gg, hp[0], hp[1] - 16, 9, .4); }
        }
      });
      shootingStar(g, s, Lc(6, 6) - .1, 300, 120, .4, 420, 1.2, '#FFF2E0');
    });
  }, { tr: { type: 'black', dur: .5 }, bloom: .4, grade: 'saturate(1.05) contrast(1.04)' });

  // V1h：镜头从沙丘上的两个小小的背影往上摇到银河——"天长和地久"
  scene('V1h', CUT(7), (g, s, k) => {
    const tilt = E.io(clamp(k / 3.2));
    skyGrad(g, [[0, '#060820'], [.6, '#121845'], [1, '#2D2A5E']]);
    milkyWay(g, W * .5, H * (.1 + tilt * .35), 2600, -.3, .9);
    stars(g, s, 200, -tilt * 200, 1, 1);
    g.save(); g.translate(0, tilt * 640);
    // 沙丘剪影
    g.fillStyle = '#1A1D3A'; g.beginPath(); g.moveTo(-100, H + 100); for (let x = -100; x <= W + 100; x += 20) g.lineTo(x, 800 - Math.sin(x / 500) * 60 - Math.sin(x / 170) * 10); g.lineTo(W + 100, H + 100); g.fill();
    const by = 800 - Math.sin(960 / 500) * 60 - Math.sin(960 / 170) * 10;
    person(g, { who: 'he', u: 20, x: 940, seat: by - 20, view: 'back', out: OUTFIT.heDesert, sil: '#0E1028', pose: { aF1: 30, aF2: 10 } });
    person(g, { who: 'she', u: 20, x: 985, seat: by - 19, view: 'back', out: OUTFIT.sheDesert, sil: '#0E1028', pose: { lean: -8, tilt: -.3, aN1: 30 } });
    g.restore();
  }, { tr: { type: 'fade', dur: .6 }, bloom: .45 });
});
