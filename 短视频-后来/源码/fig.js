'use strict';
/* fig.js —— 人物。一个人按"头身"u（身高 h / 7.3）搭骨架：侧面（side）、正面（front）、背面（back）三种视角。
   姿势用关节角（弧度，0 = 竖直向下，正 = 往前）。先画到离屏画布，再整体加明暗（受光一侧亮、背光一侧压暗）和轮廓光；
   剪影模式（sil）整个人一个颜色，只留轮廓光。
   人物：girl（十七岁的她：马尾、白衬衫、蓝色百褶裙、白袜）、boy（十七岁的他：白衬衫、深蓝长裤）、
        woman（长大的她：长发、米色风衣）、man（长大的他：深色大衣）、pass（路人，颜色按编号）。 */

const SKIN = '#F4D3BE', SKIN_SH = '#D9A992', HAIR = '#1E1A22';
const LOOK = {
  girl: { hair: HAIR, top: '#F6F3EC', topSh: '#C9CBD6', skirt: '#3A5DA6', skirtD: '#2C4884', skirtL: '#5578C0', sock: '#FAFAF7', shoe: '#2A2526', tie: '#2C4884', fem: 1 },
  boy: { hair: '#17141A', top: '#F4F3EF', topSh: '#C6CAD3', pants: '#27324F', shoe: '#E8E6E2', fem: 0 },
  woman: { hair: '#231C1E', coat: '#CDB592', coatD: '#A88E6C', pants: '#2B2A30', shoe: '#3A2E2A', fem: 1, long: 1 },
  man: { hair: '#1A1719', coat: '#2E3240', coatD: '#20232E', pants: '#22242C', shoe: '#1A1A1C', top: '#D8D6D2', fem: 0 },
};
function passLook(i) {
  const coats = ['#3B4252', '#5A4A42', '#2F3B4A', '#6B5B53', '#40384A', '#4F5A52', '#2A2D35', '#5C5047'];
  const r = hash(i, 5);
  return { hair: ['#1E1A22', '#2E241F', '#3A3030'][i % 3], coat: coats[mod(i * 5 + 3, coats.length)], coatD: shade(coats[mod(i * 5 + 3, coats.length)], .75), pants: r > .5 ? '#25262C' : '#3A3A40', shoe: '#1C1C1E', fem: r > .5 ? 1 : 0, long: r > .7 ? 1 : 0 };
}

/* ---------------- 姿势 ---------------- */
const POSE = {
  stand: () => ({ lean: 0, head: 0, legs: [{ th: .04, kn: .02 }, { th: -.05, kn: .02 }], arms: [{ sh: .05, el: .12 }, { sh: -.04, el: .1 }] }),
  /* 走路：p 是步态相位（每 1 走两步），stride 步幅 */
  walk: (p, stride = 1) => {
    const a = p * TAU, L = k => {
      const ph = a + k * PI, th = .36 * stride * Math.sin(ph);
      const kn = .04 + .8 * stride * Math.pow(Math.max(0, Math.cos(ph)), 2);   // 往前摆的那条腿膝盖弯
      return { th, kn, ft: -.25 * Math.max(0, Math.cos(ph)) };
    };
    return { lean: .04, head: -.02, bob: (1 - Math.abs(Math.sin(a))) * .07 * stride, legs: [L(0), L(1)], arms: [{ sh: -.3 * stride * Math.sin(a), el: .22 }, { sh: .3 * stride * Math.sin(a), el: .22 }] };
  },
  run: (p) => {
    const a = p * TAU, L = k => { const ph = a + k * PI; return { th: .7 * Math.sin(ph), kn: (Math.max(0, Math.sin(ph + 1.6)) * 1.6) + .2 }; };
    return { lean: .2, head: -.12, bob: Math.abs(Math.cos(a)) * .18 - .05, legs: [L(0), L(1)], arms: [{ sh: -.75 * Math.sin(a), el: 1.4 }, { sh: .75 * Math.sin(a), el: 1.4 }] };
  },
  /* 坐：胯降到凳面（seat 是凳面离地的高度，以 u 计） */
  /* 抱着膝盖坐（脚也在凳面上）：胯在给定 y 上方 0.45u */
  hug: () => ({ lean: .55, head: .5, hip: 3.37, legs: [{ th: 2.3, kn: 2.75 }, { th: 2.2, kn: 2.6 }], arms: [{ sh: 1.55, el: .95 }, { sh: 1.45, el: 1.0 }] }),
  sit: (seat = 1.95) => ({ lean: -.05, head: .05, hip: 3.82 - seat - .05, legs: [{ th: 1.52, kn: 1.5 }, { th: 1.45, kn: 1.4 }], arms: [{ sh: .5, el: .7 }, { sh: .4, el: .8 }] }),
};

/* ---------------- 主函数 ---------------- */
/* o: x, y（两脚中间、地面）, h（站直的身高）, who, view, dir（1 朝右 / −1 朝左，侧面用）, pose,
      light: { x, y（光从哪个方向来，单位向量）, rim: 轮廓光颜色, rimA, sh: 背光一侧压暗多少, col: 压暗的颜色 },
      sil: 剪影颜色, alpha, eyes: 'open'|'closed'|'down', blush, swing（马尾、长发往后甩的角度）, wind, umbrella, hold… */
function fig(g, o) {
  // 离屏画布用和 g 一样的变换（g 平移、缩放过也能画到画布外面的坐标），最后按屏幕像素贴回去
  const q = layer('fig'), M = g.getTransform();
  q.setTransform(M);
  const u = o.h / 7.3;
  q.save(); q.translate(o.x, o.y);
  if ((o.view || 'side') === 'side' && (o.dir || 1) < 0) q.scale(-1, 1);
  const look = o.look || (o.who === 'pass' ? passLook(o.i || 0) : LOOK[o.who || 'girl']);
  const P = Object.assign(POSE.stand(), o.pose || {});
  const view = o.view || 'side';
  if (view === 'side') drawSide(q, u, P, look, o);
  else drawFront(q, u, P, look, o, view === 'back');
  q.restore();
  // 手、头在屏幕上的位置（画伞、拿东西用）
  const sg = view === 'side' && (o.dir || 1) < 0 ? -1 : 1, G = p => [o.x + sg * p[0], o.y + p[1]];
  if (o._pts) { o.hand0 = G(o._pts.h0); o.hand1 = G(o._pts.h1); o.headP = G(o._pts.head); o.u = u; }
  if (o.pre) o.pre(q, u);
  // 明暗和轮廓光
  const L = o.light || { x: .6, y: -.8 };
  const bb = [o.x - o.h * .6, o.y - o.h * 1.15, o.h * 1.2, o.h * 1.3];
  if (o.sil) {
    q.save(); q.globalCompositeOperation = 'source-atop'; q.fillStyle = o.sil; q.fillRect(...bb); q.restore();
  } else if (L.sh !== 0) {
    const sh = L.sh === undefined ? .22 : L.sh, cx = o.x, cy = o.y - o.h * .5, d = o.h * .3;
    q.save(); q.globalCompositeOperation = 'source-atop';
    const lx = Math.sign(L.x || 1) * (o.view === 'side' && (o.dir || 1) < 0 ? 1 : 1);
    q.fillStyle = lg(q, cx + lx * d, cy, cx - lx * d, cy, [[0, 'rgba(0,0,0,0)'], [.5, 'rgba(0,0,0,0)'], [1, rgba(L.col || '#2A2440', sh)]]);
    q.fillRect(...bb);
    if (L.warm) { q.fillStyle = rgba(L.warm, (L.warmA || .5) * .35); q.fillRect(...bb); }
    q.restore();
  }
  if (L.rim) {
    const r = layer('figRim'), k = Math.max(1.5, o.h * Math.hypot(M.a, M.b) * (L.rimW || .005));
    r.drawImage(LAYER.fig, 0, 0);
    r.globalCompositeOperation = 'source-in'; r.fillStyle = L.rim; r.fillRect(0, 0, W, H);
    r.globalCompositeOperation = 'destination-out'; r.drawImage(LAYER.fig, -L.x * k, -L.y * k);
    q.save(); q.setTransform(1, 0, 0, 1, 0, 0); q.globalCompositeOperation = 'source-atop'; q.globalAlpha = L.rimA === undefined ? .9 : L.rimA; q.drawImage(LAYER.figRim, 0, 0); q.restore();
  }
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha *= (o.alpha === undefined ? 1 : o.alpha);
  if (o.blur) g.filter = `blur(${o.blur}px)`;
  g.drawImage(LAYER.fig, 0, 0);
  g.restore();
}

/* 关节点：从 (x,y) 沿角度 a（0 = 向下，正 = 往前）走 len */
const J = (x, y, a, len) => [x + Math.sin(a) * len, y + Math.cos(a) * len];

/* ---------------- 侧面（朝右画；朝左时外面整体翻转） ---------------- */
function drawSide(g, u, P, look, o) {
  const fem = look.fem, legLen = 1.92, shin = 1.78;
  const hipY = -(legLen + shin + .12) * u + (P.hip || 0) * u - (P.bob || 0) * u;
  const px = (P.px || 0) * u, py = hipY;
  const lean = P.lean || 0;
  const TO = (x, y) => [px + (x * Math.cos(lean) + y * Math.sin(lean)) * u, py + (-x * Math.sin(lean) * 0 + 0) + (x * Math.sin(lean) - y * Math.cos(lean)) * u];
  // 躯干坐标：x 往前、y 往上（以 u 计），转成画布坐标（考虑前倾）
  const T = (x, y) => [px + (x * Math.cos(lean) + y * Math.sin(lean)) * u, py + (x * Math.sin(lean) - y * Math.cos(lean)) * u];
  const neck = T(.02, 2.55), shoulder = T(-.04, 2.22);
  const headA = lean + (P.head || 0);
  const headC = [neck[0] + Math.sin(headA) * .62 * u + .06 * u, neck[1] - Math.cos(headA) * .62 * u];
  // 腿、胳膊的关节
  const leg = (L) => { const k = J(px, py, L.th, legLen * u), a = J(k[0], k[1], L.th - L.kn, shin * u); return { hip: [px, py], k, a, ft: L.ft || 0, th: L.th, sa: L.th - L.kn }; };
  const arm = (A) => { const e = J(shoulder[0], shoulder[1], A.sh + lean, 1.32 * u), w = J(e[0], e[1], A.sh + lean + A.el, 1.12 * u); return { s: shoulder, e, w, a: A.sh + lean + A.el, hand: A.hand }; };
  const legs = P.legs.map(leg), arms = P.arms.map(arm);
  const skin = SKIN, far = .82;   // 远侧的肢体压暗一点
  const C = (c, k) => k === 1 ? c : shade(c, k);
  const coatLong = !!look.coat;

  // 远侧胳膊 → 远侧腿 → 身体 → 近侧腿 → 近侧胳膊
  drawArmSide(g, u, arms[1], look, far, o);
  drawLegSide(g, u, legs[1], look, far, o);
  drawLegSide(g, u, legs[0], look, 1, o);
  // 长发在身后
  if (look.long) hairLongBack(g, u, headC, headA, look, o, T);
  if (o.who === 'girl' || look.pony) ponytail(g, u, headC, headA, look, o);
  // 躯干
  const torso = fem
    ? [[-.36, -.05], [-.3, .5], [-.26, 1.0], [-.34, 1.6], [-.36, 2.05], [-.2, 2.42], [.1, 2.45], [.3, 2.15], [.4, 1.75], [.3, 1.35], [.24, 1.0], [.32, .5], [.36, .05], [.1, -.22], [-.2, -.2]]
    : [[-.4, -.05], [-.36, .6], [-.38, 1.2], [-.44, 1.8], [-.4, 2.15], [-.22, 2.45], [.12, 2.45], [.36, 2.1], [.42, 1.6], [.34, 1.0], [.34, .5], [.36, .05], [.1, -.22], [-.2, -.2]];
  // 脖子
  capsule(g, ...T(0, 2.3), .15 * u, neck[0] + .03 * u, neck[1] - .1 * u, .14 * u, skin);
  if (coatLong) coatSide(g, u, T, legs, look, o);
  else {
    // 衬衫
    spline(g, torso.map(p => T(p[0], p[1]))); g.fillStyle = look.top; g.fill();
    // 衬衫的领子和褶
    g.strokeStyle = rgba(look.topSh, .8); g.lineWidth = .05 * u; g.lineCap = 'round';
    g.beginPath(); g.moveTo(...T(.05, 2.4)); g.quadraticCurveTo(...T(.22, 2.25), ...T(.3, 2.08)); g.stroke();
    g.beginPath(); g.moveTo(...T(-.15, 1.15)); g.quadraticCurveTo(...T(0, 1.3), ...T(.15, 1.12)); g.stroke();
    if (look.tie) { poly(g, [T(.24, 2.18), T(.36, 2.05), T(.3, 1.6), T(.22, 1.66)]); g.fillStyle = look.tie; g.fill(); }
    if (look.skirt && legs[0].th < .9) skirtSide(g, u, T, legs, look, o);
    else pantsTop(g, u, T, look);
  }
  if (look.skirt) skirtFront(g, u, T, legs, look, o);
  // 头
  headSide(g, u, headC, headA, look, o);
  drawArmSide(g, u, arms[0], look, 1, o);
  if (o.hold) o.hold(g, u, arms[0].w, arms[1].w, headC);
  o._pts = { h0: arms[0].w, h1: arms[1].w, head: headC };
}

function drawLegSide(g, u, L, look, k, o) {
  const C = c => k === 1 ? c : shade(c, k);
  const pants = look.pants && !look.skirt;
  if (pants) {
    const f = look.fem ? .82 : 1;
    capsule(g, L.hip[0], L.hip[1], .4 * f * u, L.k[0], L.k[1], .26 * f * u, C(look.pants));
    capsule(g, L.k[0], L.k[1], .26 * f * u, L.a[0], L.a[1], .19 * f * u, C(look.pants));
  } else {
    capsule(g, L.hip[0], L.hip[1], .36 * u, L.k[0], L.k[1], .22 * u, C(SKIN));
    capsule(g, L.k[0], L.k[1], .22 * u, L.a[0], L.a[1], .13 * u, C(SKIN));
    if (look.sock) {   // 白袜到小腿一半
      const m = [lerp(L.a[0], L.k[0], .45), lerp(L.a[1], L.k[1], .45)];
      capsule(g, m[0], m[1], .17 * u, L.a[0], L.a[1], .14 * u, C(look.sock));
    }
    if (look.coat) {   // 风衣下面是深色的袜子 / 裤子
      capsule(g, L.k[0], L.k[1], .2 * u, L.a[0], L.a[1], .14 * u, C(look.pants));
    }
  }
  // 鞋
  const fa = (L.ft || 0) + clamp((L.sa) * .5, -.4, .6) * 0;
  const toe = [L.a[0] + Math.cos(fa) * .62 * u, L.a[1] + Math.sin(fa) * .62 * u + .05 * u];
  g.fillStyle = C(look.shoe);
  spline(g, [[L.a[0] - .16 * u, L.a[1] - .08 * u], [L.a[0] + .1 * u, L.a[1] - .12 * u], [toe[0] - .05 * u, toe[1] - .12 * u], [toe[0] + .04 * u, toe[1] + .02 * u], [toe[0] - .1 * u, toe[1] + .1 * u], [L.a[0] - .16 * u, L.a[1] + .12 * u]]);
  g.fill();
}

function drawArmSide(g, u, A, look, k, o) {
  const C = c => k === 1 ? c : shade(c, k);
  const sleeveLong = !!look.coat, top = look.coat || look.top;
  if (sleeveLong) {
    capsule(g, A.s[0], A.s[1], .2 * u, A.e[0], A.e[1], .16 * u, C(top));
    capsule(g, A.e[0], A.e[1], .16 * u, A.w[0], A.w[1], .13 * u, C(top));
  } else {
    capsule(g, A.s[0], A.s[1], .15 * u, A.e[0], A.e[1], .12 * u, C(SKIN));
    capsule(g, A.e[0], A.e[1], .12 * u, A.w[0], A.w[1], .085 * u, C(SKIN));
    // 短袖
    const m = [lerp(A.s[0], A.e[0], .5), lerp(A.s[1], A.e[1], .5)];
    capsule(g, A.s[0], A.s[1], .19 * u, m[0], m[1], .15 * u, C(top));
  }
  // 手
  const hx = A.w[0] + Math.sin(A.a) * .15 * u, hy = A.w[1] + Math.cos(A.a) * .15 * u;
  ell(g, hx, hy, .085 * u, .15 * u, -A.a, C(SKIN));
}

function skirtSide(g, u, T, legs, look, o) {
  // 腰在躯干 y=1.0；下摆在两条大腿一半的高度，前后各比大腿多出一点，跟着腿摆
  const wb = T(-.28, 1.0), wf = T(.25, 1.0);
  const at = (L, f) => [lerp(L.hip[0], L.k[0], f), lerp(L.hip[1], L.k[1], f)];
  const sw = o.swing || 0, f = .5;
  const A = at(legs[0], f), B = at(legs[1], f);
  const front = A[0] > B[0] ? A : B, back = A[0] > B[0] ? B : A;
  const fr = [front[0] + .36 * u, front[1] + .02 * u], bk = [back[0] - .36 * u - sw * u, back[1] - sw * .3 * u];
  g.save();
  g.beginPath(); g.moveTo(...wb);
  g.quadraticCurveTo(wb[0] - .12 * u, lerp(wb[1], bk[1], .5), bk[0], bk[1]);
  // 下摆：褶子一折一折
  const n = 8;
  for (let i = 1; i <= n; i++) { const a = i / n; g.lineTo(lerp(bk[0], fr[0], a) - .05 * u, lerp(bk[1], fr[1], a) + (i % 2 ? .07 : 0) * u); }
  g.quadraticCurveTo(wf[0] + .12 * u, lerp(wf[1], fr[1], .5), wf[0], wf[1]);
  g.closePath(); g.fillStyle = look.skirt; g.fill(); g.clip();
  for (let i = 0; i < n; i++) {
    const a = (i + .5) / n, top = [lerp(wb[0], wf[0], a), lerp(wb[1], wf[1], a)], bot = [lerp(bk[0], fr[0], a), lerp(bk[1], fr[1], a) + .3 * u];
    g.beginPath(); g.moveTo(top[0] - .01 * u, top[1]); g.lineTo(bot[0] - .03 * u, bot[1]); g.lineTo(bot[0] + .12 * u, bot[1]); g.lineTo(top[0] + .05 * u, top[1]); g.closePath();
    g.fillStyle = i % 2 ? look.skirtD : look.skirtL; g.globalAlpha = .6; g.fill();
  }
  g.restore();
  g.strokeStyle = look.skirtD; g.lineWidth = .07 * u; g.beginPath(); g.moveTo(...wb); g.lineTo(...wf); g.stroke();
}

/* 近侧大腿压在裙子上时，再补一截裙子的前片（坐着时大腿是横的） */
function skirtFront(g, u, T, legs, look, o) {
  // 坐着：裙子从腰盖过臀部，顺着大腿上面铺到大腿七成，下摆垂下来一点
  const L = legs[0];
  if (L.th < .9) return;
  const dir = [Math.sin(L.th), Math.cos(L.th)], nrm = [-dir[1], dir[0]];   // 大腿方向、朝上的法线
  const up = s => [L.hip[0] + dir[0] * s * u - nrm[0] * .42 * u, L.hip[1] + dir[1] * s * u - nrm[1] * .42 * u];
  const end = up(1.45), wb = T(-.28, 1.0), wf = T(.25, 1.0);
  g.save();
  g.beginPath(); g.moveTo(...wb);
  g.quadraticCurveTo(wb[0] - .25 * u, L.hip[1] - .2 * u, L.hip[0] - .42 * u, L.hip[1] + .38 * u);
  g.lineTo(end[0] + .1 * u, L.hip[1] + .38 * u);
  g.lineTo(end[0] + .18 * u, end[1] + .55 * u);
  g.lineTo(end[0] + .05 * u, end[1]);
  g.quadraticCurveTo(lerp(wf[0], end[0], .4), up(.3)[1] - .05 * u, wf[0], wf[1]);
  g.closePath(); g.fillStyle = look.skirt; g.fill(); g.clip();
  for (let i = 0; i < 7; i++) {
    const a = (i + .5) / 7, x = lerp(L.hip[0] - .3 * u, end[0], a);
    g.beginPath(); g.moveTo(x, L.hip[1] - u); g.lineTo(x + .09 * u, L.hip[1] - u); g.lineTo(x + .2 * u, L.hip[1] + .6 * u); g.lineTo(x + .1 * u, L.hip[1] + .6 * u); g.closePath();
    g.fillStyle = i % 2 ? look.skirtD : look.skirtL; g.globalAlpha = .5; g.fill();
  }
  g.restore();
  g.strokeStyle = look.skirtD; g.lineWidth = .07 * u; g.beginPath(); g.moveTo(...wb); g.lineTo(...wf); g.stroke();
}
function pantsTop(g, u, T, look) {
  spline(g, [T(-.4, .9), T(.36, .9), T(.4, .1), T(.1, -.3), T(-.3, -.25), T(-.42, .2)]); g.fillStyle = look.pants; g.fill();
}
function coatSide(g, u, T, legs, look, o) {
  const fr = Math.max(...legs.map(L => lerp(L.hip[0], L.k[0], .95))) + .45 * u;
  const bk = Math.min(...legs.map(L => lerp(L.hip[0], L.k[0], .95))) - .45 * u - (o.swing || 0) * u;
  const hemY = Math.max(...legs.map(L => lerp(L.hip[1], L.k[1], .92)));
  const pts = [T(-.2, 2.45), T(-.44, 2.1), T(-.44, 1.4), T(-.38, .9), T(-.46, .1), [bk, hemY], [lerp(bk, fr, .5), hemY + .08 * u], [fr, hemY], T(.5, .1), T(.36, .95), T(.46, 1.6), T(.4, 2.15), T(.14, 2.48)];
  spline(g, pts, true, .4); g.fillStyle = look.coat; g.fill();
  g.save(); g.clip();
  // 腰带、前襟、领子
  g.fillStyle = look.coatD;
  poly(g, [T(-.5, 1.05), T(.55, 1.05), T(.55, .9), T(-.5, .9)]); g.fill();
  g.strokeStyle = look.coatD; g.lineWidth = .05 * u;
  g.beginPath(); g.moveTo(...T(.28, 2.2)); g.quadraticCurveTo(...T(.5, 1.4), ...T(.4, .9)); g.lineTo(fr - .1 * u, hemY); g.stroke();
  poly(g, [T(.05, 2.45), T(.38, 2.2), T(.3, 1.85), T(.12, 2.15)]); g.fillStyle = shade(look.coat, 1.08); g.fill();
  g.restore();
}

/* 侧脸：头骨 + 脸的轮廓（额头、鼻子、嘴、下巴） */
function headSide(g, u, c, a, look, o) {
  g.save(); g.translate(c[0], c[1]); g.rotate(a); g.scale(u, u);
  const fem = look.fem;
  // 脸
  g.fillStyle = SKIN;
  g.beginPath();
  g.moveTo(.16, .63);
  g.quadraticCurveTo(-.02, .6, -.1, .46);                 // 下颌
  g.lineTo(-.16, .14);                                     // 耳朵前面
  g.bezierCurveTo(-.5, .2, -.56, -.2, -.48, -.36);        // 后脑勺（被头发盖住）
  g.bezierCurveTo(-.36, -.6, -.1, -.66, .18, -.6);
  g.bezierCurveTo(.4, -.52, .46, -.3, .44, -.12);         // 额头
  g.bezierCurveTo(.45, -.02, .47, .04, .5, .12);          // 鼻梁
  g.lineTo(.55, .2); g.quadraticCurveTo(.52, .26, .46, .26);   // 鼻尖
  g.quadraticCurveTo(.48, .3, .47, .34);                  // 上唇
  g.quadraticCurveTo(.43, .37, .46, .4);                  // 嘴
  g.quadraticCurveTo(.46, .46, .4, .5);                   // 下唇
  g.bezierCurveTo(.4, .56, .3, .63, .16, .63);            // 下巴
  g.closePath(); g.fill();
  // 耳朵
  ell(g, -.08, .1, .08, .12, .2, SKIN_SH);
  // 眼睛
  const eyes = o.eyes || 'open';
  g.strokeStyle = '#2A2028'; g.lineCap = 'round';
  if (eyes === 'closed' || eyes === 'down') {
    g.lineWidth = .045; g.beginPath(); g.moveTo(.2, .04); g.quadraticCurveTo(.28, eyes === 'down' ? .1 : .09, .36, .05); g.stroke();
    if (fem) { g.lineWidth = .03; g.beginPath(); g.moveTo(.36, .05); g.lineTo(.41, .09); g.stroke(); }
  } else {
    ell(g, .3, .03, .045, .075, 0, '#2A2028');
    g.lineWidth = .04; g.beginPath(); g.moveTo(.22, -.05); g.quadraticCurveTo(.3, -.08, .38, -.03); g.stroke();
    if (fem) { g.lineWidth = .025; g.beginPath(); g.moveTo(.37, -.03); g.lineTo(.43, -.06); g.stroke(); }
  }
  if (o.smile) { g.strokeStyle = '#A85A50'; g.lineWidth = .03; g.beginPath(); g.moveTo(.44, .38); g.quadraticCurveTo(.4, .4, .37, .35); g.stroke(); }
  // 眉毛
  g.lineWidth = .035; g.strokeStyle = rgba(look.hair, .8);
  g.beginPath(); g.moveTo(.2, -.14); g.quadraticCurveTo(.3, -.18, .4, -.14); g.stroke();
  // 腮红
  if (o.blush) { g.globalAlpha = o.blush * .7; g.fillStyle = rg(g, .27, .23, 0, .1, [[0, '#F08C8C'], [1, 'rgba(240,140,140,0)']]); g.beginPath(); g.ellipse(.27, .23, .11, .06, 0, 0, TAU); g.fill(); g.globalAlpha = 1; }
  if (o.tear) { g.globalAlpha = o.tear; ell(g, .33, .2 + .25 * ((o.tearY || 0)), .025, .04, 0, '#E8F4FF'); g.globalAlpha = 1; }
  // 头发
  g.fillStyle = look.hair;
  if (look.long || o.who === 'girl') {
    g.beginPath();
    g.moveTo(.4, -.32);
    g.bezierCurveTo(.36, -.62, -.1, -.78, -.42, -.52);
    g.bezierCurveTo(-.64, -.3, -.64, .1, -.5, look.long ? .62 : .36);
    g.lineTo(look.long ? -.14 : -.2, look.long ? .5 : .26);
    g.bezierCurveTo(-.1, .1, -.12, -.05, .0, -.2);   // 鬓角在耳朵前面
    g.bezierCurveTo(.12, -.18, .22, -.22, .3, -.18);
    g.quadraticCurveTo(.38, -.12, .44, -.08);        // 刘海
    g.bezierCurveTo(.46, -.2, .44, -.28, .4, -.32);
    g.fill();
    // 几缕高光
    g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = .04;
    g.beginPath(); g.arc(-.06, -.12, .44, -2.4, -1.4); g.stroke();
  } else {
    g.beginPath();
    g.moveTo(.42, -.22);
    g.bezierCurveTo(.44, -.6, -.1, -.78, -.44, -.5);
    g.bezierCurveTo(-.62, -.3, -.6, .05, -.48, .3);
    g.lineTo(-.24, .26); g.bezierCurveTo(-.16, .05, -.1, -.05, .02, -.12);
    g.lineTo(.12, -.18); g.lineTo(.2, -.12); g.lineTo(.28, -.2); g.lineTo(.36, -.1); g.lineTo(.46, -.14);
    g.closePath(); g.fill();
    g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = .04;
    g.beginPath(); g.arc(-.06, -.12, .44, -2.4, -1.5); g.stroke();
  }
  g.restore();
}
function ponytail(g, u, c, a, look, o) {
  // 扎在后脑勺偏上，往后下方垂，swing 往后甩；发梢细
  const sw = o.swing || 0;
  const bx = c[0] + (-.42 * Math.cos(a) + .3 * Math.sin(a)) * u, by = c[1] + (-.42 * Math.sin(a) - .3 * Math.cos(a)) * u;
  g.save(); g.translate(bx, by); g.rotate(a * .25 + .25 + sw);   // 马尾往下垂，头低下去也不跟着横过来
  g.fillStyle = look.hair;
  g.beginPath(); g.moveTo(-.09 * u, 0);
  g.bezierCurveTo(-.24 * u, .4 * u, -.1 * u, 1.0 * u, -.2 * u, 1.65 * u);
  g.quadraticCurveTo(-.08 * u, 1.3 * u, .02 * u, 1.05 * u);
  g.bezierCurveTo(.1 * u, .7 * u, .08 * u, .3 * u, .09 * u, 0);
  g.closePath(); g.fill();
  ell(g, 0, .02 * u, .1 * u, .065 * u, 0, look.tie || '#2C4884');
  g.restore();
}
function hairLongBack(g, u, c, a, look, o, T) {
  const sw = (o.swing || 0) + (o.wind || 0) * .5;
  const top = [c[0] - .3 * u, c[1] - .3 * u];
  g.fillStyle = look.hair;
  g.beginPath(); g.moveTo(top[0] + .3 * u, top[1] - .2 * u);
  g.bezierCurveTo(top[0] - .5 * u, top[1], top[0] - .55 * u - sw * .6 * u, top[1] + 1.2 * u, top[0] - .3 * u - sw * 1.2 * u, top[1] + 2.4 * u);
  g.bezierCurveTo(top[0] - .05 * u - sw * .8 * u, top[1] + 2.3 * u, top[0] + .15 * u, top[1] + 1.6 * u, top[0] + .25 * u, top[1] + .8 * u);
  g.closePath(); g.fill();
}

/* ---------------- 正面 / 背面 ---------------- */
/* P.legs[i].sp 两腿张开的角度、P.arms[i].sh 胳膊往外抬、el 小臂往里弯；P.tilt 头歪 */
function drawFront(g, u, P, look, o, back) {
  const fem = look.fem, hipY = -(1.92 + 1.78 + .12) * u + (P.hip || 0) * u - (P.bob || 0) * u;
  const hipW = fem ? .34 : .34, shW = fem ? .5 : .64;
  const neck = [0, hipY - 2.55 * u], head = [0 + (P.hx || 0) * u, hipY - 3.15 * u];
  const legs = [-1, 1].map((s, i) => {
    const L = P.legs[i] || {}, sp = (L.sp === undefined ? .04 : L.sp) * s;
    if (P.sitF) {   // 正面坐着：大腿朝着镜头（看不见），小腿从凳面垂下来，sw 前后荡
      const h = [s * hipW * u * .8, hipY], k = [s * (hipW + .04) * u, hipY + .45 * u], a = [k[0] + (L.sw || 0) * u, k[1] + 1.7 * u];
      return { h: k, k, a, s };
    }
    const h = [s * hipW * u * .7, hipY], k = J(h[0], h[1], -sp, 1.92 * u), a = J(k[0], k[1], -sp * .6 + (L.kx || 0) * s, 1.78 * u);
    return { h, k, a, s };
  });
  const arms = [-1, 1].map((s, i) => {
    const A = P.arms[i] || {}, sh = (A.sh === undefined ? .1 : A.sh), el = A.el || 0;
    const S = [s * shW * u, hipY - 2.2 * u], e = J(S[0], S[1], -sh * s, 1.32 * u), w = J(e[0], e[1], (-sh + el) * s, 1.12 * u);
    return { S, e, w, s };
  });
  const top = look.coat || look.top, long = !!look.coat;
  // 长发在身后（正面看）
  if (!back && (look.long)) { ell(g, head[0], head[1] + .9 * u, .62 * u, 1.3 * u, 0, look.hair); }
  // 腿
  for (const L of legs) {
    const pants = look.pants && !look.skirt;
    if (pants) { capsule(g, L.h[0], L.h[1], .34 * u, L.k[0], L.k[1], .25 * u, look.pants); capsule(g, L.k[0], L.k[1], .25 * u, L.a[0], L.a[1], .19 * u, look.pants); }
    else {
      capsule(g, L.h[0], L.h[1], .3 * u, L.k[0], L.k[1], .2 * u, SKIN); capsule(g, L.k[0], L.k[1], .2 * u, L.a[0], L.a[1], .12 * u, SKIN);
      if (look.sock) capsule(g, lerp(L.a[0], L.k[0], .45), lerp(L.a[1], L.k[1], .45), .15 * u, L.a[0], L.a[1], .13 * u, look.sock);
      if (look.coat) capsule(g, L.k[0], L.k[1], .19 * u, L.a[0], L.a[1], .13 * u, look.pants);
    }
    ell(g, L.a[0] + L.s * .05 * u, L.a[1] + .08 * u, .2 * u, .14 * u, 0, look.shoe);
  }
  // 躯干
  const tw = (y) => y > 1.8 ? lerp(shW, .16, (y - 1.8) / .7) : y > 1.0 ? lerp(fem ? .3 : .36, shW, (y - 1.0) / .8) : lerp(hipW + .06, fem ? .3 : .36, y / 1.0);
  const ys = [-.15, .3, .7, 1.0, 1.4, 1.8, 2.15, 2.45];
  const pts = ys.map(y => [tw(y) * u, hipY - y * u]).concat(ys.slice().reverse().map(y => [-tw(y) * u, hipY - y * u]));
  capsule(g, 0, hipY - 2.3 * u, .14 * u, 0, neck[1] - .1 * u, .13 * u, SKIN);
  spline(g, pts, true, .4); g.fillStyle = long ? look.coat : top; g.fill();
  if (long) {   // 女：风衣收腰、到膝盖；男：大衣直筒、到大腿中间
    const hem = hipY + (fem ? 1.75 : 1.1) * u, fl = fem ? .78 : .6;
    poly(g, [[-.42 * u, hipY - 1.1 * u], [.42 * u, hipY - 1.1 * u], [fl * u, hem], [-fl * u, hem]]); g.fillStyle = look.coat; g.fill();
    if (fem) rect(g, -.36 * u, hipY - 1.08 * u, .72 * u, .13 * u, look.coatD);
    if (!back) {
      g.strokeStyle = look.coatD; g.lineWidth = .045 * u; g.beginPath(); g.moveTo(.04 * u, hipY - 2.3 * u); g.lineTo(.1 * u, hem); g.stroke();
      poly(g, [[-.16 * u, hipY - 2.48 * u], [0, hipY - 1.8 * u], [-.3 * u, hipY - 2.25 * u]]); g.fillStyle = shade(look.coat, 1.1); g.fill();
      poly(g, [[.16 * u, hipY - 2.48 * u], [0, hipY - 1.8 * u], [.3 * u, hipY - 2.25 * u]]); g.fill();
      if (look.top) { poly(g, [[-.13 * u, hipY - 2.46 * u], [.13 * u, hipY - 2.46 * u], [0, hipY - 1.95 * u]]); g.fillStyle = look.top; g.fill(); }
    }
  } else if (look.skirt && P.sitF) {   // 坐着：裙子铺在腿上，下摆到膝盖
    const hem = hipY + .5 * u;
    g.save();
    spline(g, [[-.34 * u, hipY - .98 * u], [.34 * u, hipY - .98 * u], [.66 * u, hipY + .1 * u], [.72 * u, hem], [0, hem + .1 * u], [-.72 * u, hem], [-.66 * u, hipY + .1 * u]], true, .3); g.fillStyle = look.skirt; g.fill(); g.clip();
    for (let i = 0; i < 12; i++) { const a = (i + .5) / 12 * 2 - 1; g.beginPath(); g.moveTo(a * .32 * u, hipY - u); g.lineTo(a * .74 * u - .04 * u, hem + .2 * u); g.lineTo(a * .74 * u + .08 * u, hem + .2 * u); g.closePath(); g.fillStyle = i % 2 ? look.skirtD : look.skirtL; g.globalAlpha = .55; g.fill(); }
    g.restore();
  } else if (look.skirt) {
    const hem = hipY + 1.0 * u, sw = o.swing || 0;
    g.save();
    spline(g, [[-.34 * u, hipY - .98 * u], [.34 * u, hipY - .98 * u], [.8 * u + sw * u, hem], [0, hem + .08 * u], [-.8 * u + sw * u, hem]], true, .25); g.fillStyle = look.skirt; g.fill(); g.clip();
    for (let i = 0; i < 12; i++) { const a = (i + .5) / 12 * 2 - 1; g.beginPath(); g.moveTo(a * .32 * u, hipY - u); g.lineTo(a * .85 * u - .04 * u + sw * u, hem + .2 * u); g.lineTo(a * .85 * u + .09 * u + sw * u, hem + .2 * u); g.closePath(); g.fillStyle = i % 2 ? look.skirtD : look.skirtL; g.globalAlpha = .55; g.fill(); }
    g.restore();
  } else if (look.pants) {
    spline(g, [[-.4 * u, hipY - .9 * u], [.4 * u, hipY - .9 * u], [.42 * u, hipY + .2 * u], [-.42 * u, hipY + .2 * u]], true, .2); g.fillStyle = look.pants; g.fill();
  }
  if (!back && !long) {   // 领子
    poly(g, [[-.22 * u, hipY - 2.45 * u], [0, hipY - 2.18 * u], [.22 * u, hipY - 2.45 * u], [.3 * u, hipY - 2.3 * u], [0, hipY - 2.0 * u], [-.3 * u, hipY - 2.3 * u]]); g.fillStyle = look.topSh || '#ccc'; g.globalAlpha = .7; g.fill(); g.globalAlpha = 1;
    if (look.tie) { poly(g, [[-.07 * u, hipY - 2.2 * u], [.07 * u, hipY - 2.2 * u], [.1 * u, hipY - 1.7 * u], [0, hipY - 1.6 * u], [-.1 * u, hipY - 1.7 * u]]); g.fillStyle = look.tie; g.fill(); }
  }
  // 胳膊
  for (const A of arms) {
    if (long) { capsule(g, A.S[0], A.S[1], .19 * u, A.e[0], A.e[1], .16 * u, look.coat); capsule(g, A.e[0], A.e[1], .16 * u, A.w[0], A.w[1], .13 * u, look.coat); }
    else {
      capsule(g, A.S[0], A.S[1], .14 * u, A.e[0], A.e[1], .11 * u, SKIN); capsule(g, A.e[0], A.e[1], .11 * u, A.w[0], A.w[1], .08 * u, SKIN);
      capsule(g, A.S[0], A.S[1], .17 * u, lerp(A.S[0], A.e[0], .45), lerp(A.S[1], A.e[1], .45), .14 * u, top);
    }
    ell(g, A.w[0], A.w[1] + .1 * u, .08 * u, .13 * u, 0, SKIN);
  }
  // 头
  headFront(g, u, head, look, o, back, P.tilt || 0);
  if (o.hold) o.hold(g, u, arms[0].w, arms[1].w, head);
  o._pts = { h0: arms[0].w, h1: arms[1].w, head };
}
function headFront(g, u, c, look, o, back, tilt) {
  g.save(); g.translate(c[0], c[1]); g.rotate(tilt); g.scale(u, u);
  const fem = look.fem;
  if (!back) {
    g.fillStyle = SKIN;
    g.beginPath(); g.moveTo(0, .6);
    g.bezierCurveTo(.26, .58, .44, .3, .44, -.05); g.bezierCurveTo(.44, -.45, .22, -.6, 0, -.6);
    g.bezierCurveTo(-.22, -.6, -.44, -.45, -.44, -.05); g.bezierCurveTo(-.44, .3, -.26, .58, 0, .6); g.fill();
    ell(g, .44, .08, .07, .12, 0, SKIN_SH); ell(g, -.44, .08, .07, .12, 0, SKIN_SH);
    const eyes = o.eyes || 'open';
    g.strokeStyle = '#2A2028'; g.lineCap = 'round'; g.lineWidth = .045;
    for (const s of [-1, 1]) {
      if (eyes === 'open') { const gz = (o.gaze || 0) * .05; ell(g, s * .17 + gz, .06, .05, .075, 0, '#2A2028'); circ(g, s * .17 + gz + .015, .04, .016, 'rgba(255,255,255,.8)'); }
      else { g.beginPath(); g.moveTo(s * .25, .06); g.quadraticCurveTo(s * .17, eyes === 'down' ? .12 : .11, s * .09, .06); g.stroke(); }
      g.lineWidth = .03; g.strokeStyle = rgba(look.hair, .8); g.beginPath(); g.moveTo(s * .26, -.1); g.quadraticCurveTo(s * .17, -.14, s * .08, -.1); g.stroke();
      g.strokeStyle = '#2A2028'; g.lineWidth = .045;
    }
    if (o.smile) { g.lineWidth = .03; g.strokeStyle = '#B0605A'; g.beginPath(); g.moveTo(-.07, .38); g.quadraticCurveTo(0, .42 + o.smile * .04, .07, .38); g.stroke(); }
    if (o.blush) { g.globalAlpha = o.blush; ell(g, .24, .25, .1, .055, 0, '#F08C8C'); ell(g, -.24, .25, .1, .055, 0, '#F08C8C'); g.globalAlpha = 1; }
    if (o.tear) { g.globalAlpha = o.tear; const ty = .14 + .35 * (o.tearY || 0); ell(g, .17, ty, .028, .042, 0, '#E8F4FF'); g.globalAlpha = 1; }
  }
  // 头发
  g.fillStyle = look.hair;
  if (back) {
    g.beginPath(); g.ellipse(0, -.02, .5, .62, 0, 0, TAU); g.fill();
    if (look.long) { g.beginPath(); g.moveTo(-.48, 0); g.bezierCurveTo(-.6, .9, -.5, 1.6, -.3 - (o.wind || 0) * .4, 2.3); g.lineTo(.3 - (o.wind || 0) * .5, 2.3); g.bezierCurveTo(.5, 1.6, .6, .9, .48, 0); g.fill(); }
    if (o.who === 'girl') { const w = o.swing || 0; g.beginPath(); g.moveTo(-.12, -.32); g.bezierCurveTo(-.24 + w, .5, -.12 + w * 1.4, 1.3, w * 1.8, 1.75); g.bezierCurveTo(.12 + w * 1.4, 1.2, .22, .5, .12, -.32); g.fill(); ell(g, 0, -.32, .12, .07, 0, look.tie); }
  } else if (look.long || o.who === 'girl') {
    g.beginPath();
    g.moveTo(-.48, .3); g.bezierCurveTo(-.56, -.3, -.4, -.68, 0, -.68); g.bezierCurveTo(.4, -.68, .56, -.3, .48, .3);
    g.bezierCurveTo(.44, .05, .4, -.12, .34, -.2);
    g.bezierCurveTo(.2, -.12, .05, -.18, .02, -.32);     // 刘海分开
    g.bezierCurveTo(-.08, -.16, -.25, -.1, -.38, -.18);
    g.bezierCurveTo(-.42, -.05, -.44, .1, -.48, .3); g.fill();
    if (look.long) { g.beginPath(); g.moveTo(-.44, 0); g.bezierCurveTo(-.56, .6, -.5, 1.1, -.62, 1.5); g.lineTo(-.4, 1.4); g.bezierCurveTo(-.38, .9, -.34, .4, -.34, .1); g.fill(); g.beginPath(); g.moveTo(.44, 0); g.bezierCurveTo(.56, .6, .5, 1.1, .62, 1.5); g.lineTo(.4, 1.4); g.bezierCurveTo(.38, .9, .34, .4, .34, .1); g.fill(); }
    g.strokeStyle = 'rgba(255,255,255,.14)'; g.lineWidth = .04; g.beginPath(); g.arc(0, -.15, .46, -2.6, -1.9); g.stroke();
  } else {
    g.beginPath(); g.moveTo(-.48, .1); g.bezierCurveTo(-.56, -.45, -.3, -.72, 0, -.7); g.bezierCurveTo(.3, -.72, .56, -.45, .48, .1);
    g.lineTo(.42, -.12); g.lineTo(.3, -.24); g.lineTo(.2, -.16); g.lineTo(.08, -.28); g.lineTo(-.04, -.18); g.lineTo(-.16, -.3); g.lineTo(-.28, -.18); g.lineTo(-.42, -.14); g.closePath(); g.fill();
  }
  g.restore();
}

/* ---------------- 简化的远景小人（人群用，画得快） ---------------- */
function tiny(g, x, y, h, col, o = {}) {
  const u = h / 7.3, p = o.p || 0, a = Math.sin(p * TAU) * .35 * (o.walk ? 1 : 0);
  g.fillStyle = col;
  capsule(g, x, y - 3.6 * u, .3 * u, x + Math.sin(a) * 3.4 * u, y, .16 * u);
  capsule(g, x, y - 3.6 * u, .3 * u, x - Math.sin(a) * 3.4 * u, y, .16 * u);
  spline(g, [[x - .55 * u, y - 6.0 * u], [x + .55 * u, y - 6.0 * u], [x + .5 * u, y - 3.3 * u], [x - .5 * u, y - 3.3 * u]], true, .3); g.fill();
  if (o.coat) { poly(g, [[x - .6 * u, y - 4.5 * u], [x + .6 * u, y - 4.5 * u], [x + .75 * u, y - 2.4 * u], [x - .75 * u, y - 2.4 * u]]); g.fill(); }
  circ(g, x, y - 6.7 * u, .5 * u);
}
