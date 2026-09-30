/**
 * Preset chữ dùng chung để UI nhất quán.
 * Mọi Text được render ở độ phân giải RENDER_SCALE để sắc nét khi camera zoom.
 */
import type Phaser from 'phaser';
import { THEME } from '@/games/bread-catcher/game/config/gameConfig';
import { RENDER_SCALE } from '@/platform/phaser/viewport';

const { colors, fonts } = THEME;

const PRESETS = {
  /** Tiêu đề lớn trên nền ảnh */
  title: {
    fontSize: '34px',
    fontStyle: '800',
    color: colors.gold,
    stroke: colors.darkBrown,
    strokeThickness: 8,
  },
  /** Tiêu đề trên panel kem */
  heading: { fontSize: '26px', fontStyle: '800', color: colors.brown },
  /** Nhãn trên panel kem */
  label: { fontSize: '16px', fontStyle: '700', color: colors.brown },
  /** Chữ có viền, nổi trên nền game */
  outline: {
    fontSize: '17px',
    fontStyle: '700',
    color: colors.cream,
    stroke: colors.darkBrown,
    strokeThickness: 5,
  },
  small: {
    fontSize: '13px',
    fontStyle: '600',
    color: colors.cream,
    stroke: colors.darkBrown,
    strokeThickness: 4,
  },
  /** Popup bay lên */
  popup: {
    fontSize: '22px',
    fontStyle: '800',
    color: colors.gold,
    stroke: colors.darkBrown,
    strokeThickness: 5,
  },
  /** Chữ học (chữ cái / từ) — font Andika */
  learning: {
    fontFamily: fonts.learning,
    fontSize: '30px',
    fontStyle: '700',
    color: colors.darkBrown,
  },
} satisfies Record<string, Phaser.Types.GameObjects.Text.TextStyle>;

export type TextPreset = keyof typeof PRESETS;

export function addText(
  scene: Phaser.Scene,
  x: number,
  y: number,
  text: string,
  preset: TextPreset = 'outline',
  overrides: Phaser.Types.GameObjects.Text.TextStyle = {},
): Phaser.GameObjects.Text {
  return scene.add
    .text(x, y, text, { fontFamily: fonts.ui, align: 'center', ...PRESETS[preset], ...overrides })
    .setResolution(RENDER_SCALE)
    .setOrigin(0.5);
}

/**
 * Cắt chữ bằng "…" cho vừa `maxWidth` (px logic) — dùng cho tên đội dài
 * (vd "WWWWWWWWWWWW" rộng gấp đôi "IIIIIIIIIIII" dù cùng 12 ký tự).
 */
export function fitText(
  text: Phaser.GameObjects.Text,
  maxWidth: number,
  /** Phần đuôi luôn giữ lại, vd "!" trong "LIONS!" */
  suffix = '',
): Phaser.GameObjects.Text {
  if (text.width <= maxWidth) return text;
  const chars = [...text.text.slice(0, text.text.length - suffix.length)];
  while (chars.length > 1 && text.width > maxWidth) {
    chars.pop();
    text.setText(`${chars.join('').trimEnd()}…${suffix}`);
  }
  return text;
}
