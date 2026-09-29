/**
 * Overlay kết thúc lượt: điểm, best, level, NEW BEST, RETRY / HOME.
 */
import Phaser from 'phaser';
import { DIGIT_FONTS, SFX } from '@/game/config/assets';
import { THEME } from '@/game/config/gameConfig';
import { SCENES } from '@/game/core/keys';
import ImageButton from '@/game/ui/ImageButton';
import { addText } from '@/game/ui/text';
import { createOverlayPanel } from '@/game/scenes/overlay';

export interface GameOverData {
  score: number;
  level: number;
  bestScore: number;
  isNewBest: boolean;
}

const COUNT_UP_MS = 700;

export default class GameOverScene extends Phaser.Scene {
  constructor() {
    super(SCENES.GAME_OVER);
  }

  create(data: GameOverData): void {
    const panel = createOverlayPanel(this, 410);
    const top = panel.top;

    const scoreText = this.add.bitmapText(0, top + 150, DIGIT_FONTS.BIG, '0').setOrigin(0.5);
    panel.add([
      addText(this, 0, top + 92, 'GAME OVER', 'heading'),
      addText(this, 0, top + 124, 'SCORE', 'label'),
      scoreText,
      addText(this, -60, top + 196, 'BEST', 'label'),
      this.add.bitmapText(-60, top + 222, DIGIT_FONTS.BIG, String(data.bestScore)).setOrigin(0.5),
      addText(this, 60, top + 196, 'LEVEL', 'label'),
      this.add.bitmapText(60, top + 222, DIGIT_FONTS.BIG, String(data.level).padStart(2, '0')).setOrigin(0.5),
      new ImageButton(this, -72, top + 330, 'btn_retry', () => this.retry(), { sfx: SFX.UI_CONFIRM }),
      new ImageButton(this, 72, top + 330, 'btn_home', () => this.goHome(), { sfx: SFX.UI_CANCEL }),
    ]);

    this.countUp(scoreText, data.score);
    if (data.isNewBest) panel.add(this.createNewBestLabel(top + 262));

    this.input.keyboard?.once('keydown-ENTER', () => this.retry());
  }

  private countUp(target: Phaser.GameObjects.BitmapText, score: number): void {
    const counter = { value: 0 };
    this.tweens.add({
      targets: counter,
      value: score,
      duration: COUNT_UP_MS,
      delay: 200,
      ease: 'Quad.easeOut',
      onUpdate: () => target.setText(String(Math.round(counter.value))),
    });
  }

  private createNewBestLabel(y: number): Phaser.GameObjects.Text {
    const label = addText(this, 0, y, '* NEW BEST! *', 'outline', {
      fontSize: '20px',
      color: THEME.colors.gold,
    });
    this.tweens.add({
      targets: label,
      scale: 1.12,
      duration: 450,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    return label;
  }

  private retry(): void {
    this.scene.stop(SCENES.GAME);
    this.scene.start(SCENES.GAME);
  }

  private goHome(): void {
    this.scene.stop(SCENES.GAME);
    this.scene.start(SCENES.MENU);
  }
}
