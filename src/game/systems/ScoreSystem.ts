/**
 * Điểm, combo streak và hiệu ứng nhân điểm (Star).
 */
import { RULES } from '@/game/config/gameConfig';
import type { GameEventBus } from '@/game/core/events';

export function getComboMultiplier(streak: number): number {
  const tier = RULES.combo.find((step) => streak >= step.streak);
  return tier ? tier.multiplier : 1;
}

export default class ScoreSystem {
  score = 0;
  private streak = 0;
  private boost = { multiplier: 1, remaining: 0, duration: 0 };

  constructor(private readonly bus: GameEventBus) {}

  get comboMultiplier(): number {
    return getComboMultiplier(this.streak);
  }

  get boostMultiplier(): number {
    return this.boost.remaining > 0 ? this.boost.multiplier : 1;
  }

  /** Hứng được một item tốt: tăng streak, cộng điểm đã nhân combo & boost. */
  registerCatch(baseScore: number): { gained: number; comboMultiplier: number } {
    const previousCombo = this.comboMultiplier;
    this.streak += 1;
    const comboMultiplier = this.comboMultiplier;

    const gained = baseScore * comboMultiplier * this.boostMultiplier;
    if (gained > 0) this.change(gained);

    if (comboMultiplier !== previousCombo) {
      this.bus.emit('combo-changed', { multiplier: comboMultiplier, streak: this.streak });
    }
    return { gained, comboMultiplier };
  }

  /** Trừ điểm (không xuống dưới 0). Trả về số điểm thực sự bị trừ. */
  applyPenalty(amount: number): number {
    const lost = Math.min(this.score, Math.abs(amount));
    if (lost > 0) this.change(-lost);
    return lost;
  }

  breakCombo(): void {
    const hadCombo = this.comboMultiplier > 1;
    this.streak = 0;
    if (hadCombo) this.bus.emit('combo-changed', { multiplier: 1, streak: 0 });
  }

  activateBoost(multiplier: number, duration: number): void {
    this.boost = { multiplier, remaining: duration, duration };
    this.emitBoost();
  }

  update(delta: number): void {
    if (this.boost.remaining <= 0) return;
    this.boost.remaining = Math.max(0, this.boost.remaining - delta);
    this.emitBoost();
  }

  private change(delta: number): void {
    this.score += delta;
    this.bus.emit('score-changed', { score: this.score, delta });
  }

  private emitBoost(): void {
    this.bus.emit('boost-changed', {
      active: this.boost.remaining > 0,
      multiplier: this.boost.multiplier,
      remaining: this.boost.remaining,
      duration: this.boost.duration,
    });
  }
}
