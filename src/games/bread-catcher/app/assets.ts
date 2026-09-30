/**
 * Đường dẫn ảnh dùng trong UI React (cùng file với game — sinh bởi tools/build_sprites.py).
 */
import { ASSET_ROOT } from '@/games/bread-catcher/game/config/assets';
import type { MascotId } from '@/games/bread-catcher/session/types';

export const mascotUrl = (mascot: MascotId): string => `${ASSET_ROOT}/phonics/mascot_${mascot}.png`;

export const ICONS = {
  crown: `${ASSET_ROOT}/phonics/crown.png`,
} as const;
