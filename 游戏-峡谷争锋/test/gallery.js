// 看模型：六个英雄（站着、跑、普攻、放技能）、两队小兵、野怪和龙，用游戏里的镜头角度和灯光。
// 用法：node test/gallery.js 输出目录
const path = require('path'), fs = require('fs');
const { launch, watchErrors, srcPage, writeTmp } = require('./lib');
(async () => {
  const out = process.argv[2] || 'shots-gallery';
  fs.mkdirSync(out, { recursive: true });
  const { browser, ctx } = await launch({ viewport: { width: 1200, height: 560 }, deviceScaleFactor: 1.5 });
  const page = await ctx.newPage();
  const errs = watchErrors(page);
  const html = srcPage(['data.js', 'models.js', 'scene.js'], '<canvas id="gl" style="width:100vw;height:100vh;display:block"></canvas>', `
    initRenderer(document.getElementById('gl'));
    resize3D(innerWidth, innerHeight, 1.5);
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#9FC6D8');
    const hemi = new THREE.HemisphereLight('#E6F2FF', '#5A6A3A', 0.62); scene.add(hemi);
    const sun = new THREE.DirectionalLight('#FFF3DC', 0.78); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -900, right: 900, top: 900, bottom: -900, near: 10, far: 3000 }); sun.shadow.bias = -0.0015;
    scene.add(sun); scene.add(sun.target); S3.sun = sun;
    const gnd = new THREE.Mesh(new THREE.PlaneGeometry(4000, 4000), new THREE.MeshLambertMaterial({ color: '#7DB04E' }));
    gnd.rotation.x = -Math.PI / 2; gnd.receiveShadow = true; scene.add(gnd);
    window.items = [];
    window.setup = (mode) => {
      for (const it of items) scene.remove(it.root);
      items.length = 0;
      if (mode === 'heroes') {
        const ids = ['warrior', 'tank', 'assassin', 'mage', 'marksman', 'support'];
        ids.forEach((id, i) => {
          for (let k = 0; k < 4; k++) {
            const h = rigToSkinned(buildHero(id)); h.root.scale.setScalar(HSCALE); h.root.position.set(-750 + i * 300 + (k % 2) * 120, 0, -160 + Math.floor(k / 2) * 230);
            h.root.rotation.y = k === 0 ? 0 : k === 1 ? 0.6 : k === 2 ? Math.PI / 2 : -0.4;
            scene.add(h.root); items.push({ root: h.root, h, k });
          }
        });
      } else if (mode === 'minions') {
        const mts = ['melee', 'ranged', 'siege', 'super', 'vanguard'];
        mts.forEach((mt, i) => [0, 1].forEach(team => {
          const P = minionParts(mt, team), g = new THREE.Group();
          const b = new THREE.Mesh(P.body, VCOL()); b.castShadow = true; g.add(b);
          [P.legL, P.legR].forEach((lg, j) => { const m = new THREE.Mesh(lg, VCOL()); m.position.copy(P.pivot[j]); m.rotation.x = j ? 0.4 : -0.4; m.castShadow = true; g.add(m); });
          g.position.set(-650 + i * 300, 0, -120 + team * 220); g.rotation.y = team ? Math.PI * 0.85 : 0.3;
          scene.add(g); items.push({ root: g });
        }));
      } else {
        const mts = ['blue', 'red', 'wolf', 'bird', 'golem', 'drake', 'lord'];
        mts.forEach((mt, i) => {
          const m = rigToSkinned(buildMonster(mt), 0.2); m.root.position.set(-780 + i * 250 + (mt === 'lord' ? 60 : 0), 0, (i % 2) * 160 - 60); m.root.rotation.y = 0.5;
          scene.add(m.root); items.push({ root: m.root, m });
        });
      }
    };
    window.pose = (t) => {
      for (const it of items) {
        if (it.h) animHero(it.h, { move: it.k === 1 ? 1 : 0, atk: it.k === 2 ? 0.15 : -1, cast: it.k === 3 ? 0.2 : -1, stun: false, dead: -1 }, t);
        if (it.m) animMonster(it.m, { move: 0, atk: -1, dead: -1 }, t);
      }
      placeCamera(0, 60); S3.r.render(scene, S3.cam);
    };
    window.scene = scene;
    window.READY = 1;
  `);
  await page.goto(writeTmp('gallery.html', html));
  await page.waitForFunction(() => window.READY === 1, null, { timeout: 60000 }).catch(e => { console.log(errs.join('\n')); throw e; });
  for (const mode of ['heroes', 'minions', 'monsters']) {
    await page.evaluate(m => { setup(m); pose(1.3); }, mode);
    await page.screenshot({ path: path.join(out, `gallery-${mode}.png`) });
  }
  // 英雄特写：镜头拉近
  for (const [nm, x] of [['a', -600], ['b', 0], ['c', 600]]) {
    await page.evaluate(x => { setup('heroes'); S3.camDist = 620; pose(1.3); placeCamera(x, 40); S3.r.render(scene, S3.cam); }, x);
    await page.screenshot({ path: path.join(out, `gallery-heroes-close-${nm}.png`) });
  }
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await browser.close();
})();
