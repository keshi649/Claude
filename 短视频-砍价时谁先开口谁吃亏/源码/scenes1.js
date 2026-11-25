'use strict';
/* scenes1.js：共用的小工具；开头（夜市的旧货摊，"你"看上一把吉他，摊主问"你先说个价？"："砍价时，谁先开口谁吃亏？"→
   "对，让他先报！"→ 盖章"先开口赢" → 会议室里两两谈买卖：买家先报，成交价偏向买家；卖家先报，偏向卖家 →
   傍晚的海：第一个数像扔下去的锚，价格小船怎么砍都绕着它转 → "还有个细节：这个数，别报整的"）；封面。
   前 20 秒切 3 次镜头：夜市 → 亮的会议室 → 晚霞的海 → 深色的价签。 */

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
function source(g, s, x, y, o = {}) { ptext(g, s, x, y, o.px || 22, o.col || '#8A80B0', { align: o.align || 'right' }); }
const PORTRAIT = {
  you: portraitClawd({ scarf: true }),
  youSly: portraitClawd({ scarf: true, eyes: 'squint', mouth: 'smile' }),
  youShock: portraitClawd({ scarf: true, eyes: 'wide', mouth: 'o' }),
  youHappy: portraitClawd({ scarf: true, eyes: 'happy', mouth: 'smile' }),
};
const SELLER = { col: TONES.yellow, hat: 'straw' };
/* 盖章，下面垫一块白底 */
function bigStamp(g, t, t0, x, y, s, o = {}) {
  if (t < t0) return;
  const p = clamp((t - t0) / .25), px = o.px || 84, w = pw(g, s, px) + px * 1.4, h = px * 2;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -.08); g.globalAlpha *= clamp(p * 3); g.fillStyle = 'rgba(255,255,255,.92)'; g.fillRect(-w / 2, -h / 2, w, h); g.restore();
  stamp(g, x, y, s, p, { px, rot: o.rot ?? -.08, col: o.col });
}
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
  ptext(g, '砍价时', 0, 24, 72, C.white, { align: 'center', ol: C.ink, olw: 6, sh: 1 });
  ptext(g, '谁先开口谁吃亏？', 0, 150, 96, C.amber, { align: 'center', ol: C.ink, olw: 8, sh: 1 });
  g.restore();
}
/* 说话的气泡（白底黑边，尾巴指向 (tx, ty)） */
function sayBubble(g, t, t0, x, y, s, tx, ty, o = {}) {
  const p = pop(t, t0, .3) * (o.t1 ? clamp((o.t1 - t) / .2) : 1); if (p <= 0) return;
  const px = o.px || 44, w = pw(g, s, px) + 60, h = px + 50;
  g.save(); g.translate(x, y); g.scale(p, p);
  g.fillStyle = C.ink; g.beginPath(); g.moveTo(-20, h / 2 - 4); g.lineTo(tx - x, ty - y); g.lineTo(20, h / 2 - 4); g.fill();
  pbox(g, -w / 2, -h / 2, w, h, { k: 5, fill: o.fill || '#FFFFFF', shadow: false });
  ptext(g, s, 0, px * .36, px, o.col || C.ink, { align: 'center' });
  g.restore();
}
/* 夜市旧货摊：背景、彩灯、来回走的人、烟；"你"（左）、摊主（右，桌子后面）、靠在桌前的吉他 */
function marketScene(g, t, o = {}) {
  const b = pbuf('market', 216, 384); marketBG(b, t); blit(g, 'market', 5);
  stringLights(g, t, -20, 470, 1100, 450, 70, 12, 0);
  steam(g, t, 110, 1000);
  crowd(g, t, 1035, 5);
  // 摊位：桌子挡住摊主下半身
  crabAt(g, 740, 1180, 15, Object.assign({}, SELLER, { eyes: blinkEyes(t, 7) }, o.seller || {}), true);
  g.fillStyle = '#8A5A35'; g.fillRect(560, 1080, 380, 30); g.fillStyle = '#A0703E'; g.fillRect(560, 1080, 380, 8); g.fillStyle = '#6E4A2E'; g.fillRect(560, 1110, 380, 160);
  g.fillStyle = '#E5322D'; g.fillRect(580, 1130, 340, 40); ptext(g, '旧货', 750, 1162, 32, '#FFFFFF', { align: 'center' });
  guitar(g, 500, 820, 5);
  if (o.tag) priceTag(g, t, 600, 860, o.tag, 40, { col: o.tagCol, rot: -.08 });
  shadowAt(g, 260, 1250, 15);
  crabAt(g, 260, 1250, 15, youO(t, o.you || {}));
}

/* ================= 开头 ================= */
function hook(g, t) {
  if (window.COVER) { coverArt(g, t); return; }
  if (t < S('h3') - .12) { hookMarket(g, t); return; }
  if (t < S('h4') - .12) { hookLab(g, t); return; }
  if (t < S('h5') - .12) { hookAnchor(g, t); return; }
  hookTeaser(g, t);
}
/* 1. 夜市：摊主"你先说个价？"；"对，让他先报！"；盖章"先开口赢" */
function hookMarket(g, t) {
  const ts = S('h2') - .35;   // 和 audio.py 的盖章声同时：0.3 秒的盖章声整个落在对话框里，不压"错"字
  marketScene(g, t, { tag: '？', you: t > ts ? { eyes: 'wide', mouth: 'o' } : { eyes: 'squint', mouth: 'smile' } });
  titleBlock(g, t);
  sayBubble(g, t, .2, 740, 690, '你先说个价？', 760, 940, { px: 40, t1: S('d1') + .2 });
  dialogBox(g, t, 'd1', PORTRAIT.youSly);
  if (t > ts) { sparkBurst(g, 450, 640, t, ts, { r: 270 }); bigStamp(g, t, ts, 450, 640, '先开口赢', { px: 84 }); }
}
/* 2. 会议室：两两谈买卖；买家先报，成交价偏向买家；卖家先报，偏向卖家 */
function hookLab(g, t) {
  g.fillStyle = '#EDE6F4'; g.fillRect(0, 0, W, H); g.fillStyle = '#E2D8EE'; for (let x = 0; x < W; x += 90) g.fillRect(x, 0, 6, 1100);
  g.fillStyle = '#C9D3DE'; g.fillRect(0, 1100, W, 820); g.fillStyle = '#BCC6D2'; for (let y = 1110; y < H; y += 40) g.fillRect(0, y, W, 4);
  // 窗和白板
  g.fillStyle = '#2B2547'; g.fillRect(660, 220, 240, 180); g.fillStyle = '#9FD3F5'; g.fillRect(670, 230, 220, 160); g.fillStyle = '#FFFFFF'; g.fillRect(670 + ((t * 20) % 220), 260, 50, 14);
  const c1 = CH('h3', 1), c2 = CH('h3', 2);
  const buyerFirst = t < c2 - .1, round = t < c2 - .1 ? 0 : 1;
  crabAt(g, 250, 1160, 15, person(0, { hat: undefined, eyes: blinkEyes(t, 2), mouth: (round === 0 && t > c1 - .2 && t < c1 + 1) ? 'o' : 'flat' }));
  crabAt(g, 730, 1160, 15, Object.assign({}, SELLER, { eyes: blinkEyes(t, 5), mouth: (round === 1 && t < c2 + 1) ? 'o' : 'flat' }), true);
  g.fillStyle = '#8A5A35'; g.fillRect(60, 1060, 840, 30); g.fillStyle = '#A0703E'; g.fillRect(60, 1060, 840, 8); g.fillStyle = '#6E4A2E'; g.fillRect(100, 1090, 40, 200); g.fillRect(820, 1090, 40, 200);
  popTag(g, t, S('h3') - .05, 250, 860, '买家', 40, { fill: '#B8E6FF' }); popTag(g, t, S('h3') + .05, 730, 860, '卖家', 40, { fill: C.gold });
  if (t > c1 - .2 && round === 0) sayBubble(g, t, c1 - .2, 330, 760, '我先报价！', 300, 880, { px: 40 });
  if (t > c2 - .1) sayBubble(g, t, c2 - .1, 650, 760, '我先报价！', 690, 880, { px: 40 });
  // 价格条
  const by = 560, x0 = 140, x1 = 820;
  pbox(g, 100, 470, 760, 170, { k: 6, fill: '#FFFFFF' });
  g.fillStyle = '#C9D3DE'; g.fillRect(x0, by, x1 - x0, 16);
  ptext(g, '便宜', x0, by - 30, 30, '#2F7FC1'); ptext(g, '贵', x1, by - 30, 30, '#E5322D', { align: 'right' });
  if (t > c1 - .2) {
    const u0 = E.out(clamp((t - c1) / .8)), u1 = E.out(clamp((t - c2) / .8));
    const v = round === 0 ? lerp(.5, .3, u0) : lerp(.5, .7, u1);
    const mx = lerp(x0, x1, v);
    g.fillStyle = round === 0 ? '#2F7FC1' : '#E5322D'; g.fillRect(Math.round(mx) - 10, by - 10, 20, 36);
    ptext(g, '成交价', mx, by + 62, 28, C.ink, { align: 'center' });
  }
  popTag(g, t, CH('h3', 3) - .2, 480, 400, '谁先报价，就偏向谁', 40, { fill: C.gold });
  source(g, '出处：Galinsky、Mussweiler，2001，人格与社会心理学杂志', 880, 1238, { col: '#6A6090' });
}
/* 3. 傍晚的海：第一个数像扔下去的锚，价格小船绕着它转 */
function hookAnchor(g, t) {
  const b = pbuf('sea', 216, 384); seaBG(b, t); blit(g, 'sea', 5);
  glow(g, 800, 750, 300, 'rgba(255,220,160,.3)');
  const tDrop = CH('h4', 1) - .25, ax = 480, ay = 1120;
  const drop = clamp((t - tDrop) / .7), aY = lerp(900, ay, E.in(drop));
  const ph = Math.max(0, t - tDrop - .7), bx = ax + Math.sin(ph * 1.6) * 200 * clamp(ph / .5), byy = 880 + Math.cos(ph * 1.6) * 30;
  if (t > tDrop) { g.strokeStyle = '#E8DCC0'; g.lineWidth = 6; g.beginPath(); g.moveTo(bx, byy + 20); g.quadraticCurveTo((bx + ax) / 2, (byy + aY) / 2 + 60, ax, aY); g.stroke(); anchorIcon(g, ax, aY, 6, drop >= 1 ? '第一个数' : ''); }
  boat(g, t, t > tDrop ? bx : 480 + Math.sin(t) * 20, t > tDrop ? byy : 880, '成交价');
  if (t > CH('h4', 2) - .2) {
    const k = Math.floor((t - CH('h4', 2) + .2) * 2.5) % 2;
    popText(g, t, CH('h4', 2) - .2, 1e9, '砍！', k ? 200 : 760, 700, 60, '#FF5A4F', { olw: 6 });
  }
  popTag(g, t, S('h4') - .05, 480, 470, '锚', 48, { fill: C.gold });
}
/* 4. "这个数，别报整的"：一张大价签"5000"，被划掉 */
function hookTeaser(g, t) {
  bgGrid(g, t, '#221B3A', 'rgba(255,200,120,.07)');
  starField(g, t, 40, 0, 200, W, 1100, 5, 6);
  const t0 = S('h5') - .12;
  const p = pop(t, t0, .35);
  g.save(); g.translate(480, 760); g.scale(p, p); priceTag(g, t, 0, 0, '5000', 96, { rot: -.05 }); g.restore();
  if (t > CH('h5', 2) - .2) {
    const u = clamp((t - CH('h5', 2) + .2) / .3);
    g.strokeStyle = '#FF4B3E'; g.lineWidth = 22; g.lineCap = 'square';
    g.beginPath(); g.moveTo(300, 640); g.lineTo(300 + 360 * u, 640 + 240 * u); g.stroke();
    if (u > .5) { g.beginPath(); g.moveTo(660, 640); g.lineTo(660 - 360 * (u - .5) * 2, 640 + 240 * (u - .5) * 2); g.stroke(); }
    popTag(g, t, CH('h5', 2) - .1, 480, 1040, '别报整的', 48, { fill: '#FF8A7A' });
  }
}

/* ================= 封面（不带字幕，单独构图）：夜市旧货摊、标题、红章"先开口赢"、锚、价签 4870 ================= */
function coverArt(g, t) {
  const T = 1.6;
  marketScene(g, T, { tag: '4870', tagCol: '#9FE3B8', you: { eyes: 'squint', mouth: 'smile' }, seller: { eyes: 'wide', mouth: 'o' } });
  titleBlock(g, T);
  bigStamp(g, 1, 0, 440, 640, '先开口赢', { px: 84 });
  sayBubble(g, T, 0, 300, 900, '4870！', 280, 1000, { px: 60 });
}
