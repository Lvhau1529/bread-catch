/**
 * Một lựa chọn trong khay: đĩa + món ăn mang nhãn học (FoodPiece), vùng chạm phủ kín ô.
 * Trạng thái (plan: Normal / Pressed / Selected / Disabled): bấm lún, sai thì rung + mờ,
 * gợi ý thì có vòng sáng nhấp nháy. Trả lời đúng thì món ăn tách khỏi đĩa để bay vào miệng.
 */
import Phaser from 'phaser';
import { DEPTH, THEME, TIMING } from '@/games/food-stream/game/config/theme';
import FoodPiece, { CARD_HEIGHT_RATIO } from '@/games/food-stream/game/objects/FoodPiece';
import type { Choice } from '@/games/food-stream/session/types';

/** Món ăn chiếm ngần này cạnh nhỏ của ô */
const FOOD_RATIO = 0.72;

export default class FoodChoice extends Phaser.GameObjects.Container {
  readonly piece: FoodPiece;
  private readonly plate: Phaser.GameObjects.Image;
  private readonly hint: Phaser.GameObjects.Graphics;
  private hintTween: Phaser.Tweens.Tween | null = null;
  private enabled = true;

  constructor(
    scene: Phaser.Scene,
    cell: Phaser.Geom.Rectangle,
    readonly choice: Choice,
    foodKey: string,
    plateKey: string,
    onTap: (choice: FoodChoice) => void,
  ) {
    super(scene, cell.centerX, cell.centerY);
    this.setDepth(DEPTH.CHOICES);
    // Lựa chọn dạng từ: món nhỏ ở dưới, thẻ tranh to phía trên
    const isWord = choice.picture !== undefined;
    const foodSize = isWord
      ? Math.min(cell.width * 0.45, cell.height * 0.3)
      : Math.min(cell.width, cell.height) * FOOD_RATIO;
    const cardWidth = Math.min(cell.width * 0.9, cell.height * 0.55);
    // Dạng từ: căn giữa cả cụm thẻ tranh + món ăn trong ô (xem FoodPiece.pictureCard)
    const foodY = isWord ? (cardWidth * CARD_HEIGHT_RATIO - foodSize * 0.28) / 2 : cell.height * 0.02;

    this.plate = scene.add.image(0, foodY + foodSize * 0.42, plateKey);
    this.plate.setScale(Math.min(cell.width * 0.92, foodSize * 1.5) / this.plate.width);

    this.hint = scene.add.graphics();
    this.hint
      .lineStyle(5, THEME.hex.gold)
      .strokeRoundedRect(-cell.width / 2 + 4, -cell.height / 2 + 4, cell.width - 8, cell.height - 8, 16);
    this.hint.setVisible(false);

    this.piece = new FoodPiece(scene, 0, foodY, foodKey, choice, foodSize, cardWidth);
    this.add([this.hint, this.plate, this.piece]);

    // Vùng chạm phủ kín ô (≥ 72px ảo trên màn 720 — plan §22)
    this.setSize(cell.width, cell.height);
    this.setInteractive({ useHandCursor: true });
    this.on(Phaser.Input.Events.POINTER_DOWN, () => {
      if (!this.enabled) return;
      this.scene.tweens.add({ targets: this.piece, scale: 0.92, duration: 70, yoyo: true });
      onTap(this);
    });
    scene.add.existing(this);

    // Xuất hiện nảy lên lần lượt
    this.setScale(0.6).setAlpha(0);
    scene.tweens.add({ targets: this, scale: 1, alpha: 1, duration: 260, ease: 'Back.easeOut' });
  }

  get isEnabled(): boolean {
    return this.enabled;
  }

  setEnabled(enabled: boolean): this {
    this.enabled = enabled;
    return this;
  }

  /** Lựa chọn sai bị loại: mờ đi, không bấm được nữa */
  markRemoved(): void {
    this.enabled = false;
    this.piece.setGrey(true);
    this.scene.tweens.add({ targets: this, alpha: 0.45, duration: 250 });
  }

  /** Rung nhẹ khi chọn sai (không phạt nặng — plan §26) */
  shake(): void {
    const x = this.x;
    this.scene.tweens.add({
      targets: this,
      x: { from: x - 8, to: x + 8 },
      duration: TIMING.wrongShake / 6,
      yoyo: true,
      repeat: 2,
      onComplete: () => this.setX(x),
    });
  }

  setHint(on: boolean): void {
    this.hint.setVisible(on);
    this.hintTween?.stop();
    this.hintTween = on
      ? this.scene.tweens.add({
          targets: this.hint,
          alpha: { from: 1, to: 0.3 },
          duration: 450,
          yoyo: true,
          repeat: -1,
        })
      : null;
  }

  /**
   * Tách món ăn ra khỏi đĩa (giữ nguyên vị trí trên màn hình) để bay đi; đĩa mờ dần.
   */
  detachPiece(): FoodPiece {
    const matrix = this.piece.getWorldTransformMatrix();
    this.remove(this.piece);
    this.piece.setPosition(matrix.tx, matrix.ty).setScale(this.scale).setDepth(DEPTH.FLYING);
    this.scene.add.existing(this.piece);
    this.setHint(false);
    this.enabled = false;
    this.scene.tweens.add({ targets: this.plate, alpha: 0.5, duration: 300 });
    return this.piece;
  }
}
