// 启动：加载字体 → 建引擎 → 装时间线 → 暴露逐帧接口给 render.js
import { Engine } from './core/engine.js';
import { buildTimeline } from './timeline.js';

async function loadFonts() {
  const nm = './node_modules/@fontsource';
  const faces = [
    new FontFace('Smiley', 'url(./fonts/SmileySans-Oblique.ttf)'),
    new FontFace('Bebas', `url(${nm}/bebas-neue/files/bebas-neue-latin-400-normal.woff2)`),
    new FontFace('JBMono', `url(${nm}/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2)`, { weight: '400' }),
    new FontFace('JBMono', `url(${nm}/jetbrains-mono/files/jetbrains-mono-latin-700-normal.woff2)`, { weight: '700' }),
    new FontFace('JBMono', `url(${nm}/jetbrains-mono/files/jetbrains-mono-latin-800-normal.woff2)`, { weight: '800' }),
  ];
  for (const f of faces) { await f.load(); document.fonts.add(f); }
  for (const w of [400, 500, 700, 900]) await document.fonts.load(`${w} 40px "Noto Sans CJK SC"`, '拆解宇树测试');
}

const q = new URLSearchParams(location.search);
const scale = parseFloat(q.get('scale') || '1');
const fps = parseFloat(q.get('fps') || '30');

try {
  await loadFonts();
  const E = new Engine(document.getElementById('c'), { scale, fps });
  const { shots, fx, duration, poster } = await buildTimeline(E);
  E.setTimeline(shots, fx);
  window.E = E;
  window.meta = { w: E.w, h: E.h, fps, duration };
  window.renderAt = (t, frame) => { E.render(t, frame); E.renderer.getContext().finish(); return true; };
  window.renderPoster = () => { E.renderSingle(poster, 0); E.renderer.getContext().finish(); return true; };
  window.grabB64 = () => {
    const a = E.grab();
    let s = '';
    const CH = 0x8000;
    for (let i = 0; i < a.length; i += CH) s += String.fromCharCode.apply(null, a.subarray(i, i + CH));
    return btoa(s);
  };
  window.ready = true;
} catch (e) {
  window.bootError = String(e && e.stack || e);
  console.error(window.bootError);
}
