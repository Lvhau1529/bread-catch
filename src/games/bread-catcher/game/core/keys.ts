export const SCENES = {
  BOOT: 'BootScene',
  PRELOAD: 'PreloadScene',
  /** Nền động phía sau các màn React (Home / Setup / Results) */
  SHELL: 'ShellScene',
  TURN_PICKER: 'TurnPickerScene',
  GAME: 'GameScene',
  PAUSE: 'PauseScene',
  TURN_COMPLETE: 'TurnCompleteScene',
  GIFT: 'GiftScene',
} as const;

export type SceneKey = (typeof SCENES)[keyof typeof SCENES];

export const REGISTRY = {
  AUDIO: 'audio',
} as const;
