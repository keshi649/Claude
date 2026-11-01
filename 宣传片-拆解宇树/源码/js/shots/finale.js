// 高潮和收尾（62–76）：前面画面四分之一拍一切 → 零件飞回去装成一颗关节 → 书转进来
import * as THREE from 'three';
import { makeMats } from '../models/materials.js';
import { buildActuator } from '../models/actuator.js';
import { withEnv, studioLights, Particles, glow, beam } from '../core/fx3d.js';
import { kinetic, text, tag, F, font } from '../core/text.js';
import { grid } from '../core/hud.js';
import { clamp, ease, lerp, COL, window01, TAU, rng } from '../core/util.js';
import { shot, cam, toScreen } from './common.js';
import { PARTS } from './cards.js';

export async function finale(E, byId) {
  const out = [];
  // ---------- S27 蒙太奇：12 刀，每刀 0.25 秒 ----------
  const CUTS = [
    ['S01', 2.4, true], ['S03', 0.75, true], ['S10', 2.8, true], ['S11', 2.2, false],
    ['S12', 2.3, true], ['S14', 1.2, false], ['S15', 4.0, true], ['S16', 2.0, true],
    ['S17', 1.7, true], ['S19', 2.0, true], ['S22', 2.6, false], ['S26', 2.8, false],
  ];
  const WORDS = PARTS.map((p) => p[1].replace('看懂这门生意', '看懂生意'));
  out.push(shot({
    id: 'S27', start: 62, end: 65,
    look: { grain: 0.06, vignette: 0.6, chroma: 0.5 },
    delegate(lt) {
      const i = clamp(Math.floor(lt / 0.25), 0, CUTS.length - 1);
      const [id, at, clear] = CUTS[i];
      return { shot: byId[id], lt: at + (lt - i * 0.25) * 0.8, clearOverlay: clear };
    },
    overlay(E, lt, ctx, src) {
      // 压暗一点，让大字跳出来
      src.grade.contrast = (src.grade.contrast || 1) * 1.12;
      ctx.fillStyle = 'rgba(8,9,12,0.35)'; ctx.fillRect(0, 0, 1080, 1920);
      const w = clamp(Math.floor(lt / 0.5), 0, 5);
      const wl = lt - w * 0.5;
      kinetic(ctx, WORDS[w], 540, 960, wl, { size: WORDS[w].length > 3 ? 190 : 240, family: F.title, weight: 400, mode: 'slam', dur: 0.12, stroke: 16, strokeColor: '#0D0F13', color: '#FFFFFF' });
      font(ctx, 44, F.num, 400); ctx.fillStyle = COL.orange; ctx.textAlign = 'center';
      ctx.fillText(`PART ${String(w + 1).padStart(2, '0')}`, 540, 780);
      for (let j = 0; j < 6; j++) {
        ctx.fillStyle = j <= w ? COL.orange : 'rgba(243,240,233,0.25)';
        ctx.fillRect(540 - 3 * 136 + j * 136 + 8, 1180, 120, 10);
      }
    },
  }));

  // ---------- S27b 零件飞回去，装成一颗关节 ----------
  {
    const M = makeMats();
    const scene = withEnv(E, new THREE.Scene(), 0.8);
    studioLights(scene, { keyI: 1.6, rimI: 4, coolI: 2.0 });
    scene.environmentIntensity = 0.45;
    const A = buildActuator(M);
    const pivot = new THREE.Group(); pivot.add(A.root); scene.add(pivot);
    const sparks = new Particles(300, { intensity: 3 }); sparks.mat.uniforms.scale.value = 2500 * E.scale; scene.add(sparks.points);
    const SR = rng(8);
    const sp = Array.from({ length: 300 }, () => ({ a: SR() * TAU, b: SR() * TAU, v: 1 + SR() * 3, k: Math.floor(SR() * 6), s: 0.015 + SR() * 0.03 }));
    const camera = cam(32);
    const exploded = [0, 0.75, 1.45, 2.2, 2.9, 3.55];
    const assembled = [0, 0, 0, 0.27, -0.23, 0.36];
    const snapAt = (i) => 0.125 + (5 - i) * 0.125; // 从最外面的法兰开始，十六分音符一个
    out.push(shot({
      id: 'S27B', start: 65, end: 66.5, scene, camera, clear: 0x0b0d11,
      look: { grain: 0.05, vignette: 0.7, chroma: 0.4 },
      baseBloom: { strength: 0.5, radius: 0.5, threshold: 1.2 },
      frame(E, lt, ctx) {
        A.parts.forEach((p, i) => {
          const k = ease.inExpo(clamp((lt - snapAt(i) + 0.12) / 0.12));
          p.position.x = lerp(exploded[i] * 1.1, assembled[i], k);
          p.rotation.x = (1 - k) * 0.6;
        });
        A.spin(lt * 6);
        pivot.position.set(-1.0 + 0.9 * ease.outCubic(clamp(lt / 0.9)), 0, 0);
        pivot.rotation.set(0.3, -0.7 + lt * 0.6, 0.35);
        const pk = ease.inOutCubic(clamp((lt - 0.9) / 0.6));
        camera.position.set(0.3, 0.5, lerp(7.2, 4.4, pk)); camera.lookAt(0.2, -0.1, 0); camera.updateMatrixWorld();
        for (let i = 0; i < sp.length; i++) {
          const s = sp[i], a = lt - snapAt(s.k);
          if (a < 0 || a > 0.5) { sparks.set(i, 0, -9, 0, 0, 0); continue; }
          const c = new THREE.Vector3(assembled[s.k], 0, 0); A.parts[s.k].parent.localToWorld(c);
          const r = s.v * a;
          sparks.set(i, c.x + Math.cos(s.a) * Math.sin(s.b) * r, c.y + Math.cos(s.b) * r, c.z + Math.sin(s.a) * Math.sin(s.b) * r, s.s, (1 - a / 0.5), 1, 0.7, 0.35);
        }
        sparks.commit();
        kinetic(ctx, '一次纸上拆机', 540, 1520, lt - 1.0, { size: 120, family: F.title, weight: 400, mode: 'slam', dur: 0.18, color: COL.bone, glow: 20, glowColor: 'rgba(0,0,0,0.6)' });
      },
    }));
  }

  // ---------- S28 书转进来 ----------
  {
    const loader = new THREE.TextureLoader();
    const tex = async (f) => { const t = await loader.loadAsync(`./assets/${f}`); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; return t; };
    const [front, back, spine, pages] = await Promise.all([tex('front.jpg'), tex('back.jpg'), tex('spine.jpg'), tex('pages.png')]);
    pages.wrapS = pages.wrapT = THREE.RepeatWrapping;
    const scene = withEnv(E, new THREE.Scene(), 0.32);
    const L = studioLights(scene, { keyI: 1.5, rimI: 4.5, coolI: 2.2, amb: 0.25 });
    const cover = (map) => new THREE.MeshPhysicalMaterial({ map, roughness: 0.42, metalness: 0, clearcoat: 0.7, clearcoatRoughness: 0.12 });
    const pageMat = new THREE.MeshStandardMaterial({ map: pages, roughness: 0.9 });
    // 尺寸按书：170×240 mm，书脊 9.5 mm（1 个单位 = 100 mm）
    const book = new THREE.Mesh(new THREE.BoxGeometry(1.7, 2.4, 0.095), [pageMat, cover(spine), pageMat, pageMat, cover(front), cover(back)]);
    const bookG = new THREE.Group(); bookG.add(book); scene.add(bookG);
    const halo = glow(0xff8a3d, 3.6, 0.3); halo.position.set(0, 0.5, -1.8); scene.add(halo);
    // 光束只照到书后面，别把镜头罩进去
    const bm1 = beam(0xffd2a8, { len: 6.2, radius: 1.1, intensity: 0.09 }), bm2 = beam(0xffd2a8, { len: 6.2, radius: 1.1, intensity: 0.09 });
    scene.add(bm1, bm2);
    const P = new Particles(400, { intensity: 1.8 }); P.mat.uniforms.scale.value = 2500 * E.scale; scene.add(P.points);
    const PR = rng(66);
    const pd = Array.from({ length: 400 }, () => ({ a: PR() * TAU, r: 1.5 + PR() * 3.5, y: (PR() - 0.5) * 5, z: -PR() * 3, s: 0.012 + PR() * 0.03, w: PR() }));
    const camera = cam(30);
    const corners = [[-0.85, 1.2], [0.85, 1.2], [0.85, -1.2], [-0.85, -1.2]];
    out.push(shot({
      id: 'S28', start: 66.5, end: 76.5, scene, camera, clear: 0x0b0d11,
      look: { grain: 0.045, vignette: 0.7, chroma: 0.25 },
      baseBloom: { strength: 0.45, radius: 0.6, threshold: 1.25 },
      frame(E, lt, ctx) {
        const k = ease.outCubic(clamp(lt / 2.0));
        bookG.rotation.set(0.06 - 0.04 * k, lerp(-1.25, -0.2, k) + Math.sin(lt * 0.6) * 0.04, lerp(-0.18, 0.02, k));
        bookG.position.set(0, lerp(-0.4, 0.62, k) + Math.sin(lt * 1.1) * 0.02, lerp(-1.0, 0, k));
        camera.position.set(0.15, 0.4, 10.2 - lt * 0.08); camera.lookAt(0, -0.35, 0); camera.updateMatrixWorld();
        L.key.intensity = 1.5 * clamp(lt / 0.8);
        halo.material.opacity = clamp((lt - 0.5) / 1.5);
        bm1.aim(new THREE.Vector3(-2.4, 6, -3.2), new THREE.Vector3(-0.3, 0.2, -1.2)); bm2.aim(new THREE.Vector3(2.4, 6, -3.2), new THREE.Vector3(0.3, 0.2, -1.2));
        bm1.material.uniforms.time.value = bm2.material.uniforms.time.value = lt;
        for (let i = 0; i < pd.length; i++) {
          const d = pd[i];
          const a = d.a + lt * (0.15 + 0.2 * d.w);
          const rr = d.r * lerp(1.6, 1, ease.outCubic(clamp(lt / 2.5)));
          P.set(i, Math.cos(a) * rr, d.y + Math.sin(lt * 0.5 + d.w * 6) * 0.2, d.z + Math.sin(a) * rr * 0.4 - 1, d.s, 0.35 + 0.4 * d.w, 1, 0.75, 0.5);
        }
        P.commit();
        // 封面上扫过一道光（把封面四个角投到屏幕上，裁出这个四边形）
        bookG.updateMatrixWorld(true);
        const q = corners.map(([x, y]) => toScreen(new THREE.Vector3(x, y, 0.048).applyMatrix4(book.matrixWorld), camera));
        const sweep = (t0) => {
          const s = clamp((lt - t0) / 0.9);
          if (s <= 0 || s >= 1) return;
          ctx.save();
          ctx.beginPath(); q.forEach((p, i) => (i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y))); ctx.closePath(); ctx.clip();
          const x = lerp(q[0].x - 500, q[1].x + 500, ease.inOutQuad(s));
          const g = ctx.createLinearGradient(x - 160, 0, x + 160, 0);
          g.addColorStop(0, 'rgba(255,255,255,0)'); g.addColorStop(0.5, 'rgba(255,250,240,0.55)'); g.addColorStop(1, 'rgba(255,255,255,0)');
          ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g;
          ctx.translate(x, 960); ctx.transform(1, 0, -0.45, 1, 0, 0); ctx.translate(-x, -960);
          ctx.fillRect(x - 200, 0, 400, 1920);
          ctx.restore();
        };
        sweep(1.5); sweep(5.6);
        kinetic(ctx, '从一颗电机到会翻跟头的机器人', 540, 1150, lt - 2.0, { size: 48, weight: 700, mode: 'decode', stagger: 0.03, spacing: 2 });
        kinetic(ctx, '甜菜 著', 540, 1240, lt - 2.6, { size: 54, weight: 900, mode: 'pop', stagger: 0.06, color: COL.orange });
        const st = clamp((lt - 3.3) / 0.3);
        if (st > 0) {
          font(ctx, 60, F.num, 400); ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = COL.bone; ctx.globalAlpha = st;
          ctx.fillText('6 部 · 19 章 · 20 幅插图', 540, 1345);
          ctx.globalAlpha = 1;
        }
        text(ctx, '每个数字都有出处', 540, 1425, { size: 42, weight: 700, color: COL.steel, alpha: clamp((lt - 3.9) / 0.3) });
        kinetic(ctx, '看懂具身智能，也看清这一行的门在哪', 540, 1505, lt - 4.7, { size: 42, weight: 700, mode: 'pop', stagger: 0.025, color: COL.bone });
        kinetic(ctx, '答案，都在书里。', 540, 1625, lt - 6.0, { size: 88, family: F.title, weight: 400, mode: 'drop', stagger: 0.06, color: COL.orange, glow: 18, glowColor: 'rgba(238,106,31,0.45)' });
      },
    }));
  }
  return out;
}
