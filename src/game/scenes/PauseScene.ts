/**
 * Overlay tạm dừng, chạy chồng lên GameScene (GameScene ở trạng thái paused).
 */
import Phaser from 'phaser';
import { SFX } from '@/game/config/assets';
import { SCENES } from '@/game/core/keys';
import ImageButton from '@/game/ui/ImageButton';
import SoundToggles from '@/game/ui/SoundToggles';
import { addText } from '@/game/ui/text';
import { createOverlayPanel } from '@/game/scenes/overlay';

export default class PauseScene extends Phaser.Scene {
  constructor() {
    super(SCENES.PAUSE);
  }

  create(): void {
    const panel = createOverlayPanel(this, 390);
    const top = panel.top;

    panel.add([
      addText(this, 0, top + 92, 'PAUSED', 'heading'),
      new SoundToggles(this, 0, top + 160, 'label'),
      new ImageButton(this, 0, top + 262, 'btn_resume', () => this.resume(), { sfx: SFX.UI_CONFIRM }),
      new ImageButton(this, 0, top + 336, 'btn_home', () => this.goHome(), { sfx: SFX.UI_CANCEL }),
    ]);

    this.input.keyboard?.once('keydown-P', () => this.resume());
    this.input.keyboard?.once('keydown-ESC', () => this.resume());
  }

  private resume(): void {
    this.scene.resume(SCENES.GAME);
    this.scene.stop();
  }

  private goHome(): void {
    this.scene.stop(SCENES.GAME);
    this.scene.start(SCENES.MENU);
  }
}
