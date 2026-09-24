import type { HeroDef } from '../schema';
import { LIFENG } from './lifeng';

/** 英雄注册表：新增英雄只需在这里登记配置 */
export const HEROES: Record<string, HeroDef> = {
  [LIFENG.id]: LIFENG,
};

export const HERO_LIST: readonly HeroDef[] = Object.values(HEROES);

export function getHero(id: string): HeroDef {
  const h = HEROES[id];
  if (!h) throw new Error(`未知英雄：${id}`);
  return h;
}
