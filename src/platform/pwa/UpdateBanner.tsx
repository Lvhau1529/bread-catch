/**
 * Nút "có bản mới" — chỉ hiện ở màn chọn game để không cắt ngang ván đang chơi.
 */
import { SFX } from '@/platform/audio/sfx';
import { playSfx } from '@/platform/audio/sfxPlayer';
import { useStore } from '@/platform/hooks/useStore';
import { applyUpdate, updateStore } from '@/platform/pwa/updateStore';

export default function UpdateBanner() {
  const ready = useStore(updateStore, (state) => state.ready);
  if (!ready) return null;

  return (
    <button
      type="button"
      className="update-banner"
      onClick={() => {
        playSfx(SFX.UI_CLICK);
        applyUpdate();
      }}
    >
      <span aria-hidden="true">✨</span> NEW VERSION! <b>UPDATE</b>
    </button>
  );
}
