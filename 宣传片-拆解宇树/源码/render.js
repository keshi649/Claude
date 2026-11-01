// 逐帧渲染：起一个本地静态服务 → 无头 Chromium（SwiftShader 软件 WebGL）打开 index.html →
// 每帧调用 renderAt(t) 再读回 RGB → 写给 ffmpeg。也能只出几张静帧（--stills）做检查。
//
// 用法：
//   node render.js --out 片段.mp4 [--from 0 --to 10] [--scale 1] [--fps 30] [--crf 8]
//   node render.js --stills 1.5,3,8.2 --stilldir 检查/ [--scale 0.5]
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const args = Object.fromEntries(process.argv.slice(2).reduce((acc, a, i, arr) => {
  if (a.startsWith('--')) acc.push([a.slice(2), arr[i + 1] && !arr[i + 1].startsWith('--') ? arr[i + 1] : '1']);
  return acc;
}, []));
const ROOT = __dirname;
const scale = parseFloat(args.scale || '1');
const fps = parseFloat(args.fps || '30');

const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.png': 'image/png', '.jpg': 'image/jpeg', '.ttf': 'font/ttf', '.woff2': 'font/woff2', '.woff': 'font/woff' };
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

function writeAsync(stream, buf) {
  return new Promise((res) => { if (stream.write(buf)) res(); else stream.once('drain', res); });
}

(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const port = srv.address().port;
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--js-flags=--max-old-space-size=4096'] });
  const W = Math.round(1080 * scale), H = Math.round(1920 * scale);
  const page = await browser.newPage({ viewport: { width: W, height: H } });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${port}/index.html?scale=${scale}&fps=${fps}`);
  await page.waitForFunction('window.ready === true || window.bootError', null, { timeout: 180000 });
  const bootErr = await page.evaluate('window.bootError');
  if (bootErr) { console.error('启动失败：', bootErr); process.exit(1); }
  const meta = await page.evaluate('window.meta');

  const grab = async (t, i) => {
    await page.evaluate(([t, i]) => window.renderAt(t, i), [t, i]);
    const b64 = await page.evaluate('window.grabB64()');
    return Buffer.from(b64, 'base64');
  };

  if (args.poster) {
    await page.evaluate(() => window.renderPoster());
    const b64 = await page.evaluate('window.grabB64()');
    const buf = Buffer.from(b64, 'base64');
    await new Promise((res, rej) => {
      const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', '-frames:v', '1', '-q:v', '2', args.poster]);
      ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg ' + c))));
      ff.stdin.end(buf);
    });
    console.log('封面', args.poster);
  } else if (args.stills) {
    const dir = args.stilldir || 'stills';
    fs.mkdirSync(dir, { recursive: true });
    for (const s of args.stills.split(',')) {
      const t = parseFloat(s);
      const buf = await grab(t, Math.round(t * fps));
      const out = path.join(dir, `t${t.toFixed(2).padStart(6, '0')}.png`);
      await new Promise((res, rej) => {
        const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-i', '-', '-frames:v', '1', out]);
        ff.on('close', (c) => (c === 0 ? res() : rej(new Error('ffmpeg ' + c))));
        ff.stdin.end(buf);
      });
      console.log('静帧', out);
    }
  } else {
    const from = parseFloat(args.from || '0');
    const to = parseFloat(args.to || String(meta.duration));
    const f0 = Math.round(from * fps), f1 = Math.round(to * fps);
    const out = args.out || 'out.mp4';
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-s', `${W}x${H}`, '-r', String(fps), '-i', '-',
      '-c:v', 'libx264', '-preset', args.preset || 'medium', '-crf', args.crf || '8', '-pix_fmt', 'yuv420p', '-color_primaries', 'bt709', '-color_trc', 'bt709', '-colorspace', 'bt709', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let i = f0; i < f1; i++) {
      const buf = await grab(i / fps, i);
      await writeAsync(ff.stdin, buf);
      if ((i - f0) % 30 === 29) {
        const el = (Date.now() - t0) / 1000, per = el / (i - f0 + 1);
        console.log(`帧 ${i + 1 - f0}/${f1 - f0}  ${per.toFixed(2)} 秒/帧  还要约 ${Math.round(per * (f1 - i - 1))} 秒`);
      }
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
    console.log('写出', out, `${((Date.now() - t0) / 1000).toFixed(0)} 秒`);
  }
  await browser.close();
  srv.close();
})().catch((e) => { console.error(e); process.exit(1); });
