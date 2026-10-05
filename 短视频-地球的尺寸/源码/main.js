/* 《地球的尺寸》总装：年份与文献的关键帧、幕间溶解转场、逐帧入口 frame(t)。 */
const SC = document.createElement('canvas'); SC.width = W; SC.height = H;
const SG = SC.getContext('2d');

HEADER = [
  { t: SCN.era1.t0 + 0.5, pre: '公元前', year: '240', place: '亚历山大 · 埃拉托色尼' },
  { t: SCN.era2.t0 + 0.4, pre: '公元', year: '724', place: '唐 · 河南 · 一行 × 南宫说' },
  { t: SCN.era3.t0 + 0.4, pre: '', year: '1615', place: '荷兰 · 斯涅尔' },
  { t: T('s7') - 0.2, pre: '', year: '1669', place: '巴黎 · 皮卡尔' },
  { t: SCN.era4.t0 + 0.4, pre: '', year: '1736', place: '巴黎 · 法国科学院' },
  { t: SCN.era5.t0 + 0.4, pre: '', year: '1789', place: '巴黎 · 大革命' },
  { t: T('m4') - 0.2, pre: '', year: '1792', place: '敦刻尔克 ⇄ 巴塞罗那 · 德朗布尔 × 梅尚' },
  { t: T('m5') + 1.6, pre: '', year: '1798', place: '敦刻尔克 ⇄ 巴塞罗那 · 德朗布尔 × 梅尚' },
  { t: T('m6') - 0.2, pre: '', year: '1799', place: '巴黎 · 国家档案馆' },
  { t: SCN.end.t0 + 0.4, pre: '', year: '1983', place: '巴黎 · 第 17 届国际计量大会' },
  { t: T('z2') - 0.4, pre: '', year: null, place: '' },
];
CITES = [
  { t0: T('e1') + 1.2, t1: SCN.era1.t1 - 0.6, lat: 'De motu circulari corporum caelestium', zh: '《天体的圆周运动》', by: '克莱奥梅德斯 转述 · 原书已失传' },
  { t0: T('t3') + 0.4, t1: SCN.era2.t1 - 0.6, lat: 'Xin Tang Shu · Tianwen Zhi', zh: '《新唐书·天文志》', by: '北宋 · 欧阳修 等 · 1060' },
  { t0: T('s5') + 0.2, t1: T('s7') - 0.3, lat: 'Eratosthenes Batavus', zh: '《荷兰的埃拉托色尼》', by: '斯涅尔 · 莱顿 · 1617' },
  { t0: T('s7') + 0.6, t1: SCN.era3.t1 - 0.6, lat: 'Mesure de la Terre', zh: '《地球的测量》', by: '皮卡尔 · 巴黎 · 1671' },
  { t0: T('p2') + 0.3, t1: TE('p4') - 0.2, lat: 'Philosophiæ Naturalis Principia Mathematica', zh: '《自然哲学的数学原理》', by: '牛顿 · 伦敦 · 1687' },
  { t0: T('p9') + 0.2, t1: SCN.era4.t1 - 0.6, lat: 'La Figure de la Terre', zh: '《地球的形状》', by: '莫佩尔蒂 · 巴黎 · 1738' },
  { t0: T('m6') + 0.6, t1: SCN.era5.t1 - 0.6, lat: 'Base du système métrique décimal', zh: '《米制的基础》', by: '德朗布尔 · 巴黎 · 1806—1810' },
  { t0: T('z1') + 0.4, t1: TE('z1') + 0.2, lat: '17e Conférence générale des poids et mesures', zh: '《第 17 届国际计量大会 · 决议 1》', by: '巴黎 · 1983' },
];

const SCENES = {};   // 由 scenes*.js 填入：name -> function(t)
let SHAKE = [];      // [{t, amp}] 盖章时的轻微震动

const XF = 0.45;     // 幕间溶解的半宽
function mixTint(a, b, u) { return a.map((v, i) => lerp(v, b[i], u)); }

function drawScene(name, t, alpha) {
  if (alpha <= 0.003 || !SCENES[name]) return;
  SG.setTransform(1, 0, 0, 1, 0, 0);
  SG.clearRect(0, 0, W, H);
  g = SG;
  SCENES[name](t);
  g = MAIN;
  MAIN.save(); MAIN.globalAlpha = alpha; MAIN.drawImage(SC, 0, 0); MAIN.restore();
}

window.frame = function (t) {
  g = MAIN;
  MAIN.setTransform(1, 0, 0, 1, 0, 0);
  const sc = TL.scenes;
  let i = sc.findIndex(s => t >= s.t0 && t < s.t1);
  if (i < 0) i = t < 0 ? 0 : sc.length - 1;
  const cur = sc[i];
  // 溶解：靠近幕首时与上一幕混合，靠近幕尾时与下一幕混合
  let a = null, b = null, u = 0;
  if (i > 0 && t < cur.t0 + XF) { a = sc[i - 1]; b = cur; u = seg(t, cur.t0 - XF, cur.t0 + XF); }
  else if (i < sc.length - 1 && t > cur.t1 - XF) { a = cur; b = sc[i + 1]; u = seg(t, cur.t1 - XF, cur.t1 + XF); }
  const tint = a ? mixTint(TINTS[a.name], TINTS[b.name], E.sine(u)) : TINTS[cur.name];
  background(t, tint);
  // 震动
  let sx = 0, sy = 0;
  for (const s of SHAKE) {
    const d = t - s.t;
    if (d >= 0 && d < 0.5) { const k = s.amp * Math.exp(-d * 9); sx += Math.sin(d * 90) * k; sy += Math.cos(d * 77) * k; }
  }
  MAIN.save(); MAIN.translate(sx, sy);
  if (a) { drawScene(a.name, t, 1 - E.sine(u)); drawScene(b.name, t, E.sine(u)); }
  else drawScene(cur.name, t, 1);
  MAIN.restore();
  drawHeader(t);
  drawCite(t);
  vignetteAndGrain(t);
  window.subShade(t);
  window.drawSubs(t);
  const wmA = 1 - seg(t, TL.duration - 1.5, TL.duration - 0.2);
  watermark(t, wmA * E.sine(seg(t, 0.6, 2.0)));
  // 片头片尾黑场
  const fin = E.sine(seg(t, 0, 1.0)), fout = 1 - E.sine(seg(t, TL.duration - 1.4, TL.duration - 0.1));
  const k = Math.min(fin, fout);
  if (k < 1) { MAIN.fillStyle = `rgba(0,0,0,${1 - k})`; MAIN.fillRect(0, 0, W, H); }
};
window.subShade = subShade;
window.drawSubs = drawSubs;

Promise.all([
  'NSerifB', 'NSerifK', 'NSerifM', 'Corm', 'CormI', 'Cinzel',
].map(f => document.fonts.load(`${f === 'CormI' ? 'italic ' : ''}40px ${f}`, '地球ABC123'))).then(() => {
  window.frame(0);
  window.READY = true;
});
