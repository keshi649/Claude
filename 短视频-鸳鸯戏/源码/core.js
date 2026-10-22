'use strict';
/* core.js：《鸳鸯戏》MV 的像素引擎。
   每个镜头先画在像素缓冲 PB 上（默认 480×270，Uint32Array，一格一个像素），再按整数倍放大铺满 1920×1080，像素边缘不糊。
   PB 上的图形全是按像素填的（矩形、圆、椭圆、多边形、线、抖动渐变），不用 canvas 的抗锯齿；半透明用 Bayer 抖动或逐像素混合。
   frame(t) 只依赖时间 t：随机数都用固定种子的 hash，同一个 t 永远画出同一帧，可以并行渲染、单帧预览。 */
const W = 1920, H = 1080, PW = 480, PH = 270, PS = 4;

function mk(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/* ---------------- 颜色：'#rrggbb' → Uint32（小端 ABGR，直接写进 ImageData） ---------------- */
const _C = new Map();
function C(hex) {
  if (typeof hex === 'number') return hex;
  let v = _C.get(hex);
  if (v === undefined) {
    const n = parseInt(hex.slice(1), 16);
    v = ((255 << 24) | ((n & 255) << 16) | (((n >> 8) & 255) << 8) | (n >> 16)) >>> 0;
    _C.set(hex, v);
  }
  return v;
}
function U32(r, g, b) { return ((255 << 24) | ((b & 255) << 16) | ((g & 255) << 8) | (r & 255)) >>> 0; }
function RGB(c) { c = C(c); return [c & 255, (c >>> 8) & 255, (c >>> 16) & 255]; }
function mixC(c1, c2, f) {
  const a = RGB(c1), b = RGB(c2);
  return U32(Math.round(a[0] + (b[0] - a[0]) * f), Math.round(a[1] + (b[1] - a[1]) * f), Math.round(a[2] + (b[2] - a[2]) * f));
}
function shadeC(c, k) {   // k<1 往黑里压，k>1 往白里提
  const a = RGB(c), f = v => Math.max(0, Math.min(255, Math.round(k < 1 ? v * k : v + (255 - v) * (k - 1))));
  return U32(f(a[0]), f(a[1]), f(a[2]));
}
function hexOf(c) { const a = RGB(c); return '#' + a.map(v => v.toString(16).padStart(2, '0')).join(''); }
function rgba(c, a) { const v = RGB(c); return `rgba(${v[0]},${v[1]},${v[2]},${a})`; }

/* ---------------- 随机（固定种子） ---------------- */
function hash(n) {
  n = (n | 0) ^ 0x9E3779B9; n = Math.imul(n ^ (n >>> 16), 0x85EBCA6B); n = Math.imul(n ^ (n >>> 13), 0xC2B2AE35); n ^= n >>> 16;
  return (n >>> 0) / 4294967296;
}
function h2(a, b) { return hash(Math.imul(a | 0, 73856093) ^ Math.imul(b | 0, 19349663)); }
function rng(seed) { let s = (seed >>> 0) || 1; return () => { s ^= s << 13; s >>>= 0; s ^= s >>> 17; s ^= s << 5; s >>>= 0; return s / 4294967296; }; }
function noise1(x, seed = 0) {  // 一维平滑噪声，0~1
  const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f);
  return h2(i, seed) * (1 - u) + h2(i + 1, seed) * u;
}

/* ---------------- 缓动、区间 ---------------- */
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, f) => a + (b - a) * f;
const ease = x => { x = clamp(x); return x * x * (3 - 2 * x); };
const easeOut = x => 1 - Math.pow(1 - clamp(x), 3);
const easeIn = x => Math.pow(clamp(x), 3);
const easeOutBack = x => { x = clamp(x); const c = 1.6; return 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2); };
function seg(t, a, b) { return clamp((t - a) / (b - a)); }

/* ---------------- 拍子（歌曲时间） ---------------- */
function beatPos(t) { return (t - BAR0) / BEAT; }                       // 从第 0 小节强拍算起第几拍（小数）
function beatPhase(t) { const p = beatPos(t); return p - Math.floor(p); } // 0 = 正在拍点上
function hop(t, amt = 1) { return beatPhase(t) < .16 ? -amt : 0; }       // 每拍跳一下（像素）
function pulse(t, w = .12) { const p = beatPhase(t); return Math.exp(-p / w); }  // 每拍一个衰减的脉冲 0~1
function vocAt(t) { const i = Math.round(t * 30); return VOC[Math.max(0, Math.min(VOC.length - 1, i))] || 0; }

/* ---------------- Bayer 4×4 抖动 ---------------- */
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5].map(v => (v + .5) / 16);
function bay(x, y) { return BAYER[((y & 3) << 2) | (x & 3)]; }

/* ---------------- 像素缓冲 ---------------- */
class PB {
  constructor(w, h) { this.w = w; this.h = h; this.d = new Uint32Array(w * h); }
  clear(c = 0) { this.d.fill(C(c)); return this; }
  px(x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < this.w && y < this.h) this.d[y * this.w + x] = C(c); }
  get(x, y) { x = Math.round(x); y = Math.round(y); return (x >= 0 && y >= 0 && x < this.w && y < this.h) ? this.d[y * this.w + x] : 0; }
  pxa(x, y, c, a) {   // 逐像素混合（a 0~1）
    x = Math.round(x); y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h || a <= 0) return;
    const i = y * this.w + x;
    if (a >= 1) { this.d[i] = C(c); return; }
    const s = this.d[i], cc = C(c);
    const r = (s & 255) + ((cc & 255) - (s & 255)) * a, g = ((s >>> 8) & 255) + (((cc >>> 8) & 255) - ((s >>> 8) & 255)) * a, b = ((s >>> 16) & 255) + (((cc >>> 16) & 255) - ((s >>> 16) & 255)) * a;
    this.d[i] = U32(r, g, b);
  }
  hl(x0, x1, y, c) {   // [x0, x1) 一行
    y = Math.round(y); if (y < 0 || y >= this.h) return;
    x0 = Math.max(0, Math.round(x0)); x1 = Math.min(this.w, Math.round(x1)); if (x1 <= x0) return;
    this.d.fill(C(c), y * this.w + x0, y * this.w + x1);
  }
  hlD(x0, x1, y, c, lv) {   // 抖动的一行：Bayer 阈值 < lv 的格子才画
    y = Math.round(y); if (y < 0 || y >= this.h || lv <= 0) return;
    if (lv >= 1) return this.hl(x0, x1, y, c);
    x0 = Math.max(0, Math.round(x0)); x1 = Math.min(this.w, Math.round(x1)); const cc = C(c), row = y * this.w;
    for (let x = x0; x < x1; x++) if (BAYER[((y & 3) << 2) | (x & 3)] < lv) this.d[row + x] = cc;
  }
  hlA(x0, x1, y, c, a) { for (let x = Math.round(x0); x < Math.round(x1); x++) this.pxa(x, y, c, a); }
  rect(x, y, w, h, c) {
    const x0 = Math.round(x), y0 = Math.round(y), x1 = Math.round(x + w), y1 = Math.round(y + h);
    for (let yy = Math.max(0, y0); yy < Math.min(this.h, y1); yy++) this.hl(x0, x1, yy, c);
  }
  rectD(x, y, w, h, c, lv) { const y0 = Math.round(y), y1 = Math.round(y + h); for (let yy = y0; yy < y1; yy++) this.hlD(x, x + w, yy, c, lv); }
  rectA(x, y, w, h, c, a) { const y0 = Math.round(y), y1 = Math.round(y + h); for (let yy = y0; yy < y1; yy++) this.hlA(x, x + w, yy, c, a); }
  disc(cx, cy, r, c) {
    if (r < .5) { this.px(cx, cy, c); return; }
    for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) {
      const s = r * r - dy * dy; if (s < 0) continue;
      const dx = Math.sqrt(s); this.hl(Math.round(cx - dx), Math.round(cx + dx) + 1, Math.round(cy) + dy, c);
    }
  }
  discD(cx, cy, r, c, lv) {
    for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) {
      const s = r * r - dy * dy; if (s < 0) continue;
      const dx = Math.sqrt(s); this.hlD(Math.round(cx - dx), Math.round(cx + dx) + 1, Math.round(cy) + dy, c, lv);
    }
  }
  ell(cx, cy, rx, ry, c) {
    for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
      const s = 1 - (dy * dy) / (ry * ry); if (s < 0) continue;
      const dx = rx * Math.sqrt(s); this.hl(Math.round(cx - dx), Math.round(cx + dx) + 1, Math.round(cy) + dy, c);
    }
  }
  ellD(cx, cy, rx, ry, c, lv) {
    for (let dy = -Math.ceil(ry); dy <= Math.ceil(ry); dy++) {
      const s = 1 - (dy * dy) / (ry * ry); if (s < 0) continue;
      const dx = rx * Math.sqrt(s); this.hlD(Math.round(cx - dx), Math.round(cx + dx) + 1, Math.round(cy) + dy, c, lv);
    }
  }
  ring(cx, cy, r, c, w = 1) {   // 圆环
    for (let dy = -Math.ceil(r); dy <= Math.ceil(r); dy++) for (let dx = -Math.ceil(r); dx <= Math.ceil(r); dx++) {
      const d = Math.hypot(dx, dy); if (d <= r && d > r - w) this.px(cx + dx, cy + dy, c);
    }
  }
  poly(pts, c, lv = 1) {   // 扫描线填充（奇偶规则）；lv<1 时抖动
    let y0 = Infinity, y1 = -Infinity;
    for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(this.h - 1, Math.ceil(y1)); y++) {
      const yc = y + .5, xs = [];
      for (let i = 0; i < pts.length; i++) {
        const a = pts[i], b = pts[(i + 1) % pts.length];
        if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + (yc - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
      }
      xs.sort((p, q) => p - q);
      for (let i = 0; i + 1 < xs.length; i += 2) lv >= 1 ? this.hl(Math.round(xs[i]), Math.round(xs[i + 1]), y, c) : this.hlD(Math.round(xs[i]), Math.round(xs[i + 1]), y, c, lv);
    }
  }
  line(x0, y0, x1, y1, c, w = 1) {
    x0 = Math.round(x0); y0 = Math.round(y0); x1 = Math.round(x1); y1 = Math.round(y1);
    const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1;
    let e = dx + dy;
    for (;;) {
      if (w <= 1) this.px(x0, y0, c); else this.rect(x0 - (w >> 1), y0 - (w >> 1), w, w, c);
      if (x0 === x1 && y0 === y1) break;
      const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; }
    }
  }
  /* 贴图：src 里值为 0 的像素是透明的。o: {flip, lv（抖动透明度）, a（逐像素混合）, tint: [颜色, 比例], sil: 剪影颜色} */
  blit(src, x, y, o = {}) {
    x = Math.round(x); y = Math.round(y);
    const sw = src.w, sh = src.h, sd = src.d;
    const tint = o.tint ? [C(o.tint[0]), o.tint[1]] : null, sil = o.sil !== undefined ? C(o.sil) : null;
    for (let j = 0; j < sh; j++) {
      const yy = y + j; if (yy < 0 || yy >= this.h) continue;
      for (let i = 0; i < sw; i++) {
        const v = sd[j * sw + (o.flip ? sw - 1 - i : i)]; if (v === 0) continue;
        const xx = x + i; if (xx < 0 || xx >= this.w) continue;
        if (o.lv !== undefined && o.lv < 1 && BAYER[((yy & 3) << 2) | (xx & 3)] >= o.lv) continue;
        let c = sil !== null ? sil : v;
        if (tint) c = mixC(c, tint[0], tint[1]);
        if (o.a !== undefined && o.a < 1) this.pxa(xx, yy, c, o.a); else this.d[yy * this.w + xx] = c;
      }
    }
  }
  /* 整数倍放大贴图 */
  blitK(src, x, y, k, o = {}) {
    if (k === 1) return this.blit(src, x, y, o);
    x = Math.round(x); y = Math.round(y);
    for (let j = 0; j < src.h; j++) for (let i = 0; i < src.w; i++) {
      const v = src.d[j * src.w + (o.flip ? src.w - 1 - i : i)]; if (v === 0) continue;
      this.rect(x + i * k, y + j * k, k, k, o.sil !== undefined ? o.sil : v);
    }
  }
  /* 竖直方向的抖动渐变：cols 均匀分布在 [y, y+h)；结果按 key 缓存 */
  vgrad(x, y, w, h, cols) {
    for (let j = 0; j < h; j++) {
      const f = (cols.length - 1) * j / Math.max(1, h - 1), i = Math.min(cols.length - 2, Math.floor(f)), m = f - i;
      this.hl(x, x + w, y + j, cols[i]);
      this.hlD(x, x + w, y + j, cols[i + 1], m);
    }
  }
  /* 整体调色：f(r,g,b) → [r,g,b] */
  grade(f) {
    const d = this.d;
    for (let i = 0; i < d.length; i++) { const v = d[i]; if (v === 0) continue; const o = f(v & 255, (v >>> 8) & 255, (v >>> 16) & 255); d[i] = U32(o[0], o[1], o[2]); }
  }
  copyFrom(src, sx, sy) {   // 从更大的缓冲里取一块（镜头取景），按整数像素
    sx = Math.round(sx); sy = Math.round(sy);
    for (let j = 0; j < this.h; j++) {
      const yy = sy + j; if (yy < 0 || yy >= src.h) { this.d.fill(0, j * this.w, (j + 1) * this.w); continue; }
      for (let i = 0; i < this.w; i++) { const xx = sx + i; this.d[j * this.w + i] = (xx >= 0 && xx < src.w) ? src.d[yy * src.w + xx] : 0; }
    }
  }
}

/* 缓存的缓冲：同一个名字、同样大小复用，省得每帧分配 */
const _PBS = {};
function pbuf(name, w = PW, h = PH) { const k = name + w + 'x' + h; return _PBS[k] || (_PBS[k] = new PB(w, h)); }
/* 静态图层缓存：key 相同就不重画 */
const _LAYERS = {};
function layer(key, w, h, draw) { if (!_LAYERS[key]) { const p = new PB(w, h); draw(p); _LAYERS[key] = p; } return _LAYERS[key]; }

/* ---------------- 把 PB 画到屏幕上 ---------------- */
const _IMG = new Map();
function pbCanvas(pb) {   // PB → 同尺寸 canvas（共用内存，不复制）
  let e = _IMG.get(pb);
  if (!e) { const c = mk(pb.w, pb.h); e = { c, g: c.getContext('2d'), img: new ImageData(new Uint8ClampedArray(pb.d.buffer), pb.w, pb.h) }; _IMG.set(pb, e); }
  e.g.putImageData(e.img, 0, 0);
  return e.c;
}
/* VIEW：最近一次 show() 的换算（缓冲像素 → 屏幕），给光晕、粒子用 */
let VIEW = { x: 0, y: 0, k: PS };
/* 把缓冲 pb 的 (sx, sy) 处、宽 PW/z 的一块放大铺满屏幕；z=1 时每个像素 4×4。sx, sy 可以是小数（按屏幕像素平移） */
function show(ctx, pb, sx = 0, sy = 0, z = 1) {
  const k = PS * z;
  ctx.imageSmoothingEnabled = false;
  const c = pbCanvas(pb);
  ctx.drawImage(c, Math.round(-sx * k), Math.round(-sy * k), Math.round(pb.w * k), Math.round(pb.h * k));
  VIEW = { x: sx, y: sy, k };
}
function toScreen(x, y) { return [(x - VIEW.x) * VIEW.k, (y - VIEW.y) * VIEW.k]; }
/* 副歌用：每拍画面往里一缩再放回来（DJ 的"泵"），amt 是放大比例 */
function showPump(ctx, pb, t, amt = .025, sx0 = 0, sy0 = 0, z0 = 1) {
  const z = z0 * (1 + amt * pulse(t, .1)), vw = PW / z0, vh = PH / z0;
  show(ctx, pb, sx0 + (vw - PW / z) / 2, sy0 + (vh - PH / z) / 2, z);
}

/* ---------------- 屏幕层的光：加法混合的径向渐变 ---------------- */
function glow(ctx, x, y, r, col, a = .5) {   // x, y, r 是缓冲像素，按 VIEW 换算
  const [sx, sy] = toScreen(x, y), sr = r * VIEW.k;
  if (sx < -sr || sy < -sr || sx > W + sr || sy > H + sr || a <= 0) return;
  const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, sr);
  g.addColorStop(0, rgba(col, a)); g.addColorStop(.4, rgba(col, a * .35)); g.addColorStop(1, rgba(col, 0));
  ctx.save(); ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(sx - sr, sy - sr, sr * 2, sr * 2); ctx.restore();
}
function vignette(ctx, a = .45) {
  const g = ctx.createRadialGradient(W / 2, H / 2, H * .35, W / 2, H / 2, H * 1.05);
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, `rgba(8,4,16,${a})`);
  ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
}

/* ---------------- 字：像素字（Fusion Pixel 12px）和毛笔字（马善政） ----------------
   字形先用 canvas 按原尺寸画出来，再按透明度取阈值变成 1 位的点阵，所以放大以后像素是干净的方块。 */
const _GLY = new Map();
function glyph(ch, font = 'px', size = 12) {
  const key = font + size + ch;
  let gl = _GLY.get(key);
  if (gl) return gl;
  const fam = font === 'px' ? 'FusionPixel' : 'MaShan';
  const S = Math.ceil(size * 1.6), c = mk(S, S), g = c.getContext('2d');
  g.font = `${size}px ${fam}`; g.textBaseline = 'alphabetic'; g.fillStyle = '#fff';
  const base = Math.round(size * (font === 'px' ? .84 : 1.08));
  g.fillText(ch, 1, base);
  const adv = Math.round(g.measureText(ch).width);
  const id = g.getImageData(0, 0, S, S).data, m = new Uint8Array(S * S);
  for (let i = 0; i < S * S; i++) m[i] = id[i * 4 + 3] > (font === 'px' ? 127 : 110) ? 1 : 0;
  gl = { m, S, adv: Math.max(adv, ch === ' ' ? Math.round(size * .5) : 1) };
  _GLY.set(key, gl);
  return gl;
}
/* 一串字 → 带描边的 PB（透明底）。o: {font, size, col, ol（描边色）, sh（阴影色）, gap（字距）, cols（每个字的颜色）, skip（不画第几个字）} */
function textPB(str, o = {}) {
  const font = o.font || 'px', size = o.size || 12, gap = o.gap !== undefined ? o.gap : (font === 'px' ? 1 : 0);
  const gls = [...str].map(ch => glyph(ch, font, size));
  const S = gls.length ? gls[0].S : size, wsum = gls.reduce((s, g) => s + g.adv + gap, 0) + 4;
  const pb = new PB(wsum + 2, S + 3);
  let x = 2;
  const ol = o.ol !== undefined ? C(o.ol) : 0, sh = o.sh !== undefined ? C(o.sh) : 0;
  const pass = (dx, dy, colOf) => {
    let xx = 2;
    gls.forEach((gl, i) => {
      const col = i === o.skip ? 0 : colOf(i);
      if (col) for (let j = 0; j < S; j++) for (let k = 0; k < S; k++) if (gl.m[j * S + k]) pb.px(xx + k + dx, j + dy + 1, col);
      xx += gl.adv + gap;
    });
  };
  if (sh) pass(1, 2, () => sh);
  if (ol) for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [1, -1], [-1, 1], [1, 1]]) pass(dx, dy, () => ol);
  pass(0, 0, i => C(o.cols ? o.cols[i] : (o.col || '#ffffff')));
  pb.adv = gls.map(g => g.adv + gap);
  return pb;
}
const _TXT = new Map();
function textPBc(str, o = {}) { const k = str + JSON.stringify(o); let p = _TXT.get(k); if (!p) { p = textPB(str, o); _TXT.set(k, p); } return p; }

/* ---------------- 屏幕层直接画像素字（不经过缓冲，用于字幕、水印、片尾） ---------------- */
function drawTextPB(ctx, pb, x, y, k, alpha = 1) {   // 左上角 (x, y)，每个像素 k×k
  ctx.save(); ctx.globalAlpha = alpha; ctx.imageSmoothingEnabled = false;
  ctx.drawImage(pbCanvas(pb), Math.round(x), Math.round(y), pb.w * k, pb.h * k);
  ctx.restore();
}
