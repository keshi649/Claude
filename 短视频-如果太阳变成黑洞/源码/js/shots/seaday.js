// 海边的几个镜头，同一个着色器：
//   beach：白天的海，太阳在前上方，海面一条碎金；礁石上坐着一个人（倒计时出现）
//   sunUp：抬头看太阳（"太阳还好好地亮着"）
//   zeroSea：背对太阳看海和月亮；倒计时到 0，天一下子全黑；月亮多亮一两秒（它反射的光还在路上），然后也灭了；
//            眼睛慢慢适应（后期曝光往上提），星星、银河出来，远处海岸的灯亮起来
//   starSea：银河横跨海面（"原来白天，也有满天的星星"）
//   freeze：海面结冰（cold 那一幕）
//   sunrise：真实世界的日出（结尾的收藏卡垫在下面）
// 天空单位：白天的天空大约 0.5~1；星星、银河乘 SKY_NIGHT 那么小，白天被天光盖住，天黑以后靠后期曝光提上来。
const SEA_FS = GLSL_HEAD + GLSL_COMMON + SKY_GLSL + `
uniform float uFov, uYaw, uPitch, uRoll, uCamH, uWave;
uniform float uSunAz, uSunEl, uSunOn, uMoonAz, uMoonEl, uMoonRad, uMoonOn;
uniform float uRock, uCoast, uCoastLights, uCloud, uIce, uSnow, uNightK, uMW;
vec3 SD, MD, MR, MU; float KF;

vec3 dirFrom(float az, float el){ float a = radians(az), e = radians(el); return vec3(sin(a)*cos(e), sin(e), cos(a)*cos(e)); }
vec3 camRay(vec2 fc, out vec2 p){
  p = (fc - .5*uRes)/uRes.y;
  float cr = cos(radians(uRoll)), sr = sin(radians(uRoll));
  vec2 pr = vec2(cr*p.x - sr*p.y, sr*p.x + cr*p.y);
  vec3 F = dirFrom(uYaw, uPitch);
  vec3 R = normalize(vec3(F.z, 0., -F.x));
  vec3 U = cross(F, R);
  return normalize(F + KF*(pr.x*R + pr.y*U));
}
float elevDeg(vec3 d){ return degrees(asin(clamp(d.y, -1., 1.))); }
float airmass(float e){ e = max(e, -.4); return 1./(sin(radians(e)) + .50572*pow(e + 6.07995, -1.6364)); }
vec3 extinct(vec3 c, float e){ return c*exp(-vec3(.060, .115, .240)*airmass(e)); }

// 白天的天空：天顶深蓝，地平线发白；太阳周围一圈亮（米氏散射）；太阳低的时候地平线发暖
vec3 daySky(vec3 d){
  float e = max(d.y, 0.);
  float cg = max(dot(d, SD), 0.);
  float low = 1. - smoothstep(1., 16., uSunEl);
  vec3 zen = mix(vec3(.030, .095, .330), vec3(.10, .14, .32), low);
  vec3 hor = mix(vec3(.30, .46, .70), vec3(1.0, .56, .30), low*(.35 + .65*pow(cg, 2.)));
  vec3 c = mix(hor, zen, pow(e, mix(.42, .35, low)));
  c += vec3(1., .90, .76)*(pow(cg, 8.)*.10 + pow(cg, 90.)*.40 + pow(cg, 900.)*1.8)*(1. + 2.5*low);
  c += vec3(.14, .17, .22)*exp(-e*22.)*(1. - low*.6);
  float dayI = smoothstep(-5., 8., uSunEl);
  return c*mix(.15, 1., dayI);
}
vec2 moonQ(vec3 d){ return vec2(dot(d, MR), dot(d, MU))/(max(dot(d, MD), 1e-4)*tan(radians(uMoonRad))); }
// 月亮：月海（分形噪声）+ 一层环形山；亮的一面朝着太阳
vec3 moonDisc(vec3 d, out float cover){
  vec2 q = moonQ(d);
  float r = length(q);
  float aa = KF/(uRes.y*tan(radians(uMoonRad)))*1.3;
  cover = 1. - smoothstep(1. - aa, 1. + aa, r);
  if (r > 1. + aa) return vec3(0.);
  vec2 qq = r > .999 ? q/r*.999 : q;
  vec3 n = vec3(qq, sqrt(max(1. - dot(qq, qq), 0.)));
  float m = fbm3N(n*1.6 + vec3(3.1, 1.7, .4), 5);
  float alb = mix(1., .55, smoothstep(-.07, .09, m))*(.85 + .3*(fbm3N(n*6.5 + 4.2, 4) + .35));
  vec3 L = normalize(vec3(dot(SD, MR), dot(SD, MU), -dot(SD, MD)));
  float ci = max(dot(n, L), 0.), ce = max(n.z, .03);
  float shade = mix(ci, 2.*ci/(ci + ce), .55);
  return vec3(1., .97, .93)*alb*shade;
}
float cloudDens(vec3 d, bool cheap){
  float e = elevDeg(d); float az = atan(d.x, d.z) + uTime*.003;
  float n = fbmN(vec2(az*6., e*.55) + vec2(3.2, 1.1), cheap ? 4 : 6);
  float n2 = cheap ? 0. : fbmN(vec2(az*20., e*1.9) + 7.7, 4);
  float band = exp(-pow((e - 4.5)/3.2, 2.)) + .6*exp(-pow((e - 13.)/3., 2.))*smoothstep(-.1, .3, fbmN(vec2(az*2.5, 5.), 3));
  return smoothstep(.0, .5, band*(.55 + n*1.6 + n2*.4) - .42)*uCloud;
}
// 整片天：白天的天 + 太阳 + 月亮 + 云；星星和银河一直都在（很暗），天光没了才显出来
const float SKY_NIGHT = .020;
vec3 skyAll(vec3 d, bool mirror, float px){
  float e = elevDeg(d);
  vec3 day = daySky(d)*uSunOn;
  vec3 night = (milky(d, px)*uMW + (mirror ? vec3(0.) : starsHQ(d, px, 1.)))*SKY_NIGHT*smoothstep(-1., 4., e);
  night += vec3(.0010, .0016, .0026)*exp(-max(e, 0.)/6.)*uNightK;       // 天黑以后地平线一点点气辉
  vec3 col = day + night;
  // 太阳
  float ga = acos(clamp(dot(d, SD), -1., 1.));
  float sr = radians(.55);
  float sd = 1. - smoothstep(sr*.92, sr*1.08, ga);
  vec3 sunc = extinct(vec3(1., .93, .82)*30., max(uSunEl, .3));
  col += sunc*sd*uSunOn*(mirror ? .0 : 1.);
  // 月亮：白天淡淡的（亮度和天差不多），天黑以后在黑天里格外亮
  float cover;
  vec3 m = moonDisc(d, cover)*uMoonOn*.85;
  if (!mirror) col = mix(col, m + day*.55, cover);
  // 云：白天被照亮；太阳没了以后是挡住星星的黑影
  float cd = cloudDens(d, mirror);
  vec3 cl = (vec3(1., .97, .94)*mix(.75, 1.0, pow(max(dot(d, SD), 0.), 4.)) + vec3(.2, .25, .35)*.3)*(.55 + .45*smoothstep(0., 12., e));
  cl *= mix(vec3(1.), vec3(1., .62, .38), 1. - smoothstep(2., 14., uSunEl));
  col = mix(col, cl*uSunOn*daySky(vec3(0., 1., 0.)).b*2.2 + night*.05, cd*.92);
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
// 冰：大块浮冰之间是黑水（uIce < 1），冻实以后是一整片，上面有雪、压力脊和裂缝
float iceCover(vec2 P){
  vec2 Q = P*.07 + .9*vec2(fbmN(P*.03, 3), fbmN(P*.03 + 5.2, 3)); vec2 ip = floor(Q), fp = fract(Q);
  float d1 = 9., d2 = 9.;
  for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
    vec2 g = vec2(float(x), float(y)); vec2 v = g + hash22(ip + g) - fp; float dd = dot(v, v);
    if (dd < d1){ d2 = d1; d1 = dd; } else if (dd < d2) d2 = dd;
  }
  float edge = sqrt(d2) - sqrt(d1);
  return smoothstep(.02, .07 + (1. - uIce)*.5, edge - (1. - uIce)*.35);
}
vec3 seaCol(vec3 d, float px){
  float dep = max(-d.y, 1e-4);
  vec2 P = vec2(d.x, d.z)/dep*uCamH;
  float fp = (KF/uRes.y)/(dep*dep)*uCamH + .002;
  float e = clamp(fp*.6, .015, 2.);
  float ice = uIce > 0. ? iceCover(P) : 0.;
  float wv = 1. - ice;
  float h0 = waveH(P, fp)*wv;
  vec2 sl = vec2(waveH(P + vec2(e, 0.), fp)*wv - h0, waveH(P + vec2(0., e), fp)*wv - h0)/e;
  vec3 Nn = normalize(vec3(-sl.x, 1., -sl.y));
  if (ice > 0.){
    // 冰面：很平，有一点起伏和压力脊；雪的反照率高
    float rg = ridged(P*.06 + 3., 4);
    float sn = smoothstep(.35, .75, fbmN(P*.05 + 9., 4) + .3*uSnow);
    vec2 g2 = vec2(fbmN(P*.4 + 1., 3), fbmN(P*.4 + 7., 3));
    Nn = normalize(mix(Nn, normalize(vec3(g2.x*.25 + (rg - .5)*.4, 1., g2.y*.25)), ice));
    float cr = 0.;
    {
      vec2 Q = P*.22 + .7*vec2(fbmN(P*.08 + 2., 3), fbmN(P*.08 + 8., 3)); vec2 ip = floor(Q), f2 = fract(Q); float a1 = 9., a2 = 9.;
      for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){ vec2 g = vec2(float(x), float(y)); vec2 v = g + hash22(ip + g + 5.) - f2; float dd = dot(v, v); if (dd < a1){ a2 = a1; a1 = dd; } else if (dd < a2) a2 = dd; }
      cr = (1. - smoothstep(.0, .03 + fp*.3, sqrt(a2) - sqrt(a1)))*smoothstep(.1, .5, fbmN(P*.05 + 3., 3) + .3);
    }
    vec3 r = reflect(d, Nn); r.y = abs(r.y);
    float F = .03 + .97*pow(1. - max(dot(-d, Nn), 0.), 5.);
    vec3 sky = skyAll(normalize(r), true, px);
    vec3 amb = (daySky(vec3(0., 1., 0.))*uSunOn + vec3(.0040, .0058, .0095)*uNightK);   // 天光（天黑以后只剩星光）
    vec3 alb = mix(vec3(.50, .66, .80), vec3(.95, .97, 1.), sn)*(.80 + .35*rg)*(.9 + .2*fbmN(P*.6, 3));
    vec3 iceC = alb*amb*(.6 + .4*Nn.y) + sky*F*mix(.9, .25, sn);
    iceC *= 1. - cr*.55;
    vec3 water = sky*.6*F;
    return mix(water, iceC, ice);
  }
  vec3 r = reflect(d, Nn);
  r.y = max(r.y, .004);
  r = normalize(r);
  float F = .02 + .98*pow(1. - max(dot(-d, Nn), 0.), 5.);
  vec3 refl = skyAll(r, true, px);
  // 太阳的碎金：反射方向贴近太阳就亮（亚像素的浪用宽一点的瓣）
  float sg = max(dot(r, SD), 0.);
  refl += extinct(vec3(1., .92, .80), max(uSunEl, .3))*(pow(sg, 2200.)*90. + pow(sg, 160.)*2.2)*uSunOn;
  // 月亮的光柱（天黑以后、月亮还亮着时）
  float mg = max(dot(r, MD), 0.);
  refl += vec3(1., .97, .93)*pow(mg, 900.)*1.2*uMoonOn*(1. - uSunOn);
  vec3 body = vec3(.004, .030, .070)*(daySky(vec3(0., 1., 0.)).b*2.5)*uSunOn;
  vec3 col = body*(1. - F) + refl*F;
  float foam = smoothstep(.55, 1.1, length(sl))*uWave*.05;
  col += vec3(.7, .75, .8)*foam*uSunOn;
  return col;
}

// 前景礁石和坐着的人（屏幕空间的剪影，镜头推近时一起放大）
float rockSD(vec2 p){
  float d = min(min(sdEllipse(p, vec2(.13, -.585), vec2(.25, .150)), sdEllipse(p, vec2(-.25, -.60), vec2(.17, .085))), sdEllipse(p, vec2(.34, -.50), vec2(.08, .055)));
  return d + .010*gnoise(p*22.) + .0045*gnoise(p*75.);
}
float figureSD(vec2 p, vec2 f){
  vec2 q = p - f; float h = .052;
  float d = length((q - vec2(.0, h*.93))*vec2(1., .92)) - h*.085;                         // 头
  d = min(d, sdTaper(q, vec2(0., h*.84), vec2(.0, h*.40), h*.11, h*.13));                    // 身子（坐着）
  d = min(d, sdTaper(q, vec2(.0, h*.42), vec2(h*.42, h*.36), h*.08, h*.07));                 // 大腿
  d = min(d, sdTaper(q, vec2(h*.42, h*.36), vec2(h*.48, h*.0), h*.065, h*.05));              // 小腿
  d = min(d, sdTaper(q, vec2(h*.02, h*.76), vec2(h*.30, h*.50), h*.05, h*.045));             // 手臂搭在膝盖上
  return d;
}

void main(){
  KF = 2.*tan(radians(uFov)*.5);
  SD = dirFrom(uSunAz, uSunEl);
  MD = dirFrom(uMoonAz, uMoonEl);
  MR = normalize(vec3(MD.z, 0., -MD.x));
  MU = normalize(cross(MD, MR));
  vec2 p; vec3 d = camRay(gl_FragCoord.xy, p);
  float px = KF/uRes.y;
  vec3 col = d.y >= 0. ? skyAll(d, false, px) : seaCol(d, px);

  // 远处的海岸（左边一段低矮的陆地），天黑以后城市的灯亮起来
  float az0 = atan(d.x, d.z), e = elevDeg(d);
  float az = atan(sin(az0 - radians(uYaw)), cos(az0 - radians(uYaw)));      // 相对镜头朝向的方位角，不会在 ±180° 处跳
  float degPx = uFov/uRes.y;
  if (uCoast > 0.){
    float caz = -.32;
    float side = smoothstep(caz + .02, caz - .06, az);
    float hl = (.25 + .45*(fbmN(vec2(az*14., .5), 5)*.9 + .5) + .8*smoothstep(caz - .08, caz - .30, az))*side;
    float land = (1. - smoothstep(hl - degPx, hl + degPx, e))*step(-degPx*.5, e)*side;
    vec3 landC = daySky(vec3(d.x, .03, d.z))*.55*uSunOn + vec3(.0006, .0008, .0012);
    col = mix(col, landC, land*uCoast);
    float cw = radians(degPx)*5.;
    float ci = floor(az/cw);
    float hh = hash11(ci*1.37 + 4.);
    float laz = (ci + .2 + .6*hash11(ci + 9.1))*cw;
    float lel = degPx*(1.5 + 7.*pow(hash11(ci + 2.3), 1.5));
    float on = smoothstep(hash11(ci + 6.6)*.8, hash11(ci + 6.6)*.8 + .15, uCoastLights);  // 一盏盏亮起来
    float ok = step(.40, hh)*smoothstep(.4, .8, side)*uCoast*on;
    float lb = (pow(hash11(ci + 5.5), 2.5)*2.2 + .25)*(.85 + .15*sin(uTime*2. + ci));
    vec3 lc = mix(vec3(1., .66, .32), vec3(.95, .92, .85), step(.7, hash11(ci + 8.8)));
    vec2 dl = vec2((az - laz)/radians(degPx), (e - lel)/degPx);
    col += lc*lb*ok*exp(-dot(dl, dl)/1.4)*.05;
    if (e < 0.){
      float st = .35 + .65*smoothstep(-.2, .5, gnoise(vec2(az*900., e*30. + uTime*1.5)));
      col += lc*lb*ok*exp(-dl.x*dl.x/1.8)*exp(-(-e)/(34.*degPx))*st*.012;
    }
  }
  if (uRock > 0.){
    vec2 pr = p;
    float aa = 1.4/uRes.y;
    float rs = rockSD(pr);
    float rm = (1. - smoothstep(-aa, aa, rs))*uRock;
    // 礁石：白天被天光和太阳照着（逆光时主要是边缘亮），天黑以后是剪影
    float tx = .7 + .5*fbmN(pr*30., 4);
    vec3 rockC = vec3(.050, .042, .036)*tx*(daySky(vec3(0., 1., 0.)).b*2.)*uSunOn;
    rockC += vec3(1., .85, .65)*exp(-max(-rs, 0.)/.004)*.15*uSunOn*smoothstep(-.7, -.45, pr.y);
    col = mix(col, rockC + vec3(.0004, .0005, .0008), rm);
    float fs = figureSD(pr, vec2(.06, -.452));
    vec3 figC = vec3(.012, .011, .012)*uSunOn + vec3(.0002);
    col = mix(col, figC, (1. - smoothstep(-aa*.8, aa*.8, fs))*uRock);
  }
  fragColor = vec4(col, 1.);
}
`;

const SEA_DAY = { uFov: 60, uYaw: 0, uPitch: 6, uRoll: 0, uCamH: 1, uWave: 1, uSunAz: 0, uSunEl: 32, uSunOn: 1, uMoonAz: 128, uMoonEl: 24, uMoonRad: 1.4, uMoonOn: 1,
                  uRock: 1, uCoast: 1, uCoastLights: 0, uCloud: 1, uIce: 0, uSnow: 0, uNightK: 0, uMW: 2.4, uGalN: V3.norm([.25, .35, -.9]), uGalC: V3.norm([-.2, .93, .3]) };
const POST_DAY = { exposure: 1.0, thr: 1.6, bloom1: .20, bloom2: .24, sigma1: 5, sigma2: 9, grain: .03, vig: .30, contrast: 1.05, sat: 1.15,
                   shadowTint: [-.004, .002, .010], highTint: [.010, .006, -.004], lift: [.002, .004, .008] };
const POST_NIGHT = { exposure: 30, thr: 1.0, bloom1: .40, bloom2: .50, sigma1: 5, sigma2: 9, grain: .045, vig: .45, contrast: 1.05, sat: 1.0,
                     shadowTint: [-.004, .004, .016], highTint: [.006, .006, .004], lift: [.004, .008, .018] };

// 银河：让它斜着穿过镜头看的方向（yaw、pitch：度；tilt：银河带相对水平转多少）
function galAcross(yaw, pitch, tilt) {
  const a = yaw * Math.PI / 180, e = pitch * Math.PI / 180, r = tilt * Math.PI / 180;
  const F = [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)];
  const R = V3.norm([F[2], 0, -F[0]]), U = V3.cross(F, R);
  const along = V3.add(V3.mul(R, Math.cos(r)), V3.mul(U, Math.sin(r)));      // 银河在画面里的走向
  const N = V3.norm(V3.cross(F, along));
  return { uGalN: N, uGalC: V3.norm(V3.add(F, V3.mul(along, -.35))) };
}
// 倒计时出现：白天的海，太阳在前上方，礁石上坐着的人
SHOTS.beach = {
  fs: SEA_FS,
  uniforms(t, lt) {
    const k = easeInOut(clamp01(lt / 3));
    return Object.assign({}, SEA_DAY, { uFov: lerp(62, 58, k), uYaw: 12, uPitch: lerp(8, 9.5, k), uSunAz: 0, uSunEl: 21 });
  },
  post: POST_DAY,
};
// 抬头看太阳
SHOTS.sunUp = {
  fs: SEA_FS,
  uniforms(t, lt) {
    const k = easeInOut(clamp01(lt / 3.6));
    return Object.assign({}, SEA_DAY, { uFov: lerp(46, 40, k), uYaw: lerp(-6, -3, k), uPitch: lerp(17, 20, k), uSunAz: 0, uSunEl: 21, uRock: 0, uRoll: lerp(-3, -1, k) });
  },
  post: POST_DAY,
};
// 背对太阳：看海和月亮。倒计时到 0（SS('dark')）天一下子黑；月亮再亮 1.9 秒（凸月，比地球离太阳远一点，再加月亮到地球 1.3 秒）
const MOON_LAG = 1.9;
function adapt(t) {           // 眼睛适应黑暗：天黑后几秒里，后期曝光从白天的 1 提到夜里的 30
  const tb = SS('dark');
  if (t < tb) return 1;
  return Math.exp(Math.log(30) * smooth(tb + .15, tb + 4.2, t));
}
SHOTS.zeroSea = {
  fs: SEA_FS,
  uniforms(t, lt) {
    const tb = SS('dark');
    const k = easeInOut(clamp01(lt / 6));
    return Object.assign({}, SEA_DAY, { uFov: lerp(58, 54, k), uYaw: 168, uPitch: lerp(13, 16, k), uSunAz: 0, uSunEl: 21, uMoonAz: 158, uMoonEl: 27, uMoonRad: 1.6,
      uSunOn: t < tb ? 1 : 0, uMoonOn: t < tb + MOON_LAG ? 1 : 0, uCoastLights: smooth(tb + .8, tb + 5, t), uNightK: t < tb ? 0 : 1, uCloud: .7 }, galAcross(168, 40, 62));
  },
  post(t) {
    const tb = SS('dark');
    if (t < tb) return POST_DAY;
    const ex = adapt(t);
    return Object.assign({}, POST_NIGHT, { exposure: ex, thr: lerp(1.2, 1.0, clamp01(ex / 30)) });
  },
};
// 银河横跨海面
SHOTS.starSea = {
  fs: SEA_FS,
  uniforms(t, lt) {
    const k = easeInOut(clamp01(lt / 4));
    return Object.assign({}, SEA_DAY, { uFov: lerp(70, 64, k), uYaw: 175, uPitch: lerp(30, 34, k), uRoll: lerp(4, 2, k), uSunOn: 0, uMoonOn: 0, uCoastLights: 1, uNightK: 1, uCloud: .6, uRock: 0 }, galAcross(175, 40, 58));
  },
  post: POST_NIGHT,
};

// 变冷：贴着结冰的海面往前滑。"一个星期"时还是一块块浮冰、中间是黑水；"一年后"冻成一整片，上面落了霜
SHOTS.freeze = {
  fs: SEA_FS,
  uniforms(t, lt) {
    const k = easeInOut(clamp01(lt / 5.6));
    const ice = lerp(.50, .80, smooth(S('c1'), EN('c1'), t)) + .20 * smooth(S('c2') - .2, S('c2') + .9, t);
    return Object.assign({}, SEA_DAY, { uFov: lerp(62, 56, k), uYaw: lerp(186, 180, k), uPitch: lerp(9, 14, k), uRoll: lerp(-3, 0, k), uCamH: lerp(.55, .42, k), uWave: .5,
      uSunOn: 0, uMoonOn: 0, uMoonEl: -20, uCoast: 1, uCoastLights: 0, uNightK: 1, uCloud: .35, uRock: 0, uIce: ice, uSnow: smooth(S('c2'), S('c2') + 1.2, t) },
      galAcross(183, 32, 70), { uMW: 1.1 });
  },
  post: Object.assign({}, POST_NIGHT, { exposure: 26, sat: .92, shadowTint: [-.006, .004, .020], highTint: [-.004, .004, .012] }),
  overlay(t, lt) {
    const a = smooth(.2, .6, lt) * (1 - smooth(SE('cold') - .35, SE('cold'), t));
    if (a <= 0) return;
    OV.source(['估算：Popular Science《如果太阳熄灭了》', '（全球平均气温）'], a);
    // 温度计：左边一根竖管，红色的液柱往下掉；右边大字
    const k1 = smooth(S('c1'), CH('c1', 1) + .35, t), k2 = smooth(S('c2'), CH('c2', 1) + .35, t);      // 念到那个数时正好落到那个数
    const temp = lerp(lerp(15, -18, k1), -73, k2);
    const x = 170, yTop = 560, yBot = 1080;
    const yOf = (c) => lerp(yBot, yTop, (c + 90) / 120);
    const ctx = OV.ctx;
    ctx.save();
    ctx.globalAlpha = a;
    ctx.strokeStyle = 'rgba(255,255,255,.75)'; ctx.lineWidth = 3;
    ctx.beginPath(); ctx.roundRect(x - 16, yTop - 20, 32, yBot - yTop + 40, 16); ctx.stroke();
    ctx.beginPath(); ctx.arc(x, yBot + 46, 30, 0, Math.PI * 2); ctx.stroke();
    const col = temp > 0 ? 'rgb(255,120,90)' : 'rgb(150,200,255)';
    ctx.fillStyle = col;
    ctx.beginPath(); ctx.arc(x, yBot + 46, 21, 0, Math.PI * 2); ctx.fill();
    ctx.fillRect(x - 7, yOf(temp), 14, yBot + 30 - yOf(temp));
    ctx.restore();
    for (const c of [0, -18, -73]) {
      OV.line(x + 22, yOf(c), x + 40, yOf(c), { alpha: a * .7, width: 2 });
      OV.text(`${c}°C`, x + 50, yOf(c) + 11, { size: 28, weight: 500, align: 'left', alpha: a * .8, spacing: 0 });
    }
    // 大字：第几天、多少度
    const show = t < S('c2') - .1 ? 1 : 2;
    const lab = show === 1 ? '一周后' : '一年后';
    const val = Math.round(temp);
    OV.text(lab, 640, 690, { size: 46, weight: 500, spacing: 6, alpha: a * .9, color: [200, 225, 255] });
    OV.text(`${val <= 0 ? '−' : ''}${Math.abs(val)}°C`, 640, 830, { size: 128, weight: 700, spacing: 2, alpha: a, color: val < -50 ? [160, 205, 255] : [225, 238, 255], shadow: 30 });
  },
};

// 日出：真实的太阳照常升起（收藏卡垫在下面）
SHOTS.sunrise = {
  fs: SEA_FS,
  uniforms(t, lt) {
    const k = easeInOut(clamp01(lt / 6));
    return Object.assign({}, SEA_DAY, { uFov: 58, uYaw: lerp(-4, -2, k), uPitch: lerp(7, 8, k), uSunAz: 0, uSunEl: lerp(1.2, 2.6, k), uMoonOn: 0, uMoonEl: -30,
      uCoast: 1, uCoastLights: .4, uCloud: .9, uRock: 1, uWave: .8 });
  },
  post: Object.assign({}, POST_DAY, { exposure: 1.15, sat: 1.12, thr: 1.3, bloom1: .3, bloom2: .4 }),
};
