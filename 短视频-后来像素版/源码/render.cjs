// 用法：
//   node render.cjs preview <t1,t2,...> <outdir>                  渲染若干时间点的单帧 PNG
//   node render.cjs cover <t> <out.jpg>                           封面：不画歌词，大字片名
//   node render.cjs probe <t1,t2,...>                             只算不存，打印每帧耗时
//   node render.cjs video <startFrame> <endFrame> <out.mp4> [fps]  渲染一段视频（不含声音）
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn } = require('child_process');
const { chromium } = require('playwright');

const ROOT = __dirname;
const TYPES = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.woff2': 'font/woff2', '.ttf': 'font/ttf' };

function serve() {
  return new Promise(res => {
    const srv = http.createServer((req, rsp) => {
      const p = path.join(ROOT, decodeURIComponent(req.url.split('?')[0]));
      if (!p.startsWith(ROOT) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { rsp.writeHead(404); rsp.end(); return; }
      rsp.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
      fs.createReadStream(p).pipe(rsp);
    });
    srv.listen(0, '127.0.0.1', () => res(srv));
  });
}

async function open(srv) {
  const browser = await chromium.launch({ args: ['--disable-gpu', '--font-render-hinting=none'] });
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', e => { console.error('PAGE ERROR', e); process.exitCode = 1; });
  page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') console.error('console:', m.text()); });
  await page.goto(`http://127.0.0.1:${srv.address().port}/${process.env.PAGE || 'index.html'}`);
  await page.waitForFunction('window.READY === true', null, { timeout: 60000 });
  return { browser, page };
}

(async () => {
  const [mode, a, b, c, d] = process.argv.slice(2);
  const srv = await serve();
  const { browser, page } = await open(srv);
  if (mode === 'preview') {
    const times = a.split(',').map(Number);
    fs.mkdirSync(b, { recursive: true });
    for (const t of times) {
      const url = await page.evaluate(t => { window.frame(t); return document.getElementById('c').toDataURL('image/png'); }, t);
      const f = path.join(b, `t${t.toFixed(2).padStart(6, '0')}.png`);
      fs.writeFileSync(f, Buffer.from(url.split(',')[1], 'base64'));
      console.log(f);
    }
  } else if (mode === 'cover') {
    const url = await page.evaluate(t => { window.COVER = true; window.frame(t); return document.getElementById('c').toDataURL('image/jpeg', 0.95); }, Number(a));
    fs.writeFileSync(b, Buffer.from(url.split(',')[1], 'base64'));
    console.log(b);
  } else if (mode === 'probe') {
    for (const t of a.split(',').map(Number)) {
      const ms = await page.evaluate(t => { const t0 = performance.now(); window.frame(t); return performance.now() - t0; }, t);
      console.log(`t=${t}  ${ms.toFixed(0)} ms`);
    }
  } else if (mode === 'video') {
    const fps = Number(d || 30), f0 = Number(a), f1 = Number(b);
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-',
      '-c:v', 'libx264', '-preset', 'medium', '-crf', '14', '-pix_fmt', 'yuv420p', '-r', String(fps), c], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = f0; f < f1; f++) {
      const url = await page.evaluate(t => { window.frame(t); return document.getElementById('c').toDataURL('image/png'); }, f / fps);
      const buf = Buffer.from(url.split(',')[1], 'base64');
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if ((f - f0) % 150 === 0) console.log(`[${c}] frame ${f}/${f1}  ${((Date.now() - t0) / 1000).toFixed(0)}s`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log(`[${c}] done in ${((Date.now() - t0) / 1000).toFixed(0)}s`);
  }
  await browser.close();
  srv.close();
})().catch(e => { console.error(e); process.exit(1); });
