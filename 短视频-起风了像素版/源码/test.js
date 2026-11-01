'use strict';
const cvT = document.getElementById('cv'), cxT = cvT.getContext('2d'), IMGT = new ImageData(SCR.d8, W, H);
function frame(t) {
  T = SCR; clear(C(0xc8d8e8));
  // 火车上：七年后的他低头看手里的纸飞机
  vhead({ x: 200, y: 96, R: 30, yaw: .45, look: 'heA', t, expr: { eyes: 'half', mouth: 'n' }, gaze: [.3, 1], box: [-2.8, -2.0, 3.4, 4.6],
    front: U => {
      varm(U, -1, .55, -1.55, { sleeve: 'long', shirt: ['#f6f8fc', '#c8d0e2'], grip: true });
      const r = varm(U, 1, -.2, 1.25, { sleeve: 'long', shirt: ['#f6f8fc', '#c8d0e2'] });
      vplane(U, [r.hand[0] + .9, r.hand[1] - .25], .75, -.15, { old: true, doodle: true });
    } });
  vhead({ x: 400, y: 96, R: 30, yaw: -.3, look: 'she', t, expr: { eyes: 'open', mouth: 'smile' }, box: [-3, -2.0, 3, 4.6],
    front: U => { varm(U, -1, .3, -2.1, {}); varm(U, 1, -.1, 0, {}); } });
  cxT.putImageData(IMGT, 0, 0);
}
