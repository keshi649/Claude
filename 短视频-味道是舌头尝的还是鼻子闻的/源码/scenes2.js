'use strict';
/* scenes2.js：舌头只认得五种味道（大舌头、五个徽章、不认识草莓 / 咖啡 / 巧克力；5 色颜料盒 vs 400 色调色板），
   鼻子的两扇门（剖开的脑袋：前门是鼻孔，后门在嗓子眼上面；嚼的时候香气走后门；大脑把功劳记在舌头头上；感冒鼻塞，后门堵了）。 */

/* ================= 舌头只认得五种味道 ================= */
function body(g, t) {
  if (t < S('s3') - .12) { bodyTongue(g, t); return; }
  bodyPalette(g, t);
}
const BADGE_POS = [[200, 640], [340, 540], [480, 500], [620, 540], [760, 640]];
const FLAVORS = [['straw', 220, 1120, '草莓味'], ['coffee', 480, 1160, '咖啡味'], ['choco', 740, 1120, '巧克力味']];
function bodyTongue(g, t) {
  bgPaper(g, '#DFF5EA', 'rgba(60,140,100,.10)');
  const s2 = S('s2') - .2;
  // 五个徽章：一个个弹出来；说到草莓味时缩成一排挂到上面
  const shrink = E.io(clamp((t - s2) / .5));
  TASTES.forEach(([ch, col], i) => {
    const p = pop(t, CH('s1', 2) - .15 + i * .26, .3);
    if (p <= 0) return;
    const [x0, y0] = BADGE_POS[i], x = lerp(x0, 240 + i * 120, shrink), y = lerp(y0, 330, shrink), r = lerp(58, 40, shrink);
    g.save(); g.translate(x, y); g.scale(p, p); tasteBadge(g, 0, 0, r, ch, col); g.restore();
  });
  popTag(g, t, S('s1') - .1, 480, 250, '舌头只认得', 40, { fill: C.gold });
  // 大舌头：说到"一个都不认识"时一脸懵
  const confused = t > CH('s2', 2) - .2;
  drawTongue(g, 480, 880, 12, { mood: confused ? 'confused' : 'proud', look: confused ? Math.round(Math.sin(t * 3)) : 0 });
  if (confused) { const q = pop(t, CH('s2', 2) - .2, .3); g.save(); g.translate(700, 760); g.scale(q, q); ptext(g, '？', 0, 40, 120, C.red, { align: 'center', ol: C.ink, olw: 8 }); g.restore(); }
  // 草莓味、咖啡味、巧克力味：一个个出来；说"全靠鼻子"时飞进右上角的大鼻子
  const tNose = CH('s2', 3) - .25, fly = E.io(clamp((t - tNose - .2) / .6));
  FLAVORS.forEach(([name, x, y, label], i) => {
    const p = pop(t, [S('s2') - .2, S('s2') + .55, CH('s2', 1) - .15][i], .3);
    if (p <= 0 || fly >= 1) return;
    const fx = lerp(x, 780, fly), fy = lerp(y, 560, fly), sc = p * (1 - fly * .7);
    g.save(); g.translate(fx, fy); g.scale(sc, sc); icon(g, name, 0, 0, 10); if (fly < .2) ptag(g, 0, 80, label, 30, { fill: '#FFFFFF' }); g.restore();
  });
  const pn = pop(t, tNose, .35);
  if (pn > 0) {
    g.save(); g.translate(780, 560); g.scale(pn, pn); drawNose(g, 0, 0, 9, { sniff: t * 1.5 }); g.restore();
    popTag(g, t, tNose + .5, 780, 700, '全靠鼻子', 36, { fill: '#9FE3C4' });
  }
}
/* 2. 舌头是 5 色颜料盒，鼻子是 400 色的调色板。
   颜料盒先在画面中间放大（舌头在上面，五格颜色一格格填上），讲到鼻子时缩到左上角，让出地方给调色板 */
function bodyPalette(g, t) {
  bgPaper(g, '#FBF6EA');
  const t2 = CH('s3', 2) - .15;
  const pb = E.out(clamp((t - S('s3') + .2) / .3)), u = E.io(clamp((t - t2 + .45) / .45));
  const shown = clamp(Math.floor((t - CH('s3', 1) + .15) / .14) + 1, 0, 5);
  if (pb > 0) withAlpha(g, pb, () => {
    if (u < 1) withAlpha(g, 1 - u, () => drawTongue(g, 480, 580, 7, { mood: 'proud' }));
    ptext(g, '舌头：5 色', lerp(175, 110, u), lerp(760, 330, u), u < .5 ? 60 : 48, C.ink);
    paintBox(g, Math.round(lerp(175, 420, u)), Math.round(lerp(830, 290, u)), Math.round(lerp(110, 64, u)), 5, shown);
  });
  if (t > t2 - .1) {
    ptext(g, '鼻子：约 400 种气味受体', 110, 520, 48, C.ink);
    palette400(g, 240, 580, 24, Math.floor(clamp((t - t2) / 1.6) * 400));
  }
  // "调得出千百种味道"：调色板旁边冒出各种味道
  const tags = [['草莓', 170, 690], ['咖啡', 800, 640], ['巧克力', 160, 900], ['榴莲', 800, 860], ['烤肉', 170, 1100], ['薄荷', 800, 1080]];
  tags.forEach(([s, x, y], i) => popTag(g, t, CH('s3', 4) - .15 + i * .12, x, y, s, 32, { fill: ['#FFC2D2', '#E8D2B0', '#D9B08C', '#F2E39A', '#F2B880', '#B8F0D0'][i] }));
  source(g, '约 400 种：人类能用的嗅觉受体基因，Niimura 等 2006', 880, 1210);
}

/* ================= 鼻子的两扇门 ================= */
function nose(g, t) {
  g.fillStyle = '#DDEFF7'; g.fillRect(0, 0, W, H);
  const cold = t > S('n1') - .2;
  const b = pbuf('hn', 108, 192);
  pbands(b, 0, 108, [[0, '#DDEFF7'], [192, '#CFE6F2']], 2);
  drawHead(b, { patchOn: !cold && ((t > CH('s4', 1) && t < CH('s4', 2)) || t > CH('s5', 2) - .2) });
  blit(g, 'hn', 10);
  popTag(g, t, SS('nose') + .1, 480, 250, '剖开看看：鼻子的两扇门', 40, { fill: C.gold });
  // —— 前门：鼻孔，吸气闻香 ——
  const tf = CH('s4', 1) - .2;
  if (t > tf && !cold) {
    icon(g, 'straw', 80, 830, 7);
    aromaFlow(g, t, tf, HEAD.FRONT, '#FF6F8E', { n: 8, dur: 1.4, loop: t < CH('s4', 2) + .5, k: 12 });
    popTag(g, t, tf, 150, 560, '前门：鼻孔', 34, { fill: '#FFE9A8' });
  }
  // —— 后门：嗓子眼上面 ——
  const tb = CH('s4', 3) - .2;
  if (t > tb) {
    const q = .5 + .5 * Math.sin(t * 6);
    if (!cold) { pixRing(g, HEAD.back[0], HEAD.back[1], 60, 60, 1, 6, `rgba(255,211,78,${.6 + .4 * q})`); }
    popTag(g, t, tb, 800, 610, '后门', 36, { fill: cold ? '#FF8A7A' : '#FFE9A8' });
  }
  // —— 嚼草莓：香气走后门 ——
  const tc = S('s5') - .1;
  if (t > tc && !cold) {
    const bob = Math.round(Math.sin(t * 14) * 4) * (t < CH('s5', 1) + .5 ? 1 : 0);
    icon(g, 'straw', HEAD.mouth[0] - 40, HEAD.mouth[1] - 6 + bob, 5);
    aromaFlow(g, t, CH('s5', 1) - .2, HEAD.BACK, '#FF6F8E', { n: 12, dur: 1.6, loop: true, k: 12 });
    popTag(g, t, CH('s5', 2) - .1, 820, 790, '走后门', 34, { fill: '#FFC2D2' });
  }
  // —— 大脑：把功劳记在舌头头上 ——
  if (t > S('s6') - .1 && !cold) {
    const pb = pop(t, S('s6') - .1, .3);
    g.save(); g.translate(820, 330); g.scale(pb, pb); thoughtBubble(g, 0, 0, 280, 96, '舌头尝的！', -150, 90, { px: 36 }); g.restore();
    // "草莓味"标签从嗅觉区飞到舌头上，啪地贴住
    const u = E.io(clamp((t - CH('s6', 1) + .2) / .6));
    if (u > 0) {
      const x = lerp(HEAD.patch[0], HEAD.tongue[0], u), y = lerp(HEAD.patch[1], HEAD.tongue[1] + 20, u) - Math.sin(u * Math.PI) * 120;
      g.save(); g.translate(x, y); g.rotate(-.08 * u); ptag(g, 0, 0, '草莓味', 32, { fill: '#FF9DB2' }); g.restore();
    }
  }
  if (t > S('s6') - .1 && t < S('n1') - .2) source(g, '把闻到的当成尝到的：Rozin 1982', 70, 1215, { align: 'left' });
  // 舌头领功：头上一颗星
  if (t > S('d2') + .2 && !cold) { const p = pop(t, S('d2') + .2, .3); g.save(); g.translate(HEAD.tongue[0] + 120, HEAD.tongue[1] - 60); g.scale(p, p); pixStar(g, 0, 0, 7); g.restore(); }
  dialogBox(g, t, 'd2', PORTRAIT.youShock);
  // —— 感冒鼻塞：鼻孔和后门都堵上，香气被挡回去 ——
  if (cold) {
    const pc = pop(t, S('n1') - .2, .3);
    for (const [x, y] of [HEAD.nostril, [HEAD.back[0], HEAD.back[1] - 10]]) {
      g.save(); g.translate(x, y); g.scale(pc, pc); g.fillStyle = C.ink; g.fillRect(-36, -30, 72, 60); g.fillStyle = '#A9C79A'; g.fillRect(-30, -24, 60, 48); g.fillStyle = '#C8E0B8'; g.fillRect(-30, -24, 60, 10); g.restore();
    }
    icon(g, 'straw', HEAD.mouth[0] - 40, HEAD.mouth[1] - 6, 5);
    // 香气走到后门就弹回来
    for (let i = 0; i < 6; i++) {
      const u = ((t - S('n1')) * .9 + i / 6) % 1, v = u < .7 ? u / .7 : 1 - (u - .7) / .3 * .3;
      const [x, y] = along(HEAD.BACK.slice(0, 5), v * .85);
      g.fillStyle = '#FF6F8E'; g.globalAlpha = .8; g.fillRect(Math.round(x - 6), Math.round(y - 6), 12, 12); g.globalAlpha = 1;
    }
    popTag(g, t, S('n1') + .1, 200, 560, '感冒鼻塞', 36, { fill: '#FF8A7A' });
    // 舌头好好的：甜 ✓ 咸 ✓
    const pt = pop(t, CH('n1', 2) - .2, .3);
    if (pt > 0) { g.save(); g.translate(150, 1130); g.scale(pt, pt); tasteBadge(g, 0, 0, 34, '甜', TASTES[1][1]); tasteBadge(g, 90, 0, 34, '咸', TASTES[3][1]); checkMark(g, 150, -20, 6, C.green); ptext(g, '舌头好好的', 210, 14, 36, C.ink, { ol: C.white, olw: 3 }); g.restore(); }
    if (t > CH('n1', 3) - .2) stamp(g, HEAD.back[0] + 130, HEAD.back[1] + 120, '堵', clamp((t - CH('n1', 3) + .2) / .25), { px: 72, rot: -.1 });
  }
}
