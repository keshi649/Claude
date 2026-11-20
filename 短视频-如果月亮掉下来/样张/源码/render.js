// 出样张：本地静态服务 → 无头 Chromium（SwiftShader 软件 WebGL2）→ 每个镜头存一张 PNG。
// 用法：node render.js A1 A2 B1 [--scale 0.5] [--out ../]
const http = require('http');
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const argv = process.argv.slice(2);
const opt = { scale: 1, out: path.join(__dirname, 'out') };
const ids = [];
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--scale') opt.scale = parseFloat(argv[++i]);
  else if (argv[i] === '--out') opt.out = path.resolve(argv[++i]);
  else ids.push(argv[i]);
}
const ROOT = __dirname;
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png' };
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

(async () => {
  await new Promise((r) => srv.listen(0, '127.0.0.1', r));
  const browser = await chromium.launch({ args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--disable-gpu-sandbox', '--disable-gpu-watchdog', '--js-flags=--max-old-space-size=4096'] });
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 } });
  page.on('console', (m) => { if (m.type() === 'error' || m.type() === 'warning') console.log('[page]', m.text()); });
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(`http://127.0.0.1:${srv.address().port}/index.html`);
  await page.waitForFunction('window.ready === true', null, { timeout: 60000 });
  const list = ids.length ? ids : await page.evaluate('window.shotIds');
  fs.mkdirSync(opt.out, { recursive: true });
  for (const id of list) {
    try {
      const ms = await page.evaluate(([id, s]) => window.renderShot(id, s), [id, opt.scale]);
      const b64 = await page.evaluate('window.grabPNG()');
      const file = path.join(opt.out, `${id}${opt.scale === 1 ? '' : '_' + opt.scale}.png`);
      fs.writeFileSync(file, Buffer.from(b64, 'base64'));
      console.log(`${id}  ${ms} ms  →  ${file}`);
    } catch (e) {
      console.log(`${id} 失败：`, e.message);
    }
  }
  await browser.close();
  srv.close();
})();
