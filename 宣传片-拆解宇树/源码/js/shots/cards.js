// 六部的标题卡（每张 0.75 秒）：巨大的描边编号滑进来，部名砸下来，底下是六格进度条
import { text, kinetic, F, font } from '../core/text.js';
import { grid } from '../core/hud.js';
import { clamp, ease, COL } from '../core/util.js';
import { shot } from './common.js';

export const PARTS = [
  ['01', '认识它', '第 1–3 章'],
  ['02', '拆开它', '第 4–9 章'],
  ['03', '让它动', '第 10–13 章'],
  ['04', '让它懂', '第 14–15 章'],
  ['05', '看懂这门生意', '第 16–17 章'],
  ['06', '走进来', '第 18–19 章'],
];

export function partCard(i, start, dur = 0.75) {
  const [num, name, chap] = PARTS[i];
  return shot({
    id: 'P' + num, start, end: start + dur, clear: 0x0d0f13,
    look: { grain: 0.05, vignette: 0.6, chroma: 0.4 },
    baseBloom: { strength: 0 },
    frame(E, lt, ctx) {
      ctx.fillStyle = '#0D0F13'; ctx.fillRect(0, 0, 1080, 1920);
      grid(ctx, 1080, 1920, 60, { alpha: 0.07, ox: -lt * 80 });
      // 斜着的橙色色块
      const k = ease.outExpo(clamp(lt / 0.3));
      ctx.save();
      ctx.translate(540, 980); ctx.rotate(-0.22);
      ctx.fillStyle = COL.orange;
      ctx.fillRect(-900 + (1 - k) * -800, -170, 1800, 340);
      ctx.fillStyle = 'rgba(13,15,19,0.18)';
      for (let x = -900; x < 900; x += 46) ctx.fillRect(x + ((lt * 300) % 46), -170, 14, 340);
      ctx.restore();
      // 巨大的描边编号
      ctx.save();
      font(ctx, 620, F.num, 400);
      ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
      ctx.lineWidth = 6; ctx.strokeStyle = 'rgba(243,240,233,0.9)';
      ctx.globalAlpha = clamp(lt / 0.12);
      ctx.strokeText(num, 70 - (1 - ease.outCubic(clamp(lt / 0.4))) * 300 + lt * 40, 760);
      ctx.restore();
      font(ctx, 40, F.mono, 800); ctx.fillStyle = COL.bone; ctx.textAlign = 'left';
      ctx.globalAlpha = clamp((lt - 0.08) / 0.15);
      ctx.fillText(`PART ${num} / 06`, 86, 290);
      ctx.globalAlpha = 1;
      // 部名：压在橙块上，黑字
      const size = name.length > 4 ? 150 : 200;
      kinetic(ctx, name, 540, 990, lt - 0.06, { size, family: F.title, weight: 400, mode: 'slam', dur: 0.2, color: '#14161A' });
      text(ctx, chap, 540, 1240, { size: 46, weight: 700, color: COL.bone, alpha: clamp((lt - 0.2) / 0.15) });
      // 六格进度
      for (let j = 0; j < 6; j++) {
        const on = j < i || (j === i && lt > 0.1);
        ctx.fillStyle = on ? COL.orange : 'rgba(243,240,233,0.18)';
        const w = 120, gap = 16, x0 = 540 - (6 * w + 5 * gap) / 2;
        ctx.fillRect(x0 + j * (w + gap), 1500, j === i ? w * ease.outCubic(clamp(lt / 0.35)) : w, 10);
      }
    },
  });
}
