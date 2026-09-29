/**
 * Đọc metadata sprite (sprites.json) để đặt nội dung vào đúng vùng
 * trên ảnh UI (vd: ô số của panel SCORE) thay vì hard-code toạ độ.
 */
import type Phaser from 'phaser';
import { SPRITE_MANIFEST, type AnchorRect, type SpriteManifest } from '@/game/config/assets';

export function getManifest(scene: Phaser.Scene): SpriteManifest {
  return scene.cache.json.get(SPRITE_MANIFEST.key) as SpriteManifest;
}

export function getAnchor(scene: Phaser.Scene, textureKey: string, anchor: string): AnchorRect {
  const rect = getManifest(scene)[textureKey]?.anchors?.[anchor];
  if (!rect) throw new Error(`Missing anchor "${anchor}" on sprite "${textureKey}"`);
  return rect;
}

/** Tâm của anchor theo toạ độ local của image (origin 0.5, 0.5) */
export function anchorCenter(
  scene: Phaser.Scene,
  textureKey: string,
  anchor: string,
): { x: number; y: number } {
  const info = getManifest(scene)[textureKey];
  const rect = getAnchor(scene, textureKey, anchor);
  return {
    x: rect.x + rect.w / 2 - info.width / 2,
    y: rect.y + rect.h / 2 - info.height / 2,
  };
}
