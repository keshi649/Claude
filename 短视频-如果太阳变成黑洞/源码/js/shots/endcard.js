// 结尾：真实的太阳上叠"太轻了"的对比条；日出上叠收藏卡；最后是片尾卡。
const END_FS = GLSL_HEAD + GLSL_COMMON + `
void main(){
  vec2 p = (gl_FragCoord.xy - .5*uRes)/uRes.y;
  vec3 col = mix(vec3(.010, .012, .024), vec3(.002, .003, .008), smoothstep(-.5, .5, p.y));
  col += spaceStars(normalize(vec3(p, 1.2)), 1./uRes.y)*.55;
  // 底下一点日出的暖光，上面一个小小的黑洞（一圈细光）呼应开头
  col += vec3(1., .55, .22)*exp(-pow((p.y + .62)/.16, 2.))*.22*(1. - smoothstep(.0, .5, abs(p.x)));
  float r = length(p - vec2(0., .30));
  col *= smoothstep(.026, .029, r);
  col += vec3(1., .88, .70)*exp(-pow((r - .033)/.0025, 2.))*.55;
  fragColor = vec4(col, 1.);
}
`;

SHOTS.endCard = {
  fs: END_FS,
  post: { exposure: 1.2, thr: 1.0, bloom1: .3, bloom2: .3, grain: .035, vig: .35 },
  overlay(t, lt) {
    const a = smooth(-.3, .3, lt);
    OV.text('如果太阳变成黑洞', 540, 820, { size: 76, weight: 600, spacing: 8, alpha: a, color: CREAM, shadow: 24 });
    OV.text('你晒到的阳光，都是 8 分 20 秒前出发的', 540, 912, { size: 36, weight: 400, spacing: 3, alpha: a * .9, color: GOLD });
    OV.line(490, 980, 590, 980, { alpha: a * .5, width: 2 });
    OV.text('甜菜  出品', 540, 1078, { size: 50, weight: 600, spacing: 6, alpha: a, color: CREAM });
    OV.text('《如果……会怎样》系列 · 第二集', 540, 1150, { size: 30, weight: 400, spacing: 3, alpha: a * .8 });
    OV.text('画面、字幕、音效：Claude 用代码生成', 540, 1260, { size: 26, weight: 300, spacing: 2, alpha: a * .7 });
    OV.text('配音：CosyVoice 3 合成', 540, 1302, { size: 26, weight: 300, spacing: 2, alpha: a * .7 });
  },
};

// 真实的太阳："太轻了"——两根质量条
SHOTS.realSun.overlay = (t, lt) => {
  const a = smooth(.3, .8, lt) * (1 - smooth(SE('twist') - .35, SE('twist'), t));
  if (a <= 0) return;
  OV.source(['NASA：恒星至少要比太阳重约 20 倍，才会变成黑洞', '太阳的结局：约 50 亿年后变成一颗白矮星'], a);
  const k = smooth(CH('w1', 1), CH('w1', 1) + .9, t);
  const k2 = smooth(CH('w1', 1) + .4, CH('w1', 2) + .6, t);
  OV.bar(150, 1150, 780, k * .05, '太阳', '1 倍', { alpha: a });
  OV.bar(150, 1272, 780, k2, '能变成黑洞的恒星', '约 20 倍以上', { alpha: a * smooth(CH('w1', 1) + .3, CH('w1', 1) + .6, t), color: [200, 215, 255] });
};

// 收藏卡：叠在日出上
SHOTS.sunrise.overlay = (t) => {
  const c0 = SS('card') - .25;
  const a = smooth(c0, c0 + .35, t) * (1 - smooth(SS('end') - .35, SS('end'), t));
  if (a <= 0) return;
  const ctx = OV.ctx;
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = 'rgba(8,12,24,0.86)';
  ctx.strokeStyle = 'rgba(255,212,150,0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(80, 300, 780, 700, 28);
  ctx.fill(); ctx.stroke();
  ctx.restore();
  OV.text('★ 如果太阳变成黑洞 ★', 470, 392, { size: 48, weight: 700, alpha: a, color: GOLD, spacing: 4 });
  const rows = ['① 地球照样绕着它转', '② 8 分 20 秒后，天才黑', '③ 一周 −18°C，一年 −73°C', '④ 深海热泉边，生命还在'];
  rows.forEach((r, i) => OV.text(r, 128, 488 + i * 74, { size: 40, weight: 500, alpha: a * smooth(c0 + .1 + i * .12, c0 + .4 + i * .12, t), align: 'left', spacing: 1 }));
  OV.line(120, 800, 820, 800, { alpha: a * .35, width: 1.5 });
  OV.text('你晒到的阳光，', 470, 870, { size: 40, weight: 600, alpha: a, color: CREAM, spacing: 3 });
  OV.text('都是 8 分 20 秒前出发的', 470, 930, { size: 40, weight: 600, alpha: a, color: CREAM, spacing: 3 });
  // 评论区的问题
  const b = smooth(CH('z1', 1) - .25, CH('z1', 1) + .1, t) * a;
  if (b > 0) {
    ctx.save();
    ctx.globalAlpha = b;
    ctx.fillStyle = 'rgba(8,12,24,0.86)';                         // 和卡片一样的深底，日出的亮光上也看得清
    ctx.strokeStyle = 'rgba(255,212,150,0.8)';
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.roundRect(150, 1060, 640, 120, 60); ctx.fill(); ctx.stroke();
    ctx.restore();
    OV.text('你想去哪儿？评论区见', 470, 1138, { size: 46, weight: 600, alpha: b, color: GOLD, spacing: 3 });
  }
};
