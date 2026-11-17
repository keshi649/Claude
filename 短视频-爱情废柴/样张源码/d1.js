'use strict';
/* 方向 1：雪花玻璃球里的像素小镇。1a 开头被摇晃（球外），1b 主歌的街（球里），1c 副歌（球里往外看，"你"的脸在天上） */
const FRAMES = {};
const WARM = '#FFD27A', LAV = '#8FA8F0', PINK = '#F08AB0', BLUE = '#5AA0E8', GRN = '#6CC58A', YEL = '#F2C94C', HAT = '#1F7A6B';

/* ---------- 一间铺子 ---------- */
function shop(g, G, x, w, h, gy, o) {
  const y = gy - h, wall = o.wall, r = rng(o.seed || x + 7), frame = dk(wall, .5), rc = o.roof || '#5A3A4A', rh = o.rh || 14, sl = o.slope ?? .9;
  R(g, x, y, w, h, wall);
  for (let i = 0; i < w * h / 22; i++) { const bx = x + fl(r() * (w - 4)), by = y + fl(r() * (h - 2)); R(g, bx, by, 3, 1, r() < .5 ? dk(wall, .12) : lt(wall, .1)); }
  R(g, x, y, 1, h, lt(wall, .15)); R(g, x + w - 2, y, 2, h, dk(wall, .25));
  const nw = o.nw || 2, ww = 10, wh = 13, uy = y + 9;
  for (let i = 0; i < nw; i++) {
    const wx = x + fl(w * (i + 1) / (nw + 1)) - ww / 2, lit = o.lit ? o.lit[i] : r() < .7;
    R(g, wx - 1, uy - 1, ww + 2, wh + 2, frame); R(g, wx, uy, ww, wh, lit ? WARM : '#1C2A55');
    if (lit) {
      R(g, wx, uy, ww, 3, lt(WARM, .45)); R(g, wx, uy, 2, wh, o.curt || '#C8553D'); R(g, wx + ww - 2, uy, 2, wh, o.curt || '#C8553D');
      if (G) R(G, wx, uy, ww, wh, '#A86A20');
      if (o.sil && o.sil[i]) { R(g, wx + 3, uy + 7, 4, 4, '#5A3020'); R(g, wx + 2, uy + 9, 6, 2, '#5A3020'); }
    } else { R(g, wx + 1, uy + 1, 3, 2, '#31457E'); R(g, wx + 5, uy + 4, 2, 1, '#31457E'); }
    R(g, wx + 4, uy, 1, wh, frame); R(g, wx, uy + 6, ww, 1, frame);
    R(g, wx - 2, uy + wh + 1, ww + 4, 2, dk(wall, .3)); R(g, wx - 2, uy + wh, ww + 4, 1, '#F4F8FF');
  }
  for (let j = 0; j < rh; j++) { const ins = fl((rh - 1 - j) * sl); R(g, x - 3 + ins, y - rh + j, w + 6 - 2 * ins, 1, j % 3 === 2 ? dk(rc, .22) : rc); }
  for (let j = 0; j < 5; j++) { const ins = fl((rh - 1 - j) * sl); R(g, x - 4 + ins, y - rh + j - 1, w + 8 - 2 * ins, 1, j < 3 ? '#FFFFFF' : '#D5E2F8'); }
  if (o.chim !== false) {
    const cx = x + fl(w * (o.chimX ?? .72)); R(g, cx, y - rh - 6, 7, 11, dk(wall, .3)); R(g, cx + 5, y - rh - 6, 2, 11, dk(wall, .45)); R(g, cx - 1, y - rh - 8, 9, 2, '#FFFFFF');
    for (let k = 0; k < 5; k++) disc(g, cx + 4 + k * 3 + (k * k) * .4, y - rh - 13 - k * 6, 2 + k * .9, '#B9C4E6', .4 - .06 * k);
  }
  R(g, x - 4, y - 2, w + 8, 3, '#F4F8FF'); R(g, x - 4, y + 1, w + 8, 1, '#BFD0EE');
  for (let i = x - 3; i < x + w + 3; i++) if (r() < .35) R(g, i, y + 1, 1, 1 + fl(r() * 4), '#E6F0FF');
  lights(g, G, x - 3, y + 4, x + w + 3, y + 4, 2, 5, o.seed || 1);
  const sy = gy - 44, sb = o.signBg || '#2A1E2E', sc = o.signCol || '#FFE29A';
  R(g, x + 3, sy, w - 6, 14, sb); R(g, x + 3, sy, w - 6, 1, lt(sb, .3)); R(g, x + 3, sy + 13, w - 6, 1, dk(sb, .4));
  ptext(g, o.sign, x + w / 2, sy + 1, sc, { align: 'c' }); if (G) ptext(G, o.sign, x + w / 2, sy + 1, dk(sc, .35), { align: 'c' });
  let fy = sy + 16;
  if (o.awn) {
    for (let i = 0; i < w - 2; i++) { const c = (fl(i / 5) % 2) ? o.awn[0] : o.awn[1]; R(g, x + 1 + i, fy, 1, 5, c); if (i % 5 !== 0) R(g, x + 1 + i, fy + 5, 1, (i % 5 === 2) ? 2 : 1, dk(c, .15)); }
    R(g, x, fy - 1, w, 1, '#FFFFFF'); R(g, x + 2, fy - 2, w - 6, 1, '#FFFFFF'); fy += 8;
  }
  const fh = gy - fy - 4, dw = 13, dx = o.doorL ? x + 5 : x + w - dw - 5, wx = o.doorL ? x + dw + 10 : x + 5, wd = w - dw - 15;
  R(g, wx - 1, fy - 1, wd + 2, fh + 2, frame); R(g, wx, fy, wd, fh, o.winCol || WARM); R(g, wx, fy, wd, 3, lt(o.winCol || WARM, .45));
  if (G) R(G, wx, fy, wd, fh, '#B87A2A');
  if (o.win) o.win(g, wx, fy, wd, fh, G);
  for (let i = 1; i < (o.panes || 3); i++) R(g, wx + fl(wd * i / (o.panes || 3)), fy, 1, fh, frame);
  R(g, wx - 2, fy + fh + 1, wd + 4, 2, dk(wall, .35)); R(g, wx - 2, fy + fh, wd + 4, 1, '#FFFFFF');
  const dc = o.door || '#7A3B2E';
  R(g, dx - 1, fy - 3, dw + 2, gy - fy + 3, frame); R(g, dx, fy - 2, dw, gy - fy + 2, dc); R(g, dx, fy - 2, 1, gy - fy + 2, lt(dc, .2));
  R(g, dx + 2, fy, dw - 4, 7, WARM); R(g, dx + 6, fy, 1, 7, frame); if (G) R(G, dx + 2, fy, dw - 4, 7, '#9A6420');
  disc(g, dx + dw / 2, fy + 13, 3.6, '#2E7D4F'); disc(g, dx + dw / 2, fy + 13, 1.6, dc); R(g, dx + fl(dw / 2) - 1, fy + 15, 2, 2, '#E0423A'); R(g, dx + 3, fy + 11, 1, 1, '#FFD54A'); R(g, dx + 9, fy + 12, 1, 1, '#FF6A6A');
  R(g, dx + dw - 3, fy + 19, 1, 2, '#FFD54A'); R(g, dx - 2, gy - 2, dw + 4, 2, '#B9C6E0'); R(g, dx - 2, gy - 3, dw + 4, 1, '#FFFFFF');
}
/* 橱窗里的东西 */
const WIN = {
  bread(g, x, y, w, h) { R(g, x, y + fl(h / 2), w, 1, '#8A5A2A'); for (let i = 0; i < 4; i++) { ell(g, x + 6 + i * (w - 10) / 3.4, y + fl(h / 2) - 3, 4, 2.6, i % 2 ? '#B8742E' : '#D09040'); R(g, x + 4 + fl(i * (w - 10) / 3.4), y + fl(h / 2) - 5, 3, 1, '#F0C070'); } for (let i = 0; i < 3; i++) { R(g, x + 5 + i * 13, y + h - 7, 8, 7, i === 1 ? '#F4D6DC' : '#E8C08A'); R(g, x + 5 + i * 13, y + h - 8, 8, 2, '#FFFFFF'); R(g, x + 8 + i * 13, y + h - 10, 2, 2, '#E0423A'); } },
  globes(g, x, y, w, h) { R(g, x, y + fl(h / 2), w, 1, '#8A5A2A'); for (let i = 0; i < 3; i++) { const cx = x + 8 + i * (w - 16) / 2, cy = y + h - 9; disc(g, cx, cy, 5, '#3A5AA8'); disc(g, cx, cy, 4, '#6E9AE8'); R(g, cx - 2, cy - 3, 2, 1, '#FFFFFF'); R(g, cx - 1, cy + 1, 2, 2, [ORANGE, '#2E7D4F', '#FFFFFF'][i]); R(g, cx - 4, cy + 4, 8, 3, '#7A4A2A'); } for (let i = 0; i < 2; i++) { const bx = x + 9 + i * 22, by = y + fl(h / 2) - 8; R(g, bx, by + 2, 7, 6, '#B07A48'); R(g, bx + 1, by, 2, 2, '#B07A48'); R(g, bx + 4, by, 2, 2, '#B07A48'); R(g, bx + 2, by + 4, 1, 1, INK); R(g, bx + 4, by + 4, 1, 1, INK); } },
  records(g, x, y, w, h) { for (let i = 0; i < 3; i++) { const cx = x + 8 + i * (w - 16) / 2, cy = y + 9 + (i % 2) * 2; disc(g, cx, cy, 6, '#1B1420'); disc(g, cx, cy, 2, ['#E0423A', '#5AB8FF', '#FFD54A'][i]); R(g, cx - 4, cy - 4, 2, 1, '#56485C'); } R(g, x + 4, y + h - 16, 3, 16, '#8A4A2A'); ell(g, x + 6, y + h - 6, 5, 5, '#C8742E'); disc(g, x + 6, y + h - 6, 1.5, '#2A1810'); R(g, x + w - 16, y + h - 12, 12, 12, '#3A2A3E'); disc(g, x + w - 10, y + h - 6, 3.5, '#6A5A70'); disc(g, x + w - 10, y + h - 6, 1.2, '#1B1420'); },
  cafe(g, x, y, w, h, G) { R(g, x + fl(w / 2) - 7, y + h - 7, 14, 1, '#6A3A20'); R(g, x + fl(w / 2), y + h - 6, 1, 6, '#6A3A20'); mini(g, x + fl(w / 2) - 16, y + h, { sil: '#6A3324' }); mini(g, x + fl(w / 2) + 10, y + h, { sil: '#6A3324' }); R(g, x + fl(w / 2) - 4, y + h - 9, 2, 2, '#FFFFFF'); R(g, x + fl(w / 2) + 3, y + h - 9, 2, 2, '#FFFFFF'); R(g, x + fl(w / 2), y + h - 17, 1, 1, '#FF6A8A'); R(g, x + fl(w / 2) - 1, y + h - 18, 1, 1, '#FF6A8A'); R(g, x + fl(w / 2) + 1, y + h - 18, 1, 1, '#FF6A8A'); for (let i = 0; i < 2; i++) { const lx = x + 8 + i * (w - 16); R(g, lx, y, 1, 4, '#3A2A20'); R(g, lx - 2, y + 4, 5, 3, '#E0423A'); R(g, lx - 1, y + 7, 3, 1, '#FFF2C0'); } },
  flowers(g, x, y, w, h) { const r = rng(x); for (let i = 0; i < 4; i++) { const cx = x + 6 + i * (w - 12) / 3, cy = y + h - 11; R(g, cx - 3, cy + 5, 6, 6, '#B8683A'); disc(g, cx, cy, 5, '#2E7D4F'); for (let k = 0; k < 6; k++) R(g, cx - 4 + fl(r() * 8), cy - 4 + fl(r() * 7), 2, 2, ['#FF6A8A', '#FFD54A', '#FFFFFF', '#E0423A'][(i + k) % 4]); } disc(g, x + fl(w / 2), y + 8, 5, '#2E7D4F'); disc(g, x + fl(w / 2), y + 8, 2.5, WARM); R(g, x + fl(w / 2) - 1, y + 11, 3, 2, '#E0423A'); },
};
/* ---------- 小镇里的零件 ---------- */
function xtree(g, G, cx, base, h, seed = 3) {
  const r = rng(seed), tiers = 5; R(g, cx - 3, base - 7, 6, 7, '#5A3422'); R(g, cx - 7, base - 4, 14, 5, '#8A3A30'); R(g, cx - 7, base - 4, 14, 1, '#C05A48');
  for (let t = 0; t < tiers; t++) {
    const ty = base - 8 - (h - 10) * (t + 1) / tiers, th = (h - 10) / tiers + 5, hw = (h * .36) * (1 - t / (tiers + .6));
    for (let j = 0; j < th; j++) { const w = Math.max(1, Math.round(hw * (j + 1) / th)); R(g, cx - w, ty + j, w * 2, 1, j > th - 3 ? '#14503A' : (t % 2 ? '#1F6B45' : '#267A50')); R(g, cx - w, ty + j, Math.max(1, fl(w * .5)), 1, '#2E9060'); if (j === fl(th) - 1 || j === fl(th) - 2) for (let i = -w; i < w; i++) if (r() < .55) R(g, cx + i, ty + j - (r() < .4 ? 1 : 0), 1, 1, '#FFFFFF'); }
  }
  for (let i = 0; i < h * .9; i++) { const t = r(), y = base - 10 - t * (h - 22), w = (h * .34) * (.15 + t * .85) * 1, x = cx + (r() * 2 - 1) * w * (1 - .0), c = BULBS[i % 5]; const yy = base - 8 - (1 - t) * (h - 20), ww = (h * .34) * (.1 + (1 - (1 - t)) * 0); R(g, Math.round(cx + (r() * 2 - 1) * (h * .3) * (1 - (base - 8 - yy) / (h - 4))), Math.round(yy), 2, 2, c); if (G) soft(G, cx + (r() * 2 - 1) * (h * .3) * (1 - (base - 8 - yy) / (h - 4)), yy, 3, c, .8); }
  const sy = base - h - 2; R(g, cx - 1, sy - 3, 2, 8, '#FFE066'); R(g, cx - 4, sy, 8, 2, '#FFE066'); R(g, cx - 2, sy - 1, 4, 4, '#FFF4B0'); if (G) { soft(G, cx, sy + 1, 14, '#FFD54A', 1); soft(G, cx, sy + 1, 6, '#FFFFFF', 1); }
  [[-16, '#E0423A', '#FFD54A'], [-8, '#5AB8FF', '#FFFFFF'], [9, '#5ADB7A', '#E0423A'], [16, '#FF8AD8', '#FFFFFF']].forEach(([dx, c, rb], i) => { const s = 6 + (i % 2) * 2; R(g, cx + dx, base - s + 2, s, s - 1, c); R(g, cx + dx + fl(s / 2) - 1, base - s + 2, 2, s - 1, rb); R(g, cx + dx, base - s + 1, s, 1, '#FFFFFF'); });
}
function lamp(g, G, x, gy, h = 46, cone = 1) {
  if (cone) field(g, x - 26, gy - h + 6, 54, h + 6, '#FFD9A0', (px, py) => { const t = (py - (gy - h + 6)) / (h); const hw = 3 + t * 22; const d = Math.abs(px - x) / hw; return d > 1 || t < 0 ? 0 : .22 * (1 - d) * (1 - t * .4); });
  R(g, x - 1, gy - h + 6, 2, h - 6, '#141A33'); R(g, x - 2, gy - 3, 4, 3, '#141A33'); R(g, x, gy - h + 6, 1, h - 6, '#2C3660');
  R(g, x - 3, gy - h, 6, 6, '#FFE9A8'); R(g, x - 2, gy - h + 1, 4, 4, '#FFFFFF'); R(g, x - 4, gy - h - 1, 8, 1, '#141A33'); R(g, x - 3, gy - h - 3, 6, 2, '#FFFFFF'); R(g, x - 4, gy - h + 6, 8, 1, '#141A33');
  if (G) { soft(G, x, gy - h + 3, 18, '#FFB850', 1); soft(G, x, gy - h + 3, 7, '#FFFFFF', 1); }
}
function snowman(g, x, gy) {
  disc(g, x, gy - 6, 7, '#C9D6EE'); disc(g, x - 1, gy - 7, 6, '#FFFFFF'); disc(g, x, gy - 16, 5, '#C9D6EE'); disc(g, x - 1, gy - 17, 4.4, '#FFFFFF');
  R(g, x - 3, gy - 18, 1, 1, INK); R(g, x + 1, gy - 18, 1, 1, INK); R(g, x - 1, gy - 16, 4, 1, '#F08030'); R(g, x - 4, gy - 13, 8, 2, '#E0423A'); R(g, x + 2, gy - 11, 2, 4, '#E0423A');
  R(g, x - 4, gy - 23, 8, 1, '#1B1420'); R(g, x - 3, gy - 27, 6, 4, '#1B1420'); R(g, x - 3, gy - 24, 6, 1, '#E0423A');
  line(g, x - 7, gy - 10, x - 12, gy - 15, '#5A3422'); line(g, x + 6, gy - 10, x + 11, gy - 14, '#5A3422'); R(g, x - 1, gy - 9, 1, 1, INK); R(g, x - 1, gy - 5, 1, 1, INK);
}
function heart(g, x, y, c = '#FF5A7A') { R(g, x, y, 2, 2, c); R(g, x + 3, y, 2, 2, c); R(g, x, y + 1, 5, 2, c); R(g, x + 1, y + 3, 3, 1, c); R(g, x + 2, y + 4, 1, 1, c); R(g, x, y, 1, 1, lt(c, .5)); }
function note(g, G, x, y, c = '#FFE066') { R(g, x + 3, y, 1, 7, c); R(g, x + 3, y, 4, 1, c); R(g, x + 6, y + 1, 1, 2, c); R(g, x, y + 5, 4, 3, c); R(g, x + 1, y + 4, 2, 1, c); if (G) soft(G, x + 2, y + 5, 6, c, .9); }
function shadow(g, cx, y, rw) { ell(g, cx, y, rw, 2, '#5C6FA8', .5); }
function cat(g, x, gy, c = '#2A2438') { R(g, x, gy - 5, 6, 5, c); R(g, x + 3, gy - 9, 5, 5, c); R(g, x + 3, gy - 10, 1, 1, c); R(g, x + 7, gy - 10, 1, 1, c); R(g, x - 2, gy - 2, 2, 1, c); R(g, x - 3, gy - 4, 1, 3, c); R(g, x + 4, gy - 7, 1, 1, '#FFE066'); R(g, x + 6, gy - 7, 1, 1, '#FFE066'); }
/* 球的玻璃：四个角被弧形的球壁切掉，加高光和窗的倒影 */
function glass(g, o = {}) {
  const cx = 240, cy = 135, rx = o.rx || 272, ry = o.ry || 204;
  field(g, 0, 0, PW, PH, '#060A1E', (x, y) => { const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; return d > 1.02 ? .92 : d > .93 ? (d - .93) * 6 : 0; });
  field(g, 0, 0, PW, PH, '#BFD4FF', (x, y) => { const d = ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2; return (d > 1.0 && d < 1.03) ? .9 : 0; });
  field(g, 0, 0, PW, PH, '#FFFFFF', (x, y) => { const d = Math.sqrt(((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2), a = Math.atan2(y - cy, x - cx) * 180 / Math.PI; return (d > .87 && d < .89 && a > -156 && a < -124) ? .4 : (d > .8 && d < .81 && a > -148 && a < -132) ? .25 : (d > .9 && d < .92 && a > 20 && a < 42) ? .3 : 0; });
  if (o.refl !== false) { const wx = 372, wy = 22; for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) field(g, wx + i * 19 + j * 3, wy + j * 17 + i * 4, 16, 14, '#DCE8FF', () => .16); }
}
/* 球壁外面屋子里的光斑（从球里看出去） */
function bokeh(g, seed, n, rect, cols, p0 = .16) { const r = rng(seed); for (let i = 0; i < n; i++) { const x = rect[0] + r() * rect[2], y = rect[1] + r() * rect[3], rad = 5 + r() * 13; disc(g, x, y, rad, cols[i % cols.length], p0 + r() * .12); disc(g, x, y, rad * .96, lt(cols[i % cols.length], .2), .06); } }
function ground(g, gy, pools = []) {
  vgrad(g, 0, gy, PW, PH - gy, ['#8FA4D4', '#B4C4E8', '#D6E1F5', '#E9F0FB']);
  const r = rng(77); for (let i = 0; i < 260; i++) { const x = fl(r() * PW), y = gy + fl(r() * (PH - gy)); R(g, x, y, 2 + fl(r() * 3), 1, r() < .5 ? '#FFFFFF' : '#A9BAE0'); }
  pools.forEach(([x, w, d, p]) => field(g, x - 8, gy, w + 16, d, '#FFD9A0', (px, py) => { const t = (py - gy) / d, e = Math.min(1, (px - x + 8) / 8, (x + w + 8 - px) / 8); return (p || .5) * (1 - t) * Math.max(0, e); }));
}
function hills(g, y0, c1, c2, seed) { const r = rng(seed), ph = r() * 9; for (let x = 0; x < PW; x++) { const h = 18 + 12 * Math.sin(x / 47 + ph) + 6 * Math.sin(x / 19 + ph * 2); R(g, x, y0 - h, 1, h + 40, c1); R(g, x, y0 - h, 1, 3, c2); } for (let i = 0; i < 26; i++) { const x = fl(r() * PW), h = 18 + 12 * Math.sin(x / 47 + ph) + 6 * Math.sin(x / 19 + ph * 2), by = y0 - h + 2, th = 7 + fl(r() * 6); for (let j = 0; j < th; j++) R(g, x - fl(j / 2.5), by - th + j, 1 + 2 * fl(j / 2.5), 1, j % 3 === 0 ? c2 : dk(c1, .25)); } }
function church(g, G, x, gy) {
  const c = '#27325F'; R(g, x, gy - 58, 16, 58, c); R(g, x + 12, gy - 58, 4, 58, dk(c, .3)); for (let j = 0; j < 16; j++) R(g, x + 8 - fl(j / 2) - 1, gy - 74 + j, 2 + 2 * fl(j / 2), 1, j < 5 ? '#DCE8FA' : '#3A2A52'); R(g, x + 7, gy - 82, 2, 8, '#C9D6EE'); R(g, x + 5, gy - 80, 6, 1, '#C9D6EE');
  disc(g, x + 8, gy - 46, 5, '#FFE9A8'); R(g, x + 8, gy - 49, 1, 4, INK); R(g, x + 8, gy - 46, 3, 1, INK); if (G) soft(G, x + 8, gy - 46, 9, '#FFC860', .9);
  R(g, x + 6, gy - 34, 4, 8, WARM); R(g, x + 16, gy - 34, 30, 34, '#222C56'); for (let j = 0; j < 9; j++) R(g, x + 14 + j, gy - 43 + j, 34 - 2 * j + 0, 1, j < 3 ? '#DCE8FA' : '#3A2A52'); for (let i = 0; i < 3; i++) { R(g, x + 20 + i * 9, gy - 26, 4, 9, WARM); R(g, x + 20 + i * 9, gy - 27, 4, 1, '#E0423A'); if (G) R(G, x + 20 + i * 9, gy - 26, 4, 9, '#A06820'); }
}

/* ============ 1b：主歌，球里的街 ============ */
function town1b(g, G) {
  const GY = 200;
  vgrad(g, 0, 0, PW, GY, ['#060A22', '#0B1438', '#14214E', '#222E66', '#383670']);
  bokeh(g, 5, 13, [10, -10, 460, 120], ['#FFB45A', '#FF7A5A', '#FFE29A', '#FF9A70'], .1);
  // 球外面很淡的一个大轮廓（伏笔："你"的身子和一只眼睛）
  hills(g, 150, '#18224E', '#4A5E9C', 3); hills(g, 172, '#202C5E', '#6276B4', 9);
  church(g, G, 262, 196);
  const r0 = rng(21); for (let i = 0; i < 9; i++) { const x = 232 + fl(r0() * 110), y = 168 + fl(r0() * 20); R(g, x, y, 9, 8, '#1D274F'); R(g, x - 1, y - 2, 11, 2, '#C9D6EE'); R(g, x + 3, y + 3, 2, 3, WARM); if (G) R(G, x + 3, y + 3, 2, 3, '#B07020'); }
  shop(g, G, -12, 86, 96, GY, { wall: '#B5654A', roof: '#5A2E3A', sign: '面包房', awn: ['#E0423A', '#FFF4E0'], win: WIN.bread, seed: 2, lit: [1, 1], sil: [0, 1], chimX: .6 });
  shop(g, G, 78, 80, 108, GY, { wall: '#4E7A8C', roof: '#2E3E5A', sign: '玩具屋', signCol: '#9FE8FF', win: WIN.globes, seed: 5, lit: [1, 0], doorL: 1, door: '#C8553D', curt: '#3A8A6A', rh: 18 });
  shop(g, G, 162, 72, 90, GY, { wall: '#7A5A8C', roof: '#3A2A4E', sign: '唱片行', signCol: '#FF9AD8', awn: ['#5A3A8A', '#F0D8FF'], win: WIN.records, seed: 8, lit: [0, 1], nw: 2, chim: false, door: '#3A2A4E', curt: '#E0A040' });
  shop(g, G, 336, 78, 102, GY, { wall: '#C89858', roof: '#6A3A2A', sign: '咖啡', awn: ['#2E7D4F', '#FFF4E0'], win: WIN.cafe, seed: 11, lit: [1, 1], sil: [1, 0], doorL: 1, door: '#2E5A4A', winCol: '#FFC870', panes: 1, rh: 16 });
  shop(g, G, 418, 76, 92, GY, { wall: '#A84A5A', roof: '#4A2A3A', sign: '花店', signCol: '#B8FFB0', win: WIN.flowers, seed: 14, lit: [1, 0], chimX: .3, curt: '#F0D8C0' });
  ground(g, GY, [[4, 44, 26, .5], [98, 44, 26, .45], [166, 44, 24, .4], [352, 46, 28, .55], [424, 40, 24, .45]]);
  // 铺子脚下的积雪
  const r1 = rng(31); for (let i = 0; i < 30; i++) { const x = fl(r1() * PW); if (x > 236 && x < 334) continue; ell(g, x, GY + 1, 5 + r1() * 6, 2 + r1() * 2, '#F4F8FF'); }
  lamp(g, G, 122, 214, 52); lamp(g, G, 330, 212, 50); lamp(g, G, 452, 222, 54, 0);
  lights(g, G, 122, 162, 330, 162, 14, 7, 3); lights(g, G, 330, 162, 452, 168, 9, 7, 1); lights(g, G, -4, 150, 122, 162, 9, 7, 2);
  xtree(g, G, 290, 214, 88, 4);
  snowman(g, 240, 216); shadow(g, 240, 217, 8);
  // 路人：一对一对的
  const P = (x, fy, o) => { shadow(g, x, fy, 9); chibi(g, x, fy, 28, o); };
  P(48, 228, { hair: '#7A4A2A', coat: '#F08AB0', scarf: '#FFFFFF', girl: 1, hat: '#FFFFFF', pom: '#FF5A7A', eyes: 'happy', mouth: 'smile', step: 1 }); P(72, 228, { hair: '#1B1420', coat: '#5AA0E8', scarf: '#FFD54A', eyes: 'happy', mouth: 'smile', step: 2 }); heart(g, 58, 190); R(g, 59, 219, 3, 2, '#F9DABF');
  P(376, 224, { hair: '#C8742E', coat: '#6CC58A', scarf: '#FFFFFF', girl: 1, mouth: 'smile', step: 2 }); P(398, 224, { hair: '#3A2A20', coat: '#7A6AD8', scarf: '#E0423A', mouth: 'smile', step: 1 }); heart(g, 385, 186, '#FF8AA8'); R(g, 386, 215, 3, 2, '#F9DABF');
  mini(g, 204, 208, { coat: '#B48AE8', hair: '#5A3A2A' }); mini(g, 213, 208, { coat: '#7ADFD0', hair: '#1B1420', hat: '#E0423A' }); heart(g, 207, 190, '#FF8AA8');
  mini(g, 316, 213, { coat: '#F2C94C', hat: '#5AB8FF' }); R(g, 302, 211, 10, 2, '#8A4A2A'); R(g, 301, 213, 12, 1, '#C9D6EE'); line(g, 312, 210, 316, 208, '#3A2A20');
  cat(g, 108, 206);
  // 脚印：绕了一圈又回到原地
  for (let i = 0; i < 46; i++) { const a = -1.0 + i * .138, x = 246 + Math.cos(a) * 92, y = 244 - Math.abs(Math.sin(a)) * 14 * (Math.sin(a) > 0 ? -1 : 1); if (y > 243 && x > 150 && x < 330) continue; R(g, x, y + (i % 2) * 2, 3, 1, '#7F93C6'); R(g, x + 1, y + (i % 2) * 2 + 1, 2, 1, '#A9BAE0'); }
  // 主角
  shadow(g, 176, 238, 11); chibi(g, 176, 238, 32, { ...HERO, eyes: 'up', mouth: 'flat', snow: 1, wind: 1 });
  // 近处
  for (let i = 0; i < 9; i++) { disc(g, 6 + i * 9, 262 - (i % 3) * 3 - (i < 6 ? 4 : 0), 9, '#143A2E'); disc(g, 6 + i * 9, 258 - (i % 3) * 3 - (i < 6 ? 4 : 0), 7, '#F4F8FF'); } lights(g, G, -2, 250, 84, 262, -5, 6, 4, '#0A1E1A');
  R(g, 436, 232, 3, 38, '#141A33'); R(g, 426, 222, 24, 14, '#C8323C'); R(g, 426, 222, 24, 2, '#FFFFFF'); R(g, 425, 220, 26, 2, '#FFFFFF'); R(g, 430, 228, 16, 2, '#7A1820'); R(g, 426, 234, 24, 2, '#8A1E2A');
  snow(g, 1, 190, 1, '#8FA4D8', 1, [0, 0, PW, 240]); snow(g, 2, 110, 1, '#FFFFFF', 1, [0, 0, PW, 250], 1); snow(g, 3, 46, 2, '#FFFFFF'); snow(g, 4, 9, 4, '#FFFFFF', .5);
  glass(g);
}
FRAMES['1b'] = async (main) => {
  const g = mk(PW, PH), G = mk(PW, PH); town1b(g, G);
  lyric(g, '过条街 最好又给我下起雪'); mark(g);
  compose(main, g, G, { vig: .35 });
};

/* 隔着玻璃的一张大脸（"你"）：T 把颜色调成隔着玻璃的样子 */
function bigFace(g, cx, cy, rx, ry, T) {
  const skin = T('#F9DABF'), skinS = T('#EDB79C'), skinL = T('#FFE9C8'), hair = T('#6A4636'), hairH = T('#8A6450'), hairD = T('#4A2E24'), hat = T('#FFFFFF'), hatS = T('#D5DBEC'), EC = T('#231620'), OLc = T('#2A1622');
  const X0 = fl(cx - rx * 1.3), Y0 = fl(cy - ry * 1.4), WW = Math.ceil(rx * 2.6), HH = Math.ceil(ry * 2.9);
  const E = (x, y, a, b, ox = 0, oy = 0) => ((x + .5 - cx - ox) / (rx * a)) ** 2 + ((y + .5 - cy - oy) / (ry * b)) ** 2;
  field(g, X0, Y0, WW, HH, OLc, (x, y) => E(x, y, 1.2, 1.26, 0, ry * .36) <= 1 ? 1 : 0);
  field(g, X0, Y0, WW, HH, hair, (x, y) => E(x, y, 1.18, 1.24, 0, ry * .36) <= 1 ? 1 : 0);
  field(g, X0, Y0, WW, HH, hairD, (x, y) => E(x, y, 1.18, 1.24, 0, ry * .36) <= 1 && (fl((x - cx) / 7) % 3 === 0) && Math.abs(x - cx) > rx * .8 ? .5 : 0);
  field(g, X0, Y0, WW, HH, skin, (x, y) => E(x, y, 1, 1) <= 1 ? 1 : 0);
  field(g, X0, Y0, WW, HH, skinS, (x, y) => { const d = E(x, y, 1, 1); return d <= 1 && d > .86 && y > cy ? (d - .86) * 5 : 0; });
  field(g, X0, Y0, WW, HH, skinL, (x, y) => { const d = E(x, y, 1, 1); return d <= 1 && d > .9 && x > cx + rx * .5 ? 1 : 0; });
  const fr = (x) => cy - ry * .34 + Math.abs(Math.sin((x - cx) / rx * 4.2 + .6)) * ry * .16;
  field(g, X0, Y0, WW, HH, hair, (x, y) => E(x, y, 1.04, 1.06) <= 1 && (y < fr(x) || E(x, y, .9, 1.0, 0, -ry * .1) > 1) ? 1 : 0);
  field(g, X0, Y0, WW, HH, hairH, (x, y) => E(x, y, 1.04, 1.06) <= 1 && y < fr(x) - 5 && y > fr(x) - 9 ? 1 : 0);
  field(g, X0, Y0, WW, HH, hairD, (x, y) => E(x, y, 1.04, 1.06) <= 1 && y < fr(x) && y >= fr(x) - 2 ? 1 : 0);
  const brim = (x) => cy - ry * .7 + ((x - cx) / rx) ** 2 * ry * .16, bt = ry * .2;
  field(g, X0, Y0, WW, HH, hat, (x, y) => E(x, y, 1.14, 1.22) <= 1 && y < brim(x) ? 1 : 0);
  field(g, X0, Y0, WW, HH, hatS, (x, y) => E(x, y, 1.14, 1.22) <= 1 && y < brim(x) && (fl((x - cx) / 6) & 1) ? 1 : 0);
  field(g, X0, Y0, WW, HH, hat, (x, y) => Math.abs(x - cx) < rx * 1.17 && y >= brim(x) && y < brim(x) + bt ? 1 : 0);
  field(g, X0, Y0, WW, HH, hatS, (x, y) => Math.abs(x - cx) < rx * 1.17 && y >= brim(x) && y < brim(x) + bt && ((fl((x - cx) / 4) % 3 === 0) || y > brim(x) + bt - 3) ? 1 : 0);
  [-1, 1].forEach(sd => {
    const ex = cx + sd * rx * .43, ey = cy + ry * .2, ea = rx * .125, eb = ry * .2;
    ell(g, ex, ey, ea + 2, eb + 2, T('#FFFFFF')); ell(g, ex, ey + 1, ea, eb, EC);
    field(g, fl(ex - ea), fl(ey), Math.ceil(2 * ea), Math.ceil(eb + 2), T('#7A4A5A'), (x, y) => ((x + .5 - ex) / (ea * .78)) ** 2 + ((y + .5 - ey - eb * .35) / (eb * .6)) ** 2 < 1 ? .7 : 0);
    disc(g, ex - ea * .35, ey - eb * .42, ea * .42, T('#FFFFFF')); disc(g, ex + ea * .4, ey + eb * .5, ea * .2, T('#FFFFFF'));
    field(g, fl(ex - ea * 1.6), fl(ey - eb * 1.5), Math.ceil(ea * 3.2), Math.ceil(eb * 1.6), EC, (x, y) => { const d = Math.hypot((x + .5 - ex) / (ea * 1.25), (y + .5 - ey) / (eb * 1.18)); return d > .93 && d < 1.07 && y < ey - eb * .45 ? 1 : 0; });
    line(g, ex + sd * ea * 1.15, ey - eb * .62, ex + sd * ea * 1.5, ey - eb * .86, EC, 2);
    field(g, fl(ex - ea * 1.6), fl(ey - eb * 2.2), Math.ceil(ea * 3.2), Math.ceil(eb), hair, (x, y) => { const yy = ey - eb * 1.62 - Math.cos((x - ex) / (ea * 1.2)) * 4; return Math.abs(x - ex) < ea * 1.1 && y >= yy && y < yy + 2.4 ? 1 : 0; });
    ell(g, cx + sd * rx * .66, cy + ry * .5, rx * .15, ry * .075, T('#F58C8C'), .75);
  });
  R(g, cx - 2, cy + ry * .42, 4, 2, skinS);
}

/* ============ 1c：副歌，从球里往外看 ============ */
FRAMES['1c'] = async (main) => {
  const g = mk(PW, PH), G = mk(PW, PH), GY = 206;
  // 球外面：屋里的暖光
  vgrad(g, 0, 0, PW, 210, ['#3A1A22', '#5A2A26', '#7A3E28', '#4A2228', '#2A1626']);
  bokeh(g, 9, 16, [0, 0, PW, 150], ['#FFB45A', '#FFD27A', '#FF8A5A'], .2);
  // "你"：贴在玻璃外面往里看，隔着玻璃发蓝
  bigFace(g, 240, 58, 150, 136, c => mix(c, '#16204E', .32));
  field(g, 0, 150, PW, 60, '#0A1238', (x, y) => (y - 150) / 60 * .7);
  // 远处的屋顶
  const r = rng(4); for (let i = 0; i < 16; i++) { const x = -10 + i * 32 + fl(r() * 8), h = 26 + fl(r() * 26), w = 26 + fl(r() * 10), c = ['#1A2248', '#202A56', '#161C40'][i % 3]; R(g, x, GY - h, w, h, c); for (let j = 0; j < 9; j++) R(g, x - 2 + j, GY - h - 9 + j, w + 4 - 2 * j, 1, j < 3 ? '#C9D6EE' : dk(c, .2)); for (let k = 0; k < 3; k++) if (r() < .75) { const wx = x + 4 + k * 8, wy = GY - h + 6 + fl(r() * 8); R(g, wx, wy, 4, 6, WARM); R(G, wx, wy, 4, 6, '#B07020'); } }
  shop(g, G, -30, 84, 92, GY, { wall: '#B5654A', roof: '#5A2E3A', sign: '面包房', awn: ['#E0423A', '#FFF4E0'], win: WIN.bread, seed: 2, lit: [1, 1], sil: [0, 1] });
  shop(g, G, 424, 84, 96, GY, { wall: '#4E7A8C', roof: '#2E3E5A', sign: '玩具屋', signCol: '#9FE8FF', win: WIN.globes, seed: 5, lit: [1, 0], doorL: 1, door: '#C8553D', curt: '#3A8A6A' });
  ground(g, GY, [[0, 44, 22, .5], [436, 44, 22, .5], [170, 140, 40, .5]]);
  xtree(g, G, 96, 218, 74, 6); snowman(g, 372, 226); shadow(g, 372, 227, 8); cat(g, 334, 232); shadow(g, 338, 232, 6);
  lamp(g, G, 62, 222, 50, 0); lamp(g, G, 418, 222, 50, 0);
  // 小舞台：木台、灯架、两只射灯、音箱
  const sx = 164, sw = 152, sy = 204;
  field(g, 150, 118, 180, 90, '#FFE9B0', (x, y) => { let p = 0;[[192, 124], [288, 124]].forEach(([lx, ly]) => { const t = (y - ly) / 82, cxx = lx + (240 - lx) * t * .9, hw = 4 + t * 34, d = Math.abs(x - cxx) / hw; if (t > 0 && t < 1 && d < 1) p = Math.max(p, .34 * (1 - d * .7)); }); return p; });
  R(g, sx, sy, sw, 9, '#8A5A38'); R(g, sx, sy, sw, 2, '#C08A58'); for (let i = 0; i < sw; i += 12) R(g, sx + i, sy + 2, 1, 7, '#5A3422'); R(g, sx + 4, sy + 9, sw - 8, 4, '#3A2218'); R(g, sx - 2, sy - 1, sw + 4, 1, '#FFFFFF');
  R(g, sx + 4, 118, 3, 86, '#1B2140'); R(g, sx + sw - 7, 118, 3, 86, '#1B2140'); R(g, sx + 2, 116, sw - 4, 4, '#1B2140'); R(g, sx + 2, 114, sw - 4, 2, '#FFFFFF');
  for (let i = sx + 8; i < sx + sw - 8; i += 8) { line(g, i, 120, i + 4, 124, '#2C3660'); line(g, i + 4, 124, i + 8, 120, '#2C3660'); }
  [[192, 124], [288, 124]].forEach(([lx, ly]) => { R(g, lx - 4, ly - 3, 8, 7, '#0E1228'); R(g, lx - 3, ly + 3, 6, 2, '#FFF4C0'); soft(G, lx, ly + 4, 16, '#FFE0A0', 1); });
  lights(g, G, sx + 5, 126, sx + sw - 6, 126, 9, 6, 2); lights(g, G, 62, 172, sx + 5, 120, 10, 7, 5); lights(g, G, sx + sw - 6, 120, 418, 172, 10, 7, 3);
  [[sx + 10, 1], [sx + sw - 30, 0]].forEach(([ax]) => { R(g, ax, sy - 22, 20, 22, '#1B1420'); R(g, ax, sy - 22, 20, 1, '#4A3A50'); disc(g, ax + 10, sy - 14, 4, '#4A3A50'); disc(g, ax + 10, sy - 14, 1.5, '#0E0A12'); disc(g, ax + 10, sy - 5, 3, '#4A3A50'); R(g, ax + 2, sy - 23, 16, 1, '#FFFFFF'); });
  // 主角
  ell(g, 240, sy + 1, 22, 2.5, '#5A3422', .6);
  chibi(g, 240, sy, 46, { ...HERO, arms: 'mic', eyes: 'shut', mouth: 'o', rim: '#FFF0C0' });
  line(g, 250, sy - 12, 262, sy - 2, '#1B1420'); line(g, 262, sy - 2, 300, sy - 1, '#1B1420');
  // 音符一路飘到"你"的眼睛前面
  [[268, 146, '#FFE066'], [286, 126, '#FFFFFF'], [316, 108, '#FF9AD8'], [340, 84, '#FFE066'], [352, 56, '#9FE8FF'], [372, 34, '#FFFFFF'], [100, 60, '#FFE066'], [124, 96, '#FF9AD8']].forEach(([x, y, c], i) => { note(g, G, x, y, c); if (i < 6) { R(g, x - 4, y + 12, 1, 1, c); R(g, x + 9, y - 3, 1, 1, c); } });
  snow(g, 11, 170, 1, '#8FA4D8', 1, [0, 0, PW, 240]); snow(g, 12, 100, 1, '#FFFFFF', 1, [0, 0, PW, 250], 1); snow(g, 13, 40, 2, '#FFFFFF'); snow(g, 14, 8, 4, '#FFFFFF', .5);
  glass(g, { refl: false }); for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) field(g, 40 + i * 21 + j * 3, 30 + j * 19 + i * 4, 18, 16, '#DCE8FF', () => .14);
  lyric(g, '为你封麦 只唱你爱'); mark(g);
  compose(main, g, G, { vig: .35 });
};

/* ============ 1a：开头，一只手拿起玻璃球猛摇（球外） ============ */
function globeBuf() {
  const W = 200, H = 236, b = mk(W, H), cx = 100, cy = 88, rad = 80, r = rng(5);
  const t = mk(W, H);
  vgrad(t, 0, 0, W, 180, ['#0A1238', '#14245A', '#2A3A80', '#4A52A0']);
  for (let x = 0; x < W; x++) { const h = 14 + 8 * Math.sin(x / 23 + 1); R(t, x, 128 - h, 1, 60, '#1E2B60'); R(t, x, 128 - h, 1, 2, '#6A80C0'); }
  // 小镇：几间屋、一棵树
  [[34, 22, 26, '#B5654A'], [62, 20, 32, '#4E7A8C'], [120, 22, 28, '#C89858'], [146, 20, 24, '#A84A5A']].forEach(([x, w, h, c]) => { R(t, x, 136 - h, w, h, c); for (let j = 0; j < 8; j++) R(t, x - 2 + j, 136 - h - 8 + j, w + 4 - 2 * j, 1, j < 3 ? '#FFFFFF' : '#4A2A3A'); R(t, x + 4, 136 - h + 6, 5, 6, WARM); R(t, x + w - 9, 136 - h + 6, 5, 6, WARM); R(t, x + fl(w / 2) - 2, 136 - 8, 5, 8, '#5A3020'); });
  for (let j = 0; j < 30; j++) { const w = 1 + fl((j % 10) * .9) + fl(j / 6); R(t, 100 - w, 104 + j, w * 2, 1, j % 10 > 7 ? '#FFFFFF' : '#1F6B45'); } R(t, 99, 100, 2, 5, '#FFE066'); R(t, 97, 102, 6, 1, '#FFE066');
  ell(t, 100, 160, 96, 28, '#E9F0FB'); ell(t, 70, 150, 40, 10, '#FFFFFF'); for (let i = 0; i < 60; i++) R(t, 20 + fl(r() * 160), 140 + fl(r() * 24), 2, 1, '#B4C4E8');
  // 被甩起来的雪：绕着球心打旋
  for (let i = 0; i < 330; i++) { const a = r() * 6.283, d = 12 + r() * 64, x = cx + Math.cos(a) * d, y = cy + Math.sin(a) * d, l = 1 + fl(r() * 5 * d / 70); for (let k = 0; k < l; k++) R(t, x - Math.sin(a + k * .03) * k, y + Math.cos(a + k * .03) * k, 1, 1, k === 0 || r() < .6 ? '#FFFFFF' : '#A9BEF0'); }
  for (let i = 0; i < 26; i++) { const a = r() * 6.283, d = 10 + r() * 60; R(t, cx + Math.cos(a) * d, cy + Math.sin(a) * d, 2, 2, '#FFFFFF'); }
  // 被甩飞的主角、帽子、礼物、一颗星
  const m = chibi(null, 0, 0, 40, { ...HERO, eyes: 'wide', mouth: 'o', arms: 'up', wind: 1, buf: 1 }); rotBlit(t, m, 96, 62, -.7);
  const gb = mk(12, 12); R(gb, 1, 2, 10, 9, '#E0423A'); R(gb, 5, 2, 2, 9, '#FFD54A'); R(gb, 1, 5, 10, 2, '#FFD54A'); rotBlit(t, gb, 48, 92, .4); rotBlit(t, gb, 146, 100, -.9); rotBlit(t, gb, 140, 44, .7);
  R(t, 58, 44, 2, 6, '#FFE066'); R(t, 56, 46, 6, 2, '#FFE066'); 
  // 裁成圆
  const d = t.getImageData(0, 0, W, H); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if ((x + .5 - cx) ** 2 + (y + .5 - cy) ** 2 > rad * rad) d.data[(y * W + x) * 4 + 3] = 0; t.putImageData(d, 0, 0);
  // 底座
  for (let j = 0; j < 34; j++) { const w = 46 + fl(j * .34) + (j < 5 ? 2 : 0); R(b, cx - w, 160 + j, w * 2, 1, j < 4 ? '#E0B85A' : j < 6 ? '#8A6A2A' : (j % 9 === 8 ? '#4A2818' : '#6E4028')); R(b, cx - w, 160 + j, 5, 1, j < 4 ? '#FFE9A0' : '#8A5638'); R(b, cx + w - 9, 160 + j, 9, 1, j < 4 ? '#A8842E' : '#4A2818'); }
  R(b, cx - 54, 194, 108, 5, '#3A2014'); R(b, cx - 44, 172, 46, 16, '#C9A04A'); R(b, cx - 44, 172, 46, 1, '#FFE9A0'); R(b, cx - 44, 187, 46, 1, '#7A5A20'); ptext(b, '给 你', cx - 21, 174, '#4A3210', { align: 'c' });
  b.drawImage(t.canvas, 0, 0);
  // 玻璃
  field(b, 0, 0, W, 176, '#0A1238', (x, y) => { const dd = Math.hypot(x + .5 - cx, y + .5 - cy); return dd < rad && dd > rad - 9 ? (dd - (rad - 9)) / 9 * .7 : 0; });
  field(b, 0, 0, W, 176, '#CFE0FF', (x, y) => { const dd = Math.hypot(x + .5 - cx, y + .5 - cy); return dd <= rad + .6 && dd > rad - 1.6 ? 1 : 0; });
  field(b, 0, 0, W, 176, '#FFFFFF', (x, y) => { const dd = Math.hypot(x + .5 - cx, y + .5 - cy), a = Math.atan2(y - cy, x - cx) * 180 / Math.PI; return (dd > rad - 14 && dd < rad - 8 && a > -160 && a < -112) ? .85 : (dd > rad - 20 && dd < rad - 17 && a > -150 && a < -125) ? .5 : (dd > rad - 10 && dd < rad - 7 && a > 25 && a < 50) ? .5 : 0; });
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) field(b, 128 + i * 13 + j * 2, 30 + j * 12 + i * 3, 11, 10, '#FFFFFF', () => .28);
  return b;
}
FRAMES['1a'] = async (main) => {
  const g = mk(PW, PH), G = mk(PW, PH);
  // 屋里
  vgrad(g, 0, 0, PW, 214, ['#160C1C', '#241224', '#34192A', '#42202C']);
  for (let x = 0; x < PW; x += 24) field(g, x, 0, 1, 214, '#0E0814', () => .5);
  // 窗：外面在下雪
  R(g, 22, 18, 104, 128, '#3A2014'); R(g, 28, 24, 92, 116, '#0E1840'); vgrad(g, 28, 24, 92, 116, ['#0A1238', '#16286A', '#2E3E8A']);
  for (let x = 28; x < 120; x++) { const h = 10 + 6 * Math.sin(x / 11); R(g, x, 126 - h, 1, h + 14, '#1A2456'); R(g, x, 126 - h, 1, 2, '#8FA4D8'); }
  [[40, 112], [62, 116], [88, 110], [104, 118]].forEach(([x, y]) => { R(g, x, y, 9, 10, '#141C48'); R(g, x - 1, y - 2, 11, 2, '#DCE8FA'); R(g, x + 3, y + 3, 3, 4, WARM); soft(G, x + 4, y + 5, 4, '#FFB850', .8); });
  snow(g, 41, 80, 1, '#FFFFFF', 1, [28, 24, 92, 116]); snow(g, 42, 10, 2, '#FFFFFF', 1, [28, 24, 90, 112]);
  R(g, 72, 24, 4, 116, '#3A2014'); R(g, 28, 78, 92, 4, '#3A2014'); R(g, 22, 18, 104, 2, '#6A4028'); R(g, 18, 146, 112, 5, '#5A3420'); R(g, 18, 145, 112, 1, '#FFFFFF');
  [[28, 24], [76, 24], [28, 82], [76, 82]].forEach(([x, y]) => field(g, x, y, 44, 58, '#DCE8FF', (px, py) => { const d = Math.min(px - x, py - y, x + 43 - px) + ((py - y) > 40 ? 6 : 0); return d < 7 ? .5 * (1 - d / 7) : 0; }));
  for (let j = 0; j < 132; j++) { const w = 14 + fl(4 * Math.sin(j / 9)); R(g, 6, 14 + j, w, 1, j % 2 ? '#6A2430' : '#7A2A38'); } R(g, 2, 10, 132, 5, '#2A1810');
  // 远处虚掉的圣诞树和光斑
  for (let j = 0; j < 190; j++) { const w = 6 + j * .34 + 8 * Math.sin(j / 12); field(g, fl(430 - w), 20 + j, fl(w * 2), 1, '#143A2E', () => .8); }
  const rb = rng(17); for (let i = 0; i < 26; i++) { const y = 30 + rb() * 170, w = 6 + (y - 20) * .34, x = 430 + (rb() * 2 - 1) * w, c = BULBS[i % 5]; disc(g, x, y, 4 + rb() * 3, c, .55); soft(G, x, y, 9, c, .8); }
  disc(g, 430, 18, 7, '#FFE066', .8); soft(G, 430, 18, 18, '#FFD54A', 1);
  bokeh(g, 23, 12, [140, 0, 240, 150], ['#FFB45A', '#FF7A5A', '#FFD27A'], .1);
  lights(g, G, 130, 6, 400, 10, 22, 9, 2, '#0E0814');
  // 架子和上面的东西
  R(g, 0, 214, PW, 10, '#8A5434'); R(g, 0, 214, PW, 2, '#B87A4E'); R(g, 0, 224, PW, 46, '#5A3422'); const rw = rng(8); for (let i = 0; i < 70; i++) R(g, fl(rw() * PW), 226 + fl(rw() * 44), 10 + fl(rw() * 30), 1, rw() < .5 ? '#4A2818' : '#6E4430'); R(g, 0, 224, PW, 2, '#3A2014');
  // 相框（伏笔：两只）
  R(g, 150, 168, 44, 46, '#C9A04A'); R(g, 150, 168, 44, 2, '#FFE9A0'); R(g, 154, 172, 36, 38, '#2A3A70'); vgrad(g, 154, 172, 36, 30, ['#3A4A8A', '#6A70B0']); R(g, 154, 200, 36, 10, '#DCE6F5'); mini(g, 161, 203, {}); mini(g, 176, 203, { coat: '#B7A6F0', hair: '#6A4636', hat: '#FFFFFF', pom: '#FF6A8A', scarf: '#F7F1E8' }); heart(g, 170, 181, '#FF7A98'); field(g, 154, 172, 36, 38, '#FFFFFF', (x, y) => (x - y > -8 && x - y < -2) ? .25 : 0);
  // 杯子、蜡烛、书、另一只手套
  R(g, 204, 196, 16, 18, '#E8E0D0'); R(g, 204, 196, 16, 2, '#FFFFFF'); R(g, 206, 198, 12, 2, '#6A3A20'); R(g, 220, 200, 4, 2, '#E8E0D0'); R(g, 222, 202, 2, 6, '#E8E0D0'); R(g, 220, 208, 4, 2, '#E8E0D0'); R(g, 206, 204, 12, 3, '#E0423A');
  [[210, 188], [213, 180], [209, 172]].forEach(([x, y], i) => disc(g, x, y, 2.5 + i, '#C9D3EE', .3 - i * .07));
  R(g, 44, 190, 8, 24, '#F4EAD8'); R(g, 44, 190, 8, 2, '#FFFFFF'); R(g, 47, 186, 1, 4, '#3A2A20'); R(g, 46, 180, 3, 6, '#FFD54A'); R(g, 47, 182, 1, 3, '#FFFFFF'); soft(G, 47, 183, 20, '#FFA840', 1); soft(G, 47, 183, 7, '#FFFFFF', 1); soft(g, 47, 196, 30, '#FFB45A', .22);
  R(g, 70, 204, 50, 10, '#3A5A8A'); R(g, 70, 204, 50, 2, '#5A7AB0'); R(g, 74, 196, 44, 8, '#8A3A4A'); R(g, 74, 196, 44, 2, '#B05A6A'); R(g, 76, 206, 38, 6, '#F4EAD8'); ptext(g, '床边故事', 97, 184, '#FFE29A', { align: 'c' }); R(g, 72, 183, 50, 13, '#2E5A4A'); R(g, 72, 183, 50, 1, '#4A8A6A'); ptext(g, '床边故事', 97, 184, '#FFE29A', { align: 'c' });
  // 球：先画一个错开的残影，再画本体
  const gb = globeBuf(), CX = 268, CY = 112, ANG = -.3;
  rotBlit(g, gb, CX + 20, CY + 6, ANG + .26, 1, .28); rotBlit(g, gb, CX - 12, CY - 3, ANG - .16, 1, .2);
  rotBlit(g, gb, CX, CY, ANG);
  soft(G, CX - 8, CY - 26, 70, '#4060C0', .7);
  // 甩动的弧线
  field(g, 120, 0, 340, 230, '#FFFFFF', (x, y) => { const d = Math.hypot(x - CX, y - (CY - 10)), a = Math.atan2(y - (CY - 10), x - CX) * 180 / Math.PI; return ((Math.abs(d - 104) < 1.2 && ((a > -175 && a < -140) || (a > -38 && a < -8))) || (Math.abs(d - 114) < 1 && ((a > -168 && a < -150) || (a > -30 && a < -14))) || (Math.abs(d - 96) < .8 && ((a > 150 || a < -172) || (a > -4 && a < 14)))) ? .85 : 0; });
  // 红手套和袖子（"你"的手）
  const hx = 302, hy = 178;
  for (let i = 0; i < 80; i++) { const x = hx + 26 + i * 1.7, y = hy + 16 + i * .95; R(g, x, y - 16, 4, 34, i % 6 < 3 ? LAV : dk(LAV, .12)); if (i % 12 === 4) R(g, x, y - 6, 4, 6, '#FFFFFF'); R(g, x, y - 16, 4, 2, lt(LAV, .3)); R(g, x, y + 16, 4, 2, dk(LAV, .35)); }
  ell(g, hx + 26, hy + 14, 9, 19, '#FFFFFF'); ell(g, hx + 24, hy + 14, 6, 17, '#E6ECFA');
  ell(g, hx, hy + 6, 26, 19, '#B8202C'); ell(g, hx - 1, hy + 4, 25, 18, '#D8323C'); ell(g, hx - 16, hy - 12, 9, 12, '#B8202C'); ell(g, hx - 17, hy - 13, 8, 11, '#E04450');
  for (let i = 0; i < 9; i++) line(g, hx - 20 + i * 5, hy - 8, hx - 16 + i * 5, hy + 20, '#B8202C'); dith(g, hx - 22, hy - 10, 30, 8, '#F06A74', .35);
  [[-8, -11], [2, -13], [12, -12]].forEach(([dx, dy]) => { ell(g, hx + dx, hy + dy, 5, 6, '#D8323C'); R(g, hx + dx - 2, hy + dy - 5, 3, 1, '#F06A74'); });
  R(g, hx - 6, hy + 4, 5, 4, '#FFFFFF'); R(g, hx, hy + 4, 5, 4, '#FFFFFF'); R(g, hx - 6, hy + 6, 11, 4, '#FFFFFF'); R(g, hx - 5, hy + 10, 9, 2, '#FFFFFF'); R(g, hx - 3, hy + 12, 5, 2, '#FFFFFF'); R(g, hx - 1, hy + 14, 1, 1, '#FFFFFF');
  // 溅出来的雪粒、汗
  const rs = rng(12); for (let i = 0; i < 26; i++) { const a = rs() * 6.283, d = 90 + rs() * 40; R(g, CX + Math.cos(a) * d, CY - 14 + Math.sin(a) * d * .8, 1 + (i % 3 === 0), 1, '#FFFFFF'); }
  ptext(g, '周杰伦 ·《爱情废柴》', 12, 250, '#FFFFFF', { ol: '#0A0E24' }); mark(g);
  compose(main, g, G, { vig: .55 });
};

/* 人物表：检查长相用 */
FRAMES['ch'] = async (main) => {
  const g = mk(PW, PH); R(g, 0, 0, PW, PH, '#2A3566'); R(g, 0, 200, PW, 70, '#C8D6F0');
  chibi(g, 30, 200, 28, { ...HERO }); chibi(g, 62, 200, 28, { ...HERO, eyes: 'up', snow: 1, step: 1 }); chibi(g, 94, 200, 28, { ...GIRL }); chibi(g, 126, 200, 28, { ...GIRL, eyes: 'happy', mouth: 'smile', step: 2 });
  chibi(g, 160, 200, 28, { hair: '#C8742E', coat: '#5AA0E8', scarf: '#FFFFFF' }); chibi(g, 190, 200, 28, { hair: '#1B1420', coat: '#6CC58A', scarf: '#FFD54A', girl: 1 });
  chibi(g, 250, 200, 48, { ...HERO, arms: 'mic', eyes: 'shut', mouth: 'o', rim: '#FFF0C0' }); chibi(g, 320, 200, 48, { ...GIRL, eyes: 'n', mouth: 'smile' });
  chibi(g, 400, 200, 72, { ...HERO, eyes: 'sad', mouth: 'frown', tear: 1, wind: 1, arms: 'upR' });
  chibi(g, 60, 110, 48, { ...HERO, eyes: 'wide', mouth: 'o', arms: 'up' }); chibi(g, 140, 110, 48, { ...HERO, eyes: 'happy', mouth: 'smile', wind: 1, snow: 1 });
  mini(g, 20, 240, {}); mini(g, 32, 240, { coat: '#B7A6F0', hair: '#6A4636', hat: '#FFFFFF', pom: '#FF6A8A', scarf: '#F7F1E8' }); mini(g, 44, 240, { sil: '#6A3324' });
  compose(main, g, null, { vig: 0 });
};
