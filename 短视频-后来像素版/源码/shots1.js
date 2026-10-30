'use strict';
/* shots1.js —— 前奏（0 ~ 14.1 秒）：十三个闪回，一拍一个（全是后面会出现的画面：伏笔），每个闪回角上一个胶片日期戳；
   然后所有闪回变成小照片卷进漩涡，炸成像素，拼出片名「后来」（12.24 秒唱"后来"）；片名化成雨落下去，接城市。 */

/* 借用后面某个镜头在某个时刻的画面 */
function playShot(g, fn, tt) { const sh = SHOTS.find(z => z.fn === fn); window[fn](g, tt, tt - sh.t, sh); }
/* 闪回的统一包装：胶片日期戳、四角取景框、一进来的色差和闪光 */
function memoryFrame(g, t, s, stamp) {
  const u = t - s.t;
  const fw = 6; R(g, 0, 0, W, fw, '#05040C'); R(g, 0, H - fw, W, fw, '#05040C');
  [[12, 12, 1, 1], [W - 13, 12, -1, 1], [12, H - 13, 1, -1], [W - 13, H - 13, -1, -1]].forEach(([x, y, dx, dy]) => { R(g, x, y, 10 * dx, 1, '#FFFFFF'); R(g, x, y, 1, 10 * dy, '#FFFFFF'); });
  if (stamp) { tiny(g, stamp, W - 22, 214, '#FF8A2A', { align: 'r' }); glow(g, W - 40, 216, 16, '#FF8A2A', .35, 2); }
  if (fl(t * 2) % 2 === 0) { disc(g, 24, 248, 2, '#FF3A3A'); tiny(g, 'REC', 30, 246, '#FFFFFF'); }
  if (u < .08) { g.save(); g.globalAlpha = .55 * (1 - u / .08); R(g, 0, 0, W, H, '#FFFFFF'); g.restore(); }
  if (u < .15) window.FX_EXTRA = { ca: 3 * (1 - u / .15) };
  for (let i = 0; i < 3; i++) { const x = hash(fl(t * 24), i) * W; if (hash(fl(t * 24), i + 5) < .3) R(g, x, 0, 1, H, rgba('#FFFFFF', .08)); }   // 胶片划痕
}
function gMeteor(g, t, u, s) {
  hillNight(g, t + 70, { mx: 400, my: 40, mr: 10 });
  monAt(g, 220, 192, 3, { col: '#0E0C1E', skirt: true, legs: 'tuck', eyes: 'up', clip: 'fresh', rim: ['#C8B8FF', 'l'] });
  monAt(g, 258, 192, 3, { col: '#0E0C1E', cowlick: true, legs: 'tuck', eyes: 'up', rim: ['#C8B8FF', 'r'] });
  for (let i = 0; i < 14; i++) meteor(g, t, -.2 + i * .13, 100 + hash(i, 3) * 380, hash(i, 4) * 70, -130 - hash(i, 5) * 70, 56 + hash(i, 6) * 34, { len: 34 + hash(i, 7) * 22, dur: .65 });
  sglow(g, 240, 90, 200, '#8A70FF', .12 + .1 * beatHit(t, 5));
  petals(g, t, { n: 14, sp: 30, wind: -20, seed: 3, big: true });
  memoryFrame(g, t, s, "'09 7 17");
}
function gCity(g, t, u, s) { cityNight(g, t + 14, 170 + u * 30, { trainT: t + 14 - .4 }); rain(g, t, { n: 160, sp: 420, len: 8, sl: .2, col: 'rgba(190,205,255,.42)', seed: 3 }); memoryFrame(g, t, s, "'24 10 30"); }
function gSkirt(g, t, u, s) { playShot(g, 'shSkirtPetals', 49.4 + u); memoryFrame(g, t, s, "'09 7 17"); }
function gUmbrellas(g, t, u, s) { playShot(g, 'shUmbrellaSea', 22.6 + u * 1.5); memoryFrame(g, t, s, "'24 10 30"); }
function gPhoto(g, t, u, s) { playShot(g, 'shPhotoInsert', 36.6 + u); memoryFrame(g, t, s, null); }
function gBike(g, t, u, s) { playShot(g, 'shBikeSea', 91.0 + u); memoryFrame(g, t, s, "'09 7 20"); }
function gFireworks(g, t, u, s) { playShot(g, 'shFireworksWide', 170.4 + u * 1.4); memoryFrame(g, t, s, "'24 7 17"); }
function gTrain(g, t, u, s) { playShot(g, 'shTrainRide', 29.2 + u); memoryFrame(g, t, s, "'24 10 30"); }
function gStorm(g, t, u, s) { playShot(g, 'shStormGather', 104.0 + u); g.save(); g.globalAlpha = u < .12 ? .7 : 0; R(g, 0, 0, W, H, '#E8ECFF'); g.restore(); memoryFrame(g, t, s, "'09 8 31"); }
function gHisWindow(g, t, u, s) { playShot(g, 'shHisHalf', 121.4 + u); memoryFrame(g, t, s, null); }
function gPlane(g, t, u, s) { playShot(g, 'shThrowPlane', 266.0 + u * 2); memoryFrame(g, t, s, "'25 7 17"); }
function gPhone(g, t, u, s) { playShot(g, 'shPhoneScreen', 209.6 + u); memoryFrame(g, t, s, null); }
function gKiss(g, t, u, s) { playShot(g, 'shKissMoon', 72.0 + u * 1.2); memoryFrame(g, t, s, "'09 7 17"); }

/* ---------------- 漩涡：十三张小照片绕着中心转、越转越快、往里收，最后一闪 ---------------- */
const GLIMPSE = ['gMeteor', 'gCity', 'gSkirt', 'gUmbrellas', 'gPhoto', 'gBike', 'gFireworks', 'gTrain', 'gStorm', 'gHisWindow', 'gPlane', 'gPhone', 'gKiss'];
function glimpseSnap(i) {
  const fn = GLIMPSE[i]; return cached('gsnap:' + fn, W, H, q => { const sh = SHOTS.find(z => z.fn === fn); window[fn](q, sh.t + .45, .45, sh); window.FX_EXTRA = null; });
}
function shVortex(g, t, u, s) {
  const D = s.e - s.t, k = clamp(u / D);
  vgrad(g, 0, 0, W, H, [[0, '#06041A'], [.5, '#120A36'], [1, '#2A1048']], 1);
  // 曲速星线：从中心往外拉
  for (let i = 0; i < 160; i++) {
    const a = hash(i, 3) * TAU, d0 = mod(hash(i, 4) + t * (.4 + k * 1.6), 1), r0 = 10 + d0 * d0 * 300, len = 4 + d0 * 30 * (.3 + k);
    const x0 = 240 + Math.cos(a) * r0, y0 = 135 + Math.sin(a) * r0 * .7, x1 = 240 + Math.cos(a) * (r0 + len), y1 = 135 + Math.sin(a) * (r0 + len) * .7;
    line(g, x0, y0, x1, y1, rgba(STARC[i % 5], .3 + .6 * d0));
  }
  sglow(g, 240, 135, 80 + k * 140, '#B88AFF', .25 + k * .4);
  // 小照片：螺旋往里收
  const n = GLIMPSE.length;
  for (let i = 0; i < n; i++) {
    const ang = i / n * TAU + u * (1.2 + k * 5) + k * k * 4, rad = lerp(190, 6, E.in2(k)) * (1 + .12 * Math.sin(i * 2.3 + u * 3)), w = ri(lerp(72, 20, k)), h = ri(w * .5625);
    const x = 240 + Math.cos(ang) * rad - w / 2, y = 135 + Math.sin(ang) * rad * .62 - h / 2;
    g.save(); g.imageSmoothingEnabled = true; R(g, x - 2, y - 2, w + 4, h + 4, '#FFFFFF'); g.drawImage(glimpseSnap(i), ri(x), ri(y), w, h); g.restore();
    for (let tr = 1; tr < 4; tr++) { const a2 = ang - tr * .06 * (1 + k * 3); P(g, 240 + Math.cos(a2) * rad, 135 + Math.sin(a2) * rad * .62, rgba('#FFFFFF', .4 - tr * .1)); }
  }
  petals(g, t, { n: 20, sp: 40, wind: 30, seed: 8, big: true });
  // 收拢：炸开成像素
  if (k > .88) { const v = seg(k, .88, 1); glow(g, 240, 135, 20 + v * 300, '#FFF6E8', v, 8); for (let i = 0; i < 80; i++) { const a = hash(i, 9) * TAU, r = v * (60 + hash(i, 10) * 200); R(g, 240 + Math.cos(a) * r, 135 + Math.sin(a) * r * .7, 2, 2, ['#FFFFFF', '#FFE0A0', '#FFB0D0', '#B0E0FF'][i % 4]); } }
}

/* ---------------- 片名「后来」：像素从四面飞来拼成字（12.24 唱"后来"），亮光扫过，再化成雨落下 ---------------- */
let TITLE_PTS = null;
function titlePoints() {
  if (TITLE_PTS) return TITLE_PTS;
  const pts = [], k = 2;                                          // Scale2x 两次（48px）再放 2 倍：每个字 96×96
  ['后', '来'].forEach((chh, ci) => {
    const c = bigGlyph(chh, 2), bits = c._bits, w = c.width, h = c.height, x0 = 240 - 98 + ci * 100, y0 = 52;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (bits[y * w + x]) pts.push([x0 + x * k, y0 + y * k, x, y, w, h, ci]);
  });
  return (TITLE_PTS = pts);
}
function shTitle(g, t, u, s) {
  vgrad(g, 0, 0, W, H, [[0, '#05041A'], [.55, '#140C3A'], [1, '#3A1A50']], .6);
  g.save(); g.globalAlpha = .6; g.drawImage(milkyWay(W, H, 5, { ang: -.3, cx: .5, cy: .5, wid: 40 }), 0, 0); g.restore();
  stars(g, t, { seed: 11, n: 200, a: 1, big: .04 });
  const sing = ch(0, 0);                                          // 12.24 "后"
  const assemble = E.out3(seg(t, s.t, sing + .05)), melt = seg(t, 13.75, 14.1);
  const pts = titlePoints(), sweep = mod((t - sing) * .9, 1.6) - .3;
  for (let i = 0; i < pts.length; i += 1) {
    const [tx, ty, gx, gy, gw, gh, ci] = pts[i];
    const a = hash(i, 3) * TAU, r = 240 + hash(i, 4) * 120, sx = 240 + Math.cos(a) * r * (1 - assemble), sy = 135 + Math.sin(a) * r * .7 * (1 - assemble);
    let x = lerp(sx, tx, assemble), y = lerp(sy, ty, assemble);
    if (melt > 0) { const d = clamp(melt * 1.6 - hash(i, 5) * .6); y += d * d * 260; x += d * 6 * Math.sin(i); }
    const v = gy / gh, base = mixN(['#FFF8EC', '#FFE6D0', '#FFC8B0'], v);
    const hi = Math.abs((gx / gw * .5 + ci * .5) - sweep) < .06;
    R(g, x + 1, y + 2, 2, 2, '#1A0A28');
    R(g, x, y, 2, 2, hi ? '#FFFFFF' : melt > 0 ? mix(base, '#BFD8FF', melt) : base);
  }
  if (assemble >= 1 && melt <= 0) {
    glow(g, 240, 100, 120, '#FFB0A0', .12, 8);
    const a = E.out(seg(t, sing + .3, sing + 1.0)); txt(g, '刘若英', 240, 160, '#E8DCFF', { align: 'c', sp: 4, ol: '#140A28', a });
    for (let k2 = 0; k2 < 10; k2++) { const v = mod(t * .5 + k2 / 10, 1), ang = k2 * 2.4, r = 70 + v * 60; R(g, 240 + Math.cos(ang) * r * 1.4, 100 + Math.sin(ang) * r * .6, 2, 2, rgba('#FFF6D8', 1 - v)); }
  }
  if (t < sing + .25 && t > sing - .1) { const v = seg(t, sing - .1, sing + .25); glow(g, 240, 100, 60 + v * 220, '#FFF6E8', (1 - v) * .9, 8); }
  petals(g, t, { n: 30, sp: 26, wind: 14, seed: 13, big: true });
  if (melt > 0) rain(g, t, { n: ri(160 * melt), sp: 420, len: 8, sl: .2, col: 'rgba(190,205,255,.45)', seed: 3 });
}
