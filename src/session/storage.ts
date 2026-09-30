/**
 * Lưu localStorage: cài đặt âm thanh, form Setup gần nhất (gồm tên đội), điểm cao Solo,
 * bảng tổng điểm các đội qua nhiều buổi.
 * An toàn khi localStorage bị chặn (private mode): chỉ giữ trong bộ nhớ.
 */
import { createStore } from '@/shared/createStore';
import type { TeamTotal } from '@/session/leaderboard';
import type { LevelId, SetupDraft } from '@/session/types';

const STORAGE_KEY = 'phonics-bread-catcher-v2';
/** Save của bản Bread Catcher cũ — không còn dùng */
const LEGACY_KEYS = ['bread-catcher-save-v1'];

export interface Prefs {
  sfx: boolean;
  music: boolean;
  /** Đọc to từ mục tiêu (Web Speech) */
  voice: boolean;
}

interface SaveData {
  prefs: Prefs;
  lastSetup: SetupDraft | null;
  soloBest: Partial<Record<LevelId, number>>;
  teamTotals: TeamTotal[];
}

const DEFAULTS: SaveData = {
  prefs: { sfx: true, music: true, voice: true },
  lastSetup: null,
  soloBest: {},
  teamTotals: [],
};

function read(): SaveData {
  try {
    LEGACY_KEYS.forEach((key) => localStorage.removeItem(key));
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<SaveData>;
    return {
      ...DEFAULTS,
      ...stored,
      prefs: { ...DEFAULTS.prefs, ...stored.prefs },
      teamTotals: Array.isArray(stored.teamTotals) ? stored.teamTotals : [],
    };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

const data = read();

function write(): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  } catch {
    // Storage không khả dụng — dữ liệu vẫn còn trong phiên hiện tại
  }
}

/** Cài đặt âm thanh — React (nút bật/tắt) và Phaser (AudioSystem) cùng dùng */
export const prefsStore = createStore<Prefs>(data.prefs);
prefsStore.subscribe(() => {
  data.prefs = prefsStore.get();
  write();
});

export function setPref<K extends keyof Prefs>(key: K, value: Prefs[K]): void {
  prefsStore.set((prefs) => ({ ...prefs, [key]: value }));
}

export function loadLastSetup(): SetupDraft | null {
  return data.lastSetup;
}

export function saveLastSetup(draft: SetupDraft): void {
  data.lastSetup = draft;
  write();
}

/** Ghi điểm Solo theo level; trả về điểm cao nhất và có phải kỷ lục mới */
export function recordSoloScore(levelId: LevelId, score: number): { best: number; isNewBest: boolean } {
  const previous = data.soloBest[levelId] ?? 0;
  const isNewBest = score > previous;
  if (isNewBest) {
    data.soloBest[levelId] = score;
    write();
  }
  return { best: Math.max(previous, score), isNewBest };
}

/** Bảng tổng điểm các đội (Class Mode) — React đọc để hiện / reset */
export const teamTotalsStore = createStore<{ totals: TeamTotal[] }>({ totals: data.teamTotals });
teamTotalsStore.subscribe(() => {
  data.teamTotals = teamTotalsStore.get().totals;
  write();
});

export function saveTeamTotals(totals: TeamTotal[]): void {
  teamTotalsStore.set({ totals });
}

export function resetTeamTotals(): void {
  teamTotalsStore.set({ totals: [] });
}
