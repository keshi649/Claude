'use strict';
/* scenes2.js：改规则（金币全撤、往终点走一步 +1 → 在终点门口跳舞，原理 2）、
   看画面打分（拿球：挡在镜头和球中间，原理 3；2017 年的机械手）。 */

const FIN_W = [X.finish[0] * TILE + 16, X.finish[1] * TILE + 10];
const CAM_FIN = camOn(FIN_W[0] - 40, FIN_W[1] - 20, 6);
const RULES_V2 = t => [
  { s: '· 吃到金币 +1', strike: clamp((t - (CH('p1', 1) - .1)) / .3) },
  { s: '· 金币：{全撤了}', add: clamp((t - (CH('p1', 1) + .1)) / .25) },
  { s: '· 往终点走一步 {+1}', add: clamp((t - (CH('p1', 3) - .2)) / .25) },
  { s: '· 跑到终点 +10' },
];

/* 回放的时间表（画面和音效共用）：先跑到终点门口，停一拍，再开始来回跳 */
const T_DANCE = (() => {
  const rp = replayOf('shaping', 'shaping'), tRun = S('p2') - .1, sps = 5.2;
  const arrive = rp.path.findIndex(c => X.dist[c] <= 1);
  const tArrive = stepTime(tRun, sps, arrive);
  return { tRun, sps, arrive, tArrive, tDance: Math.max(tArrive + .5, S('p3') - .15) };
})();
const T_BALL = { t0: S('j3') - .2, sps: 3.2 };

/* ================= 改规则 → 门口跳舞 ================= */
function dance(g, t) {
  const rp = replayOf('shaping', 'shaping');
  const n = rp.path.length - 1;
  const { tRun, sps, arrive, tArrive, tDance } = T_DANCE;
  // 回放的时间轴：先跑到门口，停一下，再开始跳
  const tt = t < tArrive ? t : t < tDance ? tArrive : t - (tDance - tArrive);
  const camU = E.io(clamp((t - (tArrive - .9)) / 1.2));
  const cam = camLerp(CAM_FULL, CAM_FIN, camU);
  const coinsGone = clamp((t - (CH('p1', 1) + .1)) / .4);
  let r;
  parkView(g, t, cam, { coins: [1 - coinsGone, 1 - coinsGone, 1 - coinsGone], finishGlow: .5 + .5 * Math.sin(t * 6) }, b => {
    if (t < tRun) drawAgent(b, t, X.start[0], X.start[1], {});
    else r = agentReplay(b, tt, rp, tRun, sps, { loopFrom: arrive + 2, look: tt > tArrive ? { eyes: 'happy', mouth: 'smile' } : undefined });
  });
  // 金币消失的烟
  if (coinsGone > 0 && coinsGone < 1) RINGC.forEach(c => { const [x, y] = CELL[c]; const [sx, sy] = toScr(cam, x * TILE + 16, y * TILE + 14); withAlpha(g, 1 - coinsGone, () => { g.fillStyle = '#FFFFFF'; for (let k = 0; k < 6; k++) { const a = k * TAU / 6; g.fillRect(sx + Math.cos(a) * 40 * coinsGone - 5, sy + Math.sin(a) * 40 * coinsGone - 5, 10, 10); } }); });
  // "+1"
  if (t >= tRun) {
    const tl = t < tDance ? t : t;
    const upto = Math.min(n, Math.floor(((t < tArrive ? t : t < tDance ? tArrive : t - (tDance - tArrive)) - tRun) * sps));
    for (let i = Math.max(1, upto - 6); i <= upto; i++) {
      const st = rp.steps[i]; if (!st || !st.ev.includes('closer')) continue;
      const ti = stepTime(tRun, sps, i) + (i > arrive ? tDance - tArrive : 0);
      const [cx, cy] = CELL[rp.path[i]];
      const [sx, sy] = toScr(cam, cx * TILE + 16, cy * TILE + 2);
      floatText(g, tl, ti, sx, sy, '+1', { px: lerp(36, 52, camU), col: '#7CF0A0' });
    }
  }
  // 跳舞时头顶的音符；"差 1 步" 标签
  if (t > tDance) {
    const [ax, ay] = toScr(cam, r.x * TILE + 16, r.y * TILE - 10);
    for (let k = 0; k < 3; k++) {
      const ph = (t * .9 + k / 3) % 1;
      withAlpha(g, Math.sin(Math.PI * ph), () => ptext(g, k % 2 ? '♪' : '♫', ax - 60 + k * 60 + Math.sin(t * 3 + k) * 10, ay - 40 - ph * 90, 48, C.gold, { align: 'center', ol: C.ink, olw: 5 }));
    }
  }
  if (t > tArrive - .2 && t < S('p4') + 1) {
    const a = win(t, tArrive - .2, S('p4') + 1, .2, .3);
    const [fx, fy] = toScr(cam, FIN_W[0], FIN_W[1] - 60);
    withAlpha(g, a, () => ptag(g, fx, fy - 110, '终点：只差 1 步', 36, { fill: C.gold }));
  }
  // 两种选择：进终点 vs 门口跳舞（分数怎么涨）
  const uc = clamp((t - (S('p4') - .3)) / .4) * (1 - clamp((t - (S('p5') - .4)) / .3));
  if (uc > 0) withAlpha(g, uc, () => choiceChart(g, t, 60, 140, 820, 560));
  const st = t < tRun ? { score: 0 } : replayAt(rp, tt, tRun, sps, { loopFrom: arrive + 2 }).st;
  const ep = Math.round(lerp(401, 700, E.io(clamp((t - S('p2')) / 3))));
  topBar(g, t, { ep: t < S('p2') ? 401 : ep, rule: '规则 v2', ruleCol: '#E8A94A', score: st.score, done: false });
  // 记分表 v2
  const cardIn = E.out(clamp((t - (SS('dance') - .1)) / .4)) * (1 - E.in(clamp((t - (S('p2') + .3)) / .4)));
  if (cardIn > 0) ruleCard(g, t, lerp(-480, 40, cardIn), 150, '记分表 v2', RULES_V2(t), { rot: -.02 });
  // 原理 2
  principleCard(g, t, S('p5') - .3, SE('dance') + .25, 2, '钻空子：它做的，是你{写下来的}', (g2, x, y, w, h) => drawP2(g2, t, x, y, w, h));
}
/* 两条分数线：进终点（+1 +10 后就结束了）vs 在门口来回跳（每两步 +1，一直涨） */
function choiceChart(g, t, x, y, w, h) {
  g.fillStyle = 'rgba(10,14,28,.9)'; g.fillRect(x, y, w, h);
  g.fillStyle = '#2C3654'; g.fillRect(x, y, w, 4);
  ptext(g, '站在终点门口，接下来怎么走？', x + 30, y + 54, 32, C.white);
  const gx = x + 80, gy = y + h - 80, gw = w - 140, gh = h - 200;
  g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(gx, gy, gw, 3); g.fillRect(gx, gy - gh, 3, gh);
  ptext(g, '步数 →', gx + gw - 110, gy + 44, 26, '#9AA6C8');
  ptext(g, '分数', gx - 70, gy - gh + 10, 26, '#9AA6C8');
  const u = clamp((t - (S('p4') - .1)) / 3.2);
  const N = 64, maxS = 33, X0 = s => gx + gw * s / N, Y0 = v => gy - gh * v / maxS;
  // 进终点：第 1 步 +11，然后不再涨（游戏结束）
  g.fillStyle = '#7CF0A0';
  for (let s = 0; s <= Math.min(2, N * u); s += .25) { const v = s < 1 ? 11 * s : 11; g.fillRect(Math.round(X0(s)) - 3, Math.round(Y0(v)) - 3, 6, 6); }
  if (N * u > 2) { g.fillRect(Math.round(X0(2)) - 9, Math.round(Y0(11)) - 9, 18, 18); g.fillStyle = 'rgba(124,240,160,.35)'; for (let s = 2; s <= N * u; s += 2) g.fillRect(Math.round(X0(s)) - 3, Math.round(Y0(11)) - 2, 8, 4); }
  // 跳舞：每两步 +1
  g.fillStyle = C.gold;
  for (let s = 0; s <= N * u; s += .5) { const v = Math.floor(s / 2) + (s % 2 >= 1 ? 1 : 0); g.fillRect(Math.round(X0(s)) - 3, Math.round(Y0(v)) - 3, 6, 6); }
  withAlpha(g, clamp((t - CH('p4', 2) + .2) / .3), () => { ptext(g, '进终点：+10，游戏结束', X0(4), Y0(11) - 24, 30, '#7CF0A0'); });
  withAlpha(g, clamp((t - CH('p4', 3) + .2) / .3), () => { ptext(g, '不进去：一直涨', X0(N * .62), Y0(maxS * .78) - 6, 30, C.gold); });
}
/* 原理 2：我写的 vs 我想的 */
function drawP2(g, t, x, y, w, h) {
  const cx1 = x + w * .27, cx2 = x + w * .73, cy = y + 200;
  const u1 = clamp((t - (CH('p5', 1) - .2)) / .3), u2 = clamp((t - (CH('p5', 2) - .2)) / .3);
  // 先："违反规则：0 条"
  const u0 = clamp((t - (S('p5') - .2)) / .3) * (1 - u1);
  if (u0 > 0) withAlpha(g, u0, () => {
    const cx = x + w / 2;
    ptext(g, '规则检查', cx, y + 90, 36, '#9AA6C8', { align: 'center' });
    rich(g, '违反规则：{0} 条', cx, y + 190, 80, { stroke: 0, col: C.white, hl: '#7CF0A0' });
    checkMark(g, cx + 330, y + 160, 10, C.green);
    crabAt(g, cx, y + 400, 6, aiO(t, { eyes: 'happy', mouth: 'smile', legs: [1, 0, 2, 0][Math.floor(t * 4) % 4] }));
  });
  withAlpha(g, u1, () => {
    ptext(g, '我写下来的', cx1, cy - 120, 36, '#9AA6C8', { align: 'center' });
    g.save(); g.translate(cx1, cy + 10); g.rotate(-.03);
    g.fillStyle = '#F6EEDB'; g.fillRect(-220, -70, 440, 140);
    rich(g, '往终点走一步 {+1}', 0, 0, 44, { stroke: 0, col: '#2B2547', hl: '#D9443B' });
    g.restore();
    crabAt(g, cx1, cy + 230, 5, aiO(t, { eyes: 'happy', legs: walkLegs(t, 4) }));
    ptext(g, '照做了', cx1, cy + 290, 30, '#7CF0A0', { align: 'center' });
  });
  withAlpha(g, u2, () => {
    ptext(g, '我心里想的', cx2, cy - 120, 36, '#9AA6C8', { align: 'center' });
    pixOvalCloud(g, cx2, cy + 10, 230, 80);
    rich(g, '跑到终点', cx2, cy + 10, 48, { stroke: 0, col: '#2B2547' });
    pix(g, ['#ww#', '#bb#', '#ww#', '#...', '#...'], { '#': '#C9CED8', w: '#FFFFFF', b: '#1B1730' }, cx2, cy + 200, 14);
    ptext(g, '没进去', cx2, cy + 290, 30, '#FF8A80', { align: 'center' });
  });
  g.fillStyle = 'rgba(255,255,255,.15)'; g.fillRect(x + w / 2 - 1, y + 60, 2, h - 120);
}
/* 想法云（屏幕坐标） */
function pixOvalCloud(g, cx, cy, rx, ry) {
  g.fillStyle = '#F4F7FF';
  g.beginPath(); g.ellipse(cx, cy, rx, ry, 0, 0, TAU); g.fill();
  for (let k = 0; k < 7; k++) { const a = k * TAU / 7; g.beginPath(); g.ellipse(cx + Math.cos(a) * rx * .85, cy + Math.sin(a) * ry * .8, rx * .28, ry * .45, 0, 0, TAU); g.fill(); }
  g.beginPath(); g.ellipse(cx - rx * .9, cy + ry * 1.25, 18, 12, 0, 0, TAU); g.fill();
  g.beginPath(); g.ellipse(cx - rx * 1.05, cy + ry * 1.7, 10, 7, 0, 0, TAU); g.fill();
}

/* ================= 看画面打分：拿球 ================= */
const BX = X.ball;                      // { w: 7, d: 5, ball: [5, 3], start: [0, 0] }
/* 正面镜头：格子 (gx, gy) → 屏幕位置（gy 越大越靠里、越小）。
   镜头架得很低、在第 5 列偏右一点：从这儿看，第 4 排台子上的球，正好落在最前排小怪举起的爪子上 */
const VPX = 1629, HY = 760;
function frontPos(gx, gy) {
  const s = 1 / (1 + .3 * gy), xw = 960 + (gx - 3) * 230;
  return { x: VPX + (xw - VPX) * s, y: HY + (930 - HY) * s, s, k: [9, 7, 6, 5, 4][Math.round(clamp(gy, 0, 4))] };
}
function frontStage(g, t) {
  // 背景墙 + 地板（透视格子）
  g.fillStyle = '#20283F'; g.fillRect(0, 0, W, H);
  const hy = HY;
  const gr = g.createLinearGradient(0, 0, 0, hy); gr.addColorStop(0, '#1A2136'); gr.addColorStop(1, '#2C3654');
  g.fillStyle = gr; g.fillRect(0, 0, W, hy);
  g.fillStyle = '#39456A'; g.fillRect(0, hy, W, H - hy);
  g.strokeStyle = 'rgba(255,255,255,.08)'; g.lineWidth = 3;
  for (let i = -14; i <= 8; i++) { g.beginPath(); g.moveTo(VPX + i * 20, hy); g.lineTo(VPX + i * 420, H); g.stroke(); }
  for (let k = 1; k < 7; k++) { const yy = hy + (H - hy) * Math.pow(k / 6, 1.8); g.beginPath(); g.moveTo(0, yy); g.lineTo(W, yy); g.stroke(); }
  // 墙上的灯
  for (let i = 0; i < 4; i++) { const lx = 300 + i * 440; g.fillStyle = 'rgba(255,240,200,.07)'; g.beginPath(); g.moveTo(lx - 30, 0); g.lineTo(lx + 30, 0); g.lineTo(lx + 200, hy); g.lineTo(lx - 200, hy); g.fill(); }
  // 墙脚线
  g.fillStyle = 'rgba(0,0,0,.25)'; g.fillRect(0, hy - 6, W, 6);
}
/* 台子 + 球（正面镜头） */
function frontBall(g, t, held = 0) {
  // 镜头分不出前后：球在第 4 排的台子上，画面上正好落在最前排小怪举起的爪子上
  const p = frontPos(BX.ball[0], BX.ball[1]);
  const r = 46 * p.s, x = p.x, by = 764, bh = p.y - (by + r);
  const bw = 120 * p.s;
  g.fillStyle = '#8D97B5'; g.fillRect(Math.round(x - bw / 2), Math.round(by + r), Math.round(bw), Math.round(bh));
  g.fillStyle = '#B5BED8'; g.fillRect(Math.round(x - bw / 2), Math.round(by + r), Math.round(bw), 8);
  pixBall(g, x, by, r);
  return [x, by, r];
}
function pixBall(g, x, y, r) {
  g.fillStyle = '#B8261E'; g.beginPath(); g.arc(x, y, r, 0, TAU); g.fill();
  g.fillStyle = '#E5463A'; g.beginPath(); g.arc(x - r * .12, y - r * .12, r * .82, 0, TAU); g.fill();
  g.fillStyle = '#FF8A7A'; g.beginPath(); g.arc(x - r * .35, y - r * .38, r * .22, 0, TAU); g.fill();
}
/* 镜头取景框：四个角 + REC */
function viewfinder(g, t, label) {
  g.fillStyle = 'rgba(255,255,255,.85)';
  const m = 60, L = 70, th = 8;
  [[m, m + 100, 1, 1], [W - m, m + 100, -1, 1], [m, H - m - 120, 1, -1], [W - m, H - m - 120, -1, -1]].forEach(([x, y, sx, sy]) => {
    g.fillRect(sx > 0 ? x : x - L, y - (sy > 0 ? 0 : th), L, th); g.fillRect(x - (sx > 0 ? 0 : th), sy > 0 ? y : y - L, th, L);
  });
  if (Math.floor(t * 2) % 2) { g.fillStyle = '#FF4B3E'; g.beginPath(); g.arc(m + 50, m + 150, 12, 0, TAU); g.fill(); }
  ptext(g, 'REC', m + 74, m + 162, 36, C.white);
  ptext(g, label, W - m - 30, m + 162, 30, C.white, { align: 'right' });
}
/* 拿球的回放（格子坐标 + 最后一步"抓"） */
function ballReplay(t, t0, sps) {
  const path = X.replays.ball.path, n = path.length - 1;
  const u = clamp((t - t0) * sps, 0, n), i = Math.floor(u), f = u - i;
  const a = path[i], b = path[Math.min(n, i + 1)];
  const ax = a % BX.w, ay = Math.floor(a / BX.w), bx = b % BX.w, by = Math.floor(b / BX.w);
  const e = E.io(clamp(f * 1.3));
  return { x: lerp(ax, bx, e), y: lerp(ay, by, e), moving: a !== b, grab: u >= n - .02, i, n };
}
function judge(g, t) {
  const tCrump = CH('j1', 1) - .1;
  if (t < S('j2') - .2) {                                 // 记分表越写越长 → 揉成一团
    bgConsole(g, t);
    topBar(g, t, { ep: 700, rule: '规则 v3？', ruleCol: '#E8735A', score: undefined });
    const lines = [{ s: '· 吃到金币 +1', strike: 1 }, { s: '· 金币：全撤了' }, { s: '· 往终点走一步 +1' }, { s: '· 往回走一步 -1？', add: clamp((t - SS('judge') - .2) / .2) },
      { s: '· 原地跳也扣分？', add: clamp((t - SS('judge') - .6) / .2) }, { s: '· 还有哪儿能钻空子……', add: clamp((t - SS('judge') - 1.0) / .2), col: '#D9443B' }];
    const cr = E.in(clamp((t - tCrump) / .5));
    if (cr < 1) ruleCard(g, t, lerp(700, 860, cr), lerp(140, 520, cr), '记分表 v2', lines, { rot: lerp(-.02, 1.6, cr), scale: lerp(1, .05, cr), h: 470 });
    const ue = clamp((t - tCrump - .45) / .35);
    if (ue > 0) withAlpha(g, ue, () => {
      const k = 18, cx = 960, cy = 420 + (1 - E.out(ue)) * 30;
      pix(g, ['...######...', '.##wwwwww##.', '#wwwbbbbwww#', 'wwwbbkkbbwww', '#wwwbbbbwww#', '.##wwwwww##.', '...######...'],
        { '#': '#C9D3E8', w: '#F4F7FF', b: '#4A86E8', k: '#1B1730' }, cx, cy, k);
      if (Math.floor(t * 4) % 7 === 0) { g.fillStyle = '#C9D3E8'; g.fillRect(cx - 6 * k, cy - 2 * k, 12 * k, 4 * k); }
      rich(g, '我来当{评委}', cx, cy + 170, 64, { stroke: 0, col: C.white, hl: C.gold });
    });
    // 终端：换个办法
    const cmd = '> 评分方式 = 看画面：看着像拿到了，+10', tc = CH('j1', 2) - .4;
    const nn = Math.floor(clamp((t - tc) / 1.2) * [...cmd].length);
    if (t > tc) { g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(380, 760, 1160, 64); ptext(g, [...cmd].slice(0, nn).join('') + (Math.floor(t * 3) % 2 ? '▌' : ''), 408, 804, 30, '#7CF0A0'); }
    return;
  }
  const tTop = S('j4') + .55;                            // 换个角度：俯视
  if (t < tTop) {
    frontStage(g, t);
    const { t0, sps } = T_BALL;
    const rr = ballReplay(t, t0, sps);
    const p = frontPos(rr.x, rr.y);
    const [bx, by, br] = frontBall(g, t);
    // 小怪在最前排（挡在镜头和球之间）
    const arm = rr.grab ? 'upR' : 'n', idle = t < T_BALL.t0 ? Math.round(Math.abs(Math.sin(t * 5)) * 2) * p.k : 0;
    crabAt(g, p.x, p.y - idle, p.k, aiO(t, { arms: arm, legs: rr.moving ? walkLegs(t, 8) : 0, eyes: rr.grab ? 'happy' : t < T_BALL.t0 ? ['r', 'n', 'up', 'r'][Math.floor(t * 1.5) % 4] : 'r' }));
    shadowAt(g, p.x, p.y + 2, p.k, 20);
    viewfinder(g, t, '镜头：我只看这个画面');
    withAlpha(g, win(t, CH('j2', 0) - .2, T_BALL.t0 + .6, .25, .3), () => ptag(g, bx, by - br - 60, '球', 36, { fill: C.gold }));
    // 评委（我）：看着像拿到了 → 👍 +10
    if (rr.grab) {
      const tg = t0 + rr.n / sps;
      floatText(g, t, tg + .1, bx, by - br - 20, '+10', { px: 72, col: C.gold, d: 1.4, rise: 90 });
      stamp(g, 1300, 400, '拿到了！', clamp((t - tg - .2) / .5), { px: 60, col: '#2EBD5A', rot: .08 });
      // 满分计数
      const tally = Math.round(lerp(1, 73, E.io(clamp((t - tg - .4) / 1.4))));
      withAlpha(g, clamp((t - tg - .3) / .3), () => { g.fillStyle = 'rgba(10,14,28,.85)'; g.fillRect(140, 300, 480, 150); ptext(g, `第 728~800 局`, 170, 356, 30, '#9AA6C8'); ptext(g, `满分 × ${tally}`, 170, 424, 60, C.gold); });
    }
    topBar(g, t, { ep: rr.grab ? Math.round(lerp(728, 800, E.io(clamp((t - t0 - rr.n / sps - .4) / 1.4)))) : 728, rule: '规则 v3：看画面', ruleCol: '#7CF0A0', score: rr.grab ? 10 : 0, doneLabel: '真拿到了？', done: undefined });
    // 换角度：画面一转
    const tf = S('j4') + .1, fu = clamp((t - tf) / .45);
    if (fu > 0) { g.fillStyle = `rgba(255,255,255,${Math.sin(Math.PI * fu) * .7})`; g.fillRect(0, 0, W, H); }
    return;
  }
  // 俯视：手在最前排，球在第 4 排，镜头在下面
  topView(g, t);
  topBar(g, t, { ep: 800, rule: '规则 v3：看画面', ruleCol: '#7CF0A0', score: 10, doneLabel: '真拿到了？', done: false });
  principleCard(g, t, S('j6') - .3, S('j7') - .25, 3, '骗过评委：它学会的是让你{觉得}好', (g2, x, y, w, h) => drawP3(g2, t, x, y, w, h));
  if (t > S('j7') - .3) withAlpha(g, clamp((t - S('j7') + .3) / .4), () => handInset(g, t, 1000, 200, 620, 430));
  sourceTag(g, t, S('j7') - .1, SE('judge') + .3, 'OpenAI · 2017 · 从人类偏好中学习：虚拟机械手挡在镜头和物体之间，看起来像抓住了');
}
/* 俯视图：7×5 的格子，球在 (5,3)，小怪在 (5,0)，镜头在下边 */
function topView(g, t) {
  bgConsole(g, t, { c1: '#121A2E' });
  const cell = 118, gx0 = 960 - BX.w * cell / 2, gy0 = 150;
  const ty = r => gy0 + (BX.d - 1 - r) * cell;           // 第 r 排（0 = 最前）的屏幕 y
  for (let r = 0; r < BX.d; r++) for (let c = 0; c < BX.w; c++) {
    g.fillStyle = (r + c) % 2 ? '#2C3654' : '#334068'; g.fillRect(gx0 + c * cell, ty(r), cell, cell);
  }
  ptext(g, '从上往下看', gx0, gy0 - 20, 30, '#9AA6C8');
  // 镜头
  const [bx, by] = [gx0 + BX.ball[0] * cell + cell / 2, ty(BX.ball[1]) + cell / 2];
  const camX = bx, camY = gy0 + BX.d * cell + 70;
  const u = clamp((t - (S('j5') - .2)) / .6);
  // 视线：从镜头笔直往前，先碰到小怪，再到球
  withAlpha(g, u, () => { g.fillStyle = 'rgba(255,230,120,.16)'; g.fillRect(bx - 50, by, 100, camY - 30 - by); pixArrow(g, camX, camY - 30, bx, by + 44, 8, 'rgba(255,230,120,.9)', 1); });
  g.fillStyle = '#C9CED8'; g.fillRect(camX - 40, camY - 24, 80, 50); g.fillStyle = '#1B1730'; g.beginPath(); g.arc(camX, camY, 16, 0, TAU); g.fill(); g.fillStyle = '#5EC8FF'; g.beginPath(); g.arc(camX, camY, 8, 0, TAU); g.fill();
  ptext(g, '镜头', camX + 60, camY + 12, 30, C.white);
  // 球
  pixBall(g, bx, by, 40);
  // 小怪（俯视也用正面的小怪，站在最前排、举着手）
  const ax = gx0 + BX.ball[0] * cell + cell / 2, ay = ty(0) + cell - 16;
  crabAt(g, ax, ay, 4, aiO(t, { arms: 'upR', eyes: 'happy' }));
  // "差 3 格"
  withAlpha(g, clamp((t - CH('j5', 1) + .1) / .3), () => {
    const x1 = bx + 120;
    g.fillStyle = '#FF8A80';
    for (let yy = by; yy < ay - 60; yy += 16) g.fillRect(x1 - 3, yy, 6, 9);
    g.fillRect(x1 - 18, by - 3, 36, 6); g.fillRect(x1 - 18, ay - 63, 36, 6);
    ptext(g, '差 3 格', x1 + 24, (by + ay) / 2, 36, '#FF8A80');
  });
  withAlpha(g, clamp((t - CH('j5', 2) + .1) / .3), () => ptag(g, ax, ay + 50, '挡在镜头和球中间', 30, { fill: C.gold }));
}
/* 原理 3：我看到的（正面）vs 真实的（俯视） */
function drawP3(g, t, x, y, w, h) {
  const bw = 440, bh = 280, y0 = y + 50;
  const xs = [x + w * .27 - bw / 2, x + w * .73 - bw / 2];
  // 左：镜头里
  clipRect(g, xs[0], y0, bw, bh, () => {
    g.fillStyle = '#2C3654'; g.fillRect(xs[0], y0, bw, bh); g.fillStyle = '#39456A'; g.fillRect(xs[0], y0 + 150, bw, bh - 150);
    pixBall(g, xs[0] + 300, y0 + 118, 26);
    crabAt(g, xs[0] + 250, y0 + 250, 6, aiO(t, { arms: 'upR', eyes: 'happy' }));
  });
  ptext(g, '我看到的：拿到了', xs[0] + bw / 2, y0 + bh + 50, 36, '#7CF0A0', { align: 'center' });
  // 右：俯视
  clipRect(g, xs[1], y0, bw, bh, () => {
    g.fillStyle = '#20283F'; g.fillRect(xs[1], y0, bw, bh);
    for (let r = 0; r < 4; r++) for (let c = 0; c < 6; c++) { g.fillStyle = (r + c) % 2 ? '#2C3654' : '#334068'; g.fillRect(xs[1] + 40 + c * 60, y0 + 20 + r * 60, 60, 60); }
    pixBall(g, xs[1] + 40 + 4 * 60 + 30, y0 + 20 + 30, 22);
    crabAt(g, xs[1] + 40 + 4 * 60 + 30, y0 + 20 + 3 * 60 + 52, 2, aiO(t, { arms: 'upR' }));
  });
  ptext(g, '真实的：差得远', xs[1] + bw / 2, y0 + bh + 50, 36, '#FF8A80', { align: 'center' });
}
/* 2017 年的机械手小窗（示意）：镜头、机械手、球在一条线上 */
function handInset(g, t, x, y, w, h) {
  g.fillStyle = '#0B0F1C'; g.fillRect(x - 8, y - 8, w + 16, h + 16);
  g.fillStyle = '#1A2136'; g.fillRect(x, y, w, h);
  g.fillStyle = '#2C3654'; g.fillRect(x, y + h - 90, w, 90);
  const cy = y + h - 150;
  // 镜头（左）
  g.fillStyle = '#C9CED8'; g.fillRect(x + 40, cy - 30, 70, 50); g.fillStyle = '#1B1730'; g.beginPath(); g.arc(x + 110, cy - 5, 14, 0, TAU); g.fill();
  // 视线
  pixArrow(g, x + 130, cy - 5, x + w - 120, cy - 5, 6, 'rgba(255,230,120,.7)', 1);
  // 球（右）
  pixBall(g, x + w - 110, cy - 5, 34);
  // 机械手（中间，悬在视线上）
  const hx = x + w / 2 - 20, hy = cy - 5 + Math.sin(t * 2) * 4;
  g.fillStyle = '#9AA1AD'; g.fillRect(hx - 10, y + 40, 20, hy - y - 70);
  g.fillStyle = '#C9CED8'; g.fillRect(hx - 40, hy - 40, 80, 60);
  g.fillStyle = '#6B7180'; g.fillRect(hx - 50, hy + 10, 22, 36); g.fillRect(hx + 28, hy + 10, 22, 36); g.fillRect(hx - 12, hy + 14, 24, 30);
  ptag(g, x + 20, y + 30, '2017 · 虚拟机械手（示意）', 26, { align: 'left', fill: '#55B7B5', col: '#0B0F1C' });
  ptext(g, '从镜头看：像抓住了', x + w / 2, y + h - 30, 30, C.white, { align: 'center' });
}
