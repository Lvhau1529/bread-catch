/**
 * Nút nhỏ ở góc màn chọn game; bấm mở popup thông tin tác giả (tên, số điện thoại — chạm để gọi).
 */
import { useState } from 'react';
import { AUTHOR } from '@/platform/about';
import Dialog from '@/platform/ui/Dialog';

export default function AuthorBadge() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button type="button" className="author-badge" aria-haspopup="dialog" onClick={() => setOpen(true)}>
        <span aria-hidden="true">ⓘ</span> AUTHOR
      </button>

      {open && (
        <Dialog title="AUTHOR" className="author-popup" onClose={() => setOpen(false)}>
          <dl>
            <dt>NAME</dt>
            <dd lang="vi">{AUTHOR.name}</dd>
            <dt>PHONE</dt>
            <dd>
              <a href={`tel:${AUTHOR.phone}`}>{AUTHOR.phone}</a>
            </dd>
          </dl>
        </Dialog>
      )}
    </>
  );
}
