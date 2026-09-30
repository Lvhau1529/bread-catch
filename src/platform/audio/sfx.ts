/**
 * Thư viện SFX dùng chung cho mọi game (lấy từ resource pack của Bread Catcher — tools/build_audio.py):
 * nút bấm, đếm ngược, đúng / sai, hết giờ, kết quả... Game nào cũng tải từ `assets/shared/sfx/`.
 * Volume theo audio_manifest.json của resource pack.
 */
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

export const SFX_VOLUME: Record<SfxKey, number> = {
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
};

/** .ogg trước (Chrome/Android/Firefox), .mp3 fallback (iOS Safari) */
export const audioUrls = (basePath: string): string[] => [`${basePath}.ogg`, `${basePath}.mp3`];

export const sfxUrls = (key: SfxKey): string[] => audioUrls(`assets/shared/sfx/${key}`);
