'use strict';
/* 角色测试页：各种姿势、正面半身、背影、同学、像素小怪摆在一张图上看（PAGE=test.html node render.cjs preview 0,1,2 out/test） */
function frame(t) {
  const g = ctx; g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = vgrad(g, 0, H, [[0, '#BFE3FF'], [1, '#F6F1E6']]); g.fillRect(0, 0, W, H);
  g.fillStyle = '#D9CDB8'; g.fillRect(0, 520, W, 20); g.fillRect(0, 1040, W, 20);
  const u = 30, pg = Math.floor(t);
  if (pg === 0) {
    const row1 = [['he', 'uni', POSE.stand], ['she', 'uni', POSE.stand], ['he', 'shirt', POSE.stand], ['she', 'adult', POSE.stand], ['teacher', 'coat', POSE.stand],
      ['he', 'uni', walkPose(.2, 1)], ['she', 'uni', walkPose(.6, 0)], ['he', 'uni', POSE.wave], ['she', 'uni', POSE.cheer], ['he', 'uni', POSE.reach], ['she', 'adult', POSE.give], ['he', 'shirt', POSE.hold]];
    row1.forEach(([who, outfit, pose], i) => person(g, { who, outfit, x: 90 + i * 155, y: 420, u, face: 1, pose, t: i, eyes: 'open', mouth: i % 2 ? 'smile' : 'n', light: LIGHT.day, bag: i === 0 ? '#3A4A6A' : null }));
    const row2 = [POSE.sit, POSE.sitDesk, POSE.write, POSE.chin, POSE.sleep, POSE.guitar, POSE.lean, POSE.shy, POSE.scratch, POSE.write2, cyclePose(.1), POSE.aim];
    row2.forEach((pose, i) => person(g, { who: i % 2 ? 'she' : 'he', outfit: 'uni', x: 90 + i * 155, y: 900, u, face: 1, pose, t: i, eyes: i === 4 ? 'closed' : 'open', light: LIGHT.room }));
  } else if (pg === 1) {
    bust(g, { who: 'she', x: 300, y: 420, u: 110, eyes: 'open', mouth: 'smile', blush: .6, light: LIGHT.room, t, wind: [.6, 0] });
    bust(g, { who: 'he', x: 760, y: 420, u: 110, eyes: 'open', mouth: 'grin', light: LIGHT.golden, t });
    bust(g, { who: 'she', outfit: 'adult', x: 1220, y: 420, u: 110, eyes: 'happy', mouth: 'smile', blush: .5, light: LIGHT.sunset, t, wind: [1, 0] });
    bust(g, { who: 'he', outfit: 'shirt', x: 1680, y: 420, u: 110, eyes: 'down', mouth: 'n', light: LIGHT.present, t });
    backView(g, { who: 'she', x: 300, y: 860, u: 80, light: LIGHT.room, t });
    backView(g, { who: 'he', x: 700, y: 860, u: 80, light: LIGHT.room, t });
    bust(g, { who: 'teacher', x: 1100, y: 860, u: 80, eyes: 'open', mouth: 'smile', light: LIGHT.room, t });
    pixelMon(g, 1450, 900, 8, MON.orange, 1, { glow: .5 });
    monDoodle(g, 1700, 900, 10, '#4A4860', 2.5, 3);
  } else {
    for (let i = 0; i < 12; i++) person(g, { look: kidLook(i), outfit: 'uni', x: 90 + i * 155, y: 420, u, face: i % 2 ? 1 : -1, pose: POSE.sitDesk, t: i, light: LIGHT.room });
    for (let i = 0; i < 12; i++) person(g, { look: kidLook(i), outfit: 'adult', x: 90 + i * 155, y: 900, u, face: 1, pose: POSE.stand, t: i, light: LIGHT.day, mouth: 'smile' });
  }
  text(g, `test page ${pg}`, 20, 30, 24, { k: 'sans', align: 'left', col: '#333' });
}
window.frame = frame;
Promise.all([['WenKaiM', '起风了'], ['SansM', '测试'], ['LongCang', '我喜欢你']].map(([f, s]) => document.fonts.load(`60px "${f}"`, s))).then(() => { buildTextures(); frame(0); window.READY = true; });
