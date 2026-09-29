/**
 * Số mạng của người chơi.
 */
import { RULES } from '@/game/config/gameConfig';
import type { GameEventBus } from '@/game/core/events';

export default class LifeSystem {
  readonly max: number = RULES.maxLives;
  lives: number = RULES.startLives;

  constructor(private readonly bus: GameEventBus) {}

  get isDead(): boolean {
    return this.lives <= 0;
  }

  get isFull(): boolean {
    return this.lives >= this.max;
  }

  damage(amount = 1): void {
    this.set(this.lives - amount);
  }

  heal(amount = 1): void {
    this.set(this.lives + amount);
  }

  private set(value: number): void {
    const next = Math.max(0, Math.min(this.max, value));
    const delta = next - this.lives;
    if (delta === 0) return;
    this.lives = next;
    this.bus.emit('lives-changed', { lives: this.lives, max: this.max, delta });
  }
}
