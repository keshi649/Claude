'use strict';
/* shots1.js：主歌（0~16.2 秒）：烛灯下等他、西窗、举杯邀月、两地同一个月亮、回忆里他写字弹琴、送别、他在京城考试。
   还有共用的"她家"全景 home()：绣楼（西窗）、粉墙、梅树、池塘、鸳鸯，按 PAL 换成夜、灯会、春日、雪夜。
   每个镜头函数 (c, lt, t)：c 是要画到的屏幕 canvas，lt 是镜头内的时间，t 是歌曲时间。 */

/* 她家的全景：画在 560×315 的世界缓冲上（比屏幕大一圈，好推拉镜头） */
const HOME_W = 560, HOME_H = 315;
function home(t, P, o = {}) {
  const g = pbuf('home', HOME_W, HOME_H);
  skyFill(g, P.sky);
  if (P !== PAL.spring) stars(g, t, 3, 140, 0, 0, HOME_W, 170, P.star);
  const moon = o.moon || [430, 64, 26];
  if (P !== PAL.spring && moon) moonDisc(g, moon[0], moon[1], moon[2], P);
  if (o.sky) o.sky(g);
  ridge(g, 11, 200, 56, .011, P.mtn[0]);
  mist(g, 178, 34, P.mist, .35);
  ridge(g, 12, 222, 30, .019, P.mtn[1]);
  g.rect(0, 228, HOME_W, 30, P.ground);
  wallSeg(g, 0, HOME_W, 208, 238, P, { snow: P === PAL.snow, win: [330, 470] });
  const tw = tower(g, 180, 250, t, P, { snow: P === PAL.snow, w: 70, inside: o.inside, lanterns: o.lanterns, lit2: o.lit2 });
  if (o.behindTree) o.behindTree(g, tw);
  plumTree(g, 486, 268, 19, P, { scale: 1.1, snow: P === PAL.snow, bloom: o.bloom, bloomL: o.bloomL });
  const refl = [[180, P.paper, 14]];
  if (P !== PAL.spring && moon) refl.push([moon[0], P.moon, 12]);
  water(g, 0, 254, HOME_W, HOME_H - 254, t, P, refl);
  g.hl(0, HOME_W, 254, P.groundL);
  if (o.front) o.front(g, tw);
  return { g, tw, moon };
}
function homeGlows(c, P, tw, moon, a = 1) {
  if (P !== PAL.spring && moon) glow(c, moon[0], moon[1], moon[2] * 2.6, P.moon, .22 * a);
  if (P !== PAL.spring) glow(c, tw.win.x + tw.win.w / 2, tw.win.y + tw.win.h / 2, 26, '#FFB050', .3 * a);
  for (const [lx, ly] of tw.lanterns) glow(c, lx, ly, 12, '#FF5A30', .45 * a);
}
/* 窗纸上她的剪影 */
function silInside(t, col = '#6A2E1E') {
  return (g, w) => mon(g, w.x + w.w * .42, w.y + w.h + 3, { col: MON.niang, girl: true, sway: swayAt(t), ol: false }, 1, { sil: col });
}

/* 片名：马善政楷书，取阈值变成像素字 */
function titleCard(c, t, x, y, alpha) {
  if (alpha <= 0) return;
  const tt = textPBc('鸳鸯戏', { font: 'ms', size: 44, col: '#F7D27A', ol: '#4A0E1E', sh: '#14060E', gap: 2 });
  drawTextPB(c, tt, x, y, 4, alpha);
  const sub = textPBc('像素小怪 · 古风 MV', { col: '#FFE9C4', ol: '#1A0A1E' });
  drawTextPB(c, sub, x + (tt.w * 4 - sub.w * 3) / 2, y + tt.h * 4 + 4, 3, alpha);
}

/* ---------- 1. 开场 0~3.07：夜里的绣楼，西窗亮着，窗纸上是她的剪影；池塘里只有一只鸳鸯。片名第一帧就在 ---------- */
function shotOpen(c, lt, t) {
  const P = PAL.night;
  const { g, tw, moon } = home(t, P, {
    moon: [338, 98, 22],
    inside: silInside(t),
    front: g => { duck(g, 300 + Math.sin(t * .6) * 10, 282, t, true, Math.cos(t * .6) < 0); fireflies(g, null, t, 4, 12, 260, 226, 140, 26); },
  });
  petals(g, t, 5, 30, P, { w: HOME_W, h: HOME_H });
  const f = ease(lt / 3.07), z = 1.3 + .22 * f, cx = lerp(192, 184, f), cy = lerp(176, 170, f);
  show(c, g, cx - 240 / z, cy - 135 / z, z);
  homeGlows(c, P, tw, moon);
  vignette(c, .42);
  // 片名：第一帧就在，2.3 秒起像素溶解掉
  const fa = 1 - seg(lt, 2.3, 2.9);
  if (fa > 0) {
    const off = mk(W, H), oc = off.getContext('2d');
    const tt = textPBc('鸳鸯戏', { font: 'ms', size: 44, col: '#F7D27A', ol: '#4A0E1E', sh: '#14060E', gap: 2 });
    titleCard(oc, t, Math.round((W - tt.w * 4) / 2 / 4) * 4 - 40, 70, 1);
    if (fa < 1) { oc.globalCompositeOperation = 'destination-in'; oc.imageSmoothingEnabled = false; oc.drawImage(ditherMask(fa), 0, 0, W, H); }
    c.drawImage(off, 0, 0);
  }
}

/* ---------- 2. 西窗（3.07~4.94）：两扇窗推开，她趴在窗台上望月亮，"泣"的时候掉一滴泪 ---------- */
function shotWindow(c, lt, t) {
  const g = pbuf('main'), P = PAL.night;
  // 外墙：竖木板，右上来的月光让右边偏冷
  g.clear('#2A1626');
  for (let x = 0; x < PW; x += 12) { g.rect(x, 0, 11, PH, '#3A2030'); g.rect(x + 11, 0, 1, PH, '#24121E'); }
  g.rectD(300, 0, 180, PH, '#3A3458', .25);
  // 窗洞里：暖光的屋子（后墙、挂着的山水画、烛台、红灯笼）
  const wx = 104, wy = 26, ww = 272, wh = 170;
  g.rect(wx, wy, ww, wh, '#6A3A2A'); g.rectD(wx, wy, ww, wh, '#7E4630', .5);
  g.rect(wx + 176, wy + 18, 64, 104, '#3A2018'); g.rect(wx + 180, wy + 22, 56, 96, '#E8D8B8');   // 挂轴：一幅小山水
  const sx0 = wx + 180;
  g.poly([[sx0, wy + 100], [sx0 + 14, wy + 62], [sx0 + 26, wy + 84], [sx0 + 38, wy + 54], [sx0 + 56, wy + 92], [sx0 + 56, wy + 118], [sx0, wy + 118]], '#B8AE98');
  g.poly([[sx0, wy + 110], [sx0 + 20, wy + 86], [sx0 + 34, wy + 102], [sx0 + 46, wy + 90], [sx0 + 56, wy + 104], [sx0 + 56, wy + 118], [sx0, wy + 118]], '#7A7262');
  g.disc(wx + 222, wy + 40, 5, '#C0392B');
  g.rect(wx + 176, wy + 14, 64, 4, '#5A3A1A'); g.rect(wx + 176, wy + 122, 64, 4, '#5A3A1A');
  const fl = candle(g, wx + 40, wy + 150, t, 2, 1);
  g.rect(wx + 30, wy + 150, 22, 4, '#5A2A18'); g.rect(wx + 38, wy + 154, 6, 20, '#5A2A18');
  const lan = lantern(g, wx + 120, wy - 2, t, 2, true, 3);
  // 她：k=4，手臂搭在窗台上，抬眼望月
  const k = 4, mx = 236, my = 212;
  const tear = t >= 3.94;
  mon(g, mx, my, { col: MON.niang, girl: true, sway: swayAt(t), eyes: blinkAt(t, 3) ? 'blink' : tear ? 'sad' : 'up' }, k);
  if (tear) {   // 一滴泪从左眼滑下来
    const p = seg(t, 3.94, 4.7), [ex, ey] = monPt(mx, my, 7, 4, k);
    g.rect(ex, ey + Math.round(p * 18), 3, 5, '#9FDCFF'); g.px(ex + 1, ey + Math.round(p * 18) + 1, '#E6F8FF');
  }
  // 窗台（挡住她的下半身）
  for (let x = 0; x < PW; x += 12) { g.rect(x, wy + wh, 11, PH, '#3A2030'); g.rect(x + 11, wy + wh, 1, PH, '#24121E'); }
  g.rectD(300, wy + wh, 180, PH, '#3A3458', .25);
  g.rect(wx - 14, wy + wh, ww + 28, 14, '#6A2A26'); g.rect(wx - 14, wy + wh, ww + 28, 2, '#C8706A');
  g.rect(wx - 14, wy + wh + 14, ww + 28, 4, '#4A1A1A');
  // 两扇推开的窗：斜着的窗扇、窗格
  const shutter = (x0, dir) => {
    const x1 = x0 + dir * 58;
    g.poly([[x0, wy], [x1, wy - 14], [x1, wy + wh + 14], [x0, wy + wh]], '#5A2A20');
    for (let i = 1; i < 7; i++) { const xx = lerp(x0, x1, i / 7), dy = 14 * i / 7; g.line(xx, wy - dy + 3, xx, wy + wh + dy - 3, '#E0A86A'); }
    for (let j = 1; j < 12; j++) { const f = j / 12; g.line(x0, wy + wh * f, x1, wy - 14 + (wh + 28) * f, '#E0A86A'); }
  };
  shutter(wx - 2, -1); shutter(wx + ww + 2, 1);
  g.rect(wx - 6, wy - 8, ww + 12, 8, P.pillarD); g.rect(wx - 6, wy - 8, ww + 12, 2, '#9A3A40');
  // 前景：右上角一枝梅花伸进来，花瓣飘
  plumTree(g, 560, 160, 19, P, { scale: .7, lean: -1.4, depth: 4, flip: true });
  petals(g, t, 8, 22, P);
  show(c, g, Math.sin(lt * .8) * 1.5, 0, 1);
  glow(c, fl[0], fl[1], 40, '#FFB050', .45);
  glow(c, lan[0], lan[1], 20, '#FF5A30', .4);
  glow(c, 480, 0, 150, '#AFC4FF', .2);
  vignette(c, .5);
}

/* ---------- 3. 举杯（4.94~6.82）：栏杆后面她举杯对着大月亮，旁边一只没人碰的杯子 ---------- */
function shotToast(c, lt, t) {
  const g = pbuf('main'), P = PAL.night;
  skyFill(g, P.sky);
  stars(g, t, 21, 90, 0, 0, PW, 160, P.star);
  const pulse_ = t >= 5.35 ? .25 * Math.exp(-(t - 5.35) * 2) : 0;
  moonDisc(g, 330, 104, 66, P);
  cloud(g, 200, 150, 110, '#3A3C78', '#2A2C60', 3, .85);
  cloud(g, 380, 80 + Math.sin(t) * 2, 90, '#4A4C8C', '#3A3C78', 5, .7);
  ridge(g, 31, 222, 30, .015, P.mtn[1]);
  // 她（举杯）
  const k = 3, mx = 168, my = 214, up = easeOutBack(seg(lt, 0, .35));
  const look = t >= 5.8 ? 'up' : 'r';
  mon(g, mx, my + hop(t, 0), { col: MON.niang, girl: true, sway: swayAt(t), arms: 'upR', eyes: blinkAt(t, 5) ? 'blink' : look }, k);
  const [hx, hy] = monPt(mx, my, 23, -1, k);
  cup(g, hx, hy - 6 - Math.round(up * 3), 3, '#F2E8D0');
  if (t >= 4.81 && t < 5.4) { const s = seg(t, 4.81, 5.1); g.px(hx + 7, hy - 14 - s * 6, '#FFFFFF'); g.px(hx + 9, hy - 10 - s * 6, '#FFF2C8'); }
  // 栏杆（前景）
  g.rect(0, 196, PW, 8, '#5A1E26'); g.rect(0, 196, PW, 2, '#9A3A40');
  for (let x = 6; x < PW; x += 26) { g.rect(x, 204, 6, 66, '#4A1A20'); g.rect(x, 204, 2, 66, '#7A2A30'); }
  g.rect(0, 226, PW, 4, '#4A1A20');
  for (let x = 12; x < PW; x += 26) for (let i = 0; i < 3; i++) g.rect(x + 2 + i * 7, 212, 3, 14, '#3A1218');
  // 栏杆上那只没人碰的杯子
  cup(g, 268, 186, 3, '#F2E8D0');
  petals(g, t, 12, 22, P);
  show(c, g);
  glow(c, 330, 104, 150, P.moon, .2 + pulse_);
  glow(c, hx, hy - 4, 16, '#FFF2C8', .25);
  vignette(c, .45);
}

/* ---------- 4. 同一个月亮（6.82~8.69）：上半是同一片夜空和月亮；下半左边她在家倚着栏杆，右边他在京城客栈的窗口 ---------- */
function shotSplit(c, lt, t) {
  const g = pbuf('main'), P = PAL.night;
  skyFill(g, P.sky);
  stars(g, t, 31, 110, 0, 0, PW, 150, P.star);
  moonDisc(g, 240, 58, 34, P);
  cloud(g, 120, 96 + Math.sin(t) * 1, 70, '#3A3C78', '#2A2C60', 3, .7); cloud(g, 330, 88, 80, '#3A3C78', '#2A2C60', 4, .7);
  // ---- 左：她家（暖），屋檐一角、灯笼、红栏杆 ----
  ridge(g, 32, 200, 26, .03, P.mtn[1], 0, 238);
  roof(g, 30, 118, 70, 16, P, { rw: 30, curl: 8, lit: true });
  const lanL = lantern(g, 90, 132, t, 1, true, 2);
  const k = 3, hx = 128, hy = 210;
  mon(g, hx, hy, { col: MON.niang, girl: true, sway: swayAt(t), eyes: blinkAt(t, 2) ? 'blink' : 'up' }, k);
  g.rect(0, 186, 238, 6, '#7A2630'); g.rect(0, 186, 238, 2, '#B84A50');
  for (let x = 4; x < 238; x += 18) g.rect(x, 192, 5, 78, '#5A1A24');
  g.rect(0, 222, 238, 4, '#5A1A24'); g.rect(0, 244, 238, 26, '#3A1420');
  // ---- 右：京城客栈（冷），一排屋顶，木窗框里的他 ----
  for (let i = 0; i < 4; i++) roof(g, 270 + i * 60, 176 + (i % 2) * 8, 34, 10, P, { rw: 16, curl: 4, col: '#14162E', colL: '#2A2E5A', eave: '#3A3E6A', tile: '#0A0A1E' });
  g.rect(242, 188, 238, 82, '#141832');
  g.rect(300, 128, 140, 142, '#3A2A3A'); g.rect(308, 136, 124, 134, '#1A2040');
  g.rectD(308, 136, 124, 134, '#2A3060', .3);
  const k2 = 3, mx = 372, my = 206;
  mon(g, mx, my, { col: MON.lang, scholar: true, sway: swayAt(t, 2), eyes: blinkAt(t, 4) ? 'blink' : 'up' }, k2);
  g.rect(296, 184, 148, 8, '#5A4A5A'); g.rect(296, 184, 148, 2, '#8A7A9A');
  g.rect(296, 192, 148, 78, '#2A2238');
  const lamp = candle(g, 424, 184, t, 2, 9);
  g.rect(316, 178, 22, 6, '#E8DCC0'); g.rect(318, 174, 18, 4, '#C8B898');
  // 中间的金线（只在下半）
  g.rect(238, 112, 4, PH - 112, '#F2C14E'); g.rect(239, 112, 2, PH - 112, '#FFF2C8');
  show(c, g);
  glow(c, 240, 58, 110, P.moon, .3);
  glow(c, lanL[0], lanL[1], 14, '#FF5A30', .45); glow(c, lamp[0], lamp[1], 40, '#FFB050', .35);
  glow(c, 120, 230, 80, '#FFB070', .12); glow(c, 370, 230, 80, '#8FA8FF', .12);
  vignette(c, .4);
}

/* 回忆的画框：深红底、金色祥云，中间一把团扇（圆），扇子里的画是暖褐色调 */
function memoryFrame(c, lt, draw, o = {}) {
  const g = pbuf('main');
  g.clear('#3A0E1A');
  for (let i = 0; i < 18; i++) { const x = (h2(i, 3) * 520 - lt * 6) % 520 - 20, y = h2(i, 4) * 270; xiangyun(g, x, y, 1, '#5A1A26'); }
  const inner = pbuf('mem');
  inner.clear('#000000');
  draw(inner);
  // 暖褐色调（回忆）
  const warm = o.warm === undefined ? 1 : o.warm;
  if (warm > 0) inner.grade((r, gg, b) => {
    const l = .3 * r + .59 * gg + .11 * b;
    return [lerp(r, Math.min(255, l * 1.12 + 22), warm), lerp(gg, l * .92 + 8, warm), lerp(b, l * .7, warm)];
  });
  const cx = 240, cy = o.cy || 128, R = o.r || 116;
  for (let y = 0; y < PH; y++) for (let x = 0; x < PW; x++) {
    const d = Math.hypot(x - cx, y - cy);
    if (d < R) g.d[y * PW + x] = inner.d[y * PW + x];
  }
  g.ring(cx, cy, R + 4, '#F2C14E', 3); g.ring(cx, cy, R + 1, '#8A5A1A', 1);
  // 扇柄和流苏
  g.rect(cx - 3, cy + R + 4, 6, 26, '#8A5A1A'); g.rect(cx - 2, cy + R + 4, 2, 26, '#C8902A');
  g.rect(cx - 2, cy + R + 30, 4, 4, '#E8323A'); g.rect(cx - 1, cy + R + 34, 2, 10, '#E8323A');
  show(c, g);
  vignette(c, .35);
}

/* ---------- 5. 回忆：他写字（8.69~10.57）："落下几笔"每个字落一笔 ---------- */
function shotWrite(c, lt, t) {
  memoryFrame(c, lt, g => {
    g.rect(0, 0, PW, PH, '#7A4A3A');
    for (let x = 120; x < 360; x += 30) g.rect(x, 20, 2, 140, '#5A3428');
    g.rect(120, 150, 240, 120, '#5A3428');
    // 窗外一枝梅
    g.rect(150, 26, 90, 70, '#C8A880'); plumTree(g, 260, 140, 41, PAL.spring, { scale: .45, lean: -.5, depth: 4 });
    for (let x = 150; x < 240; x += 15) g.rect(x, 26, 2, 70, '#5A3428');
    // 桌子、纸
    g.rect(150, 168, 190, 6, '#A8683A'); g.rect(150, 174, 190, 30, '#6A3A22');
    g.rect(196, 160, 96, 10, '#F4ECD8');
    // 笔画：每个字出来一笔
    const strokes = [[9.37, [[206, 163], [222, 163]]], [9.53, [[214, 161], [214, 168]]], [9.82, [[234, 162], [248, 166]]], [10.04, [[256, 161], [276, 168]]]];
    for (const [ts, [[x0, y0], [x1, y1]]] of strokes) if (t >= ts) { const p = easeOut(seg(t, ts, ts + .12)); g.line(x0, y0, lerp(x0, x1, p), lerp(y0, y1, p), '#1A1414', 2); }
    // 他：拿笔
    const k = 3, mx = 268, my = 168;
    mon(g, mx, my, { col: MON.lang, scholar: true, eyes: 'dn', sway: swayAt(t, 1) }, k);
    const [hx, hy] = monPt(mx, my, 1, 7, k);
    let bx = hx - 10, by = hy - 2;
    for (const [ts, [[x0, y0], [x1, y1]]] of strokes) if (t >= ts - .1 && t < ts + .2) { const p = easeOut(seg(t, ts, ts + .12)); bx = lerp(x0, x1, p); by = lerp(y0, y1, p) - 12; }
    g.line(bx, by, bx + 6, by + 12, '#3A2418', 2); g.rect(bx + 5, by + 11, 3, 3, '#1A1414');
    // 她：托着腮看他写
    mon(g, 176, 170, { col: MON.niang, girl: true, eyes: blinkAt(t, 7) ? 'blink' : 'happy', sway: swayAt(t, 2) }, 3);
    g.rect(150, 168, 190, 6, '#A8683A'); g.rect(150, 174, 190, 30, '#6A3A22');
    g.rect(196, 160, 96, 10, '#F4ECD8');
    for (const [ts, [[x0, y0], [x1, y1]]] of strokes) if (t >= ts) { const p = easeOut(seg(t, ts, ts + .12)); g.line(x0, y0, lerp(x0, x1, p), lerp(y0, y1, p), '#1A1414', 2); }
    g.line(bx, by, bx + 6, by + 12, '#3A2418', 2); g.rect(bx + 5, by + 11, 3, 3, '#1A1414');
  });
}

/* 音符 */
const NOTE = artc('note', ['..##', '..#.', '..#.', '###.', '###.'], { '#': '#FFE9A0' });
/* ---------- 6. 回忆：他弹琴（10.57~12.44）：柳树下、河边，"弹奏几曲"每个字冒一个音符 ---------- */
function shotPlay(c, lt, t) {
  memoryFrame(c, lt, g => {
    skyFill(g, ['#9AC8E8', '#C8E4F2', '#F2F0E0'], 0, 0, PW, 150);
    ridge(g, 51, 150, 30, .02, '#8AA8B8');
    g.rect(0, 150, PW, 120, '#7AB86A'); g.rect(0, 200, PW, 70, '#5AA0C8');
    for (let i = 0; i < 20; i++) g.hl(h2(i, 2) * PW, h2(i, 2) * PW + 8, 204 + h2(i, 3) * 60, '#9AD0EA');
    willow(g, 150, 182, t, PAL.spring, { h: 70 });
    // 他弹琴（琴放在膝前）
    const k = 3, mx = 270, my = 196;
    mon(g, mx, my, { col: MON.lang, scholar: true, eyes: 'closed', sway: swayAt(t, 1) }, k);
    qin(g, mx - 46, my - 10, 92, { vib: 1, t, vs: Math.floor(t * 4) % 4 });
    // 她坐在草地上听，闭着眼
    mon(g, 190, 198, { col: MON.niang, girl: true, eyes: 'closed', sway: swayAt(t, 2) }, 3);
    for (const ts of [11.19, 11.46, 11.68, 11.86]) if (t >= ts) {
      const p = t - ts, x = mx - 30 + (ts * 97 % 60) + Math.sin(p * 4) * 4, y = my - 30 - p * 30;
      if (p < 1.6) g.blitK(NOTE, x, y, 2);
    }
  });
}

/* ---------- 7. 送别（12.44~14.32）：清晨，他背着书箱往远山走，回头挥手；她在柳树下 ---------- */
function shotFarewell(c, lt, t) {
  const g = pbuf('main'), P = PAL.spring;
  skyFill(g, ['#5A6A9A', '#8A8AB0', '#C8A8B8', '#F2C8B0', '#FBE6C8']);
  const sun = 12; g.disc(330, 150 - lt * 3, sun, '#FFF2D0'); g.discD(330, 150 - lt * 3, sun + 6, '#FBE6C8', .5);
  ridge(g, 61, 160, 40, .01, '#7A7AA0');
  mist(g, 140, 30, '#E8C8C0', .5);
  ridge(g, 62, 180, 20, .02, '#6A6A90');
  g.rect(0, 180, PW, 90, '#7A9A6A');
  // 弯弯的路，通往远山
  for (let y = 180; y < PH; y++) { const f = (y - 180) / 90, cx = 330 - Math.sin(f * 2.4) * 60 * f, w = 3 + f * 60; g.hl(cx - w / 2, cx + w / 2, y, '#C8B08A'); }
  willow(g, 90, 250, t, P, { h: 120, leaf: '#4A7A5A', leafL: '#6A9A6A', wind: 1 });
  // 他：越走越远（越来越小），在 13.09 回头挥手
  const p = ease(lt / 1.875), d = 1 - p * .55;
  const k = d > .8 ? 2 : 1, f = .35 + p * .5, yy = 180 + (1 - f) * 90;
  const cx = 330 - Math.sin((1 - f) * 2.4) * 60 * (1 - f);
  const turn = t >= 13.05 && t < 13.9;
  mon(g, cx, yy + 4, { col: MON.lang, scholar: true, eyes: turn ? 'l' : 'up', arms: turn && Math.floor(t * 6) % 2 ? 'upL' : 'n', legs: Math.floor(t * 5) % 2 + 1 }, k);
  g.rect(cx - 6 * k, yy - 20 * k, 12 * k, 10 * k, '#8A5A3A'); g.rect(cx - 6 * k, yy - 20 * k, 12 * k, 2 * k, '#6A3A2A');   // 书箱
  // 她：柳树下挥手
  mon(g, 120, 246, { col: MON.niang, girl: true, sway: swayAt(t), eyes: t >= 13.3 ? 'sad' : 'r', arms: Math.floor(t * 5) % 2 ? 'upR' : 'n' }, 3);
  petals(g, t, 15, 24, P, { cols: ['#F7B3C9', '#FFFFFF', '#9AD08A'] });
  // 回忆褪色成现实：开头还是暖褐，后半段恢复原色
  const warm = 1 - seg(lt, .6, 1.6);
  if (warm > 0) g.grade((r, gg, b) => { const l = .3 * r + .59 * gg + .11 * b; return [lerp(r, Math.min(255, l * 1.12 + 22), warm), lerp(gg, l * .92 + 8, warm), lerp(b, l * .7, warm)]; });
  show(c, g);
  glow(c, 330, 150 - lt * 3, 80, '#FFE0B0', .35);
  vignette(c, .35);
}

/* ---------- 8. 京城考场（14.32~16.19）：一格格号舍，镜头推到他那一格；"把名题"写完举起卷子 ---------- */
function shotExam(c, lt, t) {
  const g = pbuf('exam', 640, 360), P = PAL.night;
  g.clear('#10122A');
  skyFill(g, ['#06071A', '#0E1030', '#161A40'], 0, 0, 640, 80);
  stars(g, t, 41, 40, 0, 0, 640, 60, P.star);
  roof(g, 320, 40, 300, 30, P, { rw: 200, curl: 10, col: '#1A1A34', colL: '#3A3A6A' });
  let me = null;
  for (let r = 0; r < 3; r++) for (let i = 0; i < 7; i++) {
    const x = 50 + i * 80, y = 98 + r * 86, center = r === 1 && i === 3;
    g.rect(x, y, 70, 74, '#2A2440'); g.rect(x + 4, y + 4, 62, 66, '#3E2A2A');
    g.rect(x + 4, y + 4, 62, 66, center ? '#5A3A2A' : '#3E2A2A');
    g.rectD(x + 4, y + 30, 62, 40, '#6A4A30', center ? .6 : .3);
    const who = { col: center ? MON.lang : CROWD_COLS[(r * 7 + i) % CROWD_COLS.length], scholar: true, eyes: 'dn', ol: '#120A18' };
    mon(g, x + 35, y + 60, who, center ? 2 : 1);
    g.rect(x + 8, y + 52, 54, 6, '#8A5A3A'); g.rect(x + 14, y + 49, 24, 3, '#F4ECD8');
    candle(g, x + 54, y + 52, t + i, 1, r * 7 + i);
    if (center) me = [x + 35, y + 60];
  }
  // 他写得飞快，"金榜"时眼睛一亮，"把名题"写完举起卷子
  const [mx, my] = me;
  const done = t >= 15.6;
  if (t >= 14.45) {
    mon(g, mx, my, { col: MON.lang, scholar: true, eyes: done ? 'happy' : 'wide', arms: done ? 'up' : (Math.floor(t * 10) % 2 ? 'upR' : 'n') }, 2);
    g.rect(mx - 27, my - 8, 54, 6, '#8A5A3A');
    if (done) { g.rect(mx - 14, my - 50 - 2 * hop(t), 28, 14, '#F8F0DC'); for (let i = 0; i < 4; i++) g.rect(mx - 10 + i * 6, my - 47, 2, 9, '#1A1414'); }
    else g.rect(mx - 12, my - 11, 24, 3, '#F4ECD8');
  }
  const z = 1.0 + .9 * easeIn(seg(lt, 0, 1.4)) * .9;
  const cx = lerp(320, mx, ease(seg(lt, 0, 1.2))), cy = lerp(180, my - 30, ease(seg(lt, 0, 1.2)));
  show(c, g, cx - 240 / z, cy - 135 / z, z);
  glow(c, mx + 19, my - 14, 24, '#FFC060', .35);
  if (done) glow(c, mx, my - 44, 30, '#FFE9A0', .5 * Math.exp(-(t - 15.6) * 2));
  vignette(c, .5);
}
