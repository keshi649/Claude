// 各个画风共用的 GLSL：哈希、梯度噪声、分形噪声、距离场、色调映射。
const GLSL_HEAD = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uRes;
uniform float uTime;
out vec4 fragColor;
#define PI 3.14159265
#define TAU 6.28318531
`;

const GLSL_COMMON = `
float hash11(float p){ p = fract(p*.1031); p *= p + 33.33; p *= p + p; return fract(p); }
float hash12(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*.1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y)*p3.z); }
vec2 hash22(vec2 p){ vec3 p3 = fract(vec3(p.xyx)*vec3(.1031,.1030,.0973)); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.xx + p3.yz)*p3.zy); }
float hash13(vec3 p3){ p3 = fract(p3*.1031); p3 += dot(p3, p3.zyx + 31.32); return fract((p3.x + p3.y)*p3.z); }
vec3 hash33(vec3 p3){ p3 = fract(p3*vec3(.1031,.1030,.0973)); p3 += dot(p3, p3.yxz + 33.33); return fract((p3.xxy + p3.yxx)*p3.zyx); }

// 梯度噪声，约 [-0.7, 0.7]
float gnoise(vec2 p){
  vec2 i = floor(p), f = fract(p);
  vec2 u = f*f*f*(f*(f*6. - 15.) + 10.);
  float a = dot(hash22(i)*2. - 1., f);
  float b = dot(hash22(i + vec2(1,0))*2. - 1., f - vec2(1,0));
  float c = dot(hash22(i + vec2(0,1))*2. - 1., f - vec2(0,1));
  float d = dot(hash22(i + vec2(1,1))*2. - 1., f - vec2(1,1));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float gnoise3(vec3 p){
  vec3 i = floor(p), f = fract(p);
  vec3 u = f*f*f*(f*(f*6. - 15.) + 10.);
  float n000 = dot(hash33(i)*2. - 1., f);
  float n100 = dot(hash33(i + vec3(1,0,0))*2. - 1., f - vec3(1,0,0));
  float n010 = dot(hash33(i + vec3(0,1,0))*2. - 1., f - vec3(0,1,0));
  float n110 = dot(hash33(i + vec3(1,1,0))*2. - 1., f - vec3(1,1,0));
  float n001 = dot(hash33(i + vec3(0,0,1))*2. - 1., f - vec3(0,0,1));
  float n101 = dot(hash33(i + vec3(1,0,1))*2. - 1., f - vec3(1,0,1));
  float n011 = dot(hash33(i + vec3(0,1,1))*2. - 1., f - vec3(0,1,1));
  float n111 = dot(hash33(i + vec3(1,1,1))*2. - 1., f - vec3(1,1,1));
  return mix(mix(mix(n000, n100, u.x), mix(n010, n110, u.x), u.y),
             mix(mix(n001, n101, u.x), mix(n011, n111, u.x), u.y), u.z);
}
const mat2 ROT = mat2(1.6, 1.2, -1.2, 1.6);
float fbmN(vec2 p, int oct){ float s = 0., a = .5; for (int i = 0; i < 9; i++){ if (i >= oct) break; s += a*gnoise(p); p = ROT*p + vec2(17.1, 9.3); a *= .5; } return s; }
float fbm(vec2 p){ return fbmN(p, 6); }
float fbm3N(vec3 p, int oct){ float s = 0., a = .5; for (int i = 0; i < 8; i++){ if (i >= oct) break; s += a*gnoise3(p); p = p*2.02 + vec3(17.1, 3.7, 9.2); a *= .5; } return s; }
float ridged(vec2 p, int oct){ float s = 0., a = .5; for (int i = 0; i < 8; i++){ if (i >= oct) break; float n = 1. - abs(gnoise(p)*1.5); s += a*n*n; p = ROT*p + vec2(3.3, 7.7); a *= .5; } return s; }

float sdSeg(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; float h = clamp(dot(pa, ba)/dot(ba, ba), 0., 1.); return length(pa - ba*h); }
float segT(vec2 p, vec2 a, vec2 b){ vec2 pa = p - a, ba = b - a; return clamp(dot(pa, ba)/dot(ba, ba), 0., 1.); }
// 两端粗细不同的胶囊
float sdTaper(vec2 p, vec2 a, vec2 b, float ra, float rb){ float h = segT(p, a, b); return length(p - mix(a, b, h)) - mix(ra, rb, h); }
float sdEllipse(vec2 p, vec2 c, vec2 r){ return (length((p - c)/r) - 1.)*min(r.x, r.y); }
float sdBox(vec2 p, vec2 c, vec2 b){ vec2 d = abs(p - c) - b; return length(max(d, 0.)) + min(max(d.x, d.y), 0.); }

vec3 aces(vec3 x){ const float a = 2.51, b = .03, c = 2.43, d = .59, e = .14; return clamp((x*(a*x + b))/(x*(c*x + d) + e), 0., 1.); }
vec3 toSRGB(vec3 c){ c = max(c, 0.); return mix(c*12.92, 1.055*pow(c, vec3(1./2.4)) - .055, step(.0031308, c)); }
float luma(vec3 c){ return dot(c, vec3(.2126, .7152, .0722)); }
`;
