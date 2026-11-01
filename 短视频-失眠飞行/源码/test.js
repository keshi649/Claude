'use strict';
/* 角色测试页：node render.cjs preview 0,1,2 out/test（PAGE=test.html） */
function frame(t) {
  const g = ctx; g.setTransform(1, 0, 0, 1, 0, 0);
  skyGrad(g, SKY.nightCity); stars(g, 3, 0, 0, .8);
  const k = Math.round(t);
  if (k === 0) {
    const poses = ['stand', 'sit', 'fly', 'float', 'reach', 'lookUp', 'hug', 'phone', 'counter', 'collar'];
    poses.forEach((p, i) => {
      const x = 150 + (i % 5) * 380, y = 330 + Math.floor(i / 5) * 470;
      person(g, { who: i % 2 ? 'he' : 'she', x, y, u: 34, face: 1, pose: POSE[p], t: 2, eyes: 'open', mouth: 'smile', blush: .6, wind: p === 'fly' ? [-2, -.3] : [0, 0], light: LIGHT.moon });
      text(g, p, x, y + 170, 28, { col: '#fff' });
    });
  } else if (k === 1) {
    bust(g, { who: 'he', x: 480, y: 520, u: 150, eyes: 'half', tired: 1, mouth: 'n', light: LIGHT.room });
    bust(g, { who: 'she', x: 1400, y: 520, u: 150, eyes: 'open', blush: .8, mouth: 'smile', light: LIGHT.lamp });
  } else if (k === 2) {
    for (let i = 0; i < 6; i++) { const ph = i / 6; person(g, { who: 'he', x: 200 + i * 300, y: 420, u: 40, pose: walkPose(ph, i > 2 ? 1 : 0), t: 1, light: LIGHT.rain, outfit: 'coat' }); }
    plush(g, { x: 400, y: 900, s: 14, col: PLUSH.orange, eyes: 'n' });
    plush(g, { x: 800, y: 900, s: 14, col: PLUSH.pink, eyes: 'glow', glow: 1, blush: 1 });
    plush(g, { x: 1200, y: 900, s: 14, col: PLUSH.orange, eyes: 'happy', wave: 1, waveR: 1 });
    pixelMon(g, 1600, 850, 12, PLUSH.pink);
    backView(g, { who: 'she', x: 1750, y: 560, u: 60, light: LIGHT.room });
  }
}
window.frame = frame;
window.READY = false;
Promise.all([['WenKaiM', '失眠飞行'], ['SerifB', '测试'], ['SansM', '测试'], ['LongCang', '晚安']].map(([f, s]) => document.fonts.load(`60px "${f}"`, s))).then(() => { buildTextures(); frame(0); window.READY = true; });
