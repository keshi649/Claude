'use strict';
/* scenes1.js：共用的小工具和背景；开头（原始人 → 哈扎人 → 跟城里人比 → 配料表）；身体财务部。
   开头照第一集的路子：先替观众说出最常见的答案，马上盖章推翻，再拿证据、抛线索，前 20 秒换四次画面。 */

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
  ptext(g, s, 0, px * .35, px, col, { align: 'center', ol: o.ol || C.ink, olw: o.olw || px / 12 * 1.5, sh: 1 });
  g.restore();
}
function menuBG(g, t, tint = '#1E1A3A') {
  g.fillStyle = tint; g.fillRect(0, 0, W, H);
  g.fillStyle = 'rgba(255,255,255,.04)';
  for (let x = 0; x < W; x += 60) g.fillRect(x, 0, 2, H);
  for (let y = (t * 20) % 60; y < H; y += 60) g.fillRect(0, y, W, 2);
}
function savannaBG(w, h, hy, o = {}) {
  return cached(`savBG${w}x${h}x${hy}${o.baobab ? 'b' : ''}`, w, h, g => {
    pbands(g, 0, w, [[0, '#4FA9E8'], [Math.round(hy * .3), '#6CBDF2'], [Math.round(hy * .62), '#8FD0F7'], [Math.round(hy * .85), '#B5E2FA'], [hy - 4, '#D6F0FB'], [hy, '#D6F0FB']], 3);
    for (let x = 0; x < w; x++) {
      const h1 = 6 + Math.sin(x * .07) * 3 + Math.sin(x * .19 + 1) * 1.5, h2 = 3 + Math.sin(x * .11 + 2) * 2;
      prect(g, x, hy - h1, 1, h1, '#A9CFC0'); prect(g, x, hy + 1 - h2, 1, h2, '#8DBFA8');
    }
    pbands(g, 0, w, [[hy, '#E3C46A'], [hy + 18, '#D9B65C'], [hy + 42, '#CDA650'], [hy + 70, '#BF9746'], [h, '#BF9746']], 3);
    const r = R(5);
    for (let i = 0; i < w * 1.3; i++) { const x = r() * w, y = hy + 2 + r() * (h - hy); const c = r() < .5 ? '#B08A3A' : '#EBD283'; pdot(g, x, y, c); if (r() < .4) pdot(g, x, y - 1, c); }
    for (let i = 0; i < w * .25; i++) { const x = r() * w, y = hy + 10 + r() * (h - hy - 10); pline(g, x, y, x - 1, y - 3, '#9C7A30'); pline(g, x + 1, y, x + 2, y - 3, '#9C7A30'); pdot(g, x, y - 4, '#E8D08A'); }
    if (o.baobab) { drawBaobab(g, Math.round(w * .18), hy + 4, 1.1); drawBaobab(g, Math.round(w * .8), hy + 2, .8); }
    else { drawAcacia(g, Math.round(w * .13), hy + 5, .55); drawAcacia(g, Math.round(w * .84), hy + 3, .75); drawAcacia(g, Math.round(w * .55), hy + 1, .35); }
  });
}
function drawSavanna(g, t, w, h, hy, o = {}) {
  g.drawImage(savannaBG(w, h, hy, o), 0, 0);
  for (let i = 0; i < 3; i++) { const x = ((i * 53 + t * (2 + i)) % (w + 40)) - 20; drawCloud(g, x, hy * .35 + i * hy * .18, .6 + i * .15); }
  if (o.sun !== false) drawSun(g, o.sunX ?? w * .85, o.sunY ?? 16, 9, t, { spin: true });
}
function feetShadow(g, x, y, w = 20) { g.save(); g.globalAlpha = .22; prect(g, x + 12 - w / 2, y, w, 1, '#000'); prect(g, x + 12 - w / 2 + 2, y + 1, w - 4, 1, '#000'); g.restore(); }
/* 把一块像素缓冲按整数倍贴到屏幕的某个位置 */
function put(g, name, sx, sy, sw, sh, dx, dy, k) { g.save(); g.imageSmoothingEnabled = false; g.drawImage(BUF[name], sx, sy, sw, sh, dx, dy, sw * k, sh * k); g.restore(); }
/* 头像 */
const PORTRAIT = {
  you: portraitClawd({ scarf: true }),
  acc: portraitClawd({ hat: 'visor', glasses: true }),
  buyer: (g, cx, cy, t) => { const b = pbuf('pBuyer', 32, 30); drawBuyer(b, 4, 12, t, { arms: 'n' }); put(g, 'pBuyer', 0, 0, 32, 30, cx - 96, cy - 112, 6); },
  bell: (g, cx, cy, t) => { const b = pbuf('pBell', 30, 30); drawBell(b, 15, 20, t, { sleep: t < S('d4') + .6, ring: t > S('d4') + .6 }); put(g, 'pBell', 0, 0, 30, 30, cx - 90, cy - 96, 6); },
};

/* ================= 开头 ================= */
function hook(g, t) {
  if (window.COVER) { coverArt(g, t); return; }
  if (t < S('h3') - .12) { hookSavanna(g, t); return; }
  if (t < S('h4') - .12) { hookHadza(g, t); return; }
  if (t < S('h5') - .12) { hookCompare(g, t); return; }
  hookClue(g, t);
}
/* 1. 草原：原始人追羚羊；"你"跳进来说出最常见的答案，盖章推翻 */
function hookSavanna(g, t) {
  const b = pbuf('sav', 108, 192), hy = 92;
  drawSavanna(b, t, 108, 192, hy, { sunX: 90, sunY: 46 });
  const run = (t * 22) % 160 - 30;
  pspr(b, ANTELOPE(), run + 26, hy + 6, false);
  feetShadow(b, run, hy + 20); drawClawd(b, run, hy + 4, { hat: 'bone', eyes: 'n', arms: 'upR', legs: walkLegs(t, 12) });
  pline(b, run + 24, hy - 2, run + 32, hy + 6, '#8C6440');
  const yin = E.back(clamp((t - S('d1') + .3) / .4));
  if (yin > 0) { const yx = Math.round(lerp(120, 70, yin)); feetShadow(b, yx, hy + 28); drawYou(b, yx, hy + 12, t, { arms: 'upL' }); pspr(b, FOOD.tea(), yx - 9, hy + 9); }
  blit(g, 'sav', 10);
  const tp = 1 + .015 * Math.sin(t * 4);
  g.save(); g.translate(540, 230); g.scale(tp, tp); g.rotate(-.02);
  ptext(g, '原始人为什么', 0, -50, 96, C.white, { align: 'center', ol: C.ink, olw: 9, sh: 1 });
  ptext(g, '不胖？', 0, 130, 168, C.amber, { align: 'center', ol: C.ink, olw: 12, sh: 1 });
  g.restore();
  popTag(g, t, .5, 540, 1180, '原始人：天天打猎', 36, { fill: C.amber, t1: S('d1') });
  if (yin > 0) popTag(g, t, S('d1') + .1, 820, 1000, '你', 36, { fill: '#9FD3FF' });
  dialogBox(g, t, 'd1', PORTRAIT.you, { extra: S('h3') - EN('d1') - .3 });
  stamp(g, 800, 1420, '只对一小半', clamp((t - S('h2') + .05) / .25), { px: 60, rot: -.12 });
}
/* 2. 坦桑尼亚：哈扎男人一天走 11 公里 */
function hookHadza(g, t) {
  const b = pbuf('tz', 108, 192), hy = 92;
  const scroll = Math.floor((t - S('h3')) * 6) % 108;
  b.drawImage(savannaBG(108, 192, hy, { baobab: true }), -scroll, 0); b.drawImage(savannaBG(108, 192, hy, { baobab: true }), 108 - scroll, 0);
  drawSun(b, 90, 30, 9, t, { spin: true });
  feetShadow(b, 42, hy + 26); drawHadza(b, 42, hy + 10, t, { legs: walkLegs(t, 8) });
  blit(g, 'tz', 10);
  popTag(g, t, S('h3') + .05, 540, 260, '非洲 · 坦桑尼亚 · 哈扎人', 48, { fill: C.amber });
  popTag(g, t, CH('h3', 1), 540, 360, '今天还靠打猎采集过日子', 36, { fill: '#E8C08A' });
  const km = 11.4 * E.io(clamp((t - CH('h3', 1)) / (EN('h3') - CH('h3', 1) - .2)));
  const pp = pop(t, CH('h3', 1) + .2, .3);
  if (pp > 0) {
    g.save(); g.translate(540, 820); g.scale(pp, pp);
    pbox(g, -330, -100, 660, 200, { k: 6 });
    ptext(g, '男人今天走了', 0, -30, 36, '#CFC6E8', { align: 'center' });
    ptext(g, `${km.toFixed(1)} 公里`, 0, 60, 84, C.gold, { align: 'center' });
    g.restore();
    if (t > CH('h3', 2)) ptext(g, '（女人约 5.8 公里）', 540, 970, 30, C.white, { align: 'center', ol: 'rgba(0,0,0,.5)' });
  }
}
/* 3. 跟欧美城里人比：一天烧掉的热量差不多 */
function hookCompare(g, t) {
  const b = pbuf('cmp', 90, 160);
  // 左：草原上的哈扎人
  b.drawImage(savannaBG(108, 192, 60, { baobab: true }), -10, -30);
  feetShadow(b, 9, 70); drawHadza(b, 9, 54, t, { legs: walkLegs(t, 8) });
  // 右：城里的办公室
  pbands(b, 46, 44, [[0, '#E4EAF0'], [70, '#D9DEE6'], [160, '#C9D0DA']], 2);
  prect(b, 46, 0, 44, 160, 'rgba(0,0,0,0)');
  prect(b, 60, 14, 26, 22, '#5E6B8A'); prect(b, 61, 15, 24, 20, '#BFE6FF'); for (let i = 0; i < 3; i++) prect(b, 63 + i * 7, 26 - i * 3, 5, 9 + i * 3, '#A9CBE0');
  drawDesk(b, 52, 70); drawWorker(b, 52, 52, t, { arms: Math.floor(t * 3) % 2 ? 'n' : 'upR' });
  prect(b, 0, 70, 46, 90, '#C9A85E'); prect(b, 46, 70, 44, 90, '#C9D0DA');
  blit(g, 'cmp', 12);
  g.fillStyle = C.ink; for (let y = 0; y < 1270; y += 24) g.fillRect(534 + ((y / 24) % 2) * 6, y, 12, 24);
  ptag(g, 270, 200, '哈扎人：天天走路打猎', 36, { fill: C.amber });
  ptag(g, 810, 200, '欧美城里人', 36, { fill: '#C9D3DE' });
  // 一天烧掉的热量
  const ba = clamp((t - S('h4') - .3) / .3);
  if (ba > 0) withAlpha(g, ba, () => {
    pbox(g, 120, 900, 840, 340, { k: 6 });
    ptext(g, '一天烧掉的热量（按同样体型算）', 540, 960, 36, C.white, { align: 'center' });
    const grow = E.out(clamp((t - CH('h4', 1)) / 1.2));
    for (const [x, col] of [[330, C.amber], [750, '#9FD3FF']]) { g.fillStyle = '#3B3363'; g.fillRect(x - 150, 1000, 300, 70); g.fillStyle = col; g.fillRect(x - 150, 1000, Math.round(300 * grow / 6) * 6, 70); }
    ptext(g, '哈扎人', 330, 1120, 36, C.amber, { align: 'center' }); ptext(g, '城里人', 750, 1120, 36, '#9FD3FF', { align: 'center' });
    popText(g, t, CH('h4', 2), 99, '差不多！', 540, 1180, 72, C.gold);
  });
}
/* 4. 线索：你手里的零食——配料表 */
function hookClue(g, t) {
  const b = pbuf('clue', 78, 138), BX = 46, BY = 40;
  b.drawImage(streetBG2(78, 138, 88), 0, 0);
  feetShadow(b, 20, 88); drawYou(b, 20, 72, t, { arms: 'upR', eyes: t > CH('h5', 1) ? 'up' : undefined });
  const flip = clamp((t - CH('h5', 1) - .5) / .3);
  const back = flip > .5;
  const sq = Math.abs(Math.cos(flip * Math.PI));
  const bag = pbuf('bag', 24, 30); drawSnackBag(bag, 0, 0, { back });
  const bw = Math.max(2, Math.round(24 * sq));
  b.save(); b.imageSmoothingEnabled = false; b.drawImage(BUF.bag, 0, 0, 24, 30, BX + Math.round((24 - bw) / 2), BY, bw, 30); b.restore();
  blit(g, 'clue', 14);
  if (!back && sq > .6) ptext(g, '薯片', (BX + 12) * 14, (BY + 8) * 14, 48, C.white, { align: 'center', ol: '#B8231F', olw: 4 });
  // 线索：发光的圈
  if (t > CH('h5', 1) && t < S('h6') + .2) { const r = 260 + Math.sin(t * 8) * 14; g.strokeStyle = C.gold; g.lineWidth = 10; g.setLineDash([24, 14]); g.lineDashOffset = -t * 60; g.beginPath(); g.arc((BX + 12) * 14, (BY + 15) * 14, r, 0, TAU); g.stroke(); g.setLineDash([]); }
  if (t > S('h6') - .1) {
    const p = pop(t, S('h6') - .1, .35);
    g.save(); g.translate(540, 360); g.scale(p, p);
    pbox(g, -470, -190, 940, 380, { k: 6, fill: '#FFFDF6', rim: '#C9B48E' });
    ptext(g, '配料表', -420, -110, 60, '#B8231F');
    const ing = ['马铃薯、植物油、白砂糖、食用盐、', '麦芽糊精、食品添加剂（谷氨酸钠、', '5′-呈味核苷酸二钠、柠檬酸、', '二氧化硅、辣椒红）、食用香精……'];
    ing.forEach((s, i) => ptext(g, s, -420, -30 + i * 54, 36, C.ink));
    g.restore();
    popText(g, t, S('h6'), 99, '配料表', 540, 760, 132, C.amber, { rot: -.04 });
  }
}
/* 小街（"你"拿着零食的那个镜头） */
function streetBG2(w, h, gy) {
  return cached(`street2${w}x${h}x${gy}`, w, h, g => {
    pbands(g, 0, w, [[0, '#8ED0F7'], [40, '#A9DCF8'], [gy, '#C7E8F8']], 3);
    for (let x = -4; x < w; x += 15) { const hh = 26 + Math.floor(hash(x, 11) * 30), col = ['#E9C9D6', '#D6D8EE', '#F2DCC2', '#CFE3E0'][Math.floor(hash(x, 12) * 4)]; prect(g, x, gy - hh, 14, hh, col); for (let yy = gy - hh + 4; yy < gy - 6; yy += 6) for (let xx = x + 2; xx < x + 12; xx += 4) prect(g, xx, yy, 2, 3, '#FFFFFF'); }
    pbands(g, 0, w, [[gy, '#D9D2C6'], [h, '#C4BBAD']], 2);
    for (let y = gy + 6; y < h; y += 12) prect(g, 0, y, w, 1, '#B9AFA1');
  });
}
/* 封面：大标题 + 拿着奶茶的"你"和追羚羊的原始人 */
function coverArt(g, t) {
  const b = pbuf('cov', 90, 160), hy = 98;
  drawSavanna(b, t, 90, 160, hy, { sunX: 78, sunY: 13 });
  pspr(b, ANTELOPE(), 30, hy + 12);
  drawClawd(b, 6, hy + 10, { hat: 'bone', arms: 'upR', legs: 1 }); pline(b, 30, hy + 4, 38, hy + 12, '#8C6440');
  feetShadow(b, 54, hy + 44); drawYou(b, 54, hy + 28, t, { arms: 'upL', fat: true, eyes: 'happy' }); pspr(b, FOOD.tea(), 45, hy + 25); pspr(b, FOOD.chips(), 79, hy + 30);
  blit(g, 'cov', 12);
  g.save(); g.translate(540, 470); g.rotate(-.03);
  ptext(g, '原始人为什么', 0, -60, 120, C.white, { align: 'center', ol: C.ink, olw: 11, sh: 1 });
  ptext(g, '不胖？', 0, 190, 240, C.amber, { align: 'center', ol: C.ink, olw: 16, sh: 1 });
  g.restore();
  stamp(g, 760, 1000, '只对一小半', 1, { px: 60, rot: -.12 });
}

/* ================= 身体财务部 ================= */
function budget(g, t) {
  if (t < S('b2') - .15) { statsChina(g, t); return; }
  const b = pbuf('office', 108, 192), fy = 90;
  pbands(b, 0, 108, [[0, '#E9E3F2'], [fy, '#DCD4EA']], 2);
  for (let x = 0; x < 108; x += 12) prect(b, x, 0, 1, fy, '#E0D8EC');
  prect(b, 0, fy, 108, 192 - fy, '#B8A9D2'); for (let x = 0; x < 108; x += 12) prect(b, x, fy, 1, 192 - fy, '#A898C4');
  prect(b, 8, 14, 40, 12, '#3F5E8C'); prect(b, 9, 15, 38, 10, '#5E7FB0');
  drawDesk(b, 18, fy); drawAccountant(b, 22, fy - 28, t, { arms: t > MK('b3') ? 'up' : (Math.floor(t * 2) % 2 ? 'n' : 'upR'), eyes: t > MK('b3') ? 'squint' : undefined });
  // 小窗：在跑步机上的"你"
  const run = t > S('b3') - .2 && t < S('d2') + .4;
  if (run || t > S('b4') - .2) {
    prect(b, 60, 26, 42, 40, '#2B2547'); prect(b, 61, 27, 40, 38, '#CFE9E4');
    if (run) { drawTreadmill(b, 64, 63, t); drawYou(b, 67, 45, t, { legs: walkLegs(t, 12), arms: 'up' }); }
    else { drawScale(b, 68, 58); drawYou(b, 69, 42, t, { eyes: 'up' }); }
  }
  blit(g, 'office', 10);
  ptext(g, '财务部', 280, 210, 48, C.white, { align: 'center', sh: 1 });
  popTag(g, t, S('b2') + .1, 540, 120 + 0, '你身体里的公司', 36, { fill: '#C9D3DE' });
  // 今日能量预算：维持生命 / 消化 / 活动
  const ex = clamp((t - S('b3') - .3) / 1.2), save = clamp((t - MK('b3')) / .9);
  const base = 560 - 70 * save, dig = 90, act = 150 + 170 * ex;
  const x0 = 60, y0 = 1090;
  pbox(g, 40, 960, 1000, 300, { k: 6 });
  ptext(g, '今天的能量开销', 70, 1030, 36, C.white);
  const seg2 = (x, w, col, s) => { g.fillStyle = col; g.fillRect(x, y0, w, 90); if (w > 90) ptext(g, s, x + w / 2, y0 + 58, 30, C.ink, { align: 'center' }); };
  seg2(x0, base, '#9FD3FF', '维持生命'); seg2(x0 + base, dig, '#E8C08A', '消化'); seg2(x0 + base + dig, act, C.green, '运动');
  const total = base + dig + act;
  g.fillStyle = C.white; g.fillRect(x0 + total, y0 - 14, 6, 118);
  if (save > 0) { popTag(g, t, MK('b3') + .1, x0 + base / 2, y0 - 34, '别处省一点', 30, { fill: C.red, col: C.white }); }
  if (t > CH('b3', 2)) ptext(g, '总开销：涨不了多少', 540, y0 + 140, 36, C.gold, { align: 'center' });
  dialogBox(g, t, 'd2', PORTRAIT.acc, { y: 1270 });
  if (t > S('b4') - .1) {
    popTag(g, t, S('b4'), 760, 230, '只靠运动：秤上动得不多', 30, { fill: C.amber });
  }
}
const NX = x => x * 10, NY = y => y * 10;
/* 中国成年人：一半以上超重或肥胖 */
function statsChina(g, t) {
  menuBG(g, t, '#22304A');
  ptext(g, '中国成年人', 540, 330, 72, C.white, { align: 'center', sh: 1 });
  ptext(g, '《中国居民营养与慢性病状况报告（2020 年）》', 540, 400, 30, '#9C93C0', { align: 'center' });
  const fat = t > CH('b1', 2) - .1;
  for (let i = 0; i < 10; i++) {
    const c = pbuf('st' + (i < 5 && fat ? 1 : 0), 34, 30);
    if (i < 5 && fat) drawClawd(c, 5, 14, { fat: true, eyes: blinkEyes(t, i) }); else drawClawd(c, 5, 14, { eyes: blinkEyes(t, i) });
    const x = 100 + (i % 5) * 180, y = 520 + Math.floor(i / 5) * 230;
    if (i < 5 && fat) { g.fillStyle = 'rgba(255,90,79,.3)'; g.fillRect(x - 6, y - 6, 172, 172); }
    put(g, 'st' + (i < 5 && fat ? 1 : 0), 0, 0, 34, 30, x, y, 5);
  }
  if (fat) {
    const p = pop(t, CH('b1', 2), .35);
    g.save(); g.translate(540, 1080); g.scale(p, p);
    ptext(g, '超重 34.3% ＋ 肥胖 16.4%', 0, -30, 48, C.white, { align: 'center' });
    ptext(g, '一半以上', 0, 90, 108, C.red, { align: 'center', ol: C.ink, olw: 8, sh: 1 });
    g.restore();
  }
}
