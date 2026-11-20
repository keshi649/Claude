// 入口：renderShot('A1') 画一张样张 = 着色器画面 + 画布上的字和水印。
const SHOTS = Object.assign({}, STYLE_A, typeof STYLE_B === 'object' ? STYLE_B : {}, typeof STYLE_C === 'object' ? STYLE_C : {});
const glCanvas = document.getElementById('gl');
const out = document.getElementById('out');

// 用到的字体先按实际要写的字加载（字体按 unicode-range 分了很多小文件）
const FONT_SAMPLES = [
  ['500 30px "Cormorant Garamond"', 'WHAT IF THE MOON FELL · 01 No.'],
  ['italic 500 30px "Cormorant Garamond"', 'WHAT IF THE MOON FELL · 01 No.'],
  ['300 40px "Noto Serif SC"', '如果月亮掉下来最先变的不是它的大小你会先碎掉成一道光环砸到头上甜菜第集'],
  ['400 40px "Noto Serif SC"', '如果月亮掉下来最先变的不是它的大小你会先碎掉成一道光环砸到头上甜菜第集'],
  ['500 40px "Noto Serif SC"', '如果月亮掉下来最先变的不是它的大小你会先碎掉成一道光环砸到头上甜菜第集'],
  ['600 40px "Noto Serif SC"', '如果月亮掉下来最先变的不是它的大小你会先碎掉成一道光环砸到头上甜菜第集，'],
  ['400 40px "Zhi Mang Xing"', '如果月亮掉下来甜菜其一'],
  ['400 40px "Ma Shan Zheng"', '如果月亮掉下来甜菜其一'],
  ['400 40px "LXGW WenKai"', '如果月亮掉下来最先变的不是它的大小你会先碎掉成一道光环砸到头上甜菜第集，其一'],
  ['300 40px "LXGW WenKai"', '如果月亮掉下来最先变的不是它的大小你会先碎掉成一道光环砸到头上甜菜第集，其一'],
];
async function loadFonts() {
  await Promise.all(FONT_SAMPLES.map(([f, t]) => document.fonts.load(f, t)));
  await document.fonts.ready;
}

// 红色印章：方印，白字（阴文），边缘和字口带一点残破
function seal(ctx, cx, cy, size, text, font) {
  const c = document.createElement('canvas');
  const s = Math.ceil(size * 1.2);
  c.width = c.height = s;
  const g = c.getContext('2d');
  const o = (s - size) / 2;
  g.fillStyle = '#B4322A';
  g.beginPath();
  const j = (k) => (Math.sin(k * 12.9898 + size) * 43758.5453) % 1 * size * 0.012;
  g.moveTo(o + j(1), o + j(2)); g.lineTo(o + size + j(3), o + j(4)); g.lineTo(o + size + j(5), o + size + j(6)); g.lineTo(o + j(7), o + size + j(8));
  g.closePath(); g.fill();
  g.globalCompositeOperation = 'destination-out';
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const chars = [...text];
  if (chars.length === 2) {
    g.font = `${Math.round(size * 0.46)}px ${font}`;
    g.fillText(chars[0], s / 2, o + size * 0.29);
    g.fillText(chars[1], s / 2, o + size * 0.73);
  } else {
    g.font = `${Math.round(size * 0.62)}px ${font}`;
    g.fillText(text, s / 2, s / 2 + size * 0.03);
  }
  // 残破：随机小点
  let seed = 7;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  for (let i = 0; i < size * 1.6; i++) {
    const x = o + rnd() * size, y = o + rnd() * size, r = rnd() * size * 0.012 + 0.3;
    g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
  }
  g.globalCompositeOperation = 'source-over';
  ctx.save();
  ctx.globalCompositeOperation = 'multiply';
  ctx.globalAlpha = 0.92;
  ctx.drawImage(c, cx - s / 2, cy - s / 2);
  ctx.restore();
}

function watermark(ctx, wm) {
  ctx.save();
  if (wm.seal) {
    seal(ctx, 1080 - 70, 92, 66, '甜菜', '"Ma Shan Zheng"');
  } else {
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(0,0,0,0.35)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = wm.color;
    ctx.font = wm.font;
    ctx.letterSpacing = '4px';
    ctx.fillText('甜菜', 1080 - 40, 76);
  }
  ctx.restore();
}

window.renderShot = async (id, scale = 1) => {
  const shot = SHOTS[id];
  if (!shot) throw new Error('没有这个镜头：' + id);
  const W = Math.round(1080 * scale), H = Math.round(1920 * scale);
  glCanvas.width = W; glCanvas.height = H;
  out.width = W; out.height = H;
  if (!GLX.gl) GLX.init(glCanvas);
  await loadFonts();
  const t0 = performance.now();
  if (shot.hdr) await GLX.renderHDR(shot.fs, shot.uniforms || {}, shot.post || {}, shot.tiles || 16);
  else await GLX.renderLDR(shot.fs, shot.uniforms || {}, shot.tiles || 16);
  const ctx = out.getContext('2d');
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.drawImage(glCanvas, 0, 0);
  ctx.save();
  ctx.scale(scale, scale);
  if (shot.text) { ctx.save(); shot.text(ctx); ctx.restore(); }
  if (shot.watermark) watermark(ctx, shot.watermark);
  ctx.restore();
  return Math.round(performance.now() - t0);
};
window.grabPNG = () => out.toDataURL('image/png').split(',')[1];
window.shotIds = Object.keys(SHOTS);
window.ready = true;
