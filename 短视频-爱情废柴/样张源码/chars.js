'use strict';
/* chars.js —— 自己画的像素人物（不用像素小怪）。
   男主"废柴"：蓬蓬的深色头发、一撮呆毛、红围巾、姜黄色大衣。  女主"你"：白色毛线帽、短发、淡紫大衣、红手套。
   chibi(g, cx, 脚底y, 身高H, o)：按身高现画，H=28 是街上的小人，H 越大细节越多；外面描一圈深色边。
   o：hair coat pants scarf skin 颜色；girl 短发到肩；hat 帽色（pom 帽球色）；ahoge 呆毛；
      eyes 'n' 'shut' 'happy' 'wide' 'up' 'dn' 'sad'；mouth 'flat' 'o' 'smile' 'frown' 'none'；
      arms 'down' 'up' 'upR' 'mic'；mitt 手套色；step 1|2 走路；wind 围巾往右飘；snow 头上肩上有雪；
      tear 眼泪；blush 脸红（默认有）；rim 侧光色；tint [色, 比例] 整体偏色；buf 只返回画好的小画布 */
const HERO = { hair: '#3B2A38', coat: '#E3A23C', scarf: '#D8323C', pants: '#2E3A5E', ahoge: 1 };
const GIRL = { hair: '#6A4636', coat: '#B7A6F0', scarf: '#F7F1E8', pants: '#5A4A7A', girl: 1, hat: '#FFFFFF', pom: '#FF6A8A', mitt: '#D8323C' };
function chibi(g, cx, fy, H, o = {}) {
  const u = H / 28, r = Math.round, W = Math.ceil(H * 1.9), HT = Math.ceil(H * 1.6), t = mk(W, HT), ox = fl(W / 2), by = HT - 2;
  const skin = o.skin || '#F9DABF', skinS = '#EDB79C', hair = o.hair || '#3B2A38', hairH = lt(hair, .2), coat = o.coat || '#E3A23C', coatS = dk(coat, .18), coatD = dk(coat, .36);
  const pants = o.pants || '#2E3A5E', boots = o.boots || '#4A2A1E', scarf = o.scarf || '#D8323C', scarfS = dk(scarf, .22), mitt = o.mitt || skin, OL = o.ol || '#2A1622';
  const one = Math.max(1, r(u * .9));
  if (o.girl) { const hy0 = by - r(5 * u) - r(10 * u) + one - r(1.6 * u) - r(5.6 * u); ell(t, ox, hy0 + 2.6 * u, 8.3 * u + 1.5 * u, 7.7 * u + 2.2 * u, hair); R(t, r(ox - 9.6 * u), r(hy0), r(19.2 * u), r(9.6 * u), hair); }
  // 腿和靴子
  const lw = r(4 * u), lh = r(5 * u), gap = Math.max(1, r(u)), bh = Math.max(2, r(2 * u));
  [[-1, 1], [1, 2]].forEach(([sd, id]) => { const up = o.step === id ? one : 0, x = sd < 0 ? ox - gap - lw : ox + gap; R(t, x, by - lh, lw, lh - bh - up, pants); R(t, x + (sd > 0 ? lw - one : 0), by - lh, one, lh - bh - up, dk(pants, .25)); R(t, x - (sd < 0 ? one : 0), by - bh - up, lw + one, bh, boots); R(t, x - (sd < 0 ? one : 0), by - bh - up, lw + one, 1, lt(boots, .2)); });
  // 大衣
  const th = r(10 * u), ty = by - lh - th + one, hwT = 6 * u, hwB = 7.6 * u;
  for (let j = 0; j < th; j++) { const w = r(hwT + (hwB - hwT) * j / th); R(t, ox - w, ty + j, 2 * w, 1, coat); R(t, ox + w - r(2.2 * u), ty + j, r(2.2 * u), 1, coatS); R(t, ox - w, ty + j, one, 1, lt(coat, .22)); }
  R(t, ox - r(hwB), ty + th - one, 2 * r(hwB), one, coatD); R(t, ox - fl(one / 2), ty + r(3 * u), one, th - r(3 * u), coatS);
  for (let k = 0; k < 2; k++) R(t, ox + one, ty + r((4.6 + k * 2.6) * u), one, one, coatD);
  if (u >= 1.5) { R(t, ox - r(5.2 * u), ty + r(6 * u), r(2.6 * u), one, coatD); R(t, ox + r(2.6 * u), ty + r(6 * u), r(2.6 * u), one, coatD); }
  // 胳膊
  const aw = r(3 * u), al = r(7.4 * u), sh = ty + r(1.4 * u), a = o.arms || 'down', hand = Math.max(2, r(2.2 * u));
  const arm = (sd, up) => {
    const x = sd < 0 ? ox - r(hwT) - aw + one : ox + r(hwT) - one;
    if (up) { for (let j = 0; j < al; j++) { const dx = sd * r(j * .35); R(t, x + dx, sh + r(2 * u) - j, aw, 1, j < al - hand ? coat : mitt); if (j < al - hand) R(t, x + dx + (sd > 0 ? aw - one : 0), sh + r(2 * u) - j, one, 1, coatS); } }
    else { for (let j = 0; j < al; j++) { const dx = sd * r(j * .12); R(t, x + dx, sh + j, aw, 1, j < al - hand ? coat : mitt); if (j < al - hand) R(t, x + dx + (sd > 0 ? aw - one : 0), sh + j, one, 1, coatS); } }
  };
  arm(-1, a === 'up'); if (a !== 'mic') arm(1, a === 'up' || a === 'upR');
  // 围巾
  const sw = r(7.2 * u), sy = ty - r(1.6 * u), shh = Math.max(2, r(3.2 * u));
  R(t, ox - sw, sy, 2 * sw, shh, scarf); R(t, ox - sw, sy + shh - one, 2 * sw, one, scarfS); R(t, ox - sw, sy, 2 * sw, one, lt(scarf, .2));
  if (o.wind) { for (let j = 0; j < r(9 * u); j++) { const yy = sy + one + r(Math.sin(j / (2.2 * u)) * 1.4 * u) - r(j * .25); R(t, ox + sw - one + j, yy, 1, Math.max(2, r(2.6 * u)), j % r(3 * u) === 0 ? scarfS : scarf); } }
  else { const tx = ox + r(2.2 * u), tl = r(6.5 * u), tw = Math.max(2, r(3 * u)); R(t, tx, sy + shh - one, tw, tl, scarf); R(t, tx + tw - one, sy + shh, one, tl - one, scarfS); for (let i = 0; i < tw; i += 2) R(t, tx + i, sy + shh - one + tl, 1, one, scarf); R(t, tx - one, sy + shh - one, tw + 2 * one, one, scarfS); }
  // 头
  const rx = 8.3 * u, ry = 7.7 * u, hcx = ox, hcy = sy - r(5.6 * u);
  ell(t, hcx, hcy, rx, ry, skin);
  field(t, fl(hcx - rx), fl(hcy), Math.ceil(2 * rx + 1), Math.ceil(ry + 1), skinS, (x, y) => { const d = ((x + .5 - hcx) / rx) ** 2 + ((y + .5 - hcy) / ry) ** 2; return d <= 1 && d > .8 && y > hcy + ry * .35 ? 1 : 0; });
  // 头发：上半个头，下沿是刘海
  const zig = (x) => { const k = fl((x - (hcx - rx)) / Math.max(2, r(2.6 * u))); return [0, 1.3, .3, 1.8, .6, 1.5, 0, 1.1][((k % 8) + 8) % 8] * u; };
  field(t, fl(hcx - rx - 2 * u), fl(hcy - ry - 3 * u), Math.ceil(2 * rx + 4 * u), Math.ceil(2 * ry + 5 * u), hair, (x, y) => {
    const d = ((x + .5 - hcx) / (rx + .9 * u)) ** 2 + ((y + .5 - (hcy - .5 * u)) / (ry + 1.1 * u)) ** 2; if (d > 1) return 0;
    const side = Math.abs(x + .5 - hcx) > rx - 1.7 * u; const lim = hcy - 2.2 * u + zig(x);
    return (y < lim || (side && y < hcy + (o.girl ? ry + 1.5 * u : 2.2 * u))) ? 1 : 0;
  });
  field(t, fl(hcx - rx), fl(hcy - ry - u), Math.ceil(rx), Math.ceil(ry), hairH, (x, y) => { const d = Math.hypot((x + .5 - hcx) / (rx + .9 * u), (y + .5 - (hcy - .5 * u)) / (ry + 1.1 * u)), an = Math.atan2(y - hcy, x - hcx) * 180 / Math.PI; return d > .72 && d < .86 && an > -150 && an < -105 ? 1 : 0; });
  if (o.ahoge && !o.hat) { for (let j = 0; j < r(3.4 * u); j++) R(t, hcx + r(1 * u) + r(Math.sin(j / (1.3 * u)) * 1.2 * u), r(hcy - ry - 1.2 * u) - j, Math.max(1, r(1.3 * u)), 1, hair); }
  // 帽子
  if (o.hat) {
    const hc = o.hat, top = hcy - ry - 1.6 * u, brimY = hcy - 4.4 * u, bh2 = Math.max(2, r(2.6 * u));
    field(t, fl(hcx - rx - 2 * u), fl(top - u), Math.ceil(2 * rx + 4 * u), Math.ceil(ry + 2 * u), hc, (x, y) => { const d = ((x + .5 - hcx) / (rx + 1.3 * u)) ** 2 + ((y + .5 - (hcy - .2 * u)) / (ry + 1.9 * u)) ** 2; return d <= 1 && y < brimY ? 1 : 0; });
    field(t, fl(hcx - rx - 2 * u), fl(top - u), Math.ceil(2 * rx + 4 * u), Math.ceil(ry + 2 * u), dk(hc, .14), (x, y) => { const d = ((x + .5 - hcx) / (rx + 1.3 * u)) ** 2 + ((y + .5 - (hcy - .2 * u)) / (ry + 1.9 * u)) ** 2; return d <= 1 && y < brimY && (fl((x - hcx) / Math.max(1, r(1.2 * u))) & 1) ? 1 : 0; });
    R(t, r(hcx - rx - 1.4 * u), r(brimY), r(2 * rx + 2.8 * u), bh2, o.brim || dk(hc, .1)); R(t, r(hcx - rx - 1.4 * u), r(brimY), r(2 * rx + 2.8 * u), one, lt(o.brim || hc, .5)); R(t, r(hcx - rx - 1.4 * u), r(brimY) + bh2 - one, r(2 * rx + 2.8 * u), one, dk(o.brim || hc, .25));
    disc(t, hcx, top - .6 * u, 2.3 * u, o.pom || hc); disc(t, hcx - .5 * u, top - 1.1 * u, 1.1 * u, lt(o.pom || hc, .4));
  }
  // 脸
  const ey0 = hcy + 1.3 * u, ew = Math.max(2, r(1.9 * u)), eh = Math.max(2, r(2.9 * u)), ed = 3.9 * u, em = o.eyes || 'n', EC = '#231620';
  [-1, 1].forEach(sd => {
    let ex = r(hcx + sd * ed - ew / 2), ey = r(ey0 - eh / 2); const q = Math.max(1, r(.7 * u));
    if (em === 'up') ey -= q; if (em === 'dn') ey += q;
    if (em === 'shut') { R(t, ex - one, ey + eh - one - q, ew + 2 * one, one, EC); R(t, ex - one, ey + eh - q, one, one, EC); R(t, ex + ew, ey + eh - q, one, one, EC); return; }
    if (em === 'happy') { R(t, ex - one, ey + q, ew + 2 * one, one, EC); R(t, ex - one, ey + q + one, one, one, EC); R(t, ex + ew, ey + q + one, one, one, EC); return; }
    if (em === 'wide') { ell(t, ex + ew / 2, ey + eh / 2, ew / 2 + 1.2 * u, eh / 2 + 1.1 * u, '#FFFFFF'); R(t, ex, ey + fl(eh * .2), ew, r(eh * .6), EC); R(t, ex, ey + fl(eh * .2), one, one, '#FFFFFF'); return; }
    if (u >= 1.6) { ell(t, ex + ew / 2, ey + eh / 2, ew / 2 + .2 * u, eh / 2 + .1 * u, EC); field(t, ex - 1, ey + fl(eh / 2), ew + 2, Math.ceil(eh / 2) + 1, '#6A4050', (x, y) => ((x + .5 - ex - ew / 2) / (ew / 2 - .2 * u)) ** 2 + ((y + .5 - ey - eh / 2) / (eh / 2 - .3 * u)) ** 2 < 1 ? .6 : 0); disc(t, ex + ew * .32, ey + eh * .28, Math.max(.8, .55 * u), '#FFFFFF'); disc(t, ex + ew * .72, ey + eh * .74, Math.max(.5, .28 * u), '#FFFFFF'); if (o.girl) { R(t, ex - one, ey - one, ew + 2 * one, one, EC); R(t, ex + (sd > 0 ? ew + one : -2 * one), ey - 2 * one, one, one, EC); } }
    else { R(t, ex, ey, ew, eh, EC); R(t, ex, ey, 1, 1, '#FFFFFF'); }
    if (em === 'sad') { for (let i = 0; i < ew + 2 * one; i++) R(t, ex - one + i, ey - 2 * one - r((sd > 0 ? i : ew + 2 * one - 1 - i) * .4), 1, one, hair); }
    if (o.tear) { R(t, ex + fl(ew / 2), ey + eh, one, r(3 * u * o.tear), '#8FDCFF'); R(t, ex + fl(ew / 2) - (u >= 1.5 ? one : 0), ey + eh + r(3 * u * o.tear), one * (u >= 1.5 ? 2 : 1), one * 2, '#C8F0FF'); }
  });
  if (o.blush !== 0) [-1, 1].forEach(sd => ell(t, hcx + sd * 5.6 * u, ey0 + 2.6 * u, 1.5 * u, .8 * u, '#F58C8C', u >= 1.5 ? .8 : 1));
  const my = r(ey0 + 3.5 * u), mm = o.mouth || 'flat', MC = '#8A3A3A';
  if (mm === 'flat') R(t, hcx - one, my, 2 * one, one, MC);
  if (mm === 'o') { ell(t, hcx, my + .6 * u, Math.max(1, 1.1 * u), Math.max(1, 1.4 * u), '#7A2A34'); if (u >= 1.5) R(t, r(hcx - .5 * u), my + r(u), r(u), one, '#F0808A'); }
  if (mm === 'smile') { R(t, hcx - one, my + one, 2 * one, one, MC); R(t, hcx - 2 * one, my, one, one, MC); R(t, hcx + one, my, one, one, MC); }
  if (mm === 'frown') { R(t, hcx - one, my, 2 * one, one, MC); R(t, hcx - 2 * one, my + one, one, one, MC); R(t, hcx + one, my + one, one, one, MC); }
  // 拿麦克风的右手：横在胸前，举到嘴边
  if (a === 'mic') {
    const x = ox + r(hwT) - one; for (let j = 0; j < r(4 * u); j++) R(t, x, sh + j, aw, 1, coat);
    for (let i = 0; i < r(5 * u); i++) R(t, x - i + aw - one, sh + r(3.6 * u) - r(i * .5), 1, aw, i > r(3.2 * u) ? mitt : coat);
    const mx = x - r(4.2 * u) + aw, myy = sh + r(.6 * u); R(t, mx, myy - r(2.4 * u), Math.max(2, r(1.4 * u)), r(4.4 * u), '#2A2438'); disc(t, mx + Math.max(1, r(.7 * u)), myy - 3 * u, Math.max(1.5, 1.5 * u), '#9A9AB8'); disc(t, mx + Math.max(1, r(.5 * u)), myy - 3.3 * u, Math.max(.6, .6 * u), '#E0E0F0');
  }
  // 积雪
  if (o.snow) { field(t, fl(hcx - rx), fl(hcy - ry - 4 * u), Math.ceil(2 * rx), Math.ceil(4 * u), '#FFFFFF', (x, y) => { const top = hcy - (ry + (o.hat ? 1.9 : 1.1) * u) * Math.sqrt(Math.max(0, 1 - ((x + .5 - hcx) / (rx + u)) ** 2)); return Math.abs(x - hcx) < rx * .62 && y >= top - 1.2 * u && y < top + .4 * u ? 1 : 0; }); R(t, ox - r(hwT) - aw + one, sh - one, aw, one, '#FFFFFF'); R(t, ox + r(hwT) - one, sh - one, aw, one, '#FFFFFF'); }
  // 描边、侧光、偏色
  const d = t.getImageData(0, 0, W, HT), D = d.data, A = (x, y) => x < 0 || y < 0 || x >= W || y >= HT ? 0 : D[(y * W + x) * 4 + 3];
  const olc = h2(OL), rim = o.rim ? h2(o.rim) : null, out = new Uint8ClampedArray(D);
  for (let y = 0; y < HT; y++) for (let x = 0; x < W; x++) {
    const k = (y * W + x) * 4;
    if (!A(x, y)) { if (A(x - 1, y) || A(x + 1, y) || A(x, y - 1) || A(x, y + 1)) { out[k] = olc[0]; out[k + 1] = olc[1]; out[k + 2] = olc[2]; out[k + 3] = 255; } }
    else if (rim) { const s = o.rimSide === 'l' ? -1 : 1; let e = 0; for (let i = 1; i <= Math.max(1, r(u * .9)); i++) if (!A(x + s * i, y)) e = 1; if (e) { out[k] = rim[0]; out[k + 1] = rim[1]; out[k + 2] = rim[2]; } }
  }
  if (o.tint) { const tc = h2(o.tint[0]), tt = o.tint[1]; for (let k = 0; k < out.length; k += 4) if (out[k + 3]) { out[k] += (tc[0] - out[k]) * tt; out[k + 1] += (tc[1] - out[k + 1]) * tt; out[k + 2] += (tc[2] - out[k + 2]) * tt; } }
  d.data.set(out); t.putImageData(d, 0, 0);
  if (o.buf) return t;
  g.drawImage(t.canvas, Math.round(cx) - ox, Math.round(fy) - by);
  return { hx: Math.round(cx), hy: Math.round(fy) - by + hcy, top: Math.round(fy) - by + r(hcy - ry - 2 * u) };
}
/* 很小的小人（远处的路人、橱窗里的剪影、相框里的合照）：7×11 */
const MINI = ['..HHH..', '.HHHHH.', '.HSSSH.', '.SeSeS.', '.RRRRR.', 'CCCCCCC', 'CCCCCCC', '.CCCCC.', '.PP.PP.', '.PP.PP.', '.BB.BB.'];
function mini(g, x, fy, o = {}) {
  const pal = { H: o.hair || '#3B2A38', S: '#F9DABF', e: '#231620', R: o.scarf || '#D8323C', C: o.coat || '#E3A23C', P: o.pants || '#2E3A5E', B: '#4A2A1E' };
  MINI.forEach((row, j) => { for (let i = 0; i < 7; i++) { const c = row[i]; if (c === '.') continue; R(g, x + i, fy - 11 + j, 1, 1, o.sil || (o.hat && j < 2 ? o.hat : pal[c])); } });
  if (o.hat && !o.sil) R(g, x + 3, fy - 12, 1, 1, o.pom || o.hat);
}
