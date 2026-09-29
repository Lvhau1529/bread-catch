/**
 * Preset chữ dùng chung để UI nhất quán.
 */
import type Phaser from 'phaser';
import { THEME } from '@/game/config/gameConfig';

const { colors } = THEME;

const PRESETS = {
  /** Tiêu đề lớn trên nền ảnh */
  title: {
    fontSize: '44px',
    fontStyle: '700',
    color: colors.gold,
    stroke: colors.darkBrown,
    strokeThickness: 8,
  },
  /** Tiêu đề trên panel kem */
  heading: { fontSize: '28px', fontStyle: '700', color: colors.brown },
  /** Nhãn trên panel kem */
  label: { fontSize: '16px', fontStyle: '700', color: colors.brown },
  /** Chữ có viền, nổi trên nền game */
  outline: {
    fontSize: '16px',
    fontStyle: '700',
    color: colors.cream,
    stroke: colors.darkBrown,
    strokeThickness: 4,
  },
  small: {
    fontSize: '12px',
    fontStyle: '400',
    color: colors.cream,
    stroke: colors.darkBrown,
    strokeThickness: 3,
  },
  /** Popup điểm bay lên */
  popup: {
    fontSize: '20px',
    fontStyle: '700',
    color: colors.gold,
    stroke: colors.darkBrown,
    strokeThickness: 4,
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
    .text(x, y, text, { fontFamily: THEME.fontFamily, align: 'center', ...PRESETS[preset], ...overrides })
    .setOrigin(0.5);
}
