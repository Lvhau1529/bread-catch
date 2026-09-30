/**
 * Bật/tắt SOUND · MUSIC · VOICE — dùng chung cho mọi game, lưu localStorage,
 * game Phaser đang chạy cập nhật ngay (prefsStore).
 */
import { SFX } from '@/platform/audio/sfx';
import { playSfx } from '@/platform/audio/sfxPlayer';
import { usePrefs } from '@/platform/hooks/useStore';
import { setPref, type Prefs } from '@/platform/prefs';
import { SHARED_ICONS } from '@/platform/ui/icons';
import { speech } from '@/shared/speech';

const TOGGLES: { key: keyof Prefs; label: string }[] = [
  { key: 'sfx', label: 'SOUND' },
  { key: 'music', label: 'MUSIC' },
  { key: 'voice', label: 'VOICE' },
];

export default function AudioToggles() {
  const prefs = usePrefs();
  const toggles = speech.supported ? TOGGLES : TOGGLES.filter((toggle) => toggle.key !== 'voice');

  return (
    <div className="toggles">
      {toggles.map(({ key, label }) => {
        const on = prefs[key];
        return (
          <button
            key={key}
            type="button"
            className={`toggle ${on ? '' : 'is-off'}`}
            aria-pressed={on}
            onClick={() => {
              setPref(key, !on);
              // Bật lại SFX thì nghe luôn tiếng click để biết đã có âm
              if (key === 'sfx' ? !on : prefs.sfx) playSfx(SFX.UI_CLICK);
            }}
          >
            <img src={on ? SHARED_ICONS.soundOn : SHARED_ICONS.soundOff} alt="" width={40} height={40} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
