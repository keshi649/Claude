// render.cjs —— 用无头 Chromium 逐帧画 480×270 的画面。
//   node render.cjs sheet 输出.png 列数 倍数 t1 t2 …   多个时刻拼一张图（看效果用）
//   node render.cjs video 起始帧 结束帧 输出.mkv        画 [起始帧, 结束帧) 存成无损 FFV1（最后由 build.sh 放大 4 倍、配上原曲）
const { chromium } = require('playwright');
const path = require('path'), fs = require('fs'), { spawn } = require('child_process');
const FPS = 30, url = 'file://' + path.resolve(__dirname, 'index.html');
async function openPage(browser) {
  const ctx = await browser.newContext({ viewport: { width: 480, height: 270 } });
  const page = await ctx.newPage();
  page.on('console', m => { if (['error', 'warning'].includes(m.type())) console.error('[page]', m.text()); });
  page.on('pageerror', e => { console.error('[pageerror]', e.message); });
  await page.goto(url);
  await page.waitForFunction(() => window.READY === true, null, { timeout: 120000 });
  return page;
}
(async () => {
  const [mode, ...args] = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--disable-gpu', '--disable-web-security', '--allow-file-access-from-files'] });
  const page = await openPage(browser);
  if (mode === 'sheet') {
    const [out, cols, k, ...ts] = args;
    const data = await page.evaluate(([ts, cols, k]) => window.sheet(ts.map(Number), cols, k), [ts, +cols, +k]);
    fs.writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
  } else if (mode === 'crop') {
    const [out, t, x, y, w, h, k] = args.map((v, i) => i ? +v : v);
    const data = await page.evaluate(a => window.crop(...a), [t, x, y, w, h, k]);
    fs.writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
  } else if (mode === 'cover') {
    const [out, t] = args;
    const data = await page.evaluate(t => { window.COVER = window.coverTitle; window.frame(+t); window.COVER = null; return cv.toDataURL('image/png'); }, t);
    fs.writeFileSync(out, Buffer.from(data.split(',')[1], 'base64'));
  } else if (mode === 'video') {
    const a = +args[0], b = +args[1], out = args[2];
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-', '-c:v', 'ffv1', '-level', '3', '-pix_fmt', 'bgr0', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = a; i < b; i++) {
      const d = await page.evaluate(t => { window.frame(t); return cv.toDataURL('image/png'); }, i / FPS);
      const buf = Buffer.from(d.split(',')[1], 'base64');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if ((i - a) % 300 === 0) console.log(`frame ${i} (${((Date.now() - t0) / 1000).toFixed(0)}s)`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    console.log(`done ${a}-${b} in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
