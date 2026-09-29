/**
 * Service toàn cục (sống suốt vòng đời game, dùng chung giữa các scene),
 * lưu trong `game.registry`.
 */
import type Phaser from 'phaser';
import { REGISTRY } from '@/game/core/keys';
import SaveSystem from '@/game/systems/SaveSystem';
import AudioSystem from '@/game/systems/AudioSystem';

export function registerServices(game: Phaser.Game): void {
  if (game.registry.has(REGISTRY.SAVE)) return;
  const save = new SaveSystem();
  game.registry.set(REGISTRY.SAVE, save);
  game.registry.set(REGISTRY.AUDIO, new AudioSystem(game, save));
}

export const getSave = (scene: Phaser.Scene): SaveSystem => scene.registry.get(REGISTRY.SAVE);

export const getAudio = (scene: Phaser.Scene): AudioSystem => scene.registry.get(REGISTRY.AUDIO);
