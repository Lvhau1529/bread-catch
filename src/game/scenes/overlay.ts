/**
 * Phần dùng chung cho các scene overlay (Pause, Game Over): nền tối mờ + panel.
 */
import type Phaser from 'phaser';
import { DEPTH } from '@/game/config/gameConfig';
import Panel from '@/game/ui/Panel';

/** Kích thước phần đỉnh (kem + nơ) / đáy của panel_large không được kéo giãn */
const PANEL_SLICES = { top: 72, bottom: 30 };

export function createOverlayPanel(scene: Phaser.Scene, panelHeight: number, centerYRatio = 0.48): Panel {
  const { width, height } = scene.scale;

  const dim = scene.add
    .rectangle(width / 2, height / 2, width, height, 0x1e0c04, 0.6)
    .setDepth(DEPTH.OVERLAY);
  dim.setInteractive(); // chặn input xuyên xuống scene bên dưới
  scene.tweens.add({ targets: dim, alpha: { from: 0, to: 1 }, duration: 200 });

  const panel = new Panel(scene, width / 2, height * centerYRatio, 'panel_large', panelHeight, PANEL_SLICES);
  panel.setDepth(DEPTH.OVERLAY + 1);
  scene.tweens.add({
    targets: panel,
    scale: { from: 0.85, to: 1 },
    alpha: { from: 0, to: 1 },
    duration: 260,
    ease: 'Back.easeOut',
  });
  return panel;
}
