'use strict';
/* data.js：地图、英雄、技能、装备和各种数值。纯数据和几何函数，浏览器和 node 测试共用。
   坐标：x 向右，y 向下，地图 5000×5000。蓝方基地在左下角，红方在右上角。
   对称：mir() 沿河道（y = x）翻过去，蓝方的东西变成红方的；swapLane() 沿中路对角线翻，上路变下路。 */

const L = 5000;              // 地图边长
const PXU = 2.5;             // 画面上一个像素 = 2.5 单位
const CELL = 25;             // 碰撞格边长
const GN = L / CELL;         // 每边 200 格
const INFL = 20;             // 墙往外扩多少（单位的半径），格子中心在扩过的墙里就不能走

const mir = p => [p[1], p[0]];
const swapLane = p => [L - p[1], L - p[0]];

/* ---------- 兵线 ---------- */
const LANE_TOP = [[430, 4120], [350, 3700], [350, 820], [480, 480], [820, 350], [3700, 350], [4120, 430]];
const LANE_MID = [[860, 4140], [4140, 860]];
const LANE_BOT = LANE_TOP.map(swapLane);
const LANES = [LANE_TOP, LANE_MID, LANE_BOT];         // 0 对抗路（上） 1 中路 2 发育路（下）
const LANE_NAME = ['对抗路', '中路', '发育路'];

/* ---------- 建筑（蓝方坐标，红方用 mir） ---------- */
const SPRING = [170, 4830], SPRING_R = 300;
const CRYSTAL = [620, 4380];
// TOWERS[lane][tier]：tier 0 一塔（外塔）、1 二塔、2 高地塔。塔立在兵线旁边（不挡路）：边路的塔靠地图边，中路的塔偏左上
const TOWERS = [
  [[250, 2050], [250, 2900], [250, 3700]],
  [[1934, 2924], [1559, 3299], [1179, 3679]],
  [[250, 2050], [250, 2900], [250, 3700]].map(swapLane),
];

/* ---------- 地形：墙和草丛（蓝方上半区写一份，其他三块翻出来） ---------- */
// c：圆 [x, y, r]；k：胶囊（粗线段）[x1, y1, x2, y2, r]
const Q_WALLS = [
  // 上路边的墙（中间留出进野区的口子）
  { k: [640, 1260, 640, 1850, 85] },
  { k: [640, 2330, 640, 2800, 85] },
  // 中路边的墙
  { k: [1170, 3460, 1540, 3090, 85] },
  { k: [1930, 2700, 2190, 2440, 85] },
  // 河道边的墙
  { k: [880, 1290, 1250, 1660, 85] },
  { k: [1660, 2070, 1930, 2340, 85] },
  // 野区里面
  { c: [1380, 2560, 150] },
  { c: [1180, 2030, 120] },
  { k: [1080, 3020, 1330, 2900, 95] },
  { c: [880, 2680, 95] },
  { c: [1760, 2430, 70] },
];
const Q_BUSH = [
  { k: [430, 1420, 430, 1700, 70] },        // 上路草丛
  { k: [1640, 2930, 1790, 2780, 65] },      // 中路进野区的口子
  { c: [1300, 2300, 80] },                  // 蓝区旁边
  { c: [1320, 1520, 85] },                  // 河道草丛（大龙坑旁）
  { c: [780, 2950, 70] },                   // 狼窝旁
];
const BASE_WALLS = [
  { k: [600, 3480, 1060, 3560, 95] },       // 基地上边那道墙（对抗路出口和中路出口之间）
];
function mapShapes(list) {
  const out = [];
  const add = (s, f) => {
    if (s.c) { const p = f([s.c[0], s.c[1]]); out.push({ c: [p[0], p[1], s.c[2]] }); }
    else { const a = f([s.k[0], s.k[1]]), b = f([s.k[2], s.k[3]]); out.push({ k: [a[0], a[1], b[0], b[1], s.k[4]] }); }
  };
  for (const s of list) {
    add(s, p => p); add(s, swapLane); add(s, mir); add(s, p => mir(swapLane(p)));
  }
  return out;
}
const WALLS = (() => {
  const w = mapShapes(Q_WALLS);
  for (const s of BASE_WALLS) {               // 基地墙：蓝方上下两道 + 红方两道
    const k = s.k;
    for (const f of [p => p, swapLane, mir, p => mir(swapLane(p))]) {
      const a = f([k[0], k[1]]), b = f([k[2], k[3]]);
      w.push({ k: [a[0], a[1], b[0], b[1], k[4]] });
    }
  }
  return w;
})();
const BUSHES = mapShapes(Q_BUSH);
const BORDER = 150;                            // 地图四周一圈是墙

function segDist(px, py, ax, ay, bx, by) {
  const dx = bx - ax, dy = by - ay, l2 = dx * dx + dy * dy;
  let t = l2 ? ((px - ax) * dx + (py - ay) * dy) / l2 : 0;
  t = t < 0 ? 0 : t > 1 ? 1 : t;
  const qx = ax + t * dx - px, qy = ay + t * dy - py;
  return Math.sqrt(qx * qx + qy * qy);
}
function shapeDist(s, x, y) {               // 到形状边缘的距离（里面是负数）
  if (s.c) return Math.hypot(x - s.c[0], y - s.c[1]) - s.c[2];
  return segDist(x, y, s.k[0], s.k[1], s.k[2], s.k[3]) - s.k[4];
}
function wallDist(x, y) {
  let d = Math.min(x - BORDER, y - BORDER, L - BORDER - x, L - BORDER - y);
  for (const s of WALLS) { const v = shapeDist(s, x, y); if (v < d) d = v; }
  return d;
}
function bushAt(x, y) {                       // 在第几个草丛里（从 1 起），不在就是 0
  for (let i = 0; i < BUSHES.length; i++) if (shapeDist(BUSHES[i], x, y) < 0) return i + 1;
  return 0;
}

/* ---------- 野怪 ---------- */
// 蓝方半边的营地，红方用 mir
const CAMPS_BLUE = [
  { type: 'blue', p: [1050, 2470] },          // 蓝 buff
  { type: 'wolf', p: [870, 3120] },
  { type: 'bird', p: [1700, 2760] },
  { type: 'golem', p: [960, 1680] },
  { type: 'red', p: swapLane([1050, 2470]) }, // 红 buff 在发育路那边
  { type: 'wolf', p: swapLane([870, 3120]) },
  { type: 'bird', p: swapLane([1700, 2760]) },
  { type: 'golem', p: swapLane([960, 1680]) },
];
const DRAGONS = [
  { type: 'lord', p: [1250, 1250] },          // 大龙（对抗路那边的河道）
  { type: 'drake', p: [3750, 3750] },         // 小龙（发育路那边的河道）
];
const MONSTER = {
  blue:  { name: '蓝晶石像', hp: 1900, ad: 40, arm: 35, mr: 35, r: 46, range: 140, as: 0.8, gold: 110, xp: 160, respawn: 90, first: 30, buff: 'blue' },
  red:   { name: '火焰蜥蜴', hp: 1900, ad: 44, arm: 35, mr: 35, r: 46, range: 140, as: 0.8, gold: 110, xp: 160, respawn: 90, first: 30, buff: 'red' },
  wolf:  { name: '灰狼', hp: 1100, ad: 27, arm: 20, mr: 20, r: 34, range: 120, as: 1.0, gold: 80, xp: 100, respawn: 70, first: 30 },
  bird:  { name: '咕咕鸟', hp: 950, ad: 30, arm: 15, mr: 25, r: 32, range: 120, as: 1.0, gold: 75, xp: 95, respawn: 70, first: 30 },
  golem: { name: '石头怪', hp: 1250, ad: 32, arm: 35, mr: 15, r: 38, range: 120, as: 0.8, gold: 85, xp: 105, respawn: 70, first: 30 },
  drake: { name: '小龙', hp: 6500, ad: 120, arm: 60, mr: 60, r: 70, range: 220, as: 0.7, gold: 0, xp: 0, respawn: 180, first: 120, teamGold: 160, teamXp: 220 },
  lord:  { name: '大龙', hp: 11000, ad: 170, arm: 90, mr: 90, r: 84, range: 240, as: 0.6, gold: 0, xp: 0, respawn: 180, first: 360, teamGold: 120, teamXp: 300 },
};

/* ---------- 小兵和建筑的数值 ---------- */
const MINION = {
  melee:    { hp: 470, ad: 24, arm: 15, mr: 10, r: 19, range: 70,  as: 1.0, ms: 190, gold: 34, xp: 46, proj: null },
  ranged:   { hp: 330, ad: 32, arm: 5,  mr: 5,  r: 17, range: 380, as: 0.8, ms: 190, gold: 27, xp: 34, proj: 'bolt' },
  siege:    { hp: 950, ad: 55, arm: 40, mr: 30, r: 26, range: 480, as: 0.5, ms: 190, gold: 66, xp: 70, proj: 'shell', vsTower: 1.8 },
  super:    { hp: 1600, ad: 80, arm: 50, mr: 40, r: 28, range: 80, as: 0.9, ms: 190, gold: 40, xp: 60, proj: null, vsTower: 1.5 },
  vanguard: { hp: 4200, ad: 130, arm: 80, mr: 80, r: 40, range: 110, as: 0.8, ms: 180, gold: 120, xp: 150, proj: null, vsTower: 2.6 },
};
const TOWER = [
  { hp: 3000, ad: 175, arm: 100, mr: 100, range: 470, as: 1.0, r: 55 },   // 一塔
  { hp: 3300, ad: 210, arm: 110, mr: 110, range: 470, as: 1.0, r: 55 },   // 二塔
  { hp: 3600, ad: 245, arm: 120, mr: 120, range: 480, as: 1.0, r: 58 },   // 高地塔
];
const CRYSTAL_ST = { hp: 5200, ad: 380, arm: 120, mr: 120, range: 520, as: 1.0, r: 76 };

/* ---------- 经济和成长 ---------- */
const START_GOLD = 300;
const PASSIVE_GOLD = 3;                 // 每秒
const MAX_LVL = 15;
const XP_NEED = n => 120 + 40 * n;     // 从 n 级升到 n+1 级要多少经验
const SKILL_ORDER = [0, 1, 0, 2, 0, 1, 0, 2, 0, 1, 0, 2, 1, 1, 1];   // 每升一级点哪个技能
const RESPAWN = (lvl, t) => Math.min(55, 5 + 3 * lvl) + Math.max(0, (t - 600) / 60);   // 复活时间，10 分钟后每分钟多 1 秒
const WAVE_FIRST = 30, WAVE_EVERY = 30;

/* ---------- 英雄 ---------- */
// 技能：aim 'dir' 方向、'point' 地点、'self' 自己、'unit' 指定敌方英雄；ai 是电脑用技能时的提示
const HEROES = [
  {
    id: 'tank', name: '铁墩', role: '坦克', lane: 4, col: '#8C98A8',
    hp: 980, hpG: 120, ad: 58, adG: 5, arm: 55, armG: 5, mr: 40, mrG: 3, as: 0.85, asG: 1, range: 125, ms: 275, regen: 6, proj: null,
    passive: { name: '硬壳', desc: '受到的伤害减少 10%，生命低于 40% 时再减 15%。' },
    build: ['bootD', 'thorn', 'belt', 'cloak', 'totem', 'glass'],
    skills: [
      { id: 't1', name: '冲撞', aim: 'dir', range: 430, cd: [9, 8.6, 8.2, 7.8, 7.4, 7], dmg: [80, 110, 140, 170, 200, 230], hpR: 0.06, stun: 0.9,
        desc: '往前冲，撞到的第一个英雄被眩晕 0.9 秒。', ai: 'engage' },
      { id: 't2', name: '铁壁', aim: 'self', range: 260, cd: [12, 11.4, 10.8, 10.2, 9.6, 9], sh: [150, 200, 250, 300, 350, 400], hpR: 0.1, dmg: [60, 85, 110, 135, 160, 185],
        desc: '获得护盾，周围的敌人受到伤害并减速。', ai: 'defend' },
      { id: 't3', name: '震地', aim: 'point', range: 520, cd: [40, 35, 30], dmg: [200, 300, 400], hpR: 0.08, stun: 1.2, rad: 300,
        desc: '跳起来砸向地面，范围内的敌人全部眩晕 1.2 秒。', ai: 'ult_aoe' },
    ],
  },
  {
    id: 'warrior', name: '克劳德', role: '战士', lane: 0, col: '#CB7C5E',
    hp: 880, hpG: 105, ad: 66, adG: 7, arm: 42, armG: 4, mr: 32, mrG: 2.5, as: 0.9, asG: 1.5, range: 125, ms: 280, regen: 5, proj: null,
    passive: { name: '战意', desc: '造成伤害的 10% 回复成自己的生命。' },
    build: ['fang', 'bootD', 'axe', 'spear', 'belt', 'thorn'],
    skills: [
      { id: 'w1', name: '旋风斩', aim: 'self', range: 210, cd: [8, 7.6, 7.2, 6.8, 6.4, 6], dmg: [22, 30, 38, 46, 54, 62], adR: 0.3, dur: 2,
        desc: '原地转 2 秒，一直砍周围的敌人，转的时候跑得更快。', ai: 'spin' },
      { id: 'w2', name: '跃击', aim: 'point', range: 480, cd: [10, 9.5, 9, 8.5, 8, 7.5], dmg: [90, 125, 160, 195, 230, 265], adR: 0.8, rad: 200, slow: 0.4,
        desc: '跳到指定地点，砸中的敌人减速 40%。', ai: 'gap' },
      { id: 'w3', name: '断罪', aim: 'dir', range: 300, cd: [36, 30, 24], dmg: [180, 280, 380], adR: 1.0, miss: 0.25,
        desc: '对前方挥出重斩，敌人损失的生命越多伤害越高；击杀英雄返还冷却。', ai: 'execute' },
    ],
  },
  {
    id: 'assassin', name: '影子', role: '刺客', lane: 3, col: '#56586E',
    hp: 780, hpG: 92, ad: 70, adG: 8, arm: 34, armG: 3.5, mr: 30, mrG: 2, as: 0.95, asG: 2, range: 125, ms: 290, regen: 4, proj: null,
    passive: { name: '暗影', desc: '对生命低于 40% 的英雄多造成 20% 伤害。' },
    build: ['fang', 'bootD', 'spear', 'storm', 'axe', 'belt'],
    skills: [
      { id: 'a1', name: '影袭', aim: 'dir', range: 420, cd: [7, 6.7, 6.4, 6.1, 5.8, 5.5], dmg: [70, 100, 130, 160, 190, 220], adR: 0.7,
        desc: '冲过一段距离，砍到路上所有敌人；击杀英雄立刻刷新。', ai: 'dash' },
      { id: 'a2', name: '隐匿', aim: 'self', range: 0, cd: [14, 13.4, 12.8, 12.2, 11.6, 11], dmg: [100, 130, 160, 190, 220, 250], adR: 0.6, dur: 2.5,
        desc: '隐身 2.5 秒、跑得更快，隐身中的下一次普攻多造成伤害。', ai: 'stealth' },
      { id: 'a3', name: '千刃', aim: 'unit', range: 520, cd: [35, 30, 25], dmg: [55, 85, 115], adR: 0.45, hits: 5,
        desc: '闪到敌方英雄身边连砍 5 刀，这期间不会被选中。', ai: 'ult_unit' },
    ],
  },
  {
    id: 'mage', name: '星星', role: '法师', lane: 1, col: '#8D6BD8',
    hp: 680, hpG: 85, ad: 48, adG: 3, arm: 28, armG: 3, mr: 36, mrG: 2.5, as: 0.75, asG: 1, range: 470, ms: 275, regen: 4, proj: 'orb',
    passive: { name: '星辉', desc: '技能打中英雄后 2 秒内移动速度提高 20%。' },
    build: ['bootM', 'staff', 'wand', 'orb', 'glass', 'cloak'],
    skills: [
      { id: 'm1', name: '星火球', aim: 'dir', range: 850, cd: [5, 4.8, 4.6, 4.4, 4.2, 4], dmg: [110, 150, 190, 230, 270, 310], apR: 0.7, rad: 140,
        desc: '射出一颗火球，碰到敌人就炸开。', ai: 'poke' },
      { id: 'm2', name: '冰晶环', aim: 'point', range: 750, cd: [10, 9.6, 9.2, 8.8, 8.4, 8], dmg: [80, 110, 140, 170, 200, 230], apR: 0.5, rad: 180, root: 1.2, delay: 0.7,
        desc: '0.7 秒后在指定地点结冰，范围内的敌人被冻住 1.2 秒。', ai: 'cc_point' },
      { id: 'm3', name: '流星雨', aim: 'point', range: 850, cd: [35, 30, 25], dmg: [70, 100, 130], apR: 0.3, rad: 280, n: 7, dur: 2,
        desc: '召唤 7 颗流星砸向一片区域。', ai: 'ult_aoe' },
    ],
  },
  {
    id: 'marksman', name: '青箭', role: '射手', lane: 2, col: '#55B2A2',
    hp: 700, hpG: 88, ad: 62, adG: 6, arm: 28, armG: 3, mr: 30, mrG: 2, as: 0.9, asG: 3, range: 520, ms: 280, regen: 4, proj: 'arrow',
    passive: { name: '连射', desc: '每第 4 次普攻多造成 60% 伤害并减速。' },
    build: ['bootA', 'bow', 'storm', 'fang', 'spear', 'belt'],
    skills: [
      { id: 's1', name: '散射', aim: 'dir', range: 720, cd: [6, 5.7, 5.4, 5.1, 4.8, 4.5], dmg: [55, 80, 105, 130, 155, 180], adR: 0.6, n: 5,
        desc: '扇形射出 5 支箭。', ai: 'poke' },
      { id: 's2', name: '疾步', aim: 'dir', range: 260, cd: [9, 8.6, 8.2, 7.8, 7.4, 7], as: [30, 36, 42, 48, 54, 60],
        desc: '往一个方向翻滚，之后 4 秒攻击速度提高。', ai: 'kite' },
      { id: 's3', name: '穿云箭', aim: 'dir', range: 3500, cd: [45, 40, 35], dmg: [250, 400, 550], adR: 1.2, stun: [1, 2.5],
        desc: '射出一支能飞过半张地图的大箭，射中的英雄被眩晕，飞得越远晕得越久。', ai: 'ult_snipe' },
    ],
  },
  {
    id: 'support', name: '糖糖', role: '辅助', lane: 4, col: '#E58FB0',
    hp: 760, hpG: 100, ad: 48, adG: 4, arm: 36, armG: 4, mr: 36, mrG: 3, as: 0.8, asG: 1, range: 440, ms: 280, regen: 5, proj: 'heart',
    passive: { name: '守护', desc: '附近的友方英雄每秒回复 0.6% 最大生命。' },
    build: ['bootD', 'glass', 'cloak', 'belt', 'totem', 'orb'],
    skills: [
      { id: 'h1', name: '治愈之光', aim: 'self', range: 650, cd: [9, 8.6, 8.2, 7.8, 7.4, 7], dmg: [90, 120, 150, 180, 210, 240], apR: 0.5, hpR: 0.04,
        desc: '治疗自己和身边血最少的队友。', ai: 'heal' },
      { id: 'h2', name: '缠绕', aim: 'dir', range: 780, cd: [10, 9.6, 9.2, 8.8, 8.4, 8], dmg: [60, 90, 120, 150, 180, 210], apR: 0.4, root: 1.4,
        desc: '甩出藤蔓，缠住碰到的第一个敌人 1.4 秒。', ai: 'cc_dir' },
      { id: 'h3', name: '庇护', aim: 'self', range: 650, cd: [40, 35, 30], dmg: [180, 280, 380], apR: 0.8, hpR: 0.08,
        desc: '给身边的队友加护盾，并让大家跑得更快。', ai: 'ult_shield' },
    ],
  },
];
const HERO_BY_ID = {};
for (const h of HEROES) HERO_BY_ID[h.id] = h;
const ROLE_LANE = ['对抗路', '中路', '发育路', '打野', '游走'];

/* ---------- 装备 ---------- */
// 属性：hp ad ap arm mr as(%) crit(%) critd(暴击伤害 %) ls(吸血 %) ms cdr(%) apen mpen(穿透 %) regen thorn(反伤 %) frost(技能减速)
const ITEMS = {
  sword:  { name: '铁剑', cost: 250, ad: 20, cat: 'atk' },
  dagger: { name: '短匕', cost: 300, as: 12, cat: 'atk' },
  glove:  { name: '拳套', cost: 320, crit: 8, cat: 'atk' },
  book:   { name: '魔法书', cost: 300, ap: 40, cat: 'mag' },
  ruby:   { name: '红宝石', cost: 300, hp: 300, cat: 'def' },
  vest:   { name: '皮甲', cost: 220, arm: 30, cat: 'def' },
  cape:   { name: '斗篷', cost: 220, mr: 30, cat: 'def' },
  shoe:   { name: '草鞋', cost: 250, ms: 25, cat: 'move' },
  bootA:  { name: '疾风靴', cost: 710, from: ['shoe'], ms: 60, as: 20, cat: 'move' },
  bootM:  { name: '法师靴', cost: 710, from: ['shoe'], ms: 60, ap: 40, mpen: 10, cat: 'move' },
  bootD:  { name: '铁甲靴', cost: 710, from: ['shoe'], ms: 60, arm: 35, mr: 25, cat: 'move' },
  fang:   { name: '吸血獠牙', cost: 1400, from: ['sword'], ad: 45, ls: 12, cat: 'atk' },
  storm:  { name: '风暴巨剑', cost: 2100, from: ['sword', 'glove'], ad: 90, crit: 20, critd: 40, cat: 'atk' },
  bow:    { name: '疾风连弩', cost: 1900, from: ['dagger', 'glove'], as: 35, crit: 15, ms: 15, cat: 'atk' },
  spear:  { name: '破甲长矛', cost: 2000, from: ['sword'], ad: 70, apen: 30, cat: 'atk' },
  axe:    { name: '狂战斧', cost: 2000, from: ['sword', 'ruby'], ad: 55, hp: 500, cdr: 10, cat: 'atk' },
  staff:  { name: '星辰法杖', cost: 2100, from: ['book', 'book'], ap: 160, cat: 'mag' },
  orb:    { name: '冰霜法球', cost: 2000, from: ['book', 'ruby'], ap: 100, hp: 400, frost: 1, cat: 'mag' },
  wand:   { name: '虚空之杖', cost: 2100, from: ['book'], ap: 120, mpen: 35, cat: 'mag' },
  glass:  { name: '时光沙漏', cost: 1800, from: ['book', 'vest'], ap: 90, arm: 40, cdr: 15, cat: 'mag' },
  belt:   { name: '巨人腰带', cost: 1600, from: ['ruby', 'ruby'], hp: 1000, regen: 4, cat: 'def' },
  thorn:  { name: '荆棘铠甲', cost: 1900, from: ['vest', 'ruby'], arm: 90, hp: 300, thorn: 20, cat: 'def' },
  cloak:  { name: '守护披风', cost: 1800, from: ['cape', 'ruby'], mr: 80, hp: 450, regen: 3, cat: 'def' },
  totem:  { name: '生命图腾', cost: 2200, from: ['ruby', 'vest'], hp: 700, arm: 50, regen: 8, cdr: 10, cat: 'def' },
};
const STAT_NAME = { hp: '生命', ad: '攻击', ap: '法强', arm: '物防', mr: '法防', as: '攻速', crit: '暴击', critd: '暴伤', ls: '吸血', ms: '移速', cdr: '冷却缩减', apen: '物穿', mpen: '法穿', regen: '回血' };

/* ---------- 召唤师技能 ---------- */
const FLASH_CD = 90, FLASH_DIST = 320;
const HEAL_CD = 45, HEAL_PCT = 0.15, HEAL_DUR = 4;
const RECALL_T = 5;

/* ---------- 难度 ---------- */
// react：多久想一次；aim：瞄准误差（单位）；skill：看到机会时放技能的概率；brave：多冒险；lastHit：补刀的准头
const DIFF = [
  { name: '简单', react: 0.55, aim: 90, skill: 0.45, brave: 0.85, lastHit: 0.55, goldMul: 0.9 },
  { name: '普通', react: 0.32, aim: 45, skill: 0.75, brave: 1.0, lastHit: 0.8, goldMul: 1 },
  { name: '困难', react: 0.16, aim: 15, skill: 0.95, brave: 1.1, lastHit: 0.95, goldMul: 1.1 },
];

if (typeof module !== 'undefined') module.exports = {};
