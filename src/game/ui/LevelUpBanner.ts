/**
 * Banner "LEVEL UP!" + danh sách những gì vừa mở khoá.
 */
import Phaser from 'phaser';
import { DEPTH, THEME, TIMING } from '@/game/config/gameConfig';
import { ITEMS } from '@/game/config/items';
import { BASKETS, STAGES } from '@/game/config/levels';
import type { UnlockEntry } from '@/game/core/events';
import { addText } from '@/game/ui/text';

interface UnlockLine {
  icon?: string;
  text: string;
}

/** Nội dung hiển thị cho từng loại unlock */
function describeUnlock(unlock: UnlockEntry): UnlockLine {
  switch (unlock.type) {
    case 'bread':
      return { icon: ITEMS[unlock.value].texture, text: 'NEW BREAD!' };
    case 'basket':
      return { icon: BASKETS[unlock.value].texture, text: 'BASKET UPGRADE!' };
    case 'stage':
      return { text: `NEW STAGE: ${STAGES[unlock.value].name}` };
    case 'rareBoost':
      return { icon: 'star', text: 'MORE RARE ITEMS!' };
  }
}

const ICON_SIZE = 32;
const LINE_HEIGHT = 38;

export default class LevelUpBanner {
  constructor(private readonly scene: Phaser.Scene) {}

  play(level: number, unlocks: UnlockEntry[]): void {
    this.show(`LEVEL ${level}`, unlocks.map(describeUnlock));
  }

  /** Banner giả (TROLL MODE): hiện như thật rồi lật mặt sau `revealDelay` ms */
  playFake(fakeLevel: number, revealText: string, revealDelay: number): void {
    const title = this.show(`LEVEL ${fakeLevel}`, [{ icon: 'star', text: 'MEGA BONUS!' }]);
    this.scene.time.delayedCall(revealDelay, () => {
      if (title.active) title.setText(revealText).setColor(THEME.colors.pink);
    });
  }

  /** Dựng banner + các dòng mô tả, tự huỷ sau TIMING.levelUp. Trả về dòng tiêu đề. */
  private show(title: string, lines: UnlockLine[]): Phaser.GameObjects.Text {
    const { width, height } = this.scene.scale;
    const root = this.scene.add.container(width / 2, height * 0.38).setDepth(DEPTH.BANNER);

    const banner = this.scene.add.image(0, 0, 'level_up');
    const titleText = addText(this.scene, 0, banner.height / 2 + 16, title, 'outline', {
      fontSize: '22px',
      color: THEME.colors.gold,
    });
    root.add([banner, titleText]);

    lines.forEach((line, index) => {
      const y = banner.height / 2 + 56 + index * LINE_HEIGHT;
      root.add(this.createLine(line, y, index));
    });

    banner.setScale(0);
    this.scene.tweens.add({ targets: banner, scale: 1, duration: 320, ease: 'Back.easeOut' });
    this.scene.tweens.add({
      targets: root,
      alpha: 0,
      y: root.y - 20,
      delay: TIMING.levelUp - 250,
      duration: 250,
      onComplete: () => root.destroy(),
    });
    return titleText;
  }

  private createLine(line: UnlockLine, y: number, index: number): Phaser.GameObjects.Container {
    const container = this.scene.add.container(0, y);
    const text = addText(this.scene, 0, 0, line.text, 'outline', { fontSize: '16px' });
    container.add(text);

    if (line.icon) {
      const icon = this.scene.add.image(0, 0, line.icon);
      icon.setScale(Math.min(1, ICON_SIZE / Math.max(icon.width, icon.height)));
      const total = icon.displayWidth + 8 + text.width;
      icon.setX(-total / 2 + icon.displayWidth / 2);
      text.setX(icon.x + icon.displayWidth / 2 + 8 + text.width / 2);
      container.add(icon);
    }

    container.setAlpha(0);
    this.scene.tweens.add({ targets: container, alpha: 1, delay: 200 + index * 150, duration: 200 });
    return container;
  }
}
