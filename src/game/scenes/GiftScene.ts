/**
 * Winner's Gift (plan §23): đội thắng chọn 1 trong 3 hộp quà.
 * Đồng hạng nhất -> lần lượt từng đội đều được mở quà.
 * Nội dung quà lấy từ session/rewards.ts (đang là placeholder).
 */
import Phaser from 'phaser';
import { MUSIC, SFX, mascotTexture } from '@/game/config/assets';
import { DEPTH, THEME } from '@/game/config/gameConfig';
import { STAGE_BACKGROUNDS } from '@/game/config/stages';
import { SCENES } from '@/game/core/keys';
import { getAudio } from '@/game/core/services';
import { setupView, view } from '@/game/core/view';
import { addStageBackground } from '@/game/objects/StageBackground';
import IconButton from '@/game/ui/IconButton';
import TextButton from '@/game/ui/TextButton';
import { addText } from '@/game/ui/text';
import { rankTeams, winnersOf, type Standing } from '@/session/ranking';
import { REWARDS } from '@/session/rewards';
import { appStore, sessionActions } from '@/session/sessionStore';
import { UI_TEXT } from '@/session/text';
import { shuffle } from '@/shared/random';

const GIFT_COUNT = 3;
const GIFT_SPACING = 108;

export default class GiftScene extends Phaser.Scene {
  private winners: Standing[] = [];
  private winnerIndex = 0;
  private layer!: Phaser.GameObjects.Container;
  private stars!: Phaser.GameObjects.Particles.ParticleEmitter;

  constructor() {
    super(SCENES.GIFT);
  }

  create(): void {
    setupView(this);
    const session = appStore.get().session;
    if (!session) return;
    this.winners = winnersOf(rankTeams(session.teams, session.results));
    this.winnerIndex = 0;

    addStageBackground(this, STAGE_BACKGROUNDS[2], 0xa89888);
    this.stars = this.add
      .particles(0, 0, 'star', {
        speed: { min: 120, max: 280 },
        angle: { min: 200, max: 340 },
        scale: { start: 0.6, end: 0 },
        rotate: { min: -180, max: 180 },
        gravityY: 320,
        lifespan: 900,
        emitting: false,
      })
      .setDepth(DEPTH.FX);
    new IconButton(this, 30, 30, 'back', () => sessionActions.backToResults()).setDepth(DEPTH.HUD);

    getAudio(this).playMusic(MUSIC.GIFT);
    this.showWinner();
    this.cameras.main.fadeIn(300);
  }

  private showWinner(): void {
    const { width, height } = view(this);
    const standing = this.winners[this.winnerIndex];
    if (!standing) return;
    this.layer?.destroy();
    this.layer = this.add.container(0, 0);

    const title = addText(this, width / 2, height * 0.1, UI_TEXT.winner, 'title', { fontSize: '44px' });
    const mascot = this.add
      .image(width / 2, height * 0.27, mascotTexture(standing.team.mascot))
      .setScale(1.3);
    const crown = this.add.image(width / 2, mascot.y - mascot.displayHeight / 2 - 8, 'crown');
    const name = addText(this, width / 2, height * 0.4, standing.team.name, 'title', {
      fontSize: '30px',
      color: THEME.colors.cream,
    });
    const prompt = addText(
      this,
      width / 2,
      height * 0.47,
      `${UI_TEXT.openGift} ${UI_TEXT.chooseBox}`,
      'outline',
      {
        fontSize: '18px',
        color: THEME.colors.gold,
      },
    );
    this.layer.add([title, mascot, crown, name, prompt]);
    this.tweens.add({
      targets: [mascot, crown],
      y: '-=8',
      duration: 700,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });
    this.tweens.add({ targets: title, scale: { from: 0, to: 1 }, duration: 400, ease: 'Back.easeOut' });

    const rewards = shuffle(REWARDS);
    const gifts = Array.from({ length: GIFT_COUNT }, (_, index) => {
      const x = width / 2 + (index - (GIFT_COUNT - 1) / 2) * GIFT_SPACING;
      const gift = this.add
        .image(x, height * 0.64, `gift_closed_${String(index + 1).padStart(2, '0')}`)
        .setInteractive({ useHandCursor: true });
      this.tweens.add({
        targets: gift,
        angle: { from: -5, to: 5 },
        duration: 300 + index * 60,
        yoyo: true,
        repeat: -1,
        ease: 'Sine.easeInOut',
      });
      this.layer.add(gift);
      return gift;
    });

    gifts.forEach((gift, index) => {
      gift.once(Phaser.Input.Events.GAMEOBJECT_POINTER_UP, () => {
        gifts.forEach((other) => other.disableInteractive());
        this.openGift(gifts, index, rewards[index % rewards.length], prompt);
      });
    });
  }

  private openGift(
    gifts: Phaser.GameObjects.Image[],
    index: number,
    reward: (typeof REWARDS)[number],
    prompt: Phaser.GameObjects.Text,
  ): void {
    const { width, height } = view(this);
    const gift = gifts[index];
    const audio = getAudio(this);
    prompt.setVisible(false);

    gifts.forEach((other) => {
      this.tweens.killTweensOf(other);
      if (other !== gift) this.tweens.add({ targets: other, alpha: 0.25, scale: 0.85, duration: 250 });
    });
    this.tweens.add({
      targets: gift,
      x: width / 2,
      scale: 1.3,
      angle: 0,
      duration: 300,
      ease: 'Back.easeOut',
    });

    this.time.delayedCall(350, () => {
      audio.playSfx(SFX.GIFT_OPEN);
      gift.setTexture(`gift_open_${String(index + 1).padStart(2, '0')}`);
      this.stars.explode(24, gift.x, gift.y - 20);
      this.cameras.main.flash(200, 255, 244, 200);

      const card = this.add.container(width / 2, height * 0.8);
      const bg = this.add.graphics();
      bg.fillStyle(0xfff4dc, 1).fillRoundedRect(-150, -46, 300, 92, 16);
      bg.lineStyle(4, 0x3b1a0b, 1).strokeRoundedRect(-150, -46, 300, 92, 16);
      card.add([
        bg,
        addText(this, 0, -20, reward.title, 'heading', { fontSize: '22px', color: THEME.colors.orange }),
        addText(this, 0, 16, reward.description, 'label', { fontSize: '15px', wordWrap: { width: 270 } }),
      ]);
      this.layer.add(card);
      this.tweens.add({ targets: card, scale: { from: 0, to: 1 }, duration: 350, ease: 'Back.easeOut' });

      this.time.delayedCall(700, () => this.showActions());
    });
  }

  private showActions(): void {
    const { width, height } = view(this);
    const y = height * 0.93;
    const hasNext = this.winnerIndex < this.winners.length - 1;

    if (hasNext) {
      this.layer.add(
        new TextButton(
          this,
          width / 2,
          y,
          UI_TEXT.nextWinner,
          () => {
            this.winnerIndex += 1;
            this.showWinner();
          },
          { color: 'green', width: 220 },
        ),
      );
      return;
    }
    this.layer.add([
      new TextButton(this, width / 2 - 82, y, UI_TEXT.playAgain, () => sessionActions.playAgain(), {
        color: 'green',
        width: 156,
        fontSize: 18,
        sfx: SFX.UI_START,
      }),
      new TextButton(this, width / 2 + 82, y, UI_TEXT.home, () => sessionActions.goHome(), {
        color: 'blue',
        width: 140,
        fontSize: 18,
      }),
    ]);
  }
}
