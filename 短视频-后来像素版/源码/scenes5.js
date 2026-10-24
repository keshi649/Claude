'use strict';
/* scenes5.js：如果当时（128.27~153.05 秒）+ 副歌（153.05~179.54 秒）
   回忆：shForkChoice "如果当时我们能不那么倔强" 夕阳下的岔路口，两个人背对背；"回头？ 是 / 否"，"倔强"时光标停在"否"
         shWalkApart  "现在也不那么遗憾" 两个人各走一条路，越走越远；"憾"字她停下来回头，他已经翻过了坡
   现在：shHimRemember "你都如何回忆我 带着笑或是很沉默" 他看着掌机里的存档，笑了一下，又不说话了
         shHimPopsicle "这些年来有没有人能让你不寂寞" 下雪的夜，便利店的窗边，他掰开双棒冰棍，把另一半递向空着的座位
   现在（夏天的夜）：shStreetSummer "后来" 挂着灯笼的街，她一个人走
         shGiveHalf   "我总算学会了如何去爱" 她掰开双棒冰棍，把另一半给了一个冰淇淋掉在地上、正在哭的小孩
         shFireworksFar "可惜你早已远去" 河对岸放烟花，她一个人站在这边
         shFestivalCrowd "消失在人海" 看烟花的人群里，一个青绿色、带呆毛的身影，转眼不见了
         shFaceFireworks "后来" 烟花的光一闪一闪照在她脸上，眼里有泪
         shBokehMemories "终于在眼泪中明白" 泪眼里，烟花变成一个个大光斑，每个光斑里是一段回忆
         shLastFirework "有些人一旦错过就不再" 最后一朵烟花散了，人走光了，对岸的灯一盏盏灭；她拿出掌机 */

/* ================= 夕阳下的岔路口（192×108） ================= */
function forkScene(b, gl, t, o = {}) {
  const w = 192, h = 140;
  psky(b, w, 62, [[0, '#3A2A6A'], [.45, '#C8607A'], [.8, '#F49A6A'], [1, '#FFD08A']]);
  pdisc(b, 96, 58, 12, '#FFE8A8'); pdisc(gl, 96, 58, 18, 'rgba(255,200,120,.7)');                // 夕阳
  for (let i = 0; i < 3; i++) { b.globalAlpha = .5; pell(b, mod(30 + i * 70 + t * 2, 240) - 20, 16 + i * 7, 26, 3, '#E88A9A'); b.globalAlpha = 1; }
  hillShape(b, w, h, [[0, 60], [50, 56], [96, 60], [150, 55], [192, 59]], '#6A4A6A', '#8A5A7A');      // 远山
  hillShape(b, w, h, [[0, 66], [60, 63], [130, 65], [192, 62]], '#8A6A4A', '#A87A5A');               // 田野
  prect(b, 0, 66, w, h - 66, '#9A7A4A');
  for (let i = 0; i < 70; i++) pdot(b, hash(i, 141) * w, 67 + hash(i, 142) * (h - 68), hash(i, 143) < .5 ? '#B08A52' : '#8A6A40');
  // 路：从下面中间来，在岔路口分成往左、往右的两条，越远越窄
  ppoly(b, [[70, 140], [122, 140], [100, 84], [92, 84]], '#E8D2A0');
  ppoly(b, [[92, 86], [100, 86], [40, 66], [34, 66]], '#E8D2A0');
  ppoly(b, [[92, 86], [100, 86], [158, 66], [152, 66]], '#E8D2A0');
  // 路牌
  prect(b, 106, 70, 2, 16, '#6A4A30'); ppoly(b, [[96, 70], [118, 70], [121, 73], [118, 76], [96, 76]], '#B88A58'); ppoly(b, [[118, 77], [96, 77], [93, 80], [96, 83], [118, 83]], '#A87A48');
  pdot(b, 112, 73, '#5A3A20'); pdot(b, 100, 80, '#5A3A20');
  // 长长的影子往右边拖
}
function shForkChoice(g, t, s) {
  const w = 192, h = 140, b = pbuf('fork', w, h), gl = glowBuf('fork', w, h);
  forkScene(b, gl, t);
  const menu = 131.0, toNo = ch(24, 10), pick = ch(24, 11);
  const step = seg(t, pick + .15, s.e);
  const herX = ri(88 - step * 4), himX = ri(106 + step * 4), fy = 96;
  // 影子
  b.save(); b.globalAlpha = .25; prect(b, herX + 6, fy - 1, 22, 2, '#3A2A2A'); prect(b, himX + 6, fy - 1, 22, 2, '#3A2A2A'); b.restore();
  monAt(b, herX, fy, { col: COL.her, skirt: true, eyes: t < menu ? 'dnl' : 'l' }, '#FFD8C0');
  monAt(b, himX, fy, { col: COL.him, cowlick: true, eyes: t < menu ? 'dnr' : 'r' }, '#FFD8C0');
  const z = lerp(1.02, 1.3, E.io(seg(t, s.t, menu)));                 // 缓冲正好 192 宽：最小推到 1.02 倍、对准中线，左右不露黑
  blitZoom(g, 'fork', 10, 96, 70, z, W / 2, H / 2 - 40); glowBlitZoom(g, 'fork', 10, 96, 70, z, W / 2, H / 2 - 40, .8, 3);
  // 选项："回头？"，光标先在"是"上闪，"倔"字挪到"否"，"强"字选定
  const ma = E.out(seg(t, menu, menu + .3));
  if (ma > 0) {
    const sel = t < toNo ? 0 : E.io(seg(t, toNo, toNo + .2));
    uiChoice(g, t, 1290, 150, 340, '回头？', ['是', '否'], sel, { alpha: ma * (1 - seg(t, pick + .5, pick + .8)), blink: t < toNo, picked: pick });
  }
}
function shWalkApart(g, t, s) {
  const w = 192, h = 140, b = pbuf('fork', w, h), gl = glowBuf('fork', w, h);
  forkScene(b, gl, t);
  const u = seg(t, s.t, s.e + 1), look = ch(25, 7);
  const wc = walkCycle(t, 4);
  // 她往左那条路走，"憾"字停下回头；他往右走，越来越小，翻过坡就不见了
  const hu = Math.min(u, seg(look, s.t, s.e + 1)), hx = lerp(88, 44, hu), hy = lerp(96, 68, hu);
  const stopped = t >= look;
  if (hu < .55) monAt(b, hx, hy + (stopped ? 0 : wc.bob), { col: COL.her, skirt: true, eyes: stopped ? 'r' : 'l', legs: stopped ? 0 : wc.legs }, '#FFD8C0');
  else smonAt(b, hx, hy, { col: COL.her, skirt: true, eyes: stopped ? 'r' : 'l', legs: stopped ? 0 : wc.legs }, '#FFD8C0');
  const mu = u, mx = lerp(106, 156, mu), my = lerp(96, 66, mu);
  if (mu < .5) monAt(b, mx, my + wc.bob, { col: COL.him, cowlick: true, eyes: 'r', legs: wc.legs }, '#FFD8C0');
  else if (mu < .92) smonAt(b, mx, my, { col: COL.him, cowlick: true, eyes: 'r', legs: wc.legs }, '#FFD8C0');
  const z = lerp(1.3, 1.02, E.io(seg(t, s.t, s.e)));
  const fyc = lerp(70, 64, E.io(seg(t, s.t, s.e)));
  blitZoom(g, 'fork', 10, 96, fyc, z, W / 2, H / 2 - 40); glowBlitZoom(g, 'fork', 10, 96, fyc, z, W / 2, H / 2 - 40, .8, 3);
}

/* ================= shHimRemember：他看着存档（140.65 ~ 146.85） ================= */
function shHimRemember(g, t, s) {
  const w = 140, h = 84, b = pbuf('himF', w, h), gl = glowBuf('himF', w, h);
  prect(b, 0, 0, w, h, '#181A30');
  b.save(); gl.save(); b.translate(10, 8); gl.translate(10, 8);           // 缓冲比画面大一圈，推镜头时四边不露黑
  // 身后的窗：外面在下雪（虚着）
  prect(b, 70, 6, 40, 30, '#22284A'); prect(b, 70, 6, 40, 1, '#3A3A58'); prect(b, 89, 6, 2, 30, '#3A3A58');
  const sk = pbuf('himWin', 40, 30); psky(sk, 40, 30, [[0, '#1A2040'], [1, '#2A3050']]); snow(sk, t, 40, 30, { n: 26, v: 8, seed: 9 }); b.globalAlpha = .8; pspr(b, BUF.himWin, 70, 6); b.globalAlpha = 1;
  const smile = t >= ch(27, 2) && t < ch(27, 6), quiet = t >= ch(27, 6);
  monLit(b, 44, 54, { col: COL.him, cowlick: true, armL: 'hold', armR: 'hold', eyes: smile ? 'happy' : quiet ? 'dn' : 'dn', glint: !smile }, '#9AF0DC', .34);
  heldHandheld(b, 44, 47, '#7FC8C0', '#BFF8EC'); prect(gl, 41, 48, 6, 4, '#BFF8EC'); pglow(gl, 44, 48, 10, '#9AF0DC', .7);
  b.restore(); gl.restore();
  const z = 1.02 + .05 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'himF', 16, 66, 44, z, W / 2, H / 2); glowBlitZoom(g, 'himF', 16, 66, 44, z, W / 2, H / 2, .8, 2);
  // 他屏幕上的画面（画中画）：存档 01，栀子花树下的两个人
  const pa = E.out(seg(t, s.t + .4, s.t + .8));
  if (pa > 0) {
    drawTitleWorld(t, {});
    const bx = 1180, by = 150, bw = 576, bh = 324;
    uiBox(g, bx - 18, by - 18, bw + 36, bh + 64, 6, { alpha: pa, fill: '#0E142E' });
    g.save(); g.globalAlpha = pa; g.imageSmoothingEnabled = false; g.drawImage(BUF.tworld, bx, by, bw, bh); g.restore();
    ptext(g, '存档 01　十七岁的夏天', bx, by + bh + 10, 3, '#F4F1E8', { alpha: pa });
  }
}

/* ================= shHimPopsicle：便利店的窗边（146.85 ~ 153.05） ================= */
const HP = { split: ch(28, 4), offer: ch(28, 9), lower: ch(28, 12) + .4 };
function shHimPopsicle(g, t, s) {
  const w = 240, h = 135, b = pbuf('conv', w, h), gl = glowBuf('conv', w, h);
  prect(b, 0, 0, w, h, '#0E1228');
  // 便利店：亮堂堂的玻璃窗，里面一排排货架
  prect(b, 20, 14, 200, 96, '#2A2E48'); prect(b, 26, 30, 188, 74, '#F2EEDC');
  prect(b, 24, 16, 192, 12, '#1E7A5A'); ptext(b, '便利店 24h', 120, 16, 1, '#F4FFF8', { align: 'center' });
  prect(gl, 24, 16, 192, 12, 'rgba(120,255,200,.35)'); prect(gl, 26, 30, 188, 74, 'rgba(255,248,220,.45)');
  for (let r = 0; r < 3; r++) for (let i = 0; i < 22; i++) prect(b, 32 + i * 8, 38 + r * 12, 6, 8, ['#E85A5A', '#5AB4E8', '#F4D04A', '#8AD07A', '#F4A64A', '#C88AE8'][(i + r * 2) % 6]);
  for (let r = 0; r < 3; r++) prect(b, 30, 46 + r * 12, 180, 1, '#C8C0A8');
  prect(b, 26, 74, 188, 4, '#B8A890');                                   // 窗边的长桌
  [100, 140].forEach(x => { prect(b, x - 5, 92, 10, 3, '#C83A4A'); prect(b, x - 1, 95, 2, 9, '#8A8A98'); });   // 两张高脚凳
  prect(b, 20, 104, 200, 2, '#3A3E58');                                  // 窗台
  // 窗框（竖的分隔）
  [26, 120, 214].forEach(x => prect(b, x - 1, 28, 2, 76, '#3A3E58'));
  // 他：坐在左边的凳子上；右边空着
  const offering = t >= HP.offer && t < HP.lower, split = t >= HP.split;
  monAt(b, 100, 90, { col: COL.him, cowlick: true, legs: 'sit', eyes: offering ? 'r' : t >= HP.lower ? 'dn' : 'dn', armR: offering ? 'reach' : 'hold', armL: 'hold' });
  if (!split) pspr(b, popsicle(0), 94, 66);
  else {
    pspr(b, popsicle(1), 92, 68);                                         // 自己手里的一半
    const ox = offering ? 116 : t >= HP.lower ? lerp(116, 108, seg(t, HP.lower, HP.lower + .6)) : lerp(100, 116, seg(t, HP.offer - .2, HP.offer));
    pspr(b, popsicle(2), ri(ox), offering ? 68 : 70);                       // 递出去的另一半
    if (t > HP.offer + .8) { const dr = mod(t * 1.5, 1); prect(b, ri(ox) + 2, 79 + ri(dr * 6), 1, 1, '#FFD08A'); }   // 化了，往下滴
  }
  // 空凳子上照一束光
  pcone(b, 140, 30, 92, 6, 22, '#FFFFFF', .05, .14);
  // 外面：下雪的街、地上的雪、窗外的脚印
  prect(b, 0, 110, w, 25, '#C8D0E8'); for (let i = 0; i < 12; i++) prect(b, 10 + i * 19, 116 + (i % 2) * 6, 3, 2, '#9AA4C4');
  snow(b, t, w, h, { n: 120, v: 12, seed: 151 });
  const u = E.sine(seg(t, s.t, s.e)), z = lerp(1.25, 1.55, u), fx = lerp(112, 128, u);
  blitZoom(g, 'conv', 8, fx, 66, z, W / 2, H / 2 - 10); glowBlitZoom(g, 'conv', 8, fx, 66, z, W / 2, H / 2 - 10, .7, 3);
}

/* ================= 夏天的夜街（320×180）：灯笼、小摊、逛街的人 ================= */
function summerStreet(b, gl, t, o = {}) {
  const w = 320, h = 210;
  psky(b, w, 90, [[0, '#0A0C2A'], [.6, '#1E1C50'], [1, '#3A2A5E']]);
  starfield(b, t, w, 60, { n: 30, seed: 161 });
  pspr(b, skyline(w, 100, 162, '#161838', 70, .14), 0, 20);
  // 小摊：一排，暖黄的灯，招牌
  const stalls = [[10, '#C83A3A', '冰粉'], [80, '#3A7AC8', '烤串'], [150, '#C8883A', '冷饮'], [220, '#7A3AC8', '套圈'], [286, '#3AA87A', '西瓜']];
  stalls.forEach(([x, c, name]) => {
    prect(b, x, 96, 56, 40, '#2A2236'); prect(b, x + 2, 100, 52, 22, '#FFD9A0'); prect(gl, x + 2, 100, 52, 22, 'rgba(255,217,160,.5)');
    for (let i = 0; i < 7; i++) { prect(b, x - 2 + i * 9, 88, 5, 8, c); prect(b, x + 3 + i * 9, 88, 4, 8, '#F4F0E4'); }
    ptext(b, name, x + 28, 101, 1, '#5A2A1A', { align: 'center' });
    prect(b, x + 4, 122, 48, 14, shade(c, .6));
  });
  // 灯笼：一串串挂在头顶，轻轻晃
  for (let k = 0; k < 2; k++) for (let i = 0; i < 14; i++) {
    const x = i * 24 + 6 + k * 12, y = 40 + k * 22 + Math.sin(i * .8 + k) * 4 + Math.sin(t * 1.5 + i) * 1;
    prect(b, x, y - 2, 1, 2, '#3A2A2A'); prect(b, x - 2, y, 5, 6, k ? '#FF8A3A' : '#E83A3A'); prect(b, x - 2, y + 2, 5, 1, '#FFD08A');
    prect(gl, x - 3, y - 1, 7, 8, k ? 'rgba(255,160,80,.7)' : 'rgba(255,90,80,.7)');
  }
  for (let k = 0; k < 2; k++) for (let x = 0; x < w; x++) pdot(b, x, 38 + k * 22 + Math.sin(x / 24 * 4.8 + k) * 4 - 2 + (k ? 0 : 0), '#2A1E2A');
  prect(b, 0, 136, w, h - 136, '#2A2440'); prect(b, 0, 136, w, 1, '#3E3858');   // 路
  for (let i = 0; i < 20; i++) { b.globalAlpha = .12; prect(b, hash(i, 163) * w, 140 + hash(i, 164) * 36, 10, 1, '#FFD9A0'); b.globalAlpha = 1; }
}
/* 一排逛街的人（小号），在 y 附近，左右走 */
function strollers(b, t, n, y0, y1, w, seed, skip = null) {
  const list = [];
  for (let i = 0; i < n; i++) {
    const dir = hash(i, seed) < .5 ? -1 : 1, sp = 8 + hash(i, seed + 1) * 8, x = mod(hash(i, seed + 2) * (w + 40) + dir * sp * t, w + 40) - 20;
    list.push({ x, y: y0 + hash(i, seed + 3) * (y1 - y0), dir, col: CROWD[i % CROWD.length], k: i });
  }
  list.sort((a, c) => a.y - c.y).forEach(p => { if (skip && skip(p)) return; const wc = walkCycle(t + p.k * .17, 5); smonAt(b, p.x, p.y + wc.bob, { col: p.col, legs: wc.legs, eyes: p.dir > 0 ? 'r' : 'l' }, '#E8D8E8'); });
}

/* ================= shStreetSummer（153.05 ~ 155.05） ================= */
function shStreetSummer(g, t, s) {
  const w = 320, h = 210, b = pbuf('sstreet', w, h), gl = glowBuf('sstreet', w, h);
  summerStreet(b, gl, t);
  strollers(b, t, 14, 140, 150, w, 171);
  const wc = walkCycle(t, 4), x = lerp(220, 170, seg(t, s.t, s.e));
  monAt(b, x, 166 + wc.bob, { col: COL.her, eyes: 'l', legs: wc.legs });
  strollers(b, t, 6, 170, 178, w, 172);
  const camX = lerp(40, 20, seg(t, s.t, s.e));
  blitZoom(g, 'sstreet', 6, 160 + camX - 30, 100, 1.1, W / 2, H / 2); glowBlitZoom(g, 'sstreet', 6, 160 + camX - 30, 100, 1.1, W / 2, H / 2, .9, 3);
}

/* ================= shGiveHalf：把另一半给哭着的小孩（155.05 ~ 159.85） ================= */
const GH = { split: ch(30, 0) + .1, notice: ch(30, 3), walk: ch(30, 5), offer: ch(30, 6), take: ch(30, 8), happy: ch(30, 9) };
function shGiveHalf(g, t, s) {
  const w = 320, h = 210, b = pbuf('sstreet', w, h), gl = glowBuf('sstreet', w, h);
  summerStreet(b, gl, t);
  strollers(b, t, 10, 140, 148, w, 173);
  const kx = 198, ky = 166;
  // 小孩：冰淇淋掉在地上，哭；接过冰棍就笑了
  const got = t >= GH.take;
  pell(b, kx + 8, ky + 1, 4, 1, '#F4E8D0'); prect(b, kx + 7, ky - 2, 3, 3, '#F4B8C8');   // 地上摔了的冰淇淋
  smonAt(b, kx, ky, { col: KIDS[0], eyes: got ? 'n' : 'shut' });
  if (!got) { const k = Math.floor(t * 4) % 2; prect(b, kx - 3, ky - 6 + k, 1, 2, '#A8E0FF'); prect(b, kx + 2, ky - 6 + (1 - k), 1, 2, '#A8E0FF'); }
  else { miniPop(b, kx + 6, ky - 8); if (t >= GH.happy) { const hu = seg(t, GH.happy, GH.happy + 1.2); b.globalAlpha = 1 - hu; pspr(b, heart7('#FF7A9A'), kx - 3, ky - 20 - hu * 10); b.globalAlpha = 1; } }
  // 她：掰开冰棍 → 看见小孩 → 走过去 → 递给他
  const walk = E.io(seg(t, GH.walk, GH.offer)), hx = lerp(150, 180, walk), wc = walkCycle(t, 4);
  const moving = t > GH.walk && t < GH.offer;
  monAt(b, hx, 166 + (moving ? wc.bob : 0), { col: COL.her, eyes: t < GH.notice ? 'dn' : t < GH.happy ? 'r' : 'happy', legs: moving ? wc.legs : 0, armR: t >= GH.offer && !got ? 'reach' : 'hold', armL: 'hold' });
  if (t < GH.split) pspr(b, popsicle(0), hx - 5, 147);
  else {
    pspr(b, popsicle(1), hx - 8, 148);
    if (!got) pspr(b, popsicle(2), ri(t >= GH.offer ? hx + 15 : hx + 2), t >= GH.offer ? 150 : 148);
  }
  strollers(b, t, 5, 172, 178, w, 174);
  const z = 1.6 + .1 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'sstreet', 6, 176, 140, z, W / 2, H / 2 + 10); glowBlitZoom(g, 'sstreet', 6, 176, 140, z, W / 2, H / 2 + 10, .9, 3);
}

/* 迷你冰棍（小号小怪拿的）：2×5 */
function miniPop(b, x, y) { prect(b, x, y, 2, 4, '#F4A64A'); pdot(b, x, y, '#FFD08A'); pdot(b, x + 1, y + 4, '#E8D2A6'); }

/* ================= 烟花 ================= */
const FW_COLS = ['#FF7A9A', '#FFD27A', '#9AF0DC', '#B8A0FF', '#FF9A5A', '#A8E0FF'];
/* t0 炸开；之前 0.8 秒一个亮点往上升；炸开后粒子带重力往外散、变暗 */
function firework(b, gl, t, t0, x, y, col, size = 26, seed = 1) {
  const u = t - t0;
  if (u < -.8 || u > 2.2) return 0;
  if (u < 0) { const v = (u + .8) / .8; pdot(b, x, lerp(y + 60, y, E.out(v)), '#FFF4D0'); pdot(gl, x, lerp(y + 60, y, E.out(v)), '#FFF4D0'); return 0; }
  const n = 48, k = E.out(Math.min(1, u / .9)), fade = 1 - seg(u, .6, 2.2);
  for (let i = 0; i < n; i++) {
    const a = i / n * TAU + hash(i, seed) * .2, sp = size * (.7 + .3 * hash(i, seed, 2));
    const px = x + Math.cos(a) * sp * k, py = y + Math.sin(a) * sp * k + u * u * 6;
    for (const du of [.06, .12, .2]) { const kk = E.out(Math.max(0, Math.min(1, (u - du) / .9))); if (u - du <= 0) continue; b.globalAlpha = fade * (1 - du * 4) * .6; pdot(b, x + Math.cos(a) * sp * kk, y + Math.sin(a) * sp * kk + (u - du) * (u - du) * 6, col); }   // 拖尾
    const c = u > 1.2 && hash(i, seed, 3) < .5 ? '#FFFFFF' : col;
    if (fade <= 0) continue;
    b.globalAlpha = fade * (hash(i, Math.floor(u * 12), seed) < .85 ? 1 : .3); pdot(b, px, py, c);
    if (u < .8) { b.globalAlpha = fade * .5; pdot(b, x + Math.cos(a) * sp * k * .8, y + Math.sin(a) * sp * k * .8 + u * u * 5, col); }
    gl.globalAlpha = fade * .8; pdot(gl, px, py, col);
  }
  b.globalAlpha = 1; gl.globalAlpha = 1;
  if (u < .2) pdisc(gl, x, y, 10 * (1 - u / .2), rgba('#FFFFFF', .9));
  return fade;
}
/* 河边：对岸的城市、河、这边的栏杆 */
function riverScene(b, gl, t, o = {}) {
  const w = 320, h = 210;
  psky(b, w, 100, [[0, '#06081E'], [.6, '#141A44'], [1, '#2A2456']]);
  starfield(b, t, w, 70, { n: 40, seed: 181 });
  const lit = o.lit ?? 1;
  pspr(b, skyline(w, 60, 182, '#12142E', 50, .2 * lit), 0, 46);
  prect(b, 0, 104, w, 40, '#0C1230');                                  // 河
  for (let i = 0; i < 40; i++) { const x = mod(hash(i, 183) * w + t * 3, w), y = 106 + hash(i, 184) * 36; prect(b, x, y, 4 + hash(i, 185) * 6, 1, '#1A2448'); }
  prect(b, 0, 144, w, h - 144, '#2A2C40'); prect(b, 0, 144, w, 1, '#3E405A');   // 这边的岸
  for (let x = 0; x < w; x += 10) prect(b, x, 134, 2, 10, '#4A4C64'); prect(b, 0, 133, w, 2, '#5A5C74');   // 栏杆
}
/* ================= shFireworksFar（159.85 ~ 162.65） ================= */
const FW_FAR = [[159.7, 120, 44, 0, 34], [160.4, 210, 36, 1, 38], [161.0, 160, 54, 2, 30], [161.5, 250, 48, 3, 34], [162.0, 80, 40, 4, 32]];
function shFireworksFar(g, t, s) {
  const w = 320, h = 210, b = pbuf('river', w, h), gl = glowBuf('river', w, h);
  riverScene(b, gl, t);
  FW_FAR.forEach(([t0, x, y, ci, sz], i) => {
    const f = firework(b, gl, t, t0, x, y, FW_COLS[ci], sz, i + 1);
    if (f > 0) { b.globalAlpha = f * .25; prect(b, x - 6, 106, 12, 30, FW_COLS[ci]); b.globalAlpha = 1; }   // 河里的倒影
  });
  monAt(b, 150, 158, { col: COL.her, back: true }, '#C8C0E0');
  const z = 1.05 + .08 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'river', 6, 160, 92, z, W / 2, H / 2); glowBlitZoom(g, 'river', 6, 160, 92, z, W / 2, H / 2, 1, 3);
}

/* ================= shFestivalCrowd（162.65 ~ 165.85） ================= */
function shFestivalCrowd(g, t, s) {
  const w = 320, h = 210, b = pbuf('river', w, h), gl = glowBuf('river', w, h);
  riverScene(b, gl, t);
  const fws = [[162.5, 120, 78, 1, 30], [163.2, 220, 72, 0, 32], [164.0, 170, 84, 5, 26], [164.8, 250, 76, 2, 28], [165.4, 90, 80, 3, 26]];   // 在镜头框得到的地方炸开
  let flash = 0, fcol = '#FFFFFF';
  fws.forEach(([t0, x, y, ci, sz], i) => { const f = firework(b, gl, t, t0, x, y, FW_COLS[ci], sz, i + 7); if (f > flash) { flash = f; fcol = FW_COLS[ci]; } });
  // 一排排看烟花的人（背影），她从左往右挤过去；前面那个青绿色带呆毛的，"海"字被人挡住就不见了
  const rows = [148, 156, 164, 172];
  const him = { x: 196 + (t - s.t) * 6, y: 156 };
  const herX = lerp(96, 176, E.sine(seg(t, s.t, s.e))), wc = walkCycle(t, 4);
  rows.forEach((ry, r) => {
    for (let i = 0; i < 26; i++) {
      const x = i * 13 + (r % 2) * 6 + Math.sin(t * .8 + i + r) * 1.5, col = CROWD[(i + r * 3) % CROWD.length];
      if (r === 1 && Math.abs(x - him.x) < 7) continue;
      smonAt(b, x, ry, { col, eyes: 'back' }, mix('#C8C0E0', fcol, flash * .3));
    }
    if (r === 1 && t < ch(32, 4) + .1) smonAt(b, him.x, him.y, { col: COL.him, cowlick: true, eyes: 'back' }, mix('#E0E8F0', fcol, flash * .3));
    if (r === 2) monAt(b, herX, ry + 4 + wc.bob, { col: COL.her, eyes: t > 163.5 ? 'r' : 'up', legs: wc.legs }, mix('#E8E0F0', fcol, flash * .25));
  });
  const z = 1.35, fx = lerp(150, 175, seg(t, s.t, s.e));
  blitZoom(g, 'river', 6, fx, 112, z, W / 2, H / 2 + 20); glowBlitZoom(g, 'river', 6, fx, 112, z, W / 2, H / 2 + 20, 1, 3);
}

/* ================= shFaceFireworks（165.85 ~ 167.85） ================= */
function shFaceFireworks(g, t, s) {
  const w = 120, h = 68, b = pbuf('faceFw', w, h), gl = glowBuf('faceFw', w, h);
  psky(b, w, h, [[0, '#0A0C26'], [1, '#1E1A44']]);
  // 身后的烟花：虚着的大光点
  const bursts = [[165.9, 30, 18, 0], [166.5, 90, 12, 2], [167.1, 60, 8, 1], [167.6, 20, 30, 3]];
  let fl = 0, fc = '#FFFFFF';
  bursts.forEach(([t0, x, y, ci]) => { const u = t - t0; if (u < 0 || u > 1.4) return; const a = 1 - u / 1.4; b.globalAlpha = a * .5; pdisc(b, x, y, 3 + u * 8, FW_COLS[ci]); b.globalAlpha = 1; gl.globalAlpha = a; pdisc(gl, x, y, 4 + u * 8, FW_COLS[ci]); gl.globalAlpha = 1; if (a > fl) { fl = a; fc = FW_COLS[ci]; } });
  const tear = t > ch(33, 1) ? 2 : 1;
  monAt(b, 60, 54, { col: COL.her, eyes: 'up', glint: true, tear });
  // 烟花的光照在她身上：整块染一下
  if (fl > 0) { const q = pbuf('monLit', MCW, MCH); q.drawImage(mon({ col: COL.her, eyes: 'up', glint: true, tear }), 0, 0); q.globalCompositeOperation = 'source-atop'; q.fillStyle = rgba(fc, .2 * fl); q.fillRect(0, 0, MCW, MCH); pspr(b, BUF.monLit, 60 - 12 - MOX, 54 - 16 - MOY); }
  const z = 1.25 + .05 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'faceFw', 16, 60, 40, z, W / 2, H / 2); glowBlitZoom(g, 'faceFw', 16, 60, 40, z, W / 2, H / 2, 1, 3);
}

/* ================= shBokehMemories：泪眼里的光斑（167.85 ~ 172.65） ================= */
/* 小场景：两个小人 + 一样东西（48×48，小号小怪） */
function memoryVignette(k, t) {
  const q = pbuf('memv' + k, 48, 48);
  const bgs = [['#7EC4F0', '#62BC62'], ['#C8E0F0', '#C4BCAC'], ['#8CCEF4', '#C8C0B0'], ['#141C52', '#1C3E3A'], ['#3A2A6A', '#9A7A4A']];
  const [sky, gr] = bgs[k];
  prect(q, 0, 0, 48, 48, sky); prect(q, 0, 32, 48, 16, gr);
  const her = { col: COL.her, skirt: true }, him = { col: COL.him, cowlick: true };
  if (k === 0) { bench(q, 10, 36, 28); smonAt(q, 19, 33, Object.assign({ eyes: 'r' }, her)); smonAt(q, 30, 33, Object.assign({ eyes: 'l' }, him)); pspr(q, gardenia(0), 23, 22); }
  if (k === 1) { smonAt(q, 17, 38, her); smonAt(q, 31, 38, him); linkCable(q, 21, 36, 27, 36, 3); }
  if (k === 2) { smonAt(q, 17, 38, Object.assign({ eyes: 'r' }, her)); smonAt(q, 31, 38, Object.assign({ eyes: 'l' }, him)); prect(q, 21, 26, 2, 5, '#F4A64A'); prect(q, 26, 26, 2, 5, '#F4A64A'); }
  if (k === 3) { starfield(q, t, 48, 30, { n: 16, seed: 191 }); smonAt(q, 21, 38, Object.assign({ eyes: 'shut' }, her)); smonAt(q, 28, 38, Object.assign({ eyes: 'shut' }, him)); pspr(q, heart7(), 21, 20); }
  if (k === 4) { prect(q, 0, 32, 48, 16, '#E8D2A0'); smonAt(q, 18, 40, Object.assign({ eyes: 'l' }, her)); smonAt(q, 30, 40, Object.assign({ eyes: 'r' }, him)); }
  return BUF['memv' + k];
}
function shBokehMemories(g, t, s) {
  // 底：夜色和远处的灯，虚的
  const b = pbuf('bokehBg', 120, 68); psky(b, 120, 68, [[0, '#0A0C26'], [1, '#22204A']]);
  blit(g, 'bokehBg', 16);
  const spots = [[ch(34, 0), 420, 380, 220, 0, '#FF9AB0'], [ch(34, 2), 1000, 300, 200, 1, '#9AF0DC'], [ch(34, 4), 1480, 460, 230, 2, '#FFD27A'], [ch(34, 6), 700, 640, 210, 3, '#B8A0FF'], [ch(34, 7), 1240, 700, 190, 4, '#FF9A5A']];
  spots.forEach(([t0, x, y, r, k, col], i) => {
    const a = E.out(seg(t, t0 - .15, t0 + .35)) * (1 - seg(t, s.e - .5, s.e)); if (a <= 0) return;
    const dx = Math.sin(t * .4 + i) * 20, dy = Math.cos(t * .3 + i * 2) * 14, cx = x + dx, cy = y + dy;
    const rr = r * (.85 + .15 * a);
    // 光斑：一圈柔光 + 里面的小回忆
    g.save(); g.globalAlpha = a * .55; g.fillStyle = rgba(col, .35); g.beginPath(); g.arc(cx, cy, rr * 1.15, 0, TAU); g.fill(); g.restore();
    const v = memoryVignette(k, t);
    g.save(); g.globalAlpha = a * .9; g.beginPath(); g.arc(cx, cy, rr, 0, TAU); g.clip(); g.imageSmoothingEnabled = false;
    g.drawImage(v, cx - rr, cy - rr, rr * 2, rr * 2);
    g.globalCompositeOperation = 'soft-light'; g.fillStyle = rgba(col, .5); g.fillRect(cx - rr, cy - rr, rr * 2, rr * 2);
    g.restore();
    g.save(); g.globalAlpha = a * .7; g.strokeStyle = rgba(col, .8); g.lineWidth = 10; g.beginPath(); g.arc(cx, cy, rr, 0, TAU); g.stroke(); g.restore();
  });
  // 眼泪往下淌：画面上一道竖的水痕
  const tu = seg(t, ch(34, 4), s.e);
  if (tu > 0) { g.fillStyle = 'rgba(200,235,255,.08)'; g.fillRect(860, 0, 60, H * tu); }
}

/* ================= shLastFirework（172.65 ~ 179.54） ================= */
function shLastFirework(g, t, s) {
  const w = 320, h = 210, b = pbuf('river', w, h), gl = glowBuf('river', w, h);
  const lightsOut = seg(t, 174.6, 178.2);
  riverScene(b, gl, t, { lit: 1 - lightsOut * .9 });
  const f = firework(b, gl, t, ch(35, 2), 170, 36, '#FFD27A', 30, 41);
  if (f > 0) { b.globalAlpha = f * .25; prect(b, 164, 106, 12, 30, '#FFD27A'); b.globalAlpha = 1; }
  // 烟花散了以后的烟
  const smoke = seg(t, ch(35, 2) + 1, s.e);
  if (smoke > 0) for (let i = 0; i < 12; i++) { b.globalAlpha = (1 - smoke) * .3; pdisc(b, 150 + hash(i, 201) * 40 + smoke * 20, 30 + hash(i, 202) * 20 - smoke * 6, 4 + hash(i, 203) * 4, '#4A4A6A'); }
  b.globalAlpha = 1;
  // 人一个个走掉
  for (let i = 0; i < 14; i++) {
    const leave = 173.5 + hash(i, 204) * 3, x0 = 20 + i * 22, gone = t > leave;
    if (!gone) smonAt(b, x0, 160, { col: CROWD[i % CROWD.length], eyes: 'back' }, '#B8B8D0');
    else { const u = (t - leave) * 20, x = x0 + (i % 2 ? u : -u); if (x > -10 && x < 330) { const wc = walkCycle(t + i, 5); smonAt(b, x, 166, { col: CROWD[i % CROWD.length], legs: wc.legs, eyes: i % 2 ? 'r' : 'l' }, '#B8B8D0'); } }
  }
  // 她：最后拿出掌机
  const take = 177.2, on = t > 178.0;
  monAt(b, 160, 160, t < take ? { col: COL.her, back: true } : { col: COL.her, eyes: 'dn', armL: 'hold', armR: 'hold', glint: on }, '#C8C0E0');
  if (t >= take) { heldHandheld(b, 160, 153, '#E6DEC8', on ? '#BFF8EC' : null); if (on) { const k = seg(t, 178.0, s.e); pglow(gl, 160, 154, 6 + k * 30, '#BFF8EC', .6 + k * .4); } }
  const z = lerp(1.05, 1.5, E.io(seg(t, 176.5, s.e)));
  blitZoom(g, 'river', 6, lerp(160, 160, 0), lerp(96, 140, E.io(seg(t, 176.5, s.e))), z, W / 2, H / 2); glowBlitZoom(g, 'river', 6, 160, lerp(96, 140, E.io(seg(t, 176.5, s.e))), z, W / 2, H / 2, 1, 3);
}
