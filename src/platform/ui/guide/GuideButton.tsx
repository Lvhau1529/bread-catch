/**
 * Nút "? GUIDE" ở màn chính của game: mở phần Hướng dẫn (tiếng Việt) cho giáo viên / phụ huynh.
 */
import clsx from 'clsx';
import { openGuide } from '@/platform/ui/guide/guideStore';
import styles from '@/platform/ui/guide/GuideButton.module.scss';

interface GuideButtonProps {
  label: string;
  /** Màn chứa đặt vị trí (vd ô lưới ở bố cục ngang) */
  className?: string;
}

export default function GuideButton({ label, className }: GuideButtonProps) {
  return (
    <button type="button" className={clsx(styles.guideButton, className)} onClick={() => openGuide()}>
      ? {label}
    </button>
  );
}
