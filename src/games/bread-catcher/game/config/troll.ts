/**
 * Thông số logic troll — chỉ bật ở level HARD (LEVELS.hard.troll).
 *
 * Giữ nguyên bộ trò của TROLL MODE cũ, chỉnh lại cho game ghép chữ:
 *   - Prank toàn màn hình + nhân vật brainrot phá game.
 *   - "Chữ láo": chữ cần hứng né rổ / nảy ra / đổi chữ; chữ nhiễu đuổi theo rổ / giả dạng.
 * Bỏ các trò đụng tới điểm (thu thuế điểm...) để kết quả giữa các đội vẫn công bằng.
 */

// ---------------------------------------------------------------------------
// Prank toàn màn hình: lần lượt từng cái, hồi chiêu ngắn
// ---------------------------------------------------------------------------
export type PrankId =
  | 'reverse'
  | 'tinyBasket'
  | 'fakeBonus'
  | 'flip'
  | 'lightsOut'
  | 'fakeTimesUp'
  | 'windy'
  | 'earthquake'
  | 'eggStorm'
  | 'turbo'
  | 'tungSahur'
  | 'lirili'
  | 'tralalero'
  | 'bombardiro';

export const TROLL_PRANKS = {
  /** Vài giây đầu để người chơi tưởng đây là level bình thường */
  graceMs: 4000,
  cooldownMs: { min: 3000, max: 6000 },
  list: {
    /** Đảo ngược điều khiển */
    reverse: { weight: 3, duration: 4000, label: 'REVERSED!' },
    /** Rổ teo nhỏ (vùng hứng nhỏ theo) */
    tinyBasket: { weight: 3, duration: 4500, scale: 0.55, label: 'TINY BASKET!' },
    /** Thông báo thưởng điểm giả */
    fakeBonus: { weight: 2, revealDelay: 800, label: '+500 BONUS!', reveal: 'JUST KIDDING!' },
    /** Lộn ngược màn hình */
    flip: { weight: 2, duration: 3500, label: 'UPSIDE DOWN!' },
    /** Tắt đèn: chữ rơi gần như vô hình, chỉ còn thấy rổ và ô từ */
    lightsOut: { weight: 2, duration: 3000, darkness: 0.9, label: 'LIGHTS OUT!' },
    /** Màn TIME'S UP giả */
    fakeTimesUp: { weight: 1, duration: 1400, label: "TIME'S UP!", reveal: 'JUST KIDDING!' },
    /** Gió thổi rổ trôi về một phía */
    windy: { weight: 3, duration: 4000, speed: 150, label: 'WINDY!' },
    /** Động đất */
    earthquake: { weight: 2, duration: 2500, intensity: 0.012, label: 'EARTHQUAKE!' },
    /** Mưa trứng vỡ (hứng phải: rổ choáng) */
    eggStorm: { weight: 2, count: 5, label: 'EGG STORM!' },
    /** Mọi thứ rơi nhanh gấp đôi (physics timeScale < 1 = nhanh hơn) */
    turbo: { weight: 2, duration: 3500, timeScale: 0.55, label: 'TURBO!' },

    // --- Nhân vật brainrot phá game ---
    /** Tung Tung Tung Sahur chạy dọc đáy màn hình, đập văng rổ và làm choáng */
    tungSahur: {
      weight: 3,
      speed: 190,
      hitRange: 36,
      knockback: 120,
      stunMs: 900,
      label: 'TUNG TUNG TUNG SAHUR!',
      hitLabel: 'BONK!',
    },
    /** Lirili Larila đi ngang giữa màn hình: dừng thời gian (đóng băng rổ) và ăn vụng chữ rơi */
    lirili: {
      weight: 3,
      speed: 85,
      freezeDelayMs: 500,
      freezeMs: 1800,
      eatRadius: 34,
      label: 'LIRILI LARILA!',
      freezeLabel: 'TIME STOP!',
      eatLabel: 'NOM!',
    },
    /** Tralalero Tralala lao ngang giữa màn hình, đá văng mọi chữ đang rơi */
    tralalero: {
      weight: 3,
      speed: 300,
      /** Độ cao chạy (tỉ lệ chiều cao màn hình) */
      yRatio: 0.55,
      kickRadius: 42,
      kickSpeed: 280,
      kickGravity: 520,
      label: 'TRALALERO TRALALA!',
      kickLabel: 'KICK!',
    },
    /** Bombardiro Crocodilo bay ngang, thả bom: hứng bom thì choáng, bom rơi đất thì nổ hất văng rổ */
    bombardiro: {
      weight: 3,
      speed: 110,
      /** Độ cao bay: cách đáy ô từ ngần này px */
      altitudeBelowHud: 34,
      bombs: 4,
      /** Bom rơi nhanh hơn chữ */
      bombSpeedScale: 1.4,
      /** Bom nổ dưới đất: rổ trong bán kính này bị hất văng */
      blastRadius: 90,
      knockback: 100,
      stunMs: 600,
      label: 'BOMBARDIRO CROCODILO!',
      blastLabel: 'BOOM!',
    },
  },
};

// ---------------------------------------------------------------------------
// Hành vi "láo" của từng chữ rơi
// ---------------------------------------------------------------------------
export type ItemTrickId =
  'dodge' | 'zigzag' | 'sprint' | 'swap' | 'homing' | 'teleport' | 'bounce' | 'ghost' | 'disguise';

export const TROLL_ITEMS = {
  /** Xác suất một chữ mới được gán trò (sau graceMs) */
  chance: 0.6,
  /** Trò cho chữ CẦN hứng / chữ nhiễu (trọng số) */
  expectedTricks: { dodge: 4, bounce: 3, zigzag: 2, sprint: 2, swap: 2, teleport: 2, ghost: 2 } as Partial<
    Record<ItemTrickId, number>
  >,
  distractorTricks: { homing: 3, disguise: 3, zigzag: 1, sprint: 1 } as Partial<Record<ItemTrickId, number>>,

  /** Né rổ khi rơi tới gần */
  dodge: { triggerDistanceY: 110, dashSpeed: 320, dashMs: 250, label: 'HEHE' },
  /** Lắc lư qua lại */
  zigzag: { amplitude: 55, frequency: 2.4 },
  /** Đột ngột tăng tốc khi qua giữa màn hình */
  sprint: { triggerRatio: 0.5, multiplier: 2.2 },
  /** Chữ cần hứng hoá thành chữ khác giữa đường */
  swap: { triggerRatio: 0.45, label: 'SURPRISE!' },
  /** Chữ nhiễu bám theo rổ */
  homing: { maxSpeed: 90 },
  /** Biến mất rồi hiện ra chỗ khác, xa rổ */
  teleport: { triggerRatio: 0.5, minDistance: 110, label: 'POOF!' },
  /** Nảy khỏi miệng rổ một lần thay vì rơi vào */
  bounce: { launchSpeed: 330, sideSpeed: 120, gravity: 520, label: 'BOING!' },
  /** Mờ gần như vô hình (vẫn hứng được) */
  ghost: { triggerRatio: 0.4, alpha: 0.15, fadeMs: 300 },
  /**
   * Chữ nhiễu giả dạng chữ cần hứng, lộ mặt thật khi rơi qua `revealRatio`
   * chiều cao màn hình — đủ sớm để người chơi tinh mắt còn kịp tránh.
   */
  disguise: { revealRatio: 0.55, label: 'GOTCHA!' },
};
