'use strict';
/* scenes2.js：别报整的（eBay 上 1050 万件能砍价的商品：标价是整百的最后卖得便宜 5%~8%，但卖得更快 →
   两张会说话的价签："5000：我急着卖，多少都行"、"4870：这个价有讲究" → "那我挂 5000 的吉他……"→ 换成 4870，还价就不敢砍太狠）。 */

function ebay(g, t) {
  if (t < S('n2') - .12) { ebayData(g, t); return; }
  if (t < S('d2') - .1) { ebayTags(g, t); return; }
  ebayPhone(g, t);
}
/* 网页上一格格商品（价签有整百的、有带零头的）→ 柱子：整百的便宜 5%~8%，时钟：卖得更快 */
function ebayData(g, t) {
  g.fillStyle = '#F4F1EA'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#E8E2D8'; for (let y = 0; y < H; y += 40) g.fillRect(0, y, W, 2);
  // 浏览器窗口
  pbox(g, 60, 220, 840, 980, { k: 6, fill: '#FFFFFF' });
  g.fillStyle = '#2B2547'; g.fillRect(66, 226, 828, 60); ptext(g, 'eBay · 可以砍价的商品', 96, 268, 32, '#FFFFFF');
  [0, 1, 2].forEach(i => { g.fillStyle = ['#FF5A4F', '#FFD34E', '#5BE37D'][i]; g.fillRect(820 + i * 22, 246, 14, 14); });
  const items = ['vase', 'coin', 'stamp', 'car', 'watch', 'card', 'lamp', 'doll', 'cam'];
  const prices = ['$100', '$97', '$200', '$213', '$300', '$289', '$100', '$104', '$400'];
  const scroll = (t * 30) % 60;
  for (let i = 0; i < 9; i++) {
    const cx = 100 + (i % 3) * 270, cy = 320 + Math.floor(i / 3) * 280 - Math.round(scroll / 5) * 5;
    g.fillStyle = '#F4F1EA'; g.fillRect(cx, cy, 240, 250); g.fillStyle = '#E2DCD0'; g.fillRect(cx + 20, cy + 20, 200, 150);
    const c = ['#5EC8FF', '#FFD34E', '#FF9DB5', '#9FE3B8', '#C9B8FF', '#FFB547', '#5EC8FF', '#FF9DB5', '#9FE3B8'][i];
    pixOval(g, cx + 120, cy + 95, 50, 50, 10, c); g.fillStyle = 'rgba(255,255,255,.6)'; g.fillRect(cx + 95, cy + 70, 20, 20);
    const round = prices[i].endsWith('00');
    g.fillStyle = round ? '#FFE3E0' : '#E0F6E6'; g.fillRect(cx + 20, cy + 186, 200, 48);
    ptext(g, prices[i], cx + 120, cy + 224, 40, round ? '#E5322D' : '#2E7A3C', { align: 'center' });
  }
  popTag(g, t, S('n1') - .05, 480, 1156, '1050 万件', 44, { fill: C.gold });   // 别压住下面的出处
  // 结果卡片：整百的便宜 5%~8%，但卖得更快
  if (t > CH('n1', 3) - .25) {
    const p = pop(t, CH('n1', 3) - .25, .35);
    g.save(); g.translate(480, 760); g.scale(p, p); g.translate(-480, -760);
    pbox(g, 100, 500, 760, 520, { k: 6, fill: 'rgba(27,23,48,.96)' });
    ptext(g, '最后卖出的价', 480, 570, 36, C.white, { align: 'center' });
    const u = E.out(clamp((t - CH('n1', 4) + .2) / .6));
    g.fillStyle = '#2E7A3C'; g.fillRect(230, 620, 500, 60); ptext(g, '带零头', 212, 664, 32, '#CFC6E8', { align: 'right' });
    g.fillStyle = '#E5322D'; g.fillRect(230, 720, Math.round(500 * (1 - .065 * u) / 6) * 6, 60); ptext(g, '整百', 212, 764, 32, '#CFC6E8', { align: 'right' });
    if (u > .9) ptext(g, '便宜 5%~8%', 696, 765, 36, C.gold, { align: 'right', ol: C.ink, olw: 5 });
    if (t > CH('n1', 6) - .25) {
      const q = pop(t, CH('n1', 6) - .25, .3);
      g.save(); g.translate(480, 900); g.scale(q, q);
      wallClock(g, -200, 0, 40, (t * 400) % 720);
      ptext(g, '不过卖得更快', 40, 14, 40, '#9FE3B8', { align: 'center' });
      g.restore();
    }
    g.restore();
  }
  source(g, '出处：Backus、Blake、Tadelis，2019，政治经济学杂志（eBay 数据）', 880, 1238, { col: '#7A7090' });
}
/* 两张会说话的价签 */
function ebayTags(g, t) {
  bgGrid(g, t, '#221B3A', 'rgba(255,200,120,.07)');
  starField(g, t, 30, 0, 200, W, 1000, 5, 8);
  const t0 = S('n2') - .12, cL = CH('n2', 1) - .2, cR = CH('n2', 3) - .2;
  const pL = pop(t, t0, .35), pR = pop(t, cR - .2, .35);
  const wob = Math.round(Math.sin(t * 9) * 2) * 3;
  if (pL > 0) { g.save(); g.translate(330, 580 + wob); g.scale(pL, pL); priceTag(g, t, 0, 0, '5000', 96, { face: 'sweat', col: '#FFD0C8' }); g.restore(); }
  if (pR > 0) { g.save(); g.translate(620, 1000); g.scale(pR, pR); priceTag(g, t, 0, 0, '4870', 96, { face: 'smart', col: '#C8F0D4' }); g.restore(); }
  if (t > cL) sayBubble(g, t, cL, 520, 340, '我急着卖，多少都行', 420, 440, { px: 40 });
  if (t > CH('n2', 4) - .2) sayBubble(g, t, CH('n2', 4) - .2, 440, 1220, '这个价有讲究', 560, 1130, { px: 40 });
  popTag(g, t, t0 + .1, 330, 800, '整数', 40, { fill: '#FF8A7A' });
  if (t > cR - .2) popTag(g, t, cR, 620, 780, '带零头', 40, { fill: '#9FE3B8' });
}
/* 家里：手机上挂着的二手吉他，5000 → 换成 4870；下面买家的还价从砍很多变成砍一点（示意） */
function ebayPhone(g, t) {
  const b = pbuf('home', 216, 384); homeBG(b, t); blit(g, 'home', 5);
  glow(g, 370, 260, 520, 'rgba(255,210,140,.3)');
  const tC = CH('n3', 1) - .2;
  crabAt(g, 230, 1250, 15, youO(t, t < S('n3') ? { eyes: 'wide', mouth: 'o' } : { eyes: 'squint', mouth: 'smile' }));
  const price = t < tC ? '5000' : '4870';
  const chats = t < tC ? [['4000 卖不卖？', clamp((t - S('d2') - .3) / .3)], ['3800 行吗？', clamp((t - S('d2') - .8) / .3)]]
    : [['4700 可以吗？', clamp((t - CH('n3', 2) + .1) / .3)], ['4800 我直接拍', clamp((t - CH('n3', 3) + .1) / .3)]];
  appListing(g, t, 440, 300, 440, price, chats);
  // 标签贴在价格右边，不盖住新价格 4870
  if (t > tC) { const p = pop(t, tC, .3); g.save(); g.translate(752, 732); g.scale(p, p); ptag(g, 0, 0, '改成带零头', 32, { fill: C.gold }); g.restore(); }
  // 出处分两行、右对齐在商品页下面，不压在小怪身上
  source(g, '出处：Mason 等，2013，实验社会心理学杂志', 880, 1196, { col: '#7A6A58' });
  source(g, '（1254 人模拟谈判；买家还价是示意）', 880, 1228, { col: '#7A6A58' });
  dialogBox(g, t, 'd2', PORTRAIT.youShock);
}
