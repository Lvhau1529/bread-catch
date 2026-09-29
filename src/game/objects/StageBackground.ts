/**
 * Background của stage. Ảnh 360x800 được đặt giữa màn hình nên máy thấp
 * (640) chỉ cắt bớt trên/dưới, máy dài hiển thị trọn vẹn.
 * Đổi stage bằng crossfade.
 */
import type Phaser from 'phaser';
import { DEPTH, TIMING } from '@/game/config/gameConfig';

export default class StageBackground {
  private current: Phaser.GameObjects.Image;
  private key: string;

  constructor(
    private readonly scene: Phaser.Scene,
    key: string,
    /** Tint để làm tối nhẹ background (0xffffff = giữ nguyên) */
    private readonly tint = 0xffffff,
  ) {
    this.key = key;
    this.current = this.createImage(key);
  }

  transitionTo(key: string): void {
    if (key === this.key) return;
    this.key = key;

    const previous = this.current;
    const next = this.createImage(key).setAlpha(0);
    this.current = next;
    this.scene.tweens.add({
      targets: next,
      alpha: 1,
      duration: TIMING.backgroundFade,
      ease: 'Sine.easeInOut',
      onComplete: () => previous.destroy(),
    });
  }

  private createImage(key: string): Phaser.GameObjects.Image {
    const { width, height } = this.scene.scale;
    return this.scene.add
      .image(width / 2, height / 2, key)
      .setDepth(DEPTH.BACKGROUND)
      .setTint(this.tint);
  }
}
