'use strict';
/* scenes1.js：开头（七年后，他坐绿皮火车回小城）和第一段主歌（下车、出站、走到老街，风把纸飞机吹走）。
   时间都是歌曲时间 s；bar(n) 是第 n 小节的强拍（75 BPM，一小节 3.2 秒）。 */

/* ---------- 常用：镜头、风、叶子、模糊的背景 ---------- */
/* 镜头：以 (cx, cy) 为中心放大 z 倍，转 rot */
function cam(g, cx, cy, z = 1, rot = 0) { g.translate(W / 2, H / 2); if (rot) g.rotate(rot); g.scale(z, z); g.translate(-cx, -cy); }
/* 风：一道道弯的白线从左往右扫过去 */
function windStreaks(g, s, n, a = .3, o = {}) {
  if (a <= .01) return;
  g.save(); g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < n; i++) {
    const y = (o.y0 ?? 80) + hash(i, 140) * ((o.y1 ?? 1000) - (o.y0 ?? 80)), sp = (o.sp ?? 1400) * (.7 + hash(i, 141) * .7), len = 160 + hash(i, 142) * 360;
    const x = -500 + ((s * sp + hash(i, 143) * 3000) % (W + 900));
    const wav = Math.sin(s * 3 + i) * 18;
    g.strokeStyle = lgrad(g, x, y, x + len, y, [[0, 'rgba(255,255,255,0)'], [.6, `rgba(255,255,255,${a})`], [1, 'rgba(255,255,255,0)']]);
    g.lineWidth = 2 + hash(i, 144) * 2.5; g.lineCap = 'round';
    g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + len * .3, y - 20 + wav, x + len * .7, y + 20 - wav, x + len, y - 6); g.stroke();
  }
  g.restore();
}
/* 被风卷着跑的叶子 */
function leavesBlow(g, s, n, box, a = 1, o = {}) {
  const cols = o.cols || ['#6FB55A', '#4E9A47', '#A8D46E', '#3E8A4A'];
  for (const p of floaters(s, o.seed || 131, n, box, { vy: o.vy ?? -40, vx: o.vx ?? 700, amp: 60, wob: 2 })) {
    const r = (o.size ?? 14) * (.6 + p.sz * .8);
    g.save(); g.translate(p.x, p.y); g.rotate(s * 6 * (1 + p.sz) + p.ph); g.scale(1, .45 + .55 * Math.abs(Math.sin(s * 5 + p.ph)));
    g.globalAlpha *= a; g.beginPath(); g.moveTo(-r, 0); g.quadraticCurveTo(0, -r * .7, r, 0); g.quadraticCurveTo(0, r * .7, -r, 0); g.fillStyle = cols[p.i % cols.length]; g.fill();
    g.restore();
  }
}
/* 模糊的背景：先画到小画布上再放大（比 CSS blur 快） */
const _soft = mk(480, 270), _softG = _soft.getContext('2d');
function soft(g, fn, a = 1) {
  _softG.setTransform(.25, 0, 0, .25, 0, 0); _softG.globalAlpha = 1; _softG.globalCompositeOperation = 'source-over'; _softG.filter = 'none';
  fn(_softG);
  _softG.setTransform(1, 0, 0, 1, 0, 0);
  g.save(); g.globalAlpha *= a; g.imageSmoothingQuality = 'high'; g.drawImage(_soft, 0, 0, W, H); g.restore();
}
/* 大字（开头的问话、结尾的问话）：一个字一个字出来，out > 0 时被风吹散 */
function bigLines(g, s, lines, inK, out, o = {}) {
  lines.forEach(([str, px, k, x0, y0, ls, col], li) => {
    let x = x0;
    [...str].forEach((ch, i) => {
      const cw = tw(g, ch, px, k, 0) + ls;
      const ap = o.instant ? 1 : E.out(clamp((inK - i * .05 - li * .12) / .35));
      const d = clamp(out * 1.7 - i * .07 - li * .12);
      const a = ap * (1 - E.in(d));
      if (a > .01) {
        const fx = x + E.in(d) * (700 + i * 60), fy = y0 - E.in(d) * (90 + hash(i, li) * 180) + (1 - ap) * 20;
        text(g, ch, fx + cw / 2, fy, px, { k, col: col || '#FFFFFF', alpha: a, rot: E.in(d) * (hash(i, li, 2) - .3) * 2, shadow: 'rgba(14,16,30,.85)', sblur: 14, sy: 4, stroke: 'rgba(30,30,50,.55)', lw: px * .06, glow: o.glow || '#FFE2B0', gr: px * .25, ga: .35 * a });
      }
      x += cw;
    });
  });
}

/* ================= 开头：火车上 ================= */
/* 第 0 小节（视频第一帧）：他坐在靠窗的位置，低头看手里一只发黄的纸飞机。大字"如果能回到高中，你最想见谁？" */
function sTrain(g, s, k) {
  const T = s - TRIM;
  const x = s * 900;
  g.save(); cam(g, 1000, 560, 1.02 + T * .012);
  trainInterior(g, s, { tod: 'present', x });
  const blink = [1.0, 2.6].some(b => T > b && T < b + .13);
  person(g, { who: 'he', outfit: 'shirt', x: 1430, y: 880, u: 78, face: -1, pose: POSE.sitHold, t: s, eyes: blink ? 'closed' : 'half', light: LIGHT.present,
    hold: (gg, u) => paperPlane(gg, u * 1.05, -u * .55, u * .62, -.3 + Math.sin(s * 2) * .03, { old: true }) });
  g.restore();
  hookShade(g, 1 - seg(T, 3.0, 3.8));
  const out = seg(T, 3.0, 3.75);
  bigLines(g, s, [['如果能回到高中，', 104, 'serifX', 120, 260, 6], ['你最想见谁？', 136, 'serifX', 120, 430, 10, '#FFF1D6']], 9, out, { instant: true });
}
/* 大字后面垫的暗渐变（左上角），亮背景上也看得清 */
function hookShade(g, a) {
  if (a <= .01) return;
  g.save(); g.globalAlpha = a;
  g.fillStyle = rgrad(g, 420, 330, 60, 900, [[0, 'rgba(20,22,40,.62)'], [.55, 'rgba(20,22,40,.3)'], [1, 'rgba(20,22,40,0)']]);
  g.fillRect(0, 0, W, H); g.restore();
}
/* 第 1 小节：纸飞机的特写。机翼上铅笔写着 2018.6.7，还有一只像素小怪；里面折着的那面看得出写过字 */
/* 捏着纸飞机机身折边的手（侧面看）。局部坐标：原点在捏住的地方，+x 指向指尖，前臂往 -x 伸出画面。
   back = true 只画伸到纸后面的食指（要在纸飞机之前画），否则画袖子、手掌、蜷着的三根手指和压在纸前面的拇指 */
function pinchHand(g, px, py, sz, ang, back) {
  const skin = '#EFC7AE', dk = '#DDAE94', k = sz / 250;
  g.save(); g.translate(px, py); g.rotate(ang); g.translate(-sz * 1.32, sz * .1); g.rotate(-.62); g.scale(k, k);
  if (back) { line(g, -70, 44, -14, 6, dk, 30); line(g, -14, 6, 10, -2, dk, 28); g.restore(); return; }
  // 袖子（白衬衫）和手腕
  g.fillStyle = '#F6F8FB'; g.beginPath(); g.moveTo(-250, 30); g.lineTo(-760, 60); g.lineTo(-760, 250); g.lineTo(-245, 150); g.closePath(); g.fill();
  g.fillStyle = 'rgba(120,130,150,.12)'; g.beginPath(); g.moveTo(-760, 190); g.lineTo(-248, 125); g.lineTo(-245, 150); g.lineTo(-760, 250); g.closePath(); g.fill();
  g.fillStyle = skin; g.beginPath(); g.moveTo(-262, 38); g.quadraticCurveTo(-200, 20, -150, 18); g.lineTo(-130, 140); g.quadraticCurveTo(-200, 150, -258, 146); g.closePath(); g.fill();
  // 手掌（手背朝外）：一块圆角的掌，前面是蜷起来的中指、无名指、小指
  g.fillStyle = skin; g.beginPath(); g.moveTo(-170, 20); g.bezierCurveTo(-120, -6, -60, 4, -30, 40); g.bezierCurveTo(-10, 80, -30, 140, -80, 150); g.bezierCurveTo(-130, 158, -170, 150, -180, 120); g.closePath(); g.fill();
  for (let i = 0; i < 3; i++) { const fx = -42 - i * 30, fy = 70 + i * 26; ell(g, fx, fy, 30, 22, -.5); g.fillStyle = skin; g.fill(); g.strokeStyle = 'rgba(160,100,80,.35)'; g.lineWidth = 3; g.beginPath(); g.ellipse(fx, fy, 30, 22, -.5, -.3, 1.9); g.stroke(); }
  // 食指根部（从手掌伸出去，绕到纸后面）
  line(g, -96, 46, -66, 42, skin, 32);
  // 拇指压在纸前面：两节，指甲
  line(g, -150, 30, -60, -2, skin, 40); line(g, -60, -2, 4, -14, skin, 34);
  g.strokeStyle = 'rgba(160,100,80,.35)'; g.lineWidth = 3; g.beginPath(); g.moveTo(-64, 12); g.quadraticCurveTo(-58, 2, -60, -10); g.stroke();
  g.fillStyle = 'rgba(255,240,235,.75)'; ell(g, -8, -20, 13, 8, -.2); g.fill();
  g.restore();
}
function sPlane(g, s, k) {
  soft(g, gg => { gg.save(); cam(gg, 960, 400, 1.6); trainInterior(gg, s, { tod: 'present', x: s * 900, flick: 1 }); gg.restore(); });
  glow(g, 960, 380, 900, '#FFF2D8', .5);
  const z = 1 + k * .035, wob = Math.sin(s * 2.2) * .015;
  g.save(); cam(g, 960, 520, z, wob);
  const px = 1240, py = 470, sz = 250, ang = -.06 + Math.sin(s * 1.7) * .02;
  pinchHand(g, px, py, sz, ang, true);
  paperPlane(g, px, py, sz, ang, { old: true, bank: .08 });
  // 逆光：纸透出里面折着的那面写过的字（反着的，看不清写的什么）
  g.save(); g.translate(px, py); g.rotate(ang); g.scale(-1, 1);
  g.beginPath(); g.moveTo(0, 0); g.lineTo(sz * 2.2, -sz * .52); g.lineTo(sz * 1.85, 0); g.closePath(); g.clip();
  text(g, '我喜欢', sz * 1.25, -sz * .2, sz * .3, { k: 'hand', col: 'rgba(80,70,80,.16)', rot: .08 });
  g.restore();
  // 一只手从左下角伸进来，捏着机身的折边：食指在纸后面，拇指和手掌在前面
  pinchHand(g, px, py, sz, ang, false);
  g.restore();
  const ph = (s * 900 / 230) % 1, sweep = Math.max(0, Math.sin(ph * TAU)) ** 6;
  g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = `rgba(255,220,170,${.16 * sweep})`; g.fillRect(0, 0, W, H); g.restore();
}
/* 第 2 小节：外景。绿皮火车开过铁桥，下面是河，远处是山和积云 */
function sBridge(g, s, k) {
  const x = k * 60;
  summerSky(g, s, { tod: 'present', x, sun: [1560, 230, 54], clouds: 5, cy: 600, cw: 860, seed: 1 });
  flare(g, 1560, 230, .5);
  ridge(g, x * .2, 560, 160, '#9AB6CE', 2, .0011, 4);
  ridge(g, x * .4, 620, 110, '#7EA4B4', 6, .0018, 3);
  treeLine(g, x * .6, 660, 60, '#5E9A62', 4, 70);
  river(g, s, 660, 900, { top: '#9CC8E2', bot: '#6AA2CC' });
  trussBridge(g, x, 640, {});
  greenTrain(g, s, 1350 + k * 260, 640, .6, { cars: 9 });
  trussBridge(g, x, 640, { col: 'rgba(0,0,0,0)' });
  // 近处的河岸和草
  g.fillStyle = vgrad(g, 880, H, [[0, '#7DBB5E'], [1, '#5E9E48']]); g.beginPath(); g.moveTo(0, 900); g.quadraticCurveTo(700, 860, W, 920); g.lineTo(W, H); g.lineTo(0, H); g.closePath(); g.fill();
  grass(g, s, 930, 90, { h: 90, col: '#5FA84A', lite: '#A6D872', wind: 1 });
  swallows(g, s, 4, [0, 300, W, 500], .9);
}
/* 第 3 小节：车窗上映出他的脸；一闪之间，倒影变成了十七岁穿校服的自己 */
function sReflect(g, s, k) {
  const x = s * 900;
  g.save(); cam(g, 960, 400, 1.75 + k * .03);
  trainInterior(g, s, { tod: 'present', x });
  g.restore();
  g.fillStyle = 'rgba(20,30,40,.28)'; g.fillRect(0, 0, W, H);
  // 倒影
  const young = Math.sin(Math.PI * seg(s, bar(3) + 1.1, bar(3) + 2.4));
  g.save(); g.globalCompositeOperation = 'screen';
  bust(g, { who: 'he', outfit: 'shirt', x: 1220, y: 520, u: 150, eyes: 'open', gaze: -.6, light: LIGHT.present, alpha: .5 * (1 - young), t: s });
  bust(g, { who: 'he', outfit: 'uni', x: 1220, y: 520, u: 150, eyes: 'wide', gaze: -.6, light: LIGHT.noon, alpha: .62 * young, t: s });
  g.restore();
  if (young > .05) { g.fillStyle = `rgba(255,250,235,${young * .12})`; g.fillRect(0, 0, W, H); }
}
/* 第 4、5 小节：片名。大风吹过一大片草地，远处的路基上火车开过；"起风了"三个字被风送进来 */
function sTitle(g, s, k) {
  const x = k * 40;
  summerSky(g, s, { tod: 'present', x, sun: [420, 250, 60], clouds: 4, cy: 640, cw: 980, seed: 3, drift: 14 });
  flare(g, 420, 250, .6);
  ridge(g, x * .2, 650, 120, '#A9C2D6', 7, .0012, 4);
  // 路基和火车
  g.fillStyle = '#B9C79A'; g.fillRect(0, 676, W, 14);
  greenTrain(g, s, 300 + k * 220, 680, .32, { cars: 10 });
  // 草地：一层层被风压弯
  g.fillStyle = vgrad(g, 680, H, [[0, '#9CCB6A'], [1, '#5E9E48']]); g.fillRect(0, 686, W, H - 686);
  for (let i = 0; i < 6; i++) {
    const yy = 720 + i * 60, gust = .8 + .4 * Math.sin(s * 1.3 - i * .5);
    g.fillStyle = `rgba(255,255,220,${.1 * gust})`; g.beginPath(); g.ellipse(((s * 300 + i * 400) % (W + 800)) - 400, yy, 500, 30, 0, 0, TAU); g.fill();
  }
  grass(g, s, 1000, 160, { h: 130, col: '#4E9A40', lite: '#B6E07E', wind: 1.4 });
  windStreaks(g, s, 16, .32, { y0: 120, y1: 700, sp: 1500 });
  leavesBlow(g, s, 26, [0, 200, W, 900], .9, { vx: 900 });
  // 片名：三个字乘着风从左边滑进来，停住
  const ta = seg(s, bar(4), bar(4) + .6);
  g.fillStyle = rgrad(g, 960, 400, 50, 820, [[0, `rgba(24,40,70,${.62 * ta})`], [.6, `rgba(24,40,70,${.3 * ta})`], [1, 'rgba(24,40,70,0)']]); g.fillRect(0, 0, W, H);
  const chars = [...'起风了'], px = 230, gap = 40;
  const wsum = chars.length * px + (chars.length - 1) * gap, cx = 960, cy = 350;     // 副标题要在火车车顶（y≈624）上面
  chars.forEach((ch, i) => {
    const t0 = bar(4) + .1 + i * .32, u = seg(s, t0, t0 + .9);
    if (u <= 0) return;
    const e = E.out(u), tx = cx - wsum / 2 + px / 2 + i * (px + gap);
    const fx = lerp(-300, tx, e), fy = cy + (1 - e) * 120 * Math.sin(i * 2 + 1), rot = (1 - e) * (-.8 + i * .4);
    g.save();
    if (u < 1) g.filter = `blur(${((1 - e) * 8).toFixed(1)}px)`;
    text(g, ch, fx, fy, px, { k: 'brush', col: '#FFFFFF', rot, alpha: Math.min(1, u * 3), shadow: 'rgba(16,24,44,.8)', sblur: 20, sy: 6, stroke: 'rgba(20,30,50,.35)', lw: 8, glow: '#FFE8C0', gr: 40, ga: .35 });
    g.restore();
  });
  const a2 = E.out(seg(s, bar(4) + 1.6, bar(4) + 2.4));
  text(g, '买辣椒也用券', cx, cy + 180, 46, { k: 'kai', col: '#FFFFFF', alpha: a2, ls: 12, shadow: 'rgba(16,24,44,.85)', sblur: 10, sy: 3 });
  text(g, 'M V', cx, cy + 238, 32, { k: 'serif', col: '#FFF1D8', alpha: a2 * .95, ls: 10, shadow: 'rgba(16,24,44,.85)', sblur: 8, sy: 2 });
}
/* 第 6 小节：小城到了。河湾边一片灰瓦白墙，山坡上是学校：白色的教学楼、红旗 */
function sTownFar(g, s, k) {
  const x = k * 50;
  summerSky(g, s, { tod: 'present', x, sun: [1700, 200, 50], clouds: 4, cy: 520, cw: 760, seed: 4 });
  ridge(g, x * .2, 520, 150, '#9DB8CC', 9, .0013, 4);
  ridge(g, x * .35, 600, 120, '#78A08C', 10, .002, 3);
  // 山坡上的学校
  const sx = 1280 - x * .5;
  g.fillStyle = '#7FAE6A'; g.beginPath(); g.moveTo(sx - 520, 650); g.quadraticCurveTo(sx, 520, sx + 540, 650); g.closePath(); g.fill();
  tree(g, sx - 260, 610, 34, {}); tree(g, sx + 300, 612, 30, {});
  teachBuilding(g, s, sx - 150, 590, 300, 4, { fh: 30 });
  g.fillStyle = '#E8E8E8'; g.fillRect(sx + 190, 500, 3, 90);
  const fw = Math.sin(s * 6) * 3; g.fillStyle = '#E8392E'; g.beginPath(); g.moveTo(sx + 193, 502); g.quadraticCurveTo(sx + 208, 500 + fw, sx + 222, 504); g.lineTo(sx + 222, 520); g.quadraticCurveTo(sx + 208, 516 + fw, sx + 193, 518); g.closePath(); g.fill();
  townSkyline(g, s, x * .6, 700, 'noon');
  river(g, s, 760, 860, { top: '#A8D0E6', bot: '#7AB0D2' });
  g.fillStyle = vgrad(g, 850, H, [[0, '#86BE62'], [1, '#5E9E48']]); g.fillRect(0, 856, W, H - 856);
  greenTrain(g, s, 200 + k * 300, 900, .42, { cars: 6 });
  grass(g, s, 1060, 70, { h: 70 });
  swallows(g, s, 5, [0, 250, W, 520], .9, 9);
}
/* 第 7 小节：站牌从车窗外滑进来，慢慢停住："清溪" */
function sArrive(g, s, k) {
  const v = 1 - E.out(seg(s, bar(7), bar(8) - .2));       // 车速：从快到停
  const pos = bar(7) + (bar(8) - .2 - bar(7)) * (1 - Math.pow(1 - seg(s, bar(7), bar(8) - .2), 2) / 1) * .5;
  const sx = lerp(2600, 900, E.out(seg(s, bar(7), bar(8) - .1)));
  g.save(); cam(g, 960, 520, 1.12);
  trainInterior(g, s, { tod: 'present', x: s * 900, flick: v, view: gg => { platform(gg, s, (2600 - sx), { y: 900, signX: sx }); } });
  person(g, { who: 'he', outfit: 'shirt', x: 1430, y: 880, u: 78, face: -1, pose: lerpPose(POSE.sitHold, { ...POSE.sitHold, head: -.1 }, E.io(seg(s, bar(7) + 1.2, bar(7) + 2.0))), t: s, eyes: 'open', light: LIGHT.present,
    hold: (gg, u) => paperPlane(gg, u * 1.05, -u * .55, u * .62, -.3, { old: true }) });
  g.restore();
  void pos;
}

/* ================= 第一段主歌：下车，出站，走到老街 ================= */
/* 这一路上走走停停：车停了，他站起来，背上包，拿起纸飞机 */
function sStand(g, s, k) {
  g.save(); cam(g, 1000, 540, 1.08);
  trainInterior(g, s, { tod: 'present', flick: 0, view: gg => platform(gg, s, 1700, { y: 900, signX: 900 }) });
  const up = E.io(seg(k, .2, 1.4));
  const pose = up < 1 ? lerpPose(POSE.sitHold, POSE.stand, up) : walkPose(seg(k, 1.4, 3.2) * 2.2, 0);
  const hx = 1430 + (up >= 1 ? -seg(k, 1.4, 3.2) * 300 : 0), hy = lerp(880, 690, up);
  person(g, { who: 'he', outfit: 'shirt', x: hx, y: hy, u: 78, face: -1, pose, t: s, eyes: 'open', light: LIGHT.present, bag: up > .5 ? '#3A4A5E' : null,
    hold: (gg, u) => paperPlane(gg, u * .9, -u * .1, u * .5, .2, { old: true }) });
  g.restore();
}
/* 顺着少年漂流的痕迹：站台上，他往出口走；十七岁的自己穿着校服，从他身边跑过去，跑着跑着就淡了 */
function sPlatformWalk(g, s, k) {
  const camX = k * 160;
  g.fillStyle = vgrad(g, 0, H, SKYS.present); g.fillRect(0, 0, W, H);
  townSkyline(g, s, camX * .3, 560, 'noon');
  // 停着的火车
  g.save(); g.translate(-camX * .2, 0); greenTrain(g, s, 2600, 760, .9, { cars: 4 }); g.restore();
  platform(g, s, camX, { y: 820, signX: 1500 - camX });
  const walk = seg(k, 0, 3.2);
  person(g, { who: 'he', outfit: 'shirt', x: 640 + walk * 280 - camX * .2, y: 660, u: 44, face: 1, pose: walkPose(s * 1.1, 0), t: s, light: LIGHT.present, bag: '#3A4A5E',
    hold: (gg, u) => paperPlane(gg, u * .4, u * .2, u * .45, .3, { old: true }) });
  // 少年的影子：从后面跑上来、超过他、淡掉
  const r = seg(k, .4, 2.8);
  if (r > 0 && r < 1) {
    const gx = lerp(200, 1700, E.io(r));
    g.save(); g.globalCompositeOperation = 'screen';
    person(g, { who: 'he', outfit: 'uni', x: gx, y: 660, u: 44, face: 1, pose: walkPose(s * 2.2, 1), t: s, light: LIGHT.noon, bag: '#4A6A9E', mouth: 'grin', alpha: .55 * Math.sin(Math.PI * r) });
    g.restore();
    dust(g, s, 30, [gx - 200, 400, gx + 100, 700], '#FFF2D0', .7 * Math.sin(Math.PI * r));
  }
}
/* 迈出车站的前一刻：出站口里面暗，门外白得发亮，他朝光走过去 */
function exitHall(g, s, o = {}) {
  g.fillStyle = '#3A3A44'; g.fillRect(0, 0, W, H);
  g.fillStyle = vgrad(g, 0, 780, [[0, '#4A4A56'], [1, '#5E5C66']]); g.fillRect(0, 0, W, 780);
  // 门：右边，白光
  const dx = o.doorX ?? 1340;
  g.fillStyle = '#FFF6E2'; g.fillRect(dx, 160, 420, 620);
  glow(g, dx + 210, 470, 700, '#FFE8C0', .6);
  text(g, '出站口 EXIT', dx + 210, 120, 40, { k: 'sans', col: '#9CE07A', ls: 6 });
  // 光铺在地上
  g.fillStyle = vgrad(g, 780, H, [[0, '#6E6A70'], [1, '#4A4650']]); g.fillRect(0, 780, W, H - 780);
  g.save(); g.globalCompositeOperation = 'screen';
  g.fillStyle = lgrad(g, dx, 780, dx - 700, H, [[0, 'rgba(255,236,200,.85)'], [1, 'rgba(255,236,200,.2)']]);
  g.beginPath(); g.moveTo(dx, 780); g.lineTo(dx + 420, 780); g.lineTo(dx + 200, H); g.lineTo(dx - 760, H); g.closePath(); g.fill();
  g.restore();
  // 闸机
  for (let i = 0; i < 3; i++) { rr(g, 300 + i * 260, 640, 60, 160, 6); g.fillStyle = '#8A8E98'; g.fill(); g.fillStyle = '#5EB0E0'; g.fillRect(310 + i * 260, 660, 40, 12); }
}
function sExitHall(g, s, k) {
  g.save(); cam(g, 960, 540, 1 + k * .02);
  exitHall(g, s);
  const w = seg(k, 0, 3.2);
  person(g, { who: 'he', outfit: 'shirt', x: 420 + w * 700, y: 640, u: 46, face: 1, pose: walkPose(s * 1.0, 0), t: s, light: LIGHT.silR, bag: '#3A4A5E',
    hold: (gg, u) => paperPlane(gg, u * .4, u * .2, u * .45, .3, { old: true }) });
  g.restore();
  dust(g, s, 60, [900, 200, 1800, 800], '#FFF0D0', .6);
}
/* 竟有些犹豫：低机位，地上那道光的边，他的鞋停在边上；手里的纸飞机捏紧了一点 */
function sHesitate(g, s, k) {
  g.fillStyle = '#4A4650'; g.fillRect(0, 0, W, H);
  // 地面（透视）、光的边界线（斜的）
  g.fillStyle = vgrad(g, 300, H, [[0, '#5E5A66'], [1, '#3E3A44']]); g.fillRect(0, 300, W, H - 300);
  g.save(); g.globalCompositeOperation = 'screen';
  g.fillStyle = lgrad(g, 1300, 300, 1700, 1080, [[0, 'rgba(255,236,200,.95)'], [1, 'rgba(255,220,170,.7)']]);
  g.beginPath(); g.moveTo(1180, 300); g.lineTo(W, 300); g.lineTo(W, H); g.lineTo(1020, H); g.closePath(); g.fill();
  g.restore();
  glow(g, 1700, 200, 600, '#FFEED0', .6);
  // 两条腿、两只鞋：走过来，在光的边上停下
  const stop = E.out(seg(k, 0, 1.3)), step = Math.sin(seg(k, 0, 1.3) * Math.PI * 3) * (1 - stop) * 40;
  const fx = lerp(300, 930, stop);
  for (const [dx, ph] of [[-80, 0], [70, 1]]) {
    const lift = ph ? Math.max(0, step) : Math.max(0, -step);
    const x0 = fx + dx, yb = 900 - lift;
    g.fillStyle = '#2C3346'; rr(g, x0 - 40, -40, 84, yb - 40 + 40, 30); g.fill();
    rr(g, x0 - 60, yb - 70, 170, 76, 34); g.fillStyle = '#6A4A36'; g.fill();
    g.fillStyle = '#4E3628'; g.fillRect(x0 - 60, yb - 10, 170, 14);
  }
  // 手里的纸飞机（上面垂下来）
  const grip = seg(k, 1.6, 2.4);
  g.save(); g.translate(fx + 260, 210 + grip * 10); g.rotate(.3 - grip * .1);
  g.fillStyle = '#F2CFB8'; rr(g, -50, -200, 100, 150, 40); g.fill();
  paperPlane(g, 120, -60, 120, .5 + grip * .05, { old: true });
  g.restore();
}
/* 不禁笑这近乡情怯：他站在门口，背着光，笑自己，轻轻摇了摇头 */
function sSmileSelf(g, s, k) {
  g.fillStyle = vgrad(g, 0, H, [[0, '#FFF2DC'], [1, '#F6D6AA']]); g.fillRect(0, 0, W, H);
  soft(g, gg => { exitHall(gg, s, { doorX: -200 }); });
  glow(g, 1500, 400, 900, '#FFF0D0', .7);
  const sm = seg(s, 40.3, 40.7), shake = Math.sin(seg(s, 40.8, 42.0) * Math.PI * 3) * .05 * (1 - seg(s, 41.6, 42.0));
  bust(g, { who: 'he', outfit: 'shirt', x: 900, y: 600, u: 170, eyes: sm > .5 ? 'happy' : 'down', mouth: sm > .3 ? 'smile' : 'n', tiltH: shake - .04, light: LIGHT.goldenR, t: s, wind: [.2, 0] });
  dust(g, s, 50, [0, 0, W, H], '#FFF0D0', .5);
}
/* 仍无可避免：他走出门，一下子被阳光淹没 */
function sStepOut(g, s, k) {
  const out = seg(k, 0, 1.6);
  g.fillStyle = vgrad(g, 0, H, SKYS.present); g.fillRect(0, 0, W, H);
  summerSky(g, s, { tod: 'present', sun: [1500, 240, 60], clouds: 4, cy: 640, seed: 5 });
  oldStreet(g, s, 400 + k * 80, { y: 860 });
  // 门框（左边，暗的）往左退出画面
  const fx = lerp(820, -200, E.io(out));
  g.fillStyle = '#3E3C46'; g.fillRect(-10, 0, fx, H); g.fillRect(-10, 0, W + 20, lerp(140, -100, E.io(out)));
  person(g, { who: 'he', outfit: 'shirt', x: 900 + k * 120, y: 700, u: 46, face: 1, pose: walkPose(s * 1.0, 0), t: s, light: LIGHT.present, bag: '#3A4A5E',
    hold: (gg, u) => paperPlane(gg, u * .4, u * .2, u * .45, .3, { old: true }) });
  const flash = Math.sin(Math.PI * seg(k, 0, .9));
  g.fillStyle = `rgba(255,250,236,${flash * .7})`; g.fillRect(0, 0, W, H);
}
/* 而长野的天：抬头，一大片积云，太阳 */
function sWarmSky(g, s, k) {
  const tilt = E.out(seg(k, 0, 1.6)) * 200;
  g.save(); g.translate(0, tilt - 200);
  summerSky(g, s, { tod: 'present', sun: [1300, 420, 64], clouds: 4, cy: 900, cw: 1100, seed: 6, y0: -200, y1: H + 200 });
  flare(g, 1300, 420, .7);
  godRays(g, 1300, 420, Math.PI * .65, 9, 1400, '#FFF0D0', .18, s);
  g.restore();
  swallows(g, s, 6, [0, 300, W, 700], 1, 13);
  townSkyline(g, s, 0, H + 40 - tilt * .3, 'noon');
}
/* 依旧那么暖：老街，蝉在叫；他走过小卖部、书店 */
function sStreet(g, s, k) {
  const camX = k * 220;
  summerSky(g, s, { tod: 'present', x: camX, sun: [1600, 200, 50], clouds: 3, cy: 460, seed: 7 });
  oldStreet(g, s, camX + 600, { y: 820 });
  person(g, { who: 'he', outfit: 'shirt', x: 760 + k * 60, y: 680, u: 42, face: 1, pose: walkPose(s * 1.0, 0), t: s, light: LIGHT.present, bag: '#3A4A5E',
    hold: (gg, u) => paperPlane(gg, u * .4, u * .2, u * .45, .3, { old: true }) });
  dust(g, s, 40, [0, 300, W, 900], '#FFE6B8', .45);
}
/* 风吹起了从前：一阵大风。叶子、灰土卷起来，纸飞机从他手里被吹走，往学校的方向飞；他伸手去抓——画面一白 */
const GUST = 47.75;
function sGust(g, s, k) {
  const camX = 1200 + k * 120;
  summerSky(g, s, { tod: 'present', x: camX, sun: [1600, 200, 50], clouds: 3, cy: 460, seed: 7, drift: 30 });
  oldStreet(g, s, camX + 600, { y: 820, wind: 3 });
  const gust = seg(s, GUST - .3, GUST + .3);
  const reach = E.out(seg(s, GUST + .1, GUST + .7));
  const pose = reach > 0 ? lerpPose(walkPose(.25, 0), POSE.reach, reach) : walkPose(s * 1.0, 0);
  person(g, { who: 'he', outfit: 'shirt', x: 900, y: 680, u: 42, face: 1, pose, t: s, light: LIGHT.present, bag: '#3A4A5E', wind: [gust * 1.2, -.1],
    hold: s < GUST ? (gg, u) => paperPlane(gg, u * .4, u * .2, u * .45, .3, { old: true }) : null });
  // 纸飞机被风带走
  if (s >= GUST) {
    const u = seg(s, GUST, GUST + 2.0);
    const [px, py, a] = pathAt([[960, 640], [1100, 520], [1350, 420], [1500, 300], [1750, 180], [2100, 60]], E.io(u) * .9 + u * .1);
    paperPlane(g, px, py, 46 + u * 10, a, { old: true, glow: .3 * u });
  }
  windStreaks(g, s, 22, .45 * gust + .1, { y0: 200, y1: 900, sp: 1900 });
  leavesBlow(g, s, 40, [0, 100, W, 1000], .3 + gust * .7, { vx: 1200, size: 16 });
  // 一白：转进七年前
  const wo = seg(s, 49.2, 49.95);
  if (wo > 0) { g.fillStyle = `rgba(255,252,240,${E.in(wo)})`; g.fillRect(0, 0, W, H); }
}

SCENES_DEF.push(() => {
  scene('train', 0, sTrain, { bloom: .3 });
  scene('plane', bar(1), sPlane, { tr: { type: 'blur', dur: .5 }, bloom: .35 });
  scene('bridge', bar(2), sBridge, { tr: { type: 'whip', dur: .45 }, bloom: .35 });
  scene('reflect', bar(3), sReflect, { tr: { type: 'fade', dur: .5 }, bloom: .3 });
  scene('title', bar(4), sTitle, { tr: { type: 'flash', dur: .5 }, bloom: .4 });
  scene('townfar', bar(6), sTownFar, { tr: { type: 'cloud', dur: .7, pal: CLOUDP.present }, bloom: .35 });
  scene('arrive', bar(7), sArrive, { tr: { type: 'fade', dur: .5 }, bloom: .3 });
  scene('stand', bar(8), sStand, { tr: { type: 'blur', dur: .4 }, bloom: .3 });
  scene('platform', bar(9), sPlatformWalk, { tr: { type: 'fade', dur: .5 }, bloom: .35 });
  scene('exithall', bar(10), sExitHall, { tr: { type: 'fade', dur: .5 }, bloom: .45 });
  scene('hesitate', bar(11), sHesitate, { tr: { type: 'blur', dur: .45 }, bloom: .4 });
  scene('smileself', bar(12), sSmileSelf, { tr: { type: 'fade', dur: .5 }, bloom: .45 });
  scene('stepout', bar(13), sStepOut, { tr: { type: 'flash', dur: .4 }, bloom: .45 });
  scene('warmsky', 44.55, sWarmSky, { tr: { type: 'whipV', dur: .4, dir: -1 }, bloom: .45 });
  scene('street', 46.15, sStreet, { tr: { type: 'whipV', dur: .4, dir: 1 }, bloom: .35 });
  scene('gust', 47.35, sGust, { tr: { type: 'blur', dur: .3 }, bloom: s => .35 + .3 * seg(s, 49.2, 49.95) });
});
