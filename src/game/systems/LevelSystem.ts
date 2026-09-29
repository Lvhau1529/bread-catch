/**
 * Level, độ khó theo level, trạng thái mở khoá và bảng xác suất spawn.
 * Level chỉ tăng, không giảm kể cả khi điểm bị trừ.
 */
import {
  ENDLESS,
  LEVELS,
  SPAWN_TABLES,
  type BasketTier,
  type LevelDef,
  type SpawnWeights,
  type StageId,
} from '@/game/config/levels';
import type { ItemId } from '@/game/config/items';
import type { GameEventBus, GameEventMap, UnlockEntry } from '@/game/core/events';

const LAST_DEFINED = LEVELS[LEVELS.length - 1];

/** Định nghĩa level (kể cả level vô tận sau LV10) */
export function getLevelDef(level: number): LevelDef {
  if (level <= LEVELS.length) return LEVELS[level - 1];

  const extra = level - LAST_DEFINED.level;
  return {
    level,
    minScore: LAST_DEFINED.minScore + extra * ENDLESS.scoreStep,
    fallSpeed: Math.min(ENDLESS.maxFallSpeed, LAST_DEFINED.fallSpeed + extra * ENDLESS.fallSpeedStep),
    spawnInterval: Math.max(
      ENDLESS.minSpawnInterval,
      LAST_DEFINED.spawnInterval - extra * ENDLESS.spawnIntervalStep,
    ),
    unlocks: {},
  };
}

/** Chuyển object unlocks của một level thành danh sách [{ type, value }] */
const listUnlocks = (def: LevelDef): UnlockEntry[] =>
  Object.entries(def.unlocks).map(([type, value]) => ({ type, value }) as UnlockEntry);

export interface UnlockState {
  breads: ItemId[];
  basket: BasketTier;
  stage: StageId;
}

export default class LevelSystem {
  level = 1;
  readonly unlocked: UnlockState = { breads: [], basket: 1, stage: 1 };

  constructor(private readonly bus: GameEventBus) {
    this.applyUnlocks(getLevelDef(1));
  }

  get current(): LevelDef {
    return getLevelDef(this.level);
  }

  get next(): LevelDef {
    return getLevelDef(this.level + 1);
  }

  get spawnWeights(): SpawnWeights {
    const table = [...SPAWN_TABLES].reverse().find((t) => this.level >= t.fromLevel);
    return (table ?? SPAWN_TABLES[0]).weights;
  }

  /** Gọi mỗi khi điểm thay đổi; phát `level-up` (gộp nếu vượt nhiều level) */
  handleScore(score: number): void {
    const unlocks: UnlockEntry[] = [];
    let leveledUp = false;
    while (score >= this.next.minScore) {
      this.level += 1;
      leveledUp = true;
      this.applyUnlocks(this.current);
      unlocks.push(...listUnlocks(this.current));
    }
    if (leveledUp) this.bus.emit('level-up', { level: this.level, unlocks });
    this.bus.emit('progress-changed', this.getProgress(score));
  }

  getProgress(score: number): GameEventMap['progress-changed'] {
    const from = this.current.minScore;
    const to = this.next.minScore;
    return {
      current: score,
      next: to,
      ratio: Math.min(1, Math.max(0, (score - from) / (to - from))),
    };
  }

  private applyUnlocks(def: LevelDef): void {
    const { bread, basket, stage } = def.unlocks;
    if (bread) this.unlocked.breads.push(bread);
    if (basket) this.unlocked.basket = basket;
    if (stage) this.unlocked.stage = stage;
  }
}
