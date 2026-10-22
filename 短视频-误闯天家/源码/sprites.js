'use strict';
/* sprites.js：像素小怪和它在这支 MV 里的行头。
   小怪是用户给的 12×8 方块像素小怪（Claude），每个方块画成 2×2 个世界像素：身体加手臂 24 宽、16 高（不算帽子）。
     ..oooooooo..
     ..o#oooo#o..
     oooooooooooo
     oooooooooooo
     ..oooooooo..
     ..oooooooo..
     ..o.o..o.o..
     ..o.o..o.o..
   身体 #CB7C5E，眼睛 #171312。天家的仙人是同一个模型，换成金色、闭着眼、头上一圈光环；佛爷是放大 4 倍的金色小怪。
   本片的新造型：粉面（戏妆）、披衣（红色戏服）、头面（金冠、绒球）、手里一捧砂、合掌、盘腿；
   会动的东西（光环、水袖、翎子、披帛）不进精灵缓存，在世界里另画。 */

const CL_OX = 6, CL_OY = 10;          // 身体左上角在精灵画布里的偏移（留出头面和伸出去的手臂）
const CL_W = 38, CL_H = 30;
const CLAWD_CACHE = {};
const TONES = { base: '#CB7C5E', gold: '#E9C46A', gold2: '#F2D27E', gold3: '#DDB04F' };

/* o：{col, eyes, arms, legs, pose, mouth, powder, robe, crown, sand, beard, brows, blush, sweat, tear, flush} */
function clawd(o = {}) {
  const key = JSON.stringify(o);
  if (CLAWD_CACHE[key]) return CLAWD_CACHE[key];
  const c = mk(CL_W, CL_H), g = c.getContext('2d');
  const body = o.col || TONES.base, eye = C.eye, armC = shadeOf(body, .9);
  const sy = { kneel: 3, sit: 3, lotus: 2, bow: 2 }[o.pose] || 0;
  const P = (x, y, w, h, col) => { g.fillStyle = col; g.fillRect(CL_OX + x, CL_OY + y + sy, w, h); };
  // 身体
  P(4, 0, 16, 12, body);
  // 手臂
  const arms = o.arms || 'n';
  const robeC = '#C8323A', cuff = '#F6F1E4';
  const sleeve = o.robe ? robeC : body;
  const A = (x, y, w, h, front) => P(x, y, w, h, front ? (o.robe ? '#A82632' : armC) : sleeve);
  if (arms === 'n') { A(0, 4, 4, 4); A(20, 4, 4, 4); }
  else if (arms === 'up') { A(2, 4, 2, 2); A(0, -1, 2, 7); A(20, 4, 2, 2); A(22, -1, 2, 7); }
  else if (arms === 'upL') { A(2, 4, 2, 2); A(0, -1, 2, 7); A(20, 4, 4, 4); }
  else if (arms === 'upR') { A(0, 4, 4, 4); A(20, 4, 2, 2); A(22, -1, 2, 7); }
  else if (arms === 'dn') { A(0, 6, 4, 4); A(20, 6, 4, 4); }
  else if (arms === 'poke') { A(0, 4, 4, 4); A(20, 4, 9, 2); }                       // 右手平伸出去：指尖推门
  else if (arms === 'pokeUp') { A(0, 4, 4, 4); A(20, 3, 3, 2); A(22, 1, 3, 2); A(24, -1, 2, 2); }
  else if (arms === 'spread') { A(-3, 2, 7, 2); A(20, 2, 7, 2); }                    // 亮相：两臂张开
  else if (arms === 'flipA') { A(-1, 1, 2, 5); A(1, 4, 3, 2); A(20, 7, 4, 3); }       // 抖腕：一只手翻上去，一只手压下来
  else if (arms === 'flipB') { A(0, 7, 4, 3); A(20, 4, 3, 2); A(23, 1, 2, 5); }
  else if (arms === 'hold') { A(1, 6, 4, 4); A(19, 6, 4, 4); }                       // 捧着东西
  else if (arms === 'cover') { A(1, 5, 3, 3); A(20, 5, 3, 3); A(8, 5, 4, 3, true); A(12, 5, 4, 3, true); }   // 捂嘴
  else if (arms === 'pray') { A(2, 6, 2, 2); A(20, 6, 2, 2); A(10, 5, 4, 5, true); }  // 合掌
  else if (arms === 'beckon') { A(0, 4, 4, 4); A(20, 4, 3, 2); A(22, 2, 2, 3); }      // 招手
  if (o.robe && arms !== 'cover' && arms !== 'pray') {                                // 白色的袖口
    if (arms === 'n') { P(0, 7, 4, 1, cuff); P(20, 7, 4, 1, cuff); }
    if (arms === 'spread') { P(-3, 2, 1, 2, cuff); P(26, 2, 1, 2, cuff); }
  }
  // 腿
  const legs = o.legs || 0, knee = shadeOf(body, .82);
  if (o.pose === 'kneel' || o.pose === 'bow') { P(4, 12, 7, 1, knee); P(13, 12, 7, 1, knee); }
  else if (o.pose === 'sit') { P(0, 12, 5, 1, knee); P(19, 12, 5, 1, knee); }
  else if (o.pose === 'lotus') { P(2, 12, 20, 2, knee); P(6, 12, 12, 1, shadeOf(body, .72)); }       // 盘腿
  else [[4, 1], [8, 2], [14, 1], [18, 2]].forEach(([x, grp]) => P(x, 12, 2, o.tip || legs === grp ? 3 : 4, body));
  // 披衣：红戏服（交领、金边、下摆深一点）
  if (o.robe) {
    const tr = '#F2C14E', dk = '#8E1F2A';
    P(4, 6, 16, 6, robeC); P(4, 11, 16, 1, dk);
    for (let i = 0; i < 4; i++) { P(8 + i, 6 + i, 1, 1, tr); P(15 - i, 6 + i, 1, 1, tr); }
    P(12, 9, 1, 2, tr); P(5, 9, 1, 1, '#FFD34E'); P(18, 9, 1, 1, '#FFD34E'); P(6, 10, 1, 1, '#FFD34E'); P(17, 10, 1, 1, '#FFD34E');
    P(4, 10, 16, 1, tr);
  }
  // 粉面：脸上扑一层粉，眼窝晕红，额头一点花钿
  if (o.powder) {
    P(5, 0, 14, 6, '#F8DCCF'); P(4, 1, 1, 4, '#F3CBBE'); P(19, 1, 1, 4, '#F3CBBE');
    P(5, 1, 4, 4, '#F2A0AA'); P(15, 1, 4, 4, '#F2A0AA'); P(5, 4, 4, 1, '#F7BFC4'); P(15, 4, 4, 1, '#F7BFC4');
    P(11, 0, 2, 1, '#D7263D');
  }
  // 一捧砂：捧在肚子前，砂粒闪光
  if (o.sand) {
    const s1 = '#E2B867', s2 = '#B88A3E', s3 = '#FFF0B0';
    P(9, 5, 6, 1, s1); P(7, 6, 10, 1, s1); P(5, 7, 14, 3, s1); P(5, 10, 14, 1, s2);
    [[9, 5], [13, 6], [7, 8], [16, 7], [11, 9], [14, 9]].forEach(([x, y], i) => P(x, y, 1, 1, (o.sand + i) % 3 ? s3 : '#FFFFFF'));
  }
  // 眼睛
  const ev = o.eyes || 'n';
  const E2 = (x, y, w, h, col = eye) => { P(x, y, w, h, col); P(x + 10, y, w, h, col); };
  if (ev === 'n') E2(6, 2, 2, 2);
  else if (ev === 'l') E2(5, 2, 2, 2);
  else if (ev === 'r') E2(7, 2, 2, 2);
  else if (ev === 'up') E2(6, 1, 2, 2);
  else if (ev === 'dn') E2(6, 3, 2, 2);
  else if (ev === 'blink' || ev === 'shut') E2(6, 3, 2, 1);
  else if (ev === 'happy') { E2(5, 3, 1, 1); E2(6, 2, 2, 1); E2(8, 3, 1, 1); }       // ^ ^
  else if (ev === 'closed') { E2(5, 2, 1, 1); E2(6, 3, 2, 1); E2(8, 2, 1, 1); }      // 入定：眼睛弯成两道
  else if (ev === 'wide') E2(6, 1, 2, 3);
  else if (ev === 'tiny') E2(6, 2, 1, 1);
  else if (ev === 'squint') { P(6, 1, 1, 1, eye); P(7, 2, 1, 1, eye); P(6, 3, 1, 1, eye); P(17, 1, 1, 1, eye); P(16, 2, 1, 1, eye); P(17, 3, 1, 1, eye); }   // > <
  else if (ev === 'star') { E2(6, 1, 2, 4, '#FFD34E'); E2(5, 2, 4, 2, '#FFD34E'); E2(6, 2, 2, 2, '#FFFFFF'); }
  if (o.tear) { P(6, 4, 1, 2, '#9FD3FF'); P(17, 4, 1, 2, '#9FD3FF'); }
  // 嘴
  if (o.mouth) {
    const m = '#5A1E2A';
    if (o.mouth === 'o') P(11, 6, 2, 2, m);
    else if (o.mouth === 'sing') { P(10, 5, 4, 3, m); P(11, 7, 2, 1, '#FF7A8A'); }
    else if (o.mouth === 'smile') { P(10, 6, 4, 1, m); P(9, 5, 1, 1, m); P(14, 5, 1, 1, m); }
    else if (o.mouth === 'flat') P(10, 6, 4, 1, m);
    else if (o.mouth === 'wobble') { for (let i = 0; i < 6; i++) P(9 + i, 6 + (i % 2), 1, 1, m); }
    else if (o.mouth === 'red') P(11, 5, 2, 1, '#D7263D');
  }
  if (o.powder && !o.mouth) P(11, 5, 2, 1, '#D7263D');
  // 长白胡子（老仙人）、白眉毛
  if (o.beard) { const w = '#F7F4EC', s = '#D9D4C6'; P(7, 6, 10, 3, w); P(8, 9, 8, 2, w); P(9, 11, 6, 2, w); P(10, 13, 4, 2, w); P(11, 15, 2, 1, s); P(7, 8, 1, 1, s); P(16, 8, 1, 1, s); }
  if (o.brows) { P(5, 0, 4, 1, '#F7F4EC'); P(15, 0, 4, 1, '#F7F4EC'); P(4, 1, 1, 1, '#F7F4EC'); P(19, 1, 1, 1, '#F7F4EC'); }
  if (o.blush) { P(4, 5, 2, 1, '#F2A0A0'); P(18, 5, 2, 1, '#F2A0A0'); }
  if (o.flush) { P(4, 4, 3, 2, '#F0605A'); P(17, 4, 3, 2, '#F0605A'); }
  if (o.sweat) { P(3, -1, 1, 2, '#9FD3FF'); P(2, 1, 2, 1, '#9FD3FF'); P(21, 0, 1, 2, '#9FD3FF'); P(21, 2, 2, 1, '#9FD3FF'); }
  // 头面：金冠、三个绒球
  if (o.crown) {
    const gd = '#F2C14E', gl = '#FFE58A', pk = '#FF6F91', pd = '#D94A6E';
    P(5, -1, 14, 1, gd); P(6, -2, 12, 1, gl); P(8, -3, 8, 1, gd); P(11, -4, 2, 1, gl);
    P(7, -2, 1, 1, '#D7263D'); P(12, -3, 1, 1, '#4FC3F7'); P(16, -2, 1, 1, '#D7263D');
    P(3, -3, 2, 2, pk); P(3, -2, 2, 1, pd); P(19, -3, 2, 2, pk); P(19, -2, 2, 1, pd); P(11, -6, 2, 2, pk);
  }
  CLAWD_CACHE[key] = c;
  return c;
}
/* 画小怪：(cx, footY) 是身体中线和脚底（世界坐标）；s 是整数放大倍数 */
function clawdAt(g, cx, footY, o = {}, flip = false, s = 1) {
  const c = clawd(o);
  const x = ri(cx - 12 * s - CL_OX * s), y = ri(footY - 16 * s - CL_OY * s);
  g.save(); g.imageSmoothingEnabled = false;
  if (!flip) g.drawImage(c, x, y, CL_W * s, CL_H * s);
  else { g.translate(ri(cx + 12 * s + CL_OX * s), y); g.scale(-1, 1); g.drawImage(c, 0, 0, CL_W * s, CL_H * s); }
  g.restore();
}
const walkLegs = (t, fps = 6) => [1, 0, 2, 0][Math.floor(t * fps) % 4];
function blinkEyes(t, seed = 0, base = 'n') { const p = (t + seed * 1.7) % 3.1; return p < .12 ? 'blink' : base; }

/* 光环：头顶一圈金光，落拍时亮一下。(cx, topY) 是头顶 */
function halo(g, cx, topY, t, s = 1, a = 1) {
  const k = kick(t, .25);
  withAlpha(g, a, () => {
    palpha(g, .22 + k * .25, () => pell(g, cx, topY - 4 * s, 9 * s, 3 * s, '#FFF4B8'));
    pring(g, cx, topY - 4 * s, 7 * s, 1.6 * s, '#FFE58A', Math.max(1, s));
    pdot(g, cx - 3 * s, topY - 5 * s, '#FFFFFF');
  });
}
/* 水袖：从两只手垂下来的长白袖，像绸子一样一路飘。(cx, footY) 同 clawdAt；out 0 是垂着，1 是往两边甩出去；
   amp 飘动幅度；x0、y0 是袖口离身体中线、脚底多远（两臂张开时 15、13） */
function sleeves(g, cx, footY, t, o = {}) {
  const s = o.s || 1, len = (o.len || 16) * s, amp = o.amp === undefined ? 2 : o.amp, out = o.out || 0;
  for (const side of [-1, 1]) {
    const x0 = cx + side * (o.x0 || 12) * s, y0 = footY - (o.y0 || 9) * s;
    const ang = Math.PI / 2 - side * out * 1.15, dx = Math.cos(ang), dy = Math.sin(ang);
    for (let i = 0; i <= len; i++) {
      const u = i / len, wave = Math.sin(t * 5 + u * 5 + side) * amp * u * s;
      const x = x0 + dx * i - dy * wave, y = y0 + dy * i + dx * wave;
      const th = Math.round((3 + u * 4) * s);
      prect(g, x - th / 2, y - th / 2, th, th, '#FAF8F0');
      prect(g, x - th / 2, y + th / 2 - 1, th, 1, i % 5 === 4 ? '#C9CED9' : '#E2E5EC');
    }
  }
}
/* 翎子：头面上插的两根长雉鸡翎，往两边弯出去再往后翘，一节深一节浅。topY 是身体顶（脚底 - 16） */
function feathers(g, cx, topY, t, s = 1) {
  for (const side of [-1, 1]) {
    const n = 40 * s;
    for (let i = 0; i < n; i++) {
      const u = i / n;
      const sway = Math.sin(t * 3.2 + side) * 2.5 * u * u * s;
      const x = cx + side * (3 * s + u * 18 * s + Math.sin(u * Math.PI) * 6 * s) + sway;
      const y = topY - 4 * s - Math.sin(u * Math.PI * .85) * 26 * s + u * u * 12 * s;
      const band = Math.floor(u * 10) % 2;
      const th = u < .85 ? 2 : 1;
      prect(g, x, y, th * s, th * s, band ? '#F2E4C0' : '#6A3A1E');
    }
  }
}
/* 披帛：仙人身后飘的彩带 */
function ribbon(g, x0, y0, t, o = {}) {
  const len = o.len || 26, col = o.col || '#F6A5C0', dir = o.dir || 1, s = o.s || 1;
  for (let i = 0; i < len * s; i++) {
    const u = i / (len * s);
    const x = x0 + dir * i * .9, y = y0 + Math.sin(t * 3 + u * 6 + (o.ph || 0)) * 3 * s * (0.3 + u) - u * 4 * s;
    prect(g, x, y, 1, Math.max(1, s), i % 5 === 4 ? shadeOf(col, .85) : col);
  }
}
/* 远处的小仙人：1 个方块 = 1 个世界像素（12×8），金色，头顶一个小光环 */
function miniCelestial(g, cx, footY, t, seed = 0, look = 0) {
  const b = '#E9C46A', d = '#C99A3A';
  prect(g, cx - 4, footY - 8, 8, 6, b); prect(g, cx - 6, footY - 6, 12, 2, b); prect(g, cx - 4, footY - 3, 8, 1, d);
  [-3, -1, 1, 3].forEach(x => prect(g, cx + x - (x > 0 ? 1 : 0), footY - 2, 1, 2, b));
  const ex = look ? clamp(look, -1, 1) : 0;
  prect(g, cx - 3 + ex, footY - 7, 1, 1, C.eye); prect(g, cx + 2 + ex, footY - 7, 1, 1, C.eye);
  const k = kick(t + seed * .07, .25);
  pring(g, cx, footY - 11, 4, 1, k > .5 ? '#FFFFFF' : '#FFE58A');
}
