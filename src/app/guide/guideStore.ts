/**
 * Trạng thái mở / đóng hộp Hướng dẫn — Home và Setup đều mở được, App hiển thị.
 */
import type { GuideSectionId } from '@/app/guide/guideContent';
import { createStore } from '@/shared/createStore';

export const guideStore = createStore<{ open: boolean; section: GuideSectionId }>({
  open: false,
  section: 'about',
});

export function openGuide(section: GuideSectionId = 'about'): void {
  guideStore.set({ open: true, section });
}

export function closeGuide(): void {
  guideStore.set((state) => ({ ...state, open: false }));
}
