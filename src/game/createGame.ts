/**
 * Tạo instance Phaser.Game. Được gọi từ React (<PhaserGame />).
 */
import Phaser from 'phaser';
import { GameBridge } from '@/game/bridge';
import { GAME_WIDTH, THEME, computeGameHeight } from '@/game/config/gameConfig';
import BootScene from '@/game/scenes/BootScene';
import GameOverScene from '@/game/scenes/GameOverScene';
import GameScene from '@/game/scenes/GameScene';
import MenuScene from '@/game/scenes/MenuScene';
import PauseScene from '@/game/scenes/PauseScene';
import PreloadScene from '@/game/scenes/PreloadScene';

export function createGame(parent: HTMLElement): Phaser.Game {
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    width: GAME_WIDTH,
    height: computeGameHeight(),
    backgroundColor: THEME.backgroundColor,
    pixelArt: true,
    roundPixels: true,
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
    },
    physics: {
      default: 'arcade',
      arcade: { gravity: { x: 0, y: 0 }, debug: false },
    },
    input: { activePointers: 2 },
    scene: [BootScene, PreloadScene, MenuScene, GameScene, PauseScene, GameOverScene],
  });

  // Overlay React đang mở -> khoá input của game (tránh phím Enter bấm PLAY ngầm)
  const applyOverlay = (open: boolean) => {
    game.input.enabled = !open;
    if (game.input.keyboard) game.input.keyboard.enabled = !open;
  };
  const offOverlay = GameBridge.on('overlay-changed', ({ open }) => applyOverlay(open));
  game.events.once(Phaser.Core.Events.DESTROY, offOverlay);

  // Báo cho React biết scene nào vừa sẵn sàng
  game.events.once(Phaser.Core.Events.READY, () => {
    applyOverlay(GameBridge.isOverlayOpen);
    game.scene.getScenes(false).forEach((scene) => {
      scene.events.on(Phaser.Scenes.Events.CREATE, () => {
        GameBridge.emit('scene-ready', { key: scene.scene.key, scene });
      });
    });
  });

  // Chỉ ở dev: truy cập game từ DevTools để debug (window.__GAME__)
  if (import.meta.env.DEV) (window as unknown as { __GAME__: Phaser.Game }).__GAME__ = game;

  return game;
}
