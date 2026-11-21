// 火星和火卫一：这事真的在发生。火卫一一圈圈往里绕（示意），几千万年后碎成火星的光环（Black & Mittal 2015）。
// 单位：火星半径。火星在原点，北极朝 +Y。火卫一轨道半径约 2.77 个火星半径（9,376 km / 3,390 km）。
const MARS_FS = GLSL_HEAD + GLSL_COMMON + `
uniform vec3 uCamPos, uCamR, uCamU, uCamF, uSun, uPhPos;
uniform float uTanHalf, uRot, uPhVis, uTrail, uTrailEnd, uRingOp, uRingArc, uRingCenter, uFlash;

vec3 marsAlbedo(vec3 n){
  float f = fbm3N(n*2.1 + 5., 6), g = fbm3N(n*7. + 1., 5);
  vec3 c = mix(vec3(.62, .31, .17), vec3(.30, .16, .10), smoothstep(.04, .24, f));
  c = mix(c, vec3(.80, .52, .33), smoothstep(.08, .32, -f)*.55);
  c *= .86 + .28*g;
  float canyon = exp(-pow((n.y + .12 + .05*fbm3N(n*5., 3))/.012, 2.))*smoothstep(.2, .6, n.x)*.5;   // 一道大峡谷
  c *= 1. - canyon;
  c = mix(c, vec3(.80, .74, .68), smoothstep(.94, .975, abs(n.y))*(.45 + .25*g));
  return c;
}
float ringD(float r, float ang){
  if (r < 1.9 || r > 3.0) return 0.;
  float prof = smoothstep(1.95, 2.25, r)*(1. - smoothstep(2.6, 3.0, r));
  float b = .4 + .6*clamp(fbmN(vec2(r*26., 2.), 4)*1.3 + .5, 0., 1.);
  float da = abs(mod(ang - uRingCenter + PI, TAU) - PI);
  float arc = uRingArc >= 3.1 ? 1. : 1. - smoothstep(uRingArc*.35, uRingArc, da);
  return prof*b*arc*uRingOp;
}
void main(){
  vec2 p = (gl_FragCoord.xy - .5*uRes)/uRes.y;
  vec3 ro = uCamPos;
  vec3 rd = normalize(uCamF + p.x*2.*uTanHalf*uCamR + p.y*2.*uTanHalf*uCamU);
  float px = 2.*uTanHalf/uRes.y;
  vec3 col = spaceStars(rd, px)*.85;
  vec2 mh = sphHit(ro, rd, vec3(0.), 1.);
  float tM = mh.x > 0. ? mh.x : 1e9;
  if (mh.x > 0.){
    vec3 P = ro + rd*mh.x, n = normalize(P);
    vec3 nl = rotY(n, -uRot);
    float ndl = dot(n, uSun);
    vec3 alb = pow(marsAlbedo(nl), vec3(1.4));
    col = alb*max(ndl, 0.)*1.7;
    float mu = max(dot(n, -rd), 0.);
    col += vec3(1., .62, .42)*pow(1. - mu, 3.)*smoothstep(-.2, .5, ndl)*.35;
  } else {
    float b = dot(-ro, rd); vec3 cp = ro + rd*max(b, 0.); float d = length(cp);
    if (b > 0. && d > 1.) col += vec3(1., .6, .4)*exp(-(d - 1.)/.02)*.35*smoothstep(-.3, .5, dot(normalize(cp), uSun));
  }
  if (abs(rd.y) > 1e-5){
    float tp = -ro.y/rd.y;
    if (tp > 0. && tp < tM){
      vec3 H = ro + rd*tp; float r = length(H.xz), ang = atan(H.z, H.x);
      float dens = ringD(r, ang);
      if (dens > 0.){
        float a = 1. - exp(-dens*.35/max(abs(rd.y), .06));
        float hs = dot(H, uSun);
        float lit = hs > 0. ? 1. : smoothstep(.97, 1.03, length(H - hs*uSun));
        col = mix(col, vec3(.85, .74, .62)*(.02 + .9*lit*(abs(uSun.y) + .1)), a);
      }
      if (uTrail > 0.){
        float best = 1e9, fade = 0.;
        for (int k = 0; k < 4; k++){
          float ph = mod(uTrailEnd - ang, TAU) + TAU*float(k);
          if (ph > 1.3*TAU) break;
          float rs = mix(2.62, 2.95, ph/(1.3*TAU));
          float dd = abs(r - rs);
          if (dd < best){ best = dd; fade = pow(1. - ph/(1.3*TAU), 1.6); }
        }
        float w = px*tp*1.6;
        col += vec3(1., .78, .55)*exp(-pow(best/w, 2.))*fade*uTrail*.8;
      }
    }
  }
  // 火卫一：疙疙瘩瘩的小土豆（示意，放大了）
  if (uPhVis > 0.){
    vec3 o = ro - uPhPos;
    vec3 sc = vec3(.20, .155, .14);
    vec3 lo = o/sc, ld = rd/sc;
    float A = dot(ld, ld), B = dot(lo, ld), C = dot(lo, lo) - 1.;
    float h = B*B - A*C;
    if (h > 0.){
      float t = (-B - sqrt(h))/A;
      if (t > 0. && t < tM){
        vec3 lp = lo + ld*t;
        vec3 n = normalize(lp/sc);
        n = normalize(n + .5*vec3(gnoise3(lp*3.), gnoise3(lp*3. + 5.), gnoise3(lp*3. + 9.)));
        float alb = .30 + .12*fbm3N(lp*4., 4);
        col = mix(col, vec3(.62, .56, .50)*alb*(.02 + 2.2*max(dot(n, uSun), 0.)), uPhVis);
      }
    }
  }
  if (uFlash > 0.){
    float ga = acos(clamp(dot(rd, normalize(uPhPos - ro)), -1., 1.));
    col += vec3(1., .8, .55)*uFlash*(exp(-ga/.03)*2.5 + exp(-ga/.12)*.5);
  }
  fragColor = vec4(col, 1.);
}
`;

const PHO = {
  ang(t) { return -.6 + .42 * (t - SS('mars')); },
  r(t) { return lerp(3.0, 2.66, smooth(SS('mars'), CH('m2', 0), t)); },
  pos(t) { const a = this.ang(t), r = this.r(t); return [r * Math.cos(a), 0, r * Math.sin(a)]; },
  tb() { return CH('m2', 1) - .2; },        // 碎掉的时刻："几千万年后，"和"它会碎成"之间的停顿里
};
function camMars(t, lt) {
  const k = easeInOut(clamp01(lt / (SE('mars') - SS('mars') + .5)));
  const az = lerp(.55, .85, k), el = lerp(.34, .42, k), dist = lerp(8.6, 9.6, k);
  const pos = [Math.cos(az) * Math.cos(el) * dist, Math.sin(el) * dist, Math.sin(az) * Math.cos(el) * dist];
  return lookAt(pos, [0, -.15, 0], 48, lerp(-.10, -.05, k));
}
SHOTS.mars = {
  fs: MARS_FS,
  uniforms(t, lt) {
    const cam = camMars(t, lt);
    const tb = PHO.tb();
    const sun = sunFor(camMars(SS('mars'), 0), [-.70, .40, .45]);
    const tp = Math.min(t, tb);
    return Object.assign({}, cam, { uSun: sun, uRot: t * .06, uPhPos: PHO.pos(tp), uPhVis: 1 - smooth(tb - .02, tb + .12, t),
      uTrail: smooth(0, .6, lt) * (1 - smooth(tb, tb + .8, t)), uTrailEnd: PHO.ang(tp),
      uRingOp: smooth(tb, tb + 1.2, t) * .9, uRingArc: lerp(.1, 3.2, smooth(tb, SE('mars') + .3, t)), uRingCenter: PHO.ang(tb),
      uFlash: t >= tb - .02 ? .8 * Math.exp(-(t - tb) / .12) : 0 });
  },
  post: Object.assign({}, SPACE_POST, { exposure: 1.3, highTint: [.016, .006, -.010] }),
  overlay(t, lt) {
    const cam = camMars(t, lt);
    const a = smooth(0, .4, lt);
    OV.source(['火卫一：Black & Mittal 2015，Nature Geoscience', '示意：火卫一放大了'], a);
    const m = project(cam, [0, 1.15, 0]);
    if (m) OV.text('火星', m[0], m[1] - 20, { size: 36, weight: 500, alpha: a * .9 });
    const tb = PHO.tb();
    const ph = project(cam, PHO.pos(Math.min(t, tb)));
    if (ph) OV.text('火卫一', ph[0], ph[1] - 85, { size: 34, weight: 600, alpha: smooth(CH('m1', 1) - .3, CH('m1', 1), t) * (1 - smooth(tb - .2, tb, t)), color: GOLD });
  },
};
