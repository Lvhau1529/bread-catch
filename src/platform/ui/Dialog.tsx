/**
 * Hộp thoại dùng chung của Phonics Arcade: nền tối, khung kem viền mực, nút đóng tròn đỏ,
 * (tuỳ chọn) ảnh linh vật Pip phía trên tiêu đề. Esc hoặc bấm ra ngoài để đóng.
 * Mở thì phát tiếng `openSfx` (mặc định UI_OPEN), đóng phát UI_CLOSE.
 */
import { useEffect, useId, type ReactNode } from 'react';
import { SFX, type SfxKey } from '@/platform/audio/sfx';
import { playSfx } from '@/platform/audio/sfxPlayer';
import Icon from '@/platform/ui/Icon';

interface DialogProps {
  title: string;
  onClose: () => void;
  /** Ảnh minh hoạ (thường là Pip) */
  image?: string;
  /** Tiếng khi mở; `null` = im lặng */
  openSfx?: SfxKey | null;
  className?: string;
  children: ReactNode;
  /** Hàng nút cuối hộp */
  actions?: ReactNode;
}

export default function Dialog({
  title,
  onClose,
  image,
  openSfx = SFX.UI_OPEN,
  className = '',
  children,
  actions,
}: DialogProps) {
  const titleId = useId();

  const close = () => {
    playSfx(SFX.UI_CLOSE);
    onClose();
  };

  // Phát khi mở (và khi hộp chuyển sang bước khác có tiếng riêng, vd xác nhận -> đã mở khoá)
  useEffect(() => {
    if (openSfx) playSfx(openSfx);
  }, [openSfx]);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        playSfx(SFX.UI_CLOSE);
        onClose();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="dialog-backdrop" onClick={close}>
      <div
        className={`dialog ${image ? 'dialog--with-image' : ''} ${className}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        onClick={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="icon-btn icon-btn--close dialog__close"
          aria-label="Close"
          onClick={close}
        >
          <Icon name="close" size={22} />
        </button>
        {image && <img className="dialog__image" src={image} alt="" draggable={false} />}
        <h2 id={titleId} className="dialog__title">
          {title}
        </h2>
        <div className="dialog__body">{children}</div>
        {actions && <div className="dialog__actions">{actions}</div>}
      </div>
    </div>
  );
}
