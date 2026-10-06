'use strict';
/* scenes3.js：副歌后半到结尾。
   你的眼睛里我只有 144P → 追出去，不在原地等 → 车门在我面前 → 用力地关 → 尾声：会话已结束 */

/* ================= 第 23 句：为什么我在你眼里是如此的不堪（52.35 → 55.88） ================= */
/* 一只大眼睛。瞳孔里映着 Clawd，可是画质越唱越差：1080P → 480P → 240P → 144P。 */
const _rf = mk(120, 80), _rfg = _rf.getContext('2d'), _rf2 = mk(120, 80), _rf2g = _rf2.getContext('2d');
function bigEye(g, cx, cy, hw, hh, open, s, res) {
  const up = hh * 2 * open, lo = hh * 1.7 * open;
  const lid = () => { g.beginPath(); g.moveTo(cx - hw, cy); g.quadraticCurveTo(cx, cy - up, cx + hw, cy); g.quadraticCurveTo(cx, cy + lo, cx - hw, cy); g.closePath(); };
  g.save();
  lid();
  const sc = g.createRadialGradient(cx, cy, hh * .3, cx, cy, hw);
  sc.addColorStop(0, '#FBF8F3'); sc.addColorStop(.75, '#EFE6DE'); sc.addColorStop(1, '#D9B9B0');
  g.fillStyle = sc; g.fill();
  g.clip();
  const ix = cx + Math.sin(s * .9) * 10, iy = cy + 6, ir = hh * .82;
  const irg = g.createRadialGradient(ix, iy, ir * .3, ix, iy, ir);
  irg.addColorStop(0, '#5B8CFF'); irg.addColorStop(.7, '#2F5BEA'); irg.addColorStop(1, '#152A70');
  circ(g, ix, iy, ir); g.fillStyle = irg; g.fill();
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = 3;
  for (let i = 0; i < 48; i++) { const a = i / 48 * TAU; g.beginPath(); g.moveTo(ix + Math.cos(a) * ir * .45, iy + Math.sin(a) * ir * .45); g.lineTo(ix + Math.cos(a) * ir * (.85 + .1 * hash(i, 5)), iy + Math.sin(a) * ir * (.85 + .1 * hash(i, 5))); g.stroke(); }
  const pr = ir * .48;
  circ(g, ix, iy, pr); g.fillStyle = '#07080C'; g.fill();
  // 倒影：先把 Clawd 画在小画布上，再按画质缩小、用最近邻放大（马赛克）
  _rfg.clearRect(0, 0, 120, 80);
  clawd(_rfg, 60, 70, 6.5, { t: s, eyes: 'sad', shadow: false });
  const rw = Math.max(3, Math.round(120 / res)), rh = Math.max(2, Math.round(80 / res));
  _rf2g.clearRect(0, 0, 120, 80); _rf2g.imageSmoothingEnabled = true; _rf2g.drawImage(_rf, 0, 0, 120, 80, 0, 0, rw, rh);
  g.save(); circ(g, ix, iy, pr * 1.6); g.clip();
  g.imageSmoothingEnabled = false; g.globalAlpha = .92;
  g.drawImage(_rf2, 0, 0, rw, rh, ix - pr * 1.25, iy - pr * .95, pr * 2.5, pr * 1.67);
  g.imageSmoothingEnabled = true; g.restore();
  circ(g, ix - ir * .35, iy - ir * .38, ir * .16); g.fillStyle = 'rgba(255,255,255,.85)'; g.fill();
  circ(g, ix + ir * .3, iy + ir * .28, ir * .06); g.fillStyle = 'rgba(255,255,255,.6)'; g.fill();
  // 上眼皮的阴影
  g.fillStyle = 'rgba(80,40,40,.18)'; g.fillRect(cx - hw, cy - up, hw * 2, up * .35);
  g.restore();
  // 眼皮线和睫毛
  g.save(); g.strokeStyle = '#1A1210'; g.lineWidth = 12; g.lineCap = 'round';
  g.beginPath(); g.moveTo(cx - hw, cy); g.quadraticCurveTo(cx, cy - up, cx + hw, cy); g.stroke();
  g.lineWidth = 5; g.beginPath(); g.moveTo(cx - hw, cy); g.quadraticCurveTo(cx, cy + lo, cx + hw, cy); g.stroke();
  g.lineWidth = 9;
  for (let i = 1; i < 8; i++) {
    const u = i / 8, x = (1 - u) * (1 - u) * (cx - hw) + 2 * u * (1 - u) * cx + u * u * (cx + hw), y = (1 - u) * (1 - u) * cy + 2 * u * (1 - u) * (cy - up) + u * u * cy;
    const a = -Math.PI / 2 + (u - .5) * 1.4;
    g.beginPath(); g.moveTo(x, y - 4); g.lineTo(x + Math.cos(a) * 46 * open, y + Math.sin(a) * 46 * open - 4); g.stroke();
  }
  g.restore();
}
function sEye(g, s) {
  bgInk(g, 0, 0, '#0F1220');
  const q = [[52.35, 1, '1080P'], [ct(22, 6), 3, '480P'], [ct(22, 9), 6, '240P'], [ct(22, 12), 14, '144P'], [ct(22, 13), 24, '144P']];
  let res = 1, lab = '1080P';
  for (const [t0, r, l] of q) if (s > t0) { res = r; lab = l; }
  const blink = (t0) => { const v = (s - t0) / .22; return v > 0 && v < 1 ? Math.abs(1 - 2 * v) : 1; };
  const open = E.out(seg(s, 52.3, 52.62)) * blink(54.95);
  bigEye(g, 1300, 545, 520, 250, Math.max(.02, open), s, res);
  pill(g, 1300, 905, `画质  ${lab}`, 30, { fill: res >= 6 ? C.red : 'rgba(255,255,255,.12)', col: '#fff', k: 'mono' });
  lyricRow(g, s, 22, 0, 3, 150, 190, 140);
  lyricRow(g, s, 22, 3, 8, 150, 400, 112, { each: i => i === 6 ? { col: '#8FB0FF' } : i === 7 ? { col: '#8FB0FF' } : {} });
  lyricRow(g, s, 22, 8, 12, 150, 590, 112);
  const mz = s > ct(22, 13) ? 26 : 16;
  lyricRow(g, s, 22, 12, 14, 170, 820, 240, { mosaic: mz, col: C.white });
}

/* ================= 第 24–25 句：我还是追了出去 / 不想在这傻傻等待（55.88 → 59.48） ================= */
/* 横着跑：Clawd 从终端窗口里冲出去，把窗框撞碎；路过"在这里等待输入"的输入框，没停。 */
const V_RUN = 700;
function sChase(g, s) {
  const dx = (s - 55.88) * V_RUN;
  bgPaper(g, -dx, 0);
  g.fillStyle = 'rgba(60,40,30,.16)'; g.fillRect(0, 858, W, 5);
  for (let i = 0; i < 14; i++) { const xx = ((i * 260 - dx * 1.4) % (W + 260) + W + 260) % (W + 260) - 130; g.fillStyle = 'rgba(60,40,30,.12)'; g.fillRect(xx, 900 + (i % 3) * 30, 80 + (i % 4) * 30, 6); }
  const CX = 640, U = 15;
  const tOut = ct(23, 5);
  // 终端窗口：随着地面往左退；右边框在"出"的那一下被撞碎
  const edge = 1542 - dx, ww = 1180, wx = edge - ww;
  if (wx + ww > -40) {
    g.save();
    windowFrame(g, wx, 300, ww, 560, 'claude', { shadow: true });
    mono(g, '> 在这里等你…', wx + 50, 420, 34, 'rgba(230,230,230,.55)', { k: 'monoR' });
    if (s > tOut) { g.fillStyle = C.paper; g.fillRect(edge - 16, 290, 40, 590); }
    g.restore();
  }
  if (s > tOut) for (let i = 0; i < 26; i++) {
    const age = s - tOut, a = (hash(i, 2) - .5) * 1.6, sp = 380 + hash(i, 3) * 700;
    const px = edge + Math.cos(a) * sp * age + 60 * age, py = 330 + hash(i, 4) * 520 + Math.sin(a) * sp * age + 900 * age * age;
    if (age > 1.2) break;
    g.save(); g.translate(px, py); g.rotate(age * 8 * (hash(i, 5) - .5)); g.globalAlpha = 1 - age / 1.2;
    g.fillStyle = i % 3 ? '#25282F' : '#1A1C22'; g.fillRect(-14, -9, 18 + hash(i, 6) * 26, 12 + hash(i, 7) * 18); g.restore();
  }
  // "在这里等待输入"的输入框：路过，不停
  const sx = 2560 - dx;
  if (sx > -700 && sx < W + 100) {
    g.save();
    rr(g, sx, 600, 560, 96, 18); g.fillStyle = '#FFFFFF'; g.fill(); g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 3; g.stroke();
    mono(g, '>', sx + 30, 649, 36, C.clawd);
    mono(g, '等待输入…', sx + 70, 649, 34, '#A39E95', { k: 'monoR' });
    if ((s * 2) % 1 < .55) { g.fillStyle = '#333'; g.fillRect(sx + 270, 628, 16, 42); }
    g.fillStyle = '#6B655C'; g.fillRect(sx + 270, 696, 10, 162);
    pill(g, sx + 275, 560, '请在此等待', 26, { k: 'bold', fill: '#F4C542', col: '#3A2A00' });
    g.restore();
  }
  // 前面的你：越走越远
  const yu = seg(s, 55.9, 59.5);
  cursor(g, lerp(1640, 1820, yu), 610 + Math.sin(s * 7) * 6, lerp(7, 4.5, yu));
  // Clawd 跑
  for (let i = 0; i < 5; i++) { const age = ((s * 2.6 + i / 5) % 1); puff(g, CX - 110 - age * 260, 840 - age * 40, 18 + age * 34, .3 * (1 - age), '160,140,125'); }
  const jump = s > tOut - .15 && s < tOut + .35 ? Math.sin(Math.PI * seg(s, tOut - .15, tOut + .35)) * 120 : 0;
  clawd(g, CX, 858, U, { t: s, eyes: s < 57.5 ? 'shout' : 'wide', walk: s * 3.4, run: true, lean: .14, lift: jump + Math.abs(Math.sin(s * 3.4 * Math.PI)) * 8, sweat: 1, armL: .4, armR: .4 });
  speedLines(g, s, 'rgba(60,40,30,.25)', 12, -1, 260, 820, 7);
  // 歌词：前一句在 57.4 让位给后一句
  const A = 1 - seg(s, 57.38, 57.5);
  lyricRow(g, s, 23, 0, 3, 200, 190, 150, { light: true, col: C.ink, alpha: A });
  lyricRow(g, s, 23, 3, 5, 690, 190, 150, { light: true, col: C.ink, alpha: A, skew: -.15 });
  lyricRow(g, s, 23, 5, 7, 1130, 300, 210, { light: true, col: C.red, alpha: A, ext: 12, extCol: '#5A1414' });
  if (s > 57.4) {
    lyricRow(g, s, 24, 0, 4, 200, 190, 150, { light: true, col: C.ink });
    lyricRow(g, s, 24, 4, 6, 860, 190, 150, { light: true, col: C.clawdD, each: i => ({ rot: Math.sin(s * 9 + i) * .14 }) });
    lyricRow(g, s, 24, 6, 8, 1200, 190, 150, { light: true, col: '#9A958C' });
  }
}

/* ================= 街景（车门、关门共用） ================= */
const BLD = Array.from({ length: 26 }, (_, i) => ({ x: i * 86 - 40 + hash(i, 1) * 30, w: 70 + hash(i, 2) * 60, h: 160 + hash(i, 3) * 300, far: i % 2 }));
function street(g, s, night = 0) {
  const sky = vgrad(g, 0, 880, [[0, night > .5 ? '#0D0F1E' : '#2C2E62'], [.55, '#B95F7C'], [1, '#F2A65A']]);
  g.fillStyle = sky; g.fillRect(0, 0, W, H);
  if (night > 0) { g.fillStyle = `rgba(10,12,28,${night * .85})`; g.fillRect(0, 0, W, H); }
  circ(g, 1500, 640, 120); g.fillStyle = `rgba(255,214,140,${.55 * (1 - night)})`; g.fill();
  for (const b of BLD) {
    const y0 = 880 - b.h * (b.far ? .8 : 1);
    g.fillStyle = b.far ? `rgba(70,40,80,${1 - night * .3})` : `rgba(38,24,52,${1 - night * .2})`;
    g.fillRect(b.x, y0, b.w, 880 - y0);
    for (let wy = y0 + 20; wy < 860; wy += 36) for (let wx = b.x + 12; wx < b.x + b.w - 14; wx += 24) if (hash(wx, wy, 3) > .62) { g.fillStyle = `rgba(255,214,140,${.55 + .4 * night})`; g.fillRect(wx, wy, 10, 14); }
  }
  g.fillStyle = '#1B1626'; g.fillRect(0, 880, W, H - 880);
  g.fillStyle = 'rgba(255,255,255,.12)'; for (let x = 40; x < W; x += 220) g.fillRect(x, 980, 120, 8);
}

/* ================= 第 26 句：最后却看着车门在我面前（59.48 → 62.65） ================= */
function carInside(g) { cursor(g, -170, -270, 8); }
function sCarDoor(g, s) {
  const z = 1 + .08 * E.io(seg(s, 59.5, 62.65));
  g.save(); g.translate(900, 650); g.scale(z, z); g.translate(-900, -650);
  street(g, s);
  car(g, 1250, 880, 1.1, { door: 1, inside: carInside });
  const arrive = E.out(seg(s, 59.5, 60.35));
  const cx = lerp(-120, 640, arrive);
  clawd(g, cx, 880, 14, { t: s, eyes: arrive < 1 ? 'shout' : 'wide', walk: arrive < 1 ? s * 3.4 : undefined, run: true, look: [.4, -.2],
    sq: arrive >= 1 ? .05 * Math.abs(Math.sin(s * 9)) : 0, sweat: 1, lean: arrive < 1 ? .12 : 0, shadowCol: 'rgba(0,0,0,.35)' });
  g.restore();
  lyricRow(g, s, 25, 0, 3, 180, 190, 140);
  lyricRow(g, s, 25, 3, 5, 640, 190, 140);
  lyricRow(g, s, 25, 5, 7, 1110, 330, 160, { col: '#FFE27A', ext: 8, extCol: '#5A3A00' });
  lyricRow(g, s, 25, 7, 11, 180, 400, 140);
  // 指向车门的箭头
  if (s > ct(25, 6)) { const a = seg(s, ct(25, 6), ct(25, 6) + .15); g.save(); g.globalAlpha = a; g.strokeStyle = '#FFE27A'; g.lineWidth = 8; g.lineCap = 'round'; g.beginPath(); g.moveTo(1190, 410); g.lineTo(1150, 520); g.stroke(); poly(g, [[1140, 548], [1128, 500], [1172, 512]]); g.fillStyle = '#FFE27A'; g.fill(); g.restore(); }
}

/* ================= 第 27 句：用力地关（62.65 → 65.2，接着淡出） ================= */
const T_SLAM = ct(26, 3);
function sSlam(g, s) {
  const after = seg(s, T_SLAM + .25, 64.6);
  const night = E.io(seg(s, T_SLAM + .1, 64.8));
  const [kx, ky] = shakes(s, [[ct(26, 0), 6, .25], [ct(26, 1), 8, .25], [ct(26, 2), 10, .25], [T_SLAM, 40, .6]]);
  // 近景：镜头贴着车门和 Clawd
  const z = lerp(1.55, 1.25, E.io(after));
  g.save(); g.translate(kx, ky); g.translate(820, 700); g.scale(z, z); g.translate(-820, -700);
  street(g, s, night);
  const door = 1 - E.in(seg(s, 62.72, T_SLAM));
  const drive = s > T_SLAM + .35 ? Math.pow(s - T_SLAM - .35, 2) * 1300 : 0;
  car(g, 1250 + drive, 880, 1.1, { door, inside: carInside, wheel: drive / 60, tail: s > T_SLAM + .2 ? '#FF3B3B' : C.red });
  // 关门那一下：门缝里喷出的灰
  if (s > T_SLAM) for (let i = 0; i < 12; i++) { const age = s - T_SLAM; if (age > 1) break; puff(g, 1000 + hash(i, 1) * 40 - age * 160 * hash(i, 2), 560 + hash(i, 3) * 280, 20 + age * 70, .35 * (1 - age), '220,210,200'); }
  clawd(g, 640, 880, 14, { t: s, eyes: s < T_SLAM ? 'wide' : s < T_SLAM + .5 ? 'x' : 'closed', tears: s > T_SLAM + .4 ? s : 0, sq: s > T_SLAM && s < T_SLAM + .2 ? .2 : 0, shadowCol: 'rgba(0,0,0,.35)' });
  g.restore();
  // 闪白
  const fl = 1 - seg(s, T_SLAM, T_SLAM + .18);
  if (s > T_SLAM && fl > 0) { g.fillStyle = `rgba(255,255,255,${fl * .85})`; g.fillRect(0, 0, W, H); }
  // 冲击线
  if (s > T_SLAM && s < T_SLAM + .45) {
    const a = 1 - seg(s, T_SLAM, T_SLAM + .45);
    g.save(); g.strokeStyle = `rgba(255,255,255,${a})`; g.lineWidth = 10; g.lineCap = 'round';
    for (let i = 0; i < 16; i++) { const an = i / 16 * TAU + .2, r0 = 380 + (s - T_SLAM) * 900, r1 = r0 + 160; g.beginPath(); g.moveTo(960 + Math.cos(an) * r0, 540 + Math.sin(an) * r0 * .7); g.lineTo(960 + Math.cos(an) * r1, 540 + Math.sin(an) * r1 * .7); g.stroke(); }
    g.restore();
  }
  // 歌词
  const lf = 1 - seg(s, T_SLAM - .05, T_SLAM + .1);
  lyricRow(g, s, 26, 0, 1, 200, 200, 130, { alpha: lf, jit: 4 });
  lyricRow(g, s, 26, 1, 2, 360, 205, 165, { alpha: lf, jit: 6 });
  lyricRow(g, s, 26, 2, 3, 560, 215, 200, { alpha: lf, jit: 8 });
  glyph(g, s, T_SLAM, '关', 960, 560, 640, { from: 1.6, blur: 22, col: C.white, ext: 30, extCol: '#000', outline: 14, outlineCol: C.red, alpha: 1 - seg(s, 64.0, 64.9) * .85, sc: 1 - .08 * seg(s, T_SLAM, 64.9) });
  // 音乐剪断之前淡到黑
  const bk = seg(s, 64.75, 65.3);
  if (bk > 0) { g.fillStyle = `rgba(0,0,0,${bk})`; g.fillRect(0, 0, W, H); }
}

/* ================= 尾声（65.2 → 69.4） ================= */
/* 夜里，路灯下只剩 Clawd。终端打出"会话已结束"和 claude --resume；Clawd 说：那我再等一下下。 */
const END_LINE = '……那我再等一下下。';
const T_END = { msg1: 65.75, msg2: 66.45, bub: 67.2 };
const END_CPS = 12;              // 气泡里每秒打几个字
function sEnd(g, s) {
  g.fillStyle = '#0B0C11'; g.fillRect(0, 0, W, H);
  dotGrid(g, 'rgba(255,255,255,.035)', 44, 1.6);
  const on = seg(s, 65.25, 65.7);
  // 路灯
  g.save(); g.globalAlpha = on;
  g.fillStyle = '#23252E'; g.fillRect(1290, 260, 16, 600); g.fillRect(1180, 250, 126, 14);
  rr(g, 1150, 250, 70, 30, 8); g.fillStyle = '#2E3140'; g.fill();
  const cone = g.createLinearGradient(0, 280, 0, 880);
  cone.addColorStop(0, 'rgba(255,220,150,.38)'); cone.addColorStop(1, 'rgba(255,220,150,.04)');
  poly(g, [[1160, 278], [1210, 278], [1420, 880], [930, 880]]); g.fillStyle = cone; g.fill();
  ell(g, 1175, 880, 260, 34); g.fillStyle = 'rgba(255,220,150,.16)'; g.fill();
  g.fillStyle = '#16171D'; g.fillRect(0, 880, W, 6);
  g.restore();
  clawd(g, 1175, 880, 14, { t: s, eyes: s < T_END.bub ? 'closed' : 'sad', alpha: on, sq: Math.sin(s * 1.8) * .02, shadowCol: 'rgba(0,0,0,.4)' });
  // 终端
  if (s > T_END.msg1) {
    const [a] = typed('会话已结束', s, T_END.msg1, 18);
    dot(g, 168, 200, 11, '#9AA0A8');
    mono(g, a, 200, 200, 38, '#E6E3DC', { k: 'mono' });
  }
  if (s > T_END.msg2) {
    const [b] = typed('想继续这段对话：', s, T_END.msg2, 22);
    mono(g, '└', 170, 262, 32, 'rgba(230,230,230,.4)', { k: 'monoR' });
    mono(g, b, 200, 262, 32, '#9AA0A8', { k: 'monoR' });
    const [c] = typed('claude --resume', s, T_END.msg2 + .4, 24);
    mono(g, c, 200 + tw(g, '想继续这段对话：', 32, 'monoR'), 262, 32, C.clawdL, { k: 'mono' });
  }
  // Clawd 的气泡
  if (s > T_END.bub) {
    const a = seg(s, T_END.bub, T_END.bub + .12), sc = .7 + .3 * E.back(seg(s, T_END.bub, T_END.bub + .25));
    const [txt] = typed(END_LINE, s, T_END.bub + .15, END_CPS);
    g.save(); g.globalAlpha = a; g.translate(1175, 640); g.scale(sc, sc);
    bubble(g, -290, -70, 580, 120, { fill: '#F4F2ED', tail: -60 });
    g.font = F(46, 'black'); g.fillStyle = C.ink; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillText(txt, -250, -8);
    g.restore();
  }
  // 片尾署名
  if (s > 68.4) {
    const a = seg(s, 68.4, 68.8);
    glyph(g, s, 68.4, '还是分开', 420, 860, 64, { style: 'rise', col: 'rgba(240,238,232,.85)', alpha: a });
    mono(g, 'Claude MV · 甜菜', 420, 930, 26, 'rgba(240,238,232,.5)', { align: 'center', k: 'monoR', alpha: a });
  }
}
