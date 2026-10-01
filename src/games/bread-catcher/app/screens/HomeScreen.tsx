/**
 * Main menu (plan §3): nút PLAY vào Setup, bật tắt âm thanh, mở Hướng dẫn, quay về màn chọn game.
 */
import { mascotUrl } from '@/games/bread-catcher/app/assets';
import { sessionActions } from '@/games/bread-catcher/session/sessionStore';
import { SOLO_MASCOT, TEAM_MASCOTS } from '@/games/bread-catcher/session/teams';
import { UI_TEXT } from '@/games/bread-catcher/session/text';
import { SFX } from '@/platform/audio/sfx';
import { platformActions } from '@/platform/platformStore';
import AudioToggles from '@/platform/ui/AudioToggles';
import BackButton from '@/platform/ui/BackButton';
import Button from '@/platform/ui/Button';
import Icon from '@/platform/ui/Icon';
import { openGuide } from '@/platform/ui/guide/guideStore';

/** Mỗi chữ của "PHONICS" một màu như concept board */
const TITLE_LETTERS = 'PHONICS'.split('');

export default function HomeScreen() {
  return (
    <div className="screen home">
      <BackButton
        className="home__exit"
        label={UI_TEXT.allGames}
        onClick={() => platformActions.exitToHub()}
      />
      <h1 className="logo" aria-label={UI_TEXT.title}>
        <span className="logo__top" aria-hidden="true">
          {TITLE_LETTERS.map((letter, index) => (
            <span key={index} className={`logo__letter logo__letter--${index % 5}`}>
              {letter}
            </span>
          ))}
        </span>
        <span className="logo__bottom" aria-hidden="true">
          BREAD CATCHER
        </span>
      </h1>

      <div className="home__mascots" aria-hidden="true">
        {[...TEAM_MASCOTS, SOLO_MASCOT].map((mascot, index) => (
          <img key={mascot} src={mascotUrl(mascot)} alt="" style={{ animationDelay: `${index * 0.15}s` }} />
        ))}
      </div>

      <div className="home__actions">
        {/* Chọn Class / Solo ở GAME MODE trong Setup (nhớ lựa chọn lần trước) */}
        <Button
          color="orange"
          size="lg"
          className="home__play"
          sfx={SFX.UI_START}
          onClick={() => sessionActions.openSetup()}
        >
          <Icon name="play" size={26} /> {UI_TEXT.play}
        </Button>
      </div>

      <AudioToggles />
      <button type="button" className="guide-link" onClick={() => openGuide()}>
        ? {UI_TEXT.guide}
      </button>
    </div>
  );
}
