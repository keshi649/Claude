// 海面镜头：开头的巨大月亮（黄昏）、贴着海面的浪（"是海"）、结尾正常大小的月亮（夜里）。
// 同一个着色器，参数不同：视角、俯仰、月亮的高度和大小、黄昏 / 夜晚、浪的大小、要不要前景礁石和人。
const SHOTS = {};

const SEA_FS = GLSL_HEAD + GLSL_COMMON + `
uniform float uFov, uPitch, uMoonElev, uMoonRad, uMoonAz, uNight, uCamH, uWave, uRock, uCoast, uMoonI, uZoom0, uTideRise, uRoll;
vec3 MD, MR, MU; float TANA, KF;

vec3 camRay(vec2 fc, out vec2 p){
  p = (fc - .5*uRes)/uRes.y;
  float cr = cos(radians(uRoll)), sr = sin(radians(uRoll));
  vec2 pr = vec2(cr*p.x - sr*p.y, sr*p.x + cr*p.y);
  vec3 d = normalize(vec3(pr*KF, 1.));
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
  vec3 n = mix(vec3(.022, .036, .070), vec3(.004, .009, .026), smoothstep(0., 40., e));
  n += vec3(.012, .020, .034)*exp(-max(e, 0.)/4.);
  return mix(c, n, uNight);
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
  float e = elevDeg(d), az = atan(d.x, d.z) + uTime*.004;
  float n = fbmN(vec2(az*7.5, e*.85) + vec2(3.2, 1.1), cheap ? 4 : 6);
  float n2 = cheap ? 0. : fbmN(vec2(az*24., e*2.6) + 7.7, 4);
  float seg = smoothstep(-.10, .25, fbmN(vec2(az*3.2, 11.), 4));
  float band = exp(-pow((e - 2.4)/1.3, 2.)) + .95*exp(-pow((e - 5.4)/.65, 2.))*seg;
  return smoothstep(.0, .55, band*(.60 + n*1.5 + n2*.45) - .36)*(1. - .55*uNight);
}
float cirrus(vec3 d){
  float e = elevDeg(d), az = atan(d.x, d.z) + uTime*.003;
  float n = fbmN(vec2(az*2.6 + e*.05, e*.30) + 21., 6);
  float st = fbmN(vec2(az*16. - e*.5, e*.22) + 3., 4);
  return smoothstep(.06, .36, n + .28*st)*smoothstep(14., 21., e);
}
float stars(vec3 d){
  float e = elevDeg(d);
  float lo = mix(18., 3., uNight);
  if (e < lo - 2.) return 0.;
  vec2 sc = vec2(atan(d.x, d.z), asin(d.y))*420.;
  vec2 c = floor(sc), f = fract(sc);
  if (hash12(c) > mix(.22, .30, uNight)) return 0.;
  vec2 pos = hash22(c + 3.1)*.8 + .1;
  float b = pow(hash12(c + 9.7), 10.)*1.4 + .03;
  float tw = .8 + .2*sin(uTime*3. + hash12(c)*30.);
  return mix(.6, 1.3, uNight)*b*tw*exp(-pow(length(f - pos)*7., 2.))*smoothstep(lo, lo + 10., e);
}

vec3 skyAll(vec3 d, bool mirror){
  float e = elevDeg(d);
  vec3 col = skyCol(d);
  if (!mirror) col += vec3(.85, .9, 1.)*stars(d);
  float gam = acos(clamp(dot(d, MD), -1., 1.));
  float rr = radians(uMoonRad);
  float ex = max(gam - rr, 0.);
  vec3 hcol = mix(vec3(1., .70, .46), vec3(.75, .82, 1.), uNight);
  vec3 halo = hcol*(.30*exp(-ex/radians(2.2 + rr*20.)) + .10*exp(-ex/radians(9.)));
  col += extinct(halo, max(e, .5))*uMoonI*mix(.32, .20, uNight);
  vec2 q = moonQ(d);
  float cover;
  vec3 m = moonShade(q, KF/(uRes.y*TANA)*1.2, mirror, cover)*uMoonI;
  m = extinct(m, max(e, .2)) + skyCol(d)*.22;
  col = mix(col, m, cover);
  float cd = cloudDens(d, mirror);
  float nearMoon = exp(-max(length(q) - 1., 0.)*2.4);
  vec3 cloudC = skyCol(d)*.40 + vec3(.012, .010, .013);
  cloudC += extinct(mix(vec3(1., .66, .42), vec3(.8, .85, 1.), uNight), max(e, .5))*uMoonI*(.05*nearMoon + .55*cover*pow(1. - cd, 2.2));
  col = mix(col, cloudC, cd*.94);
  col += vec3(.60, .33, .34)*cirrus(d)*.24*(1. - uNight);
  return col;
}

float waveH(vec2 P, float fp){
  float h = 0., a = .5, f = .30;
  vec2 drift = vec2(.08, 1.)*uTime*.9;
  for (int i = 0; i < 7; i++){
    vec2 Q = (vec2(P.x*.45, P.y) + drift*(1. + .25*float(i)))*f;
    h += a*clamp(1. - f*fp*1.6, 0., 1.)*gnoise(Q + float(i)*7.3);
    f *= 2.07; a *= .44;
  }
  return h*.34*uWave;
}
vec3 seaCol(vec3 d){
  float dep = max(-d.y, 1e-4);
  vec2 P = vec2(d.x, d.z)/dep*uCamH;
  float fp = (KF/uRes.y)/(dep*dep)*uCamH + .002;
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
  vec2 qm = moonQ(vec3(d.x, dep, d.z));
  float colW = exp(-pow(qm.x/.46, 2.));
  float vert = exp(-dep/.12);
  float streak = .08 + .92*pow(clamp(.5 + 1.3*gnoise(vec2(P.x*.75, P.y*.55 + uTime*.6)), 0., 1.), 3.);
  float sparkle = pow(clamp(gnoise(vec2(P.x*3.0, P.y*3.6 + uTime*2.)*1.)*1.4 + .15, 0., 1.), 7.);
  vec3 mc = extinct(vec3(1., .95, .88)*uMoonI, max(uMoonElev - uMoonRad*.7, 1.5));
  col += mc*colW*vert*(.10*streak + .35*sparkle*exp(-dep/.22));
  // 白浪：坡陡的地方泛白
  float foam = smoothstep(.55, 1.1, length(sl))*uWave*.06;
  col += vec3(.55, .6, .7)*foam*(skyCol(vec3(0., .2, 1.)).b*6.);
  return col;
}

float rockSD(vec2 p){
  float d = min(min(sdEllipse(p, vec2(.105, -.556), vec2(.205, .150)), sdEllipse(p, vec2(-.215, -.565), vec2(.15, .078))), sdEllipse(p, vec2(.285, -.47), vec2(.07, .052)));
  return d + .010*gnoise(p*22.) + .0045*gnoise(p*75.);
}
float figureSD(vec2 p, vec2 f){
  vec2 q = p - f; float h = .058;
  float d = length((q - vec2(.0004, h*.905))*vec2(1., .92)) - h*.072;
  d = min(d, sdTaper(q, vec2(.0002, h*.84), vec2(.0001, h*.80), h*.030, h*.034));
  d = min(d, sdTaper(q, vec2(0., h*.775), vec2(.0004, h*.33), h*.098, h*.088));
  d = min(d, sdTaper(q, vec2(-.0050, h*.76), vec2(-.0058, h*.48), h*.032, h*.036));
  d = min(d, sdTaper(q, vec2(.0050, h*.76), vec2(.0060, h*.48), h*.032, h*.036));
  d = min(d, sdTaper(q, vec2(-.0018, h*.34), vec2(-.0024, 0.), h*.036, h*.030));
  d = min(d, sdTaper(q, vec2(.0018, h*.34), vec2(.0030, 0.), h*.036, h*.030));
  return d;
}

void main(){
  KF = 2.*tan(radians(uFov)*.5);
  float e0 = radians(uMoonElev), a0 = radians(uMoonAz);
  MD = vec3(sin(a0)*cos(e0), sin(e0), cos(a0)*cos(e0));
  MR = normalize(vec3(MD.z, 0., -MD.x));
  MU = normalize(cross(MD, MR));
  TANA = tan(radians(uMoonRad));
  vec2 p; vec3 d = camRay(gl_FragCoord.xy, p);
  vec3 col = d.y >= 0. ? skyAll(d, false) : seaCol(d);

  // 左边远处的海岸和城市灯火（按方位角分格，镜头推近时跟着一起放大）
  float az = atan(d.x, d.z), e = elevDeg(d);
  float degPx = uFov/uRes.y;
  if (uCoast > 0.){
    float side = smoothstep(-.05, -.13, az);
    float hl = (.30 + .55*(fbmN(vec2(az*15., .5), 5)*.9 + .5) + 1.1*smoothstep(-.17, -.34, az))*side;
    float land = (1. - smoothstep(hl - degPx, hl + degPx, e))*step(-degPx*.5, e);
    vec3 landC = mix(vec3(.008, .011, .019), skyCol(vec3(d.x, .02, d.z))*.6, .28);
    col = mix(col, landC, land*uCoast);
    float cw = radians(degPx)*5.;
    float ci = floor(az/cw);
    float hh = hash11(ci*1.37 + 4.);
    float laz = (ci + .2 + .6*hash11(ci + 9.1))*cw;
    float lel = degPx*(1.5 + 9.*pow(hash11(ci + 2.3), 1.5));
    float ok = step(.38, hh)*smoothstep(.4, .8, side)*uCoast;
    float lb = (pow(hash11(ci + 5.5), 2.5)*2.2 + .25)*(.85 + .15*sin(uTime*2. + ci));
    vec3 lc = mix(vec3(1., .66, .32), vec3(.95, .92, .85), step(.7, hash11(ci + 8.8)));
    vec2 dl = vec2((az - laz)/radians(degPx), (e - lel)/degPx);
    col += lc*lb*ok*exp(-dot(dl, dl)/1.4)*1.6;
    if (e < 0.){
      float st = .35 + .65*smoothstep(-.2, .5, gnoise(vec2(az*900., e*30. + uTime*1.5)));
      col += lc*lb*ok*exp(-dl.x*dl.x/1.8)*exp(-(-e)/(34.*degPx))*st*.35;
    }
  }

  // 前景礁石和看月亮的人（镜头推近时一起放大）
  if (uRock > 0.){
    vec2 pr = p*(tan(radians(uFov)*.5)/tan(radians(uZoom0)*.5));
    float aa = 1.4/uRes.y;
    float rs = rockSD(pr);
    float rm = (1. - smoothstep(-aa, aa, rs))*uRock;
    vec3 rockC = vec3(.0045, .005, .008);
    rockC += vec3(.30, .18, .10)*exp(-max(-rs, 0.)/.0035)*.10*smoothstep(-.6, -.40, pr.y)*(1. - uNight*.6);
    col = mix(col, rockC, rm);
    float fs = figureSD(pr, vec2(.036, -.414));
    col = mix(col, vec3(.003), (1. - smoothstep(-aa*.8, aa*.8, fs))*uRock);
  }
  fragColor = vec4(col, 1.);
}
`;

const POST_DUSK = { exposure: 1.55, thr: 1.15, bloom1: .32, bloom2: .40, sigma1: 5, sigma2: 8, grain: .035, vig: .42,
  sat: 1.04, contrast: 1.04, shadowTint: [-.006, .004, .016], highTint: [.012, .004, -.010], lift: [.006, .010, .020] };
const POST_NIGHT = { exposure: 1.45, thr: 1.0, bloom1: .38, bloom2: .48, sigma1: 5, sigma2: 9, grain: .04, vig: .46,
  sat: 1.0, contrast: 1.05, shadowTint: [-.004, .004, .018], highTint: [.006, .006, .004], lift: [.004, .008, .018] };

// 开头：海上升起的巨大月亮，镜头慢慢推近
SHOTS.hookSea = {
  fs: SEA_FS,
  uniforms(t, lt) {
    const k = easeInOut(lt / 4.2);
    return { uFov: lerp(52, 46.5, k), uPitch: lerp(8, 9.2, k), uMoonElev: 9.2 + .35 * lt, uMoonRad: 9.6, uMoonAz: 0, uNight: 0, uRoll: 0,
             uCamH: 1, uWave: 1, uRock: 1, uCoast: 1, uMoonI: 2.15, uZoom0: 52, uTideRise: 0 };
  },
  post: POST_DUSK,
  overlay(t) {
    if (window.COVER) {          // 封面：片名放大成两行，缩成小格子也看得清
      OV.text('WHAT IF · 第一集', 540, 262, { weight: 500, size: 34, spacing: 10, color: [244, 232, 218], alpha: .85, shadow: 10 });
      OV.text('如果月亮', 540, 420, { weight: 700, size: 150, spacing: 10, color: [247, 239, 230], shadow: 40 });
      OV.text('掉下来', 540, 590, { weight: 700, size: 150, spacing: 10, color: [255, 212, 150], shadow: 40 });
      return;
    }
    const fo = 1 - smooth(LN.d1.t0 - .25, LN.d1.t0 + .05, t);      // 片名让位给问题
    const fi = smooth(0, .35, t);
    OV.text('WHAT IF', 546, 268, { font: LATIN, weight: 600, size: 30, spacing: 12, color: [244, 232, 218], alpha: .82 * fi * fo, shadow: 10 });
    OV.text('如果月亮掉下来', 544, 392, { weight: 600, size: 100, spacing: 8, color: [247, 239, 230], alpha: fi * fo, shadow: 30, scale: 1 + .02 * clamp01(t / 3) });
    OV.line(500, 433, 580, 433, { color: [244, 232, 218], alpha: .55 * fi * fo, width: 2 });
    OV.text('第一集', 546, 488, { weight: 300, size: 30, spacing: 12, color: [244, 232, 218], alpha: .78 * fi * fo, shadow: 8 });
    // 常见答案打出来，旁白一说"不"就划掉
    const d1 = LN.d1;
    if (t >= d1.t0 && t < MK('h2', 0) + .05) {
      const n = [...d1.text].length;
      const shown = Math.min(n, Math.floor((t - d1.t0) * 18) + 1);
      const s = [...d1.text].slice(0, shown).join('');
      const a = 1 - smooth(MK('h2', 0) - .25, MK('h2', 0), t);
      OV.text(s, 540, 400, { weight: 600, size: 84, spacing: 4, color: [255, 255, 255], alpha: a, shadow: 30 });
      const k = smooth(S('h2'), S('h2') + .25, t);
      if (k > 0) {
        OV.ctx.save();
        OV.ctx.font = `600 84px ${SERIF}`;
        OV.ctx.letterSpacing = '4px';
        const w = OV.ctx.measureText(d1.text).width;
        OV.ctx.restore();
        OV.line(540 - w / 2 - 10, 371, 540 - w / 2 - 10 + (w + 20) * k, 371, { color: [235, 70, 60], width: 8, alpha: a, shadow: 6 });
      }
    }
  },
};

// "是海"：贴着海面，浪一道道压过来，月亮更大更高
SHOTS.waveClose = {
  fs: SEA_FS,
  uniforms(t, lt) {
    return { uFov: 66, uPitch: 9 + .6 * lt, uMoonElev: 24 + .5 * lt, uMoonRad: 12.5, uMoonAz: -15, uNight: .7, uRoll: -7 + 1.2 * lt,
             uCamH: .16, uWave: 2.8, uRock: 0, uCoast: 0, uMoonI: 2.5, uZoom0: 66, uTideRise: 0 };
  },
  post: Object.assign({}, POST_NIGHT, { exposure: 1.45 }),
  overlay(t, lt) {
    const t0 = MK('h2', 0);
    const a = smooth(t0 - .02, t0 + .12, t) * (1 - smooth(S('t1') + .2, S('t1') + .6, t));
    OV.text('是海。', 540, 1130, { weight: 700, size: 150, spacing: 10, alpha: a, shadow: 44, shadowColor: 'rgba(0,0,0,.85)', scale: 1 + .12 * (1 - easeOut((t - t0) / .3)) });
  },
};

// 结尾：真实的月亮，正常大小，高高挂着；镜头慢慢拉远
SHOTS.twist = {
  fs: SEA_FS,
  uniforms(t, lt) {
    const pull = smooth(S('w3'), SE('twist') + 1.5, t);
    return { uFov: lerp(44, 52, pull), uPitch: lerp(15, 13, pull), uMoonElev: 24, uMoonRad: lerp(1.45, 1.1, pull), uMoonAz: 2, uNight: 1, uRoll: 0,
             uCamH: 1, uWave: .7, uRock: 1, uCoast: 1, uMoonI: 3.2, uZoom0: 52, uTideRise: 0 };
  },
  post: POST_NIGHT,
};
