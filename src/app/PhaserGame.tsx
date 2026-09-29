/**
 * Mount Phaser vào một <div>. Game được tạo 1 lần và huỷ khi unmount
 * (an toàn với React StrictMode mount/unmount 2 lần ở dev).
 */
import { useEffect, useRef } from 'react';
import type Phaser from 'phaser';
import { GameBridge } from '@/game/bridge';
import { createGame } from '@/game/createGame';

interface PhaserGameProps {
  /** Nhận scene hiện tại (vd: để React hiển thị UI theo scene) */
  onSceneReady?: (scene: Phaser.Scene) => void;
}

export default function PhaserGame({ onSceneReady }: PhaserGameProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return undefined;

    // Tạo game ở tick sau: StrictMode mount → unmount → mount ngay lập tức,
    // lần mount đầu bị huỷ trước khi Phaser kịp boot (tránh lỗi WebGL/AudioContext).
    let game: Phaser.Game | null = null;
    const timer = window.setTimeout(() => {
      game = createGame(container);
    });
    return () => {
      window.clearTimeout(timer);
      game?.destroy(true);
    };
  }, []);

  useEffect(() => {
    if (!onSceneReady) return undefined;
    return GameBridge.on('scene-ready', ({ scene }) => onSceneReady(scene));
  }, [onSceneReady]);

  return <div ref={containerRef} className="phaser-container" />;
}
