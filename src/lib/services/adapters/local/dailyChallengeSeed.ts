/**
 * A simple seeded pseudo-random number generator (mulberry32 variant).
 * Deterministic — given the same seed, produces the same sequence.
 * No Math.imul dependency for broader compat.
 */
export function createSeededRandom(seed: number): () => number {
  let s = seed | 0;
  return () => {
    s = (s + 0x6d2b79f5) | 0;
    let t = s ^ (s >>> 15);
    t = Math.abs(t + ((t ^ (t >>> 7)) * 61)) | 0;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function seedFromDate(dateStr: string): number {
  let hash = 0;
  for (let i = 0; i < dateStr.length; i++) {
    const ch = dateStr.charCodeAt(i);
    hash = ((hash << 5) - hash) + ch;
    hash = hash & hash;
  }
  return Math.abs(hash);
}
