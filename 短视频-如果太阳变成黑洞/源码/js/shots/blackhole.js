// 开头：太阳缩成黑洞（collapse）；结尾前：真实的太阳（realSun）。同一个着色器。
// 单位：史瓦西半径 r_s = 1（质量和太阳一样的黑洞，r_s ≈ 2.95 公里）。黑洞在原点。
// 光线怎么弯：史瓦西度规下光子的轨道方程 u'' = -u + 1.5u²（u = 1/r），在 JS 里用 RK4 积分：
// 镜头离黑洞 D，一条视线和"看向黑洞"的方向夹角 θ，算出这条光线（倒着追）跑到无穷远时一共转过的角度 φ∞，
// 1024 个 θ 做成一张表（θ 按三次方往临界角那边加密），着色器里查表，再到那个方向去取银河和星星。
// θ 小于临界角的光线掉进黑洞（黑影）；太阳还没缩小时，打到太阳表面的光线画太阳。
const BHL = (() => {
  const N = 1024;
  const cache = new Map();
  const f = (u) => -u + 1.5 * u * u;
  function phiInf(D, th) {
    const sq = Math.sqrt(1 - 1 / D);
    const b = D * Math.sin(th) / sq;
    let u = 1 / D;
    let v = Math.sqrt(Math.max(1 / (b * b) - u * u + u * u * u, 0)) * (th < Math.PI / 2 ? 1 : -1);
    let phi = 0;
    const h = 0.0025;
    for (let k = 0; k < 16000; k++) {
      const k1u = v, k1v = f(u);
      const k2u = v + .5 * h * k1v, k2v = f(u + .5 * h * k1u);
      const k3u = v + .5 * h * k2v, k3v = f(u + .5 * h * k2u);
      const k4u = v + h * k3v, k4v = f(u + h * k3u);
      const un = u + h / 6 * (k1u + 2 * k2u + 2 * k3u + k4u);
      const vn = v + h / 6 * (k1v + 2 * k2v + 2 * k3v + k4v);
      if (un <= 0) return phi + h * u / (u - un);
      if (un >= 1) return -1;
      u = un; v = vn; phi += h;
    }
    return phi;
  }
  function table(D) {
    const key = D.toFixed(4);
    if (cache.has(key)) return cache.get(key);
    const sq = Math.sqrt(1 - 1 / D);
    const thc = Math.asin(Math.min(1, 1.5 * Math.sqrt(3) * sq / D));
    const arr = new Float32Array(N);
    let last = 0;
    for (let i = N - 1; i >= 0; i--) {
      const s = i / (N - 1);
      const th = Math.min(thc + (Math.PI - thc) * s * s * s, Math.PI - 1e-6);
      let p = phiInf(D, th);
      if (p < 0) p = last + .3;          // 紧贴临界角、数值上掉进去的，当成还在绕
      arr[i] = p; last = p;
    }
    const out = { arr, thc, D };
    cache.set(key, out);
    if (cache.size > 6) cache.delete(cache.keys().next().value);
    return out;
  }
  return { N, table, phiInf };
})();

const BH_FS = GLSL_HEAD + GLSL_COMMON + SKY_GLSL + `
uniform vec3 uCamPos, uCamR, uCamU, uCamF;
uniform float uTanHalf, uD, uThC, uR, uStarI, uSpin, uCorona, uRing, uSkyI, uProm;
uniform sampler2D uDefl;

// 太阳表面：米粒组织（泰森多边形，格子亮、缝暗）、光斑网、几个黑子、临边昏暗（越靠边越暗越红）
vec3 sunSurface(vec3 n, float mu, float pxs){
  vec3 P = n*72.;
  vec3 ip = floor(P), fp = fract(P);
  float d1 = 1e9, d2 = 1e9;
  for (int z = -1; z <= 1; z++) for (int y = -1; y <= 1; y++) for (int x = -1; x <= 1; x++){
    vec3 g = vec3(float(x), float(y), float(z));
    vec3 v = g + hash33(ip + g)*.85 + .07 - fp;
    float dd = dot(v, v);
    if (dd < d1){ d2 = d1; d1 = dd; } else if (dd < d2) d2 = dd;
  }
  float lane = smoothstep(0., .28, sqrt(d2) - sqrt(d1));
  float blur = clamp(pxs*72.*1.1, 0., 1.);               // 格子小于一个像素时抹平，免得闪
  float gran = mix(.72 + .28*lane, .86, blur)*(.92 + .08*gnoise3(n*130.))*(.90 + .20*fbm3N(n*14. + 7., 3));
  float net = smoothstep(.15, .55, fbm3N(n*7. + 3., 4));
  float fac = net*pow(1. - mu, 1.5)*.35;
  float spot = 1.;
  for (int k = 0; k < 4; k++){
    vec3 c = normalize(hash33(vec3(float(k)*7.1, 3.3, 9.1)) - .5 + vec3(0., 0., .9));
    float r = .03 + .035*hash11(float(k)*3.7);
    float d = acos(clamp(dot(n, c), -1., 1.))*(1. + .25*gnoise3(n*40.));
    float pen = 1. - smoothstep(r*.9, r*1.9, d);
    float umb = 1. - smoothstep(r*.35, r*.6, d);
    float fil = .75 + .25*gnoise(vec2(atan(dot(n, cross(c, vec3(0., 1., 0.))), dot(n, vec3(0., 1., 0.)))*40., d*60.));
    spot *= 1. - pen*.45*fil - umb*.5;
  }
  vec3 ld = max(vec3(1.) - vec3(.42, .64, .86)*(1. - mu) - vec3(.12, .18, .14)*(1. - mu*mu), vec3(.02));
  vec3 base = vec3(1., .78, .48)*(1. + .15*pow(mu, 3.));
  return base*ld*gran*spot + vec3(1., .85, .65)*fac;
}

void main(){
  vec2 p = (gl_FragCoord.xy - .5*uRes)/uRes.y;
  vec3 rd = normalize(uCamF + p.x*2.*uTanHalf*uCamR + p.y*2.*uTanHalf*uCamU);
  float px = 2.*uTanHalf/uRes.y;
  vec3 er = uCamPos/uD;                              // 黑洞 → 镜头
  float cth = clamp(dot(rd, -er), -1., 1.);
  float th = acos(cth);
  vec3 ey = rd + cth*er; float ly = length(ey); ey = ly > 1e-7 ? ey/ly : uCamU;
  float sq = sqrt(1. - 1./uD);
  // 太阳表面看上去的边：半径 R 的球，掠过它的光线的碰撞参数 b = R/sqrt(1 - 1/R)；缩到光子球（1.5）以内就只剩黑影那么大
  float bStar = uR >= 1.5 ? uR/sqrt(1. - 1./uR) : 2.598076;
  float thEdge = asin(min(1., bStar*sq/uD));

  float s = pow(max(th - uThC, 0.)/(PI - uThC), 1./3.);
  float phi = texture(uDefl, vec2((s*1023. + .5)/1024., .5)).r;
  vec3 dir = cos(phi)*er + sin(phi)*ey;
  vec3 dx = dFdx(dir), dy = dFdy(dir);
  float pxs = max(sqrt(max(length(dx)*length(dy), 1e-14)), px*.05);
  float mag = clamp(px*px/(pxs*pxs), 0., 40.);
  vec3 col = th > uThC ? spaceSky(dir, pxs, mag)*uSkyI : vec3(0.);
  // 光子环：紧贴黑影外面一圈很细的亮边（背景被绕了很多圈压成的像）
  col += vec3(1., .93, .85)*uRing*exp(-max(th - uThC, 0.)/(px*1.2))*step(uThC, th);

  // 太阳本身
  if (uR > 1.) {
    float aa = 1. - smoothstep(thEdge - px*.7, thEdge + px*.7, th);
    float g = sqrt(max(1. - 1./max(uR, 1.0001), 0.)/(1. - 1./uD));      // 引力红移
    if (aa > 0.){
      float rho = clamp(sin(th)/sin(thEdge), 0., 1.);
      float mu = sqrt(max(1. - rho*rho, 0.));
      vec3 n = rotY(mu*er + rho*ey, uSpin);
      vec3 surf = sunSurface(n, mu, px/max(sin(thEdge), 1e-4));
      vec3 tint = mix(vec3(1., .30, .06), vec3(1.), smoothstep(.35, .97, g));
      col = mix(col, surf*uStarI*pow(g, 4.)*tint, aa);
    }
    // 日冕和日珥：只在边外面
    if (uCorona > 0. && th > thEdge*.98){
      float h = max(th - thEdge, 0.)/thEdge;
      float ang = atan(dot(ey, uCamU), dot(ey, uCamR));
      float str = .55 + .45*gnoise(vec2(ang*5., 1.3)) + .25*gnoise(vec2(ang*13., 4.1));
      vec3 cor = vec3(1., .80, .55)*(exp(-h/.03)*.25 + exp(-h/.16)*.20*str + exp(-h/.8)*.05);
      float fl = fbmN(vec2(ang*3.2, h*4. - uTime*.15), 5) + .30*gnoise(vec2(ang*22., h*26. - uTime*.5));
      float site = smoothstep(.15, .45, gnoise(vec2(ang*2.1, 7.7)));
      float prom = smoothstep(.10, .30, fl*site - h*1.6)*smoothstep(.0, .01, h)*uProm;
      cor += vec3(1., .30, .09)*prom*2.2;
      col += cor*uCorona*uStarI*pow(g, 4.)*.30*(1. - aa);
    }
  }
  fragColor = vec4(col, 1.);
}
`;

const BH_POST = { exposure: 1.0, thr: 1.0, bloom1: .35, bloom2: .45, sigma1: 5, sigma2: 9, grain: .03, vig: .42, contrast: 1.05, sat: 1.05,
                  shadowTint: [-.004, .002, .012], highTint: [.012, .004, -.008], lift: [.002, .004, .010] };
// 银河方向：每个镜头自己定，让银河从黑洞后面斜着穿过去
const galFor = (cam, n, c) => ({ uGalN: V3.norm(n), uGalC: V3.norm(c) });

function bhCam(D, az, el, fov, aimUp = 0, roll = 0) {
  const pos = [D * Math.cos(el) * Math.sin(az), D * Math.sin(el), D * Math.cos(el) * Math.cos(az)];
  const cam = lookAt(pos, [0, 0, 0], fov, roll);
  // 黑洞不放正中：镜头往上抬一点（aimUp 是屏幕高度的比例），黑洞落在画面偏下
  if (aimUp) {
    const k = Math.tan(fov * Math.PI / 360) * 2 * aimUp;
    const f = V3.norm(V3.add(cam.uCamF, V3.mul(cam.uCamU, k)));
    const r = V3.norm(V3.cross(f, [0, 1, 0]));
    Object.assign(cam, { uCamF: f, uCamR: r, uCamU: V3.cross(r, f) });
  }
  return cam;
}
function bhUniforms(cam, D, R, extra) {
  const tb = BHL.table(D);
  return Object.assign({ uD: D, uThC: tb.thc, uR: R, uStarI: 2.2, uSpin: 0, uCorona: 1, uRing: .06, uSkyI: 1, uProm: 1 }, cam, extra,
                       { _defl: GLX.dataTexture('defl', tb.arr, BHL.N) });
}

// 开头的太阳 → 黑洞：
//   0 ~ c0       真实大小比例的太阳（R = 300，镜头在 1200）
//   c0 ~ c1      太阳缩成一个点（变红、变暗：引力红移）
//   c1 ~ c2      镜头冲过去，黑洞从一个点长成很大的黑影，背后的星光被弯成一圈
//   c2 以后      绕着黑洞慢慢转，星光跟着流动
const HOOK = {
  c0: .30, c1: 1.05, c2: 1.85,
  R(t) {
    if (t < this.c0) return 300;
    const k = clamp01((t - this.c0) / (this.c1 - this.c0));
    const x = k * k * (1.6 - .6 * k);
    return Math.max(1.0005, Math.exp(Math.log(300) * (1 - x) + Math.log(1.0004) * x));
  },
  D(t) {
    if (t < this.c1) return 1200;
    const k = easeInOut(clamp01((t - this.c1) / (this.c2 - this.c1)));
    return Math.exp(Math.log(1200) * (1 - k) + Math.log(17) * k) - .8 * Math.max(0, t - this.c2);
  },
};
// 银心正好在黑洞背后（开头镜头看过去的方向），银河面斜着：银河的核心被弯成一个环
const GAL_HOOK = (() => {
  const vd = V3.norm([-Math.sin(-.35) * Math.cos(.1), -Math.sin(.1), -Math.cos(-.35) * Math.cos(.1)]);
  const n = V3.norm(V3.cross(vd, [.55, .83, 0]));
  const c = V3.norm(V3.add(vd, V3.mul(V3.cross(n, vd), .12)));
  return { uGalN: n, uGalC: c };
})();
function camHook(t) {
  const D = HOOK.D(t);
  const az = -.35 + .12 * t + .10 * Math.max(0, t - HOOK.c2);
  const el = .10 + .035 * t;
  const fov = lerp(64, 58, smooth(HOOK.c1, HOOK.c2, t));
  return { cam: bhCam(D, az, el, fov, lerp(.045, .02, smooth(HOOK.c1, HOOK.c2, t)), -.05 + .02 * t), D };
}
SHOTS.collapse = {
  fs: BH_FS,
  textures() { return { uDefl: this._u._defl }; },
  uniforms(t, lt) {
    const { cam, D } = camHook(t);
    const R = HOOK.R(t);
    // 封面：银心正好在黑洞背后，弯出一个完整的光环
    const gal = window.COVER ? (() => { const vd = V3.norm(V3.mul(cam.uCamPos, -1)); const n = V3.norm(V3.cross(vd, [.55, .83, 0])); return { uGalN: n, uGalC: vd }; })() : GAL_HOOK;
    const u = bhUniforms(cam, D, R, Object.assign({}, gal, {
      uSpin: .02 * t, uCorona: 1 - smooth(HOOK.c0, HOOK.c0 + .45, t), uProm: 1, uRing: .025 * smooth(HOOK.c1, HOOK.c2, t), uStarI: 1.12,
    }));
    this._u = u;
    return u;
  },
  overlay(t) {
    if (window.COVER) {          // 封面：片名放大成两行，缩成小格子也看得清
      OV.text('WHAT IF · 第二集', 540, 262, { weight: 500, size: 34, spacing: 10, color: [244, 232, 218], alpha: .85, shadow: 10 });
      OV.text('如果太阳', 540, 430, { weight: 700, size: 150, spacing: 10, color: [247, 239, 230], shadow: 40 });
      OV.text('变成黑洞', 540, 600, { weight: 700, size: 150, spacing: 10, color: [255, 212, 150], shadow: 40 });
      return;
    }
    // 片名一开始就在（2 秒内划走的人也看得到），说到"不会"时让位
    const fo = 1 - smooth(S('h2') - .3, S('h2'), t);
    const fi = 1;
    OV.text('WHAT IF · 第二集', 540, 236, { weight: 500, size: 30, spacing: 10, color: [244, 232, 218], alpha: .82 * fi * fo, shadow: 10 });
    OV.text('如果太阳变成黑洞', 540, 352, { weight: 700, size: 96, spacing: 6, color: [247, 239, 230], alpha: fi * fo, shadow: 30, scale: 1 + .02 * clamp01(t / 3) });
  },
  post(t) {
    // 太阳很亮时曝光低；缩小以后自动曝光把星空提上来
    const k = smooth(HOOK.c0 + .2, HOOK.c1 + .2, t);
    return Object.assign({}, BH_POST, { exposure: lerp(.9, 1.9, k), thr: lerp(1.1, .8, k), bloom1: lerp(.25, .35, k), bloom2: lerp(.35, .40, k) });
  },
};

// 真实的太阳（结尾前）："太轻了，变不成黑洞"。离得远，几乎看不出光线弯折
function camSun(t, lt) {
  const k = easeInOut(clamp01(lt / 4));
  return bhCam(lerp(1700, 1550, k), .55 + .04 * lt, .05, 52, -.13, .02);
}
SHOTS.realSun = {
  fs: BH_FS,
  textures() { return { uDefl: this._u._defl }; },
  uniforms(t, lt) {
    const cam = camSun(t, lt);
    const D = cam.uCamPos ? Math.hypot(...cam.uCamPos) : 1200;
    const u = bhUniforms(cam, D, 300, Object.assign({}, GAL_HOOK, { uSpin: .5 + .01 * lt, uCorona: 1, uProm: 1.2, uRing: 0, uStarI: 1.12 }));
    this._u = u;
    return u;
  },
  post: Object.assign({}, BH_POST, { exposure: .9, thr: 1.1, bloom1: .25, bloom2: .35 }),
};
