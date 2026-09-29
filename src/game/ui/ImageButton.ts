/**
 * Nút bấm dạng ảnh: hiệu ứng nhấn, âm thanh, và vùng chạm tối thiểu
 * 48x48 (chuẩn mobile) kể cả khi ảnh nhỏ hơn.
 */
import Phaser from 'phaser';
import { SFX, type SfxKey } from '@/game/config/assets';
import { getAudio } from '@/game/core/services';

const MIN_TOUCH_SIZE = 48;
const PRESSED_SCALE = 0.92;

export interface ImageButtonOptions {
  /** Âm thanh khi bấm; `null` = im lặng (tự phát ở nơi khác) */
  sfx?: SfxKey | null;
}

export default class ImageButton extends Phaser.GameObjects.Image {
  private pressed = false;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    texture: string,
    private readonly onClick: () => void,
    private readonly options: ImageButtonOptions = {},
  ) {
    super(scene, x, y, texture);
    scene.add.existing(this);
    this.refreshHitArea();

    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.press, this);
    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, this.release, this);
    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, this.click, this);
  }

  /** Gọi lại sau khi đổi texture có kích thước khác */
  refreshHitArea(): this {
    const padX = Math.max(0, (MIN_TOUCH_SIZE - this.width) / 2);
    const padY = Math.max(0, (MIN_TOUCH_SIZE - this.height) / 2);
    const area = new Phaser.Geom.Rectangle(-padX, -padY, this.width + padX * 2, this.height + padY * 2);
    this.removeInteractive();
    this.setInteractive({
      hitArea: area,
      hitAreaCallback: Phaser.Geom.Rectangle.Contains,
      useHandCursor: true,
    });
    return this;
  }

  private press(): void {
    this.pressed = true;
    this.setScale(PRESSED_SCALE);
  }

  private release(): void {
    this.pressed = false;
    this.setScale(1);
  }

  private click(): void {
    if (!this.pressed) return;
    this.release();
    const sfx = this.options.sfx === undefined ? SFX.UI_CLICK : this.options.sfx;
    if (sfx) getAudio(this.scene).playSfx(sfx);
    this.onClick();
  }
}
