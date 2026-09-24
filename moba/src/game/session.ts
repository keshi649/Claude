import { Sfx, type SfxName } from '../audio/sfx';
import { FixedStepLoop } from '../core/loop';
import { BALANCE } from '../data/balance';
import { getHero } from '../data/heroes';
import { CommandMapper, liveSnapshot, stageOf } from '../input/commandMapper';
import { KeyboardMouse } from '../input/keyboardMouse';
import { InputState } from '../input/state';
import { GameRenderer, type AimRender } from '../render/renderer';
import type { Command } from '../sim/commands';
import type { SimEvent } from '../sim/events';
import { World, type WorldConfig } from '../sim/world';
import { DebugPanel } from '../ui/debugPanel';
import { Hud } from '../ui/hud';
import { AIDirector, makeLineup, type Lineup } from '../sim/ai/director';
import type { Difficulty } from '../sim/ai/difficulty';
import { ShopPanel } from '../ui/shop';
import { Scoreboard } from '../ui/scoreboard';
import { checkBuy, nextRecommended } from '../sim/shop';
import { getItem } from '../data/items';
import { BOSSES } from '../data/monsters';
import { getUnitDef } from '../data/units';
import { summarize, type MatchSummary } from '../sim/summary';
import { Announcer } from '../ui/announcer';

const PLAYER_PID = 1;

/** 5v5 阵容：玩家在蓝方，友军 AI 普通难度，敌方 AI 用所选难度 */
export function sessionLineup(o: { seed: number; heroId: string; summoner?: string; difficulty?: Difficulty }): Lineup {
  return makeLineup({
    seed: o.seed,
    playerHero: o.heroId,
    playerSummoner: o.summoner,
    allyDifficulty: 'normal',
    enemyDifficulty: o.difficulty ?? 'normal',
  });
}

export interface SessionOptions extends Omit<WorldConfig, 'players'> {
  heroId: string;
  summoner?: string;
  /** 敌方 AI 难度 */
  difficulty?: Difficulty;
  /** 正式对局里只有玩家一人（调试用） */
  solo?: boolean;
  /** 预先生成好的 5v5 阵容（加载界面要先显示阵容）；不传则按种子生成 */
  lineup?: Lineup;
  /** 全局共用的音效（避免每局重复创建 AudioContext） */
  sfx: Sfx;
  /** 对局结束、看完“胜利 / 失败”后调用 */
  onEnd?: (summary: MatchSummary) => void;
  /** 玩家在设置里退出对局 */
  onQuit?: () => void;
}

/**
 * 一局游戏：把逻辑（World）、渲染、输入、界面、音效串起来。
 * 每帧：输入 → 命令队列 → 固定步长推进逻辑 → 消费事件（打击感 / 音效 / 提示）→ 插值渲染 → 更新界面。
 */
export class GameSession {
  readonly world: World;
  private renderer: GameRenderer;
  private input = new InputState();
  private mapper = new CommandMapper(PLAYER_PID);
  private keyboard: KeyboardMouse;
  private readonly sfx: Sfx;
  private hud!: Hud;
  private announcer!: Announcer;
  private gameEl: HTMLElement | null = null;
  private vignette: HTMLElement | null = null;
  private ended = false;
  private shop!: ShopPanel;
  private scoreboard!: Scoreboard;
  private debug!: DebugPanel;
  private loop: FixedStepLoop;
  private pending: Command[] = [];
  private raf = 0;
  private last = 0;
  private fps = 60;
  private stepMs = 0;
  private minimapAt = 0;
  private quickBuyAt = 0;

  private ai: AIDirector | null = null;

  constructor(
    private readonly container: HTMLElement,
    private readonly cfg: SessionOptions,
  ) {
    this.sfx = cfg.sfx;
    if (cfg.mode === 'match' && !cfg.solo) {
      // 5v5：玩家 + 4 个 AI 队友 对 5 个 AI 敌人
      const lineup = cfg.lineup ?? sessionLineup(cfg);
      this.world = new World({ seed: cfg.seed, mode: cfg.mode, startLevel: cfg.startLevel, players: lineup.players });
      this.ai = new AIDirector(this.world, lineup.difficulties, lineup.positions);
    } else {
      this.world = new World({
        seed: cfg.seed,
        mode: cfg.mode,
        startLevel: cfg.startLevel,
        players: [{ pid: PLAYER_PID, team: 0, heroId: cfg.heroId, name: '玩家', isAI: false, summoner: cfg.summoner }],
      });
    }
    const hero = this.world.heroOf(PLAYER_PID)!;
    this.renderer = new GameRenderer(this.world, hero.id);
    this.loop = new FixedStepLoop(BALANCE.tickRate, () => {
      const t0 = performance.now();
      const aiCmds = this.ai ? this.ai.think(this.world) : [];
      this.world.step(aiCmds.length ? [...this.pending, ...aiCmds] : this.pending);
      this.pending = [];
      this.stepMs = this.stepMs * 0.9 + (performance.now() - t0) * 0.1;
    });
    this.keyboard = new KeyboardMouse(this.input, {
      onToggleDebug: () => this.debug.toggle(),
      onShop: () => this.shop.toggle(),
      onScoreboard: (show) => this.scoreboard.toggle(show),
    });
  }

  async start(): Promise<void> {
    const hero = this.world.heroOf(PLAYER_PID)!;
    const gameEl = document.createElement('div');
    gameEl.id = 'game';
    this.container.appendChild(gameEl);
    this.gameEl = gameEl;
    await this.renderer.init(gameEl);
    const vignette = document.createElement('div');
    vignette.id = 'vignette';
    this.container.appendChild(vignette);
    this.vignette = vignette;

    this.hud = new Hud(this.container, this.world, hero, this.input, {
      onAttack: (a, f, t) => this.keyboard.setTouchAttack(a, f, t),
      onShop: () => this.shop.toggle(),
      onScoreboard: () => this.scoreboard.toggle(),
      onQuickBuy: () => this.pending.push({ t: 'buyRecommended', pid: PLAYER_PID }),
      onToggleDebug: () => this.debug.toggle(),
      onToggleMute: () => {
        this.sfx.setMuted(!this.sfx.muted);
        return this.sfx.muted;
      },
      isMuted: () => this.sfx.muted,
      onQuit: () => this.cfg.onQuit?.(),
    });
    this.announcer = new Announcer(this.hud.root, (n, v) => this.sfx.play(n, v));
    this.shop = new ShopPanel(
      this.hud.root,
      (item) => this.pending.push({ t: 'buy', pid: PLAYER_PID, item }),
      (slot) => this.pending.push({ t: 'sell', pid: PLAYER_PID, slot }),
    );
    this.scoreboard = new Scoreboard(this.hud.root);
    this.debug = new DebugPanel(
      this.hud.root,
      (s) => {
        this.renderer.debugOptions = { colliders: s.colliders, paths: s.paths, vision: s.vision };
        this.renderer.aiInfo = s.aiDecisions && this.ai ? (id) => this.ai!.brainOf(id)?.debugText ?? null : null;
        this.loop.timeScale = s.fast ? 4 : 1;
      },
      (op, value) => this.pending.push({ t: 'debug', pid: PLAYER_PID, op, value }),
    );

    // 调试：点击地图寻路
    gameEl.addEventListener('pointerdown', (e) => {
      if (!this.debug.state.clickPath) return;
      const p = this.renderer.camera.screenToWorld(e.clientX, e.clientY);
      this.input.actions.push({ k: 'moveTo', x: p.x, y: p.y });
    });

    window.addEventListener('resize', this.onResize);
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.frame);
  }

  private onResize = (): void => {
    this.renderer.resize();
  };

  /** 事件 → 音效（按与自己英雄的距离衰减） */
  private playSounds(events: readonly SimEvent[], heroId: number): void {
    const w = this.world;
    const me = w.get(heroId);
    const vol = (x: number, y: number): number => {
      if (!me) return 0.5;
      const d = Math.hypot(x - me.pos.x, y - me.pos.y);
      return Math.max(0, 1 - d / 22);
    };
    const play = (n: SfxName, x: number, y: number, k = 1): void => this.sfx.play(n, vol(x, y) * k);
    for (const e of events) {
      switch (e.t) {
        case 'damage': {
          const mine = e.src === heroId || e.target === heroId;
          const k = mine ? 1 : 0.5;
          if (e.crit) play('crit', e.x, e.y, k);
          else if (e.impact >= 2) play('heavy', e.x, e.y, k);
          else play('hit', e.x, e.y, k * (e.isAttack ? 0.8 : 1));
          break;
        }
        case 'attackStart': {
          const u = w.get(e.unit);
          if (u && u.kind === 'hero') play(getHero(u.defId).attack.projectile ? 'shoot' : 'swing', u.pos.x, u.pos.y, 0.8);
          break;
        }
        case 'castStart': {
          const u = w.get(e.unit);
          if (u) play('skill', u.pos.x, u.pos.y);
          break;
        }
        case 'dash': {
          const u = w.get(e.unit);
          if (u) play('dash', u.pos.x, u.pos.y);
          break;
        }
        case 'blink':
          play('blink', e.toX, e.toY);
          break;
        case 'area':
          if (e.warn === 0 && e.vfx?.style === 'slam') play('slam', e.x, e.y);
          break;
        case 'levelUp':
          if (e.unit === heroId) this.sfx.play('levelup', 1);
          break;
        case 'shop':
          if (e.unit === heroId) this.sfx.play('click', 1);
          break;
        case 'castFail':
          if (e.unit === heroId) this.sfx.play('fail', 0.6);
          break;
        case 'recall':
          if (e.unit === heroId && e.state !== 'cancel') this.sfx.play('recall', 0.8);
          break;
        case 'death': {
          const u = w.get(e.unit);
          if (u && u.kind === 'hero') play('death', u.pos.x, u.pos.y);
          break;
        }
        case 'structureDown': {
          const u = w.get(e.unit);
          // 建筑爆炸全图都听得到，只是远处轻一些
          if (u) this.sfx.play('explosion', u.kind === 'crystal' ? 1 : Math.max(0.35, vol(u.pos.x, u.pos.y)));
          break;
        }
        default:
          break;
      }
    }
  }

  private frame = (now: number): void => {
    this.raf = requestAnimationFrame(this.frame);
    const dt = now - this.last;
    this.last = now;
    if (dt > 0) this.fps = this.fps * 0.95 + (1000 / dt) * 0.05;

    const w = this.world;
    const hero = w.heroOf(PLAYER_PID);
    const cam = this.renderer.camera;
    const ms = this.input.mouseScreen;
    this.input.mouseWorld = ms ? cam.screenToWorld(ms.x, ms.y) : null;

    this.pending.push(...this.mapper.build(this.input, w, hero));
    const { alpha } = this.loop.advance(dt);

    const events = w.drainEvents();
    for (const e of events) {
      if (e.t === 'castFail' && hero && e.unit === hero.id) this.hud.toast(e.reason);
      if (e.t === 'recall' && hero && e.unit === hero.id && e.state === 'cancel') this.hud.toast('回城被打断');
      if (e.t === 'kill' && hero) {
        this.hud.pushKill(w, e.killer, e.victim, hero.team);
        this.announcer.onKill(w, e, hero.team, hero.id);
        if (e.victim === hero.id) this.hud.setDeathInfo(w, e.killer, e.assists);
      }
      if (e.t === 'structureDown' && hero && w.get(e.unit)?.kind === 'tower') {
        const mine = e.team === hero.team;
        this.announcer.pushText(mine ? '我方防御塔被摧毁' : '摧毁敌方防御塔', mine ? '守住下一座塔' : '全队获得金币', !mine);
      }
      if (e.t === 'gameOver' && hero) this.onGameOver(e.winner === hero.team);
      if (e.t === 'campSpawn' && (e.kind === 'turtle' || e.kind === 'dragon')) {
        const name = getUnitDef(e.def).name;
        const where = e.kind === 'turtle' ? '上河道' : '下河道';
        // 进化形态用大播报，普通形态用提示
        if (e.def === 'ancient_turtle' || e.def === 'storm_dragon') this.announcer.pushText(`${name}降临${where}`, '击败它，全队获得强力增益', true);
        else this.hud.toast(`${name}出现在${where}`);
      }
      if (e.t === 'bossKilled' && hero) {
        const name = getUnitDef(e.boss).name;
        const mine = e.team === hero.team;
        const sub: Record<string, string> = {
          turtle: '全队获得金币与经验',
          ancient_turtle: '全队获得金币经验与古龟庇佑',
          dragon: '霆角先锋出击',
          storm_dragon: '霆角先锋出击，全队获得雷霆之力',
        };
        this.announcer.pushText(`${mine ? '我方' : '敌方'}击败${name}`, sub[e.boss] ?? '', mine);
      }
    }
    this.renderer.handleEvents(events);
    this.announcer.tick(now);
    if (hero) this.structureAlerts(hero.team, now);
    this.bossWarnings();
    this.vignette?.classList.toggle('danger', this.renderer.selfLocked);
    if (hero && w.config.mode === 'training') this.trackDps(events, hero.id, now);
    if (hero) this.playSounds(events, hero.id);

    let aim: AimRender | null = null;
    const snap = liveSnapshot(this.input);
    if (hero && snap && this.input.aiming) {
      const slot = this.input.aiming.slot;
      if (slot === 3 || hero.hero!.skillLevels[slot] > 0) {
        aim = { stage: stageOf(hero, slot), preview: this.mapper.preview(w, hero, slot, snap), cancel: this.input.aiming.cancel };
      }
    }
    this.renderer.render(alpha, aim);
    if (hero) {
      this.hud.update(w, hero, this.fps);
      this.shop.update(hero);
      this.scoreboard.update(w, hero.id);
      if (now - this.quickBuyAt > 200) {
        this.quickBuyAt = now;
        const rec = w.config.mode === 'match' && hero.alive ? nextRecommended(hero) : null;
        if (rec) {
          const it = getItem(rec);
          this.hud.setQuickBuy({ id: rec, name: it.name, glyph: it.glyph, color: it.color, price: checkBuy(hero, rec).price });
        } else this.hud.setQuickBuy(null);
      }
    }
    if (now - this.minimapAt > 100 && hero) {
      this.minimapAt = now;
      this.hud.minimap.draw(w, hero.id, cam.viewRect(0), this.renderer.fogCanvasForMinimap);
    }
    this.debug.setStats(
      [
        `FPS ${this.fps.toFixed(0)}  逻辑帧 ${w.tick}`,
        `单帧逻辑耗时 ${this.stepMs.toFixed(2)} ms`,
        `单位 ${w.list.filter((u) => u.alive).length}  弹道 ${w.projectiles.length}  区域 ${w.zones.length}`,
        `A* 上次展开 ${w.astar.lastExpanded} 格`,
        hero ? `位置 (${hero.pos.x.toFixed(1)}, ${hero.pos.y.toFixed(1)})` : '',
      ].join('\n'),
    );
  };

  /** 训练场伤害统计：最近 5 秒伤害、DPS、总伤害 */
  private dpsLog: { t: number; v: number }[] = [];
  private dpsTotal = 0;
  private trackDps(events: readonly SimEvent[], heroId: number, now: number): void {
    for (const e of events) if (e.t === 'damage' && e.src === heroId) {
      this.dpsLog.push({ t: now, v: e.amount });
      this.dpsTotal += e.amount;
    }
    this.dpsLog = this.dpsLog.filter((x) => now - x.t < 5000);
    const recent = this.dpsLog.reduce((s, x) => s + x.v, 0);
    const span = this.dpsLog.length ? Math.max(1, (now - this.dpsLog[0]!.t) / 1000) : 1;
    this.hud.setDps(`5 秒伤害 ${Math.round(recent)} · DPS ${Math.round(recent / span)} · 总计 ${Math.round(this.dpsTotal)}`, () => {
      this.dpsTotal = 0;
      this.dpsLog = [];
    });
  }

  /** Boss 刷新前 30 秒提示（每次刷新只提示一次） */
  private warned = new Set<string>();
  private bossWarnings(): void {
    const w = this.world;
    for (const c of w.camps) {
      if ((c.kind !== 'turtle' && c.kind !== 'dragon') || c.spawnAt <= 0) continue;
      const left = c.spawnAt - w.time;
      const key = `${c.kind}:${c.spawnAt}`;
      if (left > 0 && left <= 30 && !this.warned.has(key)) {
        this.warned.add(key);
        const b = BOSSES[c.kind];
        const name = getUnitDef(c.spawnAt >= b.evolveAt ? b.evolved : b.def).name;
        this.hud.toast(`${name}将在 30 秒后出现`);
      }
    }
  }

  /** 己方建筑被攻击时提示（同一座建筑 20 秒内只提示一次） */
  private alertAt = new Map<number, number>();
  private alertCheckAt = 0;
  private structureAlerts(team: number, now: number): void {
    if (now - this.alertCheckAt < 250) return;
    this.alertCheckAt = now;
    const w = this.world;
    for (const u of w.list) {
      if ((u.kind !== 'tower' && u.kind !== 'crystal') || !u.alive || u.team !== team) continue;
      if (w.time - u.lastDamagedAt > 1 || w.get(u.lastAttacker)?.team === team) continue;
      if (now - (this.alertAt.get(u.id) ?? -1e9) < 20000) continue;
      this.alertAt.set(u.id, now);
      this.hud.toast(u.kind === 'crystal' ? '我方水晶正在被攻击！' : '我方防御塔正在被攻击');
      this.sfx.play('warning', 0.8);
    }
  }

  /** 对局结束：镜头移到被摧毁的水晶，爆炸之后再显示“胜利 / 失败” */
  private onGameOver(win: boolean): void {
    if (this.ended) return;
    this.ended = true;
    const w = this.world;
    const crystal = w.list.find((u) => u.kind === 'crystal' && !u.alive);
    if (crystal) this.renderer.focus = { x: crystal.pos.x, y: crystal.pos.y };
    const summary = summarize(w);
    window.setTimeout(() => {
      this.sfx.play(win ? 'victory' : 'defeat', 1);
      this.hud.showEnd(win, () => this.cfg.onEnd?.(summary));
    }, 2600);
  }

  destroy(): void {
    cancelAnimationFrame(this.raf);
    window.removeEventListener('resize', this.onResize);
    this.keyboard.destroy();
    this.hud?.destroy();
    this.renderer.destroy();
    this.gameEl?.remove();
    this.vignette?.remove();
  }
}
