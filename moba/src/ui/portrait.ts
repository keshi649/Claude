import { getHero } from '../data/heroes';
import { HAIR } from '../render/palette';

/**
 * 程序绘制的英雄头像（Canvas 2D，无外部图片）：
 * 背景用英雄主 / 辅色，半身像按定位区分发型与头饰（坦克头盔、刺客兜帽面罩、法师长发额饰……）。
 * 结果缓存成 dataURL，选英雄、击杀播报、战绩、结算共用。
 */
const cache = new Map<string, string>();

const css = (c: number, a = 1): string => `rgba(${(c >> 16) & 255},${(c >> 8) & 255},${c & 255},${a})`;
function shade(c: number, k: number): number {
  const f = (v: number): number => Math.max(0, Math.min(255, Math.round(v * k)));
  return (f((c >> 16) & 255) << 16) | (f((c >> 8) & 255) << 8) | f(c & 255);
}

const SKIN = 0xf2c9a0;

export function portrait(heroId: string): string {
  const hit = cache.get(heroId);
  if (hit) return hit;
  const def = getHero(heroId);
  const S = 128;
  const cv = document.createElement('canvas');
  cv.width = cv.height = S;
  const c = cv.getContext('2d')!;
  const p = def.palette.primary;
  const s2 = def.palette.secondary;
  const hair = HAIR[def.role] ?? 0x2a1a14;

  // 背景：辅色光晕 + 主色暗角 + 斜向光纹
  const bg = c.createRadialGradient(S * 0.5, S * 0.38, 4, S * 0.5, S * 0.5, S * 0.75);
  bg.addColorStop(0, css(shade(s2, 1.05)));
  bg.addColorStop(0.45, css(shade(p, 0.9)));
  bg.addColorStop(1, css(shade(p, 0.25)));
  c.fillStyle = bg;
  c.fillRect(0, 0, S, S);
  c.save();
  c.globalAlpha = 0.12;
  c.strokeStyle = '#fff';
  c.lineWidth = 6;
  for (let i = -2; i < 6; i++) {
    c.beginPath();
    c.moveTo(i * 30, S);
    c.lineTo(i * 30 + S, 0);
    c.stroke();
  }
  c.restore();

  const cx = S / 2;
  const headY = S * 0.47;
  const r = S * 0.17;

  // 肩甲 / 衣服
  c.fillStyle = css(shade(p, 0.85));
  c.beginPath();
  c.moveTo(S * 0.08, S);
  c.quadraticCurveTo(S * 0.12, S * 0.7, cx, S * 0.68);
  c.quadraticCurveTo(S * 0.88, S * 0.7, S * 0.92, S);
  c.fill();
  c.fillStyle = css(s2);
  c.fillRect(cx - S * 0.03, S * 0.72, S * 0.06, S * 0.28);
  if (def.role === 'tank' || def.role === 'fighter') {
    // 肩甲
    for (const side of [-1, 1]) {
      c.fillStyle = css(shade(p, 1.15));
      c.beginPath();
      c.ellipse(cx + side * S * 0.3, S * 0.8, S * 0.16, S * 0.1, side * 0.35, 0, Math.PI * 2);
      c.fill();
      c.strokeStyle = css(s2);
      c.lineWidth = 3;
      c.stroke();
    }
  }
  // 脖子
  c.fillStyle = css(shade(SKIN, 0.85));
  c.fillRect(cx - r * 0.35, headY + r * 0.6, r * 0.7, r * 0.7);

  // 长发（在头后面）
  if (def.role === 'mage' || def.role === 'support' || def.role === 'marksman') {
    c.fillStyle = css(hair);
    c.beginPath();
    c.ellipse(cx, headY + r * 0.5, r * 1.25, r * 1.55, 0, Math.PI, 0);
    c.lineTo(cx + r * 1.25, headY + r * 1.6);
    c.lineTo(cx - r * 1.25, headY + r * 1.6);
    c.fill();
  }
  // 兜帽
  if (def.role === 'assassin') {
    c.fillStyle = css(shade(p, 0.6));
    c.beginPath();
    c.moveTo(cx - r * 1.5, headY + r * 1.9);
    c.quadraticCurveTo(cx - r * 1.6, headY - r * 1.7, cx, headY - r * 1.55);
    c.quadraticCurveTo(cx + r * 1.6, headY - r * 1.7, cx + r * 1.5, headY + r * 1.9);
    c.fill();
  }

  // 脸
  const face = c.createRadialGradient(cx - r * 0.3, headY - r * 0.3, 2, cx, headY, r * 1.1);
  face.addColorStop(0, css(shade(SKIN, 1.08)));
  face.addColorStop(1, css(shade(SKIN, 0.85)));
  c.fillStyle = face;
  c.beginPath();
  c.ellipse(cx, headY, r * 0.92, r * 1.05, 0, 0, Math.PI * 2);
  c.fill();

  // 眼睛与眉毛
  const eyeY = headY + r * 0.05;
  c.fillStyle = '#1a1420';
  for (const side of [-1, 1]) {
    c.beginPath();
    c.ellipse(cx + side * r * 0.36, eyeY, r * 0.1, r * 0.15, 0, 0, Math.PI * 2);
    c.fill();
  }
  c.strokeStyle = css(shade(hair, 0.8));
  c.lineWidth = 2.5;
  for (const side of [-1, 1]) {
    c.beginPath();
    const tilt = def.role === 'assassin' || def.role === 'fighter' ? 0.12 : -0.04;
    c.moveTo(cx + side * r * 0.18, eyeY - r * 0.28 + tilt * r);
    c.lineTo(cx + side * r * 0.56, eyeY - r * 0.3 - tilt * r);
    c.stroke();
  }

  switch (def.role) {
    case 'tank': {
      // 头盔 + 面甲缝
      c.fillStyle = css(shade(p, 1.2));
      c.beginPath();
      c.ellipse(cx, headY - r * 0.15, r * 1.08, r * 1.02, 0, Math.PI * 1.02, Math.PI * 1.98);
      c.lineTo(cx + r * 1.05, headY - r * 0.2);
      c.lineTo(cx - r * 1.05, headY - r * 0.2);
      c.fill();
      c.fillStyle = css(s2);
      c.fillRect(cx - r * 0.1, headY - r * 1.35, r * 0.2, r * 1.1);
      c.fillStyle = css(shade(p, 0.9));
      c.fillRect(cx - r * 1.05, headY - r * 0.28, r * 2.1, r * 0.16);
      break;
    }
    case 'fighter': {
      // 短刺发 + 额带
      c.fillStyle = css(hair);
      c.beginPath();
      c.moveTo(cx - r * 0.95, headY - r * 0.2);
      for (let i = 0; i <= 6; i++) {
        const x = cx - r * 0.95 + (i / 6) * r * 1.9;
        c.lineTo(x, headY - r * (i % 2 ? 1.05 : 1.45));
      }
      c.lineTo(cx + r * 0.95, headY - r * 0.2);
      c.quadraticCurveTo(cx, headY - r * 0.75, cx - r * 0.95, headY - r * 0.2);
      c.fill();
      c.fillStyle = css(s2);
      c.fillRect(cx - r * 0.95, headY - r * 0.55, r * 1.9, r * 0.2);
      break;
    }
    case 'assassin': {
      // 面罩遮住下半张脸
      c.fillStyle = css(shade(p, 0.35));
      c.beginPath();
      c.moveTo(cx - r * 0.92, headY + r * 0.25);
      c.lineTo(cx + r * 0.92, headY + r * 0.25);
      c.quadraticCurveTo(cx + r * 0.7, headY + r * 1.1, cx, headY + r * 1.08);
      c.quadraticCurveTo(cx - r * 0.7, headY + r * 1.1, cx - r * 0.92, headY + r * 0.25);
      c.fill();
      c.fillStyle = css(s2);
      for (const side of [-1, 1]) {
        c.beginPath();
        c.ellipse(cx + side * r * 0.36, eyeY, r * 0.05, r * 0.07, 0, 0, Math.PI * 2);
        c.fill();
      }
      break;
    }
    case 'mage': {
      // 刘海 + 额饰宝石
      c.fillStyle = css(hair);
      c.beginPath();
      c.ellipse(cx, headY - r * 0.55, r * 1.0, r * 0.62, 0, Math.PI, 0);
      c.fill();
      c.fillStyle = css(s2);
      c.beginPath();
      c.moveTo(cx, headY - r * 0.7);
      c.lineTo(cx + r * 0.14, headY - r * 0.5);
      c.lineTo(cx, headY - r * 0.3);
      c.lineTo(cx - r * 0.14, headY - r * 0.5);
      c.fill();
      break;
    }
    case 'marksman': {
      // 侧分发 + 羽饰
      c.fillStyle = css(hair);
      c.beginPath();
      c.moveTo(cx - r * 1.0, headY);
      c.quadraticCurveTo(cx - r * 0.9, headY - r * 1.3, cx + r * 0.3, headY - r * 1.1);
      c.quadraticCurveTo(cx + r * 1.1, headY - r * 0.9, cx + r * 0.95, headY - r * 0.1);
      c.quadraticCurveTo(cx + r * 0.2, headY - r * 0.9, cx - r * 1.0, headY);
      c.fill();
      c.fillStyle = css(s2);
      c.beginPath();
      c.ellipse(cx + r * 1.05, headY - r * 0.9, r * 0.18, r * 0.62, 0.6, 0, Math.PI * 2);
      c.fill();
      break;
    }
    default: {
      // 辅助：刘海 + 发间小灯
      c.fillStyle = css(hair);
      c.beginPath();
      c.ellipse(cx, headY - r * 0.55, r * 1.0, r * 0.6, 0, Math.PI, 0);
      c.fill();
      const glow = c.createRadialGradient(cx + r * 0.85, headY - r * 0.75, 1, cx + r * 0.85, headY - r * 0.75, r * 0.6);
      glow.addColorStop(0, 'rgba(255,250,200,1)');
      glow.addColorStop(0.4, css(s2, 0.9));
      glow.addColorStop(1, css(s2, 0));
      c.fillStyle = glow;
      c.beginPath();
      c.arc(cx + r * 0.85, headY - r * 0.75, r * 0.6, 0, Math.PI * 2);
      c.fill();
    }
  }
  // 嘴（刺客被面罩遮住）
  if (def.role !== 'assassin') {
    c.strokeStyle = 'rgba(120,50,40,.8)';
    c.lineWidth = 2;
    c.beginPath();
    c.moveTo(cx - r * 0.18, headY + r * 0.55);
    c.quadraticCurveTo(cx, headY + r * 0.62, cx + r * 0.18, headY + r * 0.55);
    c.stroke();
  }

  const url = cv.toDataURL();
  cache.set(heroId, url);
  return url;
}

/** 圆形头像 HTML（team 决定描边颜色：0 蓝、1 红，其他为金色） */
export function faceHtml(heroId: string, team: number, cls = 'face'): string {
  const border = team === 0 ? '#3fb6ff' : team === 1 ? '#ff5a3c' : '#e8c64a';
  return `<img class="${cls}" src="${portrait(heroId)}" style="border-color:${border}" alt="${getHero(heroId).name}">`;
}
