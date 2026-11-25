'use strict';
/* chars.js —— 角色：Claude 像素小怪（用户给的 12×8 造型，一格放大成 s×s 像素），还有猫、路人、小道具。
     ..########..        造型不改：身子 8×6、两边各一节手、底下四条腿、两只眼睛。
     ..#e####e#..        放大以后加的只是像素画的光影（顶上一道亮边、右下暗边、眼睛高光、侧逆光），
     ############        和故事里的小物件：她十七岁的蓝色百褶裙、头上的栀子花发夹；他头顶一撮翘毛。
     ############
     ..########..
     ..########..
     ..#.#..#.#..
     ..#.#..#.#..                                                                                   */
const CL = { her: '#D97757', him: '#4C9CC4', eye: '#1A1216' };
const SKIRT = ['#1E3C86', '#2F56B0', '#4A78D6', '#7BA4F0'];
const GARD = { w: '#FFFFFF', w2: '#F1EEDC', w3: '#D6D2B8', c: '#E9DE7A', dry: '#E8D9B0', dry2: '#C9B58A' };
const PAD = 4;                                           // 精灵四周留 4 格（举手、翘毛、发夹、裙摆）

/* o：col 身体色；eyes 'n' 'l' 'r' 'up' 'dn' 'shut'(闭眼一条线) 'happy'(^ ^) 'sad' 'wide' 'blink' 'back'(背面)；
   arms 'n' 'up' 'wave' 'reachR' 'reachL' 'hug' 'holdR'（右手举到肩上，撑伞）；legs 0 站 / 1、2 走路两帧 / 'tuck' 收腿；
   skirt 蓝裙；clip 'fresh' | 'dry' 栀子花发夹；cowlick 翘毛；blush 0~1 脸红；tear 0~1 眼泪往下流到哪；
   rim [颜色, 'l'|'r'|'b'] 侧逆光；ol 描边色；k 整体亮度（0.4 暗处 ~ 1） */
function mon(s, o = {}) {
  const key = 'M' + s + JSON.stringify(o);
  const S = s, cw = (12 + PAD * 2) * S, chh = (8 + PAD * 2) * S;
  return cached(key, cw + 2, chh + 2, g => {
    const base = o.col || CL.her, back = o.eyes === 'back';
    const kk = o.k ?? 1, body = kk < 1 ? dk(base, (1 - kk) * .9) : base;
    const hi = lt(body, .32), lo = dk(body, .28), lo2 = dk(body, .45);
    const ox = (PAD + 0) * S + 1, oy = PAD * S + 1;      // 网格 (0,0) 在精灵里的位置（+1 给描边）
    const B = (x, y, w, h, c) => R(g, ox + x * S, oy + y * S, w * S, h * S, c);
    // 身体格子：先画到一个蒙版里，用来描边和打光
    const cells = [];
    const add = (x, y, w, h) => cells.push([x, y, w, h]);
    add(2, 0, 8, 6);
    const arms = o.arms || 'n', wv = o.wave || 0;
    const armL = arms === 'up' ? [0, 0] : arms === 'reachL' || arms === 'hug' ? [-1, 2] : (arms === 'wave2' ? [0, 0] : [0, 2]);
    const armR = arms === 'up' || (arms === 'wave' && wv) || arms === 'wave2' ? [10, 0] : arms === 'reachR' || arms === 'hug' ? [11, 2] : arms === 'holdR' ? [10, 1] : [10, 2];
    if (arms !== 'noL') add(armL[0], armL[1], 2, 2);
    if (arms !== 'noR') add(armR[0], armR[1], 2, 2);
    const legs = o.legs || 0;
    [[2, 1], [4, 2], [7, 1], [9, 2]].forEach(([x, grp]) => {
      if (legs === 'tuck') add(x, 6, 1, 1); else add(x, 6, 1, legs === grp ? 1 : 2);
    });
    // 描边
    if (o.ol) {
      g.fillStyle = o.ol;
      cells.forEach(([x, y, w, h]) => g.fillRect(ox + x * S - 1, oy + y * S - 1, w * S + 2, h * S + 2));
    }
    cells.forEach(([x, y, w, h]) => B(x, y, w, h, back ? dk(body, .12) : body));
    // 光影（s ≥ 2 才画）
    if (S >= 2) {
      const e = Math.max(1, fl(S / 4));
      R(g, ox + 2 * S, oy, 8 * S, e, hi);                                     // 头顶亮边
      R(g, ox + 2 * S, oy, e, 6 * S, mix(body, hi, .5));                      // 左边亮一点
      R(g, ox + 10 * S - e, oy + e, e, 6 * S - e, lo);                        // 右边暗边
      R(g, ox + 2 * S, oy + 6 * S - e, 8 * S, e, lo2);                        // 底边（腿上面）
      cells.slice(1).forEach(([x, y, w, h]) => { R(g, ox + x * S, oy + y * S, w * S, e, hi); R(g, ox + x * S, oy + (y + h) * S - e, w * S, e, lo); });
      if (S >= 4) {                                                            // 体积：上亮下暗（抖动过渡）
        const iw = 8 * S - 2 * e;
        dith(g, ox + 2 * S + e, oy + e, iw, fl(S * 1.2), mix(body, hi, .6), .35);
        dith(g, ox + 2 * S + e, oy + fl(S * 3.6), iw, fl(S * .9), lo, .25);
        dith(g, ox + 2 * S + e, oy + fl(S * 4.5), iw, 6 * S - e - fl(S * 4.5), lo, .55);
        R(g, ox + 2 * S + 2 * e, oy + 2 * e, 3 * e, e, lt(body, .65)); R(g, ox + 2 * S + 2 * e, oy + 3 * e, e, e, lt(body, .5));
      }
    }
    // 裙子
    if (o.skirt) {
      const y0 = oy + 4 * S, h1 = 2 * S + (S >= 2 ? fl(S / 2) : 0);
      const x0 = ox + 2 * S, w0 = 8 * S;
      for (let j = 0; j < h1; j++) {
        const fl2 = fl(j / h1 * S * .9);                                       // 往下张开
        const xa = x0 - fl2, xb = x0 + w0 + fl2;
        for (let x = xa; x < xb; x++) {
          const pl = fl((x - xa) / Math.max(1, (xb - xa) / 8));                  // 8 道褶
          let c = pl % 2 ? SKIRT[1] : SKIRT[2];
          if (j < Math.max(1, fl(S / 3))) c = SKIRT[0];                        // 腰带
          else if (j === h1 - 1) c = SKIRT[0];
          else if (S >= 3 && (x - xa) % Math.max(2, fl((xb - xa) / 8)) === 0) c = SKIRT[0];
          R(g, x, y0 + j, 1, 1, c);
        }
      }
      if (S >= 3) R(g, x0 + 1, y0 + fl(S / 3), w0 - 2, 1, SKIRT[3]);
    }
    // 翘毛
    if (o.cowlick) {
      const c1 = back ? dk(body, .12) : body;
      B(7, -1, 1, 1, c1); B(8, -2, 1, 1, c1); if (S >= 2) R(g, ox + 8 * S, oy - 2 * S, S, Math.max(1, fl(S / 4)), hi);
      if (S >= 3) B(6.5, -1, .5, 1, c1);
    }
    // 栀子花发夹（左上角）
    if (o.clip) {
      const fresh = o.clip === 'fresh', w1 = fresh ? GARD.w : GARD.dry, w2 = fresh ? GARD.w3 : GARD.dry2;
      const cx = ox + 2.6 * S, cy = oy - .1 * S;
      if (S === 1) { R(g, cx - 1, cy - 1, 2, 2, w1); }
      else if (S >= 4) gardenia(g, cx, cy - S * .2, S * 1.15, { dry: !fresh, rot: .4 });
      else {
        const r = Math.max(1.4, S * .85);
        for (let i = 0; i < 5; i++) { const a = i / 5 * TAU - PI / 2; disc(g, cx + Math.cos(a) * r * .75, cy + Math.sin(a) * r * .75, r * .62, w1); }
        if (S >= 3) for (let i = 0; i < 5; i++) { const a = i / 5 * TAU - PI / 2 + .6; P(g, cx + Math.cos(a) * r * .9, cy + Math.sin(a) * r * .9, w2); }
        disc(g, cx, cy, Math.max(.6, r * .28), GARD.c);
      }
    }
    // 眼睛
    if (!back) {
      const ev = o.eyes || 'n', ec = CL.eye;
      const shift = S >= 3 ? (ev === 'l' ? -fl(S / 3) : ev === 'r' ? fl(S / 3) : 0) : 0;
      const vsh = S >= 3 ? (ev === 'up' ? -fl(S / 3) : ev === 'dn' ? fl(S / 4) : 0) : 0;
      [3, 8].forEach(ex => {
        const x = ox + ex * S + shift, y = oy + S + vsh;
        if (ev === 'shut' || ev === 'blink') {
          const lh = Math.max(1, fl(S / 4)); R(g, x, y + fl(S / 2), S, lh, ev === 'blink' ? ec : dk(body, .6));
        } else if (ev === 'happy') {                                          // ^ ^
          const lh = Math.max(1, fl(S / 4));
          if (S < 3) R(g, x, y + fl(S / 2), S, 1, ec);
          else { R(g, x + lh, y + lh, S - 2 * lh, lh, ec); R(g, x, y + 2 * lh, lh, S - 2 * lh, ec); R(g, x + S - lh, y + 2 * lh, lh, S - 2 * lh, ec); }
        } else {
          R(g, x, y, S, S, ec);
          if (ev === 'sad' && S >= 3) { const lh = Math.max(1, fl(S / 4)); R(g, ex === 3 ? x + S - lh * 2 : x, y, lh * 2, lh, body); }
          if (S >= 3) {                                                          // 高光
            const gs = Math.max(1, fl(S / 4)); R(g, x + gs, y + gs, gs, gs, '#FFFFFF');
            if (ev === 'wide' || S >= 8) R(g, x + S - 2 * gs, y + S - 2 * gs, Math.max(1, fl(gs / 2)), Math.max(1, fl(gs / 2)), '#BFD8FF');
          }
          if (o.refl && S >= 6) { const gs = Math.max(1, fl(S / 6)); o.refl.slice(0, 2).forEach((c, i) => R(g, x + S - 2 * gs - i * gs * 2, y + S - 2 * gs, gs, gs, c)); }
        }
      });
      if (o.blush) {
        const a = clamp(o.blush);
        g.save(); g.globalAlpha = .55 * a; [2, 8].forEach(bx => R(g, ox + bx * S + fl(S / 4), oy + 2 * S + fl(S / 4), fl(S * 1.5), Math.max(1, fl(S / 2)), '#FF6A8A')); g.restore();
        if (S >= 4 && a > .5) [2, 8].forEach(bx => { R(g, ox + bx * S + fl(S / 2), oy + 2 * S + fl(S / 3), 1, 1, '#FFB0C0'); });
      }
      if (o.tear) {                                                          // 眼泪：从右眼下面流下来
        const tl = clamp(o.tear), x = ox + 8 * S + fl(S / 3), y = oy + 2 * S, len = fl(tl * 3.4 * S);
        const tw = Math.max(1, fl(S / 4));
        R(g, x, y, tw, len, '#9FE0FF'); if (S >= 3) R(g, x, y, Math.max(1, fl(tw / 2)), len, '#E6F8FF');
        if (len > 0) R(g, x - (S >= 3 ? 1 : 0), y + len, tw + (S >= 3 ? 1 : 0), tw + (S >= 3 ? 1 : 0), '#CFF2FF');
        if (o.tear2) { const x2 = ox + 3 * S + fl(S / 3), l2 = fl(clamp(o.tear2) * 3 * S); R(g, x2, y, tw, l2, '#9FE0FF'); }
      }
    }
    // 侧逆光：剪影边上一道彩色亮边
    if (o.rim) {
      const [rc, side] = o.rim, e = Math.max(1, fl(S / 4));
      cells.forEach(([x, y, w, h]) => {
        if (side !== 'r') R(g, ox + x * S, oy + y * S, e, h * S, rc);
        if (side !== 'l') R(g, ox + (x + w) * S - e, oy + y * S, e, h * S, rc);
      });
    }
  });
}
/* 按"脚底中点"放小怪：(cx, feetY) 是两腿中间、脚底那一行 */
function monAt(g, cx, feetY, s, o = {}, ex = {}) {
  const sp = mon(s, o), x = ri(cx - 6 * s) - PAD * s - 1, y = ri(feetY - 8 * s) - PAD * s - 1;
  blit(g, sp, x, y, ex);
  return { x: x + PAD * s + 1, y: y + PAD * s + 1, s };   // 网格 (0,0) 的位置：挂道具用
}
/* 走路：rate 步/秒，返回 legs 帧和身子上下颠的像素数 */
function walk(t, rate = 4, s = 1) { const k = fl(t * rate) % 2; return { legs: k ? 1 : 2, bob: (fl(t * rate * 2) % 2) * Math.max(1, fl(s / 3)) * (s >= 2 ? 1 : 0) }; }
function blinkAt(t, seed = 1) { const per = 2.6 + 2.2 * hash(seed, 9), u = mod(t + hash(seed, 3) * per, per); return u < .13; }

/* ---------------- 路人：小怪换颜色，打各色的伞 ---------------- */
const CROWD = ['#8E7FB8', '#6E8FB0', '#B07F9E', '#7FA88E', '#A89A7F', '#8FA0C8', '#C8A07F', '#7F8EA8', '#A87F7F', '#9E9EB8', '#7FB0B0', '#C0A0C8'];
const UMB = ['#E8505B', '#3E7FE0', '#F2C94C', '#56C596', '#9B6AE0', '#F28C3C', '#E870B8', '#4CC6E8', '#2E2E3E', '#E0E0E8'];

/* ---------------- 伞 ---------------- */
/* 透明伞（她）：半透明的穹顶 + 骨架 + 雨珠高光；col 有色伞 */
function umbrella(g, cx, topY, r, o = {}) {
  const clear = !o.col, col = o.col || '#CFE8FF', h = ri(r * .62);
  g.save();
  if (clear) g.globalAlpha *= .38;
  for (let y = 0; y < h; y++) {                               // 穹顶：半个椭圆
    const u = 1 - y / h, hw = ri(r * Math.sqrt(1 - u * u * .98));
    R(g, cx - hw, topY + y, hw * 2 + 1, 1, y < 2 ? lt(col, .3) : y > h - 3 ? dk(col, .25) : col);
  }
  g.restore();
  // 伞骨、伞边的波浪
  const ribs = o.ribs || 6, edge = clear ? '#EAF6FF' : dk(col, .35);
  for (let i = 0; i <= ribs; i++) { const xx = cx - r + (2 * r) * i / ribs; line(g, cx, topY, xx, topY + h - (i % 2 ? 1 : 0), clear ? rgba('#FFFFFF', .55) : dk(col, .18)); }
  for (let x = -r; x <= r; x++) P(g, cx + x, topY + h - 1 + (mod(x + r, 2 * r / ribs) < 1 ? 0 : 1), edge);
  R(g, cx, topY - 2, 1, 2, '#3A3A48');                       // 伞尖
  R(g, cx, topY + h, 1, o.stick || ri(r * .9), clear ? '#C8D0E0' : '#3A3A48');   // 伞柄
  if (clear && o.drops !== false) for (let i = 0; i < r * .9; i++) {           // 伞面上的雨珠
    const a = hash(i, 71) * PI, rr = hash(i, 72) * .9;
    const x = cx + Math.cos(a) * r * rr, y = topY + h - Math.sin(a) * h * rr;
    P(g, x, y, i % 3 ? '#FFFFFF' : '#A8D8FF');
  }
}

/* ---------------- 猫：小白猫（趴着、坐着、走），尾巴会动 ---------------- */
function cat(g, x, y, pose, t, o = {}) {
  const c = o.col || '#F2EEE8', c2 = o.col2 || '#C9C2D8', e = '#2A2030', pk = '#FF9AAE';
  const pal = { a: c, b: c2, e, p: pk, o: o.ol || '#1A1530' };
  let rows;
  if (pose === 'loaf') rows = ['..o.....o.....', '.oao...oao....', '.oaaooooaao...', 'oaaeaaaeaaaoo.', 'oaaapaaaaaaaao', 'oaaaaaaaaaaaao', '.obbbbbbbbbbo.', '..oooooooooo..'];
  else if (pose === 'sleep') rows = ['..o.....o.....', '.oao...oao....', '.oaaooooaao...', 'oaabbaabbaaoo.', 'oaaaaaaaaaaaao', 'oaaaaaaaaaaaao', '.obbbbbbbbbbo.', '..oooooooooo..'];
  else if (pose === 'sit') rows = ['.o...o..', 'oaoooao.', 'oaeaeao.', 'oaapaao.', '.oaaao..', 'oaaaaao.', 'oaaaaao.', 'oabbbao.', 'oaaoaao.', '.oo.oo..'];
  else { const k = fl(t * 6) % 2; rows = ['.........o..o.', '........oaooao', '.oooooooaeaeao', 'oaaaaaaaaapaao', 'oaaaaaaaaaaao.', 'obbbbbbbbbbo..', k ? '.oao..oao.....' : 'oao....oao....', k ? '.oo...oo......' : 'oo......oo....']; }
  const s = spr(rows, pal);
  blit(g, s, x, y, { flip: o.flip });
  // 尾巴：慢慢甩
  const w = s.width, tailBase = pose === 'sit' ? [x + (o.flip ? -1 : 7), y + 7] : pose === 'walk' ? [x + (o.flip ? w : -1), y + 3] : [x + (o.flip ? -2 : w - 1), y + 6];
  const sw = Math.sin(t * (pose === 'sleep' ? 1.2 : 2.4) + (o.seed || 0)), dir = o.flip ? 1 : -1;
  const tail = pose === 'walk' ? [[0, 0], [1, -1], [1, -2], [1 + ri(sw), -3]] : [[0, 0], [1, 0], [2, -ri(sw + 1)], [2 + ri(sw * .6), -2 - ri(sw + 1)]];
  tail.forEach(([dx, dy]) => { R(g, tailBase[0] - dir * dx * (pose === 'walk' ? -1 : 1), tailBase[1] + dy, 1, 1, c); });
  if (pose === 'sleep' && mod(t, 3) < 1.5) tiny(g, 'Z', x + 12, y - 5 - ri(mod(t, 3) * 2), '#C8D0FF');
}

/* ---------------- 栀子花 ---------------- */
/* 一朵栀子花：r 半径；open 0~1 开的程度；dry 干花 */
function gardenia(g, cx, cy, r, o = {}) {
  const dry = o.dry, w1 = dry ? GARD.dry : GARD.w, w2 = dry ? GARD.dry2 : GARD.w2, w3 = dry ? '#A8916A' : GARD.w3, n = 6, rot = o.rot || 0;
  if (r < 2) { disc(g, cx, cy, Math.max(1, r), w1); P(g, cx, cy, GARD.c); return; }
  for (let i = 0; i < n; i++) {                                  // 外圈花瓣：椭圆，一圈 6 片，螺旋叠
    const a = rot + i / n * TAU, px = cx + Math.cos(a) * r * .58, py = cy + Math.sin(a) * r * .5;
    ell(g, px, py + 1, r * .5, r * .36, w3); ell(g, px, py, r * .48, r * .34, i % 2 ? w2 : w1);
  }
  for (let i = 0; i < 5; i++) { const a = rot + .5 + i / 5 * TAU; ell(g, cx + Math.cos(a) * r * .28, cy + Math.sin(a) * r * .24, r * .3, r * .22, w1); }
  disc(g, cx, cy, Math.max(1, r * .16), dry ? '#C8B070' : GARD.c);
  if (r >= 5) P(g, cx - ri(r * .35), cy - ri(r * .3), '#FFFFFF');
}
/* 一片花瓣（飘落用）：转着翻面，phase 决定当前的宽度 */
function petal(g, x, y, ph, o = {}) {
  const w = ri(Math.abs(Math.cos(ph)) * 2) + 1, c = o.col || (Math.cos(ph) > 0 ? GARD.w : GARD.w2);
  R(g, x, y, w, o.big ? 2 : 1, c); if (o.big) R(g, x + (w > 1 ? 1 : 0), y + 2, 1, 1, GARD.w3);
}
/* 心形 */
const HEART = ['.##.##.', '#######', '#######', '.#####.', '..###..', '...#...'];
function heart(g, x, y, c = '#FF5A7A', k = 1) { blit(g, spr(HEART, { '#': c }), x, y, { k }); }
/* 小怪 + 贴在身上的光影：sweep [颜色, 位置 0~1, 宽, 强度] 一道光扫过；drops 身上往下滑的雨珠数；
   light [颜色, 强度] 整体染一层；t 时刻。先画到临时层，再只在身体上叠（source-atop） */
function monFX(g, cx, feetY, s, o = {}, fx = {}) {
  const sp = mon(s, o), q = layer('monfx', sp.width, sp.height), x = ri(cx - 6 * s) - PAD * s - 1, y = ri(feetY - 8 * s) - PAD * s - 1, t = fx.t || 0;
  q.drawImage(sp, 0, 0); q.globalCompositeOperation = 'source-atop';
  if (fx.light) { q.globalAlpha = fx.light[1]; q.fillStyle = fx.light[0]; q.fillRect(0, 0, sp.width, sp.height); q.globalAlpha = 1; }
  if (fx.sweep) {
    const [c, pos, w, a] = fx.sweep, bx = pos * (sp.width + sp.height) - sp.height;
    q.globalAlpha = a ?? .35; poly(q, [[bx, 0], [bx + w, 0], [bx + w + sp.height * .6, sp.height], [bx + sp.height * .6, sp.height]], c); q.globalAlpha = 1;
  }
  if (fx.drops) for (let i = 0; i < fx.drops; i++) {
    const per = 1.2 + hash(i, 3) * 1.6, u = mod(t + hash(i, 4) * per, per) / per, dx = (PAD + 2.3 + hash(i, 5) * 7.4) * s, dy = (PAD + hash(i, 6) * 2) * s + u * 5 * s;
    R(q, dx, dy, Math.max(1, fl(s / 5)), Math.max(1, fl(s / 5)), 'rgba(235,245,255,.9)'); R(q, dx, dy - fl(s / 2), 1, fl(s / 2), 'rgba(200,225,255,.35)');
  }
  q.globalCompositeOperation = 'source-over';
  blit(g, LAYER.monfx, x, y, { a: fx.a ?? 1 });
}
