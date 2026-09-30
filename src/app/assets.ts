/**
 * Đường dẫn ảnh dùng trong UI React (cùng file với game — sinh bởi tools/build_sprites.py).
 */
import type { MascotId } from '@/session/types';

export const mascotUrl = (mascot: MascotId): string => `assets/phonics/mascot_${mascot}.png`;

export const ICONS = {
  soundOn: 'assets/ui/icon_sound.png',
  soundOff: 'assets/ui/icon_sound_off.png',
  crown: 'assets/phonics/crown.png',
} as const;
