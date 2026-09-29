/**
 * Nút "chạy trốn": mỗi lần bị bấm thì nhảy sang chỗ khác trên màn hình,
 * né đủ `dodges` lần mới chịu gọi `onClick`.
 *
 * Né ngay ở pointerdown nên cú bấm luôn "trượt"; bấm bằng bàn phím cũng bị né.
 */
import { useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { playSfx } from '@/app/prank/sound';
import { SFX } from '@/game/config/assets';

/** Cách mép màn hình tối thiểu (px) */
const EDGE = 16;
/** Mỗi lần nhảy phải xa chỗ cũ ít nhất (px) */
const MIN_JUMP = 130;

interface RunawayButtonProps {
  dodges: number;
  onClick: () => void;
  /** Gọi sau mỗi lần né, `count` = số lần đã né */
  onDodge?: (count: number) => void;
  className?: string;
  children: ReactNode;
}

const randomBetween = (min: number, max: number) => Math.round(min + Math.random() * Math.max(0, max - min));

export default function RunawayButton({
  dodges,
  onClick,
  onDodge,
  className = '',
  children,
}: RunawayButtonProps) {
  const [dodged, setDodged] = useState(0);
  const [position, setPosition] = useState<{ left: number; top: number } | null>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  /** pointerdown đã xử lý (né) rồi thì bỏ qua click đi kèm */
  const skipClick = useRef(false);
  const canDodge = dodged < dodges;

  const dodge = () => {
    const rect = buttonRef.current?.getBoundingClientRect();
    if (!rect) return;

    const maxLeft = window.innerWidth - rect.width - EDGE;
    const maxTop = window.innerHeight - rect.height - EDGE;
    let next = { left: EDGE, top: EDGE };
    for (let tries = 0; tries < 12; tries += 1) {
      next = { left: randomBetween(EDGE, maxLeft), top: randomBetween(EDGE, maxTop) };
      if (Math.hypot(next.left - rect.left, next.top - rect.top) >= MIN_JUMP) break;
    }

    const count = dodged + 1;
    setPosition(next);
    setDodged(count);
    playSfx(SFX.UI_CANCEL);
    onDodge?.(count);
  };

  const handlePointerDown = (event: PointerEvent<HTMLButtonElement>) => {
    skipClick.current = canDodge;
    if (!canDodge) return;
    event.preventDefault();
    dodge();
  };

  const handleClick = () => {
    if (skipClick.current) {
      skipClick.current = false;
      return;
    }
    if (canDodge) dodge();
    else onClick();
  };

  return (
    // Giữ chỗ trong layout để nội dung không bị xô lệch khi nút "bay" đi
    <div className="fb-runaway-slot">
      <button
        key={dodged} // đổi key để chạy lại animation "bật" mỗi lần nhảy
        ref={buttonRef}
        type="button"
        className={`${className} ${position ? 'fb-runaway is-jumped' : 'fb-runaway'}`}
        style={position ? { position: 'fixed', left: position.left, top: position.top } : undefined}
        onPointerDown={handlePointerDown}
        onClick={handleClick}
      >
        {children}
      </button>
    </div>
  );
}
