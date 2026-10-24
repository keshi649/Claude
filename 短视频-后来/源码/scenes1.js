'use strict';
/* scenes1.js —— 开头（前奏 0~12.2 秒）和片名：
   S01 雨夜的十字路口，俯拍满街的伞，只有一把米白的伞停着不动（她）。
   S02 伞下，她手里一张旧拍立得，雨点打在照片上——一滴落在正中，荡开水波 →
   S03 录像带倒带：后面的剧情倒着一闪而过，日期戳从 '26 10 24 倒数回 '09 7 17 →
   S04 十七岁的夏天，栀子花下，她回头一笑（慢动作）——"咔"，快门 →
   S05 定格的画面缩回拍立得里，回到雨夜她的手上；唱"后来"时片名一个字一个字写出来。 */

/* ---------------- 俯拍的伞海（S01、S08 共用） ---------------- */
const HER_UMB = '#EDE3CF', HIS_UMB = '#2B3A5C';
const UMB_COLS = ['#1E222C', '#2A2E38', '#14161C', '#33363F', '#262B3A', '#3A2E2E', '#1F2A33', '#6A1E26', '#2C3550', '#4A4030', '#202020', '#2E2A3A'];
/* 人流：lanes 条道，往上、往下走。返回每把伞的位置（街道坐标，原点在画面中心） */
function crowdTop(t, o = {}) {
  const r = R(o.seed || 5), list = [], n = o.n || 46;
  for (let i = 0; i < n; i++) {
    const lane = (r() - .5) * 760, dir = r() > .5 ? 1 : -1, sp = (90 + r() * 70) * (o.speed || 1), ph = r() * 2600;
    const y = mod(ph + dir * sp * t, 2600) - 1300, x = lane + Math.sin(t * 1.5 + i) * 6;
    list.push({ x, y, rad: 78 + r() * 26, col: UMB_COLS[Math.floor(r() * UMB_COLS.length)], rot: r() * TAU + t * .2 * (r() - .5), dir, i });
  }
  return list;
}
function umbrellaSea(g, t, o = {}) {
  const cam = o.cam || { x: 0, y: 0, rot: 0, z: 1 };
  g.fillStyle = '#0B0F18'; g.fillRect(0, 0, W, H);
  g.save(); g.translate(W / 2, H / 2); g.rotate(cam.rot); g.scale(cam.z, cam.z); g.translate(-cam.x, -cam.y);
  g.drawImage(streetTop(), -900, -1300);
  // 路灯照在她站的地方
  g.fillStyle = rg(g, 40, 60, 0, 520, [[0, 'rgba(255,214,150,.30)'], [.5, 'rgba(255,190,120,.10)'], [1, 'rgba(255,190,120,0)']]); g.fillRect(-520, -460, 1040, 1040);
  splashes(g, t, { n: 90, flat: 1, col: 'rgba(200,220,255,.35)', seed: 4 });
  g.translate(0, 0);
  const crowd = crowdTop(t, o);
  // 和她的伞重叠的就挪开一点
  for (const c of crowd) {
    const d = Math.hypot(c.x - (o.herX || 0), c.y - (o.herY || 60));
    if (d < 200) c.x += (c.x < (o.herX || 0) ? -1 : 1) * (200 - d);
  }
  if (o.his) o.his(crowd, t);
  crowd.sort((a, b) => a.y - b.y);
  for (const c of crowd) {
    if (c.hidden) continue;
    umbrellaTop(g, c.x, c.y, c.rad, c.col, c.rot);
  }
  if (o.her !== false) {
    const hx = o.herX || 0, hy = o.herY || 60;
    g.fillStyle = rg(g, hx, hy, 0, 260, [[0, 'rgba(255,220,170,.25)'], [1, 'rgba(255,220,170,0)']]); g.fillRect(hx - 260, hy - 260, 520, 520);
    umbrellaTop(g, hx, hy, 112, HER_UMB, .3 + t * .05, { la: -2.0 });
  }
  g.restore();
  // 雨：从镜头往下落，看上去是从中心往外的短线
  g.save(); g.strokeStyle = 'rgba(200,220,255,.4)'; g.lineCap = 'round';
  const r = R(17);
  for (let i = 0; i < 150; i++) {
    const a = r() * TAU, ph = r(), k = mod(ph + t * (1.4 + r()), 1), d0 = 80 + k * 1300, len = 20 + k * 90;
    g.lineWidth = 1 + k * 2.5; g.globalAlpha = .25 + .5 * k;
    g.beginPath(); g.moveTo(W / 2 + Math.cos(a) * d0, H / 2 + Math.sin(a) * d0); g.lineTo(W / 2 + Math.cos(a) * (d0 + len), H / 2 + Math.sin(a) * (d0 + len)); g.stroke();
  }
  g.restore();
}
function shUmbrellaSea(g, t, s) {
  const lt = t - s.t;
  umbrellaSea(g, t, { cam: { x: 0, y: 40, rot: -.06 + lt * .022, z: 1.04 + lt * .035 } });
}

/* ---------------- 伞的内面（从伞下往上看） ---------------- */
function umbrellaUnder(g, t, col = HER_UMB, o = {}) {
  const cx = W / 2 + (o.dx || 0), top = o.top || -900, rimY = o.rim || 330, ribs = 9;
  const pts = [];
  for (let i = 0; i <= ribs; i++) { const a = i / ribs; pts.push([lerp(-260, W + 260, a), rimY + Math.sin(a * PI) * 60]); }
  g.save();
  g.beginPath(); g.moveTo(-300, -10);
  for (let i = 0; i < ribs; i++) { const p = pts[i], q = pts[i + 1]; g.quadraticCurveTo((p[0] + q[0]) / 2, (p[1] + q[1]) / 2 - 46, q[0], q[1]); }
  g.lineTo(W + 300, -10); g.closePath();
  g.fillStyle = lg(g, 0, 0, 0, rimY + 60, [[0, shade(col, .55)], [.7, shade(col, .85)], [1, shade(col, 1.0)]]); g.fill();
  g.clip();
  // 伞骨往上收到伞柄
  g.strokeStyle = rgba(shade(col, .5), .8); g.lineWidth = 4;
  for (const p of pts) { g.beginPath(); g.moveTo(cx, top); g.lineTo(p[0], p[1]); g.stroke(); }
  // 外面的街灯透过伞布
  g.fillStyle = rg(g, W * .7, rimY - 120, 0, 500, [[0, 'rgba(255,230,190,.35)'], [1, 'rgba(255,230,190,0)']]); g.fillRect(0, 0, W, rimY + 80);
  g.restore();
  // 伞边挂着的水珠，隔一会儿掉下去
  for (let i = 0; i <= ribs; i++) {
    const p = pts[i], per = 1.1 + hash(i, 3) * .9, k = mod(t + hash(i, 7) * 3, per) / per;
    const y = p[1] + 6 + (k > .7 ? E.in2((k - .7) / .3) * 600 : 0), s = 5 + (k < .7 ? k * 6 : 4);
    g.fillStyle = 'rgba(220,235,255,.75)'; g.beginPath(); g.ellipse(p[0], y, s * .7, s, 0, 0, TAU); g.fill();
  }
}

/* ---------------- 手（捏着拍立得的左下角） ---------------- */
/* 都在卡片自己的坐标里画（原点是卡片中心，w×h 是卡片大小）。手指在卡片后面、从左边露出指尖（先画）；
   拇指和虎口压在卡片正面（后画）；袖口从左下角伸进来。 */
function handBehind(g, w, h, sleeve = '#CDB592') {
  const k = w / 560, L = -w / 2, B = h / 2;
  g.save();
  // 袖子
  g.fillStyle = sleeve;
  spline(g, [[L - 210 * k, B + 520 * k], [L - 120 * k, B + 120 * k], [L + 40 * k, B + 40 * k], [L + 110 * k, B + 150 * k], [L + 20 * k, B + 560 * k]], true, .45); g.fill();
  g.fillStyle = shade(sleeve, .82);
  spline(g, [[L - 140 * k, B + 150 * k], [L + 30 * k, B + 60 * k], [L + 80 * k, B + 110 * k], [L - 80 * k, B + 210 * k]], true, .45); g.fill();
  // 手掌（大半藏在卡片后面）
  g.fillStyle = SKIN_SH; ell(g, L + 10 * k, B - 10 * k, 70 * k, 90 * k, .5);
  // 四根手指从卡片左边缘后面绕过来，露出指尖
  for (let i = 0; i < 4; i++) {
    const y = B - (40 + i * 46) * k;
    g.fillStyle = i % 2 ? SKIN : shade(SKIN, .95);
    capsule(g, L + 30 * k, y + 10 * k, 22 * k, L - 22 * k, y, 19 * k);
  }
  g.restore();
}
function handFront(g, w, h) {
  const k = w / 560, L = -w / 2, B = h / 2;
  g.save();
  g.fillStyle = SKIN;
  spline(g, [[L - 30 * k, B + 70 * k], [L - 10 * k, B - 10 * k], [L + 40 * k, B - 30 * k], [L + 70 * k, B + 20 * k], [L + 40 * k, B + 90 * k]], true, .5); g.fill();   // 虎口
  capsule(g, L + 20 * k, B - 5 * k, 26 * k, L + 92 * k, B - 70 * k, 17 * k, SKIN);                                                                   // 拇指
  g.fillStyle = 'rgba(150,90,80,.18)'; capsule(g, L + 10 * k, B + 10 * k, 24 * k, L + 60 * k, B - 30 * k, 18 * k); g.fill();
  ell(g, L + 92 * k, B - 72 * k, 11 * k, 13 * k, .8, '#F8E6DC');                                                                                     // 指甲
  g.restore();
}

/* ---------------- 照片里的画面：十七岁的她在栀子花下回头 ---------------- */
function photoSummer(g, w, h) {
  const c = cached('photoSummer', 900, 900, (q) => {
    const tmp = layer('photoSrc');
    summerTurn(tmp, 11.95, { photo: true });
    q.drawImage(LAYER.photoSrc, 90, 640, 900, 900, 0, 0, 900, 900);
  });
  g.drawImage(c, 0, 0, w, h);
}

/* ---------------- S02 伞下的拍立得 ---------------- */
function polaroidScene(g, t, o = {}) {
  // 背景：虚化的街灯和霓虹
  g.fillStyle = lg(g, 0, 0, 0, H, [[0, '#0E1424'], [.6, '#141B30'], [1, '#090C16']]); g.fillRect(0, 0, W, H);
  bokeh(g, t, { n: 34, seed: 8, size: 90, a: .42, cols: ['#FF6E9C', '#59CFFF', '#FFC870', '#FFE9C0', '#B07CFF'] });
  rain(g, t, { n: 70, len: 160, lw: 5, col: 'rgba(200,220,255,.10)', speed: 1900, seed: 3 });
  const z = o.z || 1, px = o.px || W / 2, py = o.py || 1080, pw = (o.pw || 560) * z, rot = o.rot || -.07;
  polaroid(g, px, py, pw, rot, o.photo || photoSummer, { wet: o.wet === undefined ? 14 : o.wet, seed: 2, age: .35, back: o.back, under: o.hand === false ? null : handBehind, over: o.hand === false ? null : handFront });
  if (o.drop) o.drop(g, px, py, pw, rot);
  umbrellaUnder(g, t, HER_UMB, { rim: 300 });
  rain(g, t, { n: 90, len: 60, lw: 2, col: 'rgba(210,225,255,.22)', speed: 2600, seed: 9 });
}
function shPolaroidRain(g, t, s) {
  const lt = t - s.t, z = 1 + lt * .03;
  polaroidScene(g, t, {
    z, rot: -.07 + Math.sin(lt * 1.3) * .006,
    drop: (q, px, py, pw, rot) => {
      // 一滴雨从上面落下来，3.2 秒左右砸在照片正中，荡开一圈圈水波
      const hit = 3.2, fall = seg(t, hit - .45, hit);
      if (t < hit) { const y = lerp(-80, py - pw * .1, E.in2(fall)); q.fillStyle = 'rgba(225,240,255,.85)'; q.beginPath(); q.ellipse(px + 20, y, 9, 16, 0, 0, TAU); q.fill(); }
      else {
        const k = seg(t, hit, hit + .5);
        q.save(); q.translate(px + 20, py - pw * .1); q.scale(1, .92);
        for (let i = 0; i < 3; i++) { const kk = clamp(k * 1.4 - i * .2); if (kk <= 0) continue; q.strokeStyle = `rgba(230,245,255,${(1 - kk) * .8})`; q.lineWidth = 4 - i; q.beginPath(); q.arc(0, 0, 10 + kk * pw * .55, 0, TAU); q.stroke(); }
        q.restore();
      }
    },
  });
}

/* ---------------- S04 十七岁的夏天：她在栀子花下回头 ---------------- */
function summerCampus(g, t, o = {}) {
  // 天空、云
  skyGrad(g, [[0, '#5FA9E6'], [.45, '#A9D8F5'], [.62, '#E6F2F4']]);
  const cx = o.camX || 0;
  g.drawImage(cloudImg(1), 380 - cx * .1 + t * 4, 180, 760, 390);
  g.drawImage(cloudImg(2), -260 - cx * .1 + t * 3, 420, 640, 330);
  // 远处的教学楼
  const by = 1010;
  g.fillStyle = '#E9E2D2'; g.fillRect(-40 - cx * .3, by - 330, 760, 330);
  g.fillStyle = '#D7CDB8'; g.fillRect(-40 - cx * .3, by - 330, 760, 26);
  for (let r = 0; r < 4; r++) for (let c = 0; c < 9; c++) { g.fillStyle = r % 2 ? '#8FB7CF' : '#9CC3DA'; g.fillRect(-10 - cx * .3 + c * 80, by - 290 + r * 74, 50, 44); }
  g.fillStyle = '#C3402F'; g.fillRect(560 - cx * .3, by - 380, 6, 60); g.fillRect(566 - cx * .3, by - 380, 40, 24);   // 国旗杆
  // 远处一排树
  for (let i = 0; i < 9; i++) { const x = -60 + i * 150 - cx * .45, y = by - 10; g.fillStyle = i % 2 ? '#5E9A55' : '#4F8B4A'; g.beginPath(); g.ellipse(x, y - 90, 110, 130, 0, 0, TAU); g.fill(); }
  // 地面、小路
  g.fillStyle = lg(g, 0, by - 40, 0, H, [[0, '#B9C98F'], [.25, '#A6BC7E'], [1, '#7F9A60']]); g.fillRect(0, by - 40, W, H);
  g.fillStyle = lg(g, 0, by, 0, H, [[0, '#E7DCC6'], [1, '#D5C4A4']]);
  g.beginPath(); g.moveTo(420 - cx * .6, by - 30); g.lineTo(640 - cx * .6, by - 30); g.lineTo(W + 300, H); g.lineTo(-200, H); g.closePath(); g.fill();
  // 树荫的光斑
  const r = R(12);
  for (let i = 0; i < 40; i++) { const x = r() * W, y = by + 80 + r() * 900, s = 30 + r() * 70; g.fillStyle = `rgba(255,248,215,${.12 + .1 * Math.sin(t * .8 + i)})`; g.beginPath(); g.ellipse(x - cx * .8, y, s, s * .35, 0, 0, TAU); g.fill(); }
}
function summerTurn(g, t, o = {}) {
  const lt = t - 9.72;
  summerCampus(g, t, { camX: lt * 8 });
  // 栀子花丛在右后方
  const bush = gardeniaBush(760, 560, 3);
  g.drawImage(bush, 420, 700, 900, 663);
  g.drawImage(bush, -380, 820, 640, 472);
  // 左上的树冠压下来
  g.save(); g.fillStyle = '#3F7A3E';
  const r = R(4);
  for (let i = 0; i < 160; i++) leaf(g, -60 + r() * 520, -40 + r() * 330 - r() * r() * 60, 40 + r() * 46, r() * TAU, ['#3E7B3E', '#4C8C45', '#2F6634'][i % 3]);
  g.restore();
  // 她：先背对着走，停下，回头
  const turn = o.photo ? 1 : seg(t, 10.85, 11.55), x = 540, y = 1720;
  const L = { x: .8, y: -.6, rim: '#FFF6D8', rimA: .55, sh: .18, warm: '#FFD7A0', warmA: .25 };
  if (turn < .35) {
    const walkP = o.photo ? 0 : (lt * .55);
    fig(g, { x, y, h: 1000, who: 'girl', view: 'back', light: L, swing: .06 * Math.sin(lt * 3), pose: { legs: [{ sp: .02 }, { sp: .03 }], arms: [{ sh: .08 + .06 * Math.sin(walkP * TAU) }, { sh: .08 - .06 * Math.sin(walkP * TAU) }] } });
  } else if (turn < .62) {
    fig(g, { x, y, h: 1000, who: 'girl', view: 'side', dir: -1, light: L, swing: -.3, eyes: 'open', blush: .3 });
  } else {
    const sw = o.photo ? -.12 : -.25 * (1 - E.out(seg(t, 11.3, 11.9)));
    fig(g, { x, y, h: 1000, who: 'girl', view: 'front', light: L, eyes: 'closed', smile: 1, blush: .55, swing: sw, pose: { tilt: -.06, arms: [{ sh: .12, el: .1 }, { sh: 2.5 - .25 * Math.sin(Math.max(0, t - 11.35) * 9) * (o.photo ? 0 : 1), el: -.35 }] } });
  }
  // 慢慢飘的花瓣、阳光、镜头前虚化的花瓣
  const st = o.photo ? 11.95 : 9.72 + (t - 9.72) * .45;
  petals(g, st, { n: 30, seed: 7, fall: 120, size: 34, wind: 30 });
  sunRays(g, st, 960, 120, .9);
  if (!o.photo) petalsNear(g, st, { n: 3, seed: 5 });
}
function shSummerTurn(g, t, s) { summerTurn(g, t); }

/* ---------------- S05 定格 → 缩回照片里 → 片名 ---------------- */
function shTitlePhoto(g, t, s) {
  const lt = t - s.t, k = E.io(seg(lt, .15, 1.1));
  // k=0：照片铺满画面；k=1：拍立得在手里
  const pw = lerp(1080 / .88 * 1.0, 600, k), py = lerp(960 - 0, 1080, k);
  polaroidScene(g, t, { z: pw / 560, py, rot: lerp(0, -.07, k), wet: ri(14 * k) });
}
function titleCard(g, t) {
  if (t < 12.1 || t > 14.4) return;
  const a = 1 - seg(t, 13.95, 14.35);
  const y = 470;
  // "后"在 12.24、"来"在 13.06 一笔笔写出来：从上往下的软边遮罩
  const chars = [['后', ch(0, 0), 380], ['来', ch(0, 1), 600]];
  for (const [c, t0, x] of chars) {
    const u = seg(t, t0 - .08, t0 + .5);
    if (u <= 0) continue;
    const q = layer('titleChar', 360, 360);
    q.font = `280px ${FONT.brush}`; q.textAlign = 'center'; q.textBaseline = 'middle';
    q.shadowColor = 'rgba(255,220,170,.9)'; q.shadowBlur = 30; q.fillStyle = '#FFFBF2'; q.fillText(c, 180, 190);
    q.globalCompositeOperation = 'destination-in';
    q.fillStyle = lg(q, 0, 0, 0, 360, [[0, 'rgba(0,0,0,1)'], [clamp(u * 1.25 - .05), 'rgba(0,0,0,1)'], [clamp(u * 1.25 + .15), 'rgba(0,0,0,0)'], [1, 'rgba(0,0,0,0)']]);
    q.fillRect(0, 0, 360, 360);
    g.save(); g.globalAlpha = a; const sc = 1.08 - .08 * E.out(u); g.translate(x, y); g.scale(sc, sc); g.drawImage(LAYER.titleChar, -180, -180); g.restore();
  }
  const u2 = seg(t, 13.35, 13.8);
  text(g, '刘 若 英', 490, 690, 40, '#F4EEE2', { alpha: a * u2, weight: 500, ls: 6, shadow: 'rgba(0,0,0,.6)', blur: 10 });
}

/* ---------------- S03 倒带 ---------------- */
/* 后面的镜头倒着放：每段 [镜头编号, 从镜头里的哪一秒倒到哪一秒, 占多长]，越倒越快，最后慢下来停在夏天 */
const REWIND = [];
/* 镜头表建好以后再填（倒带里闪过的是后面真的镜头，倒着放）：[镜头函数, 从第几秒, 倒到第几秒, 占多长] */
function buildRewind() {
  const at = fn => SHOTS.findIndex(x => x.fn === fn);
  const list = [[shStandStill, 233.6, 232.2, .7], [shTrainsPass, 225.9, 224.6, .6], [shSeaPeople, 164.8, 163.2, .6], [shPhone, 151.6, 148.6, .5],
    [shTrainLeave, 135.3, 133.0, .5], [shPuddle, 112.2, 110.1, .45], [shArgue, 104.8, 103.0, .35], [shBicycle, 95.0, 93.0, .35],
    [shKiss, 74.2, 72.4, .35], [shWhisper, 55.4, 53.2, .3], [shGardeniaClose, 41.6, 40.0, .3]];
  for (const [fn, a, b, d] of list) REWIND.push([at(fn), a, b, d]);
}
function shRewind(g, t, s) {
  const lt = t - s.t, total = s.e - s.t;
  const clips = REWIND.length ? REWIND : [[0, 1.6, 0, 1.0], [1, 3.2, 1.71, .9]];
  let acc = 0, k = 0;
  const tot = clips.reduce((a, c) => a + c[3], 0), slow = total - tot;
  while (k < clips.length && lt > acc + clips[k][3]) { acc += clips[k][3]; k++; }
  const src = layer('rewSrc');
  if (k < clips.length) {
    const [si, ta, tb, d] = clips[k], u = (lt - acc) / d;
    SHOTS[si].fn(src, lerp(ta, tb, u), SHOTS[si]);
  } else {
    // 最后慢下来：夏天的画面倒着放、越来越慢，停住
    const u = seg(lt, tot, total);
    summerTurn(src, 9.72 + (1 - E.out(u)) * 1.2, {});
  }
  const strength = 1 - E.in2(seg(lt, total - .7, total));
  vhs(g, LAYER.rewSrc, t, .55 + .45 * strength);
  // ◀◀ 和日期戳
  const blink = Math.floor(t * 3) % 2 === 0;
  if (blink || lt > total - .6) text(g, '◀◀', 120, 260, 60, 'rgba(255,255,255,.9)', { weight: 700, shadow: 'rgba(0,0,0,.6)', blur: 6 });
  const p = E.in2(clamp(lt / (total - .6)));
  const yy = ri(lerp(26, 9, p)), mm = lt > total - .6 ? 7 : 1 + Math.floor(hash(Math.floor(t * 20), 1) * 12), dd = lt > total - .6 ? 17 : 1 + Math.floor(hash(Math.floor(t * 20), 2) * 28);
  window.REWIND_STAMP = `'${String(yy).padStart(2, '0')} ${mm} ${dd}`;
}
