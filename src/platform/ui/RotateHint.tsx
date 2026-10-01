/**
 * Nhắc xoay dọc màn hình khi chơi trên điện thoại nằm ngang.
 * Hiển thị bằng CSS media query (xem styles.css) nên không cần state.
 */
import { PIP } from '@/platform/ui/icons';

export default function RotateHint() {
  return (
    <div className="rotate-hint" role="alert">
      <img className="rotate-hint__icon" src={PIP.rotate} alt="" />
      <p>Rotate your device to play</p>
    </div>
  );
}
