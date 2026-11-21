// 太空里的两个镜头（示意，距离和大小不按比例）：
//   orbit：贴近地球，地球照样沿着原来的轨道转，轨道中间是黑洞（"不会。地球照样绕着它转"）
//   front：上帝视角看内太阳系：太阳最后发出的光是一个往外跑的球壳，球壳里面已经没有光了；
//          它扫过水星、金星，最后到地球（每个天文单位 500 秒，"8 分 20 秒"）
// 地球贴图：NASA Blue Marble / 夜光 / 海洋 / 云（公有领域，经 three-globe 包分发）。
const EARTH_GLSL = `
uniform sampler2D uDay, uNightT, uWater, uClouds;
uniform float uEarthRot;
vec2 earthUV(vec3 n){
  vec3 nl = rotY(n, -uEarthRot);
  return vec2(.5 + atan(nl.x, nl.z)/TAU, .5 - asin(clamp(nl.y, -1., 1.))/PI);
}
// n：地面法线；V：指向镜头；L：指向光源；lit：光还在不在（0 = 太阳光已经没了）
vec3 earthShade(vec3 n, vec3 V, vec3 L, float lod, float lit){
  vec2 uv = earthUV(n);
  vec3 day = pow(textureLod(uDay, uv, lod).rgb, vec3(2.2));
  vec3 nite = pow(textureLod(uNightT, uv, lod).rgb, vec3(2.2));
  float sea = textureLod(uWater, uv, max(lod - 1.36, 0.)).r;
  float cl = textureLod(uClouds, uv + vec2(uTime*.0015, 0.), lod).a;
  float ndl = dot(n, L);
  float l = max(ndl, 0.)*lit;
  vec3 col = day*l*1.55;
  col = mix(col, vec3(.95, .97, 1.)*l*1.65, cl*.85);
  col += nite*vec3(1., .78, .5)*(1. - lit*smoothstep(-.18, .08, ndl))*(1. - cl*.7)*1.1;
  vec3 h = normalize(L + V);
  col += vec3(1., .95, .85)*sea*(1. - cl)*pow(max(dot(n, h), 0.), 300.)*.28*step(0., ndl)*lit;
  float mu = max(dot(n, V), 0.);
  col += vec3(.22, .48, 1.)*pow(1. - mu, 2.6)*(.08 + .9*smoothstep(-.25, .45, ndl))*.85*lit;
  return col;
}
vec3 atmoHalo(vec3 ro, vec3 rd, vec3 c, float R, vec3 L, float lit){
  vec3 o = ro - c;
  float b = dot(-o, rd);
  if (b < 0.) return vec3(0.);
  vec3 cp = o + rd*b;
  float d = length(cp)/R;
  if (d < 1.) return vec3(0.);
  float l = smoothstep(-.35, .5, dot(normalize(cp), L))*lit;
  return vec3(.25, .52, 1.)*exp(-(d - 1.)/.016)*.9*l + vec3(.2, .4, 1.)*exp(-(d - 1.)/.06)*.12*l;
}
`;

// ---- 镜头 1：贴近地球（单位：地球半径；轨道半径压缩成 30） ----
const ORBIT_FS = GLSL_HEAD + GLSL_COMMON + SKY_GLSL + EARTH_GLSL + `
uniform vec3 uCamPos, uCamR, uCamU, uCamF, uEarth;
uniform float uTanHalf, uOrbR, uLight, uSkyI, uTrailA;
void main(){
  vec2 p = (gl_FragCoord.xy - .5*uRes)/uRes.y;
  vec3 ro = uCamPos;
  vec3 rd = normalize(uCamF + p.x*2.*uTanHalf*uCamR + p.y*2.*uTanHalf*uCamU);
  float px = 2.*uTanHalf/uRes.y;
  vec3 col = spaceSky(rd, px, 1.)*uSkyI;
  vec3 L = normalize(-uEarth);
  // 黑洞（示意）：一个小黑点，外面一圈被弯折的星光
  vec3 bd = normalize(-ro);
  float ga = acos(clamp(dot(rd, bd), -1., 1.));
  float r0 = .0075;
  col *= smoothstep(r0*.95, r0*1.05, ga);
  col += vec3(1., .9, .75)*(exp(-pow((ga - r0*1.25)/(r0*.12), 2.))*.9 + exp(-max(ga - r0, 0.)/(r0*1.2))*.10)*step(r0, ga);
  // 地球
  vec2 eh = sphHit(ro, rd, uEarth, 1.);
  float tE = eh.x > 0. ? eh.x : 1e9;
  if (eh.x > 0.){
    vec3 P = ro + rd*eh.x;
    vec3 n = normalize(P - uEarth);
    float foot = eh.x*px/max(dot(n, -rd), .15);
    col = earthShade(n, -rd, L, log2(max(foot*4096./TAU, 1.)), uLight);
  } else col += atmoHalo(ro, rd, uEarth, 1., L, uLight);
  // 轨道：赤道面（y = 0）上半径 uOrbR 的细线；地球身后一段更亮（走过的路）
  if (abs(rd.y) > 1e-5){
    float tp = -ro.y/rd.y;
    if (tp > 0. && tp < tE){
      vec3 H = ro + rd*tp;
      float r = length(H.xz);
      float w = px*tp*1.3;
      float ln = exp(-pow((r - uOrbR)/w, 2.));
      float ae = atan(uEarth.z, uEarth.x), ah = atan(H.z, H.x);
      float behind = mod(ae - ah + TAU, TAU);          // 从地球往回数的角度
      float trail = exp(-behind/.9)*uTrailA;
      float dash = mix(.55, 1., step(.5, fract(ah*60./TAU - uTime*.8)));
      col += vec3(.70, .82, 1.)*ln*(.35*dash + 1.3*trail);
      col += vec3(.5, .65, 1.)*exp(-abs(r - uOrbR)/(w*7.))*(.03 + .10*trail);
    }
  }
  fragColor = vec4(col, 1.);
}
`;
const ORB_R = 30;
const spaceTex = () => ({ uDay: TEX.day, uNightT: TEX.night, uWater: TEX.water, uClouds: TEX.clouds });
const SPACE_POST = { exposure: 1.25, thr: .85, bloom1: .35, bloom2: .45, sigma1: 5, sigma2: 9, grain: .03, vig: .40, contrast: 1.06, sat: 1.05,
                     shadowTint: [-.004, .002, .012], highTint: [.010, .004, -.006], lift: [.003, .005, .012] };
const GAL_ORBIT = { uGalN: V3.norm([.2, .5, .84]), uGalC: V3.norm([-.9, .1, .2]) };
function earthAng(t) { return .9 + .045 * t; }
function camOrbit(t, lt) {
  const a = earthAng(t);
  const E = [ORB_R * Math.cos(a), 0, ORB_R * Math.sin(a)];
  const rr = [Math.cos(a), 0, Math.sin(a)], tt = [-Math.sin(a), 0, Math.cos(a)];
  const k = easeOut(clamp01(lt / 3));
  // 在地球外侧、上方、稍微靠后：地球是一弯亮边（亮的一面朝着黑洞，阳光还在路上），黑洞在它上方远处
  const pos = V3.add(E, V3.add(V3.add(V3.mul(rr, lerp(6.4, 5.8, k)), [0, lerp(3.9, 3.6, k), 0]), V3.mul(tt, lerp(-2.2, -1.6, k))));
  const de = V3.norm(V3.sub(E, pos)), db = V3.norm(V3.mul(pos, -1));
  const dc = V3.norm(V3.lerp(de, db, .44));
  return Object.assign(lookAt(pos, V3.add(pos, dc), 60, .03), { E });
}
SHOTS.orbit = {
  fs: ORBIT_FS, textures: spaceTex,
  uniforms(t, lt) {
    const c = camOrbit(t, lt);
    return Object.assign({}, c, GAL_ORBIT, { uEarth: c.E, uOrbR: ORB_R, uLight: 1, uSkyI: .9, uTrailA: smooth(.1, .8, lt), uEarthRot: 2.2 + t * .05 });
  },
  post: SPACE_POST,
  overlay(t, lt) {
    const cam = camOrbit(t, lt);
    const b = project(cam, [0, 0, 0]);
    const a = smooth(.15, .5, lt);
    if (b) OV.text('黑洞', b[0], b[1] - 40, { size: 32, weight: 500, alpha: a * .85 });
    OV.source('示意：距离和大小不按比例', a);
    // "不会。"大字 + 小字
    const t0 = S('h2');
    const k = smooth(t0 - .02, t0 + .12, t) * (1 - smooth(S('h3') - .25, S('h3'), t));
    OV.text('不会。', 540, 330, { weight: 700, size: 150, spacing: 10, alpha: k, shadow: 44, shadowColor: 'rgba(0,0,0,.85)', scale: 1 + .12 * (1 - easeOut((t - t0) / .3)) });
    const k2 = smooth(CH('h2', 1) - .05, CH('h2', 1) + .2, t) * (1 - smooth(S('h3') - .25, S('h3'), t));
    OV.text('地球照样绕着它转', 540, 440, { weight: 600, size: 58, spacing: 6, alpha: k2, shadow: 26 });
  },
};

// ---- 镜头 2：上帝视角（单位：天文单位 AU；行星放大了很多倍） ----
const FRONT_FS = GLSL_HEAD + GLSL_COMMON + SKY_GLSL + EARTH_GLSL + `
uniform vec3 uCamPos, uCamR, uCamU, uCamF;
uniform float uTanHalf, uRho, uSkyI;
uniform vec4 uPl[3];          // 水星、金星、地球：位置 xyz + 显示半径
uniform vec3 uPlLit;          // 每颗行星还有没有光（球壳过了就 0）
const vec3 ORB = vec3(.387, .723, 1.);

// 还有阳光的空间（球壳外面）淡淡的暖色雾：按 1/r² 衰减，沿视线积分
float hazeAlong(vec3 ro, vec3 rd, float tMax){
  vec2 h = sphHit(ro, rd, vec3(0.), 1.75);
  if (h.y <= 0.) return 0.;
  float a = max(h.x, 0.), b = min(h.y, tMax);
  float s = 0.; float dt = (b - a)/24.;
  for (int i = 0; i < 24; i++){
    vec3 P = ro + rd*(a + (float(i) + .5)*dt);
    float r = length(P);
    float dens = 1./(r*r + .10)*smoothstep(uRho - .004, uRho + .012, r)*(1. - smoothstep(.85, 1.7, r));
    dens *= .8 + .4*smoothstep(.3, .0, abs(P.y))*.5;
    s += dens*dt;
  }
  return s;
}
vec3 planetCol(int i, vec3 n, vec3 V, vec3 L, float lod, float lit){
  if (i == 2) return earthShade(n, V, L, lod, lit);
  float ndl = max(dot(n, L), 0.)*lit;
  vec3 alb;
  if (i == 0){ float m = fbm3N(n*5. + 2., 5); alb = vec3(.55, .52, .50)*(.75 + .5*m); }
  else { float m = fbm3N(vec3(n.x*2., n.y*6., n.z*2.) + 5., 4); alb = vec3(.95, .85, .62)*(.85 + .3*m); }
  float mu = max(dot(n, V), 0.);
  return alb*ndl*1.4 + (i == 1 ? vec3(1., .9, .7)*pow(1. - mu, 3.)*.15*lit : vec3(0.));
}
void main(){
  vec2 p = (gl_FragCoord.xy - .5*uRes)/uRes.y;
  vec3 ro = uCamPos;
  vec3 rd = normalize(uCamF + p.x*2.*uTanHalf*uCamR + p.y*2.*uTanHalf*uCamU);
  float px = 2.*uTanHalf/uRes.y;
  vec3 col = spaceSky(rd, px, 1.)*uSkyI;
  // 行星
  float tHit = 1e9; int hi = -1;
  for (int i = 0; i < 3; i++){
    vec2 h = sphHit(ro, rd, uPl[i].xyz, uPl[i].w);
    if (h.x > 0. && h.x < tHit){ tHit = h.x; hi = i; }
  }
  // 还亮着的空间：暖色雾
  col += vec3(1., .80, .52)*hazeAlong(ro, rd, tHit)*.0065;
  // 球壳（最后一束光）：视线穿过薄壳的路程越长越亮，边缘最亮
  float b = dot(-ro, rd); vec3 cp = ro + rd*b; float d = length(cp);
  if (uRho > .01 && d < uRho && b > 0.){
    float chord = sqrt(max(uRho*uRho - d*d, 1e-6));
    float w = .006;
    float path = min(2.*w*uRho/max(chord, .02*uRho), 1.2);
    if (b - chord < tHit) col += vec3(1., .86, .62)*path*.55;
  }
  // 轨道线（y = 0 平面）
  if (abs(rd.y) > 1e-5){
    float tp = -ro.y/rd.y;
    if (tp > 0. && tp < tHit){
      vec3 H = ro + rd*tp; float r = length(H.xz);
      float w = px*tp*1.2;
      for (int i = 0; i < 3; i++){
        float ln = exp(-pow((r - ORB[i])/w, 2.));
        float on = smoothstep(uRho - .01, uRho + .01, r);
        col += mix(vec3(.30, .34, .42), vec3(.75, .80, .95), on)*ln*(i == 2 ? .55 : .35);
      }
      // 球壳和轨道面交出来的那一圈，最亮
      col += vec3(1., .88, .66)*exp(-pow((r - uRho)/(w*1.6), 2.))*.7*step(.01, uRho);
    }
  }
  // 中间的黑洞（示意）
  vec3 bd = normalize(-ro);
  float ga = acos(clamp(dot(rd, bd), -1., 1.));
  float r0 = .006;
  col *= smoothstep(r0*.95, r0*1.05, ga);
  col += vec3(1., .9, .75)*exp(-pow((ga - r0*1.25)/(r0*.15), 2.))*.6*step(r0, ga);
  if (hi >= 0){
    vec3 P = ro + rd*tHit; vec3 c = uPl[hi].xyz; float R = uPl[hi].w;
    vec3 n = normalize(P - c);
    float foot = tHit*px/max(dot(n, -rd), .15)/R;
    float lit = hi == 0 ? uPlLit.x : (hi == 1 ? uPlLit.y : uPlLit.z);
    col = planetCol(hi, n, -rd, normalize(-c), log2(max(foot*4096./TAU, 1.)), lit);
  }
  for (int i = 0; i < 3; i++){
    if (i != 2) continue;
    if (hi != 2) col += atmoHalo(ro, rd, uPl[2].xyz, uPl[2].w, normalize(-uPl[2].xyz), uPlLit.z)*.8;
  }
  fragColor = vec4(col, 1.);
}
`;

// 故事里的时间（秒，从太阳变成黑洞那一刻算）：倒计时 = 500 - T；光每 500 秒走 1 个天文单位
// 关键帧：倒计时出现时 0；水星（0.387 AU）在"水星黑了"变黑；金星（0.723 AU）在"金星黑了"；倒计时到 0 时天黑
const STORY = {
  keys() {
    if (this._k) return this._k;
    this._k = [
      [EN('h3') + .15, 0],
      [SS('front'), 52],
      [CH('f2', 1) + .12, .387 * 500],
      [CH('f2', 2) + .12, .723 * 500],
      [SE('front'), 497],
      [SE('zero'), 500],
    ];
    return this._k;
  },
  T(t) {
    const k = this.keys();
    if (t <= k[0][0]) return 0;
    for (let i = 1; i < k.length; i++) if (t <= k[i][0]) return lerp(k[i - 1][1], k[i][1], (t - k[i - 1][0]) / (k[i][0] - k[i - 1][0]));
    return 500;
  },
  left(t) { return Math.max(0, 500 - this.T(t)); },
  // 最后 3 秒按整秒跳（00:03、00:02、00:01、00:00）；之前快进，按真实的秒数显示
  label(t) {
    const L = this.left(t);
    const s = t >= SE('front') ? Math.ceil(L - 1e-6) : Math.round(L);
    return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0');
  },
};
const PLANETS = [
  { name: '水星', r: .387, ang: 2.15, R: .030 },
  { name: '金星', r: .723, ang: 1.02, R: .050 },
  { name: '地球', r: 1.0, ang: 1.48, R: .056 },
];
function plPos(p, t) { const a = p.ang + .004 * t / p.r; return [p.r * Math.cos(a), 0, p.r * Math.sin(a)]; }
function camFront(t, lt) {
  const k = easeInOut(clamp01((t - SS('front')) / (SE('front') - SS('front'))));
  const az = lerp(1.30, 1.46, k), el = lerp(1.0, .92, k), dist = lerp(2.6, 2.45, k);     // 黑洞一直在倒计时下面（y≈600），地球在字幕上面
  const pos = [Math.cos(az) * Math.cos(el) * dist, Math.sin(el) * dist, Math.sin(az) * Math.cos(el) * dist];
  return lookAt(pos, [.04, 0, lerp(.50, .52, k)], 54, 0);
}
SHOTS.front = {
  fs: FRONT_FS, textures: spaceTex,
  uniforms(t, lt) {
    const cam = camFront(t, lt);
    const rho = STORY.T(t) / 500;
    const pl = PLANETS.map((p) => plPos(p, t));
    const lit = PLANETS.map((p, i) => 1 - smooth(p.r - .004, p.r + .010, rho));
    return Object.assign({}, cam, GAL_ORBIT, { uRho: rho, uSkyI: .9, uEarthRot: 1.4 + t * .08,
      uPl: [].concat(...pl.map((q, i) => [q[0], q[1], q[2], PLANETS[i].R])), uPlLit: lit });
  },
  post: SPACE_POST,
  overlay(t, lt) {
    const cam = camFront(t, lt);
    const rho = STORY.T(t) / 500;
    const a = smooth(.1, .45, lt);
    PLANETS.forEach((p) => {
      const q = project(cam, plPos(p, t));
      if (!q) return;
      const dark = smooth(p.r - .004, p.r + .010, rho);
      const rpx = p.R / q[2] / (2 * cam.uTanHalf) * 1920;
      OV.text(p.name, q[0], q[1] - rpx - 22, { size: 34, weight: 600, alpha: a * lerp(.95, .55, dark), color: dark > .5 ? [170, 180, 200] : [255, 236, 205] });
    });
    const b = project(cam, [0, 0, 0]);
    if (b) OV.text('黑洞', b[0], b[1] - 34, { size: 28, weight: 500, alpha: a * .8 });
    OV.source(['示意：距离和大小不按比例', '光走 1 个天文单位约 500 秒'], a);
  },
};
