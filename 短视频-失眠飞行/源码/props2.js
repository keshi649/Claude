'use strict';
/* props2.js：第二遍主歌、桥段、结尾用的场景和道具。
   红线、夜里的河和桥、屋顶的蒲公英、高架桥的车流、雨伞和月虹、衣柜、起雾的窗、手机聊天界面、书桌。 */

/* 红线：沿着几个点画一条会轻轻晃的红绳，发光。u 只画到总长的多少（0..1） */
function redThread(g, s, pts, o = {}) {
  const u = o.u ?? 1, a = o.a ?? 1;
  if (u <= 0 || a <= 0) return;
  const P = pts.map(([x, y], i) => [x + Math.sin(s * 1.6 + i * 1.3) * (o.sway ?? 6) * (i && i < pts.length - 1 ? 1 : 0), y + Math.cos(s * 1.3 + i) * (o.sway ?? 6) * (i && i < pts.length - 1 ? 1 : 0)]);
  // 按长度截取
  const seg_ = []; let L = 0;
  for (let i = 1; i < P.length; i++) { const d = Math.hypot(P[i][0] - P[i - 1][0], P[i][1] - P[i - 1][1]); seg_.push(d); L += d; }
  let rem = L * u; const Q = [P[0]];
  for (let i = 1; i < P.length && rem > 0; i++) { const d = seg_[i - 1]; if (rem >= d) { Q.push(P[i]); rem -= d; } else { const f = rem / d; Q.push([lerp(P[i - 1][0], P[i][0], f), lerp(P[i - 1][1], P[i][1], f)]); rem = 0; } }
  g.save(); g.globalAlpha *= a; g.lineCap = 'round'; g.lineJoin = 'round';
  g.globalCompositeOperation = 'lighter';
  g.strokeStyle = 'rgba(255,60,90,.22)'; g.lineWidth = (o.w ?? 3) * 6; g.beginPath(); smoothPath(g, Q); g.stroke();
  g.globalCompositeOperation = 'source-over';
  g.strokeStyle = '#FF3B5C'; g.lineWidth = o.w ?? 3; g.beginPath(); smoothPath(g, Q); g.stroke();
  g.strokeStyle = 'rgba(255,200,210,.7)'; g.lineWidth = (o.w ?? 3) * .35; g.beginPath(); smoothPath(g, Q); g.stroke();
  g.restore();
  const end = Q[Q.length - 1];
  if (u < 1) glow(g, end[0], end[1], 30, '#FF6A8A', a);
  return end;
}

/* 夜里的河：两岸的楼，几座拱桥亮着灯，水里有倒影。x：镜头横移 */
function riverNight(g, s, x, o = {}) {
  const hy = o.horizon ?? 600;
  skyGrad(g, SKY.nightCity, 0, hy + 100);
  stars(g, s, x * .02, 0, .9);
  if (o.moon !== false) moon(g, o.moonX ?? 1500, o.moonY ?? 190, 80, { haloA: .6 });
  cityLayer(g, CITY.far, x * .15, hy + 10, .7);
  cityLayer(g, CITY.mid, x * .3, hy + 40, .75);
  // 水
  g.fillStyle = vgrad(g, hy + 30, H, [[0, '#1F2462'], [1, '#080A26']]); g.fillRect(-W, hy + 30, W * 3, H * 2);
  // 倒影：把城翻过来画在水里，压暗，再加几道波纹
  g.save(); g.beginPath(); g.rect(0, hy + 30, W, H - hy - 30); g.clip();
  g.translate(0, (hy + 30) * 2); g.scale(1, -1); g.globalAlpha = .3;
  cityLayer(g, CITY.mid, x * .3, hy + 40, .75);
  g.restore();
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 40; i++) { const yy = hy + 40 + hash(i, 71) * (H - hy - 40), xx = ((hash(i, 72) * W - x * .5) % W + W) % W, ww = 60 + hash(i, 73) * 200; g.fillStyle = `rgba(160,170,255,${.05 + .05 * Math.sin(s * 2 + i)})`; g.fillRect(xx, yy, ww, 2); }
  g.restore();
  if (o.moon !== false) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let y = hy + 40; y < H; y += 7) { const v = (y - hy) / (H - hy), w = 30 + v * 120 + Math.sin(y * .3 + s * 2) * 14; g.fillStyle = `rgba(255,240,200,${(.3 - v * .2) * (.6 + .4 * Math.sin(y * 1.1 + s * 3))})`; g.fillRect((o.moonX ?? 1500) - w / 2 + Math.sin(y * .1 + s) * 8, y, w, 2.5); }
    g.restore();
  }
  // 拱桥：每隔一段一座，桥上一排灯
  const bw = 1400, i0 = Math.floor(x * .6 / bw) - 1;
  for (let i = i0; i < i0 + 4; i++) {
    const bx = i * bw - x * .6 + 300, by = hy + 50;
    g.fillStyle = '#0D1030';
    g.fillRect(bx - 40, by - 70, 760, 26);
    for (let k = 0; k < 3; k++) { const ax = bx + k * 240; g.beginPath(); g.moveTo(ax, by - 44); g.quadraticCurveTo(ax + 100, by - 140 + 120, ax + 200, by - 44); g.lineTo(ax + 200, by + 40); g.lineTo(ax + 180, by + 40); g.quadraticCurveTo(ax + 100, by - 40, ax + 20, by + 40); g.lineTo(ax, by + 40); g.fill(); }
    for (let k = 0; k < 9; k++) { const lx = bx - 20 + k * 90; g.fillStyle = '#0D1030'; g.fillRect(lx - 2, by - 110, 4, 40); glow(g, lx, by - 112, 26, '#FFD08A', .85); glow(g, lx, H - (by - 112 - hy) * .6 + 40, 22, '#FFD08A', .25); }
  }
}

/* 屋顶上的蒲公英：一片小草地，吹一口，种子带着光飞走 */
function dandelion(g, x, y, k, s, blown = 0) {
  g.strokeStyle = '#3E6A52'; g.lineWidth = 3 * k; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 8 * k, y - 60 * k, x + 4 * k, y - 120 * k); g.stroke();
  const cx = x + 4 * k, cy = y - 124 * k;
  for (let i = 0; i < 18; i++) {
    const a = i / 18 * TAU, off = seg(blown, hash(i, 2) * .5, hash(i, 2) * .5 + .5);
    if (off >= 1) continue;
    const px = cx + Math.cos(a) * 22 * k + off * (300 + hash(i, 3) * 500) * k, py = cy + Math.sin(a) * 22 * k - off * (120 + hash(i, 4) * 260) * k + Math.sin(s * 3 + i) * 10 * off;
    g.strokeStyle = `rgba(240,240,255,${.7 * (1 - off)})`; g.lineWidth = 1.2; g.beginPath(); g.moveTo(off > 0 ? px - 8 * k : cx, off > 0 ? py + 4 * k : cy); g.lineTo(px, py); g.stroke();
    glow(g, px, py, 10 * k, '#F4F0FF', (1 - off) * .7);
  }
}

/* 高架桥：车灯拖成长长的光带。freeze：时间停下来（0..1），光带变成一颗颗静止的光点 */
function overpass(g, s, freeze, o = {}) {
  const ts = lerp(s, o.t0 ?? s, freeze);
  skyGrad(g, SKY.nightCity);
  stars(g, s, 300, 0, .6);
  cityLayer(g, CITY.far, 2000, 700, .8); cityLayer(g, CITY.mid, 3000, 820, .9);
  // 桥面
  g.fillStyle = '#121434'; g.beginPath(); g.moveTo(0, 620); g.quadraticCurveTo(W / 2, 560, W, 620); g.lineTo(W, 700); g.quadraticCurveTo(W / 2, 640, 0, 700); g.fill();
  for (let i = 0; i < 12; i++) { const px = i * 180 + 40; g.fillStyle = '#0C0E28'; g.fillRect(px, 690 - Math.sin(px / W * Math.PI) * 60, 30, 500); }
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 34; i++) {
    const lane = i % 2, sp = (lane ? -1 : 1) * (900 + hash(i, 4) * 700), len = lerp(260 + hash(i, 5) * 400, 18, freeze);
    const xx = (((hash(i, 6) * (W + 800) + ts * sp) % (W + 800)) + W + 800) % (W + 800) - 400;
    const yy = 625 + lane * 26 - Math.sin(xx / W * Math.PI) * 60;
    const col = lane ? '255,80,100' : '255,240,200';
    g.strokeStyle = lgrad(g, xx, yy, xx - len * Math.sign(sp), yy, [[0, `rgba(${col},.95)`], [1, `rgba(${col},0)`]]);
    g.lineWidth = 4; g.lineCap = 'round'; g.beginPath(); g.moveTo(xx, yy); g.lineTo(xx - len * Math.sign(sp), yy); g.stroke();
  }
  g.restore();
}

function umbrella(g, x, y, r, col, open = 1, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.strokeStyle = '#2A2440'; g.lineWidth = r * .05; g.beginPath(); g.moveTo(0, 0); g.lineTo(0, r * 1.15); g.arc(-r * .12, r * 1.15, r * .12, 0, Math.PI); g.stroke();
  const w = r * lerp(.25, 1, open), hgt = r * lerp(1.0, .55, open);
  g.fillStyle = col;
  g.beginPath(); g.moveTo(-w, 0); g.quadraticCurveTo(-w * .9, -hgt * 1.1, 0, -hgt); g.quadraticCurveTo(w * .9, -hgt * 1.1, w, 0);
  for (let i = 4; i >= 0; i--) { const x0 = -w + i * w * .5; g.quadraticCurveTo(x0 + w * .25, -hgt * .18, x0, 0); }
  g.fill();
  g.strokeStyle = rgba('#FFFFFF', .25); g.lineWidth = r * .02; for (const fx of [-.5, 0, .5]) { g.beginPath(); g.moveTo(0, -hgt); g.quadraticCurveTo(fx * w * .8, -hgt * .5, fx * w, 0); g.stroke(); }
  g.restore();
}
/* 透明伞（桥段里他打的） */
function clearUmbrella(g, x, y, r, rot = 0) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.strokeStyle = '#D8DCE6'; g.lineWidth = 4; g.beginPath(); g.moveTo(0, -r * .62); g.lineTo(0, r * 1.05); g.stroke();
  g.fillStyle = 'rgba(220,230,245,.28)'; g.beginPath(); g.ellipse(0, 0, r, r * .62, 0, Math.PI, 0); g.fill();
  g.strokeStyle = 'rgba(240,245,255,.7)'; g.lineWidth = 3; g.beginPath(); g.ellipse(0, 0, r, r * .62, 0, Math.PI, 0); g.stroke();
  for (const fx of [-.6, -.2, .2, .6]) { g.beginPath(); g.moveTo(0, -r * .62); g.quadraticCurveTo(fx * r * .7, -r * .4, fx * r, -Math.sqrt(1 - fx * fx) * r * .1); g.strokeStyle = 'rgba(240,245,255,.45)'; g.lineWidth = 2; g.stroke(); }
  for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(255,255,255,.6)'; circ(g, (hash(i, 1) - .5) * r * 1.6, -hash(i, 2) * r * .5, 3); g.fill(); }
  g.restore();
}

/* 衣柜：她的衣服，中间挂着他留下的那件浅蓝衬衫 */
function closet(g, s, o = {}) {
  g.fillStyle = vgrad(g, 0, H, [[0, '#1C1840'], [1, '#120F2C']]); g.fillRect(0, 0, W, H);
  g.fillStyle = '#2A2350'; g.fillRect(300, 80, 1320, 900); g.fillStyle = '#16122E'; g.fillRect(330, 110, 1260, 840);
  g.fillStyle = '#8A86B0'; g.fillRect(340, 200, 1240, 10);
  const clothes = [['#E9A7BA', 420], ['#F4E6C8', 560], ['#B7A8E0', 700], [null, 960], ['#E8D2C0', 1220], ['#9BB6D8', 1360], ['#F3B9C8', 1490]];
  for (const [c, x] of clothes) {
    g.strokeStyle = '#B9B6D2'; g.lineWidth = 4; g.beginPath(); g.moveTo(x, 205); g.lineTo(x, 225); g.moveTo(x - 70, 260); g.lineTo(x, 225); g.lineTo(x + 70, 260); g.stroke();
    if (c) { g.fillStyle = c; rr(g, x - 76, 255, 152, 380, 20); g.fill(); g.fillStyle = 'rgba(0,0,0,.18)'; g.fillRect(x + 30, 255, 46, 380); }
  }
  // 他的衬衫
  const sx = 960, col = '#CFE0F4', lift = o.lift || 0;
  g.save(); g.translate(sx, 255 - lift);
  g.fillStyle = col; g.beginPath(); g.moveTo(-110, 20); g.lineTo(-170, 160); g.lineTo(-130, 180); g.lineTo(-100, 110); g.lineTo(-100, 470); g.lineTo(100, 470); g.lineTo(100, 110); g.lineTo(130, 180); g.lineTo(170, 160); g.lineTo(110, 20); g.closePath(); g.fill();
  g.fillStyle = '#E8F0FA'; g.beginPath(); g.moveTo(-50, 0); g.lineTo(0, 60 + (o.collar || 0) * 10); g.lineTo(50, 0); g.lineTo(30, -10); g.lineTo(0, 30); g.lineTo(-30, -10); g.closePath(); g.fill();
  g.strokeStyle = '#A9C0DC'; g.lineWidth = 3; g.beginPath(); g.moveTo(0, 60); g.lineTo(0, 470); g.stroke();
  for (let i = 0; i < 6; i++) { g.fillStyle = '#F8FAFF'; circ(g, 12, 100 + i * 60, 5); g.fill(); }
  g.restore();
  glow(g, sx, 400, 360, '#BFD6FF', .2);
}

/* 起雾的窗：玻璃上一层水汽，手指划过的地方变清楚（paths：手写的笔画，u 写到哪） */
function fogWindow(g, s, x, y, w, h, word, u, o = {}) {
  g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
  if (o.behind) o.behind(g);
  // 水汽
  g.fillStyle = 'rgba(200,205,230,.55)'; g.fillRect(x, y, w, h);
  g.globalAlpha = .5; g.drawImage(fogTex(1, '#E4E8F8'), x, y, w, h); g.globalAlpha = 1;
  // 写出来的字：先在玻璃上"擦掉"水汽，再描一层亮边
  if (u > 0) {
    const chars = [...word];
    chars.forEach((ch, i) => {
      const cu = clamp(u * chars.length - i);
      if (cu <= 0) return;
      const cx = x + w / 2 + (i - (chars.length - 1) / 2) * w * .32, cy = y + h * .48;
      g.save(); g.beginPath(); g.rect(cx - w * .18, cy - h * .3, w * .36 * cu, h * .6); g.clip();
      g.globalCompositeOperation = 'destination-out'; text(g, ch, cx, cy, h * .42, { k: 'hand', col: '#000' });
      g.restore();
    });
  }
  g.restore();
  // 擦开的字里透出来的光
  if (u > 0) text(g, word, x + w / 2, y + h * .48, h * .42, { k: 'hand', col: 'rgba(255,240,250,.0)', glow: '#FFC9E0', gr: 26, ga: .5 * clamp(u * 2), ls: w * .32 - h * .42 });
  // 水珠
  for (let i = 0; i < 16; i++) { const dx = x + hash(i, 61) * w, dy = y + ((hash(i, 62) * h + s * 20 * hash(i, 63)) % h); g.fillStyle = 'rgba(255,255,255,.5)'; ell(g, dx, dy, 3, 5); g.fill(); }
}

/* 手机：聊天界面。o：name, msgs [[谁 'me'|'her', 文字, 出现时刻]], typing（对方正在输入 0..1）, input（输入框里的字）, time, glowA */
function phoneUI(g, s, x, y, w, o = {}) {
  const h = w * 2.05, r = w * .12;
  g.save(); g.translate(x, y);
  if (o.rot) g.rotate(o.rot);
  glow(g, 0, 0, w * 1.4, '#9FC4FF', o.glowA ?? .35);
  g.fillStyle = '#0E0F18'; rr(g, -w / 2, -h / 2, w, h, r); g.fill();
  g.save(); rr(g, -w / 2 + w * .04, -h / 2 + w * .04, w * .92, h - w * .08, r * .8); g.clip();
  g.fillStyle = '#F2F1F6'; g.fillRect(-w / 2, -h / 2, w, h);
  // 顶栏
  g.fillStyle = '#E6E4EE'; g.fillRect(-w / 2, -h / 2, w, w * .34);
  text(g, o.time || '03:07', -w * .36, -h / 2 + w * .09, w * .06, { k: 'sans', col: '#333', align: 'left' });
  text(g, o.name || '她', 0, -h / 2 + w * .22, w * .08, { k: 'sans', col: '#222' });
  if (o.typing > 0) text(g, '对方正在输入…', 0, -h / 2 + w * .3, w * .045, { k: 'sans', col: '#888', alpha: o.typing });
  // 消息
  let my = -h / 2 + w * .5;
  for (const [who, txt, t0] of o.msgs || []) {
    const u = seg(s, t0, t0 + .25); if (u <= 0) continue;
    const tw_ = tw(g, txt, w * .062, 'sans') + w * .1, bx = who === 'me' ? w * .42 - tw_ : -w * .42;
    withAlpha(g, u, () => {
      g.fillStyle = who === 'me' ? '#9DE07A' : '#FFFFFF'; rr(g, bx, my - w * .05 + (1 - E.out(u)) * 20, tw_, w * .12, w * .04); g.fill();
      text(g, txt, bx + tw_ / 2, my + w * .01 + (1 - E.out(u)) * 20, w * .062, { k: 'sans', col: '#222' });
    });
    my += w * .17;
  }
  // 输入框
  g.fillStyle = '#E6E4EE'; g.fillRect(-w / 2, h / 2 - w * .3, w, w * .3);
  g.fillStyle = '#FFFFFF'; rr(g, -w * .42, h / 2 - w * .24, w * .64, w * .14, w * .03); g.fill();
  if (o.input) text(g, o.input + (Math.floor(s * 2) % 2 ? '|' : ''), -w * .38, h / 2 - w * .17, w * .065, { k: 'sans', col: '#222', align: 'left' });
  else if (Math.floor(s * 2) % 2) { g.fillStyle = '#4A7BE0'; g.fillRect(-w * .38, h / 2 - w * .21, 3, w * .08); }
  g.fillStyle = '#4FB06A'; rr(g, w * .26, h / 2 - w * .24, w * .16, w * .14, w * .03); g.fill(); text(g, '发送', w * .34, h / 2 - w * .17, w * .05, { k: 'sans', col: '#fff' });
  g.restore();
  g.restore();
}

/* 书桌：台灯、本子、窗外的月亮慢慢移过去。tl：时间流逝 0..1 */
function deskScene(g, s, tl, o = {}) {
  g.fillStyle = vgrad(g, 0, H, [[0, '#0F1330'], [1, '#191C3C']]); g.fillRect(0, 0, W, H);
  const WX0 = 760, WX1 = 1500, WY0 = 110, WY1 = 600;
  g.save(); g.beginPath(); g.rect(WX0, WY0, WX1 - WX0, WY1 - WY0); g.clip();
  g.fillStyle = vgrad(g, WY0, WY1, [[0, mixc('#0A0E2A', '#2A3570', seg(tl, .7, 1))], [1, mixc('#272766', '#C98AA0', seg(tl, .75, 1))]]); g.fillRect(WX0, WY0, WX1 - WX0, WY1 - WY0);
  g.save(); g.translate(WX0, WY0 - 60); g.scale(.4, .4); g.drawImage(TEX.stars, -400 - tl * 300, 0); g.restore();
  moon(g, lerp(WX0 + 120, WX1 - 80, tl), lerp(220, 420, tl), 50, { haloA: .5 });
  cityLayer(g, CITY.far, 900, WY1 + 30, .5);
  g.restore();
  g.strokeStyle = '#2A2F58'; g.lineWidth = 16; g.strokeRect(WX0, WY0, WX1 - WX0, WY1 - WY0);
  // 地板
  g.fillStyle = '#120F26'; g.fillRect(0, 930, W, H - 930);
  // 桌子（桌面 y=740，桌腿到地板）、台灯
  g.fillStyle = '#3A2E4A'; g.fillRect(200, 740, 1520, 34); g.fillStyle = 'rgba(255,210,160,.18)'; g.fillRect(200, 740, 1520, 3);
  g.fillStyle = '#2A2238'; g.fillRect(240, 774, 36, 156); g.fillRect(1640, 774, 36, 156);
  g.fillStyle = '#2E2A40'; g.fillRect(420, 500, 14, 240); g.beginPath(); g.moveTo(330, 520); g.lineTo(520, 520); g.lineTo(470, 450); g.lineTo(380, 450); g.fill();
  glow(g, 425, 600, 420, '#FFC98A', .55);
  g.save(); g.globalCompositeOperation = 'lighter'; g.fillStyle = lgrad(g, 425, 520, 425, 740, [[0, 'rgba(255,200,140,.35)'], [1, 'rgba(255,200,140,.05)']]); g.beginPath(); g.moveTo(340, 520); g.lineTo(510, 520); g.lineTo(700, 740); g.lineTo(150, 740); g.fill(); g.restore();
  // 本子、笔
  g.fillStyle = '#F2EAD8'; g.save(); g.translate(700, 732); g.rotate(-.04); g.fillRect(-130, -10, 260, 12); g.restore();
  g.strokeStyle = '#6A8FD0'; g.lineWidth = 5; g.beginPath(); g.moveTo(820, 726); g.lineTo(900, 716); g.stroke();
}
