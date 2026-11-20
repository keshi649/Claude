'use strict';
/* scenes3.js：想知道你家对面是哪（纬度北换南，经度用 180 减、东换西，举北京的例子）→ 结尾（夜里的院子，洞里冒出奶牛；
   "那我在阿根廷往下挖，能挖回家吗？"→"能，不过得先去阿根廷。评论区说说，你家对面是陆地还是海？"）→ 片尾。 */

function guide(g, t) {
  const b = pbuf('yard2', 216, 384);
  yardBG(b, t, .55);
  blit(g, 'yard2', 5);
  yardHole(g, 640, 1215, 300, 1, t);
  digger(g, t, 300, 1240, 10, { dig: false, you: { eyes: 'up' } });
  g.fillStyle = 'rgba(10,8,24,.35)'; g.fillRect(0, 0, W, H);
  const pp = E.out(clamp((t - S('g1') + .3) / .4));
  if (pp <= 0) return;
  g.save(); g.translate(0, (1 - pp) * 500); g.globalAlpha *= pp;
  pbox(g, 60, 280, 840, 640, { k: 6 });
  g.fillStyle = '#3E9E4F'; g.fillRect(72, 292, 816, 72);
  ptext(g, '★ 你家对面是哪？★', 480, 346, 48, C.white, { align: 'center', sh: 1 });
  const rows = [[S('g2') - .2, '纬度：北纬 → {南纬}', 470], [S('g3') - .2, '经度：{180 减}，东经 → {西经}', 570], [S('g3') + .1, '再去地图上{搜一下}', 670]];   // 第三行跟着第二行出来：整张卡要完整地停 ≥ 3 秒（攻略卡）
  rows.forEach(([t0, s, y]) => {
    const u = pop(t, t0 - .1, .35); if (u <= 0) return;
    withAlpha(g, u, () => { g.fillStyle = C.green; g.fillRect(100, y - 32, 36, 36); g.fillStyle = C.ink; g.fillRect(106, y - 26, 24, 24); if (t > t0 + .4) checkMark(g, 104, y - 30, 4, C.green); prich(g, s, 160, y, 44, C.white, C.gold); });
  });
  // 例子：北京
  if (t > S('g3') + .3) {
    const u = E.out(clamp((t - S('g3') - .3) / .4));
    withAlpha(g, u, () => {
      g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(90, 720, 780, 170);
      ptext(g, '例：北京  北纬 40°，东经 116°', 110, 780, 36, '#CFC6E8');
      prich(g, '→ 南纬 40°，西经 64°：{阿根廷}', 110, 850, 36, C.white, C.gold);
    });
  }
  g.restore();
}

/* ================= 结尾 ================= */
function endScene(g, t) {
  const b = pbuf('yard3', 216, 384);
  yardBG(b, t, 1);
  blit(g, 'yard3', 5);
  glow(g, 840, 220, 260, 'rgba(240,240,220,.2)');
  const hx = 640, hy = 1215;
  yardHole(g, hx, hy, 300, 1, t);
  // 奶牛又从洞里探出头
  const up = E.back(clamp((t - SS('end') - .3) / .5));
  g.save(); g.beginPath(); g.rect(hx - 160, hy - 220, 320, 228); g.clip();
  g.save(); g.imageSmoothingEnabled = false; g.drawImage(COW(), hx - 110, Math.round(hy + 10 - up * 120), 220, 120); g.restore();
  g.restore();
  digger(g, t, 300, 1240, 10, { dig: false, you: t > S('z1') ? { eyes: 'happy', mouth: 'smile' } : { eyes: 'wide', mouth: 'o' } });
  // 萤火虫
  for (let i = 0; i < 12; i++) { const x = hash(i, 5) * 1000 + Math.sin(t + i) * 30, y = 900 + hash(i, 6) * 300 + Math.cos(t * 1.3 + i) * 20; if (Math.sin(t * 3 + i * 2) > 0) { g.fillStyle = '#F7F08A'; g.fillRect(Math.round(x / 5) * 5, Math.round(y / 5) * 5, 5, 5); glow(g, x, y, 20, 'rgba(247,240,138,.5)'); } }
  dialogBox(g, t, 'd3', PORTRAIT.youShock);
  // 评论区：陆地还是海？
  if (t > CH('z1', 2) - .2) {
    const p = pop(t, CH('z1', 2) - .2, .35);
    g.save(); g.translate(480, 470); g.scale(p, p);
    pbox(g, -360, -150, 720, 300, { k: 6, fill: '#FFFFFF', rim: '#F4E9D8' });
    ptext(g, '你家对面是……', 0, -70, 44, C.ink, { align: 'center' });
    pbox(g, -300, -20, 260, 120, { k: 5, fill: '#7DA64E', shadow: false }); ptext(g, '陆地', -170, 60, 60, C.white, { align: 'center', ol: C.ink, olw: 5 });
    pbox(g, 40, -20, 260, 120, { k: 5, fill: '#4A8EF0', shadow: false }); ptext(g, '海', 170, 60, 60, C.white, { align: 'center', ol: C.ink, olw: 5 });
    g.restore();
  }
}

/* ================= 片尾 ================= */
function endCard(g, t) {
  const b = pbuf('yard4', 216, 384);
  yardBG(b, t, 1);
  blit(g, 'yard4', 5);
  yardHole(g, 640, 1215, 300, 1, t);
  digger(g, t, 300, 1240, 10, { dig: false, you: { eyes: 'happy', mouth: 'smile', arms: 'upR' } });
  g.fillStyle = 'rgba(10,8,24,.5)'; g.fillRect(0, 0, W, H);
  const p = E.out(clamp((t - SS('card') - .05) / .3));
  g.save(); g.globalAlpha *= p;
  pbox(g, 60, 470, 840, 540, { k: 6, fill: 'rgba(27,23,48,.92)' });
  ptag(g, 480, 540, '如果……会怎样 ①', 32, { fill: C.gold });
  ptext(g, '从你家往下挖，挖穿地球会到哪？', 480, 640, 40, C.white, { align: 'center', sh: 1 });
  prich(g, '北京往下挖，是{阿根廷}。', 480, 730, 40, C.white, C.gold, { align: 'center' });
  ptext(g, '下一集：80 亿人站在一起，要多大地方？', 480, 810, 32, '#CFC6E8', { align: 'center' });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(130, 850, 700, 4);
  ptext(g, '甜菜  出品', 480, 920, 36, C.amber, { align: 'center' });
  ptext(g, '画面、字幕、音效：Claude 用代码生成 · 配音：CosyVoice 3 合成', 480, 970, 24, '#9C93C0', { align: 'center' });
  g.restore();
}
