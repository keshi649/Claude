'use strict';
/* world2.js：内景。教室（侧面看窗户、正面看黑板）、走廊、楼梯间、天台、火车车厢、她的卧室。
   教室是全片最常回来的地方：一样的窗户、绿墙裙、吊扇、课桌上一摞摞的书；
   七年前满是人、阳光、窗帘被风吹起来；七年后空着，桌椅摞起来，光里飘着灰。 */

/* ---------------- 教室：侧面（看着窗户那面墙） ----------------
   画面坐标：墙 y 0~760（下面 560~760 是绿墙裙），地面 760 以下。窗户每 560 像素一扇。
   o.x 镜头横移；o.tod 时间（morning / noon / golden / sunset / night / present）；o.wind 窗帘被吹的程度；
   o.empty 七年后空教室；o.back(gg) 画后排的人；o.front(gg) 画前排的人（在课桌后面）；o.desks 前排课桌的位置 */
const ROOM = {
  morning: { sky: SKYS.morning, light: '#E8F2FF', beam: .18, wall: '#EEF0EE', tint: 'rgba(120,150,210,.10)' },
  noon: { sky: SKYS.noon, light: '#FFF8E0', beam: .22, wall: '#F4F0E6', tint: null },
  golden: { sky: SKYS.golden, light: '#FFE2A8', beam: .32, wall: '#F6ECDA', tint: 'rgba(255,190,110,.10)' },
  sunset: { sky: SKYS.sunset, light: '#FFC890', beam: .38, wall: '#F2DCC6', tint: 'rgba(255,140,90,.14)' },
  night: { sky: SKYS.night, light: '#FFFFFF', beam: 0, wall: '#E6E8EA', tint: null },
  present: { sky: SKYS.golden, light: '#FFE0B0', beam: .3, wall: '#E8DFCF', tint: 'rgba(150,120,90,.10)' },
};
function classroomSide(g, s, o = {}) {
  const tod = o.tod || 'noon', P = ROOM[tod], x = o.x || 0;
  const wall = P.wall;
  // 墙
  g.fillStyle = wall; g.fillRect(0, 0, W, 760);
  g.fillStyle = shade(wall, .92); g.fillRect(0, 0, W, 54);                 // 天花板的边
  g.fillStyle = tod === 'present' ? '#7A9C82' : '#7FB08C'; g.fillRect(0, 560, W, 200);   // 绿墙裙
  g.fillStyle = shade('#7FB08C', .8); g.fillRect(0, 556, W, 8);
  // 窗户
  const sp = 560, off = ((x % sp) + sp) % sp;
  for (let px = -off - sp; px < W + sp; px += sp) {
    const k = Math.round((px + x) / sp);
    windowPane(g, s, px + 90, 120, 380, 410, { ...o, P, k });
  }
  // 窗外照进来的光柱（斜着打到地上）
  if (P.beam > 0 && o.beams !== false) {
    g.save(); g.globalCompositeOperation = 'screen';
    for (let px = -off - sp; px < W + sp; px += sp) {
      const a = P.beam * (o.beamA ?? 1);
      g.fillStyle = lgrad(g, px + 280, 330, px + 520, 900, [[0, rgba(P.light, a)], [1, rgba(P.light, 0)]]);
      g.beginPath(); g.moveTo(px + 90, 160); g.lineTo(px + 470, 160); g.lineTo(px + 900, 1000); g.lineTo(px + 420, 1000); g.closePath(); g.fill();
    }
    g.restore();
  }
  // 日光灯、吊扇
  for (let px = -((x * 1.0) % 700 + 700) % 700; px < W + 700; px += 700) {
    g.fillStyle = '#BFC4C8'; g.fillRect(px + 120, 54, 4, 40); g.fillRect(px + 380, 54, 4, 40);
    rr(g, px + 100, 92, 300, 14, 6); g.fillStyle = tod === 'night' ? '#FFFFFF' : '#E8ECEE'; g.fill();
    if (tod === 'night') glow(g, px + 250, 100, 260, '#F0F6FF', .35);
  }
  ceilingFan(g, s, 960 - ((x % 1400) + 1400) % 1400 + 700, 60, o.fan ?? (o.empty ? 0 : 1));
  // 地面
  g.fillStyle = vgrad(g, 760, H, [[0, tod === 'present' ? '#C9BBA4' : '#D8CCB6'], [1, tod === 'present' ? '#A8987E' : '#BCAE96']]); g.fillRect(0, 760, W, H - 760);
  for (let i = 0; i < 12; i++) { g.fillStyle = 'rgba(0,0,0,.04)'; g.fillRect(0, 760 + i * 30 + i * i * 2, W, 2); }
  // 后排
  if (o.back) { g.save(); o.back(g); g.restore(); }
  else if (o.empty) stackedDesks(g, s, x, .78, 690);
  // 前排的课桌（桌子画在人前面）
  if (o.front) { g.save(); o.front(g); g.restore(); }
  // 七年后：光里飘着的灰
  if (o.empty || o.dust) dust(g, s, 140, [0, 100, W, 900], P.light, .5);
  if (P.tint) { g.fillStyle = P.tint; g.fillRect(0, 0, W, H); }
}
/* 一扇窗：外面是天和树，窗框，窗帘（风吹起来鼓着） */
function windowPane(g, s, x, y, w, h, o) {
  const P = o.P, k = o.k || 0;
  g.save();
  g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.fillStyle = vgrad(g, y, y + h, P.sky); g.fillRect(x, y, w, h);
  if (o.tod === 'night') { for (let i = 0; i < 20; i++) { g.fillStyle = 'rgba(255,255,255,.7)'; g.fillRect(x + hash(i, k) * w, y + hash(i, k, 3) * h * .6, 2, 2); } }
  else {
    cloud(g, (k * 5 + 3) % 12, x + w * .6 + Math.sin(s * .05 + k) * 30, y + h * .3, w * 1.1, CLOUDP[o.tod === 'present' ? 'golden' : o.tod] || CLOUDP.noon, .9);
    // 窗外的大树（二楼的窗户正对着树冠）
    const leaf = o.tod === 'sunset' ? '#7A8A4A' : o.tod === 'golden' || o.tod === 'present' ? '#6E9C48' : o.tod === 'morning' ? '#5E9A6E' : '#4E9A50';
    for (let i = 0; i < 9; i++) {
      const bx = x + hash(i, k, 5) * w, by = y + h * (.55 + hash(i, k, 6) * .5), br = 60 + hash(i, k, 7) * 70;
      const sw = Math.sin(s * 1.4 + i + k) * 6 * (o.wind ?? .5);
      circ(g, bx + sw, by, br); g.fillStyle = shade(leaf, .8 + hash(i, k, 8) * .35); g.fill();
    }
    if (o.season === 'autumn') { for (let i = 0; i < 9; i++) { circ(g, x + hash(i, k, 15) * w, y + h * (.6 + hash(i, k, 16) * .4), 50 + hash(i, k, 17) * 50); g.fillStyle = i % 2 ? '#E0A040' : '#C86A3A'; g.fill(); } }
    if (o.season === 'winter') { g.fillStyle = 'rgba(235,240,248,.85)'; g.fillRect(x, y + h * .55, w, h * .45); }
  }
  g.restore();
  // 窗框
  g.strokeStyle = '#F8F6F0'; g.lineWidth = 14; g.strokeRect(x, y, w, h);
  g.lineWidth = 8; g.beginPath(); g.moveTo(x + w / 2, y); g.lineTo(x + w / 2, y + h); g.moveTo(x, y + h * .38); g.lineTo(x + w, y + h * .38); g.stroke();
  g.fillStyle = '#E2DCD0'; g.fillRect(x - 20, y + h, w + 40, 18);                       // 窗台
  // 窗帘：两边各一片，风吹的时候往屋里鼓
  const wind = (o.wind ?? .4) * (.6 + .4 * Math.sin(s * 1.7 + k * 1.3));
  for (const side of [-1, 1]) {
    const cx = side < 0 ? x - 10 : x + w + 10, bulge = wind * 90 * (1 + .3 * Math.sin(s * 2.3 + k + side));
    g.beginPath(); g.moveTo(cx - side * 0, y - 20);
    g.lineTo(cx - side * 70, y - 20);
    g.bezierCurveTo(cx - side * (70 + bulge * .3), y + h * .3, cx - side * (60 + bulge), y + h * .7, cx - side * (40 + bulge * .8), y + h + 10);
    g.lineTo(cx + side * 10, y + h + 10); g.closePath();
    g.fillStyle = 'rgba(214,232,244,.92)'; g.fill();
    for (let j = 1; j < 4; j++) { g.strokeStyle = 'rgba(160,190,214,.5)'; g.lineWidth = 2; g.beginPath(); g.moveTo(cx - side * j * 16, y - 20); g.quadraticCurveTo(cx - side * (j * 16 + bulge * .5), y + h * .5, cx - side * (j * 12 + bulge * .7), y + h + 6); g.stroke(); }
  }
}
function ceilingFan(g, s, x, y, spin = 1) {
  g.fillStyle = '#B8BCC0'; g.fillRect(x - 3, y, 6, 70); circ(g, x, y + 76, 16); g.fill();
  const a = s * 9 * spin;
  for (let i = 0; i < 3; i++) {
    const c = Math.cos(a + i * TAU / 3);
    g.fillStyle = 'rgba(190,195,200,.95)'; ell(g, x + c * 130, y + 78, Math.abs(c) * 120 + 10, 9); g.fill();
  }
}
/* 一张课桌（侧面）：x 桌子靠近黑板那头，y 桌面；o.w 桌面长，o.h 桌腿高，o.books 桌上的书摞多高 */
function deskSide(g, x, y, k = 1, o = {}) {
  const w = (o.w ?? 230) * k, h = (o.h ?? 150) * k;
  g.fillStyle = '#7A8088'; g.fillRect(x + 14 * k, y, 7 * k, h); g.fillRect(x + w - 21 * k, y, 7 * k, h);   // 桌腿
  g.fillStyle = '#8C9298'; g.fillRect(x + 10 * k, y + h * .8, w - 20 * k, 5 * k);
  g.fillStyle = '#B08654'; g.fillRect(x + 6 * k, y + 8 * k, w - 12 * k, Math.min(46 * k, h * .4));      // 桌肚
  g.fillStyle = '#C9A06E'; g.fillRect(x, y - 6 * k, w, 14 * k);                       // 桌面
  // 桌上一摞书（中国高中的课桌）
  const n = o.books ?? 6;
  for (let i = 0; i < n; i++) {
    const bh = (10 + hash(i, o.seed || 0) * 8) * k, bw = (60 + hash(i, 3, o.seed || 0) * 36) * k;
    g.fillStyle = ['#E8D9B8', '#7FA6C8', '#E8A07A', '#F2EEE2', '#9CC59A', '#D8C2E6'][(i + (o.seed || 0)) % 6];
    g.fillRect(x + 10 * k, y - 6 * k - (i + 1) * bh * 1.02, bw, bh);
  }
}
/* 椅子（侧面）：x 椅面中间，y 椅面 */
function chairSide(g, x, y, k = 1, h = 60) {
  g.fillStyle = '#7A8088'; g.fillRect(x - 26 * k, y, 5 * k, h); g.fillRect(x + 22 * k, y, 5 * k, h); g.fillRect(x + 22 * k, y - 70 * k, 5 * k, 70 * k);
  g.fillStyle = '#C9A06E'; g.fillRect(x - 32 * k, y - 4 * k, 64 * k, 9 * k); g.fillRect(x + 18 * k, y - 74 * k, 12 * k, 44 * k);
}
/* 一排坐着的学生（脸朝左，黑板在左边）。R：一排的尺寸；x0 第一张桌子的位置；who(i) 返回这个座位上的人（null 就空着） */
const ROW_F = { u: 40, hip: 868, sp: 340, w: 200, k: 1 };
const ROW_B = { u: 31, hip: 768, sp: 270, w: 156, k: .8 };
function seatRow(g, s, R, x0, n, who, o = {}) {
  const u = R.u, top = R.hip - .5 * u, feet = R.hip + 1.66 * u;
  for (let i = 0; i < n; i++) {
    const dx = x0 + i * R.sp, hx = dx + R.w + .95 * u * (R.w / 200 * 1.0);
    if (dx > W + 60 || dx + R.sp < -80) continue;
    chairSide(g, hx + .25 * u, R.hip + .3 * u, u / 40, feet - R.hip - .3 * u);
    const p = who(i, dx, hx);
    if (p) person(g, { x: hx, y: R.hip, u, face: -1, pose: POSE.sitDesk, t: s + i * 1.7, light: o.light || LIGHT.room, ...p });
    deskSide(g, dx, top, 1, { w: R.w, h: feet - top, books: o.books ?? (3 + (i % 4)), seed: i + (o.seed || 0) });
  }
}
/* 七年后：课桌椅摞在一起，靠着墙 */
function stackedDesks(g, s, x, k, y) {
  for (let i = -1; i < 9; i++) {
    const dx = ((i * 330 - x * .9) % (W + 330) + W + 330) % (W + 330) - 200;
    deskSide(g, dx, y, k, { books: 0, h: 120 });
    g.save(); g.translate(dx + 110 * k, y - 8 * k); g.scale(1, -1); deskSide(g, -110 * k, 0, k * .95, { books: 0, h: 120 }); g.restore();
  }
}
/* 光里飘的灰尘 */
function dust(g, s, n, box, col, a = .5) {
  const [x0, y0, x1, y1] = box;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const p of floaters(s, 77, n, box, { vy: 6, vx: 4, amp: 14, wob: .4 })) {
    g.fillStyle = rgba(col, a * (.3 + .7 * p.tw) * (.5 + p.sz)); g.fillRect(p.x, p.y, 1.5 + p.sz * 2.5, 1.5 + p.sz * 2.5);
  }
  g.restore();
}

/* ---------------- 教室：正面（黑板） ----------------
   o.board(g) 黑板上写什么；o.count 倒计时牌上的天数；o.teacher(g) 讲台前的人；o.backs(g) 前景里的后脑勺 */
function classroomFront(g, s, o = {}) {
  const tod = o.tod || 'noon', P = ROOM[tod];
  g.fillStyle = P.wall; g.fillRect(0, 0, W, H);
  g.fillStyle = '#7FB08C'; g.fillRect(0, 700, W, 380); g.fillStyle = shade('#7FB08C', .8); g.fillRect(0, 696, W, 8);
  // 黑板（整体偏左：右边的倒计时牌要在 x < 1650 的安全区里）
  rr(g, 290, 170, 1110, 470, 8); g.fillStyle = '#5A4632'; g.fill();
  g.fillStyle = vgrad(g, 184, 626, [[0, '#2F5244'], [1, '#26463A']]); g.fillRect(306, 184, 1078, 442);
  g.fillStyle = 'rgba(255,255,255,.04)'; for (let i = 0; i < 8; i++) g.fillRect(310 + i * 132, 190, 60, 430);   // 擦过的痕迹
  g.fillStyle = '#6A5640'; g.fillRect(290, 640, 1110, 18);
  if (o.board) { g.save(); g.beginPath(); g.rect(306, 184, 1078, 442); g.clip(); o.board(g); g.restore(); }
  // 钟
  circ(g, 845, 104, 46); g.fillStyle = '#FFFFFF'; g.fill(); g.strokeStyle = '#3A3A44'; g.lineWidth = 6; g.stroke();
  const hr = o.clock ?? (s / 60), mn = (hr % 1) * TAU, hh = (hr / 12 % 1) * TAU;
  line(g, 845, 104, 845 + Math.sin(hh) * 24, 104 - Math.cos(hh) * 24, '#2A2A30', 5);
  line(g, 845, 104, 845 + Math.sin(mn) * 36, 104 - Math.cos(mn) * 36, '#2A2A30', 3);
  // 标语
  text(g, '勤奋', 150, 330, 64, { k: 'serifX', col: '#C8382E' }); text(g, '求实', 150, 430, 64, { k: 'serifX', col: '#C8382E' });
  // 倒计时牌
  if (o.count != null) {
    rr(g, 1430, 230, 210, 300, 8); g.fillStyle = '#FFF6E0'; g.fill(); g.strokeStyle = '#C8382E'; g.lineWidth = 6; g.stroke();
    text(g, '距离高考', 1535, 280, 34, { k: 'sans', col: '#C8382E', ls: 2 });
    text(g, String(o.count), 1535, 400, o.count >= 100 ? 104 : 124, { k: 'serifX', col: '#C8382E' });
    text(g, '天', 1535, 494, 36, { k: 'sans', col: '#C8382E' });
  }
  // 讲台
  if (o.teacher) { g.save(); o.teacher(g); g.restore(); }
  rr(g, 645, 690, 400, 180, 6); g.fillStyle = '#B08654'; g.fill(); g.fillStyle = '#C9A06E'; g.fillRect(629, 680, 432, 22);
  g.fillStyle = vgrad(g, 870, H, [[0, '#CFC2AA'], [1, '#B4A68E']]); g.fillRect(0, 870, W, H - 870);
  if (o.backs) { g.save(); o.backs(g); g.restore(); }
  if (P.tint) { g.fillStyle = P.tint; g.fillRect(0, 0, W, H); }
}
/* 黑板上的粉笔字（手写体） */
function chalk(g, str, x, y, px, o = {}) { text(g, str, x, y, px, { k: 'hand', col: o.col || 'rgba(246,246,238,.92)', align: o.align || 'left', ls: o.ls ?? 2, alpha: o.alpha ?? 1, rot: o.rot }); }

/* ---------------- 走廊（从外面看：栏杆在前，后面是教室的墙、窗户和门） ---------------- */
function corridor(g, s, x, o = {}) {
  const tod = o.tod || 'noon', P = ROOM[tod];
  g.fillStyle = vgrad(g, 0, H, P.sky); g.fillRect(0, 0, W, H);
  // 楼上的楼板
  g.fillStyle = '#E6DCCB'; g.fillRect(0, 0, W, 120); g.fillStyle = 'rgba(0,0,0,.1)'; g.fillRect(0, 112, W, 8);
  // 墙
  g.fillStyle = '#EFE6D6'; g.fillRect(0, 120, W, 700);
  const sp = 620, off = ((x % sp) + sp) % sp;
  for (let px = -off - sp; px < W + sp; px += sp) {
    const k = Math.round((px + x) / sp);
    // 窗户：里面是教室（暖光 + 人头）
    rr(g, px + 60, 260, 300, 260, 4); g.fillStyle = '#F8F4EA'; g.fill();
    g.fillStyle = tod === 'night' ? '#FFE9B8' : '#C9D9E6'; g.fillRect(px + 72, 272, 276, 236);
    for (let j = 0; j < 4; j++) { circ(g, px + 110 + j * 66, 470, 22); g.fillStyle = KID_HAIR[(((j + k) % 5) + 5) % 5]; g.fill(); }
    g.strokeStyle = '#F8F4EA'; g.lineWidth = 8; g.beginPath(); g.moveTo(px + 210, 272); g.lineTo(px + 210, 508); g.stroke();
    // 门和班牌
    rr(g, px + 420, 220, 150, 380, 4); g.fillStyle = '#B88A5A'; g.fill(); g.fillStyle = '#9DB8CC'; g.fillRect(px + 448, 250, 94, 90);
    rr(g, px + 430, 160, 130, 46, 4); g.fillStyle = '#2E5E9E'; g.fill();
    text(g, `高二（${((k % 9) + 9) % 9 + 1}）班`, px + 495, 184, 22, { k: 'sans', col: '#FFFFFF' });
  }
  g.fillStyle = '#D9CDB8'; g.fillRect(0, 600, W, 220);                            // 走廊地面
  if (o.walkers) { g.save(); o.walkers(g); g.restore(); }
  // 栏杆（前景的矮墙 + 扶手）
  g.fillStyle = '#F4EEE2'; g.fillRect(0, 780, W, 300); g.fillStyle = '#DDD3C2'; g.fillRect(0, 772, W, 20);
  g.fillStyle = 'rgba(0,0,0,.06)'; for (let px = -((x * 1.0) % 240 + 240) % 240; px < W; px += 240) g.fillRect(px, 792, 6, 288);
  if (P.tint) { g.fillStyle = P.tint; g.fillRect(0, 0, W, H); }
}

/* ---------------- 天台 ---------------- */
function rooftop(g, s, o = {}) {
  const tod = o.tod || 'golden', x = o.x || 0;
  summerSky(g, s, { tod, x, sun: o.sun, clouds: o.clouds ?? 4, cy: o.cy ?? 760, cw: o.cw ?? 820, seed: 2 });
  // 远处的小城
  ridge(g, x * .2, 760, 80, tod === 'night' ? '#1E2448' : tod === 'sunset' ? '#9A6A86' : '#8FAFC8', 5, .002, 3);
  townSkyline(g, s, x * .4, 800, tod);
  // 水箱、梯子
  if (o.tank !== false) {
    const tx = (o.tankX ?? 1560) - x * .9;
    g.fillStyle = '#9AA4AE'; g.fillRect(tx - 10, 640, 20, 260); g.fillRect(tx + 190, 640, 20, 260);
    rr(g, tx - 30, 520, 260, 150, 20); g.fillStyle = '#C8D0D6'; g.fill(); g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(tx + 150, 520, 80, 150);
    g.strokeStyle = '#8A949E'; g.lineWidth = 6; for (let i = 0; i < 6; i++) { g.beginPath(); g.moveTo(tx + 60, 680 + i * 36); g.lineTo(tx + 110, 680 + i * 36); g.stroke(); }
  }
  // 地面和女儿墙
  g.fillStyle = vgrad(g, 860, H, [[0, '#B8B2A6'], [1, '#9C968A']]); g.fillRect(0, 860, W, H - 860);
  g.fillStyle = '#D6CEC0'; g.fillRect(0, 800, W, 66); g.fillStyle = '#E6DFD2'; g.fillRect(0, 792, W, 14);
  if (tod === 'sunset' || tod === 'golden') { g.fillStyle = 'rgba(255,170,100,.12)'; g.fillRect(0, 0, W, H); }
}
/* 远处的小城：一片屋顶（灰瓦、白墙），有几户亮灯 */
function townSkyline(g, s, x, y, tod = 'noon') {
  const night = tod === 'night' || tod === 'dusk';
  for (let layer = 0; layer < 2; layer++) {
    const sp = 70 + layer * 40, yy = y + layer * 30, off = (((x * (1 + layer * .4)) % sp) + sp) % sp;
    for (let px = -off - sp; px < W + sp; px += sp) {
      const kk = Math.floor((px + x * (1 + layer * .4)) / sp), h = 40 + hash(kk, layer, 9) * 70 * (1 + layer * .3);
      const col = night ? (layer ? '#2A2E52' : '#363A62') : (layer ? '#E6DED0' : '#D6CEC0');
      g.fillStyle = col; g.fillRect(px, yy - h, sp - 6, h + 40);
      g.fillStyle = night ? '#1E2240' : (hash(kk, 3) < .5 ? '#6E6A6A' : '#A85A44'); g.fillRect(px - 4, yy - h - 10, sp + 2, 12);
      if (night && hash(kk, layer, 5) < .5) { g.fillStyle = '#FFD890'; g.fillRect(px + 12, yy - h + 16, 12, 12); }
    }
  }
}

/* ---------------- 火车车厢（侧面，看着车窗） ----------------
   o.x 窗外风景走到哪（车往右开，风景往左跑）；o.tod；o.flick 树影、电线杆的影子闪过；o.view(g) 窗外画别的（站台） */
function trainInterior(g, s, o = {}) {
  const tod = o.tod || 'present', x = o.x ?? s * 900;
  g.fillStyle = '#EDE6D2'; g.fillRect(0, 0, W, H);
  // 窗外
  const wx = 560, wy = 160, ww = 800, wh = 470;
  g.save(); rr(g, wx, wy, ww, wh, 26); g.clip();
  g.translate(wx, wy); g.scale(ww / W, wh / H * 1.35); g.translate(0, -H * .2);
  if (o.view) o.view(g); else countryside(g, s, x, { tod });
  g.restore();
  // 玻璃上一点反光
  g.save(); rr(g, wx, wy, ww, wh, 26); g.clip(); g.fillStyle = lgrad(g, wx, wy, wx + ww, wy + wh, [[0, 'rgba(255,255,255,.18)'], [.4, 'rgba(255,255,255,0)'], [1, 'rgba(255,255,255,.08)']]); g.fillRect(wx, wy, ww, wh); g.restore();
  // 窗框：下半扇推上去一点（开着窗，风吹进来）
  rr(g, wx, wy, ww, wh, 26); g.strokeStyle = '#B9C0BC'; g.lineWidth = 22; g.stroke();
  g.fillStyle = '#B9C0BC'; g.fillRect(wx, wy + wh * .42, ww, 16);
  // 窗帘
  for (const [cx, sd] of [[wx - 30, -1], [wx + ww + 30, 1]]) {
    const sw = Math.sin(s * 2.1 + sd) * 10 * (o.wind ?? 1);
    g.beginPath(); g.moveTo(cx - 55, wy - 40); g.lineTo(cx + 55, wy - 40); g.quadraticCurveTo(cx + 40 + sw, wy + 200, cx + 30, wy + 300); g.quadraticCurveTo(cx + 50 + sw, wy + 420, cx + 45, wy + wh + 30); g.lineTo(cx - 45, wy + wh + 30); g.quadraticCurveTo(cx - 50 + sw, wy + 420, cx - 30, wy + 300); g.quadraticCurveTo(cx - 40 + sw, wy + 200, cx - 55, wy - 40); g.closePath();
    g.fillStyle = '#D8C25A'; g.fill(); g.fillStyle = '#B8A040'; g.fillRect(cx - 40, wy + 290, 80, 16);
  }
  // 行李架
  g.fillStyle = '#9EA6A2'; g.fillRect(0, 56, W, 14); g.fillRect(0, 100, W, 5);
  for (let i = 0; i < 8; i++) g.fillRect(i * 280, 56, 6, 50);
  // 车厢墙下半截、小桌子
  g.fillStyle = '#6E9E80'; g.fillRect(0, 660, W, 420); g.fillStyle = '#5E8C70'; g.fillRect(0, 656, W, 10);
  rr(g, 640, 640, 640, 34, 8); g.fillStyle = '#EDE6D6'; g.fill(); g.fillStyle = '#C8C0B0'; g.fillRect(640, 668, 640, 8);
  g.fillStyle = '#9AA0A0'; g.fillRect(944, 676, 32, 300);
  rr(g, 700, 560, 44, 84, 10); g.fillStyle = 'rgba(200,230,240,.85)'; g.fill(); g.fillStyle = '#3E7EC0'; g.fillRect(700, 556, 44, 14);   // 一瓶水
  // 座椅靠背：左边一排朝右、右边一排朝左
  for (const sx of [400, 1520]) {
    rr(g, sx - 120, 360, 240, 760, 46); g.fillStyle = '#35558E'; g.fill();
    rr(g, sx - 100, 380, 200, 120, 26); g.fillStyle = '#F2F0E6'; g.fill();
    g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(sx + 60, 500, 40, 600);
  }
  g.fillStyle = '#3E5E96'; g.fillRect(250, 900, 1420, 60);     // 座位的坐垫（前沿）
  // 光：窗外的树影、电线杆一闪一闪
  const fl = o.flick ?? 1;
  if (fl > 0) {
    const ph = (x / 230) % 1, dark = Math.max(0, Math.sin(ph * TAU * 2)) ** 8 * .22 * fl;
    g.fillStyle = `rgba(30,40,30,${dark})`; g.fillRect(0, 0, W, H);
    g.save(); g.globalCompositeOperation = 'screen';
    g.fillStyle = lgrad(g, wx, wy, wx + 300, wy + 900, [[0, 'rgba(255,226,170,.22)'], [1, 'rgba(255,226,170,0)']]); g.beginPath(); g.moveTo(wx, wy); g.lineTo(wx + ww, wy); g.lineTo(wx + ww + 300, H); g.lineTo(wx - 200, H); g.closePath(); g.fill();
    g.restore();
  }
}
/* 窗外的乡下：远山、田、河、树、电线杆（各层速度不一样） */
function countryside(g, s, x, o = {}) {
  const tod = o.tod || 'present';
  summerSky(g, s, { tod, x: x * .02, clouds: 4, cy: 560, cw: 680, sun: o.sun });
  ridge(g, x * .03, 600, 140, tod === 'sunset' ? '#8E7AA6' : '#8EAECB', 2, .0012, 4);
  ridge(g, x * .08, 660, 90, tod === 'sunset' ? '#6E7E8E' : '#6E9E9A', 4, .002, 3);
  treeLine(g, x * .2, 700, 50, tod === 'sunset' ? '#4E6A54' : '#4E8A58', 3, 60);
  paddies(g, x * .5, 700, H, { c1: tod === 'sunset' ? '#B8B060' : '#8CCB62', c2: '#5E9E48' });
  poles(g, x * 1.6, H + 40, 760, 900, { col: '#2E2A28' });
}
/* 她的卧室（七年后，回老家）：墙、床、床头柜（抽屉）、书桌、窗外傍晚的光 */
function herBedroom(g, s, o = {}) {
  g.fillStyle = '#F2E4D6'; g.fillRect(0, 0, W, H);
  // 窗
  rr(g, 1180, 140, 520, 460, 6); g.fillStyle = '#FFFFFF'; g.fill();
  g.fillStyle = vgrad(g, 156, 584, SKYS.sunset); g.fillRect(1196, 156, 488, 428);
  townSkyline(g, s, 0, 620, 'sunset');
  g.fillStyle = '#F2E4D6'; g.fillRect(1180, 600, 520, 480); g.fillRect(1700, 0, 220, H);
  g.strokeStyle = '#FFFFFF'; g.lineWidth = 10; g.beginPath(); g.moveTo(1440, 150); g.lineTo(1440, 590); g.stroke();
  g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = lgrad(g, 1400, 300, 700, 1000, [[0, 'rgba(255,190,120,.4)'], [1, 'rgba(255,190,120,0)']]); g.beginPath(); g.moveTo(1196, 156); g.lineTo(1684, 156); g.lineTo(1100, 1080); g.lineTo(300, 1080); g.closePath(); g.fill(); g.restore();
  // 墙上的海报、奖状
  rr(g, 220, 160, 220, 300, 4); g.fillStyle = '#E8B8A0'; g.fill(); text(g, '三好学生', 330, 300, 34, { k: 'serifX', col: '#B83A2E' });
  rr(g, 480, 200, 260, 180, 4); g.fillStyle = '#9DB8D8'; g.fill();
  // 床
  rr(g, 120, 640, 760, 300, 20); g.fillStyle = '#F6EFE6'; g.fill();
  rr(g, 100, 560, 60, 420, 10); g.fillStyle = '#B88A62'; g.fill();
  rr(g, 160, 600, 220, 90, 30); g.fillStyle = '#FFFFFF'; g.fill();
  rr(g, 300, 650, 580, 160, 30); g.fillStyle = '#F2B8B8'; g.fill();
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(255,255,255,.4)'; g.fillRect(320 + i * 90, 650, 30, 160); }
  // 床头柜
  rr(g, 900, 700, 240, 280, 8); g.fillStyle = '#C99A6A'; g.fill();
  g.fillStyle = '#B08254'; g.fillRect(920, 740, 200, 90); g.fillStyle = '#E8D2A8'; circ(g, 1020, 785, 9); g.fill();
  if (o.drawer) { g.fillStyle = '#A07448'; g.fillRect(920, 740 + o.drawer * 60, 200, 90); g.fillStyle = '#FFF6E8'; g.fillRect(940, 740 + o.drawer * 60, 160, 20); }
  // 台灯
  g.fillStyle = '#8E8070'; g.fillRect(1010, 600, 10, 100); g.beginPath(); g.moveTo(960, 610); g.lineTo(1070, 610); g.lineTo(1040, 540); g.lineTo(990, 540); g.closePath(); g.fillStyle = '#F6E8C8'; g.fill();
  g.fillStyle = vgrad(g, 980, H, [[0, '#C8AE8E'], [1, '#B09474']]); g.fillRect(0, 980, W, H - 980);
}
