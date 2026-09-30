/**
 * Nút "có bản mới" — chỉ hiện ở màn Home để không cắt ngang ván đang chơi.
 */
import { applyUpdate, updateStore } from '@/app/pwa/updateStore';
import { useStore } from '@/app/hooks/useStore';
import { GameBridge } from '@/game/bridge';
import { SFX } from '@/game/config/assets';
import { UI_TEXT } from '@/session/text';

export default function UpdateBanner() {
  const ready = useStore(updateStore, (state) => state.ready);
  if (!ready) return null;

  return (
    <button
      type="button"
      className="update-banner"
      onClick={() => {
        GameBridge.playSfx(SFX.UI_CLICK);
        applyUpdate();
      }}
    >
      <span aria-hidden="true">✨</span> {UI_TEXT.newVersion} <b>{UI_TEXT.update}</b>
    </button>
  );
}
