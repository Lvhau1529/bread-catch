/**
 * Cầu nối React ↔ Phaser cho những việc KHÔNG thuộc về trạng thái phiên chơi
 * (trạng thái phiên đi qua `appStore` trong src/session/sessionStore.ts).
 *
 * Khi mở rộng (shop, collection...) chỉ cần thêm event vào `BridgeEventMap`.
 */
import Phaser from 'phaser';
import type { SfxKey } from '@/game/config/assets';

export interface BridgeEventMap {
  /** Một scene vừa chạy xong create() */
  'scene-ready': { key: string; scene: Phaser.Scene };
  /** React đang phủ UI lên game (game cần tạm khoá input) */
  'overlay-changed': { open: boolean };
  /** React muốn phát SFX (nút bấm ở màn React) */
  'play-sfx': { key: SfxKey };
}

type BridgeEvent = keyof BridgeEventMap;
type Handler<K extends BridgeEvent> = (payload: BridgeEventMap[K]) => void;

const emitter = new Phaser.Events.EventEmitter();
let overlayOpen = false;

export const GameBridge = {
  emit<K extends BridgeEvent>(event: K, payload: BridgeEventMap[K]): void {
    emitter.emit(event, payload);
  },
  /** Trả về hàm huỷ đăng ký — tiện dùng trong useEffect */
  on<K extends BridgeEvent>(event: K, handler: Handler<K>): () => void {
    emitter.on(event, handler);
    return () => emitter.off(event, handler);
  },

  /** Overlay React có đang mở không (game có thể boot sau khi overlay đã mở) */
  get isOverlayOpen(): boolean {
    return overlayOpen;
  },
  setOverlayOpen(open: boolean): void {
    if (open === overlayOpen) return;
    overlayOpen = open;
    emitter.emit('overlay-changed', { open });
  },

  playSfx(key: SfxKey): void {
    emitter.emit('play-sfx', { key });
  },
};
