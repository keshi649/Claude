// 场景编排：每个时刻用哪个镜头、镜头之间怎么转；每帧把字幕、标注、水印叠上去。
// 时间全部从 timeline.js（narration.py 按配音生成）来，改了配音，画面自动跟着挪。
// 转场 kind：0 叠化，1 白闪，2 经过黑；不写 trans 就是硬切。
const EDL = [
  { shot: 'collapse', t0: 0, t1: S('h2') },
  { shot: 'orbit', t0: S('h2'), t1: S('h3') - .1 },
  { shot: 'beach', t0: S('h3') - .1, t1: SS('light') },
  { shot: 'sunUp', t0: SS('light'), t1: SS('front') },
  { shot: 'front', t0: SS('front'), t1: SE('front'), trans: { kind: 0, d: .35 } },
  { shot: 'zeroSea', t0: SE('front'), t1: S('k3') - .25 },
  { shot: 'starSea', t0: S('k3') - .25, t1: SS('cold') },
  { shot: 'freeze', t0: SS('cold'), t1: SS('vent'), trans: { kind: 2, d: .5 } },
  { shot: 'vent', t0: SS('vent'), t1: SS('twist'), trans: { kind: 2, d: .5 } },
  { shot: 'realSun', t0: SS('twist'), t1: SS('card'), trans: { kind: 1, d: .6 } },
  { shot: 'sunrise', t0: SS('card'), t1: SS('end'), trans: { kind: 0, d: .6 } },
  { shot: 'endCard', t0: SS('end'), t1: DUR + 5, trans: { kind: 0, d: .6 } },
];

const EXTRA_TEXT = '如果太阳变成黑洞第二集 WHAT IF 0123456789:·阳光还剩不会。地球照样绕着它转黑洞水星金星示意：距离和大小不按比例光走 1 个天文单位约 500 秒' +
  '第 7 天 1 年 °C −－一周一年后零下深海热泉管虫白矮星太阳太轻了要重约 20 倍才行 NASA 估算出处甜菜出品画面字幕音效：Claude 用代码生成·配音：CosyVoice 3 合成《如果……会怎样》系列' +
  '★①②③④如果只剩 8 分 20 秒的阳光你想去哪儿评论区告诉我你晒到的每一缕阳光都是前出发的晒太阳';
async function loadFonts() {
  const all = TL.lines.map((l) => l.text + (l.chunks || []).map((c) => c[1]).join('')).join('') + EXTRA_TEXT;
  const fonts = ['300', '400', '500', '600', '700'].map((w) => `${w} 40px ${SERIF}`).concat([`500 40px ${LATIN}`, `600 40px ${LATIN}`]);
  await Promise.all(fonts.map((f) => document.fonts.load(f, all)));
  await document.fonts.ready;
}
function loadImage(src) {
  return new Promise((res, rej) => { const im = new Image(); im.onload = () => res(im); im.onerror = () => rej(new Error('图片加载失败 ' + src)); im.src = src; });
}
const TEX = {};
window.boot = async (scale = 1) => {
  try {
    GLX.init(document.getElementById('gl'), Math.round(1080 * scale), Math.round(1920 * scale));
    OV.setScale(scale);
    await loadFonts();
    for (const [k, f] of [['day', 'earth-day.jpg'], ['night', 'earth-night.jpg'], ['water', 'earth-water.png'], ['clouds', 'clouds.png']]) {
      TEX[k] = GLX.imageTexture(await loadImage('assets/' + f));
    }
    window.ready = true;
  } catch (e) {
    window.bootError = String(e && e.stack || e);
  }
};
function segAt(t) {
  let i = EDL.findIndex((e) => t >= e.t0 && t < e.t1);
  if (i < 0) i = t < 0 ? 0 : EDL.length - 1;
  const cur = EDL[i];
  if (cur.trans && i > 0 && t < cur.t0 + cur.trans.d / 2) {
    const d = cur.trans.d;
    return { a: EDL[i - 1], b: cur, mix: smooth(cur.t0 - d / 2, cur.t0 + d / 2, t), kind: cur.trans.kind };
  }
  const nx = EDL[i + 1];
  if (nx && nx.trans && t >= nx.t0 - nx.trans.d / 2) {
    const d = nx.trans.d;
    return { a: cur, b: nx, mix: smooth(nx.t0 - d / 2, nx.t0 + d / 2, t), kind: nx.trans.kind };
  }
  return { a: cur, b: null, mix: 0, kind: 0 };
}
// 倒计时："阳光还剩 08:20"。第一次出现在画面中间，然后缩到上面；最后 3 秒又放大到中间，一秒一跳
function countdown(t) {
  const t0 = CH('h3', 1), tz = SE('front'), tb = SS('dark');
  if (t < t0 - .2 || t > tb + .6) return;
  const a = smooth(t0 - .2, t0 + .05, t) * (1 - smooth(tb + .15, tb + .6, t));
  // 位置和大小：中间 → 上面（light 开始时） → 中间（最后 3 秒）
  const up = smooth(SS('light') - .1, SS('light') + .35, t) * (1 - smooth(tz - .2, tz + .15, t));
  const y = lerp(905, 400, up), size = lerp(190, 104, up) * (t > tz ? 1.12 : 1);
  const lab = STORY.label(t);
  // 最后 3 秒每跳一下，数字稍微放大再回来
  let pop = 1;
  if (t > tz) { const L = STORY.left(t); const f = 1 - (Math.ceil(L - 1e-6) - L); pop = 1 + .10 * Math.max(0, 1 - f / .25); }
  const ctx = OV.ctx;
  ctx.save();
  ctx.font = `600 ${size}px ${SERIF}`;
  ctx.letterSpacing = '0px';
  const cw = Math.max(...'0123456789'.split('').map((d) => ctx.measureText(d).width));
  const colon = ctx.measureText(':').width;
  ctx.restore();
  const total = cw * 4 + colon * 1.3;
  let x = 540 - total / 2;
  const urgent = t > tz ? [255, 120, 90] : CREAM;
  for (const ch of lab) {
    const w = ch === ':' ? colon * 1.3 : cw;
    OV.text(ch, x + w / 2, y + (ch === ':' ? -size * .06 : 0), { size, weight: 600, spacing: 0, color: urgent, alpha: a, shadow: 34, shadowColor: 'rgba(0,10,40,.6)', scale: pop });
    x += w;
  }
  OV.text('阳光还剩', 540, y - size * .82, { size: lerp(46, 36, up), weight: 600, spacing: 8, color: CREAM, alpha: a * .95, shadow: 18, shadowColor: 'rgba(0,10,40,.75)' });
}

function drawOverlays(seg, t, opt) {
  OV.begin();
  const pk = Math.sin(Math.PI * seg.mix);
  const shots = !seg.b ? [[seg.a, 1]] : seg.kind === 0 ? [[seg.a, 1 - seg.mix], [seg.b, seg.mix]] : [[seg.mix < .5 ? seg.a : seg.b, 1 - pk]];
  for (const [e, w] of shots) {
    const sh = SHOTS[e.shot];
    if (sh.overlay && w > 0.001) { OV.setMul(w); sh.overlay(t, t - e.t0); }
  }
  OV.setMul(1);
  if (!opt.cover) countdown(t);
  if (!opt.noCaptions) OV.captions(t, ['h1:0']);           // h1 的第一段就是片名
  if (!opt.noWatermark) OV.watermark(1);
}
let frameNo = 0;
window.renderAt = (t, opt = {}) => {
  window.COVER = !!opt.cover;
  const seg = segAt(t);
  drawOverlays(seg, t, opt);
  const A = { shot: SHOTS[seg.a.shot], t, lt: t - seg.a.t0 };
  const B = seg.b ? { shot: SHOTS[seg.b.shot], t, lt: t - seg.b.t0 } : null;
  GLX.frame(A, B, seg.mix, seg.kind, OV.canvas, frameNo++);
  return seg.a.shot + (seg.b ? '→' + seg.b.shot : '');
};
window.grab = () => GLX.readB64();
window.shotList = () => EDL.map((e) => [e.shot, +e.t0.toFixed(2), +e.t1.toFixed(2)]);
