// world.js — 大场景：海边（夜空、月亮、海、栈桥、剧场外墙、路灯）。
// 海边是一整排"布景"：侧面看过去，像舞台上一层层的景片。世界坐标：
//   海平线 y=560；栈桥、木栈道的桥面 y=650；剧场在 x 300~1050；路灯在 x=1250；栈桥伸到 x=3010；月亮在 (3200, 250)
const SEA = { hz: 560, deck: 650, moonX: 3120, moonY: 250, moonR: 82, pierEnd: 3010, lampX: 1250, theaterX0: 300, theaterX1: 1050 };

// 一块往外长的"画出来"区域：从 (x0) 往 x1 方向扫，边缘参差，像铅笔一下下排过去
function sweepPath(x0, x1, y0, y1, p, seed = 3) {
  const x = lerp(x0, x1, p), dir = Math.sign(x1 - x0) || 1, pth = new Path2D();
  pth.moveTo(x0 - dir * 50, y0 - 50);
  for (let y = y0 - 50; y <= y1 + 50; y += 24) pth.lineTo(x + dir * ((n1(y / 70, seed) - 0.5) * 160 + (hash(Math.floor(y / 24), seed) - 0.5) * 40), y);
  pth.lineTo(x0 - dir * 50, y1 + 50); pth.closePath();
  return pth;
}
function circlePath(x, y, r) { const p = new Path2D(); p.arc(x, y, Math.max(0.1, r), 0, 6.283); return p; }
function rectPath(x, y, w, h) { const p = new Path2D(); p.rect(x, y, w, h); return p; }

// ---------------- 夜空 ----------------
function nightSky(g, x0, y0, x1, y1, t, o = {}) {
  const sky = rectPath(x0, y0, x1 - x0, y1 - y0);
  shade(g, sky, { x0: 0, y0: y0, x1: 0, y1: y1, v0: o.top ?? 0.88, v1: o.bottom ?? 0.62 }, 24, { scale: 1 });
  // 月亮周围的天被擦淡
  if (o.moon) {
    const [mx, my, mr] = o.moon, rr = mr * (o.haloR ?? 5);
    const gr = g.createRadialGradient(mx, my, mr * 0.9, mx, my, rr);
    gr.addColorStop(0, 'rgba(238,232,220,0.78)'); gr.addColorStop(0.35, 'rgba(238,232,220,0.3)'); gr.addColorStop(1, 'rgba(238,232,220,0)');
    g.save(); g.clip(sky); g.fillStyle = gr; g.fillRect(mx - rr, my - rr, rr * 2, rr * 2); g.restore();
  }
  // 星星：擦出来的小点，一闪一闪
  const n = o.stars ?? 70;
  for (let i = 0; i < n; i++) {
    const x = lerp(x0, x1, hash(i, 41)), y = lerp(y0, y1 - 60, Math.pow(hash(i, 42), 1.3));
    if (o.moon && Math.hypot(x - o.moon[0], y - o.moon[1]) < o.moon[2] * 2.3) continue;
    const r = 1.1 + hash(i, 43) * 2.2, tw = 0.45 + 0.55 * Math.abs(Math.sin(t * (0.6 + hash(i, 44) * 1.6) + i));
    erase(g, circlePath(x, y, r), tw * (o.starA ?? 1));
    if (r > 2.6) { eraseStroke(g, [[x - r * 2.4, y], [x + r * 2.4, y]], 0.9, tw * 0.6); eraseStroke(g, [[x, y - r * 2.4], [x, y + r * 2.4]], 0.9, tw * 0.6); }
  }
  // 几缕云：揉出来的软灰，靠月亮的一边擦亮
  if (o.clouds) for (const c of o.clouds) cloud(g, c[0] + t * (c[3] ?? 4), c[1], c[2], o.moon, c[4] ?? 1);
}
function cloud(g, x, y, w, moon, seed) {
  const pth = new Path2D();
  const N = 14;
  for (let i = 0; i <= N; i++) {
    const u = i / N, a = u * Math.PI;
    const r = w * 0.5, bump = 1 + 0.22 * Math.sin(u * 23 + seed) + 0.12 * Math.sin(u * 47 + seed * 2);
    const px = x + Math.cos(a) * r, py = y - Math.sin(a) * w * 0.12 * bump;
    if (i === 0) pth.moveTo(px, py); else pth.lineTo(px, py);
  }
  pth.closePath();
  g.save(); g.filter = 'blur(6px)'; g.globalAlpha = 0.5; g.fillStyle = rgba([60, 60, 70], 1); g.fill(pth); g.restore();
  if (moon) { g.save(); g.clip(pth); const gr = g.createRadialGradient(moon[0], moon[1], 0, moon[0], moon[1], w * 1.4); gr.addColorStop(0, 'rgba(238,232,220,0.6)'); gr.addColorStop(1, 'rgba(238,232,220,0)'); g.fillStyle = gr; g.fillRect(x - w, y - w, w * 2, w * 2); g.restore(); }
}
// 月亮：擦白的圆、淡淡的环形山、外面一圈冷光。draw: 画圈的进度；lit: 亮起来的程度
function moon(g, x, y, r, t, o = {}) {
  const draw = o.draw ?? 1, lit = o.lit ?? 1;
  if (lit > 0) {
    erase(g, circlePath(x, y, r), lit);
    g.save(); g.clip(circlePath(x, y, r));
    smudgeBlob(g, x - r * 0.3, y - r * 0.2, r * 0.32, 0.12 * lit);
    smudgeBlob(g, x + r * 0.35, y + r * 0.25, r * 0.26, 0.1 * lit);
    smudgeBlob(g, x + r * 0.1, y - r * 0.45, r * 0.18, 0.08 * lit);
    g.restore();
    glow(g, x, y, r * 3.4, C.moon, 0.36 * lit);
    glow(g, x, y, r * 1.5, C.moonHot, 0.3 * lit);
  }
  withSeed(9001, () => skEllipse(g, x, y, r, r, { w: 2.2, a: 0.62, draw }));
}
// ---------------- 海 ----------------
function sea(g, x0, x1, hz, y1, t, o = {}) {
  const s = rectPath(x0, hz, x1 - x0, y1 - hz);
  shade(g, s, { x0: 0, y0: hz, x1: 0, y1: y1, v0: o.v0 ?? 0.74, v1: o.v1 ?? 0.92 }, 1.5, { hatch: o.hatch ?? 0.62, scale: 1 });
  // 浪：一道道短弧，近处长、远处短，慢慢往右漂
  const n = o.waves ?? 90;
  withSeed(4242, () => {
    for (let i = 0; i < n; i++) {
      const v = hash(i, 21), y = hz + 8 + Math.pow(v, 1.35) * (y1 - hz - 10);
      const span = x1 - x0 + 300;
      const x = x0 - 150 + ((hash(i, 22) * span + t * (6 + (y - hz) * 0.03)) % span);
      const len = 22 + (y - hz) * 0.32 * (0.6 + hash(i, 23));
      const amp = 1.5 + (y - hz) * 0.012;
      sk(g, [[x, y], [x + len * 0.5, y - amp], [x + len, y]], { w: 1.1 + (y - hz) * 0.004, a: 0.5, taper: 0.9, seed: 7000 + i, passes: 1 });
    }
  });
  if (o.moonX != null) moonPath(g, o.moonX, hz, y1, t, o);
  // 海平线
  withSeed(4243, () => sk(g, [[x0 - 20, hz], [x1 + 20, hz + 1]], { w: 2.2, a: 0.75, j: 2 }));
}
// 月光：海面上一条擦亮的碎光（从海平线一直铺到近处，越近越宽）
function moonPath(g, mx, hz, y1, t, o = {}) {
  const k = o.pathA ?? 1, N = o.pathN ?? 260;
  for (let i = 0; i < N; i++) {
    const v = hash(i, 11), y = hz + 4 + Math.pow(v, 1.5) * (y1 - hz);
    const spread = 26 + (y - hz) * 0.5;
    const off = (hash(i, 12) - 0.5) * 2 * (0.35 + 0.65 * hash(i, 13));
    const x = mx + off * spread + Math.sin(t * 0.7 + i) * 3;
    const len = (5 + (y - hz) * 0.11) * (0.5 + hash(i, 14));
    const ph = Math.sin(t * (1.1 + hash(i, 15) * 2.2) + i * 1.7);
    const a = clamp(0.5 + 0.5 * ph) * (1 - Math.abs(off) * 0.85) * k * (o.pathReveal ? clamp((o.pathReveal * (y1 - hz) * 1.3 - (y - hz)) / 60) : 1);
    if (a <= 0.04) continue;
    eraseStroke(g, [[x - len / 2, y], [x + len / 2, y + (hash(i, 16) - 0.5) * 1.6]], 1.3 + (y - hz) * 0.011, a);
  }
  glow(g, mx, hz + (y1 - hz) * 0.25, (y1 - hz) * 0.8, C.moon, 0.12 * k);
}
// ---------------- 栈桥（侧面） ----------------
function pierSide(g, x0, x1, deck, t, o = {}) {
  const th = 20, postStep = 118, postDown = 120;
  // 桥墩：插进水里，水里有倒影的短横线
  withSeed(5100, () => {
    for (let x = x1 - 14; x > x0 - 40; x -= postStep) {
      const pp = rectPath(x - 8, deck + th - 2, 16, postDown);
      paperFill(g, pp); shade(g, pp, o.night ? 0.78 : 0.5, 82, { scale: 1 });
      sk(g, [[x - 8, deck + th], [x - 8, deck + th + postDown]], { w: 1.8, a: 0.8 });
      sk(g, [[x + 8, deck + th], [x + 8, deck + th + postDown]], { w: 1.8, a: 0.8 });
      for (let k = 0; k < 4; k++) { const yy = deck + th + postDown + 6 + k * 9; sk(g, [[x - 14 + k * 2, yy], [x + 14 - k * 3, yy + 1]], { w: 1.2, a: 0.45, passes: 1 }); }
    }
  });
  // 桥面：一条厚木板，侧面看得到一块块板头
  const dp = rectPath(x0, deck, x1 - x0, th);
  paperFill(g, dp); shade(g, dp, o.night ? 0.6 : 0.35, 0, { scale: 1 });
  withSeed(5101, () => {
    sk(g, [[x0 - 30, deck], [x1, deck]], { w: 2.4, a: 0.9 });
    sk(g, [[x0 - 30, deck + th], [x1, deck + th]], { w: 2.2, a: 0.85 });
    sk(g, [[x1, deck], [x1, deck + th]], { w: 2, a: 0.85 });
    for (let x = x0 + 14; x < x1; x += 30) sk(g, [[x, deck + 3], [x + 1, deck + th - 3]], { w: 1.0, a: 0.4, passes: 1 });
  });
  // 月光照亮桥面的上沿
  if (o.moonlit) eraseStroke(g, [[x0, deck + 2], [x1, deck + 2]], 2.2, 0.5);
}
// 路灯：暖色的灯泡，下面一圈暖光
function lampPost(g, x, y, h, t, o = {}) {
  const on = o.on ?? 1;
  withSeed(5200 + x, () => {
    const pole = rectPath(x - 4, y - h, 8, h);
    paperFill(g, pole); shade(g, pole, 0.75, 85, { scale: 1 });
    sk(g, [[x - 4, y - h], [x - 4, y]], { w: 1.8, a: 0.85 }); sk(g, [[x + 4, y - h], [x + 4, y]], { w: 1.8, a: 0.85 });
    const base = [[x - 14, y], [x - 9, y - 26], [x + 9, y - 26], [x + 14, y]]; part(g, base, { tone: 0.75, w: 2 });
    // 灯罩
    const hx = x, hy = y - h;
    const shadeP = [[hx - 26, hy + 6], [hx - 14, hy - 22], [hx + 14, hy - 22], [hx + 26, hy + 6]];
    const sp = pathOf(shadeP); paperFill(g, sp); shade(g, sp, 0.7, 30, { scale: 1 });
    sk(g, shadeP.concat([shadeP[0]]), { w: 2, a: 0.85 });
    sk(g, [[hx, hy - 22], [hx, hy - 34]], { w: 2, a: 0.8 });
    const bulb = circlePath(hx, hy + 12, 8); erase(g, bulb, 1); sk(g, spline([[hx - 8, hy + 8], [hx, hy + 21], [hx + 8, hy + 8]], 6), { w: 1.4, a: 0.6 });
  });
  if (on > 0) {
    glow(g, x, y - h + 12, 70 * (o.size ?? 1), C.amberHot, 0.55 * on);
    glow(g, x, y - h + 12, 230 * (o.size ?? 1), C.amber, 0.32 * on);
    // 地上一圈光
    g.save(); g.translate(x, y + 4); g.scale(1, 0.18); glow(g, 0, 0, 180 * (o.size ?? 1), C.amber, 0.4 * on); g.restore();
  }
}
// ---------------- 剧场外墙（正面，像一块景片） ----------------
function theaterFront(g, t, o = {}) {
  const x0 = SEA.theaterX0, x1 = SEA.theaterX1, base = SEA.deck, top = 300, peak = 150, cx = (x0 + x1) / 2;
  const night = o.night ?? true;
  withSeed(6100, () => {
    // 桩子
    for (let x = x0 + 30; x < x1; x += 90) { const pp = rectPath(x - 9, base + 18, 18, 110); paperFill(g, pp); shade(g, pp, 0.8, 82); sk(g, [[x - 9, base + 18], [x - 9, base + 128]], { w: 1.8, a: 0.8 }); sk(g, [[x + 9, base + 18], [x + 9, base + 128]], { w: 1.8, a: 0.8 }); }
    // 墙
    const wall = [[x0, base], [x0, top], [cx, peak], [x1, top], [x1, base]];
    const wp = pathOf(wall); paperFill(g, wp); shade(g, wp, night ? 0.55 : 0.2, 0, { scale: 1 });
    // 横的木板缝
    g.save(); g.clip(wp);
    for (let y = peak + 30; y < base; y += 22) sk(g, [[x0 - 10, y], [x1 + 10, y + 1]], { w: 1.0, a: 0.32, passes: 1 });
    g.restore();
    sk(g, [[x0, base], [x0, top]], { w: 2.6, a: 0.9 }); sk(g, [[x1, base], [x1, top]], { w: 2.6, a: 0.9 });
    // 屋檐
    sk(g, [[x0 - 40, top + 12], [cx, peak - 18], [x1 + 40, top + 12]], { w: 3.2, a: 0.92, over: 6 });
    sk(g, [[x0 - 40, top + 22], [cx, peak - 6], [x1 + 40, top + 22]], { w: 1.6, a: 0.6 });
    // 屋顶上的小旗
    sk(g, [[cx, peak - 18], [cx, peak - 78]], { w: 2, a: 0.85 });
    const fl = [[cx, peak - 78], [cx + 46 + Math.sin(t * 3) * 4, peak - 70 + Math.sin(t * 3 + 1) * 3], [cx, peak - 60]];
    part(g, fl, { tone: 0.5, w: 1.8, per: 3 });
    // 山墙上的圆窗（暖光）
    const rw = circlePath(cx, peak + 70, 30); paperFill(g, rw);
    g.save(); g.clip(rw); g.fillStyle = rgba(C.amber, 0.55); g.fillRect(cx - 40, peak + 30, 80, 80); g.restore();
    skEllipse(g, cx, peak + 70, 30, 30, { w: 2.4, a: 0.85 }); sk(g, [[cx - 30, peak + 70], [cx + 30, peak + 70]], { w: 1.6, a: 0.7 }); sk(g, [[cx, peak + 40], [cx, peak + 100]], { w: 1.6, a: 0.7 });
    glow(g, cx, peak + 70, 90, C.amber, 0.35 * (o.lights ?? 1));
    // 招牌："海边剧场"，四周一圈灯泡
    const mx0 = x0 + 90, mx1 = x1 - 90, my0 = 330, my1 = 405;
    const mp = rectPath(mx0, my0, mx1 - mx0, my1 - my0); paperFill(g, mp); shade(g, mp, 0.12, 0);
    skRect(g, mx0, my0, mx1 - mx0, my1 - my0, { w: 2.4, a: 0.9 });
    pencilText(g, '海边剧场', cx, (my0 + my1) / 2 + 2, 48);
    const nb = 22;
    for (let i = 0; i < nb; i++) {
      const u = i / (nb - 1);
      for (const yy of [my0 - 12, my1 + 12]) {
        const bx = lerp(mx0 + 6, mx1 - 6, u), on = (o.lights ?? 1) * (0.55 + 0.45 * ((Math.floor(t * 4) + i) % 3 === 0 ? 1 : 0.4));
        erase(g, circlePath(bx, yy, 4.5), 1);
        skEllipse(g, bx, yy, 4.5, 4.5, { w: 1, a: 0.5, passes: 1 });
        glow(g, bx, yy, 16, C.amberHot, 0.5 * on);
      }
    }
    glow(g, cx, (my0 + my1) / 2, 360, C.amber, 0.12 * (o.lights ?? 1));
    // 大门：拱门，门缝里漏出暖光
    const dx0 = cx - 80, dx1 = cx + 80, dy0 = 480;
    const door = new Path2D(); door.moveTo(dx0, base); door.lineTo(dx0, dy0 + 40); door.quadraticCurveTo(dx0, dy0 - 10, cx, dy0 - 14); door.quadraticCurveTo(dx1, dy0 - 10, dx1, dy0 + 40); door.lineTo(dx1, base); door.closePath();
    paperFill(g, door); shade(g, door, 0.72, 80);
    sk(g, [[dx0, base], [dx0, dy0 + 40], [cx - 40, dy0 - 6], [cx, dy0 - 14], [cx + 40, dy0 - 6], [dx1, dy0 + 40], [dx1, base]], { w: 2.6, a: 0.9 });
    sk(g, [[cx, dy0 - 14], [cx, base]], { w: 1.8, a: 0.8 });
    g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = rgba(C.amber, 0.55 * (o.lights ?? 1)); g.fillRect(cx - 3, dy0, 6, base - dy0); g.restore();
    glow(g, cx, base - 30, 120, C.amber, 0.3 * (o.lights ?? 1));
    // 两边的海报框
    for (const px of [x0 + 70, x1 - 170]) {
      const pp = rectPath(px, 450, 100, 140); paperFill(g, pp); shade(g, pp, 0.1, 0);
      skRect(g, px, 450, 100, 140, { w: 2, a: 0.85 });
      // 海报上画的小人（默剧演员）和字
      figure(g, 'him', px + 50, 560, 0.85, P({ aF: [100, 20], aB: [80, 30], hF: 'flat', hB: 'flat', look: 0.6 }), { seed: px, lw: 0.7 });
      pencilText(g, '沉默舞台剧', px + 50, 577, 15);
      glow(g, px + 50, 520, 90, C.amber, 0.12 * (o.lights ?? 1));
    }
    // 右边的侧门（演员出入口）
    const sd = rectPath(x1 - 70, 520, 46, base - 520); paperFill(g, sd); shade(g, sd, 0.6, 80);
    skRect(g, x1 - 70, 520, 46, base - 520, { w: 2, a: 0.85 });
  });
  // 一排串灯，从剧场挂到路灯
  stringLights(g, x1, top + 40, SEA.lampX, SEA.deck - 250, t, o.lights ?? 1);
}
function stringLights(g, xa, ya, xb, yb, t, on) {
  const pts = [];
  for (let i = 0; i <= 20; i++) { const u = i / 20; pts.push([lerp(xa, xb, u), lerp(ya, yb, u) + Math.sin(u * Math.PI) * 50]); }
  withSeed(6200, () => sk(g, pts, { w: 1.4, a: 0.7, passes: 1 }));
  for (let i = 1; i < 20; i += 2) {
    const [x, y] = pts[i];
    erase(g, circlePath(x, y + 7, 4), 1);
    glow(g, x, y + 7, 20, C.amberHot, 0.5 * on * (0.75 + 0.25 * Math.sin(t * 2 + i)));
  }
}
// ---------------- 远处的灯塔 ----------------
function lighthouse(g, x, hz, t, o = {}) {
  withSeed(6300, () => {
    const rock = [[x - 70, hz + 4], [x - 40, hz - 16], [x + 30, hz - 20], [x + 80, hz + 4]];
    part(g, rock, { tone: 0.8, w: 1.6 });
    const body = [[x - 12, hz - 14], [x - 8, hz - 92], [x + 8, hz - 92], [x + 12, hz - 14]];
    part(g, body, { tone: 0.35, w: 1.6, per: 2 });
    sk(g, [[x - 11, hz - 40], [x + 11, hz - 40]], { w: 1.2, a: 0.6 }); sk(g, [[x - 10, hz - 64], [x + 10, hz - 64]], { w: 1.2, a: 0.6 });
    const top = [[x - 12, hz - 92], [x - 12, hz - 108], [x, hz - 120], [x + 12, hz - 108], [x + 12, hz - 92]];
    part(g, top, { tone: 0.2, w: 1.6, per: 2 });
  });
  const a = t * 0.9, len = 520;
  g.save(); g.globalCompositeOperation = 'screen';
  const ex = Math.cos(a) * len, sx = Math.abs(Math.cos(a));
  beam(g, x, hz - 102, x + ex, hz - 112, 8, 60 * sx + 10, C.amberHot, 0.22 * sx * (o.on ?? 1), { layers: 3, endA: 0 });
  g.restore();
  glow(g, x, hz - 102, 26, C.amberHot, 0.7 * (o.on ?? 1));
}

// ---------------- 木栈道上（夜）：左边是剧场的侧墙和侧门，路灯，后面是栏杆和海 ----------------
// 屏幕坐标：栈道面 y=deck，路灯 x=lampX
function boardwalkNight(g, t, o = {}) {
  const deck = o.deck ?? 880, HZ = o.hz ?? 520, lampX = o.lampX ?? 1000;
  nightSky(g, -100, -100, W + 100, HZ + 2, t, { stars: 50, top: 0.9, bottom: 0.66, moon: o.moon, clouds: [[700, 120, 520, 3, 6]] });
  if (o.moon) moon(g, o.moon[0], o.moon[1], o.moon[2], t);
  sea(g, -100, W + 100, HZ, deck + 40, t, { waves: 50, v0: 0.72, v1: 0.86, moonX: o.moon ? o.moon[0] : null, pathA: 0.7 });
  // 栏杆
  withSeed(6400, () => {
    for (let x = -40; x < W + 60; x += 150) { const pp = rectPath(x - 6, deck - 140, 12, 140); paperFill(g, pp); shade(g, pp, 0.7, 80); sk(g, [[x - 6, deck - 140], [x - 6, deck]], { w: 1.8, a: 0.8 }); sk(g, [[x + 6, deck - 140], [x + 6, deck]], { w: 1.8, a: 0.8 }); }
    const rail = rectPath(-60, deck - 150, W + 120, 12); paperFill(g, rail); shade(g, rail, 0.55, 0);
    sk(g, [[-60, deck - 150], [W + 60, deck - 151]], { w: 2.2, a: 0.85 }); sk(g, [[-60, deck - 138], [W + 60, deck - 139]], { w: 1.6, a: 0.7 });
    sk(g, [[-60, deck - 80], [W + 60, deck - 81]], { w: 1.6, a: 0.6 });
  });
  // 栈道的木板（透视：往远处收）
  const dp = rectPath(-60, deck, W + 120, H - deck + 40); paperFill(g, dp); shade(g, dp, 0.55, 0);
  withSeed(6401, () => {
    sk(g, [[-60, deck], [W + 60, deck]], { w: 2.4, a: 0.9 });
    for (let k = 1; k < 7; k++) { const y = deck + k * k * 4.5; sk(g, [[-60, y], [W + 60, y + 1]], { w: 1.1, a: 0.42, passes: 1 }); }
    for (let i = -10; i < 30; i++) { const x = i * 110 + 40; sk(g, [[x, deck], [x + (x - W / 2) * 0.35, H + 40]], { w: 0.9, a: 0.28, passes: 1 }); }
  });
  // 剧场的侧墙（左边）
  if (o.wall !== false) {
    const wx = o.wallX ?? 420;
    const wp = rectPath(-60, -100, wx + 60, deck + 100); paperFill(g, wp); shade(g, wp, 0.66, 0);
    withSeed(6402, () => {
      for (let y = -80; y < deck; y += 26) sk(g, [[-60, y], [wx, y + 1]], { w: 1, a: 0.34, passes: 1 });
      sk(g, [[wx, -100], [wx, deck]], { w: 2.8, a: 0.9 });
      // 侧门，门缝里漏光
      const dx = wx - 190, dt = deck - 330;
      const door = rectPath(dx, dt, 130, 330); paperFill(g, door); shade(g, door, 0.78, 80);
      skRect(g, dx, dt, 130, 330, { w: 2.2, a: 0.9 });
      g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = rgba(C.amber, 0.5); g.fillRect(dx + 128, dt + 6, 5, 320); g.restore();
      glow(g, dx + 130, deck - 120, 140, C.amber, 0.22);
      // 门上的小牌子"后台"
      const sg = rectPath(dx + 25, dt + 40, 80, 34); paperFill(g, sg); skRect(g, dx + 25, dt + 40, 80, 34, { w: 1.4, a: 0.8 });
      pencilText(g, '后台', dx + 65, dt + 58, 22);
    });
  }
  if (o.lamp !== false) lampPost(g, lampX, deck, o.lampH ?? 520, t, { size: 1.6 });
}
