/**
 * Đọc store (src/shared/createStore.ts) trong React.
 * `selector` phải trả về giá trị ổn định (một phần của state), không tạo object mới.
 */
import { useSyncExternalStore } from 'react';
import { prefsStore, type Prefs } from '@/platform/prefs';
import type { Store } from '@/shared/createStore';

export function useStore<T extends object, S>(store: Store<T>, selector: (state: T) => S): S {
  return useSyncExternalStore(store.subscribe, () => selector(store.get()));
}

export const usePrefs = (): Prefs => useStore(prefsStore, (prefs) => prefs);
