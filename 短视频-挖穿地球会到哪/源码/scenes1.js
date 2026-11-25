'use strict';
/* scenes1.js：共用的小工具；开头（黄昏的院子里"你"在挖洞："从你家挖穿地球，会到哪？" → "当然是美国！" → 盖章"阿根廷"，
   洞里冒出一头奶牛 → 太空里看地球的剖面：美国小孩以为能挖到中国，结果是印度洋 → 北半球挖下去只能从南半球出来 →
   机场的翻牌子出发屏：北京、上海、广州 → 阿根廷，成都 → 太平洋 → 黑夜里的深洞："那要是真跳下去呢？"）；封面。
   前 20 秒切 4 次镜头：暖色院子 → 黑色太空 → 亮的机场 → 黑夜的洞。 */

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
  youHappy: portraitClawd({ scarf: true, eyes: 'happy', mouth: 'smile' }),
  youShock: portraitClawd({ scarf: true, eyes: 'wide', mouth: 'o' }),
  youFire: portraitClawd({ scarf: true, firesuit: true, eyes: 'happy' }),
};
/* 盖章，下面垫一块白底 */
function bigStamp(g, t, t0, x, y, s, o = {}) {
  if (t < t0) return;
  const p = clamp((t - t0) / .25), px = o.px || 84, w = pw(g, s, px) + px * 1.4, h = px * 2;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -.08); g.globalAlpha *= clamp(p * 3); g.fillStyle = 'rgba(255,255,255,.92)'; g.fillRect(-w / 2, -h / 2, w, h); g.restore();
  stamp(g, x, y, s, p, { px, rot: o.rot ?? -.08, col: o.col });
}
/* 放射的光芒 + 一圈火花（盖章、冒出头那一下） */
function sparkBurst(g, x, y, t, t0, o = {}) {
  const u = t - t0; if (u < 0 || u > .8) return;
  const n = o.n || 14, r0 = (o.r || 160) * E.out(clamp(u / .5));
  for (let i = 0; i < n; i++) {
    const a = i * TAU / n + t0, r = r0 * (.7 + .3 * hash(i, 3));
    g.fillStyle = `rgba(255,${200 + Math.round(hash(i, 5) * 55)},120,${1 - u / .8})`;
    g.fillRect(Math.round((x + Math.cos(a) * r) / 5) * 5, Math.round((y + Math.sin(a) * r) / 5) * 5, 10, 10);
  }
}
/* 大标题：两行，按整像素上下跳，不缩放、不转（像素字一缩放、一转，描边就碎了） */
function titleBlock(g, t, y0 = 250) {
  const bob = Math.round(Math.sin(t * 4)) * 6;
  g.save(); g.translate(480, y0 + bob);
  ptext(g, '从你家往下挖', 0, 24, 72, C.white, { align: 'center', ol: C.ink, olw: 6, sh: 1 });
  ptext(g, '挖穿地球会到哪？', 0, 150, 96, C.amber, { align: 'center', ol: C.ink, olw: 8, sh: 1 });
  g.restore();
}

/* ================= 开头 ================= */
function hook(g, t) {
  if (window.COVER) { coverArt(g, t); return; }
  if (t < S('h3') - .12) { hookYard(g, t); return; }
  if (t < S('h4') - .12) { hookUS(g, t); return; }
  if (t < CH('h4', 2) - .2) { hookHemi(g, t); return; }
  if (t < S('h5') - .12) { hookBoard(g, t); return; }
  hookHole(g, t);
}
/* 院子里挖洞的"你"：(cx, by) 脚底；dig 在挖（铲子一上一下）；返回洞口位置 */
function digger(g, t, cx, by, k, o = {}) {
  const ph = Math.floor(t * 3) % 2, digging = o.dig !== false;
  shadowAt(g, cx, by, k);
  crabAt(g, cx, by, k, youO(t, Object.assign({ arms: digging ? (ph ? 'upR' : 'n') : 'n' }, o.you || {})));
  if (o.shovel !== false) {
    const [hx, hy] = crabPt(cx, by, k, 23, digging && ph ? 0 : 5);
    shovel(g, hx, hy, digging ? (ph ? -.5 : .35) : .2, 5);
  }
}
/* 1. 黄昏的院子："你"在挖洞，土一铲铲飞出去；想到美国；盖章"阿根廷"，洞里冒出一头奶牛 */
function hookYard(g, t, cover = false) {
  const b = pbuf('yard', 216, 384);
  yardBG(b, t, 0);
  blit(g, 'yard', 5);
  glow(g, 800, 840, 520, 'rgba(255,190,120,.35)');                       // 夕阳的光
  const k = 10, cx = 300, by = 1240, hx = 640, hyy = 1215;
  const ts = S('h2') - .2;
  const depth = cover ? 1 : clamp(t / Math.max(1, ts));
  yardHole(g, hx, hyy, 300, depth, t);
  // 土一铲铲飞出去（每次铲子扬起来那一下）
  for (let i = 0; i < 8; i++) dirtBurst(g, hx - 60, hyy - 30, t, i * .66 + .1, 8);
  // 奶牛从洞里冒出头（盖章以后）：伏笔——阿根廷的大草原
  if (t > ts + .25 || cover) {
    const u = cover ? 1 : E.back(clamp((t - ts - .25) / .4));
    g.save(); g.beginPath(); g.rect(hx - 160, hyy - 220, 320, 220 + 8); g.clip();
    g.save(); g.imageSmoothingEnabled = false; g.drawImage(COW(), Math.round(hx - 110), Math.round(hyy + 10 - u * 120), 220, 120); g.restore();
    g.restore();
    if (!cover && t > EN('h2')) popText(g, t, EN('h2'), SE('hook') + 1, '哞～', hx + 150, hyy - 170, 48, '#FFFFFF', { olw: 5 });   // 和 audio.py 的"哞"同时
  }
  digger(g, t, cx, by, k, { dig: !cover && t < S('d1'), you: t > ts ? { eyes: 'wide', mouth: 'o' } : t > S('d1') ? { eyes: 'happy', mouth: 'smile' } : {} });
  titleBlock(g, t);
  // 想法气泡：说"美国"时冒出来——一排高楼
  const pb = pop(t, S('d1') - .05, .3) * (t > ts ? clamp((ts + .4 - t) / .3) : 1);
  if (pb > 0 && !cover) {
    g.save(); g.translate(700, 620); g.scale(pb, pb);
    pixOval(g, 0, 0, 186, 106, 6, C.ink); pixOval(g, 0, 0, 176, 96, 6, '#FFFFFF');
    for (let i = 0; i < 7; i++) { const h = 50 + (i * 37 % 60); g.fillStyle = '#6E9BD6'; g.fillRect(-140 + i * 40, 40 - h, 32, h); g.fillStyle = '#FFE9A8'; for (let y = 46 - h; y < 34; y += 14) g.fillRect(-132 + i * 40, y, 8, 6); }
    ptext(g, '美国？', 0, -36, 40, C.ink, { align: 'center' });
    g.restore();
  }
  if (!cover) {
    sparkBurst(g, 480, 600, t, ts, { r: 260 });
    bigStamp(g, t, ts, 480, 600, '阿根廷', { px: 96 });
    dialogBox(g, t, 'd1', PORTRAIT.youHappy);
  }
}
/* 2. 太空：地球的剖面，美国小孩从左上往下挖，一条线穿过地心，出口在印度洋（扑通一声，鱼跳出来） */
function hookUS(g, t) {
  spaceBG(g, t);
  const cx = 480, cy = 880, R = 380, a = -.75, t0 = S('h3') - .12;
  earthCut(g, cx, cy, R, t);
  const u = clamp((t - CH('h3', 1)) / Math.max(.5, EN('h3') - .1 - CH('h3', 1)));   // 这句念完正好挖穿，扑通（audio.py）
  const [x0, y0, x1, y1] = throughLine(g, cx, cy, R, a, u, '#9FD3FF');
  // 美国小孩（蓝色、戴棒球帽）站在出发点
  crabAt(g, x0 - 40, y0 - 10, 6, { col: TONES.blue, hat: 'cap', eyes: u > .95 ? 'wide' : 'happy', arms: 'upR' });
  placeTag(g, x0 - 40, y0 - 120, '美国小孩', '#9FD3FF', { px: 32 });
  popTag(g, t, t0 + .1, 480, 250, '美国小孩：挖到中国？', 40, { fill: C.gold });
  if (u >= 1) {
    // 出口：印度洋，扑通
    const tw = t - EN('h3') + .1;
    for (let i = 0; i < 12; i++) { const v = clamp(tw / .6), ang = -Math.PI / 2 + (i - 5.5) * .18; g.fillStyle = `rgba(160,220,255,${1 - v})`; g.fillRect(Math.round(x1 + Math.cos(ang) * 120 * v), Math.round(y1 + 40 + Math.sin(ang) * 120 * v + 200 * v * v), 10, 10); }
    popTag(g, t, CH('h3', 2) - .2, x1 - 60, y1 + 110, '印度洋', 48, { fill: '#5EC8FF' });
    const fu = (t * .8) % 1; if (fu < .5) { const fx = x1 - 160 + fu * 220, fy = y1 + 30 - Math.sin(fu / .5 * Math.PI) * 120; g.fillStyle = '#FFB547'; g.fillRect(Math.round(fx), Math.round(fy), 30, 15); g.fillRect(Math.round(fx) - 10, Math.round(fy) - 5, 10, 25); }
  }
}
/* 3. 太空：赤道一划，上半是北半球、下半是南半球；北京往下一条线穿过地心，从南半球的阿根廷出来 */
function hookHemi(g, t) {
  spaceBG(g, t);
  const cx = 480, cy = 900, R = 400, t0 = S('h4') - .12;
  earthCut(g, cx, cy, R, t, { equator: true });
  popTag(g, t, t0 + .1, 250, 640, '北半球', 40, { fill: '#FFE9A8' });
  popTag(g, t, CH('h4', 1) - .2, 710, 1160, '南半球', 40, { fill: '#B8F0C8' });
  const u = clamp((t - t0 - .3) / 1.6), a = .12;
  const [x0, y0, x1, y1] = throughLine(g, cx, cy, R, a, u, '#FFD34E');
  crabAt(g, x0, y0 - 6, 6, youO(t, { arms: 'upR', eyes: 'happy' }));
  placeTag(g, x0 + 110, y0 - 40, '你家', C.gold, { px: 32 });
  if (u >= 1) { sparkBurst(g, x1, y1, t, t0 + 1.9, { r: 120 }); popTag(g, t, t0 + 1.9, x1 - 200, y1 - 64, '出口在这', 32, { fill: '#B8F0C8' }); }   // 放在出口左上：放下面会被字幕挡住
}
/* 4. 机场大厅：翻牌子的出发屏，"出发 → 到达"一行行翻出来；外面飞机起飞；"你"拖着行李箱 */
function hookBoard(g, t) {
  airportBG(g, t);
  const t0 = CH('h4', 2) - .2;
  // 出发屏
  const bx = 90, by = 280, bw = 780;
  g.fillStyle = '#0B0D14'; g.fillRect(bx - 16, by - 16, bw + 32, 600);
  g.fillStyle = '#1E2230'; g.fillRect(bx - 16, by - 16, bw + 32, 70);
  ptext(g, '出发', bx + 20, by + 34, 40, '#C9CED8'); ptext(g, '往下挖到', bx + 400, by + 34, 40, '#C9CED8');
  const rows = [['北京', '阿根廷', CH('h4', 2) - .2], ['上海', '阿根廷', CH('h4', 2) + .15], ['广州', '阿根廷', CH('h4', 2) + .5], ['成都', '太平洋', CH('h4', 4) - .2]];
  rows.forEach(([a, b, ts], i) => {
    const y = by + 80 + i * 120;
    flapText(g, bx + 10, y, a, t, ts);
    ptext(g, '→', bx + 300, y + 60, 48, '#FFD34E');
    flapText(g, bx + 390, y, b, t, ts + .25, { col: b === '太平洋' ? '#5EC8FF' : '#FFD34E' });
  });
  // "你"拖着行李箱看出发屏
  const k = 10, cx = 300 + Math.min(1, (t - t0) / 2) * 60, fy = 1240;
  shadowAt(g, cx, fy, k);
  crabAt(g, cx, fy, k, youO(t, { eyes: 'up', legs: t - t0 < 2 ? walkLegs(t, 8) : 0 }));
  g.fillStyle = C.ink; g.fillRect(cx + 140, fy - 150, 100, 150); g.fillStyle = '#E5322D'; g.fillRect(cx + 146, fy - 144, 88, 138); g.fillStyle = '#A81E1A'; g.fillRect(cx + 146, fy - 100, 88, 10); g.fillStyle = '#5A6378'; g.fillRect(cx + 180, fy - 200, 8, 56); g.fillRect(cx + 160, fy - 204, 50, 8);
  // 路过的旅客
  for (let i = 0; i < 3; i++) { const px = ((t * 90 + i * 380) % 1300) - 100; crabAt(g, px, 1220 + i * 6, 5, person(i + 2, { legs: walkLegs(t + i, 8) }), true); }
}
/* 5. 黑夜里的深洞：一圈圈往下，底下透着红光；"你"趴在洞边往下看 */
function hookHole(g, t) {
  deepHole(g, t);
  const k = 10, cx = 300, by = 520;
  crabAt(g, cx, by, k, youO(t, { eyes: 'dn', mouth: 'o', sweat: true }));
  shovel(g, cx + 150, by - 120, .3, 5);
  const pq = pop(t, CH('h5', 1) - .2, .35);
  if (pq > 0) { g.save(); g.translate(760, 380); g.scale(pq, pq); ptext(g, '？', 0, 60, 168, C.gold, { align: 'center', ol: C.ink, olw: 10 }); g.restore(); }
  popTag(g, t, S('h5') - .05, 480, 250, '那要是真跳下去……', 44, { fill: C.gold });
}
/* 封面：院子 + 挖好的洞里冒出奶牛 + 大标题 + 红章"阿根廷" */
/* 封面下半截（只在封面上画）：地面的剖面，一层层的土石越往下越红；洞正下方的竖井一直通下去，井底透着地心的光；
   土里埋着水管、骨头、化石、蚯蚓。下半截原来只有草地，空了三分之一 */
function coverCut(g) {
  const top = 1330, hx = 640, sw = 130, x0 = hx - sw / 2;
  const bands = ['#6B4630', '#5E3D2A', '#6A5A50', '#5A4A44', '#7A3A2A', '#A8452A', '#D2622A'];
  const bh = Math.ceil((H - top) / bands.length / 5) * 5;
  bands.forEach((c, i) => {
    const y0 = top + i * bh;
    g.fillStyle = c; g.fillRect(0, y0, W, bh + 5);
    if (i > 0) for (let x = 0; x < W; x += 5) { g.fillStyle = bands[i - 1]; g.fillRect(x, y0, 5, Math.round(hash(x, i) * 3) * 5); }   // 层和层的边参差不齐
    for (let j = 0; j < 26; j++) { g.fillStyle = shadeOf(c, 1.18); g.fillRect(Math.round(hash(i * 7, j) * W / 5) * 5, y0 + 10 + Math.round(hash(j, i * 3) * (bh - 25) / 5) * 5, 15, 5); }   // 小石子
  });
  // 越往下越热
  const hot = g.createLinearGradient(0, top + 200, 0, H);
  hot.addColorStop(0, 'rgba(255,120,40,0)'); hot.addColorStop(1, 'rgba(255,170,60,.5)');
  g.fillStyle = hot; g.fillRect(0, top + 200, W, H - top - 200);
  // 草皮的边
  g.fillStyle = '#3F7F2E'; g.fillRect(0, top - 10, W, 15);
  for (let x = 0; x < W; x += 5) g.fillRect(x, top + 5, 5, Math.round(hash(x, 99) * 2) * 5);
  // 水管（被竖井截断）
  g.fillStyle = '#8E98A8'; g.fillRect(0, 1445, x0, 30); g.fillStyle = '#6E7888'; g.fillRect(0, 1470, x0, 5);
  for (let x = 60; x < x0 - 20; x += 140) { g.fillStyle = '#5E6878'; g.fillRect(x, 1435, 20, 50); }
  // 骨头
  g.fillStyle = '#F2EBDD'; g.fillRect(150, 1545, 90, 15); g.fillRect(140, 1535, 15, 15); g.fillRect(140, 1555, 15, 15); g.fillRect(235, 1535, 15, 15); g.fillRect(235, 1555, 15, 15);
  // 化石（一圈圈的菊石）
  pixOval(g, 330, 1720, 45, 45, 5, '#B8A98E'); pixOval(g, 333, 1720, 32, 32, 5, '#8F7F66'); pixOval(g, 336, 1720, 24, 24, 5, '#B8A98E'); pixOval(g, 339, 1720, 12, 12, 5, '#8F7F66');
  // 蚯蚓
  for (let i = 0; i < 9; i++) { g.fillStyle = i === 8 ? '#C9667A' : '#E58FA0'; g.fillRect(840 + i * 10, 1400 + Math.round(Math.sin(i * .9)) * 10, 10, 10); }
  // 竖井：洞的正下方一直通下去，井壁深一点
  g.fillStyle = '#140A08'; g.fillRect(x0, top - 10, sw, H - top + 10);
  g.fillStyle = '#2E1A12'; g.fillRect(x0, top - 10, 10, H - top + 10); g.fillRect(x0 + sw - 10, top - 10, 10, H - top + 10);
  glow(g, hx, H - 30, 300, 'rgba(255,190,90,.8)');
  // 井里往下掉的土块、井底往上飘的火星
  [[610, 1400], [665, 1480], [630, 1590], [655, 1660]].forEach(([x, y]) => { g.fillStyle = '#7A5236'; g.fillRect(x, y, 15, 15); });
  [[600, 1800], [680, 1760], [640, 1720], [700, 1850], [585, 1700]].forEach(([x, y], i) => { g.fillStyle = i % 2 ? '#FFD34E' : '#FF8A3D'; g.fillRect(x, y, 10, 10); });
}
function coverArt(g, t) {
  hookYard(g, 3.0, true);
  coverCut(g);
  sparkBurst(g, 480, 640, 1.2, 1.0, { r: 280 });
  bigStamp(g, 1, 0, 480, 640, '阿根廷', { px: 108 });
}
