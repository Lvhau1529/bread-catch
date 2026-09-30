/**
 * Main menu (plan §3): chọn Class Mode / Solo Mode, bật tắt âm thanh, mở Hướng dẫn.
 */
import { mascotUrl } from '@/app/assets';
import AudioToggles from '@/app/components/AudioToggles';
import Button from '@/app/components/Button';
import { openGuide } from '@/app/guide/guideStore';
import { GameBridge } from '@/game/bridge';
import { SFX } from '@/game/config/assets';
import { sessionActions } from '@/session/sessionStore';
import { SOLO_MASCOT, TEAM_MASCOTS } from '@/session/teams';
import { UI_TEXT } from '@/session/text';

/** Mỗi chữ của "PHONICS" một màu như concept board */
const TITLE_LETTERS = 'PHONICS'.split('');

export default function HomeScreen() {
  return (
    <div className="screen home">
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
        <Button color="orange" size="lg" sfx={SFX.UI_START} onClick={() => sessionActions.openSetup('class')}>
          {UI_TEXT.playClassMode}
        </Button>
        <Button color="blue" size="lg" sfx={SFX.UI_START} onClick={() => sessionActions.openSetup('solo')}>
          {UI_TEXT.playSoloMode}
        </Button>
      </div>

      <AudioToggles />
      <button
        type="button"
        className="guide-link"
        onClick={() => {
          GameBridge.playSfx(SFX.UI_CLICK);
          openGuide();
        }}
      >
        ? {UI_TEXT.guide}
      </button>
      <p className="credit">{UI_TEXT.madeBy}</p>
    </div>
  );
}
