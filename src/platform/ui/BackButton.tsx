/**
 * Nút quay lại tròn (icon mũi tên dùng chung + tiếng "back") cho header các màn React của mọi game.
 */
import { SFX } from '@/platform/audio/sfx';
import { playSfx } from '@/platform/audio/sfxPlayer';
import Icon from '@/platform/ui/Icon';

interface BackButtonProps {
  label: string;
  onClick: () => void;
  className?: string;
}

export default function BackButton({ label, onClick, className = '' }: BackButtonProps) {
  return (
    <button
      type="button"
      className={`icon-btn ${className}`}
      aria-label={label}
      onClick={() => {
        playSfx(SFX.UI_BACK);
        onClick();
      }}
    >
      <Icon name="back" size={26} />
    </button>
  );
}
