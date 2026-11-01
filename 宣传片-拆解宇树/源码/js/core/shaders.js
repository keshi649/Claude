// 三组着色器：
//   SHOT  —— 一个镜头的合成：三维（HDR、线性）→ 曝光、ACES 色调映射、转 sRGB → 调色 → 盖上字幕层（sRGB）
//   MIX   —— 两个镜头之间的转场（都在显示空间里做，和剪辑软件一致）
//   FINAL —— 整片的“机身”：冲击时的抖动和推近、色散、故障条、暗角、颗粒、闪白、黑场

export const VERT = /* glsl */ `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const COMMON = /* glsl */ `
float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * 0.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float hash11(float p) { p = fract(p * 0.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
`;

export const SHOT_FRAG = /* glsl */ `
uniform sampler2D tScene;
uniform sampler2D tOverlay;
uniform float exposure, saturation, contrast, keepOrange, overlayAlpha, lift;
uniform vec3 tint;
varying vec2 vUv;
${COMMON}
vec3 aces(vec3 x) { const float a = 2.51, b = 0.03, c = 2.43, d = 0.59, e = 0.14; return clamp((x * (a * x + b)) / (x * (c * x + d) + e), 0.0, 1.0); }
vec3 toSrgb(vec3 c) { return mix(12.92 * c, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055, step(0.0031308, c)); }
void main() {
  vec3 col = toSrgb(aces(texture2D(tScene, vUv).rgb * exposure));
  // 调色：饱和度（可只保留橙色）、对比度、提亮暗部、整体色偏
  float l = luma(col);
  vec3 orange = vec3(0.933, 0.416, 0.122);
  float hueMatch = smoothstep(0.80, 0.97, dot(normalize(col + 1e-4), normalize(orange))) * smoothstep(0.05, 0.25, max(col.r - col.b, 0.0));
  float sat = mix(saturation, max(saturation, 1.0), keepOrange * hueMatch);
  col = mix(vec3(l), col, sat);
  col = (col - 0.5) * contrast + 0.5 + lift;
  col *= tint;
  vec4 ov = texture2D(tOverlay, vUv);
  col = mix(col, ov.rgb, ov.a * overlayAlpha);
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;

// 转场类型（MIX_TYPES 的编号要和下面 if 分支一致）
export const MIX_TYPES = { cut: 0, fade: 1, flash: 2, whip: 3, zoom: 4, glitch: 5, slab: 6, iris: 7, pixel: 8, burn: 9, push: 10 };

export const MIX_FRAG = /* glsl */ `
uniform sampler2D tA, tB;
uniform float p, time, seed;
uniform int type;
uniform vec2 dir, center;
uniform vec3 accent;
varying vec2 vUv;
${COMMON}
vec3 A(vec2 uv) { return texture2D(tA, clamp(uv, 0.001, 0.999)).rgb; }
vec3 B(vec2 uv) { return texture2D(tB, clamp(uv, 0.001, 0.999)).rgb; }
// 方向模糊采样
vec3 blurA(vec2 uv, vec2 d) { vec3 s = vec3(0.0); for (int i = 0; i < 16; i++) { float k = float(i) / 15.0 - 0.5; s += A(uv + d * k); } return s / 16.0; }
vec3 blurB(vec2 uv, vec2 d) { vec3 s = vec3(0.0); for (int i = 0; i < 16; i++) { float k = float(i) / 15.0 - 0.5; s += B(uv + d * k); } return s / 16.0; }
vec3 zoomA(vec2 uv, float amt, float sc) { vec3 s = vec3(0.0); vec2 c = center; for (int i = 0; i < 16; i++) { float k = float(i) / 15.0; vec2 q = c + (uv - c) / (sc * (1.0 + amt * k)); s += A(q); } return s / 16.0; }
vec3 zoomB(vec2 uv, float amt, float sc) { vec3 s = vec3(0.0); vec2 c = center; for (int i = 0; i < 16; i++) { float k = float(i) / 15.0; vec2 q = c + (uv - c) / (sc * (1.0 + amt * k)); s += B(q); } return s / 16.0; }
void main() {
  vec2 uv = vUv;
  vec3 col;
  float aspect = 1080.0 / 1920.0;
  if (type == 0) {
    col = p < 0.5 ? A(uv) : B(uv);
  } else if (type == 1) {
    col = mix(A(uv), B(uv), smoothstep(0.0, 1.0, p));
  } else if (type == 2) {
    float f = pow(1.0 - abs(2.0 * p - 1.0), 2.0);
    col = (p < 0.5 ? A(uv) : B(uv)) + vec3(1.0, 0.97, 0.92) * f * 1.2;
  } else if (type == 3) {
    // 甩镜头：A 往 dir 方向甩走，B 从反方向甩进来，中间运动模糊最强
    float e = p < 0.5 ? 4.0 * p * p * p : 1.0 - pow(-2.0 * p + 2.0, 3.0) / 2.0;
    float bl = sin(3.14159 * p) * 0.35;
    if (e < 0.5) col = blurA(uv + dir * e * 2.0 * 0.5, dir * bl);
    else col = blurB(uv - dir * (1.0 - e) * 2.0 * 0.5, dir * bl);
  } else if (type == 4) {
    // 推进：A 放大带径向模糊冲进去，B 从放大状态收回
    if (p < 0.5) { float q = p * 2.0; col = zoomA(uv, q * q * 0.6, 1.0 + q * q * 2.5); }
    else { float q = (1.0 - p) * 2.0; col = zoomB(uv, q * q * 0.6, 1.0 + q * q * 1.5); }
    col += vec3(1.0) * pow(1.0 - abs(2.0 * p - 1.0), 6.0) * 0.6;
  } else if (type == 5) {
    // 故障：横条错位 + RGB 分离，B 一块一块替换 A
    float rows = 28.0;
    float r = floor(uv.y * rows);
    float n = hash11(r * 7.13 + floor(time * 30.0) * 1.37 + seed);
    float k = sin(3.14159 * p);
    float off = (n - 0.5) * 0.25 * k * step(0.45, n);
    vec2 q = uv + vec2(off, 0.0);
    float useB = step(n * 0.8 + 0.1, p);
    float sp = 0.012 * k;
    vec3 a = vec3(A(q + vec2(sp, 0.0)).r, A(q).g, A(q - vec2(sp, 0.0)).b);
    vec3 b = vec3(B(q + vec2(sp, 0.0)).r, B(q).g, B(q - vec2(sp, 0.0)).b);
    col = mix(a, b, useB);
    col += accent * step(0.92, hash12(vec2(r, floor(time * 30.0)))) * k * 0.5;
  } else if (type == 6) {
    // 橙色斜块扫过：块前是 A，块后是 B
    vec2 d = normalize(dir);
    vec2 pp = vec2((uv.x - 0.5) / aspect, uv.y - 0.5);
    float s = dot(pp, d);
    float pos = mix(-1.3, 1.3, p);
    float w = 0.28;
    float edgeA = smoothstep(pos + 0.002, pos - 0.002, s - w * 0.5);
    float inBand = smoothstep(pos - w * 0.5 - 0.002, pos - w * 0.5 + 0.002, s) * smoothstep(pos + w * 0.5 + 0.002, pos + w * 0.5 - 0.002, s);
    col = s > pos + w * 0.5 ? A(uv) : B(uv);
    float stripe = 0.85 + 0.15 * step(0.5, fract((s - pos) * 30.0));
    col = mix(col, accent * stripe, inBand);
    col += accent * 0.6 * smoothstep(0.02, 0.0, abs(s - (pos + w * 0.5)));
  } else if (type == 7) {
    // 圆形展开（光圈），边上一圈亮环
    vec2 pp = vec2((uv.x - center.x) / aspect, uv.y - center.y);
    float d = length(pp);
    float rad = p * p * 1.6;
    col = d < rad ? B(uv) : A(uv);
    col += accent * smoothstep(0.03, 0.0, abs(d - rad)) * (1.0 - p) * 1.5;
  } else if (type == 8) {
    // 马赛克
    float k = sin(3.14159 * p);
    float cells = mix(1080.0, 18.0, pow(k, 0.6));
    vec2 g = vec2(cells, cells / aspect);
    vec2 q = (floor(uv * g) + 0.5) / g;
    col = p < 0.5 ? A(q) : B(q);
  } else if (type == 9) {
    // 烧穿：噪声溶解，边缘发橙光
    float n = hash12(floor(uv * vec2(270.0, 480.0)) + seed) * 0.35 + 0.65 * hash12(floor(uv * vec2(34.0, 60.0)) + seed * 3.1);
    float th = p * 1.2 - 0.1;
    float m = smoothstep(th - 0.05, th + 0.05, n);
    col = mix(B(uv), A(uv), m);
    col += accent * 2.0 * (smoothstep(th - 0.07, th, n) - smoothstep(th, th + 0.07, n));
  } else {
    // 推：A 被 B 推出画面
    float e = p < 0.5 ? 8.0 * p * p * p * p : 1.0 - pow(-2.0 * p + 2.0, 4.0) / 2.0;
    vec2 qa = uv + dir * e;
    vec2 qb = uv + dir * (e - 1.0);
    bool inB = (dot(qb - 0.5, dir) > -0.5 && dot(qb - 0.5, dir) < 0.5);
    col = inB ? B(qb) : A(qa);
  }
  gl_FragColor = vec4(col, 1.0);
}
`;

export const FINAL_FRAG = /* glsl */ `
uniform sampler2D tMix;
uniform float time, frame, chroma, grain, vignette, flash, fade, glitch, zoom, rgbShift, scan;
uniform vec2 shake;
uniform vec3 flashColor;
varying vec2 vUv;
${COMMON}
vec3 S(vec2 uv) { return texture2D(tMix, clamp(uv, 0.0005, 0.9995)).rgb; }
void main() {
  vec2 uv = (vUv - 0.5) / zoom + 0.5 + shake;
  // 故障条：整片冲击时偶尔出现
  if (glitch > 0.0) {
    float r = floor(uv.y * 64.0);
    float n = hash11(r * 3.7 + floor(frame) * 1.31);
    uv.x += (n - 0.5) * 0.08 * glitch * step(0.82, n);
  }
  // 色散：越靠边越强
  vec2 d = (uv - 0.5);
  vec2 ca = d * (chroma * 0.012 + 0.0015) + vec2(rgbShift, 0.0);
  vec3 col = vec3(S(uv + ca).r, S(uv).g, S(uv - ca).b);
  // 暗角
  float v = smoothstep(0.95, 0.25, length(d * vec2(1.0, 0.75)));
  col *= mix(1.0, v, vignette);
  // 扫描线（只在需要的镜头开）
  col *= 1.0 - scan * 0.08 * (0.5 + 0.5 * sin(vUv.y * 1920.0 * 3.14159));
  // 闪白、黑场
  col = mix(col, flashColor, clamp(flash, 0.0, 1.0));
  col *= 1.0 - fade;
  // 颗粒（显示空间，逐帧不同）
  // 颗粒：2×2 像素一格（手机上看是一样的质感，编码器省很多码率）
  float g = hash12(floor(vUv * vec2(540.0, 960.0)) + vec2(frame * 17.13, frame * 3.71)) - 0.5;
  col += g * grain * (0.6 + 0.4 * (1.0 - luma(col)));
  gl_FragColor = vec4(clamp(col, 0.0, 1.0), 1.0);
}
`;
