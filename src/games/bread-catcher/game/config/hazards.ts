/**
 * Vật cản rơi cùng chữ cái — chỉ xuất hiện ở level HARD qua prank
 * (mưa trứng, bom của Bombardiro). Hứng phải thì rổ bị choáng,
 * KHÔNG tính là hứng sai chữ để không ảnh hưởng kết quả học.
 */
export type HazardId = 'egg_broken' | 'bomb';

export interface HazardDef {
  texture: string;
  /** Rổ đứng im trong ngần này ms */
  stunMs: number;
  label: string;
  /** Nổ khi hứng */
  explodes: boolean;
}

export const HAZARDS: Record<HazardId, HazardDef> = {
  egg_broken: { texture: 'egg_broken', stunMs: 700, label: 'SPLAT!', explodes: false },
  bomb: { texture: 'bomb', stunMs: 900, label: 'BOOM!', explodes: true },
};
