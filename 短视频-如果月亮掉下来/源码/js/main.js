// 场景编排：每个时刻用哪个镜头、镜头之间怎么转；每帧把字幕、标注、水印叠上去。
// 时间全部从 timeline.js（narration.py 按配音生成）来，改了配音，画面自动跟着挪。
// 转场 kind：0 叠化，1 白闪，2 经过黑；不写 trans 就是硬切。
const EDL = [
  { shot: 'hookSea', t0: 0, t1: MK('h2', 0) },
  { shot: 'waveClose', t0: MK('h2', 0), t1: S('t2') - .15 },
  { shot: 'tideCity', t0: S('t2') - .15, t1: S('t3') - .12 },
  { shot: 'floodClose', t0: S('t3') - .12, t1: SS('orbit') },
  { shot: 'orbit', t0: SS('orbit'), t1: SS('break') },
  { shot: 'breakup', t0: SS('break'), t1: SS('ring'), trans: { kind: 2, d: .4 } },
  { shot: 'ringSpace', t0: SS('ring'), t1: SS('night'), trans: { kind: 2, d: .5 } },
  { shot: 'nightRing', t0: SS('night'), t1: SS('mars'), trans: { kind: 1, d: .7 } },
  { shot: 'mars', t0: SS('mars'), t1: SS('twist'), trans: { kind: 2, d: .8 } },
  { shot: 'twist', t0: SS('twist'), t1: SS('end'), trans: { kind: 2, d: .8 } },
  { shot: 'endCard', t0: SS('end'), t1: DUR + 5, trans: { kind: 0, d: .6 } },
];

// 要用到的字先按实际要写的字加载（字体按 unicode-range 分成很多小文件）
const EXTRA_TEXT = '如果月亮掉下来第一集它会越变越大？是海。WHAT IF 地月距离万公里看上去潮汐力倍示意洛希极限流体刚体火卫一 Black Mittal 2015 Nature Geoscience ' +
  '阿波罗激光测距每年厘米指甲约 Yaemsiri 2010 甜菜出品画面字幕音效：Claude 用代码生成·配音：CosyVoice 3 合成如果……会怎样系列今晚抬头看看它要月亮还是光环评论区站个队' +
  '先变的潮水近一半处被扯碎成真实的月亮远 0123456789.,:%×→（）《》流浪地球拉力近的一面远的一面 km 38 19 1.8 3.8 4 18381 9492 一点八万今天地球光环火星';
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

function drawOverlays(seg, t, opt) {
  OV.begin();
  // 叠化时两个镜头的字各按比例；白闪、经过黑时只画当时那个镜头的字，跟着画面一起暗下去 / 亮起来
  const pk = Math.sin(Math.PI * seg.mix);
  const shots = !seg.b ? [[seg.a, 1]] : seg.kind === 0 ? [[seg.a, 1 - seg.mix], [seg.b, seg.mix]] : [[seg.mix < .5 ? seg.a : seg.b, 1 - pk]];
  for (const [e, w] of shots) {
    const sh = SHOTS[e.shot];
    if (sh.overlay && w > 0.001) { OV.setMul(w); sh.overlay(t, t - e.t0); }
  }
  OV.setMul(1);
  if (!opt.noCaptions) OV.captions(t, ['h1']);          // h1 的字和片名一样，片名已经在画面上了
  const endA = SS('end');
  if (!opt.noWatermark) OV.watermark(1 - smooth(endA - .3, endA + .1, t));
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
