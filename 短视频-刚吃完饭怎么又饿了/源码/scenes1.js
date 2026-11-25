'use strict';
/* scenes1.js：共用的小工具；开头（中午的办公桌："你"边刷手机边吃完了外卖，饱腹度一下就掉光："刚吃完饭，怎么又饿了？"→
   "肯定没吃饱！"→ 盖章"大脑忘了"，头顶的泡泡里，大脑的账本上"午饭"那一行是空的，记账的小人在看手机 →
   明亮的餐厅：失忆的人吃完午饭，不到半小时再端一份，照样又吃，还吃了第三顿 → 手机特写：账本还是空的 →
   下午三点：手伸进薯片袋，馋虫冒出来，"多吃的在下一顿"）；封面。
   前 20 秒切 4 次镜头：中午的办公室 → 亮的餐厅 → 压暗的手机特写 → 下午暖光的办公室。 */

/* ================= 共用 ================= */
function popTag(g, t, t0, x, y, s, px = 36, o = {}) {
  const p = pop(t, t0, .3) * (o.t1 ? clamp((o.t1 - t) / .2) : 1);
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p); ptag(g, 0, 0, s, px, o); g.restore();
}
function popText(g, t, t0, t1, s, x, y, px, col, o = {}) {
  const p = pop(t, t0, .3) * clamp((t1 - t) / .2);
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p);
  ptext(g, s, 0, px * .35, px, col, { align: 'center', ol: o.ol || C.ink, olw: o.olw || 6, sh: 1 });
  g.restore();
}
function source(g, s, x, y, o = {}) { ptext(g, s, x, y, o.px || 22, o.col || '#6A7A90', { align: o.align || 'right' }); }
const PORTRAIT = {
  you: portraitClawd({ scarf: true }),
  youHungry: portraitClawd({ scarf: true, eyes: 'tired', mouth: 'o' }),
  youShock: portraitClawd({ scarf: true, eyes: 'wide', mouth: 'o' }),
  youThink: portraitClawd({ scarf: true, eyes: 'up', sweat: true }),
  youHappy: portraitClawd({ scarf: true, eyes: 'happy', mouth: 'smile' }),
};
/* 盖章，下面垫一块白底 */
function bigStamp(g, t, t0, x, y, s, o = {}) {
  if (t < t0) return;
  const p = clamp((t - t0) / .25), px = o.px || 84, w = pw(g, s, px) + px * 1.4, h = px * 2;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -.08); g.globalAlpha *= clamp(p * 3); g.fillStyle = 'rgba(255,255,255,.92)'; g.fillRect(-w / 2, -h / 2, w, h); g.restore();
  stamp(g, x, y, s, p, { px, rot: o.rot ?? -.08, col: o.col });
}
/* 放射的光芒 + 一圈火花（盖章那一下） */
function sparkBurst(g, x, y, t, t0, o = {}) {
  const u = t - t0; if (u < 0 || u > .8) return;
  const n = o.n || 14, r0 = (o.r || 160) * E.out(clamp(u / .5));
  for (let i = 0; i < n; i++) {
    const a = i * TAU / n + t0, r = r0 * (.7 + .3 * hash(i, 3));
    g.fillStyle = `rgba(255,${200 + Math.round(hash(i, 5) * 55)},120,${1 - u / .8})`;
    g.fillRect(Math.round((x + Math.cos(a) * r) / 5) * 5, Math.round((y + Math.sin(a) * r) / 5) * 5, 10, 10);
  }
}
/* 大标题：两行，按整像素上下跳，不缩放、不转 */
function titleBlock(g, t, y0 = 250) {
  const bob = Math.round(Math.sin(t * 4)) * 6;
  g.save(); g.translate(480, y0 + bob);
  ptext(g, '刚吃完饭', 0, 24, 72, C.white, { align: 'center', ol: C.ink, olw: 6, sh: 1 });
  ptext(g, '怎么又饿了？', 0, 160, 120, C.amber, { align: 'center', ol: C.ink, olw: 10, sh: 1 });
  g.restore();
}
/* 办公桌前的"你"：o.pm 下午；o.you 小怪选项；o.phone 拿着手机；o.box 外卖盒（0 满 1 空）；o.chips 手伸进薯片袋 */
function deskScene(g, t, o = {}) {
  const pm = o.pm || 0, name = pm ? 'officePM' : 'office';
  const b = pbuf(name, 216, 384); officeBG(b, t, { pm }); blit(g, name, 5);
  if (pm) glow(g, 800, 480, 520, 'rgba(255,190,120,.3)'); else glow(g, 870, 320, 420, 'rgba(255,250,220,.3)');
  wallClock(g, 900, 560, 46, o.clock ?? 12 * 60 + 40);
  peekers(g, t);
  const cx = 540, by = 1190, k = 15;
  crabAt(g, cx, by, k, youO(t, o.you || {}));
  officeDesk(g, t, { box: o.box ?? 1, cards: false, monitor: '#2F6FC1' });
  if (o.phone !== false) { const [px, py] = crabPt(cx, by, k, 7, 3); phoneHeld(g, t, px, py, .85); }
  if (o.chips) {
    const sx = 560, sy = 1000;
    g.fillStyle = '#E5322D'; g.fillRect(sx, sy, 150, 160); g.fillStyle = '#FFD84A'; g.fillRect(sx + 14, sy + 40, 122, 70); ptext(g, '薯片', sx + 75, sy + 90, 40, '#E5322D', { align: 'center' });
    g.fillStyle = '#B0201C'; for (let x = sx; x < sx + 150; x += 15) g.fillRect(x, sy - 8, 8, 8);
    for (let i = 0; i < 6; i++) { const ph = (t * 1.6 + i * .37) % 1; food(g, 'chips', sx + 40 + (hash(i, 3) - .5) * 160, sy - 10 + ph * 160, 3, { a: 1 - ph }); }
  }
}

/* ================= 开头 ================= */
function hook(g, t) {
  if (window.COVER) { coverArt(g, t); return; }
  if (t < S('h3') - .12) { hookDesk(g, t); return; }
  if (t < S('h4') - .12) { hookClinic(g, t); return; }
  if (t < S('h5') - .12) { hookPhone(g, t); return; }
  hookSnack(g, t);
}
/* 1. 中午的办公桌：外卖吃完了，"你"边刷手机边擦嘴；饱腹度一下掉光，"咕～"；"肯定没吃饱！"；盖章"大脑忘了"，泡泡里账本"午饭"那行是空的 */
function hookDesk(g, t, cover = false) {
  const ts = S('h2') - .35;   // 和 audio.py 的盖章声同时（h1 很短，盖章声 0.3 秒，要整个落在对话框的时候、不压"错"字）
  deskScene(g, t, { you: t > ts || cover ? { eyes: 'wide', mouth: 'o' } : { eyes: 'dn' } });
  titleBlock(g, t);
  const v = cover ? .08 : 1 - .92 * E.io(clamp((t - .4) / 1.6));
  hungerBar(g, 330, 500, 300, v);
  if (!cover && t > EN('h1') + .05 && t < ts + .1) popText(g, t, EN('h1') + .05, ts + .1, '咕～', 760, 960, 48, '#FFFFFF', { olw: 5 });   // 和 audio.py 的肚子叫同时
  if (!cover) dialogBox(g, t, 'd1', PORTRAIT.youHungry);
  if (t > ts + .15 || cover) {
    const p = cover ? 1 : pop(t, ts + .15, .35);
    g.save(); g.translate(715, 790); g.scale(p, p); g.translate(-715, -790);
    bubble(g, 715, 790, 190, 135, 610, 930);
    ledger(g, t, 715, 780, .72, { rows: ['早饭 ✓'], blank: true, distract: true });
    g.restore();
  }
  if (t > ts || cover) {
    if (!cover) sparkBurst(g, 420, 640, t, ts, { r: 270 });
    bigStamp(g, cover ? 1 : t, cover ? 0 : ts, 420, 640, '大脑忘了', { px: 84 });
  }
}
/* 2. 明亮的餐厅：失忆的人吃午饭；吃完不到半小时再端一份，照样又吃；第三顿 */
function hookClinic(g, t) {
  const b = pbuf('clinic', 216, 384); clinicBG(b, t); blit(g, 'clinic', 5);
  const t0 = S('h3') - .12, c1 = CH('h3', 2), c2 = CH('h3', 3), c3 = CH('h3', 5) - .2;
  // 挂钟：每顿之间转过 20 分钟
  const min = 12 * 60 + 20 * clamp((t - t0) / (c2 - t0)) + 20 * clamp((t - c2) / Math.max(.5, c3 - c2)) + 10 * clamp((t - c3) / 2);
  wallClock(g, 760, 600, 44, min);
  const cx = 520, by = 1190, k = 15;
  // 吃完的空盘子摞在左边
  const done = (t > c1 ? 1 : 0) + (t > c3 - .1 ? 1 : 0);
  for (let i = 0; i < done; i++) { g.fillStyle = '#5A6378'; g.fillRect(90, 1105 - i * 26, 200, 22); g.fillStyle = '#C9D3E0'; g.fillRect(96, 1109 - i * 26, 188, 14); }
  const chew = Math.floor(t * 5) % 2 ? 'chew' : 'flat';
  crabAt(g, cx, by, k, { col: TONES.teal, eyes: blinkEyes(t, 3), mouth: chew });
  g.fillStyle = '#FFFFFF'; g.fillRect(40, 1150, 900, 60); g.fillStyle = '#E2E8EE'; g.fillRect(40, 1150, 900, 10); g.fillStyle = '#C9D3DE'; g.fillRect(40, 1210, 900, 400);
  // 当前这一盘：滑进来、慢慢吃光
  const meal = t < c2 ? 0 : t < c3 ? 1 : 2, tIn = [t0, c2, c3][meal], tOut = [c1, c3 - .1, 1e9][meal];
  const slide = E.out(clamp((t - tIn) / .35)), eaten = clamp((t - tIn - .3) / Math.max(.6, (tOut - tIn) * .75));
  tray(g, 640 + (1 - slide) * 500, 1120, .8, eaten);
  popTag(g, t, t0 + .05, 480, 470, '失忆的人（两位）', 40, { fill: '#B8E6FF' });
  [['第 1 顿', t0 + .15], ['第 2 顿', c2 - .15], ['第 3 顿', c3]].forEach(([s, tt], i) => popTag(g, t, tt, 260 + i * 220, 560, s, 40, { fill: i === 2 ? '#FF8A7A' : C.gold }));
  if (t > c2 + .3) { const p = pop(t, c2 + .3, .3); g.save(); g.translate(330, 860); g.scale(p, p); bubble(g, 0, 0, 150, 60, 140, 110); ptext(g, '刚才……吃过吗？', 0, 14, 36, C.ink, { align: 'center' }); g.restore(); }
  source(g, '出处：Rozin 等，1998，Psychological Science', 880, 1238);
}
/* 3. 手机特写：边吃边刷，筷子一口口往嘴里送；头顶的账本还是空的 */
function hookPhone(g, t) {
  const b = pbuf('office', 216, 384); officeBG(b, t, {}); blit(g, 'office', 5);
  g.fillStyle = 'rgba(20,16,40,.55)'; g.fillRect(0, 0, W, H);
  const cx = 330, by = 1330, k = 15;
  crabAt(g, cx, by, k, youO(t, { eyes: 'r', mouth: Math.floor(t * 4) % 2 ? 'chew' : 'flat' }));
  phoneHeld(g, t, 560, 760, 1.9);
  // 筷子夹着米饭往嘴里送
  const ph = (t * 1.4) % 1, up = ph < .5 ? ph * 2 : 2 - ph * 2;
  const [mx, my] = crabPt(cx, by, k, 12, 7);
  g.fillStyle = '#C9A06A'; g.save(); g.translate(mx + 160, my + 120 - up * 110); g.rotate(-.9); g.fillRect(-6, 0, 12, 200); g.fillRect(14, 4, 12, 200); g.restore();
  if (up < .9) food(g, 'rice', mx + 60, my + 90 - up * 100, 3);
  bubble(g, 470, 420, 260, 170, 330, 1040);
  ledger(g, t, 470, 415, .95, { rows: ['早饭 ✓'], blank: true, distract: true });
  popTag(g, t, CH('h4', 2) - .2, 470, 640, '这一顿：没记下', 40, { fill: '#FF8A7A' });
}
/* 4. 下午三点：手伸进薯片袋，馋虫冒出来；"多吃的在下一顿" */
function hookSnack(g, t) {
  const t0 = S('h5') - .12;
  deskScene(g, t, { pm: 1, clock: 15 * 60, phone: false, chips: true, you: { eyes: 'happy', mouth: Math.floor(t * 5) % 2 ? 'chew' : 'tongue', arms: 'upR' } });
  popTag(g, t, t0 + .05, 480, 470, '下午三点', 44, { fill: C.gold });
  if (t > CH('h5', 1) - .25) { const p = pop(t, CH('h5', 1) - .25, .35); g.save(); g.translate(330, 870); g.scale(p, p); chanchong(g, t, 0, 0, 10, { angry: true }); g.restore(); popTag(g, t, CH('h5', 1) - .1, 300, 760, '馋虫', 36, { fill: '#B8F0C8' }); }
  if (t > CH('h5', 3) - .2) bigStamp(g, t, CH('h5', 3) - .2, 640, 640, '下一顿', { px: 72, rot: -.06 });
}

/* ================= 封面（不带字幕）：办公桌、标题、红章"大脑忘了"、泡泡里空着的账本、冒出来的馋虫 ================= */
function coverArt(g, t) {
  hookDesk(g, 2.6, true);
  g.save(); g.translate(250, 880); chanchong(g, 2.6, 0, 0, 9, { angry: true }); g.restore();
}
