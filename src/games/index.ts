/**
 * Danh sách game hiện ở màn chọn game (theo thứ tự hiển thị).
 * Thêm game mới: tạo src/games/<id>/ (manifest.ts + root component) rồi thêm manifest vào đây
 * (đặt `price` trong manifest nếu muốn bé dùng kim cương mở khoá).
 * UPCOMING: thẻ COMING SOON — game ra mắt rồi thì xoá khỏi đây.
 */
import { breadCatcherManifest } from '@/games/bread-catcher/manifest';
import { foodStreamManifest } from '@/games/food-stream/manifest';
import type { GameManifest, UpcomingGame } from '@/platform/types';

export const GAMES: readonly GameManifest[] = [breadCatcherManifest, foodStreamManifest];

export const UPCOMING: readonly UpcomingGame[] = [
  { id: 'next-game', title: 'NEW GAME', tagline: 'A brand-new phonics game is on the way!' },
];
