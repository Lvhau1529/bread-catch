/**
 * App shell React: game Phaser + các màn UI phủ lên trên.
 *
 *   home / setup / results -> màn React (Phaser vẽ nền động phía sau, input game bị khoá)
 *   play / gift            -> chỉ còn game Phaser
 *
 * React và Phaser chỉ nói chuyện qua `appStore` (session/sessionStore.ts) và `GameBridge`.
 */
import { useEffect, type ComponentType } from 'react';
import PhaserGame from '@/app/PhaserGame';
import RotateHint from '@/app/RotateHint';
import { useAppState } from '@/app/hooks/useStore';
import HomeScreen from '@/app/screens/HomeScreen';
import ResultsScreen from '@/app/screens/ResultsScreen';
import SetupScreen from '@/app/screens/SetupScreen';
import { GameBridge } from '@/game/bridge';
import type { Screen } from '@/session/sessionStore';

const REACT_SCREENS: Partial<Record<Screen, ComponentType>> = {
  home: HomeScreen,
  setup: SetupScreen,
  results: ResultsScreen,
};

export default function App() {
  const screen = useAppState((state) => state.screen);
  const Overlay = REACT_SCREENS[screen];

  useEffect(() => {
    GameBridge.setOverlayOpen(Overlay !== undefined);
  }, [Overlay]);

  return (
    <main className="app">
      <PhaserGame />
      {Overlay && (
        <div className="screen-layer" key={screen}>
          <Overlay />
        </div>
      )}
      <RotateHint />
    </main>
  );
}
