'use strict';
/* scenes2.js —— 开头的副歌（12.2~38.5 秒），现在，雨夜：
   S06 她撑着米白的伞走过下雨的街，看见站牌下淋湿的小猫，停下来把伞倾过去（"我总算学会了如何去爱"）。
   S07 路口，隔着车流，对面站着一个撑深蓝伞的人，像他；车灯一道道划过，再看时他转身走了。
   S08 俯拍：深蓝的伞混进伞海，再也找不到（"消失在人海"）。
   S09 侧脸特写，雨顺着脸流下来。
   S10 雨夜的窗，她坐在窗边的书桌前。
   S11 桌上的旧书里夹着一朵干了的栀子花；一片花瓣被风掀起来，越飞越白——飞回十七岁的夏天。 */

/* ---------------- 侧面的伞 ---------------- */
/* (hx,hy) 握伞的手，ang 伞往前倾的角度（0 = 竖直），r 伞面半径 */
function umbrellaSide(g, hx, hy, r, ang, col, o = {}) {
  const L = r * (o.len || 1.25), cx = hx + Math.sin(ang) * L, cy = hy - Math.cos(ang) * L;
  g.save();
  // 伞柄
  g.strokeStyle = '#3A302A'; g.lineWidth = r * .03; g.lineCap = 'round';
  g.beginPath(); g.moveTo(hx, hy + r * .06); g.lineTo(cx, cy); g.stroke();
  g.beginPath(); g.arc(hx - r * .05, hy + r * .06, r * .05, 0, PI); g.stroke();
  g.translate(cx, cy); g.rotate(ang);
  // 伞面：半个扁圆，下沿一折一折
  const h = r * .5, n = 8;
  g.beginPath(); g.moveTo(-r, 0);
  g.bezierCurveTo(-r * .9, -h * 1.1, r * .9, -h * 1.1, r, 0);
  for (let i = n; i > 0; i--) { const x0 = -r + 2 * r * i / n, x1 = -r + 2 * r * (i - 1) / n; g.quadraticCurveTo((x0 + x1) / 2, -r * .08, x1, 0); }
  g.closePath();
  g.fillStyle = lg(g, 0, -h, 0, 0, [[0, shade(col, 1.05)], [1, shade(col, .8)]]); g.fill();
  g.strokeStyle = rgba(shade(col, .65), .6); g.lineWidth = r * .012;
  for (let i = 1; i < n; i++) { const x = -r + 2 * r * i / n; g.beginPath(); g.moveTo(x * .1, -h * .95); g.quadraticCurveTo(x * .7, -h * .7, x, -r * .04); g.stroke(); }
  if (o.glow) { g.fillStyle = rg(g, 0, -h * .4, 0, r * 1.1, [[0, rgba(o.glow, .35)], [1, rgba(o.glow, 0)]]); g.fill(); }
  g.fillStyle = '#3A302A'; g.fillRect(-r * .015, -h * 1.05 - r * .1, r * .03, r * .12);
  g.restore();
  return [cx, cy];
}

/* ---------------- 雨夜的街（侧面） ---------------- */
const SHOP_SIGNS = ['花店', '便利店', '咖啡', '书店', '面馆', '药房', '眼镜', '照相'];
function shopRow() {
  return cached('shopRow', 3600, 900, (g) => {
    const r = R(14); let x = 0, k = 0;
    while (x < 3600) {
      const w = 380 + r() * 260, top = 40 + r() * 180, c = ['#1B1F2E', '#22202C', '#1A2230', '#262433'][k % 4];
      g.fillStyle = c; g.fillRect(x, top, w - 6, 900 - top);
      // 楼上的窗
      for (let wy = top + 30; wy < 420; wy += 90) for (let wx = x + 30; wx < x + w - 70; wx += 110) {
        g.fillStyle = r() < .45 ? `rgba(255,${200 + ri(r() * 40)},${130 + ri(r() * 50)},.75)` : 'rgba(40,50,70,.9)'; g.fillRect(wx, wy, 60, 54);
      }
      // 店面：暖光的橱窗
      const sy = 520;
      g.fillStyle = lg(g, 0, sy, 0, 900, [[0, '#FFD9A0'], [1, '#E08A50']]); g.globalAlpha = .85; g.fillRect(x + 30, sy, w - 70, 380); g.globalAlpha = 1;
      g.fillStyle = 'rgba(40,30,40,.55)'; for (let i = 0; i < 3; i++) g.fillRect(x + 30 + (w - 70) * (i + 1) / 4 - 3, sy, 6, 380);
      // 遮阳棚
      g.fillStyle = ['#7A2E3A', '#2E5A6A', '#5A4A2A', '#3A3A6A'][k % 4]; g.fillRect(x + 10, sy - 60, w - 30, 50);
      for (let i = 0; i < (w - 30) / 40; i++) { g.fillStyle = i % 2 ? 'rgba(255,255,255,.12)' : 'rgba(0,0,0,.1)'; g.fillRect(x + 10 + i * 40, sy - 60, 40, 50); }
      // 霓虹招牌
      const col = ['#FF5F92', '#5FE0FF', '#FFC45F', '#B88CFF'][k % 4], name = SHOP_SIGNS[k % SHOP_SIGNS.length];
      g.save(); g.font = `700 64px ${FONT.serif}`; g.textAlign = 'center'; g.textBaseline = 'middle';
      g.shadowColor = col; g.shadowBlur = 30; g.fillStyle = shade(col, 1.3); g.fillText(name, x + w / 2, sy - 130);
      g.shadowBlur = 10; g.fillText(name, x + w / 2, sy - 130); g.restore();
      x += w; k++;
    }
  });
}
/* 街：camX 镜头（世界坐标），groundY 路面 */
function streetNight(g, t, camX, o = {}) {
  const gy = o.gy || 1500;
  g.fillStyle = lg(g, 0, 0, 0, gy, [[0, '#070A16'], [.6, '#141A30'], [1, '#2A2440']]); g.fillRect(0, 0, W, gy);
  const sk = skyline(21, 2400, 700, { col: '#0E1222', lit: .2 });
  const sx = -mod(camX * .2, 2400);
  g.drawImage(sk, sx, gy - 1300); g.drawImage(sk, sx + 2400, gy - 1300);
  const row = shopRow(), rx = -mod(camX * .6, 3600);
  g.drawImage(row, rx, gy - 900); g.drawImage(row, rx + 3600, gy - 900);
  // 路面：湿的，倒映着橱窗和霓虹
  g.fillStyle = lg(g, 0, gy, 0, H, [[0, '#1E1A26'], [1, '#0B0C12']]); g.fillRect(0, gy, W, H - gy);
  g.save(); g.globalAlpha = .45; g.translate(0, gy * 2); g.scale(1, -1);
  g.filter = 'blur(6px)';
  g.drawImage(row, rx, gy - 900, 3600, 900); g.drawImage(row, rx + 3600, gy - 900, 3600, 900);
  g.restore();
  g.fillStyle = lg(g, 0, gy, 0, H, [[0, 'rgba(10,10,18,.2)'], [1, 'rgba(10,10,18,.85)']]); g.fillRect(0, gy, W, H - gy);
  // 路灯
  for (let i = -1; i < 4; i++) {
    const lx = i * 700 - mod(camX, 700) + 350, ly = gy - 980;
    g.fillStyle = '#0E0F16'; g.fillRect(lx - 7, ly, 14, 980);
    g.fillRect(lx - 7, ly, 90, 10);
    glow(g, lx + 80, ly + 18, 260, '#FFD49A', .55); circ(g, lx + 80, ly + 18, 14, '#FFF3D6');
    // 灯下的雨丝更亮
    g.save(); g.beginPath(); g.moveTo(lx + 80, ly + 18); g.lineTo(lx - 260, gy); g.lineTo(lx + 420, gy); g.closePath(); g.clip();
    g.fillStyle = lg(g, 0, ly, 0, gy, [[0, 'rgba(255,220,160,.18)'], [1, 'rgba(255,220,160,0)']]); g.fillRect(lx - 300, ly, 760, gy - ly);
    rain(g, t + i, { n: 40, len: 50, lw: 2, col: 'rgba(255,235,200,.45)', seed: 30 + i });
    g.restore();
    g.fillStyle = 'rgba(255,214,150,.18)'; g.beginPath(); g.ellipse(lx + 80, gy + 60, 220, 30, 0, 0, TAU); g.fill();
  }
}

/* ---------------- 小猫（侧面坐着） ---------------- */
function kitten(g, x, y, s, t, o = {}) {
  const sh = Math.sin(t * 40) * (o.shiver || 0) * s * .01;
  g.save(); g.translate(x + sh, y); g.scale(s / 100, s / 100);
  const c = o.col || '#D9893E', cl = '#F3E6D6';
  g.fillStyle = c;
  g.beginPath(); g.moveTo(-40, 0); g.bezierCurveTo(-60, -10, -70, 40, -110, 30); g.bezierCurveTo(-70, 60, -40, 20, -30, 2); g.fill();  // 尾巴
  ell(g, 0, -30, 42, 34, 0, c);                              // 身子
  ell(g, 12, -10, 26, 12, 0, cl);
  const hy = -70 + (o.look || 0) * -6;
  ell(g, 26, hy, 30, 27, 0, c);                              // 头
  poly(g, [[8, hy - 18], [12, hy - 46], [26, hy - 24]]); g.fill(); poly(g, [[30, hy - 24], [44, hy - 46], [50, hy - 16]]); g.fill();
  ell(g, 36, hy + 10, 14, 9, 0, cl);
  circ(g, 40, hy - 2, 4.5, '#1B1A1A'); circ(g, 41.5, hy - 3.5, 1.5, '#FFFFFF');
  if (o.wet) { g.strokeStyle = 'rgba(200,220,255,.6)'; g.lineWidth = 2; for (let i = 0; i < 5; i++) { g.beginPath(); g.moveTo(-30 + i * 14, -55); g.lineTo(-32 + i * 14, -40); g.stroke(); } }
  g.restore();
}

/* ---------------- S06 雨中走，给小猫撑伞 ---------------- */
function shWalkRain(g, t, s) {
  const lt = t - s.t, stopT = 2.2;                      // 走到小猫旁边停下
  const walked = lt < stopT ? lt : stopT + E.out(seg(lt, stopT, stopT + .6)) * .3;
  const camX = walked * 210;
  streetNight(g, t, camX);
  const gy = 1500;
  // 站牌和长凳（世界坐标 x=1050）
  const bx = 650 - camX + 540;
  g.fillStyle = '#20232C'; g.fillRect(bx - 6, gy - 560, 12, 560); g.fillRect(bx + 236, gy - 560, 12, 560);
  g.fillStyle = 'rgba(160,200,230,.18)'; g.fillRect(bx, gy - 560, 240, 380);
  g.fillStyle = '#5A3E2E'; g.fillRect(bx - 20, gy - 150, 290, 20);
  kitten(g, bx + 110, gy - 150, 100, t, { shiver: lt < stopT + .8 ? 1 : .2, wet: 1, look: seg(lt, stopT + .3, stopT + .8) });
  // 她
  const tilt = E.io(seg(lt, stopT + .2, stopT + 1.1));
  const x = 360 + (lt > stopT ? E.out(seg(lt, stopT, stopT + .6)) * 60 : 0), y = gy + 10, h = 860;
  const walkP = walked * .9, moving = lt < stopT + .3;
  const pose = moving ? POSE.walk(walkP, 1 - seg(lt, stopT - .3, stopT + .3)) : POSE.stand();
  pose.lean = (pose.lean || 0) + tilt * .32; pose.head = (pose.head || 0) + tilt * .3;
  const L = { x: .6, y: -.8, rim: '#FFD9A8', rimA: .7, sh: .35, col: '#141026' };
  pose.arms[0] = { sh: lerp(.25, .6, tilt), el: lerp(1.75, .3, tilt) };
  const F = { x, y, h, who: 'woman', view: 'side', dir: 1, pose, light: L, eyes: tilt > .5 ? 'down' : 'open', swing: .1 };
  fig(g, F);
  umbrellaSide(g, F.hand0[0] + 6, F.hand0[1], lerp(330, 290, tilt), lerp(-.05, .8, tilt), HER_UMB, { glow: '#FFD9A0', len: lerp(1.25, .85, tilt) });
  // 她背上淋到的雨（伞倾出去以后）
  rain(g, t, { n: 180, len: 80, lw: 2, col: 'rgba(200,220,255,.3)', speed: 2600, seed: 12 });
  if (tilt > .3) { g.save(); g.globalAlpha = tilt; g.fillStyle = 'rgba(180,200,240,.12)'; g.fillRect(x - 200, 600, 260, 900); g.restore(); }
  splashes(g, t, { n: 50, y0: gy + 20, y1: H, flat: .25 });
}

/* ---------------- S07 路口：对面的人 ---------------- */
function shCrossing(g, t, s) {
  const lt = t - s.t;
  const gy = 900;
  g.fillStyle = lg(g, 0, 0, 0, gy, [[0, '#080B18'], [1, '#1C1A30']]); g.fillRect(0, 0, W, gy);
  g.drawImage(shopRow(), -400 - lt * 10, gy - 700, 2800, 700);
  g.fillStyle = 'rgba(8,10,20,.35)'; g.fillRect(0, 0, W, gy);
  // 马路
  g.fillStyle = lg(g, 0, gy, 0, H, [[0, '#191722'], [1, '#0A0A10']]); g.fillRect(0, gy, W, H - gy);
  for (let i = 0; i < 6; i++) { g.fillStyle = 'rgba(220,220,230,.22)'; const y = gy + 30 + i * 70 + i * i * 6; g.fillRect(0, y, W, 18 + i * 4); }
  // 对面的他：深蓝的伞，站在红灯下
  const leave = seg(lt, 1.6, 2.8), hx = 700 + E.in2(leave) * 260, hy = gy + 10;
  g.fillStyle = '#FF3B3B'; glow(g, 870, gy - 330, 70, '#FF3B3B', .8); g.fillRect(860, gy - 300, 8, 300);
  circ(g, 870, gy - 330, 14, '#FF6A6A');
  if (leave < 1) {
    const pose = leave > 0 ? POSE.walk(lt * 1.1, .8) : POSE.stand();
    pose.arms[0] = { sh: .3, el: 1.6 };
    const back = leave > .05, F = { x: hx, y: hy, h: 300, who: 'man', view: back ? 'back' : 'side', dir: -1, pose, light: { x: -.5, y: -.8, rim: '#FF9A9A', rimA: .6, sh: .4 }, alpha: 1 - seg(leave, .7, 1) };
    if (back) F.pose = { arms: [{ sh: .1 }, { sh: .5, el: 1.9 }] };
    fig(g, F);
    g.globalAlpha = 1 - seg(leave, .7, 1);
    const hd = back ? F.hand1 : F.hand0; umbrellaSide(g, hd[0], hd[1], 120, .05, HIS_UMB); g.globalAlpha = 1;
  }
  // 车流：车灯划过，挡住视线
  for (let i = 0; i < 5; i++) {
    const per = 1.3 + i * .37, k = mod(lt + i * .53, per) / per, dir = i % 2 ? 1 : -1, y = gy + 160 + (i % 3) * 120;
    const x = dir > 0 ? lerp(-900, W + 900, k) : lerp(W + 900, -900, k), col = dir > 0 ? '#FF4A3A' : '#FFF2D0';
    g.save(); g.globalCompositeOperation = 'screen';
    g.fillStyle = lg(g, x - dir * 700, 0, x, 0, [[0, rgba(col, 0)], [1, rgba(col, .85)]]); g.fillRect(Math.min(x, x - dir * 700), y - 7, 700, 14);
    glow(g, x, y, 90, col, .7);
    g.restore();
  }
  // 公交车开过去（1.3~1.9 秒）
  const bus = seg(lt, 1.15, 2.05);
  if (bus > 0 && bus < 1) {
    const bx = lerp(W + 100, -1500, bus);
    g.fillStyle = '#1F3A3A'; g.fillRect(bx, gy - 340, 1400, 380);
    for (let i = 0; i < 9; i++) { g.fillStyle = 'rgba(255,236,190,.75)'; g.fillRect(bx + 60 + i * 150, gy - 300, 120, 120); }
    g.fillStyle = '#0E1A1A'; circ(g, bx + 220, gy + 40, 60); circ(g, bx + 1150, gy + 40, 60);
  }
  rain(g, t, { n: 160, len: 70, lw: 2, col: 'rgba(200,220,255,.28)', seed: 41 });
  // 前景：她的背影和伞，在左下
  const L = { x: .5, y: -.8, rim: '#FFD0A0', rimA: .5, sh: .5, col: '#0E0C1C' };
  const F = { x: 300, y: H + 260, h: 1500, who: 'woman', view: 'back', light: L, wind: .15, pose: { arms: [{ sh: .1 }, { sh: .45, el: 1.9 }] } };
  fig(g, F);
  umbrellaSide(g, F.hand1[0], F.hand1[1] + 30, 520, -.1, HER_UMB, { glow: '#FFD9A0' });
  bokeh(g, t, { n: 10, seed: 3, size: 120, a: .25, y: 0, h: 900 });
}

/* ---------------- S08 伞海：他消失在人海 ---------------- */
function shSeaLost(g, t, s) {
  const lt = t - s.t, z = lerp(1.15, .78, E.io(seg(lt, 0, s.e - s.t)));
  umbrellaSea(g, t, {
    seed: 9, n: 70, herY: 520 - E.out(seg(lt, 0, 1.2)) * 200, cam: { x: 0, y: 100 - lt * 40, rot: .04 - lt * .02, z },
    his: (crowd, tt) => {
      // 他的伞从中间往上走，被越来越多的深色伞围住，1.6 秒以后找不到了
      const lost = seg(lt, 1.0, 1.9);
      const hx = 30 + Math.sin(lt) * 20, hy = 120 - lt * 170;
      crowd.forEach((c, i) => { if (i % 4 === 0) c.col = HIS_UMB; });
      if (lost < 1) {
        crowd.push({ x: hx, y: hy, rad: 92, col: HIS_UMB, rot: lt * .3, i: -1 });
        // 一圈伞往他身边挤
        for (let k = 0; k < 6; k++) { const a = k / 6 * TAU + lt, d = lerp(260, 120, lost); crowd.push({ x: hx + Math.cos(a) * d, y: hy + Math.sin(a) * d, rad: 90, col: k % 2 ? HIS_UMB : '#1E222C', rot: a, i: 100 + k }); }
      }
    },
  });
}

/* ---------------- S09 侧脸，雨像眼泪 ---------------- */
function shFaceRain(g, t, s) {
  const lt = t - s.t;
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#0B0E1E'], [1, '#160F22']]); g.fillRect(0, 0, W, H);
  bokeh(g, t, { n: 28, seed: 12, size: 130, a: .5, cols: ['#FF5F92', '#5FE0FF', '#FFC45F', '#FFE8C8'] });
  const L = { x: -.7, y: -.5, rim: '#FF8FB8', rimA: .9, rimW: .0016, sh: .45, col: '#0A0818' };
  const tearY = E.in2(seg(lt, .5, 1.9));
  fig(g, { x: 700, y: 5600, h: 5100, who: 'woman', view: 'side', dir: -1, light: L, eyes: lt > 1.2 ? 'closed' : 'down', pose: { head: .12 + lt * .02, lean: 0, arms: [{ sh: 0, el: 0 }, { sh: 0, el: 0 }] }, tear: .9, tearY, wind: .1 });
  rain(g, t, { n: 60, len: 140, lw: 4, col: 'rgba(200,220,255,.18)', speed: 2000, seed: 77 });
}

/* ---------------- S10 雨夜的窗 ---------------- */
function rainGlass(g, t, x0, y0, w, h, o = {}) {
  // 玻璃上的水珠和往下淌的水痕
  const r = R(o.seed || 19);
  g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip();
  for (let i = 0; i < (o.n || 140); i++) {
    const x = x0 + r() * w, y = y0 + r() * h, s = 3 + r() * 9;
    g.fillStyle = 'rgba(210,225,255,.22)'; g.beginPath(); g.ellipse(x, y, s * .8, s, 0, 0, TAU); g.fill();
    g.fillStyle = 'rgba(255,255,255,.45)'; circ(g, x - s * .25, y - s * .3, s * .28);
  }
  for (let i = 0; i < 14; i++) {
    const x = x0 + r() * w, sp = 120 + r() * 200, ph = r() * h, len = 120 + r() * 260, y = y0 + mod(ph + t * sp, h + len) - len;
    g.strokeStyle = 'rgba(220,235,255,.3)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x, y); g.quadraticCurveTo(x + 6, y + len * .5, x - 3, y + len); g.stroke();
    g.fillStyle = 'rgba(230,240,255,.6)'; g.beginPath(); g.ellipse(x - 3, y + len, 6, 8, 0, 0, TAU); g.fill();
  }
  g.restore();
}
function roomInside(g, t, o = {}) {
  // 屋里：暖黄的台灯、书架、书桌
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#3A2A2A'], [1, '#1C1418']]); g.fillRect(0, 0, W, H);
  glow(g, 300, 900, 700, '#FFB060', .45);
  g.fillStyle = '#2A1E1E'; g.fillRect(0, 1250, W, 670);                            // 桌子
  g.fillStyle = '#4A3428'; g.fillRect(0, 1240, W, 24);
  // 台灯
  g.fillStyle = '#2A2020'; g.fillRect(240, 980, 12, 260); ell(g, 246, 1240, 60, 12, 0, '#2A2020');
  g.fillStyle = '#E9C68A'; poly(g, [[170, 980], [320, 980], [280, 880], [210, 880]]); g.fill();
  glow(g, 246, 990, 300, '#FFD08A', .7);
  // 书架
  for (let r2 = 0; r2 < 3; r2++) { g.fillStyle = '#2C2020'; g.fillRect(620, 520 + r2 * 200, 420, 14); for (let i = 0; i < 12; i++) { g.fillStyle = ['#6A3A3A', '#3A4A5A', '#7A6A4A', '#4A3A5A'][(i + r2) % 4]; g.fillRect(630 + i * 33, 520 + r2 * 200 - 120 - (i * 7 % 30), 28, 120 + (i * 7 % 30)); } }
}
function shWindowRain(g, t, s) {
  const lt = t - s.t, z = 1.0 + lt * .025;
  g.save(); g.translate(W * .6, H * .55); g.scale(z, z); g.translate(-W * .6, -H * .55);
  roomInside(g, t);
  // 窗台的软垫，她抱着膝盖坐在上面（侧面，朝左看着窗外）
  const by = 1330;
  g.fillStyle = '#5A4A4A'; g.fillRect(380, by, 700, 40); g.fillStyle = '#3A2C2E'; g.fillRect(380, by + 40, 700, 600);
  g.fillStyle = '#8A7A86'; spline(g, [[880, by], [1000, by - 150], [1080, by - 140], [1080, by]], true, .4); g.fill();   // 靠垫
  const L = { x: -.8, y: -.3, rim: '#BFD4FF', rimA: .55, sh: .35, col: '#120A10', warm: '#FFB060', warmA: .25 };
  const u = 880 / 7.3;
  fig(g, { x: 760, y: by + 4, h: 880, who: 'woman', view: 'side', dir: -1, pose: { lean: -.12, head: .18 - seg(lt, 2.4, 3.6) * .22, hip: 3.82 - .3, legs: [{ th: 1.57, kn: 0 }, { th: 1.52, kn: .05 }], arms: [{ sh: .35, el: .7 }, { sh: .25, el: .8 }] }, light: L, eyes: lt > 2.6 ? 'open' : 'down' });
  g.restore();
  g.save();
  g.fillStyle = 'rgba(30,40,70,.26)'; g.fillRect(0, 0, W, H);
  g.globalAlpha = .35; bokeh(g, t, { n: 24, seed: 33, size: 110, a: .5, cols: ['#5FE0FF', '#FF7FA8', '#FFD49A'] }); g.globalAlpha = 1;
  rainGlass(g, t, 0, 0, W, H, { n: 220, seed: 4 });
  // 窗框：镜头在窗外，竖框在左边
  g.fillStyle = '#15131C';
  g.fillRect(0, 0, W, 100); g.fillRect(0, H - 130, W, 130); g.fillRect(0, 0, 60, H); g.fillRect(W - 60, 0, 60, H); g.fillRect(300, 0, 30, H); g.fillRect(0, 760, 330, 26);
  g.restore();
  rain(g, t, { n: 80, len: 90, lw: 2, col: 'rgba(200,220,255,.2)', seed: 51 });
  // 楼下开过一辆车，车灯的光从屋里扫过去
  const sw = seg(lt, 2.0, 3.4);
  if (sw > 0 && sw < 1) {
    const x = lerp(-500, W + 500, E.io(sw)), a = Math.sin(sw * PI) * .32;
    g.save(); g.globalCompositeOperation = 'screen';
    g.fillStyle = lg(g, x - 260, 0, x + 260, 0, [[0, 'rgba(255,240,210,0)'], [.5, `rgba(255,240,210,${a})`], [1, 'rgba(255,240,210,0)']]);
    poly(g, [[x - 160, 0], [x + 160, 0], [x + 360, H], [x - 360, H]]); g.fill(); g.restore();
  }
}

/* ---------------- S11 旧书里的干栀子花 ---------------- */
function oldBook(g, t, o = {}) {
  g.fillStyle = lg(g, 0, 0, W, H, [[0, '#2C2020'], [1, '#160E10']]); g.fillRect(0, 0, W, H);
  // 木纹
  g.strokeStyle = 'rgba(80,50,40,.35)'; g.lineWidth = 3;
  for (let i = 0; i < 30; i++) { g.beginPath(); g.moveTo(0, i * 70 + 20); g.bezierCurveTo(300, i * 70 + 40, 700, i * 70, W, i * 70 + 30); g.stroke(); }
  glow(g, 200, 300, 900, '#FFB060', .35);
  // 书：两页
  const cx = 540, cy = 960, pw = 470, ph = 680;
  g.save(); g.translate(cx, cy); g.rotate(-.05);
  g.shadowColor = 'rgba(0,0,0,.6)'; g.shadowBlur = 40; g.fillStyle = '#E2D3B0'; g.fillRect(-pw - 10, -ph / 2 - 10, pw * 2 + 20, ph + 20); g.shadowColor = 'transparent';
  for (const sd of [-1, 1]) {
    g.fillStyle = lg(g, 0, 0, sd * pw, 0, [[0, '#BFAE88'], [.12, '#EDE0C2'], [1, '#E6D7B6']]);
    g.beginPath(); g.moveTo(0, -ph / 2); g.quadraticCurveTo(sd * pw * .5, -ph / 2 - 16, sd * pw, -ph / 2); g.lineTo(sd * pw, ph / 2); g.quadraticCurveTo(sd * pw * .5, ph / 2 - 16, 0, ph / 2); g.closePath(); g.fill();
    g.strokeStyle = 'rgba(90,70,50,.22)'; g.lineWidth = 6;
    for (let l = 0; l < 17; l++) { const y = -ph / 2 + 70 + l * 34; g.beginPath(); g.moveTo(sd * 50, y); g.lineTo(sd * (pw - 50 - (l % 5 === 4 ? 160 : 0)), y); g.stroke(); }
  }
  g.restore();
}
function shOldBook(g, t, s) {
  const lt = t - s.t;
  const z = 1 + lt * .02;
  g.save(); g.translate(W / 2, H / 2); g.scale(z, z); g.translate(-W / 2, -H / 2);
  oldBook(g, t);
  // 夹着的拍立得、干花
  polaroid(g, 740, 1180, 300, .18, photoSummer, { age: .7 });
  const fx = 470, fy = 900, fr = 150;
  // 干花（被压扁的）：一片花瓣在"不再"时被掀起来
  gardenia(g, fx, fy, fr, .4, { aged: 1, tilt: .92 });
  // 她的手伸过来，指尖碰一碰干花
  const reach = E.io(seg(lt, .2, 1.6)) - E.io(seg(lt, 3.0, 3.8));
  hand(g, lerp(-120, 150, reach), lerp(1780, 1330, reach), 1.5, -1.05, 'point');
  g.restore();
  // 花瓣飞起来：35.1 秒（"不"）掀起，越飞越大、越来越白，最后扑到镜头上
  const t0 = ch(6, 8), u = seg(t, t0, s.e);
  if (u > 0) {
    const img = petalImg(), k = E.in2(u);
    const x = lerp(fx + 60, 540, E.io(u)) + Math.sin(u * 9) * 120 * (1 - u), y = lerp(fy - 40, 820, E.io(u)) - Math.sin(u * PI) * 300;
    const size = lerp(70, 2600, Math.pow(u, 3)), rot = u * 5 + .5;
    const q = layer('flyPetal', 256, 384);
    q.drawImage(img, 0, 0, 256, 384);
    q.globalCompositeOperation = 'source-atop'; q.fillStyle = rgba('#B08A5A', 1 - seg(u, .1, .6)); q.fillRect(0, 0, 256, 384);
    glow(g, x, y, size * .9, '#FFF4D8', .6 * seg(u, .2, .7));
    g.save(); g.translate(x, y); g.rotate(rot); g.scale(Math.max(.3, Math.abs(Math.cos(u * 7))), 1);
    g.drawImage(LAYER.flyPetal, -size * .33, -size * .5, size * .66, size); g.restore();
    g.fillStyle = `rgba(255,252,240,${E.in2(seg(u, .82, 1))})`; g.fillRect(0, 0, W, H);
  }
}
