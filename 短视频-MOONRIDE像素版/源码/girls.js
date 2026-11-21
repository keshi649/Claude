// 八个像素女孩：发型、发色照原 MV 里成员的样子分开（不画真人的五官，只取发型、衣服）。
// 坐标单位：s = 半张脸宽（像素）。原点在两眼连线的中点，x 向右、y 向下。
'use strict';
const SKIN = { b: [248, 214, 196], s: [234, 178, 158], d: [206, 140, 128], h: [255, 236, 226], bl: [244, 150, 158], lip: [222, 104, 120], lipd: [176, 70, 92], lash: [52, 30, 44] };
const GIRLS = [
  { name: '黑长直', hair: ['#14111a', '#25202e', '#3a3348', '#6c6488'], style: 'straight', part: 'center', len: 2.7, eye: [70, 44, 40] },
  { name: '橘色长卷', hair: ['#80331c', '#b8582c', '#da8246', '#f6b880'], style: 'wavy', part: 'side', len: 2.9, eye: [110, 62, 44] },
  { name: '栗色波波头', hair: ['#5a3620', '#8a5634', '#b98454', '#e2b384'], style: 'bob', part: 'wisp', len: 0.15, eye: [96, 58, 44] },
  { name: '黑发齐刘海', hair: ['#110f15', '#211d27', '#342f3e', '#5a5470'], style: 'straight', part: 'bangs', len: 2.5, eye: [60, 40, 44] },
  { name: '深棕长发', hair: ['#341d15', '#543023', '#774835', '#a6745a'], style: 'wavy', part: 'center', len: 2.5, eye: [92, 56, 42] },
  { name: '蓝黑侧分', hair: ['#12151f', '#212839', '#323c56', '#5a6c94'], style: 'straight', part: 'side2', len: 2.2, eye: [62, 44, 52] },
  { name: '粉色长发', hair: ['#a3445e', '#cd6a84', '#ea97ac', '#ffd2dc'], style: 'straight', part: 'wisp', len: 2.6, eye: [104, 60, 66] },
  { name: '棕色空气刘海', hair: ['#432819', '#673f2b', '#8d5c43', '#bd8868'], style: 'wavy', part: 'wisp', len: 1.5, eye: [96, 60, 46] },
];
// 衣服：颜色组 [暗, 中, 亮]
const CLOTH = {
  white: ['#c9c3d6', '#ecebf4', '#ffffff'], pink: ['#d58aa0', '#f2b6c6', '#ffdce6'], blush: ['#d9a194', '#f3cdbf', '#ffe9df'],
  blue: ['#6f8fc8', '#9cb9ea', '#cfe0ff'], lilac: ['#8a7cc0', '#b4a6e4', '#ddd2ff'], black: ['#0d0c12', '#1d1b26', '#3a3748'],
  cream: ['#d8c6a8', '#f2e6cf', '#fffaf0'], red: ['#8f1f2c', '#c8344a', '#ee6a7c'], navy: ['#1c2340', '#2e3a66', '#4a5a92'],
  lav: ['#9a86c6', '#c4b2ea', '#e8dcff'],
};
function girl(i) { return GIRLS[((i % 8) + 8) % 8]; }
function hcol(g, k) { return C(g.hair[k]); }

// ---------- 头发、脸的形状测试 ----------
function jawW(v) { // 下巴往下的半宽
  if (v < .1) return .95;
  const q = (v - .1) / .9; if (q >= 1) return 0;
  return .95 * Math.pow(1 - Math.pow(q, 2.2), .75);
}
function faceIn(u, v, turn) {
  const sh = turn * .14 * (v + .3);
  if (v < .1) { const dx = u / .95, dy = (v + .15) / 1.05; return dx * dx + dy * dy <= 1; }
  return v <= 1 && Math.abs(u - sh) <= jawW(v);
}
function hairline(g, u, ph) { // 发际线：头发在这条线上面
  const p = g.part, a = Math.abs(u);
  if (p === 'center') return -.95 + 1.25 * Math.pow(a, 1.4);
  if (p === 'side') { const xp = .3; return u < xp ? -.95 + 1.15 * Math.pow((xp - u) / 1.25, .72) : -.95 + 2 * Math.pow((u - xp) / .65, 1.5); }
  if (p === 'side2') { const xp = -.3; return u > xp ? -.95 + 1.15 * Math.pow((u - xp) / 1.25, .72) : -.95 + 2 * Math.pow((xp - u) / .65, 1.5); }
  if (p === 'bangs') return a < .93 ? -.3 + .05 * Math.sin(u * 23) : .2;
  if (p === 'wisp') return -.78 + 1.0 * Math.pow(a, 1.6);
  return -.9;
}
function wispIn(g, u, v) { // 空气刘海：几缕细发垂到眉毛
  if (g.part !== 'wisp') return false;
  for (const x0 of [-.62, -.36, -.12, .14, .4, .63]) {
    const tip = -.16 - .08 * Math.abs(x0) + .05 * Math.sin(x0 * 9);
    if (v < tip && v > -1 && Math.abs(u - x0 - (v + .6) * .12 * Math.sign(x0 || 1)) < .085 * (1 - (v + 1) / (tip + 1) * .55)) return true;
  }
  return false;
}
// 后面的头发（脖子、肩膀后面那一大片）
function backIn(g, u, v, o) {
  const wv = o.wind || 0, ph = o.ph || 0, L = g.len * (o.lenK || 1);
  const top = (u * u) / (1.24 * 1.24) + ((v + .36) * (v + .36)) / (1.14 * 1.14) <= 1;
  if (top) return true;
  if (v < -.36) return false;
  if (g.style === 'bob') {
    const hw = 1.22 + .14 * Math.sin(Math.min(1, (v + .36) / 1.3) * Math.PI * .8);
    const end = 1.08 + .04 * Math.sin(u * 7);
    if (v > end) return false;
    const cur = v > .85 ? Math.sqrt(Math.max(0, 1 - Math.pow((v - .85) / (end - .85 + .01), 2))) : 1; // 底下往里卷
    return Math.abs(u) <= hw * (.75 + .25 * cur);
  }
  const yEnd = 1 + L;
  const sway = wv * Math.sin(ph + v * 1.3) * Math.max(0, v) * .16;
  const uu = u - sway;
  let hw = 1.2 + .1 * Math.max(0, v) + (g.style === 'wavy' ? .1 * Math.sin(v * 4.2 + ph * .3) + .1 : 0);
  if (v > yEnd - .5) hw *= Math.sqrt(Math.max(0, 1 - Math.pow((v - (yEnd - .5)) / .62, 2))) * .4 + .6;
  const jag = .16 * Math.abs(Math.sin(uu * 6.5 + 1.3));
  return v <= yEnd - jag && Math.abs(uu) <= hw;
}
// 前面的头发：头顶 + 刘海 + 脸两边垂下来的
function frontIn(g, u, v, o) {
  const cap = (u * u) / (1.13 * 1.13) + ((v + .4) * (v + .4)) / (1.08 * 1.08) <= 1;
  if (cap && v < hairline(g, u)) return true;
  if (cap && wispIn(g, u, v)) return true;
  const a = Math.abs(u), wv = o.wind || 0, ph = o.ph || 0;
  if (g.style === 'bob') {
    if (v > -.2 && v < 1.0 && a > .8 - .06 * v && a < 1.3) return v < .95 + .05 * Math.sin(u * 9) || a < 1.05;
    return false;
  }
  // 长发：脸两边各一绺，压在脸颊和肩膀前面
  if (v > -.3) {
    const len = .95 + g.len * .55 * (o.lockK === undefined ? 1 : o.lockK);
    const sway = wv * Math.sin(ph + v * 1.6 + Math.sign(u)) * Math.max(0, v) * .12;
    const aa = Math.abs(u - sway);
    const inner = .78 + .1 * Math.max(0, v - .3) - (g.style === 'wavy' ? .05 * Math.sin(v * 5 + ph * .3) : 0);
    const outer = 1.2 + .14 * Math.max(0, v) + (g.style === 'wavy' ? .08 * Math.sin(v * 4.4 + 1) : 0);
    if (o.tuck && u * o.tuck > 0) return false;   // 别到耳后的一边
    if (v < len - .12 * Math.abs(Math.sin(u * 8)) && aa > inner && aa < outer) return true;
  }
  return false;
}

// ---------- 头：后面的头发 / 脸 / 前面的头发（在当前层上画，ox,oy 是脸的原点） ----------
function headBack(g, o, s, ox, oy, turn) {
  const hc = g.hair.map(C), L = g.len * (o.lenK || 1);
  const x0 = Math.max(0, Math.floor(ox - 2.2 * s)), x1 = Math.min(T.w, Math.ceil(ox + 2.2 * s));
  const y0 = Math.max(0, Math.floor(oy - 1.7 * s)), y1 = Math.min(T.h, Math.ceil(oy + (2.2 + L) * s));
  const fq = 6.5 * Math.max(1, s / 26);
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const u = (x + .5 - ox) / s + turn * .12, v = (y + .5 - oy) / s;
    if (!backIn(g, u, v, o)) continue;
    const n = vnoise(u * fq + v * .4 * (g.style === 'wavy' ? Math.sin(v * 3) : .3), 3);
    let c = hc[1];
    if (Math.abs(u) < 1.0 && v > -.1 && !o.backView) c = hc[0];
    else if (n > .74) c = hc[2]; else if (n < .22) c = hc[0];
    if (o.backView) { const ring = -.55 + .3 * u * u; if (Math.abs(v - ring) < Math.max(.05, .9 / s) && Math.abs(u) < .9 && vnoise(u * 10, 5) > .35) c = hc[3]; }
    pp(x, y, c);
  }
}
function headFace(g, o, s, ox, oy, turn) {
  const fx = turn * .26;
  const x0 = Math.max(0, Math.floor(ox - 1.1 * s)), x1 = Math.min(T.w, Math.ceil(ox + 1.1 * s));
  const y0 = Math.max(0, Math.floor(oy - 1.3 * s)), y1 = Math.min(T.h, Math.ceil(oy + 1.05 * s));
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const u = (x + .5 - ox) / s, v = (y + .5 - oy) / s; if (!faceIn(u - turn * .05, v, turn)) continue;
    let c = SKIN.b;
    const farSide = turn !== 0 && (u - fx) * Math.sign(turn) < -.62 - .25 * (1 - Math.abs(turn));
    if (s > 5 && (frontIn(g, u, v - 2.2 / s, o) || frontIn(g, u, v - 1.2 / s, o))) c = SKIN.s;
    else if (farSide) c = SKIN.s;
    else if (s > 5 && v > .78 && Math.abs(u - turn * .12) > jawW(v) - 1.5 / s) c = SKIN.s;
    else if (s > 30 && Math.abs(u - turn * .05) > (v < .1 ? .95 * Math.sqrt(Math.max(0, 1 - ((v + .15) / 1.05) ** 2)) : jawW(v)) - 2.2 / s && u * (o.lightDir || -1) < 0) c = SKIN.s;
    pp(x, y, c);
  }
  drawFace(g, o, s, ox + fx * s, oy, turn);
}
function headFront(g, o, s, ox, oy, turn) {
  const hc = g.hair.map(C);
  const x0 = Math.max(0, Math.floor(ox - 1.9 * s)), x1 = Math.min(T.w, Math.ceil(ox + 1.9 * s));
  const y0 = Math.max(0, Math.floor(oy - 1.6 * s)), y1 = Math.min(T.h, Math.ceil(oy + (1.2 + g.len * .6) * s));
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const u = (x + .5 - ox) / s - turn * .06, v = (y + .5 - oy) / s;
    if (!frontIn(g, u, v, o)) continue;
    const e = 1.1 / s;
    const edge = !frontIn(g, u + e, v, o) || !frontIn(g, u - e, v, o) || !frontIn(g, u, v + e, o);
    const n = vnoise(u * 7 * Math.max(1, s / 26) + Math.max(0, v) * .5, 7);
    let c = hc[1];
    if (edge && faceIn(u, v + e, turn)) c = hc[0];
    else if (n > .72) c = hc[2]; else if (n < .2) c = hc[0];
    const ring = -.8 + .38 * u * u;
    const partGap = (g.part === 'center' || g.part === 'wisp') && Math.abs(u) < .07;
    if (!partGap && Math.abs(v - ring) < Math.max(.045, .9 / s) && Math.abs(u) < .8 && vnoise(u * 11 * Math.max(1, s / 30), 11) > .35) c = hc[3];
    else if (!partGap && Math.abs(v - ring - .07) < Math.max(.04, .8 / s) && Math.abs(u) < .7 && vnoise(u * 13, 12) > .55) c = hc[2];
    pp(x, y, c);
  }
  if (o.ear && s > 6) { const ec = C(o.ear === true ? '#fff6e8' : o.ear); for (const sd of [-1, 1]) if (!frontIn(g, sd * .98, .5, o) || o.tuck) rect(ox + sd * .99 * s - 1, oy + .48 * s, Math.max(1, s * .08), Math.max(2, s * .16), ec); }
  if (o.clip) { const cc = C(o.clip); const cx_ = ox + .62 * s, cy_ = oy - .62 * s; rect(cx_ - s * .15, cy_, s * .3, Math.max(1, s * .1), cc); }
}

// ---------- 半身像 ----------
// o: {turn, eyes:'open'|'closed'|'happy'|'wink'|'half'|'down', look:[dx,dy], mouth:'n'|'smile'|'open'|'o'|'grin'|'pout',
//     cloth:'strap'|'blouse'|'cami'|'off'|'puff'|'tee'|'black', col:颜色组名, wind, ph, bottom, rim:[色,dx,dy,k], amb:[色,量,模式],
//     choker, ear, necklace, bow, lenK, tuck, a, flip, dither, after(L, ox, oy) 画在人身上的东西（手、道具）}
function bust(gi, cx, cy, s, o) {
  o = o || {}; const g = typeof gi === 'object' ? gi : girl(gi);
  const turn = o.turn || 0, bottom = o.bottom || 4.4;
  const Lw = Math.ceil(5.6 * s) + 8, top = 1.7 * s + 4, Lh = Math.ceil(top + bottom * s) + 2;
  const L = layer(Lw, Lh), ox = Lw / 2, oy = top;
  const cl = (CLOTH[o.col || 'white']).map(C);
  onLayer(L, () => {
    headBack(g, o, s, ox, oy, turn);
    drawBody(o, s, ox, oy, Lw, Lh, cl);
    headFace(g, o, s, ox, oy, turn);
    headFront(g, o, s, ox, oy, turn);
    if (o.after) o.after(L, ox, oy, s);
  });
  outline(L, null, .3);
  if (o.rim) rimLight(L, o.rim[0], o.rim[1] || 1, o.rim[2] || 0, o.rim[3] || .6);
  if (o.amb) layerTint(L, o.amb[0], o.amb[1], o.amb[2]);
  comp(L, cx - ox, cy - oy, { a: o.a, flip: o.flip, dither: o.dither });
  free(L);
}

function drawBody(o, s, ox, oy, Lw, Lh, cl) {
  const X = u => ox + u * s, Y = v => oy + v * s;
  const sk = SKIN, k = o.cloth || 'strap', c0 = cl[0], c1 = cl[1], c2 = cl[2];
  // 脖子
  poly([X(-.28), Y(.55), X(.28), Y(.55), X(.3), Y(1.7), X(-.3), Y(1.7)], sk.b);
  poly([X(-.28), Y(.7), X(.28), Y(.7), X(.27), Y(1.02), X(-.27), Y(1.14)], sk.s);
  // 肩膀和胳膊：斜方肌往下斜到肩头，胳膊垂下来
  const torso = [X(-.3), Y(1.45), X(-.95), Y(1.62), X(-1.45), Y(1.82), X(-1.62), Y(2.05), X(-1.72), Y(2.6), X(-1.8), Y(6),
    X(1.8), Y(6), X(1.72), Y(2.6), X(1.62), Y(2.05), X(1.45), Y(1.82), X(.95), Y(1.62), X(.3), Y(1.45)];
  poly(torso, sk.b);
  // 胳膊和身子之间的影子
  for (const sd of [-1, 1]) { line(X(sd * 1.2), Y(2.55), X(sd * 1.25), Y(6), sk.s, 1, Math.max(1, Math.round(s / 16))); }
  // 锁骨
  line(X(-.68), Y(1.84), X(-.22), Y(1.95), sk.s); line(X(.68), Y(1.84), X(.22), Y(1.95), sk.s);
  const folds = (x0, x1, y0) => { for (let u = x0 + .25; u < x1 - .1; u += .42) for (let v = y0 + .25; v < 6; v += 1) line(X(u), Y(v), X(u + .04), Y(v + .55), c0); };
  if (k === 'strap' || k === 'cami') { // 抹胸 / 吊带：胸口一道荷叶边
    const pts = [];
    for (let u = -1.22; u <= 1.22001; u += .06) pts.push(X(u), Y(2.48 - .1 * Math.cos(u * 2.6) + .05 * Math.sin(u * 14)));
    pts.push(X(1.24), Y(6), X(-1.24), Y(6)); poly(pts, c1);
    for (let u = -1.15; u <= 1.15; u += .19) ell(X(u), Y(2.46 - .1 * Math.cos(u * 2.6)), Math.max(1, s * .08), Math.max(1, s * .055), c2);
    folds(-1.2, 1.2, 2.5);
    if (k === 'cami') for (const sd of [-1, 1]) line(X(sd * .82), Y(1.7), X(sd * .78), Y(2.42), c1, 1, Math.max(1, Math.round(s * .06)));
    if (o.bow) { const bc = C(o.bow); ell(X(-.18), Y(2.55), s * .2, s * .13, bc); ell(X(.18), Y(2.55), s * .2, s * .13, bc); circ(X(0), Y(2.56), s * .07, shade(bc, .8)); }
  } else if (k === 'blouse' || k === 'puff' || k === 'tee') { // 衬衫、泡泡袖
    const sh = [X(-.32), Y(1.5), X(-.95), Y(1.66), X(-1.48), Y(1.86), X(-1.66), Y(2.1), X(-1.78), Y(2.6), X(-1.86), Y(6),
      X(1.86), Y(6), X(1.78), Y(2.6), X(1.66), Y(2.1), X(1.48), Y(1.86), X(.95), Y(1.66), X(.32), Y(1.5), X(0), Y(1.9)];
    poly(sh, c1);
    if (k !== 'tee') for (const sd of [-1, 1]) { ell(X(sd * 1.62), Y(2.15), s * .42, s * .4, c1); ell(X(sd * 1.62), Y(2.05), s * .24, s * .16, c2); line(X(sd * 1.3), Y(2.5), X(sd * 1.9), Y(2.42), c0); }
    for (const sd of [-1, 1]) line(X(sd * 1.22), Y(2.6), X(sd * 1.26), Y(6), c0);
    for (let u = -.3; u <= .31; u += .1) circ(X(u), Y(1.58 + Math.abs(u) * .7), Math.max(1, s * .055), c2);
    line(X(0), Y(1.9), X(0), Y(6), c0); for (let v = 2.3; v < 6; v += .5) px(X(.08), Y(v), c0);
  } else if (k === 'off') { // 一字肩：荷叶边搭在胳膊上
    const pts = []; for (let u = -1.9; u <= 1.9001; u += .06) pts.push(X(u), Y(2.18 + .07 * Math.sin(u * 9)));
    pts.push(X(1.95), Y(6), X(-1.95), Y(6)); poly(pts, c1);
    for (let u = -1.82; u <= 1.82; u += .2) ell(X(u), Y(2.22), Math.max(1, s * .1), Math.max(1, s * .08), c2);
    for (const sd of [-1, 1]) line(X(sd * 1.22), Y(2.6), X(sd * 1.26), Y(6), c0);
    folds(-1.2, 1.2, 2.4);
  } else if (k === 'black') { // 黑色泡泡袖小礼服，方领
    const pts = [X(-.6), Y(1.8), X(-1.4), Y(1.82), X(-1.7), Y(2.05), X(-1.86), Y(6), X(1.86), Y(6), X(1.7), Y(2.05), X(1.4), Y(1.82), X(.6), Y(1.8), X(.6), Y(2.35), X(-.6), Y(2.35)];
    poly(pts, c1); for (const sd of [-1, 1]) { ell(X(sd * 1.6), Y(2.05), s * .48, s * .42, c1); ell(X(sd * 1.68), Y(1.94), s * .26, s * .14, c2); line(X(sd * 1.22), Y(2.6), X(sd * 1.26), Y(6), c0); }
  }
  if (o.choker) { const cc = C(o.choker === true ? '#f4f0f8' : o.choker); rect(X(-.29), Y(1.12), .58 * s, Math.max(1, s * .09), cc); if (s > 12) ell(X(0), Y(1.2), s * .11, s * .1, cc); }
  if (o.necklace) { for (let u = -.42; u <= .42; u += .07) px(X(u), Y(1.52 + .32 * (1 - (u / .42) * (u / .42))), '#fff8e0'); }
}

function drawFace(g, o, s, ox, oy, turn) {
  const X = u => ox + u * s, Y = v => oy + v * s;
  const ld = o.lightDir || -1;
  // 腮红（抖动）
  if (o.blush !== false) for (const sd of [-1, 1]) {
    const bx = X(sd * .52 + turn * .05), bw = s * .19 * (sd * turn > 0 ? .7 : 1);
    ell(bx, Y(.5), bw, Math.max(1, s * .075), mixc(SKIN.b, SKIN.bl, .55));
    if (s > 26) for (let k = -1; k <= 1; k++) line(bx + k * bw * .45, Y(.47), bx + k * bw * .45 - s * .05, Y(.54), mixc(SKIN.b, SKIN.bl, .9));
  }
  // 眉毛
  const browY = -.42 + (o.brow || 0);
  for (const sd of [-1, 1]) {
    const kk = sd * turn > 0 ? 1 - .35 * Math.abs(turn) : 1;
    const bx = X(sd * .45 * kk), bw = .3 * s * kk;
    if (s >= 9) line(bx - bw, Y(browY + .04), bx + bw, Y(browY - (sd > 0 ? .02 : .02)), mixc(g.hair[1], SKIN.s, .35), 1, s > 30 ? 2 : 1);
  }
  // 眼睛
  for (const sd of [-1, 1]) {
    const far = sd * turn > 0; const kk = far ? 1 - .38 * Math.abs(turn) : 1;
    eye(X(sd * .43 * (far ? 1 - .25 * Math.abs(turn) : 1)), Y(.02), s, kk, sd, o, g);
  }
  // 鼻子
  const ny = Y(.42);
  if (s < 9) { }
  else if (s < 26) { px(X(-ld * .07), ny, SKIN.s); if (s > 14) px(X(-ld * .07), ny - 1, SKIN.s); }
  else { const nx = X(-ld * .06 + turn * .1); line(nx, ny - .18 * s, nx - ld * .04 * s, ny, SKIN.s, 1, Math.max(1, Math.round(s / 30))); rect(nx - .05 * s, ny, .12 * s, Math.max(1, s * .03), SKIN.d); px(X(ld * .05 + turn * .1), ny - .1 * s, SKIN.h); }
  // 嘴
  mouth(X(turn * .05), Y(.7), s, o.mouth || 'n');
}
function eye(ex, ey, s, kk, sd, o, g) {
  const ew = .19 * s * kk, eh = .25 * s; const st = o.eyes || 'open';
  const lash = SKIN.lash; const ic = C(g.eye || [80, 50, 40]);
  const lw = Math.max(1, Math.round(s / 14));
  if (st === 'closed' || st === 'happy' || (st === 'wink' && sd > 0)) {
    // 闭眼：∪ 是安静地闭着，∩ 是笑眯眯
    const up = st === 'happy' ? -1 : 1; const n = Math.max(3, Math.round(ew * 2.2));
    for (let i = 0; i <= n; i++) { const t = i / n * 2 - 1; const xx = ex + t * ew * 1.1, yy = ey + up * (1 - t * t) * eh * .35 * (up < 0 ? 1 : .8) + (up < 0 ? eh * .15 : 0); rect(xx, yy, lw, lw, lash); }
    if (s > 20) { rect(ex + sd * ew * 1.15, ey - (up > 0 ? 0 : eh * .05), lw, lw, lash); }
    return;
  }
  if (s < 9) { // 很小：两个黑点
    rect(Math.round(ex - .5), Math.round(ey - 1), 1, Math.max(1, Math.round(s * .3)), lash);
    return;
  }
  const look = o.look || [0, 0], half = st === 'half' ? .35 : st === 'down' ? .5 : 0;
  const x0 = Math.floor(ex - ew * 1.3), x1 = Math.ceil(ex + ew * 1.3), y0 = Math.floor(ey - eh * 1.3), y1 = Math.ceil(ey + eh * 1.2);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
    const u = (x + .5 - ex) / ew, v = (y + .5 - ey) / eh;
    const lid = -.8 + half * 1.2 + (u * sd > .3 ? (u * sd - .3) * .25 : 0); // 上眼皮
    if (u * u + v * v * .9 > 1.05 || v < lid) continue;
    // 眼白、虹膜、瞳孔
    const iu = (u - look[0] * .35) / .78, iv = (v - .05 - look[1] * .2) / .98;
    let c = [250, 246, 250];
    if (iu * iu + iv * iv <= 1) {
      const t = sat((v + .6) / 1.5);
      c = mixc(shade(ic, .45), lit(ic, .35), t);
      if ((iu * .7) * (iu * .7) * 4 + (iv - .05) * (iv - .05) * 3.2 < .9) c = shade(ic, .25);
      if (v > .45 && Math.abs(iu) < .6) c = mixc(c, lit(ic, .55), .5);
    } else if (v > .5) c = [236, 226, 236];
    pp(x + OX, y + OY, c);
  }
  // 上睫毛（粗）+ 眼尾往外挑
  const n = Math.round(ew * 2.8);
  for (let i = 0; i <= n; i++) {
    const t = i / n * 2 - 1; const u = t * 1.08; const v = Math.max(-.8 + half * 1.2, -Math.sqrt(Math.max(0, 1.05 - u * u) / .9)) - .05;
    rect(ex + u * ew - (lw > 1 ? .5 : 0), ey + v * eh - lw + 1, lw, lw + (Math.abs(t) < .7 && s > 16 ? 1 : 0), SKIN.lash);
  }
  rect(ex + sd * ew * 1.2, ey - eh * .7, lw, lw, SKIN.lash);
  if (s > 18) rect(ex + sd * ew * 1.38, ey - eh * .88, lw, lw, SKIN.lash);
  // 下睫毛（淡）
  if (s > 14) for (let i = -2; i <= 2; i++) px(ex + i * ew * .32, ey + eh * .98, mixc(SKIN.lash, SKIN.s, .5));
  // 高光
  if (half < .4) {
    const hx = ex - .32 * ew + look[0] * ew * .25, hy = ey - .3 * eh;
    rect(hx, hy, Math.max(1, Math.round(ew * .38)), Math.max(1, Math.round(eh * .3)), '#ffffff');
    if (s > 16) rect(ex + .3 * ew, ey + .38 * eh, Math.max(1, Math.round(ew * .2)), Math.max(1, Math.round(eh * .14)), '#ffffff', .9);
  }
}
function mouth(mx, my, s, m) {
  const lip = SKIN.lip, lipd = SKIN.lipd;
  if (s < 9) { if (m === 'open' || m === 'grin') px(mx, my, lipd); return; }
  const w = Math.max(2, s * .2), t = Math.max(1, Math.round(s / 22));
  if (m === 'n') { rect(mx - w / 2, my, w, t, lip); if (s > 24) rect(mx - w / 3, my + t, w * .66, t, mixc(lip, SKIN.b, .4)); }
  else if (m === 'smile' || m === 'grin') {
    const n = Math.round(w * 1.4);
    for (let i = 0; i <= n; i++) { const tt = i / n * 2 - 1; rect(mx + tt * w * .75, my - (1 - tt * tt) * s * .06 * -1 - s * .04, t, t, m === 'grin' ? lipd : lip); }
    if (m === 'grin') { ell(mx, my + s * .03, w * .6, s * .07, lipd); rect(mx - w * .45, my - s * .01, w * .9, Math.max(1, s * .03), '#fffafa'); }
  }
  else if (m === 'open') { ell(mx, my + s * .04, w * .42, s * .1, lipd); if (s > 16) ell(mx, my + s * .09, w * .28, s * .04, [230, 120, 130]); if (s > 24) rect(mx - w * .3, my - s * .045, w * .6, Math.max(1, s * .025), '#fffafa'); }
  else if (m === 'o') { ell(mx, my + s * .03, w * .28, s * .08, lipd); }
  else if (m === 'pout') { ell(mx, my + s * .02, w * .45, s * .06, lip); rect(mx - w * .25, my + s * .01, w * .5, Math.max(1, s * .02), SKIN.h); }
}

// ---------- 侧脸 ----------
const PROF = [.55, -1.0, .82, -.62, .9, -.2, .93, -.1, .95, .06, 1.13, .38, .96, .47, .99, .56, .93, .64, .97, .7, .87, .8, .9, .92, .72, 1.03, .2, .96, -.15, .76, -.32, .2];
function profIn(u, v) {
  const dx = u + .05, dy = v + .3; if (dx * dx + dy * dy <= 1.02 * 1.02) return true;
  // 点在多边形里
  let ins = false; const n = PROF.length / 2;
  for (let i = 0, j = n - 1; i < n; j = i++) {
    const xi = PROF[i * 2], yi = PROF[i * 2 + 1], xj = PROF[j * 2], yj = PROF[j * 2 + 1];
    if ((yi > v) !== (yj > v) && u < (xj - xi) * (v - yi) / (yj - yi) + xi) ins = !ins;
  }
  return ins;
}
function profHairIn(g, u, v, o) { // 朝右的侧脸，头发区域
  const dx = u + .12, dy = v + .32, r = 1.07 + (g.style === 'wavy' ? .06 : 0);
  const inCap = dx * dx + dy * dy <= r * r;
  // 前额露出来的部分（发际线以前）
  let hl; if (v < -1.0) hl = 9; else if (v < -.1) hl = .56 - .5 * sat((v + 1.0) / .9); else hl = .04;
  if (g.part === 'bangs' && v < -.26 && v > -1.05) hl = 1.02;
  if ((g.part === 'wisp') && v < -.22 && v > -1.05 && vnoise(u * 9, 4) > .45) hl = 1.0;
  if (g.part === 'side' || g.part === 'side2') { if (v < -.35 && v > -1.05) hl = .95; }
  if (inCap && !(u > hl && profIn(u, v))) return true;
  // 垂到背后的长发
  const wv = o.wind || 0, ph = o.ph || 0;
  if (g.style === 'bob') return v > -.4 && v < 1.08 && u < .12 + .1 * Math.sin(v * 3) && u > -1.2 - .1 * v;
  const L = 1 + g.len * (o.lenK || 1);
  const sway = -wv * Math.max(0, v) * (.28 + .08 * Math.sin(ph + v * 2.2));
  const back = -1.12 - .08 * Math.max(0, v) + sway, front = .1 + sway * .3 + (g.style === 'wavy' ? .07 * Math.sin(v * 5 + ph) : 0);
  return v > -.3 && v < L - .14 * Math.abs(Math.sin(u * 7)) && u > back - .2 * Math.max(0, v - L + .6) && u < front;
}
function profHead(g, o, s, ox, oy, dir) {
  const hc = g.hair.map(C);
  const x0 = Math.max(0, Math.floor(ox - 2.4 * s)), x1 = Math.min(T.w, Math.ceil(ox + 2.4 * s));
  const y0 = Math.max(0, Math.floor(oy - 1.6 * s)), y1 = Math.min(T.h, Math.ceil(oy + (1.3 + g.len) * s));
  for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) {
    const u = (x + .5 - ox) / s * dir, v = (y + .5 - oy) / s;
    const hair = profHairIn(g, u, v, o), skin = profIn(u, v);
    if (!hair && !skin) continue;
    let c;
    if (hair) {
      const fq = Math.max(1, s / 26);
      // 发丝：头顶顺着头的弧往后梳，垂下来的部分竖着
      const ang = Math.atan2(v + .34, u + .1), rr = Math.hypot(u + .1, v + .34);
      const ang2 = Math.atan2(v + 1.05, u - .62);   // 从前额发际线往后梳
      const n = v < -.05 && rr < 1.2 ? vnoise(ang2 * 7 * fq, 9) : vnoise(u * 5.5 * fq + v * .25, 10);
      c = hc[1]; if (n > .7) c = hc[2]; else if (n < .24) c = hc[0];
      if (u < -.95 || v > 1.4) c = n > .6 ? hc[1] : hc[0];
      const rv = -.34 - Math.sqrt(Math.max(0, 1.05 * 1.05 - (u + .1) * (u + .1))) * .78;
      if (Math.abs(v - rv) < Math.max(.05, .9 / s) && u > -.7 && u < .45 && vnoise(u * 12, 3) > .3) c = hc[3];
      if (skin && u > .5) c = hc[0];
    } else {
      c = SKIN.b;
      if (u < .2 && v > .3) c = SKIN.s;
      if (profHairIn(g, u - 1.6 / s, v - 1.2 / s, o)) c = SKIN.s;
    }
    pp(x, y, c);
  }
  // 眼睛、眉、嘴、腮红
  const X = u => ox + u * s * dir, Y = v => oy + v * s;
  if (s < 7) { px(X(.62), Y(.0), SKIN.lash); }
  else {
    const lw = Math.max(1, Math.round(s / 14));
    const ex = X(.64), ey = Y(.02), eh = .26 * s;
    if (o.eyes === 'closed' || o.eyes === 'happy') { for (let i = 0; i <= 4; i++) rect(X(.5 + i * .06), Y(.06 + (o.eyes === 'happy' ? -1 : 1) * Math.sin(i / 4 * Math.PI) * .05), lw, lw, SKIN.lash); }
    else {
      const ic = C(g.eye);
      for (let yy = Math.floor(ey - eh * .6); yy < ey + eh * .7; yy++) for (let xx = Math.floor(X(.56)); xx !== Math.floor(X(.74)); xx += dir) {
        const t = sat((yy - (ey - eh * .6)) / (eh * 1.3));
        pp(xx + OX, yy + OY, mixc(shade(ic, .4), lit(ic, .3), t));
      }
      rect(Math.min(X(.48), X(.8)), ey - eh * .7, Math.abs(X(.8) - X(.48)), lw, SKIN.lash);
      rect(X(.78) - (dir < 0 ? lw : 0), ey - eh * .9, lw, lw, SKIN.lash);
      rect(X(.6), ey - eh * .35, Math.max(1, Math.round(s / 20)), Math.max(1, Math.round(s / 20)), '#ffffff');
    }
    if (!profHairIn(g, .7, -.36, o)) line(X(.55), Y(-.36), X(.84), Y(-.32), mixc(g.hair[1], SKIN.s, .3));
    rect(Math.min(X(.9), X(.97)), Y(.6), Math.max(1, s * .07), Math.max(1, s * .05), SKIN.lip);
    const bl = mixc(SKIN.b, SKIN.bl, .55); ell(X(.48), Y(.45), s * .14, s * .07, bl);
  }
}
// 侧面半身（脸朝 dir）
function profBust(gi, cx, cy, s, o) {
  o = o || {}; const g = typeof gi === 'object' ? gi : girl(gi); const dir = o.dir || 1;
  const Lw = Math.ceil(6 * s) + 8, top = 1.7 * s + 4, Lh = Math.ceil(top + (o.bottom || 4.4) * s) + 2;
  const L = layer(Lw, Lh), ox = Lw / 2, oy = top; const cl = (CLOTH[o.col || 'white']).map(C);
  onLayer(L, () => {
    const X = u => ox + u * s * dir, Y = v => oy + v * s;
    // 脖子、肩、衣服（侧面）
    poly([X(-.25), Y(.6), X(.42), Y(.85), X(.5), Y(1.8), X(-.32), Y(1.8)], SKIN.b);
    poly([X(.42), Y(.86), X(.5), Y(1.2), X(.2), Y(1.1)], SKIN.s);
    poly([X(-.5), Y(1.55), X(.35), Y(1.6), X(.8), Y(1.85), X(1.02), Y(2.3), X(1.1), Y(2.9), X(1.16), Y(6), X(-1.2), Y(6), X(-1.22), Y(2.4), X(-1.05), Y(1.8)], SKIN.b);
    ell(X(-.2), Y(2.25), s * .62, s * .55, SKIN.b); line(X(-.2), Y(2.6), X(-.25), Y(6), SKIN.s);
    const k = o.cloth || 'strap';
    if (k === 'strap' || k === 'cami' || k === 'off') { const yT = k === 'off' ? 2.1 : 2.45; poly([X(-1.3), Y(yT + .1), X(1.18), Y(yT), X(1.22), Y(6), X(-1.32), Y(6)], cl[1]); for (let u = -1.2; u < 1.2; u += .22) ell(X(u), Y(yT + .05), Math.max(1, s * .09), Math.max(1, s * .06), cl[2]); }
    else { poly([X(-.45), Y(1.5), X(.38), Y(1.62), X(.82), Y(1.88), X(1.05), Y(2.35), X(1.14), Y(2.9), X(1.2), Y(6), X(-1.24), Y(6), X(-1.26), Y(2.4), X(-1.05), Y(1.78)], cl[1]); ell(X(-.22), Y(2.15), s * .72, s * .6, cl[1]); ell(X(-.3), Y(1.95), s * .4, s * .22, cl[2]); line(X(-.6), Y(2.7), X(.2), Y(2.72), cl[0]); for (let v = 1.9; v < 6; v += .6) px(X(.85), Y(v), cl[0]); }
    profHead(g, o, s, ox, oy, dir);
    if (o.after) o.after(L, ox, oy, s);
  });
  outline(L, null, .3);
  if (o.rim) rimLight(L, o.rim[0], o.rim[1] || 1, o.rim[2] || 0, o.rim[3] || .6);
  if (o.amb) layerTint(L, o.amb[0], o.amb[1], o.amb[2]);
  comp(L, cx - ox, cy - oy, { a: o.a, dither: o.dither });
  free(L);
}

// ---------- 全身 ----------
// fig(女孩, x, 脚底 y, 身高, o)
// o.view: 'front' | 'back' | 'side'；o.dir：侧面朝哪边（1 右，-1 左）
// o.pose: {la:[上臂, 小臂], ra:[...], ll:[大腿, 小腿], rl:[...], lean, bob, sit, dx}
//   正面：角度从竖直向下算，正数往外张；侧面：正数往前
// o.top: 'strap'|'cami'|'blouse'|'puff'|'black'|'off'；o.col；o.skirt: 'short'|'mid'|'long'|'puffy'|'gown'|'pants'；o.scol
// o.legs: 'bare'|'tights'|'socks'；o.shoes: 'boots'|'mary'|'heels'；o.hold(P)：在人身上画拿着的东西（P 里有关节位置）
function fig(gi, x, footY, Hh, o) {
  o = o || {}; const g = typeof gi === 'object' ? gi : girl(gi);
  const view = o.view || 'front', dir = o.dir || 1, pose = o.pose || {};
  const mini = Hh < 44, hh = Hh / (mini ? 3.8 : 5.0), s = hh / 2.5;
  const Lw = Math.ceil(Hh * 1.25) + 12, Lh = Math.ceil(Hh * 1.4) + 8;
  const L = layer(Lw, Lh); const fx = Lw / 2 + (pose.dx || 0), fy = Lh - 4;
  const cl = (CLOTH[o.col || 'white']).map(C), sc = (CLOTH[o.scol || o.col || 'white']).map(C);
  const legL = hh * (mini ? 1.5 : 2.55), torsoL = hh * (mini ? 1.0 : 1.28);
  const sw = hh * (mini ? .5 : .56), hipW = hh * (mini ? .36 : .4);
  const sit = pose.sit;
  let hipY = fy - legL + (pose.bob || 0); if (sit) hipY = fy - legL * (view === 'side' ? .52 : .56);
  const lean = pose.lean || 0;
  const shY = hipY - torsoL, shX = fx + lean * hh * (view === 'side' ? dir : 1);
  const P = { s, hh, mini };
  const lw = (r) => Math.max(1, r);
  onLayer(L, () => {
    const skin = SKIN.b, skinS = SKIN.s;
    const legCol = o.legs === 'tights' ? C('#2a2630') : skin;
    // ---- 腿 ----
    const drawLeg = (hx, a, back) => {
      let kx, ky, ax, ay;
      if (view === 'side') {
        kx = hx + dir * Math.sin(a[0]) * legL * .5; ky = hipY + Math.cos(a[0]) * legL * .5;
        ax = kx + dir * Math.sin(a[0] - a[1]) * legL * .5; ay = ky + Math.cos(a[0] - a[1]) * legL * .5;
        if (sit) { kx = hx + dir * legL * .45; ky = hipY + hh * .05; ax = kx + dir * Math.sin(a[1] || 0) * legL * .5; ay = ky + legL * .5; }
      } else {
        const sd = hx < fx ? -1 : 1;
        if (sit) { kx = hx + sd * hh * .1; ky = hipY + hh * .32; ax = kx + sd * Math.sin(a[1] || 0) * legL * .5; ay = ky + legL * .48; }
        else { kx = hx + sd * Math.sin(a[0]) * legL * .5; ky = hipY + Math.cos(a[0]) * legL * .5; ax = kx + sd * Math.sin(a[0] + a[1]) * legL * .5; ay = ky + Math.cos(a[0] + a[1]) * legL * .5; }
      }
      const r1 = lw(hh * (mini ? .14 : .15)), r2 = lw(hh * (mini ? .11 : .11));
      const col = back ? shade(legCol, .85) : legCol;
      thick(hx, hipY, kx, ky, r1, col); thick(kx, ky, ax, ay, r2, col);
      if (o.legs === 'socks') thick(kx + (ax - kx) * .55, ky + (ay - ky) * .55, ax, ay, r2, '#f6f4fa');
      const sh = o.shoes || 'mary';
      if (sh === 'boots') { thick(kx + (ax - kx) * .15, ky + (ay - ky) * .15, ax, ay, r2 + (mini ? 0 : .6), '#16141c'); }
      const fw = view === 'side' ? hh * .32 : hh * .16;
      if (view === 'side') rect(Math.min(ax, ax + dir * fw) - (dir < 0 ? 0 : 1), ay - 1, fw + 1, lw(hh * .1), sh === 'boots' ? '#16141c' : '#1d1a22');
      else rect(ax - fw, ay - 1, fw * 2, lw(hh * .1), sh === 'boots' ? '#16141c' : '#1d1a22');
      return [ax, ay, kx, ky];
    };
    // ---- 胳膊 ----
    const ua = hh * (mini ? .72 : .92), fa = hh * (mini ? .66 : .84);
    const drawArm = (sx, sy, a, side, back) => {
      let ex, ey, hx, hy;
      if (view === 'side') { ex = sx + dir * Math.sin(a[0]) * ua; ey = sy + Math.cos(a[0]) * ua; hx = ex + dir * Math.sin(a[0] + a[1]) * fa; hy = ey + Math.cos(a[0] + a[1]) * fa; }
      else { ex = sx + side * Math.sin(a[0]) * ua; ey = sy + Math.cos(a[0]) * ua; hx = ex + side * Math.sin(a[0] + a[1]) * fa; hy = ey + Math.cos(a[0] + a[1]) * fa; }
      const r = lw(hh * (mini ? .1 : .11)); const col = back ? shade(skin, .88) : skin;
      thick(sx, sy, ex, ey, r, col); thick(ex, ey, hx, hy, r, col);
      if (o.top === 'blouse' || o.top === 'puff' || o.top === 'black') { const scl = o.top === 'black' ? cl : cl; thick(sx, sy, sx + (ex - sx) * .7, sy + (ey - sy) * .7, r + (o.top === 'puff' || o.top === 'black' ? 1.2 : .4), back ? shade(scl[1], .85) : scl[1]); if (o.top === 'blouse') thick(ex, ey, hx - (hx - ex) * .15, hy - (hy - ey) * .15, r + .3, back ? shade(scl[1], .85) : scl[1]); }
      circ(hx, hy, lw(r * 1.05), col);
      return [hx, hy, ex, ey];
    };
    const la = pose.la || [.12, 0], ra = pose.ra || [.12, 0], ll = pose.ll || [.04, 0], rl = pose.rl || [.04, 0];
    // 顺序：（背面时头发最后盖上）后面的头发 → 后面的胳膊 → 腿 → 裙子 → 身子 → 前面的胳膊 → 头
    const faceY = shY - 1.62 * s, faceX = shX + (view === 'side' ? dir * hh * .06 : 0);
    if (view === 'front') headBack(g, o, s, faceX, faceY, o.turn || 0);
    if (view === 'side') {
      P.hb = drawArm(shX, shY + hh * .12, la, 0, true);
      P.fb = drawLeg(fx - dir * hh * .06, ll, true);
      P.ff = drawLeg(fx + dir * hh * .06, rl, false);
    } else {
      P.fl = drawLeg(fx - hipW * .5, ll, false); P.fr = drawLeg(fx + hipW * .5, rl, false);
    }
    // ---- 裙子 ----
    const waistY = hipY - hh * .32, sk = o.skirt || 'mid';
    if (sk !== 'pants') {
      const len = { short: .55, mid: .95, long: 1.55, puffy: .7, gown: legL / hh + .05 }[sk] * hh * (sit ? .7 : 1);
      const hemY = hipY + len, hw0 = hipW * .82, hw1 = hipW * ({ short: 1.45, mid: 1.6, long: 1.7, puffy: 2.0, gown: 2.1 }[sk]) * (sit ? 1.2 : 1);
      const sw_ = (o.sway || 0) * hh * .25;
      const pts = [];
      if (view === 'side' && sit) { const kx = fx + dir * legL * .45, ky = hipY + hh * .05;
        pts.push(fx - dir * hipW, waistY, fx + dir * hh * .3, waistY, kx + dir * hh * .2, ky - hh * .22, kx + dir * hh * .26, ky + hh * .3, fx - dir * hipW * 1.05, hipY + hh * .28); }
      else if (view === 'side') { pts.push(fx - hw0 * .9, waistY, fx + hw0 * .9, waistY, fx + dir * hw1 * .6 + hw1 * .35 + sw_, hemY, fx - hw1 * .8 + sw_, hemY); }
      else {
        pts.push(fx - hw0, waistY, fx + hw0, waistY);
        if (sk === 'puffy') { for (let k = 0; k <= 8; k++) { const a = k / 8 * Math.PI; pts.push(fx + Math.cos(a) * hw1 + sw_, hemY - Math.sin(a) * len * .25 * 0 + (k % 2 ? 1 : 0)); } }
        else { pts.push(fx + hw1 + sw_, hemY, fx + hw1 * .5 + sw_, hemY + 1, fx + sw_, hemY, fx - hw1 * .5 + sw_, hemY + 1, fx - hw1 + sw_, hemY); }
      }
      poly(pts, sc[1]);
      for (let k = -2; k <= 2; k++) if (!mini || k % 2 === 0) line(fx + k * hw0 * .4, waistY + 2, fx + k * hw1 * .42 + sw_, hemY - 1, sc[0]);
      if (!mini) line(fx - hw1 + 1 + sw_, hemY - 1, fx + hw1 - 1 + sw_, hemY - 1, sc[2]);
    } else { // 裤装：两条腿就是裤子
    }
    // ---- 身子 ----
    const top = o.top || 'strap';
    const tpts = view === 'side'
      ? [shX - hh * .28, shY, shX + hh * .3, shY + hh * .04, fx + hh * .3 * dir, waistY, fx - hh * .26 * dir, waistY]
      : [shX - sw, shY + hh * .04, shX + sw, shY + hh * .04, shX + sw * .92, shY + hh * .3, fx + hipW * .78, waistY, fx + hipW * .8, hipY - hh * .05, fx - hipW * .8, hipY - hh * .05, fx - hipW * .78, waistY, shX - sw * .92, shY + hh * .3];
    poly(tpts, skin);
    const neckW = Math.max(1, s * .3);
    rect(faceX - neckW, faceY + .6 * s, neckW * 2, shY - faceY - .6 * s + 2, skin);
    if (top === 'strap' || top === 'cami' || top === 'off') {
      const yT = shY + hh * (top === 'off' ? .12 : .3);
      const cpts = view === 'side'
        ? [shX - hh * .3, yT, shX + hh * .32, yT, fx + hh * .32 * dir, waistY + 1, fx - hh * .28 * dir, waistY + 1]
        : [shX - sw * (top === 'off' ? 1.08 : .9), yT, shX + sw * (top === 'off' ? 1.08 : .9), yT, fx + hipW * .8, waistY + 1, fx - hipW * .8, waistY + 1];
      poly(cpts, cl[1]); if (!mini) line(cpts[0], yT, cpts[2], yT, cl[2]);
    } else {
      poly(tpts, cl[1]);
      if (top === 'black' || top === 'puff') for (const sd of [-1, 1]) if (view !== 'side') ell(shX + sd * sw * .95, shY + hh * .1, hh * .2, hh * .16, cl[1]);
    }
    if (o.bow && !mini) { const bc = C(o.bow); ell(fx - hh * .12, waistY - hh * .02, hh * .14, hh * .09, bc); ell(fx + hh * .12, waistY - hh * .02, hh * .14, hh * .09, bc); }
    // ---- 胳膊 ----
    if (view === 'side') P.hf = drawArm(shX, shY + hh * .12, ra, 0, false);
    else { P.hl = drawArm(shX - sw * .95, shY + hh * .1, la, -1, false); P.hr = drawArm(shX + sw * .95, shY + hh * .1, ra, 1, false); }
    // ---- 头 ----
    if (view === 'front') { headFace(g, o, s, faceX, faceY, o.turn || 0); headFront(g, o, s, faceX, faceY, o.turn || 0); }
    else if (view === 'back') headBack(g, Object.assign({ backView: true }, o), s, faceX, faceY, 0);
    else profHead(g, o, s, faceX, faceY, dir);
    P.face = [faceX, faceY]; P.sh = [shX, shY]; P.hip = [fx, hipY]; P.ox = x - Lw / 2; P.oy = footY - fy;
    if (o.hold) o.hold(P);
  });
  outline(L, o.olc || null, .3);
  if (o.rim) rimLight(L, o.rim[0], o.rim[1] || 1, o.rim[2] || 0, o.rim[3] || .6);
  if (o.amb) layerTint(L, o.amb[0], o.amb[1], o.amb[2]);
  comp(L, x - Lw / 2, footY - fy, { a: o.a, flip: o.flip, dither: o.dither });
  free(L);
  return P;
}
// 常用姿势
const POSE = {
  stand: () => ({}),
  walk: (ph, k) => { k = k || 1; const a = Math.sin(ph) * .45 * k; return { la: [-a * .8, .2], ra: [a * .8, .2], ll: [a, Math.max(0, -Math.sin(ph)) * .5], rl: [-a, Math.max(0, Math.sin(ph)) * .5], bob: -Math.abs(Math.cos(ph)) * 1.2 }; },
  walkF: (ph) => { const a = Math.sin(ph); return { la: [.15 + a * .08, .3], ra: [.15 - a * .08, .3], ll: [.02, a > 0 ? a * .3 : 0], rl: [.02, a < 0 ? -a * .3 : 0], bob: -Math.abs(a) * 1.2 }; },
  wave: (t) => ({ la: [.12, 0], ra: [2.6, .5 + Math.sin(t * 9) * .35] }),
  cheer: (t) => ({ la: [2.7 + Math.sin(t * 8) * .15, .3], ra: [2.7 - Math.sin(t * 8) * .15, .3], bob: -Math.abs(Math.sin(t * 8)) * 1.5 }),
  hips: () => ({ la: [.55, -1.4], ra: [.55, -1.4] }),
  chest: () => ({ la: [.25, -2.2], ra: [.25, -2.2] }),
  mouth: () => ({ la: [.2, -2.75], ra: [.2, -2.75] }),
  sit: () => ({ sit: true, la: [.25, -.6], ra: [.25, -.6], ll: [0, .05], rl: [0, -.05] }),
  // 舞步：按拍子换 8 个定格，中间用很快的过渡
  dance: (t, seed) => {
    const b = beatN(t), k = Math.floor(b) + (seed || 0), f = smooth((b - Math.floor(b)) * 3);
    const P8 = [
      { la: [.3, -.4], ra: [1.4, .2], ll: [.05, 0], rl: [.25, .1], lean: -.15, bob: 0 },
      { la: [1.4, -.2], ra: [.3, -.4], ll: [.25, .1], rl: [.05, 0], lean: .15, bob: -1 },
      { la: [2.6, .3], ra: [.4, -.2], ll: [.1, 0], rl: [.1, 0], bob: -2 },
      { la: [.6, -1.6], ra: [.6, -1.6], ll: [.15, .2], rl: [.02, 0], bob: 0 },
      { la: [2.4, .6], ra: [2.4, .6], ll: [.18, 0], rl: [.18, 0], bob: -1 },
      { la: [.2, -2.4], ra: [1.2, -.6], ll: [.05, 0], rl: [.3, .2], lean: .1, bob: 0 },
      { la: [1.1, .1], ra: [1.1, .1], ll: [.3, 0], rl: [.3, 0], bob: 1 },
      { la: [.35, -2.6], ra: [.35, -2.6], ll: [.08, 0], rl: [.08, 0], bob: -1 },
    ];
    const A = P8[((k % 8) + 8) % 8], B = P8[(((k + 1) % 8) + 8) % 8];
    const m = (p, q) => p.map((v, i) => lerp(v, q[i], f * .25));
    return { la: m(A.la, B.la), ra: m(A.ra, B.ra), ll: m(A.ll, B.ll), rl: m(A.rl, B.rl), lean: lerp(A.lean || 0, B.lean || 0, f * .25), bob: A.bob };
  },
};
