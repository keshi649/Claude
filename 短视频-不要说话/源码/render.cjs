// 用 Playwright（Chromium）逐帧画 index.html 里的 frame(T)（T 是成片时间，秒）。
//   node render.cjs preview 0.5,18.2,75 out/pv        单帧 PNG（带歌词）
//   node render.cjs cover 6.0 ../封面.jpg             封面（不带歌词、加大字）
//   node render.cjs video 0 900 out/part0.mp4 [30]    渲染第 [0, 900) 帧，交给 ffmpeg（无损中间文件）
//   node render.cjs sfx out/sfx.json                   导出画面里的动作时刻（给 mix.py 排音效）
// 环境变量 PAGE=test.html 可以换成别的页面。
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

const W = 1920, H = 1080;
const page_ = process.env.PAGE || 'index.html';

async function open() {
  const browser = await chromium.launch({
    executablePath: fs.existsSync('/opt/pw-browsers/chromium') ? undefined : undefined,
    args: ['--disable-gpu', '--disable-accelerated-2d-canvas', '--disable-gpu-compositing', '--font-render-hinting=none'],
  });
  const page = await browser.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 1 });
  page.on('console', m => { if (m.type() === 'error' || process.env.VERBOSE) console.log('[page]', m.text()); });
  page.on('pageerror', e => { console.error('[pageerror]', e.message); });
  await page.goto('file://' + path.resolve(__dirname, page_));
  await page.waitForFunction('window.READY === true', null, { timeout: 180000 });
  return { browser, page };
}

async function grab(page, T, opts) {
  return await page.evaluate(([T, opts]) => {
    window.frame(T, opts || {});
    return document.getElementById('c').toDataURL(opts && opts.png ? 'image/png' : 'image/jpeg', 0.96);
  }, [T, opts]);
}

function b64(u) { return Buffer.from(u.slice(u.indexOf(',') + 1), 'base64'); }

(async () => {
  const [cmd, a1, a2, a3, a4] = process.argv.slice(2);
  const { browser, page } = await open();
  if (cmd === 'preview') {
    fs.mkdirSync(a2, { recursive: true });
    for (const s of a1.split(',')) {
      const T = parseFloat(s);
      const t0 = Date.now();
      const u = await grab(page, T, { png: true });
      const f = path.join(a2, `t${T.toFixed(2).padStart(7, '0')}.png`);
      fs.writeFileSync(f, b64(u));
      console.log(f, (Date.now() - t0) + 'ms');
    }
  } else if (cmd === 'cover') {
    const u = await grab(page, parseFloat(a1), { cover: true, png: false });
    fs.writeFileSync(a2, b64(u));
    console.log(a2);
  } else if (cmd === 'video') {
    const f0 = parseInt(a1), f1 = parseInt(a2), fps = parseInt(a4 || '30');
    const ff = spawn('ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'ultrafast', '-qp', '0', '-pix_fmt', 'yuv444p', a3], { stdio: ['pipe', 'inherit', 'inherit'] });
    const t0 = Date.now();
    for (let f = f0; f < f1; f++) {
      const u = await grab(page, f / fps, {});
      const ok = ff.stdin.write(b64(u));
      if (!ok) await new Promise(r => ff.stdin.once('drain', r));
      if ((f - f0) % 150 === 0) console.log(`frame ${f} (${((f - f0) / ((Date.now() - t0) / 1000 + 1e-9)).toFixed(2)} fps)`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log(`done in ${((Date.now() - t0) / 1000).toFixed(1)}s`);
  } else if (cmd === 'sfx') {
    const ev = await page.evaluate(() => window.sfxPlan ? window.sfxPlan() : []);
    fs.writeFileSync(a1, JSON.stringify(ev, null, 1));
    console.log(a1, ev.length, 'events');
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
