/**
 * Gameplay chính. Scene chỉ "điều phối": tạo các system, nối event,
 * và áp luật khi hứng / bỏ lỡ vật phẩm. Logic chi tiết nằm trong systems/.
 *
 * TROLL MODE: thêm TrollSystem và không thể thua (hết mạng thì hồi đầy);
 * còn lại luật chơi giữ nguyên ở cả 2 mode.
 */
import Phaser from 'phaser';
import { SFX } from '@/game/config/assets';
import { PLAYER, THEME, TIMING } from '@/game/config/gameConfig';
import { ItemCategory, type ItemDef } from '@/game/config/items';
import { STAGES } from '@/game/config/levels';
import { MODE_LABELS, TROLL_RULES } from '@/game/config/troll';
import { GameEventBus, type GameEventMap } from '@/game/core/events';
import { SCENES } from '@/game/core/keys';
import { getAudio, getSave } from '@/game/core/services';
import type FallingItem from '@/game/objects/FallingItem';
import PlayerBasket from '@/game/objects/PlayerBasket';
import StageBackground from '@/game/objects/StageBackground';
import type AudioSystem from '@/game/systems/AudioSystem';
import EffectsSystem from '@/game/systems/EffectsSystem';
import InputController from '@/game/systems/InputController';
import LevelSystem from '@/game/systems/LevelSystem';
import LifeSystem from '@/game/systems/LifeSystem';
import ScoreSystem from '@/game/systems/ScoreSystem';
import SpawnSystem from '@/game/systems/SpawnSystem';
import TrollSystem from '@/game/systems/troll/TrollSystem';
import ComboLabel from '@/game/ui/ComboLabel';
import Hud from '@/game/ui/Hud';
import LevelUpBanner from '@/game/ui/LevelUpBanner';
import type { GameOverData } from '@/game/scenes/GameOverScene';

const { colors } = THEME;

export default class GameScene extends Phaser.Scene {
  private bus!: GameEventBus;
  private audio!: AudioSystem;
  private score!: ScoreSystem;
  private lives!: LifeSystem;
  private levels!: LevelSystem;
  private spawner!: SpawnSystem;
  private effects!: EffectsSystem;
  private controls!: InputController;
  private basket!: PlayerBasket;
  private background!: StageBackground;
  private comboLabel!: ComboLabel;
  private banner!: LevelUpBanner;
  /** null ở NORMAL MODE */
  private troll: TrollSystem | null = null;
  private canLose = true;
  private isOver = false;

  constructor() {
    super(SCENES.GAME);
  }

  create(): void {
    const { width, height } = this.scale;
    this.isOver = false;
    this.physics.world.timeScale = 1;

    this.bus = new GameEventBus();
    this.audio = getAudio(this);
    this.score = new ScoreSystem(this.bus);
    this.lives = new LifeSystem(this.bus);
    this.levels = new LevelSystem(this.bus);

    this.background = new StageBackground(
      this,
      STAGES[this.levels.unlocked.stage].background,
      THEME.gameplayBackgroundTint,
    );
    this.basket = new PlayerBasket(
      this,
      width / 2,
      height - PLAYER.bottomMargin,
      this.levels.unlocked.basket,
    );
    this.controls = new InputController(this, () => this.basket.x);
    this.spawner = new SpawnSystem(this, this.bus, this.levels, this.lives);
    this.effects = new EffectsSystem(this);
    this.comboLabel = new ComboLabel(this);
    this.banner = new LevelUpBanner(this);

    const mode = getSave(this).get('mode');
    this.troll = mode === 'troll' ? this.createTrollSystem() : null;
    this.canLose = mode === 'normal' || TROLL_RULES.canLose;

    new Hud(this, this.bus, {
      lives: this.lives.lives,
      maxLives: this.lives.max,
      level: this.levels.level,
      badge: mode === 'troll' ? MODE_LABELS.troll : undefined,
      onPause: () => this.pauseGame(),
    });

    this.physics.add.overlap(this.basket, this.spawner.group, (_basket, item) => {
      this.handleCatch(item as FallingItem);
    });
    this.bindEvents();

    this.levels.handleScore(0); // đẩy trạng thái progress ban đầu lên HUD
    this.audio.playMusic(this, STAGES[this.levels.unlocked.stage].music);
    this.audio.preloadMusic(this, [STAGES[2].music, STAGES[3].music]);
    this.cameras.main.fadeIn(250);
  }

  override update(_time: number, delta: number): void {
    if (this.isOver) return;
    this.basket.move(delta, this.controls);
    this.spawner.update(delta);
    this.score.update(delta);
    this.troll?.update(delta);
    this.comboLabel.follow(this.basket.x, this.basket.y - this.basket.displayHeight);
  }

  // -------------------------------------------------------------------------
  // Wiring
  // -------------------------------------------------------------------------
  private createTrollSystem(): TrollSystem {
    return new TrollSystem({
      scene: this,
      bus: this.bus,
      basket: this.basket,
      controls: this.controls,
      spawner: this.spawner,
      score: this.score,
      effects: this.effects,
      banner: this.banner,
      audio: this.audio,
      getLevel: () => this.levels.level,
    });
  }

  private bindEvents(): void {
    this.bus
      .on('score-changed', ({ score }) => {
        if (!this.isOver) this.levels.handleScore(score);
      })
      .on('combo-changed', ({ multiplier }) => this.comboLabel.setMultiplier(multiplier))
      .on('level-up', (payload) => this.playLevelUp(payload))
      .on('item-missed', (item) => this.handleMiss(item));

    // Phím tắt pause + tự pause khi chuyển app / khoá màn hình (mobile)
    this.input.keyboard?.on('keydown-P', () => this.pauseGame());
    this.input.keyboard?.on('keydown-ESC', () => this.pauseGame());
    this.game.events.on(Phaser.Core.Events.HIDDEN, this.pauseGame, this);
    this.game.events.on(Phaser.Core.Events.BLUR, this.pauseGame, this);

    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      this.game.events.off(Phaser.Core.Events.HIDDEN, this.pauseGame, this);
      this.game.events.off(Phaser.Core.Events.BLUR, this.pauseGame, this);
      this.bus.destroy();
    });
  }

  // -------------------------------------------------------------------------
  // Catch / miss rules
  // -------------------------------------------------------------------------
  private handleCatch(item: FallingItem): void {
    const def = item.def;
    if (!def || this.isOver) return;
    if (this.troll?.interceptCatch(item)) return; // vd: vật phẩm nảy khỏi rổ

    const { x, y } = item;
    this.troll?.onCaught(item);
    this.bus.emit('item-caught', item);
    item.collect(this.basket.x, this.basket.rimY);
    this.basket.squash();

    if (def.category === ItemCategory.BAD) this.catchBadItem(def, x, y);
    else this.catchGoodItem(def, x, y);
  }

  private catchGoodItem(def: ItemDef, x: number, y: number): void {
    const { gained, comboMultiplier } = this.score.registerCatch(def.score);
    this.effects.catchBurst(x, y);
    if (gained > 0) this.effects.popup(x, y - 16, `+${gained}`);

    switch (def.effect?.type) {
      case 'score-boost':
        this.score.activateBoost(def.effect.multiplier, def.effect.duration);
        this.effects.popup(x, y - 40, `x${def.effect.multiplier} SCORE!`, colors.gold);
        break;
      case 'heal':
        this.lives.heal(def.effect.amount);
        this.effects.popup(x, y - 40, '+1 LIFE', colors.pink);
        break;
    }

    // Combo càng cao, tiếng hứng càng cao (1.00 → 1.15)
    const rate = def.sfx ? 1 : 1 + (comboMultiplier - 1) * 0.05 + Phaser.Math.FloatBetween(-0.03, 0.03);
    this.audio.playSfx(def.sfx ?? SFX.BREAD_CATCH, { rate });
  }

  private catchBadItem(def: ItemDef, x: number, y: number): void {
    this.score.breakCombo();
    this.effects.shake('strong');
    this.audio.playSfx(def.sfx ?? SFX.BAD_ITEM);

    if (def.score < 0) {
      const lost = this.score.applyPenalty(def.score);
      this.effects.popup(x, y - 16, lost > 0 ? `-${lost}` : 'OOPS!', colors.red);
    }

    switch (def.effect?.type) {
      case 'slow':
        this.basket.applySlow(def.effect.speedMultiplier, def.effect.duration);
        this.effects.slowAura(this.basket, def.effect.duration);
        this.effects.announce('EWW! MOLDY!', colors.green);
        this.bus.emit('basket-slowed', { duration: def.effect.duration });
        break;
      case 'damage':
        this.lives.damage(def.effect.amount);
        this.effects.popup(x, y - 16, 'OUCH!', colors.red);
        this.checkGameOver();
        break;
    }
  }

  private handleMiss(item: FallingItem): void {
    if (!item.def?.missPenalty || this.isOver) return;
    this.lives.damage(1);
    this.score.breakCombo();
    this.effects.shake('light');
    this.effects.popup(item.x, this.scale.height - 40, 'MISS', colors.red);
    this.audio.playSfx(SFX.UI_CANCEL, { volumeScale: 0.8 });
    this.checkGameOver();
  }

  // -------------------------------------------------------------------------
  // Level up: slow-mo → sparkle → banner → đổi rổ/background/nhạc → tiếp tục
  // -------------------------------------------------------------------------
  private playLevelUp({ level, unlocks }: GameEventMap['level-up']): void {
    const { width, height } = this.scale;
    // Tắt troll TRƯỚC khi pause spawner: hoàn tác prank không được đè trạng thái level up
    this.troll?.setEnabled(false);
    this.spawner.pause();
    this.physics.world.timeScale = TIMING.levelUpSlowMotion;

    this.audio.playSfx(SFX.LEVEL_UP);
    this.effects.bigBurst(width / 2, height * 0.38);
    this.banner.play(level, unlocks);

    const { basket, stage } = this.levels.unlocked;
    this.basket.setTier(basket);
    if (unlocks.some((u) => u.type === 'stage')) {
      this.background.transitionTo(STAGES[stage].background);
      this.audio.playMusic(this, STAGES[stage].music);
    }

    this.time.delayedCall(TIMING.levelUp, () => {
      if (this.isOver) return;
      this.physics.world.timeScale = 1;
      this.spawner.resume();
      this.troll?.setEnabled(true);
    });
  }

  // -------------------------------------------------------------------------
  // Pause / game over
  // -------------------------------------------------------------------------
  private pauseGame(): void {
    if (this.isOver || !this.scene.isActive()) return;
    this.controls.reset();
    this.scene.launch(SCENES.PAUSE);
    this.scene.pause();
  }

  /** TROLL MODE: không cho thua — hồi đầy mạng và trêu tiếp */
  private revive(): void {
    this.lives.heal(this.lives.max);
    this.effects.announce(Phaser.Utils.Array.GetRandom(TROLL_RULES.reviveLines) as string, colors.pink);
    this.audio.playSfx(SFX.HEART);
  }

  private checkGameOver(): void {
    if (!this.lives.isDead || this.isOver) return;
    if (!this.canLose) {
      this.revive();
      return;
    }
    this.isOver = true;
    this.controls.enabled = false;
    this.troll?.setEnabled(false);
    this.spawner.freeze();
    this.physics.world.timeScale = 1;
    this.audio.stopMusic();
    this.audio.playSfx(SFX.GAME_OVER);

    const finalScore = this.score.score;
    const finalLevel = this.levels.level;
    const { isNewBest, bestScore } = getSave(this).recordRun(finalScore, finalLevel);
    const data: GameOverData = { score: finalScore, level: finalLevel, bestScore, isNewBest };

    this.time.delayedCall(TIMING.gameOverDelay, () => {
      this.scene.launch(SCENES.GAME_OVER, data);
      this.scene.pause();
    });
  }
}
