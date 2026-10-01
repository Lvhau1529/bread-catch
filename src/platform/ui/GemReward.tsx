/**
 * "+N GEMS" ở màn kết quả của các game (kim cương vừa nhận sau ván — platform/gems/wallet.ts).
 * Phát tiếng nhặt kim cương khi hiện. Không nhận được viên nào thì không hiện gì.
 */
import { useEffect } from 'react';
import { SFX } from '@/platform/audio/sfx';
import { playSfx } from '@/platform/audio/sfxPlayer';
import Icon from '@/platform/ui/Icon';
import styles from '@/platform/ui/GemReward.module.scss';

export default function GemReward({ amount }: { amount: number }) {
  useEffect(() => {
    if (amount > 0) playSfx(SFX.GEM_COLLECT);
  }, [amount]);

  if (amount <= 0) return null;
  return (
    <p className={styles.reward} role="status">
      <Icon name="gem" size={38} className={styles.icon} />
      <b>+{amount}</b> {amount === 1 ? 'GEM' : 'GEMS'}
    </p>
  );
}
