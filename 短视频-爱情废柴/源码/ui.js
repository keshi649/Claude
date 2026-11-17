'use strict';
/* ui.js —— 时间和缓动、缓存、RPG 的界面零件（窗口、血条、菜单、气泡、图标、头像、状态栏、歌词窗）、整屏特效 */
/* 镜头表：S(开始时刻, 画面函数, 选项)，各 shots*.js 往里加，main.js 按时间排好 */
const SHOTS = [];
function S(t0, fn, o = {}) { SHOTS.push({ t0, fn, ...o }); }
const cl = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, t) => a + (b - a) * t, sg = (t, a, b) => cl((t - a) / (b - a));
const ease = x => { x = cl(x); return x * x * (3 - 2 * x); }, eo = x => 1 - (1 - cl(x)) ** 3, ei = x => cl(x) ** 3;
const eob = x => { x = cl(x); const c = 1.70158; return 1 + (c + 1) * (x - 1) ** 3 + c * (x - 1) ** 2; };
const hash = (i, s = 0) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };
const BAR0 = .17, BEAT = 60 / 148, BARL = BEAT * 4, BAR = n => BAR0 + n * BARL;      // 148 BPM，第 n 小节的时刻
const blink = (t, per = .5) => (t % per) < per / 2;
const _cv = {};
function cache(key, w, h, fn) { let c = _cv[key]; if (!c) { const g = mk(w, h); fn(g); c = _cv[key] = g.canvas; } return c; }
function cache2(key, w, h, fn) { let c = _cv[key]; if (!c) { const g = mk(w, h), G = mk(w, h); fn(g, G); c = _cv[key] = { p: g.canvas, g: G.canvas }; } return c; }
function put(g, cv, x = 0, y = 0) { g.drawImage(cv, Math.round(x), Math.round(y)); }
function put2(g, G, c, x = 0, y = 0) { g.drawImage(c.p, Math.round(x), Math.round(y)); if (G) G.drawImage(c.g, Math.round(x), Math.round(y)); }
/* 横版、室内的场景整体往上挪 14 像素（脚不被歌词窗挡住）：up 之后画场景，dn 之后画界面 */
function up(g, G, d = 14) { g.translate(0, -d); G.translate(0, -d); }
function dn(g, G, d = 14) { g.translate(0, d); G.translate(0, d); }
function alpha(g, a, fn) { g.save(); g.globalAlpha = cl(a); fn(); g.restore(); }

/* ---------- 窗口、条、气泡 ---------- */
function panel(g, x, y, w, h, o = {}) {
  x = Math.round(x); y = Math.round(y); w = Math.round(w); h = Math.round(h); if (w < 6 || h < 6) return;
  const bg = o.bg || '#101A44', bd = o.bd || '#FFFFFF';
  put(g, cache('pn' + w + '_' + h + bg + bd, w, h, c => {
    R(c, 1, 0, w - 2, h, bg); R(c, 0, 1, w, h - 2, bg); field(c, 1, 1, w - 2, h - 2, lt(bg, .12), (px, py) => (1 - py / h) * .55);
    R(c, 2, 0, w - 4, 1, bd); R(c, 2, h - 1, w - 4, 1, bd); R(c, 0, 2, 1, h - 4, bd); R(c, w - 1, 2, 1, h - 4, bd);
    R(c, 1, 1, 1, 1, bd); R(c, w - 2, 1, 1, 1, bd); R(c, 1, h - 2, 1, 1, bd); R(c, w - 2, h - 2, 1, 1, bd);
    R(c, 3, 2, w - 6, 1, lt(bg, .4)); R(c, 2, 3, 1, h - 6, lt(bg, .4)); R(c, 3, h - 3, w - 6, 1, dk(bg, .35)); R(c, w - 3, 3, 1, h - 6, dk(bg, .35));
  }), x, y);
}
/* 弹出来的窗口：p 从 0 到 1，从中间一条线展开 */
function popPanel(g, x, y, w, h, p, o) { p = eo(p); if (p <= 0) return false; const hh = Math.max(6, Math.round(h * p)); panel(g, x, y + (h - hh) / 2, w, hh, o); return p > .9; }
function bar(g, x, y, w, v, c, bgc = '#0A0E24', h = 4) { R(g, x - 1, y - 1, w + 2, h + 2, '#FFFFFF'); R(g, x, y, w, h, bgc); const ww = Math.round(w * cl(v)); if (ww > 0) { R(g, x, y, ww, h, c); R(g, x, y, ww, 1, lt(c, .45)); } }
function bubble(g, x, y, w, h, tail = 1) { const K = '#1A1F40'; R(g, x + 1, y, w - 2, h, '#FFFFFF'); R(g, x, y + 1, w, h - 2, '#FFFFFF'); R(g, x + 1, y - 1, w - 2, 1, K); R(g, x + 1, y + h, w - 2, 1, K); R(g, x - 1, y + 1, 1, h - 2, K); R(g, x + w, y + 1, 1, h - 2, K); if (tail) { const m = x + fl(w / 2); R(g, m - 1, y + h, 3, 1, '#FFFFFF'); R(g, m, y + h + 1, 1, 1, '#FFFFFF'); R(g, m - 2, y + h, 1, 1, K); R(g, m + 2, y + h, 1, 1, K); R(g, m - 1, y + h + 1, 1, 1, K); R(g, m + 1, y + h + 1, 1, 1, K); R(g, m, y + h + 2, 1, 1, K); } }
/* 头顶的表情气泡：'heart' '...' '!' '?' 'note' 'sweat' 'zzz' 'x' */
function emote(g, x, y, kind, t = 0) {
  y = Math.round(y - 13 + (Math.sin(t * 6) > 0 ? 0 : 1)); x = Math.round(x - 7); bubble(g, x, y, 14, 11);
  const K = '#1A1F40';
  if (kind === 'heart') heart(g, x + 4, y + 3);
  else if (kind === '...') { for (let i = 0; i < 3; i++) if ((t * 3 | 0) % 4 > i || t === 0) R(g, x + 3 + i * 3, y + 5, 2, 2, K); }
  else if (kind === '!') { R(g, x + 6, y + 2, 2, 5, '#E0423A'); R(g, x + 6, y + 8, 2, 2, '#E0423A'); }
  else if (kind === '?') ptext(g, '?', x + 4, y - 1, '#3A6AD8');
  else if (kind === 'note') { R(g, x + 7, y + 2, 1, 6, K); R(g, x + 7, y + 2, 3, 1, K); R(g, x + 5, y + 6, 3, 2, K); }
  else if (kind === 'sweat') { R(g, x + 6, y + 2, 2, 3, '#5AB8FF'); R(g, x + 5, y + 5, 4, 3, '#5AB8FF'); }
  else if (kind === 'zzz') ptext(g, 'z', x + 4, y - 2, '#3A6AD8');
  else if (kind === 'x') { line(g, x + 4, y + 3, x + 9, y + 8, '#E0423A'); line(g, x + 9, y + 3, x + 4, y + 8, '#E0423A'); }
  else if (kind === 'broken') { heart(g, x + 4, y + 3, '#8A8AA8'); R(g, x + 6, y + 3, 1, 5, '#FFFFFF'); }
}
/* 菜单：items 一列，cur 选中的那一项；灰掉的写成 {s, off:1} */
function menu(g, x, y, w, items, cur, o = {}) {
  const lh = o.lh || 13; panel(g, x, y, w, items.length * lh + 9, o);
  items.forEach((it, i) => { const s = it.s || it, off = it.off; ptext(g, s, x + 18, y + 4 + i * lh, off ? '#5A6AA0' : i === cur ? '#FFE066' : '#FFFFFF'); if (off) R(g, x + 18, y + 11 + i * lh, tbits(s).w, 1, '#5A6AA0'); });
  if (cur >= 0) cursor(g, x + 7, y + 7 + cur * lh, o.t || 0);
}
function cursor(g, x, y, t = 0) { x += (Math.sin(t * 9) > 0 ? 1 : 0); const c = '#FFE066'; R(g, x, y, 2, 7, c); R(g, x + 2, y + 1, 2, 5, c); R(g, x + 4, y + 2, 2, 3, c); R(g, x + 6, y + 3, 1, 1, c); }
/* 顶上滑下来的提示条 */
function toast(g, text, p, o = {}) { const w = tbits(text).w + 30 + (o.icon ? 12 : 0), x = Math.round((o.x ?? 240) - w / 2), y = Math.round((o.y ?? 8) - (1 - eo(p)) * 30); panel(g, x, y, w, 20, { bg: o.bg || '#3A2A10' }); if (o.icon) icon(g, o.icon, x + 7, y + 4); ptext(g, text, x + (o.icon ? 24 : 15), y + 3, o.col || '#FFE9A0'); }
/* 往上飘的数字、文字 */
function floatText(g, text, x, y, age, o = {}) { if (age < 0 || age > (o.life || 1)) return; const p = age / (o.life || 1), yy = Math.round(y - eo(p) * (o.rise ?? 16)); if (p > .8 && blink(age, .08)) return; ptext(g, text, x, yy, o.col || '#FFFFFF', { align: 'c', ol: o.ol || '#1A1F40', s: o.s || 1 }); }
/* 打字机：按 cps 一个个出来 */
function typed(g, s, x, y, c, age, cps = 18, o = {}) { const n = Math.max(0, Math.min(s.length, fl(age * cps))); if (n > 0) ptext(g, s.slice(0, n), x, y, c, o); return n >= s.length; }

/* ---------- 小图标（约 12×12） ---------- */
const ICON = {
  mic(g, x, y) { R(g, x + 4, y, 4, 5, '#9A9AB8'); R(g, x + 4, y, 4, 2, '#E0E0F0'); R(g, x + 5, y + 5, 2, 6, '#2A2438'); R(g, x + 3, y + 5, 6, 1, '#5A5A78'); },
  scarf(g, x, y) { R(g, x + 1, y + 2, 10, 4, '#D8323C'); R(g, x + 7, y + 6, 4, 6, '#D8323C'); R(g, x + 1, y + 2, 10, 1, '#F06A74'); R(g, x + 7, y + 11, 1, 1, '#8A1E2A'); R(g, x + 9, y + 11, 1, 1, '#8A1E2A'); },
  mug(g, x, y) { R(g, x + 2, y + 3, 7, 8, '#F4EAD8'); R(g, x + 9, y + 5, 2, 4, '#F4EAD8'); R(g, x + 3, y + 4, 5, 2, '#6A3A20'); R(g, x + 4, y, 1, 2, '#C9D3EE'); R(g, x + 6, y + 1, 1, 2, '#C9D3EE'); },
  photo(g, x, y) { R(g, x + 1, y, 10, 12, '#FFFFFF'); R(g, x + 2, y + 1, 8, 8, '#6A70B0'); R(g, x + 3, y + 5, 2, 4, '#E3A23C'); R(g, x + 3, y + 3, 2, 2, '#F9DABF'); R(g, x + 7, y + 5, 2, 4, '#B7A6F0'); R(g, x + 7, y + 3, 2, 2, '#F9DABF'); R(g, x + 7, y + 2, 2, 1, '#FFFFFF'); },
  half(g, x, y) { R(g, x + 1, y, 6, 12, '#FFFFFF'); R(g, x + 2, y + 1, 5, 8, '#6A70B0'); R(g, x + 3, y + 5, 2, 4, '#E3A23C'); R(g, x + 3, y + 3, 2, 2, '#F9DABF'); for (let j = 0; j < 12; j += 2) R(g, x + 7, y + j, 1, 1, '#FFFFFF'); },
  spark(g, x, y) { R(g, x + 5, y + 5, 1, 7, '#8A8AA8'); R(g, x + 4, y + 1, 3, 3, '#FFE066'); R(g, x + 5, y, 1, 5, '#FFFFFF'); R(g, x + 3, y + 2, 5, 1, '#FFFFFF'); },
  tear(g, x, y) { R(g, x + 5, y + 1, 2, 3, '#8FDCFF'); R(g, x + 4, y + 4, 4, 4, '#8FDCFF'); R(g, x + 5, y + 8, 2, 1, '#8FDCFF'); R(g, x + 5, y + 5, 1, 2, '#FFFFFF'); },
  star(g, x, y) { R(g, x + 5, y + 1, 2, 10, '#FFD54A'); R(g, x + 1, y + 5, 10, 2, '#FFD54A'); R(g, x + 3, y + 3, 6, 6, '#FFD54A'); R(g, x + 5, y + 4, 2, 2, '#FFF4B0'); },
  heart(g, x, y) { heart(g, x + 3, y + 3); },
  hbroken(g, x, y) { heart(g, x + 3, y + 3, '#8A8AA8'); R(g, x + 5, y + 3, 1, 5, '#101A44'); },
  note(g, x, y) { R(g, x + 6, y + 1, 1, 8, '#FFE066'); R(g, x + 6, y + 1, 4, 1, '#FFE066'); R(g, x + 9, y + 2, 1, 2, '#FFE066'); R(g, x + 3, y + 7, 4, 3, '#FFE066'); },
  snow(g, x, y) { R(g, x + 5, y + 1, 1, 10, '#FFFFFF'); R(g, x + 1, y + 5, 10, 1, '#FFFFFF'); for (let i = 0; i < 4; i++) { R(g, x + 2 + i * 2 + (i > 1 ? 1 : 0), y + 2 + i * 2 + (i > 1 ? 1 : 0), 1, 1, '#FFFFFF'); R(g, x + 8 - i * 2 - (i > 1 ? 1 : 0), y + 2 + i * 2 + (i > 1 ? 1 : 0), 1, 1, '#FFFFFF'); } },
  clock(g, x, y) { disc(g, x + 6, y + 6, 5.5, '#FFFFFF'); disc(g, x + 6, y + 6, 4.5, '#FFF2C8'); R(g, x + 6, y + 3, 1, 4, '#1A1F40'); R(g, x + 6, y + 6, 3, 1, '#1A1F40'); },
  mitt(g, x, y) { R(g, x + 3, y + 1, 6, 7, '#D8323C'); R(g, x + 1, y + 4, 2, 3, '#D8323C'); R(g, x + 3, y + 8, 6, 3, '#FFFFFF'); R(g, x + 4, y + 2, 3, 1, '#F06A74'); },
  mail(g, x, y) { R(g, x + 1, y + 2, 10, 8, '#FFF7E6'); line(g, x + 1, y + 2, x + 6, y + 6, '#C8553D'); line(g, x + 10, y + 2, x + 6, y + 6, '#C8553D'); R(g, x + 1, y + 9, 10, 1, '#D8C8A8'); },
  save(g, x, y) { for (let j = 0; j < 6; j++) { R(g, x + 6 - j, y + j, 2 * j, 1, j < 3 ? '#C8F0FF' : '#5AB8FF'); R(g, x + 1 + j, y + 6 + j, 10 - 2 * j, 1, j < 3 ? '#5AB8FF' : '#2A6AD8'); } R(g, x + 4, y + 3, 2, 3, '#FFFFFF'); },
  lock(g, x, y) { R(g, x + 3, y + 5, 7, 6, '#8A8AA8'); R(g, x + 4, y + 1, 5, 1, '#8A8AA8'); R(g, x + 4, y + 2, 1, 3, '#8A8AA8'); R(g, x + 8, y + 2, 1, 3, '#8A8AA8'); R(g, x + 6, y + 7, 1, 2, '#1A1F40'); },
  cam(g, x, y) { R(g, x + 1, y + 3, 10, 7, '#2A2438'); R(g, x + 3, y + 1, 4, 2, '#2A2438'); disc(g, x + 6, y + 6.5, 2.5, '#9A9AB8'); R(g, x + 6, y + 6, 1, 1, '#FFFFFF'); R(g, x + 9, y + 4, 1, 1, '#E0423A'); },
  cocoa(g, x, y) { ICON.mug(g, x, y); },
  key(g, x, y) { disc(g, x + 4, y + 4, 3, '#FFD54A'); R(g, x + 4, y + 4, 1, 1, '#101A44'); R(g, x + 5, y + 6, 1, 5, '#FFD54A'); R(g, x + 6, y + 8, 2, 1, '#FFD54A'); R(g, x + 6, y + 10, 2, 1, '#FFD54A'); },
};
function icon(g, name, x, y) { (ICON[name] || ICON.star)(g, Math.round(x), Math.round(y)); }
/* 道具格子 */
function slot(g, x, y, name, o = {}) { panel(g, x, y, 20, 20, { bg: o.hot ? '#3A2A10' : '#101A44' }); if (name) icon(g, name, x + 4, y + 4); if (o.n) ptext(g, o.n, x + 19, y + 10, '#FFFFFF', { align: 'r', ol: '#101A44' }); }
/* 头像框：把按身高 H 画的人的脸裁出来 */
function portrait(g, x, y, sz, o, H = 46, bg = '#2A3A80') {
  R(g, x - 1, y - 1, sz + 2, sz + 2, '#FFFFFF'); R(g, x, y, sz, sz, bg);
  const b = chibi(null, 0, 0, H, { ...o, buf: 1 }).canvas, u = H / 28, cx = fl(b.width / 2), headY = b.height - 2 - 22.4 * u;
  g.drawImage(b, Math.round(cx - sz / 2), Math.round(headY - sz / 2 + (o.hat ? -1.5 * u : .5 * u)), sz, sz, x, y, sz, sz);
}
/* 左上角的状态栏：o.lv o.hp（0~1）o.hpn o.mp o.mpn o.face（表情）o.name o.title */
function hud(g, o = {}) {
  panel(g, 12, 14, 128, 40); portrait(g, 17, 19, 30, { ...HERO, ...(o.face || {}) });
  ptext(g, o.name || '废柴', 52, 17, '#FFFFFF'); ptext(g, 'Lv.' + (o.lv ?? 1), 82, 17, '#FFE066');
  ptext(g, '心', 52, 29, '#FF8AA0'); bar(g, 66, 34, 44, o.hp ?? .1, '#FF5A6A'); ptext(g, String(o.hpn ?? 12), 114, 29, '#FFFFFF');
  R(g, 52, 44, 60, 1, '#2A3A80'); for (let i = 0; i < 3; i++) R(g, 52 + i * 21, 43, 19, 3, i < (o.st ?? 0) ? '#5AB8FF' : '#2A3A80');
}
/* 右上角：队友栏（一直是空的） */
function party(g, t, o = {}) { panel(g, 360, 28, 92, 20); ptext(g, '队友', 366, 31, '#9FE8FF'); if (o.name) ptext(g, o.name, 394, 31, o.col || '#FFFFFF'); else if (blink(t, 1.2) || o.still) ptext(g, '— 空 —', 394, 31, '#6A7CC8'); }

/* ---------- 歌词窗：对话框里一个字一个字打出来，唱到哪打到哪 ---------- */
function lyrLine(t) { let L = null; for (const l of LYR) if (t >= l.t0 - .2) L = l; else break; if (!L) return null; const nx = LYR[L.i + 1], end = Math.min(L.t1 + 2.2, nx ? nx.t0 - .22 : L.t1 + 4); return t < end ? L : null; }
function lyrWin(g, t, tag = '旁白') {
  const L = lyrLine(t); if (!L) return;
  const nx = LYR[L.i + 1], end = Math.min(L.t1 + 2.2, nx ? nx.t0 - .22 : L.t1 + 4);
  const tw = tbits(L.text).w, w = Math.max(150, tw + 44), x = Math.round(240 - w / 2), y = 226, h = 26;
  const p = Math.min(sg(t, L.t0 - .2, L.t0 - .06), 1 - sg(t, end - .1, end)); if (!popPanel(g, x, y, w, h, p)) return;
  panel(g, x + 8, y - 9, tbits(tag).w + 14, 15, { bg: '#3A2A10' }); ptext(g, tag, x + 15, y - 8, '#FFE9A0');
  let px = Math.round(240 - tw / 2), done = true;
  for (const [c, ct] of L.chars) {
    const cw = tbits(c).w; if (c !== ' ') { const age = t - (ct - .05); if (age >= 0) { const hot = age < .14; ptext(g, c, px, y + 7 - (hot ? 1 : 0), hot ? '#FFE066' : '#FFFFFF', { sh: '#060A24' }); } else done = false; }
    px += cw;
  }
  if (done && blink(t, .6)) { R(g, x + w - 14, y + 16, 5, 1, '#FFE066'); R(g, x + w - 13, y + 17, 3, 1, '#FFE066'); R(g, x + w - 12, y + 18, 1, 1, '#FFE066'); }
}
/* 这一行歌词里第 k 个字（不算空格）开唱的时刻 */
function LT(i, k = 0) { const cs = LYR[i].chars.filter(c => c[0] !== ' '); return cs[Math.min(k, cs.length - 1)][1]; }

/* ---------- 整屏特效（画完镜头以后盖在小画布上） ---------- */
const _tmp = {}; function tmpc(k = 'a') { return _tmp[k] || (_tmp[k] = mk(PW, PH)); }
function fxFlash(g, a, c = '#FFFFFF') { a = Math.round(cl(a) * 8) / 8; if (a <= 0) return; g.save(); g.globalAlpha = a; g.fillStyle = c; g.fillRect(0, 0, PW, PH); g.restore(); }
function fxShift(g, dx, dy) { dx = Math.round(dx); dy = Math.round(dy); if (!dx && !dy) return; const t = tmpc('sh'); t.clearRect(0, 0, PW, PH); t.drawImage(g.canvas, 0, 0); g.fillStyle = '#060A1E'; g.fillRect(0, 0, PW, PH); g.drawImage(t.canvas, dx, dy); }
function fxShake(g, t, amp) { if (amp <= 0) return; fxShift(g, (hash(fl(t * 30), 1) - .5) * 2 * amp, (hash(fl(t * 30), 2) - .5) * 2 * amp); }
function fxMosaic(g, k) { k = Math.round(k); if (k <= 1) return; const w = Math.ceil(PW / k), h = Math.ceil(PH / k), t = tmpc('mo'); t.clearRect(0, 0, PW, PH); t.imageSmoothingEnabled = false; t.drawImage(g.canvas, 0, 0, PW, PH, 0, 0, w, h); g.imageSmoothingEnabled = false; g.drawImage(t.canvas, 0, 0, w, h, 0, 0, w * k, h * k); }
function fxGlitch(g, t, amt) { if (amt <= 0) return; const tt = tmpc('gl'); tt.clearRect(0, 0, PW, PH); tt.drawImage(g.canvas, 0, 0); const f = fl(t * 30); for (let i = 0; i < 9; i++) { const y = fl(hash(f, i) * PH), h = 2 + fl(hash(f, i + 20) * 14), dx = Math.round((hash(f, i + 40) - .5) * 60 * amt); g.drawImage(tt.canvas, 0, y, PW, h, dx, y, PW, h); if (i % 3 === 0) { g.save(); g.globalAlpha = .5; g.fillStyle = i % 2 ? '#FF3A6A' : '#3AE0FF'; g.fillRect(0, y, PW, 1); g.restore(); } } }
function fxScan(g, a = .16) { g.save(); g.globalAlpha = a; g.fillStyle = '#000018'; for (let y = 0; y < PH; y += 2) g.fillRect(0, y, PW, 1); g.restore(); }
function fxBars(g, k, c = '#05060F') { k = Math.round(k); if (k > 0) { R(g, 0, 0, PW, k, c); R(g, 0, PH - k, PW, k, c); } }
function fxIris(g, cx, cy, r, c = '#05060F') { g.fillStyle = c; for (let y = 0; y < PH; y++) { const dy = y + .5 - cy, hw = r * r - dy * dy; if (hw <= 0) { g.fillRect(0, y, PW, 1); continue; } const w = Math.sqrt(hw), a = Math.round(cx - w), b = Math.round(cx + w); if (a > 0) g.fillRect(0, y, a, 1); if (b < PW) g.fillRect(b, y, PW - b, 1); } }
/* 一格格转黑：p 从 0 到 1；kind 'swirl' 螺旋、'dz' 抖动溶解、'blinds' 百叶、'diag' 斜着扫 */
function fxCover(g, p, kind = 'swirl', c = '#05060F') {
  if (p <= 0) return; g.fillStyle = c; if (p >= 1) { g.fillRect(0, 0, PW, PH); return; }
  if (kind === 'swirl') { const B = 15; for (let by = 0; by < PH / B; by++) for (let bx = 0; bx < PW / B; bx++) { const dx = bx * B + B / 2 - 240, dy = (by * B + B / 2 - 135) * 1.6, r = Math.hypot(dx, dy) / 330, a = (Math.atan2(dy, dx) / 6.283 + .5), o = ((a + r * 1.5) % 1) * .55 + (1 - r) * .45; if (o < p * 1.05) g.fillRect(bx * B, by * B, B, B); } }
  else if (kind === 'dz') { for (let y = 0; y < PH; y += 2) for (let x = 0; x < PW; x += 2) if (bay(x >> 1, y >> 1) < p) g.fillRect(x, y, 2, 2); }
  else if (kind === 'blinds') { const B = 18; for (let y = 0; y < PH; y += B) g.fillRect(0, y, PW, Math.round(B * p)); }
  else if (kind === 'diag') { const B = 12; for (let by = 0; by < PH / B; by++) for (let bx = 0; bx < PW / B; bx++) { const o = (bx + by) / (PW / B + PH / B); const q = cl((p * 1.4 - o) * 3); if (q > 0) { const s = Math.round(B * q); g.fillRect(bx * B + (B - s) / 2, by * B + (B - s) / 2, s, s); } } }
}
function fxTint(g, c, a, mode = 'source-over') { g.save(); g.globalCompositeOperation = mode; g.globalAlpha = a; g.fillStyle = c; g.fillRect(0, 0, PW, PH); g.restore(); }
/* 旧显像管开机：p 0→1，先一条亮线，再上下展开 */
function fxCRT(g, p) { if (p >= 1) return; const hh = p < .35 ? 1 : Math.round(ease((p - .35) / .65) * 135), ww = p < .35 ? Math.round(eo(p / .35) * 240) : 240; R(g, 0, 0, PW, 135 - hh, '#020308'); R(g, 0, 135 + hh, PW, 135 - hh, '#020308'); if (ww < 240) { R(g, 0, 135 - hh, 240 - ww, hh * 2, '#020308'); R(g, 240 + ww, 135 - hh, 240 - ww, hh * 2, '#020308'); } if (p < .5) { g.save(); g.globalAlpha = 1 - p * 2; R(g, 240 - ww, 134, ww * 2, 2, '#FFFFFF'); g.restore(); } }
/* 回忆的滤镜：发黄、四角暗 */
function fxMemory(g) { fxTint(g, '#C89860', .5, 'color'); fxTint(g, '#FFE8C0', .12, 'source-over'); }
function fxBlue(g, a = 1) { fxTint(g, '#7A8AB8', .55 * a, 'saturation'); fxTint(g, '#3A5AA8', .22 * a, 'soft-light'); }

/* 整屏特效一律按屏幕坐标画，不受镜头里 up()、translate 的影响 */
['fxFlash', 'fxShift', 'fxMosaic', 'fxGlitch', 'fxScan', 'fxBars', 'fxIris', 'fxCover', 'fxTint', 'fxCRT'].forEach(n => { const f = window[n]; window[n] = function (g, ...a) { g.save(); g.setTransform(1, 0, 0, 1, 0, 0); f(g, ...a); g.restore(); }; });
