import type { HeroDef } from '../schema';
import { DUOSHAN } from './duoshan';
import { LANXI } from './lanxi';
import { LIFENG } from './lifeng';
import { QINGLING } from './qingling';
import { YEYA } from './yeya';
import { ZHIYING } from './zhiying';

/** 英雄注册表：新增英雄只需在这里登记配置（顺序即选英雄界面的顺序：坦克、战士、刺客、法师、射手、辅助） */
export const HERO_LIST: readonly HeroDef[] = [DUOSHAN, LIFENG, YEYA, LANXI, QINGLING, ZHIYING];

export const HEROES: Record<string, HeroDef> = Object.fromEntries(HERO_LIST.map((h) => [h.id, h]));

export function getHero(id: string): HeroDef {
  const h = HEROES[id];
  if (!h) throw new Error(`未知英雄：${id}`);
  return h;
}
