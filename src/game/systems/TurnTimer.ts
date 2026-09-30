/**
 * Đồng hồ đếm ngược của một lượt (plan §16).
 * Chỉ chạy khi đang chơi: dừng lúc ăn mừng từ, chuyển từ, Pause và đếm ngược Resume.
 * (Scene bị pause thì `update` không được gọi nên cũng tự dừng.)
 */
import type { GameEventBus } from '@/game/core/events';

/** Phát `timer-changed` tối đa mỗi ngần này ms để HUD không vẽ lại mỗi frame */
const EMIT_INTERVAL_MS = 100;

export default class TurnTimer {
  private remaining: number;
  private running = false;
  private sinceEmit = 0;
  private expired = false;

  constructor(
    private readonly bus: GameEventBus,
    private readonly totalMs: number,
    private readonly onExpire: () => void,
  ) {
    this.remaining = totalMs;
    this.emit();
  }

  get remainingMs(): number {
    return this.remaining;
  }

  start(): void {
    if (!this.expired) this.running = true;
  }

  stop(): void {
    this.running = false;
  }

  update(delta: number): void {
    if (!this.running) return;
    this.remaining = Math.max(0, this.remaining - delta);
    this.sinceEmit += delta;
    if (this.sinceEmit >= EMIT_INTERVAL_MS || this.remaining === 0) this.emit();

    if (this.remaining === 0) {
      this.running = false;
      this.expired = true;
      this.onExpire();
    }
  }

  private emit(): void {
    this.sinceEmit = 0;
    this.bus.emit('timer-changed', { remainingMs: this.remaining, totalMs: this.totalMs });
  }
}
