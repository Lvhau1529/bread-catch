/**
 * Quản lý nhạc nền + SFX, dùng chung cho mọi scene.
 *
 * - Bật/tắt theo `prefsStore` (React và Phaser cùng đổi được).
 * - Toàn bộ nhạc được tải ở PreloadScene (file nhỏ) nên đổi nhạc là phát ngay.
 * - "Duck": giảm nhạc khi Pause hoặc khi đang đọc từ (AUDIO_NOTES của resource pack).
 * - Fade dùng event `step` của game nên không phụ thuộc scene nào đang chạy.
 * - Trên mobile, audio bị khoá tới lần chạm đầu tiên: chờ `unlocked` rồi mới phát.
 */
import type Phaser from 'phaser';
import { VOLUME, type MusicKey, type SfxKey } from '@/game/config/assets';
import { prefsStore } from '@/session/storage';

const MUSIC_FADE_MS = 700;
const DUCK_FADE_MS = 250;
/** Mức nhạc khi bị duck (plan: 30–40%) */
const DUCK_LEVEL = 0.35;

export type DuckReason = 'pause' | 'speech';

type Sound = Phaser.Sound.WebAudioSound | Phaser.Sound.HTML5AudioSound;

export default class AudioSystem {
  private readonly sound: Phaser.Sound.BaseSoundManager;
  private music: Sound | null = null;
  private musicKey: MusicKey | null = null;
  /** Track muốn phát (kể cả khi nhạc đang tắt) */
  private desiredMusicKey: MusicKey | null = null;
  private readonly ducks = new Set<DuckReason>();
  private fadeHandler: ((time: number, delta: number) => void) | null = null;

  constructor(private readonly game: Phaser.Game) {
    this.sound = game.sound;
    let { music } = prefsStore.get();
    prefsStore.subscribe(() => {
      const next = prefsStore.get().music;
      if (next === music) return;
      music = next;
      if (!next) this.stopMusic();
      else if (this.desiredMusicKey) this.playMusic(this.desiredMusicKey);
    });
  }

  // -------------------------------------------------------------------------
  // SFX
  // -------------------------------------------------------------------------
  playSfx(key: SfxKey, { rate = 1, volumeScale = 1 } = {}): void {
    if (!prefsStore.get().sfx || !this.game.cache.audio.exists(key)) return;
    this.sound.play(key, { volume: VOLUME.sfx[key] * volumeScale, rate });
  }

  // -------------------------------------------------------------------------
  // Music
  // -------------------------------------------------------------------------
  playMusic(key: MusicKey): void {
    this.desiredMusicKey = key;
    if (!prefsStore.get().music || !this.game.cache.audio.exists(key)) return;
    if (this.musicKey === key && this.music?.isPlaying) return;

    if (this.sound.locked) {
      this.sound.once('unlocked', () => {
        if (this.desiredMusicKey === key) this.playMusic(key);
      });
      return;
    }
    this.stopMusic();
    const music = this.sound.add(key, { loop: true, volume: 0 }) as Sound;
    music.play();
    this.music = music;
    this.musicKey = key;
    this.fadeTo(this.targetVolume, MUSIC_FADE_MS);
  }

  stopMusic(): void {
    this.cancelFade();
    this.music?.stop();
    this.music?.destroy();
    this.music = null;
    this.musicKey = null;
  }

  /** Giảm / trả lại âm lượng nhạc nền; nhiều lý do có thể chồng lên nhau */
  setDucked(reason: DuckReason, ducked: boolean): void {
    if (ducked) this.ducks.add(reason);
    else this.ducks.delete(reason);
    if (this.music) this.fadeTo(this.targetVolume, DUCK_FADE_MS);
  }

  // -------------------------------------------------------------------------
  // Internal
  // -------------------------------------------------------------------------
  private get targetVolume(): number {
    if (!this.musicKey) return 0;
    return VOLUME.music[this.musicKey] * (this.ducks.size > 0 ? DUCK_LEVEL : 1);
  }

  private fadeTo(target: number, duration: number): void {
    const sound = this.music;
    if (!sound) return;
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
