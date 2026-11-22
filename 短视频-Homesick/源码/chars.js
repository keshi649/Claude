'use strict';
/* chars.js：两个主角的全身像素人。
   他：高、肩宽、腿长；驼色长大衣 + 黑高领 + 炭灰西裤 + 黑皮鞋，左手腕一块银表；黑发，偏分的逗号刘海。
   她：修长、腰细、腿长；深棕长卷发，酒红缎面吊带裙（生日那晚）/ 米色收腰风衣，珍珠耳环，细高跟。
   画法：部件是多边形，先写进"角色图层"（每个像素记材质、部件号、色阶），画完按场景的光统一上色：
   迎光一侧亮一条、背光一侧暗一条、外轮廓用同色系的深色描（背光侧更深），逆光时轮廓换成光的颜色。 */

/* ---------------- 角色图层 ---------------- */
const LM = new Uint8Array(W * H), LP = new Uint8Array(W * H), LV = new Int8Array(W * H);
const LB = { x0: W, y0: H, x1: -1, y1: -1 };
let LCUR = 1;
function lbegin() {
  if (LB.x1 >= 0) for (let y = LB.y0; y <= LB.y1; y++) { LM.fill(0, y * W + LB.x0, y * W + LB.x1 + 1); LP.fill(0, y * W + LB.x0, y * W + LB.x1 + 1); }
  LB.x0 = W; LB.y0 = H; LB.x1 = -1; LB.y1 = -1; LCUR = 1;
}
const lpart = () => (LCUR = Math.min(255, LCUR + 1));
function lspan(x0, x1, y, m, lev) {
  if (y < 0 || y >= H) return; if (x0 < 0) x0 = 0; if (x1 > W - 1) x1 = W - 1; if (x1 < x0) return;
  const o = y * W;
  if (m) { LM.fill(m, o + x0, o + x1 + 1); LP.fill(LCUR, o + x0, o + x1 + 1); LV.fill(lev, o + x0, o + x1 + 1); }
  else LM.fill(0, o + x0, o + x1 + 1);
  if (x0 < LB.x0) LB.x0 = x0; if (x1 > LB.x1) LB.x1 = x1; if (y < LB.y0) LB.y0 = y; if (y > LB.y1) LB.y1 = y;
}
const lpoly = (pts, m, lev = -1) => rasterPoly(pts, (a, b, y) => lspan(a, b, y, m, lev));
const lell = (cx, cy, rx, ry, m, lev = -1) => rasterEll(cx, cy, rx, ry, (a, b, y) => lspan(a, b, y, m, lev));
const lcap = (x0, y0, r0, x1, y1, r1, m, lev = -1) => lpoly(capsulePts(x0, y0, r0, x1, y1, r1), m, lev);
function lrect(x, y, w, h, m, lev = -1) { x = Math.round(x); y = Math.round(y); for (let j = 0; j < Math.round(h); j++) lspan(x, x + Math.round(w) - 1, y + j, m, lev); }
const lpx = (x, y, m, lev = -1) => lspan(Math.floor(x), Math.floor(x), Math.floor(y), m, lev);
/* 只改已经画了东西的像素（画在衣服上的阴影、纹理），不往外扩 */
function lpolyOn(pts, m, lev, onlyMat) {
  rasterPoly(pts, (a, b, y) => {
    for (let x = Math.max(0, a); x <= Math.min(W - 1, b); x++) {
      const i = y * W + x; if (!LM[i]) continue; if (onlyMat && LM[i] !== onlyMat) continue;
      if (m) LM[i] = m; LV[i] = lev;
    }
  });
}

/* ---------------- 材质 ---------------- */
const MAT = [null];
function defMat(name, base, o = {}) {
  MAT.push({ name, r: o.r || ramp(base, o), flat: !!o.flat, out: o.out ?? 1, inner: o.inner ?? 1, emit: !!o.emit, rimk: o.rimk ?? 1 });
  return MAT.length - 1;
}
const M = {
  skin: defMat('skin', hx('#F3CDB2'), { cool: 22, warm: 6 }),
  skinS: defMat('skinS', hx('#F3CDB2'), { flat: true, out: 0, inner: 0 }),
  hairHe: defMat('hairHe', hx('#23232E'), { r: [hx('#0B0B12'), hx('#121219'), hx('#1A1A24'), hx('#26283A'), hx('#3E4562'), hx('#6C7698')] }),
  hairShe: defMat('hairShe', hx('#4A2E26'), { r: [hx('#170C0B'), hx('#24130F'), hx('#341D17'), hx('#4A2E26'), hx('#7A4E3C'), hx('#B98468')] }),
  coat: defMat('coat', hx('#A87D55'), { cool: 20 }),
  turtle: defMat('turtle', hx('#26262E'), { r: [hx('#0C0C10'), hx('#121217'), hx('#1A1A21'), hx('#26262E'), hx('#3A3B48'), hx('#575A6C')] }),
  pants: defMat('pants', hx('#3B3E49')),
  shoe: defMat('shoe', hx('#1E1C22'), { r: [hx('#08070A'), hx('#0F0E12'), hx('#16151A'), hx('#1E1C22'), hx('#3A3842'), hx('#8A8796')] }),
  watch: defMat('watch', hx('#C9CED8'), { flat: true }),
  shirt: defMat('shirt', hx('#ECE8E2'), { cool: 26 }),
  suit: defMat('suit', hx('#2E3652')),
  tie: defMat('tie', hx('#5B2232')),
  dress: defMat('dress', hx('#7E1E36'), { r: [hx('#2A0710'), hx('#430B1B'), hx('#5E1227'), hx('#7E1E36'), hx('#A8344F'), hx('#E07A90')] }),
  trench: defMat('trench', hx('#CDB592'), { cool: 22 }),
  knit: defMat('knit', hx('#EFE6D6'), { cool: 24 }),
  cardi: defMat('cardi', hx('#E7D9C3'), { cool: 24 }),
  heel: defMat('heel', hx('#2A1A1F'), { r: [hx('#0A0507'), hx('#14090C'), hx('#1E1015'), hx('#2A1A1F'), hx('#5A3A44'), hx('#B08A96')] }),
  pearl: defMat('pearl', hx('#F4F0EA'), { flat: true, out: 0 }),
  eye: defMat('eye', hx('#1B1316'), { flat: true, out: 0, inner: 0 }),
  eyeW: defMat('eyeW', hx('#F6F1EE'), { flat: true, out: 0, inner: 0 }),
  iris: defMat('iris', hx('#4A2C22'), { flat: true, out: 0, inner: 0 }),
  lip: defMat('lip', hx('#C65B68'), { flat: true, out: 0, inner: 0 }),
  lipHe: defMat('lipHe', hx('#C98E86'), { flat: true, out: 0, inner: 0 }),
  blush: defMat('blush', hx('#EBA59E'), { flat: true, out: 0, inner: 0 }),
  brow: defMat('brow', hx('#1E1A22'), { flat: true, out: 0, inner: 0 }),
  belt: defMat('belt', hx('#A88C64')),
  bag: defMat('bag', hx('#5A2A2E')),
  umb: defMat('umb', hx('#22252E')),
  scarf: defMat('scarf', hx('#8E2438')),
  white: defMat('white', hx('#F7F4EE'), { flat: true }),
  phone: defMat('phone', hx('#1A1C24'), { flat: true }),
  screen: defMat('screen', hx('#BFD7FF'), { flat: true, out: 0, emit: true }),
  gift: defMat('gift', hx('#E9E2D6')),
  ribbon: defMat('ribbon', hx('#9A2338'), { flat: true }),
  sweat: defMat('sweat', hx('#4B5266')),
  apron: defMat('apron', hx('#D9CBB2')),
  case: defMat('case', hx('#BFC3CC')),
};

/* 上色：把角色图层按光照写进当前帧缓冲
   o.lx/ly：朝主光的方向；o.sd：暗面宽度（像素）；o.amb：环境色乘子 [r,g,b]；
   o.rim：{c, x, y, k} 逆光/侧光的轮廓光（x,y 是光从哪边来，±1）；o.a：整体不透明度；o.wet：湿身的高光 */
function lresolve(o = {}) {
  if (LB.x1 < 0) return;
  const lx = o.lx ?? -.55, ly = o.ly ?? -.85, sd = o.sd ?? 2, hl = o.hl ?? 1;
  const amb = o.amb || [1, 1, 1], add = o.add || [0, 0, 0], a = o.a ?? 1;
  const rim = o.rim, rim2 = o.rim2;
  const sx = Math.round(lx * 1.4), sy = Math.round(ly * 1.4);
  const same = (x, y, p) => x >= 0 && y >= 0 && x < W && y < H && LM[y * W + x] && LP[y * W + x] === p;
  const empty = (x, y) => x < 0 || y < 0 || x >= W || y >= H || !LM[y * W + x];
  for (let y = LB.y0; y <= LB.y1; y++) for (let x = LB.x0; x <= LB.x1; x++) {
    const i = y * W + x, m = LM[i]; if (!m) continue;
    const Mt = MAT[m], p = LP[i];
    let lev = LV[i];
    if (lev < 0) {
      lev = 3;
      if (!Mt.flat) {
        let lit = false;
        for (let k = 1; k <= hl; k++) if (!same(x + Math.round(lx * k), y + Math.round(ly * k), p)) { lit = true; break; }
        if (lit) lev = 4;
        else for (let k = 1; k <= sd; k++) if (!same(x - Math.round(lx * k), y - Math.round(ly * k), p)) { lev = (o.deep && k <= Math.max(1, sd / 3)) ? 1 : 2; break; }
      }
    }
    let col = Mt.r[lev];
    if (Mt.out && (empty(x - 1, y) || empty(x + 1, y) || empty(x, y - 1) || empty(x, y + 1))) {
      col = Mt.r[empty(x + sx, y + sy) ? 1 : 0];
    } else if (Mt.inner) {
      for (const j of [i - 1, i + 1, i - W, i + W]) {
        if (j < 0 || j >= W * H) continue;
        const mj = LM[j];
        if (mj && LP[j] < p && MAT[mj].inner) { col = Mt.r[Math.max(0, Math.min(lev, 2) - 1)]; break; }
      }
    }
    let r = cR(col), g = cG(col), b = cB(col);
    if (!Mt.emit) { r = r * amb[0] + add[0]; g = g * amb[1] + add[1]; b = b * amb[2] + add[2]; }
    for (const R of [rim, rim2]) {
      if (!R || Mt.emit) continue;
      const w = R.w || 1; let on = false;
      for (let k = 1; k <= w; k++) if (empty(x + R.x * k, y + R.y * k)) { on = true; break; }
      if (on) { const kk = R.k * Mt.rimk; r += (cR(R.c) - r * .3) * kk; g += (cG(R.c) - g * .3) * kk; b += (cB(R.c) - b * .3) * kk; }
    }
    const q = i << 2;
    if (a >= 1) { B[q] = r; B[q + 1] = g; B[q + 2] = b; }
    else { B[q] += (r - B[q]) * a; B[q + 1] += (g - B[q + 1]) * a; B[q + 2] += (b - B[q + 2]) * a; }
  }
}
/* 剪影：只用一种颜色画出图层的形状（倒影、影子、窗上的人影） */
function lsil(c, a = 1, dy = 0, flipY = null, mode = 0) {
  for (let y = LB.y0; y <= LB.y1; y++) for (let x = LB.x0; x <= LB.x1; x++) {
    if (!LM[y * W + x]) continue;
    const yy = flipY === null ? y + dy : Math.round(2 * flipY - y);
    px(x, yy, c, a, mode);
  }
}

/* ---------------- 骨架 ---------------- */
// 全身比例：u = 身高/8（一个头高）。他头身比 8，她 8（加高跟）
const BODY = {
  he: { head: 1, hw: .78, sh: 1.08, chest: .74, waist: .6, hip: .64, hipJ: 6.75 - 2.6, thigh: 1.98, shin: 1.92, upper: 1.42, fore: 1.22, hand: .52, neck: .32, legR: [.38, .27, .2] },
  she: { head: 1, hw: .72, sh: .86, chest: .7, waist: .46, hip: .8, hipJ: 6.78 - 2.62, thigh: 2.0, shin: 1.96, upper: 1.34, fore: 1.15, hand: .44, neck: .27, legR: [.36, .22, .14] },
};
function rotv(x, y, a) { const c = Math.cos(a), s = Math.sin(a); return [x * c - y * s, x * s + y * c]; }

/* 姿势：side 视角下各关节角度。返回值都是弧度。
   th：大腿与竖直的夹角（向前为正）；kn：膝盖往后弯多少；ft：脚掌抬起多少
   ua：上臂与竖直夹角（向前为正）；el：肘往前弯多少 */
function walkPose(ph, k = 1) {
  const s = Math.sin(TAU * ph), s2 = Math.sin(TAU * (ph + .5));
  const knee = q => .06 + .62 * Math.pow(Math.max(0, Math.sin(TAU * q + 2.35)), 1.5);
  return {
    lean: .05 * k, bob: -Math.abs(Math.cos(TAU * ph)) * .07 * k + .07 * k,
    nTh: .42 * s * k, nKn: knee(ph) * k, fTh: .42 * s2 * k, fKn: knee(ph + .5) * k,
    nUa: -.34 * s * k, nEl: .22 + .14 * Math.max(0, s) * k, fUa: -.34 * s2 * k, fEl: .22 + .14 * Math.max(0, s2) * k,
    nFt: Math.max(0, -Math.sin(TAU * ph + .6)) * .5 * k, fFt: Math.max(0, -Math.sin(TAU * (ph + .5) + .6)) * .5 * k,
  };
}
function runPose(ph, k = 1) {
  const s = Math.sin(TAU * ph), s2 = Math.sin(TAU * (ph + .5));
  const knee = q => .25 + 1.35 * Math.pow(Math.max(0, Math.sin(TAU * q + 2.0)), 1.2);
  return {
    lean: .2 * k, bob: -Math.max(0, Math.sin(TAU * ph * 2 + 1.2)) * .22 * k + .1,
    nTh: .72 * s * k + .1, nKn: knee(ph) * k, fTh: .72 * s2 * k + .1, fKn: knee(ph + .5) * k,
    nUa: -.75 * s * k, nEl: 1.35, fUa: -.75 * s2 * k, fEl: 1.35,
    nFt: Math.max(0, -Math.sin(TAU * ph + .4)) * .7, fFt: Math.max(0, -Math.sin(TAU * (ph + .5) + .4)) * .7,
  };
}
const standPose = (t = 0) => ({ lean: .0, bob: Math.sin(t * 1.7) * .02, nTh: .03, nKn: .02, fTh: -.04, fKn: .03, nUa: .06 + Math.sin(t * 1.7) * .02, nEl: .14, fUa: -.04, fEl: .12, nFt: 0, fFt: 0 });
const sitPose = (t = 0) => ({ lean: .06, bob: 0, nTh: 1.5, nKn: 1.42, fTh: 1.46, fKn: 1.36, nUa: .55, nEl: .9, fUa: .5, fEl: .95, nFt: 0, fFt: 0, sit: true });

/* ---------------- 侧面全身 ---------------- */
/* o: who('he'|'she'), fit(衣服), x, y(脚底), h(身高), dir(1 朝右 / -1 朝左), pose, t, headTilt, look,
   hold(手里拿的东西), wet, blink, hairWind */
function figSide(o) {
  const who = o.who, Bd = BODY[who], h = o.h, u = h / 8, d = o.dir || 1, P = o.pose || standPose(o.t || 0);
  const gx = o.x, gy = o.y;
  const X = v => gx + v * d;                 // 前后（u 单位已乘）
  const sitY = P.sit ? (o.seat ?? 2.2) : 0;
  const pel = [gx + (P.dx || 0) * u * d, gy - (P.sit ? (sitY + .28) * u : (Bd.hipJ + (P.bob || 0)) * u)];
  const lean = P.lean || 0;
  const up = (len, extra = 0) => { const [vx, vy] = rotv(0, -len * u, (lean + extra) * d); return [vx, vy]; };
  const sv = up(2.6), sh = [pel[0] + sv[0], pel[1] + sv[1]];             // 肩
  const nv = up(.42), nk = [sh[0] + nv[0] + .06 * u * d, sh[1] + nv[1]];   // 脖子顶
  const tilt = (o.headTilt || 0) + lean * .5;
  const hc = [nk[0] + .1 * u * d + Math.sin(tilt * d) * .5 * u, nk[1] - .55 * u * Math.cos(tilt)]; // 头中心
  const leg = (th, kn, ft) => {
    const L1 = Bd.thigh * u, L2 = Bd.shin * u;
    const k = [pel[0] + Math.sin(th) * L1 * d, pel[1] + Math.cos(th) * L1];
    const a = [k[0] + Math.sin(th - kn) * L2 * d, k[1] + Math.cos(th - kn) * L2];
    return { k, a, ft };
  };
  const nL = leg(P.nTh, P.nKn, P.nFt || 0), fL = leg(P.fTh, P.fKn, P.fFt || 0);
  // 站着时脚踩在地面：把整个人按较低那只脚校正
  if (!P.sit && !P.air) {
    const low = Math.max(nL.a[1], fL.a[1]) + (who === 'she' ? .38 : .2) * u, dy = gy - low;
    for (const p of [pel, sh, nk, hc, nL.k, nL.a, fL.k, fL.a]) p[1] += dy;
  }
  const arm = (ua, el) => {
    const sj = [sh[0] - .06 * u * d, sh[1] + .16 * u];
    const L1 = Bd.upper * u, L2 = Bd.fore * u, a1 = ua + lean;
    const e = [sj[0] + Math.sin(a1) * L1 * d, sj[1] + Math.cos(a1) * L1];
    const w = [e[0] + Math.sin(a1 + el) * L2 * d, e[1] + Math.cos(a1 + el) * L2];
    return { sj, e, w, ang: a1 + el };
  };
  const nA = arm(P.nUa, P.nEl), fA = arm(P.fUa, P.fEl);
  if (o.armN) Object.assign(nA, o.armN(nA, { sh, u, d })); // 特殊动作（拿手机、伸手）
  if (o.armF) Object.assign(fA, o.armF(fA, { sh, u, d }));
  const J = { pel, sh, nk, hc, nL, fL, nA, fA, u, d, tilt };
  const fit = o.fit || (who === 'he' ? 'coat' : 'dress');

  // 画的顺序：远处的手臂、头发后片 → 远腿 → 近腿 → 身体（衣服盖住大腿）→ 近处手臂 → 头
  if (who === 'she') { lpart(); hairSheBack(J, o); }
  lpart(); drawArmSide(J, fA, who, fit, true, o);
  lpart(); drawLegSide(J, fL, who, fit, true, o);
  lpart(); drawLegSide(J, nL, who, fit, false, o);
  lpart(); drawTorsoSide(J, who, fit, o);
  lpart(); drawArmSide(J, nA, who, fit, false, o);
  // 头：用特写的画法（三分之四侧脸，朝前进方向）
  const hs = u * (who === 'she' ? 1.04 : 1.02);
  const hp = [hc[0] + .02 * u * d, hc[1] + .02 * u];
  if (who === 'he') bustHe({ keep: 1, headOnly: 1, x: hp[0], y: hp[1], s: hs, d, t: o.t, exp: o.exp || {}, gaze: o.gaze, tilt: J.tilt * d * .6, wind: o.hairWind });
  else bustShe({ keep: 1, headOnly: 1, x: hp[0], y: hp[1], s: hs, d, t: o.t, exp: o.exp || {}, gaze: o.gaze, tilt: J.tilt * d * .6, wind: o.hairWind });
  return J;
}

function drawLegSide(J, L, who, fit, far, o) {
  const { pel, u, d } = J, R = BODY[who].legR;
  const k = L.k, a = L.a;
  const bare = who === 'she' && (fit === 'dress' || fit === 'trench' || fit === 'home');
  const mt = who === 'he' ? (fit === 'suit' ? M.suit : M.pants) : (bare ? M.skin : M.pants);
  // 大腿、小腿
  lcap(pel[0] - .05 * u * d, pel[1], R[0] * u, k[0], k[1], R[1] * u * 1.05, who === 'she' && bare ? M.skin : mt);
  lcap(k[0], k[1], R[1] * u, a[0], a[1], R[2] * u, mt);
  if (who === 'he' && !bare) { // 裤脚盖住一点鞋面
    lcap(a[0], a[1] - .15 * u, R[2] * u * 1.15, a[0] + .05 * u * d, a[1] + .12 * u, R[2] * u * 1.2, mt);
  }
  // 鞋
  const ft = L.ft || 0;
  if (who === 'he') {
    const toe = [a[0] + Math.cos(ft) * .78 * u * d, a[1] + .2 * u - Math.sin(ft) * .5 * u];
    const heel = [a[0] - .22 * u * d, a[1] + .26 * u];
    const pts = new Path().m(heel[0], heel[1] - .38 * u).l(a[0] + .12 * u * d, a[1] - .05 * u)
      .q(toe[0] - .2 * u * d, toe[1] - .3 * u, toe[0], toe[1] - .02 * u, 5).l(toe[0] - .05 * u * d, toe[1] + .12 * u)
      .l(heel[0], heel[1] + .1 * u).pts();
    lpoly(pts, M.shoe);
    lpx(toe[0] - .35 * u * d, toe[1] - .15 * u, M.shoe, 5);
  } else {
    // 高跟：脚背绷直，脚跟抬起
    const toe = [a[0] + Math.cos(.95 - ft * .5) * .62 * u * d, a[1] + Math.sin(.95 - ft * .5) * .62 * u];
    lcap(a[0], a[1], R[2] * u, toe[0], toe[1], .1 * u, M.skin);
    const pts = new Path().m(a[0] - .14 * u * d, a[1] + .02 * u).l(toe[0] - .08 * u * d, toe[1] - .12 * u)
      .q(toe[0] + .14 * u * d, toe[1] - .06 * u, toe[0] + .1 * u * d, toe[1] + .08 * u, 4).l(a[0] - .02 * u * d, a[1] + .18 * u).pts();
    lpoly(pts, M.heel);
    // 细跟
    lpoly([a[0] - .14 * u * d, a[1] + .05 * u, a[0] - .05 * u * d, a[1] + .1 * u, a[0] - .1 * u * d, a[1] + .52 * u, a[0] - .16 * u * d, a[1] + .52 * u], M.heel);
  }
}

function drawArmSide(J, A, who, fit, far, o) {
  const { u, d } = J;
  const bare = who === 'she' && fit === 'dress';
  const sleeve = who === 'he' ? (fit === 'coat' ? M.coat : fit === 'suit' ? M.suit : fit === 'shirt' ? M.shirt : M.turtle)
    : (fit === 'trench' ? M.trench : fit === 'home' ? M.cardi : M.skin);
  const r0 = (who === 'he' ? .3 : bare ? .17 : .24) * u, r1 = (who === 'he' ? .25 : bare ? .14 : .2) * u, r2 = (who === 'he' ? .22 : bare ? .11 : .18) * u;
  lcap(A.sj[0], A.sj[1], r0, A.e[0], A.e[1], r1, sleeve);
  const rolled = who === 'he' && fit === 'shirt';
  if (rolled) { // 卷起袖子：小臂露出来
    const m = [lerp(A.e[0], A.w[0], .35), lerp(A.e[1], A.w[1], .35)];
    lcap(A.e[0], A.e[1], r1 * 1.1, m[0], m[1], r1 * 1.05, M.shirt);
    lcap(m[0], m[1], r1 * .85, A.w[0], A.w[1], r2 * .85, M.skin);
  } else lcap(A.e[0], A.e[1], r1, A.w[0], A.w[1], r2, bare ? M.skin : sleeve);
  // 手
  const ang = A.ang, hl = BODY[who].hand * u;
  const hx_ = A.w[0] + Math.sin(ang) * hl * d, hy = A.w[1] + Math.cos(ang) * hl;
  lcap(A.w[0], A.w[1], r2 * .95, hx_, hy, r2 * .7, M.skin);
  if (who === 'he' && far === false && !o.noWatch) { // 表（近处的手）
    const wx = lerp(A.e[0], A.w[0], .9), wy = lerp(A.e[1], A.w[1], .9);
    lcap(wx, wy, r2 * .7, A.w[0], A.w[1], r2 * .7, M.watch, 4);
  }
  if (o.hold && !far) o.hold(hx_, hy, ang, J);
  J[far ? 'fHand' : 'nHand'] = [hx_, hy, ang];
}

function drawTorsoSide(J, who, fit, o) {
  const { pel, sh, nk, nL, fL, u, d } = J;
  const lean = Math.atan2((sh[0] - pel[0]) * d, pel[1] - sh[1]);
  // 身体局部坐标：f 向前、v 向上（u），以骨盆为原点，再按前倾旋转
  const T = (f, v) => { const [x, y] = rotv(f * u * d, -v * u, lean * d); return [pel[0] + x, pel[1] + y]; };
  const push = (pp, f, v) => { const p = T(f, v); pp.push(p[0], p[1]); };
  const kneeF = Math.max(nL.k[0] * d, fL.k[0] * d), kneeB = Math.min(nL.k[0] * d, fL.k[0] * d);
  const toLocal = xw => (xw * d - pel[0] * d) / u;
  const sitting = !!(o.pose && o.pose.sit);
  if (who === 'he') {
    // 高领
    lcap(nk[0] - .02 * u * d, nk[1] - .05 * u, .21 * u, sh[0] + .02 * u * d, sh[1] + .1 * u, .26 * u, fit === 'coat' || fit === 'turtle' ? M.turtle : M.skin);
    const mat = fit === 'coat' ? M.coat : fit === 'suit' ? M.suit : fit === 'shirt' ? M.shirt : M.turtle;
    const pts = [];
    const hemV = sitting ? .2 : (fit === 'coat' ? -1.8 : -.1);           // 下摆高度（相对骨盆）
    let hf = fit === 'coat' ? Math.max(.62, toLocal(kneeF * d) + .32) : .52, hb = fit === 'coat' ? Math.min(-.66, toLocal(kneeB * d) - .3) : -.5;
    if (sitting) { hf = 2.0; hb = -.55; }
    push(pts, -.42, 2.62); push(pts, -.58, 2.25); push(pts, -.55, 1.2); push(pts, -.52, .5);
    if (fit === 'coat' && !sitting) { push(pts, -.6, -.4); push(pts, hb, hemV); push(pts, hf, hemV - .05); push(pts, .6, -.3); }
    else if (sitting && fit === 'coat') { push(pts, -.6, -.1); push(pts, -.4, hemV); push(pts, hf, hemV - .05); push(pts, hf + .05, .32); push(pts, .55, .45); }
    else { push(pts, -.52, hemV); push(pts, .5, hemV); }
    push(pts, .55, 1.0); push(pts, .58, 1.85); push(pts, .5, 2.45); push(pts, .24, 2.72);
    lpoly(pts, mat);
    if (fit === 'coat') { // 翻领、腰线
      const lp = []; push(lp, .2, 2.7); push(lp, .52, 2.4); push(lp, .58, 1.5); push(lp, .42, 1.6); push(lp, .3, 2.3); lpolyOn(lp, 0, 2);
      const br = []; push(br, -.56, .62); push(br, .56, .62); push(br, .56, .5); push(br, -.56, .5); lpolyOn(br, 0, 2, M.coat);
    } else if (fit === 'suit') {
      const sh2 = []; push(sh2, .1, 2.7); push(sh2, .45, 2.3); push(sh2, .5, 1.3); push(sh2, .3, 1.4); push(sh2, .2, 2.4); lpoly(sh2, M.shirt);
      const ti = []; push(ti, .32, 2.5); push(ti, .44, 2.3); push(ti, .48, 1.5); push(ti, .38, 1.4); lpoly(ti, M.tie);
    }
  } else {
    const mat = fit === 'dress' ? M.dress : fit === 'trench' ? M.trench : M.cardi;
    if (fit === 'dress') { // 锁骨、肩膀露出来
      lcap(nk[0], nk[1], .16 * u, sh[0] + .05 * u * d, sh[1] + .15 * u, .2 * u, M.skin);
    } else lcap(nk[0], nk[1] - .05 * u, .15 * u, sh[0] + .04 * u * d, sh[1] + .12 * u, .22 * u, M.skin);
    const pts = [];
    const hemV = sitting ? .15 : -1.72;
    let hf = Math.max(.55, toLocal(kneeF * d) + .28), hb = Math.min(-.6, toLocal(kneeB * d) - .26);
    if (sitting) { hf = 2.05; hb = -.5; }
    // 背：肩胛 → 腰往里收 → 臀
    push(pts, -.28, 2.6); push(pts, -.36, 2.2); push(pts, -.3, 1.6); push(pts, -.28, 1.0); push(pts, -.5, .45); push(pts, -.52, .05);
    if (!sitting) { push(pts, hb, hemV); push(pts, hf, hemV - .04); }
    else { push(pts, -.4, hemV); push(pts, hf, hemV - .04); push(pts, hf + .04, .4); }
    // 前：小腹 → 腰 → 胸 → 领口
    push(pts, .34, .7); push(pts, .3, 1.15); push(pts, .36, 1.62); push(pts, .5, 1.95); push(pts, .5, 2.15);
    push(pts, fit === 'dress' ? .32 : .26, 2.38); push(pts, fit === 'dress' ? .1 : .14, 2.6);
    if (fit !== 'dress') push(pts, -.12, 2.75);
    lpoly(pts, mat);
    if (fit === 'dress') {
      // 细吊带、缎面的高光
      const s1 = T(-.05, 2.55), s2 = T(.05, 2.86); lcap(s1[0], s1[1], .05 * u, s2[0], s2[1], .05 * u, M.dress, 2);
      const g = []; push(g, .2, 1.9); push(g, .36, 1.8); push(g, .2, .9); push(g, .1, 1.0); lpolyOn(g, 0, 4, M.dress);
      const g2 = []; push(g2, .1, -.2); push(g2, .25, -.2); push(g2, hf - .3, hemV + .2); push(g2, hf - .45, hemV + .2); lpolyOn(g2, 0, 4, M.dress);
    } else if (fit === 'trench') {
      const bl = []; push(bl, -.36, 1.12); push(bl, .36, 1.12); push(bl, .36, .98); push(bl, -.36, .98); lpolyOn(bl, M.belt, -1);
      const lp = []; push(lp, .12, 2.6); push(lp, .4, 2.3); push(lp, .38, 1.6); push(lp, .28, 2.1); lpolyOn(lp, 0, 2);
    }
  }
}

/* ---------------- 侧脸 ---------------- */
function drawHeadSide(J, who, o) {
  const { hc, u, d, tilt } = J;
  const hu = u * BODY[who].head;
  const T = (f, v) => { const [x, y] = rotv(f * hu * d, v * hu, tilt * d); return [hc[0] + x, hc[1] + y]; };
  const P = pp => { const out = []; for (let i = 0; i < pp.length; i += 2) { const p = T(pp[i], pp[i + 1]); out.push(p[0], p[1]); } return out; };
  // 脸（侧面轮廓：额头、鼻梁、鼻尖、人中、嘴、下巴、下颌）
  const face = who === 'he'
    ? [-.38, -.3, -.05, -.52, .3, -.45, .42, -.22, .44, -.02, .55, .16, .47, .22, .48, .3, .44, .36, .44, .43, .35, .52, .05, .5, -.15, .32, -.3, .1]
    : [-.36, -.3, -.05, -.5, .3, -.43, .4, -.2, .42, -.02, .5, .14, .43, .2, .45, .27, .42, .33, .41, .39, .32, .48, .08, .46, -.12, .3, -.28, .1];
  lpoly(P(face), M.skin);
  // 耳朵
  const ear = T(-.06, .02); lell(ear[0], ear[1], .1 * hu, .15 * hu, M.skin);
  // 眼睛、眉毛、嘴
  const blink = o.blink ?? 0;
  const ey = T(.33, -.02);
  if (who === 'he') {
    const br = T(.3, -.15); lrect(br[0] - .1 * hu, br[1], .22 * hu, Math.max(1, .06 * hu), M.brow);
    if (blink > .5) lrect(ey[0] - .06 * hu, ey[1] + .02 * hu, .14 * hu, 1, M.eye);
    else lrect(ey[0] - .05 * hu, ey[1] - .02 * hu, Math.max(1, .1 * hu), Math.max(1, .1 * hu), M.eye);
    const mo = T(.42, .32); lpx(mo[0] - d * .5, mo[1], M.lipHe);
  } else {
    const br = T(.3, -.16); lrect(br[0] - .1 * hu, br[1], .2 * hu, 1, M.brow);
    if (blink > .5) lrect(ey[0] - .06 * hu, ey[1] + .03 * hu, .14 * hu, 1, M.eye);
    else { lrect(ey[0] - .06 * hu, ey[1] - .04 * hu, Math.max(1, .1 * hu), Math.max(2, .13 * hu), M.eye); lpx(ey[0] + .06 * hu * d, ey[1] - .05 * hu, M.eye); }
    const mo = T(.41, .3); lpx(mo[0], mo[1], M.lip); lpx(mo[0] - d, mo[1], M.lip);
    const ck = T(.22, .12); lpx(ck[0], ck[1], M.blush);
    // 珍珠耳环
    const pe = T(-.06, .2); lpx(pe[0], pe[1], M.pearl);
  }
  // 头发
  lpart();
  if (who === 'he') {
    const hair = [-.5, .2, -.52, -.15, -.38, -.5, -.05, -.66, .3, -.6, .5, -.4, .52, -.25, .44, -.12, .36, -.22, .3, -.15, .18, -.3, -.02, -.25, -.12, -.05, -.18, .2, -.32, .3];
    lpoly(P(hair), M.hairHe);
    const hi = [-.3, -.48, .0, -.6, .3, -.52, .1, -.52, -.15, -.45]; lpolyOn(P(hi), 0, 4, M.hairHe);
  } else {
    const wind = o.hairWind || 0;
    const hair = [-.5, .25, -.55, -.12, -.4, -.48, -.05, -.62, .3, -.56, .46, -.36, .46, -.2, .38, -.26, .3, -.1, .2, -.28, .05, -.2, -.1, .05, -.2, .35, -.35, .55 + wind * .1];
    lpoly(P(hair), M.hairShe);
    const hi = [-.32, -.44, .0, -.56, .28, -.5, .08, -.48, -.15, -.4]; lpolyOn(P(hi), 0, 4, M.hairShe);
  }
}
/* 她的长发后片（画在身体后面），随走路和风摆 */
function hairSheBack(J, o) {
  const { hc, sh, u, d, tilt } = J, hu = u;
  const sw = Math.sin((o.t || 0) * 2.2) * .08 + (o.hairWind || 0) * .5;
  const T = (f, v) => { const [x, y] = rotv(f * hu * d, v * hu, tilt * d * .5); return [hc[0] + x, hc[1] + y]; };
  const pts = [];
  const add = (f, v) => { const p = T(f, v); pts.push(p[0], p[1]); };
  add(-.1, -.55); add(-.5, -.35); add(-.62, .2);
  const len = o.hairLen ?? 3.1;
  for (let k = 0; k <= 6; k++) { const v = .3 + len * k / 6; add(-.7 - .12 * Math.sin(k * 1.3) - sw * k / 6 * 1.4 - .1 * k / 6, v); }
  for (let k = 6; k >= 0; k--) { const v = .3 + len * k / 6; add(-.28 - .08 * Math.sin(k * 1.3 + 1) - sw * k / 6 * 1.2 + (k > 3 ? .05 : 0), v + .05); }
  add(-.15, .3);
  lpoly(pts, M.hairShe);
  // 发丝的亮线
  for (let k = 0; k < 3; k++) {
    const a = T(-.55 + k * .08, .6 + k * .2), b = T(-.6 - sw * .8 + k * .05, 2.2 + k * .2);
    lpolyOn(capsulePts(a[0], a[1], .6, b[0], b[1], .6), 0, 4, M.hairShe);
  }
}

/* ---------------- 正面（三分之四侧身）全身 ---------------- */
/* 头直接用特写的画法（bustHe / bustShe 只画头），身体按 8 头身。
   o: who, fit, x, y(脚底), h, d(脸朝哪边：1 右 / -1 左), t, exp, gaze,
   pose: 'stand'（他：一只手插兜；她：模特站姿）、'hold'（手里拿东西，o.hold 画）、'arms'（两手自然垂下）、'cross'（她：手抱在胸前）
   bob：呼吸起伏 */
function figFront(o) {
  const who = o.who, h = o.h, u = h / 8, d = o.d || 1, gx = o.x, gy = o.y, t = o.t || 0;
  const fit = o.fit || (who === 'he' ? 'coat' : 'dress'), pose = o.pose || 'stand';
  const br = Math.sin(t * 1.8) * .015;
  const Y = v => gy - v * u, X = (v, side) => gx + v * u;   // side 无用，保留可读性
  const n = -d;                                        // 近的一侧（身体朝镜头多的那一侧）
  const sq = k => 1 - .14 * k;                         // 远侧压窄
  const sx = v => gx + (v * n > 0 ? v : v * sq(1)) * u; // 远侧的点往中间收
  const J = { u, d, gx, gy };
  const P = pts => { const out = []; for (let i = 0; i < pts.length; i += 2) out.push(sx(pts[i]), Y(pts[i + 1] + br * (pts[i + 1] > 4 ? 1 : 0))); return out; };
  if (!o.keep) lbegin();
  if (who === 'he') {
    // 腿（西裤）：重心在近侧腿，远侧腿稍弯、脚尖朝外
    lpart();
    lpoly(P([-.62, 4.3, -.05, 4.25, -.06, 2.3, -.1, .35, -.42, .32, -.5, 2.3]), M.pants);
    lpart();
    lpoly(P([.05, 4.25, .62, 4.3, .56, 2.3, .5, .36, .2, .34, .12, 2.3]), M.pants);
    lpolyOn(P([-.3, 4.0, -.26, 4.0, -.27, .5, -.31, .5]), 0, 4, M.pants);      // 裤线
    lpolyOn(P([.33, 4.0, .37, 4.0, .35, .5, .31, .5]), 0, 4, M.pants);
    // 鞋
    lpart(); lpoly(P([-.46, .42, -.08, .42, -.02, .12, -.1, 0, -.5, 0, -.54, .18]), M.shoe);
    lpoly(P([.18, .44, .52, .44, .6, .14, .56, 0, .14, 0, .12, .2]), M.shoe);
    lpolyOn(P([-.4, .3, -.2, .3, -.2, .25, -.4, .25]), 0, 5, M.shoe); lpolyOn(P([.26, .32, .44, .32, .44, .27, .26, .27]), 0, 5, M.shoe);
    // 高领（身体）
    lpart(); lpoly(P([-.32, 6.95, .32, 6.95, .55, 6.4, .62, 4.3, -.62, 4.3, -.55, 6.4]), M.turtle);
    // 大衣：两片前襟敞开，下摆到膝盖下面；翻领
    lpart();
    const coatL = [-.3, 6.78, -1.06, 6.62, -1.0, 6.2, -.92, 5.2, -.98, 3.6, -1.04, 2.25, -.32, 2.25, -.34, 4.0, -.38, 5.6, -.36, 6.4];
    const coatR = [.3, 6.78, 1.04, 6.62, .98, 6.2, .9, 5.2, .96, 3.6, 1.02, 2.25, .3, 2.25, .34, 4.0, .36, 5.6, .34, 6.4];
    lpoly(P(coatL), M.coat); lpoly(P(coatR), M.coat);
    lpart();
    lpoly(P([-.3, 6.8, -.56, 6.62, -.6, 6.2, -.5, 6.18, -.52, 5.8, -.38, 5.1, -.34, 6.3]), M.coat);   // 左翻领
    lpoly(P([.3, 6.8, .56, 6.62, .6, 6.2, .5, 6.18, .52, 5.8, .38, 5.1, .34, 6.3]), M.coat);
    lpolyOn(P([-.3, 6.8, -.56, 6.62, -.58, 6.45, -.34, 6.6]), 0, 4, M.coat);
    // 口袋盖
    lpolyOn(P([-.88, 4.3, -.5, 4.3, -.5, 4.2, -.88, 4.2]), 0, 2, M.coat); lpolyOn(P([.5, 4.3, .86, 4.3, .86, 4.2, .5, 4.2]), 0, 2, M.coat);
    // 手臂：近侧插兜（胳膊肘往外），远侧自然垂下
    lpart();
    const pocket = pose === 'stand';
    if (pocket) {
      lpoly(P([-1.02, 6.6, -1.2, 5.6, -1.28, 5.05, -1.12, 4.9, -.92, 4.3, -.72, 4.32, -.98, 5.1, -.86, 6.0]), M.coat);
      lpolyOn(P([-1.24, 5.15, -1.14, 5.0, -1.06, 5.1, -1.16, 5.25]), 0, 2, M.coat);
    } else lpoly(P([-1.02, 6.6, -1.2, 5.2, -1.18, 4.0, -.96, 4.0, -.92, 5.2, -.86, 6.0]), M.coat);
    lpoly(P([1.0, 6.58, 1.16, 5.2, 1.12, 4.02, .92, 4.0, .9, 5.2, .84, 6.0]), M.coat);
    lpart();
    if (!pocket) lpoly(P([-1.16, 4.05, -.98, 4.05, -.96, 3.55, -1.12, 3.5]), M.skin);
    lpoly(P([1.1, 4.06, .93, 4.05, .92, 3.55, 1.08, 3.52]), M.skin);
    lpolyOn(P([1.1, 4.12, .93, 4.11, .93, 4.03, 1.1, 4.04]), M.watch, 4);
    if (o.hold) o.hold(sx(1.0), Y(3.6), J);
    // 头
    bustHe({ keep: 1, headOnly: 1, x: gx + .04 * u * d, y: Y(7.5 + br), s: u * 1.02, d, t, exp: o.exp || {}, gaze: o.gaze, light: o.light, wind: o.wind });
  } else {
    // 她：腿交叉一点的模特站姿，细高跟
    const bare = fit !== 'pants';
    lpart();
    lpoly(P([-.5, 4.4, -.02, 4.3, -.12, 2.3, -.1, .55, -.26, .5, -.38, 2.3]), bare ? M.skin : M.pants);
    lpart();
    lpoly(P([.02, 4.3, .5, 4.4, .36, 2.3, .14, .6, -.02, .56, .1, 2.3]), bare ? M.skin : M.pants);
    lpart(); // 高跟
    lpoly(P([-.3, .62, -.08, .62, -.06, .3, -.14, 0, -.2, 0, -.32, .3]), M.heel);
    lpoly(P([-.01, .66, .17, .66, .2, .32, .1, .02, .04, .02, -.02, .32]), M.heel);
    lpolyOn(P([-.24, .5, -.12, .5, -.12, .45, -.24, .45]), 0, 5, M.heel);
    // 身体和衣服
    lpart();
    lpoly(P([-.14, 7.05, .14, 7.05, .16, 6.72, -.16, 6.72]), M.skin);    // 脖子
    if (fit === 'dress') {
      lpoly(P([-.7, 6.75, -.16, 6.8, .16, 6.8, .7, 6.75, .78, 6.5, -.78, 6.5]), M.skin);          // 肩
      lpart();
      lpoly(P([-.72, 6.4, -.3, 6.5, 0, 6.28, .3, 6.5, .72, 6.4, .7, 5.95, .46, 5.3, .78, 4.45, .98, 2.4, .3, 2.32, -.3, 2.32, -.98, 2.4, -.78, 4.45, -.46, 5.3, -.7, 5.95]), M.dress);
      lpolyOn(P([-.6, 6.3, -.2, 6.38, -.3, 6.0, -.5, 5.9]), 0, 4, M.dress);
      lpolyOn(P([.1, 4.4, .3, 4.4, .55, 2.5, .3, 2.45]), 0, 4, M.dress);
      lpolyOn(P([-.72, 4.3, -.5, 4.3, -.75, 2.5, -.92, 2.48]), 0, 2, M.dress);
      lcap(sx(-.5), Y(6.5), .04 * u, sx(-.46), Y(6.8), .04 * u, M.dress, 2);
      lcap(sx(.5), Y(6.5), .04 * u, sx(.46), Y(6.8), .04 * u, M.dress, 2);
    } else if (fit === 'trench') {
      lpart();
      lpoly(P([-.2, 6.9, -.82, 6.7, -.8, 6.0, -.5, 5.3, -.8, 4.5, -1.02, 2.35, 1.0, 2.35, .78, 4.5, .48, 5.3, .78, 6.0, .8, 6.7, .2, 6.9]), M.trench);
      lpart(); lpoly(P([-.2, 6.9, .2, 6.9, .1, 6.2, -.1, 6.2]), M.knit);
      lpart();
      lpoly(P([-.2, 6.9, -.48, 6.7, -.46, 6.3, -.3, 6.0, -.1, 6.25]), M.trench); lpoly(P([.2, 6.9, .48, 6.7, .46, 6.3, .3, 6.0, .1, 6.25]), M.trench);
      lpolyOn(P([-.5, 5.38, .5, 5.38, .5, 5.22, -.5, 5.22]), M.belt, -1);
      lpolyOn(P([-.08, 5.4, .1, 5.4, .1, 5.2, -.08, 5.2]), M.watch, 4);
      lpolyOn(P([.05, 5.2, .18, 5.2, .5, 2.5, .3, 2.45]), 0, 2, M.trench);
      for (const [a, b] of [[-.22, 5.9], [.22, 5.9], [-.22, 4.6], [.22, 4.6]]) lpolyOn(P([a - .04, b, a + .04, b, a + .04, b - .08, a - .04, b - .08]), 0, 1, M.trench);
    } else {
      lpart();
      lpoly(P([-.7, 6.75, .7, 6.75, .74, 5.9, .5, 5.2, .8, 4.4, .96, 2.4, -.96, 2.4, -.8, 4.4, -.5, 5.2, -.74, 5.9]), M.cardi);
      lpart(); lpoly(P([-.22, 6.8, .22, 6.8, .14, 5.3, -.14, 5.3]), M.knit);
    }
    // 手臂：近侧的手扶着包带 / 垂下；远侧垂下
    lpart();
    const armM = fit === 'dress' ? M.skin : fit === 'trench' ? M.trench : M.cardi;
    if (pose === 'cross') {
      lpoly(P([-.74, 6.5, -.9, 5.6, -.6, 5.2, .4, 5.5, .4, 5.7, -.5, 5.5, -.6, 6.2]), armM);
      lpoly(P([.72, 6.5, .86, 5.6, .5, 5.15, -.3, 5.4, -.3, 5.6, .4, 5.4, .6, 6.2]), armM);
    } else {
      lpoly(P([-.74, 6.6, -.92, 5.3, -.9, 4.2, -.74, 4.2, -.72, 5.3, -.6, 6.2]), armM);
      lpoly(P([.74, 6.6, .9, 5.3, .86, 4.2, .7, 4.2, .7, 5.3, .58, 6.2]), armM);
      lpart();
      lpoly(P([-.9, 4.25, -.74, 4.25, -.74, 3.8, -.88, 3.78]), M.skin);
      lpoly(P([.86, 4.25, .7, 4.25, .7, 3.8, .84, 3.78]), M.skin);
    }
    if (o.hold) o.hold(sx(.8), Y(3.9), J);
    bustShe({ keep: 1, headOnly: 1, x: gx + .04 * u * d, y: Y(7.5 + br), s: u * 1.04, d, t, exp: o.exp || {}, gaze: o.gaze, light: o.light, wind: o.wind });
  }
  if (!o.keep) lresolve({ lx: o.lx ?? (-.6 * d), ly: -.8, sd: o.sd ?? 2, amb: o.amb, add: o.add, rim: o.rim, rim2: o.rim2, a: o.a });
  return J;
}
/* 角色图层的倒影：把上过色的像素翻到脚底下面，变暗、抖动（湿地面、水洼） */
function lreflect(yf, a = .35, tint = [.7, .75, .95], t = 0, wob = 1.5) {
  if (LB.x1 < 0) return;
  const rows = [];
  for (let y = LB.y0; y <= Math.min(LB.y1, yf); y++) {
    const row = [];
    for (let x = LB.x0; x <= LB.x1; x++) if (LM[y * W + x]) { const i = (y * W + x) << 2; row.push(x, B[i], B[i + 1], B[i + 2]); }
    rows.push([y, row]);
  }
  for (const [y, row] of rows) {
    const yy = Math.round(2 * yf - y); if (yy < 0 || yy >= H) continue;
    const d = (yy - yf) / 60, ox = Math.round(noise1(yy * .5 + t * 3, 5) * wob * (1 + d));
    const al = a * Math.max(0, 1 - d * .8);
    for (let k = 0; k < row.length; k += 4) px(row[k] + ox, yy, rgb(row[k + 1] * tint[0], row[k + 2] * tint[1], row[k + 3] * tint[2]), al);
  }
}
