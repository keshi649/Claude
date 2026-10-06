'use strict';
/* props.js：可复用的场景部件——房间、窗外夜景、桌上的东西、花盆、霓虹灯牌、人群。 */

/* ---------------- 窗外的城市 ----------------
   (x, y, w, h) 是窗洞；tod：0 夜 → 1 黎明 → 2 白天 → 3 黄昏；rain 0–1。
   offx：窗外景物的视差偏移。sign：霓虹招牌 {lines:[{s, times}], t, on} */
function cityView(g, x, y, w, h, t, o = {}) {
  const tod = o.tod ?? 0;
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  // 天空：分段色带
  const SKY = {
    0: ['#141a36', '#1b2246', '#232b55', '#2e3462', '#3d3c6c', '#4f4570'],
    1: ['#2c3b6a', '#45528a', '#6c6fa2', '#a08eb0', '#e0aaa4', '#f6c9a0'],
    2: ['#7fb4e6', '#8fc0ea', '#a2cbee', '#b6d6f0', '#c9e0f2', '#dceaf2'],
    3: ['#3a3f78', '#6a5a92', '#b0709a', '#e48a7c', '#f6a86c', '#fbc97a'],
  };
  const sk = tod === 3.4 ? ['#5a6278', '#646c82', '#6e768a', '#7a8194', '#868c9c', '#9298a6'] : SKY[rd(tod) % 4] || SKY[0];
  bands(g, x, y, w, h * .8, sk);
  rect(g, x, y + fl(h * .8), w, h, sk[sk.length - 1]);
  if (o.sun) { disc(g, x + o.sun[0], y + o.sun[1], 11, '#ffd9a0'); disc(g, x + o.sun[0], y + o.sun[1], 9, '#fff0cc'); }
  const ox = o.offx || 0;
  if (tod < .5) {
    // 星星、月亮
    const r = R(11);
    for (let i = 0; i < 26; i++) { const sx0 = x + r() * w, sy0 = y + r() * h * .45; if ((t * 1.3 + i * .7) % 3 > .25) px(g, sx0 + ox * .1, sy0, i % 5 ? '#c9cff0' : '#ffffff'); }
    if (o.moon !== false) { disc(g, x + w - 22 + rd(ox * .1), y + 12, 5, '#f4eccd'); disc(g, x + w - 20 + rd(ox * .1), y + 11, 4, '#fbf6e2'); }
  }
  // 远处楼群
  const r2 = R(5), bx0 = x - 20 + ox * .25;
  const far = tod < .5 ? '#232848' : tod < 1.5 ? '#5a5a86' : tod < 2.5 ? '#8fa6c4' : '#5c4f7c';
  const mid = tod < .5 ? '#1a1d36' : tod < 1.5 ? '#3f4068' : tod < 2.5 ? '#6f86a8' : '#463c64';
  for (let k = 0, xx = bx0; xx < x + w + 20; k++) {
    const bw = 10 + fl(r2() * 14), bh = 18 + fl(r2() * 26);
    rect(g, xx, y + h - bh - 8, bw, bh + 8, far);
    if (tod < 1.2) for (let j = 0; j < bh - 4; j += 4) for (let i = 2; i < bw - 2; i += 3) if (hash(k, i, j) > .62) px(g, xx + i, y + h - bh - 8 + 2 + j, hash(k, j, i) > .5 ? '#f3c97a' : '#8fb6e8');
    xx += bw + 1;
  }
  // 近一点的楼
  const r3 = R(9), bx1 = x - 30 + ox * .5;
  for (let k = 0, xx = bx1; xx < x + w + 30; k++) {
    const bw = 16 + fl(r3() * 20), bh = 10 + fl(r3() * 18);
    rect(g, xx, y + h - bh, bw, bh, mid);
    if (tod < 1.2) for (let j = 2; j < bh - 2; j += 4) for (let i = 2; i < bw - 2; i += 4) if (hash(k + 50, i, j) > .55) rect(g, xx + i, y + h - bh + j, 2, 2, hash(k, i + j) > .4 ? '#ffd690' : '#a6d2ff');
    xx += bw + 2;
  }
  if (o.sign) neonSign(g, o.sign, t);
  // 雨
  if (o.rain) {
    const n = rd(60 * o.rain);
    for (let i = 0; i < n; i++) {
      const sx0 = x + ((hash(i, 3) * w + t * 30) % w), sy0 = y + ((hash(i, 7) * h + t * 140) % h);
      line(g, sx0, sy0, sx0 - 1, sy0 + 3, 'rgba(190,210,240,.55)');
    }
  }
  g.restore();
}

/* 霓虹招牌：对面楼上的一块牌子，字一个个亮起来，偶尔闪一下 */
function neonSign(g, s, t) {
  const { x, y, w, h } = s;
  rect(g, x, y, w, h, '#1b1424'); rect(g, x, y, w, 1, '#2d2238'); rect(g, x, y + h - 1, w, 1, '#120d18');
  // 支架
  rect(g, x + 4, y + h, 1, 4, '#2a2233'); rect(g, x + w - 5, y + h, 1, 4, '#2a2233');
  s.lines.forEach((ln, i) => {
    const flick = (k) => (hash(fl(t * 12), k) > .97 ? .35 : 1);
    ptext(g, ln.s, x + w / 2, y + 4 + i * 14, ln.col || '#ff7eb6', { align: 'c', times: ln.times, t, pop: .08, alpha: flick(i) });
  });
}

/* ---------------- 房间（侧面） ----------------
   世界坐标：地板 y=138，桌面 y=122，窗洞 x 150–270 / y 30–98。
   o：tod（窗外时间）、lamp（台灯 0–1）、sign、frost、rain、acLed（空调屏幕文字）、bed */
const ROOM = { floor: 138, desk: 122, wx: 150, wy: 30, ww: 120, wh: 68 };
function room(g, t, o = {}) {
  const F = ROOM.floor, D = ROOM.desk;
  // 墙
  rect(g, -40, -20, 460, F + 20, '#c7b49c');
  for (let i = -40; i < 420; i += 8) rect(g, i, -20, 1, F - 6, '#bea98f');
  // 墙裙
  rect(g, -40, 112, 460, F - 112, '#a8927a'); rect(g, -40, 112, 460, 1, '#d8c7af'); rect(g, -40, 113, 460, 1, '#8e7a64');
  rect(g, -40, F - 3, 460, 3, '#7c6753');
  // 地板
  rect(g, -40, F, 460, 30, '#86603f');
  for (let i = -40; i < 420; i += 23) rect(g, i, F, 1, 30, '#6f4c31');
  rect(g, -40, F, 460, 1, '#9b7350'); rect(g, -40, F + 5, 460, 1, '#7a5537');
  // 地毯
  rect(g, 60, F + 2, 150, 6, '#7b4f55'); rect(g, 60, F + 2, 150, 1, '#956068'); dith(g, 62, F + 4, 146, 2, '#6b434a');
  // 书架（左）
  bookshelf(g, 8, 50, t);
  // 软木板 + 便签
  rect(g, 70, 44, 44, 30, '#8d6a4a'); rect(g, 71, 45, 42, 28, '#c79b6a'); dith(g, 72, 46, 40, 26, '#b98d5e');
  [[74, 48, '#f6e27a'], [88, 50, '#9ad6f0'], [100, 47, '#f4a7b9'], [78, 60, '#c6ef9a'], [95, 61, '#f6e27a']].forEach(([a, b, c], i) => { rect(g, a, b, 9, 8, c); px(g, a + 4, b, '#d9473f'); rect(g, a + 2, b + 3, 5, 1, 'rgba(60,40,40,.35)'); rect(g, a + 2, b + 5, 4, 1, 'rgba(60,40,40,.35)'); });
  // 空调
  ac(g, 156, 7, t, o);
  // 窗
  const { wx, wy, ww, wh } = ROOM;
  cityView(g, wx, wy, ww, wh, t, { tod: o.tod ?? 0, sign: o.sign, rain: o.rain, offx: o.winOff || 0, moon: o.moon });
  if (o.frost) frost(g, wx, wy, ww, wh, o.frost, t, o.fog);
  if (o.drips) drips(g, wx, wy, ww, wh, t, o.drips);
  if (o.glass) o.glass(g);
  // 窗框
  const fr = '#ece5da', frs = '#c9bfb0';
  rect(g, wx - 3, wy - 3, ww + 6, 3, fr); rect(g, wx - 3, wy + wh, ww + 6, 2, fr);
  rect(g, wx - 3, wy, 3, wh, fr); rect(g, wx + ww, wy, 3, wh, fr);
  // 上面一条横档（气窗），下面是一整块大玻璃
  rect(g, wx, wy + 14, ww, 2, fr); rect(g, wx, wy + 16, ww, 1, frs);
  rect(g, wx + ww / 2 - 1, wy, 2, 14, fr);
  // 窗台
  rect(g, wx - 8, wy + wh + 2, ww + 16, 4, '#efe8dd'); rect(g, wx - 8, wy + wh + 6, ww + 16, 2, '#b7ab9b');
  // 窗帘
  curtain(g, wx - 18, wy - 9, 16, wh + 22, t, -1); curtain(g, wx + ww + 2, wy - 9, 16, wh + 22, t, 1);
  rect(g, wx - 24, wy - 10, ww + 48, 2, '#5d4a3b'); disc(g, wx - 24, wy - 9, 1, '#5d4a3b'); disc(g, wx + ww + 24, wy - 9, 1, '#5d4a3b');
  // 床（右）
  bed(g, 318, F);
  // 桌子
  rect(g, 126, D, 182, 3, '#b2855c'); rect(g, 126, D + 3, 182, 2, '#8a6242'); rect(g, 126, D, 182, 1, '#c99c70');
  rect(g, 130, D + 5, 4, F - D - 5, '#7d583a'); rect(g, 300, D + 5, 4, F - D - 5, '#7d583a');
  rect(g, 252, D + 5, 46, 10, '#94694a'); rect(g, 252, D + 5, 46, 1, '#7d583a'); rect(g, 272, D + 9, 6, 1, '#d6b98f');
}
function bookshelf(g, x, y, t) {
  const F = ROOM.floor;
  rect(g, x, y, 50, F - y, '#7a5639'); rect(g, x + 2, y + 2, 46, F - y - 4, '#5e412b');
  const cols = ['#c0533f', '#3f6f8f', '#d9a441', '#5f8a5a', '#8a5a8f', '#e0d6c2', '#2f4a6a', '#b86a3c', '#7fa3b8', '#d27d8f'];
  for (let s = 0; s < 4; s++) {
    const sy = y + 4 + s * 21;
    rect(g, x + 2, sy + 17, 46, 2, '#7a5639');
    let bx = x + 3;
    for (let k = 0; bx < x + 46; k++) {
      const bw = 2 + fl(hash(s, k) * 3), bh = 10 + fl(hash(k, s, 3) * 6);
      if (bx + bw > x + 47) break;
      if (hash(s, k, 9) > .88) { bx += bw + 2; continue; }
      const c = cols[fl(hash(k, s, 5) * cols.length)];
      rect(g, bx, sy + 17 - bh, bw, bh, c); rect(g, bx, sy + 17 - bh + 2, bw, 1, 'rgba(255,255,255,.25)');
      bx += bw;
    }
  }
  // 书架顶上的小盆栽
  rect(g, x + 32, y - 6, 8, 6, '#c96f4a'); rect(g, x + 32, y - 6, 8, 1, '#e08a62');
  [[x + 33, y - 10], [x + 36, y - 13], [x + 38, y - 9], [x + 31, y - 12]].forEach(([a, b]) => rect(g, a, b, 2, 4, '#5f9a5a'));
}
function curtain(g, x, y, w, h, t, side) {
  const c1 = '#8eaf98', c2 = '#77967f', c3 = '#a9c7b0';
  for (let i = 0; i < w; i++) {
    const k = (i + (side > 0 ? 1 : 0)) % 4;
    const sway = rd(Math.sin(t * 1.3 + i * .4) * .6);
    rect(g, x + i, y + sway, 1, h, k === 0 ? c2 : k === 2 ? c3 : c1);
  }
  rect(g, x, y + h - 2, w, 2, c2);
}
function ac(g, x, y, t, o) {
  rect(g, x, y, 44, 14, '#ece8e1'); rect(g, x, y + 12, 44, 2, '#cfc8bd'); rect(g, x + 2, y + 10, 40, 1, '#bdb5a8');
  rect(g, x + 30, y + 3, 10, 4, '#2a3032');
  const temp = o.acTemp;
  if (temp !== undefined) {
    const hot = temp > 22, col = hot ? '#ff8a4a' : '#7fd6ff';
    ptext(g, String(rd(temp)), x + 35, y + 3, col, { size: 10, align: 'c' });
  }
  // 出风：冷风是蓝色细线，热风是橙色波纹
  if (o.acWind) {
    const hot = o.acWind > 0, a = Math.abs(o.acWind), col = hot ? 'rgba(255,150,90,' : 'rgba(150,215,255,';
    for (let i = 0; i < 7; i++) {
      const ph = (t * 1.6 + i / 7) % 1, yy = y + 16 + ph * 40, xx = x + 4 + i * 6 + Math.sin(ph * 8 + i) * 3;
      g.fillStyle = col + (a * (1 - ph) * .8).toFixed(3) + ')';
      g.fillRect(rd(xx), rd(yy), 3, 1);
    }
  }
}
function bed(g, x, F) {
  rect(g, x, F - 22, 70, 18, '#e9e2d4'); rect(g, x, F - 22, 70, 2, '#f7f2e8');
  rect(g, x + 2, F - 26, 18, 6, '#f4efe4'); rect(g, x + 2, F - 26, 18, 1, '#ffffff');
  rect(g, x + 20, F - 24, 50, 8, '#7d93c4'); rect(g, x + 20, F - 24, 50, 1, '#97abd6'); dith(g, x + 22, F - 21, 46, 4, '#6d82b3');
  rect(g, x - 3, F - 34, 4, 34, '#6f5038'); rect(g, x, F - 4, 70, 4, '#6f5038');
}
/* 窗上的霜 / 雾：从窗边往中间长（amt 0–1）。每个像素有一个固定的"结霜阈值"，按 amt 分 24 级缓存成图。
   warm=true 时是暖白色的水雾 */
const _frost = new Map();
function frost(g, x, y, w, h, amt, t, warm = false) {
  if (amt <= 0.01) return;
  const q = Math.min(24, Math.ceil(amt * 24)), k = w + 'x' + h + ':' + q + (warm ? 'w' : 'c');
  let c = _frost.get(k);
  if (!c) {
    c = mk(w, h); const cg = c.getContext('2d'), id = cg.createImageData(w, h), A = q / 24;
    const col = warm ? [255, 244, 232] : [226, 242, 255];
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const dx = Math.min(i, w - 1 - i) / (w / 2), dy = Math.min(j, h - 1 - j) / (h / 2);
      const d = Math.min(1, Math.min(dx * .9, dy * 1.1) + .15 * Math.max(dx, dy));
      const n = n1(i * .23 + j * .07, 3) * .5 + n1(j * .29 - i * .05, 8) * .5;
      const cov = clamp(A * 2.0 - d * 1.0 + (n - .5) * .45);
      const lv = cov > .8 ? .82 : cov > .55 ? .62 : cov > .3 ? (((i + j) & 1) ? .5 : .25) : cov > .12 ? (((i * 3 + j) % 4 === 0) ? .45 : 0) : 0;
      const o = (j * w + i) * 4; id.data[o] = col[0]; id.data[o + 1] = col[1]; id.data[o + 2] = col[2]; id.data[o + 3] = lv * 255;
    }
    cg.putImageData(id, 0, 0); _frost.set(k, c);
  }
  g.drawImage(c, rd(x), rd(y));
}
/* 窗上的水珠往下流 */
function drips(g, x, y, w, h, t, amt) {
  for (let i = 0; i < 14; i++) {
    const xx = x + 4 + hash(i, 1) * (w - 8), sp = 6 + hash(i, 2) * 10, ph = hash(i, 3) * 10;
    const yy = y + ((t * sp + ph * 7) % (h + 10)) - 6;
    if (hash(i, 4) > amt) continue;
    for (let k = 0; k < 4; k++) px(g, xx, yy - k, `rgba(210,232,255,${(.7 - k * .15).toFixed(2)})`);
  }
}

/* ---------------- 桌上的东西 ---------------- */
/* 笔记本电脑（侧面）：x 是底座左端，屏幕朝左；glow 是屏幕亮度 */
function laptop(g, x, y, glow = 1) {
  rect(g, x, y - 2, 18, 2, '#b9bcc4'); rect(g, x, y - 1, 18, 1, '#8f939c');
  for (let k = 0; k < 13; k++) { rect(g, x + 17 + fl(k * .28), y - 3 - k, 2, 1, '#9fa3ad'); }
  if (glow > 0) for (let k = 0; k < 12; k++) px(g, x + 16 + fl(k * .28), y - 4 - k, mix('#3a4a66', '#bfe6ff', glow));
}
/* 台灯（侧面，灯头朝左下） */
function lamp(g, x, y, on = 1) {
  rect(g, x - 5, y - 2, 11, 2, '#3b3f47'); rect(g, x - 1, y - 18, 2, 16, '#4a4f58');
  line(g, x, y - 18, x - 10, y - 26, '#4a4f58'); line(g, x + 1, y - 18, x - 9, y - 26, '#4a4f58');
  rect(g, x - 18, y - 29, 10, 4, '#e0b04a'); rect(g, x - 17, y - 25, 8, 2, '#c9963a');
  if (on > 0) { rect(g, x - 16, y - 23, 6, 1, mix('#c9963a', '#fff4c8', on)); }
}
/* 马克杯，steam 冒热气 */
function mug(g, x, y, t, steam = 1, col = '#e8e1d4') {
  rect(g, x, y - 7, 6, 7, col); rect(g, x, y - 7, 6, 1, '#fffaf0'); rect(g, x + 6, y - 6, 2, 1, col); rect(g, x + 7, y - 6, 1, 4, col); rect(g, x + 6, y - 3, 2, 1, col);
  rect(g, x + 1, y - 6, 4, 1, '#8a5a34');
  if (steam > 0) for (let i = 0; i < 3; i++) {
    const ph = (t * .7 + i / 3) % 1, a = steam * Math.sin(ph * Math.PI) * .6;
    g.fillStyle = `rgba(255,255,255,${a.toFixed(3)})`;
    g.fillRect(rd(x + 2 + Math.sin(ph * 6 + i) * 1.5), rd(y - 9 - ph * 8), 1, 2);
  }
}
/* 花盆：stage 0 只有土 | 1 发芽 | 2 两片叶 | 3 花苞 | 4 开花（心形花）
   o.glowHeart：土里埋着的心透出的光（0–1） */
function pot(g, x, y, t, stage = 0, o = {}) {
  // 梯形陶盆：上宽下窄
  for (let j = 0; j < 10; j++) { const w = 13 - fl(j / 4); rect(g, x - w, y - 10 + j, 2 * w, 1, j < 1 ? '#ec9a6a' : j < 3 ? '#d97c4f' : '#c4683f'); }
  rect(g, x - 13, y - 13, 26, 3, '#d97c4f'); rect(g, x - 13, y - 13, 26, 1, '#f0a676'); rect(g, x - 13, y - 11, 26, 1, '#b85f3a');
  rect(g, x - 11, y - 9, 2, 8, '#ad5934');
  rect(g, x - 12, y - 14, 24, 1, '#4e3122'); dith(g, x - 11, y - 14, 22, 1, '#6b4530');
  if (o.glowHeart) { const a = o.glowHeart; g.save(); g.globalAlpha *= a; rect(g, x - 2, y - 15, 5, 1, '#ff8fb0'); px(g, x, y - 16, '#ffd0de'); g.restore(); }
  const sw = Math.sin(t * 1.5) * .6;
  if (stage >= 1) {
    const hgt = rd(lerp(2, 18, clamp((stage - 1) / 2.2)));
    for (let k = 0; k < hgt; k++) px(g, x + rd(Math.sin(k * .5 + t) * .4 * (k / 6) + sw * k / 10), y - 14 - k, '#5fa152');
    const top = y - 14 - hgt;
    if (stage >= 1.5) { rect(g, x - 3, y - 17, 3, 2, '#79b866'); rect(g, x + 1, y - 19, 3, 2, '#79b866'); }
    if (stage >= 2.4) { rect(g, x - 5, top + 7, 4, 2, '#79b866'); rect(g, x + 2, top + 5, 4, 2, '#6aa85a'); }
    if (stage >= 3 && stage < 4) { const b = clamp(stage - 3); rect(g, x - 1, top - 2, 3, 3, mix('#7fb36a', '#f08aa8', b)); px(g, x, top - 3, mix('#7fb36a', '#ff9dbb', b)); }
    if (stage >= 4) {
      const b = clamp(stage - 4), cx0 = x - 3, cy0 = top - 6;
      const HP = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
      HP.forEach((r, j) => { for (let i = 0; i < 7; i++) if (r[i] === '#') px(g, cx0 + i, cy0 + j, j < 2 && i % 3 === 1 ? '#ffb3c8' : '#f2648c'); });
      px(g, cx0 + 1, cy0 + 1, '#ffe0ea');
    }
  }
  if (o.sign) chalkSign(g, x + 15, y, o.sign, t);
}
/* 插在花盆边的小黑板，写着歌词（粉笔字逐字出现） */
function chalkSign(g, x, y, s, t) {
  const w = s.w || 76, h = s.lines.length * 13 + 5;
  rect(g, x + 4, y - 4, 2, 4, '#7a5639');
  rect(g, x, y - h - 4, w, h, '#8a6644'); rect(g, x + 1, y - h - 3, w - 2, h - 2, '#2f3b36'); dith(g, x + 2, y - h - 2, w - 4, h - 4, '#35423c');
  s.lines.forEach((ln, i) => ptext(g, ln.s, x + 3, y - h - 1 + i * 13, '#f2efe6', { times: ln.times, t, pop: .15, gap: 0 }));
}

/* ---------------- 路人 ---------------- */
function npc(g, x, y, kind, o = {}) {
  const pals = {
    guard: { K: '#1f2333', k: '#2c3247', Y: '#33405e', y: '#26304a', N: '#23293b', n: '#1a1f2e', W: '#d9dde6' },
    clerk: { K: '#3b2a24', k: '#5a4033', Y: '#3f8a6a', y: '#2f6c52', N: '#2d2a33', n: '#221f27', W: '#f1ede4' },
    man: { K: '#2a2622', k: '#433b33', Y: '#6c86a8', y: '#536b8b', N: '#4b4d55', n: '#393b42', W: '#e6e6e6' },
    old: { K: '#b8b4ae', k: '#d6d2cc', Y: '#8a5a4a', y: '#6e4639', N: '#55504a', n: '#45403a', W: '#efe9df' },
    kid: { K: '#2f2420', k: '#4a3a32', Y: '#e05a4a', y: '#b84336', N: '#3a5a8a', n: '#2c4670', W: '#fff' },
  };
  girl(g, x, y, o.pose || 'stand', Object.assign({}, o, { pal: pals[kind], palKey: kind }));
  if (kind === 'guard') { rect(g, x - 7 + (o.flip ? 0 : 0), y - 35, 14, 3, '#1b2133'); rect(g, x - 2, y - 34, 4, 1, '#d8b44a'); }
}

/* 椅子（侧面，靠背在左） */
function chair(g, x, F = ROOM.floor) {
  rect(g, x - 9, F - 14, 18, 3, '#6a4f3a'); rect(g, x - 9, F - 14, 18, 1, '#82634a');
  rect(g, x - 10, F - 38, 3, 27, '#6a4f3a'); rect(g, x - 10, F - 38, 3, 1, '#82634a');
  rect(g, x - 8, F - 11, 2, 11, '#563f2e'); rect(g, x + 6, F - 11, 2, 11, '#563f2e');
}
/* 牛皮纸袋（套在 Clawd 头上装神秘），x,y 是袋子底边中心 */
function paperBag(g, x, y, t) {
  rect(g, x - 14, y - 19, 28, 19, '#c99c63'); rect(g, x - 14, y - 19, 28, 2, '#ddb57c');
  for (let i = 0; i < 28; i += 4) px(g, x - 14 + i, y - 19, '#a87c45');
  rect(g, x - 14, y - 19, 1, 19, '#a87c45'); rect(g, x + 13, y - 19, 1, 19, '#a87c45');
  ptext(g, '?', x, y - 17, '#5a3a1c', { align: 'c' });
  rect(g, x - 8, y - 6, 3, 2, '#2a1a10'); rect(g, x + 5, y - 6, 3, 2, '#2a1a10');
}
