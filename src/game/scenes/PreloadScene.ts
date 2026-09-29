/**
 * Tải toàn bộ hình ảnh (theo sprites.json) và SFX, hiển thị thanh loading.
 * Nhạc nền KHÔNG tải ở đây — AudioSystem lazy-load để mobile vào game nhanh.
 */
import Phaser from 'phaser';
import { DIGIT_FONTS, SFX, sfxUrls } from '@/game/config/assets';
import { THEME } from '@/game/config/gameConfig';
import { SCENES } from '@/game/core/keys';
import { registerBrainrotAnims } from '@/game/objects/brainrot';
import { getManifest } from '@/game/ui/layout';
import { addText } from '@/game/ui/text';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENES.PRELOAD);
  }

  preload(): void {
    this.createLoadingBar();

    Object.entries(getManifest(this)).forEach(([key, info]) => this.load.image(key, info.path));
    Object.values(SFX).forEach((key) => this.load.audio(key, sfxUrls(key)));
  }

  create(): void {
    this.registerDigitFonts();
    registerBrainrotAnims(this.anims);
    this.scene.start(SCENES.MENU);
  }

  private createLoadingBar(): void {
    const { width, height } = this.scale;
    const barWidth = 220;
    const x = (width - barWidth) / 2;
    const y = height / 2;

    addText(this, width / 2, y - 36, 'BREAD CATCHER', 'outline', {
      fontSize: '24px',
      color: THEME.colors.gold,
    });
    this.add.rectangle(width / 2, y, barWidth + 8, 20, 0x5a2a12).setStrokeStyle(2, 0xfff4dc);
    const bar = this.add.rectangle(x, y, 0, 12, 0xff6f9c).setOrigin(0, 0.5);
    const label = addText(this, width / 2, y + 30, '0%', 'small');

    this.load.on(Phaser.Loader.Events.PROGRESS, (value: number) => {
      bar.width = barWidth * value;
      label.setText(`${Math.round(value * 100)}%`);
    });
  }

  /** Dựng RetroFont chữ số từ ảnh + thông số ô trong sprites.json */
  private registerDigitFonts(): void {
    const manifest = getManifest(this);
    Object.values(DIGIT_FONTS).forEach((key) => {
      const info = manifest[key];
      const config: Phaser.Types.GameObjects.BitmapText.RetroFontConfig = {
        image: key,
        width: info.cellWidth ?? info.height,
        height: info.cellHeight ?? info.height,
        chars: info.chars ?? '0123456789',
        charsPerRow: 10,
        'offset.x': 0,
        'offset.y': 0,
        'spacing.x': 0,
        'spacing.y': 0,
        lineSpacing: 0,
      };
      this.cache.bitmapFont.add(key, Phaser.GameObjects.RetroFont.Parse(this, config));
    });
  }
}
