/**
 * Bật/tắt SOUND · MUSIC · VOICE — dùng chung cho mọi game, lưu localStorage,
 * game Phaser đang chạy cập nhật ngay (prefsStore). Mỗi nút một icon riêng (loa / nốt nhạc / miệng).
 */
import { SFX } from '@/platform/audio/sfx';
import { playSfx } from '@/platform/audio/sfxPlayer';
import { usePrefs } from '@/platform/hooks/useStore';
import { setPref, type Prefs } from '@/platform/prefs';
import Icon from '@/platform/ui/Icon';
import type { IconName } from '@/platform/ui/icons';
import { speech } from '@/shared/speech';

const TOGGLES: { key: keyof Prefs; label: string; on: IconName; off: IconName }[] = [
  { key: 'sfx', label: 'SOUND', on: 'soundOn', off: 'soundOff' },
  { key: 'music', label: 'MUSIC', on: 'musicOn', off: 'musicOff' },
  { key: 'voice', label: 'VOICE', on: 'voiceOn', off: 'voiceOff' },
];

export default function AudioToggles() {
  const prefs = usePrefs();
  const toggles = speech.supported ? TOGGLES : TOGGLES.filter((toggle) => toggle.key !== 'voice');

  return (
    <div className="toggles">
      {toggles.map(({ key, label, on: iconOn, off: iconOff }) => {
        const on = prefs[key];
        const toggle = () => setPref(key, !on);
        return (
          <button
            key={key}
            type="button"
            className={`toggle ${on ? '' : 'is-off'}`}
            aria-pressed={on}
            onClick={() => {
              // Tắt SOUND: phát tiếng "tắt" trước khi im; bật lại SOUND: nghe ngay tiếng "bật"
              if (key === 'sfx' && on) {
                playSfx(SFX.UI_TOGGLE_OFF);
                toggle();
              } else {
                toggle();
                playSfx(on ? SFX.UI_TOGGLE_OFF : SFX.UI_TOGGLE_ON);
              }
            }}
          >
            <Icon name={on ? iconOn : iconOff} size={40} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
