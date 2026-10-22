'use strict';
/* monster.js：像素小怪（用户给的 12×8 方块模型）和它们的古风行头。
   原图方块网格（12×8）：
     ..oooooooo..
     ..o#oooo#o..
     oooooooooooo
     oooooooooooo
     ..oooooooo..
     ..oooooooo..
     ..o.o..o.o..
     ..o.o..o.o..
   这里每个方块画成 2×2 个"单位"，一个单位是 k 个缓冲像素：身体 16×12 单位（x 4~20，y 0~12），手臂在两侧 y 4~8，
   四条腿 y 12~16。行头（发髻、步摇、书生巾、乌纱帽、大红花、凤冠……）都画在原有轮廓的外面或上面，不改身体的形状。
   小情郎就是原来橙色的那只（#CB7C5E），小娘子是粉色的。 */

const MON = {
  lang: '#CB7C5E',     // 小情郎：原图的颜色
  niang: '#EE8DA6',    // 小娘子
  eye: '#171312',
  hair: '#2A1B2C', white: '#EEEBF4', gold: '#F2C14E', goldD: '#B8862A', red: '#E0243C', redD: '#A3142A',
  sleeve: '#D8263E', hat: '#211D33', hatL: '#3B3560', collar: '#FBF3E4', blush: '#FF7E9C',
};
const CROWD_COLS = ['#6E9BD6', '#68BC8A', '#A88BD8', '#DDB04F', '#55B7B5', '#A3A9B4', '#E39B5B', '#8FC1E3', '#C98BB9', '#9BC46A'];

const _MON = new Map();
/* o 的选项：
   col 身体颜色；eyes: n l r up dn blink happy closed heart wide sad；mouth: smile o；blush；tear
   arms: n up upL upR dn ；legs: 0 1 2
   girl（发髻、步摇、红袖、襦裙）；sway（步摇吊坠 -1/0/1）；scholar（书生巾、腰带、玉佩）；zhuang（乌纱帽、大红花、红绸）
   bride（凤冠、霞帔）；old（白头发；小情郎是白眉白胡子）；snow（头顶落雪）；hat（路人：straw 斗笠、cap 小帽、bun 发髻、kid 双丫髻、guard 兵帽）
   ol（描边颜色，默认深紫；false 不描）*/
function monPB(o = {}, k = 1) {
  const key = k + '|' + JSON.stringify(o);
  let rec = _MON.get(key);
  if (rec) return rec;
  const pb = new PB(42 * k, 28 * k), ox = 9 * k, oy = 11 * k;
  const u = (x, y, w, h, c) => pb.rect(ox + x * k, oy + y * k, w * k, h * k, c);
  const p = (x, y, c) => pb.px(ox + x, oy + y, c);   // 精细像素（缓冲像素，不是单位）
  const B = o.col || MON.lang, BD = hexOf(shadeC(B, .84)), BL = hexOf(shadeC(B, 1.12));
  const old = !!o.old, girl = !!(o.girl || o.bride);
  const HC = old ? MON.white : MON.hair;

  // ---- 身后的东西 ----
  if (o.scholar && !o.zhuang && !old) {   // 书生巾的两条飘带，从帽子后面垂下来
    const s = o.sway || 0;
    u(3, -1, 2, 1, MON.hat); u(2 + (s < 0 ? -1 : 0), 0, 2, 2, MON.hat); u(1 + s, 2, 2, 1, MON.hat);
    u(19, -1, 2, 1, MON.hat); u(20 + (s > 0 ? 1 : 0), 0, 2, 2, MON.hat); u(21 + s, 2, 2, 1, MON.hat);
  }

  // ---- 身体 ----
  u(4, 0, 16, 12, B);
  u(4, 11, 16, 1, BD);
  if (k >= 2) { u(4, 0, 1, 11, BL); }                 // 左边一条亮边，显得有点体积
  // 手臂
  const arms = o.arms || 'n';
  const AL = arms === 'up' || arms === 'upL' ? 'up' : arms === 'dn' ? 'dn' : 'n';
  const AR = arms === 'up' || arms === 'upR' ? 'up' : arms === 'dn' ? 'dn' : 'n';
  const AC = girl ? MON.sleeve : B, cuff = girl ? '#F6D2D8' : null;
  const arm = (side, pose) => {
    const x = side < 0 ? 0 : 20;
    if (pose === 'up') {   // 举起的手臂：从身体侧面伸出再朝上（L 形）
      const xi = side < 0 ? 2 : 20, xo = side < 0 ? 0 : 22;
      u(xi, 4, 2, 2, AC); u(xo, -1, 2, 7, AC); if (cuff) u(xo, -1, 2, 1, cuff);
    } else {
      const y = pose === 'dn' ? 6 : 4;
      u(x, y, 4, 4, AC); if (cuff) u(x, y + 3, 4, 1, cuff);
    }
  };
  arm(-1, AL); arm(1, AR);
  // 腿：legs=1 抬起左边一对，legs=2 抬起右边一对
  const legs = o.legs || 0;
  [[4, 1], [8, 2], [14, 1], [18, 2]].forEach(([x, grp]) => u(x, 12, 2, legs === grp ? 3 : 4, BD));

  // ---- 衣服 ----
  if (girl && !o.bride) {   // 襦裙：下半身一圈浅粉的裙子，腰上一条红带子打个结
    u(4, 8, 16, 4, '#FBE3E8'); u(4, 11, 16, 1, '#EFC3CE'); u(4, 8, 16, 1, '#C81E3A'); u(11, 8, 2, 3, '#C81E3A'); u(10, 10, 1, 1, '#C81E3A'); u(13, 10, 1, 1, '#C81E3A');
  }
  if (o.scholar && !o.zhuang) {   // 书生：腰带 + 垂下来的一块玉佩
    u(4, 8, 16, 1, '#3A5A8C'); u(13, 9, 1, 1, '#3A5A8C'); u(12, 10, 3, 2, '#9ED8C0'); u(13, 10, 1, 1, '#E8FFF6');
  }
  if (o.bride) {   // 霞帔：红披肩、金边
    u(4, 6, 16, 6, '#C8102E'); u(4, 6, 16, 1, MON.gold); u(11, 6, 2, 6, MON.gold); u(4, 11, 16, 1, '#8E0B22');
    for (let i = 0; i < 4; i++) u(5 + i * 4, 9, 1, 1, MON.gold);
  }
  if (o.zhuang) {   // 红绸斜挎 + 胸前大红花
    for (let i = 0; i <= 16; i++) u(4 + i, 4 + Math.round(i * 6 / 16), 1, 2, MON.red);
    u(10, 6, 5, 5, MON.red); u(9, 7, 7, 3, MON.red); u(11, 5, 3, 1, MON.red); u(11, 11, 3, 1, MON.red);
    u(10, 7, 1, 1, MON.redD); u(14, 9, 1, 1, MON.redD); u(12, 6, 1, 1, MON.redD); u(11, 10, 1, 1, MON.redD);
    u(12, 8, 1, 1, MON.gold);
    if (k >= 2) { p(12 * k, 8 * k, '#FFF1B8'); }
  }

  // ---- 头上的东西 ----
  if (girl) {
    // 刘海和鬓角
    u(4, 0, 16, 1, HC); u(4, 1, 1, 2, HC); u(19, 1, 1, 2, HC);
    // 发髻：一个高髻
    u(7, -1, 10, 1, HC); u(8, -2, 8, 1, HC); u(9, -5, 6, 3, HC); u(10, -6, 4, 1, HC);
    u(10, -5, 1, 1, hexOf(shadeC(HC, old ? .9 : 1.6)));
    if (!o.bride) {
      // 步摇：金簪斜插，吊坠跟着摆
      const s = o.sway || 0;
      u(15, -4, 1, 1, MON.gold); u(16, -5, 1, 1, MON.gold); u(17, -6, 1, 1, MON.gold);
      u(17, -8, 2, 2, MON.gold); u(18, -9, 1, 1, MON.red);
      u(19 + s, -7, 1, 1, MON.goldD); u(19 + s, -6, 1, 1, MON.gold); u(19 + s, -5, 1, 1, MON.red);
      // 鬓边一朵红花
      const fl = old ? '#E7A3B4' : MON.red;
      u(6, -4, 2, 1, fl); u(5, -3, 4, 2, fl); u(6, -1, 2, 1, fl); u(6, -3, 2, 2, '#FFD34E');
    } else {
      // 凤冠：金冠、红珠、两边垂珠
      u(8, -7, 8, 3, MON.gold); u(7, -5, 10, 1, MON.gold); u(9, -8, 1, 1, MON.red); u(11, -9, 2, 1, MON.red); u(14, -8, 1, 1, MON.red);
      u(10, -6, 1, 1, MON.redD); u(13, -6, 1, 1, MON.redD);
      u(6, -4, 1, 4, '#FFF3C9'); u(17, -4, 1, 4, '#FFF3C9');
    }
  }
  if (o.scholar && !o.zhuang && !old) {   // 书生巾（方巾）
    u(5, -3, 14, 3, MON.hat); u(6, -4, 12, 1, MON.hat); u(11, -4, 2, 3, MON.hatL); u(5, -1, 14, 1, MON.hatL);
  }
  if (o.zhuang) {   // 乌纱帽（展脚幞头）+ 宫花
    u(7, -5, 10, 5, MON.hat); u(8, -6, 8, 1, MON.hat); u(7, -1, 10, 1, MON.hatL); u(11, -4, 2, 2, MON.gold);
    u(-6, -3, 13, 1, MON.hat); u(17, -3, 13, 1, MON.hat); u(-7, -4, 2, 3, MON.hat); u(29, -4, 2, 3, MON.hat);
    u(5, -8, 2, 2, MON.gold); u(5, -9, 1, 1, MON.red); u(17, -8, 2, 2, MON.gold); u(18, -9, 1, 1, MON.red);
    u(6, -6, 1, 2, '#3F8A4A'); u(17, -6, 1, 2, '#3F8A4A');
  }
  if (old && !girl) {   // 老了的小情郎：白发髻、长寿眉、白胡子
    u(10, -2, 4, 2, MON.white); u(9, -1, 6, 1, MON.white);
    u(4, 1, 5, 1, MON.white); u(15, 1, 5, 1, MON.white); u(4, 2, 1, 1, MON.white); u(19, 2, 1, 1, MON.white);
    u(9, 6, 6, 3, MON.white); u(10, 9, 4, 1, MON.white); u(11, 10, 2, 1, MON.white);
  }
  // 路人的帽子
  const hat = o.hat;
  if (hat === 'straw') { u(1, -1, 22, 1, '#D9B45A'); u(4, -2, 16, 1, '#D9B45A'); u(7, -3, 10, 1, '#C9A04A'); u(10, -4, 4, 1, '#C9A04A'); u(1, -1, 22, 1, '#B8913F'); u(3, -1, 18, 1, '#D9B45A'); }
  else if (hat === 'cap') { u(5, -2, 14, 2, '#3A3450'); u(6, -3, 12, 1, '#3A3450'); }
  else if (hat === 'bun') { u(4, 0, 16, 1, MON.hair); u(9, -3, 6, 3, MON.hair); u(10, -4, 4, 1, MON.hair); u(14, -3, 1, 1, MON.gold); }
  else if (hat === 'kid') { u(4, 0, 16, 1, MON.hair); u(4, -3, 4, 3, MON.hair); u(16, -3, 4, 3, MON.hair); u(5, -1, 2, 1, MON.red); u(17, -1, 2, 1, MON.red); }
  else if (hat === 'guard') { u(5, -3, 14, 3, '#5A2A22'); u(4, -1, 16, 1, '#3A1A16'); u(11, -5, 2, 2, MON.red); }

  // ---- 脸 ----
  const E = MON.eye, ev = o.eyes || 'n';
  const E2 = (x, y, w, h, c = E) => { u(x, y, w, h, c); u(x + 10, y, w, h, c); };
  const hi = (x, y) => { if (k >= 2) { p(x * k, y * k, '#FFFFFF'); p((x + 10) * k, y * k, '#FFFFFF'); } };
  if (ev === 'n') { E2(6, 2, 2, 2); hi(6, 2); }
  else if (ev === 'l') { E2(5, 2, 2, 2); hi(5, 2); }
  else if (ev === 'r') { E2(7, 2, 2, 2); hi(7, 2); }
  else if (ev === 'up') { E2(6, 1, 2, 2); hi(6, 1); }
  else if (ev === 'dn') E2(6, 3, 2, 2);
  else if (ev === 'blink') E2(6, 3, 2, 1);
  else if (ev === 'happy') { E2(5, 3, 1, 1); E2(6, 2, 2, 1); E2(8, 3, 1, 1); }       // ^ ^
  else if (ev === 'closed') { E2(5, 2, 1, 1); E2(6, 3, 2, 1); E2(8, 2, 1, 1); }      // ∪ ∪（安心地闭眼）
  else if (ev === 'wide') { E2(6, 1, 2, 3); hi(6, 1); }
  else if (ev === 'sad') { E2(6, 2, 2, 2); E2(5, 1, 2, 1, BD); hi(6, 2); }
  else if (ev === 'heart') {
    const R = '#FF3D68';
    E2(5, 2, 1, 1, R); E2(7, 2, 1, 1, R); E2(5, 3, 3, 1, R); E2(6, 4, 1, 1, R); E2(6, 2, 1, 1, '#FF8FA8');
  }
  if (o.tear) u(7, 4, 1, 2, '#8FD3FF');
  if (o.blush || girl) { const bc = MON.blush; u(4, 5, 2, 1, bc); u(18, 5, 2, 1, bc); }
  if (o.mouth === 'smile') { u(10, 7, 4, 1, '#5A1E2A'); u(9, 6, 1, 1, '#5A1E2A'); u(14, 6, 1, 1, '#5A1E2A'); }
  else if (o.mouth === 'o') u(11, 6, 2, 2, '#5A1E2A');
  else if (o.mouth === 'w') { u(10, 6, 1, 1, '#5A1E2A'); u(11, 7, 1, 1, '#5A1E2A'); u(12, 6, 1, 1, '#5A1E2A'); u(13, 7, 1, 1, '#5A1E2A'); u(14, 6, 1, 1, '#5A1E2A'); }

  // ---- 头顶落雪：每一列最上面的像素刷白 ----
  if (o.snow) {
    const sn = C('#F7F9FF'), sd = C('#C9D3EC');
    for (let x = 0; x < pb.w; x++) for (let y = 0; y < pb.h; y++) {
      if (pb.d[y * pb.w + x]) {
        const th = Math.max(1, Math.round(k * (1.2 + .8 * h2(x >> 1, 7))));
        for (let j = 0; j < th; j++) if (pb.get(x, y + j)) pb.d[(y + j) * pb.w + x] = j === th - 1 ? sd : sn;
        break;
      }
    }
  }
  // ---- 描边 ----
  if (o.ol !== false) {
    const olc = C(o.ol || '#1E1226'), src = pb.d.slice(), w = pb.w, h = pb.h;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (src[y * w + x]) continue;
      if ((x > 0 && src[y * w + x - 1]) || (x < w - 1 && src[y * w + x + 1]) || (y > 0 && src[(y - 1) * w + x]) || (y < h - 1 && src[(y + 1) * w + x])) pb.d[y * w + x] = olc;
    }
  }
  rec = { pb, ax: ox + 12 * k, ay: oy + 16 * k, k, ox, oy };
  _MON.set(key, rec);
  return rec;
}
/* 把小怪画到缓冲上：(x, y) 是脚底中间 */
function mon(g, x, y, o = {}, k = 1, bo = {}) {
  const r = monPB(o, k);
  g.blit(r.pb, Math.round(x) - r.ax, Math.round(y) - r.ay, bo);
  return r;
}
/* 身体上某个单位坐标在缓冲里的位置（拿东西、挂飘带用） */
function monPt(x, y, ux, uy, k = 1) { return [Math.round(x) + (ux - 12) * k, Math.round(y) + (uy - 16) * k]; }
/* 眨眼：每个角色按自己的种子，大约 3 秒眨一次 */
function blinkAt(t, seed = 0) { const p = (t + hash(seed) * 3.1) % 3.1; return p < .12; }
/* 步摇吊坠的摆动 */
function swayAt(t, seed = 0) { const v = Math.sin(t * 5.2 + seed); return v > .45 ? 1 : v < -.45 ? -1 : 0; }

/* ---------------- 小怪拿的东西、身上的动态部件 ---------------- */
function cup(g, x, y, k = 1, col = '#E8E2D0') {   // 酒杯：杯口在 (x, y)
  g.rect(x - 2 * k, y, 4 * k, k, col); g.rect(x - 1.5 * k, y + k, 3 * k, k, col); g.rect(x - .5 * k, y + 2 * k, k, k, col); g.rect(x - 1.5 * k, y + 3 * k, 3 * k, Math.max(1, k * .5), col);
}
/* 披帛 / 水袖：从 (x, y) 拖出去的一条飘动的带子，pts 是沿着带子的点 */
function ribbon(g, pts, col, w = 2, lv = 1) {
  for (let i = 0; i + 1 < pts.length; i++) {
    const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
    const n = Math.max(1, Math.ceil(Math.hypot(x1 - x0, y1 - y0)));
    for (let s = 0; s <= n; s++) {
      const x = x0 + (x1 - x0) * s / n, y = y0 + (y1 - y0) * s / n, ww = Math.max(1, Math.round(w * (1 - .55 * (i + s / n) / pts.length)));
      if (lv >= 1) g.rect(Math.round(x - ww / 2), Math.round(y - ww / 2), ww, ww, col); else g.rectD(Math.round(x - ww / 2), Math.round(y - ww / 2), ww, ww, col, lv);
    }
  }
}
function wave(x, y, len, ang, t, amp = 3, n = 10, ph = 0) {   // 一条在风里飘的线的点
  const out = [];
  for (let i = 0; i <= n; i++) {
    const f = i / n, d = f * len, wv = Math.sin(t * 6 + ph - f * 4.5) * amp * f;
    out.push([x + Math.cos(ang) * d - Math.sin(ang) * wv, y + Math.sin(ang) * d + Math.cos(ang) * wv]);
  }
  return out;
}
/* 爱心（像素） */
const HEART = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
function heart(g, x, y, k = 1, col = '#FF3D68', hl = '#FFB3C6') {
  HEART.forEach((r, j) => { for (let i = 0; i < r.length; i++) if (r[i] === '#') g.rect(x + (i - 3) * k, y + (j - 3) * k, k, k, col); });
  g.rect(x - 2 * k, y - 2 * k, k, k, hl);
}
/* 字符画 → PB（调色板：字符 → 颜色；'.' 透明） */
function art(rows, pal) {
  const w = Math.max(...rows.map(r => r.length)), h = rows.length, pb = new PB(w, h);
  rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const c = pal[r[i]]; if (c) pb.d[j * w + i] = C(c); } });
  return pb;
}
const _ART = {};
function artc(name, rows, pal) { return _ART[name] || (_ART[name] = art(rows, pal)); }
