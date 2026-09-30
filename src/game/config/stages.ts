/**
 * Hình ảnh / nhạc theo cấp độ và phần thưởng hình ảnh trong lượt chơi
 * (tái sử dụng 3 background, 4 tier rổ, 4 kiểu bánh — plan §29).
 */
import { MUSIC, type MusicKey } from '@/game/config/assets';
import type { LevelId } from '@/session/types';

export type BasketTier = 1 | 2 | 3 | 4;

export const BASKET_TEXTURES: Record<BasketTier, string> = {
  1: 'basket_01',
  2: 'basket_02',
  3: 'basket_03',
  4: 'basket_04',
};

/** Rổ "lên đời" theo số từ đúng trong lượt: 0 -> 1, 1-2 -> 2, 3-4 -> 3, 5 -> 4 */
export function basketTierFor(correctWords: number): BasketTier {
  if (correctWords >= 5) return 4;
  if (correctWords >= 3) return 3;
  if (correctWords >= 1) return 2;
  return 1;
}

/** 4 kiểu bánh chữ (tròn / baguette / loaf / premium) */
export const LETTER_BREADS = ['letter_bread_01', 'letter_bread_02', 'letter_bread_03', 'letter_bread_04'];

export interface StageDef {
  background: string;
  music: MusicKey;
}

export const STAGE_BACKGROUNDS = ['bg_bakery_01', 'bg_bakery_02', 'bg_bakery_03'] as const;

/** Gentle/Easy: Bakery Kitchen · Normal: Village Bakery · Fast/Hard: Premium Bakery */
export const LEVEL_STAGES: Record<LevelId, StageDef> = {
  gentle: { background: 'bg_bakery_01', music: MUSIC.GAMEPLAY_EASY },
  easy: { background: 'bg_bakery_01', music: MUSIC.GAMEPLAY_EASY },
  normal: { background: 'bg_bakery_02', music: MUSIC.GAMEPLAY_NORMAL },
  fast: { background: 'bg_bakery_03', music: MUSIC.GAMEPLAY_NORMAL },
  hard: { background: 'bg_bakery_03', music: MUSIC.GAMEPLAY_NORMAL },
};
