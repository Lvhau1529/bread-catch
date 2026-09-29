import { useEffect, useState } from 'react';
import { KNEAD, type Recipe } from '@/app/prank/content';
import { playSfx } from '@/app/prank/sound';
import { SFX } from '@/game/config/assets';

interface KneadScreenProps {
  recipe: Recipe;
  onDone: () => void;
}

/** Mini-game nhào bột: chạm liên tục cho đủ số lần */
export default function KneadScreen({ recipe, onDone }: KneadScreenProps) {
  const [taps, setTaps] = useState(0);
  const done = taps >= KNEAD.tapsNeeded;

  useEffect(() => {
    if (!done) return undefined;
    const timer = window.setTimeout(onDone, 600);
    return () => window.clearTimeout(timer);
  }, [done, onDone]);

  const knead = () => {
    if (done) return;
    playSfx(SFX.BREAD_CATCH, 1 + taps * 0.04);
    setTaps((count) => count + 1);
  };

  const cheer = taps === 0 ? '' : KNEAD.cheers[(taps - 1) % KNEAD.cheers.length];

  return (
    <section className="fb-screen fb-center">
      <p className="fb-step">{KNEAD.step}</p>
      <h2 className="fb-title">{recipe.name}</h2>
      <p className="fb-subtitle">{KNEAD.hint}</p>

      {/* key đổi mỗi lần chạm để chạy lại animation "bóp bột" */}
      <button
        key={taps}
        type="button"
        className={`fb-dough ${taps > 0 ? 'is-squish' : ''} ${done ? 'is-done' : ''}`}
        onClick={knead}
        aria-label="Nhào bột"
      >
        <span className="fb-dough__face">{done ? '😋' : '👆'}</span>
      </button>

      <p key={`cheer-${taps}`} className="fb-cheer">
        {cheer}
      </p>

      <div className="fb-progress" aria-hidden>
        <div className="fb-progress__fill" style={{ width: `${(taps / KNEAD.tapsNeeded) * 100}%` }} />
      </div>
    </section>
  );
}
