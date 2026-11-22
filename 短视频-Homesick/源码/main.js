'use strict';
/* main.js：镜头表、转场、歌词、水印、片尾字，逐帧入口 frame(t)。 */
const cv = document.getElementById('cv'), ctx = cv.getContext('2d');
const IMG = ctx.createImageData(W, H);
const DUR = 269.03;
window.boot = async () => {
  for (const f of ['12px FP', '11px GM', '11px GMB']) await document.fonts.load(f);
  return true;
};
function present() { IMG.data.set(B); ctx.putImageData(IMG, 0, 0); }
window.snap = (t, scale = 1, cover = false) => {
  target(MAIN); frame(t, { cover }); present();
  if (scale === 1) return cv.toDataURL('image/png');
  const c2 = document.createElement('canvas'); c2.width = W * scale; c2.height = H * scale;
  const g2 = c2.getContext('2d'); g2.imageSmoothingEnabled = false; g2.drawImage(cv, 0, 0, W * scale, H * scale);
  return c2.toDataURL('image/png');
};
window.sheet = (ts, cols) => {
  const rows = Math.ceil(ts.length / cols), c2 = document.createElement('canvas');
  c2.width = cols * (W + 4); c2.height = rows * (H + 16);
  const g2 = c2.getContext('2d'); g2.fillStyle = '#222'; g2.fillRect(0, 0, c2.width, c2.height);
  g2.imageSmoothingEnabled = false; g2.font = '12px monospace';
  ts.forEach((t, k) => {
    target(MAIN); frame(t, {}); present();
    const x = (k % cols) * (W + 4), y = Math.floor(k / cols) * (H + 16);
    g2.drawImage(cv, x, y + 16); g2.fillStyle = '#ff0'; g2.fillText(t.toFixed(2), x + 4, y + 12);
  });
  return c2.toDataURL('image/png');
};

/* ---------------- 测试台 ---------------- */
const TESTS = {
  rain(t) { shotRainCross(t, t); },
  table(t) { shotTable(t, t); },
  close(t) { shotRainClose(t, t); },
  sheet(t) { shotSheet(t); },
  bust(t) {
    vgrad(0, 0, W, H, [[0, hx('#2A2438')], [.6, hx('#5A4058')], [1, hx('#3A2A3A')]], 12);
    bustShe({ x: 170, y: 140, s: 150, d: 1, t, exp: {}, fit: 'dress' });
    bustHe({ x: 470, y: 140, s: 150, d: -1, t, exp: {}, fit: 'coat', light: 1 });
  },
  chars(t) {
    vgrad(0, 0, W, H, [[0, hx('#1B2236')], [.75, hx('#3A3F58')], [1, hx('#2A2C3A')]], 12);
    rect(0, 300, W, 60, hx('#24242E'));
    const ph = t * .9;
    const L = [
      { who: 'he', x: 80, pose: walkPose(ph), dir: 1 },
      { who: 'she', x: 200, pose: walkPose(ph + .3), dir: 1, fit: 'dress' },

      { who: 'he', x: 540, pose: runPose(ph * 1.6), dir: 1 },
    ];
    for (const c of L) {
      lbegin();
      figSide({ ...c, y: 300, h: c.who === 'he' ? 150 : 140, t });
      lresolve({ amb: [1, 1, 1], rim: { c: hx('#9FC2FF'), x: 1, y: 0, k: .35 } });
    }
    figFront({ who: 'he', x: 330, y: 300, h: 156, d: 1, t, rim: { c: hx('#9FC2FF'), x: 1, y: 0, k: .35 } });
    figFront({ who: 'she', x: 420, y: 300, h: 146, d: -1, t, fit: 'dress', rim: { c: hx('#9FC2FF'), x: 1, y: 0, k: .35 } });
    figFront({ who: 'she', x: 480, y: 300, h: 146, d: -1, t, fit: 'trench', rim: { c: hx('#9FC2FF'), x: 1, y: 0, k: .35 } });
  },
};

/* ---------------- 逐帧入口 ---------------- */
function frame(t, o = {}) {
  glowClear();
  if (window.TEST) { TESTS[window.TEST](t, o); if (!['rain', 'table', 'close', 'sheet'].includes(window.TEST)) bloom({ th: .8, k: .5 }); if (window.LT !== undefined) { lyrics(window.LT); watermark(); } return; }
  renderFilm(t, o);
}
function renderFilm(t, o) { clear(0); }
/* 放大看局部：crop(t, x, y, w, h, 倍数) */
window.crop = (t, x, y, w, h, s) => {
  target(MAIN); frame(t, {}); present();
  const c2 = document.createElement('canvas'); c2.width = w * s; c2.height = h * s;
  const g2 = c2.getContext('2d'); g2.imageSmoothingEnabled = false; g2.drawImage(cv, x, y, w, h, 0, 0, w * s, h * s);
  return c2.toDataURL('image/png');
};

/* ---------------- 歌词 ---------------- */
// 每句的显示时间：第一个字前 0.3 秒淡入，下一句开头前 0.06 秒淡出
const LYW = LYR.map((L, i) => {
  const s = L.u[0][1], last = L.u[L.u.length - 1][1];
  const nx = i + 1 < LYR.length ? LYR[i + 1].u[0][1] : 1e9;
  return { s: s - .3, e: Math.min(nx - .06, Math.max((L.e ?? last) + .7, last + 1.0)) };
});
function lyrics(t, o = {}) {
  const yK = o.y ?? 323, yZ = yK + 17;
  const act = [];
  for (let i = 0; i < LYR.length; i++) { const w = LYW[i]; if (t >= w.s - .05 && t <= w.e + .25) act.push(i); }
  if (!act.length) return;
  // 字幕底下一条很淡的暗带
  let band = 0; for (const i of act) band = Math.max(band, sat(Math.min((t - LYW[i].s) / .3, (LYW[i].e + .25 - t) / .25)));
  for (let j = 0; j < 56; j++) { const k = 1 - Math.abs(j / 56 * 2 - 1); rect(0, yK - 26 + j, W, 1, hx('#05060C'), qa(.42 * Math.min(1, k * 1.8) * band)); }
  for (const i of act) {
    const L = LYR[i], w = LYW[i];
    const fin = sat((t - w.s) / .25), fout = sat((w.e + .25 - t) / .25), a = Math.min(fin, fout);
    if (a <= 0) continue;
    const dy = (1 - fin) * 3 - (1 - fout) * 3;
    // 原文：按显示单位（韩文一个音节、英文一个词）逐个亮起
    const units = L.u, ko = L.ko;
    // 把原文切成和单位对应的片段（保留空格）
    const parts = []; let pos = 0;
    for (const [u] of units) { const k = ko.indexOf(u, pos); if (k < 0) continue; if (k > pos) parts.push([ko.slice(pos, k), -1]); parts.push([u, parts.length]); pos = k + u.length; }
    if (pos < ko.length) parts.push([ko.slice(pos), -1]);
    let ui = 0; const pieces = parts.map(([s, isU]) => { if (isU < 0) return [s, -1]; return [s, ui++]; });
    const total = pieces.reduce((w_, [s]) => w_ + textW(s, 'fp'), 0);
    let x = Math.round(320 - total / 2);
    for (const [s, k] of pieces) {
      if (k < 0) { x += textW(s, 'fp'); continue; }
      const st = units[k][1], on = t >= st - .04, pop = on ? Math.max(0, 1 - (t - st) / .14) : 0;
      x = text(s, x, yK + Math.round(dy) - (pop > .3 ? 1 : 0), { col: on ? hx('#FFFFFF') : hx('#A3A8BE'), a: a * (on ? 1 : .8), out: hx('#0A0B14'), oa: .85 });
      if (on && pop > 0) glow(x - textW(s, 'fp') / 2, yK - 5, 10, hx('#FFE6C0'), .35 * pop);
    }
    textC(L.zh, 320, yZ + Math.round(dy), { col: hx('#EFE3D2'), a: a * .95, out: hx('#0A0B14'), oa: .8 });
  }
}
/* 右上角水印 */
function watermark(a = 1) { text('甜菜', 600, 22, { col: hx('#FFFFFF'), a: .72 * a, out: hx('#0A0B14'), oa: .45 * a }); }
