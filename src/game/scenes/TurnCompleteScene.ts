/**
 * Tổng kết sau mỗi lượt (plan §21):
 *
 *   TEAM TURN COMPLETE
 *   🦁 LIONS
 *   3 / 5 WORDS · 300 POINTS
 *   [NEXT TEAM]  (đội cuối: [FINAL RESULTS] · Solo: [SEE RESULTS])
 */
import Phaser from 'phaser';
import { SFX, mascotTexture } from '@/game/config/assets';
import { THEME } from '@/game/config/gameConfig';
import { SCENES } from '@/game/core/keys';
import { getAudio } from '@/game/core/services';
import { setupView } from '@/game/core/view';
import { createDim, createPanel } from '@/game/scenes/overlay';
import TextButton from '@/game/ui/TextButton';
import { addText } from '@/game/ui/text';
import { appStore, isSessionComplete, sessionActions } from '@/session/sessionStore';
import { UI_TEXT } from '@/session/text';
import type { Team, TurnResult } from '@/session/types';

export interface TurnCompleteData {
  team: Team;
  result: TurnResult;
  totalWords: number;
}

export default class TurnCompleteScene extends Phaser.Scene {
  constructor() {
    super(SCENES.TURN_COMPLETE);
  }

  create({ team, result, totalWords }: TurnCompleteData): void {
    setupView(this);
    const session = appStore.get().session;
    const isSolo = session?.settings.mode === 'solo';
    const isLastTurn = !session || isSessionComplete(session);

    createDim(this, 0.7);
    const panel = createPanel(this, 420);
    const top = panel.top;

    const mascot = this.add.image(0, top + 160, mascotTexture(team.mascot)).setScale(1.1);
    this.tweens.add({
      targets: mascot,
      y: mascot.y - 6,
      duration: 600,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut',
    });

    const [label, action] = isSolo
      ? [UI_TEXT.seeResults, () => sessionActions.finishSession()]
      : isLastTurn
        ? [UI_TEXT.finalResults, () => sessionActions.finishSession()]
        : [UI_TEXT.nextTeam, () => this.nextTeam()];
    const button = new TextButton(this, 0, top + 360, label, action, {
      color: 'green',
      width: 240,
      fontSize: 22,
    });

    panel.add([
      addText(this, 0, top + 96, isSolo ? UI_TEXT.greatJob : UI_TEXT.teamTurnComplete, 'heading', {
        fontSize: '23px',
      }),
      mascot,
      addText(this, 0, top + 222, team.name, 'heading', { fontSize: '28px', color: THEME.colors.orange }),
      addText(this, 0, top + 262, `${result.correctWords} / ${totalWords} ${UI_TEXT.words}`, 'label', {
        fontSize: '20px',
      }),
      addText(this, 0, top + 294, `${result.score} ${UI_TEXT.points}`, 'label', {
        fontSize: '24px',
        fontStyle: '800',
        color: THEME.colors.blue,
      }),
      button,
    ]);

    getAudio(this).playSfx(SFX.ROUND_COMPLETE);
    this.input.keyboard?.once('keydown-ENTER', () => button.trigger());
  }

  private nextTeam(): void {
    this.scene.stop(SCENES.GAME);
    this.scene.start(SCENES.TURN_PICKER);
  }
}
