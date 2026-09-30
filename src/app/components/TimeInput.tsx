/**
 * Ô tự nhập thời gian mỗi lượt (giây), kèm nút −/+ cho màn hình cảm ứng.
 * Gõ số hợp lệ là áp dụng ngay; rời ô thì tự kẹp về khoảng cho phép.
 */
import { useEffect, useState } from 'react';
import { SFX } from '@/game/config/assets';
import { GameBridge } from '@/game/bridge';
import { CUSTOM_TIME } from '@/session/settings';
import { UI_TEXT } from '@/session/text';
import type { TimeOption } from '@/session/types';
import { formatTime } from '@/shared/format';

const STEP = 5;

interface TimeInputProps {
  value: TimeOption;
  /** Thời gian đang áp dụng (AUTO = theo level) — hiện sẵn trong ô */
  effectiveSeconds: number;
  onChange: (seconds: number) => void;
}

const clamp = (seconds: number) => Math.min(CUSTOM_TIME.max, Math.max(CUSTOM_TIME.min, Math.round(seconds)));

export default function TimeInput({ value, effectiveSeconds, onChange }: TimeInputProps) {
  const [text, setText] = useState(String(effectiveSeconds));

  // Chọn chip khác (AUTO, 60...) -> cập nhật lại ô
  useEffect(() => setText(String(effectiveSeconds)), [value, effectiveSeconds]);

  const apply = (seconds: number) => {
    const next = clamp(seconds);
    setText(String(next));
    onChange(next);
  };

  const step = (direction: 1 | -1) => {
    GameBridge.playSfx(SFX.UI_CLICK);
    apply(effectiveSeconds + direction * STEP);
  };

  return (
    <div className={`time-input ${value === 'auto' ? '' : 'is-custom'}`}>
      <span className="time-input__label">{UI_TEXT.custom}</span>
      <button type="button" className="time-input__step" aria-label="-5 sec" onClick={() => step(-1)}>
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={CUSTOM_TIME.min}
        max={CUSTOM_TIME.max}
        step={STEP}
        value={text}
        aria-label={`${UI_TEXT.time} (${UI_TEXT.seconds})`}
        onChange={(event) => {
          setText(event.target.value);
          const seconds = Number(event.target.value);
          if (Number.isInteger(seconds) && seconds >= CUSTOM_TIME.min && seconds <= CUSTOM_TIME.max) {
            onChange(seconds);
          }
        }}
        onBlur={() => apply(Number(text) || effectiveSeconds)}
        onKeyDown={(event) => {
          if (event.key === 'Enter') event.currentTarget.blur();
        }}
      />
      <button type="button" className="time-input__step" aria-label="+5 sec" onClick={() => step(1)}>
        +
      </button>
      <span className="time-input__unit">
        {UI_TEXT.seconds} · {formatTime(effectiveSeconds * 1000)}
      </span>
    </div>
  );
}
