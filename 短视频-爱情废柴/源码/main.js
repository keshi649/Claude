'use strict';
/* main.js —— 镜头表、转场、逐帧入口。frame(t) 只依赖时间 t。
   S(开始时刻, 画面函数, {tag 歌词窗的名字, in [转场, 时长], nolyr 不画歌词窗, nomark 不画水印}) */
function shotAt(t) { let k = 0; for (let i = 0; i < SHOTS.length; i++) if (SHOTS[i].t0 <= t) k = i; else break; return k; }
const PG = mk(PW, PH), GG = mk(PW, PH), DUR = 279.27;
/* 转场：前一个镜头的最后半段做"出"，后一个镜头的头半段做"进" */
function trans(g, G, ty, q, t, isIn) {       // q：盖住的程度 0~1
  if (q <= 0) return; let dark = 0;
  if (ty === 'swirl' || ty === 'dz' || ty === 'blinds' || ty === 'diag') { fxCover(g, q, ty); dark = q; }
  else if (ty === 'mosaic') fxMosaic(g, 1 + q * 15);
  else if (ty === 'flash') fxFlash(g, q * q);
  else if (ty === 'flashin') { if (isIn) fxFlash(g, q); }
  else if (ty === 'black') { fxFlash(g, q, '#05060F'); dark = q; }
  else if (ty === 'iris') { fxIris(g, 240, 128, (1 - q) * 290); dark = q; }
  else if (ty === 'glitch') { fxGlitch(g, t, q); if (q > .6) fxMosaic(g, 1 + (q - .6) * 20); }
  else if (ty === 'crt') { if (isIn) fxCRT(g, 1 - q); dark = isIn ? q * .8 : 0; }
  if (dark > 0) { G.save(); G.globalAlpha = cl(dark); G.fillStyle = '#000'; G.fillRect(0, 0, PW, PH); G.restore(); }
}
function frame(t) {
  const g = PG, G = GG;
  [g, G].forEach(c => { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; });
  g.fillStyle = '#05060F'; g.fillRect(0, 0, PW, PH); G.fillStyle = '#000'; G.fillRect(0, 0, PW, PH);
  const i = shotAt(t), s = SHOTS[i], nx = SHOTS[i + 1];
  g.save(); G.save(); s.fn(g, G, t, t - s.t0, s); g.restore(); G.restore();
  if (nx && nx.in && nx.in[0] !== 'flashin' && nx.in[0] !== 'crt') trans(g, G, nx.in[0], sg(t, nx.t0 - nx.in[1] / 2, nx.t0), t, false);
  if (s.in) trans(g, G, s.in[0], 1 - sg(t, s.t0, s.t0 + s.in[1] / (s.in[0] === 'flashin' || s.in[0] === 'crt' ? 1 : 2)), t, true);
  if (!s.nolyr) lyrWin(g, t, s.tag);
  if (!s.nomark) ptext(g, '甜菜', 454, 13, '#FFFFFF', { align: 'r', ol: '#0A0E24' });
}
/* 出图：上半张是画面，下半张是光晕层（ffmpeg 里放大、模糊、叠回去） */
const OUT = mk(PW, PH * 2);
function grab(t) { frame(t); OUT.drawImage(PG.canvas, 0, 0); OUT.drawImage(GG.canvas, 0, PH); return OUT.canvas.toDataURL('image/png'); }
/* 预览：在小画布上直接把光晕叠好（看分镜用，和成片略有出入） */
const PRE = mk(PW, PH);
function prev(t) { frame(t); const c = PRE; c.globalCompositeOperation = 'source-over'; c.filter = 'none'; c.globalAlpha = 1; c.drawImage(PG.canvas, 0, 0); c.globalCompositeOperation = 'screen'; c.imageSmoothingEnabled = true; c.filter = 'blur(2.4px)'; c.globalAlpha = .8; c.drawImage(GG.canvas, 0, 0); c.filter = 'blur(9px)'; c.globalAlpha = .55; c.drawImage(GG.canvas, 0, 0); c.filter = 'none'; c.globalAlpha = 1; return c.canvas.toDataURL('image/png'); }

/* 封面：Boss 战 + 片名（片名放在横向中间，主页按中间裁成 3:4 也看得到） */
function COVER(g, G) {
  const t = 86.6; battleBG(g, G, t, 0, 300, 120); boss(g, 300, 224, 118, { eyes: 'happy', mouth: 'smile', rim: '#FFF4C0' });
  field(g, 150, 110, 120, 110, '#FFFFFF', (x, y) => { const tt = (262 - x) / 80; if (tt < 0 || tt > 1) return 0; const cy = 150 + tt * 30, hw = 3 + tt * 12, d = Math.abs(y - cy) / hw; return d < 1 ? .8 * (1 - d * d * .5) : 0; });
  ell(g, 182, 226, 24, 4, '#8878C0', .7); rotBlit(g, chibi(null, 0, 0, 64, HO({ eyes: 'shut', mouth: 'o', tear: 1.2, arms: 'mic', wind: 1, buf: 1 })), 178, 182, -.2);
  ptext(g, '-9999', 142, 104, '#FF3A4A', { s: 2, ol: '#FFFFFF' }); ptext(g, '会心一击！', 146, 90, '#FFE066', { ol: '#3A1A60' });
  snow3(g, t, .7); R(g, 0, 12, PW, 60, 'rgba(20,10,50,.45)'); titleLogo(g, G, 18, [9, 9, 9, 9]);
  panel(g, 150, 232, 180, 26); ptext(g, '我承认我是 爱情里的废柴', 240, 239, '#FFFFFF', { align: 'c', sh: '#060A24' });
  panel(g, 12, 80, 100, 30, { bg: '#40102A' }); ptext(g, 'BOSS', 18, 83, '#FF6A8A'); ptext(g, '你的笑容', 50, 83, '#FFFFFF'); bar(g, 19, 100, 86, 1, '#FF5A8A'); ptext(g, '甜菜', 454, 13, '#FFFFFF', { align: 'r', ol: '#0A0E24' });
}
function grabCover() { const g = PG, G = GG; [g, G].forEach(c => { c.setTransform(1, 0, 0, 1, 0, 0); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over'; }); g.fillStyle = '#05060F'; g.fillRect(0, 0, PW, PH); G.fillStyle = '#000'; G.fillRect(0, 0, PW, PH); COVER(g, G); OUT.drawImage(PG.canvas, 0, 0); OUT.drawImage(GG.canvas, 0, PH); return OUT.canvas.toDataURL('image/png'); }
