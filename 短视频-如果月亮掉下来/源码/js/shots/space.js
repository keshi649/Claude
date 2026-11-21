// 太空里的三个镜头：月亮一圈圈往里绕（orbit）→ 到洛希极限被扯长、裂开、碎掉（breakup）→ 碎块铺成地球的光环（ringSpace）。
// 单位：地球半径。地球在原点，北极朝 +Y，光环在赤道面（y = 0）。洛希极限（流体）18,381 km = 2.885 个地球半径。
// 地球贴图：NASA Blue Marble / 夜光 / 海洋 / 云（公有领域，经 three-globe 包分发）。
const ROCHE = 18381 / 6371;

const SPACE_FS = GLSL_HEAD + GLSL_COMMON + `
uniform vec3 uCamPos, uCamR, uCamU, uCamF, uSun, uMoonPos;
uniform float uTanHalf, uEarthRot, uMoonRad, uStretch, uCrack, uMoonVis;
uniform float uRingOp, uRingArc, uRingCenter, uRoche, uRocheHot, uSpiral, uSpiralEnd, uSpiralTurns, uSpiralR0, uSpiralR1, uFlash;
uniform sampler2D uDay, uNightT, uWater, uClouds;

vec2 earthUV(vec3 n){
  vec3 nl = rotY(n, -uEarthRot);
  return vec2(.5 + atan(nl.x, nl.z)/TAU, .5 - asin(clamp(nl.y, -1., 1.))/PI);
}
float ringDensity(float r, float ang){
  if (r < 1.95 || r > 2.82) return 0.;
  float prof = smoothstep(1.95, 2.08, r)*(1. - smoothstep(2.62, 2.80, r));
  float bands = .22 + .78*pow(clamp(fbmN(vec2(r*30., .5), 4)*1.3 + .5, 0., 1.), 1.5);
  bands *= .88 + .12*clamp(fbmN(vec2(r*120., 3.5), 3)*1.5 + .5, 0., 1.);
  float gap = (1. - .95*exp(-pow((r - 2.40)/.018, 2.)))*(1. - .70*exp(-pow((r - 2.13)/.008, 2.)));
  float da = abs(mod(ang - uRingCenter + PI, TAU) - PI);
  float arc = uRingArc >= 3.1 ? 1. : 1. - smoothstep(uRingArc*.7, uRingArc, da);
  float clump = mix(1., .55 + .9*fbmN(vec2(ang*6., r*8.), 4), smoothstep(3.1, 1., uRingArc));
  return prof*bands*gap*arc*max(clump, 0.)*uRingOp;
}
// 光环挡住太阳：地面上某点到太阳的路上穿过光环多少
float ringShadow(vec3 P){
  if (uRingOp <= 0. || abs(uSun.y) < 1e-3) return 1.;
  float t = -P.y/uSun.y;
  if (t <= 0.) return 1.;
  vec3 Q = P + t*uSun;
  return 1. - .85*clamp(ringDensity(length(Q.xz), atan(Q.z, Q.x))*1.4, 0., 1.);
}
vec3 earthShade(vec3 P, vec3 V, float lod){
  vec3 n = normalize(P);
  vec2 uv = earthUV(n);
  vec3 day = pow(textureLod(uDay, uv, lod).rgb, vec3(2.2));
  vec3 nite = pow(textureLod(uNightT, uv, lod).rgb, vec3(2.2));
  float sea = textureLod(uWater, uv, max(lod - 1.36, 0.)).r;
  float cl = textureLod(uClouds, uv + vec2(uTime*.0015, 0.), lod).a;      // 云量在透明通道里
  float ndl = dot(n, uSun);
  float sh = ringShadow(P);
  float lit = max(ndl, 0.)*sh;
  vec3 col = day*lit*1.55;
  col = mix(col, vec3(.95, .97, 1.)*lit*1.65, cl*.85);
  col += nite*vec3(1., .78, .5)*(1. - smoothstep(-.18, .08, ndl))*(1. - cl*.7)*1.1;
  vec3 h = normalize(uSun + V);
  col += vec3(1., .95, .85)*sea*(1. - cl)*pow(max(dot(n, h), 0.), 300.)*.28*step(0., ndl)*sh;
  float mu = max(dot(n, V), 0.);
  col += vec3(.22, .48, 1.)*pow(1. - mu, 2.6)*(.08 + .9*smoothstep(-.25, .45, ndl))*.85;
  return col;
}
vec3 atmoHalo(vec3 ro, vec3 rd){
  float b = dot(-ro, rd);
  if (b < 0.) return vec3(0.);
  vec3 cp = ro + rd*b;
  float d = length(cp);
  if (d < 1.) return vec3(0.);
  float lit = smoothstep(-.35, .5, dot(normalize(cp), uSun));
  return vec3(.25, .52, 1.)*exp(-(d - 1.)/.016)*.9*lit + vec3(.2, .4, 1.)*exp(-(d - 1.)/.06)*.12*lit;
}

// 月亮（可被拉长的椭球）：返回 (颜色, 距离)；没打中距离 < 0
vec4 moonHit(vec3 ro, vec3 rd){
  if (uMoonVis <= 0.) return vec4(0., 0., 0., -1.);
  vec3 a = normalize(-uMoonPos);                     // 指向地球
  vec3 b = normalize(cross(a, vec3(0., 1., 0.)));
  vec3 c = cross(b, a);
  float s = uStretch;
  vec3 sc = vec3(uMoonRad*s, uMoonRad/sqrt(s), uMoonRad/sqrt(s));
  vec3 o = ro - uMoonPos;
  vec3 lo = vec3(dot(o, a), dot(o, b), dot(o, c))/sc;
  vec3 ld = vec3(dot(rd, a), dot(rd, b), dot(rd, c))/sc;
  float A = dot(ld, ld), B = dot(lo, ld), C = dot(lo, lo) - 1.;
  float h = B*B - A*C;
  if (h < 0.) return vec4(0., 0., 0., -1.);
  float t = (-B - sqrt(h))/A;
  if (t < 0.) return vec4(0., 0., 0., -1.);
  vec3 lp = lo + ld*t;                                 // 单位球上的点
  vec3 gn = lp/sc;                                     // 椭球法线（局部）
  vec3 n = normalize(gn.x*a + gn.y*b + gn.z*c);
  vec3 sp = lp;
  float m = fbm3N(sp*1.6 + vec3(3.1, 1.7, .4), 5);
  float alb = mix(1., .52, smoothstep(-.07, .09, m))*(.84 + .30*(fbm3N(sp*6.5 + 4.2, 4) + .35));
  // 小坑
  vec3 P = sp*9.; vec3 ip = floor(P), fp = fract(P); float best = 1e9;
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
    vec3 g = vec3(float(x), float(y), float(z)); vec3 v = g + hash33(ip + g) - fp; best = min(best, dot(v, v));
  }
  alb *= .86 + .14*smoothstep(.02, .12, best);
  float diff = max(dot(n, uSun), 0.);
  vec3 col = vec3(.98, .95, .90)*alb*(.008 + 1.45*diff);
  // 裂缝：三维泰森多边形的边，越裂越宽，透出一点暗红
  if (uCrack > 0.){
    vec3 Q = sp*3.2 + 11.; vec3 iq = floor(Q), fq = fract(Q);
    float d1 = 1e9, d2 = 1e9;
    for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
      vec3 g = vec3(float(x), float(y), float(z)); vec3 v = g + hash33(iq + g + 3.) - fq; float dd = dot(v, v);
      if (dd < d1){ d2 = d1; d1 = dd; } else if (dd < d2) d2 = dd;
    }
    float edge = sqrt(d2) - sqrt(d1);
    float w = .02 + .12*uCrack;
    float crack = 1. - smoothstep(w*.4, w, edge);
    col = mix(col, vec3(.004), crack*smoothstep(0., .3, uCrack));
    col += vec3(1., .35, .08)*crack*uCrack*uCrack*.9*(1. - smoothstep(0., w*.5, edge));
  }
  return vec4(col, t);
}

void main(){
  vec2 p = (gl_FragCoord.xy - .5*uRes)/uRes.y;
  vec3 ro = uCamPos;
  vec3 rd = normalize(uCamF + p.x*2.*uTanHalf*uCamR + p.y*2.*uTanHalf*uCamU);
  float px = 2.*uTanHalf/uRes.y;
  vec3 col = spaceStars(rd, px)*.9;
  // 银河淡淡一条
  float mw = exp(-pow(dot(rd, normalize(vec3(.3, .8, -.5)))/.22, 2.));
  col += vec3(.040, .042, .055)*mw*(.5 + fbm3N(rd*4. + 2., 4));
  vec2 eh = sphHit(ro, rd, vec3(0.), 1.);
  float tE = eh.x > 0. ? eh.x : 1e9;
  if (eh.x > 0.){
    float foot = eh.x*px/max(dot(normalize(ro + rd*eh.x), -rd), .15);       // 一个像素在地面上多宽（地球半径）
    col = earthShade(ro + rd*eh.x, -rd, log2(max(foot*4096./TAU, 1.)));
  }
  else col += atmoHalo(ro, rd);

  // 赤道面上的东西：光环、洛希极限的虚线圈、月亮走过的螺旋
  if (abs(rd.y) > 1e-5){
    float tp = -ro.y/rd.y;
    if (tp > 0. && tp < tE){
      vec3 H = ro + rd*tp;
      float r = length(H.xz), ang = atan(H.z, H.x);
      float dens = ringDensity(r, ang);
      if (dens > 0.){
        float a = 1. - exp(-dens*.45/max(abs(rd.y), .06));
        float hs = dot(H, uSun);
        float lit = hs > 0. ? 1. : smoothstep(.97, 1.03, length(H - hs*uSun));
        vec3 tint = mix(vec3(1., .90, .76), vec3(.92, .94, 1.), clamp(fbmN(vec2(r*9., 8.), 3)*1.5 + .5, 0., 1.));
        float face = abs(uSun.y)*1.0 + .08;
        vec3 rc = tint*vec3(.95, .92, .88)*(.010 + .80*lit*face)*(.65 + .45*dens);
        float glint = pow(hash12(floor(vec2(ang*2400., r*900.))), 60.)*3.;
        col = mix(col, rc*(1. + glint), a);
      }
      // 洛希极限：虚线圈，越过时发热变金
      if (uRoche > 0.){
        float w = px*tp*1.6;
        float dash = step(.45, fract(ang*24./TAU + uTime*.15));
        float ln = exp(-pow((r - ${ROCHE.toFixed(4)})/w, 2.))*dash;
        col += mix(vec3(.75, .85, 1.), vec3(1., .78, .40), uRocheHot)*ln*uRoche*(1.2 + 1.5*uRocheHot);
      }
      // 月亮绕进来的螺旋
      if (uSpiral > 0.){
        float best = 1e9, fade = 0.;
        for (int k = 0; k < 6; k++){
          float ph = mod(uSpiralEnd - ang, TAU) + TAU*float(k);     // 从月亮现在的位置往回数的角度
          if (ph > uSpiralTurns*TAU) break;
          float rs = mix(uSpiralR1, uSpiralR0, ph/(uSpiralTurns*TAU));
          float dd = abs(r - rs);
          if (dd < best){ best = dd; fade = 1. - ph/(uSpiralTurns*TAU); }
        }
        float w = px*tp*1.8;
        col += vec3(.65, .80, 1.)*exp(-pow(best/w, 2.))*fade*uSpiral*.85;
        col += vec3(.45, .6, 1.)*exp(-best/(w*6.))*fade*uSpiral*.12;
      }
    }
  }
  vec4 mh = moonHit(ro, rd);
  if (mh.w > 0. && mh.w < tE) col = mix(col, mh.rgb, uMoonVis);
  if (uFlash > 0.){
    float ga = acos(clamp(dot(rd, normalize(uMoonPos - ro)), -1., 1.));
    col += vec3(1., .82, .55)*uFlash*(exp(-ga/.035)*3. + exp(-ga/.15)*.6);
  }
  fragColor = vec4(col, 1.);
}
`;

// ---- 小向量运算 ----
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
const SUN = V3.norm([1, .32, .45]);
// 镜头坐标里给一个方向（右、上、朝镜头），换成世界坐标里的太阳方向
function sunFor(cam, k = [-.75, .30, .55]) {
  return V3.norm(V3.add(V3.add(V3.mul(cam.uCamR, k[0]), V3.mul(cam.uCamU, k[1])), V3.mul(cam.uCamF, -k[2])));
}
const spaceTex = () => ({ uDay: TEX.day, uNightT: TEX.night, uWater: TEX.water, uClouds: TEX.clouds });
const SPACE_POST = { exposure: 1.25, thr: .85, bloom1: .35, bloom2: .45, sigma1: 5, sigma2: 9, grain: .03, vig: .40, contrast: 1.06, sat: 1.05,
                     shadowTint: [-.004, .002, .012], highTint: [.010, .004, -.006], lift: [.003, .005, .012] };
const baseSpace = { uMoonRad: .273, uStretch: 1, uCrack: 0, uMoonVis: 1, uRingOp: 0, uRingArc: 0, uRingCenter: 0, uRoche: 0, uRocheHot: 0,
                    uSpiral: 0, uSpiralEnd: 0, uSpiralTurns: 1, uSpiralR0: 8, uSpiralR1: 3, uFlash: 0, uSun: SUN };

// ---- 月亮的轨道：一圈圈往里绕（示意，距离压缩了），到洛希极限碎掉 ----
const ORB = {
  ang(t) { return .55 + .55 * (Math.min(t, SS('break')) - SS('orbit')) + .07 * Math.max(0, t - SS('break')); },   // 绕地球的角度（弧度）
  r(t) {                                                              // 离地心几个地球半径
    const a = SS('orbit'), b = SS('break');
    if (t < b) return lerp(7.0, 3.75, easeInOut((t - a) / (b - a)));
    if (t < EN('r1')) return lerp(3.75, ROCHE, smooth(b, EN('r1'), t));       // "1.8 万公里"念完，正好压到虚线上
    return lerp(ROCHE, ROCHE * .94, smooth(EN('r1'), this.tb(), t));
  },
  pos(t) { const a = this.ang(t), r = this.r(t); return [r * Math.cos(a), 0, r * Math.sin(a)]; },
  tb() { return EN('r3') + .05; },                                   // 碎掉的时刻："活活扯碎"一念完（这句前后的停顿里放碎裂声）
};

// ---- 碎块：从月亮的体积里取点，碎掉以后沿轨道按开普勒速度差慢慢拉开（内圈快、外圈慢），铺成一圈 ----
const FRAG = (() => {
  let seedv = 12345;
  const rnd = () => { seedv = (seedv * 16807) % 2147483647; return seedv / 2147483647; };
  const N = 1600, list = [];
  for (let i = 0; i < N; i++) {
    let x, y, z;
    do { x = rnd() * 2 - 1; y = rnd() * 2 - 1; z = rnd() * 2 - 1; } while (x * x + y * y + z * z > 1);
    const big = i < 60;
    list.push({ u: [x, y, z], rad: big ? .010 + .026 * rnd() : .0015 + .006 * Math.pow(rnd(), 3), seed: rnd(), hot: rnd() < .2 ? .55 : .08,
                dr: (rnd() * 2 - 1) * .38, dy: (rnd() * 2 - 1) * .035, kick: rnd() });
  }
  const data = new Float32Array(N * 7);
  return {
    // τ：碎掉以后过了多久（秒）；speed：时间快进倍数（光环镜头里快进）
    build(t, cam, timeScale = 1, tauExtra = 0, sizeK = 1) {
      const tb = ORB.tb();
      const tau = Math.max(0, t - tb) * timeScale + tauExtra;
      const a0 = ORB.ang(tb), r0 = ORB.r(tb);
      const w0 = .55;
      const items = [];
      const st = 1.35;
      for (const f of list) {
        // 碎掉前的位置（拉长的月亮里），用来起步
        const along = f.u[0] * .273 * st, side = f.u[2] * .273 / Math.sqrt(st);
        const rr = r0 - along + (f.dr * (1 - Math.exp(-tau * .8))) + .03 * f.kick * Math.min(tau, 1.5);
        const w = w0 * Math.pow(rr / r0, -1.5);
        const ang = a0 + side / r0 + (w - w0) * tau * 1.6 + .02 * f.kick * Math.min(tau, 1.5) * Math.sign(f.u[2]);
        const y = f.u[1] * .273 / Math.sqrt(st) * Math.exp(-tau * .15) + f.dy * (1 - Math.exp(-tau));
        const P = [rr * Math.cos(ang), y, rr * Math.sin(ang)];
        const d = Math.hypot(P[0] - cam.uCamPos[0], P[1] - cam.uCamPos[1], P[2] - cam.uCamPos[2]);
        items.push([P, f, d]);
      }
      items.sort((a, b) => b[2] - a[2]);
      const heatK = Math.exp(-tau / .9);
      items.forEach(([P, f], i) => {
        data.set([P[0], P[1], P[2], f.rad * sizeK, f.seed, f.hot * heatK, 1], i * 7);
      });
      return { data, count: items.length, uniforms: { uOcc: [0, 0, 0, 1], uRockCol: [.40, .385, .37], uSun: cam.uSun || SUN } };
    },
  };
})();

// ---- 镜头 1：俯看，月亮沿螺旋一圈圈往里绕 ----
function camOrbit(t, lt) {
  const k = easeInOut(clamp01(lt / (SS('break') - SS('orbit'))));
  const az = lerp(-.4, .25, k), el = lerp(.95, .62, k), dist = lerp(19, 12.5, k);
  const pos = [Math.cos(az) * Math.cos(el) * dist, Math.sin(el) * dist, Math.sin(az) * Math.cos(el) * dist];
  return lookAt(pos, V3.mul(ORB.pos(t), lerp(.42, .30, k)), 52, 0);       // 看地月中间，两个都在画里
}
SHOTS.orbit = {
  fs: SPACE_FS, textures: spaceTex,
  uniforms(t, lt) {
    const cam = camOrbit(t, lt);
    return Object.assign({}, baseSpace, cam, { uEarthRot: t * .05, uMoonPos: ORB.pos(t), uMoonRad: .62, uSun: sunFor(camOrbit(SS('orbit'), 0), [-.65, .40, .55]),
      uSpiral: smooth(0, .4, lt), uSpiralEnd: ORB.ang(t), uSpiralTurns: 1.8, uSpiralR0: 7.8, uSpiralR1: ORB.r(t) });
  },
  post: SPACE_POST,
  overlay(t, lt) {
    const a = smooth(0, .4, lt);
    OV.source('示意：距离和大小不按比例', a);
    const cam = camOrbit(t, lt);
    const e = project(cam, [0, 0, 0]);
    if (e) OV.text('地球', e[0], e[1] + 150, { size: 34, weight: 500, alpha: a * .9 });
    const m = project(cam, ORB.pos(t));
    if (m) OV.text('月亮', m[0], m[1] - 60, { size: 34, weight: 500, alpha: a * .9 });
  },
};

// ---- 镜头 2：贴近赤道面，地球在左下，月亮撞上洛希极限的虚线圈 ----
function camBreak(t, lt) {
  const tb = ORB.tb();
  const k = easeInOut(clamp01(lt / (SE('break') - SS('break'))));
  const mp = ORB.pos(Math.min(t, tb));
  const look = V3.lerp(mp, [0, 0, 0], lerp(.30, .42, k));
  const am = ORB.ang(SS('break'));
  const az = am - Math.PI / 2 + lerp(-.30, -.05, k);          // 侧面看过去
  const el = lerp(.28, .42, k), dist = lerp(7.2, 8.4, k);
  const pos = V3.add(look, [Math.cos(az) * Math.cos(el) * dist, Math.sin(el) * dist, Math.sin(az) * Math.cos(el) * dist]);
  return lookAt(pos, look, 50, lerp(.05, -.03, k));
}
SHOTS.breakup = {
  fs: SPACE_FS, textures: spaceTex,
  uniforms(t, lt) {
    const cam = camBreak(t, lt);
    const tb = ORB.tb();
    const st = 1 + .38 * smooth(S('r2'), CH('r2', 1) + .5, t);
    const crack = smooth(tb - .9, tb - .05, t);
    const vis = 1 - smooth(tb - .02, tb + .10, t);
    const flash = .9 * Math.exp(-Math.max(0, t - tb) / .12) * (t >= tb - .02 ? 1 : 0);
    return Object.assign({}, baseSpace, cam, { uEarthRot: t * .05, uMoonPos: ORB.pos(Math.min(t, tb)), uMoonRad: .273, uStretch: st, uCrack: crack, uMoonVis: vis,
      uRoche: smooth(S('r1') - .2, S('r1') + .4, t), uRocheHot: smooth(S('r4') - .1, S('r4') + .5, t), uFlash: flash,
      uRingOp: smooth(tb + 2.5, tb + 6.5, t) * .20, uRingArc: lerp(.05, 1.1, smooth(tb, SE('break'), t)), uRingCenter: ORB.ang(tb), uSun: sunFor(camBreak(SS('break'), 0)) });
  },
  points(t, lt, u) {
    if (t < ORB.tb() - .02) return null;
    return FRAG.build(t, u);
  },
  post: SPACE_POST,
  overlay(t, lt) {
    const cam = camBreak(t, lt);
    const tb = ORB.tb();
    const ar = smooth(S('r1') - .2, S('r1') + .4, t);
    // 虚线圈的标签：放在圈上离镜头近的一侧
    const ang = ORB.ang(SS('break')) - .9;
    const lp = project(cam, [ROCHE * Math.cos(ang), 0, ROCHE * Math.sin(ang)]);
    const hot = smooth(S('r4') - .1, S('r4') + .5, t);
    if (lp) {
      OV.text('洛希极限', Math.min(Math.max(lp[0], 200), 760), Math.min(lp[1] + 70, 1300), { size: lerp(38, 58, hot), weight: 600, alpha: ar, color: hot > .5 ? GOLD : [210, 225, 255] });
      OV.text('约 1.8 万公里', Math.min(Math.max(lp[0], 200), 760), Math.min(lp[1] + 120, 1350), { size: 30, weight: 400, alpha: ar * (1 - hot * .3), color: [210, 225, 255] });
    }
    OV.source(['洛希极限：流体情形 18,381 km（刚体 9,492 km）', '现在的地月距离约 38 万公里'], ar);
    // 拉力箭头：近的一面长，远的一面短
    const aa = smooth(S('r2') - .1, S('r2') + .3, t) * (1 - smooth(tb - .4, tb - .1, t));
    if (aa > 0) {
      const mp = ORB.pos(Math.min(t, tb));
      const dir = V3.norm(V3.mul(mp, -1));
      const near = V3.add(mp, V3.mul(dir, .273 * 1.4)), far = V3.sub(mp, V3.mul(dir, .273 * 1.4));
      const pn = project(cam, near), pf = project(cam, far), pc = project(cam, mp);
      if (pn && pf && pc) {
        const ux = (pn[0] - pc[0]), uy = (pn[1] - pc[1]); const L = Math.hypot(ux, uy) || 1;
        const arrow = (p, len, col) => {
          const ex = p[0] + ux / L * len, ey = p[1] + uy / L * len;
          OV.line(p[0], p[1], ex, ey, { width: 7, color: col, alpha: aa });
          const ang2 = Math.atan2(ey - p[1], ex - p[0]);
          OV.line(ex, ey, ex - Math.cos(ang2 - .5) * 26, ey - Math.sin(ang2 - .5) * 26, { width: 7, color: col, alpha: aa });
          OV.line(ex, ey, ex - Math.cos(ang2 + .5) * 26, ey - Math.sin(ang2 + .5) * 26, { width: 7, color: col, alpha: aa });
        };
        arrow(pn, 150, GOLD);
        arrow(pf, 60, [200, 215, 255]);
      }
    }
  },
};

// ---- 镜头 3：拉远升高，碎块铺满一圈，地球有了光环（快进） ----
function camRing(t, lt) {
  const k = easeInOut(clamp01(lt / (SE('ring') - SS('ring') + .4)));
  const az = lerp(-1.25, -.85, k) + ORB.ang(ORB.tb()) * 0;
  const el = lerp(.22, .30, k), dist = lerp(8.2, 9.8, k);
  const pos = [Math.cos(az) * Math.cos(el) * dist, Math.sin(el) * dist, Math.sin(az) * Math.cos(el) * dist];
  return lookAt(pos, [0, -.1, 0], 50, lerp(-.18, -.10, k));
}
SHOTS.ringSpace = {
  fs: SPACE_FS, textures: spaceTex,
  uniforms(t, lt) {
    const cam = camRing(t, lt);
    const k = smooth(SS('ring') - .4, SE('ring') - .6, t);
    return Object.assign({}, baseSpace, cam, { uEarthRot: t * .05, uMoonVis: 0, uRingOp: lerp(.25, .85, k), uRingArc: lerp(1.1, 3.2, k), uRingCenter: ORB.ang(ORB.tb()),
      uSun: sunFor(camRing(SS('ring'), 0), [-.62, .42, .50]) });
  },
  points(t, lt, u) { return FRAG.build(t, u, 1, 2 + 26 * smooth(SS('ring') - .4, SE('ring'), t), .55); },
  post: Object.assign({}, SPACE_POST, { exposure: 1.3 }),
};
