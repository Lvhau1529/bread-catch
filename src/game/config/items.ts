/**
 * Định nghĩa vật phẩm rơi.
 *
 * - category:    nhóm dùng cho bảng xác suất spawn (levels.ts > SPAWN_TABLES)
 * - score:       điểm cộng/trừ khi hứng (combo & star chỉ nhân điểm dương)
 * - effect:      hiệu ứng đặc biệt khi hứng
 * - weight:      trọng số khi chọn item trong cùng một pool
 * - missPenalty: bỏ lỡ item này thì mất 1 mạng + reset combo
 * - sfx:         âm thanh khi hứng (mặc định: bread_catch)
 */
import { SFX, type SfxKey } from '@/game/config/assets';

export enum ItemCategory {
  BREAD = 'bread',
  BONUS = 'bonus',
  RARE = 'rare',
  BAD = 'bad',
}

export type ItemEffect =
  | { type: 'score-boost'; multiplier: number; duration: number }
  | { type: 'heal'; amount: number }
  | { type: 'slow'; speedMultiplier: number; duration: number }
  | { type: 'damage'; amount: number };

export interface ItemDef {
  texture: string;
  category: ItemCategory;
  score: number;
  weight: number;
  missPenalty?: boolean;
  effect?: ItemEffect;
  sfx?: SfxKey;
}

export const ITEMS = {
  // Bread — mở khoá theo level (levels.ts)
  bread_01: { texture: 'bread_01', category: ItemCategory.BREAD, score: 10, weight: 4, missPenalty: true },
  bread_02: { texture: 'bread_02', category: ItemCategory.BREAD, score: 15, weight: 3, missPenalty: true },
  bread_03: { texture: 'bread_03', category: ItemCategory.BREAD, score: 20, weight: 2, missPenalty: true },
  bread_04: { texture: 'bread_04', category: ItemCategory.BREAD, score: 30, weight: 2, missPenalty: true },

  // Bonus
  butter: { texture: 'butter', category: ItemCategory.BONUS, score: 25, weight: 1 },
  jam: { texture: 'jam', category: ItemCategory.BONUS, score: 30, weight: 1 },
  cheese: { texture: 'cheese', category: ItemCategory.BONUS, score: 20, weight: 1 },
  wheat: { texture: 'wheat', category: ItemCategory.BONUS, score: 20, weight: 1 },

  // Rare
  coin: { texture: 'coin', category: ItemCategory.RARE, score: 50, weight: 3, sfx: SFX.COIN },
  star: {
    texture: 'star',
    category: ItemCategory.RARE,
    score: 0,
    weight: 2,
    sfx: SFX.STAR,
    effect: { type: 'score-boost', multiplier: 2, duration: 5000 },
  },
  heart: {
    texture: 'heart',
    category: ItemCategory.RARE,
    score: 0,
    weight: 2,
    sfx: SFX.HEART,
    effect: { type: 'heal', amount: 1 },
  },

  // Bad
  bread_burnt: {
    texture: 'bread_burnt',
    category: ItemCategory.BAD,
    score: -20,
    weight: 2,
    sfx: SFX.BAD_ITEM,
  },
  bread_moldy: {
    texture: 'bread_moldy',
    category: ItemCategory.BAD,
    score: 0,
    weight: 2,
    sfx: SFX.BAD_ITEM,
    // Tốc độ rổ = 70% tốc độ cơ bản cho MỌI kiểu điều khiển (xem PlayerBasket.move)
    effect: { type: 'slow', speedMultiplier: 0.7, duration: 3000 },
  },
  egg_broken: {
    texture: 'egg_broken',
    category: ItemCategory.BAD,
    score: 0,
    weight: 1,
    sfx: SFX.BAD_ITEM,
    effect: { type: 'damage', amount: 1 },
  },

  // Chỉ do Bombardiro Crocodilo (TROLL MODE) thả — không nằm trong SPAWN_POOLS
  bomb: {
    texture: 'bomb',
    category: ItemCategory.BAD,
    score: 0,
    weight: 0,
    sfx: SFX.BAD_ITEM,
    effect: { type: 'damage', amount: 1 },
  },
} satisfies Record<string, ItemDef>;

export type ItemId = keyof typeof ITEMS;

/**
 * Item nào có thể xuất hiện trong mỗi nhóm spawn.
 * Bread được lọc thêm theo tier đã mở khoá; Premium Bread còn xuất hiện
 * như item hiếm trước khi được mở khoá chính thức (LV9).
 */
export const SPAWN_POOLS: Record<ItemCategory, ItemId[]> = {
  [ItemCategory.BREAD]: ['bread_01', 'bread_02', 'bread_03', 'bread_04'],
  [ItemCategory.BONUS]: ['butter', 'jam', 'cheese', 'wheat'],
  [ItemCategory.RARE]: ['coin', 'star', 'heart', 'bread_04'],
  [ItemCategory.BAD]: ['bread_burnt', 'bread_moldy', 'egg_broken'],
};

export const getItemDef = (id: ItemId): ItemDef => ITEMS[id];
