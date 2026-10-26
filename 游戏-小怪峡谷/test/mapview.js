// 地图草图：node test/mapview.js 输出.png —— 画出墙、草丛、兵线、塔、野怪，看布局
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const out = process.argv[2] || 'map.png';
  const data = fs.readFileSync(path.join(__dirname, '../src/data.js'), 'utf8');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1000, height: 1000 } });
  await page.setContent(`<canvas id=c width=1000 height=1000></canvas><script>${data}
  const g = c.getContext('2d'), S = 1000 / L;
  g.fillStyle = '#4a7a3a'; g.fillRect(0, 0, 1000, 1000);
  // 可走 / 不可走（按格子）
  for (let j = 0; j < GN; j++) for (let i = 0; i < GN; i++) {
    const x = (i + .5) * CELL, y = (j + .5) * CELL, d = wallDist(x, y);
    if (d < 0) { g.fillStyle = '#1f3a1a'; g.fillRect(i * CELL * S, j * CELL * S, CELL * S + .5, CELL * S + .5); }
    else if (d < INFL) { g.fillStyle = '#2f5a28'; g.fillRect(i * CELL * S, j * CELL * S, CELL * S + .5, CELL * S + .5); }
    else if (Math.abs(x - y) < 255) { g.fillStyle = '#3f7fb0'; g.fillRect(i * CELL * S, j * CELL * S, CELL * S + .5, CELL * S + .5); }
    if (d >= 0 && bushAt(x, y)) { g.fillStyle = 'rgba(150,220,60,.7)'; g.fillRect(i * CELL * S, j * CELL * S, CELL * S + .5, CELL * S + .5); }
  }
  g.lineWidth = 2; g.strokeStyle = 'rgba(230,200,140,.8)';
  for (const ln of LANES) { g.beginPath(); ln.forEach((p, k) => k ? g.lineTo(p[0] * S, p[1] * S) : g.moveTo(p[0] * S, p[1] * S)); g.stroke(); }
  const dot = (p, r, col) => { g.fillStyle = col; g.beginPath(); g.arc(p[0] * S, p[1] * S, r, 0, 7); g.fill(); };
  for (const team of [0, 1]) {
    const f = team ? mir : (p => p), col = team ? '#ff5050' : '#4da6ff';
    dot(f(SPRING), SPRING_R * S, team ? 'rgba(255,80,80,.3)' : 'rgba(77,166,255,.3)');
    dot(f(CRYSTAL), 9, col);
    for (const ln of TOWERS) for (const t of ln) { dot(f(t), 6, col); g.strokeStyle = col; g.lineWidth = 1; g.beginPath(); g.arc(f(t)[0] * S, f(t)[1] * S, 470 * S, 0, 7); g.stroke(); }
    for (const c of CAMPS_BLUE) dot(f(c.p), 6, c.type === 'red' ? '#ff9040' : c.type === 'blue' ? '#40c0ff' : '#e0e0a0');
  }
  for (const d of DRAGONS) dot(d.p, 10, '#c040ff');
  g.fillStyle = '#fff'; g.font = '12px sans-serif';
  for (const c of CAMPS_BLUE) g.fillText(c.type, c.p[0] * S + 8, c.p[1] * S);
  </script>`);
  await page.screenshot({ path: out });
  await browser.close();
})();
