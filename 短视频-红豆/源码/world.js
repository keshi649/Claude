'use strict';
/* world.js —— 场景背景：屋里（一套房间，按时段换光）、雪夜小镇、沙漠（黄昏 / 夜）、站台和火车、夜里的屋顶、山坡草地、
   公园长椅（四季）、溪边、院子和红豆树、四处风景（灯塔、雪山、花田、极光）。
   都画在 1920×1080 的"世界坐标"里，镜头推拉由调用者用 camera() 包起来。 */

function camera(g, cx, cy, z, fn, rot = 0) {   // 以 (cx, cy) 为画面中心、放大 z 倍来画 fn
  g.save(); g.translate(W / 2, H / 2); if (rot) g.rotate(rot); g.scale(z, z); g.translate(-cx, -cy); fn(); g.restore();
}

/* ---------------- 屋里 ----------------
   o.mood: 'night'（冬夜，暖灯）、'morning'（晨光从窗进来）、'evening'（黄昏，老了以后）、'rain'（雨夜，冷）、'dark'
   o.outside(g, x, y, w, h)：窗外；o.photos：墙上相框里的画布；o.sill(g)：窗台上的东西 */
const ROOM = { winX: 250, winY: 170, winW: 520, winH: 440, floorY: 770, tableX: 1180, tableY: 742 };
function room(g, s, o = {}) {
  const mood = o.mood || 'night';
  const pal = {
    night: { wall: '#3A3F5C', wall2: '#2E3249', wains: '#4A4560', floor: '#5A4438', floor2: '#4C392F', lamp: 1, amb: '#1B1E33' },
    rain: { wall: '#343A52', wall2: '#2A2F45', wains: '#3E4058', floor: '#4E3E36', floor2: '#43352E', lamp: .85, amb: '#1B2236' },
    morning: { wall: '#EADFCF', wall2: '#DCCDB8', wains: '#D6C4AA', floor: '#B88E6A', floor2: '#A97F5C', lamp: 0, amb: '#FFF2DC' },
    evening: { wall: '#C9A487', wall2: '#B48E72', wains: '#A8806A', floor: '#7E5A44', floor2: '#6E4E3A', lamp: .8, amb: '#5A3A30' },
    dark: { wall: '#23263A', wall2: '#1C1F30', wains: '#2C2B40', floor: '#3A2E2A', floor2: '#30261F', lamp: .2, amb: '#0E0F1C' },
  }[mood];
  const fy = ROOM.floorY;
  // 墙
  g.fillStyle = vgrad(g, 0, fy, [[0, pal.wall2], [1, pal.wall]]); g.fillRect(-600, -400, W + 1200, fy + 400);
  // 墙纸的小花纹
  g.fillStyle = rgba('#FFFFFF', .035);
  for (let y = 40; y < fy - 160; y += 80) for (let x = (y / 80 % 2) * 60 - 480; x < W + 500; x += 120) { circ(g, x, y, 4); g.fill(); }
  // 护墙板
  g.fillStyle = pal.wains; g.fillRect(-600, fy - 170, W + 1200, 170);
  g.fillStyle = shade(pal.wains, 1.12); g.fillRect(-600, fy - 176, W + 1200, 10);
  g.strokeStyle = rgba('#000000', .1); g.lineWidth = 3;
  for (let x = -520; x < W + 600; x += 160) { g.strokeRect(x + 20, fy - 150, 120, 130); }
  // 地板
  g.fillStyle = pal.floor; g.fillRect(-600, fy, W + 1200, H - fy + 400);
  g.strokeStyle = pal.floor2; g.lineWidth = 3;
  for (let i = 0; i < 9; i++) { const y = fy + Math.pow(i / 8, 1.6) * (H - fy + 60); g.beginPath(); g.moveTo(-600, y); g.lineTo(W + 600, y); g.stroke(); }
  for (let i = -12; i <= 12; i++) { g.beginPath(); g.moveTo(W / 2 + i * 60, fy); g.lineTo(W / 2 + i * 260, H + 60); g.stroke(); }
  // 窗
  const { winX: wx, winY: wy, winW: ww, winH: wh } = ROOM;
  if (o.window !== false) {
    windowFrame(g, wx, wy, ww, wh, gg => (o.outside ? o.outside(gg, wx, wy, ww, wh) : (gg.fillStyle = '#1A2244', gg.fillRect(wx, wy, ww, wh))), { frame: mood === 'morning' ? '#F4EEE4' : '#D9D0C2', frost: o.frost });
    if (o.sill) o.sill(g, wx, wy + wh + 14, ww);
    curtain(g, wx - 60, wy - 40, 110, wh + 90, mood === 'morning' ? '#E9C9B3' : '#8E6E7A', 1, s, o.wind || 0);
    curtain(g, wx + ww + 60, wy - 40, 110, wh + 90, mood === 'morning' ? '#E9C9B3' : '#8E6E7A', -1, s, o.wind || 0);
    g.fillStyle = '#6B5546'; g.fillRect(wx - 90, wy - 50, ww + 180, 10);
  }
  // 墙上的相框
  if (o.photos) {
    o.photos.forEach((p, i) => photoFrame(g, p.x, p.y, p.w, p.h, p.img, { rot: p.rot || 0 }));
  }
  // 书架
  if (o.shelf !== false) {
    const sx = 1500, sy = 300;
    g.fillStyle = '#6E5140'; g.fillRect(sx, sy, 300, 14); g.fillRect(sx, sy + 150, 300, 14);
    const rs = R(21);
    for (const yy of [sy, sy + 150]) { let x = sx + 10; while (x < sx + 290) { const bw = 14 + rs() * 16, bh = 60 + rs() * 50; if (rs() < .15) { x += 26; continue; } g.fillStyle = ['#8E5A4A', '#4E6A7A', '#C9A66B', '#6B7A5A', '#A88A9A', '#E2D5C0'][Math.floor(rs() * 6)]; g.fillRect(x, yy - bh, bw, bh); x += bw + 2; } }
    if (o.onShelf) o.onShelf(g, sx, sy);
  }
  // 吊灯
  if (o.lamp !== false) {
    const lx = o.lampX ?? 1180, ly = 250, on = pal.lamp * (o.lampOn ?? 1);
    g.strokeStyle = '#1E1A20'; g.lineWidth = 3; g.beginPath(); g.moveTo(lx, -10); g.lineTo(lx, ly - 40); g.stroke();
    g.fillStyle = '#C79A6A'; g.beginPath(); g.moveTo(lx - 70, ly); g.quadraticCurveTo(lx, ly - 90, lx + 70, ly); g.closePath(); g.fill();
    if (on > 0) {
      g.fillStyle = mixc('#8A7050', '#FFE3A8', on); ell(g, lx, ly, 46, 10); g.fill();
      g.save(); g.globalCompositeOperation = 'screen';
      g.fillStyle = lgrad(g, lx, ly, lx, fy + 120, [[0, rgba('#FFCF8A', .3 * on)], [1, rgba('#FFCF8A', .02 * on)]]);
      poly(g, [[lx - 60, ly], [lx + 60, ly], [lx + 420, fy + 140], [lx - 420, fy + 140]]); g.fill();
      g.restore();
      glow(g, lx, ly + 10, 520, '#FFC77A', .35 * on);
      glow(g, lx, ly, 120, '#FFE8B8', .6 * on);
    }
  }
}
/* 屋里的整体光：画完人和道具以后叠一层（暖灯的光晕、四角压暗） */
function roomLight(g, mood, o = {}) {
  if (mood === 'night' || mood === 'rain' || mood === 'evening') {
    g.save(); g.globalCompositeOperation = 'multiply';
    g.fillStyle = rgrad(g, o.lx ?? 1180, o.ly ?? 500, 200, 1500, [[0, 'rgba(255,255,255,1)'], [1, mood === 'evening' ? 'rgba(150,100,90,1)' : 'rgba(80,80,120,1)']]); g.fillRect(-400, -400, W + 800, H + 800);
    g.restore();
  }
  if (mood === 'morning') {
    // 晨光：从窗户斜着照进来的光柱 + 浮尘
    g.save(); g.globalCompositeOperation = 'screen';
    const { winX: wx, winY: wy, winW: ww, winH: wh } = ROOM;
    g.fillStyle = lgrad(g, wx, wy, wx + 900, H, [[0, 'rgba(255,226,170,.45)'], [1, 'rgba(255,226,170,0)']]);
    poly(g, [[wx, wy], [wx + ww, wy], [wx + ww + 900, H + 100], [wx + 300, H + 100]]); g.fill();
    g.restore();
    for (const p of floaters(o.s || 0, 71, 40, [wx + 100, wy, wx + ww + 700, H], { vy: 8, amp: 30, wob: .3 })) { g.fillStyle = `rgba(255,240,200,${.5 * p.tw})`; circ(g, p.x, p.y, 1.5 + p.sz * 2); g.fill(); }
  }
}

/* ---------------- 窗外：雪夜 ---------------- */
function nightSnowOutside(g, x, y, w, h, s, o = {}) {
  g.fillStyle = vgrad(g, y, y + h, [[0, '#0F1733'], [.7, '#27305E'], [1, '#4A4F7E']]); g.fillRect(x, y, w, h);
  // 远处的房子和暖窗
  const rs = R(4);
  for (let i = 0; i < 6; i++) {
    const hx = x + i * w / 5 - 40 + rs() * 30, hw = 80 + rs() * 50, hy = y + h * .62 + rs() * 30;
    g.fillStyle = '#1C2140'; g.fillRect(hx, hy, hw, h); poly(g, [[hx - 10, hy], [hx + hw / 2, hy - 40], [hx + hw + 10, hy]]); g.fill();
    g.fillStyle = '#DDE6F4'; poly(g, [[hx - 12, hy + 2], [hx + hw / 2, hy - 42], [hx + hw + 12, hy + 2], [hx + hw / 2, hy - 30]]); g.fill();
    g.fillStyle = '#FFC66E'; g.fillRect(hx + hw * .3, hy + 20, 16, 18); glow(g, hx + hw * .3 + 8, hy + 29, 40, '#FFB050', .5);
  }
  g.fillStyle = '#D8E2F0'; g.fillRect(x, y + h * .86, w, h * .2);
  bloomSnow(g, s, 9, Math.round(w * h / 9000), [x, y - 20, x + w, y + h + 20], { r: 5, vy: 45, bloomK: o.bloom ?? .4 });
}

/* ---------------- 雪夜小镇（外景） ---------------- */
function snowTown(g, s, o = {}) {
  const hz = o.hz ?? 640, spring = o.season === 'spring';
  if (spring) {
    skyGrad(g, [[0, '#8EC1E6'], [.6, '#CFE6F2'], [1, '#F6EBDD']], -200, hz + 60);
    glow(g, 1500, 160, 500, '#FFF4D0', .6); cloud(g, 3, 500, 180, 600, CLOUD.day, .8); cloud(g, 7, 1300, 120, 520, CLOUD.day, .7, true);
  } else {
    skyGrad(g, [[0, '#0B1230'], [.5, '#1E2858'], [.85, '#3E4478'], [1, '#62608E']], -200, hz + 60);
    stars(g, s, 300, 0, .5, .6);
    moon(g, o.moonX ?? 1560, o.moonY ?? 180, 54, { halo: '#9FB2FF', haloA: .35 });
  }
  // 远山
  const hill = (yb, amp, seed, col, cap) => {
    g.fillStyle = col; g.beginPath(); g.moveTo(-300, H);
    for (let x = -300; x <= W + 300; x += 30) g.lineTo(x, yb - (noise1(x / 260, seed) * .5 + .5) * amp);
    g.lineTo(W + 300, H); g.closePath(); g.fill();
    if (cap) { g.save(); g.clip(); g.fillStyle = cap; g.beginPath(); g.moveTo(-300, -100); for (let x = -300; x <= W + 300; x += 30) g.lineTo(x, yb - (noise1(x / 260, seed) * .5 + .5) * amp + 26); g.lineTo(W + 300, -100); g.fill(); g.restore(); }
  };
  if (spring) { hill(hz - 40, 160, 3, '#9CB7A8', null); hill(hz, 110, 7, '#86A88E', null); }
  else { hill(hz - 40, 160, 3, '#2C3462', '#8C98C4'); hill(hz, 110, 7, '#252B52', '#AEB9DC'); }
  // 房子一排
  const rs = R(o.seed || 12);
  let x = -80;
  while (x < W + 100) {
    const hw = 150 + rs() * 120, hh = 120 + rs() * 90, hy = hz + 70 - rs() * 20;
    const wall = spring ? ['#C9A48E', '#9FB0C4', '#D8C2A0', '#B4A0B8'][Math.floor(rs() * 4)] : ['#4A3F55', '#3E4A62', '#5A4A48', '#46506A'][Math.floor(rs() * 4)];
    g.fillStyle = wall; g.fillRect(x, hy - hh, hw, hh + 200);
    g.fillStyle = shade(wall, .8); poly(g, [[x - 14, hy - hh], [x + hw / 2, hy - hh - 70 - rs() * 20], [x + hw + 14, hy - hh]]); g.fill();
    g.fillStyle = spring ? shade(wall, .62) : '#E3EAF6'; g.beginPath(); g.moveTo(x - 18, hy - hh + 4); g.lineTo(x + hw / 2, hy - hh - 76); g.lineTo(x + hw + 18, hy - hh + 4); g.quadraticCurveTo(x + hw / 2, hy - hh - 40, x - 18, hy - hh + 4); g.fill();
    // 暖窗
    const nw = Math.floor(hw / 70);
    for (let i = 0; i < nw; i++) {
      const wxp = x + 24 + i * (hw - 30) / nw, wyp = hy - hh + 36;
      const lit = !spring && rs() < .75; if (spring) rs();
      g.fillStyle = lit ? '#FFC873' : '#2A2F48'; g.fillRect(wxp, wyp, 34, 40);
      g.fillStyle = shade(wall, .7); g.fillRect(wxp + 15, wyp, 4, 40); g.fillRect(wxp, wyp + 18, 34, 4);
      if (lit) glow(g, wxp + 17, wyp + 20, 70, '#FFB050', .45);
    }
    if (rs() < .5) { g.fillStyle = shade(wall, .7); g.fillRect(x + hw * .7, hy - hh - 70, 20, 50); smoke(g, x + hw * .7 + 10, hy - hh - 74, s, rs() * 10); }
    x += hw + 20 + rs() * 40;
  }
  // 雪地
  if (spring) {
    g.fillStyle = vgrad(g, hz + 60, H, [[0, '#A9C79A'], [1, '#C8DDB0']]); g.fillRect(-300, hz + 60, W + 600, H);
    g.fillStyle = rgba('#EEF3F8', .8); for (let i = 0; i < 7; i++) { ell(g, hash(i, 2) * W, hz + 140 + hash(i, 3) * 280, 90 + hash(i, 4) * 120, 12); g.fill(); }   // 没化完的雪
    for (let i = 0; i < 60; i++) { const fx = hash(i, 8) * W, fy = hz + 100 + hash(i, 9) * 340; g.fillStyle = ['#FFFFFF', '#FFD6E0', '#FFE9A8'][i % 3]; circ(g, fx, fy, 3 + hash(i, 5) * 3); g.fill(); }
  } else {
    g.fillStyle = vgrad(g, hz + 60, H, [[0, '#C9D5EA'], [1, '#E9EFF8']]); g.fillRect(-300, hz + 60, W + 600, H);
    g.fillStyle = rgba('#9FB0D2', .35); for (let i = 0; i < 8; i++) { ell(g, hash(i, 2) * W, hz + 120 + hash(i, 3) * 300, 160 + hash(i, 4) * 200, 14); g.fill(); }
  }
  if (o.lamps) o.lamps.forEach(([lx, ly, sc]) => streetLamp(g, lx, ly, sc, o.lampOn ?? 1));
}
function smoke(g, x, y, s, seed) {
  for (let i = 0; i < 6; i++) {
    const k = ((s * .25 + i / 6 + seed) % 1);
    g.fillStyle = `rgba(200,210,235,${.18 * (1 - k)})`; circ(g, x + Math.sin(k * 5 + seed) * 20 + k * 40, y - k * 160, 10 + k * 30); g.fill();
  }
}

/* ---------------- 沙漠 ----------------
   o.mode: 'gold' 黄昏 / 'night' 星空；o.ridge(x) 前景沙丘脊线的 y（给人走路用） */
function duneLayer(g, base, amp, seed, lit, dark, freq = 1, o = {}) {
  // 一层沙丘：脊线 + 迎光面亮、背光面暗（按斜率着色）
  const ys = [];
  for (let x = -300; x <= W + 300; x += 12) {
    const u = x / (520 / freq);
    const y = base - (Math.pow(Math.abs(Math.sin(u + noise1(u * .7, seed) * 1.2)), 1.6) * amp + noise1(u * 2.3, seed + 5) * amp * .12);
    ys.push([x, y]);
  }
  g.fillStyle = dark; g.beginPath(); g.moveTo(-300, H + 200); ys.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(W + 300, H + 200); g.closePath(); g.fill();
  // 迎光面：坡往右下降的地方（光从左边来）
  g.save(); g.beginPath(); g.moveTo(-300, H + 200); ys.forEach(([x, y]) => g.lineTo(x, y)); g.lineTo(W + 300, H + 200); g.closePath(); g.clip();
  g.fillStyle = lit;
  for (let i = 1; i < ys.length; i++) {
    const [x0, y0] = ys[i - 1], [x1, y1] = ys[i];
    if (y1 > y0 === (o.lightRight ? false : true)) { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.lineTo(x1 + (o.lightRight ? -1 : 1) * amp * .5, y1 + amp * 1.4); g.lineTo(x0 + (o.lightRight ? -1 : 1) * amp * .5, y0 + amp * 1.4); g.closePath(); g.fill(); }
  }
  g.restore();
  return ys;
}
function desert(g, s, o = {}) {
  const night = o.mode === 'night';
  if (night) {
    skyGrad(g, [[0, '#070A22'], [.55, '#151A48'], [.85, '#2D2A5E'], [1, '#4A3A6A']]);
    milkyWay(g, W * .55, H * .32, 2300, -.35, .85);
    stars(g, s, o.starX || 0, o.starY || 0, 1, 1);
  } else {
    skyGrad(g, [[0, '#E8A584'], [.45, '#F4C79A'], [.75, '#FADDB0'], [1, '#FCEBCB']]);
    glow(g, o.sunX ?? 1500, o.sunY ?? 520, 900, '#FFE2A8', .55);
    g.fillStyle = '#FFF4DC'; circ(g, o.sunX ?? 1500, o.sunY ?? 520, 70); g.fill();
    cloud(g, 2, 500, 220, 700, CLOUD.dusk, .35); cloud(g, 5, 1200, 160, 600, CLOUD.dusk, .3, true);
  }
  const P = night ? [['#3E4672', '#2C3258'], ['#353C66', '#262B4E'], ['#2C325A', '#1F2443'], ['#262B4E', '#181C36']]
                  : [['#F0C493', '#DDA478'], ['#EDB884', '#D49468'], ['#E9AC74', '#C9845A'], ['#E6A26A', '#BC764E']];
  const ox = o.pan || 0;
  g.save(); g.translate(-ox * .2, 0); duneLayer(g, 640, 90, 1, P[0][0], P[0][1], .7); g.restore();
  g.save(); g.translate(-ox * .4, 0); duneLayer(g, 720, 130, 2, P[1][0], P[1][1], .9); g.restore();
  g.save(); g.translate(-ox * .7, 0); duneLayer(g, 830, 150, 3, P[2][0], P[2][1], 1.1); g.restore();
  // 地平线的霾
  if (!night) { g.fillStyle = vgrad(g, 540, 760, [[0, 'rgba(255,236,200,0)'], [.5, 'rgba(255,236,200,.35)'], [1, 'rgba(255,236,200,0)']]); g.fillRect(-300, 540, W + 600, 220); }
  // 前景的沙丘：一条平缓的脊线，人在上面走
  g.save(); g.translate(-ox, 0);
  const ridge = x => (o.ridgeY ?? 860) - Math.sin((x + 300) / 900) * 60 - noise1(x / 300, 9) * 20;
  g.fillStyle = P[3][1]; g.beginPath(); g.moveTo(-400, H + 100);
  for (let x = -400; x <= W + 2400; x += 16) g.lineTo(x, ridge(x));
  g.lineTo(W + 2400, H + 100); g.closePath(); g.fill();
  g.fillStyle = P[3][0]; g.beginPath(); g.moveTo(-400, H + 100);
  for (let x = -400; x <= W + 2400; x += 16) g.lineTo(x, ridge(x));
  for (let x = W + 2400; x >= -400; x -= 16) g.lineTo(x - 140, ridge(x) + 120 + Math.sin(x / 200) * 20);
  g.closePath(); g.fill();
  // 沙纹
  g.strokeStyle = rgba(night ? '#8A94C8' : '#FFE9C8', .25); g.lineWidth = 2;
  for (let i = 0; i < 14; i++) { const yy = 930 + i * 14; g.beginPath(); for (let x = -400; x < W + 2400; x += 20) { const y2 = yy + Math.sin(x / 70 + i) * 4; x === -400 ? g.moveTo(x, y2) : g.lineTo(x, y2); } g.stroke(); }
  if (o.after) o.after(g, ridge);
  g.restore();
  // 风吹起的沙
  if (!night) for (const p of floaters(s, 41, 60, [-100, 700, W + 100, H], { vx: 160, vy: 6, amp: 10 })) { g.fillStyle = `rgba(255,230,190,${.4 * p.tw})`; g.fillRect(p.x, p.y, 3 + p.sz * 8, 1.5); }
  return ridge;
}

/* ---------------- 散景（虚化的光斑） ---------------- */
function bokeh(g, s, seed, n, cols, o = {}) {
  const rs = R(seed);
  for (let i = 0; i < n; i++) {
    const x = rs() * (W + 400) - 200 + Math.sin(s * .3 + i) * (o.drift ?? 20) + (o.vx || 0) * s;
    const y = rs() * H + Math.cos(s * .25 + i * 1.3) * (o.drift ?? 20);
    const r = (o.r0 ?? 30) + rs() * (o.r1 ?? 70), col = cols[Math.floor(rs() * cols.length)];
    const a = (o.a ?? .35) * (.5 + .5 * Math.sin(s * (.6 + rs()) + i));
    const xx = ((x % (W + 400)) + (W + 400)) % (W + 400) - 200;
    g.fillStyle = rgba(col, a * .55); circ(g, xx, y, r); g.fill();
    g.strokeStyle = rgba(col, a * .6); g.lineWidth = 2; g.stroke();
  }
}
