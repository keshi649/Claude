'use strict';
/* scenes2.js：先说挖（人类最深的洞才 12 公里，镜头一拉远，连地球半径的 0.2% 都不到）→ 再往下越来越烫，地心约 6000 度，
   跟太阳表面差不多 →"你"穿上防火服 → 往下掉（隧道的洞壁按深度换颜色，越掉越快，过了地心越来越慢，38 分钟后在阿根廷冒出头）
   → 没抓住洞口又掉回去：真空里会在两边来回掉，永远停不下来。 */

/* ================= 先说挖 ================= */
function dig(g, t) {
  if (t < S('n2') - .15) { digRecord(g, t); return; }
  digHeat(g, t);
}
/* 地面的剖面：上面是天和钻井，下面一层层的土石；钻杆往下钻，深度一路数到 12 公里；然后镜头拉远，变成地球半径的一把大尺子 */
function digRecord(g, t) {
  const tz = CH('n1', 3) - .25;                           // 镜头拉远的时刻（"连地球半径的"）
  const z = E.io(clamp((t - tz) / .9));
  if (z < 1) {
    withAlpha(g, 1 - z, () => {
      const sky = g.createLinearGradient(0, 0, 0, 520); sky.addColorStop(0, '#7FB6EA'); sky.addColorStop(1, '#D8ECFA'); g.fillStyle = sky; g.fillRect(0, 0, W, 520);
      for (let i = 0; i < 3; i++) { const x = ((i * 380 + t * 25) % 1400) - 200; pixOval(g, x, 160 + i * 70, 80, 16, 5, '#FFFFFF'); }
      const strata = ['#6B4630', '#7A5236', '#8C6440', '#6A5A50', '#5A4A44', '#4A3A3A', '#3A2E34'];
      strata.forEach((c, i) => { g.fillStyle = c; g.fillRect(0, 520 + i * 200, W, 200); for (let j = 0; j < 30; j++) { g.fillStyle = shadeOf(c, 1.15); g.fillRect(Math.round(hash(i, j) * W / 5) * 5, 530 + i * 200 + Math.round(hash(j, i) * 180 / 5) * 5, 15, 5); } });
      g.fillStyle = '#5AA640'; g.fillRect(0, 505, W, 20);
      drillRig(g, 480, 505, 5, t);
      const dd = clamp((t - CH('n1', 1) + .2) / 1.6), depthPx = dd * 1300;
      g.fillStyle = '#C9CED8'; g.fillRect(474, 525, 12, depthPx); glow(g, 480, 525 + depthPx, 60, 'rgba(255,200,120,.5)');
      g.fillStyle = '#FFD34E'; g.fillRect(468, 525 + depthPx, 24, 16);
      ptext(g, (dd * 12.262).toFixed(1) + ' 公里', 540, 540 + depthPx, 48, C.white, { ol: C.ink, olw: 6 });
      popTag(g, t, S('n1') + .05, 480, 300, '人类挖过最深的洞', 44, { fill: C.gold });
    });
  }
  if (z > 0) {
    withAlpha(g, z, () => {
      spaceBG(g, t, { sun: false });
      const cx = 480, cy = 2000, R = 1500;                  // 只露出地球的上半截
      earthCut(g, cx, cy, R, t);
      // 半径的一把尺子
      g.fillStyle = '#FFFFFF'; g.fillRect(900, cy - R, 10, R - 640);
      for (let y = cy - R; y < 1400; y += 60) g.fillRect(870, y, 40, 5);
      ptext(g, '地球半径', 880, 1200, 36, C.white, { align: 'right', ol: C.ink, olw: 4 });
      ptext(g, '6371 公里', 880, 1250, 48, C.gold, { align: 'right', ol: C.ink, olw: 6 });
      // 那个最深的洞：地表上细细一道
      g.fillStyle = '#FF5A4F'; g.fillRect(476, cy - R, 8, 12); glow(g, 480, cy - R + 6, 40, 'rgba(255,90,80,.8)');
      pixArrow(g, 300, cy - R - 160, 470, cy - R - 10, 8, '#FF5A4F', clamp((t - tz - .3) / .3));
      ptext(g, '12 公里', 280, cy - R - 190, 44, '#FF8A80', { align: 'center', ol: C.ink, olw: 5 });
      if (t > EN('n1') - .05) bigStamp(g, t, EN('n1') - .05, 480, 760, '不到 0.2%', { px: 72 });   // 这句念完再盖（盖章声不压字）
    });
  }
  source(g, '最深的洞：科拉超深钻孔，1989 年钻到 12262 米', 880, 1250 - (z > .5 ? 120 : 0), { col: z > .5 ? '#8A93B8' : '#F4E9D8' });
}
/* 地球的半剖面：一根探针从地表往地心走，右边温度计一路往上涨；到了地心，旁边一个太阳："跟太阳表面差不多" */
function digHeat(g, t) {
  spaceBG(g, t, { sun: false });
  const t0 = S('n2') - .15, cx = 330, cy = 1060, R = 520;
  earthCut(g, cx, cy, R, t);
  // 探针：从地表往地心
  const u = E.io(clamp((t - CH('n2', 1) + .2) / ((CH('n2', 3) - CH('n2', 1)) + .3)));
  const px = cx, py = cy - R + u * R;
  g.fillStyle = '#FFFFFF'; g.fillRect(px - 3, cy - R - 20, 6, u * R + 20);
  pixOval(g, px, py, 14, 14, 5, '#FFFFFF'); glow(g, px, py, 70, 'rgba(255,255,255,.5)');
  // 温度计（右边）：按深度插值
  const temps = [[0, 15], [.03, 500], [.45, 3700], [.55, 4400], [.81, 5300], [1, 6000]];
  let T = 15; for (let i = 0; i < temps.length - 1; i++) { const [a, ta] = temps[i], [b2, tb] = temps[i + 1]; if (u >= a && u <= b2) T = lerp(ta, tb, (u - a) / (b2 - a)); }
  const tx = 860, ty0 = 360, th = 760;
  g.fillStyle = C.ink; g.fillRect(tx - 34, ty0 - 10, 68, th + 20); pixOval(g, tx, ty0 + th + 40, 60, 60, 5, C.ink);
  g.fillStyle = '#F4F4F4'; g.fillRect(tx - 22, ty0, 44, th);
  const fh = Math.round(th * clamp(T / 6200) / 5) * 5;
  g.fillStyle = mixHex('#FF8A3D', '#FF3A2A', T / 6000); g.fillRect(tx - 22, ty0 + th - fh, 44, fh); pixOval(g, tx, ty0 + th + 40, 48, 48, 5, mixHex('#FF8A3D', '#FF3A2A', T / 6000));
  if (T > 3000) glow(g, tx, ty0 + th - fh, 80, `rgba(255,120,60,${(T - 3000) / 6000})`);
  ptext(g, Math.round(T / 10) * 10 + ' 度', tx - 50, ty0 + th - fh + 20, 48, C.white, { align: 'right', ol: C.ink, olw: 6 });
  popTag(g, t, t0 + .05, 480, 250, '越往下越烫', 44, { fill: '#FFC2BE' });
  // 地心约 6000 度：旁边一个太阳
  if (t > CH('n2', 4) - .3) {
    const p = pop(t, CH('n2', 4) - .3, .4);
    g.save(); g.translate(600, 560); g.scale(p, p);
    glow(g, 0, 0, 200, 'rgba(255,200,90,.7)');
    pixOval(g, 0, 0, 90, 90, 5, '#FFC93C'); pixOval(g, -6, -6, 74, 74, 5, '#FFE066');
    for (let i = 0; i < 12; i++) { const a = i * TAU / 12 + t * .5; g.fillStyle = '#FFC93C'; g.fillRect(Math.round(Math.cos(a) * 120 / 5) * 5, Math.round(Math.sin(a) * 120 / 5) * 5, 20, 20); }
    ptext(g, '≈ 太阳表面', 0, 190, 44, '#FFE9A8', { align: 'center', ol: C.ink, olw: 5 });
    g.restore();
  }
  source(g, '地心温度：Anzellini 等 2013（《科学》）', 880, 1250, { col: '#8A93B8' });
  dialogBox(g, t, 'd2', PORTRAIT.youFire);
}

/* ================= 往下掉 ================= */
function fall(g, t) {
  if (t < S('f2') - .15) { fallDown(g, t, 'down'); return; }
  if (t < CH('f2', 3) - .3) { fallDown(g, t, 'up'); return; }
  if (t < S('f3') - .15) { fallExit(g, t); return; }
  fallSwing(g, t);
}
/* 隧道里往下掉：过地心以前越来越快，过了地心越来越慢（翻个身，头朝出口） */
function fallDown(g, t, phase) {
  const tA = SS('fall'), tC = S('f2') - .15, tE = CH('f2', 3) - .3;
  // d：0 地表 → 1 地心 → 回到 0（另一边的地表）；按简谐运动算，越靠近地心越快
  let d, v;
  if (phase === 'down') { const u = clamp((t - tA) / (tC - tA)); d = 1 - Math.cos(u * Math.PI / 2); v = Math.sin(u * Math.PI / 2); }
  else { const u = clamp((t - tC) / (tE - tC)); d = Math.cos(u * Math.PI / 2); v = Math.cos(u * Math.PI / 2); }
  tunnelBG(g, t, d, 300 + v * 2400);
  // 掉下去的"你"（防火服），过了地心翻个身
  const k = 10, cx = 480 + Math.sin(t * 5) * 20, cy = 900;
  g.save(); g.translate(cx, cy);
  if (phase === 'up') g.rotate(Math.PI);
  crabAt(g, 0, 160, k, youO(t, { firesuit: true, arms: 'up', eyes: 'wide', mouth: 'o' }));
  g.restore();
  // 右边的深度条：地表 → 地心 → 地表
  const bx = 850, by0 = 320, bh = 820;          // 深度条：右边框在 x 900 以内（右侧按钮区从 930 开始）
  g.fillStyle = 'rgba(10,8,24,.7)'; g.fillRect(bx - 50, by0 - 60, 100, bh + 120);
  [['#5A8A3E', 0, .03], ['#C7442A', .03, .45], ['#F28C28', .45, .81], ['#FFE07A', .81, 1]].forEach(([c, a, b2]) => { g.fillStyle = c; g.fillRect(bx - 16, by0 + a * bh / 2, 32, (b2 - a) * bh / 2 + 1); g.fillRect(bx - 16, by0 + bh - b2 * bh / 2, 32, (b2 - a) * bh / 2 + 1); });
  const my = phase === 'down' ? by0 + d * bh / 2 : by0 + bh - d * bh / 2;
  g.fillStyle = '#FFFFFF'; g.fillRect(bx - 34, Math.round(my) - 5, 68, 10);
  ptext(g, '你家', bx, by0 - 20, 28, C.white, { align: 'center' }); ptext(g, '地心', bx - 40, by0 + bh / 2 + 10, 28, '#FFE07A', { align: 'right' }); ptext(g, '对面', bx, by0 + bh + 50, 28, C.white, { align: 'center' });
  // 计时（按 38 分钟走）
  const tt = phase === 'down' ? clamp((t - tA) / (tC - tA)) * 19.1 : 19.1 + clamp((t - tC) / (tE - tC)) * 18.9;
  ptext(g, String(Math.floor(tt)).padStart(2, '0') + ':' + String(Math.floor((tt % 1) * 60)).padStart(2, '0'), 120, 320, 72, C.white, { ol: C.ink, olw: 6 });
  ptext(g, '分 : 秒', 120, 370, 28, '#CFC6E8');
  if (phase === 'down') {
    popTag(g, t, CH('f1', 2) - .2, 420, 1180, '越掉越快', 40, { fill: '#FFC2BE' });
  } else {
    popTag(g, t, S('f2') + .2, 420, 1180, '越来越慢', 40, { fill: '#9FD3FF' });
  }
}
/* 阿根廷的清晨，草原上一个洞口，"你"冒出头；奶牛们围过来看 */
function fallExit(g, t) {
  const b = pbuf('pampas', 216, 384);
  pampasBG(b, t);
  blit(g, 'pampas', 5);
  glow(g, 750, 1230, 420, 'rgba(255,200,120,.4)');                       // 朝阳
  const t0 = CH('f2', 3) - .3, hx = 480, hy = 1150;
  pixOval(g, hx, hy + 10, 190, 50, 5, '#3A2414'); pixOval(g, hx, hy, 170, 42, 5, '#0A0612'); glow(g, hx, hy, 160, 'rgba(255,120,60,.35)');
  // 冒出头
  const up = E.back(clamp((t - t0 - .1) / .5));
  g.save(); g.beginPath(); g.rect(hx - 200, 0, 400, hy + 10); g.clip();
  crabAt(g, hx, hy + 180 - up * 220, 10, youO(t, { firesuit: true, arms: 'upR', eyes: 'happy', mouth: 'smile' }));
  g.restore();
  sparkBurst(g, hx, hy - 60, t, t0 + .4, { r: 220 });
  // 奶牛
  for (const [x, y, f] of [[150, 1110, false], [820, 1090, true], [700, 1160, true]]) {
    g.save(); g.imageSmoothingEnabled = false;
    if (f) { g.translate(x + 220, y); g.scale(-1, 1); g.drawImage(COW(), 0, 0, 220, 120); } else g.drawImage(COW(), x, y, 220, 120);
    g.restore();
  }
  popText(g, t, EN('f2'), SE('fall') + 1, '哞？', 860, 1020, 44, '#FFFFFF', { olw: 5 });
  popTag(g, t, t0 + .2, 480, 300, '38 分钟后：阿根廷', 48, { fill: C.gold });
  ptext(g, '你家是傍晚，这边正是清晨', 480, 380, 32, '#FFFFFF', { align: 'center', ol: C.ink, olw: 3 });
  source(g, '掉过去的时间：Klotz 2015（《美国物理杂志》）', 880, 1250, { col: '#8A93B8' });
}
/* 没抓住洞口，又掉回去：地球剖面上一条竖的隧道，"你"在两头之间来回 */
function fallSwing(g, t) {
  spaceBG(g, t);
  const cx = 480, cy = 880, R = 420, t0 = S('f3') - .15;
  earthCut(g, cx, cy, R, t);
  g.fillStyle = '#0A0612'; g.fillRect(cx - 18, cy - R - 10, 36, 2 * R + 20);
  for (let y = cy - R; y < cy + R; y += 30) { g.fillStyle = 'rgba(255,255,255,.12)'; g.fillRect(cx - 18, y, 36, 4); }
  placeTag(g, cx + 140, cy - R + 10, '你家', C.gold, { px: 32 });
  // 出口在下面：标签放在出口右边、字幕上方（放在出口下面会压到字幕）
  g.fillStyle = C.ink; g.fillRect(cx + 18, cy + R - 35, 62, 6);
  ptag(g, cx + 84, cy + R - 32, '阿根廷', 32, { fill: '#B8F0C8', align: 'left' });
  // 来回掉：一来一回 3 秒（示意）
  const ph = ((t - t0) / 3) * TAU, y = cy + Math.cos(ph) * (R - 30);
  crabAt(g, cx, y + 70, 5, youO(t, { firesuit: true, arms: 'up', eyes: 'wide' }));
  pixArrow(g, cx - 120, cy - 200, cx - 120, cy + 200, 8, C.gold, 1); pixArrow(g, cx + 120, cy + 200, cx + 120, cy - 200, 8, C.gold, 1);
  ptext(g, '一趟 38 分钟', 140, cy + 20, 36, C.white, { ol: C.ink, olw: 4 });
  popTag(g, t, CH('f3', 2) - .2, 480, 260, '要是洞里是真空', 40, { fill: '#D3D0DE' });
  if (t > EN('f3') - .05) bigStamp(g, t, EN('f3') - .05, 480, 1150, '停不下来', { px: 72, rot: -.06 });
}
