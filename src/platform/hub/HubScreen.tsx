/**
 * Màn chọn game chung của Phonics Arcade:
 *   - thanh trên: bộ đếm kim cương (bấm để xem lời động viên) + nút cập nhật PWA
 *   - thẻ từng game (đang khoá thì hiện giá kim cương) + thẻ COMING SOON
 *   - bật/tắt âm thanh, nút thông tin tác giả ở góc màn hình
 * Danh sách game truyền vào từ src/games/index.ts.
 */
import { useState, type CSSProperties } from 'react';
import { SFX } from '@/platform/audio/sfx';
import { playSfx, preloadSfx } from '@/platform/audio/sfxPlayer';
import { isUnlocked, walletStore } from '@/platform/gems/wallet';
import { useStore } from '@/platform/hooks/useStore';
import AuthorBadge from '@/platform/hub/AuthorBadge';
import { GameCard, UpcomingCard } from '@/platform/hub/GameCard';
import GemCounter from '@/platform/hub/GemCounter';
import HubDialogs, { type HubDialogState } from '@/platform/hub/HubDialogs';
import { platformActions } from '@/platform/platformStore';
import UpdateBanner from '@/platform/pwa/UpdateBanner';
import type { GameManifest, UpcomingGame } from '@/platform/types';
import AudioToggles from '@/platform/ui/AudioToggles';
import { HUB_BACKGROUND } from '@/platform/ui/icons';
import { speech } from '@/shared/speech';
import styles from '@/platform/hub/HubScreen.module.scss';

const TITLE = 'PHONICS';

preloadSfx([SFX.UI_CLICK, SFX.UI_START, SFX.UI_OPEN, SFX.UI_CLOSE, SFX.GEM_COUNT, SFX.GEM_COLLECT]);

/**
 * Ảnh nền truyền qua biến CSS — CSS chọn bản dọc / ngang.
 * Phải là URL tuyệt đối: url() tương đối trong biến CSS được tính theo file CSS dùng biến
 * (bản build: /static/…css -> /static/assets/… không tồn tại), không theo trang.
 */
const absoluteUrl = (path: string): string => new URL(path, document.baseURI).href;

const BACKGROUND_STYLE = {
  '--hub-bg-portrait': `url(${absoluteUrl(HUB_BACKGROUND.portrait)})`,
  '--hub-bg-landscape': `url(${absoluteUrl(HUB_BACKGROUND.landscape)})`,
} as CSSProperties;

interface HubScreenProps {
  games: readonly GameManifest[];
  upcoming: readonly UpcomingGame[];
}

export default function HubScreen({ games, upcoming }: HubScreenProps) {
  const wallet = useStore(walletStore, (state) => state);
  const [dialog, setDialog] = useState<HubDialogState | null>(null);

  const play = (game: GameManifest) => {
    speech.unlock(); // iOS: giọng đọc chỉ bật được trong thao tác chạm
    playSfx(SFX.UI_START);
    // Tải trước chunk của game trong lúc âm thanh phát
    void game.load();
    setDialog(null);
    platformActions.openGame(game.id);
  };

  const openLocked = (game: GameManifest) => {
    playSfx(SFX.LOCKED);
    setDialog({ kind: wallet.gems >= (game.price ?? 0) ? 'unlock' : 'locked', game });
  };

  return (
    <main className={styles.hub} style={BACKGROUND_STYLE}>
      <div className={styles.bar}>
        <GemCounter onOpen={() => setDialog({ kind: 'gems' })} />
        <UpdateBanner className={styles.update} />
      </div>

      <h1 className={styles.logo} aria-label="Phonics Arcade">
        <span className={styles.logoTop} aria-hidden="true">
          {TITLE.split('').map((letter, index) => (
            <span key={index} className={styles.letter}>
              {letter}
            </span>
          ))}
        </span>
        <span className={styles.logoBottom} aria-hidden="true">
          ARCADE
        </span>
      </h1>
      <p className={styles.subtitle}>Choose a game!</p>

      <ul className={styles.games}>
        {games.map((game) => {
          const locked = !isUnlocked(game, wallet);
          return (
            <li key={game.id}>
              <GameCard
                game={game}
                locked={locked}
                onClick={() => (locked ? openLocked(game) : play(game))}
              />
            </li>
          );
        })}
        {upcoming.map((game) => (
          <li key={game.id}>
            <UpcomingCard game={game} onClick={() => setDialog({ kind: 'soon' })} />
          </li>
        ))}
      </ul>

      <AudioToggles className={styles.toggles} />
      <AuthorBadge />

      {dialog && <HubDialogs dialog={dialog} games={games} onChange={setDialog} onPlay={play} />}
    </main>
  );
}
