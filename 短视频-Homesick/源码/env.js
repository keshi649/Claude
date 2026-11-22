'use strict';
/* env.js：场景的零件。天空、楼群、霓虹、湿地面的倒影、雨、路灯、车、打伞的路人、光斑、室内的灯和桌上的东西。
   每样都带时间参数，画面里一直有东西在动：雨、车灯、闪烁的窗和招牌、走过的人、飘的灰尘。 */

/* ---------------- 天空 ---------------- */
function skyNight(y0, y1, o = {}) {
  const top = o.top ?? hx('#0B0E1F'), mid = o.mid ?? hx('#1C2142'), low = o.low ?? hx('#4A3554'), glowc = o.glow ?? hx('#B0607A');
  vgrad(0, y0, W, y1 - y0, [[0, top], [.55, mid], [.85, low], [1, glowc]], 14);
}
function stars(y0, y1, t, n = 60, seed = 1) {
  for (let i = 0; i < n; i++) {
    const x = Math.floor(h2(i, seed) * W), y = Math.floor(y0 + h2(i, seed + 1) * (y1 - y0));
    const tw = .5 + .5 * Math.sin(t * (1 + h2(i, seed + 2) * 3) + i);
    px(x, y, hx('#DDE6FF'), .25 + .6 * tw * h2(i, seed + 3));
  }
}
/* 云：几层横向拉长的椭圆，慢慢飘 */
function clouds(y, t, o = {}) {
  const c = o.c ?? hx('#2A2C4C'), hl = o.hl ?? hx('#5A4A6A'), sp = o.sp ?? 2, n = o.n ?? 7, seed = o.seed ?? 3, a = o.a ?? 1;
  for (let i = 0; i < n; i++) {
    const w = 60 + h2(i, seed) * 120, x = ((h2(i, seed + 1) * (W + 300) + t * sp * (.6 + h2(i, seed + 2))) % (W + 300)) - 150;
    const yy = y + h2(i, seed + 3) * (o.h ?? 40);
    ell(x, yy, w / 2, 6 + h2(i, seed + 4) * 8, c, a);
    ell(x - w * .15, yy - 3, w / 3, 5 + h2(i, seed + 5) * 5, c, a);
    rect(x - w * .35, yy - 5, w * .55, 1, hl, a * .6);
  }
}

/* ---------------- 楼群 ---------------- */
/* 一排楼：seed 决定每栋楼的宽高、窗户；off 是视差平移；o.win 亮窗颜色表；o.fog 和远处的雾混合多少 */
function skyline(ybase, o = {}) {
  const seed = o.seed ?? 11, off = o.off ?? 0, minH = o.minH ?? 40, maxH = o.maxH ?? 140, t = o.t ?? 0;
  const body = o.body ?? hx('#151A2E'), edge = o.edge ?? hx('#232A44'), fog = o.fog ?? 0, fogc = o.fogc ?? hx('#3A3456');
  const wins = o.win ?? [hx('#FFD38A'), hx('#FFE9B8'), hx('#9CC8FF'), hx('#FFB070')];
  const wf = o.winFrac ?? .35, ww = o.ww ?? 2, wh = o.wh ?? 2, gapx = o.gx ?? 4, gapy = o.gy ?? 5;
  let x = -((off % 2000) + 2000) % 2000 - 60, i = Math.floor(off / 2000) * 97;
  const bodyC = mix(body, fogc, fog), edgeC = mix(edge, fogc, fog * .8);
  while (x < W + 40) {
    const bw = Math.round(28 + h2(i, seed) * (o.maxW ?? 60)), bh = Math.round(minH + h2(i, seed + 1) * (maxH - minH));
    const top = ybase - bh;
    rect(x, top, bw, bh + 2, bodyC);
    rect(x, top, 1, bh, edgeC); rect(x, top, bw, 1, edgeC);
    // 楼顶：水箱、天线、红色的航空灯
    const kind = h2(i, seed + 2);
    if (kind < .3) { rect(x + bw * .3, top - 6, bw * .25, 6, bodyC); rect(x + bw * .3, top - 6, bw * .25, 1, edgeC); }
    else if (kind < .5) { rect(x + bw / 2, top - 14, 1, 14, edgeC); if (Math.sin(t * 3 + i) > .3) { px(x + bw / 2, top - 15, hx('#FF4A4A')); glow(x + bw / 2, top - 15, 4, hx('#FF3030'), .8); } }
    else if (kind < .62) { poly([x, top, x + bw, top, x + bw / 2, top - 10], bodyC); }
    // 窗
    for (let wy = top + 4; wy < ybase - 3; wy += gapy) for (let wx = x + 3; wx < x + bw - 3; wx += gapx) {
      const r = h3(i, wx - x, wy - top);
      if (r < wf) {
        const fl = h3(i + 7, wx, wy) < .05 ? (Math.sin(t * (2 + r * 9) + wx) > 0 ? 1 : .25) : 1;
        const c = wins[Math.floor(h3(i, wy, wx) * wins.length)];
        rect(wx, wy, ww, wh, mix(c, fogc, fog * .6), (.55 + .45 * h3(wx, wy, i)) * fl);
        if (o.glowWin && r < wf * .4) glow(wx + 1, wy + 1, 3, c, .15 * fl);
      } else if (r < wf + .1) rect(wx, wy, ww, wh, mix(edgeC, body, .5));
    }
    x += bw + Math.round(h2(i, seed + 5) * 6); i++;
  }
}
/* 雾带：一层半透明的横向渐变 */
function fogBand(y, h, c, a) { for (let j = 0; j < h; j++) { const k = 1 - Math.abs(j / h * 2 - 1); rect(0, y + j, W, 1, c, qa(a * k)); } }

/* ---------------- 霓虹招牌 ---------------- */
function neon(s, x, y, c, t, o = {}) {
  const fl = o.flicker ? (noise1(t * 6, o.seed || 3) > -.6 ? 1 : .2) : 1;
  const sx = o.sx || 1, w = textW(s, o.font || 'fp') * sx;
  if (o.box) { rect(x - 3, y - 12 * sx - 2, w + 6, 12 * sx + 6, hx('#0E0E16'), .9); rect(x - 3, y - 12 * sx - 2, w + 6, 1, c, .5 * fl); rect(x - 3, y + 3, w + 6, 1, c, .5 * fl); }
  text(s, x, y, { col: mix(c, 0xffffff, .55 * fl), sx, font: o.font, out: mulc(c, .45), oa: .8 * fl });
  for (let k = 0; k < [...s].length; k++) glow(x + (k + .5) * w / [...s].length, y - 5 * sx, 9 * sx, c, .5 * fl);
  return w;
}

/* ---------------- 倒影 ---------------- */
/* 把地平线 yh 以上的画面翻到下面（y0~y1），变暗、变色，按行左右抖动（水面、湿地面） */
function reflect(yh, y0, y1, t, o = {}) {
  const k = o.k ?? .45, tint = o.tint ?? [.8, .85, 1], wob = o.wob ?? 2, sp = o.sp ?? 3, str = o.streak ?? 0;
  const src = B.slice(0);
  for (let y = y0; y < y1; y++) {
    const sy = Math.round(2 * yh - y - 1); if (sy < 0) continue;
    const d = (y - yh) / (y1 - yh + 1);
    const ox = Math.round(noise1(y * .45 + t * sp, 7) * wob * (1 + d * 2));
    const fade = k * (1 - d * (o.fall ?? .6));
    for (let x = 0; x < W; x++) {
      // 竖着拉长的倒影（湿柏油路）：往上多取几行平均
      let sx = x + ox; if (sx < 0) sx = 0; if (sx >= W) sx = W - 1;
      let r = 0, g = 0, b = 0, n = 0;
      for (let q = 0; q <= str; q += 2) { const yy = Math.max(0, sy - q); const i = (yy * W + sx) << 2; r += src[i]; g += src[i + 1]; b += src[i + 2]; n++; }
      const i = (y * W + x) << 2;
      B[i] += (r / n * tint[0] - B[i]) * fade; B[i + 1] += (g / n * tint[1] - B[i + 1]) * fade; B[i + 2] += (b / n * tint[2] - B[i + 2]) * fade;
    }
  }
}

/* ---------------- 雨 ---------------- */
/* 三层雨：远处细密、近处粗长；ang 是斜度；splash 在地面 gy 溅起 */
function rain(t, o = {}) {
  const n = o.n ?? 220, ang = o.ang ?? .18, c = o.c ?? hx('#B9C9E8'), a = o.a ?? .5, gy = o.gy ?? H, seed = o.seed ?? 5;
  const layers = [[.45, 5, .35, 1], [.75, 9, .5, 1], [1.2, 16, .7, 2]];
  for (const [sp, len, al, wdt] of layers) {
    const cnt = Math.round(n * (wdt === 2 ? .12 : .44));
    for (let i = 0; i < cnt; i++) {
      const r1 = h2(i, seed + len), r2 = h2(i, seed + len + 1);
      const speed = 380 * sp;
      const y = ((r2 * (H + 60) + t * speed) % (H + 60)) - 30;
      const x = ((r1 * (W + 80) - y * ang + t * speed * ang * .2) % (W + 80) + W + 80) % (W + 80) - 40;
      if (y > gy) continue;
      const x2 = x + len * ang, y2 = y + len;
      let cc = c, aa = a * al;
      if (o.lit) { const L = o.lit(x, y); if (L > 0) { cc = mix(c, o.litc ?? hx('#FFE2B0'), Math.min(1, L * 1.5)); aa = Math.min(1, aa + L * .6); } }
      line(x, y, x2, y2, cc, qa(aa));
      if (wdt === 2) line(x + 1, y, x2 + 1, y2, cc, qa(aa * .5));
    }
  }
  if (o.splash) {
    for (let i = 0; i < (o.splashN ?? 40); i++) {
      const ph = (t * 2.2 + h2(i, 77)) % 1, x = h2(i, 78 + Math.floor(t * 2.2 + h2(i, 77))) * W, y = gy - 2 + h2(i, 79) * (o.splashH ?? 50);
      if (ph < .35) { const r = ph * 10; px(x - r, y - r * .5, c, .5 * (1 - ph / .35)); px(x + r, y - r * .5, c, .5 * (1 - ph / .35)); px(x, y - r, c, .4 * (1 - ph / .35)); }
      if (ph < .6) { const r = 1 + ph * 9; ell(x, y + 1, r, r * .3, c, qa(.25 * (1 - ph / .6))); }
    }
  }
}
/* 镜头上的水珠：几个慢慢往下滑的亮点 */
function lensDrops(t, n = 8, seed = 9) {
  for (let i = 0; i < n; i++) {
    const x = h2(i, seed) * W, y = (h2(i, seed + 1) * H + t * (6 + h2(i, seed + 2) * 14)) % H, r = 2 + h2(i, seed + 3) * 4;
    circ(x, y, r, hx('#DDE8FF'), .08); circ(x - r * .3, y - r * .3, Math.max(1, r * .3), 0xffffff, .25);
  }
}

/* ---------------- 光 ---------------- */
/* 光锥：从 (x,y) 往下张开，一行一行画，透明度量化（像素风），用滤色叠 */
function cone(x, y, w0, w1, h, c, a, o = {}) {
  for (let j = 0; j < h; j++) {
    const k = j / h, w = lerp(w0, w1, k), fade = a * (1 - k) * (o.even ? 1 : (.6 + .4 * Math.sin(k * 3.1)));
    const xs = x - w / 2 + (o.tilt || 0) * j;
    for (let i = 0; i < w; i++) {
      const e = Math.min(i, w - i) / (w / 2), al = qa(fade * Math.min(1, e * 2.5));
      if (al > 0) px(xs + i, y + j, c, al, 3);
    }
  }
}
/* 焦外光斑：前景虚掉的灯 */
function bokeh(x, y, r, c, a) {
  ell(x, y, r, r, c, qa(a * .5), 3); ell(x, y, r - 1, r - 1, c, qa(a * .25), 3);
  glow(x, y, r * 1.4, c, a * .4);
}
function streetLamp(x, ytop, ybot, t, o = {}) {
  const c = o.c ?? hx('#FFD9A0'), pole = o.pole ?? hx('#1A1C26');
  rect(x - 1, ytop, 2, ybot - ytop, pole);
  rect(x - 1, ytop, 10 * (o.dir ?? 1), 2, pole);
  const hx_ = x + 9 * (o.dir ?? 1);
  rect(hx_ - 3, ytop + 1, 6, 2, pole); rect(hx_ - 2, ytop + 3, 4, 1, c);
  cone(hx_, ytop + 4, 4, o.spread ?? 70, (o.len ?? (ybot - ytop)), c, o.a ?? .22);
  glow(hx_, ytop + 3, 14, c, 1.1);
}

/* ---------------- 车 ---------------- */
/* 侧面的车：dir 朝向，车灯往前打一束光 */
function car(x, gy, dir, col, t, o = {}) {
  const L = o.L ?? 64, Hh = o.Hh ?? 18;
  const body = col, dark = mulc(col, .55), glass = hx('#2B3A55');
  const P = (a, b) => [x + a * dir, gy - b];
  const pp = arr => { const out = []; for (let i = 0; i < arr.length; i += 2) { const p = P(arr[i], arr[i + 1]); out.push(p[0], p[1]); } return out; };
  poly(pp([-L / 2, 4, L / 2, 4, L / 2, 11, L / 2 - 4, 13, L * .2, 14, L * .05, Hh, -L * .3, Hh, -L * .42, 13, -L / 2, 12]), body);
  poly(pp([L * .02, Hh - 1, -L * .28, Hh - 1, -L * .36, 13.5, L * .17, 13.5]), glass);
  rect(Math.min(...[P(-L / 2, 0)[0], P(L / 2, 0)[0]]), gy - 7, L, 1, mulc(col, 1.2), .5);
  for (const w of [-L * .3, L * .3]) { const p = P(w, 4); circ(p[0], p[1], 5, hx('#0D0D12')); circ(p[0], p[1], 2, hx('#4A4E5A')); }
  const fl = P(L / 2 - 1, 9), rl = P(-L / 2 + 1, 9);
  rect(fl[0] - 1, fl[1] - 1, 3, 2, hx('#FFF6D8')); rect(rl[0] - 1, rl[1] - 1, 3, 2, hx('#FF3A3A'));
  glow(fl[0], fl[1], 10, hx('#FFF0C8'), 1.2); glow(rl[0], rl[1], 8, hx('#FF2020'), .9);
  if (!o.noBeam) for (let j = 0; j < 90; j++) {
    const w = 2 + j * .35, xx = fl[0] + dir * j;
    for (let k = -w / 2; k < w / 2; k++) px(xx, fl[1] + k * .5 + j * .06, hx('#FFF0C8'), qa(.18 * (1 - j / 90)), 3);
  }
}

/* ---------------- 路人 ---------------- */
/* 打伞的路人（剪影，带一点轮廓光）：x 位置，gy 地面，s 身高，umb 伞色，ph 走路相位，dir 方向 */
function walker(x, gy, s, umb, ph, dir, o = {}) {
  const body = o.body ?? hx('#11131C'), rimc = o.rim ?? hx('#6A7AA8');
  const bob = Math.abs(Math.sin(ph * TAU)) * s * .02;
  const sw = Math.sin(ph * TAU) * s * .09;
  const top = gy - s - bob;
  // 腿
  line(x - 1, gy - s * .45, x - 1 + sw, gy, body); line(x, gy - s * .45, x - sw, gy, body);
  line(x + 1, gy - s * .45, x + 1 - sw, gy, body);
  // 身体
  poly([x - s * .12, top + s * .22, x + s * .12, top + s * .22, x + s * .14, gy - s * .42, x - s * .14, gy - s * .42], body);
  circ(x, top + s * .12, s * .09, body);
  // 伞
  if (umb !== null && umb !== undefined) {
    const ux = x + dir * s * .05, uy = top - s * .02, ur = s * .42;
    line(ux, uy, x + dir * s * .1, top + s * .4, hx('#2A2A30'));
    const pts = []; for (let k = 0; k <= 12; k++) { const a = Math.PI + Math.PI * k / 12; pts.push(ux + Math.cos(a) * ur, uy + Math.sin(a) * ur * .45); }
    for (let k = 12; k >= 0; k--) { const a = Math.PI + Math.PI * k / 12; pts.push(ux + Math.cos(a) * ur, uy + 1 + (k % 3 === 0 ? 1 : 0)); }
    poly(pts, umb);
    poly(pts.slice(0, 14), mix(umb, 0xffffff, .3), .35);
    if (o.clear) poly(pts, hx('#DDE8F8'), .25);
  }
  rect(x - s * .14, top + s * .22, 1, gy - s * .42 - top - s * .22, rimc, .6);
}

/* ---------------- 室内 ---------------- */
/* 飘在光里的灰尘 */
function dust(x0, y0, w, h, t, n, c = hx('#FFE8C0'), a = .6, seed = 21) {
  for (let i = 0; i < n; i++) {
    const x = x0 + ((h2(i, seed) * w + Math.sin(t * .4 + i) * 6 + t * 1.5) % w);
    const y = y0 + ((h2(i, seed + 1) * h - t * (1.5 + h2(i, seed + 2) * 2)) % h + h) % h;
    px(x, y, c, qa(a * (.4 + .6 * Math.abs(Math.sin(t * 1.3 + i)))));
  }
}
/* 蜡烛的火苗：o.k 亮度；会摇 */
function flame(x, y, t, k = 1, seed = 1) {
  const sw = noise1(t * 7, seed) * 1.2, hgt = 4 + noise1(t * 5, seed + 3) * 1;
  poly([x - 1.4, y, x + 1.4, y, x + sw * .6, y - hgt, x + sw, y - hgt - 1.5], hx('#FFB347'), k);
  poly([x - .7, y, x + .7, y, x + sw * .4, y - hgt * .7], hx('#FFF4C8'), k);
  glow(x + sw * .5, y - 2, 9, hx('#FFB050'), .45 * k);
  glow(x, y - 2, 3, hx('#FFE8B0'), .35 * k);
}

/* ---------------- 街面：一排各式各样的店 ---------------- */
/* kind：cafe（条纹雨棚、暖光、窗边坐着人）、store（便利店，白绿的光洒到人行道）、flower（花店，门口摆花）、
   bar（暗红灯、竖招牌）、closed（拉下卷帘门） */
function shopFront(x, w, gy, kind, t, o = {}) {
  const h = o.h ?? 34, top = gy - h;
  const wall = o.wall ?? hx('#16141F');
  rect(x, top - 30, w, 30 + h, wall);
  rect(x, top - 30, w, 1, mulc(wall, 1.6));
  const seed = Math.floor(x * 7 + w);
  if (kind === 'cafe') {
    const c = hx('#FFC27A');
    rect(x + 3, top + 6, w - 6, h - 8, mulc(c, .6)); rect(x + 3, top + 6, w - 6, 1, c);
    for (let k = 0; k < 3; k++) { const px_ = x + 8 + k * (w - 16) / 3; rect(px_, top + 18, 5, 7, hx('#3A2418')); circ(px_ + 2, top + 16, 2, hx('#3A2418')); }   // 窗边的客人
    for (let k = 0; k < 4; k++) { const lx = x + 6 + k * (w - 12) / 4; px(lx, top + 9, hx('#FFF2C8')); glow(lx, top + 9, 5, c, .4); }  // 小灯泡
    for (let k = 0; k < w; k += 6) rect(x + k, top, 3, 5, hx('#E8E0D0')), rect(x + k + 3, top, 3, 5, hx('#2E5A48'));   // 条纹雨棚
    rect(x, top + 5, w, 1, hx('#0A0A10'), .6);
    glowRect(x + 3, top + 6, w - 6, h - 8, c, .1);
    for (let j = 0; j < 14; j++) rect(x + 2 - j * .4, gy + j, w - 4 + j * .8, 1, c, qa(.14 * (1 - j / 14)));   // 洒到人行道的光
  } else if (kind === 'store') {
    const c = hx('#D8FFF0');
    rect(x + 2, top + 4, w - 4, h - 4, mulc(c, .75));
    for (let k = 0; k < 3; k++) rect(x + 5, top + 8 + k * 7, w - 10, 2, hx('#5A8A80'));   // 货架
    for (let k = 0; k < 5; k++) rect(x + 6 + k * 5, top + 6 + (k % 3) * 7, 3, 2, [hx('#FF7A7A'), hx('#FFD27A'), hx('#7AB4FF')][k % 3]);
    rect(x + 2, top - 6, w - 4, 6, hx('#1E8A5A')); rect(x + 2, top - 6, w - 4, 1, hx('#7CFFB0'));
    rect(x + w * .55, top + 10, 6, h - 10, hx('#2A3A3A'));   // 收银台后的店员
    circ(x + w * .55 + 3, top + 8, 2.5, hx('#2A3A3A'));
    glowRect(x + 2, top + 4, w - 4, h - 4, c, .16);
    for (let j = 0; j < 18; j++) rect(x - j * .5, gy + j, w + j, 1, c, qa(.2 * (1 - j / 18)));
  } else if (kind === 'flower') {
    const c = hx('#FFD8E0');
    rect(x + 3, top + 6, w - 6, h - 8, mulc(c, .45));
    for (let k = 0; k < 16; k++) { const fx = x + 4 + h2(k, seed) * (w - 8), fy = gy - 3 - h2(k, seed + 1) * 10; px(fx, fy, [hx('#FF6A8A'), hx('#FFE07A'), hx('#FFFFFF'), hx('#C88CFF')][k % 4]); px(fx, fy + 1, hx('#3A6A3A')); }
    rect(x + 2, gy - 4, w - 4, 4, hx('#3A2A24'));
    glowRect(x + 3, top + 6, w - 6, h - 8, c, .07);
  } else if (kind === 'bar') {
    const c = hx('#FF5A4A');
    rect(x + 4, top + 8, w - 8, h - 10, mulc(c, .3)); rect(x + w / 2 - 3, top + 10, 6, h - 10, hx('#1A0A0A'));
    glowRect(x + 4, top + 8, w - 8, h - 10, c, .08);
  } else {
    for (let k = 0; k < h - 4; k += 2) rect(x + 3, top + 4 + k, w - 6, 1, hx('#2A2A36'));
  }
  // 楼上：窗、空调外机、竖招牌
  for (let k = 0; k < Math.floor(w / 14); k++) {
    const wx = x + 4 + k * 14, lit = h2(seed, k) < .5;
    rect(wx, top - 24, 8, 10, lit ? hx('#FFCF8A') : hx('#0D0D16'), lit ? .8 : 1);
    if (lit && h2(seed, k + 9) < .5) rect(wx + 2, top - 22, 3, 8, hx('#4A2A1A'), .6);   // 窗帘后的人影
    if (h2(seed, k + 3) < .4) { rect(wx + 1, top - 12, 6, 4, hx('#3A3E4A')); rect(wx + 2, top - 11, 2, 2, hx('#22242C')); }   // 空调外机
  }
}
/* 竖招牌（韩剧街头常见） */
function vSign(x, y, s, c, t, o = {}) {
  const chars = [...s], n = chars.length;
  rect(x - 2, y - 2, 16, n * 13 + 4, hx('#0E0E16'), .95);
  rect(x - 2, y - 2, 16, 1, c, .6); rect(x - 2, y + n * 13 + 1, 16, 1, c, .6);
  const fl = o.flicker ? (noise1(t * 5, o.seed || 2) > -.5 ? 1 : .25) : 1;
  chars.forEach((ch, k) => { text(ch, x, y + 11 + k * 13, { col: mix(c, 0xffffff, .5 * fl), out: mulc(c, .4), oa: .8 * fl }); glow(x + 6, y + 6 + k * 13, 8, c, .45 * fl); });
}
/* 车灯在湿路面上的长倒影 */
function beamReflect(x, y, len, c, a) {
  for (let j = 0; j < len; j++) { const w = 1 + j * .05; rect(x - w, y + j, w * 2, 1, c, qa(a * (1 - j / len) * (.6 + .4 * Math.sin(j * .7)))); }
}
/* 积水：椭圆里加一点亮的反光和涟漪 */
function puddle(x, y, rx, ry, t, c, o = {}) {
  ell(x, y, rx, ry, c, qa(o.a ?? .3), 3);
  for (let i = 0; i < (o.n ?? 4); i++) {
    const ph = (t * .9 + h2(i, 31)) % 1, px_ = x + (h2(i, 32 + Math.floor(t * .9 + h2(i, 31))) - .5) * rx * 1.4, py = y + (h2(i, 33) - .5) * ry;
    const r = 1 + ph * 8; ell(px_, py, r, r * .35, hx('#E8F0FF'), qa(.35 * (1 - ph)));
  }
}

/* ---------------- 室内：窗、吊灯、钟、桌上的东西 ---------------- */
/* 窗外的夜城（焦外）：远处的楼 + 一片虚掉的灯 + 玻璃上的雨痕 */
function windowCity(x, y, w, h, t, o = {}) {
  const old = target(newBuf()); clear(0);
  vgrad(x, y, w, h, [[0, hx('#0B0E20')], [.7, hx('#1E1A38')], [1, hx('#4A2A48')]], 10);
  skyline(y + h - 10, { seed: o.seed ?? 21, off: (o.off ?? 0) + t * .5, minH: h * .3, maxH: h * .8, fog: .5, fogc: hx('#2A2446'), winFrac: .3, t, ww: 1, wh: 1, gx: 3, gy: 3, maxW: 26 });
  for (let i = 0; i < (o.nb ?? 26); i++) {   // 焦外的灯
    const bx = x + h2(i, 41) * w, by = y + h * .45 + h2(i, 42) * h * .55, r = 3 + h2(i, 43) * 7;
    const c = [hx('#FFC878'), hx('#FF7AA0'), hx('#8AD0FF'), hx('#FFE6B0')][i % 4];
    ell(bx, by, r, r, c, qa(.16 + .12 * Math.sin(t * .7 + i)), 3);
  }
  const src = B; target(old);
  // 贴回去（只贴窗框以内），整体压暗一点
  for (let j = Math.max(0, y); j < Math.min(H, y + h); j++) for (let i = Math.max(0, x); i < Math.min(W, x + w); i++) {
    const q = (j * W + i) << 2; B[q] = src[q] * .9; B[q + 1] = src[q + 1] * .9; B[q + 2] = src[q + 2];
  }
  // 玻璃上的雨痕：往下滑的水珠，后面拖一条线
  for (let i = 0; i < (o.drops ?? 22); i++) {
    const dx = x + 3 + h2(i, 51) * (w - 6), sp = 3 + h2(i, 52) * 9, dy = y + ((h2(i, 53) * h + t * sp) % h);
    for (let k = 0; k < 10; k++) px(dx + Math.sin((dy - k) * .3) * .6, dy - k, hx('#AFC4E8'), qa(.25 * (1 - k / 10)));
    rect(dx, dy, 2, 2, hx('#DDE8FF'), .5);
  }
}
/* 吊灯：线从画面顶上垂下来，灯罩、灯泡、光锥、光里的灰尘 */
function pendant(x, y, t, o = {}) {
  const c = o.c ?? hx('#FFD9A0'), sh = o.shade ?? hx('#1C1A1E');
  const sw = Math.sin(t * .8) * (o.sway ?? .6);
  line(x, 0, x + sw, y - 10, hx('#0E0C10'));
  poly([x - 16 + sw, y, x + 16 + sw, y, x + 9 + sw, y - 10, x - 9 + sw, y - 10], sh);
  rect(x - 9 + sw, y - 10, 18, 1, mulc(sh, 1.8));
  rect(x - 14 + sw, y, 28, 1, mulc(c, .7));
  ell(x + sw, y + 1, 4, 2, hx('#FFF6DA'));
  cone(x + sw, y + 2, 26, o.spread ?? 220, o.len ?? 160, c, o.a ?? .22);
  glow(x + sw, y + 2, 30, c, 1.3);
  if (o.dust !== false) dust(x - 60, y + 10, 120, o.len ?? 150, t, 26, hx('#FFE8C0'), .5);
}
/* 挂钟：o.h、o.m 时针分针（可以是小数），秒针一格一格走 */
function wallClock(x, y, r, t, o = {}) {
  circ(x, y, r + 2, hx('#1A1416')); circ(x, y, r, hx('#EDE4D6')); circ(x, y, r - 2, hx('#F7F0E4'));
  for (let k = 0; k < 12; k++) { const a = k / 12 * TAU; px(x + Math.cos(a) * (r - 3), y + Math.sin(a) * (r - 3), hx('#3A3034')); }
  const hand = (a, len, c) => line(x, y, x + Math.cos(a - Math.PI / 2) * len, y + Math.sin(a - Math.PI / 2) * len, c);
  hand((o.h ?? 11.7) / 12 * TAU, r * .5, hx('#2A2226'));
  hand((o.m ?? 42) / 60 * TAU, r * .78, hx('#2A2226'));
  const sec = o.sec ?? Math.floor(t) % 60;
  hand(sec / 60 * TAU, r * .85, hx('#B8323A'));
  px(x, y, hx('#B8323A'));
}
/* 生日蛋糕：奶油、草莓、几根蜡烛（会摇的火苗），o.lit=0 时蜡烛灭了、冒烟 */
function cake(x, y, t, o = {}) {
  const lit = o.lit ?? 1, w = o.w ?? 40;
  ell(x, y + 2, w * .62, 5, hx('#D9D2C8'));                  // 盘子
  ell(x, y + 1, w * .62, 4, hx('#F2EDE6'));
  rect(x - w / 2, y - 16, w, 16, hx('#F6EFE8'));             // 蛋糕身
  ell(x, y - 16, w / 2, 5, hx('#FFF8F2'));                   // 顶面
  for (let k = 0; k < 9; k++) { const cx = x - w / 2 + 2 + k * (w - 4) / 8; circ(cx, y - 16 + (k % 2), 2, hx('#FFFFFF')); }   // 奶油花边
  for (let k = 0; k < 5; k++) { const cx = x - w / 2 + 6 + k * (w - 12) / 4; circ(cx, y - 18 + (k % 2) * 2, 2, hx('#D8304A')); px(cx - 1, y - 19 + (k % 2) * 2, hx('#FF8A9A')); }
  rect(x - w / 2, y - 6, w, 2, hx('#E8C8D0'));               // 夹心
  rect(x - w / 2, y - 16, 1, 16, hx('#D8CEC4')); rect(x + w / 2 - 1, y - 16, 1, 16, hx('#E0D6CC'));
  const n = o.n ?? 5;
  for (let k = 0; k < n; k++) {
    const cx = x - w * .32 + k * w * .64 / (n - 1), cy = y - 18 - (k % 2) * 2, hgt = 9 - (o.melt ?? 0) * 5;
    rect(cx - 1, cy - hgt, 2, hgt, [hx('#F2C8D0'), hx('#BFE0F2'), hx('#F8E6A8')][k % 3]);
    if (lit > 0) flame(cx, cy - hgt, t + k * 1.7, lit, k + 1);
    else if (o.smoke) for (let j = 0; j < 14; j++) { const sy = cy - hgt - j * 2 - ((t * 10) % 2); px(cx + Math.sin(j * .5 + t * 2 + k) * (j * .25), sy, hx('#C8C0C8'), qa(.4 * (1 - j / 14) * o.smoke)); }
  }
}
/* 高脚杯：o.fill 酒的高度（0~1），o.c 酒色 */
function wineGlass(x, y, t, o = {}) {
  const h = o.h ?? 26, gl = hx('#DCE6F2');
  rect(x - 5, y - 1, 10, 1, gl, .6);                         // 底座
  rect(x, y - h * .45, 1, h * .45, gl, .7);                   // 杯脚
  const top = y - h, bw = 7;
  const bowl = []; for (let k = 0; k <= 10; k++) { const a = Math.PI * k / 10; bowl.push(x + .5 - Math.cos(a) * bw, top + h * .25 + Math.sin(a) * h * .3); }
  bowl.push(x + .5 + bw, top); bowl.push(x + .5 - bw, top);
  poly(bowl, gl, .14);
  if ((o.fill ?? 0) > 0) {
    const fy = top + h * .55 - (o.fill) * h * .3, wine = o.c ?? hx('#6A0E22');
    const wp = []; for (let k = 0; k <= 10; k++) { const a = Math.PI * k / 10; const yy = top + h * .25 + Math.sin(a) * h * .3; if (yy >= fy) wp.push(x + .5 - Math.cos(a) * bw, yy); }
    wp.push(x + .5 + bw * .9, fy); wp.push(x + .5 - bw * .9, fy);
    poly(wp, wine, .9); rect(x - bw + 2, fy, bw * 2 - 3, 1, mix(wine, hx('#FF6A7A'), .5));
  }
  line(x - bw + 1, top + 2, x - bw + 2, top + h * .4, 0xffffff, .5);   // 杯壁的高光
  rect(x - bw, top, bw * 2 + 1, 1, gl, .5);
}
