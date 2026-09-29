/**
 * Vật phẩm rơi — được tái sử dụng qua object pool (Arcade Group).
 * Không create/destroy liên tục: spawn() để kích hoạt, despawn() để trả về pool.
 */
import Phaser from 'phaser';
import { DEPTH } from '@/game/config/gameConfig';
import type { ItemDef, ItemId } from '@/game/config/items';
import type { ItemTrickState } from '@/game/systems/troll/types';

/** Hitbox nhỏ hơn sprite một chút cho cảm giác công bằng */
const HITBOX_RATIO = 0.7;
/** Tốc độ xoay tối đa (độ/giây) */
const MAX_SPIN = 45;

export default class FallingItem extends Phaser.Physics.Arcade.Sprite {
  declare body: Phaser.Physics.Arcade.Body;
  itemId: ItemId | null = null;
  def: ItemDef | null = null;
  /** Trò troll đang gán cho item (chỉ có ở TROLL MODE) */
  trick: ItemTrickState | null = null;

  constructor(scene: Phaser.Scene, x: number, y: number) {
    super(scene, x, y, 'bread_01');
  }

  spawn(itemId: ItemId, def: ItemDef, x: number, y: number, speed: number): this {
    this.trick = null;
    this.setItem(itemId, def);
    this.enableBody(true, x, y, true, true);
    this.setDepth(DEPTH.ITEMS).setAlpha(1).setScale(1).clearTint();
    this.setAngle(Phaser.Math.Between(-12, 12));

    this.body.setAllowGravity(false).setGravityY(0);
    this.updateHitbox();
    this.setVelocity(0, speed);
    this.setAngularVelocity(Phaser.Math.Between(-MAX_SPIN, MAX_SPIN));
    return this;
  }

  /** Đổi sang item khác ngay giữa đường (giữ nguyên vị trí và vận tốc) */
  transformInto(itemId: ItemId, def: ItemDef): void {
    this.setItem(itemId, def);
    this.updateHitbox();
  }

  /** Chỉ đổi hình hiển thị, giữ nguyên bản chất item (trò "giả dạng") */
  disguiseAs(texture: string): void {
    this.setTexture(texture);
    this.updateHitbox();
  }

  /** Tắt va chạm ngay, chạy animation "rơi vào rổ" rồi trả về pool */
  collect(targetX: number, targetY: number): void {
    this.body.enable = false;
    this.scene.tweens.add({
      targets: this,
      x: targetX,
      y: targetY,
      scale: 0.3,
      alpha: 0,
      duration: 120,
      ease: 'Quad.easeIn',
      onComplete: () => this.despawn(),
    });
  }

  despawn(): void {
    this.scene.tweens.killTweensOf(this);
    this.disableBody(true, true);
    this.def = null;
    this.itemId = null;
    this.trick = null;
  }

  private setItem(itemId: ItemId, def: ItemDef): void {
    this.itemId = itemId;
    this.def = def;
    this.setTexture(def.texture);
  }

  private updateHitbox(): void {
    this.body.setSize(this.width * HITBOX_RATIO, this.height * HITBOX_RATIO, true);
  }
}
