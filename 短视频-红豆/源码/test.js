'use strict';
/* 角色测试：PAGE=test.html node render.cjs preview 0,1,2 out/test —— t 取整数选不同的页 */
function frame(t) {
  const g = ctx; g.setTransform(1, 0, 0, 1, 0, 0);
  g.fillStyle = '#E9E4DA'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#D6CFC2'; g.fillRect(0, 760, W, 320);
  const page = Math.round(t);
  const L = { dir: 1, shade: .16, rim: '#FFF4E0', rimA: .5 };
  if (page === 0) {
    const u = 38, y = 740;
    person(g, { who: 'he', u, x: 110, y, f: 1, out: OUTFIT.heWinter, pose: POSE.stand, light: L, t });
    person(g, { who: 'she', u, x: 260, y, f: -1, out: OUTFIT.sheWinter, pose: POSE.stand, light: L, t });
    person(g, { who: 'he', u, x: 420, y, f: 1, out: OUTFIT.heSummer, pose: walkPose(.8), light: L, t });
    person(g, { who: 'she', u, x: 580, y, f: 1, out: OUTFIT.sheSummer, pose: walkPose(2.4), light: L, t, wind: .4 });
    person(g, { who: 'he', u, x: 760, seat: 600, f: 1, out: OUTFIT.heHome, pose: POSE.sit, light: L, t });
    person(g, { who: 'she', u, x: 900, seat: 600, f: -1, out: OUTFIT.sheHome, pose: POSE.sitLean, light: L, t });
    person(g, { who: 'he', u, x: 1060, y, f: 1, out: OUTFIT.heHome, pose: POSE.kneel, light: L, t });
    person(g, { who: 'she', u, x: 1220, y, f: 1, out: OUTFIT.sheDesert, pose: walkPose(1.2, .8), light: L, t, wind: .6 });
    person(g, { who: 'he', u, x: 1400, y, f: -1, out: OUTFIT.heOld, age: 1, pose: walkPose(.5, 0, { tb: 10 }), light: L, t });
    person(g, { who: 'she', u, x: 1560, y, f: -1, out: OUTFIT.sheOld, age: 1, pose: POSE.stand, light: L, t });
    person(g, { who: 'she', u, x: 1760, y, f: 1, out: OUTFIT.sheTravel, pose: POSE.reach, light: L, t });
    g.fillStyle = '#9A8D78'; g.fillRect(700, 600, 250, 14);
  } else if (page === 1) {
    const u = 40, y = 760;
    person(g, { who: 'he', u, x: 160, y, view: 'front', out: OUTFIT.heWinter, light: L, t });
    person(g, { who: 'she', u, x: 380, y, view: 'front', out: OUTFIT.sheWinter, light: L, t });
    person(g, { who: 'he', u, x: 600, y, view: 'back', out: OUTFIT.heSummer, light: L, t });
    person(g, { who: 'she', u, x: 820, y, view: 'back', out: OUTFIT.sheSummer, light: L, t, wind: .3 });
    person(g, { who: 'he', u, x: 1040, y, view: 'front', out: OUTFIT.heOld, age: 1, light: L, t });
    person(g, { who: 'she', u, x: 1260, y, view: 'front', out: OUTFIT.sheOld, age: 1, light: L, t });
    person(g, { who: 'she', u, x: 1480, y, view: 'front', out: OUTFIT.sheSummer, light: L, t, pose: { aN1: 150, aN2: 10, aF1: 30, aF2: 40 }, eyes: 'happy', mouth: 'open' });
    person(g, { who: 'he', u, x: 1700, y, view: 'front', out: OUTFIT.heDesert, light: L, t, eyes: 'closed', pose: { tilt: .2 } });
  } else if (page === 2) {
    headFront(g, { who: 'she', blush: .6 }, [480, 480], 300, SKIN.she, HAIR.she[0]);
    headFront(g, { who: 'he', eyes: 'happy' }, [1400, 480], 300, SKIN.he, HAIR.he[0]);
    for (let i = 0; i < 6; i++) bean(g, 860 + i * 40, 900, 14 + i * 2, i * .5);
    redThread(g, [[100, 1000], [500, 960], [900, 1020], [1300, 980], [1800, 1010]], 4);
  } else if (page === 4) {
    bust(g, 520, 420, 170, { who: 'she', out: OUTFIT.sheWinter, light: L, t, blush: .7 });
    bust(g, 1400, 420, 170, { who: 'he', out: OUTFIT.heWinter, light: L, t, eyes: 'down' });
  } else if (page === 5) {
    bust(g, 520, 420, 170, { who: 'she', age: 1, out: OUTFIT.sheOld, light: L, t, eyes: 'happy' });
    bust(g, 1400, 420, 170, { who: 'he', age: 1, out: OUTFIT.heOld, light: L, t, tilt: .1 });
  } else if (page === 3) {
    person(g, { who: 'she', u: 120, x: 600, y: 1600, f: 1, out: OUTFIT.sheWinter, light: L, t });
    person(g, { who: 'he', u: 120, x: 1400, y: 1600, f: -1, out: OUTFIT.heOld, age: 1, light: L, t, eyes: 'happy' });
  }
}
window.frame = frame;
Promise.all(['SerifM', 'SerifB', 'MaShan', 'LongCang'].map(f => document.fonts.load(`60px "${f}"`, '红豆'))).then(() => { buildTextures(); frame(0); window.READY = true; });
