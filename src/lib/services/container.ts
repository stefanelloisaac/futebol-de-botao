import type { SettingsService } from '$lib/services/ports/SettingsService';
import type { StoragePort } from '$lib/services/ports/StoragePort';
import type { SoundPort } from '$lib/services/ports/SoundPort';
import type { ProfileService } from '$lib/services/ports/ProfileService';
import type { StatsService } from '$lib/services/ports/StatsService';
import type { MatchHistoryService } from '$lib/services/ports/MatchHistoryService';
import type { RankingService } from '$lib/services/ports/RankingService';
import type { DailyChallengeService } from '$lib/services/ports/DailyChallengeService';
import { LocalStorageAdapter } from '$lib/services/adapters/local/LocalStorageAdapter';
import { LocalSettingsService } from '$lib/services/adapters/local/LocalSettingsService';
import { LocalSoundManager } from '$lib/services/adapters/local/LocalSoundManager';
import { LocalProfileService } from '$lib/services/adapters/local/LocalProfileService';
import { LocalStatsService } from '$lib/services/adapters/local/LocalStatsService';
import { LocalMatchHistoryService } from '$lib/services/adapters/local/LocalMatchHistoryService';
import { MockRankingService } from '$lib/services/adapters/local/MockRankingService';
import { LocalDailyChallengeService } from '$lib/services/adapters/local/LocalDailyChallengeService';

let _storage: StoragePort | null = null;
let _settings: SettingsService | null = null;
let _sound: SoundPort | null = null;
let _profile: ProfileService | null = null;
let _stats: StatsService | null = null;
let _history: MatchHistoryService | null = null;
let _ranking: RankingService | null = null;
let _daily: DailyChallengeService | null = null;

function ensureStorage(): StoragePort {
  if (!_storage) {
    _storage = new LocalStorageAdapter();
  }
  return _storage;
}

function ensureSound(): SoundPort {
  if (!_sound) {
    _sound = new LocalSoundManager();
  }
  return _sound;
}

export const container = {
  get settings(): SettingsService {
    if (!_settings) {
      _settings = new LocalSettingsService(ensureStorage());
    }
    return _settings;
  },
  get sound(): SoundPort {
    return ensureSound();
  },
  get profile(): ProfileService {
    if (!_profile) {
      _profile = new LocalProfileService(ensureStorage());
    }
    return _profile;
  },
  get stats(): StatsService {
    if (!_stats) {
      _stats = new LocalStatsService(ensureStorage());
    }
    return _stats;
  },
  get history(): MatchHistoryService {
    if (!_history) {
      _history = new LocalMatchHistoryService(ensureStorage());
    }
    return _history;
  },
  get ranking(): RankingService {
    if (!_ranking) {
      _ranking = new MockRankingService(ensureStorage());
    }
    return _ranking;
  },
  get daily(): DailyChallengeService {
    if (!_daily) {
      _daily = new LocalDailyChallengeService(ensureStorage());
    }
    return _daily;
  }
};
