/**
 * Toạ độ "logic" của game (rộng 360) tách khỏi độ phân giải canvas thật.
 *
 * Canvas được tạo lớn gấp RENDER_SCALE lần; mỗi scene gọi `setupView()` ở đầu
 * create() để camera zoom lại — toàn bộ code vẽ / layout chỉ dùng toạ độ logic.
 */
import type Phaser from 'phaser';
import { RENDER_SCALE } from '@/game/config/gameConfig';

export interface ViewSize {
  width: number;
  height: number;
}

/** Kích thước màn hình theo toạ độ logic */
export function view(scene: Phaser.Scene): ViewSize {
  return { width: scene.scale.width / RENDER_SCALE, height: scene.scale.height / RENDER_SCALE };
}

/** Zoom camera chính để vùng logic phủ kín canvas */
export function setupView(scene: Phaser.Scene): ViewSize {
  const size = view(scene);
  scene.cameras.main.setZoom(RENDER_SCALE).centerOn(size.width / 2, size.height / 2);
  return size;
}
