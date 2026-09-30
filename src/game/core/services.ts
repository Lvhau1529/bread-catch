/**
 * Service toàn cục (sống suốt vòng đời game, dùng chung giữa các scene),
 * lưu trong `game.registry`.
 */
import type Phaser from 'phaser';
import { REGISTRY } from '@/game/core/keys';
import AudioSystem from '@/game/systems/AudioSystem';

export function registerServices(game: Phaser.Game): void {
  if (game.registry.has(REGISTRY.AUDIO)) return;
  game.registry.set(REGISTRY.AUDIO, new AudioSystem(game));
}

export const getAudio = (scene: Phaser.Scene): AudioSystem => scene.registry.get(REGISTRY.AUDIO);

/** Dùng từ ngoài scene (vd: React phát SFX); undefined khi game chưa boot xong */
export const getGameAudio = (game: Phaser.Game): AudioSystem | undefined => game.registry.get(REGISTRY.AUDIO);
