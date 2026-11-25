// 通用小工具：插值、缓动、确定性随机数、噪声。整片逐帧渲染，任何随机都必须可复现。

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const invLerp = (a, b, x) => clamp((x - a) / (b - a));
export const remap = (x, a, b, c, d) => lerp(c, d, invLerp(a, b, x));
export const smoothstep = (a, b, x) => { const t = invLerp(a, b, x); return t * t * (3 - 2 * t); };
export const fract = (x) => x - Math.floor(x);
export const TAU = Math.PI * 2;

// 缓动函数（输入 0–1）
export const ease = {
  linear: (t) => t,
  inQuad: (t) => t * t,
  outQuad: (t) => 1 - (1 - t) * (1 - t),
  inOutQuad: (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2),
  inCubic: (t) => t * t * t,
  outCubic: (t) => 1 - Math.pow(1 - t, 3),
  inOutCubic: (t) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2),
  outQuart: (t) => 1 - Math.pow(1 - t, 4),
  inQuart: (t) => t * t * t * t,
  inOutQuart: (t) => (t < 0.5 ? 8 * t * t * t * t : 1 - Math.pow(-2 * t + 2, 4) / 2),
  outExpo: (t) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
  inExpo: (t) => (t <= 0 ? 0 : Math.pow(2, 10 * t - 10)),
  inOutExpo: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2),
  outBack: (t, s = 1.70158) => 1 + (s + 1) * Math.pow(t - 1, 3) + s * Math.pow(t - 1, 2),
  inBack: (t, s = 1.70158) => (s + 1) * t * t * t - s * t * t,
  outElastic: (t) => (t <= 0 ? 0 : t >= 1 ? 1 : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * (TAU / 3)) + 1),
  outBounce: (t) => {
    const n = 7.5625, d = 2.75;
    if (t < 1 / d) return n * t * t;
    if (t < 2 / d) return n * (t -= 1.5 / d) * t + 0.75;
    if (t < 2.5 / d) return n * (t -= 2.25 / d) * t + 0.9375;
    return n * (t -= 2.625 / d) * t + 0.984375;
  },
};

// 在 [t0, t1] 区间上按缓动走 0→1，区间外夹住
export const prog = (t, t0, t1, fn = ease.linear) => fn(clamp((t - t0) / (t1 - t0)));

// 进场/出场包络：t0 进、t1 出，各用 fin/fout 秒
export const window01 = (t, t0, t1, fin = 0.2, fout = 0.2) =>
  Math.min(prog(t, t0, t0 + fin, ease.outCubic), 1 - prog(t, t1 - fout, t1, ease.inCubic));

// 确定性随机数（mulberry32）
export function rng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// 整数哈希 → [0,1)
export function hash(n) {
  let x = Math.imul((n | 0) ^ 0x9e3779b9, 0x85ebca6b);
  x ^= x >>> 13; x = Math.imul(x, 0xc2b2ae35); x ^= x >>> 16;
  return (x >>> 0) / 4294967296;
}

// 一维平滑值噪声，周期无关；用来做手抖、轻微晃动
export function noise1(x, seed = 0) {
  const i = Math.floor(x), f = x - i;
  const a = hash(i * 374761393 + seed * 668265263), b = hash((i + 1) * 374761393 + seed * 668265263);
  const u = f * f * (3 - 2 * f);
  return a + (b - a) * u; // 0..1
}
export const snoise1 = (x, seed = 0) => noise1(x, seed) * 2 - 1;

// 阻尼弹簧的解析解：从 0 冲到 1，带回弹（用于“砸下来”的字）
export function spring(t, freq = 4.0, damp = 0.35) {
  if (t <= 0) return 0;
  const w = TAU * freq;
  return 1 - Math.exp(-damp * w * t) * Math.cos(w * Math.sqrt(1 - damp * damp) * t);
}

// 颜色
export const COL = {
  ink: '#16181D', ink2: '#0D0F13', bone: '#F3F0E9', orange: '#EE6A1F', orange2: '#FF8A3D',
  steel: '#8A96A3', cyan: '#5CE1E6', red: '#E5484D', dim: 'rgba(243,240,233,0.55)',
};
export const hex = (s) => parseInt(s.slice(1), 16);
