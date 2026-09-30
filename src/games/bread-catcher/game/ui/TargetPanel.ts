/**
 * Ô từ mục tiêu dưới HUD (plan §9, §27):
 *
 *   ┌─────────────────────────────────┐
 *   │ 🔊          M A P               │  <- từ (tuỳ mức gợi ý)
 *   │        [M] [A] [_]              │  <- ô chữ, ô đang cần hứng sáng viền vàng
 *   └─────────────────────────────────┘
 *
 * Mức gợi ý: full (từ + chữ mờ trong ô) · word (từ) · first-letter (chữ đầu) · blank.
 * Chữ học dùng font Andika (plan §34).
 */
import type Phaser from 'phaser';
import { DEPTH, THEME } from '@/games/bread-catcher/game/config/gameConfig';
import type { GameEventBus } from '@/games/bread-catcher/game/core/events';
import IconButton from '@/games/bread-catcher/game/ui/IconButton';
import { hudLayout } from '@/games/bread-catcher/game/ui/layout';
import { addText } from '@/games/bread-catcher/game/ui/text';
import type { TargetSupport } from '@/games/bread-catcher/session/types';

const RADIUS = 18;
const SLOT_GAP = 6;
/** Từ dài (alligator, astronaut...) dùng khoảng cách ô hẹp hơn */
const LONG_WORD = 7;
const LONG_SLOT_GAP = 3;
const MAX_SLOT = 44;
/** Chừa chỗ bên trái cho nút phát âm */
const SPEAKER_SPACE = 58;

interface Slot {
  box: Phaser.GameObjects.Graphics;
  hint: Phaser.GameObjects.Text;
  letter: Phaser.GameObjects.Text;
  x: number;
  size: number;
}

export default class TargetPanel {
  private readonly root: Phaser.GameObjects.Container;
  private readonly wordText: Phaser.GameObjects.Text;
  private readonly glow: Phaser.GameObjects.Graphics;
  private slots: Slot[] = [];
  private slotsRoot: Phaser.GameObjects.Container;
  private word = '';
  private current = 0;
  private cursorTween: Phaser.Tweens.Tween | null = null;
  private readonly panelWidth: number;
  private readonly centerX: number;

  constructor(
    private readonly scene: Phaser.Scene,
    bus: GameEventBus,
    /** Có nút phát âm lại (khi có giọng đọc) */
    onSpeak: (() => void) | null,
  ) {
    const { panel } = hudLayout(scene);
    const { width: panelWidth, height: panelHeight } = panel;
    this.panelWidth = panelWidth;
    this.centerX = panel.x;
    this.root = scene.add.container(panel.x, panel.y + panelHeight / 2).setDepth(DEPTH.HUD);

    this.glow = scene.add.graphics().setAlpha(0);
    this.glow.fillStyle(0xffd23f, 1);
    this.glow.fillRoundedRect(
      -panelWidth / 2 - 5,
      -panelHeight / 2 - 5,
      panelWidth + 10,
      panelHeight + 10,
      RADIUS + 4,
    );

    const frame = scene.add.graphics();
    frame
      .fillStyle(0xfff4dc, 0.97)
      .fillRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, RADIUS);
    frame
      .lineStyle(4, 0x3b1a0b, 1)
      .strokeRoundedRect(-panelWidth / 2, -panelHeight / 2, panelWidth, panelHeight, RADIUS);

    this.wordText = addText(scene, SPEAKER_SPACE / 2, -24, '', 'learning', { fontSize: '26px' });
    this.slotsRoot = scene.add.container(0, 0);
    this.root.add([this.glow, frame, this.wordText, this.slotsRoot]);

    if (onSpeak) {
      this.root.add(
        new IconButton(scene, -panelWidth / 2 + 30, 0, 'speaker', onSpeak, { radius: 20, sfx: null }),
      );
    }

    bus
      .on('word-started', ({ word, support }) => this.showWord(word, support))
      .on('letter-filled', ({ index }) => this.fill(index))
      .on('word-finished', ({ correct }) => (correct ? this.celebrate() : this.fail()));
  }

  private showWord(word: string, support: TargetSupport): void {
    this.word = word;
    this.current = 0;
    this.slotsRoot.removeAll(true);
    this.cursorTween?.stop();

    const showWord = support === 'full' || support === 'word';
    const isLong = word.length > LONG_WORD;
    this.wordText
      .setText(showWord ? word.split('').join(isLong ? '' : ' ') : '')
      .setVisible(showWord)
      .setFontSize(isLong ? 22 : 26);

    const gap = isLong ? LONG_SLOT_GAP : SLOT_GAP;
    const available = this.panelWidth - SPEAKER_SPACE - 20;
    const size = Math.min(MAX_SLOT, Math.floor((available - gap * (word.length - 1)) / word.length));
    const rowWidth = word.length * size + (word.length - 1) * gap;
    const startX = SPEAKER_SPACE / 2 - rowWidth / 2 + size / 2;
    const y = showWord ? 14 : 0;

    this.slots = word.split('').map((char, index) => {
      const x = startX + index * (size + gap);
      const box = this.scene.add.graphics();
      const showHint = support === 'full' || (support === 'first-letter' && index === 0);
      const hint = addText(this.scene, x, y, showHint ? char : '', 'learning', {
        fontSize: `${Math.round(size * 0.72)}px`,
        color: '#b9a58a',
      });
      const letter = addText(this.scene, x, y, '', 'learning', { fontSize: `${Math.round(size * 0.78)}px` });
      this.slotsRoot.add([box, hint, letter]);
      return { box, hint, letter, x, size };
    });
    this.slotsRoot.y = 0;
    this.slots.forEach((slot, index) => this.drawSlot(slot, index === 0 ? 'current' : 'empty', y));
    this.pointCursor();

    // Hiện ra từ trên xuống
    this.root.setScale(1);
    this.scene.tweens.add({ targets: this.slotsRoot, alpha: { from: 0, to: 1 }, duration: 200 });
    this.scene.tweens.add({
      targets: this.wordText,
      scale: { from: 1.3, to: 1 },
      duration: 250,
      ease: 'Back.easeOut',
    });
  }

  private fill(index: number): void {
    const slot = this.slots[index];
    if (!slot) return;
    const color = THEME.letterColors[index % THEME.letterColors.length];
    slot.hint.setText('');
    slot.letter.setText(this.word[index]).setColor(color);
    this.drawSlot(slot, 'filled', slot.letter.y);
    this.scene.tweens.add({
      targets: slot.letter,
      scale: { from: 1.7, to: 1 },
      duration: 260,
      ease: 'Back.easeOut',
    });

    this.current = index + 1;
    const next = this.slots[this.current];
    if (next) this.drawSlot(next, 'current', next.letter.y);
    this.pointCursor();
  }

  /** Hoàn thành từ: panel sáng viền vàng, các chữ nảy lần lượt */
  private celebrate(): void {
    this.cursorTween?.stop();
    this.scene.tweens.add({
      targets: this.glow,
      alpha: { from: 1, to: 0 },
      duration: 900,
      ease: 'Quad.easeIn',
    });
    this.slots.forEach((slot, index) => {
      this.scene.tweens.add({
        targets: slot.letter,
        y: slot.letter.y - 8,
        duration: 150,
        delay: index * 70,
        yoyo: true,
        ease: 'Quad.easeOut',
      });
    });
  }

  /** Hứng nhầm: ô đang cần hứng chuyển xám, panel lắc nhẹ */
  private fail(): void {
    this.cursorTween?.stop();
    const slot = this.slots[this.current];
    if (slot) this.drawSlot(slot, 'failed', slot.letter.y);
    this.scene.tweens.add({
      targets: this.root,
      x: { from: this.root.x - 5, to: this.root.x + 5 },
      duration: 60,
      yoyo: true,
      repeat: 2,
      onComplete: () => this.root.setX(this.centerX),
    });
  }

  /** Nhịp đập nhẹ ở ô đang cần hứng */
  private pointCursor(): void {
    this.cursorTween?.stop();
    const slot = this.slots[this.current];
    this.slots.forEach((s) => s.box.setScale(1));
    if (!slot) return;
    slot.box.setPosition(slot.x, slot.letter.y);
    this.cursorTween = this.scene.tweens.add({
      targets: slot.box,
      scale: 1.08,
      duration: 380,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
  }

  private drawSlot(slot: Slot, state: 'empty' | 'current' | 'filled' | 'failed', y: number): void {
    const { box, size } = slot;
    const h = Math.round(size * 1.12);
    const styles = {
      empty: { fill: 0xffffff, line: 0xd9b98a, width: 3 },
      current: { fill: 0xfffbe8, line: 0xffb000, width: 4 },
      filled: { fill: 0xeaffea, line: 0x5ccf4a, width: 3 },
      failed: { fill: 0xe8e0dc, line: 0x9a8f88, width: 3 },
    }[state];
    // Vẽ quanh (0,0) rồi đặt box vào tâm ô để có thể scale nhịp đập
    box.clear();
    box.setPosition(slot.x, y);
    box.fillStyle(styles.fill, 1).fillRoundedRect(-size / 2, -h / 2, size, h, 8);
    box.lineStyle(styles.width, styles.line, 1).strokeRoundedRect(-size / 2, -h / 2, size, h, 8);
  }
}
