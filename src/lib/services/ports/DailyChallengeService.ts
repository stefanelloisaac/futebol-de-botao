import type { MatchConfig } from '$lib/engine';

export interface DailyChallengeResult {
  scoreRed: number;
  scoreBlue: number;
}

export interface DailyChallenge {
  date: string;
  seed: string;
  config: MatchConfig;
  completed: boolean;
  bestResult: DailyChallengeResult | null;
}

export interface DailyChallengeService {
  getTodayChallenge(): DailyChallenge;
  submitResult(result: DailyChallengeResult): void;
  /** Check if the player beat the challenge (won the match) */
  isCompleted(): boolean;
}
