'use strict';
/* scenes3.js：进化错配（汽车座椅 → 办公椅 → 沙发，腿一下班就是一整天；哈扎人每天还要快走、干活一个多小时；
   一百万人的研究：每天动够 1 小时，久坐多出来的风险基本抵消）→ 别让腿下班的三个小办法 → 结尾 → 片尾。 */

/* ================= 进化错配 ================= */
function mismatch(g, t) {
  if (t < S('m2') - .15) { misDay(g, t); return; }
  if (t < S('m3') - .15) { misHadza(g, t); return; }
  misMillion(g, t);
}
/* "你"的一天：开车、上班、窝沙发，三格一格格出来；腿上的肌肉一整天都在睡 */
function misDay(g, t) {
  bgPaper(g, '#EEF2FA', 'rgba(90,110,170,.10)');
  popTag(g, t, SS('mismatch') + .1, 480, 250, '你的一天', 44, { fill: C.gold });
  const k = 6, rows = [
    { y: 560, time: '白天', what: '坐着上班', t0: S('m1') - .2, draw: (cx, sy) => { youInChair(g, t, cx, sy, k, { you: { eyes: 'tired' } }); } },
    { y: 860, time: '晚上', what: '窝沙发', t0: S('m1') + .45, draw: (cx, sy) => { drawSofa(g, cx, sy + 6 * k, k); crabAt(g, cx, sy + 4 * k, k, youO(t, { phone: true, eyes: 'dn' })); } },
    { y: 1160, time: '路上', what: '开车', t0: S('m1') + 1.0, draw: (cx, sy) => { drawCarSeat(g, cx, sy, k); crabAt(g, cx, sy + 4 * k, k, youO(t, { eyes: 'tired' })); drawWheel(g, cx + 26 * k, sy - 10 * k, k, t); } },
  ];
  rows.forEach(r => {
    const p = pop(t, r.t0, .3); if (p <= 0) return;
    g.save(); g.translate(0, (1 - clamp(p)) * 60); g.globalAlpha *= clamp(p);
    pbox(g, 90, r.y - 240, 780, 250, { k: 6, fill: '#FFFFFF', rim: '#DCE3F0' });
    r.draw(250, r.y - 70);
    ptext(g, r.time, 470, r.y - 150, 40, '#7A86A8');
    ptext(g, r.what, 470, r.y - 80, 60, C.ink);
    g.restore();
  });
  // 腿上的肌肉：一整天都在睡
  const tz = CH('m1', 2) - .2;
  if (t > tz) {
    rows.forEach((r, i) => { if (t > tz + i * .12) muscleGuy(g, 760, r.y - 40, 6, t + i, 'sleep'); });
    const p = pop(t, tz + .3, .35);
    g.save(); g.translate(480, 1220); g.scale(p, p); ptag(g, 0, 0, '腿上的肌肉：下班一整天', 40, { fill: '#D3D0DE' }); g.restore();
  }
}
/* 哈扎人：每天还要快走、挖块茎、背水，一个多小时 */
function misHadza(g, t) {
  const b = pbuf('mh', 108, 192);
  savannaBG(b, t, 104);
  blit(g, 'mh', 10);
  const t0 = S('m2') - .15, k = 10;
  // 快走：从左往右走过去
  const wx = 120 + ((t - t0) * 150) % 900;
  shadowAt(g, wx, 1080, k);
  crabAt(g, wx, 1080, k, hadzaO(t, { legs: walkLegs(t, 10), arms: 'upR' }, 3));
  g.fillStyle = '#8C6440'; g.fillRect(Math.round(wx + 10 * k), 1080 - 30 * k, k, 22 * k);
  // 挖块茎：蹲着，木棍一上一下
  const dy = Math.floor(t * 4) % 2 ? 0 : 2 * k;
  shadowAt(g, 690, 1200, k);
  crabAt(g, 690, 1200, k, hadzaO(t, { pose: 'squat', arms: 'upL' }, 6));
  g.fillStyle = '#8C6440'; g.fillRect(560, 1060 + dy, k, 150);
  pixOval(g, 560, 1210, 50, 14, 6, '#8C6A3E');
  popTag(g, t, CH('m2', 1) - .2, 250, 900, '快走', 40, { fill: '#FFE9A8' });
  popTag(g, t, CH('m2', 1) + .2, 690, 1000, '挖块茎', 40, { fill: '#FFE9A8' });
  muscleGuy(g, 860, 790, 6, t, 'work');
  // 计时器：一个多小时
  const pc = pop(t, CH('m2', 2) - .2, .35);
  if (pc > 0) {
    g.save(); g.translate(480, 470); g.scale(pc, pc);
    pbox(g, -300, -150, 600, 300, { k: 6, fill: 'rgba(255,255,255,.94)', rim: '#F4E9D8' });
    ptext(g, '每天动起来', 0, -60, 44, C.ink, { align: 'center' });
    ptext(g, '1 小时+', 0, 80, 120, '#3E9E4F', { align: 'center', ol: C.ink, olw: 6 });
    g.restore();
  }
  popTag(g, t, t0 + .1, 480, 250, '哈扎人除了歇着', 44, { fill: C.gold });
  source(g, 'Raichlen 等 2020：每天中高强度活动 75~100 分钟', 880, 1250, { col: '#6B5A3A' });
}
/* 一百万人：一格格小人铺满；天平——左边"久坐"，右边"每天动 1 小时"，放上去就平了 */
function misMillion(g, t) {
  bgPaper(g, '#FBF6EA');
  const t0 = S('m3') - .15;
  popTag(g, t, t0, 480, 250, '一项 100 万人的研究', 44, { fill: C.gold });
  // 小人铺满上半屏
  const nShow = Math.floor(clamp((t - t0) / 1.2) * 160);
  for (let i = 0; i < nShow; i++) { const c = i % 16, r = Math.floor(i / 16); tinyPerson(g, 135 + c * 46, 340 + r * 40, 3, ['#CB7C5E', '#6E9BD6', '#68BC8A', '#A88BD8', '#DDB04F'][(c * 7 + r * 3) % 5]); }
  // 天平
  const tb = CH('m3', 1) - .2, ta = EN('m3') - .05;
  const pS = E.out(clamp((t - t0 - .6) / .4));
  if (pS > 0) withAlpha(g, pS, () => {
    const right = t > tb, bal = E.io(clamp((t - tb - .1) / .7));
    const tilt = right ? lerp(-1, 0, bal) : -1;
    balanceScale(g, 480, 820, 6, tilt,
      (gg, x, y) => { chairIcon(gg, x, y - 70, 10); ptext(gg, '久坐', x, y + 70, 44, C.ink, { align: 'center' }); },
      (gg, x, y) => { if (!right) return; shoeIcon(gg, x, y - 50, 9); ptext(gg, '每天动 1 小时', x, y + 70, 36, '#3E9E4F', { align: 'center' }); });
  });
  if (t > CH('m3', 2) - .2) popTag(g, t, CH('m3', 2) - .2, 230, 1140, '多出来的风险', 36, { fill: '#FFC2BE' });
  if (t > ta) stamp(g, 640, 1150, '抵消', clamp((t - ta) / .25), { px: 84, rot: -.1, col: '#3E9E4F' });
  source(g, 'Ekelund 等 2016：16 项研究，100 多万人', 880, 1250);
}

/* ================= 别让腿下班的三个小办法 ================= */
function officeYou(b, t) { officeBG(b, t); }
function guide(g, t) {
  const b = pbuf('gd', 108, 192);
  officeYou(b, t);
  blit(g, 'gd', 10);
  // "你"坐着踮脚跟：脚一抬一放
  const heel = t > S('g3') - .2 && Math.floor(t * 3) % 2 === 0;
  youInChair(g, t, 430, 1090, 12, { you: { eyes: heel ? 'happy' : 'n', tip: heel } });
  if (heel) for (const x of [-7, 7]) { g.fillStyle = '#FFFFFF'; g.fillRect(430 + x * 12 - 6, 1090 + 4 * 12 + 4, 12, 6); g.fillRect(430 + x * 12 - 2, 1090 + 4 * 12 + 14, 4, 10); }
  g.fillStyle = 'rgba(20,14,40,.3)'; g.fillRect(0, 0, W, H);
  const pp = E.out(clamp((t - S('g1') + .3) / .4));
  if (pp > 0) {
    g.save(); g.translate(0, (1 - pp) * 500); g.globalAlpha *= pp;
    pbox(g, 60, 290, 840, 540, { k: 6 });
    g.fillStyle = '#3E9E4F'; g.fillRect(72, 302, 816, 72);
    ptext(g, '★ 别让腿下班 ★', 480, 356, 48, C.white, { align: 'center', sh: 1 });
    ptext(g, '可以歇，别一动不动：', 110, 446, 32, '#CFC6E8');
    const rows = [
      [S('g2') - .2, '每坐 {20 分钟}，起来走 2 分钟', 540],
      [S('g3') - .2, '坐着时，{脚跟抬一抬}', 640],
      [S('g4') - .2, '快走、爬楼，每天攒够 {1 小时}', 740],
    ];
    rows.forEach(([t0, s, y]) => {
      const u = pop(t, t0 - .16, .35); if (u <= 0) return;
      withAlpha(g, u, () => { g.fillStyle = C.green; g.fillRect(100, y - 32, 36, 36); g.fillStyle = C.ink; g.fillRect(106, y - 26, 24, 24); if (t > t0 + .4) checkMark(g, 104, y - 30, 4, C.green); prich(g, s, 160, y, 40, C.white, C.gold); });
    });
    source(g, '第 2 条是按原理推出来的', 880, 800, { px: 22, col: '#9C93C0' });
    g.restore();
  }
}

/* ================= 结尾 ================= */
function endScene(g, t) {
  const b = pbuf('en', 108, 192);
  savannaBG(b, t, 112, { dusk: .55 });
  drawFire(b, 50, 120, t);
  blit(g, 'en', 10);
  // "你"站起来伸懒腰；旁边的原始人蹲着歇，两个人的肌肉都在上班
  const stretch = Math.floor(t * 1.5) % 2 === 0;
  shadowAt(g, 300, 1180, 12);
  crabAt(g, 300, 1180, 12, youO(t, { arms: stretch ? 'up' : 'n', eyes: t > S('z1') - .2 ? 'happy' : 'n' }));
  shadowAt(g, 690, 1180, 12);
  crabAt(g, 690, 1180, 12, cavemanO(t, { pose: 'squat', eyes: 'happy' }), true);
  if (t > S('z1') - .2) { muscleGuy(g, 300, 900, 6, t, 'wave'); muscleGuy(g, 690, 900, 6, t, 'work'); }
  dialogBox(g, t, 'd3', PORTRAIT.youHappy);
  if (t > S('d3') + .1) {
    const p = pop(t, S('d3') + .1, .35);
    g.save(); g.translate(480, 420); g.scale(p, p);
    pbox(g, -390, -120, 780, 240, { k: 6 });
    prich(g, '不是坐太久，', 0, -20, 48, C.white, C.gold, { align: 'center' });
    prich(g, '是{瘫}太久。', 0, 60, 48, C.white, C.gold, { align: 'center' });
    g.restore();
  }
}

/* ================= 片尾 ================= */
function endCard(g, t) {
  const b = pbuf('cd', 108, 192);
  savannaBG(b, t, 112, { dusk: .55 });
  blit(g, 'cd', 10);
  crabAt(g, 300, 1180, 12, youO(t, { eyes: 'happy', arms: 'upL' }));
  crabAt(g, 690, 1180, 12, cavemanO(t, { pose: 'squat', eyes: 'happy' }), true);
  g.fillStyle = 'rgba(10,8,24,.45)'; g.fillRect(0, 0, W, H);
  const p = E.out(clamp((t - SS('card') - .05) / .3));
  g.save(); g.globalAlpha *= p;
  pbox(g, 60, 520, 840, 420, { k: 6, fill: 'rgba(27,23,48,.92)' });
  ptext(g, '原始人为什么不怕久坐？', 480, 640, 48, C.white, { align: 'center', sh: 1 });
  prich(g, '可以歇，别{瘫着}。', 480, 740, 40, C.white, C.gold, { align: 'center' });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(130, 790, 700, 4);
  ptext(g, '甜菜  出品', 480, 860, 36, C.amber, { align: 'center' });
  // 配音也是 AI 合成的，一并写明
  ptext(g, '画面、字幕、音效：Claude 用代码生成 · 配音：CosyVoice 3 合成', 480, 905, 24, '#9C93C0', { align: 'center' });
  g.restore();
}
