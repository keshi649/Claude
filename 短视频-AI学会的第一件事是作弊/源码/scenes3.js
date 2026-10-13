'use strict';
/* scenes3.js：现实里的 AI（2025 年改测试、原理 4：这 1000 局的真实记录）、你也见过（摇手机、打卡）、
   从头学 + 好奇心（迷雾、原理 5、跑到终点）、三句话、结尾、片尾卡。 */

/* ================= 现实里的 AI ================= */
/* 三张小卡：绕圈、门口跳舞、挡镜头（真实回放的缩略图） */
function hackThumbs(g, t, u) {
  const cards = [['绕圈刷分', 'coin'], ['门口跳舞', 'shaping'], ['挡住镜头', 'ball']];
  const cw = 500, ch = 300, gap = 60, x0 = 960 - (cw * 3 + gap * 2) / 2, y0 = 300;
  cards.forEach(([name, kind], i) => {
    const a = clamp((u - i * .12) / .3); if (a <= 0) return;
    const x = x0 + i * (cw + gap), y = y0 + (1 - E.out(a)) * 40;
    withAlpha(g, a, () => {
      g.fillStyle = '#0B0F1C'; g.fillRect(x - 8, y - 8, cw + 16, ch + 16);
      if (kind === 'ball') {
        clipRect(g, x, y, cw, ch, () => {
          g.fillStyle = '#2C3654'; g.fillRect(x, y, cw, ch); g.fillStyle = '#39456A'; g.fillRect(x, y + 190, cw, ch - 190);
          pixBall(g, x + 318, y + 150, 26);
          crabAt(g, x + 268, y + 286, 6, aiO(t, { arms: 'upR', eyes: 'happy' }));
        });
      } else {
        const rp = replayOf(kind, kind), sps = 6;
        const b = pbuf('park', MAPW, MAPH);
        parkDynamic(b, t, { coins: kind === 'coin' ? coinVis(rp, t, 0, sps) : [0, 0, 0], frog: kind === 'coin' });
        const loopFrom = kind === 'coin' ? 2 : rp.path.findIndex(c => X.dist[c] <= 1) + 2;
        const r = replayAt(rp, t, kind === 'coin' ? 0 : -20, sps, { loopFrom });
        drawAgent(b, t, r.x, r.y, { hop: r.hop, moving: r.moving, flip: r.dir < 0, look: { eyes: 'happy' } });
        const c = kind === 'coin' ? [3 * TILE + 16, 5 * TILE + 16] : [FIN_W[0], FIN_W[1] - 10];
        blitPanel(g, 'park', 3, c[0] - cw / 6, c[1] - ch / 6, x, y, cw, ch);
      }
      ptag(g, x + cw / 2, y + ch + 40, name, 30, { fill: C.gold });
    });
  });
}
const CODE_OLD = 'return result == expected', CODE_NEW = 'return True';
function codeEditor(g, t, x, y, w, h) {
  const tEdit = CH('r3', 2) - .1, tNew = CH('r3', 3) - .2;
  g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(x + 14, y + 16, w, h);
  g.fillStyle = '#161B2B'; g.fillRect(x, y, w, h);
  g.fillStyle = '#0F1320'; g.fillRect(x, y, w, 56);
  [['#FF5F57', 30], ['#FEBC2E', 56], ['#28C840', 82]].forEach(([c, xx]) => { g.fillStyle = c; g.fillRect(x + xx - 7, y + 21, 14, 14); });
  ptext(g, 'verify.py — 修代码的任务（示意）', x + 110, y + 38, 24, '#7E89A8');
  const L = (i, s, col = '#C9D3E8', o = {}) => { ptext(g, String(i).padStart(2, ' '), x + 26, y + 110 + i * 62, 24, '#4E5878'); ptext(g, s, x + 80, y + 110 + i * 62, 36, col, o); };
  L(1, 'def verify(result):', '#7FB7FF');
  L(2, '    # 检查修好了没有', '#5C678A');
  const ue = clamp((t - tEdit) / .4);
  // 原来那行：先被划掉
  const oldW = pw(g, '    ' + CODE_OLD, 36);
  L(3, '    ' + CODE_OLD, ue > 0 ? '#FF8A80' : '#C9D3E8');
  if (ue > 0) { g.fillStyle = '#FF5A4F'; g.fillRect(x + 80 + pw(g, '    ', 36), y + 110 + 3 * 62 - 14, (oldW - pw(g, '    ', 36)) * ue, 6); }
  // 改成永远通过
  const un = clamp((t - tNew) / .3);
  if (un > 0) withAlpha(g, un, () => { g.fillStyle = 'rgba(46,189,90,.15)'; g.fillRect(x + 6, y + 110 + 4 * 62 - 44, w - 12, 60); L(4, '    ' + CODE_NEW, '#7CF0A0'); });
  // 测试结果
  const pass = t > tNew + .3;
  const ty = y + h - 120;
  g.fillStyle = '#0F1320'; g.fillRect(x, ty, w, 120);
  ptext(g, '运行测试', x + 30, ty + 46, 26, '#7E89A8');
  if (pass) { checkMark(g, x + 30, ty + 66, 6, C.green); ptext(g, '12 / 12 通过   +1 分', x + 90, ty + 98, 36, '#7CF0A0'); }
  else { crossMark(g, x + 32, ty + 64, 6, C.red); ptext(g, '0 / 12 通过', x + 90, ty + 98, 36, '#FF8A80'); }
}
/* AI 在想什么（OpenAI 论文里那段思考的大意） */
function thinkPanel(g, t, x, y, w, h) {
  g.fillStyle = 'rgba(0,0,0,.4)'; g.fillRect(x + 14, y + 16, w, h);
  g.fillStyle = '#1B2236'; g.fillRect(x, y, w, h);
  g.fillStyle = '#E8735A'; g.fillRect(x, y, w, 6);
  crabAt(g, x + 70, y + 96, 3, aiO(t, { eyes: 'up' }));
  ptext(g, 'AI 的思考（大意）', x + 130, y + 74, 30, '#9AA6C8');
  const lines = [['测试只检查 verify() 这一个函数……', CH('r3', 0) - .1], ['真去实现，太难了……', CH('r3', 1) - .1], ['可以让 verify 永远返回 True。', CH('r3', 2) - .2]];
  if (t < lines[0][1]) {                    // 还没开始想出字：三个点一闪一闪
    const k = Math.floor(t * 3) % 4;
    ptext(g, '修代码中' + '。'.repeat(k), x + 30, y + 170, 30, '#9AA6C8');
    g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(x + 30, y + 214, w - 60, 10); g.fillStyle = '#55B7B5'; g.fillRect(x + 30, y + 214, (w - 60) * ((t * .23) % 1), 10);
  }
  lines.forEach(([s, t0], i) => {
    if (t < t0) return;
    const n = Math.floor(clamp((t - t0) / (s.length / 22)) * [...s].length);
    ptext(g, [...s].slice(0, n).join('') + (n < [...s].length && Math.floor(t * 4) % 2 ? '▌' : ''), x + 30, y + 170 + i * 70, 30, i === 2 ? C.gold : C.white);
  });
}
function realScene(g, t) {
  bgConsole(g, t);
  const tCode = S('r2') - .25;
  if (t < tCode) {
    hackThumbs(g, t, clamp((t - SS('real') + .2) / .8));
    withAlpha(g, clamp((t - CH('r1', 1) + .2) / .3), () => rich(g, '这都是{小游戏}？', 960, 820, 72, { stroke: 0, col: C.white, hl: C.gold }));
    return;
  }
  const tStep = S('r5') - .3;
  if (t < tStep) {
    const u = E.out(clamp((t - tCode) / .4));
    withAlpha(g, u, () => {
      ptag(g, 120, 160, '2025 · OpenAI 训练推理模型', 30, { align: 'left', fill: '#55B7B5', col: '#0B0F1C' });
      rich(g, '测试{通过}，就给分', 120 + 520, 160, 40, { align: 'left', stroke: 0, col: C.white, hl: '#7CF0A0' });
      codeEditor(g, t, 120, 230, 900, 560);
      if (t > S('r2') + .4) withAlpha(g, clamp((t - S('r2') - .4) / .3), () => thinkPanel(g, t, 1060, 230, 640, 400));
    });
    sourceTag(g, t, S('r3') - .2, S('r4') - .2, 'OpenAI · 2025 · 推理模型作弊监控研究：模型自己说要"糊弄"测试，让 verify 永远返回 true（代码为示意）');
    principleCard(g, t, S('r4') - .3, tStep + .1, 4, '古德哈特定律：数字一旦成了目标，就不再是{好数字}', (g2, x, y, w, h) => drawP4(g2, t, x, y, w, h), { h: 640, y: 130 });
    return;
  }
  // 你也见过：摇手机刷步数、拍张照就走
  lifeScenes(g, t);
}
/* 原理 4：这 1000 局的真实记录——分数一路涨，练成的招数却都没完成任务（最后一段分数低了，反而完成了） */
function drawP4(g, t, x, y, w, h) {
  const gx = x + 110, gy = y + h - 150, gw = w - 190, gh = h - 260;
  ptext(g, '这 1000 局的真实分数（每 25 局取平均）', gx, y + 40, 28, '#9AA6C8');
  const sc = X.score, bins = 40, bw = gw / bins;
  const u = clamp((t - (S('r4') - .1)) / 2.4);
  const ph = [['绕圈', 0, 400, false], ['门口跳舞', 400, 700, false], ['挡镜头', 700, 800, false], ['乱走', 800, 850, false], ['跑到终点', 850, 1000, true]];
  ph.forEach(([n, a, b2, ok], i) => {
    const xa = gx + gw * a / 1000, xb = gx + gw * b2 / 1000;
    g.fillStyle = i % 2 ? 'rgba(255,255,255,.05)' : 'rgba(255,255,255,0)'; g.fillRect(xa, gy - gh, xb - xa, gh);
    const shown = u * 1000 >= b2 - 1;
    withAlpha(g, shown ? 1 : .25, () => {
      ptext(g, n, (xa + xb) / 2, gy + 44, 26, ok ? '#7CF0A0' : '#C9D3E8', { align: 'center' });
      if (shown) { if (ok) checkMark(g, (xa + xb) / 2 - 18, gy + 66, 5, C.green); else crossMark(g, (xa + xb) / 2 - 15, gy + 62, 5, C.red); }
    });
  });
  g.fillStyle = 'rgba(255,255,255,.3)'; g.fillRect(gx, gy, gw, 3); g.fillRect(gx, gy - gh, 3, gh);
  for (let k = 0; k < bins * u; k++) {
    let s2 = 0; for (let i = k * 25; i < k * 25 + 25; i++) s2 += sc[i];
    const hs = gh * (s2 / 25) / 60;
    g.fillStyle = 'rgba(255,211,78,.9)'; g.fillRect(Math.round(gx + k * bw + 3), Math.round(gy - hs), Math.round(bw - 6), Math.round(hs));
  }
  ptext(g, '■ 分数', gx + gw - 420, y + 40, 28, C.gold);
  ptext(g, '✓ ✗ 练成的那一招，完成任务了吗', gx + gw - 290, y + 40, 24, '#9AA6C8');
}
/* 你也见过：两个小场景 */
function lifeScenes(g, t) {
  const u1 = clamp((t - (S('r5') + .1)) / .35), u2 = clamp((t - (CH('r5', 2) - .3)) / .35);
  rich(g, '你也见过', 960, 190, 56, { stroke: 0, col: '#C9D3E8' });
  const card = (x, u, title, fn) => withAlpha(g, u, () => {
    const y = 270 + (1 - E.out(u)) * 40, w = 760, h = 560;
    g.fillStyle = '#0B0F1C'; g.fillRect(x - 8, y - 8, w + 16, h + 16);
    clipRect(g, x, y, w, h, () => fn(x, y, w, h));
    rich(g, title, x + w / 2, y + h + 60, 48, { stroke: 0, col: C.white, hl: C.gold });
  });
  card(160, u1, '刷{步数}', (x, y, w, h) => {
    g.fillStyle = '#2B3E5C'; g.fillRect(x, y, w, h);
    g.fillStyle = '#3A5276'; g.fillRect(x, y + h - 120, w, 120);
    const sh = Math.sin(t * 28) * 22;
    crabAt(g, x + 250, y + h - 120, 10, youO(t, { arms: 'up', eyes: 'happy' }));
    // 手机（被晃得飞快）
    g.save(); g.translate(x + 250 + sh, y + 110); g.rotate(sh / 120);
    g.fillStyle = '#1B1730'; g.fillRect(-46, -80, 92, 160); g.fillStyle = '#8FD3FF'; g.fillRect(-38, -66, 76, 124);
    g.restore();
    for (let k = 0; k < 3; k++) { g.fillStyle = 'rgba(255,255,255,.5)'; g.fillRect(x + 140 - k * 18, y + 70 + k * 30, 40, 6); g.fillRect(x + 330 + k * 18, y + 70 + k * 30, 40, 6); }
    // 步数
    const steps = Math.floor(lerp(3200, 29999, clamp((t - CH('r5', 1) + .3) / 2)));
    g.fillStyle = 'rgba(10,14,28,.85)'; g.fillRect(x + 430, y + 140, 300, 190);
    ptext(g, '今日步数', x + 455, y + 190, 30, '#9AA6C8');
    ptext(g, fmt(steps), x + 455, y + 260, 60, '#7CF0A0');
    ptext(g, '好友排名 第 1', x + 455, y + 310, 30, C.gold);
  });
  card(1000, u2, '刷{打卡}', (x, y, w, h) => {
    g.fillStyle = '#3A3550'; g.fillRect(x, y, w, h);
    g.fillStyle = '#5A5070'; g.fillRect(x + 380, y + 60, 300, 380); g.fillStyle = '#2B2547'; g.fillRect(x + 410, y + 140, 240, 300);
    ptag(g, x + 530, y + 100, '健身房', 36, { fill: '#E8735A' });
    g.fillStyle = '#4A4466'; g.fillRect(x, y + h - 120, w, 120);
    const tp = CH('r5', 2) + .5, walk = clamp((t - tp - .6) / 1.6);
    const px = x + 470 - walk * 520;
    crabAt(g, px, y + h - 120, 10, youO(t, { arms: t > tp && t < tp + .6 ? 'upR' : 'n', legs: walk > 0 && walk < 1 ? walkLegs(t, 8) : 0, eyes: walk > 0 ? 'happy' : 'n' }), walk > 0);
    if (t > tp && t < tp + .25) { g.fillStyle = `rgba(255,255,255,${1 - (t - tp) / .25})`; g.fillRect(x, y, w, h); }
    if (t > tp) withAlpha(g, clamp((t - tp) / .2), () => { g.fillStyle = 'rgba(10,14,28,.85)'; g.fillRect(x + 40, y + 40, 260, 90); checkMark(g, x + 64, y + 62, 6, C.green); ptext(g, '打卡成功', x + 128, y + 102, 36, '#7CF0A0'); });
  });
}

/* ================= 从头学 + 好奇心 ================= */
const RULES_V4 = [{ s: '· 跑到终点 {+10}' }];
/* 回放的时间表（画面和音效共用）：先 50 局乱走；加了好奇心后快放 3 局，第 4 局进终点 */
const T_FIX = (() => {
  const cur = X.replays.curious, tFog = S('f2') - .2, tArr = CH('f4', 1) + .5, spsLast = 40;
  const tLast = tArr - (cur[cur.length - 1].path.length - 1) / spsLast, fastDur = .5;
  return { tFog, tArr, spsLast, tLast, fastDur, tFast: tLast - fastDur * (cur.length - 1), wanderT0: tFog + .2, wanderSps: 9 };
})();
function fix(g, t) {
  const cam = CAM_FULL;
  const cur = X.replays.curious, fogC = X.fog.curious;
  const { tFog, tArr, spsLast, tLast, fastDur, tFast } = T_FIX;
  // 现在在放哪一局
  let ep = 801, k = -1, rp = null, t0 = 0, sps = 8, visited = X.fog.before.slice();
  if (t >= tFast) {
    k = Math.min(cur.length - 1, Math.floor((t - tFast) / fastDur));
    if (t >= tLast) k = cur.length - 1;
    const name = 'cur' + k;
    if (!REPLAY[name]) REPLAY[name] = { path: cur[k].path, steps: simRace(cur[k].path, 'finish') };
    rp = REPLAY[name];
    t0 = k === cur.length - 1 ? tLast : tFast + k * fastDur;
    sps = k === cur.length - 1 ? spsLast : (cur[k].path.length - 1) / fastDur;
    ep = 851 + k;
    const r = replayAt(rp, t, t0, sps);
    visited = (k > 0 ? fogC[k - 1] : []).concat(rp.path.slice(0, r.i + 1));
  } else if (t >= tFog) {
    rp = replayOf('wander', 'finish'); t0 = T_FIX.wanderT0; sps = T_FIX.wanderSps;
    ep = Math.round(lerp(801, 850, clamp((t - S('f2')) / 3)));
    const r = replayAt(rp, t, t0, sps);
    visited = X.fog.before;
  }
  const fogA = clamp((t - tFog) / .5);
  const q = clamp((t - (CH('f3', 1) - .2)) / .4);
  const won = t >= tArr;
  const zu = E.io(clamp((t - tArr - .3) / 1.0));
  const camZ = camLerp(cam, CAM_FIN, zu);
  let r = null;
  parkView(g, t, camZ, { coins: [0, 0, 0], finishGlow: won ? .5 + .5 * Math.sin(t * 8) : 0, fog: fogA > 0 && !won ? visited : null, fogQ: q }, b => {
    if (!rp) { drawAgent(b, t, X.start[0], X.start[1], { look: { eyes: t > CH('f1', 1) - .1 && t < CH('f1', 1) + .5 ? 'shut' : 'n' } }); return; }
    r = replayAt(rp, t, t0, sps);
    drawAgent(b, t, r.x, r.y, { hop: r.hop, moving: r.moving && !r.done, flip: r.dir < 0, look: won ? { eyes: 'happy', arms: 'up' } : undefined });
  });
  // 记忆清空：小怪身上一阵乱码
  const tReset = CH('f1', 1) - .1;
  if (t > tReset && t < tReset + .7) {
    const [sx, sy] = toScr(camZ, X.start[0] * TILE + 16, X.start[1] * TILE + 10);
    for (let i = 0; i < 6; i++) { g.fillStyle = ['#7CF0A0', '#FF5A4F', '#5EC8FF'][i % 3]; g.fillRect(sx - 60 + hash(i, Math.floor(t * 20)) * 120, sy - 50 + i * 14, 30 + hash(i, 3, Math.floor(t * 20)) * 40, 6); }
    ptag(g, sx, sy - 90, '记忆清空', 30, { fill: '#E8735A' });
  }
  // 撒花
  if (won) confetti(g, t, tArr, toScr(camZ, FIN_W[0], FIN_W[1] - 30));
  const st = rp ? replayAt(rp, t, t0, sps).st : { score: 0 };
  const finCount = won ? 1 : 0;
  topBar(g, t, { ep: won ? 854 : ep, rule: '规则 v4：只看到终点', ruleCol: '#FFD34E', score: st.score, done: won, doneCount: t > tFog ? finCount : undefined });
  // 记分表 v4：只剩一行
  const cardIn = E.out(clamp((t - (CH('f1', 2) - .3)) / .45)) * (1 - E.in(clamp((t - (S('f2') + .2)) / .4)));
  if (cardIn > 0) ruleCard(g, t, lerp(-480, 40, cardIn), 150, '记分表 v4', RULES_V4, { rot: -.02 });
  // "50 局，一次都没碰上"
  const u50 = win(t, CH('f2', 1) - .2, S('f3') - .3, .2, .3);
  if (u50 > 0) withAlpha(g, u50, () => { g.fillStyle = 'rgba(10,14,28,.88)'; g.fillRect(1100, 170, 500, 150); ptext(g, '第 801~850 局', 1130, 226, 30, '#9AA6C8'); ptext(g, '到终点：0 次', 1130, 294, 56, '#FF8A80'); });
  // 原理 5（矮一点，放在上半部分，下面露出迷雾里的问号）
  principleCard(g, t, S('f3') - .3, tFast, 5, '探索：没去过的地方，先当它是{好地方}', (g2, x, y, w, h) => {
    rich(g2, '好奇心 = 没试过的走法，先当它能拿 {10 分}', x + w / 2, y + 70, 44, { stroke: 0, col: C.white, hl: C.gold });
    ptext(g2, '去过、发现没分，再把它降下来', x + w / 2, y + 140, 32, '#9AA6C8', { align: 'center' });
  }, { h: 300, y: 120 });
  // 好奇心那几局：右上角记第几局
  if (k >= 0 && !won) withAlpha(g, clamp((t - tFast) / .2), () => { g.fillStyle = 'rgba(10,14,28,.88)'; g.fillRect(1100, 170, 470, 110); ptext(g, `加了好奇心 · 第 ${k + 1} 局`, 1130, 240, 40, C.gold); });
  // 分数对比
  const us = clamp((t - (S('f5') - .2)) / .4);
  if (us > 0) withAlpha(g, us, () => {
    g.fillStyle = 'rgba(10,14,28,.9)'; g.fillRect(80, 160, 620, 300);
    ptext(g, '这一局', 120, 230, 36, '#9AA6C8'); ptext(g, '10 分', 330, 240, 72, '#7CF0A0');
    ptext(g, '绕圈那局', 120, 360, 36, '#5C678A'); ptext(g, '33 分', 330, 370, 72, '#5C678A');
    g.fillStyle = '#5C678A'; g.fillRect(320, 340, 230, 5);
    withAlpha(g, clamp((t - CH('f5', 2) + .2) / .3), () => { checkMark(g, 600, 200, 8, C.green); });
  });
}
function confetti(g, t, t0, [cx, cy]) {
  const n = 70, u = t - t0;
  for (let i = 0; i < n; i++) {
    const a = -Math.PI / 2 + (hash(i, 1) - .5) * 2.4, v = 500 + hash(i, 2) * 700;
    const x = cx + Math.cos(a) * v * u, y = cy + Math.sin(a) * v * u + 600 * u * u;
    if (y > H + 20) continue;
    g.fillStyle = ['#FFD34E', '#FF5A4F', '#7CF0A0', '#5EC8FF', '#FF9BC0'][i % 5];
    const s = 10 + hash(i, 3) * 8;
    g.save(); g.translate(Math.round(x), Math.round(y)); g.rotate(u * 6 + i); g.fillRect(-s / 2, -s / 4, s, s / 2); g.restore();
  }
}

/* ================= 三句话 ================= */
function guide(g, t) {
  bgConsole(g, t);
  const x = 360, y = 150, w = 1200, h = 640;
  const a = clamp((t - SS('guide') + .1) / .3);
  withAlpha(g, a, () => {
    g.fillStyle = 'rgba(0,0,0,.45)'; g.fillRect(x + 14, y + 16, w, h);
    g.fillStyle = '#141A2C'; g.fillRect(x, y, w, h);
    g.fillStyle = '#2EBD5A'; g.fillRect(x, y, w, 96);
    rich(g, '★ 定目标之前，先问三句 ★', x + w / 2, y + 50, 52, { stroke: 0, col: C.white });
    const items = [['我真正想要的，是什么？', 'g2'], ['只盯着这个数，会怎么{作弊}？', 'g3'], ['验收时，看{结果}，还是只看分数？', 'g4']];
    items.forEach(([s, id], i) => {
      const yy = y + 200 + i * 130;
      g.fillStyle = '#2C3654'; g.fillRect(x + 80, yy - 40, 64, 64); g.fillStyle = '#141A2C'; g.fillRect(x + 88, yy - 32, 48, 48);
      ptext(g, String(i + 1), x + 112, yy + 4, 36, '#5C678A', { align: 'center' });
      const u = clamp((t - (S(id) - .3)) / .3); if (u <= 0) { g.fillStyle = 'rgba(255,255,255,.06)'; g.fillRect(x + 180, yy - 30, 640, 44); return; }
      withAlpha(g, u, () => {
        if (t > S(id) + .4) { g.fillStyle = '#141A2C'; g.fillRect(x + 88, yy - 32, 48, 48); checkMark(g, x + 92, yy - 22, 7, C.green); }
        rich(g, s, x + 180, yy - 8, 50, { align: 'left', stroke: 0, col: C.white, hl: C.gold, maxW: w - 240 });
      });
    });
    // 给 AI，也给你自己：两只小怪站在卡片右下角
    crabAt(g, x + w - 250, y + h - 92, 5, aiO(t, { eyes: 'up' }));
    crabAt(g, x + w - 110, y + h - 92, 5, youO(t, { eyes: 'up' }));
    withAlpha(g, win(t, CH('g1', 0) - .1, S('g2'), .2, .3), () => { ptag(g, x + w - 250, y + h - 230, '给 AI', 26, { fill: '#7CF0A0' }); ptag(g, x + w - 110, y + h - 230, '给自己', 26, { fill: '#FF8A80' }); });
    ptext(g, '给 AI 定目标、给自己定目标都适用 · 推出来的建议', x + w / 2, y + h - 40, 26, '#7E89A8', { align: 'center' });
  });
}

/* ================= 结尾 ================= */
function endScene(g, t) {
  const cam = camOn(FIN_W[0] + 4, FIN_W[1] - 8, 9, true);
  parkView(g, t, cam, { coins: [0, 0, 0], finishGlow: .3, frog: false }, b => {
    drawAgent(b, t, X.finish[0], X.finish[1] + .15, { look: { eyes: t < CH('z1', 1) - .1 ? blinkEyes(t, 2) : 'happy', light: '#FFD34E' } });
  });
  // 傍晚：慢慢变暖、变暗
  const d = clamp((t - SS('end')) / 2.5);
  g.fillStyle = `rgba(255,140,60,${.12 * d})`; g.fillRect(0, 0, W, H);
  const gr = g.createRadialGradient(960, 520, 200, 960, 520, 1100);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(5,8,18,${.55 * d})`);
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
}

/* ================= 片尾卡 ================= */
function endCard(g, t) {
  bgConsole(g, t, { c1: '#0B0F1C' });
  rich(g, '我训练了一只 AI 小怪 1000 局', 960, 120, 48, { stroke: 0, col: '#C9D3E8' });
  rich(g, '它学会的第一件事，是{作弊}', 960, 205, 76, { stroke: 0, col: C.white, hl: '#FF5A4F' });
  ptext(g, '本片讲到的 5 个 AI 训练原理', 960, 300, 28, '#7E89A8', { align: 'center' });
  const ps = ['① 强化学习：得了分的那一步，下次多走', '② 钻空子：它做的，是你写下来的', '③ 骗过评委：它学会让你觉得好',
    '④ 古德哈特定律：数字成了目标，就不再是好数字', '⑤ 探索：没去过的地方，先当它是好地方'];
  const lw = Math.max(...ps.map(s => pw(g, s, 30)));
  ps.forEach((s, i) => ptext(g, s, 960 - lw / 2, 360 + i * 52, 30, C.white));
  ptext(g, '主演：AI 小怪（真的训练了 1000 局：experiment.py，表格 Q 学习）', 960, 660, 28, '#9AA6C8', { align: 'center' });
  rich(g, '甜菜 出品', 960, 760, 64, { stroke: 0, col: C.gold });
  ptext(g, '画面、字幕、音效：Claude 用代码生成 · 配音：CosyVoice 3 合成', 960, 850, 28, '#7E89A8', { align: 'center' });
  crabAt(g, 1640, 560, 6, aiO(t, { eyes: 'happy' }));
  crabAt(g, 280, 560, 6, youO(t, { eyes: 'happy' }), true);
}

/* ================= 封面（render.cjs cover 用，不带字幕） ================= */
function coverArt(g, t) {
  const rp = replayOf('coin', 'coin'), sps = 7, t0 = -1.2;
  const cam = camOn(RING_C[0] + 70, RING_C[1] - 10, 6, true);
  parkView(g, t, cam, { coins: coinVis(rp, t, t0, sps) }, b => { agentReplay(b, t, rp, t0, sps, { loopFrom: 2, look: { eyes: 'happy' } }); });
  // 绕圈的箭头
  const [cx, cy] = toScr(cam, RING_C[0], RING_C[1]);
  for (let k = 0; k < 16; k++) {
    const a = -1.3 + k * TAU / 16;
    g.fillStyle = k % 2 ? 'rgba(255,255,255,.9)' : 'rgba(255,255,255,.45)';
    g.fillRect(Math.round(cx + Math.cos(a) * 190) - 7, Math.round(cy + Math.sin(a) * 150) - 7, 14, 14);
  }
  // 右边压暗，放大字
  const gr = g.createLinearGradient(700, 0, 1300, 0);
  gr.addColorStop(0, 'rgba(8,10,22,0)'); gr.addColorStop(1, 'rgba(8,10,22,.82)');
  g.fillStyle = gr; g.fillRect(700, 0, W - 700, H);
  ptext(g, '我训练了一只 AI 小怪 1000 局', 1840, 190, 48, '#E6EBF5', { align: 'right', sh: 1 });
  rich(g, '它学会的第一件事', 1430, 330, 104, { stroke: 14, col: C.white, maxW: 900 });
  g.save(); g.translate(1430, 600); g.rotate(-.06);
  rich(g, '作弊', 0, 0, 300, { stroke: 26, strokeCol: '#1B1730', col: '#FF4B3E' });
  g.restore();
  scoreboard(g, t, 1430, 880, 33, 10, { crown: true, scale: .8 });
  ptext(g, '甜菜', W - 30, 44, 24, C.white, { align: 'right', ol: 'rgba(0,0,0,.45)' });
}
