/**
 * Cho streamer ăn (plan §10–11), chia 2 bước khớp với state machine (feeding -> eating):
 *   flyToMouth: món bay theo đường cong vào miệng, streamer há miệng chờ
 *   eat:        FULL -> BITE_1 -> BITE_2 -> vụn bánh, streamer nhai
 * `quick`: một miếng cắn ngắn (từng chữ khi ghép từ).
 */
import type Phaser from 'phaser';
import { TIMING } from '@/games/food-stream/game/config/theme';
import type FoodPiece from '@/games/food-stream/game/objects/FoodPiece';
import type Streamer from '@/games/food-stream/game/objects/Streamer';
import type Effects from '@/games/food-stream/game/systems/Effects';

/** Món ăn khi tới miệng cao bằng ngần này chiều cao streamer */
const MOUTH_FOOD_RATIO = 0.3;
/** Độ cao đường cong phía trên điểm cao nhất (px logic) */
const ARC_HEIGHT = 50;

export function flyToMouth(scene: Phaser.Scene, piece: FoodPiece, streamer: Streamer): Promise<void> {
  return new Promise((resolve) => {
    const mouth = streamer.mouth;
    const startX = piece.x;
    const startY = piece.y;
    const peakY = Math.min(startY, mouth.y) - ARC_HEIGHT;
    const targetScale = (streamer.figureHeight * MOUTH_FOOD_RATIO) / piece.size;
    streamer.openMouth();

    // Đường cong bậc 2 (start -> peak -> mouth)
    const flight = { t: 0 };
    scene.tweens.add({
      targets: flight,
      t: 1,
      duration: TIMING.feedFlight,
      ease: 'Sine.easeInOut',
      onUpdate: () => {
        const { t } = flight;
        const rest = 1 - t;
        piece.x = rest * startX + t * mouth.x;
        piece.y = rest * rest * startY + 2 * rest * t * peakY + t * t * mouth.y;
      },
      onComplete: () => resolve(),
    });
    scene.tweens.add({
      targets: piece,
      scale: Math.min(piece.scale, targetScale),
      duration: TIMING.feedFlight,
    });
  });
}

export function eat(
  scene: Phaser.Scene,
  effects: Effects,
  piece: FoodPiece,
  streamer: Streamer,
  { quick = false } = {},
): Promise<void> {
  return new Promise((resolve) => {
    const step = quick ? TIMING.quickBite : TIMING.biteStep;
    const bites = quick ? 1 : 2;
    piece.bite(1);
    streamer.chew(bites + 1, step);
    if (!quick) scene.time.delayedCall(step, () => piece.bite(2));
    scene.time.delayedCall(step * bites, () => {
      effects.crumbs(piece.x, piece.y);
      piece.destroy();
    });
    scene.time.delayedCall(step * (bites + 1), () => resolve());
  });
}
