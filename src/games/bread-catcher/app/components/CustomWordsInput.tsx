/**
 * Ô MY WORDS ở màn Setup: giáo viên gõ / dán bộ từ riêng cho buổi chơi.
 * Tách từ ngay khi gõ, hiện các từ sẽ rơi trong game (bấm để nghe đọc) và phần bị bỏ qua.
 * Nội dung ô được lưu cùng form Setup nên lần sau mở lại vẫn còn.
 */
import { CUSTOM_WORD_LETTERS, type ParsedWords } from '@/games/bread-catcher/session/content';
import { RULES } from '@/games/bread-catcher/session/settings';
import { UI_TEXT } from '@/games/bread-catcher/session/text';
import { SFX } from '@/platform/audio/sfx';
import { playSfx } from '@/platform/audio/sfxPlayer';
import { useStore } from '@/platform/hooks/useStore';
import { prefsStore } from '@/platform/prefs';
import { speech } from '@/shared/speech';

const MAX_TEXT_LENGTH = 2000;

interface CustomWordsInputProps {
  value: string;
  parsed: ParsedWords;
  /** "8 words · 3–5 letters" */
  summary: string;
  onChange: (text: string) => void;
}

export default function CustomWordsInput({ value, parsed, summary, onChange }: CustomWordsInputProps) {
  const canHear = useStore(prefsStore, (prefs) => prefs.voice) && speech.supported;
  const { words, skipped } = parsed;

  return (
    <div className={`custom-words ${words.length === 0 ? 'is-empty' : ''}`}>
      <div className="custom-words__box">
        <textarea
          value={value}
          rows={3}
          maxLength={MAX_TEXT_LENGTH}
          placeholder={UI_TEXT.myWordsPlaceholder}
          aria-label={UI_TEXT.myWords}
          autoComplete="off"
          autoCapitalize="none"
          spellCheck={false}
          onChange={(event) => onChange(event.target.value)}
        />
        {value && (
          <button
            type="button"
            className="text-btn custom-words__clear"
            onClick={() => {
              playSfx(SFX.UI_CLICK);
              onChange('');
            }}
          >
            {UI_TEXT.clear}
          </button>
        )}
      </div>

      {words.length > 0 ? (
        <ul className="custom-words__chips" aria-label={UI_TEXT.words}>
          {words.map((word) => (
            <li key={word}>
              <button
                type="button"
                className="custom-words__chip"
                disabled={!canHear}
                aria-label={canHear ? `${word.toLowerCase()} 🔊` : undefined}
                onClick={() => speech.say(word)}
              >
                {word}
              </button>
            </li>
          ))}
        </ul>
      ) : (
        <p className="field__hint field__hint--hard">{UI_TEXT.noWordsYet}</p>
      )}

      {skipped.length > 0 && (
        <p className="field__hint field__hint--hard">
          {UI_TEXT.skipped} ({UI_TEXT.skippedRule}, {CUSTOM_WORD_LETTERS.min}–{CUSTOM_WORD_LETTERS.max}{' '}
          {UI_TEXT.letters}): <span className="custom-words__skipped">{skipped.join(', ')}</span>
        </p>
      )}
      {words.length > 0 && (
        <p className="field__hint">
          {[
            `${summary}.`,
            canHear && UI_TEXT.tapToHear,
            words.length < RULES.wordsPerTurn && UI_TEXT.fewWordsTip,
          ]
            .filter(Boolean)
            .join(' ')}
        </p>
      )}
    </div>
  );
}
