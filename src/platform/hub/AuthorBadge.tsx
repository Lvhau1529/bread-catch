/**
 * Nút nhỏ ở góc màn chọn game; bấm mở popup thông tin tác giả (tên, số điện thoại — chạm để gọi).
 * Esc hoặc bấm ra ngoài để đóng.
 */
import { useEffect, useState } from 'react';
import { AUTHOR } from '@/platform/about';
import { SFX } from '@/platform/audio/sfx';
import { playSfx } from '@/platform/audio/sfxPlayer';

export default function AuthorBadge() {
  const [open, setOpen] = useState(false);

  const toggle = (next: boolean) => {
    playSfx(SFX.UI_CLICK);
    setOpen(next);
  };

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      <button type="button" className="author-badge" aria-haspopup="dialog" onClick={() => toggle(true)}>
        <span aria-hidden="true">ⓘ</span> AUTHOR
      </button>

      {open && (
        <div className="author-backdrop" onClick={() => toggle(false)}>
          <div
            className="author-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby="author-title"
            onClick={(event) => event.stopPropagation()}
          >
            <button
              type="button"
              className="icon-btn icon-btn--close author-popup__close"
              aria-label="Close"
              onClick={() => toggle(false)}
            >
              ✕
            </button>
            <h2 id="author-title">AUTHOR</h2>
            <dl>
              <dt>NAME</dt>
              <dd lang="vi">{AUTHOR.name}</dd>
              <dt>PHONE</dt>
              <dd>
                <a href={`tel:${AUTHOR.phone}`}>{AUTHOR.phone}</a>
              </dd>
            </dl>
          </div>
        </div>
      )}
    </>
  );
}
