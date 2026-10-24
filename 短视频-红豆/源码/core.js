'use strict';
/* 《红豆》MV —— frame(T) 只依赖时间，逐帧确定地画出画面。
   core.js：工具、缓动、随机数和噪声、颜色、形状、文字、音乐包络、纹理（颗粒、暗角、星空、银河、雾、云、纸纹）、常用的光和粒子。
   时间：场景函数拿到的 s 是"歌曲时间"（秒）；视频时间 T = s（这首歌开头的静音只有 0.43 秒，前奏一起就是画面，不剪）。 */
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
/* 镜头表：a = 开始的歌曲时间。draw(g, s, k)：k = s - a。各个 scenesN.js 往 SCENES_DEF 里加，main.js 排序 */
const SCENES = [], SCENES_DEF = [];
function scene(id, a, draw, o = {}) { SCENES.push({ id, a, draw, ...o }); }

/* ---------------- 工具 ---------------- */
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const sstep = (a, b, t) => { const u = seg(t, a, b); return u * u * (3 - 2 * u); };
const E = {
  io: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
  io2: u => u < .5 ? 2 * u * u : 1 - Math.pow(-2 * u + 2, 2) / 2,
  out: u => 1 - Math.pow(1 - u, 3),
  out2: u => 1 - (1 - u) * (1 - u),
  out5: u => 1 - Math.pow(1 - u, 5),
  in: u => u * u * u,
  in2: u => u * u,
  sine: u => -(Math.cos(Math.PI * u) - 1) / 2,
  back: u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
  elastic: u => u === 0 || u === 1 ? u : Math.pow(2, -10 * u) * Math.sin((u * 10 - .75) * TAU / 3) + 1,
};
/* 窗口：t 在 [a,b] 里为 1，两头 fi / fo 秒淡入淡出 */
function win(t, a, b, fi = .2, fo = .2) { if (t < a || t > b) return 0; return Math.min(fi > 0 ? clamp((t - a) / fi) : 1, fo > 0 ? clamp((b - t) / fo) : 1); }
function R(seed) { let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(a, b = 0, c = 0) { let h = (a * 374761393 + b * 668265263 + c * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h = Math.imul(h ^ (h >>> 16), 2246822519); return ((h ^ (h >>> 15)) >>> 0) / 4294967296; }
function noise1(x, seed = 0) { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return lerp(hash(i, seed) * 2 - 1, hash(i + 1, seed) * 2 - 1, u); }
function noise2(x, y, seed = 0) {
  const i = Math.floor(x), j = Math.floor(y), fx = x - i, fy = y - j;
  const u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
  const a = hash(i, j, seed), b = hash(i + 1, j, seed), c = hash(i, j + 1, seed), d = hash(i + 1, j + 1, seed);
  return lerp(lerp(a, b, u), lerp(c, d, u), v);
}
function fbm(x, y, oct = 5, seed = 0) { let s = 0, a = .5, f = 1, n = 0; for (let k = 0; k < oct; k++) { s += a * noise2(x * f, y * f, seed + k * 17); n += a; a *= .5; f *= 2; } return s / n; }
function shake(t, t0, amp, dur = .4, f = 23) { if (t < t0 || t > t0 + dur) return [0, 0]; const k = 1 - (t - t0) / dur; return [Math.sin((t - t0) * f * 6.3) * amp * k * k, Math.cos((t - t0) * f * 5.1) * amp * k * k]; }
/* 缓慢的手持感漂移 */
function drift(t, amp = 6, seed = 1, sp = .35) { return [noise1(t * sp, seed) * amp, noise1(t * sp, seed + 9) * amp * .7]; }

/* ---------------- 颜色 ---------------- */
const _rgbCache = {};
function rgb(c) {
  if (_rgbCache[c]) return _rgbCache[c];
  const n = parseInt(c.slice(1), 16);
  return (_rgbCache[c] = [n >> 16, (n >> 8) & 255, n & 255]);
}
function rgba(c, a) { const [r, g, b] = rgb(c); return `rgba(${r},${g},${b},${a})`; }
function mixc(a, b, u) { const A = rgb(a), B = rgb(b); return '#' + A.map((v, i) => Math.round(lerp(v, B[i], clamp(u))).toString(16).padStart(2, '0')).join(''); }
/* 多段渐变取色：stops = [[位置, 颜色], ...] */
function ramp(stops, u) {
  u = clamp(u);
  for (let i = 1; i < stops.length; i++) if (u <= stops[i][0]) return mixc(stops[i - 1][1], stops[i][1], (u - stops[i - 1][0]) / (stops[i][0] - stops[i - 1][0] || 1));
  return stops[stops.length - 1][1];
}
function shade(c, k) { return k < 1 ? mixc(c, '#000000', 1 - k) : mixc(c, '#ffffff', k - 1); }

/* ---------------- 形状 ---------------- */
function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function circ(g, x, y, r) { g.beginPath(); g.arc(x, y, Math.max(r, .01), 0, TAU); }
function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(rx, .01), Math.max(ry, .01), rot, 0, TAU); }
function poly(g, pts, close = true) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); if (close) g.closePath(); }
/* 过点的平滑曲线（Catmull-Rom 转贝塞尔） */
function smoothPath(g, pts, close = false, k = .5) {
  const n = pts.length; if (n < 2) return;
  g.moveTo(pts[0][0], pts[0][1]);
  const P = i => close ? pts[(i + n) % n] : pts[clamp(i, 0, n - 1)];
  const last = close ? n : n - 1;
  for (let i = 0; i < last; i++) {
    const p0 = P(i - 1), p1 = P(i), p2 = P(i + 1), p3 = P(i + 2);
    g.bezierCurveTo(p1[0] + (p2[0] - p0[0]) * k / 3, p1[1] + (p2[1] - p0[1]) * k / 3, p2[0] - (p3[0] - p1[0]) * k / 3, p2[1] - (p3[1] - p1[1]) * k / 3, p2[0], p2[1]);
  }
  if (close) g.closePath();
}
function fs(g, fill, stroke, lw) { if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function line(g, x0, y0, x1, y1, col, lw, cap = 'round') { g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.strokeStyle = col; g.lineWidth = lw; g.lineCap = cap; g.stroke(); }
function withAlpha(g, a, fn) { if (a <= .002) return; g.save(); g.globalAlpha *= Math.min(1, a); fn(); g.restore(); }
function vgrad(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => gr.addColorStop(clamp(o), c)); return gr; }
function lgrad(g, x0, y0, x1, y1, stops) { const gr = g.createLinearGradient(x0, y0, x1, y1); stops.forEach(([o, c]) => gr.addColorStop(clamp(o), c)); return gr; }
function rgrad(g, x, y, r0, r1, stops) { const gr = g.createRadialGradient(x, y, Math.max(0, r0), x, y, Math.max(r1, .1)); stops.forEach(([o, c]) => gr.addColorStop(clamp(o), c)); return gr; }
/* 柔光点（不透明度按 a，颜色 col），默认 'lighter' 叠加 */
function glow(g, x, y, r, col, a = 1, mode = 'lighter') {
  if (a <= .003 || r <= .5) return;
  g.save(); g.globalCompositeOperation = mode; g.globalAlpha *= Math.min(1, a);
  g.drawImage(glowTex(col), x - r, y - r, r * 2, r * 2);
  g.restore();
}
const _glowCache = {};
function glowTex(col) {
  if (_glowCache[col]) return _glowCache[col];
  const c = mk(128, 128), g = c.getContext('2d');
  g.fillStyle = rgrad(g, 64, 64, 0, 64, [[0, rgba(col, 1)], [.18, rgba(col, .55)], [.45, rgba(col, .16)], [1, rgba(col, 0)]]);
  g.fillRect(0, 0, 128, 128);
  return (_glowCache[col] = c);
}

/* ---------------- 字体和文字 ---------------- */
const FONT = {
  serif: '"SerifM"', serifB: '"SerifB"', brush: '"MaShan"', hand: '"LongCang"',
};
function F(px, k = 'serif') { return `${px}px ${FONT[k]}, serif`; }
/* 文字：o = { k 字体（serif 思源宋体 Medium、serifB 思源宋体 Bold、brush 马善政毛笔、hand 龙藏体手写）, col, align, base, ls 字距, alpha, sc, rot, shadow, sx, sy, sblur, glow(颜色), gr(光晕半径), stroke, lw } */
function text(g, s, x, y, px, o = {}) {
  g.save();
  g.translate(x, y);
  if (o.rot) g.rotate(o.rot);
  if (o.sc != null) g.scale(o.sc, o.sc);
  if (o.alpha != null) g.globalAlpha *= clamp(o.alpha);
  g.font = F(px, o.k || 'serif');
  g.textAlign = o.align || 'center';
  g.textBaseline = o.base || 'middle';
  g.letterSpacing = (o.ls || 0) + 'px';
  if (o.glow) {
    g.save(); g.shadowColor = o.glow; g.shadowBlur = o.gr ?? px * .5; g.fillStyle = o.glow; g.globalAlpha *= o.ga ?? .9;
    g.fillText(s, 0, 0); g.restore();
  }
  if (o.shadow) { g.save(); g.shadowColor = o.shadow; g.shadowBlur = o.sblur ?? px * .25; g.shadowOffsetX = o.sx ?? 0; g.shadowOffsetY = o.sy ?? px * .04; g.fillStyle = o.shadow; g.fillText(s, 0, 0); g.restore(); }
  if (o.stroke) { g.strokeStyle = o.stroke; g.lineWidth = o.lw || px * .1; g.lineJoin = 'round'; g.strokeText(s, 0, 0); }
  g.fillStyle = o.col || '#fff';
  g.fillText(s, 0, 0);
  g.restore();
}
function tw(g, s, px, k = 'serif', ls = 0) { g.save(); g.font = F(px, k); g.letterSpacing = ls + 'px'; const w = g.measureText(s).width; g.restore(); return w; }

/* ---------------- 音乐 ---------------- */
const AL = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const dec = s => Float32Array.from(s, ch => AL.indexOf(ch) / 61);
const VOC = dec(VOC_S), ACC = dec(ACC_S), BEATS = dec(BEATS_S);
function envAt(arr, s) { const f = s * ENV_FPS; const i = Math.floor(f); if (i < 0 || i >= arr.length - 1) return 0; return lerp(arr[i], arr[i + 1], f - i); }
const voc = s => envAt(VOC, s), acc = s => envAt(ACC, s);
const beatIdx = s => (s - BEAT0) / BEAT;
const beatStr = k => BEATS[k] || 0;
/* 拍点脉冲：每 every 拍开头 1 → 指数衰减，乘上这一拍的力度 */
function pulse(s, decay = 7, every = 1, phase = 0) {
  const b = (beatIdx(s) - phase) / every; if (b < 0) return 0;
  const k = Math.floor(b), f = (b - k) * every * BEAT;
  return Math.exp(-f * decay) * (.35 + .65 * beatStr(k * every + phase));
}
const bphase = (s, every = 1) => { const b = beatIdx(s) / every; return b - Math.floor(b); };
/* 两拍一次的呼吸（0..1） */
const breath = s => .5 - .5 * Math.cos(Math.PI * beatIdx(s));
const barOf = s => (s - BEAT0) / BAR;

/* ---------------- 纹理 ---------------- */
const TEX = {};
function noiseCanvas(w, h, fn) {
  const c = mk(w, h), g = c.getContext('2d'), im = g.createImageData(w, h), d = im.data;
  for (let y = 0, i = 0; y < h; y++) for (let x = 0; x < w; x++, i += 4) { const [r, gg, b, a] = fn(x, y); d[i] = r; d[i + 1] = gg; d[i + 2] = b; d[i + 3] = a; }
  g.putImageData(im, 0, 0);
  return c;
}
function buildTextures() {
  const r = R(11);
  // 颗粒：固定不动（每帧都变的颗粒会让成片变大），叠在最上面
  TEX.grain = noiseCanvas(960, 540, () => { const v = 128 + (r() - .5) * 90; return [v, v, v, 255]; });
  // 暗角
  const v = mk(W, H), vg = v.getContext('2d');
  vg.fillStyle = rgrad(vg, W / 2, H / 2, H * .38, H * 1.02, [[0, 'rgba(8,6,20,0)'], [.7, 'rgba(8,6,20,.22)'], [1, 'rgba(8,6,20,.62)']]);
  vg.fillRect(0, 0, W, H);
  TEX.vig = v;
  // 星空：2400×1350，比屏幕大，留出视差
  TEX.stars = mk(2400, 1350);
  {
    const g = TEX.stars.getContext('2d'), rs = R(5);
    for (let i = 0; i < 2600; i++) {
      const x = rs() * 2400, y = rs() * 1350, m = Math.pow(rs(), 3);
      const rad = .5 + m * 1.6, a = .25 + rs() * .6;
      const col = rs() < .15 ? '#FFE3C2' : rs() < .3 ? '#C9D8FF' : '#FFFFFF';
      g.fillStyle = rgba(col, a); circ(g, x, y, rad); g.fill();
      if (m > .5) { g.fillStyle = rgba(col, .12); circ(g, x, y, rad * 3.5); g.fill(); }
    }
  }
  // 会闪的亮星（每帧画）：位置在 2400×1350 的星空坐标里
  TEX.bright = []; { const rs = R(17); for (let i = 0; i < 90; i++) TEX.bright.push([rs() * 2400, rs() * 1350, 1.4 + rs() * 2.2, rs() * 10, rs() < .3 ? '#FFE9CC' : '#E8F0FF']); }
  // 银河：斜着的一条带子
  TEX.milky = mk(1600, 900);
  {
    const g = TEX.milky.getContext('2d'), w = 1600, h = 900;
    const nc = noiseCanvas(400, 225, (x, y) => {
      const u = x / 400, vv = y / 225;
      const d = Math.abs((vv - .5) - (u - .5) * .45);               // 到带子中线的距离
      const band = Math.exp(-d * d / .018);
      const n = fbm(x / 60, y / 60, 5, 3), n2 = fbm(x / 22, y / 22, 4, 8);
      const dust = clamp((n - .38) * 2.2) * band;
      const dark = clamp((n2 - .55) * 3) * band * .8;               // 暗尘带
      const a = clamp(dust * .85 - dark * .5);
      const c = ramp([[0, '#5A4AA8'], [.5, '#B489D8'], [1, '#FFD6E8']], clamp(n * 1.2 - .1));
      const [cr, cg, cb] = rgb(c);
      return [cr, cg, cb, Math.round(a * 200)];
    });
    g.filter = 'blur(6px)'; g.drawImage(nc, 0, 0, w, h); g.filter = 'none';
    const rs = R(23);
    for (let i = 0; i < 5000; i++) {
      const u = rs(), off = (rs() + rs() + rs() - 1.5) * .16;
      const x = u * w, y = (.5 + (u - .5) * .45 + off) * h;
      g.fillStyle = `rgba(255,255,255,${.2 + rs() * .6})`; g.fillRect(x, y, rs() < .1 ? 2 : 1, rs() < .1 ? 2 : 1);
    }
  }
  // 雾：两张可横向平铺的噪声（只用 alpha），画的时候按场景着色
  TEX.fog = [0, 1].map(k => {
    const w = 1024, h = 512;
    const nc = noiseCanvas(w / 2, h / 2, (x, y) => {
      // 横向平铺：两份噪声按 x 交叉混合
      const u = x / (w / 2);
      const a1 = fbm(x / 40, y / 40, 5, 31 + k), a2 = fbm((x + w / 2) / 40, y / 40, 5, 31 + k);
      const n = lerp(a1, a2, u);
      const vy = y / (h / 2);
      const a = clamp((n - .32) * 1.9) * Math.sin(Math.PI * vy);
      return [255, 255, 255, Math.round(a * 255)];
    });
    const c = mk(w, h), g = c.getContext('2d');
    g.filter = 'blur(3px)'; g.drawImage(nc, 0, 0, w, h); g.filter = 'none';
    return c;
  });
  // 云：12 个形状，白色（alpha 是形状，颜色另上）
  TEX.cloudMask = [];
  for (let k = 0; k < 12; k++) {
    const w = 640, h = 300, rs = R(100 + k);
    const blobs = [];
    const nb = 7 + Math.floor(rs() * 6);
    for (let i = 0; i < nb; i++) {
      const u = (i + .5) / nb;
      const x = 80 + u * (w - 160) + (rs() - .5) * 40;
      const top = Math.sin(Math.PI * u);
      blobs.push([x, h * .64 - top * h * (.14 + rs() * .12), 34 + top * 58 * (.7 + rs() * .45)]);
    }
    const nc = noiseCanvas(w / 2, h / 2, (x, y) => {
      const X = x * 2, Y = y * 2;
      let d = 0;
      for (const [bx, by, br] of blobs) d = Math.max(d, 1 - Math.hypot(X - bx, (Y - by) * 1.15) / br);
      const base = clamp((Y - h * .6) / (h * .2));             // 底部压平（软的）
      const n = fbm(X / 34, Y / 34, 4, 50 + k);
      const edge = Math.min(1, X / 50, (w - X) / 50, Y / 40, (h - Y) / 30);   // 贴近画布边的地方淡掉，免得切出直边
      const a = clamp((d + (n - .5) * .55) * 3.2) * (1 - sstep(.1, 1, base)) * clamp(edge);
      return [255, 255, 255, Math.round(a * 255)];
    });
    const c = mk(w, h), g = c.getContext('2d');
    g.filter = 'blur(2px)'; g.drawImage(nc, 0, 0, w, h); g.filter = 'none';
    TEX.cloudMask.push(c);
  }
  // 纸纹（便利贴、拍立得）
  TEX.paper = noiseCanvas(256, 256, (x, y) => { const n = fbm(x / 9, y / 9, 3, 77); const v = 235 + (n - .5) * 30; return [v, v - 3, v - 10, 255]; });
}

/* 着色过的云：palette = [顶亮边, 中间, 底暗]，缓存 */
const _cloudCache = {};
function cloudTex(k, pal) {
  const key = k + pal.join();
  if (_cloudCache[key]) return _cloudCache[key];
  const nm = TEX.cloudMask.length, m = TEX.cloudMask[((Math.floor(k) % nm) + nm) % nm], w = m.width, h = m.height;
  const c = mk(w, h), g = c.getContext('2d');
  g.drawImage(m, 0, 0);
  g.globalCompositeOperation = 'source-in';
  g.fillStyle = vgrad(g, h * .1, h * .8, [[0, pal[0]], [.45, pal[1]], [1, pal[2]]]);
  g.fillRect(0, 0, w, h);
  // 亮边：把形状往下挪一点挖掉，剩下顶上一圈
  const rim = mk(w, h), rg = rim.getContext('2d');
  rg.drawImage(m, 0, 0); rg.globalCompositeOperation = 'destination-out'; rg.drawImage(m, 0, 10);
  rg.globalCompositeOperation = 'source-in'; rg.fillStyle = pal[3] || pal[0]; rg.fillRect(0, 0, w, h);
  g.globalCompositeOperation = 'source-over'; g.globalAlpha = .55; g.drawImage(rim, 0, 0);
  return (_cloudCache[key] = c);
}
const CLOUD = {
  night: ['#8E9BD6', '#3D4884', '#232B5C', '#C9D3FF'],
  nightL: ['#B3BEEB', '#6271AE', '#3E4A85', '#E6ECFF'],
  dream: ['#F7C6E0', '#9B7BC8', '#5B4A9A', '#FFE4F2'],
  dawn: ['#FFE0C2', '#F2A3A0', '#9C6E9E', '#FFF1DF'],
  day: ['#FFFFFF', '#E3EDF8', '#B9CBE2', '#FFFFFF'],
  dusk: ['#FFD39A', '#E07B6A', '#6A4C7E', '#FFE8C4'],
  rain: ['#C9CED6', '#9AA2AE', '#717A88', '#DDE1E7'],
  storm: ['#6C7590', '#3B4260', '#232842', '#8F98B5'],
};
function cloud(g, k, x, y, w, pal = CLOUD.night, a = 1, flip = false) {
  const c = cloudTex(k, pal), h = w * c.height / c.width;
  withAlpha(g, a, () => { if (flip) { g.save(); g.translate(x, y); g.scale(-1, 1); g.drawImage(c, -w / 2, -h / 2, w, h); g.restore(); } else g.drawImage(c, x - w / 2, y - h / 2, w, h); });
}
/* 一层横向漂移的雾：col 颜色，y0..y1 范围，a 浓度，sp 速度（像素/秒），k 哪张 */
const _fogTint = {};
function fogTex(k, col) {
  const key = k + col; if (_fogTint[key]) return _fogTint[key];
  const m = TEX.fog[k], c = mk(m.width, m.height), g = c.getContext('2d');
  g.drawImage(m, 0, 0); g.globalCompositeOperation = 'source-in'; g.fillStyle = col; g.fillRect(0, 0, c.width, c.height);
  return (_fogTint[key] = c);
}
function fogLayer(g, s, col, y0, y1, a, sp = 20, k = 0, scaleX = 2.2, ox = 0) {
  if (a <= .003) return;
  const tex = fogTex(k, col), tw_ = W * scaleX / 1.875, h = y1 - y0;
  let x = -((s * sp + ox) % tw_); if (x > 0) x -= tw_;
  withAlpha(g, a, () => { for (; x < W; x += tw_) g.drawImage(tex, x, y0, tw_ + 1, h); });
}

/* ---------------- 天空、月亮、星星 ---------------- */
function skyGrad(g, stops, y0 = 0, y1 = H) { g.fillStyle = vgrad(g, y0, y1, stops); g.fillRect(-W, -H, W * 3, H * 3); }
const SKY = {
  night: [[0, '#070B22'], [.45, '#131B4A'], [.8, '#2C2A66'], [1, '#4B3A78']],
  nightCity: [[0, '#060A1F'], [.5, '#12194A'], [.82, '#33306E'], [1, '#6A4C86']],
  deep: [[0, '#04061A'], [.6, '#0D1238'], [1, '#1E2052']],
  dream: [[0, '#1A1450'], [.5, '#4A2E86'], [.85, '#B2629E'], [1, '#F2A0A8']],
  dawn: [[0, '#2B3C78'], [.45, '#8C6AA8'], [.75, '#F2A08E'], [1, '#FFD8A0']],
};
/* 星空（px, py 是视差偏移，a 整体亮度） */
function stars(g, s, px = 0, py = 0, a = 1, twinkle = 1) {
  if (a <= .01) return;
  const ox = ((px % 2400) + 2400) % 2400, oy = clamp(py, -270, 270);
  withAlpha(g, a, () => {
    g.drawImage(TEX.stars, -ox, -135 - oy); if (ox > 480) g.drawImage(TEX.stars, 2400 - ox, -135 - oy);
  });
  if (twinkle <= 0) return;
  for (const [x0, y0, rad, ph, col] of TEX.bright) {
    let x = x0 - ox; if (x < -50) x += 2400;
    const y = y0 - 135 - oy;
    if (x < -20 || x > W + 20 || y < -20 || y > H + 20) continue;
    const tw = .55 + .45 * Math.sin(s * (1.3 + ph * .17) + ph * 3);
    withAlpha(g, a * tw * twinkle, () => {
      g.fillStyle = col; circ(g, x, y, rad * .6); g.fill();
      g.globalCompositeOperation = 'lighter';
      g.strokeStyle = rgba(col, .35); g.lineWidth = 1;
      g.beginPath(); g.moveTo(x - rad * 4, y); g.lineTo(x + rad * 4, y); g.moveTo(x, y - rad * 4); g.lineTo(x, y + rad * 4); g.stroke();
    });
    glow(g, x, y, rad * 5, col, a * tw * .5 * twinkle);
  }
}
function milkyWay(g, x, y, w, rot, a = 1) {
  withAlpha(g, a, () => {
    g.save(); g.translate(x, y); g.rotate(rot); g.globalCompositeOperation = 'lighter';
    g.drawImage(TEX.milky, -w / 2, -w * .28, w, w * .5625); g.restore();
  });
}
function moon(g, x, y, r, o = {}) {
  const a = o.a ?? 1, col = o.col || '#FFF4D6';
  if (a <= .01) return;
  glow(g, x, y, r * 7, o.halo || '#9FB2FF', a * (o.haloA ?? .5));
  glow(g, x, y, r * 2.6, '#FFF1D0', a * .55);
  withAlpha(g, a, () => {
    g.save();
    circ(g, x, y, r); g.fillStyle = rgrad(g, x - r * .3, y - r * .35, r * .1, r * 1.1, [[0, '#FFFDF2'], [.7, col], [1, shade(col, .9)]]); g.fill();
    g.clip();
    g.fillStyle = rgba('#C9B98F', .28);
    [[-.32, -.18, .22], [.25, .2, .17], [.05, -.42, .1], [-.1, .38, .12], [.42, -.15, .08]].forEach(([dx, dy, rr_]) => { circ(g, x + dx * r, y + dy * r, rr_ * r); g.fill(); });
    if (o.phase) { // 月相：右侧暗面
      g.fillStyle = rgba('#0B1030', .92); circ(g, x + r * o.phase, y - r * .05, r * 1.02); g.fill();
    }
    g.restore();
  });
}
function shootingStar(g, s, s0, x0, y0, ang = .45, len = 380, dur = .9, col = '#FFFFFF') {
  const u = (s - s0) / dur; if (u < 0 || u > 1) return;
  const d = E.out(u) * 900, x = x0 + Math.cos(ang) * d, y = y0 + Math.sin(ang) * d;
  const a = Math.sin(Math.PI * u);
  g.save(); g.globalCompositeOperation = 'lighter';
  g.strokeStyle = lgrad(g, x, y, x - Math.cos(ang) * len, y - Math.sin(ang) * len, [[0, rgba(col, .9 * a)], [1, rgba(col, 0)]]);
  g.lineWidth = 3; g.lineCap = 'round'; g.beginPath(); g.moveTo(x, y); g.lineTo(x - Math.cos(ang) * len, y - Math.sin(ang) * len); g.stroke();
  g.restore();
  glow(g, x, y, 26, col, a);
}

/* ---------------- 粒子 ---------------- */
/* 漂浮的光点：n 个，seed 固定；box = [x0,y0,x1,y1]；vy 上升速度；返回每个的位置给调用者画 */
function floaters(s, seed, n, box, o = {}) {
  const out = [], rs = R(seed), [x0, y0, x1, y1] = box, w = x1 - x0, h = y1 - y0;
  for (let i = 0; i < n; i++) {
    const px = rs(), py = rs(), ph = rs() * TAU, sp = .6 + rs() * .8, sz = rs();
    let y = y0 + ((py * h - s * (o.vy ?? 30) * sp) % h + h) % h;
    let x = x0 + ((px * w + s * (o.vx ?? 0) * sp + Math.sin(s * (o.wob ?? .7) * sp + ph) * (o.amp ?? 20)) % w + w) % w;
    out.push({ x, y, sz, ph, i, tw: .5 + .5 * Math.sin(s * (1.5 + sp) + ph * 5) });
  }
  return out;
}
/* 雨：在 [x0,x1] × [y0,y1] 里画 n 条雨丝 */
function rain(g, s, n, o = {}) {
  const [x0, y0, x1, y1] = o.box || [0, 0, W, H], ang = o.ang ?? .12, len = o.len ?? 46, sp = o.sp ?? 1700, col = o.col || 'rgba(210,225,255,.35)';
  const h = y1 - y0 + len, rs = R(o.seed || 3), frz = o.freeze ?? 1, up = o.up || 0;
  g.save(); g.strokeStyle = col; g.lineWidth = o.lw || 1.6; g.lineCap = 'round';
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const px = rs(), py = rs(), v = .75 + rs() * .5;
    const t = o.ts ?? s;
    let y = y0 + ((py * h + t * sp * v) % h) - len;
    y -= up * (1 + rs()) * 400;
    const x = x0 + px * (x1 - x0) + (y - y0) * Math.tan(ang);
    const L = len * v * frz + 2;
    g.moveTo(x, y); g.lineTo(x - Math.sin(ang) * L, y - Math.cos(ang) * L);
  }
  g.stroke(); g.restore();
}
