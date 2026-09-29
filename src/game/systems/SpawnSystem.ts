/**
 * Spawn vật phẩm theo nhịp của level hiện tại và thu hồi vật phẩm rơi quá đáy.
 * Dùng Arcade Group làm object pool.
 */
import Phaser from 'phaser';
import { SPAWN } from '@/game/config/gameConfig';
import { ITEMS, SPAWN_POOLS, ItemCategory, type ItemId } from '@/game/config/items';
import type { GameEventBus } from '@/game/core/events';
import { pickWeighted } from '@/game/core/random';
import FallingItem from '@/game/objects/FallingItem';
import type LevelSystem from '@/game/systems/LevelSystem';
import type LifeSystem from '@/game/systems/LifeSystem';

export default class SpawnSystem {
  readonly group: Phaser.Physics.Arcade.Group;
  private elapsed = 0;
  private paused = false;
  private lastX: number | null = null;

  constructor(
    private readonly scene: Phaser.Scene,
    private readonly bus: GameEventBus,
    private readonly levels: LevelSystem,
    private readonly lives: LifeSystem,
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

  update(delta: number): void {
    this.recycleFallen();
    if (this.paused) return;

    this.elapsed += delta;
    if (this.elapsed >= this.levels.current.spawnInterval) {
      this.elapsed = 0;
      this.spawn();
    }
  }

  get isPaused(): boolean {
    return this.paused;
  }

  pause(): void {
    this.paused = true;
  }

  resume(): void {
    this.paused = false;
  }

  /** Dừng spawn và đứng yên mọi item đang rơi (game over) */
  freeze(): void {
    this.pause();
    this.activeItems.forEach((item) => {
      item.body.stop();
      item.setAngularVelocity(0);
    });
  }

  /** Spawn ngẫu nhiên theo bảng xác suất của level hiện tại */
  spawn(): void {
    this.spawnItem(this.pickItem(), this.pickX());
  }

  /** Spawn đúng một loại item tại (x, y) — dùng cho prank (mưa trứng, bom...) */
  spawnItem(
    itemId: ItemId,
    x: number,
    { y = SPAWN.startY, speedScale = 1 }: { y?: number; speedScale?: number } = {},
  ): FallingItem | null {
    const item = this.group.get() as FallingItem | null;
    if (!item) return null; // pool đầy

    const variance = 1 + Phaser.Math.FloatBetween(-SPAWN.speedVariance, SPAWN.speedVariance);
    item.spawn(itemId, ITEMS[itemId], x, y, this.levels.current.fallSpeed * variance * speedScale);
    this.bus.emit('item-spawned', item);
    return item;
  }

  private pickItem(): ItemId {
    const category = pickWeighted<ItemCategory>(this.levels.spawnWeights);
    const candidates = SPAWN_POOLS[category].filter((id) => this.canSpawn(category, id));
    const weights = Object.fromEntries(candidates.map((id) => [id, ITEMS[id].weight]));
    return pickWeighted<ItemId>(weights);
  }

  private canSpawn(category: ItemCategory, itemId: ItemId): boolean {
    if (category === ItemCategory.BREAD) return this.levels.unlocked.breads.includes(itemId);
    if (itemId === 'heart') return !this.lives.isFull;
    return true;
  }

  private pickX(): number {
    const min = SPAWN.edgeMargin;
    const max = this.scene.scale.width - SPAWN.edgeMargin;
    let x = Phaser.Math.Between(min, max);
    for (let tries = 0; tries < 4 && this.lastX !== null; tries += 1) {
      if (Math.abs(x - this.lastX) >= SPAWN.minGapFromLast) break;
      x = Phaser.Math.Between(min, max);
    }
    this.lastX = x;
    return x;
  }

  private recycleFallen(): void {
    const bottom = this.scene.scale.height;
    this.activeItems.forEach((item) => {
      if (item.body.enable && item.y - item.displayHeight / 2 > bottom) {
        this.bus.emit('item-missed', item);
        item.despawn();
      }
    });
  }
}
