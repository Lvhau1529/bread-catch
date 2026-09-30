/** 75000 -> "01:15" */
export function formatTime(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const minutes = Math.floor(total / 60);
  const seconds = total % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

/** 0.8 -> "80%" */
export function formatPercent(ratio: number): string {
  return `${Math.round(ratio * 100)}%`;
}
