import { useEffect, useState } from 'react';
import { BAKE, type BakePhase, type Recipe } from '@/app/prank/content';
import RunawayButton from '@/app/prank/RunawayButton';
import { playSfx } from '@/app/prank/sound';
import { SFX } from '@/game/config/assets';

interface BakeScreenProps {
  recipe: Recipe;
  onDone: () => void;
}

const easeOut = (t: number) => 1 - (1 - t) ** 2;

/** Chữ trạng thái luôn khớp với thanh nướng */
function statusLine(phase: BakePhase, progress: number, dodgeCount: number): string {
  if (phase === 'heating') {
    return [...BAKE.heatingLines].reverse().find((line) => progress >= line.from)?.text ?? '';
  }
  if (phase === 'stuck' && dodgeCount > 0) {
    return BAKE.dodgeLines[Math.min(dodgeCount, BAKE.dodgeLines.length) - 1];
  }
  return BAKE.phaseLines[phase];
}

/**
 * Nướng bánh: thanh chạy lên 100% → tụt xuống → bò lên lại rồi kẹt 99%.
 * Nút MỞ LÒ né vài lần, bấm trúng thì bánh bay mất.
 */
export default function BakeScreen({ recipe, onDone }: BakeScreenProps) {
  const [progress, setProgress] = useState(0);
  const [phase, setPhase] = useState<BakePhase>('heating');
  const [dodgeCount, setDodgeCount] = useState(0);

  // Chạy timeline của thanh nướng
  useEffect(() => {
    const start = performance.now();
    let frame = 0;

    const tick = (now: number) => {
      let elapsed = now - start;
      let from = 0;
      for (const segment of BAKE.timeline) {
        if (elapsed < segment.ms) {
          const value = from + (segment.to - from) * easeOut(elapsed / segment.ms);
          setProgress(Math.round(value));
          setPhase(segment.phase);
          frame = requestAnimationFrame(tick);
          return;
        }
        elapsed -= segment.ms;
        from = segment.to;
      }
      setProgress(from);
      setPhase('stuck');
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (phase !== 'opened') return undefined;
    const timer = window.setTimeout(onDone, 1400);
    return () => window.clearTimeout(timer);
  }, [phase, onDone]);

  const openOven = () => {
    playSfx(SFX.BAD_ITEM);
    setPhase('opened');
  };

  const isCold = phase === 'dropping' || phase === 'recovering';

  return (
    <section className="fb-screen fb-center">
      <p className="fb-step">{BAKE.step}</p>
      <h2 className="fb-title">{recipe.name}</h2>

      <div className={`fb-oven ${phase === 'opened' ? 'is-open' : ''} ${isCold ? 'is-cold' : ''}`}>
        <div className="fb-oven__window">
          <img
            className={`fb-oven__bread pixel ${phase === 'opened' ? 'is-flying' : ''}`}
            src={recipe.image}
            alt=""
          />
        </div>
        <div className="fb-oven__knobs">
          <span />
          <span />
          <span />
        </div>
      </div>

      <p className="fb-percent">{progress}%</p>
      <div className={`fb-progress ${isCold ? 'fb-progress--cold' : 'fb-progress--hot'}`} aria-hidden>
        <div className="fb-progress__fill" style={{ width: `${progress}%` }} />
      </div>
      <p key={`${phase}-${dodgeCount}`} className="fb-cheer">
        {statusLine(phase, progress, dodgeCount)}
      </p>

      {phase === 'stuck' && (
        <RunawayButton
          dodges={BAKE.dodges}
          onDodge={setDodgeCount}
          onClick={openOven}
          className="fb-cta fb-cta--small"
        >
          {BAKE.openButton}
        </RunawayButton>
      )}
    </section>
  );
}
