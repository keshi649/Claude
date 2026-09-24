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
  | { t: 'buffAdd'; unit: EntityId; buff: string };
