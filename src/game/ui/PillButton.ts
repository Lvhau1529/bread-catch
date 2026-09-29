/**
 * Nút dạng viên thuốc vẽ bằng Graphics + chữ (cho các nút không có sprite,
 * vd: nút chuyển chế độ chơi). Vùng chạm tối thiểu 48px chiều cao.
 */
import Phaser from 'phaser';
import { SFX } from '@/game/config/assets';
import { THEME } from '@/game/config/gameConfig';
import { getAudio } from '@/game/core/services';
import { addText } from '@/game/ui/text';

const HEIGHT = 32;
const MIN_TOUCH_HEIGHT = 48;
const PADDING_X = 16;

export interface PillStyle {
  fill: number;
  textColor: string;
}

export default class PillButton extends Phaser.GameObjects.Container {
  private readonly background: Phaser.GameObjects.Graphics;
  private readonly label: Phaser.GameObjects.Text;

  constructor(
    scene: Phaser.Scene,
    x: number,
    y: number,
    text: string,
    style: PillStyle,
    private readonly onClick: () => void,
  ) {
    super(scene, x, y);
    scene.add.existing(this);

    this.background = scene.add.graphics();
    this.label = addText(scene, 0, 0, '', 'outline', { fontSize: '15px' });
    this.add([this.background, this.label]);
    this.setLabel(text, style);

    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, () => this.setScale(0.94));
    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, () => this.setScale(1));
    this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
      if (this.scale === 1) return; // nhả tay ngoài nút
      this.setScale(1);
      getAudio(scene).playSfx(SFX.UI_CLICK);
      this.onClick();
    });
  }

  setLabel(text: string, style: PillStyle): void {
    this.label.setText(text).setColor(style.textColor);
    const width = this.label.width + PADDING_X * 2;

    this.background.clear();
    this.background.fillStyle(style.fill, 1);
    this.background.fillRoundedRect(-width / 2, -HEIGHT / 2, width, HEIGHT, HEIGHT / 2);
    this.background.lineStyle(3, Phaser.Display.Color.HexStringToColor(THEME.colors.darkBrown).color, 1);
    this.background.strokeRoundedRect(-width / 2, -HEIGHT / 2, width, HEIGHT, HEIGHT / 2);

    const hitHeight = Math.max(HEIGHT, MIN_TOUCH_HEIGHT);
    this.setSize(width, hitHeight);
    this.removeInteractive();
    this.setInteractive({ useHandCursor: true });
  }
}
