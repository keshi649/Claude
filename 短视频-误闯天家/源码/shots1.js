'use strict';
/* shots1.js：前半段的镜头（误闯天家 → 劝余放下手中砂 → 张口欲唱声却哑 → 粉面披衣叫个假）。
   每个镜头一个函数 (g, t)：在自己的像素缓冲里画世界，再按 P 倍贴到屏幕（blitAt：世界点落在屏幕中心，P 取整数时像素一样大）。
   动作都卡在逐字时间 CT(句, 字) 和节拍 B(k) 上。人物脚底放在屏幕 y 1350~1500：再往下是抖音的文案区。 */

/* ---------- 1. 天门：一拍一步走到门前，"误"用指尖推门；"闯"门洞开、金光涌出，镜头冲进去 ---------- */
function gateLeaf(g, x, y, w, h, right, open) {
  const V = PAL.verm, G = PAL.gold;
  prect(g, x, y, w, h, shadeOf(V.m, 1 - open * .5));
  prect(g, x, y, w, 2, V.dd); prect(g, x, y + h - 2, w, 2, V.dd); prect(g, x, y, 1, h, V.dd); prect(g, x + w - 1, y, 1, h, V.dd);
  const rows = Math.floor((h - 10) / 15);
  for (let r = 0; r < rows; r++) for (let c = 0; c < 4; c++) {       // 门钉：每 15 像素一行，4 列
    const sx = x + Math.round((c + .5) / 4 * w), sy = y + 9 + r * 15;
    if (w >= 18) { pdisc(g, sx, sy, 1, G.m); pdot(g, sx - 1, sy - 1, G.l); pdot(g, sx + 1, sy + 1, G.dd); }
    else pdot(g, sx, sy, G.m);
  }
  if (w >= 22) {                                                         // 铺首衔环
    const kx = right ? x + 6 : x + w - 7, ky = y + Math.round(h * .55);
    pdisc(g, kx, ky, 3, G.m); pdot(g, kx - 1, ky - 1, G.dd); pdot(g, kx + 1, ky - 1, G.dd); pdot(g, kx, ky + 1, G.dd);
    pring(g, kx, ky + 6, 3, 3, G.d);
  }
}
function shotGate(g, t) {
  const w = 108, h = 192, b = pbuf('gate', w, h);
  const tPoke = CT(0, 0), tBurst = CT(0, 1), tEnd = CT(0, 2);
  skyHeaven(b, w, 96, t, { seed: 4, nstars: 46 });
  pbands(b, 0, w, [[96, PAL.sky[7]], [h, '#E89A6B']]);                // 门两边露出来的天
  xiangyun(b, 16 + Math.sin(t * .8) * 2, 30, 1); xiangyun(b, 92 - Math.sin(t * .7) * 2, 18, .8, PAL.cloud, true);
  // 门开了多少：推一下开一条缝，"闯"字一下子全开
  const open = t < tPoke ? 0 : t < tBurst ? .12 * E.out(seg(t, tPoke + .1, tPoke + .7)) : lerp(.12, 1, E.out(seg(t, tBurst, tBurst + .28)));
  const G = PAL.gold, V = PAL.verm;
  roof(b, 54, 60, 126, 16);
  prect(b, 0, 60, w, 7, '#2F6E8E'); prect(b, 0, 60, w, 1, '#58A6C4'); prect(b, 0, 66, w, 1, '#1E4A60');
  for (let x = 2; x < w; x += 9) { prect(b, x, 62, 4, 2, G.m); pdot(b, x + 1, 62, G.l); }
  // 门洞里的金光
  const DH = 80, fy = 152;                                               // 门扇高 80，门槛顶在 152（脚底在屏幕 y 1520，不进底部文案区）
  prect(b, 14, 68, 80, DH, '#FFF6D8');
  pdisc(b, 54, 108, 26, '#FFFFFF');
  const lw = Math.max(3, Math.round(40 * Math.cos(open * Math.PI / 2)));
  gateLeaf(b, 14, 68, lw, DH, false, open);
  gateLeaf(b, 94 - lw, 68, lw, DH, true, open);
  if (open < .02) {                                                       // 关着时门缝里一线光，一闪一闪
    const f = .6 + .4 * Math.sin(t * 9);
    prect(b, 53, 68, 2, DH, f > .7 ? '#FFFFFF' : '#FFE9A8');
    palpha(b, .18 + kick(t) * .25, () => prect(b, 50, 68, 8, DH, '#FFE9A8'));
  }
  if (open > 0) rays(b, 54, 108, 8, 120, 14, t * .25, '#FFF0B0', Math.min(.55, open * 2.4));
  // 柱子、门槛、台阶、云
  for (const x of [4, 94]) { prect(b, x, 66, 10, fy - 66, V.m); prect(b, x, 66, 2, fy - 66, V.l); prect(b, x + 8, 66, 2, fy - 66, V.d); prect(b, x - 1, fy - 10, 12, 8, G.d); prect(b, x - 1, fy - 10, 12, 1, G.l); }
  prect(b, 14, fy - 6, 80, 6, V.dd); prect(b, 14, fy - 6, 80, 1, G.m);
  prect(b, -2, fy, w + 4, 5, PAL.jade.m); prect(b, -2, fy, w + 4, 1, '#FFFFFF'); prect(b, -2, fy + 4, w + 4, 1, PAL.jade.dd);
  prect(b, -2, fy + 5, w + 4, 4, PAL.jade.d);
  cloudSea(b, w, fy + 4, h - fy, t, { r: 6, seed: 5, drift: 3 });
  // 小怪：一拍一步（机械地顿着走），走到门前抬头看，"误"字伸出指尖推门
  const steps = [[-9, 21], [B(0), 26], [B(1), 31], [B(2) - .04, 38]];
  let cx = 21, hop = 0;
  steps.forEach(([tt, x]) => { if (t >= tt) { cx = x; if (t < tt + .1) hop = -1; } });
  const o = { eyes: t < B(1) ? 'r' : 'up', legs: hop ? 1 : 0 };
  if (t >= tPoke) { o.arms = 'poke'; o.eyes = 'wide'; }
  if (t >= tPoke + .55) o.arms = 'n';
  if (t >= tBurst) { o.arms = 'up'; o.eyes = 'squint'; o.col = mixHex(C.clawd, '#4A2340', E.out(seg(t, tBurst, tBurst + .2))); }
  if (open > 0) palpha(b, Math.min(.45, open), () => pell(b, cx, fy - 2, 20, 4, '#FFF0B0'));
  clawdAt(b, cx, fy + hop, o);
  const ru = seg(t, tPoke, tPoke + .45);                                 // 推门的那一下：指尖处一圈金色涟漪
  if (ru > 0 && ru < 1) pring(b, 55, fy - 10, 2 + ru * 26, 2 + ru * 20, ru < .5 ? '#FFFFFF' : G.l);
  // 推镜头：门全开以后往门里冲
  const z = E.in(seg(t, tBurst + .05, tEnd));
  const [sx, sy] = shake(t, tBurst, 2, .3);
  blitAt(g, 'gate', 10 * (1 + z * 1.8), 54, 108 - z * 6, 540 + sx * 10, 1080 - z * 60 + sy * 10);
  const fl = seg(t, tBurst + .12, tEnd);                                 // 金光盖满，白闪接下一个镜头
  if (fl > 0) { g.save(); g.globalAlpha = E.in(fl) * .95; g.fillStyle = '#FFF8E6'; g.fillRect(0, 0, W, H); g.restore(); }
}

/* ---------- 2. 天家：白光散开，金瓦宫殿浮在云上；小怪"茫然张望"，一拍转一次眼睛；"家"字所有仙人一齐看过来 ---------- */
const CLOUD_PINK = { hi: '#FFF8F4', base: '#F8E2EA', sh: '#E9B9CC', deep: '#C98AAE', ol: '#A86A96' };
function shotCourt(g, t) {
  const w = 180, h = 320, b = pbuf('court', w, h);
  const t0 = CT(0, 2), tStare = CT(0, 3);
  skyHeaven(b, w, h, t, { k: .62, seed: 8, nstars: 110 });
  pglow(b, 90, 112, 70, '#FFE0A8', .45);
  pdisc(b, 90, 112, 40, '#FFD9A0');
  rays(b, 90, 112, 34, 170, 18, t * .12, '#FFE9B0', .3);
  cloudSea(b, w, 128, 40, t, { r: 7, seed: 12, drift: 1.5, pal: CLOUD_PINK });
  hall(b, 90, 146, 1.5, { tiers: 2 });
  hall(b, 32, 140, .7); hall(b, 148, 140, .7);
  cloudSea(b, w, 160, 170, t, { r: 9, seed: 13, drift: -2, pal: CLOUD_PINK });
  for (let y = 152; y < h; y++) {                                        // 御道：白玉铺的路，越远越窄
    const hw = Math.round(5 + (y - 152) * .2);
    prect(b, 90 - hw, y, hw * 2, 1, ((y - 152) >> 3) % 2 ? '#E9EEEA' : '#F7F9F6');
    pdot(b, 90 - hw - 1, y, PAL.gold.m); pdot(b, 90 + hw, y, PAL.gold.m);
  }
  // 远处两排小仙人：先看前面，"家"字一起转过来盯着小怪，头上冒出"!"
  const stare = t >= tStare;
  [[166, 0], [178, 1], [192, 2], [208, 3]].forEach(([y, i]) => {
    const hw = 5 + (y - 152) * .2;
    miniCelestial(b, 90 - hw - 9, y, t, i * 2, stare ? 1 : 0);
    miniCelestial(b, 90 + hw + 9, y, t, i * 2 + 1, stare ? -1 : 0);
    if (stare && t < tStare + .7) {
      const k = pop(t, tStare + i * .05, .2);
      for (const sx of [90 - hw - 9, 90 + hw + 9]) { prect(b, sx, y - 20 - k * 2, 1, 3, '#FFFFFF'); pdot(b, sx, y - 16 - k * 2, '#FFFFFF'); }
    }
  });
  for (const [cx, side] of [[36, 1], [144, -1]]) {                       // 近处两个大仙人，披帛飘着
    ribbon(b, cx - 14, 214, t, { len: 30, col: side > 0 ? '#F6A5C0' : '#8FE3D0', dir: -1, ph: cx });
    halo(b, cx, 210, t);
    clawdAt(b, cx, 226, { col: TONES.gold, eyes: stare ? (side > 0 ? 'r' : 'l') : 'closed', arms: 'pray' });
  }
  // 小怪：茫然张望——第 5、6、7 拍转眼睛，身子跟着顿一下
  const looks = [[t0, 'n', 0], [B(5), 'l', -1], [B(6), 'r', 1], [B(7), 'l', -1]];
  let eyes = 'n', dx = 0;
  looks.forEach(([tt, e, d]) => { if (t >= tt) { eyes = e; dx = d; } });
  clawdAt(b, 90 + dx, 254, { eyes, sweat: stare && t > tStare + .2 });
  blit(g, 'court', 6);
  const fl = 1 - seg(t, t0, t0 + .3);                                    // 从上一个镜头的白光里淡出来
  if (fl > 0) { g.save(); g.globalAlpha = fl * .95; g.fillStyle = '#FFF8E6'; g.fillRect(0, 0, W, H); g.restore(); }
}

/* ---------- 3. 劝余放下：白胡子老仙人弯下腰，指指小怪怀里那捧砂，掌心往下一压；小怪抱得更紧，直摇头 ---------- */
function shotAdvise(g, t) {
  const w = 108, h = 192, b = pbuf('advise', w, h);
  const tA = CT(1, 0), tB = CT(1, 1), tC = CT(1, 2), tD = CT(1, 3);
  const fy = 140;                                                        // 地面
  pbands(b, 0, w, [[0, '#24124A'], [30, '#3E1E66'], [60, '#6E2C76'], [92, '#A8487C'], [118, '#E08A7A'], [h, '#E08A7A']]);
  stars(b, w, 60, t, 14, 34);
  xiangyun(b, 26 + t * 2, 92, 1.3); xiangyun(b, 84 - t * 1.6, 60, 1, PAL.cloud, true);
  prect(b, 0, fy, w, h - fy, PAL.jade.m); prect(b, 0, fy, w, 1, '#FFFFFF'); prect(b, 0, fy + 11, w, 1, PAL.jade.d); prect(b, 0, fy + 26, w, 1, PAL.jade.d);
  for (let x = 6; x < w; x += 20) prect(b, x, fy, 1, h - fy, PAL.jade.d);
  prect(b, 96, 0, 8, fy, PAL.verm.m); prect(b, 96, 0, 2, fy, PAL.verm.l); prect(b, 95, fy - 8, 10, 8, PAL.gold.d);
  // 老仙人：劝——身子探过来；余——指着砂；放下——掌心往下压，一拍一压
  let arms = 'n', lean = 0, bob = 0;
  if (t >= tA) lean = 3;
  if (t >= tB) arms = 'poke';
  if (t >= tC) { arms = 'dn'; bob = kick(t, .2) > .3 ? 1 : 0; }
  const ex = 40 + lean;
  ribbon(b, ex - 12, fy - 8, t, { len: 24, col: '#8FE3D0', dir: -1 });
  halo(b, ex, fy - 14 + bob, t);
  pline(b, ex - 13, fy - 8 + bob, ex - 15, fy - 20 + bob, '#7A4A2A');    // 拂尘
  for (let i = 0; i < 5; i++) pline(b, ex - 15, fy - 20 + bob, ex - 19 - i + Math.sin(t * 3 + i) * 1.5, fy - 8 + bob + i, i % 2 ? '#F7F4EC' : '#D9D4C6');
  clawdAt(b, ex, fy + bob, { col: TONES.gold, eyes: 'closed', beard: true, brows: true, arms });
  // 小怪捧着砂：先低头看砂，"下"字抱紧、闭眼、左右摇头
  let eyes = 'n', dx = 0;
  if (t >= tB) eyes = 'dn';
  if (t >= tD) { eyes = 'squint'; dx = Math.floor(beatOf(t) * 2) % 2 ? 1 : -1; }
  clawdAt(b, 74 + dx, fy, { arms: 'hold', sand: 1 + Math.floor(t * 6) % 3, eyes });
  for (let i = 0; i < 3; i++) { const u = ((t * .9 + i / 3) % 1); sparkle(b, 68 + i * 6 + dx, fy - 12 - u * 10, u, '#FFF0B0'); }
  blitAt(g, 'advise', 14, 57, 110);
}

/* ---------- 4. 手中砂：特写，砂从指缝里漏下去；"砂"字镜头跟着砂往下摇，穿过云海，底下是人间的灯火 ---------- */
function shotSand(g, t) {
  const w = 54, h = 300, b = pbuf('sand', w, h);
  const tB = CT(1, 5), tC = CT(1, 6);
  pbands(b, 0, w, [[0, '#3B1F63'], [36, '#6E2C76'], [70, '#A8487C'], [100, '#E08A7A'], [124, '#F4C3CF'], [168, '#16274A'], [230, '#101C38'], [h, '#0A1226']]);
  stars(b, w, 40, t, 23, 12);
  cloudSea(b, w, 112, 56, t, { r: 6, seed: 19, drift: 4, pal: CLOUD_PINK });
  const r = R(4);                                                        // 云下面：人间的夜，远远的一片灯火
  for (let i = 0; i < 40; i++) { const x = r() * w, y = 180 + r() * 60; pdot(b, x, y, r() < .3 ? '#8E7AAE' : '#3A4A70'); }
  for (let c = 0; c < 5; c++) {                                          // 几簇人家的灯
    const ccx = 6 + c * 10 + r() * 4, ccy = 250 + r() * 14;
    for (let i = 0; i < 6; i++) { const tw = Math.sin(t * 3 + i + c) > 0; pdot(b, ccx + (r() - .5) * 7, ccy + (r() - .5) * 4, tw ? '#FFD884' : '#FFC861'); }
  }
  prect(b, 0, 266, w, 1, '#2A3A60');
  // 小怪：低头看砂 →"中"字砂开始漏、瞪大眼 →"砂"字漏光了，眼泪
  const left = t < tC + .35;
  clawdAt(b, 27, 51, { arms: 'hold', sand: left ? 1 + Math.floor(t * 6) % 3 : 0, eyes: t < tB ? 'dn' : t < tC ? 'wide' : 'dn', tear: t >= tC + .2 });
  if (t >= tB) sandFall(b, 27, 47, t - tB, { n: 90, spd: 26, spread: 6, span: 1.3, seed: 7 });
  for (let i = 0; i < 4; i++) { const u = ((t * 1.1 + i / 4) % 1); if (left) sparkle(b, 19 + i * 5, 44 - u * 6, u, '#FFF0B0'); }
  const camY = E.io(seg(t, tC, tC + .8)) * 190;
  blit(g, 'sand', 20, 0, camY);
}

/* 戏台：红幔、金色团花、横梁、灯笼、红氍毹 */
function stageSet(b, w, h, t, o = {}) {
  const fy = o.floor || h - 44, G = PAL.gold;
  prect(b, 0, 0, w, fy, '#6E1A26');
  for (let x = 0; x < w; x += 6) { prect(b, x, 0, 2, fy, '#8A2432'); prect(b, x + 5, 0, 1, fy, '#52121C'); }
  const mx = w / 2, my = o.my || fy * .46, mr = o.mr || Math.round(w * .18);
  pdisc(b, mx, my, mr + 2, '#52121C'); pring(b, mx, my, mr, mr, G.m, 2); pring(b, mx, my, mr - 4, mr - 4, G.d);
  xiangyun(b, mx, my + 2, mr / 22, { hi: G.l, base: G.m, sh: G.d, deep: G.dd, ol: G.dd });
  prect(b, 0, 0, w, 14, '#3A1E1A'); for (let x = 3; x < w; x += 7) { prect(b, x, 5, 3, 3, G.m); pdot(b, x + 1, 5, G.l); }
  prect(b, 0, 14, w, 2, G.d);
  for (let x = 0; x < w; x += 10) pell(b, x + 5, 17, 5, 3, '#B8282E');                // 红帷幔
  for (const x of [0, w - 9]) { prect(b, x, 16, 9, fy - 16, PAL.verm.m); prect(b, x + (x ? 7 : 0), 16, 2, fy - 16, PAL.verm.d); prect(b, x, 16, 9, 3, G.m); }
  lantern(b, 22, 24, t); lantern(b, w - 22, 24, t);
  prect(b, 0, fy, w, 20, '#6B3A22'); for (let x = 0; x < w; x += 9) prect(b, x, fy, 1, 20, '#4E2816');
  prect(b, 10, fy + 2, w - 20, 14, '#B8282E'); prect(b, 10, fy + 2, w - 20, 1, G.m); prect(b, 10, fy + 15, w - 20, 1, G.m);
  prect(b, 0, fy + 20, w, 3, G.d); prect(b, 0, fy + 20, w, 1, G.l);
  prect(b, 0, fy + 23, w, h - fy - 23, '#1A0E22');
}
/* 台下的观众：仙人的后脑勺和光环 */
function audience(b, w, y, t, n = 5) {
  for (let i = 0; i < n; i++) {
    const x = Math.round((i + .5) * w / n + (i % 2 ? 3 : -3));
    pell(b, x, y + 8, 11, 8, '#2A1436'); pell(b, x, y + 6, 9, 6, '#3A1E48');
    pring(b, x, y - 3, 6, 1.5, kick(t + i * .05) > .6 ? '#FFFFFF' : '#FFE58A');
  }
}

/* ---------- 5. 张口欲唱：戏台全景，两臂一张、嘴一张；"欲"字镜头推上去，"唱"字金色的音符飘出来 ---------- */
function shotStage(g, t) {
  const w = 135, h = 240, b = pbuf('stage', w, h);
  const tA = CT(2, 0), tB = CT(2, 1), tC = CT(2, 2), tD = CT(2, 3);
  stageSet(b, w, h, t, { floor: 192 });
  pbeam(b, 68, 16, 12, 68, 198, 44, '#FFF0C8', .2);
  palpha(b, .35, () => pell(b, 68, 200, 22, 3, '#FFF0C8'));
  const o = { arms: 'n', eyes: 'n' };
  let bob = 0;
  if (t >= tA) { o.arms = 'spread'; o.mouth = 'o'; }
  if (t >= tB) { o.arms = 'upL'; o.eyes = 'up'; }
  if (t >= tC) { o.arms = 'spread'; o.eyes = 'closed'; bob = kick(t) > .5 ? -1 : 0; }
  if (t >= tD) { o.mouth = 'sing'; o.arms = Math.floor(beatOf(t)) % 2 ? 'upL' : 'upR'; }
  clawdAt(b, 68, 200 + bob, o);
  if (t >= tD) for (let i = 0; i < 6; i++) {
    const age = t - tD - i * .16; if (age < 0) continue;
    const x = 68 + (i % 2 ? 1 : -1) * (6 + age * 22) + Math.sin(age * 5 + i) * 3, y = 184 - age * 34;
    if (y > 20) note(b, x, y, i % 3 ? '#FFD34E' : '#FFF0A8', '#5A2A10');
  }
  audience(b, w, 220, t);
  const z = E.io(seg(t, tC - .05, tC + .2));                              // 推镜头：全景 8 倍 → 12 倍
  blitAt(g, 'stage', lerp(8, 12, z), lerp(67.5, 68, z), lerp(120, 160, z));
}

/* ---------- 6. 声却哑：脸部特写，嗓子里出来的音符是灰的，"却"字裂开碎成灰，"哑"字冒出一个"……"，赶紧捂住嘴 ---------- */
function shotMute(g, t) {
  const w = 45, h = 80, b = pbuf('mute', w, h);
  const tA = CT(2, 4), tB = CT(2, 5), tC = CT(2, 6);
  prect(b, 0, 0, w, h, '#6E1A26');
  for (let x = 0; x < w; x += 5) { prect(b, x, 0, 2, h, '#8A2432'); prect(b, x + 4, 0, 1, h, '#52121C'); }
  palpha(b, .35, () => pdisc(b, 22, 44, 24, '#F2B8A0'));
  palpha(b, .25, () => pdisc(b, 22, 44, 17, '#FFE8D0'));
  const o = { mouth: 'sing', eyes: 'closed', arms: 'spread' };
  if (t >= tB) o.eyes = 'wide';
  if (t >= tC) { o.mouth = 'o'; o.sweat = true; }
  if (t >= tC + .32) { o.arms = 'cover'; o.eyes = 'squint'; delete o.mouth; }
  const [sx] = shake(t, tB, 1, .25);
  clawdAt(b, 22 + sx, 54, o);
  // 两个灰音符：从嘴里飘出来，"却"字从中间裂开往下掉，碎成灰
  [[13, 30], [30, 26]].forEach(([nx, ny], i) => {
    const t0 = tA + .06 + i * .16, age = t - t0; if (age < 0) return;
    const rise = Math.min(age, tB - t0) * 14;
    const x = nx, y = ny - rise;
    if (t < tB) { note(b, x, y, '#B0AABE', '#3A3046'); return; }
    const fall = t - tB, gy = .5 * 70 * fall * fall;
    if (fall < .45) {
      b.save(); b.beginPath(); b.rect(0, 0, x + 2, h); b.clip(); note(b, x - fall * 8, y + gy, '#8E889C', '#3A3046'); b.restore();
      b.save(); b.beginPath(); b.rect(x + 2, 0, 30, h); b.clip(); note(b, x + fall * 8, y + gy * 1.2, '#8E889C', '#3A3046'); b.restore();
    }
    for (let k = 0; k < 8; k++) { const a = hash(i, k) * TAU, d = fall * (6 + 8 * hash(k, i)); if (fall > .15 && fall < 1) pdot(b, x + 2 + Math.cos(a) * d, y + 4 + gy * .8 + Math.sin(a) * d, '#7A7488'); }
  });
  // "……"气泡（左上，不压右边的歌词）
  if (t >= tC) {
    const k = pop(t, tC, .22), bx = 14, by = 20;
    b.save(); b.translate(bx, by); b.scale(k, k);
    prect(b, -11, -6, 22, 11, '#FFFFFF'); prect(b, -12, -5, 24, 9, '#FFFFFF'); prect(b, -11, 5, 22, 1, '#C9C2D6');
    prect(b, 4, 5, 3, 2, '#FFFFFF'); prect(b, 6, 7, 2, 2, '#FFFFFF');
    for (let i = 0; i < 6; i++) prect(b, -9 + i * 3 + (i > 2 ? 1 : 0), -1, 2, 2, C.ink);
    b.restore();
  }
  blit(g, 'mute', 24);
}

/* ---------- 7. 粉面披衣：变装——"粉"一个大粉扑拍上脸，"面"脸上红妆，"披"红戏服从天而降，"衣"金冠、翎子、水袖一起出来 ---------- */
function shotDress(g, t) {
  const w = 60, h = 107, b = pbuf('dress', w, h);
  const tA = CT(3, 0), tB = CT(3, 1), tC = CT(3, 2), tD = CT(3, 3);
  prect(b, 0, 0, w, h, '#4A1640');
  const cx = 30, foot = 72;
  rays(b, cx, foot - 10, 4, 80, 14, t * .5, '#FF9AB0', .3);
  rays(b, cx, foot - 10, 4, 80, 14, t * .5 + .22, '#FFD34E', .16);
  for (let i = 0; i < 14; i++) {                                         // 飘着的花瓣
    const x = (hash(i, 3) * w + t * 8 * (1 + hash(i, 4))) % w, y = (hash(i, 5) * h + t * 12) % h;
    pdot(b, x, y, i % 3 ? '#FF9AB0' : '#FFD0DC'); if (i % 2) pdot(b, x + 1, y, '#F04E6A');
  }
  const o = { eyes: 'n' };
  if (t >= tA + .22) o.powder = true;
  if (t >= tB) o.eyes = 'happy';
  if (t >= tC + .16) o.robe = true;
  if (t >= tD) { o.crown = true; o.arms = 'spread'; o.eyes = 'n'; }
  if (t >= tD) feathers(b, cx, foot - 16, t, 1);
  if (t >= tD) sleeves(b, cx, foot, t, { amp: 2, len: 18, out: .55 * E.out(seg(t, tD, tD + .3)), x0: 15, y0: 13 });
  const sq = kick(t, .12) > .5 && t >= tA ? 1 : 0;
  clawdAt(b, cx, foot + sq, o);
  if (t < tA + .05) {                                                    // 粉扑飞过来拍到脸上
    const u = E.in(seg(t, tA - .3, tA));
    const px = lerp(70, 36, u), py = lerp(24, foot - 12, u);
    pdisc(b, px, py, 7, '#FFD0DC'); pdisc(b, px - 2, py - 2, 4, '#FFFFFF'); prect(b, px - 2, py - 9, 5, 3, '#F04E6A');
  }
  const pu = seg(t, tA, tA + .45);                                       // 一团白粉"噗"地炸开
  if (pu > 0 && pu < 1) for (let i = 0; i < 9; i++) {
    const a = i / 9 * TAU, d = 4 + pu * 16;
    puff(b, cx + Math.cos(a) * d, foot - 12 + Math.sin(a) * d * .7, Math.round(6 * (1 - pu) + 1), { hi: '#FFFFFF', base: '#FFF6F2', sh: '#F2D6DE' });
  }
  for (const x of [cx - 7, cx + 7]) sparkle(b, x, foot - 10, seg(t, tB, tB + .35), '#FFFFFF');   // "面"：脸颊上叮的一下
  if (t >= tC - .1 && t < tC + .16) {                                    // 红戏服从上面落下来
    const u = E.in(seg(t, tC - .1, tC + .16)), y = lerp(4, foot - 10, u);
    prect(b, cx - 9, y, 18, 8, '#C8323A'); prect(b, cx - 9, y + 7, 18, 1, '#8E1F2A'); prect(b, cx - 9, y, 18, 1, '#F2C14E');
    prect(b, cx - 14, y + 1, 5, 3, '#C8323A'); prect(b, cx + 9, y + 1, 5, 3, '#C8323A');
  }
  for (const tt of [tA, tB, tC + .16, tD]) { const u = seg(t, tt, tt + .3); if (u > 0 && u < 1) pring(b, cx, foot - 8, 6 + u * 28, 6 + u * 28, u < .5 ? '#FFFFFF' : '#FFD0DC'); }
  const [sx, sy] = shake(t, tD, 2, .3);
  blitAt(g, 'dress', 18, cx + sx * .3, 53.5 + sy * .3);
  const fl = 1 - seg(t, tD, tD + .12);
  if (t >= tD && fl > 0) { g.save(); g.globalAlpha = fl * .7; g.fillStyle = '#FFFFFF'; g.fillRect(0, 0, W, H); g.restore(); }
}

/* ---------- 8a. 叫：一身行头，戏台中央亮相，水袖一甩 ---------- */
function shotPose(g, t) {
  const w = 108, h = 192, b = pbuf('pose', w, h);
  const tA = CT(3, 4);
  stageSet(b, w, h, t, { floor: 152, my: 64, mr: 22 });
  pbeam(b, 54, 16, 10, 54, 156, 40, '#FFF0C8', .22);
  const cx = 54, foot = 158;
  feathers(b, cx, foot - 16, t, 1);
  sleeves(b, cx, foot, t, { amp: 3, len: 20, out: .9 * E.out(seg(t, tA, tA + .2)), x0: 15, y0: 13 });
  clawdAt(b, cx, foot, { powder: true, robe: true, crown: true, arms: 'spread', eyes: 'happy' });
  for (let i = 0; i < 10; i++) { const u = seg(t, tA + i * .03, tA + .4 + i * .03); sparkle(b, cx + Math.cos(i * 2.4) * (18 + 12 * u), 128 + Math.sin(i * 2.4) * (14 + 10 * u), u, i % 2 ? '#FFD34E' : '#FFFFFF'); }
  audience(b, w, 180, t, 4);
  const z = 1 + .15 * (1 - E.out(seg(t, tA, tA + .2)));
  blitAt(g, 'pose', 16 * z, 54, 128);
}

/* ---------- 8b. 个假：照镜子，镜子里是没化妆、没穿戏服的自己，"假"字掉了一滴眼泪 ---------- */
function shotMirror(g, t) {
  const w = 108, h = 192, b = pbuf('mirror', w, h);
  const tA = CT(3, 5), tB = CT(3, 6);
  pbands(b, 0, w, [[0, '#2A1222'], [60, '#3A1A2C'], [150, '#4A2236'], [h, '#4A2236']]);
  // 左上一扇格子窗，透进暖光
  const fy = 150;
  pglow(b, 96, 70, 26, '#FFC861', .3); lantern(b, 96, 58, t);           // 右边墙上一盏灯
  prect(b, 0, fy, w, h - fy, '#5A3020'); for (let x = 0; x < w; x += 12) prect(b, x, fy, 1, h - fy, '#3E2014'); prect(b, 0, fy, w, 1, '#7A4A2E');
  // 铜镜：椭圆镜面、铜框、木架
  const mx = 72, my = 96, rx = 18, ry = 26;
  prect(b, mx - 1, my + ry, 3, fy - my - ry, '#6A3A2A'); prect(b, mx - 12, fy - 2, 25, 3, '#6A3A2A');
  pell(b, mx, my, rx + 3, ry + 3, '#8A5A22'); pell(b, mx, my, rx + 2, ry + 2, '#C99A3A');
  pell(b, mx, my, rx, ry, '#B8C6D8');
  palpha(b, .35, () => pell(b, mx - 4, my - 6, rx - 6, ry - 8, '#DDE6F2'));
  b.save(); b.beginPath(); b.ellipse(mx, my, rx, ry, 0, 0, TAU); b.clip();   // 镜子里：素面的小怪，低着头
  clawdAt(b, mx, my + 18, { eyes: t < tB ? 'dn' : 'shut', tear: t >= tB, sweat: t >= tA + .15 && t < tB }, true);
  for (let i = -ry; i < ry; i += 8) pline(b, mx - rx, my + i + 10, mx - rx + 10, my + i, '#E8F0FA');
  b.restore();
  pring(b, mx, my, rx + 1, ry + 1, '#F2C14E');
  // 镜子外：一身行头的小怪，看着镜子
  const cx = 28, foot = fy;
  feathers(b, cx, foot - 16, t, 1);
  sleeves(b, cx, foot, t, { amp: 1, len: 8 });
  clawdAt(b, cx, foot, { powder: true, robe: true, crown: true, eyes: t < tB ? 'r' : 'dn' });
  blitAt(g, 'mirror', 12, 52, 112);
}
