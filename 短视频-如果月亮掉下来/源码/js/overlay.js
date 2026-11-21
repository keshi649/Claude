// 字和界面：字幕（按配音的逐字时间一段段出）、大字、细线标注、出处、水印。画在一张透明画布上，合成时叠上去。
const TL = window.TIMELINE;
const LN = Object.fromEntries(TL.lines.map((l) => [l.id, l]));
const SCN = Object.fromEntries(TL.scenes.map((s) => [s.name, s]));
const S = (id) => LN[id].t0;
const EN = (id) => LN[id].t1;
const CH = (id, k) => (LN[id].chunks.length ? LN[id].chunks[k][0] : LN[id].t0);
const MK = (id, i) => LN[id].marks[i];
const SS = (n) => SCN[n].t0;
const SE = (n) => SCN[n].t1;
const DUR = TL.duration;

const clamp01 = (x) => Math.max(0, Math.min(1, x));
const smooth = (a, b, x) => { const t = clamp01((x - a) / (b - a)); return t * t * (3 - 2 * t); };
const easeOut = (x) => 1 - Math.pow(1 - clamp01(x), 3);
const easeInOut = (x) => { x = clamp01(x); return x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2; };
const lerp = (a, b, k) => a + (b - a) * k;

const SERIF = '"Noto Serif SC"';
const LATIN = '"Cormorant Garamond"';
const CREAM = [247, 239, 230];
const GOLD = [255, 212, 150];
const rgba = (c, a) => `rgba(${c[0]},${c[1]},${c[2]},${a})`;

const OV = (() => {
  const W = 1080, H = 1920;
  const cv = document.createElement('canvas');
  cv.width = W; cv.height = H;
  const ctx = cv.getContext('2d');
  let MUL = 1, SC = 1;
  function setScale(s) { SC = s; cv.width = Math.round(W * s); cv.height = Math.round(H * s); }
  function setMul(m) { MUL = m; }

  function begin() { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.globalAlpha = 1; ctx.clearRect(0, 0, cv.width, cv.height); ctx.setTransform(SC, 0, 0, SC, 0, 0); MUL = 1; }

  // {…} 拆成 [文字, 是否高亮]
  function runs(s) {
    const out = []; let hl = false, cur = '';
    for (const c of s) {
      if (c === '{' || c === '}') { if (cur) out.push([cur, hl]); cur = ''; hl = c === '{'; } else cur += c;
    }
    if (cur) out.push([cur, hl]);
    return out;
  }
  function richLine(line, x, y, size, alpha, opt = {}) {
    alpha *= MUL;
    const weight = opt.weight || 600, spacing = opt.spacing ?? 2;
    const parts = runs(line);
    ctx.font = `${weight} ${size}px ${SERIF}`;
    ctx.letterSpacing = spacing + 'px';
    const widths = parts.map(([s]) => ctx.measureText(s).width);
    const total = widths.reduce((a, b) => a + b, 0) - spacing;
    let cx = opt.align === 'left' ? x : x - total / 2;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'alphabetic';
    parts.forEach(([s, hl], i) => {
      ctx.shadowColor = `rgba(0,0,0,${.78 * alpha})`;
      ctx.shadowBlur = opt.shadow ?? 22;
      ctx.fillStyle = rgba(hl ? (opt.hlColor || GOLD) : (opt.color || [255, 255, 255]), alpha);
      ctx.fillText(s, cx, y);
      ctx.shadowBlur = 0;
      cx += widths[i];
    });
    return total;
  }

  // 字幕：每段从它开始发声前 0.04 秒出现，到下一段（或这句结束后 0.3 秒）为止
  const CAP_X = 520, CAP_Y = 1478, CAP_SIZE = 56;
  function captions(t, skip = []) {
    for (const l of TL.lines) {
      if (l.kind !== 'N' || !l.chunks.length || skip.includes(l.id)) continue;
      if (t < l.t0 - .3 || t > l.t1 + .6) continue;
      for (let k = 0; k < l.chunks.length; k++) {
        const a = l.chunks[k][0] - .04;
        const b = k + 1 < l.chunks.length ? l.chunks[k + 1][0] - .04 : l.t1 + .3;
        if (t < a || t >= b) continue;
        const fin = smooth(a, a + .1, t);
        const fout = k + 1 < l.chunks.length ? 1 : 1 - smooth(b - .14, b, t);
        const alpha = fin * fout;
        const rows = l.chunks[k][1].split('/');
        if (rows.length === 1) richLine(rows[0], CAP_X, CAP_Y, CAP_SIZE, alpha);
        else rows.forEach((r, i) => richLine(r, CAP_X, CAP_Y - 74 + i * 74, CAP_SIZE, alpha));
      }
    }
  }

  function watermark(alpha = 1) {
    ctx.save();
    ctx.textAlign = 'right';
    ctx.textBaseline = 'alphabetic';
    ctx.shadowColor = 'rgba(0,0,0,.4)';
    ctx.shadowBlur = 8;
    ctx.fillStyle = `rgba(255,255,255,${.78 * alpha})`;
    ctx.font = `500 34px ${SERIF}`;
    ctx.letterSpacing = '4px';
    ctx.fillText('甜菜', 1040, 76);
    ctx.restore();
  }

  // 出处：标题栏下面左对齐的小字
  function source(lines, alpha = 1) {
    alpha *= MUL;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.font = `400 24px ${SERIF}`;
    ctx.letterSpacing = '1px';
    ctx.shadowColor = 'rgba(0,0,0,.6)';
    ctx.shadowBlur = 6;
    ctx.fillStyle = `rgba(225,225,230,${.72 * alpha})`;
    (Array.isArray(lines) ? lines : [lines]).forEach((s, i) => ctx.fillText(s, 72, 246 + i * 34));
    ctx.restore();
  }

  function text(s, x, y, o = {}) {
    const a = (o.alpha ?? 1) * MUL;
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.textAlign = o.align || 'center';
    ctx.textBaseline = o.base || 'alphabetic';
    ctx.font = `${o.weight || 500} ${o.size || 40}px ${o.font || SERIF}`;
    ctx.letterSpacing = (o.spacing ?? 2) + 'px';
    if (o.shadow !== 0) { ctx.shadowColor = o.shadowColor || 'rgba(0,0,0,.7)'; ctx.shadowBlur = o.shadow ?? 18; }
    ctx.fillStyle = o.color ? rgba(o.color, 1) : '#fff';
    if (o.scale && o.scale !== 1) { ctx.translate(x, y); ctx.scale(o.scale, o.scale); ctx.fillText(s, 0, 0); }
    else ctx.fillText(s, x, y);
    ctx.restore();
  }

  function line(x0, y0, x1, y1, o = {}) {
    ctx.save();
    ctx.globalAlpha = (o.alpha ?? 1) * MUL;
    ctx.strokeStyle = o.color ? rgba(o.color, 1) : 'rgba(255,255,255,.85)';
    ctx.lineWidth = o.width || 2;
    if (o.dash) ctx.setLineDash(o.dash);
    ctx.shadowColor = 'rgba(0,0,0,.5)';
    ctx.shadowBlur = o.shadow ?? 4;
    ctx.beginPath(); ctx.moveTo(x0, y0); ctx.lineTo(x1, y1); ctx.stroke();
    ctx.restore();
  }

  // 细线框的数值条：标签、长度比例
  function bar(x, y, w, frac, label, value, o = {}) {
    const a = (o.alpha ?? 1) * MUL;
    if (a <= 0) return;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.font = `500 32px ${SERIF}`;
    ctx.letterSpacing = '2px';
    ctx.textAlign = 'left';
    ctx.shadowColor = 'rgba(0,0,0,.65)';
    ctx.shadowBlur = 10;
    ctx.fillStyle = 'rgba(255,255,255,.9)';
    ctx.fillText(label, x, y);
    ctx.strokeStyle = 'rgba(255,255,255,.55)';
    ctx.lineWidth = 1.5;
    ctx.strokeRect(x, y + 16, w, 18);
    ctx.fillStyle = rgba(o.color || GOLD, .95);
    ctx.fillRect(x + 3, y + 19, Math.max(0, (w - 6) * frac), 12);
    ctx.textAlign = 'right';
    ctx.font = `600 40px ${SERIF}`;
    ctx.fillStyle = rgba(o.color || GOLD, 1);
    ctx.fillText(value, x + w, y);
    ctx.restore();
  }

  function circle(x, y, r, o = {}) {
    ctx.save();
    ctx.globalAlpha = (o.alpha ?? 1) * MUL;
    ctx.strokeStyle = o.color ? rgba(o.color, 1) : 'rgba(255,255,255,.8)';
    ctx.lineWidth = o.width || 2;
    if (o.dash) ctx.setLineDash(o.dash);
    ctx.lineDashOffset = o.dashOffset || 0;
    ctx.shadowColor = 'rgba(0,0,0,.4)';
    ctx.shadowBlur = 4;
    ctx.beginPath();
    if (o.ry) ctx.ellipse(x, y, r, o.ry, o.rot || 0, o.a0 ?? 0, o.a1 ?? Math.PI * 2);
    else ctx.arc(x, y, r, o.a0 ?? 0, o.a1 ?? Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  return { W, H, canvas: cv, ctx, begin, setScale, setMul, captions, watermark, source, text, richLine, line, bar, circle };
})();
