'use strict';
/* scenes2.js：聚光灯（"你"是自己人生的主角 → 大脑从自己的感受出发，往回调总是调不够 → 台下每个人也有自己的聚光灯），
   紧张（以为"紧张"写在脸上 vs 台下看到的 → 获得情报 → 演讲实验 → 出了糗，别人比你想的宽容）。 */

/* ================= 聚光灯 ================= */
function body(g, t) {
  if (t < S('s2') - .12) { bodyStage(g, t); return; }
  if (t < S('s3') - .12) { bodyMeter(g, t); return; }
  bodyAudience(g, t);
}
/* 1. 剧场：你是主角，聚光灯一直打在你身上；头发翘了、说错一个字，自己看得清清楚楚 */
function bodyStage(g, t) {
  theater(g, t, { floor: 1180 });
  // 门头上的牌子
  const pb = pop(t, SS('body') + .1, .35);
  if (pb > 0) { g.save(); g.translate(480, 270); g.scale(pb, pb); pbox(g, -270, -52, 540, 104, { k: 6, fill: '#3B1420', rim: C.gold }); ptext(g, '今日上演：你的人生', 0, 16, 44, C.gold, { align: 'center' }); g.restore(); }
  const bright = .26 + .14 * clamp((t - CH('s1', 1) + .2) / .3);
  spotCone(g, 480, 425, 480, 1180, 250, bright, { r0: 50 });
  spotLamp(g, 480, 420, 7, 1);
  const hair = t > CH('s1', 2) - .25, slip = t > CH('s1', 3) - .2;
  const bob = hair && t < CH('s1', 2) + .1 ? -12 : 0;
  shadowAt(g, 480, 1180, 12);
  crabAt(g, 480, 1180 + bob, 12, youO(t, { cowlick: hair, flush: slip, mouth: slip ? 'wobble' : 'smile', eyes: slip ? 'wide' : blinkEyes(t, 1) }));
  // 主角徽章
  const ps = pop(t, S('s1') - .2, .35);
  if (ps > 0) { g.save(); g.translate(480, 770); g.scale(ps, ps); pixStar(g, 0, -20, 9); g.restore(); popTag(g, t, S('s1') - .1, 480, 850, '主角', 36, { fill: C.gold }); }
  // 放大镜：翘起来的头发
  const pm = pop(t, CH('s1', 2) - .2, .35);
  if (pm > 0) {
    g.save(); g.translate(250, 560); g.scale(pm, pm);
    magnifier(g, 0, 0, 120, gg => { gg.fillStyle = '#F6E7C8'; gg.fillRect(-130, -130, 260, 260); crabAt(gg, -13, 481, 26, youO(t, { cowlick: true })); }, { ang: -2.3 });
    g.restore();
    popTag(g, t, CH('s1', 2) - .1, 250, 715, '头发翘了', 34, { fill: '#F28CB0' });
  }
  // 说错一个字
  speech(g, t, CH('s1', 3) - .2, EN('s1') + .3, 720, 960, '妈！…不，老师！', { px: 36 });
  // 自己看得清清楚楚：两个红圈
  if (t > CH('s1', 4) - .2) {
    const u = clamp((t - CH('s1', 4) + .2) / .4);
    markCircle(g, 486, 958, 56, C.red, u);
    markCircle(g, 720, 896, 200, C.red, u);
    popTag(g, t, CH('s1', 4) + .1, 480, 1235, '自己全看见了', 32, { fill: '#FFFFFF' });
  }
}
function markCircle(g, x, y, r, col, u = 1) {
  const n = Math.floor(28 * u);
  g.fillStyle = col;
  for (let i = 0; i < n; i++) { const a = -Math.PI / 2 + i / 28 * TAU; g.fillRect(Math.round(x + Math.cos(a) * r - 5), Math.round(y + Math.sin(a) * r * .8 - 5), 10, 10); }
}
/* 2. 大脑在估算：指针从"你的感受"出发往回调，停在一半，离实际（不到四分之一）还差一大截 */
const TRACK = { x0: 150, x1: 810, y: 700 };
const trackX = v => lerp(TRACK.x0, TRACK.x1, v);
function bodyMeter(g, t) {
  bgGrid(g, t, '#1E1A3A', 'rgba(170,140,255,.08)');
  const pw0 = E.out(clamp((t - S('s2') + .3) / .3));
  if (pw0 <= 0) return;
  g.save(); g.globalAlpha *= pw0; g.translate(0, (1 - pw0) * 60);
  sysWindow(g, 90, 330, 780, 600, '大脑 · 估算中…', { bar: '#5B4FA0' });
  ptext(g, '别人注意到你多少？', 480, 480, 44, C.ink, { align: 'center' });
  // 刻度条：左边没人注意，右边全场都在看
  for (let i = 0; i < 20; i++) { g.fillStyle = mixHex('#7BD88F', '#FF6F5E', i / 19); g.fillRect(Math.round(trackX(i / 20)), TRACK.y - 18, Math.ceil((TRACK.x1 - TRACK.x0) / 20), 36); }
  g.fillStyle = C.ink; g.fillRect(TRACK.x0 - 6, TRACK.y - 24, TRACK.x1 - TRACK.x0 + 12, 6); g.fillRect(TRACK.x0 - 6, TRACK.y + 18, TRACK.x1 - TRACK.x0 + 12, 6);
  g.fillRect(TRACK.x0 - 6, TRACK.y - 24, 6, 48); g.fillRect(TRACK.x1, TRACK.y - 24, 6, 48);
  ptext(g, '没人注意', TRACK.x0, TRACK.y + 70, 30, '#6B6390');
  ptext(g, '全场都在看', TRACK.x1, TRACK.y + 70, 30, '#6B6390', { align: 'right' });
  // 实际：不到四分之一
  const pr = pop(t, CH('s2', 3) - .2, .3);
  if (pr > 0) {
    const gx = trackX(.23);
    // "调不够"的那一截
    withAlpha(g, clamp(pr), () => { g.fillStyle = 'rgba(229,50,45,.35)'; g.fillRect(Math.round(gx), TRACK.y - 50, Math.round(trackX(.5) - gx), 100); });
    g.save(); g.translate(gx, TRACK.y); g.scale(pr, pr);
    g.fillStyle = C.ink; g.fillRect(-12, 24, 24, 60); g.fillStyle = '#3E9E4F'; g.fillRect(-6, 30, 12, 48);
    g.restore();
    popTag(g, t, CH('s2', 3) - .1, gx + 40, TRACK.y + 150, '实际：不到 1/4', 30, { fill: '#9FE3C4' });
    popTag(g, t, CH('s2', 3) + .1, (gx + trackX(.5)) / 2 + 10, TRACK.y + 72, '调不够', 40, { fill: '#FF8A7A' });
  }
  // 指针：从"你的感受"（最右）出发，往回调，越调越慢，停在一半
  const u = clamp((t - CH('s2', 2) + .1) / 1.2), v = 1 - .5 * E.out(u) + (u >= 1 ? Math.sin(t * 18) * .004 : 0);
  const px = trackX(v);
  g.fillStyle = C.ink; g.fillRect(Math.round(px) - 21, TRACK.y - 78, 42, 12); g.fillRect(Math.round(px) - 15, TRACK.y - 66, 30, 12); g.fillRect(Math.round(px) - 9, TRACK.y - 54, 18, 12);
  g.fillStyle = C.amber; g.fillRect(Math.round(px) - 15, TRACK.y - 78, 30, 6); g.fillRect(Math.round(px) - 9, TRACK.y - 66, 18, 6);
  const label = u > .95 ? '你猜的：一半' : u > 0 ? '往回调……' : '你的感受';
  ptag(g, Math.min(px, 760), TRACK.y - 110, label, 30, { fill: u > .95 ? C.amber : '#D7D3E0' });
  if (t > CH('s2', 1) - .2 && u <= 0) withAlpha(g, clamp((t - CH('s2', 1) + .2) / .3), () => pixArrow(g, trackX(.95), TRACK.y + 110, trackX(.55), TRACK.y + 110, 8, '#5B4FA0', clamp((t - CH('s2', 1) + .2) / .5)));
  g.restore();
  // "你"在下面仰头看
  shadowAt(g, 480, 1210, 7);
  crabAt(g, 480, 1210, 7, youO(t, { eyes: t > S('d2') - .1 ? 'tired' : 'up' }));
  dialogBox(g, t, 'd2', PORTRAIT.youSad);
}
/* 3. 台下：每个人头顶都有自己的聚光灯，想的都是自己 */
const WORRY = [[230, 820, '我头发乱吗？'], [690, 820, '我是不是胖了？'], [230, 1210, '他们在看我吗？'], [690, 1210, '我脸上有东西？']];
function bodyAudience(g, t) {
  g.fillStyle = '#160F22'; g.fillRect(0, 0, W, H);
  seats(g, 900, 3);
  popTag(g, t, S('s3') - .1, 480, 260, '台下', 40, { fill: '#D7D3E0' });
  WORRY.forEach(([x, y, s], i) => {
    const on = clamp((t - CH('s3', 1) + .3 - i * .05) / .1);
    if (on > 0) spotCone(g, x, y - 560, x, y, 130, .3 * on, { r0: 24 });
    shadowAt(g, x, y, 7);
    crabAt(g, x, y, 7, person(i, { eyes: on > 0 ? (i === 2 ? 'l' : 'dn') : 'n', hat: i === 1 ? 'straw' : PEOPLE[i].hat, sweat: on > 0 && i === 2 }));
    const pb = pop(t, CH('s3', 2) - .15 + i * .15, .3);
    if (pb > 0) { g.save(); g.translate(x, y - 250); g.scale(pb, pb); thoughtBubble(g, 0, 0, 330, 110, s, 0, 120, { px: 36 }); g.restore(); }
  });
}

/* ================= 紧张 ================= */
function nerve(g, t) {
  if (t < S('n2') - .12) { nerveSplit(g, t); return; }
  if (t < S('n3') - .12) { nerveInsight(g, t); return; }
  if (t < EN('n4') + .1) { nerveLab(g, t); return; }
  nerveBlunder(g, t);
}
/* "你"站在讲台后面：nervous 0..1 紧张的程度（汗、红脸、发抖）；word 脸上写着"紧张"的透明度 */
function speaker(g, t, x, by, k, nervous, word, o = {}) {
  const [sx] = nervous > .5 ? shake(t % .5, 0, 3 * nervous, .5, 23) : [0, 0];
  crabAt(g, x + sx, by, k, youO(t, { flush: nervous > .5, sweat: nervous > .3, mouth: nervous > .5 ? 'wobble' : 'smile', eyes: nervous > .5 ? 'wide' : blinkEyes(t, 1) }));
  if (word > 0) withAlpha(g, word, () => ptext(g, '紧张', x + sx, by - 9 * k, Math.round(k * 5 / 6) * 6 || 36, '#E5322D', { align: 'center', ol: '#FFFFFF', olw: 3 }));
  // 飞出去的汗珠
  if (nervous > .7) for (let i = 0; i < 4; i++) {
    const ph = (t * 1.6 + i * .25) % 1, s = i % 2 ? 1 : -1;
    g.fillStyle = 'rgba(159,211,255,' + (1 - ph) + ')';
    g.fillRect(Math.round(x + s * (14 * k + ph * 60)), Math.round(by - 15 * k - ph * 40 + ph * ph * 120), k, 2 * k);
  }
  podium(g, x, by + (o.podDy ?? 40), o.pk || Math.round(k * .7));
}
function nerveSplit(g, t) {
  const tSplit = CH('n1', 2) - .2;
  if (t < tSplit) {
    theater(g, t, { floor: 1180 });
    spotCone(g, 480, 300, 480, 1180, 240, .28, { r0: 40 });
    const ner = clamp((t - CH('n1', 1) + .25) / .3);
    shadowAt(g, 480, 1180, 12);
    speaker(g, t, 480, 1100, 12, .2 + .8 * ner, ner, { podDy: 80, pk: 8 });
    // 心跳
    if (ner > 0) { const beat = 1 + .25 * Math.max(0, Math.sin(t * 14)); g.save(); g.translate(760, 760); g.scale(beat, beat); iconHeart(g, 0, 0, 12, '#FF4B5C'); g.restore(); ptext(g, '咚咚咚', 760, 880, 36, C.white, { align: 'center', ol: C.ink }); }
    return;
  }
  // 左右分屏：你以为的 vs 台下看到的
  g.fillStyle = '#120D20'; g.fillRect(0, 0, W, H);
  const p = E.out(clamp((t - tSplit) / .3));
  for (const [side, cx] of [[0, 270], [1, 690]]) {
    g.save(); g.translate((side ? 1 : -1) * (1 - p) * 300, 0); g.globalAlpha *= p;
    pbox(g, cx - 205, 250, 410, 980, { k: 6, fill: side ? '#2A2347' : '#3A1E30' });
    spotCone(g, cx, 330, cx, 1030, 130, .25, { r0: 20, k: 10 });
    ptag(g, cx, 330, side ? '台下看到的' : '你以为的', 40, { fill: side ? '#9FE3C4' : '#FF8A7A' });
    speaker(g, t, cx, 960, 9, side ? .35 : 1, side ? .12 : 1, { podDy: 50, pk: 6 });
    // 紧张程度条
    ptext(g, '紧张', cx - 165, 1120, 32, C.white);
    hpBar(g, cx - 80, 1088, 240, side ? lerp(1, .32, E.out(clamp((t - CH('n1', 3) + .3) / .6))) : 1, { h: 36, col: side ? C.gold : '#FF5A4F' });
    g.restore();
  }
  popTag(g, t, CH('n1', 3) + .05, 690, 1180, '少得多', 34, { fill: C.gold });
}
/* 获得情报：知道"紧张写不到脸上"，就能讲得更好 */
function nerveInsight(g, t) {
  theater(g, t, { floor: 1180 });
  spotCone(g, 480, 300, 480, 1180, 240, .22, { r0: 40 });
  shadowAt(g, 480, 1180, 12);
  speaker(g, t, 480, 1100, 12, t > S('n2') + .6 ? .1 : .5, 0, { podDy: 80, pk: 8 });
  g.save(); g.fillStyle = 'rgba(10,8,24,.45)'; g.fillRect(0, 0, W, H); g.restore();
  itemGet(g, t, S('n2') - .3, EN('n2') + .4, (gg, x, y) => bulbIcon(gg, x, y, 12), '紧张写不到脸上', '知道这一点 → 讲得更好', { head: '获得情报', y: 740, band: '#3E7DD9' });
}
/* 演讲实验：A 组只听到"别紧张"，B 组知道"紧张别人看不太出来"；B 组更放松，台下打分更高 */
function nerveLab(g, t) {
  bgPaper(g, '#EEF3F8', 'rgba(90,120,170,.10)');
  g.fillStyle = '#C9D3DE'; g.fillRect(0, 900, W, 30);
  popTag(g, t, S('n3') - .1, 480, 270, '演讲实验', 44, { fill: C.gold });
  source(g, 'Savitsky 等 2003', 880, 330, { col: '#7A86A8', px: 24 });
  const relaxed = t > S('n4') - .1;
  [[270, 'A 组', TONES.green], [690, 'B 组', TONES.purple]].forEach(([x, s, col], i) => {
    popTag(g, t, S('n3') + .1 + i * .1, x, 390, s, 36, { fill: '#FFFFFF' });
    const calm = i === 1 && relaxed;
    shadowAt(g, x, 900, 10);
    crabAt(g, x, 860, 10, { col, eyes: calm ? 'happy' : (t > CH('n3', 1) - .2 ? 'wide' : blinkEyes(t, i + 3)), sweat: !calm && t > CH('n3', 1) - .2, flush: !calm && t > CH('n3', 1) - .2, mouth: calm ? 'smile' : 'wobble' });
    podium(g, x, 900, 7, { badge: false });
  });
  // 便利贴
  const pa = pop(t, CH('n3', 2) - .2, .3);
  if (pa > 0) { g.save(); g.translate(270, 530); g.scale(pa, pa); stickyNote(g, 0, 0, 290, 120, ['“{别紧张}”'], { px: 44, rot: -.05 }); g.restore(); }
  const pb = pop(t, CH('n3', 4) - .2, .3);
  if (pb > 0) { g.save(); g.translate(690, 530); g.scale(pb, pb); stickyNote(g, 0, 0, 340, 150, ['“你紧张，', '{别人看不太出来}”'], { px: 34, rot: .04, fill: '#BFE3FF' }); g.restore(); }
  popTag(g, t, S('n4') + .1, 690, 640, '更放松', 34, { fill: '#9FE3C4' });
  // 台下打分
  const pc = E.out(clamp((t - CH('n4', 1) + .2) / .3));
  if (pc > 0) {
    g.save(); g.globalAlpha *= pc;
    pbox(g, 120, 960, 720, 290, { k: 6, fill: '#FFFFFF', rim: '#C9D3DE' });
    ptext(g, '台下打分', 480, 1030, 36, C.ink, { align: 'center' });
    const u = E.out(clamp((t - CH('n4', 1) + .1) / .7));
    scoreBar(g, 270, 1220, 110, 90 * u, '#9AA1AD');
    scoreBar(g, 690, 1220, 110, 160 * u, C.gold);
    if (t > CH('n4', 2) - .2) { const pp = pop(t, CH('n4', 2) - .2, .3); g.save(); g.translate(690, 1220 - 160 * u - 40); g.scale(pp, pp); pixStar(g, 0, 0, 7); g.restore(); }
    g.restore();
  }
  popTag(g, t, CH('n4', 2) - .1, 480, 1130, '更高', 34, { fill: C.gold });
}
/* 出了糗：在台上摔了一跤；你以为的评价掉了一大截，别人眼里只掉了一点点 */
function nerveBlunder(g, t) {
  theater(g, t, { floor: 1180 });
  const t0 = EN('n4') + .1, tTrip = t0 + .3, u = clamp((t - tTrip) / .25);
  const walk = t < tTrip, x = walk ? lerp(360, 440, clamp((t - t0) / .3)) : 440;
  shadowAt(g, x, 1180, 10);
  if (walk) crabAt(g, x, 1180, 10, youO(t, { legs: walkLegs(t, 8), mouth: 'smile' }));
  else {
    g.save(); g.translate(x + 120, 1180); g.rotate(u * Math.PI / 2 * .9); g.translate(-x - 120, -1180);
    crabAt(g, x, 1180, 10, youO(t, { eyes: 'shut', mouth: 'o', flush: true }));
    g.restore();
    // 飞出去的讲稿
    for (let i = 0; i < 4; i++) {
      const tt = clamp((t - tTrip) / .8), px = x + 60 + i * 50 * tt + i * 20, py = 1080 - Math.sin(tt * Math.PI) * (80 + i * 30) + tt * 90;
      g.save(); g.translate(px, py); g.rotate(tt * (i + 1) * 2); g.fillStyle = C.ink; g.fillRect(-27, -33, 54, 66); g.fillStyle = '#FFFFFF'; g.fillRect(-24, -30, 48, 60);
      g.fillStyle = '#C9D3DE'; for (let j = 0; j < 4; j++) g.fillRect(-18, -20 + j * 12, 36, 4); g.restore();
    }
    if (t < tTrip + .5) { const [a, b2] = shake(t, tTrip + .2, 10, .4); g.save(); g.translate(a, b2); ptext(g, '啪！', 760, 900, 72, C.white, { align: 'center', ol: C.ink, olw: 6 }); g.restore(); }
  }
  // 两条好感度
  const pp = E.out(clamp((t - CH('n5', 1) + .3) / .3));
  if (pp > 0) {
    g.save(); g.globalAlpha *= pp; g.translate(0, (1 - pp) * -60);
    pbox(g, 90, 280, 780, 440, { k: 6 });
    const d = E.out(clamp((t - CH('n5', 1) + .1) / .6));
    ptext(g, '你以为的评价', 140, 370, 36, '#FFB4A8');
    hpBar(g, 140, 395, 680, lerp(1, .22, d), { lost: 1, h: 48, col: '#FF8A3D' });
    ptext(g, '别人眼里的评价', 140, 540, 36, '#9FE3C4');
    hpBar(g, 140, 565, 680, lerp(1, .88, d), { lost: 1, h: 48, col: C.green });
    source(g, 'Savitsky 等 2001', 850, 690, { px: 22 });
    g.restore();
  }
  popTag(g, t, CH('n5', 2) - .1, 640, 760, '宽容得多', 36, { fill: '#9FE3C4' });
}
