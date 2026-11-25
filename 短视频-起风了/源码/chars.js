'use strict';
/* chars.js：角色。
   "他"：短头发。高中穿蓝白校服（白身子、蓝肩蓝袖、蓝裤子带白条），七年后穿白衬衫、卷着袖子。
   "她"：高中扎高马尾、穿一样的校服；七年后长发披肩，米色开衫配浅蓝长裙。
   同学：一样的校服，发型、眼镜、肤色各不相同（kidLook(i) 按编号生成）；七年后各穿各的便装。
   都是侧面的二维骨骼（头、躯干、两条胳膊、两条腿），另有正面半身（特写）和背影。
   像素小怪（用户给的 12×8 像素小怪）：她书包上的挂件，他画在纸飞机、课桌上的涂鸦。
   每个角色先画到离屏画布上，再统一打光：整体按场景的环境光染色、背光一侧压暗、迎光一侧描一道亮边，然后才贴到画面上。 */

const SKIN = '#F6D7C3';
const UNI = { top: '#F4F6FA', topS: '#D2D8E4', sleeve: '#3E69B1', trim: '#3E69B1', pants: '#2F4F8C', stripe: '#EEF2F8', shoe: '#F3F3F3', uni: true };
const LOOK = {
  he: {
    hair: '#1C1B24', hairL: '#3C3B50', skin: '#F2CFB8', style: 'short',
    uni: UNI,
    shirt: { top: '#F6F8FB', topS: '#D6DCE6', sleeve: '#F6F8FB', trim: '#FFFFFF', pants: '#2C3346', shoe: '#6A4A36', collar: true },
  },
  she: {
    hair: '#2B1D24', hairL: '#5E4252', skin: SKIN, style: 'pony',
    uni: UNI,
    adult: { top: '#FBF6EE', topS: '#E8DCCB', sleeve: '#EBDCC6', trim: '#FFFFFF', pants: '#F2E2D6', shoe: '#E9D8CA', skirt: '#BFD0EA', cardigan: '#EBDCC6', style: 'long' },
  },
  teacher: {
    hair: '#33282A', hairL: '#5A4648', skin: '#F1CDB9', style: 'bob', glasses: true, def: 'coat',
    coat: { top: '#E9DCCB', topS: '#D2C2AE', sleeve: '#C99F7E', trim: '#FFFFFF', pants: '#4A4A5C', shoe: '#3A2E2A', cardigan: '#C99F7E' },
  },
};
/* 同学：按编号生成发型、发色、肤色、眼镜。adult = 七年后的便装 */
const KID_HAIR = ['#1E1B22', '#2A2026', '#3A2A24', '#231F2C', '#4A3428'];
const KID_SKIN = ['#F6D7C3', '#F2CDB6', '#EFC6AE', '#F7DCCB', '#E9BFA6'];
const KID_CLOTH = [['#7FA6C8', '#2E3A50'], ['#D7656B', '#3E3A44'], ['#9CC59A', '#3A4036'], ['#F2D27A', '#4A4A58'], ['#C9B6E2', '#2E2E40'], ['#E9E2D6', '#5A4A42']];
function kidLook(i) {
  const girl = hash(i, 901) < .5;
  const styles = girl ? ['pony', 'bob', 'long'] : ['short', 'buzz', 'short'];
  const c = KID_CLOTH[(i + Math.floor(hash(Math.floor(i / 6), 907) * 6)) % 6];   // 每 6 个编号把 6 种颜色轮一遍，挨着的人不撞色
  return {
    hair: KID_HAIR[Math.floor(hash(i, 902) * KID_HAIR.length)], hairL: '#5A4A55',
    skin: KID_SKIN[Math.floor(hash(i, 903) * KID_SKIN.length)],
    style: styles[Math.floor(hash(i, 904) * 3)], glasses: hash(i, 905) < .28, girl,
    uni: UNI,
    adult: { top: c[0], topS: shade(c[0], .86), sleeve: c[0], trim: '#FFFFFF', pants: c[1], shoe: '#3A3436' },
  };
}

/* 姿势：躯干倾斜 tilt（正 = 往前倾）、低头 head；胳膊 [大臂, 小臂弯]、腿 [大腿, 小腿弯]，角度相对躯干，0 = 朝下，正 = 往前 */
const SIT_L = { lN: [1.5, -1.45], lF: [1.45, -1.5] };
const sitL = tilt => ({ lN: [1.54 + tilt, -1.45], lF: [1.49 + tilt, -1.5] });   // 躯干前倾 tilt 时，大腿仍然水平
const POSE = {
  stand: { tilt: 0, head: 0, aN: [.08, .12], aF: [-.1, .14], lN: [.02, 0], lF: [-.04, 0] },
  sit: { tilt: -.04, head: .05, aN: [.35, .9], aF: [.3, .95], ...SIT_L },
  sitDesk: { tilt: .14, head: .12, aN: [.42, 1.3], aF: [.38, 1.34], ...sitL(.14) },        // 小臂搭在课桌上
  write: { tilt: .32, head: .38, aN: [.62, 1.22], aF: [.52, 1.3], ...sitL(.32) },           // 低头写字
  chin: { tilt: .2, head: -.12, aN: [.3, 2.45], aF: [.4, 1.25], ...sitL(.2) },              // 手托着下巴发呆
  sleep: { tilt: 1.0, head: .55, aN: [1.6, 1.0], aF: [1.55, 1.05], ...sitL(1.0) },         // 趴在桌上睡
  guitar: { tilt: .04, head: .28, aN: [.55, 1.45], aF: [1.05, .85], ...sitL(.04) },          // 抱着吉他：近手扫弦，远手按品
  sitBack: { tilt: -.12, head: -.2, aN: [-.2, .3], aF: [-.3, .35], ...sitL(-.12) },           // 往后靠
  lookUp: { tilt: -.12, head: -.55, aN: [.05, .1], aF: [-.08, .1], lN: [.02, 0], lF: [-.04, 0] },
  reach: { tilt: .1, head: -.3, aN: [2.3, .1], aF: [.3, .4], lN: [.05, 0], lF: [-.2, -.1] },   // 伸手够天
  wave: { tilt: 0, head: -.05, aN: [2.7, .55], aF: [-.1, .14], lN: [.02, 0], lF: [-.04, 0] },
  cheer: { tilt: -.05, head: -.25, aN: [2.95, .15], aF: [2.85, .25], lN: [.02, 0], lF: [-.04, 0] },
  hold: { tilt: .06, head: .3, aN: [.55, 1.55], aF: [.5, 1.6], lN: [.02, 0], lF: [-.04, 0] },   // 两手捧着东西看
  sitHold: { tilt: .12, head: .38, aN: [.62, 1.45], aF: [.56, 1.5], ...sitL(.12) },                 // 坐着，两手捧着东西看
  give: { tilt: .08, head: .1, aN: [1.25, .25], aF: [1.15, .35], lN: [.04, 0], lF: [-.06, 0] }, // 递东西
  aim: { tilt: .05, head: -.1, aN: [2.1, -.2], aF: [.4, .6], lN: [.12, 0], lF: [-.2, 0] },    // 举着纸飞机瞄准
  lean: { tilt: .3, head: -.15, aN: [.95, .62], aF: [.9, .68], lN: [.04, 0], lF: [-.12, 0] },   // 趴在栏杆上
  hug: { tilt: .12, head: .08, aN: [1.25, 1.35], aF: [1.15, 1.45], lN: [.05, 0], lF: [-.08, 0] },
  shy: { tilt: .04, head: .42, aN: [.3, .5], aF: [.2, .6], lN: [.02, 0], lF: [-.04, 0] },       // 低着头
  scratch: { tilt: 0, head: .1, aN: [2.75, 2.35], aF: [-.1, .14], lN: [.02, 0], lF: [-.04, 0] },   // 挠头
  write2: { tilt: .1, head: .15, aN: [1.6, .55], aF: [.2, .4], lN: [.02, 0], lF: [-.04, 0] },   // 站着往前写（签校服）
  cycle: { tilt: .32, head: -.22, aN: [1.25, .12], aF: [1.2, .15], lN: [1.2, -1.0], lF: [.8, -.9] },
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
/* 骑车：ph 是蹬踏相位。腿的角度按脚踏的圆周算 */
function cyclePose(ph) {
  const p = { ...POSE.cycle };
  const leg = a => { const c = Math.cos(a), s = Math.sin(a); return [1.0 + .38 * c, -1.05 - .45 * s]; };
  p.lN = leg(ph * TAU); p.lF = leg(ph * TAU + Math.PI);
  return p;
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
function lookOf(o) { return typeof o.look === 'object' ? o.look : LOOK[o.who || 'she']; }
function outfitOf(o, L) { return L[o.outfit || L.def || 'uni'] || L.uni || L.coat; }

/* 画一个侧面的人。o：who（'she'|'he'|'teacher'）或 look（kidLook(i)）, x, y（胯部的位置）, u（头半径，像素）,
   face（1 朝右 / -1 朝左）, pose, eyes('open'|'closed'|'half'|'happy'|'wide'), mouth('n'|'smile'|'o'|'sad'|'grin'|'talk'),
   blush, tear, outfit（'uni' 校服 | 'shirt' | 'adult' | 'coat'）, wind（[wx, wy]，头发和衣角往哪飘）, t（时间）,
   light（见 litChar）, hold（画在近侧手里的东西：fn(g, u)）, holdF（远侧手）, bag（背书包）, alpha */
function person(g, o) {
  const u = o.u, B = charBuf(u * 13 + 60), S = B.S, half = S / 2, cg = B.g;
  const k = Math.min(1, (half - 20) / (u * 6.5));
  cg.setTransform(1, 0, 0, 1, 0, 0); cg.globalAlpha = 1; cg.globalCompositeOperation = 'source-over';
  cg.clearRect(0, 0, S, S);
  cg.translate(half, half); cg.scale(k, k);
  if ((o.face ?? 1) < 0) cg.scale(-1, 1);
  if (o.rot) cg.rotate(o.rot);
  drawBody(cg, { ...o, u });
  litChar(B, o.light || LIGHT.day, u * k);
  withAlpha(g, o.alpha ?? 1, () => g.drawImage(B.c, o.x - half / k, o.y - half / k, S / k, S / k));
}

function drawBody(g, o) {
  const u = o.u, L = lookOf(o), cl = outfitOf(o, L);
  const style = o.hairStyle || cl.style || L.style;
  const P = o.pose || POSE.stand, tilt = P.tilt;
  const t = o.t || 0, wind = o.wind || [0, 0];
  const wa = a => a - tilt;
  const Hp = [0, 0];
  const up = dir(Math.PI - tilt);
  const Sh = [Hp[0] + up[0] * 2.05 * u, Hp[1] + up[1] * 2.05 * u];
  const Nk = [Hp[0] + up[0] * 2.3 * u, Hp[1] + up[1] * 2.3 * u];
  const hd = dir(Math.PI - tilt - P.head * .8);
  const Hc = [Nk[0] + hd[0] * 1.18 * u, Nk[1] + hd[1] * 1.18 * u];
  const headRot = tilt + P.head;
  const limb = (base, ang, l1, l2) => {
    const d1 = dir(wa(ang[0])), j = [base[0] + d1[0] * l1 * u, base[1] + d1[1] * l1 * u];
    const d2 = dir(wa(ang[0]) + ang[1]), e = [j[0] + d2[0] * l2 * u, j[1] + d2[1] * l2 * u];
    return [base, j, e, wa(ang[0]) + ang[1]];
  };
  const armN = limb([Sh[0] + .1 * u, Sh[1]], P.aN, 1.42, 1.32), armF = limb([Sh[0] - .1 * u, Sh[1]], P.aF, 1.42, 1.32);
  const legN = limb([.12 * u, 0], P.lN, 1.62, 1.58), legF = limb([-.12 * u, 0], P.lF, 1.62, 1.58);
  const seg2 = (pts, col, w) => { g.beginPath(); g.moveTo(...pts[0]); g.lineTo(...pts[1]); g.lineTo(...pts[2]); g.strokeStyle = col; g.lineWidth = w; g.lineCap = 'round'; g.lineJoin = 'round'; g.stroke(); };
  const stripe = (pts, col) => { if (!cl.stripe) return; seg2(pts, col, .09 * u); };
  const foot = (lg, col) => {
    const a = lg[3], fx = dir(a + Math.PI / 2), e = lg[2];
    g.save(); g.translate(e[0], e[1]); g.rotate(Math.atan2(fx[1], fx[0]));
    rr(g, -.22 * u, -.2 * u, .78 * u, .36 * u, .17 * u); fs(g, col);
    if (cl.uni) { rr(g, -.22 * u, .06 * u, .78 * u, .1 * u, .05 * u); fs(g, shade(col, .85)); }
    g.restore();
  };
  const hand = (ar, col = L.skin) => { circ(g, ar[2][0], ar[2][1], .24 * u); fs(g, col); };
  const darker = c => shade(c, .82);
  const sleeve = cl.sleeve || cl.top;

  // 头发（在身体后面）：长发、短发波波、马尾
  if (style === 'long') hairBack(g, Hc, headRot, u, L, t, wind, o.hairLen ?? 1);
  else if (style === 'bob') hairBack(g, Hc, headRot, u, L, t, wind, .42);
  else if (style === 'pony') ponytail(g, Hc, headRot, u, L, t, wind);
  // 书包（背在背后）
  if (o.bag) { g.save(); g.translate(Hp[0] + up[0] * 1.3 * u, Hp[1] + up[1] * 1.3 * u); g.rotate(tilt); rr(g, -1.15 * u, -.95 * u, .8 * u, 1.5 * u, .25 * u); fs(g, o.bag); rr(g, -1.2 * u, -.2 * u, .45 * u, .6 * u, .12 * u); fs(g, shade(o.bag, .85)); g.restore(); }
  // 远侧的腿和胳膊
  seg2(legF, darker(cl.pants), .56 * u); stripe(legF, darker(cl.stripe || '#fff')); foot(legF, darker(cl.shoe));
  seg2(armF, darker(sleeve), .46 * u); hand(armF, shade(L.skin, .9));
  if (o.holdF) { g.save(); g.translate(...armF[2]); o.holdF(g, u); g.restore(); }
  // 躯干
  g.save(); g.translate(Hp[0], Hp[1]); g.rotate(tilt);
  const torso = () => { g.beginPath(); g.moveTo(-.5 * u, .15 * u); g.quadraticCurveTo(-.62 * u, -1.1 * u, -.5 * u, -2.15 * u); g.quadraticCurveTo(0, -2.5 * u, .45 * u, -2.15 * u); g.quadraticCurveTo(.66 * u, -1.1 * u, .52 * u, .15 * u); g.closePath(); };
  torso(); fs(g, cl.top);
  if (cl.uni) {
    // 校服：肩膀一圈蓝色，前襟一条拉链，立领
    g.save(); torso(); g.clip();
    g.beginPath(); g.moveTo(-.8 * u, -2.6 * u); g.lineTo(.8 * u, -2.6 * u); g.lineTo(.8 * u, -1.78 * u); g.quadraticCurveTo(0, -1.62 * u, -.8 * u, -1.8 * u); g.closePath(); fs(g, cl.sleeve);
    rr(g, -.8 * u, -.06 * u, 1.6 * u, .3 * u, 0); fs(g, cl.sleeve);
    line(g, .44 * u, -2.0 * u, .5 * u, -.05 * u, cl.topS, .05 * u);
    g.restore();
    rr(g, -.05 * u, -2.5 * u, .5 * u, .32 * u, .12 * u); fs(g, cl.trim);
  } else {
    // 衣服下摆
    g.beginPath(); g.moveTo(-.52 * u, .05 * u); g.lineTo(.54 * u, .05 * u); g.strokeStyle = cl.topS; g.lineWidth = .14 * u; g.stroke();
    if (cl.collar) { poly(g, [[-.05 * u, -2.3 * u], [.38 * u, -2.0 * u], [.3 * u, -2.32 * u]]); fs(g, cl.trim); poly(g, [[.05 * u, -1.95 * u], [.05 * u, -.1 * u]], false); g.strokeStyle = cl.topS; g.lineWidth = .05 * u; g.stroke(); }
    else { g.beginPath(); g.arc(.05 * u, -2.22 * u, .32 * u, .2, Math.PI - .2); g.strokeStyle = cl.trim; g.lineWidth = .1 * u; g.stroke(); }
    if (cl.cardigan) {   // 开衫：前后两片，比上衣长一点
      g.beginPath(); g.moveTo(-.62 * u, .45 * u); g.quadraticCurveTo(-.7 * u, -1.1 * u, -.52 * u, -2.12 * u); g.lineTo(-.1 * u, -2.3 * u); g.lineTo(-.25 * u, .45 * u); g.closePath(); fs(g, cl.cardigan);
      g.beginPath(); g.moveTo(.62 * u, .45 * u); g.quadraticCurveTo(.72 * u, -1.1 * u, .48 * u, -2.12 * u); g.lineTo(.3 * u, -2.2 * u); g.lineTo(.36 * u, .45 * u); g.closePath(); fs(g, cl.cardigan);
    }
  }
  g.restore();
  // 脖子
  line(g, Nk[0] - up[0] * .25 * u, Nk[1] - up[1] * .25 * u, Nk[0] + hd[0] * .35 * u, Nk[1] + hd[1] * .35 * u, L.skin, .42 * u);
  // 近侧的腿
  seg2(legN, cl.pants, .58 * u); stripe(legN, cl.stripe || '#fff'); foot(legN, cl.shoe);
  // 裙子（她七年后）：从胯到小腿，跟着两条腿摆
  if (cl.skirt) {
    const kn = legN[1], kf = legF[1], fN = legN[2], fF = legF[2];
    const mN = [lerp(kn[0], fN[0], .45), lerp(kn[1], fN[1], .45)], mF = [lerp(kf[0], fF[0], .45), lerp(kf[1], fF[1], .45)];
    const sw = Math.sin(t * 2.3) * .08 * u + wind[0] * .25 * u;
    g.beginPath(); g.moveTo(-.55 * u, -.2 * u); g.lineTo(.6 * u, -.2 * u);
    g.quadraticCurveTo(Math.max(mN[0], mF[0]) + .7 * u, (mN[1] + mF[1]) / 2 - .6 * u, Math.max(mN[0], mF[0]) + .45 * u + sw, Math.max(mN[1], mF[1]) + .1 * u);
    g.lineTo(Math.min(mN[0], mF[0]) - .45 * u + sw, Math.max(mN[1], mF[1]) + .1 * u);
    g.quadraticCurveTo(Math.min(mN[0], mF[0]) - .6 * u, (mN[1] + mF[1]) / 2 - .6 * u, -.55 * u, -.2 * u);
    g.closePath(); fs(g, cl.skirt);
  }
  // 头
  head(g, Hc, headRot, u, L, style, o);
  // 近侧的胳膊（衬衫卷袖：小臂露出皮肤）
  if (cl.collar && !o.sleeves) {
    g.beginPath(); g.moveTo(...armN[0]); g.lineTo(...armN[1]); g.strokeStyle = sleeve; g.lineWidth = .48 * u; g.lineCap = 'round'; g.stroke();
    g.beginPath(); g.moveTo(...armN[1]); g.lineTo(...armN[2]); g.strokeStyle = L.skin; g.lineWidth = .4 * u; g.stroke();
    circ(g, armN[1][0], armN[1][1], .27 * u); fs(g, cl.topS);
  } else seg2(armN, sleeve, .48 * u);
  hand(armN);
  if (o.hold) { g.save(); g.translate(...armN[2]); o.hold(g, u); g.restore(); }
  if (o.extra) o.extra(g, { Hc, Sh, Nk, armN, armF, legN, legF, u, tilt, headRot });
}

/* 长发：从头顶往后、往下垂，发梢跟着风飘 */
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
  g.beginPath(); smoothPath(g, back.map(([x, y], i) => [lerp(x, front[i][0], .55), y]).slice(1, n)); g.strokeStyle = rgba(L.hairL, .45); g.lineWidth = .07 * u; g.stroke();
  g.restore();
}
/* 高马尾：从后脑勺高处扎起来，往后、往下甩，跟着风和步子晃 */
function ponytail(g, Hc, rot, u, L, t, wind) {
  const [wx, wy] = wind;
  g.save(); g.translate(Hc[0], Hc[1]); g.rotate(rot * .6);
  const bx = -.78 * u, by = -.72 * u;
  const n = 7, A = [], Bk = [];
  for (let i = 0; i <= n; i++) {
    const v = i / n;
    const sway = Math.sin(t * 3.1 - v * 2.5) * .25 * u * v + noise1(t * 1.3 + v, 9) * .12 * u * v;
    const x = bx - .55 * u * Math.sin(v * 1.9) - v * .25 * u + wx * v * v * 1.6 * u + sway;
    const y = by + v * 2.15 * u + wy * v * v * 1.1 * u - wx * v * .25 * u;
    const w = (1 - v * .8) * .34 * u + .04 * u;
    A.push([x - w, y]); Bk.push([x + w, y]);
  }
  g.beginPath(); g.moveTo(A[0][0], A[0][1]); smoothPathTo(g, A);
  g.quadraticCurveTo(A[n][0] + .1 * u, A[n][1] + .25 * u, Bk[n][0], Bk[n][1]);
  smoothPathTo(g, Bk.slice().reverse()); g.closePath(); fs(g, L.hair);
  g.beginPath(); smoothPath(g, A.map(([x, y], i) => [lerp(x, Bk[i][0], .5), y]).slice(1, n)); g.strokeStyle = rgba(L.hairL, .5); g.lineWidth = .06 * u; g.stroke();
  // 发圈
  ell(g, bx + .05 * u, by + .08 * u, .2 * u, .14 * u, .4); fs(g, '#E86A7E');
  g.restore();
}
/* 从当前点接着画一串点的平滑曲线 */
function smoothPathTo(g, pts) {
  for (let i = 1; i < pts.length; i++) {
    const p0 = pts[Math.max(0, i - 2)], p1 = pts[i - 1], p2 = pts[i], p3 = pts[Math.min(pts.length - 1, i + 1)];
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6, p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6, p2[0], p2[1]);
  }
}

function head(g, Hc, rot, u, L, style, o) {
  g.save(); g.translate(Hc[0], Hc[1]); g.rotate(rot);
  const longish = style === 'long' || style === 'bob' || style === 'pony';
  // 耳朵（短发的人露出来）
  if (!longish || style === 'pony') { ell(g, -.18 * u, .08 * u, .2 * u, .26 * u); fs(g, shade(L.skin, .95)); }
  // 脸
  g.beginPath(); g.ellipse(0, 0, u, u * 1.02, 0, 0, TAU); fs(g, L.skin);
  ell(g, .9 * u, .18 * u, .16 * u, .13 * u); fs(g, L.skin);                // 鼻尖
  ell(g, .55 * u, .62 * u, .42 * u, .36 * u); fs(g, L.skin);               // 下巴
  if (o.blush) { ell(g, .45 * u, .38 * u, .22 * u, .12 * u); fs(g, `rgba(240,120,140,${.45 * o.blush})`); }
  // 眼睛
  const ex = .44 * u, ey = -.08 * u, ev = o.eyes || 'open';
  const ink = '#2A1E2C';
  if (ev === 'open' || ev === 'wide') {
    const s = ev === 'wide' ? 1.2 : 1;
    ell(g, ex, ey, .12 * u * s, .17 * u * s); fs(g, ink);
    circ(g, ex + .04 * u, ey - .06 * u, .045 * u * s); fs(g, '#FFFFFF');
    if (longish) { g.beginPath(); g.moveTo(ex - .14 * u, ey - .14 * u); g.quadraticCurveTo(ex + .02 * u, ey - .24 * u, ex + .2 * u, ey - .2 * u); g.strokeStyle = ink; g.lineWidth = .05 * u; g.lineCap = 'round'; g.stroke(); }
  } else if (ev === 'half') {
    g.save(); g.beginPath(); g.rect(ex - .2 * u, ey - .02 * u, .4 * u, .3 * u); g.clip();
    ell(g, ex, ey, .12 * u, .17 * u); fs(g, ink); g.restore();
    line(g, ex - .16 * u, ey - .02 * u, ex + .15 * u, ey - .03 * u, ink, .05 * u);
  } else if (ev === 'closed') {
    g.beginPath(); g.arc(ex, ey - .02 * u, .13 * u, .25, Math.PI - .25); g.strokeStyle = ink; g.lineWidth = .055 * u; g.lineCap = 'round'; g.stroke();
  } else if (ev === 'happy') {
    g.beginPath(); g.arc(ex, ey + .06 * u, .13 * u, Math.PI + .3, -.3); g.strokeStyle = ink; g.lineWidth = .055 * u; g.lineCap = 'round'; g.stroke();
  }
  // 眼镜
  if (L.glasses || o.glasses) { circ(g, ex + .02 * u, ey + .01 * u, .24 * u); g.strokeStyle = '#3A3440'; g.lineWidth = .05 * u; g.stroke(); line(g, ex - .22 * u, ey - .02 * u, -.15 * u, -.05 * u, '#3A3440', .04 * u); }
  // 眉毛
  const bw = o.brow || 0;
  g.beginPath(); g.moveTo(ex - .17 * u, ey - .32 * u + bw * .05 * u); g.quadraticCurveTo(ex, ey - .4 * u - bw * .06 * u, ex + .17 * u, ey - .33 * u - bw * .1 * u);
  g.strokeStyle = shade(L.hair, 1.1); g.lineWidth = .05 * u; g.stroke();
  // 眼泪
  if (o.tear) { const ty = ey + .25 * u + o.tear * .55 * u; g.beginPath(); g.moveTo(ex + .02 * u, ty - .12 * u); g.quadraticCurveTo(ex + .1 * u, ty + .02 * u, ex + .02 * u, ty + .06 * u); g.quadraticCurveTo(ex - .06 * u, ty + .02 * u, ex + .02 * u, ty - .12 * u); fs(g, 'rgba(170,215,255,.9)'); }
  // 嘴
  let mo = o.mouth || 'n';
  if (mo === 'talk') mo = Math.sin((o.t || 0) * 17) > 0 ? 'o' : 'n';
  const mx = .66 * u, my = .55 * u;
  g.strokeStyle = '#9C5A5E'; g.lineWidth = .045 * u; g.lineCap = 'round';
  if (mo === 'smile') { g.beginPath(); g.arc(mx - .02 * u, my - .1 * u, .12 * u, .5, 1.9); g.stroke(); }
  else if (mo === 'grin') { g.beginPath(); g.moveTo(mx - .16 * u, my - .06 * u); g.quadraticCurveTo(mx, my + .16 * u, mx + .14 * u, my - .08 * u); g.closePath(); fs(g, '#9C5A5E'); }
  else if (mo === 'o') { ell(g, mx, my, .06 * u, .08 * u); fs(g, '#9C5A5E'); }
  else if (mo === 'sad') { g.beginPath(); g.arc(mx - .02 * u, my + .1 * u, .1 * u, -1.9, -.6); g.stroke(); }
  else { line(g, mx - .08 * u, my, mx + .04 * u, my - .01 * u, '#9C5A5E', .045 * u); }
  // 头发（前面那层）
  if (longish) {
    g.beginPath();
    g.moveTo(-1.05 * u, style === 'pony' ? .05 * u : .35 * u);
    g.quadraticCurveTo(-1.15 * u, -1.0 * u, .05 * u, -1.12 * u);
    g.quadraticCurveTo(.85 * u, -1.05 * u, 1.02 * u, -.4 * u);
    g.quadraticCurveTo(.75 * u, -.62 * u, .55 * u, -.35 * u);          // 刘海
    g.quadraticCurveTo(.4 * u, -.62 * u, .15 * u, -.52 * u);
    if (style === 'pony') { g.quadraticCurveTo(-.15 * u, -.5 * u, -.35 * u, -.3 * u); g.quadraticCurveTo(-.55 * u, -.1 * u, -.95 * u, .1 * u); }
    else { g.quadraticCurveTo(-.1 * u, -.45 * u, -.3 * u, .1 * u); g.quadraticCurveTo(-.45 * u, .6 * u, -.85 * u, .9 * u); }
    g.closePath(); fs(g, L.hair);
    if (style === 'pony') { g.beginPath(); g.moveTo(.55 * u, -.4 * u); g.quadraticCurveTo(.62 * u, .1 * u, .5 * u, .45 * u); g.strokeStyle = L.hair; g.lineWidth = .1 * u; g.stroke(); }   // 鬓角一缕
    g.beginPath(); g.arc(-.1 * u, -.15 * u, .78 * u, -2.4, -1.5); g.strokeStyle = rgba(L.hairL, .7); g.lineWidth = .1 * u; g.stroke();
  } else if (style === 'buzz') {
    g.beginPath(); g.moveTo(-1.0 * u, .05 * u); g.quadraticCurveTo(-1.1 * u, -1.05 * u, .1 * u, -1.1 * u); g.quadraticCurveTo(.85 * u, -1.0 * u, .95 * u, -.55 * u);
    g.quadraticCurveTo(.5 * u, -.75 * u, 0, -.7 * u); g.quadraticCurveTo(-.45 * u, -.5 * u, -.6 * u, .05 * u); g.closePath(); fs(g, L.hair);
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
  day: { amb: '#FFF6EA', ambA: .05, lx: .6, ly: -.8, rim: '#FFFFFF', rimA: .3, shadeA: .16 },
  noon: { amb: '#FFF1DE', ambA: .08, lx: .3, ly: -.95, rim: '#FFFDF0', rimA: .55, shadeA: .2 },
  room: { amb: '#C9D4E8', ambA: .2, lx: -.8, ly: -.4, rim: '#FFF6E0', rimA: .75, shadeA: .3 },         // 教室：窗户在左边
  roomR: { amb: '#C9D4E8', ambA: .2, lx: .8, ly: -.4, rim: '#FFF6E0', rimA: .75, shadeA: .3 },        // 窗户在右边
  golden: { amb: '#FFC98A', ambA: .22, lx: -.9, ly: -.35, rim: '#FFE2A8', rimA: .9, shadeA: .3 },
  goldenR: { amb: '#FFC98A', ambA: .22, lx: .9, ly: -.35, rim: '#FFE2A8', rimA: .9, shadeA: .3 },
  sunset: { amb: '#F29A78', ambA: .3, lx: -.95, ly: -.2, rim: '#FFC890', rimA: .95, shadeA: .38 },
  sunsetR: { amb: '#F29A78', ambA: .3, lx: .95, ly: -.2, rim: '#FFC890', rimA: .95, shadeA: .38 },
  dusk: { amb: '#9A8CC8', ambA: .38, lx: -.8, ly: -.5, rim: '#FFC6A8', rimA: .7, shadeA: .35 },
  morning: { amb: '#A9C6EE', ambA: .28, lx: -.85, ly: -.4, rim: '#E8F4FF', rimA: .8, shadeA: .28 },
  night: { amb: '#7F8CCB', ambA: .42, lx: .7, ly: -.7, rim: '#C9D6FF', rimA: .6, shadeA: .32 },
  lamp: { amb: '#FFC891', ambA: .25, lx: -.8, ly: -.4, rim: '#FFD7A0', rimA: .55, shadeA: .3 },
  rain: { amb: '#AFC0D8', ambA: .28, lx: -.5, ly: -.8, rim: '#FFE7C0', rimA: .6, shadeA: .25 },
  present: { amb: '#F2D9BE', ambA: .16, lx: .7, ly: -.6, rim: '#FFF0D6', rimA: .6, shadeA: .24 },
  sil: { amb: '#2A2440', ambA: .85, lx: -.8, ly: -.5, rim: '#FFD9A0', rimA: .95, shadeA: 0 },
  silR: { amb: '#2A2440', ambA: .85, lx: .8, ly: -.5, rim: '#FFD9A0', rimA: .95, shadeA: 0 },
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
   o：who / look, x, y（下巴的位置）, u（头半径）, eyes('open'|'wide'|'half'|'closed'|'happy'|'down'), mouth('n'|'smile'|'grin'|'o'|'sad'|'talk'),
   blush, tear, outfit, gaze（眼珠往哪看，-1..1）, gazeY, tiltH（歪头）, wind（头发往哪飘）, t, light */
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
  const u = o.u, L = lookOf(o), cl = outfitOf(o, L);
  const style = o.hairStyle || cl.style || L.style;
  const t = o.t || 0, [wx, wy] = o.wind || [0, 0];
  const sway = (v, ph = 0) => Math.sin(t * 2.4 + ph) * .06 * u * v + wx * .35 * u * v;
  g.save(); g.rotate(o.tiltH || 0);
  // 头发后面那层
  if (style === 'long') {
    g.beginPath(); g.moveTo(-1.1 * u, -.6 * u);
    g.quadraticCurveTo(-1.38 * u + sway(1), 1.0 * u, -1.22 * u + sway(1.6, 1), 2.6 * u);
    g.lineTo(1.22 * u + sway(1.6, 2), 2.6 * u); g.quadraticCurveTo(1.38 * u + sway(1, 3), 1.0 * u, 1.1 * u, -.6 * u); g.closePath(); fs(g, shade(L.hair, .9));
  } else if (style === 'bob') {
    g.beginPath(); g.moveTo(-1.15 * u, -.6 * u); g.quadraticCurveTo(-1.4 * u, .6 * u, -1.2 * u, 1.1 * u); g.lineTo(1.2 * u, 1.1 * u); g.quadraticCurveTo(1.4 * u, .6 * u, 1.15 * u, -.6 * u); g.closePath(); fs(g, shade(L.hair, .9));
  } else if (style === 'pony') {
    // 马尾从脑后露出来一截，跟着风甩
    g.beginPath(); g.moveTo(.55 * u, -1.05 * u);
    g.quadraticCurveTo(1.45 * u + sway(1.4), -.9 * u, 1.35 * u + sway(2.2, 1), .55 * u);
    g.quadraticCurveTo(1.2 * u + sway(1.6, 2), .1 * u, .85 * u, -.75 * u); g.closePath(); fs(g, shade(L.hair, .88));
  }
  // 肩膀和身体
  const shoulders = () => { g.beginPath(); g.moveTo(-2.1 * u, 3.2 * u); g.quadraticCurveTo(-2.0 * u, 1.75 * u, -.9 * u, 1.55 * u); g.lineTo(.9 * u, 1.55 * u); g.quadraticCurveTo(2.0 * u, 1.75 * u, 2.1 * u, 3.2 * u); g.closePath(); };
  shoulders(); fs(g, cl.top);
  if (cl.uni) {
    g.save(); shoulders(); g.clip();
    g.beginPath(); g.moveTo(-2.3 * u, 1.4 * u); g.lineTo(2.3 * u, 1.4 * u); g.lineTo(2.3 * u, 2.25 * u); g.quadraticCurveTo(0, 2.05 * u, -2.3 * u, 2.25 * u); g.closePath(); fs(g, cl.sleeve);
    ell(g, -2.0 * u, 3.0 * u, .55 * u, 1.4 * u); fs(g, cl.sleeve); ell(g, 2.0 * u, 3.0 * u, .55 * u, 1.4 * u); fs(g, cl.sleeve);
    line(g, 0, 1.85 * u, 0, 3.3 * u, cl.topS, .06 * u);
    g.restore();
    // 立领
    g.beginPath(); g.moveTo(-.62 * u, 1.35 * u); g.lineTo(-.55 * u, 1.85 * u); g.quadraticCurveTo(0, 2.05 * u, .55 * u, 1.85 * u); g.lineTo(.62 * u, 1.35 * u); g.quadraticCurveTo(0, 1.55 * u, -.62 * u, 1.35 * u); fs(g, cl.trim);
  } else if (cl.collar) {
    poly(g, [[-.62 * u, 1.45 * u], [0, 2.2 * u], [-.15 * u, 1.55 * u]]); fs(g, cl.trim); poly(g, [[.62 * u, 1.45 * u], [0, 2.2 * u], [.15 * u, 1.55 * u]]); fs(g, cl.trim);
    line(g, 0, 2.2 * u, 0, 3.3 * u, cl.topS, .05 * u);
  } else if (cl.cardigan) {
    g.beginPath(); g.moveTo(-2.1 * u, 3.2 * u); g.quadraticCurveTo(-2.0 * u, 1.75 * u, -.9 * u, 1.55 * u); g.lineTo(-.35 * u, 3.3 * u); g.closePath(); fs(g, cl.cardigan);
    g.beginPath(); g.moveTo(2.1 * u, 3.2 * u); g.quadraticCurveTo(2.0 * u, 1.75 * u, .9 * u, 1.55 * u); g.lineTo(.35 * u, 3.3 * u); g.closePath(); fs(g, cl.cardigan);
    g.beginPath(); g.arc(0, 1.5 * u, .55 * u, .3, Math.PI - .3); g.strokeStyle = cl.topS; g.lineWidth = .08 * u; g.stroke();
  }
  // 脖子
  rr(g, -.3 * u, .6 * u, .6 * u, 1.1 * u, .25 * u); fs(g, shade(L.skin, .93));
  // 耳朵
  ell(g, -1.0 * u, .1 * u, .2 * u, .28 * u); fs(g, L.skin); ell(g, 1.0 * u, .1 * u, .2 * u, .28 * u); fs(g, L.skin);
  // 脸
  g.beginPath(); g.moveTo(-1.0 * u, -.2 * u); g.quadraticCurveTo(-1.0 * u, .75 * u, 0, 1.08 * u); g.quadraticCurveTo(1.0 * u, .75 * u, 1.0 * u, -.2 * u); g.arc(0, -.2 * u, 1.0 * u, 0, Math.PI, true); g.closePath(); fs(g, L.skin);
  // 眼睛：大一点，带高光，女生有上睫毛
  const lk = (o.gaze || 0) * .07 * u, lky = (o.gazeY || 0) * .05 * u, ink = '#2A1E2C', ev = o.eyes || 'open';
  const girl = style !== 'short' && style !== 'buzz';
  for (const sx of [-1, 1]) {
    const ex = sx * .4 * u, ey = .1 * u;
    if (ev === 'open' || ev === 'wide' || ev === 'half' || ev === 'down') {
      const s = ev === 'wide' ? 1.15 : 1;
      g.save();
      if (ev === 'half' || ev === 'down') { g.beginPath(); g.rect(ex - .3 * u, ey - (ev === 'down' ? -.02 : .06) * u, .6 * u, .5 * u); g.clip(); }
      ell(g, ex + lk, ey + lky + (ev === 'down' ? .05 * u : 0), .15 * u * s, .2 * u * s);
      g.fillStyle = vgrad(g, ey - .2 * u, ey + .2 * u, [[0, '#1E1418'], [.6, '#4A3036'], [1, '#7A5458']]); g.fill();
      circ(g, ex + lk + .05 * u, ey + lky - .07 * u, .055 * u * s); fs(g, '#fff');
      circ(g, ex + lk - .05 * u, ey + lky + .08 * u, .025 * u * s); fs(g, 'rgba(255,255,255,.8)');
      g.restore();
      // 上眼皮
      const lidY = ev === 'half' ? ey - .02 * u : ev === 'down' ? ey + .02 * u : ey - .19 * u * s;
      g.beginPath(); g.moveTo(ex - .2 * u, lidY + .05 * u); g.quadraticCurveTo(ex, lidY - .06 * u, ex + .2 * u, lidY + .04 * u);
      g.strokeStyle = ink; g.lineWidth = (girl ? .07 : .05) * u; g.lineCap = 'round'; g.stroke();
      if (girl) { g.beginPath(); g.moveTo(ex + sx * .19 * u, lidY + .04 * u); g.lineTo(ex + sx * .27 * u, lidY - .02 * u); g.stroke(); }
    } else if (ev === 'closed') { g.beginPath(); g.arc(ex, ey - .02 * u, .15 * u, .25, Math.PI - .25); g.strokeStyle = ink; g.lineWidth = .06 * u; g.lineCap = 'round'; g.stroke(); }
    else if (ev === 'happy') { g.beginPath(); g.arc(ex, ey + .08 * u, .15 * u, Math.PI + .3, -.3); g.strokeStyle = ink; g.lineWidth = .06 * u; g.lineCap = 'round'; g.stroke(); }
    // 眉毛
    const bw = o.brow || 0;   // 正：皱眉（眉头往下），负：挑眉
    g.beginPath(); g.moveTo(ex - .17 * u * sx, ey - .33 * u - bw * .02 * u); g.quadraticCurveTo(ex, ey - .43 * u + bw * .02 * u, ex + .17 * u * sx, ey - .35 * u + bw * .07 * u);
    g.strokeStyle = shade(L.hair, 1.1); g.lineWidth = .055 * u; g.lineCap = 'round'; g.stroke();
    if (o.blush) { ell(g, ex + sx * .1 * u, ey + .34 * u, .2 * u, .1 * u); fs(g, `rgba(240,120,140,${.45 * o.blush})`); }
    if (o.tear && sx > 0) { const ty = ey + .3 * u + o.tear * .5 * u; g.beginPath(); g.moveTo(ex, ty - .12 * u); g.quadraticCurveTo(ex + .08 * u, ty + .02 * u, ex, ty + .06 * u); g.quadraticCurveTo(ex - .08 * u, ty + .02 * u, ex, ty - .12 * u); fs(g, 'rgba(170,215,255,.9)'); }
  }
  // 眼镜
  if (L.glasses || o.glasses) for (const sx of [-1, 1]) { circ(g, sx * .4 * u, .12 * u, .27 * u); g.strokeStyle = '#3A3440'; g.lineWidth = .05 * u; g.stroke(); }
  // 鼻子、嘴
  line(g, .02 * u, .38 * u, -.03 * u, .46 * u, shade(L.skin, .82), .05 * u);
  g.strokeStyle = '#9C5A5E'; g.lineWidth = .05 * u; g.lineCap = 'round';
  let mo = o.mouth || 'n';
  if (mo === 'talk') mo = Math.sin(t * 17) > 0 ? 'o' : 'n';
  if (mo === 'smile') { g.beginPath(); g.arc(0, .56 * u, .17 * u, .45, Math.PI - .45); g.stroke(); }
  else if (mo === 'grin') { g.beginPath(); g.moveTo(-.2 * u, .66 * u); g.quadraticCurveTo(0, .92 * u, .2 * u, .66 * u); g.closePath(); fs(g, '#8E4A52'); g.save(); g.clip(); rr(g, -.2 * u, .62 * u, .4 * u, .08 * u, .02 * u); fs(g, '#fff'); g.restore(); }
  else if (mo === 'o') { ell(g, 0, .7 * u, .07 * u, .09 * u); fs(g, '#9C5A5E'); }
  else if (mo === 'sad') { g.beginPath(); g.arc(0, .82 * u, .13 * u, -2.5, -.64); g.stroke(); }
  else line(g, -.08 * u, .7 * u, .08 * u, .7 * u, '#9C5A5E', .05 * u);
  // 前面的头发
  if (style === 'short' || style === 'buzz') {
    g.beginPath(); g.moveTo(-1.08 * u, .1 * u); g.quadraticCurveTo(-1.25 * u, -1.15 * u, -.2 * u, -1.32 * u); g.lineTo(0, -1.5 * u); g.lineTo(.18 * u, -1.3 * u); g.lineTo(.55 * u, -1.38 * u); g.lineTo(.5 * u, -1.15 * u);
    g.quadraticCurveTo(1.2 * u, -1.0 * u, 1.08 * u, .1 * u); g.quadraticCurveTo(.95 * u, -.4 * u, .55 * u, -.42 * u); g.quadraticCurveTo(.3 * u + sway(.6), -.7 * u, -.05 * u, -.5 * u); g.quadraticCurveTo(-.4 * u, -.62 * u, -.6 * u, -.4 * u); g.quadraticCurveTo(-.95 * u, -.35 * u, -1.08 * u, .1 * u);
    g.closePath(); fs(g, L.hair);
    g.beginPath(); g.arc(-.1 * u, -.35 * u, .85 * u, -2.6, -1.4); g.strokeStyle = rgba(L.hairL, .8); g.lineWidth = .09 * u; g.stroke();
  } else {
    g.beginPath(); g.moveTo(-1.12 * u, style === 'pony' ? .2 * u : .6 * u); g.quadraticCurveTo(-1.25 * u, -1.25 * u, 0, -1.28 * u); g.quadraticCurveTo(1.25 * u, -1.25 * u, 1.12 * u, style === 'pony' ? .2 * u : .6 * u);
    g.quadraticCurveTo(.95 * u, -.25 * u, .7 * u, -.35 * u); g.quadraticCurveTo(.45 * u + sway(.5), -.6 * u, .1 * u, -.42 * u); g.quadraticCurveTo(-.15 * u + sway(.5, 1), -.68 * u, -.45 * u, -.45 * u); g.quadraticCurveTo(-.85 * u, -.4 * u, -1.12 * u, style === 'pony' ? .2 * u : .6 * u);
    g.closePath(); fs(g, L.hair);
    // 两边垂下来的碎发，跟着风飘
    // 鬓角垂下来的一缕：贴着脸边，风只让发梢轻轻摆（摆太多会横过脸，或者翘出去像触角）
    const lock = (v, ph) => Math.sin(t * 2.4 + ph) * .04 * u * v + clamp(wx, -1, 1) * .1 * u * v;
    for (const sx of [-1, 1]) {
      const x0 = sx * .98 * u, x1 = sx * 1.08 * u + lock(1, sx), x2 = sx * 1.02 * u + lock(1.5, sx + 1), y2 = style === 'pony' ? .7 * u : 1.0 * u;
      g.beginPath(); g.moveTo(x0 - sx * .08 * u, -.45 * u); g.quadraticCurveTo(x1, .2 * u, x2, y2); g.quadraticCurveTo(x1 - sx * .1 * u, .2 * u, x0 + sx * .06 * u, -.45 * u); g.closePath();
      fs(g, L.hair);
    }
    g.beginPath(); g.arc(0, -.3 * u, .85 * u, -2.6, -.55); g.strokeStyle = rgba(L.hairL, .6); g.lineWidth = .1 * u; g.stroke();
    if (style === 'pony') { ell(g, .78 * u, -1.0 * u, .16 * u, .12 * u, .6); fs(g, '#E86A7E'); }
  }
  g.restore();
  if (o.extra) o.extra(g, u);
}

/* ---------------- 背影 ---------------- */
function backView(g, o) {
  const u = o.u, B = charBuf(u * 8 + 60), S = B.S, half = S / 2, cg = B.g;
  const k = Math.min(1, (half - 20) / (u * 4));
  cg.setTransform(1, 0, 0, 1, 0, 0); cg.globalAlpha = 1; cg.globalCompositeOperation = 'source-over';
  cg.clearRect(0, 0, S, S); cg.translate(half, half); cg.scale(k, k);
  const L = lookOf(o), cl = outfitOf(o, L), style = o.hairStyle || cl.style || L.style;
  cg.rotate(o.tiltH || 0);
  // 身体：肩膀到画面下面
  const body = () => { cg.beginPath(); cg.moveTo(-2.0 * u, 4.2 * u); cg.lineTo(-2.0 * u, 2.4 * u); cg.quadraticCurveTo(-1.9 * u, 1.5 * u, -.8 * u, 1.35 * u); cg.lineTo(.8 * u, 1.35 * u); cg.quadraticCurveTo(1.9 * u, 1.5 * u, 2.0 * u, 2.4 * u); cg.lineTo(2.0 * u, 4.2 * u); cg.closePath(); };
  body(); fs(cg, cl.top);
  if (cl.uni) { cg.save(); body(); cg.clip(); cg.beginPath(); cg.moveTo(-2.2 * u, 1.2 * u); cg.lineTo(2.2 * u, 1.2 * u); cg.lineTo(2.2 * u, 2.1 * u); cg.quadraticCurveTo(0, 2.3 * u, -2.2 * u, 2.1 * u); cg.closePath(); fs(cg, cl.sleeve); rr(cg, -2.2 * u, 1.2 * u, .55 * u, 3.2 * u, 0); fs(cg, cl.sleeve); rr(cg, 1.65 * u, 1.2 * u, .55 * u, 3.2 * u, 0); fs(cg, cl.sleeve); cg.restore(); }
  if (o.backText) o.backText(cg, u);       // 背上的签名
  rr(cg, -.32 * u, .5 * u, .64 * u, 1.0 * u, .25 * u); fs(cg, shade(L.skin, .88));
  if (style === 'short' || style === 'buzz' || style === 'pony') { ell(cg, -.98 * u, .05 * u, .2 * u, .28 * u); fs(cg, L.skin); ell(cg, .98 * u, .05 * u, .2 * u, .28 * u); fs(cg, L.skin); }
  // 后脑勺
  ell(cg, 0, -.18 * u, 1.02 * u, 1.08 * u); fs(cg, L.hair);
  if (style === 'long' || style === 'bob') {
    const len = style === 'long' ? 2.7 : 1.15;
    cg.beginPath(); cg.moveTo(-1.02 * u, -.3 * u);
    cg.quadraticCurveTo(-1.25 * u, len * .45 * u, -1.1 * u, len * u);
    cg.quadraticCurveTo(-.55 * u, (len + .3) * u, 0, (len + .15) * u); cg.quadraticCurveTo(.55 * u, (len + .3) * u, 1.1 * u, len * u);
    cg.quadraticCurveTo(1.25 * u, len * .45 * u, 1.02 * u, -.3 * u); cg.closePath(); fs(cg, L.hair);
  } else if (style === 'pony') {
    const sw = Math.sin((o.t || 0) * 3) * .2 * u + (o.wind ? o.wind[0] * .5 * u : 0);
    cg.beginPath(); cg.moveTo(-.25 * u, -.75 * u); cg.quadraticCurveTo(-.45 * u + sw * .5, .5 * u, -.1 * u + sw, 1.7 * u); cg.quadraticCurveTo(.2 * u + sw, .5 * u, .25 * u, -.75 * u); cg.closePath(); fs(cg, shade(L.hair, 1.05));
    ell(cg, 0, -.78 * u, .24 * u, .14 * u); fs(cg, '#E86A7E');
  } else {
    for (const [x, y] of [[-.6, .55], [-.2, .72], [.25, .7], [.62, .52]]) { cg.beginPath(); cg.moveTo((x - .15) * u, (y - .3) * u); cg.lineTo(x * u, y * u); cg.lineTo((x + .15) * u, (y - .3) * u); cg.closePath(); fs(cg, L.hair); }
  }
  cg.beginPath(); cg.arc(-.15 * u, -.45 * u, .68 * u, -2.6, -1.5); cg.strokeStyle = rgba(L.hairL, .7); cg.lineWidth = .1 * u; cg.stroke();
  litChar(B, o.light || LIGHT.room, u * k);
  withAlpha(g, o.alpha ?? 1, () => g.drawImage(B.c, o.x - half / k, o.y - half / k, S / k, S / k));
}

/* ---------------- 像素小怪 ----------------
   原图 12×8 个方块：
     ..oooooooo..
     ..o#oooo#o..
     oooooooooooo
     oooooooooooo
     ..oooooooo..
     ..oooooooo..
     ..o.o..o.o..
     ..o.o..o.o..
   pixelMon：真正的方块（挂件、发光）；monDoodle：铅笔画的轮廓（纸飞机、课桌、本子上的涂鸦） */
const MON_ROWS = ['..oooooooo..', '..o#oooo#o..', 'oooooooooooo', 'oooooooooooo', '..oooooooo..', '..oooooooo..', '..o.o..o.o..', '..o.o..o.o..'];
const MON = { orange: '#D9825E', pink: '#E58BAA' };
function pixelMon(g, x, y, s, col, a = 1, o = {}) {
  if (a <= .01) return;
  withAlpha(g, a, () => {
    if (o.glow) glow(g, x, y, s * 14, col, .6 * o.glow);
    g.save(); g.translate(x - 6 * s, y - 4 * s);
    MON_ROWS.forEach((r, j) => { for (let i = 0; i < 12; i++) { const ch = r[i]; if (ch === 'o') { g.fillStyle = col; g.fillRect(i * s, j * s, s + .5, s + .5); } else if (ch === '#') { g.fillStyle = o.eyeCol || '#1A1418'; g.fillRect(i * s, j * s, s + .5, s + .5); } } });
    g.restore();
  });
}
/* 铅笔涂鸦：外轮廓 + 两只眼睛，线条稍微抖一点 */
function monDoodle(g, x, y, s, col = '#5A5868', lw = 1.6, seed = 1) {
  const j = (i, k) => (hash(i, k, seed) - .5) * s * .18;
  const pts = [[2, 0], [10, 0], [10, 2], [12, 2], [12, 4], [10, 4], [10, 6], [9, 6], [9, 8], [8, 8], [8, 6], [7, 6], [7, 6], [5, 6], [5, 8], [4, 8], [4, 6], [3, 6], [3, 8], [2, 8], [2, 4], [0, 4], [0, 2], [2, 2]];
  g.save(); g.translate(x - 6 * s, y - 4 * s);
  g.beginPath(); pts.forEach(([px, py], i) => { const X = px * s + j(i, 1), Y = py * s + j(i, 2); i ? g.lineTo(X, Y) : g.moveTo(X, Y); }); g.closePath();
  g.strokeStyle = col; g.lineWidth = lw; g.lineJoin = 'round'; g.stroke();
  g.fillStyle = col; g.fillRect(3 * s, 1 * s, s * .9, s * .9); g.fillRect(8 * s, 1 * s, s * .9, s * .9);
  g.restore();
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
/* 头在画面上的位置 */
function headPos(o) {
  const u = o.u, P = o.pose || POSE.stand, tilt = P.tilt;
  const up = dir(Math.PI - tilt), hd = dir(Math.PI - tilt - P.head * .8);
  let x = up[0] * 2.3 * u + hd[0] * 1.18 * u, y = up[1] * 2.3 * u + hd[1] * 1.18 * u;
  if (o.rot) { const c = Math.cos(o.rot), sn = Math.sin(o.rot); [x, y] = [x * c - y * sn, x * sn + y * c]; }
  if ((o.face ?? 1) < 0) x = -x;
  return [o.x + x, o.y + y];
}
