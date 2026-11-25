'use strict';
/* scenes2.js：为什么要站岗（夜里的池塘：鸭子睡成一排，两头的睁着朝外的那只眼；两头的这样睡的时间多了一倍半 →
   科学家猜这是保命的本事：祖先在野外过夜，头一晚最危险 → "可我住的是酒店啊！" → 大脑只认"这地方没睡过"）；
   第一晚（53 项研究：第一晚入睡慢、醒得多、睡得少，第二晚就和后面几晚差不多 → 日历：考试前一天才住进酒店，考前那一晚正好是第一晚）。 */

/* ================= 一、为什么要站岗 ================= */
function duck(g, t) {
  if (t < S('n3') - .12) { duckPond(g, t); return; }
  if (t < S('d2') - .1) { duckCave(g, t); return; }
  duckHotel(g, t);
}
/* 夜里的池塘：四只绿头鸭睡成一排；两头的睁着朝外的那只眼（狐狸在右边的芦苇里）；半个大脑睡、半个放哨；一倍半的柱子 */
function duckPond(g, t) {
  const b = pbuf('pond', 216, 384); pondBG(b, t); blit(g, 'pond', 5);
  starField(g, t, 50, 0, 0, W, 640, 5, 9);
  glow(g, 230, 220, 260, 'rgba(255,244,200,.25)');
  reeds(g, t, 'R'); foxEyes(g, t, 850, 860);
  fireflies(g, t, 10, 100, 700, 880, 500, 5);
  const xs = [240, 400, 560, 720], by = 1000, blink = (t % 2.6) < .14;
  xs.forEach((x, i) => {
    const end = i === 0 || i === 3, eyes = end ? (blink ? 'cc' : i === 0 ? 'oc' : 'co') : 'cc';
    duckAt(g, x, by, 10, eyes, { droop: !end });
    if (!end) { const z = (t * .7 + i * .4) % 1; ptext(g, 'z', x + 40 + z * 20, by - 180 - z * 60, 40, `rgba(255,255,255,${1 - z})`, { ol: C.ink, olw: 4 }); }
  });
  reeds(g, t, 'L');
  // "两头的那两只"：圈出来；"朝着外面"：箭头
  if (t > CH('n1', 1) - .2) {
    const p = pop(t, CH('n1', 1) - .2, .3);
    withAlpha(g, clamp(p), () => { [240, 720].forEach(x => { g.strokeStyle = C.gold; g.lineWidth = 6; g.strokeRect(x - 90, by - 185, 180, 195); }); });
    popTag(g, t, CH('n1', 2) - .2, 240, 780, '睁一只眼', 32, { fill: C.gold });
    popTag(g, t, CH('n1', 2) - .1, 720, 780, '睁一只眼', 32, { fill: C.gold });
  }
  if (t > CH('n1', 3) - .2) {
    const u = clamp((t - CH('n1', 3) + .2) / .4);
    pixArrow(g, 190, by - 130, 75, by - 130, 8, C.gold, u); pixArrow(g, 770, by - 130, 885, by - 130, 8, C.gold, u);
    popTag(g, t, CH('n1', 3) - .1, 130, by - 70, '朝外', 32, { fill: '#FFE9A8' });
  }
  if (t > CH('n1', 4) - .25) {
    const p = pop(t, CH('n1', 4) - .25, .3);
    [[240, 'awake', 'asleep'], [720, 'asleep', 'awake']].forEach(([x, l, r]) => { g.save(); g.translate(x, 690); g.scale(p, p); brainIcon(g, t, 0, 0, 4, { left: l, right: r, labels: false }); g.restore(); });
    popTag(g, t, CH('n1', 5) - .2, 480, 705, '半个睡 · 半个放哨', 36, { fill: '#B8F0C8' });
  }
  // 柱子：两头的这样睡的时间，比中间的多了一倍半
  if (t > S('n2') - .2) {
    const p = pop(t, S('n2') - .2, .35);
    g.save(); g.translate(480, 420); g.scale(p, p); g.translate(-480, -420);
    pbox(g, 120, 220, 720, 420, { k: 6, fill: 'rgba(20,24,52,.94)' });
    ptext(g, '睁一只眼、半个大脑睡的时间', 480, 280, 36, C.white, { align: 'center' });
    const u1 = E.out(clamp((t - CH('n2', 1) + .2) / .5)), u2 = E.out(clamp((t - CH('n2', 3) + .3) / .5));   // 中间那根先长；念到"多了一倍半"时右边那根已经长好
    const hb = 170;
    g.fillStyle = '#5EC8FF'; g.fillRect(250, 550 - Math.round(hb / 2.5 * u1), 140, Math.round(hb / 2.5 * u1));
    g.fillStyle = C.gold; g.fillRect(570, 550 - Math.round(hb * u2), 140, Math.round(hb * u2));
    g.fillStyle = '#FFFFFF'; g.fillRect(200, 550, 560, 4);
    ptext(g, '中间的', 320, 590, 32, '#CFC6E8', { align: 'center' }); ptext(g, '两头的', 640, 590, 32, '#CFC6E8', { align: 'center' });
    if (u2 > .95) ptext(g, '多一倍半', 640, 362, 40, C.gold, { align: 'center', ol: C.ink, olw: 5 });
    source(g, '出处：Rattenborg 等，1999（绿头鸭，4 只一排）', 830, 626);
    g.restore();
  }
}
/* 山洞：祖先在野外过夜，篝火边睡着两个；洞外黑漆漆的灌木里有狼的眼睛；一个的泡泡里左脑在站岗 */
function duckCave(g, t) {
  const b = pbuf('cave', 216, 384); caveBG(b, t); blit(g, 'cave', 5);
  wolfEyes(g, t, 470, 900, 0); wolfEyes(g, t, 620, 940, 1.7);
  campfire(g, t, 480, 1180);
  crabAt(g, 250, 1230, 10, { hat: 'fur', eyes: 'shut' }); crabAt(g, 720, 1230, 10, { hat: 'fur', eyes: 'shut' }, true);
  const z = (t * .8) % 1; ptext(g, 'z', 800 + z * 30, 1020 - z * 70, 44, `rgba(255,255,255,${1 - z})`, { ol: C.ink, olw: 4 });
  brainBubble(g, t, 330, 760, 140, { p: pop(t, CH('n3', 4) - .25, .3), left: 'awake', right: 'asleep', sentry: 'watch', tx: 260, ty: 1060, beam: -.3 });   // 念到"留半个大脑放哨"时冒出来
  popTag(g, t, S('n3') - .05, 480, 300, '科学家的猜测', 40, { fill: '#D3D0DE' });
  popTag(g, t, CH('n3', 2) - .2, 640, 520, '没睡过的地方', 36, { fill: C.gold });
  popTag(g, t, CH('n3', 3) - .15, 640, 600, '头一晚最危险', 36, { fill: '#FF8A7A' });
}
/* 回到酒店："可我住的是酒店啊！" → 泡泡里的小人拿手电筒四处照：空调声？门外的脚步？没见过的窗？→ "这地方没睡过" */
function duckHotel(g, t) {
  roomScene(g, t, { you: { eyes: 'wide', mouth: t < S('n4') ? 'o' : 'flat' } });
  const n0 = S('n4');
  const tgt = [[850, 220, '空调声？'], [800, 1050, '门外有人？'], [300, 790, '这窗户？']];
  const k = Math.min(2, Math.floor(Math.max(0, t - n0 + .2) / 1.1));
  const [tx, ty] = tgt[k], beam = Math.atan2(ty - 770, tx - 680);
  brainBubble(g, t, 720, 780, 150, { p: pop(t, S('d2') + .05, .3), left: 'awake', right: 'asleep', sentry: 'watch', beam: t > n0 - .2 ? beam : undefined, tx: 600, ty: 960 });
  tgt.forEach(([x, y, s], i) => { if (t > n0 - .2 + i * 1.1) popTag(g, t, n0 - .2 + i * 1.1, x - (i === 0 ? 120 : 0), y + (i === 0 ? 90 : 0), s, 32, { fill: '#FFE9A8' }); });
  dialogBox(g, t, 'd2', PORTRAIT.youShock);
  if (t > CH('n4', 2) - .2) bigStamp(g, t, CH('n4', 2) - .2, 430, 600, '没睡过！', { px: 72, rot: -.06 });
}

/* ================= 二、第一晚 ================= */
function exam(g, t) {
  if (t < S('e2') - .12) { examStats(g, t); return; }
  examCalendar(g, t);
}
/* 53 项研究汇总：53 张论文一张张落下来；表格：第一晚 / 第二晚 / 第三晚 */
function examStats(g, t) {
  bgPaper(g);
  const t0 = SS('exam');
  ptext(g, '53 项研究汇总', 480, 280, 60, C.ink, { align: 'center' });
  for (let i = 0; i < 53; i++) {
    const tt = t0 + .2 + i * .028, u = clamp((t - tt) / .25); if (u <= 0) continue;
    const x = 132 + (i % 11) * 64, y = 330 + Math.floor(i / 11) * 64 - Math.round((1 - E.out(u)) * 60);
    paperIcon(g, x, y, 4, i % 7 === 3 ? '#FFF4DF' : '#FFFFFF');
  }
  // 表格
  if (t > CH('e1', 1) - .25) {
    const p = pop(t, CH('e1', 1) - .25, .3);
    g.save(); g.translate(480, 900); g.scale(p, p); g.translate(-480, -900);
    pbox(g, 80, 680, 800, 470, { k: 6, fill: '#FFFFFF' });
    const cols = [[380, '第一晚'], [560, '第二晚'], [740, '第三晚']], rows = [[820, '入睡'], [920, '半夜醒'], [1020, '睡着的']];
    cols.forEach(([x, s], i) => ptext(g, s, x, 740, 36, i === 0 ? '#E5322D' : C.ink, { align: 'center' }));
    rows.forEach(([y, s]) => ptext(g, s, 110, y + 12, 36, C.ink));
    g.fillStyle = '#D9D2C2'; g.fillRect(100, 770, 760, 4);
    const cell = (x, y, s, col, tt) => { if (t < tt) return; const q = pop(t, tt, .25); g.save(); g.translate(x, y); g.scale(q, q); g.fillStyle = col; g.fillRect(-70, -36, 140, 72); ptext(g, s, 0, 14, 36, C.white, { align: 'center' }); g.restore(); };
    const r = '#E5322D', gr = '#3E9E4F';
    cell(380, 820, '慢', r, CH('e1', 2) - .2); cell(380, 920, '多', r, CH('e1', 2) + .35); cell(380, 1020, '少', r, CH('e1', 3) - .2);
    [820, 920, 1020].forEach((y, i) => cell(560, y, ['快', '少', '够'][i], gr, CH('e1', 4) - .2 + i * .12));
    [820, 920, 1020].forEach((y, i) => cell(740, y, ['快', '少', '够'][i], gr, CH('e1', 5) - .2 + i * .12));
    if (t > CH('e1', 5)) ptext(g, '≈', 650, 1110, 60, gr, { align: 'center' });
    g.restore();
  }
  source(g, '出处：Ding 等，2022，Sleep Medicine（汕头大学；53 项研究、1422 人）', 880, 1210, { col: '#7A7090' });
}
/* 日历：周日考试，周六才住进酒店 → 考前那一晚正好是第一晚（盖章）→ "那我得早点去！" 行李箱往前挪到周五 */
function examCalendar(g, t) {
  bgPaper(g, '#FBF6EA');
  const days = ['一', '二', '三', '四', '五', '六', '日'], x0 = 90, cw = 112, y0 = 470;
  ptext(g, '这一周', 480, 400, 44, C.ink, { align: 'center' });
  days.forEach((d, i) => {
    const x = x0 + i * cw;
    g.fillStyle = C.ink; g.fillRect(x, y0, cw - 8, 300); g.fillStyle = i === 6 ? '#FFE3E0' : '#FFFFFF'; g.fillRect(x + 4, y0 + 60, cw - 16, 236);
    g.fillStyle = i === 6 ? '#E5322D' : '#5A6378'; g.fillRect(x + 4, y0 + 4, cw - 16, 56);
    ptext(g, '周' + d, x + (cw - 8) / 2, y0 + 44, 32, C.white, { align: 'center' });
  });
  // 夜里（两天之间）：月亮
  for (let i = 0; i < 6; i++) moonIcon(g, x0 + i * cw + cw - 4, y0 + 350, 4, '#FBF6EA');
  examIcon(g, x0 + 6 * cw + 16, y0 + 110, 6); ptext(g, '考试', x0 + 6 * cw + 52, y0 + 270, 32, '#E5322D', { align: 'center' });
  // 行李箱：先落在周六（入住），说"那我得早点去"时挪到周五
  const tIn = CH('e2', 2) - .2;
  if (t > tIn) {
    const move = E.io(clamp((t - S('d3') - .3) / .5)), x = x0 + (5 - move) * cw + 12, drop = Math.round((1 - E.out(clamp((t - tIn) / .3))) * -80);
    suitcaseIcon(g, x, y0 + 120 + drop, 5, move > .99 ? '#3E9E4F' : '#E5322D');
    ptext(g, '入住', x + 40, y0 + 270, 32, C.ink, { align: 'center' });
  }
  // 考前那一晚：周六夜里
  if (t > CH('e2', 3) - .2) {
    const p = pop(t, CH('e2', 3) - .2, .3), nx = x0 + 5 * cw + cw - 4, ny = y0 + 350;
    withAlpha(g, clamp(p), () => { g.strokeStyle = '#E5322D'; g.lineWidth = 8; g.strokeRect(nx - 60, ny - 50, 120, 100); });
    popTag(g, t, CH('e2', 3) - .1, nx - 50, ny + 95, '考前那一晚', 36, { fill: '#FFE9A8' });
  }
  const shock = t > EN('e2') + .02;
  shadowAt(g, 200, 1230, 10);
  crabAt(g, 200, 1230, 10, youO(t, shock ? { eyes: 'wide', mouth: 'o', sweat: true } : { eyes: 'up' }));
  if (t > tIn) popTag(g, t, tIn + .1, 200, 1010, '准考证', 28, { fill: '#FFE9A8' });
  if (shock) {
    const nx = x0 + 5 * cw + cw - 4;
    sentryAt(g, t, nx - 20, 1180, 6, { beam: -1.75, len: 260 });
    bigStamp(g, t, EN('e2') + .02, 520, 1010, '第一晚！', { px: 72, rot: -.06 });
  }
  dialogBox(g, t, 'd3', PORTRAIT.youExam);
}
