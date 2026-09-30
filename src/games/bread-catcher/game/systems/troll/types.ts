/**
 * Kiểu dùng chung cho logic troll (level HARD).
 */
import type Phaser from 'phaser';
import type { ItemTrickId } from '@/games/bread-catcher/game/config/troll';
import type { GameEventBus } from '@/games/bread-catcher/game/core/events';
import type FallingItem from '@/games/bread-catcher/game/objects/FallingItem';
import type PlayerBasket from '@/games/bread-catcher/game/objects/PlayerBasket';
import type { BreadAudio } from '@/games/bread-catcher/game/core/services';
import type EffectsSystem from '@/games/bread-catcher/game/systems/EffectsSystem';
import type InputController from '@/games/bread-catcher/game/systems/InputController';
import type LetterSpawnSystem from '@/games/bread-catcher/game/systems/LetterSpawnSystem';

/** Những gì trò troll được phép "động tay" vào */
export interface TrollContext {
  scene: Phaser.Scene;
  bus: GameEventBus;
  basket: PlayerBasket;
  controls: InputController;
  spawner: LetterSpawnSystem;
  effects: EffectsSystem;
  audio: BreadAudio;
}

// ---------------------------------------------------------------------------
// Prank toàn màn hình
// ---------------------------------------------------------------------------
export interface PrankRun {
  /** Prank kéo dài bao lâu (ms) trước khi hoàn tác */
  duration: number;
  /** Hoàn tác (gọi khi hết giờ hoặc khi bị huỷ giữa chừng) */
  undo?: () => void;
}

export type Prank = (ctx: TrollContext) => PrankRun;

// ---------------------------------------------------------------------------
// Trò của từng chữ rơi
// ---------------------------------------------------------------------------
/** Trạng thái trò troll gắn trên từng FallingItem */
export interface ItemTrickState {
  id: ItemTrickId;
  triggered: boolean;
  /** Thời gian đã rơi (ms) */
  elapsed: number;
  /** Thời gian lướt còn lại (ms) — dodge */
  dashRemaining: number;
}

export interface ItemTrick {
  /** Ngay khi được gán cho item */
  assign?: (item: FallingItem, ctx: TrollContext) => void;
  /** Mỗi frame khi item còn rơi */
  update?: (item: FallingItem, state: ItemTrickState, ctx: TrollContext, delta: number) => void;
  /** Trước khi rổ hứng; trả về true để HUỶ lần hứng này */
  interceptCatch?: (item: FallingItem, state: ItemTrickState, ctx: TrollContext) => boolean;
}
