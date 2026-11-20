// 画风 A：电影感。物理上讲得通的光：大气消光让低处的月亮发橙，地影带和金星带，长曝光的海面，地球光环在夜空里的真实几何。
const STYLE_A = {};

STYLE_A.A1 = {
  hdr: true,
  tiles: 24,
  uniforms: { uFov: 52, uPitch: 8, uMoonElev: 9.2, uMoonRad: 9.6 },
  post: { exposure: 1.55, thr: 1.15, bloom1: 0.32, bloom2: 0.40, sigma1: 5, sigma2: 8, grain: 0.035, vig: 0.42,
          sat: 1.04, contrast: 1.04, shadowTint: [-0.006, 0.004, 0.016], highTint: [0.012, 0.004, -0.010], lift: [0.006, 0.010, 0.020] },
  fs: GLSL_HEAD + GLSL_COMMON + `
uniform float uFov, uPitch, uMoonElev, uMoonRad;
const float MOON_I = 2.15;
vec3 MD, MR, MU; float TANA, KF;

vec3 camRay(vec2 fc, out vec2 p){
  p = (fc - .5*uRes)/uRes.y;
  vec3 d = normalize(vec3(p*KF, 1.));
  float c = cos(radians(uPitch)), s = sin(radians(uPitch));
  return vec3(d.x, d.y*c + d.z*s, -d.y*s + d.z*c);
}
float airmass(float e){ e = max(e, -.4); return 1./(sin(radians(e)) + .50572*pow(e + 6.07995, -1.6364)); }
vec3 extinct(vec3 c, float e){ return c*exp(-vec3(.080, .145, .290)*airmass(e)); }
float elevDeg(vec3 d){ return degrees(asin(clamp(d.y, -1., 1.))); }

vec3 skyCol(vec3 d){
  float e = elevDeg(d), az = atan(d.x, d.z);
  vec3 zen = vec3(.008, .018, .055), mid = vec3(.040, .070, .150);
  vec3 belt = vec3(.34, .190, .185), shb = vec3(.052, .066, .112);
  vec3 c = mix(mid, zen, smoothstep(10., 34., e));
  c = mix(c, belt, exp(-pow((e - 7.2)/5.0, 2.))*.80);
  c = mix(c, shb, 1. - smoothstep(.5, 3.4, e));
  c *= 1. + .10*cos(az*1.5 + .4);
  return c;
}
vec2 moonQ(vec3 d){ return vec2(dot(d, MR), dot(d, MU))/(dot(d, MD)*TANA); }

vec3 moonNormal(vec3 n, out float alb){
  float m = fbm3N(n*1.6 + vec3(3.1, 1.7, .4), 5);
  float maria = smoothstep(-.07, .09, m);
  alb = mix(1., .52, maria);
  alb *= .84 + .30*(fbm3N(n*6.5 + 4.2, 5) + .35);
  alb *= .94 + .10*fbm3N(n*28. + 1.3, 3);
  vec3 g = vec3(0.);
  for (int o = 0; o < 3; o++){
    float sc = o == 0 ? 4.2 : (o == 1 ? 9.5 : 21.);
    float amp = o == 0 ? 1. : (o == 1 ? .75 : .5);
    vec3 P = n*sc + float(o)*13.7;
    vec3 ip = floor(P), fp = fract(P);
    float best = 1e9; vec3 bv = vec3(0.); float br = .3;
    for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
      vec3 gq = vec3(float(x), float(y), float(z));
      vec3 v = gq + hash33(ip + gq + float(o)*31.) - fp;
      float dd = dot(v, v);
      if (dd < best){ best = dd; bv = v; br = .10 + .30*hash13(ip + gq + 7.31 + float(o)); }
    }
    float dist = sqrt(best), x = dist/br;
    if (x < 1.8){
      float w = .24;
      float rim = exp(-pow((x - 1.)/w, 2.));
      float slope = (x < 1. ? .9*x : 0.) - 1.1*rim*(x - 1.)/w;
      g += amp*slope*(-bv/max(dist, 1e-4));
      alb *= (x < 1. ? mix(1., .92, amp) : 1.)*(1. + .14*rim*amp);
    }
  }
  vec3 gt = g - dot(g, n)*n;
  return normalize(n - gt*.20);
}
vec3 moonShade(vec2 q, float aa, bool blurry, out float cover){
  float r = length(q);
  if (blurry){ cover = 1. - smoothstep(.97, 1.03, r); return vec3(1., .95, .88)*.85; }
  cover = 1. - smoothstep(1. - aa, 1. + aa, r);
  if (r > 1. + aa) return vec3(0.);
  vec2 qq = r > .9995 ? q/r*.9995 : q;
  vec3 n = vec3(qq, sqrt(max(1. - dot(qq, qq), 0.)));
  float alb;
  vec3 np = moonNormal(n, alb);
  vec3 L = normalize(vec3(-.52, .20, .83));
  float ci = max(dot(np, L), 0.), ce = max(n.z, .03);
  float shade = mix(ci, 2.*ci/(ci + ce), .55);
  return vec3(1., .965, .91)*alb*shade;
}
float cloudDens(vec3 d, bool cheap){
  float e = elevDeg(d), az = atan(d.x, d.z);
  float n = fbmN(vec2(az*7.5, e*.85) + vec2(3.2, 1.1), cheap ? 4 : 6);
  float n2 = cheap ? 0. : fbmN(vec2(az*24., e*2.6) + 7.7, 4);
  float seg = smoothstep(-.10, .25, fbmN(vec2(az*3.2, 11.), 4));            // 云带断成一段一段
  float band = exp(-pow((e - 2.4)/1.3, 2.)) + .95*exp(-pow((e - 5.4)/.65, 2.))*seg;
  return smoothstep(.0, .55, band*(.60 + n*1.5 + n2*.45) - .36);
}
float cirrus(vec3 d){
  float e = elevDeg(d), az = atan(d.x, d.z);
  float n = fbmN(vec2(az*2.6 + e*.05, e*.30) + 21., 6);
  float st = fbmN(vec2(az*16. - e*.5, e*.22) + 3., 4);
  return smoothstep(.06, .36, n + .28*st)*smoothstep(14., 21., e);
}
float stars(vec3 d){
  float e = elevDeg(d);
  if (e < 16.) return 0.;
  vec2 sc = vec2(atan(d.x, d.z), asin(d.y))*420.;
  vec2 c = floor(sc), f = fract(sc);
  float h = hash12(c);
  if (h > .22) return 0.;
  vec2 pos = hash22(c + 3.1)*.8 + .1;
  float b = pow(hash12(c + 9.7), 10.)*1.4 + .03;
  return .6*b*exp(-pow(length(f - pos)*7., 2.))*smoothstep(18., 30., e);
}

vec3 skyAll(vec3 d, bool mirror){
  float e = elevDeg(d);
  vec3 col = skyCol(d);
  if (!mirror) col += vec3(.85, .9, 1.)*stars(d);
  float gam = acos(clamp(dot(d, MD), -1., 1.));
  float rr = radians(uMoonRad);
  float ex = max(gam - rr, 0.);
  vec3 halo = vec3(1., .70, .46)*(.30*exp(-ex/radians(2.2)) + .10*exp(-ex/radians(9.)));
  col += extinct(halo, max(e, .5))*MOON_I*.32;
  vec2 q = moonQ(d);
  float cover;
  vec3 m = moonShade(q, KF/(uRes.y*TANA)*1.2, mirror, cover)*MOON_I;
  m = extinct(m, max(e, .2)) + skyCol(d)*.22;
  col = mix(col, m, cover);
  float cd = cloudDens(d, mirror);
  float nearMoon = exp(-max(length(q) - 1., 0.)*2.4);
  vec3 cloudC = skyCol(d)*.40 + vec3(.012, .010, .013);
  cloudC += extinct(vec3(1., .66, .42), max(e, .5))*MOON_I*(.05*nearMoon + .55*cover*pow(1. - cd, 2.2));
  col = mix(col, cloudC, cd*.94);
  col += vec3(.60, .33, .34)*cirrus(d)*.24;
  return col;
}

float waveH(vec2 P, float fp){
  float h = 0., a = .5, f = .30;
  for (int i = 0; i < 7; i++){
    h += a*clamp(1. - f*fp*1.6, 0., 1.)*gnoise(vec2(P.x*.45, P.y)*f + float(i)*7.3);
    f *= 2.07; a *= .44;
  }
  return h*.34;
}
vec3 seaCol(vec3 d){
  float dep = max(-d.y, 1e-4);
  vec3 m = vec3(d.x, dep, d.z);
  vec2 P = vec2(d.x, d.z)/dep;
  float fp = (KF/uRes.y)/(dep*dep) + .002;   // 一个像素在海面上覆盖多远
  float e = clamp(fp*.6, .015, 2.);
  float h0 = waveH(P, fp);
  vec2 sl = vec2(waveH(P + vec2(e, 0.), fp) - h0, waveH(P + vec2(0., e), fp) - h0)/e;
  vec3 Nn = normalize(vec3(-sl.x, 1., -sl.y));
  vec3 r = reflect(d, Nn);
  r.y = max(r.y, .004);
  r = normalize(r);
  float F = .02 + .98*pow(1. - max(dot(-d, Nn), 0.), 5.);
  vec3 refl = skyAll(r, true);
  vec3 col = vec3(.002, .006, .011)*(1. - F) + refl*F*.85;
  vec2 qm = moonQ(m);
  float colW = exp(-pow(qm.x/.46, 2.));
  float vert = exp(-dep/.12);
  float streak = .08 + .92*pow(clamp(.5 + 1.3*gnoise(vec2(P.x*.75, P.y*.55)), 0., 1.), 3.);
  float sparkle = pow(clamp(gnoise(vec2(P.x*3.0, P.y*3.6))*1.4 + .15, 0., 1.), 7.);
  vec3 mc = extinct(vec3(1., .95, .88)*MOON_I, 2.5);
  col += mc*colW*vert*(.10*streak + .35*sparkle*exp(-dep/.22));
  return col;
}

float rockSD(vec2 p){
  float d = min(min(sdEllipse(p, vec2(.105, -.556), vec2(.205, .150)), sdEllipse(p, vec2(-.215, -.565), vec2(.15, .078))), sdEllipse(p, vec2(.285, -.47), vec2(.07, .052)));
  return d + .010*gnoise(p*22.) + .0045*gnoise(p*75.);
}
float figureSD(vec2 p, vec2 f){
  vec2 q = p - f; float h = .058;
  float d = length((q - vec2(.0004, h*.905))*vec2(1., .92)) - h*.072;               // 头
  d = min(d, sdTaper(q, vec2(.0002, h*.84), vec2(.0001, h*.80), h*.030, h*.034));   // 脖子
  // 大衣：肩宽、下摆略收，手插在兜里，胳膊贴着身子
  d = min(d, sdTaper(q, vec2(0., h*.775), vec2(.0004, h*.33), h*.098, h*.088));
  d = min(d, sdTaper(q, vec2(-.0050, h*.76), vec2(-.0058, h*.48), h*.032, h*.036));
  d = min(d, sdTaper(q, vec2(.0050, h*.76), vec2(.0060, h*.48), h*.032, h*.036));
  d = min(d, sdTaper(q, vec2(-.0018, h*.34), vec2(-.0024, 0.), h*.036, h*.030));    // 腿
  d = min(d, sdTaper(q, vec2(.0018, h*.34), vec2(.0030, 0.), h*.036, h*.030));
  return d;
}
void main(){
  KF = 2.*tan(radians(uFov)*.5);
  float e0 = radians(uMoonElev);
  MD = vec3(0., sin(e0), cos(e0)); MR = vec3(1., 0., 0.); MU = normalize(cross(MD, MR));
  TANA = tan(radians(uMoonRad));
  vec2 p; vec3 d = camRay(gl_FragCoord.xy, p);
  float yh = .5*uRes.y - tan(radians(uPitch))/KF*uRes.y;   // 地平线的像素高度
  vec3 col = d.y >= 0. ? skyAll(d, false) : seaCol(d);

  // 左边远处的海岸和城市灯火
  float az = atan(d.x, d.z), e = elevDeg(d);
  float side = smoothstep(-.05, -.13, az);
  float degPx = uFov/uRes.y;
  float hl = (.30 + .55*(fbmN(vec2(az*15., .5), 5)*.9 + .5) + 1.1*smoothstep(-.17, -.34, az))*side;
  float land = (1. - smoothstep(hl - degPx, hl + degPx, e))*step(-degPx*.5, e);
  vec3 landC = mix(vec3(.008, .011, .019), skyCol(vec3(d.x, .02, d.z))*.6, .28);
  col = mix(col, landC, land);
  float x = gl_FragCoord.x, y = gl_FragCoord.y;
  float cw = 5.;
  float ci = floor(x/cw);
  float hh = hash11(ci*1.37 + 4.);
  vec2 lp = vec2((ci + .2 + .6*hash11(ci + 9.1))*cw, yh + 1.5 + 9.*pow(hash11(ci + 2.3), 1.5));
  float lightOK = step(.38, hh)*smoothstep(.4, .8, side);
  float lb = pow(hash11(ci + 5.5), 2.5)*2.2 + .25;
  vec3 lc = mix(vec3(1., .66, .32), vec3(.95, .92, .85), step(.7, hash11(ci + 8.8)));
  float dl = length(vec2(x, y) - lp);
  col += lc*lb*lightOK*exp(-dl*dl/1.4)*1.6;
  if (y < yh){
    float sx = abs(x - lp.x);
    float st = .35 + .65*smoothstep(-.2, .5, gnoise(vec2(x*.05, y*.45)));
    col += lc*lb*lightOK*exp(-sx*sx/1.8)*exp(-(yh - y)/34.)*st*.35;
  }

  // 前景礁石和看月亮的人
  float aa = 1.4/uRes.y;
  float rs = rockSD(p);
  float rm = 1. - smoothstep(-aa, aa, rs);
  vec3 rockC = vec3(.0045, .005, .008);
  float edge = exp(-max(-rs, 0.)/.0035)*rm;
  rockC += vec3(.30, .18, .10)*edge*.10*smoothstep(-.6, -.40, p.y);
  col = mix(col, rockC, rm);
  float fs = figureSD(p, vec2(.036, -.414));
  col = mix(col, vec3(.003), 1. - smoothstep(-aa*.8, aa*.8, fs));
  fragColor = vec4(col, 1.);
}
`,
  text(ctx) {
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.fillStyle = 'rgba(244,232,218,0.82)';
    ctx.font = '500 30px "Cormorant Garamond"';
    ctx.letterSpacing = '12px';
    ctx.fillText('WHAT IF', 546, 268);
    ctx.shadowColor = 'rgba(0,0,0,0.45)';
    ctx.shadowBlur = 30;
    ctx.fillStyle = '#F7EFE6';
    ctx.font = '600 100px "Noto Serif SC"';
    ctx.letterSpacing = '8px';
    ctx.fillText('如果月亮掉下来', 544, 392);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(244,232,218,0.55)';
    ctx.fillRect(500, 432, 80, 2);
    ctx.shadowBlur = 0;
    ctx.fillStyle = 'rgba(244,232,218,0.78)';
    ctx.font = '300 30px "Noto Serif SC"';
    ctx.letterSpacing = '12px';
    ctx.fillText('第一集', 546, 488);
    ctx.shadowColor = 'rgba(0,0,0,0.65)';
    ctx.shadowBlur = 18;
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 58px "Noto Serif SC"';
    ctx.letterSpacing = '3px';
    ctx.fillText('最先变的，不是它的大小', 541, 1488);
  },
  watermark: { color: 'rgba(255,255,255,0.78)', font: '500 34px "Noto Serif SC"' },
};

STYLE_A.A2 = {
  hdr: true,
  tiles: 24,
  uniforms: { uFov: 70, uAz: 130, uPitch: 28, uRoll: -10, uLat: 30, uHour: 19.6, uDecl: 20 },
  post: { exposure: 1.35, thr: 0.90, bloom1: 0.50, bloom2: 0.62, sigma1: 5, sigma2: 9, grain: 0.04, vig: 0.45,
          sat: 1.0, contrast: 1.05, shadowTint: [-0.004, 0.004, 0.018], highTint: [0.014, 0.006, -0.008], lift: [0.004, 0.008, 0.018] },
  fs: GLSL_HEAD + GLSL_COMMON + `
uniform float uFov, uAz, uPitch, uRoll, uLat, uHour, uDecl;
vec3 P0, U, E, N, S;

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
      s += tint*b*exp(-pow(length(f - pos)*w, 2.));
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
  P0 = vec3(cos(lat), 0., sin(lat));
  U = P0; E = vec3(0., 1., 0.); N = vec3(-sin(lat), 0., cos(lat));
  float H = radians((uHour - 12.)*15.), de = radians(uDecl);
  S = normalize(vec3(cos(de)*cos(H), -cos(de)*sin(H), sin(de)));
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

  // 光环：赤道面上 1.25~2.65 个地球半径
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
      float perp = length(Hp - hs*S);
      float lit = hs > 0. ? 1. : smoothstep(.975, 1.03, perp);
      vec3 tint = mix(vec3(1., .90, .76), vec3(.92, .94, 1.), clamp(fbmN(vec2(r*9., 8.), 3)*1.5 + .5, 0., 1.));
      vec3 rc = tint*(.02 + 1.95*lit*abs(S.z)*2.2)*(.75 + .5*bands);
      float ang = atan(Hp.y, Hp.x);
      float glint = pow(hash12(floor(vec2(ang*2400., r*900.))), 60.)*3.;   // 碎块反光
      rc *= 1. + glint;
      ringC = extinct(rc, max(elev, .3));
    }
  }
  col += st*(1. - ringA);
  col = mix(col, ringC, ringA*.96);
  col += ringC*ringA*.0;

  // 碎块落下来：几颗流星
  for (int i = 0; i < 6; i++){
    float fi = float(i);
    vec2 a = vec2(-.24 + .48*hash11(fi*7.3 + 1.), .02 + .40*hash11(fi*3.1 + 2.));
    vec2 dir = normalize(vec2(-.35 - .3*hash11(fi + 5.), -1.));
    float len = .035 + .09*hash11(fi*1.7 + 9.);
    vec2 b = a + dir*len;
    float d = sdSeg(p, a, b), h = segT(p, a, b);
    float br = (.6 + 2.2*hash11(fi + 3.3))*smoothstep(0., 1., h);
    vec3 mc = mix(vec3(1., .55, .25), vec3(1., .95, .85), h*h);
    col += mc*br*(exp(-pow(d/.0008, 2.)) + .08*exp(-d/.005));
  }

  // 远山（带雾）和近处的山脊
  float far = -.355 + .035*fbmN(vec2(p.x*2.6, 1.), 5) + .02*ridged(vec2(p.x*5., 4.), 4);
  float aa = 1.4/uRes.y;
  col = mix(col, mix(col, vec3(.012, .018, .032), .85), 1. - smoothstep(-aa, aa, p.y - far));
  float ridge = -.40 + .045*fbmN(vec2(p.x*3.2 + 7., 2.), 6) + .025*ridged(vec2(p.x*7. + 2., 5.), 4) + .05*smoothstep(.05, .30, p.x);
  float g = p.y - ridge;
  float gm = 1. - smoothstep(-aa, aa, g);
  vec3 gc = vec3(.003, .004, .007) + vec3(.05, .055, .07)*exp(-max(-g, 0.)/.0035)*.6;
  col = mix(col, gc, gm);
  // 山脊上的人，仰头
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
`,
  text(ctx) {
    ctx.textAlign = 'center';
    ctx.shadowColor = 'rgba(0,0,0,0.7)';
    ctx.shadowBlur = 20;
    ctx.fillStyle = 'rgba(255,255,255,0.86)';
    ctx.font = '500 44px "Noto Serif SC"';
    ctx.letterSpacing = '3px';
    ctx.fillText('它不会砸到你头上', 541, 1392);
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '600 58px "Noto Serif SC"';
    ctx.fillText('会先碎掉，变成一道光环', 541, 1474);
  },
  watermark: { color: 'rgba(255,255,255,0.78)', font: '500 34px "Noto Serif SC"' },
};

