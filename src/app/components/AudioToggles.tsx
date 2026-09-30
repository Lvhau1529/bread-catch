/**
 * Bật/tắt SOUND · MUSIC · VOICE — lưu localStorage, game Phaser cập nhật ngay (prefsStore).
 */
import { ICONS } from '@/app/assets';
import { usePrefs } from '@/app/hooks/useStore';
import { SFX } from '@/game/config/assets';
import { GameBridge } from '@/game/bridge';
import { setPref, type Prefs } from '@/session/storage';
import { UI_TEXT } from '@/session/text';
import { speech } from '@/shared/speech';

const TOGGLES: { key: keyof Prefs; label: string }[] = [
  { key: 'sfx', label: UI_TEXT.sound },
  { key: 'music', label: UI_TEXT.music },
  { key: 'voice', label: UI_TEXT.voice },
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
              if (key === 'sfx' ? !on : prefs.sfx) GameBridge.playSfx(SFX.UI_CLICK);
            }}
          >
            <img src={on ? ICONS.soundOn : ICONS.soundOff} alt="" width={40} height={40} />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
