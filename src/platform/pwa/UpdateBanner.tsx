/**
 * Nút "có bản mới" — chỉ hiện ở màn chọn game để không cắt ngang ván đang chơi.
 * Hiện lên thì kêu "ting" một lần. Mặc định nổi ở đỉnh màn hình; `className` để màn chứa đặt lại vị trí.
 */
import { useEffect } from 'react';
import clsx from 'clsx';
import { SFX } from '@/platform/audio/sfx';
import { playSfx } from '@/platform/audio/sfxPlayer';
import { useStore } from '@/platform/hooks/useStore';
import { applyUpdate, updateStore } from '@/platform/pwa/updateStore';
import Icon from '@/platform/ui/Icon';
import styles from '@/platform/pwa/UpdateBanner.module.scss';

export default function UpdateBanner({ className }: { className?: string }) {
  const ready = useStore(updateStore, (state) => state.ready);

  useEffect(() => {
    if (ready) playSfx(SFX.UPDATE_READY);
  }, [ready]);

  if (!ready) return null;

  return (
    <button
      type="button"
      className={clsx(styles.banner, className)}
      onClick={() => {
        playSfx(SFX.UI_CLICK);
        applyUpdate();
      }}
    >
      <Icon name="update" size={26} /> NEW VERSION! <b>UPDATE</b>
    </button>
  );
}
