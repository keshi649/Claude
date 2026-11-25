'use strict';
/* scenes1.js：共用的小工具；开头（办公室里"你"窝在椅子上："原始人为什么不怕久坐？" → "人家天天打猎，哪坐得住！" →
   盖章"也歇 10 小时" → 哈扎人腿上的传感器：一天不走动将近 10 小时，跟你坐着的差不多 → 体检单：血脂、血糖都健康 →
   线索：秘密就在你屁股底下）；封面。
   开头照第一集的路子：先替观众说出最常见的想法，马上盖章推翻，再给证据、抛线索，前 20 秒切 4 次镜头（亮、暗交替）。
   关键的字都放在安全区里（x 60~900、y 200~1540），不让平台的按钮挡住。 */

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
function source(g, s, x, y, o = {}) { ptext(g, s, x, y, o.px || 22, o.col || '#8A80B0', { align: o.align || 'right' }); }
/* 放射光芒（亮底上用） */
function rays(g, x, y, t, col, n = 14) {
  g.save(); g.translate(x, y); g.rotate(t * .4); g.fillStyle = col;
  for (let i = 0; i < n; i++) { g.rotate(TAU / n); g.beginPath(); g.moveTo(0, 0); g.lineTo(-90, -1400); g.lineTo(90, -1400); g.closePath(); g.fill(); }
  g.restore();
}
/* 头像 */
const PORTRAIT = {
  you: portraitClawd({ scarf: true }),
  youShock: portraitClawd({ scarf: true, eyes: 'wide', mouth: 'o' }),
  youHappy: portraitClawd({ scarf: true, eyes: 'happy', mouth: 'smile' }),
};
/* "你"坐在办公椅上：(cx, seatY) 坐垫顶面中心；k 倍数；o.you 是小怪的选项，o.lean 往后靠 */
function youInChair(g, t, cx, seatY, k, o = {}) {
  const footY = drawOfficeChair(g, cx, seatY, k, { lean: o.lean || 0 });
  crabAt(g, cx, seatY + 4 * k, k, youO(t, o.you || {}));
  return footY;
}

/* ================= 开头 ================= */
function hook(g, t) {
  if (window.COVER) { coverArt(g, t); return; }
  if (t < S('h3') - .12) { hookOffice(g, t); return; }
  if (t < S('h4') - .12) { hookSensor(g, t); return; }
  if (t < S('h5') - .12) { hookHealth(g, t); return; }
  hookChair(g, t);
}
function titleBlock(g, t, y0 = 250, sc = 1) {
  const tp = 1 + .012 * Math.sin(t * 4);
  g.save(); g.translate(480, y0); g.scale(tp * sc, tp * sc); g.rotate(-.02);
  ptext(g, '原始人为什么', 0, 24, 72, C.white, { align: 'center', ol: C.ink, olw: 7, sh: 1 });
  ptext(g, '不怕久坐？', 0, 160, 120, C.amber, { align: 'center', ol: C.ink, olw: 9, sh: 1 });
  g.restore();
}
/* 想法气泡里的小草原：原始人追羚羊（盖章以后改成坐下来歇着、打哈欠） */
function bubbleHunt(g, t, x, y, w, h, rest) {
  pixOval(g, x, y, w / 2 + 6, h / 2 + 6, 6, C.ink); pixOval(g, x, y, w / 2, h / 2, 6, '#FFFFFF');
  for (let i = 1; i <= 2; i++) { const bx = x - w * .32 - i * 34, by2 = y + h * .42 + i * 30; pixOval(g, bx, by2, 10 + (3 - i) * 6, 8 + (3 - i) * 5, 6, C.ink); pixOval(g, bx, by2, 4 + (3 - i) * 6, 3 + (3 - i) * 5, 6, '#FFFFFF'); }
  clipOval(g, x, y, w / 2 - 12, h / 2 - 12, () => {
    g.fillStyle = '#BFE6FA'; g.fillRect(x - w / 2, y - h / 2, w, h * .55);
    g.fillStyle = '#C8B45A'; g.fillRect(x - w / 2, y + h * .05, w, h);
    const k = 5, gy = y + h * .3;
    if (!rest) {
      const run = (t * 140) % 260, cx = x - 120 + run * .6;
      g.save(); g.imageSmoothingEnabled = false; g.drawImage(ANTELOPE(), Math.round(cx + 70 + Math.sin(t * 9) * 4), Math.round(gy - 8 * k), 12 * k, 8 * k); g.restore();
      crabAt(g, cx, gy, k, cavemanO(t, { legs: walkLegs(t, 10), arms: 'upR' }));
      g.fillStyle = '#8C6440'; g.fillRect(Math.round(cx + 10 * k), Math.round(gy - 18 * k), k, 12 * k); g.fillStyle = '#9AA1AD'; g.fillRect(Math.round(cx + 9 * k), Math.round(gy - 20 * k), 3 * k, 2 * k);
    } else {
      crabAt(g, x - 20, gy, k, cavemanO(t, { pose: 'sit', eyes: Math.floor(t * 1.5) % 3 ? 'happy' : 'shut', mouth: Math.floor(t * 1.5) % 3 ? 'smile' : 'o' }));
      g.save(); g.imageSmoothingEnabled = false; g.drawImage(ANTELOPE(), Math.round(x + 60), Math.round(gy - 8 * k), 12 * k, 8 * k); g.restore();
    }
  });
}
/* 1. 办公室："你"窝在办公椅上刷手机；想到原始人在草原上追羚羊；盖章"也歇 10 小时" */
function hookOffice(g, t) {
  const b = pbuf('ho', 108, 192);
  officeBG(b, t);
  blit(g, 'ho', 10);
  const k = 12, cx = 430 + Math.round(Math.sin(t * 1.3) * 1) * k, seatY = 1060;
  const shock = t > S('h2') - .05;
  youInChair(g, t, cx, seatY, k, { lean: .6, you: shock ? { eyes: 'wide', mouth: 'o' } : t > S('d1') ? { eyes: 'happy', mouth: 'smile', arms: 'upR' } : { phone: true, eyes: 'dn' } });
  titleBlock(g, t);
  // 想法气泡：说"天天打猎"时冒出来；盖章以后原始人坐下来歇着
  const pb = pop(t, S('d1') - .05, .3);
  if (pb > 0) { g.save(); g.translate(690, 640); g.scale(pb, pb); bubbleHunt(g, t, 0, 0, 360, 240, t > S('h2') + .25); g.restore(); }
  // 盖章：白底垫着，缩小也看得清
  const ts = S('h2') - .2;
  if (t > ts) {
    const p = clamp((t - ts) / .25);
    g.save(); g.translate(400, 560); g.rotate(-.08); g.globalAlpha *= clamp(p * 3); g.fillStyle = 'rgba(255,255,255,.92)'; g.fillRect(-270, -70, 540, 140); g.restore();
    stamp(g, 400, 560, '也歇 10 小时', p, { px: 72, rot: -.08 });
  }
  dialogBox(g, t, 'd1', PORTRAIT.you);
}
/* 2. 深色"监测报告"：哈扎人腿上绑着传感器；一天 24 格，不走动的将近 10 格；"你"坐着的约 9 格 */
function hookSensor(g, t) {
  bgGrid(g, t, '#141A33');
  popTag(g, t, S('h3') - .05, 480, 250, '哈扎人：今天还在打猎采集的人', 36, { fill: C.gold });
  const k = 10, cx = 250, by = 700;
  shadowAt(g, cx, by, k);
  crabAt(g, cx, by, k, hadzaO(t, { arms: 'n' }));
  g.fillStyle = '#8C6440'; g.fillRect(cx + 14 * k, by - 26 * k, k, 24 * k);                       // 弓
  g.fillStyle = '#C9B48E'; g.fillRect(cx + 15 * k, by - 25 * k, 1, 22 * k);
  const [sx, sy] = crabPt(cx, by, k, 6, 11);
  if (t > CH('h3', 1) - .25) {
    sensorPatch(g, sx, sy, 3, t);
    // 放大镜：把传感器放大给你看
    const pz = pop(t, CH('h3', 1) - .2, .35);
    if (pz > 0) {
      g.save(); g.translate(640, 470); g.scale(pz, pz);
      pixOval(g, 0, 0, 156, 156, 6, C.ink); pixOval(g, 0, 0, 144, 144, 6, '#2B3460');
      sensorPatch(g, 0, -10, 12, t);
      ptext(g, '大腿上的传感器', 0, 100, 32, '#CFE6FF', { align: 'center' });
      g.restore();
      pline(g, sx + 20, sy - 10, 520, 560, 'rgba(160,200,255,.6)');
    }
  }
  // 一天 24 格
  const rows = [
    { y: 860, who: '哈扎人：不走动', v: 9.9, t0: CH('h3', 2) - .2, col: '#FFB547', label: '将近 10 小时' },
    { y: 1060, who: '你：坐着', v: 9, t0: CH('h3', 4) - .25, col: '#5EC8FF', label: '约 9 小时' },
  ];
  rows.forEach(r => {
    const p = E.out(clamp((t - r.t0) / .3)); if (p <= 0) return;
    withAlpha(g, p, () => {
      ptext(g, r.who, 110, r.y - 30, 40, C.white);
      const fill = clamp((t - r.t0) / 1.2) * r.v;
      for (let i = 0; i < 24; i++) {
        const x = 110 + i * 31;
        g.fillStyle = C.ink; g.fillRect(x - 3, r.y - 3, 31, 66);
        g.fillStyle = i < Math.floor(fill) ? r.col : i < fill ? mixHex('#3B3363', r.col, fill - i) : '#3B3363'; g.fillRect(x, r.y, 25, 60);
      }
      if (fill >= r.v - .01) ptext(g, r.label, 110 + Math.round(r.v * 31) + 10, r.y + 116, 40, r.col, { ol: C.ink, olw: 4 });
    });
  });
  ptext(g, '0 点', 110, 1236, 24, '#8A93B8'); ptext(g, '24 点', 850, 1236, 24, '#8A93B8', { align: 'right' });
  if (t > CH('h3', 4)) popTag(g, t, CH('h3', 4) + .3, 760, 1000, '差不多！', 36, { fill: C.gold });
  source(g, 'Raichlen 等 2020：28 个哈扎人戴了 8 天', 480, 316, { col: '#8A93B8', align: 'center' });
}
/* 3. 体检单：血脂、血糖都健康 */
function hookHealth(g, t) {
  bgPaper(g, '#F4FBF4', 'rgba(60,140,100,.10)');
  const p = E.out(clamp((t - S('h4') + .12) / .3));
  g.save(); g.translate(0, (1 - p) * 300); g.globalAlpha *= p;
  pbox(g, 110, 330, 700, 620, { k: 6, fill: '#FFFFFF', rim: '#E0E6EE' });
  g.fillStyle = '#3E9E4F'; g.fillRect(122, 342, 676, 80);
  ptext(g, '哈扎人 · 体检单', 460, 398, 48, C.white, { align: 'center', sh: 1 });
  ptext(g, '“坐出来的病”：', 170, 500, 40, C.ink);
  // 心电图：卡片一出来就在跳，下半截不空着
  g.fillStyle = '#E8F5EC'; g.fillRect(160, 800, 600, 120);
  let py = null;
  for (let x = 166; x < 754; x += 6) {
    const u = ((x - 166) + t * 300) % 240;
    const dy = u < 12 ? -u * 4 : u < 30 ? -48 + (u - 12) * 6 : u < 36 ? 60 - (u - 30) * 10 : 0;
    const y = 860 + Math.round(dy / 6) * 6, y0 = py === null ? y : py;
    g.fillStyle = '#3E9E4F'; g.fillRect(x, Math.min(y, y0), 6, Math.abs(y - y0) + 6);   // 和上一格连起来，不断成点
    py = y;
  }
  const rows = [['血脂', CH('h4', 1) - .2, 620], ['血糖', CH('h4', 1) + .25, 740]];
  rows.forEach(([s, t0, y]) => {
    const u = pop(t, t0, .3); if (u <= 0) return;
    withAlpha(g, clamp(u), () => { ptext(g, s, 200, y, 48, C.ink); g.fillStyle = '#D9E2EE'; g.fillRect(330, y - 30, 300, 6); });
    if (t > CH('h4', 2) - .2) { checkMark(g, 650, y - 44, 7, '#3E9E4F'); ptext(g, '健康', 720, y, 40, '#3E9E4F'); }
  });
  g.restore();
  // 旁边一个哈扎人，笑着
  const k = 9, cx = 760, by = 1200;
  shadowAt(g, cx, by, k);
  crabAt(g, cx, by, k, hadzaO(t, { eyes: 'happy', mouth: 'smile', arms: t > CH('h4', 2) ? 'upR' : 'n' }));
  source(g, 'Raichlen 等 2020', 880, 1250, { col: '#7A9A86' });
}
/* 4. 黑底聚光灯：秘密就在你屁股底下（椅子） */
function hookChair(g, t) {
  g.fillStyle = '#0E0B1A'; g.fillRect(0, 0, W, H);
  const k = 12, cx = 480, seatY = 980;
  // 聚光灯
  g.save(); g.globalAlpha = .9; g.fillStyle = 'rgba(255,240,200,.10)';
  g.beginPath(); g.moveTo(400, 0); g.lineTo(560, 0); g.lineTo(800, 1240); g.lineTo(160, 1240); g.closePath(); g.fill(); g.restore();
  pixOval(g, 480, 1238, 330, 30, 6, 'rgba(255,240,200,.16)');
  const clue = t > CH('h5', 1) - .15;
  youInChair(g, t, cx, seatY, k, { lean: .3, you: clue ? { eyes: 'dn', mouth: 'o' } : { eyes: 'up' } });
  if (clue) {
    // 坐垫一闪一闪，箭头指过去，大问号
    const q = .5 + .5 * Math.sin(t * 8);
    g.fillStyle = `rgba(255,211,78,${.35 + .4 * q})`; g.fillRect(cx - 11 * k, seatY - k, 22 * k, 3 * k);
    pixArrow(g, 840, 760, cx + 13 * k, seatY + k, 8, C.gold, clamp((t - CH('h5', 1) + .15) / .3));
    const pq = pop(t, CH('h5', 1), .35);
    if (pq > 0) { g.save(); g.translate(800, 620); g.scale(pq, pq); ptext(g, '？', 0, 50, 168, C.gold, { align: 'center', ol: C.ink, olw: 10 }); g.restore(); }
  }
  popTag(g, t, S('h5') - .05, 480, 300, '秘密', 48, { fill: C.gold });
}
/* 封面：大标题 + 窝在椅子里刷手机的"你" + 红章 + 想法气泡里歇着的原始人 */
function coverArt(g, t) {
  const b = pbuf('cov', 108, 192);
  officeBG(b, 0);
  blit(g, 'cov', 10);
  youInChair(g, 0, 470, 1270, 18, { lean: .6, you: { phone: true, eyes: 'dn' } });
  titleBlock(g, 0, 230, 1.08);
  g.save(); g.translate(690, 660); bubbleHunt(g, 1.2, 0, 0, 360, 240, true); g.restore();
  g.save(); g.translate(420, 580); g.rotate(-.08); g.fillStyle = 'rgba(255,255,255,.92)'; g.fillRect(-300, -80, 600, 160); g.restore();
  stamp(g, 420, 580, '也歇 10 小时', 1, { px: 84, rot: -.08 });
}
