/**
 * Phần thưởng trong hộp quà của đội thắng (plan §23).
 * Nội dung đang là placeholder — thay bằng phần thưởng thật của lớp khi có.
 */
export interface Reward {
  id: string;
  title: string;
  description: string;
  /** Texture trong game (tuỳ chọn) */
  iconKey?: string;
}

export const REWARDS: Reward[] = [
  {
    id: 'mystery-prize',
    title: 'MYSTERY PRIZE',
    description: 'Your teacher has a special surprise for you!',
    iconKey: 'star',
  },
  {
    id: 'super-star',
    title: 'SUPER STARS',
    description: 'Everyone gives you a big round of applause!',
    iconKey: 'star',
  },
  {
    id: 'baker-of-the-day',
    title: 'BAKERS OF THE DAY',
    description: 'You are the best phonics bakers today!',
    iconKey: 'star',
  },
];
