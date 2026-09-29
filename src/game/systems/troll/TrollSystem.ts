/**
 * TROLL MODE — chỉ được tạo khi người chơi chọn mode 'troll'.
 *
 * Điều phối 2 nhóm trò:
 *   1. Prank toàn màn hình (pranks.ts): lần lượt từng cái, hồi chiêu ngắn.
 *   2. Trò của vật phẩm rơi (itemTricks.ts): gán ngẫu nhiên lúc spawn.
 *
 * Thêm trò mới: khai báo thông số trong config/troll.ts rồi thêm handler
 * vào pranks.ts / itemTricks.ts — không cần sửa file này.
 */
import Phaser from 'phaser';
import { ItemCategory } from '@/game/config/items';
import { TROLL_ITEMS, TROLL_PRANKS, type ItemTrickId, type PrankId } from '@/game/config/troll';
import { pickWeighted } from '@/game/core/random';
import type FallingItem from '@/game/objects/FallingItem';
import { EDGE, ITEM_TRICKS } from '@/game/systems/troll/itemTricks';
import { PRANKS } from '@/game/systems/troll/pranks';
import type { TrollContext } from '@/game/systems/troll/types';

const PRANK_WEIGHTS = Object.fromEntries(
  Object.entries(TROLL_PRANKS.list).map(([id, prank]) => [id, prank.weight]),
) as Record<PrankId, number>;

export default class TrollSystem {
  private elapsed = 0;
  private nextPrankAt = TROLL_PRANKS.graceMs;
  private enabled = true;
  /** Hàm hoàn tác prank đang chạy (null = không có prank) */
  private undoActivePrank: (() => void) | null = null;
  private prankTimer: Phaser.Time.TimerEvent | null = null;

  constructor(private readonly ctx: TrollContext) {
    ctx.bus.on('item-spawned', (item) => this.assignTrick(item));
  }

  update(delta: number): void {
    this.elapsed += delta;
    this.updateItems(delta);

    const canPrank = this.enabled && !this.undoActivePrank && !this.ctx.spawner.isPaused;
    if (canPrank && this.elapsed >= this.nextPrankAt) this.startPrank();
  }

  /** Tạm tắt (level up thật...) / bật lại. Tắt thì hoàn tác luôn prank đang chạy. */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
    if (!enabled) this.finishPrank();
  }

  /** Gọi trước khi rổ hứng; true = trò của item huỷ lần hứng này */
  interceptCatch(item: FallingItem): boolean {
    if (!item.trick) return false;
    return ITEM_TRICKS[item.trick.id].interceptCatch?.(item, item.trick, this.ctx) ?? false;
  }

  /** Gọi sau khi rổ đã hứng item */
  onCaught(item: FallingItem): void {
    if (item.trick) ITEM_TRICKS[item.trick.id].onCaught?.(item, this.ctx);
  }

  // -------------------------------------------------------------------------
  // Pranks
  // -------------------------------------------------------------------------
  private startPrank(): void {
    const run = PRANKS[pickWeighted<PrankId>(PRANK_WEIGHTS)](this.ctx);
    this.undoActivePrank = run.undo ?? (() => undefined);
    this.prankTimer = this.ctx.scene.time.delayedCall(run.duration, () => this.finishPrank());
  }

  private finishPrank(): void {
    this.prankTimer?.remove();
    this.prankTimer = null;
    if (!this.undoActivePrank) return;

    this.undoActivePrank();
    this.undoActivePrank = null;
    const { min, max } = TROLL_PRANKS.cooldownMs;
    this.nextPrankAt = this.elapsed + Phaser.Math.Between(min, max);
  }

  // -------------------------------------------------------------------------
  // Item tricks
  // -------------------------------------------------------------------------
  private assignTrick(item: FallingItem): void {
    if (!this.enabled || !item.def || this.elapsed < TROLL_PRANKS.graceMs) return;
    if (Math.random() > TROLL_ITEMS.chance) return;

    const isBad = item.def.category === ItemCategory.BAD;
    const id = pickWeighted<ItemTrickId>(isBad ? TROLL_ITEMS.badTricks : TROLL_ITEMS.goodTricks);
    item.trick = { id, triggered: false, elapsed: 0, dashRemaining: 0 };
    ITEM_TRICKS[id].assign?.(item, this.ctx);
  }

  private updateItems(delta: number): void {
    const maxX = this.ctx.scene.scale.width - EDGE;
    this.ctx.spawner.activeItems.forEach((item) => {
      if (!item.trick || !item.body.enable) return;
      item.trick.elapsed += delta;
      ITEM_TRICKS[item.trick.id].update?.(item, item.trick, this.ctx, delta);

      // Không cho trò nào đẩy vật phẩm ra khỏi màn hình
      if (item.x < EDGE || item.x > maxX) {
        item.x = Phaser.Math.Clamp(item.x, EDGE, maxX);
        item.body.velocity.x = 0;
      }
    });
  }
}
