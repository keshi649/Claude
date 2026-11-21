// 着色器共用的 GLSL：哈希、梯度噪声、分形噪声、距离场、色调映射、球体求交、星空。
const GLSL_HEAD = `#version 300 es
precision highp float;
precision highp int;
uniform vec2 uRes;
uniform float uTime;   // 成片里的时刻（秒）
uniform float uLT;     // 这个镜头开始以后的时刻（秒）
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


vec3 rotX(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(p.x, c*p.y - s*p.z, s*p.y + c*p.z); }
vec3 rotY(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(c*p.x + s*p.z, p.y, -s*p.x + c*p.z); }
vec3 rotZ(vec3 p, float a){ float c = cos(a), s = sin(a); return vec3(c*p.x - s*p.y, s*p.x + c*p.y, p.z); }
// 射线和球：返回 (近交点, 远交点)，没交上返回 (-1, -1)
vec2 sphHit(vec3 ro, vec3 rd, vec3 c, float r){
  vec3 oc = ro - c; float b = dot(oc, rd); float h = b*b - (dot(oc, oc) - r*r);
  if (h < 0.) return vec2(-1.); h = sqrt(h); return vec2(-b - h, -b + h);
}
// 太空的星：方向空间里分格，每格最多一颗；两层（亮星稀、暗星密）
vec3 spaceStars(vec3 d, float px){
  vec3 s = vec3(0.);
  for (int L = 0; L < 2; L++){
    float sc = L == 0 ? 90. : 220.;
    vec3 g = d*sc; vec3 c = floor(g), f = fract(g);
    float h = hash13(c + float(L)*41.);
    if (h < (L == 0 ? .35 : .55)){
      vec3 pos = hash33(c + 7.1 + float(L))*.7 + .15;
      float b = L == 0 ? pow(hash13(c + 2.9), 7.)*2.6 + .06 : pow(hash13(c + 5.3), 5.)*.45 + .025;
      vec3 tint = mix(vec3(.72, .82, 1.), vec3(1., .86, .70), hash13(c + 9.9));
      float r = length(f - pos)/(px*sc*1.3 + 1e-4);
      s += tint*b*exp(-r*r);
    }
  }
  return s;
}

vec3 aces(vec3 x){ const float a = 2.51, b = .03, c = 2.43, d = .59, e = .14; return clamp((x*(a*x + b))/(x*(c*x + d) + e), 0., 1.); }
vec3 toSRGB(vec3 c){ c = max(c, 0.); return mix(c*12.92, 1.055*pow(c, vec3(1./2.4)) - .055, step(.0031308, c)); }
float luma(vec3 c){ return dot(c, vec3(.2126, .7152, .0722)); }
`;
