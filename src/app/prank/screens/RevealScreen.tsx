import { useEffect } from 'react';
import { REVEAL } from '@/app/prank/content';
import { playSfx } from '@/app/prank/sound';
import { SFX } from '@/game/config/assets';

interface RevealScreenProps {
  onPlay: () => void;
}

/** Lật mặt: đây thật ra là Bread Catcher */
export default function RevealScreen({ onPlay }: RevealScreenProps) {
  useEffect(() => playSfx(SFX.STAR), []);

  const play = () => {
    playSfx(SFX.UI_CONFIRM);
    onPlay();
  };

  return (
    <section className="fb-screen fb-center fb-reveal">
      <img className="fb-reveal__basket pixel" src="assets/basket/basket_02.png" alt="" />
      <p className="fb-reveal__game">{REVEAL.gameName}</p>

      <button type="button" className="fb-cta" onClick={play}>
        {REVEAL.button}
      </button>
    </section>
  );
}
