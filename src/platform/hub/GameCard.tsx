/**
 * Thẻ game ở màn chọn game:
 *   - GameCard: game chơi được (nút ▶) hoặc đang khoá (ảnh mờ + ổ khoá, giá kim cương thay nút ▶)
 *   - UpcomingCard: game sắp ra mắt (ảnh bìa bí ẩn + nhãn COMING SOON)
 */
import type { CSSProperties } from 'react';
import type { GameManifest, UpcomingGame } from '@/platform/types';
import Icon from '@/platform/ui/Icon';
import { COMING_SOON_COVER } from '@/platform/ui/icons';

interface GameCardProps {
  game: GameManifest;
  locked: boolean;
  onClick: () => void;
}

export function GameCard({ game, locked, onClick }: GameCardProps) {
  return (
    <button
      type="button"
      className={`game-card ${locked ? 'game-card--locked' : ''}`}
      style={{ '--accent': game.accent } as CSSProperties}
      aria-label={locked ? `${game.title} — locked, ${game.price} gems` : game.title}
      onClick={onClick}
    >
      <span className="game-card__media">
        <img className="game-card__cover" src={game.cover} alt="" />
        {locked && <Icon name="padlock" size={72} className="game-card__lock" />}
      </span>
      <span className="game-card__body">
        <span className="game-card__title">{game.title}</span>
        <span className="game-card__tagline">{game.tagline}</span>
        <span className="game-card__skills">
          {game.skills.map((skill) => (
            <span key={skill}>{skill}</span>
          ))}
        </span>
        {locked ? (
          <span className="game-card__price" aria-hidden="true">
            <Icon name="gemSmall" size={26} />
            {game.price}
          </span>
        ) : (
          <span className="game-card__play" aria-hidden="true">
            <Icon name="play" size={28} />
          </span>
        )}
      </span>
    </button>
  );
}

export function UpcomingCard({ game, onClick }: { game: UpcomingGame; onClick: () => void }) {
  return (
    <button
      type="button"
      className="game-card game-card--soon"
      style={{ '--accent': 'var(--purple)' } as CSSProperties}
      aria-label={`${game.title} — coming soon`}
      onClick={onClick}
    >
      <span className="game-card__media">
        <img className="game-card__cover game-card__cover--smooth" src={COMING_SOON_COVER} alt="" />
        <span className="game-card__ribbon">COMING SOON</span>
      </span>
      <span className="game-card__body">
        <span className="game-card__title">{game.title}</span>
        <span className="game-card__tagline">{game.tagline}</span>
        <span className="game-card__soon" aria-hidden="true">
          SOON
        </span>
      </span>
    </button>
  );
}
