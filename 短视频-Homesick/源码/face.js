'use strict';
/* face.js：近景、特写用的半身像（三分之四侧脸）。
   坐标以"头高"为单位：头顶 y=-0.5，下巴 y=+0.5；脸朝 +x（d=1 朝右，d=-1 朝左）。
   脸是平涂的，明暗用手画的形状（刘海投在额头的影、背光一侧的脸颊、下巴下面的脖子）；
   五官逐个像素定：上睫毛线、双眼皮线、虹膜上深下浅、两个高光、下睫毛、鼻影、上下唇、腮红。 */

const SKIN = [hx('#7E4A43'), hx('#B9776A'), hx('#DDA48F'), hx('#F4CFB6'), hx('#FBE2D1'), hx('#FFF2E8')];
const SKIN_HE = [hx('#6E3F37'), hx('#A8685A'), hx('#D29A82'), hx('#EDC4A6'), hx('#F7DCC6'), hx('#FFEEDF')];
MAT[M.skin].r = SKIN; MAT[M.skinS].r = SKIN;
MAT[M.hairHe].r = [hx('#0D0B0F'), hx('#16131A'), hx('#1F1B24'), hx('#2C2732'), hx('#4E4858'), hx('#8A8398')];
const MF = {
  face: defMat('face', 0, { r: SKIN, flat: true, inner: 0 }),
  faceHe: defMat('faceHe', 0, { r: SKIN_HE, flat: true, inner: 0 }),
  lash: defMat('lash', 0, { r: Array(6).fill(hx('#1A1114')), flat: true, out: 0, inner: 0 }),
  lashHe: defMat('lashHe', 0, { r: Array(6).fill(hx('#17141A')), flat: true, out: 0, inner: 0 }),
  sclera: defMat('sclera', 0, { r: [0, 0, hx('#D9CBC8'), hx('#F3ECE8'), hx('#FFFFFF'), hx('#FFFFFF')], flat: true, out: 0, inner: 0 }),
  irisF: defMat('irisF', 0, { r: [hx('#120A0A'), hx('#25140F'), hx('#3D2318'), hx('#5E3624'), hx('#8A5634'), hx('#B98450')], flat: true, out: 0, inner: 0 }),
  irisM: defMat('irisM', 0, { r: [hx('#0C0A0D'), hx('#16121A'), hx('#241C22'), hx('#3A2C2C'), hx('#5A4440'), hx('#8A7268')], flat: true, out: 0, inner: 0 }),
  hl: defMat('hl', 0, { r: Array(6).fill(hx('#FFFFFF')), flat: true, out: 0, inner: 0, emit: true }),
  lipU: defMat('lipU', 0, { r: [hx('#6E2230'), hx('#8E3040'), hx('#A8414F'), hx('#BE5462'), hx('#D97482'), hx('#F2A6AE')], flat: true, out: 0, inner: 0 }),
  lipM: defMat('lipM', 0, { r: [hx('#7A4440'), hx('#9A5A52'), hx('#B06D64'), hx('#C4847A'), hx('#D9A196'), hx('#EDC2B8')], flat: true, out: 0, inner: 0 }),
  blushF: defMat('blushF', 0, { r: Array(6).fill(hx('#EFA39B')), flat: true, out: 0, inner: 0 }),
  browF: defMat('browF', 0, { r: Array(6).fill(hx('#4A2E26')), flat: true, out: 0, inner: 0 }),
  browM: defMat('browM', 0, { r: Array(6).fill(hx('#1A1820')), flat: true, out: 0, inner: 0 }),
  tear: defMat('tear', 0, { r: [hx('#9FC6E8'), hx('#B8D8F2'), hx('#CDE6FA'), hx('#E6F4FF'), hx('#FFFFFF'), hx('#FFFFFF')], flat: true, out: 0, inner: 0, emit: true }),
};

/* 头部局部坐标 → 屏幕；s 头高（像素），d 朝向，tilt 歪头 */
function HF(o) {
  const s = o.s, d = o.d || 1, c = Math.cos(o.tilt || 0), si = Math.sin(o.tilt || 0);
  const f = (x, y) => { const X = x * s * d, Y = y * s; return [o.x + X * c - Y * si, o.y + X * si + Y * c]; };
  f.P = pts => { const out = []; for (let i = 0; i < pts.length; i += 2) { const p = f(pts[i], pts[i + 1]); out.push(p[0], p[1]); } return out; };
  f.s = s; f.d = d; return f;
}
/* 用"头单位"写贝塞尔路径 */
function HP(f, x, y) {
  const p = new Path(), pt = (a, b) => f(a, b);
  const api = {
    l(a, b) { const q = pt(a, b); p.l(q[0], q[1]); return api; },
    q(cx, cy, a, b, n = 10) { const c = pt(cx, cy), q = pt(a, b); p.q(c[0], c[1], q[0], q[1], n); return api; },
    c(c1x, c1y, c2x, c2y, a, b, n = 12) { const c1 = pt(c1x, c1y), c2 = pt(c2x, c2y), q = pt(a, b); p.c(c1[0], c1[1], c2[0], c2[1], q[0], q[1], n); return api; },
    pts: () => p.pts(),
  };
  const s0 = pt(x, y); p.m(s0[0], s0[1]);
  return api;
}

/* ---------------- 共用：发丝 ---------------- */
/* 沿一条曲线画一缕发丝（只改已经是头发的像素的色阶） */
function hairLine(f, pts, lev, mat, w = .6) {
  const p = HP(f, pts[0], pts[1]);
  for (let i = 2; i + 3 < pts.length + 1 && i + 3 <= pts.length; i += 4) p.q(pts[i], pts[i + 1], pts[i + 2], pts[i + 3], 10);
  const pp = p.pts();
  for (let i = 0; i + 3 < pp.length; i += 2) lpolyOn(capsulePts(pp[i], pp[i + 1], w, pp[i + 2], pp[i + 3], w), 0, lev, mat);
}
/* 一片头发（实心）：外沿、内沿两条曲线围起来 */
function hairPiece(f, outer, inner, mat) {
  const a = HP(f, outer[0], outer[1]); for (let i = 2; i < outer.length; i += 4) a.q(outer[i], outer[i + 1], outer[i + 2], outer[i + 3], 10);
  const b = HP(f, inner[inner.length - 2], inner[inner.length - 1]);
  for (let i = inner.length - 4; i >= 2; i -= 4) b.q(inner[i], inner[i + 1], inner[i - 2], inner[i - 1], 10);
  lpoly(a.pts().concat(b.pts()), mat);
}
/* 一束头发：从发根到发尖的叶子形（根部宽、尖细），bend 是往哪边弯；lev 给整束一个底色阶 */
function lock(f, rx, ry, tx, ty, w, bend, mat, lev = -1) {
  const mx = (rx + tx) / 2, my = (ry + ty) / 2, dx = tx - rx, dy = ty - ry, L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;                       // 法线
  const cx = mx + nx * bend, cy = my + ny * bend;          // 弯的控制点
  const a = HP(f, rx + nx * w, ry + ny * w).q(cx + nx * w * .7, cy + ny * w * .7, tx, ty, 12).pts();
  const b = HP(f, tx, ty).q(cx - nx * w * .7, cy - ny * w * .7, rx - nx * w, ry - ny * w, 12).pts();
  lpoly(a.concat(b), mat, lev);
  return { cx, cy };
}
/* 腮红：稀疏的抖动点 */
function blushPatch(f, cx, cy, rx, ry, k, onMat, mat) {
  const [bx, by] = f(cx, cy), Rx = rx * f.s, Ry = ry * f.s;
  for (let y = Math.floor(by - Ry); y <= by + Ry; y++) for (let x = Math.floor(bx - Rx); x <= bx + Rx; x++) {
    const q = 1 - ((x - bx) ** 2 / (Rx * Rx) + (y - by) ** 2 / (Ry * Ry)); if (q <= 0) continue;
    if (q * k > bayer(x, y) * 1.15) { const i = y * W + x; if (x >= 0 && y >= 0 && x < W && y < H && LM[i] === onMat) { LM[i] = mat; LV[i] = q > .55 ? 3 : 4; } }
  }
}

/* ---------------- 她 ---------------- */
function bustShe(o) {
  const f = HF(o), t = o.t || 0, e = o.exp || {};
  const wind = o.wind || 0, sw = Math.sin(t * 1.6) * .012 + wind * .06;
  const lit = (o.light ?? -1);              // -1：光从她脑后那侧来；1：光从她脸朝的那侧来
  const tiny = f.s < 40;
  if (!o.keep) lbegin();
  // 1. 后面的头发：长发垂到胸口以下，发尾 C 形内卷
  lpart();
  const back = HP(f, .05, -.57).c(-.34, -.6, -.55, -.32, -.52, .08)
    .c(-.52 - sw, .55, -.64 - sw * 2, .95, -.58 - sw * 3, 1.42)
    .c(-.55 - sw * 3, 1.56, -.4 - sw * 2, 1.58, -.33 - sw * 2, 1.46)
    .c(-.2, 1.3, -.12, 1.12, .05, 1.05)
    .c(.3, 1.0, .46 + sw, 1.2, .5 + sw * 2, 1.45)
    .c(.6 + sw * 2, 1.36, .64 + sw, 1.1, .58, .82)
    .c(.52, .5, .5, .2, .44, -.12).c(.42, -.42, .26, -.58, .05, -.57).pts();
  lpoly(back, M.hairShe);
  for (let k = 0; k < 7; k++) hairLine(f, [-.48 + k * .02, .1, -.56 - sw - k * .01, .7, -.5 - sw * 2 + k * .03, 1.35], k % 3 === 0 ? 4 : 2, M.hairShe, .5);
  for (let k = 0; k < 5; k++) hairLine(f, [.5 - k * .02, .3, .58 + sw, .8, .5 + sw * 2 - k * .03, 1.3], k % 2 ? 2 : 4, M.hairShe, .5);
  // 2. 脖子、肩、衣服
  lpart();
  lpoly(HP(f, -.13, .3).l(.12, .3).l(.13, .6).c(.15, .7, .2, .76, .26, .86).l(-.22, .9).c(-.15, .74, -.13, .66, -.13, .55).pts(), MF.face);
  lpolyOn(HP(f, -.14, .3).l(.14, .3).l(.14, .46).c(.06, .52, -.06, .5, -.14, .42).pts(), 0, 2, MF.face);
  lpart();
  const fit = o.headOnly ? 'none' : (o.fit || 'dress');
  if (fit === 'none') {
  } else if (fit === 'dress') {
    lpoly(HP(f, -.82, 2.4).c(-.8, 1.2, -.66, .88, -.32, .82).c(-.12, .8, .2, .82, .3, .82).c(.64, .86, .86, 1.1, .9, 2.4).pts(), MF.face);
    // 锁骨
    hairLine(f, [-.04, .93, .08, .9, .2, .92], 2, MF.face, .5);
    hairLine(f, [-.48, .95, -.32, .9, -.18, .93], 2, MF.face, .5);
    lpolyOn(HP(f, .3, .84).c(.6, .9, .8, 1.1, .86, 1.6).l(.9, 1.6).c(.86, 1.1, .64, .86, .3, .82).pts(), 0, 2, MF.face);
    lpoly(HP(f, -.66, 2.4).c(-.64, 1.4, -.54, 1.24, -.44, 1.18).c(-.2, 1.28, .1, 1.3, .36, 1.16).c(.48, 1.24, .6, 1.36, .62, 2.4).pts(), M.dress);
    lcap(...f(-.45, .87), .011 * f.s, ...f(-.44, 1.19), .011 * f.s, M.dress, 2);
    lcap(...f(.37, .87), .011 * f.s, ...f(.36, 1.16), .011 * f.s, M.dress, 2);
    lpolyOn(HP(f, -.12, 1.28).c(-.02, 1.36, .08, 1.5, .16, 1.9).l(.08, 1.9).c(.02, 1.5, -.06, 1.38, -.12, 1.28).pts(), 0, 4, M.dress);
    lpolyOn(HP(f, .3, 1.2).c(.4, 1.3, .5, 1.5, .55, 1.9).l(.62, 1.9).c(.58, 1.4, .48, 1.26, .36, 1.17).pts(), 0, 2, M.dress);
    const nk = f(.04, 1.0); lell(nk[0], nk[1], .017 * f.s, .017 * f.s, M.pearl);
    hairLine(f, [-.22, .86, -.1, .96, .04, .99], 4, MF.face, .4); hairLine(f, [.04, .99, .16, .96, .26, .86], 4, MF.face, .4);
  } else if (fit === 'trench') {
    lpoly(HP(f, -.95, 2.4).c(-.9, 1.1, -.66, .88, -.3, .82).l(.3, .82).c(.68, .86, .9, 1.1, .95, 2.4).pts(), M.trench);
    lpart(); lpoly(HP(f, -.2, .82).c(-.16, .92, .2, .94, .3, .82).l(.28, 2.4).l(-.2, 2.4).pts(), M.knit);
    for (let k = 0; k < 4; k++) hairLine(f, [-.16 + k * .12, .95, -.15 + k * .12, 1.3, -.14 + k * .12, 1.8], 2, M.knit, .5);
    lpart();
    lpoly(HP(f, -.32, .82).l(-.18, .88).l(-.06, 2.4).l(-.44, 2.4).c(-.46, 1.4, -.44, 1.0, -.32, .82).pts(), M.trench);
    lpoly(HP(f, .32, .82).l(.22, .88).l(.2, 2.4).l(.54, 2.4).c(.54, 1.4, .5, 1.0, .32, .82).pts(), M.trench);
    lpolyOn(HP(f, -.32, .82).l(-.2, .88).l(-.26, 1.04).l(-.4, .94).pts(), 0, 4, M.trench);
  } else {
    lpoly(HP(f, -.88, 2.4).c(-.84, 1.1, -.62, .88, -.3, .82).l(.3, .82).c(.64, .86, .84, 1.1, .88, 2.4).pts(), M.cardi);
    lpart(); lpoly(HP(f, -.22, .82).c(-.1, 1.02, .2, 1.02, .3, .82).l(.26, 2.4).l(-.16, 2.4).pts(), M.knit);
  }
  // 3. 耳朵和脸（V 形下颌）
  lpart();
  const ear = f(-.3, .05); lell(ear[0], ear[1], .05 * f.s, .08 * f.s, MF.face);
  const face = HP(f, -.35, -.24).c(-.37, -.04, -.34, .12, -.27, .26)
    .c(-.17, .4, .02, .5, .11, .5)
    .c(.18, .49, .25, .42, .31, .3)
    .c(.35, .2, .36, .1, .355, .04)
    .c(.35, -.01, .36, -.06, .36, -.1)
    .c(.35, -.3, .2, -.46, -.05, -.46)
    .c(-.25, -.45, -.35, -.37, -.35, -.24).pts();
  lpoly(face, MF.face);
  // 阴影只留窄窄一条：背光那侧的轮廓、下巴下面
  if (lit < 0) lpolyOn(HP(f, .33, -.15).c(.36, .05, .34, .22, .28, .33).c(.22, .42, .16, .48, .1, .5).c(.18, .44, .26, .3, .3, .15).c(.32, .05, .32, -.08, .33, -.15).pts(), 0, 2, MF.face);
  else lpolyOn(HP(f, -.34, -.15).c(-.36, .05, -.33, .15, -.26, .27).c(-.2, .36, -.12, .42, -.04, .47).c(-.16, .38, -.24, .26, -.29, .12).c(-.32, .02, -.32, -.08, -.34, -.15).pts(), 0, 2, MF.face);
  // 鼻梁亮、脸颊亮
  // 4. 五官
  eyesShe(f, e, o);
  lpolyOn(HP(f, .195, .175).q(.235, .19, .215, .215).l(.17, .212).q(.19, .2, .195, .175).pts(), 0, 2, MF.face);
  lpx(...f(.2, .08), MF.face, 4); lpx(...f(.205, .12), MF.face, 5);
  const sm = e.mouth === 'smile' ? .014 : 0, op = e.mouth === 'open' ? .024 : e.mouth === 'part' ? .01 : 0;
  lpoly(HP(f, .08, .312 - sm).c(.12, .298, .15, .302, .168, .308).c(.19, .298, .225, .302, .25, .315 - sm).c(.2, .33, .14, .334, .08, .312 - sm).pts(), MF.lipU, 2);
  lpoly(HP(f, .1, .322 + op).c(.14, .334 + op, .2, .338 + op, .235, .322 + op).c(.21, .372 + op, .13, .374 + op, .1, .322 + op).pts(), MF.lipU, 3);
  lpolyOn(HP(f, .13, .33 + op).c(.16, .336 + op, .19, .336 + op, .21, .33 + op).c(.19, .352 + op, .15, .352 + op, .13, .33 + op).pts(), 0, 1, MF.lipU);
  if (op > 0) lpoly(HP(f, .1, .318).c(.15, .324, .2, .326, .235, .318).l(.235, .318 + op).c(.2, .328 + op, .15, .328 + op, .1, .318 + op).pts(), MF.lipU, 0);
  lpx(...f(.17, .352 + op), MF.lipU, 5);
  blushPatch(f, -.08, .18, .07, .035, (e.blush ?? .55) * .7, MF.face, MF.blushF);
  blushPatch(f, .3, .18, .03, .03, (e.blush ?? .55) * .55, MF.face, MF.blushF);
  // 5. 前面的头发：头顶（分缝偏前）、空气刘海往两边分、两侧垂下来的发丝
  lpart();
  lpoly(HP(f, -.4, -.1).c(-.47, -.44, -.24, -.64, .04, -.62).c(.32, -.6, .46, -.42, .44, -.18)
    .c(.43, -.06, .41, .04, .41, .12).c(.37, -.02, .35, -.12, .31, -.2)
    .c(.25, -.29, .15, -.33, .08, -.35).c(.0, -.32, -.12, -.27, -.22, -.2)
    .c(-.28, -.14, -.32, -.05, -.34, .05).c(-.37, .0, -.39, -.05, -.4, -.1).pts(), M.hairShe);
  // 空气刘海：从分缝往两边，盖住额头两角，中间露出一点额头
  hairPiece(f, [.08, -.37, -.06, -.3, -.2, -.17, -.3, -.04, -.34, .08], [.06, -.33, -.06, -.24, -.18, -.12, -.26, -.03, -.3, .05], M.hairShe);
  hairPiece(f, [.09, -.37, .22, -.28, .32, -.14, .38, -.02, .41, .1], [.1, -.33, .2, -.24, .28, -.12, .32, -.02, .36, .06], M.hairShe);
  for (let k = 0; k < 5; k++) { const x = -.02 - k * .05; hairLine(f, [.07, -.36, x, -.3 + k * .02, x - .08, -.16 + k * .045], 2, M.hairShe, .45); }
  for (let k = 0; k < 4; k++) { const x = .14 + k * .05; hairLine(f, [.09, -.36, x, -.3 + k * .02, x + .06, -.16 + k * .04], 2, M.hairShe, .45); }
  // 刘海投在额头的影
  lpolyOn(HP(f, -.3, -.04).c(-.2, -.15, -.06, -.27, .06, -.31).l(.1, -.31).c(.2, -.26, .3, -.14, .35, -.01).l(.33, .03).c(.28, -.1, .2, -.22, .1, -.27).c(-.04, -.22, -.18, -.12, -.27, .0).pts(), 0, 2, MF.face);
  // 两侧发丝：后侧一缕从耳前垂过肩，前侧一缕沿着脸颊
  lpoly(HP(f, -.34, .0).c(-.38, .3, -.33 - sw, .56, -.41 - sw, .82).c(-.47 - sw, 1.02, -.37 - sw, 1.15, -.29 - sw * 2, 1.24)
    .c(-.31, 1.05, -.29, .88, -.25, .72).c(-.2, .5, -.26, .26, -.28, .06).pts(), M.hairShe);
  lpoly(HP(f, .41, .02).c(.45, .26, .4 + sw, .46, .46 + sw, .72).c(.52 + sw, .93, .46 + sw * 2, 1.06, .37 + sw * 2, 1.13)
    .c(.42, .92, .4, .78, .36, .62).c(.33, .44, .38, .26, .37, .12).pts(), M.hairShe);
  for (const [a, b, c, d, g, h] of [[-.32, .1, -.37, .5, -.36, .95], [-.3, .2, -.34 - sw, .7, -.32 - sw, 1.1], [.39, .15, .43, .5, .44, .9], [.38, .3, .42 + sw, .75, .4 + sw, 1.05]])
    hairLine(f, [a, b, c, d, g, h], 2, M.hairShe, .45);
  // 头顶的光泽：顺着头发方向的几道亮丝，聚成一圈
  for (let k = 0; k < 11; k++) {
    const x = -.33 + k * .066, yb = -.47 + Math.pow((x - .06) / .45, 2) * .14, len = .07 + h2(k, 3) * .06;
    const bend = (x - .06) * .25;
    hairLine(f, [x - bend * .3, yb - len * .6, x, yb, x + bend * .4, yb + len * .5], k % 4 === 1 ? 5 : 4, M.hairShe, .5);
  }
  for (const [a, b, c, d] of [[-.39, .45, -.43, .7], [.44, .48, .47, .7], [-.5, .5, -.56, .9]]) hairLine(f, [a, b, (a + c) / 2 - .01, (b + d) / 2, c, d], 4, M.hairShe, .55);
  const pe = f(-.3, .19); lell(pe[0], pe[1], .021 * f.s, .021 * f.s, M.pearl);
  if (o.keep) return f;
  lresolve({ lx: lit < 0 ? -.8 * f.d : .8 * f.d, ly: -.6, sd: Math.max(2, Math.round(f.s * .02)), amb: o.amb, add: o.add, rim: o.rim, rim2: o.rim2, a: o.a });
  eyeShine(f, e, o, 'she');
  return f;
}

/* ---------------- 他 ---------------- */
function bustHe(o) {
  const f = HF(o), t = o.t || 0, e = o.exp || {};
  const wind = o.wind || 0, sw = Math.sin(t * 1.4) * .006 + wind * .03;
  const lit = (o.light ?? -1);
  const tiny = f.s < 40;
  if (!o.keep) lbegin();
  // 1. 脖子
  lpart();
  lpoly(HP(f, -.17, .26).l(.16, .26).l(.18, .6).l(.28, .82).l(-.28, .84).l(-.18, .6).pts(), MF.faceHe);
  lpolyOn(HP(f, -.17, .28).l(.17, .28).l(.17, .48).c(.06, .55, -.08, .52, -.17, .44).pts(), 0, 2, MF.faceHe);
  const fit = o.headOnly ? 'none' : (o.fit || 'coat');
  lpart();
  if (fit === 'none') {
  } else if (fit === 'coat' || fit === 'turtle') {
    // 黑高领：贴着脖子翻折一道，往下接到肩
    lpoly(HP(f, -.19, .45).c(-.1, .42, .12, .42, .2, .45).l(.21, .64).c(.32, .7, .46, .76, .52, .84).l(.52, 2.4).l(-.54, 2.4).l(-.54, .84).c(-.46, .76, -.32, .7, -.21, .64).pts(), M.turtle);
    hairLine(f, [-.2, .54, 0, .57, .21, .54], 1, M.turtle, .7);
    hairLine(f, [-.2, .56, 0, .59, .21, .56], 4, M.turtle, .45);
    
    if (fit === 'coat') {
      lpart();
      lpoly(HP(f, -1.05, 2.4).c(-1.0, 1.1, -.9, .86, -.6, .8).l(-.3, .76).l(-.24, .9).l(-.18, 2.4).pts(), M.coat);
      lpoly(HP(f, 1.0, 2.4).c(.96, 1.1, .86, .86, .58, .8).l(.3, .76).l(.24, .9).l(.26, 2.4).pts(), M.coat);
      lpart();
      lpoly(HP(f, -.3, .76).l(-.46, .82).l(-.5, 1.02).l(-.42, 1.04).l(-.4, 1.3).l(-.22, 1.8).l(-.2, 1.1).pts(), M.coat);
      lpoly(HP(f, .3, .76).l(.44, .82).l(.48, 1.02).l(.4, 1.04).l(.38, 1.3).l(.26, 1.8).l(.24, 1.1).pts(), M.coat);
      lpolyOn(HP(f, -.3, .76).l(-.46, .82).l(-.48, .9).l(-.32, .86).pts(), 0, 4, M.coat);
    }
  } else if (fit === 'shirt') {
    lpoly(HP(f, -1.0, 2.4).c(-.96, 1.2, -.86, .96, -.56, .9).l(-.22, .84).l(.22, .84).l(.54, .9).c(.84, .96, .94, 1.2, .98, 2.4).pts(), M.shirt);
    lpart();
    lpoly(HP(f, -.24, .82).l(-.06, 1.12).l(-.02, 1.1).l(-.1, .9).l(-.2, .78).pts(), M.shirt);
    lpoly(HP(f, .24, .82).l(.06, 1.12).l(.02, 1.1).l(.1, .9).l(.2, .78).pts(), M.shirt);
    lpoly(HP(f, -.06, .86).l(.06, .86).l(.02, 1.12).l(-.02, 1.12).pts(), MF.faceHe);
    for (const y of [1.3, 1.6, 1.9]) { const b = f(0, y); lell(b[0], b[1], .012 * f.s, .012 * f.s, M.white, 4); }
  } else if (fit === 'suit') {
    lpoly(HP(f, -1.02, 2.4).c(-.98, 1.2, -.88, .96, -.58, .9).l(-.24, .84).l(.24, .84).l(.56, .9).c(.86, .96, .96, 1.2, 1.0, 2.4).pts(), M.suit);
    lpart(); lpoly(HP(f, -.2, .84).l(.2, .84).l(.12, 1.6).l(-.12, 1.6).pts(), M.shirt);
    lpart(); lpoly(HP(f, -.04, .9).l(.05, .9).l(.08, 1.6).l(0, 1.7).l(-.07, 1.6).pts(), M.tie);
    lpoly(HP(f, -.05, .88).l(.06, .88).l(.04, .95).l(-.03, .95).pts(), M.tie);
    lpart();
    lpoly(HP(f, -.24, .84).l(-.4, .94).l(-.36, 1.1).l(-.1, 1.7).l(-.16, 1.0).pts(), M.suit);
    lpoly(HP(f, .24, .84).l(.4, .94).l(.36, 1.1).l(.12, 1.7).l(.18, 1.0).pts(), M.suit);
  }
  // 2. 耳朵、脸
  lpart();
  const ear = f(-.31, .05); lell(ear[0], ear[1], .052 * f.s, .088 * f.s, MF.faceHe);
  lpolyOn(HP(f, -.32, .0).c(-.3, .04, -.31, .08, -.3, .1).l(-.29, .1).c(-.3, .06, -.29, .03, -.31, .0).pts(), 0, 2, MF.faceHe);
  lpoly(HP(f, -.35, -.28).c(-.365, -.1, -.36, .04, -.345, .1)
    .c(-.33, .19, -.31, .23, -.28, .27)
    .c(-.2, .36, -.06, .44, .05, .47)
    .l(.15, .465)
    .c(.21, .44, .26, .39, .29, .32)
    .c(.32, .25, .345, .14, .355, .04)
    .c(.36, -.02, .37, -.07, .37, -.12)
    .c(.36, -.32, .2, -.47, -.05, -.47)
    .c(-.26, -.46, -.35, -.4, -.35, -.28).pts(), MF.faceHe);
  if (lit < 0) lpolyOn(HP(f, .355, -.1).c(.37, .06, .35, .22, .29, .33).c(.24, .41, .18, .46, .13, .468).c(.2, .43, .28, .31, .32, .17).c(.34, .06, .34, -.04, .355, -.1).pts(), 0, 2, MF.faceHe);
  else lpolyOn(HP(f, -.35, -.12).c(-.36, .05, -.34, .14, -.3, .24).c(-.25, .32, -.18, .37, -.1, .43).c(-.2, .35, -.26, .24, -.29, .1).c(-.32, .0, -.33, -.06, -.35, -.12).pts(), 0, 2, MF.faceHe);
  lpolyOn(HP(f, -.33, .12).c(-.28, .2, -.24, .25, -.2, .28).c(-.24, .22, -.27, .17, -.3, .12).pts(), 0, 2, MF.faceHe);
  lpolyOn(HP(f, .09, .0).c(.12, .02, .14, .05, .15, .09).l(.14, .09).c(.12, .05, .1, .03, .085, .015).pts(), 0, 2, MF.faceHe);
  hairLine(f, [.205, .0, .21, .07, .215, .14], 4, MF.faceHe, .5);
  // 3. 五官
  eyesHe(f, e, o);
  lpolyOn(HP(f, .16, .1).c(.163, .13, .165, .15, .162, .165).l(.155, .165).c(.157, .15, .155, .13, .153, .1).pts(), 0, 2, MF.faceHe);
  lpx(...f(.215, .13), MF.faceHe, 5); lpx(...f(.212, .09), MF.faceHe, 4);
  lpolyOn(HP(f, .175, .175).q(.23, .18, .222, .205).l(.158, .203).q(.168, .188, .175, .175).pts(), 0, 2, MF.faceHe);
  const sm = e.mouth === 'smile' ? .012 : 0, op = e.mouth === 'open' ? .02 : e.mouth === 'part' ? .008 : 0;
  lpoly(HP(f, .1, .292 - sm).c(.14, .286, .18, .286, .245, .29 - sm).l(.245, .297 - sm).c(.18, .297 + op, .14, .297 + op, .1, .3 - sm).pts(), MF.lipM, 1);
  lpolyOn(HP(f, .125, .312 + op).c(.16, .322 + op, .2, .322 + op, .225, .312 + op).c(.2, .334 + op, .15, .334 + op, .125, .312 + op).pts(), 0, 2, MF.faceHe);
  if (op > 0) lpoly(HP(f, .11, .297).l(.24, .297).l(.24, .297 + op).l(.11, .297 + op).pts(), MF.lipM, 0);
  // 4. 头发：侧分逗号刘海。底层盖住头顶和后脑（两侧贴着头型），刘海一束束长短、宽窄、角度都错开，往脸朝的那侧扫，最前面一束的尖往里勾
  lpart();
  lpoly(HP(f, -.36, -.06).c(-.42, -.36, -.3, -.6, -.02, -.64).c(.26, -.66, .44, -.52, .46, -.3)
    .c(.47, -.2, .45, -.1, .42, -.04).c(.3, -.2, .1, -.27, -.1, -.27).c(-.24, -.26, -.31, -.17, -.34, -.06).pts(), M.hairHe);
  lpoly(HP(f, -.36, -.1).l(-.32, -.08).l(-.31, .07).l(-.345, .04).pts(), M.hairHe);   // 鬓角
  lpart();
  // 侧分（三七分）：分缝那边高，露出一角额头；另一边斜着扫过额头，到眉尾勾成逗号
  lpoly(HP(f, -.36, -.06).c(-.4, -.2, -.36, -.28, -.3, -.3)
    .c(-.26, -.32, -.22, -.33, -.18, -.35)    // 分缝处的发际线（最高）
    .c(-.1, -.3, -.02, -.25, .06, -.2)          // 往下斜着扫
    .c(.14, -.16, .22, -.12, .28, -.08)
    .c(.32, -.05, .34, -.01, .345, .03)         // 逗号尖
    .c(.36, .0, .38, -.02, .4, -.04)
    .c(.41, -.06, .43, -.08, .45, -.12)
    .c(.5, -.3, .4, -.56, .1, -.6)
    .c(-.15, -.62, -.34, -.5, -.4, -.3).c(-.42, -.2, -.4, -.1, -.36, -.06).pts(), M.hairHe);
  // 发丝：从分缝往两边梳，扫过去的那一边弯下来
  for (let k = 0; k < 8; k++) {
    const t0 = k / 7, tx = lerp(-.12, .38, t0), ty = lerp(-.33, -.04, t0);
    hairLine(f, [-.18, -.5, lerp(-.1, .2, t0), lerp(-.5, -.35, t0), tx, ty - .03], k % 3 === 1 ? 4 : 2, M.hairHe, .5);
  }
  for (let k = 0; k < 3; k++) hairLine(f, [-.2, -.48, -.3 - k * .02, -.42, -.36 - k * .01, -.2 + k * .04], 2, M.hairHe, .5);
  hairLine(f, [-.18, -.36, -.17, -.45, -.16, -.55], 1, M.hairHe, .5);     // 分缝
  // 斜刘海下沿挑出几缕尖、头顶和后侧翘几小撮，打破头盔一样的轮廓
  lpart();
  for (const [rx, ry, tx, ty, w, bd] of [[-.04, -.3, .06 + sw, -.16, .035, .02], [.1, -.22, .2 + sw, -.06, .035, .025], [.22, -.16, .3 + sw, .01, .03, .02],
    [.3, -.52, .44, -.5, .035, -.02], [.4, -.36, .48, -.28, .03, -.015]])
    lock(f, rx, ry, tx, ty, w, bd, M.hairHe);
  const L = [[-.05, -.5, .06, -.2], [.12, -.5, .22, -.12], [.24, -.45, .33, -.05]];
  for (let k = 0; k < 8; k++) {
    const x = -.24 + k * .07, yb = -.55 + Math.pow((x - .06) / .45, 2) * .12, len = .06 + h2(k, 7) * .05;
    hairLine(f, [x - .03, yb - len * .5, x, yb, x + .045, yb + len * .5], k % 3 === 1 ? 5 : 4, M.hairHe, .5);
  }
  for (const [rx, ry, tx, ty] of L) lpolyOn(capsulePts(...f(tx - .015, ty + .012), f.s * .013, ...f((rx + tx) / 2, (ry + ty) / 2 + .07), f.s * .024), 0, 2, MF.faceHe);
  if (o.keep) return f;
  lresolve({ lx: lit < 0 ? -.8 * f.d : .8 * f.d, ly: -.6, sd: Math.max(2, Math.round(f.s * .02)), amb: o.amb, add: o.add, rim: o.rim, rim2: o.rim2, a: o.a });
  eyeShine(f, e, o, 'he');
  return f;
}
function eyesHe(f, e, o) {
  if (f.s < 40) return tinyEyes(f, e, o, 'he');
  const gx = (o.gaze?.[0] ?? .3) * .02, gy = (o.gaze?.[1] ?? 0) * .012;
  const state = e.eyes || 'open';
  const eye = (cx, w, far) => {
    const y = .03, h = far ? .055 : .064;
    if (state === 'closed') {
      lpoly(HP(f, cx - w / 2, y).c(cx - w / 4, y + .02, cx + w / 4, y + .02, cx + w / 2, y + .002).l(cx + w / 2, y + .012).c(cx + w / 4, y + .032, cx - w / 4, y + .032, cx - w / 2, y + .012).pts(), MF.lashHe);
      return;
    }
    const lid = state === 'half' ? .42 : state === 'down' ? .3 : .06;
    const top = y - h / 2 + h * lid;
    lpoly(HP(f, cx - w / 2, y + .004).c(cx - w / 4, top - .006, cx + w / 4, top - .008, cx + w / 2, y - .004).c(cx + w / 4, y + h / 2, cx - w / 4, y + h / 2, cx - w / 2, y + .004).pts(), MF.sclera);
    const ix = cx + gx, iy = y + .006 + gy + (state === 'down' ? .01 : 0), ir = h * .58;
    rasterEll(...f(ix, iy), ir * f.s * (far ? .78 : .9), ir * f.s, (a, b, yy) => {
      for (let x = a; x <= b; x++) {
        const i = yy * W + x; if (LM[i] !== MF.sclera) continue;
        const cyy = f(ix, iy)[1], k = (yy - cyy) / (ir * f.s);
        LM[i] = MF.irisM; LV[i] = k < -.3 ? 1 : k < .2 ? 2 : 3;
      }
    });
    // 上眼皮线：直、外眼角略往下压
    lpoly(HP(f, cx - w / 2 - .005, y + .012).c(cx - w / 4, top - .018, cx + w / 4, top - .022, cx + w / 2 + .012, y - .012)
      .l(cx + w / 2 + .03, y - .02).l(cx + w / 2 + .016, y - .002).c(cx + w / 4, top + .004, cx - w / 4, top + .004, cx - w / 2, y + .018).pts(), MF.lashHe);
    lpoly(HP(f, cx - w / 3, top - .03).c(cx, top - .04, cx + w / 4, top - .038, cx + w / 2, top - .02).l(cx + w / 2, top - .012).c(cx + w / 4, top - .03, cx, top - .032, cx - w / 3, top - .022).pts(), MF.faceHe, 1);
    lpolyOn(HP(f, cx - w / 3, y + h / 2 + .004).c(cx, y + h / 2 + .012, cx + w / 4, y + h / 2 + .01, cx + w / 2, y + .004).l(cx + w / 2, y + .01).c(cx + w / 4, y + h / 2 + .018, cx, y + h / 2 + .02, cx - w / 3, y + h / 2 + .012).pts(), 0, 2, MF.faceHe);
  };
  eye(-.07, .16, false);
  eye(.29, .1, true);
  const bs = e.brows === 'sad' ? .018 : e.brows === 'frown' ? -.012 : 0;
  lpoly(HP(f, -.18, -.045 + bs).c(-.1, -.07, -.02, -.078 - bs * .5, .06, -.066).l(.06, -.048).c(-.02, -.058 - bs * .5, -.1, -.052, -.18, -.028 + bs).pts(), MF.browM);
  lpoly(HP(f, .23, -.064).c(.27, -.078 - bs * .5, .32, -.074, .365, -.054 + bs * .5).l(.365, -.042).c(.32, -.06, .27, -.062, .23, -.05).pts(), MF.browM);
}

function tinyEyes(f, e, o, who) {
  const st = e.eyes || 'open', s = f.s, d = f.d;
  const lash = who === 'she' ? MF.lash : MF.lashHe, brow = who === 'she' ? MF.browF : MF.browM;
  const face = who === 'she' ? MF.face : MF.faceHe;
  for (const [cx, far] of [[-.07, 0], [.29, 1]]) {
    const p = f(cx, .03), x = Math.round(p[0]), y = Math.round(p[1]);
    if (st === 'closed' || st === 'half') { lpx(x, y, lash); lpx(x + (far ? 0 : -d), y, lash); }
    else {
      lpx(x, y, lash); lpx(x, y - 1, lash);
      if (!far) { lpx(x - d, y - 1, lash); if (s >= 22) lpx(x - d, y, MF.irisF); }
      if (who === 'she') lpx(x + d * (far ? 1 : 1), y - 1, lash);
    }
    const b = f(cx - (far ? -.01 : .02), -.1), bx = Math.round(b[0]), by = Math.round(b[1]);
    lpx(bx, by, brow); if (!far) lpx(bx - d, by, brow); if (who === 'he') lpx(bx + d, by, brow);
  }
}
function eyesShe(f, e, o) {
  if (f.s < 40) return tinyEyes(f, e, o, 'she');
  const gx = (o.gaze?.[0] ?? .3) * .02, gy = (o.gaze?.[1] ?? 0) * .015;
  const state = e.eyes || 'open';
  const eye = (cx, w, far) => {
    // cx 眼睛中心，w 宽；far：远处那只（窄一点、内眼角被鼻梁挡住）
    const y = .03, h = (far ? .065 : .075);
    if (state === 'closed') {
      lpoly(HP(f, cx - w / 2, y).c(cx - w / 4, y + .03, cx + w / 4, y + .03, cx + w / 2 + .01, y - .005).l(cx + w / 2 + .01, y + .008).c(cx + w / 4, y + .045, cx - w / 4, y + .045, cx - w / 2, y + .014).pts(), MF.lash);
      lpoly(HP(f, cx + w / 2 - .01, y).l(cx + w / 2 + .04, y - .018).l(cx + w / 2 + .03, y + .004).pts(), MF.lash);
      return;
    }
    const lid = state === 'half' ? .45 : state === 'down' ? .3 : 0;
    // 眼白
    const top = y - h / 2 + h * lid;
    lpoly(HP(f, cx - w / 2, y + .005).c(cx - w / 4, top - .01, cx + w / 4, top - .012, cx + w / 2, y - .006).c(cx + w / 4, y + h / 2 + .004, cx - w / 4, y + h / 2, cx - w / 2, y + .005).pts(), MF.sclera);
    // 虹膜：圆，上面被上眼皮盖住
    const ix = cx + gx + (far ? .004 : 0), iy = y + .004 + gy + (state === 'down' ? .012 : 0), ir = h * .56;
    rasterEll(...f(ix, iy), ir * f.s * (far ? .8 : .92), ir * f.s, (a, b, yy) => {
      for (let x = a; x <= b; x++) {
        const i = yy * W + x; if (LM[i] !== MF.sclera) continue;
        const [, cyy] = f(ix, iy), k = (yy - cyy) / (ir * f.s);
        LM[i] = MF.irisF; LV[i] = k < -.35 ? 1 : k < .05 ? 2 : k < .45 ? 3 : 4;
      }
    });
    const pp = f(ix, iy + .004); lrect(pp[0] - .012 * f.s, pp[1] - .016 * f.s, .024 * f.s, .03 * f.s, MF.irisF, 0);
    // 上睫毛线（粗，外眼角往上挑）、双眼皮
    lpoly(HP(f, cx - w / 2 - .005, y + .012).c(cx - w / 4, top - .022, cx + w / 4, top - .026, cx + w / 2 + .015, y - .012)
      .l(cx + w / 2 + .05, y - .035).l(cx + w / 2 + .03, y - .005).c(cx + w / 4, top + .002, cx - w / 4, top + .004, cx - w / 2, y + .02).pts(), MF.lash);
    lpoly(HP(f, cx - w / 2 + .01, top - .03).c(cx - w / 6, top - .05, cx + w / 4, top - .05, cx + w / 2, top - .02).l(cx + w / 2, top - .012).c(cx + w / 4, top - .04, cx - w / 6, top - .04, cx - w / 2 + .01, top - .022).pts(), MF.faceHe, 1);
    // 卧蚕：下眼睑下面一条亮线
    if (!far) hairLine(f, [cx - w / 3, y + h / 2 + .022, cx + w / 6, y + h / 2 + .034, cx + w / 2, y + h / 2 + .004], 4, MF.faceHe, .45);
    // 下睫毛：外侧一半
    lpoly(HP(f, cx, y + h / 2 + .002).c(cx + w / 6, y + h / 2 + .006, cx + w / 3, y + h / 2 - .004, cx + w / 2 + .01, y - .004).l(cx + w / 2 + .01, y + .004).c(cx + w / 3, y + h / 2 + .004, cx + w / 6, y + h / 2 + .014, cx, y + h / 2 + .01).pts(), MF.faceHe, 1);
  };
  eye(-.07, .17, false);
  eye(.29, .1, true);
  // 眉毛：细、带一点弧
  const bs = e.brows === 'sad' ? .02 : 0;
  lpoly(HP(f, -.17, -.06 + bs).c(-.1, -.1 - bs, -.02, -.105 - bs * .5, .04, -.09).l(.04, -.08).c(-.02, -.09, -.1, -.088 - bs * .5, -.17, -.05 + bs).pts(), MF.browF);
  lpoly(HP(f, .24, -.088).c(.28, -.1 - bs * .5, .32, -.098, .36, -.08 + bs * .5).l(.36, -.07).c(.32, -.088, .28, -.09, .24, -.078).pts(), MF.browF);
}
/* 眼里的高光、眼泪：画在上色之后 */
function eyeShine(f, e, o, who) {
  if ((e.eyes || 'open') === 'closed') { if (e.tears) tearDrop(f, e, o); return; }
  const gx = (o.gaze?.[0] ?? .3) * .02, gy = (o.gaze?.[1] ?? 0) * .015;
  const s = f.s, big = Math.max(1, Math.round(s * .018)), sm = Math.max(1, Math.round(s * .009));
  const near = who === 'she' ? -.07 : -.07, far = .29;
  for (const [cx, k] of [[near, 1], [far, .75]]) {
    const p = f(cx + gx - .018, .02 + gy - .006), q = f(cx + gx + .014, .02 + gy + .02);
    rect(p[0] - big / 2, p[1] - big / 2, big * k + .5, big * k + .5, 0xffffff);
    rect(q[0], q[1], sm, sm, 0xffffff, .85);
  }
  if (e.tears) tearDrop(f, e, o);
}
function tearDrop(f, e, o) {
  // 眼泪：从下眼睑往下流的一道，带光
  const k = sat(e.tears), t = o.t || 0;
  const a = f(-.02, .08), b = f(.0, .08 + .3 * k);
  for (let i = 0; i <= 12; i++) {
    const x = lerp(a[0], b[0], i / 12) + Math.sin(i * .7) * .6, y = lerp(a[1], b[1], i / 12);
    px(x, y, hx('#CFE6FF'), .55); px(x + 1, y, hx('#FFFFFF'), .35);
  }
  const drop = f(.0, .08 + .3 * k + .01 * Math.sin(t * 3));
  circ(drop[0], drop[1], Math.max(1, f.s * .012), hx('#E8F4FF'), .9); glow(drop[0], drop[1], 4, hx('#BFDFFF'), .6);
}
