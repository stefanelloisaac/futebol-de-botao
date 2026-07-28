import type { Stats, StatsService } from '$lib/services/ports/StatsService';
import type { StoragePort } from '$lib/services/ports/StoragePort';

const STATS_KEY = 'fdb_stats';

function defaultStats(): Stats {
  return {
    played: 0,
    won: 0,
    lost: 0,
    goalsFor: 0,
    goalsAgainst: 0,
    currentStreak: 0,
    bestStreak: 0,
    totalShots: 0
  };
}

export class LocalStatsService implements StatsService {
  private storage: StoragePort;

  constructor(storage: StoragePort) {
    this.storage = storage;
  }

  getStats(): Stats {
    return this.storage.get<Stats>(STATS_KEY) ?? defaultStats();
  }

  recordMatch(won: boolean, goalsFor: number, goalsAgainst: number, shots: number): void {
    const stats = this.getStats();
    stats.played++;
    if (won) {
      stats.won++;
      stats.currentStreak++;
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
    } else {
      stats.lost++;
      stats.currentStreak = 0;
    }
    stats.goalsFor += goalsFor;
    stats.goalsAgainst += goalsAgainst;
    stats.totalShots += shots;
    this.storage.set(STATS_KEY, stats);
  }

  resetStats(): void {
    this.storage.set(STATS_KEY, defaultStats());
  }
}
