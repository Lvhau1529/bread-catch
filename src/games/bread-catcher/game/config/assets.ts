/**
 * Khai báo asset của Bread Catcher (thư mục `public/assets/bread-catcher/`):
 * texture được đọc từ `sprites.json` (sinh bởi tools/build_sprites.py), nhạc nền lấy từ resource pack
 * (tools/build_audio.py) — volume theo audio_manifest.json. SFX dùng thư viện chung (platform/audio/sfx.ts).
 */
import type { MascotId } from '@/games/bread-catcher/session/types';
import { audioUrls } from '@/platform/audio/sfx';

/** Thư mục asset của game (tương đối với trang) */
export const ASSET_ROOT = 'assets/bread-catcher';

export const SPRITE_MANIFEST = { key: 'sprites', url: `${ASSET_ROOT}/sprites.json` } as const;

/** Một entry trong sprites.json (`path` tương đối với trang) */
export interface SpriteInfo {
  path: string;
  width: number;
  height: number;
}

export type SpriteManifest = Record<string, SpriteInfo>;

export const MUSIC = {
  MENU: 'bgm_menu',
  TURN_PICKER: 'bgm_turn_picker',
  GAMEPLAY_EASY: 'bgm_gameplay_easy',
  GAMEPLAY_NORMAL: 'bgm_gameplay_normal',
  RESULTS: 'bgm_results',
  GIFT: 'bgm_gift',
} as const;
export type MusicKey = (typeof MUSIC)[keyof typeof MUSIC];

export const MUSIC_VOLUME: Record<MusicKey, number> = {
  bgm_menu: 0.22,
  bgm_turn_picker: 0.18,
  bgm_gameplay_easy: 0.2,
  bgm_gameplay_normal: 0.2,
  bgm_results: 0.22,
  bgm_gift: 0.22,
};

export const musicUrls = (key: MusicKey): string[] => audioUrls(`${ASSET_ROOT}/music/${key}`);

export const mascotTexture = (mascot: MascotId): string => `mascot_${mascot}`;
