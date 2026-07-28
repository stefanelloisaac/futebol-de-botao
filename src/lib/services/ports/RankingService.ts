export interface RankingEntry {
  playerId: string;
  name: string;
  score: number;
  rank: number;
}

export interface RankingService {
  getRankings(): RankingEntry[];
  /** Update the local player's score in the rankings */
  updatePlayerScore(score: number): void;
}
