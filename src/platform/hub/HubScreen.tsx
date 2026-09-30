/**
 * Màn chọn game chung của Phonics Arcade: thẻ từng game + bật/tắt âm thanh + nút cập nhật PWA
 * + nút thông tin tác giả ở góc màn hình.
 * Danh sách game truyền vào từ src/games/index.ts.
 */
import type { CSSProperties } from 'react';
import { SFX } from '@/platform/audio/sfx';
import { playSfx, preloadSfx } from '@/platform/audio/sfxPlayer';
import AuthorBadge from '@/platform/hub/AuthorBadge';
import { platformActions } from '@/platform/platformStore';
import UpdateBanner from '@/platform/pwa/UpdateBanner';
import type { GameManifest } from '@/platform/types';
import AudioToggles from '@/platform/ui/AudioToggles';
import { speech } from '@/shared/speech';

const TITLE = 'PHONICS';

preloadSfx([SFX.UI_CLICK, SFX.UI_START]);

export default function HubScreen({ games }: { games: readonly GameManifest[] }) {
  const open = (game: GameManifest) => {
    speech.unlock(); // iOS: giọng đọc chỉ bật được trong thao tác chạm
    playSfx(SFX.UI_START);
    // Tải trước chunk của game trong lúc âm thanh phát
    void game.load();
    platformActions.openGame(game.id);
  };

  return (
    <main className="hub">
      <UpdateBanner />
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
        {games.map((game) => (
          <li key={game.id}>
            <button
              type="button"
              className="game-card"
              style={{ '--accent': game.accent } as CSSProperties}
              onClick={() => open(game)}
            >
              <img className="game-card__cover" src={game.cover} alt="" />
              <span className="game-card__body">
                <span className="game-card__title">{game.title}</span>
                <span className="game-card__tagline">{game.tagline}</span>
                <span className="game-card__skills">
                  {game.skills.map((skill) => (
                    <span key={skill}>{skill}</span>
                  ))}
                </span>
                <span className="game-card__play" aria-hidden="true">
                  ▶
                </span>
              </span>
            </button>
          </li>
        ))}
      </ul>

      <AudioToggles />
      <AuthorBadge />
    </main>
  );
}
