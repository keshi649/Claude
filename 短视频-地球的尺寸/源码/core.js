/* 《地球的尺寸》画面核心：时间轴、缓动、文字、背景（暗金底、纸面颗粒、浮尘）、
   左上年份（数字滚动）、右上文献卡（红印"文献"）、底部字幕、右下水印。
   所有函数只依赖时间 t，同一个 t 永远画出同一张图。 */
const W = 1920, H = 1080;
const CANVAS = document.getElementById('c');
const MAIN = CANVAS.getContext('2d');
let g = MAIN;                       // 当前画布；画场景时临时换成离屏画布

const TL = window.TIMELINE;
const LINE = {}; TL.lines.forEach(l => { LINE[l.id] = l; });
const SCN = {}; TL.scenes.forEach(s => { SCN[s.name] = s; });
const T = id => LINE[id].t0;
const TE = id => LINE[id].t1;

const COL = {
  gold: '#e3c27a', goldHi: '#f8e7b4', goldLo: '#a77c38',
  red: '#cf4a3e', redHi: '#e8705f', redLo: '#8e2a22',
  ivory: '#efe7d4', dim: 'rgba(239,231,212,0.55)', faint: 'rgba(239,231,212,0.22)',
  ink: '#0b0907',
};

// ---------------- 数学与缓动 ----------------
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  out: u => 1 - (1 - u) ** 3,
  in: u => u * u * u,
  inOut: u => (u < 0.5 ? 4 * u * u * u : 1 - (-2 * u + 2) ** 3 / 2),
  sine: u => -(Math.cos(Math.PI * u) - 1) / 2,
  back: u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * (u - 1) ** 3 + c1 * (u - 1) ** 2; },
  quart: u => 1 - (1 - u) ** 4,
};
// 出现-停留-消失：a 开始淡入，b 开始淡出，d 是淡入淡出时长
const vis = (t, a, b, d = 0.5) => E.sine(seg(t, a, a + d)) * (1 - E.sine(seg(t, b, b + d)));
function hash(n) { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); }
const D2R = Math.PI / 180;

// ---------------- 文字 ----------------
const FONTS = {
  zh: s => `${s}px NSerifB`, zhk: s => `${s}px NSerifK`, zhm: s => `${s}px NSerifM`,
  num: s => `600 ${s}px Corm`, numl: s => `500 ${s}px Corm`, it: s => `italic 500 ${s}px CormI`,
  cap: s => `500 ${s}px Cinzel`,
};
function setFont(f, size) { g.font = FONTS[f](size); }
function textW(s, f, size, ls = 0) {
  setFont(f, size); g.letterSpacing = ls + 'px';
  const w = g.measureText(s).width; g.letterSpacing = '0px'; return w;
}
/* o: f 字体, size, color, align, alpha, glow（光晕半径）, glowColor, ls 字距 */
function text(s, x, y, o = {}) {
  const a = o.alpha === undefined ? 1 : o.alpha;
  if (a <= 0.003) return;
  g.save();
  setFont(o.f || 'zh', o.size || 32);
  g.letterSpacing = (o.ls || 0) + 'px';
  g.textAlign = o.align || 'left';
  g.textBaseline = o.base || 'alphabetic';
  g.globalAlpha *= a;
  g.fillStyle = o.color || COL.ivory;
  if (o.glow) { g.shadowColor = o.glowColor || 'rgba(227,194,122,0.55)'; g.shadowBlur = o.glow; }
  // 字距会在末尾多出一份，居中/右对齐时补回
  let dx = 0;
  if (o.ls && g.textAlign === 'center') dx = o.ls / 2;
  if (o.ls && g.textAlign === 'right') dx = o.ls;
  g.fillText(s, x + dx, y);
  g.restore();
}
function goldGrad(y0, y1) {
  const gr = g.createLinearGradient(0, y0, 0, y1);
  gr.addColorStop(0, '#fbeec4'); gr.addColorStop(0.45, '#e9c77f'); gr.addColorStop(1, '#a8772f');
  return gr;
}
function goldText(s, x, y, size, o = {}) {
  text(s, x, y, Object.assign({ size, color: goldGrad(y - size * 0.85, y + size * 0.1), glow: size * 0.22 }, o));
}
// 富文本：{…} 高亮；返回 [{ch, hi}]
function rich(s) {
  const out = []; let hi = false;
  for (const ch of s) {
    if (ch === '{') { hi = true; continue; }
    if (ch === '}') { hi = false; continue; }
    out.push({ ch, hi });
  }
  return out;
}
// 逐字淡入的富文本（居中）。p0：开始时刻，st：每字间隔
function richLine(s, cx, y, size, t, p0, o = {}) {
  const cs = rich(s);
  const f = o.f || 'zh';
  setFont(f, size);
  const ws = cs.map(c => g.measureText(c.ch).width + (o.ls || 0));
  const total = ws.reduce((a, b) => a + b, 0) - (o.ls || 0);
  let x = o.align === 'left' ? cx : cx - total / 2;
  const st = o.st === undefined ? 0.022 : o.st;
  const base = o.alpha === undefined ? 1 : o.alpha;
  cs.forEach((c, i) => {
    const u = E.out(seg(t, p0 + i * st, p0 + i * st + 0.38));
    if (u > 0.003) {
      text(c.ch, x, y + (1 - u) * size * 0.18, {
        f, size, alpha: u * base,
        color: c.hi ? (o.hiColor || COL.gold) : (o.color || COL.ivory),
        glow: c.hi ? size * 0.35 : (o.glow || 0),
        glowColor: c.hi ? (o.hiGlow || 'rgba(227,194,122,0.6)') : 'rgba(0,0,0,0.9)',
      });
    }
    x += ws[i];
  });
  return total;
}

// ---------------- 图形小工具 ----------------
function line(x1, y1, x2, y2, color, w = 2, alpha = 1, dash) {
  if (alpha <= 0.003) return;
  g.save(); g.globalAlpha *= alpha; g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round';
  if (dash) g.setLineDash(dash);
  g.beginPath(); g.moveTo(x1, y1); g.lineTo(x2, y2); g.stroke(); g.restore();
}
// 从 (x1,y1) 画向 (x2,y2) 的前 p 部分
function lineP(x1, y1, x2, y2, p, color, w = 2, alpha = 1, dash) {
  if (p <= 0) return;
  line(x1, y1, lerp(x1, x2, p), lerp(y1, y2, p), color, w, alpha, dash);
}
function arcS(cx, cy, r, a0, a1, color, w = 2, alpha = 1, dash) {
  if (alpha <= 0.003 || a0 === a1) return;
  g.save(); g.globalAlpha *= alpha; g.strokeStyle = color; g.lineWidth = w; g.lineCap = 'round';
  if (dash) g.setLineDash(dash);
  g.beginPath(); g.arc(cx, cy, r, a0, a1, a1 < a0); g.stroke(); g.restore();
}
function dot(x, y, r, color, alpha = 1, glow = 0) {
  if (alpha <= 0.003) return;
  g.save(); g.globalAlpha *= alpha; g.fillStyle = color;
  if (glow) { g.shadowColor = color; g.shadowBlur = glow; }
  g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.restore();
}
function glowDot(x, y, r, color, alpha = 1) {
  if (alpha <= 0.003) return;
  g.save(); g.globalAlpha *= alpha;
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, color); gr.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = gr; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill(); g.restore();
}
function rrect(x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}
// 参考片里的卡片：深色半透明底 + 细金边
function card(x, y, w, h, o = {}) {
  const a = o.alpha === undefined ? 1 : o.alpha;
  if (a <= 0.003) return;
  g.save(); g.globalAlpha *= a;
  rrect(x, y, w, h, o.r || 10);
  g.fillStyle = o.fill || 'rgba(24,18,12,0.72)'; g.fill();
  g.strokeStyle = o.border || 'rgba(227,194,122,0.45)'; g.lineWidth = 1.5;
  if (o.glow) { g.shadowColor = o.border || 'rgba(227,194,122,0.5)'; g.shadowBlur = o.glow; }
  g.stroke(); g.restore();
}
// 方形印章：1 字 / 2 字竖排 / 4 字田字格
function seal(x, y, size, txt, o = {}) {
  const a = o.alpha === undefined ? 1 : o.alpha;
  if (a <= 0.003) return;
  const sc = o.scale || 1;
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.rotate(o.rot || 0); g.scale(sc, sc);
  const c = o.color || COL.red;
  g.shadowColor = 'rgba(0,0,0,0.5)'; g.shadowBlur = 10;
  rrect(-size / 2, -size / 2, size, size, size * 0.08); g.fillStyle = c; g.fill();
  g.shadowBlur = 0;
  g.strokeStyle = 'rgba(255,235,220,0.75)'; g.lineWidth = Math.max(1, size * 0.03);
  rrect(-size * 0.42, -size * 0.42, size * 0.84, size * 0.84, size * 0.05); g.stroke();
  g.fillStyle = '#fff3e6'; g.textAlign = 'center'; g.textBaseline = 'middle';
  const chs = [...txt];
  if (chs.length === 1) { g.font = FONTS.zhk(size * 0.62); g.fillText(chs[0], 0, size * 0.03); }
  else if (chs.length === 2) {
    g.font = FONTS.zhk(size * 0.36);
    g.fillText(chs[0], 0, -size * 0.17); g.fillText(chs[1], 0, size * 0.21);
  } else {
    g.font = FONTS.zhk(size * 0.3);
    g.fillText(chs[0], size * 0.17, -size * 0.16); g.fillText(chs[1], size * 0.17, size * 0.2);
    g.fillText(chs[2], -size * 0.17, -size * 0.16); g.fillText(chs[3], -size * 0.17, size * 0.2);
  }
  // 做旧：几处缺墨
  g.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 9; i++) {
    const h1 = hash(i * 3.1 + size), h2 = hash(i * 7.7 + size);
    g.globalAlpha = 0.35 * a;
    g.beginPath(); g.arc((h1 - 0.5) * size, (h2 - 0.5) * size, size * 0.02 + h1 * size * 0.03, 0, Math.PI * 2); g.fill();
  }
  g.restore();
}
// 盖章动画：从大到小砸下，带一点旋转；返回落地进度
function stamp(x, y, size, txt, t, t0, o = {}) {
  if (t < t0) return 0;
  const u = seg(t, t0, t0 + 0.22);
  const sc = lerp(1.9, 1, E.in(u));
  seal(x, y, size, txt, Object.assign({}, o, { scale: sc, alpha: (o.alpha === undefined ? 1 : o.alpha) * clamp(u * 3), rot: (o.rot || -0.08) }));
  return u;
}
// 竖立的木棍（表）：底部 (x,y)，高 h
function gnomon(x, y, h, o = {}) {
  const a = o.alpha === undefined ? 1 : o.alpha;
  if (a <= 0.003) return;
  const w = o.w || Math.max(6, h * 0.035);
  g.save(); g.globalAlpha *= a;
  const gr = g.createLinearGradient(x - w / 2, 0, x + w / 2, 0);
  gr.addColorStop(0, '#5d4a33'); gr.addColorStop(0.35, '#e9dcc0'); gr.addColorStop(0.6, '#c9b48d'); gr.addColorStop(1, '#4a3a27');
  g.fillStyle = gr;
  g.shadowColor = 'rgba(227,194,122,0.25)'; g.shadowBlur = 12;
  rrect(x - w / 2, y - h, w, h, w * 0.4); g.fill();
  g.shadowBlur = 0;
  dot(x, y - h, w * 0.62, '#efe3c6', 1);
  g.restore();
  // 底座：一圈细金色椭圆（参考片骰子落地的那一圈）
  if (!o.noBase) {
    g.save(); g.globalAlpha *= a * 0.7; g.strokeStyle = COL.gold; g.lineWidth = 1.2;
    g.beginPath(); g.ellipse(x, y, h * 0.32, h * 0.045, 0, 0, Math.PI * 2); g.stroke(); g.restore();
  }
}
function sun(x, y, r, alpha = 1) {
  if (alpha <= 0.003) return;
  glowDot(x, y, r * 4.5, 'rgba(255,214,140,0.22)', alpha);
  glowDot(x, y, r * 2, 'rgba(255,226,160,0.45)', alpha);
  dot(x, y, r, '#fff1cf', alpha, r * 1.5);
}
// 正射投影地球仪（经纬网 + 金色轮廓光）
function globe(cx, cy, R, rot, o = {}) {
  const a = o.alpha === undefined ? 1 : o.alpha;
  if (a <= 0.003) return;
  const tilt = o.tilt === undefined ? 0.36 : o.tilt;
  g.save(); g.globalAlpha *= a;
  const body = g.createRadialGradient(cx - R * 0.35, cy - R * 0.4, R * 0.1, cx, cy, R);
  body.addColorStop(0, '#2b2216'); body.addColorStop(0.7, '#130f0a'); body.addColorStop(1, '#0a0806');
  g.fillStyle = body; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.fill();
  const proj = (lat, lon) => {
    const x = Math.cos(lat) * Math.sin(lon + rot), y0 = Math.sin(lat), z0 = Math.cos(lat) * Math.cos(lon + rot);
    const y = y0 * Math.cos(tilt) - z0 * Math.sin(tilt), z = y0 * Math.sin(tilt) + z0 * Math.cos(tilt);
    return [cx + x * R, cy - y * R, z];
  };
  const strokePath = (pts, front) => {
    g.beginPath(); let on = false;
    for (const p of pts) {
      if ((p[2] >= 0) === front) { if (!on) { g.moveTo(p[0], p[1]); on = true; } else g.lineTo(p[0], p[1]); } else on = false;
    }
    g.stroke();
  };
  g.lineWidth = 1;
  for (const front of [false, true]) {
    g.strokeStyle = front ? 'rgba(227,194,122,0.30)' : 'rgba(227,194,122,0.07)';
    for (let lon = 0; lon < 180; lon += 15) {
      const pts = [];
      for (let k = 0; k <= 72; k++) pts.push(proj(-Math.PI / 2 + k * Math.PI / 72, lon * D2R));
      const pts2 = pts.map((p, i) => proj(-Math.PI / 2 + i * Math.PI / 72, lon * D2R + Math.PI));
      strokePath(pts, front); strokePath(pts2, front);
    }
    for (let lat = -75; lat <= 75; lat += 15) {
      const pts = [];
      for (let k = 0; k <= 96; k++) pts.push(proj(lat * D2R, k * Math.PI * 2 / 96));
      strokePath(pts, front);
    }
  }
  // 轮廓光
  const rim = g.createRadialGradient(cx, cy, R * 0.82, cx, cy, R * 1.04);
  rim.addColorStop(0, 'rgba(227,194,122,0)'); rim.addColorStop(0.8, 'rgba(227,194,122,0.22)'); rim.addColorStop(1, 'rgba(227,194,122,0)');
  g.fillStyle = rim; g.beginPath(); g.arc(cx, cy, R * 1.04, 0, Math.PI * 2); g.fill();
  g.strokeStyle = 'rgba(240,215,160,0.55)'; g.lineWidth = 1.5; g.beginPath(); g.arc(cx, cy, R, 0, Math.PI * 2); g.stroke();
  g.restore();
  return proj;
}
// 子午圈：穿过两极、在屏幕上是一个竖椭圆，宽度由 k（0~1）决定。p：从北极出发描到的比例
function meridianPts(cx, cy, R, k, n = 240) {
  const pts = [];
  for (let i = 0; i <= n; i++) {
    const s = i / n * Math.PI * 2;
    pts.push([cx + Math.sin(s) * R * k, cy - Math.cos(s) * R, Math.sin(s) >= 0]);
  }
  return pts;
}
function meridian(cx, cy, R, k, p, alpha = 1) {
  if (p <= 0 || alpha <= 0.003) return null;
  const pts = meridianPts(cx, cy, R, k);
  const m = Math.floor(p * (pts.length - 1));
  g.save(); g.globalAlpha *= alpha; g.lineCap = 'round';
  for (const front of [false, true]) {
    g.strokeStyle = front ? COL.goldHi : 'rgba(227,194,122,0.35)';
    g.lineWidth = front ? 3 : 1.5;
    if (front) { g.shadowColor = 'rgba(240,200,120,0.9)'; g.shadowBlur = 14; } else g.setLineDash([4, 6]);
    g.beginPath(); let on = false;
    for (let i = 0; i <= m; i++) {
      const pt = pts[i];
      if (pt[2] === front) { if (!on) { g.moveTo(pt[0], pt[1]); on = true; } else g.lineTo(pt[0], pt[1]); } else on = false;
    }
    g.stroke(); g.setLineDash([]);
  }
  g.restore();
  return pts[m];
}

// ---------------- 背景：暗金底 + 颗粒 + 浮尘 ----------------
const GRAIN = [];
(function makeGrain() {
  let s = 12345;
  const rnd = () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
  for (let k = 0; k < 4; k++) {
    const c = document.createElement('canvas'); c.width = 960; c.height = 540;
    const x = c.getContext('2d'); const im = x.createImageData(960, 540);
    for (let i = 0; i < im.data.length; i += 4) {
      const v = rnd() < 0.5 ? 0 : 255;
      im.data[i] = im.data[i + 1] = im.data[i + 2] = v; im.data[i + 3] = Math.floor(rnd() * 10);
    }
    x.putImageData(im, 0, 0); GRAIN.push(c);
  }
})();
const TINTS = {
  open: [46, 36, 24], title: [40, 30, 18], era1: [64, 44, 22], era2: [62, 30, 22], era3: [26, 34, 44],
  era4: [22, 32, 50], era5: [52, 24, 22], end: [56, 42, 24], credits: [30, 24, 16],
};
function background(t, tint) {
  g.fillStyle = COL.ink; g.fillRect(0, 0, W, H);
  const [r, gg, b] = tint;
  const rg = g.createRadialGradient(960, 470, 40, 960, 520, 1150);
  rg.addColorStop(0, `rgba(${r},${gg},${b},0.85)`); rg.addColorStop(0.55, `rgba(${r * 0.45},${gg * 0.45},${b * 0.45},0.6)`);
  rg.addColorStop(1, 'rgba(0,0,0,0)');
  g.fillStyle = rg; g.fillRect(0, 0, W, H);
  // 浮尘
  for (let i = 0; i < 64; i++) {
    const h1 = hash(i + 0.1), h2 = hash(i + 7.3), h3 = hash(i + 13.9), h4 = hash(i + 21.7);
    const sp = 6 + h3 * 14;
    const x = (h1 * W + Math.sin(t * 0.21 + i) * 30 + t * (h4 - 0.5) * 8 + W) % W;
    const y = ((h2 * (H + 100) - t * sp) % (H + 100) + H + 100) % (H + 100) - 50;
    const big = h4 > 0.86;
    const fl = 0.5 + 0.5 * Math.sin(t * (0.7 + h1) + i * 2.1);
    if (big) glowDot(x, y, 6 + h3 * 10, 'rgba(240,210,150,0.10)', fl);
    else dot(x, y, 0.8 + h3 * 1.6, 'rgba(240,215,165,0.55)', 0.25 + 0.5 * fl);
  }
}
function vignetteAndGrain(t) {
  const vg = g.createRadialGradient(960, 540, 420, 960, 540, 1250);
  vg.addColorStop(0, 'rgba(0,0,0,0)'); vg.addColorStop(1, 'rgba(0,0,0,0.78)');
  g.fillStyle = vg; g.fillRect(0, 0, W, H);
  const k = 0;      // 颗粒固定不动，像纸面纹理：逐帧变化的噪点几乎压不动，成片会大到 GitHub 放不下
  g.save(); g.globalAlpha = 0.9;
  g.drawImage(GRAIN[k], -((k * 211) % 60), -((k * 137) % 40), W + 120, H + 80);
  g.restore();
}

// ---------------- 左上：年份 ----------------
let HEADER = [];      // [{t, pre, year, place}]；year 为 null 表示隐藏
function headerState(t) {
  let i = -1;
  for (let k = 0; k < HEADER.length; k++) if (HEADER[k].t <= t) i = k;
  return i;
}
function drawHeader(t) {
  const i = headerState(t);
  if (i < 0) return;
  const cur = HEADER[i], prev = i > 0 ? HEADER[i - 1] : null;
  const dt = t - cur.t;
  const X = 96, Y = 132, S = 112;
  // 显隐
  let alpha = 1;
  if (!cur.year) { if (!prev || !prev.year) return; alpha = 1 - E.sine(seg(dt, 0, 0.7)); }
  else if (!prev || !prev.year) alpha = E.sine(seg(dt, 0, 0.9));
  if (alpha <= 0.003) return;
  const show = cur.year ? cur : prev;
  const from = (cur.year && prev && prev.year) ? prev : null;
  g.save(); g.globalAlpha *= alpha;
  // 前缀（约 / 公元前）
  const preNew = show.pre || '', preOld = from ? (from.pre || '') : preNew;
  const pu = from ? E.inOut(seg(dt, 0, 0.6)) : 1;
  const pwNew = preNew ? textW(preNew, 'zhm', 28) + 14 : 0, pwOld = preOld ? textW(preOld, 'zhm', 28) + 14 : 0;
  const pw = lerp(pwOld, pwNew, pu);
  if (preOld && pu < 1) text(preOld, X, Y - 6, { f: 'zhm', size: 28, color: COL.gold, alpha: 0.75 * (1 - pu) });
  if (preNew) text(preNew, X, Y - 6, { f: 'zhm', size: 28, color: COL.gold, alpha: 0.75 * pu });
  // 数字：逐位滚动
  const nx = X + pw;
  const newS = show.year, oldS = from ? from.year : newS;
  setFont('num', S);
  const n = Math.max(newS.length, oldS.length);
  g.save();
  g.beginPath(); g.rect(nx - 10, Y - S * 0.92, 520, S * 1.08); g.clip();
  let xo = nx, xn = nx;
  for (let k = 0; k < n; k++) {
    const co = oldS[k] || '', cn = newS[k] || '';
    setFont('num', S);
    const wo = co ? g.measureText(co).width : 0, wn = cn ? g.measureText(cn).width : 0;
    const u = (from && co !== cn) ? E.inOut(seg(dt, 0.05 + k * 0.09, 0.05 + k * 0.09 + 0.62)) : 1;
    if (from && co === cn) { goldText(cn, xn, Y, S, { f: 'num', alpha: 1 }); }
    else {
      if (co && u < 1) goldText(co, xo, Y - u * S * 0.95, S, { f: 'num', alpha: 1 - u });
      if (cn) goldText(cn, xn, Y + (1 - u) * S * 0.95, S, { f: 'num', alpha: u });
    }
    xo += wo; xn += wn;
  }
  g.restore();
  // 细线
  const lg = g.createLinearGradient(X, 0, X + 420, 0);
  lg.addColorStop(0, 'rgba(227,194,122,0.75)'); lg.addColorStop(1, 'rgba(227,194,122,0)');
  g.fillStyle = lg; g.fillRect(X, Y + 22, 420, 1.5);
  // 地点 · 人物
  const placeNew = show.place || '', placeOld = from ? from.place : placeNew;
  if (placeOld !== placeNew && from) {
    const u = seg(dt, 0.1, 0.7);
    text(placeOld, X, Y + 66, { f: 'zhm', size: 29, color: COL.ivory, alpha: 0.85 * (1 - u) });
    text(placeNew, X, Y + 66, { f: 'zhm', size: 29, color: COL.ivory, alpha: 0.85 * u });
  } else text(placeNew, X, Y + 66, { f: 'zhm', size: 29, color: COL.ivory, alpha: 0.85 });
  g.restore();
}

// ---------------- 右上：文献卡 ----------------
let CITES = [];       // [{t0, t1, lat, zh, by}]
function drawCite(t) {
  for (const c of CITES) {
    const a = vis(t, c.t0, c.t1, 0.6);
    if (a <= 0.003) continue;
    const R = 1812, sx = (1 - E.out(seg(t, c.t0, c.t0 + 0.8))) * 24;
    g.save(); g.globalAlpha *= a; g.translate(sx, 0);
    // 原文书名（斜体，过长时缩小）
    let ls = 34; while (textW(c.lat, 'it', ls) > 620 && ls > 22) ls -= 1;
    text(c.lat, R - 6, 76, { f: 'it', size: ls, color: COL.ivory, alpha: 0.72, align: 'right' });
    text(c.zh, R - 6, 124, { f: 'zh', size: 34, color: COL.gold, align: 'right', glow: 10 });
    text(c.by, R - 6, 162, { f: 'zhm', size: 21, color: COL.ivory, alpha: 0.55, align: 'right', ls: 1 });
    const lg = g.createLinearGradient(R - 420, 0, R, 0);
    lg.addColorStop(0, 'rgba(227,194,122,0)'); lg.addColorStop(1, 'rgba(227,194,122,0.6)');
    g.fillStyle = lg; g.fillRect(R - 420, 180, 420, 1.2);
    g.restore();
    seal(1852 + sx, 70, 44, '文献', { alpha: a * E.out(seg(t, c.t0 + 0.3, c.t0 + 0.7)), rot: 0.04 });
  }
}

// ---------------- 底部字幕 ----------------
const SUB_Y = 966, SUB_S = 50;
function drawSubs(t) {
  for (const l of TL.lines) {
    if (!l.text || t < l.t0 - 0.05 || t > l.t1 + 0.4) continue;
    const out = 1 - E.sine(seg(t, l.t1, l.t1 + 0.36));
    if (out <= 0.003) continue;
    g.save(); g.globalAlpha *= out;
    richLine(l.text, 960, SUB_Y, SUB_S, t, l.t0, { glow: 14 });
    g.restore();
  }
}
function subShade(t) {
  let a = 0;
  for (const l of TL.lines) if (l.text) a = Math.max(a, vis(t, l.t0 - 0.3, l.t1, 0.4));
  if (a <= 0.003) return;
  const gr = g.createLinearGradient(0, 820, 0, H);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(0.55, 'rgba(5,4,3,0.55)'); gr.addColorStop(1, 'rgba(5,4,3,0.7)');
  g.save(); g.globalAlpha *= a; g.fillStyle = gr; g.fillRect(0, 820, W, H - 820); g.restore();
}

// ---------------- 右下：水印 ----------------
function watermark(t, alpha = 1) {
  if (alpha <= 0.003) return;
  g.save(); g.globalAlpha *= alpha * 0.8;
  g.strokeStyle = 'rgba(207,74,62,0.9)'; g.lineWidth = 1.5; rrect(1748, 1012, 20, 20, 3); g.stroke();
  dot(1758, 1022, 3.2, COL.red, 0.95);
  text('知洲', 1778, 1031, { f: 'zhm', size: 24, color: COL.ivory, alpha: 0.75, ls: 2 });
  g.restore();
}
