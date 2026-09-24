/** 配置编写辅助函数 */

/** 按英雄等级线性成长的数值表（1~15 级）：start + perLevel × (等级 − 1) */
export function byLevel(start: number, perLevel: number, levels = 15): number[] {
  return Array.from({ length: levels }, (_, i) => Math.round((start + perLevel * i) * 100) / 100);
}

/** 按技能等级线性成长的数值表 */
export function bySkill(start: number, step: number, levels = 6): number[] {
  return byLevel(start, step, levels);
}
