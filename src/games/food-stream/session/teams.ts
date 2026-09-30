/**
 * Đội chơi: Solo 1 người (nhân vật tự chọn), Classroom 2 đội — TEAM A (nhân vật hồng),
 * TEAM B (nhân vật xanh) như banner trong art board.
 */
import type { SetupDraft, StreamerId, Team } from '@/games/food-stream/session/types';

export const TEAM_STREAMERS: readonly [StreamerId, StreamerId] = ['girl', 'boy'];
export const DEFAULT_TEAM_NAMES: readonly [string, string] = ['TEAM A', 'TEAM B'];
export const DEFAULT_PLAYER_NAME = 'PLAYER';

/** Đủ ngắn để không tràn bảng điểm trên màn hình 360px */
export const MAX_NAME_LENGTH = 12;

/** Chuẩn hoá tên nhập vào; bỏ trống thì dùng tên mặc định */
export function cleanName(raw: string, fallback: string): string {
  const name = raw.replace(/\s+/g, ' ').trim().slice(0, MAX_NAME_LENGTH);
  return (name || fallback).toUpperCase();
}

export function buildTeams(draft: SetupDraft): Team[] {
  if (draft.mode === 'solo') return [{ id: 0, name: DEFAULT_PLAYER_NAME, streamer: draft.streamer }];
  return draft.teamNames.map((name, index) => ({
    id: index as Team['id'],
    name: cleanName(name, DEFAULT_TEAM_NAMES[index]),
    streamer: TEAM_STREAMERS[index],
  }));
}
