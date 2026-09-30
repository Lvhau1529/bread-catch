/**
 * Xếp hạng cuối buổi (plan §15, §22, §23).
 * Tie-breaker: điểm cao hơn -> ít lần hứng nhầm hơn -> còn nhiều thời gian hơn -> đồng hạng.
 */
import type { Team, TurnResult } from '@/session/types';

export interface Standing {
  team: Team;
  result: TurnResult;
  /** Hạng (đồng hạng thì cùng số: 1, 1, 3) */
  place: number;
  accuracy: number;
}

/** Tỉ lệ từ đúng trên số từ đã chơi (0..1) */
export function accuracyOf(result: TurnResult): number {
  const attempts = result.correctWords + result.wrongWords;
  return attempts === 0 ? 0 : result.correctWords / attempts;
}

const secondsLeft = (result: TurnResult) => Math.ceil(result.timeRemainingMs / 1000);

function compare(a: TurnResult, b: TurnResult): number {
  return b.score - a.score || a.wrongCatches - b.wrongCatches || secondsLeft(b) - secondsLeft(a);
}

export function rankTeams(teams: readonly Team[], results: readonly TurnResult[]): Standing[] {
  const sorted = results
    .map((result) => ({ result, team: teams.find((t) => t.id === result.teamId) }))
    .filter((row): row is { result: TurnResult; team: Team } => row.team !== undefined)
    .sort((a, b) => compare(a.result, b.result));

  return sorted.map((row, index) => {
    let place = index + 1;
    // Đồng hạng với người đứng trước -> dùng chung hạng
    for (let i = index; i > 0 && compare(sorted[i - 1].result, row.result) === 0; i -= 1) place = i;
    return { ...row, place, accuracy: accuracyOf(row.result) };
  });
}

/** Mọi đội đồng hạng nhất đều được nhận quà (plan §23) */
export function winnersOf(standings: readonly Standing[]): Standing[] {
  return standings.filter((s) => s.place === 1);
}
