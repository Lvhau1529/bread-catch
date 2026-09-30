/**
 * Thanh tiến độ câu hỏi: ngôi sao + thanh hồng + "3/10".
 */
import Phaser from 'phaser';
import { DEPTH, THEME } from '@/games/food-stream/game/config/theme';
import { addText } from '@/games/food-stream/game/ui/text';

export default class ProgressBar extends Phaser.GameObjects.Container {
  private readonly fill: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;
  private readonly barX: number;
  private readonly barWidth: number;
  private shown = 0;

  constructor(
    scene: Phaser.Scene,
    private readonly area: Phaser.Geom.Rectangle,
  ) {
    super(scene, 0, 0);
    this.setDepth(DEPTH.PANEL);
    const star = scene.add.image(area.x + 8, area.centerY, 'ui.star');
    star.setScale((area.height + 8) / star.height);
    this.barX = area.x + 22;
    this.barWidth = area.width - 22 - 44;

    const track = scene.add.graphics();
    track
      .fillStyle(THEME.hex.white, 0.3)
      .fillRoundedRect(this.barX, area.y, this.barWidth, area.height, area.height / 2);
    this.fill = scene.add.graphics();
    this.label = addText(scene, area.right - 20, area.centerY, '', 'outline', { fontSize: '13px' });
    this.add([track, this.fill, star, this.label]);
    scene.add.existing(this);
  }

  /** `done` câu đã xong trên tổng `total` */
  setProgress(done: number, total: number): void {
    this.label.setText(`${Math.min(done + 1, total)}/${total}`);
    const target = total > 0 ? done / total : 0;
    const state = { value: this.shown };
    this.scene.tweens.add({
      targets: state,
      value: target,
      duration: 400,
      onUpdate: () => {
        this.shown = state.value;
        const width = Math.max(this.area.height, this.barWidth * this.shown);
        this.fill
          .clear()
          .fillStyle(THEME.hex.pink)
          .fillRoundedRect(this.barX, this.area.y, width, this.area.height, this.area.height / 2);
        this.fill
          .fillStyle(THEME.hex.white, 0.35)
          .fillRoundedRect(this.barX + 4, this.area.y + 3, width - 8, 4, 2);
      },
    });
  }
}
