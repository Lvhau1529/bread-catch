/**
 * Main menu (plan §3): nút PLAY vào Setup, bật tắt âm thanh, mở Hướng dẫn,
 * cập nhật khi có bản mới.
 */
import { mascotUrl } from '@/app/assets';
import AudioToggles from '@/app/components/AudioToggles';
import Button from '@/app/components/Button';
import { openGuide } from '@/app/guide/guideStore';
import UpdateBanner from '@/app/pwa/UpdateBanner';
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
      <UpdateBanner />
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
          <span aria-hidden="true">▶</span> {UI_TEXT.play}
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
    </div>
  );
}
