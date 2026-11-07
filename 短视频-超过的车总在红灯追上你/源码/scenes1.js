'use strict';
/* scenes1.js：共用的小工具；开头（红灯前，刚被你超过的那辆车又停到你旁边："超过的车，总在红灯追上你？" → "巧合吧！" →
   盖章"不是巧合" → 一篇今年的论文，名字取自恐怖片 → 恐怖片：你拼命跑，杀手慢慢走，却总能追上你（闪电一亮，原来是他和保温杯）→
   先猜：过一个红灯，他追上你的可能有多大？A 一成 / B 四成 / C 九成）；封面。
   开头照老规矩：第一帧就有大字问题和在动的角色；先替观众说出最常见的想法，马上盖章推翻；前 20 秒切 4 次镜头（亮、暗交替），
   抛一个后面才揭晓的线索（选择题的答案）。关键的字都放在安全区里（x 60~900、y 200~1540）。 */

/* ================= 共用 ================= */
function popTag(g, t, t0, x, y, s, px = 36, o = {}) {
  const p = pop(t, t0, .3) * (o.t1 ? clamp((o.t1 - t) / .2) : 1);
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p); ptag(g, 0, 0, s, px, o); g.restore();
}
function popText(g, t, t0, t1, s, x, y, px, col, o = {}) {
  const p = pop(t, t0, .3) * clamp((t1 - t) / .2);
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p); g.rotate(o.rot || 0);
  ptext(g, s, 0, px * .35, px, col, { align: 'center', ol: o.ol || C.ink, olw: o.olw || 6, sh: 1 });
  g.restore();
}
/* 研究出处：小号灰字 */
function source(g, s, x, y, o = {}) { ptext(g, s, x, y, o.px || 24, o.col || '#8A80B0', { align: o.align || 'right', ol: o.ol, olw: o.olw }); }
/* 头像 */
const PORTRAIT = {
  you: portraitClawd({ scarf: true }),
  youShock: portraitClawd({ scarf: true, eyes: 'wide', mouth: 'o' }),
  youHappy: portraitClawd({ scarf: true, eyes: 'happy', mouth: 'smile' }),
  youMad: portraitClawd({ scarf: true, eyes: 'angry', mouth: 'grit' }),
};
/* 盖章，下面垫一块白底（缩小也看得清） */
function bigStamp(g, t, t0, x, y, s, o = {}) {
  if (t < t0) return;
  const p = clamp((t - t0) / .25), px = o.px || 84, w = pw(g, s, px) + px * 1.4, h = px * 2;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -.08); g.globalAlpha *= clamp(p * 3); g.fillStyle = 'rgba(255,255,255,.92)'; g.fillRect(-w / 2, -h / 2, w, h); g.restore();
  stamp(g, x, y, s, p, { px, rot: o.rot ?? -.08, col: o.col });
}
/* 大标题：上下按整像素（6 px）跳，不缩放、不转（像素字一缩放、一转，描边就碎了） */
function titleBlock(g, t, y0 = 230, o = {}) {
  const bob = o.still ? 0 : Math.round(Math.sin(t * 4)) * 6;
  g.save(); g.translate(480, y0 + bob);
  ptext(g, '超过的车', 0, 30, o.px1 || 72, C.white, { align: 'center', ol: C.ink, olw: 6, sh: 1 });
  ptext(g, '总在红灯追上你？', 0, o.y2 || 150, o.px2 || 96, C.amber, { align: 'center', ol: C.ink, olw: 8, sh: 1 });
  g.restore();
}
/* 屏幕上画一块世界缓冲里的东西时用：世界坐标 → 屏幕坐标 */
const WX = (wx, camX, P = 10) => Math.round((wx - camX) * P);

/* ================= 街道上的一个画面 =================
   st：{ camX, stopX, light, num, sky, you:{x, lane, drv, ...}, him:{...}, others:[...], walkers:[[u, i]...] }
   车按远近排：先画远车道（y 小的），再画近车道；同一车道按 x 从右往左画（车头朝左，左边的车挡住右边车的车尾） */
function street(g, t, st, o = {}) {
  const P = o.P || 10, b = pbuf(o.buf || 'st', 108 + (o.extra || 0), 192);
  streetBG(b, t, st.camX, { sky: st.sky, stopX: st.stopX, noTreeNear: st.noTree });
  const cars = [];
  for (const c of [st.him, st.you, ...(st.others || [])]) if (c) cars.push(c);
  // 行人（斑马线上）
  const wk = st.walkers || [];
  const drawWalkers = (lo, hi) => wk.forEach(([u, i]) => { const fy = lerp(131, 102, u); if (fy >= lo && fy < hi) walker(b, st.stopX - st.camX - 11, u, t, i); });
  drawWalkers(0, 104);
  cars.filter(c => c.lane === 'far').sort((a, z) => z.x - a.x).forEach(c => carSide(b, c.x - st.camX, LANE_FAR, c));
  drawWalkers(104, 118);
  cars.filter(c => c.lane !== 'far').sort((a, z) => z.x - a.x).forEach(c => carSide(b, c.x - st.camX, LANE_NEAR, c));
  drawWalkers(118, 200);
  // 红绿灯
  if (st.light) signal(b, st.stopX - st.camX - 18, 46, st.light, st.num, { poleX: st.stopX - st.camX - 24 });
  if (o.post) o.post(b);
  blit(g, o.buf || 'st', P, o.bx || 0, o.camY || 0);
  // 亮着的灯加光晕
  if (st.light) {
    const lx = WX(st.stopX - 18 + 5 - (o.bx || 0), st.camX, P) + P / 2, ly = (46 + 4 + { red: 0, yellow: 8, green: 16 }[st.light]) * P - (o.camY || 0) * P + P / 2;
    lampGlow(g, lx, ly, st.light === 'red' ? 'rgba(255,70,50,A)' : st.light === 'green' ? 'rgba(60,230,120,A)' : 'rgba(255,200,60,A)', 90, .4);
  }
}

/* ================= 开头 ================= */
function hook(g, t) {
  if (window.COVER) { coverArt(g, t); return; }
  if (t < S('h3') - .12) { hookStreet(g, t); return; }
  if (t < CH('h3', 2) - .15) { hookPaper(g, t); return; }
  if (t < S('h4') - .12) { hookHorror(g, t); return; }
  hookQuiz(g, t);
}
/* 1. 红灯前：他慢悠悠开过来，停在你旁边，举起保温杯："又见面了～"；你："巧合吧！"；盖章"不是巧合" */
const HOOK_STOP = 22;
function hookStreetState(t) {
  const arrive = 1.45, hx = HOOK_STOP + 2 + 62 * (1 - E.out(clamp((t + .1) / (arrive + .1))));
  const toast = t > arrive + .15 && t < S('h3') - .2, ts = S('h2') - .12;
  const you = {
    x: HOOK_STOP + 1, lane: 'near', col: CAR_COL.you, puff: t,
    drv: youO(t, t < .9 ? { eyes: blinkEyes(t, 1, 'r') } : t < ts ? { eyes: 'wide', mouth: 'o' } : { eyes: 'wide', mouth: 'wobble', sweat: true }),
  };
  const him = {
    x: hx, lane: 'far', col: CAR_COL.him, spin: -hx * .5, brake: t > arrive - .5, puff: t > arrive ? t : undefined, bob: t > arrive - .05 && t < arrive + .12 ? 1 : 0,
    drv: himO(t, toast ? { eyes: 'happy', mouth: 'smile', arms: 'upR' } : { eyes: 'n' }), cup: true, cupDy: toast ? -1 + (Math.floor(t * 4) % 2) : 5,
  };
  const vanX = 68 + 50 * (1 - E.out(clamp((t - 3.2) / 1.4)));
  const others = [
    { x: 66, lane: 'near', col: CAR_COL.taxi, roof: 'taxi', drv: person(5, { eyes: blinkEyes(t, 4, 'l') }), puff: t + .3 },
    { x: vanX, lane: 'far', col: CAR_COL.white, roof: 'rack', drv: person(2, { eyes: blinkEyes(t, 6) }), spin: -vanX * .5, brake: t > 4.2 },
  ];
  const walkers = [[clamp(.25 + t / 4.2), 0], [clamp((t - 1.6) / 4.2), 3]].filter(([u]) => u > 0 && u < 1);
  return { camX: 0, stopX: HOOK_STOP, light: 'red', num: 37 - Math.floor(t), sky: 'day', you, him, others, walkers };
}
function hookStreet(g, t) {
  street(g, t, hookStreetState(t));
  titleBlock(g, t);
  // 他："又见面了～"（停稳以后）
  speech(g, t, 1.55, 2.75, 470, 930, '又见面了～', { px: 36 });
  const ts = S('h2') - .12;
  bigStamp(g, t, ts, 480, 650, '不是巧合', { px: 84 });
  // 盖章以后：周围冒出数学符号
  ['+', '−', '×', '÷', '%'].forEach((s, i) => {
    const t0 = ts + .35 + i * .22, a = [[170, 560], [790, 560], [215, 760], [760, 770], [480, 830]][i];
    popText(g, t, t0, S('h3') + 1, s, a[0], a[1] + Math.round(Math.sin(t * 3 + i) * 2) * 6, 72, [C.gold, '#9FD3FF', '#FF8FB0', '#7FE3A0', C.white][i], { olw: 6 });
  });
  dialogBox(g, t, 'd1', PORTRAIT.youShock);
}
/* 2. 论文：今年的一篇论文，名字取自恐怖片 */
function hookPaper(g, t) {
  const t0 = S('h3') - .12, u = E.out(clamp((t - t0) / .35));
  bgGrid(g, t, '#22314A', 'rgba(150,200,255,.07)');
  // 台灯的光
  g.save(); g.fillStyle = 'rgba(255,236,190,.08)'; g.beginPath(); g.moveTo(380, 0); g.lineTo(580, 0); g.lineTo(980, 1300); g.lineTo(-20, 1300); g.closePath(); g.fill(); g.restore();
  const y0 = Math.round(lerp(1500, 250, u) / 6) * 6;
  g.save(); g.translate(0, y0 - 250);
  // 纸
  g.fillStyle = 'rgba(0,0,0,.35)'; g.fillRect(132, 272, 720, 930);
  g.fillStyle = '#FBF7EC'; g.fillRect(120, 260, 720, 930);
  g.fillStyle = '#E9E1CF'; g.fillRect(120, 260, 720, 6);
  ptag(g, 160, 312, '论文', 24, { align: 'left', fill: '#D9443B', col: C.white });
  ptext(g, '皇家学会开放科学 · 2026', 800, 322, 24, '#8A8070', { align: 'right' });
  const hl = E.out(clamp((t - t0 - .45) / .5));
  if (hl > 0) { g.fillStyle = 'rgba(255,214,70,.55)'; g.fillRect(270, 420, Math.round(420 * hl / 6) * 6, 36); }
  ptext(g, '沃赫斯交通定律', 480, 450, 60, C.ink, { align: 'center' });
  ptext(g, '为什么你超过的车', 480, 530, 36, '#5A5068', { align: 'center' });
  ptext(g, '总会再出现', 480, 580, 36, '#5A5068', { align: 'center' });
  ptext(g, 'Boland 2026', 480, 636, 24, '#8A8070', { align: 'center' });
  g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(170, 660, 620, 3);
  // 正文（灰条）和一个"？"的公式框——答案后面揭晓
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(60,50,80,.18)'; g.fillRect(170, 700 + i * 30, i === 5 ? 380 : 620 - (i % 3) * 40, 12); }
  pbox(g, 200, 900, 560, 120, { k: 6, fill: '#FFF2C8', rim: '#E8C860', edge: '#5A4A2A', shadow: false });
  ptext(g, '追上的可能 =', 450, 978, 48, '#5A3A10', { align: 'center' });
  ptext(g, '？', 640, 978 - (Math.floor(t * 3) % 2) * 12, 60, '#D9443B', { align: 'center' });
  for (let i = 0; i < 3; i++) { g.fillStyle = 'rgba(60,50,80,.18)'; g.fillRect(170, 1060 + i * 30, 620 - i * 60, 12); }
  g.restore();
  // "名字取自恐怖片"：贴上一张恐怖片的贴纸（小幽灵 + 胶片）
  const ts = CH('h3', 1) - .2, p = pop(t, ts, .3);
  if (p > 0) {
    g.save(); g.translate(690, 520); g.rotate(.12); g.scale(p, p);
    g.fillStyle = 'rgba(0,0,0,.3)'; g.fillRect(-150, -120, 312, 252);
    g.fillStyle = '#2A1E3A'; g.fillRect(-160, -130, 312, 252);
    for (let i = 0; i < 9; i++) { g.fillStyle = '#FBF7EC'; g.fillRect(-148 + i * 34, -122, 18, 14); g.fillRect(-148 + i * 34, 100, 18, 14); }
    pix(g, ['..####..', '.######.', '##.##.##', '########', '########', '########', '#.##.##.', '.#..#..#'], { '#': '#F4F0FF', '.': null }, -4, -14, 12);
    g.fillStyle = '#2A1E3A'; g.fillRect(-28, -38, 12, 12); g.fillRect(8, -38, 12, 12);
    ptext(g, '恐怖片', -4, 84, 36, '#FFD34E', { align: 'center' });
    g.restore();
  }
}
/* 3. 恐怖片：你拼命跑，杀手慢慢走（闪电一亮：是他，拿着保温杯），却总能追上你 */
function hookHorror(g, t) {
  const t0 = CH('h3', 2) - .15, tf = CH('h3', 3) - .22, tj = CH('h3', 4) - .12;
  const camX = (t - t0) * 26;
  const flash = t > tf && t < tf + .5 ? (t < tf + .08 ? 1 : t < tf + .16 ? .2 : t < tf + .24 ? .8 : clamp(1 - (t - tf - .24) / .26)) : 0;
  const b = pbuf('hr', 108, 192);
  horrorBG(b, t, camX, flash * .6);
  blit(g, 'hr', 10);
  const k = 12, by = 1236;
  // 你：拼命往左跑（腿飞快），回头看
  const yx = 330 + Math.round(Math.sin(t * 13) * 1) * 6;
  const youLook = t > tj ? { eyes: 'r', mouth: 'o', sweat: true } : { eyes: 'l', mouth: 'wobble', sweat: true };
  shadowAt(g, yx, by, k);
  crabAt(g, yx, by - (Math.floor(t * 12) % 2) * k, k, youO(t, Object.assign({ legs: [1, 2][Math.floor(t * 12) % 2] }, youLook)));
  // 汗珠往后甩
  for (let i = 0; i < 3; i++) { const u = (t * 2.2 + i / 3) % 1; g.fillStyle = '#9FD3FF'; g.fillRect(Math.round(yx + 140 + u * 120), Math.round(by - 170 - u * 40 + i * 30), 12, 12); }
  // 他：慢慢走（腿慢），平时是剪影 + 发光的眼睛；闪电一亮露出真面目；"却总能追上你"时一下就在你身后
  const hx0 = 860 - (t - t0) * 40, hx = t > tj ? 560 : hx0, revealed = flash > .3 || t > tj;
  const ho = himO(t, { legs: walkLegs(t, 2), eyes: revealed ? 'happy' : 'n', mouth: revealed ? 'smile' : undefined, arms: 'upR' });
  shadowAt(g, hx, by, k);
  if (revealed) {
    crabAt(g, hx, by, k, ho, true);
    g.save(); g.imageSmoothingEnabled = false; g.drawImage(THERMOS(), Math.round(hx - 12 * k - 2 * k), Math.round(by - 16 * k - 6 * k), 3 * k, 7 * k); g.restore();
    if (t > tj) withAlpha(g, .25, () => { g.fillStyle = '#6A3A9A'; g.fillRect(0, 0, W, H); });
  } else {
    const sil = silhouette(ho, '#05030A');
    g.save(); g.imageSmoothingEnabled = false; g.translate(Math.round(hx + 12 * k), Math.round(by - 16 * k - CL_OY * k)); g.scale(-1, 1); g.drawImage(sil, -CL_OX * k, 0, CL_W * k, CL_H * k); g.restore();
    g.fillStyle = '#FFE14A'; g.fillRect(Math.round(hx - 7 * k), by - 14 * k, 2 * k, 2 * k); g.fillRect(Math.round(hx + 3 * k), by - 14 * k, 2 * k, 2 * k);
    g.save(); g.imageSmoothingEnabled = false; g.globalAlpha = .9; g.drawImage(silhouette({}, '#05030A'), 0, 0, 1, 1); g.restore();
  }
  if (t > tj) popText(g, t, tj, S('h4'), '！', 300, 960, 120, '#FF5A4F', { olw: 10 });
  // 恐怖片的"胶片"边框和颗粒
  g.fillStyle = 'rgba(0,0,0,.55)'; g.fillRect(0, 0, 36, H); g.fillRect(W - 36, 0, 36, H);
  for (let y = (Math.floor(t * 24) * 13) % 60; y < H; y += 60) { g.fillStyle = 'rgba(255,255,255,.18)'; g.fillRect(10, y, 16, 26); g.fillRect(W - 26, y, 16, 26); }
  if (flash > 0) { g.fillStyle = `rgba(240,236,255,${(flash * .55).toFixed(2)})`; g.fillRect(0, 0, W, H); }
}
/* 4. 先猜：A 一成 / B 四成 / C 九成（答案在转盘那一幕揭晓） */
function quizBoard(g, t, o = {}) {
  // 舞台：深蓝底、一圈会闪的灯泡、两道追光
  g.fillStyle = '#141A3A'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(120,140,255,.06)'; for (let i = 0; i < 12; i++) g.fillRect(0, i * 160 + ((t * 40) % 160), W, 60);
  g.save(); g.globalCompositeOperation = 'lighter';
  for (const [x0, ph] of [[200, 0], [780, 1.3]]) {
    const sx = x0 + Math.sin(t * 1.2 + ph) * 120;
    g.fillStyle = 'rgba(255,240,200,.07)'; g.beginPath(); g.moveTo(x0 - 30, 0); g.lineTo(x0 + 30, 0); g.lineTo(sx + 220, 1260); g.lineTo(sx - 220, 1260); g.closePath(); g.fill();
  }
  g.restore();
  for (let i = 0; i < 26; i++) {
    const on = (Math.floor(t * 8) + i) % 3 === 0;
    const pos = i < 13 ? [60 + i * 66, 196] : [60 + (i - 13) * 66, 1200];
    g.fillStyle = on ? '#FFE27A' : '#5A5070'; g.fillRect(pos[0], pos[1], 18, 18);
  }
}
function hookQuiz(g, t) {
  quizBoard(g, t);
  const t0 = S('h4') - .3;
  const pq = E.out(clamp((t - t0) / .3));
  if (pq > 0) withAlpha(g, pq, () => {
    pbox(g, 60, 250 - Math.round((1 - pq) * 10) * 6, 840, 240, { k: 6, fill: 'rgba(27,23,48,.95)' });
    ptext(g, '过 1 个红灯，', 480, 350, 48, C.white, { align: 'center', sh: 1 });
    prich(g, '他{追上你}的可能有多大？', 480, 430, 48, C.white, C.amber, { align: 'center', sh: 1 });
  });
  const opts = [['A', '一成', CH('h4', 1) - .25], ['B', '四成', CH('h4', 2) - .25], ['C', '九成', CH('h4', 3) - .25]];
  opts.forEach(([L, s, ta], i) => {
    const p = pop(t, ta, .3); if (p <= 0) return;
    g.save(); g.translate(480, 600 + i * 135); g.scale(p, p);
    pbutton(g, -300, -55, 600, 110, '', { fill: ['#FFE9A8', '#A8E6FF', '#FFC2D4'][i] });
    ptext(g, L, -240, 22, 60, C.ink, { align: 'center' });
    ptext(g, s, 20, 22, 60, C.ink, { align: 'center' });
    g.restore();
  });
  // 你：抓头想；他：拿保温杯当话筒
  const k = 9, by = 1180;
  shadowAt(g, 230, by, k); crabAt(g, 230, by, k, youO(t, { eyes: 'up', arms: 'upR', mouth: 'wobble' }));
  if (t > CH('h4', 1)) thoughtBubble(g, 230, 1005, 90, 76, '？', 230, 1050, { px: 48 });
  shadowAt(g, 760, by, k); crabAt(g, 760, by, k, himO(t, { eyes: 'happy', mouth: 'smile', arms: 'upR' }), true);
  g.save(); g.imageSmoothingEnabled = false; g.drawImage(THERMOS(), Math.round(760 - 12 * k - 2 * k), Math.round(by - 16 * k - 6 * k), 3 * k, 7 * k); g.restore();
  // 念完以后：思考倒计时
  const te = EN('h4') + .05, u = clamp((t - te) / (SE('hook') - te));
  if (t > te) {
    pbox(g, 300, 1130, 360, 56, { k: 4, fill: '#2B2547', shadow: false });
    g.fillStyle = u < .7 ? C.green : '#FF5A4F'; g.fillRect(312, 1142, Math.round(336 * (1 - u) / 6) * 6, 32);
    ptext(g, '想好了吗？', 480, 1110, 36, C.white, { align: 'center', ol: C.ink, olw: 3 });
  }
}

/* ================= 封面（不带字幕） ================= */
function coverArt(g, t) {
  const st = hookStreetState(2.2);
  st.num = 37; st.walkers = [[.55, 0]];
  st.him.drv = himO(0, { eyes: 'happy', mouth: 'smile', arms: 'upR' }); st.him.cupDy = -1;
  st.you.drv = youO(0, { eyes: 'wide', mouth: 'o', sweat: true });
  // 镜头推近一点：P = 13，对准两辆车
  street(g, 0, st, { P: 13, camY: 34 });
  g.fillStyle = 'rgba(10,8,24,.18)'; g.fillRect(0, 0, W, 470);
  g.save(); g.translate(480, 150);
  ptext(g, '超过的车', 0, 70, 120, C.white, { align: 'center', ol: C.ink, olw: 10, sh: 1 });
  ptext(g, '总在红灯', 0, 230, 120, C.amber, { align: 'center', ol: C.ink, olw: 10, sh: 1 });
  ptext(g, '追上你？', 0, 390, 120, C.amber, { align: 'center', ol: C.ink, olw: 10, sh: 1 });
  g.restore();
  bigStamp(g, 99, 0, 640, 1500, '不是巧合', { px: 96, rot: -.1 });
}
