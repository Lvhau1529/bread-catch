/**
 * Bảng tổng điểm của lớp qua nhiều buổi chơi (lưu localStorage — xem storage.ts).
 *
 * Mỗi đội được nhận diện theo vị trí (TEAM 1 / 2 / 3 — cùng mascot), tên lấy theo lần chơi
 * gần nhất nên đổi tên đội vẫn giữ nguyên điểm. Chỉ cộng khi buổi Class Mode chơi đủ 3 lượt.
 */
import type { MascotId, Team, TeamId, TurnResult } from '@/games/bread-catcher/session/types';

export interface TeamTotal {
  teamId: TeamId;
  name: string;
  mascot: MascotId;
  /** Tổng điểm tích luỹ */
  total: number;
  /** Số buổi đã chơi */
  games: number;
}

export interface LeaderboardRow extends TeamTotal {
  /** Hạng (đồng điểm thì cùng hạng) */
  place: number;
}

/** Bảng trước và sau khi cộng điểm buổi vừa chơi — để chạy hiệu ứng vượt hạng */
export interface LeaderboardUpdate {
  before: LeaderboardRow[];
  after: LeaderboardRow[];
  /** Điểm cộng thêm của từng đội trong buổi này */
  gained: Partial<Record<TeamId, number>>;
}

/** Sắp theo tổng điểm giảm dần (đồng điểm giữ thứ tự TEAM 1 / 2 / 3) */
export function rankTotals(totals: readonly TeamTotal[]): LeaderboardRow[] {
  const sorted = [...totals].sort((a, b) => b.total - a.total || a.teamId - b.teamId);
  return sorted.map((row) => ({
    ...row,
    place: sorted.findIndex((other) => other.total === row.total) + 1,
  }));
}

/** Cộng điểm buổi vừa chơi vào bảng tổng (trả về bảng mới, không sửa bảng cũ) */
export function addSession(
  totals: readonly TeamTotal[],
  teams: readonly Team[],
  results: readonly TurnResult[],
): TeamTotal[] {
  return teams.map((team) => {
    const previous = totals.find((row) => row.teamId === team.id);
    const score = results.find((result) => result.teamId === team.id)?.score ?? 0;
    return {
      teamId: team.id,
      name: team.name,
      mascot: team.mascot,
      total: (previous?.total ?? 0) + score,
      games: (previous?.games ?? 0) + 1,
    };
  });
}

/** Bảng "trước" gồm cả đội mới (0 điểm) để hiệu ứng có đủ hàng */
export function withTeams(totals: readonly TeamTotal[], teams: readonly Team[]): TeamTotal[] {
  return teams.map((team) => {
    const saved = totals.find((row) => row.teamId === team.id);
    // Luôn dùng tên hiện tại của đội (đổi tên vẫn giữ điểm)
    return {
      teamId: team.id,
      name: team.name,
      mascot: team.mascot,
      total: saved?.total ?? 0,
      games: saved?.games ?? 0,
    };
  });
}
