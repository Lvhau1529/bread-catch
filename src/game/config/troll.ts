/**
 * Chế độ chơi và toàn bộ thông số của TROLL MODE.
 *
 * - troll  (mặc định): không thể thua, trò đùa dồn dập để người chơi "tức điên".
 * - normal: gameplay thông thường theo plan.
 */
import type { ItemId } from '@/game/config/items';

export type GameMode = 'troll' | 'normal';

export const DEFAULT_MODE: GameMode = 'troll';

export const MODE_LABELS: Record<GameMode, string> = {
  troll: 'TROLL MODE',
  normal: 'NORMAL MODE',
};

// ---------------------------------------------------------------------------
// Luật riêng
// ---------------------------------------------------------------------------
export const TROLL_RULES = {
  /** Không thể thua: hết mạng thì hồi đầy và... chơi tiếp */
  canLose: false,
  reviveLines: ['NOT SO FAST!', 'NO ESCAPE!', 'AGAIN! :D', 'YOU CAN’T QUIT!', 'ONE MORE TIME!'],
};

// ---------------------------------------------------------------------------
// Prank toàn màn hình: lần lượt từng cái, hồi chiêu ngắn
// ---------------------------------------------------------------------------
export type PrankId =
  | 'reverse'
  | 'tinyBasket'
  | 'fakeLevelUp'
  | 'flip'
  | 'lightsOut'
  | 'fakeGameOver'
  | 'windy'
  | 'earthquake'
  | 'eggStorm'
  | 'scoreTax'
  | 'turbo'
  | 'tungSahur'
  | 'lirili'
  | 'tralalero'
  | 'bombardiro';

export const TROLL_PRANKS = {
  /** Vài giây đầu để người chơi tưởng đây là game bình thường */
  graceMs: 4000,
  cooldownMs: { min: 3000, max: 6000 },
  list: {
    /** Đảo ngược điều khiển */
    reverse: { weight: 3, duration: 4000, label: 'REVERSED!' },
    /** Rổ teo nhỏ (vùng hứng nhỏ theo) */
    tinyBasket: { weight: 3, duration: 4500, scale: 0.55, label: 'TINY BASKET!' },
    /** Banner LEVEL UP giả */
    fakeLevelUp: { weight: 2, revealDelay: 700, label: 'JUST KIDDING!' },
    /** Lộn ngược màn hình */
    flip: { weight: 2, duration: 3500, label: 'UPSIDE DOWN!' },
    /** Tắt đèn: vật phẩm gần như vô hình, chỉ còn thấy rổ */
    lightsOut: { weight: 2, duration: 3000, darkness: 0.9, label: 'LIGHTS OUT!' },
    /** Màn GAME OVER giả */
    fakeGameOver: { weight: 1, duration: 1400, label: 'GAME OVER', reveal: 'JUST KIDDING!' },
    /** Gió thổi rổ trôi về một phía */
    windy: { weight: 3, duration: 4000, speed: 150, label: 'WINDY!' },
    /** Động đất */
    earthquake: { weight: 2, duration: 2500, intensity: 0.012, label: 'EARTHQUAKE!' },
    /** Mưa trứng vỡ */
    eggStorm: { weight: 2, count: 5, item: 'egg_broken' as ItemId, label: 'EGG STORM!' },
    /** Thu thuế điểm */
    scoreTax: { weight: 2, ratio: 0.15, label: 'SCORE TAX!' },
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
    /** Lirili Larila đi ngang giữa màn hình: dừng thời gian (đóng băng rổ) và ăn vụng đồ rơi */
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
    /** Tralalero Tralala lao ngang giữa màn hình, đá văng mọi thứ đang rơi */
    tralalero: {
      weight: 3,
      speed: 300,
      /** Độ cao chạy (tỉ lệ chiều cao màn hình) */
      yRatio: 0.5,
      kickRadius: 42,
      kickSpeed: 280,
      kickGravity: 520,
      label: 'TRALALERO TRALALA!',
      kickLabel: 'KICK!',
    },
    /** Bombardiro Crocodilo bay ngang phía trên, thả bom: hứng bom mất mạng, bom rơi đất thì nổ */
    bombardiro: {
      weight: 3,
      speed: 110,
      /** Độ cao bay (px tính từ đỉnh màn hình, dưới HUD) */
      altitude: 180,
      bombs: 4,
      /** Bom rơi nhanh hơn đồ thường */
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
// Hành vi "láo" của từng vật phẩm rơi
// ---------------------------------------------------------------------------
export type ItemTrickId =
  'dodge' | 'zigzag' | 'sprint' | 'bait' | 'homing' | 'teleport' | 'bounce' | 'ghost' | 'disguise';

export const TROLL_ITEMS = {
  /** Xác suất một vật phẩm mới được gán trò (sau graceMs) */
  chance: 0.6,
  /** Trò cho vật phẩm tốt / xấu (trọng số) */
  goodTricks: { dodge: 4, bounce: 3, zigzag: 2, sprint: 2, bait: 2, teleport: 2, ghost: 2 } as Partial<
    Record<ItemTrickId, number>
  >,
  badTricks: { homing: 3, disguise: 3, zigzag: 1, sprint: 1 } as Partial<Record<ItemTrickId, number>>,

  /** Né rổ khi rơi tới gần */
  dodge: { triggerDistanceY: 110, dashSpeed: 320, dashMs: 250, label: 'HEHE' },
  /** Lắc lư qua lại */
  zigzag: { amplitude: 55, frequency: 2.4 },
  /** Đột ngột tăng tốc khi qua giữa màn hình */
  sprint: { triggerRatio: 0.45, multiplier: 2.2 },
  /** Đồ ngon hoá thành bánh cháy giữa đường */
  bait: { triggerRatio: 0.4, into: 'bread_burnt' as ItemId, label: 'SURPRISE!' },
  /** Đồ xấu bám theo rổ */
  homing: { maxSpeed: 90 },
  /** Biến mất rồi hiện ra chỗ khác */
  teleport: { triggerRatio: 0.5, minDistance: 110, label: 'POOF!' },
  /** Nảy khỏi miệng rổ một lần thay vì rơi vào */
  bounce: { launchSpeed: 330, sideSpeed: 120, gravity: 520, label: 'BOING!' },
  /** Mờ gần như vô hình (vẫn hứng được) */
  ghost: { triggerRatio: 0.3, alpha: 0.12, fadeMs: 300 },
  /** Đồ xấu giả dạng bánh mì ngon */
  disguise: { texture: 'bread_01', label: 'GOTCHA!' },
};
