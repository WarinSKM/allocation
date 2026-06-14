/**
 * Round-half-to-even (Banker's rounding) to `dp` decimal places.
 * Prevents accumulated bias when rounding monetary values at scale.
 */
export function bankersRound(value: number, dp = 2): number {
  const factor = 10 ** dp;
  const shifted = value * factor;
  const floor = Math.floor(shifted);
  const diff = shifted - floor;
  if (Math.abs(diff - 0.5) > Number.EPSILON) return Math.round(shifted) / factor;
  return (floor % 2 === 0 ? floor : floor + 1) / factor;
}
