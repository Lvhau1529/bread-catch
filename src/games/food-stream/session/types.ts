/**
 * Kiểu dữ liệu của Food Stream — độc lập với React và Phaser.
 */
import type { Difficulty, QuestionMode } from '@/games/food-stream/content/levels';
import type { SoundDef, WordTarget } from '@/games/food-stream/content/packs';

export type GameMode = 'solo' | 'classroom';

/** Nhân vật stream: A (hồng) / B (xanh) — Class Mode: đội A là A, đội B là B */
export type StreamerId = 'girl' | 'boy';

export type TeamId = 0 | 1;

export interface Team {
  id: TeamId;
  name: string;
  streamer: StreamerId;
}

/** Nội dung form Setup (được nhớ lại cho lần sau) */
export interface SetupDraft {
  mode: GameMode;
  packId: string;
  levelId: string;
  /** Solo: nhân vật được cho ăn */
  streamer: StreamerId;
  teamNames: [string, string];
  /** Classroom: số câu mỗi đội */
  questionsPerTeam: number;
  /** Classroom: đội kia được giành quyền trả lời khi đội này sai */
  steal: boolean;
  /** Classroom: giây cho mỗi lần trả lời (0 = không giới hạn) */
  answerSeconds: number;
}

/** Một lựa chọn: đồ ăn mang chữ cái, hoặc đồ ăn cắm thẻ tranh (từ) */
export interface Choice {
  id: string;
  /** Chữ cái (1 ký tự) hoặc từ */
  label: string;
  /** Key tranh (chỉ lựa chọn dạng từ) */
  picture?: string;
}

/** Ô chữ của câu hỏi ghép từ / điền chữ thiếu */
export interface Slot {
  letter: string;
  /** Có sẵn từ đầu (không cần chọn) */
  given: boolean;
}

/** Câu hỏi (plan §8) */
export interface Question {
  id: string;
  mode: QuestionMode;
  targetId: string;
  sound?: SoundDef;
  word?: WordTarget;
  /** Các đoạn giọng đọc khi ra đề (Web Speech; sau này thay bằng file ghi âm) */
  promptSpeech: string[];
  promptText?: string;
  promptImage?: string;
  choices: Choice[];
  /** Câu chọn 1: id đáp án. Câu ghép từ: id các ô chữ đúng theo thứ tự */
  correctChoiceIds: string[];
  /** Chỉ câu ghép từ / điền chữ thiếu */
  slots?: Slot[];
  /** Đọc lại khi trả lời đúng (nghe lại âm / từ — plan §4) */
  feedbackSpeech: string[];
  difficulty: Difficulty;
}

export interface QuestionRecord {
  targetId: string;
  mode: QuestionMode;
  /** Chữ / từ hiển thị ở màn kết quả */
  label: string;
  picture?: string;
  /** Đội trả lời đúng (null = không đội nào) */
  answeredBy: TeamId | null;
  /** Đúng ngay lần đầu, không cần trợ giúp */
  firstTry: boolean;
  points: number;
}

export interface TeamScore {
  team: Team;
  score: number;
  correct: number;
  bestStreak: number;
}

export interface RoundResult {
  records: QuestionRecord[];
  teams: TeamScore[];
  viewers: number;
  hearts: number;
  /** Solo: 1–3 sao theo tỉ lệ đúng ngay lần đầu */
  stars: number;
  perfect: boolean;
  endedBy: 'questions' | 'time';
}
