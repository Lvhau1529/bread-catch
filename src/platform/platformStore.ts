/**
 * Game đang mở, đồng bộ với URL hash (`#/bread-catcher`):
 *   - giáo viên đánh dấu / chia sẻ link mở thẳng một game
 *   - nút Back của trình duyệt / Android quay về màn chọn game
 */
import { createStore } from '@/shared/createStore';

const HASH_PREFIX = '#/';

function gameIdFromHash(): string | null {
  const { hash } = window.location;
  return hash.startsWith(HASH_PREFIX) ? decodeURIComponent(hash.slice(HASH_PREFIX.length)) || null : null;
}

export const platformStore = createStore<{ activeGameId: string | null }>({
  activeGameId: gameIdFromHash(),
});

window.addEventListener('hashchange', () => platformStore.set({ activeGameId: gameIdFromHash() }));

export const platformActions = {
  openGame(id: string): void {
    window.location.hash = `${HASH_PREFIX}${encodeURIComponent(id)}`;
  },

  /** Về màn chọn game */
  exitToHub(): void {
    if (!gameIdFromHash()) return;
    // Bỏ hash mà không để lại "#" trên URL
    window.history.pushState(null, '', window.location.pathname + window.location.search);
    platformStore.set({ activeGameId: null });
  },
};
