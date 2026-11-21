// WebGL2 引擎：每个镜头是一个全屏着色器，画进 HDR 浮点纹理；碎块用点精灵画进同一张纹理。
// 两个镜头转场时各画一张再混合。辉光、色调映射、调色、颗粒、叠字在最后一遍合成，
// 合成时上下翻转，gl.readPixels 读出来就是从上到下的行，直接交给 ffmpeg。
const GLX = (() => {
  const VS = `#version 300 es
in vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0., 1.); }`;
  let gl, canvas, W, H, quadBuf, pointBuf;
  const progs = new Map();
  const T = {};

  function init(c, w, h) {
    canvas = c; W = w; H = h;
    c.width = w; c.height = h;
    gl = c.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, alpha: false, premultipliedAlpha: false, depth: false });
    if (!gl) throw new Error('没有 WebGL2');
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('没有 EXT_color_buffer_float');
    gl.getExtension('OES_texture_float_linear');
    gl.getExtension('EXT_float_blend');
    quadBuf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    pointBuf = gl.createBuffer();
    T.A = target(W, H); T.B = target(W, H); T.C = target(W, H);
    T.q1 = target(Math.ceil(W / 4), Math.ceil(H / 4)); T.q1b = target(T.q1.w, T.q1.h);
    T.q2 = target(Math.ceil(W / 12), Math.ceil(H / 12)); T.q2b = target(T.q2.w, T.q2.h);
    T.ov = gl.createTexture();
    return gl;
  }

  function compile(type, src) {
    const s = gl.createShader(type);
    gl.shaderSource(s, src);
    gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
      const log = gl.getShaderInfoLog(s) || '';
      const m = /ERROR: 0:(\d+)/.exec(log);
      let ctx = '';
      if (m) {
        const ln = +m[1], lines = src.split('\n');
        ctx = lines.slice(Math.max(0, ln - 4), ln + 2).map((l, i) => (Math.max(0, ln - 4) + i + 1) + ': ' + l).join('\n');
      }
      throw new Error('着色器编译失败：' + log + '\n' + ctx);
    }
    return s;
  }
  function program(fs, vs = VS, attribs = ['aPos']) {
    const key = vs + '\u0000' + fs;
    if (progs.has(key)) return progs.get(key);
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, vs));
    gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    attribs.forEach((a, i) => gl.bindAttribLocation(p, i, a));
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('链接失败：' + gl.getProgramInfoLog(p));
    const info = { p, loc: {} };
    progs.set(key, info);
    return info;
  }
  function loc(pi, name) {
    if (!(name in pi.loc)) pi.loc[name] = gl.getUniformLocation(pi.p, name);
    return pi.loc[name];
  }
  function setUniforms(pi, u) {
    for (const [k, v] of Object.entries(u)) {
      const l = loc(pi, k);
      if (l === null) continue;
      if (typeof v === 'number') gl.uniform1f(l, v);
      else if (v.length === 2) gl.uniform2fv(l, v);
      else if (v.length === 3) gl.uniform3fv(l, v);
      else if (v.length === 4) gl.uniform4fv(l, v);
      else if (v.length === 9) gl.uniformMatrix3fv(l, false, v);
      else gl.uniform4fv(l, v);   // vec4 数组
    }
  }

  function target(w, h) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16F, w, h, 0, gl.RGBA, gl.HALF_FLOAT, null);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    const fb = gl.createFramebuffer();
    gl.bindFramebuffer(gl.FRAMEBUFFER, fb);
    gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, tex, 0);
    if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) throw new Error('帧缓冲不完整');
    return { tex, fb, w, h };
  }

  // 图片做成纹理（经纬图：横向循环、带 mipmap）
  function imageTexture(img) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, img);
    gl.generateMipmap(gl.TEXTURE_2D);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return { tex };
  }

  // 浮点数据表做成纹理（比如黑洞的偏折角表）：一行，R32F，线性插值；同一个 key 反复更新同一张纹理
  const dataTex = new Map();
  function dataTexture(key, arr, w, h = 1) {
    let t = dataTex.get(key);
    if (!t) {
      t = { tex: gl.createTexture() };
      dataTex.set(key, t);
    }
    gl.bindTexture(gl.TEXTURE_2D, t.tex);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R32F, w, h, 0, gl.RED, gl.FLOAT, arr);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }

  function bindQuad() {
    gl.bindBuffer(gl.ARRAY_BUFFER, quadBuf);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    gl.disableVertexAttribArray(1);
  }
  function draw(pi, tgt, uniforms = {}, textures = {}) {
    gl.useProgram(pi.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, tgt ? tgt.fb : null);
    const w = tgt ? tgt.w : W, h = tgt ? tgt.h : H;
    gl.viewport(0, 0, w, h);
    gl.disable(gl.BLEND);
    bindQuad();
    setUniforms(pi, Object.assign({ uRes: [w, h] }, uniforms));
    let unit = 0;
    for (const [name, t] of Object.entries(textures)) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.uniform1i(loc(pi, name), unit);
      unit++;
    }
    gl.drawArrays(gl.TRIANGLES, 0, 3);
  }

  // ---- 碎块：点精灵，球形假体，按太阳光照；被地球（遮挡球）挡住的丢掉 ----
  const PVS = `#version 300 es
precision highp float;
in vec3 aPos;
in vec4 aAttr;      // 半径（世界单位）、种子、发热、亮度
uniform vec2 uRes;
uniform vec3 uCamPos, uCamR, uCamU, uCamF;
uniform float uTanHalf;
out vec4 vAttr;
out vec3 vCenter;
out float vRadPx;
void main(){
  vec3 rel = aPos - uCamPos;
  float z = dot(rel, uCamF);
  if (z < .02){ gl_Position = vec4(3., 3., 3., 1.); gl_PointSize = 0.; return; }
  float aspect = uRes.x/uRes.y;
  vec2 ndc = vec2(dot(rel, uCamR)/(z*uTanHalf*aspect), dot(rel, uCamU)/(z*uTanHalf));
  float rpx = aAttr.x/(z*uTanHalf)*uRes.y*.5;
  float glowPad = aAttr.z > .05 ? rpx*1.2 + 2. : 1.5;
  gl_PointSize = clamp(2.*(rpx + glowPad), 1., 512.);
  gl_Position = vec4(ndc, 0., 1.);
  vAttr = aAttr; vCenter = aPos; vRadPx = rpx;
}`;
  function pointsFS(head) {
    return head + `
in vec4 vAttr; in vec3 vCenter; in float vRadPx;
uniform vec3 uCamPos, uCamR, uCamU, uCamF, uSun, uRockCol;
uniform vec4 uOcc;
void main(){
  float rpx = max(vRadPx, .35);
  float glowPad = vAttr.z > .05 ? vRadPx*1.2 + 2. : 1.5;
  float half_ = rpx + glowPad;
  vec2 pc = (gl_PointCoord*2. - 1.)*vec2(1., -1.);
  vec2 q = pc*half_/rpx;                       // 以半径为单位
  float r = length(q);
  vec3 rd = normalize(vCenter - uCamPos);
  vec2 hit = sphHit(uCamPos, rd, uOcc.xyz, uOcc.w);
  if (hit.x > 0. && hit.x < length(vCenter - uCamPos) - vAttr.x) discard;
  float heat = vAttr.z;
  // 太小的碎块（不到 1 像素）当成一个光点
  float sub = clamp(vRadPx, 0., 1.);
  float cov = 1. - smoothstep(1. - 1./rpx, 1. + 1./rpx, r);
  vec3 col = vec3(0.); float a = 0.;
  if (r < 1. + 1./rpx){
    float z = sqrt(max(1. - r*r, 0.));
    vec3 n = normalize(q.x*uCamR + q.y*uCamU - z*uCamF);
    float sd = vAttr.y*91.7;
    n = normalize(n + .45*vec3(gnoise(q*2.3 + sd), gnoise(q*2.3 + sd + 7.), gnoise(q*2.3 + sd + 13.)));
    float diff = max(dot(n, uSun), 0.);
    float alb = .75 + .5*hash11(vAttr.y*17.);
    col = uRockCol*alb*(.015 + 1.7*diff)*vAttr.w + vec3(1., .42, .12)*heat*2.2*(.5 + .5*gnoise(q*3. + sd));
    a = cov*mix(1., sub, step(vRadPx, 1.));
    col *= a;
  }
  if (heat > 0.){
    float g = exp(-max(r - 1., 0.)*3.)*heat*.35;
    col += vec3(1., .5, .2)*g*(1. - a);
  }
  fragColor = vec4(col, a);
}`;
  }
  let pointsProg = null;
  function drawPoints(tgt, data, count, uniforms) {
    if (!count) return;
    if (!pointsProg) pointsProg = program(pointsFS(GLSL_HEAD + GLSL_COMMON), PVS, ['aPos', 'aAttr']);
    gl.useProgram(pointsProg.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, tgt.fb);
    gl.viewport(0, 0, tgt.w, tgt.h);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
    gl.bindBuffer(gl.ARRAY_BUFFER, pointBuf);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 28, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 4, gl.FLOAT, false, 28, 12);
    setUniforms(pointsProg, Object.assign({ uRes: [tgt.w, tgt.h] }, uniforms));
    gl.drawArrays(gl.POINTS, 0, count);
    gl.disable(gl.BLEND);
    gl.disableVertexAttribArray(1);
  }

  // ---- 后期 ----
  const FS_MIX = GLSL_HEAD + `
uniform sampler2D uA, uB; uniform float uMix, uKind;
void main(){
  vec2 uv = gl_FragCoord.xy/uRes;
  vec3 a = texture(uA, uv).rgb, b = texture(uB, uv).rgb;
  vec3 c = mix(a, b, uMix);
  float pk = sin(3.14159*uMix);
  if (uKind > .5) c = uMix < .5 ? a : b;                                     // 白闪、经过黑：在最亮 / 最暗的那一刻换镜头，不叠影
  if (uKind > .5 && uKind < 1.5) c += vec3(1.)*.32*pk*pk;                  // 白闪
  if (uKind > 1.5) c *= 1. - pk;                                            // 经过黑
  fragColor = vec4(c, 1.);
}`;
  const FS_BRIGHT = GLSL_HEAD + `
uniform sampler2D uSrc; uniform vec2 uSrcRes; uniform float uThr;
void main(){
  vec2 uv = gl_FragCoord.xy/uRes; vec2 tx = 1./uSrcRes;
  vec3 c = vec3(0.);
  for (int y = -1; y <= 2; y++) for (int x = -1; x <= 2; x++) c += texture(uSrc, uv + vec2(float(x) - .5, float(y) - .5)*tx).rgb;
  c /= 16.;
  float l = max(c.r, max(c.g, c.b));
  fragColor = vec4(c*max(l - uThr, 0.)/max(l, 1e-4), 1.);
}`;
  const FS_DOWN = GLSL_HEAD + `
uniform sampler2D uSrc; uniform vec2 uSrcRes;
void main(){
  vec2 uv = gl_FragCoord.xy/uRes; vec2 tx = 1./uSrcRes;
  fragColor = vec4((texture(uSrc, uv + vec2(-.5,-.5)*tx).rgb + texture(uSrc, uv + vec2(.5,-.5)*tx).rgb + texture(uSrc, uv + vec2(-.5,.5)*tx).rgb + texture(uSrc, uv + vec2(.5,.5)*tx).rgb)*.25, 1.);
}`;
  const FS_BLUR = GLSL_HEAD + `
uniform sampler2D uSrc; uniform vec2 uDir; uniform float uSigma;
void main(){
  vec2 uv = gl_FragCoord.xy/uRes;
  vec3 c = vec3(0.); float ws = 0.;
  for (int i = -20; i <= 20; i++){
    float x = float(i); float w = exp(-x*x/(2.*uSigma*uSigma));
    c += texture(uSrc, uv + uDir*x/uRes).rgb*w; ws += w;
  }
  fragColor = vec4(c/ws, 1.);
}`;
  const FS_COMP = GLSL_HEAD + GLSL_COMMON + `
uniform sampler2D uScene, uB1, uB2, uOv;
uniform float uExposure, uBloom1, uBloom2, uGrain, uVig, uSat, uContrast, uFade, uSeed;
uniform vec3 uLift, uGain, uShadowTint, uHighTint;
void main(){
  vec2 uv = vec2(gl_FragCoord.x/uRes.x, 1. - gl_FragCoord.y/uRes.y);     // 上下翻转：读回来就是从上到下
  vec3 c = texture(uScene, uv).rgb + texture(uB1, uv).rgb*uBloom1 + texture(uB2, uv).rgb*uBloom2;
  c = toSRGB(aces(c*uExposure));
  float l = luma(c);
  c += uShadowTint*(1. - smoothstep(0., .45, l)) + uHighTint*smoothstep(.45, 1., l);
  c = (c - .5)*uContrast + .5;
  c = mix(vec3(luma(c)), c, uSat);
  c = c*uGain + uLift*(1. - c);
  vec2 q = uv - .5; q.x *= uRes.x/uRes.y;
  c *= 1. - uVig*smoothstep(.2, .85, length(q*vec2(1.25, 1.)));
  c += (hash12(floor(gl_FragCoord.xy/2.) + uSeed) - .5)*uGrain*(.35 + .65*(1. - l));
  c *= uFade;
  vec4 o = texture(uOv, uv);
  c = c*(1. - o.a) + o.rgb;
  fragColor = vec4(clamp(c, 0., 1.), 1.);
}`;

  const POST_DEFAULT = { exposure: 1, thr: 1, bloom1: .3, bloom2: .35, sigma1: 5, sigma2: 8, grain: .035, vig: .38, sat: 1, contrast: 1,
                         lift: [0, 0, 0], gain: [1, 1, 1], shadowTint: [0, 0, 0], highTint: [0, 0, 0], fade: 1 };
  function lerpPost(a, b, k) {
    const o = {};
    for (const key of Object.keys(POST_DEFAULT)) {
      const x = a[key] ?? POST_DEFAULT[key], y = b[key] ?? POST_DEFAULT[key];
      o[key] = Array.isArray(x) ? x.map((v, i) => v + (y[i] - v) * k) : x + (y - x) * k;
    }
    return o;
  }

  // 画一个镜头：全屏着色器 +（可选）碎块
  function drawShot(shot, t, lt, tgt) {
    const u = Object.assign({ uTime: t, uLT: lt }, shot.uniforms ? shot.uniforms(t, lt) : {});
    const tex = shot.textures ? shot.textures() : {};
    draw(program(shot.fs), tgt, u, tex);
    if (shot.points) {
      const pts = shot.points(t, lt, u);
      if (pts && pts.count) drawPoints(tgt, pts.data, pts.count, Object.assign({}, u, pts.uniforms || {}));
    }
  }

  // 一帧：a = {shot, t, lt}，b 同（转场时），mix、kind（0 叠化，1 白闪，2 经过黑）
  function frame(a, b, mix, kind, overlayCanvas, seed) {
    drawShot(a.shot, a.t, a.lt, T.A);
    let src = T.A;
    let post = Object.assign({}, POST_DEFAULT, typeof a.shot.post === 'function' ? a.shot.post(a.t, a.lt) : a.shot.post || {});
    if (b) {
      drawShot(b.shot, b.t, b.lt, T.B);
      draw(program(FS_MIX), T.C, { uMix: mix, uKind: kind }, { uA: T.A, uB: T.B });
      src = T.C;
      const pb = Object.assign({}, POST_DEFAULT, typeof b.shot.post === 'function' ? b.shot.post(b.t, b.lt) : b.shot.post || {});
      post = lerpPost(post, pb, mix);
    }
    draw(program(FS_BRIGHT), T.q1, { uSrcRes: [W, H], uThr: post.thr }, { uSrc: src });
    draw(program(FS_BLUR), T.q1b, { uDir: [1, 0], uSigma: post.sigma1 }, { uSrc: T.q1 });
    draw(program(FS_BLUR), T.q1, { uDir: [0, 1], uSigma: post.sigma1 }, { uSrc: T.q1b });
    draw(program(FS_DOWN), T.q2, { uSrcRes: [T.q1.w, T.q1.h] }, { uSrc: T.q1 });
    draw(program(FS_BLUR), T.q2b, { uDir: [1, 0], uSigma: post.sigma2 }, { uSrc: T.q2 });
    draw(program(FS_BLUR), T.q2, { uDir: [0, 1], uSigma: post.sigma2 }, { uSrc: T.q2b });
    gl.bindTexture(gl.TEXTURE_2D, T.ov);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, overlayCanvas);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    draw(program(FS_COMP), null, {
      uExposure: post.exposure, uBloom1: post.bloom1, uBloom2: post.bloom2, uGrain: post.grain, uVig: post.vig,
      uSat: post.sat, uContrast: post.contrast, uLift: post.lift, uGain: post.gain, uShadowTint: post.shadowTint,
      uHighTint: post.highTint, uFade: post.fade, uSeed: seed % 97,
    }, { uScene: src, uB1: T.q1, uB2: T.q2, uOv: { tex: T.ov } });
  }

  let pix = null;
  function readB64() {
    if (!pix) pix = new Uint8Array(W * H * 4);
    gl.readPixels(0, 0, W, H, gl.RGBA, gl.UNSIGNED_BYTE, pix);
    let s = '';
    const CH = 0x8000;
    for (let i = 0; i < pix.length; i += CH) s += String.fromCharCode.apply(null, pix.subarray(i, i + CH));
    return btoa(s);
  }

  return { init, program, imageTexture, dataTexture, frame, readB64, get gl() { return gl; }, get W() { return W; }, get H() { return H; } };
})();
