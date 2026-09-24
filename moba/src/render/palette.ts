/** 渲染配色（全部程序绘制，不使用外部图片） */
export const PALETTE = {
  /** 阵营主色：蓝方蓝青，红方橙红，中立金色 */
  team: [0x3fb6ff, 0xff5a3c, 0xe8c64a] as const,
  teamDark: [0x145a8a, 0x8a2414, 0x7a6420] as const,
  /** 头顶血条：自己绿色、友军蓝色、敌方红色 */
  hpSelf: 0x5de35a,
  hpAlly: 0x3fa9ff,
  hpEnemy: 0xff4a3a,
  hpBack: 0x1a1a1a,
  mp: 0x4a8dff,
  shield: 0xf2f2f2,

  grass: 0x2e4a2b,
  grassDark: 0x26402a,
  jungle: 0x223a24,
  lane: 0x8a7a55,
  laneEdge: 0x6f6245,
  river: 0x2a6f97,
  riverLight: 0x4d9ac2,
  bush: 0x2f7d32,
  bushDark: 0x1f5a24,
  wall: 0x3b3f34,
  wallTop: 0x565c4c,
  wallEdge: 0x14170f,
  wallShadow: 0x0c120c,
  plaza: 0x5d6470,

  dmgPhysical: 0xffe0b0,
  dmgMagic: 0xc59bff,
  dmgTrue: 0xffffff,
  dmgCrit: 0xff6a2a,
  dmgTaken: 0xff4a4a,
  heal: 0x6dff7a,
};

export function teamColor(team: number): number {
  return PALETTE.team[team as 0 | 1 | 2] ?? 0xffffff;
}
