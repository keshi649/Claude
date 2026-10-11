'use strict';
/* scenes3.js：上镜攻略 → 结尾（"你"看着照片笑了，朋友们比心）→ 片尾。 */

/* ================= 上镜攻略 ================= */
function guide(g, t) {
  bgRoom(g, t, { wall: '#EAF2E3' });
  // 朋友退远一点、举着手机给"你"拍照
  chibiAt(g, t, 'gdY', 240, 1250, 7, { expr: 'happy' });
  chibiAt(g, t, 'gdF', 760, 1250, 5, { who: 'friendA', arms: 'phone', flip: true });
  const pp = E.out(clamp((t - S('g1') + .3) / .4));
  if (pp > 0) {
    g.save(); g.translate(0, (1 - pp) * 500); g.globalAlpha *= pp;
    pbox(g, 60, 300, 840, 640, { k: 6 });
    g.fillStyle = '#3E9E4F'; g.fillRect(72, 312, 816, 72);
    ptext(g, '★ 上镜攻略 ★', 480, 366, 48, C.white, { align: 'center', sh: 1 });
    const rows = [
      [S('g2') - .2, '{退远一点}，用 2 倍镜头拍', 520],
      [S('g3') - .2, '{连拍几张}，挑最自然的', 660],
      [S('g4') - .2, '照片{多看几眼}，看熟就顺眼', 800],
    ];
    rows.forEach(([t0, s, y]) => {
      const u = pop(t, t0, .35); if (u <= 0) return;
      withAlpha(g, u, () => { g.fillStyle = C.green; g.fillRect(100, y - 32, 36, 36); g.fillStyle = C.ink; g.fillRect(106, y - 26, 24, 24); if (t > t0 + .4) checkMark(g, 104, y - 30, 4, C.green); prich(g, s, 160, y, 40, C.white, C.gold); });
    });
    source(g, '"多看几眼"是按曝光效应推出来的', 880, 920, { px: 22 });
    g.restore();
  }
  // 连拍：咔嚓咔嚓的闪光
  if (t > S('g3') && t < S('g3') + 1.2) { const k = Math.floor((t - S('g3')) * 6); if (k % 2 === 0) { g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(0, 0, W, H); } }
}

/* ================= 结尾 ================= */
function endScene(g, t) {
  bgRoom(g, t, { wall: '#F6E6D8' });
  // "你"拿着照片看，朋友们在旁边比心
  const look = t > S('z1') - .2;
  chibiAt(g, t, 'enY', 480, 1250, 8, { arms: 'phone', expr: look ? 'happy' : 'smile' });
  chibiAt(g, t, 'enA', 190, 1250, 5, { who: 'friendA', arms: 'wave', seed: 1 });
  chibiAt(g, t, 'enB', 780, 1250, 5, { who: 'friendB', arms: 'wave', seed: 2 });
  for (let i = 0; i < 3; i++) { const ph = (t * .7 + i / 3) % 1; withAlpha(g, Math.sin(ph * Math.PI), () => iconHeart(g, 190 + i * 300, 960 - ph * 220, 6)); }
  // 照片：原版
  const pp = pop(t, S('d4') + .2, .35);
  if (pp > 0) { g.save(); g.translate(480, 640); g.scale(pp, pp); drawPrint(g, 0, 0, 300, 380, { k: 5, faceOpt: { expr: 'happy' }, label: '原版的我' }); g.restore(); }
  dialogBox(g, t, 'd4', PORTRAIT.you);
  if (t > CH('z1', 1) - .25) {
    const p = pop(t, CH('z1', 1) - .25, .35);
    g.save(); g.translate(480, 330); g.scale(p, p);
    pbox(g, -330, -90, 660, 180, { k: 6 });
    ptext(g, '曝光效应的规矩：', -280, -20, 36, '#CFC6E8');
    ptext(g, '看熟了，就顺眼', -280, 46, 48, C.gold);
    g.restore();
  }
}

/* ================= 片尾 ================= */
function endCard(g, t) {
  bgRoom(g, t, { wall: '#F6E6D8' });
  chibiAt(g, t, 'cdY', 480, 1250, 8, { arms: 'wave', expr: 'happy' });
  g.fillStyle = 'rgba(10,8,24,.35)'; g.fillRect(0, 0, W, H);
  const p = E.out(clamp((t - SS('card') - .05) / .3));
  g.save(); g.globalAlpha *= p;
  pbox(g, 60, 520, 840, 420, { k: 6, fill: 'rgba(27,23,48,.92)' });
  ptext(g, '为什么镜子里好看，照片里丑？', 480, 640, 48, C.white, { align: 'center', sh: 1 });
  prich(g, '别人眼里的你，一直是{照片里那个}。', 480, 740, 40, C.white, C.gold, { align: 'center' });
  g.fillStyle = 'rgba(255,255,255,.14)'; g.fillRect(130, 790, 700, 4);
  ptext(g, '甜菜  出品', 480, 860, 36, C.amber, { align: 'center' });
  // 配音也是 AI 合成的，一并写明
  ptext(g, '画面、字幕、音效：Claude 用代码生成 · 配音：CosyVoice 3 合成', 480, 905, 24, '#9C93C0', { align: 'center' });
  g.restore();
}
