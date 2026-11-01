/* render.cjs —— 用 Playwright 打开 index.html，逐帧调 frame(t)，把 480×270 的画面交给 ffmpeg。
   node render.cjs still 时刻 输出.png [放大倍数=4]          一帧（歌曲时间，秒）
   node render.cjs sheet 时刻1,时刻2,… 输出.png [列数=3] [倍数=2]   几帧拼一张图，看效果不用出片
   node render.cjs crop 时刻 x,y,w,h 输出.png [倍数=8]       放大看局部（480×270 的坐标）
   node render.cjs video 起始帧 结束帧 输出.mkv              [a, b) 帧存成无损 FFV1（480×270），build.sh 再统一放大编码
   环境变量 PAGE 换测试页（如 PAGE=test.html） */
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const [mode, ...args] = process.argv.slice(2);
const FPS = 30;

(async () => {
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files', '--disable-web-security'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 } });
  let errs = 0;
  page.on('pageerror', e => { errs++; if (errs < 6) console.error('PAGE ERROR:', e.message); });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('console:', m.text()); });
  await page.goto('file://' + path.resolve(__dirname, process.env.PAGE || 'index.html'));
  await page.evaluate(async () => { await document.fonts.load('12px FP12', '字'); await document.fonts.load('8px FP8', '字'); await document.fonts.ready; });
  const ok = await page.evaluate(() => typeof frame === 'function');
  if (!ok) { console.error('frame() 没有定义（看上面的 PAGE ERROR）'); await browser.close(); process.exit(1); }
  const dataOf = u => Buffer.from(u.slice(u.indexOf(',') + 1), 'base64');

  if (mode === 'still' || mode === 'sheet' || mode === 'crop') {
    const ts = (mode === 'crop' || mode === 'still' ? [args[0]] : args[0].split(',')).map(Number);
    const out = mode === 'crop' ? args[2] : args[1];
    const opt = mode === 'crop'
      ? { crop: args[1].split(',').map(Number), scale: Number(args[3] || 8) }
      : mode === 'sheet' ? { cols: Number(args[2] || 3), scale: Number(args[3] || 2) } : { scale: Number(args[2] || 4) };
    const url = await page.evaluate(([ts, opt]) => {
      const cv = document.getElementById('cv');
      if (opt.crop) {
        frame(ts[0]); const [x, y, w, h] = opt.crop, k = opt.scale, o = document.createElement('canvas'); o.width = w * k; o.height = h * k;
        const g = o.getContext('2d'); g.imageSmoothingEnabled = false; g.drawImage(cv, x, y, w, h, 0, 0, w * k, h * k); return o.toDataURL('image/png');
      }
      const k = opt.scale, cols = Math.min(opt.cols || 1, ts.length), rows = Math.ceil(ts.length / cols), pad = 4, lab = 22;
      const o = document.createElement('canvas'); o.width = cols * (480 * k + pad) + pad; o.height = rows * (270 * k + pad + lab) + pad;
      const g = o.getContext('2d'); g.fillStyle = '#222'; g.fillRect(0, 0, o.width, o.height); g.imageSmoothingEnabled = false;
      ts.forEach((t, i) => {
        frame(t); const x = pad + (i % cols) * (480 * k + pad), y = pad + Math.floor(i / cols) * (270 * k + pad + lab);
        if (ts.length > 1) { g.fillStyle = '#ffd860'; g.font = '16px monospace'; g.fillText(t.toFixed(2) + 's', x + 2, y + 16); }
        g.drawImage(cv, 0, 0, 480, 270, x, y + (ts.length > 1 ? lab : 0), 480 * k, 270 * k);
      });
      return o.toDataURL('image/png');
    }, [ts, opt]);
    fs.writeFileSync(out, dataOf(url)); console.log(out);
  } else if (mode === 'video') {
    const a = Number(args[0]), b = Number(args[1]), out = args[2];
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'png', '-i', '-',
      '-c:v', 'ffv1', '-level', '3', '-pix_fmt', 'bgr0', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = a; f < b; f++) {
      const url = await page.evaluate(t => { frame(t); return document.getElementById('cv').toDataURL('image/png'); }, f / FPS);
      if (!ff.stdin.write(dataOf(url))) await new Promise(r => ff.stdin.once('drain', r));
      if ((f - a) % 300 === 299) console.log(`[${out}] frame ${f + 1}/${b}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end(); await new Promise(r => ff.on('close', r));
    console.log(`[${out}] done ${b - a} frames in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  } else {
    console.error('用法见文件开头'); process.exitCode = 1;
  }
  if (errs) { console.error(`页面报错 ${errs} 次`); process.exitCode = 1; }
  await browser.close();
})();
