import type { SettingsService } from '$lib/services/ports/SettingsService';
import type { StoragePort } from '$lib/services/ports/StoragePort';
import type { SoundPort } from '$lib/services/ports/SoundPort';
import { LocalStorageAdapter } from '$lib/services/adapters/local/LocalStorageAdapter';
import { LocalSettingsService } from '$lib/services/adapters/local/LocalSettingsService';
import { LocalSoundManager } from '$lib/services/adapters/local/LocalSoundManager';

let _storage: StoragePort | null = null;
let _settings: SettingsService | null = null;
let _sound: SoundPort | null = null;

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
  }
};
