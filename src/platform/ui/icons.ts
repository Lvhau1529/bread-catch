/**
 * Ảnh giao diện dùng chung cho mọi game (Phonics Arcade pack — sinh bởi tools/arcade_ui/build_ui.py
 * vào `public/assets/shared/ui/`). Một bộ icon cho mọi game để cùng một nút luôn trông giống nhau.
 */
const UI = 'assets/shared/ui';

export const ICONS = {
  back: `${UI}/icons/back.png`,
  close: `${UI}/icons/close.png`,
  play: `${UI}/icons/play.png`,
  next: `${UI}/icons/next.png`,
  previous: `${UI}/icons/previous.png`,
  update: `${UI}/icons/update.png`,
  soundOn: `${UI}/icons/sound_on.png`,
  soundOff: `${UI}/icons/sound_off.png`,
  musicOn: `${UI}/icons/music_on.png`,
  musicOff: `${UI}/icons/music_off.png`,
  voiceOn: `${UI}/icons/voice_on.png`,
  voiceOff: `${UI}/icons/voice_off.png`,
  gem: `${UI}/gems/gem.png`,
  gemSmall: `${UI}/gems/gem_small.png`,
  gemBurst: `${UI}/gems/gem_burst.png`,
  padlock: `${UI}/gems/padlock.png`,
  unlockBurst: `${UI}/gems/unlock_burst.png`,
} as const;

export type IconName = keyof typeof ICONS;

/** Linh vật Pip (cú tím) cho hộp thoại / màn chờ */
export const PIP = {
  encourage: `${UI}/pip/encourage.png`,
  celebrate: `${UI}/pip/celebrate.png`,
  comingSoon: `${UI}/pip/coming_soon.png`,
  rotate: `${UI}/pip/rotate.png`,
  loading: `${UI}/pip/loading.png`,
  error: `${UI}/pip/error.png`,
  hello: `${UI}/pip/hello.png`,
} as const;

export const COMING_SOON_COVER = `${UI}/coming_soon_cover.webp`;

/** Nền màn chọn game (bầu trời tím, kim cương lấp lánh) */
export const HUB_BACKGROUND = {
  portrait: `${UI}/hub_bg_portrait.webp`,
  landscape: `${UI}/hub_bg_landscape.webp`,
} as const;
