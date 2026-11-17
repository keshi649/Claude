'use strict';
/* world.js —— 小镇的零件（铺子、树、路灯、雪人……）和各个场景的底图 */
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

function pine(g, x, base, h) { R(g, x - 1, base - 3, 3, 3, '#5A3422'); ell(g, x, base, 7, 2, '#8FA4D4', .6); for (let j = 0; j < h; j++) { const w = 1 + fl(((j % fl(h / 3)) + j * .5) * .55); R(g, x - w, base - 3 - h + j, 2 * w + 1, 1, '#1F6B45'); R(g, x - w, base - 3 - h + j, Math.max(1, fl(w * .6)), 1, '#2E9060'); if (j % fl(h / 3) < 2) R(g, x - w + (j % 2), base - 3 - h + j, 2 * w - 1, 1, '#FFFFFF'); } }
function sparkle(g, G, x, y, c = '#FFFFFF', s = 2) { R(g, x - s, y, 2 * s + 1, 1, c); R(g, x, y - s, 1, 2 * s + 1, c); if (G) soft(G, x + .5, y + .5, s * 2.5, c, .9); }
