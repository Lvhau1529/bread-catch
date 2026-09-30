/**
 * Gói từ vựng (PHONICS PACK) dựng từ src/data/phonics_word_bank.json.
 * Chỉ dùng phần Phonics của bảng từ (không dùng phần ESL review).
 * Chữ luôn viết HOA khi chơi (plan §34: chữ rơi in hoa, cỡ lớn).
 */
import wordBank from '@/data/phonics_word_bank.json';
import type { PackId } from '@/session/types';

export interface PackDef {
  id: PackId;
  label: string;
  words: string[];
}

const { packs } = wordBank;

/** Chỉ giữ từ đơn gồm chữ cái, viết hoa, bỏ trùng */
function normalize(words: readonly string[]): string[] {
  const clean = words.filter((word) => /^[a-z]+$/i.test(word)).map((word) => word.toUpperCase());
  return [...new Set(clean)];
}

const earlyWords = normalize(packs.early_blending);
const blendingWords = normalize([...packs.blending_core, ...packs.longer_review]);
const pictureWords = normalize(Object.values(packs.phonics_picture_vocab).flat());

export const PACKS: Record<PackId, PackDef> = {
  blending_core: { id: 'blending_core', label: 'BLENDING WORDS', words: blendingWords },
  early_blending: { id: 'early_blending', label: 'EARLY BLENDING', words: earlyWords },
  picture_vocab: { id: 'picture_vocab', label: 'PICTURE VOCABULARY', words: pictureWords },
  mixed_review: {
    id: 'mixed_review',
    label: 'MIXED REVIEW',
    words: normalize([...earlyWords, ...blendingWords, ...pictureWords]),
  },
};

export const PACK_ORDER: PackId[] = ['blending_core', 'early_blending', 'picture_vocab', 'mixed_review'];

/** Vài từ mẫu (rải đều trong gói) để giáo viên hình dung gói từ */
export function packPreview(id: PackId, count = 4): string {
  const { words } = PACKS[id];
  const step = Math.max(1, Math.floor(words.length / count));
  return words
    .filter((_, index) => index % step === 0)
    .slice(0, count)
    .map((word) => word.toLowerCase())
    .join(' · ');
}

/** Tập chữ cái của gói — dùng làm chữ "gây nhiễu" khi rơi (plan §10) */
export function packLetters(id: PackId): string[] {
  return [...new Set(PACKS[id].words.join(''))].sort();
}
