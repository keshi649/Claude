// 地上看：光环从地平线升起、横跨夜空，碎块落进大气变成流星；山脊上有人抬手指着。
// 光环按真实几何算：观测者在北纬 30°，光环在地球赤道面上 1.95~2.8 个地球半径，太阳刚下山（光环整圈被照亮）。
const NIGHT_FS = GLSL_HEAD + GLSL_COMMON + `
uniform float uFov, uAz, uPitch, uRoll, uLat, uHour, uDecl, uMeteor;

float airmass(float e){ e = max(e, -.4); return 1./(sin(radians(e)) + .50572*pow(e + 6.07995, -1.6364)); }
vec3 extinct(vec3 c, float e){ return c*exp(-vec3(.080, .145, .290)*airmass(e)); }

vec3 starField(vec3 D, float elev){
  vec3 s = vec3(0.);
  for (int L = 0; L < 2; L++){
    float sc = L == 0 ? 300. : 760.;
    vec2 g = vec2(atan(D.y, D.x), asin(clamp(D.z, -1., 1.)))*sc;
    vec2 c = floor(g), f = fract(g);
    float h = hash12(c + float(L)*91.);
    if (h < (L == 0 ? .30 : .55)){
      vec2 pos = hash22(c + 3.1 + float(L))*.7 + .15;
      float b = L == 0 ? pow(hash12(c + 9.7), 9.)*3.2 + .05 : pow(hash12(c + 2.2), 6.)*.5 + .02;
      float w = L == 0 ? 9. : 16.;
      vec3 tint = mix(vec3(.75, .85, 1.), vec3(1., .85, .7), hash12(c + 5.5));
      float tw = .75 + .25*sin(uTime*(2. + 3.*hash12(c + 1.7)) + h*40.);
      s += tint*b*tw*exp(-pow(length(f - pos)*w, 2.));
    }
  }
  return s*smoothstep(-2., 14., elev);
}
vec3 milkyWay(vec3 D){
  vec3 G = normalize(vec3(.35, -.55, .76));
  float dd = dot(D, G);
  float band = exp(-pow(dd/.17, 2.));
  float cl = fbm3N(D*5.5 + 2., 5);
  float dust = smoothstep(.0, .30, fbm3N(D*9. + 7., 5));
  return vec3(.050, .052, .068)*band*(.55 + cl)*(1. - .75*dust*band);
}

void main(){
  float lat = radians(uLat);
  vec3 P0 = vec3(cos(lat), 0., sin(lat));
  vec3 U = P0, E = vec3(0., 1., 0.), N = vec3(-sin(lat), 0., cos(lat));
  float H = radians((uHour - 12.)*15.), de = radians(uDecl);
  vec3 S = normalize(vec3(cos(de)*cos(H), -cos(de)*sin(H), sin(de)));
  float az = radians(uAz), pt = radians(uPitch), ro = radians(uRoll);
  vec3 fh = cos(az)*N + sin(az)*E;
  vec3 F = normalize(cos(pt)*fh + sin(pt)*U);
  vec3 R = normalize(cross(F, U));
  vec3 Up = cross(R, F);
  vec3 R2 = cos(ro)*R + sin(ro)*Up, Up2 = -sin(ro)*R + cos(ro)*Up;
  vec2 p = (gl_FragCoord.xy - .5*uRes)/uRes.y;
  float k = 2.*tan(radians(uFov)*.5);
  vec3 D = normalize(F + p.x*k*R2 + p.y*k*Up2);
  float elev = degrees(asin(clamp(dot(D, U), -1., 1.)));

  vec3 col = mix(vec3(.034, .060, .090), vec3(.004, .008, .022), smoothstep(0., 50., elev));
  col += vec3(.020, .030, .040)*exp(-max(elev, 0.)/4.);
  col += vec3(.010, .022, .014)*exp(-pow((elev - 9.)/6., 2.));
  col += milkyWay(D);
  vec3 st = starField(D, elev);

  float ringA = 0.; vec3 ringC = vec3(0.);
  if (D.z < 0.){
    float t = -P0.z/D.z;
    vec3 Hp = P0 + t*D;
    float r = length(Hp.xy);
    if (r > 1.55 && r < 2.8){
      float prof = smoothstep(1.95, 2.06, r)*(1. - smoothstep(2.62, 2.76, r)) + .10*smoothstep(1.58, 1.80, r)*(1. - smoothstep(1.95, 2.02, r));
      float bands = .22 + .78*pow(clamp(fbmN(vec2(r*30., .5), 4)*1.3 + .5, 0., 1.), 1.5);
      bands *= .88 + .12*clamp(fbmN(vec2(r*120., 3.5), 3)*1.5 + .5, 0., 1.);
      float gap = (1. - .95*exp(-pow((r - 2.40)/.018, 2.)))*(1. - .70*exp(-pow((r - 2.13)/.008, 2.)))*(1. - .55*exp(-pow((r - 2.60)/.006, 2.)));
      float inner = mix(.35, 1., smoothstep(1.98, 2.25, r));
      float tau = .15*prof*bands*gap*inner;
      ringA = 1. - exp(-tau/max(abs(D.z), .03));
      float hs = dot(Hp, S);
      float lit = hs > 0. ? 1. : smoothstep(.975, 1.03, length(Hp - hs*S));
      vec3 tint = mix(vec3(1., .90, .76), vec3(.92, .94, 1.), clamp(fbmN(vec2(r*9., 8.), 3)*1.5 + .5, 0., 1.));
      vec3 rc = tint*(.02 + 1.95*lit*abs(S.z)*2.2)*(.75 + .5*bands);
      float ang = atan(Hp.y, Hp.x);
      rc *= 1. + pow(hash12(floor(vec2(ang*2400., r*900.))), 60.)*3.;
      ringC = extinct(rc, max(elev, .3));
    }
  }
  col += st*(1. - ringA);
  col = mix(col, ringC, ringA*.96);

  // 流星：一颗颗从光环那边斜着落下来，划过 0.5~0.9 秒
  for (int i = 0; i < 14; i++){
    float fi = float(i);
    float per = 2.2 + 2.6*hash11(fi*7.7);
    float ph = hash11(fi*3.1)*per;
    float u = mod(uTime*uMeteor + ph, per);
    float dur = .5 + .4*hash11(fi*5.3);
    if (u > dur) continue;
    float cyc = floor((uTime*uMeteor + ph)/per);
    vec2 a = vec2(-.22 + .50*hash11(fi*7.3 + cyc*1.7), .05 + .40*hash11(fi*3.1 + cyc*2.3));
    vec2 dir = normalize(vec2(-.30 - .25*hash11(fi + 5. + cyc), -1.));
    float len = .10 + .14*hash11(fi*1.7 + 9. + cyc);
    float prog = u/dur;
    vec2 head = a + dir*len*prog;
    vec2 tail = head - dir*len*min(prog*1.4, .55);
    float d = sdSeg(p, tail, head), h = segT(p, tail, head);
    float br = (.8 + 2.4*hash11(fi + 3.3 + cyc))*sin(3.14159*prog)*smoothstep(0., 1., h);
    vec3 mc = mix(vec3(1., .55, .25), vec3(1., .95, .85), h*h);
    col += mc*br*(exp(-pow(d/.0009, 2.)) + .09*exp(-d/.005));
  }

  float far = -.355 + .035*fbmN(vec2(p.x*2.6, 1.), 5) + .02*ridged(vec2(p.x*5., 4.), 4);
  float aa = 1.4/uRes.y;
  col = mix(col, mix(col, vec3(.012, .018, .032), .85), 1. - smoothstep(-aa, aa, p.y - far));
  float ridge = -.40 + .045*fbmN(vec2(p.x*3.2 + 7., 2.), 6) + .025*ridged(vec2(p.x*7. + 2., 5.), 4) + .05*smoothstep(.05, .30, p.x);
  float g = p.y - ridge;
  float gm = 1. - smoothstep(-aa, aa, g);
  vec3 gc = vec3(.003, .004, .007) + vec3(.05, .055, .07)*exp(-max(-g, 0.)/.0035)*.6;
  col = mix(col, gc, gm);
  vec2 f = vec2(-.115, -.40 + .045*fbmN(vec2(-.115*3.2 + 7., 2.), 6) + .025*ridged(vec2(-.115*7. + 2., 5.), 4) - .002);
  vec2 q = p - f; float h = .040;
  float fd = length(q - vec2(.0016, h*.92)) - h*.08;
  fd = min(fd, sdTaper(q, vec2(0., h*.80), vec2(0., h*.46), h*.09, h*.075));
  fd = min(fd, sdTaper(q, vec2(-.0018, h*.48), vec2(-.0024, 0.), h*.045, h*.034));
  fd = min(fd, sdTaper(q, vec2(.0018, h*.48), vec2(.0030, 0.), h*.045, h*.034));
  fd = min(fd, sdTaper(q, vec2(.0048, h*.78), vec2(.0105, h*1.18), h*.03, h*.024));
  fd = min(fd, sdTaper(q, vec2(-.0046, h*.78), vec2(-.0056, h*.50), h*.03, h*.025));
  col = mix(col, vec3(.002), 1. - smoothstep(-aa*.8, aa*.8, fd));
  fragColor = vec4(col, 1.);
}
`;

SHOTS.nightRing = {
  fs: NIGHT_FS,
  uniforms(t, lt) {
    const k = easeInOut(clamp01(lt / (SE('night') - SS('night') + .8)));
    return { uFov: lerp(74, 68, k), uAz: lerp(126, 132, k), uPitch: lerp(24, 30, k), uRoll: lerp(-12, -9, k), uLat: 30, uHour: 19.6, uDecl: 20,
             uMeteor: 1 + .8 * smooth(S('n2'), S('n2') + 1, t) };
  },
  post: { exposure: 1.35, thr: .90, bloom1: .50, bloom2: .62, sigma1: 5, sigma2: 9, grain: .04, vig: .45,
          contrast: 1.05, shadowTint: [-.004, .004, .018], highTint: [.014, .006, -.008], lift: [.004, .008, .018] },
};
