/**
 * Hiệu ứng "game feel": sparkle, flash, popup điểm, rung camera.
 */
import type Phaser from 'phaser';
import { DEPTH, THEME, TIMING } from '@/game/config/gameConfig';
import { addText } from '@/game/ui/text';

export default class EffectsSystem {
  private readonly sparkles: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor(private readonly scene: Phaser.Scene) {
    this.sparkles = scene.add
      .particles(0, 0, 'sparkle', {
        speed: { min: 60, max: 170 },
        angle: { min: 200, max: 340 },
        scale: { start: 0.9, end: 0 },
        rotate: { min: 0, max: 180 },
        gravityY: 260,
        lifespan: 450,
        emitting: false,
      })
      .setDepth(DEPTH.FX);
  }

  /** Sparkle nhỏ + chớp sáng tại điểm hứng */
  catchBurst(x: number, y: number): void {
    this.sparkles.explode(6, x, y);
    const flash = this.scene.add.image(x, y, 'catch_flash').setDepth(DEPTH.FX).setScale(0.3).setAlpha(0.9);
    this.scene.tweens.add({
      targets: flash,
      scale: 0.8,
      alpha: 0,
      duration: 220,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    });
  }

  /** Pháo sáng lớn khi lên level */
  bigBurst(x: number, y: number): void {
    this.sparkles.explode(28, x, y);
    this.scene.cameras.main.flash(180, 255, 240, 200);
  }

  /** Vụ nổ: chớp cam lớn + tia lửa + rung mạnh */
  explosion(x: number, y: number): void {
    const flash = this.scene.add
      .image(x, y, 'catch_flash')
      .setDepth(DEPTH.FX)
      .setTint(0xff7a2a)
      .setScale(0.5);
    this.scene.tweens.add({
      targets: flash,
      scale: 1.8,
      alpha: 0,
      duration: 380,
      ease: 'Quad.easeOut',
      onComplete: () => flash.destroy(),
    });
    this.sparkles.explode(18, x, y);
    this.scene.cameras.main.shake(220, 0.012);
  }

  /** Bong bóng mốc xanh bốc lên từ `target` trong `duration` ms */
  slowAura(target: Phaser.GameObjects.Image, duration: number): void {
    const aura = this.scene.add
      .particles(0, 0, 'sparkle', {
        follow: target,
        followOffset: { x: 0, y: -target.displayHeight * 0.55 },
        x: { min: -30, max: 30 },
        speedY: { min: -70, max: -30 },
        speedX: { min: -15, max: 15 },
        scale: { start: 0.7, end: 0 },
        alpha: { start: 0.9, end: 0 },
        tint: [0x8fe36b, 0x5fb34a, 0xc6f59a],
        lifespan: 650,
        frequency: 70,
      })
      .setDepth(DEPTH.FX);
    this.scene.time.delayedCall(duration, () => {
      aura.stop();
      this.scene.time.delayedCall(700, () => aura.destroy());
    });
  }

  /** Chữ bay lên ~24px rồi mờ dần */
  popup(x: number, y: number, text: string, color: string = THEME.colors.gold): void {
    const label = addText(this.scene, x, y, text, 'popup', { color }).setDepth(DEPTH.FX);
    this.scene.tweens.add({
      targets: label,
      y: y - 24,
      alpha: { from: 1, to: 0 },
      scale: { from: 1.2, to: 1 },
      duration: TIMING.popup,
      ease: 'Quad.easeOut',
      onComplete: () => label.destroy(),
    });
  }

  /** Chữ lớn giữa màn hình, nảy vào rồi mờ đi (thông báo prank...) */
  announce(text: string, color: string = THEME.colors.pink): void {
    const { width, height } = this.scene.scale;
    const label = addText(this.scene, width / 2, height * 0.45, text, 'outline', {
      fontSize: '30px',
      color,
      strokeThickness: 6,
    }).setDepth(DEPTH.BANNER);
    this.scene.tweens.chain({
      targets: label,
      tweens: [
        { scale: { from: 0, to: 1 }, angle: { from: -12, to: 0 }, duration: 260, ease: 'Back.easeOut' },
        { alpha: 0, y: label.y - 30, delay: 700, duration: 250, ease: 'Quad.easeIn' },
      ],
      onComplete: () => label.destroy(),
    });
  }

  shake(strength: 'light' | 'strong' = 'strong'): void {
    const intensity = strength === 'strong' ? 0.004 : 0.0025;
    this.scene.cameras.main.shake(100, intensity);
  }
}
