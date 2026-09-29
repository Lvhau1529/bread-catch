/**
 * Phát SFX của game từ phía React (dùng chung file âm thanh và volume mix),
 * tôn trọng cài đặt bật/tắt SFX người chơi đã lưu.
 */
import { VOLUME, sfxUrls, type SfxKey } from '@/game/config/assets';
import { loadSaveData } from '@/game/systems/SaveSystem';

const probe = typeof Audio !== 'undefined' ? new Audio() : null;
const supportsOgg = !!probe?.canPlayType('audio/ogg; codecs="vorbis"');

export function playSfx(key: SfxKey, rate = 1): void {
  if (!probe || !loadSaveData().sound) return;
  const [ogg, mp3] = sfxUrls(key);
  const audio = new Audio(supportsOgg ? ogg : mp3);
  audio.volume = VOLUME.sfx[key];
  audio.playbackRate = rate;
  audio.play().catch(() => undefined); // trình duyệt chặn autoplay -> bỏ qua
}
