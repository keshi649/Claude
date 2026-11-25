'use strict';
/* chars.js：角色。
   "她"：长头发，夜里穿粉色睡衣；"他"：短头发，夜里穿灰色卫衣。都是侧面的二维骨骼（头、躯干、两条胳膊、两条腿），
   另有正面半身（镜子、手机特写、拥抱）和背面（看窗外）。
   玩偶：用户给的 12×8 像素小怪做成的毛绒玩偶。她送他的是橙色那只，她自己留着粉色那只；魔法发生时眼睛会亮、会飞。
   每个角色先画到离屏画布上，再统一打光：整体按场景的环境光染色、背光一侧压暗、迎光一侧描一道亮边，然后才贴到画面上。 */

const SKIN = '#F6D7C3', SKIN_S = '#E4B7A0';
const LOOK = {
  she: {
    hair: '#3A2630', hairL: '#6B4652', skin: SKIN,
    pj: { top: '#F3B9C8', topS: '#E296AC', trim: '#FFF0F4', pants: '#E9A7BA', shoe: '#FFF0F4' },
    day: { top: '#FFF3D6', topS: '#F0D9A8', trim: '#FFFFFF', pants: '#8FB3D9', shoe: '#F5F1EA' },
    coat: { top: '#E8D2C0', topS: '#CDB49F', trim: '#F7EEE6', pants: '#6E6A80', shoe: '#5B4A48' },
  },
  stranger: {
    hair: '#7A4A32', hairL: '#A8704E', skin: '#F2D2BE',
    coat: { top: '#C9B2D6', topS: '#AE96BE', trim: '#EFE6F4', pants: '#4A4660', shoe: '#3A3040' },
  },
  he: {
    hair: '#1E1D27', hairL: '#3E3D52', skin: '#F2CFB8',
    hoodie: { top: '#8A93A8', topS: '#6E768C', trim: '#B9C0D0', pants: '#2F3550', shoe: '#E9ECF2' },
    shirt: { top: '#D9E6F6', topS: '#B8CBE4', trim: '#F4F8FF', pants: '#3A4058', shoe: '#5A4840' },
    coat: { top: '#3C4258', topS: '#2B3044', trim: '#5A6178', pants: '#262A3A', shoe: '#1E1E26' },
  },
};

/* 姿势：躯干倾斜 tilt、低头 head；胳膊 [大臂, 小臂弯]、腿 [大腿, 小腿弯]，角度相对躯干，0 = 朝下，正 = 往前 */
const POSE = {
  stand: { tilt: 0, head: 0, aN: [.08, .12], aF: [-.1, .14], lN: [.02, 0], lF: [-.04, 0] },
  sit: { tilt: -.04, head: .05, aN: [.35, .9], aF: [.3, .95], lN: [1.5, -1.45], lF: [1.45, -1.5] },
  sitHug: { tilt: .12, head: .15, aN: [.55, 1.75], aF: [.5, 1.8], lN: [1.5, -1.45], lF: [1.45, -1.5] },
  fly: { tilt: 1.25, head: -.75, aN: [2.6, .15], aF: [2.3, .2], lN: [-.1, -.35], lF: [-.25, -.6] },
  float: { tilt: .15, head: -.1, aN: [.9, .2], aF: [-.6, .3], lN: [.3, -.7], lF: [-.2, -.4] },
  reach: { tilt: .1, head: -.15, aN: [1.9, .1], aF: [.4, .5], lN: [.05, 0], lF: [-.2, -.1] },
  lookUp: { tilt: -.12, head: -.55, aN: [.05, .1], aF: [-.08, .1], lN: [.02, 0], lF: [-.04, 0] },
  hug: { tilt: .12, head: .08, aN: [1.25, 1.35], aF: [1.15, 1.45], lN: [.05, 0], lF: [-.08, 0] },
  phone: { tilt: .06, head: .35, aN: [.35, 1.9], aF: [.25, 1.95], lN: [.02, 0], lF: [-.04, 0] },
  counter: { tilt: .1, head: .25, aN: [.75, .6], aF: [.65, .7], lN: [.02, 0], lF: [-.04, 0] },
  collar: { tilt: .02, head: -.2, aN: [2.2, .9], aF: [2.0, 1.0], lN: [.02, 0], lF: [-.06, 0] },
};
function lerpPose(a, b, u) {
  const o = {};
  for (const k in a) o[k] = Array.isArray(a[k]) ? a[k].map((v, i) => lerp(v, b[k][i], u)) : lerp(a[k], b[k], u);
  return o;
}
/* 走路、跑步：ph 是步态相位（每步 0..1） */
function walkPose(ph, run = 0) {
  const s1 = Math.sin(ph * TAU), c1 = Math.cos(ph * TAU);
  const A = lerp(.45, .9, run), K = lerp(.5, 1.3, run);
  return {
    tilt: lerp(.04, .22, run), head: lerp(0, -.1, run),
    aN: [-s1 * lerp(.4, .9, run), lerp(.2, 1.4, run)], aF: [s1 * lerp(.4, .9, run), lerp(.2, 1.4, run)],
    lN: [s1 * A, -Math.max(0, -c1) * K - .05], lF: [-s1 * A, -Math.max(0, c1) * K - .05],
  };
}

const dir = th => [Math.sin(th), Math.cos(th)];
/* 离屏画布：每个角色画在自己的一块上，再打光贴图。按需要的大小分档缓存（太小会糊，太大打光慢） */
const _bufs = {};
let _bufFlip = 0;
function charBuf(S) {
  S = Math.min(2400, Math.max(300, Math.ceil(S / 100) * 100));
  const key = S + '_' + (_bufFlip = 1 - _bufFlip);
  if (!_bufs[key]) { const c = mk(S, S); _bufs[key] = { c, g: c.getContext('2d'), S, rim: mk(S, S), mask: mk(S, S) }; }
  return _bufs[key];
}

/* 画一个侧面的人。o：who('she'|'he'), x, y（胯部的位置）, u（头半径，像素）, face（1 朝右 / -1 朝左）, pose,
   eyes('open'|'closed'|'half'|'happy'|'wide'), mouth('n'|'smile'|'o'|'sad'), blush, tired（黑眼圈）, tear,
   outfit, wind（[wx, wy]，头发和衣角往哪飘）, t（时间，头发飘动用）, light（见 litChar） */
function person(g, o) {
  const u = o.u, B = charBuf(u * 13 + 60), S = B.S, half = S / 2, cg = B.g;
  // 角色在离屏画布里的比例：最大约 ±6.5 个头半径
  const k = Math.min(1, (half - 20) / (u * 6.5));
  cg.setTransform(1, 0, 0, 1, 0, 0); cg.globalAlpha = 1; cg.globalCompositeOperation = 'source-over';
  cg.clearRect(0, 0, S, S);
  cg.translate(half, half); cg.scale(k, k);
  if ((o.face ?? 1) < 0) cg.scale(-1, 1);
  if (o.rot) cg.rotate(o.rot);
  drawBody(cg, { ...o, u });
  litChar(B, o.light || LIGHT.night, u * k);
  withAlpha(g, o.alpha ?? 1, () => g.drawImage(B.c, o.x - half / k, o.y - half / k, S / k, S / k));
}

function drawBody(g, o) {
  const u = o.u, who = o.who || 'she', L = LOOK[who];
  const cl = L[o.outfit || (who === 'she' ? 'pj' : 'hoodie')];
  const P = o.pose || POSE.stand, tilt = P.tilt;
  const t = o.t || 0, wind = o.wind || [0, 0];
  const wa = a => a - tilt;
  const Hp = [0, 0];
  const up = dir(Math.PI - tilt);
  const Sh = [Hp[0] + up[0] * 2.05 * u, Hp[1] + up[1] * 2.05 * u];
  const Nk = [Hp[0] + up[0] * 2.3 * u, Hp[1] + up[1] * 2.3 * u];
  const hd = dir(Math.PI - tilt - P.head * .8);
  const Hc = [Nk[0] + hd[0] * 1.18 * u + up[0] * .0, Nk[1] + hd[1] * 1.18 * u];
  const headRot = tilt + P.head;
  const limb = (base, ang, l1, l2) => {
    const d1 = dir(wa(ang[0])), j = [base[0] + d1[0] * l1 * u, base[1] + d1[1] * l1 * u];
    const d2 = dir(wa(ang[0]) + ang[1]), e = [j[0] + d2[0] * l2 * u, j[1] + d2[1] * l2 * u];
    return [base, j, e, wa(ang[0]) + ang[1]];
  };
  const armN = limb([Sh[0] + .1 * u, Sh[1]], P.aN, 1.42, 1.32), armF = limb([Sh[0] - .1 * u, Sh[1]], P.aF, 1.42, 1.32);
  const legN = limb([.12 * u, 0], P.lN, 1.62, 1.58), legF = limb([-.12 * u, 0], P.lF, 1.62, 1.58);
  const seg2 = (pts, col, w) => { g.beginPath(); g.moveTo(...pts[0]); g.lineTo(...pts[1]); g.lineTo(...pts[2]); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); };
  const foot = (lg, col) => {
    const a = lg[3], fx = dir(a + Math.PI / 2), e = lg[2];
    g.save(); g.translate(e[0], e[1]); g.rotate(Math.atan2(fx[1], fx[0]));
    rr(g, -.22 * u, -.2 * u, .78 * u, .36 * u, .17 * u); fs(g, col); g.restore();
  };
  const hand = (ar, col = L.skin) => { circ(g, ar[2][0], ar[2][1], .24 * u); fs(g, col); };
  const darker = c => shade(c, .82);

  // 长发（她）：在身体后面
  if (who === 'she' || who === 'stranger') hairBack(g, Hc, headRot, u, L, t, wind, o.hairLen ?? (who === 'stranger' ? .55 : 1));
  // 远侧的腿和胳膊
  seg2(legF, darker(cl.pants), .56 * u); foot(legF, darker(cl.shoe));
  seg2(armF, darker(cl.top), .46 * u); hand(armF, shade(L.skin, .9));
  if (o.holdF) { g.save(); g.translate(...armF[2]); o.holdF(g, u); g.restore(); }
  // 卫衣的帽子（他）：脖子后面
  if (who === 'he' && (o.outfit || 'hoodie') === 'hoodie') { ell(g, Nk[0] - .55 * u * Math.cos(tilt), Nk[1] + .1 * u, .55 * u, .42 * u, -tilt); fs(g, cl.topS); }
  // 躯干
  g.save(); g.translate(Hp[0], Hp[1]); g.rotate(tilt);
  g.beginPath();
  g.moveTo(-.5 * u, .15 * u); g.quadraticCurveTo(-.62 * u, -1.1 * u, -.5 * u, -2.15 * u);
  g.quadraticCurveTo(0, -2.5 * u, .45 * u, -2.15 * u); g.quadraticCurveTo(.66 * u, -1.1 * u, .52 * u, .15 * u);
  g.closePath(); fs(g, cl.top);
  // 衣服下摆、领口
  g.beginPath(); g.moveTo(-.52 * u, .05 * u); g.lineTo(.54 * u, .05 * u); g.strokeStyle = cl.topS; g.lineWidth = .14 * u; g.stroke();
  if (o.outfit === 'shirt') { poly(g, [[-.05 * u, -2.3 * u], [.38 * u, -2.0 * u], [.3 * u, -2.32 * u]]); fs(g, cl.trim); poly(g, [[.05 * u, -1.95 * u], [.05 * u, -.1 * u]], false); g.strokeStyle = cl.topS; g.lineWidth = .05 * u; g.stroke(); }
  else { g.beginPath(); g.arc(.05 * u, -2.22 * u, .32 * u, .2, Math.PI - .2); g.strokeStyle = cl.trim; g.lineWidth = .1 * u; g.stroke(); }
  if (who === 'he' && (o.outfit || 'hoodie') === 'hoodie') { line(g, .3 * u, -2.0 * u, .36 * u, -1.35 * u, cl.trim, .05 * u); }
  g.restore();
  // 脖子
  line(g, Nk[0] - up[0] * .25 * u, Nk[1] - up[1] * .25 * u, Nk[0] + hd[0] * .35 * u, Nk[1] + hd[1] * .35 * u, L.skin, .42 * u);
  // 近侧的腿
  seg2(legN, cl.pants, .58 * u); foot(legN, cl.shoe);
  // 头
  head(g, Hc, headRot, u, who, L, o);
  // 近侧的胳膊
  seg2(armN, cl.top, .48 * u); hand(armN);
  if (o.holdN) { g.save(); g.translate(...armN[2]); o.holdN(g, u); g.restore(); }
  if (o.extra) o.extra(g, { Hc, Sh, Nk, armN, armF, legN, legF, u, tilt, headRot });
}

/* 她的长发：从头顶往后、往下垂，发梢跟着风飘 */
function hairBack(g, Hc, rot, u, L, t, wind, len = 1) {
  const [wx, wy] = wind;
  const n = 8, back = [], front = [];
  for (let i = 0; i <= n; i++) {
    const v = i / n;
    const sway = Math.sin(t * 2.2 - v * 3) * .2 * u * v + noise1(t * .8 + v * 2, 4) * .14 * u * v;
    const cx = -.62 * u - v * .5 * u + wx * v * v * 1.7 * u + sway, cy = -.1 * u + v * 3.0 * u * len + wy * v * v * 1.3 * u;
    const w = (1 - v * .55) * .62 * u;
    back.push([cx - w, cy]); front.push([cx + w * .9, cy]);
  }
  g.save(); g.translate(Hc[0], Hc[1]); g.rotate(rot * .45);
  g.beginPath();
  g.moveTo(.35 * u, -1.0 * u);
  g.quadraticCurveTo(-1.35 * u, -1.15 * u, back[0][0], back[0][1]);
  smoothPathTo(g, back);
  const tip = back[n], tf = front[n];
  g.quadraticCurveTo((tip[0] + tf[0]) / 2, tip[1] + .3 * u, tf[0], tf[1]);
  smoothPathTo(g, front.slice().reverse());
  g.quadraticCurveTo(.1 * u, .1 * u, .55 * u, -.25 * u);
  g.closePath(); fs(g, L.hair);
  // 发丝的亮光
  g.beginPath(); smoothPath(g, back.map(([x, y], i) => [lerp(x, front[i][0], .55), y]).slice(1, n)); g.strokeStyle = rgba(L.hairL, .45); g.lineWidth = .07 * u; g.stroke();
  g.restore();
}
/* 从当前点接着画一串点的平滑曲线 */
function smoothPathTo(g, pts) {
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[Math.max(0, i - 2)], p1 = pts[i - 1], p2 = pts[i], p3 = pts[Math.min(pts.length - 1, i + 1)];
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
}

function head(g, Hc, rot, u, who, L, o) {
  g.save(); g.translate(Hc[0], Hc[1]); g.rotate(rot);
  // 耳朵（他）
  if (who === 'he') { ell(g, -.18 * u, .08 * u, .2 * u, .26 * u); fs(g, shade(L.skin, .95)); }
  // 脸
  g.beginPath(); g.ellipse(0, 0, u, u * 1.02, 0, 0, TAU); fs(g, L.skin);
  ell(g, .9 * u, .18 * u, .16 * u, .13 * u); fs(g, L.skin);                // 鼻尖
  ell(g, .55 * u, .62 * u, .42 * u, .36 * u); fs(g, L.skin);               // 下巴
  // 腮红
  if (o.blush) { ell(g, .45 * u, .38 * u, .22 * u, .12 * u); fs(g, `rgba(240,120,140,${.45 * o.blush})`); }
  // 黑眼圈
  if (o.tired) { g.beginPath(); g.ellipse(.43 * u, .1 * u, .2 * u, .12 * u, 0, .2, Math.PI - .2); g.strokeStyle = `rgba(110,80,140,${.6 * o.tired})`; g.lineWidth = .07 * u; g.stroke(); }
  // 眼睛
  const ex = .44 * u, ey = -.08 * u, ev = o.eyes || 'open';
  const ink = '#2A1E2C';
  if (ev === 'open' || ev === 'wide') {
    const s = ev === 'wide' ? 1.2 : 1;
    ell(g, ex, ey, .12 * u * s, .17 * u * s); fs(g, ink);
    circ(g, ex + .04 * u, ey - .06 * u, .045 * u * s); fs(g, '#FFFFFF');
  } else if (ev === 'half') {
    g.save(); g.beginPath(); g.rect(ex - .2 * u, ey - .02 * u, .4 * u, .3 * u); g.clip();
    ell(g, ex, ey, .12 * u, .17 * u); fs(g, ink); g.restore();
    line(g, ex - .16 * u, ey - .02 * u, ex + .15 * u, ey - .03 * u, ink, .05 * u);
  } else if (ev === 'closed') {
    g.beginPath(); g.arc(ex, ey - .02 * u, .13 * u, .25, Math.PI - .25); g.strokeStyle = ink; g.lineWidth = .055 * u; g.lineCap = 'round'; g.stroke();
  } else if (ev === 'happy') {
    g.beginPath(); g.arc(ex, ey + .06 * u, .13 * u, Math.PI + .3, -.3); g.strokeStyle = ink; g.lineWidth = .055 * u; g.lineCap = 'round'; g.stroke();
  }
  // 眉毛
  const bw = o.brow || 0;
  g.beginPath(); g.moveTo(ex - .17 * u, ey - .32 * u + bw * .05 * u); g.quadraticCurveTo(ex, ey - .4 * u - bw * .06 * u, ex + .17 * u, ey - .33 * u - bw * .1 * u);
  g.strokeStyle = shade(L.hair, 1.1); g.lineWidth = .05 * u; g.stroke();
  // 眼泪
  if (o.tear) { const ty = ey + .25 * u + o.tear * .55 * u; g.beginPath(); g.moveTo(ex + .02 * u, ty - .12 * u); g.quadraticCurveTo(ex + .1 * u, ty + .02 * u, ex + .02 * u, ty + .06 * u); g.quadraticCurveTo(ex - .06 * u, ty + .02 * u, ex + .02 * u, ty - .12 * u); fs(g, 'rgba(170,215,255,.9)'); }
  // 嘴
  const mo = o.mouth || 'n', mx = .66 * u, my = .55 * u;
  g.strokeStyle = '#9C5A5E'; g.lineWidth = .045 * u; g.lineCap = 'round';
  if (mo === 'smile') { g.beginPath(); g.arc(mx - .02 * u, my - .1 * u, .12 * u, .5, 1.9); g.stroke(); }
  else if (mo === 'o') { ell(g, mx, my, .06 * u, .08 * u); fs(g, '#9C5A5E'); }
  else if (mo === 'sad') { g.beginPath(); g.arc(mx - .02 * u, my + .1 * u, .1 * u, -1.9, -.6); g.stroke(); }
  else { line(g, mx - .08 * u, my, mx + .04 * u, my - .01 * u, '#9C5A5E', .045 * u); }
  // 头发（前面那层）
  if (who === 'she' || who === 'stranger') {
    g.beginPath();
    g.moveTo(-1.05 * u, .35 * u);
    g.quadraticCurveTo(-1.15 * u, -1.0 * u, .05 * u, -1.12 * u);
    g.quadraticCurveTo(.85 * u, -1.05 * u, 1.02 * u, -.4 * u);
    g.quadraticCurveTo(.75 * u, -.62 * u, .55 * u, -.35 * u);          // 刘海
    g.quadraticCurveTo(.4 * u, -.62 * u, .15 * u, -.52 * u);
    g.quadraticCurveTo(-.1 * u, -.45 * u, -.3 * u, .1 * u);
    g.quadraticCurveTo(-.45 * u, .6 * u, -.85 * u, .9 * u);
    g.closePath(); fs(g, L.hair);
    g.beginPath(); g.arc(-.1 * u, -.15 * u, .78 * u, -2.4, -1.5); g.strokeStyle = rgba(L.hairL, .7); g.lineWidth = .1 * u; g.stroke();
  } else {
    g.beginPath();
    g.moveTo(-1.02 * u, .2 * u);
    g.quadraticCurveTo(-1.18 * u, -.9 * u, -.2 * u, -1.15 * u);
    g.lineTo(-.05 * u, -1.35 * u); g.lineTo(.12 * u, -1.12 * u); g.lineTo(.42 * u, -1.25 * u); g.lineTo(.48 * u, -1.0 * u);
    g.quadraticCurveTo(1.0 * u, -.85 * u, 1.04 * u, -.38 * u);
    g.quadraticCurveTo(.8 * u, -.5 * u, .62 * u, -.42 * u);
    g.quadraticCurveTo(.4 * u, -.66 * u, .1 * u, -.55 * u);
    g.quadraticCurveTo(-.25 * u, -.5 * u, -.42 * u, -.2 * u);
    g.quadraticCurveTo(-.55 * u, .1 * u, -.7 * u, .5 * u);
    g.closePath(); fs(g, L.hair);
    g.beginPath(); g.arc(-.15 * u, -.2 * u, .78 * u, -2.5, -1.7); g.strokeStyle = rgba(L.hairL, .8); g.lineWidth = .09 * u; g.stroke();
  }
  g.restore();
}

/* 打光：amb 环境色（正片叠底染色），shade 背光一侧压暗，rim 迎光一侧的亮边。lx, ly 是光从哪个方向来（单位向量） */
const LIGHT = {
  night: { amb: '#7F8CCB', ambA: .38, lx: .7, ly: -.7, rim: '#C9D6FF', rimA: .7, shadeA: .32 },
  moon: { amb: '#8D9AD6', ambA: .3, lx: .8, ly: -.6, rim: '#FFF2D2', rimA: .85, shadeA: .3 },
  warm: { amb: '#FFD9B0', ambA: .18, lx: -.7, ly: -.5, rim: '#FFE6BF', rimA: .5, shadeA: .22 },
  room: { amb: '#6E79B8', ambA: .42, lx: .9, ly: -.3, rim: '#BFD0FF', rimA: .6, shadeA: .35 },
  lamp: { amb: '#FFC891', ambA: .25, lx: -.8, ly: -.4, rim: '#FFD7A0', rimA: .55, shadeA: .3 },
  day: { amb: '#FFF6EA', ambA: .05, lx: .6, ly: -.8, rim: '#FFFFFF', rimA: .3, shadeA: .16 },
  rain: { amb: '#9AA7BC', ambA: .3, lx: -.5, ly: -.8, rim: '#E6EEFF', rimA: .35, shadeA: .25 },
  dream: { amb: '#C9A2E6', ambA: .25, lx: .5, ly: -.85, rim: '#FFE1F1', rimA: .8, shadeA: .25 },
  sea: { amb: '#5AA8C8', ambA: .4, lx: .2, ly: -1, rim: '#C6F4FF', rimA: .7, shadeA: .3 },
  forest: { amb: '#5FB8A8', ambA: .35, lx: -.6, ly: -.6, rim: '#C8FFE8', rimA: .75, shadeA: .3 },
  sunset: { amb: '#F2A07A', ambA: .25, lx: -.9, ly: -.2, rim: '#FFD8A0', rimA: .8, shadeA: .3 },
  dawn: { amb: '#FFC8B8', ambA: .22, lx: .2, ly: 1, rim: '#FFE6D0', rimA: .6, shadeA: .2 },
  sil: { amb: '#1A1838', ambA: .85, lx: .7, ly: -.7, rim: '#FFE7C4', rimA: .9, shadeA: 0 },
};
function litChar(B, L, u) {
  const cg = B.g, S = B.S, cc = B.c;
  cg.setTransform(1, 0, 0, 1, 0, 0);
  // 先存一份轮廓：multiply 会把透明处也染上色，染完要按轮廓裁回来
  const mg = B.mask.getContext('2d'); mg.setTransform(1, 0, 0, 1, 0, 0); mg.globalCompositeOperation = 'copy'; mg.drawImage(cc, 0, 0); mg.globalCompositeOperation = 'source-over';
  // 亮边：轮廓往背光方向挪一点，挖掉，剩下迎光那一圈
  const rw = clamp(u * .1, 2, 10);
  if (L.rimA > 0) {
    const rg = B.rim.getContext('2d');
    rg.setTransform(1, 0, 0, 1, 0, 0); rg.globalCompositeOperation = 'copy'; rg.globalAlpha = 1; rg.drawImage(B.mask, 0, 0);
    rg.globalCompositeOperation = 'destination-out'; rg.drawImage(B.mask, -L.lx * rw, -L.ly * rw);
    rg.globalCompositeOperation = 'source-in'; rg.fillStyle = L.rim; rg.fillRect(0, 0, S, S);
    rg.globalCompositeOperation = 'source-over';
  }
  if (L.ambA > 0) {
    cg.globalCompositeOperation = 'multiply'; cg.globalAlpha = L.ambA; cg.fillStyle = L.amb; cg.fillRect(0, 0, S, S);
    cg.globalAlpha = 1; cg.globalCompositeOperation = 'destination-in'; cg.drawImage(B.mask, 0, 0);
  }
  if (L.shadeA > 0) {
    cg.globalCompositeOperation = 'source-atop';
    cg.fillStyle = lgrad(cg, S / 2 + L.lx * u * 3, S / 2 + L.ly * u * 3, S / 2 - L.lx * u * 3, S / 2 - L.ly * u * 3, [[0, 'rgba(20,12,40,0)'], [.5, 'rgba(20,12,40,0)'], [1, `rgba(20,12,40,${L.shadeA})`]]);
    cg.fillRect(0, 0, S, S);
  }
  if (L.rimA > 0) { cg.globalCompositeOperation = 'source-atop'; cg.globalAlpha = L.rimA; cg.drawImage(B.rim, 0, 0); cg.globalAlpha = 1; }
  cg.globalCompositeOperation = 'source-over';
}

/* ---------------- 正面半身（特写） ----------------
   o：who, x, y（下巴的位置）, u（头半径）, eyes, mouth, blush, tired, tear, outfit, look（眼珠往哪看，-1..1）, tiltH（歪头）, light */
function bust(g, o) {
  const u = o.u, B = charBuf(u * 7 + 60), S = B.S, half = S / 2, cg = B.g;
  const k = Math.min(1, (half - 20) / (u * 3.4));
  cg.setTransform(1, 0, 0, 1, 0, 0); cg.globalAlpha = 1; cg.globalCompositeOperation = 'source-over';
  cg.clearRect(0, 0, S, S); cg.translate(half, half); cg.scale(k, k);
  drawBust(cg, o);
  litChar(B, o.light || LIGHT.room, u * k);
  withAlpha(g, o.alpha ?? 1, () => g.drawImage(B.c, o.x - half / k, o.y - half / k, S / k, S / k));
}
function drawBust(g, o) {
  const u = o.u, who = o.who || 'he', L = LOOK[who], cl = L[o.outfit || (who === 'she' ? 'pj' : 'hoodie')];
  const t = o.t || 0;
  g.save(); g.rotate(o.tiltH || 0);
  // 长发后面那层
  if (who === 'she') { g.beginPath(); g.moveTo(-1.15 * u, -.6 * u); g.quadraticCurveTo(-1.5 * u, 1.2 * u, -1.25 * u, 2.6 * u); g.lineTo(1.25 * u, 2.6 * u); g.quadraticCurveTo(1.5 * u, 1.2 * u, 1.15 * u, -.6 * u); g.closePath(); fs(g, shade(L.hair, .9)); }
  // 肩膀和身体
  g.beginPath(); g.moveTo(-2.1 * u, 3.2 * u); g.quadraticCurveTo(-2.0 * u, 1.75 * u, -.9 * u, 1.55 * u); g.lineTo(.9 * u, 1.55 * u); g.quadraticCurveTo(2.0 * u, 1.75 * u, 2.1 * u, 3.2 * u); g.closePath(); fs(g, cl.top);
  if (who === 'he' && (o.outfit || 'hoodie') === 'hoodie') { g.beginPath(); g.moveTo(-1.0 * u, 1.55 * u); g.quadraticCurveTo(0, 2.25 * u, 1.0 * u, 1.55 * u); g.strokeStyle = cl.topS; g.lineWidth = .3 * u; g.stroke(); line(g, -.3 * u, 1.95 * u, -.35 * u, 2.7 * u, cl.trim, .06 * u); line(g, .3 * u, 1.95 * u, .35 * u, 2.7 * u, cl.trim, .06 * u); }
  // 脖子
  rr(g, -.3 * u, .6 * u, .6 * u, 1.1 * u, .25 * u); fs(g, shade(L.skin, .93));
  // 耳朵
  ell(g, -1.0 * u, .1 * u, .2 * u, .28 * u); fs(g, L.skin); ell(g, 1.0 * u, .1 * u, .2 * u, .28 * u); fs(g, L.skin);
  // 脸
  g.beginPath(); g.moveTo(-1.0 * u, -.2 * u); g.quadraticCurveTo(-1.0 * u, .75 * u, 0, 1.08 * u); g.quadraticCurveTo(1.0 * u, .75 * u, 1.0 * u, -.2 * u); g.arc(0, -.2 * u, 1.0 * u, 0, Math.PI, true); g.closePath(); fs(g, L.skin);
  // 眼睛
  const lk = (o.look || 0) * .06 * u, ink = '#2A1E2C', ev = o.eyes || 'open';
  for (const sx of [-1, 1]) {
    const ex = sx * .4 * u, ey = .08 * u;
    if (o.tired) { g.beginPath(); g.ellipse(ex, ey + .12 * u, .2 * u, .1 * u, 0, .15, Math.PI - .15); g.strokeStyle = `rgba(110,78,140,${.65 * o.tired})`; g.lineWidth = .08 * u; g.stroke(); }
    if (ev === 'open' || ev === 'wide' || ev === 'half') {
      g.save();
      if (ev === 'half') { g.beginPath(); g.rect(ex - .3 * u, ey - .03 * u, .6 * u, .4 * u); g.clip(); }
      ell(g, ex + lk, ey, .12 * u, .17 * u); fs(g, ink); circ(g, ex + lk + .04 * u, ey - .06 * u, .045 * u); fs(g, '#fff');
      g.restore();
      if (ev === 'half') line(g, ex - .17 * u, ey - .03 * u, ex + .17 * u, ey - .03 * u, ink, .05 * u);
    } else if (ev === 'closed') { g.beginPath(); g.arc(ex, ey - .02 * u, .14 * u, .25, Math.PI - .25); g.strokeStyle = ink; g.lineWidth = .055 * u; g.lineCap = 'round'; g.stroke(); }
    else if (ev === 'happy') { g.beginPath(); g.arc(ex, ey + .07 * u, .14 * u, Math.PI + .3, -.3); g.strokeStyle = ink; g.lineWidth = .055 * u; g.lineCap = 'round'; g.stroke(); }
    // 眉毛
    const bw = o.brow || 0;   // 正：皱眉（眉头往下），负：挑眉
    g.beginPath(); g.moveTo(ex - .17 * u * sx, ey - .31 * u - bw * .02 * u); g.quadraticCurveTo(ex, ey - .4 * u + bw * .02 * u, ex + .17 * u * sx, ey - .32 * u + bw * .07 * u);
    g.strokeStyle = shade(L.hair, 1.1); g.lineWidth = .055 * u; g.lineCap = 'round'; g.stroke();
    if (o.blush) { ell(g, ex + sx * .1 * u, ey + .3 * u, .2 * u, .1 * u); fs(g, `rgba(240,120,140,${.45 * o.blush})`); }
    if (o.tear && sx > 0) { const ty = ey + .28 * u + o.tear * .5 * u; g.beginPath(); g.moveTo(ex, ty - .12 * u); g.quadraticCurveTo(ex + .08 * u, ty + .02 * u, ex, ty + .06 * u); g.quadraticCurveTo(ex - .08 * u, ty + .02 * u, ex, ty - .12 * u); fs(g, 'rgba(170,215,255,.9)'); }
  }
  // 鼻子、嘴
  line(g, .02 * u, .32 * u, -.03 * u, .42 * u, shade(L.skin, .82), .05 * u);
  g.strokeStyle = '#9C5A5E'; g.lineWidth = .05 * u; g.lineCap = 'round';
  const mo = o.mouth || 'n';
  if (mo === 'smile') { g.beginPath(); g.arc(0, .52 * u, .16 * u, .45, Math.PI - .45); g.stroke(); }
  else if (mo === 'o') { ell(g, 0, .66 * u, .07 * u, .09 * u); fs(g, '#9C5A5E'); }
  else if (mo === 'sad') { g.beginPath(); g.arc(0, .78 * u, .13 * u, -2.5, -.64); g.stroke(); }
  else line(g, -.08 * u, .66 * u, .08 * u, .66 * u, '#9C5A5E', .05 * u);
  // 前面的头发
  if (who === 'she') {
    g.beginPath(); g.moveTo(-1.12 * u, .6 * u); g.quadraticCurveTo(-1.25 * u, -1.25 * u, 0, -1.28 * u); g.quadraticCurveTo(1.25 * u, -1.25 * u, 1.12 * u, .6 * u);
    g.quadraticCurveTo(.95 * u, -.25 * u, .7 * u, -.35 * u); g.quadraticCurveTo(.45 * u, -.6 * u, .1 * u, -.45 * u); g.quadraticCurveTo(-.15 * u, -.68 * u, -.45 * u, -.45 * u); g.quadraticCurveTo(-.85 * u, -.4 * u, -1.12 * u, .6 * u);
    g.closePath(); fs(g, L.hair);
    g.beginPath(); g.arc(0, -.3 * u, .85 * u, -2.6, -.55); g.strokeStyle = rgba(L.hairL, .6); g.lineWidth = .1 * u; g.stroke();
  } else {
    g.beginPath(); g.moveTo(-1.08 * u, .1 * u); g.quadraticCurveTo(-1.25 * u, -1.15 * u, -.2 * u, -1.32 * u); g.lineTo(0, -1.5 * u); g.lineTo(.18 * u, -1.3 * u); g.lineTo(.55 * u, -1.38 * u); g.lineTo(.5 * u, -1.15 * u);
    g.quadraticCurveTo(1.2 * u, -1.0 * u, 1.08 * u, .1 * u); g.quadraticCurveTo(.95 * u, -.4 * u, .55 * u, -.42 * u); g.quadraticCurveTo(.3 * u, -.7 * u, -.05 * u, -.5 * u); g.quadraticCurveTo(-.4 * u, -.62 * u, -.6 * u, -.4 * u); g.quadraticCurveTo(-.95 * u, -.35 * u, -1.08 * u, .1 * u);
    g.closePath(); fs(g, L.hair);
    g.beginPath(); g.arc(-.1 * u, -.35 * u, .85 * u, -2.6, -1.4); g.strokeStyle = rgba(L.hairL, .8); g.lineWidth = .09 * u; g.stroke();
  }
  g.restore();
  if (o.extra) o.extra(g, u);
}

/* ---------------- 背影（看窗外） ---------------- */
function backView(g, o) {
  const u = o.u, B = charBuf(u * 8 + 60), S = B.S, half = S / 2, cg = B.g;
  const k = Math.min(1, (half - 20) / (u * 4));
  cg.setTransform(1, 0, 0, 1, 0, 0); cg.globalAlpha = 1; cg.globalCompositeOperation = 'source-over';
  cg.clearRect(0, 0, S, S); cg.translate(half, half); cg.scale(k, k);
  const who = o.who || 'he', L = LOOK[who], cl = L[o.outfit || (who === 'she' ? 'pj' : 'hoodie')];
  cg.rotate(o.tiltH || 0);
  // 身体：肩膀到画面下面
  cg.beginPath(); cg.moveTo(-2.0 * u, 4.2 * u); cg.lineTo(-2.0 * u, 2.4 * u); cg.quadraticCurveTo(-1.9 * u, 1.5 * u, -.8 * u, 1.35 * u); cg.lineTo(.8 * u, 1.35 * u); cg.quadraticCurveTo(1.9 * u, 1.5 * u, 2.0 * u, 2.4 * u); cg.lineTo(2.0 * u, 4.2 * u); cg.closePath(); fs(cg, cl.top);
  if (who === 'he' && (o.outfit || 'hoodie') === 'hoodie') { cg.beginPath(); cg.moveTo(-1.0 * u, 1.4 * u); cg.quadraticCurveTo(0, 2.5 * u, 1.0 * u, 1.4 * u); cg.closePath(); fs(cg, cl.topS); }
  rr(cg, -.32 * u, .5 * u, .64 * u, 1.0 * u, .25 * u); fs(cg, shade(L.skin, .88));
  if (who === 'he') { ell(cg, -.98 * u, .05 * u, .2 * u, .28 * u); fs(cg, L.skin); ell(cg, .98 * u, .05 * u, .2 * u, .28 * u); fs(cg, L.skin); }
  // 后脑勺
  ell(cg, 0, -.18 * u, 1.02 * u, 1.08 * u); fs(cg, L.hair);
  if (who === 'she') {   // 长发披到背上，发梢有点弧度
    cg.beginPath(); cg.moveTo(-1.02 * u, -.3 * u);
    cg.quadraticCurveTo(-1.25 * u, 1.2 * u, -1.1 * u, 2.7 * u);
    cg.quadraticCurveTo(-.55 * u, 3.0 * u, 0, 2.85 * u); cg.quadraticCurveTo(.55 * u, 3.0 * u, 1.1 * u, 2.7 * u);
    cg.quadraticCurveTo(1.25 * u, 1.2 * u, 1.02 * u, -.3 * u); cg.closePath(); fs(cg, L.hair);
    for (const x of [-.5, .1, .55]) { cg.beginPath(); cg.moveTo(x * u, .3 * u); cg.quadraticCurveTo((x + .1) * u, 1.6 * u, x * u, 2.6 * u); cg.strokeStyle = rgba(L.hairL, .35); cg.lineWidth = .06 * u; cg.stroke(); }
  } else {
    for (const [x, y] of [[-.6, .55], [-.2, .72], [.25, .7], [.62, .52]]) { cg.beginPath(); cg.moveTo((x - .15) * u, (y - .3) * u); cg.lineTo(x * u, y * u); cg.lineTo((x + .15) * u, (y - .3) * u); cg.closePath(); fs(cg, L.hair); }
  }
  cg.beginPath(); cg.arc(-.15 * u, -.45 * u, .68 * u, -2.6, -1.5); cg.strokeStyle = rgba(L.hairL, .7); cg.lineWidth = .1 * u; cg.stroke();
  litChar(B, o.light || LIGHT.room, u * k);
  withAlpha(g, o.alpha ?? 1, () => g.drawImage(B.c, o.x - half / k, o.y - half / k, S / k, S / k));
}

/* ---------------- 像素小怪玩偶 ----------------
   原图 12×8 个方块：
     ..oooooooo..
     ..o#oooo#o..
     oooooooooooo
     oooooooooooo
     ..oooooooo..
     ..oooooooo..
     ..o.o..o.o..
     ..o.o..o.o..
   做成毛绒玩偶：方块变成圆角的布块，缝线、绒毛的明暗；眼睛是两条竖着的黑扣子。
   o：x, y（脚底中心）, s（一个方块多少像素）, col, glow（0..1 魔法发光）, eyes('n'|'blink'|'happy'|'glow'),
      legs（0..1 走路相位）, tilt, squash, wave（举手） */
const PLUSH = { orange: '#CB7C5E', pink: '#E58BAA' };
function plush(g, o) {
  const s = o.s, col = o.col || PLUSH.orange, gl = o.glow || 0;
  g.save(); g.translate(o.x, o.y); if (o.tilt) g.rotate(o.tilt);
  const sq = o.squash || 0; g.scale(1 + sq * .12, 1 - sq * .12);
  if (gl > 0) { glow(g, 0, -4 * s, 13 * s, col, gl * .8); glow(g, 0, -4 * s, 6 * s, '#FFF4E8', gl * .45); }
  const dark = shade(col, .78), lite = shade(col, 1.18);
  const body = (x, y, w, h, r = .5) => { rr(g, x * s - 6 * s, y * s - 8 * s, w * s, h * s, r * s); };
  // 腿：走路时两对交替抬起
  const lp = o.legs ?? -1;
  [[2, 0], [4, 1], [7, 0], [9, 1]].forEach(([x, grp]) => {
    const lift = lp >= 0 ? Math.max(0, Math.sin((lp + grp * .5) * TAU)) * .8 : 0;
    body(x, 6, 1, 2 - lift, .4); fs(g, dark);
  });
  // 身体
  body(2, 0, 8, 6, .9); fs(g, col);
  // 胳膊（左右两块，举手时往上翘）
  const wv = o.wave || 0;
  g.save(); g.translate(-5 * s, -5 * s); g.rotate(-wv * 1.2); rr(g, -1 * s, -1 * s, 2 * s, 2 * s, .6 * s); fs(g, col); g.restore();
  g.save(); g.translate(5 * s, -5 * s); g.rotate(wv * 1.2 * (o.waveR ? 1 : 0)); rr(g, -1 * s, -1 * s, 2 * s, 2 * s, .6 * s); fs(g, col); g.restore();
  // 绒面的明暗
  g.save(); body(2, 0, 8, 6, .9); g.clip();
  g.fillStyle = lgrad(g, 0, -8 * s, 0, -2 * s, [[0, rgba(lite, .6)], [.5, rgba(lite, 0)], [1, rgba(dark, .45)]]); g.fillRect(-6 * s, -8 * s, 12 * s, 8 * s);
  // 缝线
  g.setLineDash([.35 * s, .3 * s]); g.strokeStyle = rgba(shade(col, .6), .7); g.lineWidth = .12 * s;
  rr(g, -3.6 * s, -7.6 * s, 7.2 * s, 5.2 * s, .7 * s); g.stroke(); g.setLineDash([]);
  g.restore();
  // 眼睛
  const ev = o.eyes || 'n', ink = '#171312';
  for (const ex of [-2.5, 2.5]) {
    const x = ex * s, y = -6 * s;
    if (ev === 'blink') line(g, x - .5 * s, y + .5 * s, x + .5 * s, y + .5 * s, ink, .3 * s);
    else if (ev === 'happy') { g.beginPath(); g.arc(x, y + .7 * s, .55 * s, Math.PI + .4, -.4); g.strokeStyle = ink; g.lineWidth = .3 * s; g.lineCap = 'round'; g.stroke(); }
    else {
      rr(g, x - .5 * s, y - .6 * s, 1 * s, 1.6 * s, .35 * s); fs(g, ev === 'glow' ? '#FFFFFF' : ink);
      if (ev === 'glow') glow(g, x, y + .2 * s, 2.6 * s, col === PLUSH.pink ? '#FFC2DD' : '#FFD2B8', .9);
      else { circ(g, x + .15 * s, y - .25 * s, .17 * s); fs(g, 'rgba(255,255,255,.75)'); }
    }
  }
  if (o.blush) { ell(g, -3.8 * s, -4.4 * s, .7 * s, .35 * s); fs(g, 'rgba(255,140,150,.5)'); ell(g, 3.8 * s, -4.4 * s, .7 * s, .35 * s); fs(g, 'rgba(255,140,150,.5)'); }
  g.restore();
}
/* 像素形态（魔法飞行时）：真正的 12×8 方块，带光 */
function pixelMon(g, x, y, s, col, a = 1, o = {}) {
  if (a <= .01) return;
  const rows = ['..oooooooo..', '..o#oooo#o..', 'oooooooooooo', 'oooooooooooo', '..oooooooo..', '..oooooooo..', '..o.o..o.o..', '..o.o..o.o..'];
  withAlpha(g, a, () => {
    glow(g, x, y, s * 14, col, .6 * (o.glow ?? 1));
    g.save(); g.translate(x - 6 * s, y - 4 * s);
    rows.forEach((r, j) => { for (let i = 0; i < 12; i++) { const ch = r[i]; if (ch === 'o') { g.fillStyle = col; g.fillRect(i * s, j * s, s + .5, s + .5); } else if (ch === '#') { g.fillStyle = o.eyeCol || '#FFFFFF'; g.fillRect(i * s, j * s, s + .5, s + .5); } } });
    g.restore();
  });
}

/* 手在画面上的位置（和 drawBody 用同一套算法）：which = 'N' 近侧 / 'F' 远侧 */
function handPos(o, which = 'N') {
  const u = o.u, P = o.pose || POSE.stand, tilt = P.tilt, wa = a => a - tilt;
  const up = dir(Math.PI - tilt), Sh = [up[0] * 2.05 * u, up[1] * 2.05 * u];
  const ang = which === 'N' ? P.aN : P.aF, bx = Sh[0] + (which === 'N' ? .1 : -.1) * u;
  const d1 = dir(wa(ang[0])), d2 = dir(wa(ang[0]) + ang[1]);
  let x = bx + d1[0] * 1.42 * u + d2[0] * 1.32 * u, y = Sh[1] + d1[1] * 1.42 * u + d2[1] * 1.32 * u;
  if (o.rot) { const c = Math.cos(o.rot), sn = Math.sin(o.rot); [x, y] = [x * c - y * sn, x * sn + y * c]; }
  if ((o.face ?? 1) < 0) x = -x;
  return [o.x + x, o.y + y];
}
