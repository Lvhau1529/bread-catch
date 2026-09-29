/**
 * Cầu nối React ↔ Phaser.
 *
 * Phaser phát event ra ngoài (vd: scene nào đang chạy) và React có thể gửi
 * lệnh vào game qua cùng một bus có kiểu. Khi mở rộng (shop, collection,
 * settings bằng React...) chỉ cần thêm event vào `BridgeEventMap`.
 */
import Phaser from 'phaser';

export interface BridgeEventMap {
  /** Một scene vừa chạy xong create() */
  'scene-ready': { key: string; scene: Phaser.Scene };
  /** React đang phủ UI lên game (game cần tạm khoá input) */
  'overlay-changed': { open: boolean };
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
    overlayOpen = open;
    emitter.emit('overlay-changed', { open });
  },
};
