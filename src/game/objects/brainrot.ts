/**
 * Nhân vật "brainrot" của TROLL MODE: texture (sinh bởi tools/brainrot_art.py)
 * và animation 2 frame.
 */
import type Phaser from 'phaser';

export const BRAINROT = {
  tung: { idle: 'tung_0', hit: 'tung_1', walk: 'tung-walk', frames: ['tung_0', 'tung_1'] },
  lirili: { idle: 'lirili_0', walk: 'lirili-walk', frames: ['lirili_0', 'lirili_1'] },
  tralalero: { idle: 'tralalero_0', walk: 'tralalero-walk', frames: ['tralalero_0', 'tralalero_1'] },
  bombardiro: { idle: 'bombardiro_0', walk: 'bombardiro-fly', frames: ['bombardiro_0', 'bombardiro_1'] },
  clock: 'clock',
} as const;

const ANIM_FPS = 6;

/** Tạo animation một lần cho cả game (gọi sau khi texture đã load) */
export function registerBrainrotAnims(anims: Phaser.Animations.AnimationManager): void {
  [BRAINROT.tung, BRAINROT.lirili, BRAINROT.tralalero, BRAINROT.bombardiro].forEach(({ walk, frames }) => {
    if (anims.exists(walk)) return;
    anims.create({ key: walk, frames: frames.map((key) => ({ key })), frameRate: ANIM_FPS, repeat: -1 });
  });
}
