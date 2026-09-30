/**
 * HUD trong lúc chơi (plan §17), tối ưu cho màn hình dọc 360px:
 *
 *   [🦁 LIONS]                         [⏱ 01:03]
 *   SCORE 100   WORD 2/5          [⏸] [↩] [■]
 *   ┌──────────── ô từ mục tiêu (TargetPanel) ───────────┐
 *
 * HUD chỉ lắng nghe event, không chứa logic gameplay.
 */
import type Phaser from 'phaser';
import { mascotTexture } from '@/game/config/assets';
import { DEPTH, THEME } from '@/game/config/gameConfig';
import type { GameEventBus } from '@/game/core/events';
import { view } from '@/game/core/view';
import IconButton from '@/game/ui/IconButton';
import { addText } from '@/game/ui/text';
import { UI_TEXT } from '@/session/text';
import type { Team } from '@/session/types';
import { formatTime } from '@/shared/format';

const { colors } = THEME;
/** Dưới ngần này giây thì đồng hồ chuyển đỏ và nhịp đập */
const TIMER_WARNING_S = 10;
const TIMER_SIZE = { width: 96, height: 32 };

export interface HudOptions {
  team: Team;
  onPause: () => void;
  onBack: () => void;
  onEnd: () => void;
}

export default class Hud {
  private readonly scoreText: Phaser.GameObjects.Text;
  private readonly wordText: Phaser.GameObjects.Text;
  private readonly timerText: Phaser.GameObjects.Text;
  private readonly timerBox: Phaser.GameObjects.Container;
  private warning = false;

  constructor(
    private readonly scene: Phaser.Scene,
    bus: GameEventBus,
    options: HudOptions,
  ) {
    const { width } = view(scene);
    this.addTopShade();

    // Hàng 1: đội + đồng hồ
    const mascot = scene.add.image(24, 24, mascotTexture(options.team.mascot)).setDepth(DEPTH.HUD);
    mascot.setScale(34 / mascot.height);
    addText(scene, 46, 24, options.team.name, 'outline', { fontSize: '19px', fontStyle: '800' })
      .setOrigin(0, 0.5)
      .setDepth(DEPTH.HUD);

    this.timerText = addText(scene, 12, 1, '00:00', 'label', { fontSize: '19px', fontStyle: '800' });
    this.timerBox = scene.add
      .container(width - TIMER_SIZE.width / 2 - 10, 24, [this.createTimerFrame(), this.timerText])
      .setDepth(DEPTH.HUD);

    // Hàng 2: điểm, số từ, nút giáo viên
    this.scoreText = addText(scene, 12, 62, '', 'outline', { fontSize: '17px' })
      .setOrigin(0, 0.5)
      .setDepth(DEPTH.HUD);
    this.wordText = addText(scene, 118, 62, '', 'outline', { fontSize: '17px', color: colors.gold })
      .setOrigin(0, 0.5)
      .setDepth(DEPTH.HUD);
    this.setScore(0, false);

    [
      new IconButton(scene, width - 24, 62, 'stop', options.onEnd),
      new IconButton(scene, width - 70, 62, 'back', options.onBack),
      new IconButton(scene, width - 116, 62, 'pause', options.onPause),
    ].forEach((button) => button.setDepth(DEPTH.HUD));

    bus
      .on('score-changed', ({ score }) => this.setScore(score, true))
      .on('timer-changed', ({ remainingMs }) => this.setTime(remainingMs))
      .on('word-started', ({ index, total }) => {
        this.wordText.setText(`${UI_TEXT.word} ${index + 1}/${total}`);
        this.pop(this.wordText, 1.25);
      });
  }

  private setScore(score: number, animate: boolean): void {
    this.scoreText.setText(`${UI_TEXT.score} ${score}`);
    if (animate) this.pop(this.scoreText, 1.3);
  }

  private setTime(remainingMs: number): void {
    this.timerText.setText(formatTime(remainingMs));
    const warning = remainingMs > 0 && remainingMs <= TIMER_WARNING_S * 1000;
    if (warning === this.warning) return;
    this.warning = warning;
    this.timerText.setColor(warning ? colors.red : colors.brown);
    this.scene.tweens.killTweensOf(this.timerBox);
    this.timerBox.setScale(1);
    if (warning) {
      this.scene.tweens.add({ targets: this.timerBox, scale: 1.1, duration: 250, yoyo: true, repeat: -1 });
    }
  }

  /** Khung kem + icon đồng hồ */
  private createTimerFrame(): Phaser.GameObjects.Graphics {
    const { width, height } = TIMER_SIZE;
    const g = this.scene.add.graphics();
    g.fillStyle(0xfff4dc, 1).fillRoundedRect(-width / 2, -height / 2, width, height, height / 2);
    g.lineStyle(3, 0x3b1a0b, 1).strokeRoundedRect(-width / 2, -height / 2, width, height, height / 2);
    // Đồng hồ
    const cx = -width / 2 + 17;
    g.fillStyle(0xff4d5e, 1).fillCircle(cx, 0, 10);
    g.fillStyle(0xffffff, 1).fillCircle(cx, 0, 7);
    g.lineStyle(2, 0x3b1a0b, 1)
      .lineBetween(cx, 0, cx, -5)
      .lineBetween(cx, 0, cx + 4, 0);
    return g;
  }

  private pop(target: Phaser.GameObjects.Text, scale: number): void {
    this.scene.tweens.killTweensOf(target);
    this.scene.tweens.add({
      targets: target,
      scale: { from: scale, to: 1 },
      duration: 220,
      ease: 'Back.easeOut',
    });
  }

  /** Dải tối mờ phía trên để HUD dễ đọc trên nền ảnh */
  private addTopShade(): void {
    const { width } = view(this.scene);
    const g = this.scene.add.graphics().setDepth(DEPTH.HUD - 1);
    g.fillGradientStyle(0x3b1a0b, 0x3b1a0b, 0x3b1a0b, 0x3b1a0b, 0.75, 0.75, 0.15, 0.15);
    g.fillRect(0, 0, width, 90);
  }
}
