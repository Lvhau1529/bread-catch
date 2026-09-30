/**
 * Texture "bánh chữ": sprite bánh pixel-art + chữ cái vẽ bằng font Andika.
 *
 * Chữ được vẽ LIVE (không nướng sẵn vào ảnh — plan §29) nhưng gộp vào một texture
 * để chữ rơi vẫn là 1 Arcade Sprite: xoay, mờ, tween, physics đều áp cho cả bánh lẫn chữ.
 * Texture có độ phân giải gấp RENDER_SCALE (bánh phóng nearest, chữ vẽ sắc nét),
 * sprite hiển thị ở scale 1 / RENDER_SCALE.
 */
import type Phaser from 'phaser';
import { THEME } from '@/games/bread-catcher/game/config/gameConfig';
import { RENDER_SCALE } from '@/platform/phaser/viewport';

/** Cỡ chữ so với cạnh ngắn của bánh */
const LETTER_SIZE_RATIO = 0.6;

export const LETTER_TEXTURE_SCALE = 1 / RENDER_SCALE;

function letterTextureKey(bread: string, letter: string): string {
  return `lb_${bread}_${letter}`;
}

/** Tạo texture (một lần, lazy) và trả về key */
export function ensureLetterTexture(scene: Phaser.Scene, bread: string, letter: string): string {
  const key = letterTextureKey(bread, letter);
  if (scene.textures.exists(key)) return key;

  const source = scene.textures.get(bread).getSourceImage();
  const width = source.width * RENDER_SCALE;
  const height = source.height * RENDER_SCALE;
  const texture = scene.textures.addDynamicTexture(key, width, height);
  if (!texture) return bread;

  const breadImage = scene.make.image({ key: bread }, false).setOrigin(0).setScale(RENDER_SCALE);
  const fontSize = Math.round(Math.min(width, height) * LETTER_SIZE_RATIO);
  const label = scene.make
    .text(
      {
        x: width / 2,
        y: height / 2,
        text: letter,
        style: {
          fontFamily: THEME.fonts.learning,
          fontStyle: '700',
          fontSize: `${fontSize}px`,
          color: THEME.colors.darkBrown,
          stroke: THEME.colors.cream,
          strokeThickness: Math.round(fontSize * 0.2),
        },
      },
      false,
    )
    .setOrigin(0.5);

  texture.draw(breadImage, 0, 0);
  texture.draw(label);
  breadImage.destroy();
  label.destroy();
  return key;
}
