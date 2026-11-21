// 结尾：在"真实的月亮"上叠两段字——月亮在离开（尺子、指甲），收藏卡和站队；最后是片尾卡。
const END_FS = GLSL_HEAD + GLSL_COMMON + `
void main(){
  vec2 p = (gl_FragCoord.xy - .5*uRes)/uRes.y;
  vec3 col = mix(vec3(.010, .014, .028), vec3(.002, .003, .008), smoothstep(-.5, .5, p.y));
  col += spaceStars(normalize(vec3(p, 1.2)), 1./uRes.y)*.6;
  // 一道很淡的光环和一个小月亮，呼应开头
  vec2 q = p - vec2(.0, .08);
  float e = length(q*vec2(1., 3.6)) - .36;
  col += vec3(.95, .85, .70)*exp(-abs(e)/.004)*.25*smoothstep(-.3, .3, q.x + .1);
  float m = length(p - vec2(.16, .27)) - .028;
  col += vec3(1., .97, .92)*(1. - smoothstep(-.001, .001, m))*1.6 + vec3(.8, .85, 1.)*exp(-max(m, 0.)/.03)*.25;
  fragColor = vec4(col, 1.);
}
`;

SHOTS.endCard = {
  fs: END_FS,
  post: { exposure: 1.2, thr: 1.0, bloom1: .3, bloom2: .3, grain: .035, vig: .35 },
  overlay(t, lt) {
    const a = smooth(-.3, .3, lt);
    OV.text('如果月亮掉下来', 540, 820, { size: 76, weight: 600, spacing: 8, alpha: a, color: CREAM, shadow: 24 });
    OV.text('以后的月亮，只会越来越远', 540, 912, { size: 38, weight: 400, spacing: 4, alpha: a * .9, color: GOLD });
    OV.line(490, 980, 590, 980, { alpha: a * .5, width: 2 });
    OV.text('甜菜  出品', 540, 1078, { size: 50, weight: 600, spacing: 6, alpha: a, color: CREAM });
    OV.text('《如果……会怎样》系列 · 第一集', 540, 1150, { size: 30, weight: 400, spacing: 3, alpha: a * .8 });
    OV.text('画面、字幕、音效：Claude 用代码生成', 540, 1260, { size: 26, weight: 300, spacing: 2, alpha: a * .7 });
    OV.text('配音：CosyVoice 3 合成', 540, 1302, { size: 26, weight: 300, spacing: 2, alpha: a * .7 });
  },
};

// 真实的月亮在离开：尺子 + 指甲
SHOTS.twist.overlay = (t, lt) => {
  const a1 = smooth(S('w1') + .8, S('w1') + 1.2, t) * (1 - smooth(SE('twist') - .2, SE('twist') + .2, t));
  // 月亮旁边一根往外的虚线箭头
  if (a1 > 0) {
    const L = 120 * smooth(S('w1') + .8, S('w1') + 2.2, t);
    OV.line(600, 560, 600 + L * .55, 560 - L, { dash: [10, 10], width: 3, alpha: a1, color: [210, 225, 255] });
    OV.text('离开', 690, 470, { size: 34, weight: 600, alpha: a1 * smooth(S('w1') + 1.4, S('w1') + 1.8, t), color: [210, 225, 255], align: 'left' });
  }
  const a2 = smooth(S('w2') - .2, S('w2') + .2, t) * (1 - smooth(SE('twist') - .2, SE('twist') + .2, t));
  if (a2 > 0) {
    OV.source(['月亮每年远约 3.8 厘米：阿波罗激光测距（NASA）', '指甲每月约长 3.5 毫米：Yaemsiri 2010'], a2);
    // 尺子：0~5 厘米，金色的一段量到 3.8
    const x0 = 120, y0 = 1080, cm = 120;
    const k = smooth(S('w2') + .1, CH('w2', 1) - .1, t);
    OV.line(x0, y0, x0 + 5 * cm, y0, { width: 2, alpha: a2 });
    for (let i = 0; i <= 50; i++) {
      const h = i % 10 === 0 ? 26 : (i % 5 === 0 ? 18 : 10);
      OV.line(x0 + i * cm / 10, y0, x0 + i * cm / 10, y0 - h, { width: i % 10 === 0 ? 2 : 1, alpha: a2 * .9 });
    }
    for (let i = 0; i <= 5; i++) OV.text(String(i), x0 + i * cm, y0 + 40, { size: 26, weight: 400, alpha: a2 * .8 });
    OV.line(x0, y0 - 40, x0 + 3.8 * cm * k, y0 - 40, { width: 10, color: GOLD, alpha: a2 });
    OV.text(`月亮：每年 +${(3.8 * k).toFixed(1)} 厘米`, x0, y0 - 70, { size: 40, weight: 600, alpha: a2, color: GOLD, align: 'left' });
    // 指甲：一年约长 4 厘米（每月 3.5 毫米）
    const ka = smooth(CH('w2', 1) - .25, CH('w2', 1) + .2, t) * a2;
    const k2 = smooth(CH('w2', 1), CH('w2', 1) + .9, t);
    OV.line(x0, y0 + 90, x0 + 4.2 * cm * k2, y0 + 90, { width: 10, color: [230, 230, 236], alpha: ka });
    OV.text('指甲：一年约长 4 厘米', x0, y0 + 150, { size: 36, weight: 500, alpha: ka, align: 'left' });
  }
};

// 收藏卡 + 站队：叠在真实的月亮上
SHOTS.twist.overlayCard = (t) => {
  const c0 = SS('card') - .25;
  const a = smooth(c0, c0 + .35, t) * (1 - smooth(SS('end') - .35, SS('end'), t));
  if (a <= 0) return;
  const ctx = OV.ctx;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(8,12,24,0.88)';
  ctx.strokeStyle = 'rgba(255,212,150,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(80, 300, 780, 690, 28);
  ctx.fill(); ctx.stroke();
  ctx.restore();
  OV.text('★ 如果月亮掉下来 ★', 470, 392, { size: 48, weight: 700, alpha: a, color: GOLD, spacing: 4 });
  const rows = ['① 先变的是潮水：近一半，拉力 8 倍', '② 约 1.8 万公里处，它会被扯碎', '　 碎块铺成一圈光环', '③ 真实的月亮：每年远 3.8 厘米'];
  rows.forEach((r, i) => OV.text(r, 120, 488 + i * 74, { size: 38, weight: 500, alpha: a * smooth(c0 + .1 + i * .12, c0 + .4 + i * .12, t), align: 'left', spacing: 1 }));
  OV.line(120, 800, 820, 800, { alpha: a * .35, width: 1.5 });
  OV.text('今晚出门，抬头看看它', 470, 890, { size: 44, weight: 600, alpha: a, color: CREAM, spacing: 3 });
  // 站队：月亮 or 光环
  const b = smooth(S('z2') - .25, S('z2') + .1, t) * a;
  if (b > 0) {
    const ctx2 = OV.ctx;
    for (const [x, label, ring] of [[270, '月亮', false], [670, '光环', true]]) {
      ctx2.save();
      ctx2.globalAlpha = b;
      ctx2.fillStyle = 'rgba(255,255,255,0.10)';
      ctx2.strokeStyle = 'rgba(255,255,255,0.65)';
      ctx2.lineWidth = 2;
      ctx2.beginPath(); ctx2.roundRect(x - 170, 1080, 340, 120, 60); ctx2.fill(); ctx2.stroke();
      ctx2.restore();
      if (ring) OV.circle(x - 70, 1140, 30, { ry: 11, rot: -.3, width: 4, alpha: b, color: GOLD });
      else { const c = OV.ctx; c.save(); c.globalAlpha = b; c.fillStyle = 'rgb(247,239,230)'; c.beginPath(); c.arc(x - 70, 1140, 24, 0, Math.PI * 2); c.fill(); c.restore(); }
      OV.text(label, x + 25, 1158, { size: 48, weight: 600, alpha: b, color: CREAM });
    }
    OV.text('VS', 470, 1158, { size: 40, weight: 600, font: LATIN, alpha: b * .8, spacing: 2 });
  }
};

{
  const ov = SHOTS.twist.overlay;
  SHOTS.twist.overlay = (t, lt) => { ov(t, lt); SHOTS.twist.overlayCard(t); };
}
