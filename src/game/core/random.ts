/** Chọn một key theo trọng số: { a: 3, b: 1 } -> "a" với xác suất 75% */
export function pickWeighted<K extends string>(weights: Partial<Record<K, number>>): K {
  const entries = (Object.entries(weights) as [K, number][]).filter(([, w]) => w > 0);
  if (entries.length === 0) throw new Error('pickWeighted: no positive weights');

  const total = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * total;
  for (const [key, weight] of entries) {
    roll -= weight;
    if (roll < 0) return key;
  }
  return entries[entries.length - 1][0];
}
