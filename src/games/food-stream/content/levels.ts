/**
 * Cấp độ = kiểu câu hỏi (learning mode, plan §6) + độ khó (plan §21).
 * Một cấp chỉ hiện ở gói có đủ nội dung cho kiểu câu hỏi đó (vd: CVC WORDS không có "Hear & Tap").
 */
import {
  hasPicture,
  MAX_SPELLING_LENGTH,
  PICTURED_WORDS,
  type ContentPack,
} from '@/games/food-stream/content/packs';

export type QuestionMode =
  | 'hear-and-tap'
  | 'picture-to-sound'
  | 'find-the-word'
  | 'build-word'
  | 'missing-letter'
  | 'listen-and-build';

export type Difficulty = 1 | 2 | 3 | 4 | 5;

export interface LevelDef {
  id: string;
  number: number;
  title: string;
  /** Một dòng mô tả (tiếng Anh) ở màn Setup */
  hint: string;
  /** Nhiều kiểu = ôn tập trộn */
  modes: QuestionMode[];
  /** Số lựa chọn cho câu hỏi chọn 1 (mẫu giáo: 3, tối đa 4 trên điện thoại) */
  choices: 3 | 4;
  /** Số chữ gây nhiễu thêm vào khay khi ghép từ */
  extraTiles: number;
  /** Số câu mỗi lượt Solo */
  questions: number;
  /** Có giới hạn thời gian cả lượt (giây) — chỉ cấp cuối, tránh áp lực thời gian ở cấp đầu */
  timeLimitSec?: number;
  difficulty: Difficulty;
}

export const LEVELS: readonly LevelDef[] = [
  {
    id: 'hear-tap',
    number: 1,
    title: 'HEAR & TAP',
    hint: 'Listen to the sound. Feed the food with that letter!',
    modes: ['hear-and-tap'],
    choices: 3,
    extraTiles: 0,
    questions: 10,
    difficulty: 1,
  },
  {
    id: 'picture-sound',
    number: 2,
    title: 'PICTURE SOUND',
    hint: 'Look at the picture. Which letter does it start with?',
    modes: ['picture-to-sound'],
    choices: 3,
    extraTiles: 0,
    questions: 10,
    difficulty: 2,
  },
  {
    id: 'find-word',
    number: 3,
    title: 'FIND THE WORD',
    hint: 'Hear the sound. Find the picture that starts with it!',
    modes: ['find-the-word'],
    choices: 3,
    extraTiles: 0,
    questions: 10,
    difficulty: 2,
  },
  {
    id: 'build-word',
    number: 4,
    title: 'BUILD THE WORD',
    hint: 'Look and listen. Feed the letters in order!',
    modes: ['build-word'],
    choices: 3,
    extraTiles: 1,
    questions: 8,
    difficulty: 3,
  },
  {
    id: 'missing-letter',
    number: 5,
    title: 'MISSING LETTER',
    hint: 'One letter is missing from the word. Which one?',
    modes: ['missing-letter'],
    choices: 3,
    extraTiles: 0,
    questions: 10,
    difficulty: 3,
  },
  {
    id: 'listen-build',
    number: 6,
    title: 'LISTEN & BUILD',
    hint: 'Only listen — no picture. Build the word!',
    modes: ['listen-and-build'],
    choices: 3,
    extraTiles: 2,
    questions: 8,
    difficulty: 4,
  },
  {
    id: 'speed-review',
    number: 7,
    title: 'SPEED REVIEW',
    hint: 'Everything mixed! Answer as many as you can.',
    modes: ['hear-and-tap', 'picture-to-sound', 'find-the-word', 'build-word', 'missing-letter'],
    choices: 4,
    extraTiles: 1,
    questions: 15,
    timeLimitSec: 90,
    difficulty: 5,
  },
];

const isCvc = (word: string) => word.length === 3;

/** Gói có đủ nội dung cho kiểu câu hỏi này không */
export function isModeAvailable(pack: ContentPack, mode: QuestionMode): boolean {
  switch (mode) {
    case 'hear-and-tap':
      return pack.sounds.length > 0;
    case 'picture-to-sound':
      return pack.words.some(hasPicture);
    case 'find-the-word':
      return pack.sounds.some(
        (sound) =>
          pack.words.some((word) => hasPicture(word) && word.initialSound === sound.grapheme) &&
          PICTURED_WORDS.some((word) => word.initialSound !== sound.grapheme),
      );
    case 'build-word':
    case 'listen-and-build':
      return pack.spellingWords.some((word) => word.word.length <= MAX_SPELLING_LENGTH);
    case 'missing-letter':
      return pack.spellingWords.some((word) => isCvc(word.word));
  }
}

/** Các kiểu câu hỏi của cấp mà gói chơi được */
export const playableModes = (pack: ContentPack, level: LevelDef): QuestionMode[] =>
  level.modes.filter((mode) => isModeAvailable(pack, mode));

export const levelsForPack = (pack: ContentPack): LevelDef[] =>
  LEVELS.filter((level) => playableModes(pack, level).length > 0);

export function getLevel(id: string): LevelDef {
  return LEVELS.find((level) => level.id === id) ?? LEVELS[0];
}
