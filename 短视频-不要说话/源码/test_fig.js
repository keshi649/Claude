// 人物测试页：各种姿势、大小、亮暗背景
(async () => { await document.fonts.load('40px "Xiaolai SC"', '她他站走坐'); makeTextures(); window.READY = true; })();
window.frame = (T) => {
  const g = document.getElementById('c').getContext('2d');
  setBoil(Math.round(T * 30));
  g.setTransform(1, 0, 0, 1, 0, 0);
  drawPaper(g);
  const dark = new Path2D(); dark.rect(1280, 0, 640, 1080); shade(g, dark, 0.82, 25);
  figure(g, 'her', 200, 520, 4.4, P({ look: 0.35, mouth: 'smile', blush: 0.6 }));
  figure(g, 'him', 470, 520, 4.2, P({ look: 0.4, mouth: 'smile' }));
  figure(g, 'star', 740, 520, 4.3, P({ look: 0.3, aF: [30, 60], mouth: 'smile' }));
  figure(g, 'her', 960, 520, 3.4, walkPose(T * 0.9, 0, { look: 0.15 }));
  figure(g, 'him', 1130, 520, 3.2, walkPose(T * 0.9 + 0.5, 0.8, { look: 0.1 }));
  figure(g, 'her', 1420, 520, 4.0, P({ look: 0.2, eyes: 'down', aF: [40, 70], hF: 'hold', mouth: 'line' }), { night: true, light: { dx: 1, dy: -0.3, a: 0.45 } });
  figure(g, 'him', 1700, 520, 4.0, P({ look: 0.0, aF: [80, 10], aB: [70, 20], hF: 'flat', hB: 'flat', mouth: 'line', brows: 1 }), { night: true, light: { dx: -1, dy: -0.4, a: 0.5 } });
  // 坐在地上抱着膝盖
  figure(g, 'her', 200, 930, 4.0, P({ torso: 18, neck: 10, lF: [128, -140], lB: [122, -132], aF: [5, 78], aB: [0, 72], eyes: 'closed', mouth: 'hum', look: 0.15 }), { ground: false });
  // 坐在桥边，腿垂下来
  figure(g, 'her', 520, 860, 4.0, P({ torso: -3, lF: [88, -84], lB: [84, -76], aF: [30, 30], aB: [-20, 20], look: 0.1 }), { ground: false });
  figure(g, 'him', 860, 1000, 4.0, P({ torso: 25, neck: 10, aF: [100, 0], aB: [85, 5], lF: [20, -10], lB: [-25, -5], look: 0.0, mouth: 'line' }));
  for (let i = 0; i < 5; i++) figure(g, i % 2 ? 'him' : 'her', 1080 + i * 70, 1000, 1.3 + i * 0.25, walkPose(T + i * 0.2, 0, {}));
  figure(g, 'star', 1500, 1000, 3.8, P({ torso: 6, look: 0.45, aF: [-20, 120], aB: [-30, 100], mouth: 'open', blush: 0.8 }), { night: true });
  figure(g, 'her', 1760, 1000, 3.8, P({ look: 1.0, mouth: 'o', eyes: 'wide', aF: [10, 150], aB: [-10, 150] }), { night: true });
  postGrain(g, 0.5);
};
