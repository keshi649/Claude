'use strict';
/* env.js —— 场景里反复用到的东西：雨、伞（俯视）、湿地面和斑马线、散景光斑、拍立得、栀子花（特写和花丛）、花瓣、
   夏天的天空和云、树影、长椅、星空、萤火虫、城市夜景、窗户、雨打玻璃。 */

/* ---------------- 散景：虚化的光斑 ---------------- */
function bokeh(g, t, o = {}) {
  const n = o.n || 40, r = R(o.seed || 1), cols = o.cols || ['#FF7AA8', '#7AD8FF', '#FFD27A', '#FFFFFF'];
  g.save(); g.globalCompositeOperation = 'screen';
  for (let i = 0; i < n; i++) {
    const x0 = r() * (W + 200) - 100, y0 = r() * (o.h || H) + (o.y || 0), s = (o.size || 60) * (.4 + r() * 1.1), c = cols[Math.floor(r() * cols.length)];
    const x = x0 + Math.sin(t * .3 + i) * 12 + (o.vx || 0) * t, y = y0 + Math.cos(t * .23 + i * 1.7) * 10;
    const a = (o.a || .5) * (.4 + .6 * r()) * (.75 + .25 * Math.sin(t * 1.3 + i * 2.1));
    g.fillStyle = rg(g, x, y, 0, s, [[0, rgba(c, a)], [.7, rgba(c, a * .75)], [.86, rgba(c, a * .9)], [1, rgba(c, 0)]]);
    g.fillRect(x - s, y - s, s * 2, s * 2);
  }
  g.restore();
}

/* ---------------- 雨 ---------------- */
/* 侧面看的雨丝：ang 是偏离竖直的角度，speed 像素/秒 */
function rain(g, t, o = {}) {
  const n = o.n || 160, r = R(o.seed || 7), len = o.len || 70, sp = o.speed || 2600, ang = o.ang || .12;
  g.save(); g.strokeStyle = o.col || 'rgba(200,220,255,.35)'; g.lineWidth = o.lw || 2; g.lineCap = 'round';
  g.beginPath();
  for (let i = 0; i < n; i++) {
    const x0 = r() * (W + 400) - 200, ph = r(), l = len * (.6 + r() * .8);
    const y = mod(ph * (H + 400) + t * sp * (.8 + r() * .4), H + 400) - 200;
    const x = x0 + Math.sin(ang) * y;
    g.moveTo(x, y); g.lineTo(x - Math.sin(ang) * l, y - Math.cos(ang) * l);
  }
  g.stroke(); g.restore();
}
/* 地上溅起的水圈 */
function splashes(g, t, o = {}) {
  const n = o.n || 60, r = R(o.seed || 11), y0 = o.y0 || 0, y1 = o.y1 || H;
  g.save(); g.strokeStyle = o.col || 'rgba(210,225,255,.5)'; g.lineWidth = 1.5;
  for (let i = 0; i < n; i++) {
    const per = .5 + r() * .5, ph = r() * per, x = r() * W, y = lerp(y0, y1, r());
    const k = mod(t + ph, per) / per, flat = o.flat || .35;
    g.globalAlpha = (1 - k) * .8;
    g.beginPath(); g.ellipse(x, y, 4 + k * 26, (4 + k * 26) * flat, 0, 0, TAU); g.stroke();
  }
  g.restore();
}

/* ---------------- 俯视的伞 ---------------- */
function umbrellaTop(g, x, y, rad, col, rot = 0, o = {}) {
  const n = 8;
  g.save(); g.translate(x, y); g.rotate(rot);
  // 影子
  g.fillStyle = 'rgba(0,0,10,.35)'; g.beginPath(); g.ellipse(rad * .12, rad * .16, rad * 1.02, rad * 1.02, 0, 0, TAU); g.fill();
  for (let i = 0; i < n; i++) {
    const a0 = i / n * TAU, a1 = (i + 1) / n * TAU, am = (a0 + a1) / 2;
    g.beginPath(); g.moveTo(0, 0);
    g.lineTo(Math.cos(a0) * rad, Math.sin(a0) * rad);
    g.quadraticCurveTo(Math.cos(am) * rad * .9, Math.sin(am) * rad * .9, Math.cos(a1) * rad, Math.sin(a1) * rad);
    g.closePath();
    const lit = .5 + .5 * Math.cos(am - (o.la === undefined ? -2.2 : o.la) - rot);
    g.fillStyle = shade(col, .72 + lit * .5); g.fill();
  }
  // 伞骨
  g.strokeStyle = rgba(shade(col, .55), .7); g.lineWidth = Math.max(1, rad * .025);
  for (let i = 0; i < n; i++) { const a = i / n * TAU; g.beginPath(); g.moveTo(0, 0); g.lineTo(Math.cos(a) * rad, Math.sin(a) * rad); g.stroke(); }
  // 湿的高光
  g.fillStyle = rg(g, -rad * .3, -rad * .35, 0, rad * .8, [[0, 'rgba(255,255,255,.28)'], [1, 'rgba(255,255,255,0)']]);
  g.beginPath(); g.arc(0, 0, rad, 0, TAU); g.fill();
  circ(g, 0, 0, rad * .06, shade(col, .5));
  g.restore();
}
/* 路面（俯视）：湿沥青、斑马线、霓虹倒影。画在 1.6 倍大的画布上，方便转镜头 */
function streetTop() {
  return cached('streetTop', 1800, 2600, (g) => {
    g.fillStyle = '#121826'; g.fillRect(0, 0, 1800, 2600);
    const r = R(3);
    for (let i = 0; i < 3000; i++) { g.fillStyle = `rgba(${r() > .5 ? '255,255,255' : '0,0,0'},${r() * .05})`; g.fillRect(r() * 1800, r() * 2600, 3, 3); }
    // 斑马线：竖着过马路，条纹横着
    for (let k = 0; k < 13; k++) {
      const y = 260 + k * 170;
      g.fillStyle = 'rgba(200,210,225,.5)'; g.fillRect(560, y, 680, 82);
      g.fillStyle = 'rgba(255,255,255,.08)'; g.fillRect(560, y, 680, 14);
    }
    // 积水的倒影：霓虹色块
    const neon = [['#FF4F8B', 260, 600], ['#38D3FF', 1500, 900], ['#FFB347', 300, 1700], ['#B06CFF', 1450, 2050], ['#FF4F8B', 1550, 300]];
    for (const [c, x, y] of neon) { g.fillStyle = rg(g, x, y, 0, 420, [[0, rgba(c, .32)], [1, rgba(c, 0)]]); g.fillRect(x - 420, y - 420, 840, 840); }
    // 水洼
    for (let i = 0; i < 26; i++) { const x = r() * 1800, y = r() * 2600, w = 80 + r() * 260; g.fillStyle = 'rgba(120,150,200,.07)'; g.beginPath(); g.ellipse(x, y, w, w * .45, r() * 3, 0, TAU); g.fill(); }
  });
}

/* ---------------- 拍立得 ---------------- */
/* 在 (x,y) 中心、宽 w、转 rot 画一张拍立得，photo(g, pw, ph) 画照片内容（坐标从照片左上角起）。age 0~1 泛黄 */
function polaroid(g, x, y, w, rot, photo, o = {}) {
  const h = w * 1.2, pw = w * .88, ph = pw;
  const pc = layer('polaroidPhoto', 640, 640);
  pc.save(); pc.scale(640 / pw, 640 / ph); photo(pc, pw, ph); pc.restore();
  // 照片褪色、泛黄
  pc.globalCompositeOperation = 'soft-light'; pc.fillStyle = rgba('#FFC680', .5 + .3 * (o.age || 0)); pc.fillRect(0, 0, 640, 640);
  pc.globalCompositeOperation = 'source-over'; pc.fillStyle = `rgba(255,240,220,${.12 + .1 * (o.age || 0)})`; pc.fillRect(0, 0, 640, 640);
  g.save(); g.translate(x, y); g.rotate(rot);
  if (o.under) o.under(g, w, h);
  g.shadowColor = 'rgba(0,0,0,.45)'; g.shadowBlur = w * .06; g.shadowOffsetY = w * .02;
  g.fillStyle = o.paper || '#F3EEE4'; g.fillRect(-w / 2, -h / 2, w, h);
  g.shadowColor = 'transparent';
  g.drawImage(LAYER.polaroidPhoto, -pw / 2, -h / 2 + w * .06, pw, ph);
  g.fillStyle = 'rgba(0,0,0,.12)'; g.fillRect(-pw / 2, -h / 2 + w * .06, pw, 2);
  if (o.wet) {   // 水珠
    const r = R(o.seed || 5);
    for (let i = 0; i < o.wet; i++) {
      const dx = (r() - .5) * w * .9, dy = (r() - .5) * h * .9, s = w * (.008 + r() * .02);
      g.fillStyle = 'rgba(255,255,255,.25)'; g.beginPath(); g.ellipse(dx, dy, s, s * 1.1, 0, 0, TAU); g.fill();
      g.fillStyle = 'rgba(255,255,255,.7)'; circ(g, dx - s * .3, dy - s * .35, s * .3);
    }
  }
  if (o.back) o.back(g, w, h);
  if (o.over) o.over(g, w, h);
  g.restore();
}

/* ---------------- 栀子花 ---------------- */
/* 一朵正面的栀子花：6 片白瓣转着叠，中间淡黄。r 半径，open 0~1 开的程度，aged 干枯的程度 */
function gardenia(g, x, y, r, rot = 0, o = {}) {
  const aged = o.aged || 0, pet = mix('#FFFDF6', '#C9A77A', aged), petD = mix('#E9E4D2', '#9C7A52', aged), ctr = mix('#F3E39A', '#8A6A3A', aged);
  g.save(); g.translate(x, y); g.rotate(rot);
  if (o.tilt) g.scale(1, o.tilt);
  for (let layerK = 0; layerK < 2; layerK++) {
    const n = 6, rr = r * (layerK ? .62 : 1), off = layerK ? PI / 6 : 0;
    for (let i = 0; i < n; i++) {
      const a = i / n * TAU + off + (aged ? Math.sin(i * 3.1) * .2 : 0);
      g.save(); g.rotate(a);
      g.beginPath(); g.moveTo(0, 0);
      g.bezierCurveTo(rr * .35, -rr * .3, rr * .95, -rr * .38, rr * 1.0, rr * .05);
      g.bezierCurveTo(rr * .9, rr * .32, rr * .35, rr * .3, 0, 0);
      g.fillStyle = lg(g, 0, 0, rr, 0, [[0, petD], [.5, pet], [1, shade(pet, 1.02)]]); g.fill();
      g.strokeStyle = rgba(petD, .6); g.lineWidth = Math.max(.6, r * .012); g.stroke();
      g.restore();
    }
  }
  g.fillStyle = rg(g, 0, 0, 0, r * .28, [[0, ctr], [1, rgba(ctr, 0)]]); g.beginPath(); g.arc(0, 0, r * .28, 0, TAU); g.fill();
  g.restore();
}
/* 叶子：油亮的深绿 */
function leaf(g, x, y, len, rot, col = '#2F6B3A', o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot);
  g.beginPath(); g.moveTo(0, 0); g.bezierCurveTo(len * .3, -len * .28, len * .75, -len * .22, len, 0); g.bezierCurveTo(len * .75, len * .22, len * .3, len * .26, 0, 0);
  g.fillStyle = lg(g, 0, -len * .2, 0, len * .2, [[0, shade(col, 1.25)], [.5, col], [1, shade(col, .7)]]); g.fill();
  g.strokeStyle = rgba(shade(col, 1.5), .5); g.lineWidth = Math.max(.6, len * .02); g.beginPath(); g.moveTo(len * .05, 0); g.lineTo(len * .9, 0); g.stroke();
  g.restore();
}
/* 栀子花丛（远一点看）：叶子团 + 一朵朵白花。缓存成图，按 seed 区分 */
function gardeniaBush(w, h, seed = 1, o = {}) {
  return cached('bush' + seed + (o.night ? 'n' : ''), w, h, (g) => {
    const r = R(seed), cols = o.night ? ['#14281E', '#1B3427', '#0F2018'] : ['#2E6A3A', '#3D7F45', '#24562F', '#4E9150'];
    // 叶团
    for (let i = 0; i < 900; i++) {
      const a = r() * TAU, d = Math.sqrt(r());
      const x = w / 2 + Math.cos(a) * d * w * .48, y = h * .55 + Math.sin(a) * d * h * .45 - (1 - d) * h * .05;
      if (y > h * .98) continue;
      leaf(g, x, y, w * (.04 + r() * .035), r() * TAU, cols[Math.floor(r() * cols.length)]);
    }
    // 花
    for (let i = 0; i < (o.flowers || 26); i++) {
      const a = r() * TAU, d = Math.sqrt(r()) * .92;
      const x = w / 2 + Math.cos(a) * d * w * .45, y = h * .52 + Math.sin(a) * d * h * .4;
      gardenia(g, x, y, w * (.025 + r() * .02), r() * TAU, { tilt: .7 + r() * .3, aged: o.night ? .0 : 0 });
    }
  });
}
/* 一片花瓣的贴图 */
function petalImg() {
  return cached('petal', 64, 96, (g) => {
    g.translate(32, 48);
    g.beginPath(); g.moveTo(0, -44); g.bezierCurveTo(30, -36, 28, 30, 0, 44); g.bezierCurveTo(-28, 30, -30, -36, 0, -44);
    g.fillStyle = lg(g, -28, 0, 28, 0, [[0, '#E6E0CC'], [.45, '#FFFEF8'], [1, '#EEE9D8']]); g.fill();
  });
}
/* 飘落的花瓣：n 片，在矩形区域里。o.wind 横向漂，o.fall 下落速度（像素/秒），o.size */
function petals(g, t, o = {}) {
  const n = o.n || 30, r = R(o.seed || 21), img = petalImg();
  const x0 = o.x0 || -100, x1 = o.x1 || W + 100, y0 = o.y0 || -150, y1 = o.y1 || H + 150, span = y1 - y0;
  for (let i = 0; i < n; i++) {
    const sp = (o.fall || 160) * (.6 + r() * .8), ph = r(), s = (o.size || 26) * (.6 + r() * .8);
    const k = o.freeze !== undefined ? o.freeze : t;
    const y = y0 + mod(ph * span + k * sp, span);
    const x = lerp(x0, x1, r()) + Math.sin(k * (.6 + r()) + i) * 40 + (o.wind || 0) * k * (.6 + r() * .6);
    const xx = o.wrap ? mod(x - x0, x1 - x0) + x0 : x;
    const flip = Math.cos(k * (1.5 + r() * 2) + i), rot = k * (r() - .5) * 2 + r() * TAU;
    g.save(); g.translate(xx, y); g.rotate(rot); g.scale(Math.max(.15, Math.abs(flip)), 1); g.globalAlpha = o.alpha === undefined ? .95 : o.alpha;
    g.drawImage(img, -s * .33, -s * .5, s * .66, s);
    g.restore();
  }
}

/* ---------------- 天空 ---------------- */
function skyGrad(g, stops, y0 = 0, y1 = H) { g.fillStyle = lg(g, 0, y0, 0, y1, stops); g.fillRect(0, 0, W, H); }
/* 夏天的积云（缓存） */
function cloudImg(seed, w = 700, h = 360, col = '#FFFFFF', shadeCol = '#C9D6E8') {
  return cached('cloud' + seed + col, w, h, (g) => {
    const r = R(seed);
    for (let i = 0; i < 26; i++) {
      const x = w * (.15 + r() * .7), y = h * (.35 + r() * .4) + (Math.abs(x - w / 2) / w) * h * .4, s = h * (.18 + r() * .2);
      g.fillStyle = rg(g, x, y - s * .3, 0, s, [[0, col], [.65, col], [1, rgba(col, 0)]]); g.beginPath(); g.arc(x, y, s, 0, TAU); g.fill();
    }
    g.globalCompositeOperation = 'source-atop';
    g.fillStyle = lg(g, 0, h * .35, 0, h, [[0, 'rgba(0,0,0,0)'], [1, rgba(shadeCol, .9)]]); g.fillRect(0, 0, w, h);
  });
}
/* 星空 */
function stars(g, t, o = {}) {
  const n = o.n || 400, r = R(o.seed || 31), y1 = o.y1 || H;
  for (let i = 0; i < n; i++) {
    const x = r() * W, y = r() * y1, s = Math.pow(r(), 3) * 3.2 + .6, tw = .6 + .4 * Math.sin(t * (1 + r() * 3) + i);
    g.fillStyle = `rgba(255,${240 + ri(r() * 15)},${220 + ri(r() * 35)},${(o.a || 1) * tw * (.4 + r() * .6)})`;
    g.fillRect(x - s / 2, y - s / 2, s, s);
    if (s > 2.8) glow(g, x, y, s * 5, '#CFE0FF', .25 * tw * (o.a || 1));
  }
}
/* 银河：一条斜着的光带（缓存） */
function milkyWay(seed = 1) {
  return cached('milky' + seed, 1080, 1920, (g) => {
    g.save(); g.translate(540, 760); g.rotate(-.55);
    for (let i = 0; i < 70; i++) {
      const r = R(seed * 100 + i), x = (r() - .5) * 2400, y = (r() - .5) * 260 * (1 - Math.abs(x) / 1600), s = 120 + r() * 260;
      const c = ['#7E8BFF', '#C69BFF', '#FFC8E8', '#9FE0FF'][i % 4];
      g.fillStyle = rg(g, x, y, 0, s, [[0, rgba(c, .16)], [1, rgba(c, 0)]]); g.fillRect(x - s, y - s, s * 2, s * 2);
    }
    const r = R(seed + 7);
    for (let i = 0; i < 2600; i++) { const x = (r() - .5) * 2400, y = (r() + r() + r() - 1.5) * 200; g.fillStyle = `rgba(255,255,255,${r() * .7})`; const s = r() * 1.8 + .4; g.fillRect(x, y, s, s); }
    // 暗的尘埃带
    for (let i = 0; i < 30; i++) { const x = (r() - .5) * 2000, y = (r() - .5) * 60, s = 60 + r() * 120; g.fillStyle = rg(g, x, y, 0, s, [[0, 'rgba(10,8,30,.35)'], [1, 'rgba(10,8,30,0)']]); g.fillRect(x - s, y - s, s * 2, s * 2); }
    g.restore();
  });
}
/* 萤火虫 */
function fireflies(g, t, o = {}) {
  const n = o.n || 40, r = R(o.seed || 41);
  for (let i = 0; i < n; i++) {
    const bx = lerp(o.x0 || 0, o.x1 || W, r()), by = lerp(o.y0 || 0, o.y1 || H, r());
    const x = bx + wob(t, .25, i) * 70, y = by + wob(t, .2, i + 50) * 50 - (o.rise || 0) * t * (.5 + r());
    const a = (o.a || 1) * Math.pow(.5 + .5 * Math.sin(t * (1.2 + r() * 1.6) + i * 2.3), 2);
    glow(g, x, y, (o.size || 22) * (.7 + r() * .6), '#E9FF8A', a * .7);
    circ(g, x, y, 2.4, `rgba(250,255,210,${a})`);
  }
}

/* ---------------- 城市夜景 ---------------- */
/* 一排楼的剪影，窗户亮着（缓存）。seed、宽高、颜色 */
function skyline(seed, w, h, o = {}) {
  return cached('sky' + seed + w + h + (o.col || ''), w, h, (g) => {
    const r = R(seed); let x = -20;
    while (x < w) {
      const bw = 60 + r() * 140, bh = h * (.35 + r() * .62), c = o.col || '#151A2C';
      g.fillStyle = shade(c, .85 + r() * .3); g.fillRect(x, h - bh, bw, bh);
      if (r() > .7) { g.fillRect(x + bw * .4, h - bh - 30, 4, 30); }
      for (let wy = h - bh + 14; wy < h - 10; wy += 22) for (let wx = x + 8; wx < x + bw - 12; wx += 18) {
        if (r() < (o.lit || .28)) { g.fillStyle = r() > .3 ? `rgba(255,${200 + ri(r() * 40)},${120 + ri(r() * 60)},${.5 + r() * .5})` : 'rgba(170,210,255,.6)'; g.fillRect(wx, wy, 8, 11); }
      }
      x += bw + r() * 8;
    }
  });
}

/* 阳光：右上角的光晕和几道斜着的光柱（screen 叠加） */
function sunRays(g, t, x, y, a = 1, o = {}) {
  if (a <= 0) return;
  g.save(); g.globalCompositeOperation = 'screen';
  g.fillStyle = rg(g, x, y, 0, 900, [[0, `rgba(255,246,214,${.85 * a})`], [.15, `rgba(255,232,180,${.4 * a})`], [1, 'rgba(255,220,160,0)']]); g.fillRect(x - 900, y - 900, 1800, 1800);
  const n = o.n || 7, r = R(o.seed || 2);
  for (let i = 0; i < n; i++) {
    const ang = (o.ang || 2.2) + (r() - .5) * .9, w = .03 + r() * .05, len = 2600, k = (.5 + .5 * Math.sin(t * .6 + i * 2)) * a * (o.k || .22);
    g.fillStyle = lg(g, x, y, x + Math.cos(ang) * len, y + Math.sin(ang) * len, [[0, `rgba(255,240,200,${k})`], [1, 'rgba(255,240,200,0)']]);
    g.beginPath(); g.moveTo(x, y); g.lineTo(x + Math.cos(ang - w) * len, y + Math.sin(ang - w) * len); g.lineTo(x + Math.cos(ang + w) * len, y + Math.sin(ang + w) * len); g.closePath(); g.fill();
  }
  g.restore();
}
/* 镜头前虚化的花瓣（大、糊、慢） */
function petalsNear(g, t, o = {}) {
  const img = petalImg(), r = R(o.seed || 61), n = o.n || 4;
  g.save(); g.filter = `blur(${o.blur || 8}px)`;
  for (let i = 0; i < n; i++) {
    const sp = 90 + r() * 60, y = mod(r() * (H + 600) + t * sp, H + 600) - 300, x = r() * W + Math.sin(t * .7 + i) * 80;
    const s = (o.size || 150) * (.7 + r() * .6);
    g.save(); g.translate(x, y); g.rotate(t * (r() - .5) + r() * 6); g.scale(Math.max(.2, Math.abs(Math.cos(t * .8 + i))), 1); g.globalAlpha = o.a || .75;
    g.drawImage(img, -s * .33, -s * .5, s * .66, s); g.restore();
  }
  g.restore();
}

/* ---------------- 手（特写用） ---------------- */
/* 手腕在 (x,y)，手指朝 rot 方向；pose：'point' 伸出食指、'open' 张开、'up' 手心朝上托着。sleeve 袖子颜色 */
function hand(g, x, y, s, rot, pose = 'open', sleeve = '#CDB592', o = {}) {
  g.save(); g.translate(x, y); g.rotate(rot); g.scale(s, s);
  // 袖子
  g.fillStyle = sleeve; spline(g, [[-520, -70], [8, -62], [24, 0], [8, 62], [-520, 70]], true, .2); g.fill();
  g.fillStyle = shade(sleeve, .8); g.fillRect(-24, -64, 22, 128);
  const sk = pose === 'up' ? '#F8DDCB' : SKIN, line = 'rgba(160,100,90,.35)';
  // 手掌
  g.fillStyle = sk; spline(g, [[0, -40], [70, -46], [104, -32], [108, 30], [70, 44], [0, 40]], true, .5); g.fill();
  const F = (y0, len, r0, r1, bend = 0) => {
    const x1 = 100 + len * Math.cos(bend), y1 = y0 + len * Math.sin(bend);
    capsule(g, 92, y0, r0, x1, y1, r1, sk); return [x1, y1];
  };
  if (pose === 'point') {
    F(-28, 120, 14, 11);                                        // 食指
    for (const [yy, l] of [[-6, 34], [14, 30], [32, 24]]) F(yy, l, 14, 13, .9);   // 弯着的三根
    capsule(g, 30, -36, 16, 92, -30, 12, shade(sk, .97));        // 拇指贴着
    ell(g, 214, -28, 9, 8, 0, '#F8E6DC');
  } else {
    const curl = pose === 'up' ? -.12 : 0;
    F(-30, 92, 13, 10, curl * -1); F(-10, 104, 13, 10.5, curl * -.5); F(10, 98, 13, 10, 0); F(29, 80, 12, 9, curl);
    capsule(g, 24, -38, 17, 78, -84, 12, sk);                     // 拇指
    if (pose === 'up') { g.strokeStyle = line; g.lineWidth = 3; g.beginPath(); g.moveTo(20, 10); g.quadraticCurveTo(60, -10, 96, 4); g.stroke(); g.beginPath(); g.moveTo(30, 26); g.quadraticCurveTo(66, 16, 100, 24); g.stroke(); }
  }
  g.restore();
}
