/**
 * Một mục trong form Setup: nhãn + (tuỳ chọn) nút "?" mở đúng phần Hướng dẫn của game.
 */
import type { ReactNode } from 'react';
import { SFX } from '@/platform/audio/sfx';
import { playSfx } from '@/platform/audio/sfxPlayer';
import { openGuide } from '@/platform/ui/guide/guideStore';

interface FieldProps {
  label: string;
  /** Id phần Hướng dẫn mở khi bấm "?" */
  guide?: string;
  children: ReactNode;
}

export default function Field({ label, guide, children }: FieldProps) {
  return (
    <fieldset className="field">
      <legend className="field__label">
        {label}
        {guide && (
          <button
            type="button"
            className="field__help"
            aria-label={`GUIDE: ${label}`}
            onClick={() => {
              playSfx(SFX.UI_CLICK);
              openGuide(guide);
            }}
          >
            ?
          </button>
        )}
      </legend>
      {children}
    </fieldset>
  );
}
