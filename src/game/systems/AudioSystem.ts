/**
 * Quản lý nhạc nền + SFX, dùng chung cho mọi scene.
 *
 * - Tôn trọng cài đặt bật/tắt trong SaveSystem.
 * - Nhạc được lazy-load (file lớn) để mobile vào game nhanh.
 * - Fade in dùng event `step` của game nên không phụ thuộc scene nào đang chạy.
 * - Trên mobile, audio bị khoá tới lần chạm đầu tiên: chờ `unlocked` rồi mới phát.
 */
import type Phaser from 'phaser';
import { VOLUME, musicUrls, type MusicKey, type SfxKey } from '@/game/config/assets';
import type SaveSystem from '@/game/systems/SaveSystem';

const MUSIC_FADE_MS = 800;

type Sound = Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound;

export default class AudioSystem {
  private readonly sound: Phaser.Sound.BaseSoundManager;
  private music: Sound | null = null;
  private musicKey: MusicKey | null = null;
  /** Track muốn phát (kể cả khi nhạc đang tắt / đang load) */
  private desiredMusicKey: MusicKey | null = null;
  private fadeHandler: ((time: number, delta: number) => void) | null = null;

  constructor(
    private readonly game: Phaser.Game,
    private readonly save: SaveSystem,
  ) {
    this.sound = game.sound;
  }

  get sfxEnabled(): boolean {
    return this.save.get('sound');
  }

  get musicEnabled(): boolean {
    return this.save.get('music');
  }

  // -------------------------------------------------------------------------
  // SFX
  // -------------------------------------------------------------------------
  playSfx(key: SfxKey, { rate = 1, volumeScale = 1 } = {}): void {
    if (!this.sfxEnabled || !this.game.cache.audio.exists(key)) return;
    this.sound.play(key, { volume: VOLUME.sfx[key] * volumeScale, rate });
  }

  setSfxEnabled(enabled: boolean): void {
    this.save.set('sound', enabled);
  }

  // -------------------------------------------------------------------------
  // Music
  // -------------------------------------------------------------------------
  /** Phát nhạc nền. Nếu track chưa load, dùng loader của `scene` để tải nền. */
  playMusic(scene: Phaser.Scene, key: MusicKey): void {
    this.desiredMusicKey = key;
    if (!this.musicEnabled) return;
    if (this.musicKey === key && this.music?.isPlaying) return;

    if (this.game.cache.audio.exists(key)) {
      this.startMusic(key);
      return;
    }
    this.loadMusic(scene, [key], () => {
      if (this.desiredMusicKey === key && this.musicEnabled) this.startMusic(key);
    });
  }

  /** Tải trước các track (vd: nhạc stage khi đang ở menu) */
  preloadMusic(scene: Phaser.Scene, keys: MusicKey[]): void {
    const missing = keys.filter((key) => !this.game.cache.audio.exists(key));
    if (missing.length) this.loadMusic(scene, missing);
  }

  stopMusic(): void {
    this.cancelFade();
    this.music?.stop();
    this.music?.destroy();
    this.music = null;
    this.musicKey = null;
  }

  setMusicEnabled(enabled: boolean, scene: Phaser.Scene): void {
    this.save.set('music', enabled);
    if (!enabled) {
      this.stopMusic();
    } else if (this.desiredMusicKey) {
      this.playMusic(scene, this.desiredMusicKey);
    }
  }

  // -------------------------------------------------------------------------
  // Internal
  // -------------------------------------------------------------------------
  private loadMusic(scene: Phaser.Scene, keys: MusicKey[], onComplete?: () => void): void {
    const loader = scene.load;
    keys.forEach((key) => {
      if (onComplete) loader.once(`filecomplete-audio-${key}`, onComplete);
      loader.audio(key, musicUrls(key));
    });
    if (!loader.isLoading()) loader.start();
  }

  private startMusic(key: MusicKey): void {
    if (this.sound.locked) {
      this.sound.once('unlocked', () => {
        if (this.desiredMusicKey === key && this.musicEnabled) this.startMusic(key);
      });
      return;
    }
    this.stopMusic();
    const music = this.sound.add(key, { loop: true, volume: 0 }) as Sound;
    music.play();
    this.music = music;
    this.musicKey = key;
    this.fadeTo(music, VOLUME.music, MUSIC_FADE_MS);
  }

  private fadeTo(sound: Sound, target: number, duration: number): void {
    this.cancelFade();
    const start = sound.volume;
    let elapsed = 0;
    this.fadeHandler = (_time, delta) => {
      elapsed += delta;
      const t = Math.min(1, elapsed / duration);
      sound.setVolume(start + (target - start) * t);
      if (t >= 1) this.cancelFade();
    };
    this.game.events.on('step', this.fadeHandler);
  }

  private cancelFade(): void {
    if (!this.fadeHandler) return;
    this.game.events.off('step', this.fadeHandler);
    this.fadeHandler = null;
  }
}
