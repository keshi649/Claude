'use strict';
/* scenes4.js —— 第二遍副歌（114.3 ~ 150 秒）和间奏（150 ~ 176.4 秒）。
   副歌：公园长椅上一年过去（春天她靠在他肩上 → 秋天两个人坐到长椅两头）；雨夜吵架，她摔门走了；
   架子上的罐子被震下来，慢镜头摔碎，红豆和纸条撒了一地；他跪在地上一颗颗捡，捡起"一起看一场雪"；
   门开了，她回来，跪下来握住他的手，红线重新系上；四处风景（海边灯塔、雪山日出、花田、极光）；溪边的石头上看日落。
   间奏：院子里种下红豆，冒出芽；红豆树一年年长大，两个人慢慢变老；墙上的照片一张张多起来；老了以后在树下坐到天黑。 */

/* 照片：把某个镜头某一时刻的画面画下来缩小，缓存起来（同一个 id 和时刻只画一次） */
const _snapCache = {};
const _snapBig = mk(), _snapG = _snapBig.getContext('2d');
function snap(id, at) {
  const key = id + '@' + at;
  if (_snapCache[key]) return _snapCache[key];
  const sc = SCENES.find(x => x.id === id);
  const c = mk(480, 270);
  if (sc) { drawScene(sc, _snapG, sc.a + at); c.getContext('2d').drawImage(_snapBig, 0, 0, 480, 270); }
  return (_snapCache[key] = c);
}
const MEMORIES = [['V1c', 1.6], ['V1f', 2.0], ['C1i', 1.9], ['V2c', 1.4], ['V2h', 1.8], ['C2h', .5], ['C1b', 1.6], ['C2i', 3.0]];

SCENES_DEF.push(() => {
  // C2a：公园长椅，一年过去（时间流逝）：春天她靠在他肩上；"我会相信一切有尽头"时到了秋天，两个人坐到了长椅两头
  scene('C2a', CUT(24), (g, s, k) => {
    const yr = lerp(0, .64, clamp(k / 7.6));
    const apart = E.io(seg(s, Lt(25) - .3, Lt(25) + 1.2));
    camera(g, 960, 600, 1.15, () => {
      park(g, s, yr);
      bench(g, 960, 905, 520, 1.1);
      const Ps = { who: 'she', u: 40, x: lerp(910, 790, apart), seat: 828, view: 'front', out: yr < .45 ? OUTFIT.sheSummer : OUTFIT.sheTravel, pose: { sitF: true, aN1: 10, aN2: 30, aF1: 10, aF2: 30, lean: lerp(10, -4, apart), tilt: lerp(.25, -.1, apart) }, light: LT.day, t: s, eyes: apart > .5 ? 'down' : 'closed', mouth: apart > .5 ? 'flat' : 'smile', blush: lerp(.8, .3, apart) };
      const Ph = { who: 'he', u: 42, x: lerp(1010, 1140, apart), seat: 828, view: 'front', out: yr < .45 ? OUTFIT.heSummer : OUTFIT.heTravel, pose: { sitF: true, aN1: 10, aN2: 30, aF1: 10, aF2: 30, tilt: lerp(-.08, .12, apart) }, light: LT.day, t: s, eyes: apart > .5 ? 'down' : 'happy', mouth: apart > .5 ? 'flat' : 'smile', gaze: [apart, .3] };
      person(g, Ps); person(g, Ph);
    });
  }, { tr: { type: 'flash', dur: .4 }, bloom: .28 });

  // C2d：雨夜，吵架了——两个人背对背站着；"都有时候"她拿起外套，开门走了；红线绷得紧紧的
  scene('C2d', CUT(26), (g, s, k) => {
    const leave = seg(s, Lc(26, 4) - .2, Lc(26, 4) + 1.6);
    camera(g, 1000, 640, 1.35, () => {
      room(g, s, { mood: 'rain', outside: (gg, x, y, w, h) => { gg.fillStyle = vgrad(gg, y, y + h, [[0, '#101834'], [1, '#283258']]); gg.fillRect(x, y, w, h); rain(gg, s, 140, { box: [x, y, x + w, y + h], col: 'rgba(200,215,255,.35)', ang: .2 }); }, lampOn: .55,
        onShelf: (gg, sx, sy) => jar(gg, sx + 200, sy, .5, { fill: .5, slips: 4, seed: 7 }) });
      // 门（右边）：开门时漏进走廊的光
      const dx = 1560, open = Math.sin(Math.PI * clamp((leave - .3) / .7)) * (leave > .3 ? 1 : 0);
      g.fillStyle = '#FFE0A8'; g.fillRect(dx, 520, 150, 330);
      g.fillStyle = '#6B4E3E'; g.fillRect(dx + open * 120, 520, 150 - open * 120, 330); g.fillStyle = '#C9A06A'; circ(g, dx + 20 + open * 120, 690, 7); g.fill();
      if (open > 0) { g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = `rgba(255,220,160,${.3 * open})`; poly(g, [[dx, 850], [dx + 150, 850], [dx + 40, 1100], [dx - 400, 1100]]); g.fill(); g.restore(); }
      const Ph = { who: 'he', u: 42, x: 900, y: 990, f: -1, out: OUTFIT.heHome, pose: pose('stand', { hd: 12, aN1: 4 }), light: LT.lamp, t: s, eyes: 'down', mouth: 'flat' };
      const sx = lerp(1180, 1640, E.in2(leave));
      const Ps = { who: 'she', u: 40, x: sx, y: 990, f: 1, out: OUTFIT.sheTravel, pose: leave > 0 && leave < 1 ? walkPose(s * 7) : pose('stand', { hd: 10, aN1: 20, aN2: 30 }), light: LT.lamp, t: s, eyes: 'down', mouth: 'sad', alpha: 1 - seg(leave, .8, 1) };
      person(g, Ph); person(g, Ps);
      const a = handPos(Ph, 'F'), b = handPos(Ps, 'F');
      redThread(g, [a, [lerp(a[0], b[0], .5), lerp(a[1], b[1], .5) + lerp(30, 0, clamp(leave * 2))], b], 3, 1 - seg(leave, .85, 1) * .5, .6);
      roomLight(g, 'rain', { lx: 1180, ly: 520 });
    });
  }, { tr: { type: 'fade', dur: .4 }, bloom: .22, grade: 'saturate(.9) contrast(1.04)' });

  // C2e：门"砰"地关上，架子一震，罐子掉下来，慢镜头摔碎——红豆和纸条撒了一地
  scene('C2e', CUT(27), (g, s, k) => {
    const hit = Lc(27, 5);                 // "永"：摔碎
    const fall = seg(s, hit - 1.0, hit);
    const shk = shake(s, CUT(27) + .2, 8, .5);
    camera(g, 1640 + shk[0], 650 + shk[1], 1.8, () => {
      room(g, s, { mood: 'rain', outside: (gg, x, y, w, h) => { gg.fillStyle = '#18203E'; gg.fillRect(x, y, w, h); }, lampOn: .5 });
            // 罐子：先在架子上晃，然后掉下来、转着
      if (s < hit) {
        const wob = s < hit - 1.0 ? Math.sin(s * 30) * .06 * seg(s, CUT(27) + .2, CUT(27) + .5) : 0;
        const jy = 450 + E.in2(fall) * 380, jr = wob + fall * 1.4;
        g.save(); g.translate(1700 - fall * 60, jy); g.rotate(jr); jar(g, 0, 0, .5, { fill: .5, slips: 4, seed: 7 }); g.restore();
      } else {
        // 碎玻璃 + 撒开的红豆和纸条（慢动作）
        const u = s - hit, sl = 1 - Math.exp(-u * 2.2);
        for (let i = 0; i < 70; i++) {
          const a = -Math.PI * hash(i, 1), v = 120 + hash(i, 2) * 380;
          const x = 1640 + Math.cos(a) * v * sl * 1.3, y = 820 + Math.sin(a) * v * .35 * sl * (1 - sl) * 3 + sl * 20 * hash(i, 3);
          bean(g, x, Math.min(y, 830 + hash(i, 4) * 60), 7, i + u * 3 * (1 - sl));
        }
        for (let i = 0; i < 12; i++) { const a = -Math.PI * hash(i, 11), v = 80 + hash(i, 12) * 260; g.fillStyle = 'rgba(220,240,250,.7)'; g.save(); g.translate(1640 + Math.cos(a) * v * sl, 840 + hash(i, 13) * 40 - Math.sin(a) * 60 * sl * (1 - sl) * 4); g.rotate(i + u); poly(g, [[0, 0], [16, 4], [6, 14]]); g.fill(); g.restore(); }
        for (let i = 0; i < 4; i++) slipRoll(g, 1640 + (hash(i, 21) - .5) * 300 * sl, 850 + hash(i, 22) * 30, 40, i + u * (1 - sl));
        if (u < .25) glow(g, 1640, 820, 300, '#FFFFFF', 1 - u * 4);
      }
      roomLight(g, 'rain', { lx: 1180, ly: 520 });
    });
  }, { tr: { type: 'fade', dur: .25 }, bloom: .25, grade: 'saturate(.95) contrast(1.05)' });

  // C2f：他跪在地上，一颗一颗捡红豆；捡起一张纸条，摊开——"一起看一场雪"
  scene('C2f', CUT(28), (g, s, k) => {
    camera(g, 1300, 760, 1.8, () => {
      room(g, s, { mood: 'rain', outside: (gg, x, y, w, h) => { gg.fillStyle = '#18203E'; gg.fillRect(x, y, w, h); }, lampOn: .45 });
      for (let i = 0; i < 50; i++) bean(g, 1150 + hash(i, 1) * 600, 905 + hash(i, 2) * 90, 7, i);
      for (let i = 0; i < 8; i++) { g.fillStyle = 'rgba(220,240,250,.6)'; g.save(); g.translate(1200 + hash(i, 3) * 500, 930 + hash(i, 4) * 60); g.rotate(i); poly(g, [[0, 0], [14, 3], [5, 12]]); g.fill(); g.restore(); }
      const pick = Math.max(0, Math.sin(s * 2.6));
      const read = seg(s, Lc(28, 3) - .2, Lc(28, 3) + .6);
      const Ph = { who: 'he', u: 40, x: 1230, y: 1000, f: 1, out: OUTFIT.heHome, pose: read > 0 ? pose('kneel', { tb: 6, hd: 16, aN1: 64, aN2: 40, aF1: 58, aF2: 44 }) : pose('kneel', { tb: 22 + pick * 8, hd: 20, aN1: 40 + pick * 20, aN2: 20, aF1: 50, aF2: 40 }), light: LT.lamp, t: s, eyes: 'down', mouth: 'sad' };
      person(g, Ph);
      const hp = handPos(Ph);
      if (read > 0) slip(g, hp[0] + 6, hp[1] - 24, lerp(60, 150, read), '一起看一场雪', 1, { rot: lerp(.8, -.05, read) });
      roomLight(g, 'rain', { lx: 1180, ly: 520 });
    });
  }, { tr: { type: 'fade', dur: .4 }, bloom: .22, grade: 'saturate(.9)' });

  // C2g：门开了，暖光照进来——她回来了，跪下来握住他的手；红线重新系上，亮起来
  scene('C2g', CUT(29), (g, s, k) => {
    const back = E.out(seg(s, CUT(29), CUT(29) + 1.4)), hold = E.io(seg(s, Lc(29, 4) - .3, Lc(29, 4) + .5));
    camera(g, 1250, 760, 1.7, () => {
      room(g, s, { mood: 'rain', outside: (gg, x, y, w, h) => { gg.fillStyle = '#18203E'; gg.fillRect(x, y, w, h); }, lampOn: .45 });
      // 门里的光
      g.save(); g.globalCompositeOperation = 'screen'; g.fillStyle = `rgba(255,214,150,${.4 * back})`; poly(g, [[1560, 850], [1710, 850], [1500, 1100], [900, 1100]]); g.fill(); g.restore();
      for (let i = 0; i < 40; i++) bean(g, 1150 + hash(i, 1) * 600, 905 + hash(i, 2) * 90, 7, i);
      const Ph = { who: 'he', u: 40, x: 1180, y: 1000, f: 1, out: OUTFIT.heHome, pose: pose('kneel', { tb: 6, hd: lerp(16, 0, hold), aN1: lerp(50, 60, hold), aN2: 30 }), light: { ...LT.lamp, dir: 1, rim: '#FFD39A' }, t: s, eyes: hold > .5 ? 'happy' : 'down', mouth: hold > .5 ? 'smile' : 'flat' };
      const sx = lerp(1640, 1400, back);
      const Ps = { who: 'she', u: 38, x: sx, y: 1000, f: -1, out: OUTFIT.sheTravel, pose: back < 1 ? walkPose(s * 6) : pose('kneel', { tb: 10, hd: 8, aN1: lerp(20, 62, hold), aN2: 20 }), light: { ...LT.lamp, dir: 1, rim: '#FFD39A' }, t: s, eyes: hold > .5 ? 'happy' : 'open', mouth: 'smile', blush: .4 + hold * .6 };
      person(g, Ph); person(g, Ps);
      const a = handPos(Ph), b = handPos(Ps);
      if (hold > 0) { glow(g, (a[0] + b[0]) / 2, (a[1] + b[1]) / 2, 140 * hold, '#FF7070', .5 * hold); redThread(g, [a, [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + 10], b], 3, hold, 1); }
      roomLight(g, 'rain', { lx: 1500, ly: 700 });
    });
  }, { tr: { type: 'fade', dur: .4 }, bloom: .3 });

  // C2h："等到风景都看透"——四处风景，一个字一个地方：海边的灯塔、雪山日出、花田、极光；两个人小小的剪影
  scene('C2h', Lt(30) - .3, (g, s, k) => {
    const cuts = [Lt(30) - .3, Lc(30, 1) - .1, Lc(30, 3) - .1, Lc(30, 5) - .1];
    let i = 0; for (let j = 0; j < 4; j++) if (s >= cuts[j]) i = j;
    const kinds = ['sea', 'snowpeak', 'flowers', 'aurora'], kk = s - cuts[i];
    camera(g, 960 + kk * 30, 540, 1.04 + kk * .03, () => {
      vista(g, s, kinds[i], kk);
      const pos = [[760, 760, '#2A2440'], [960, 852, '#3A3A60'], [1100, 760, '#5A3A60'], [900, 840, '#081020']][i];
      const P1 = { who: 'he', u: 16, x: pos[0], y: pos[1], view: 'back', out: OUTFIT.heTravel, sil: pos[2], pose: { aN1: 18 } };
      const P2 = { who: 'she', u: 16, x: pos[0] - 34, y: pos[1], view: 'back', out: OUTFIT.sheTravel, sil: pos[2], pose: { aF1: 18 } };
      person(g, P1); person(g, P2);
    });
    // 切换时闪一下白
    const f = Math.max(...cuts.slice(1).map(c => Math.exp(-Math.abs(s - c) * 14)));
    g.fillStyle = `rgba(255,250,240,${f * .6})`; g.fillRect(0, 0, W, H);
  }, { tr: { type: 'zoom', dur: .5, flash: .3 }, bloom: .35, grade: 'saturate(1.08)' });

  // C2i：溪边的石头上，看日落；她把头靠在他肩上（长音一直到间奏）
  scene('C2i', CUT(31), (g, s, k) => {
    camera(g, 1180 - k * 20, 640 - k * 8, 1.6 - k * .05, () => {
      streamLand(g, s, { time: 'sunset', sunX: 700, sunY: 560 });
      const rx = STREAM.rockX, ry = STREAM.rockY;
      const lean = E.io(seg(s, Lc(31, 3), Lc(31, 6)));
      const Ph = { who: 'he', u: 30, x: rx + 40, seat: ry - 34, view: 'back', out: OUTFIT.heSummer, pose: { sitF: true, aN1: 14, tilt: lean * .08 }, light: LT.gold, t: s };
      const Ps = { who: 'she', u: 30, x: rx - 30 + lean * 8, seat: ry - 32, view: 'back', out: OUTFIT.sheSummer, pose: { sitF: true, aF1: 14, lean: lean * 6, tilt: lean * .32 }, light: LT.gold, t: s };
      person(g, Ph); person(g, Ps);
    });
  }, { tr: { type: 'leak', dur: .7 }, bloom: .45, grade: 'saturate(1.08)' });

  // ---------- 间奏 ----------
  // X1：春天的院子，两个人把红豆种下去；最后冒出一棵小芽
  scene('X1', 150.0, (g, s, k) => {
    camera(g, 1180, 760, 1.7, () => {
      yard(g, s, { season: .05, grow: seg(s, 154.6, 155.5) * .06, night: 0 });
      const dig = Math.max(0, Math.sin(s * 3));
      const Ph = { who: 'he', u: 36, x: 1060, y: 900, f: 1, out: OUTFIT.heSummer, pose: pose('crouch', { aN1: 50 + dig * 30, aN2: 20 }), light: LT.day, t: s, eyes: 'down', mouth: 'smile' };
      const Ps = { who: 'she', u: 34, x: 1300, y: 900, f: -1, out: OUTFIT.sheSummer, pose: pose('crouch', { aN1: 60, aN2: 10 }), light: LT.day, t: s, eyes: 'down', mouth: 'smile', blush: .6 };
      person(g, Ph); person(g, Ps);
      // 小铲子、土坑、往下掉的红豆
      const hp = handPos(Ph); g.strokeStyle = '#6B5546'; g.lineWidth = 6; g.beginPath(); g.moveTo(hp[0], hp[1]); g.lineTo(hp[0] + 30, hp[1] + 30); g.stroke(); g.fillStyle = '#9A9AA0'; poly(g, [[hp[0] + 26, hp[1] + 26], [hp[0] + 52, hp[1] + 40], [hp[0] + 36, hp[1] + 54]]); g.fill();
      g.fillStyle = '#6E5440'; ell(g, YARD.treeX, 915, 50, 12); g.fill();
      const sp = handPos(Ps);
      for (let i = 0; i < 5; i++) { const u = ((s * 1.3 + i / 5) % 1); if (s < 154) bean(g, lerp(sp[0], YARD.treeX + (i - 2) * 6, u), lerp(sp[1], 912, u * u), 6, i + s); }
      if (s > 154.6) { g.fillStyle = '#6E5440'; ell(g, YARD.treeX, 912, 46, 10); g.fill(); }
    });
  }, { tr: { type: 'fade', dur: 1.0 }, bloom: .3 });

  // X2：同一个院子，时间飞快地过——日夜、四季转了好几圈，红豆树一年年长大，两个人在树下慢慢变老
  scene('X2', 155.5, (g, s, k) => {
    const T = clamp(k / 9.9), years = T * 2.4;
    const season = (.05 + years) % 1, night = Math.pow(Math.max(0, Math.sin(k * 5.5)), 3) * .85;
    const age = clamp(T * .55);
    camera(g, 1000, 560, 1.08, () => {
      yard(g, s, { season, grow: lerp(.06, .85, E.out(T)), night, houseLit: night });
      // 每一年在院子里的一个小片段（几个人的位置轮换）
      const idx = Math.floor(years * 4) % 4, alpha = 1 - night * .8;
      const spots = [
        [{ who: 'he', x: 1060, f: 1, pose: pose('stand', { aN1: 40 }) }, { who: 'she', x: 1300, f: -1, pose: pose('stand', { aN1: 40 }) }],
        [{ who: 'he', x: 1120, seat: 860, f: 1, pose: POSE.sitFloor }, { who: 'she', x: 1240, seat: 860, f: -1, pose: POSE.sitFloor }],
        [{ who: 'he', x: 820, f: 1, pose: walkPose(s * 6) }, { who: 'she', x: 760, f: 1, pose: walkPose(s * 6 + 3) }],
        [{ who: 'she', x: 1380, f: -1, pose: pose('reach', { aN1: 150, aN2: 0 }) }, { who: 'he', x: 1460, f: -1, pose: pose('stand', { aN1: 30 }) }],
      ][idx];
      for (const p of spots) person(g, Object.assign({ u: 26, y: 860, out: OUTFIT[p.who + (season > .55 && season < .95 ? 'Winter' : 'Summer')], age, light: LT.day, t: s, alpha, eyes: 'happy' }, p));
    });
    // 一年一年的数字（很淡）
    text(g, ['一', '二', '三', '五', '八', '十二', '二十', '三十'][Math.min(7, Math.floor(T * 8))] + ' 年', 1700, 160, 34, { k: 'serif', col: 'rgba(255,255,255,.5)', shadow: 'rgba(0,0,0,.3)', ls: 4 });
  }, { tr: { type: 'fade', dur: .5 }, bloom: .3 });

  // X3：屋里的墙上，照片一张张多起来（都是前面的日子）；窗台上的罐子又装满了纸条
  scene('X3', 165.4, (g, s, k) => {
    const pan = k * 30;
    camera(g, 1000 + pan, 470, 1.25, () => {
      const photos = MEMORIES.slice(0, 7).map(([id, at], i) => ({ x: 700 + (i % 4) * 300 + (i >= 4 ? 150 : 0), y: 230 + Math.floor(i / 4) * 230, w: 230, h: 130, img: seg(k, i * .65, i * .65 + .3) > 0 ? snap(id, at) : null, rot: (hash(i, 5) - .5) * .08 }));
      room(g, s, { mood: 'evening', shelf: false, lamp: false, window: false });
      photos.forEach((p, i) => { const a = E.back(seg(k, i * .65, i * .65 + .35)); if (a > 0) { g.save(); g.translate(p.x, p.y); g.scale(a, a); g.translate(-p.x, -p.y); photoFrame(g, p.x, p.y, p.w, p.h, p.img, { rot: p.rot }); g.restore(); } });
      // 窗台上的新罐子：纸条越插越多
      g.fillStyle = '#B48E72'; g.fillRect(380, 650, 360, 18);
      jar(g, 560, 650, .75, { fill: .3, slips: 2 + Math.floor(k * 1.6), seed: 17, seed2: 5 });
    });
    roomLight(g, 'evening', { lx: 900, ly: 400 });
  }, { tr: { type: 'iris', dur: .7, cx: 1180, cy: 500 }, bloom: .3, grade: 'sepia(.12) saturate(1.02)' });

  // X4：老了——两个人坐在大红豆树下，天慢慢黑了，萤火虫亮起来
  scene('X4', 171.0, (g, s, k) => {
    const dusk = clamp(k / 5.0);
    camera(g, 1150, 620, 1.35, () => {
      yard(g, s, { season: .42, grow: 1, night: dusk * .85, houseLit: dusk, pods: true });
      bench(g, 1180, 900, 300, .9, '#7A5A44');
      const Ph = { who: 'he', u: 30, x: 1225, seat: 840, view: 'front', out: OUTFIT.heOld, age: 1, pose: { sitF: true, aN1: 10, aN2: 30, tilt: .06 }, light: { dir: -1, shade: .2, amb: '#3A3A6A', ambA: .25 + dusk * .3, rim: '#FFC890', rimA: .6 }, t: s, eyes: 'happy' };
      const Ps = { who: 'she', u: 29, x: 1140, seat: 840, view: 'front', out: OUTFIT.sheOld, age: 1, pose: { sitF: true, aN1: 10, aN2: 30, lean: 5, tilt: .25 }, light: { dir: -1, shade: .2, amb: '#3A3A6A', ambA: .25 + dusk * .3, rim: '#FFC890', rimA: .6 }, t: s, eyes: 'closed', mouth: 'smile' };
      person(g, Ps); person(g, Ph);
      for (const p of floaters(s, 141, 26, [700, 500, 1700, 900], { vy: 12, amp: 40, wob: .5 })) glow(g, p.x, p.y, 16, '#E8FF9A', dusk * p.tw * .8);
    });
    // 音乐快停了：画面也跟着暗下来
    const dim = seg(s, 175.0, 176.3); g.fillStyle = `rgba(4,4,10,${dim * .55})`; g.fillRect(0, 0, W, H);
  }, { tr: { type: 'fade', dur: 1.0 }, bloom: .35 });
});
