/**
 * Cặp nút bật/tắt SFX và MUSIC (dùng ở Menu & Pause).
 */
import Phaser from 'phaser';
import { getAudio } from '@/game/core/services';
import ImageButton from '@/game/ui/ImageButton';
import { addText } from '@/game/ui/text';

const ICON_ON = 'icon_sound';
const ICON_OFF = 'icon_sound_off';
const SPACING = 84;

export default class SoundToggles extends Phaser.GameObjects.Container {
  constructor(scene: Phaser.Scene, x: number, y: number, labelStyle: 'outline' | 'label' = 'outline') {
    super(scene, x, y);
    scene.add.existing(this);

    const audio = getAudio(scene);
    this.addToggle(-SPACING / 2, 'SFX', audio.sfxEnabled, (on) => audio.setSfxEnabled(on), labelStyle);
    this.addToggle(
      SPACING / 2,
      'MUSIC',
      audio.musicEnabled,
      (on) => audio.setMusicEnabled(on, scene),
      labelStyle,
    );
  }

  private addToggle(
    x: number,
    label: string,
    initial: boolean,
    onChange: (enabled: boolean) => void,
    labelStyle: 'outline' | 'label',
  ): void {
    let enabled = initial;
    const button = new ImageButton(this.scene, x, 0, enabled ? ICON_ON : ICON_OFF, () => {
      enabled = !enabled;
      button.setTexture(enabled ? ICON_ON : ICON_OFF);
      onChange(enabled);
    });
    const text = addText(this.scene, x, button.height / 2 + 12, label, labelStyle, { fontSize: '14px' });
    this.add([button, text]);
  }
}
