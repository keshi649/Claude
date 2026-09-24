import { Rng } from '../../core/rng';
import type { LaneId } from '../../data/map';
import { HERO_LIST, getHero } from '../../data/heroes';
import type { Command } from '../commands';
import type { Team, Unit } from '../entity';
import { isInvulnerable } from '../status';
import type { PlayerConfig, World } from '../world';
import { AIBrain, type TeamPlan } from './brain';
import { DIFFICULTY, type Difficulty } from './difficulty';
import { TeamKnowledge } from './perception';
import { ALL_POSITIONS, PREF, type Position } from './roles';

/**
 * AI 总控：每队一份认知（TeamKnowledge）与队伍计划（打 Boss、后期抱团推进），
 * 每个 AI 英雄一个大脑。每个逻辑帧产出一批 Command，与玩家命令一起交给 World.step。
 * 使用独立的种子随机数，整个过程确定、可复现。
 */
export class AIDirector {
  readonly brains: AIBrain[] = [];
  readonly knowledge: [TeamKnowledge, TeamKnowledge] = [new TeamKnowledge(0), new TeamKnowledge(1)];
  readonly plans: [TeamPlan, TeamPlan] = [
    { objective: 0, members: new Set(), groupLane: null, push: false, defendAt: 0 },
    { objective: 0, members: new Set(), groupLane: null, push: false, defendAt: 0 },
  ];
  private readonly rng: Rng;

  constructor(w: World, difficulties: Partial<Record<number, Difficulty>>, positions: Map<number, Position>) {
    this.rng = new Rng((w.config.seed ^ 0x5bd1e995) >>> 0);
    for (const p of w.players) {
      if (!p.isAI) continue;
      const d = difficulties[p.pid] ?? 'normal';
      this.brains.push(new AIBrain(p.pid, p.unitId, positions.get(p.pid) ?? 'mid', DIFFICULTY[d], this.rng));
    }
  }

  think(w: World): Command[] {
    if (w.winner !== null) return [];
    for (const k of this.knowledge) k.update(w);
    if (w.tick % 30 === 0) for (const t of [0, 1] as const) this.plan(w, t);
    const out: Command[] = [];
    for (const b of this.brains) {
      const u = w.get(b.unitId);
      if (!u) continue;
      out.push(...b.think(w, this.knowledge[u.team as 0 | 1], this.plans[u.team as 0 | 1]));
    }
    return out;
  }

  brainOf(unitId: number): AIBrain | undefined {
    return this.brains.find((b) => b.unitId === unitId);
  }

  /** 队伍计划：什么时候去打 Boss、后期往哪一路抱团 */
  private plan(w: World, team: Team): void {
    const plan = this.plans[team as 0 | 1];
    const mine = w.list.filter((u) => u.hero && u.team === team);
    const theirs = w.list.filter((u) => u.hero && u.team !== team);
    const ourAlive = mine.filter((u) => u.alive).length;
    const enemyDead = theirs.filter((u) => !u.alive).length;
    const enemyAlive = theirs.length - enemyDead;

    // 人数优势（对方至少死 2 个、我方活着的多 2 个以上）：趁复活时间推塔
    const squadAt = (p: { x: number; y: number }): number => mine.filter((u) => u.alive && Math.hypot(u.pos.x - p.x, u.pos.y - p.y) < 45).length;
    const pushLane = (): { lane: LaneId; dist: number } => {
      let best: LaneId = 'mid';
      let bestD = Infinity;
      for (const lane of ['top', 'mid', 'bot'] as const) {
        // 这一路塔全倒了就以水晶为目标
        const tower = this.frontTower(w, team, lane) ?? w.list.find((c) => c.kind === 'crystal' && c.team !== team && c.alive);
        if (!tower) continue;
        const alive = mine.filter((u) => u.alive);
        const d = alive.reduce((s, u) => s + Math.hypot(u.pos.x - tower.pos.x, u.pos.y - tower.pos.y), 0) / Math.max(1, alive.length);
        if (d < bestD) {
          bestD = d;
          best = lane;
        }
      }
      return { lane: best, dist: bestD };
    };
    const adv = ourAlive - enemyAlive;

    // 回防：2 名以上敌方英雄在己方建筑附近（只看得见的）
    plan.defendAt = 0;
    let worst = 0;
    const seen = this.knowledge[team as 0 | 1].visibleEnemyHeroes(w);
    for (const t of w.list) {
      if ((t.kind !== 'tower' && t.kind !== 'crystal') || t.team !== team || !t.alive || isInvulnerable(t)) continue;
      const n = seen.filter((e) => Math.hypot(e.pos.x - t.pos.x, e.pos.y - t.pos.y) < 13).length;
      const key = n * 10 + (t.kind === 'crystal' ? 5 : (t.lane?.idx ?? 0));
      if (n >= 2 && key > worst) {
        worst = key;
        plan.defendAt = t.id;
      }
    }
    const pushing = w.time > 180 && enemyDead >= 2 && adv >= 2 && ourAlive >= 3;

    // Boss
    // 营地里的 id 要到下一帧才清理，Boss 可能已经死亡并被移除
    const bossAlive = (id: string): number => {
      const c = w.camps.find((x) => x.kind === id);
      const b = c ? w.get(c.ids[0] ?? 0) : undefined;
      return b && b.alive ? b.id : 0;
    };
    const cur = w.get(plan.objective);
    if (!cur || !cur.alive) {
      plan.objective = 0;
      plan.members.clear();
    }
    if (!plan.objective && !pushing) {
      const turtle = bossAlive('turtle');
      const dragon = bossAlive('dragon');
      let target = 0;
      if (dragon && ourAlive >= 4 && (enemyDead >= 2 || (w.time > 600 && adv >= 1))) target = dragon;
      else if (turtle && ourAlive >= 3 && (enemyDead >= 2 || (w.time > 300 && adv >= 1))) target = turtle;
      if (target) {
        const boss = w.get(target)!;
        plan.objective = target;
        const need = boss.defId.includes('dragon') ? 4 : 3;
        const alive = mine.filter((u) => u.alive && u.hp / u.stats.maxHp > 0.5);
        alive.sort((a, b) => Math.hypot(a.pos.x - boss.pos.x, a.pos.y - boss.pos.y) - Math.hypot(b.pos.x - boss.pos.x, b.pos.y - boss.pos.y));
        for (const u of alive.slice(0, need)) plan.members.add(u.id);
      }
    }
    // 若有敌人出现在 Boss 附近且我方劣势，放弃
    const boss = w.get(plan.objective);
    if (boss) {
      const threat = this.knowledge[team as 0 | 1].visibleEnemyHeroes(w).filter((e) => Math.hypot(e.pos.x - boss.pos.x, e.pos.y - boss.pos.y) < 15).length;
      if (threat > plan.members.size) {
        plan.objective = 0;
        plan.members.clear();
      }
    }

    if (pushing) {
      // 推进时 Boss 让位（Boss 就在身边、已经打了一半的除外）
      const boss = w.get(plan.objective);
      if (!boss || boss.hp / boss.stats.maxHp > 0.5 || squadAt(boss.pos) < 3) {
        plan.objective = 0;
        plan.members.clear();
      }
      if (!plan.push || !plan.groupLane) plan.groupLane = pushLane().lane;
      plan.push = true;
      return;
    }
    plan.push = false;

    // 中后期（7 分钟后）抱团：选敌方外塔最靠外、最残的那一路
    // 已经抱团站在某一路的塔前时不换路（防止推到一半整队横穿地图）
    if (w.time > 420 && plan.groupLane) {
      const cur = this.frontTower(w, team, plan.groupLane) ?? w.list.find((c) => c.kind === 'crystal' && c.team !== team && c.alive);
      if (cur && mine.filter((u) => u.alive && Math.hypot(u.pos.x - cur.pos.x, u.pos.y - cur.pos.y) < 28).length >= 3) return;
    }
    if (w.time > 420) {
      let best: LaneId = 'mid';
      let bestKey = Infinity;
      for (const lane of ['top', 'mid', 'bot'] as const) {
        const front = this.frontTower(w, team, lane);
        if (!front) {
          // 这一路塔已全倒：直接打水晶
          best = lane;
          bestKey = -1;
          break;
        }
        const key = front.lane!.idx * 10000 + front.hp;
        if (key < bestKey) {
          bestKey = key;
          best = lane;
        }
      }
      plan.groupLane = best;
    } else plan.groupLane = null;
  }

  /** 敌方某一路最外面的一座塔（全倒了返回 null） */
  private frontTower(w: World, team: Team, lane: LaneId): Unit | null {
    let best: Unit | null = null;
    for (const t of w.list) {
      if (t.kind !== 'tower' || t.team === team || !t.alive || t.lane?.id !== lane) continue;
      if (!best || t.lane.idx < best.lane!.idx) best = t;
    }
    return best;
  }
}

// ————————————————————————— 阵容 —————————————————————————

export interface LineupOptions {
  seed: number;
  /** 玩家英雄（没有则是 10 个 AI 对打） */
  playerHero?: string;
  playerSummoner?: string;
  /** 两队 AI 的难度 */
  allyDifficulty: Difficulty;
  enemyDifficulty: Difficulty;
}

export interface Lineup {
  players: PlayerConfig[];
  positions: Map<number, Position>;
  difficulties: Record<number, Difficulty>;
}

/**
 * 生成 5v5 阵容（对标手游人机：每队都是正常的分路阵容）：
 * 先把玩家放到其英雄最擅长的位置，其余位置按“打野 → 中路 → 发育路 → 游走 → 对抗路”依次
 * 从最擅长该位置（偏好分 ≥ 8，对抗路 ≥ 6）的英雄里随机挑选；同队英雄不重复（敌我可以重复）。
 * 打野带猎击，游走带愈合，其余带瞬影（玩家用自己选的召唤师技能）。
 */
export function makeLineup(o: LineupOptions): Lineup {
  const rng = new Rng((o.seed * 2654435761) >>> 0);
  const players: PlayerConfig[] = [];
  const positions = new Map<number, Position>();
  const difficulties: Record<number, Difficulty> = {};
  let pid = 1;
  const FILL: Position[] = ['jungle', 'mid', 'bot', 'roam', 'top'];
  for (const team of [0, 1] as const) {
    const byPos = new Map<Position, string>();
    const withPlayer = team === 0 && !!o.playerHero;
    let playerPos: Position | null = null;
    if (withPlayer) {
      const role = getHero(o.playerHero!).role;
      playerPos = ALL_POSITIONS.reduce((a, b) => (PREF[role][b] > PREF[role][a] ? b : a));
      byPos.set(playerPos, o.playerHero!);
    }
    for (const pos of FILL) {
      if (byPos.has(pos)) continue;
      const used = new Set(byPos.values());
      const free = HERO_LIST.filter((h) => !used.has(h.id));
      // 对抗路战士、坦克都可以；其余位置只挑最擅长的定位，没有再放宽
      const need = pos === 'top' ? 6 : 8;
      const best = free.filter((h) => PREF[h.role][pos] >= need);
      const ok = free.filter((h) => PREF[h.role][pos] >= 6);
      byPos.set(pos, rng.pick(best.length ? best : ok.length ? ok : free).id);
    }
    // 玩家排第一个（pid 1），其余按固定位置顺序
    const order = playerPos ? [playerPos, ...ALL_POSITIONS.filter((p) => p !== playerPos)] : ALL_POSITIONS;
    for (const p of order) {
      const heroId = byPos.get(p)!;
      const isPlayer = p === playerPos;
      const summoner = isPlayer ? (o.playerSummoner ?? (p === 'jungle' ? 'smite' : 'blink')) : p === 'jungle' ? 'smite' : p === 'roam' ? 'heal' : 'blink';
      players.push({ pid, team, heroId, name: isPlayer ? '玩家' : `${team === 0 ? '蓝' : '红'}方 AI`, isAI: !isPlayer, summoner });
      positions.set(pid, p);
      difficulties[pid] = team === 0 ? o.allyDifficulty : o.enemyDifficulty;
      pid++;
    }
  }
  return { players, positions, difficulties };
}
