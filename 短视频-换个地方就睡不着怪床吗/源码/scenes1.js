'use strict';
/* scenes1.js：共用的小工具；开头（夜里的酒店房间，"你"睡不着："换个地方就睡不着，怪床吗？" → "对，我认床！" → 盖章"左脑在站岗"，
   头顶的泡泡里左脑有个小人拿着手电筒站岗 → 睡眠实验室：第一晚 → 脑电屏幕特写：左脑睡得浅；"嘀、嘀、嘀……嘟！"左脑一亮，人醒了 →
   一周后再来：撤岗 → "它为什么要站岗？答案在鸭子身上"）；封面。
   前 20 秒切 4 次镜头：暗紫的房间 → 深蓝的实验室 → 亮的脑电屏幕 → 日历一翻、实验室 → 深色的"为什么"。 */

/* ================= 共用 ================= */
function popTag(g, t, t0, x, y, s, px = 36, o = {}) {
  const p = pop(t, t0, .3) * (o.t1 ? clamp((o.t1 - t) / .2) : 1);
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p); ptag(g, 0, 0, s, px, o); g.restore();
}
function popText(g, t, t0, t1, s, x, y, px, col, o = {}) {
  const p = pop(t, t0, .3) * clamp((t1 - t) / .2);
  if (p <= 0) return;
  g.save(); g.translate(x, y); g.scale(p, p);
  ptext(g, s, 0, px * .35, px, col, { align: 'center', ol: o.ol || C.ink, olw: o.olw || 6, sh: 1 });
  g.restore();
}
function source(g, s, x, y, o = {}) { ptext(g, s, x, y, o.px || 22, o.col || '#8A80B0', { align: o.align || 'right' }); }
const PORTRAIT = {
  you: portraitClawd({ scarf: true }),
  youTired: portraitClawd({ scarf: true, hat: 'night', eyes: 'tired' }),
  youShock: portraitClawd({ scarf: true, hat: 'night', eyes: 'wide', mouth: 'o' }),
  youHappy: portraitClawd({ scarf: true, hat: 'night', eyes: 'happy', mouth: 'smile' }),
  youExam: portraitClawd({ scarf: true, eyes: 'wide', mouth: 'o' }),
};
/* 盖章，下面垫一块白底 */
function bigStamp(g, t, t0, x, y, s, o = {}) {
  if (t < t0) return;
  const p = clamp((t - t0) / .25), px = o.px || 84, w = pw(g, s, px) + px * 1.4, h = px * 2;
  g.save(); g.translate(x, y); g.rotate(o.rot ?? -.08); g.globalAlpha *= clamp(p * 3); g.fillStyle = 'rgba(255,255,255,.92)'; g.fillRect(-w / 2, -h / 2, w, h); g.restore();
  stamp(g, x, y, s, p, { px, rot: o.rot ?? -.08, col: o.col });
}
/* 放射的光芒 + 一圈火花（盖章那一下） */
function sparkBurst(g, x, y, t, t0, o = {}) {
  const u = t - t0; if (u < 0 || u > .8) return;
  const n = o.n || 14, r0 = (o.r || 160) * E.out(clamp(u / .5));
  for (let i = 0; i < n; i++) {
    const a = i * TAU / n + t0, r = r0 * (.7 + .3 * hash(i, 3));
    g.fillStyle = `rgba(255,${200 + Math.round(hash(i, 5) * 55)},120,${1 - u / .8})`;
    g.fillRect(Math.round((x + Math.cos(a) * r) / 5) * 5, Math.round((y + Math.sin(a) * r) / 5) * 5, 10, 10);
  }
}
/* 大标题：两行，按整像素上下跳，不缩放、不转（像素字一缩放、一转，描边就碎了） */
function titleBlock(g, t, y0 = 250) {
  const bob = Math.round(Math.sin(t * 4)) * 6;
  g.save(); g.translate(480, y0 + bob);
  ptext(g, '换个地方就睡不着', 0, 24, 72, C.white, { align: 'center', ol: C.ink, olw: 6, sh: 1 });
  ptext(g, '怪床吗？', 0, 160, 120, C.amber, { align: 'center', ol: C.ink, olw: 10, sh: 1 });
  g.restore();
}
/* 酒店房间里的"你"和床（不含盖章、泡泡）；o.light 早上；o.you 小怪的选项；o.toss 翻来覆去 */
function roomScene(g, t, o = {}) {
  const light = o.light || 0, name = light ? 'roomDay' : 'room';
  const b = pbuf(name, 216, 384); roomBG(b, t, light); blit(g, name, 5);
  if (light) glow(g, 300, 640, 520, 'rgba(255,236,190,.35)');
  bedClock(g, t, light ? '07:30' : '02:13');
  duckAt(g, 245, 852, 4, o.duckEyes || (Math.floor(t * .6) % 4 === 3 ? 'cc' : 'oc'), { rubber: true });   // 床头上的小黄鸭：睁着一只眼（伏笔）
  roomPillow(g, light);
  const toss = o.toss ? Math.sin(t * 2.2) : 0, dx = Math.round(toss * 2) * 15;
  crabAt(g, 480 + dx, 1260, 15, youO(t, Object.assign({ hat: 'night' }, o.you || {})), toss < -.3);
  roomBlanket(g, t, light, 1135, { bump: dx });
  const lit = light ? 0 : clamp(1 - Math.abs(((t + .8) % 5.5) - .8) / .8);
  bedPhone(g, t, 700, 1180, lit);
}

/* ================= 开头 ================= */
function hook(g, t) {
  if (window.COVER) { coverArt(g, t); return; }
  if (t < S('h3') - .12) { hookRoom(g, t); return; }
  if (t < CH('h3', 2) - .15) { hookLab(g, t); return; }
  if (t < S('h4') - .12) { hookMonitor(g, t); return; }
  if (t < S('h5') - .12) { hookWeek(g, t); return; }
  hookAsk(g, t);
}
/* 1. 夜里的酒店房间："你"翻来覆去；"对，我认床！"；盖章"左脑在站岗"，头顶的泡泡里左脑有个小人拿着手电筒站岗 */
function hookRoom(g, t, cover = false) {
  const ts = S('h2') - .12;
  roomScene(g, t, { toss: !cover && t < ts, you: t > ts || cover ? { eyes: 'wide', mouth: 'o' } : { eyes: 'tired' } });
  titleBlock(g, t);
  if (!cover) dialogBox(g, t, 'd1', PORTRAIT.youTired);
  if (t > ts + .15 || cover) brainBubble(g, t, 730, 760, 160, { p: cover ? 1 : pop(t, ts + .15, .35), left: 'awake', right: 'asleep', sentry: 'watch', tx: 600, ty: 960 });
  if (t > ts || cover) {
    if (!cover) sparkBurst(g, 440, 600, t, ts, { r: 270 });
    bigStamp(g, cover ? 1 : t, cover ? 0 : ts, 440, 600, '左脑在站岗', { px: 72 });
  }
}
/* 2. 睡眠实验室：第一晚，小怪戴着脑电帽睡着；导线连到设备架 */
function hookLab(g, t) {
  const b = pbuf('lab', 216, 384); labBG(b, t); blit(g, 'lab', 5);
  ptext(g, '睡眠实验室', 750, 345, 24, C.ink, { align: 'center' });
  labBed(g, t, { eyes: 'shut' });
  const z = (t * .8) % 1; ptext(g, 'z', 610 + z * 40, 980 - z * 90, 48, `rgba(255,255,255,${1 - z})`, { ol: C.ink, olw: 4 });
  popTag(g, t, S('h3') - .05, 480, 520, '第 1 晚：头一回来', 44, { fill: C.gold });
  popTag(g, t, CH('h3', 1) - .2, 300, 660, '脑电帽', 32, { fill: '#B8E6FF' });
  source(g, '出处：Tamaki 等，2016，Current Biology（35 名年轻人）', 880, 1230);
}
/* 3. 脑电屏幕特写（亮）：左脑波小（浅睡）、右脑波大（深睡）；"嘀、嘀、嘀……嘟！"左脑一亮、波形猛跳，画面停住；
   下面一直开着摄像头小窗：小怪睡着 →（"你也醒得更快"）醒了 */
const ODD = () => { const b0 = EN('h3') + .08; return { b0, beeps: [b0, b0 + .25, b0 + .5], dev: b0 + .7 }; };   // audio.py 用同一组时刻
function hookMonitor(g, t) {
  g.fillStyle = '#E9F0F2'; g.fillRect(0, 0, W, H);
  g.fillStyle = '#D6E1E5'; for (let x = 0; x < W; x += 40) g.fillRect(x, 0, 2, H); for (let y = 0; y < H; y += 40) g.fillRect(0, y, W, 2);
  g.fillStyle = '#20343E'; g.fillRect(0, 210, W, 84); ptext(g, '脑电 · 第 1 晚 · 深睡阶段', 70, 268, 36, '#FFFFFF');
  g.fillStyle = Math.floor(t * 2) % 2 ? '#FF5A4F' : '#7A2A2A'; g.fillRect(860, 238, 24, 24);
  const { b0, beeps, dev } = ODD(), frz = dev + 1.1, tt = Math.min(t, frz);
  const flash = t > dev && t < dev + .9;
  brainIcon(g, t, 190, 500, 8, { left: flash ? 'flash' : 'awake', right: 'asleep' });
  const panel = (y, lab, col, amp, f, burstAmp) => {
    g.fillStyle = '#FFFFFF'; g.fillRect(340, y, 560, 180); g.fillStyle = '#C9D6DC'; g.fillRect(340, y + 98, 560, 4);
    ptext(g, lab, 356, y + 40, 32, col);
    eegTrace(g, tt, 360, y + 110, 520, amp, f, col, { burst: dev + .05, burstAmp });
  };
  panel(330, '左脑：睡得浅', '#E0861A', 14, 2.6, 52);
  panel(540, '右脑：睡得沉', '#2F6FC1', 46, 1.1, 8);
  // 喇叭和"嘀、嘀、嘀……嘟！"
  g.fillStyle = '#20343E'; g.fillRect(70, 760, 120, 110); pixOval(g, 130, 815, 34, 34, 6, '#5E7C8A'); pixOval(g, 130, 815, 14, 14, 6, '#20343E');
  ptext(g, '实验里放的声音', 130, 900, 24, '#4A6470', { align: 'center' });
  [...beeps.map(x => [x, '嘀']), [dev, '嘟！']].forEach(([tb, s], i) => {
    if (t < tb) return;
    const u = clamp((t - tb) / .25);
    ptext(g, s, 270 + i * 100, 838, i === 3 ? 72 : 52, i === 3 ? '#FF4B3E' : '#20343E', { align: 'center', ol: '#FFFFFF', olw: 6 });
    if (u < 1) { g.strokeStyle = `rgba(32,52,62,${1 - u})`; g.lineWidth = 6; g.beginPath(); g.arc(130, 815, 50 + u * 40, -.6, .6); g.stroke(); }
  });
  if (t > dev) {
    const p = pop(t, dev + .05, .3);
    withAlpha(g, clamp(p), () => { g.strokeStyle = '#FF4B3E'; g.lineWidth = 8; g.strokeRect(690, 340, 200, 160); });
    popTag(g, t, CH('h3b', 0) - .1, 790, 760, '怪声！', 40, { fill: '#FF8A7A' });
    popTag(g, t, CH('h3b', 1) - .15, 720, 528, '左脑：反应大得多', 36, { fill: C.gold });
  }
  // 摄像头小窗
  const wake = t > CH('h3b', 2) - .3;
  pbox(g, 340, 930, 560, 270, { k: 6, fill: '#16222F' });
  g.fillStyle = '#C9D3E0'; g.fillRect(470, 1030, 200, 50);
  crabAt(g, 570, 1160, 8, youO(t, wake ? { eyes: 'wide', mouth: 'o' } : { eyes: 'shut' }));
  g.fillStyle = '#6E86A8'; g.fillRect(420, 1090, 300, 104); g.fillStyle = '#E8ECF2'; g.fillRect(420, 1086, 300, 16);
  g.fillStyle = Math.floor(t * 1.5) % 2 ? '#FF5A4F' : '#5A2020'; g.fillRect(366, 956, 14, 14); ptext(g, '摄像头', 392, 972, 24, '#9FB2CC');
  if (!wake) { const z = (t * .8) % 1; ptext(g, 'z', 650 + z * 30, 1040 - z * 50, 40, `rgba(255,255,255,${1 - z})`, { ol: C.ink, olw: 4 }); }
  else { const p = pop(t, CH('h3b', 2) - .3, .3); g.save(); g.translate(790, 1040); g.scale(p, p); ptext(g, '醒了！', 0, 20, 56, C.gold, { align: 'center', ol: C.ink, olw: 6 }); g.restore(); }
  source(g, '出处：Tamaki 等，2016，Current Biology（35 名年轻人）', 880, 1238, { col: '#6A7A90' });
}
/* 4. 一周后再来：日历一翻（亮），回到实验室：两边都睡沉了，泡泡里的小人戴上睡帽躺下（撤岗） */
function hookWeek(g, t) {
  const t0 = S('h4') - .12;
  if (t < t0 + .55) {
    g.fillStyle = '#FBF6EA'; g.fillRect(0, 0, W, H);
    const u = clamp((t - t0) / .55);
    g.fillStyle = '#E5322D'; g.fillRect(240, 520, 600, 120); ptext(g, '日历', 540, 600, 48, C.white, { align: 'center' });
    g.fillStyle = '#FFFFFF'; g.fillRect(240, 640, 600, 520); g.strokeStyle = C.ink; g.lineWidth = 6; g.strokeRect(240, 520, 600, 640);
    ptext(g, '7 天后', 540, 950, 120, C.ink, { align: 'center' });
    if (u < .6) { g.fillStyle = '#FFFFFF'; const h = 520 * (1 - u / .6); g.fillRect(240, 640, 600, h); g.fillStyle = '#E8E0D0'; g.fillRect(240, 640 + h - 8, 600, 8); }
    return;
  }
  const b = pbuf('lab', 216, 384); labBG(b, t); blit(g, 'lab', 5);
  ptext(g, '睡眠实验室', 750, 345, 24, C.ink, { align: 'center' });
  labBed(g, t, { eyes: 'shut', mouth: 'smile' });
  const z = (t * .8) % 1; ptext(g, 'Z', 610 + z * 40, 980 - z * 90, 64, `rgba(255,255,255,${1 - z})`, { ol: C.ink, olw: 6 });
  popTag(g, t, t0 + .6, 480, 470, '一周后：第 2 次', 44, { fill: C.gold });
  const off = t > CH('h4', 1) - .1;
  brainBubble(g, t, 640, 760, 140, { p: pop(t, t0 + .7, .3), left: off ? 'asleep' : 'awake', right: 'asleep', sentry: off ? 'off' : 'salute', tx: 520, ty: 990 });
  if (off) popTag(g, t, CH('h4', 1) - .1, 640, 600, '撤岗', 48, { fill: '#B8F0C8' });
}
/* 5. "它为什么要站岗？"：深色背景上一个大脑，小人举着手电筒、头上一个问号；"答案在鸭子身上"——小黄鸭蹦出来，眨了一下眼 */
function hookAsk(g, t) {
  roomScene(g, t, { you: { eyes: 'up' } });
  g.fillStyle = 'rgba(12,10,30,.62)'; g.fillRect(0, 0, W, H);
  const t0 = S('h5') - .12;
  brainBubble(g, t, 480, 820, 220, { p: pop(t, t0, .3), left: 'awake', right: 'asleep', sentry: 'watch', zzz: true });
  if (t > t0 + .3) { const u = Math.round(Math.sin(t * 5) * 2) * 5; ptext(g, '?', 640, 600 + u, 160, C.gold, { align: 'center', ol: C.ink, olw: 10 }); }
  if (t > CH('h5', 2) - .25) {
    const p = pop(t, CH('h5', 2) - .25, .35);
    g.save(); g.translate(760, 1150); g.scale(p, p); duckAt(g, 0, 0, 7, (t % 1.4) < .2 ? 'cc' : 'oc', { rubber: true }); g.restore();
    popTag(g, t, CH('h5', 2) - .05, 300, 1120, '答案在这儿', 40, { fill: C.gold });
  }
}

/* ================= 封面（不带字幕）：单独构图——标题、红章、中间一个大泡泡（左脑里的小人拿着手电筒站岗），下面床上睁大眼的"你" ================= */
function coverArt(g, t) {
  const T = 2.0, b = pbuf('room', 216, 384); roomBG(b, T, 0); blit(g, 'room', 5);
  bedClock(g, T);
  duckAt(g, 245, 852, 4, 'oc', { rubber: true });
  g.fillStyle = '#D8D6E6'; g.fillRect(230, 1290, 500, 130); g.fillStyle = '#B9B6CC'; g.fillRect(230, 1400, 500, 20);
  crabAt(g, 480, 1600, 18, youO(T, { hat: 'night', eyes: 'wide', mouth: 'o' }));
  roomBlanket(g, T, 0, 1460);
  bedPhone(g, T, 610, 1560, 1);
  titleBlock(g, T);
  bigStamp(g, 1, 0, 470, 540, '左脑在站岗', { px: 72 });
  brainBubble(g, T, 530, 850, 210, { left: 'awake', right: 'asleep', sentry: 'watch', beam: Math.PI * 1.12, tx: 470, ty: 1190 });
}
