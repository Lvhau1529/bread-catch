/**
 * Icon ảnh dùng chung (src/platform/ui/icons.ts) — trang trí, nên `alt` rỗng:
 * nút chứa icon phải tự có `aria-label`.
 */
import { ICONS, type IconName } from '@/platform/ui/icons';

interface IconProps {
  name: IconName;
  /** Cạnh (px CSS) */
  size?: number;
  className?: string;
}

export default function Icon({ name, size = 28, className = '' }: IconProps) {
  return (
    <img
      className={`icon ${className}`}
      src={ICONS[name]}
      alt=""
      width={size}
      height={size}
      draggable={false}
    />
  );
}
