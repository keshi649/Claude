'use strict';
/* main.js：镜头表、转场、遮幅和片头字幕。frame(T) 的 T 是成片时间，歌曲时间 t = T - PRE。 */
const PRE = 2.0;          // 歌曲开始前的 2 秒（桌面、环境声）
const END_S = 261.6;      // 成片在歌曲时间 261.6 秒结束（歌曲 259.3 秒淡完）

/* 镜头：[开始, 结束, 函数, 转场]。转场 { k: 'fade' | 'black' | 'cut', d: 秒 }，作用在镜头开头 */
const SHOTS = [];
function shot(a, b, fn, tr = { k: 'cut' }) { SHOTS.push({ a, b, fn, tr }); }

const xa = mk(VW, VH), xag = xa.getContext('2d');
function drawShot(s, t, T) {
  vg.save(); vg.setTransform(1, 0, 0, 1, 0, 0); vg.globalAlpha = 1; vg.globalCompositeOperation = 'source-over';
  vg.fillStyle = '#000'; vg.fillRect(0, 0, VW, VH); vg.restore();
  s.fn(t, T, t - s.a);
}

window.frame = T => {
  const t = T - PRE;
  let i = SHOTS.findIndex(s => t >= s.a && t < s.b);
  if (i < 0) i = t < SHOTS[0].a ? 0 : SHOTS.length - 1;
  const s = SHOTS[i];
  drawShot(s, t, T);
  // 转场：在本镜头开头 d 秒内，和上一个镜头混合
  const tr = s.tr, prev = SHOTS[i - 1];
  if (prev && tr.k !== 'cut' && t < s.a + tr.d) {
    const u = clamp((t - s.a) / tr.d);
    xag.clearRect(0, 0, VW, VH); xag.drawImage(view, 0, 0);
    drawShot(prev, t, T);
    if (tr.k === 'fade') {
      vg.save(); vg.globalAlpha = E.sine(u); vg.drawImage(xa, 0, 0); vg.restore();
    } else if (tr.k === 'black') {
      if (u < .5) { vg.save(); vg.fillStyle = `rgba(0,0,0,${E.sine(u * 2)})`; vg.fillRect(0, 0, VW, VH); vg.restore(); }
      else { vg.save(); vg.drawImage(xa, 0, 0); vg.fillStyle = `rgba(0,0,0,${E.sine((1 - u) * 2)})`; vg.fillRect(0, 0, VW, VH); vg.restore(); }
    }
  }
  grain(T, .065);
  // 开头淡入、结尾淡出
  const fa = Math.max(1 - clamp((T - .1) / 1.2), clamp((t - (END_S - 2.2)) / 2.0));
  if (fa > 0) { vg.save(); vg.fillStyle = `rgba(0,0,0,${fa})`; vg.fillRect(0, 0, VW, VH); vg.restore(); }
  ctx.fillStyle = '#000'; ctx.fillRect(0, 0, W, H);
  ctx.drawImage(view, 0, LB);
  credits(t);
};

/* 下方黑边里的字幕：词曲 / 编曲 / 年份（学原片的做法） */
function credits(t) {
  const a = win(t, -1.2, 5.6, .8, .8);
  if (a <= 0) return;
  ctx.save(); ctx.globalAlpha = a; ctx.fillStyle = '#f2ede4';
  ctx.font = '30px "SerifSC"'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  if (ctx.letterSpacing !== undefined) ctx.letterSpacing = '8px';
  ctx.fillText('词曲  陈绮贞   ·   编曲  钟成虎   ·   2002', W / 2, H - LB / 2);
  ctx.restore();
}

/* ---------------- 镜头表 ---------------- */
shot(-PRE, 13.45, shotTitle);
shot(13.45, 20.45, shotRoomL1, { k: 'fade', d: .8 });
shot(20.45, 27.7, shotRoomL2, { k: 'fade', d: .5 });
shot(27.7, 33.5, shotXray, { k: 'black', d: .6 });
shot(33.5, 39.4, shotStreet, { k: 'fade', d: .5 });
shot(39.4, 53.25, shotClaw, { k: 'fade', d: .5 });
shot(53.25, 60.5, shotStore, { k: 'cut' });
shot(60.5, 71.6, shotSillDusk, { k: 'fade', d: .6 });
shot(71.6, 79.2, phoneShot, { k: 'fade', d: .6 });
shot(79.2, 101.5, shotStairs, { k: 'cut' });
shot(101.5, 122.3, shotBusStop, { k: 'black', d: .6 });
shot(122.3, 129.0, shotSillRain, { k: 'fade', d: .6 });
shot(129.0, 140.0, shotSleep, { k: 'fade', d: .8 });
shot(140.0, 149.0, shotBoard, { k: 'fade', d: .8 });
shot(149.0, 156.0, shotClimb, { k: 'fade', d: .6 });
shot(156.0, 196.2, shotRoof, { k: 'fade', d: .8 });
shot(196.2, 202.7, shotDawnNotes, { k: 'black', d: 1.0 });
shot(202.7, 216.9, shotDawnTalk, { k: 'fade', d: .5 });
shot(216.9, 231.4, shotSillMorning, { k: 'fade', d: .6 });
shot(231.4, 238.6, shotGive, { k: 'fade', d: .5 });
shot(238.6, END_S + 1, shotFinal, { k: 'fade', d: .8 });

(async () => {
  await document.fonts.load('12px FP12', '太聪明'); await document.fonts.load('10px FP10', '太聪明'); await document.fonts.load('30px SerifSC', '词曲陈绮贞');
  // 预热：把所有歌词的字形先画一遍
  const all = new Set(LYR.map(l => l.text).join('') + '太聪明陈绮贞版横竖提示一个谜我是什么反义词再早点睡');
  for (const ch of all) { glyph(ch, 12); glyph(ch, 10); }
  window.READY = true;
})();
