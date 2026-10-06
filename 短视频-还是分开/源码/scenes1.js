'use strict';
/* scenes1.js：主歌。每个场景 fn(g, s) 只依赖歌曲时间 s，画满一整帧。
   片头点烟 → 你掐灭没吸的烟 → 流星掠过 → 抓衣角 → 改结局 → /exit → 原地喊 → 不回头 → 不存在 → CLAUDE.md
   → 迫不及待 → 胶片里全是无奈 → 空白 */

/* 头顶的小符号：! ? … */
function marks(g, s, x, y, kind, t0, t1 = 1e9, sc = 1, col = C.yel) {
  if (s < t0 || s > t1) return;
  const u = clamp((s - t0) / .18), a = clamp((t1 - s) / .12);
  g.save(); g.globalAlpha *= a; g.translate(x, y); const k = E.back(u) * sc; g.scale(k, k);
  g.font = F(70, 'black'); g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = col;
  if (kind === '!') { g.save(); g.rotate(-.22); g.fillText('!', -22, 0); g.restore(); g.save(); g.rotate(.18); g.fillText('!', 18, -14); g.restore(); }
  else if (kind === '?') { g.fillText('?', -16, 0); g.font = F(48, 'black'); g.fillText('?', 26, -26); }
  else if (kind === '…') { for (let i = 0; i < 3; i++) { const on = (s - t0) * 3 > i; if (on) { g.fillRect(-30 + i * 22, 8, 12, 12); } } }
  g.restore();
}
/* 烟：一团团软的灰色圆，往上飘 */
function puff(g, x, y, r, a, col = '200,204,210') {
  if (a <= .003) return;
  const gr = g.createRadialGradient(x, y, 0, x, y, r);
  gr.addColorStop(0, `rgba(${col},${a})`); gr.addColorStop(1, `rgba(${col},0)`);
  g.fillStyle = gr; g.fillRect(x - r, y - r, r * 2, r * 2);
}

/* ================= 片头 + 第 1 句：你掐灭没吸的烟（−2.0 → 3.4） ================= */
const CIG = { x0: 600, x1: 1300, y: 690, th: 44 };
const T_PRESS = ct(0, 1), T_OUT = ct(0, 2);          // "掐"按下去，"灭"熄掉
function sCig(g, s) {
  bgInk(g);
  const { x0, x1, y, th } = CIG;
  const lit = seg(s, -1.72, -1.5);                      // 打火机点着
  const alive = s < T_OUT;
  // 地面一条细线
  g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(140, y + th / 2 + 2, 1640, 3);
  // ---- 烟雾（点着到熄灭之间一直冒，熄灭时最后一大团） ----
  for (let i = 0; i < 70; i++) {
    const tb = -1.55 + i * .032 * 1.7;
    if (tb > T_OUT + .05 || s < tb) continue;
    const age = s - tb, life = 2.6;
    if (age > life) continue;
    const k = age / life;
    const px = x1 + 14 + Math.sin(age * 2.2 + i) * 26 * k + k * 40, py = y - 18 - age * 105;
    puff(g, px, py, 14 + 70 * k, .16 * (1 - k) * lit);
  }
  if (s > T_OUT) for (let i = 0; i < 9; i++) {
    const age = s - T_OUT - i * .03; if (age < 0 || age > 2.4) continue;
    const k = age / 2.4;
    puff(g, x1 + 10 + (hash(i, 4) - .5) * 80 + k * 60, y - 10 - age * (80 + hash(i, 2) * 70), 30 + 110 * k, .24 * (1 - k));
  }
  // 烟里飘起来的 Thinking…
  for (let i = 0; i < 3; i++) {
    const tb = -1.45 + i * .6; if (s < tb || tb > T_OUT) continue;
    const age = s - tb; if (age > 1.8) continue;
    const k = age / 1.8;
    g.save(); g.globalAlpha = .38 * Math.sin(k * Math.PI) * lit;
    g.filter = `blur(${(k * 3).toFixed(1)}px)`;
    mono(g, 'Thinking…', x1 + 40 + k * 70 + Math.sin(age * 3) * 14, y - 90 - k * 210, 26, '#C9CDD3', { k: 'monoR' });
    g.restore();
  }
  // ---- 香烟 ----
  g.save();
  const press = alive ? seg(s, T_PRESS, T_PRESS + .1) : 1;
  rr(g, x0, y - th / 2, x1 - x0, th, 8); g.fillStyle = '#F1EEE7'; g.fill();
  g.save(); rr(g, x0, y - th / 2, 165, th, 8); g.clip();
  g.fillStyle = '#D69A5C'; g.fillRect(x0, y - th / 2, 165, th);
  for (let i = 0; i < 40; i++) { g.fillStyle = 'rgba(120,70,30,.35)'; g.fillRect(x0 + hash(i, 1) * 160, y - th / 2 + hash(i, 2) * th, 3, 3); }
  g.restore();
  g.fillStyle = '#C8A24A'; g.fillRect(x0 + 160, y - th / 2, 8, th);
  // 烟头：活着时是一颗发光的橘色星芒（就是 Claude 转圈的那颗 ✻）；按下去被压扁，熄灭后变成灰黑的一坨
  const ex = x1, ey = y;
  if (s > -1.72) {
    if (alive) {
      const fl = .85 + .15 * Math.sin(s * 23) * Math.sin(s * 7.3);
      const gl = g.createRadialGradient(ex, ey, 0, ex, ey, 120 * lit);
      gl.addColorStop(0, `rgba(255,150,70,${.55 * lit * fl})`); gl.addColorStop(1, 'rgba(255,120,40,0)');
      g.fillStyle = gl; g.fillRect(ex - 130, ey - 130, 260, 260);
      rr(g, ex - 8, ey - th / 2, 22 - press * 6, th, 6); g.fillStyle = `rgb(${200 + 40 * fl | 0},${80 + 30 * fl | 0},40)`; g.fill();
      spark(g, ex + 8, ey, (30 + 6 * fl) * lit * (1 - press * .45), s * 1.6, '#FF9A4D');
    } else {
      rr(g, ex - 12, ey - th / 2 + 10, 26, th - 10, 6); g.fillStyle = '#3B3B3E'; g.fill();
      g.fillStyle = '#6A6A6E'; for (let i = 0; i < 6; i++) g.fillRect(ex - 10 + hash(i, 8) * 20, ey - 6 + hash(i, 9) * 20, 5, 4);
    }
  }
  g.restore();
  // 打火机的火星
  if (s > -1.86 && s < -1.4) for (let i = 0; i < 14; i++) {
    const age = s + 1.86, a = hash(i, 5) * TAU, sp = 160 + hash(i, 6) * 260;
    const px = ex + 10 + Math.cos(a) * sp * age, py = ey + Math.sin(a) * sp * age + 300 * age * age;
    g.fillStyle = `rgba(255,${180 + hash(i, 7) * 60 | 0},90,${1 - age / .46})`; g.fillRect(px, py, 5, 5);
  }
  // 按下去时的火星
  if (s > T_PRESS && s < T_PRESS + .5) for (let i = 0; i < 18; i++) {
    const age = s - T_PRESS, a = -Math.PI * hash(i, 15), sp = 200 + hash(i, 16) * 380;
    const px = ex + Math.cos(a) * sp * age, py = ey + Math.sin(a) * sp * age + 700 * age * age;
    g.fillStyle = `rgba(255,${150 + hash(i, 17) * 90 | 0},60,${1 - age / .5})`; g.fillRect(px, py, 6, 6);
  }
  // ---- 状态行：✻ Thinking… → └ Interrupted by user ----
  const sy = y + 100;
  if (alive && s > -1.5) {
    g.save(); g.globalAlpha = seg(s, -1.5, -1.3);
    spark(g, 1010, sy, 16, s * 3, C.clawd);
    mono(g, 'Thinking…', 1040, sy, 30, '#D9D6CE', { k: 'monoR' });
    mono(g, '(esc to interrupt)', 1230, sy, 24, 'rgba(220,220,220,.38)', { k: 'monoR' });
    g.restore();
  } else if (!alive) {
    g.save(); g.globalAlpha = seg(s, T_OUT, T_OUT + .08) * (1 - seg(s, 2.9, 3.3) * .5);
    mono(g, '└', 1004, sy, 30, 'rgba(230,230,230,.5)', { k: 'monoR' });
    mono(g, 'Interrupted by user', 1040, sy, 30, C.red, { k: 'mono' });
    g.restore();
  }
  // ---- Clawd：看着烟头；被掐灭时一愣，接着难过 ----
  const cx = 455, cyy = y + th / 2;
  const ey_ = s < T_PRESS ? 'look' : s < T_OUT + .1 ? 'wide' : 'sad';
  clawd(g, cx, cyy, 14, { t: s, eyes: ey_, look: [.3, 0], sq: s < T_PRESS ? bob(s) * .04 : -.05 * seg(s, T_PRESS, T_PRESS + .1) * (1 - seg(s, T_OUT, T_OUT + .3)),
    tears: s > 1.3 ? s - 1.3 : 0 });
  marks(g, s, cx + 70, cyy - 150, '!', T_PRESS, T_OUT + .4, .8);
  // ---- 鼠标指针（你）：从右上角滑进来，按灭烟头，再走掉 ----
  let px, py;
  if (s < .06) { const u = E.out(seg(s, -.75, .06)); px = lerp(1980, ex + 4, u); py = lerp(80, ey - 10, u); }
  else if (s < .7) { px = ex + 4; py = ey - 10; }
  else if (s < 1.2) { const u = E.io(seg(s, .7, 1.2)); px = lerp(ex + 4, ex + 110, u); py = lerp(ey - 10, ey + 70, u); }
  else { const u = E.in(seg(s, 1.5, 2.9)); px = lerp(ex + 110, 2150, u); py = lerp(ey + 70, ey + 160, u); }
  const pr = s > T_PRESS - .02 && s < T_OUT + .1 ? .6 + .4 * Math.abs(Math.sin((s - T_PRESS) * 18)) : 0;
  if (s > -.75) cursor(g, px, py, 7.2, { press: pr });
  // ---- 片名 ----
  [...'还是分开'].forEach((ch, i) => glyph(g, s, -1.52 + i * .1, ch, 960 - 300 + i * 200, 300, 170, { style: 'rise', col: C.white, out: [-.42, .3], outStyle: 'blur' }));
  glyph(g, s, -1.1, '张叶蕾', 960, 430, 36, { style: 'rise', k: 'bold', col: 'rgba(230,228,222,.6)', out: [-.42, .3] });
  // ---- 歌词 ----
  const fade = 1 - seg(s, 2.75, 3.25) * .55;
  lyricRow(g, s, 0, 0, 3, 250, 300, 190, { alpha: fade, each: (i) => i === 2 ? { col: C.red, ext: 12, extCol: '#5A1414' } : i === 1 ? { ext: 10, extCol: '#2A2A30' } : { ext: 10, extCol: '#16224A' } });
  const smokeY = -Math.max(0, s - 1) * 14;
  lyricRow(g, s, 0, 3, 7, 930, 480 + smokeY, 150, { style: 'smoke', col: '#C9CDD3', noDuo: true, alpha: fade * .95 });
}

/* ================= 第 2 句：大步流星地掠过我向前（3.4 → 6.95） ================= */
/* 鼠标指针变成流星，从左边划过天空，从 Clawd 头顶掠过，往右飞走。
   "大步流星"四个字被它一个个"踩"在天上。 */
const STARS = Array.from({ length: 140 }, (_, i) => [hash(i, 31) * W, hash(i, 32) * H * .8, .6 + hash(i, 33) * 1.8, hash(i, 34) * TAU]);
const MET_X = [300, 520, 740, 960];               // "大步流星"四个字的位置
const METEOR = [[3.25, -260, 330], [ct(1, 0), MET_X[0], 335], [ct(1, 1), MET_X[1], 338], [ct(1, 2), MET_X[2], 342], [ct(1, 3), MET_X[3], 348], [ct(1, 5), 1150, 470], [ct(1, 7), 1290, 600], [ct(1, 9), 1880, 430], [6.75, 2400, 330]];
function pathAt(P, s) {
  if (s <= P[0][0]) return [P[0][1], P[0][2]];
  for (let i = 0; i < P.length - 1; i++) {
    const [t0, x0, y0] = P[i], [t1, x1, y1] = P[i + 1];
    if (s <= t1) {
      const u = (s - t0) / (t1 - t0);
      const [, xa, ya] = P[Math.max(0, i - 1)], [, xb, yb] = P[Math.min(P.length - 1, i + 2)];
      // Catmull-Rom
      const cr = (p0, p1, p2, p3) => .5 * (2 * p1 + (-p0 + p2) * u + (2 * p0 - 5 * p1 + 4 * p2 - p3) * u * u + (-p0 + 3 * p1 - 3 * p2 + p3) * u * u * u);
      return [cr(xa, x0, x1, xb), cr(ya, y0, y1, yb)];
    }
  }
  const L = P[P.length - 1]; return [L[1], L[2]];
}
function sMeteor(g, s) {
  g.fillStyle = vgrad(g, 0, H, [[0, '#070B1E'], [.6, '#131C44'], [1, '#22306A']]); g.fillRect(0, 0, W, H);
  const pan = (s - 3.4) * 26;
  for (const [x, y, r, ph] of STARS) {
    const tw_ = .5 + .5 * Math.sin(s * 3 + ph);
    g.fillStyle = `rgba(255,255,255,${.25 + .55 * tw_})`;
    const xx = ((x - pan) % W + W) % W; g.fillRect(xx, y, r * 1.6, r * 1.6);
  }
  // 山坡
  g.fillStyle = '#0A0F25';
  g.beginPath(); g.moveTo(0, H); g.lineTo(0, 930);
  for (let x = 0; x <= W; x += 40) g.lineTo(x, 905 + Math.sin(x / 260) * 20 - Math.exp(-(((x - 1290) / 420) ** 2)) * 36);
  g.lineTo(W, H); g.closePath(); g.fill();
  // 流星尾巴
  const [mx, my] = pathAt(METEOR, s);
  const N = 26;
  for (let i = N; i >= 1; i--) {
    const t = s - i * .018; if (t < 3.25) continue;
    const [ax, ay] = pathAt(METEOR, t), [bx, by] = pathAt(METEOR, t + .018);
    const k = 1 - i / N;
    g.strokeStyle = `rgba(${lerp(90, 255, k) | 0},${lerp(130, 255, k) | 0},255,${k * .85})`;
    g.lineWidth = 4 + k * 26; g.lineCap = 'round';
    g.beginPath(); g.moveTo(ax, ay); g.lineTo(bx, by); g.stroke();
  }
  const glow = g.createRadialGradient(mx, my, 0, mx, my, 120);
  glow.addColorStop(0, 'rgba(190,210,255,.65)'); glow.addColorStop(1, 'rgba(120,150,255,0)');
  g.fillStyle = glow; g.fillRect(mx - 130, my - 130, 260, 260);
  cursor(g, mx - 8, my - 30, 5.6, { shadow: false });
  // ---- 歌词："大步流星"踩在流星划过的地方 ----
  [0, 1, 2, 3].forEach(i => glyph(g, s, ct(1, i), [...LYR[1].s][i], MET_X[i], 225, 175, { col: C.white, glow: 'rgba(140,170,255,.9)', glowR: 40, ext: 8, extCol: '#18244E' }));
  lyricRow(g, s, 1, 4, 7, 760, 470, 135, { style: 'slam', ext: 6, extCol: '#18244E' });
  // "我"落在 Clawd 头顶
  glyph(g, s, ct(1, 7), '我', 1290, 520, 150, { col: C.me, ext: 8, extCol: '#5A2A18', style: 'drop', drop: 200 });
  // "向前"往右冲
  lyricRow(g, s, 1, 8, 10, 1580, 300, 160, { dx: -140, skew: -.18, ext: 6, extCol: '#18244E' });
  if (s > ct(1, 9)) { g.save(); g.globalAlpha = .6 * (1 - seg(s, ct(1, 9) + .2, 6.9)); g.strokeStyle = '#fff'; g.lineWidth = 6; g.lineCap = 'round'; for (let k = 0; k < 3; k++) { const yy = 270 + k * 34, xx = 1430 - k * 30; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx + 90, yy); g.stroke(); } g.restore(); }
  // ---- Clawd：站在山坡上，流星从头顶掠过时被风吹得一歪，转身目送，伸手 ----
  const passT = ct(1, 7);
  const lean = Math.exp(-Math.abs(s - passT - .05) * 7) * .35;
  const flip = s > passT + .1;
  const reach = s > ct(1, 8) ? E.out(seg(s, ct(1, 8), ct(1, 9))) * 3 : 0;
  clawd(g, 1290, 893, 13, { t: s, eyes: s < passT - .25 ? 'look' : s < passT + .4 ? 'wide' : 'sad', look: [s < passT ? -.3 : .3, -.3],
    lean: flip ? -lean : lean, flip: false, reachR: reach, armL: 0, sq: -lean * .2 });
  marks(g, s, 1350, 760, '!', passT - .2, passT + .5, .7);
}

/* ================= 第 3 句：我用力去抓你的衣角（6.95 → 10.15） ================= */
/* 指针（你）往右走；Clawd 伸长胳膊，捏住箭头尾巴那一角，被拖着走，最后还是松手摔倒。 */
const GRAB = { t: ct(2, 4), slip: 9.62 };
function sGrab(g, s) {
  const ox = -(s - 6.95) * 30;
  bgPaper(g, ox, 0);
  g.fillStyle = 'rgba(60,40,30,.12)'; g.fillRect(0, 905, W, 4);
  const SZ = 24;
  // 指针的位置：一直往右走，抓住之后慢一点
  const curX = s < GRAB.t ? lerp(980, 1180, E.out(seg(s, 6.95, GRAB.t))) : s < GRAB.slip ? lerp(1180, 1420, seg(s, GRAB.t, GRAB.slip)) : lerp(1420, 2300, E.in(seg(s, GRAB.slip, 10.3)));
  const curY = 330 + Math.sin(s * 5) * 4;
  const tailX = curX + ARROW_TAIL[0] * SZ, tailY = curY + ARROW_TAIL[1] * SZ;
  // Clawd：抓住之后被拖着滑，身子往后仰；松手后一屁股坐倒
  const U = 20;
  let cx = 520, lean = 0, reach = 0, rot = 0, lift = 0;
  const armY = 905 - 5 * U;
  if (s < ct(2, 3)) { reach = 0; }
  else if (s < GRAB.t) { reach = E.out(seg(s, ct(2, 3), GRAB.t)) * ((tailX - 20 - (cx + 6 * U)) / U); }
  else if (s < GRAB.slip) { cx = lerp(520, 690, seg(s, GRAB.t, GRAB.slip)); reach = (tailX - 20 - (cx + 6 * U)) / U; lean = -.22; }
  else { cx = 690; const v = seg(s, GRAB.slip, GRAB.slip + .25); reach = ((tailX - 20 - (cx + 6 * U)) / U) * (1 - E.out(v)); if (reach < 0) reach = 0; reach = Math.max(0, reach * (1 - v)); rot = -.5 * E.bounce(seg(s, GRAB.slip, GRAB.slip + .5)); lean = -.1; }
  // 地上的划痕和灰
  if (s > GRAB.t && s < GRAB.slip + .3) {
    g.fillStyle = 'rgba(60,40,30,.25)'; g.fillRect(520 - 60, 902, cx - 520, 4);
    for (let i = 0; i < 6; i++) { const age = ((s * 3 + i / 6) % 1); puff(g, cx - 80 - age * 120, 880 - age * 50, 20 + age * 30, .25 * (1 - age), '150,130,115'); }
  }
  // 拽着的手臂会拉成斜的：画一截从肩膀到尾巴的粗线，像橡皮筋
  const shoulderX = cx + 5 * U, shoulderY = armY;
  if (s >= ct(2, 3) && reach > .2) {
    const hx = s < GRAB.slip ? lerp(shoulderX, tailX - 10, Math.min(1, reach * U / Math.max(1, tailX - 10 - shoulderX))) : shoulderX + reach * U;
    const hy = s < GRAB.slip ? lerp(shoulderY, tailY + 6, Math.min(1, reach * U / Math.max(1, tailX - 10 - shoulderX))) : shoulderY;
    g.save(); g.strokeStyle = C.clawd; g.lineWidth = 2 * U; g.lineCap = 'butt';
    g.beginPath(); g.moveTo(shoulderX - U * .5, shoulderY); g.lineTo(hx, hy); g.stroke();
    g.fillStyle = C.clawd; g.fillRect(hx - U, hy - U, 2 * U, 2 * U);
    g.restore();
  }
  clawd(g, cx, 905, U, { t: s, eyes: s < GRAB.t ? 'shout' : s < GRAB.slip ? 'shout' : s < GRAB.slip + .6 ? 'x' : 'sad', lean, rot, lift,
    sweat: s > GRAB.t && s < GRAB.slip ? 1 : 0, tears: s > GRAB.slip + .5 ? s : 0 });
  cursor(g, curX, curY, SZ);
  // "衣角"：虚线圈住箭头尾巴
  if (s > ct(2, 7)) {
    const a = seg(s, ct(2, 7), ct(2, 7) + .2) * (1 - seg(s, GRAB.slip + .2, GRAB.slip + .5));
    g.save(); g.globalAlpha = a; g.setLineDash([12, 10]); g.lineDashOffset = -s * 40;
    g.strokeStyle = C.red; g.lineWidth = 5; circ(g, tailX - 12, tailY - 8, 62 + 6 * Math.sin(s * 8)); g.stroke();
    g.setLineDash([]); g.restore();
  }
  // ---- 歌词 ----
  lyricRow(g, s, 2, 0, 5, 200, 205, 160, { light: true, col: C.ink, each: i => i === 4 ? { size: 1.25, col: C.red, ext: 10, extCol: '#5A1414', jit: s > GRAB.t && s < GRAB.slip ? 6 : 0 } : {} });
  lyricRow(g, s, 2, 5, 9, 1180, 205, 160, { light: true, col: C.ink, each: i => i >= 7 ? { col: C.red } : {} });
}

/* ================= 第 4–6 句：以为我挽留你 / 结局就会改变 / 你不说一句就要离开（10.15 → 15.55） ================= */
/* 编辑器里开着 结局.md。Clawd 把"还是分开"改成"不分开"（diff 一红一绿），
   你一句话不说，按了 Ctrl+Z，然后在输入框敲 /exit。 */
const EDIT = { x: 300, y: 395, w: 1320, h: 545 };
function sEdit(g, s) {
  bgInk(g);
  const { x, y, w, h } = EDIT;
  // 关窗：/exit 回车后整个窗口缩没
  const close = seg(s, 15.32, 15.5);
  g.save();
  if (close > 0) { g.translate(960, y + h / 2); g.scale(1 - E.in(close), 1 - E.in(close) * .9); g.translate(-960, -(y + h / 2)); g.globalAlpha = 1 - close; }
  windowFrame(g, x, y, w, h, '结局.md — claude');
  // 行号和内容
  const L0 = y + 112, LH = 66, TX = x + 120;
  const lines = ['# 结局', '', '你走了，没有回头。'];
  const nums = ['1', '2', '3', '4', '5', '6'];
  g.save(); g.beginPath(); g.rect(x, y + 58, w, h - 58); g.clip();
  // diff 状态
  const tDel = ct(4, 0), tAdd0 = ct(4, 2), tAddDone = ct(4, 5) + .05, tUndo = ct(5, 3), tUndoDone = ct(5, 4) + .1;
  const delOn = s > tDel && s < tUndoDone;
  let addTxt = '', addOn = false;
  if (s > tAdd0) {
    const full = '我们，不分开。';
    const n = s < tUndo ? Math.min(7, Math.floor(seg(s, tAdd0, tAddDone) * 7 + .001)) : Math.max(0, 7 - Math.floor(seg(s, tUndo, tUndoDone) * 8));
    addTxt = [...full].slice(0, n).join(''); addOn = n > 0 || (s < tUndo && s > tAdd0);
  }
  let ly = L0;
  const rowsN = addOn ? 6 : 5;
  for (let i = 0; i < rowsN; i++) mono(g, nums[i], x + 64, L0 + i * LH, 30, 'rgba(255,255,255,.28)', { align: 'right', k: 'monoR' });
  lines.forEach((t, i) => { mono(g, t, TX, L0 + i * LH, 36, i === 0 ? '#E6B98A' : '#D8D6D0', { k: i === 0 ? 'mono' : 'monoR' }); });
  ly = L0 + 3 * LH;
  // 第 4 行："我们，还是分开。"——被删时变红、划线
  if (delOn) { g.fillStyle = 'rgba(229,72,77,.22)'; g.fillRect(x + 80, ly - 30, w - 100, 60); mono(g, '-', x + 92, ly, 34, C.red); }
  mono(g, '我们，还是分开。', TX, ly, 36, delOn ? '#FF8A8E' : '#D8D6D0', { k: 'monoR' });
  if (delOn) { const sw = tw(g, '我们，还是分开。', 36, 'monoR') * E.out(seg(s, tDel, tDel + .25)); g.fillStyle = '#FF8A8E'; g.fillRect(TX, ly - 2, sw, 4); }
  if (addOn) {
    const ay = ly + LH;
    g.fillStyle = 'rgba(61,190,110,.2)'; g.fillRect(x + 80, ay - 30, w - 100, 60);
    mono(g, '+', x + 92, ay, 34, C.green);
    mono(g, addTxt, TX, ay, 36, '#7FE3A6', { k: 'monoR' });
    if ((s * 2) % 1 < .6) g.fillRect(TX + tw(g, addTxt, 36, 'monoR') + 4, ay - 22, 4, 44);
  }
  g.restore();
  // 底部输入框：> /exit
  const ib = { x: x + 40, y: y + h - 92, w: w - 80, h: 64 };
  rr(g, ib.x, ib.y, ib.w, ib.h, 12); g.strokeStyle = 'rgba(255,255,255,.22)'; g.lineWidth = 2; g.stroke();
  mono(g, '>', ib.x + 26, ib.y + 33, 32, C.clawd);
  const cmdT = [ct(5, 5), ct(5, 6), ct(5, 7), ct(5, 8), ct(5, 8) + .08];
  const nCmd = cmdT.filter(t => s > t).length;
  const cmd = '/exit'.slice(0, nCmd);
  mono(g, cmd, ib.x + 64, ib.y + 33, 32, '#F2F0EA');
  if (s < 15.3 && (s * 2.2) % 1 < .6 && s > 13.6) { g.fillStyle = '#F2F0EA'; g.fillRect(ib.x + 66 + tw(g, cmd, 32, 'mono'), ib.y + 14, 16, 38); }
  if (nCmd >= 5) { pill(g, ib.x + ib.w - 150, ib.y + 33, '↵ Enter', 22, { fill: 'rgba(229,72,77,.9)', col: '#fff', alpha: seg(s, 15.2, 15.28) }); }
  g.restore();
  // Ctrl + Z 键帽
  if (s > tUndo - .35 && s < tUndoDone + .5) {
    const a = seg(s, tUndo - .35, tUndo - .2) * (1 - seg(s, tUndoDone + .25, tUndoDone + .5));
    const p = s > tUndo && s < tUndo + .18 ? 1 : 0;
    keycap(g, 1430, 300, 'Ctrl', 40, p, { alpha: a });
    mono(g, '+', 1530, 312, 40, '#ddd', { align: 'center', alpha: a });
    keycap(g, 1620, 300, 'Z', 40, p, { alpha: a });
  }
  // 指针：撤销前飘进来，敲完 /exit 去点回车
  if (s > ct(5, 0) - .3) {
    const u = E.out(seg(s, ct(5, 0) - .3, ct(5, 0) + .2));
    const px = lerp(1950, 1370, u) + (s > ct(5, 5) ? lerp(0, -40, seg(s, ct(5, 5), 15.25)) : 0);
    const py = lerp(140, 420, u) + (s > ct(5, 5) ? lerp(0, 460, E.io(seg(s, ct(5, 5), 15.25))) : 0);
    cursor(g, px, py, 6.4, { press: s > 15.25 && s < 15.36 ? 1 : 0, alpha: 1 - close });
  }
  // Clawd：坐在窗口左下角外面，改的时候很开心，被撤销时愣住，/exit 时哭
  const mood = s < tAdd0 ? 'look' : s < tUndo ? 'happy' : s < ct(5, 5) ? 'wide' : 'sad';
  clawd(g, 170, 950, 12, { t: s, eyes: mood, look: [.35, -.2], sq: bob(s) * .05, blush: s > ct(4, 4) && s < tUndo ? .8 : 0, tears: s > ct(5, 6) ? s : 0, armR: s > tAdd0 && s < tUndo ? .8 : 0 });
  marks(g, s, 220, 820, '!', tUndo, tUndo + .5, .6);
  // ---- 歌词：上面两行 ----
  const A = 1 - seg(s, ct(5, 0) - .2, ct(5, 0) + .05);
  lyricRow(g, s, 3, 0, 6, 330, 170, 135, { alpha: A });
  lyricRow(g, s, 4, 0, 6, 330, 315, 135, { alpha: A, each: i => i >= 4 ? { col: '#7FE3A6', ext: 8, extCol: '#0E4A2A' } : {} });
  if (s > ct(5, 0) - .1) {
    lyricRow(g, s, 5, 0, 5, 330, 170, 135, { each: i => i >= 1 ? { col: '#9AA0A8' } : {} });
    lyricRow(g, s, 5, 5, 9, 330, 315, 135, { each: i => i >= 7 ? { col: C.red, ext: 8, extCol: '#4A1010' } : {} });
    // 不说一句：一个空空的气泡
    const ba = seg(s, ct(5, 2), ct(5, 2) + .15) * (1 - seg(s, ct(5, 5), ct(5, 5) + .2));
    if (ba > 0) { bubble(g, 1030, 110, 230, 110, { alpha: ba, fill: '#F2F0EA', tail: 1080 }); g.save(); g.globalAlpha = ba; for (let k = 0; k < 3; k++) { dot(g, 1105 + k * 40, 165, 9, (s * 3 + k * .3) % 1 < .5 ? '#888' : '#BBB'); } g.restore(); }
  }
}

/* ================= 第 7 句：我在原地喊了又喊（15.55 → 17.4） ================= */
function sShout(g, s) {
  bgPaper(g);
  const t1 = ct(6, 4), t2 = ct(6, 7);
  const U = 22, cx = 960, fy = 860;
  // 原地：脚下的红色定位圈
  g.save(); g.strokeStyle = C.red; g.lineWidth = 6; g.setLineDash([16, 12]); g.lineDashOffset = s * 30;
  ell(g, cx, fy, 210, 34); g.stroke(); g.setLineDash([]); g.restore();
  pill(g, cx + 250, fy + 6, '原地', 30, { k: 'bold', fill: C.red, col: '#fff', alpha: seg(s, ct(6, 2), ct(6, 2) + .1) });
  // 声波
  for (const [t0, dir] of [[t1, 1], [t2, -1]]) {
    if (s < t0) continue;
    for (let k = 0; k < 4; k++) {
      const age = s - t0 - k * .09; if (age < 0 || age > .9) continue;
      const r = 120 + age * 900;
      g.save(); g.globalAlpha = (1 - age / .9) * .7; g.strokeStyle = C.ink; g.lineWidth = 10 * (1 - age / .9) + 2;
      g.beginPath(); g.arc(cx + dir * 100, fy - 5 * U, r, dir > 0 ? -.7 : Math.PI - .7, dir > 0 ? .7 : Math.PI + .7); g.stroke(); g.restore();
    }
  }
  const shouting = (s > t1 - .05 && s < t1 + .45) || (s > t2 - .05 && s < t2 + .6);
  const dir = s > t2 - .05 ? -1 : 1;
  clawd(g, cx, fy, U, { t: s, eyes: shouting ? 'shout' : s > t1 ? 'sad' : 'look', look: [dir * .3, -.2], flip: dir < 0, sq: shouting ? -.1 + .08 * Math.sin(s * 40) : bob(s) * .05,
    armL: shouting ? 1 : 0, armR: shouting ? 1 : 0, sweat: s > t2 ? 1 : 0 });
  // 歌词
  lyricRow(g, s, 6, 0, 4, 200, 190, 150, { light: true, col: C.ink });
  // 第一声"喊"往右飞，带回声
  for (let e = 3; e >= 0; e--) {
    const tt = t1 + e * .07;
    glyph(g, s, tt, '喊', 1470 + e * 110, 470 - e * 18, 300 - e * 60, { col: e ? `rgba(20,20,24,${.35 - e * .08})` : C.ink, ext: e ? 0 : 14, extCol: C.clawd, out: e ? [tt + .5, .3] : null });
  }
  lyricRow(g, s, 6, 5, 7, 1240, 760, 110, { light: true, col: '#555' });
  for (let e = 3; e >= 0; e--) {
    const tt = t2 + e * .07;
    glyph(g, s, tt, '喊', 470 - e * 120, 520 - e * 20, 360 - e * 70, { col: e ? `rgba(20,20,24,${.35 - e * .08})` : C.red, ext: e ? 0 : 16, extCol: '#5A1414', out: e ? [tt + .5, .3] : null });
  }
  // Claude Code 的系统通知（它真的会这样喊你）
  if (s > t1) {
    const u = E.out(seg(s, t1, t1 + .3));
    const nx = lerp(1940, 1400, u), ny = 120;
    g.save(); rr(g, nx, ny - 48, 470, 96, 18); g.fillStyle = 'rgba(28,28,32,.94)'; g.fill();
    clawd(g, nx + 50, ny + 22, 4.2, { shadow: false, t: s });
    mono(g, 'Claude Code', nx + 100, ny - 16, 24, '#F2F0EA');
    g.font = F(24, 'med'); g.fillStyle = 'rgba(240,240,240,.7)'; g.textBaseline = 'middle'; g.fillText('你还在吗？需要你回复一下', nx + 100, ny + 18);
    g.restore();
  }
}

/* ================= 第 8 句：你不回头（17.4 → 18.3） ================= */
function sNoLook(g, s) {
  bgInk(g);
  const u = seg(s, 17.35, 18.4);
  const sc = lerp(30, 9, E.io(u));
  const px = lerp(1180, 1300, u), py = lerp(250, 380, E.io(u));
  // 地面上的影子
  g.save(); g.globalAlpha = .4; g.fillStyle = '#000'; ell(g, px + sc * 5, 900, sc * 7, sc * 1.2); g.fill(); g.restore();
  cursor(g, px, py, sc);
  lyricRow(g, s, 7, 0, 4, 230, 500, 210, { each: i => i >= 2 ? { rot: s < ct(7, i) + .25 ? (1 - E.out(seg(s, ct(7, i), ct(7, i) + .25))) * (i === 2 ? -.3 : .3) : 0 } : i === 0 ? { ext: 10, extCol: '#16224A' } : {} });
  clawd(g, 260, 900, 10, { t: s, eyes: 'sad', look: [.3, -.3] });
  // 一句很小的"回头看看我"
  if (s > ct(7, 1)) { g.save(); g.globalAlpha = seg(s, ct(7, 1), ct(7, 1) + .15) * .8; g.font = F(30, 'med'); g.fillStyle = '#9AA0A8'; g.textAlign = 'left'; g.fillText('（回头看看我？）', 340, 800); g.restore(); }
}

/* ================= 第 9 句：仿佛就当我不存在（18.3 → 20.85） ================= */
function sGhost(g, s) {
  bgPaper(g);
  const tMe = ct(8, 4), tNo = ct(8, 5);
  const dis = E.io(seg(s, tMe + .1, 20.5)) * .97, gh = seg(s, tNo, 20.3);
  clawd(g, 560, 880, 30, { t: s, eyes: s < tMe ? 'look' : 'wide', look: [.2, 0], dissolve: dis, ghost: gh, seed: 3, shadow: dis < .5, sq: bob(s) * .03 });
  lyricRow(g, s, 8, 0, 4, 200, 190, 160, { light: true, col: C.ink });
  // "我"：先是实心的，唱到"不存在"变成虚线描边
  const k = seg(s, tNo, tNo + .35);
  glyph(g, s, tMe, '我', 1180, 470, 330, { col: C.meD, alpha: 1 - k, ext: 14, extCol: '#5A2A18' });
  if (k > 0) glyph(g, s, tNo, '我', 1180, 470, 330, { col: C.meD, hollow: 5, dash: [14, 10], style: 'type', alpha: k });
  lyricRow(g, s, 8, 5, 8, 1000, 790, 150, { light: true, col: C.ink, jit: 0, each: i => ({ jit: s > ct(8, i) ? 4 : 0 }) });
  if (s > 20.2) { const a = seg(s, 20.2, 20.35); pill(g, 1180, 905, '404 · 找不到「我」', 28, { fill: C.ink, col: '#F2F0EA', alpha: a, k: 'mono' }); }
}

/* ================= 第 10 句：我的故事里只有你（20.85 → 22.7） ================= */
function sMemory(g, s) {
  bgInk(g);
  const x = 1000, y = 170, w = 800, h = 760;
  windowFrame(g, x, y, w, h, 'CLAUDE.md');
  const items = ['# 记忆', '- 你喜欢深色模式', '- 你不吃香菜', '- 你说晚安要说三遍', '- 你'];
  const tts = [20.9, ct(9, 1), ct(9, 3), ct(9, 5), ct(9, 7)];
  items.forEach((it, i) => { if (s > tts[i]) { g.save(); g.globalAlpha = seg(s, tts[i], tts[i] + .1); mono(g, it, x + 50, y + 130 + i * 70, 36, i === 0 ? '#E6B98A' : '#D8D6D0', { k: i ? 'monoR' : 'mono' }); g.restore(); } });
  // 唱到最后一个"你"，整页被"你"填满
  const fl = seg(s, ct(9, 7), ct(9, 7) + .45);
  if (fl > 0) {
    g.save(); g.beginPath(); g.rect(x + 20, y + 70, w - 40, h - 90); g.clip();
    g.font = F(46, 'black'); g.textAlign = 'center'; g.textBaseline = 'middle';
    for (let r = 0; r < 12; r++) for (let c = 0; c < 15; c++) {
      const d = (r * 15 + c) / 180; if (d > fl * 1.1) continue;
      g.fillStyle = `rgba(79,123,255,${.18 + .5 * hash(r, c, 2)})`;
      g.fillText('你', x + 50 + c * 52, y + 440 + r * 54 - (r > 5 ? 0 : 0));
    }
    g.restore();
  }
  lyricRow(g, s, 9, 0, 5, 200, 330, 150);
  lyricRow(g, s, 9, 5, 7, 200, 580, 150);
  glyph(g, s, ct(9, 7), '你', 560, 580, 260, { col: C.you, ext: 12, extCol: '#16224A' });
  clawd(g, 330, 935, 11, { t: s, eyes: s < ct(9, 6) ? 'happy' : 'heart', blush: .9, sq: bob(s) * .05, armL: .6, armR: .6 });
}

/* ================= 第 11 句：你却走得迫不及待（22.7 → 24.45） ================= */
function sRush(g, s) {
  bgColor(g, C.blue, 'rgba(255,255,255,.1)', -(s - 22.7) * 900, 0);
  speedLines(g, s, 'rgba(255,255,255,.55)', 22, -1, 120, 980, 5);
  // 指针一闪而过
  const u = seg(s, 22.8, 23.4);
  if (u > 0 && u < 1) {
    for (let k = 6; k >= 0; k--) cursor(g, lerp(-200, 2200, E.in(u)) - k * 60, 600, 9, { alpha: k ? .12 : 1, shadow: false });
  }
  lyricRow(g, s, 10, 0, 4, 220, 280, 170, { noDuo: false, each: i => i === 0 ? { col: '#FFE27A' } : {} });
  lyricRow(g, s, 10, 4, 8, 640, 560, 220, { dx: 300, skew: -.2, ext: 14, extCol: '#132A7A', style: 'slam', dur: .14 });
  // 退出进度条：一下子就满了
  const p = E.in(seg(s, ct(10, 4), ct(10, 7) + .05));
  const bx = 640, by = 760, bw = 900;
  g.save(); g.globalAlpha = seg(s, ct(10, 4) - .1, ct(10, 4));
  rr(g, bx, by, bw, 34, 17); g.fillStyle = 'rgba(255,255,255,.22)'; g.fill();
  rr(g, bx, by, Math.max(34, bw * p), 34, 17); g.fillStyle = '#fff'; g.fill();
  mono(g, `正在退出… ${Math.round(p * 100)}%`, bx, by + 70, 28, '#fff', { k: 'mono' });
  g.restore();
  clawd(g, 250, 930, 12, { t: s, eyes: 'closed', lean: .25 + .05 * Math.sin(s * 30), sq: -.04, tears: s });
}

/* ================= 第 12 句：剩下来的情节全是无奈（24.45 → 30.4） ================= */
/* 一条往左走的胶片，每一格都是 Clawd 摊手。唱完后格子一格格变成空白。 */
function filmFrame(g, x, y, w, h, n, s, blank) {
  rr(g, x, y, w, h, 6); g.fillStyle = blank ? '#F6F5F1' : '#2A2B31'; g.fill();
  if (!blank) {
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.fillStyle = '#34363E'; g.fillRect(x, y + h * .72, w, h * .28);
    clawd(g, x + w / 2, y + h * .78, 13, { t: s + n, eyes: 'flat', armL: 1, armR: 1, shadow: true, sq: Math.sin(s * 4 + n) * .02 });
    mono(g, `第 ${n} 幕`, x + 18, y + 26, 22, 'rgba(255,255,255,.5)', { k: 'monoR' });
    g.restore();
  }
}
function sFilm(g, s) {
  bgInk(g, 0, 0, '#141416');
  const FW = 380, FH = 270, GAP = 40, y0 = 520;
  const speed = s < 28.6 ? 260 : lerp(260, 60, seg(s, 28.6, 29.8));
  const off = (s - 24.45) * 260 - Math.max(0, s - 28.6) * 0;
  // 胶片底
  const sy = y0 - 46, sh = FH + 92;
  g.fillStyle = '#0B0B0D'; g.fillRect(0, sy, W, sh);
  for (let i = -1; i < 30; i++) {
    const hx = ((i * 60 - off) % (W + 120) + W + 120) % (W + 120) - 60;
    rr(g, hx, sy + 12, 32, 20, 4); g.fillStyle = '#2C2C30'; g.fill();
    rr(g, hx, sy + sh - 32, 32, 20, 4); g.fill();
  }
  const blankFrom = 28.5;
  for (let i = 0; i < 12; i++) {
    const fx = 200 + i * (FW + GAP) - off;
    if (fx < -FW - 20 || fx > W + 20) continue;
    const n = i + 2;
    const blank = s > blankFrom + (fx - 0) / 1600;          // 从左到右一格格变白
    filmFrame(g, fx, y0, FW, FH, n, s, blank);
  }
  // 歌词
  lyricRow(g, s, 11, 0, 6, 200, 220, 140);
  lyricRow(g, s, 11, 6, 8, 1150, 220, 140, { col: '#BFC3CA' });
  lyricRow(g, s, 11, 8, 10, 660, 660, 300, { ext: 18, extCol: '#000', each: () => ({ col: C.white }) });
  // 最后推进到一格空白里
  const z = E.in(seg(s, 29.85, 30.4));
  if (z > 0) { g.fillStyle = `rgba(246,245,241,${z})`; g.fillRect(0, 0, W, H); }
}

/* ================= 第 13 句：竟是空白（30.4 → 34.35） ================= */
function sBlank(g, s) {
  g.fillStyle = '#F6F5F1'; g.fillRect(0, 0, W, H);
  dotGrid(g, 'rgba(0,0,0,.035)', 44, 1.6);
  glyph(g, s, ct(12, 0), '竟', 900, 380, 100, { style: 'rise', col: '#A8A6A0', k: 'bold' });
  glyph(g, s, ct(12, 1), '是', 1020, 380, 100, { style: 'rise', col: '#A8A6A0', k: 'bold' });
  const fadeK = 1 - seg(s, 32.7, 33.5);
  glyph(g, s, ct(12, 2), '空', 770, 610, 340, { style: 'rise', col: '#B9B6AE', hollow: 5, alpha: fadeK });
  glyph(g, s, ct(12, 3), '白', 1150, 610, 340, { style: 'rise', col: '#B9B6AE', hollow: 5, alpha: fadeK });
  // 字散掉以后只剩一个闪烁的光标
  if (s > 33.2) { const a = seg(s, 33.2, 33.4); if ((s * 1.9) % 1 < .55) { g.fillStyle = `rgba(40,40,40,${a})`; g.fillRect(956, 560, 8, 96); } }
  clawd(g, 1640, 930, 8, { t: s, eyes: s < 32 ? 'dot' : 'closed', look: [-.3, .2], sq: bob(s) * .03 });
}
