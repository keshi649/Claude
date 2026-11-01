'use strict';
/* props.js：室内和道具。她的卧室（窗户、窗帘、月光、床、床头柜、电子钟、星星灯串）、飞起来的床、
   漂起来的小东西、电子钟的数字。 */

function buildProps() {
  // 墙纸：很淡的竖条和小点
  const c = mk(W, H), g = c.getContext('2d'), r = R(41);
  g.fillStyle = vgrad(g, 0, H, [[0, '#15183F'], [.7, '#20215A'], [1, '#262463']]); g.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 48) { g.fillStyle = 'rgba(255,255,255,.008)'; g.fillRect(x, 0, 22, H); }
  for (let i = 0; i < 260; i++) { g.fillStyle = 'rgba(220,210,255,.05)'; circ(g, r() * W, r() * H, 1.5 + r() * 1.5); g.fill(); }
  PROP.wallHer = c;
}
const PROP = {};

/* ---------------- 七段数码管数字（电子钟、微波炉） ---------------- */
const SEG7 = { '0': 'abcfed', '1': 'bc', '2': 'abged', '3': 'abgcd', '4': 'fgbc', '5': 'afgcd', '6': 'afgedc', '7': 'abc', '8': 'abcdefg', '9': 'abcdfg', '-': 'g', ' ': '' };
function seg7(g, str, x, y, h, col, o = {}) {
  const w = h * .52, th = h * .12, gap = h * .2;
  let cx = x;
  g.save();
  for (const ch of str) {
    if (ch === ':') {
      if (o.colon !== false) { g.fillStyle = col; circ(g, cx + th, y + h * .3, th * .55); g.fill(); circ(g, cx + th, y + h * .7, th * .55); g.fill(); }
      cx += th * 2 + gap * .6; continue;
    }
    const on = SEG7[ch] || '';
    const S = {
      a: [cx + th, y, w - th * 2, th], d: [cx + th, y + h - th, w - th * 2, th], g: [cx + th, y + h / 2 - th / 2, w - th * 2, th],
      f: [cx, y + th * .6, th, h / 2 - th * .9], b: [cx + w - th, y + th * .6, th, h / 2 - th * .9],
      e: [cx, y + h / 2 + th * .3, th, h / 2 - th * .9], c: [cx + w - th, y + h / 2 + th * .3, th, h / 2 - th * .9],
    };
    for (const k in S) { g.fillStyle = on.includes(k) ? col : rgba(col, .08); const [a, b, cw, chh] = S[k]; rr(g, a, b, cw, chh, th * .4); g.fill(); }
    cx += w + gap;
  }
  g.restore();
  if (o.glow) glow(g, x + (cx - x) / 2, y + h / 2, (cx - x) * .8, col, o.glow);
  return cx - x;
}

/* ---------------- 床 ----------------
   x, y：床垫上沿的左端；w：床长。o：blanket（被子颜色）, lift, tilt, edgeWave（被角飘动）, s */
function bedFrame(g, x, y, w, o = {}) {
  const s = o.s || 0;
  // 床头板
  g.fillStyle = '#3A2D55'; rr(g, x - 30, y - 150, 52, 290, 20); g.fill();
  g.fillStyle = 'rgba(190,200,255,.18)'; rr(g, x - 26, y - 146, 10, 280, 6); g.fill();
  // 床架、床腿
  g.fillStyle = '#2F2548'; rr(g, x - 10, y + 95, w + 20, 46, 10); g.fill();
  g.fillStyle = '#251D3C'; g.fillRect(x + 10, y + 135, 22, 40); g.fillRect(x + w - 30, y + 135, 22, 40);
  // 床垫
  g.fillStyle = '#CFCBEA'; rr(g, x, y, w, 100, 18); g.fill();
  g.fillStyle = 'rgba(80,70,140,.25)'; g.fillRect(x, y + 70, w, 30);
}
function pillow(g, x, y, w, h, col = '#E9E5FA') {
  g.fillStyle = col; rr(g, x, y, w, h, h * .45); g.fill();
  g.fillStyle = 'rgba(120,110,180,.25)'; rr(g, x + 6, y + h * .55, w - 12, h * .4, h * .3); g.fill();
}
/* 被子：从 x0 盖到 x1（床尾垂下去），top 是被子鼓起来的轮廓（函数：x → y） */
function blanket(g, x0, x1, top, yHang, o = {}) {
  const s = o.s || 0, wave = o.wave || 0, col = o.col || '#8E90D8';
  g.save();
  g.beginPath();
  g.moveTo(x0, top(x0));
  for (let x = x0; x <= x1; x += 12) g.lineTo(x, top(x));
  // 床尾垂下来的一角，风大时飘起来
  const fl = Math.sin(s * 6) * 10 * wave;
  g.quadraticCurveTo(x1 + 30 + wave * 30, top(x1) + 20, x1 + 22 + wave * 40, yHang - wave * 60 + fl);
  for (let x = x1 + 22; x >= x0 - 10; x -= 24) g.lineTo(x + wave * 40 * ((x - x0) / (x1 - x0)) ** 3, yHang + Math.sin(x * .03 + s * 4) * (4 + wave * 10) - wave * 60 * ((x - x0) / (x1 - x0)) ** 3 + fl * ((x - x0) / (x1 - x0)));
  g.lineTo(x0 - 10, top(x0) + 10);
  g.closePath();
  g.fillStyle = vgrad(g, 640, yHang, [[0, shade(col, 1.12)], [.5, col], [1, shade(col, .78)]]); g.fill();
  g.clip();
  // 被子上的小星星
  g.fillStyle = 'rgba(255,240,200,.35)';
  for (let i = 0; i < 26; i++) { const sx = x0 + hash(i, 5) * (x1 - x0 + 40), sy = top(sx) + 18 + hash(i, 6) * (yHang - top(sx) - 20); star5(g, sx, sy, 5 + hash(i, 7) * 3); }
  // 褶子
  g.strokeStyle = 'rgba(50,40,110,.18)'; g.lineWidth = 3;
  for (let i = 0; i < 5; i++) { const fx = x0 + (i + .5) / 5 * (x1 - x0); g.beginPath(); g.moveTo(fx, top(fx) + 10); g.quadraticCurveTo(fx + 20, (top(fx) + yHang) / 2, fx - 6, yHang - 6); g.stroke(); }
  g.restore();
  // 翻过来的被头
  if (o.fold != null) { const fx = o.fold; g.fillStyle = shade(col, 1.25); g.beginPath(); g.ellipse(fx + 12, top(fx) + 14, 22, 30, -.3, 0, TAU); g.fill(); }
}
function star5(g, x, y, r, rot = -Math.PI / 2) {
  g.beginPath();
  for (let i = 0; i < 10; i++) { const a = rot + i * Math.PI / 5, rr_ = i % 2 ? r * .45 : r; g.lineTo(x + Math.cos(a) * rr_, y + Math.sin(a) * rr_); }
  g.closePath(); g.fill();
}

/* ---------------- 小道具 ---------------- */
function mug(g, x, y, s, col = '#F2E6D8', o = {}) {
  g.save(); g.translate(x, y); g.rotate(o.rot || 0); g.scale(s, s);
  g.strokeStyle = shade(col, .85); g.lineWidth = 5; g.beginPath(); g.arc(20, -18, 11, -1.3, 1.3); g.stroke();
  g.fillStyle = col; rr(g, -18, -42, 38, 42, 7); g.fill();
  g.fillStyle = rgba('#000000', .1); g.fillRect(4, -42, 16, 42);
  if (o.ears) { g.fillStyle = col; poly(g, [[-16, -42], [-12, -54], [-5, -42]]); g.fill(); poly(g, [[6, -42], [13, -54], [17, -42]]); g.fill(); }
  if (o.milk) { g.fillStyle = '#FFFBF2'; ell(g, 1, -40, 17, 4); g.fill(); }
  g.restore();
}
function book(g, x, y, w, h, col, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = col; rr(g, -w / 2, -h / 2, w, h, 3); g.fill();
  g.fillStyle = '#F4EEDC'; g.fillRect(-w / 2 + 3, -h / 2 + 3, w - 6, 5);
  g.fillStyle = rgba('#FFFFFF', .25); g.fillRect(-w / 2, -h / 2, 5, h);
  g.restore();
}
function slipper(g, x, y, s, rot = 0, col = '#F3B9C8') {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  g.fillStyle = shade(col, .8); ell(g, 0, 0, 34, 11); g.fill();
  g.fillStyle = col; ell(g, 10, -6, 20, 12); g.fill();
  g.fillStyle = '#FFFFFF'; circ(g, 22, -10, 5); g.fill();
  g.restore();
}
/* 一串星星灯：从 (x0,y0) 到 (x1,y1) 垂成弧，n 个灯泡 */
function fairyLights(g, s, x0, y0, x1, y1, sag, n, a = 1) {
  g.save(); g.strokeStyle = 'rgba(30,25,60,.8)'; g.lineWidth = 2;
  g.beginPath(); g.moveTo(x0, y0); g.quadraticCurveTo((x0 + x1) / 2, (y0 + y1) / 2 + sag * 2, x1, y1); g.stroke(); g.restore();
  for (let i = 1; i < n; i++) {
    const u = i / n, x = (1 - u) * (1 - u) * x0 + 2 * u * (1 - u) * (x0 + x1) / 2 + u * u * x1;
    const y = (1 - u) * (1 - u) * y0 + 2 * u * (1 - u) * ((y0 + y1) / 2 + sag * 2) + u * u * y1;
    const tw = .75 + .25 * Math.sin(s * 2.2 + i * 1.7);
    const col = i % 3 === 0 ? '#FFC9E0' : '#FFDCA8';
    g.fillStyle = col; circ(g, x, y + 5, 4.5); g.fill();
    glow(g, x, y + 5, 30, col, .55 * tw * a);
  }
}
/* 拍立得（墙上、空中漂的回忆） */
function polaroid(g, x, y, w, rot, drawPhoto, o = {}) {
  const h = w * 1.18, pw = w * .88, ph = w * .84;
  g.save(); g.translate(x, y); g.rotate(rot);
  if (o.a != null) g.globalAlpha *= o.a;
  g.fillStyle = 'rgba(0,0,0,.28)'; rr(g, -w / 2 + 5, -h / 2 + 8, w, h, 4); g.fill();
  g.fillStyle = '#F7F3EA'; rr(g, -w / 2, -h / 2, w, h, 4); g.fill();
  g.save(); g.beginPath(); g.rect(-pw / 2, -h / 2 + w * .06, pw, ph); g.clip(); g.translate(-pw / 2, -h / 2 + w * .06);
  drawPhoto(g, pw, ph); g.restore();
  if (o.caption) text(g, o.caption, 0, h / 2 - w * .14, w * .1, { k: 'hand', col: '#4A3A50' });
  if (o.tape) { g.fillStyle = 'rgba(255,240,200,.6)'; g.save(); g.translate(0, -h / 2); g.rotate(-.08); g.fillRect(-w * .18, -w * .05, w * .36, w * .1); g.restore(); }
  g.restore();
}

/* ---------------- 她的卧室 ----------------
   o：open（窗户开了多少 0..1）, wind（风 0..1）, beam（月光强度）, float（东西漂起来 0..1）,
      lift（床抬起来多少像素）, bedDX（床往窗户挪）, sit（坐起来 0..1）, eyes, plush（玩偶眼睛发光 0..1）,
      clock（电子钟的字）, she（画不画她） */
function herRoom(g, s, o = {}) {
  const T = o.T ?? 0, open = o.open || 0, wind = o.wind || 0, fl = o.float || 0;
  g.drawImage(PROP.wallHer, 0, 0);
  // ---- 窗外 ----
  const WX0 = 1160, WX1 = 1700, WY0 = 110, WY1 = 700;
  g.save(); g.beginPath(); g.rect(WX0, WY0, WX1 - WX0, WY1 - WY0); g.clip();
  g.fillStyle = vgrad(g, WY0, WY1, [[0, '#0A0F2C'], [.6, '#1B2058'], [1, '#3D347A']]); g.fillRect(WX0, WY0, WX1 - WX0, WY1 - WY0);
  g.save(); g.translate(WX0, WY0 - 60); g.scale(.45, .45); g.drawImage(TEX.stars, 0, 0); g.restore();
  moon(g, 1530, 250, 74, { haloA: .7 });
  cityLayer(g, CITY.far, 300 + s * 2, WY1 + 20, .55);
  cityLayer(g, CITY.mid, 900 + s * 3, WY1 + 60, .6);
  g.restore();
  // 窗框、窗扇（往外推开：越开越窄）
  const frameC = '#313666', lit = 'rgba(200,210,255,.45)';
  const pane = (xh, dirn) => {   // xh：铰链所在的边，dirn：+1 往右开
    const wfull = (WX1 - WX0) / 2, ww = wfull * (1 - open * .82);
    const xa = dirn > 0 ? xh : xh - ww;
    const skew = open * 40;
    g.save();
    g.beginPath(); g.moveTo(xa, WY0 - (dirn > 0 ? 0 : skew)); g.lineTo(xa + ww, WY0 - (dirn > 0 ? skew : 0)); g.lineTo(xa + ww, WY1 + (dirn > 0 ? skew : 0)); g.lineTo(xa, WY1 + (dirn > 0 ? 0 : skew)); g.closePath();
    g.fillStyle = `rgba(150,170,255,${.06 + open * .04})`; g.fill();
    g.strokeStyle = frameC; g.lineWidth = 14; g.stroke();
    g.strokeStyle = lit; g.lineWidth = 2; g.stroke();
    g.restore();
  };
  pane(WX0, 1); pane(WX1, -1);
  g.fillStyle = frameC; g.fillRect(WX0 - 24, WY0 - 24, WX1 - WX0 + 48, 24); g.fillRect(WX0 - 24, WY0, 24, WY1 - WY0); g.fillRect(WX1, WY0, 24, WY1 - WY0);
  g.fillStyle = '#3B4180'; g.fillRect(WX0 - 40, WY1, WX1 - WX0 + 80, 26); g.fillStyle = lit; g.fillRect(WX0 - 40, WY1, WX1 - WX0 + 80, 3);
  // ---- 月光 ----
  const beam = (o.beam ?? .5) * (1 + open * .8);
  g.save(); g.globalCompositeOperation = 'lighter';
  g.beginPath(); g.moveTo(WX0, WY0 + 20); g.lineTo(WX1, WY0 + 20); g.lineTo(WX1 - 520, 1080); g.lineTo(WX0 - 760, 1080); g.closePath();
  g.fillStyle = lgrad(g, 1400, 200, 900, 1000, [[0, `rgba(140,160,255,${.16 * beam})`], [1, `rgba(140,160,255,${.03 * beam})`]]); g.fill();
  g.restore();
  // 窗帘
  curtain(g, s, 1070, 84, 140, 690, wind, -1);
  curtain(g, s, 1650, 84, 140, 690, wind * .8, 1);
  g.fillStyle = '#2A2E5A'; g.fillRect(1040, 80, 780, 9);
  // ---- 地板、地毯 ----
  g.fillStyle = vgrad(g, 880, H, [[0, '#191838'], [1, '#100F26']]); g.fillRect(0, 880, W, H - 880);
  g.strokeStyle = 'rgba(255,255,255,.035)'; g.lineWidth = 2; for (let y = 900; y < H; y += 34) { g.beginPath(); g.moveTo(0, y); g.lineTo(W, y); g.stroke(); }
  g.fillStyle = '#2A2350'; ell(g, 660, 930, 520, 60); g.fill(); g.strokeStyle = 'rgba(255,200,230,.12)'; g.lineWidth = 4; ell(g, 660, 930, 470, 48); g.stroke();
  // ---- 星星灯串、墙上的拍立得 ----
  fairyLights(g, s, 120, 590, 560, 572, 26, 11);
  fairyLights(g, s, 560, 572, 1000, 596, 28, 11);
  if (!o.noPhoto) polaroid(g, 1005 + fl * 30, 430 - fl * 60, 92, .08 + fl * .5, (pg, w, h) => { pg.fillStyle = '#F2C79A'; pg.fillRect(0, 0, w, h); pg.fillStyle = '#E58BAA'; circ(pg, w * .35, h * .6, w * .16); pg.fill(); pg.fillStyle = '#7F8CC8'; circ(pg, w * .65, h * .58, w * .17); pg.fill(); pg.fillStyle = '#3A2630'; circ(pg, w * .35, h * .38, w * .12); pg.fill(); pg.fillStyle = '#1E1D27'; circ(pg, w * .65, h * .36, w * .12); pg.fill(); }, { tape: true });
  // ---- 床头柜、钟、杯子 ----
  g.fillStyle = '#2E2550'; rr(g, 930, 722, 140, 160, 8); g.fill(); g.fillStyle = '#3A3062'; g.fillRect(930, 722, 140, 12);
  g.fillStyle = '#221C3E'; g.fillRect(946, 760, 108, 3); g.fillStyle = '#C9B7FF'; circ(g, 1000, 800, 4); g.fill();
  g.fillStyle = '#16142C'; rr(g, 942, 672, 98, 50, 9); g.fill();
  seg7(g, o.clock || '03:07', 954, 684, 26, '#FF6F7D', { glow: .55, colon: Math.floor(s * 2) % 2 === 0 });
  const mf = E.out(clamp(fl * 1.4 - .1));
  mug(g, 1060 - mf * 30, 722 - mf * 210 + Math.sin(s * 2.1) * 8 * mf, 1, '#F3E3D3', { rot: mf * .6 * Math.sin(s * 1.3), ears: true });
  // ---- 地上漂起来的东西 ----
  const f2 = E.out(clamp(fl * 1.3 - .2));
  book(g, 300 + f2 * 760, 900 - f2 * 300 + Math.sin(s * 1.7) * 10 * f2, 90, 22, '#6A8FD0', f2 * .9 + Math.sin(s) * .1 * f2);
  book(g, 360 + f2 * 900, 878 - f2 * 420 + Math.sin(s * 1.5 + 1) * 10 * f2, 80, 20, '#E07B8E', -f2 * .5);
  slipper(g, 760 + f2 * 60, 905 - f2 * 270 + Math.sin(s * 2 + 2) * 9 * f2, 1, f2 * 1.4);
  slipper(g, 840 + f2 * 120, 912 - f2 * 200 + Math.sin(s * 2.3 + 3) * 9 * f2, 1, -f2 * .9);
  // ---- 床 ----
  const lift = o.lift || 0, bdx = o.bedDX || 0, bob = lift > 0 ? Math.sin(s * 3) * 6 * Math.min(1, lift / 40) : 0;
  g.save(); g.translate(bdx, -lift - bob); if (o.bedRot) { g.translate(600, 760); g.rotate(o.bedRot); g.translate(-600, -760); }
  if (lift > 2) withAlpha(g, clamp(lift / 120), () => glow(g, 600, 820 + lift, 420, '#8FA2FF', .25));
  bedFrame(g, 300, 690, 600, { s });
  pillow(g, 316, 640, 150, 56);
  // 她：躺着（转 -90°）→ 坐起来
  const sit = o.sit || 0, u = 46;
  if (o.she !== false) {
    const pose = lerpPose(POSE.stand, POSE.sit, E.io(sit));
    pose.aN = [lerp(.05, 1.1, sit), lerp(.1, 1.2, sit)]; pose.aF = [lerp(-.05, .9, sit), lerp(.1, 1.3, sit)];
    person(g, { who: 'she', x: 552 + sit * 10, y: 700 - sit * 6, u, face: 1, rot: lerp(-Math.PI / 2, 0, E.io(sit)), pose, t: s, eyes: o.eyes || 'open', mouth: o.mouth || 'n', blush: .5, wind: [-wind * 1.5, 0], light: LIGHT.room });
  }
  // 被子盖在上面
  const bodyTop = x => x < 456 ? 690 : 656 + Math.sin(clamp((x - 456) / 360) * Math.PI) * -20 * (1 - sit) + (x > 816 ? (x - 816) * .08 : 0);
  const topF = sit > 0 ? (x => lerp(bodyTop(x), x < 560 ? 712 : 690 - Math.sin(clamp((x - 560) / 300) * Math.PI) * 26, E.io(sit))) : bodyTop;
  blanket(g, 446 + sit * 94, 900, topF, 818, { s, wave: wind, col: '#8E90D8', fold: 446 + sit * 94 });
  // 玩偶：坐在床尾的被子上
  const pg = o.plush || 0;
  plush(g, { x: 836, y: topF(836) + 8, s: 7.5, col: PLUSH.pink, eyes: pg > .3 ? 'glow' : (Math.floor(s * 1.3) % 5 === 0 ? 'blink' : 'n'), glow: pg, tilt: -.12 + Math.sin(s * 2) * .04 * pg, blush: 1 });
  g.restore();
  // ---- 灰尘 / 光点：在月光里往上飘 ----
  for (const p of floaters(s, 7, 46, [500, 120, 1500, 1000], { vy: 12 + fl * 50, amp: 18 })) {
    const inBeam = clamp(1 - Math.abs((p.x - (1430 - (p.y - 110) * .62)) / 380));
    const a = (.15 + .55 * p.tw) * inBeam * (.35 + fl);
    if (a < .02) continue;
    g.fillStyle = `rgba(220,228,255,${a})`; circ(g, p.x, p.y, 1.2 + p.sz * 2); g.fill();
    if (p.sz > .7) glow(g, p.x, p.y, 10, '#C8D4FF', a * .6);
  }
}
/* 窗帘：从 (x, y) 挂下来，宽 w，长 h；wind 风；side：-1 左边那幅（风往左吹进屋） */
function curtain(g, s, x, y, w, h, wind, side) {
  const n = 7, pts = [];
  for (let i = 0; i <= 20; i++) {
    const v = i / 20;
    const billow = wind * (Math.sin(s * 2.6 + v * 3) * .35 + .9) * v * v * 170;
    pts.push([billow * -1, v * h]);
  }
  g.save(); g.translate(x, y);
  g.beginPath(); g.moveTo(0, 0); g.lineTo(w, 0);
  for (let i = 0; i <= 20; i++) g.lineTo(w + pts[i][0] * (side < 0 ? 1 : .6) + Math.sin(i * .9 + s * 3) * 4 * wind, pts[i][1]);
  for (let i = 20; i >= 0; i--) g.lineTo(pts[i][0] * (side < 0 ? 1.15 : .7), pts[i][1] + (i === 20 ? Math.sin(s * 4) * 10 * wind : 0));
  g.closePath();
  g.fillStyle = lgrad(g, 0, 0, w, 0, [[0, 'rgba(206,200,240,.42)'], [.5, 'rgba(232,228,255,.55)'], [1, 'rgba(206,200,240,.42)']]); g.fill();
  g.clip();
  g.strokeStyle = 'rgba(120,110,190,.25)'; g.lineWidth = 6;
  for (let k = 1; k < n; k++) { g.beginPath(); g.moveTo(k * w / n, 0); for (let i = 0; i <= 20; i++) g.lineTo(k * w / n + pts[i][0] * (side < 0 ? 1.05 : .65) + Math.sin(i * .7 + k) * 5, pts[i][1]); g.stroke(); }
  g.restore();
}

/* ---------------- 飞起来的床 ----------------
   (x, y)：床垫上沿的中点；sc 缩放。o：s, who（谁坐在上面）, pose, eyes, mouth, plush（玩偶颜色，null 不画）, hugPlush,
   wind（风 0..1，越大被子飘得越厉害）, glowA（床底的魔法光）, light, she（false 不画人）, plushEyes, plushGlow, look */
function flyingBed(g, s, x, y, sc, o = {}) {
  const wind = o.wind ?? 1, st = s * 1.0;
  g.save(); g.translate(x, y); g.scale(sc, sc); if (o.rot) g.rotate(o.rot);
  // 床底的光
  glow(g, 0, 110, 520, o.glowCol || '#9FB4FF', (o.glowA ?? .35));
  glow(g, -40, 120, 260, '#FFC6E8', (o.glowA ?? .35) * .6);
  // 床头板、床架、床垫
  g.fillStyle = '#3A2D55'; rr(g, -335, -150, 50, 280, 20); g.fill();
  g.fillStyle = 'rgba(200,210,255,.22)'; rr(g, -331, -146, 9, 270, 5); g.fill();
  g.fillStyle = '#2F2548'; rr(g, -310, 95, 620, 44, 10); g.fill();
  g.fillStyle = '#251D3C'; g.fillRect(-290, 135, 22, 34); g.fillRect(268, 135, 22, 34);
  g.fillStyle = '#CFCBEA'; rr(g, -300, 0, 600, 100, 18); g.fill();
  g.fillStyle = 'rgba(80,70,140,.25)'; g.fillRect(-300, 70, 600, 30);
  pillow(g, -292, -52, 140, 54);
  // 人
  const who = o.who || 'she';
  if (o.she !== false) {
    const pose = o.pose || (o.hugPlush ? POSE.sitHug : POSE.sit);
    person(g, { who, x: -150, y: 8, u: 46, face: 1, pose, t: s, eyes: o.eyes || 'open', mouth: o.mouth || 'smile', blush: .6, wind: [-2.2 * wind, -.2 * wind], light: o.light || LIGHT.moon, outfit: o.outfit, tired: o.tired });
  }
  // 被子：盖住腿，前面垂下来，后角被风掀起来
  g.save();
  g.beginPath();
  const top = xx => -6 - Math.sin(clamp((xx + 200) / 360) * Math.PI) * 26;
  g.moveTo(-205, top(-205));
  for (let xx = -205; xx <= 300; xx += 15) g.lineTo(xx, top(xx));
  g.quadraticCurveTo(326, 10, 318, 60);
  for (let xx = 318; xx >= -230; xx -= 14) {
    const v = (318 - xx) / 548;
    g.lineTo(xx - v * v * 60 * wind, 150 + Math.sin(xx * .03 + st * 7) * (6 + 10 * wind * v) - v * v * 70 * wind + Math.sin(st * 9 + v * 4) * 12 * wind * v * v);
  }
  g.quadraticCurveTo(-260 - 30 * wind, 40 - 40 * wind, -205, top(-205) + 8);
  g.closePath();
  const bc = o.blanket || '#8E90D8';
  g.fillStyle = vgrad(g, -30, 150, [[0, shade(bc, 1.14)], [.6, bc], [1, shade(bc, .76)]]); g.fill();
  g.clip();
  g.fillStyle = 'rgba(255,240,200,.35)';
  for (let i = 0; i < 18; i++) star5(g, -220 + hash(i, 15) * 540, 10 + hash(i, 16) * 130, 5 + hash(i, 17) * 3);
  g.restore();
  // 玩偶
  if (o.plush) {
    const px = o.hugPlush ? -60 : 150, py = o.hugPlush ? -88 : top(150) + 4;
    plush(g, { x: px, y: py, s: 6.5, col: o.plush, eyes: o.plushEyes || 'n', glow: o.plushGlow || 0, tilt: Math.sin(st * 3) * .05, blush: 1, wave: o.plushWave || 0, waveR: o.plushWave ? 1 : 0 });
  }
  g.restore();
  // 床后面拖着的光点
  if (o.trail !== false) {
    for (let i = 0; i < 26; i++) {
      const age = ((st * 1.6 + hash(i, 1)) % 1);
      const px = x - (320 + age * 520) * sc, py = y + (40 + (hash(i, 2) - .5) * 220 + Math.sin(st * 3 + i) * 12) * sc;
      const a = (1 - age) * .9;
      const col = i % 3 ? '#FFE8B8' : '#FFC2E2';
      g.fillStyle = rgba(col, a); circ(g, px, py, (2 + hash(i, 3) * 3) * sc); g.fill();
      glow(g, px, py, 16 * sc, col, a * .5);
    }
  }
}

/* ---------------- 泡泡、罐子、散景 ---------------- */
function bubble(g, x, y, r, a = 1, s = 0) {
  if (a <= .01 || r < 1) return;
  g.save(); g.globalAlpha *= a;
  g.fillStyle = rgrad(g, x, y, r * .2, r, [[0, 'rgba(200,230,255,.02)'], [.75, 'rgba(200,230,255,.08)'], [1, 'rgba(220,240,255,.32)']]);
  circ(g, x, y, r); g.fill();
  const cg = g.createConicGradient(s * .8 + x * .01, x, y);
  [['#FFB3E1', 0], ['#B3F0FF', .25], ['#FFF3B3', .5], ['#C9B3FF', .75], ['#FFB3E1', 1]].forEach(([c, o]) => cg.addColorStop(o, rgba(c, .55)));
  g.strokeStyle = cg; g.lineWidth = Math.max(1.2, r * .06); circ(g, x, y, r * .97); g.stroke();
  g.strokeStyle = 'rgba(255,255,255,.75)'; g.lineWidth = Math.max(1, r * .07); g.lineCap = 'round';
  g.beginPath(); g.arc(x, y, r * .72, -2.5, -1.75); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.8)'; circ(g, x + r * .35, y + r * .4, r * .06); g.fill();
  g.restore();
  glow(g, x, y, r * 1.6, '#BFE8FF', a * .25);
}
function jar(g, x, y, sc, fill, s) {
  g.save(); g.translate(x, y); g.scale(sc, sc);
  const n = Math.round(fill * 9);
  glow(g, 0, -60, 150, '#A8E6FF', .25 + fill * .6);
  for (let i = 0; i < n; i++) { const bx = (hash(i, 31) - .5) * 60, by = -20 - hash(i, 32) * 90 + Math.sin(s * 2 + i) * 4; bubble(g, bx, by, 10 + hash(i, 33) * 9, .9, s); glow(g, bx, by, 26, '#E0F7FF', .5); }
  g.fillStyle = 'rgba(190,225,255,.14)'; rr(g, -50, -128, 100, 128, 22); g.fill();
  g.strokeStyle = 'rgba(220,240,255,.75)'; g.lineWidth = 3; rr(g, -50, -128, 100, 128, 22); g.stroke();
  g.fillStyle = 'rgba(255,255,255,.35)'; rr(g, -40, -112, 10, 90, 5); g.fill();
  g.fillStyle = '#C79A6A'; rr(g, -36, -148, 72, 24, 6); g.fill(); g.fillStyle = '#A57B50'; g.fillRect(-36, -132, 72, 5);
  g.restore();
}
/* 散景光斑：远处城市的灯，虚掉 */
function bokeh(g, s, seed, n, cols, o = {}) {
  const rs = R(seed);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const x = ((rs() * (W + 400) - (s * (o.vx ?? 20) * (.5 + rs())) % (W + 400)) + W + 400) % (W + 400) - 200;
    const y = (o.y0 ?? 0) + rs() * ((o.y1 ?? H) - (o.y0 ?? 0)) + Math.sin(s * .5 + i) * 6;
    const r = (o.rmin ?? 10) + rs() * ((o.rmax ?? 50) - (o.rmin ?? 10)), c = cols[Math.floor(rs() * cols.length)];
    const a = (o.a ?? .25) * (.4 + .6 * rs()) * (.85 + .15 * Math.sin(s * 1.3 + i * 2));
    g.fillStyle = rgrad(g, x, y, r * .55, r, [[0, rgba(c, a)], [.85, rgba(c, a * .9)], [1, rgba(c, 0)]]);
    circ(g, x, y, r); g.fill();
  }
  g.restore();
}

/* ---------------- 纸条（诗句） ---------------- */
function paperSlip(g, x, y, w, rot, txt, flap = 0, a = 1) {
  if (a <= .01) return;
  const h = w * .42, sx = Math.cos(flap) * .85 + .15;
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(sx, 1); g.globalAlpha *= a;
  glow(g, 0, 0, w * .9, '#FFE7B0', .3);
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(-w / 2 + 4, -h / 2 + 5, w, h);
  g.fillStyle = '#FBF5E6'; g.fillRect(-w / 2, -h / 2, w, h);
  g.fillStyle = 'rgba(200,170,120,.25)'; for (let k = 1; k < 3; k++) g.fillRect(-w / 2 + 6, -h / 2 + k * h / 3, w - 12, 1.5);
  if (sx > .35) text(g, txt, 0, 2, w * .2, { k: 'hand', col: '#5A4258' });
  g.restore();
}

/* ================= 他的屋子 ================= */
/* 厨房：深夜，只开着吊柜下面那盏灯。o：micro（微波炉在转 0..1）, disp（显示屏的字）, door（门开 0..1）, clock（墙上钟） */
function hisKitchen(g, s, o = {}) {
  g.fillStyle = vgrad(g, 0, H, [[0, '#141A33'], [1, '#1C2140']]); g.fillRect(0, 0, W, H);
  // 窗：外面是夜里的城
  const WX0 = 1180, WX1 = 1700, WY0 = 150, WY1 = 520;
  g.save(); g.beginPath(); g.rect(WX0, WY0, WX1 - WX0, WY1 - WY0); g.clip();
  g.fillStyle = vgrad(g, WY0, WY1, [[0, '#0A0F2C'], [1, '#2B2B66']]); g.fillRect(WX0, WY0, WX1 - WX0, WY1 - WY0);
  g.save(); g.translate(WX0, WY0 - 100); g.scale(.4, .4); g.drawImage(TEX.stars, -600, 0); g.restore();
  moon(g, 1300, 240, 40, { haloA: .5 });
  cityLayer(g, CITY.far, 2200, WY1 + 40, .45); cityLayer(g, CITY.mid, 1300, WY1 + 70, .5);
  g.restore();
  g.strokeStyle = '#2C3258'; g.lineWidth = 16; g.strokeRect(WX0, WY0, WX1 - WX0, WY1 - WY0); g.lineWidth = 8; g.beginPath(); g.moveTo((WX0 + WX1) / 2, WY0); g.lineTo((WX0 + WX1) / 2, WY1); g.stroke();
  // 吊柜
  g.fillStyle = '#262C52'; g.fillRect(120, 110, 980, 230); g.strokeStyle = '#1C2140'; g.lineWidth = 4; for (let x = 120; x < 1100; x += 245) g.strokeRect(x, 110, 245, 230);
  g.fillStyle = '#9AA0C8'; for (let x = 120; x < 1100; x += 245) g.fillRect(x + 200, 300, 26, 6);
  // 吊柜下的灯：暖光照在台面上
  g.fillStyle = '#FFE4B0'; g.fillRect(160, 340, 900, 6);
  g.save(); g.globalCompositeOperation = 'lighter';
  g.fillStyle = lgrad(g, 0, 346, 0, 760, [[0, 'rgba(255,205,140,.32)'], [1, 'rgba(255,205,140,0)']]);
  g.beginPath(); g.moveTo(160, 346); g.lineTo(1060, 346); g.lineTo(1160, 760); g.lineTo(60, 760); g.fill();
  g.restore();
  // 墙上的钟
  const cx = 1440, cy = 690;
  g.fillStyle = '#E8E2D2'; circ(g, cx, cy, 62); g.fill(); g.strokeStyle = '#3A3F66'; g.lineWidth = 8; circ(g, cx, cy, 62); g.stroke();
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; line(g, cx + Math.sin(a) * 48, cy - Math.cos(a) * 48, cx + Math.sin(a) * 54, cy - Math.cos(a) * 54, '#3A3F66', 4); }
  const [hh, mm] = (o.clock || '23:00').split(':').map(Number), ma = mm / 60 * TAU, ha = (hh % 12 + mm / 60) / 12 * TAU;
  line(g, cx, cy, cx + Math.sin(ha) * 30, cy - Math.cos(ha) * 30, '#2A2E4A', 6); line(g, cx, cy, cx + Math.sin(ma) * 44, cy - Math.cos(ma) * 44, '#2A2E4A', 4);
  const sa = (s * TAU / 60) * 6; line(g, cx, cy, cx + Math.sin(sa) * 46, cy - Math.cos(sa) * 46, '#D04A4A', 2);
  // 台面和下面的柜子
  g.fillStyle = '#3A3E66'; g.fillRect(60, 760, 1140, 26); g.fillStyle = 'rgba(255,220,170,.35)'; g.fillRect(60, 760, 1140, 4);
  g.fillStyle = '#242849'; g.fillRect(80, 786, 1100, 300); g.strokeStyle = '#1B1F3C'; g.lineWidth = 4; for (let x = 80; x < 1180; x += 275) g.strokeRect(x, 786, 275, 300);
  // 微波炉
  const mx = 760, my = 560, mw = 330, mh = 200;
  g.fillStyle = '#C9CCDA'; rr(g, mx, my, mw, mh, 14); g.fill();
  g.fillStyle = '#9EA3B8'; rr(g, mx + 10, my + 14, 230, mh - 28, 8); g.fill();
  const on = o.micro || 0;
  g.fillStyle = on > 0 ? `rgba(255,214,140,${.35 + .5 * on})` : '#2A2E44'; rr(g, mx + 22, my + 26, 206, mh - 52, 6); g.fill();
  if (on > 0) { // 里面转着的杯子
    mug(g, mx + 125 + Math.sin(s * 3) * 30, my + 150, .8, '#9DB8E8', { ears: true, rot: 0 });
    glow(g, mx + 125, my + 100, 160, '#FFD08A', .5 * on);
  }
  g.fillStyle = '#1A1C2A'; rr(g, mx + 252, my + 30, 64, 34, 6); g.fill();
  seg7(g, o.disp || '23:00', mx + 258, my + 37, 20, '#7CF2C8', { glow: .45 });
  for (let i = 0; i < 6; i++) { g.fillStyle = '#B0B4C6'; rr(g, mx + 254 + (i % 2) * 32, my + 80 + Math.floor(i / 2) * 30, 26, 20, 4); g.fill(); }
  // 台面上的杯子：粉色那只（她的）
  mug(g, 580, 760, 1.15, '#F3B9C8', { ears: true });
  if (o.blueMug) mug(g, o.blueMug[0], o.blueMug[1], 1.15, '#9DB8E8', { ears: true, milk: true });
}
/* 七段码里没有字母：END 用 "- - -" 代替 */

/* 便利贴 */
function stickyNote(g, x, y, w, rot, lines, o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-w / 2 + 6, -w / 2 + 8, w, w);
  g.fillStyle = o.col || '#FFE58A'; g.fillRect(-w / 2, -w / 2, w, w);
  g.fillStyle = 'rgba(0,0,0,.07)'; g.fillRect(-w / 2, -w / 2, w, w * .12);
  lines.forEach((l, i) => text(g, l, 0, -w * .2 + i * w * .26, w * (l.length > 7 ? .1 : .13), { k: 'hand', col: '#4A3A30' }));
  g.restore();
}
/* 笔记本电脑：暂停的电影。prog：进度 0..1；cur / tot：时间 */
function laptop(g, x, y, w, o = {}) {
  const h = w * .62;
  g.save(); g.translate(x, y);
  glow(g, 0, -h * .5, w * 1.1, '#8FB6FF', .35);
  g.fillStyle = '#2A2D3E'; rr(g, -w / 2, -h, w, h, 10); g.fill();
  g.save(); rr(g, -w / 2 + 12, -h + 12, w - 24, h - 30, 4); g.clip();
  // 画面：电影里的夜空和两个小人
  g.fillStyle = vgrad(g, -h, 0, [[0, '#1B2A5E'], [1, '#6A4C8E']]); g.fillRect(-w / 2, -h, w, h);
  moon(g, w * .22, -h * .7, w * .06, { haloA: .4 });
  g.fillStyle = '#0E1230'; g.fillRect(-w / 2, -h * .25, w, h * .3);
  g.fillStyle = '#0E1230'; circ(g, -w * .06, -h * .36, w * .025); g.fill(); g.fillRect(-w * .08, -h * .34, w * .04, w * .07); circ(g, w * .02, -h * .36, w * .025); g.fill(); g.fillRect(0, -h * .34, w * .04, w * .07);
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(-w / 2, -h * .2, w, h * .2);
  // 暂停键、进度条
  g.fillStyle = 'rgba(255,255,255,.85)'; g.fillRect(-w * .05, -h * .62, w * .03, w * .1); g.fillRect(w * .02, -h * .62, w * .03, w * .1);
  const py = -h * .1, pw = w - 70;
  g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(-pw / 2, py, pw, 4); g.fillStyle = '#FF5A7A'; g.fillRect(-pw / 2, py, pw * (o.prog ?? .58), 4);
  circ(g, -pw / 2 + pw * (o.prog ?? .58), py + 2, 7); g.fill();
  text(g, `${o.cur || '1:12:05'} / ${o.tot || '2:03:40'}`, -pw / 2, py - 18, w * .045, { k: 'sans', align: 'left', col: 'rgba(255,255,255,.85)' });
  g.restore();
  g.fillStyle = '#3A3E52'; g.beginPath(); g.moveTo(-w / 2 - 30, 0); g.lineTo(w / 2 + 30, 0); g.lineTo(w / 2 + 10, 18); g.lineTo(-w / 2 - 10, 18); g.closePath(); g.fill();
  g.restore();
}
/* 他的卧室（从床侧面看）：o：moon, lamp（台灯 0..1） */
function hisBedroom(g, s, o = {}) {
  g.fillStyle = vgrad(g, 0, H, [[0, '#10142E'], [1, '#191C3D']]); g.fillRect(0, 0, W, H);
  // 窗和月光
  const WX0 = 1260, WX1 = 1760, WY0 = 90, WY1 = 560;
  g.save(); g.beginPath(); g.rect(WX0, WY0, WX1 - WX0, WY1 - WY0); g.clip();
  g.fillStyle = vgrad(g, WY0, WY1, [[0, '#0A0E2A'], [1, '#272766']]); g.fillRect(WX0, WY0, WX1 - WX0, WY1 - WY0);
  g.save(); g.translate(WX0, WY0 - 80); g.scale(.42, .42); g.drawImage(TEX.stars, -900, 0); g.restore();
  moon(g, 1600, 230, 60, { haloA: .6 });
  cityLayer(g, CITY.far, 1500, WY1 + 30, .5);
  g.restore();
  g.strokeStyle = '#2A2F58'; g.lineWidth = 16; g.strokeRect(WX0, WY0, WX1 - WX0, WY1 - WY0); g.lineWidth = 8; g.beginPath(); g.moveTo((WX0 + WX1) / 2, WY0); g.lineTo((WX0 + WX1) / 2, WY1); g.stroke();
  g.save(); g.globalCompositeOperation = 'lighter';
  g.beginPath(); g.moveTo(WX0, WY0 + 20); g.lineTo(WX1, WY0 + 20); g.lineTo(WX1 - 500, H); g.lineTo(WX0 - 700, H); g.closePath();
  g.fillStyle = lgrad(g, 1500, 200, 900, 1000, [[0, 'rgba(140,160,255,.14)'], [1, 'rgba(140,160,255,.03)']]); g.fill();
  g.restore();
  // 墙上的海报
  g.fillStyle = '#26294E'; g.fillRect(380, 150, 220, 300); g.fillStyle = '#3A3F78'; g.fillRect(396, 166, 188, 268);
  g.fillStyle = 'rgba(255,220,160,.5)'; circ(g, 490, 260, 40); g.fill();
  if (o.lamp) { glow(g, 180, 520, 380, '#FFC98A', o.lamp * .6); }
}
/* 镜子：浴室里冷白的灯，偶尔闪一下 */
function mirrorScene(g, s, o = {}) {
  const fl = hash(Math.floor(s * 10), 3) < .08 ? .55 : 1;
  g.fillStyle = vgrad(g, 0, H, [[0, '#1B2234'], [1, '#121626']]); g.fillRect(0, 0, W, H);
  for (let x = 0; x < W; x += 96) for (let y = 0; y < H; y += 96) { g.strokeStyle = 'rgba(160,190,210,.08)'; g.lineWidth = 2; g.strokeRect(x, y, 96, 96); }
  // 镜子
  const mx = 560, my = 90, mw = 800, mh = 760;
  g.fillStyle = '#9FB3C2'; rr(g, mx - 18, my - 18, mw + 36, mh + 36, 30); g.fill();
  g.save(); rr(g, mx, my, mw, mh, 22); g.clip();
  g.fillStyle = vgrad(g, my, my + mh, [[0, '#2C3A52'], [1, '#1E2638']]); g.fillRect(mx, my, mw, mh);
  if (o.inside) o.inside(g);
  // 镜面反光
  g.fillStyle = 'rgba(255,255,255,.06)'; g.beginPath(); g.moveTo(mx + 80, my); g.lineTo(mx + 230, my); g.lineTo(mx + 30, my + mh); g.lineTo(mx - 120, my + mh); g.fill();
  g.restore();
  // 顶上的灯
  g.fillStyle = `rgba(230,245,255,${fl})`; rr(g, mx + 120, 34, mw - 240, 22, 10); g.fill();
  glow(g, mx + mw / 2, 46, 600, '#DDF2FF', .35 * fl);
  // 洗手台
  g.fillStyle = '#C9D3DC'; rr(g, 380, 900, 1160, 60, 20); g.fill(); g.fillStyle = '#E2E8EE'; g.fillRect(380, 900, 1160, 10);
  // 牙刷杯
  g.fillStyle = '#7FB8C8'; rr(g, 1380, 820, 70, 84, 10); g.fill(); line(g, 1400, 824, 1388, 740, '#F3B9C8', 10); line(g, 1424, 824, 1440, 744, '#9DB8E8', 10);
  if (o.phone) { // 手机：04:12
    g.fillStyle = '#111'; rr(g, 520, 820, 150, 80, 12); g.fill(); g.fillStyle = '#1E2A44'; rr(g, 528, 826, 134, 68, 8); g.fill();
    text(g, o.phone, 595, 861, 34, { k: 'sans', col: '#E8F0FF' });
  }
  return fl;
}
/* 楼的立面：一排排窗户，有的亮，有的黑。highlight：[[列, 行, 颜色], ...] 特别亮的那几扇 */
function facade(g, s, x, y, cols, rows, cw, ch, o = {}) {
  g.fillStyle = o.wall || '#151A3C'; g.fillRect(x - 30, y - 30, cols * cw + 60, rows * ch + 60);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const wx = x + i * cw + cw * .18, wy = y + j * ch + ch * .15, ww = cw * .64, wh = ch * .7;
    const hl = (o.highlight || []).find(([a, b]) => a === i && b === j);
    const lit = hl ? 1 : (hash(i, j, o.seed || 1) < (o.lit ?? .1) ? .6 : 0);
    g.fillStyle = hl ? hl[2] : lit ? '#C9A26E' : '#0E1230'; g.fillRect(wx, wy, ww, wh);
    if (hl) { glow(g, wx + ww / 2, wy + wh / 2, cw * 1.4, hl[2], .7); if (hl[3]) hl[3](g, wx, wy, ww, wh); }
    g.strokeStyle = '#232955'; g.lineWidth = 4; g.strokeRect(wx, wy, ww, wh);
  }
}
