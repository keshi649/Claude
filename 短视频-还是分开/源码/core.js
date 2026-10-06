'use strict';
/* 《还是分开》Claude 版歌词 MV —— frame(T) 只依赖时间，逐帧确定地画出画面。
   core.js：时间轴工具、缓动、配色、字体、歌词字效、底纹、HUD（右下角水印「甜菜」）。 */
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

/* ---------------- 时间 ----------------
   s 是歌曲时间：音频第 0 秒就是第一个字"你"。成片前面多 PRE 秒点烟和片名，后面多几秒尾声。 */
const PRE = 2.0;                 // 片头：打火机、烟头亮起来、片名
const MUSIC_END = 65.1;          // 原曲片段在这里被剪断（成片里最后 0.5 秒淡出）
const END_S = 70.0;              // 成片结束（歌曲时间）
const DURATION = PRE + END_S;    // 成片总长 72 秒
const LEAD = 0.05;               // 字比开口早 1.5 帧弹出，看起来才是"踩在"字上
const ct = (li, ci) => LYR[li].t[ci] - LEAD;          // 第 li 句第 ci 个字弹出的时刻
const lt0 = li => LYR[li].t[0] - LEAD;                // 第 li 句开始
const lend = li => LYR[li].end;                       // 第 li 句唱完
const beatAt = k => BEAT0 + k * BEAT;
const beatIdx = s => Math.floor((s - BEAT0) / BEAT);
/* 拍点脉冲：每拍开头 1 → 衰减 */
function beatPulse(s, decay = 7) { const b = (s - BEAT0) / BEAT; if (b < 0 || s > MUSIC_END) return 0; return Math.exp(-(b - Math.floor(b)) * BEAT * decay); }
/* 强拍脉冲（每小节一次） */
function barPulse(s, decay = 5) { const b = (s - BAR0) / BAR; if (b < 0 || s > MUSIC_END) return 0; return Math.exp(-(b - Math.floor(b)) * BAR * decay); }
/* 每两拍点一次头：0→1→0 */
function bob(s) { const b = (s - BEAT0) / (2 * BEAT); return Math.abs(Math.sin(b * Math.PI)); }
const _AL = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
const _dec = str => Array.from(str, c => _AL.indexOf(c) / 61);
const VOCA = _dec(VOC_S), BEATA = _dec(BEATS_S);
function voc(s) { const f = s * ENV_FPS, i = Math.floor(f); if (i < 0 || i >= VOCA.length - 1) return 0; return lerp(VOCA[i], VOCA[i + 1], f - i); }
function beatStrength(k) { return BEATA[k] ?? 0; }

/* ---------------- 工具 ---------------- */
const TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => x < a ? a : x > b ? b : x;
const lerp = (a, b, u) => a + (b - a) * u;
const seg = (t, a, b) => clamp((t - a) / (b - a));
const E = {
  io: u => u < .5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2,
  out: u => 1 - Math.pow(1 - u, 3),
  out5: u => 1 - Math.pow(1 - u, 5),
  in: u => u * u * u,
  in2: u => u * u,
  sine: u => -(Math.cos(Math.PI * u) - 1) / 2,
  back: u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
  backS: u => { const c1 = 3.2, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
  bounce: u => { const n = 7.5625, d = 2.75; if (u < 1 / d) return n * u * u; if (u < 2 / d) return n * (u -= 1.5 / d) * u + .75; if (u < 2.5 / d) return n * (u -= 2.25 / d) * u + .9375; return n * (u -= 2.625 / d) * u + .984375; },
  elastic: u => u === 0 || u === 1 ? u : Math.pow(2, -10 * u) * Math.sin((u * 10 - .75) * TAU / 3) + 1,
};
/* [a,b] 内为 1，前后各用 fi / fo 秒淡入淡出 */
function win(t, a, b, fi = .2, fo = .2) { if (t < a || t > b) return 0; return Math.min(fi > 0 ? clamp((t - a) / fi) : 1, fo > 0 ? clamp((b - t) / fo) : 1); }
function R(seed) { let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(a, b = 0, c = 0) { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
/* 衰减抖动 */
function shake(t, t0, amp, dur = .4, f = 29) { if (t < t0 || t > t0 + dur) return [0, 0]; const k = 1 - (t - t0) / dur; return [Math.sin((t - t0) * f * 6.3) * amp * k * k, Math.cos((t - t0) * f * 5.1) * amp * k * k]; }
function shakes(t, list) { let x = 0, y = 0; for (const [t0, a, d] of list) { const [dx, dy] = shake(t, t0, a, d); x += dx; y += dy; } return [x, y]; }

function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function circ(g, x, y, r) { g.beginPath(); g.arc(x, y, Math.max(r, .01), 0, TAU); }
function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(rx, .01), Math.max(ry, .01), rot, 0, TAU); }
function poly(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }
function fs(g, fill, stroke, lw) { if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function withAlpha(g, a, fn) { if (a <= .001) return; g.save(); g.globalAlpha *= a; fn(); g.restore(); }
function vgrad(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }
function hgrad(g, x0, x1, stops) { const gr = g.createLinearGradient(x0, 0, x1, 0); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }

/* ---------------- 配色 ----------------
   我 = Clawd 的暖橘（取自模型图 #CB7C5E），你 = 冷蓝（鼠标指针那一边）。 */
const C = {
  clawd: '#CB7C5E', clawdD: '#A9603F', clawdL: '#E3A386', eye: '#171312',
  ink: '#121317', ink2: '#1B1D24', paper: '#EEEBE4', paper2: '#E4E0D7', white: '#F4F2ED',
  me: '#E8875F', meD: '#CB7C5E',               // 字里的「我」
  you: '#4F7BFF', youD: '#2F5BEA',             // 字里的「你」
  blue: '#2F5BEA', red: '#E5484D', redD: '#B8322F', yel: '#F4C542', green: '#3DBE6E', greenD: '#1F8A4C',
  gray: '#8A8F98', smoke: '#B9BEC6', navy: '#0E1430', pink: '#FF6B9A',
};

/* ---------------- 字体 ---------------- */
const FONT = { black: '"NotoBlack"', bold: '"NotoBold"', med: '"NotoMed"', mono: '"JBM", "NotoBold"', monoR: '"JBMR", "NotoMed"', monoX: '"JBMX", "NotoBlack"' };
function F(px, k = 'black') { return `${px}px ${FONT[k]}, sans-serif`; }
function tw(g, s, px, k = 'black') { g.font = F(px, k); return g.measureText(s).width; }

/* ---------------- 歌词字效 ----------------
   glyph：一个字在 t0 出场。style：
     slam  从大到正常，带模糊砸下来（默认）
     pop   从小弹出来
     drop  从上面掉下来弹两下
     type  直接出现（打字）
     smoke 像烟一样从模糊里浮出来
     rise  从下往上淡入
   o：col 颜色、k 字重、ext 挤出厚度、extCol 挤出颜色、outline 描边、hollow 只描边、glow 发光、
      rot 旋转、sc 缩放、alpha、out:[t1, dur] 退场、jit 抖动、skew 斜切、mosaic 马赛克格子 */
function glyph(g, s, t0, ch, x, y, px, o = {}) {
  if (s < t0) return 0;
  const st = o.style || 'slam';
  const dur = o.dur || { slam: .2, pop: .3, drop: .5, type: .001, smoke: .7, rise: .35 }[st];
  const u = clamp((s - t0) / dur);
  let sc = o.sc ?? 1, ox = 0, oy = 0, al = o.alpha ?? 1, blur = 0;
  if (st === 'slam') { sc *= 1 + (o.from ?? .85) * Math.pow(1 - u, 3); blur = (o.blur ?? 9) * Math.pow(1 - u, 2); al *= clamp((s - t0) / .04); }
  else if (st === 'pop') { sc *= .15 + .85 * E.back(u); al *= clamp((s - t0) / .05); }
  else if (st === 'drop') { oy = -(1 - E.bounce(u)) * (o.drop || 320); al *= clamp((s - t0) / .05); }
  else if (st === 'smoke') { blur = 18 * Math.pow(1 - u, 2); oy = 36 * (1 - E.out(u)); al *= E.out(u); sc *= 1.08 - .08 * E.out(u); }
  else if (st === 'rise') { oy = 46 * (1 - E.out(u)); al *= E.out(u); }
  if (o.out) { const [t1, d1 = .25] = o.out; const v = clamp((s - t1) / d1); if (v >= 1) return 0; al *= 1 - E.in2(v); if (o.outStyle === 'up') oy -= 60 * E.in(v); if (o.outStyle === 'shrink') sc *= 1 - .6 * E.in(v); if (o.outStyle === 'blur') blur += 14 * v; }
  if (o.dx) ox += o.dx * (1 - E.out(u));
  if (o.dy) oy += o.dy * (1 - E.out(u));
  if (o.jit) { ox += (hash(Math.floor(s * 24), ch.charCodeAt(0)) - .5) * o.jit; oy += (hash(Math.floor(s * 24), 7, ch.charCodeAt(0)) - .5) * o.jit; }
  if (al <= .002) return 0;
  g.save();
  g.globalAlpha *= al;
  g.translate(x + ox, y + oy);
  if (o.rot) g.rotate(o.rot);
  if (o.skew) g.transform(1, 0, o.skew, 1, 0, 0);
  g.scale(sc, sc);
  if (blur > .4) g.filter = `blur(${blur.toFixed(1)}px)`;
  g.font = F(px, o.k || 'black');
  g.textAlign = o.align || 'center'; g.textBaseline = 'middle';
  const yo = px * (o.k === 'mono' || o.k === 'monoX' ? .02 : .06);   // 思源黑体的 middle 稍微偏上，往下挪一点
  if (o.mosaic) { mosaicText(g, ch, px, o); g.restore(); return px; }
  const ext = o.ext || 0;
  if (o.shadow) { g.fillStyle = o.shadow; g.fillText(ch, px * .04, yo + px * .06); }
  if (ext) {
    g.fillStyle = o.extCol || '#000';
    const n = Math.max(2, Math.round(ext / 1.6));
    const ea = o.extAng ?? .8;
    for (let i = n; i >= 1; i--) { const d = ext * i / n; g.fillText(ch, d * ea, yo + d); }
  }
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = o.glowR || px * .3; }
  if (o.hollow) {
    g.lineJoin = 'round'; g.lineWidth = o.hollow; g.strokeStyle = o.col || C.white;
    if (o.dash) g.setLineDash(o.dash);
    g.strokeText(ch, 0, yo);
  } else {
    if (o.outline) { g.lineJoin = 'round'; g.lineWidth = o.outline; g.strokeStyle = o.outlineCol || C.ink; g.strokeText(ch, 0, yo); }
    g.fillStyle = o.col || C.white;
    g.fillText(ch, 0, yo);
  }
  g.restore();
  return px;
}
/* 马赛克字：先画到小画布再按格子放大（"不堪"用） */
const _mz = mk(64, 64), _mzg = _mz.getContext('2d');
function mosaicText(g, ch, px, o) {
  const cell = Math.max(2, o.mosaic), n = Math.max(4, Math.round(px * 1.2 / cell));
  _mzg.clearRect(0, 0, 64, 64);
  _mzg.font = F(n / 1.2 * .98, o.k || 'black'); _mzg.textAlign = 'center'; _mzg.textBaseline = 'middle';
  _mzg.fillStyle = o.col || C.white; _mzg.fillText(ch, 32, 32 + n * .05);
  g.imageSmoothingEnabled = false;
  const k = px * 1.2 / n;
  g.drawImage(_mz, 32 - n / 2, 32 - n / 2, n, n, -n * k / 2, -n * k / 2, n * k, n * k);
  g.imageSmoothingEnabled = true;
}
/* 字的颜色：「你」冷蓝，「我」暖橘，其余用 base */
function duo(ch, base, light) { if (ch === '你') return light ? C.youD : C.you; if (ch === '我') return light ? C.meD : C.me; return base; }
/* 一句歌词里 [a, b) 这几个字排成一行。x 是第一个字的中心；px 字号；o 同 glyph，另有：
   gap 字距、each(i, ch) 单字覆盖、light 浅底（「你/我」用深一点的颜色）、noDuo 不上色。返回每个字的中心 x。 */
function lyricRow(g, s, li, a, b, x, y, px, o = {}) {
  const L = LYR[li], chs = [...L.s], xs = [];
  let cx = x;
  const gap = o.gap ?? px * .04;
  for (let i = a; i < b; i++) {
    const ch = chs[i];
    let oi = Object.assign({}, o);
    if (!o.noDuo) oi.col = duo(ch, o.col || C.white, o.light);
    if (o.each) Object.assign(oi, o.each(i, ch));
    xs.push(cx);
    glyph(g, s, oi.t0 ?? ct(li, i), ch, cx, y, px * (oi.size || 1), oi);
    cx += px + gap;
  }
  return xs;
}
const rowW = (n, px, gap) => n * px + (n - 1) * (gap ?? px * .04);

/* 等宽字：终端 / 代码 / 标签 */
function mono(g, str, x, y, px, col, o = {}) {
  g.save(); g.font = F(px, o.k || 'mono'); g.textAlign = o.align || 'left'; g.textBaseline = 'middle';
  if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  g.fillStyle = col; g.fillText(str, x, y); g.restore();
}
/* 打字机：返回 [显示的字符串, 是否在打字] */
function typed(str, s, t0, cps = 26) { if (s < t0) return ['', false]; const n = Math.floor((s - t0) * cps); return [[...str].slice(0, n).join(''), n < [...str].length]; }
/* 胶囊标签 */
function pill(g, x, y, str, px, o = {}) {
  const k = o.k || 'mono', w = tw(g, str, px, k) + px * (o.padX ?? 1.2), h = px * (o.hh ?? 1.8);
  const x0 = o.align === 'left' ? x : x - w / 2;
  g.save();
  if (o.alpha !== undefined) g.globalAlpha *= o.alpha;
  rr(g, x0, y - h / 2, w, h, o.r ?? h / 2); g.fillStyle = o.fill || 'rgba(10,10,12,.85)'; g.fill();
  if (o.line) { g.strokeStyle = o.line; g.lineWidth = o.lw || 3; g.stroke(); }
  g.font = F(px, k); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = o.col || '#EDEBE6';
  g.fillText(str, x0 + px * (o.padX ?? 1.2) / 2, y + px * .05);
  g.restore();
  return w;
}

/* ---------------- 底纹 ---------------- */
function dotGrid(g, col, step = 44, r = 1.7, ox = 0, oy = 0) {
  g.fillStyle = col;
  const x0 = ((ox % step) + step) % step, y0 = ((oy % step) + step) % step;
  for (let y = y0 - step + step / 2; y < H + step; y += step) for (let x = x0 - step + step / 2; x < W + step; x += step) g.fillRect(x - r, y - r, r * 2, r * 2);
}
function bgInk(g, ox = 0, oy = 0, col = C.ink) { g.fillStyle = col; g.fillRect(0, 0, W, H); dotGrid(g, 'rgba(255,255,255,.055)', 44, 1.7, ox, oy); }
function bgPaper(g, ox = 0, oy = 0, col = C.paper) { g.fillStyle = col; g.fillRect(0, 0, W, H); dotGrid(g, 'rgba(60,40,30,.11)', 44, 1.8, ox, oy); }
function bgColor(g, col, dots = 'rgba(255,255,255,.08)', ox = 0, oy = 0) { g.fillStyle = col; g.fillRect(0, 0, W, H); dotGrid(g, dots, 44, 1.8, ox, oy); }
/* 半调网点（漫画感） */
function halftone(g, col, cx, cy, rMax, step = 26, fall = 900) {
  g.fillStyle = col;
  for (let y = step / 2; y < H; y += step) for (let x = step / 2; x < W; x += step) {
    const d = Math.hypot(x - cx, y - cy), r = rMax * clamp(1 - d / fall);
    if (r > .4) { g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill(); }
  }
}
/* 速度线 */
function speedLines(g, s, col, n = 26, dir = -1, y0 = 0, y1 = H, seed = 3) {
  g.save(); g.strokeStyle = col; g.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const r = hash(i, seed), y = lerp(y0, y1, hash(i, seed, 2)), len = 200 + r * 520, sp = 2600 + r * 1800;
    const x = ((dir < 0 ? -1 : 1) * s * sp + hash(i, seed, 9) * (W + len * 2)) % (W + len * 2);
    const xx = dir < 0 ? W + len - ((x + W + len * 2) % (W + len * 2)) : ((x + W + len * 2) % (W + len * 2)) - len;
    g.lineWidth = 2 + r * 5; g.globalAlpha = .25 + .5 * hash(i, seed, 4);
    g.beginPath(); g.moveTo(xx, y); g.lineTo(xx + len, y); g.stroke();
  }
  g.restore();
}

/* 纹理：固定不动的颗粒（逐帧变化的颗粒会让成片大很多）和暗角 */
const grainCv = mk(W / 2, H / 2);
(() => {
  const g = grainCv.getContext('2d'), id = g.createImageData(W / 2, H / 2), d = id.data, r = R(11);
  for (let i = 0; i < d.length; i += 4) { const v = r() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  g.putImageData(id, 0, 0);
})();
const vignCv = mk();
(() => {
  const g = vignCv.getContext('2d'), gr = g.createRadialGradient(W / 2, H / 2, H * .42, W / 2, H / 2, H * 1.05);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.40)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
})();

/* ---------------- HUD ----------------
   左上歌名、右上小节数和四拍灯、左下时间码、底部进度条、右下水印「甜菜」和一颗会随拍子点头的小甜菜。 */
const THEME = {
  dark: { fg: '#ECEAE4', dim: 'rgba(230,228,221,.6)', sq: 'rgba(255,255,255,.2)', track: 'rgba(255,255,255,.16)' },
  light: { fg: '#1E1E1E', dim: 'rgba(30,30,30,.56)', sq: 'rgba(0,0,0,.14)', track: 'rgba(0,0,0,.12)' },
};
/* 像素甜菜：圆根 + 两片叶子 + 小尾巴 */
const BEET = [
  '....G..G....',
  '...GGG.GG...',
  '...GgG.GgG..',
  '....GGGgG...',
  '.....Gg.....',
  '...rrrrrr...',
  '..rrRrrrrr..',
  '.rrRrrrrrrr.',
  '.rrrrrrrrrr.',
  '.rrrrrrrrDr.',
  '..rrrrrrDr..',
  '...rrrrDr...',
  '....rrrr....',
  '.....rr.....',
  '.....r......',
];
const BEET_COL = { G: '#4DB86A', g: '#2E8A4A', r: '#B32656', R: '#E45C86', D: '#7E1638' };
function pixMap(g, map, x, y, q, cols) {
  for (let j = 0; j < map.length; j++) for (let i = 0; i < map[j].length; i++) {
    const c = cols[map[j][i]]; if (!c) continue;
    g.fillStyle = c; g.fillRect(x + i * q, y + j * q, q + .4, q + .4);
  }
}
function beet(g, x, y, q, sway = 0) {
  g.save(); g.translate(x, y);
  // 叶子随拍子摆
  g.save(); g.translate(6 * q, 5 * q); g.rotate(sway * .25); g.translate(-6 * q, -5 * q);
  pixMap(g, BEET.slice(0, 5), -0 * q, 0, q, BEET_COL);
  g.restore();
  pixMap(g, BEET.slice(5), 0, 5 * q, q, BEET_COL);
  g.restore();
}
function hud(g, s, mode, acc) {
  const th = THEME[mode] || THEME.dark;
  g.save();
  g.textBaseline = 'middle';
  g.font = F(28, 'bold'); g.fillStyle = th.dim; g.textAlign = 'left';
  g.fillText('张叶蕾 – 还是分开', 48, 40);
  const live = s >= 0 && s < MUSIC_END;
  const bi = beatIdx(s);
  const barN = s < BAR0 ? 0 : Math.floor((Math.min(s, MUSIC_END) - BAR0) / BAR) + 1;
  const curBeat = s < BAR0 ? ((bi % 4) + 4 + 2) % 4 : Math.floor(((s - BAR0) / BEAT) % 4);
  g.font = F(26, 'mono'); g.textAlign = 'right'; g.fillStyle = th.dim;
  g.fillText(`BAR ${String(barN).padStart(2, '0')}`, 1722, 41);
  for (let i = 0; i < 4; i++) {
    const on = live && bi >= 0 && curBeat === i;
    g.fillStyle = on ? acc : th.sq; g.fillRect(1740 + i * 34, 33, 26, 16);
  }
  g.font = F(22, 'monoR'); g.textAlign = 'left'; g.fillStyle = th.dim;
  const ss = Math.floor(clamp(s, 0, SONG_DUR));
  g.fillText(`${Math.floor(ss / 60)}:${String(ss % 60).padStart(2, '0')}`, 48, 1020);
  g.fillStyle = th.track; g.fillRect(48, 1045, 1824, 2);
  g.fillStyle = th.fg; g.fillRect(48, 1044, 1824 * clamp((s + PRE) / DURATION), 4);
  g.font = F(34, 'bold'); g.fillStyle = th.dim; g.textAlign = 'right';
  g.fillText('甜菜', 1812, 1013);
  g.globalAlpha = mode === 'light' ? .85 : .9;
  const sway = live ? Math.sin((s - BEAT0) / BEAT * Math.PI) : Math.sin(s * 2) * .3;
  beet(g, 1822, 984 - Math.max(0, sway) * 3, 3.1, sway);
  g.restore();
}
