/**
 * Nhắc xoay dọc màn hình khi chơi trên điện thoại nằm ngang.
 * Hiển thị bằng CSS media query (xem styles.css) nên không cần state.
 */
export default function RotateHint() {
  return (
    <div className="rotate-hint" role="alert">
      <div className="rotate-hint__icon">📱</div>
      <p>Rotate your device to play</p>
    </div>
  );
}
