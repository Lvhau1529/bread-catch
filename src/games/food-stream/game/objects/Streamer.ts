/**
 * Nhân vật livestream (plan §10). Art board chỉ có 3 tư thế cho mỗi nhân vật nên các "animation"
 * được ghép từ tư thế + tween:
 *   happy  — cười híp mắt cầm dĩa / thìa: chờ món, nhai (co giãn nhịp nhàng)
 *   wow    — há miệng, tay ôm má: đón món bay tới / hò reo
 *   think  — ngón tay lên cằm + dấu "?": chọn sai (nhẹ nhàng, không phạt)
 * Gốc toạ độ: tâm đáy ảnh (mép bàn).
 */
import Phaser from 'phaser';
import { DEPTH } from '@/games/food-stream/game/config/theme';
import type { StreamerId } from '@/games/food-stream/session/types';

export type Pose = 'happy' | 'wow' | 'think';

/** Miệng ở khoảng 55% chiều cao ảnh tính từ đỉnh */
const MOUTH_RATIO = 0.55;
const INACTIVE_ALPHA = 0.55;
const INACTIVE_SCALE = 0.9;

const poseKey = (id: StreamerId, pose: Pose) => `character.${id}.${pose}`;

export default class Streamer extends Phaser.GameObjects.Container {
  private readonly figure: Phaser.GameObjects.Image;
  private readonly question: Phaser.GameObjects.Image;
  private readonly baseScale: number;
  private idleTween: Phaser.Tweens.Tween | null = null;
  private poseTimer: Phaser.Time.TimerEvent | null = null;
  private isTurnActive = true;

  constructor(
    scene: Phaser.Scene,
    x: number,
    bottom: number,
    readonly id: StreamerId,
    height: number,
  ) {
    super(scene, x, bottom);
    this.figure = scene.add.image(0, 0, poseKey(id, 'happy')).setOrigin(0.5, 1);
    this.baseScale = height / this.figure.height;
    this.figure.setScale(this.baseScale);
    this.question = scene.add
      .image(this.figure.displayWidth * 0.36, -height * 0.9, 'ui.question')
      .setScale(this.baseScale * 0.9)
      .setVisible(false);
    this.add([this.figure, this.question]);
    this.setDepth(DEPTH.STREAMER);
    scene.add.existing(this);
    this.startIdle();
  }

  /** Vị trí miệng (toạ độ thế giới) — món ăn bay tới đây */
  get mouth(): Phaser.Math.Vector2 {
    const height = this.figure.displayHeight * this.scaleY;
    return new Phaser.Math.Vector2(this.x, this.y - height * (1 - MOUTH_RATIO));
  }

  get figureHeight(): number {
    return this.figure.displayHeight * this.scaleY;
  }

  setPose(pose: Pose, holdMs = 0): this {
    this.poseTimer?.remove();
    this.figure.setTexture(poseKey(this.id, pose));
    this.question.setVisible(pose === 'think');
    if (holdMs > 0) this.poseTimer = this.scene.time.delayedCall(holdMs, () => this.setPose('happy'));
    return this;
  }

  /** Classroom: nhân vật của đội không tới lượt mờ đi, nhỏ lại */
  setTurnActive(active: boolean): this {
    if (active === this.isTurnActive) return this;
    this.isTurnActive = active;
    this.scene.tweens.add({
      targets: this,
      alpha: active ? 1 : INACTIVE_ALPHA,
      scale: active ? 1 : INACTIVE_SCALE,
      duration: 250,
    });
    return this;
  }

  /** Há miệng chờ món bay tới */
  openMouth(): void {
    this.setPose('wow');
  }

  /** Nhai `bites` nhịp (co giãn theo chiều dọc) rồi gọi `onDone` */
  chew(bites: number, stepMs: number, onDone?: () => void): void {
    this.setPose('happy');
    this.stopIdle();
    this.scene.tweens.add({
      targets: this.figure,
      scaleY: this.baseScale * 0.95,
      scaleX: this.baseScale * 1.03,
      duration: stepMs / 2,
      yoyo: true,
      repeat: bites - 1,
      onComplete: () => {
        this.figure.setScale(this.baseScale);
        this.startIdle();
        onDone?.();
      },
    });
  }

  /** Nhảy lên vui mừng */
  cheer(): void {
    this.setPose('wow', 900);
    this.scene.tweens.add({
      targets: this.figure,
      y: -14,
      duration: 160,
      yoyo: true,
      repeat: 1,
      ease: 'Quad.easeOut',
    });
  }

  /** Chọn sai: nghiêng đầu suy nghĩ */
  oops(holdMs: number): void {
    this.setPose('think', holdMs);
    this.scene.tweens.add({
      targets: this.figure,
      angle: { from: -4, to: 4 },
      duration: 140,
      yoyo: true,
      repeat: 2,
      onComplete: () => this.figure.setAngle(0),
    });
  }

  override destroy(fromScene?: boolean): void {
    this.poseTimer?.remove();
    super.destroy(fromScene);
  }

  private startIdle(): void {
    this.stopIdle();
    this.idleTween = this.scene.tweens.add({
      targets: this.figure,
      scaleY: this.baseScale * 1.015,
      duration: 900 + Math.random() * 300,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private stopIdle(): void {
    this.idleTween?.stop();
    this.idleTween = null;
    this.figure.setScale(this.baseScale);
  }
}
