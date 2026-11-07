// 用法：node render.mjs [页面名…]   不给名字就渲染全部
// 每页 1080×1920（竖屏视频原尺寸），等字体加载完、页面把 window.__done 设成 true 再截图。
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.dirname(fileURLToPath(import.meta.url));
const OUT = path.resolve(ROOT, '..');
const PAGES = {
  blueprint: '01-蓝图拆解',
  ink: '02-水墨国风',
  micro: '03-微观发光',
  iso: '04-等距剖面',
  editorial: '05-杂志信息图',
  paper: '06-剪纸分层',
  space: '07-电影感宇宙',
  riso: '08-孔版颗粒插画',
  sheet: '00-总览',
};
// 总览图要给人看，用 2 倍像素；样张本身就是 1080×1920 的视频画面，用 1 倍
const VIEW = { sheet: { width: 1560, height: 1640, deviceScaleFactor: 2 } };
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.woff2': 'font/woff2', '.woff': 'font/woff', '.png': 'image/png', '.svg': 'image/svg+xml' };

const server = http.createServer((req, res) => {
  const u = decodeURIComponent(new URL(req.url, 'http://x').pathname);
  const base = u.startsWith('/out/') ? OUT : ROOT;
  const p = path.join(base, u.startsWith('/out/') ? u.slice(5) : u);
  if (!p.startsWith(base) || !fs.existsSync(p) || fs.statSync(p).isDirectory()) { res.writeHead(404); return res.end(); }
  res.writeHead(200, { 'Content-Type': TYPES[path.extname(p)] || 'application/octet-stream' });
  fs.createReadStream(p).pipe(res);
});
await new Promise(r => server.listen(0, '127.0.0.1', r));
const port = server.address().port;

const names = process.argv.slice(2).length ? process.argv.slice(2) : Object.keys(PAGES);   // sheet 放在最后，用的是前面刚出的图
const browser = await chromium.launch({ args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader', '--ignore-gpu-blocklist'] });
for (const name of names) {
  const v = VIEW[name] || { width: 1080, height: 1920, deviceScaleFactor: 1 };
  const page = await browser.newPage({ viewport: { width: v.width, height: v.height }, deviceScaleFactor: v.deviceScaleFactor });
  page.on('console', m => console.log(`[${name}] ${m.text()}`));
  let pageErr = null;
  page.on('pageerror', e => { pageErr = e; console.log(`[${name}] 页面错误: ${e.message}`); });
  const t0 = Date.now();
  await page.goto(`http://127.0.0.1:${port}/${name}.html`);
  await page.evaluate(() => document.fonts.ready);
  // 页面报错就别干等了
  const t1 = Date.now();
  while (!(await page.evaluate(() => window.__done === true))) {
    if (pageErr) throw new Error(`${name} 页面出错：${pageErr.message}`);
    if (Date.now() - t1 > 300000) throw new Error(`${name} 超时`);
    await new Promise(r => setTimeout(r, 200));
  }
  const file = path.join(OUT, `${PAGES[name] || name}.png`);
  await page.screenshot({ path: file, timeout: 180000 });
  console.log(`${name} → ${file}  (${((Date.now() - t0) / 1000).toFixed(1)} s)`);
  await page.close();
}
await browser.close();
server.close();
