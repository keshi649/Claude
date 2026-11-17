// 出样张：node render.cjs 1a 1b …  → ../样张/<编号>.png（1920×1080）
const { chromium } = require('/opt/node-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const ids = process.argv.slice(2);
  const b = await chromium.launch();
  for (const id of ids) {
    const p = await b.newPage({ viewport: { width: 1920, height: 1080 } });
    p.on('console', m => console.log('[' + id + ']', m.text())); p.on('pageerror', e => console.log('[' + id + '] PAGE ERROR', e.message));
    await p.goto('file://' + path.join(__dirname, 'index.html') + '?f=' + id);
    await p.waitForFunction('window.DONE', null, { timeout: 120000 });
    const d = await p.evaluate(() => document.getElementById('cv').toDataURL('image/png'));
    const out = path.join(__dirname, '..', '样张', id + '.png');
    fs.writeFileSync(out, Buffer.from(d.split(',')[1], 'base64')); console.log('→', out);
    await p.close();
  }
  await b.close();
})();
