/**
 * Event bus cho một lượt chơi. Các system phát event, HUD / GameScene lắng nghe.
 * `GameEventBus` là wrapper có kiểu cho Phaser EventEmitter: tên event và
 * payload được kiểm tra lúc compile.
 */
import Phaser from 'phaser';
import type { LevelUnlocks } from '@/game/config/levels';
import type FallingItem from '@/game/objects/FallingItem';

export type UnlockEntry = {
  [K in keyof LevelUnlocks]-?: { type: K; value: NonNullable<LevelUnlocks[K]> };
}[keyof LevelUnlocks];

export interface GameEventMap {
  'score-changed': { score: number; delta: number };
  'combo-changed': { multiplier: number; streak: number };
  'boost-changed': { active: boolean; multiplier: number; remaining: number; duration: number };
  'lives-changed': { lives: number; max: number; delta: number };
  /** Gộp nếu vượt nhiều level cùng lúc */
  'level-up': { level: number; unlocks: UnlockEntry[] };
  'progress-changed': { current: number; next: number; ratio: number };
  /** Rổ dính mốc trong `duration` ms */
  'basket-slowed': { duration: number };
  'item-spawned': FallingItem;
  /** Rổ vừa hứng item (trước khi item biến mất) */
  'item-caught': FallingItem;
  'item-missed': FallingItem;
}

export type GameEventName = keyof GameEventMap;

export class GameEventBus {
  private readonly emitter = new Phaser.Events.EventEmitter();

  emit<K extends GameEventName>(event: K, payload: GameEventMap[K]): void {
    this.emitter.emit(event, payload);
  }

  on<K extends GameEventName>(
    event: K,
    handler: (payload: GameEventMap[K]) => void,
    context?: unknown,
  ): this {
    this.emitter.on(event, handler, context);
    return this;
  }

  off<K extends GameEventName>(
    event: K,
    handler: (payload: GameEventMap[K]) => void,
    context?: unknown,
  ): this {
    this.emitter.off(event, handler, context);
    return this;
  }

  destroy(): void {
    this.emitter.removeAllListeners();
  }
}
