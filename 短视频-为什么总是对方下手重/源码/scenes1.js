'use strict';
/* scenes1.js：共用的小工具；开头（客厅里"你"和"他"打闹，一下比一下重："为什么总是对方下手重？" → "他就是下手重啊！" →
   盖章"你还手更重" → 实验：两个人轮流按对方的手指，要求按得一样重 → 柱子一轮比一轮高，平均每轮重近四成 →
   两个人都以为"我是照着按的" → 线索：跟你挠自己不痒是同一个原因）；封面。
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
/* 头像 */
const PORTRAIT = {
  you: portraitClawd({ scarf: true }),
  youMad: portraitClawd({ scarf: true, eyes: 'angry', mouth: 'grit' }),
  youShock: portraitClawd({ scarf: true, eyes: 'wide', mouth: 'o' }),
  youHappy: portraitClawd({ scarf: true, eyes: 'happy', mouth: 'smile' }),
};
/* 盖章，下面垫一块白底（缩小也看得清） */
function bigStamp(g, t, t0, x, y, s, o = {}) {
  if (t < t0) return;
  const p = clamp((t - t0) / .25), px = o.px || 84, w = pw(g, s, px) + px * 1.4, h = px * 2;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -.08); g.globalAlpha *= clamp(p * 3); g.fillStyle = 'rgba(255,255,255,.92)'; g.fillRect(-w / 2, -h / 2, w, h); g.restore();
  stamp(g, x, y, s, p, { px, rot: o.rot ?? -.08, col: o.col });
}

/* ================= 打闹：一下比一下重 =================
   hits：[[接触时刻, 谁打（'you' / 'him'）, 力度, 用枕头]]。"你"在左边朝右，"他"在右边朝左。 */
function brawl(g, t, hits, o = {}) {
  const k = o.k || 12, yx = o.yx ?? 290, hx = o.hx ?? 690, by = o.by ?? 1180;
  // 最近一次出手
  let cur = null;
  for (const h of hits) if (t >= h[0] - .14) cur = h;
  const hitOn = who => cur && cur[1] === who && t < cur[0] + .3;
  const sk = who => { let dx = 0; for (const h of hits) if (h[1] !== who) { const s = shake(t, h[0], 4 + h[2] * 5, .4); dx += s[0]; } return dx; };
  const hurt = who => hits.some(h => h[1] !== who && t > h[0] && t < h[0] + .45);
  const face = (who, base) => o.face ? o.face(who, t) : hurt(who) ? { eyes: 'shut', mouth: 'o' } : base;
  const yxS = yx + sk('you'), hxS = hx + sk('him');
  shadowAt(g, yx, by, k); shadowAt(g, hx, by, k);
  crabAt(g, yxS, by, k, youO(t, face('you', o.youBase || { eyes: 'angry' })));
  crabAt(g, hxS, by, k, himO(t, face('him', o.himBase || { eyes: 'angry' })), true);
  // 出手：先往回缩一点，再伸出去，停一下，收回来
  if (cur && hitOn(cur[1])) {
    const [tc, who, f, pil] = cur, gap = (hxS - 12 * k - (yxS + 12 * k)) / k;
    const u = t < tc ? E.in(clamp((t - tc + .14) / .14)) : 1 - E.out(clamp((t - tc - .15) / .15));
    const reach = lerp(1, gap + 1, u);
    const [fx, fy] = who === 'you' ? reachArm(g, yxS, by, k, reach, C.clawd) : reachArm(g, hxS, by, k, reach, TONES.blue, true);
    if (pil) pillow(g, fx + (who === 'you' ? 3 : -3) * k, fy - 6 * k, k * .9, (who === 'you' ? 1 : -1) * lerp(-.9, .3, u));
  }
  // "啪"
  for (const [tc, who, f, pil] of hits) {
    const u = t - tc; if (u < 0 || u > .45) continue;
    const cx = who === 'you' ? hxS - 12 * k : yxS + 12 * k, cy = by - 11 * k - (pil ? 3 * k : 0);
    const r = (30 + f * 20) * E.out(clamp(u / .08)) * (1 - clamp((u - .3) / .15) * .5);
    withAlpha(g, clamp((.45 - u) / .12), () => burst(g, cx, cy, r, 6, { text: pil ? '砰' : '啪', rot: tc * 7 }));
    if (pil) feathers(g, cx, cy, t, tc, 12);
  }
  return { yx: yxS, hx: hxS, by, k };
}

/* ================= 开头 ================= */
function hook(g, t) {
  if (window.COVER) { coverArt(g, t); return; }
  if (t < S('h3') - .12) { hookFight(g, t); return; }
  if (t < S('h4') - .12) { hookLab(g, t); return; }
  if (t < S('h5') - .12) { hookChart(g, t); return; }
  if (t < S('h6') - .12) { hookBoth(g, t); return; }
  hookClue(g, t);
}
/* 大标题：上下轻轻跳，按整像素（6 px）跳，不缩放、不转——像素字一缩放、一转，描边就碎了 */
function titleBlock(g, t, y0 = 250) {
  const bob = Math.round(Math.sin(t * 4)) * 6;
  g.save(); g.translate(480, y0 + bob);
  ptext(g, '为什么总是', 0, 24, 72, C.white, { align: 'center', ol: C.ink, olw: 6, sh: 1 });      // 描边宽度取像素格的整数倍，不然边缘是碎的
  ptext(g, '对方下手重？', 0, 160, 120, C.amber, { align: 'center', ol: C.ink, olw: 10, sh: 1 });
  g.restore();
}
/* 1. 客厅："你"和"他"打闹，一下比一下重；"他就是下手重啊！"；盖章"你还手更重" */
function hookFight(g, t) {
  const b = pbuf('lv', 108, 192);
  livingBG(b, t);
  blit(g, 'lv', 10);
  // 第一下在旁白开口之前（有声音）；念问题时"你"回了一下（只有画面）；对话框的时候越打越重（对话框不配音，声音放在这里）
  const T = S('d1'), ts = S('h2') - .2;
  const hits = [[.06, 'him', 1], [(S('h1') + EN('h1')) / 2, 'you', 1.5], [T + .2, 'him', 2.2], [T + .55, 'you', 3.2, true]];
  brawl(g, t, hits, {
    face: (who, tt) => {
      if (hits.some(h => h[1] !== who && tt > h[0] && tt < h[0] + .4)) return { eyes: 'shut', mouth: 'o' };
      if (tt > ts) return who === 'you' ? { eyes: 'wide', mouth: 'o' } : { eyes: 'angry', mouth: 'grit' };
      if (tt > T) return who === 'you' ? { eyes: 'angry', mouth: 'grit', arms: 'upR' } : { eyes: 'angry' };
      return { eyes: 'angry', mouth: 'grit' };
    },
  });
  titleBlock(g, t);
  // 盖章以后：两根力度条，"你还手"的比"他打你"的长
  bigStamp(g, t, ts, 480, 560, '你还手更重', { px: 72 });
  const pb = E.out(clamp((t - ts - .35) / .3));
  if (pb > 0) withAlpha(g, pb, () => {
    pbox(g, 110, 700, 700, 220, { k: 6, fill: 'rgba(255,255,255,.95)', rim: '#F4E9D8' });
    [['他打你', 3, TONES.blue, 742], ['你还手', 5, '#FF8A3D', 832]].forEach(([s, n, col, y]) => {
      ptext(g, s, 150, y + 34, 36, C.ink);
      for (let i = 0; i < n; i++) { g.fillStyle = C.ink; g.fillRect(330 + i * 64, y - 6, 58, 50); g.fillStyle = col; g.fillRect(336 + i * 64, y, 46, 38); }
    });
  });
  dialogBox(g, t, 'd1', PORTRAIT.youMad);
}
/* 一次按压：A 按 B（i 为偶数）或 B 按 A；v 是这一下的力度 0..1 */
const PRESS = i => Math.min(1, .1 * Math.pow(1.38, i));
/* 放大的手指：横着的一根（被按的，指尖朝右）、竖着的一根（按下来的，指尖朝下） */
function fingerH(g, x0, y, len, col) {
  g.fillStyle = C.ink; g.fillRect(x0 - 6, y - 6, len + 6, 72); g.fillRect(x0 + len - 6, y, 18, 60);
  g.fillStyle = col; g.fillRect(x0, y, len, 60); g.fillRect(x0 + len, y + 6, 6, 48);
  g.fillStyle = shadeOf(col, .85); g.fillRect(x0, y + 48, len, 12);
  g.fillStyle = '#FFE9E0'; g.fillRect(x0 + len - 54, y + 6, 42, 18);                      // 指甲
  g.fillStyle = shadeOf(col, .8); for (const dx of [60, 150]) g.fillRect(x0 + dx, y + 12, 6, 30);   // 指节的纹
}
function fingerV(g, x, y0, len, col) {
  g.fillStyle = C.ink; g.fillRect(x - 6, y0, 72, len + 6); g.fillRect(x, y0 + len, 60, 18);
  g.fillStyle = col; g.fillRect(x, y0, 60, len); g.fillRect(x + 6, y0 + len, 48, 6);
  g.fillStyle = shadeOf(col, .85); g.fillRect(x + 48, y0, 12, len);
  g.fillStyle = shadeOf(col, .8); for (const dy of [40, 110]) g.fillRect(x + 12, y0 + dy, 30, 6);
}
/* 2. 深色实验室：两个志愿者轮流按对方的手指；中间放大看手指和力度表；规则"按得一样重" */
function hookLab(g, t) {
  bgGrid(g, t, '#141A33');
  const t0 = S('h3') - .12, tr = CH('h3', 1) - .2, period = .55;
  popTag(g, t, t0 + .05, 480, 250, '实验：两个人轮流按', 40, { fill: C.gold });
  // 第几下
  const i = t < tr ? -1 : Math.floor((t - tr) / period), ph = t < tr ? 0 : ((t - tr) % period) / period;
  const press = i >= 0 ? Math.sin(Math.PI * clamp(ph / .7)) : 0, aTurn = i % 2 === 0;
  const k = 10, ax = 220, bx = 740, by = 1180;
  g.fillStyle = '#232A4E'; g.fillRect(0, by + 4, W, 6);
  const hurtA = i >= 0 && !aTurn && press > .3, hurtB = i >= 0 && aTurn && press > .3;
  crabAt(g, ax, by, k, volO(0, t, hurtA ? { eyes: 'shut', mouth: 'o' } : { eyes: i >= 0 && aTurn && press > .3 ? 'angry' : 'n' }));
  crabAt(g, bx, by, k, volO(1, t, hurtB ? { eyes: 'shut', mouth: 'o' } : { eyes: i >= 0 && !aTurn && press > .3 ? 'angry' : 'n' }), true);
  // 中间的软垫；被按的人手放在垫子上，按的人手臂从上面压下来
  g.fillStyle = C.ink; g.fillRect(380, by - 52, 200, 30); g.fillStyle = '#5A4F96'; g.fillRect(386, by - 46, 188, 18);
  const restA = !aTurn || i < 0;            // A 的手放在垫子上（轮到 B 按）
  const lyUp = Math.round(lerp(1, 5, press));
  if (restA) { reachArm(g, ax, by, k, (470 - (ax + 12 * k)) / k, TONES.green, false, 9); if (i >= 0) reachArm(g, bx, by, k, ((bx - 12 * k) - 440) / k, TONES.yellow, true, 3 + lyUp); }
  else { reachArm(g, bx, by, k, ((bx - 12 * k) - 490) / k, TONES.yellow, true, 9); reachArm(g, ax, by, k, (520 - (ax + 12 * k)) / k, TONES.green, false, 3 + lyUp); }
  // 放大镜
  const pz = pop(t, t0 + .25, .35);
  if (pz > 0) {
    g.save(); g.translate(480, 650); g.scale(pz, pz);
    pbox(g, -380, -250, 760, 500, { k: 6, fill: '#232A4E' });
    ptext(g, '放大看手指', -350, -196, 28, '#8A93B8');
    const top = aTurn ? TONES.green : TONES.yellow, bot = aTurn ? TONES.yellow : TONES.green;
    const dy = Math.round(press * 36 / 6) * 6;
    g.fillStyle = '#5A4F96'; g.fillRect(-320, 116, 380, 40);                                   // 软垫
    fingerH(g, -330, 56, 330, i >= 0 ? bot : TONES.yellow);                                    // 被按的手指
    fingerV(g, -150, -200 + dy, 200, i >= 0 ? top : TONES.green);                             // 按下来的手指
    g.fillStyle = '#FF5A4F'; g.fillRect(-156, 2 + dy, 72, 12);                                 // 力度传感器
    if (press > .2) for (const x of [-210, -30]) pixArrow(g, x, -110, x, -30, 6, C.gold, 1);
    dialGauge(g, 220, -10, 120, i >= 0 ? PRESS(i) * press : 0, { label: '力度' });
    g.restore();
  }
  // 规则
  if (t > CH('h3', 2) - .25) {
    const p = pop(t, CH('h3', 2) - .25, .35);
    g.save(); g.translate(480, 965); g.scale(p, p);
    stickyNote(g, 0, 0, 560, 100, ['规则：{按得一样重}'], { px: 44, rot: -.03 });
    g.restore();
  }
  source(g, 'Shergill 等 2003（《科学》）', 880, 1250, { col: '#8A93B8' });
}
/* 3. 方格纸：8 轮的力度柱子，一轮比一轮高；盖章"越按越狠" */
function hookChart(g, t) {
  bgPaper(g, '#FBF6EA');
  const t0 = S('h4') - .12;
  popTag(g, t, t0 + .05, 480, 250, '每一轮的力度', 44, { fill: C.gold });
  const x0 = 140, base = 1100, bw = 70, gap = 18;
  g.fillStyle = C.ink; g.fillRect(x0 - 20, base, 760, 6); g.fillRect(x0 - 20, 380, 6, base - 374);
  for (let i = 0; i < 8; i++) {
    const ta = t0 + .3 + i * .3, u = E.out(clamp((t - ta) / .22)); if (u <= 0) continue;
    const x = x0 + i * (bw + gap) + bw / 2, h = 64 * Math.pow(1.38, i) * u;
    scoreBar(g, x, base, bw, h, i % 2 ? '#F2C230' : '#5BB06A');
    ptext(g, String(i + 1), x, base + 44, 28, '#7A86A8', { align: 'center' });
    // 每根柱子上面一个小箭头：比上一轮高
    if (i > 0 && u >= 1 && t < CH('h4', 3) - .2) pixArrow(g, x - 6, base - h - 50, x - 6, base - h - 16, 6, '#E8443A', 1);
  }
  ptext(g, '第几轮', x0 + 330, base + 92, 28, '#7A86A8', { align: 'center' });
  popTag(g, t, CH('h4', 2) - .25, 330, 470, '平均每轮重近四成', 40, { fill: '#FFC2BE' });
  bigStamp(g, t, CH('h4', 3) - .2, 330, 640, '越按越狠', { px: 72, rot: -.1 });
  // 下面两个小志愿者轮流按，越来越凶
  const k = 5, i = Math.floor((t - t0) / .4) % 2;
  crabAt(g, 600, 1240, k, volO(0, t, { eyes: i ? 'angry' : 'shut', mouth: i ? 'grit' : 'o' }));
  crabAt(g, 760, 1240, k, volO(1, t, { eyes: i ? 'shut' : 'angry', mouth: i ? 'o' : 'grit' }), true);
  source(g, 'Shergill 等 2003：6 对志愿者，每对按 8 轮', 880, 1290);
}
/* 4. 左右两半：两个人都以为"我是照着按的！" */
function hookBoth(g, t) {
  g.fillStyle = '#FCE3C8'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#D9E8F8'; for (let y = 0; y < H; y += 24) g.fillRect(480 + ((y / 24) % 2 ? 12 : 0), y, W, 24);
  const t0 = S('h5') - .12, k = 11, by = 1150;
  popTag(g, t, t0 + .05, 480, 280, '两个人都以为', 44, { fill: C.gold });
  const sure = t > CH('h5', 1) - .2;
  shadowAt(g, 250, by, k); shadowAt(g, 710, by, k);
  crabAt(g, 250, by, k, volO(0, t, sure ? { eyes: 'happy', mouth: 'smile', arms: 'upR' } : {}));
  crabAt(g, 710, by, k, volO(1, t, sure ? { eyes: 'happy', mouth: 'smile', arms: 'upR' } : {}), true);
  for (const [x, d, cx] of [[270, 0, 250], [690, .12, 710]]) {
    const p = pop(t, CH('h5', 1) - .2 + d, .35); if (p <= 0) continue;
    g.save(); g.translate(x, 640); g.scale(p, p);
    // 尾巴：三个越来越小的圆点，从气泡底下斜着连到头顶
    for (let j = 0; j < 3; j++) { const u = (j + 1) / 4, px2 = lerp(0, cx - x, u), py2 = lerp(130, 360, u), r = 16 - j * 4; pixOval(g, px2, py2, r + 6, r + 6, 6, C.ink); pixOval(g, px2, py2, r, r, 6, '#FFFFFF'); }
    pixOval(g, 0, 0, 216, 108, 6, C.ink); pixOval(g, 0, 0, 204, 96, 6, '#FFFFFF');
    prich(g, '我是', 0, -14, 48, C.ink, '#C0392B', { align: 'center' });
    prich(g, '{照着按的}！', 0, 50, 48, C.ink, '#C0392B', { align: 'center' });
    g.restore();
  }
  dialogBox(g, t, 'd2', PORTRAIT.youShock);
}
/* 5. 黑底聚光灯：线索——"你"自己挠自己，面无表情 */
function hookClue(g, t) {
  stageBG(g, 480, 1240);
  const k = 13, cx = 480, by = 1220;
  const wig = Math.floor(t * 8) % 2;
  crabAt(g, cx, by, k, youO(t, { arms: wig ? 'dn' : 'n', eyes: 'n', mouth: 'flat' }));
  // 自己挠自己：手臂一上一下，身边的波浪线是灰的（不痒）
  itchFX(g, cx - 15 * k, by - 9 * k, t, 6, '#6B6880'); itchFX(g, cx + 15 * k, by - 9 * k, t + .3, 6, '#6B6880');
  popTag(g, t, S('h6') - .05, 480, 300, '线索', 48, { fill: C.gold });
  const pq = pop(t, CH('h6', 1) - .2, .35);
  if (pq > 0) { g.save(); g.translate(480, 560); g.scale(pq, pq); ptext(g, '挠自己，不痒', 0, 30, 72, C.white, { align: 'center', ol: C.ink, olw: 7 }); g.restore(); }
  if (t > CH('h6', 2) - .2) popText(g, t, CH('h6', 2) - .2, SE('hook') + 1, '？', 760, 760, 144, C.gold, { olw: 10 });
  speech(g, t, S('h6') + .2, SE('hook') + .3, cx + 60, by - 17 * k, '……', { px: 40 });
}
/* 封面：大标题 + "你"抡着枕头、"他"挨了一下 + 红章 */
function coverArt(g, t) {
  const b = pbuf('cov', 108, 192);
  livingBG(b, 0);
  blit(g, 'cov', 10);
  const k = 19, yx = 250, hx = 800, by = 1520;
  shadowAt(g, yx, by, k); shadowAt(g, hx, by, k);
  crabAt(g, hx, by, k, himO(0, { eyes: 'shut', mouth: 'o' }), true);
  crabAt(g, yx, by, k, youO(0, { eyes: 'angry', mouth: 'grit' }));
  const [fx, fy] = reachArm(g, yx, by, k, 4, C.clawd);
  burst(g, hx - 13 * k, by - 9 * k, 120, 8, { text: '砰', rot: .3 });
  pillow(g, fx + 2 * k, fy - 9 * k, k * .8, .45);
  feathers(g, hx - 13 * k, by - 16 * k, .25, 0, 14, 9);
  titleBlock(g, 0, 300);
  bigStamp(g, 1, 0, 480, 720, '你还手更重', { px: 96 });
}
