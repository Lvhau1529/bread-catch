/**
 * Main menu (plan §4.1): PLAY vào Setup, bật / tắt âm thanh, Hướng dẫn, quay về màn chọn game.
 * Trẻ không cần đọc: nút PLAY to; hai streamer ngồi chờ ở phòng stream phía sau (StudioScene).
 */
import { foodStreamActions } from '@/games/food-stream/session/store';
import { TEXT } from '@/games/food-stream/text';
import { SFX } from '@/platform/audio/sfx';
import { platformActions } from '@/platform/platformStore';
import AudioToggles from '@/platform/ui/AudioToggles';
import BackButton from '@/platform/ui/BackButton';
import Button from '@/platform/ui/Button';
import Icon from '@/platform/ui/Icon';
import { openGuide } from '@/platform/ui/guide/guideStore';

export default function HomeScreen() {
  return (
    <div className="screen fs-home">
      <BackButton
        className="fs-home__exit"
        label={TEXT.allGames}
        onClick={() => platformActions.exitToHub()}
      />

      <h1 className="fs-logo" aria-label={`${TEXT.titleTop} ${TEXT.titleBottom}`}>
        <span className="fs-logo__live" aria-hidden="true">
          ● LIVE
        </span>
        <span className="fs-logo__top" aria-hidden="true">
          {TEXT.titleTop}
        </span>
        <span className="fs-logo__bottom" aria-hidden="true">
          {TEXT.titleBottom}
        </span>
      </h1>

      <Button
        color="pink"
        size="lg"
        className="fs-home__play"
        sfx={SFX.UI_START}
        onClick={() => foodStreamActions.openSetup()}
      >
        <Icon name="play" size={26} /> {TEXT.play}
      </Button>

      <AudioToggles />
      <button type="button" className="guide-link" onClick={() => openGuide()}>
        ? {TEXT.guide}
      </button>
    </div>
  );
}
