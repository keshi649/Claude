// 《MOONRIDE》像素版：镜头表、转场、水印、逐帧入口 frame(t)
// 镜头的切点照原版 MV 的切点（成片时间 = 歌曲时间）。
'use strict';
// [开始时刻, 镜头函数名, 参数, 进场转场]
const SHOTS = [
  [0.00, 'shTitle'],                 // 夜里的城市广场，霓虹片名，心形喷泉
  [4.30, 'shFacadeOff'],             // 楼面上一扇扇窗拼成的心，一格格灭掉
  [5.71, 'shTheater'],               // 老电影院，放映机的光柱
  [6.88, 'shFacadeOn'],              // 楼面的窗又一格格亮起来
  [7.96, 'shCarField'],              // 花丛里的车，车窗里两个人
  [9.67, 'shCarCamera'],             // 举起相机拍照
  [10.58, 'shViewfinder'],           // 取景框里的紫色山丘和马
  [12.12, 'shCarGirl'],              // 车里的她，回头看
  [13.25, 'shCarTwo'],               // 两个人趴在车窗上
  [14.00, 'shWalkie'],               // 拿着粉色对讲机
  [14.92, 'shMonolith'],             // 紫色原野上的 Need HEART 石碑
  [15.92, 'shIceGirl'],              // 冰块里的她，手贴着冰
  [17.25, 'shIceWide'],              // 石碑、冰块、百合、远处的马
  [18.29, 'shNeedHeart'],            // Need HEART 霓虹特写
  [19.08, 'shLake'],                 // 湖边的毛绒小马
  [20.50, 'shHillCar'],              // 山顶的路，车冲过去
  [21.92, 'shSnowProfile', { g: 1 }], // 雪夜里的侧脸（橘色长发）
  [22.62, 'shSnowProfile', { g: 7, dir: -1 }],
  [23.10, 'shRooftop'],              // 满月下的玻璃屋顶，两个人跳舞
  [25.42, 'shSnowBob'],              // 短发的她回头
  [26.72, 'shRooftop', { near: 1 }],
  [28.79, 'shBlueBust', { g: 4 }],   // 蓝色夜里的特写
  [30.17, 'shHeartCrater'],          // 心形的谷地，一圈圈台阶
  [31.42, 'shFrozenPony'],           // 冻在冰里的小马
  [33.21, 'shBusStop'],              // 冰块和车站
  [35.12, 'shIceSil'],               // 冰块里贴着手的人影
  [36.38, 'shHandGlass', { g: 4 }],  // 隔着冰伸手
  [37.67, 'shGateWalk'],             // 白栅栏的路，三个人走向钟楼门
  [39.50, 'shGateProfiles'],         // 三个人的侧脸，门里透出光 → 闪白
  [41.80, 'shMuseum'],               // 薄荷绿的展厅，透明胶囊电梯
  [43.40, 'shShaft'],                // 电梯往下穿过黑暗的货架
  [49.50, 'shBlack'],
  [50.00, 'shBath'],                 // 粉色浴室，S 形气球、小黄鸭
  [50.96, 'shPinkLake'],             // 粉色湖上漂着心
  [52.58, 'shRedField'],             // 红色天空，扛着心形大锤
  [55.83, 'shHammerGirl', { g: 1 }], // 拿着锤子笑
  [57.12, 'shSwing'],                // 一锤砸向冰块
  [59.08, 'shShatter'],              // 心形的冰晶炸开
  [60.04, 'shMirror', { g: 3, tone: 'green' }], // 后视镜里的眼睛
  [61.92, 'shSideMirror'],           // 红色的后视镜
  [63.42, 'shMirror', { g: 7, tone: 'warm' }],
  [65.58, 'shMirror', { g: 5, tone: 'dark', lips: 1 }],
  [67.42, 'shPillar'],               // 云海上的柱子，她坐在顶上
  [69.33, 'shPinkBust', { g: 3, m: 'pout' }],
  [70.79, 'shPillarSit'],
  [72.38, 'shPinkBust', { g: 3, m: 'smile', turn: .25 }],
  [73.25, 'shPillarLow'],
  [74.92, 'shArchWindow'],           // 拱门上的心形窗
  [77.54, 'shHeartCushion'],         // 坐在毛绒心堆里（短发）
  [79.58, 'shHeartCushionBack'],     // 背影，看云海
  [81.50, 'shDanceRoad'],            // 对称的舞，BACK / SEAT 路牌
  [83.83, 'shDanceRoad', { near: 1 }],
  [86.04, 'shStreetHeart'],          // 街上递毛绒心，后备箱打开
  [87.25, 'shHandsHeart'],
  [87.96, 'shStreetWalk'],
  [89.79, 'shTrunkPOV'],             // 从后备箱里往外看
  [91.00, 'shTrunkTwo'],
  [91.75, 'shTrunkPOV', { b: 1 }],
  [93.38, 'shSunroof'],              // 天窗上看星星
  [95.00, 'shSunroofTop'],
  [97.25, 'shGlowRoad'],             // 黑夜里发光的弯路
  [99.04, 'shCarFloor'],             // 车里长出了草地
  [100.00, 'shCarLegs'],
  [100.92, 'shShoe'],
  [102.58, 'shDoorMeadow', { g: 1 }], // 飘着门的草地
  [104.33, 'shCarLean', { g: 7 }],   // 探出车窗
  [107.04, 'shDoorNight', { g: 5 }], // 夜里一排彩色的门
  [108.25, 'shMeadowWalk', { g: 6 }],
  [110.17, 'shCloudBust', { g: 4 }], // 云海、心形气球
  [112.12, 'shPonyMeadow'],          // 小马在草地上跑
  [112.96, 'shBalloonCar', { k: 0 }], // 车里的紫色心形气球
  [114.75, 'shBalloonCar', { k: 1 }],
  [115.83, 'shBalloonCar', { k: 2 }],
  [118.17, 'shBalloonCar', { k: 3 }],
  [118.62, 'shBalloonCar', { k: 4 }],
  [119.54, 'shHedgeBust', { g: 2 }], // 修剪过的花园（短发）
  [121.21, 'shDoorRow'],             // 八个人站在一排门前
  [123.25, 'shLavenderHearts'],      // 薰衣草地里抱着大毛绒心
  [125.17, 'shBench', { g: 0 }],
  [126.08, 'shHedgeBust', { g: 2, near: 1 }],
  [127.00, 'shWheel'],               // 车轮压过发光的路
  [129.33, 'shRainbow'],             // 云海上的彩虹路
  [130.75, 'shHeartTunnel'],         // 开进心形的云洞
  [132.12, 'shDecoCar', { c: 0 }],   // 粉色小城，车顶上的心
  [134.00, 'shCityTop', { k: 0 }],
  [134.38, 'shDecoPlaza'],
  [135.38, 'shCityTop', { k: 1 }],
  [136.54, 'shDecoCar', { c: 1 }],
  [137.21, 'shWheel', { city: 1 }],
  [137.67, 'shDecoCar', { c: 2 }],
  [138.42, 'shCityView'],
  [139.33, 'shDecoCar', { c: 3 }],
  [140.04, 'shFrozenFlower'],
  [140.71, 'shArchStreet'],
  [141.75, 'shThreeCars'],
  [143.75, 'shParked'],
  [144.96, 'shCarDoor'],             // 从车里看她跑向大家
  [149.29, 'shGeyser', { k: 0 }],    // 喷泉冲天
  [150.29, 'shGeyser', { k: 1 }],
  [151.21, 'shGroupGarden'],         // 八个人在蘑菇花园里
  [153.12, 'shHeartHole'],
  [153.88, 'shPonyHedge'],
  [154.79, 'shSurprise', { g: 0 }],
  [155.83, 'shLookUp', { g: 1 }],
  [156.83, 'shPonyStatue'],
  [157.67, 'shGardenPath'],
  [158.62, 'shPonyRun'],
  [160.00, 'shPonyMush'],
  [160.46, 'shFountainBust', { g: 7 }],
  [160.96, 'shMushBust', { g: 5 }],
  [161.50, 'shPonyLeap'],
  [163.46, 'shPonySky'],
  [164.25, 'shFountainDance'],
  [165.17, 'shPonySky', { top: 1 }],
  [165.88, 'shFountain'],
  [166.79, 'shPonySplash'],
  [168.08, 'shFountainBust', { g: 3 }],
  [168.46, 'shMushBust', { g: 2 }],
  [169.00, 'shFountainBust', { g: 4, smile: 1 }],
  [169.75, 'shPonyBack'],
  [170.42, 'shHeartHedges'],
  [171.17, 'shParade'],
  [172.46, 'shHeartStatue'],
  [173.20, 'shTheEnd'],              // THE END，花园迷宫和三辆车
  [178.30, 'shBalloonsPalace'],
  [179.60, 'shBalloonsSky'],
  [182.12, 'shDesert'],              // 粉色沙丘里的白色路
  [183.04, 'shFace', { g: 2 }],
  [183.83, 'shDuneBust', { g: 3 }],
  [185.42, 'shFace', { g: 0 }],
  [186.21, 'shDuneGirl', { g: 5 }],
  [186.67, 'shCarDark', { g: 7 }],
  [187.21, 'shFace', { g: 2, car: 1 }],
  [188.04, 'shFace', { g: 4, side: 1 }],
  [188.92, 'shDuneFade'],
  [190.00, 'shEndCard'],             // 甜菜 出品
];
const SHOT_END = SONG;

function shotIndex(t) { let i = 0; while (i + 1 < SHOTS.length && SHOTS[i + 1][0] <= t) i++; return i; }
function shotDur(i) { return (i + 1 < SHOTS.length ? SHOTS[i + 1][0] : SHOT_END) - SHOTS[i][0]; }
function placeholder(name, lt, d) {
  vgrad(0, 0, W, H, [[0, '#202030'], [1, '#404058']], 6);
  text(name, W / 2, H / 2 - 12, '#ffffff', { al: 'c', sc: 2 });
  rect(40, 200, (W - 80) * sat(lt / d), 4, '#ff88aa');
}
function renderShot(i, t) {
  const [t0, fn, o] = SHOTS[i]; const d = shotDur(i), lt = t - t0;
  resetState(); F.d.fill(0); GL.d.fill(0);
  const f = globalThis[fn];
  if (typeof f === 'function') f(lt, d, o || {}, t); else placeholder(fn, lt, d);
}
function frame(t) {
  const i = shotIndex(t);
  renderShot(i, t);
  resetState();
  overlays(t);
}
// 水印"甜菜"：右上角，片尾卡上不画
function overlays(t) {
  if (t >= 190.0) return;
  text('甜菜', W - 8, 6, '#ffffff', { al: 'r', a: .82, sh: '#000000' });
}
