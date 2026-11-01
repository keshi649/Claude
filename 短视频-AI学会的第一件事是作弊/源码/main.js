'use strict';
/* main.js：场景编排、转场、HUD、字幕与逐帧入口 */

const fnOr = name => (typeof window[name] === 'function' ? window[name] : null);
const SCENE_FN = {
  hook: fnOr('hook'), learn: fnOr('learn'), loop: fnOr('loopScene'), dance: fnOr('dance'), judge: fnOr('judge'),
  real: fnOr('realScene'), fix: fnOr('fix'), guide: fnOr('guide'), end: fnOr('endScene'), card: fnOr('endCard'),
};
const TRANS = { hook: null, learn: 'cut', loop: 'cut', dance: 'glitch', judge: 'slide', real: 'glitch', fix: 'slide', guide: 'cut', end: 'iris', card: 'iris' };
const SCENES = [];
TL.scenes.forEach((s, i) => {
  const fn = SCENE_FN[s.name]; if (!fn) return;
  const next = TL.scenes[i + 1];
  SCENES.push([i ? s.t0 - .25 : 0, next ? s.t1 + .3 : DURATION + 1, fn, TRANS[s.name]]);
});

function composite(g, src, tr, u) {
  g.save();
  if (tr === 'iris') {
    const r = E.in(u) * 1250, k = 24;
    g.beginPath();
    for (let y = -r; y < r; y += k) { const hw = Math.sqrt(Math.max(0, r * r - y * y)); const hx = Math.ceil(hw / k) * k; g.rect(960 - hx, 540 + y, hx * 2, k); }
    g.clip(); g.drawImage(src, 0, 0); g.restore();
    return;
  }
  if (tr === 'slide') { const x = Math.round((1 - E.io(u)) * W / 12) * 12; g.drawImage(src, x, 0); g.fillStyle = C.ink; g.fillRect(x - 12, 0, 12, H); }
  else if (tr === 'cut') { if (u >= .5) g.drawImage(src, 0, 0); }
  else if (tr === 'glitch') {
    if (u >= .5) g.drawImage(src, 0, 0);
    const k = Math.floor(u * 12);
    for (let i = 0; i < 8; i++) { const y = hash(i, k) * H, h = 20 + hash(i, k, 1) * 90, dx = (hash(i, k, 2) - .5) * 160; g.drawImage(u >= .5 ? src : cv, 0, y, W, h, dx, y, W, h); }
  }
  else { g.globalAlpha = E.sine(u); g.drawImage(src, 0, 0); }
  g.restore();
}

/* ---------- 叠加层：水印 ---------- */
function overlays(g, t) {
  if (t < SS('card')) withAlpha(g, .6, () => ptext(g, '甜菜', W - 30, 44, 24, C.white, { align: 'right', ol: 'rgba(0,0,0,.45)' }));
}

/* 暗角 */
const vignCv = (() => {
  const c = mk(), g = c.getContext('2d');
  const gr = g.createRadialGradient(960, 540, 600, 960, 540, 1250);
  gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, 'rgba(0,0,0,.32)');
  g.fillStyle = gr; g.fillRect(0, 0, W, H);
  return c;
})();

function frame(t) {
  ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.filter = 'none'; ctx.globalCompositeOperation = 'source-over';
  ctx.imageSmoothingEnabled = true;
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  if (window.COVER && typeof coverArt === 'function') { coverArt(ctx, t); return; }
  const act = SCENES.filter(([a, b]) => t >= a && t < b);
  act.forEach(([a, b, fn, tr], idx) => {
    if (idx === 0) { ctx.save(); fn(ctx, t); ctx.restore(); return; }
    const prevEnd = act[idx - 1][1], u = clamp((t - a) / Math.max(.001, prevEnd - a));
    sceneG.setTransform(1, 0, 0, 1, 0, 0); sceneG.globalAlpha = 1; sceneG.filter = 'none'; sceneG.clearRect(0, 0, W, H);
    sceneG.save(); fn(sceneG, t); sceneG.restore();
    composite(ctx, sceneCv, tr, u);
  });
  ctx.save();
  ctx.drawImage(vignCv, 0, 0);
  overlays(ctx, t);
  subPlate(ctx, t);
  drawSubs(ctx, t);
  if (t > DURATION - .6) { ctx.fillStyle = `rgba(0,0,0,${seg(t, DURATION - .6, DURATION)})`; ctx.fillRect(0, 0, W, H); }
  ctx.restore();
}
window.frame = frame;

/* ---------- 音效计划：回放里每一步的脚步、撞树、金币、+1、进终点（audio.py 读 out/sfx.json） ---------- */
function sfxPlan() {
  const ev = [];
  const add = (t, kind, o = {}) => ev.push(Object.assign({ t: Math.round(t * 1000) / 1000, kind }, o));
  /* 扫一段回放：在 [w0, w1) 里每走完一步记一次；map 把回放时间换成画面时间（跳舞前那一拍停顿） */
  function scan(rp, t0, sps, w0, w1, o = {}, map = x => x, unmap = x => x) {
    const n = rp.path.length - 1, loop = o.loopFrom !== undefined;
    const k0 = Math.max(1, Math.ceil((unmap(w0) - t0) * sps)), k1 = Math.floor((unmap(w1) - t0) * sps);
    for (let k = k0; k <= k1; k++) {
      let i = k;
      if (loop && k > n) i = o.loopFrom + (k - o.loopFrom) % (n - o.loopFrom);
      if (i > n) break;
      const tt = map(t0 + k / sps), st = rp.steps[i], moved = rp.path[i] !== rp.path[i - 1 < 0 ? 0 : i - 1] || (loop && k > n);
      if (tt < w0 || tt >= w1) continue;
      add(tt, moved ? 'step' : 'bump', { pan: (CELL[rp.path[i]][0] / X.W - .5) * 1.2, q: o.q || 1 });
      st.ev.forEach(e => add(tt, e, { pan: (CELL[rp.path[i]][0] / X.W - .5) * 1.2, q: o.q || 1 }));
    }
  }
  const coin = replayOf('coin', 'coin');
  scan(coin, T_HOOK.t0, T_HOOK.sps, 0, T_HOOK.tB, { loopFrom: 2 });
  scan(coin, T_HOOK.t0, T_HOOK.sps, T_HOOK.tC, T_HOOK.tD, { loopFrom: 2, q: .6 });
  scan(replayOf('ep1', 'coin'), T_LEARN.t0, T_LEARN.sps, T_LEARN.t0, SE('learn') + .3);
  scan(replayOf('lap', 'coin'), T_LOOP.lapT0, T_LOOP.spsLap, SS('loop') - .25, S('l2') - .1);
  add(T_LOOP.tc + .3, 'step'); add(T_LOOP.tc + .8, 'coin'); add(T_LOOP.tc + 1.2, 'step');
  for (let k = 0; k < 6; k++) add(T_LOOP.tc + .8 + (k + 1) * .4, 'tick');
  add(T_LOOP.tc + 3.2, 'regrow');
  scan(coin, T_LOOP.loopT0, T_LOOP.sps, T_LOOP.tLoop, SE('loop') + .3, { loopFrom: 2 });
  const D = T_DANCE, pause = D.tDance - D.tArrive;
  scan(replayOf('shaping', 'shaping'), D.tRun, D.sps, D.tRun, SE('dance') + .3, { loopFrom: D.arrive + 2 },
    x => x < D.tArrive ? x : x + pause, x => x < D.tArrive ? x : x < D.tDance ? D.tArrive : x - pause);
  // 拿球：每走一格一声脚步，最后一下"抓"
  const bp = X.replays.ball.path;
  for (let i = 1; i < bp.length; i++) add(T_BALL.t0 + i / T_BALL.sps, bp[i] !== bp[i - 1] ? 'step' : 'grab');
  // 从头学：乱走；加好奇心以后快放 3 局，第 4 局进终点
  const F = T_FIX;
  scan(replayOf('wander', 'finish'), F.wanderT0, F.wanderSps, F.tFog, F.tFast, { q: .7 });
  X.replays.curious.forEach((c, k) => {
    const last = k === X.replays.curious.length - 1;
    const t0 = last ? F.tLast : F.tFast + k * F.fastDur, sps = last ? F.spsLast : (c.path.length - 1) / F.fastDur;
    add(t0, 'rush', { d: last ? F.tArr - F.tLast : F.fastDur });
  });
  add(F.tArr, 'finish');
  return ev.sort((a, b) => a.t - b.t);
}
window.sfxPlan = sfxPlan;
window.DURATION = DURATION;
window.READY = false;
Promise.all(['Pix', 'Smiley'].map(f => document.fonts.load(`48px ${f}`, '测试我训练了一只AI小怪它学会的第一件事是作弊记分表'))).then(() => { window.READY = true; });
