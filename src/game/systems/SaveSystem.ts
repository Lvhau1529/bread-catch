/**
 * Lưu dữ liệu người chơi vào localStorage.
 * An toàn khi localStorage bị chặn (private mode): chỉ giữ trong bộ nhớ.
 */
import { DEFAULT_MODE, type GameMode } from '@/game/config/troll';

const STORAGE_KEY = 'bread-catcher-save-v1';

export interface SaveData {
  bestScore: number;
  highestLevel: number;
  sound: boolean;
  music: boolean;
  mode: GameMode;
}

const DEFAULTS: SaveData = {
  bestScore: 0,
  highestLevel: 1,
  sound: true,
  music: true,
  mode: DEFAULT_MODE,
};

/**
 * Đọc dữ liệu đã lưu mà không cần khởi tạo game.
 * React dùng hàm này để biết mode hiện tại trước khi Phaser boot.
 */
export function loadSaveData(): SaveData {
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<SaveData>;
    return { ...DEFAULTS, ...stored };
  } catch {
    return { ...DEFAULTS };
  }
}

export default class SaveSystem {
  private data: SaveData = loadSaveData();

  get<K extends keyof SaveData>(key: K): SaveData[K] {
    return this.data[key];
  }

  set<K extends keyof SaveData>(key: K, value: SaveData[K]): void {
    this.data[key] = value;
    this.write();
  }

  /** Ghi nhận kết quả một lượt chơi */
  recordRun(score: number, level: number): { isNewBest: boolean; bestScore: number } {
    const isNewBest = score > this.data.bestScore;
    if (isNewBest) this.data.bestScore = score;
    this.data.highestLevel = Math.max(this.data.highestLevel, level);
    this.write();
    return { isNewBest, bestScore: this.data.bestScore };
  }

  private write(): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.data));
    } catch {
      // Storage không khả dụng — bỏ qua, dữ liệu vẫn còn trong phiên hiện tại
    }
  }
}
