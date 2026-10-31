'use strict';
/* sets2.js —— 第二批布景：小站、出站口、小城、老街、校门、教学楼、操场。 */

/* 红底黄字的横幅（像素字），中间往下坠一点 */
function banner(x, y, w, txt, o = {}) {
  const h = o.h ?? 14, sag = o.sag ?? 2, K = C(0x3a1418), red = C(o.col ?? 0xd83a32), redS = C(0xa82a28);
  for (let i = 0; i <= w; i++) { const u = i / w, yy = y + Math.sin(u * Math.PI) * sag + Math.sin(i * .2 + (o.t || 0) * 3) * (o.wave ?? 0); rect(x + i, yy - 1, 1, h + 2, K); rect(x + i, yy, 1, h, (i % 11 === 0) ? redS : red); }
  text(txt, x + w / 2, y + sag * .8 + (h - 12) / 2, { size: h >= 14 ? 12 : 8, col: C(o.tc ?? 0xffe070), sp: o.sp ?? 2 });
}
/* 老式路灯：铁杆、弯头、灯罩；lit 亮着 */
function lampPost(x, y, h, o = {}) {
  const K = C(0x1e1a24), c = C(o.col ?? 0x3a4a5a);
  rect(x - 1, y - h, 3, h, K); rect(x, y - h, 1, h, c); rect(x - 3, y - 4, 7, 4, K);
  line(x, y - h, x + 6, y - h - 4, K); line(x + 6, y - h - 4, x + 12, y - h, K);
  rect(x + 9, y - h, 7, 3, K); rect(x + 10, y - h + 2, 5, 2, C(o.lit ? 0xfff0b0 : 0xd8d0b8));
  if (o.lit) { glowDisc(x + 12, y - h + 3, 18, C(0xffd890), .5, 5); poly([[x + 10, y - h + 4], [x + 15, y - h + 4], [x + 30, y], [x - 5, y]], C(0xffe0a0), .1 * o.lit, 's'); }
}
/* 站牌：两根柱子，白底蓝边，上面一行中文、下面拼音 */
function stationSign(x, y, name, py, o = {}) {
  const K = C(0x1e1a24);
  rect(x - 26, y - 4, 2, 30, C(0x6a6a72)); rect(x + 24, y - 4, 2, 30, C(0x6a6a72));
  rect(x - 32, y - 18, 64, 24, K); rect(x - 31, y - 17, 62, 22, C(0xf4f4f0)); rect(x - 31, y - 17, 62, 3, C(0x2c5aa8)); rect(x - 31, y + 3, 62, 2, C(0x2c5aa8));
  text(name, x, y - 13, { col: C(0x1c2a48), sp: 4 }); text(py, x, y - 1, { size: 8, col: C(0x4a5a78), sp: 1 });
}
/* 小站：站台、黄色安全线、铁轨、雨棚、站牌 */
function station(t, o = {}) {
  const cx = o.x || 0, tod = o.tod || 'morning';
  sky(t, SKY[tod]);
  cloudDrift(t, [[80, 60, 110, 81], [300, 40, 80, 82], [420, 76, 90, 83]], tod === 'dusk' ? CLOUD_PAL.dusk : CLOUD_PAL.morning, 1.5);
  ridge(t, 120, 30, 0x9ab8d4, 84, .01, cx * .1, { edge: 0xc8dcf0 });
  treeline(t, 132, 7, 0x6a9e6a, 85, cx * .3, 7);
  village(t, 40 - cx * .3, 134, 10, 86, { lit: tod === 'night' ? .4 : 0 });
  // 铁轨（在站台后面）
  rect(0, 134, W, 14, C(0x7a7068)); for (let x = mod(-cx, 8); x < W; x += 8) rect(x, 140, 5, 6, C(0x5a4a3e));
  rect(0, 139, W, 1, C(0xb8b8c0)); rect(0, 145, W, 1, C(0xb8b8c0));
  if (o.train) o.train();
  // 站台
  rect(0, 148, W, 6, C(0xd8d0c0)); rect(0, 150, W, 2, C(0xf0c838));
  vgrad(0, 154, W, H - 154, [[0, 0xc8c0b0], [1, 0xb0a898]], 6);
  for (let i = 0; i < 12; i++) { const x = mod(i * 60 - cx * 1.2, W + 60) - 30; line(x, 154, x - 50, H, C(0xa8a090), .7); }
  // 雨棚：柱子和顶
  for (let i = 0; i < 6; i++) { const x = mod(i * 110 - cx * 1.2, W + 110) - 40; rect(x, 40, 4, 114, C(0x4a5a6a)); rect(x + 1, 40, 1, 114, C(0x7a8a9a)); }
  rect(0, 30, W, 10, C(0x3a4a5a)); rect(0, 38, W, 2, C(0x2a3440)); for (let x = mod(-cx * 1.2, 16); x < W; x += 16) rect(x, 30, 1, 8, C(0x4e6070));
  vgrad(0, 40, W, 6, [[0, 0x2a3440], [1, 0x2a3440]], 0, .25);
}
/* 出站口：里面暗，门外白亮一片 */
function exitHall(t, o = {}) {
  const door = o.door || [300, 40, 120, 186];
  rect(0, 0, W, H, C(0x2a2632)); vgrad(0, 0, W, 60, [[0, 0x1e1a24], [1, 0x2a2632]], 4);
  rect(0, 186, W, H - 186, C(0x3a3440));
  // 门外：亮得发白，外面隐约是街、树
  const [dx, dy, dw, dh] = door;
  withT(layer('door', dw, dh), () => { sky(t, [[0, 0xfff8e8], [1, 0xffffff]]); rect(0, dh - 50, dw, 50, C(0xf4ecd8)); for (let i = 0; i < 4; i++) rect(i * 34 + 6, dh - 90, 22, 60, C(0xf0e4cc)); });
  blit(_pool['door' + dw + 'x' + dh], dx, dy);
  rect(dx - 4, dy - 4, 4, dh + 4, C(0x1a1620)); rect(dx + dw, dy - 4, 4, dh + 4, C(0x1a1620)); rect(dx - 4, dy - 4, dw + 8, 4, C(0x1a1620));
  // 门里投出来的光：地上一大块梯形，墙上一圈光晕
  poly([[dx, dy + dh], [dx + dw, dy + dh], [dx + dw - 120, H], [dx - 200, H]], C(0xfff4dc), .35, 's');
  glowDisc(dx + dw / 2, dy + dh / 2, 170, C(0xfff4dc), .5, 7);
  // 墙上的告示牌、一排座椅剪影、检票口
  for (let i = 0; i < 3; i++) { rect(40 + i * 70, 80, 50, 34, C(0x3a3644)); rect(42 + i * 70, 82, 46, 30, C(0x4a4658)); }
  text('出站口', dx + dw / 2, dy - 18, { col: C(0x6ad890), sp: 2 });
  for (let i = 0; i < 6; i++) { const x = 30 + i * 36; rect(x, 196, 28, 10, C(0x24202c)); rect(x, 188, 3, 10, C(0x24202c)); }
  for (let i = 0; i < 3; i++) { const x = dx - 90 + i * 26; rect(x, 168, 6, 30, C(0x4a4a56)); rect(x, 168, 6, 2, C(0x6a6a7a)); pset(x + 2, 172, C(0x6ad890)); }
  motes(t, 60, [dx - 140, dy, dx + dw + 40, H], 0xfff4dc, .8, 31, 2);
}
/* 灰瓦屋顶：一排排瓦楞（远景的小城）。x0, y 屋檐，w 宽，h 屋顶高 */
function tileRoof(x0, y, w, h, o = {}) {
  const c0 = C(o.c0 ?? 0x5a5c6c), c1 = C(o.c1 ?? 0x6e7282), ridgeC = C(o.ridge ?? 0x3a3c4a);
  poly([[x0, y], [x0 + w, y], [x0 + w - h * .6, y - h], [x0 + h * .6, y - h]], c0);
  for (let xx = Math.ceil(x0); xx < x0 + w; xx += 2) line(xx, y - 1, xx + (xx - (x0 + w / 2)) * .08, y - h + 1, c1, .7);
  hspan(Math.round(y - h), Math.round(x0 + h * .6) - 1, Math.round(x0 + w - h * .6), ridgeC); hspan(Math.round(y - h - 1), Math.round(x0 + h * .6), Math.round(x0 + w - h * .6) - 1, ridgeC);
  pset(x0 + h * .6 - 2, y - h - 2, ridgeC); pset(x0 + w - h * .6 + 1, y - h - 2, ridgeC);
  hspan(Math.round(y), Math.round(x0), Math.round(x0 + w), C(0x2a2a34));
}
/* 俯瞰的小城：远山、河、一层层灰瓦白墙、电线、燕子 */
function townWide(t, o = {}) {
  const tod = o.tod || 'noon', cx = o.x || 0;
  sky(t, SKY[tod]); sun(t, 90, 40, 8);
  cloudDrift(t, [[60, 50, 140, 91], [260, 30, 100, 92], [420, 60, 120, 93]], CLOUD_PAL[tod] || CLOUD_PAL.noon, 2);
  ridge(t, 104, 40, 0x94b4d8, 94, .008, cx * .05, { edge: 0xc8dcf2 });
  ridge(t, 118, 22, 0x7ea69a, 95, .016, cx * .1, { edge: 0xa8c8b8 });
  river(t, 122, 134, SKY.noon, { sparkle: 20 });
  // 一层层房子：越往下越近、越大
  for (let row = 0; row < 6; row++) {
    const y = 136 + row * row * 3.2 + row * 12, k = 1 + row * .45, n = Math.ceil(W / (26 * k)) + 2;
    for (let i = -1; i < n; i++) {
      const id = i + row * 50, w = (22 + hash(id, 96) * 16) * k, x = i * 26 * k + (row % 2) * 12 - mod(cx * (.2 + row * .15), 26 * k) + hash(id, 97) * 6;
      const wallH = (6 + hash(id, 98) * 5) * k, rh = (5 + hash(id, 99) * 3) * k;
      rect(x, y - wallH, w, wallH + 30, C(hash(id, 100) < .8 ? 0xf2ece0 : 0xe8d8c0)); rect(x + w - 2 * k, y - wallH, 2 * k, wallH + 30, C(0xcac0ae));
      for (let j = 0; j < Math.floor(w / (7 * k)); j++) if (hash(id, j, 101) < .6) rect(x + 3 * k + j * 7 * k, y - wallH + 2 * k, 2 * k, 2 * k, C(0x5a6070));
      tileRoof(x - 2 * k, y - wallH, w + 4 * k, rh);
      if (hash(id, 102) < .2) { rect(x + w * .3, y - wallH - rh - 6 * k, 3 * k, 6 * k, C(0xe8e0d0)); }        // 屋顶上的小烟囱 / 水箱
      if (hash(id, 103) < .25) for (let j = 0; j < 4; j++) pset(x + w * .5 + j * 2 * k, y - wallH - 1, C(pick([0xe85a5a, 0x5a8ae8, 0xf8f0e0, 0xf0c040], j + id)));   // 晾的衣服
    }
  }
  // 电线横穿画面
  wire(-20, 150, W + 20, 140, 18, t, 0x2a2430, .8); wire(-20, 158, W + 20, 152, 20, t, 0x2a2430, .7);
  birds(t, 6, 100 + (t * 20) % 300, 70, 16, 7, 0x2a2a3a);
}
/* 老街：一排小店（招牌、雨棚、门帘），电线，晾的衣服，盆栽；行人在前面走 */
const SHOPS = [['小卖部', 0xd8483a], ['理发', 0x3a7ad8], ['书店', 0x2a8a5a], ['修车', 0xd8a030], ['冷饮', 0x4ab8c8], ['照相馆', 0x8a5ab8], ['面馆', 0xd86a3a]];
function oldStreet(t, o = {}) {
  const cx = o.x || 0, tod = o.tod || 'noon', night = tod === 'night', wind = o.wind ?? .3;
  sky(t, SKY[tod]); if (night) { stars(t, 60, [0, 0, W, 70]); moon(t, 400, 30, 9); } else sun(t, 420, 22, 7);
  cloudDrift(t, [[100, 30, 90, 111], [320, 20, 70, 112]], night ? CLOUD_PAL.night : CLOUD_PAL.noon, 2);
  // 店铺：两层小楼
  const sw = 92;
  for (let i = -1; i < 7; i++) {
    const id = Math.floor((i * sw + cx) / sw), x = Math.round(i * sw - mod(cx, sw)), [name, col] = pick(SHOPS, id);
    const h2 = 64 + hash(id, 113) * 18, wallC = night ? 0x6a6478 : pick([0xf0e8d8, 0xe8dcc4, 0xf4f0e6, 0xe0d4c0], id);
    rect(x, 200 - 70 - h2, sw - 2, 72 + h2, C(wallC)); rect(x + sw - 6, 200 - 70 - h2, 4, 72 + h2, darker(C(wallC), .15));
    tileRoof(x - 4, 200 - 70 - h2, sw + 4, 8);
    // 二楼的窗、阳台、晾衣服
    for (let j = 0; j < 2; j++) { const wx = x + 12 + j * 40, wy = 200 - 60 - h2 + 12; rect(wx, wy, 26, 20, C(night ? (hash(id, j) < .6 ? 0xffd890 : 0x3a3a4a) : 0x6a7a8a)); rect(wx, wy + 9, 26, 1, C(0xe8e8e8)); rect(wx + 12, wy, 1, 20, C(0xe8e8e8)); if (night && hash(id, j) < .6) glowDisc(wx + 13, wy + 10, 24, C(0xffc870), .3, 4); }
    if (hash(id, 114) < .6) { line(x + 6, 200 - 70 - h2 + 40, x + sw - 10, 200 - 70 - h2 + 42, C(0x5a5a5a)); for (let j = 0; j < 4; j++) { const lx = x + 12 + j * 18, sw2 = Math.sin(t * 2 + j + id) * wind * 3; poly([[lx, 200 - 70 - h2 + 41], [lx + 10, 200 - 70 - h2 + 41], [lx + 10 + sw2, 200 - 70 - h2 + 52], [lx + sw2, 200 - 70 - h2 + 52]], C(pick([0xe86a6a, 0x6a9ae8, 0xf8f4e8, 0xf0c050, 0x8ad88a], j + id))); } }
    // 一楼店面：卷帘门开着，里面暗；雨棚；招牌
    rect(x + 6, 150, sw - 16, 50, C(night ? 0xffd890 : 0x3a3440)); if (night) glowDisc(x + sw / 2, 175, 50, C(0xffb860), .4, 5);
    for (let k = 0; k < 4; k++) rect(x + 10 + k * 18, 160, 12, 30, C(night ? 0xf0b870 : 0x4a4452));        // 里面的货架
    const aw = Math.sin(t * 2.4 + id) * wind * 2;
    poly([[x + 2, 140], [x + sw - 6, 140], [x + sw - 2 + aw, 152], [x - 2 + aw, 152]], C(col)); for (let k = 0; k < 9; k++) line(x + 4 + k * 10, 140, x + 2 + k * 10 + aw, 152, C(0xffffff), .6);
    rect(x + 8, 126, sw - 20, 12, C(0x2a2430)); rect(x + 9, 127, sw - 22, 10, C(night ? 0x4a4458 : 0xf4ecd0)); text(name, x + sw / 2 - 3, 126, { size: 8, col: C(col), sp: 2 });
    if (night) glowDisc(x + sw / 2, 132, 26, C(col), .35, 4);
  }
  // 电线、电线杆
  for (let i = 0; i < 3; i++) { const px = Math.round(mod(i * 200 - cx * 1.1, W + 200) - 60); pole(px, 206, 120, { w: 2 }); }
  wire(-20, 92, W + 20, 96, 14, t); wire(-20, 98, W + 20, 104, 16, t);
  // 路面
  vgrad(0, 200, W, H - 200, [[0, night ? 0x3a3646 : 0xc8bca8], [1, night ? 0x2a2634 : 0xb0a490]], 6);
  for (let i = 0; i < 20; i++) { const x = mod(i * 37 - cx * 1.3, W + 40) - 20; hspan(206 + (i % 5) * 12, x, x + 14, C(night ? 0x46405a : 0xbcb09c)); }
  rect(0, 200, W, 2, C(night ? 0x24202c : 0x9a8e7c));
}
/* 校门：两根门柱、门楣上"清溪中学"、伸缩门；横幅 */
function schoolGate(t, o = {}) {
  const x = o.gx ?? 240, y = o.gy ?? 196, K = C(0x2a2430);
  rect(x - 110, y - 90, 26, 90, K); rect(x - 109, y - 89, 24, 89, C(0xe8e0d0)); rect(x + 84, y - 90, 26, 90, K); rect(x + 85, y - 89, 24, 89, C(0xe8e0d0));
  rect(x - 116, y - 104, 232, 18, K); rect(x - 115, y - 103, 230, 16, C(0xb83a32)); text('清溪中学', x, y - 102, { col: C(0xffe070), sp: 6 });
  for (let i = 0; i < 12; i++) { const gx2 = x - 84 + i * 6; if (o.open !== false && i > 3) continue; line(gx2, y - 26, gx2 + 6, y - 2, C(0x8a8a96)); line(gx2 + 6, y - 26, gx2, y - 2, C(0x8a8a96)); }
  if (o.banner) banner(x - 80, y - 80, 160, o.banner, { t, wave: .5 });
}
/* 教学楼：一层层走廊、窗户；o.floors 层数，w 宽，o.lit 亮窗比例（夜里） */
function teachBuilding(t, x, y, w, floors = 4, o = {}) {
  const fh = o.fh ?? 26, K = C(0x2a2430), wall = C(o.wall ?? 0xf0ece4), rail = C(o.rail ?? 0xe0dcd4), win = C(o.night ? 0x2a3046 : 0x7aaad8), winL = C(0xffe0a0);
  rect(x, y - floors * fh - 6, w, floors * fh + 6, wall); rect(x, y - floors * fh - 6, w, 3, C(0xd8d4cc));
  for (let f = 0; f < floors; f++) {
    const fy = y - (f + 1) * fh;
    for (let wx = x + 6; wx < x + w - 16; wx += 18) { const lit = o.night && hash(wx, f, 7) < (o.lit ?? .5); rect(wx, fy + 5, 12, 12, lit ? winL : win); rect(wx, fy + 5, 12, 1, C(0xffffff)); if (!o.night && hash(wx, f, 8) < .3) rect(wx + 1, fy + 6, 4, 10, C(0xd8eaf8)); if (lit) glowDisc(wx + 6, fy + 11, 12, C(0xffd080), .3, 3); }
    rect(x, fy + fh - 6, w, 3, rail); rect(x, fy + fh - 3, w, 1, C(0xb8b4ac));
  }
  if (o.sign) { rect(x + w / 2 - 30, y - floors * fh - 18, 60, 12, C(0xb83a32)); text(o.sign, x + w / 2, y - floors * fh - 18, { size: 8, col: C(0xffe070), sp: 2 }); }
}
/* 旗杆和红旗：旗子按风飘 */
function flag(t, x, y, h, wind = 1) {
  rect(x, y - h, 2, h, C(0xd8d8e0)); pset(x, y - h - 1, C(0xf0c040));
  for (let i = 0; i < 18; i++) for (let j = 0; j < 12; j++) { const wv = Math.sin(t * 5 * wind - i * .5) * i * .12; pset(x + 2 + i, y - h + 1 + j + wv, C(i < 6 && j < 5 && (i + j) % 3 === 0 ? 0xf8d030 : 0xd83028)); }
}
/* 操场：红色跑道（几条白线）、绿色草坪 */
function trackField(t, y0, o = {}) {
  const cx = o.x || 0;
  rect(0, y0, W, H - y0, C(o.grass ?? 0x6aae4a));
  const ty = y0 + (o.trackY ?? 10), th = o.trackH ?? 60;
  vgrad(0, ty, W, th, [[0, 0xc8584a], [1, 0xd8644e]], 4);
  for (let k = 0; k <= 5; k++) hspan(Math.round(ty + k * th / 5 + k * k * .4), 0, W, C(0xf4ece4));
  if (o.finish) { const fx = Math.round(o.finish - cx); for (let yy = ty; yy < ty + th; yy++) pset(fx, yy, C(0xffffff)); }
  for (let i = 0; i < 30; i++) { const x = mod(i * 31 - cx, W), y = ty + th + 4 + hash(i, 121) * (H - ty - th); pset(x, y, C(0x8acb5e)); pset(x + 1, y, C(0x5a9e3e)); }
}
/* 看台上的人群：一排排小人（只画上半身：头和肩），按节拍挥手 */
function crowd(t, y, rows, o = {}) {
  for (let r = 0; r < rows; r++) for (let i = 0; i < 40; i++) {
    const x = i * 13 + (r % 2) * 6 - mod((o.x || 0) * .6, 13) + hash(i, r, 131) * 3, yy = y + r * 14, id = i + r * 40 + 500;
    const lk = kid(id), cheer = o.cheer ? Math.sin(t * 8 + i * 1.3 + r) > .3 : false;
    rect(x - 4, yy, 9, 8, C(0xf6f8fc)); rect(x - 4, yy, 9, 2, C(0x3266c4));
    disc(x, yy - 3, 3.4, C(lk.skin || PAL.skin)); disc(x, yy - 4.5, 3.4, C(lk.hc[0])); rect(x - 3, yy - 3, 7, 2, C(lk.skin || PAL.skin));
    if (cheer) { line(x - 4, yy, x - 6, yy - 7, C(lk.skin || PAL.skin)); line(x + 4, yy, x + 6, yy - 7, C(lk.skin || PAL.skin)); }
  }
}
/* 走廊（侧面）：后面是教室的墙和窗、门；前面是栏杆（看得到对面楼和天）；地上一格格窗光 */
function corridor(t, o = {}) {
  const cx = o.x || 0, K = C(0x2a2430);
  sky(t, SKY[o.tod || 'noon'], { h: 120 });
  rect(0, 0, W, 196, C(0xeee8dc));
  // 教室的窗户（高窗）和门
  const pitch = 96;
  for (let i = -1; i < 7; i++) {
    const x = Math.round(i * pitch - mod(cx, pitch)), id = Math.floor((i * pitch + cx) / pitch);
    if (id % 3 === 0) { rect(x + 20, 96, 34, 100, K); rect(x + 21, 97, 32, 99, C(0xc89a62)); rect(x + 26, 104, 22, 30, C(0x9ac8e8)); pset(x + 48, 150, C(0xf0c040)); rect(x + 18, 84, 38, 10, C(0x3266c4)); text('高二（' + (2 + mod(id, 4)) + '）', x + 37, 84, { size: 8, col: C(0xffffff) }); }
    else { rect(x + 8, 60, 70, 60, K); rect(x + 9, 61, 68, 58, C(0xa8d0ec)); rect(x + 9, 61, 68, 58, C(0xffffff), .25); for (let k = 1; k < 3; k++) rect(x + 9 + k * 23, 61, 1, 58, C(0xe8e8e8)); rect(x + 9, 89, 68, 1, C(0xe8e8e8)); if (o.faces) o.faces(x + 9, 61, id); }
  }
  rect(0, 150, W, 46, C(0x7cb898)); rect(0, 150, W, 2, C(0x5e9a7c));
  // 地面：一格格窗光
  vgrad(0, 196, W, H - 196, [[0, 0xd0c8b8], [1, 0xc0b8a6]], 5);
  for (let i = -1; i < 7; i++) { const x = Math.round(i * pitch - mod(cx * 1.3, pitch)); poly([[x + 10, 196], [x + 70, 196], [x + 40, H], [x - 20, H]], C(0xfff2c8), .35, 's'); }
  // 栏杆（在最前面，下半截）
  if (o.rail !== false) { rect(0, 236, W, 4, C(0xd8d2c8)); for (let x = mod(-cx * 1.4, 14); x < W; x += 14) rect(x, 240, 3, 30, C(0xc8c2b8)); rect(0, 236, W, 1, C(0xf0ece4)); }
}

/* ---------------- 教室（从后面往黑板看） ----------------
   后墙是黑板、标语、钟、倒计时牌、讲台；左边墙上一排窗户进光；前面一排排课桌和学生的背影。
   o.board 黑板上写什么（函数），o.count 倒计时数字，o.students(row, i) 返回这个座位的人（null 空着），o.tod */
function classFront(t, o = {}) {
  const tod = o.tod || 'day', P_ = ROOM[tod] || ROOM.day, K = C(0x2a2430);
  rect(0, 0, W, H, C(P_.wallT)); vgrad(0, 0, W, 24, [[0, 0xd8d0c0], [1, P_.wallT]], 4);
  rect(0, 122, W, 40, C(P_.wallB)); rect(0, 122, W, 2, C(P_.wallBS));
  vgrad(0, 160, W, H - 160, [[0, P_.floorS], [1, P_.floor]], 6);
  // 左墙的窗：斜着的透视，光从左边打进来
  for (let i = 0; i < 2; i++) { const x = 4 + i * 30, y = 30 + i * 4; poly([[x, y], [x + 22, y + 6], [x + 22, y + 92], [x, y + 102]], C(0xbfe0f4)); poly([[x, y], [x + 22, y + 6], [x + 22, y + 92], [x, y + 102]], C(0xffffff), .3, 's'); line(x + 11, y + 3, x + 11, y + 97, C(0xe8e8e8)); }
  for (let k = 0; k < 3; k++) poly([[30 + k * 40, 40], [56 + k * 40, 44], [300 + k * 60, H], [250 + k * 60, H]], C(P_.light), .1 + .03 * Math.sin(t + k), 's');
  // 黑板
  const bx = 120, by = 34, bw = 240, bh = 74;
  rect(bx - 4, by - 4, bw + 8, bh + 8, C(0x8a6a4a)); rect(bx, by, bw, bh, C(0x2e5a46));
  for (let i = 0; i < 40; i++) pset(bx + hash(i, 201) * bw, by + hash(i, 202) * bh, C(0x3a6a54));
  rect(bx, by + bh + 4, bw, 3, C(0x9a7a5a));
  if (o.board) withT(T, () => o.board(bx, by, bw, bh));
  // 钟
  const ck = o.clockT ?? (t * .02); disc(240, 18, 9, K); disc(240, 18, 8, C(0xf4f4f0)); line(240, 18, 240 + Math.sin(ck * TAU) * 6, 18 - Math.cos(ck * TAU) * 6, K); line(240, 18, 240 + Math.sin(ck * TAU / 12) * 4, 18 - Math.cos(ck * TAU / 12) * 4, K);
  // 标语、倒计时牌
  text('勤奋', 86, 40, { col: C(0xc83a32), sp: 1 }); text('求实', 86, 56, { col: C(0xc83a32), sp: 1 });
  if (o.count !== undefined) { rect(384, 34, 52, 64, K); rect(385, 35, 50, 62, C(0xf8f4ec)); text('距离高考', 410, 38, { size: 8, col: C(0x3a3448) }); text(String(o.count), 410, 52, { scale: o.count >= 100 ? 2 : 3, col: C(0xd83a32), sp: 1 }); text('天', 410, 84, { size: 8, col: C(0x3a3448) }); }
  else { text('团结', 410, 40, { col: C(0xc83a32), sp: 1 }); text('进取', 410, 56, { col: C(0xc83a32), sp: 1 }); }
  // 讲台
  rect(200, 120, 80, 30, K); rect(201, 121, 78, 28, C(0xc8925a)); rect(201, 121, 78, 4, C(0xe0aa70));
  if (o.teacher) o.teacher(240, 150);
  // 课桌和学生：三排，越往前越大
  const rows = [[150, .8], [180, .9], [214, 1]];
  rows.forEach(([y, k], r) => {
    for (let i = 0; i < 6; i++) {
      const x = 46 + i * 78 + (r % 2) * 10 - (1 - k) * 40;
      rect(x - 14, y - 4, 30, 5, C(0xc89a62)); rect(x - 14, y - 4, 30, 1, C(0xe0b47a)); rect(x - 13, y + 1, 2, 10, C(0x7a7e86)); rect(x + 13, y + 1, 2, 10, C(0x7a7e86));
      for (let b = 0; b < 3; b++) rect(x - 12 + b * 9, y - 7 - (b % 2) * 2, 7, 3 + (b % 2) * 2, C(pick([0xe8dcc0, 0x6a9ad8, 0xe89a7a, 0xf4f0e6], i + b + r)));
      const p = o.students ? o.students(r, i, x, y) : null;
      if (p) { const st = person({ look: p.look, x, y: y + 22, view: 'back', t, arms: p.arms, expr: p.expr, alpha: p.alpha, shadow: false, tint: p.tint, wind: 0 }); if (p.after) p.after(st, x, y); }
      rect(x - 7, y + 12, 16, 3, C(0xc89a62)); rect(x - 6, y + 15, 2, 8, C(0x7a7e86)); rect(x + 7, y + 15, 2, 8, C(0x7a7e86));   // 椅子
    }
  });
  motes(t, 40, [0, 20, W, 200], P_.light, .6, 47);
}
/* 粉笔头：一小截白，转着飞，后面拖一道 */
function chalk(x, y, t, a = 1) { const ang = t * 12, c = C(0xffffff); for (let i = -1; i <= 1; i++) pset(x + Math.cos(ang) * i, y + Math.sin(ang) * i, c, a); for (let k = 1; k < 8; k++) dot(x - k * 2, y - k * .4, C(0xffffff), a * .4 * (1 - k / 8), 's'); }
/* 世界地图（像素）：几块大陆 */
function worldMap(x, y, w, h, t, o = {}) {
  rect(x - 2, y - 2, w + 4, h + 4, C(0x8a6a4a)); rect(x, y, w, h, C(0x7ab8e0));
  const land = [[.12, .3, .16, .2], [.2, .62, .07, .18], [.47, .28, .1, .14], [.5, .55, .09, .2], [.7, .32, .2, .2], [.85, .7, .07, .08]];
  land.forEach(([u, v, rw, rh], i) => { for (let k = 0; k < 6; k++) ellipse(x + (u + (hash(i, k) - .5) * rw) * w, y + (v + (hash(i, k, 1) - .5) * rh) * h, rw * w * .45, rh * h * .45, C(pick([0x9ad07a, 0xe8d088, 0xb8d870], i + k))); });
  pset(x + .76 * w, y + .4 * h, C(0xe83a3a));                  // 这里
  if (o.route) { const pts = [[.76, .4], [.6, .2], [.42, .26], [.25, .2], [.16, .32]], u = o.route; for (let i = 0; i < 60 * u; i++) { const f = i / 60, j = Math.min(3, Math.floor(f * 4)), q = f * 4 - j, a = pts[j], b = pts[j + 1]; if (i % 3 === 0) pset(x + lerp(a[0], b[0], q) * w, y + lerp(a[1], b[1], q) * h - Math.sin(q * Math.PI) * 6, C(0xffffff)); } const f = Math.min(.999, u), j = Math.floor(f * 4), q = f * 4 - j, a = pts[j], b = pts[j + 1]; paperPlane(x + lerp(a[0], b[0], q) * w, y + lerp(a[1], b[1], q) * h - Math.sin(q * Math.PI) * 6, 4, Math.PI + Math.atan2(b[1] - a[1], -(b[0] - a[0])) * -1); }
}
/* 楼梯（侧面）：一级级台阶往右上走，扶手，平台上一扇窗进光 */
function stairs(t, o = {}) {
  const K = C(0x2a2430), wall = C(o.wall ?? 0xe4ddd0), step = C(0xc8c0b2), stepT = C(0xe0d8ca);
  rect(0, 0, W, H, wall); rect(0, 0, W, 30, C(0xd0c8ba));
  // 窗（右上平台）
  rect(330, 30, 90, 70, K); rect(332, 32, 86, 66, C(0xd8eef8)); rect(332, 32, 86, 66, C(0xffffff), .3); rect(374, 32, 2, 66, C(0xe8e8e8));
  for (let kk = 0; kk < 3; kk++) poly([[335 + kk * 28, 98], [355 + kk * 28, 98], [250 + kk * 40, H], [210 + kk * 40, H]], C(0xfff2d0), .16 + .04 * Math.sin(t + kk), 's');
  // 台阶
  for (let i = 0; i < 16; i++) { const x = 20 + i * 20, y = 250 - i * 12; rect(x, y, 22, 12, step); rect(x, y, 22, 2, stepT); rect(x, y + 12, 22, H - y, darker(step, .1)); }
  // 扶手
  line(10, 200, 340, 8, C(0x6a4a3a)); line(10, 201, 340, 9, C(0x8a6a50)); for (let i = 0; i < 12; i++) { const x = 30 + i * 26; line(x, 248 - i * 15.6, x, 210 - i * 15.6, C(0x7a7e86)); }
  motes(t, 60, [180, 20, W, H], 0xfff4d8, .8, 61, 2);
}
/* 一摞摞的课桌椅（七年后，靠墙摞着） */
function stackedDesks(x, y, n = 3) { for (let i = 0; i < n; i++) { desk(x, y - i * 20, { books: 0 }); } }
/* 墙上的钟（大特写）：h 小时（0~12），可以倒着转 */
function bigClock(cx, cy, r, hours, o = {}) {
  const K = C(0x2a2430);
  disc(cx, cy, r + 4, K); disc(cx, cy, r + 3, C(o.rim ?? 0xd8dce4)); disc(cx, cy, r, C(0xf8f6f0)); disc(cx + r * .1, cy + r * .1, r * .9, C(0xeceae2), .5);
  for (let i = 0; i < 12; i++) { const a = i / 12 * TAU; const x1 = cx + Math.sin(a) * r * .86, y1 = cy - Math.cos(a) * r * .86, x2 = cx + Math.sin(a) * r * (i % 3 === 0 ? .7 : .78), y2 = cy - Math.cos(a) * r * (i % 3 === 0 ? .7 : .78); capsule(x1, y1, x2, y2, i % 3 === 0 ? 3 : 1.6, K); }
  const ha = hours / 12 * TAU, ma = (hours % 1) * TAU;
  capsule(cx, cy, cx + Math.sin(ha) * r * .5, cy - Math.cos(ha) * r * .5, 4, K);
  capsule(cx, cy, cx + Math.sin(ma) * r * .78, cy - Math.cos(ma) * r * .78, 2.6, K);
  if (o.sec !== undefined) line(cx, cy, cx + Math.sin(o.sec * TAU) * r * .84, cy - Math.cos(o.sec * TAU) * r * .84, C(0xd83a32));
  disc(cx, cy, 3, C(0xd83a32));
  ellipse(cx - r * .35, cy - r * .45, r * .3, r * .12, C(0xffffff), .35, 's');
}
/* 河边的路（黄昏）：柳树、河、远处的桥和小城 */
function riverPath(t, o = {}) {
  const cx = o.x || 0, tod = o.tod || 'sunset';
  sky(t, SKY[tod]); sun(t, 380, 150, 14, 0xfff0c0, 0xffa060, 1.1);
  cloudDrift(t, [[60, 60, 120, 281], [240, 40, 90, 282], [420, 80, 100, 283]], CLOUD_PAL[tod] || CLOUD_PAL.sunset, 1.5);
  ridge(t, 160, 20, 0x8a6a9a, 284, .012, cx * .05, { edge: 0xe8a0a0 });
  skyline(t, 168, 0x7a5a88, 285, cx * .1, { lit: .15, tall: 14 });
  river(t, 168, 206, SKY[tod], { glint: [380 - cx * .05, 10, 0xffd8a0], sparkle: 40 });
  rect(0, 206, W, 4, C(0x7a6a5a)); vgrad(0, 210, W, H - 210, [[0, 0xc8a888], [1, 0xb09070]], 5);
  for (let i = -1; i < 5; i++) { const x = Math.round(mod(i * 140 - cx * 1.1, W + 140) - 40); willow(t, x, 210); }
}
/* 柳树：树干 + 一条条垂下来的柳枝，随风摆 */
function willow(t, x, y) {
  const K = C(0x2a2430), tr = C(0x5a4636);
  capsule(x, y, x + 2, y - 60, 6, K); capsule(x, y, x + 2, y - 60, 4, tr);
  for (let i = 0; i < 18; i++) { const bx = x - 30 + i * 3.6, by = y - 60 - Math.sin(i / 17 * Math.PI) * 14, len = 30 + hash(i, x, 1) * 30, sw = Math.sin(t * 1.4 + i * .4) * 4; for (let s = 0; s < len; s++) { const u = s / len; pset(bx + sw * u * u, by + s, C(u > .7 ? 0x9ad06a : i % 2 ? 0x6aa84a : 0x5a9a3e)); } }
}
/* 夜里的两扇窗（两栋楼）：窗里一个人影在台灯下写字 */
function nightWindow(t, x, y, who, o = {}) {
  const K = C(0x1a1626);
  rect(x - 40, y - 60, 120, 180, C(0x3a3450)); rect(x - 40, y - 60, 120, 2, C(0x4a4462));
  rect(x - 2, y - 2, 44, 44, K); rect(x, y, 40, 40, C(0xffd890)); glowDisc(x + 20, y + 20, 50, C(0xffc870), .45, 5);
  rect(x + 19, y, 2, 40, K); rect(x, y + 19, 40, 2, K);
  // 台灯、人影
  rect(x + 26, y + 26, 2, 10, C(0x5a4a3a)); poly([[x + 22, y + 26], [x + 32, y + 26], [x + 30, y + 22], [x + 24, y + 22]], C(0xfff4d0));
  const bob = Math.sin(t * 1.5 + x) > .9 ? 1 : 0;
  disc(x + 14, y + 22 + bob, 5, C(0x3a2a30)); rect(x + 8, y + 27 + bob, 12, 13, C(0x3a2a30));
  if (who === 'she') { disc(x + 9, y + 18 + bob, 2, C(0x3a2a30)); line(x + 8, y + 19, x + 6, y + 26, C(0x3a2a30)); }
}
/* 雪：大大小小的雪花往下飘，左右晃 */
function snow(t, n, box = [0, 0, W, H], seed = 5, a = 1) {
  const [x0, y0, x1, y1] = box;
  for (let i = 0; i < n; i++) { const big = hash(i, seed, 1) < .2, sp = 10 + hash(i, seed, 2) * 20, x = x0 + mod(hash(i, seed) * (x1 - x0) + Math.sin(t * .8 + i) * 8, x1 - x0), y = y0 + mod(hash(i, seed, 3) * (y1 - y0) + t * sp, y1 - y0); dot(x, y, C(0xffffff), a * (.6 + hash(i, seed, 4) * .4)); if (big) { dot(x + 1, y, C(0xffffff), a * .6); dot(x, y + 1, C(0xffffff), a * .6); } }
}
/* 气球：一串一串，随风晃 */
function balloon(t, x, y, col, i) { const sw = Math.sin(t * 1.5 + i) * 2; line(x, y, x + sw, y - 16, C(0xd8d8d8)); ellipse(x + sw, y - 21, 5, 6, C(0x2a2430)); ellipse(x + sw, y - 21, 4, 5, C(col)); pset(x + sw - 2, y - 24, C(0xffffff)); }
/* 彩带、纸屑：五颜六色的小块转着飘下来 */
function confetti(t, n, box, seed = 9, a = 1) { const [x0, y0, x1, y1] = box; for (let i = 0; i < n; i++) { const x = x0 + mod(hash(i, seed) * (x1 - x0) + Math.sin(t * 2 + i) * 6, x1 - x0), y = y0 + mod(hash(i, seed, 1) * (y1 - y0) + t * (30 + hash(i, seed, 2) * 30), y1 - y0), c = C(pick([0xf04a5a, 0xf0c040, 0x4ab0f0, 0x6ad07a, 0xc06af0, 0xffffff], i)), fl = Math.sin(t * 8 + i) > 0; pset(x, y, c, a); if (fl) pset(x + 1, y, c, a); else pset(x, y + 1, c, a); } }
/* 照片：白边框的一张照片，里面画 fn；ang 歪一点 */
function photoFrame(x, y, w, h, fn, o = {}) {
  const S = layer('photo', w, h); withT(S, () => { clear(C(0x101018)); fn(w, h); });
  if (o.sepia) tintSurf(S, C(0xc8a070), o.sepia);
  const pad = o.pad ?? 6, K = C(0x2a2030);
  rect(x - pad + 2, y - pad + 3, w + pad * 2, h + pad * 2 + (o.bottom ?? 12), C(0x000000), .3);
  rect(x - pad, y - pad, w + pad * 2, h + pad * 2 + (o.bottom ?? 12), C(0xf8f6ee)); rect(x - pad, y - pad, w + pad * 2, 1, K, .2);
  blit(S, x, y);
  if (o.label) text(o.label, x + w / 2, y + h + 3, { size: 8, col: C(0x5a5a70) });
}
/* 老槐树：粗树干，一团团叶子上挂满一串串白花；o.petals 在飘的花瓣数 */
function pagodaTree(t, x, y, k = 1, o = {}) {
  const K = C(0x1e2a1c), tr = C(0x5a4636), trH = C(0x7a6250), trS = C(0x3e3026);
  poly([[x - 16 * k, y], [x + 18 * k, y], [x + 8 * k, y - 70 * k], [x - 8 * k, y - 70 * k]], K);
  poly([[x - 15 * k, y], [x + 17 * k, y], [x + 7 * k, y - 70 * k], [x - 7 * k, y - 70 * k]], tr);
  for (let i = 0; i < 6; i++) line(x - 10 * k + i * 4 * k, y, x - 5 * k + i * 2 * k, y - 66 * k, i % 2 ? trS : trH, .7);
  if (o.scar) { ellipse(x + 2 * k, y - 40 * k, 6 * k, 9 * k, C(0x3a2a20)); ellipse(x + 2 * k, y - 40 * k, 4 * k, 7 * k, C(0x8a6a50)); }
  for (const [dx, ex, ey] of [[-4, -50, -100], [4, 52, -96]]) { capsule(x + dx * k, y - 60 * k, x + ex * k, y + ey * k, 9 * k, K); capsule(x + dx * k, y - 60 * k, x + ex * k, y + ey * k, 7 * k, tr); }
  const S = makeCanopy(o.seed ?? 77, Math.round(200 * k), Math.round(120 * k), [0x2f6036, 0x46803e, 0x68a450, 0x96cc6a], { r: 8 });
  drawCanopy(S, x, y - 66 * k, t, 2, { ph: 1 });
  // 一串串白花
  const x0 = x - S.w / 2, y0 = y - 66 * k - S.h;
  for (let i = 0; i < 160 * k; i++) {
    const gx = Math.floor(hash(i, 501) * S.w), gy = Math.floor(hash(i, 502) * S.h * .9);
    if (!(S.d32[gy * S.w + gx] >>> 24)) continue;
    const sw = Math.round(Math.sin(t * 1.3 + 1) * 2 * (1 - gy / S.h));
    for (let j = 0; j < 3 + (i % 2); j++) pset(x0 + gx + sw + (j % 2), y0 + gy + j, C(j % 2 ? 0xf4f2dc : 0xffffff));
  }
  if (o.petals) windLeaves(t, o.petals, [x - 240 * k, y - 220 * k, x + 240 * k, y + 20], o.wind ?? 30, 503, [[0xffffff, 0xeeeedc], [0xfffff4, 0xf4f2dc]]);
}
/* 她的卧室：床、床头柜（抽屉）、窗、书桌，墙上一张"三好学生"奖状 */
function bedroom(t, o = {}) {
  const K = C(0x2a2430), dusk = o.dusk ?? 1;
  rect(0, 0, W, H, mixc(C(0xf0e8e0), C(0xe8c0b0), dusk * .5)); rect(0, 200, W, 70, C(0xc8a888));
  rect(300, 30, 120, 90, K); rect(302, 32, 116, 86, C(dusk ? 0xf8b088 : 0xbfe0f4)); rect(359, 32, 2, 86, C(0xf0e8e0)); rect(302, 74, 116, 2, C(0xf0e8e0));
  for (let kk = 0; kk < 3; kk++) poly([[305 + kk * 36, 118], [330 + kk * 36, 118], [220 + kk * 50, H], [180 + kk * 50, H]], C(0xffc890), .14, 's');
  rect(40, 40, 50, 36, C(0xf8f0d8)); rect(40, 40, 50, 6, C(0xd83a32)); text('三好学生', 65, 52, { size: 8, col: C(0xd83a32) });
  // 床
  rect(20, 170, 200, 40, K); rect(22, 172, 196, 30, C(0xf0d8e0)); rect(22, 172, 196, 6, C(0xffffff)); for (let i = 0; i < 12; i++) pset(30 + i * 16, 188, C(0xe8b8c8));
  rect(22, 160, 40, 14, C(0xffffff)); rect(20, 200, 200, 12, C(0x8a6a50));
  // 床头柜
  rect(228, 168, 52, 46, K); rect(230, 170, 48, 42, C(0xc8925a)); rect(230, 170, 48, 4, C(0xe0aa70));
  const open = o.drawer ?? 0; rect(232 - open * 10, 186, 44 + open * 10, 14, K); rect(233 - open * 10, 187, 42 + open * 10, 12, C(0xd8a066)); rect(250 - open * 10, 192, 8, 2, C(0x6a4a30));
  rect(240, 156, 4, 14, C(0x8a8a96)); poly([[234, 156], [250, 156], [247, 148], [237, 148]], C(0xfff0c8));
}
