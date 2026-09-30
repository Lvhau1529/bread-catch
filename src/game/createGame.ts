/**
 * Tạo instance Phaser.Game. Được gọi từ React (<PhaserGame />).
 */
import Phaser from 'phaser';
import { GameBridge } from '@/game/bridge';
import { RENDER_SCALE, THEME, computeGameSize } from '@/game/config/gameConfig';
import { getGameAudio } from '@/game/core/services';
import { startSceneDirector } from '@/game/SceneDirector';
import BootScene from '@/game/scenes/BootScene';
import GameScene from '@/game/scenes/GameScene';
import GiftScene from '@/game/scenes/GiftScene';
import PauseScene from '@/game/scenes/PauseScene';
import PreloadScene from '@/game/scenes/PreloadScene';
import ShellScene from '@/game/scenes/ShellScene';
import TurnCompleteScene from '@/game/scenes/TurnCompleteScene';
import TurnPickerScene from '@/game/scenes/TurnPickerScene';
import { appStore, sessionActions } from '@/session/sessionStore';

export function createGame(parent: HTMLElement): Phaser.Game {
  const size = computeGameSize();
  const game = new Phaser.Game({
    type: Phaser.AUTO,
    parent,
    // Canvas lớn gấp RENDER_SCALE lần toạ độ logic (xem core/view.ts)
    width: size.width * RENDER_SCALE,
    height: size.height * RENDER_SCALE,
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
    // Thứ tự = thứ tự vẽ: overlay (Pause, Turn Complete) nằm trên GameScene
    scene: [
      BootScene,
      PreloadScene,
      ShellScene,
      TurnPickerScene,
      GameScene,
      GiftScene,
      TurnCompleteScene,
      PauseScene,
    ],
  });

  startSceneDirector(game);

  // Overlay React đang mở -> khoá input của game (tránh bàn phím / chạm xuyên xuống)
  const applyOverlay = (open: boolean) => {
    game.input.enabled = !open;
    if (game.input.keyboard) game.input.keyboard.enabled = !open;
  };
  const offOverlay = GameBridge.on('overlay-changed', ({ open }) => applyOverlay(open));
  const offSfx = GameBridge.on('play-sfx', ({ key }) => getGameAudio(game)?.playSfx(key));
  game.events.once(Phaser.Core.Events.DESTROY, () => {
    offOverlay();
    offSfx();
  });

  // Báo cho React biết scene nào vừa sẵn sàng
  game.events.once(Phaser.Core.Events.READY, () => {
    applyOverlay(GameBridge.isOverlayOpen);
    game.scene.getScenes(false).forEach((scene) => {
      scene.events.on(Phaser.Scenes.Events.CREATE, () => {
        GameBridge.emit('scene-ready', { key: scene.scene.key, scene });
      });
    });
  });

  // Chỉ ở dev: truy cập game + phiên chơi từ DevTools để debug
  if (import.meta.env.DEV)
    Object.assign(window, { __GAME__: game, __SESSION__: { appStore, sessionActions } });

  return game;
}
