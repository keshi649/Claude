/* 《大模型养成计划》总装：HUD 状态、幕间像素块转场、镜头推拉、逐帧入口 frame(t)。 */


/* ---------- HUD 状态随时间变化 ---------- */
function fmtBig(n) { return Math.round(n).toLocaleString('en-US'); }
function hudState(t) {
  const sc = TL.scenes.find(s => t >= s.t0 && t < s.t1) || TL.scenes[TL.scenes.length - 1];
  const on = ['birth', 'pretrain', 'base', 'token', 'sft', 'rlhf', 'halluc', 'fix'];
  HUD.show = on.includes(sc.name) ? 1 : 0;
  if (sc.name === 'birth') HUD.show = seg(t, CUE.hatch + 1.2, CUE.hatch + 1.6);
  HUD.debug = sc.name === 'halluc';
  HUD.title = HUD.debug ? '脑内视图 · 小模' : '大模型养成计划';
  // 天数：预训练那几十天快进
  let day = 0;
  if (t >= SCN.pretrain.t0) day = 1;
  if (t >= T('p11')) day = Math.round(lerp(1, 60, E.inOut(seg(t, T('p11') + 0.3, TE('p11')))));
  if (t >= SCN.sft.t0) day = 61;
  if (t >= SCN.rlhf.t0) day = 75;
  if (t >= SCN.fix.t0) day = 99;
  HUD.day = `DAY ${day}`;
  const ff = t >= T('p11') && t < TE('p11') + 0.2;
  const mins = ff ? Math.floor(t * 1400) % 1440 : (Math.floor(t * 4) + 9 * 60) % 1440;
  HUD.clock = `${String(Math.floor(mins / 60)).padStart(2, '0')}:${String(mins % 60).padStart(2, '0')}`;
  // 读过的 token：预训练期间从 0 涨到 14.8 万亿
  const read = 14.8e12 * E.inOut(seg(t, T('p8'), TE('p11')));
  HUD.token = read < 1e8 ? fmtBig(read) : read < 1e12 ? `${(read / 1e8).toFixed(0)} 亿` : `${(read / 1e12).toFixed(1)} 万亿`;
  if (HUD.debug) HUD.token = '14.8 万亿';
}

/* ---------- 画一幕：低清像素层放大 + 高清层；cam 可推拉 ---------- */
const FRAME_A = document.createElement('canvas'); FRAME_A.width = W; FRAME_A.height = H;
const FA = FRAME_A.getContext('2d'); FA.imageSmoothingEnabled = false;
function drawScene(name, t, target) {
  const sc = SCN[name], def = SCENES[name];
  if (!def) return;
  const lt = t - sc.t0;
  p = LC; p.setTransform(1, 0, 0, 1, 0, 0); p.globalAlpha = 1;
  p.clearRect(0, 0, LW, LH);
  def.lo(t, lt);
  const cam = def.cam ? def.cam(t, lt) : null;
  g = target; g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = 1;
  g.imageSmoothingEnabled = false;
  g.save();
  if (cam) { g.translate(W / 2, H / 2); g.scale(cam.z, cam.z); g.translate(-cam.x * S, -cam.y * S); }
  g.drawImage(LO, 0, 0, W, H);
  if (def.hi) def.hi(t, lt);
  g.restore();
}

/* ---------- 像素块转场：旧幕被方块盖住，新幕从方块里露出来 ---------- */
const XF = 0.28, BLK = 72;
function blockMask(u, seed) {   // u: 0 无遮挡 → 1 全遮挡
  if (u <= 0) return;
  g.fillStyle = PAL.ink;
  const cols = Math.ceil(W / BLK), rows = Math.ceil(H / BLK);
  for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
    const d = (i + j) / (cols + rows) * 0.6 + hash(i * 31 + j * 7 + seed) * 0.4;
    const k = clamp((u - d * 0.7) / 0.3);
    if (k <= 0) continue;
    const s = Math.ceil(BLK * k / 8) * 8;
    g.fillRect(i * BLK + (BLK - s) / 2, j * BLK + (BLK - s) / 2, s, s);
  }
}

window.frame = function (t) {
  hudState(t);
  const sc = TL.scenes;
  let i = sc.findIndex(s => t >= s.t0 && t < s.t1);
  if (i < 0) i = t < 0 ? 0 : sc.length - 1;
  const cur = sc[i];
  drawScene(cur.name, t, MAIN);
  g = MAIN; g.setTransform(1, 0, 0, 1, 0, 0);
  drawHUD(t);
  // 转场：幕尾盖上、幕首揭开
  if (i < sc.length - 1 && t > cur.t1 - XF && cur.name !== 'hook') blockMask(seg(t, cur.t1 - XF, cur.t1), i);
  if (i > 0 && t < cur.t0 + XF && cur.name !== 'title') blockMask(1 - seg(t, cur.t0, cur.t0 + XF), i + 0.5);
  window.drawSubs(t);
  scanlines(0.05);
  watermark(t, seg(t, 1, 2) * (1 - seg(t, TL.duration - 1.6, TL.duration - 0.4)));
  // 片尾淡出
  const fout = seg(t, TL.duration - 1.0, TL.duration - 0.05);
  if (fout > 0) { g.fillStyle = `rgba(0,0,0,${fout})`; g.fillRect(0, 0, W, H); }
};
window.drawSubs = drawSubs;

Promise.all(['Pix', 'NBlack', 'NBold'].map(f => document.fonts.load(`40px ${f}`, '大模型养成计划ABC123'))).then(() => {
  window.frame(0); window.READY = true;
});
