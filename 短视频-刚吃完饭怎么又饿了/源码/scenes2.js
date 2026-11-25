'use strict';
/* scenes2.js：边吃边玩的实验（两组人吃一样的午饭，一组边吃边玩电脑游戏、一组专心吃 → 半小时后尝饼干：52 克对 27 克 →
   边玩的觉得没那么饱、记不清吃了啥）→ "吃的明明一样多啊！" → 大脑里的账本：饱不饱不光看胃，账本记着"刚吃过"，才压得住馋虫。 */

function lab(g, t) {
  if (t < S('d2') - .1) { labTwo(g, t); return; }
  labLedger(g, t);
}
/* 两张桌子：左边边吃边玩（显示器上在发牌），右边专心吃；半小时后：上面一块牌子，柱子 52 克对 27 克；
   然后两人头顶的泡泡：左边记不清吃了啥、饱腹度低，右边记得清清楚楚 */
function labTwo(g, t) {
  const b = pbuf('labroom', 216, 384); labRoomBG(b, t); blit(g, 'labroom', 5);
  const tB = S('n2') - .15, tC = S('n3') - .2, k = 15;
  const L = 300, Rr = 740;
  crabAt(g, L, 1130, k, person(0, { hat: undefined, eyes: Math.floor(t * 2) % 3 ? 'l' : 'up', mouth: Math.floor(t * 4) % 2 ? 'chew' : 'flat' }));
  crabAt(g, Rr, 1130, k, person(1, { eyes: 'dn', mouth: Math.floor(t * 3) % 2 ? 'chew' : 'smile' }));
  // 桌子
  g.fillStyle = '#E8ECF2'; g.fillRect(40, 1070, 470, 40); g.fillRect(540, 1070, 400, 40); g.fillStyle = '#C9D3DE'; g.fillRect(40, 1110, 470, 400); g.fillRect(540, 1110, 400, 400);
  // 左边的显示器（玩纸牌），挡住一点胳膊
  g.fillStyle = '#2B2547'; g.fillRect(30, 900, 170, 130); g.fillStyle = '#3E9E4F'; g.fillRect(40, 910, 150, 100);
  for (let i = 0; i < 3; i++) { g.fillStyle = '#FFFFFF'; g.fillRect(50 + i * 44, 918, 34, 46); g.fillStyle = i % 2 ? '#E5322D' : C.ink; g.fillRect(56 + i * 44, 924, 8, 8); }
  const fly = (t * 1.3) % 1; g.fillStyle = '#FFFFFF'; g.fillRect(56 + fly * 100, 968 - Math.sin(fly * Math.PI) * 24, 30, 40);
  g.fillStyle = '#5A6378'; g.fillRect(105, 1030, 20, 40);
  if (t < tB) { tray(g, L + 40, 1060, .6, clamp((t - SS('lab') - .5) / 4)); tray(g, Rr, 1060, .6, clamp((t - SS('lab') - .5) / 4)); }
  else { [L + 40, Rr].forEach(x => { pixOval(g, x, 1066, 80, 22, 4, '#FFFFFF'); food(g, 'cookie', x - 30, 1052, 5); food(g, 'cookie', x + 30, 1052, 5); }); }
  popTag(g, t, CH('n1', 3) - .2, L, 830, '边吃边玩', 40, { fill: C.gold });
  popTag(g, t, CH('n1', 5) - .2, Rr, 830, '专心吃', 40, { fill: '#B8F0C8' });
  popTag(g, t, S('n1') - .05, 480, 470, '一样的午饭', 40, { fill: '#FFE9A8', t1: tB });
  // 半小时后：饼干，牌子上的两根柱子
  if (t > tB && t < tC + .3) {
    const out = clamp((tC + .3 - t) / .3);
    withAlpha(g, out, () => {
      popTag(g, t, tB, 480, 470, '半小时后：尝饼干', 40, { fill: '#FFE9A8' });
      pbox(g, 120, 520, 720, 300, { k: 6, fill: 'rgba(20,24,52,.94)' });
      const u1 = E.out(clamp((t - CH('n2', 2) + .25) / .6)), u2 = E.out(clamp((t - CH('n2', 4) + .25) / .6));
      const bar = (y, v, u, col, lab, val) => {
        ptext(g, lab, 150, y + 40, 32, '#CFC6E8');
        const w = Math.round(v * 7.0 * u / 6) * 6; g.fillStyle = col; g.fillRect(330, y + 6, w, 44);
        for (let i = 0; i < Math.floor(w / 52); i++) food(g, 'cookie', 360 + i * 52, y + 28, 4);
        if (u > .95) ptext(g, val, 340 + w, y + 42, 40, C.white, { ol: C.ink, olw: 5 });
      };
      if (t > CH('n2', 2) - .25) bar(580, 52.1, u1, '#FFB547', '边吃边玩', '52 克');
      if (t > CH('n2', 4) - .25) bar(680, 27.1, u2, '#9FE3B8', '专心吃', '27 克');
      if (t > CH('n2', 5) - .2) popTag(g, t, CH('n2', 5) - .2, 700, 770, '差不多 2 倍', 40, { fill: '#FF8A7A' });
    });
  }
  // 还觉得没那么饱、记不清吃了啥
  if (t > tC) {
    const p = pop(t, tC, .3);
    g.save(); g.translate(L, 640); g.scale(p, p);
    bubble(g, 0, 0, 190, 95, null, null); ptext(g, '午饭吃了啥？', 0, -24, 36, C.ink, { align: 'center' });
    ['rice', 'veg', 'leg'].forEach((f, i) => food(g, f, -80 + i * 80 + Math.sin(t * 9 + i) * 6, 36, 5, { a: .25 }));
    g.restore();
    g.save(); g.translate(Rr, 640); g.scale(p, p);
    bubble(g, 0, 0, 190, 95, null, null); ptext(g, '米饭、青菜、鸡腿', 0, -24, 32, C.ink, { align: 'center' });
    ['rice', 'veg', 'leg'].forEach((f, i) => food(g, f, -80 + i * 80, 36, 5));
    g.restore();
    if (t > CH('n3', 1) - .2) { const q = E.out(clamp((t - CH('n3', 1) + .2) / .5)); hungerBar(g, L - 140, 500, 280, .45 * q); hungerBar(g, Rr - 140, 500, 280, .85 * q); }
  }
  source(g, '出处：Oldham-Cooper 等，2011，美国临床营养学杂志（44 人）', 880, 1238);
}
/* 大脑里的账本（特写）："吃的明明一样多啊！"→ 左边的胃"满了"，可馋虫还在扭；记账的小人写下"午饭：米饭、青菜、鸡腿"，盖上"刚吃过"，
   账本压下来，馋虫就老实了 */
function labLedger(g, t) {
  g.fillStyle = '#3A1E36'; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,157,181,.08)'; for (let i = 0; i < 9; i++) { const y = 260 + i * 150 + Math.sin(t + i) * 10; g.fillRect(0, Math.round(y / 5) * 5, W, 10); }
  for (let i = 0; i < 18; i++) { const x = hash(i, 4) * W, y = 240 + hash(i, 5) * 1100 + Math.sin(t * 1.3 + i) * 14; g.fillStyle = 'rgba(255,190,210,.18)'; g.fillRect(Math.round(x / 5) * 5, Math.round(y / 5) * 5, 10, 10); }
  ptext(g, '你的大脑里', 480, 300, 44, '#FFB8CC', { align: 'center' });
  // 胃
  const sx = 190, sy = 470;
  pixOval(g, sx, sy, 110, 80, 6, C.ink); pixOval(g, sx, sy, 100, 70, 6, '#FF9DB5'); pixOval(g, sx + 18, sy + 10, 72, 44, 6, '#F27A98');
  ptext(g, '胃：满了', sx, sy + 130, 36, C.white, { align: 'center', ol: C.ink, olw: 4 });
  // 账本
  const wr = CH('n4', 4) - .2, st = CH('n4', 4) + .5, press = CH('n4', 5) - .2;
  const lx = 560, ly = 760 + Math.round(E.io(clamp((t - press) / .45)) * 180);
  const reveal = t < wr ? 0 : Math.min(3, 1 + Math.floor((t - wr) / .3));
  ledger(g, t, lx, ly, 1.4, { rows: ['早饭 ✓'], blank: t < wr, lunch: ['rice', 'veg', 'leg'], reveal, distract: false, stampTxt: t > st ? '刚吃过' : null, stampP: clamp((t - st) / .25) });
  // 馋虫：压住以前一直扭，压住以后变小、闭眼
  const squash = clamp((t - press - .35) / .3);
  if (squash < 1) { g.save(); g.translate(640, 1180); chanchong(g, t, 0, 0, 12, { angry: t < wr }); g.restore(); }
  else { g.save(); g.translate(660, 1200); chanchong(g, t, 0, 0, 6, { sleep: true }); g.restore(); popTag(g, t, press + .65, 300, 1180, '压住了', 36, { fill: '#B8F0C8' }); }
  if (t > CH('n4', 2) - .2) popTag(g, t, CH('n4', 2) - .2, 640, 470, '还有本账', 40, { fill: C.gold });
  dialogBox(g, t, 'd2', PORTRAIT.youShock);
}
