import type { DailyChallenge, DailyChallengeResult, DailyChallengeService } from '$lib/services/ports/DailyChallengeService';
import type { StoragePort } from '$lib/services/ports/StoragePort';
import { createSeededRandom, seedFromDate } from './dailyChallengeSeed';

const DAILY_KEY_PREFIX = 'fdb_daily_';

export class LocalDailyChallengeService implements DailyChallengeService {
  private storage: StoragePort;

  constructor(storage: StoragePort) {
    this.storage = storage;
  }

  private todayStr(): string {
    return new Date().toDateString();
  }

  private challengeKey(): string {
    return `${DAILY_KEY_PREFIX}${this.todayStr()}`;
  }

  private generateTodayConfig(): { seed: string; config: { targetGoals: number; difficulty: 'easy' | 'medium' | 'hard' } } {
    const dateStr = this.todayStr();
    const numericSeed = seedFromDate(dateStr);
    const rng = createSeededRandom(numericSeed);

    // Deterministic challenge: targetGoals between 3 and 5, always 'hard' difficulty
    const targetGoals = 3 + Math.floor(rng() * 3); // 3, 4, or 5
    return {
      seed: dateStr,
      config: { targetGoals, difficulty: 'hard' }
    };
  }

  getTodayChallenge(): DailyChallenge {
    const saved = this.storage.get<{ completed: boolean; bestResult: DailyChallengeResult | null }>(this.challengeKey());
    const { seed, config } = this.generateTodayConfig();

    return {
      date: this.todayStr(),
      seed,
      config,
      completed: saved?.completed ?? false,
      bestResult: saved?.bestResult ?? null
    };
  }

  submitResult(result: DailyChallengeResult): void {
    const challenge = this.getTodayChallenge();

    // Only update if the result is better (more goals scored) or first completion
    const isBetter = !challenge.bestResult ||
      result.scoreRed > challenge.bestResult.scoreRed ||
      (result.scoreRed === challenge.bestResult.scoreRed && result.scoreBlue < challenge.bestResult.scoreBlue);

    if (isBetter) {
      this.storage.set(this.challengeKey(), {
        completed: true,
        bestResult: result
      });
    }
  }

  isCompleted(): boolean {
    return this.getTodayChallenge().completed;
  }
}
