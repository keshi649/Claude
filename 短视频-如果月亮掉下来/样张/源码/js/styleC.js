// 画风 C：极简海报。三四个颜色、大面积留空、细字距的宋体；月亮大到出画，人很小。
const STYLE_C = {};

const MIN_COMMON = `
vec3 grainPaper(vec3 c, vec2 fc, vec2 q){
  float g = hash12(floor(fc/2.) + 3.7) - .5;
  c += g*.030;
  c *= .985 + .03*(fbm(q*3. + 5.)*.8 + .5);
  return c;
}
float figure(vec2 q, vec2 f, float h, float px){
  vec2 g = q - f;
  float d = length(g - vec2(0., h*.90)) - h*.085;
  d = min(d, sdTaper(g, vec2(0., h*.78), vec2(0., h*.46), h*.095, h*.080));
  d = min(d, sdTaper(g, vec2(-h*.045, h*.48), vec2(-h*.05, 0.), h*.045, h*.035));
  d = min(d, sdTaper(g, vec2(h*.045, h*.48), vec2(h*.06, 0.), h*.045, h*.035));
  d = min(d, sdTaper(g, vec2(-h*.11, h*.76), vec2(-h*.13, h*.48), h*.035, h*.028));
  d = min(d, sdTaper(g, vec2(h*.11, h*.76), vec2(h*.12, h*.48), h*.035, h*.028));
  return 1. - smoothstep(-px*.7, px*.7, d);
}
`;

STYLE_C.C1 = {
  hdr: false,
  tiles: 12,
  fs: GLSL_HEAD + GLSL_COMMON + MIN_COMMON + `
void main(){
  vec2 uv = gl_FragCoord.xy/uRes;
  float A = uRes.x/uRes.y;
  vec2 q = vec2(uv.x*A, uv.y);
  float px = 1./uRes.y;
  float hz = .385;
  // 天：深靛蓝到灰紫，贴近海面一层暖雾
  vec3 top = vec3(.070, .086, .160), mid = vec3(.165, .180, .282), low = vec3(.380, .345, .390);
  vec3 sky = mix(low, mid, smoothstep(hz, hz + .17, uv.y));
  sky = mix(sky, top, smoothstep(hz + .17, 1., uv.y));
  sky += vec3(.32, .19, .11)*.38*exp(-(uv.y - hz)/.028);
  vec3 col = sky;
  // 月亮：奶油色，极淡的月海
  vec2 cm = vec2(.5*A, .628); float R = .245;
  float dm = length(q - cm);
  float inM = 1. - smoothstep(R - px*.8, R + px*.8, dm);
  vec3 mb = vec3(.945, .895, .800);
  float mar = smoothstep(.02, .16, fbm((q - cm)*3.6 + 2.));
  mb = mix(mb, vec3(.880, .815, .706), mar*.62);
  mb = mix(mb, vec3(.915, .858, .756), smoothstep(.05, .2, fbm((q - cm)*9. + 8.))*.30);
  mb *= .985 + .03*gnoise((q - cm)*55.);
  mb *= 1. - .07*pow(dm/R, 4.);
  mb = mix(mb, vec3(.965, .800, .660), smoothstep(.15, -.95, (q.y - cm.y)/R)*.38);
  col = mix(col, mb, inM);
  col += vec3(.95, .85, .70)*.09*exp(-max(dm - R, 0.)/.035)*(1. - inM)*step(hz, uv.y);
  // 海：深海军蓝，月亮的倒影是一行行短横
  if (uv.y < hz){
    vec3 sea = mix(vec3(.040, .052, .100), vec3(.105, .112, .180), smoothstep(.0, hz, uv.y));
    float k = (hz - uv.y)/hz;
    float u = sqrt(k)*34.;
    float j = floor(u), f = fract(u);
    float thick = .42 - .18*k;
    float on = smoothstep(thick + .06, thick - .06, abs(f - .5)*2.);
    float half_ = (.185 - .12*k)*(.55 + .45*hash11(j*1.7 + 2.));
    float cx = cm.x + .022*(hash11(j*3.1) - .5);
    float dash = on*(1. - smoothstep(half_ - px, half_ + px, abs(q.x - cx)));
    vec3 rc = mix(vec3(.93, .80, .66), vec3(.80, .70, .62), k)*(.88 - .45*k);
    float knock = 1. - .62*(1. - smoothstep(.0, .02, q.x - .30))*smoothstep(.215, .235, q.y)*(1. - smoothstep(.355, .37, q.y));
    sea = mix(sea, rc, dash*.85*knock);
    col = sea;
    col += vec3(.9, .8, .7)*.05*exp(-(hz - uv.y)/.004);
  }
  // 栈桥从右下伸到海里，尽头一个人
  vec2 a = vec2(.64, .045), b = vec2(.338, .214);
  float t = segT(q, a, b);
  float thk = mix(.0105, .0032, t);
  float deck = 1. - smoothstep(thk - px, thk + px, sdSeg(q, a, b));
  vec3 ink = vec3(.022, .026, .046);
  col = mix(col, ink, deck);
  for (int i = 0; i < 14; i++){
    float ti = pow(float(i)/13., .8);
    vec2 pp = mix(a, b, ti);
    float L = mix(.042, .012, ti);
    float w = mix(.0030, .0011, ti);
    float post = 1. - smoothstep(w - px, w + px, sdSeg(q, pp, pp - vec2(0., L)));
    col = mix(col, ink, post);
  }
  col = mix(col, ink, figure(q, b + vec2(-.003, .0005), .034, px));
  col = grainPaper(col, gl_FragCoord.xy, q);
  fragColor = vec4(col, 1.);
}
`,
  text(ctx) {
    const cream = '#EFE6D2';
    ctx.fillStyle = 'rgba(239,230,210,0.82)';
    ctx.textAlign = 'left';
    ctx.font = '500 28px "Cormorant Garamond"';
    ctx.letterSpacing = '9px';
    ctx.fillText('WHAT IF', 80, 238);
    ctx.font = '300 26px "Noto Serif SC"';
    ctx.letterSpacing = '8px';
    ctx.fillText('第一集', 80, 284);
    ctx.fillStyle = cream;
    ctx.font = '300 88px "Noto Serif SC"';
    ctx.letterSpacing = '14px';
    ctx.fillText('如果月亮', 76, 1300);
    ctx.fillText('掉下来', 76, 1410);
    ctx.fillStyle = 'rgba(239,230,210,0.62)';
    ctx.fillRect(80, 1448, 120, 2);
    ctx.font = '500 24px "Cormorant Garamond"';
    ctx.letterSpacing = '8px';
    ctx.fillText('WHAT IF THE MOON FELL', 80, 1496);
  },
  watermark: { color: 'rgba(239,230,210,0.75)', font: '400 32px "Noto Serif SC"' },
};

STYLE_C.C2 = {
  hdr: false,
  tiles: 12,
  fs: GLSL_HEAD + GLSL_COMMON + MIN_COMMON + `
void main(){
  vec2 uv = gl_FragCoord.xy/uRes;
  float A = uRes.x/uRes.y;
  vec2 q = vec2(uv.x*A, uv.y);
  float px = 1./uRes.y;
  float hz = .215;
  vec3 col = mix(vec3(.125, .130, .215), vec3(.040, .048, .100), smoothstep(hz, .95, uv.y));
  col += vec3(.20, .14, .12)*.22*exp(-(uv.y - hz)/.05);
  // 稀疏的星
  vec2 sc = q*95.; vec2 c = floor(sc), f = fract(sc);
  if (hash12(c) < .10){
    vec2 pp = hash22(c)*.7 + .15;
    col += vec3(.92, .90, .85)*(.25 + .6*pow(hash12(c + 3.), 6.))*(1. - smoothstep(.02, .07, length(f - pp)));
  }
  // 光环：几道细弧，像铜版画的线
  vec2 C = vec2(.62, .17); float rho = .61;
  float dr = length(q - C) - rho;
  float th = atan(q.y - C.y, q.x - C.x);
  float above = smoothstep(hz - px, hz + px, q.y);
  vec3 ringC = vec3(.94, .87, .74);
  float L = 0.;
  float offs[7] = float[7](0., -.012, -.022, -.034, -.041, -.056, -.070);
  float wid[7]  = float[7](.0011, .0007, .0016, .0006, .0012, .0009, .0005);
  float br[7]   = float[7](.95, .55, 1., .45, .80, .60, .40);
  for (int i = 0; i < 7; i++) L = max(L, br[i]*(1. - smoothstep(wid[i] - px*.5, wid[i] + px, abs(dr - offs[i]))));
  float fill = smoothstep(.0, -.004, dr)*smoothstep(-.074, -.066, dr)*.10;
  // 地球的影子：靠近地平线的一小段暗下去
  float shadow = smoothstep(.20, .26, q.y);
  col = mix(col, ringC, (L*.95 + fill)*above*mix(.25, 1., shadow));
  // 碎块：几道很短的斜线
  for (int i = 0; i < 14; i++){
    float fi = float(i);
    vec2 p0 = vec2(.10 + .44*hash11(fi*3.3), .34 + .36*hash11(fi*7.1));
    if (length(p0 - C) > rho - .02) continue;
    vec2 p1 = p0 + vec2(-.008, -.022)*(.6 + .8*hash11(fi + 2.));
    float d = sdSeg(q, p0, p1);
    col = mix(col, ringC, (1. - smoothstep(.0006, .0006 + px*1.2, d))*smoothstep(0., 1., segT(q, p1, p0))*.85);
  }
  // 地面
  vec3 ground = vec3(.030, .034, .062);
  float gl = hz + .004*sin(q.x*7.) + .003*gnoise(vec2(q.x*20., 1.));
  col = mix(col, ground, 1. - smoothstep(gl - px, gl + px, q.y));
  col = mix(col, ground*.6, figure(q, vec2(.155, gl - .001), .036, px));
  col = grainPaper(col, gl_FragCoord.xy, q);
  fragColor = vec4(col, 1.);
}
`,
  text(ctx) {
    ctx.textAlign = 'center';
    ctx.fillStyle = 'rgba(239,230,210,0.72)';
    ctx.font = '300 40px "Noto Serif SC"';
    ctx.letterSpacing = '10px';
    ctx.fillText('它不会砸到你头上', 545, 1360);
    ctx.fillStyle = '#EFE6D2';
    ctx.font = '400 54px "Noto Serif SC"';
    ctx.letterSpacing = '8px';
    ctx.fillText('会先碎掉，变成一道光环', 546, 1444);
  },
  watermark: { color: 'rgba(239,230,210,0.75)', font: '400 32px "Noto Serif SC"' },
};
