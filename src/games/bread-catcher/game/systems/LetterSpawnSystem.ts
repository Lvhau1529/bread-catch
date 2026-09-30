/**
 * Rơi bánh chữ theo nhịp của level và thu hồi chữ rơi quá đáy (plan §10).
 *
 *   - Chữ cần hứng xuất hiện đều đặn: không bao giờ phải chờ quá
 *     SPAWN.maxWaitForExpected lượt rơi.
 *   - Chữ nhiễu lấy từ bộ chữ của gói từ đang học, tránh trùng lặp nhiều; một phần là
 *     các chữ PHÍA SAU của từ — "sai lúc này" nhưng sẽ cần ngay sau đó, giữ nhịp chơi liền mạch.
 *   - Hết từ thì dọn sạch mọi chữ đang rơi.
 *
 * Dùng Arcade Group làm object pool.
 */
import Phaser from 'phaser';
import { SPAWN } from '@/games/bread-catcher/game/config/gameConfig';
import { type HazardId } from '@/games/bread-catcher/game/config/hazards';
import { LETTER_BREADS } from '@/games/bread-catcher/game/config/stages';
import type { GameEventBus } from '@/games/bread-catcher/game/core/events';
import { view } from '@/platform/phaser/view';
import FallingItem from '@/games/bread-catcher/game/objects/FallingItem';
import type { LevelDef } from '@/games/bread-catcher/session/settings';
import { pickRandom } from '@/shared/random';

export interface SpawnOptions {
  y?: number;
  speedScale?: number;
}

export default class LetterSpawnSystem {
  readonly group: Phaser.Physics.Arcade.Group;
  private elapsed = 0;
  private paused = true;
  private expected: string | null = null;
  /** Các chữ phía sau chữ cần hứng trong từ hiện tại */
  private upcoming: string[] = [];
  /** Số lượt rơi liên tiếp không có chữ cần hứng */
  private sinceExpected = 0;
  private lastX: number | null = null;
  private lastLetter: string | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bus: GameEventBus,
    private readonly level: LevelDef,
    /** Bộ chữ của gói từ (nguồn chữ nhiễu) */
    private readonly letters: readonly string[],
    /** Chữ xuất hiện ngay dưới HUD */
    private readonly startY: number,
  ) {
    this.group = scene.physics.add.group({
      classType: FallingItem,
      maxSize: SPAWN.poolSize,
      allowGravity: false,
    });
  }

  get activeItems(): FallingItem[] {
    return this.group.getMatching('active', true) as FallingItem[];
  }

  get isPaused(): boolean {
    return this.paused;
  }

  get expectedLetter(): string | null {
    return this.expected;
  }

  /** Chữ cần hứng là `word[index]`. Nếu trên màn hình chưa có chữ đó thì cho rơi ngay. */
  setTarget(word: string, index: number): void {
    const expected = word[index];
    this.expected = expected;
    this.upcoming = [...new Set(word.slice(index + 1))].filter((letter) => letter !== expected);

    const alreadyFalling = (this.countOnScreen().get(expected) ?? 0) > 0;
    if (index === 0 || !alreadyFalling) {
      this.sinceExpected = SPAWN.maxWaitForExpected;
      this.elapsed = Math.max(this.elapsed, this.level.spawnMs * (1 - SPAWN.firstSpawnRatio));
    }
  }

  update(delta: number): void {
    this.recycleFallen();
    if (this.paused) return;

    this.elapsed += delta;
    if (this.elapsed >= this.level.spawnMs) {
      this.elapsed = 0;
      this.spawnNext();
    }
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  /** Dừng rơi và đứng yên mọi vật đang rơi (hứng nhầm / hết giờ) */
  freeze(): void {
    this.pause();
    this.activeItems.forEach((item) => {
      item.body.stop();
      item.body.setAllowGravity(false);
      item.setAngularVelocity(0);
    });
  }

  /** Dọn sạch màn hình khi chuyển từ */
  clear(): void {
    this.activeItems.forEach((item) => (item.body.enable ? item.vanish() : item.despawn()));
  }

  /** Rơi một vật cản (prank mưa trứng, bom) */
  spawnHazard(hazard: HazardId, x: number, options: SpawnOptions = {}): FallingItem | null {
    const item = this.acquire();
    if (!item) return null;
    item.spawnHazard(hazard, x, options.y ?? this.startY, this.speed(options.speedScale));
    this.bus.emit('item-spawned', item);
    return item;
  }

  /** Một chữ nhiễu ngẫu nhiên khác `exclude` (dùng cho trò đổi chữ) */
  randomDistractor(exclude: string): string {
    const pool = this.letters.filter((letter) => letter !== exclude);
    return pool.length > 0 ? pickRandom(pool) : exclude;
  }

  private spawnNext(): void {
    const letter = this.pickLetter();
    if (!letter) return;
    const item = this.acquire();
    if (!item) return; // pool đầy

    item.spawnLetter(letter, pickRandom(LETTER_BREADS), this.pickX(), this.startY, this.speed());
    this.lastLetter = letter;
    this.sinceExpected = letter === this.expected ? 0 : this.sinceExpected + 1;
    this.bus.emit('item-spawned', item);
  }

  private pickLetter(): string | null {
    const expected = this.expected;
    if (!expected) return null;

    const onScreen = this.countOnScreen();
    const expectedCount = onScreen.get(expected) ?? 0;
    const chance = expectedCount === 0 ? SPAWN.expectedChanceWhenMissing : SPAWN.expectedChance;
    const mustSpawnExpected = this.sinceExpected >= SPAWN.maxWaitForExpected;

    if (expectedCount < SPAWN.maxSameLetterOnScreen && (mustSpawnExpected || Math.random() < chance)) {
      return expected;
    }

    // Chữ nhiễu: khác chữ cần hứng, chưa có trên màn hình, khác chữ vừa rơi
    const usable = (letter: string) =>
      letter !== expected && letter !== this.lastLetter && (onScreen.get(letter) ?? 0) === 0;
    const upcoming = this.upcoming.filter(usable);
    if (upcoming.length > 0 && Math.random() < SPAWN.upcomingChance) return pickRandom(upcoming);

    const distractors = this.letters.filter(usable);
    return distractors.length > 0 ? pickRandom(distractors) : expected;
  }

  /** Số bản sao của từng chữ đang rơi (chưa qua miệng rổ) */
  private countOnScreen(): Map<string, number> {
    const counts = new Map<string, number>();
    this.activeItems.forEach((item) => {
      if (!item.body.enable || !item.letter) return;
      counts.set(item.letter, (counts.get(item.letter) ?? 0) + 1);
    });
    return counts;
  }

  private acquire(): FallingItem | null {
    return this.group.get() as FallingItem | null;
  }

  private speed(scale = 1): number {
    const variance = 1 + Phaser.Math.FloatBetween(-SPAWN.speedVariance, SPAWN.speedVariance);
    return this.level.fallSpeed * variance * scale;
  }

  private pickX(): number {
    const min = SPAWN.edgeMargin;
    const max = view(this.scene).width - SPAWN.edgeMargin;
    let x = Phaser.Math.Between(min, max);
    for (let tries = 0; tries < 6 && this.lastX !== null; tries += 1) {
      if (Math.abs(x - this.lastX) >= SPAWN.minGapFromLast) break;
      x = Phaser.Math.Between(min, max);
    }
    this.lastX = x;
    return x;
  }

  private recycleFallen(): void {
    const bottom = view(this.scene).height;
    this.activeItems.forEach((item) => {
      if (item.body.enable && item.y - item.displayHeight / 2 > bottom) {
        this.bus.emit('item-missed', item);
        item.despawn();
      }
    });
  }
}
