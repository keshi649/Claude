// WebGL2 小工具：全屏三角形、着色器、浮点渲染目标、分块绘制（软件渲染一次画太久会被浏览器判成卡死）、辉光后期。
const GLX = (() => {
  const VS = `#version 300 es
in vec2 aPos;
void main(){ gl_Position = vec4(aPos, 0., 1.); }`;
  let gl, canvas;
  const cache = new Map();

  function init(c) {
    canvas = c;
    gl = c.getContext('webgl2', { preserveDrawingBuffer: true, antialias: false, alpha: false, premultipliedAlpha: false });
    if (!gl) throw new Error('没有 WebGL2');
    if (!gl.getExtension('EXT_color_buffer_float')) throw new Error('没有 EXT_color_buffer_float');
    gl.getExtension('OES_texture_float_linear');
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    return gl;
  }

  function numbered(src) {
    return src.split('\n').map((l, i) => String(i + 1).padStart(4) + '  ' + l).join('\n');
  }

  function program(fs) {
    if (cache.has(fs)) return cache.get(fs);
    const mk = (type, src) => {
      const s = gl.createShader(type);
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
        const log = gl.getShaderInfoLog(s);
        const m = /ERROR: 0:(\d+)/.exec(log || '');
        let ctx = '';
        if (m) {
          const ln = +m[1], lines = src.split('\n');
          ctx = lines.slice(Math.max(0, ln - 4), ln + 2).map((l, i) => (Math.max(0, ln - 4) + i + 1) + ': ' + l).join('\n');
        }
        throw new Error('着色器编译失败：' + log + '\n' + ctx);
      }
      return s;
    };
    const p = gl.createProgram();
    gl.attachShader(p, mk(gl.VERTEX_SHADER, VS));
    gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'aPos');
    gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('链接失败：' + gl.getProgramInfoLog(p));
    cache.set(fs, p);
    return p;
  }

  function target(w, h, float = true) {
    const tex = gl.createTexture();
    gl.bindTexture(gl.TEXTURE_2D, tex);
    gl.texImage2D(gl.TEXTURE_2D, 0, float ? gl.RGBA16F : gl.RGBA8, w, h, 0, gl.RGBA, float ? gl.HALF_FLOAT : gl.UNSIGNED_BYTE, null);
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

  function setUniforms(p, u) {
    for (const [k, v] of Object.entries(u)) {
      const loc = gl.getUniformLocation(p, k);
      if (loc === null) continue;
      if (typeof v === 'number') gl.uniform1f(loc, v);
      else if (v.length === 2) gl.uniform2fv(loc, v);
      else if (v.length === 3) gl.uniform3fv(loc, v);
      else if (v.length === 4) gl.uniform4fv(loc, v);
    }
  }

  async function draw(p, tgt, uniforms = {}, textures = {}, tiles = 1) {
    gl.useProgram(p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, tgt ? tgt.fb : null);
    const w = tgt ? tgt.w : canvas.width, h = tgt ? tgt.h : canvas.height;
    gl.viewport(0, 0, w, h);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
    setUniforms(p, Object.assign({ uRes: [w, h] }, uniforms));
    let unit = 0;
    for (const [name, t] of Object.entries(textures)) {
      gl.activeTexture(gl.TEXTURE0 + unit);
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.uniform1i(gl.getUniformLocation(p, name), unit);
      unit++;
    }
    if (tiles <= 1) { gl.drawArrays(gl.TRIANGLES, 0, 3); gl.finish(); return; }
    gl.enable(gl.SCISSOR_TEST);
    const th = Math.ceil(h / tiles);
    for (let i = 0; i < tiles; i++) {
      gl.scissor(0, i * th, w, th);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
      gl.finish();
      await new Promise((r) => setTimeout(r, 0));
    }
    gl.disable(gl.SCISSOR_TEST);
  }

  // ---- 后期：取亮部、两级模糊、合成（ACES、调色、暗角、颗粒） ----
  const FS_BRIGHT = GLSL_HEAD + `
uniform sampler2D uSrc; uniform vec2 uSrcRes; uniform float uThr;
void main(){
  vec2 uv = gl_FragCoord.xy/uRes;
  vec2 tx = 1./uSrcRes;
  vec3 c = vec3(0.);
  for (int y = -1; y <= 2; y++) for (int x = -1; x <= 2; x++) c += texture(uSrc, uv + vec2(float(x) - .5, float(y) - .5)*tx).rgb;
  c /= 16.;
  float l = max(c.r, max(c.g, c.b));
  float k = max(l - uThr, 0.)/max(l, 1e-4);
  fragColor = vec4(c*k, 1.);
}`;
  const FS_DOWN = GLSL_HEAD + `
uniform sampler2D uSrc; uniform vec2 uSrcRes;
void main(){
  vec2 uv = gl_FragCoord.xy/uRes; vec2 tx = 1./uSrcRes;
  vec3 c = texture(uSrc, uv + vec2(-.5,-.5)*tx).rgb + texture(uSrc, uv + vec2(.5,-.5)*tx).rgb + texture(uSrc, uv + vec2(-.5,.5)*tx).rgb + texture(uSrc, uv + vec2(.5,.5)*tx).rgb;
  fragColor = vec4(c*.25, 1.);
}`;
  const FS_BLUR = GLSL_HEAD + `
uniform sampler2D uSrc; uniform vec2 uDir; uniform float uSigma;
void main(){
  vec2 uv = gl_FragCoord.xy/uRes;
  vec3 c = vec3(0.); float ws = 0.;
  for (int i = -24; i <= 24; i++){
    float x = float(i);
    float w = exp(-x*x/(2.*uSigma*uSigma));
    c += texture(uSrc, uv + uDir*x/uRes).rgb*w; ws += w;
  }
  fragColor = vec4(c/ws, 1.);
}`;
  const FS_COMP = GLSL_HEAD + GLSL_COMMON + `
uniform sampler2D uScene, uB1, uB2;
uniform float uExposure, uBloom1, uBloom2, uGrain, uVig, uSat, uContrast;
uniform vec3 uLift, uGain, uShadowTint, uHighTint;
void main(){
  vec2 uv = gl_FragCoord.xy/uRes;
  vec3 c = texture(uScene, uv).rgb;
  c += texture(uB1, uv).rgb*uBloom1 + texture(uB2, uv).rgb*uBloom2;
  c *= uExposure;
  c = aces(c);
  c = toSRGB(c);
  // 分离色调：暗部偏青、亮部偏暖
  float l = luma(c);
  c += uShadowTint*(1. - smoothstep(0., .45, l)) + uHighTint*smoothstep(.45, 1., l);
  c = (c - .5)*uContrast + .5;
  c = mix(vec3(luma(c)), c, uSat);
  c = c*uGain + uLift*(1. - c);
  vec2 q = uv - .5; q.x *= uRes.x/uRes.y;
  c *= 1. - uVig*smoothstep(.2, .85, length(q*vec2(1.25, 1.)));
  float g = hash12(floor(gl_FragCoord.xy/2.) + 11.7) - .5;
  c += g*uGrain*(.35 + .65*(1. - l));
  fragColor = vec4(clamp(c, 0., 1.), 1.);
}`;

  // 场景着色器画进浮点纹理，再出辉光、合成到画布
  async function renderHDR(sceneFS, uniforms, post, tiles) {
    const W = canvas.width, H = canvas.height;
    const scene = target(W, H, true);
    await draw(program(sceneFS), scene, uniforms, {}, tiles);
    const q1 = target(Math.ceil(W / 4), Math.ceil(H / 4)), q1b = target(q1.w, q1.h);
    const q2 = target(Math.ceil(W / 12), Math.ceil(H / 12)), q2b = target(q2.w, q2.h);
    await draw(program(FS_BRIGHT), q1, { uSrcRes: [W, H], uThr: post.thr ?? 1.0 }, { uSrc: scene });
    await draw(program(FS_BLUR), q1b, { uDir: [1, 0], uSigma: post.sigma1 ?? 6 }, { uSrc: q1 });
    await draw(program(FS_BLUR), q1, { uDir: [0, 1], uSigma: post.sigma1 ?? 6 }, { uSrc: q1b });
    await draw(program(FS_DOWN), q2, { uSrcRes: [q1.w, q1.h] }, { uSrc: q1 });
    await draw(program(FS_BLUR), q2b, { uDir: [1, 0], uSigma: post.sigma2 ?? 9 }, { uSrc: q2 });
    await draw(program(FS_BLUR), q2, { uDir: [0, 1], uSigma: post.sigma2 ?? 9 }, { uSrc: q2b });
    await draw(program(FS_COMP), null, {
      uExposure: post.exposure ?? 1, uBloom1: post.bloom1 ?? 0.3, uBloom2: post.bloom2 ?? 0.3,
      uGrain: post.grain ?? 0.04, uVig: post.vig ?? 0.3, uSat: post.sat ?? 1, uContrast: post.contrast ?? 1,
      uLift: post.lift ?? [0, 0, 0], uGain: post.gain ?? [1, 1, 1],
      uShadowTint: post.shadowTint ?? [0, 0, 0], uHighTint: post.highTint ?? [0, 0, 0],
    }, { uScene: scene, uB1: q1, uB2: q2 });
  }

  // 场景着色器直接输出最终颜色（水墨、极简）
  async function renderLDR(sceneFS, uniforms, tiles) {
    await draw(program(sceneFS), null, uniforms, {}, tiles);
  }

  return { init, program, target, draw, renderHDR, renderLDR, get gl() { return gl; } };
})();
