// 画风 B：水墨宋画。宣纸、层层淡墨、烘云托月（月亮是没画到的纸）、马远式一角构图、浅绛的花青和赭石，题字和印章。
const STYLE_B = {};

const INK_COMMON = `
vec3 paperCol(vec2 uv, vec2 q){
  vec3 base = vec3(.930, .898, .832);
  base *= .968 + .055*(fbm(q*2.6 + 7.)*.8 + .5);
  vec2 r1 = mat2(.94, .34, -.34, .94)*q, r2 = mat2(.60, -.80, .80, .60)*q;
  base *= 1. - .030*smoothstep(.22, .60, gnoise(r1*vec2(900., 26.))) - .022*smoothstep(.28, .66, gnoise(r2*vec2(680., 20.)));
  base += .014*smoothstep(.30, .70, gnoise(q*vec2(150., 170.)));
  float v = smoothstep(.30, .78, length((uv - .5)*vec2(1.05, .92)));
  base *= mix(vec3(1.), vec3(.90, .84, .74), v*.55);
  return base;
}
// 皴：顺着山势的长条纹理
float cun(vec2 q, float sc){ return gnoise(vec2(q.x*sc + 2.5*gnoise(q*sc*.12), q.y*sc*.16)); }
// 飞白：笔里墨不够时露出的纸
float feibai(vec2 q, float sc, float amt){ return smoothstep(.55 - amt, .75 - amt, gnoise(vec2(q.x*sc, q.y*sc*.11) + 3.3)); }
vec3 inkMix(vec3 paper, float D, float Db, float Do, vec2 q){
  vec3 absorb = D*vec3(2.15, 2.20, 2.30) + Db*vec3(1.45, .85, .42) + Do*vec3(.22, .52, .98);
  vec3 c = paper*exp(-absorb);
  c *= 1. - .05*clamp(D, 0., 1.)*(gnoise(q*560.)*.5 + .5);
  return c;
}
// 一座峰：半宽随高度收窄，带一点倾斜和起伏；返回 (是否在峰内的距离, 离峰顶的深度)
vec2 peak(vec2 q, float cx, float base, float H, float w, float lean, float seed){
  float t = clamp((H - q.y)/(H - base), 0., 1.);
  float hw = w*pow(t, .42)*(1. + .16*gnoise(vec2(q.y*34., seed)) + .07*gnoise(vec2(q.y*120., seed + 3.)));
  float xc = cx + lean*(q.y - base);
  float d = abs(q.x - xc) - hw;
  d = max(d, q.y - H);
  return vec2(d, H - q.y);
}
float dotMask(vec2 q, vec2 c, float r, float px){ return 1. - smoothstep(r - px, r + px*1.5, length(q - c) + .25*r*gnoise((q - c)*900./max(r*300., 1.))); }
`;

STYLE_B.B1 = {
  hdr: false,
  tiles: 20,
  fs: GLSL_HEAD + GLSL_COMMON + INK_COMMON + `
float cliffTop(float x){ return .282 - .40*pow(max(x - .13, 0.), 1.3) + .016*(ridged(vec2(x*9., 5.), 4) - .5) + .005*gnoise(vec2(x*60., 1.)); }
float cliffRight(float y){ return .300 + .016*fbmN(vec2(y*10., 2.), 4) - .075*smoothstep(.22, .02, y); }
void main(){
  vec2 uv = gl_FragCoord.xy/uRes;
  float A = uRes.x/uRes.y;
  vec2 q = vec2(uv.x*A, uv.y);
  float px = 1./uRes.y, x = q.x;
  float D = 0., Db = 0., Do = 0.;

  // 烘云托月：月亮是留出来的纸，周围染淡墨，越靠月亮边越深
  vec2 cm = vec2(.235, .640); float R = .185;
  float dm = length(q - cm);
  float inMoon = 1. - smoothstep(R - px, R + px, dm);
  float wash = .070 + .050*(fbm(q*2.3 + 1.3)*.8 + .5);
  wash += .14*exp(-max(dm - R, 0.)/.030);
  float cw = fbm(vec2(q.x*1.5 + .25*q.y, q.y*6.5) + 4.);
  wash += .075*smoothstep(.02, .30, cw);
  wash *= mix(.42, 1., smoothstep(.985, .80, uv.y));
  wash *= mix(.50, 1., smoothstep(.30, .50, uv.y));
  D += wash*(1. - inMoon);
  Db += .05*wash*(1. - inMoon);
  D += inMoon*.030*smoothstep(-.02, .22, fbm((q - cm)*5.5 + 9.));
  float thin = exp(-pow((q.y - .515)/.010, 2.))*smoothstep(-.1, .3, fbmN(vec2(q.x*5., 2.), 4));
  D += .045*thin;

  // 远山：花青淡染，山脚化进雾里
  float h1 = .440 + .030*fbmN(vec2(x*3.2, 1.), 5) + .035*ridged(vec2(x*5.5, 3.), 5) + .03*exp(-pow((x - .09)/.05, 2.));
  float b1 = h1 - q.y;
  float m1 = smoothstep(-px, px, b1);
  Db += m1*.12*exp(-max(b1, 0.)/.040)*(.85 + .3*fbm(q*vec2(26., 7.)));
  D += m1*.045*exp(-max(b1, 0.)/.03);
  D += .06*exp(-abs(b1)/.0022)*step(-.002, b1);

  // 中景：一排挺拔的峰，挡在月亮前面。后排淡，前排深，山脚都化进雾里
  vec4 PK[8] = vec4[8](vec4(.262, .505, .028, -.04), vec4(.300, .548, .022, .05), vec4(.338, .600, .026, -.02), vec4(.372, .560, .020, .06),
                       vec4(.408, .528, .030, -.05), vec4(.452, .490, .032, .03), vec4(.500, .468, .040, -.02), vec4(.232, .470, .030, .02));
  for (int i = 0; i < 8; i++){
    float fi = float(i);
    float depth = (i == 2 || i == 4 || i == 6) ? 1. : .55;          // 前排、后排
    vec2 pk = peak(q, PK[i].x, .36, PK[i].y, PK[i].z, PK[i].w, fi*7.1);
    float inside = 1. - smoothstep(-px, px, pk.x);
    float mist = smoothstep(.385, .47, q.y);
    float tone = (.16 + .20*depth)*(.65 + .5*smoothstep(-.3, .5, cun(q + fi, 85.)))*(1. - .55*feibai(q + fi, 150., .05));
    tone *= mix(1., .55, smoothstep(.0, .05, -pk.x));               // 峰的中间亮一点
    D = max(D, D*.4 + inside*mist*tone + (D*.6));
    D += inside*mist*(.30 + .30*depth)*exp(-abs(pk.x)/.0022);        // 轮廓线
    Db += inside*mist*.08*(1. - depth*.5);
  }

  // 左下角的芦苇：细长的弯笔，两头尖，前深后淡
  for (int i = 0; i < 16; i++){
    float fi = float(i);
    float near = step(6., fi);
    vec2 root = vec2(-.02 + .17*hash11(fi*3.3) + .04*near, -.01);
    float ht = (.16 + .14*hash11(fi*5.1))*(near > .5 ? 1. : .75);
    float bend = (.04 + .05*hash11(fi*7.7))*(hash11(fi + 2.) > .3 ? 1. : -.6);
    float t = clamp((q.y - root.y)/ht, 0., 1.);
    float xc = root.x + bend*t*t;
    float wdt = mix(.0030, .0004, t)*(near > .5 ? 1. : .8);
    float stem = (1. - smoothstep(wdt - px*.3, wdt + px, abs(x - xc)))*step(q.y, root.y + ht)*step(root.y, q.y);
    D += stem*(near > .5 ? .80 : .32);
    // 叶子：一片弯的长叶，两头尖
    if (hash11(fi*4.4) < .55){
      float lt = .25 + .35*hash11(fi*9.1);
      vec2 lp = vec2(root.x + bend*lt*lt, root.y + ht*lt);
      float sgn = hash11(fi + 2.7) > .5 ? 1. : -1.;
      vec2 P1 = lp + vec2(sgn*.030, .060 + .02*hash11(fi + 4.)), P2 = lp + vec2(sgn*.080, .030 + .02*hash11(fi + 5.));
      float lf = 1e9;
      for (int k = 0; k < 5; k++){
        float t0 = float(k)/5., t1 = float(k + 1)/5.;
        vec2 a0 = mix(mix(lp, P1, t0), mix(P1, P2, t0), t0), a1 = mix(mix(lp, P1, t1), mix(P1, P2, t1), t1);
        float w0 = .0003 + .0026*pow(sin(3.1416*t0), .7), w1 = .0003 + .0026*pow(sin(3.1416*t1), .7);
        lf = min(lf, sdTaper(q, a0, a1, w0, w1));
      }
      D += (1. - smoothstep(-px*.5, px, lf))*(near > .5 ? .62 : .26);
    }
    // 芦花：穗子
    vec2 tp = vec2(xc, root.y + ht);
    vec2 dd = normalize(vec2((bend > 0. ? 1. : -1.)*.75, -1.));
    vec2 pq = q - (tp + dd*.011);
    vec2 uv2 = vec2(dot(pq, dd), dot(pq, vec2(-dd.y, dd.x)));
    float plume = length(uv2/vec2(.017, .0055)) - 1.;
    plume *= .0055;
    float fluff = .55 + .45*smoothstep(-.2, .5, gnoise(vec2(uv2.x*160., uv2.y*900.)));
    D += (1. - smoothstep(-px, px*3., plume + .002*gnoise(q*500.)))*(near > .5 ? .40 : .16)*fluff;
  }
  // 芦苇脚下的一抹湿墨
  float shore = length((q - vec2(.06, .02))*vec2(.9, 2.6)) - .11 + .02*fbmN(q*14., 4);
  D += (1. - smoothstep(-.02, .01, shore))*.30*(.7 + .3*fbm(q*30.));

  // 一叶扁舟和钓竿
  vec2 bc = vec2(.330, .300);
  float bt = (x - bc.x)/.040;
  if (abs(bt) < 1.){
    float yt = bc.y + .0045*pow(abs(bt), 3.);                        // 船舷两头翘
    float yb = bc.y - .0058*sqrt(1. - bt*bt) + .0025*pow(abs(bt), 3.);
    D += .85*smoothstep(yb - px, yb + px, q.y)*(1. - smoothstep(yt - px, yt + px, q.y));
  }
  vec2 man = vec2(bc.x - .006, bc.y + .0005);
  float back = sdEllipse(q, man + vec2(0., .0075), vec2(.0062, .0085));   // 蓑衣，坐着的背
  back = max(back, -(q.y - man.y));
  float hat = max(abs(q.x - man.x)*.40 + (q.y - (man.y + .0205)), -(q.y - (man.y + .0150)));  // 宽而扁的斗笠
  D += .80*(1. - smoothstep(-px, px, min(back, hat)));
  D += .55*(1. - smoothstep(px*.4, px*1.4, sdSeg(q, man + vec2(.003, .011), vec2(bc.x + .060, bc.y + .040))));
  D += .25*(1. - smoothstep(px*.3, px*1.1, sdSeg(q, vec2(bc.x + .060, bc.y + .040), vec2(bc.x + .062, bc.y + .002))));   // 钓线
  // 船下的倒影和水纹
  float ref = exp(-pow((q.y - (bc.y - .012))/.0018, 2.))*smoothstep(.03, .0, abs(x - bc.x) - .02)*(.5 + .5*gnoise(vec2(x*300., 1.)));
  D += .18*ref;
  for (int i = 0; i < 9; i++){
    float fi = float(i);
    float yy = .352 - .020*fi - .006*hash11(fi*2.1);
    float x0 = .27 + .21*hash11(fi*5.7), len = .018 + .045*hash11(fi*3.9);
    float tt = clamp((x - x0)/len, 0., 1.);
    float wdt = .0016*sin(tt*3.1416)*(1. - .3*fi/9.);
    float yc = yy + .002*sin(tt*6.283 + fi);
    float ln = (1. - smoothstep(wdt*.5, wdt + px, abs(q.y - yc)))*step(x0, x)*step(x, x0 + len);
    D += .30*ln*(1. - .7*feibai(q, 260., .15));
  }
  vec3 col = inkMix(paperCol(uv, q), D, Db, Do, q);
  col = mix(col, col*1.025 + .01, inMoon);
  fragColor = vec4(toSRGB(pow(col, vec3(2.2))*1.0), 1.);
}
`,
  text(ctx) {
    // 竖排题字（志莽行书），落在月亮右边的空处
    const chars = [...'如果月亮掉下来'];
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(34,31,29)';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.font = '400 92px "Zhi Mang Xing"';
    ctx.shadowColor = 'rgba(34,31,29,0.35)';
    ctx.shadowBlur = 3;
    chars.forEach((c, i) => ctx.fillText(c, 862, 292 + i * 90));
    ctx.restore();
    seal(ctx, 862, 292 + 7 * 90 + 6, 54, '其一', '"Ma Shan Zheng"');
    // 字幕样式
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(40,36,33)';
    ctx.textAlign = 'center';
    ctx.font = '400 56px "LXGW WenKai"';
    ctx.letterSpacing = '4px';
    ctx.fillText('最先变的，不是它的大小', 543, 1268);
    ctx.restore();
  },
  watermark: { seal: true },
};

STYLE_B.B2 = {
  hdr: false,
  tiles: 20,
  fs: GLSL_HEAD + GLSL_COMMON + INK_COMMON + `
void main(){
  vec2 uv = gl_FragCoord.xy/uRes;
  float A = uRes.x/uRes.y;
  vec2 q = vec2(uv.x*A, uv.y);
  float px = 1./uRes.y, x = q.x;
  float D = 0., Db = 0., Do = 0.;

  // 光环：天空染墨，光环留白（和上一张的月亮同一个画法）
  vec2 C = vec2(.62, .05); float rho = .66;
  float dr = length(q - C) - rho;          // >0 在弧外
  float th = atan(q.y - C.y, q.x - C.x);
  float s = clamp((th - .30)/(2.80 - .30), 0., 1.);   // 0 右上 → 1 左下
  float wOut = .000, wIn = -.085;
  float edgeN = .0035*gnoise(vec2(th*90., 1.)) + .002*gnoise(vec2(th*300., 2.));
  float inRing = smoothstep(wIn - .010, wIn + .004, dr + edgeN*.6)*(1. - smoothstep(wOut - px, wOut + px*1.5, dr + edgeN));
  // 环内几道缝：干笔淡墨线
  float gaps = .55*exp(-pow((dr + .030)/.0024, 2.)) + .30*exp(-pow((dr + .052)/.0016, 2.)) + .22*exp(-pow((dr + .012)/.0012, 2.));
  gaps *= 1. - feibai(vec2(th*.8, dr*40.), 60., .1);
  float ringInk = gaps*.22 + .02*smoothstep(-.03, -.085, dr);

  float wash = .15 + .06*(fbm(q*2. + 3.)*.8 + .5);
  wash += .09*smoothstep(.45, 1., uv.y);
  float bloom = fbm(q*3.2 + 21.);
  wash += .025*smoothstep(.05, .12, bloom) - .015*smoothstep(.18, .30, bloom);
  float hz0 = .205 + .022*fbmN(vec2(x*3.4, 4.), 5) + .03*ridged(vec2(x*5., 1.), 4) + .05*exp(-pow((x - .03)/.06, 2.));
  float above = smoothstep(hz0 - .004, hz0 + .004, q.y);
  wash += .13*exp(-max(dr, 0.)/.022)*step(0., dr)*above;          // 弧外沿烘一圈
  wash += .05*exp(-max(-dr + wIn, 0.)/.03)*step(dr, wIn)*above;    // 弧内沿淡一些
  float cw = fbm(vec2(q.x*1.4 - .3*q.y, q.y*6.) + 11.);
  wash += .06*smoothstep(.05, .32, cw);
  // 碎块落下：留白的小点和细尾巴
  float deb = 0.;
  for (int i = 0; i < 26; i++){
    float fi = float(i);
    float a = .35 + 2.3*hash11(fi*3.7);
    vec2 base = C + (rho - .03 - .01*hash11(fi))*vec2(cos(a), sin(a));
    vec2 dir = normalize(vec2(-.25 - .2*hash11(fi + 2.), -1.));
    vec2 hp = base + dir*(.04 + .22*hash11(fi*1.9 + 5.));
    if (hp.y < .20) continue;
    float r = .0016 + .0030*pow(hash11(fi + 7.7), 2.);
    float hd = dotMask(q, hp, r, px);
    float tl = (1. - smoothstep(r*.3, r*.9, sdSeg(q, hp, hp - dir*(.02 + .05*hash11(fi + 4.)))))*.6;
    deb = max(deb, max(hd, tl*smoothstep(0., 1., segT(q, hp - dir*.07, hp))));
  }
  wash *= 1. - .9*deb;
  float hz = .205 + .022*fbmN(vec2(x*3.4, 4.), 5) + .03*ridged(vec2(x*5., 1.), 4) + .05*exp(-pow((x - .03)/.06, 2.));
  inRing *= smoothstep(hz - px, hz + px, q.y);
  D += wash*(1. - inRing) + ringInk*inRing;
  Db += .05*wash;

  // 远处一抹淡山，光环从它后面升起
  float h1 = .205 + .022*fbmN(vec2(x*3.4, 4.), 5) + .03*ridged(vec2(x*5., 1.), 4) + .05*exp(-pow((x - .03)/.06, 2.));
  float b1 = h1 - q.y;
  float m1 = smoothstep(-px, px, b1)*smoothstep(.135, .18, q.y);
  Db += m1*.14*exp(-max(b1, 0.)/.035)*(.85 + .3*fbm(q*vec2(24., 7.)));
  D += m1*(.03 + .05*exp(-abs(b1)/.0022));
  // 雾里的一排峰
  vec4 PK[6] = vec4[6](vec4(.300, .238, .020, .03), vec4(.338, .262, .022, -.03), vec4(.372, .240, .017, .05), vec4(.410, .228, .024, -.02),
                       vec4(.455, .250, .028, .02), vec4(.505, .222, .034, -.03));
  for (int i = 0; i < 6; i++){
    float fi = float(i);
    float depth = (i == 1 || i == 4) ? 1. : .55;
    vec2 pk = peak(q, PK[i].x, .15, PK[i].y, PK[i].z, PK[i].w, fi*5.3 + 2.);
    float inside = 1. - smoothstep(-px, px, pk.x);
    float mist = smoothstep(.165, .225, q.y);
    float tone = (.16 + .20*depth)*(.65 + .5*smoothstep(-.3, .5, cun(q + fi, 85.)))*(1. - .55*feibai(q + fi, 150., .05));
    tone *= mix(1., .55, smoothstep(.0, .05, -pk.x));
    D += inside*mist*tone*(1. - .5*smoothstep(.0, 1., D));
    D += inside*mist*(.30 + .30*depth)*exp(-abs(pk.x)/.0022);
  }
  // 水面上的小船，船上的人仰头看
  vec2 bc = vec2(.215, .118);
  float bt = (x - bc.x)/.034;
  if (abs(bt) < 1.){
    float yb = bc.y - .0068*sqrt(1. - bt*bt);
    D += .82*smoothstep(yb - px, yb + px, q.y)*(1. - smoothstep(bc.y - px, bc.y + px, q.y));
  }
  vec2 man = vec2(bc.x - .004, bc.y + .0005);
  float back = max(sdEllipse(q, man + vec2(0., .0072), vec2(.0058, .0080)), -(q.y - man.y));
  float head = length(q - (man + vec2(.0020, .0172))) - .0034;
  float arm = sdTaper(q, man + vec2(.0030, .0110), man + vec2(.0105, .0215), .0016, .0011);
  D += .85*(1. - smoothstep(-px, px, min(min(back, head), arm)));
  float ref = exp(-pow((q.y - (bc.y - .011))/.0016, 2.))*smoothstep(.035, .0, abs(x - bc.x) - .02)*(.5 + .5*gnoise(vec2(x*300., 1.)));
  D += .16*ref;
  for (int i = 0; i < 8; i++){
    float fi = float(i);
    float yy = .150 - .016*fi - .005*hash11(fi*2.1);
    float x0 = .05 + .40*hash11(fi*5.7), len = .018 + .045*hash11(fi*3.9);
    float tt = clamp((x - x0)/len, 0., 1.);
    float wdt = .0015*sin(tt*3.1416);
    float yc = yy + .002*sin(tt*6.283 + fi);
    D += .28*(1. - smoothstep(wdt*.5, wdt + px, abs(q.y - yc)))*step(x0, x)*step(x, x0 + len)*(1. - .7*feibai(q, 260., .15));
  }
  // 右下角几枝芦苇
  for (int i = 0; i < 9; i++){
    float fi = float(i);
    vec2 root = vec2(.47 + .10*hash11(fi*3.3), -.01);
    float ht = .09 + .10*hash11(fi*5.1);
    float bend = -(.02 + .04*hash11(fi*7.7));
    float t = clamp((q.y - root.y)/ht, 0., 1.);
    float xc = root.x + bend*t*t;
    float wdt = mix(.0026, .0004, t);
    D += (1. - smoothstep(wdt - px*.3, wdt + px, abs(x - xc)))*step(q.y, root.y + ht)*step(root.y, q.y)*.75;
    vec2 tp = vec2(xc, root.y + ht);
    float plume = length((q - tp - vec2(bend*.12, .008))*vec2(1., .45)) - .0065;
    D += (1. - smoothstep(-px, px*2., plume + .0016*gnoise(q*600.)))*.38*(.6 + .4*gnoise(q*900.));
  }
  // 下面的湖水淡淡一层
  D += .04*smoothstep(.16, .0, q.y);

  vec3 col = inkMix(paperCol(uv, q), D, Db, Do, q);
  fragColor = vec4(toSRGB(pow(col, vec3(2.2))), 1.);
}
`,
  text(ctx) {
    ctx.save();
    ctx.globalCompositeOperation = 'multiply';
    ctx.fillStyle = 'rgb(34,31,29)';
    ctx.textAlign = 'center';
    ctx.font = '400 44px "LXGW WenKai"';
    ctx.letterSpacing = '4px';
    ctx.fillText('它不会砸到你头上', 543, 1262);
    ctx.font = '400 58px "LXGW WenKai"';
    ctx.fillText('会先碎掉，变成一道光环', 543, 1344);
    ctx.restore();
  },
  watermark: { seal: true },
};
