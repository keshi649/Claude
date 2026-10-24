'use strict';
/* scenes3.js：主歌（38.56~77.3 秒，游戏里十七岁的夏天）
   shGardeniaClose  "栀子花 白花瓣"：栀子花特写，"白"字一片花瓣落下来，镜头跟着往下
   shBenchWide      （间）校园一角：教学楼、大树、栀子花丛、长椅，她坐着玩掌机；状态栏上 2P"等待加入"
   shSkirt          "落在我蓝色百褶裙上"：花瓣一片片落在她的蓝裙子上（"蓝""褶"各落一片）
   shWhisper        "爱你 你轻声说"：他走过来坐下（"2P 已加入"），凑过去说悄悄话，冒出一颗心，她脸红了
   shSmell          "我低下头闻见一阵芬芳"：他递过来一朵栀子，她低头闻，香气往上飘；"获得 栀子花"
   shDayNight       "那个永恒的夜晚"：同一张长椅，天从白天变成黄昏再变成夜，路灯亮了
   shHillNight      "十七岁仲夏"：夜里的山坡，栀子花树下两个人抬头看星星，萤火虫飞起来
   shKiss           "你吻我的那个夜晚"：两个人凑近，"那个"时碰在一起，一颗大心，流星划过 */

/* ================= 校园一角（240×135）：tod 0 白天 → .5 黄昏 → 1 夜里 ================= */
const SG = { w: 240, h: 150, gy: 100, benchX: 86, benchW: 40, herX: 98, himX: 116 };   // 比画面高一截，推镜头时底下不露黑
const SG_SEAT = SG.gy - 9;
function schoolGarden(b, gl, t, tod = 0, people = null, opt = {}) {
  const { w, h } = SG;
  // 天：白天蓝 → 黄昏橙粉 → 夜里深蓝；opt.dawn 现在的清早（偏粉、偏暖）
  const skyD = opt.dawn ? [[0, '#8AA8E0'], [.5, '#F4C0B0'], [1, '#FFE4C0']] : SUM.sky, skyS = [[0, '#4A5AA8'], [.5, '#E88A7A'], [1, '#FFC88A']], skyN = [[0, '#0A0F33'], [.6, '#1C2258'], [1, '#2E2A62']];
  const mixStops = (A, B, u) => A.map((st, i) => [st[0], mix(st[1], B[Math.min(i, B.length - 1)][1], u)]);
  const sky = tod < .5 ? mixStops(skyD, skyS, tod * 2) : mixStops(skyS, skyN, (tod - .5) * 2);
  psky(b, w, 80, sky);
  if (tod > .6) { b.save(); b.globalAlpha = seg(tod, .6, 1); starfield(b, t, w, 60, { n: 50, seed: 81 }); b.restore(); }
  // 太阳：白天在右上，黄昏落到教学楼后面
  if (tod < .75) { const sx = lerp(190, 200, tod), sy = lerp(14, 74, E.in2(clamp(tod / .7))); pdisc(b, sx, sy, 7, mix('#FFF6C8', '#FF9A5A', clamp(tod * 1.6))); pdisc(gl, sx, sy, 10, rgba(mix('#FFF6C8', '#FF8A4A', clamp(tod * 1.6)), .7)); }
  if (tod < .5) { pixelCloud(b, mod(40 + t * 2, 300) - 30, 18, 1.2); pixelCloud(b, mod(170 + t * 1.4, 300) - 30, 30, .9); }
  // 教学楼
  schoolBuilding(b, 128, 80, 112, 3, { clock: true });
  // 地面、小路
  grassField(b, t, 0, 78, w, h - 78, 5);
  ppoly(b, [[-12, h], [30, h], [118, 80], [106, 80]], SUM.path);
  // 左边的大树：树干 + 树冠，地上的树荫和光斑
  pell(b, 34, 104, 34, 6, SUM.grassDk);
  prect(b, 26, 50, 7, 54, '#7A5A3E'); prect(b, 30, 50, 2, 54, '#5E442E');
  [[30, 28, 26], [10, 40, 18], [52, 36, 20], [34, 48, 22]].forEach(([x, y, r], i) => { pdisc(b, x, y, r, ['#2E6A3E', '#3E8A4C', '#3A7E46', '#4E9E52'][i]); });
  for (let i = 0; i < 24; i++) leaf(b, 4 + hash(i, 91) * 64, 14 + hash(i, 92) * 40, 6, 3, hash(i, 93) * PI, '#5AAE5E', null);
  sunDapples(b, t, 4, 96, 60, 14);
  // 栀子花丛（长椅后面）
  gardeniaBush(b, t, 58, 92, 112, 16, { seed: 33, flowers: 26 });
  // 路灯
  lampPost(b, gl, 150, 100, 34, tod > .7 ? flickOnLamp(tod) : 0);
  // 长椅
  bench(b, SG.benchX, SG.gy, SG.benchW);
  if (people) people(b, gl);
  driftPetals(b, gl, t, 10, 40, 40, 160, 70, 7);
  if (opt.dawn) { b.save(); b.globalCompositeOperation = 'multiply'; b.fillStyle = '#FFE6D4'; b.fillRect(0, 40, w, h - 40); b.restore(); }
  // 黄昏、夜里的光：整体乘一层颜色（天空不乘）
  if (tod > 0) {
    const tc = tod < .5 ? mix('#FFFFFF', '#FFB890', tod * 2) : mix('#FFB890', '#5A6AB8', (tod - .5) * 2);
    b.save(); b.globalCompositeOperation = 'multiply'; b.fillStyle = tc; b.fillRect(0, 78, w, h - 78); b.fillRect(128, 40, 112, 40); b.fillRect(0, 0, 70, 80); b.restore();
    if (tod > .7) { const on = flickOnLamp(tod); pcone(b, 151, 67, 100, 5, 30, '#FFD27A', .25 * on, .06 * on); pell(b, 151, 100, 16, 3, rgba('#FFD27A', .2 * on)); }
  }
}
const flickOnLamp = tod => tod < .78 ? 0 : tod < .8 ? .5 : 1;
/* 她坐在长椅上（feet 在座面下沿：身子底挨着座面） */
const sitFy = () => SG_SEAT + 4;

/* ================= shGardeniaClose：栀子花特写（38.56 ~ 42.70） ================= */
function shGardeniaClose(g, t, s) {
  const w = 160, h = 130, b = pbuf('gclose', w, h), gl = glowBuf('gclose', w, h);
  // 底：深绿（花丛里面），右上角露一点天
  psky(b, w, h, [[0, '#2A5E3A'], [.5, '#1E4A2E'], [1, '#163A24']]);
  pdisc(b, 150, -6, 26, '#8CCEF4'); pdisc(b, 132, -10, 18, '#A8DCF6');
  // 远处虚掉的叶子：大块的深色
  for (let i = 0; i < 26; i++) pdisc(b, hash(i, 41) * w, hash(i, 42) * h, 8 + hash(i, 43) * 10, ['#1C442A', '#245234', '#2A5C3A'][i % 3]);
  // 叶子：三层，越往前越亮、越大
  const sw = Math.sin(t * 1.4) * 1.2;
  const layers = [[60, 12, ['#2A6238', '#2E6A3E'], '#1E4A2C'], [44, 18, ['#357A44', '#3C8448'], '#26583A'], [26, 24, ['#4A9454', '#529E5A'], '#2E6A40']];
  layers.forEach(([n, L0, cols, vein], li) => {
    for (let i = 0; i < n; i++) {
      const k = i + li * 100, x = hash(k, 51) * (w + 20) - 10, y = hash(k, 52) * (h + 10) - 5, ang = hash(k, 53) * PI, L = L0 + hash(k, 54) * 8;
      const dx = sw * (li + 1) * .5 * (y / h);
      leaf(b, x + dx, y, L, L * .42, ang, cols[i % 2], vein);
      leaf(b, x + dx - Math.cos(ang + PI / 2) * L * .08, y - Math.sin(ang + PI / 2) * L * .08 - 1, L * .55, L * .14, ang, shade(cols[0], 1.35), null);   // 叶面的高光
    }
  });
  // 一道阳光从右上斜着照进来
  b.save(); b.globalCompositeOperation = 'screen'; b.globalAlpha = .13;
  ppoly(b, [[118, 0], [160, 0], [70, 130], [20, 130]], '#FFF4C8'); b.globalAlpha = .08; ppoly(b, [[150, 0], [160, 0], [100, 130], [84, 130]], '#FFF4C8'); b.restore();
  // 花：几朵大的、一朵中的、几个花苞
  const fl = [[40, 36, 3], [104, 26, 3], [128, 76, 3], [72, 80, 2], [18, 96, 2], [150, 40, 2]];
  fl.forEach(([x, y, sz]) => { const dx = sw * (y / h), r = sz === 3 ? 7 : 5; pell(b, x + dx + 1, y + 2, r + 1, r - 1, '#163A24'); pspr(b, gardenia(sz), x + dx - r, y - r); gl.globalAlpha = .4; pdisc(gl, x + dx, y, r, '#FFFFFF'); gl.globalAlpha = 1; });
  [[88, 54], [54, 58], [140, 104], [24, 60]].forEach(([x, y]) => { pell(b, x, y, 3, 5, '#E8F0D8'); pell(b, x, y + 3, 2, 3, '#5E9E54'); pdot(b, x - 1, y - 2, '#FFFFFF'); });
  // 阳光在花瓣上闪
  for (let i = 0; i < 7; i++) { const [x, y] = fl[i % fl.length], ph = mod(t * 1.2 + i * .37, 1); if (ph < .25) { const a = 1 - ph / .25, xx = x - 4 + (i * 3) % 8, yy = y - 4 + (i * 5) % 7; b.globalAlpha = a; pdot(b, xx, yy, '#FFFFFF'); pdot(b, xx - 1, yy, '#FFF8D0'); pdot(b, xx + 1, yy, '#FFF8D0'); pdot(b, xx, yy - 1, '#FFF8D0'); pdot(b, xx, yy + 1, '#FFF8D0'); gl.globalAlpha = a; prect(gl, xx - 2, yy - 2, 5, 5, '#FFFFFF'); } }
  b.globalAlpha = 1; gl.globalAlpha = 1;
  // 浮在空中的小光点
  for (let i = 0; i < 10; i++) { const x = mod(hash(i, 61) * w + t * 3, w), y = mod(hash(i, 62) * h - t * 2, h); b.globalAlpha = .5 + .5 * Math.sin(t * 2 + i); pdot(b, x, y, '#FFF4C8'); }
  b.globalAlpha = 1;
  // "白"字：上面那朵掉下一片花瓣，镜头跟着往下
  const drop = ch(7, 3), pu = seg(t, drop, s.e + .3);
  if (t >= drop) {
    const px = 104 + Math.sin(pu * 7) * 10 + pu * 16, py = 28 + pu * 80;
    for (let k = 0; k < 2; k++) petal(b, px + k, py, t * 4, '#FFFFFF');
    prect(gl, px - 1, py - 1, 4, 4, 'rgba(255,255,255,.7)');
  }
  const camY = 20 * E.io(seg(t, drop + .1, s.e));
  blit(g, 'gclose', 12, 0, camY); glowBlit(g, 'gclose', 12, 0, camY, .75, 2);
}

/* ================= shBenchWide：校园一角（42.70 ~ 45.70） ================= */
function shBenchWide(g, t, s) {
  const b = pbuf('sg', SG.w, SG.h), gl = glowBuf('sg', SG.w, SG.h);
  schoolGarden(b, gl, t, 0, (b, gl) => {
    monAt(b, SG.herX, sitFy(), { col: COL.her, skirt: true, legs: 'sit', armL: 'hold', armR: 'hold', eyes: 'dn' });
    heldHandheld(b, SG.herX, sitFy() - 7, '#E6DEC8', '#BFF8EC');
  });
  const z = 1 + .12 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'sg', 8, 120, 72, z, W / 2, H / 2 - 20); glowBlitZoom(g, 'sg', 8, 120, 72, z, W / 2, H / 2 - 20, .6, 3);
}

/* ================= shSkirt：花瓣落在蓝裙子上（45.70 ~ 51.30） ================= */
function shSkirt(g, t, s) {
  const b = pbuf('sg', SG.w, SG.h), gl = glowBuf('sg', SG.w, SG.h);
  const fy = sitFy(), bx = SG.herX - 12, by = fy - 16;
  const lands = [[ch(8, 3), 7, 10], [ch(8, 6), 15, 11], [ch(8, 8) + .3, 11, 9], [48.95 + .8, 19, 10]];   // [落下的时刻, 落在身子的哪一格 x, y]
  schoolGarden(b, gl, t, 0, (b, gl) => {
    const ey = t < 48.6 ? 'dn' : t < 50.2 ? 'dnr' : 'dn';
    monAt(b, SG.herX, fy, { col: COL.her, skirt: true, legs: 'sit', eyes: ey, glint: true });
    miniHandheld(b, SG.herX + 14, SG_SEAT - 7, '#E6DEC8', '#BFF8EC');          // 掌机放在长椅上
    prect(gl, SG.herX + 18, SG_SEAT - 5, 4, 2, 'rgba(190,248,236,.8)');
    lands.forEach(([tl, lx, ly], i) => {
      const fall = 1.3;
      if (t < tl - fall) return;
      if (t < tl) {                                                   // 往下飘
        const u = (t - (tl - fall)) / fall, x = bx + lx + Math.sin(u * 9 + i) * 6 * (1 - u) + (1 - u) * 10, y = by + ly - (1 - u) * 46;
        petal(b, x, y, t * 4 + i); prect(gl, x - 1, y - 1, 4, 3, 'rgba(255,255,255,.5)');
      } else {                                                        // 停在裙子上
        pdot(b, bx + lx, by + ly, '#FFFFFF'); pdot(b, bx + lx + 1, by + ly, '#F2F0E6'); pdot(b, bx + lx, by + ly + 1, '#E8E6DA');
        const f = seg(t, tl, tl + .4); if (f < 1) { gl.globalAlpha = 1 - f; prect(gl, bx + lx - 2, by + ly - 2, 5, 5, '#FFFFFF'); gl.globalAlpha = 1; }
      }
    });
  });
  const z = 2.7 + .2 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'sg', 8, SG.herX + 4, fy - 9, z, W / 2, H / 2 - 30); glowBlitZoom(g, 'sg', 8, SG.herX + 4, fy - 9, z, W / 2, H / 2 - 30, .6, 3);
}

/* ================= shWhisper：他来了，轻声说爱你（51.30 ~ 58.40） ================= */
/* 像素气泡（缓冲坐标）：(x, y) 尾巴尖，里面画一个精灵 */
function speechBubble(b, x, y, spr, a = 1, dir = -1) {
  if (a <= 0) return;
  const bw = spr.width + 6, bh = spr.height + 6, bx = ri(x - bw / 2 + dir * 3), by = ri(y - bh - 3);
  b.save(); b.globalAlpha *= a;
  prect(b, bx + 1, by, bw - 2, bh, '#FFFFFF'); prect(b, bx, by + 1, bw, bh - 2, '#FFFFFF');
  prect(b, bx + 1, by + bh, bw - 2, 1, '#B8C0D8');
  prect(b, x, y - 3, 2, 2, '#FFFFFF'); prect(b, x + (dir < 0 ? 1 : -1), y - 1, 1, 1, '#FFFFFF');
  pspr(b, spr, bx + 3, by + 3);
  b.restore();
}
const WH = { arrive0: 51.3, sit: 52.25, lean: ch(9, 1), bubble: ch(9, 3), blush: ch(9, 4) };
function shWhisper(g, t, s) {
  const b = pbuf('sg', SG.w, SG.h), gl = glowBuf('sg', SG.w, SG.h);
  const fy = sitFy();
  schoolGarden(b, gl, t, 0, (b, gl) => {
    const blush = t >= WH.blush;
    const herE = t < WH.lean + .3 ? (blinking(t, 3) ? 'shut' : 'dn') : blush ? 'happy' : 'r';
    monAt(b, SG.herX, fy, { col: COL.her, skirt: true, legs: 'sit', eyes: herE, blush });
    miniHandheld(b, SG.herX - 20, SG_SEAT - 7, '#E6DEC8', '#BFF8EC');
    // 他：从右边走过来坐下
    if (t < WH.sit) {
      const u = seg(t, WH.arrive0, WH.sit), x = lerp(176, SG.himX, E.out(u)), wc = walkCycle(t, 6);
      monAt(b, x, SG.gy + wc.bob, { col: COL.him, cowlick: true, legs: wc.legs, eyes: 'l' });
    } else {
      const lean = t >= WH.lean && t < WH.blush + 1.2 ? -1 : 0;
      const him = { col: COL.him, cowlick: true, legs: 'sit', eyes: t < WH.lean ? 'l' : t < WH.blush + 1.2 ? 'l' : 'happy', lean };
      monAt(b, SG.himX - (lean ? 1 : 0), fy, him);
      // 悄悄话：气泡里一颗心
      const ba = env(t, WH.bubble - .1, WH.bubble + .15, WH.blush + .5, WH.blush + .8);
      speechBubble(b, SG.himX - 9, fy - 17, heart7(), ba, -1);
      // 心飘起来
      const hu = seg(t, WH.blush + .5, WH.blush + 2.2);
      if (hu > 0 && hu < 1) { b.globalAlpha = 1 - hu * hu; pspr(b, heart7(), SG.himX - 16 + Math.sin(hu * 8) * 2, fy - 30 - hu * 22); b.globalAlpha = 1; gl.globalAlpha = (1 - hu) * .6; pdisc(gl, SG.himX - 13, fy - 27 - hu * 22, 4, '#FF8AA0'); gl.globalAlpha = 1; }
    }
  });
  const z = 1.85 + .2 * E.sine(seg(t, s.t, s.e)), fx = lerp(118, 107, E.io(seg(t, WH.arrive0, WH.sit + .5)));
  blitZoom(g, 'sg', 8, fx, fy - 10, z, W / 2, H / 2 - 10); glowBlitZoom(g, 'sg', 8, fx, fy - 10, z, W / 2, H / 2 - 10, .6, 3);
  uiToast(g, t, 51.9, 53.9, '2P 已加入！', { icon: (g, x, y, k) => { g.imageSmoothingEnabled = false; g.drawImage(smon({ col: COL.him, cowlick: true }), x - 8, y - 12, 64, 52); }, col: '#9AF0DC' });
}

/* ================= shSmell：递花、低头闻（58.40 ~ 64.80） ================= */
const SM = { give: 58.7, take: ch(10, 2) + .1, smell: ch(10, 4), item: ch(10, 8) };
function shSmell(g, t, s) {
  const b = pbuf('sg', SG.w, SG.h), gl = glowBuf('sg', SG.w, SG.h);
  const fy = sitFy();
  schoolGarden(b, gl, t, 0, (b, gl) => {
    const holdHim = t < SM.take, smell = t >= SM.smell;
    const herE = t < SM.take - .5 ? 'r' : t < SM.smell ? 'dn' : t < 63.6 ? 'shut' : 'happy';
    monAt(b, SG.herX, fy, { col: COL.her, skirt: true, legs: 'sit', eyes: herE, blush: t > 61, armR: holdHim ? 'n' : 'hold', lean: smell && t < 63.6 ? 1 : 0 });
    monAt(b, SG.himX, fy, { col: COL.him, cowlick: true, legs: 'sit', eyes: t < 61 ? 'l' : 'happy', armL: holdHim ? 'reach' : 'n' });
    // 花：在他伸出的手上 → 到她怀里
    const fx = holdHim ? SG.himX - 17 : SG.herX + 6, fyy = holdHim ? fy - 13 : fy - 8;
    const mv = seg(t, SM.take - .25, SM.take);
    pspr(b, gardenia(1), ri(lerp(SG.himX - 17, SG.herX + 6, holdHim ? 0 : 1) - 3 - (holdHim ? 0 : 0)), ri(lerp(fy - 13, fy - 8, mv)) - 3);
    gl.globalAlpha = .4; pdisc(gl, fx, fyy, 4, '#FFFFFF'); gl.globalAlpha = 1;
    // 香气：从花上飘起来的小点，一路弯弯曲曲往上
    if (smell) for (let i = 0; i < 14; i++) {
      const u = mod((t - SM.smell) * .5 + i / 14, 1), x = SG.herX + 6 + Math.sin(u * 9 + i) * 4, y = fy - 9 - u * 34;
      b.globalAlpha = Math.sin(u * PI) * .9; pdot(b, x, y, i % 3 ? '#FFF8D8' : '#FFE27A'); gl.globalAlpha = b.globalAlpha; prect(gl, x - 1, y - 1, 3, 3, '#FFF4C0');
    }
    b.globalAlpha = 1; gl.globalAlpha = 1;
  });
  const z = 2.3 + .2 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'sg', 8, 107, fy - 10, z, W / 2, H / 2 + 40); glowBlitZoom(g, 'sg', 8, 107, fy - 10, z, W / 2, H / 2 + 40, .6, 3);
  uiItemGet(g, t, SM.item, s.e - .15, gardenia(2), '获得 栀子花', { cx: 900, cy: 230 });
}

/* ================= shDayNight：白天 → 黄昏 → 夜（64.80 ~ 68.85） ================= */
function shDayNight(g, t, s) {
  const b = pbuf('sg', SG.w, SG.h), gl = glowBuf('sg', SG.w, SG.h);
  const tod = E.sine(seg(t, s.t + .2, s.e - .25));
  const fy = sitFy();
  schoolGarden(b, gl, t, tod, (b) => {
    const lean = t > 67.3 ? 1 : 0;
    monAt(b, SG.herX + lean, fy, { col: COL.her, skirt: true, legs: 'sit', eyes: t > 67.3 ? 'shut' : 'up', lean });
    monAt(b, SG.himX, fy, { col: COL.him, cowlick: true, legs: 'sit', eyes: 'up' });
    pspr(b, gardenia(1), SG.herX + 3, fy - 11);
  });
  const z = 1.25 - .1 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'sg', 8, 118, 74, z, W / 2, H / 2 - 20); glowBlitZoom(g, 'sg', 8, 118, 74, z, W / 2, H / 2 - 20, .8, 3);
}

/* ================= 夜里的山坡（正面看）：两个人坐在栀子花树下 ================= */
function hillFront(b, gl, t, o = {}) {
  const w = 192, h = 130;                 // 比画面高一截：镜头往上推、往下挪都盖得满
  psky(b, w, h, [[0, '#070B2A'], [.5, '#151C52'], [1, '#2C2864']]);
  pspr(b, milkyWay(w, 80, 19, 0, 70, 192, 0, 18, '#7A6AD0'), 0, 0);
  starfield(b, t, w, 75, { n: 110, seed: 71, tw: .55, big: .07 });
  hillShape(b, w, h, [[0, 86], [50, 80], [96, 77], [150, 81], [192, 88]], '#16334A', '#24485A');
  // 树在两个人身后
  gardeniaTree(b, gl, t, o.treeX ?? 96, 79, 22, { night: true, flowers: 40, seed: 29 });
  hillShape(b, w, h, [[0, 96], [60, 84], [96, 82], [130, 84], [192, 98]], '#1C3E3A', '#2E5E4C');
  for (let i = 0; i < 60; i++) { const x = ri(hash(i, 72) * w), y0 = 86 + ri(hash(i, 73) * 44); pdot(b, x, y0, '#2A5248'); }
}
/* ================= shHillNight：十七岁仲夏（68.85 ~ 71.75） ================= */
function shHillNight(g, t, s) {
  const w = 192, h = 130, b = pbuf('hillF', w, h), gl = glowBuf('hillF', w, h);
  hillFront(b, gl, t);
  monAt(b, 86, 86, { col: COL.her, skirt: true, legs: 'sit', eyes: 'up', glint: true }, NIGHT_TINT);
  monAt(b, 108, 86, { col: COL.him, cowlick: true, legs: 'sit', eyes: 'up', glint: true }, NIGHT_TINT);
  pspr(b, tinted(gardenia(1), NIGHT_TINT, 'gdN'), 92, 75);
  // 萤火虫：从草里一只只飞起来
  const up = seg(t, s.t, s.e);
  for (let i = 0; i < 40; i++) {
    const st = hash(i, 74) * .7; if (up < st) continue;
    const u = (up - st) / (1 - st), x = hash(i, 75) * w + Math.sin(t * 1.5 + i) * 4, y = 104 - u * (30 + hash(i, 76) * 50);
    const a = .5 + .5 * Math.sin(t * 4 + i * 2);
    b.globalAlpha = a; pdot(b, x, y, '#E8FF8A'); gl.globalAlpha = a; prect(gl, x - 1, y - 1, 3, 3, '#E8FF8A');
  }
  b.globalAlpha = 1; gl.globalAlpha = 1;
  const z = 1 + .1 * E.sine(up);
  blitZoom(g, 'hillF', 10, 96, 60, z, W / 2, H / 2 - 30); glowBlitZoom(g, 'hillF', 10, 96, 60, z, W / 2, H / 2 - 30, .95, 3);
}

/* ================= shKiss：吻（71.75 ~ 77.30） ================= */
const KS = { turnHim: ch(13, 0), turnHer: ch(13, 2), lean: ch(13, 3), kiss: ch(13, 4), meteor: ch(13, 6) };
function shKiss(g, t, s) {
  const w = 120, h = 80, b = pbuf('kiss', w, h), gl = glowBuf('kiss', w, h);
  psky(b, w, h, [[0, '#080C2C'], [.6, '#18205A'], [1, '#2A2A66']]);
  starfield(b, t, w, 50, { n: 70, seed: 83, tw: .55, big: .08 });
  // 头顶是树冠和发光的栀子花
  [[18, -4, 20], [50, -8, 22], [86, -6, 22], [112, -2, 16]].forEach(([x, y, r], i) => pdisc(b, x, y, r, ['#0E2A2A', '#163A36', '#12302E', '#1A4038'][i]));
  for (let i = 0; i < 22; i++) { const x = hash(i, 84) * w, y = hash(i, 85) * 12; pdot(b, x, y, '#E8F4F0'); gl.globalAlpha = .6; prect(gl, x - 1, y - 1, 3, 3, '#F0FFF4'); gl.globalAlpha = 1; }
  hillShape(b, w, h, [[0, 58], [60, 54], [120, 57]], '#1C3E3A', '#2E5E4C');
  for (let i = 0; i < 40; i++) pdot(b, hash(i, 86) * w, 57 + hash(i, 87) * 22, '#2A5248');
  // 流星
  meteor(b, 96, 6, -60, 22, seg(t, KS.meteor, KS.meteor + .9), 16, '#FFE6A8');
  meteor(gl, 96, 6, -60, 22, seg(t, KS.meteor, KS.meteor + .9), 16, '#FFFFFF');
  // 两个人：先转过头看对方，凑近，碰在一起
  const close = E.io(seg(t, KS.lean, KS.kiss));
  const kissed = t >= KS.kiss;
  const herE = t < KS.turnHer ? 'up' : kissed ? 'shut' : 'r', himE = t < KS.turnHim ? 'up' : kissed ? 'shut' : 'l';
  const hx = ri(lerp(48, 51, close)), mx = ri(lerp(74, 70, close));
  monAt(b, hx, 61, { col: COL.her, skirt: true, legs: 'sit', eyes: herE, lean: t >= KS.lean ? 1 : 0, blush: kissed }, NIGHT_TINT);
  monAt(b, mx, 61, { col: COL.him, cowlick: true, legs: 'sit', eyes: himE, lean: t >= KS.lean ? -1 : 0, blush: kissed }, NIGHT_TINT);
  // 碰在一起的那一下：一颗大心冒出来，周围一圈星星
  if (kissed) {
    const u = t - KS.kiss, pop = E.back(clamp(u / .35)), rise = Math.min(1, u / 3) * 6;
    const H11 = heart11('#FF6A8A'), sz = clamp(pop, 0, 1.2);
    const hw = ri(11 * sz), hh = ri(10 * sz);
    if (hw > 0) b.drawImage(H11, ri(60 - hw / 2), ri(36 - rise - hh / 2), hw, hh);
    gl.globalAlpha = .8; pdisc(gl, 60, 36 - rise, 8 * sz, '#FF8AA8'); gl.globalAlpha = 1;
    const ru = clamp(u / .8);
    if (ru < 1) for (let i = 0; i < 10; i++) { const a = i / 10 * TAU, r = 6 + ru * 22; b.globalAlpha = 1 - ru; pdot(b, 60 + Math.cos(a) * r, 36 + Math.sin(a) * r * .7, i % 2 ? '#FFE27A' : '#FFFFFF'); }
    b.globalAlpha = 1;
  }
  fireflies(b, gl, t, 14, 0, 30, 120, 64, 9);
  const z = 1 + .08 * E.sine(seg(t, s.t, s.e));
  blitZoom(g, 'kiss', 16, 60, 38, z, W / 2, H / 2 - 30); glowBlitZoom(g, 'kiss', 16, 60, 38, z, W / 2, H / 2 - 30, .95, 3);
}
