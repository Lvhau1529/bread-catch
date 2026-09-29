/**
 * Nhãn "COMBO xN" bám theo phía trên rổ, chỉ hiện khi combo > 1.
 */
import type Phaser from 'phaser';
import { DEPTH, THEME } from '@/game/config/gameConfig';
import { addText } from '@/game/ui/text';

const OFFSET_Y = 14;

export default class ComboLabel {
  private readonly text: Phaser.GameObjects.Text;

  constructor(private readonly scene: Phaser.Scene) {
    this.text = addText(scene, 0, 0, '', 'outline', { fontSize: '15px', color: THEME.colors.pink })
      .setDepth(DEPTH.FX)
      .setVisible(false);
  }

  setMultiplier(multiplier: number): void {
    if (multiplier <= 1) {
      this.text.setVisible(false);
      return;
    }
    this.text.setText(`COMBO x${multiplier}`).setVisible(true);
    this.scene.tweens.add({
      targets: this.text,
      scale: { from: 1.5, to: 1 },
      duration: 250,
      ease: 'Back.easeOut',
    });
  }

  follow(x: number, topY: number): void {
    this.text.setPosition(x, topY - OFFSET_Y);
  }
}
