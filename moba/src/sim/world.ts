import { Rng } from '../core/rng';
import { norm, type Vec2 } from '../core/vec2';
import { DT } from '../data/balance';
import { getHero } from '../data/heroes';
import { buildMap, type BuiltMap } from '../data/map';
import type { StatBlock } from '../data/schema';
import { CRYSTAL, TOWERS } from '../data/structures';
import { DUMMY } from '../data/units';
import type { Command } from './commands';
import type { EntityId, PendingArea, Projectile, Team, Unit, UnitKind, Zone } from './entity';
import type { SimEvent } from './events';
import { autoLevelSkills, levelSkill, levelUp } from './hero';
import { AStar } from './nav/astar';
import { NavGrid } from './nav/grid';
import { WallField } from './nav/walls';
import { commandCast, updateCasts } from './skills/cast';
import { SpatialHash } from './spatial';
import { recomputeStats, statsAtLevel } from './stats';
import { commandAttack, updateAttacks } from './systems/attack';
import { separateUnits, updateMovement } from './systems/movement';
import { updateProjectiles, updateZones } from './systems/projectiles';
import { updateDummies, updateStatus } from './systems/status';
import { cancelRecall, commandRecall, commandRestore, commandSummoner, updateUtility } from './systems/utility';

export interface PlayerConfig {
  pid: number;
  team: 0 | 1;
  heroId: string;
  name: string;
  isAI: boolean;
  /** 召唤师技能 id（默认瞬影） */
  summoner?: string;
}

export interface PlayerSlot extends PlayerConfig {
  unitId: EntityId;
}

export interface WorldConfig {
  seed: number;
  /** training：训练场（M1：木桩 + 不可破坏的建筑） */
  mode: 'training';
  players: PlayerConfig[];
  /** 英雄初始等级 */
  startLevel?: number;
}

/** 静态地图数据只构建一次，多局 / 多个 World 共享（导航网格按局复制动态层） */
let staticCache: { map: BuiltMap; walls: WallField; nav: NavGrid } | null = null;
function staticMap(): { map: BuiltMap; walls: WallField; nav: NavGrid } {
  if (!staticCache) {
    const map = buildMap();
    const walls = new WallField(map.walls, map.size);
    staticCache = { map, walls, nav: new NavGrid(walls) };
  }
  return staticCache;
}

/**
 * 逻辑世界：固定步长推进，不依赖 DOM / 渲染。
 * 同样的种子 + 同样的命令序列 = 完全相同的结果。
 */
export class World {
  readonly dt = DT;
  tick = 0;
  time = 0;
  readonly rng: Rng;
  readonly map: BuiltMap;
  readonly walls: WallField;
  readonly nav: NavGrid;
  readonly astar: AStar;
  readonly spatial: SpatialHash;
  readonly units = new Map<EntityId, Unit>();
  list: Unit[] = [];
  projectiles: Projectile[] = [];
  zones: Zone[] = [];
  pending: PendingArea[] = [];
  events: SimEvent[] = [];
  players: PlayerSlot[] = [];
  readonly debug = { noCooldown: false };
  private idSeq = 1;
  private castSeq = 1;

  constructor(readonly config: WorldConfig) {
    this.rng = new Rng(config.seed);
    const st = staticMap();
    this.map = st.map;
    this.walls = st.walls;
    this.nav = st.nav.clone();
    this.astar = new AStar(this.nav);
    this.spatial = new SpatialHash(this.map.size);
    this.setup();
  }

  // ————————————————————————— 基础 API —————————————————————————

  nextId(): EntityId {
    return this.idSeq++;
  }

  newCastId(): number {
    return this.castSeq++;
  }

  get(id: EntityId): Unit | undefined {
    return id ? this.units.get(id) : undefined;
  }

  emit(ev: SimEvent): void {
    this.events.push(ev);
  }

  /** 取出并清空累计的事件（表现层每帧调用） */
  drainEvents(): SimEvent[] {
    const ev = this.events;
    this.events = [];
    return ev;
  }

  heroOf(pid: number): Unit | undefined {
    const p = this.players.find((s) => s.pid === pid);
    return p ? this.get(p.unitId) : undefined;
  }

  // ————————————————————————— 生成 —————————————————————————

  private addUnit(u: Unit): Unit {
    this.units.set(u.id, u);
    this.list.push(u);
    return u;
  }

  private makeUnit(kind: UnitKind, team: Team, defId: string, name: string, pos: Vec2, radius: number, base: StatBlock): Unit {
    const u: Unit = {
      id: this.nextId(),
      kind,
      team,
      defId,
      name,
      pos: { ...pos },
      prevPos: { ...pos },
      facing: team === 0 ? -Math.PI / 4 : (Math.PI * 3) / 4,
      prevFacing: 0,
      radius,
      static: false,
      alive: true,
      hp: base.maxHp,
      mp: base.maxMp,
      baseStats: { ...base },
      stats: { ...base },
      bonusAd: 0,
      statsDirty: true,
      status: { stun: 0, airborne: 0, airborneTotal: 0, silence: 0, slows: [] },
      buffs: [],
      shields: [],
      forced: null,
      attack: { cd: 0, windup: 0, swingTarget: 0, orderTarget: 0, orderTime: 0, orderMode: 'auto' },
      cast: null,
      moveDir: null,
      navGoal: null,
      navPath: [],
      navRepathAt: 0,
      chaseTarget: 0,
      hero: null,
      innate: { untargetable: false, invulnerable: false, immortal: false },
      lastDamagedAt: -999,
      home: { ...pos },
      patrol: null,
      patrolIdx: 0,
      queuedCast: null,
      lane: null,
      rampTarget: 0,
      rampStacks: 0,
      recentAttackers: [],
      lockTarget: 0,
      bornAt: this.time,
    };
    u.prevFacing = u.facing;
    recomputeStats(u);
    u.hp = u.stats.maxHp;
    u.mp = u.stats.maxMp;
    return u;
  }

  spawnHero(cfg: PlayerConfig, level: number): Unit {
    const def = getHero(cfg.heroId);
    const pos = this.map.spawn[cfg.team];
    const base = statsAtLevel(def.base, def.growth, 1);
    const u = this.makeUnit('hero', cfg.team, def.id, def.name, pos, def.radius, base);
    u.hero = {
      pid: cfg.pid,
      level: 1,
      xp: 0,
      skillLevels: [0, 0, 0],
      skillPoints: 1,
      cooldowns: [0, 0, 0],
      cooldownTotals: [1, 1, 1],
      recast: [null, null, null],
      passiveStamp: def.passive.triggers.map(() => -1),
      gold: 0,
      kills: 0,
      deaths: 0,
      assists: 0,
      lastHits: 0,
      streak: 0,
      respawnAt: 0,
      damageDealt: 0,
      damageTaken: 0,
      recall: 0,
      summoner: { id: cfg.summoner ?? 'blink', cd: 0 },
      items: [null, null, null, null, null, null],
      goldEarned: 0,
      restoreCd: 0,
    };
    this.addUnit(u);
    for (let l = 1; l < level; l++) levelUp(this, u);
    recomputeStats(u);
    u.hp = u.stats.maxHp;
    u.mp = u.stats.maxMp;
    this.players.push({ ...cfg, unitId: u.id });
    return u;
  }

  spawnDummy(pos: Vec2, team: Team, patrol: Vec2[] | null = null): Unit {
    const def = DUMMY;
    const u = this.makeUnit('dummy', team, def.id, def.name, pos, def.radius, def.base);
    u.innate.immortal = true;
    u.patrol = patrol;
    return this.addUnit(u);
  }

  private spawnStructures(): void {
    for (const team of [0, 1] as const) {
      for (const t of this.map.towers[team]) {
        const def = TOWERS[t.tier];
        const u = this.makeUnit('tower', team, def.id, def.name, t.pos, def.radius, def.base);
        u.static = true;
        // M1 训练场：建筑只作为地图元素，不可选中、不会被破坏（M2 启用攻防）
        u.innate.untargetable = true;
        u.innate.invulnerable = true;
        this.addUnit(u);
        this.nav.setCircleObstacle(u.pos, u.radius, true);
      }
      const c = this.makeUnit('crystal', team, CRYSTAL.id, CRYSTAL.name, this.map.crystal[team], CRYSTAL.radius, CRYSTAL.base);
      c.static = true;
      c.innate.untargetable = true;
      c.innate.invulnerable = true;
      this.addUnit(c);
      this.nav.setCircleObstacle(c.pos, c.radius, true);
    }
  }

  private setup(): void {
    this.spawnStructures();
    const level = this.config.startLevel ?? 1;
    for (const p of this.config.players) {
      const u = this.spawnHero(p, level);
      // 训练场：自动学会每个技能 1 级，剩余技能点留给玩家分配；出生在木桩旁边
      if (this.config.mode === 'training') {
        for (const s of [0, 1, 2] as const) levelSkill(this, u, s);
        if (p.team === 0) {
          u.pos = { x: 24, y: 94 };
          u.prevPos = { ...u.pos };
          u.facing = -Math.PI / 4;
          u.prevFacing = u.facing;
        }
      }
    }
    if (this.config.mode === 'training') {
      // 中路基地前方的木桩群（测试范围技能与连招），以及一个来回走动的移动木桩（测试预判）
      this.spawnDummy({ x: 30, y: 88 }, 1);
      this.spawnDummy({ x: 32.6, y: 90.2 }, 1);
      this.spawnDummy({ x: 28.2, y: 85.4 }, 1);
      this.spawnDummy({ x: 36, y: 86 }, 1);
      this.spawnDummy({ x: 47, y: 69 }, 1, [
        { x: 47, y: 69 },
        { x: 54, y: 62 },
      ]);
    }
    // 出生时不产生事件噪音
    this.events = [];
  }

  // ————————————————————————— 推进 —————————————————————————

  step(commands: readonly Command[]): void {
    this.tick++;
    this.time = this.tick * this.dt;
    for (const u of this.list) {
      u.prevPos.x = u.pos.x;
      u.prevPos.y = u.pos.y;
      u.prevFacing = u.facing;
    }
    // 先建空间索引，命令里的索敌 / 自动瞄准才能查到最新位置
    this.spatial.rebuild(this.list);
    for (const c of commands) this.apply(c);

    updateCasts(this);
    updateUtility(this);
    updateAttacks(this);
    updateMovement(this);
    this.spatial.rebuild(this.list);
    separateUnits(this);
    updateProjectiles(this);
    updateZones(this);
    updateStatus(this);
    updateDummies(this);
  }

  private apply(c: Command): void {
    const u = this.heroOf(c.pid);
    if (!u) return;
    switch (c.t) {
      case 'move': {
        const d = c.dir ? norm(c.dir) : null;
        u.moveDir = d && (d.x !== 0 || d.y !== 0) ? d : null;
        if (u.moveDir) cancelRecall(this, u);
        return;
      }
      case 'moveTo':
        cancelRecall(this, u);
        u.moveDir = null;
        u.navGoal = { x: c.x, y: c.y };
        u.navPath = [];
        u.navRepathAt = 0;
        return;
      case 'stop':
        u.moveDir = null;
        u.navGoal = null;
        u.navPath = [];
        u.attack.orderTime = 0;
        return;
      case 'attack':
        cancelRecall(this, u);
        commandAttack(this, u, c.mode);
        return;
      case 'cast':
        cancelRecall(this, u);
        commandCast(this, u, c.slot, c.aim, c.phase);
        return;
      case 'recall':
        commandRecall(this, u);
        return;
      case 'restore':
        commandRestore(this, u);
        return;
      case 'summoner':
        commandSummoner(this, u, c.aim);
        return;
      case 'levelSkill':
        levelSkill(this, u, c.slot);
        return;
      case 'debug':
        this.applyDebug(u, c.op, c.value);
        return;
    }
  }

  private applyDebug(u: Unit, op: Extract<Command, { t: 'debug' }>['op'], value?: number): void {
    const h = u.hero;
    if (!h) return;
    switch (op) {
      case 'refreshCd':
        h.cooldowns = [0, 0, 0];
        h.summoner.cd = 0;
        h.restoreCd = 0;
        return;
      case 'noCooldown':
        this.debug.noCooldown = !!value;
        if (value) h.cooldowns = [0, 0, 0];
        return;
      case 'levelUp':
        levelUp(this, u);
        return;
      case 'maxLevel':
        while (levelUp(this, u));
        autoLevelSkills(this, u);
        return;
      case 'addGold':
        h.gold += value ?? 1000;
        return;
      case 'heal':
        u.hp = u.stats.maxHp;
        u.mp = u.stats.maxMp;
        return;
    }
  }

  /** 单位死亡（M1：只标记死亡；M2 加入赏金与复活） */
  killUnit(u: Unit, killer: Unit | null): void {
    if (!u.alive) return;
    u.alive = false;
    u.hp = 0;
    u.cast = null;
    u.forced = null;
    u.queuedCast = null;
    this.emit({ t: 'death', unit: u.id, killer: killer?.id ?? 0 });
  }

  /** 可序列化快照（联机同步 / 回放 / 确定性校验用） */
  snapshot(): string {
    return JSON.stringify({
      tick: this.tick,
      rng: this.rng.state,
      units: this.list,
      projectiles: this.projectiles,
      zones: this.zones,
      pending: this.pending,
    });
  }
}
