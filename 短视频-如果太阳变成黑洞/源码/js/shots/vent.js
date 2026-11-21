// 深海热泉（vent）：冰壳下面，几千米深的海底。潜水器的灯从左上打过来，照亮漂着的"海洋雪"；
// 中间一根"黑烟囱"往上冒黑烟（硫化物的颗粒），底下一丛丛管虫（白管子、红羽冠）轻轻摆。
// 画法是 2.5D 的分层：远处的烟囱剪影、主烟囱、烟、管虫、前景颗粒，镜头慢慢推近时各层视差不同。
const VENT_FS = GLSL_HEAD + GLSL_COMMON + `
uniform float uPush, uLamp;
vec2 P0;

float lampAt(vec2 p){
  // 潜水器的灯：从左上角斜着往右下打的一束光锥
  vec2 o = vec2(-.36, .66), dir = normalize(vec2(.42, -1.));
  vec2 q = p - o;
  float along = dot(q, dir);
  float across = abs(dot(q, vec2(-dir.y, dir.x)));
  float cone = smoothstep(.10 + .42*along, .02*along, across)*smoothstep(-.05, .15, along);
  return cone*exp(-along*.9)*uLamp + .10*exp(-length(p - vec2(-.1, .1))*2.2);
}
// 烟囱的轮廓：中心线随高度弯一点，宽度从下往上收，边缘有凹凸
float chimneySD(vec2 p, float cx, float base, float top, float w0, float w1, float seed){
  float y = clamp((p.y - base)/(top - base), 0., 1.);
  float c = cx + .02*gnoise(vec2(p.y*6., seed)) + .01*gnoise(vec2(p.y*22., seed + 3.));
  float w = mix(w0, w1, y)*(1. + .25*gnoise(vec2(p.y*14., seed + 7.)) + .12*gnoise(vec2(p.y*40., seed + 1.)));
  float d = abs(p.x - c) - w;
  d = max(d, p.y - top - .01*gnoise(vec2(p.x*30., seed)));
  return d;
}
void main(){
  vec2 p = (gl_FragCoord.xy - .5*uRes)/uRes.y;
  float z = 1./(1. + .12*uPush);
  vec2 pm = p*z + vec2(.0, .02*uPush);            // 主体层
  vec2 pf = p*mix(z, 1., .4);                        // 远处（视差小）
  float L = lampAt(p);
  // 水：上面深蓝黑，底下更黑；灯照到的地方有散射
  vec3 col = mix(vec3(.0008, .0035, .0070), vec3(.0002, .0010, .0025), smoothstep(-.5, .6, p.y));
  col += vec3(.010, .034, .048)*L*.8;
  // 光柱里的体积感：几道慢慢动的光束纹理
  col += vec3(.008, .024, .032)*L*smoothstep(.2, .9, fbmN(vec2(p.x*3. - p.y*1.7, uTime*.05), 4) + .5)*.6;

  // 远处的两根烟囱（剪影，被水的雾吞掉一半）
  for (int i = 0; i < 2; i++){
    float fi = float(i);
    vec2 q = pf - vec2(0., 0.);
    float d = chimneySD(q, i == 0 ? .22 : -.25, -.55, i == 0 ? .02 : -.14, i == 0 ? .045 : .035, .010, 11. + fi*5.);
    float m = 1. - smoothstep(-.003, .003, d);
    vec3 fc = vec3(.0015, .005, .009) + vec3(.006, .016, .020)*L;
    col = mix(col, fc, m*.65);
    // 远处烟囱的烟（更淡）
    float top = i == 0 ? .05 : -.12, cx = i == 0 ? .22 : -.25;
    if (q.y > top){
      float hgt = q.y - top;
      float wd = .02 + hgt*.25;
      float sx = (q.x - cx - .03*hgt)/wd;
      float sm = fbmN(vec2(sx*1.2, hgt*5. - uTime*.35) + 3.*fi, 4);
      float dens = smoothstep(1.1, 0., abs(sx))*smoothstep(-.1, .4, sm + .25)*exp(-hgt*1.6);
      col = mix(col, vec3(.004, .010, .016) + vec3(.02, .04, .05)*L*.5, dens*.55);
    }
  }
  // 海底：一条起伏的地平线，下面是岩石
  float ground = -.36 + .03*gnoise(vec2(pm.x*4., 1.)) + .012*gnoise(vec2(pm.x*15., 4.));
  if (pm.y < ground){
    float tx = .6 + .5*fbmN(pm*vec2(18., 30.), 5);
    vec3 gc = vec3(.020, .018, .016)*tx*(.25 + 2.2*L) + vec3(.002, .006, .010);
    col = gc;
  }
  // 主烟囱：粗糙的矿物柱子，边上有橙色的锈斑；顶上的喷口发一点暗红的光（示意）
  float cx = .02, top = .04, base = -.50;
  float d = chimneySD(pm, cx, base, top, .085, .030, 2.);
  if (d < .003){
    float m = 1. - smoothstep(-.0015, .0015, d);
    float tx = fbmN(pm*vec2(26., 9.) + 2., 5);
    float layers = .5 + .5*sin(pm.y*90. + tx*6.);
    vec3 rock = mix(vec3(.012, .011, .010), vec3(.030, .022, .015), smoothstep(-.1, .3, tx))*(.75 + .4*layers);
    rock = mix(rock, vec3(.12, .05, .015), smoothstep(.30, .60, fbmN(pm*vec2(14., 20.) + 9., 4))*.5);
    // 光从左边来：左半边亮，右半边几乎全黑
    float side = clamp((cx - pm.x)/.09*.5 + .5, 0., 1.);
    vec3 rc = rock*(.10 + 3.6*L*pow(side, 1.6)) + vec3(.0006, .0012, .0020);
    col = mix(col, rc, m);
  }
  // 黑烟：从喷口往上翻滚，越高越宽；被灯照到的边上发灰
  vec2 vt = vec2(cx + .01, top + .005);
  if (pm.y > vt.y - .01){
    float hgt = max(pm.y - vt.y, 0.);
    float wd = .026 + hgt*.40 + .08*hgt*hgt;
    vec2 w = vec2(fbmN(vec2(pm.x*5., pm.y*4. - uTime*.5), 4), fbmN(vec2(pm.x*5. + 7., pm.y*4. - uTime*.5 + 3.), 4));
    float sx = (pm.x - vt.x - .06*hgt + .05*w.x)/wd;
    float sm = fbmN(vec2(sx*1.3 + w.y*.8, hgt*7. - uTime*1.25), 5) + .45*fbmN(vec2(sx*3., hgt*16. - uTime*2.1) + 5., 4);
    float env = smoothstep(1.15, .15, abs(sx))*smoothstep(0., .02, hgt + .008)*exp(-hgt*.55);
    float dens = clamp(env*(.75 + 1.4*sm), 0., 1.);
    vec3 smoke = vec3(.0012, .0012, .0014) + vec3(.034, .031, .028)*L*smoothstep(-.1, .6, sm)*(.25 + .75*smoothstep(.2, -.9, sx));
    col = mix(col, smoke, dens*.97);
    // 喷口那一小段热水的扭曲光（示意）
    col += vec3(.35, .10, .03)*exp(-length((pm - vt)*vec2(1., 2.5))/.012)*.25;
  }
  // 管虫：烟囱脚下几丛；白色的管子，顶上红色的羽冠，轻轻摆
  for (int i = 0; i < 46; i++){
    float fi = float(i);
    float hb = hash11(fi*3.1);
    float bx = (hb - .5)*.42 + cx;
    if (abs(bx - cx) < .06 && hash11(fi + 9.) < .5) bx += sign(bx - cx + 1e-3)*.06;
    float by = ground + .006*hash11(fi*7.7) - .004;
    float h = .045 + .075*pow(hash11(fi*5.3), 1.5);
    h *= 1. - .5*smoothstep(.10, .21, abs(bx - cx));
    float sway = .010*sin(uTime*(1.1 + hash11(fi)*.8) + fi*1.7)*h/.1;
    vec2 a = vec2(bx, by), b = vec2(bx + sway + (bx - cx)*.18*h/.1, by + h);
    float dt = sdTaper(pm, a, b, .0030, .0024);
    float lit = .3 + 2.6*lampAt(b);
    if (dt < .002){
      float m = 1. - smoothstep(-.0012, .0012, dt);
      float shade = .55 + .45*clamp((b.x - pm.x)/.004*.5 + .5, 0., 1.);
      col = mix(col, vec3(.60, .58, .52)*.06*lit*shade, m);
    }
    vec2 pq = (pm - b - vec2(0., .005))*vec2(1., 1.1);
    float ang = atan(pq.x, pq.y);
    float fea = .0072*(1. + .2*sin(uTime*2. + fi))*(.75 + .25*cos(ang*9. + fi));     // 羽冠一瓣一瓣
    float dp = length(pq) - fea;
    if (dp < .002){
      float m = 1. - smoothstep(-.0010, .0010, dp);
      float fr = .65 + .35*gnoise(pm*900. + fi);
      col = mix(col, vec3(.85, .06, .05)*.085*lit*fr, m);
    }
  }
  // 海洋雪：三层漂浮的颗粒，近的大而虚
  for (int l = 0; l < 3; l++){
    float fl = float(l);
    float sc = l == 0 ? 26. : (l == 1 ? 48. : 90.);
    vec2 q = p*(1. + fl*.15)*sc + vec2(uTime*(.10 + fl*.05), uTime*(.25 + fl*.12)) + fl*13.;
    vec2 c = floor(q), f = fract(q);
    if (hash12(c + fl) < .45){
      vec2 pos = hash22(c + 3. + fl)*.8 + .1;
      float r = length(f - pos);
      float sz = l == 0 ? .09 : (l == 1 ? .06 : .045);
      float g = exp(-pow(r/sz, 2.))*(l == 0 ? .5 : 1.);
      col += vec3(.55, .70, .75)*g*(.03 + 1.2*L)*.07*(1. - fl*.2);
    }
  }
  fragColor = vec4(col, 1.);
}
`;
SHOTS.vent = {
  fs: VENT_FS,
  uniforms(t, lt) { return { uPush: easeInOut(clamp01(lt / 6.5)), uLamp: smooth(0, .6, lt) * .9 + .1 }; },
  post: { exposure: 3.4, thr: .9, bloom1: .35, bloom2: .45, sigma1: 5, sigma2: 9, grain: .05, vig: .50, contrast: 1.08, sat: 1.05,
          shadowTint: [-.004, .004, .016], highTint: [.010, .004, -.004], lift: [.002, .006, .012] },
  overlay(t, lt) {
    const a = smooth(.3, .8, lt) * (1 - smooth(SE('vent') - .4, SE('vent'), t));
    OV.source(['深海热泉（示意）：管虫靠热泉里的化学物质过活', '能量来自地底，不来自阳光'], a);
    OV.text('管虫', 300, 1268, { size: 32, weight: 500, alpha: a * .85 });
    OV.line(300, 1280, 330, 1330, { alpha: a * .6, width: 1.5 });
  },
};
