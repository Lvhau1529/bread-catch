/**
 * Nút "kẹo" dùng chung cho các màn React — cùng phong cách với TextButton trong game.
 */
import type { ButtonHTMLAttributes } from 'react';
import { SFX, type SfxKey } from '@/game/config/assets';
import { GameBridge } from '@/game/bridge';

export type ButtonColor = 'green' | 'blue' | 'red' | 'orange' | 'cream';

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
        if (sfx) GameBridge.playSfx(sfx);
        onClick?.(event);
      }}
      {...rest}
    />
  );
}
