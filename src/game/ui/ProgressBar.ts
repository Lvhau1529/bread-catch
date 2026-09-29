/**
 * Thanh tiến trình level: khung + dải fill được crop theo tỉ lệ.
 * Vị trí dải fill lấy từ anchor "inner" của progress_frame trong sprites.json.
 */
import Phaser from 'phaser';
import { getAnchor } from '@/game/ui/layout';

const FRAME = 'progress_frame';
const FILL = 'progress_fill';
const TWEEN_MS = 250;

export default class ProgressBar extends Phaser.GameObjects.Container {
  private readonly fill: Phaser.GameObjects.Image;
  private readonly progress = { ratio: 0 };

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y);
    scene.add.existing(this);

    const frame = scene.add.image(0, 0, FRAME);
    const inner = getAnchor(scene, FRAME, 'inner');
    this.fill = scene.add.image(inner.x - frame.width / 2, inner.y - frame.height / 2, FILL).setOrigin(0, 0);
    this.add([frame, this.fill]);
    this.apply(0);
  }

  setRatio(ratio: number): void {
    const target = Phaser.Math.Clamp(ratio, 0, 1);
    this.scene.tweens.killTweensOf(this.progress);

    // Vừa lên level: tỉ lệ tụt về gần 0 -> đặt ngay, không chạy lùi
    if (target < this.progress.ratio) {
      this.progress.ratio = target;
      this.apply(target);
      return;
    }
    this.scene.tweens.add({
      targets: this.progress,
      ratio: target,
      duration: TWEEN_MS,
      ease: 'Quad.easeOut',
      onUpdate: () => this.apply(this.progress.ratio),
    });
  }

  private apply(ratio: number): void {
    this.fill.setCrop(0, 0, Math.round(this.fill.width * ratio), this.fill.height);
  }
}
