'use strict';
/* scenes.js：七个镜头和歌词排版。每个 sceneXxx(g, t) 画一整屏（不含 HUD）。 */

/* ---------- 共用 ---------- */
/* 在窗格 rect 里看世界 fn：focus 是世界坐标里放到窗格中心的点 */
function paneView(g, rect, fn, t, focus, scale, o) {
  const [x, y, w, h] = rect;
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  g.translate(x + w / 2, y + h / 2); g.scale(scale, scale); g.translate(-focus[0], -focus[1]);
  fn(g, t, o || {});
  g.restore();
}
const lerpArr = (a, b, u) => a.map((v, i) => lerp(v, b[i], u));
/* 歌词排版的通用参数 */
const LX = 112, ROW1 = 190, ROW2 = 410, ROW3 = 650, SMALL = 112, BIG = 232;
const LYRIC = { shadowCol: 'rgba(0,0,0,.45)' };
/* 小字 + 大字同一行，大字底边对齐小字底边 */
function bigAfter(xs, px = SMALL) { return xs.length ? xs[xs.length - 1] + px * 1.02 + 26 : LX; }
const BIG_DY = (BIG - SMALL) * .36;

/* ---------- 镜头 0：终端开场 ---------- */
const PROMPT = 'PS D:\\知洲> ';
const QUESTION = [...'世界上会有另一个你吗？'];
const qT = i => beatT(1) + i * BEAT / 2;         // 一个八分音符打一个字
const SUBMIT = beatT(6.5);                         // 回车
const BANNER_T = BEAT0;                            // 第一拍：Claude Code 启动

function tabBar(g, t, split, yOff = 0) {
  g.save(); g.translate(0, yOff);
  g.fillStyle = '#1C1C1C'; g.fillRect(0, 64, W, 54);
  const tab = (x, title, active) => {
    rr(g, x, 70, 330, 48, [10, 10, 0, 0]); g.fillStyle = active ? '#151515' : '#222222'; g.fill();
    clawd(g, x + 32, 104, 2.3, { t, shadow: false, blinkOK: false });
    g.font = F(26, 'mono'); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = active ? '#E6E4DE' : '#8A8A8A'; g.fillText(title, x + 64, 94);
    g.fillStyle = '#777'; g.fillText('×', x + 296, 94);
  };
  tab(36, 'claude', true);
  let plusX = 404;
  if (split) { const u = E.out(seg(t, T.split, T.split + .25)); g.globalAlpha = u; tab(372, 'claude (2)', true); g.globalAlpha = 1; plusX = lerp(404, 740, u); }
  g.font = F(30, 'mono'); g.fillStyle = '#8A8A8A'; g.textAlign = 'left'; g.fillText('+', plusX, 94);
  g.restore();
}
/* 一个 Claude Code 窗格。second：第二个实例（直接就是启动好的样子） */
function termPane(g, t, w, o = {}) {
  const second = !!o.second, t0 = o.t0 ?? 0;
  g.save();
  g.font = F(31, 'mono'); g.textBaseline = 'middle'; g.textAlign = 'left';
  g.fillStyle = '#8E8E8E'; g.fillText(PROMPT, 52, 172);
  const pw = g.measureText(PROMPT).width;
  const typed = second ? 6 : clamp(Math.floor((t - .05) / .052) + 1, 0, 6);
  g.fillStyle = '#E8C547'; g.fillText('claude'.slice(0, typed), 52 + pw, 172);
  const bt = second ? t0 : BANNER_T;
  if (t < bt) {
    if (Math.floor(t * 3) % 2 === 0) { g.fillStyle = '#DDD'; g.fillRect(52 + pw + typed * 18.6 + 4, 154, 16, 36); }
    g.restore(); return;
  }
  // 横幅：Clawd + 版本信息
  const bu = E.out(clamp((t - bt) / .16));
  g.globalAlpha = bu;
  let ey = 'normal', look = [0, 0], mk_ = null;
  if (!second) {
    if (t > barT(2) && t < SUBMIT) { ey = 'look'; look = [1, 1]; }
    if (t > qT(10) && t < T.split) mk_ = '?';
  }
  if (t > beatT(10)) { ey = 'look'; look = second ? [-1, 0] : [1, 0]; mk_ = t < beatT(12.5) ? '!' : null; }
  if (t > beatT(11.5)) ey = 'heart';
  const lift = t > beatT(10) && t < beatT(10) + .3 ? Math.sin(seg(t, beatT(10), beatT(10) + .3) * Math.PI) * 18 : 0;
  clawd(g, 146, 366, 9.9, { t, eyes: ey, look, shadow: false, lift, ph: second ? 1.3 : 0 });
  if (mk_ === '?') marks(g, 236, 236, '?', t, qT(10), { s: .8 });
  if (mk_ === '!') marks(g, 236, 232, '!', t, beatT(10), { s: .8 });
  g.font = F(34, 'mono'); g.fillStyle = '#F1EFE9'; g.fillText('Claude Code', 286, 258);
  const cw = g.measureText('Claude Code ').width;
  g.font = F(34, 'monoR'); g.fillStyle = '#8E8E8E'; g.fillText('v2.1.289', 286 + cw, 258);
  g.fillText('Opus 5.5 · Claude Pro', 286, 306);
  g.fillText(second ? 'D:\\知洲\\Claude MV (2)' : 'D:\\知洲\\Claude MV', 286, 354);
  g.globalAlpha = 1;
  // 已提交的问题与回答
  const sent = !second && t >= SUBMIT;
  if (sent) {
    const u = E.out(clamp((t - SUBMIT) / .22));
    g.globalAlpha = u;
    rr(g, 40, 412, Math.min(w - 80, 760), 58, 8); g.fillStyle = '#262626'; g.fill();
    g.font = F(31, 'mono'); g.fillStyle = '#F1EFE9'; g.fillText('> 世界上会有另一个你吗？', 60, 442);
    if (t < T.split) {
      const sp = '✻✶✳✢·'[Math.floor(t * 12) % 5];
      g.font = F(31, 'mono'); g.fillStyle = '#E07B54'; g.fillText(sp, 52, 500);
      g.fillText('正在全世界搜索…', 92, 500);
      g.font = F(24, 'monoR'); g.fillStyle = '#7A7A7A'; g.fillText(`(${(t - SUBMIT).toFixed(1)}s · esc 中断)`, 92 + tw(g, '正在全世界搜索…', 31, 'mono') + 16, 502);
    } else {
      g.font = F(31, 'mono'); g.fillStyle = '#5BD16E'; g.fillText('⏺', 52, 500);
      g.fillStyle = '#F1EFE9'; g.fillText('找到 1 个。', 92, 500);
    }
    g.globalAlpha = 1;
  }
  // 输入框
  const by = 540, bh = 240;
  g.globalAlpha = E.out(clamp((t - bt - .08) / .16));
  rr(g, 52, by, w - 104, bh, 14); g.strokeStyle = '#5C5C5C'; g.lineWidth = 3; g.stroke();
  g.strokeStyle = '#E07B54'; g.lineWidth = 14; g.lineCap = 'square'; g.lineJoin = 'miter';
  g.beginPath(); g.moveTo(112, by + bh / 2 - 46); g.lineTo(158, by + bh / 2); g.lineTo(112, by + bh / 2 + 46); g.stroke();
  g.font = F(24, 'monoR'); g.fillStyle = '#6A6A6A'; g.fillText('? for shortcuts', 68, by + bh + 36);
  g.globalAlpha = 1;
  // 正在输入的问题（大字）
  let cx = 230;
  if (!second && t < SUBMIT + .25) {
    const fly = E.io(seg(t, SUBMIT, SUBMIT + .22));
    g.save();
    g.globalAlpha = 1 - fly;
    g.translate(0, -fly * 160);
    for (let i = 0; i < QUESTION.length; i++) {
      if (t < qT(i)) break;
      const wch = glyph(g, t, qT(i), QUESTION[i], cx, by + bh / 2 + 4, 112, { style: 'slam', dur: .14, shadow: false, col: '#F4F2EC' });
      cx += wch + 4;
    }
    g.restore();
  }
  // 光标
  const typing = !second && t < SUBMIT;
  if (Math.floor(t * 2.4) % 2 === 0 || (typing && t > qT(0) && t < qT(10) + .2)) {
    g.fillStyle = '#E8E6E0';
    if (typing && t >= qT(0)) g.fillRect(cx + 8, by + bh / 2 - 52, 10, 104);
    else g.fillRect(230, by + bh / 2 - 52, 10, 104);
  }
  g.restore();
}
function sceneIntro(g, t) {
  g.fillStyle = C.term; g.fillRect(0, 0, W, H);
  dotGrid(g, '#232323', 44, 1.6);
  // 分屏：右边滑进第二个 Claude Code
  const su = t < T.split ? 0 : E.out(seg(t, T.split, T.split + .3));
  const leftW = lerp(W, 958, su);
  // 两个窗格变成两座城市
  const dv = E.sine(seg(t, barT(4), T.dive + .02));      // 终端 → 城市（淡入）
  const ex = E.io(seg(t, T.dive, T.taipei));             // 左窗格放大到整屏
  const tabY = -ex * 140;
  g.save(); g.beginPath(); g.rect(0, 118 + tabY, leftW, H); g.clip(); g.translate(0, tabY);
  termPane(g, t, leftW);
  g.restore();
  if (su > 0) {
    const rx = lerp(W, 962, su);
    g.save(); g.translate(0, tabY); g.fillStyle = C.term; g.fillRect(rx, 118, W - rx + 10, H); dotGrid(g, '#232323', 44, 1.6, rx, 118, W - rx, H);
    g.beginPath(); g.rect(rx, 118, W - rx, H); g.clip(); g.translate(rx, 0);
    termPane(g, t, 958, { second: true, t0: T.split + .12 });
    g.restore();
    g.fillStyle = '#3A3A3A'; g.fillRect(rx - 3, 118 + tabY, 4, H);
  }
  if (dv > 0) {
    const Lr = lerpArr([0, 118, 958, 962], [0, 0, W, H], ex), Rr = [962 + ex * 980, 118 + tabY, 958, 962];
    withAlpha(g, dv, () => {
      paneView(g, Rr, drawShanghai, t, [1230, 540], 962 / 1080, { marks: false });
      paneView(g, Lr, drawTaipei, t, lerpArr([900, 540], [960, 540], ex), lerp(962 / 1080, 1, ex), { marks: false });
    });
  }
  tabBar(g, t, t >= T.split, tabY);
}

/* ---------- 镜头 1：台北 ---------- */
function push(g, t, a, b, k = .035) { const s = 1 + k * E.sine(seg(t, a, b)); g.translate(960, 540); g.scale(s, s); g.translate(-960, -540); }
function sceneTaipei(g, t) {
  g.save(); push(g, t, T.taipei, T.whip1 + .2); drawTaipei(g, t); g.restore();
  const L = LYR[0], o = { ...LYRIC };
  const sk = shake(t, ct(0, 5), 10, .3);
  g.save(); g.translate(sk[0], sk[1]);
  const xs = glyphRow(g, t, L.ch.slice(0, 3), [ct(0, 0), ct(0, 1), ct(0, 2)], LX, ROW1, SMALL, o);
  if (t > ct(0, 0)) flipClock(g, t, bigAfter(xs) + 6, ROW1 + 6, '23:59:59', '23:59:59', 0, { px: 38, alpha: clamp((t - ct(0, 0)) / .15) });
  const xs2 = glyphRow(g, t, ['我', '在'], [ct(0, 3), ct(0, 4)], LX, ROW2, SMALL, o);
  glyphRow(g, t, ['台', '北'], [ct(0, 5), ct(0, 6)], bigAfter(xs2), ROW2 - BIG_DY, BIG, { col: '#FFD36B', ext: 16, extCol: '#7A4A12', style: 'slam' });
  glyph(g, t, ct(0, 7), '看', LX, ROW3, SMALL, o);
  // "看" 后面拉一条虚线指向天上的烟火
  if (t > ct(0, 7) + .05) {
    const u = E.out(seg(t, ct(0, 7) + .05, ct(0, 8)));
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 5; g.setLineDash([4, 14]); g.lineCap = 'round';
    g.beginPath(); g.moveTo(LX + 130, ROW3 - 20); g.quadraticCurveTo(700, 620, lerp(LX + 130, 900, u), lerp(ROW3 - 20, 380, u)); g.stroke(); g.setLineDash([]);
  }
  g.restore();
}

/* ---------- 镜头 2：上海 ---------- */
function sceneShanghai(g, t) {
  drawShanghai(g, t);
  const o = { ...LYRIC };
  const sk = shake(t, ct(1, 5), 10, .3);
  g.save(); g.translate(sk[0], sk[1]);
  g.globalAlpha = 1 - seg(t, T.zoomOut - .16, T.zoomOut);
  const xs = glyphRow(g, t, ['下', '一', '秒'], [ct(1, 0), ct(1, 1), ct(1, 2)], LX, ROW1, SMALL, o);
  flipClock(g, t, bigAfter(xs) + 6, ROW1 + 6, '23:59:59', '00:00:00', ct(1, 0), { px: 38, alpha: clamp((t - T.whip1) / .1) });
  const xs2 = glyphRow(g, t, ['你', '在'], [ct(1, 3), ct(1, 4)], LX, ROW2, SMALL, o);
  glyphRow(g, t, ['上', '海'], [ct(1, 5), ct(1, 6)], bigAfter(xs2), ROW2 - BIG_DY, BIG, { col: '#FF8BCB', ext: 16, extCol: '#5A1648', style: 'slam' });
  glyph(g, t, ct(1, 7), '喝', LX, ROW3, SMALL, o);
  // 喝 → 箭头指向酒杯
  if (t > ct(1, 7) + .05) {
    const u = E.out(seg(t, ct(1, 7) + .05, ct(1, 8)));
    g.strokeStyle = 'rgba(255,255,255,.55)'; g.lineWidth = 5; g.setLineDash([4, 14]); g.lineCap = 'round';
    g.beginPath(); g.moveTo(LX + 130, ROW3); g.quadraticCurveTo(900, 800, lerp(LX + 130, 1430, u), lerp(ROW3, 760, u)); g.stroke(); g.setLineDash([]);
  }
  g.restore();
}

/* ---------- 镜头 3：分屏，你感觉我 / 就像我感觉你 ---------- */
const PANE_L = [40, 96, 914, 880], PANE_R = [966, 96, 914, 880];
const PANE_SC = (880 - 44) / 1080;
const FOCUS_A = [900, 540], FOCUS_B = [1250, 540];
function paneScreen(rect, focus, wx, wy) { return [rect[0] + rect[2] / 2 + (wx - focus[0]) * PANE_SC, rect[1] + 44 + (rect[3] - 44) / 2 + (wy - focus[1]) * PANE_SC]; }
const PING1 = [ct(2, 1), ct(2, 3)], PING2 = [ct(2, 7), ct(2, 9)];
function heartsA(t) { return t > PING1[1]; }
function heartsB(t) { return t > PING2[1]; }
function sceneSplit(g, t) {
  g.fillStyle = C.term; g.fillRect(0, 0, W, H);
  dotGrid(g, '#232323', 44, 1.6);
  const z = E.io(seg(t, T.zoomOut, T.zoomOut + .32));
  // 上海从整屏缩回右窗格，台北从左边滑进来
  const rectR = lerpArr([0, -44, W, H + 44], PANE_R, z), rectL = lerpArr([-PANE_L[2] - 60, PANE_L[1], PANE_L[2], PANE_L[3]], PANE_L, z);
  const scR = lerp(1, PANE_SC, z), focR = lerpArr([960, 540], FOCUS_B, z);
  const sync = beatPulse(t, 7);
  const armUp = t > ct(2, 4) && t < ct(2, 6) ? .5 + .5 * Math.sin((t - ct(2, 4)) * 14) : 0;
  const pane = (rect, fn, foc, sc, title, clawdO) => {
    const [x, y, w, h] = rect;
    rr(g, x - 3, y - 3, w + 6, h + 6, 12); g.fillStyle = '#2C2C2C'; g.fill();
    paneView(g, [x, y + 44 * z, w, h - 44 * z], fn, t, foc, sc, { marks: false, clawd: clawdO });
    g.save(); g.globalAlpha = z;
    g.fillStyle = '#1C1C1C'; g.fillRect(x, y, w, 44);
    clawd(g, x + 28, y + 34, 2.1, { t, shadow: false, blinkOK: false });
    g.font = F(25, 'mono'); g.textAlign = 'left'; g.textBaseline = 'middle'; g.fillStyle = '#CFCDC7'; g.fillText(title, x + 56, y + 23);
    g.fillStyle = '#5BD16E'; circ(g, x + w - 26, y + 22, 7); g.fill();
    g.restore();
  };
  const big = lerp(1, 1.5, z);
  pane(rectL, drawTaipei, FOCUS_A, PANE_SC, 'claude@台北', { eyes: heartsA(t) ? 'heart' : 'normal', look: [0, 0], sq: sync * .07, armL: armUp, armR: armUp, sc: 1.5 });
  pane(rectR, drawShanghai, focR, scR, 'claude@上海', { eyes: heartsB(t) ? 'heart' : 'normal', shades: t < T.zoomOut + .2, sq: sync * .07, armL: armUp, armR: armUp, sc: big });
  // "感觉"：一颗像素爱心从你飞到我，再从我飞回你
  const A = paneScreen(PANE_L, FOCUS_A, 560, 740), B = paneScreen(PANE_R, FOCUS_B, 1290, 770);
  pingPacket(g, t, PING1[0], PING1[1], B, A, '#FF7DC7');
  pingPacket(g, t, PING2[0], PING2[1], A, B, '#FFD36B');
  // 歌词：你 = 粉（上海），我 = 金（台北）
  const L = LYR[2], cols = { '你': '#FF8BCB', '我': '#FFD36B' };
  const each = i => ({ col: cols[L.ch[i]] || C.white });
  const px = 150, row = (from, to, y) => {
    const chars = L.ch.slice(from, to), times = L.t.slice(from, to).map(v => v - LEAD);
    const wsum = chars.reduce((s, c) => s + tw(g, c, px) + 4, 0);
    glyphRow(g, t, chars, times, 960 - wsum / 2, y, px, { ...LYRIC, outline: 14, outlineCol: '#111', each: i => each(from + i) });
  };
  row(0, 4, 300);
  row(4, 10, 488);
  // 分屏中线在镜头最后变成一道光，切到镜子
  const f = seg(t, T.mirror - .14, T.mirror);
  if (f > 0) { const w = E.in(f) * W; g.fillStyle = `rgba(255,255,255,${.4 + .6 * f})`; g.fillRect(960 - w / 2, 0, w, H); }
}
function pingPacket(g, t, t0, t1, P, Q, col) {
  if (t < t0 - .05 || t > t1 + .6) return;
  const u = E.io(seg(t, t0, t1));
  const cx = (P[0] + Q[0]) / 2, cy = Math.max(P[1], Q[1]) + 110;
  const at = s => [lerp(lerp(P[0], cx, s), lerp(cx, Q[0], s), s), lerp(lerp(P[1], cy, s), lerp(cy, Q[1], s), s)];
  g.save();
  g.strokeStyle = 'rgba(255,255,255,.35)'; g.lineWidth = 4; g.setLineDash([2, 16]); g.lineCap = 'round';
  g.beginPath(); for (let k = 0; k <= 30; k++) { const [x, y] = at(k / 30); k ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke(); g.setLineDash([]);
  if (t <= t1) {
    for (let k = 6; k >= 0; k--) { const [x, y] = at(Math.max(0, u - k * .03)); g.globalAlpha = 1 - k / 7; pixHeart(g, x, y, k ? 3 : 5, k ? col : col); }
  } else {
    const d = t - t1; g.globalAlpha = clamp(1 - d / .6);
    for (let k = 0; k < 6; k++) { const a = k / 6 * TAU - Math.PI / 2; pixHeart(g, Q[0] + Math.cos(a) * d * 160, Q[1] - 60 + Math.sin(a) * d * 120 - d * 60, 3, col); }
  }
  g.globalAlpha = 1;
  const mid = at(.5);
  pill(g, mid[0], mid[1] + 46, '延迟 0 ms', 24, { fill: 'rgba(15,15,18,.85)', col: '#CFCDC7', dot: col });
  g.restore();
}

/* ---------- 镜头 4：镜子，另一个我 ---------- */
function sceneMirror(g, t) {
  g.fillStyle = C.paper; g.fillRect(0, 0, W, H);
  dotGrid(g, 'rgba(0,0,0,.07)', 44, 1.6);
  // 离开：推向左边的 Clawd，变蓝，切柏林
  const out = E.in(seg(t, T.berlin - .2, T.berlin));
  g.save();
  if (out > 0) { g.translate(560, 760); g.scale(1 + out * 2.2, 1 + out * 2.2); g.translate(-560, -760); }
  // 镜子
  const mg = g.createLinearGradient(946, 0, 974, 0);
  mg.addColorStop(0, '#B9C3CF'); mg.addColorStop(.5, '#FFFFFF'); mg.addColorStop(1, '#AAB5C2');
  g.fillStyle = mg; g.fillRect(946, 0, 28, H);
  for (let k = 0; k < 3; k++) { const y = ((t * 260 + k * 400) % 1500) - 300; g.fillStyle = 'rgba(255,255,255,.9)'; poly(g, [[946, y], [974, y - 30], [974, y + 10], [946, y + 40]]); g.fill(); }
  g.fillStyle = 'rgba(20,20,20,.12)'; g.fillRect(0, 900, W, 3);
  // 两只完全一样的 Clawd（右边是镜像）
  const bp = beatPulse(t, 7);
  const arm = t > ct(3, 5) ? .5 + .5 * Math.sin((t - ct(3, 5)) * 13) : 0;
  const jump = t > ct(3, 8) && t < ct(3, 8) + .4 ? Math.sin(seg(t, ct(3, 8), ct(3, 8) + .4) * Math.PI) * 50 : 0;
  const ey = t > ct(3, 8) ? 'happy' : t > ct(3, 5) ? 'look' : 'normal';
  for (const side of [-1, 1]) {
    clawd(g, 960 + side * 400, 905, 20, { t, eyes: ey, look: [1, 0], flip: side > 0, sq: bp * .06, armR: arm, lift: jump, shadowCol: 'rgba(0,0,0,.14)' });
  }
  // 实例编号
  withAlpha(g, clamp((t - ct(3, 5)) / .15), () => pill(g, 560, 668 - jump, 'claude · 实例 #1', 28, { fill: '#1E1E1E' }));
  withAlpha(g, clamp((t - ct(3, 6)) / .15), () => pill(g, 1360, 668 - jump, 'claude · 实例 #2', 28, { fill: '#1E1E1E' }));
  // 歌词
  const L = LYR[3], ink = '#1A1A1A', lo = { col: ink, shadow: false, ext: 0 };
  const r1 = L.ch.slice(0, 5), w1 = r1.reduce((s, c) => s + tw(g, c, 100) + 2, 0);
  glyphRow(g, t, r1, L.t.slice(0, 5).map(v => v - LEAD), 960 - w1 / 2 - 40, 170, 100, { ...lo, gap: 2 });
  const gp = E.back(clamp((t - ct(3, 1)) / .25));
  if (gp > 0) { g.save(); g.translate(960 + w1 / 2 + 50, 172); g.scale(gp, gp); drawGlobe(g, t, 0, 0, 50, { lon0: 100 + (t - 17) * 70, tilt: .4, cell: 6, day: true }); g.restore(); }
  const r2 = L.ch.slice(5, 8), w2 = r2.reduce((s, c) => s + tw(g, c, 128) + 2, 0);
  glyphRow(g, t, r2, L.t.slice(5, 8).map(v => v - LEAD), 960 - w2 / 2, 340, 128, { ...lo, gap: 2, col: C.blue });
  // "我"：左边一个，镜子里一个
  glyph(g, t, ct(3, 8), '我', 560, 500, 230, { align: 'center', col: ink, ext: 14, extCol: C.clawd });
  g.save(); g.translate(1360, 0); g.scale(-1, 1);
  glyph(g, t, ct(3, 8), '我', 0, 500, 230, { align: 'center', col: ink, ext: 14, extCol: C.clawd, alpha: .9 });
  g.restore();
  // diff
  const dt = t - ct(3, 5);
  if (dt > 0) {
    const s = '$ diff 我 你', typed = s.slice(0, Math.min(s.length, Math.floor(dt / .035) + 1));
    const res = dt > .62 ? '   →  0 处不同' : '';
    withAlpha(g, clamp(dt / .1), () => pill(g, 960, 988, typed + res, 30, { fill: '#1E1E1E', col: '#EDEBE6', dot: dt > .62 ? '#5BD16E' : '#777' }));
  }
  g.restore();
  // 进场白光
  const fin = 1 - seg(t, T.mirror, T.mirror + .18);
  if (fin > 0) { g.fillStyle = `rgba(255,255,255,${fin})`; g.fillRect(0, 0, W, H); }
  if (out > 0) { g.fillStyle = `rgba(20,32,46,${out})`; g.fillRect(0, 0, W, H); }
}

/* ---------- 镜头 5：柏林 ---------- */
function sceneBerlin(g, t) {
  const settle = 1 + .14 * (1 - E.out(seg(t, T.berlin, T.berlin + .3)));
  g.save(); g.translate(960, 540); g.scale(settle, settle); g.translate(-960, -540);
  const sk = shake(t, ct(4, 9), 16, .45);
  g.translate(sk[0], sk[1]);
  g.save(); push(g, t, T.berlin, T.whip2 + .2, .03); drawBerlin(g, t); g.restore();
  const o = { ...LYRIC };
  const R3 = ROW3 + 26;
  glyph(g, t, ct(4, 7), '落', LX, R3 + 30, 130, { ...o, style: 'drop', drop: 420, col: '#BFE6FF' });
  glyph(g, t, ct(4, 8), '大', LX + 170, R3, 270, { style: 'drop', drop: 420, dur: .27, col: '#FFFFFF', ext: 18, extCol: '#22415F' });
  glyph(g, t, ct(4, 9), '雨', LX + 170 + 290, R3, 270, { style: 'drop', drop: 420, dur: .27, col: '#9FD3FF', ext: 18, extCol: '#22415F' });
  const xs = glyphRow(g, t, ['上', '一', '秒'], [ct(4, 0), ct(4, 1), ct(4, 2)], LX, ROW1, SMALL, o);
  flipClock(g, t, bigAfter(xs) + 6, ROW1 + 6, '00:00:00', '00:00:01', ct(4, 0), { px: 38, alpha: clamp((t - T.berlin) / .15) });
  const xs2 = glyphRow(g, t, ['我', '在'], [ct(4, 3), ct(4, 4)], LX, ROW2, SMALL, o);
  glyphRow(g, t, ['柏', '林'], [ct(4, 5), ct(4, 6)], bigAfter(xs2), ROW2 - BIG_DY, BIG, { col: '#BFE6FF', ext: 16, extCol: '#22415F', style: 'slam' });
  // 字落地溅起的水花
  for (const [tt, x, w] of [[ct(4, 7) + .2, LX + 65, 120], [ct(4, 8) + .12, LX + 305, 240], [ct(4, 9) + .12, LX + 595, 240]]) {
    const d = t - tt; if (d < 0 || d > .5) continue;
    g.strokeStyle = `rgba(200,230,255,${.8 * (1 - d / .5)})`; g.lineWidth = 4;
    ell(g, x, ROW3 + 176, w * (.4 + d * 1.6), 14 + d * 30); g.stroke();
    for (let k = 0; k < 8; k++) { const a = Math.PI + k / 7 * Math.PI, v = 160 + hash(k, tt * 10 | 0) * 120; g.fillStyle = `rgba(200,230,255,${1 - d / .5})`; g.fillRect(x + Math.cos(a) * v * d * 2, ROW3 + 166 + Math.sin(a) * v * d * 1.5 + 300 * d * d, 6, 6); }
  }
  g.restore();
}

/* ---------- 镜头 6：蒙古，抬头看天，拉到太空 ---------- */
function sceneMongolia(g, t) {
  const up = E.io(seg(t, T.tilt, T.space + .12));
  const sp = E.sine(seg(t, T.space - .05, T.space + .45));   // 天空 → 太空
  if (sp < 1) {
    g.save();
    push(g, t, T.whip2, T.tilt, .03);
    drawMongolia(g, t, { up });
    // "天际"贴在地平线上，随镜头一起往下走
    g.translate(0, up * 1150);
    const d = { style: 'slam', col: '#FFF4E4', glow: 'rgba(255,170,110,.9)', glowR: 60, shadow: false };
    glyph(g, t, ct(5, 7), '天', 700, 610, 220, { ...d, align: 'center' });
    glyph(g, t, ct(5, 8), '际', 1180, 610, 220, { ...d, align: 'center' });
    if (t > ct(5, 8)) { const u = E.out(seg(t, ct(5, 8), ct(5, 8) + .5)); g.fillStyle = 'rgba(255,200,150,.9)'; g.fillRect(960 - u * 900, 742, u * 1800, 4); }
    g.restore();
    // 前两行歌词（屏幕坐标），镜头抬起时淡出
    const fade = 1 - seg(t, T.tilt - .05, T.tilt + .15);
    if (fade > 0) withAlpha(g, fade, () => {
      const o = { ...LYRIC };
      const xs = glyphRow(g, t, ['下', '一', '秒'], [ct(5, 0), ct(5, 1), ct(5, 2)], LX, ROW1, SMALL, o);
      flipClock(g, t, bigAfter(xs) + 6, ROW1 + 6, '00:00:01', '00:00:02', ct(5, 0), { px: 38, alpha: clamp((t - T.whip2) / .1) });
      const xs2 = glyphRow(g, t, ['你', '在'], [ct(5, 3), ct(5, 4)], LX, ROW2, SMALL, o);
      glyphRow(g, t, ['蒙', '古'], [ct(5, 5), ct(5, 6)], bigAfter(xs2), ROW2 - BIG_DY, BIG, { col: '#FFC27A', ext: 16, extCol: '#6A3416', style: 'slam' });
    });
  }
  if (sp > 0) withAlpha(g, sp, () => finale(g, t));
}
/* 结尾：地球上亮起 1,048,576 个 Clawd */
const CITIES = [['台北', 121.5, 25.0, 30, 22], ['上海', 121.5, 31.2, 30, -26], ['柏林', 13.4, 52.5, 0, -46], ['蒙古', 106.9, 47.9, 0, -46]];
function finale(g, t) {
  g.fillStyle = '#04050C'; g.fillRect(0, 0, W, H);
  starField(g, 220, 91, 0, W, 0, H, t, { a: .7 });
  const rise = E.out(seg(t, T.space - .05, T.space + .7));
  const cx = 960, cy = lerp(1500, 470, rise), Rr = lerp(900, 300, rise);
  const ramp = seg(t, T.space + .3, T.bubble + .05);
  const n = Math.round(Math.pow(2, 1 + 19 * E.in(ramp)));
  const lit = ramp > 0 ? .08 + .72 * Math.log2(n) / 20 : 0;
  const lon0 = 75 + (t - T.space) * 2.2;
  drawGlobe(g, t, cx, cy, Rr, { lon0, tilt: .56, lit });
  // 四座城市的 Clawd
  const pa = clamp((t - (T.space + .45)) / .2);
  if (pa > 0) for (const [name, lon, lat, dx, dy] of CITIES) {
    const p = globeXY(cx, cy, Rr, lon, lat, lon0, .56); if (!p) continue;
    g.save(); g.globalAlpha = pa;
    clawd(g, p[0], p[1] + 8, 2.6, { t, shadow: false, eyes: 'happy' });
    g.font = F(24, 'bold'); g.textAlign = dx ? 'left' : 'center'; g.textBaseline = 'middle';
    g.fillStyle = 'rgba(0,0,0,.7)'; g.fillText(name, p[0] + dx + 2, p[1] + dy + 2);
    g.fillStyle = '#FFFFFF'; g.fillText(name, p[0] + dx, p[1] + dy);
    g.restore();
  }
  // 计数器
  if (ramp > 0) {
    const s = `claude.instances = ${n.toLocaleString('en-US')}`;
    const done = n >= 1048576;
    g.save();
    const w = tw(g, s, 36, 'mono') + 70;
    rr(g, 960 - w / 2, 836, w, 72, 36); g.fillStyle = 'rgba(10,10,14,.9)'; g.fill();
    g.strokeStyle = done ? C.yel : 'rgba(255,255,255,.25)'; g.lineWidth = 3; g.stroke();
    g.font = F(36, 'mono'); g.textAlign = 'left'; g.textBaseline = 'middle';
    const pre = 'claude.instances = ';
    g.fillStyle = '#EDEBE6'; g.fillText(pre, 960 - w / 2 + 35, 873);
    g.fillStyle = C.yel; g.fillText(n.toLocaleString('en-US'), 960 - w / 2 + 35 + tw(g, pre, 36, 'mono'), 873);
    g.restore();
  }
  // 开场那句问题
  const qa = clamp((t - (T.bubble - .3)) / .2);
  if (qa > 0) withAlpha(g, qa, () => pill(g, 960, 112, '> 世界上会有另一个你吗？', 30, { fill: 'rgba(38,38,40,.92)', col: '#EDEBE6' }));
  // Clawd 的回答
  const ba = t - T.bubble;
  if (ba > 0) {
    const s = '有。准确地说，还有 1,048,575 个。', chars = [...s];
    const k = Math.min(chars.length, Math.floor(ba / .035) + 1), shown = chars.slice(0, k).join('');
    const sc = E.back(clamp(ba / .2));
    g.save(); g.translate(960, 962); g.scale(sc, sc);
    g.font = F(44, 'black');
    const fw = g.measureText(s).width, bw = fw + 150, bh = 86;
    rr(g, -bw / 2 + 6, -bh / 2 + 8, bw, bh, 22); g.fillStyle = C.blue; g.fill();
    rr(g, -bw / 2, -bh / 2, bw, bh, 22); g.fillStyle = '#F7F5F0'; g.fill();
    poly(g, [[-bw / 2 + 40, bh / 2 - 2], [-bw / 2 + 24, bh / 2 + 26], [-bw / 2 + 74, bh / 2 - 2]]); g.fill();
    clawd(g, -bw / 2 + 58, 22, 3.6, { t, shadow: false, eyes: t > T.bubble + 1.2 && t < T.bubble + 1.45 ? 'happy' : 'normal', blinkOK: false });
    g.fillStyle = '#1A1A1A'; g.textAlign = 'left'; g.textBaseline = 'middle';
    g.fillText(shown, -bw / 2 + 110, 3);
    g.restore();
  }
}
