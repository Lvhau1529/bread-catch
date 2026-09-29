/**
 * Thông số chung của game: màn hình, theme, người chơi, luật chơi, timing.
 * Mọi "magic number" về gameplay nên nằm ở đây hoặc trong levels.ts / items.ts.
 */

// ---------------------------------------------------------------------------
// Viewport — mobile first, màn hình dọc
// Chiều rộng cố định 360; chiều cao co giãn theo tỉ lệ màn hình (640..800)
// để máy dài (19.5:9, 20:9) không bị viền đen trên/dưới.
// ---------------------------------------------------------------------------
export const GAME_WIDTH = 360;
export const GAME_MIN_HEIGHT = 640;
export const GAME_MAX_HEIGHT = 800;

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
  fontFamily: '"Pixelify Sans", monospace',
  backgroundColor: '#3b1a0b',
  /** Làm tối nhẹ background khi chơi để vật phẩm rơi nổi bật */
  gameplayBackgroundTint: 0xb0a090,
  colors: {
    cream: '#fff4dc',
    brown: '#5a2a12',
    darkBrown: '#3b1a0b',
    gold: '#ffd23f',
    pink: '#ff6f9c',
    red: '#ff4d5e',
    green: '#8fe36b',
    white: '#ffffff',
  },
} as const;

export const DEPTH = {
  BACKGROUND: 0,
  ITEMS: 10,
  /** Lớp tối của prank "tắt đèn": che vật phẩm nhưng không che rổ */
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
  /** Vùng hứng: dải mỏng ở miệng rổ (topRatio tính từ đỉnh sprite) */
  catchZone: { height: 20, topRatio: 0.36 },
  /** Trạng thái dính mốc (Moldy Bread) */
  slowed: { tint: 0x7fcf6a, wobbleAngle: 7 },
  /** Bị đóng băng (nhân vật brainrot): không di chuyển được */
  frozenTint: 0x9ecbff,
} as const;

// ---------------------------------------------------------------------------
// Luật chơi
// ---------------------------------------------------------------------------
export const RULES = {
  startLives: 3,
  maxLives: 3,
  /** Streak tối thiểu -> hệ số combo (xếp giảm dần) */
  combo: [
    { streak: 20, multiplier: 4 },
    { streak: 10, multiplier: 3 },
    { streak: 5, multiplier: 2 },
  ],
} as const;

export const SPAWN = {
  /** Khoảng cách tối thiểu tới mép màn hình */
  edgeMargin: 28,
  /** Vật phẩm mới không rơi quá gần vật phẩm trước (px) */
  minGapFromLast: 48,
  startY: -32,
  /** Tốc độ rơi dao động ±10% */
  speedVariance: 0.1,
  poolSize: 40,
} as const;

// ---------------------------------------------------------------------------
// Timing / game feel (ms)
// ---------------------------------------------------------------------------
export const TIMING = {
  basketSquash: 150,
  popup: 450,
  levelUp: 1400,
  /** Physics timeScale khi level up (>1 = chậm hơn) */
  levelUpSlowMotion: 3,
  backgroundFade: 600,
  gameOverDelay: 800,
} as const;
