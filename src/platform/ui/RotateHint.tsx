/**
 * Nhắc xoay dọc màn hình khi chơi trên điện thoại nằm ngang.
 * Hiển thị bằng CSS media query (RotateHint.module.scss) nên không cần state.
 */
import { PIP } from '@/platform/ui/icons';
import styles from '@/platform/ui/RotateHint.module.scss';

export default function RotateHint() {
  return (
    <div className={styles.hint} role="alert">
      <img className={styles.icon} src={PIP.rotate} alt="" />
      <p>Rotate your device to play</p>
    </div>
  );
}
