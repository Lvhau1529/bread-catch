/**
 * Khung đề bài (bong bóng lời nói của streamer): tranh / ký hiệu âm / các ô chữ + nút loa nghe lại.
 *
 *   hear-and-tap      [  🔊  ?  ]          (không đọc được: hiện ký hiệu âm "/d/")
 *   picture-to-sound  [ tranh ][ 🔊 ]
 *   find-the-word     [ "/d/" ][ 🔊 ]
 *   build / listen    [ tranh ][ _ _ _ ][ 🔊 ]
 *   missing-letter    [ tranh ][ d _ g ][ 🔊 ]
 */
import Phaser from 'phaser';
import { DEPTH, THEME } from '@/games/food-stream/game/config/theme';
import { addText } from '@/games/food-stream/game/ui/text';
import type { Question } from '@/games/food-stream/session/types';

const PADDING = 10;
const SLOT_GAP = 6;

interface Slot {
  box: Phaser.GameObjects.Graphics;
  text: Phaser.GameObjects.Text;
  width: number;
  height: number;
}

export default class PromptPanel extends Phaser.GameObjects.Container {
  private readonly content: Phaser.GameObjects.Container;
  private readonly speaker: Phaser.GameObjects.Image;
  private speakerTween: Phaser.Tweens.Tween | null = null;
  private slots: Slot[] = [];
  private cursorTween: Phaser.Tweens.Tween | null = null;

  constructor(
    scene: Phaser.Scene,
    private readonly area: Phaser.Geom.Rectangle,
    onReplay: () => void,
  ) {
    super(scene, 0, 0);
    this.setDepth(DEPTH.PANEL);
    const bubble = scene.add.graphics();
    bubble.fillStyle(THEME.hex.white).fillRoundedRect(area.x, area.y, area.width, area.height, 18);
    bubble.lineStyle(4, THEME.hex.pink).strokeRoundedRect(area.x, area.y, area.width, area.height, 18);
    // Đuôi bong bóng chỉ lên streamer
    const tailX = area.centerX;
    bubble
      .fillStyle(THEME.hex.white)
      .fillTriangle(tailX - 12, area.y + 2, tailX + 12, area.y + 2, tailX, area.y - 12);
    bubble
      .lineStyle(4, THEME.hex.pink)
      .lineBetween(tailX - 12, area.y, tailX, area.y - 12)
      .lineBetween(tailX, area.y - 12, tailX + 12, area.y);
    this.content = scene.add.container(0, 0);

    const speakerSize = Math.min(64, area.height - PADDING * 2);
    this.speaker = scene.add.image(area.right - PADDING - speakerSize / 2, area.centerY, 'ui.btn.speaker');
    this.speaker.setScale(speakerSize / this.speaker.width).setInteractive({ useHandCursor: true });
    this.speaker.on(Phaser.Input.Events.POINTER_DOWN, onReplay);

    this.add([bubble, this.content, this.speaker]);
    scene.add.existing(this);
  }

  show(question: Question): void {
    this.content.removeAll(true);
    this.slots = [];
    this.cursorTween?.stop();

    const left = this.area.x + PADDING;
    const right = this.speaker.x - this.speaker.displayWidth / 2 - PADDING;
    const centerY = this.area.centerY;
    const pictureSize = this.area.height - PADDING * 2;
    let cursor = left;

    if (question.promptImage) {
      this.content.add(this.pictureCard(left + pictureSize / 2, centerY, pictureSize, question.promptImage));
      cursor += pictureSize + PADDING;
    }
    const centerX = (cursor + right) / 2;

    if (question.slots) {
      this.addSlots(question, cursor, right, centerY);
    } else if (question.promptText) {
      this.content.add(
        addText(this.scene, centerX, centerY, question.promptText, 'learning', {
          fontSize: '52px',
          color: THEME.colors.pinkDark,
        }),
      );
    } else if (!question.promptImage) {
      // Chỉ nghe: dấu "?" to, nút loa nổi bật
      this.content.add(
        addText(this.scene, centerX, centerY, '?', 'learning', {
          fontSize: '60px',
          color: THEME.colors.purple,
        }),
      );
    }

    this.content.setAlpha(0);
    this.scene.tweens.add({ targets: this.content, alpha: 1, duration: 220 });
  }

  /** Điền chữ vào ô (ghép từ / chữ thiếu) */
  fillSlot(index: number, letter: string): void {
    const slot = this.slots[index];
    if (!slot) return;
    slot.text
      .setText(letter)
      .setColor(THEME.letterColors[index % THEME.letterColors.length])
      .setAlpha(1);
    this.scene.tweens.add({
      targets: slot.text,
      scale: { from: 1.6, to: 1 },
      duration: 260,
      ease: 'Back.easeOut',
    });
  }

  /** Ô đang cần điền nhấp nháy viền vàng */
  highlightSlot(index: number): void {
    this.cursorTween?.stop();
    this.slots.forEach((slot, i) => this.drawSlot(slot, i === index));
    const current = this.slots[index];
    if (current) {
      this.cursorTween = this.scene.tweens.add({
        targets: current.box,
        alpha: { from: 1, to: 0.45 },
        duration: 420,
        yoyo: true,
        repeat: -1,
      });
    }
  }

  /** Hiện đáp án (không đội nào trả lời đúng): điền nốt các ô còn trống bằng chữ mờ */
  revealSlots(question: Question, fromIndex: number): void {
    question.slots?.forEach((slot, index) => {
      if (index >= fromIndex && !slot.given) this.slots[index]?.text.setText(slot.letter).setAlpha(0.45);
    });
  }

  /** Nút loa nhấp nháy khi đang đọc */
  setSpeaking(speaking: boolean): void {
    this.speakerTween?.stop();
    this.speaker.setAlpha(1);
    this.speakerTween = speaking
      ? this.scene.tweens.add({ targets: this.speaker, alpha: 0.55, duration: 300, yoyo: true, repeat: -1 })
      : null;
  }

  private pictureCard(x: number, y: number, size: number, key: string): Phaser.GameObjects.Container {
    const card = this.scene.add.graphics();
    card.fillStyle(THEME.hex.pinkPale).fillRoundedRect(-size / 2, -size / 2, size, size, 12);
    card.lineStyle(3, THEME.hex.pinkLight).strokeRoundedRect(-size / 2, -size / 2, size, size, 12);
    const picture = this.scene.add.image(0, 0, key);
    picture.setScale((size * 0.84) / Math.max(picture.width, picture.height));
    const container = this.scene.add.container(x, y, [card, picture]);
    this.scene.tweens.add({
      targets: picture,
      angle: { from: -4, to: 4 },
      duration: 1200,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    return container;
  }

  private addSlots(question: Question, left: number, right: number, centerY: number): void {
    const slots = question.slots ?? [];
    const available = right - left;
    const width = Math.min(52, (available - SLOT_GAP * (slots.length - 1)) / slots.length);
    const height = Math.min(this.area.height - PADDING * 2, width * 1.25);
    const total = width * slots.length + SLOT_GAP * (slots.length - 1);
    let x = (left + right) / 2 - total / 2 + width / 2;

    slots.forEach((slotDef) => {
      const box = this.scene.add.graphics({ x, y: centerY });
      const text = addText(this.scene, x, centerY, slotDef.given ? slotDef.letter : '', 'learning', {
        fontSize: `${Math.round(width * 0.8)}px`,
      });
      const slot = { box, text, width, height };
      this.slots.push(slot);
      this.drawSlot(slot, false);
      this.content.add([box, text]);
      x += width + SLOT_GAP;
    });
  }

  private drawSlot(slot: Slot, current: boolean): void {
    const { box, width, height } = slot;
    box.clear().setAlpha(1);
    box
      .fillStyle(current ? 0xfff6c8 : THEME.hex.cream)
      .fillRoundedRect(-width / 2, -height / 2, width, height, 10);
    box
      .lineStyle(current ? 4 : 3, current ? THEME.hex.gold : THEME.hex.pinkLight)
      .strokeRoundedRect(-width / 2, -height / 2, width, height, 10);
  }
}
