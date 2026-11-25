// 渲染引擎：按时间 t 决定哪一两个镜头在画面里，各自渲染三维 + 辉光 + 字幕层，
// 再做转场混合和整片后期。所有动画都只由 t 决定，逐帧渲染结果可复现。
import * as THREE from 'three';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { FullScreenQuad } from 'three/addons/postprocessing/Pass.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { VERT, SHOT_FRAG, MIX_FRAG, FINAL_FRAG, MIX_TYPES } from './shaders.js';
import { clamp } from './util.js';

export const DW = 1080, DH = 1920; // 设计坐标：所有镜头都按 1080×1920 写

export class Engine {
  constructor(canvas, { scale = 1, fps = 30 } = {}) {
    this.scale = scale;
    this.fps = fps;
    this.w = Math.round(DW * scale);
    this.h = Math.round(DH * scale);
    const r = (this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true, stencil: false }));
    r.setPixelRatio(1);
    r.setSize(this.w, this.h, false);
    r.outputColorSpace = THREE.LinearSRGBColorSpace; // 色调映射和 sRGB 转换在 SHOT 着色器里自己做
    r.toneMapping = THREE.NoToneMapping;
    r.shadowMap.enabled = true;
    r.shadowMap.type = THREE.PCFSoftShadowMap;

    const hdr = { type: THREE.HalfFloatType, depthBuffer: true };
    this.rtScene = [0, 1].map(() => new THREE.WebGLRenderTarget(this.w, this.h, { ...hdr, samples: 4 }));
    this.rtShot = [0, 1].map(() => new THREE.WebGLRenderTarget(this.w, this.h, { type: THREE.HalfFloatType, depthBuffer: false }));
    this.rtMix = new THREE.WebGLRenderTarget(this.w, this.h, { type: THREE.HalfFloatType, depthBuffer: false });

    this.bloom = new UnrealBloomPass(new THREE.Vector2(this.w, this.h), 0.6, 0.4, 0.9);

    // 字幕层：每个槽一块 2D 画布
    this.ovCanvas = [0, 1].map(() => { const c = document.createElement('canvas'); c.width = this.w; c.height = this.h; return c; });
    this.ovCtx = this.ovCanvas.map((c) => c.getContext('2d'));
    this.ovTex = this.ovCanvas.map((c) => { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.NoColorSpace; t.minFilter = THREE.LinearFilter; t.generateMipmaps = false; return t; });

    const mk = (frag, uniforms) => new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: frag, uniforms, depthTest: false, depthWrite: false });
    this.shotMat = mk(SHOT_FRAG, {
      tScene: { value: null }, tOverlay: { value: null }, exposure: { value: 1 }, saturation: { value: 1 }, contrast: { value: 1 },
      keepOrange: { value: 0 }, overlayAlpha: { value: 1 }, lift: { value: 0 }, tint: { value: new THREE.Color(1, 1, 1) },
    });
    this.mixMat = mk(MIX_FRAG, {
      tA: { value: null }, tB: { value: null }, p: { value: 0 }, time: { value: 0 }, seed: { value: 0 }, type: { value: 0 },
      dir: { value: new THREE.Vector2(1, 0) }, center: { value: new THREE.Vector2(0.5, 0.5) }, accent: { value: new THREE.Color(0xee6a1f) },
    });
    this.finalMat = mk(FINAL_FRAG, {
      tMix: { value: null }, time: { value: 0 }, frame: { value: 0 }, chroma: { value: 0.3 }, grain: { value: 0.05 }, vignette: { value: 0.6 },
      flash: { value: 0 }, fade: { value: 0 }, glitch: { value: 0 }, zoom: { value: 1 }, rgbShift: { value: 0 }, scan: { value: 0 },
      shake: { value: new THREE.Vector2() }, flashColor: { value: new THREE.Color(1, 0.98, 0.94) },
    });
    this.quad = new FullScreenQuad(this.shotMat);

    const pm = new THREE.PMREMGenerator(r);
    this.envMap = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    pm.dispose();

    this.shots = [];
    this.fx = [];
    // 没有三维内容的镜头也要真的 render 一次：多重采样的渲染目标只有在 render 时才会解析，
    // 否则读到的是上一个镜头留下的画面
    this.emptyScene = new THREE.Scene();
    this.emptyCam = new THREE.PerspectiveCamera();
  }

  setTimeline(shots, fx) {
    this.shots = shots;
    this.fx = fx || [];
    for (const s of shots) if (s.init && !s._inited) { s.init(this); s._inited = true; }
  }

  // 哪些镜头在画面里：返回 [a, b, p, trans]
  pick(t) {
    const S = this.shots;
    for (let i = 0; i < S.length; i++) {
      const s = S[i];
      const n = S[i + 1];
      // 和下一个镜头之间的转场
      if (n && s.out) {
        const d = s.out.dur || 0;
        const al = s.out.align ?? 0.5;
        const t0 = s.end - d * al, t1 = t0 + d;
        if (d > 0 && t >= t0 && t < t1) return [s, n, (t - t0) / d, s.out];
      }
      if (t >= s.start && t < s.end) return [s, null, 0, null];
    }
    return [S[S.length - 1], null, 0, null];
  }

  drawShot(outer, slot, t) {
    const r = this.renderer;
    const olt = t - outer.start;
    // 蒙太奇镜头可以“借”别的镜头某一刻的画面（delegate），再在上面加自己的字
    let shot = outer, lt = olt, d = null;
    if (outer.delegate) { d = outer.delegate(olt); shot = d.shot; lt = d.lt; }
    const ctx = this.ovCtx[slot];
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, this.w, this.h);
    ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0);
    // 每个镜头每帧的默认调色，镜头可在 frame() 里改
    shot.grade = Object.assign({ exposure: 1, saturation: 1, contrast: 1, keepOrange: 0, overlayAlpha: 1, lift: 0, tint: [1, 1, 1] }, shot.baseGrade || {});
    shot.bloomP = Object.assign({ strength: 0.6, radius: 0.45, threshold: 0.95 }, shot.baseBloom || {});
    shot.frame(this, lt, ctx, t);
    if (d) {
      if (d.clearOverlay) { ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.clearRect(0, 0, this.w, this.h); ctx.setTransform(this.scale, 0, 0, this.scale, 0, 0); }
      if (outer.overlay) outer.overlay(this, olt, ctx, shot);
    }
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    this.ovTex[slot].needsUpdate = true;

    // 三维
    const rt = this.rtScene[slot];
    r.setRenderTarget(rt);
    r.setClearColor(shot.clear ?? 0x0d0f13, 1);
    r.clear(true, true, false);
    if (shot.scene && shot.camera) {
      shot.camera.aspect = DW / DH;
      shot.camera.updateProjectionMatrix();
      r.render(shot.scene, shot.camera);
    } else {
      r.render(this.emptyScene, this.emptyCam);
    }
    if (shot.bloomP.strength > 0.001) {
      this.bloom.strength = shot.bloomP.strength;
      this.bloom.radius = shot.bloomP.radius;
      this.bloom.threshold = shot.bloomP.threshold;
      this.bloom.render(r, null, rt, 0, false);
    }
    // 合成：色调映射 + 调色 + 字幕层
    const g = shot.grade, u = this.shotMat.uniforms;
    u.tScene.value = rt.texture;
    u.tOverlay.value = this.ovTex[slot];
    u.exposure.value = g.exposure; u.saturation.value = g.saturation; u.contrast.value = g.contrast;
    u.keepOrange.value = g.keepOrange; u.overlayAlpha.value = g.overlayAlpha; u.lift.value = g.lift;
    u.tint.value.setRGB(g.tint[0], g.tint[1], g.tint[2]);
    this.quad.material = this.shotMat;
    r.setRenderTarget(this.rtShot[slot]);
    this.quad.render(r);
    return this.rtShot[slot];
  }

  // 整片的冲击、闪白、黑场等，按时间叠加
  fxAt(t) {
    const o = { shakeX: 0, shakeY: 0, zoom: 1, chroma: 0, flash: 0, fade: 0, glitch: 0, rgbShift: 0 };
    for (const f of this.fx) {
      const dt = t - f.t;
      if (f.kind === 'fade') { // 一段黑场：t..t+dur 由 from 到 to
        if (t >= f.t && t <= f.t + f.dur) o.fade = Math.max(o.fade, f.from + (f.to - f.from) * clamp(dt / f.dur));
        continue;
      }
      if (dt < 0 || dt > (f.dur || 1.2)) continue;
      const a = f.amp ?? 1;
      if (f.kind === 'hit') {
        const e = Math.exp(-dt * (f.decay || 9));
        const fr = 38;
        o.shakeX += Math.sin(dt * fr * 1.0 + f.t * 13) * 0.012 * a * e;
        o.shakeY += Math.cos(dt * fr * 1.3 + f.t * 7) * 0.008 * a * e;
        o.zoom *= 1 + 0.06 * a * Math.exp(-dt * 7);
        o.chroma += 2.2 * a * e;
      } else if (f.kind === 'flash') {
        o.flash = Math.max(o.flash, a * Math.exp(-dt * (f.decay || 10)));
      } else if (f.kind === 'glitch') {
        const k = dt < (f.dur || 0.3) ? 1 : 0;
        o.glitch = Math.max(o.glitch, a * k);
        o.rgbShift += 0.006 * a * k * Math.sin(dt * 90);
      } else if (f.kind === 'punch') {
        o.zoom *= 1 + 0.035 * a * Math.exp(-dt * 10);
        o.chroma += 0.8 * a * Math.exp(-dt * 10);
      } else if (f.kind === 'tremble') { // 持续低频抖动
        const k = Math.sin(Math.PI * clamp(dt / (f.dur || 1)));
        o.shakeX += Math.sin(dt * 47) * 0.004 * a * k;
        o.shakeY += Math.cos(dt * 53) * 0.004 * a * k;
      }
    }
    return o;
  }

  render(t, frame) {
    const r = this.renderer;
    const [a, b, p, tr] = this.pick(t);
    let src = this.drawShot(a, 0, t);
    if (b) {
      const bt = this.drawShot(b, 1, t);
      const u = this.mixMat.uniforms;
      u.tA.value = src.texture; u.tB.value = bt.texture; u.p.value = clamp(p);
      u.time.value = t; u.seed.value = tr.seed || 0;
      u.type.value = MIX_TYPES[tr.type] ?? 0;
      u.dir.value.set(...(tr.dir || [1, 0]));
      u.center.value.set(...(tr.center || [0.5, 0.5]));
      u.accent.value.set(tr.accent ?? 0xee6a1f);
      this.quad.material = this.mixMat;
      r.setRenderTarget(this.rtMix);
      this.quad.render(r);
      src = this.rtMix;
    }
    const fx = this.fxAt(t);
    const u = this.finalMat.uniforms;
    const look = Object.assign({ grain: 0.045, vignette: 0.55, chroma: 0.25, scan: 0 }, (b && p > 0.5 ? b : a).look || {});
    u.tMix.value = src.texture; u.time.value = t; u.frame.value = frame;
    u.chroma.value = look.chroma + fx.chroma; u.grain.value = look.grain; u.vignette.value = look.vignette; u.scan.value = look.scan;
    u.flash.value = fx.flash; u.fade.value = fx.fade; u.glitch.value = fx.glitch; u.zoom.value = fx.zoom; u.rgbShift.value = fx.rgbShift;
    u.shake.value.set(fx.shakeX, fx.shakeY);
    this.quad.material = this.finalMat;
    r.setRenderTarget(null);
    this.quad.render(r);
  }

  // 单独渲染一个不在时间线上的镜头（封面用）
  renderSingle(shot, t, frame = 0) {
    const src = this.drawShot(shot, 0, t);
    const u = this.finalMat.uniforms;
    const look = Object.assign({ grain: 0.03, vignette: 0.55, chroma: 0.2, scan: 0 }, shot.look || {});
    u.tMix.value = src.texture; u.time.value = t; u.frame.value = frame;
    u.chroma.value = look.chroma; u.grain.value = look.grain; u.vignette.value = look.vignette; u.scan.value = 0;
    u.flash.value = 0; u.fade.value = 0; u.glitch.value = 0; u.zoom.value = 1; u.rgbShift.value = 0; u.shake.value.set(0, 0);
    this.quad.material = this.finalMat;
    this.renderer.setRenderTarget(null);
    this.quad.render(this.renderer);
  }

  // 读出当前帧：RGB，从上到下
  grab() {
    const gl = this.renderer.getContext();
    const w = this.w, h = this.h;
    const px = new Uint8Array(w * h * 4);
    gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    const out = new Uint8Array(w * h * 3);
    for (let y = 0; y < h; y++) {
      const si = (h - 1 - y) * w * 4, di = y * w * 3;
      for (let x = 0, s = si, d = di; x < w; x++, s += 4, d += 3) { out[d] = px[s]; out[d + 1] = px[s + 1]; out[d + 2] = px[s + 2]; }
    }
    return out;
  }
}
