/**
 * Tải toàn bộ hình ảnh (theo sprites.json), SFX và nhạc nền.
 * Người chơi thường đang ở màn Home (React) trong lúc này nên không cần màn loading riêng.
 */
import Phaser from 'phaser';
import { MUSIC, SFX, SPRITE_MANIFEST, musicUrls, sfxUrls, type SpriteManifest } from '@/game/config/assets';
import { SCENES } from '@/game/core/keys';
import { registerBrainrotAnims } from '@/game/objects/brainrot';

/** Game phát event này khi asset đã sẵn sàng (SceneDirector bắt đầu điều phối) */
export const ASSETS_READY = 'assets-ready';

export default class PreloadScene extends Phaser.Scene {
  constructor() {
    super(SCENES.PRELOAD);
  }

  preload(): void {
    const manifest = this.cache.json.get(SPRITE_MANIFEST.key) as SpriteManifest;
    Object.entries(manifest).forEach(([key, info]) => this.load.image(key, info.path));
    Object.values(SFX).forEach((key) => this.load.audio(key, sfxUrls(key)));
    Object.values(MUSIC).forEach((key) => this.load.audio(key, musicUrls(key)));
  }

  create(): void {
    registerBrainrotAnims(this.anims);
    this.game.events.emit(ASSETS_READY);
    this.scene.stop();
  }
}
