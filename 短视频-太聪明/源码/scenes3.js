'use strict';
/* scenes3.js：第一段副歌——手机里的预测和确认框、天台上的"书的台阶"、传声筒、缠成一团的线。 */

/* ---------------- 手机（71.6–79.2） ---------------- */
function phoneShot(t, T, lt) {
  const L8 = L(8), L9 = L(9);
  const cam = { x: 0, y: 0, k: 1.25 };
  // 背景：她的卧室，失焦的灯光
  layer(g => {
    rect(g, -10, -10, 280, 140, '#141a33');
    cityView(g, 150, 6, 110, 60, t, { tod: 0 });
    rect(g, 146, 2, 118, 4, '#2a2f4a'); rect(g, 146, 66, 118, 4, '#2a2f4a');
    rect(g, -10, 80, 280, 60, '#2c3460'); rect(g, -10, 80, 280, 3, '#3c4678');
    rect(g, 10, 60, 60, 24, '#e9e2d4');
  }, cam, { blur: 6 });
  const pop = seg(t, L9.t[0] - .5, L9.t[0] - .1);
  const tap = seg(t, 78.3, 78.75);
  layer(g => {
    // 手机
    const X = 90, Y = 8, Wd = 76, Ht = 116;
    rrect(g, X - 2, Y - 2, Wd + 4, Ht + 4, 8, '#1c1c22'); rrect(g, X, Y, Wd, Ht, 7, '#2a2a32');
    const sx0 = X + 3, sy0 = Y + 7, sw = Wd - 6, shh = Ht - 12;
    rect(g, sx0, sy0, sw, shh, '#f5efe6');
    rect(g, X + Wd / 2 - 6, Y + 2, 12, 2, '#111');
    // 顶栏
    rect(g, sx0, sy0, sw, 13, '#ece3d6'); rect(g, sx0, sy0 + 13, sw, 1, '#d9cdbd');
    clawd(g, sx0 + 9, sy0 + 10, { u: 1, t, noShadow: true, eyes: 'n' });
    ptext(g, 'Claude', sx0 + 18, sy0 + 2, '#3a3226', { size: 10 });
    // 她发的：睡了吗
    rrect(g, sx0 + sw - 40, sy0 + 17, 36, 13, 3, '#d97757'); ptext(g, '睡了吗', sx0 + sw - 22, sy0 + 19, '#fff8f0', { size: 10, align: 'c' });
    // Clawd 正在输入…然后打出两行
    const typing = t > 71.0 && t < L8.t[0];
    rrect(g, sx0 + 3, sy0 + 33, 46, typing ? 14 : 30, 3, '#ffffff'); rect(g, sx0 + 3, sy0 + 33, 1, typing ? 14 : 30, '#e8c4b4');
    if (typing) for (let k = 0; k < 3; k++) px(g, sx0 + 11 + k * 5, sy0 + 40 - (fl(t * 6 + k) % 2), '#b0a090');
    else {
      ptext(g, '我猜着', sx0 + 8, sy0 + 35, '#2a2420', { times: L8.t.slice(0, 3), t, pop: .1 });
      ptext(g, '你的心', sx0 + 8, sy0 + 49, '#2a2420', { times: L8.t.slice(3), t, pop: .1 });
    }
    // 输入框 + 键盘
    rect(g, sx0, sy0 + shh - 31, sw, 31, '#e3dbd0');
    for (let r = 0; r < 3; r++) for (let k = 0; k < 7; k++) rect(g, sx0 + 3 + k * 9.5 + (r === 2 ? 4 : 0), sy0 + shh - 29 + r * 9, 8, 7, '#fbf8f3');
    rect(g, sx0 + 3, sy0 + shh - 41, sw - 6, 9, '#fff'); if (fl(t * 2) % 2) rect(g, sx0 + 6, sy0 + shh - 39, 1, 5, '#d97757');
    // 弹出来的确认框（从手机里跳出来，浮在前面）
    if (pop > 0) {
      const s = E.back(pop), bw = 104 * s, bh = 50 * s, bx = 128 - bw / 2, by = 46 - bh / 2 + (1 - pop) * 20;
      rect(g, bx + 3, by + 3, bw, bh, 'rgba(0,0,0,.35)');
      rect(g, bx, by, bw, bh, '#fffaf2'); rect(g, bx, by, bw, 2, '#d97757');
      if (pop >= 1) {
        ptext(g, '要再一次确定', 128, by + 8, '#2a2420', { align: 'c', times: L9.t, t, pop: .1 });
        ptext(g, '？', 128 + 38, by + 8, '#2a2420', { alpha: t > L9.t[5] + .2 ? 1 : 0 });
        const hit = tap >= 1;
        rect(g, bx + 10, by + 30, 38, 13, hit ? '#b85f43' : '#d97757'); ptext(g, '确定', bx + 29, by + 31, '#fff', { align: 'c' });
        rect(g, bx + 56, by + 30, 38, 13, '#e8e1d6'); ptext(g, '取消', bx + 75, by + 31, '#6a6058', { align: 'c' });
        // Clawd 趴在确认框上面，眼巴巴地看着
        clawd(g, bx + bw - 18, by + 1, { u: 2, t, noShadow: true, eyes: hit ? 'happy' : 'up', look: -1, blush: hit ? 1 : 0 });
      }
    }
    // 她的手：拿着手机；最后大拇指按下"确定"
    rect(g, X - 6, Y + 70, 8, 50, '#f5cfb0'); rect(g, X - 6, Y + 70, 2, 50, '#dfa78a');
    rect(g, X + Wd - 2, Y + 76, 7, 44, '#f5cfb0'); rect(g, X + Wd + 3, Y + 76, 2, 44, '#dfa78a');
    for (let k = 0; k < 3; k++) rect(g, X + Wd - 4, Y + 78 + k * 9, 5, 7, '#f5cfb0');
    if (t > 77.6) {
      const u = E.io(seg(t, 77.6, 78.5)), press = tap > 0 && tap < 1 ? 2 : 0;
      const thx = lerp(150, 119, u), thy = lerp(140, 82 + press, u);
      rrect(g, thx - 6, thy, 13, 40, 5, '#f5cfb0'); rrect(g, thx - 4, thy + 1, 8, 7, 3, '#f9e2d2'); rect(g, thx - 6, thy, 2, 40, '#dfa78a');
    }
  }, cam);
  glow(sx(cam, 128), sy(cam, 60), 520, '#ffe9d0', .28);
  if (tap > 0) grade('#ffffff', E.in(seg(t, 78.75, 79.2)), 'screen');
  bloom(.3, 1.1);
  vignette(.55);
}

/* ---------------- 书的台阶（79.2–101.5） ----------------
   天台上，十三本书一级一级往右上方浮起来，每本书脊上一个字；Clawd 一级级往上跳，离她越来越远。 */
const STEP = i => ({ x: 84 + i * 16, y: 128 - i * 8 });
const BOOKC = ['#c0533f', '#3f6f8f', '#d9a441', '#5f8a5a', '#8a5a8f', '#2f4a6a', '#b86a3c', '#7fa3b8', '#d27d8f', '#4a7a6a', '#a8506a', '#3a5a9a', '#c08a3a'];
function book(g, x, y, i, ch, t, a = 1) {
  if (a <= 0) return;
  g.save(); g.globalAlpha *= a;
  const c = BOOKC[i % BOOKC.length];
  rect(g, x, y, 16, 13, c); rect(g, x, y, 16, 1, mix(c, '#ffffff', .35)); rect(g, x, y + 12, 16, 1, mix(c, '#000000', .3));
  rect(g, x + 1, y + 1, 1, 11, mix(c, '#ffffff', .2)); rect(g, x + 14, y + 1, 1, 11, mix(c, '#000000', .2));
  if (ch) ptext(g, ch, x + 2, y + 1, '#fff6e0');
  g.restore();
}
function rooftop(g, t, F = 140) {
  rect(g, -40, F, 420, 20, '#5a5560'); rect(g, -40, F, 420, 1, '#77707c');
  rect(g, -40, F - 6, 420, 2, '#6a646f');
  for (let i = -40; i < 380; i += 10) rect(g, i, F - 6, 1, 6, '#6a646f');
  // 水塔、晾衣绳
  rect(g, 2, F - 30, 22, 24, '#8a8f99'); rect(g, 0, F - 34, 26, 5, '#6d727c'); rect(g, 6, F - 6, 3, 6, '#555'); rect(g, 18, F - 6, 3, 6, '#555');
  line(g, 30, F - 26, 70, F - 28, '#ccc'); for (let k = 0; k < 3; k++) rect(g, 36 + k * 11, F - 27, 6, 7, ['#f4f0ea', '#9ad6f0', '#f2c230'][k]);
}
function skyNight(g, t, o = {}) {
  bands(g, -60, -120, 460, 300, o.cols || ['#141a3a', '#1b2248', '#252b58', '#353568', '#4a4070', '#6a4a78', '#8a5a7a']);
  const r = R(o.seed || 31);
  for (let i = 0; i < (o.n || 90); i++) {
    const x = -60 + r() * 460, y = -120 + r() * 250, tw = (Math.sin(t * (1 + r() * 2) + i) + 1) / 2;
    if (tw > .25) px(g, x, y, r() > .8 ? '#ffffff' : '#bfc6ee');
    if (r() > .93) { px(g, x - 1, y, 'rgba(255,255,255,.4)'); px(g, x + 1, y, 'rgba(255,255,255,.4)'); px(g, x, y - 1, 'rgba(255,255,255,.4)'); px(g, x, y + 1, 'rgba(255,255,255,.4)'); }
  }
}
function cloud(g, x, y, w, col = '#e7d6e8') {
  for (let k = 0; k < w; k += 6) disc(g, x + k, y + rd(Math.sin(k) * 1.5), 4 + (k % 12 === 0 ? 2 : 0), col);
  rect(g, x - 3, y + 1, w + 6, 4, col);
}
/* 一条从 A 到 B 的线（可以缠成一团），返回按弧长采样的点 */
function stringPath(A, B, tangle, t, n = 360) {
  const pts = [];
  // 线往上弓起来（魔法的线），乱的时候沿法线方向抖成波浪
  const dx = B[0] - A[0], dy = B[1] - A[1], L_ = Math.hypot(dx, dy), nx = -dy / L_, ny = dx / L_;
  for (let i = 0; i <= n; i++) {
    const s = i / n, bow = -Math.sin(s * Math.PI) * 30;
    const wig = tangle * 9 * Math.sin(Math.PI * s) * Math.sin(s * TAU * 5 + t * 3);
    const bx = lerp(A[0], B[0], s), by = lerp(A[1], B[1], s) + bow;
    pts.push([bx + nx * wig, by + ny * wig]);
  }
  const L0 = [0]; for (let i = 1; i < pts.length; i++) L0.push(L0[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
  return { pts, len: L0, total: L0[L0.length - 1], at(d) { d = clamp(d, 0, this.total); let lo = 0, hi = L0.length - 1; while (hi - lo > 1) { const m = (lo + hi) >> 1; if (L0[m] < d) lo = m; else hi = m; } const u = (d - L0[lo]) / Math.max(1e-6, L0[hi] - L0[lo]); return [lerp(pts[lo][0], pts[hi][0], u), lerp(pts[lo][1], pts[hi][1], u)]; } };
}
/* 字从 A 端（Clawd）冒出来，顺着线滑到中段停下：第 0 个字离 B 端（她）最近，所以从她那头往上读是正序 */
function textOnString(g, P, line, t, col, o = {}) {
  const chars = [...line.text], n = chars.length, mid = P.total * (o.mid ?? .5);
  chars.forEach((ch, k) => {
    const t0 = line.t[k]; if (t < t0 - .05) return;
    const target = mid + ((n - 1) / 2 - k) * 14;
    const d = Math.min(target, (t - t0 + .05) * (o.speed ?? 260));
    const [x, y] = P.at(d);
    ptext(g, ch, x - 6, y - 15, col, { shadow: 'rgba(20,10,40,.7)', alpha: (o.alpha ?? 1) * clamp((t - t0 + .05) / .1) });
  });
}

function shotStairs(t, T, lt) {
  const L10 = L(10), L11 = L(11), L12 = L(12), L13 = L(13), F = 140;
  const cam = { x: kf(t, [[79.2, 14], [86, 22], [93.8, 18], [101.5, 6]]), y: kf(t, [[79.2, 8], [86, -2], [101.5, 0]]), k: 1 };
  const gx = 58;                                        // 她站的位置
  // Clawd 在第几级
  let si = -1; L10.t.forEach((x, k) => { if (t >= x - .2) si = k; });
  const top = STEP(12);
  // 第十四句末尾：Clawd 顺着线滑下来
  const tangle = E.io(seg(t, L13.t[0] - .3, L13.t[4]));
  const slide = E.io(seg(t, L13.t[10], L13.t[13] + .1));
  const collapse = seg(t, L13.t[0] - .4, L13.t[4]);
  layer(g => {
    skyNight(g, t, { cols: ['#1a1d44', '#232655', '#2f2f66', '#433b74', '#5f4878', '#875a7a', '#b06e78'] });
    disc(g, 270, 4, 9, '#f8f0d0'); disc(g, 273, 2, 8, mix('#1a1d44', '#232655', .5));
    for (let k = 0; k < 4; k++) cloud(g, ((k * 97 + t * 3) % 420) - 60, 50 + k * 18 - (k % 2) * 10, 30 + k * 6, k % 2 ? 'rgba(235,205,225,.55)' : 'rgba(210,190,230,.45)');
  }, cam, { par: .5 });
  layer(g => {
    rooftop(g, t, F);
    // 书的台阶
    for (let k = 0; k < 13; k++) {
      const st = STEP(k), appear = seg(t, L10.t[k] - .25, L10.t[k] + .05);
      if (appear <= 0) continue;
      const fall = collapse > 0 ? Math.pow(seg(collapse, (12 - k) / 24, (12 - k) / 24 + .5), 2) * 170 : 0;
      book(g, st.x + rd((1 - E.out(appear)) * 30), st.y + rd(Math.sin(t * 1.5 + k) * 1) + rd(fall), k, L10.text[k], t, E.out(appear) * (1 - seg(collapse, .6, 1)));
    }
    // 线（传声筒），第十二句开始
    const A = [top.x + 8, top.y - 6], B = [gx + 6, F - 22];
    const strA = seg(t, L11.t[0] - .8, L11.t[0] - .2);
    let P = null;
    if (strA > 0 && slide < 1) {
      P = stringPath(A, B, tangle, t);
      const upto = rd(P.pts.length * strA);
      for (let i = 1; i < upto; i++) { const p = P.pts[i]; px(g, p[0], p[1], '#f2e6d8'); }
      if (strA < 1) { const p = P.pts[Math.max(0, upto - 1)]; rect(g, p[0] - 2, p[1] - 2, 5, 5, '#c9ccd2'); }
    }
    // 字沿着线滑下来
    if (P) {
      if (t < L12.t[0] - .1) textOnString(g, P, L11, t, '#ffe8c8');
      else if (t < L13.t[0] - .2) textOnString(g, P, L12, t, '#ffe8c8');
      else textOnString(g, P, L13, t, '#ffd0e0', { speed: 320 });
    }
    // 她：仰头看；拿着传声筒的罐子听
    const hold = t > L11.t[0] && slide < 1;
    girl(g, gx, F, hold ? 'hold' : 'stand', { t, eyes: t > L13.t[13] ? 'happy' : 'up', armA: hold ? -1.6 : undefined, armLen: 8 });
    if (hold) { rect(g, gx + 2, F - 34, 5, 6, '#c9ccd2'); rect(g, gx + 2, F - 34, 5, 1, '#e8eaee'); }
    // Clawd：一级一级往上跳；到顶后拿着罐子；最后顺着线滑下来
    let cx, cy, eyes = 'n';
    if (si < 0) { cx = gx + 18; cy = F; }
    else {
      const k = si, st = STEP(k), u = clamp((t - (L10.t[k] - .2)) / .2);
      const prev = k === 0 ? { x: gx + 18 - 8, y: F - 8 } : STEP(k - 1);
      cx = lerp(prev.x + 8, st.x + 8, E.io(u)); cy = lerp(prev.y, st.y, E.io(u)) - Math.sin(u * Math.PI) * 8;
      if (k === 12) eyes = t > L10.t[12] + .6 ? 'sad' : 'n';
    }
    if (collapse > 0 && slide <= 0 && P) { const p = P.at(4); cx = p[0]; cy = p[1] + 14 + rd(Math.sin(t * 4) * 1); eyes = 'wide'; }
    if (slide > 0 && P) { const p = P.at(P.total * slide); cx = p[0]; cy = p[1] + 14; eyes = slide < 1 ? 'wide' : 'happy'; }
    if (t > L13.t[13] + .1) { cx = gx + 2; cy = F - 22; eyes = 'happy'; }
    clawd(g, cx, cy, { u: 1, t, eyes, look: si >= 12 ? -1 : 0, noShadow: si >= 0, blush: t > L13.t[13] ? 1 : 0, armL: collapse > 0 && slide < 1 ? 2 : 0, armR: collapse > 0 && slide < 1 ? 2 : 0 });
    if (t > L13.t[13] + .3) mark(g, gx + 2, F - 34, '♥', t, L13.t[13] + .3, 102);
  }, cam);
  glow(sx(cam, 270), sy(cam, 4), 400, '#fff2c8', .18);
  if (t < 79.6) grade('#ffffff', 1 - seg(t, 79.2, 79.6), 'screen');
  grade('#ffd6e8', .1, 'soft-light');
  bloom(.35, 1.12);
  dust(t, 30, 51, { a: .45, col: '#ffe8f4', vy: -12 });
  vignette(.5);
}

/* ---------------- 雨天的公交站（101.5–122.3） ----------------
   世界坐标：地面 y=118。站台棚 x 70–210，灯箱广告 x 150–200，站牌 + LED 到站屏在 x 40。 */
function rainStreet(g, t, F = 118) {
  // 对面的楼（雨里发灰）
  rect(g, -40, -20, 460, F + 20, '#8f9db0');
  for (let k = 0; k < 9; k++) {
    const x = -40 + k * 52, h = 60 + hash(k, 3) * 40;
    rect(g, x, F - 30 - h, 48, h, k % 2 ? '#7d8ca2' : '#86949f');
    for (let j = 6; j < h - 6; j += 10) for (let i = 4; i < 44; i += 10) rect(g, x + i, F - 30 - h + j, 5, 6, hash(k, i, j) > .6 ? '#e8d9a8' : '#9fb0c2');
  }
  // 马路（湿的，有倒影）
  rect(g, -40, F - 30, 460, 30, '#5f6772'); for (let i = -40; i < 420; i += 34) rect(g, i + ((t * 0) % 34), F - 16, 16, 1, '#c9ccd2');
  // 车灯开过去的倒影
  for (let k = 0; k < 2; k++) { const cx = ((t * (60 + k * 30) + k * 200) % 520) - 60; rect(g, cx, F - 24 + k * 8, 26, 6, k ? '#3a4a6a' : '#7a3a3a'); rect(g, cx + (k ? 0 : 22), F - 22 + k * 8, 4, 2, k ? '#fff2c0' : '#ff6a5a'); }
}
function busStop(g, t, o = {}) {
  const F = 118;
  // 人行道
  rect(g, -40, F, 460, 30, '#8a8d93'); rect(g, -40, F, 460, 1, '#a6a9ae'); for (let i = -40; i < 420; i += 14) rect(g, i, F + 1, 1, 30, '#7c7f85');
  // 水坑
  for (const [x, w] of [[30, 30], [180, 40], [260, 24]]) { rect(g, x, F + 4, w, 3, '#9fb0c6'); rect(g, x + 2, F + 4, w - 4, 1, '#c9d6e6'); }
  // 棚子：绿色顶，玻璃背板，长椅
  rect(g, 70, 30, 150, 5, '#3f7a6a'); rect(g, 70, 30, 150, 1, '#5f9a8a'); rect(g, 66, 35, 158, 2, '#2f5a4e');
  rect(g, 74, 37, 3, F - 37, '#3f5a52'); rect(g, 213, 37, 3, F - 37, '#3f5a52');
  rect(g, 78, 44, 66, 56, 'rgba(200,225,235,.35)'); rect(g, 78, 44, 66, 1, 'rgba(255,255,255,.5)');
  rect(g, 84, F - 18, 60, 3, '#6a5a4a'); rect(g, 86, F - 15, 2, 15, '#555'); rect(g, 138, F - 15, 2, 15, '#555');
  // 灯箱广告
  rect(g, 148, 40, 62, 62, '#2a3a4a'); rect(g, 150, 42, 58, 58, '#f6f2e6');
  rect(g, 150, 42, 58, 9, '#3a5a9a'); ptext(g, '透明伞 · 新到', 179, 42, '#ffffff', { size: 10, align: 'c' });
  if (o.ad) o.ad(g, 150, 52, 58, 46);
  // 站牌 + LED 到站屏
  rect(g, 56, 10, 3, F - 10, '#6a6d73');
  rect(g, 46, 8, 24, 14, '#3f7fbf'); ptext(g, '公交', 58, 10, '#fff', { size: 10, align: 'c' });
  if (o.led) o.led(g);
}
/* 公交车（侧面，朝左开），x 是车头 */
function bus(g, x, F, t, sign) {
  const L0 = 130;
  rect(g, x, F - 46, L0, 40, '#e9e4d6'); rect(g, x, F - 46, L0, 2, '#fbf8ee'); rect(g, x, F - 18, L0, 8, '#2f9a6a');
  rect(g, x + 4, F - 40, 18, 18, '#2a3a4a'); rect(g, x + 5, F - 39, 16, 16, '#6a8aa6');
  for (let i = 0; i < 5; i++) { rect(g, x + 28 + i * 20, F - 40, 17, 14, '#2a3a4a'); rect(g, x + 29 + i * 20, F - 39, 15, 12, '#8aa6bf'); }
  rect(g, x + 2, F - 56, 70, 10, '#111'); dith(g, x + 2, F - 56, 70, 10, '#1a1414');
  if (sign) sign(g, x + 2, F - 56, 70, 10);
  disc(g, x + 20, F - 6, 6, '#222'); disc(g, x + 20, F - 6, 2, '#888'); disc(g, x + 104, F - 6, 6, '#222'); disc(g, x + 104, F - 6, 2, '#888');
  rect(g, x - 2, F - 16, 3, 4, '#fff2c0');
}
function rain(g, t, x0, x1, y0, y1, n, seed = 1, ang = .25) {
  for (let i = 0; i < n; i++) {
    const sp = 160 + hash(i, seed) * 80, ph = hash(i, seed, 2);
    const x = x0 + ((hash(i, seed, 3) * (x1 - x0) + t * sp * ang) % (x1 - x0)), y = y0 + ((ph * (y1 - y0) + t * sp) % (y1 - y0));
    line(g, x, y, x - 1, y + 4, 'rgba(210,225,245,.55)');
  }
}
function splashes(g, t, x0, x1, y, n, seed = 2) {
  for (let i = 0; i < n; i++) {
    const ph = (t * 1.7 + hash(i, seed)) % 1, x = x0 + hash(i, seed, 5) * (x1 - x0) + fl(t * 1.7 + hash(i, seed)) * 37 % (x1 - x0);
    if (ph < .3) { const r = rd(ph * 10); px(g, x - r, y, 'rgba(220,235,255,.7)'); px(g, x + r, y, 'rgba(220,235,255,.7)'); if (r < 2) px(g, x, y - 1, 'rgba(220,235,255,.7)'); }
  }
}
/* 透明塑料伞（罩着 Clawd） */
function clearUmbrella(g, x, y, t, a = 1) {
  g.save(); g.globalAlpha *= a;
  for (let j = 0; j < 12; j++) { const w = rd(Math.sqrt(1 - Math.pow((12 - j) / 12, 2)) * 16); rect(g, x - w, y - 12 + j, 2 * w, 1, 'rgba(225,240,255,.28)'); px(g, x - w, y - 12 + j, 'rgba(240,250,255,.8)'); px(g, x + w - 1, y - 12 + j, 'rgba(240,250,255,.8)'); }
  rect(g, x - 16, y, 32, 1, 'rgba(240,250,255,.85)'); rect(g, x, y - 13, 1, 2, '#c9ccd2');
  rect(g, x, y, 1, 10, 'rgba(200,210,220,.9)');
  g.restore();
}

function shotBusStop(t, T, lt) {
  const L14 = L(14), L15 = L(15), L16 = L(16), F = 118;
  const busIn = E.out(seg(t, L16.t[0] - 1.2, L16.t[0] + .4));
  const cam = { x: kf(t, [[101.5, 34], [108, 38], [115, 44], [122.3, 52]]), y: 6, k: 1.25 };
  // Clawd 算到站时间
  const est = ['3 分钟', '7 分钟', '12 分钟', '? 分钟'][Math.min(3, fl(Math.max(0, t - 102) / 1.6))];
  const hide = seg(t, L15.t[0] - .5, L15.t[0] + .1) * (1 - seg(t, L16.t[0] - .6, L16.t[0]));
  const spin = seg(t, L16.t[4], L16.t[13] + .4);
  layer(g => rainStreet(g, t, F), cam, { par: .6, blur: 2.5 });
  layer(g => {
    busStop(g, t, {
      led: g2 => {
        ledBoard(g2, 44, 30, 100, 30, [{ s: '猜的没错想得太多', times: L14.t.slice(0, 8) }, { s: '不会有结果', times: L14.t.slice(8) }], t, '#ffa040');
      },
      ad: (g2, x, y, w, h) => {
        // 灯箱上：第十六句（像原片的补习班广告牌）
        if (t > L15.t[0] - .3) {
          ptext(g2, '被你看穿了', x + w / 2, y + 4, '#2a3a6a', { align: 'c', times: L15.t.slice(0, 5), t, pop: .1 });
          ptext(g2, '以后我更', x + w / 2, y + 18, '#2a3a6a', { align: 'c', times: L15.t.slice(5, 9), t, pop: .1 });
          ptext(g2, '无处可躲', x + w / 2, y + 32, '#d2473b', { align: 'c', times: L15.t.slice(9), t, pop: .1 });
        } else { clearUmbrella(g2, x + w / 2, y + 30, t); }
      },
    });
    // 她坐在长椅上，撑着一把黄伞（伞收着靠在旁边）
    girl(g, 102, F - 1, 'sit', { t, eyes: hide > .5 && t < L15.t[13] ? 'happy' : t > L16.t[8] && spin > .4 ? 'closed' : 'n', pal: spin > .5 ? { Y: '#d39a3a' } : undefined });
    rect(g, 94, F - 26, 2, 26, '#e0b030'); rect(g, 92, F - 28, 6, 3, '#f2c230');
    // Clawd：坐在长椅上，头顶冒算式；然后躲到透明伞下面（一眼就看见）；最后转伞甩她一身水
    const cx = 124, cy = F - 18;
    clawd(g, cx, cy, { u: 2, t, eyes: t < L14.t[8] ? 'up' : t < L15.t[0] - .5 ? 'sad' : hide > .5 ? 'closed' : spin > 0 && spin < 1 ? 'happy' : t > L16.t[13] ? 'sad' : 'n', sweat: t > L16.t[13] ? 1 : 0, look: -1 });
    if (t > 101.8 && t < L14.t[8]) { rect(g, cx - 2, cy - 30, textW(est, 10) + 4, 11, 'rgba(255,255,255,.9)'); ptext(g, est, cx, cy - 29, '#3a3a6a', { size: 10 }); spinStar(g, cx - 6, cy - 25, t, '#d97757'); }
    if (hide > 0) clearUmbrella(g, cx, cy - 18, t, hide);
    if (spin > 0) {
      const a = spin * TAU * 3;
      clearUmbrella(g, cx, cy - 18, t, 1);
      for (let k = 0; k < 10; k++) { const ang = a + k * .63, r = 18 + (spin * 30 % 10); px(g, cx + Math.cos(ang) * r, cy - 18 + Math.sin(ang) * r * .5, 'rgba(200,225,255,.9)'); }
    }
    if (t > L16.t[13] + .1) mark(g, cx, cy - 20, '…', t, L16.t[13] + .1, 122.3, '#e8eef8');
    // 公交车进站：车头 LED 写第十七句
    bus(g, lerp(340, 216, busIn), F, t, (g2, x, y, w, h) => {
      const shown = L16.t.filter(v => t >= v).length, str = L16.text.slice(0, shown);
      const tw = textW(str), scroll = Math.max(0, tw - (w - 4));
      g2.save(); g2.beginPath(); g2.rect(x, y - 1, w, h + 2); g2.clip();
      ptext(g2, str, x + 2 - scroll, y - 1, '#ffa040');
      g2.restore();
    });
    rain(g, t, cam.x - 10, cam.x + 270, cam.y - 10, F, 90, 7);
    splashes(g, t, cam.x, cam.x + 260, F + 1, 18);
  }, cam);
  layer(g => rain(g, t * 1.3, cam.x - 10, cam.x + 270, cam.y - 10, cam.y + 130, 40, 9), cam, { par: 1.3, blur: 1.2, alpha: .8 });
  glow(sx(cam, 56), sy(cam, 45), 360, '#ffa040', .16);
  glow(sx(cam, 179), sy(cam, 70), 360, '#f6f2e6', .2);
  grade('#6a86a8', .32, 'soft-light');
  grade('#b0bccc', .22, 'multiply');
  bloom(.3, 1.1);
  vignette(.5);
}

/* 雨天的窗台（122.3–129.0）：土里冒出一棵小芽 */
function shotSillRain(t, T, lt) {
  const L17 = L(17), S0 = 110, px0 = 150;
  const cam = { x: 82 + lt * .5, y: 32, k: 1.5 };
  const sprout = seg(t, L17.t[10] - .2, L17.t[11] + .6);
  layer(g => cityView(g, -20, -30, 360, S0 + 30, t, { tod: 3.4, rain: 1 }), cam, { blur: 1.4 });
  layer(g => {
    sill(g, t, { noOutside: true });
    pot(g, px0, S0, t, sprout > 0 ? 1 + sprout * .6 : 0, { sign: { lines: [{ s: '只是怕亲手', times: L17.t.slice(0, 5) }, { s: '将我的真心葬送', times: L17.t.slice(5) }], w: 90 }, glowHeart: .3 + .2 * Math.sin(t * 3) });
    clawd(g, 124, S0, { u: 2, t, eyes: sprout > .3 ? 'wide' : 'sad', look: 1, blush: sprout > .6 ? 1 : 0 });
    if (sprout > .5) mark(g, 124, S0 - 18, '!', t, L17.t[11] + .3, 129.5, '#ffe27a');
    // 玻璃上的雨痕
    for (let i = 0; i < 16; i++) { const x = 70 + hash(i, 4) * 180, y = ((t * (8 + hash(i, 5) * 10) + hash(i, 6) * 120) % 120) - 20; for (let k = 0; k < 5; k++) px(g, x, y - k, `rgba(200,220,245,${(.6 - k * .1).toFixed(2)})`); }
  }, cam);
  grade('#4a5a7a', .35, 'soft-light');
  grade('#a8b4c8', .25, 'multiply');
  glow(sx(cam, px0), sy(cam, S0 - 14), 120, '#ff7aa8', .2 + .1 * Math.sin(t * 3));
  bloom(.3, 1.1);
  vignette(.55);
}
