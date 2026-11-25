'use strict';
/* sets.js —— 像素场景：屋里（一套房间，按时段换光）、雪夜小镇（冬 / 春）、沙漠（黄昏 / 星空）、站台和火车、夜里的屋顶、
   火车窗外、厨房、溪边（日出 / 日落 / 金色）、山坡草地、公园四季、院子和红豆树、四处风景。
   都画进缓冲 b（光层 gl），坐标是缓冲像素。 */

/* ---------------- 屋里（240×135）：墙到 y=92，地板 92~135；人站在 y 112~126 ----------------
   o.mood: night / rain / morning / evening / dark；o.outside(b, x, y, w, h)：窗外；o.sill(b, x, y, w)：窗台上的东西；
   o.lampX、o.lamp(亮度)；o.shelf；o.onShelf(b)；o.door(开了多少)；o.photos：[{x, y, w, h, img}] */
const RM = { winX: 22, winY: 16, winW: 60, winH: 48, floorY: 92, shelfX: 160 };
function room(b, gl, t, o = {}) {
  const mood = o.mood || 'night';
  const P = {
    night: { wall: '#3A3F5C', wall2: '#30344E', dot: '#444A68', wains: '#4A4560', floor: '#5A4438', floor2: '#4C392F', lamp: 1 },
    rain: { wall: '#343A52', wall2: '#2C3046', dot: '#3C4260', wains: '#3E4058', floor: '#4E3E36', floor2: '#43352E', lamp: .85 },
    morning: { wall: '#EADFCF', wall2: '#E0D2BE', dot: '#E2D4C2', wains: '#D6C4AA', floor: '#B88E6A', floor2: '#A97F5C', lamp: 0 },
    evening: { wall: '#C9A487', wall2: '#BC9679', dot: '#C29C80', wains: '#A8806A', floor: '#7E5A44', floor2: '#6E4E3A', lamp: .9 },
    dark: { wall: '#262A3E', wall2: '#202434', dot: '#2C3046', wains: '#2C2B40', floor: '#3A2E2A', floor2: '#30261F', lamp: .2 },
  }[mood];
  const fy = RM.floorY;
  prect(b, 0, 0, b.canvas.width, fy, P.wall); prect(b, 0, 0, b.canvas.width, 6, P.wall2);
  for (let y = 10; y < fy - 18; y += 10) for (let x = (y / 10 % 2) * 6 + 2; x < b.canvas.width; x += 12) pdot(b, x, y, P.dot);
  prect(b, 0, fy - 14, b.canvas.width, 14, P.wains); prect(b, 0, fy - 15, b.canvas.width, 1, shade(P.wains, 1.15));
  for (let x = 4; x < b.canvas.width; x += 20) { prect(b, x, fy - 12, 14, 1, shade(P.wains, .85)); prect(b, x, fy - 3, 14, 1, shade(P.wains, .85)); prect(b, x, fy - 12, 1, 10, shade(P.wains, .85)); prect(b, x + 13, fy - 12, 1, 10, shade(P.wains, .85)); }
  prect(b, 0, fy, b.canvas.width, b.canvas.height - fy, P.floor);
  for (let i = 0; i < 6; i++) prect(b, 0, fy + ri(Math.pow(i / 5, 1.5) * (b.canvas.height - fy)), b.canvas.width, 1, P.floor2);
  for (let i = -8; i <= 8; i++) pline(b, 120 + i * 18, fy, 120 + i * 50, b.canvas.height, P.floor2);
  // 窗
  if (o.window !== false) {
    const { winX: x, winY: y, winW: w, winH: h } = RM, fr = mood === 'morning' ? '#F4EEE4' : '#D9D0C2';
    b.save(); b.beginPath(); b.rect(x, y, w, h); b.clip();
    if (o.outside) o.outside(b, x, y, w, h); else prect(b, x, y, w, h, '#1A2244');
    b.restore();
    if (o.frost) { for (let yy = y; yy < y + h; yy++) for (let xx = x; xx < x + w; xx++) { const d = Math.min(xx - x, x + w - 1 - xx, yy - y, y + h - 1 - yy); if (d < 3 && hash(xx, yy, 4) < .55 - d * .15) pdot(b, xx, yy, 'rgba(235,245,255,.55)'); } }
    prect(b, x - 2, y - 2, w + 4, 2, fr); prect(b, x - 2, y + h, w + 4, 2, fr); prect(b, x - 2, y, 2, h, fr); prect(b, x + w, y, 2, h, fr);
    prect(b, x + w / 2 - 1, y, 2, h, fr); prect(b, x, y + ri(h * .45), w, 2, fr);
    prect(b, x - 4, y + h + 2, w + 8, 2, shade(fr, .85));
    if (o.sill) o.sill(b, x, y + h + 2, w);
    // 窗帘
    const cc = mood === 'morning' ? '#E9C9B3' : mood === 'evening' ? '#B07A6A' : '#8E6E7A';
    for (const [cx, dir] of [[x - 10, 1], [x + w + 2, -1]]) for (let i = 0; i < 9; i++) { const fold = (i % 3 === 1) ? shade(cc, .85) : cc; prect(b, cx + i, y - 6, 1, h + 18 + ((i * 3) % 4), fold); }
    prect(b, x - 14, y - 8, w + 28, 2, '#6B5546');
  }
  // 书架
  if (o.shelf !== false) {
    const sx = RM.shelfX;
    for (const yy of [32, 52]) {
      prect(b, sx, yy, 56, 2, '#6E5140');
      const rs = R(21 + yy); let x = sx + 2;
      while (x < sx + 52) { const bw = 2 + ri(rs() * 3), bh = 8 + ri(rs() * 7); if (rs() < .12) { x += 4; continue; } prect(b, x, yy - bh, bw, bh, ['#8E5A4A', '#4E6A7A', '#C9A66B', '#6B7A5A', '#A88A9A', '#E2D5C0'][Math.floor(rs() * 6)]); x += bw; }
    }
    if (o.onShelf) o.onShelf(b, sx);
  }
  // 门
  if (o.door != null) {
    const dx = 214, open = clamp(o.door);
    prect(b, dx, 38, 20, 54, '#FFE0A8'); if (gl && open > 0) prect(gl, dx, 38, 20, 54, rgba('#FFD090', .6 * open));
    prect(b, dx + ri(open * 16), 38, 20 - ri(open * 16), 54, '#6B4E3E'); pdot(b, dx + 3 + ri(open * 16), 66, '#E0B070');
    prect(b, dx - 2, 36, 24, 2, '#5A4030'); prect(b, dx - 2, 38, 2, 54, '#5A4030'); prect(b, dx + 20, 38, 2, 54, '#5A4030');
    if (open > 0) pbeam(b, dx, dx + 20, fy, b.canvas.height, -1.2, '#FFD090', .25 * open);
  }
  // 照片
  if (o.photos) for (const p of o.photos) photoFrame(b, p.x, p.y, p.w, p.h, p.img, p.a ?? 1);
  // 吊灯
  if (o.lamp !== false) {
    const lx = o.lampX ?? 140, on = P.lamp * (o.lampOn ?? 1);
    prect(b, lx, 0, 1, 22, '#1E1A20');
    for (let j = 0; j < 5; j++) prect(b, lx - 2 - j, 22 + j, 5 + j * 2, 1, '#C79A6A');
    prect(b, lx - 3, 27, 7, 1, mix('#6A5A48', '#FFE7A8', on));
    if (on > 0) { pcone(b, lx, 28, b.canvas.height, 10, 120, '#FFCF8A', .2 * on, .05 * on); if (gl) { prect(gl, lx - 4, 26, 9, 3, rgba('#FFE7A8', on)); pdisc(gl, lx, 30, 10, rgba('#FFC070', .35 * on)); } }
  }
}
/* 屋里整体压暗 / 提亮（画完人以后）：夜里四周暗、灯下亮 */
function roomShade(b, mood, lx = 140, ly = 60) {
  if (mood === 'morning') return;
  const c = b.canvas, a = mood === 'evening' ? .22 : .38;
  b.save(); b.globalCompositeOperation = 'multiply';
  for (let y = 0; y < c.height; y += 2) for (let x = 0; x < c.width; x += 2) {
    const d = Math.hypot(x - lx, (y - ly) * 1.3) / 200, k = Math.round(clamp(d) * 6) / 6;
    if (k > 0) { b.fillStyle = `rgba(${mood === 'evening' ? '90,50,40' : '40,40,90'},${(k * a).toFixed(3)})`; b.fillRect(x, y, 2, 2); }
  }
  b.restore();
}
/* 墙上的相框：img 是一张画好的画布（缩小进框里） */
function photoFrame(b, x, y, w, h, img, a = 1) {
  b.save(); b.globalAlpha = a;
  prect(b, x - 2, y - 2, w + 4, h + 4, '#6B4A34'); prect(b, x - 1, y - 1, w + 2, h + 2, '#F4EEE2');
  if (img) { b.imageSmoothingEnabled = true; b.drawImage(img, x, y, w, h); b.imageSmoothingEnabled = false; }
  b.restore();
}

/* ---------------- 窗外 ---------------- */
function outsideSnow(b, x, y, w, h, t, bloom = 0) {
  b.save(); b.translate(x, y);
  psky(b, w, h, [[0, '#0E1534'], [.7, '#27305E'], [1, '#4A4F7E']]);
  for (let i = 0; i < 5; i++) { const hx = i * 14 - 4, hy = h - 14 - (i % 2) * 3; prect(b, hx, hy, 12, 20, '#1C2140'); prect(b, hx - 1, hy - 1, 14, 2, '#DDE6F4'); if (i % 2 === 0) pdot(b, hx + 4, hy + 5, '#FFC66E'); }
  prect(b, 0, h - 5, w, 5, '#D8E2F0');
  psnow(b, t, w, h, { n: ri(w * h / 50), v: 10, bloom, seed: 9 });
  b.restore();
}
function outsideMoon(b, x, y, w, h, t) {
  b.save(); b.translate(x, y);
  psky(b, w, h, [[0, '#0B1230'], [1, '#2E3462']]);
  pstars(b, t, w, h, 8, 30, .8); pmoon(b, null, w * .7, h * .32, 5);
  for (let i = 0; i < 6; i++) prect(b, i * 11 - 2, h - 8 - (i * 7) % 9, 10, 20, '#141A38');
  b.restore();
}

function outsideMorning(b, x, y, w, h, t) {
  b.save(); b.translate(x, y);
  psky(b, w, h, [[0, '#8EC1EC'], [.7, '#CFE6F4'], [1, '#FFF2DC']]);
  pdisc(b, w * .78, h * .3, 6, '#FFF8E8');
  pcloud(b, ((t * 2) % (w + 30)) - 20, h * .3, 22, '#FFFFFF', '#E6EEF6');
  for (let i = 0; i < 6; i++) { const hx = i * 11 - 3, hy = h - 10 - (i * 5) % 7; prect(b, hx, hy, 10, 20, ['#C9A48E', '#9FB0C4', '#D8C2A0'][i % 3]); for (let j = 0; j < 4; j++) prect(b, hx - 1 + j, hy - j, 12 - j * 2, 1, '#9C6A58'); }
  b.restore();
}

/* ---------------- 雪夜小镇（320×180，地面 y=128） ---------------- */
function town(b, gl, t, o = {}) {
  const w = b.canvas.width, h = b.canvas.height, gy = o.gy ?? 128, spring = o.season === 'spring';
  if (spring) { psky(b, w, gy, [[0, '#8EC1E6'], [.7, '#CFE6F2'], [1, '#F6EBDD']]); pdisc(b, w * .8, 26, 9, '#FFF6D8'); if (gl) pdisc(gl, w * .8, 26, 14, 'rgba(255,240,200,.6)'); pcloud(b, 40, 40, 50, '#FFFFFF', '#E0ECF4'); pcloud(b, 190, 30, 40, '#FFFFFF', '#E0ECF4'); }
  else { psky(b, w, gy, [[0, '#0B1230'], [.5, '#1E2858'], [.85, '#3E4478'], [1, '#62608E']]); pstars(b, t, w, gy * .7, 4, 60, .6); pmoon(b, gl, o.moonX ?? w * .82, o.moonY ?? 26, 7); }
  // 远山
  for (const [yb, amp, seed, col, cap] of spring ? [[gy - 26, 26, 3, '#9CB7A8', null], [gy - 14, 16, 7, '#86A88E', null]] : [[gy - 26, 26, 3, '#2C3462', '#8C98C4'], [gy - 14, 16, 7, '#252B52', '#AEB9DC']]) {
    for (let x = 0; x < w; x++) { const top = ri(yb - (noise1(x / 40, seed) * .5 + .5) * amp); prect(b, x, top, 1, gy - top, col); if (cap) prect(b, x, top, 1, 2, cap); }
  }
  // 房子一排
  const rs = R(o.seed || 12); let x = -6;
  while (x < w + 10) {
    const hw = 22 + ri(rs() * 18), hh = 14 + ri(rs() * 10), hy = gy - 2;
    const wall = spring ? ['#C9A48E', '#9FB0C4', '#D8C2A0', '#B4A0B8'][Math.floor(rs() * 4)] : ['#4A3F55', '#3E4A62', '#5A4A48', '#46506A'][Math.floor(rs() * 4)];
    prect(b, x, hy - hh, hw, hh + 2, wall);
    for (let j = 0; j < 8; j++) prect(b, x - 2 + j, hy - hh - j, hw + 4 - j * 2, 1, spring ? shade(wall, .62) : (j < 2 ? '#E3EAF6' : shade(wall, .75)));
    if (!spring) for (let j = 0; j < 8; j++) { pdot(b, x - 2 + j, hy - hh - j - 1, '#E3EAF6'); pdot(b, x + hw + 1 - j, hy - hh - j - 1, '#E3EAF6'); }
    const nw = Math.max(1, Math.floor(hw / 9));
    for (let i = 0; i < nw; i++) { const wx = x + 3 + i * 9, wy = hy - hh + 4, lit = !spring && rs() < .75; prect(b, wx, wy, 4, 4, lit ? '#FFC873' : shade(wall, .7)); if (lit && gl) pdisc(gl, wx + 2, wy + 2, 3, 'rgba(255,176,80,.6)'); }
    if (rs() < .4 && !spring) { prect(b, x + hw - 6, hy - hh - 10, 3, 6, shade(wall, .7)); for (let i = 0; i < 4; i++) { const u = ((t * .3 + i / 4 + x * .01) % 1); pdot(b, x + hw - 5 + ri(u * 6), hy - hh - 12 - ri(u * 16), rgba('#C8D2EA', .4 * (1 - u))); } }
    x += hw + 4 + ri(rs() * 6);
  }
  // 地面
  if (spring) { prect(b, 0, gy, w, h - gy, '#A9C79A'); for (let i = 0; i < 6; i++) pell(b, hash(i, 2) * w, gy + 10 + hash(i, 3) * 40, 10 + hash(i, 4) * 12, 2, '#EEF3F8'); for (let i = 0; i < 50; i++) pdot(b, hash(i, 8) * w, gy + 4 + hash(i, 9) * 50, ['#FFFFFF', '#FFD6E0', '#FFE9A8'][i % 3]); }
  else { prect(b, 0, gy, w, h - gy, '#D2DCEE'); prect(b, 0, gy, w, 2, '#E9EFF8'); for (let i = 0; i < 8; i++) pell(b, hash(i, 2) * w, gy + 10 + hash(i, 3) * 40, 14 + hash(i, 4) * 20, 1, '#B4C2DC'); }
  if (o.lamps) o.lamps.forEach(([lx, hgt]) => streetLamp(b, gl, lx, gy + 8, hgt, o.lampOn ?? 1));
}

/* ---------------- 沙漠（320×180） ----------------  o.night；返回脊线函数 ridge(x) */
function desert(b, gl, t, o = {}) {
  const w = b.canvas.width, h = b.canvas.height, night = !!o.night;
  if (night) {
    psky(b, w, h, [[0, '#070A22'], [.55, '#151A48'], [.85, '#2D2A5E'], [1, '#4A3A6A']]);
    // 银河：斜着的一条亮带，点密一些
    for (let i = 0; i < 700; i++) { const u = hash(i, 31), off = (hash(i, 32) + hash(i, 33) + hash(i, 34) - 1.5) * 26; const x = ri(u * w), y = ri(20 + u * 50 + off); pdot(b, x, y, rgba(hash(i, 35) < .3 ? '#C8B0F0' : '#E8E0FF', .25 + hash(i, 36) * .5)); }
    for (let i = 0; i < 14; i++) pdisc(b, hash(i, 41) * w, 30 + hash(i, 41) * 50 + (hash(i, 42) - .5) * 18, 3 + hash(i, 43) * 4, 'rgba(160,130,220,.10)');
    pstars(b, t, w, h * .8, 6, 160, 1);
  } else {
    psky(b, w, h, [[0, '#E8A584'], [.45, '#F4C79A'], [.75, '#FADDB0'], [1, '#FCEBCB']]);
    pdisc(b, o.sunX ?? 250, o.sunY ?? 92, 11, '#FFF4DC'); if (gl) pdisc(gl, o.sunX ?? 250, o.sunY ?? 92, 20, 'rgba(255,230,170,.7)');
    pcloud(b, 60, 34, 46, '#F8D8C0', '#EAB8A0'); pcloud(b, 190, 24, 40, '#F8D8C0', '#EAB8A0');
  }
  const pan = o.pan || 0;
  const layers = night ? [['#3E4672', '#2C3258'], ['#353C66', '#262B4E'], ['#2C325A', '#1F2443']] : [['#F0C493', '#DDA478'], ['#EDB884', '#D49468'], ['#E9AC74', '#C9845A']];
  [[100, 16, 1, .2], [112, 22, 2, .4], [126, 26, 3, .7]].forEach(([base, amp, seed, par], li) => {
    const [lit, dark] = layers[li];
    let prev = null;
    for (let x = 0; x < w; x++) {
      const X = x + pan * par, u = X / 60;
      const top = ri(base - (Math.pow(Math.abs(Math.sin(u + noise1(u * .7, seed) * 1.2)), 1.6) * amp));
      const nxt = ri(base - (Math.pow(Math.abs(Math.sin((X + 1) / 60 + noise1((X + 1) / 60 * .7, seed) * 1.2)), 1.6) * amp));
      prect(b, x, top, 1, h - top, nxt > top ? lit : dark);
      prev = top;
    }
    void prev;
  });
  if (!night) for (let y = 96; y < 116; y++) if (y % 3 === 0) prect(b, 0, y, w, 1, 'rgba(255,236,200,.18)');
  // 前景的沙丘脊线
  const ridge = x => ri((o.ridgeY ?? 150) - Math.sin((x + pan + 60) / 150) * 10 - noise1((x + pan) / 50, 9) * 3);
  const [fl, fd] = night ? ['#262B4E', '#181C36'] : ['#E6A26A', '#BC764E'];
  for (let x = 0; x < w; x++) { const r = ridge(x); prect(b, x, r, 1, h - r, fl); prect(b, x, r + 8 + ri(Math.sin((x + pan) / 30) * 3), 1, h, fd); }
  for (let i = 0; i < 10; i++) for (let x = 0; x < w; x += 2) pdot(b, x, ridge(x) + 4 + i * 3 + ri(Math.sin((x + pan) / 12 + i) * 1), rgba(night ? '#8A94C8' : '#FFE9C8', .18));
  if (!night) drift(t, w, h, { n: 30, v: 4, vx: 60, seed: 41 }, (x, y) => { if (y > 100) prect(b, x, y, 3, 1, 'rgba(255,230,190,.5)'); });
  return ridge;
}

/* ---------------- 站台（320×180）：火车在站台后面（车身 y 60~128），站台 128~180 ---------------- */
function stationBg(b, gl, t, o = {}) {
  const w = b.canvas.width, dawn = o.time === 'dawn';
  psky(b, w, 128, dawn ? [[0, '#F2B48E'], [.5, '#F9D4A6'], [1, '#FFF0D2']] : [[0, '#8C98AC'], [.6, '#B9C2CE'], [1, '#D9DCE0']]);
  if (dawn) { pdisc(b, 250, 70, 10, '#FFF6DE'); if (gl) pdisc(gl, 250, 70, 18, 'rgba(255,224,160,.7)'); }
  const rs = R(15); let x = -4;
  while (x < w) { const bw = 10 + ri(rs() * 20), bh = 14 + ri(rs() * 36); prect(b, x, 100 - bh, bw, bh + 40, dawn ? '#D9A88E' : '#9AA3B2'); x += bw + 2; }
}
function platform(b, gl, t, o = {}) {
  const w = b.canvas.width, dawn = o.time === 'dawn';
  const pc = dawn ? '#C9B4A2' : '#A9A6A4';
  prect(b, 0, 128, w, 52, pc); prect(b, 0, 128, w, 2, shade(pc, .82)); prect(b, 0, 131, w, 2, dawn ? '#E9D27A' : '#D8C060');
  for (let x = 0; x < w; x += 20) prect(b, x, 133, 1, 47, shade(pc, .92));
  const roof = dawn ? '#5E4A48' : '#4A4E58';
  prect(b, 0, 0, w, 12, roof); prect(b, 0, 12, w, 2, shade(roof, 1.25));
  for (const px of o.pillars || [24, 296]) { prect(b, px - 2, 14, 4, 116, dawn ? '#6A5450' : '#555A64'); prect(b, px - 1, 14, 1, 116, 'rgba(255,255,255,.15)'); }
  if (o.sign !== false) { const sx = o.signX ?? 250; prect(b, sx - 18, 20, 36, 14, '#F2EEE6'); prect(b, sx - 18, 20, 36, 2, '#3E6E74'); ptext(b, '南站', sx, 21, 1, '#333333', { align: 'center' }); }
  if (o.clock !== false) { const cx = o.clockX ?? 70, cy = 28; prect(b, cx, 14, 1, 6, '#333'); pdisc(b, cx, cy, 7, '#F6F2EA'); pring(b, cx, cy, 7, 7, '#3A3A3A'); const hh = (o.clockT ?? t) / 30, mm = (o.clockT ?? t) / 2.5; pline(b, cx, cy, cx + Math.sin(hh) * 4, cy - Math.cos(hh) * 4, '#333'); pline(b, cx, cy, cx + Math.sin(mm) * 6, cy - Math.cos(mm) * 6, '#333'); }
}
/* 一节车厢：x0 左端，len 长；doorX 门中线（相对 x0），door 关了多少（0 开 ~ 1 关）；inFn(b, cx) 画门里 */
function trainCar(b, x0, len, o = {}) {
  const y0 = 62, y1 = 128, body = o.col || '#E9E2D2', band = o.band || '#3E6E74';
  x0 = ri(x0);
  prect(b, x0 + 4, y1 - 2, len - 8, 6, '#2A2A30');
  prect(b, x0, y0, len, y1 - y0, body); prect(b, x0, y0, len, 3, shade(body, .9)); pdot(b, x0, y0, 'rgba(0,0,0,0)');
  prect(b, x0, y0 + 42, len, 10, band); prect(b, x0, y0 + 41, len, 1, shade(band, 1.3));
  const dx = x0 + (o.doorX ?? ri(len / 2)), dw = 22;
  for (let wx = x0 + 8; wx < x0 + len - 22; wx += 30) { if (Math.abs(wx + 10 - dx) < 26) continue; prect(b, wx, y0 + 10, 20, 24, o.night ? '#FFD9A0' : '#5D7488'); prect(b, wx + 3, y0 + 12, 2, 20, 'rgba(255,255,255,.18)'); }
  const d = clamp(o.door ?? 0);
  prect(b, dx - dw / 2, y0 + 6, dw, y1 - y0 - 6, o.inside || '#3A3440');
  if (o.inFn) { b.save(); b.beginPath(); b.rect(dx - dw / 2, y0 + 6, dw, y1 - y0 - 6); b.clip(); o.inFn(b, dx); b.restore(); }
  for (const side of [-1, 1]) {
    const pw = dw / 2, px = side < 0 ? dx - dw / 2 - pw * (1 - d) : dx + pw * (1 - d) ;
    prect(b, px, y0 + 6, pw, y1 - y0 - 6, shade(body, .95)); prect(b, px + 2, y0 + 10, pw - 4, 22, 'rgba(93,116,136,.75)'); prect(b, px, y0 + 42, pw, 10, band);
  }
  prect(b, dx - dw / 2 - 1, y0 + 5, dw + 2, 1, shade(body, .7));
}

/* ---------------- 夜里的屋顶（宽缓冲，pan 往右移） ---------------- */
function rooftops(b, gl, t, o = {}) {
  const w = b.canvas.width, h = b.canvas.height, pan = o.pan || 0;
  psky(b, w, h, [[0, '#0A0F2A'], [.6, '#1C2452'], [1, '#3A3A6A']]);
  pstars(b, t, w, h * .6, 3, 120, .8);
  pmoon(b, gl, 250 - pan * .1, 30, 9);
  if (o.far) o.far(b);
  [[31, 120, .35, '#232A50', .3], [32, 140, .65, '#1A1F3E', .4], [33, 166, 1, '#11152C', .5]].forEach(([seed, yb, par, col, lit]) => {
    const rs = R(seed); let x = -ri((pan * par) % 2000) - 20;
    while (x < w + 20) {
      const bw = 22 + ri(rs() * 26), bh = 10 + ri(rs() * 22), top = yb - bh, roofT = rs();
      prect(b, x, top, bw, h - top, col);
      if (roofT < .5) for (let j = 0; j < 8; j++) prect(b, x - 1 + j, top - j, bw + 2 - j * 2, 1, col); else prect(b, x - 1, top - 2, bw + 2, 2, col);
      if (rs() < .5) prect(b, x + ri(bw * .7), top - 10, 3, 8, col);
      if (rs() < .3) { prect(b, x + ri(bw * .3), top - 16, 1, 10, col); prect(b, x + ri(bw * .3) - 3, top - 14, 7, 1, col); }
      for (let i = 0; i < 3; i++) if (rs() < lit) { const wx = x + 3 + ri(rs() * (bw - 8)), wy = top + 4 + ri(rs() * 12); prect(b, wx, wy, 3, 3, '#FFC66E'); if (gl) pdisc(gl, wx + 1, wy + 1, 3, 'rgba(255,176,80,.55)'); }
      x += bw + 1;
    }
  });
}

/* ---------------- 火车窗外（夜）：窗里的景往左跑 ---------------- */
function trainView(b, gl, t, x, y, w, h, sp = 1) {
  b.save(); b.beginPath(); b.rect(x, y, w, h); b.clip();
  psky(b, w + x, h, [[0, '#0E1434'], [.6, '#26305E'], [1, '#3E3E6E']], y);
  b.save(); b.translate(x, y); pstars(b, t, w, h * .5, 11, 40, .7); pmoon(b, gl ? null : null, w * .72, h * .22, 4); b.restore();
  for (let xx = 0; xx < w; xx++) { const X = xx + t * 10 * sp, top = ri(y + h * .55 - (noise1(X / 40, 4) * .5 + .5) * h * .25); prect(b, x + xx, top, 1, y + h - top, '#1E2650'); }
  prect(b, x, y + ri(h * .62), w, ri(h * .2), '#2C3668');
  for (let i = 0; i < 5; i++) prect(b, x + ri(w * .72) - 3 + ri(Math.sin(t * 2 + i) * 1), y + ri(h * .64) + i * 2, 6 - i, 1, rgba('#FFF0C8', .4 - i * .06));
  for (let i = 0; i < 18; i++) { const lx = x + ((((i * 23 - t * 30 * sp) % (w + 60)) + w + 60) % (w + 60)) - 30, ly = y + ri(h * .6) - ri(hash(i, 2) * 3); pdot(b, lx, ly, '#FFC070'); if (gl) pdot(gl, lx, ly, 'rgba(255,192,112,.8)'); }
  for (let i = 0; i < 6; i++) { const tx = x + ((((i * 60 - t * 160 * sp) % (w + 100)) + w + 100) % (w + 100)) - 50; for (let j = 0; j < 14; j++) prect(b, tx + j - 7 + (j > 7 ? 0 : 0), y + h - ri(Math.min(j, 14 - j) * 2.4), 1, ri(Math.min(j, 14 - j) * 2.4), '#0C1026'); }
  for (let i = 0; i < 3; i++) { const px = x + ((((i * 90 - t * 260 * sp) % (w + 100)) + w + 100) % (w + 100)) - 50; prect(b, px, y, 2, h, '#0A0C1E'); }
  b.restore();
}

/* ---------------- 厨房（240×135）：灶台在左边，台面 y=96，人站在 y=122 ---------------- */
function kitchen(b, gl, t, o = {}) {
  const w = b.canvas.width;
  prect(b, 0, 0, w, 96, '#E9DCC6');
  for (let y = 54; y < 92; y += 6) prect(b, 0, y, w, 1, '#D2C2A6');
  for (let x = 0; x < w; x += 6) prect(b, x, 54, 1, 38, '#D2C2A6');
  // 窗（雨夜）
  prect(b, 156, 12, 56, 36, '#1A2244'); b.save(); b.beginPath(); b.rect(156, 12, 56, 36); b.clip(); b.translate(156, 12); rain(b, t, 56, 36, { n: 30, v: 120, len: 4, col: 'rgba(200,215,255,.45)', seed: 4 }); b.restore();
  prect(b, 154, 10, 60, 2, '#F4EEE4'); prect(b, 154, 48, 60, 3, '#F4EEE4'); prect(b, 154, 12, 2, 36, '#F4EEE4'); prect(b, 212, 12, 2, 36, '#F4EEE4'); prect(b, 183, 12, 2, 36, '#F4EEE4');
  // 架子上的瓶罐
  prect(b, 14, 36, 100, 2, '#B98B62');
  for (let i = 0; i < 7; i++) { prect(b, 18 + i * 14, 24, 9, 12, ['#E9E1D3', '#C9D8D0', '#E6C8B0', '#D8D0E0'][i % 4]); prect(b, 19 + i * 14, 22, 7, 2, '#9A7050'); }
  // 台面、柜门
  prect(b, 0, 92, w, 4, '#F2EBE0'); prect(b, 0, 96, w, 39, '#8A6A54');
  for (let x = 4; x < w; x += 34) { prect(b, x, 100, 30, 1, '#6E5240'); prect(b, x, 100, 1, 32, '#6E5240'); prect(b, x + 29, 100, 1, 32, '#6E5240'); prect(b, x + 12, 106, 6, 1, '#C9A06A'); }
  // 灶和火
  prect(b, 30, 89, 54, 3, '#4A4A50');
  if (o.flame !== false) for (let i = 0; i < 7; i++) { const fx = 46 + i * 3, fh = 1 + ri((Math.sin(t * 20 + i * 2) * .5 + .5) * 2); prect(b, fx, 89 - fh, 1, fh, i % 2 ? '#6A9AFF' : '#9ABAFF'); if (gl) pdot(gl, fx, 88, 'rgba(110,150,255,.8)'); }
}
/* 锅（侧面）：x 中线，y 锅底；lid 揭开多少 */
function ppot(b, x, y, t, lid = 0) {
  prect(b, x - 16, y - 18, 32, 18, '#2E5A60'); prect(b, x - 16, y - 18, 32, 3, '#3E6E74'); pdot(b, x - 6, y - 9, '#F2EBE0'); pdot(b, x + 7, y - 11, '#F2EBE0');
  prect(b, x - 20, y - 16, 4, 2, '#2A2A2E'); prect(b, x + 16, y - 16, 4, 2, '#2A2A2E');
  const ly = ri(y - 19 - lid * 12), lx = ri(x + lid * 12);
  for (let j = 0; j < 3; j++) prect(b, lx - 16 + j * 2, ly - j, 32 - j * 4, 1, '#3E6E74');
  prect(b, lx - 3, ly - 4, 6, 2, '#2A2A2E');
  psteam(b, x - 4, y - 22 - lid * 6, t, 6, 18 + lid * 10, .5 + lid * .3);
}

/* ---------------- 溪边（320×180）：o.time sunset / sunrise / gold；溪从远处地平线弯到左下角；右边一块大石头 ---------------- */
const ST = { rockX: 214, rockY: 132 };
function streamC(u) { return [lerp(176, 50, u) + Math.sin(u * 5.2) * 26 * u, lerp(96, 190, Math.pow(u, 1.35)), lerp(1.5, 86, Math.pow(u, 1.6))]; }
function streamSet(b, gl, t, o = {}) {
  const w = b.canvas.width, h = b.canvas.height, tm = o.time || 'sunset';
  const SK = { sunset: [[0, '#5A5A92'], [.45, '#D88A86'], [.75, '#F6B98A'], [1, '#FFE2B0']], sunrise: [[0, '#8FB2D8'], [.5, '#F2C6B2'], [.8, '#FBDDB8'], [1, '#FFF2D6']], gold: [[0, '#E9A27C'], [.5, '#F6C894'], [1, '#FFE8C0']] }[tm];
  psky(b, w, 100, SK);
  const sx = o.sunX ?? 126, sy = o.sunY ?? 90;
  pdisc(b, sx, sy, 9, '#FFF2D8'); if (gl) pdisc(gl, sx, sy, 18, 'rgba(255,217,160,.75)');
  pcloud(b, 40, 36, 50, tm === 'sunrise' ? '#F6D6D0' : '#F2B0A0', tm === 'sunrise' ? '#E0B8C0' : '#C88A90'); pcloud(b, 220, 26, 60, tm === 'sunrise' ? '#F6D6D0' : '#F2B0A0', tm === 'sunrise' ? '#E0B8C0' : '#C88A90');
  const hc = tm === 'sunrise' ? ['#B9A6B8', '#9C9AAE'] : ['#A87E92', '#86687E'];
  for (let x = 0; x < w; x++) { const t1 = ri(92 - (noise1(x / 60, 2) * .5 + .5) * 20); prect(b, x, t1, 1, 12, hc[0]); const t2 = ri(98 - (noise1(x / 40, 5) * .5 + .5) * 10); prect(b, x, t2, 1, 8, hc[1]); }
  const gr = tm === 'sunrise' ? ['#9DB88A', '#6E9468'] : ['#A69A6E', '#6E7A4E'];
  for (let y = 96; y < h; y++) prect(b, 0, y, w, 1, mix(gr[0], gr[1], Math.floor((y - 96) / (h - 96) * 6) / 6));
  // 溪：先画深色的岸，再画水；水面上近处是深的天光倒影，远处亮；横的波纹；太阳的碎金
  const water = tm === 'sunrise' ? ['#E4F0F8', '#A9C8DE', '#6E90B8'] : tm === 'gold' ? ['#FFE8C0', '#9A8AB8', '#5E5A98'] : ['#FFE6C0', '#8E7AB0', '#4A4682'];
  for (let i = 0; i <= 100; i++) {
    const u = i / 100, [cx, cy, cw] = streamC(u);
    prect(b, cx - cw / 2 - 1 - u * 2, cy, cw + 2 + u * 4, 2, tm === 'sunrise' ? '#5E7A58' : '#5A4E3A');
  }
  for (let i = 0; i <= 100; i++) {
    const u = i / 100, [cx, cy, cw] = streamC(u);
    prect(b, cx - cw / 2, cy, cw, 2, u < .25 ? water[0] : u < .55 ? water[1] : water[2]);
  }
  for (let i = 0; i < 26; i++) { const u = (i + .5) / 26, [cx, cy, cw] = streamC(u), off = ri(Math.sin(t * 1.5 + i * 2) * cw * .12); prect(b, cx - cw * .3 + off, cy, Math.max(1, cw * .3), 1, 'rgba(255,255,255,.45)'); }
  for (let i = 0; i < 40; i++) { const u = hash(i, 41) * .85, [cx, cy, cw] = streamC(u), a = Math.max(0, Math.sin(t * (3 + hash(i, 42) * 4) + i * 1.3)); if (a > .3) prect(b, cx - cw * .25 + hash(i, 43) * cw * .5, cy, 1 + ri(u * 4), 1, rgba('#FFF0C8', a)); }
  // 岸边的草和小花
  for (let i = 0; i < 50; i++) { const u = hash(i, 11), [cx, cy, cw] = streamC(u), side = hash(i, 12) < .5 ? -1 : 1, bx = ri(cx + side * (cw / 2 + 2 + hash(i, 13) * 4)); pline(b, bx, cy, bx + 1, cy - 2 - ri(u * 4), tm === 'sunrise' ? '#5E8456' : '#5E6A3E'); if (hash(i, 14) < .3) pdot(b, bx + 1, cy - 3 - ri(u * 4), ['#FFFFFF', '#FFD6E0', '#FFE38A'][i % 3]); }
  // 树
  if (o.tree !== false) {
    const tx = o.treeX ?? 280;
    if (o.redBean) ptree(b, tx, 128, .95, .45, { pods: true });
    else { prect(b, tx - 2, 80, 4, 48, '#5A4234'); const lc = tm === 'sunrise' ? ['#6E9468', '#86AA74', '#A2C08A'] : ['#6E6A44', '#8E8450', '#B4A060']; for (let i = 0; i < 16; i++) { const a = hash(i, 21) * TAU, r = 6 + hash(i, 22) * 22; pdisc(b, tx + Math.cos(a) * r * 1.2, 70 + Math.sin(a) * r * .6, 9 + hash(i, 23) * 5, lc[i % 3]); } }
  }
  // 石头
  if (o.rock !== false) {
    const rx = ST.rockX, ry = ST.rockY, rc = tm === 'sunrise' ? '#8E8A90' : '#6A5A58';
    for (let j = 0; j < 12; j++) { const ww = ri(lerp(20, 34, Math.min(1, j / 5))); prect(b, rx - ww, ry - 4 + j, ww * 2, 1, j < 2 ? shade(rc, 1.2) : rc); }
  }
}

/* ---------------- 山坡草地（320×180，tilt 往上摇） ---------------- */
const meadowY = x => ri(132 - Math.sin((x - 50) / 110) * 18);
function meadow(b, gl, t, o = {}) {
  const w = b.canvas.width, h = b.canvas.height, tilt = o.tilt || 0, ty = ri(tilt * 120);
  psky(b, w, h, [[0, '#6FA6D6'], [.6, '#A9CDE8'], [1, '#E6F0EE']]);
  for (let i = 0; i < 6; i++) pcloud(b, ((i * 70 + t * 4) % (w + 80)) - 40, 20 + (i % 3) * 18 + ty * (i > 2 ? 1 : .6) - (i > 3 ? 60 : 0), 34 + (i % 2) * 16, '#FFFFFF', '#E0ECF4');
  b.save(); b.translate(0, ty);
  for (let x = 0; x < w; x++) { const top = ri(104 - (noise1(x / 60, 3) * .5 + .5) * 14); prect(b, x, top, 1, 40, '#9CC0A6'); }
  for (let x = 0; x < w; x++) { const top = meadowY(x); for (let y = top; y < h + 10; y++) prect(b, x, y, 1, 1, y - top < 2 ? '#A2C878' : mix('#8DBB6E', '#6E9E54', Math.floor((y - top) / 50 * 4) / 4)); }
  for (let i = 0; i < 160; i++) { const x = ri(hash(i, 1) * w), y0 = meadowY(x) + ri(hash(i, 2) * 60), bend = Math.sin(t * 2.4 + x * .05) > 0 ? 1 : 0; pdot(b, x, y0, ['#5E8E44', '#7AAA58', '#A2C878'][i % 3]); pdot(b, x + bend, y0 - 1, ['#5E8E44', '#7AAA58', '#A2C878'][i % 3]); if (i % 9 === 0) pdot(b, x + bend, y0 - 2, ['#FFFFFF', '#FFE38A', '#F6C0D0'][i % 3]); }
  b.restore();
  return ty;
}

/* ---------------- 公园长椅（320×180），一年：yr 0..1（春 → 夏 → 秋 → 冬） ---------------- */
function park(b, gl, t, yr) {
  const w = b.canvas.width, h = b.canvas.height, season = ((yr % 1) + 1) % 1;
  const sky = ramp([[0, '#BFDCEC'], [.25, '#8EC4E8'], [.5, '#E8C8A0'], [.75, '#B8C2D0'], [1, '#BFDCEC']], season);
  const ground = ramp([[0, '#9CC48A'], [.25, '#7AAE5E'], [.5, '#C2A066'], [.75, '#E6ECF2'], [1, '#9CC48A']], season);
  psky(b, w, 130, [[0, shade(sky, .9)], [1, shade(sky, 1.1)]]);
  prect(b, 0, 128, w, h - 128, ground); prect(b, 0, 150, w, 6, shade(ground, .9));
  const leaf = ramp([[0, '#F7A9C0'], [.12, '#F7B6C8'], [.17, '#D8E8B0'], [.22, '#8CC070'], [.45, '#6EA058'], [.55, '#E0A048'], [.68, '#C66A3A'], [.76, '#9E8A7A'], [1, '#F7A9C0']], season);
  const amount = season < .62 ? 1 : season < .78 ? 1 - (season - .62) / .16 : season < .92 ? 0 : (season - .92) / .08;
  for (const [tx, sc] of [[70, 1.1], [250, 1]]) {
    prect(b, tx - 3 * sc, 76, 6 * sc, 54, '#5A4436'); pline(b, tx, 92, tx - 18 * sc, 70, '#5A4436'); pline(b, tx, 86, tx + 20 * sc, 66, '#5A4436');
    for (let i = 0; i < 20; i++) { if (hash(i, 31) > amount) continue; const a = hash(i, 32) * TAU, r = hash(i, 33) * 26 * sc; pdisc(b, tx + Math.cos(a) * r * 1.2, 60 + Math.sin(a) * r * .55, (7 + hash(i, 35) * 5) * sc, shade(leaf, .85 + hash(i, 34) * .3)); }
    if (season > .74 && season < .92) for (let i = 0; i < 4; i++) prect(b, tx - 20 + hash(i, 7) * 40, 66 + hash(i, 8) * 10, 6, 1, '#FFFFFF');
  }
  const fallCol = season < .2 ? '#F8D2DE' : season < .45 ? null : season < .72 ? leaf : '#FFFFFF';
  if (fallCol) drift(t, w, 130, { n: 26, v: 10, vx: 6, seed: 81 }, (x, y) => { pdot(b, x, y, fallCol); pdot(b, x + 1, y, fallCol); });
  streetLamp(b, gl, 196, 152, 60, season > .7 ? .6 : 0);
}

/* ---------------- 院子和红豆树（320×180）：o.season、o.grow、o.night、o.snow、o.lit ---------------- */
const YD = { treeX: 196, gy: 140, houseX: 84 };
function yard(b, gl, t, o = {}) {
  const w = b.canvas.width, h = b.canvas.height, night = clamp(o.night || 0), season = (((o.season ?? .3) % 1) + 1) % 1, grow = clamp(o.grow ?? 1);
  const daySky = ramp([[0, '#BFDCEC'], [.25, '#8EC4E8'], [.5, '#EEC7A0'], [.75, '#C2CAD6'], [1, '#BFDCEC']], season);
  psky(b, w, YD.gy, [[0, mix(shade(daySky, .88), '#0B1030', night)], [1, mix(shade(daySky, 1.08), '#2E2E5E', night)]]);
  if (night > .2) pstars(b, t, w, YD.gy * .7, 12, 80, night);
  if (night > .3) pmoon(b, gl, 280, 26, 6);
  else { pdisc(b, 270, 30, 8, mix('#FFF6D8', '#FFFFFF', .3)); if (gl) pdisc(gl, 270, 30, 14, rgba('#FFF6D8', .6 * (1 - night))); }
  const snowy = o.snow || (season > .76 && season < .95);
  const ground = mix(ramp([[0, '#9CC48A'], [.25, '#7AAE5E'], [.5, '#B89C66'], [.75, '#DDE4EC'], [.95, '#DDE4EC'], [1, '#9CC48A']], season), '#1E2240', night * .7);
  for (let x = 0; x < w; x++) { const top = ri(116 - (noise1(x / 60, 9) * .5 + .5) * 14); prect(b, x, top, 1, YD.gy - top, mix('#8EA8A0', '#20264A', night)); }
  prect(b, 0, YD.gy - 14, w, h, ground);
  phouse(b, gl, YD.houseX, YD.gy, { w: 56, h: 30, night, lit: o.lit ?? night, snow: snowy });
  pfence(b, 0, YD.houseX - 32, YD.gy + 2, mix('#F2ECE2', '#4A4660', night * .7)); pfence(b, YD.houseX + 32, w, YD.gy + 2, mix('#F2ECE2', '#4A4660', night * .7));
  const tips = ptree(b, YD.treeX, YD.gy + 4, grow, season, { night, pods: o.pods });
  if (snowy) prect(b, 0, YD.gy + 4, w, h, mix('#F0F4FA', '#B8C4E0', night));
  return tips;
}

/* ---------------- 四处风景（320×180） ---------------- */
function vista(b, gl, t, kind) {
  const w = b.canvas.width, h = b.canvas.height;
  if (kind === 'sea') {
    psky(b, w, 104, [[0, '#4A5A92'], [.5, '#D9909A'], [1, '#FFD4A0']]);
    pdisc(b, 210, 102, 10, '#FFF0D0'); if (gl) pdisc(gl, 210, 102, 18, 'rgba(255,217,160,.7)');
    for (let y = 104; y < h; y++) prect(b, 0, y, w, 1, mix('#B87A8A', '#3E3E6E', (y - 104) / (h - 104)));
    for (let i = 0; i < 30; i++) { const a = Math.max(0, Math.sin(t * 3 + i)); if (a > .3) prect(b, 180 + hash(i, 1) * 60, 106 + hash(i, 2) * 50, 3 + hash(i, 3) * 5, 1, rgba('#FFE6C8', a)); }
    for (let x = 30; x < 120; x++) { const top = ri(124 + Math.pow(Math.abs(x - 60) / 50, 2) * 30); prect(b, x, top, 1, h - top, '#2E2A44'); }
    for (let y = 70; y < 124; y++) { const ww = ri(lerp(6, 9, (y - 70) / 54)); prect(b, 70 - ww, y, ww * 2, 1, (y > 86 && y < 92) || (y > 104 && y < 110) ? RED : '#F2ECE2'); }
    prect(b, 63, 64, 14, 6, '#3A3A4A'); pdisc(b, 70, 67, 2, '#FFF0B0'); if (gl) pdisc(gl, 70, 67, 8, 'rgba(255,240,176,.9)');
    const ang = t * 1.5; for (let i = 0; i < 90; i++) { const x = ri(70 + Math.cos(ang) * i * 2.5), y = ri(67 + Math.sin(ang) * i * .3); pdot(b, x, y, `rgba(255,240,180,${(.3 * (1 - i / 90)).toFixed(2)})`); }
    return [100, 128, '#2A2440'];
  }
  if (kind === 'snowpeak') {
    psky(b, w, 140, [[0, '#3E5A92'], [.6, '#E9A8A0'], [1, '#FFE0B0']]);
    for (const [cx, ww, hh, c] of [[80, 120, 70, '#7A7AA8'], [220, 150, 86, '#6A6A9A'], [160, 100, 60, '#8A86B0']]) {
      for (let y = 0; y < hh; y++) { const half = ri(ww / 2 * y / hh), yy = 142 - hh + y; prect(b, cx - half, yy, half * 2 + 1, 1, y < hh * .3 ? '#FFF2EC' : (y < hh * .34 && (cx + y) % 3 === 0 ? '#FFF2EC' : c)); prect(b, cx, yy, half + 1, 1, y < hh * .3 ? '#F6D8D0' : shade(c, .85)); }
    }
    prect(b, 0, 142, w, h - 142, '#E8ECF4');
    return [150, 150, '#3A3A60'];
  }
  if (kind === 'flowers') {
    psky(b, w, 104, [[0, '#E89A88'], [.6, '#F6C89A'], [1, '#FFE6C0']]);
    pdisc(b, 230, 96, 10, '#FFF2D0'); if (gl) pdisc(gl, 230, 96, 18, 'rgba(255,224,160,.7)');
    prect(b, 0, 102, w, h - 102, '#B88AB0');
    for (let r = 0; r < 12; r++) { const y = 104 + ri(Math.pow(r / 11, 1.6) * 76); for (let x = (r % 2) * 3; x < w; x += 6 + ri(r * .4)) prect(b, x + ri(Math.sin(t * 2 + x + r) * .6), y, 2 + ri(r * .3), 1 + ri(r * .2), ['#9A6AB0', '#B888C8', '#D4A8DC'][(x + r) % 3]); }
    return [176, 132, '#5A3A60'];
  }
  // aurora
  psky(b, w, h, [[0, '#050A20'], [1, '#14284A']]);
  pstars(b, t, w, h, 21, 140, 1);
  for (let band = 0; band < 3; band++) for (let x = 0; x < w; x++) {
    const y = ri(44 + band * 14 + Math.sin(x / 40 + t * .8 + band) * 10 + Math.sin(x / 14 + t * 1.3) * 2), a = .45 * (.5 + .5 * Math.sin(x / 22 + t + band * 2));
    for (let k = 0; k < 26; k++) { const aa = a * (k < 4 ? 1 : 1 - (k - 4) / 22); if (aa > .03) pdot(b, x, y - k, k < 4 ? rgba('#96FFC8', aa) : rgba(k < 14 ? '#50F0AA' : '#7850DC', aa * .7)); }
  }
  for (let x = 0; x < w; x++) { const top = ri(146 - (noise1(x / 50, 8) * .5 + .5) * 14); prect(b, x, top, 1, h - top, '#0E1A30'); }
  return [150, 146, '#081020'];
}
