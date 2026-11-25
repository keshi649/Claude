'use strict';
/* main.js —— frame(t)：t 是歌曲时间，也是成片时间（成片和歌一样长，不剪不加）。
   画镜头（转场时两个镜头各画一块，再按转场合成）→ 后期（泛光、调色、暗角）→ 歌词、水印、片尾字 → 交给画布。 */
const DUR = SONG_DUR;
const cvEl = document.getElementById('cv'), ctx2 = cvEl.getContext('2d');
const IMGD = new ImageData(SCR.d8, W, H);
const BUF_A = surf(W, H), BUF_B = surf(W, H);
SHOTS.sort((a, b) => a.t0 - b.t0);

let PEEK = false;
/* 借别的镜头某一时刻的画面（开头的闪回、照片里的画面都用它） */
function peek(id, at) {
  const s = SHOTS.find(x => x.id === id); if (!s) throw new Error('没有这个镜头：' + id);
  const o = PEEK; PEEK = true; try { s.fn(at, at - s.t0, s); } finally { PEEK = o; }
}
function shotAt(t) { let i = 0; while (i + 1 < SHOTS.length && SHOTS[i + 1].t0 <= t) i++; return i; }
function drawShot(s, t, buf) { withT(buf, () => { clear(C(0x080612)); s.fn(t, t - s.t0, s); }); }

const POST_DEF = { bloom: [.62, .55], vig: .38 };
function post(s) {
  const p = { ...POST_DEF, ...(s.post || {}) };
  if (p.bloom) bloom(p.bloom[0], p.bloom[1], p.bloom[2] || 3, p.bloom[3] ? C(p.bloom[3]) : null);
  if (p.grade) grade(p.grade);
  if (p.vig) vignette(p.vig);
}

function frame(t) {
  t = clamp(t, 0, DUR - 1e-6);
  const i = shotAt(t);
  let A = SHOTS[i], B = null, p = 0;
  const nx = SHOTS[i + 1];
  if (nx && nx.tr && nx.tr.pre && t >= nx.t0 - nx.tr.pre) { B = nx; p = (t - (nx.t0 - nx.tr.pre)) / nx.tr.dur; }
  else if (A.tr && i > 0 && t < A.t0 - (A.tr.pre || 0) + A.tr.dur) { B = A; A = SHOTS[i - 1]; p = (t - (B.t0 - (B.tr.pre || 0))) / B.tr.dur; }
  if (B) { drawShot(A, t, BUF_A); drawShot(B, t, BUF_B); doTrans(B.tr.type, BUF_A, BUF_B, p, t, B.tr); post(p < .5 ? A : B); }
  else { drawShot(A, t, SCR); post(A); }
  withT(SCR, () => { lyricsLayer(t); watermark(t); credits(t); });
  ctx2.putImageData(IMGD, 0, 0);
}

/* ---------------- 歌词：底部居中，唱到哪个字亮哪个字 ---------------- */
const LY_Y = 236;                                  // 格子顶（放大 4 倍后 944~992，在安全区里）
const LINES = LYRICS.map(l => ({ text: l.text, chars: l.chars, t0: l.chars[0][1], t1: l.chars[l.chars.length - 1][2] }));
LINES.forEach((L, i) => {
  const nx = LINES[i + 1];
  L.show = i === 0 ? L.t0 - .45 : Math.max(L.t0 - .45, LINES[i - 1].hand ?? -1);
  L.hand = nx ? Math.max(nx.t0 - .35, Math.min(L.t1 + .1, nx.t0 - .12)) : L.t1 + 1.2;
  L.hide = Math.min(L.hand, L.t1 + 1.4);           // 后面空很久就先淡掉
});
LINES.forEach((L, i) => { if (i > 0) L.show = Math.max(L.t0 - .45, LINES[i - 1].hide); });
const LY_DIM = C(0xaab4cc), LY_LIT = C(0xfff4dc), LY_OUT = C(0x17122a);
function lyricsLayer(t) {
  for (const L of LINES) {
    if (t < L.show || t >= L.hide) continue;
    const fin = seg(t, L.show, L.show + .14), fout = 1 - seg(t, L.hide - .12, L.hide);
    const a = Math.min(fin, fout); if (a <= 0) continue;
    const dy = Math.round((1 - fin) * 3 - (1 - fout) * 3);
    const w = textWidth(L.text, 12, 1);
    // 底下垫一条很淡的暗带（亮的镜头里没唱到的字也看得清）
    const bx = Math.round(W / 2 - w / 2 - 10), by = LY_Y - 4 + dy;
    for (let y = 0; y < 20; y++) for (let x = 0; x < w + 20; x++) {
      const ex = Math.min(x, w + 19 - x) / 10, ey = Math.min(y, 19 - y) / 5, v = Math.min(1, ex, ey) * .34 * a;
      dot(bx + x, by + y, LY_OUT, v);
    }
    const col = (k, ch) => t >= L.chars[k][1] ? LY_LIT : LY_DIM;
    const r = text(L.text, W / 2, LY_Y + dy, { col, out: LY_OUT, alpha: a, sp: 1 });
    // 刚唱到的字：往上蹦一格，头上冒一颗小星
    r.chars.forEach(g => {
      const st = L.chars[g.i][1], u = t - st;
      if (u >= 0 && u < .35) {
        const gl = glyph(g.ch, 12), s = 1 - u / .35;
        for (const [px, py] of gl.pts) dot(g.x + px, LY_Y + dy + py - (u < .1 ? 1 : 0), C(0xffe7a8), .45 * s * a, 's');
        const sx = g.x + 6 + Math.round(Math.sin(st * 9) * 3), sy = LY_Y + dy - 3 - Math.round(u * 8);
        dot(sx, sy, C(0xfffbe8), s * a, 's'); if (u < .2) { dot(sx - 1, sy, C(0xffe7a8), s * a * .6, 's'); dot(sx + 1, sy, C(0xffe7a8), s * a * .6, 's'); dot(sx, sy - 1, C(0xffe7a8), s * a * .6, 's'); }
      }
    });
  }
}

/* ---------------- 水印、片尾字 ---------------- */
function watermark(t) { text('甜菜', W - 8, 6, { size: 8, align: 'r', col: C(0xffffff), alpha: .6, sh: C(0x120e20) }); }
const CREDIT_AT = DUR - 9.0;
function credits(t) {
  if (t < CREDIT_AT) return;
  const a = seg(t, CREDIT_AT, CREDIT_AT + 1.2);
  text('歌曲《起风了》  演唱：买辣椒也用券', W / 2, 206, { size: 8, col: C(0xe8e4f4), alpha: a * .9, sh: C(0x120e20) });
  text('画面、动画：Claude 用代码生成', W / 2, 218, { size: 8, col: C(0xd0cae4), alpha: a * .85, sh: C(0x120e20) });
  text('甜菜 出品', W / 2, 234, { size: 12, col: C(0xffe2a0), alpha: seg(t, CREDIT_AT + .6, CREDIT_AT + 1.8), out: C(0x120e20) });
}
