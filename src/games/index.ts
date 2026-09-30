/**
 * Danh sách game hiện ở màn chọn game (theo thứ tự hiển thị).
 * Thêm game mới: tạo src/games/<id>/ (manifest.ts + root component) rồi thêm manifest vào đây.
 */
import { breadCatcherManifest } from '@/games/bread-catcher/manifest';
import type { GameManifest } from '@/platform/types';

export const GAMES: readonly GameManifest[] = [breadCatcherManifest];
