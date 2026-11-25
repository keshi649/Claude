'use strict';
/* sprites.js：像素角色和道具。
   两个主角都是甜菜之前视频里的像素小怪（用户给的 12×8 方块图，每个方块画成 2×2 个像素，整只 24×16）：
     ..oooooooo..
     ..o#oooo#o..
     oooooooooooo
     oooooooooooo
     ..oooooooo..
     ..oooooooo..
     ..o.o..o.o..
     ..o.o..o.o..
   "他"是原色 #CB7C5E；"她"是粉色，头上别一朵小白花。造型不改，只加表情、手臂姿势、坐、围巾、老了以后的眼镜和发髻。 */
const MON = { he: '#CB7C5E', she: '#E58BAA' };
const EYE = '#171312';
const MOX = 10, MOY = 10, MCW = 46, MCH = 32;    // 身体左上角在精灵画布里的位置（四周留出手臂、花、发髻的地方）
const MON_CACHE = {};
/* o：{who 'he'|'she', eyes, armL, armR, legs, sit, back, blush, tear, old, scarf, lean, flower(默认她有)}
   eyes：n l r up dn shut happy wide sad heart
   armL/armR：n up hi dn reach hold hug wipe
   legs：0 站，1/2 走路的两帧；sit 坐着（腿只露出一小截）；lean：-1/1 头往一边歪一个像素（靠在肩上） */
function monster(o = {}) {
  const key = JSON.stringify(o);
  if (MON_CACHE[key]) return MON_CACHE[key];
  const c = mk(MCW, MCH), g = c.getContext('2d');
  const who = o.who || 'he';
  let base = o.col || MON[who];
  if (o.old) base = mix(base, who === 'he' ? '#B8A898' : '#D0BCC4', .32);
  const body = o.back ? shade(base, .86) : base;
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(MOX + x, MOY + y, w, h); };
  P(4, 0, 16, 12, body);
  const legs = o.legs || 0;
  if (o.sit) [[4], [8], [14], [18]].forEach(([x]) => P(x, 12, 2, 2, shade(body, .9)));
  else [[4, 1], [8, 2], [14, 1], [18, 2]].forEach(([x, grp]) => P(x, 12, 2, legs === grp ? 3 : 4, body));
  const arm = (side, pose) => {
    const col = body, X = side < 0 ? 0 : 20;
    if (pose === 'up') P(X, 0, 4, 4, col);
    else if (pose === 'hi') { P(X, -5, 4, 4, col); P(side < 0 ? 2 : 20, -1, 2, 5, col); }
    else if (pose === 'dn') P(X, 8, 4, 3, col);
    else if (pose === 'reach') P(side < 0 ? -4 : 20, 4, 8, 4, col);
    else if (pose === 'hold') P(side < 0 ? -5 : 20, 6, 9, 3, col);           // 往旁边伸、低一点（牵手）
    else if (pose === 'hug') P(side < 0 ? -7 : 20, 3, 11, 4, col);           // 往旁边伸得更长（抱住对方）
    else if (pose === 'front') P(side < 0 ? 3 : 17, 6, 4, 3, shade(col, .92)); // 收到身前（捧着东西）
    else if (pose === 'wipe') { P(X, 2, 4, 4, col); if (side > 0) P(14, 1, 7, 4, shade(col, .9)); else P(3, 1, 7, 4, shade(col, .9)); }
    else P(X, 4, 4, 4, col);
  };
  arm(-1, o.armL || 'n'); arm(1, o.armR || 'n');
  if (!o.back) {
    const ev = o.eyes || 'n';
    const E2 = (x, y, w, h, col = EYE) => { P(x, y, w, h, col); P(x + 10, y, w, h, col); };
    if (ev === 'n') E2(6, 2, 2, 2);
    else if (ev === 'l') E2(5, 2, 2, 2);
    else if (ev === 'r') E2(7, 2, 2, 2);
    else if (ev === 'up') E2(6, 1, 2, 2);
    else if (ev === 'dn') E2(6, 3, 2, 2);
    else if (ev === 'shut') E2(6, 3, 2, 1);
    else if (ev === 'wide') E2(6, 1, 2, 3);
    else if (ev === 'happy') { E2(5, 3, 1, 1); E2(6, 2, 2, 1); E2(8, 3, 1, 1); }
    else if (ev === 'sad') { P(6, 3, 2, 1, EYE); P(7, 2, 1, 1, EYE); P(16, 3, 2, 1, EYE); P(16, 2, 1, 1, EYE); }
    else if (ev === 'heart') { const hc = '#FF4D6D'; for (const ex of [5, 15]) { P(ex, 1, 1, 1, hc); P(ex + 2, 1, 1, 1, hc); P(ex, 2, 3, 1, hc); P(ex + 1, 3, 1, 1, hc); } }
    if (o.glint && ['n', 'r', 'l', 'up', 'wide'].includes(ev)) { const dx = ev === 'r' ? 1 : ev === 'l' ? -1 : 0, dy = ev === 'up' || ev === 'wide' ? -1 : 0; P(6 + dx, 2 + dy, 1, 1, '#FFFFFF'); P(16 + dx, 2 + dy, 1, 1, '#FFFFFF'); }
    if (o.armR === 'wipe') P(14, 1, 7, 4, shade(body, .9));
    if (o.armL === 'wipe') P(3, 1, 7, 4, shade(body, .9));
    if (o.blush) { P(4, 5, 2, 1, '#F7A3A8'); P(18, 5, 2, 1, '#F7A3A8'); }
    if (o.tear) { const tc = '#A8E0FF'; P(6, 4, 2, 1, tc); P(16, 4, 2, 1, tc); if (o.tear > 1) { P(6, 5, 1, 1, tc); P(17, 5, 1, 1, tc); } }
    if (o.mouth === 'o') P(11, 6, 2, 2, '#5A2A2A');
    else if (o.mouth === 'smile') { P(10, 6, 1, 1, '#5A2A2A'); P(11, 7, 2, 1, '#5A2A2A'); P(13, 6, 1, 1, '#5A2A2A'); }
    // 老了：他戴一副圆眼镜
    if (o.old && who === 'he') { const fc = '#8A7868'; for (const ex of [5, 15]) { P(ex + 1, 1, 2, 1, fc); P(ex + 1, 4, 2, 1, fc); P(ex, 2, 1, 2, fc); P(ex + 3, 2, 1, 2, fc); } P(9, 2, 6, 1, fc); }   // 圆框（四个角空着，不像墨镜）
  }
  // 围巾：脖子那一圈 + 垂下来的一截
  if (o.scarf) { const sc = '#D8283C', sd = '#9E1428'; P(4, 8, 16, 2, sc); P(4, 9, 16, 1, sd); if (!o.back) { P(15, 10, 3, 4, sc); P(15, 13, 3, 1, sd); } }
  // 头上：她的小白花；老了的她多一个白发髻
  const flower = o.flower ?? (who === 'she');
  if (o.old && who === 'she') { const bx = o.back ? 10 : 10; P(bx, -3, 4, 3, '#EDE6E0'); P(bx + 1, -4, 2, 1, '#EDE6E0'); P(bx + 1, -2, 2, 1, '#D8CFC8'); }
  if (flower) { const fx = o.back ? 6 : 17; P(fx - 1, -1, 1, 1, '#FFFFFF'); P(fx + 1, -1, 1, 1, '#FFFFFF'); P(fx, -2, 1, 1, '#FFFFFF'); P(fx, 0, 1, 1, '#FFFFFF'); P(fx, -1, 1, 1, '#FFD34E'); }
  // 歪头：上半身往一边错一个像素
  if (o.lean) {
    const id = g.getImageData(0, 0, MCW, MOY + 7); g.clearRect(0, 0, MCW, MOY + 7); g.putImageData(id, o.lean, 0);
  }
  MON_CACHE[key] = c;
  return c;
}
/* 画小怪：(x, y) 是身体左上角（缓冲坐标），k 倍；tint 给颜色时整体相乘 */
function drawMon(g, x, y, o = {}, k = 1, tint = null, flip = false) {
  const s = monster(o), sp = tint ? tinted(s, tint, JSON.stringify(o)) : s;
  pspr(g, sp, x - MOX * k, y - MOY * k, k, flip);
}
/* 站在地面 gy 上：x 是身体左边（不算手臂） */
function monAt(g, x, gy, o = {}, k = 1, tint = null) { drawMon(g, x - 4 * k, gy - (o.sit ? 14 : 16) * k, o, k, tint); }
/* 剪影 */
function monSil(g, x, gy, o, k, col) { const s = monster(o); pspr(g, silhouette(s, col, JSON.stringify(o)), x - 4 * k - MOX * k, gy - 16 * k - MOY * k, k); }
/* 走路的腿：按时间换帧 */
const walkLeg = (t, sp = 6) => [1, 0, 2, 0][Math.floor(t * sp) % 4];
/* 小怪身上的点（相对 monAt 的 x、gy）：手、头顶 */
function monHand(x, gy, side, pose = 'n', k = 1) {
  const top = gy - 16 * k, L = x - 4 * k;
  const X = { n: side < 0 ? 1 : 22, up: side < 0 ? 1 : 22, dn: side < 0 ? 1 : 22, reach: side < 0 ? -3 : 27, hold: side < 0 ? -4 : 28, hug: side < 0 ? -6 : 30, hi: side < 0 ? 1 : 22, front: side < 0 ? 4 : 19 }[pose] ?? (side < 0 ? 1 : 22);
  const Y = { n: 6, up: 1, dn: 9, reach: 5, hold: 7, hug: 4, hi: -4, front: 7 }[pose] ?? 6;
  return [L + X * k, top + Y * k];
}

/* ---------------- 道具 ---------------- */
function sprRows(name, rows, pal) {
  return cached('spr_' + name, Math.max(...rows.map(r => r.length)), rows.length, g => {
    rows.forEach((r, j) => { for (let i = 0; i < r.length; i++) { const col = pal[r[i]]; if (col) { g.fillStyle = col; g.fillRect(i, j, 1, 1); } } });
  });
}
const RED = '#D8283C', RED_D = '#8E1426', RED_L = '#FF6A78';
/* 红豆：s=1 是 3×2 的小豆；s=2 是 5×3；s≥3 按椭圆画，带高光和种脐 */
function pbean(g, x, y, s = 1, gl = null) {
  x = ri(x); y = ri(y);
  if (s <= 1) { prect(g, x, y, 3, 2, RED); pdot(g, x, y, RED_L); pdot(g, x + 2, y + 1, RED_D); }
  else if (s <= 2) { prect(g, x + 1, y, 3, 3, RED); prect(g, x, y + 1, 5, 1, RED); pdot(g, x + 1, y, RED_L); pdot(g, x + 2, y, RED_L); prect(g, x + 1, y + 2, 3, 1, RED_D); pdot(g, x + 3, y + 1, '#F4E6D8'); }
  else {
    pell(g, x, y, s, s * .72, RED_D); pell(g, x, y - .5, s - 1, s * .72 - 1, RED);
    pell(g, x - s * .35, y - s * .3, Math.max(1, s * .3), Math.max(1, s * .14), RED_L); pdot(g, x - ri(s * .4), y - ri(s * .35), '#FFFFFF');
    pell(g, x + s * .45, y + 1, Math.max(1, s * .15), 1, '#F4E6D8');
  }
  if (gl) pdisc(gl, x + s, y, s + 2, 'rgba(255,90,100,.6)');
}
/* 纸条卷：l 长，竖着或横着（rot 0 横 / 1 竖） */
function proll(g, x, y, l, vert = false) {
  if (vert) { prect(g, x, y, 2, l, '#F4EBDA'); pdot(g, x, y, '#E1D3B9'); prect(g, x, y + ri(l * .45), 2, 1, RED); }
  else { prect(g, x, y, l, 2, '#F4EBDA'); prect(g, x + ri(l * .45), y, 1, 2, RED); }
}
/* 玻璃罐：x 中线、y 罐底；sc 倍（sc=1 时罐子 12×16）；fill 红豆多少；slips 插着几卷纸条；tag 小牌子 */
function pjar(g, x, y, sc = 1, o = {}) {
  const w = ri(12 * sc), h = ri(16 * sc), x0 = ri(x - w / 2), y0 = y - h;
  const fill = o.fill ?? .35, rs = R(o.seed || 7);
  prect(g, x0, y0, w, h, 'rgba(220,240,250,.12)');
  const fh = ri((h - 2) * fill);
  for (let yy = y - 1 - fh; yy < y - 1; yy++) for (let xx = x0 + 1; xx < x0 + w - 1; xx++) { const r = rs(); pdot(g, xx, yy, r < .15 ? RED_L : r < .45 ? RED_D : RED); }
  const ns = o.slips ?? 3;
  for (let i = 0; i < ns; i++) { const sx = x0 + 2 + ri((i + .5) / ns * (w - 5)), len = ri((5 + rs() * 4) * sc); proll(g, sx, y - 1 - fh - len + 2, len, true); }
  // 玻璃边、高光
  prect(g, x0, y0, 1, h, 'rgba(230,248,255,.75)'); prect(g, x0 + w - 1, y0, 1, h, 'rgba(230,248,255,.55)'); prect(g, x0, y - 1, w, 1, 'rgba(230,248,255,.6)');
  prect(g, x0 + 2, y0 + 2, 1, ri(h * .5), 'rgba(255,255,255,.55)');
  // 瓶口、盖子、红线
  prect(g, x0 + 1, y0 - 1, w - 2, 1, 'rgba(230,248,255,.7)');
  if (o.lid !== false) { prect(g, x0 + 1, y0 - 3, w - 2, 2, '#B98B62'); prect(g, x0 + 1, y0 - 2, w - 2, 1, '#9A6E48'); }
  prect(g, x0, y0, w, 1, RED);
  if (o.tag !== false) { prect(g, x0 + w - 2, y0 + 1, 1, ri(2 * sc), RED); prect(g, x0 + w - 3, y0 + 1 + ri(2 * sc), ri(3 * sc), ri(2 * sc), '#F6EEDF'); }
}
/* 摊开的纸条：x 中线、y 中线，宽 w；txt 手写字（12px 像素字，k=1），reveal 写到第几个字（0..1）；check 打钩 */
function pslip(g, x, y, w, txt = '', reveal = 1, o = {}) {
  const h = o.h || 16, x0 = ri(x - w / 2), y0 = ri(y - h / 2);
  prect(g, x0 + 1, y0 + 1, w, h, 'rgba(40,20,10,.25)');
  prect(g, x0, y0, w, h, '#F7EFDF'); prect(g, x0, y0 + h - 1, w, 1, '#E4D6BC');
  prect(g, x0 + 3, y0 + h - 4, w - 6, 1, '#E0CFAE');
  pbean(g, x0 + 2, y0 + 2, 1);
  if (txt) {
    const n = [...txt].length, shown = Math.floor(reveal * n + 1e-6);
    const part = [...txt].slice(0, shown).join('');
    if (part) ptext(g, part, x0 + 7, y0 + 1, 1, '#4A2A24');
  }
  if (o.check) { const c = clamp(o.check), cx = x0 + w - 7, cy = y0 + 6; const pts = [[cx, cy + 1], [cx + 2, cy + 3], [cx + 6, cy - 2]]; if (c > 0) pline(g, pts[0][0], pts[0][1], lerp(pts[0][0], pts[1][0], clamp(c * 2)), lerp(pts[0][1], pts[1][1], clamp(c * 2)), RED); if (c > .5) pline(g, pts[1][0], pts[1][1], lerp(pts[1][0], pts[2][0], (c - .5) * 2), lerp(pts[1][1], pts[2][1], (c - .5) * 2), RED); }
}
/* 杯子（6×6），热气按时间飘 */
function pmug(g, x, y, t, col = '#EFE7DA', steam = 1) {
  prect(g, x, y - 6, 6, 6, col); prect(g, x, y - 6, 6, 1, shade(col, .8)); prect(g, x + 6, y - 5, 2, 1, col); prect(g, x + 7, y - 5, 1, 3, col); prect(g, x + 6, y - 3, 2, 1, col);
  pdot(g, x + 2, y - 3, RED);
  if (steam) for (let i = 0; i < 3; i++) { const u = ((t * .7 + i / 3) % 1); pdot(g, x + 2 + ri(Math.sin(u * 6 + i) * 1.5), y - 8 - ri(u * 8), rgba('#FFFFFF', .55 * steam * (1 - u))); }
}
/* 冒热气（一般用） */
function psteam(g, x, y, t, n = 4, hgt = 14, a = .5) { for (let i = 0; i < n; i++) { const u = ((t * .6 + i / n) % 1); pdot(g, x + ri(Math.sin(u * 5 + i * 2) * 2) + (i % 2) * 2 - 1, y - ri(u * hgt), rgba('#FFFFFF', a * (1 - u))); } }
/* 沙漏（里面流的是红豆）：x 中线，y 顶，高 h，u 流了多少 */
function phourglass(g, x, y, h, u, t) {
  const w = ri(h * .5), hw = w / 2, mid = y + h / 2;
  prect(g, x - hw - 2, y - 2, w + 4, 2, '#7A5638'); prect(g, x - hw - 2, y + h, w + 4, 2, '#7A5638');
  prect(g, x - hw - 2, y, 1, h, '#7A5638'); prect(g, x + hw + 1, y, 1, h, '#7A5638');
  for (let yy = 0; yy < h; yy++) {
    const d = Math.abs(yy - h / 2) / (h / 2), ww = ri(lerp(1, w - 2, Math.pow(d, .8)));
    const top = yy < h / 2, filledTop = top && yy > h / 2 * u + (h / 2) * 0 && (h / 2 - yy) < (h / 2) * (1 - u) * .95;
    const filledBot = !top && (h - yy) < (h / 2) * u * .95;
    prect(g, x - ww / 2, y + yy, ww, 1, 'rgba(220,240,250,.18)');
    if (filledTop || filledBot) for (let xx = 0; xx < ww; xx++) pdot(g, x - ww / 2 + xx, y + yy, hash(xx, yy, 3) < .3 ? RED_D : RED);
    pdot(g, x - ww / 2 - 1, y + yy, 'rgba(230,248,255,.6)'); pdot(g, x + ww / 2, y + yy, 'rgba(230,248,255,.45)');
  }
  if (u > 0 && u < 1) for (let yy = ri(mid); yy < y + h - 2; yy += 2) if ((yy + ri(t * 20)) % 4 < 2) pdot(g, x, yy, RED);
}
/* 行李箱 */
const suitcase = () => sprRows('suitcase', [
  '...hh....', '...h.h...', '...h.h...', 'bbbbbbbbb', 'bSbbbbbSb', 'bSbbbbbSb', 'bSbbbbbSb', 'bbbbbbbbb', '.w.....w.',
], { h: '#4A3C55', b: '#C47F5A', S: '#E0A47E', w: '#1E1A26' });
/* 路灯：(x, 地面 y)，高 hgt；on 0..1；光圈也画进光层 gl */
function streetLamp(b, gl, x, gy, hgt, on, col = '#FFC468') {
  const pole = '#2B3354', top = gy - hgt;
  prect(b, x, top, 2, hgt, pole); prect(b, x - 1, gy - 3, 4, 3, pole);
  prect(b, x, top, 8, 1, pole); prect(b, x + 7, top + 1, 1, 1, pole);
  prect(b, x + 5, top + 1, 6, 2, '#3A4468');
  const bx = x + 8, by = top + 3;
  prect(b, x + 6, top + 3, 4, 1, mix('#55607F', '#FFF4D0', on));
  if (on > 0) {
    pcone(b, bx, by + 1, gy, 4, hgt * .8, col, .24 * on, .07 * on);
    pell(b, bx, gy + 2, hgt * .42, 3, rgba(col, .14 * on));
    if (gl) { prect(gl, x + 5, top + 2, 6, 3, rgba('#FFE7A8', on)); pell(gl, bx, gy + 2, hgt * .3, 2, rgba('#FFC870', .3 * on)); }
  }
}
/* 雪人：两颗红豆当眼睛；melt 化了多少；eyesDrop 眼睛掉下来 */
function psnowman(g, x, gy, melt = 0, eyesDrop = 0, t = 0) {
  const m = clamp(melt), r1 = ri(9 * (1 - m * .4)), r2 = ri(6 * (1 - m * .55)), sq = 1 - m * .5;
  pell(g, x, gy + 1, r1 + 3 + m * 10, 2, m > .3 ? 'rgba(150,190,230,.55)' : 'rgba(150,170,210,.35)');
  pell(g, x, gy - r1 * sq, r1 * (1 + m * .3), r1 * sq, '#F2F6FC'); pell(g, x + 2, gy - r1 * sq * .6, r1 * .6, r1 * sq * .4, '#D6E2F0');
  const hy = gy - r1 * sq * 2 - r2 * sq * .8;
  if (m < .92) { pell(g, x + m * 2, hy, r2 * (1 + m * .2), Math.max(1, r2 * sq), '#F2F6FC'); }
  if (m < .85) { prect(g, x - r2, hy + r2 * sq * .7, r2 * 2 + 1, 2, RED); prect(g, x + 2, hy + r2 * sq * .7 + 2, 2, ri(4 * (1 - m)), RED); }
  for (const ex of [-2, 2]) { const d = E.in2(clamp(eyesDrop)); pbean(g, x + ex * (1 + d * 1.5) - 1, lerp(hy - 2, gy - 1, d), 1); }
  if (m < .7) { pline(g, x - r1, gy - r1 * 1.3 * sq, x - r1 - 5, gy - r1 * 2 * sq, '#5A4434'); pline(g, x + r1, gy - r1 * 1.3 * sq, x + r1 + 5, gy - r1 * 1.9 * sq + (Math.sin(t * 2) > 0 ? 0 : 1), '#5A4434'); }
}
/* 篝火 */
function pfire(g, gl, x, gy, t) {
  prect(g, x - 6, gy - 1, 12, 2, '#4A3428'); pline(g, x - 6, gy, x + 5, gy - 3, '#5A4030'); pline(g, x - 5, gy - 3, x + 6, gy, '#5A4030');
  const f = (i) => 1 + Math.sin(t * 11 + i * 2) * .25;
  for (const [w, hgt, c] of [[5, 11, '#F2683C'], [3, 8, '#FFB04A'], [2, 5, '#FFE7A0']]) {
    for (let yy = 0; yy < ri(hgt * f(w)); yy++) { const ww = ri(w * (1 - yy / (hgt * f(w))) + .5); prect(g, x - ww + ri(Math.sin(t * 9 + yy) * .8), gy - 2 - yy, ww * 2, 1, c); }
  }
  if (gl) { pdisc(gl, x, gy - 5, 10, 'rgba(255,150,80,.6)'); }
  for (let i = 0; i < 6; i++) { const u = ((t * .9 + i / 6) % 1); pdot(g, x + ri(Math.sin(i * 3 + t) * 4), gy - 10 - ri(u * 22), rgba('#FFC070', 1 - u)); }
}
/* 风筝：菱形，红白两色，带一条红尾巴 */
function pkite(g, x, y, t, sc = 1) {
  const s = sc;
  for (let j = -6 * s; j <= 8 * s; j++) { const ww = ri((j < 0 ? (6 * s + j) / (6 * s) : (8 * s - j) / (8 * s)) * 5 * s); for (let i = -ww; i <= ww; i++) pdot(g, x + i, y + j, (i < 0) === (j < 0) ? RED : '#F4EBDA'); }
  pline(g, x, y - 6 * s, x, y + 8 * s, '#7A5638'); pline(g, x - 5 * s, y, x + 5 * s, y, '#7A5638');
  let px = x, py = y + 8 * s;
  for (let i = 1; i <= 14; i++) { const nx = x + ri(Math.sin(t * 5 + i * .7) * 2 * Math.min(1, i / 4)) - i * .6, ny = y + 8 * s + i * 2; pline(g, px, py, nx, ny, RED); if (i % 4 === 0) { pdot(g, nx - 1, ny, RED); pdot(g, nx + 1, ny, RED); } px = nx; py = ny; }
}
/* 长椅（正面）：x 中线，座面 y，宽 w */
function pbench(g, x, y, w, col = '#8A6446') {
  prect(g, x - w / 2, y, w, 2, col); prect(g, x - w / 2, y + 2, w, 1, shade(col, .75));
  prect(g, x - w / 2, y - 9, w, 2, col); prect(g, x - w / 2, y - 5, w, 2, col);
  for (const lx of [x - w / 2 + 2, x + w / 2 - 3]) { prect(g, lx, y - 9, 1, 15, '#3B3634'); }
}
/* 一群鸟（V 字） */
function pbirds(g, t, x, y, n = 6, dir = 1, col = '#3A3448') {
  for (let i = 0; i < n; i++) {
    const bx = ri(x - dir * Math.ceil(i / 2) * 6), by = ri(y + Math.ceil(i / 2) * 4 * (i % 2 ? 1 : -1) * .6 + Math.ceil(i / 2) * 2), up = Math.floor(t * 8 + i) % 2;
    pdot(g, bx, by, col); pdot(g, bx - 1, by - up, col); pdot(g, bx + 1, by - up, col); if (up) { pdot(g, bx - 2, by - 1, col); pdot(g, bx + 2, by - 1, col); }
  }
}
/* 纸船 */
function pboat(g, x, y, sc = 1) {
  for (let j = 0; j < 3 * sc; j++) prect(g, x - 6 * sc + j, y + j, 12 * sc - 2 * j, 1, j === 0 ? '#E3D5BC' : '#F4EBDA');
  for (let j = 0; j < 5 * sc; j++) { const ww = ri((5 * sc - j) * .6); prect(g, x - ww, y - 1 - j, ww * 2 + 1, 1, j % 2 ? '#F4EBDA' : '#EFE4D0'); }
}
/* 一棵红豆树（像素）：grow 0..1，season 0..1（春 .1、夏 .3、秋 .6、冬 .85），pods 结红豆荚，night 夜里压暗 */
function ptree(g, x, gy, grow, season = .3, o = {}) {
  if (grow <= 0) return;
  const night = o.night || 0, hgt = ri(lerp(4, 70, Math.pow(grow, .8))), tw = Math.max(1, ri(lerp(1, 7, grow)));
  const bark = mix('#5A4234', '#24202E', night * .6);
  for (let yy = 0; yy < hgt * .62; yy++) { const ww = ri(lerp(tw, Math.max(1, tw * .5), yy / (hgt * .62))); prect(g, x - ww / 2, gy - yy, ww, 1, bark); }
  const winter = season >= .76 && season < .95, autumn = season > .5 && season < .76;
  const leaf = mix(ramp([[0, '#9CC870'], [.3, '#6E9E50'], [.55, '#C8A048'], [.7, '#B86A3A'], [.8, '#9A8A7A'], [1, '#9CC870']], season), '#22283E', night * .7);
  const tips = grow < .2 ? [[x, gy - hgt]] : [[-.55, .55], [.6, .58], [-.2, .78], [.3, .8], [0, .92]].map(([dx, hy]) => [x + dx * hgt * .6, gy - hgt * hy]);
  if (grow >= .2) for (const [bx, by] of tips) pline(g, x, gy - hgt * .5, bx, by, bark);
  const crown = lerp(3, 26, grow);
  const amount = winter ? 0 : autumn ? .75 : 1;
  for (const [layer, k0] of [[0, .78], [1, .95], [2, 1.12]]) for (let i = 0; i < 14; i++) {
    if (hash(i, 51 + layer) > amount) continue;
    const tp = tips[i % tips.length], a = hash(i, 52 + layer) * TAU, r = hash(i, 53 + layer) * crown * .55;
    pdisc(g, tp[0] + Math.cos(a) * r * 1.3, tp[1] + Math.sin(a) * r * .55 - layer, Math.max(1, crown * (.28 - layer * .04) * (.7 + hash(i, 55) * .5)), shade(leaf, k0));
  }
  // 细碎的叶子点（羽状叶的感觉）
  if (amount > 0) for (let i = 0; i < 40 * amount * grow; i++) { const tp = tips[i % tips.length]; pdot(g, tp[0] + (hash(i, 56) - .5) * crown * 2.2, tp[1] + (hash(i, 57) - .5) * crown * .9, shade(leaf, 1.3)); }
  if (winter) { const sn = mix('#F4F7FB', '#B8C4E0', night); for (const [bx, by] of tips) { prect(g, bx - 2, by - 1, 4, 1, sn); } }
  if (grow > .6 && (o.pods ?? (season > .4 && season < .8))) for (let i = 0; i < 12; i++) { const tp = tips[i % tips.length], a = hash(i, 61) * TAU, r = hash(i, 62) * crown * .45; const px = ri(tp[0] + Math.cos(a) * r), py = ri(tp[1] + Math.sin(a) * r * .5 + 3); prect(g, px, py, 1, 3, '#A0603A'); pdot(g, px + 1, py + 2, RED); }
  return tips;
}
/* 像素房子：x 中线、gy 地面；lit 窗户亮；snow 屋顶有雪 */
function phouse(g, gl, x, gy, o = {}) {
  const w = o.w || 40, h = o.h || 22, night = o.night || 0, lit = o.lit ?? night;
  const wall = mix(o.wall || '#E6D2BC', '#3A3550', night * .7), roof = mix(o.roof || '#9C5A48', '#3A2638', night * .6);
  prect(g, x - w / 2, gy - h, w, h, wall);
  for (let j = 0; j < 12; j++) prect(g, x - w / 2 - 3 + j * 2, gy - h - j, w + 6 - j * 4, 1, roof);
  if (o.snow) for (let j = 0; j < 12; j++) { prect(g, x - w / 2 - 3 + j * 2, gy - h - j - 1, 2, 1, '#EEF2FA'); prect(g, x + w / 2 + 1 - j * 2, gy - h - j - 1, 2, 1, '#EEF2FA'); }
  prect(g, x + ri(w * .22), gy - h - 13, 3, 5, shade(roof, .8));
  for (const wx of [x - ri(w * .32), x + ri(w * .14)]) { prect(g, wx, gy - h + 6, 7, 6, mix('#8FB0C8', '#FFC870', lit)); prect(g, wx + 3, gy - h + 6, 1, 6, wall); prect(g, wx, gy - h + 9, 7, 1, wall); if (gl && lit > .1) pdisc(gl, wx + 3, gy - h + 9, 6, rgba('#FFB050', .6 * lit)); }
  prect(g, x - 3, gy - 9, 6, 9, mix('#8A6248', '#2E2230', night * .6));
}
/* 栅栏 */
function pfence(g, x0, x1, gy, col = '#F2ECE2') { for (let x = x0; x < x1; x += 4) { prect(g, x, gy - 6, 2, 6, col); pdot(g, x, gy - 7, col); } prect(g, x0, gy - 4, x1 - x0, 1, col); }

/* 会转的红豆（像素逐个填）：r 半长轴（像素），ang 方向；左上方亮、右下方暗，带一个高光点和白色的种脐 */
function pbeanRot(g, cx, cy, r, ang = 0, gl = null) {
  const cs = Math.cos(ang), sn = Math.sin(ang), ry = r * .7, R2 = Math.ceil(r) + 1;
  for (let y = -R2; y <= R2; y++) for (let x = -R2; x <= R2; x++) {
    const lx = x * cs + y * sn, ly = -x * sn + y * cs, v = (lx * lx) / (r * r) + (ly * ly) / (ry * ry);
    if (v > 1) continue;
    const lit = -(x + y) / (r * 1.6) + (1 - v) * .4;
    let c = lit > .45 ? RED_L : lit > -.15 ? RED : RED_D;
    if (v > .78 && (x + y) > 0) c = RED_D;
    const hx = lx + r * .38, hy = ly + ry * .35;
    if (hx * hx + hy * hy * 3 < Math.max(1.1, r * r * .03)) c = '#FFFFFF';
    const sx = lx - r * .5, sy = ly;
    if (r >= 4 && sx * sx * 3 + sy * sy * 6 < Math.max(1.2, r * r * .025)) c = '#F4E6D8';
    pdot(g, cx + x, cy + y, c);
  }
  if (gl) pdisc(gl, cx, cy, r + 3, 'rgba(255,80,100,.55)');
}
/* 呵出来的白气：几团像素往 dir 飘 */
function pbreath(g, x, y, t, t0, dir = 1) {
  const k = (t - t0) / 1.2; if (k < 0 || k > 1) return;
  for (let i = 0; i < 4; i++) { const kk = clamp(k * 1.3 - i * .1); pdisc(g, x + dir * (2 + kk * 10 + i * 2), y - kk * 3 + i, 1 + kk * 2.5, rgba('#F0F6FF', .5 * Math.sin(Math.PI * kk))); }
}
/* 小心心（冒出来往上飘） */
function pheart(g, x, y, c = '#FF5A78') { x = ri(x); y = ri(y); pdot(g, x - 1, y - 1, c); pdot(g, x + 1, y - 1, c); prect(g, x - 2, y, 5, 1, c); prect(g, x - 1, y + 1, 3, 1, c); pdot(g, x, y + 2, c); }
