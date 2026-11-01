// 看地图：只建场景（没有对局），从游戏镜头的角度在几个地方各截一张，再从高空俯视整张图。
// 用法：node test/sceneview.js 输出目录 [宽 高]
const path = require('path'), fs = require('fs');
const { launch, watchErrors, srcPage, writeTmp } = require('./lib');
(async () => {
  const out = process.argv[2] || 'shots-scene';
  const W = +(process.argv[3] || 932), H = +(process.argv[4] || 430);
  fs.mkdirSync(out, { recursive: true });
  const { browser, ctx } = await launch({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  const page = await ctx.newPage();
  const errs = watchErrors(page);
  const html = srcPage(['data.js', 'models.js', 'scene.js'], '<canvas id="gl" style="width:100vw;height:100vh;display:block"></canvas>', `
    window.T0 = performance.now();
    initRenderer(document.getElementById('gl'));
    resize3D(innerWidth, innerHeight, Math.min(2, devicePixelRatio));
    const scene = buildScene();
    for (const team of [0, 1]) {
      const f = team ? mir : p => p;
      for (let ln = 0; ln < 3; ln++) for (let tier = 0; tier < 3; tier++) { const p = f(TOWERS[ln][tier]); const t = buildTower(team, tier); t.root.position.set(p[0], 0, p[1]); scene.add(t.root); }
      const c = f(CRYSTAL), cr = buildCrystal(team); cr.root.position.set(c[0], 0, c[1]); scene.add(cr.root);
    }
    window.BUILD_MS = performance.now() - T0;
    window.shot = (x, y) => { placeCamera(x, y); S3.r.render(scene, S3.cam); };
    window.topView = () => {
      const cam = new THREE.OrthographicCamera(-2600, 2600, 2600, -2600, 10, 9000);
      cam.position.set(2500, 4000, 2500); cam.up.set(0, 0, -1); cam.lookAt(2500, 0, 2500);
      const f = scene.fog; scene.fog = null; S3.r.render(scene, cam); scene.fog = f;
    };
  `);
  await page.goto(writeTmp('scene.html', html));
  try { await page.waitForFunction(() => window.BUILD_MS > 0, null, { timeout: 60000 }); }
  catch (e) { console.log(errs.join('\n')); throw e; }
  console.log('build ms', await page.evaluate(() => Math.round(window.BUILD_MS)));
  const spots = [['blue-base', 700, 4300], ['mid-river', 2500, 2550], ['top-lane', 400, 2300], ['blue-jungle', 1150, 2600], ['lord-pit', 1250, 1300], ['bot-lane-red', 3500, 4600], ['spring', 300, 4700]];
  for (const [nm, x, y] of spots) {
    await page.evaluate(([x, y]) => shot(x, y), [x, y]);
    await page.screenshot({ path: path.join(out, `scene-${nm}.png`) });
  }
  await page.setViewportSize({ width: 800, height: 800 });
  await page.evaluate(() => { resize3D(800, 800, 1); topView(); });
  await page.screenshot({ path: path.join(out, 'scene-top.png') });
  const info = await page.evaluate(() => ({ calls: S3.r.info.render.calls, tris: S3.r.info.render.triangles, geos: S3.r.info.memory.geometries }));
  console.log(JSON.stringify(info));
  console.log(errs.length ? errs.join('\n') : 'no errors');
  await browser.close();
})();
