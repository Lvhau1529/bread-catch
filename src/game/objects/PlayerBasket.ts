/**
 * Rổ hứng của người chơi — chỉ di chuyển ngang, không ra khỏi màn hình.
 * Vùng va chạm là dải mỏng ở miệng rổ, rộng theo `hitWidth` của tier.
 * Arcade body co giãn theo scale, nên `setSizeScale` thu nhỏ luôn vùng hứng.
 */
import Phaser from 'phaser';
import { DEPTH, PLAYER, TIMING } from '@/game/config/gameConfig';
import { BASKETS, type BasketTier } from '@/game/config/levels';
import type InputController from '@/game/systems/InputController';

export default class PlayerBasket extends Phaser.Physics.Arcade.Image {
  declare body: Phaser.Physics.Arcade.Body;
  tier: BasketTier;
  private hitWidth: number;
  private speedMultiplier = 1;
  /** Scale gốc của rổ (1 = bình thường); các tween squash / pop tính quanh giá trị này */
  private sizeScale = 1;
  private slowTimer: Phaser.Time.TimerEvent | null = null;
  private wobble: Phaser.Tweens.Tween | null = null;
  private sizeTween: Phaser.Tweens.Tween | null = null;
  /** Lực đẩy ngang (px/s) cộng thêm mỗi frame — prank "gió" của TROLL MODE */
  private wind = 0;
  private frozenTimer: Phaser.Time.TimerEvent | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number, tier: BasketTier = 1) {
    super(scene, x, y, BASKETS[tier].texture);
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.tier = tier;
    this.hitWidth = BASKETS[tier].hitWidth;
    this.setOrigin(0.5, 1).setDepth(DEPTH.BASKET);
    this.body.setAllowGravity(false).setImmovable(true);
    this.updateBody();
  }

  /** Toạ độ Y của miệng rổ (dùng cho popup / hiệu ứng) */
  get rimY(): number {
    return this.y - this.displayHeight * (1 - PLAYER.catchZone.topRatio);
  }

  setTier(tier: BasketTier): void {
    if (tier === this.tier) return;
    this.tier = tier;
    this.hitWidth = BASKETS[tier].hitWidth;
    this.setTexture(BASKETS[tier].texture);
    this.updateBody();
    this.x = this.clampX(this.x);

    // Hiệu ứng "pop" khi nâng cấp
    this.scene.tweens.add({
      targets: this,
      scaleX: { from: this.sizeScale * 1.3, to: this.sizeScale },
      scaleY: { from: this.sizeScale * 1.3, to: this.sizeScale },
      duration: 350,
      ease: 'Back.easeOut',
    });
  }

  get isSlowed(): boolean {
    return this.slowTimer !== null;
  }

  get isFrozen(): boolean {
    return this.frozenTimer !== null;
  }

  /** Dính mốc (Moldy Bread): rổ ì, xanh lè và lắc lư trong `duration` ms */
  applySlow(multiplier: number, duration: number): void {
    this.speedMultiplier = multiplier;

    this.wobble?.stop();
    this.wobble = this.scene.tweens.add({
      targets: this,
      angle: { from: -PLAYER.slowed.wobbleAngle, to: PLAYER.slowed.wobbleAngle },
      duration: 160,
      yoyo: true,
      repeat: -1,
    });

    this.slowTimer?.remove();
    this.slowTimer = this.scene.time.delayedCall(duration, () => {
      this.speedMultiplier = 1;
      this.wobble?.stop();
      this.wobble = null;
      this.setAngle(0);
      this.slowTimer = null;
      this.refreshTint();
    });
    this.refreshTint();
  }

  /** Đóng băng: rổ đứng im hoàn toàn trong `duration` ms (nhân vật brainrot) */
  freeze(duration: number): void {
    this.frozenTimer?.remove();
    this.frozenTimer = this.scene.time.delayedCall(duration, () => {
      this.frozenTimer = null;
      this.refreshTint();
    });
    this.refreshTint();
  }

  /** Bị đánh văng ngang `distance` px */
  knock(distance: number): void {
    this.scene.tweens.add({
      targets: this,
      x: this.clampX(this.x + distance),
      duration: 220,
      ease: 'Quad.easeOut',
    });
  }

  /** Phóng to / thu nhỏ rổ (TROLL MODE: rổ teo) */
  setSizeScale(scale: number): void {
    this.sizeScale = scale;
    this.sizeTween?.stop();
    this.sizeTween = this.scene.tweens.add({ targets: this, scale, duration: 200, ease: 'Back.easeOut' });
  }

  setWind(speed: number): void {
    this.wind = speed;
  }

  /** scaleY 1 → 0.90 → 1.05 → 1 (~150ms) */
  squash(): void {
    const step = TIMING.basketSquash / 3;
    const s = this.sizeScale;
    this.scene.tweens.chain({
      targets: this,
      tweens: [
        { scaleY: s * 0.9, scaleX: s * 1.06, duration: step, ease: 'Quad.easeOut' },
        { scaleY: s * 1.05, scaleX: s * 0.98, duration: step, ease: 'Quad.easeOut' },
        { scaleY: s, scaleX: s, duration: step, ease: 'Quad.easeIn' },
      ],
    });
  }

  move(delta: number, input: InputController): void {
    if (this.isFrozen) return;
    const dt = delta / 1000;
    const direction = input.direction;
    // Tốc độ cơ bản; khi dính mốc thì cả chuột / cảm ứng cũng bị giới hạn theo nó
    // (bình thường rổ bám ngón tay gần như tức thì nên nhân % vào đó sẽ không cảm nhận được)
    const baseSpeed = PLAYER.keyboardSpeed * this.speedMultiplier;

    if (direction !== 0) {
      this.x += direction * baseSpeed * dt;
    } else if (input.targetX !== null) {
      const maxSpeed = this.isSlowed ? baseSpeed : PLAYER.pointerMaxSpeed;
      const maxStep = maxSpeed * dt;
      this.x += Phaser.Math.Clamp(input.targetX - this.x, -maxStep, maxStep);
    }
    this.x = this.clampX(this.x + this.wind * dt);
  }

  /** Màu theo trạng thái: đóng băng ưu tiên hơn dính mốc */
  private refreshTint(): void {
    if (this.isFrozen) this.setTint(PLAYER.frozenTint);
    else if (this.isSlowed) this.setTint(PLAYER.slowed.tint);
    else this.clearTint();
  }

  private clampX(x: number): number {
    const half = this.width / 2;
    return Phaser.Math.Clamp(x, half, this.scene.scale.width - half);
  }

  private updateBody(): void {
    this.body.setSize(this.hitWidth, PLAYER.catchZone.height, false);
    this.body.setOffset((this.width - this.hitWidth) / 2, this.height * PLAYER.catchZone.topRatio);
  }
}
