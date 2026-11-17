// 出图。
//   node render.cjs sheet out.png 列数 t1 t2 …      预览拼图（每格 480×270，左上角写时刻）
//   node render.cjs still out.png t                  和成片同一条流水线的单帧（1920×1080）
//   node render.cjs cover out.png                    封面
//   node render.cjs video 起始帧 结束帧 out.mkv [fps] 逐帧渲染（无损 FFV1，480×540：上画面、下光晕）
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const { spawn, spawnSync } = require('child_process');
const fs = require('fs'), path = require('path');
const FILTER = "split=3[a][b][c];[a]crop=480:270:0:0,scale=1920:1080:flags=neighbor,format=gbrp[p];[b]crop=480:270:0:270,gblur=sigma=2.2,scale=1920:1080:flags=bicubic,format=gbrp[g1];[c]crop=480:270:0:270,gblur=sigma=8,scale=1920:1080:flags=bicubic,format=gbrp[g2];[p][g1]blend=all_mode=screen:all_opacity=0.8[q];[q][g2]blend=all_mode=screen:all_opacity=0.55,vignette=a=PI/7";
(async () => {
  const [mode, ...a] = process.argv.slice(2);
  if (mode === 'filter') { console.log(FILTER); return; }
  const b = await chromium.launch(), p = await b.newPage({ viewport: { width: 500, height: 560 } });
  let errs = 0; p.on('console', m => { if (m.type() === 'error') { errs++; if (errs < 8) console.log('PAGE ERROR', m.text()); } }); p.on('pageerror', e => { errs++; if (errs < 8) console.log('PAGE ERROR', e.message, (e.stack || '').split('\n')[1] || ''); });
  await p.goto('file://' + path.join(__dirname, 'index.html')); await p.waitForFunction('window.READY', null, { timeout: 60000 });
  const png = d => Buffer.from(d.split(',')[1], 'base64');
  if (mode === 'sheet') {
    const out = a[0], cols = +a[1], ts = a.slice(2).map(Number), dir = fs.mkdtempSync('/tmp/claude-0/sheet');
    for (let i = 0; i < ts.length; i++) { let d; try { d = await p.evaluate(t => prev(t), ts[i]); } catch (e) { console.log('ERR t=' + ts[i], String(e.message).split('\n')[0]); d = await p.evaluate(() => { PRE.fillStyle = '#400'; PRE.fillRect(0, 0, 480, 270); return PRE.canvas.toDataURL(); }); } fs.writeFileSync(path.join(dir, String(i).padStart(4, '0') + '.png'), png(d)); }
    const rows = Math.ceil(ts.length / cols);
    const lab = ts.map((t, i) => `drawtext=text='${t.toFixed(2)}':x=${(i % cols) * 484 + 4}:y=${Math.floor(i / cols) * 274 + 4}:fontsize=14:fontcolor=yellow:box=1:boxcolor=black@0.6`).join(',');
    const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-framerate', '1', '-i', path.join(dir, '%04d.png'), '-vf', `tile=${cols}x${rows}:padding=4:color=0x202020,${lab}`, '-frames:v', '1', out]); if (r.status) console.log(String(r.stderr));
    fs.rmSync(dir, { recursive: true }); console.log('→', out);
  } else if (mode === 'still' || mode === 'cover') {
    const d = mode === 'cover' ? await p.evaluate(() => grabCover()) : await p.evaluate(t => grab(t), +a[1]); const r = spawnSync('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-c:v', 'png', '-i', '-', '-vf', FILTER, '-frames:v', '1', a[0]], { input: png(d) }); if (r.status) console.log(String(r.stderr)); console.log('→', a[0]);
  } else if (mode === 'video') {
    const f0 = +a[0], f1 = +a[1], out = a[2], fps = +(a[3] || 30), t0 = Date.now();
    const ff = spawn('ffmpeg', ['-v', 'error', '-y', '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'png', '-i', '-', '-c:v', 'libx264rgb', '-qp', '0', '-preset', 'veryfast', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    for (let f = f0; f < f1; f++) { const d = await p.evaluate(t => grab(t), f / fps); if (!ff.stdin.write(png(d))) await new Promise(r => ff.stdin.once('drain', r)); if ((f - f0) % 300 === 0) console.log('frame', f, ((Date.now() - t0) / 1000).toFixed(0) + 's'); }
    ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('done in', ((Date.now() - t0) / 1000).toFixed(0) + 's', 'errors', errs);
  }
  await b.close();
})();
