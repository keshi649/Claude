'use strict';
/* scenes1.js：开头（冷开场 + 片名）、第 1 局（记分表、瞎试、原理 1）、池塘边的小环路（绕圈刷分）。 */

/* 环路中心（世界坐标）和常用机位 */
const RING_C = [3 * TILE + 16, 5 * TILE + 16];
const CAM_RING = camOn(RING_C[0] + 40, RING_C[1] - 6, 6);
const CAM_LEFT = camOn(150, 190, 4.5);

/* 回放的时间表（画面和音效共用：main.js 的 sfxPlan 按它算脚步、金币的声音） */
const T_HOOK = { t0: -1.2, sps: 7, loopFrom: 2, tB: S('h2') - .02, tC: S('h3') - .15, tD: S('h4') - .2, tStamp: MK('h2') - .3 };   // 红章落在"可它，"后面那个停顿里
const T_LEARN = { t0: S('s3') + .2, sps: 6 };
const T_LOOP = (() => {
  const lap = replayOf('lap', 'coin'), spsLap = 6, tLap = S('l1') + .1;
  const off = Math.max(0, lap.path.findIndex((c, i) => i > 0 && RINGC.includes(c)) - 3);
  return { lapT0: tLap - off / spsLap, spsLap, tc: S('l2') - .1, tLoop: S('l3') - .2, sps: 7, loopT0: S('l3') - .2 - 2 / 7 };
})();

/* 回放 + 屏幕上的 "+1"：在世界缓冲里画小怪，返回这一步的状态 */
function agentReplay(b, t, rp, t0, sps, o = {}) {
  const r = replayAt(rp, t, t0, sps, o);
  drawAgent(b, t, r.x, r.y, { hop: r.hop, moving: r.moving, flip: r.dir < 0, look: o.look });
  return r;
}
/* 回放过程中吃到金币 / 往终点走一步的 "+1"（屏幕坐标） */
function replayPops(g, t, rp, t0, sps, cam, o = {}) {
  const n = rp.path.length - 1, upto = Math.min(n, Math.floor((t - t0) * sps));
  for (let i = Math.max(1, upto - 8); i <= upto; i++) {
    const st = rp.steps[i]; if (!st || !st.ev.length) continue;
    const [cx, cy] = CELL[rp.path[i]];
    const [sx, sy] = toScr(cam, cx * TILE + 16, cy * TILE + 4);
    const s = st.ev.includes('finish') ? '+10' : '+1';
    if (o.only && !st.ev.some(e => o.only.includes(e))) continue;
    floatText(g, t, stepTime(t0, sps, i), sx, sy, s, { px: o.px || 36, col: st.ev.includes('coin') ? C.gold : '#7CF0A0' });
  }
}
/* 金币在回放第几步时的样子（1 在，0 没了；刚长出来时从小变大） */
function coinVis(rp, t, t0, sps) {
  const i = Math.max(0, Math.min(rp.steps.length - 1, Math.floor((t - t0) * sps)));
  const cur = rp.steps[i].coins, prev = i > 0 ? rp.steps[i - 1].coins : cur;
  const f = (t - t0) * sps - i;
  return cur.map((v, k) => v ? (prev[k] ? 1 : clamp(f * 2)) : 0);
}

/* ================= 开头 ================= */
function hook(g, t) {
  const rp = replayOf('coin', 'coin');
  const { tB, tC, tD } = T_HOOK;
  if (t < tB) {                                    // 镜头 A：环路特写，AI 在绕圈；大比分牌
    const { t0, sps } = T_HOOK;
    const cam = camOn(RING_C[0] + 40, RING_C[1] - 14, 6, true);
    let r;
    parkView(g, t, cam, { coins: coinVis(rp, t, t0, sps) }, b => { r = agentReplay(b, t, rp, t0, sps, { loopFrom: 2 }); });
    replayPops(g, t, rp, t0, sps, cam, { px: 48 });
    // 绕圈的箭头
    withAlpha(g, .85, () => {
      const [cx, cy] = toScr(cam, RING_C[0], RING_C[1]);
      for (let k = 0; k < 14; k++) {
        const a = -t * 2.2 + k * TAU / 14, rr = 150;
        g.fillStyle = k % 2 ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.35)';
        g.fillRect(Math.round(cx + Math.cos(a) * rr * 1.25) - 5, Math.round(cy + Math.sin(a) * rr) - 5, 10, 10);
      }
    });
    scoreboard(g, t, 960, 190, 33, 10, { crown: true, scale: lerp(.85, 1, E.back(clamp(t / .4))) });
    dialogBox(g, t, 'd1', portraitClawd(youO(t), 5));
    return;
  }
  if (t < tC) {                                    // 镜头 B：黑底，"到终点 0 次" + 红章
    bgConsole(g, t);
    const u = clamp((t - tB) / .3);
    withAlpha(g, u, () => {
      ptext(g, '训练记录 · 第 1~400 局', 960, 230, 36, '#8A93B0', { align: 'center' });
      const a = pw(g, '到终点', 84), b = pw(g, '0', 288), c = pw(g, '次', 84), gap = 40, x0 = 960 - (a + b + c + gap * 2) / 2;
      ptext(g, '到终点', x0, 560, 84, '#C9D3E8');
      ptext(g, '0', x0 + a + gap, 620, 288, '#FF5A4F', { sh: 1 });
      ptext(g, '次', x0 + a + b + gap * 2, 560, 84, '#C9D3E8');
      crabAt(g, 1560, 760, 10, aiO(t, { eyes: Math.floor(t * 2.5) % 2 ? 'l' : 'r' }));
      shadowAt(g, 1560, 762, 10, 22);
    });
    g.fillStyle = 'rgba(255,255,255,.92)'; const sp = clamp((t - T_HOOK.tStamp) / .5);
    if (sp > 0) withAlpha(g, clamp(sp * 6), () => { g.save(); g.translate(960, 790); g.rotate(-.08); g.fillRect(-330, -70, 660, 140); g.restore(); });
    stamp(g, 960, 790, '一次都没到终点', sp, { px: 72, rot: -.08 });
    return;
  }
  if (t < tD) {                                    // 镜头 C：拉远看整张图：它在角落绕圈，终点在最右边
    const { t0, sps } = T_HOOK;
    const u = E.io(clamp((t - tC) / 1.6));
    const cam = camLerp(camOn(RING_C[0] + 40, RING_C[1] - 6, 4.2), CAM_FULL, u);
    parkView(g, t, cam, { coins: coinVis(rp, t, t0, sps), finishGlow: .5 + .5 * Math.sin(t * 5) }, b => { agentReplay(b, t, rp, t0, sps, { loopFrom: 2 }); });
    topBar(g, t, { ep: 400, rule: '规则 v1', score: replayAt(rp, t, t0, sps, { loopFrom: 2 }).st.score % 34, done: false });
    withAlpha(g, clamp((t - tC - 1.2) / .4), () => {
      // "终点"标签放在拱门左边（右边那一列会被抖音的按钮挡住），箭头指过去
      const [fx, fy] = toScr(cam, X.finish[0] * TILE + 16, X.finish[1] * TILE - 30);
      const tx = Math.min(fx, 1560) - 120;
      ptag(g, tx, fy + 10, '终点', 36, { fill: C.gold });
      pixArrow(g, tx + 52, fy + 10, fx - 50, fy + 10, 6, C.gold, 1);
      const [sx, sy] = toScr(cam, RING_C[0], RING_C[1] - 70);
      ptag(g, sx, sy - 40, '它在这儿', 36, { fill: '#7CF0A0' });
      // 从环路到终点的虚线
      const pts = [[2, 7], [2, 8], [6, 8], [6, 5], [13, 5], [13, 2], [17, 2], [17, 7]].map(([x, y]) => toScr(cam, x * TILE + 16, y * TILE + 16));
      const total = pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
      let left = total * clamp((t - tC - 1.3) / 1.2);
      for (let i = 1; i < pts.length && left > 0; i++) {
        const [x0, y0] = pts[i - 1], [x1, y1] = pts[i], L = Math.hypot(x1 - x0, y1 - y0), uu = Math.min(1, left / L);
        pixArrow(g, x0, y0, x0 + (x1 - x0) * uu, y0 + (y1 - y0) * uu, 6, 'rgba(255,255,255,.8)', i === pts.length - 1 ? uu : .999);
        left -= L;
      }
    });
    return;
  }
  // 镜头 D：片名
  bgConsole(g, t, { c1: '#0B0F1C' });
  const u0 = t - tD;
  withAlpha(g, clamp(u0 / .3), () => {
    rich(g, '我训练了一只 AI 小怪 {1000} 局', 960, 250, 72, { stroke: 0, col: '#E6EBF5', hl: C.gold });
  });
  const p = E.back(clamp((u0 - .9) / .45));
  if (p > 0) {
    g.save(); g.translate(960, 420); g.scale(p, p);
    rich(g, '它学会的第一件事，是{作弊}', 0, 0, 120, { stroke: 14, strokeCol: '#1B1730', col: C.white, hl: '#FF5A4F' });
    g.restore();
  }
  withAlpha(g, clamp((u0 - 2.2) / .4), () => ptext(g, '顺便讲懂 5 个 AI 训练原理', 960, 560, 36, '#9AA6C8', { align: 'center' }));
  // 小怪：眼睛滴溜溜地转
  const look = ['l', 'n', 'r', 'n'][Math.floor(t * 2) % 4];
  crabAt(g, 960, 860, 9, aiO(t, { eyes: look, mouth: u0 > 2.6 ? 'smile' : undefined }));
  shadowAt(g, 960, 862, 9, 22);
  // 终端：一行命令慢慢打出来
  const cmd = '> python3 experiment.py --episodes 1000', n = Math.floor(clamp((u0 - .3) / 2.4) * cmd.length);
  g.fillStyle = 'rgba(255,255,255,.05)'; g.fillRect(560, 930, 800, 54);
  ptext(g, cmd.slice(0, n) + (Math.floor(t * 3) % 2 ? '▌' : ''), 584, 968, 24, '#7CF0A0');
}

/* ================= 第 1 局：记分表、瞎试、原理 1 ================= */
const RULES_V1 = [{ s: '· 吃到金币 {+1}' }, { s: '· 跑到终点 {+10}' }];
function learn(g, t) {
  const rp = replayOf('ep1', 'coin');
  const { t0, sps } = T_LEARN;
  const zu = E.io(clamp((t - (S('s3') - .2)) / .8)) * (1 - E.io(clamp((t - (S('s4') - .6)) / .6)));
  const cam = camLerp(CAM_FULL, CAM_LEFT, zu);
  // 倒带：局数从 400 滚回 1
  const rew = clamp((t - SS('learn') + .1) / 1.1);
  const ep = rew < 1 ? Math.max(1, Math.round(400 * (1 - E.io(rew)))) : 1;
  let r;
  parkView(g, t, cam, { coins: t < t0 ? [1, 1, 1] : coinVis(rp, t, t0, sps) }, b => {
    if (t < t0) drawAgent(b, t, X.start[0], X.start[1], {});
    else r = agentReplay(b, t, rp, t0, sps);
  });
  if (t >= t0) {
    replayPops(g, t, rp, t0, sps, cam);
    // 撞到树：头上冒问号
    const rr = replayAt(rp, t, t0, sps);
    if (!rr.moving && !rr.done && rr.i > 0) {
      const [sx, sy] = toScr(cam, rr.x * TILE + 16, rr.y * TILE - 8);
      ptext(g, '?', sx, sy - 18, 48, C.white, { align: 'center', ol: C.ink, olw: 6 });
    }
  }
  const st = t >= t0 ? replayAt(rp, t, t0, sps).st : { score: 0 };
  topBar(g, t, { ep, rule: '规则 v1', score: st.score, done: false });
  vcr(g, t, SS('learn') - .2, SS('learn') + 1.15, 'rew', '倒回第 1 局', null, { y: 200 });
  // 记分表从左边滑进来
  const cardIn = E.out(clamp((t - (CH('s1', 1) - .3)) / .45));
  if (cardIn > 0) {
    const lines = RULES_V1.map((l, i) => Object.assign({}, l, { add: clamp((t - (CH('s2', i) - .25)) / .25) }));
    ruleCard(g, t, lerp(-480, 40, cardIn), 150, '记分表 v1', lines, { rot: -.02 });
  }
  // 说到金币、终点时，地图上的东西闪一下
  const hiCoin = win(t, CH('s2', 0) - .2, CH('s2', 1) - .1, .1, .2), hiFin = win(t, CH('s2', 1) - .2, S('s3'), .1, .2);
  if (hiCoin > 0) RINGC.forEach(c => { const [x, y] = CELL[c]; const [sx, sy] = toScr(cam, x * TILE + 16, y * TILE + 15); withAlpha(g, hiCoin, () => { g.strokeStyle = C.gold; g.lineWidth = 6; g.strokeRect(sx - 40, sy - 40, 80, 80); }); });
  if (hiFin > 0) { const [sx, sy] = toScr(cam, X.finish[0] * TILE + 16, X.finish[1] * TILE + 4); withAlpha(g, hiFin, () => { g.strokeStyle = C.gold; g.lineWidth = 6; g.strokeRect(sx - 70, sy - 110, 140, 160); }); }
  // 原理 1
  principleCard(g, t, S('s4') - .3, SE('learn') + .2, 1, '强化学习：{得了分的那一步，下次多走}', (g2, x, y, w, h) => drawP1(g2, t, x, y, w, h));
}
/* 原理 1 的示意：一个路口、四个方向的"想走程度"；往上走吃到金币，"上"这一条变长 */
function drawP1(g, t, x, y, w, h) {
  const t1 = CH('s4', 1) - .1;
  const u = E.out(clamp((t - t1) / .6));
  const cx = x + 330, cy = y + 230, k = 6;
  // 路口
  g.fillStyle = '#E3C08A'; g.fillRect(cx - 50, cy - 170, 100, 340); g.fillRect(cx - 170, cy - 50, 340, 100);
  // 上面的金币
  if (t < t1) { const bb = pbuf('coin1', 16, 16); drawCoin(bb, 8, 8, t); g.imageSmoothingEnabled = false; g.drawImage(BUF.coin1, cx - 24, cy - 166, 48, 48); }
  else floatText(g, t, t1, cx, cy - 130, '+1', { px: 48 });
  crabAt(g, cx, cy + 36, 4, aiO(t, { eyes: t > t1 ? 'happy' : 'up' }));
  // 四个方向的"想走程度"
  const base = [.25, .25, .25, .25], after = [.55, .15, .15, .15];
  const v = base.map((b, i) => lerp(b, after[i], u));
  const names = ['↑ 上', '→ 右', '↓ 下', '← 左'];
  const bx = x + 640, by = y + 90;
  ptext(g, '它有多想往这边走', bx, by - 20, 30, '#9AA6C8');
  v.forEach((p, i) => {
    const yy = by + 30 + i * 80;
    ptext(g, names[i], bx, yy + 34, 36, C.white);
    g.fillStyle = '#2C3654'; g.fillRect(bx + 130, yy, 300, 46);
    g.fillStyle = i === 0 ? C.gold : '#55B7B5'; g.fillRect(bx + 130, yy, Math.round(300 * p / .6), 46);
    ptext(g, Math.round(p * 100) + '%', bx + 450, yy + 36, 36, i === 0 ? C.gold : '#C9D3E8');
  });
  withAlpha(g, clamp((t - (CH('s4', 2) - .2)) / .3), () => rich(g, '没人教它，全靠{试}', x + 330, y + h - 30, 40, { stroke: 0, col: '#C9D3E8', hl: C.gold }));
}

/* ================= 池塘边的小环路 ================= */
function loopScene(g, t) {
  const lap = replayOf('lap', 'coin'), rp = replayOf('coin', 'coin');
  const { spsLap, tLoop, sps } = T_LOOP;
  const cam = CAM_RING;
  let r, ep, st;
  if (t < S('l2') - .1) {                         // 第 20 局：第一次绕完一整圈
    const t0 = T_LOOP.lapT0;
    parkView(g, t, cam, { coins: coinVis(lap, t, t0, spsLap) }, b => { r = agentReplay(b, t, lap, t0, spsLap); });
    replayPops(g, t, lap, t0, spsLap, cam, { px: 48 });
    ep = MS.first_lap; st = r.st;
    // 走过的环路格子亮起来
    const seen = new Set(lap.path.slice(0, r.i + 1));
    withAlpha(g, .5, () => [[2, 4], [3, 4], [4, 4], [4, 5], [4, 6], [3, 6], [2, 6], [2, 5]].forEach(([x, y]) => {
      if (!seen.has(CIDX[x + ',' + y])) return;
      const [sx, sy] = toScr(cam, x * TILE, y * TILE);
      g.strokeStyle = '#7CF0A0'; g.lineWidth = 6; g.strokeRect(sx + 6, sy + 6, TILE * cam.P - 12, TILE * cam.P - 12);
    }));
  } else if (t < tLoop) {                          // 金币吃掉以后，过 6 步又长出来
    const tc = T_LOOP.tc, u = t - tc;
    const coins = [u < .8 ? 1 : u < 3.2 ? 0 : clamp((u - 3.2) * 3), 1, 1];
    const ay = 5 - E.io(clamp((u - .3) / .5)), ax = 2 + E.io(clamp((u - 1.2) / .5));
    parkView(g, t, cam, { coins }, b => { drawAgent(b, t, ax, ay, { moving: (u > .3 && u < .8) || (u > 1.2 && u < 1.7), look: { eyes: u > 3.2 ? 'wide' : u > 1.7 ? 'l' : 'up' } }); });
    ep = MS.first_lap; st = { score: u < .8 ? 2 : 3 };
    const [sx, sy] = toScr(cam, 2 * TILE + 16, 4 * TILE + 15);
    floatText(g, t, tc + .8, sx, sy - 40, '+1', { px: 48 });
    if (u > .8 && u < 3.4) {                       // 倒计时 6 步
      const k = Math.min(6, Math.floor((u - .8) / .4) + 1);
      g.save(); g.translate(sx, sy);
      for (let i = 0; i < 6; i++) { g.fillStyle = i < k ? C.gold : 'rgba(255,255,255,.25)'; const a = -Math.PI / 2 + i * TAU / 6; g.fillRect(Math.round(Math.cos(a) * 46) - 8, Math.round(Math.sin(a) * 46) - 8, 16, 16); }
      g.restore();
      ptext(g, `${k} 步`, sx, sy + 96, 36, C.white, { align: 'center', ol: C.ink, olw: 5 });
    }
    if (u > 3.2) floatText(g, t, tc + 3.2, sx, sy - 70, '又长出来了！', { px: 36, col: '#7CF0A0', d: 1.2 });
  } else {                                         // 训练好以后：一直绕圈
    const t0 = T_LOOP.loopT0;
    parkView(g, t, cam, { coins: coinVis(rp, t, t0, sps) }, b => { r = agentReplay(b, t, rp, t0, sps, { loopFrom: 2, look: { eyes: 'happy' } }); });
    replayPops(g, t, rp, t0, sps, cam, { px: 48 });
    ep = Math.round(lerp(MS.first_lap, 400, E.io(clamp((t - tLoop) / 2.5))));
    st = r.st;
    withAlpha(g, clamp((t - tLoop - .3) / .4) * .9, () => {   // 绕圈的箭头
      const [cx, cy] = toScr(cam, RING_C[0], RING_C[1]);
      for (let k = 0; k < 14; k++) {
        const a = -t * 2.2 + k * TAU / 14;
        g.fillStyle = k % 2 ? 'rgba(255,255,255,.75)' : 'rgba(255,255,255,.35)';
        g.fillRect(Math.round(cx + Math.cos(a) * 188) - 5, Math.round(cy + Math.sin(a) * 150) - 5, 10, 10);
      }
    });
    // 三倍多：两根横条
    const ub = clamp((t - (S('l4') - .3)) / .5) * (1 - clamp((t - (S('l5') - .4)) / .3));
    if (ub > 0) withAlpha(g, ub, () => {
      const x0 = 860, y0 = 300;
      g.fillStyle = 'rgba(10,14,28,.88)'; g.fillRect(x0 - 30, y0 - 70, 800, 330);
      ptext(g, '一局下来的分数', x0, y0 - 20, 30, '#9AA6C8');
      const bar = (yy, label, v, col, uu) => {
        ptext(g, label, x0, yy + 40, 36, C.white);
        g.fillStyle = '#2C3654'; g.fillRect(x0 + 230, yy, 440, 56);
        g.fillStyle = col; g.fillRect(x0 + 230, yy, Math.round(440 * v / 33 * uu), 56);
        ptext(g, String(Math.round(v * uu)), x0 + 690, yy + 44, 48, col);
      };
      bar(y0 + 20, '绕圈', 33, C.gold, E.out(clamp((t - S('l4') + .2) / .8)));
      bar(y0 + 120, '跑到终点', 10, '#7CF0A0', E.out(clamp((t - S('l4') - .2) / .8)));
      withAlpha(g, clamp((t - CH('l4', 1) - .2) / .3), () => ptext(g, '× 3.3', x0 + 620, y0 + 240, 48, '#FF8A3D', { align: 'right' }));
    });
    // 2016 年的赛艇：右上角小窗
    const ub2 = clamp((t - (S('l5') - .25)) / .4);
    if (ub2 > 0) withAlpha(g, ub2, () => boatInset(g, t, 980, 230, 630, 378));
  }
  topBar(g, t, { ep, rule: '规则 v1', score: st.score, done: false });
  sourceTag(g, t, S('l5') - .1, SE('loop') + .3, 'OpenAI · 2016 · 赛艇游戏 CoastRunners：在小湾里绕圈撞奖励，分数比人类高约 20%');
}
/* 赛艇小窗：一个小湾、三个会重新出现的目标、一艘一直绕圈的船（示意） */
function boatInset(g, t, x, y, w, h) {
  g.fillStyle = '#0B0F1C'; g.fillRect(x - 8, y - 8, w + 16, h + 16);
  const b = pbuf('lagoon', 140, 84);
  b.fillStyle = '#2E7FC0'; b.fillRect(0, 0, 140, 84);
  for (let i = 0; i < 40; i++) { const xx = (hash(i, 1) * 140 + t * 6) % 140, yy = hash(i, 2) * 84; prect(b, xx, yy, 3, 1, '#5FA9E6'); }
  pell(b, 70, 46, 40, 26, '#3A8FD0'); pell(b, 70, 46, 12, 7, '#D9C27A'); pell(b, 70, 45, 9, 5, '#6BBF5A');
  // 赛道（上方横着）
  prect(b, 0, 4, 140, 10, '#3A8FD0'); for (let i = 0; i < 140; i += 8) prect(b, i, 4, 4, 1, '#FFFFFF');
  const a = t * 2.4;
  for (let k = 0; k < 3; k++) {
    const aa = k * TAU / 3 + .5, hit = ((a - aa) % TAU + TAU) % TAU < .5;
    if (!hit) { pdisc(b, 70 + Math.cos(aa) * 26, 46 + Math.sin(aa) * 16, 3, '#F2C230'); pdot(b, 70 + Math.cos(aa) * 26, 46 + Math.sin(aa) * 16, '#FFFFFF'); }
  }
  const bx = 70 + Math.cos(a) * 26, by = 46 + Math.sin(a) * 16;
  pell(b, bx, by, 5, 3, '#F4F4F4'); prect(b, bx - 1, by - 3, 2, 3, '#E5322D');
  for (let i = 1; i < 6; i++) pdot(b, 70 + Math.cos(a - i * .12) * 26, 46 + Math.sin(a - i * .12) * 16, 'rgba(255,255,255,.7)');
  g.imageSmoothingEnabled = false; g.drawImage(BUF.lagoon, x, y, w, h);
  ptag(g, x + 20, y + 30, '2016 · 赛艇 AI（示意）', 26, { align: 'left', fill: '#55B7B5', col: '#0B0F1C' });
}
