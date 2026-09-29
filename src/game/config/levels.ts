/**
 * Tiến trình level, độ khó, mở khoá và xác suất spawn.
 */
import { MUSIC, type MusicKey } from '@/game/config/assets';
import { ItemCategory, type ItemId } from '@/game/config/items';

export type BasketTier = 1 | 2 | 3 | 4;
export type StageId = 1 | 2 | 3;

export interface LevelUnlocks {
  /** Item bánh mới được thêm vào pool spawn */
  bread?: ItemId;
  basket?: BasketTier;
  /** Stage mới (background + nhạc) */
  stage?: StageId;
  /** Chỉ để hiển thị thông báo — xác suất thật nằm ở SPAWN_TABLES */
  rareBoost?: boolean;
}

export interface LevelDef {
  level: number;
  /** Tổng điểm cần để đạt level */
  minScore: number;
  /** Tốc độ rơi (px/s) */
  fallSpeed: number;
  /** Thời gian giữa 2 lần spawn (ms) */
  spawnInterval: number;
  unlocks: LevelUnlocks;
}

export const LEVELS: LevelDef[] = [
  {
    level: 1,
    minScore: 0,
    fallSpeed: 100,
    spawnInterval: 1200,
    unlocks: { bread: 'bread_01', basket: 1, stage: 1 },
  },
  { level: 2, minScore: 100, fallSpeed: 115, spawnInterval: 1100, unlocks: { bread: 'bread_02' } },
  { level: 3, minScore: 300, fallSpeed: 130, spawnInterval: 1000, unlocks: { basket: 2 } },
  { level: 4, minScore: 600, fallSpeed: 145, spawnInterval: 900, unlocks: { stage: 2 } },
  { level: 5, minScore: 1000, fallSpeed: 160, spawnInterval: 850, unlocks: { bread: 'bread_03' } },
  { level: 6, minScore: 1500, fallSpeed: 175, spawnInterval: 800, unlocks: { basket: 3 } },
  { level: 7, minScore: 2100, fallSpeed: 190, spawnInterval: 750, unlocks: { rareBoost: true } },
  { level: 8, minScore: 2800, fallSpeed: 205, spawnInterval: 700, unlocks: { stage: 3 } },
  { level: 9, minScore: 3600, fallSpeed: 215, spawnInterval: 680, unlocks: { bread: 'bread_04' } },
  { level: 10, minScore: 4500, fallSpeed: 225, spawnInterval: 660, unlocks: { basket: 4 } },
];

/** Sau LV10: mỗi `scoreStep` điểm lên 1 level, độ khó tăng dần tới giới hạn */
export const ENDLESS = {
  scoreStep: 1000,
  fallSpeedStep: 10,
  spawnIntervalStep: 20,
  maxFallSpeed: 330,
  minSpawnInterval: 550,
} as const;

export const BASKETS: Record<BasketTier, { texture: string; hitWidth: number }> = {
  1: { texture: 'basket_01', hitWidth: 74 },
  2: { texture: 'basket_02', hitWidth: 82 },
  3: { texture: 'basket_03', hitWidth: 90 },
  4: { texture: 'basket_04', hitWidth: 100 },
};

export const STAGES: Record<StageId, { name: string; background: string; music: MusicKey }> = {
  1: { name: 'COZY KITCHEN', background: 'bg_bakery_01', music: MUSIC.STAGE_1 },
  2: { name: 'VILLAGE BAKERY', background: 'bg_bakery_02', music: MUSIC.STAGE_2 },
  3: { name: 'PASTRY SHOP', background: 'bg_bakery_03', music: MUSIC.STAGE_3 },
};

export type SpawnWeights = Record<ItemCategory, number>;

/** Trọng số spawn theo nhóm; áp dụng bảng có fromLevel lớn nhất <= level hiện tại */
export const SPAWN_TABLES: { fromLevel: number; weights: SpawnWeights }[] = [
  {
    fromLevel: 1,
    weights: {
      [ItemCategory.BREAD]: 85,
      [ItemCategory.BONUS]: 8,
      [ItemCategory.BAD]: 5,
      [ItemCategory.RARE]: 2,
    },
  },
  {
    fromLevel: 5,
    weights: {
      [ItemCategory.BREAD]: 75,
      [ItemCategory.BONUS]: 10,
      [ItemCategory.BAD]: 10,
      [ItemCategory.RARE]: 5,
    },
  },
  {
    fromLevel: 7,
    weights: {
      [ItemCategory.BREAD]: 72,
      [ItemCategory.BONUS]: 10,
      [ItemCategory.BAD]: 10,
      [ItemCategory.RARE]: 8,
    },
  },
];
