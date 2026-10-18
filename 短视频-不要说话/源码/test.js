// 画风测试：夜里的海、月亮、栈桥
(async () => {
  await document.fonts.load('64px "Xiaolai SC"', '深色的海面布满白色的月光你有没有喜欢过一个人从来没说出口？');
  makeTextures();
  window.READY = true;
})();
window.frame = (T) => {
  const g = document.getElementById('c').getContext('2d');
  setBoil(Math.round(T * 30));
  g.setTransform(1, 0, 0, 1, 0, 0);
  drawPaper(g);
  const HZ = 610;
  // 天：中深的排线
  const sky = new Path2D(); sky.rect(0, 0, W, HZ + 4);
  shade(g, sky, { x0: 0, y0: 0, x1: 0, y1: HZ, v0: 0.86, v1: 0.6 }, 24);
  // 月亮附近亮一点（擦淡）
  g.save(); g.globalCompositeOperation = 'destination-out'; g.restore();
  const mx = 1180, my = 250, mr = 86;
  { const gr = g.createRadialGradient(mx, my, mr, mx, my, mr * 4.5); gr.addColorStop(0, 'rgba(238,232,220,0.8)'); gr.addColorStop(1, 'rgba(238,232,220,0)');
    g.save(); g.fillStyle = gr; g.fillRect(mx - mr * 5, my - mr * 5, mr * 10, mr * 10); g.restore(); }
  const moon = new Path2D(); moon.arc(mx, my, mr, 0, 6.283);
  erase(g, moon, 1);
  withSeed('moon', () => { skEllipse(g, mx, my, mr, mr, { w: 2.2, a: 0.7 }); });
  hatch(g, (() => { const p = new Path2D(); p.arc(mx + 20, my + 12, mr * 0.9, 0.2, 2.6); p.closePath(); return p; })(), 0.12, -30);
  glow(g, mx, my, mr * 3.2, C.moon, 0.35);
  // 星星
  for (let i = 0; i < 60; i++) { const x = hash(i, 1) * W, y = hash(i, 2) * (HZ - 80); if (Math.hypot(x - mx, y - my) < mr * 2) continue;
    const r = 1.2 + hash(i, 3) * 2.2, tw = 0.6 + 0.4 * Math.sin(T * 2 + i * 1.7); const p = new Path2D(); p.arc(x, y, r, 0, 6.283); erase(g, p, tw); }
  // 海
  const sea = new Path2D(); sea.rect(0, HZ, W, H - HZ);
  shade(g, sea, { x0: 0, y0: HZ, x1: 0, y1: H, v0: 0.72, v1: 0.9 }, 1.5, { hatch: 0.6 });
  // 海平线
  withSeed('hz', () => { sk(g, [[-20, HZ], [W + 20, HZ + 2]], { w: 2.4, a: 0.8, j: 2 }); });
  // 月光：海面上一条擦亮的碎光
  withSeed('path', () => {
    for (let i = 0; i < 220; i++) {
      const v = hash(i, 11), y = HZ + 6 + Math.pow(v, 1.6) * (H - HZ);
      const spread = 30 + (y - HZ) * 0.55;
      const x = mx + (hash(i, 12) - 0.5) * 2 * spread * (0.4 + 0.6 * hash(i, 13));
      const len = (6 + (y - HZ) * 0.12) * (0.5 + hash(i, 14));
      const ph = Math.sin(T * (1.2 + hash(i, 15) * 2) + i);
      const a = clamp(0.55 + 0.45 * ph) * (1 - Math.abs(x - mx) / (spread * 1.3));
      if (a <= 0.05) continue;
      eraseStroke(g, [[x - len / 2, y], [x + len / 2, y + (hash(i, 16) - 0.5) * 2]], 1.5 + (y - HZ) * 0.012, a);
    }
  });
  glow(g, mx, HZ + 120, 380, C.moon, 0.12);
  // 浪：一道道短弧
  withSeed('waves', () => {
    for (let i = 0; i < 70; i++) {
      const y = HZ + 14 + Math.pow(hash(i, 21), 1.3) * (H - HZ - 20), x = ((hash(i, 22) * W + T * (8 + y * 0.02)) % (W + 200)) - 100;
      const len = 30 + (y - HZ) * 0.35;
      sk(g, [[x, y], [x + len * 0.5, y - 2 - (y - HZ) * 0.01], [x + len, y]], { w: 1.4 + (y - HZ) * 0.004, a: 0.55, taper: 0.9 });
    }
  });
  // 栈桥
  withSeed('pier', () => {
    const top = [[1920, 820], [1420, 690], [1360, 700], [1880, 900]];
    const deck = pathOf(top); paperFill(g, deck); hatch(g, deck, 0.3, -12);
    for (let k = 0; k < 14; k++) { const u = k / 13; skLine(g, lerp(1920, 1420, u), lerp(820, 690, u), lerp(1880, 1360, u), lerp(900, 700, u), { w: 1.2, a: 0.6 }); }
    skPoly(g, top, { w: 2.6, a: 0.85 });
    for (let k = 0; k < 6; k++) { const u = k / 5, x = lerp(1880, 1370, u), y = lerp(900, 702, u); const post = new Path2D(); post.rect(x - 7, y, 14, 90 - u * 50); paperFill(g, post); hatch(g, post, 0.7, 80); skRect(g, x - 7, y, 14, 90 - u * 50, { w: 1.8, a: 0.8 }); }
  });
  // 字
  pencilText(g, '你有没有喜欢过一个人，', 520, 330, 76);
  pencilText(g, '从来没说出口？', 520, 440, 76);
  vignette(g, 0.4);
  postGrain(g, 0.6);
};
