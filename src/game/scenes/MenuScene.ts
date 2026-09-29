/**
 * Màn hình chính: chọn chế độ, tiêu đề, best score, PLAY, bật/tắt âm thanh.
 */
import Phaser from 'phaser';
import { DIGIT_FONTS, MUSIC, SFX } from '@/game/config/assets';
import { THEME } from '@/game/config/gameConfig';
import { STAGES } from '@/game/config/levels';
import { MODE_LABELS, type GameMode } from '@/game/config/troll';
import { SCENES } from '@/game/core/keys';
import { getAudio, getSave } from '@/game/core/services';
import ImageButton from '@/game/ui/ImageButton';
import PillButton, { type PillStyle } from '@/game/ui/PillButton';
import SoundToggles from '@/game/ui/SoundToggles';
import { anchorCenter } from '@/game/ui/layout';
import { addText } from '@/game/ui/text';

const FLOATING_BREADS = [
  { key: 'bread_01', x: 0.18, y: 0.3 },
  { key: 'bread_02', x: 0.82, y: 0.27 },
  { key: 'bread_03', x: 0.3, y: 0.42 },
  { key: 'bread_04', x: 0.72, y: 0.41 },
];

const MODE_STYLES: Record<GameMode, PillStyle> = {
  troll: { fill: 0xff6f9c, textColor: THEME.colors.cream },
  normal: { fill: 0xfff4dc, textColor: THEME.colors.brown },
};

const CREDIT_LINE = 'Made by haulv  ·  Music: 1144ghost';

export default class MenuScene extends Phaser.Scene {
  constructor() {
    super(SCENES.MENU);
  }

  create(): void {
    const { width, height } = this.scale;
    const cx = width / 2;
    const save = getSave(this);
    const audio = getAudio(this);

    this.add.image(cx, height / 2, STAGES[1].background);
    this.add.rectangle(cx, height / 2, width, height, 0x3b1a0b, 0.35);

    // Title
    addText(this, cx, height * 0.13, 'BREAD', 'title');
    addText(this, cx, height * 0.13 + 46, 'CATCHER', 'title', { color: THEME.colors.cream });
    this.addFloatingBreads();

    // Basket trang trí
    const basket = this.add.image(cx, height * 0.5, 'basket_02');
    this.tweens.add({
      targets: basket,
      y: basket.y - 6,
      duration: 900,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    // Best score
    const bestPanel = this.add.image(cx, height * 0.64, 'panel_best');
    const bestAt = anchorCenter(this, 'panel_best', 'value');
    this.add
      .bitmapText(
        bestPanel.x + bestAt.x,
        bestPanel.y + bestAt.y,
        DIGIT_FONTS.BIG,
        String(save.get('bestScore')),
      )
      .setOrigin(0.5);
    addText(
      this,
      cx,
      bestPanel.y + bestPanel.height / 2 + 18,
      `HIGHEST LEVEL ${save.get('highestLevel')}`,
      'small',
    );

    // Play
    const play = new ImageButton(this, cx, height * 0.8, 'btn_play', () => this.startGame(), {
      sfx: SFX.UI_CONFIRM,
    });
    this.tweens.add({
      targets: play,
      y: play.y - 4,
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    this.addModeToggle(cx, 26);

    new SoundToggles(this, cx, height * 0.91);
    addText(this, cx, height - 10, CREDIT_LINE, 'small', { fontSize: '10px' }).setAlpha(0.85);

    this.input.keyboard?.on('keydown-ENTER', () => this.startGame());
    this.input.keyboard?.on('keydown-SPACE', () => this.startGame());

    audio.playMusic(this, MUSIC.MENU);
    audio.preloadMusic(this, [STAGES[1].music]);
    this.cameras.main.fadeIn(300);
  }

  private startGame(): void {
    if (!this.scene.isActive()) return;
    this.scene.start(SCENES.GAME);
  }

  /** Nút chuyển TROLL / NORMAL, lưu lựa chọn cho lượt chơi sau */
  private addModeToggle(x: number, y: number): void {
    const save = getSave(this);
    let mode = save.get('mode');

    const toggle = new PillButton(this, x, y, MODE_LABELS[mode], MODE_STYLES[mode], () => {
      mode = mode === 'troll' ? 'normal' : 'troll';
      save.set('mode', mode);
      toggle.setLabel(MODE_LABELS[mode], MODE_STYLES[mode]);
    });
  }

  private addFloatingBreads(): void {
    const { width, height } = this.scale;
    FLOATING_BREADS.forEach(({ key, x, y }, index) => {
      const bread = this.add.image(width * x, height * y, key).setAngle(Phaser.Math.Between(-15, 15));
      this.tweens.add({
        targets: bread,
        y: bread.y - 10,
        angle: bread.angle + 8,
        duration: 1100 + index * 180,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
    });
  }
}
