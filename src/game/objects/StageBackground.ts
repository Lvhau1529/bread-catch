/**
 * Background của stage. Ảnh 360x800 được đặt giữa màn hình nên máy thấp
 * (640) chỉ cắt bớt trên/dưới, máy dài hiển thị trọn vẹn.
 */
import type Phaser from 'phaser';
import { DEPTH } from '@/game/config/gameConfig';
import { view } from '@/game/core/view';

export function addStageBackground(
  scene: Phaser.Scene,
  key: string,
  /** Tint để làm tối nhẹ background (0xffffff = giữ nguyên) */
  tint = 0xffffff,
): Phaser.GameObjects.Image {
  const { width, height } = view(scene);
  return scene.add
    .image(width / 2, height / 2, key)
    .setDepth(DEPTH.BACKGROUND)
    .setTint(tint);
}
