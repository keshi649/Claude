// render.cjs：用无头 Chromium 逐帧画。
//   node render.cjs preview 1.2,5.5 out/pv          每个时刻存一张 1920×1080 的 PNG
//   node render.cjs sheet 1.2,5.5,9 out/s.png 3       几个时刻拼一张图（每格 960×540）
//   node render.cjs video 0 300 out/p0.mkv            第 0~299 帧，640×360 无损（FFV1），出片时再放大 3 倍
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { spawn } = require('child_process');
const FPS = 30;
(async () => {
  const [mode, a1, a2, a3] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
  const page = await browser.newPage({ viewport: { width: 1300, height: 760 } });
  page.on('pageerror', e => console.error('PAGE ERROR', e.message));
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('console:', m.text()); });
  await page.goto('file://' + path.join(__dirname, 'index.html') + (process.env.TEST ? '#' + process.env.TEST : ''));
  await page.evaluate(lt => { if (location.hash) window.TEST = location.hash.slice(1); if (lt !== null) window.LT = lt; }, process.env.LT ? +process.env.LT : null);
  await page.evaluate(() => window.boot());
  if (mode === 'preview' || mode === 'cover') {
    const ts = a1.split(',').map(Number);
    fs.mkdirSync(a2, { recursive: true });
    for (const t of ts) {
      const url = await page.evaluate(([t, m]) => window.snap(t, 3, m === 'cover'), [t, mode]);
      const f = path.join(a2, (mode === 'cover' ? 'cover_' : 'f') + t.toFixed(2).padStart(7, '0') + '.png');
      fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
      console.log(f);
    }
  } else if (mode === 'sheet') {
    const ts = a1.split(',').map(Number), cols = +(a3 || 3);
    const url = await page.evaluate(([ts, cols]) => window.sheet(ts, cols), [ts, cols]);
    fs.writeFileSync(a2, Buffer.from(url.split(',')[1], 'base64'));
    console.log(a2);
  } else if (mode === 'crop') {
    // node render.cjs crop t x,y,w,h out.png 倍数
    const [x, y, w, h] = a2.split(',').map(Number);
    const url = await page.evaluate(([t, x, y, w, h, s]) => window.crop(t, x, y, w, h, s), [+a1, x, y, w, h, +(process.argv[6] || 4)]);
    fs.writeFileSync(a3, Buffer.from(url.split(',')[1], 'base64'));
    console.log(a3);
  } else if (mode === 'video') {
    const f0 = +a1, f1 = +a2, out = a3;
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      '-c:v', 'ffv1', '-level', '3', '-pix_fmt', 'bgr0', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = f0; f < f1; f++) {
      const url = await page.evaluate(t => window.snap(t, 1, false), f / FPS);
      const buf = Buffer.from(url.split(',')[1], 'base64');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if ((f - f0) % 300 === 0) console.log(`frame ${f} (${((f - f0) / ((Date.now() - t0) / 1000 + 1e-9)).toFixed(1)} fps)`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)} s`);
  }
  await browser.close();
})();
