/**
 * Nút "kẹo" dùng chung cho các màn React của mọi game. Màu lấy từ biến CSS của theme đang dùng.
 */
import type { ButtonHTMLAttributes } from 'react';
import { SFX, type SfxKey } from '@/platform/audio/sfx';
import { playSfx } from '@/platform/audio/sfxPlayer';

export type ButtonColor = 'green' | 'blue' | 'red' | 'orange' | 'cream' | 'pink';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  color?: ButtonColor;
  size?: 'md' | 'lg';
  /** Âm thanh khi bấm; `null` = im lặng */
  sfx?: SfxKey | null;
}

export default function Button({
  color = 'orange',
  size = 'md',
  sfx = SFX.UI_CLICK,
  className = '',
  onClick,
  type = 'button',
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`btn btn--${color} btn--${size} ${className}`}
      onClick={(event) => {
        if (sfx) playSfx(sfx);
        onClick?.(event);
      }}
      {...rest}
    />
  );
}
