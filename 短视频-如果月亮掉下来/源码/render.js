// 逐帧渲染：本地静态服务 → 无头 Chromium（SwiftShader 软件 WebGL2）→ 每帧 renderAt(t)，读回像素交给 ffmpeg。
// 用法：
//   node render.js stills 0.5,3.2,8 out/pv [--scale 0.5]      单帧 PNG（带字幕）
//   node render.js video 起始帧 结束帧 out/part0.mp4 [--fps 30]  一段视频（x264 CRF 12 的中间文件，最后由 build.sh 统一编码）
//   node render.js cover 1.2 ../封面.jpg                         封面（不带字幕和问题字）
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const argv = process.argv.slice(2);
const opt = { scale: 1, fps: 30 };
const pos = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--scale') opt.scale = parseFloat(argv[++i]);
  else if (argv[i] === '--fps') opt.fps = parseFloat(argv[++i]);
  else pos.push(argv[i]);
}
const mode = pos[0];
const ROOT = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.jpg': 'image/jpeg' };
const srv = http.createServer((q, r) => {
  const p = decodeURIComponent(q.url.split('?')[0]);
  const f = path.join(ROOT, p === '/' ? 'index.html' : p);
  if (!f.startsWith(ROOT)) { r.writeHead(403); r.end(); return; }
  fs.readFile(f, (e, d) => {
    if (e) { r.writeHead(404); r.end(); return; }
    r.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream' });
    r.end(d);
  });
});

function ffmpegWrite(args) {
  const ff = spawn('ffmpeg', args, { stdio: ['pipe', 'inherit', 'inherit'] });
  const done = new Promise((res, rej) => ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg ' + c)))));
  return { ff, done };
}
function writeAsync(stream, buf) {
  return new Promise((res) => { if (stream.write(buf)) res(); else stream.once('drain', res); });
}

(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--disable-gpu-watchdog', '--js-flags=--max-old-space-size=4096'] });
  const W = Math.round(1080 * opt.scale), H = Math.round(1920 * opt.scale);
  const page = await browser.newPage({ viewport: { width: 400, height: 400 } });
  page.on('console', (m) => { if ((m.type() === 'error' || m.type() === 'warning') && !/GPU stall/.test(m.text())) console.log('[page]', m.text()); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
  await page.evaluate((s) => window.boot(s), opt.scale);
  const err = await page.evaluate('window.bootError || null');
  if (err) { console.error('启动失败：', err); process.exit(1); }

  const grab = async (t, o = {}) => {
    const which = await page.evaluate(([t, o]) => window.renderAt(t, o), [t, o]);
    const b64 = await page.evaluate('window.grab()');
    return [Buffer.from(b64, 'base64'), which];
  };

  if (mode === 'stills') {
    const dir = pos[2] || 'out/pv';
    fs.mkdirSync(dir, { recursive: true });
    for (const s of pos[1].split(',')) {
      const t = parseFloat(s);
      const t0 = Date.now();
      const [buf, which] = await grab(t);
      const out = path.join(dir, `t${t.toFixed(2).padStart(6, '0')}.png`);
      const { ff, done } = ffmpegWrite(['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-i', '-', '-frames:v', '1', out]);
      ff.stdin.end(buf);
      await done;
      console.log(`${out}  ${which}  ${Date.now() - t0} ms`);
    }
  } else if (mode === 'cover') {
    const t = parseFloat(pos[1]);
    const [buf] = await grab(t, { noCaptions: true, cover: true });
    const { ff, done } = ffmpegWrite(['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-i', '-', '-frames:v', '1', '-q:v', '2', pos[2]]);
    ff.stdin.end(buf);
    await done;
    console.log('封面', pos[2]);
  } else if (mode === 'video') {
    const a = parseInt(pos[1], 10), b = parseInt(pos[2], 10), out = pos[3];
    const { ff, done } = ffmpegWrite(['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(opt.fps), '-i', '-',
      '-c:v', 'libx264', '-preset', 'fast', '-crf', '12', '-pix_fmt', 'yuv420p', out]);
    const t0 = Date.now();
    for (let f = a; f < b; f++) {
      const [buf] = await grab(f / opt.fps);
      await writeAsync(ff.stdin, buf);
      if ((f - a) % 30 === 0) console.log(`帧 ${f}/${b}  ${((Date.now() - t0) / Math.max(1, f - a + 1)).toFixed(0)} ms/帧`);
    }
    ff.stdin.end();
    await done;
    console.log('done', out, `${((Date.now() - t0) / 1000).toFixed(0)} s`);
  }
  await browser.close();
  srv.close();
})();
