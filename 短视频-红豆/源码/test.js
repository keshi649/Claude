'use strict';
/* 像素角色、道具测试：PAGE=test.html node render.cjs preview 0,1 out/test */
window.frame = function (t) {
  const g = ctx; g.setTransform(1, 0, 0, 1, 0, 0);
  const page = Math.round(t);
  const b = pbuf('test', 320, 180);
  prect(b, 0, 0, 320, 180, '#E9E4DA'); prect(b, 0, 120, 320, 60, '#CFC6B6');
  if (page === 0) {
    const L = [['he', {}], ['she', {}], ['he', { eyes: 'happy', blush: 1 }], ['she', { eyes: 'heart' }], ['he', { scarf: 1 }], ['she', { scarf: 1, eyes: 'shut' }],
      ['he', { old: 1 }], ['she', { old: 1, eyes: 'happy' }], ['he', { sit: 1, armR: 'front' }], ['she', { armL: 'hold', lean: -1, eyes: 'shut' }], ['he', { armR: 'hug', eyes: 'happy' }], ['she', { back: 1 }]];
    L.forEach(([who, o], i) => monAt(b, 8 + (i % 6) * 52, i < 6 ? 60 : 118, Object.assign({ who }, o)));
    pbean(b, 20, 140, 1); pbean(b, 30, 140, 2); pbean(b, 48, 141, 4); pbean(b, 70, 141, 6);
    pjar(b, 110, 170, 1, { fill: .4 }); pjar(b, 140, 170, 1.5, { fill: .3, slips: 4 });
    pmug(b, 170, 170, t); phourglass(b, 195, 140, 28, .4, t);
    psnowman(b, 240, 172, 0, 0, t); psnowman(b, 275, 172, .6, .5, t);
    pslip(b, 70, 160, 90, '一起看一场雪', 1);
  } else {
    ptree(b, 60, 170, 1, .3, {}); ptree(b, 140, 170, .6, .6, { pods: true }); ptree(b, 220, 170, 1, .85, {}); ptree(b, 280, 170, .1, .2, {});
    phouse(b, null, 60, 100, {}); pfence(b, 0, 320, 100); pkite(b, 200, 40, t); pboat(b, 260, 60, 1); pbench(b, 140, 90, 40);
    pbirds(b, t, 100, 30); pfire(b, null, 290, 110, t);
  }
  g.fillStyle = '#000'; g.fillRect(0, 0, W, H); blit(g, 'test', 6);
  ptext(g, '还没好好的感受', 960, 950, 5, '#FFFFFF', { align: 'center', ol: '#0A0C1C' });
};
fontsReady('还没好好的感受一起看一场雪').then(() => { window.READY = true; });
