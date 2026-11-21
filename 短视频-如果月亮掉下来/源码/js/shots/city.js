// 海边的城市：夜里，对岸一排楼和亮着的窗，近处一道海堤和路灯。
// 月亮从正常大小长到两倍（"看上去只大一倍"），潮水一路涨；"一天要被淹两回"时快进，海水两次漫过海堤。
const CITY_FS = GLSL_HEAD + GLSL_COMMON + `
uniform float uMoonR, uMoonX, uMoonY, uLevel, uWall, uZoom, uOffX, uOffY;

vec3 skyN(vec2 p){
  vec3 c = mix(vec3(.030, .046, .085), vec3(.004, .008, .022), smoothstep(-.05, .45, p.y));
  c += vec3(.05, .045, .06)*exp(-max(p.y + .01, 0.)/.03);      // 城市的光污染
  vec2 g = p*380.; vec2 ci = floor(g), f = fract(g);
  if (hash12(ci) < .14){
    vec2 pos = hash22(ci)*.8 + .1;
    c += vec3(.9, .92, 1.)*(pow(hash12(ci + 3.), 9.)*1.6 + .04)*exp(-pow(length(f - pos)*6., 2.))*smoothstep(.0, .2, p.y);
  }
  return c;
}
vec3 moonDisc(vec2 p, bool refl, out float cover){
  vec2 q = (p - vec2(uMoonX, uMoonY))/uMoonR;
  float r = length(q);
  float aa = 1.5/(uRes.y*uMoonR);
  cover = 1. - smoothstep(1. - aa, 1. + aa, r);
  vec3 halo = vec3(.75, .82, 1.)*(.35*exp(-max(r - 1., 0.)*3.) + .12*exp(-max(r - 1., 0.)*.8));
  if (r > 1. + aa || refl){ if (refl) cover = 0.; return halo*1.9; }
  vec2 qq = r > .999 ? q/r*.999 : q;
  vec3 n = vec3(qq, sqrt(1. - dot(qq, qq)));
  float maria = smoothstep(-.05, .10, fbm3N(n*1.6 + vec3(3.1, 1.7, .4), 5));
  float alb = mix(1., .55, maria)*(.86 + .28*(fbm3N(n*7. + 4.2, 4) + .35));
  vec3 L = normalize(vec3(-.5, .2, .84));
  float ci = max(dot(n, L), 0.);
  float sh = mix(ci, 2.*ci/(ci + max(n.z, .03)), .55);
  return vec3(1., .97, .93)*alb*sh*1.9 + halo*1.9*(1. - cover);
}
// 一排楼：宽 cw 一格，高低随机；窗户格子随机亮
vec4 bLayer(vec2 p, float base, float cw, float hmin, float hmax, float seed, vec3 tint, float bright){
  float x = p.x + seed*3.1;
  float ci = floor(x/cw);
  float h = hmin + (hmax - hmin)*pow(hash11(ci*1.7 + seed), 2.4);
  float gap = cw*(.05 + .10*hash11(ci + seed*5.));
  float lx = x - ci*cw;
  float top = base + h;
  float cov = step(gap, lx)*step(lx, cw - gap)*step(p.y, top);
  vec2 wq = vec2(lx - gap, p.y - base)/vec2(.0058, .0080);
  vec2 wi = floor(wq), wf = fract(wq);
  float win = step(.22, wf.x)*step(wf.x, .78)*step(.28, wf.y)*step(wf.y, .80)*step(wq.x, (cw - 2.*gap)/.0058 - .8)*step(wq.y, h/.008 - .8);
  float lit = step(.60 - .2*hash11(ci + 2.*seed), hash12(wi + ci*13.1 + seed));
  vec3 wc = mix(vec3(1., .76, .42), vec3(.78, .87, 1.), step(.72, hash12(wi*3.1 + ci)));
  vec3 col = tint + wc*win*lit*(.7 + .6*hash12(wi*7.7 + ci))*bright;
  // 高楼顶上的红灯
  float tall = step(hmin + (hmax - hmin)*.55, h);
  col += vec3(1., .12, .08)*tall*exp(-pow(length(vec2(lx - cw*.5, p.y - top - .003)/.0025), 2.))*(.6 + .4*sin(uTime*3. + ci))*2.;
  return vec4(col, cov);
}
// 海面以上的一切（倒影也从这里取）
vec3 above(vec2 p, bool refl){
  vec3 c = skyN(p);
  float mc; vec3 m = moonDisc(p, refl, mc);
  c = mix(c + m*(1. - mc), m, mc);
  vec4 b1 = bLayer(p, -.006, .030, .018, .085, 1., vec3(.020, .026, .042), .55);
  c = mix(c, mix(b1.rgb, skyN(p)*1.4, .35), b1.a);
  vec4 b2 = bLayer(p, -.012, .046, .012, .150, 7., vec3(.010, .013, .022), 1.);
  c = mix(c, b2.rgb, b2.a);
  // 岸上的路和海堤
  float wallTop = uWall;
  if (p.y < -.012){
    c = vec3(.012, .013, .018) + vec3(.06, .045, .03)*exp(-(-.012 - p.y)/.01)*.5;
  }
  if (p.y < wallTop){
    float brick = .85 + .15*step(.5, fract(p.x*60. + step(.5, fract(p.y*120.))*.5));
    c = vec3(.016, .016, .020)*brick;
  }
  // 栏杆
  float rail = step(abs(p.y - (wallTop + .011)), .0012) + step(abs(fract(p.x*55.) - .5), .07)*step(wallTop, p.y)*step(p.y, wallTop + .011);
  c = mix(c, vec3(.005), clamp(rail, 0., 1.));
  // 路灯：杆 + 暖黄的灯头
  float lx = fract(p.x/.072 + .3) - .5;
  float pole = step(abs(lx*.072), .0009)*step(wallTop, p.y)*step(p.y, wallTop + .052);
  c = mix(c, vec3(.004), pole);
  vec2 lh = vec2(lx*.072, p.y - (wallTop + .054));
  float lg = exp(-dot(lh, lh)/(.0016*.0016));
  c += vec3(1., .70, .38)*(lg*4. + .25*exp(-length(lh)/.012) + .06*exp(-length(lh)/.04));
  return c;
}

void main(){
  vec2 p = (gl_FragCoord.xy - .5*uRes)/uRes.y/uZoom + vec2(uOffX, uOffY);
  float wob = .0022*sin(p.x*48. + uTime*2.6) + .0014*sin(p.x*121. - uTime*3.7) + .0012*gnoise(vec2(p.x*30., uTime*.8));
  float lvl = uLevel + wob;
  vec3 col;
  if (p.y > lvl){
    col = above(p, false);
  } else {
    float dd = lvl - p.y;
    vec2 wv = vec2(.006*gnoise(vec2(p.x*20., dd*90. - uTime*1.2)) + .003*gnoise(vec2(p.x*70., dd*300.)), 0.);
    vec3 r = above(vec2(p.x + wv.x*1.8, lvl + dd*1.05 + .006*gnoise(vec2(p.x*9., dd*40.))), true);
    float streak = .45 + .55*smoothstep(-.2, .4, gnoise(vec2(p.x*6., dd*260. + uTime*.7)));
    col = vec3(.003, .006, .012) + r*.42*streak*exp(-dd*4.);
    // 月光在水上的一条亮带
    float colm = exp(-pow((p.x - uMoonX)/(uMoonR*.85), 2.));
    float gl = pow(clamp(gnoise(vec2(p.x*55., dd*420. - uTime*1.5))*1.6 + .1, 0., 1.), 3.);
    col += vec3(.80, .85, 1.)*colm*(.10 + 1.4*gl)*exp(-dd*2.2)*(uMoonR/.09);
    // 水边的白沫
    col += vec3(.6, .65, .75)*.35*exp(-dd/.0025)*(.5 + .5*gnoise(vec2(p.x*160., uTime*4.)));
  }
  // 漫过海堤时溅起的水花
  float over = smoothstep(uWall - .006, uWall + .004, uLevel);
  if (over > 0.){
    float sp = pow(clamp(gnoise(vec2(p.x*90., p.y*90. - uTime*6.)) + .2, 0., 1.), 4.);
    col += vec3(.7, .75, .85)*sp*over*exp(-max(p.y - uLevel, 0.)/.012)*step(uLevel - .004, p.y)*.6;
  }
  fragColor = vec4(col, 1.);
}
`;

// 潮水的高度：t2 一路涨，t3 快进一天，两次漫过海堤
function tideLevel(t) {
  const WALL = -.046;
  if (t < S('t3')) return lerp(-.090, -.058, smooth(S('t2') - .2, S('t3'), t));
  const k = clamp01((t - S('t3')) / (SE('tide') - S('t3') + .1));
  return -.072 + .042 * (.5 - .5 * Math.cos(2 * Math.PI * 2 * k));
}

SHOTS.tideCity = {
  fs: CITY_FS,
  uniforms(t, lt) {
    const g = smooth(CH('t2', 1) - .1, CH('t2', 1) + .7, t);            // "看上去只大一倍"：月亮长到两倍
    return { uMoonR: lerp(.040, .080, g), uMoonX: .168, uMoonY: lerp(.255, .272, g), uLevel: tideLevel(t), uWall: -.046, uZoom: 1, uOffX: 0, uOffY: 0 };
  },
  post: { exposure: 1.5, thr: .9, bloom1: .42, bloom2: .5, sigma1: 5, sigma2: 9, grain: .04, vig: .4, contrast: 1.05,
          shadowTint: [-.004, .004, .016], highTint: [.012, .005, -.006], lift: [.004, .007, .016] },
  overlay(t) {
    OV.source('潮汐力与距离的三次方成反比 · 示意', smooth(S('t2') - .2, S('t2') + .2, t) * (1 - smooth(S('t3') - .2, S('t3') + .2, t)));
    const fo = 1 - smooth(S('t3') - .3, S('t3') + .1, t);
    // 三根条：距离减半、看上去两倍、潮汐力八倍
    const k0 = smooth(CH('t2', 0), CH('t2', 0) + .6, t);
    const k1 = smooth(CH('t2', 1), CH('t2', 1) + .6, t);
    const k2 = smooth(CH('t2', 3) - .2, CH('t2', 3) + .5, t);
    const a0 = smooth(S('t2') - .2, S('t2'), t) * fo, a1 = smooth(CH('t2', 1) - .25, CH('t2', 1), t) * fo, a2 = smooth(CH('t2', 2) - .25, CH('t2', 2), t) * fo;
    const dist = Math.round(lerp(38, 19, k0));
    OV.bar(72, 340, 440, lerp(1, .5, k0), '地月距离', `${dist} 万公里`, { alpha: a0, color: [190, 210, 255] });
    OV.bar(72, 450, 440, lerp(.125, .25, k1), '看上去', `×${lerp(1, 2, k1).toFixed(1)}`, { alpha: a1, color: [235, 235, 240] });
    OV.bar(72, 560, 440, lerp(.125, 1, k2), '拉海水的力气', `×${Math.round(lerp(1, 8, k2))}`, { alpha: a2, color: GOLD });
    // 快进一天：钟
    const ca = smooth(S('t3') - .1, S('t3') + .2, t) * (1 - smooth(SE('tide') - .3, SE('tide'), t));
    if (ca > 0) {
      const k = clamp01((t - S('t3')) / (SE('tide') - S('t3') + .1));
      const cx = 150, cy = 400, r = 62;
      OV.circle(cx, cy, r, { alpha: ca, width: 3 });
      for (let i = 0; i < 12; i++) {
        const an = i / 12 * Math.PI * 2;
        OV.line(cx + Math.sin(an) * r * .82, cy - Math.cos(an) * r * .82, cx + Math.sin(an) * r * .95, cy - Math.cos(an) * r * .95, { alpha: ca, width: 2 });
      }
      const ah = k * Math.PI * 2 * 2;      // 时针转两圈 = 一天
      OV.line(cx, cy, cx + Math.sin(ah) * r * .55, cy - Math.cos(ah) * r * .55, { alpha: ca, width: 5, color: GOLD });
      OV.line(cx, cy, cx + Math.sin(ah * 12) * r * .78, cy - Math.cos(ah * 12) * r * .78, { alpha: ca, width: 2.5 });
      OV.text('快进 24 小时', 250, 388, { align: 'left', size: 40, weight: 600, alpha: ca });
      const floods = (k > .25 ? 1 : 0) + (k > .75 ? 1 : 0);
      OV.text(`漫过海堤：${floods} 次`, 250, 446, { align: 'left', size: 34, weight: 500, alpha: ca, color: floods ? GOLD : [230, 230, 235] });
    }
  },
};

// 快进一天：推近到海堤，看海水两次漫过路灯脚下
SHOTS.floodClose = {
  fs: CITY_FS,
  uniforms(t, lt) {
    const z = lerp(2.5, 2.8, clamp01(lt / 3));
    return { uMoonR: .080, uMoonX: .168, uMoonY: .272, uLevel: tideLevel(t), uWall: -.046, uZoom: z, uOffX: -.03, uOffY: -.012 };
  },
  post: SHOTS.tideCity.post,
  overlay(t, lt) { SHOTS.tideCity.overlay(t, lt); },
};
