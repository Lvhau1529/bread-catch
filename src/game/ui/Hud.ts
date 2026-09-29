/**
 * HUD trong lúc chơi:
 *
 *   ❤❤❤          [ SCORE ]          [LV]
 *   [PAUSE]         0245              03
 *              [=======-------]
 *                  245 / 300
 *               ★ x2  (khi có Star)
 *              SLOW 3s (khi dính mốc)
 *
 * HUD chỉ lắng nghe event, không chứa logic gameplay.
 */
import Phaser from 'phaser';
import { DIGIT_FONTS } from '@/game/config/assets';
import { DEPTH, THEME } from '@/game/config/gameConfig';
import type { GameEventBus } from '@/game/core/events';
import ImageButton from '@/game/ui/ImageButton';
import ProgressBar from '@/game/ui/ProgressBar';
import { anchorCenter } from '@/game/ui/layout';
import { addText } from '@/game/ui/text';

const HEART = 'hud_heart';
const HEART_SPACING = 28;
const SCORE_COUNT_MS = 250;

export interface HudOptions {
  lives: number;
  maxLives: number;
  level: number;
  /** Nhãn nhỏ góc phải (vd: "TROLL MODE"); bỏ trống thì không hiện */
  badge?: string;
  onPause: () => void;
}

export default class Hud {
  private readonly hearts: Phaser.GameObjects.Image[] = [];
  private readonly scoreText: Phaser.GameObjects.BitmapText;
  private readonly levelText: Phaser.GameObjects.BitmapText;
  private readonly levelPanel: Phaser.GameObjects.Image;
  private readonly progressBar: ProgressBar;
  private readonly progressText: Phaser.GameObjects.Text;
  private readonly boostIcon: Phaser.GameObjects.Image;
  private readonly boostText: Phaser.GameObjects.Text;
  private readonly slowStatus: Phaser.GameObjects.Container;
  private slowCountdown: Phaser.Time.TimerEvent | null = null;
  private readonly displayedScore = { value: 0 };

  constructor(
    private readonly scene: Phaser.Scene,
    bus: GameEventBus,
    options: HudOptions,
  ) {
    const { width } = scene.scale;
    const cx = width / 2;

    this.addTopShade();

    // Hearts + pause (trái)
    for (let i = 0; i < options.maxLives; i += 1) {
      this.hearts.push(scene.add.image(24 + i * HEART_SPACING, 24, HEART).setDepth(DEPTH.HUD));
    }
    this.setLives(options.lives, 0);
    new ImageButton(scene, 50, 62, 'btn_pause', options.onPause).setDepth(DEPTH.HUD);

    // Score (giữa)
    const scorePanel = scene.add.image(cx, 40, 'panel_score').setDepth(DEPTH.HUD);
    const scoreAt = anchorCenter(scene, 'panel_score', 'value');
    this.scoreText = scene.add
      .bitmapText(scorePanel.x + scoreAt.x, scorePanel.y + scoreAt.y, DIGIT_FONTS.SMALL, '0')
      .setOrigin(0.5)
      .setDepth(DEPTH.HUD);

    // Level (phải)
    this.levelPanel = scene.add.image(width - 48, 40, 'panel_level').setDepth(DEPTH.HUD);
    const levelAt = anchorCenter(scene, 'panel_level', 'value');
    this.levelText = scene.add
      .bitmapText(this.levelPanel.x + levelAt.x, this.levelPanel.y + levelAt.y, DIGIT_FONTS.SMALL, '')
      .setOrigin(0.5)
      .setDepth(DEPTH.HUD);
    this.setLevel(options.level, false);

    // Progress
    this.progressBar = new ProgressBar(scene, cx, 96).setDepth(DEPTH.HUD);
    this.progressText = addText(scene, cx, 122, '', 'small').setDepth(DEPTH.HUD);

    // Star boost
    this.boostIcon = scene.add
      .image(cx - 22, 146, 'hud_star')
      .setDepth(DEPTH.HUD)
      .setVisible(false);
    this.boostText = addText(scene, cx + 10, 146, '', 'outline', { color: THEME.colors.gold })
      .setDepth(DEPTH.HUD)
      .setVisible(false);

    // Dính mốc
    const slowText = addText(scene, 12, 0, '', 'outline', { color: THEME.colors.green });
    this.slowStatus = scene.add
      .container(cx - 6, 170, [scene.add.image(-26, 0, 'bread_moldy').setScale(0.55), slowText])
      .setDepth(DEPTH.HUD)
      .setVisible(false);

    if (options.badge) this.addBadge(options.badge);

    bus
      .on('score-changed', ({ score }) => this.setScore(score))
      .on('lives-changed', ({ lives, delta }) => this.setLives(lives, delta))
      .on('level-up', ({ level }) => this.setLevel(level, true))
      .on('progress-changed', ({ current, next, ratio }) => {
        this.progressBar.setRatio(ratio);
        this.progressText.setText(`${current} / ${next}`);
      })
      .on('boost-changed', ({ active, multiplier, remaining }) => {
        this.boostIcon.setVisible(active);
        this.boostText.setVisible(active).setText(`x${multiplier} ${Math.ceil(remaining / 1000)}s`);
      })
      .on('basket-slowed', ({ duration }) => this.showSlow(slowText, duration));
  }

  /** Đếm ngược thời gian rổ còn bị dính mốc */
  private showSlow(label: Phaser.GameObjects.Text, duration: number): void {
    const endAt = this.scene.time.now + duration;
    const refresh = () => {
      const remaining = Math.max(0, endAt - this.scene.time.now);
      label.setText(`SLOW ${Math.ceil(remaining / 1000)}s`);
      this.slowStatus.setVisible(remaining > 0);
      if (remaining <= 0) this.slowCountdown?.remove();
    };
    this.slowCountdown?.remove();
    this.slowCountdown = this.scene.time.addEvent({ delay: 100, loop: true, callback: refresh });
    refresh();
    this.pop(this.slowStatus, 1.4);
  }

  private setScore(score: number): void {
    this.scene.tweens.killTweensOf(this.displayedScore);
    this.scene.tweens.add({
      targets: this.displayedScore,
      value: score,
      duration: SCORE_COUNT_MS,
      onUpdate: () => this.scoreText.setText(String(Math.round(this.displayedScore.value))),
    });
    this.pop(this.scoreText, 1.2);
  }

  private setLives(lives: number, delta: number): void {
    this.hearts.forEach((heart, index) => {
      const alive = index < lives;
      heart.setAlpha(alive ? 1 : 0.35);
      if (alive) heart.clearTint();
      else heart.setTint(0x555555);
    });

    // Tim vừa mất / vừa hồi thì nảy lên
    const changedIndex = delta < 0 ? lives : lives - 1;
    const changed = this.hearts[changedIndex];
    if (delta !== 0 && changed) this.pop(changed, delta < 0 ? 1.6 : 1.4);
  }

  private setLevel(level: number, animate: boolean): void {
    this.levelText.setText(String(level).padStart(2, '0'));
    if (animate) this.pop(this.levelPanel, 1.25);
  }

  private pop(
    target: Phaser.GameObjects.Components.Transform & Phaser.GameObjects.GameObject,
    scale: number,
  ): void {
    this.scene.tweens.killTweensOf(target);
    this.scene.tweens.add({
      targets: target,
      scale: { from: scale, to: 1 },
      duration: 220,
      ease: 'Back.easeOut',
    });
  }

  private addBadge(text: string): void {
    const badge = addText(this.scene, this.scene.scale.width - 8, 122, text, 'small', {
      color: THEME.colors.pink,
    })
      .setOrigin(1, 0.5)
      .setDepth(DEPTH.HUD);
    this.scene.tweens.add({
      targets: badge,
      angle: { from: -4, to: 4 },
      duration: 600,
      yoyo: true,
      repeat: -1,
    });
  }

  /** Dải tối mờ phía trên để HUD dễ đọc trên nền ảnh */
  private addTopShade(): void {
    const { width } = this.scene.scale;
    const g = this.scene.add.graphics().setDepth(DEPTH.HUD - 1);
    g.fillGradientStyle(0x3b1a0b, 0x3b1a0b, 0x3b1a0b, 0x3b1a0b, 0.55, 0.55, 0, 0);
    g.fillRect(0, 0, width, 150);
  }
}
