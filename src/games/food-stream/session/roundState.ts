/**
 * State machine tường minh của một lượt chơi (plan §9): chặn chạm 2 lần, cộng điểm 2 lần,
 * và làm thứ tự hiệu ứng dễ đoán (dễ QA, dễ tạm dừng trong lớp học).
 */
export type RoundState =
  | 'intro'
  | 'countdown'
  | 'prompt'
  | 'awaiting-input'
  | 'correct'
  | 'wrong'
  | 'feeding'
  | 'eating'
  | 'reward'
  | 'next-question'
  | 'complete';

const TRANSITIONS: Record<RoundState, readonly RoundState[]> = {
  intro: ['countdown', 'complete'],
  countdown: ['prompt', 'complete'],
  prompt: ['awaiting-input', 'complete'],
  // Hết giờ của cả lượt có thể đến bất cứ lúc nào
  'awaiting-input': ['correct', 'wrong', 'complete'],
  // Ghép từ chưa xong -> chọn tiếp
  correct: ['awaiting-input', 'feeding', 'complete'],
  // Chọn lại (Solo) / đội kia giành quyền trả lời / hết lượt câu này
  wrong: ['awaiting-input', 'next-question', 'complete'],
  feeding: ['eating', 'complete'],
  eating: ['reward', 'complete'],
  reward: ['next-question', 'complete'],
  'next-question': ['prompt', 'complete'],
  complete: [],
};

export class RoundStateMachine {
  private current: RoundState = 'intro';

  get state(): RoundState {
    return this.current;
  }

  is(state: RoundState): boolean {
    return this.current === state;
  }

  can(next: RoundState): boolean {
    return TRANSITIONS[this.current].includes(next);
  }

  /** Chuyển trạng thái; chuyển sai luật là lỗi lập trình -> báo ngay */
  go(next: RoundState): void {
    if (!this.can(next)) throw new Error(`Invalid round transition: ${this.current} -> ${next}`);
    this.current = next;
  }
}
