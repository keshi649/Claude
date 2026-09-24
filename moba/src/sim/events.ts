import type { AreaVfx, CcKind, DamageType, Impact, IndicatorSpec, Shape } from '../data/schema';
import type { EntityId, Team } from './entity';

/**
 * 逻辑层产出的事件（每帧写入 world.events，由表现层消费）。
 * 表现层只读事件和状态，不回写逻辑。
 */
export type SimEvent =
  | {
      t: 'damage';
      src: EntityId;
      target: EntityId;
      amount: number;
      dtype: DamageType;
      crit: boolean;
      impact: Impact;
      isAttack: boolean;
      x: number;
      y: number;
    }
  | { t: 'heal'; target: EntityId; amount: number; x: number; y: number }
  | { t: 'shield'; target: EntityId; amount: number }
  | { t: 'attackStart'; unit: EntityId; target: EntityId; windup: number }
  | {
      t: 'castStart';
      unit: EntityId;
      slot: number;
      skillId: string;
      name: string;
      windup: number;
      dirX: number;
      dirY: number;
      x: number;
      y: number;
      targetId: EntityId;
      indicator: IndicatorSpec;
      color: number;
    }
  | { t: 'castFail'; unit: EntityId; reason: string }
  | {
      t: 'area';
      team: Team;
      owner: EntityId;
      x: number;
      y: number;
      dirX: number;
      dirY: number;
      shape: Shape;
      vfx: AreaVfx | null;
      /** >0 表示延迟生效的预警（秒） */
      warn: number;
    }
  | { t: 'cc'; target: EntityId; cc: CcKind; duration: number }
  | { t: 'blink'; unit: EntityId; fromX: number; fromY: number; toX: number; toY: number }
  | { t: 'dash'; unit: EntityId; trail: number }
  | { t: 'death'; unit: EntityId; killer: EntityId }
  | { t: 'levelUp'; unit: EntityId; level: number }
  | { t: 'skillUp'; unit: EntityId; slot: number; level: number }
  | { t: 'buffAdd'; unit: EntityId; buff: string }
  | { t: 'recall'; unit: EntityId; state: 'start' | 'cancel' | 'done'; duration: number }
  | { t: 'summoner'; unit: EntityId; id: string }
  /** 获得金币（补刀 / 击杀 / 推塔时在屏幕上弹出） */
  | { t: 'gold'; unit: EntityId; amount: number; x: number; y: number }
  /** 英雄被击杀（击杀播报用） */
  | {
      t: 'kill';
      killer: EntityId;
      victim: EntityId;
      assists: EntityId[];
      gold: number;
      firstBlood: boolean;
      /** 多杀数：2 = 双杀，3 = 三杀…… */
      multi: number;
      /** 击杀者当前连杀数 */
      streak: number;
      /** 终结了对方的连杀 */
      shutdown: boolean;
    }
  | { t: 'structureDown'; unit: EntityId; team: Team; killer: EntityId }
  | { t: 'respawn'; unit: EntityId }
  | { t: 'shop'; unit: EntityId; item: string; sold: boolean }
  | { t: 'gameOver'; winner: Team }
