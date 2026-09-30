/**
 * Schema của gói nội dung (plan §20) — kiểm tra JSON bằng Zod để nội dung hỏng không làm sập game,
 * và sau này CMS của giáo viên sinh ra cùng định dạng.
 */
import { z } from 'zod';

const letter = z.string().regex(/^[a-z]$/, 'một chữ cái thường');

export const WordTargetSchema = z.object({
  id: z.string().min(1),
  word: z.string().regex(/^[a-z]+$/, 'chỉ gồm chữ cái thường'),
  initialSound: letter,
  /** Key tranh trong sprites.json — có thể chưa có tranh (vd: ostrich) */
  imageAsset: z.string().optional(),
  /** Key file ghi âm (chưa dùng: giọng đọc hiện là Web Speech) */
  voiceAsset: z.string().optional(),
});

export const LetterPackSchema = z.object({
  id: z.string().min(1),
  title: z.string().min(1),
  grapheme: letter,
  /** Ký hiệu âm hiển thị, vd "/d/" */
  phoneme: z.string().min(1),
  /** Cách viết để Web Speech đọc gần đúng âm, vd "duh" */
  phonemeSpeech: z.string().min(1),
  /** Chữ gây nhiễu hợp lý (plan §8): gần về âm / hình nhưng không trùng */
  confusables: z.array(letter).min(3),
  /** Từ bắt đầu bằng âm của gói (tranh -> âm đầu, tìm từ) */
  targets: z.array(WordTargetSchema).min(1),
  /** Từ ngắn để ghép / điền chữ thiếu */
  cvcWords: z.array(WordTargetSchema).default([]),
});

export type WordTarget = z.infer<typeof WordTargetSchema>;
export type LetterPackData = z.infer<typeof LetterPackSchema>;
