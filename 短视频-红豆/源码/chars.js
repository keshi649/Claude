'use strict';
/* chars.js —— 这支 MV 的两个人：他、她。绘本风：圆脸、点眼睛、腮红，扁平色块，没有勾线。
   person(g, P) 画一个人。坐标：P.x, P.y 是脚底着地的点（P.seat 给了就按臀部放在 (x, seat)），P.u 是头的半径（像素）。
   P = {
     who: 'he' | 'she',  age: 0..1（0 年轻，1 老：头发变白、他戴眼镜、她盘发髻、背有点驼）,
     view: 'side' | 'front' | 'back',  f: 1 朝右 / -1 朝左（侧面时）,
     pose: 关节角（度）—— tb 躯干前倾，hd 低头，aN1/aN2 近侧胳膊（肩、肘），aF1/aF2 远侧胳膊，lN1/lN2 近侧腿（髋、膝），lF1/lF2 远侧腿；
           角度从竖直向下量起，正数往脸朝的方向（前）转；肘、膝是相对上一节的弯曲。
           正面 / 背面时：aN1/aF1 是两条胳膊往外张开的角度（N 在画面左边），lN1/lF1 是腿往外分开的角度。
     out: 衣服（见 OUTFIT），wind: 风（-1..1，往右为正），t: 时间（头发、裙摆飘动用），
     eyes: 'open' | 'closed' | 'happy' | 'down' | 'up'，mouth: 'smile' | 'open' | 'flat' | 'sad' | 'o'，blush: 0..1，
     light: { dir: 光从哪边来（1 右、-1 左），amb: 环境色, ambA: 染多少, shade: 背光面压暗多少, rim: 亮边颜色, rimA }，
     sil: 剪影颜色（远景、逆光时整个人填成一个颜色），alpha
   } */

const SKIN = { he: '#EDC9A8', she: '#F5D7C0' };
const HAIR = { he: ['#2A2321', '#DADAD6'], she: ['#4A2E26', '#E6E1DB'] };
const RED = '#C9283B', RED_D = '#8E1426', RED_L = '#F0596B';
/* 衣服：top 上衣（外套 / 衬衫 / 毛衣），hem 下摆长度（单位：头半径，从髋往下量；0 = 没有下摆），flare 下摆张开，
   pants 裤子（null = 腿是皮肤色或袜子 legs），shoes 鞋，collar 领口颜色，scarf 红围巾，dress = 连衣裙（下摆跟着风飘） */
const OUTFIT = {
  heWinter: { top: '#3C4A5F', top2: '#2E3A4D', hem: 1.5, flare: .25, pants: '#2C3038', shoes: '#3A2E2A', collar: '#C9C2B6' },
  sheWinter: { top: '#E7DAC6', top2: '#D4C3AA', hem: 2.3, flare: .35, legs: '#5B4C4A', shoes: '#6A4636', scarf: true },
  heHome: { top: '#7F8F79', top2: '#6C7B67', hem: .35, flare: .05, pants: '#4A5266', shoes: '#5A4A40' },
  sheHome: { top: '#A9B8C8', top2: '#93A3B5', hem: 2.0, flare: .3, dress: true, skirt: '#E4DCCD', legs: '#F5D7C0', shoes: '#C99A86' },
  heSummer: { top: '#F1EEE7', top2: '#DCD8CF', hem: .3, flare: .05, pants: '#5B6577', shoes: '#4A3C34' },
  sheSummer: { top: '#F4EFE6', top2: '#E2DACB', hem: 2.4, flare: .55, dress: true, skirt: '#F4EFE6', legs: '#F5D7C0', shoes: '#B88C73' },
  heDesert: { top: '#E8DDC8', top2: '#D2C4A9', hem: .35, flare: .05, pants: '#8C7B62', shoes: '#6B5440' },
  sheDesert: { top: '#F3E6CF', top2: '#E1CFB0', hem: 2.6, flare: .42, dress: true, skirt: '#E9C9A6', legs: '#F5D7C0', shoes: '#A9805E', hat: '#E2C48E' },
  heTravel: { top: '#5A6B58', top2: '#4A5948', hem: 1.2, flare: .2, pants: '#3A3E46', shoes: '#3A2E2A', collar: '#E9E3D6' },
  sheTravel: { top: '#B98A6E', top2: '#A07359', hem: 2.0, flare: .3, legs: '#3E3A40', shoes: '#4A342C', collar: '#F2ECE2' },
  heOld: { top: '#8A6D57', top2: '#755C49', hem: .5, flare: .08, pants: '#5B5853', shoes: '#4A3E36', collar: '#EDE8DE' },
  sheOld: { top: '#9D90B2', top2: '#86799C', hem: 2.5, flare: .35, dress: true, skirt: '#6E6676', legs: '#D8C3B6', shoes: '#5E4E48' },
};

/* 常用姿势（侧面） */
const POSE = {
  stand: { tb: 0, hd: 0, aN1: 4, aN2: 10, aF1: -4, aF2: 10, lN1: 2, lN2: 0, lF1: -2, lF2: 0 },
  sit: { tb: -4, hd: 0, aN1: 20, aN2: 45, aF1: 18, aF2: 45, lN1: 88, lN2: -88, lF1: 84, lF2: -84 },
  sitLean: { tb: 10, hd: 8, aN1: 30, aN2: 50, aF1: 26, aF2: 50, lN1: 88, lN2: -86, lF1: 84, lF2: -84 },
  kneel: { tb: 4, hd: 10, aN1: 20, aN2: 20, aF1: 14, aF2: 20, lN1: 0, lN2: -92, lF1: -4, lF2: -92 },
  crouch: { tb: 30, hd: 15, aN1: 40, aN2: 30, aF1: 34, aF2: 30, lN1: 100, lN2: -150, lF1: 96, lF2: -150 },
  sitFloor: { tb: 6, hd: 4, aN1: 52, aN2: 28, aF1: 48, aF2: 30, lN1: 118, lN2: -128, lF1: 112, lF2: -122 },   // 坐在地上抱着膝盖
  reach: { tb: 6, hd: 0, aN1: 75, aN2: 8, aF1: 10, aF2: 15, lN1: 6, lN2: 0, lF1: -8, lF2: 0 },
};
function pose(base, o = {}) { return Object.assign({}, POSE[base] || base, o); }
/* 走路 / 跑步：ph 相位（弧度），run 0..1 */
function walkPose(ph, run = 0, o = {}) {
  const s = Math.sin(ph), c = Math.cos(ph), A = 24 + run * 22;
  return Object.assign({
    tb: 3 + run * 12, hd: 0,
    lN1: A * s, lN2: -(6 + (22 + run * 50) * Math.max(0, c)),
    lF1: -A * s, lF2: -(6 + (22 + run * 50) * Math.max(0, -c)),
    aN1: -(16 + run * 26) * s, aN2: 14 + run * 70, aF1: (16 + run * 26) * s, aF2: 14 + run * 70,
    bob: Math.abs(c) * (.07 + run * .1),
  }, o);
}
function lerpPose(a, b, u) { const o = {}; for (const k in a) o[k] = (typeof a[k] === 'number' && typeof b[k] === 'number') ? lerp(a[k], b[k], u) : (u < .5 ? a[k] : b[k]); for (const k in b) if (!(k in o)) o[k] = b[k]; return o; }

const D2R = Math.PI / 180;
/* 骨架尺寸（单位：头半径 u） */
const BODY = { torso: 2.45, neck: .32, head: .95, upper: 1.42, fore: 1.32, thigh: 1.95, shin: 1.9, hip: 4.05 };

/* 算出关节的位置（世界坐标）。侧面：f 是朝向；方向角 0 = 向下，正 = 向前（f 那边） */
function rig(P) {
  const u = P.u, f = P.f || 1, p = Object.assign({}, POSE.stand, P.pose || {}), age = P.age || 0;
  const sc = P.who === 'she' ? .94 : 1;
  const U = u;                                  // 头的半径
  const L = k => BODY[k] * U * sc / 1;
  const dir = a => [Math.sin(a * D2R) * f, Math.cos(a * D2R)];   // 从竖直向下转 a 度（往前）
  const hunch = age * 5;
  const tb = (p.tb || 0) + hunch;
  // 腿：从髋往下
  const legs = {};
  for (const s of ['N', 'F']) {
    const a1 = p['l' + s + '1'] || 0, a2 = a1 + (p['l' + s + '2'] || 0);
    const d1 = dir(a1), d2 = dir(a2);
    legs[s] = { a1, a2, k: [d1[0] * L('thigh'), d1[1] * L('thigh')], a: [d1[0] * L('thigh') + d2[0] * L('shin'), d1[1] * L('thigh') + d2[1] * L('shin')] };
  }
  // 髋的位置
  let hx = P.x, hy;
  if (P.seat != null) hy = P.seat;
  else {
    // 最低点（脚踝 + 鞋底、膝盖）落在地上
    let low = 0;
    for (const s of ['N', 'F']) { low = Math.max(low, legs[s].a[1] + .22 * U, legs[s].k[1] + .3 * U); }
    hy = P.y - low + (p.bob || 0) * U;
  }
  const H = [hx, hy];
  const ta = 180 - tb;                           // 躯干朝上：从向下转 180 度，前倾就少转一点
  const td = dir(ta);
  const S = [hx + td[0] * L('torso'), hy + td[1] * L('torso')];   // 肩（脖子根）
  const hd = (p.hd || 0) + age * 6;
  const nd = dir(180 - tb - hd * .5);
  const N = [S[0] + nd[0] * L('neck'), S[1] + nd[1] * L('neck')];
  const hdir = dir(180 - tb - hd);
  const C = [N[0] + hdir[0] * L('head'), N[1] + hdir[1] * L('head')];   // 头的中心
  // 胳膊：从肩往下（肩点在躯干上沿往下一点）
  const arms = {};
  const Sh = [S[0] - td[0] * .25 * U, S[1] - td[1] * .25 * U];
  for (const s of ['N', 'F']) {
    const a1 = (p['a' + s + '1'] || 0) - tb * .2, a2 = a1 + (p['a' + s + '2'] || 0);
    const d1 = dir(a1), d2 = dir(a2);
    const e = [Sh[0] + d1[0] * L('upper'), Sh[1] + d1[1] * L('upper')];
    arms[s] = { a1, a2, sh: Sh, e, h: [e[0] + d2[0] * L('fore'), e[1] + d2[1] * L('fore')] };
  }
  for (const s of ['N', 'F']) { legs[s].k = [hx + legs[s].k[0], hy + legs[s].k[1]]; legs[s].a = [hx + legs[s].a[0], hy + legs[s].a[1]]; }
  return { u: U, f, sc, H, S, N, C, td, tb, hd: 180 - tb - hd, arms, legs, p };
}
function handPos(P, s = 'N') { const r = P.view && P.view !== 'side' ? rigFront(P) : rig(P); return r.arms[s].h; }
function headPos(P) { const r = P.view && P.view !== 'side' ? rigFront(P) : rig(P); return r.C; }

/* 正面 / 背面骨架：aN1/aF1 胳膊往外张开（度），aN2/aF2 肘再弯；lN1/lF1 腿往外分；N 在画面左边 */
function rigFront(P) {
  const u = P.u, p = Object.assign({ aN1: 8, aN2: 4, aF1: 8, aF2: 4, lN1: 4, lF1: 4, lN2: 0, lF2: 0, tb: 0 }, P.pose || {});
  const sc = P.who === 'she' ? .94 : 1, age = P.age || 0;
  const L = k => BODY[k] * u * sc;
  const legs = {};
  for (const [s, side] of [['N', -1], ['F', 1]]) {
    const a1 = p['l' + s + '1'] || 0, a2 = a1 + (p['l' + s + '2'] || 0);
    const hx0 = side * .34 * u * sc;
    // 正面坐着（sitF）：大腿朝着镜头，缩短成一小截
    const k = p.sitF ? [hx0 + side * .08 * u, .45 * u] : [hx0 + Math.sin(a1 * D2R) * side * L('thigh'), Math.cos(a1 * D2R) * L('thigh')];
    const a = [k[0] + Math.sin(a2 * D2R) * side * L('shin'), k[1] + Math.cos(a2 * D2R) * L('shin')];
    legs[s] = { a1, a2, top: [hx0, 0], k, a, side };
  }
  let hy;
  if (P.seat != null) hy = P.seat; else hy = P.y - Math.max(legs.N.a[1], legs.F.a[1]) - .2 * u + (p.bob || 0) * u;
  const H = [P.x + (p.sway || 0) * u, hy];
  for (const s of ['N', 'F']) { const l = legs[s]; l.top = [P.x + l.top[0], hy]; l.k = [P.x + l.k[0], hy + l.k[1]]; l.a = [P.x + l.a[0], hy + l.a[1]]; }
  const lean = (p.lean || 0) * D2R;            // 往旁边歪（正 = 往画面右）
  const S = [H[0] + Math.sin(lean) * L('torso'), H[1] - Math.cos(lean) * L('torso') * (1 - age * .04)];
  const tilt = ((p.tilt || 0) + (p.lean || 0) * .5) * D2R;   // 歪头
  const N = [S[0] + Math.sin(tilt) * L('neck'), S[1] - Math.cos(tilt) * L('neck')];
  const C = [N[0] + Math.sin(tilt) * L('head'), N[1] - Math.cos(tilt) * L('head') + (p.nod || 0) * u * .25];
  const arms = {};
  const shw = (P.who === 'she' ? .74 : .84) * u * sc;
  for (const [s, side] of [['N', -1], ['F', 1]]) {
    const sh = [S[0] + side * shw, S[1] + .28 * u];
    const a1 = p['a' + s + '1'] || 0, a2 = a1 + (p['a' + s + '2'] || 0);
    // 张开的角度：从竖直向下往外转；超过 90 就是举起来
    const e = [sh[0] + Math.sin(a1 * D2R) * side * L('upper'), sh[1] + Math.cos(a1 * D2R) * L('upper')];
    const fx = p['a' + s + 'x'];   // 可选：前臂往里收（抱、牵手）——直接给手的位置偏移
    const h = [e[0] + Math.sin(a2 * D2R) * side * L('fore'), e[1] + Math.cos(a2 * D2R) * L('fore')];
    arms[s] = { sh, e, h, side, a1, a2 };
  }
  return { u, sc, H, S, N, C, tilt, arms, legs, p, f: 1 };
}

/* ---------- 画图元 ---------- */
/* 两个圆之间连成胶囊（圆锥台），r0、r1 两头半径 */
function capsule(g, x0, y0, r0, x1, y1, r1) {
  const dx = x1 - x0, dy = y1 - y0, d = Math.hypot(dx, dy);
  if (d < Math.abs(r0 - r1) + .01) { circ(g, x0, y0, Math.max(r0, r1)); return; }
  const a = Math.atan2(dy, dx), b = Math.acos(clamp((r0 - r1) / d, -1, 1));
  g.beginPath();
  g.moveTo(x0 + r0 * Math.cos(a + b), y0 + r0 * Math.sin(a + b));
  g.lineTo(x1 + r1 * Math.cos(a + b), y1 + r1 * Math.sin(a + b));
  g.arc(x1, y1, r1, a + b, a - b, true);
  g.lineTo(x0 + r0 * Math.cos(a - b), y0 + r0 * Math.sin(a - b));
  g.arc(x0, y0, r0, a - b, a + b - TAU, true);
  g.closePath();
}
function limb(g, pts, rs, col) { g.fillStyle = col; for (let i = 0; i + 1 < pts.length; i++) { capsule(g, pts[i][0], pts[i][1], rs[i], pts[i + 1][0], pts[i + 1][1], rs[i + 1]); g.fill(); } }
const add = (a, b, k = 1) => [a[0] + b[0] * k, a[1] + b[1] * k];
const nrm = (a, b) => { const dx = b[0] - a[0], dy = b[1] - a[1], d = Math.hypot(dx, dy) || 1; return [dx / d, dy / d]; };

/* 离屏画布：按角色大小分档，免得大特写糊 */
const _figCan = {};
function figCanvas(sz) {
  const k = sz <= 256 ? 256 : sz <= 512 ? 512 : sz <= 1024 ? 1024 : 2048;
  if (!_figCan[k]) { const c = mk(k, k); _figCan[k] = { c, g: c.getContext('2d'), c2: mk(k, k) }; _figCan[k].g2 = _figCan[k].c2.getContext('2d'); }
  return _figCan[k];
}

/* 画一个人：先画到离屏画布，再打光（环境色、背光面、亮边），再贴回来 */
function person(g, P) {
  if ((P.alpha ?? 1) <= .003) return;
  const u = P.u, view = P.view || 'side';
  const R_ = view === 'side' ? rig(P) : rigFront(P);
  // 包围盒：以髋为中心
  const half = Math.ceil(u * 6.2 + (P.extra || 0));
  const fc = figCanvas(half * 2), c = fc.c, fg = fc.g, k = c.width / (half * 2);
  const ox = R_.H[0] - half, oy = R_.H[1] - half;
  fg.setTransform(1, 0, 0, 1, 0, 0); fg.clearRect(0, 0, c.width, c.height);
  fg.setTransform(k, 0, 0, k, -ox * k, -oy * k);
  fg.globalAlpha = 1; fg.globalCompositeOperation = 'source-over'; fg.filter = 'none';
  if (view === 'side') drawSide(fg, P, R_); else drawFrontBack(fg, P, R_, view === 'back');
  // 打光
  fg.setTransform(1, 0, 0, 1, 0, 0);
  const Lt = P.light || {};
  if (P.sil) {
    fg.globalCompositeOperation = 'source-in'; fg.fillStyle = P.sil; fg.fillRect(0, 0, c.width, c.height);
  } else {
    if (Lt.amb) { fg.globalCompositeOperation = 'source-atop'; fg.fillStyle = rgba(Lt.amb, Lt.ambA ?? .25); fg.fillRect(0, 0, c.width, c.height); }
    const ld = Lt.dir ?? 1, sh = Lt.shade ?? .16;
    if (sh > 0) {
      fg.globalCompositeOperation = 'source-atop';
      const cx = (R_.H[0] - ox) * k;
      fg.fillStyle = lgrad(fg, cx + ld * u * 1.2 * k, 0, cx - ld * u * 1.6 * k, 0, [[0, 'rgba(30,20,50,0)'], [1, `rgba(30,20,50,${sh})`]]);
      fg.fillRect(0, 0, c.width, c.height);
    }
    if (Lt.rim) {
      const c2 = fc.c2, g2 = fc.g2;
      g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalCompositeOperation = 'copy'; g2.drawImage(c, 0, 0);
      g2.globalCompositeOperation = 'destination-out'; g2.drawImage(c, -ld * Math.max(2, u * .09) * k, Math.max(1, u * .03) * k);
      g2.globalCompositeOperation = 'source-in'; g2.fillStyle = Lt.rim; g2.fillRect(0, 0, c2.width, c2.height);
      fg.globalCompositeOperation = 'source-atop'; fg.globalAlpha = Lt.rimA ?? .7; fg.drawImage(c2, 0, 0); fg.globalAlpha = 1;
    }
  }
  fg.globalCompositeOperation = 'source-over';
  g.save(); g.globalAlpha *= P.alpha ?? 1; g.drawImage(c, ox, oy, half * 2, half * 2); g.restore();
}

/* ---------- 侧面 ---------- */
function drawSide(g, P, R_) {
  const u = R_.u * R_.sc, f = R_.f, who = P.who, age = P.age || 0, o = P.out || OUTFIT[who === 'he' ? 'heHome' : 'sheHome'];
  const skin = P.skin || SKIN[who], skinD = shade(skin, .86);
  const t = P.t || 0, wind = P.wind || 0;
  const { H, S, C, arms, legs } = R_;
  const legCol = o.pants || o.legs || skin, legColF = shade(legCol, .82);
  // 远侧胳膊、腿（暗一点）
  const drawArm = (s, dark) => {
    const A = arms[s], sl = dark ? (o.top2 || shade(o.top, .85)) : o.top;
    const shortSleeve = o.short;
    limb(g, [A.sh, A.e, A.h], [.34 * u, .3 * u, .25 * u], sl);
    if (shortSleeve) limb(g, [A.e, A.h], [.2 * u, .17 * u], dark ? skinD : skin);
    // 手
    const d = nrm(A.e, A.h);
    g.fillStyle = dark ? skinD : skin; ell(g, A.h[0] + d[0] * .16 * u, A.h[1] + d[1] * .16 * u, .2 * u, .24 * u, Math.atan2(d[1], d[0]) - Math.PI / 2); g.fill();
    if (P.ring && !dark) { g.fillStyle = '#F2C94C'; circ(g, A.h[0] + d[0] * .22 * u, A.h[1] + d[1] * .22 * u, .05 * u); g.fill(); }
  };
  const drawLeg = (s, dark) => {
    const Lg = legs[s], col = dark ? legColF : legCol;
    const top = add(H, [-f * .05 * u, 0]);
    limb(g, [top, Lg.k, Lg.a], [.4 * u, .3 * u, .22 * u], col);
    // 鞋：沿着脚的方向往前
    const sd = nrm(Lg.k, Lg.a);
    const fa = Math.atan2(sd[1], sd[0]) - Math.PI / 2;       // 小腿竖直时 fa = 0
    const sx = Lg.a[0] + f * .2 * u * Math.cos(fa), sy = Lg.a[1] + .12 * u + .2 * u * Math.sin(fa) * f;
    g.fillStyle = dark ? shade(o.shoes, .8) : o.shoes; ell(g, sx, sy, .36 * u, .17 * u, fa * .8); g.fill();
  };
  // 她的长发：在身体后面
  const hairCol = mixc(HAIR[who][0], HAIR[who][1], clamp(age * 1.3));
  if (who === 'she' && age < .6) hairBackSide(g, P, R_, u, hairCol, t, wind);
  if (o.scarf && P.scarfTail !== false) scarfTail(g, R_, u, t, wind, true);
  drawArm('F', true);
  drawLeg('F', true);
  drawLeg('N', false);
  // 躯干（上衣）+ 下摆
  torsoSide(g, P, R_, u, o, t, wind);
  // 脖子、头
  g.fillStyle = skinD; capsule(g, S[0], S[1] + .1 * u, .22 * u, R_.N[0], R_.N[1], .2 * u); g.fill();
  if (o.collar) { g.fillStyle = o.collar; ell(g, S[0] + f * .05 * u, S[1] + .05 * u, .38 * u, .16 * u, -f * .3); g.fill(); }
  headSide(g, P, R_, u, skin, hairCol);
  if (o.scarf) scarfSide(g, R_, u, t, wind);
  if (!P.noNear) drawArm('N', false);
  if (P.afterNear) P.afterNear(g, R_);
}

function torsoSide(g, P, R_, u, o, t, wind) {
  const { H, S, td, f, legs } = R_;
  // td 是躯干向上的方向；前方 fr = 把 td 往脸朝的那边转 90 度
  const ang = Math.atan2(td[1], td[0]);
  const fr = [Math.cos(ang + Math.PI / 2 * f), Math.sin(ang + Math.PI / 2 * f)];   // 前方的单位向量
  const she = P.who === 'she';
  const prof = s => {    // s: 0 髋 → 1 肩；返回 [前, 后] 的厚度
    const fwd = she ? lerp(.5, .42, sstep(0, .45, s)) + (s > .45 ? Math.sin((s - .45) / .55 * Math.PI) * .2 : 0)
                    : lerp(.52, .46, sstep(0, .5, s)) + (s > .5 ? Math.sin((s - .5) / .5 * Math.PI) * .12 : 0);
    const bk = she ? lerp(.62, .44, sstep(0, .5, s)) + (s > .6 ? .06 : 0) : lerp(.55, .48, sstep(0, .5, s)) + (s > .6 ? .06 : 0);
    const top = s > .86 ? 1 - Math.pow((s - .86) / .14, 2) * .5 : 1;
    return [fwd * top + (P.age || 0) * .08, bk * top];
  };
  const pts = [], N = 10, len = Math.hypot(S[0] - H[0], S[1] - H[1]);
  for (let i = 0; i <= N; i++) { const s = i / N, [a] = prof(s), p = add(H, td, s * len); pts.push(add(p, fr, a * u)); }
  for (let i = N; i >= 0; i--) { const s = i / N, [, b] = prof(s), p = add(H, td, s * len); pts.push(add(p, fr, -b * u)); }
  // 下摆
  if (o.hem > 0) {
    const kN = legs.N.k, kF = legs.F.k;
    const md = nrm(H, [(kN[0] + kF[0]) / 2, (kN[1] + kF[1]) / 2]);
    const hl = o.hem * u * (o.dress ? 1 : 1);
    const sway = (wind * .5 + Math.sin(t * 2.2 + (P.x || 0) * .01) * .06 * (o.dress ? 1 : .3) * (1 + Math.abs(wind))) * u;
    const spread = Math.max(Math.abs(legs.N.a1 - legs.F.a1), 0) * .005;
    const fl = (o.flare + spread) * u;
    const hc = add(H, md, hl);
    const pr = [md[1] * -1, md[0]];          // 垂直于大腿方向
    const side = (Math.sign(pr[0] * fr[0] + pr[1] * fr[1]) || 1);
    const fwdP = add(hc, pr, side * (.55 * u + fl)), backP = add(hc, pr, -side * (.62 * u + fl));
    const hemPts = [add(H, fr, .55 * u), [fwdP[0] + sway, fwdP[1]], [lerp(fwdP[0], backP[0], .5) + sway * 1.2, lerp(fwdP[1], backP[1], .5) + .08 * u], [backP[0] + sway * 1.3, backP[1] - .05 * u], add(H, fr, -.65 * u)];
    g.fillStyle = o.dress ? (o.skirt || o.top) : o.top;
    g.beginPath(); smoothPath(g, hemPts, true, .35); g.fill();
    if (o.dress) {   // 裙褶
      g.strokeStyle = rgba('#000000', .08); g.lineWidth = .06 * u; g.beginPath();
      for (const k of [.3, .55, .78]) { const a = add(H, fr, lerp(.4, -.5, k) * u), b = [lerp(fwdP[0], backP[0], k) + sway * (1 + k * .3), lerp(fwdP[1], backP[1], k)]; g.moveTo(a[0], a[1]); g.quadraticCurveTo((a[0] + b[0]) / 2 + sway * .3, (a[1] + b[1]) / 2, b[0], b[1]); }
      g.stroke();
    }
  }
  g.fillStyle = o.top; g.beginPath(); smoothPath(g, pts, true, .4); g.fill();
  // 前襟的线、扣子（外套）
  if (o.hem >= 1 && !o.dress) {
    const a = add(add(H, td, len * .92), fr, .3 * u), b = add(H, fr, .5 * u);
    g.strokeStyle = rgba('#000000', .14); g.lineWidth = .05 * u; g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.stroke();
  }
  if (o.dress && o.skirt && o.skirt !== o.top) {   // 腰线
    g.fillStyle = o.skirt; const a = add(H, fr, .5 * u), b = add(H, fr, -.62 * u), c = add(add(H, td, len * .25), fr, -.6 * u), d = add(add(H, td, len * .25), fr, .46 * u);
    poly(g, [a, d, c, b]); g.fill();
  }
}

function headSide(g, P, R_, u, skin, hairCol) {
  const { C, f } = R_, age = P.age || 0, who = P.who;
  const rot = (R_.hd - 180) * D2R * -f;           // 低头：头跟着转
  g.save(); g.translate(C[0], C[1]); g.rotate(rot * .6); g.scale(f, 1);
  if (who === 'she' && age >= .6) { g.fillStyle = shade(hairCol, .93); circ(g, -.92 * u, -.62 * u, .42 * u); g.fill(); }   // 发髻
  // 脸
  g.fillStyle = skin; g.beginPath(); g.ellipse(0, 0, .93 * u, u, 0, 0, TAU); g.fill();
  ell(g, .42 * u, .52 * u, .45 * u, .4 * u); g.fill();                                   // 下巴、脸颊
  g.beginPath(); g.moveTo(.86 * u, -.05 * u); g.quadraticCurveTo(1.08 * u, .16 * u, .9 * u, .26 * u); g.lineTo(.8 * u, .2 * u); g.fill();   // 鼻子
  // 耳朵
  
  // 腮红
  const bl = P.blush ?? .35;
  if (bl > 0) { g.fillStyle = `rgba(236,120,120,${.32 * bl + .1})`; ell(g, .42 * u, .36 * u, .2 * u, .13 * u); g.fill(); }
  // 眼睛
  const ey = P.eyes || 'open', ex = .5 * u, eyY = .02 * u;
  g.fillStyle = '#2B2224'; g.strokeStyle = '#2B2224'; g.lineCap = 'round';
  if (ey === 'closed' || ey === 'down') { g.lineWidth = .07 * u; g.beginPath(); g.arc(ex, eyY - .02 * u, .11 * u, .2, Math.PI - .2); g.stroke(); }
  else if (ey === 'happy') { g.lineWidth = .07 * u; g.beginPath(); g.arc(ex, eyY + .08 * u, .11 * u, Math.PI + .3, -.3); g.stroke(); }
  else {
    const up = ey === 'up' ? -.06 * u : 0;
    ell(g, ex + .03 * u, eyY + up, .075 * u, .13 * u); g.fill();
    g.fillStyle = '#FFFFFF'; circ(g, ex + .055 * u, eyY + up - .05 * u, .025 * u); g.fill();
    if (who === 'she') { g.lineWidth = .045 * u; g.beginPath(); g.moveTo(ex + .06 * u, eyY - .1 * u + up); g.lineTo(ex + .17 * u, eyY - .16 * u + up); g.stroke(); }
  }
  // 眉毛
  g.strokeStyle = shade(hairCol, age > .5 ? .7 : 1); g.lineWidth = .06 * u;
  g.beginPath(); g.moveTo(ex - .1 * u, -.26 * u); g.quadraticCurveTo(ex + .02 * u, -.32 * u, ex + .14 * u, -.27 * u); g.stroke();
  // 嘴
  const m = P.mouth || 'smile';
  g.strokeStyle = '#9C4A4A'; g.lineWidth = .055 * u;
  if (m === 'smile') { g.beginPath(); g.arc(.66 * u, .44 * u, .1 * u, .3, 1.5); g.stroke(); }
  else if (m === 'open' || m === 'o') { g.fillStyle = '#8A3A40'; ell(g, .74 * u, .52 * u, .06 * u, m === 'o' ? .08 * u : .06 * u); g.fill(); }
  else if (m === 'sad') { g.beginPath(); g.arc(.68 * u, .6 * u, .1 * u, -1.4, -.4); g.stroke(); }
  else { g.beginPath(); g.moveTo(.6 * u, .52 * u); g.lineTo(.76 * u, .52 * u); g.stroke(); }
  // 皱纹（老）
  if (age > .5) { g.strokeStyle = rgba('#8A5A4A', .35 * age); g.lineWidth = .035 * u; g.beginPath(); g.moveTo(.68 * u, .1 * u); g.quadraticCurveTo(.75 * u, .03 * u, .8 * u, .08 * u); g.moveTo(.5 * u, .62 * u); g.quadraticCurveTo(.56 * u, .7 * u, .64 * u, .7 * u); g.stroke(); }
  // 头发：盖住头顶和后脑，发际线从额头绕到耳朵后面
  g.fillStyle = hairCol;
  if (who === 'he') {
    g.beginPath(); g.moveTo(.78 * u, -.5 * u);
    g.bezierCurveTo(.55 * u, -1.2 * u, -.55 * u, -1.25 * u, -.98 * u, -.35 * u);
    g.bezierCurveTo(-1.08 * u, .1 * u, -.85 * u, .55 * u, -.6 * u, .66 * u);
    g.lineTo(-.42 * u, .6 * u);
    g.bezierCurveTo(-.38 * u, .3 * u, -.34 * u, .05 * u, -.3 * u, -.12 * u);
    g.bezierCurveTo(0, -.3 * u, .3 * u, -.42 * u, .5 * u, -.38 * u);
    g.quadraticCurveTo(.66 * u, -.36 * u, .78 * u, -.5 * u); g.fill();
    g.beginPath(); g.moveTo(.35 * u, -.78 * u); g.quadraticCurveTo(.95 * u, -.8 * u, 1.0 * u, -.36 * u); g.quadraticCurveTo(.8 * u, -.52 * u, .52 * u, -.46 * u); g.fill();   // 刘海翘起的一撮
  } else {
    g.beginPath(); g.moveTo(.85 * u, -.42 * u);
    g.bezierCurveTo(.65 * u, -1.22 * u, -.6 * u, -1.28 * u, -1.02 * u, -.3 * u);
    g.bezierCurveTo(-1.1 * u, .2 * u, -.9 * u, .7 * u, -.7 * u, age >= .6 ? .62 * u : .9 * u);
    g.lineTo(-.38 * u, age >= .6 ? .55 * u : .85 * u);
    g.bezierCurveTo(-.32 * u, .4 * u, -.34 * u, .05 * u, -.27 * u, -.15 * u);
    g.bezierCurveTo(0, -.35 * u, .4 * u, -.48 * u, .6 * u, -.4 * u);
    g.quadraticCurveTo(.78 * u, -.32 * u, .85 * u, -.42 * u); g.fill();
    g.beginPath(); g.moveTo(.15 * u, -.88 * u); g.quadraticCurveTo(.98 * u, -.85 * u, .94 * u, -.18 * u); g.quadraticCurveTo(.78 * u, -.42 * u, .42 * u, -.44 * u); g.fill();   // 刘海
  }
  if (who === 'he' || age >= .6) { g.fillStyle = shade(skin, .9); ell(g, -.3 * u, .14 * u, .14 * u, .2 * u); g.fill(); }   // 耳朵：压在发际线上
  // 高光
  g.strokeStyle = rgba('#FFFFFF', age > .5 ? .25 : .14); g.lineWidth = .06 * u; g.beginPath(); g.arc(-.15 * u, -.2 * u, .7 * u, -2.3, -1.6); g.stroke();
  // 眼镜（老年的他）
  if (P.glasses || (who === 'he' && age > .6)) {
    g.strokeStyle = '#5A4A40'; g.lineWidth = .05 * u; g.beginPath(); g.ellipse(ex + .05 * u, eyY, .2 * u, .17 * u, 0, 0, TAU); g.moveTo(ex - .15 * u, eyY - .02 * u); g.lineTo(-.15 * u, -.02 * u); g.stroke();
  }
  // 草帽
  if (P.out && P.out.hat) { g.fillStyle = P.out.hat; ell(g, .05 * u, -.62 * u, 1.45 * u, .22 * u, -.05); g.fill(); g.beginPath(); g.ellipse(-.05 * u, -.8 * u, .8 * u, .5 * u, 0, Math.PI, TAU); g.fill(); g.fillStyle = RED; g.fillRect(-.85 * u, -.78 * u, 1.6 * u, .12 * u); }
  g.restore();
}

/* 她的长发（侧面，身体后面）：从后脑勺垂到背上，跟着风和动作飘 */
function hairBackSide(g, P, R_, u, col, t, wind) {
  const { C, f, S } = R_;
  const len = (P.hairLen ?? 3.2) * u;
  const sw = Math.sin(t * 1.7 + (P.x || 0) * .013) * .12 + wind * .9 + (P.hairFly || 0);
  const top = [C[0] - f * .55 * u, C[1] - .65 * u];
  const pts = [];
  for (let i = 0; i <= 6; i++) {
    const k = i / 6;
    const x = C[0] - f * (.75 + k * .45) * u - sw * k * k * u * 1.6 * f * -1 * (wind ? Math.sign(wind) * f : 1) * 0;
    const y = C[1] + (-.3 + k * len / u) * u;
    pts.push([x - (wind * k * k * 1.9 + Math.sin(t * 1.7 + k * 2) * .12 * k) * u * -1, y - Math.abs(wind) * k * k * .9 * u]);
  }
  g.fillStyle = col; g.beginPath();
  g.moveTo(top[0] + f * .9 * u, top[1]);
  g.quadraticCurveTo(top[0] - f * .7 * u, top[1] - .2 * u, pts[0][0] - f * .35 * u, pts[0][1]);
  for (let i = 1; i <= 6; i++) { const k = i / 6, w = (.38 - k * .12) * u; g.lineTo(pts[i][0] - f * w, pts[i][1]); }
  g.quadraticCurveTo(pts[6][0], pts[6][1] + .25 * u, pts[6][0] + f * .22 * u, pts[6][1]);
  for (let i = 5; i >= 0; i--) { const k = i / 6, w = (.32 - k * .1) * u; g.lineTo(pts[i][0] + f * w + f * (1 - k) * .25 * u, pts[i][1]); }
  g.closePath(); g.fill();
  void S;
}

/* 红围巾：侧面，绕脖子一圈 + 后面垂下来一截 */
function scarfSide(g, R_, u, t, wind) {
  const { S, N, f } = R_;
  const c = [(S[0] + N[0]) / 2, (S[1] + N[1]) / 2 + .05 * u];
  g.fillStyle = RED; rr(g, c[0] - .42 * u, c[1] - .2 * u, .84 * u, .42 * u, .2 * u); g.fill();
  g.fillStyle = RED_D; g.fillRect(c[0] - .42 * u, c[1] + .02 * u, .84 * u, .05 * u);
}
function scarfTail(g, R_, u, t, wind, back) {
  const { S, N, f } = R_;
  const c = [(S[0] + N[0]) / 2 - f * .25 * u, (S[1] + N[1]) / 2 + .15 * u];
  const sw = Math.sin(t * 2.4) * .15 + wind * 1.4;
  const pts = [c, [c[0] - f * .25 * u + sw * .4 * u, c[1] + .7 * u], [c[0] - f * .3 * u + sw * 1.1 * u, c[1] + 1.4 * u - Math.abs(wind) * .5 * u]];
  limb(g, pts, [.2 * u, .18 * u, .17 * u], RED);
  g.fillStyle = RED_D; for (let i = -1; i <= 1; i++) { const p = pts[2]; g.fillRect(p[0] + i * .1 * u - .02 * u, p[1] + .12 * u, .04 * u, .12 * u); }
}

/* ---------- 正面 / 背面 ---------- */
function drawFrontBack(g, P, R_, back) {
  const u = R_.u * R_.sc, who = P.who, age = P.age || 0, o = P.out || OUTFIT[who === 'he' ? 'heHome' : 'sheHome'];
  const skin = P.skin || SKIN[who], skinD = shade(skin, .88);
  const t = P.t || 0, wind = P.wind || 0;
  const { H, S, C, arms, legs } = R_;
  const hairCol = mixc(HAIR[who][0], HAIR[who][1], clamp(age * 1.3));
  const legCol = o.pants || o.legs || skin;
  // 她的长发（正面时在身体后面）
  if (who === 'she' && age < .6 && !back) hairBackFront(g, P, R_, u, hairCol, t, wind);
  // 腿
  for (const s of ['N', 'F']) {
    const Lg = legs[s];
    limb(g, [Lg.top, Lg.k, Lg.a], [.38 * u, .3 * u, .22 * u], legCol);
    g.fillStyle = o.shoes; ell(g, Lg.a[0] + Lg.side * .05 * u, Lg.a[1] + .14 * u, .26 * u, .17 * u); g.fill();
  }
  // 胳膊（背面时先画在身体前面？背面胳膊也在身体两侧，同样画在身体后面）
  const drawArmF = s => {
    const A = arms[s];
    limb(g, [A.sh, A.e, A.h], [.33 * u, .29 * u, .25 * u], o.top2 || o.top);
    g.fillStyle = skin; circ(g, A.h[0], A.h[1] + .12 * u, .22 * u); g.fill();
  };
  if (!P.armsFront) { drawArmF('N'); drawArmF('F'); }
  // 躯干：梯形 + 下摆
  const sw = (who === 'she' ? .78 : .9) * u, ww = (who === 'she' ? .58 : .7) * u, hw = (who === 'she' ? .72 : .74) * u;
  const lean = R_.p.lean || 0, lx = (S[0] - H[0]);
  if (o.hem > 0) {
    const hl = o.hem * u, fl = o.flare * u * 1.2, swy = (wind * .5 + Math.sin(t * 2.2) * .05) * u;
    g.fillStyle = o.dress ? (o.skirt || o.top) : o.top;
    g.beginPath(); g.moveTo(H[0] - hw, H[1] - .2 * u); g.lineTo(H[0] + hw, H[1] - .2 * u);
    g.quadraticCurveTo(H[0] + hw + fl * .6, H[1] + hl * .6, H[0] + hw + fl + swy, H[1] + hl);
    g.quadraticCurveTo(H[0] + swy, H[1] + hl + .15 * u, H[0] - hw - fl + swy, H[1] + hl);
    g.quadraticCurveTo(H[0] - hw - fl * .6, H[1] + hl * .6, H[0] - hw, H[1] - .2 * u); g.fill();
  }
  g.fillStyle = o.top; g.beginPath();
  g.moveTo(S[0] - sw, S[1] + .3 * u); g.quadraticCurveTo(S[0] - sw, S[1] - .05 * u, S[0] - sw * .55, S[1] - .02 * u);
  g.lineTo(S[0] + sw * .55, S[1] - .02 * u); g.quadraticCurveTo(S[0] + sw, S[1] - .05 * u, S[0] + sw, S[1] + .3 * u);
  g.quadraticCurveTo(lerp(S[0], H[0], .55) + ww, lerp(S[1], H[1], .55), H[0] + hw, H[1]);
  g.lineTo(H[0] - hw, H[1]); g.quadraticCurveTo(lerp(S[0], H[0], .55) - ww, lerp(S[1], H[1], .55), S[0] - sw, S[1] + .3 * u); g.fill();
  if (!back) {
    if (o.hem >= 1 && !o.dress) { g.strokeStyle = rgba('#000000', .13); g.lineWidth = .05 * u; g.beginPath(); g.moveTo(S[0] + .02 * u, S[1] + .2 * u); g.lineTo(H[0], H[1] + o.hem * u * .95); g.stroke(); g.fillStyle = rgba('#000000', .25); for (let i = 0; i < 3; i++) { circ(g, lerp(S[0], H[0], .3 + i * .25) + .12 * u, lerp(S[1], H[1], .3 + i * .25), .05 * u); g.fill(); } }
    if (o.collar) { g.fillStyle = o.collar; poly(g, [[S[0] - .35 * u, S[1] - .05 * u], [S[0], S[1] + .35 * u], [S[0] + .35 * u, S[1] - .05 * u]]); g.fill(); }
  }
  if (P.armsFront) { drawArmF('N'); drawArmF('F'); }
  // 脖子
  g.fillStyle = skinD; rr(g, R_.N[0] - .2 * u, R_.N[1] - .1 * u, .4 * u, (S[1] - R_.N[1]) + .2 * u, .1 * u); g.fill();
  if (back) headBack(g, P, R_, u, skin, hairCol); else headFront(g, P, C, u, skin, hairCol, R_.tilt || 0);
  if (o.scarf) {
    g.fillStyle = RED; rr(g, S[0] - .5 * u, S[1] - .28 * u, u, .42 * u, .2 * u); g.fill();
    if (!back) { const sw2 = Math.sin(t * 2.4) * .08 + wind * .6; limb(g, [[S[0] + .25 * u, S[1]], [S[0] + .32 * u + sw2 * .3 * u, S[1] + .8 * u], [S[0] + .3 * u + sw2 * u, S[1] + 1.5 * u]], [.17 * u, .16 * u, .15 * u], RED); }
  }
}
function hairBackFront(g, P, R_, u, col, t, wind) {
  const { C } = R_;
  const len = (P.hairLen ?? 3.2) * u, sw = wind * u * .9 + Math.sin(t * 1.6) * .08 * u;
  g.fillStyle = col; g.beginPath();
  g.moveTo(C[0] - .95 * u, C[1] - .2 * u);
  g.bezierCurveTo(C[0] - 1.25 * u, C[1] + len * .4, C[0] - 1.2 * u + sw * .5, C[1] + len * .8, C[0] - .95 * u + sw, C[1] + len);
  g.lineTo(C[0] + .95 * u + sw, C[1] + len);
  g.bezierCurveTo(C[0] + 1.2 * u + sw * .5, C[1] + len * .8, C[0] + 1.25 * u, C[1] + len * .4, C[0] + .95 * u, C[1] - .2 * u);
  g.closePath(); g.fill();
}
/* 正面的脸：o.gaze = [dx, dy] 眼珠往哪看（-1..1） */
function headFront(g, P, C, u, skin, hairCol, tilt = 0) {
  const who = P.who, age = P.age || 0;
  g.save(); g.translate(C[0], C[1]); g.rotate(tilt);
  // 后面的头发（他的短发轮廓）
  g.fillStyle = hairCol;
  if (who === 'he') { ell(g, 0, -.15 * u, 1.04 * u, .98 * u); g.fill(); }
  else { ell(g, 0, -.1 * u, 1.08 * u, 1.04 * u); g.fill(); if (age >= .6) { circ(g, 0, -1.05 * u, .4 * u); g.fill(); } }
  // 耳朵
  g.fillStyle = shade(skin, .92); ell(g, -.93 * u, .12 * u, .16 * u, .22 * u); g.fill(); ell(g, .93 * u, .12 * u, .16 * u, .22 * u); g.fill();
  // 脸
  g.fillStyle = skin; g.beginPath(); g.moveTo(-.92 * u, -.1 * u);
  g.bezierCurveTo(-.95 * u, .55 * u, -.45 * u, .98 * u, 0, .98 * u); g.bezierCurveTo(.45 * u, .98 * u, .95 * u, .55 * u, .92 * u, -.1 * u);
  g.bezierCurveTo(.9 * u, -.95 * u, -.9 * u, -.95 * u, -.92 * u, -.1 * u); g.fill();
  const bl = P.blush ?? .35;
  if (bl > 0) { g.fillStyle = `rgba(236,120,120,${.3 * bl + .1})`; ell(g, -.55 * u, .38 * u, .2 * u, .12 * u); g.fill(); ell(g, .55 * u, .38 * u, .2 * u, .12 * u); g.fill(); }
  // 眼睛
  const ey = P.eyes || 'open', gz = P.gaze || [0, 0];
  const big = who === 'she' ? 1.1 : 1;
  for (const sx of [-1, 1]) {
    const ex = sx * .36 * u, eyY = .08 * u;
    g.fillStyle = '#2B2224'; g.strokeStyle = '#2B2224'; g.lineCap = 'round';
    if (ey === 'closed' || ey === 'down') { g.lineWidth = .07 * u; g.beginPath(); g.arc(ex, eyY - .02 * u, .12 * u, .25, Math.PI - .25); g.stroke(); }
    else if (ey === 'happy') { g.lineWidth = .07 * u; g.beginPath(); g.arc(ex, eyY + .08 * u, .12 * u, Math.PI + .3, -.3); g.stroke(); }
    else {
      const ox = gz[0] * .05 * u, oy = gz[1] * .05 * u + (ey === 'up' ? -.05 * u : 0);
      ell(g, ex + ox, eyY + oy, .095 * u * big, .14 * u * big); g.fill();
      g.fillStyle = '#FFFFFF'; circ(g, ex + ox + .03 * u, eyY + oy - .05 * u, .032 * u * big); g.fill(); circ(g, ex + ox - .03 * u, eyY + oy + .05 * u, .015 * u * big); g.fill();
      if (who === 'she') { g.lineWidth = .045 * u; g.beginPath(); g.moveTo(ex - sx * .02 * u, eyY - .13 * u + oy); g.quadraticCurveTo(ex + sx * .1 * u, eyY - .17 * u + oy, ex + sx * .17 * u, eyY - .1 * u + oy); g.stroke(); }
    }
    // 眉毛
    g.strokeStyle = shade(hairCol, age > .5 ? .7 : 1); g.lineWidth = .06 * u;
    g.beginPath(); g.moveTo(ex - sx * .1 * u, -.22 * u); g.quadraticCurveTo(ex + sx * .03 * u, -.28 * u, ex + sx * .14 * u, -.23 * u + (P.sadBrow ? -.06 * u : 0)); g.stroke();
  }
  // 鼻子、嘴
  g.strokeStyle = rgba('#B07A68', .7); g.lineWidth = .045 * u; g.beginPath(); g.moveTo(0, .24 * u); g.lineTo(-.04 * u, .32 * u); g.stroke();
  const m = P.mouth || 'smile';
  g.strokeStyle = '#9C4A4A'; g.lineWidth = .055 * u;
  if (m === 'smile') { g.beginPath(); g.arc(0, .43 * u, .13 * u, .45, Math.PI - .45); g.stroke(); }
  else if (m === 'open' || m === 'o') { g.fillStyle = '#8A3A40'; ell(g, 0, .55 * u, .09 * u, m === 'o' ? .1 * u : .07 * u); g.fill(); }
  else if (m === 'sad') { g.beginPath(); g.arc(0, .66 * u, .12 * u, Math.PI + .5, -.5); g.stroke(); }
  else { g.beginPath(); g.moveTo(-.1 * u, .56 * u); g.lineTo(.1 * u, .56 * u); g.stroke(); }
  if (age > .5) { g.strokeStyle = rgba('#8A5A4A', .3 * age); g.lineWidth = .035 * u; g.beginPath(); for (const sx of [-1, 1]) { g.moveTo(sx * .58 * u, .05 * u); g.quadraticCurveTo(sx * .66 * u, .1 * u, sx * .64 * u, .2 * u); g.moveTo(sx * .3 * u, .5 * u); g.quadraticCurveTo(sx * .36 * u, .62 * u, sx * .3 * u, .7 * u); } g.stroke(); }
  // 前面的头发
  g.fillStyle = hairCol;
  if (who === 'he') {
    g.beginPath(); g.moveTo(-.98 * u, .05 * u); g.bezierCurveTo(-1.1 * u, -.9 * u, .9 * u, -1.25 * u, 1.0 * u, -.05 * u);
    g.quadraticCurveTo(.9 * u, -.35 * u, .7 * u, -.42 * u); g.quadraticCurveTo(.5 * u, -.3 * u, .25 * u, -.4 * u);
    g.quadraticCurveTo(0, -.25 * u, -.25 * u, -.38 * u); g.quadraticCurveTo(-.55 * u, -.3 * u, -.75 * u, -.4 * u); g.quadraticCurveTo(-.88 * u, -.2 * u, -.98 * u, .05 * u); g.fill();
  } else {
    g.beginPath(); g.moveTo(-1.02 * u, .3 * u); g.bezierCurveTo(-1.2 * u, -1.42 * u, 1.2 * u, -1.42 * u, 1.02 * u, .3 * u);
    g.quadraticCurveTo(.92 * u, -.25 * u, .7 * u, -.4 * u); g.quadraticCurveTo(.38 * u, -.26 * u, .1 * u, -.42 * u);
    g.quadraticCurveTo(-.22 * u, -.26 * u, -.5 * u, -.4 * u); g.quadraticCurveTo(-.86 * u, -.25 * u, -1.02 * u, .3 * u); g.fill();
    if (age < .6) {   // 两边垂下来的头发
      for (const sx of [-1, 1]) { g.beginPath(); g.moveTo(sx * .78 * u, -.25 * u); g.quadraticCurveTo(sx * 1.05 * u, .6 * u, sx * .98 * u, 1.35 * u); g.lineTo(sx * 1.2 * u, 1.3 * u); g.quadraticCurveTo(sx * 1.2 * u, .3 * u, sx * 1.0 * u, -.3 * u); g.fill(); }
    }
  }
  g.strokeStyle = rgba('#FFFFFF', age > .5 ? .25 : .14); g.lineWidth = .06 * u; g.beginPath(); g.arc(.1 * u, -.15 * u, .78 * u, -2.2, -1.3); g.stroke();
  if (P.glasses || (who === 'he' && age > .6)) {
    g.strokeStyle = '#5A4A40'; g.lineWidth = .05 * u; g.beginPath();
    g.ellipse(-.36 * u, .08 * u, .2 * u, .17 * u, 0, 0, TAU); g.moveTo(.56 * u, .08 * u); g.ellipse(.36 * u, .08 * u, .2 * u, .17 * u, 0, 0, TAU);
    g.moveTo(-.16 * u, .06 * u); g.quadraticCurveTo(0, 0, .16 * u, .06 * u); g.stroke();
  }
  if (P.out && P.out.hat) { g.fillStyle = P.out.hat; ell(g, 0, -.68 * u, 1.55 * u, .28 * u); g.fill(); g.beginPath(); g.ellipse(0, -.78 * u, .85 * u, .55 * u, 0, Math.PI, TAU); g.fill(); g.fillStyle = RED; g.fillRect(-.85 * u, -.86 * u, 1.7 * u, .13 * u); }
  g.restore();
}
function headBack(g, P, R_, u, skin, hairCol) {
  const { C } = R_, who = P.who, age = P.age || 0, t = P.t || 0, wind = P.wind || 0;
  g.fillStyle = shade(skin, .92); ell(g, C[0] - .93 * u, C[1] + .12 * u, .16 * u, .22 * u); g.fill(); ell(g, C[0] + .93 * u, C[1] + .12 * u, .16 * u, .22 * u); g.fill();
  g.fillStyle = hairCol;
  if (who === 'he') { ell(g, C[0], C[1] - .05 * u, 1.0 * u, 1.02 * u); g.fill(); }
  else {
    ell(g, C[0], C[1] - .05 * u, 1.05 * u, 1.05 * u); g.fill();
    if (age >= .6) { circ(g, C[0], C[1] - .2 * u, .45 * u); g.fill(); }
    else {
      const len = (P.hairLen ?? 3.2) * u, sw = wind * u * .9 + Math.sin(t * 1.6) * .08 * u;
      g.beginPath(); g.moveTo(C[0] - 1.0 * u, C[1]);
      g.bezierCurveTo(C[0] - 1.15 * u, C[1] + len * .5, C[0] - 1.0 * u + sw * .5, C[1] + len * .85, C[0] - .7 * u + sw, C[1] + len);
      g.quadraticCurveTo(C[0] + sw, C[1] + len + .2 * u, C[0] + .7 * u + sw, C[1] + len);
      g.bezierCurveTo(C[0] + 1.0 * u + sw * .5, C[1] + len * .85, C[0] + 1.15 * u, C[1] + len * .5, C[0] + 1.0 * u, C[1]); g.fill();
    }
  }
  g.strokeStyle = rgba('#FFFFFF', .12); g.lineWidth = .06 * u; g.beginPath(); g.arc(C[0], C[1] - .1 * u, .75 * u, -2.4, -.8); g.stroke();
  if (P.out && P.out.hat) { g.fillStyle = P.out.hat; ell(g, C[0], C[1] - .68 * u, 1.55 * u, .28 * u); g.fill(); g.beginPath(); g.ellipse(C[0], C[1] - .78 * u, .85 * u, .55 * u, 0, Math.PI, TAU); g.fill(); }
}

/* ---------- 红豆、红线 ---------- */
/* 一颗红豆：x, y 中心，r 半长轴，rot 方向；带高光和小白眼（种脐） */
function bean(g, x, y, r, rot = 0, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot);
  if (o.glow) glow(g, 0, 0, r * 4, '#FF5A6A', o.glow);
  g.fillStyle = rgrad(g, -r * .3, -r * .35, r * .1, r * 1.3, [[0, o.light || '#F24B5E'], [.55, RED], [1, RED_D]]);
  ell(g, 0, 0, r, r * .72); g.fill();
  g.fillStyle = 'rgba(255,255,255,.75)'; ell(g, -r * .35, -r * .32, r * .28, r * .14, -.4); g.fill();
  if (r > 4) { g.fillStyle = 'rgba(250,240,230,.85)'; ell(g, r * .45, r * .05, r * .16, r * .09, .3); g.fill(); }
  g.restore();
}
/* 红线：过一串点的平滑曲线 */
function redThread(g, pts, lw = 3, a = 1, glowA = .4) {
  if (a <= .01) return;
  withAlpha(g, a, () => {
    g.save(); g.lineCap = 'round'; g.lineJoin = 'round';
    if (glowA > 0) { g.shadowColor = RED_L; g.shadowBlur = lw * 4; }
    g.strokeStyle = RED; g.lineWidth = lw; g.beginPath(); smoothPath(g, pts); g.stroke();
    g.restore();
  });
}

/* 半身像（正面大特写）：x, y 是脸的中心，u 是头的半径。P 同 person（who、age、out、eyes、mouth、blush、gaze、tilt、t、wind、light）。
   肩膀、脖子、衣领、围巾、长发都画上；打光和 person 一样，先画到离屏画布 */
function bust(g, x, y, u, P) {
  const half = Math.ceil(u * 3.2);
  const fc = figCanvas(half * 2), c = fc.c, fg = fc.g, k = c.width / (half * 2);
  const ox = x - half, oy = y - half * .62;
  fg.setTransform(1, 0, 0, 1, 0, 0); fg.clearRect(0, 0, c.width, c.height);
  fg.setTransform(k, 0, 0, k, -ox * k, -oy * k);
  const who = P.who, age = P.age || 0, o = P.out || OUTFIT[who === 'he' ? 'heHome' : 'sheHome'];
  const skin = SKIN[who], hairCol = mixc(HAIR[who][0], HAIR[who][1], clamp(age * 1.3)), t = P.t || 0, wind = P.wind || 0;
  const tilt = (P.tilt || 0), sh = P.shoulder || 0;          // sh：肩膀往一边转（-1..1），转身看人
  const S = [x - tilt * u * 1.2 + sh * u * .3, y + 1.55 * u];
  // 她的长发在后面
  if (who === 'she' && age < .6) {
    const len = 3.4 * u, sw = wind * u + Math.sin(t * 1.4) * .06 * u;
    fg.fillStyle = shade(hairCol, .9); fg.beginPath();
    fg.moveTo(x - 1.0 * u, y - .3 * u); fg.bezierCurveTo(x - 1.45 * u, y + len * .4, x - 1.5 * u + sw * .5, y + len * .8, x - 1.25 * u + sw, y + len);
    fg.lineTo(x + 1.25 * u + sw, y + len); fg.bezierCurveTo(x + 1.5 * u + sw * .5, y + len * .8, x + 1.45 * u, y + len * .4, x + 1.0 * u, y - .3 * u); fg.fill();
  }
  // 肩膀和上衣
  const sw2 = (who === 'she' ? 1.75 : 1.95) * u;
  fg.fillStyle = o.top; fg.beginPath();
  fg.moveTo(S[0] - sw2 * 1.15, S[1] + 2.4 * u);
  fg.bezierCurveTo(S[0] - sw2 * 1.1, S[1] + .4 * u, S[0] - sw2 * .9, S[1] - .05 * u, S[0] - .4 * u, S[1] - .1 * u);
  fg.lineTo(S[0] + .4 * u, S[1] - .1 * u);
  fg.bezierCurveTo(S[0] + sw2 * .9, S[1] - .05 * u, S[0] + sw2 * 1.1, S[1] + .4 * u, S[0] + sw2 * 1.15, S[1] + 2.4 * u); fg.fill();
  fg.fillStyle = rgba('#000000', .08); fg.beginPath(); fg.moveTo(S[0] + sh * sw2 * .5, S[1] + .3 * u); fg.lineTo(S[0] + sh * sw2 * .6, S[1] + 2.4 * u); fg.lineWidth = .06 * u; fg.strokeStyle = rgba('#000000', .1); fg.stroke();
  // 脖子
  fg.fillStyle = shade(skin, .88); rr(fg, x - tilt * u * .6 - .3 * u, y + .6 * u, .6 * u, S[1] - y - .4 * u, .2 * u); fg.fill();
  if (o.collar) { fg.fillStyle = o.collar; poly(fg, [[S[0] - .55 * u, S[1] - .12 * u], [S[0], S[1] + .5 * u], [S[0] + .55 * u, S[1] - .12 * u], [S[0] + .3 * u, S[1] - .2 * u], [S[0], S[1] + .2 * u], [S[0] - .3 * u, S[1] - .2 * u]]); fg.fill(); }
  else { fg.fillStyle = o.top2 || shade(o.top, .9); ell(fg, S[0], S[1] - .05 * u, .5 * u, .16 * u); fg.fill(); }
  if (o.scarf) {
    fg.fillStyle = RED; rr(fg, S[0] - .85 * u, S[1] - .45 * u, 1.7 * u, .65 * u, .3 * u); fg.fill();
    fg.fillStyle = RED_D; fg.fillRect(S[0] - .8 * u, S[1] - .1 * u, 1.6 * u, .06 * u);
    limb(fg, [[S[0] + .45 * u, S[1]], [S[0] + .55 * u, S[1] + .9 * u], [S[0] + .5 * u + wind * .3 * u, S[1] + 1.8 * u]], [.28 * u, .26 * u, .25 * u], RED);
  }
  headFront(fg, P, [x, y], u, skin, hairCol, tilt);
  if (who === 'she' && age < .6) {   // 前面垂下来的头发
    fg.fillStyle = hairCol;
    for (const sx of [-1, 1]) { const sw3 = wind * .6 * u; fg.beginPath(); fg.moveTo(x + sx * .85 * u, y - .2 * u); fg.quadraticCurveTo(x + sx * 1.2 * u, y + .8 * u, x + sx * 1.05 * u + sw3, y + 2.3 * u); fg.lineTo(x + sx * 1.4 * u + sw3, y + 2.2 * u); fg.quadraticCurveTo(x + sx * 1.35 * u, y + .3 * u, x + sx * 1.0 * u, y - .4 * u); fg.fill(); }
  }
  if (P.afterBust) P.afterBust(fg);
  fg.setTransform(1, 0, 0, 1, 0, 0);
  const Lt = P.light || {};
  if (Lt.amb) { fg.globalCompositeOperation = 'source-atop'; fg.fillStyle = rgba(Lt.amb, Lt.ambA ?? .25); fg.fillRect(0, 0, c.width, c.height); }
  const ld = Lt.dir ?? 1, shd = Lt.shade ?? .14;
  if (shd > 0) { fg.globalCompositeOperation = 'source-atop'; const cx = (x - ox) * k; fg.fillStyle = lgrad(fg, cx + ld * u * k, 0, cx - ld * u * 2 * k, 0, [[0, 'rgba(30,20,50,0)'], [1, `rgba(30,20,50,${shd})`]]); fg.fillRect(0, 0, c.width, c.height); }
  if (Lt.rim) {
    const c2 = fc.c2, g2 = fc.g2;
    g2.setTransform(1, 0, 0, 1, 0, 0); g2.globalCompositeOperation = 'copy'; g2.drawImage(c, 0, 0);
    g2.globalCompositeOperation = 'destination-out'; g2.drawImage(c, -ld * u * .06 * k, u * .02 * k);
    g2.globalCompositeOperation = 'source-in'; g2.fillStyle = Lt.rim; g2.fillRect(0, 0, c2.width, c2.height);
    fg.globalCompositeOperation = 'source-atop'; fg.globalAlpha = Lt.rimA ?? .6; fg.drawImage(c2, 0, 0); fg.globalAlpha = 1;
  }
  fg.globalCompositeOperation = 'source-over';
  g.save(); g.globalAlpha *= P.alpha ?? 1; g.drawImage(c, ox, oy, half * 2, half * 2); g.restore();
}

/* 连指的手（绘本风）：x, y 手腕，ang 指尖朝向，sc（sc=1 手长约 125）。
   o: sleeve 袖子，skin，flip 拇指换到另一边，fist 握拳（指节一排），pinky 小指伸出来勾着（0..1 勾多少），
      cup 手心朝上捧着（从上往下看），palm 手心那面（浅一点），thumbUp 拇指翘起的角度。返回 { pinkyTip, pinkyMid, tip, grip }（调用者坐标） */
function mitt(g, x, y, sc, ang, o = {}) {
  const skin = o.skin || SKIN.she, fl = o.flip ? -1 : 1, out = {};
  g.save(); g.translate(x, y); g.rotate(ang); g.scale(sc, sc * fl);
  const M = g.getTransform();
  if (o.sleeve) { g.fillStyle = o.sleeve; rr(g, -170, -46, 175, 92, 30); g.fill(); g.fillStyle = shade(o.sleeve, .86); rr(g, -14, -48, 22, 96, 10); g.fill(); }
  const sk2 = shade(skin, .9);
  if (o.cup) {
    // 手心朝上：手掌是个浅碗，四个指头尖在远端排成一排，拇指在一边
    g.fillStyle = sk2; ell(g, 62, 0, 62, 50); g.fill();
    g.fillStyle = skin; ell(g, 58, 0, 54, 44); g.fill();
    g.fillStyle = shade(skin, 1.05); ell(g, 52, 4, 30, 24); g.fill();
    g.strokeStyle = rgba('#B07A68', .35); g.lineWidth = 3; g.beginPath(); g.arc(40, 22, 34, -1.6, -.5); g.stroke();
    for (let i = 0; i < 4; i++) { const yy = -33 + i * 22; g.fillStyle = i % 2 ? skin : shade(skin, .97); ell(g, 118 - Math.abs(i - 1.5) * 6, yy, 22, 12, 0); g.fill(); g.fillStyle = rgba('#FFFFFF', .3); ell(g, 126 - Math.abs(i - 1.5) * 6, yy - 3, 7, 4); g.fill(); }
    g.fillStyle = sk2; capsule(g, 20, -44, 16, 70, -62, 13); g.fill();
    out.tip = [60, 0];
  } else if (o.fist) {
    // 握拳：方圆的一块，指节一排小鼓包，拇指压在前面
    g.fillStyle = skin; rr(g, -4, -42, 98, 84, 32); g.fill();
    g.fillStyle = sk2; for (let i = 0; i < 4; i++) { circ(g, 90, -28 + i * 19, 11); g.fill(); }
    g.fillStyle = skin; for (let i = 0; i < 4; i++) { circ(g, 86, -28 + i * 19, 10.5); g.fill(); }
    g.strokeStyle = rgba('#A0705E', .35); g.lineWidth = 2.5; g.beginPath(); for (let i = 1; i < 4; i++) { g.moveTo(66, -37 + i * 19); g.lineTo(92, -37 + i * 19); } g.stroke();
    if (o.pinky != null) {
      // 小指伸出来、勾起来
      const p = clamp(o.pinky), a1 = .25 - p * .1, a2 = a1 - p * 1.6;
      const b = [82, 30], m = [b[0] + Math.cos(a1) * 34, b[1] + Math.sin(a1) * 34], t = [m[0] + Math.cos(a2) * 28, m[1] + Math.sin(a2) * 28];
      g.fillStyle = skin; capsule(g, b[0], b[1], 10, m[0], m[1], 9.5); g.fill(); capsule(g, m[0], m[1], 9.5, t[0], t[1], 9); g.fill();
      out.pinkyMid = m; out.pinkyTip = t; out.pinkyBase = b;
    }
    g.fillStyle = sk2; capsule(g, 20, -40, 15, 74, -44 + (o.thumbUp || 0), 13); g.fill();
    g.fillStyle = skin; capsule(g, 22, -38, 13.5, 72, -42 + (o.thumbUp || 0), 11.5); g.fill();
    out.grip = [50, 0];
  } else {
    // 张开：手掌和四指连成一块（指尖分开一点），拇指单独
    g.fillStyle = sk2; capsule(g, 24, -32, 15, 66 + (o.thumbIn || 0) * 10, -66 + (o.thumbIn || 0) * 30, 13); g.fill();
    g.fillStyle = o.palm ? shade(skin, 1.03) : skin;
    g.beginPath(); g.moveTo(0, -36); g.lineTo(70, -40); g.quadraticCurveTo(128, -40, 130, -12); g.quadraticCurveTo(132, 14, 124, 30); g.quadraticCurveTo(110, 42, 70, 40); g.lineTo(0, 34); g.closePath(); g.fill();
    g.strokeStyle = rgba('#A0705E', .3); g.lineWidth = 2.5; g.beginPath(); for (const yy of [-18, 2, 20]) { g.moveTo(104, yy); g.lineTo(128, yy * 1.05); } g.stroke();
    g.fillStyle = rgba('#FFFFFF', .25); ell(g, 118, -24, 8, 5); g.fill();
    out.tip = [128, 0]; out.pinkyMid = [108, 30];
  }
  g.restore();
  const tf = ([px, py]) => { const X = M.a * px + M.c * py + M.e, Y = M.b * px + M.d * py + M.f; const G = g.getTransform().inverse(); return [G.a * X + G.c * Y + G.e, G.b * X + G.d * Y + G.f]; };
  for (const k in out) out[k] = tf(out[k]);
  return out;
}

/* 只画一个侧面的头（特写用）：x, y 头的中心，u 头半径，rot 整个头转多少（弧度），P.f 朝向 */
function headAt(g, x, y, u, rot, P) {
  const who = P.who, age = P.age || 0;
  const skin = SKIN[who], hairCol = mixc(HAIR[who][0], HAIR[who][1], clamp(age * 1.3));
  g.save(); g.translate(x, y); g.rotate(rot);
  headSide(g, P, { C: [0, 0], f: P.f || 1, hd: 180 }, u, skin, hairCol);
  g.restore();
}
