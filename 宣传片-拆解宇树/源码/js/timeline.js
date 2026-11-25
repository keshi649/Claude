// 整片时间线：镜头、转场、整片冲击效果。配乐 120 BPM（一拍 0.5 秒），切点和冲击都卡在拍子上。
import { act0 } from './shots/act0.js';
import { act1 } from './shots/act1.js';
import { act2 } from './shots/act2.js';
import { act3 } from './shots/act3.js';
import { act4 } from './shots/act4.js';
import { act5 } from './shots/act5.js';
import { act6 } from './shots/act6.js';
import { finale } from './shots/finale.js';
import { partCard } from './shots/cards.js';

export const DURATION = 76.5;

export async function buildTimeline(E) {
  const shots = [
    ...act0(E), partCard(0, 10), ...act1(E), partCard(1, 16), ...act2(E), partCard(2, 28), ...act3(E),
    partCard(3, 44), ...act4(E), partCard(4, 50), ...act5(E), partCard(5, 56), ...act6(E),
  ];
  const byId = Object.fromEntries(shots.map((s) => [s.id, s]));
  shots.push(...(await finale(E, byId)));
  shots.sort((a, b) => a.start - b.start);
  for (const s of shots) byId[s.id] = s;
  // 检查：镜头首尾相接
  for (let i = 1; i < shots.length; i++) if (Math.abs(shots[i].start - shots[i - 1].end) > 1e-6) console.warn('时间线有缝', shots[i - 1].id, shots[i].id);

  const tr = (type, dur, extra = {}) => ({ type, dur, ...extra });
  const slab = tr('slab', 0.36, { dir: [0.97, 0.24] });
  const T = {
    S01: tr('flash', 0.16), S02: tr('cut', 0), S03: tr('cut', 0), S04: slab,
    P01: tr('whip', 0.24, { dir: [0, 1] }), S06: tr('glitch', 0.22, { seed: 3 }), S07: slab,
    P02: tr('whip', 0.24, { dir: [1, 0] }), S09: tr('zoom', 0.42, { center: [0.5, 0.52] }), S10: tr('flash', 0.14), S11: tr('pixel', 0.26), S12: slab,
    P03: tr('whip', 0.24, { dir: [0, -1] }), S14: tr('burn', 0.5, { seed: 2 }), S15: tr('iris', 0.4, { center: [0.5, 0.45] }), S16: tr('flash', 0.16), S17: slab,
    P04: tr('whip', 0.24, { dir: [-1, 0] }), S19: tr('glitch', 0.24, { seed: 7 }), S20: slab,
    P05: tr('whip', 0.24, { dir: [0, 1] }), S22: tr('push', 0.3, { dir: [0, 1] }), S23: slab,
    P06: tr('whip', 0.24, { dir: [1, 0] }), S25: tr('iris', 0.4, { center: [0.5, 0.4] }), S26: tr('flash', 0.16),
    S27: tr('zoom', 0.36, { center: [0.5, 0.5] }), S27B: tr('burn', 0.5, { seed: 5 }),
  };
  for (const [id, t] of Object.entries(T)) if (byId[id]) byId[id].out = t;

  const fx = [
    // 开场
    { t: 0, kind: 'flash', amp: 0.85, decay: 11 },
    { t: 1.0, kind: 'punch', amp: 1 },
    { t: 3.0, kind: 'hit', amp: 0.7 }, { t: 3.0, kind: 'glitch', amp: 0.6, dur: 0.12 },
    { t: 4.0, kind: 'hit', amp: 0.45 }, { t: 4.0, kind: 'glitch', amp: 0.4, dur: 0.1 },
    { t: 5.0, kind: 'hit', amp: 0.45 }, { t: 5.0, kind: 'glitch', amp: 0.4, dur: 0.1 },
    { t: 6.25, kind: 'hit', amp: 1.2 }, { t: 6.25, kind: 'flash', amp: 0.5, decay: 9 },
    { t: 7.62, kind: 'fade', dur: 0.36, from: 0, to: 1 }, { t: 7.98, kind: 'fade', dur: 0.03, from: 1, to: 1 },
    { t: 8.0, kind: 'flash', amp: 1, decay: 7 }, { t: 8.0, kind: 'hit', amp: 1.4 }, { t: 8.0, kind: 'glitch', amp: 0.5, dur: 0.08 },
    { t: 8.22, kind: 'punch', amp: 1.2 },
    // 第一部
    { t: 10.06, kind: 'punch', amp: 1 },
    ...[14.0, 14.25, 14.5, 14.75, 15.0].map((t) => ({ t, kind: 'punch', amp: 0.6 })),
    // 第二部
    { t: 16.06, kind: 'punch', amp: 1 },
    ...[20.0, 20.5, 21.0, 21.5, 22.0, 22.5].map((t) => ({ t, kind: 'punch', amp: 0.6 })),
    { t: 23.5, kind: 'hit', amp: 0.9 },
    { t: 26.0, kind: 'hit', amp: 0.8 },
    // 第三部
    { t: 28.06, kind: 'punch', amp: 1 },
    { t: 34.0, kind: 'punch', amp: 0.8 }, { t: 35.0, kind: 'hit', amp: 0.6 },
    { t: 40.75, kind: 'punch', amp: 0.8 }, { t: 41.75, kind: 'punch', amp: 0.8 },
    { t: 42.25, kind: 'hit', amp: 1.1 }, { t: 42.25, kind: 'flash', amp: 0.35, decay: 10 },
    // 第四部
    { t: 44.06, kind: 'punch', amp: 1 },
    { t: 48.5, kind: 'hit', amp: 0.8 }, { t: 48.5, kind: 'glitch', amp: 0.4, dur: 0.1 }, { t: 48.75, kind: 'punch', amp: 1 },
    // 第五部
    { t: 50.06, kind: 'punch', amp: 1 },
    { t: 53.0, kind: 'punch', amp: 0.6 },
    ...[0, 1, 2, 3, 4, 5].map((i) => ({ t: 54.25 + i * 0.125, kind: 'punch', amp: 0.4 })),
    { t: 55.5, kind: 'hit', amp: 1.0 },
    // 第六部
    { t: 56.06, kind: 'punch', amp: 1 },
    { t: 61.5, kind: 'hit', amp: 0.8 },
    // 高潮
    ...[62, 62.5, 63, 63.5, 64, 64.5].map((t) => ({ t, kind: 'hit', amp: 0.7 })),
    ...[62.25, 62.75, 63.25, 63.75, 64.25, 64.75].map((t) => ({ t, kind: 'flash', amp: 0.18, decay: 18 })),
    ...[65.125, 65.25, 65.375, 65.5, 65.625, 65.75].map((t) => ({ t, kind: 'punch', amp: 0.7 })),
    { t: 66.0, kind: 'hit', amp: 1.0 },
    // 书
    { t: 66.5, kind: 'flash', amp: 0.3, decay: 9 },
    { t: 72.5, kind: 'punch', amp: 0.7 },
    { t: 75.3, kind: 'fade', dur: 1.2, from: 0, to: 1 },
  ];
  // 封面：借 S01 空翻最高处那一刻的画面，换上封面的字
  const poster = {
    id: 'POSTER', start: 0, end: 1, look: { grain: 0.03, vignette: 0.75, chroma: 0.2 },
    delegate: () => ({ shot: byId.S01, lt: 2.62, clearOverlay: true }),
    overlay(E, lt, ctx, src) {
      src.grade.exposure = 0.9;
      const g1 = ctx.createLinearGradient(0, 0, 0, 760); g1.addColorStop(0, 'rgba(8,9,12,0.92)'); g1.addColorStop(1, 'rgba(8,9,12,0)');
      ctx.fillStyle = g1; ctx.fillRect(0, 0, 1080, 760);
      const g2 = ctx.createLinearGradient(0, 1150, 0, 1920); g2.addColorStop(0, 'rgba(8,9,12,0)'); g2.addColorStop(1, 'rgba(8,9,12,0.95)');
      ctx.fillStyle = g2; ctx.fillRect(0, 1150, 1080, 770);
      ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
      ctx.font = '400 300px "Smiley", "Noto Sans CJK SC"'; ctx.fillStyle = '#F3F0E9';
      ctx.shadowColor = 'rgba(0,0,0,0.6)'; ctx.shadowBlur = 30; ctx.fillText('拆解宇树', 540, 330); ctx.shadowBlur = 0;
      ctx.font = '700 50px "Noto Sans CJK SC"'; ctx.fillStyle = '#EE6A1F'; ctx.fillText('从一颗电机到会翻跟头的机器人', 540, 520);
      ctx.fillStyle = '#EE6A1F'; ctx.fillRect(110, 1440, 860, 250);
      ctx.font = '900 76px "Noto Sans CJK SC"'; ctx.fillStyle = '#14161A';
      ctx.fillText('春晚翻跟头的机器人', 540, 1515); ctx.fillText('是怎么造出来的？', 540, 1615);
      ctx.font = '700 46px "Noto Sans CJK SC"'; ctx.fillStyle = '#F3F0E9'; ctx.fillText('甜菜 著', 540, 1780);
    },
  };
  return { shots, fx, duration: DURATION, poster };
}
