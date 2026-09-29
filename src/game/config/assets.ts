/**
 * Khai báo asset: texture được đọc từ `sprites.json` (sinh bởi tools/build_sprites.py),
 * audio được liệt kê ở đây cùng volume mix.
 */

export const SPRITE_MANIFEST = { key: 'sprites', url: 'assets/sprites.json' } as const;

/** Một entry trong sprites.json */
export interface SpriteInfo {
  path: string;
  width: number;
  height: number;
  anchors?: Record<string, AnchorRect>;
  /** Chỉ có ở ảnh font chữ số */
  cellWidth?: number;
  cellHeight?: number;
  chars?: string;
}

export interface AnchorRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type SpriteManifest = Record<string, SpriteInfo>;

/** Bitmap font chữ số (RetroFont) dựng từ ảnh cùng tên */
export const DIGIT_FONTS = {
  SMALL: 'digits',
  BIG: 'digits_big',
} as const;

export const SFX = {
  UI_CLICK: 'ui_click',
  UI_CONFIRM: 'ui_confirm',
  UI_CANCEL: 'ui_cancel',
  BREAD_CATCH: 'bread_catch',
  COIN: 'coin_collect',
  STAR: 'star_collect',
  HEART: 'heart_collect',
  BAD_ITEM: 'bad_item',
  LEVEL_UP: 'level_up',
  GAME_OVER: 'game_over',
} as const;
export type SfxKey = (typeof SFX)[keyof typeof SFX];

export const MUSIC = {
  MENU: 'bgm_menu',
  STAGE_1: 'bgm_stage_01',
  STAGE_2: 'bgm_stage_02',
  STAGE_3: 'bgm_stage_03',
} as const;
export type MusicKey = (typeof MUSIC)[keyof typeof MUSIC];

/** BGM < SFX thường < SFX hiếm / level up */
export const VOLUME: { music: number; sfx: Record<SfxKey, number> } = {
  music: 0.22,
  sfx: {
    ui_click: 0.35,
    ui_confirm: 0.5,
    ui_cancel: 0.35,
    bread_catch: 0.45,
    coin_collect: 0.65,
    star_collect: 0.75,
    heart_collect: 0.7,
    bad_item: 0.6,
    level_up: 0.8,
    game_over: 0.7,
  },
};

/** .ogg trước (Chrome/Android), .mp3 fallback (iOS Safari) */
export const sfxUrls = (key: SfxKey): string[] => [
  `assets/audio/sfx/${key}.ogg`,
  `assets/audio/sfx/${key}.mp3`,
];
export const musicUrls = (key: MusicKey): string[] => [`assets/music/${key}.ogg`, `assets/music/${key}.mp3`];
