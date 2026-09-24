/**
 * 二维向量工具。逻辑层单位为“米”，y 轴向下（与屏幕一致）。
 * 函数式风格：默认返回新对象；性能敏感处请直接内联计算。
 */
export interface Vec2 {
  x: number;
  y: number;
}

export const v2 = (x = 0, y = 0): Vec2 => ({ x, y });
export const clone = (a: Vec2): Vec2 => ({ x: a.x, y: a.y });
export const add = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + b.x, y: a.y + b.y });
export const sub = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x - b.x, y: a.y - b.y });
export const scale = (a: Vec2, s: number): Vec2 => ({ x: a.x * s, y: a.y * s });
export const dot = (a: Vec2, b: Vec2): number => a.x * b.x + a.y * b.y;
export const cross = (a: Vec2, b: Vec2): number => a.x * b.y - a.y * b.x;
export const len = (a: Vec2): number => Math.hypot(a.x, a.y);
export const len2 = (a: Vec2): number => a.x * a.x + a.y * a.y;
export const dist = (a: Vec2, b: Vec2): number => Math.hypot(a.x - b.x, a.y - b.y);
export const dist2 = (a: Vec2, b: Vec2): number => {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return dx * dx + dy * dy;
};
export const lerp = (a: Vec2, b: Vec2, t: number): Vec2 => ({
  x: a.x + (b.x - a.x) * t,
  y: a.y + (b.y - a.y) * t,
});

/** 归一化；零向量返回 (0,0) */
export function norm(a: Vec2): Vec2 {
  const l = Math.hypot(a.x, a.y);
  return l > 1e-9 ? { x: a.x / l, y: a.y / l } : { x: 0, y: 0 };
}

/** 朝向角（弧度）→ 单位向量 */
export const fromAngle = (rad: number): Vec2 => ({ x: Math.cos(rad), y: Math.sin(rad) });
export const angleOf = (a: Vec2): number => Math.atan2(a.y, a.x);

export function rotate(a: Vec2, rad: number): Vec2 {
  const c = Math.cos(rad);
  const s = Math.sin(rad);
  return { x: a.x * c - a.y * s, y: a.x * s + a.y * c };
}

/** 把长度截断到 max 以内 */
export function clampLen(a: Vec2, max: number): Vec2 {
  const l = Math.hypot(a.x, a.y);
  return l > max && l > 0 ? { x: (a.x / l) * max, y: (a.y / l) * max } : { x: a.x, y: a.y };
}

/** 角度差归一到 (-π, π] */
export function angleDiff(a: number, b: number): number {
  let d = (b - a) % (Math.PI * 2);
  if (d > Math.PI) d -= Math.PI * 2;
  if (d <= -Math.PI) d += Math.PI * 2;
  return d;
}

/** 角度插值（走最短弧） */
export const lerpAngle = (a: number, b: number, t: number): number => a + angleDiff(a, b) * t;

/** 点 p 到线段 ab 的最近点 */
export function closestPointOnSegment(p: Vec2, a: Vec2, b: Vec2): Vec2 {
  const abx = b.x - a.x;
  const aby = b.y - a.y;
  const l2 = abx * abx + aby * aby;
  if (l2 < 1e-12) return { x: a.x, y: a.y };
  let t = ((p.x - a.x) * abx + (p.y - a.y) * aby) / l2;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  return { x: a.x + abx * t, y: a.y + aby * t };
}

/** 点 p 到线段 ab 的距离平方 */
export function distToSegment2(p: Vec2, a: Vec2, b: Vec2): number {
  const c = closestPointOnSegment(p, a, b);
  return dist2(p, c);
}

export const clamp = (v: number, lo: number, hi: number): number => (v < lo ? lo : v > hi ? hi : v);
