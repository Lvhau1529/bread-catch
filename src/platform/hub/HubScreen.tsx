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

const TITLE = 'PHONICS';

preloadSfx([SFX.UI_CLICK, SFX.UI_START, SFX.UI_OPEN, SFX.UI_CLOSE, SFX.GEM_COUNT, SFX.GEM_COLLECT]);

/** Ảnh nền (đường dẫn tương đối với trang) truyền qua biến CSS — CSS chọn bản dọc / ngang */
const BACKGROUND_STYLE = {
  '--hub-bg-portrait': `url(${HUB_BACKGROUND.portrait})`,
  '--hub-bg-landscape': `url(${HUB_BACKGROUND.landscape})`,
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
    <main className="hub" style={BACKGROUND_STYLE}>
      <div className="hub__bar">
        <GemCounter onOpen={() => setDialog({ kind: 'gems' })} />
        <UpdateBanner />
      </div>

      <h1 className="hub__logo" aria-label="Phonics Arcade">
        <span className="hub__logo-top" aria-hidden="true">
          {TITLE.split('').map((letter, index) => (
            <span key={index} className={`hub__letter hub__letter--${index % 5}`}>
              {letter}
            </span>
          ))}
        </span>
        <span className="hub__logo-bottom" aria-hidden="true">
          ARCADE
        </span>
      </h1>
      <p className="hub__subtitle">Choose a game!</p>

      <ul className="hub__games">
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

      <AudioToggles />
      <AuthorBadge />

      {dialog && <HubDialogs dialog={dialog} games={games} onChange={setDialog} onPlay={play} />}
    </main>
  );
}
