/**
 * Khởi tạo service toàn cục, chờ font pixel sẵn sàng và tải manifest sprite.
 */
import Phaser from 'phaser';
import { SPRITE_MANIFEST } from '@/game/config/assets';
import { THEME } from '@/game/config/gameConfig';
import { SCENES } from '@/game/core/keys';
import { registerServices } from '@/game/core/services';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  preload(): void {
    this.load.json(SPRITE_MANIFEST.key, SPRITE_MANIFEST.url);
  }

  async create(): Promise<void> {
    registerServices(this.game);
    await Promise.all([
      document.fonts.load(`700 20px ${THEME.fontFamily}`),
      document.fonts.load(`400 20px ${THEME.fontFamily}`),
    ]).catch(() => undefined); // font lỗi thì dùng font dự phòng
    this.scene.start(SCENES.PRELOAD);
  }
}
