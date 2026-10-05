'use strict';
/* 《世界上的另一个我》Claude 版歌词 MV —— frame(t) 只依赖时间 t，逐帧确定地画出画面。
   core.js：工具、文字特效、Clawd、HUD、纹理。 */
const W = 1920, H = 1080;
const cv = document.getElementById('c');
const ctx = cv.getContext('2d');
function mk(w = W, h = H) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }

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
  sine: u => -(Math.cos(Math.PI * u) - 1) / 2,
  back: u => { const c1 = 1.70158, c3 = c1 + 1; return 1 + c3 * Math.pow(u - 1, 3) + c1 * Math.pow(u - 1, 2); },
  bounce: u => { const n = 7.5625, d = 2.75; if (u < 1 / d) return n * u * u; if (u < 2 / d) return n * (u -= 1.5 / d) * u + .75; if (u < 2.5 / d) return n * (u -= 2.25 / d) * u + .9375; return n * (u -= 2.625 / d) * u + .984375; },
};
/* [a,b] 内为 1，前后各用 fi / fo 秒淡入淡出 */
function win(t, a, b, fi = .2, fo = .2) { if (t < a || t > b) return 0; return Math.min(fi > 0 ? clamp((t - a) / fi) : 1, fo > 0 ? clamp((b - t) / fo) : 1); }
function R(seed) { let s = seed >>> 0; return () => { s = s + 0x6D2B79F5 | 0; let t = Math.imul(s ^ s >>> 15, 1 | s); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(a, b = 0, c = 0) { let h = (a * 374761393 + b * 668265263 + c * 2147483647) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
/* 衰减抖动 */
function shake(t, t0, amp, dur = .4, f = 29) { if (t < t0 || t > t0 + dur) return [0, 0]; const k = 1 - (t - t0) / dur; return [Math.sin((t - t0) * f * 6.3) * amp * k * k, Math.cos((t - t0) * f * 5.1) * amp * k * k]; }
/* 拍点脉冲：每拍开头 1 → 衰减到 0 */
function beatPulse(t, decay = 6) { const b = (t - BEAT0) / BEAT; if (b < 0) return 0; return Math.exp(-(b - Math.floor(b)) * BEAT * decay); }

function rr(g, x, y, w, h, r) { g.beginPath(); g.roundRect(x, y, w, h, r); }
function circ(g, x, y, r) { g.beginPath(); g.arc(x, y, Math.max(r, .01), 0, TAU); }
function ell(g, x, y, rx, ry, rot = 0) { g.beginPath(); g.ellipse(x, y, Math.max(rx, .01), Math.max(ry, .01), rot, 0, TAU); }
function poly(g, pts) { g.beginPath(); pts.forEach(([x, y], i) => i ? g.lineTo(x, y) : g.moveTo(x, y)); g.closePath(); }
function fs(g, fill, stroke, lw) { if (fill) { g.fillStyle = fill; g.fill(); } if (stroke) { g.strokeStyle = stroke; g.lineWidth = lw; g.stroke(); } }
function withAlpha(g, a, fn) { if (a <= .001) return; g.save(); g.globalAlpha *= a; fn(); g.restore(); }
function vgrad(g, y0, y1, stops) { const gr = g.createLinearGradient(0, y0, 0, y1); stops.forEach(([o, c]) => gr.addColorStop(o, c)); return gr; }

/* ---------------- 配色 ---------------- */
const C = {
  clawd: '#D97757', clawdD: '#B85F43', ink: '#141413', eye: '#1A1714',
  term: '#151515', paper: '#EEECE6', white: '#F3F1EC',
  blue: '#2F5BEA', yel: '#F2C230', pink: '#FF5FA2', mint: '#3CF0B0', red: '#E8473B', cyan: '#5FD4FF',
};

/* ---------------- 字体 ---------------- */
const FONT = {
  black: '"NotoBlack"', bold: '"NotoBold"', med: '"NotoMed"',
  mono: '"JBM", "NotoBold"', monoR: '"JBMR", "NotoMed"', monoX: '"JBMX", "NotoBlack"', script: '"Pacifico"',
};
function F(px, k = 'black') { return `${px}px ${FONT[k]}, sans-serif`; }
function tw(g, s, px, k = 'black') { g.font = F(px, k); return g.measureText(s).width; }

/* 一段字在 t0 弹出。style：slam（大→正常，砸下来）| pop（小→回弹）| drop（从上方掉下）| type（直接出现）
   o: col, k, ext（挤出厚度）, extCol, shadow, align, rot, alpha, dx/dy（入场位移）, glow, outline */
function glyph(g, t, t0, s, x, y, px, o = {}) {
  if (t < t0) return 0;
  const st = o.style || 'slam', dur = o.dur || (st === 'drop' ? .42 : .2);
  const u = clamp((t - t0) / dur);
  let sc = 1, ox = 0, oy = 0, al = clamp((t - t0) / .045) * (o.alpha ?? 1);
  if (st === 'slam') sc = 1 + .62 * Math.pow(1 - u, 4) - .05 * Math.sin(Math.PI * u);
  else if (st === 'pop') { sc = .25 + .75 * E.back(u); al = clamp((t - t0) / .07) * (o.alpha ?? 1); }
  else if (st === 'drop') { oy = -(1 - E.bounce(u)) * (o.drop || 260); al = clamp((t - t0) / .06) * (o.alpha ?? 1); }
  if (o.dx) ox += o.dx * (1 - E.out(u));
  if (o.dy) oy += o.dy * (1 - E.out(u));
  if (al <= .001) return 0;
  g.save();
  g.globalAlpha *= al;
  g.translate(x + ox, y + oy);
  if (o.rot) g.rotate(o.rot);
  g.scale(sc, sc);
  g.font = F(px, o.k || 'black');
  g.textAlign = o.align || 'left'; g.textBaseline = 'middle';
  const ext = o.ext || 0;
  if (o.shadow !== false && !ext) { g.fillStyle = o.shadowCol || 'rgba(0,0,0,.35)'; g.fillText(s, px * .035, px * .05); }
  if (ext) {
    g.fillStyle = o.extCol || '#000';
    const n = Math.max(2, Math.round(ext / 2));
    for (let i = n; i >= 1; i--) { const d = ext * i / n; g.fillText(s, d * .7, d); }
  }
  if (o.outline) { g.lineJoin = 'round'; g.lineWidth = o.outline; g.strokeStyle = o.outlineCol || C.ink; g.strokeText(s, 0, 0); }
  if (o.glow) { g.shadowColor = o.glow; g.shadowBlur = o.glowR || px * .25; }
  g.fillStyle = o.col || C.white;
  g.fillText(s, 0, 0);
  g.restore();
  return tw(g, s, px, o.k || 'black');
}
/* 一排字，每个字有自己的弹出时刻；返回每个字的 x 坐标 */
function glyphRow(g, t, chars, times, x, y, px, o = {}) {
  const xs = []; let cx = x;
  const gap = o.gap ?? px * .02;
  for (let i = 0; i < chars.length; i++) {
    const w = tw(g, chars[i], px, o.k || 'black');
    xs.push(cx);
    const oi = o.each ? Object.assign({}, o, o.each(i)) : o;
    glyph(g, t, times[i], chars[i], cx, y, px, oi);
    cx += w + gap;
  }
  return xs;
}

/* 文字取样成点（给"烟火成字"用），结果缓存 */
const _ptsCache = {};
function glyphPoints(ch, px, step, k = 'black') {
  const key = `${ch}|${px}|${step}|${k}`; if (_ptsCache[key]) return _ptsCache[key];
  const s = Math.ceil(px * 1.3), c = mk(s, s), g = c.getContext('2d');
  g.fillStyle = '#fff'; g.font = F(px, k); g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(ch, s / 2, s / 2);
  const d = g.getImageData(0, 0, s, s).data, pts = [];
  for (let y = 0; y < s; y += step) for (let x = 0; x < s; x += step) {
    const jx = Math.round((hash(x, y, 3) - .5) * step * .5), jy = Math.round((hash(x, y, 5) - .5) * step * .5);
    const xx = clamp(x + jx, 0, s - 1), yy = clamp(y + jy, 0, s - 1);
    if (d[(yy * s + xx) * 4 + 3] > 140) pts.push([xx - s / 2, yy - s / 2]);
  }
  return (_ptsCache[key] = pts);
}

/* 圆角胶囊标签 */
function pill(g, x, y, s, px, o = {}) {
  const k = o.k || 'mono';
  const w = tw(g, s, px, k) + px * (o.padX ?? 1.1) + (o.dot ? px * .9 : 0), h = px * (o.hh ?? 1.75);
  const x0 = o.align === 'left' ? x : x - w / 2;
  g.save();
  rr(g, x0, y - h / 2, w, h, o.r ?? h / 2); g.fillStyle = o.fill || 'rgba(10,10,12,.82)'; g.fill();
  if (o.line) { g.strokeStyle = o.line; g.lineWidth = o.lw || 3; g.stroke(); }
  let tx = x0 + px * (o.padX ?? 1.1) / 2;
  if (o.dot) { circ(g, tx + px * .3, y, px * .22); g.fillStyle = o.dot; g.fill(); tx += px * .9; }
  g.font = F(px, k); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = o.col || '#EDEBE6';
  g.fillText(s, tx, y + px * .04);
  g.restore();
  return w;
}

/* 翻页时钟式的时间戳："上一秒 / 下一秒" 的那一秒 */
function flipClock(g, t, x, y, from, to, tFlip, o = {}) {
  const px = o.px || 40, a = o.alpha ?? 1;
  if (a <= .001) return;
  g.save(); g.globalAlpha *= a;
  const cw = px * .78, chh = px * 1.5, gap = px * .1;
  let cx = x;
  g.font = F(px, 'mono'); g.textAlign = 'center'; g.textBaseline = 'middle';
  for (let i = 0; i < to.length; i++) {
    const c0 = from[i], c1 = to[i];
    if (c1 === ':') { g.fillStyle = o.colon || 'rgba(255,255,255,.7)'; g.fillText(':', cx + cw * .25, y); cx += cw * .5 + gap; continue; }
    const u = c0 !== c1 ? seg(t, tFlip + i * .015, tFlip + .14 + i * .015) : 1;
    rr(g, cx, y - chh / 2, cw, chh, 6); g.fillStyle = o.card || '#1E1F24'; g.fill();
    // 翻页：旧字压扁消失，新字从扁里弹开
    const k = u < .5 ? Math.cos(u * Math.PI) : -Math.cos(u * Math.PI);
    g.save(); g.translate(cx + cw / 2, y); g.scale(1, Math.max(k, .02));
    g.fillStyle = o.col || '#F4F2EC'; g.fillText(u < .5 ? c0 : c1, 0, px * .04);
    g.restore();
    g.fillStyle = 'rgba(0,0,0,.5)'; g.fillRect(cx, y - 1, cw, 2);
    cx += cw + gap;
  }
  g.restore();
}

/* ---------------- Clawd ----------------
   网格取自 Claude Code 终端里的吉祥物：18×10 个半格。
   身体 (3,0)-(14,7)，手 (1-2,4-5)/(15-16,4-5)，四条腿在第 4/6/11/13 列，眼睛在第 5/12 列。
   (x, y) 是脚底中心，p 是一个半格的像素大小。 */
const LEGS = [4, 6, 11, 13];
function clawd(g, x, y, p, o = {}) {
  const t = o.t || 0;
  g.save();
  g.translate(x, y);
  if (o.shadow !== false) { g.fillStyle = o.shadowCol || 'rgba(0,0,0,.28)'; ell(g, 0, 0, 8.5 * p * (1 + (o.sq || 0) * .5), 1.3 * p); g.fill(); }
  if (o.rot) g.rotate(o.rot);
  const sq = o.sq || 0;
  g.scale((o.flip ? -1 : 1) * (1 + sq * .5) * (o.sc || 1), (1 - sq) * (o.sc || 1));
  g.translate(-9 * p, -10 * p - (o.lift || 0));
  const col = o.col || C.clawd;
  const R_ = (cx, cy, w, h, c) => { g.fillStyle = c; g.fillRect(cx * p, cy * p, w * p + .5, h * p + .5); };
  // 腿（走路时交替抬起）
  LEGS.forEach((c, i) => {
    let lift = 0;
    if (o.walk !== undefined) lift = Math.max(0, Math.sin(o.walk * TAU + (i % 2) * Math.PI)) * .9;
    if (o.legsUp) lift = 1.2;
    R_(c, 8, 1, 2 - lift, col);
  });
  // 身体与手
  R_(3, 0, 12, 8, col);
  const la = o.armL || 0, ra = o.armR || 0;
  R_(1, 4 - 3 * la, 2, 2, col);
  R_(15, 4 - 3 * ra, 2, 2, col);
  if (o.blush) { g.globalAlpha = o.blush; R_(4, 4.6, 2, 1, '#F2A0A6'); R_(12, 4.6, 2, 1, '#F2A0A6'); g.globalAlpha = 1; }
  eyes(g, p, o);
  if (o.shades) shades(g, p, o.shades);
  if (o.crown) { R_(5, -2, 8, 1.4, '#F2C230'); R_(5, -3.4, 1.4, 1.4, '#F2C230'); R_(8.3, -3.8, 1.4, 1.8, '#F2C230'); R_(11.6, -3.4, 1.4, 1.4, '#F2C230'); R_(8.6, -1.6, .8, .8, '#E8473B'); }
  if (o.bow) { R_(10, -1.6, 2, 2, '#FF4FA0'); R_(13, -1.6, 2, 2, '#FF4FA0'); R_(12, -1.1, 1, 1, '#C0306E'); }
  if (o.scarf) { R_(2.6, 6.2, 12.8, 1.6, o.scarf); R_(11, 7.6, 1.6, 2.2, o.scarf); }
  g.restore();
}
/* 眼睛：normal | blink | happy | squint | heart | up | look | wide | closed | star | sad | dot */
function eyes(g, p, o) {
  const k = o.eyes || 'normal', t = o.t || 0, [lx, ly] = o.look || [0, 0];
  const E_ = (cx, cy, w, h, c = C.eye) => { g.fillStyle = c; g.fillRect(cx * p, cy * p, w * p + .5, h * p + .5); };
  let kind = k;
  if ((k === 'normal' || k === 'up' || k === 'look') && o.blinkOK !== false) {
    const ph = (t + (o.ph || 0)) % 3.3; if (ph < .11) kind = 'blink';
  }
  switch (kind) {
    case 'normal': case 'look': E_(5 + lx, 2 + ly, 1, 2); E_(12 + lx, 2 + ly, 1, 2); break;
    case 'up': E_(5 + lx, 1 + ly, 1, 2); E_(12 + lx, 1 + ly, 1, 2); break;
    case 'blink': E_(4.6 + lx, 3.2 + ly, 1.8, .6); E_(11.6 + lx, 3.2 + ly, 1.8, .6); break;
    case 'dot': E_(5 + lx, 2.5 + ly, 1, 1); E_(12 + lx, 2.5 + ly, 1, 1); break;
    case 'wide': E_(4.5 + lx, 1.5 + ly, 2, 2.4); E_(11.5 + lx, 1.5 + ly, 2, 2.4); E_(5.4 + lx, 1.8 + ly, .6, .6, '#fff'); E_(12.4 + lx, 1.8 + ly, .6, .6, '#fff'); break;
    case 'happy': for (const c of [5, 12]) { E_(c - 1, 3, 1, 1); E_(c, 2, 1, 1); E_(c + 1, 3, 1, 1); } break;
    case 'closed': for (const c of [5, 12]) { E_(c - 1, 2.6, 1, 1); E_(c, 3.4, 1, .9); E_(c + 1, 2.6, 1, 1); } break;
    case 'squint': E_(4, 1.4, 1, 1); E_(5, 2.4, 1, 1); E_(4, 3.4, 1, 1); E_(13, 1.4, 1, 1); E_(12, 2.4, 1, 1); E_(13, 3.4, 1, 1); break;
    case 'sad': E_(4.4, 2.6, 2, .7); E_(11.6, 2.6, 2, .7); break;
    case 'heart': {
      const b = 1 + .12 * Math.sin(t * 14);
      for (const c of [5.5, 12.5]) {
        g.save(); g.translate(c * p, 2.9 * p); g.scale(b, b); g.translate(-c * p, -2.9 * p);
        const hc = '#FF3D7F';
        E_(c - 1.5, 1.4, 1, 1, hc); E_(c + .5, 1.4, 1, 1, hc); E_(c - 1.5, 2.4, 3, 1, hc); E_(c - 1, 3.4, 2, .8, hc); E_(c - .5, 4.1, 1, .7, hc);
        g.restore();
      }
      break;
    }
    case 'star': for (const c of [5.5, 12.5]) { const s = .7 + .2 * Math.sin(t * 10 + c); E_(c - .5 * s, 1.2, s, 3.2, '#FFE27A'); E_(c - 1.6 * s, 2.8 - s * .5 + .5, 3.2 * s, s, '#FFE27A'); } break;
  }
}
function shades(g, p, on) {
  if (!on) return;
  const R_ = (cx, cy, w, h, c) => { g.fillStyle = c; g.fillRect(cx * p, cy * p, w * p + .5, h * p + .5); };
  R_(3.5, 1.6, 11, .8, '#0E0E10');
  R_(3.8, 1.6, 4.4, 2.6, '#0E0E10'); R_(9.8, 1.6, 4.4, 2.6, '#0E0E10');
  R_(4.6, 2.2, 1.2, .6, 'rgba(255,255,255,.75)'); R_(10.6, 2.2, 1.2, .6, 'rgba(255,255,255,.75)');
}
/* 头顶的小符号：! ? ♥ */
function marks(g, x, y, kind, t, t0, o = {}) {
  if (t < t0 || t > (o.until ?? 1e9)) return;
  const u = clamp((t - t0) / .18), a = clamp(((o.until ?? 1e9) - t) / .12);
  g.save(); g.globalAlpha *= a; g.translate(x, y); g.scale(E.back(u), E.back(u));
  const col = o.col || C.yel, s = o.s || 1;
  g.font = F(64 * s, 'black'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col;
  if (kind === '!') { g.save(); g.rotate(-.25); g.fillText('!', -26 * s, 0); g.restore(); g.save(); g.rotate(.2); g.fillText('!', 18 * s, -14 * s); g.restore(); }
  else if (kind === '?') { g.fillText('?', -20 * s, 0); g.font = F(44 * s, 'black'); g.fillText('?', 24 * s, -26 * s); }
  else if (kind === '♥') { pixHeart(g, 0, 0, 7 * s, col); }
  g.restore();
}
function pixHeart(g, x, y, q, col) {
  const M = ['0110110', '1111111', '1111111', '0111110', '0011100', '0001000'];
  g.fillStyle = col;
  M.forEach((r, j) => { for (let i = 0; i < 7; i++) if (r[i] === '1') g.fillRect(x + (i - 3.5) * q, y + (j - 3) * q, q + .5, q + .5); });
}

/* ---------------- HUD ----------------
   左上歌名、右上小节与四拍灯、左下时间码、底部进度条、右下"知洲"和飘起来的 z。 */
const THEME = {
  dark: { fg: '#ECEAE4', dim: 'rgba(225,223,216,.58)', sq: 'rgba(255,255,255,.2)', track: 'rgba(255,255,255,.16)' },
  light: { fg: '#1E1E1E', dim: 'rgba(30,30,30,.55)', sq: 'rgba(0,0,0,.14)', track: 'rgba(0,0,0,.12)' },
};
function hud(g, t, mode, acc) {
  const th = THEME[mode];
  g.save();
  g.textBaseline = 'middle';
  g.font = F(29, 'bold'); g.fillStyle = th.dim; g.textAlign = 'left';
  g.fillText('阿肆 / 郭采洁 – 世界上的另一个我', 48, 38);
  const bi = Math.floor((t - BEAT0) / BEAT), live = t < MUSIC_END;
  const bar = Math.max(1, Math.floor(Math.min(bi, Math.floor((MUSIC_END - BEAT0) / BEAT)) / 4) + 1);
  g.font = F(27, 'mono'); g.textAlign = 'right'; g.fillStyle = th.dim;
  g.fillText(`BAR ${String(bar).padStart(2, '0')}`, 1722, 39);
  for (let i = 0; i < 4; i++) {
    const on = live && bi >= 0 && bi % 4 === i;
    g.fillStyle = on ? acc : th.sq; g.fillRect(1740 + i * 34, 31, 26, 16);
  }
  g.font = F(23, 'monoR'); g.textAlign = 'left'; g.fillStyle = th.dim;
  const s = Math.floor(t); g.fillText(`${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`, 48, 1020);
  g.fillStyle = th.track; g.fillRect(48, 1045, 1824, 2);
  g.fillStyle = th.fg; g.fillRect(48, 1044, 1824 * clamp(t / DURATION), 4);
  g.font = F(35, 'bold'); g.fillStyle = th.dim; g.textAlign = 'right';
  g.fillText('知洲', 1814, 1015);
  for (let k = 0; k < 2; k++) {
    const ph = (t * .5 + k * .5) % 1;
    g.globalAlpha = Math.sin(ph * Math.PI) * .85;
    g.font = F(16 + ph * 12, 'mono'); g.textAlign = 'left';
    g.fillText(k ? 'Z' : 'z', 1830 + ph * 16, 998 - ph * 40);
  }
  g.restore();
}

/* ---------------- 纹理 ---------------- */
const grainCv = mk(W / 2, H / 2);
(() => {
  const g = grainCv.getContext('2d'), id = g.createImageData(W / 2, H / 2), d = id.data, r = R(11);
  for (let i = 0; i < d.length; i += 4) { const v = r() * 255; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; }
  g.putImageData(id, 0, 0);
})();
const vignCv = mk();
(() => {
  const g = vignCv.getContext('2d'), gr = g.createRadialGradient(W / 2, H / 2, H * .45, W / 2, H / 2, H * 1.05);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.42)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
})();
/* 点阵底纹 */
function dotGrid(g, col, step = 40, r = 1.6, x0 = 0, y0 = 0, w = W, h = H) {
  g.fillStyle = col;
  for (let y = y0 + step / 2; y < y0 + h; y += step) for (let x = x0 + step / 2; x < x0 + w; x += step) g.fillRect(x - r, y - r, r * 2, r * 2);
}
