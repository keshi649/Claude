// 封面：开头画面的标题 + 摆好的一场团战（中路蓝方一塔前，两边各五个，小兵在打，箭和火球在飞），定格截图。
// 用法：node test/cover.js 输出.png
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const out = process.argv[2] || 'cover.png';
  const html = fs.readFileSync(path.join(__dirname, '..', '小怪峡谷.html'), 'utf8');
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1280, height: 720 }, deviceScaleFactor: 1.5 });
  await page.setContent('<!doctype html><html><head><meta charset="utf-8"></head><body>' + html + '</body></html>');
  await page.waitForSelector('#title:not([hidden])', { timeout: 30000 });
  await page.evaluate(() => { R.targetH = 190; layout(); });
  await page.evaluate(() => {
    const D = newWorld({ blue: ['warrior', 'tank', 'mage', 'marksman', 'support'], red: ['assassin', 'warrior', 'mage', 'marksman', 'tank'], player: -1, diff: 1, seed: 777 });
    for (let i = 0; i < 64 * 30; i++) { step(D, 1 / 30); D.ev.length = 0; }
    // 中路：蓝方一塔 (1934,2924) 往河道方向一点
    const cx = 2180, cy = 2780;
    const place = (h, x, y, f) => { h.x = x; h.y = y; h.dead = false; h.cmd = {}; h.path = null; addXp(D, h, 2200); h.hp = h.maxHp * (0.55 + Math.random() * 0.4); h.sk.forEach(s => s.cd = 0); h.face = f; h.recall = 0; };
    const B = D._heroes.filter(h => h.team === 0), Rr = D._heroes.filter(h => h.team === 1);
    const bp = [[-40, 30], [-10, -70], [-230, -10], [-250, 90], [-150, 120]], rp = [[150, -60], [120, 60], [330, -120], [360, 20], [200, -10]];
    B.forEach((h, i) => place(h, cx + bp[i][0], cy + bp[i][1], 1));
    Rr.forEach((h, i) => place(h, cx + rp[i][0], cy + rp[i][1], -1));
    D.units = D.units.filter(u => u.kind !== 'minion');
    relink(D);
    // 两边各一排小兵
    for (let i = 0; i < 4; i++) { const m = spawnMinion(D, 0, 1, i < 2 ? 'melee' : 'ranged', 0); m.x = cx - 60 + i * 30 - (i > 1 ? 120 : 0); m.y = cy + 135 - i * 18; m.face = 1; }
    for (let i = 0; i < 4; i++) { const m = spawnMinion(D, 1, 1, i < 2 ? 'melee' : 'ranged', 0); m.x = cx + 120 + i * 30 + (i > 1 ? 120 : 0); m.y = cy + 100 - i * 18; m.face = -1; }
    relink(D);
    const by = (team, hid) => D._heroes.find(h => h.team === team && h.hid === hid);
    R.fxs.length = 0; R.parts.length = 0;
    castSkill(D, by(0, 'marksman'), 0, cx + 300, cy - 30, null);
    castSkill(D, by(1, 'marksman'), 0, cx - 300, cy + 40, null);
    castSkill(D, by(0, 'mage'), 0, cx + 330, cy - 120, null);
    castSkill(D, by(1, 'mage'), 0, cx - 250, cy + 60, null);
    castSkill(D, by(0, 'warrior'), 0, 0, 0, null);
    castSkill(D, by(0, 'tank'), 0, cx + 200, cy - 70, null);
    for (let i = 0; i < 12; i++) { step(D, 1 / 60); handleEvents(D, null, true); }
    for (const h of D._heroes) h.cmd = {};
    G.demo = D; G.demoCam = by(0, 'warrior'); G.freeze = true;
    R.peek = [cx + 60, cy - 70];
  });
  await page.addStyleTag({ content: '.menu, .credit { visibility: hidden !important } #title { justify-content: flex-start !important; padding-top: 26px !important; background: linear-gradient(rgba(14,11,22,0.55), rgba(14,11,22,0) 34%) !important } .logo .l1 { font-size: 96px !important } .logo .l2 { font-size: 24px !important; margin-top: 12px !important } #title::after { content: "甜菜 出品"; position: absolute; right: 28px; bottom: 20px; font-size: 24px; color: #F4F1EA; text-shadow: 2px 2px 0 #1A121E }' });
  await page.evaluate(() => { G.freeze = false; });
  await page.waitForTimeout(300);
  await page.evaluate(() => { G.freeze = true; for (const u of G.demo.units) u.flashT = -9; });
  await page.waitForTimeout(200);
  await page.screenshot({ path: out });
  await browser.close();
})();
