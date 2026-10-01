/**
 * Nút "có bản mới" — chỉ hiện ở màn chọn game để không cắt ngang ván đang chơi.
 * Hiện lên thì kêu "ting" một lần.
 */
import { useEffect } from 'react';
import { SFX } from '@/platform/audio/sfx';
import { playSfx } from '@/platform/audio/sfxPlayer';
import { useStore } from '@/platform/hooks/useStore';
import { applyUpdate, updateStore } from '@/platform/pwa/updateStore';
import Icon from '@/platform/ui/Icon';

export default function UpdateBanner() {
  const ready = useStore(updateStore, (state) => state.ready);

  useEffect(() => {
    if (ready) playSfx(SFX.UPDATE_READY);
  }, [ready]);

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
      <Icon name="update" size={26} /> NEW VERSION! <b>UPDATE</b>
    </button>
  );
}
