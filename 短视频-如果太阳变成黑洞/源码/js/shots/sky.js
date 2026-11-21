// 几个镜头共用的天空：银河和星星（HDR，单位随意，靠后期曝光调）。
// px：一个像素对应的天空角度（弧度）。被黑洞放大 / 缩小的地方，用它决定星星的模糊程度和银河的细节层数，免得闪烁。
const SHOTS = {};

// ---- 小向量运算、镜头 ----
const V3 = {
  add: (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]],
  sub: (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]],
  mul: (a, k) => [a[0] * k, a[1] * k, a[2] * k],
  dot: (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2],
  cross: (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]],
  norm: (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; },
  lerp: (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k],
};
function lookAt(pos, target, fovDeg, roll = 0) {
  const f = V3.norm(V3.sub(target, pos));
  let r = V3.norm(V3.cross(f, [0, 1, 0]));
  let u = V3.cross(r, f);
  if (roll) { const c = Math.cos(roll), s = Math.sin(roll); [r, u] = [V3.add(V3.mul(r, c), V3.mul(u, s)), V3.add(V3.mul(r, -s), V3.mul(u, c))]; }
  return { uCamPos: pos, uCamF: f, uCamR: r, uCamU: u, uTanHalf: Math.tan(fovDeg * Math.PI / 360) };
}
// 把世界坐标投到屏幕像素（给叠字用）
function project(cam, P) {
  const rel = V3.sub(P, cam.uCamPos);
  const z = V3.dot(rel, cam.uCamF);
  if (z <= 0) return null;
  const x = V3.dot(rel, cam.uCamR) / (z * cam.uTanHalf * 2), y = V3.dot(rel, cam.uCamU) / (z * cam.uTanHalf * 2);
  return [540 + x * 1920, 960 - y * 1920, z];
}

const SKY_GLSL = `
uniform vec3 uGalN, uGalC;     // 银河面的法线、银心方向

// 银河：一条带子，越靠近银心越宽越亮、越偏暖；带子中间有暗尘带（大暗隙）；星云团用分形噪声
vec3 milky(vec3 D, float px){
  float sl = dot(D, uGalN);
  vec3 ip = D - sl*uGalN; float lip = length(ip);
  vec3 C2 = cross(uGalN, uGalC);
  float lon = atan(dot(ip, C2), dot(ip, uGalC));       // 银经，0 = 银心
  float lat = asin(clamp(sl, -1., 1.));
  float bul = exp(-lon*lon/.55);
  float w = .085 + .11*bul;
  int oc = int(clamp(log2(.5/(max(px, 1e-5)*7.)), 1., 6.));
  float n1 = fbm3N(D*3.5 + 1.7, max(oc - 1, 1));
  float n2 = fbm3N(D*11. + 5.3, max(oc - 2, 1));
  float n3 = oc > 3 ? fbm3N(D*34. + 2.1, oc - 3) : 0.;
  float band = exp(-pow((lat + .025*n1)/w, 2.));
  float lonB = .30 + .70*exp(-lon*lon/2.2);
  float clouds = clamp(.50 + 1.3*n1 + .8*n2 + .9*n3, 0., 2.2);
  float core = exp(-(lon*lon/.035 + lat*lat/.006));
  float lane = exp(-pow((lat - .012 + .03*n2)/(.022 + .02*bul), 2.))*smoothstep(-.2, .25, n1 + .3)*(.5 + .5*exp(-lon*lon/1.2));
  vec3 cWarm = vec3(1., .82, .62), cCool = vec3(.66, .74, .98);
  vec3 col = mix(cCool, cWarm, bul*.85 + .15)*(band*lonB*clouds*.55 + core*1.6);
  col *= 1. - .82*clamp(lane, 0., 1.);
  col += vec3(.75, .45, .55)*.06*band*exp(-pow((lon - .9)/.12, 2.) - pow((lat + .03)/.03, 2.));   // 一小团偏红的星云
  return col*.16;
}
// 星星：方向空间里分格，每格最多一颗；三层（亮星稀、暗星密）。离银河近的地方暗星多一点。
// 像素对应的角度大时（被黑洞压缩），把星星抹开、亮度按面积摊薄，总光量不变。
vec3 starsHQ(vec3 d, float px, float mag){
  vec3 s = vec3(0.);
  float gal = exp(-pow(dot(d, uGalN)/.22, 2.));
  for (int L = 0; L < 3; L++){
    float sc = L == 0 ? 50. : (L == 1 ? 120. : 260.);
    vec3 g = d*sc; vec3 c = floor(g), f = fract(g);
    float h = hash13(c + float(L)*41.);
    float dens = L == 0 ? .16 : (L == 1 ? .20 : .10 + .40*gal);
    if (h < dens){
      vec3 pos = hash33(c + 7.1 + float(L))*.7 + .15;
      float r1 = hash13(c + 2.9 + float(L));
      float b = L == 0 ? pow(r1, 9.)*12. + .10 : (L == 1 ? pow(r1, 7.)*1.0 + .035 : pow(r1, 4.)*.10 + .012);
      float tt = hash13(c + 9.9);
      vec3 tint = tt < .25 ? vec3(.70, .80, 1.) : (tt < .7 ? vec3(1., .96, .90) : (tt < .92 ? vec3(1., .85, .66) : vec3(1., .70, .52)));
      float w = max(px*sc*1.25, 1e-5);
      vec3 dv = f - pos;
      s += tint*b*min(mag, 30.)*exp(-dot(dv, dv)/(w*w));
    }
  }
  return s;
}
vec3 spaceSky(vec3 d, float px, float mag){ return milky(d, px) + starsHQ(d, px, mag)*.9; }
`;
