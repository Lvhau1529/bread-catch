/**
 * Event bus cho một lượt chơi. Các system phát event, HUD / ô từ / troll lắng nghe.
 * `GameEventBus` là wrapper có kiểu cho Phaser EventEmitter: tên event và
 * payload được kiểm tra lúc compile.
 */
import Phaser from 'phaser';
import type FallingItem from '@/games/bread-catcher/game/objects/FallingItem';
import type { TargetSupport } from '@/games/bread-catcher/session/types';

export interface GameEventMap {
  'score-changed': { score: number; delta: number };
  'timer-changed': { remainingMs: number; totalMs: number };
  /** Bắt đầu một từ mục tiêu mới */
  'word-started': { word: string; index: number; total: number; support: TargetSupport };
  /** Chữ thứ `index` của từ vừa được hứng đúng */
  'letter-filled': { index: number; letter: string };
  /** Từ kết thúc (đúng hết / hứng nhầm) */
  'word-finished': { word: string; correct: boolean };
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
