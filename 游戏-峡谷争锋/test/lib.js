// 测试共用：three.js 在网页里从 cdnjs 加载，测试时用 Playwright 拦下这个地址、换成本地文件（vendor/，不进仓库，没有就下载并校验 sha256）。
const fs = require('fs'), path = require('path'), crypto = require('crypto'), { execFileSync } = require('child_process');
const ROOT = path.join(__dirname, '..');
const THREE_URL = 'https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js';
const THREE_LOCAL = path.join(ROOT, 'vendor', 'three.r128.min.js');
const THREE_SHA = '9274bbcec8d96168626c732b5d31c775aa8cfb7eaa0599bec0c175908a2c1ce2';
const sha = p => crypto.createHash('sha256').update(fs.readFileSync(p)).digest('hex');
function ensureThree() {
  if (fs.existsSync(THREE_LOCAL) && sha(THREE_LOCAL) === THREE_SHA) return;
  fs.mkdirSync(path.dirname(THREE_LOCAL), { recursive: true });
  execFileSync('curl', ['-sSfL', '-o', THREE_LOCAL, THREE_URL]);
  if (sha(THREE_LOCAL) !== THREE_SHA) throw new Error('three.js 的 sha256 对不上');
}
async function launch(opt) {
  ensureThree();
  const { chromium } = require('playwright');
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const ctx = await browser.newContext(opt || {});
  await ctx.route(THREE_URL, r => r.fulfill({ body: fs.readFileSync(THREE_LOCAL), contentType: 'application/javascript' }));
  return { browser, ctx };
}
function watchErrors(page) {
  const errs = [];
  page.on('pageerror', e => errs.push('PAGEERROR ' + e.message + '\n' + (e.stack || '').split('\n').slice(0, 5).join('\n')));
  page.on('console', m => { const t = m.text(); if ((m.type() === 'error' || m.type() === 'warning') && !/willReadFrequently|GPU stall|GL Driver Message|swiftshader|Automatic fallback/i.test(t)) errs.push(m.type() + ' ' + t); });
  return errs;
}
// 把 src/ 里的几个文件拼成一张测试页（three.js 用 cdnjs 地址，被上面拦下）
function srcPage(files, body, script) {
  const js = files.map(f => fs.readFileSync(path.join(ROOT, 'src', f), 'utf8').replace(/\nif \(typeof module !== 'undefined'\) module\.exports = \{\};\n?/, '\n')).join('\n');
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<style>html,body{margin:0;height:100%;overflow:hidden;background:#000}</style>
<script src="${THREE_URL}"></script></head><body>${body || ''}<script>${js}\n${script || ''}</script></body></html>`;
}
function writeTmp(name, html) {
  const dir = path.join(require('os').tmpdir(), 'xgzf-test');
  fs.mkdirSync(dir, { recursive: true });
  const p = path.join(dir, name);
  fs.writeFileSync(p, html);
  return 'file://' + p;
}
module.exports = { ROOT, THREE_URL, launch, watchErrors, srcPage, writeTmp };
