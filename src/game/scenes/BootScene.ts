/**
 * Khởi tạo service toàn cục, chờ font sẵn sàng và tải manifest sprite.
 */
import Phaser from 'phaser';
import { SPRITE_MANIFEST } from '@/game/config/assets';
import { THEME } from '@/game/config/gameConfig';
import { SCENES } from '@/game/core/keys';
import { registerServices } from '@/game/core/services';

/** Font phải có trước khi vẽ chữ lên canvas (Phaser không tự chờ web font) */
const FONTS = [
  `600 20px ${THEME.fonts.ui}`,
  `700 20px ${THEME.fonts.ui}`,
  `800 20px ${THEME.fonts.ui}`,
  `700 20px ${THEME.fonts.learning}`,
];

export default class BootScene extends Phaser.Scene {
  constructor() {
    super(SCENES.BOOT);
  }

  preload(): void {
    this.load.json(SPRITE_MANIFEST.key, SPRITE_MANIFEST.url);
  }

  async create(): Promise<void> {
    registerServices(this.game);
    // Font lỗi thì dùng font dự phòng
    await Promise.all(FONTS.map((font) => document.fonts.load(font))).catch(() => undefined);
    this.scene.start(SCENES.PRELOAD);
  }
}
