'use strict';
/* world.js：共用的场景元素（都画在像素缓冲里，坐标是缓冲像素）。
   夜空、城市天际线、楼的立面和窗户、她的房间、纸箱、栀子花树、山坡、草地、云、长椅、路灯。 */

/* ---------------- 夜空 ---------------- */
const SKY_NIGHT = [[0, '#04051A'], [.45, '#0B1238'], [.8, '#1A1D52'], [1, '#2B2460']];
const SKY_CITY = [[0, '#060A24'], [.5, '#111A44'], [.85, '#2A2A5E'], [1, '#4A3466']];   // 城市上空：底下被灯光照得发紫
/* 一块夜空（stars 种子、密度），可以带银河 */
function nightSkyBlock(g, t, w, h, o = {}) {
  psky(g, w, h, o.stops || SKY_NIGHT, o.y0 || 0);
  if (o.milky) pspr(g, milkyWay(w, h, o.seed || 11, ...o.milky), 0, o.y0 || 0);
  g.save(); g.translate(0, o.y0 || 0);
  starfield(g, t, w, h, { n: o.n || 160, seed: o.seed || 11, tw: o.tw ?? .45, y1: o.y1 ?? h, big: o.big ?? .05, appear: o.appear });
  g.restore();
}
/* 月牙：圆盘减去往左上错开的一个圆，亮的一面朝右下；gl 光层上画一圈光晕 */
function moon(g, gl, x, y, r, off = .5, col = '#FFF4D6') {
  const ix = x - r * off, iy = y - r * off * .4, ir = r * .95;
  g.fillStyle = col;
  for (let dy = -Math.floor(r); dy <= Math.floor(r); dy++) {
    const ox = Math.sqrt(Math.max(0, r * r - dy * dy)), yy = y + dy, idy = yy - iy;
    let a = x - ox, b = x + ox;
    if (Math.abs(idy) < ir) { const iw = Math.sqrt(ir * ir - idy * idy); a = Math.max(a, ix + iw); }
    if (b - a >= .5) g.fillRect(ri(a), ri(yy), Math.max(1, ri(b - a)), 1);
  }
  if (gl) pdisc(gl, x, y, r + 2, rgba('#FFF0C0', .45));
}

/* ---------------- 城市 ---------------- */
/* 一排楼的剪影（缓存）：每栋楼宽高随机，亮着的窗户按 lit 比例；win 窗户的颜色表 */
function skyline(w, h, seed, col, top, lit = .08, o = {}) {
  return cached(`skyline|${w}|${h}|${seed}|${col}|${top}|${lit}|${o.wy || 0}`, w, h, g => {
    const r = R(seed); let x = -2;
    const wins = o.wins || ['#FFD27A', '#FFC060', '#9FC4FF', '#FFE8B0'];
    while (x < w) {
      const bw = (o.minW || 8) + ri(r() * (o.varW || 18)), bh = ri(top * (.35 + r() * .65));
      prect(g, x, h - bh, bw, bh, col);
      if (r() < .25) prect(g, x + ri(bw / 2) - 1, h - bh - 3 - ri(r() * 5), 1, 5, col);           // 天线
      if (r() < .15) { prect(g, x + 1, h - bh - 2, bw - 2, 2, col); }                             // 楼顶的水箱
      const wy = o.wy || 3;
      for (let yy = h - bh + 2; yy < h - 1; yy += wy) for (let xx = x + 1; xx < x + bw - 1; xx += 2)
        if (r() < lit) prect(g, xx, yy, 1, 1, wins[Math.floor(r() * wins.length)]);
      x += bw + ri(r() * 2);
    }
  });
}
/* 楼的立面：一栋高楼（x0 宽 bw，从 top 到 bottom），一层层窗户；target 是那扇亮着的窗（第几层第几列） */
function facade(g, gl, t, x0, bw, top, bottom, o = {}) {
  const wall = o.wall || '#1C2148', wallLt = shade(wall, 1.12), wallDk = shade(wall, .8);
  prect(g, x0, top, bw, bottom - top, wall);
  prect(g, x0, top, 2, bottom - top, wallLt); prect(g, x0 + bw - 2, top, 2, bottom - top, wallDk);
  prect(g, x0 - 2, top - 3, bw + 4, 3, wallDk);                                                 // 楼顶的檐
  const fh = o.floorH || 22, cols = o.cols || 4, ww = o.winW || 12, wh = o.winH || 13, gap = (bw - cols * ww) / (cols + 1);
  let fi = 0;
  for (let y = top + 8; y + wh < bottom; y += fh, fi++) {
    prect(g, x0 + 2, y + wh + 3, bw - 4, 1, wallDk);                                             // 每层的楼板线
    for (let c = 0; c < cols; c++) {
      const x = ri(x0 + gap + c * (ww + gap)), isT = o.target && o.target[0] === fi && o.target[1] === c;
      const on = isT || hash(fi, c, o.seed || 3) < (o.lit ?? .35);
      const warm = hash(c, fi, 7) < .7;
      const col = isT ? '#FFD890' : on ? (warm ? '#E8B060' : '#7FA0D8') : '#11152E';
      prect(g, x, y, ww, wh, col);
      if (on) {
        prect(g, x, y, ww, 1, shade(col, .8)); prect(g, x + ri(ww / 2), y, 1, wh, shade(col, .85));   // 窗框
        if (gl) prect(gl, x, y, ww, wh, rgba(col, isT ? .9 : .35));
        if (!isT && hash(c, fi, 9) < .4) prect(g, x + 2, y + wh - 5, 3, 5, shade(col, .6));          // 窗帘、屋里的人影
      } else prect(g, x + 1, y + 1, 2, 2, '#1A2048');
      prect(g, x - 1, y + wh, ww + 2, 1, wallLt);                                                // 窗台
      if (isT && o.onTarget) o.onTarget(x, y, ww, wh);
    }
  }
}

/* ---------------- 她的房间（现在，夜里） ---------------- */
/* 墙、地板、窗（外面是城市的夜景）、落地灯；w×h 缓冲，floorY 地板的线 */
function roomBase(g, gl, t, w, h, floorY, o = {}) {
  const wall = o.wall || '#2A2A4E', wallDk = shade(wall, .82);
  prect(g, 0, 0, w, floorY, wall);
  for (let x = 0; x < w; x += 7) prect(g, x, 0, 1, floorY, shade(wall, .95));                     // 墙纸的竖纹
  prect(g, 0, floorY - 3, w, 3, wallDk);                                                        // 踢脚线
  prect(g, 0, floorY, w, h - floorY, o.floor || '#3A2E3C');
  for (let y = floorY + 4, k = 0; y < h; y += 5 + k, k++) prect(g, 0, y, w, 1, shade(o.floor || '#3A2E3C', .85));   // 地板缝，近大远小
  if (o.win) {                                                                                 // 窗：外面是城市
    const [wx, wy, ww, wh] = o.win;
    const sk = pbuf('roomWinTmp', ww, wh); psky(sk, ww, wh, SKY_CITY);
    starfield(sk, t, ww, wh * .5, { n: 14, seed: 41, tw: .5 });
    pspr(sk, skyline(ww, wh, 51, '#141838', wh * .55, .12), 0, 0);
    pspr(sk, skyline(ww, wh, 52, '#0E1230', wh * .35, .18), 0, 0);
    if (o.snow) snow(sk, t, ww, wh, { n: 30, v: 9, seed: 43, col: '#E8ECF8' });
    pspr(g, BUF.roomWinTmp, wx, wy);
    prect(g, wx - 2, wy - 2, ww + 4, 2, '#4A4668'); prect(g, wx - 2, wy + wh, ww + 4, 3, '#4A4668');
    prect(g, wx - 2, wy, 2, wh, '#4A4668'); prect(g, wx + ww, wy, 2, wh, '#4A4668'); prect(g, wx + ri(ww / 2) - 1, wy, 2, wh, '#4A4668');
    prect(g, wx - 3, wy + wh + 1, ww + 6, 1, '#5A5678');
    if (gl) { gl.globalAlpha = .25; pspr(gl, BUF.roomWinTmp, wx, wy); gl.globalAlpha = 1; }
    // 窗外的光斜斜地落在地板上
    g.save(); g.globalCompositeOperation = 'screen'; g.globalAlpha = .12;
    ppoly(g, [[wx, wy + wh], [wx + ww, wy + wh], [wx + ww + 18, h], [wx + 10, h]], '#8FA8E8'); g.restore();
  }
}
/* 纸箱（开着盖），(x, 地面 y)，宽 bw 高 bh */
function cardboardBox(g, x, gy, bw, bh, open = true) {
  const c = '#B88A58', dk = '#8E6640', lt = '#D2A672';
  prect(g, x, gy - bh, bw, bh, c); prect(g, x, gy - bh, bw, 1, dk); prect(g, x + bw - 2, gy - bh, 2, bh, dk);
  prect(g, x + ri(bw / 2), gy - bh, 1, ri(bh * .5), dk);                                         // 胶带
  prect(g, x + ri(bw / 2) - 2, gy - bh, 5, 2, '#D8C49A');
  if (open) {
    ppoly(g, [[x, gy - bh], [x - 5, gy - bh - 6], [x + 3, gy - bh - 7], [x + 8, gy - bh]], lt);
    ppoly(g, [[x + bw, gy - bh], [x + bw + 4, gy - bh - 7], [x + bw - 4, gy - bh - 8], [x + bw - 9, gy - bh]], dk);
    prect(g, x + 1, gy - bh + 1, bw - 3, 2, '#5E4430');                                          // 箱子里面的暗处
  }
}

/* ---------------- 栀子花树 ---------------- */
/* 一棵开满栀子花的树：(x 树干中线, gy 地面), r 树冠半径；night 夜里（花发一点光）；sway 风 */
function gardeniaTree(g, gl, t, x, gy, r, o = {}) {
  const night = !!o.night, sway = o.sway ?? 1, seed = o.seed || 21;
  const trunk = night ? '#2A2030' : '#6A4A34', trunkDk = night ? '#1E1626' : '#4E3424';
  const leafs = night ? ['#0E2A2A', '#163A36', '#1E4A40'] : ['#2E6A3E', '#3E8A4C', '#5AAE5E'];
  // 树干、两根枝
  prect(g, x - 2, gy - r * .9, 4, r * .9, trunk); prect(g, x + 1, gy - r * .9, 1, r * .9, trunkDk);
  pline(g, x, gy - r * .6, x - r * .45, gy - r * 1.1, trunk); pline(g, x + 1, gy - r * .7, x + r * .4, gy - r * 1.15, trunk);
  prect(g, x - 4, gy - 1, 9, 1, trunkDk);
  // 树冠：一团团叶子（深 → 浅三层）
  const cy = gy - r * 1.25, r0 = R(seed);
  const blobs = [];
  for (let i = 0; i < 14; i++) { const a = r0() * TAU, d = r0() * r * .75; blobs.push([x + Math.cos(a) * d * 1.15, cy + Math.sin(a) * d * .75, r * (.35 + r0() * .25)]); }
  const sw = Math.sin(t * 1.3) * sway * .6;
  leafs.forEach((lc, li) => blobs.forEach(([bx, by, br], i) => {
    const dx = sw * (1 - (by - (cy - r)) / (2 * r)), off = li * 1.2;
    pdisc(g, bx + dx - off * .3, by - off, br - li * 1.6, lc);
  }));
  // 花：白色小点，夜里在光层上也画一点
  const r1 = R(seed + 5);
  for (let i = 0; i < (o.flowers || 26); i++) {
    const a = r1() * TAU, d = Math.sqrt(r1()) * r * .95, fx = x + Math.cos(a) * d * 1.15 + sw, fy = cy + Math.sin(a) * d * .7 - 1;
    const big = r1() < .35;
    if (big) pspr(g, gardenia(0), fx - 1, fy - 1); else pdot(g, fx, fy, night ? '#E8F0F0' : '#FFFFFF');
    if (gl && night) { gl.globalAlpha = .5; prect(gl, fx - 1, fy - 1, 3, 3, '#F0FFF4'); gl.globalAlpha = 1; }
  }
  return { cy, top: cy - r };
}
/* 一丛栀子花灌木（白天）：(x 左, gy 地面) 宽 bw 高 bh */
function gardeniaBush(g, t, x, gy, bw, bh, o = {}) {
  const seed = o.seed || 31, r = R(seed);
  const leafs = o.leafs || ['#2C6A3C', '#3C8848', '#57A85A', '#7CC46C'];
  leafs.forEach((lc, li) => {
    const rr = R(seed + li);
    for (let i = 0; i < bw / 3; i++) {
      const bx = x + rr() * bw, by = gy - rr() * bh * (1 - li * .12), br = 3 + rr() * 5 - li;
      pell(g, bx, by, br * 1.2, br, lc);
    }
  });
  for (let i = 0; i < (o.flowers || bw / 4); i++) {
    const fx = x + 3 + r() * (bw - 6), fy = gy - 3 - r() * (bh - 4);
    pspr(g, gardenia(r() < .4 ? 1 : 0), fx - 2, fy - 2);
  }
}

/* ---------------- 地形、天空 ---------------- */
/* 夏天白天的天：蓝到浅蓝，几朵像素云（缓存） */
const SKY_DAY = [[0, '#5BB4EC'], [.6, '#8FD0F4'], [1, '#C8ECFA']];
function pixelCloud(g, x, y, s, col = '#FFFFFF', sh = '#D8EEFA') {
  pell(g, x, y + 2 * s, 9 * s, 3 * s, sh);
  pdisc(g, x - 4 * s, y + s, 4 * s, col); pdisc(g, x + 2 * s, y - s, 5 * s, col); pdisc(g, x + 7 * s, y + s, 3.5 * s, col);
  pell(g, x, y + 2 * s, 9 * s, 2.5 * s, col);
}
/* 山坡：从左到右的一条起伏的坡（pts 控制点 [x, y]），填到底；草的颜色 col，边上一圈亮色 */
function hillShape(g, w, h, pts, col, edge) {
  for (let x = 0; x < w; x++) {
    let y = pts[pts.length - 1][1];
    for (let i = 0; i < pts.length - 1; i++) if (x >= pts[i][0] && x <= pts[i + 1][0]) { const u = (x - pts[i][0]) / Math.max(1, pts[i + 1][0] - pts[i][0]); y = lerp(pts[i][1], pts[i + 1][1], E.sine(u)); break; }
    prect(g, x, y, 1, h - y, col); if (edge) pdot(g, x, y, edge);
  }
}
/* 长椅（侧前方看）：(x 左, gy 地面) 宽 bw */
function bench(g, x, gy, bw, o = {}) {
  const wood = o.wood || '#B5763E', dk = shade(wood, .75), metal = o.metal || '#3E4452';
  prect(g, x, gy - 9, bw, 2, wood); prect(g, x, gy - 7, bw, 1, dk);                                // 座面
  prect(g, x + 1, gy - 15, bw - 2, 2, wood); prect(g, x + 1, gy - 12, bw - 2, 1, wood); prect(g, x + 1, gy - 13, bw - 2, 1, dk);   // 靠背
  [x + 2, x + bw - 4].forEach(lx => { prect(g, lx, gy - 15, 2, 15, metal); prect(g, lx - 1, gy - 1, 4, 1, metal); });
}
/* 路灯（正面）：(x, 地面 y)，高 hgt；on 0..1 */
function lampPost(g, gl, x, gy, hgt, on = 1, col = '#FFD27A') {
  prect(g, x, gy - hgt, 2, hgt, '#2B3354'); prect(g, x - 1, gy - 2, 4, 2, '#2B3354');
  prect(g, x - 3, gy - hgt - 3, 8, 3, '#3A4468'); prect(g, x - 2, gy - hgt, 6, 1, mix('#55607F', '#FFF4D0', on));
  if (on > 0) { pcone(g, x + 1, gy - hgt + 1, gy, 5, hgt * .9, col, .22 * on, .06 * on); if (gl) { prect(gl, x - 3, gy - hgt - 2, 8, 3, rgba(col, on)); pell(gl, x + 1, gy, hgt * .3, 2, rgba(col, .25 * on)); } }
}

/* ---------------- 她的房间（现在）：正在搬家，几个纸箱，墙上摘了相框留下一块浅色的印子 ----------------
   缓冲 240×135，地板 y 96；o：{lamp 0..1 落地灯, box 开着的纸箱, skirt 箱子里露出蓝色百褶裙的一角} */
const HR = { w: 240, h: 135, floorY: 96 };
function herRoom(b, gl, t, o = {}) {
  roomBase(b, gl, t, HR.w, HR.h, HR.floorY, { win: [16, 18, 70, 46], snow: o.snow });
  prect(b, 112, 30, 22, 16, shade('#2A2A4E', 1.12)); pdot(b, 122, 28, '#8A86A8');            // 摘掉相框的印子、钉子
  const lamp = o.lamp ?? 1;                                                                // 落地灯
  prect(b, 196, 40, 2, 56, '#3A3448'); prect(b, 192, 95, 10, 2, '#3A3448');
  ppoly(b, [[188, 40], [206, 40], [202, 30], [192, 30]], mix('#6A6070', '#E8C890', lamp));
  if (lamp > 0) { pcone(b, 197, 41, 99, 16, 64, '#FFC870', .17 * lamp, .04 * lamp); if (gl) prect(gl, 190, 30, 14, 10, rgba('#FFD890', .9 * lamp)); }
  cardboardBox(b, 168, 96, 26, 14, false); cardboardBox(b, 172, 82, 20, 12, false);           // 封好的箱子摞着
  prect(b, 36, 92, 18, 4, '#6A4C8A'); prect(b, 38, 89, 15, 3, '#4C7A9A'); prect(b, 37, 87, 12, 2, '#A85A4A');   // 一摞书
  if (o.box !== false) {
    cardboardBox(b, 84, 100, 30, 18);
    if (o.skirt !== false) { prect(b, 90, 81, 9, 3, SKIRT.base); prect(b, 92, 81, 1, 3, SKIRT.lt); prect(b, 95, 81, 1, 3, SKIRT.lt); prect(b, 99, 82, 6, 2, '#F0EEE6'); }   // 蓝裙子、白衬衫的一角
  }
}

/* ---------------- 夏天白天（回忆里的游戏世界） ---------------- */
const SUM = { sky: [[0, '#4FAAE8'], [.6, '#8CCEF4'], [1, '#C8ECFA']], grass: '#62BC62', grassDk: '#4E9E52', grassLt: '#86D27A', path: '#E6D6AE' };
/* 一片叶子：尖头椭圆，按角度转，带一道叶脉 */
function leaf(g, x, y, len, wid, ang, col, vein) {
  const pts = [], n = 10, c = Math.cos(ang), s = Math.sin(ang);
  for (let i = 0; i <= n; i++) { const u = i / n, px = (u - .5) * len, py = Math.sin(u * PI) * wid / 2; pts.push([x + px * c - py * s, y + px * s + py * c]); }
  for (let i = n; i >= 0; i--) { const u = i / n, px = (u - .5) * len, py = -Math.sin(u * PI) * wid / 2; pts.push([x + px * c - py * s, y + px * s + py * c]); }
  ppoly(g, pts, col);
  if (vein) pline(g, x - len * .4 * c, y - len * .4 * s, x + len * .4 * c, y + len * .4 * s, vein);
}
/* 教学楼（正面）：(x 左, gy 地面) 宽 bw 层数 floors；白墙、蓝窗、楼顶的栏杆 */
function schoolBuilding(g, x, gy, bw, floors, o = {}) {
  const fh = 18, top = gy - floors * fh - 6, wall = o.wall || '#F2E8D4', wd = shade(wall, .88);
  prect(g, x, top, bw, gy - top, wall);
  for (let yy = top + 6; yy < gy; yy += fh) prect(g, x, yy, bw, 2, wd);                         // 每层的腰线
  prect(g, x - 2, top - 3, bw + 4, 3, '#D8CCB4');                                               // 楼顶
  for (let xx = x; xx < x + bw; xx += 4) prect(g, xx, top - 7, 1, 4, '#C8BCA4'); prect(g, x, top - 7, bw, 1, '#C8BCA4');   // 栏杆
  for (let f = 0; f < floors; f++) for (let xx = x + 5; xx + 12 < x + bw; xx += 17) {
    const yy = top + 10 + f * fh;
    prect(g, xx, yy, 12, 10, '#E2D8C4'); prect(g, xx + 1, yy + 1, 10, 8, o.win || '#7FB8E0');
    prect(g, xx + 1, yy + 1, 10, 2, shade(o.win || '#7FB8E0', 1.25)); prect(g, xx + 6, yy + 1, 1, 8, '#E2D8C4');
  }
  if (o.clock) { pdisc(g, x + bw / 2, top + 2, 5, '#FFFFFF'); pring(g, x + bw / 2, top + 2, 5, 5, '#8A7A60'); pline(g, x + bw / 2, top + 2, x + bw / 2, top - 1, '#3A3A3A'); pline(g, x + bw / 2, top + 2, x + bw / 2 + 2, top + 2, '#3A3A3A'); }
}
/* 一片草地：底色 + 草叶的小竖线 + 阳光斑点 */
function grassField(g, t, x0, y0, w, h, seed = 5, o = {}) {
  prect(g, x0, y0, w, h, o.col || SUM.grass);
  const r = R(seed);
  for (let i = 0; i < w * h / 18; i++) { const x = x0 + r() * w, y = y0 + 1 + r() * (h - 1); pdot(g, x, y, r() < .5 ? (o.dk || SUM.grassDk) : (o.lt || SUM.grassLt)); if (r() < .3) pdot(g, x, y - 1, o.dk || SUM.grassDk); }
}
/* 树荫里漏下来的光斑（会慢慢晃） */
function sunDapples(g, t, x0, y0, w, h, seed = 9, col = 'rgba(255,250,210,.22)') {
  for (let i = 0; i < 10; i++) { const x = x0 + hash(i, seed) * w + Math.sin(t * .7 + i) * 2, y = y0 + hash(i, seed + 1) * h; pell(g, x, y, 4 + hash(i, seed + 2) * 4, 1.5, col); }
}
/* 飘的花瓣：在区域里从上往下落，横着飘 */
function driftPetals(g, gl, t, n, x0, y0, w, h, seed = 7, o = {}) {
  for (let i = 0; i < n; i++) {
    const sp = (o.v || 10) * (.7 + .6 * hash(i, seed, 1)), span = h + 10;
    const y = y0 + mod(t * sp + hash(i, seed, 2) * span, span) - 5;
    const x = x0 + mod(hash(i, seed, 3) * w + Math.sin(t * 1.3 + i) * 5 + (o.drift ?? 8) * t, w);
    petal(g, x, y, t * 3 + i, o.col || '#FFFFFF');
    if (gl) { gl.globalAlpha = .3; pdot(gl, x, y, '#FFFFFF'); gl.globalAlpha = 1; }
  }
}
