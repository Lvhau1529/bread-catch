/**
 * Điểm, combo, người xem và sao (plan §5.1, §12). Người xem / tim chỉ là phần thưởng hình ảnh
 * (không có mạng, không có chat thật).
 */
export const SCORING = {
  correct: 10,
  firstTryBonus: 5,
  /** Chuỗi đúng liên tiếp -> nhân điểm (xét từ mốc cao xuống) */
  combos: [
    { streak: 5, multiplier: 3 },
    { streak: 3, multiplier: 2 },
  ],
  viewers: { start: 120, correct: 50, firstTry: 25, combo: 100, perfect: 500 },
  /** Tim tăng thêm mỗi câu đúng (ngẫu nhiên trong khoảng) */
  hearts: { min: 3, max: 9 },
} as const;

export function comboMultiplier(streak: number): number {
  return SCORING.combos.find((combo) => streak >= combo.streak)?.multiplier ?? 1;
}

export interface AnswerReward {
  points: number;
  multiplier: number;
  viewers: number;
}

/** `streak`: chuỗi đúng tính cả câu này */
export function rewardFor(firstTry: boolean, streak: number): AnswerReward {
  const multiplier = comboMultiplier(streak);
  const base = SCORING.correct + (firstTry ? SCORING.firstTryBonus : 0);
  const viewers =
    SCORING.viewers.correct +
    (firstTry ? SCORING.viewers.firstTry : 0) +
    (multiplier > 1 ? SCORING.viewers.combo : 0);
  return { points: base * multiplier, multiplier, viewers };
}

/** Sao Solo: tỉ lệ câu đúng ngay lần đầu */
export function starsFor(firstTryCount: number, total: number): number {
  if (total === 0) return 0;
  const ratio = firstTryCount / total;
  if (ratio >= 0.9) return 3;
  if (ratio >= 0.6) return 2;
  return 1;
}
