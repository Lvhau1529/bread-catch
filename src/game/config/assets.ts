/**
 * Khai báo asset: texture được đọc từ `sprites.json` (sinh bởi tools/build_sprites.py),
 * audio lấy từ resource pack (tools/build_audio.py) — volume theo audio_manifest.json.
 */
import type { MascotId } from '@/session/types';

export const SPRITE_MANIFEST = { key: 'sprites', url: 'assets/sprites.json' } as const;

/** Một entry trong sprites.json */
export interface SpriteInfo {
  path: string;
  width: number;
  height: number;
}

export type SpriteManifest = Record<string, SpriteInfo>;

export const SFX = {
  UI_CLICK: 'ui_click',
  UI_START: 'ui_start',
  COUNTDOWN_TICK: 'countdown_tick',
  COUNTDOWN_GO: 'countdown_go',
  DICE_ROLL: 'dice_roll',
  TEAM_SELECTED: 'team_selected',
  CORRECT_LETTER: 'correct_letter',
  WRONG_LETTER: 'wrong_letter',
  WORD_COMPLETE: 'word_complete',
  ROUND_COMPLETE: 'round_complete',
  PAUSE: 'pause',
  RESUME: 'resume',
  TIME_UP: 'time_up',
  FINAL_RESULTS: 'final_results',
  GIFT_OPEN: 'gift_open',
} as const;
export type SfxKey = (typeof SFX)[keyof typeof SFX];

export const MUSIC = {
  MENU: 'bgm_menu',
  TURN_PICKER: 'bgm_turn_picker',
  GAMEPLAY_EASY: 'bgm_gameplay_easy',
  GAMEPLAY_NORMAL: 'bgm_gameplay_normal',
  RESULTS: 'bgm_results',
  GIFT: 'bgm_gift',
} as const;
export type MusicKey = (typeof MUSIC)[keyof typeof MUSIC];

export const VOLUME: { music: Record<MusicKey, number>; sfx: Record<SfxKey, number> } = {
  music: {
    bgm_menu: 0.22,
    bgm_turn_picker: 0.18,
    bgm_gameplay_easy: 0.2,
    bgm_gameplay_normal: 0.2,
    bgm_results: 0.22,
    bgm_gift: 0.22,
  },
  sfx: {
    ui_click: 0.35,
    ui_start: 0.45,
    countdown_tick: 0.52,
    countdown_go: 0.58,
    dice_roll: 0.5,
    team_selected: 0.6,
    correct_letter: 0.55,
    wrong_letter: 0.45,
    word_complete: 0.68,
    round_complete: 0.7,
    pause: 0.4,
    resume: 0.4,
    time_up: 0.6,
    final_results: 0.72,
    gift_open: 0.75,
  },
};

/** .ogg trước (Chrome/Android), .mp3 fallback (iOS Safari) */
export const sfxUrls = (key: SfxKey): string[] => [
  `assets/audio/sfx/${key}.ogg`,
  `assets/audio/sfx/${key}.mp3`,
];
export const musicUrls = (key: MusicKey): string[] => [`assets/music/${key}.ogg`, `assets/music/${key}.mp3`];

export const mascotTexture = (mascot: MascotId): string => `mascot_${mascot}`;
