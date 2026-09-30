/**
 * Thông số chung của game: màn hình, theme, người chơi, spawn, timing.
 * Luật lớp học (level, thời gian, điểm...) nằm ở src/session/settings.ts.
 */

// ---------------------------------------------------------------------------
// Viewport — mobile first, màn hình dọc
// Toạ độ "logic" rộng 360; cao 640..800 tuỳ tỉ lệ máy.
// Canvas thật được render gấp RENDER_SCALE lần (camera zoom) để chữ cái / từ vựng
// hiển thị sắc nét, còn sprite pixel-art vẫn phóng to kiểu nearest-neighbor.
// ---------------------------------------------------------------------------
export const GAME_WIDTH = 360;
export const GAME_MIN_HEIGHT = 640;
export const GAME_MAX_HEIGHT = 800;
export const RENDER_SCALE = 2;

export function computeGameHeight(): number {
  const { innerWidth, innerHeight } = window;
  // Viewport chưa có kích thước (tab ẩn, iframe chưa layout...) -> dùng mặc định
  if (!innerWidth || !innerHeight) return GAME_MIN_HEIGHT;

  const height = Math.round((GAME_WIDTH * innerHeight) / innerWidth);
  return Math.min(GAME_MAX_HEIGHT, Math.max(GAME_MIN_HEIGHT, height));
}

// ---------------------------------------------------------------------------
// Theme
// ---------------------------------------------------------------------------
export const THEME = {
  fonts: {
    /** Chữ giao diện: tròn, thân thiện */
    ui: '"Baloo 2", "Arial Rounded MT Bold", sans-serif',
    /** Chữ học (chữ cái, từ vựng): Andika — font dành cho trẻ tập đọc (plan §34) */
    learning: 'Andika, "Comic Sans MS", sans-serif',
  },
  backgroundColor: '#3b1a0b',
  /** Làm tối nhẹ background khi chơi để chữ rơi nổi bật */
  gameplayBackgroundTint: 0xb8a898,
  colors: {
    cream: '#fff4dc',
    brown: '#5a2a12',
    darkBrown: '#3b1a0b',
    gold: '#ffd23f',
    pink: '#ff6f9c',
    red: '#ff4d5e',
    green: '#5ccf4a',
    blue: '#3f8cff',
    orange: '#ff9f1c',
    white: '#ffffff',
  },
  /** Màu chữ đã điền vào ô (xoay vòng như concept board) */
  letterColors: ['#3f8cff', '#2fb34a', '#ff6f3c', '#a35cff', '#ff4d8d', '#00a6a6', '#e0a100'],
} as const;

export const DEPTH = {
  BACKGROUND: 0,
  ITEMS: 10,
  /** Lớp tối của prank "tắt đèn": che chữ rơi nhưng không che rổ */
  DARKNESS: 15,
  BASKET: 20,
  FX: 30,
  HUD: 50,
  BANNER: 60,
  OVERLAY: 100,
} as const;

// ---------------------------------------------------------------------------
// Player (basket)
// ---------------------------------------------------------------------------
export const PLAYER = {
  /** Khoảng cách từ đáy rổ tới đáy màn hình */
  bottomMargin: 20,
  /** Tốc độ khi dùng bàn phím (px/s) */
  keyboardSpeed: 380,
  /** Tốc độ tối đa khi bám theo ngón tay / chuột (px/s) */
  pointerMaxSpeed: 1600,
  /** Kéo tương đối trên mobile: 1px ngón tay = n px rổ */
  dragSensitivity: 1.3,
  /**
   * Vùng hứng: dải mỏng ở miệng rổ. Chiều rộng CỐ ĐỊNH cho mọi tier rổ
   * để các đội chơi trong điều kiện như nhau (tier chỉ là phần thưởng hình ảnh).
   */
  catchZone: { width: 78, height: 20, topRatio: 0.36 },
  /** Bị choáng / đóng băng: không di chuyển được */
  frozenTint: 0x9ecbff,
} as const;

// ---------------------------------------------------------------------------
// Chữ rơi (plan §10)
// ---------------------------------------------------------------------------
export const SPAWN = {
  /** Khoảng cách tối thiểu tới mép màn hình (bánh rộng ~70px) */
  edgeMargin: 40,
  /** Chữ mới không rơi quá gần chữ trước (px) */
  minGapFromLast: 64,
  /** Tốc độ rơi dao động ±8% */
  speedVariance: 0.08,
  poolSize: 30,
  /** Chữ cần hứng xuất hiện chậm nhất sau ngần này lượt rơi */
  maxWaitForExpected: 2,
  /** Xác suất rơi chữ cần hứng khi trên màn hình chưa có */
  expectedChanceWhenMissing: 0.6,
  /** ...và khi trên màn hình đã có */
  expectedChance: 0.25,
  /** Không để quá nhiều bản sao của chữ cần hứng trên màn hình */
  maxSameLetterOnScreen: 2,
  /** Xác suất chữ nhiễu là một chữ phía sau của từ (sẽ cần ngay sau đó) */
  upcomingChance: 0.5,
  /** Lượt rơi đầu tiên của mỗi từ đến nhanh hơn (tỉ lệ của spawnMs) */
  firstSpawnRatio: 0.35,
} as const;

// ---------------------------------------------------------------------------
// Timing / game feel (ms)
// ---------------------------------------------------------------------------
export const TIMING = {
  basketSquash: 150,
  popup: 500,
  backgroundFade: 600,
  /** Ăn mừng khi xong từ (plan §12: 900–1200ms) */
  wordComplete: 1150,
  /** Chuyển từ khi hứng sai (plan §13: ~700ms, thêm chút để kịp đọc chữ) */
  wordFailed: 1000,
  /** Hiện TIME'S UP! trước khi sang màn tổng kết lượt */
  timesUp: 1500,
} as const;
