/**
 * TROLL MODE: màn "game làm bánh" giả phủ lên trên game thật.
 *
 *   Trang chủ → Chọn món → Nhào bột → Nướng (kẹt 99%, mở lò bánh bay mất)
 *   → Lật mặt: đây là Bread Catcher → vào game
 *
 * Game Phaser vẫn load ngầm phía dưới nên khi lật mặt là chơi được ngay.
 */
import { useCallback, useState } from 'react';
import { RECIPES, type Recipe } from '@/app/prank/content';
import { playSfx } from '@/app/prank/sound';
import BakeScreen from '@/app/prank/screens/BakeScreen';
import HomeScreen from '@/app/prank/screens/HomeScreen';
import KneadScreen from '@/app/prank/screens/KneadScreen';
import RecipeScreen from '@/app/prank/screens/RecipeScreen';
import RevealScreen from '@/app/prank/screens/RevealScreen';
import { SFX } from '@/game/config/assets';
import '@/app/prank/fakeBakery.css';

type Step = 'home' | 'recipes' | 'knead' | 'bake' | 'reveal';

const EXIT_MS = 450;

interface FakeBakeryIntroProps {
  onFinish: () => void;
}

export default function FakeBakeryIntro({ onFinish }: FakeBakeryIntroProps) {
  const [step, setStep] = useState<Step>('home');
  const [recipe, setRecipe] = useState<Recipe>(RECIPES[0]);
  const [leaving, setLeaving] = useState(false);

  const goTo = useCallback((next: Step) => {
    playSfx(SFX.UI_CLICK);
    setStep(next);
  }, []);

  const toBake = useCallback(() => goTo('bake'), [goTo]);
  const toReveal = useCallback(() => setStep('reveal'), []);

  const finish = () => {
    setLeaving(true);
    window.setTimeout(onFinish, EXIT_MS);
  };

  const pickRecipe = (picked: Recipe) => {
    setRecipe(picked);
    goTo('knead');
  };

  return (
    <div className={`fake-bakery ${leaving ? 'is-leaving' : ''}`}>
      {/* key = step để mỗi màn có animation chuyển cảnh riêng */}
      <div key={step} className="fb-shell">
        {step === 'home' && <HomeScreen onStart={() => goTo('recipes')} />}
        {step === 'recipes' && <RecipeScreen onPick={pickRecipe} />}
        {step === 'knead' && <KneadScreen recipe={recipe} onDone={toBake} />}
        {step === 'bake' && <BakeScreen recipe={recipe} onDone={toReveal} />}
        {step === 'reveal' && <RevealScreen onPlay={finish} />}
      </div>
    </div>
  );
}
