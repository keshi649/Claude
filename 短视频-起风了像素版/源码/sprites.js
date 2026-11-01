'use strict';
/* sprites.js —— 人物（自己画的像素人，不用小怪）和道具。
   人物一般高约 38 格：头 15×15 的字符画（正面 front、侧面 side 朝右、四分之三 three 朝右、背面 back），
   身子按姿势表用粗线一段段画（胳膊、腿各两节），每段先画一圈描边色再画填色，最后整体加侧光。 */

/* ---------------- 调色 ---------------- */
const PAL = {
  K: 0x2b1f33,                                   // 描边：深紫，不用纯黑
  skin: 0xf8d8c0, skinS: 0xe6b096, blush: 0xf09898, eye: 0x2a2140, eyeW: 0xffffff, mouth: 0xb5565c,
};
const HAIRS = {
  he: [0x2c2232, 0x4c3c56], she: [0x3a2628, 0x6e4a46], dark: [0x231c26, 0x433848], brown: [0x4a3026, 0x7a5440],
  chest: [0x5a3a2a, 0x8a6048], black: [0x1c1820, 0x3a3242], grey: [0x6a6670, 0x9a96a0],
};
/* 衣服：每套 = 部位 → [亮, 暗] */
const OUTFIT = {
  uni: { shirt: [0xf6f8fc, 0xc6d0e4], trim: [0x3266c4, 0x234c96], pants: [0x2c3f7a, 0x1e2c5a], stripe: 0xe8eef8, shoe: [0xf4f4f6, 0xb8bfcc], sleeve: 'short' },
  shirt: { shirt: [0xf4f6fa, 0xc8d0e0], trim: [0xf4f6fa, 0xc8d0e0], pants: [0x3a3c48, 0x272834], shoe: [0x3a2c2a, 0x221816], sleeve: 'long' },
  cardigan: { shirt: [0xefe2cc, 0xcdbb9e], trim: [0xa8c0e0, 0x7f98c0], pants: [0xa8c0e0, 0x7f98c0], skirt: true, shoe: [0xf2ece4, 0xc0b6a8], sleeve: 'long' },
  teacher: { shirt: [0xd6e6f6, 0xa8bcd8], trim: [0xd6e6f6, 0xa8bcd8], pants: [0x4a4a56, 0x33333e], shoe: [0x2e2626, 0x1a1414], sleeve: 'long' },
};

/* ---------------- 头：字符画 ----------------
   K 描边 H 头发 h 头发高光 S 皮肤 s 皮肤暗面 E 眼睛 w 眼睛高光 B 腮红 M 嘴 R 发绳 (透明 .)
   每个 15×15，下巴底在第 14 行，脖子接在第 7 列 */
const HEADS = {
  boy: {
    front: [
      '.......KK......',
      '.....KKHK......',
      '...KKHHHHKKK...',
      '..KHHHhhHHHHK..',
      '.KHHhhHHHHHHHK.',
      '.KHhHHHHHHHHHK.',
      '.KHHHHHHHHHHHK.',
      '.KHHSHHHHHSHHK.',
      '.KHSSSHSSSSSHK.',
      '.KSSEwSSSEwSSK.',
      '.KSSEESSSEESsK.',
      '.KSBSSSSSSSBsK.',
      '..KSSSSMSSSsK..',
      '...KKSSSSSKK...',
      '.....KKKKK.....'],
    side: [
      '........KK.....',
      '......KKHK.....',
      '....KKHHHHKK...',
      '...KHHHhhhHHK..',
      '..KHHHhHHHHHHK.',
      '..KHHHHHHHHHHHK',
      '..KHHHHHHHHHHHK',
      '..KHHHHHHHHHSHK',
      '..KHHHHHHHSSSSK',
      '..KHHHsHSSSSESK',
      '...KHHSSSSSSESK',
      '...KHSSSSSSSSSSK',
      '....KSSSSSSBSMK.',
      '....KKSSSSSSSK..',
      '......KKKKKKK...'],
    three: [
      '.......KK......',
      '.....KKHK......',
      '...KKHHHHKKK...',
      '..KHHHhhhHHHK..',
      '.KHHHhHHHHhHHK.',
      '.KHHhHHHHHHHHK.',
      '.KHHHHHHHHHHHHK',
      '.KHHHHHSHHHHSHK',
      '.KHHHSSSSHSSSSK',
      '.KHHSSEwSSSEwSK',
      '.KHsSSEESSSEESK',
      '.KHsSBSSSSSSBSK',
      '..KHSSSSSSMSSK.',
      '...KKSSSSSSKK..',
      '.....KKKKKK....'],
    back: [
      '.......KK......',
      '.....KKHK......',
      '...KKHHHHKKK...',
      '..KHHHhhHHHHK..',
      '.KHHhhHHHHHHHK.',
      '.KHhHHHHHHHHHK.',
      '.KHHHHHHHHHHHK.',
      '.KHHHHHHHHHHHK.',
      '.KHHHHHHHHHHHK.',
      '.KHHHHHHHHHHHK.',
      '.KsHHHHHHHHHsK.',
      '.KSKHHHHHHHKSK.',
      '..KKHHHHHHHKK..',
      '....KHHHHHK....',
      '.....KKKKK.....'],
  },
  pony: {
    front: [
      '...............',
      '.....KKKKKK....',
      '...KKHHHHHHKK..',
      '..KHHhhhhHHHK..',
      '.KHhHHHHhhHHHK.',
      '.KHHHHHHHHHHHK.',
      '.KHHHHHHHHHHHK.',
      '.KHHHHHSHHHHHK.',
      '.KHHSSSSSHSSHK.',
      '.KHSEwSSSEwSHK.',
      '.KHSEESSSEESHK.',
      '.KHBSSSSSSSBHK.',
      '.KHKSSSMSSSKHK.',
      '..K.KSSSSSK.K..',
      '.....KKKKK.....'],
    side: [
      '...............',
      '....KKKKKKK....',
      '..KKHHHHHHHKK..',
      '.RHHHHHhhhHHHK.',
      '.RHHHHhHHHHHHHK',
      '.KHHHHHHHHHHHHK',
      '..KHHHHHHHHHHHK',
      '..KHHHHHHHHHSHK',
      '..KHHHHHHHSSSSK',
      '..KHHHsHSSSSESK',
      '...KHHSSSSSSESK',
      '...KHSSSSSSSSSSK',
      '....KSSSSSSBSMK.',
      '....KKSSSSSSSK..',
      '......KKKKKKK...'],
    three: [
      '...............',
      '......KKKKKK...',
      '...KKHHHHHHKK..',
      '..KHHHhhhHHHK..',
      '.KHHHhHHHHhHHK.',
      '.KHHhHHHHHHHHK.',
      '.KHHHHHHHHHHHHK',
      '.KHHHHHHSHHHSHK',
      '.KHHHSSSSSHSSSK',
      '.KHHSSEwSSSEwSK',
      '.KHHSSEESSSEESK',
      '.KHHSBSSSSSSBSK',
      '..KHKSSSSSMSSK.',
      '...K.KSSSSSKK..',
      '.....KKKKKK....'],
    back: [
      '.......KK......',
      '......KRRK.....',
      '...KKHHHHKKK...',
      '..KHHHhhHHHHK..',
      '.KHHhhHHHHHHHK.',
      '.KHhHHHHHHHHHK.',
      '.KHHHHHHHHHHHK.',
      '.KHHHHHHHHHHHK.',
      '.KHHHHHHHHHHHK.',
      '.KHHHHHHHHHHHK.',
      '.KsHHHHHHHHHsK.',
      '.KSKHHHHHHHKSK.',
      '..KKHHHHHHHKK..',
      '....KHHHHHK....',
      '.....KKKKK.....'],
  },
};
/* 派生的发型：长发 / 短发（女生，不扎）= 马尾去掉发绳；寸头 = 男生去掉呆毛、刘海短一点 */
for (const [name, from, fn] of [
  ['long', 'pony', r => r.replace(/R/g, 'H')],
  ['bob', 'pony', r => r.replace(/R/g, 'H')],
  ['buzz', 'boy', (r, y) => y < 2 ? '.'.repeat(r.length) : y === 2 ? r.replace(/^\.\.\.KKHHHHKKK\.\.\./, '...KKKKKKKK....') : r],
]) { HEADS[name] = {}; for (const f of Object.keys(HEADS[from])) HEADS[name][f] = HEADS[from][f].map((r, y) => fn(r, y)); }

/* 表情：在固定的格子上改几格。每种朝向的眼睛、嘴的位置 */
const FEAT = {
  front: { eyes: [[4, 9], [9, 9]], mouth: [7, 12] },
  three: { eyes: [[6, 9], [11, 9]], mouth: [10, 12] },
  side: { eyes: [[12, 9]], mouth: [13, 12] },
};
function headRows(style, facing, expr) {
  const rows = HEADS[style][facing].map(r => r.split(''));
  const f = FEAT[facing]; if (!f) return rows.map(r => r.join(''));
  const setc = (x, y, c) => { if (rows[y] && rows[y][x] !== undefined) rows[y][x] = c; };
  const eyeW = facing === 'side' ? 1 : 2;
  for (const [ex, ey] of f.eyes) {
    if (expr.eyes === 'closed') { for (let i = 0; i < eyeW; i++) { setc(ex + i, ey, 'S'); setc(ex + i, ey + 1, 'E'); } }     // 闭眼：下面一道
    else if (expr.eyes === 'happy') { for (let i = 0; i < eyeW; i++) { setc(ex + i, ey, 'E'); setc(ex + i, ey + 1, 'S'); } }  // 笑眯眯：上面一道，像弯起来的月牙 else if (expr.eyes === 'wide') { setc(ex, ey - 1, 'E'); if (eyeW === 2) setc(ex + 1, ey - 1, 'E'); }
    else if (expr.eyes === 'down') { for (let i = 0; i < eyeW; i++) { setc(ex + i, ey, 'S'); } }   // 往下看：只剩下面一行
  }
  const [mx, my] = f.mouth;
  if (expr.mouth === 'smile') { setc(mx - 1, my, 'M'); setc(mx, my, 'S'); setc(mx + (facing === 'side' ? 0 : 1), my, 'M'); if (facing !== 'side') { setc(mx, my, 'M'); setc(mx - 1, my - 0, 'M'); } }
  else if (expr.mouth === 'open') { setc(mx, my, 'M'); setc(mx, my + 1 <= 13 ? my : my, 'M'); if (facing !== 'side') setc(mx + 1, my, 'M'); }
  else if (expr.mouth === 'none') setc(mx, my, 'S');
  if (expr.blush === false) for (const r of rows) for (let i = 0; i < r.length; i++) if (r[i] === 'B') r[i] = 'S';
  if (expr.glasses) for (const [ex, ey] of f.eyes) {               // 眼镜：一圈框
    const w2 = facing === 'side' ? 1 : 2;
    for (let i = -1; i <= w2; i++) { setc(ex + i, ey - 1, 'G'); setc(ex + i, ey + 2, 'G'); }
    setc(ex - 1, ey, 'G'); setc(ex - 1, ey + 1, 'G'); setc(ex + w2, ey, 'G'); setc(ex + w2, ey + 1, 'G');
  }
  return rows.map(r => r.join(''));
}
const _heads = new Map();
function headSpr(look, facing, expr = {}) {
  if (look.glasses) expr = { ...expr, glasses: true };
  const key = look.hair + facing + JSON.stringify(expr) + look.hc.join() + (look.tie || '') + (look.skin || '');
  let s = _heads.get(key); if (s) return s;
  const [hc, hh] = look.hc;
  const pal = { K: C(PAL.K), H: C(hc), h: C(hh), S: C(look.skin || PAL.skin), s: C(PAL.skinS), E: C(PAL.eye), w: C(PAL.eyeW), B: C(PAL.blush), M: C(PAL.mouth), R: C(look.tie || hc), G: C(look.gc || 0x3a3448) };
  s = spr(headRows(look.hair, facing, expr), pal); _heads.set(key, s); return s;
}

/* ---------------- 角色的样子 ---------------- */
const LOOK = {
  he: { hair: 'boy', hc: HAIRS.he, outfit: 'uni' },
  she: { hair: 'pony', hc: HAIRS.she, tie: 0xe8343e, outfit: 'uni', pony: true },
  heA: { hair: 'boy', hc: HAIRS.he, outfit: 'shirt' },                       // 七年后的他：白衬衫
  sheA: { hair: 'long', hc: HAIRS.she, outfit: 'cardigan', long: true },     // 七年后的她：披肩长发、开衫长裙
  sheA2: { hair: 'pony', hc: HAIRS.she, tie: 0xe8343e, outfit: 'cardigan', pony: true },   // 最后又扎起了马尾
  teacher: { hair: 'buzz', hc: HAIRS.grey, outfit: 'teacher', glasses: true },
};
const SKINS = [0xf8d8c0, 0xf4cfb4, 0xf0c6aa, 0xfadfca, 0xeabc9e];
const TIES = [0x3a3448, 0x3266c4, 0xe8b830, 0xe8343e, 0x8a5ac0];
/* 同学 i：发型、发色、肤色、眼镜都按编号定（同一个编号永远是同一个人） */
function kid(i, adult = false) {
  const girl = hash(i, 11) < .5;
  const hair = girl ? pick(['pony', 'bob', 'bob', 'pony', 'long'], hash(i, 12) * 5) : pick(['boy', 'buzz', 'buzz'], hash(i, 13) * 3);
  const lk = { hair, hc: pick([HAIRS.dark, HAIRS.black, HAIRS.brown, HAIRS.chest, HAIRS.dark], hash(i, 14) * 5), skin: pick(SKINS, hash(i, 15) * 5),
    glasses: hash(i, 16) < .25, outfit: 'uni', pony: hair === 'pony', long: hair === 'long' && adult, tie: pick(TIES, hash(i, 17) * 5) };
  if (adult) {
    const cc = pick([[0xd96a6a, 0xa84a52], [0x6aa0d8, 0x4a78ae], [0x8cc49a, 0x5e9a70], [0xf0c860, 0xc09a3a], [0xb89ad8, 0x8a6aae], [0xe8e0d0, 0xb8ae9c]], i);
    lk.outfit = 'cas' + mod(i, 6); OUTFIT[lk.outfit] = OUTFIT[lk.outfit] || { shirt: cc, trim: cc, pants: pick([[0x3a3c48, 0x272834], [0x5a6a88, 0x3e4a64], [0x7a6a5a, 0x564a3e]], i), shoe: [0x3a2c2a, 0x221816], sleeve: 'short' };
    if (girl && hash(i, 18) < .5) { lk.hair = 'long'; lk.long = true; lk.pony = false; }
  }
  return lk;
}

/* ---------------- 身子 ---------------- */
/* 姿势：tilt 躯干前倾（弧度，正 = 往脸的方向倒），head 头往前探（格），
   胳膊 aN（近侧）aF（远侧）= [大臂角, 小臂再弯]，腿 lN lF = [大腿角, 小腿往后弯]；角度从竖直向下量，正 = 往前。
   bob 身子上下（格）。正面、背面的姿势另用 arms: [左大臂, 左小臂, 右大臂, 右小臂]（正 = 往外张） */
const POSE = {
  stand: { tilt: 0, aN: [.06, .1], aF: [.06, .1], lN: [0, 0], lF: [0, 0] },
  standHand: { tilt: 0, aN: [.25, 1.3], aF: [-.06, .1], lN: [0, 0], lF: [0, 0] },          // 一只手抬在胸前
  hold: { tilt: .04, aN: [.35, 1.35], aF: [.3, 1.35], lN: [0, 0], lF: [0, 0] },            // 两只手捧着东西
  give: { tilt: .08, aN: [1.2, .2], aF: [.2, .4], lN: [.05, 0], lF: [-.05, 0] },           // 把东西递出去
  reach: { tilt: .1, aN: [1.9, .1], aF: [.3, .3], lN: [.1, 0], lF: [-.1, 0] },             // 伸手够高处
  throw0: { tilt: -.1, aN: [-2.4, -.6], aF: [.4, .5], lN: [.2, 0], lF: [-.25, .1] },       // 扔之前往后引
  throw1: { tilt: .2, aN: [1.5, .1], aF: [-.4, .3], lN: [.35, .1], lF: [-.2, .2] },        // 扔出去
  wave: { tilt: 0, aN: [2.6, .5], aF: [-.06, .1], lN: [0, 0], lF: [0, 0] },
  lookUp: { tilt: -.12, head: -1, aN: [.04, .1], aF: [-.08, .1], lN: [0, 0], lF: [0, 0] },
  sit: { tilt: -.02, aN: [.35, .9], aF: [.3, .9], lN: [1.5, 1.5], lF: [1.45, 1.45] },      // 坐着，手放腿上
  sitDesk: { tilt: .16, aN: [.55, 1.1], aF: [.5, 1.1], lN: [1.52, 1.52], lF: [1.47, 1.47] }, // 坐在课桌前，小臂搭桌面
  write: { tilt: .3, head: 1, aN: [.7, 1.0], aF: [.6, 1.1], lN: [1.52, 1.52], lF: [1.47, 1.47] },
  chin: { tilt: .2, aN: [.35, 2.5], aF: [.55, 1.1], lN: [1.52, 1.52], lF: [1.47, 1.47] },   // 托腮
  sleep: { tilt: .95, head: 2, aN: [1.3, .9], aF: [1.25, .95], lN: [1.52, 1.52], lF: [1.47, 1.47] },
  guitar: { tilt: .05, head: 1, aN: [.7, 1.3], aF: [1.1, .7], lN: [1.5, 1.5], lF: [1.45, 1.45] },
  hugKnees: { tilt: .35, head: 1, aN: [.9, .9], aF: [.85, .9], lN: [2.4, 2.6], lF: [2.35, 2.6] },
};
/* 走、跑：ph 是步子的相位（每走一步 +1） */
function walkPose(ph, amt = 1, run = false) {
  const s = Math.sin(ph * Math.PI), c = Math.cos(ph * Math.PI), k = run ? 1.6 : 1;
  return {
    tilt: run ? .22 : .03, bob: -Math.abs(c) * (run ? 1.6 : .8) * amt,
    aN: [-s * .55 * amt * k, (run ? 1.4 : .25) + Math.max(0, -s) * .3], aF: [s * .55 * amt * k, (run ? 1.4 : .25) + Math.max(0, s) * .3],
    lN: [s * .5 * amt * k, Math.max(0, -s) * .9 * amt * k + (run ? .3 : 0)], lF: [-s * .5 * amt * k, Math.max(0, s) * .9 * amt * k + (run ? .3 : 0)],
  };
}
function lerpPose(a, b, u) {
  const o = {}; for (const k of new Set([...Object.keys(a), ...Object.keys(b)])) {
    const x = a[k] ?? b[k], y = b[k] ?? a[k];
    o[k] = Array.isArray(x) ? x.map((v, i) => lerp(v, y[i], u)) : typeof x === 'number' ? lerp(x, y, u) : (u < .5 ? x : y);
  } return o;
}

/* 一节带描边的粗线：先画描边（宽 w+2），填色另画；sh 是暗面色，光从左上来 */
const LIGHT_DIR = [-.7, -.7];
function limbFill(x0, y0, x1, y1, w, c, sh, shadeK = .34) {
  const r = w / 2, vx = x1 - x0, vy = y1 - y0, L = Math.hypot(vx, vy) || 1e-6, nx = -vy / L, ny = vx / L, L2 = L * L, rr = r * r + r * .25;
  const bx0 = Math.floor(Math.min(x0, x1) - r - 1), bx1 = Math.ceil(Math.max(x0, x1) + r + 1), by0 = Math.floor(Math.min(y0, y1) - r - 1), by1 = Math.ceil(Math.max(y0, y1) + r + 1);
  for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
    const px = x + .5 - x0, py = y + .5 - y0, u = clamp((px * vx + py * vy) / L2), qx = px - u * vx, qy = py - u * vy, d2 = qx * qx + qy * qy;
    if (d2 > rr) continue;
    const d = Math.sqrt(d2), dn = d > 0 ? (qx * LIGHT_DIR[0] + qy * LIGHT_DIR[1]) / d : 0;
    pset(x, y, (dn < -.2 && d > r * (1 - shadeK * 2)) ? sh : c);
  }
}
function limbOut(x0, y0, x1, y1, w, k) { capsule(x0, y0, x1, y1, w + 2, k); }

/* 画一个人。o: look（LOOK 里的）、x, y（脚底中点）、face（1 朝右 / -1 朝左）、view（'side' | 'front' | 'back' | 'three'）、
   pose、expr（表情）、t（时间：头发、衣角飘）、wind（风，-1~1 往哪边吹）、alpha、tint [颜色, 程度]、rim [颜色, 强度]（逆光的亮边）、
   hold(hx, hy, face) 在手上画东西、sitY（坐着时屁股的 y，给了就按坐着摆）、shadow（脚下的影子，默认有）。
   返回关节位置（屏幕坐标）：{ hand, handF, head, hip, shoulder } */
const _P = { s: null };
function person(o) {
  const lk = typeof o.look === 'string' ? LOOK[o.look] : o.look, of = OUTFIT[o.outfit || lk.outfit];
  const f = o.face ?? 1, view = o.view || 'side', pose = o.pose || POSE.stand, t = o.t ?? 0;
  const L = surf(64, 80), OX = 32, OY = 72;                       // 人先画在自己的小画布上，脚底在 (OX, OY)
  if (!_P.s) _P.s = L; const s = _P.s; s.d32.fill(0);
  const K = C(PAL.K), sk = C(lk.skin || PAL.skin), skS = C(PAL.skinS);
  const col = k => C(of[k][0]), shd = k => C(of[k][1]);
  const dir = (a, ff = f) => [Math.sin(a) * ff, Math.cos(a)];
  const add = (p, v, l) => [p[0] + v[0] * l, p[1] + v[1] * l];
  const bob = pose.bob || 0, tilt = pose.tilt || 0;
  const sitting = o.sitY !== undefined;
  const hip = sitting ? [OX, OY - (o.y - o.sitY)] : [OX, OY - 13 + bob];
  const sho = add(hip, [Math.sin(tilt) * f, -Math.cos(tilt)], 10);
  const J = {};
  withT(s, () => {
    if (view === 'side' || view === 'three') {
      // ---------- 侧面 ----------
      const leg = (lp, far) => {
        const a1 = lp[0], a2 = lp[0] - lp[1], knee = add(hip, dir(a1), 6), ank = add(knee, dir(a2), 6), toe = add(ank, dir(a2 + Math.PI / 2), 3);
        const pc = far ? shd('pants') : col('pants'), ps = far ? darker(shd('pants'), .2) : shd('pants');
        limbOut(hip[0], hip[1], knee[0], knee[1], 3.4, K); limbOut(knee[0], knee[1], ank[0], ank[1], 3, K); limbOut(ank[0], ank[1] + .5, toe[0], toe[1] + .5, 2.4, K);
        limbFill(hip[0], hip[1], knee[0], knee[1], 3.4, pc, ps); limbFill(knee[0], knee[1], ank[0], ank[1], 3, pc, ps);
        if (of.stripe && !far) line(lerp(hip[0], knee[0], .3), lerp(hip[1], knee[1], .3), ank[0], ank[1] - 1, C(of.stripe), .85);
        limbFill(ank[0], ank[1] + .5, toe[0], toe[1] + .5, 2.4, far ? shd('shoe') : col('shoe'), shd('shoe'));
        return { knee, ank, toe };
      };
      const arm = (ap, far) => {
        const a1 = ap[0] + tilt, a2 = a1 + ap[1], elb = add(sho, dir(a1), 5), hand = add(elb, dir(a2), 5);
        const slv = of.sleeve === 'long';
        limbOut(sho[0], sho[1], elb[0], elb[1], 2.6, K); limbOut(elb[0], elb[1], hand[0], hand[1], 2.2, K); disc(hand[0], hand[1], 1.6, K);
        limbFill(sho[0], sho[1], elb[0], elb[1], 2.6, far ? shd('shirt') : col('shirt'), shd('shirt'));
        if (!slv) { const cuff = add(sho, dir(a1), 3.6); limbFill(cuff[0], cuff[1], elb[0], elb[1], 2.6, far ? shd('trim') : col('trim'), shd('trim')); }
        limbFill(elb[0], elb[1], hand[0], hand[1], 2.2, slv ? (far ? shd('shirt') : col('shirt')) : (far ? skS : sk), slv ? shd('shirt') : skS);
        disc(hand[0], hand[1], .9, far ? skS : sk);
        return { elb, hand };
      };
      // 马尾（在最后面）
      if (lk.pony) pony(s, add(sho, [Math.sin(tilt) * f, -Math.cos(tilt)], 12 + (pose.head || 0) * .3), -f, t, o.wind ?? 0, pose, lk);
      if (lk.long) longHair(s, sho, f, t, o.wind ?? 0, lk, 'side');
      const aF = arm(pose.aF, true);
      if (!of.skirt) leg(pose.lF, true);
      // 躯干
      const hipB = add(hip, [Math.sin(tilt) * f, -Math.cos(tilt)], 1.5);
      limbOut(hipB[0], hipB[1], sho[0], sho[1] + 1, 6.6, K);
      if (of.skirt) skirtSide(s, hip, f, t, o.wind ?? 0, of, pose, sitting);
      const lN = of.skirt ? null : leg(pose.lN, false);
      if (of.skirt) { /* 裙子盖住腿：只画露出来的脚 */ const a2 = pose.lN[0] - pose.lN[1], kn = add(hip, dir(pose.lN[0]), 6), an = add(kn, dir(a2), 6), toe = add(an, dir(a2 + Math.PI / 2), 3); limbOut(an[0], an[1] + .5, toe[0], toe[1] + .5, 2.4, K); limbFill(an[0], an[1] + .5, toe[0], toe[1] + .5, 2.4, col('shoe'), shd('shoe')); }
      limbFill(hipB[0], hipB[1], sho[0], sho[1] + 1, 6.6, col('shirt'), shd('shirt'), .3);
      if (!of.skirt) { const pt = add(hip, [Math.sin(tilt) * f, -Math.cos(tilt)], .2); limbFill(pt[0] - f * .3, pt[1], pt[0] + f * .3, pt[1] + .6, 6, col('pants'), shd('pants')); }
      // 领子
      const nk = add(sho, [Math.sin(tilt) * f, -Math.cos(tilt)], -.5);
      rect(Math.round(nk[0] - 1 + f), Math.round(nk[1]), 2, 1, col('trim'));
      // 头
      const hp = add(sho, [Math.sin(tilt) * f, -Math.cos(tilt)], 1);
      const hx = Math.round(hp[0] + f * (pose.head || 0) * .6), hy = Math.round(hp[1] + Math.abs(pose.head || 0) * .5);
      const hs = headSpr(lk, view === 'three' ? 'three' : 'side', o.expr || {});
      stamp(hs, f > 0 ? hx - 7 : hx - (hs.w - 8), hy - 14, { flip: f < 0 });
      J.head = [hx, hy - 7];
      if (lk.long) longHair(s, sho, f, t, o.wind ?? 0, lk, 'sideFront');
      const aN = arm(pose.aN, false);
      J.hand = aN.hand; J.handF = aF.hand; J.elb = aN.elb;
    } else {
      // ---------- 正面 / 背面 ----------
      const back = view === 'back', arms = o.arms || [.12, .1, .12, .1];
      const legs = o.legs || [0, 0];
      const hipL = [OX - 2, hip[1]], hipR = [OX + 2, hip[1]];
      if (lk.pony && !back) pony(s, [OX + 1, hip[1] - 21], 0, t, o.wind ?? 0, pose, lk, true);
      if (lk.long && !back) longHair(s, [OX, hip[1] - 10], 1, t, o.wind ?? 0, lk, 'front');
      for (const [hp_, a] of [[hipL, -legs[0]], [hipR, legs[1]]]) {
        const ank = [hp_[0] + Math.sin(a) * 12, hp_[1] + Math.cos(a) * 12];
        if (!of.skirt) { limbOut(hp_[0], hp_[1], ank[0], ank[1], 3.4, K); limbFill(hp_[0], hp_[1], ank[0], ank[1], 3.4, col('pants'), shd('pants')); }
        limbOut(ank[0] - .5, ank[1] + .5, ank[0] + .5, ank[1] + .5, 3, K); limbFill(ank[0] - .5, ank[1] + .5, ank[0] + .5, ank[1] + .5, 3, col('shoe'), shd('shoe'));
      }
      const shL = [OX - 4, hip[1] - 9], shR = [OX + 4, hip[1] - 9];
      const armF = (shp, side, a1, a2) => {
        const v1 = [Math.sin(a1) * side, Math.cos(a1)], elb = [shp[0] + v1[0] * 5, shp[1] + v1[1] * 5];
        const v2 = [Math.sin(a1 + a2) * side, Math.cos(a1 + a2)], hand = [elb[0] + v2[0] * 5, elb[1] + v2[1] * 5];
        limbOut(shp[0], shp[1], elb[0], elb[1], 2.6, K); limbOut(elb[0], elb[1], hand[0], hand[1], 2.2, K); disc(hand[0], hand[1], 1.6, K);
        limbFill(shp[0], shp[1], elb[0], elb[1], 2.6, col('shirt'), shd('shirt'));
        if (of.sleeve !== 'long') { const cf = [shp[0] + v1[0] * 3.6, shp[1] + v1[1] * 3.6]; limbFill(cf[0], cf[1], elb[0], elb[1], 2.6, col('trim'), shd('trim')); }
        limbFill(elb[0], elb[1], hand[0], hand[1], 2.2, of.sleeve === 'long' ? col('shirt') : sk, of.sleeve === 'long' ? shd('shirt') : skS);
        disc(hand[0], hand[1], .9, sk);
        return hand;
      };
      // 身子：前面一块（白上衣），裙子 / 裤腰
      const body = () => {
        poly([[OX - 5, hip[1] - 10], [OX + 5, hip[1] - 10], [OX + 5, hip[1] + 1], [OX - 5, hip[1] + 1]], K);
        poly([[OX - 4, hip[1] - 9], [OX + 4, hip[1] - 9], [OX + 4, hip[1]], [OX - 4, hip[1]]], col('shirt'));
        rect(OX + 2, hip[1] - 8, 2, 8, shd('shirt'));
        if (of.skirt) { poly([[OX - 5, hip[1] - 1], [OX + 5, hip[1] - 1], [OX + 7, hip[1] + 12], [OX - 7, hip[1] + 12]], K); poly([[OX - 4, hip[1]], [OX + 4, hip[1]], [OX + 6, hip[1] + 11], [OX - 6, hip[1] + 11]], col('pants')); rect(OX + 2, hip[1] + 1, 3, 10, shd('pants')); }
        else rect(OX - 4, hip[1] - 1, 9, 2, col('pants'));
        if (!back) { rect(OX - 2, hip[1] - 10, 5, 1, col('trim')); if (of === OUTFIT.uni) { pset(OX, hip[1] - 9, col('trim')); line(OX, hip[1] - 8, OX, hip[1] - 2, C(0xd8dfee)); } }
      };
      if (back) { J.handL = armF(shL, -1, arms[0], arms[1]); J.handR = armF(shR, 1, arms[2], arms[3]); body(); }
      else { body(); J.handL = armF(shL, -1, arms[0], arms[1]); J.handR = armF(shR, 1, arms[2], arms[3]); }
      const hs = headSpr(lk, back ? 'back' : 'front', o.expr || {});
      stamp(hs, OX - 7, hip[1] - 24);
      J.head = [OX, hip[1] - 17];
      if (lk.pony && back) pony(s, [OX, hip[1] - 22], 0, t, o.wind ?? 0, pose, lk, true);
      if (lk.long && back) longHair(s, [OX, hip[1] - 10], 1, t, o.wind ?? 0, lk, 'back');
      if (lk.long && !back) longHair(s, [OX, hip[1] - 10], 1, t, o.wind ?? 0, lk, 'frontLocks');
      J.hand = J.handR;
    }
  });
  if (o.hold) withT(s, () => o.hold(J.hand[0], J.hand[1], f, J));
  if (o.rim) rimLight(s, o.rim[2] ?? (f > 0 ? 1 : -1), o.rim[3] ?? 0, C(o.rim[0]), o.rim[1] ?? .5);
  if (o.tint) tintSurf(s, C(o.tint[0]), o.tint[1]);
  // 脚下的影子
  if (o.shadow !== false && !sitting) for (let i = -6; i <= 6; i++) dot(o.x + i, o.y, C(0x1a1430), (.32 - Math.abs(i) * .02) * (o.alpha ?? 1));
  blit(s, o.x - OX, o.y - OY, { alpha: o.alpha ?? 1 });
  const tr = p => p && [o.x - OX + p[0], o.y - OY + p[1]];
  return { hand: tr(J.hand), handF: tr(J.handF), head: tr(J.head), handL: tr(J.handL), handR: tr(J.handR), elb: tr(J.elb) };
}

/* 高马尾：从后脑勺垂下来的一串，会跟着跑动和风甩。root 是扎发绳的地方 */
function pony(s, root, back, t, wind, pose, lk, front = false) {
  const [hc, hh] = lk.hc, K = C(PAL.K), n = 9;
  const swing = Math.sin(t * 5.2) * .3 + wind * .9 + (pose.bob ? Math.sin(t * 9) * .3 : 0);
  let x = root[0] + back * 3, y = root[1] + 1, pts = [[x, y]];
  for (let i = 1; i < n; i++) {
    const base = front ? 0 : back * (.95 - i * .07);
    const a = base + swing * (i / n) * (front ? 1.1 : 1.4) + Math.sin(t * 3 + i * .6) * .08 * i / n;
    x += Math.sin(a) * 1.25; y += Math.cos(a) * 1.25; pts.push([x, y]);
  }
  for (let i = 0; i + 1 < pts.length; i++) capsule(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], (3.4 - i * .25) + 2, K);
  for (let i = 0; i + 1 < pts.length; i++) capsule(pts[i][0], pts[i][1], pts[i + 1][0], pts[i + 1][1], 3.4 - i * .25, C(i % 3 === 1 ? hh : hc));
  if (!front || back === 0) disc(root[0] + back * 2.5, root[1] + .5, 1.2, C(lk.tie || 0xe8343e));
}
/* 披肩长发：part = 'side'（侧面，画在身后）| 'front'（正面，身后两片）| 'frontLocks'（正面，搭在肩上的两绺）| 'back'（背面，盖住后背） */
function longHair(s, sho, f, t, wind, lk, part) {
  const [hc, hh] = lk.hc, K = C(PAL.K), H_ = C(hc), Hh = C(hh);
  const sw = k => Math.sin(t * 2.4 + k * 1.3) * .6 + wind * 2.2;
  const strand = (x0, y0, len, dx, w, k) => {
    const x1 = x0 + dx + sw(k) * .8, y1 = y0 + len * .55, x2 = x0 + dx * 1.3 + sw(k + 1) * 1.6, y2 = y0 + len;
    return [[x0, y0, x1, y1, w], [x1, y1, x2, y2, w - .8]];
  };
  let segs = [];
  if (part === 'side') { const bx = sho[0] - f * 3.5, by = sho[1] - 9; for (let k = 0; k < 3; k++) segs.push(...strand(bx - f * k * 1.2, by + k, 15 - k * 1.5, -f * (1.2 + k * .6), 4 - k * .4, k)); }
  else if (part === 'front') { for (const sd of [-1, 1]) segs.push(...strand(sho[0] + sd * 6, sho[1] - 6, 14, sd * 1.4, 4.5, sd)); }
  else if (part === 'frontLocks') { for (const sd of [-1, 1]) segs.push(...strand(sho[0] + sd * 5, sho[1] - 4, 9, sd * .6, 2.4, sd + 3)); }
  else if (part === 'back') { segs.push(...strand(sho[0] - 3, sho[1] - 8, 15, -.6, 5, 0), ...strand(sho[0] + 3, sho[1] - 8, 15, .6, 5, 1), ...strand(sho[0], sho[1] - 8, 16, 0, 5, 2)); }
  else return;
  for (const [a, b, c, d, w] of segs) capsule(a, b, c, d, w + 2, K);
  segs.forEach(([a, b, c, d, w], i) => capsule(a, b, c, d, w, i % 3 === 1 ? Hh : H_));
}
/* 侧面的长裙：腰到脚踝一片梯形，走路、风吹时下摆摆动 */
function skirtSide(s, hip, f, t, wind, of, pose, sitting) {
  const K = C(PAL.K), c = C(of.pants[0]), sh = C(of.pants[1]);
  const swing = (pose.lN ? (pose.lN[0] - pose.lF[0]) * 3 : 0) + wind * 2 + Math.sin(t * 2.2) * .4;
  if (sitting) { const pts = [[hip[0] - f * 3, hip[1] - 1], [hip[0] + f * 7, hip[1] - 1], [hip[0] + f * 8, hip[1] + 6], [hip[0] + f * 4, hip[1] + 11], [hip[0] - f * 1, hip[1] + 4]]; poly(pts.map(p => [p[0] + (p[0] > hip[0] ? 1 : -1), p[1] + 1]), K); poly(pts, c); return; }
  const top = hip[1] - 2, bot = hip[1] + 12;
  const pts = [[hip[0] - 3.5, top], [hip[0] + 3.5, top], [hip[0] + 6 + swing * .6, bot], [hip[0] - 6 + swing * .6, bot]];
  poly(pts.map(([x, y]) => [x + (x > hip[0] + swing * .3 ? 1 : -1), y + (y > hip[1] ? 1 : -1)]), K);
  poly(pts, c);
  for (let y = top + 2; y < bot; y++) { const u = (y - top) / (bot - top), xb = hip[0] - f * (3.5 + u * 2.5) + swing * .6 * u; pset(xb + f * .5, y, sh); }
  for (let k = 0; k < 2; k++) { const x = hip[0] + (k ? 2 : -2) + swing * .4; line(x, top + 4, x + swing * .3, bot - 1, sh, .6); }
}

/* ---------------- 道具 ---------------- */
/* 纸飞机（侧面看）：x, y 机头，s 大小，ang 朝向（0 = 往右），old 发黄的旧纸。机翼上铅笔写着 2018.6.7（够大才写） */
function paperPlane(x, y, s, ang = 0, o = {}) {
  const ca = Math.cos(ang), sa = Math.sin(ang), P_ = (u, v) => [x + u * ca - v * sa, y + u * sa + v * ca];
  const col = o.old ? C(0xece0bc) : C(0xffffff), mid = o.old ? C(0xd6c49a) : C(0xdde6f0), dark = o.old ? C(0xb8a478) : C(0xb8c4d4), K = C(0x3a3040);
  const top = [P_(0, 0), P_(-s * 2.2, -s * .55), P_(-s * 1.8, 0)], bot = [P_(0, 0), P_(-s * 1.8, 0), P_(-s * 2.2, s * .5)], keel = [P_(0, 0), P_(-s * 1.8, 0), P_(-s * 2.0, s * .22)];
  for (const p of [top, bot]) poly(p.map(([a, b]) => [a + Math.sign(a - x) * .6, b + Math.sign(b - y) * .6]), K);
  poly(top, col); poly(bot, mid); poly(keel, dark);
  line(...P_(0, 0), ...P_(-s * 1.8, 0), dark);
  if (o.text && s >= 18) text('2018.6.7', ...P_(-s * 1.15, -s * .24), { size: 8, col: C(0x7a6a70), alpha: .8 });
}
/* 木吉他：抱在怀里（侧面），琴身在 (x, y)，琴颈往 ang 方向伸出去 */
function guitar(x, y, ang = -.5, f = 1) {
  const K = C(0x2a1a14), body = C(0xd8924a), bodyS = C(0xa86a34), neck = C(0x5a3a28), ca = Math.cos(ang) * f, sa = Math.sin(ang);
  disc(x, y, 6, K); disc(x + ca * 6, y + sa * 6, 4.6, K);
  disc(x, y, 5, body); disc(x + ca * 6, y + sa * 6, 3.6, body); disc(x + 1, y + 1, 3, bodyS);
  disc(x + ca * 3, y + sa * 3, 1.4, C(0x2a1a14));
  capsule(x + ca * 9, y + sa * 9, x + ca * 20, y + sa * 20, 2.6, K); line(x + ca * 9, y + sa * 9, x + ca * 20, y + sa * 20, neck);
  rect(x + ca * 20 - 1, y + sa * 20 - 1, 3, 3, K);
  for (let i = 0; i < 3; i++) pset(x + ca * (12 + i * 3), y + sa * (12 + i * 3), C(0xe8d8b0));
}
/* 音符：♪ 往上飘，慢慢淡掉 */
function note(x, y, c = 0xfff4d0, a = 1) { const col = C(c); rect(x, y, 2, 2, col, a); rect(x + 1, y - 5, 1, 5, col, a); pset(x + 2, y - 5, col, a); pset(x + 3, y - 4, col, a); }
/* 红发绳：一个小圈 + 两条飘带 */
function hairTie(x, y, t, a = 1) { const c = C(0xe8343e), k = C(0x5a1a22); ring(x, y, 1.6, k, a); pset(x, y - 1, c, a); pset(x + 1, y, c, a); pset(x - 1, y, c, a); pset(x, y + 1, c, a); line(x + 1, y + 1, x + 4 + Math.sin(t * 9) * 1.2, y + 3, c, a); line(x - 1, y + 1, x - 2 + Math.sin(t * 8) * 1, y + 4, c, a); }
/* 运动鞋（侧面，特写用，矢量画好再缩成像素）：x, y 鞋底中点，s 大小，col 鞋身颜色 */
function vshoe(x, y, s, col = '#f4f4f6', o = {}) {
  const bw = Math.ceil(s * 3.2), bh = Math.ceil(s * 2.2);
  _vc.width = bw * VSS; _vc.height = bh * VSS;
  const g = _vg; g.setTransform(VSS, 0, 0, VSS, 0, 0); g.clearRect(0, 0, bw, bh); g.lineJoin = 'round';
  const L = '#2a2030', ox = bw * .12, oy = bh * .9, u = s;
  const P = (a, b) => [ox + a * u, oy - b * u];
  // 裤脚
  if (o.pants) { g.fillStyle = o.pants; g.strokeStyle = L; g.lineWidth = 1.2; g.beginPath(); g.moveTo(...P(.55, 2.2)); g.lineTo(...P(1.55, 2.2)); g.lineTo(...P(1.5, 1.05)); g.lineTo(...P(.5, 1.0)); g.closePath(); g.fill(); g.stroke(); }
  g.fillStyle = '#e8e2d8'; g.beginPath(); g.moveTo(...P(-.05, .22)); g.lineTo(...P(2.6, .22)); g.quadraticCurveTo(...P(2.75, .1), ...P(2.5, 0)); g.lineTo(...P(0, 0)); g.closePath(); g.fill();
  g.fillStyle = col; g.strokeStyle = L; g.lineWidth = 1.1; g.beginPath(); g.moveTo(...P(0, .22)); g.lineTo(...P(.15, 1.05)); g.quadraticCurveTo(...P(.9, 1.2), ...P(1.45, 1.0)); g.quadraticCurveTo(...P(1.9, .7), ...P(2.6, .45)); g.quadraticCurveTo(...P(2.8, .3), ...P(2.6, .22)); g.closePath(); g.fill(); g.stroke();
  g.strokeStyle = '#3266c4'; g.lineWidth = 1.4; g.beginPath(); g.moveTo(...P(.7, .3)); g.quadraticCurveTo(...P(1.3, .75), ...P(2.0, .42)); g.stroke();
  g.strokeStyle = '#9aa0b0'; g.lineWidth = .8; for (let i = 0; i < 3; i++) { g.beginPath(); g.moveTo(...P(1.2 + i * .22, .95 - i * .1)); g.lineTo(...P(1.35 + i * .22, 1.02 - i * .1)); g.stroke(); }
  const S = vpixelize(bw, bh, 'shoe'); outline(S, C(0x2a2030));
  blit(S, Math.round(x - ox), Math.round(y - oy), { flip: o.flip });
}
/* 自行车（侧面）：x 后轮着地点附近的车身中点，y 地面 */
function bike(t, x, y, f = 1, o = {}) {
  const K = C(0x2a2430), fr = C(o.col ?? 0x3a7ad8), ph = t * 8;
  const wR = 6, rx = x - 9 * f, fx = x + 10 * f, wy = y - wR;
  for (const wx of [rx, fx]) { ring(wx, wy, wR, K); ring(wx, wy, wR - 1, C(0x5a5a6a)); for (let s = 0; s < 3; s++) { const a = ph + s * TAU / 3; line(wx, wy, wx + Math.cos(a) * (wR - 1), wy + Math.sin(a) * (wR - 1), C(0x9a9aa6)); } }
  line(rx, wy, x, wy - 1, fr); line(x, wy - 1, x - 2 * f, wy - 9, fr); line(rx, wy, x - 2 * f, wy - 9, fr); line(x - 2 * f, wy - 9, fx - 3 * f, wy - 10, fr); line(fx - 3 * f, wy - 10, fx, wy, fr);
  rect(x - 4 * f - (f < 0 ? 4 : 0), wy - 11, 5, 2, K); line(fx - 3 * f, wy - 10, fx - 2 * f, wy - 13, K); rect(fx - 4 * f - (f < 0 ? 3 : 0), wy - 14, 4, 1, K);
}
