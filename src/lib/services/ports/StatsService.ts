export interface Stats {
  played: number;
  won: number;
  lost: number;
  goalsFor: number;
  goalsAgainst: number;
  currentStreak: number;
  bestStreak: number;
  totalShots: number;
}

export interface StatsService {
  getStats(): Stats;
  recordMatch(won: boolean, goalsFor: number, goalsAgainst: number, shots: number): void;
  resetStats(): void;
}
