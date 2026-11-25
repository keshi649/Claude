'use strict';
/* scenes2.js：为什么（眼睛里管颜色的细胞画成三个戴安全帽的工人：管红、管绿、管蓝。
   盯着橙色看久了，管红、管绿的累了；画面一变灰，它们还没缓过来，管蓝的占了上风 → 看成蓝的。
   紫色的草同理看成绿的。最后：黑白画 + 眼睛补的颜色 = 你看到的彩色画）。 */

const NEG = { sky: '#B05900', grass: '#E566CA' };      // 负片里天和草的颜色（原图 #4FA6FF、#1A9935 反过来）
const GRAYS = { sky: '#969696' };                    // 黑白画里天的灰（按亮度算：0.299R + 0.587G + 0.114B ≈ 150）
function why(g, t) {
  bgGrid(g, t, '#141A33');
  popTag(g, t, SS('why') + .1, 480, 250, '为什么？', 48, { fill: C.gold });
  const t2 = S('e2') - .15, t3 = S('e3') - .15, t4 = S('e4') - .15;
  const k = 9, by = 1150, xs = [220, 480, 740];
  if (t < t4) {
    // 工人们：e1 看橙色（管红、管绿出大力，后来累了）；e2 看灰色（累的两个出不了力，管蓝的占上风）
    const tired = t > CH('e1', 2) - .25;
    let v;
    if (t < t2) {
      const u = clamp((t - CH('e1', 2) + .25) / 1.2);
      v = [lerp(.9, .55, u), lerp(.75, .45, u), .06];
    } else {
      const u = E.out(clamp((t - t2) / .5));
      v = [lerp(.55, .3, u), lerp(.45, .3, u), lerp(.06, .9, u)];
    }
    xs.forEach((x, i) => coneWorker(g, i, x, by, k, t, v[i], tired && i < 2, i === 2 && t > t2 ? { eyes: 'happy', mouth: 'smile' } : {}));
    if (tired && t < t3) popTag(g, t, CH('e1', 2) - .2, 350, 650, '累了', 40, { fill: '#D3D0DE' });
    if (t > t2) popTag(g, t, CH('e2', 2) - .2, 740, 650, '占了上风', 36, { fill: '#9FD3FF' });
  }
  if (t < t3) {
    // 眼睛在看的颜色
    const gray = t > t2;
    const p = E.out(clamp((t - SS('why') - .2) / .3));
    withAlpha(g, p, () => {
      ptext(g, '眼睛在看：', 150, 440, 40, '#CFC6E8');
      swatch(g, 470, 420, 120, gray ? GRAYS.sky : NEG.sky, '', {});
      ptext(g, gray ? '灰色' : '橙色（负片里的天）', 560, 440, 36, C.white);
    });
    if (gray && t > CH('e2', 2) - .2) {
      const q = pop(t, CH('e2', 2) - .2, .35);
      g.save(); g.translate(480, 560); g.scale(q, q);
      prich(g, '你看到的：{偏蓝}', 0, 0, 44, C.white, '#7FC2FF', { align: 'center' });
      g.restore();
    }
  } else if (t < t4) {
    // 两组对照：橙 → 蓝（天），紫 → 绿（草）
    const rows = [[CH('e3', 0) - .2, NEG.sky, '#4FA6FF', '天', 400], [CH('e3', 2) - .2, NEG.grass, '#1A9935', '草', 640]];
    rows.forEach(([t0, a, b, s, y]) => {
      const p = pop(t, t0, .35); if (p <= 0) return;
      g.save(); g.translate(0, y); g.globalAlpha *= clamp(p);
      ptext(g, s, 120, 20, 48, C.white);
      swatch(g, 300, 0, 110, a, '');
      pixArrow(g, 400, 0, 560, 0, 10, C.gold, clamp((t - t0 - .2) / .3));
      if (t > t0 + .45) swatch(g, 660, 0, 110, b, '');
      g.restore();
    });
    popTag(g, t, CH('e3', 1) - .2, 820, 470, '看成蓝的', 32, { fill: '#9FD3FF' });
    popTag(g, t, CH('e3', 3) - .2, 820, 710, '看成绿的', 32, { fill: '#B8F0C8' });
  } else {
    // 黑白画 + 眼睛补的颜色 = 你看到的
    const p1 = E.out(clamp((t - t4) / .3)), p2 = E.out(clamp((t - CH('e4', 1) + .2) / .4));
    withAlpha(g, p1, () => {
      pbox(g, 78, 330, 348, 600, { k: 6, fill: '#000000' });
      drawPic(g, 'gray', 90, 342, 3);
      ptext(g, '屏幕上：黑白', 252, 990, 36, '#CFC6E8', { align: 'center' });
    });
    withAlpha(g, p2, () => {
      pixArrow(g, 450, 630, 520, 630, 10, C.gold, 1);
      pbox(g, 548, 330, 348, 600, { k: 6, fill: '#000000' });
      drawPic(g, 'orig', 560, 342, 3);
      ptext(g, '你看到的：彩色', 722, 990, 36, C.gold, { align: 'center' });
    });
    if (t > CH('e4', 1)) {
      const q = pop(t, CH('e4', 1) + .2, .35);
      g.save(); g.translate(480, 1110); g.scale(q, q);
      pbox(g, -330, -60, 660, 120, { k: 6 });
      prich(g, '颜色是眼睛{自己补的}', 0, 16, 44, C.white, C.gold, { align: 'center' });
      g.restore();
    }
  }
  source(g, '原理：视网膜里的细胞会适应（Zaidi 等 2012，《当代生物学》）', 880, 1250, { col: '#8A93B8' });
}
