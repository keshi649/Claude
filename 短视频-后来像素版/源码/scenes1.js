'use strict';
/* scenes1.js：前奏（0~14.1 秒）
   shWarp        曲速星空：星星从画面中心拉成光线往外冲，1.35 秒（第一个强音）刹住，满天星跟着琴音一闪一闪
   shFall        镜头从星空往下摇：月亮、云、远处的楼、近处一栋公寓，停在一扇亮着的窗上，往里推
   shPowerOn     屋里：她坐在纸箱旁，吹掉掌机上的灰，按下开关 → 掌机特写：开机，心形标志掉下来 → 镜头推进屏幕
   shTitleScreen 游戏里：栀子花树下两个小怪看星星；2P 闪烁、碎成像素，飞上天拼成片名"后来"（"后""来"各踩在唱的那个字上） */

const ONSETS = [0.081, 0.209, 0.604, 0.906, 1.347, 1.730, 2.218, 2.543, 2.961, 3.332, 3.796, 4.203, 4.551, 4.946, 5.155, 5.793, 6.211, 6.385, 6.606, 7.396, 7.802, 8.208, 8.893, 9.787, 10.623, 11.366, 12.156];
const NIGHT_TINT = '#A9B3E6';                    // 夜里给角色乘的颜色

/* ================= 天空：曲速星空停下来以后的样子 = 往下摇的起点 ================= */
const FALL = { w: 480, h: 270, skyH: 470, travel: 518 };
function fallSky(b, t, camY) {
  const y0 = -ri(camY * .35);
  psky(b, FALL.w, FALL.skyH, [[0, '#04051A'], [.45, '#0B1238'], [.78, '#1E1E58'], [1, '#3E2C6A']], y0);
  pspr(b, milkyWay(FALL.w, 300, 13, 40, 300, 470, -20, 34), 0, y0);
  b.save(); b.translate(0, y0);
  starfield(b, t, FALL.w, 340, { n: 230, seed: 17, tw: .5, big: .06 });
  b.restore();
}
function fallStar(i) { return [ri(hash(i, 17, 1) * FALL.w), ri(hash(i, 17, 2) * 340)]; }   // 和 starfield 里第 i 颗星同一个位置

/* ================= shWarp：曲速星空（0 ~ bar1） ================= */
const WARP_STOP = 1.347, WARP_V0 = 5.2;
const warpD = t => { const u = clamp(t / WARP_STOP); return WARP_V0 * WARP_STOP * (1 - Math.pow(1 - u, 3)) / 3; };
const warpV = t => { const u = clamp(t / WARP_STOP); return WARP_V0 * (1 - u) * (1 - u); };
const WARP_COLS = ['#FFFFFF', '#CFE0FF', '#9FC4FF', '#FFD6EC', '#FFE6A8', '#B8F0FF'];
function shWarp(g, t) {
  const { w, h } = FALL, b = pbuf('warp', w, h), gl = glowBuf('warp', w, h);
  const cx = 240, cy = 128, f = 70;
  // 底：中心亮、四周暗的一圈圈（像隧道的尽头）
  const sf = seg(t, .95, 1.5);                                   // 停下来以后的星空淡进来
  if (sf < 1) {
    prect(b, 0, 0, w, h, '#03041A');
    const rings = ['#05072A', '#0A0C38', '#120F46', '#1C1452', '#2A1A5E'];
    rings.forEach((c, k) => pell(b, cx, cy, 300 - k * 55, 170 - k * 31, c));
  }
  if (sf > 0) { b.save(); b.globalAlpha = sf; fallSky(b, t, 0); b.restore(); }
  // 曲速：光线从中心往外冲，越慢越淡
  const D = warpD(t), v = warpV(t), wf = clamp(v / WARP_V0 * 1.6);
  if (wf > 0) {
    for (let i = 0; i < 300; i++) {
      const x3 = (hash(i, 3, 1) - .5) * 3.6, y3 = (hash(i, 3, 2) - .5) * 2.0;
      if (Math.abs(x3) < .05 && Math.abs(y3) < .05) continue;
      const z = .03 + mod(hash(i, 3, 3) - D * .55, 1);
      const zt = Math.min(1.05, z + .02 + v * .06);
      const hx = cx + x3 / z * f * .35, hy = cy + y3 / z * f * .35, tx = cx + x3 / zt * f * .35, ty = cy + y3 / zt * f * .35;
      if ((hx < -40 || hx > w + 40 || hy < -40 || hy > h + 40) && (tx < 0 || tx > w || ty < 0 || ty > h)) continue;
      const a = clamp(1.25 - z) * wf, c = WARP_COLS[i % WARP_COLS.length];
      b.globalAlpha = a * .45; pline(b, tx, ty, hx, hy, c);
      b.globalAlpha = a; pline(b, lerp(tx, hx, .6), lerp(ty, hy, .6), hx, hy, c);
      gl.globalAlpha = a * .8; prect(gl, hx - 1, hy - 1, 2, 2, c);
    }
    b.globalAlpha = 1; gl.globalAlpha = 1;
  }
  // 中心的光：曲速时一直亮，刹住的那一下最亮
  const core = wf * .8 + Math.max(0, 1 - Math.abs(t - WARP_STOP) / .25) * .9;
  if (core > 0) { pglow(b, cx, cy, 26, '#BFD4FF', core); pdisc(gl, cx, cy, 6, rgba('#FFFFFF', clamp(core))); }
  // 刹住的那一下：一圈光往外荡开
  const ru = (t - WARP_STOP) / .7;
  if (ru > 0 && ru < 1) { const rr = 12 + ru * 300; b.globalAlpha = (1 - ru) * .8; pring(b, cx, cy, rr, rr * .58, '#DDE8FF'); pring(gl, cx, cy, rr, rr * .58, '#FFFFFF'); b.globalAlpha = 1; }
  // 琴音每响一下，几颗星亮成十字
  starSparkles(b, gl, t, 0);
  // 流星
  meteor(b, 60, 30, 170, 70, seg(t, 1.40, 2.05), 18, '#CFE0FF');
  meteor(b, 330, 20, 120, 60, seg(t, 2.96, 3.5), 14, '#FFE6A8');
  blit(g, 'warp', 4); glowBlit(g, 'warp', 4, 0, 0, .9, 3);
  const fl = Math.max(0, 1 - Math.abs(t - WARP_STOP) / .18);
  if (fl > 0) { g.fillStyle = `rgba(230,238,255,${.35 * fl})`; g.fillRect(0, 0, W, H); }
}
/* 起音时一批星亮成十字（camY 往下摇时跟着天空走） */
function starSparkles(b, gl, t, camY) {
  const y0 = -ri(camY * .35);
  ONSETS.forEach((o, k) => {
    const u = (t - o) / .55; if (u < 0 || u > 1 || o < 1.0) return;
    for (let j = 0; j < 4; j++) {
      const [x, y] = fallStar(Math.floor(hash(k, j, 77) * 230)), yy = y + y0, a = 1 - u;
      const L = u < .3 ? 3 : 2;
      b.globalAlpha = a; pdot(b, x, yy, '#FFFFFF');
      for (let d = 1; d <= L; d++) { pdot(b, x - d, yy, '#DDE6FF'); pdot(b, x + d, yy, '#DDE6FF'); pdot(b, x, yy - d, '#DDE6FF'); pdot(b, x, yy + d, '#DDE6FF'); }
      gl.globalAlpha = a; prect(gl, x - 2, yy - 2, 5, 5, '#FFFFFF');
    }
  });
  b.globalAlpha = 1; gl.globalAlpha = 1;
}

/* ================= shFall：从星空往下摇到一扇窗（bar1 ~ bar2） ================= */
const FALL_TGT = { x: 240, fi: 7, c: 2 };
function fallCam(t) { return FALL.travel * E.io(seg(t, bar(1), 5.75)); }
function shFall(g, t) {
  const { w, h } = FALL, b = pbuf('fall', w, h), gl = glowBuf('fall', w, h);
  const camY = fallCam(t);
  fallSky(b, t, camY);
  moon(b, gl, 396, 52 - ri(camY * .35), 11, .5, '#FFF2CC');
  starSparkles(b, gl, t, camY);
  // 云：两条薄云，往左飘
  const cy0 = 330 - camY * .6;
  for (let k = 0; k < 2; k++) {
    const yy = cy0 + k * 34, dx = mod(t * (6 + k * 3) + k * 140, 640) - 120;
    b.globalAlpha = .35 - k * .1;
    for (let j = 0; j < 4; j++) pell(b, dx + j * 170 - 80, yy + (j % 2) * 5, 60 - k * 10, 4 + k, '#5A4E8A');
    b.globalAlpha = 1;
  }
  // 远处、中间的楼
  const farY = ri(560 - 120 - camY * .8), midY = ri(660 - 170 - camY * .9);
  pspr(b, skyline(w, 120, 71, '#161A40', 100, .10), 0, farY);
  prect(b, 0, farY + 120, w, 40, '#161A40');
  pspr(b, skyline(w, 170, 72, '#10142F', 140, .16, { minW: 12, varW: 24 }), 0, midY);
  prect(b, 0, midY + 170, w, 200, '#10142F');
  if (gl) { gl.globalAlpha = .5; pspr(gl, skyline(w, 170, 72, '#10142F', 140, .16, { minW: 12, varW: 24 }), 0, midY); gl.globalAlpha = 1; }
  // 近处：两边矮一点的楼 + 中间她住的那栋
  const nearY = -ri(camY);
  facade(b, gl, t, -10, 112, 590 + nearY, 1000 + nearY, { cols: 4, winW: 16, winH: 12, floorH: 22, lit: .3, seed: 5, wall: '#161B3C' });
  facade(b, gl, t, 378, 120, 610 + nearY, 1000 + nearY, { cols: 4, winW: 16, winH: 12, floorH: 22, lit: .3, seed: 9, wall: '#161B3C' });
  facade(b, gl, t, 110, 260, 470 + nearY, 1000 + nearY, {
    cols: 5, winW: 26, winH: 14, floorH: 24, lit: .4, seed: 3, wall: '#1E2350', target: [FALL_TGT.fi, FALL_TGT.c],
    onTarget: (x, y, ww, wh) => {                       // 那扇窗里：暖黄的灯、坐在地上的她
      prect(b, x, y, ww, wh, '#F0B868'); prect(b, x, y + wh - 3, ww, 3, '#B07A48');
      prect(b, x + 2, y + 2, 4, 6, '#FFE2A8');
      smonAt(b, x + 15, y + wh - 1, { col: shade(COL.her, .9), eyes: 'l' });
      prect(b, x + ri(ww / 2), y, 1, wh, '#C8904E');
      if (gl) prect(gl, x - 2, y - 2, ww + 4, wh + 4, rgba('#FFC870', .9));
    },
  });
  // 最后往窗里推
  const pu = E.in(seg(t, 5.55, 6.52)), s = 1 + pu * 4.2;
  const fx = FALL_TGT.x, fy = 135 + 2;
  if (s <= 1.001) { blit(g, 'fall', 4); glowBlit(g, 'fall', 4, 0, 0, .8, 3); }
  else { blitZoom(g, 'fall', 4, fx, fy, s, W / 2, H / 2 + (1 - pu) * 0); glowBlitZoom(g, 'fall', 4, fx, fy, s, W / 2, H / 2, .8, 3); }
}

/* ================= shPowerOn：屋里开机 → 掌机特写 → 推进屏幕（bar2 ~ bar3） ================= */
const PO = { insert: 7.85, dissolve: 9.0, zoom0: 9.0, zoom1: bar(3) };
function shPowerOn(g, t) {
  if (t < PO.insert) return roomPowerOn(g, t);
  return handheldInsert(g, t);
}
/* 她的房间：坐在纸箱旁，捧着掌机；6.95 秒吹灰，7.40 秒（琴音）屏幕亮了 */
function roomPowerOn(g, t) {
  const b = pbuf('room1', HR.w, HR.h), gl = glowBuf('room1', HR.w, HR.h);
  herRoom(b, gl, t);
  const on = t >= 7.40 ? (t < 7.48 ? .4 : 1) : 0;
  const ey = t < 6.9 ? 'dn' : t < 7.35 ? 'shut' : 'dn';
  if (on) pglow(b, 140, 99, 18, '#9AF0DC', .3 * on);                 // 屏幕的光先铺在地上
  monAt(b, 140, 100, { col: COL.her, legs: 'sit', armL: 'hold', armR: 'hold', eyes: ey, glint: on > 0 });
  heldHandheld(b, 140, 94, '#E6DEC8', on ? '#BFF8EC' : null);
  if (on) prect(gl, 137, 95, 6, 4, rgba('#BFF8EC', on));
  // 吹灰：一小团灰从掌机上飘起来
  const du = seg(t, 6.95, 7.6);
  if (du > 0 && du < 1) for (let i = 0; i < 16; i++) {
    const a = hash(i, 4, 1) * PI - PI, r = du * (8 + hash(i, 4, 2) * 14);
    b.globalAlpha = (1 - du) * .8; pdot(b, 140 + Math.cos(a) * r * .8, 91 + Math.sin(a) * r * .5 - du * 6, '#D8D2C8');
  }
  b.globalAlpha = 1;
  for (let i = 0; i < 14; i++) { const x = 180 + hash(i, 8) * 36, y = 44 + mod(hash(i, 9) * 50 + t * 4, 50); b.globalAlpha = .5; pdot(b, x + Math.sin(t + i) * 2, y, '#FFE8C0'); }
  b.globalAlpha = 1;
  const s = 1.55 + .15 * E.sine(seg(t, bar(2), PO.insert));
  blitZoom(g, 'room1', 8, 136, 78, s, W / 2, H / 2 + 20); glowBlitZoom(g, 'room1', 8, 136, 78, s, W / 2, H / 2 + 20, .9, 3);
}
/* 掌机特写（通用）：缓冲 640×360、P=3，u=6，液晶 192×108 放在缓冲正中（320, 180），正好是游戏世界缓冲的大小。
   screen 液晶里的画布（192×108）；o：{zoom 推近倍数, led, pressA, hands 两只手, glow 液晶光晕, after(b, L) 画在液晶上面的东西}
   返回液晶在屏幕上的位置 {x, y, w, h, k}（k = 一个游戏像素多少屏幕像素） */
function insertHH(g, t, screen, o = {}) {
  const w = 640, h = 360, b = pbuf('hhIns', w, h), gl = glowBuf('hhIns', w, h);
  prect(b, 0, 0, w, h, '#090A16');
  pglow(b, 320, 180, 230, o.halo || '#2A3270', .9);
  pell(b, 320, 440, 300, 110, shade(COL.her, .42));                 // 她的身子在下面
  const hx = 110, hy = 96;
  const L = handheld(b, hx, hy, 6, { on: 0, led: o.led ?? true, pressA: o.pressA });
  if (o.hands !== false) {                                          // 两只手扶着两头
    const hc = shade(COL.her, .72), hl = shade(COL.her, .86);
    [hx - 26, hx + 400].forEach(x0 => { prect(b, x0 + 4, hy + 118, 38, 76, hc); prect(b, x0, hy + 124, 46, 64, hc); prect(b, x0 + 4, hy + 118, 38, 4, hl); });
  }
  if (screen) { b.imageSmoothingEnabled = false; b.drawImage(screen, L.x, L.y); if (o.glow !== false) { gl.globalAlpha = o.glowAmt ?? .5; gl.drawImage(screen, L.x, L.y); gl.globalAlpha = 1; } }
  if (o.led ?? true) prect(gl, hx + 14 * 6, hy + 6 * 6, 6, 6, '#FF4A4A');
  if (o.after) o.after(b, gl, L);
  const s = o.zoom || 1, fx = o.fx ?? 320, fy = o.fy ?? 180;
  blitZoom(g, 'hhIns', 3, fx, fy, s, W / 2, H / 2); glowBlitZoom(g, 'hhIns', 3, fx, fy, s, W / 2, H / 2, o.glowK ?? .6, 3);
  const k = 3 * s;
  return { x: W / 2 + (L.x - fx) * k, y: H / 2 + (L.y - fy) * k, w: L.w * k, h: L.h * k, k };
}
/* 开机 → 推进屏幕：推到液晶铺满画面（192×108 × 10 = 1920×1080） */
function handheldInsert(g, t) {
  const lc = bootScreen(t);
  const zu = E.in(seg(t, PO.zoom0, PO.zoom1)), sEnd = 1920 / (192 * 3), s = 1 + (sEnd - 1) * zu;
  const R2 = insertHH(g, t, lc, { zoom: s, led: t >= PO.insert, glowK: .6 * (1 - zu) + .1 });
  // 推到最后：液晶里的游戏世界和下一个镜头一样带光晕
  if (zu > .6) {
    g.save(); g.beginPath(); g.rect(R2.x, R2.y, R2.w, R2.h); g.clip();
    glowBlitZoom(g, 'tworld', 10, 96, 54, R2.k / 10, R2.x + R2.w / 2, R2.y + R2.h / 2, .9 * seg(zu, .6, 1), 3);
    g.restore();
  }
}
/* 液晶里的画面（192×108）：开机线 → 心形标志掉下来 → "存档 01" → 抖动溶解成游戏世界 */
function bootScreen(t) {
  const w = 192, h = 108, q = pbuf('boot', w, h);
  const u = t - PO.insert;
  if (u < .16) {                                                // 开机：一条亮线从中间往上下张开
    prect(q, 0, 0, w, h, '#1A2020');
    const hh = ri(E.out(u / .16) * h / 2);
    prect(q, 0, h / 2 - hh, w, Math.max(1, hh * 2), '#E8F8F0');
    return BUF.boot;
  }
  prect(q, 0, 0, w, h, '#E9F4EE');
  for (let y = 0; y < h; y += 2) prect(q, 0, y, w, 1, '#E2EEE8');      // 液晶的细横纹
  // 心：从上面掉下来，8.893 秒（强音）落地，压扁一下再弹回
  const land = 8.893, drop = seg(t, 8.05, land), hs = 3;
  let hy = lerp(-34, 30, E.in2(drop)), sq = 1;
  if (t > land) { const k = t - land; hy = 30 - Math.abs(Math.sin(k * 9)) * 7 * Math.exp(-k * 5); sq = 1 - .25 * Math.exp(-k * 14); }
  const H11 = heart11('#FF5A7A'), hw = 11 * hs, hh2 = ri(10 * hs * sq);
  q.drawImage(H11, ri(w / 2 - hw / 2), ri(hy + 10 * hs - hh2), hw, hh2);
  if (t > land) {                                               // 落地时一圈小星星
    const k = seg(t, land, land + .5);
    for (let i = 0; i < 8; i++) { const a = i / 8 * TAU, r = 18 + k * 30; q.globalAlpha = 1 - k; pdot(q, w / 2 + Math.cos(a) * r, 46 + Math.sin(a) * r * .6, '#FF9AB0'); pdot(q, w / 2 + Math.cos(a) * r * .8, 46 + Math.sin(a) * r * .5, '#FFD27A'); }
    q.globalAlpha = 1;
    const ta = seg(t, land + .05, land + .25);
    ptext(q, '存档 01', w / 2, 74, 1, '#3A4060', { align: 'center', alpha: ta });
  }
  // 9.0 秒起：抖动溶解成游戏世界
  const dv = seg(t, PO.dissolve, PO.dissolve + .35);
  if (dv > 0) {
    drawTitleWorld(t);
    const lv = Math.floor(dv * 17);
    const m = pbuf('bootMask', w, h);                           // 按 2×2 的格子、Bayer 阈值从 tworld 拷过来
    for (let y = 0; y < h; y += 2) for (let x = 0; x < w; x += 2) if (BAYER[((y >> 1) & 3) * 4 + ((x >> 1) & 3)] < lv) m.drawImage(BUF.tworld, x, y, 2, 2, x, y, 2, 2);
    q.drawImage(BUF.bootMask, 0, 0);
  }
  return BUF.boot;
}

/* ================= 游戏世界：夜里的山坡、栀子花树、两个小怪的背影（标题画面、后面也会回来） ================= */
const TW = { w: 192, h: 108, herX: 104, himX: 128, feetY: 81 };
function drawTitleWorld(t, o = {}) {
  const { w, h } = TW, b = pbuf('tworld', w, h), gl = glowBuf('tworld', w, h);
  psky(b, w, h, [[0, '#0A0F33'], [.55, '#1C1E5A'], [1, '#3C2E6E']]);
  starfield(b, t, w, 72, { n: 80, seed: 61, tw: .5, big: .08 });
  moon(b, gl, 178, 16, 7, .45, '#FFF2C8');
  hillShape(b, w, h, [[0, 78], [40, 72], [90, 80], [140, 74], [192, 82]], '#18264A', '#22345A');
  hillShape(b, w, h, [[0, 106], [60, 92], [110, 80], [150, 78], [192, 82]], '#1C3A38', '#2C5648');
  for (let i = 0; i < 40; i++) { const x = ri(hash(i, 62) * w), y0 = 84 + ri(hash(i, 63) * 22); pdot(b, x, y0, '#25483F'); }   // 草里的小点
  gardeniaTree(b, gl, t, 152, 80, 17, { night: true, flowers: 30, seed: 23 });
  const herO = o.her || { col: COL.her, skirt: true, back: true, legs: 'sit' };
  monAt(b, TW.herX, TW.feetY, herO, NIGHT_TINT);
  if (o.drawHim !== false) monAt(b, TW.himX, TW.feetY - 1, o.him || { col: COL.him, cowlick: true, back: true, legs: 'sit' }, NIGHT_TINT);
  if (o.after) o.after(b, gl);
  fireflies(b, gl, t, 18, 50, 46, 190, 100, 5);
  return b;
}

/* ================= shTitleScreen：标题画面 → 2P 碎成像素 → 拼出"后来"（bar3 ~ 14.10） ================= */
const TS = { glitch0: 11.366, burst: 11.92, hou: ch(0, 0), lai: ch(0, 1) };
const TITLE = (() => {
  const gb = glyphBits('后来'), S = 3, x0 = 20, y0 = 10, pts = [];
  gb.pts.forEach(p => { for (let dy = 0; dy < S; dy++) for (let dx = 0; dx < S; dx++) pts.push({ x: x0 + p.x * S + dx, y: y0 + p.y * S + dy, fx: p.x }); });
  return { pts, S, x0, y0, w: gb.w * S, split: 12 };      // 字形 x < 12 是"后"，后面是"来"
})();
const HIM_BACK = { col: COL.him, cowlick: true, back: true, legs: 'sit' };
function titleParticles(t) {
  const src = monPixels(HIM_BACK), n = src.length;
  return TITLE.pts.map((p, j) => {
    const s = src[j % n], isHou = p.fx < TITLE.split;
    const sx = TW.himX - 12 + s.x + (hash(j, 1) - .5) * 2, sy = TW.feetY - 1 - 16 + s.y + (hash(j, 2) - .5) * 2;
    const dep = TS.burst + hash(j, 3) * .28;
    const xr = (p.x - TITLE.x0) / TITLE.w;
    const arr = isHou ? TS.hou + .02 + xr * 2 * .34 : TS.lai + .02 + (xr - .5) * 2 * .34;
    return { sx, sy, tx: p.x, ty: p.y, dep, arr, col: s.col, k: j };
  });
}
let TP_CACHE = null;
function shTitleScreen(g, t) {
  // 2P 故障：11.37 秒起一闪一闪（一帧正常、一帧横着错开、一帧不见）
  const gk = t >= TS.glitch0 && t < TS.burst ? Math.floor((t - TS.glitch0) * 20) % 3 : 0;
  const b = drawTitleWorld(t, { drawHim: t < TS.burst && gk === 0, him: HIM_BACK, after: (b, gl) => {
    if (gk === 1) {
      const s = tinted(mon(HIM_BACK), NIGHT_TINT, 'g1'), k = Math.floor(t * 20);
      for (let r = 0; r < MCH; r += 3) b.drawImage(s, 0, r, MCW, 3, TW.himX - 12 - MOX + ri((hash(k, r) - .5) * 8), TW.feetY - 17 - MOY + r, MCW, 3);
      gl.globalAlpha = .6; pdisc(gl, TW.himX, TW.feetY - 9, 10, '#9AF0DC'); gl.globalAlpha = 1;
    }
  } });
  const gl = BUF.glow_tworld.getContext('2d');
  // 2P 碎成像素，飞上天拼成"后来"
  if (t >= TS.burst) {
    TP_CACHE = TP_CACHE || titleParticles(t);
    TP_CACHE.forEach(p => {
      let x, y, col = p.col, a = 1;
      if (t < p.dep) { x = p.sx; y = p.sy; }
      else if (t < p.arr) {
        const u = (t - p.dep) / (p.arr - p.dep), e = E.io(u);
        const swirl = Math.sin(u * PI) * (18 + 14 * hash(p.k, 5)), ang = u * TAU * (.6 + hash(p.k, 6) * .5) + hash(p.k, 7) * TAU;
        x = lerp(p.sx, p.tx, e) + Math.cos(ang) * swirl * .9;
        y = lerp(p.sy, p.ty, e) - Math.sin(u * PI) * 22 + Math.sin(ang) * swirl * .45;
        col = u < .5 ? mix(p.col, '#9AF0DC', u * 2) : mix('#9AF0DC', '#FFF6DC', (u - .5) * 2);
      } else {
        x = p.tx; y = p.ty; col = '#FFF6DC';
        const sh = hash(p.k, Math.floor(t * 6)); if (sh < .03) col = '#FFFFFF'; else if (sh < .08) col = '#FFE7A8';
      }
      pdot(b, x, y, col);
      gl.globalAlpha = t < p.arr ? .9 : .45; pdot(gl, x, y, t < p.arr ? '#9AF0DC' : '#FFE8B0');
    });
    gl.globalAlpha = 1;
    // 碎开的那一下：一圈光
    const bu = seg(t, TS.burst, TS.burst + .5);
    if (bu > 0 && bu < 1) { b.globalAlpha = 1 - bu; pring(b, TW.himX, TW.feetY - 9, 4 + bu * 22, 3 + bu * 14, '#BFF8EC'); b.globalAlpha = 1; }
  }
  blit(g, 'tworld', 10); glowBlit(g, 'tworld', 10, 0, 0, .9, 3);
  // 标题画面的字：存档名、"▶ 继续"
  const ua = env(t, bar(3) + .25, bar(3) + .5, TS.glitch0 - .1, TS.glitch0 + .15);
  if (ua > 0) {
    ptext(g, '存档 01　十七岁的夏天', 140, 130, 3, '#F4F1E8', { alpha: ua, ol: '#0A0C1C' });
    if (Math.floor(t * 2.4) % 2 === 0) ptext(g, '▶ 继续', 960, 820, 4, '#FFE27A', { align: 'center', alpha: ua, ol: '#0A0C1C' });
  }
  // 片名下面的小字
  const sa = seg(t, 13.35, 13.8);
  if (sa > 0) ptext(g, '刘若英', TITLE.x0 * 10 + TITLE.w * 5, 540, 4, '#F2E6FF', { align: 'center', alpha: sa, ol: '#0A0C1C' });
}
