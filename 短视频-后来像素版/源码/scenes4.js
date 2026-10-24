'use strict';
/* scenes4.js：77.3~128.27 秒
   现在：shRooftop "让我往后的时光" 冬夜的天台，她一个人看着城市的天空（只剩两三颗星）
         shSigh    "每当有感叹" 她叹一口气，白气往上飘，变成一颗星
         shStarsReturn "总想起当天的星光" 那年夏天的星星一颗颗回来，连成两个小怪手拉手的星座
   回忆：shLinkPlay "那时候的爱情" 台阶上，两台掌机用连接线连着，一起打游戏
         shPopsicle "为什么就能那样简单" 小卖部门口，双棒冰棍掰成两半，一人一半
         shArgue    "而又是为什么" 阴天，吵架：气泡里是"！"和"……"，她转过身
         shCableSnap "人年少时" 两个人往两边走，连接线越拉越紧，"时"字绷断；"2P 已断开连接"
         shRainFlower "一定要让深爱的人受伤" 下雨，那朵栀子掉在水洼里，她走了
   现在：shSearchHer "在这相似的深夜里" 她坐在床上，掌机："搜索 2P 中…"
         shSearchHim "你是否一样" 另一座下雪的城市，他也在搜索："搜索 1P 中…"
         shMapSignals "也在静静追悔感伤" 地图上两个光点，各自一圈圈发信号，怎么也碰不到 */

/* ================= 天台（现在，冬夜）：320×180 ================= */
function rooftopScene(b, gl, t, o = {}) {
  const w = 320, h = 180;
  psky(b, w, h, [[0, '#060A22'], [.45, '#121A40'], [.78, '#3A2E5A'], [1, '#7A4E5E']]);   // 城市的光把天边照成暗橙紫
  starfield(b, t, w, 90, { n: o.stars ?? 5, seed: 91, tw: .4, big: .3, appear: o.appear });
  // 远处、近处的楼，窗户亮着；高楼顶上的红灯一闪一闪
  pspr(b, skyline(w, 120, 93, '#1A1E40', 80, .12), 0, 40);
  pspr(b, skyline(w, 120, 94, '#11142E', 64, .18, { minW: 12, varW: 22 }), 0, 60);
  if (gl) { gl.globalAlpha = .5; pspr(gl, skyline(w, 120, 94, '#11142E', 64, .18, { minW: 12, varW: 22 }), 0, 60); gl.globalAlpha = 1; }
  [[40, 82], [176, 70], [268, 88]].forEach(([x, y], i) => { if (Math.floor(t * 1.2 + i * .4) % 2 === 0) { pdot(b, x, y, '#FF4A4A'); prect(gl, x - 1, y - 1, 3, 3, '#FF4A4A'); } });
  // 飞机：一闪一闪地慢慢飞过
  const px = mod(30 + t * 6, 360) - 20; if (Math.floor(t * 2) % 2 === 0) { pdot(b, px, 34, '#FFFFFF'); pdot(gl, px, 34, '#FFFFFF'); } pdot(b, px + 2, 34, '#FF6A6A');
  // 天台：地面、栏杆、水箱、天线
  prect(b, 0, 150, w, 30, '#2A2C44'); prect(b, 0, 150, w, 2, '#3E405E');
  for (let x = 0; x < w; x += 8) prect(b, x, 136, 1, 14, '#4A4C6A'); prect(b, 0, 136, w, 2, '#5A5C7A'); prect(b, 0, 143, w, 1, '#4A4C6A');
  prect(b, 238, 104, 40, 36, '#3A3C58'); prect(b, 236, 100, 44, 5, '#4A4C6A'); prect(b, 244, 140, 3, 10, '#3A3C58'); prect(b, 268, 140, 3, 10, '#3A3C58');
  prect(b, 30, 96, 2, 54, '#3A3C58'); prect(b, 24, 100, 14, 1, '#3A3C58'); prect(b, 27, 108, 8, 1, '#3A3C58');
}

/* ================= shRooftop（77.30 ~ 81.35） ================= */
function shRooftop(g, t, s) {
  const w = 320, h = 180, b = pbuf('roof', w, h), gl = glowBuf('roof', w, h);
  rooftopScene(b, gl, t);
  // 她坐在栏杆边上，背对着我们，看着天
  monAt(b, 150, 152, { col: COL.her, beanie: HAT.her, back: true, legs: 'sit' }, '#B8BCE0');
  breathPuffs(b, gl, t, 150, 133, [78.5, 80.4]);
  const z = 1.35 + .1 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'roof', 6, 150, 112, z, W / 2, H / 2 + 40); glowBlitZoom(g, 'roof', 6, 150, 112, z, W / 2, H / 2 + 40, .8, 3);
}
/* 呼出的白气：一小团从 (x, y) 冒出来往上飘、散开 */
function breathPuffs(b, gl, t, x, y, times, star = false) {
  times.forEach((t0, i) => {
    const u = (t - t0) / 1.6; if (u < 0 || u > 1) return;
    const cx = x + 3 + u * 6, cy = y - u * 16;
    for (let k = 0; k < 7; k++) {
      const a = k / 7 * TAU + i, r = 1 + u * 4;
      b.globalAlpha = (1 - u) * .7; pdot(b, cx + Math.cos(a) * r * (.6 + hash(k, i) * .5), cy + Math.sin(a) * r * .5, '#E8ECF8');
    }
    b.globalAlpha = 1;
  });
}

/* ================= shSigh：一口气变成一颗星（81.35 ~ 84.40） ================= */
function shSigh(g, t, s) {
  const w = 120, h = 68, b = pbuf('sigh', w, h), gl = glowBuf('sigh', w, h);
  psky(b, w, h, [[0, '#070B26'], [.6, '#18204A'], [1, '#3A2E58']]);
  for (let i = 0; i < 10; i++) { const x = hash(i, 95) * w, y = 52 + hash(i, 96) * 16; b.globalAlpha = .35; pdisc(b, x, y, 1.5, i % 3 ? '#E8B060' : '#7FA0D8'); gl.globalAlpha = .4; pdot(gl, x, y, '#E8B060'); }
  b.globalAlpha = 1; gl.globalAlpha = 1;
  const sighs = [ch(15, 0), ch(15, 3), ch(15, 4)];
  // 每口气：冒出来 → 往上飘 → 缩成一颗星留在天上
  sighs.forEach((t0, i) => {
    const u = t - t0; if (u < 0) return;
    const sx = [64, 50, 76][i], sy = [12, 18, 8][i];
    if (u < 1.1) {
      const v = u / 1.1, cx = lerp(62, sx, E.out(v)), cy = lerp(48, sy, E.out(v)), r = lerp(2, 5, Math.sin(v * PI)) * (1 - v * .6);
      for (let k = 0; k < 9; k++) { const a = k / 9 * TAU + i * 2, rr = r * (.6 + .4 * hash(k, i, 1)); b.globalAlpha = .75 * (1 - v * .5); pdot(b, cx + Math.cos(a) * rr, cy + Math.sin(a) * rr * .6, '#E8ECF8'); }
      b.globalAlpha = 1;
    }
    if (u > .8) {                                                 // 变成星星：一闪
      const k = clamp((u - .8) / .3), tw = .7 + .3 * Math.sin(t * 5 + i);
      b.globalAlpha = k * tw; pdot(b, sx, sy, '#FFFFFF'); pdot(b, sx - 1, sy, '#DDE6FF'); pdot(b, sx + 1, sy, '#DDE6FF'); pdot(b, sx, sy - 1, '#DDE6FF'); pdot(b, sx, sy + 1, '#DDE6FF');
      gl.globalAlpha = k; prect(gl, sx - 2, sy - 2, 5, 5, '#FFFFFF'); b.globalAlpha = 1; gl.globalAlpha = 1;
    }
  });
  const ey = t < sighs[0] - .1 ? 'up' : 'up';
  monAt(b, 60, 62, { col: COL.her, beanie: HAT.her, eyes: ey, glint: true }, '#C8CCEA');
  const z = 1.02 + .06 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'sigh', 16, 60, 34, z, W / 2, H / 2); glowBlitZoom(g, 'sigh', 16, 60, 34, z, W / 2, H / 2, .9, 2);
}

/* ================= shStarsReturn：星星回来了，连成星座（84.40 ~ 89.83） ================= */
/* 星座：两个小怪的轮廓（12×8 方块图的角），按顺序连线 */
function monConstellation(ox, oy, k) {
  const P = [[2, 0], [10, 0], [10, 2], [12, 2], [12, 4], [10, 4], [10, 8], [8, 8], [7, 6], [5, 6], [4, 8], [2, 8], [2, 4], [0, 4], [0, 2], [2, 2], [2, 0]];
  return P.map(([x, y]) => [ox + x * k, oy + y * k]);
}
function shStarsReturn(g, t, s) {
  const w = 320, h = 180, b = pbuf('roof2', w, h + 60), gl = glowBuf('roof2', w, h + 60);
  // 天往上延伸 60 像素：镜头从城市慢慢抬到天上
  const ret = seg(t, s.t, ch(16, 6));
  psky(b, w, 60, [[0, '#050820'], [1, '#060A22']]);
  b.save(); b.translate(0, 60); rooftopScene(b, gl, t, { stars: 5 }); b.restore();
  // 那年夏天的星星一颗颗回来，银河淡淡地铺开
  b.save(); b.globalAlpha = .8 * ret; pspr(b, milkyWay(w, 150, 97, 0, 140, 320, 10, 24, '#7A6AD0'), 0, 0); b.restore();
  starfield(b, t, w, 150, { n: 220, seed: 98, tw: .5, big: .06, appear: (i) => clamp(ret * 1.3 - hash(i, 99) * .9) });
  // 星座：她（橙）和他（青），"星光"时连好、亮起来
  const draw = seg(t, ch(16, 3), ch(16, 7) + .3), glow = seg(t, ch(16, 6), ch(16, 7) + .4);
  [[monConstellation(118, 34, 3.2), '#FFB49A'], [monConstellation(166, 36, 3.2), '#9AF0DC']].forEach(([pts, col], j) => {
    const n = pts.length - 1, m = draw * n;
    for (let i = 0; i < n; i++) {
      if (i >= m) break;
      const u = clamp(m - i), [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
      b.globalAlpha = .55 + .45 * glow; pline(b, x0, y0, lerp(x0, x1, u), lerp(y0, y1, u), col); gl.globalAlpha = .5 * glow; pline(gl, x0, y0, lerp(x0, x1, u), lerp(y0, y1, u), col);
    }
    b.globalAlpha = 1; gl.globalAlpha = 1;
    pts.forEach(([x, y], i) => { if (i / n <= draw + .01) { pdot(b, x, y, '#FFFFFF'); gl.globalAlpha = .9; prect(gl, x - 1, y - 1, 3, 3, '#FFFFFF'); gl.globalAlpha = 1; } });
    // 眼睛：两颗亮一点的星
    if (draw > .6) { const ex = j ? 166 : 118; [[3.5, 2.5], [8.5, 2.5]].forEach(([x, y]) => { const xx = ex + x * 3.2, yy = (j ? 36 : 34) + y * 3.2; pdot(b, xx, yy, '#FFFFFF'); pdot(b, xx + 1, yy, '#FFFFFF'); gl.globalAlpha = glow; prect(gl, xx - 1, yy - 1, 4, 3, col); gl.globalAlpha = 1; }); }
  });
  // 牵着的手：两个星座之间一道线
  if (draw > .95) { b.globalAlpha = glow; pline(b, 118 + 12 * 3.2, 34 + 3 * 3.2, 166, 36 + 3 * 3.2, '#FFE8B0'); b.globalAlpha = 1; }
  // 她在天台上，抬头看
  monAt(b, 150, 212, { col: COL.her, beanie: HAT.her, back: true, legs: 'sit' }, '#B8BCE0');
  const camY = lerp(60, 6, E.io(seg(t, s.t, ch(16, 6))));
  blit(g, 'roof2', 6, 0, camY); glowBlit(g, 'roof2', 6, 0, camY, 1, 3);
}

/* ================= 回忆：台阶（192×108） ================= */
function schoolSteps(b, gl, t, o = {}) {
  const w = 192, h = 108;
  psky(b, w, 40, SUM.sky);
  pixelCloud(b, mod(40 + t * 2, 240) - 20, 12, 1.1); pixelCloud(b, mod(150 + t * 1.5, 240) - 20, 20, .8);
  schoolBuilding(b, 20, 52, 152, 2, {});
  // 台阶：三级，水泥色；扶手
  [[52, 60], [62, 70], [72, 82]].forEach(([y0, y1], i) => { prect(b, 0, y0, w, y1 - y0, ['#D8D0C0', '#CEC6B6', '#C4BCAC'][i]); prect(b, 0, y0, w, 1, '#ECE6DA'); });
  prect(b, 0, 82, w, 26, '#BEB6A6');
  prect(b, 6, 46, 2, 36, '#8A8478'); prect(b, 184, 46, 2, 36, '#8A8478'); pline(b, 7, 46, 7, 46, '#8A8478');
  // 树影和光斑
  b.save(); b.globalAlpha = .18; for (let i = 0; i < 8; i++) pell(b, hash(i, 101) * w, 60 + hash(i, 102) * 40, 14, 4, '#3A4A3A'); b.restore();
  sunDapples(b, t, 0, 58, w, 46, 103, 'rgba(255,250,210,.25)');
  // 树上的蝉（一只，偶尔动一下翅膀）
}
/* 小音符 3×5 */
const NOTE = () => sprRows('note', ['.##', '.#.', '.#.', '##.', '##.'], { '#': '#FFFFFF' });

/* ================= shLinkPlay：连接线连着两台掌机（89.83 ~ 96.95） ================= */
function shLinkPlay(g, t, s) {
  const w = 192, h = 108, b = pbuf('steps', w, h), gl = glowBuf('steps', w, h);
  schoolSteps(b, gl, t);
  const bump = env(t, ch(17, 3) - .1, ch(17, 3) + .1, ch(17, 3) + .5, ch(17, 3) + .8);
  const herX = 84 + ri(bump), himX = 108 - ri(bump), fy = 73;
  const happy = t > 91.0;
  monAt(b, herX, fy, { col: COL.her, skirt: true, legs: 'sit', armL: 'hold', armR: 'hold', eyes: happy ? (bump > .5 ? 'happy' : 'dnr') : 'dn' });
  monAt(b, himX, fy, { col: COL.him, cowlick: true, legs: 'sit', armL: 'hold', armR: 'hold', eyes: happy ? (bump > .5 ? 'happy' : 'dnl') : 'dn' });
  const scr1 = Math.floor(t * 4) % 2 ? '#BFF8EC' : '#FFE8A8', scr2 = Math.floor(t * 4 + 1) % 2 ? '#BFF8EC' : '#FFE8A8';
  heldHandheld(b, herX, fy - 7, '#E6DEC8', scr1); heldHandheld(b, himX, fy - 7, '#7FC8C0', scr2);
  prect(gl, herX - 2, fy - 6, 4, 3, scr1); prect(gl, himX - 2, fy - 6, 4, 3, scr2);
  linkCable(b, herX + 5, fy - 4, himX - 5, fy - 4, 6);                    // 中间连着的线，垂下来一点
  // 头顶飘起来的小音符和心
  for (let i = 0; i < 6; i++) {
    const u = mod((t - s.t) * .45 + i / 6, 1), x = 96 + Math.sin(u * 6 + i * 2) * 14 + (i % 2 ? 6 : -6), y = 52 - u * 36;
    b.globalAlpha = Math.sin(u * PI); pspr(b, i % 3 === 0 ? heart7('#FF7A9A') : NOTE(), x, y); b.globalAlpha = 1;
  }
  const z = 1.25 + .2 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'steps', 10, 96, 62, z, W / 2, H / 2); glowBlitZoom(g, 'steps', 10, 96, 62, z, W / 2, H / 2, .6, 3);
}

/* ================= 小卖部门口（192×108） ================= */
function shopFront(b, gl, t, o = {}) {
  const w = 192, h = 108;
  psky(b, w, 30, SUM.sky);
  prect(b, 0, 20, w, 66, '#E8DCC4');                                   // 墙
  // 蓝白条的遮阳棚
  for (let x = 0; x < w; x += 12) { prect(b, x, 22, 6, 9, '#4A8AD8'); prect(b, x + 6, 22, 6, 9, '#F4F4F0'); }
  for (let x = 0; x < w; x += 12) { pdisc(b, x + 3, 31, 3, '#4A8AD8'); pdisc(b, x + 9, 31, 3, '#F4F4F0'); }
  prect(b, 60, 34, 72, 14, '#C83A3A'); ptext(b, '小卖部', 96, 35, 1, '#FFF4D0', { align: 'center' });   // 招牌
  prect(b, 14, 44, 36, 40, '#5A6A7A'); prect(b, 16, 46, 32, 36, '#8AB8D8');                             // 店门、玻璃
  prect(b, 150, 46, 30, 26, '#7FB8E0'); prect(b, 150, 46, 30, 1, '#5A6A7A');                            // 窗
  for (let i = 0; i < 5; i++) prect(b, 152 + i * 6, 56, 4, 14, ['#F4A64A', '#E85A5A', '#5AB4E8', '#F4D04A', '#8AD07A'][i]);   // 窗里的零食
  prect(b, 0, 86, w, 22, '#C8C0B0'); prect(b, 0, 86, w, 1, '#DCD6CA');                                  // 门口的水泥地
  // 冰柜：白色，带玻璃盖
  prect(b, 60, 66, 46, 20, '#F4F4F0'); prect(b, 60, 66, 46, 2, '#D8D8D4'); prect(b, 62, 68, 42, 6, '#BFE0F0'); prect(b, 62, 68, 42, 1, '#FFFFFF');
  prect(b, 66, 78, 14, 5, '#3A8AD8'); ptext(b, '冷饮', 73, 76, 1, '#FFFFFF', { align: 'center' });
  // 门口的电风扇、树影
  b.save(); b.globalAlpha = .15; pell(b, 160, 96, 40, 6, '#3A3A2A'); b.restore();
}
/* ================= shPopsicle：双棒冰棍，一人一半（96.95 ~ 102.20） ================= */
const PS = { take: 97.6, split: ch(18, 5), give: ch(18, 6), eat: ch(18, 8) };
function shPopsicle(g, t, s) {
  const w = 192, h = 108, b = pbuf('shop', w, h), gl = glowBuf('shop', w, h);
  shopFront(b, gl, t);
  const herX = 124, himX = 148, fy = 96;
  const split = t >= PS.split, gave = t >= PS.give;
  monAt(b, herX, fy, { col: COL.her, skirt: true, eyes: gave ? (t > PS.eat ? 'happy' : 'r') : 'r', armR: gave ? 'hold' : 'n' });
  monAt(b, himX, fy, { col: COL.him, cowlick: true, eyes: t < PS.take ? 'l' : gave ? 'happy' : 'dn', armL: t >= PS.take ? (gave ? 'n' : 'up') : 'n', armR: t >= PS.take ? 'hold' : 'n' });
  // 冰棍：他从冰柜里拿出来（举着）→ 掰开 → 一半给她
  if (t >= PS.take) {
    const bite = t > PS.eat ? Math.min(2, Math.floor((t - PS.eat) * 2)) : 0;
    if (!split) pspr(b, popsicle(0), himX - 6, fy - 26);
    else {
      const sp = seg(t, PS.split, PS.split + .15), gv = E.io(seg(t, PS.give, PS.give + .35));
      pspr(b, popsicle(2, bite), himX - 1 + ri(sp * 2), fy - 26);                                   // 他手里的一半
      pspr(b, popsicle(1, bite), ri(lerp(himX - 7 - sp * 2, herX + 6, gv)), ri(lerp(fy - 26, fy - 20, gv)));   // 给她的一半
      const su = seg(t, PS.split, PS.split + .4);
      if (su < 1) for (let i = 0; i < 6; i++) { const a = i / 6 * TAU, r = 2 + su * 8; b.globalAlpha = 1 - su; pdot(b, himX + Math.cos(a) * r, fy - 22 + Math.sin(a) * r, '#FFFFFF'); }
      b.globalAlpha = 1;
    }
  }
  // 冰柜的冷气
  for (let i = 0; i < 5; i++) { const u = mod(t * .6 + i / 5, 1); b.globalAlpha = (1 - u) * .5; pdot(b, 66 + i * 8 + Math.sin(u * 6) * 2, 66 - u * 8, '#FFFFFF'); }
  b.globalAlpha = 1;
  const z = 1.3 + .12 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'shop', 10, 112, 66, z, W / 2, H / 2 + 10); glowBlitZoom(g, 'shop', 10, 112, 66, z, W / 2, H / 2 + 10, .6, 3);
}

/* ================= 阴天的小路（192×108）：吵架、绷断 ================= */
function grayPath(b, gl, t, o = {}) {
  const w = 192, h = 124;
  psky(b, w, 60, [[0, '#7A8296'], [1, '#A4A8B4']]);
  for (let i = 0; i < 4; i++) { b.globalAlpha = .5; pell(b, mod(i * 60 + t * 3, 260) - 30, 10 + i * 6, 34, 6, '#8C92A4'); b.globalAlpha = 1; }
  pspr(b, skyline(w, 30, 105, '#8A8E9C', 22, 0), 0, 34);
  // 两排树（灰绿），风吹得一晃一晃
  for (let i = 0; i < 7; i++) { const x = 10 + i * 30, sw = Math.sin(t * 2 + i) * 1; prect(b, x - 1, 46, 3, 18, '#5A5048'); pdisc(b, x + sw, 42, 10, '#5A7060'); pdisc(b, x + 3 + sw, 38, 7, '#6A8070'); }
  prect(b, 0, 64, w, h - 64, '#8A8C84'); prect(b, 0, 64, w, 1, '#A0A29A');
  for (let x = 0; x < w; x += 16) prect(b, x, 84, 9, 1, '#9A9C94');
}
const BANG = () => sprRows('bang', ['.##.', '.##.', '.##.', '.##.', '....', '.##.'], { '#': '#E84A4A' });
const DOTS = () => sprRows('dots3', ['.......', '#.#.#..'], { '#': '#5A5E6E' });
const SCRIB = () => sprRows('scrib', ['.#.#.', '#####', '.#.#.', '#####', '.#.#.'], { '#': '#3A3E4E' });
/* ================= shArgue：吵架（102.20 ~ 105.40） ================= */
function shArgue(g, t, s) {
  const w = 192, h = 124, b = pbuf('gpath', w, h), gl = glowBuf('gpath', w, h);
  grayPath(b, gl, t);
  const turn = t >= ch(19, 5);
  const herX = 84, himX = 112, fy = 92;
  monAt(b, herX, fy, turn ? { col: COL.her, skirt: true, back: true } : { col: COL.her, skirt: true, eyes: 'r', brows: true, armL: 'up', armR: 'up' }, '#D8D8E4');
  monAt(b, himX, fy, { col: COL.him, cowlick: true, eyes: t < 103.6 ? 'l' : 'sad', armR: t > 104.6 ? 'reach' : 'up', armL: 'up' }, '#D8D8E4');
  // 气泡：她"！"、他"#"、最后"……"
  const bub = [[102.45, 103.5, herX - 2, BANG(), -1], [103.0, 104.0, himX + 4, SCRIB(), 1], [103.6, 104.6, herX - 4, BANG(), -1], [104.4, s.e, himX + 2, DOTS(), 1]];
  bub.forEach(([a, c, x, spr, d]) => { const al = env(t, a, a + .1, c - .15, c); speechBubble(b, x, fy - 17, spr, al, d); });
  const z = 1.6 + .1 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'gpath', 10, 98, 76, z, W / 2, H / 2 + 20);
}
/* ================= shCableSnap：连接线绷断（105.40 ~ 109.80） ================= */
const CS = { taut: ch(19, 8), snap: ch(19, 9) };
function shCableSnap(g, t, s) {
  const w = 192, h = 124, b = pbuf('gpath', w, h), gl = glowBuf('gpath', w, h);
  grayPath(b, gl, t);
  const u = seg(t, s.t, CS.snap), fy = 92;
  const herX = ri(lerp(86, 50, E.sine(u)) - (t > CS.snap ? (t - CS.snap) * 8 : 0)), himX = ri(lerp(106, 142, E.sine(u)) + (t > CS.snap ? (t - CS.snap) * 8 : 0));
  const wc = walkCycle(t, 4);
  monAt(b, herX, fy + wc.bob, { col: COL.her, skirt: true, back: false, eyes: 'l', legs: wc.legs, armR: 'hold', armL: 'hold' }, '#D8D8E4');
  monAt(b, himX, fy + wc.bob, { col: COL.him, cowlick: true, eyes: t < CS.taut ? 'r' : 'l', legs: wc.legs, armL: 'hold', armR: 'hold' }, '#D8D8E4');
  heldHandheld(b, herX, fy - 7, '#E6DEC8'); heldHandheld(b, himX, fy - 7, '#7FC8C0');
  if (t < CS.snap) {
    const sag = lerp(8, 0, seg(t, s.t + .6, CS.taut));
    linkCable(b, herX + 5, fy - 4, himX - 5, fy - 4, sag);
    if (t > CS.taut) { const k = Math.floor(t * 30) % 2; pline(b, herX + 5, fy - 4 - k, himX - 5, fy - 4 + k, '#B8A8E8'); }   // 绷紧了，一抖一抖
  } else {
    // 断了：他那头的插头蹦出去，线掉在地上；火花
    const k = t - CS.snap, drop = Math.min(1, k * 3);
    linkCable(b, herX + 5, fy - 4, lerp(himX - 5, herX + 40, drop), lerp(fy - 4, fy + 2, drop), 2 + drop * 4);
    const px = himX - 5 - 16 * Math.min(1, k * 4), py = fy - 4 - 10 * Math.sin(Math.min(1, k * 4) * PI);
    prect(b, px - 1, py - 1, 3, 2, '#5A5070');
    if (k < .5) for (let i = 0; i < 8; i++) { const a = hash(i, 7) * TAU, r = k * 30 * (.5 + hash(i, 8)); b.globalAlpha = 1 - k * 2; pdot(b, himX - 5 + Math.cos(a) * r, fy - 4 + Math.sin(a) * r, i % 2 ? '#FFE27A' : '#FFFFFF'); gl.globalAlpha = b.globalAlpha; pdot(gl, himX - 5 + Math.cos(a) * r, fy - 4 + Math.sin(a) * r, '#FFE27A'); }
    b.globalAlpha = 1; gl.globalAlpha = 1;
  }
  const z = 1.25;
  blitZoom(g, 'gpath', 10, 96, 74, z, W / 2, H / 2 + 20); glowBlitZoom(g, 'gpath', 10, 96, 74, z, W / 2, H / 2 + 20, .8, 3);
  uiToast(g, t, CS.snap + .1, s.e - .05, '2P 已断开连接', { col: '#FF9A9A', fill: '#3A1420', line: '#FFB0B0' });
}

/* ================= shRainFlower：雨里的栀子（109.80 ~ 115.75） ================= */
function shRainFlower(g, t, s) {
  const w = 160, h = 104, b = pbuf('rainF', w, h), gl = glowBuf('rainF', w, h);
  psky(b, w, h, [[0, '#5A6276'], [.5, '#4A5266'], [1, '#3A4256']]);
  prect(b, 0, 52, w, h - 52, '#4A5060');                                       // 湿的地面
  for (let i = 0; i < 40; i++) prect(b, hash(i, 111) * w, 54 + hash(i, 112) * (h - 56), 6 + hash(i, 113) * 10, 1, '#565C6E');
  pell(b, 88, 72, 34, 8, '#3A4056'); pring(b, 88, 72, 34, 8, '#5A6278');           // 水洼
  // 水洼里的倒影：天光
  pell(b, 88, 72, 30, 6, '#46506A');
  // 她的腿和裙摆在画面上边，往左走开
  const leave = seg(t, 111.3, 113.0), fx = lerp(96, -30, E.in2(leave)), wc = walkCycle(t, 4);
  monAt(b, fx, 40 + (leave > 0 ? wc.bob : 0), { col: COL.her, skirt: true, eyes: 'dn', legs: leave > 0 ? wc.legs : 0, armR: leave > 0 ? 'n' : 'hold' }, '#C8CCD8');
  // 花：从她手里滑下来，掉进水洼
  const fall = seg(t, 110.3, 111.0);
  const gx = lerp(fx + 8, 90, fall), gyy = lerp(28, 69, E.in2(fall));
  pspr(b, tinted(gardenia(2), '#D8DCE8', 'gdRain'), ri(gx - 5), ri(gyy - 5));
  if (fall >= 1) {                                                               // 落水：溅起一圈，几片花瓣散开漂着
    const k = t - 111.0;
    if (k < .6) { b.globalAlpha = 1 - k / .6; pring(b, 90, 70, 6 + k * 30, 2 + k * 7, '#B8C0D8'); b.globalAlpha = 1; }
    [[78, 74], [100, 70], [94, 76]].forEach(([x, y], i) => petal(b, x + Math.sin(t + i) * 1.5 + i * k * 1.2, y, 1 + i, '#E8ECF4'));
  }
  // 雨：雨丝 + 水洼里一圈圈涟漪
  rain(b, t, w, h, { n: 140, v: 220, len: 6, slant: .15, col: 'rgba(200,210,235,.55)', seed: 4 });
  for (let i = 0; i < 9; i++) { const per = .7 + hash(i, 114) * .5, u = mod(t + hash(i, 115) * per, per) / per, x = 60 + hash(i, Math.floor((t + hash(i, 115) * per) / per)) * 56, y = 66 + hash(i, 116) * 12; b.globalAlpha = (1 - u) * .7; pring(b, x, y, 1 + u * 5, .5 + u * 1.5, '#9AA4C0'); }
  b.globalAlpha = 1;
  const z = 1.04 + .3 * E.sine(seg(t, s.t, s.e)), cfx = lerp(80, 88, E.sine(seg(t, 111.5, s.e))), cfy = lerp(50, 62, E.sine(seg(t, 111.5, s.e)));   // 她走了以后，慢慢推近水洼里的花
  blitZoom(g, 'rainF', 12, cfx, cfy, z, W / 2, H / 2 + 20);
}

/* ================= 现在：深夜里的"搜索中" ================= */
/* 雷达框（屏幕坐标）：框里一圈圈扫描，下面一行字 */
function radarBox(g, t, cx, cy, label, col, a = 1) {
  if (a <= 0) return;
  const u = 6, w = 420, h = 300;
  g.save(); g.globalAlpha *= a;
  uiBox(g, cx - w / 2, cy - h / 2, w, h, u, { fill: '#0E142E' });
  const rx = cx, ry = cy - 24, R0 = 96;
  // 同心圆、十字
  g.fillStyle = rgba(col, .35);
  for (let r = 32; r <= R0; r += 32) for (let k = 0; k < 64; k++) { const an = k / 64 * TAU; g.fillRect(ri((rx + Math.cos(an) * r) / u) * u, ri((ry + Math.sin(an) * r) / u) * u, u, u); }
  g.fillRect(rx - R0, ry, R0 * 2, u / 2); g.fillRect(rx, ry - R0, u / 2, R0 * 2);
  // 扫描线：转一圈 1.6 秒，后面拖一片渐淡的扇形
  const ang = t / 1.6 * TAU;
  for (let k = 0; k < 18; k++) { const an = ang - k * .07; g.fillStyle = rgba(col, .5 * (1 - k / 18)); for (let r = 0; r < R0; r += u) g.fillRect(ri((rx + Math.cos(an) * r) / u) * u, ri((ry + Math.sin(an) * r) / u) * u, u, u); }
  ptext(g, label + '...'.slice(0, 1 + Math.floor(t * 2.5) % 3), cx - 110, cy + 92, 4, '#F4F1E8');
  g.restore();
}
/* ================= shSearchHer（115.75 ~ 120.15） ================= */
function nightBedroom(b, gl, t, o = {}) {
  const w = 192, h = 108;
  prect(b, 0, 0, w, h, o.wall || '#1C1E3A');
  const [wx, wy, ww, wh] = o.win || [120, 18, 50, 40];
  // 窗：外面是夜（她那边是城市，他那边下雪）
  const sk = pbuf('bedWin', ww, wh); psky(sk, ww, wh, o.sky || SKY_CITY);
  if (o.snow) { pspr(sk, skyline(ww, wh, 121, '#1A1E38', wh * .4, .2), 0, 0); snow(sk, t, ww, wh, { n: 40, v: 10, seed: 3 }); }
  else { starfield(sk, t, ww, wh * .5, { n: 10, seed: 122 }); pspr(sk, skyline(ww, wh, 123, '#141838', wh * .5, .16), 0, 0); }
  pspr(b, BUF.bedWin, wx, wy);
  prect(b, wx - 2, wy - 2, ww + 4, 2, '#3A3A58'); prect(b, wx - 2, wy + wh, ww + 4, 3, '#3A3A58'); prect(b, wx - 2, wy, 2, wh, '#3A3A58'); prect(b, wx + ww, wy, 2, wh, '#3A3A58'); prect(b, wx + ri(ww / 2) - 1, wy, 2, wh, '#3A3A58');
  b.save(); b.globalCompositeOperation = 'screen'; b.globalAlpha = .1; ppoly(b, [[wx, wy + wh], [wx + ww, wy + wh], [wx + ww - 20, h], [wx - 30, h]], '#8FA8E8'); b.restore();
  prect(b, 0, 86, w, 22, o.floor || '#2A2438');
}
function shSearchHer(g, t, s) {
  const w = 192, h = 108, b = pbuf('bedH', w, h), gl = glowBuf('bedH', w, h);
  nightBedroom(b, gl, t, { win: [126, 16, 52, 40] });
  // 床：床头、被子；她坐在被子里，捧着掌机
  prect(b, 20, 60, 6, 30, '#4A3A50'); prect(b, 20, 74, 110, 16, '#5A4A68'); prect(b, 26, 70, 26, 8, '#E8E4F0');   // 床头、床、枕头
  monAt(b, 58, 82, { col: COL.her, armL: 'hold', armR: 'hold', eyes: 'dn', glint: true }, '#B8BCE0');
  heldHandheld(b, 58, 75, '#E6DEC8', '#BFF8EC'); prect(gl, 55, 76, 6, 4, '#BFF8EC');
  ppoly(b, [[30, 80], [130, 80], [132, 90], [24, 90]], '#4A5A8A'); for (let x = 34; x < 128; x += 9) prect(b, x, 82, 1, 8, '#56669A');   // 被子
  pglow(b, 58, 74, 14, '#9AF0DC', .25);
  blit(g, 'bedH', 10); glowBlit(g, 'bedH', 10, 0, 0, .8, 3);
  radarBox(g, t, 1120, 380, '搜索 2P 中', '#9AF0DC', E.out(seg(t, s.t + .2, s.t + .5)));
  // 框和她的掌机之间连一串小点
  const a = seg(t, s.t + .3, s.t + .6); g.fillStyle = rgba('#9AF0DC', .7 * a); for (let i = 0; i < 6; i++) { const u = i / 6; g.fillRect(ri(lerp(640, 900, u) / 6) * 6, ri(lerp(700, 520, u) / 6) * 6, 6, 6); }
}
/* ================= shSearchHim（120.15 ~ 123.00） ================= */
function shSearchHim(g, t, s) {
  const w = 192, h = 108, b = pbuf('bedM', w, h), gl = glowBuf('bedM', w, h);
  nightBedroom(b, gl, t, { win: [14, 16, 52, 40], snow: true, sky: [[0, '#0E1430'], [1, '#2A3050']], wall: '#20223A' });
  // 书桌、台灯（暗着）、他坐在桌前
  prect(b, 96, 70, 80, 4, '#6A5040'); prect(b, 100, 74, 3, 14, '#5A4030'); prect(b, 170, 74, 3, 14, '#5A4030');
  prect(b, 150, 54, 2, 16, '#3A3A48'); ppoly(b, [[144, 54], [156, 54], [154, 48], [146, 48]], '#4A4A5A');
  prect(b, 108, 64, 16, 6, '#E8E4D8'); prect(b, 110, 62, 12, 2, '#D8D4C8');                          // 一摞书
  monAt(b, 134, 86, { col: COL.him, cowlick: true, armL: 'hold', armR: 'hold', eyes: 'dn', glint: true }, '#B8BCE0');
  heldHandheld(b, 134, 79, '#7FC8C0', '#BFF8EC'); prect(gl, 131, 80, 6, 4, '#BFF8EC');
  pglow(b, 134, 78, 14, '#9AF0DC', .25);
  blit(g, 'bedM', 10); glowBlit(g, 'bedM', 10, 0, 0, .8, 3);
  radarBox(g, t, 780, 380, '搜索 1P 中', '#FFB49A', E.out(seg(t, s.t + .1, s.t + .4)));
  const a = seg(t, s.t + .2, s.t + .5); g.fillStyle = rgba('#FFB49A', .7 * a); for (let i = 0; i < 6; i++) { const u = i / 6; g.fillRect(ri(lerp(1300, 1000, u) / 6) * 6, ri(lerp(740, 540, u) / 6) * 6, 6, 6); }
}
/* ================= shMapSignals：地图上两圈信号（123.00 ~ 128.27） ================= */
function shMapSignals(g, t, s) {
  const w = 240, h = 135, b = pbuf('map', w, h), gl = glowBuf('map', w, h);
  // 游戏里的世界地图：深蓝的海、深绿的陆地、山、河、城市的光
  prect(b, 0, 0, w, h, '#0A1636');
  for (let i = 0; i < 60; i++) { const x = mod(hash(i, 131) * w + t * 2, w), y = hash(i, 132) * h; pdot(b, x, y, '#14244A'); pdot(b, x + 1, y, '#14244A'); }   // 海浪
  const land = [[20, 20], [90, 8], [170, 14], [222, 30], [214, 70], [190, 104], [150, 126], [96, 128], [60, 112], [30, 90], [14, 56]];
  ppoly(b, land.map(([x, y]) => [x + 2, y + 2]), '#0C1A30'); ppoly(b, land, '#1A3A34');
  ppoly(b, [[30, 26], [88, 14], [160, 20], [206, 36], [200, 70], [178, 98], [142, 118], [100, 120], [66, 106], [38, 86], [24, 56]], '#1E443A');
  for (let i = 0; i < 14; i++) { const x = 60 + hash(i, 133) * 120, y = 30 + hash(i, 134) * 70; ppoly(b, [[x, y - 5], [x + 5, y + 3], [x - 5, y + 3]], '#2E5A4C'); pdot(b, x, y - 4, '#E8ECF0'); }   // 山
  pline(b, 70, 40, 100, 66, '#2A5A8A'); pline(b, 100, 66, 140, 74, '#2A5A8A'); pline(b, 140, 74, 168, 104, '#2A5A8A');   // 河
  for (let i = 0; i < 40; i++) { const x = 40 + hash(i, 135) * 160, y = 26 + hash(i, 136) * 90; pdot(b, x, y, '#E8B060'); gl.globalAlpha = .5; pdot(gl, x, y, '#E8B060'); gl.globalAlpha = 1; }   // 城市的灯
  // 两个光点：她（南边，橙）、他（北边，青）
  const A = [150, 104], B = [86, 30];
  [[A, '#FFB49A'], [B, '#9AF0DC']].forEach(([[x, y], col], j) => {
    pdisc(b, x, y, 2, col); pdisc(gl, x, y, 4, col);
    for (let k = 0; k < 3; k++) {                                       // 信号：一圈圈往外荡，荡到一半就淡没了
      const u = mod((t - s.t) * .6 + k / 3 + j * .17, 1), r = 3 + u * 34;
      b.globalAlpha = (1 - u) * .8; pring(b, x, y, r, r * .8, col); gl.globalAlpha = (1 - u) * .5; pring(gl, x, y, r, r * .8, col);
    }
    b.globalAlpha = 1; gl.globalAlpha = 1;
  });
  ptext(b, '她', A[0] + 6, A[1] - 2, 1, '#FFD4C4'); ptext(b, '他', B[0] + 6, B[1] - 2, 1, '#C4F8EC');
  // 镜头：从她那边拉远，看见两个人隔得这么远
  const z = lerp(2.4, 1.15, E.io(seg(t, s.t, s.t + 3.2))), fx = lerp(A[0], 118, E.io(seg(t, s.t, s.t + 3.2))), fy = lerp(A[1] - 6, 68, E.io(seg(t, s.t, s.t + 3.2)));
  blitZoom(g, 'map', 8, fx, fy, z, W / 2, H / 2 - 20); glowBlitZoom(g, 'map', 8, fx, fy, z, W / 2, H / 2 - 20, .9, 3);
}
