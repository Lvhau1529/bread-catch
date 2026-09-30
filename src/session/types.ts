/**
 * Kiểu dữ liệu của "classroom shell" — độc lập với React và Phaser
 * để tái sử dụng cho các game lớp học khác (plan §37).
 */

export type GameMode = 'class' | 'solo';

/** HARD = logic troll cũ (prank + chữ cái "láo") */
export type LevelId = 'gentle' | 'easy' | 'normal' | 'fast' | 'hard';

export type PackId = 'early_blending' | 'blending_core' | 'picture_vocab' | 'mixed_review';

export type TimeOption = 'auto' | number;

export type TeamId = 0 | 1 | 2;

export type MascotId = 'lion' | 'tiger' | 'panda' | 'bunny';

/**
 * Mức gợi ý ở ô từ (plan §27):
 *   full         — hiện từ + chữ mờ trong từng ô
 *   word         — hiện từ, ô trống
 *   first-letter — chỉ gợi ý chữ đầu (nghe phát âm)
 *   blank        — ô trống hoàn toàn (nghe phát âm)
 */
export type TargetSupport = 'full' | 'word' | 'first-letter' | 'blank';

export interface SessionSettings {
  mode: GameMode;
  packId: PackId;
  levelId: LevelId;
  time: TimeOption;
}

/** Nội dung form Setup (được nhớ lại cho lần sau) */
export interface SetupDraft extends SessionSettings {
  teamNames: [string, string, string];
  playerName: string;
}

export interface Team {
  id: TeamId;
  name: string;
  mascot: MascotId;
}

export interface WordAttempt {
  word: string;
  correct: boolean;
}

export interface TurnResult {
  teamId: TeamId;
  /** Các từ đã chơi xong (đúng hoặc sai), theo thứ tự */
  attempts: WordAttempt[];
  correctWords: number;
  wrongWords: number;
  /** Số lần hứng nhầm chữ (tie-breaker) */
  wrongCatches: number;
  timeLimitMs: number;
  timeRemainingMs: number;
  score: number;
  endedBy: 'words' | 'time';
}
