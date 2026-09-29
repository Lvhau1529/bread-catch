/**
 * App shell React: game Phaser + các lớp UI phủ bên ngoài.
 *
 * - TROLL MODE: mở đầu bằng "game làm bánh" giả (FakeBakeryIntro), game thật
 *   vẫn load ngầm bên dưới và bị khoá input cho tới khi màn giả đóng lại.
 * - Giai đoạn mở rộng (shop, collection, settings...) thêm UI React ở đây,
 *   giao tiếp với game qua `GameBridge`.
 */
import { useEffect, useState } from 'react';
import PhaserGame from '@/app/PhaserGame';
import RotateHint from '@/app/RotateHint';
import FakeBakeryIntro from '@/app/prank/FakeBakeryIntro';
import { GameBridge } from '@/game/bridge';
import { loadSaveData } from '@/game/systems/SaveSystem';

export default function App() {
  const [showFakeIntro, setShowFakeIntro] = useState(() => loadSaveData().mode === 'troll');

  useEffect(() => {
    GameBridge.setOverlayOpen(showFakeIntro);
  }, [showFakeIntro]);

  return (
    <main className="app">
      <PhaserGame />
      {showFakeIntro && <FakeBakeryIntro onFinish={() => setShowFakeIntro(false)} />}
      <RotateHint />
    </main>
  );
}
