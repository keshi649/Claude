'use strict';
/* scenes6.js：间奏（179.54~204.70）+ 存档点（204.70~217.20）+ 副歌：想改写存档（217.20~242.75）
   shClimb      间奏：她钻进游戏，一路往右跑跳：城市的屋顶 → 夏天的校园 → 黄昏的岔路口 → 夜里的山坡，爬到栀子花树下；
                路上捡花瓣，顶上有进度条；经过的地方飘着那年两个人的影子
   shGhost      "你都如何回忆我 带着笑或是很沉默"：树下坐着十七岁的他的影子（半透明、一闪一闪），笑了一下，又低下头
   shSitGhost   "这些年来有没有人能让你不寂寞"：她坐到他旁边，伸手，手从他身上穿过去；他散成萤火虫
   shLoadSave   "后来"：读取存档："那年夏天的路口"
   shTurnBack   "我总算学会了如何去爱"：同一个路口，这次选"是"，十七岁的她回头去追
   shRunStretch "可惜你早已远去"：怎么跑也追不上，路越拉越长
   shGlitchCrowd "消失在人海"：路上凭空冒出一个个灰色的路人，把他挡没了
   shError      "后来"：画面卡住，弹出"存档无法改写"
   shBreakTears "终于在眼泪中明白"：她哭了，整个世界碎成像素往下掉
   shCollapse   "有些人一旦错过就不再"：什么都掉进黑里，最后只剩中间一个亮点（和片头第一颗星呼应） */

/* ================= 间奏关卡：一整条横版关卡 ================= */
const LV = { start: 180.3, end: 203.4, x0: 12, x1: 1140 };
const LV_V = (LV.x1 - LV.x0) / (LV.end - LV.start);
const PLATS = [
  [0, 70, 100, 'roof'], [84, 150, 94, 'roof'], [164, 232, 100, 'roof'], [246, 300, 90, 'roof'],
  [300, 384, 104, 'grass'], [396, 444, 96, 'step'], [456, 522, 104, 'grass'], [534, 600, 98, 'grass'],
  [600, 652, 104, 'field'], [672, 702, 92, 'brick'], [722, 752, 82, 'brick'], [792, 862, 100, 'field'], [874, 902, 104, 'field'],
  [902, 962, 104, 'hill'], [970, 1002, 96, 'hill'], [1010, 1042, 88, 'hill'], [1050, 1082, 80, 'hill'], [1090, 1240, 74, 'hill'],
];
const HOPS = [[338, 18], [486, 14]];          // 平地上跳过东西：[x, 高]（长椅、冰柜）
function lvX(t) { return t < LV.start ? LV.x0 : Math.min(LV.x1, LV.x0 + LV_V * (t - LV.start)); }
function lvY(x) {
  for (let i = 0; i < PLATS.length; i++) {
    const [a, b, y] = PLATS[i];
    if (x >= a && x <= b) {
      for (const [hx, hh] of HOPS) if (Math.abs(x - hx) < 12) { const u = (x - hx + 12) / 24; return { y: y - hh * 4 * u * (1 - u), air: true }; }
      return { y, air: false };
    }
    const nx = PLATS[i + 1];
    if (nx && x > b && x < nx[0]) { const u = (x - b) / (nx[0] - b), jh = 14 + (nx[0] - b) * .35; return { y: lerp(y, nx[2], u) - jh * 4 * u * (1 - u), air: true }; }
  }
  return { y: 104, air: false };
}
/* 天空按镜头所在的位置在四段之间过渡 */
const ZONES = [
  [0, [[0, '#0A0E30'], [1, '#2A2A5E']]], [300, SUM.sky], [600, [[0, '#3A2A6A'], [.5, '#C8607A'], [1, '#FFC08A']]], [900, [[0, '#070B2A'], [1, '#2C2864']]],
];
function zoneSky(cx) {
  let i = 0; while (i < ZONES.length - 1 && cx > ZONES[i + 1][0] - 40) i++;
  const [x0, A] = ZONES[i], nx = ZONES[i + 1];
  if (!nx) return A;
  const u = clamp((cx - (nx[0] - 40)) / 80); if (u <= 0) return A;
  return A.map((st, k) => [st[0], mix(st[1], nx[1][Math.min(k, nx[1].length - 1)][1], u)]);
}
function tile(b, x, y, w, h, kind, gx) {
  if (kind === 'roof') { prect(b, x, y, w, h, '#2A2E4E'); prect(b, x, y, w, 2, '#4A4E70'); for (let i = 0; i < w; i += 8) prect(b, x + i, y + 2, 1, h, '#22264A'); }
  else if (kind === 'grass' || kind === 'hill') {
    const top = kind === 'hill' ? '#2E5E4C' : '#62BC62', dirt = kind === 'hill' ? '#1C2E36' : '#A8784A', dk = kind === 'hill' ? '#16242C' : '#8A5E38';
    prect(b, x, y, w, h, dirt); prect(b, x, y, w, 3, top); for (let i = 0; i < w; i += 3) pdot(b, x + i, y + 3, top);
    for (let i = 0; i < w * h / 30; i++) pdot(b, x + hash(i, gx, 1) * w, y + 5 + hash(i, gx, 2) * (h - 5), dk);
  }
  else if (kind === 'step') { prect(b, x, y, w, h, '#CEC6B6'); prect(b, x, y, w, 1, '#ECE6DA'); for (let i = 0; i < h; i += 6) prect(b, x, y + i, w, 1, '#B8B0A0'); }
  else if (kind === 'field') { prect(b, x, y, w, h, '#9A7A4A'); prect(b, x, y, w, 2, '#B89A5A'); for (let i = 0; i < w * h / 30; i++) pdot(b, x + hash(i, gx, 3) * w, y + 3 + hash(i, gx, 4) * (h - 3), '#8A6A40'); }
  else if (kind === 'brick') { prect(b, x, y, w, 8, '#C86A3A'); for (let i = 0; i < w; i += 8) { prect(b, x + i, y, 1, 8, '#8A4A2A'); } prect(b, x, y, w, 1, '#E88A5A'); prect(b, x, y + 4, w, 1, '#8A4A2A'); }
}
/* 那年两个人的影子：半透明、扫描线一闪一闪 */
function ghostPair(b, t, x, fy, kind, a = .4) {
  const fl = .75 + .25 * Math.sin(t * 13);
  const her = { col: COL.her, skirt: true, legs: kind === 'sit' ? 'sit' : 0, eyes: kind === 'fork' ? 'l' : 'r' }, him = { col: COL.him, cowlick: true, legs: kind === 'sit' ? 'sit' : 0, eyes: kind === 'fork' ? 'r' : 'l' };
  monAt(b, x, fy, her, null, a * fl); monAt(b, x + 22, fy, him, null, a * fl);
}
const LV_PETALS = (() => { const a = []; for (let x = 60; x < 1120; x += 34) { const y = lvY(x).y - 14 - (hash(x, 1) < .4 ? 10 : 0); a.push([x, y]); } return a; })();
function shClimb(g, t, s) {
  const VW = 240, VH = 135;
  const hx = lvX(t), hy = lvY(hx);
  const camX = clamp(hx - 84, 0, 1240 - VW), camY = 0;
  const b = pbuf('lvl', VW, VH), gl = glowBuf('lvl', VW, VH);
  // 天
  psky(b, VW, VH, zoneSky(camX + VW / 2));
  const nightA = 1 - clamp((camX + 120 - 260) / 80), nightD = clamp((camX + 120 - 860) / 80);
  if (nightA > 0) { b.save(); b.globalAlpha = nightA; starfield(b, t, VW, 70, { n: 40, seed: 211 }); b.restore(); }
  if (nightD > 0) { b.save(); b.globalAlpha = nightD; pspr(b, milkyWay(VW, 80, 213, 0, 70, 240, 0, 16), 0, 0); starfield(b, t, VW, 80, { n: 70, seed: 212 }); b.restore(); }
  // 远景（视差 0.3）：每一段只画自己的远景，段和段之间淡进淡出
  const cmid = camX + VW / 2, zw = (a, c) => clamp((cmid - a + 40) / 80) * (1 - clamp((cmid - c + 40) / 80));
  const wA = zw(-999, 300), wB = zw(300, 600), wC = zw(600, 900), wD = zw(900, 9999);
  const bgx = c0 => ri((c0 - camX) * .3);
  if (wA > 0) { b.save(); b.globalAlpha = wA; pspr(b, skyline(260, 60, 214, '#161A3E', 50, .15), bgx(40) - 10, 50); b.restore(); }
  if (wB > 0) { b.save(); b.globalAlpha = wB; schoolBuilding(b, 60 + bgx(330), 96, 120, 3, {}); b.restore(); }
  if (wC > 0) { b.save(); b.globalAlpha = wC; hillShape(b, VW, 135, [[0, 96], [40, 84], [110, 78], [180, 88], [240, 82]], '#7A5A6A', '#9A6A7A'); b.restore(); }
  if (wD > 0) { b.save(); b.globalAlpha = wD; hillShape(b, VW, 135, [[0, 100], [80, 86], [160, 80], [240, 88]], '#16334A', '#24485A'); b.restore(); }
  // 平台
  b.save(); b.translate(-ri(camX), -ri(camY));
  const gIdx = Math.floor(t * 6);
  PLATS.forEach(([a, c, y, kind], i) => {
    if (c < camX - 10 || a > camX + VW + 10) return;
    tile(b, a, y, c - a, 135 - y + 10, kind, i);
    // 后半段开始"坏掉"：随机少几块、闪一下
    if (a > 640) for (let k = 0; k < 3; k++) { const hx2 = a + hash(i, k, gIdx) * (c - a); if (hash(i, k, gIdx + 7) < .35) prect(b, ri(hx2 / 4) * 4, y, 4, 4, '#05060F'); }
  });
  // 布景和回忆的影子
  bench(b, 326, 104, 26);
  ghostPair(b, t, 404, 96, 'stand', .35);                                     // 台阶上那年打游戏的两个人
  prect(b, 476, 92, 20, 12, '#F4F4F0'); prect(b, 478, 94, 16, 3, '#BFE0F0');  // 冰柜
  ghostPair(b, t, 500, 104, 'stand', .35);
  gardeniaBush(b, t, 536, 98, 60, 12, { seed: 37, flowers: 12 });
  prect(b, 640, 88, 2, 16, '#6A4A30'); ppoly(b, [[632, 88], [652, 88], [655, 91], [652, 94], [632, 94]], '#B88A58');   // 路牌
  ghostPair(b, t, 806, 100, 'fork', .35);
  const tr = gardeniaTree(b, gl, t, 1160, 74, 20, { night: true, flowers: 34, seed: 27 });
  // 存档点：树下一颗转着的星
  const sp = Math.floor(t * 6) % 4; pdisc(gl, 1140, 66, 5, '#FFF4B0'); pdot(b, 1140, 66, '#FFFFFF'); if (sp % 2) { pdot(b, 1138, 66, '#FFE27A'); pdot(b, 1142, 66, '#FFE27A'); } else { pdot(b, 1140, 64, '#FFE27A'); pdot(b, 1140, 68, '#FFE27A'); }
  // 花瓣（经过就被吃掉，冒一下光）
  let got = 0;
  LV_PETALS.forEach(([px2, py2], i) => {
    if (hx >= px2) { got++; const u = (hx - px2) / 12; if (u < 1) { b.globalAlpha = 1 - u; pring(b, px2, py2, 2 + u * 6, 2 + u * 6, '#FFFFFF'); b.globalAlpha = 1; } return; }
    const bob = Math.sin(t * 4 + i) * 1.5;
    petal(b, px2, py2 + bob, Math.floor(t * 4 + i)); prect(gl, px2 - 1, py2 + bob - 1, 4, 3, 'rgba(255,255,255,.7)');
  });
  // 她：跑、跳
  const wc = walkCycle(t, 9), air = hy.air, done = t >= LV.end;
  const o = done ? { col: COL.her, eyes: 'up', glint: true } : air ? { col: COL.her, legs: 'jump', armL: 'up', armR: 'up', eyes: 'r' } : { col: COL.her, legs: t < LV.start ? 0 : wc.legs, eyes: 'r' };
  monAt(b, hx, ri(hy.y) + (air || done || t < LV.start ? 0 : wc.bob), o);
  if (!air && !done && t >= LV.start && Math.floor(t * 9) % 3 === 0) { pdot(b, hx - 12, hy.y - 1, '#E8E0D0'); pdot(b, hx - 14, hy.y - 2, '#E8E0D0'); }   // 脚下扬起的小土
  if (air && hx > 752 && hx < 792) for (let k = 0; k < 4; k++) pline(b, hx - 20 - k * 3, hy.y - 12 + k * 3, hx - 14 - k * 3, hy.y - 12 + k * 3, 'rgba(255,255,255,.6)');   // 大跳的速度线
  fireflies(b, gl, t, 12, 900, 40, 1240, 100, 13);
  b.restore();
  blit(g, 'lvl', 8); glowBlit(g, 'lvl', 8, 0, 0, .8, 3);
  // 偶尔一下整屏的故障（后半段）
  const gk = [196.4, 199.1, 201.3].some(x => t > x && t < x + .12);
  if (gk) { const q = layer('lvGl'); q.drawImage(g.canvas, 0, 0); glitch(g, LAYER.lvGl, .6, Math.floor(t * 30)); }
  // 界面：READY → GO!，花瓣计数，进度条
  if (t < 181.4) {
    const k = t < LV.start ? 'READY?' : 'GO!', a = t < LV.start ? E.out(seg(t, s.t, s.t + .2)) : 1 - seg(t, 181.0, 181.4);
    ptext(g, k, 900, 380, 10, t < LV.start ? '#FFFFFF' : '#FFE27A', { align: 'center', alpha: a, ol: '#0A0C1C', shadow: '#0A0C1C' });
  }
  const ua = E.out(seg(t, s.t + .2, s.t + .6)) * (1 - seg(t, s.e - .5, s.e));
  if (ua > 0) {
    g.save(); g.globalAlpha = ua;
    g.imageSmoothingEnabled = false;
    ptext(g, '花瓣 × ' + String(got).padStart(2, '0'), 120, 70, 3, '#FFFFFF', { ol: '#0A0C1C' });
    // 进度条：她的小头像往右挪，尽头是一棵树
    const bx = 660, bw = 600, by = 86;
    prect(g, bx, by, bw, 6, '#0A0C1C'); prect(g, bx + 3, by + 1, bw - 6, 4, '#3A3E58'); prect(g, bx + 3, by + 1, (bw - 6) * (hx - LV.x0) / (LV.x1 - LV.x0), 4, '#9AF0DC');
    g.drawImage(smon({ col: COL.her }), ri(bx + (bw - 6) * (hx - LV.x0) / (LV.x1 - LV.x0) - 32), by - 52, 64, 52);
    g.fillStyle = '#2E6A3E'; g.fillRect(bx + bw + 6, by - 30, 30, 22); g.fillStyle = '#6A4A34'; g.fillRect(bx + bw + 18, by - 8, 6, 16); g.fillStyle = '#FFFFFF'; g.fillRect(bx + bw + 12, by - 24, 6, 6); g.fillRect(bx + bw + 24, by - 20, 6, 6);
    g.restore();
  }
}

/* ================= 存档点：树下的影子 ================= */
function ghostHill(b, gl, t, o = {}) {
  const w = 192, h = 130;
  psky(b, w, h, [[0, '#070B2A'], [.55, '#151C52'], [1, '#2C2864']]);
  pspr(b, milkyWay(w, 80, 221, 0, 70, 192, 0, 18, '#7A6AD0'), 0, 0);
  starfield(b, t, w, 75, { n: 100, seed: 222, tw: .55 });
  hillShape(b, w, h, [[0, 88], [60, 82], [120, 80], [192, 86]], '#1C3E3A', '#2E5E4C');
  gardeniaTree(b, gl, t, 128, 81, 24, { night: true, flowers: 40, seed: 27 });
  for (let i = 0; i < 50; i++) pdot(b, hash(i, 223) * w, 84 + hash(i, 224) * (h - 86), '#2A5248');
}
/* 十七岁的他，像信号不好的画面：半透明、一行行错开 */
function ghostHim(b, t, cx, fy, o, a) {
  const s = mon(o), k = Math.floor(t * 12);
  b.save(); b.globalAlpha *= a * (.7 + .3 * Math.sin(t * 9));
  for (let r = 0; r < MCH; r += 2) { const dx = hash(k, r) < .12 ? (hash(k, r, 1) < .5 ? -1 : 1) : 0; b.drawImage(s, 0, r, MCW, 2, ri(cx - 12) - MOX + dx, ri(fy - 16) - MOY + r, MCW, 2); }
  b.restore();
}
function shGhost(g, t, s) {
  const w = 192, h = 130, b = pbuf('ghost', w, h), gl = glowBuf('ghost', w, h);
  ghostHill(b, gl, t);
  const smile = t >= ch(37, 2) && t < ch(37, 6), quiet = t >= ch(37, 6);
  ghostHim(b, t, 112, 82, { col: COL.him, cowlick: true, legs: 'sit', eyes: smile ? 'happy' : quiet ? 'dn' : 'r', glint: !smile && !quiet }, .55);
  pglow(gl, 112, 74, 12, '#9AF0DC', .5);
  // 她走过来，站在他面前
  const arrive = E.out(seg(t, s.t, s.t + 1.6)), wc = walkCycle(t, 4), walking = arrive < 1;
  monAt(b, lerp(40, 82, arrive), 84 + (walking ? wc.bob : 0), { col: COL.her, eyes: 'r', legs: walking ? wc.legs : 0, glint: true }, '#C8CCEA');
  fireflies(b, gl, t, 14, 20, 40, 190, 100, 15);
  const z = 1.3 + .1 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'ghost', 10, 100, 66, z, W / 2, H / 2 - 30); glowBlitZoom(g, 'ghost', 10, 100, 66, z, W / 2, H / 2 - 30, .9, 3);
  if (quiet) uiDialog(g, t, ch(37, 6) + .1, 560, 150, 800, '……', { name: '2P', cps: 3, nameFill: '#1E5A50' });
}
function shSitGhost(g, t, s) {
  const w = 192, h = 130, b = pbuf('ghost', w, h), gl = glowBuf('ghost', w, h);
  ghostHill(b, gl, t);
  const fade = seg(t, 215.6, 217.0);
  const reach = t >= ch(38, 9) && t < 215.4;                       // "让你"：伸手
  // 她坐下（背影，看星星），他在旁边（背影的影子）
  monAt(b, 92, 84, { col: COL.her, back: true, legs: 'sit', armR: reach ? 'reach' : 'n' }, '#C8CCEA');
  if (fade < 1) {
    const s2 = mon({ col: COL.him, cowlick: true, back: true, legs: 'sit' });
    if (fade <= 0) ghostHim(b, t, 116, 84, { col: COL.him, cowlick: true, back: true, legs: 'sit' }, .5);
    else monPixels({ col: COL.him, cowlick: true, back: true, legs: 'sit' }).forEach((p, i) => {   // 散成萤火虫往上飘
      const st = hash(i, 225) * .5; const u = clamp((fade - st) / (1 - st));
      const x = 116 - 12 + p.x + Math.sin(u * 6 + i) * u * 6, y = 84 - 16 + p.y - u * u * 40;
      b.globalAlpha = (1 - u) * .7; pdot(b, x, y, u > .3 ? '#E8FF8A' : p.col); gl.globalAlpha = (1 - u); pdot(gl, x, y, '#E8FF8A');
    });
    b.globalAlpha = 1; gl.globalAlpha = 1;
  }
  // 手穿过他的地方，几个像素散开
  if (reach) { const k = seg(t, ch(38, 9), ch(38, 9) + .6); for (let i = 0; i < 6; i++) { b.globalAlpha = 1 - k; pdot(b, 106 + k * hash(i, 226) * 8, 76 - k * hash(i, 227) * 8, '#9AF0DC'); } b.globalAlpha = 1; }
  fireflies(b, gl, t, 14, 20, 40, 190, 100, 15);
  const z = 1.45;
  blitZoom(g, 'ghost', 10, 104, 64, z, W / 2, H / 2 - 30); glowBlitZoom(g, 'ghost', 10, 104, 64, z, W / 2, H / 2 - 30, .9, 3);
}

/* ================= 副歌：想改写存档 ================= */
function shLoadSave(g, t, s) {
  const b = pbuf('lsave', 120, 68); psky(b, 120, 68, [[0, '#06081A'], [1, '#141A3A']]);
  starfield(b, t, 120, 68, { n: 40, seed: 231 });
  blit(g, 'lsave', 16);
  const a = E.out(seg(t, s.t, s.t + .25)), pick = ch(39, 1);
  uiChoice(g, t, 520, 260, 880, '读取存档', ['存档 01　十七岁的夏天', '　 └ 那年夏天的路口'], t < pick - .5 ? 0 : 1, { alpha: a, picked: pick, k: 4 });
}
function shTurnBack(g, t, s) {
  const w = 192, h = 124, b = pbuf('fork', w, h), gl = glowBuf('fork', w, h);
  forkScene(b, gl, t);
  const pick = ch(40, 3), run = 221.2;
  const herRun = E.in2(seg(t, run, s.e + 1.5)), wc = walkCycle(t, 8);
  const himU = seg(t, run - .6, s.e + 2), mx = lerp(110, 150, himU), my = lerp(96, 70, himU);
  const turned = t >= pick + .5;
  const hx = turned ? lerp(88, 140, herRun) : 88, hy = turned ? lerp(96, 76, herRun) : 96;
  if (himU < .6) monAt(b, mx, my + wc.bob * (himU > 0 ? 1 : 0), { col: COL.him, cowlick: true, eyes: 'r', legs: himU > 0 ? walkCycle(t, 4).legs : 0 }, '#FFD8C0');
  else smonAt(b, mx, my, { col: COL.him, cowlick: true, eyes: 'r', legs: walkCycle(t, 4).legs }, '#FFD8C0');
  monAt(b, hx, hy + (t > run ? wc.bob : 0), { col: COL.her, skirt: true, eyes: turned ? 'r' : 'l', legs: t > run ? wc.legs : 0, armR: t > run ? 'reach' : 'n' }, '#FFD8C0');
  const z = 1.3;
  blitZoom(g, 'fork', 10, 104, 70, z, W / 2, H / 2 - 40); glowBlitZoom(g, 'fork', 10, 104, 70, z, W / 2, H / 2 - 40, .8, 3);
  const ma = E.out(seg(t, s.t, s.t + .25)) * (1 - seg(t, pick + .5, pick + .8));
  if (ma > 0) uiChoice(g, t, 1290, 150, 340, '回头？', ['是', '否'], 0, { alpha: ma, blink: t < pick, picked: pick });
}
/* 追：横着跑，背景往后退，他却越来越远 */
function chaseScene(b, gl, t, s, o = {}) {
  const w = 192, h = 124;
  psky(b, w, 62, [[0, '#3A2A6A'], [.5, '#C8607A'], [1, '#FFC08A']]);
  pdisc(b, 150, 50, 10, '#FFE8A8'); pdisc(gl, 150, 50, 16, 'rgba(255,200,120,.6)');
  const sc = (t - s.t) * 60;
  b.save(); b.translate(-ri(mod(sc * .2, 192)), 0); for (let k = 0; k < 2; k++) hillShape(b, 192, 108, [[0, 60], [60, 54], [120, 60], [192, 58]], '#6A4A6A', '#8A5A7A'), b.translate(192, 0); b.restore();
  prect(b, 0, 64, w, h - 64, '#9A7A4A');
  prect(b, 0, 84, w, 12, '#E8D2A0');
  for (let i = 0; i < 12; i++) { const x = mod(i * 24 - sc, 288) - 48; prect(b, x, 90, 8, 1, '#D8C090'); prect(b, x, 70 + (i % 3) * 4, 2, 6, '#7A5A30'); }   // 路面的纹、路边的木桩
}
function shRunStretch(g, t, s) {
  const w = 192, h = 124, b = pbuf('chase', w, h), gl = glowBuf('chase', w, h);
  chaseScene(b, gl, t, s);
  const wc = walkCycle(t, 9);
  monAt(b, 64, 92 + wc.bob, { col: COL.her, skirt: true, eyes: 'r', legs: wc.legs, armR: 'reach' }, '#FFD8C0');
  const d = seg(t, s.t, s.e), mx = lerp(130, 176, d);
  if (d < .7) monAt(b, mx, 92 + walkCycle(t, 4).bob, { col: COL.him, cowlick: true, eyes: 'r', legs: walkCycle(t, 4).legs }, '#FFD8C0');
  else smonAt(b, mx, 90, { col: COL.him, cowlick: true, eyes: 'r', legs: walkCycle(t, 4).legs }, '#FFD8C0');
  blitZoom(g, 'chase', 10, 96, 62, 1.2, W / 2, H / 2 - 40); glowBlitZoom(g, 'chase', 10, 96, 62, 1.2, W / 2, H / 2 - 40, .8, 3);
  if (t > 225.4) { const q = layer('rsG'); q.drawImage(g.canvas, 0, 0); glitch(g, LAYER.rsG, .25 * seg(t, 225.4, s.e), Math.floor(t * 20)); }
}
function shGlitchCrowd(g, t, s) {
  const w = 192, h = 124, b = pbuf('chase', w, h), gl = glowBuf('chase', w, h);
  chaseScene(b, gl, t, s);
  const wc = walkCycle(t, 9);
  // 路人一个个"刷"出来：先一闪一闪，然后站定，越来越多，挡在两个人中间
  const gone = ch(42, 4);
  if (t < gone) smonAt(b, 176, 90, { col: COL.him, cowlick: true, eyes: 'r', legs: walkCycle(t, 4).legs }, '#FFD8C0');
  for (let i = 0; i < 40; i++) {
    const st = s.t + .1 + hash(i, 241) * 2.6; if (t < st) continue;
    const x = 80 + hash(i, 242) * 108, y = 84 + hash(i, 243) * 12, k = t - st;
    if (k < .3 && Math.floor(k * 20) % 2) continue;
    smonAt(b, x, y, { col: CROWD[i % CROWD.length], eyes: hash(i, 244) < .5 ? 'l' : 'r' }, '#C8C0C8', k < .3 ? .6 : 1);
  }
  monAt(b, 64, 92 + wc.bob, { col: COL.her, skirt: true, eyes: 'r', legs: wc.legs, armR: 'reach' }, '#FFD8C0');
  blitZoom(g, 'chase', 10, 110, 62, 1.25, W / 2, H / 2 - 40);
  const q = layer('gcG'); q.drawImage(g.canvas, 0, 0); glitch(g, LAYER.gcG, .25 + .2 * Math.sin(t * 7), Math.floor(t * 20));
}
function shError(g, t, s) {
  // 画面卡在上一刻（灰掉），弹出报错框，轻轻抖
  const w = 192, h = 124, b = pbuf('chase', w, h), gl = glowBuf('chase', w, h);
  chaseScene(b, gl, s.t - .05, { t: SHOTS[s.i - 1].t });
  for (let i = 0; i < 40; i++) { const x = 80 + hash(i, 242) * 108, y = 84 + hash(i, 243) * 12; smonAt(b, x, y, { col: CROWD[i % CROWD.length], eyes: hash(i, 244) < .5 ? 'l' : 'r' }, '#C8C0C8'); }
  monAt(b, 64, 92, { col: COL.her, skirt: true, eyes: 'wide', armR: 'reach' }, '#FFD8C0');
  const shake = Math.sin(t * 60) * 6 * (1 - seg(t, s.t, s.t + .5));
  blitZoom(g, 'chase', 10, 110, 62, 1.25, W / 2 + shake, H / 2 - 40);
  g.save(); g.globalCompositeOperation = 'saturation'; g.fillStyle = '#808080'; g.globalAlpha = .7; g.fillRect(0, 0, W, H); g.restore();
  g.fillStyle = 'rgba(10,10,30,.35)'; g.fillRect(0, 0, W, H);
  const a = E.back(seg(t, s.t + .05, s.t + .3));
  if (a > 0) {
    g.save(); g.translate(960, 380); g.scale(1, clamp(a, 0, 1.1)); g.translate(-960, -380);
    uiBox(g, 560, 240, 800, 280, 6, { fill: '#3A1420', line: '#FFB0B0' });
    ptext(g, '× 错误', 620, 280, 4, '#FF9A9A');
    ptext(g, '存档无法改写', 960, 380, 6, '#FFFFFF', { align: 'center' });
    g.restore();
  }
}
function shBreakTears(g, t, s) {
  const w = 120, h = 68, b = pbuf('break', w, h), gl = glowBuf('break', w, h);
  psky(b, w, h, [[0, '#3A2A6A'], [.6, '#C8607A'], [1, '#FFC08A']]);
  prect(b, 0, 50, w, 18, '#9A7A4A');
  const tear = t > ch(44, 3) ? 2 : 1;
  monAt(b, 60, 56, { col: COL.her, skirt: true, eyes: 'sad', tear }, '#FFD8C0');
  // 世界碎成像素往下掉：背景上一块块剥落、掉下去，露出后面的黑
  const u = seg(t, s.t + .3, s.e);
  for (let i = 0; i < 260; i++) {
    const st = hash(i, 251) * .9; if (u < st) continue;
    const bx = ri(hash(i, 252) * 30) * 4, by = ri(hash(i, 253) * 17) * 4, k = (u - st) * 6;
    if (Math.abs(bx + 2 - 60) < 14 && by > 36 && by < 58) continue;      // 她身上不掉
    b.fillStyle = '#05060F'; b.fillRect(bx, by, 4, 4);
    const fy = by + k * k * 14;
    if (fy < h) { b.globalAlpha = 1 - clamp(k / 2); prect(b, bx, fy, 4, 4, by < 50 ? mix('#C8607A', '#FFC08A', by / 50) : '#9A7A4A'); b.globalAlpha = 1; }
  }
  // 眼泪往下掉
  if (tear === 2) { const k = mod((t - ch(44, 3)) * 1.4, 1); prect(b, 54, 44 + k * 14, 1, 2, '#A8E0FF'); prect(b, 65, 44 + mod(k + .5, 1) * 14, 1, 2, '#A8E0FF'); }
  const z = 1.2;
  blitZoom(g, 'break', 16, 60, 38, z, W / 2, H / 2 - 20); glowBlitZoom(g, 'break', 16, 60, 38, z, W / 2, H / 2 - 20, .6, 2);
}
function shCollapse(g, t, s) {
  const w = 120, h = 68, b = pbuf('coll', w, h), gl = glowBuf('coll', w, h);
  prect(b, 0, 0, w, h, '#05060F');
  const u = seg(t, s.t, 240.8);
  // 她站在最后一小块地上，地也一块块掉下去；最后她化成像素
  const tiles = 9;
  for (let i = 0; i < tiles; i++) {
    const st = .2 + Math.abs(i - 4) / 4 * .5 + (i === 4 ? .3 : 0); const k = clamp((u - st) * 3);
    const x = 42 + i * 4, y = 56 + k * k * 40;
    if (y < h) { b.globalAlpha = 1 - k; prect(b, x, y, 4, 4, '#9A7A4A'); prect(b, x, y, 4, 1, '#B89A5A'); b.globalAlpha = 1; }
  }
  const pu = seg(t, 239.2, 241.6);
  if (pu <= 0) monAt(b, 60, 56, { col: COL.her, skirt: true, eyes: 'shut' });
  else monPixels({ col: COL.her, skirt: true, eyes: 'shut' }).forEach((p, i) => {
    const st = hash(i, 261) * .5, k = clamp((pu - st) / (1 - st));
    const x = 60 - 12 + p.x + (hash(i, 262) - .5) * k * 20, y = 56 - 16 + p.y + k * k * 30;
    b.globalAlpha = 1 - k; pdot(b, x, y, p.col);
  });
  b.globalAlpha = 1;
  // 掉下去的像素雨（画面上一直有东西往下落）
  for (let i = 0; i < 40; i++) { const sp = 20 + hash(i, 263) * 30, y = mod(hash(i, 264) * 80 + (t - s.t) * sp, 80) - 6, x = hash(i, 265) * w; b.globalAlpha = .5 * (1 - seg(t, 240.5, 241.8)); pdot(b, x, y, ['#C8607A', '#FFC08A', '#62BC62', '#4FAAE8'][i % 4]); }
  b.globalAlpha = 1;
  // 最后只剩中间一个亮点，一跳一跳
  const dot = seg(t, 241.6, 242.0);
  if (dot > 0) { const pulse = .6 + .4 * Math.sin((t - 241.6) * 9); pdot(b, 60, 34, '#FFFFFF'); pdisc(gl, 60, 34, 2 + pulse * 2, rgba('#FFF4D0', dot)); }
  blit(g, 'coll', 16, 0, 0); glowBlit(g, 'coll', 16, 0, 0, 1, 3);
}
