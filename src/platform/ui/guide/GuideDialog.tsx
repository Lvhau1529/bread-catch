/**
 * Hộp HƯỚNG DẪN (tiếng Việt, cho giáo viên / phụ huynh) — khung dùng chung, nội dung do từng game truyền vào.
 * Mở bằng `openGuide(sectionId)` (guideStore) — tự cuộn tới đúng phần.
 * Mục lục tự sáng theo phần đang đọc (scroll-spy) và KHÔNG phải cuộn ngang:
 *   - màn rộng: cột mục lục bên trái
 *   - điện thoại: thanh [◀] Tên phần ▾ [▶], bấm tên mở bảng chọn 3 cột
 */
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { SFX } from '@/platform/audio/sfx';
import { playSfx } from '@/platform/audio/sfxPlayer';
import { useStore } from '@/platform/hooks/useStore';
import { closeGuide, guideStore } from '@/platform/ui/guide/guideStore';

export interface GuideSection {
  id: string;
  /** Tên ở mục lục */
  title: string;
  /** Nhãn gọn cho bảng chọn trên điện thoại */
  short: string;
  /** Tiêu đề trong nội dung (mặc định = title) */
  heading?: string;
  content: ReactNode;
}

interface GuideDialogProps {
  title: string;
  sections: readonly GuideSection[];
}

/** Tiêu đề phần cách đỉnh khung đọc ≤ ngần này (px) thì coi là "đang đọc" */
const SPY_OFFSET = 48;
/** Sau khi bấm mục lục, bỏ qua scroll-spy trong lúc cuộn mượt (ms) */
const JUMP_LOCK_MS = 800;

export default function GuideDialog({ title, sections }: GuideDialogProps) {
  const { open, section } = useStore(guideStore, (state) => state);
  const bodyRef = useRef<HTMLDivElement>(null);
  const firstId = sections[0]?.id ?? '';
  const [active, setActive] = useState(firstId);
  const [menuOpen, setMenuOpen] = useState(false);
  const lockUntil = useRef(0);

  const scrollToSection = useCallback((id: string, behavior: ScrollBehavior) => {
    setMenuOpen(false);
    const body = bodyRef.current;
    const heading = body?.querySelector<HTMLElement>(`#guide-${id}`);
    lockUntil.current = performance.now() + JUMP_LOCK_MS;
    setActive(id);
    if (!body || !heading) return;
    // Chỉ cuộn khung đọc (scrollIntoView có thể kéo cả các khung bên ngoài)
    const top = body.scrollTop + heading.getBoundingClientRect().top - body.getBoundingClientRect().top;
    body.scrollTo({ top: Math.max(0, top - 8), behavior });
  }, []);

  // Cuộn mượt xong thì mở khoá scroll-spy ngay (trình duyệt có hỗ trợ "scrollend")
  useEffect(() => {
    const body = bodyRef.current;
    if (!open || !body) return undefined;
    const onScrollEnd = () => {
      lockUntil.current = 0;
    };
    body.addEventListener('scrollend', onScrollEnd);
    return () => body.removeEventListener('scrollend', onScrollEnd);
  }, [open]);

  // Mở tới đúng phần được yêu cầu
  useEffect(() => {
    if (open) scrollToSection(section ?? firstId, 'auto');
  }, [open, section, firstId, scrollToSection]);

  // Esc: đóng bảng chọn phần trước, bấm lần nữa mới đóng hướng dẫn
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (menuOpen) setMenuOpen(false);
      else closeGuide();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, menuOpen]);

  if (!open) return null;

  // Scroll-spy: phần có tiêu đề đã chạm gần đỉnh khung đọc; cuộn tới cuối thì là phần cuối
  const updateActive = () => {
    const body = bodyRef.current;
    if (!body || performance.now() < lockUntil.current) return;
    const top = body.getBoundingClientRect().top;
    let current = firstId;
    if (body.scrollTop + body.clientHeight >= body.scrollHeight - 4) {
      current = sections[sections.length - 1].id;
    } else {
      sections.forEach(({ id }) => {
        const heading = body.querySelector(`#guide-${id}`);
        if (heading && heading.getBoundingClientRect().top - top <= SPY_OFFSET) current = id;
      });
    }
    setActive(current);
  };

  const activeIndex = sections.findIndex((item) => item.id === active);
  const activeItem = sections[activeIndex];
  const goTo = (index: number) => {
    const target = sections[index];
    if (!target) return;
    playSfx(SFX.UI_CLICK);
    scrollToSection(target.id, 'smooth');
  };

  return (
    <div className="guide-backdrop" onClick={closeGuide}>
      <div
        className="guide"
        role="dialog"
        aria-modal="true"
        aria-label="Hướng dẫn"
        lang="vi"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="guide__header">
          <h1>{title}</h1>
          <button
            type="button"
            className="icon-btn icon-btn--close"
            aria-label="Đóng"
            onClick={() => {
              playSfx(SFX.UI_CLICK);
              closeGuide();
            }}
          >
            ✕
          </button>
        </header>

        {/* Màn rộng: cột mục lục bên trái */}
        <nav className="guide__nav" aria-label="Mục lục">
          {sections.map((item, index) => (
            <button
              key={item.id}
              type="button"
              className={item.id === active ? 'is-active' : undefined}
              aria-current={item.id === active ? 'true' : undefined}
              onClick={() => goTo(index)}
            >
              <span className="guide__nav-index">{index + 1}</span>
              {item.title}
            </button>
          ))}
        </nav>

        {/* Điện thoại: phần đang đọc + trước / sau + bảng chọn nhanh */}
        <div className="guide__picker">
          <button
            type="button"
            className="guide__step"
            aria-label="Phần trước"
            disabled={activeIndex <= 0}
            onClick={() => goTo(activeIndex - 1)}
          >
            ◀
          </button>
          <button
            type="button"
            className="guide__current"
            aria-expanded={menuOpen}
            aria-haspopup="true"
            onClick={() => setMenuOpen((value) => !value)}
          >
            <span className="guide__current-index">
              {activeIndex + 1}/{sections.length}
            </span>
            <span className="guide__current-title">{activeItem?.title}</span>
            <span className="guide__caret" aria-hidden="true">
              ▾
            </span>
          </button>
          <button
            type="button"
            className="guide__step"
            aria-label="Phần sau"
            disabled={activeIndex >= sections.length - 1}
            onClick={() => goTo(activeIndex + 1)}
          >
            ▶
          </button>

          {menuOpen && (
            <div className="guide__menu" aria-label="Chọn phần">
              {sections.map((item, index) => (
                <button
                  key={item.id}
                  type="button"
                  className={item.id === active ? 'is-active' : undefined}
                  aria-current={item.id === active ? 'true' : undefined}
                  onClick={() => goTo(index)}
                >
                  {item.short}
                </button>
              ))}
            </div>
          )}
        </div>

        <div
          className="guide__body"
          ref={bodyRef}
          onScroll={updateActive}
          onPointerDown={() => setMenuOpen(false)}
        >
          {sections.map((item) => (
            <section key={item.id} className="guide__section" id={`guide-${item.id}`}>
              <h2>{item.heading ?? item.title}</h2>
              {item.content}
            </section>
          ))}
          <p className="guide__build">Phiên bản: {__BUILD_ID__}</p>
        </div>
      </div>
    </div>
  );
}
