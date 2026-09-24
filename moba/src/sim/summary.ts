import type { Team } from './entity';
import type { World } from './world';

/**
 * 对局结算：每名玩家的数据与评分、双方 MVP。纯函数，界面与无界面模拟共用。
 *
 * 评分（1~16 分）综合：参团率、英雄伤害占比、承伤占比、经济占比、推塔占比、治疗护盾占比、
 * 击杀与死亡，胜方额外 +1。胜方评分最高者为 MVP，败方评分最高者为“败方 MVP”。
 */
export interface PlayerSummary {
  pid: number;
  team: 0 | 1;
  heroId: string;
  name: string;
  isAI: boolean;
  level: number;
  kills: number;
  deaths: number;
  assists: number;
  lastHits: number;
  gold: number;
  damageDealt: number;
  damageTaken: number;
  towerDamage: number;
  support: number;
  items: string[];
  /** 参团率 0~1 */
  kp: number;
  score: number;
  mvp: 'win' | 'lose' | null;
  /** 全场单项第一的称号（金牌输出 / 金牌承伤 / 金牌经济 / 金牌推塔 / 金牌辅助 / 金牌补刀） */
  titles: string[];
}

export interface MatchSummary {
  winner: Team | null;
  /** 对局时长（秒） */
  duration: number;
  kills: [number, number];
  /** 各队摧毁的敌方防御塔数 */
  towers: [number, number];
  players: PlayerSummary[];
  /** 经济差曲线：每 10 秒一个点，蓝方总经济 − 红方总经济（界面层记录后填入） */
  goldTimeline?: { t: number; diff: number }[];
}

const share = (v: number, total: number): number => (total > 0 ? v / total : 0);

export function summarize(w: World): MatchSummary {
  const rows: PlayerSummary[] = [];
  for (const p of w.players) {
    const u = w.get(p.unitId);
    const h = u?.hero;
    if (!u || !h) continue;
    rows.push({
      pid: p.pid,
      team: p.team,
      heroId: p.heroId,
      name: p.name,
      isAI: p.isAI,
      level: h.level,
      kills: h.kills,
      deaths: h.deaths,
      assists: h.assists,
      lastHits: h.lastHits,
      gold: Math.floor(h.goldEarned),
      damageDealt: Math.round(h.damageDealt),
      damageTaken: Math.round(h.damageTaken),
      towerDamage: Math.round(h.towerDamage),
      support: Math.round(h.support),
      items: h.items.filter((x): x is string => !!x),
      kp: 0,
      score: 0,
      mvp: null,
      titles: [],
    });
  }
  const kills: [number, number] = [0, 0];
  for (const r of rows) kills[r.team] += r.kills;
  const towers: [number, number] = [0, 0];
  for (const u of w.list) if (u.kind === 'tower' && !u.alive) towers[(1 - u.team) as 0 | 1]++;

  for (const t of [0, 1] as const) {
    const mine = rows.filter((r) => r.team === t);
    const sum = (f: (r: PlayerSummary) => number): number => mine.reduce((s, r) => s + f(r), 0);
    const dealt = sum((r) => r.damageDealt);
    const taken = sum((r) => r.damageTaken);
    const gold = sum((r) => r.gold);
    const tower = sum((r) => r.towerDamage);
    const sup = sum((r) => r.support);
    for (const r of mine) {
      r.kp = share(r.kills + r.assists, kills[t]);
      const raw =
        3 +
        r.kp * 4 +
        share(r.damageDealt, dealt) * 6 +
        share(r.damageTaken, taken) * 3 +
        share(r.gold, gold) * 3 +
        share(r.towerDamage, tower) * 2 +
        share(r.support, sup) * 2 +
        r.kills * 0.25 -
        r.deaths * 0.35 +
        (w.winner === t ? 1 : 0);
      r.score = Math.round(Math.max(1, Math.min(16, raw)) * 10) / 10;
    }
    const best = mine.reduce<PlayerSummary | null>((b, r) => (!b || r.score > b.score ? r : b), null);
    if (best && w.winner !== null) best.mvp = w.winner === t ? 'win' : 'lose';
  }
  // 全场单项第一（同分取先出现的）
  const award = (title: string, f: (r: PlayerSummary) => number): void => {
    const best = rows.reduce<PlayerSummary | null>((b, r) => (f(r) > 0 && (!b || f(r) > f(b)) ? r : b), null);
    if (best) best.titles.push(title);
  };
  award('金牌输出', (r) => r.damageDealt);
  award('金牌承伤', (r) => r.damageTaken);
  award('金牌经济', (r) => r.gold);
  award('金牌推塔', (r) => r.towerDamage);
  award('金牌辅助', (r) => r.support);
  award('金牌补刀', (r) => r.lastHits);
  return { winner: w.winner, duration: w.time, kills, towers, players: rows };
}
