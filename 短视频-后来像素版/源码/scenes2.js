'use strict';
/* scenes2.js：开头副歌（14.1~38.56 秒，现在，冬夜，她一个人）
   shRoomHold        "我总算学会了如何去爱"：屋里，她捧着亮着的掌机，把它抱在怀里
   shScreenWalkAway  "可惜你早已远去"：掌机屏幕里，2P 从树下往山坡下走，越走越小，变成一个点
   shWindowCrowd     "消失在人海"：窗外楼下的路口，人群里一个青绿色、带呆毛的身影，被人潮挡住就不见了
   shFaceGlow        "后来"：她的脸，屏幕的光从下面照上来，眼泪涌上来
   shTearScreen      "终于在眼泪中明白"：眼泪落在屏幕上，泪珠像放大镜，透出液晶的红绿蓝像素
   shContinue        "有些人一旦错过就不再"："继续游戏？"→ 按下 A → 读取中 → 钻进屏幕 */

/* ---------- 掌机屏幕里的画面（192×108，游戏像素）：kind 决定画什么 ---------- */
function screenWorld(t, o = {}) {
  drawTitleWorld(t, Object.assign({ drawHim: false }, o));
  return BUF.tworld;
}
/* 屏幕里的小字（游戏像素 1 倍的像素字） */
function scrText(b, s, x, y, col = '#F4F1E8', o = {}) { ptext(b, s, x, y, 1, col, Object.assign({ ol: '#0A0C1C' }, o)); }

/* ================= shRoomHold：屋里抱着掌机（14.10 ~ 18.90） ================= */
function shRoomHold(g, t, s) {
  const b = pbuf('room2', HR.w, HR.h), gl = glowBuf('room2', HR.w, HR.h);
  herRoom(b, gl, t, { lamp: .8, snow: true });
  const hug = E.io(seg(t, 15.85, 16.6));                           // "会"起，闭上眼睛把掌机捧紧，屏幕的光亮一点
  const ey = t < 15.9 ? (blinking(t, 2) ? 'shut' : 'dn') : t < 17.3 ? 'shut' : t < 18.2 ? 'l' : 'dn';
  pglow(b, 140, 99, 16, '#9AF0DC', .28);
  monAt(b, 140, 100, { col: COL.her, legs: 'sit', armL: 'hold', armR: 'hold', eyes: ey, glint: ey !== 'shut' });
  const hy = 94;
  heldHandheld(b, 140, hy, '#E6DEC8', '#BFF8EC');
  if (hug > 0) { pglow(b, 140, 92, 10 + 4 * hug, '#BFF8EC', .25 * hug); }
  prect(gl, 137, hy + 1, 6, 4, rgba('#BFF8EC', 1));
  for (let i = 0; i < 12; i++) { const x = 180 + hash(i, 8) * 36, y = 44 + mod(hash(i, 9) * 50 + t * 4, 50); b.globalAlpha = .5; pdot(b, x + Math.sin(t + i) * 2, y, '#FFE8C0'); }
  b.globalAlpha = 1;
  const u = E.sine(seg(t, s.t, s.e)), z = lerp(1.35, 2.6, u), fx = lerp(118, 140, u), fy = lerp(70, 88, u);
  blitZoom(g, 'room2', 8, fx, fy, z, W / 2, H / 2 + 20); glowBlitZoom(g, 'room2', 8, fx, fy, z, W / 2, H / 2 + 20, .9, 3);
}

/* ================= shScreenWalkAway：屏幕里 2P 走远（18.90 ~ 21.70） ================= */
function shScreenWalkAway(g, t, s) {
  const u = seg(t, s.t + .2, ch(2, 6) + .1);                        // 走到"去"字不见
  screenWorld(t, { after: (b, gl) => {
    // 一条小路从树下拐向右下的山坡
    for (let i = 0; i < 30; i++) { const v = i / 29, x = lerp(132, 196, v), y = lerp(81, 98, v * v); pdot(b, x, y, '#2E5A4A'); pdot(b, x + 1, y, '#2E5A4A'); }
    if (u < 1) {
      const v = E.sine(u), x = lerp(TW.himX + 4, 200, v), y = lerp(TW.feetY - 1, 99, v * v), wc = walkCycle(t, 5);
      if (v < .35) monAt(b, x, y + wc.bob * .5, { col: COL.him, cowlick: true, legs: wc.legs, eyes: 'r' }, NIGHT_TINT);
      else if (v < .75) smonAt(b, x, y, { col: COL.him, cowlick: true, legs: wc.legs, eyes: 'r' }, NIGHT_TINT);
      else { b.globalAlpha = 1 - (v - .75) / .25; prect(b, x, y - 2, 2, 2, '#55B2A2'); b.globalAlpha = 1; }
    }
    if (Math.floor(t * 2.5) % 2 === 0) scrText(b, '2P 未连接', 188, 4, '#9AF0DC', { align: 'right' });
  } });
  const z = 1.55 + .1 * E.sine(seg(t, s.t, s.e));
  insertHH(g, t, BUF.tworld, { zoom: z, fy: 182, glowAmt: .45 });
}

/* ================= shWindowCrowd：窗外的人海（21.70 ~ 24.80） ================= */
function shWindowCrowd(g, t, s) {
  const w = 480, h = 270, b = pbuf('crowd1', w, h), gl = glowBuf('crowd1', w, h);
  // 对面的店面（上）：暖黄的橱窗、霓虹招牌；马路和斑马线（中）；这边的人行道（下）
  prect(b, 0, 0, w, 100, '#0E1230');
  const shops = [[6, '#2A2440', '便利店', '#7FE0FF'], [124, '#30243A', '花店', '#FF9AC8'], [226, '#262A44', '24h', '#FFD27A'], [326, '#2E2238', '书店', '#B8A0FF'], [422, '#24283E', 'KTV', '#FF7A9A']];
  shops.forEach(([x, c, name, nc], i) => {
    prect(b, x, 28, 94, 64, c);
    prect(b, x + 6, 52, 82, 38, '#FFD9A0'); prect(b, x + 6, 52, 82, 38, rgba(nc, .18));       // 橱窗的灯
    for (let k = 0; k < 3; k++) prect(b, x + 12 + k * 26, 64, 16, 26, shade('#FFD9A0', .82));  // 货架
    prect(b, x + 30 + (i % 2) * 20, 72, 5, 18, shade(c, .7)); prect(b, x + 29 + (i % 2) * 20, 69, 7, 4, shade(c, .7));   // 店里的人影
    prect(b, x + 12, 32, 70, 14, '#0B0C1E');
    const on = .82 + .18 * Math.sin(t * 6 + i * 2);
    ptext(b, name, x + 47, 33, 1, nc, { align: 'center', alpha: on });
    gl.globalAlpha = on; ptext(gl, name, x + 47, 33, 1, nc, { align: 'center' }); gl.globalAlpha = .35; prect(gl, x + 6, 52, 82, 38, '#FFD9A0'); gl.globalAlpha = 1;
  });
  prect(b, 0, 92, w, 14, '#262C48'); prect(b, 0, 92, w, 1, '#3A4266');                    // 对面的人行道
  prect(b, 0, 106, w, 110, '#161A30');                                                  // 马路
  for (let x = 30; x < w; x += 22) prect(b, x, 114, 12, 94, '#343A58');                 // 斑马线
  shops.forEach(([x, , , nc]) => { b.globalAlpha = .13; prect(b, x + 30, 108, 34, 100, nc); b.globalAlpha = 1; });   // 霓虹在路面上的倒影
  prect(b, 0, 216, w, 54, '#262C48'); prect(b, 0, 216, w, 1, '#3A4266');                 // 这边的人行道
  // 两边停着等红灯的车，车灯照过斑马线
  [[0, 124, 1], [438, 176, -1]].forEach(([x, y, d]) => {
    prect(b, x, y, 42, 18, '#3A3048'); prect(b, x + 7, y - 7, 26, 8, '#2A2236'); prect(b, x + 9, y - 6, 22, 5, '#4A5478');
    const lx = d > 0 ? x + 41 : x - 1; prect(b, lx, y + 5, 2, 4, '#FFF2C0');
    pcone(b, lx + d * 30, y + 2, y + 16, 4, 14, '#FFF0C0', .0, .0);
    b.save(); b.globalCompositeOperation = 'screen'; b.globalAlpha = .16; ppoly(b, [[lx, y + 4], [lx + d * 90, y - 4], [lx + d * 90, y + 22], [lx, y + 10]], '#FFF0C0'); b.restore();
    prect(gl, lx - 2, y + 3, 6, 8, 'rgba(255,240,190,.9)');
  });
  // 行人：四条"车道"，来回走；青绿色带呆毛的那个在第二条往右走，23.3 秒（"海"）被一群往左走的人挡住，再也没出来
  const peds = [];
  for (let i = 0; i < 46; i++) {
    const lane = i % 4, dir = (i * 7 + lane) % 3 === 0 ? -1 : 1, sp = 14 + hash(i, 1) * 8;
    const x0 = hash(i, 2) * (w + 80) - 40, x = mod(x0 + dir * sp * (t - s.t) + 40, w + 80) - 40;
    peds.push({ x, y: 128 + lane * 22 + ri(hash(i, 3) * 6), dir, col: CROWD[i % CROWD.length], k: i });
  }
  // 挡住他的那一群：从右往左，23.0~23.6 秒正好走过他前面
  const hx = 150 + 26 * (t - s.t), hy = 152;
  for (let j = 0; j < 7; j++) peds.push({ x: hx + 60 - (t - 23.0) * 60 + j * 9 - 30, y: hy + 3 + (j % 3) * 2, dir: -1, col: CROWD[(j + 3) % CROWD.length], k: 100 + j });
  if (t < ch(3, 4) + .05) peds.push({ x: hx, y: hy, dir: 1, him: true, k: 999 });
  peds.sort((a, c) => a.y - c.y);
  peds.forEach(p => {
    const wc = walkCycle(t + p.k * .13, 5);
    const o = p.him ? { col: COL.him, cowlick: true, legs: wc.legs, eyes: 'r', beanie: HAT.him } : { col: p.col, legs: wc.legs, eyes: p.dir > 0 ? 'r' : 'l' };
    smonAt(b, p.x, p.y + (wc.bob ? -1 : 0), o, p.him ? null : '#B8C0E0');
  });
  const cx = 240 + 20 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'crowd1', 4, cx, 134, 1.25, W / 2, H / 2); glowBlitZoom(g, 'crowd1', 4, cx, 134, 1.25, W / 2, H / 2, .9, 3);
  // 窗框：画面四周一圈深色的窗框和玻璃的反光，表示是从她的窗里往下看
  g.fillStyle = '#0B0D1C'; g.fillRect(0, 0, W, 44); g.fillRect(0, 0, 44, H); g.fillRect(W - 44, 0, 44, H); g.fillRect(0, H - 44, W, 44); g.fillRect(W / 2 - 14, 0, 28, H);
  g.fillStyle = 'rgba(160,190,255,.06)'; g.beginPath(); g.moveTo(200, 44); g.lineTo(520, 44); g.lineTo(260, H - 44); g.lineTo(-60, H - 44); g.fill();
}

/* ================= shFaceGlow：她的脸（24.80 ~ 26.85） ================= */
function shFaceGlow(g, t, s) {
  const w = 80, h = 70, b = pbuf('face1', w, h), gl = glowBuf('face1', w, h);
  psky(b, w, h, [[0, '#141634'], [.7, '#22244A'], [1, '#2A2440']]);
  // 身后窗外城市的光斑（散景）：小一点、淡一点
  for (let i = 0; i < 12; i++) { const x = hash(i, 31) * w, y = 10 + hash(i, 32) * 26, c = i % 3 ? '#E8B060' : '#7FA0D8'; b.globalAlpha = .28; pdisc(b, x, y, 1 + hash(i, 33) * 1.5, c); gl.globalAlpha = .45; pdisc(gl, x, y, 1.5, c); }
  b.globalAlpha = 1; gl.globalAlpha = 1;
  const tear = t < 25.85 ? 0 : t < 26.4 ? 1 : 2;
  monLit(b, 40, 56, { col: COL.her, eyes: 'dn', glint: true, tear, armL: 'hold', armR: 'hold' }, '#9AF0DC', .34);
  pglow(gl, 40, 58, 12, '#9AF0DC', .8);
  if (tear === 2) {                                                // 泪滴从眼角滑下来
    const u = seg(t, 26.4, 26.85);
    prect(b, 29, 43 + ri(u * 6), 1, 2, '#A8E0FF'); prect(gl, 29, 43 + ri(u * 6), 1, 2, '#FFFFFF');
  }
  const z = 1 + .06 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'face1', 24, 40, 45, z, W / 2, H / 2); glowBlitZoom(g, 'face1', 24, 40, 45, z, W / 2, H / 2, .8, 2);
}
/* 小怪被下面的屏幕照亮：先画到小画布，下半身叠一层光（只在她身上），再贴回去 */
function monLit(b, cx, fy, o, col, amt) {
  const q = pbuf('monLit', MCW, MCH); q.drawImage(mon(o), 0, 0);
  q.globalCompositeOperation = 'source-atop';
  for (let y = 0; y < MCH; y++) { const v = clamp((y - MOY - 4) / 12); if (v > 0) { q.fillStyle = rgba(col, amt * v); q.fillRect(0, y, MCW, 1); } }
  q.globalCompositeOperation = 'source-over';
  pspr(b, BUF.monLit, ri(cx - 12) - MOX, ri(fy - 16) - MOY);
}

/* ================= shTearScreen：眼泪落在屏幕上（26.85 ~ 31.65） ================= */
function shTearScreen(g, t, s) {
  screenWorld(t, { after: (b) => { if (Math.floor(t * 2.5) % 2 === 0) scrText(b, '2P 未连接', 188, 4, '#9AF0DC', { align: 'right' }); } });
  const z = 1.9, R2 = insertHH(g, t, BUF.tworld, { zoom: z, fy: 178, glowAmt: .45 });
  const land = ch(5, 4);                                           // "泪"字落到屏幕上
  const k = R2.k;                                                  // 一个游戏像素多少屏幕像素
  // 落下来：一颗大泪珠从画面上面掉下来
  const dropX = R2.x + 104 * k, dropY0 = -120, dropY1 = R2.y + 70 * k;
  if (t < land) {
    const u = E.in2(seg(t, land - .55, land)), y = lerp(dropY0, dropY1, u);
    drawDrop(g, dropX, y, 26, 34);
  } else {
    // 落在屏幕上：一圈荡开，然后像放大镜一样停着，慢慢往下滑
    const u = t - land, slide = E.in2(seg(t, land + .8, s.e)) * 18 * k;
    const cx = dropX, cy = dropY1 + slide, r = Math.min(1, u / .15) * 15 * k;
    // 透过泪珠看到的：放大 1.9 倍的液晶，带红绿蓝竖条
    const q = layer('lens', ri(r * 2) + 2, ri(r * 2) + 2);
    const srcX = (cx - R2.x) / k, srcY = (cy - R2.y) / k, mag = 1.9, sr = r / k / mag;
    q.imageSmoothingEnabled = false;
    q.drawImage(BUF.tworld, srcX - sr, srcY - sr, sr * 2, sr * 2, 0, 0, r * 2, r * 2);
    const px = k * mag;                                             // 放大后一个游戏像素多大
    q.globalCompositeOperation = 'multiply';
    for (let x = 0; x < r * 2 + px; x += px) { const x0 = x - mod(srcX - sr, 1) * px; q.fillStyle = '#FFB8B0'; q.fillRect(x0, 0, px / 3, r * 2); q.fillStyle = '#B8FFB8'; q.fillRect(x0 + px / 3, 0, px / 3, r * 2); q.fillStyle = '#B8C8FF'; q.fillRect(x0 + px * 2 / 3, 0, px / 3, r * 2); }
    q.globalCompositeOperation = 'lighter'; q.globalAlpha = .25; q.drawImage(BUF.tworld, srcX - sr, srcY - sr, sr * 2, sr * 2, 0, 0, r * 2, r * 2); q.globalAlpha = 1;
    q.globalCompositeOperation = 'destination-in'; q.fillStyle = '#FFF'; q.beginPath(); q.arc(r + 1, r + 1, r, 0, TAU); q.fill();
    g.drawImage(LAYER.lens, cx - r - 1, cy - r - 1);
    // 泪珠的边和高光
    g.save(); g.strokeStyle = 'rgba(200,240,255,.55)'; g.lineWidth = 6; g.beginPath(); g.arc(cx, cy, r, 0, TAU); g.stroke();
    g.fillStyle = 'rgba(255,255,255,.75)'; g.fillRect(cx - r * .55, cy - r * .62, r * .32, r * .12); g.fillRect(cx - r * .62, cy - r * .5, r * .12, r * .22); g.restore();
    // 刚落下时荡开的一圈
    const ru = seg(t, land, land + .45);
    if (ru < 1) { g.save(); g.strokeStyle = `rgba(200,240,255,${.6 * (1 - ru)})`; g.lineWidth = 8; g.beginPath(); g.arc(cx, cy, r + ru * 160, 0, TAU); g.stroke(); g.restore(); }
    // 往下滑留下的水痕
    if (slide > 0) { g.fillStyle = 'rgba(200,235,255,.18)'; g.fillRect(cx - r * .3, dropY1, r * .6, slide); }
  }
}
/* 像素泪珠（屏幕坐标，块大小 bs）：上尖下圆 */
function drawDrop(g, x, y, bs, rr) {
  const rows = ['..#..', '.###.', '.###.', '#####', '#####', '#####', '.###.'];
  const s2 = bs / 2;
  rows.forEach((r, j) => { for (let i = 0; i < 5; i++) if (r[i] === '#') { g.fillStyle = (j === 3 && i === 1) || (j === 2 && i === 1) ? '#FFFFFF' : j > 4 ? '#6CC4F0' : '#A8E0FF'; g.fillRect(ri(x + (i - 2.5) * s2 * 2), ri(y + (j - 6) * s2 * 2), ri(s2 * 2), ri(s2 * 2)); } });
}

/* ================= shContinue："继续游戏？"→ 按下 A → 读取 → 钻进屏幕（31.65 ~ 38.56） ================= */
const CONT = { menu: 32.2, press: ch(6, 9), load0: 35.75, load1: 37.45, zoom0: 37.45 };
function shContinue(g, t, s) {
  screenWorld(t, { after: (b) => {
    const dim = seg(t, CONT.menu - .3, CONT.menu);
    if (dim > 0) { b.fillStyle = `rgba(6,8,22,${.55 * dim})`; b.fillRect(0, 0, 192, 108); }
    if (t >= CONT.menu && t < CONT.load0) {
      // 菜单框
      const mx = 50, my = 30, mw = 92, mh = 46;
      prect(b, mx + 1, my + 1, mw, mh, '#05060F'); prect(b, mx, my, mw, mh, '#F4F1E8'); prect(b, mx + 1, my + 1, mw - 2, mh - 2, '#141A3A');
      scrText(b, '继续游戏？', mx + mw / 2, my + 5, '#FFE27A', { align: 'center' });
      scrText(b, '是', mx + 32, my + 26, '#FFFFFF'); scrText(b, '否', mx + 62, my + 26, '#8C90A8');
      if (t < CONT.press ? Math.floor(t * 3) % 2 === 0 : true) scrText(b, '▶', mx + 20, my + 26, '#FFE27A');
      if (t >= CONT.press && Math.floor((t - CONT.press) * 10) % 2 === 0) { b.fillStyle = 'rgba(255,255,255,.35)'; b.fillRect(mx + 18, my + 24, 26, 14); }
    }
    if (t >= CONT.load0) {                                          // 读取中
      b.fillStyle = '#06081A'; b.fillRect(0, 0, 192, 108);
      const p = seg(t, CONT.load0 + .1, CONT.load1 - .1);
      scrText(b, '读取中' + '...'.slice(0, 1 + Math.floor(t * 3) % 3), 60, 38, '#F4F1E8');
      prect(b, 40, 58, 112, 8, '#F4F1E8'); prect(b, 41, 59, 110, 6, '#06081A');
      for (let i = 0; i < Math.floor(p * 18); i++) prect(b, 42 + i * 6, 60, 5, 4, '#9AF0DC');
      scrText(b, '十七岁的夏天', 96, 74, '#9AA0C0', { align: 'center' });
    }
  } });
  const zu = E.in(seg(t, CONT.zoom0, s.e)), z = lerp(1.45, 1920 / 576, zu);
  const pressed = t >= CONT.press && t < CONT.press + .25;
  insertHH(g, t, BUF.tworld, { zoom: z, pressA: pressed, glowAmt: .45, after: (b, gl, L) => {
    // 大拇指：按 A 的时候从右下伸过来
    const tu = env(t, CONT.press - .5, CONT.press - .1, CONT.press + .35, CONT.press + .8);
    if (tu > 0) {
      const press = t >= CONT.press && t < CONT.press + .25 ? 3 : 0;
      const tipX = lerp(620, 486, E.out(tu)), tipY = lerp(330, 172 + press, E.out(tu)), baseX = tipX + 70, baseY = tipY + 120;
      const sk = shade(COL.her, .82), dk = shade(COL.her, .62), lt = shade(COL.her, 1.05);
      for (let k = 0; k <= 12; k++) pdisc(b, lerp(baseX, tipX, k / 12) + 2, lerp(baseY, tipY, k / 12) + 2, 17, dk);   // 影子那一侧
      for (let k = 0; k <= 12; k++) pdisc(b, lerp(baseX, tipX, k / 12), lerp(baseY, tipY, k / 12), 16, sk);
      for (let k = 0; k <= 12; k++) pdisc(b, lerp(baseX, tipX, k / 12) - 6, lerp(baseY, tipY, k / 12) - 4, 5, lt);    // 亮的一侧
      pell(b, tipX + 3, tipY + 2, 9, 7, shade(COL.her, 1.18)); pell(b, tipX + 2, tipY, 5, 3, shade(COL.her, 1.3));   // 指甲
    }
  } });
}
